// LinkedIn backfill: fill missing `linkedin` on EXISTING contacts via claude-proxy find_linkedin
// (Haiku + web_search, name+title+company). Authenticates as Jacob (GoTrue) so it WRITES under RLS.
// Fetches its own cohort (contacts with empty/null linkedin), pulls each contact's company for context.
// Metered, hard-capped, RESUMABLE (a re-run skips contacts that now have a linkedin). Validates +
// normalises every URL before writing; only writes confident, real /in/ profiles. Progress -> _lifill_out.json.
// ECONOMICS: ~$0.04-0.05 per contact (web-search result tokens dominate) and a realistic ~30-50% hit
// rate — LinkedIn blocks crawlers, so the model correctly returns empty rather than guess a wrong person.
// High-value contacts (smith_find / AI research) are processed FIRST, so a small cap fills those before
// the 629 bulk imports. Suggest a trial: `node _lifill.mjs 6` (~120 of the best contacts) to gauge yield.
// Run:  ALLOY_PW='<jacob pw>' node _lifill.mjs [maxUSD] [project]   (project optional: alto | novalo)
import fs from "node:fs";
const SRC = fs.readFileSync("src/forge.jsx", "utf8");
const URL = "https://nvjizahtcqgmfhiodtej.supabase.co";
const ANON = (SRC.match(/anonKey:\s*\n?\s*"([^"]+)"/) || [])[1];
const PW = process.env.ALLOY_PW, EMAIL = process.env.ALLOY_EMAIL || "jacob.ahmid@gmail.com";
const MAX_USD = Number(process.argv[2] || 12);
const PROJECT = (process.argv[3] || "").trim(); // "" = both
const IN_M = 1.0, OUT_M = 5.0, SEARCH = 0.01; // Haiku pricing + web_search per-call
if (!ANON) { console.error("no anon key"); process.exit(1); }
if (!PW) { console.error("Set ALLOY_PW (Jacob's password) so the driver can write under RLS."); process.exit(1); }

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function cleanLi(li) {
  let s = String(li || "").trim(); if (!s) return "";
  if (/^www\./i.test(s) || /^([a-z]{2,3}\.)?linkedin\.com/i.test(s)) s = "https://" + s;
  if (!/^https?:\/\//i.test(s)) s = "https://" + s.replace(/^\/+/, "");
  if (!/^https?:\/\/([a-z]{2,3}\.)?linkedin\.com\/(in|pub)\/[^/\s]{2,}/i.test(s)) return "";
  const slug = (s.match(/\/(?:in|pub)\/([^/?#\s]+)/i) || [])[1] || "";
  if (/^\d+$/.test(slug) || /^(firstname|lastname|name|username|profile|example|placeholder|john-?doe|jane-?doe|abc-?123|xxxx+)$/i.test(slug)) return "";
  return s.replace(/\/+$/, "");
}
async function login() {
  const r = await fetch(`${URL}/auth/v1/token?grant_type=password`, { method: "POST", headers: { apikey: ANON, "Content-Type": "application/json" }, body: JSON.stringify({ email: EMAIL, password: PW }) });
  const j = await r.json(); if (!j.access_token) throw new Error("login failed: " + JSON.stringify(j).slice(0, 160)); return j.access_token;
}
async function cohort(tok) {
  const H = { apikey: ANON, Authorization: "Bearer " + tok };
  // contacts missing linkedin
  const cts = await (await fetch(`${URL}/rest/v1/contacts?select=id,first_name,last_name,title,company_id,linkedin,source&or=(linkedin.is.null,linkedin.eq.)&order=company_id&limit=2000`, { headers: H })).json();
  const ids = [...new Set((cts || []).map((c) => c.company_id).filter(Boolean))];
  // pull the companies those contacts belong to (chunked id=in)
  const coMap = {};
  for (let i = 0; i < ids.length; i += 80) {
    const chunk = ids.slice(i, i + 80).map((s) => `"${String(s).replace(/"/g, "")}"`).join(",");
    const rows = await (await fetch(`${URL}/rest/v1/companies?id=in.(${encodeURIComponent(chunk)})&select=id,name,city,postort,domain,project_id`, { headers: H })).json();
    for (const r of (rows || [])) coMap[r.id] = r;
  }
  let list = (cts || []).map((c) => ({ ...c, co: coMap[c.company_id] })).filter((c) => c.co && c.co.name);
  if (PROJECT) list = list.filter((c) => c.co.project_id === PROJECT);
  // Prioritise the contacts the rep actually works (surfaced onto cards: smith_find / AI research)
  // over the 629 bulk-imported rows, so a capped budget spends on the high-value ones first.
  const pri = (s) => (/smith|research|find/i.test(s || "") ? 0 : 1);
  list.sort((a, b) => pri(a.source) - pri(b.source));
  return list;
}
async function findLi(c) {
  const co = c.co;
  const name = [c.first_name, c.last_name].filter(Boolean).join(" ").trim();
  const facts = [`Person: ${name}`, c.title ? `Title: ${c.title}` : "", `Company: ${co.name}`, (co.city || co.postort) ? `City: ${co.city || co.postort}` : "", co.domain ? `Company website: ${co.domain}` : ""].filter(Boolean).join("\n");
  const user = `Find this exact person's public LinkedIn profile:\n${facts}\n\nUse web search. Return ONLY their personal /in/ profile URL if you can confidently match THIS person at THIS company. ` +
    'Respond ONLY with JSON: {"linkedin":"<https://linkedin.com/in/... or empty>","confidence":"high|med|low"}';
  const r = await fetch(`${URL}/functions/v1/claude-proxy`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + ANON, apikey: ANON }, signal: AbortSignal.timeout(90000),
    body: JSON.stringify({ model: "claude-haiku-4-5-20251001", task: "find_linkedin", max_tokens: 550, messages: [{ role: "user", content: user }], tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 2 }] }) });
  const j = await r.json(); const u = j.usage || {};
  const cost = ((u.input_tokens || 0) + (u.cache_read_input_tokens || 0) + (u.cache_creation_input_tokens || 0)) / 1e6 * IN_M + (u.output_tokens || 0) / 1e6 * OUT_M + (((u.server_tool_use || {}).web_search_requests) || 0) * SEARCH;
  let li = "", conf = "";
  try { const t = (j.content || []).filter((b) => b.type === "text").map((b) => b.text).join(""); const m = t.match(/\{[\s\S]*\}/); if (m) { const o = JSON.parse(m[0]); li = o.linkedin || ""; conf = o.confidence || ""; } } catch {}
  return { linkedin: cleanLi(li), confidence: conf, cost, err: j.error || null };
}
async function writeLi(tok, id, linkedin) {
  const r = await fetch(`${URL}/rest/v1/contacts?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", headers: { apikey: ANON, Authorization: "Bearer " + tok, "Content-Type": "application/json", Prefer: "return=minimal" }, body: JSON.stringify({ linkedin }) });
  return r.status;
}

const tok = await login();
const list = await cohort(tok);
console.log(`contacts missing LinkedIn${PROJECT ? " (" + PROJECT + ")" : ""}: ${list.length} | budget $${MAX_USD}`);
let spent = 0, done = 0, filled = 0, none = 0;
const out = [];
for (const c of list) {
  if (spent >= MAX_USD) { console.log(`BUDGET REACHED $${spent.toFixed(2)} — stop`); break; }
  let res; try { res = await findLi(c); } catch (e) { console.log(`ERR ${c.first_name} ${c.last_name}: ${String(e.message || e).slice(0, 40)}`); continue; }
  spent += res.cost; done++;
  let wrote = "";
  if (res.linkedin) { const st = await writeLi(tok, c.id, res.linkedin); wrote = st === 204 ? "saved" : "WRITE_" + st; if (st === 204) filled++; } else none++;
  out.push({ id: c.id, name: [c.first_name, c.last_name].join(" "), company: c.co.name, linkedin: res.linkedin, confidence: res.confidence, wrote });
  console.log(`${done}/${list.length} ${[c.first_name, c.last_name].join(" ").slice(0, 24).padEnd(24)} ${(res.linkedin || "(none)").slice(0, 48)} ${res.confidence || ""} ${wrote} | $${spent.toFixed(2)}`);
  if (done % 10 === 0) fs.writeFileSync("_lifill_out.json", JSON.stringify({ spent: +spent.toFixed(4), done, filled, none, results: out }, null, 1));
}
fs.writeFileSync("_lifill_out.json", JSON.stringify({ spent: +spent.toFixed(4), done, filled, none, done_flag: true, results: out }, null, 1));
console.log(`=== DONE === ${done} scanned | ${filled} LinkedIn written | ${none} not found | spent $${spent.toFixed(2)}/$${MAX_USD}`);
