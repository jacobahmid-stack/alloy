// kb-ingest — stores chunks in the brain; embeds with Supabase.ai gte-small (384-dim) when embed!=false.
// In-runtime embedding is CPU-bound (~6 chunks/call max), so: embed=true -> send SMALL batches (<=5);
// embed=false -> FTS-only, big batches fine. Body: { doc_id, title, source?, kind?, pages?, replace?,
// embed?, chunks:[{idx,page,content}] }  verify_jwt=true.
import { createClient } from "jsr:@supabase/supabase-js@2";
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const J = (o: unknown, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return J({ error: "POST only" }, 405);
  const url = Deno.env.get("SUPABASE_URL") || "", svc = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  if (!url || !svc) return J({ error: "service env missing" }, 500);
  let b: any = {}; try { b = await req.json(); } catch {}
  const docId = String(b.doc_id || "").trim();
  const title = String(b.title || docId).trim();
  if (!docId || !Array.isArray(b.chunks) || !b.chunks.length) return J({ error: "doc_id and chunks required" }, 400);
  const doEmbed = b.embed !== false;
  const sb = createClient(url, svc);

  await sb.from("kb_docs").upsert({ id: docId, title, source: b.source || null, kind: b.kind || "aws-doc", pages: b.pages || null, updated_at: new Date().toISOString() }, { onConflict: "id" });
  if (b.replace === true) await sb.from("kb_chunks").delete().eq("doc_id", docId);

  // @ts-ignore Supabase global injected by the edge runtime
  const session = doEmbed ? new Supabase.ai.Session("gte-small") : null;
  const rows: any[] = [];
  let embedded = 0;
  for (const c of b.chunks) {
    const content = String(c.content || "").trim();
    if (!content) continue;
    let emb: number[] | null = null;
    if (session) { try { const v = await session.run(content, { mean_pool: true, normalize: true }); if (Array.isArray(v)) { emb = v as number[]; embedded++; } } catch { /* still FTS */ } }
    rows.push({ id: `${docId}#${c.idx}`, doc_id: docId, idx: Number(c.idx) || 0, page: (c.page === 0 || c.page) ? Number(c.page) : null, content, embedding: emb ? JSON.stringify(emb) : null, tokens: Math.round(content.length / 4) });
  }
  if (rows.length) {
    const { error } = await sb.from("kb_chunks").upsert(rows, { onConflict: "id" });
    if (error) return J({ error: error.message }, 500);
  }
  const { count } = await sb.from("kb_chunks").select("id", { count: "exact", head: true }).eq("doc_id", docId);
  await sb.from("kb_docs").update({ chunks: count || rows.length }).eq("id", docId);
  return J({ ok: true, doc_id: docId, inserted: rows.length, embedded, total_chunks: count || rows.length });
});
