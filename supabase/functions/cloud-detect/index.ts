// Multi-cloud origin detection (free, works behind Cloudflare):
//   crt.sh / certSpotter (CT subdomains) -> DNS A via DoH -> classify each IP by
//   owning ASN (Team Cymru over DoH TXT) + AWS ip-ranges precision match + apex
//   HTML asset fingerprints. Returns a per-provider verdict so the discovery agent
//   can surface AWS *and* GCP/Azure (migration prospects).
//
// Modes:
//   { domains: ["example.com", ...] }   adhoc classify — read-only, no DB writes
//   { run_batch:true, limit?, dry_run? } TIER-2 ESCALATION — pulls aws-detect's residue
//       (cloud 'other'/'unknown'/'cloudflare', not yet deep-scanned), deep-scans, writes
//       the upgrade, stamps enrichment.cloud_deep_at (idempotent). Driven by a slow cron.
// Returns (adhoc): { report: [{ domain, provider, confidence, providers{}, asns, services, ... }] }
//
// provider = the single best guess (compute clouds win over CDN/proxy); 'cloudflare'
// only when nothing else shows, since CF commonly fronts another origin.
//
// THE LADDER: aws-detect (fast, apex+IP-ranges, 5-min cron) sweeps all → catches the easy
// majority. cloud-detect (deep: CT subdomains + ASN-over-DoH, slow) retries only what tier 1
// couldn't crack. Two tiers, one self-healing pipeline.

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (o: unknown, status = 200) =>
  new Response(JSON.stringify(o), { status, headers: { ...cors, "Content-Type": "application/json" } });

const COMMON_SUBS = ["", "www", "api", "app", "cdn", "portal", "dashboard", "auth"];
const MAX_CT_SUBS = 10;          // CT can return hundreds; cap hard to stay under the CPU/wall limit
const MAX_HOSTS = 16;            // absolute ceiling on hosts probed per domain
const MAX_UNIQUE_IPS_ASN = 12;   // ASN-over-DoH is the heavy call — bound it per domain

async function fetchT(url: string, init: RequestInit = {}, ms = 8000): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try { return await fetch(url, { ...init, signal: ctrl.signal }); }
  finally { clearTimeout(t); }
}

async function resolveA(host: string): Promise<string[]> {
  try {
    const r = await fetchT(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(host)}&type=A`,
      { headers: { accept: "application/dns-json" } });
    if (!r.ok) return [];
    const j = await r.json();
    return (j.Answer || []).filter((a: any) => a.type === 1).map((a: any) => a.data as string);
  } catch { return []; }
}

// --- CT subdomains: crt.sh (often blocked from cloud egress) then certSpotter ---
function addCtName(out: Set<string>, raw: string, domain: string): void {
  const n = String(raw || "").trim().toLowerCase();
  if (n && !n.includes("*") && (n === domain || n.endsWith("." + domain))) out.add(n);
}
async function ctSubdomains(domain: string): Promise<string[]> {
  try {
    const r = await fetchT(`https://crt.sh/?q=%25.${encodeURIComponent(domain)}&output=json`,
      { headers: { "user-agent": "AlloyCloudDetect/1.0" } }, 15000);
    if (r.ok) {
      const j = await r.json();
      const out = new Set<string>();
      for (const row of (j as any[])) for (const raw of String(row.name_value || "").split("\n")) addCtName(out, raw, domain);
      if (out.size) return [...out];
    }
  } catch { /* fall through */ }
  try {
    const r = await fetchT(
      `https://api.certspotter.com/v1/issuances?domain=${encodeURIComponent(domain)}&include_subdomains=true&expand=dns_names`,
      { headers: { "user-agent": "AlloyCloudDetect/1.0" } }, 15000);
    if (!r.ok) return [];
    const j = await r.json();
    if (!Array.isArray(j)) return [];
    const out = new Set<string>();
    for (const row of j) for (const name of ((row as any)?.dns_names || [])) addCtName(out, name, domain);
    return [...out];
  } catch { return []; }
}

// --- AWS precise match (ip-ranges.json) — keeps AWS detection as strong as before ---
type Range = { base: number; mask: number; service: string };
let AWS: Range[] = [];
function ipToInt(ip: string): number {
  const p = ip.split(".");
  if (p.length !== 4) return -1;
  return ((Number(p[0]) << 24) | (Number(p[1]) << 16) | (Number(p[2]) << 8) | Number(p[3])) >>> 0;
}
async function loadAws(): Promise<void> {
  if (AWS.length) return;
  try {
    const r = await fetchT("https://ip-ranges.amazonaws.com/ip-ranges.json", {}, 12000);
    const j = await r.json();
    AWS = (j.prefixes as any[]).map((p) => {
      const [ip, bitsStr] = String(p.ip_prefix).split("/");
      const bits = Number(bitsStr);
      const mask = bits === 0 ? 0 : (0xFFFFFFFF << (32 - bits)) >>> 0;
      return { base: ipToInt(ip) & mask, mask, service: p.service };
    });
  } catch { AWS = []; }
}
function awsServices(ip: string): string[] {
  const v = ipToInt(ip);
  if (v < 0 || !AWS.length) return [];
  const s = new Set<string>();
  for (const r of AWS) if ((v & r.mask) === r.base) s.add(r.service);
  return [...s];
}

