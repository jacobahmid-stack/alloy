// Find decision-makers for the top no-contact "Work first" picks (Alto + Novalo) via claude-proxy
// find_contacts (Haiku + web_search). Read-only here (anon can't write under RLS) — outputs to
// _pickcontacts_out.json; the parent inserts via service-role SQL. Metered (~$0.05/co). Targets embedded.
import fs from "node:fs";
const SRC = fs.readFileSync("src/forge.jsx", "utf8");
const BASE = "https://nvjizahtcqgmfhiodtej.supabase.co";
const ANON = (SRC.match(/anonKey:\s*\n?\s*"([^"]+)"/) || [])[1];
const IN_M = 1.0, OUT_M = 5.0, SEARCH = 0.01;
const CONC = 4;

const TARGETS = [
{id:"19e700817eeoa7wlw",name:"Akademiska Hus Aktiebolag",domain:"akademiskahus.se",city:"Göteborg",industry:"Fastighet"},
{id:"19e700817eepso49e",name:"Aktiebolaget Stockholmshem",domain:"stockholmshem.se",city:"Stockholm",industry:"Fastighet (bostäder)"},
{id:"19e700817eecx6bhh",name:"Aktiebolaget Svenska Bostäder",domain:"svenskabostader.se",city:"Stockholm",industry:"Fastighet (bostäder)"},
{id:"19e700817ee0py5jn",name:"Eskilstuna Kommunfastigheter Aktiebolag",domain:"kfast.se",city:"Eskilstuna",industry:"Fastighet"},
{id:"19e700817eev3s6s1",name:"Aktiebolaget Familjebostäder",domain:"familjebostader.se",city:"Stockholm",industry:"Fastighet (bostäder)"},
{id:"19e700817eeo567fs",name:"Bostadsaktiebolaget Poseidon",domain:"poseidon.goteborg.se",city:"Göteborg",industry:"Fastighet (bostäder)"},
{id:"19e700817eei1d1oz",name:"CBRE GWS Sweden AB",domain:"cbre.se",city:"Stockholm",industry:"Fastighetsförvaltning"},
{id:"19e700817eekluj4j",name:"Göteborgs stads bostadsaktiebolag",domain:"bostadsbolaget.se",city:"Göteborg",industry:"Fastighet (bostäder)"},
{id:"19e700817ee7x6r7w",name:"Aktiebolaget Tierpsbyggen",domain:"tierpsbyggen.se",city:"Tierp",industry:"Fastighet (bostäder)"},
{id:"imp-7958945da75a",name:"Teamtailor",domain:"teamtailor.com",city:"Stockholm",industry:"SaaS (HR/ATS)"},
{id:"imp-14b49e6d077a",name:"Custellence",domain:"custellence.com",city:"",industry:"SaaS"},
{id:"imp-1ee6b3c693c3",name:"Kiliaro",domain:"kiliaro.com",city:"",industry:"SaaS"},
{id:"imp-8e1e25c9a32c",name:"Flowhaven",domain:"flowhaven.com",city:"",industry:"SaaS (licensing)"},
{id:"imp-2d0d0ac9c25a",name:"Adverity",domain:"adverity.com",city:"",industry:"SaaS (analytics)"},
{id:"imp-ee8b0add8a38",name:"Upsales",domain:"upsales.com",city:"Stockholm",industry:"SaaS (CRM)"},
{id:"imp-93e996df6873",name:"Stravito",domain:"stravito.com",city:"Stockholm",industry:"SaaS"},
{id:"imp-97b0a59104ac",name:"Depict",domain:"depict.ai",city:"Stockholm",industry:"SaaS (e-com AI)"},
{id:"imp-99732b78333a",name:"HappySignals",domain:"happysignals.com",city:"",industry:"SaaS (ITX)"},
];

