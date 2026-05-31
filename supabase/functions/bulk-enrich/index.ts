// Bulk enrichment for AWS-detected companies, qualified ICP leads, cloud_fill, and
// the Data & AI innovation deep scan. Cost/error-optimized; resumable (processed rows
// drop out of the selection — no offset drift).
//
// Body: { project_id?, limit?(<=15), force?, refresh_cloud?,
//         cohort?: "aws"|"icp_leads"|"cloud_fill"|"innovation",
//         min_icp?, cloud_only?, source?, ids?: string[] }
// Auth: service-role Bearer (verify_jwt=true).
import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (o: unknown, status = 200) =>
  new Response(JSON.stringify(o), { status, headers: { ...cors, "Content-Type": "application/json" } });

const PROXY_MODEL = "claude-sonnet-4-5";
const baseUrl = () => Deno.env.get("SUPABASE_URL")!;
const svcKey = () => Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LEGACY_ANON_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52aml6YWh0Y3FnbWZoaW9kdGVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5ODk0NDMsImV4cCI6MjA5NTU2NTQ0M30.G0gf0z0wg9RQqsyZcEBXPYJ1YVeTe_NOULtDAEI2xEA";
const gatewayJwt = () => Deno.env.get("ALLOY_GATEWAY_JWT") || LEGACY_ANON_JWT;

async function fetchT(url: string, init: RequestInit = {}, ms = 60000): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try { return await fetch(url, { ...init, signal: ctrl.signal }); }
  finally { clearTimeout(t); }
}
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

const normDomain = (d: string) =>
  String(d || "").trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/+$/, "").replace(/\/.*$/, "");

function extractJSON(text: string): any {
  const t = (text || "").replace(/```json\s*/gi, "").replace(/```/g, "").trim();
  const s = t.indexOf("{"), e = t.lastIndexOf("}");
  if (s === -1 || e === -1) throw new Error("no JSON in model output");
  return JSON.parse(t.slice(s, e + 1));
}
const textOf = (msg: any) => (msg?.content || []).filter((b: any) => b.type === "text").map((b: any) => b.text).join("\n");

// One classify call from the deterministic fingerprint (web-tech path).
async function classifyTech(domain: string, fp: any): Promise<any> {
  const compact = {
    generator: fp.generator || "", globals: fp.globals || [], headers: fp.headers || {},
    script_hosts: (fp.script_hosts || []).slice(0, 25), link_hosts: (fp.link_hosts || []).slice(0, 15), iframe_hosts: (fp.iframe_hosts || []).slice(0, 10),
  };
  const user =
`Classify the web + data/AI tech stack of ${domain} from this fingerprint surface (script/link/iframe hosts, response headers, meta generator, detected JS globals):
${JSON.stringify(compact)}

Map evidence to categories:
- ramverk frameworks (Next.js, React, Vue, Gatsby via generator); cms (WordPress, Shopify, Sitevision, Payload); analys plain web analytics (GA4/gtag, Matomo, Hotjar); widgets (Cookiebot, Intercom, HubSpot); cdn (Cloudflare, CloudFront, Fastly, Akamai); hosting (Vercel, Netlify, S3, Azure via server header); dns; epost; server (nginx/apache/php via server header); typsnitt (Google Fonts, Tailwind).
- datadriven CDP & product analytics: window.analytics/cdn.segment.com=Segment, rudderanalytics=RudderStack, snowplow, window.amplitude=Amplitude, window.mixpanel=Mixpanel, window.heap=Heap, window.posthog=PostHog. (Plain GA4/gtag stays in 'analys'.)
- sok site search: algolia, coveo, klevu, loop54.
- baas: supabase, firebase.
- genai_ui browser GenAI: vercel-ai-sdk, copilotkit, streamlit, gradio, chainlit, huggingface.
Report a tool ONLY if the fingerprint shows it. Do not guess or add bare programming languages. The globals list names detected fingerprints directly.

Respond ONLY with JSON: {"items":[{"category":"<one of: ramverk|cms|datadriven|sok|baas|genai_ui|analys|widgets|cdn|hosting|dns|epost|server|typsnitt>","name":"<tech name>"}],"behind_proxy":false,"note":"<short>"}`;
  const body = { task: "techstack", model: PROXY_MODEL, max_tokens: 1200, messages: [{ role: "user", content: user }] };
  return extractJSON(textOf(await proxyWithBackoff(body)));
}

