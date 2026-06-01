// Build Alloy's brain: chunk the extracted AWS docs + push to kb-ingest (embeds via gte-small, free).
// Reads pre-extracted .txt (pdftotext) from temp, cleans AWS boilerplate, chunks by page, batches.
import fs from "node:fs";
const DIR = "C:/Users/jacob/AppData/Local/Temp/alloy_kb";
const BASE = "https://nvjizahtcqgmfhiodtej.supabase.co";
const ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52aml6YWh0Y3FnbWZoaW9kdGVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5ODk0NDMsImV4cCI6MjA5NTU2NTQ0M30.G0gf0z0wg9RQqsyZcEBXPYJ1YVeTe_NOULtDAEI2xEA";
const DOCS = [
  { id: "aws-dms", title: "AWS Database Migration Service (DMS)", kind: "aws-doc" },
  { id: "aws-sct", title: "AWS Schema Conversion Tool (SCT)", kind: "aws-doc" },
  { id: "aws-app2container-java", title: "App2Container — Containerize Java apps", kind: "aws-doc" },
  { id: "aws-modernization-assessing", title: "Modernization — Assessing Applications", kind: "aws-doc" },
  { id: "aws-app-portfolio-assessment", title: "Application Portfolio Assessment Guide", kind: "aws-doc" },
  { id: "aws-apa-strategy", title: "Strategy — Application Portfolio Assessment for Migration", kind: "aws-doc" },
  { id: "aws-data-strategy", title: "AWS Data Strategy", kind: "aws-doc" },
  { id: "aws-oca-framework", title: "Organizational Change Acceleration — Align Leaders", kind: "aws-doc" },
  { id: "aws-cloudformation", title: "AWS CloudFormation — User Guide", kind: "aws-doc" },
  { id: "aws-inspector", title: "Amazon Inspector — User Guide", kind: "aws-doc" },
  { id: "aws-payment-cryptography", title: "AWS Payment Cryptography — User Guide", kind: "aws-doc" },
];
const CHUNK = 1800, OVERLAP = 150, BATCH = 60, EMBED = false; // FTS-only bulk (in-runtime embed is CPU-capped ~6/call)
const dropLine = (l) => {
  const s = l.trim();
  if (!s) return true;
  if (/all rights reserved|amazon's trademarks|copyright ©|aﬃliates|affiliates/i.test(s)) return true;
  if (/^\d{1,4}$/.test(s)) return true;                 // bare page numbers
  if (/^(AWS [A-Za-z ]+|Seller Guide|User Guide|Developer Guide)$/i.test(s)) return true; // running headers
  if ((s.match(/\./g) || []).length > s.length * 0.4) return true; // TOC dot-leaders
  return false;
};
function clean(t) { return t.split("\n").filter((l) => !dropLine(l)).join(" ").replace(/\s{2,}/g, " ").trim(); }
function chunkDoc(text) {
  const pages = text.split("\f");
  const chunks = []; let idx = 0;
  pages.forEach((raw, pi) => {
    const c = clean(raw);
    if (c.length < 60) return;
    if (c.length <= CHUNK) { chunks.push({ idx: idx++, page: pi + 1, content: c }); return; }
    for (let p = 0; p < c.length; p += (CHUNK - OVERLAP)) chunks.push({ idx: idx++, page: pi + 1, content: c.slice(p, p + CHUNK) });
  });
  return chunks;
}
async function post(body) {
  const r = await fetch(BASE + "/functions/v1/kb-ingest", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + ANON, apikey: ANON }, signal: AbortSignal.timeout(120000), body: JSON.stringify(body) });
  return await r.json();
}
let grand = 0;
for (const d of DOCS) {
  const path = `${DIR}/${d.id}.txt`;
  if (!fs.existsSync(path)) { console.log(`SKIP ${d.id} (no txt)`); continue; }
  const text = fs.readFileSync(path, "utf8");
  const chunks = chunkDoc(text);
  console.log(`${d.id}: ${chunks.length} chunks`);
  let done = 0, emb = 0;
  for (let i = 0; i < chunks.length; i += BATCH) {
    const batch = chunks.slice(i, i + BATCH);
    let j; try { j = await post({ doc_id: d.id, title: d.title, source: d.id + ".pdf", kind: d.kind, replace: i === 0, embed: EMBED, chunks: batch }); }
    catch (e) { console.log(`  ${d.id} batch@${i} ERR ${String(e.message || e).slice(0, 50)}`); continue; }
    if (j.error || j.code) { console.log(`  ${d.id} batch@${i} err ${j.error || j.code}`); continue; }
    done += j.inserted || 0; emb += j.embedded || 0;
    process.stdout.write(`\r  ${d.id}: ${done}/${chunks.length} stored, ${emb} embedded`);
  }
  grand += done; console.log(`\n  ✓ ${d.id} done (${done} chunks)`);
}
fs.writeFileSync("_kb_out.json", JSON.stringify({ grand_chunks: grand, done: true }, null, 1));
console.log(`=== BRAIN BUILT === ${grand} chunks ingested across ${DOCS.length} docs`);
