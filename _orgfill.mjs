// Org-number backfill: resolve Swedish org-nr for Novalo companies via claude-proxy find_orgnr
// (Haiku + web_search, name+domain). Authenticates as Jacob (GoTrue) so it can WRITE orgnr
// under RLS directly. Fetches its own cohort (no hand-baked IDs). Metered, hard-capped, RESUMABLE
// (skips companies that already have an orgnr). Progress -> _orgfill_out.json.
// Run:  ALLOY_PW='<jacob password>' node _orgfill.mjs [maxUSD]
import fs from "node:fs";
const SRC = fs.readFileSync("src/forge.jsx", "utf8");
const URL = "https://nvjizahtcqgmfhiodtej.supabase.co";
const ANON = (SRC.match(/anonKey:\s*\n?\s*"([^"]+)"/) || [])[1];
const PW = process.env.ALLOY_PW;
const EMAIL = process.env.ALLOY_EMAIL || "jacob.ahmid@gmail.com";
const MAX_USD = Number(process.argv[2] || 35);
const IN_M = 1.0, OUT_M = 5.0, SEARCH = 0.01; // Haiku pricing + web_search per-call
if (!ANON) { console.error("no anon key"); process.exit(1); }
if (!PW) { console.error("Set ALLOY_PW env var (Jacob's password) so the driver can write orgnr under RLS."); process.exit(1); }

async function login() {
  const r = await fetch(`${URL}/auth/v1/token?grant_type=password`, {
    method: "POST", headers: { apikey: ANON, "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PW }),
  });
  const j = await r.json();
  if (!j.access_token) throw new Error("login failed: " + JSON.stringify(j).slice(0, 160));
  return j.access_token;
}
async function fetchCohort(tok) {
  const H = { apikey: ANON, Authorization: "Bearer " + tok };
  const r = await fetch(`${URL}/rest/v1/companies?project_id=eq.novalo&list_tag=is.null&select=id,name,domain,orgnr&domain=not.is.null&order=id`, { headers: H });
  const rows = await r.json();
  return rows.filter((c) => c.domain && (!c.orgnr || c.orgnr === ""));
}
async function findOrgnr(name, domain) {
  const r = await fetch(`${URL}/functions/v1/claude-proxy`, {
    method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + ANON, apikey: ANON },
    signal: AbortSignal.timeout(90000),
    body: JSON.stringify({ model: "claude-haiku-4-5-20251001", task: "find_orgnr", max_tokens: 300,
      messages: [{ role: "user", content: `Company: "${name}"\nWebsite domain: ${domain}\nFind this exact company's Swedish organisationsnummer (NNNNNN-NNNN). The org-nr MUST belong to the entity that owns ${domain}. If it's not a Swedish-registered company, return empty.` }],
      tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 2 }] }),
  });
  const j = await r.json();
  const u = j.usage || {};
  const cost = ((u.input_tokens || 0) + (u.cache_read_input_tokens || 0) + (u.cache_creation_input_tokens || 0)) / 1e6 * IN_M
    + (u.output_tokens || 0) / 1e6 * OUT_M + (((u.server_tool_use || {}).web_search_requests) || 0) * SEARCH;
  let orgnr = "", conf = "";
  try { const t = (j.content || []).filter((b) => b.type === "text").map((b) => b.text).join(""); const m = t.match(/\{[\s\S]*\}/); if (m) { const o = JSON.parse(m[0]); orgnr = (o.orgnr || "").trim(); conf = o.confidence || ""; } } catch {}
  // validate format NNNNNN-NNNN
  const digits = orgnr.replace(/\D/g, "");
  const valid = digits.length === 10;
  return { orgnr: valid ? digits.slice(0, 6) + "-" + digits.slice(6) : "", confidence: conf, cost, err: j.error || null };
}
async function writeOrgnr(tok, id, orgnr) {
  const r = await fetch(`${URL}/rest/v1/companies?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH", headers: { apikey: ANON, Authorization: "Bearer " + tok, "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify({ orgnr }),
  });
  return r.status;
}

const tok = await login();
const cohort = await fetchCohort(tok);
console.log(`cohort: ${cohort.length} companies missing orgnr | budget $${MAX_USD}`);
let spent = 0, done = 0, filled = 0, empty = 0;
const out = [];
for (const c of cohort) {
  if (spent >= MAX_USD) { console.log(`BUDGET REACHED $${spent.toFixed(2)} — stop before ${c.name}`); break; }
  let res;
  try { res = await findOrgnr(c.name, c.domain); } catch (e) { console.log(`ERR ${c.name}: ${String(e.message || e).slice(0, 50)}`); continue; }
  spent += res.cost; done++;
  let wrote = "";
  if (res.orgnr) { const st = await writeOrgnr(tok, c.id, res.orgnr); wrote = st === 204 ? "saved" : "WRITE_" + st; if (st === 204) filled++; }
  else empty++;
  out.push({ id: c.id, name: c.name, domain: c.domain, orgnr: res.orgnr, confidence: res.confidence, wrote });
  console.log(`${done}/${cohort.length} ${String(c.name).slice(0, 26).padEnd(26)} ${res.orgnr || "(none)"} ${res.confidence || ""} ${wrote} | $${spent.toFixed(2)}`);
  if (done % 10 === 0) fs.writeFileSync("_orgfill_out.json", JSON.stringify({ spent: +spent.toFixed(4), done, filled, empty, results: out }, null, 1));
}
fs.writeFileSync("_orgfill_out.json", JSON.stringify({ spent: +spent.toFixed(4), done, filled, empty, done_flag: true, results: out }, null, 1));
console.log(`=== DONE === ${done} scanned | ${filled} org-nrs written | ${empty} none/non-SE | spent $${spent.toFixed(2)}/$${MAX_USD}`);
