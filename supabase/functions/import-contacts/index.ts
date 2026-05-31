// One-shot contact importer: match a list of contacts to EXISTING company cards by
// normalized company name, insert (dedupe by email per company). dry_run reports matches
// without writing. Body: { contacts:[{company,first,last,email,phone,source,title?}], dry_run? }
// Auth: anon JWT at gateway; runs as service-role from env. $0 (no LLM).
import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (o: unknown, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { ...cors, "Content-Type": "application/json" } });

// Same normalization on both sides: lowercase, strip legal/suffix words + punctuation.
const STOP = /\b(ab|asa|as|oyj|oy|a\/s|aps|abp|plc|inc|ltd|group|holding|sverige|sweden|nordic|nordics)\b/g;
function norm(s: string): string {
  return String(s || "").toLowerCase().replace(STOP, " ").replace(/[^a-z0-9åäöæø ]/g, " ").replace(/\s+/g, " ").trim();
}
const uid = () => "ct-" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  let body: any = {};
  try { body = await req.json(); } catch { /* */ }
  const contacts = Array.isArray(body.contacts) ? body.contacts : [];
  const dryRun = body.dry_run === true;
  const projectFilter = typeof body.project_id === "string" ? body.project_id : null;
  if (!contacts.length) return json({ error: "no contacts" }, 400);

  // Load active company cards, build normalized-name -> [cards] index.
  let q = sb.from("companies").select("id, name, project_id, list_tag").or("list_tag.is.null,list_tag.neq.archived_shell");
  if (projectFilter) q = q.eq("project_id", projectFilter);
  const { data: comps, error } = await q;
  if (error) return json({ error: error.message }, 500);
  const idx = new Map<string, any[]>();
  for (const c of (comps || [])) {
    const n = norm(c.name);
    if (!n) continue;
    (idx.get(n) || idx.set(n, []).get(n)!).push(c);
  }

  // Pre-load existing contact emails per company to dedupe.
  const { data: existing } = await sb.from("contacts").select("company_id, email");
  const haveEmail = new Set<string>();
  for (const e of (existing || [])) if (e.email) haveEmail.add(e.company_id + "|" + String(e.email).toLowerCase());

  const toInsert: any[] = [];
  const matchedCards = new Set<string>();
  const byProject: Record<string, number> = {};
  let matchedContacts = 0, unmatched = 0, dupSkipped = 0, ambiguous = 0;
  const unmatchedSample: string[] = [];

  for (const ct of contacts) {
    const n = norm(ct.company);
    const cards = n ? idx.get(n) : null;
    if (!cards || !cards.length) {
      unmatched++; if (unmatchedSample.length < 25) unmatchedSample.push(ct.company);
      continue;
    }
    if (cards.length > 1) ambiguous++;
    const card = cards[0]; // first match (same normalized name)
    const email = String(ct.email || "").toLowerCase();
    if (email && haveEmail.has(card.id + "|" + email)) { dupSkipped++; continue; }
    matchedContacts++; matchedCards.add(card.id);
    byProject[card.project_id || "(none)"] = (byProject[card.project_id || "(none)"] || 0) + 1;
    if (email) haveEmail.add(card.id + "|" + email);
    toInsert.push({
      id: uid(), company_id: card.id,
      first_name: ct.first || "", last_name: ct.last || "",
      title: ct.title || "", email: ct.email || "", phone: ct.phone || "",
      linkedin: "", status: "Not contacted",
      source: ct.source || "AWS Marketing list",
    });
  }

  let wrote = 0;
  if (!dryRun && toInsert.length) {
    // insert in chunks of 200
    for (let i = 0; i < toInsert.length; i += 200) {
      const part = toInsert.slice(i, i + 200);
      const { error: e } = await sb.from("contacts").insert(part);
      if (!e) wrote += part.length;
      else return json({ error: "insert failed: " + e.message, wrote }, 500);
    }
  }

  return json({
    dry_run: dryRun,
    input_contacts: contacts.length,
    matched_contacts: matchedContacts,
    cards_gaining_contacts: matchedCards.size,
    by_project: byProject,
    duplicates_skipped: dupSkipped,
    ambiguous_name_matches: ambiguous,
    unmatched: unmatched,
    unmatched_sample: unmatchedSample,
    wrote,
  });
});
