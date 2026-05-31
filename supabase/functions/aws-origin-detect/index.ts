// Free AWS-origin detection (works behind Cloudflare):
//   crt.sh (CT logs, certSpotter fallback) -> DNS via DoH (fetch) -> match AWS ip-ranges.json
//   + apex-HTML asset fingerprint. Report-only unless {"apply": true}.
//   Logs every domain to origin_scan_results. DoH via fetch => works in
//   Supabase restricted Deno runtime AND ports to Lambda.
import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (o: unknown, status = 200) =>
  new Response(JSON.stringify(o), { status, headers: { ...cors, "Content-Type": "application/json" } });

const COMMON_SUBS = ["", "www", "api", "app", "assets", "cdn", "static", "portal", "dashboard", "admin", "mail", "auth", "login"];
const MAX_CT_SUBS = 40;

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

function addCtName(out: Set<string>, raw: string, domain: string): void {
  const n = String(raw || "").trim().toLowerCase();
  if (n && !n.includes("*") && (n === domain || n.endsWith("." + domain))) out.add(n);
}

// crt.sh aggressively rate-limits/blocks shared cloud egress IPs (502/429 -> []),
// so fall back to certSpotter (fast, JSON, no auth for the first page) when it's empty.
async function ctCrtSh(domain: string): Promise<string[]> {
  try {
    const r = await fetchT(`https://crt.sh/?q=%25.${encodeURIComponent(domain)}&output=json`,
      { headers: { "user-agent": "AlloyOriginDetect/1.0" } }, 15000);
    if (!r.ok) return [];
    const j = await r.json();
    const out = new Set<string>();
    for (const row of (j as any[])) {
      for (const raw of String(row.name_value || "").split("\n")) addCtName(out, raw, domain);
    }
    return [...out];
  } catch { return []; }
}

async function ctCertSpotter(domain: string): Promise<string[]> {
  try {
    const r = await fetchT(
      `https://api.certspotter.com/v1/issuances?domain=${encodeURIComponent(domain)}&include_subdomains=true&expand=dns_names`,
      { headers: { "user-agent": "AlloyOriginDetect/1.0" } }, 15000);
    if (!r.ok) return [];
    const j = await r.json();
    if (!Array.isArray(j)) return []; // rate-limit responses come back as an object
    const out = new Set<string>();
    for (const row of j) for (const name of ((row as any)?.dns_names || [])) addCtName(out, name, domain);
    return [...out];
  } catch { return []; }
}

async function ctSubdomains(domain: string): Promise<string[]> {
  const crt = await ctCrtSh(domain);
  if (crt.length) return crt;
  return await ctCertSpotter(domain);
}

type Range = { base: number; mask: number; service: string };
let AWS: Range[] = [];
function ipToInt(ip: string): number {
  const p = ip.split(".");
  if (p.length !== 4) return -1;
  return ((Number(p[0]) << 24) | (Number(p[1]) << 16) | (Number(p[2]) << 8) | Number(p[3])) >>> 0;
}
async function loadAws(): Promise<void> {
  if (AWS.length) return;
  const r = await fetchT("https://ip-ranges.amazonaws.com/ip-ranges.json", {}, 12000);
  const j = await r.json();
  AWS = (j.prefixes as any[]).map((p) => {
    const [ip, bitsStr] = String(p.ip_prefix).split("/");
    const bits = Number(bitsStr);
    const mask = bits === 0 ? 0 : (0xFFFFFFFF << (32 - bits)) >>> 0;
    return { base: ipToInt(ip) & mask, mask, service: p.service };
  });
}
function awsServices(ip: string): string[] {
  const v = ipToInt(ip);
  if (v < 0) return [];
  const s = new Set<string>();
  for (const r of AWS) if ((v & r.mask) === r.base) s.add(r.service);
  return [...s];
}

