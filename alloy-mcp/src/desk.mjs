// DESK-ONLY MCP TOOLS. Registered exclusively from src/index.mjs (the stdio entry Jacob runs at his
// own machine). NEVER add these to createAlloyServer() in server.mjs, because src/http.mjs builds
// that same server per request behind ALLOY_MCP_TOKEN, one token per partner tenant. Registering
// here is what makes "desk-only" an actual property of this codebase rather than an intention.
//
// WHY THESE EXIST. The four tools in server.mjs are all LLM round-trips through claude-proxy with
// web search. Not one of them touches the corpus. So alloy_find_prospects asks a model to name
// companies from the open web while 86,000 rows of Nordic registry data, resolved domains, detected
// cloud and ICP scores sit unqueried on the box. The prompting layer is the part Clay and Oxygen
// already have. The corpus is the part they do not. These tools expose the corpus.
//
// They cost nothing to run: direct PostgREST reads, no model call, no tokens, no budget draw. That
// is the whole point. Research and list building is roughly half of the ~720 founder-minutes per
// qualified opportunity, and it is the slice a model round-trip makes slower rather than faster.
//
// LICENCE BOUNDARY. alloy_account_contacts returns contact rows, ~91.6% of which came from a Vainu
// trial. Jacob's decision of 2026-07-19 is that this data is used by the founder at his desk and is
// not displayed to tenants. Keeping the tool on the stdio surface is the technical expression of
// that decision.
import { z } from "zod";

const BASE = (process.env.ALLOY_SUPABASE_URL || "https://db.forj.se").replace(/\/+$/, "");

// ALLOY_SERVICE_KEY, NOT ALLOY_ANON_KEY, AND THE DIFFERENCE IS NOT COSMETIC.
// RLS on companies is {authenticated} only (policies alloy_comp and companies_lib_read). The anon
// role therefore gets HTTP 200 with an empty array: no error, no warning, just nothing. Verified
// live 2026-07-19, anon returned [] on a query where service_role returned Billogram, Stravito and
// CBRE. That is the same silent-success failure that let the forj.se free-read widget ship broken
// and go unnoticed for two weeks, so it is worth being loud about rather than clever.
//
// A service-role key bypasses RLS entirely. That is acceptable HERE and only here: these tools are
// stdio-only, running in a process on the founder's own machine, where he is already the superuser.
// It must never reach src/http.mjs, which serves partner tenants.
const KEY = process.env.ALLOY_SERVICE_KEY || "";

// Decode the role claim once at load so a misconfigured key fails with a sentence instead of an
// empty list. No verification, no secret handling: this reads the public payload segment only.
function roleOf(jwt) {
  try {
    const seg = String(jwt).split(".")[1] || "";
    const json = Buffer.from(seg.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
    return JSON.parse(json).role || "unknown";
  } catch { return "unparseable"; }
}
const KEY_ROLE = KEY ? roleOf(KEY) : "missing";
if (KEY && KEY_ROLE !== "service_role") {
  console.error(
    `alloy-mcp desk tools: ALLOY_SERVICE_KEY carries role "${KEY_ROLE}", not "service_role". ` +
    "Corpus reads will return an EMPTY LIST rather than an error, because RLS on companies admits " +
    "only the authenticated role. Set the box SERVICE_ROLE_KEY.",
  );
}

// NEVER select * from companies. techstack and innovation are large jsonb columns; a wide select
// times out the role (30s) and has previously hung the app on boot. Narrow lists only.
const CO_COLS = "id,name,domain,country,employees,revenue_ksek,cloud_provider,aws_detected,icp_score,maturity_band,project_id,list_tags";
const CONTACT_COLS = "id,company_id,first_name,last_name,title,email,phone,source,status";

async function rest(path) {
  if (!KEY) {
    throw new Error(
      "ALLOY_SERVICE_KEY is not set. The desk tools read the corpus directly and RLS admits only the " +
      "authenticated role, so the anon key returns an empty list instead of an error. Set the box " +
      "SERVICE_ROLE_KEY in your local MCP config. It must stay local: never put it on the HTTP surface.",
    );
  }
  const r = await fetch(`${BASE}/rest/v1/${path}`, {
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, Accept: "application/json" },
  });
  const txt = await r.text();
  if (!r.ok) throw new Error(`Alloy REST ${r.status}: ${txt.slice(0, 300)}`);
  let out;
  try { out = JSON.parse(txt); } catch { return txt; }
  // An empty result with a non-service key is almost always RLS, not an empty corpus. Say which.
  if (Array.isArray(out) && out.length === 0 && KEY_ROLE !== "service_role") {
    throw new Error(
      `Empty result AND the key role is "${KEY_ROLE}". This is RLS silently filtering, not an empty ` +
      "corpus. Set ALLOY_SERVICE_KEY to the box SERVICE_ROLE_KEY and re-run.",
    );
  }
  return out;
}

const ok = (v) => ({ content: [{ type: "text", text: typeof v === "string" ? v : JSON.stringify(v, null, 2) }] });
const err = (e) => ({ content: [{ type: "text", text: "Error: " + (e?.message || e) }], isError: true });

