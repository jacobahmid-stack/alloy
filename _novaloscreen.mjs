// Size-gated Novalo import. Drives icp-screen across se_registry's ~25k software/IT aktiebolag
// (SNI 62100/62201/62202/62900/58290/58210/63100). Per company: firmographics size gate (>=10 emp
// => imported as a lead WITH a domain; otherwise archived). 5 concurrent shards, disjoint by orgnr
// last digit. Hard-capped at $46 (Jacob's $50 guard, with margin). The edge fn self-selects + dedupes
// via anti-join, so re-running later just goes deeper — never re-pays for a screened org.
const BASE = "https://nvjizahtcqgmfhiodtej.supabase.co";
const ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52aml6YWh0Y3FnbWZoaW9kdGVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5ODk0NDMsImV4cCI6MjA5NTU2NTQ0M30.G0gf0z0wg9RQqsyZcEBXPYJ1YVeTe_NOULtDAEI2xEA";
const CAP = 40, MIN_EMP = 10, LIMIT = 4; // ~6 already spent on v1/v2 attempts; 40 here keeps total under $50
const SHARDS = [["0", "1", "2", "3", "4"], ["5", "6", "7", "8", "9"]]; // 2 shards ONLY — 5 caused Anthropic 429 storms
import fs from "node:fs";

let spent = 0, imported = 0, archived = 0, processed = 0, failed = 0;
async function call(digit) {
  const r = await fetch(BASE + "/functions/v1/icp-screen", {
    method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + ANON, apikey: ANON },
    signal: AbortSignal.timeout(240000),
    body: JSON.stringify({ project_id: "novalo", min_employees: MIN_EMP, limit: LIMIT, digit }),
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
    console.log(`shard ${tag} d${digit}: +${j.imported} lead / +${j.archived} arch / ${j.failed} retry (${j.processed} scanned) | tot ${imported} leads, ${archived} arch, ${failed} retry, $${spent.toFixed(2)}`);
    if (!j.maybe_more) dry.add(digit); // this digit exhausted
    await new Promise((r) => setTimeout(r, 400)); // gentle pacing between batches
  }
}
console.log(`Novalo size-gated import: ${SHARDS.length} shards, min ${MIN_EMP} emp, cap $${CAP}`);
await Promise.all(SHARDS.map((d, i) => worker(d, i)));
fs.writeFileSync("_novaloscreen_out.json", JSON.stringify({ imported, archived, processed, spent: +spent.toFixed(4), done: true }, null, 1));
console.log(`=== DONE === ${imported} size-gated leads imported, ${archived} archived (too small / unknown), ${processed} scanned | spent $${spent.toFixed(2)}/$${CAP}`);
