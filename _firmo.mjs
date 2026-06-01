// Firmographics enrichment for the RESELL book: pull latest revenue (omsättning) + employees per
// company via claude-proxy find_firmographics (Haiku + web_search). Read-only here (anon can't write);
// outputs _firmo_out.json → parent writes enrichment.revenue_sek/employees via service-role SQL.
// Metered, HARD-CAPPED at $50 (Jacob's guard), concurrency-limited, resumable-ish. Candidates from _firmocand.json.
// Run:  node _firmo.mjs
import fs from "node:fs";
const SRC = fs.readFileSync("src/forge.jsx", "utf8");
const BASE = "https://nvjizahtcqgmfhiodtej.supabase.co";
const ANON = (SRC.match(/anonKey:\s*\n?\s*"([^"]+)"/) || [])[1];
const IN_M = 1.0, OUT_M = 5.0, SEARCH = 0.01;
const HARD_CAP_USD = 50;     // Jacob's guard — stop before exceeding
const CONC = 4;

const TARGETS = JSON.parse(fs.readFileSync("_firmocand.json", "utf8"));

async function firmo(c) {
  const facts = [`Company: "${c.name}"`, c.domain ? `Website: ${c.domain}` : "", c.city ? `City: ${c.city}` : "", c.industry ? `Industry: ${c.industry}` : ""].filter(Boolean).join("\n");
  const user = "Find this Swedish company's latest annual revenue (omsättning/nettoomsättning) in SEK and employee count:\n" + facts +
    "\nUse web search (allabolag.se, proff.se, the company's annual report). Convert tkr/mkr to absolute SEK. Latest available year.";
  const r = await fetch(BASE + "/functions/v1/claude-proxy", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + ANON, apikey: ANON }, signal: AbortSignal.timeout(90000),
    body: JSON.stringify({ model: "claude-haiku-4-5-20251001", task: "find_firmographics", max_tokens: 450, messages: [{ role: "user", content: user }], tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 2 }] }) });
  const j = await r.json(); const u = j.usage || {};
  const cost = ((u.input_tokens || 0) + (u.cache_read_input_tokens || 0) + (u.cache_creation_input_tokens || 0)) / 1e6 * IN_M + (u.output_tokens || 0) / 1e6 * OUT_M + (((u.server_tool_use || {}).web_search_requests) || 0) * SEARCH;
  let o = {};
  try { const t = (j.content || []).filter((b) => b.type === "text").map((b) => b.text).join(""); const m = t.match(/\{[\s\S]*\}/); if (m) o = JSON.parse(m[0]); } catch {}
  const rev = Number(o.revenue_sek); const emp = Number(o.employees);
  return { revenue_sek: isFinite(rev) && rev > 0 ? Math.round(rev) : null, revenue_year: o.revenue_year || "", employees: isFinite(emp) && emp > 0 ? Math.round(emp) : null, confidence: o.confidence || "", source: o.source || "", cost };
}

const out = [];
let spent = 0, done = 0, withData = 0, capped = false;
const queue = [...TARGETS];
async function worker() {
  while (queue.length) {
    if (spent >= HARD_CAP_USD) { capped = true; break; }
    const c = queue.shift();
    let res; try { res = await firmo(c); } catch (e) { res = { cost: 0, err: String(e.message || e).slice(0, 40) }; }
    spent += res.cost || 0; done++;
    if (res.revenue_sek || res.employees) withData++;
    out.push({ id: c.id, name: c.name, revenue_sek: res.revenue_sek || null, revenue_year: res.revenue_year || "", employees: res.employees || null, confidence: res.confidence || "", source: res.source || "" });
    const rv = res.revenue_sek ? (res.revenue_sek / 1e6).toFixed(0) + "M" : "—";
    console.log(`${done}/${TARGETS.length} ${String(c.name).slice(0, 26).padEnd(26)} rev ${rv} emp ${res.employees || "—"} | $${spent.toFixed(2)}`);
    if (done % 10 === 0) fs.writeFileSync("_firmo_out.json", JSON.stringify({ done, withData, spent: +spent.toFixed(4), results: out }, null, 1));
  }
}
console.log(`Firmographics for ${TARGETS.length} resell targets, concurrency ${CONC}, hard cap $${HARD_CAP_USD}`);
await Promise.all(Array.from({ length: CONC }, worker));
fs.writeFileSync("_firmo_out.json", JSON.stringify({ done, withData, spent: +spent.toFixed(4), capped, done_flag: true, results: out }, null, 1));
console.log(`=== DONE === ${done}/${TARGETS.length} scanned | ${withData} got data | spent $${spent.toFixed(2)}${capped ? " (HIT $50 CAP)" : ""}`);
if (spent > 50) console.log("!!! WARNING: spend exceeded $50 !!!");
