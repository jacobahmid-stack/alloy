// Ingest the Smith Playbook EMBEDDED (semantic) — small batches (in-runtime embed caps ~6/call).
import fs from "node:fs";
const BASE = "https://nvjizahtcqgmfhiodtej.supabase.co";
const ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52aml6YWh0Y3FnbWZoaW9kdGVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5ODk0NDMsImV4cCI6MjA5NTU2NTQ0M30.G0gf0z0wg9RQqsyZcEBXPYJ1YVeTe_NOULtDAEI2xEA";
const text = fs.readFileSync("Alloy-Smith-Playbook.md", "utf8");
// chunk by paragraph, merge to ~1200 chars, keep section headings attached
const paras = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
const chunks = []; let buf = "";
for (const p of paras) {
  if ((buf + "\n\n" + p).length > 1300 && buf) { chunks.push(buf); buf = p; }
  else buf = buf ? buf + "\n\n" + p : p;
}
if (buf) chunks.push(buf);
const payload = chunks.map((c, i) => ({ idx: i, page: 1, content: c }));
console.log(`playbook: ${payload.length} chunks (embedded)`);
async function post(body) {
  const r = await fetch(BASE + "/functions/v1/kb-ingest", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + ANON, apikey: ANON }, signal: AbortSignal.timeout(90000), body: JSON.stringify(body) });
  return await r.json();
}
let emb = 0;
for (let i = 0; i < payload.length; i += 4) {
  const batch = payload.slice(i, i + 4);
  const j = await post({ doc_id: "smith-playbook", title: "Smith Playbook — AWS funding, plays & qualification", source: "Alloy-Smith-Playbook.md", kind: "playbook", embed: true, replace: i === 0, chunks: batch });
  if (j.error || j.code) { console.log(`batch@${i} ERR ${j.error || j.code}`); continue; }
  emb += j.embedded || 0;
  console.log(`  ${Math.min(i + 4, payload.length)}/${payload.length} stored, ${emb} embedded`);
}
console.log(`=== playbook embedded: ${emb} chunks ===`);
