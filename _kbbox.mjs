// Embed the BOX 2026 partner deck (small, funding-critical) — semantic, small batches.
import fs from "node:fs";
const BASE = "https://nvjizahtcqgmfhiodtej.supabase.co";
const ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52aml6YWh0Y3FnbWZoaW9kdGVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5ODk0NDMsImV4cCI6MjA5NTU2NTQ0M30.G0gf0z0wg9RQqsyZcEBXPYJ1YVeTe_NOULtDAEI2xEA";
const text = fs.readFileSync("C:/Users/jacob/AppData/Local/Temp/alloy_kb/aws-box-deck.txt", "utf8");
const pages = text.split("\f");
const chunks = []; let idx = 0;
for (let pi = 0; pi < pages.length; pi++) {
  const c = pages[pi].split("\n").map((l) => l.trim()).filter(Boolean).join(" ").replace(/\s{2,}/g, " ").trim();
  if (c.length < 40) continue;
  for (let p = 0; p < c.length; p += 1200) chunks.push({ idx: idx++, page: pi + 1, content: c.slice(p, p + 1300) });
}
console.log(`box deck: ${chunks.length} chunks (embedded)`);
async function post(body) {
  const r = await fetch(BASE + "/functions/v1/kb-ingest", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + ANON, apikey: ANON }, signal: AbortSignal.timeout(90000), body: JSON.stringify(body) });
  return await r.json();
}
let emb = 0;
for (let i = 0; i < chunks.length; i += 4) {
  const j = await post({ doc_id: "aws-box-deck", title: "AWS BOX 2026 — Partner Deck", source: "BOX_Deck_2026_Partners.pdf", kind: "playbook", embed: true, replace: i === 0, chunks: chunks.slice(i, i + 4) });
  if (j.error || j.code) { console.log(`batch@${i} ERR ${j.error || j.code}`); continue; }
  emb += j.embedded || 0; console.log(`  ${Math.min(i + 4, chunks.length)}/${chunks.length}, ${emb} embedded`);
}
console.log(`=== box deck embedded: ${emb} ===`);
