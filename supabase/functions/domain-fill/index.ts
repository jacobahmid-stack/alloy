// domain-fill — server-side website finder for imported leads that have no domain yet.
// Everything else (cloud-detect, contacts, size) needs a domain first; bulk-enrich requires one.
// Self-selects (service role) so it loops without shuttling candidate lists. find_domain via the
// proxy (Haiku + web_search). Marks misses (enrichment.domain_tried) so they aren't retried.
// Optional `digits` shards by orgnr last-digit so concurrent callers take DISJOINT rows.
// Body: { project_id?, source?, limit?(<=10), digits?:[..], dry_run? }  Auth: anon/app JWT (verify_jwt=true).
import { createClient } from "jsr:@supabase/supabase-js@2";
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const J = (o: unknown, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { ...cors, "Content-Type": "application/json" } });
// claude-proxy (verify_jwt) needs a JWT-format key. The runtime's SUPABASE_ANON_KEY is now the
// publishable key (sb_publishable_…) which fails verify_jwt — so only use it if it's a JWT, else legacy.
const LEGACY_ANON_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52aml6YWh0Y3FnbWZoaW9kdGVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5ODk0NDMsImV4cCI6MjA5NTU2NTQ0M30.G0gf0z0wg9RQqsyZcEBXPYJ1YVeTe_NOULtDAEI2xEA";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return J({ error: "POST only" }, 405);
  const url = Deno.env.get("SUPABASE_URL") || "", svc = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const envAnon = Deno.env.get("SUPABASE_ANON_KEY") || "";
  const anon = envAnon.startsWith("eyJ") ? envAnon : LEGACY_ANON_JWT;
  if (!url || !svc) return J({ error: "service env missing" }, 500);
  let b: any = {}; try { b = await req.json(); } catch {}
  const project = b.project_id ? String(b.project_id) : null;
  const source = b.source ? String(b.source) : null;
  const limit = Math.min(Math.max(Number(b.limit) || 8, 1), 10);
  const digits: string[] = Array.isArray(b.digits) ? b.digits.map((d: any) => String(d)) : [];
  const shardOr = digits.length ? digits.map((d) => `orgnr.like.%${d}`).join(",") : "";
  const sb = createClient(url, svc);

  let q = sb.from("companies").select("id,name,city,orgnr,enrichment").or("domain.is.null,domain.eq.").is("enrichment->>domain_tried", null);
  if (project) q = q.eq("project_id", project);
  if (source) q = q.eq("source", source);
  if (shardOr) q = q.or(shardOr);
  const { data: rows, error } = await q.limit(limit);
  if (error) return J({ error: error.message }, 500);
  let cq = sb.from("companies").select("id", { count: "exact", head: true }).or("domain.is.null,domain.eq.").is("enrichment->>domain_tried", null);
  if (project) cq = cq.eq("project_id", project);
  if (source) cq = cq.eq("source", source);
  if (shardOr) cq = cq.or(shardOr);
  const { count: remaining } = await cq;
  if (b.dry_run === true) return J({ candidates: remaining, batch: (rows || []).length, sample: (rows || []).slice(0, 5).map((r: any) => r.name) });
  if (!rows || !rows.length) return J({ processed: 0, found: 0, remaining: 0, cost_usd: 0, done: true });

  let cost = 0, found = 0;
  const results: any[] = [];
  for (const r of rows) {
    const user = `Company: "${r.name}"${r.city ? `\nCity: ${r.city}` : ""}${r.orgnr ? `\nOrg.nr: ${r.orgnr}` : ""}\nFind this exact Swedish company's official website domain.`;
    let dom = "";
    try {
      const pr = await fetch(`${url}/functions/v1/claude-proxy`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + anon, apikey: anon },
        body: JSON.stringify({ model: "claude-haiku-4-5-20251001", task: "find_domain", max_tokens: 220, messages: [{ role: "user", content: user }], tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 2 }] }),
      });
      const j = await pr.json(); const u = j.usage || {};
      cost += ((u.input_tokens || 0) + (u.cache_read_input_tokens || 0) + (u.cache_creation_input_tokens || 0)) / 1e6 + (u.output_tokens || 0) / 1e6 * 5 + (((u.server_tool_use || {}).web_search_requests) || 0) * 0.01;
      const t = (j.content || []).filter((x: any) => x.type === "text").map((x: any) => x.text).join("");
      const m = t.match(/\{[\s\S]*\}/);
      if (m) dom = String((JSON.parse(m[0]).domain) || "").trim();
    } catch { /* miss */ }
    dom = dom.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "").toLowerCase().replace(/[^a-z0-9.\-].*$/, "");
    const enr = (r.enrichment && typeof r.enrichment === "object") ? r.enrichment : {};
    if (dom && dom.includes(".")) { await sb.from("companies").update({ domain: dom }).eq("id", r.id); found++; }
    else { enr.domain_tried = true; await sb.from("companies").update({ enrichment: enr }).eq("id", r.id); }
    results.push({ id: r.id, name: r.name, domain: dom || null });
  }
  return J({ processed: rows.length, found, remaining: (remaining || 0), cost_usd: +cost.toFixed(4), results });
});
