// Alloy — BuiltWith enrichment (CREDIT-SAFE). Supabase Edge Function, Deno.
//
// The function itself is the gatekeeper, so the frontend can never burn credits:
//   - NEVER calls BuiltWith for a company without a domain.
//   - NEVER re-calls a domain whose techstack_at is fresh (within max_age_days), unless force=true.
//   - Batch mode selects ONLY rows with a real domain that are missing/stale, and is hard-capped.
//   - dry_run returns the candidate count with ZERO credits spent.
//
// It writes techstack(jsonb), cloud_provider, email_provider, techstack_at on companies.
//
// Modes (POST JSON body):
//   { company_id, force?, max_age_days? }                                  -> enrich one company
//   { run_batch:true, project_id?, limit?, max_age_days?, force?, dry_run? } -> enrich many (filtered + capped)
//   { domain }                                                             -> raw Domain API passthrough (ad-hoc, no cache)

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { ...CORS, "Content-Type": "application/json" } });
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const BW_KEY = Deno.env.get("BUILTWITH_API_KEY") ?? "";
const REST = SUPABASE_URL + "/rest/v1";
const DBH = { "apikey": SERVICE_KEY, "Authorization": "Bearer " + SERVICE_KEY, "Content-Type": "application/json" };

const MAX_AGE_DAYS_DEFAULT = 60;
const BATCH_DEFAULT_LIMIT = 20;
const BATCH_HARD_CAP = 50;       // never look up more than this per invocation (credit guard)
const BW_TIMEOUT_MS = 20000;

function cleanDomain(d: string): string {
  return (d || "").trim().replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/+$/, "").split("/")[0];
}
function cutoffIso(days: number): string {
  return new Date(Date.now() - days * 86400000).toISOString();
}

// ---- detection rules ----
const CLOUD_RULES: [string, RegExp[]][] = [
  ["AWS", [/amazon s3/i, /cloudfront/i, /amazon ec2/i, /elastic load/i, /route ?53/i, /\baws\b/i, /amazon web services/i, /amazon/i]],
  ["Azure", [/microsoft azure/i, /\bazure\b/i, /windows azure/i]],
  ["Google Cloud", [/google cloud/i, /\bgcp\b/i, /app engine/i, /firebase hosting/i, /google compute/i]],
  ["DigitalOcean", [/digitalocean/i]],
  ["Heroku", [/heroku/i]],
  ["Netlify", [/netlify/i]],
  ["Vercel", [/vercel/i]],
  ["Cloudflare", [/cloudflare/i]],
  ["Fastly", [/fastly/i]],
  ["Akamai", [/akamai/i]],
];
const EMAIL_RULES: [string, RegExp[]][] = [
  ["Google Workspace", [/google workspace/i, /google apps/i, /gsuite/i, /\bgmail\b/i]],
  ["Microsoft 365", [/office ?365/i, /microsoft 365/i, /\bo365\b/i, /outlook/i, /exchange online/i]],
  ["Proofpoint", [/proofpoint/i]],
  ["Mimecast", [/mimecast/i]],
  ["Zoho Mail", [/zoho mail/i]],
];
// High-value signals for Novalo (migration/FinOps) + Alto (Quattro integrations)
const SIGNAL_RULES: [string, RegExp][] = [
  ["Salesforce", /salesforce/i],
  ["Microsoft Dynamics", /dynamics/i],
  ["Visma", /visma/i],
  ["Fortnox", /fortnox/i],
  ["Microsoft 365", /office ?365|microsoft 365|outlook|exchange online/i],
  ["Microsoft Teams", /microsoft teams/i],
  ["HubSpot", /hubspot/i],
  ["SAP", /\bsap\b/i],
  ["Kubernetes", /kubernetes/i],
];

function pickByRules(names: string[], rules: [string, RegExp[]][]): string | null {
  let best: string | null = null; let bestCount = 0;
  for (const [label, regs] of rules) {
    let c = 0;
    for (const n of names) if (regs.some((r) => r.test(n))) c++;
    if (c > bestCount) { best = label; bestCount = c; }
  }
  return best;
}