// --- ASN classification (Team Cymru over DoH TXT) — covers every provider for free ---
// Major cloud/CDN ASNs. Multiple ASNs per provider (regional / acquired ranges).
const ASN_PROVIDER: Record<string, string> = {
  // AWS
  "16509": "aws", "14618": "aws", "8987": "aws", "39111": "aws",
  // Google Cloud / Google
  "15169": "gcp", "396982": "gcp", "19527": "gcp", "139070": "gcp", "36384": "gcp",
  // Microsoft Azure
  "8075": "azure", "8068": "azure", "8069": "azure", "12076": "azure", "8071": "azure",
  // Cloudflare
  "13335": "cloudflare", "209242": "cloudflare",
  // common others (kept as 'other' signal, named for evidence)
  "16276": "other", "14061": "other", "20473": "other", "24940": "other", "63949": "other", // OVH, DO, Vultr, Hetzner, Linode
  "26496": "other", "46606": "other", // GoDaddy, Unified Layer
};
const asnCache = new Map<string, string>();
async function asnOf(ip: string): Promise<string> {
  if (asnCache.has(ip)) return asnCache.get(ip)!;
  let asn = "";
  try {
    const rev = ip.split(".").reverse().join(".");
    const r = await fetchT(`https://cloudflare-dns.com/dns-query?name=${rev}.origin.asn.cymru.com&type=TXT`,
      { headers: { accept: "application/dns-json" } }, 6000);
    if (r.ok) {
      const j = await r.json();
      const txt = (j.Answer || []).map((a: any) => a.data).join(" ").replace(/"/g, "");
      asn = (txt.match(/\d+/) || [""])[0];
    }
  } catch { /* ignore */ }
  asnCache.set(ip, asn);
  return asn;
}

async function assetSignals(domain: string): Promise<string[]> {
  const hits = new Set<string>();
  for (const scheme of ["https://", "https://www."]) {
    try {
      const r = await fetchT(scheme + domain, { headers: { "user-agent": "Mozilla/5.0 AlloyCloudDetect/1.0" } });
      if (!r.ok) continue;
      const html = (await r.text()).slice(0, 400000);
      const checks: [RegExp, string][] = [
        [/[a-z0-9.\-]*\.s3[.-][a-z0-9.\-]*amazonaws\.com/i, "aws:s3"],
        [/[a-z0-9]+\.cloudfront\.net/i, "aws:cloudfront"],
        [/[a-z0-9]+\.execute-api\.[a-z0-9-]+\.amazonaws\.com/i, "aws:api-gateway"],
        [/\.amazonaws\.com/i, "aws:amazonaws"],
        [/storage\.googleapis\.com|\.appspot\.com|firebaseapp\.com|run\.app|\.withgoogle\.com/i, "gcp:asset"],
        [/\.blob\.core\.windows\.net|\.azurewebsites\.net|\.azureedge\.net|\.azure-api\.net/i, "azure:asset"],
        [/\.cdn\.cloudflare\.net|cloudflareinsights\.com/i, "cloudflare:asset"],
      ];
      for (const [re, tag] of checks) if (re.test(html)) hits.add(tag);
      if (hits.size) break;
    } catch { /* ignore */ }
  }
  return [...hits];
}

async function probe(domain: string) {
  const ct = await ctSubdomains(domain);
  const hosts = new Set<string>();
  for (const s of COMMON_SUBS) hosts.add(s ? `${s}.${domain}` : domain);
  for (const h of ct.slice(0, MAX_CT_SUBS)) { if (hosts.size >= MAX_HOSTS) break; hosts.add(h); }

  const providers: Record<string, number> = { aws: 0, gcp: 0, azure: 0, cloudflare: 0, other: 0 };
  const asns = new Set<string>();
  const services = new Set<string>();
  const hostList = [...hosts].slice(0, MAX_HOSTS);

  // Phase 1: resolve all hosts to IPs (cheap), collect unique IPs.
  const uniqIps = new Set<string>();
  const BATCH = 6;
  for (let i = 0; i < hostList.length; i += BATCH) {
    const slice = hostList.slice(i, i + BATCH);
    const res = await Promise.all(slice.map((h) => resolveA(h)));
    for (const ips of res) for (const ip of ips) uniqIps.add(ip);
  }

  // Phase 2: AWS precise match on every IP (local, no network); ASN-classify only
  // the IPs AWS didn't claim, bounded to MAX_UNIQUE_IPS_ASN (the heavy DoH call).
  const nonAws: string[] = [];
  for (const ip of uniqIps) {
    const aws = awsServices(ip);
    if (aws.length) { providers.aws++; aws.forEach((s) => services.add(s)); }
    else nonAws.push(ip);
  }
  const toAsn = nonAws.slice(0, MAX_UNIQUE_IPS_ASN);
  for (let i = 0; i < toAsn.length; i += BATCH) {
    const slice = toAsn.slice(i, i + BATCH);
    const res = await Promise.all(slice.map((ip) => asnOf(ip)));
    for (const asn of res) {
      if (asn) { asns.add(asn); const p = ASN_PROVIDER[asn] || "other"; providers[p] = (providers[p] || 0) + 1; }
      else providers.other++;
    }
  }
  const assets = await assetSignals(domain);
  for (const a of assets) { const p = a.split(":")[0]; if (providers[p] !== undefined) providers[p] += 0.5; }

  // Decide the single best provider. Compute clouds beat a bare Cloudflare/other.
  const compute = ["aws", "gcp", "azure"] as const;
  let provider = "none", confidence = "none";
  const best = compute.map((p) => [p, providers[p]] as const).sort((a, b) => b[1] - a[1])[0];
  if (best && best[1] >= 1) {
    provider = best[0];
    confidence = best[1] >= 2 ? "high" : "medium";
  } else if (providers.cloudflare >= 1) {
    provider = "cloudflare"; confidence = "low"; // CF likely fronts a hidden origin
  } else if (providers.other >= 1) {
    provider = "other"; confidence = "low";
  } else if (assets.length) {
    provider = assets[0].split(":")[0]; confidence = "low";
  }

  return {
    domain, provider, confidence,
    providers, asns: [...asns], services: [...services], assets,
    checked_hosts: hostList.length, ct_count: ct.length,
  };
}

// --- Escalation batch: pull aws-detect's residue, deep-scan, write the upgrade. ---
// Tier 2 of the cloud-detection ladder. Tier 1 = aws-detect (fast cron, apex+IP-ranges)
// sweeps everything; this retries ONLY rows still 'other'/'unknown'/'cloudflare' and not
// yet deep-scanned (enrichment.cloud_deep_at). Idempotent: every row is stamped, so a
// genuinely hidden origin is scanned once then skipped. Small slices stay under the wall limit.
async function runEscalationBatch(limit: number, dryRun: boolean) {
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!url || !key) return { error: "service env not available" };
  const H = { apikey: key, Authorization: "Bearer " + key, "Content-Type": "application/json" };
  const n = Math.max(1, Math.min(limit || 3, 8)); // deep scans are slow; keep slices tiny

  const cr = await fetch(`${url}/rest/v1/rpc/cloud_escalation_candidates`, {
    method: "POST", headers: H, body: JSON.stringify({ p_limit: n }),
  });
  if (!cr.ok) return { error: "candidates rpc " + cr.status + ": " + (await cr.text()).slice(0, 160) };
  const cands = (await cr.json()) as Array<{ id: string; domain: string }>;
  if (dryRun) return { status: "dry_run", candidates: cands.length, sample: cands.slice(0, 8) };
  if (!Array.isArray(cands) || !cands.length) return { status: "batch_done", processed: 0, upgraded: 0, note: "no residue left to escalate" };

  await loadAws();
  const results: any[] = [];
  let upgraded = 0;
  for (const c of cands) {
    const domain = String(c.domain || "").toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "");
    let provider = "unknown", confidence = "none";
    try { const rep = await probe(domain); provider = rep.provider; confidence = rep.confidence; }
    catch (e) { provider = "error"; confidence = String((e as Error).message || e).slice(0, 60); }
    // ALWAYS apply (stamps the marker even on no-upgrade, so it isn't retried forever).
    const ar = await fetch(`${url}/rest/v1/rpc/cloud_escalation_apply`, {
      method: "POST", headers: H,
      body: JSON.stringify({ p_id: c.id, p_provider: provider, p_confidence: confidence }),
    });
    const ok = ar.ok; if (!ok) await ar.text();
    if (["aws", "azure", "gcp"].includes(provider)) upgraded++;
    results.push({ id: c.id, domain, provider, confidence, written: ok });
  }
  return { status: "batch_done", processed: results.length, upgraded, results };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  let body: any = {};
  try { body = await req.json(); } catch { /* empty ok */ }

  // Tier-2 escalation batch (cron-driven). { run_batch:true, limit?, dry_run? }
  if (body.run_batch === true) {
    try { return json(await runEscalationBatch(Number(body.limit) || 3, body.dry_run === true)); }
    catch (e) { return json({ error: String((e as Error).message || e) }, 500); }
  }

  // Adhoc classify (unchanged): { domains:[...] } — read-only, no DB writes.
  const domains: string[] = Array.isArray(body.domains)
    ? body.domains.map((d: any) => String(d).toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "")).filter(Boolean).slice(0, 20)
    : [];
  if (!domains.length) return json({ error: "domains[] required" }, 400);

  await loadAws();
  const report: any[] = [];
  for (const d of domains) {
    try { report.push(await probe(d)); }
    catch (e) { report.push({ domain: d, provider: "error", error: String((e as Error).message || e) }); }
  }
  return json({ report });
});
