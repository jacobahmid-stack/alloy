import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// Alloy — Cloud-check (aws-detect). FREE (DNS/IP heuristics, no API key, no credits).
//
// Modes (POST JSON):
//   { domain }                                                  -> raw detection JSON (unchanged; used by the existing button)
//   { company_id, force? }                                      -> detect + write one company (gated: skip if cloud_provider already set)
//   { run_batch:true, project_id?, limit?, force?, dry_run? }    -> detect + write many (domain present & cloud_provider null), capped
//
// Writes: cloud_provider (lowercase code), aws_detected (bool), aws_signals (text), email_provider (code).
// Gate = a real domain (contains a dot) AND cloud_provider is null (never checked). Once set it won't re-run unless force.

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const J = (o: any, status = 200) => new Response(JSON.stringify(o), { status, headers: { ...CORS, "Content-Type": "application/json" } });

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const REST = SUPABASE_URL + "/rest/v1";
const DBH = { "apikey": SERVICE_KEY, "Authorization": "Bearer " + SERVICE_KEY, "Content-Type": "application/json" };
const BATCH_DEFAULT_LIMIT = 40;
const BATCH_HARD_CAP = 50;

function cleanDomain(input: string): string {
  let d = (input || "").trim().toLowerCase();
  d = d.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "").replace(/:\d+$/, "");
  return d;
}
async function fetchT(url: string, opts: any, ms: number): Promise<Response> {
  const c = new AbortController(); const t = setTimeout(() => c.abort(), ms);
  try { return await fetch(url, { ...opts, signal: c.signal }); } finally { clearTimeout(t); }
}
async function doh(name: string, type: string): Promise<string[]> {
  try {
    const res = await fetchT(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}`, { headers: { accept: "application/dns-json" } }, 8000);
    if (!res.ok) return [];
    const j = await res.json();
    return (j.Answer || []).map((a: any) => String(a.data || "")).filter(Boolean);
  } catch { return []; }
}
function ipToInt(ip: string): number | null {
  const m = ip.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (!m) return null;
  return ((+m[1] << 24) >>> 0) + (+m[2] << 16) + (+m[3] << 8) + (+m[4]);
}
function inCidr(ipInt: number, cidr: string): boolean {
  const [base, bitsStr] = cidr.split("/");
  const baseInt = ipToInt(base);
  if (baseInt == null) return false;
  const bits = parseInt(bitsStr, 10);
  if (bits === 0) return true;
  const mask = (~((1 << (32 - bits)) - 1)) >>> 0;
  return ((ipInt & mask) >>> 0) === ((baseInt & mask) >>> 0);
}
let awsCache: { prefixes: any[]; ts: number } | null = null;
async function awsRanges(): Promise<any[]> {
  if (awsCache && Date.now() - awsCache.ts < 12 * 3600 * 1000) return awsCache.prefixes;
  try {
    const res = await fetchT("https://ip-ranges.amazonaws.com/ip-ranges.json", {}, 10000);
    const j = await res.json();
    const prefixes = (j.prefixes || []).map((p: any) => ({ ip_prefix: p.ip_prefix, region: p.region, service: p.service }));
    awsCache = { prefixes, ts: Date.now() };
    return prefixes;
  } catch { return awsCache?.prefixes || []; }
}
let gcpCache: { prefixes: any[]; ts: number } | null = null;
async function gcpRanges(): Promise<any[]> {
  if (gcpCache && Date.now() - gcpCache.ts < 12 * 3600 * 1000) return gcpCache.prefixes;
  try {
    const res = await fetchT("https://www.gstatic.com/ipranges/cloud.json", {}, 10000);
    const j = await res.json();
    const prefixes = (j.prefixes || []).filter((p: any) => p.ipv4Prefix).map((p: any) => ({ ip_prefix: p.ipv4Prefix, region: p.scope, service: p.service }));
    gcpCache = { prefixes, ts: Date.now() };
    return prefixes;
  } catch { return gcpCache?.prefixes || []; }
}

async function detect(domain: string) {
  const [aRecords, cname, ns, mx, aaaa] = await Promise.all([
    doh(domain, "A"), doh(domain, "CNAME"), doh(domain, "NS"), doh(domain, "MX"), doh(domain, "AAAA"),
  ]);
  const signals: string[] = [];
  const hit = { aws: 0, gcp: 0, azure: 0 };
  let cdn = "";
  const nsBlob = ns.join(" ").toLowerCase();
  const mxBlob = mx.join(" ").toLowerCase();
  const nameBlob = [...cname, ...ns, ...mx].join(" ").toLowerCase();
  if (/cloudfront\.net/.test(nameBlob)) { signals.push("CloudFront (CDN)"); hit.aws++; }
  if (/s3[.-][^ ]*amazonaws\.com|s3-website/.test(nameBlob)) { signals.push("S3"); hit.aws++; }
  if (/elb\.amazonaws\.com|elasticbeanstalk/.test(nameBlob)) { signals.push("ELB / Elastic Beanstalk"); hit.aws++; }
  if (/awsdns/.test(nsBlob)) { signals.push("Route 53 (DNS)"); hit.aws++; }
  if (/amazonaws\.com|amazonses/.test(mxBlob)) { signals.push("Amazon SES / WorkMail"); hit.aws++; }
  if (/ns-cloud-[a-z0-9]+\.googledomains\.com/.test(nsBlob)) { signals.push("Google Cloud DNS"); hit.gcp++; }
  if (/googlehosted|ghs\.google|googleusercontent|appspot\.com|run\.app|firebaseapp\.com|\.web\.app|1e100\.net/.test(nameBlob)) { signals.push("Google Cloud / App Engine"); hit.gcp++; }
  if (/azurewebsites\.net|cloudapp\.azure\.com|cloudapp\.net|azurecontainer\.io|azurestaticapps\.net/.test(nameBlob)) { signals.push("Azure App Service"); hit.azure++; }
  if (/azureedge\.net|azurefd\.net|trafficmanager\.net/.test(nameBlob)) { signals.push("Azure CDN / Front Door"); hit.azure++; }
  if (/azure-dns/.test(nsBlob)) { signals.push("Azure DNS"); hit.azure++; }
  if (/cloudflare/.test(nameBlob) || aRecords.some((ip) => /^104\.|^172\.6[4-9]\.|^172\.7[01]\./.test(ip))) cdn = "Cloudflare";
  else if (/akamai|akadns/.test(nameBlob)) cdn = "Akamai";
  else if (/fastly/.test(nameBlob)) cdn = "Fastly";
  else if (/vercel-dns|vercel\.app/.test(nameBlob)) cdn = "Vercel";
  else if (/netlify/.test(nameBlob)) cdn = "Netlify";
  let emailProvider = ""; let emailLabel = "";
  if (/aspmx\.l\.google\.com|googlemail\.com|google\.com/.test(mxBlob)) { emailProvider = "google"; emailLabel = "Google Workspace"; }
  else if (/mail\.protection\.outlook\.com|outlook\.com|office365|microsoft/.test(mxBlob)) { emailProvider = "microsoft"; emailLabel = "Microsoft 365"; }
  else if (mx.length) { emailProvider = "other"; emailLabel = "Other"; }
  const ips = aRecords.filter((s) => /^\d+\.\d+\.\d+\.\d+$/.test(s));
  if (ips.length) {
    const [aws, gcp] = await Promise.all([awsRanges(), gcpRanges()]);
    for (const ip of ips) {
      const ipInt = ipToInt(ip);
      if (ipInt == null) continue;
      const a = aws.find((p) => inCidr(ipInt, p.ip_prefix));
      if (a) { hit.aws++; const svc = a.service && a.service !== "AMAZON" ? a.service : "EC2/AWS"; signals.push(`AWS IP (${svc}${a.region ? ", " + a.region : ""})`); }
      const g = gcp.find((p) => inCidr(ipInt, p.ip_prefix));
      if (g) { hit.gcp++; signals.push(`GCP IP${g.region ? " (" + g.region + ")" : ""}`); }
    }
  }
  let provider = "unknown";
  if (hit.aws || hit.gcp || hit.azure) provider = (hit.aws >= hit.gcp && hit.aws >= hit.azure) ? "aws" : (hit.gcp >= hit.azure ? "gcp" : "azure");
  else if (cdn === "Cloudflare") provider = "cloudflare";
  else if (cdn) provider = "other";
  else if (ips.length || aaaa.length) provider = "other";
  const awsDetected = hit.aws > 0;
  const multi = [hit.aws && "aws", hit.gcp && "gcp", hit.azure && "azure"].filter(Boolean);
  const uniq = [...new Set(signals)];
  let note = "";
  if (cdn && provider === "cloudflare") note = `Behind ${cdn} — origin cloud is hidden; absence of an AWS/GCP/Azure signal is not conclusive.`;
  else if (cdn && provider !== "cloudflare") note = `Fronted by ${cdn}.`;
  if (multi.length > 1) note = (note ? note + " " : "") + `Multi-cloud signals: ${multi.join(", ").toUpperCase()}.`;
  return { domain, provider, aws_detected: awsDetected, signals: uniq, cdn: cdn || null, email_provider: emailProvider || null, email_label: emailLabel || null, multi_cloud: multi.length > 1, dns: { a: aRecords, cname, ns, mx, aaaa }, note };
}

async function dbGet(id: string) {
  const r = await fetch(`${REST}/companies?id=eq.${encodeURIComponent(id)}&select=id,domain,cloud_provider`, { headers: DBH });
  const a = await r.json();
  return Array.isArray(a) && a.length ? a[0] : null;
}
async function dbPatch(id: string, patch: Record<string, unknown>) {
  const r = await fetch(`${REST}/companies?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", headers: { ...DBH, "Prefer": "return=minimal" }, body: JSON.stringify(patch) });
  if (!r.ok) throw new Error("DB patch " + r.status + ": " + (await r.text()));
}
function candidateFilter(projectId: string | null, force: boolean): string {
  let f = "domain=like.*.*"; // contains a dot => real, non-empty domain
  if (!force) f += "&cloud_provider=is.null";
  if (projectId) f += `&project_id=eq.${encodeURIComponent(projectId)}`;
  return f;
}
async function writeDetection(id: string, det: any) {
  await dbPatch(id, {
    cloud_provider: det.provider,
    aws_detected: det.aws_detected,
    aws_signals: (det.signals && det.signals.length) ? det.signals.join(", ") : "No major-cloud signal",
    email_provider: det.email_provider ?? null,
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return J({ error: "Use POST" }, 405);
  const body = await req.json().catch(() => ({} as any));

  // ---- RAW (unchanged; used by existing frontend button) ----
  if ((body.domain || body.lookup) && !body.company_id && !body.run_batch) {
    const domain = cleanDomain(body.domain || body.lookup || "");
    if (!domain) return J({ error: "no domain" }, 400);
    try { return J(await detect(domain)); } catch (e) { return J({ error: String((e as any)?.message || e) }, 500); }
  }

  if (!SUPABASE_URL || !SERVICE_KEY) return J({ error: "Supabase env not available" }, 500);

  // ---- SINGLE company (gated) ----
  if (body.company_id) {
    const c = await dbGet(String(body.company_id));
    if (!c) return J({ error: "company not found" }, 404);
    const domain = cleanDomain(c.domain || "");
    if (!domain) return J({ id: c.id, status: "skipped", reason: "no_domain" });
    if (c.cloud_provider && body.force !== true) return J({ id: c.id, status: "cache_hit", cloud_provider: c.cloud_provider });
    const det = await detect(domain);
    await writeDetection(c.id, det);
    return J({ id: c.id, status: "checked", cloud_provider: det.provider, aws_detected: det.aws_detected, signals: det.signals });
  }

  // ---- BATCH ----
  if (body.run_batch === true) {
    const projectId = body.project_id ? String(body.project_id) : null;
    const force = body.force === true;
    const filter = candidateFilter(projectId, force);
    if (body.dry_run === true) {
      const r = await fetch(`${REST}/companies?select=id&${filter}`, { headers: { ...DBH, "Prefer": "count=exact", "Range": "0-0" } });
      const cr = r.headers.get("content-range") || "";
      return J({ status: "dry_run", candidates: Number(cr.split("/")[1] || "0"), note: "rows with a real domain that haven't been cloud-checked. FREE — no credits either way.", project_id: projectId });
    }
    const limit = Math.min(Math.max(1, Number(body.limit) || BATCH_DEFAULT_LIMIT), BATCH_HARD_CAP);
    const sel = await fetch(`${REST}/companies?select=id,domain&${filter}&order=updated_at.asc.nullsfirst&limit=${limit}`, { headers: DBH });
    const rows = (await sel.json()) as Array<{ id: string; domain: string }>;
    const candidates = (Array.isArray(rows) ? rows : []).filter((r) => cleanDomain(r.domain || ""));
    const out: any[] = []; let checked = 0, errors = 0;
    for (const r of candidates) {
      try { const det = await detect(cleanDomain(r.domain)); await writeDetection(r.id, det); checked++; out.push({ id: r.id, provider: det.provider, aws_detected: det.aws_detected }); }
      catch (e) { errors++; out.push({ id: r.id, status: "error", reason: String((e as any)?.message || e) }); }
    }
    return J({ status: "batch_done", processed: candidates.length, checked, errors, hard_cap: BATCH_HARD_CAP, note: candidates.length === limit ? "Hit per-call limit — call again to continue." : "No more candidates after this batch.", results: out });
  }

  return J({ error: "Specify a mode", modes: { raw: "{ domain }", single: "{ company_id, force? }", batch: "{ run_batch:true, project_id?, limit?, force?, dry_run? }" } }, 400);
});
