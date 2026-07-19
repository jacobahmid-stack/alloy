// Smoke test for the desk-only tools. Stubs fetch, so it needs no key and touches no network.
// Verifies the two things that actually break: the PostgREST URL the filters produce, and that the
// tools are absent from the shared (HTTP) server.
//
// Run: node test/desk.smoke.mjs
process.env.ALLOY_SERVICE_KEY = [
  Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url"),
  Buffer.from(JSON.stringify({ role: "service_role", iss: "supabase" })).toString("base64url"),
  "sig",
].join(".");
process.env.ALLOY_SUPABASE_URL = "https://db.example.test";

const { registerDeskTools } = await import("../src/desk.mjs");
const { createAlloyServer } = await import("../src/server.mjs");

let fail = 0;
const check = (name, cond, extra = "") => {
  if (cond) { console.log(`  ok   ${name}`); }
  else { console.log(`  FAIL ${name} ${extra}`); fail++; }
};

// Capture the tools a server registers, and the URLs they fetch.
function collect(register) {
  const tools = new Map();
  const fakeServer = { tool: (name, _desc, _schema, handler) => tools.set(name, handler) };
  register(fakeServer);
  return tools;
}

const urls = [];
globalThis.fetch = async (url) => {
  urls.push(String(url));
  return { ok: true, status: 200, text: async () => JSON.stringify([{ id: "c1", name: "Testbolaget AB" }]) };
};

console.log("desk tools registered:");
const desk = collect(registerDeskTools);
for (const n of ["alloy_query_corpus", "alloy_account_contacts", "alloy_pipeline"]) {
  check(`${n} present`, desk.has(n));
}

console.log("\nquery_corpus builds the right PostgREST URL:");
urls.length = 0;
await desk.get("alloy_query_corpus")({
  country: "SE", cloud: "aws", icp_min: 70, employees_min: 50,
  has_domain: true, order_by: "icp_score", limit: 10,
});
const u = urls[0] || "";
check("hits /rest/v1/companies", u.includes("/rest/v1/companies"), u);
check("country filter", u.includes("country=eq.SE"), u);
check("cloud filter", u.includes("cloud_provider=eq.aws"), u);
check("icp lower bound", u.includes("icp_score=gte.70"), u);
check("employees lower bound", u.includes("employees=gte.50"), u);
check("has_domain guard", u.includes("domain=not.is.null"), u);
check("ordering", u.includes("order=icp_score.desc.nullslast"), u);
check("limit", u.includes("limit=10"), u);
check("narrow select, never techstack", u.includes("select=") && !u.includes("techstack") && !u.includes("select=*"), u);

console.log("\ncontacts tool resolves a domain to a company first:");
urls.length = 0;
await desk.get("alloy_account_contacts")({ domain: "www.testbolaget.se", limit: 5 });
check("strips www and looks up the company", (urls[0] || "").includes("domain=eq.testbolaget.se"), urls[0]);
check("then queries contacts by company_id", (urls[1] || "").includes("/rest/v1/contacts") && (urls[1] || "").includes("company_id=eq.c1"), urls[1]);

console.log("\npipeline tool:");
urls.length = 0;
await desk.get("alloy_pipeline")({ tenant: "novalo", stage: "mote_bokat", limit: 20 });
check("hits engagements with tenant + stage", (urls[0] || "").includes("/rest/v1/engagements") && urls[0].includes("tenant_id=eq.novalo") && urls[0].includes("stage=eq.mote_bokat"), urls[0]);

// LICENCE BOUNDARY. This is the regression this file exists for, so it reads the actual source of
// the shared factory rather than trusting a list maintained by hand. src/http.mjs builds
// createAlloyServer() per request behind one token per partner tenant, so any desk tool name
// appearing in server.mjs is a licence and privacy leak: contact rows are ~91.6% Vainu-trial data
// that is founder-use-only, and arbitrary corpus queries are a bulk-export surface.
console.log("\nLICENCE BOUNDARY: desk tools must NOT reach the shared HTTP server:");
const { readFileSync } = await import("node:fs");
const sharedSrc = readFileSync(new URL("../src/server.mjs", import.meta.url), "utf8");
const httpSrc = readFileSync(new URL("../src/http.mjs", import.meta.url), "utf8");
for (const n of ["alloy_query_corpus", "alloy_account_contacts", "alloy_pipeline"]) {
  check(`${n} not registered in server.mjs`, !sharedSrc.includes(n), "found in the shared factory");
  check(`${n} not referenced in http.mjs`, !httpSrc.includes(n), "found on the HTTP entry");
}
check("http.mjs does not import desk.mjs", !httpSrc.includes("desk.mjs"), "HTTP entry imports the desk module");
check("desk.mjs demands a service key, not the anon key", (await import("node:fs")).readFileSync(new URL("../src/desk.mjs", import.meta.url), "utf8").includes("ALLOY_SERVICE_KEY"));
// createAlloyServer must still construct cleanly with the desk module loaded alongside it.
check("shared factory still builds", !!createAlloyServer());

console.log(fail === 0 ? "\nPASS" : `\n${fail} FAILURES`);
process.exit(fail === 0 ? 0 : 1);
