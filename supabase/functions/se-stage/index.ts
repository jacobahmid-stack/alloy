import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import postgres from "https://deno.land/x/postgresjs@v3.4.5/mod.js";
import { Unzip, UnzipInflate } from "npm:fflate@0.8.2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const URL_ = Deno.env.get("SUPABASE_URL")!;
const SR = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const BUCKET = "registry";
const PREFIX = "scb/";
const PART_BYTES = 11_000_000; // ~11MB of text per part

function pickDelim(line: string): string {
  const cands = ["\t", ";", "|", ","]; let best = "\t", n = -1;
  for (const d of cands) { const c = line.split(d).length; if (c > n) { n = c; best = d; } }
  return best;
}
function colFor(h: string): string | null {
  const s = h.toLowerCase().replace(/[^a-z0-9åäö]/g, "");
  if (s.includes("peorgnr") || s === "orgnr" || s.includes("identitet")) return "peorgnr";
  if (s.includes("benamn") || s.includes("namn") || s.includes("firma")) return "name";
  if (s.includes("jurform") || (s.includes("jur") && s.includes("form")) || s.includes("juridiskform")) return "juridisk_form";
  if (s.includes("snikod") || s === "sni" || s.includes("naringsgren") || s.includes("ng1") || s.includes("sni2007")) return "sni_code";
  if (s.includes("snitext") || s.includes("naringsbenamn")) return "sni_text";
  if (s.includes("postnr") || s.includes("postnummer")) return "postnummer";
  if (s.includes("postort") || s === "ort") return "postort";
  if (s.includes("kommunkod")) return "kommun_kod";
  if (s.includes("kommun")) return "kommun";
  if (s === "lan" || s.includes("lanskod") || s.includes("lansbok")) return "lan";
  if (s.includes("adress") || s.includes("address") || s.includes("utdelningsadr") || s.includes("coadress")) return "address";
  if (s.includes("regdat") || s.includes("registrer")) return "reg_date";
  if (s.includes("status")) return "status";
  return null;
}
function fits(target: string, vRaw: string): number {
  const v = (vRaw || "").trim(); if (!v) return 0;
  const hasAlpha = /[a-zåäö]/i.test(v); const digits = v.replace(/\D/g, "");
  switch (target) {
    case "name": return (hasAlpha && !/^\d+$/.test(v) && v.length >= 2) ? 1 : 0;
    case "postort": return (hasAlpha && !/^\d/.test(v) && v.length >= 2 && v.length <= 40) ? 1 : 0;
    case "kommun": return (hasAlpha && v.length >= 2) ? 1 : 0;
    case "sni_text": return (hasAlpha && v.length >= 3) ? 1 : 0;
    case "sni_code": return (/^\d/.test(v) && digits.length >= 1 && digits.length <= 7) ? 1 : 0;
    case "peorgnr": return (/^\d{10,12}$/.test(digits)) ? 1 : 0;
    case "postnummer": return (/^\d{3}\s?\d{2}$/.test(v) || /^\d{5}$/.test(digits)) ? 1 : 0;
    case "juridisk_form": return 1; default: return 1;
  }
}
function resolveMapping(headers: string[], sampleRows: string[][]): Record<string, number> {
  const cands: Record<string, number[]> = {};
  headers.forEach((h, i) => { const t = colFor(h); if (t) (cands[t] = cands[t] || []).push(i); });
  const map: Record<string, number> = {};
  for (const t of Object.keys(cands)) {
    const idxs = cands[t]; if (idxs.length === 1) { map[t] = idxs[0]; continue; }
    let best = idxs[0], bestScore = -1, bestFill = -1;
    for (const idx of idxs) {
      let s = 0, fill = 0, n = 0;
      for (const row of sampleRows) { if (idx < row.length) { const val = (row[idx] || "").trim(); s += fits(t, val); if (val) fill++; n++; } }
      const score = n ? s / n : 0;
      if (score > bestScore + 0.001 || (Math.abs(score - bestScore) <= 0.001 && fill > bestFill)) { bestScore = score; bestFill = fill; best = idx; }
    }
    map[t] = best;
  }
  return map;
}
function pad(n: number) { return String(n).padStart(4, "0"); }

