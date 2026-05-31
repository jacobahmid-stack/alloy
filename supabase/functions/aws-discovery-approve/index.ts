// Approve / reject AWS-discovery candidates. Approval atomically inserts a real
// companies row and flips the candidate to status='imported' (+ imported_id).
// Auth: service-role Bearer (verify_jwt=true).
//
// Body:
//   { action: "approve", ids: [uuid...], project_id?: string }
//   { action: "reject",  ids: [uuid...], note?: string }
//   { action: "list",    status?: "pending"|"approved"|"imported"|"rejected" }
import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (o: unknown, status = 200) =>
  new Response(JSON.stringify(o), { status, headers: { ...cors, "Content-Type": "application/json" } });

function newId(name: string): string {
  const slug = String(name || "co").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
  // crypto.randomUUID is available in the Deno runtime
  return `disc-${slug || "co"}-${crypto.randomUUID().slice(0, 8)}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  let body: any = {};
  try { body = await req.json(); } catch { /* empty */ }
  const action = body.action;

  if (action === "list") {
    const status = typeof body.status === "string" ? body.status : "pending";
    const { data, error } = await sb.from("aws_discovery_candidates")
      .select("*").eq("status", status).order("created_at", { ascending: false }).limit(500);
    if (error) return json({ error: error.message }, 500);
    return json({ candidates: data || [] });
  }

  const ids: string[] = Array.isArray(body.ids) ? body.ids.filter((x: any) => typeof x === "string") : [];
  if (!ids.length) return json({ error: "ids required" }, 400);

  if (action === "reject") {
    const { error } = await sb.from("aws_discovery_candidates")
      .update({ status: "rejected", note: (body.note || "").slice(0, 300), reviewed_at: new Date().toISOString() })
      .in("id", ids);
    if (error) return json({ error: error.message }, 500);
    return json({ rejected: ids.length });
  }

  if (action === "approve") {
    const project_id = typeof body.project_id === "string" ? body.project_id : null;
    const { data: cands, error: selErr } = await sb.from("aws_discovery_candidates")
      .select("*").in("id", ids).eq("status", "pending");
    if (selErr) return json({ error: selErr.message }, 500);

    const results: any[] = [];
    for (const c of (cands || [])) {
      // Re-check the company doesn't already exist by domain (last-moment guard).
      let dup: string | null = null;
      if (c.domain) {
        const { data: ex } = await sb.from("companies").select("id").ilike("domain", c.domain).limit(1);
        if (ex && ex.length) dup = ex[0].id;
      }
      if (dup) {
        await sb.from("aws_discovery_candidates")
          .update({ status: "imported", dup_of: dup, imported_id: dup, reviewed_at: new Date().toISOString() })
          .eq("id", c.id);
        results.push({ id: c.id, name: c.name, imported_id: dup, deduped: true });
        continue;
      }
      // Multi-cloud: detected_provider is the verifier's verdict (aws/gcp/azure/...);
      // target_cloud is what the angle searched for. Set cloud_provider from the best
      // signal; aws_detected stays true only for AWS (it drives AWS-specific UI/scoring).
      const detected = c.detected_provider && c.detected_provider !== "unverified" && c.detected_provider !== "none"
        ? c.detected_provider : null;
      const cloud = detected || c.target_cloud || null;       // fall back to searched cloud when unverified
      const onAws = cloud === "aws";
      const verified = c.aws_verdict && c.aws_verdict === c.target_cloud; // verifier confirmed the target
      const cloudLabel = (cloud || "cloud").toUpperCase();
      const companyId = newId(c.name);
      const row: any = {
        id: companyId, name: c.name, domain: c.domain || null, orgnr: c.orgnr || null,
        city: c.city || null, county: c.county || null, country: c.country || "SE",
        industry: c.industry || null, employees: c.employees || null,
        source: "aws_discovery", list_tag: "aws_discovery", stage: "lead",
        cloud_provider: cloud, aws_detected: onAws,
        aws_signals: verified
          ? `${cloudLabel} (${c.aws_confidence}) via discovery — ${(c.aws_services || []).join(",").slice(0, 90)}`
          : `${cloudLabel} (asserted, ${c.discovery_method}): ${String(c.discovery_evidence || "").slice(0, 110)}`,
        project_id,
        enrichment: {
          discovery_method: c.discovery_method, discovery_evidence: c.discovery_evidence,
          source_urls: c.source_urls, target_cloud: c.target_cloud,
          detected_provider: c.detected_provider, cloud_confidence: c.aws_confidence,
        },
      };
      const { error: insErr } = await sb.from("companies").insert(row);
      if (insErr) { results.push({ id: c.id, name: c.name, error: insErr.message }); continue; }
      await sb.from("aws_discovery_candidates")
        .update({ status: "imported", imported_id: companyId, reviewed_at: new Date().toISOString() })
        .eq("id", c.id);
      results.push({ id: c.id, name: c.name, imported_id: companyId, cloud, on_aws: onAws });
    }
    return json({ approved: results.filter((r) => r.imported_id && !r.error).length, results });
  }

  return json({ error: "unknown action" }, 400);
});