// --- DATA & AI INNOVATION (deep scan) — ported from forge.jsx analyzeInnovation+scoreMaturity ---
const INNOVATION_CATEGORIES: Record<string, number> = {
  genai_build: 4, vector_db: 4, mlops: 4, genai_app: 4,
  warehouse: 3, table_format: 3, elt_streaming: 3, orchestration: 3, enterprise_bi: 3,
  cdp: 2, product_analytics: 2, baas: 2,
  database: 1, nocode_automation: 1, identity: 1, web_analytics: 1,
  ai_intent: 0,
};
const BAND4 = ["genai_build", "vector_db", "mlops", "genai_app"];
const MATURITY_BANDS = ["Unknown", "Baseline", "Analytics-aware", "Modern data stack", "GenAI-native"];
const AWS_ALIGN_HINTS: [string, RegExp][] = [
  ["aws", /\b(bedrock|sagemaker|redshift|aurora|athena|glue|lake formation|\baws\b|hopsworks|amazon)\b/i],
  ["azure", /\b(azure|synapse|microsoft fabric|onelake|power bi|entra|cosmos ?db)\b/i],
  ["gcp", /\b(bigquery|big query|vertex|google cloud|gcs|looker|bigtable|gke)\b/i],
];
function scoreMaturity(signals: any[]) {
  const named = (signals || []).filter((s) => s && s.tool && s.category && s.category !== "ai_intent");
  const genai = named.filter((s) => BAND4.includes(s.category));
  const ai_native = genai.length >= 2; // require >=2 corroborating band-4 signals
  let band = 0;
  for (const s of named) {
    let b = INNOVATION_CATEGORIES[s.category] || 0;
    if (b === 4 && !ai_native) b = 3;
    if (b > band) band = b;
  }
  const tally: Record<string, number> = { aws: 0, azure: 0, gcp: 0 };
  for (const s of named) { const hay = s.tool + " " + (s.evidence_quote || ""); for (const [k, re] of AWS_ALIGN_HINTS) if (re.test(hay)) tally[k]++; }
  const top = Object.entries(tally).sort((a, b) => b[1] - a[1]);
  let aws_alignment = "unknown";
  if (top[0][1] > 0) aws_alignment = top[1][1] === top[0][1] ? "mixed" : top[0][0];
  return { maturity_band: band, ai_native, aws_alignment };
}
async function analyzeInnovation(name: string, domain: string): Promise<any> {
  const cats = Object.keys(INNOVATION_CATEGORIES).join("|");
  const user =
`Research the DATA, AI and AUTOMATION tooling of this company to read its digitalization maturity.
COMPANY: ${name}${domain ? " (" + domain + ")" : ""}

Use web search across these channels (most data/AI tools are backend — look here, not just the site):
- Job ads / careers page / LinkedIn (strongest: "Data Engineer — Snowflake, dbt, Airflow", "ML Engineer — LangChain, vector DB")
- Engineering blog, conference talks, public GitHub (requirements.txt, package.json, pyproject.toml, docker-compose, terraform)
- The company website itself (browser-visible tools: Segment, Amplitude, Algolia, Streamlit/Gradio demos)

For EVERY tool you report you MUST have actually seen it named in a fetched page or search snippet, and you MUST give the verbatim quote + the source URL. If you can't cite it, leave it out. Do NOT infer tools from the industry or peers. Generic words like "AI"/"GenAI"/"LLM"/"RAG" are NOT tools — put them in ai_intent. Do NOT report bare programming languages.

Classify each tool's category as one of: ${cats}. Be STRICT — category drives a maturity score, so do not inflate:
- genai_build = LLM/agent frameworks ONLY (LangChain, LlamaIndex, Semantic Kernel, Bedrock Agents, Haystack, CrewAI). vector_db = Pinecone/Weaviate/Qdrant/pgvector/Chroma/Milvus. genai_app = a shipped LLM app (Streamlit/Gradio/Chainlit/Vercel AI SDK/CopilotKit). mlops = REAL ML/MLOps ONLY (SageMaker, Vertex AI, Azure ML, MLflow, Kubeflow, W&B, Hugging Face, Databricks ML). These are Band 4 — never put generic cloud/infra/DevOps here.
- warehouse = Snowflake/BigQuery/Redshift/Databricks/Synapse/ClickHouse. elt_streaming = dbt/Fivetran/Airbyte/Kafka/Flink. orchestration = Airflow/Dagster/Prefect/Temporal. enterprise_bi = Power BI/Tableau/Looker/Qlik. (Band 3.)
- cdp = Segment/RudderStack/Snowplow; product_analytics = Amplitude/Mixpanel/Heap/PostHog; baas = Supabase/Firebase. (Band 2.)
- database = Postgres/MySQL/Mongo/DynamoDB/Redis/Yardi; identity = Okta/Entra/BankID/e-ID; nocode_automation = Zapier/Make/Power Automate; web_analytics = GA4/Matomo/Hotjar/SendGrid/WordPress/CMS/web frameworks. (Band 1.)
- IMPORTANT exclusions — OMIT these entirely (infra, not data/AI maturity): bare cloud/hosting (AWS, Azure, GCP, Vercel-as-hosting), IaC/DevOps (Terraform, Docker, Kubernetes, CloudFormation, Ansible), observability/APM (New Relic, Datadog, Grafana, Sentry). A cloud name only feeds aws_alignment, derived separately — you don't need to report it.
Set channel to where you found it: job_ad | blog | github | frontend.

Respond ONLY with JSON in exactly this shape:
{"signals":[{"tool":"<exact product name>","category":"<one category>","channel":"<channel>","evidence_quote":"<≤20-word verbatim quote>","source_url":"<url you saw it on>","confidence":"<high|medium|low>"}],
"ai_intent":["<generic AI/data phrase you saw, if any>"],
"note":"<≤20 words: what you could/couldn't verify>"}`;
  const body = { task: "innovation", model: PROXY_MODEL, max_tokens: 1800,
    tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 4 }],
    messages: [{ role: "user", content: user }] };
  const j = extractJSON(textOf(await proxyWithBackoff(body, 90000)));
  const signals = (Array.isArray(j.signals) ? j.signals : []).filter(
    (s: any) => s && s.tool && s.category && /^https?:\/\//i.test(String(s.source_url || "")),
  );
  return { signals, ai_intent: Array.isArray(j.ai_intent) ? j.ai_intent : [], note: j.note || "",
    ...scoreMaturity(signals), analyzed_at: new Date().toISOString() };
}

