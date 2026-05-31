import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import postgres from "https://deno.land/x/postgresjs@v3.4.5/mod.js";
import { Unzip, UnzipInflate } from "npm:fflate@0.8.2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const COLS = ["peorgnr","orgnr","name","juridisk_form","sni_code","sni_text","address","postnummer","postort","kommun","kommun_kod","lan","status","reg_date"];
// kept legal forms: aktiebolag (49), bank/insurance AB (41,42,93), public sector (81-84). Drops sole traders, estates, foundations, associations, foreign branches.
const DEFAULT_FORMS = ["49","41","42","93","81","82","83","84"];

function pickDelim(line: string): string {
  const cands = ["\t", ";", "|", ","];
  let best = "\t", n = -1;
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
  const v = (vRaw || "").trim();
  if (!v) return 0;
  const hasAlpha = /[a-zåäö]/i.test(v);
  const digits = v.replace(/\D/g, "");
  switch (target) {
    case "name": return (hasAlpha && !/^\d+$/.test(v) && v.length >= 2) ? 1 : 0;
    case "postort": return (hasAlpha && !/^\d/.test(v) && v.length >= 2 && v.length <= 40) ? 1 : 0;
    case "kommun": return (hasAlpha && v.length >= 2) ? 1 : 0;
    case "sni_text": return (hasAlpha && v.length >= 3) ? 1 : 0;
    case "sni_code": return (/^\d/.test(v) && digits.length >= 1 && digits.length <= 7) ? 1 : 0;
    case "peorgnr": return (/^\d{10,12}$/.test(digits)) ? 1 : 0;
    case "postnummer": return (/^\d{3}\s?\d{2}$/.test(v) || /^\d{5}$/.test(digits)) ? 1 : 0;
    case "juridisk_form": return 1;
    default: return 1;
  }
}