export function registerDeskTools(server) {
  server.tool(
    "alloy_query_corpus",
    "Query the Alloy Nordic company library directly. No LLM, no tokens, instant. This is the corpus itself, roughly 86,000 Swedish, Norwegian and Finnish companies built from national registries, with resolved domains, detected cloud posture and ICP scores. Use for list building and account research: 'Swedish AWS companies over 50 staff scoring hot', 'Norwegian companies with revenue but no contact'. Returns rows, not prose. Prefer this over alloy_find_prospects, which only searches the open web and never sees this data.",
    {
      country: z.enum(["SE", "NO", "FI", "DK"]).optional().describe("ISO country code"),
      cloud: z.enum(["aws", "azure", "gcp", "cloudflare", "other", "none", "unknown"]).optional().describe("Detected cloud posture"),
      aws_detected: z.boolean().optional().describe("Only companies where AWS was positively detected"),
      icp_min: z.number().min(0).max(100).optional().describe("Minimum ICP score. 70+ is hot, 40+ warm"),
      icp_max: z.number().min(0).max(100).optional().describe("Maximum ICP score, for working a specific band"),
      employees_min: z.number().optional(),
      employees_max: z.number().optional(),
      revenue_min_ksek: z.number().optional().describe("Minimum annual revenue in thousands of SEK"),
      has_domain: z.boolean().optional().describe("Only companies with a resolved website domain"),
      maturity_min: z.number().min(0).max(4).optional().describe("Minimum data/AI maturity band. Populated on under 1% of the library, so this filter is narrow by nature"),
      name_like: z.string().optional().describe("Case-insensitive substring match on company name"),
      project: z.string().optional().describe("Workspace/project id, e.g. novalo, alto, norway"),
      order_by: z.enum(["icp_score", "employees", "revenue_ksek", "name"]).default("icp_score"),
      limit: z.number().min(1).max(200).default(25),
    },
    async (a) => {
      try {
        const q = [`select=${CO_COLS}`];
        if (a.country) q.push(`country=eq.${a.country}`);
        if (a.cloud) q.push(`cloud_provider=eq.${a.cloud}`);
        if (a.aws_detected === true) q.push("aws_detected=is.true");
        if (a.icp_min != null) q.push(`icp_score=gte.${a.icp_min}`);
        if (a.icp_max != null) q.push(`icp_score=lte.${a.icp_max}`);
        if (a.employees_min != null) q.push(`employees=gte.${a.employees_min}`);
        if (a.employees_max != null) q.push(`employees=lte.${a.employees_max}`);
        if (a.revenue_min_ksek != null) q.push(`revenue_ksek=gte.${a.revenue_min_ksek}`);
        if (a.has_domain === true) q.push("domain=not.is.null", "domain=neq.");
        if (a.maturity_min != null) q.push(`maturity_band=gte.${a.maturity_min}`);
        if (a.name_like) q.push(`name=ilike.*${encodeURIComponent(a.name_like)}*`);
        if (a.project) q.push(`project_id=eq.${a.project}`);
        q.push(`order=${a.order_by || "icp_score"}.desc.nullslast`);
        q.push(`limit=${a.limit || 25}`);
        const rows = await rest(`companies?${q.join("&")}`);
        return ok({ count: Array.isArray(rows) ? rows.length : 0, rows });
      } catch (e) { return err(e); }
    },
  );

  server.tool(
    "alloy_account_contacts",
    "DESK ONLY. Contacts held for a company: name, title, email, phone, and which source supplied the row. Use when preparing a call or a first-touch draft. Not exposed to partner tenants: roughly 91.6% of these rows came from a Vainu trial and are used by the founder at his own desk pending a licence decision, so do not paste the contents into anything a tenant reads.",
    {
      company_id: z.string().optional().describe("Alloy company id. Use this when you already have the row from alloy_query_corpus"),
      domain: z.string().optional().describe("Website domain, if the company id is not to hand"),
      limit: z.number().min(1).max(50).default(20),
    },
    async ({ company_id, domain, limit = 20 }) => {
      try {
        let cid = company_id;
        if (!cid && domain) {
          const hit = await rest(`companies?select=id,name&domain=eq.${encodeURIComponent(domain.replace(/^www\./, ""))}&limit=1`);
          if (!Array.isArray(hit) || !hit.length) return ok(`No company in the corpus for domain ${domain}.`);
          cid = hit[0].id;
        }
        if (!cid) return err(new Error("Give either company_id or domain."));
        const rows = await rest(`contacts?select=${CONTACT_COLS}&company_id=eq.${cid}&limit=${limit}`);
        return ok({ company_id: cid, count: Array.isArray(rows) ? rows.length : 0, contacts: rows });
      } catch (e) { return err(e); }
    },
  );

  server.tool(
    "alloy_pipeline",
    "DESK ONLY. The live engagement pipeline: which accounts sit at which stage, per workspace, with the next action and when it is due. Use for 'what is in flight', 'what needs me today', or to check an account's stage before drafting. Reads engagements, which are private per workspace, unlike the shared company library.",
    {
      tenant: z.string().optional().describe("Workspace id, e.g. novalo, alto, forj"),
      stage: z.string().optional().describe("Stage slug, e.g. mote_bokat, kontaktad, forslag, vunnen, ny, lead"),
      due_before: z.string().optional().describe("ISO date. Returns engagements whose next_action_at falls before this, i.e. what is overdue or due soon"),
      limit: z.number().min(1).max(200).default(50),
    },
    async ({ tenant, stage, due_before, limit = 50 }) => {
      try {
        const q = ["select=id,tenant_id,company_id,stage,next_action,next_action_at,owner,opp_value,updated_at"];
        if (tenant) q.push(`tenant_id=eq.${tenant}`);
        if (stage) q.push(`stage=eq.${stage}`);
        if (due_before) q.push(`next_action_at=lt.${due_before}`);
        q.push("order=updated_at.desc", `limit=${limit}`);
        const rows = await rest(`engagements?${q.join("&")}`);
        return ok({ count: Array.isArray(rows) ? rows.length : 0, engagements: rows });
      } catch (e) { return err(e); }
    },
  );

  return server;
}
