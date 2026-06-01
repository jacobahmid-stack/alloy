// Size-gated ALTO property wave. Drives icp-screen v4 over se_registry's property operators
// (SNI 68201/68202/68204/68209/68320/68100 — owners & managers, NOT the tiny BRF co-ops or brokers).
// >=10 employees => imported as a lead WITH a domain; SPVs/unsizeable => archived. 2 shards (429-safe),
// HARD-CAPPED at $25 (Jacob's ceiling). icp-screen self-selects + dedupes, so re-running goes deeper.
const BASE = "https://nvjizahtcqgmfhiodtej.supabase.co";
const ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52aml6YWh0Y3FnbWZoaW9kdGVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5ODk0NDMsImV4cCI6MjA5NTU2NTQ0M30.G0gf0z0wg9RQqsyZcEBXPYJ1YVeTe_NOULtDAEI2xEA";
const CAP = 25, MIN_EMP = 10, LIMIT = 4;
const SNI = ["68201", "68202", "68204", "68209", "68320", "68100"];
const SOURCE = "Bolagsverket/SCB (Alto property)";
const LIST_TAG = "alto-property";
const SHARDS = [["0", "1", "2", "3", "4"], ["5", "6", "7", "8", "9"]];
import fs from "node:fs";

let spent = 0, imported = 0, archived = 0, processed = 0, failed = 0;
async function call(digit) {
  const r = await fetch(BASE + "/functions/v1/icp-screen", {
    method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + ANON, apikey: ANON },
    signal: AbortSignal.timeout(240000),
    body: JSON.stringify({ project_id: "alto", sni_codes: SNI, min_employees: MIN_EMP, source: SOURCE, list_tag: LIST_TAG, limit: LIMIT, digit }),
  });
  return await r.json();
}
async function worker(digits, tag) {
  const dry = new Set(); let di = 0;
  while (spent < CAP && dry.size < digits.length) {
    const digit = digits[di % digits.length]; di++;
    if (dry.has(digit)) continue;
    let j; try { j = await call(digit); } catch (e) { console.log(`shard ${tag} ERR ${String(e.message || e).slice(0, 40)}`); continue; }
    if (j.error) { console.log(`shard ${tag} err ${j.error}`); break; }
    spent += j.cost_usd || 0; imported += j.imported || 0; archived += j.archived || 0; processed += j.processed || 0; failed += j.failed || 0;
    console.log(`shard ${tag} d${digit}: +${j.imported} lead / +${j.archived} arch / ${j.failed} retry (${j.processed} scanned) | tot ${imported} leads, ${archived} arch, $${spent.toFixed(2)}`);
    if (!j.maybe_more) dry.add(digit);
    await new Promise((r) => setTimeout(r, 400));
  }
}
console.log(`Alto property wave: ${SHARDS.length} shards, min ${MIN_EMP} emp, cap $${CAP}`);
await Promise.all(SHARDS.map((d, i) => worker(d, i)));
fs.writeFileSync("_altoscreen_out.json", JSON.stringify({ imported, archived, processed, failed, spent: +spent.toFixed(4), done: true }, null, 1));
console.log(`=== DONE === ${imported} property leads imported, ${archived} archived, ${processed} scanned | spent $${spent.toFixed(2)}/$${CAP}`);
