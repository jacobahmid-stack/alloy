// AWS-discovery agent: finds Swedish companies on AWS and writes them to the
// aws_discovery_candidates review queue (NEVER directly to companies).
//
// Flow per run:
//   1. Claude tool-use agent (via claude-proxy, task="research") searches one
//      "angle" (AWS case study / job ad / broad web) and returns candidate companies.
//   2. For each candidate with a domain: verify on AWS via aws-origin-detect.
//   3. Dedup against companies (by lower(domain)) + existing pending candidates.
//   4. Insert survivors into aws_discovery_candidates (status='pending').
//
// Body: { angle?: "case_study"|"job_ad"|"web_search", query?: string,
//         max?: number (cap candidates, default 12), mode?: "peek"|"run" (default "run") }
// Auth: service-role Bearer (verify_jwt=true). Report-only unless mode="run".
import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (o: unknown, status = 200) =>
  new Response(JSON.stringify(o), { status, headers: { ...cors, "Content-Type": "application/json" } });

const PROXY_MODEL = "claude-sonnet-4-5";
const MAX_STEPS = 4; // fewer round-trips => less token pressure on the org/min limit

function baseUrl(): string { return Deno.env.get("SUPABASE_URL")!; }
function svcKey(): string { return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!; }
// Gateway auth for sibling function calls: must be a LEGACY anon JWT.
// This project is on the new API-key system, so BOTH injected env keys are
// non-JWT (sb_secret_* / sb_publishable_*) and a verify_jwt=true gateway rejects
// them with INVALID_JWT_FORMAT. The legacy anon JWT below is a PUBLIC client key
// (already shipped in the browser bundle) — safe to embed; override via env if rotated.
const LEGACY_ANON_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52aml6YWh0Y3FnbWZoaW9kdGVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5ODk0NDMsImV4cCI6MjA5NTU2NTQ0M30.G0gf0z0wg9RQqsyZcEBXPYJ1YVeTe_NOULtDAEI2xEA";
function gatewayJwt(): string { return Deno.env.get("ALLOY_GATEWAY_JWT") || LEGACY_ANON_JWT; }

async function fetchT(url: string, init: RequestInit = {}, ms = 20000): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try { return await fetch(url, { ...init, signal: ctrl.signal }); }
  finally { clearTimeout(t); }
}