async function assetSignals(domain: string): Promise<string[]> {
  const hits = new Set<string>();
  for (const scheme of ["https://", "https://www."]) {
    try {
      const r = await fetchT(scheme + domain, { headers: { "user-agent": "Mozilla/5.0 AlloyOriginDetect/1.0" } });
      if (!r.ok) continue;
      const html = (await r.text()).slice(0, 400000);
      const checks: [RegExp, string][] = [
        [/[a-z0-9.\-]*\.s3[.-][a-z0-9.\-]*amazonaws\.com/i, "s3"],
        [/[a-z0-9]+\.cloudfront\.net/i, "cloudfront"],
        [/[a-z0-9]+\.execute-api\.[a-z0-9-]+\.amazonaws\.com/i, "api-gateway"],
        [/cognito-idp\.[a-z0-9-]+\.amazonaws\.com/i, "cognito"],
        [/\.amazonaws\.com/i, "amazonaws"],
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
  for (const h of ct.slice(0, MAX_CT_SUBS)) hosts.add(h);

  const evidence: any[] = [];
  const services = new Set<string>();
  const hostList = [...hosts];
  const BATCH = 6;
  for (let i = 0; i < hostList.length; i += BATCH) {
    const slice = hostList.slice(i, i + BATCH);
    const res = await Promise.all(slice.map(async (h) => ({ h, ips: await resolveA(h) })));
    for (const { h, ips } of res) {
      for (const ip of ips) {
        const svcs = awsServices(ip);
        if (svcs.length) { evidence.push({ host: h, ip, services: svcs }); svcs.forEach((s) => services.add(s)); }
      }
    }
  }
  const assets = await assetSignals(domain);

  const compute = [...services].filter((s) => !["CLOUDFRONT", "S3", "AMAZON", "ROUTE53"].includes(s));
  let verdict = "none", confidence = "none";
  if (evidence.length && compute.length) { verdict = "aws"; confidence = "high"; }
  else if (evidence.length || assets.includes("cloudfront") || assets.includes("api-gateway") || assets.includes("cognito")) { verdict = "aws"; confidence = "medium"; }
  else if (assets.length) { verdict = "aws"; confidence = "low"; }

  return {
    domain, verdict, confidence,
    services: [...services], assets, evidence: evidence.slice(0, 8),
    checked_hosts: hostList.length, ct_count: ct.length,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  let body: any = {};
  try { body = await req.json(); } catch { /* empty ok */ }
  const limit = Math.min(Number(body.limit) || 30, 100);
  const offset = Number(body.offset) || 0;
  const apply = body.apply === true;

  let rows: { id: string; domain: string }[] = [];
  if (Array.isArray(body.domains) && body.domains.length) {
    rows = body.domains.map((d: string, i: number) => ({ id: `adhoc-${i}`, domain: String(d).toLowerCase() }));
  } else {
    const { data, error } = await sb.from("companies")
      .select("id, domain").eq("cloud_provider", "cloudflare").neq("list_tag", "archived_shell")
      .not("domain", "is", null).order("domain", { ascending: true }).range(offset, offset + limit - 1);
    if (error) return json({ error: error.message }, 500);
    rows = (data || []).filter((r: any) => r.domain);
  }

  await loadAws();
  const report: any[] = [];
  for (const row of rows) {
    const adhoc = String(row.id).startsWith("adhoc-");
    try {
      const r = await probe(row.domain);
      report.push({ id: row.id, ...r });
      const didApply = apply && r.verdict === "aws" && !adhoc;
      if (didApply) {
        await sb.from("companies").update({
          cloud_provider: "aws", aws_detected: true,
          aws_signals: `AWS origin (${r.confidence}) w/ Cloudflare — ${(r.services.join(",") || r.assets.join(",")).slice(0, 120)}`,
        }).eq("id", row.id);
      }
      await sb.from("origin_scan_results").insert({
        company_id: String(row.id), domain: r.domain, verdict: r.verdict, confidence: r.confidence,
        services: r.services, assets: r.assets, evidence: r.evidence,
        checked_hosts: r.checked_hosts, ct_count: r.ct_count, applied: didApply,
      });
    } catch (e) {
      const msg = String((e as Error).message || e);
      report.push({ id: row.id, domain: row.domain, verdict: "error", error: msg });
      try {
        await sb.from("origin_scan_results").insert({
          company_id: String(row.id), domain: row.domain, verdict: "error", error: msg, applied: false,
        });
      } catch { /* ignore log failure */ }
    }
  }

  const c = (f: (x: any) => boolean) => report.filter(f).length;
  return json({
    summary: {
      processed: report.length,
      aws_high: c((x) => x.confidence === "high"),
      aws_medium: c((x) => x.confidence === "medium"),
      aws_low: c((x) => x.confidence === "low"),
      none: c((x) => x.verdict === "none"),
      errors: c((x) => x.verdict === "error"),
      applied: apply,
    },
    report,
  });
});