// claude-proxy call with 429 backoff (org input-token/min).
async function proxyWithBackoff(body: any, ms = 60000): Promise<any> {
  const WAITS = [15000, 30000, 45000];
  for (let attempt = 0; ; attempt++) {
    try { return await edge("claude-proxy", body, ms); }
    catch (e) {
      const msg = String((e as Error).message || e);
      if (msg.includes("429") && attempt < WAITS.length) { await new Promise((r) => setTimeout(r, WAITS[attempt])); continue; }
      throw e;
    }
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  const sb = createClient(baseUrl(), svcKey());
  let body: any = {};
  try { body = await req.json(); } catch { /* empty ok */ }
  const project_id = typeof body.project_id === "string" ? body.project_id : null;
  const limit = Math.min(Math.max(Number(body.limit) || 8, 1), 15);
  const force = body.force === true;
  const refreshCloud = body.refresh_cloud === true;
  const cohort = ["icp_leads", "cloud_fill", "innovation"].includes(body.cohort) ? body.cohort : "aws";
  const minIcp = Number(body.min_icp) || 70;
  const cloudOnly = body.cloud_only === true;
  const source = typeof body.source === "string" ? body.source : null;
  const ids = Array.isArray(body.ids) ? body.ids.filter((x: any) => typeof x === "string") : null;

  const applyCohort = (qq: any) => {
    if (ids && ids.length) { qq = qq.in("id", ids); return qq; }
    // Exclude quarantined junk (Sweden 500 etc.) from EVERY cohort. Null-safe form
    // (plain .neq would drop NULL list_tag rows); chained .or() AND-combines in supabase-js.
    qq = qq.or("list_tag.is.null,list_tag.neq.archived_shell");
    if (cohort === "innovation") {
      qq = qq.eq("stage", "lead").not("domain", "is", null);
      if (!force) qq = qq.is("innovation", null);
      if (project_id) qq = qq.eq("project_id", project_id);
      if (body.min_icp) qq = qq.gte("icp_score", minIcp);
    } else if (cohort === "icp_leads") {
      const orClause = cloudOnly ? "cloud_provider.is.null,cloud_provider.eq.unknown"
        : "cloud_provider.is.null,cloud_provider.eq.unknown,techstack.is.null";
      qq = qq.eq("stage", "lead").gte("icp_score", minIcp).not("domain", "is", null).or(orClause);
      if (project_id) qq = qq.eq("project_id", project_id);
    } else if (cohort === "cloud_fill") {
      qq = qq.not("domain", "is", null).or("cloud_provider.is.null,cloud_provider.eq.unknown");
      if (project_id) qq = qq.eq("project_id", project_id);
      if (source) qq = qq.eq("source", source);
    } else {
      qq = qq.eq("aws_detected", true).not("domain", "is", null);
      if (project_id) qq = qq.eq("project_id", project_id);
      if (!force) qq = qq.is("techstack", null);
    }
    return qq;
  };

  const { data: rows, error } = await applyCohort(
    sb.from("companies").select("id, name, domain, cloud_provider, aws_signals, aws_detected, techstack, innovation"),
  ).order("id", { ascending: true }).limit(limit);
  if (error) return json({ error: error.message }, 500);
  let remaining = 0;
  { const { count } = await applyCohort(sb.from("companies").select("id", { count: "exact", head: true })); remaining = count || 0; }

  const report: any[] = [];
  let enriched = 0, clouds = 0, errors = 0;
  for (const row of (rows || [])) {
    const domain = normDomain(row.domain);
    const rec: any = { id: row.id, name: row.name, domain };

    // INNOVATION cohort: deep scan only (no cloud/tech).
    if (cohort === "innovation") {
      if (!row.name && !domain) { rec.skip = "no name/domain"; report.push(rec); continue; }
      try {
        const innov = await analyzeInnovation(row.name || "", domain);
        await sb.from("companies").update({
          innovation: innov, innovation_at: innov.analyzed_at,
          maturity_band: innov.maturity_band, ai_native: innov.ai_native, aws_alignment: innov.aws_alignment,
        }).eq("id", row.id);
        try {
          if (innov.signals.length) {
            await sb.from("company_signals").insert(innov.signals.map((s: any) => ({
              company_id: row.id, tool: s.tool, category: s.category, channel: s.channel,
              evidence_quote: s.evidence_quote || null, source_url: s.source_url || null, confidence: s.confidence || null,
            })));
          }
        } catch { /* evidence write is best-effort */ }
        rec.signals = innov.signals.length; rec.band = innov.maturity_band; rec.ai_native = innov.ai_native; rec.aws_alignment = innov.aws_alignment;
        enriched++; remaining = Math.max(0, remaining - 1);
      } catch (e) { rec.error = String((e as Error).message || e).slice(0, 140); errors++; }
      report.push(rec);
      continue;
    }

    // Cloud + tech cohorts.
    if (!domain) { rec.skip = "no domain"; report.push(rec); continue; }
    try {
      const needCloud = refreshCloud || !row.cloud_provider || row.cloud_provider === "unknown" || !row.aws_signals;
      if (needCloud) {
        try {
          const cd = await edge("cloud-detect", { domains: [domain] }, 70000);
          const r0 = (cd.report || [])[0];
          if (r0 && r0.provider && r0.provider !== "error") {
            const patch: any = { cloud_provider: r0.provider };
            if (Array.isArray(r0.services) && r0.services.length) patch.aws_signals = (r0.services.join(", ")).slice(0, 200);
            else if (Array.isArray(r0.asns) && r0.asns.length) patch.aws_signals = ("ASN " + r0.asns.join(", ")).slice(0, 200);
            await sb.from("companies").update(patch).eq("id", row.id);
            rec.cloud = r0.provider; clouds++;
          }
        } catch (e) { rec.cloud_err = String((e as Error).message || e).slice(0, 100); }
      }
      const needTech = !cloudOnly && (force || !row.techstack);
      if (needTech) {
        const fp = await edge("web-fetch", { url: "https://" + domain, mode: "tech" }, 30000);
        if (fp && fp.note && /non-text/i.test(fp.note)) { rec.skip = "non-text"; report.push(rec); continue; }
        const cls = await classifyTech(domain, fp || {});
        const items = Array.isArray(cls.items) ? cls.items.filter((i: any) => i && i.name && i.category) : [];
        const techstack = { items, behind_proxy: !!cls.behind_proxy, note: cls.note || "", analyzed_at: new Date().toISOString(), url: domain, source: "bulk-enrich" };
        await sb.from("companies").update({ techstack, techstack_at: techstack.analyzed_at }).eq("id", row.id);
        rec.items = items.length;
      } else { rec.tech = row.techstack ? "kept" : "skipped"; }
      enriched++; remaining = Math.max(0, remaining - 1);
    } catch (e) { rec.error = String((e as Error).message || e).slice(0, 140); errors++; }
    report.push(rec);
  }

  return json({
    summary: { project_id: project_id || "all", cohort, cloud_only: cloudOnly, batch: (rows || []).length, enriched, clouds_refreshed: clouds, errors, remaining_after: remaining },
    report,
  });
});
