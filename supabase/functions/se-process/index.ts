import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import postgres from "https://deno.land/x/postgresjs@v3.4.5/mod.js";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const URL_ = Deno.env.get("SUPABASE_URL")!;
const SR = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const BUCKET = "registry";
const PREFIX = "scb/";
const COLS = ["peorgnr","orgnr","name","juridisk_form","sni_code","sni_text","address","postnummer","postort","kommun","kommun_kod","lan","status","reg_date"];
const DEFAULT_FORMS = ["49","41","42","93","81","82","83","84"];
const CHUNK = 4000;

function pad(n: number) { return String(n).padStart(4, "0"); }
function rowFromParts(parts: string[], map: Record<string, number>): any {
  const rec: any = {}; for (const c of COLS) rec[c] = null;
  for (const t of Object.keys(map)) { const v = (parts[map[t]] ?? "").trim(); if (v !== "") rec[t] = v; }
  if (rec.peorgnr) { const pe = String(rec.peorgnr); if (!rec.orgnr) rec.orgnr = pe.startsWith("16") ? pe.slice(2) : pe; }
  return rec;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  const sql = postgres(Deno.env.get("SUPABASE_DB_URL")!, { prepare: false, max: 1 });
  try {
    const body = await req.json().catch(() => ({}));
    const part = Math.max(0, Number(body.part) || 0);
    const keepForms = new Set(Array.isArray(body.forms) && body.forms.length ? body.forms.map(String) : DEFAULT_FORMS);
    const sniPrefixes: string[] = Array.isArray(body.sni) ? body.sni.map((s: any) => String(s).trim()).filter(Boolean) : [];
    const orts: string[] = Array.isArray(body.ort) ? body.ort.map((s: any) => String(s).trim().toLowerCase()).filter(Boolean) : [];

    const st = (await sql`select stage_parts, map_json, delim from public.se_ingest_state where id=1`)[0] as any;
    if (!st || !st.map_json) throw new Error("no staged mapping found — run stage first");
    const map = st.map_json as Record<string, number>;
    const delim = st.delim || "\t";
    const totalParts = Number(st.stage_parts) || 0;
    if (part === 0 && body.truncate) await sql`truncate public.se_registry`;

    // download the part text from storage
    const res = await fetch(`${URL_}/storage/v1/object/${BUCKET}/${PREFIX}part-${pad(part)}.txt`, { headers: { Authorization: `Bearer ${SR}`, apikey: SR } });
    if (!res.ok) throw new Error("storage get part " + part + ": " + res.status);
    const text = await res.text();

    let inserted = 0, scanned = 0;
    let batch: any[] = [];
    async function flush() {
      if (!batch.length) return; const rows = batch; batch = [];
      for (let i = 0; i < rows.length; i += CHUNK) {
        const p = rows.slice(i, i + CHUNK);
        await sql`insert into public.se_registry ${sql(p, ...COLS)} on conflict (peorgnr) do nothing`;
        inserted += p.length;
      }
    }
    for (const line of text.split("\n")) {
      if (!line) continue; scanned++;
      const rec = rowFromParts(line.split(delim), map);
      if (!rec.peorgnr) continue;
      if (keepForms.size && (!rec.juridisk_form || !keepForms.has(rec.juridisk_form))) continue;
      if (sniPrefixes.length && !(rec.sni_code && sniPrefixes.some((p) => String(rec.sni_code).startsWith(p)))) continue;
      if (orts.length && !(rec.postort && orts.some((o) => String(rec.postort).toLowerCase().includes(o)))) continue;
      batch.push(rec);
      if (batch.length >= CHUNK) await flush();
    }
    await flush();

    // free storage: drop the processed part
    try { await fetch(`${URL_}/storage/v1/object/${BUCKET}`, { method: "DELETE", headers: { Authorization: `Bearer ${SR}`, apikey: SR, "Content-Type": "application/json" }, body: JSON.stringify({ prefixes: [`${PREFIX}part-${pad(part)}.txt`] }) }); } catch (_) {}

    const nextPart = part + 1;
    const done = nextPart >= totalParts;
    const total = Number(((await sql`select count(*)::bigint as n from public.se_registry`)[0] as any).n) || 0;
    await sql`update public.se_ingest_state set status=${done ? "done" : "processing"}, rows_loaded=${total}, message=${done ? ("done — " + total + " companies") : ("part " + nextPart + "/" + totalParts + " — " + total + " loaded")}, updated_at=now() where id=1`;
    return new Response(JSON.stringify({ ok: true, mode: "process", part, nextPart, totalParts, scanned, inserted, total, done }), { status: 200, headers: { ...CORS, "Content-Type": "application/json" } });
  } catch (e) {
    const msg = String((e && (e as any).message) || e);
    return new Response(JSON.stringify({ ok: false, error: msg }), { status: 200, headers: { ...CORS, "Content-Type": "application/json" } });
  } finally {
    try { await sql.end({ timeout: 5 }); } catch (_) {}
  }
});