function cleanLi(li) {
  let s = String(li || "").trim(); if (!s) return "";
  if (/^www\./i.test(s) || /^([a-z]{2,3}\.)?linkedin\.com/i.test(s)) s = "https://" + s;
  if (!/^https?:\/\//i.test(s)) s = "https://" + s.replace(/^\/+/, "");
  if (!/^https?:\/\/([a-z]{2,3}\.)?linkedin\.com\/(in|pub)\/[^/\s]{2,}/i.test(s)) return "";
  const slug = (s.match(/\/(?:in|pub)\/([^/?#\s]+)/i) || [])[1] || "";
  if (/^\d+$/.test(slug) || /^(firstname|lastname|name|username|profile|example|placeholder)$/i.test(slug)) return "";
  return s.replace(/\/+$/, "");
}
async function find(c) {
  const facts = [c.name, c.city ? "City: " + c.city : "", "Website: " + c.domain, c.industry ? "Industry: " + c.industry : ""].filter(Boolean).join("\n");
  const user = "Find the key people to contact at this company for selling cloud/AWS services:\n" + facts +
    "\n\nUse web search. Prioritise whoever owns a cloud/IT decision (VD/CEO, CTO, IT-chef, Head of Digital/Engineering). Max 3 people. " +
    "For each ALSO search LinkedIn ('<name> " + c.name + " linkedin') and return their profile URL. " +
    'Respond ONLY with JSON: {"people":[{"name":"<full>","title":"<role>","linkedin":"<https://linkedin.com/in/... or empty>","email":"<likely business email or empty>","email_is_guess":true}]}';
  const r = await fetch(BASE + "/functions/v1/claude-proxy", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + ANON, apikey: ANON }, signal: AbortSignal.timeout(90000),
    body: JSON.stringify({ model: "claude-haiku-4-5-20251001", task: "find_contacts", max_tokens: 800, messages: [{ role: "user", content: user }], tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 3 }] }) });
  const j = await r.json(); const u = j.usage || {};
  const cost = ((u.input_tokens || 0) + (u.cache_read_input_tokens || 0) + (u.cache_creation_input_tokens || 0)) / 1e6 * IN_M + (u.output_tokens || 0) / 1e6 * OUT_M + (((u.server_tool_use || {}).web_search_requests) || 0) * SEARCH;
  let people = [];
  try { const t = (j.content || []).filter((b) => b.type === "text").map((b) => b.text).join(""); const m = t.match(/\{[\s\S]*\}/); if (m) people = (JSON.parse(m[0]).people || []); } catch {}
  return { people, cost };
}

const out = [];
let spent = 0, done = 0, total = 0;
const queue = [...TARGETS];
async function worker() {
  while (queue.length) {
    const c = queue.shift();
    let res; try { res = await find(c); } catch (e) { res = { people: [], cost: 0, err: String(e.message || e).slice(0, 40) }; }
    spent += res.cost; done++;
    const rows = [];
    const seen = new Set();
    let n = 0;
    for (const p of (res.people || [])) {
      const nm = String(p.name || "").trim(); if (!nm) continue;
      const lc = nm.toLowerCase(); if (seen.has(lc)) continue; seen.add(lc);
      const parts = nm.split(/\s+/); const first = parts.shift(); const last = parts.join(" ");
      const guessed = p.email && p.email_is_guess !== false;
      rows.push({ cid: c.id, first, last, title: ((p.title || "") + (guessed ? " · email guessed" : "")).slice(0, 120), email: p.email || "", linkedin: cleanLi(p.linkedin), n: n++ });
    }
    total += rows.length;
    out.push({ id: c.id, name: c.name, found: rows.length, rows });
    console.log(`${done}/${TARGETS.length} ${c.name.slice(0, 28).padEnd(28)} found ${rows.length} | $${spent.toFixed(2)}`);
    fs.writeFileSync("_pickcontacts_out.json", JSON.stringify({ done, total, spent: +spent.toFixed(4), results: out }, null, 1));
  }
}
console.log(`Find decision-makers for ${TARGETS.length} no-contact picks, concurrency ${CONC}`);
await Promise.all(Array.from({ length: CONC }, worker));
fs.writeFileSync("_pickcontacts_out.json", JSON.stringify({ done, total, spent: +spent.toFixed(4), done_flag: true, results: out }, null, 1));
console.log(`=== DONE === ${done} companies | ${total} contacts found | spent $${spent.toFixed(2)}`);
