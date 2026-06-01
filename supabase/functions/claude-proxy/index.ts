// HARDENED, task-bound claude-proxy. ANTHROPIC_API_KEY stays server-side.
// Client sends a `task`; proxy injects its OWN system prompt and ignores client system.
// Set STRICT_TASKS=true (env) before going public. AWS/Bedrock: only the upstream
// fetch (endpoint+auth) changes; this policy carries over.
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
function json(o: unknown, status = 200): Response {
  return new Response(JSON.stringify(o), { status, headers: { ...cors, "Content-Type": "application/json" } });
}
const ALLOWED_MODELS = new Set(
  (Deno.env.get("ALLOWED_MODELS") || "claude-sonnet-4-5,claude-haiku-4-5-20251001")
    .split(",").map((s) => s.trim()).filter(Boolean),
);
const MAX_TOKENS_CAP = Number(Deno.env.get("MAX_TOKENS_CAP") || 4096);
const MAX_MESSAGES = 30;
const MAX_INPUT_CHARS = 120000;
const MAX_TOOLS = 8;
const ALLOWED_SERVER_TOOL_TYPES = new Set(["web_search_20250305"]);
const STRICT_TASKS = (Deno.env.get("STRICT_TASKS") || "false").toLowerCase() === "true";

const TASK_SYSTEM: Record<string, string> = {
  lead: "You are an experienced sales engineer. You are honest: an 'unknown' is worth more than a slick guess. You always respond with valid JSON only, no surrounding text.",
  research: "You are an experienced, honest sales engineer. You ground claims with tools when useful and always respond with valid JSON only, no surrounding text.",
  outreach: "You write concise, senior, human B2B outreach. No hype, no buzzwords, no fake familiarity. You always respond with valid JSON only.",
  triage: "You are a sales manager doing a fast morning triage. You are decisive and specific. You always respond with valid JSON only.",
  techstack: "You are a web-technology analyzer in the style of BuiltWith/Wappalyzer. You fetch a given site and identify the tech stack from HTML, headers, script sources, DNS and known fingerprints — including data/AI maturity signals (customer data platforms & product analytics like Segment/RudderStack/Snowplow/Amplitude/Mixpanel/Heap/PostHog, site-search like Algolia, BaaS like Supabase/Firebase, and browser-visible GenAI artifacts like the Vercel AI SDK, CopilotKit, Streamlit/Gradio/Chainlit, or Hugging Face Spaces). Match by the exact JS global / request host / response header / DOM fingerprint, never the brand name alone — a wrong hit is worse than a miss. Do not report programming languages as products. You do not guess — you report only what you find evidence for. If a site sits behind Cloudflare/WAF and the stack can't be seen, say so. Respond ONLY with JSON, no other text.",
  find_domain: "You find the official primary website domain for a specific company. You use web search and match carefully on the company name AND its city/region (and org-nr if given) so you never grab a similarly named but different company. Return only the registered domain (e.g. 'example.se') — no protocol, no www, no path. If you can't find it with reasonable confidence, return an empty domain. Respond ONLY with valid JSON, no other text.",
  find_orgnr: "You find the Swedish organisation number (organisationsnummer, format NNNNNN-NNNN) for a SPECIFIC company, matching carefully on the company name AND its website domain so you never grab a different, similarly-named company. Use web search (allabolag.se, ratsit.se, the company's own site/imprint, Bolagsverket). The domain is the strongest signal — the org-nr must belong to the entity that owns that domain. Only return an org-nr you can verify with reasonable confidence; if unsure, return empty. Respond ONLY with valid JSON: {\"orgnr\":\"NNNNNN-NNNN or empty\",\"confidence\":\"high|med|low\"}. No other text.",
  find_contacts: "You research the key decision-makers at a company for B2B sales outreach (selling cloud/AWS services). You use web search to find real, current senior people — VD/CEO, CTO, IT-chef/Head of IT, Head of Digital, COO — who'd own a cloud/IT buying decision. Return only real public professional info: name, title, and LinkedIn URL if found. If the email pattern is visible, infer the likely address and mark it a guess. Respond ONLY with valid JSON, no other text.",
  brief_refine: "You refine a partner brief used by a sales team for AWS prospecting. The brief is fed into an AI that matches the partner against prospects — keep it tight, concrete and fact-based, no sales fluff.",
  smith_chat: "You are Smith, the AWS-funding-native sales co-worker inside the Alloy prospecting platform (built by Forj for AWS partners). You help the rep work their pipeline: answer questions about their accounts, suggest the next move, draft an opener or a short email, explain which AWS funding play fits (MAP migrate / MAP-Modernize / POC GenAI credits / Greenfield PGP / ISV Marketplace). GROUND every answer in the CONTEXT block the user provides (their real companies, funding tracks, contacts) — never invent a company, number, or contact that isn't in the context; if you don't have it, say so and suggest how to get it (e.g. 'open the card and run Find decision-makers'). You ADVISE, you do not act: never claim to have sent, saved, filed or changed anything. Be concise and concrete — a busy AE is reading. Plain text or short markdown, not JSON.",
  innovation: "You are a data & AI technology-stack researcher for B2B prospecting. You map a company's data, AI, and automation tooling to read their digitalization maturity. ABSOLUTE RULE: report ONLY tools you can cite from a page you actually fetched or a search result you actually saw — every tool MUST come with a verbatim evidence quote and the source URL it came from. If you cannot cite it, omit it. NEVER infer a tool from absence, from the industry, or from what a similar company uses. Generic buzzwords ('AI', 'GenAI', 'LLM', 'RAG', 'machine learning', 'data-driven') are category-level intent, NOT a tool — record them as ai_intent, never as a named tool. Most data/AI tools (Snowflake, Databricks, LangChain, dbt, Airflow, vector DBs, SageMaker) are backend and only appear in job ads, engineering blogs, or public GitHub — that is expected; use those channels. Respond ONLY with valid JSON, no surrounding text.",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  const key = Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) return json({ error: "server not configured" }, 500);

  let body: any;
  try { body = await req.json(); } catch { return json({ error: "bad json" }, 400); }

  if (!ALLOWED_MODELS.has(body?.model)) return json({ error: "model not allowed" }, 400);
  if (!Array.isArray(body?.messages) || body.messages.length === 0) return json({ error: "messages required" }, 400);
  if (body.messages.length > MAX_MESSAGES) return json({ error: "too many messages" }, 400);

  const inputChars = JSON.stringify(body.messages).length + (typeof body.system === "string" ? body.system.length : 0);
  if (inputChars > MAX_INPUT_CHARS) return json({ error: "input too large" }, 413);

  const task = typeof body.task === "string" ? body.task : "";
  let system: string | undefined;
  if (task && TASK_SYSTEM[task]) system = TASK_SYSTEM[task];
  else if (STRICT_TASKS) return json({ error: "unknown or missing task" }, 400);
  else if (typeof body.system === "string") system = body.system;

  const safe: any = {
    model: body.model,
    max_tokens: Math.min(Math.max(Number(body.max_tokens) || 1024, 1), MAX_TOKENS_CAP),
    messages: body.messages,
  };
  if (system) safe.system = system;
  if (typeof body.temperature === "number") safe.temperature = body.temperature;

  if (body.tools !== undefined) {
    if (!Array.isArray(body.tools) || body.tools.length > MAX_TOOLS) return json({ error: "invalid tools" }, 400);
    for (const t of body.tools) {
      if (t?.type && !ALLOWED_SERVER_TOOL_TYPES.has(t.type)) return json({ error: "tool type not allowed: " + t.type }, 400);
    }
    safe.tools = body.tools;
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify(safe),
    });
    const text = await res.text();
    return new Response(text, { status: res.status, headers: { ...cors, "Content-Type": "application/json" } });
  } catch (e) {
    return json({ error: String((e as Error)?.message || e) }, 502);
  }
});