async function listParts(): Promise<string[]> {
  const res = await fetch(`${URL_}/storage/v1/object/list/${BUCKET}`, {
    method: "POST", headers: { Authorization: `Bearer ${SR}`, apikey: SR, "Content-Type": "application/json" },
    body: JSON.stringify({ prefix: PREFIX, limit: 1000 }),
  });
  if (!res.ok) return [];
  const arr = await res.json().catch(() => []);
  return Array.isArray(arr) ? arr.map((o: any) => PREFIX + o.name) : [];
}
async function removeParts(paths: string[]) {
  if (!paths.length) return;
  await fetch(`${URL_}/storage/v1/object/${BUCKET}`, {
    method: "DELETE", headers: { Authorization: `Bearer ${SR}`, apikey: SR, "Content-Type": "application/json" },
    body: JSON.stringify({ prefixes: paths }),
  });
}
async function putPart(idx: number, text: string) {
  const res = await fetch(`${URL_}/storage/v1/object/${BUCKET}/${PREFIX}part-${pad(idx)}.txt`, {
    method: "POST", headers: { Authorization: `Bearer ${SR}`, apikey: SR, "Content-Type": "text/plain", "x-upsert": "true" },
    body: text,
  });
  if (!res.ok) throw new Error("storage put part " + idx + ": " + res.status + " " + (await res.text()).slice(0, 200));
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  const sql = postgres(Deno.env.get("SUPABASE_DB_URL")!, { prepare: false, max: 1 });
  try {
    const body = await req.json().catch(() => ({}));
    const url = String(body.url || "").trim();
    if (!/^https?:\/\//.test(url)) throw new Error("url must be http(s)");

    await removeParts(await listParts());
    await sql`update public.se_ingest_state set status='staging', stage_status='staging', stage_parts=0, url=${url}, message='downloading + decompressing to storage', started_at=now(), updated_at=now() where id=1`;

    const res = await fetch(url, { headers: { "Accept": "application/zip,application/octet-stream,*/*" } });
    if (!res.ok || !res.body) throw new Error("download failed: HTTP " + res.status);

    let headerCols: string[] | null = null;
    let delim = "\t";
    let decoder: TextDecoder | null = null;
    let encoding = "utf-8";
    let leftover = "";
    let buf = "";
    let partIdx = 0;
    const sampleRows: string[][] = [];
    const deadline = Date.now() + 130000;
    let budgetHit = false, readerDone = false;
    const pending: string[] = []; // parts queued to upload (flushed in async loop)

    function onLine(line: string) {
      if (line === "") return;
      if (headerCols === null) { delim = pickDelim(line); headerCols = line.split(delim).map((h) => h.trim()); return; }
      if (sampleRows.length < 80) sampleRows.push(line.split(delim));
      buf += line + "\n";
      if (buf.length >= PART_BYTES) { pending.push(buf); buf = ""; }
    }

    const unzipper = new Unzip(); unzipper.register(UnzipInflate);
    unzipper.onfile = (file) => {
      file.ondata = (_e, chunk, final) => {
        if (chunk && chunk.length) {
          if (!decoder) { const probe = new TextDecoder("utf-8").decode(chunk.subarray(0, Math.min(chunk.length, 4096))); encoding = (probe.match(/�/g) || []).length > 1 ? "windows-1252" : "utf-8"; decoder = new TextDecoder(encoding); }
          leftover += decoder.decode(chunk, { stream: true });
          let nl: number;
          while ((nl = leftover.indexOf("\n")) >= 0) { let l = leftover.slice(0, nl); if (l.endsWith("\r")) l = l.slice(0, -1); leftover = leftover.slice(nl + 1); onLine(l); }
        }
        if (final && leftover) { onLine(leftover); leftover = ""; }
      };
      file.start();
    };

    const reader = res.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (value && value.length) unzipper.push(value, false);
      if (done) { unzipper.push(new Uint8Array(0), true); readerDone = true; }
      while (pending.length) { await putPart(partIdx++, pending.shift()!); }
      if (done) break;
      if (Date.now() > deadline) { budgetHit = true; break; }
    }
    if (readerDone && buf.length) { await putPart(partIdx++, buf); buf = ""; }
    try { await reader.cancel(); } catch (_) {}

    const map = headerCols ? resolveMapping(headerCols, sampleRows) : {};
    const finished = readerDone && !budgetHit;
    await sql`update public.se_ingest_state set status=${finished ? "staged" : "stage_error"}, stage_status=${finished ? "staged" : "incomplete"}, stage_parts=${partIdx}, map_json=${sql.json(map)}, delim=${delim}, encoding=${encoding}, message=${finished ? ("staged " + partIdx + " parts to storage") : ("stage incomplete after " + partIdx + " parts (compute limit)")}, updated_at=now() where id=1`;
    return new Response(JSON.stringify({ ok: true, mode: "stage", parts: partIdx, done: finished, map, delim, encoding }), { status: 200, headers: { ...CORS, "Content-Type": "application/json" } });
  } catch (e) {
    const msg = String((e && (e as any).message) || e);
    try { await sql`update public.se_ingest_state set status='error', stage_status='error', message=${msg.slice(0, 300)}, updated_at=now() where id=1`; } catch (_) {}
    return new Response(JSON.stringify({ ok: false, error: msg }), { status: 200, headers: { ...CORS, "Content-Type": "application/json" } });
  } finally {
    try { await sql.end({ timeout: 5 }); } catch (_) {}
  }
});