function parseBuiltWith(text: string): {
  ok: boolean; apiError?: string;
  techstack?: Record<string, unknown>; cloud_provider?: string | null; email_provider?: string | null;
} {
  let data: any;
  try { data = JSON.parse(text); } catch { return { ok: false, apiError: "BuiltWith returned non-JSON" }; }

  // Surface key/credit errors so we DON'T cache and the caller knows.
  const errs = data?.Errors;
  if (Array.isArray(errs) && errs.length) {
    const msg = errs.map((e: any) => e?.Message || e?.Lookup).filter(Boolean).join("; ") || "BuiltWith error";
    if (!data?.Results?.length) return { ok: false, apiError: msg };
  }

  const result = data?.Results?.[0];
  const lookup = result?.Lookup ?? null;
  const paths = result?.Result?.Paths ?? [];
  const spend = result?.Result?.Spend ?? data?.Spend ?? null;

  const techMap = new Map<string, { name: string; tag: string | null; last: number }>();
  for (const p of paths) {
    for (const t of (p?.Technologies ?? [])) {
      const name = t?.Name; if (!name) continue;
      const last = Number(t?.LastDetected ?? 0);
      const prev = techMap.get(name);
      if (!prev || last > prev.last) techMap.set(name, { name, tag: t?.Tag ?? null, last });
    }
  }
  const techs = [...techMap.values()].sort((a, b) => b.last - a.last).slice(0, 250);
  const names = techs.map((t) => t.name);

  const cloud = pickByRules(names, CLOUD_RULES) ?? (techs.length ? "Unknown" : "Unknown");
  const email = pickByRules(names, EMAIL_RULES);
  const signals = SIGNAL_RULES.filter(([, r]) => names.some((n) => r.test(n))).map(([label]) => label);

  return {
    ok: true,
    cloud_provider: cloud,
    email_provider: email,
    techstack: {
      source: "builtwith",
      fetched_at: new Date().toISOString(),
      lookup,
      cloud_provider: cloud,
      email_provider: email,
      signals: [...new Set(signals)],
      tech_count: techs.length,
      technologies: techs.map((t) => ({ name: t.name, tag: t.tag, last_detected: t.last })),
      spend: spend,
    },
  };
}

async function callBuiltWith(domain: string): Promise<string> {
  const url = "https://api.builtwith.com/v22/api.json?KEY=" + encodeURIComponent(BW_KEY) + "&LOOKUP=" + encodeURIComponent(domain);
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), BW_TIMEOUT_MS);
  try {
    const r = await fetch(url, { signal: ctrl.signal });
    return await r.text();
  } finally { clearTimeout(to); }
}

