// Enrich Alto companies that have NO contact, via claude-proxy find_contacts (Haiku + web_search).
// Authenticates as Jacob (GoTrue) so it WRITES contacts under RLS directly. Fetches its own cohort
// (active Alto, has domain, zero contacts). Metered, hard-capped, RESUMABLE (re-query each run skips
// already-filled). Cleans + marks guessed emails. Progress -> _altocontacts_out.json.
// Run:  ALLOY_PW='<jacob pw>' node _altocontacts.mjs [maxUSD]
import fs from "node:fs";
const SRC = fs.readFileSync("src/forge.jsx", "utf8");
const URL = "https://nvjizahtcqgmfhiodtej.supabase.co";
const ANON = (SRC.match(/anonKey:\s*\n?\s*"([^"]+)"/) || [])[1];
const PW = process.env.ALLOY_PW, EMAIL = process.env.ALLOY_EMAIL || "jacob.ahmid@gmail.com";
const MAX_USD = Number(process.argv[2] || 12);
const IN_M = 1.0, OUT_M = 5.0, SEARCH = 0.01;
if (!ANON) { console.error("no anon key"); process.exit(1); }
if (!PW) { console.error("Set ALLOY_PW (Jacob's password) so the driver can write contacts under RLS."); process.exit(1); }

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function login() {
  const r = await fetch(`${URL}/auth/v1/token?grant_type=password`, { method: "POST", headers: { apikey: ANON, "Content-Type": "application/json" }, body: JSON.stringify({ email: EMAIL, password: PW }) });
  const j = await r.json(); if (!j.access_token) throw new Error("login failed: " + JSON.stringify(j).slice(0, 160)); return j.access_token;
}
async function cohort(tok) {
  const H = { apikey: ANON, Authorization: "Bearer " + tok };
  const [cos, cts] = await Promise.all([
    (await fetch(`${URL}/rest/v1/companies?project_id=eq.alto&list_tag=is.null&select=id,name,domain,city,industry&domain=not.is.null&order=id`, { headers: H })).json(),
    (await fetch(`${URL}/rest/v1/contacts?select=company_id`, { headers: H })).json(),
  ]);
  const have = new Set((cts || []).map((c) => c.company_id));
  return (cos || []).filter((c) => !have.has(c.id));
}
function cleanLi(li) {
  let s = String(li || "").trim(); if (!s) return "";
  if (/^www\./i.test(s) || /^([a-z]{2,3}\.)?linkedin\.com/i.test(s)) s = "https://" + s;
  if (!/^https?:\/\//i.test(s)) s = "https://" + s.replace(/^\/+/, "");
  if (!/^https?:\/\/([a-z]{2,3}\.)?linkedin\.com\/(in|pub)\/[^/\s]{2,}/i.test(s)) return "";
  const slug = (s.match(/\/(?:in|pub)\/([^/?#\s]+)/i) || [])[1] || "";
  if (/^\d+$/.test(slug) || /^(firstname|lastname|name|username|profile|example|placeholder|john-?doe|jane-?doe|abc-?123|xxxx+)$/i.test(slug)) return "";
  return s.replace(/\/+$/, "");
}
async function findContacts(c) {
  const facts = [c.name, c.city ? "City: " + c.city : "", c.domain ? "Website: " + c.domain : "", c.industry ? "Industry: " + c.industry : ""].filter(Boolean).join("\n");
  const user = "Find the key people to contact at this Swedish company for selling cloud/AWS services:\n" + facts +
    "\n\nUse web search. Prioritise whoever owns a cloud/IT decision (VD/CEO, CTO, IT-chef, Head of Digital). Max 3 people. " +
    "For each person ALSO search LinkedIn ('<name> " + (c.name || "") + " linkedin' / site:linkedin.com/in) and return their profile URL as https://www.linkedin.com/in/<slug> — a primary goal. Only a URL you actually saw matching this exact person; never invent a slug; empty if not found. " +
    'Respond ONLY with JSON: {"people":[{"name":"<full>","title":"<role>","linkedin":"<https://linkedin.com/in/... or empty>","email":"<likely business email or empty>","email_is_guess":true}]}';
  const r = await fetch(`${URL}/functions/v1/claude-proxy`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + ANON, apikey: ANON }, signal: AbortSignal.timeout(90000),
    body: JSON.stringify({ model: "claude-haiku-4-5-20251001", task: "find_contacts", max_tokens: 700, messages: [{ role: "user", content: user }], tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 3 }] }) });
  const j = await r.json(); const u = j.usage || {};
  const cost = ((u.input_tokens || 0) + (u.cache_read_input_tokens || 0) + (u.cache_creation_input_tokens || 0)) / 1e6 * IN_M + (u.output_tokens || 0) / 1e6 * OUT_M + (((u.server_tool_use || {}).web_search_requests) || 0) * SEARCH;
  let people = [];
  try { const t = (j.content || []).filter((b) => b.type === "text").map((b) => b.text).join(""); const m = t.match(/\{[\s\S]*\}/); if (m) people = (JSON.parse(m[0]).people || []); } catch {}
  return { people, cost, err: j.error || null };
}
async function writeContacts(tok, companyId, people) {
  const rows = [];
  const seen = new Set();
  let n = 0;
  for (const p of people) {
    const nm = String(p.name || "").trim(); if (!nm) continue;
    const lc = nm.toLowerCase(); if (seen.has(lc)) continue; seen.add(lc);
    const parts = nm.split(/\s+/); const first = parts.shift(); const last = parts.join(" ");
    const guessed = p.email && p.email_is_guess !== false;
    rows.push({ id: "ct-smith-" + companyId.replace(/[^a-z0-9]/gi, "").slice(0, 12) + "-" + (n++), company_id: companyId, first_name: first, last_name: last, title: ((p.title || "") + (guessed ? " · email guessed" : "")).slice(0, 120), email: p.email || "", linkedin: cleanLi(p.linkedin), status: "Not contacted", source: "smith_find" });
  }
  if (!rows.length) return { wrote: 0 };
  const r = await fetch(`${URL}/rest/v1/contacts`, { method: "POST", headers: { apikey: ANON, Authorization: "Bearer " + tok, "Content-Type": "application/json", Prefer: "return=minimal" }, body: JSON.stringify(rows) });
  return { wrote: r.status === 201 ? rows.length : 0, status: r.status };
}

const tok = await login();
const list = await cohort(tok);
console.log(`Alto cohort missing contacts: ${list.length} | budget $${MAX_USD}`);
let spent = 0, done = 0, peopleTotal = 0, cosWith = 0;
const out = [];
for (const c of list) {
  if (spent >= MAX_USD) { console.log(`BUDGET REACHED $${spent.toFixed(2)} — stop before ${c.name}`); break; }
  let res; try { res = await findContacts(c); } catch (e) { console.log(`ERR ${c.name}: ${String(e.message || e).slice(0, 40)}`); continue; }
  spent += res.cost; done++;
  const w = await writeContacts(tok, c.id, res.people);
  if (w.wrote) { cosWith++; peopleTotal += w.wrote; }
  out.push({ id: c.id, name: c.name, found: res.people.length, wrote: w.wrote });
  console.log(`${done}/${list.length} ${String(c.name).slice(0, 30).padEnd(30)} found ${res.people.length} wrote ${w.wrote} | $${spent.toFixed(2)}`);
  if (done % 10 === 0) fs.writeFileSync("_altocontacts_out.json", JSON.stringify({ spent: +spent.toFixed(4), done, cosWith, peopleTotal, results: out }, null, 1));
}
fs.writeFileSync("_altocontacts_out.json", JSON.stringify({ spent: +spent.toFixed(4), done, cosWith, peopleTotal, done_flag: true, results: out }, null, 1));
console.log(`=== DONE === ${done} cos | ${cosWith} got contacts | ${peopleTotal} people | spent $${spent.toFixed(2)}/$${MAX_USD}`);
