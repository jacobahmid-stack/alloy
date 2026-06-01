// Drive domain-fill across the 1,195 Alto import leads — 5 concurrent shards (disjoint by orgnr
// last digit, so no row collisions). Hard-capped at $48 (Jacob's $50 guard). The edge fn self-selects;
// this just loops it until each shard is dry or the shared budget is hit. Free cloud-detect follows.
import fs from "node:fs";
const SRC = fs.readFileSync("src/forge.jsx", "utf8");
const BASE = "https://nvjizahtcqgmfhiodtej.supabase.co";
const ANON = (SRC.match(/anonKey:\s*\n?\s*"([^"]+)"/) || [])[1];
const SOURCE = "Bolagsverket/SCB (ICP import)";
const CAP = 48;
const SHARDS = [["0", "1"], ["2", "3"], ["4", "5"], ["6", "7"], ["8", "9"]];

let spent = 0, found = 0, processed = 0;
async function call(digits) {
  const r = await fetch(BASE + "/functions/v1/domain-fill", {
    method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + ANON, apikey: ANON },
    signal: AbortSignal.timeout(170000),
    body: JSON.stringify({ project_id: "alto", source: SOURCE, limit: 8, digits }),
  });
  return await r.json();
}
async function worker(digits, tag) {
  while (spent < CAP) {
    let j; try { j = await call(digits); } catch (e) { console.log(`shard ${tag} ERR ${String(e.message || e).slice(0, 40)}`); continue; }
    if (j.error) { console.log(`shard ${tag} err ${j.error}`); break; }
    spent += j.cost_usd || 0; found += j.found || 0; processed += j.processed || 0;
    console.log(`shard ${tag}: +${j.found}/${j.processed} (shard remaining ${j.remaining}) | total found ${found}, $${spent.toFixed(2)}`);
    if (!j.processed || j.done) break; // shard dry
    if (j.remaining === 0) break;
  }
}
console.log(`domain-fill: 5 shards, cap $${CAP}`);
await Promise.all(SHARDS.map((d, i) => worker(d, i)));
fs.writeFileSync("_domfill_out.json", JSON.stringify({ found, processed, spent: +spent.toFixed(4), done_flag: true }, null, 1));
console.log(`=== DONE === found ${found} domains across ${processed} scanned | spent $${spent.toFixed(2)}/$${CAP}`);