function resolveMapping(headers: string[], sampleRows: string[][]): Record<string, number> {
  const cands: Record<string, number[]> = {};
  headers.forEach((h, i) => { const t = colFor(h); if (t) (cands[t] = cands[t] || []).push(i); });
  const map: Record<string, number> = {};
  for (const t of Object.keys(cands)) {
    const idxs = cands[t];
    if (idxs.length === 1) { map[t] = idxs[0]; continue; }
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

function rowFromParts(parts: string[], map: Record<string, number>): any {
  const rec: any = {}; for (const c of COLS) rec[c] = null;
  for (const t of Object.keys(map)) { const v = (parts[map[t]] ?? "").trim(); if (v !== "") rec[t] = v; }
  if (rec.peorgnr) {
    const pe = String(rec.peorgnr);
    if (!rec.orgnr) rec.orgnr = pe.startsWith("16") ? pe.slice(2) : pe;
  }
  return rec;
}

async function grabHead(url: string, maxBytes = 196608): Promise<Uint8Array> {
  const res = await fetch(url, { headers: { "Accept": "application/zip,application/octet-stream,*/*" } });
  if (!res.ok || !res.body) throw new Error("download failed: HTTP " + res.status);
  const chunks: Uint8Array[] = []; let total = 0, enough = false;
  const unzipper = new Unzip(); unzipper.register(UnzipInflate);
  unzipper.onfile = (file) => { file.ondata = (_e, chunk) => { if (enough) return; if (chunk && chunk.length) { chunks.push(chunk); total += chunk.length; if (total >= maxBytes) enough = true; } }; file.start(); };
  const reader = res.body.getReader();
  while (!enough) { const { done, value } = await reader.read(); if (value && value.length) unzipper.push(value, false); if (done) { try { unzipper.push(new Uint8Array(0), true); } catch (_) {} break; } }
  try { await reader.cancel(); } catch (_) {}
  const out = new Uint8Array(total); let off = 0;
  for (const c of chunks) { if (off >= out.length) break; out.set(c.subarray(0, Math.min(c.length, out.length - off)), off); off += c.length; }
  return out;
}

function decodeBytes(bytes: Uint8Array): { text: string; encoding: string } {
  const utf = new TextDecoder("utf-8").decode(bytes);
  const reps = (utf.match(/�/g) || []).length;
  if (reps > 3) return { text: new TextDecoder("windows-1252").decode(bytes), encoding: "windows-1252" };
  return { text: utf, encoding: "utf-8" };
}

async function peek(url: string) {
  const bytes = await grabHead(url);
  const { text, encoding } = decodeBytes(bytes);
  const lines = text.split(/\r?\n/).filter((l) => l !== "");
  if (lines.length > 1) lines.pop();
  const headerLine = lines[0] || "";
  const delim = pickDelim(headerLine);
  const headers = headerLine.split(delim).map((h) => h.trim());
  const sampleRows = lines.slice(1, 80).map((l) => l.split(delim));
  const map = resolveMapping(headers, sampleRows);
  const resolved: Record<string, string> = {};
  for (const t of Object.keys(map)) resolved[t] = headers[map[t]];
  const sample = lines.slice(1, 5).map((l) => { const r = rowFromParts(l.split(delim), map); return { name: r.name, sni_code: r.sni_code, sni_text: r.sni_text, postort: r.postort, orgnr: r.orgnr || r.peorgnr }; });
  const hasOrg = "peorgnr" in map;
  const hasName = "name" in map;
  return { ok: true, mode: "peek", encoding, delimiter: delim === "\t" ? "TAB" : delim, rawHeaders: headers, resolved, mappedColumns: Object.keys(map), hasOrgnr: hasOrg, hasName, sample,
    note: (hasOrg && hasName) ? "Format looks good — org-number and name resolved. Safe to run the full load." : (hasOrg ? "Org-number found, but the name column couldn't be resolved confidently — check the sample below before loading." : "WARNING: no org-number column detected — column mapping needs adjustment before loading.") };
}

async function fullLoad(body: any) {
  const sql = postgres(Deno.env.get("SUPABASE_DB_URL")!, { prepare: false, max: 1 });
  let inserted = 0, seen = 0;
  try {
    const url = String(body.url || "").trim();
    const skip = Math.max(0, Number(body.skip) || 0);
    const truncate = !!body.truncate;
    const WINDOW = Number(body.window) || 50000; // kept rows inserted per call before clean return
    const KEEP = new Set(Array.isArray(body.forms) && body.forms.length ? body.forms.map(String) : DEFAULT_FORMS);
    if (truncate) {
      await sql`truncate public.se_registry`;
      await sql`update public.se_ingest_state set status='loading', url=${url}, rows_loaded=0, message='downloading', started_at=now(), updated_at=now() where id=1`;
    }
    const res = await fetch(url, { headers: { "Accept": "application/zip,application/octet-stream,*/*" } });
    if (!res.ok || !res.body) throw new Error("download failed: HTTP " + res.status);

    let headers: string[] | null = null;
    let delim = "\t";
    let decoder: TextDecoder | null = null;
    let map: Record<string, number> | null = null;
    let sampleBuf: string[] = [];
    let leftover = "";
    let batch: any[] = [];
    let stop = false;
    const deadline = Date.now() + 90000;
    let budgetHit = false, readerDone = false;
    const CHUNK = 4000; // 4000 * 14 = 56000 bind params, under 65534

    async function flush() {
      if (!batch.length) return;
      const rows = batch; batch = [];
      for (let i = 0; i < rows.length; i += CHUNK) {
        const part = rows.slice(i, i + CHUNK);
        await sql`insert into public.se_registry ${sql(part, ...COLS)} on conflict (peorgnr) do nothing`;
        inserted += part.length;
      }
    }
    function processData(line: string) {
      if (stop) return;
      seen++;
      if (seen <= skip) return;
      const rec = rowFromParts(line.split(delim), map!);
      if (!rec.peorgnr) return;
      if (KEEP.size && (!rec.juridisk_form || !KEEP.has(rec.juridisk_form))) return;
      batch.push(rec);
      if (inserted + batch.length >= WINDOW) stop = true;
    }
    function resolveNow() {
      map = resolveMapping(headers!, sampleBuf.map((l) => l.split(delim)));
      for (const l of sampleBuf) processData(l);
      sampleBuf = [];
    }
    function handleLine(line: string) {
      if (stop) return;
      if (line === "") return;
      if (headers === null) { delim = pickDelim(line); headers = line.split(delim).map((h) => h.trim()); return; }
      if (map === null) { sampleBuf.push(line); if (sampleBuf.length >= 80) resolveNow(); return; }
      processData(line);
    }

    const unzipper = new Unzip(); unzipper.register(UnzipInflate);
    unzipper.onfile = (file) => {
      file.ondata = (_err, chunk, final) => {
        if (stop) return;
        if (chunk && chunk.length) {
          if (!decoder) { const probe = new TextDecoder("utf-8").decode(chunk.subarray(0, Math.min(chunk.length, 4096))); decoder = new TextDecoder((probe.match(/�/g) || []).length > 1 ? "windows-1252" : "utf-8"); }
          leftover += decoder.decode(chunk, { stream: true });
          let nl: number;
          while ((nl = leftover.indexOf("\n")) >= 0) { let line = leftover.slice(0, nl); if (line.endsWith("\r")) line = line.slice(0, -1); leftover = leftover.slice(nl + 1); handleLine(line); if (stop) break; }
        }
        if (final && leftover && !stop) { handleLine(leftover); leftover = ""; }
      };
      file.start();
    };

    const reader = res.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (value && value.length) unzipper.push(value, false);
      if (done) { unzipper.push(new Uint8Array(0), true); readerDone = true; }
      if (batch.length >= CHUNK) await flush();
      if (done || stop) break;
      if (Date.now() > deadline) { budgetHit = true; break; }
    }
    if (map === null && headers !== null && sampleBuf.length) resolveNow();
    await flush();
    try { await reader.cancel(); } catch (_) {}
    const finished = readerDone && !stop && !budgetHit;
    const total = Number(((await sql`select count(*)::bigint as n from public.se_registry`)[0] as any).n) || 0;
    await sql`update public.se_ingest_state set status=${finished ? "done" : "loading"}, rows_loaded=${total}, message=${finished ? ("done — " + total + " companies") : (total + " loaded, continuing")}, updated_at=now() where id=1`;
    return { ok: true, inserted, seen, nextSkip: seen, total, done: finished };
  } catch (e) {
    const msg = String((e && (e as any).message) || e);
    try { await sql`update public.se_ingest_state set status='error', message=${msg.slice(0,300)}, updated_at=now() where id=1`; } catch (_) {}
    return { ok: false, error: msg, inserted };
  } finally {
    try { await sql.end({ timeout: 5 }); } catch (_) {}
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const body = await req.json().catch(() => ({}));
    const url = String(body.url || "").trim();
    if (!url) throw new Error("Missing 'url' (direct link to scb_bulkfil.zip)");
    if (!/^https?:\/\//.test(url)) throw new Error("url must be http(s)");
    const out = (body.mode === "peek") ? await peek(url) : await fullLoad(body);
    return new Response(JSON.stringify(out), { status: 200, headers: { ...CORS, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String((e && (e as any).message) || e) }), { status: 200, headers: { ...CORS, "Content-Type": "application/json" } });
  }
});