// Call a sibling edge function with the service-role key.
async function edge(path: string, payload: unknown, ms = 60000): Promise<any> {
  const jwt = gatewayJwt();
  const r = await fetchT(`${baseUrl()}/functions/v1/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer " + jwt, "apikey": jwt },
    body: JSON.stringify(payload),
  }, ms);
  const txt = await r.text();
  if (!r.ok) throw new Error(`${path} ${r.status}: ${txt.slice(0, 160)}`);
  const j = JSON.parse(txt);
  if (j && j.error) throw new Error(`${path}: ${JSON.stringify(j.error).slice(0, 160)}`);
  return j;
}

// Full Claude message via claude-proxy (task="research" => proxy owns the system prompt).
// Retries on 429 (org input-token-per-minute limit) with backoff — web_search
// results are token-heavy and a multi-step run can briefly exceed the minute budget.
async function claude(messages: any[], tools?: any[], maxTokens = 1500): Promise<any> {
  const body: any = { task: "research", model: PROXY_MODEL, max_tokens: maxTokens, messages };
  if (tools) body.tools = tools;
  const WAITS = [20000, 40000, 60000];
  for (let attempt = 0; ; attempt++) {
    try { return await edge("claude-proxy", body, 90000); }
    catch (e) {
      const msg = String((e as Error).message || e);
      if (msg.includes("429") && attempt < WAITS.length) {
        await new Promise((r) => setTimeout(r, WAITS[attempt]));
        continue;
      }
      throw e;
    }
  }
}

const normDomain = (d: string) =>
  String(d || "").trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "");

// Per-cloud copy so each angle prompt names the right provider, services, and sources.
const CLOUDS: Record<string, { name: string; svc: string; sources: string; caseUrl: string }> = {
  aws: { name: "Amazon Web Services (AWS)", svc: "AWS, EC2, Lambda, ECS, S3", sources: "aws.amazon.com/solutions/case-studies", caseUrl: "AWS's own customer references / case studies" },
  gcp: { name: "Google Cloud (GCP)", svc: "GCP, GKE, BigQuery, Cloud Run, GCS", sources: "cloud.google.com/customers", caseUrl: "Google Cloud's own customer references / case studies" },
  azure: { name: "Microsoft Azure", svc: "Azure, AKS, Azure Functions, Blob Storage, Cosmos DB", sources: "microsoft.com/en/customers and azure.microsoft.com", caseUrl: "Microsoft's own Azure customer references / case studies" },
};
function angleText(cloud: string, key: string): string {
  const c = CLOUDS[cloud] || CLOUDS.aws;
  if (key === "job_ad")
    return `Find Swedish companies hiring for ${c.name} skills RIGHT NOW. Search job ads (LinkedIn, indeed.se, academicwork.se, thehub.io) that explicitly mention ${c.svc} or a ${c.name} certification. A current ${c.name} job ad is strong evidence the company runs on it. Only Swedish companies / Swedish job locations.`;
  if (key === "web_search")
    return `Find Swedish companies that run on ${c.name}, searching broadly by industry (fintech, e-commerce, SaaS, gaming, healthtech, industri) and region. Use engineering blogs, status pages, GitHub, and tech talks as evidence they use ${c.name}. Only companies with a real Swedish presence.`;
  // default: case_study
  return `Find Swedish companies that are confirmed ${c.name} customers. Prioritise ${c.caseUrl} (${c.sources}) and credible news about ${c.name} migrations or launches in Sweden/Nordics. Only include companies with a real Swedish presence (HQ or major operations in Sweden).`;
}

const TOOLS = [
  { type: "web_search_20250305", name: "web_search", max_uses: 2 },
  { name: "fetch_page", description: "Fetch the readable text of a web page (server-side, no CORS). Use to read a case study, job ad, or about page surfaced via web_search.",
    input_schema: { type: "object", properties: { url: { type: "string", description: "Full http(s) URL" } }, required: ["url"] } },
];

function buildPrompt(cloud: string, key: string, max: number, extra: string): string {
  const c = CLOUDS[cloud] || CLOUDS.aws;
  return (
`You are a prospecting researcher building a list of SWEDISH companies that run on ${c.name}.

GOAL: ${angleText(cloud, key)}
${extra ? "EXTRA FOCUS: " + extra + "\n" : ""}
Use web_search and fetch_page to ground every company in real evidence. Quote the source.
Rules:
- Swedish presence is required (HQ or significant operations in Sweden).
- ${c.name} evidence is required: a case study, a current job ad, an engineering blog, a status page, or visible infra. No guessing — if you can't evidence ${c.name}, leave it out.
- Prefer companies likely NOT already in a typical Swedish cloud-partner CRM (avoid the absolute giants if smaller, reachable companies fit).
- Find up to ${max} companies. Quality over quantity.

When done, respond ONLY with JSON, no other text, in exactly this shape:
{"companies":[{
  "name":"<legal or common name>",
  "domain":"<registered domain, no http/www, or empty>",
  "city":"<Swedish city or empty>",
  "industry":"<short industry or empty>",
  "cloud_evidence":"<max 25 words: how you know they're on ${c.name} + the source>",
  "swedish_evidence":"<max 15 words: how you know they're Swedish>",
  "source_urls":["<url>","<url>"]
}]}`
  );
}

const textOf = (msg: any) => (msg?.content || []).filter((b: any) => b.type === "text").map((b: any) => b.text).join("\n");
function extractJSON(text: string): any {
  const t = (text || "").replace(/```json\s*/gi, "").replace(/```/g, "").trim();
  const s = t.indexOf("{"), e = t.lastIndexOf("}");
  if (s === -1 || e === -1) throw new Error("no JSON in agent output");
  return JSON.parse(t.slice(s, e + 1));
}

// Keep the running transcript well under claude-proxy's MAX_INPUT_CHARS (120k).
// The bulk comes from two block types that pile up across steps:
//   - user `tool_result` blocks (our fetch_page pages)
//   - assistant `web_search_tool_result` blocks (server-side search results,
//     echoed back inside the assistant turn each round)
// We keep only the most recent turn of each in full; older ones are stubbed to a
// placeholder while preserving block type + ids so tool pairing stays valid.
const TOOL_RESULT_CAP = 2500;
const KEEP_RESULT_TURNS = 1;
const stubBlock = (b: any) => {
  if (b?.type === "tool_result") return { ...b, content: "[older page omitted]" };
  if (b?.type === "web_search_tool_result") return { ...b, content: [] };
  return b;
};
function trimHistory(messages: any[]): any[] {
  let resultTurns = 0, searchTurns = 0;
  const out: any[] = [];
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    const arr = Array.isArray(m.content) ? m.content : null;
    if (m.role === "user" && arr && arr.some((b: any) => b?.type === "tool_result")) {
      resultTurns++;
      if (resultTurns > KEEP_RESULT_TURNS) { out.unshift({ ...m, content: arr.map(stubBlock) }); continue; }
    } else if (m.role === "assistant" && arr && arr.some((b: any) => b?.type === "web_search_tool_result")) {
      searchTurns++;
      if (searchTurns > KEEP_RESULT_TURNS) { out.unshift({ ...m, content: arr.map(stubBlock) }); continue; }
    }
    out.unshift(m);
  }
  return out;
}

// Tool-use loop: only fetch_page runs here; web_search runs server-side at Anthropic.
async function runAgent(prompt: string): Promise<any[]> {
  const messages: any[] = [{ role: "user", content: prompt }];
  for (let step = 0; step < MAX_STEPS; step++) {
    const msg = await claude(trimHistory(messages), TOOLS, 2000);
    messages.push({ role: "assistant", content: msg.content || [] });
    const calls = (msg.content || []).filter((b: any) => b.type === "tool_use" && b.name === "fetch_page");
    if (msg.stop_reason !== "tool_use" || calls.length === 0) {
      return extractJSON(textOf(msg)).companies || [];
    }
    const results: any[] = [];
    for (const call of calls) {
      let out: any, isErr = false;
      try { out = await edge("web-fetch", { url: call.input?.url }); }
      catch (e) { out = { error: String((e as Error).message || e) }; isErr = true; }
      results.push({ type: "tool_result", tool_use_id: call.id, content: JSON.stringify(out).slice(0, TOOL_RESULT_CAP), is_error: isErr });
    }
    messages.push({ role: "user", content: results });
  }
  // out of steps: force a final answer
  const fin = await claude(trimHistory([...messages, { role: "user", content: "Stop searching. Answer now with the required JSON only." }]), undefined, 2000);
  return extractJSON(textOf(fin)).companies || [];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  const sb = createClient(baseUrl(), svcKey());
  let body: any = {};
  try { body = await req.json(); } catch { /* empty ok */ }
  const ANGLE_KEYS = ["case_study", "job_ad", "web_search"];
  const angle = (typeof body.angle === "string" && ANGLE_KEYS.includes(body.angle)) ? body.angle : "case_study";
  const targetCloud = (typeof body.target_cloud === "string" && CLOUDS[body.target_cloud]) ? body.target_cloud : "aws";
  const max = Math.min(Number(body.max) || 12, 25);
  const mode = body.mode === "peek" ? "peek" : "run";
  const query = typeof body.query === "string" ? body.query.slice(0, 200) : "";

  let found: any[];
  try {
    found = await runAgent(buildPrompt(targetCloud, angle, max, query));
  } catch (e) {
    return json({ error: "agent: " + String((e as Error).message || e) }, 200);
  }
  if (!Array.isArray(found)) found = [];

  // Normalise + intra-batch dedup by domain (fallback to name when no domain).
  const seen = new Set<string>();
  const cands = found.map((c: any) => ({
    name: String(c.name || "").trim(),
    domain: normDomain(c.domain || ""),
    city: String(c.city || "").trim() || null,
    industry: String(c.industry || "").trim() || null,
    aws_evidence: String(c.cloud_evidence || c.aws_evidence || "").slice(0, 300),
    swedish_evidence: String(c.swedish_evidence || "").slice(0, 200),
    source_urls: Array.isArray(c.source_urls) ? c.source_urls.slice(0, 5).map((u: any) => String(u).slice(0, 300)) : [],
  })).filter((c) => {
    if (!c.name) return false;
    const k = c.domain || ("name:" + c.name.toLowerCase());
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  // Dedup against existing companies (by lower(domain)) and pending candidates.
  const domains = cands.map((c) => c.domain).filter(Boolean);
  const existingCompanyByDomain = new Map<string, string>();
  if (domains.length) {
    const { data } = await sb.from("companies").select("id, domain").not("domain", "is", null);
    for (const row of (data || [])) {
      const d = normDomain((row as any).domain);
      if (d) existingCompanyByDomain.set(d, (row as any).id);
    }
  }
  const pendingDomains = new Set<string>();
  {
    const { data } = await sb.from("aws_discovery_candidates")
      .select("domain").in("status", ["pending", "approved"]).not("domain", "is", null);
    for (const row of (data || [])) { const d = normDomain((row as any).domain); if (d) pendingDomains.add(d); }
  }

  const report = { new: [] as any[], dup_company: [] as any[], dup_pending: [] as any[], no_domain: [] as any[] };
  const toVerify: any[] = [];
  for (const c of cands) {
    if (!c.domain) { report.no_domain.push(c); continue; }
    if (existingCompanyByDomain.has(c.domain)) { report.dup_company.push({ ...c, dup_of: existingCompanyByDomain.get(c.domain) }); continue; }
    if (pendingDomains.has(c.domain)) { report.dup_pending.push(c); continue; }
    toVerify.push(c);
  }

  // Verify cloud for fresh, domain-bearing candidates via cloud-detect (one domain
  // per call — single-domain stays under the runtime CPU limit). A candidate "matches"
  // when the detected provider equals the cloud we searched for; otherwise we keep the
  // agent's assertion but flag the mismatch (still useful — it's on *some* cloud).
  for (const c of toVerify) {
    let detected = "unverified", confidence = "asserted", services: string[] = [], providers: any = {};
    try {
      const v = await edge("cloud-detect", { domains: [c.domain] }, 70000);
      const r0 = (v.report || [])[0];
      if (r0 && r0.provider) {
        detected = r0.provider;
        confidence = r0.provider === targetCloud ? (r0.confidence || "medium") : "asserted";
        services = r0.services || [];
        providers = r0.providers || {};
      }
    } catch { /* keep asserted */ }
    // verdict mirrors the OLD aws_verdict semantics but generalised: equals targetCloud
    // when the verifier confirmed it, else 'none' (detected another cloud) / 'unverified'.
    const verdict = detected === targetCloud ? targetCloud : (detected === "unverified" ? "unverified" : "none");
    report.new.push({
      ...c,
      target_cloud: targetCloud,
      detected_provider: detected,
      cloud_verdict: verdict,
      cloud_confidence: confidence,
      cloud_services: services,
      cloud_providers: providers,
    });
  }

  let inserted = 0;
  if (mode === "run" && report.new.length) {
    // Insert one row at a time: the unique index is a partial expression index on
    // lower(domain) (not a PostgREST-usable conflict target), so a true race could
    // raise a unique violation — isolate it per row so one dup can't drop the batch.
    for (const c of report.new) {
      const row = {
        name: c.name, domain: c.domain, city: c.city, industry: c.industry, country: "SE",
        target_cloud: c.target_cloud, detected_provider: c.detected_provider,
        // aws_* columns reused generically to hold the detected provider's verdict/details
        aws_verdict: c.cloud_verdict, aws_confidence: c.cloud_confidence, aws_services: c.cloud_services,
        aws_evidence: c.cloud_providers, discovery_method: angle,
        discovery_evidence: [c.aws_evidence, c.swedish_evidence].filter(Boolean).join(" | "),
        source_urls: c.source_urls, status: "pending",
      };
      const { error } = await sb.from("aws_discovery_candidates").insert(row);
      if (error) { c.insert_error = error.message; } else { inserted++; }
    }
  }

  return json({
    summary: {
      target_cloud: targetCloud, angle, mode, agent_found: cands.length,
      fresh: report.new.length, dup_company: report.dup_company.length,
      dup_pending: report.dup_pending.length, no_domain: report.no_domain.length,
      cloud_verified: report.new.filter((c) => c.cloud_verdict === targetCloud).length,
      inserted,
    },
    report,
  });
});
