// kb-search — Smith's retrieval into the brain. HYBRID: semantic (gte-small + pgvector, mainly the
// embedded playbook) INTERLEAVED with full-text (the AWS reference docs) so both the curated summary
// and the specific doc detail surface. `list:true` returns docs.
// Body: { query, k?, min_sim?, list? }  verify_jwt=true (anon/app JWT). Service-role read inside.
import { createClient } from "jsr:@supabase/supabase-js@2";
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const J = (o: unknown, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return J({ error: "POST only" }, 405);
  const url = Deno.env.get("SUPABASE_URL") || "", svc = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  if (!url || !svc) return J({ error: "service env missing" }, 500);
  let b: any = {}; try { b = await req.json(); } catch {}
  const sb = createClient(url, svc);

  if (b.list === true) {
    const { data } = await sb.from("kb_docs").select("id,title,source,kind,pages,chunks,updated_at").order("updated_at", { ascending: false });
    return J({ docs: data || [] });
  }

  const query = String(b.query || "").trim();
  if (!query) return J({ error: "query required" }, 400);
  const k = Math.min(Math.max(Number(b.k) || 6, 1), 12);
  const minSim = (typeof b.min_sim === "number") ? b.min_sim : 0.30;

  // 1) semantic (embedded chunks — mainly the curated playbook)
  let sem: any[] = [];
  try {
    // @ts-ignore Supabase global injected by the edge runtime
    const session = new Supabase.ai.Session("gte-small");
    const emb = await session.run(query, { mean_pool: true, normalize: true });
    const { data } = await sb.rpc("match_kb_chunks", { query_embedding: JSON.stringify(emb), match_count: k });
    if (Array.isArray(data)) sem = data.filter((r: any) => (r.similarity ?? 0) >= minSim);
  } catch { /* ignore */ }

  // 2) lexical (full-text over all docs)
  let fts: any[] = [];
  try { const { data } = await sb.rpc("search_kb_fts", { q: query, match_count: k }); if (Array.isArray(data)) fts = data.map((r: any) => ({ ...r, similarity: r.rank })); } catch { /* ignore */ }

  // 3) INTERLEAVE semantic + lexical (dedupe by id) so the playbook summary AND the doc detail both show
  const seen = new Set<string>(); const out: any[] = []; let i = 0, j = 0;
  while (out.length < k && (i < sem.length || j < fts.length)) {
    if (i < sem.length) { const r = sem[i++]; if (!seen.has(r.id)) { seen.add(r.id); out.push(r); } }
    if (out.length < k && j < fts.length) { const r = fts[j++]; if (!seen.has(r.id)) { seen.add(r.id); out.push(r); } }
  }

  return J({ query, count: out.length, results: out.map((r: any) => ({ title: r.title, source: r.source, page: r.page, content: r.content, similarity: Math.round((r.similarity || 0) * 1000) / 1000 })) });
});