async function dbGet(id: string) {
  const r = await fetch(`${REST}/companies?id=eq.${encodeURIComponent(id)}&select=id,domain,techstack_at`, { headers: DBH });
  const a = await r.json();
  return Array.isArray(a) && a.length ? a[0] : null;
}
async function dbPatch(id: string, patch: Record<string, unknown>) {
  const r = await fetch(`${REST}/companies?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH", headers: { ...DBH, "Prefer": "return=minimal" }, body: JSON.stringify(patch),
  });
  if (!r.ok) throw new Error("DB patch " + r.status + ": " + (await r.text()));
}
function candidateFilter(projectId: string | null, cutoff: string | null): string {
  let f = "domain=like.*.*"; // contains a dot => real, non-empty domain (excludes '' and NULL)
  if (projectId) f += `&project_id=eq.${encodeURIComponent(projectId)}`;
  if (cutoff) f += `&or=(techstack_at.is.null,techstack_at.lt.${cutoff})`;
  return f;
}

// enrich one domain -> writes cache; returns a status object. Spends 1 lookup.
async function enrichOne(id: string, domain: string) {
  if (!BW_KEY) return { id, status: "error", reason: "BUILTWITH_API_KEY not set" };
  let text: string;
  try { text = await callBuiltWith(domain); }
  catch (e) { return { id, status: "error", reason: "fetch failed: " + (e instanceof Error ? e.message : String(e)) }; }
  const parsed = parseBuiltWith(text);
  if (!parsed.ok) return { id, status: "error", reason: parsed.apiError ?? "parse failed" }; // don't cache -> retryable
  await dbPatch(id, {
    techstack: parsed.techstack,
    cloud_provider: parsed.cloud_provider ?? "Unknown",
    email_provider: parsed.email_provider ?? null,
    techstack_at: new Date().toISOString(),
  });
  const tc = (parsed.techstack?.tech_count as number) ?? 0;
  return { id, domain, status: tc ? "enriched" : "enriched_empty", cloud_provider: parsed.cloud_provider, email_provider: parsed.email_provider, signals: parsed.techstack?.signals, tech_count: tc };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Use POST" }, 405);
  if (!SUPABASE_URL || !SERVICE_KEY) return json({ error: "Supabase env not available in function" }, 500);

  let body: any = {};
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON body" }, 400); }

  const maxAge = Number.isFinite(body?.max_age_days) ? Number(body.max_age_days) : MAX_AGE_DAYS_DEFAULT;

  // ---- RAW passthrough (ad-hoc, no cache) ----
  if (body?.domain && !body?.company_id && !body?.run_batch) {
    if (!BW_KEY) return json({ error: "BUILTWITH_API_KEY secret is not set" }, 500);
    const d = cleanDomain(body.domain);
    if (!d) return json({ error: "Missing/invalid 'domain'" }, 400);
    try { return new Response(await callBuiltWith(d), { headers: { ...CORS, "Content-Type": "application/json" } }); }
    catch (e) { return json({ error: "Upstream fetch failed: " + (e instanceof Error ? e.message : String(e)) }, 502); }
  }

  // ---- SINGLE company (cache-gated) ----
  if (body?.company_id) {
    const c = await dbGet(String(body.company_id));
    if (!c) return json({ error: "company not found" }, 404);
    const domain = cleanDomain(c.domain);
    if (!domain) return json({ id: c.id, status: "skipped", reason: "no_domain", credits_used: 0 });
    const fresh = c.techstack_at && (Date.now() - new Date(c.techstack_at).getTime()) < maxAge * 86400000;
    if (fresh && body?.force !== true) return json({ id: c.id, status: "cache_hit", techstack_at: c.techstack_at, credits_used: 0 });
    const res = await enrichOne(c.id, domain);
    return json({ ...res, credits_used: res.status === "error" ? 0 : 1 });
  }

  // ---- BATCH (filtered + hard-capped) ----
  if (body?.run_batch === true) {
    const projectId = body?.project_id ? String(body.project_id) : null;
    const cutoff = body?.force === true ? null : cutoffIso(maxAge);
    const filter = candidateFilter(projectId, cutoff);

    // dry_run -> exact candidate count, ZERO credits
    if (body?.dry_run === true) {
      const r = await fetch(`${REST}/companies?select=id&${filter}`, { headers: { ...DBH, "Prefer": "count=exact", "Range": "0-0" } });
      const cr = r.headers.get("content-range") || ""; // e.g. "0-0/567"
      const total = Number(cr.split("/")[1] || "0");
      return json({ status: "dry_run", candidates: total, note: "≈ credits a full pass would cost (rows with a real domain that are missing/stale). 0 credits spent.", project_id: projectId, max_age_days: maxAge });
    }

    if (!BW_KEY) return json({ error: "BUILTWITH_API_KEY secret is not set" }, 500);
    const limit = Math.min(Math.max(1, Number(body?.limit) || BATCH_DEFAULT_LIMIT), BATCH_HARD_CAP);
    const sel = await fetch(`${REST}/companies?select=id,domain&${filter}&order=techstack_at.asc.nullsfirst&limit=${limit}`, { headers: DBH });
    const rows = (await sel.json()) as Array<{ id: string; domain: string }>;
    const candidates = (Array.isArray(rows) ? rows : []).filter((r) => cleanDomain(r.domain));

    const out: any[] = []; let enriched = 0, empty = 0, errors = 0;
    for (const r of candidates) {
      const res = await enrichOne(r.id, cleanDomain(r.domain));
      if (res.status === "enriched") enriched++;
      else if (res.status === "enriched_empty") empty++;
      else errors++;
      out.push(res);
    }
    return json({
      status: "batch_done", processed: candidates.length, enriched, enriched_empty: empty, errors,
      credits_used: enriched + empty, hard_cap: BATCH_HARD_CAP,
      note: candidates.length === limit ? "Hit the per-call limit — call again to continue the pass." : "No more candidates after this batch.",
      results: out,
    });
  }

  return json({
    error: "Specify a mode",
    modes: {
      single: "{ company_id, force?, max_age_days? }",
      batch: "{ run_batch:true, project_id?, limit?, max_age_days?, force?, dry_run? }",
      raw: "{ domain }",
    },
  }, 400);
});
