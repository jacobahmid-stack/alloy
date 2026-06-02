// icp-screen — size-gated importer for ICP companies drawn straight from se_registry.
// Per candidate: ONE find_firmographics call (employees+revenue via allabolag/ratsit, org-nr keyed).
//   employees >= min  -> qualified: a find_domain call, then INSERT as stage='lead'  (size-gated lead)
//   employees <  min  -> INSERT stage='archived', list_tag='too-small'
//   employees unknown -> INSERT stage='archived', list_tag='size-unknown'
// Archiving rejects (not just dropping them) is what dedupes re-runs: pick_icp_candidates anti-joins
// against companies, so a screened org is never paid for twice. Self-selects (service role) + shards by
// orgnr last digit so concurrent callers take DISJOINT rows. Hard budget guard lives in the driver.
// Body: { project_id, sni_codes[], min_employees?, source?, limit?(<=8), digit?, dry_run? }  verify_jwt=true.
import { createClient } from "jsr:@supabase/supabase-js@2";
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const J = (o: unknown, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { ...cors, "Content-Type": "application/json" } });
// claude-proxy (verify_jwt) needs a JWT-format key; the runtime's SUPABASE_ANON_KEY is now the
// publishable key (sb_publishable_…) which fails verify_jwt — so only use it if it's a JWT, else legacy.
const LEGACY_ANON_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52aml6YWh0Y3FnbWZoaW9kdGVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5ODk0NDMsImV4cCI6MjA5NTU2NTQ0M30.G0gf0z0wg9RQqsyZcEBXPYJ1YVeTe_NOULtDAEI2xEA";

const SNI_LABEL: Record<string, string> = {
  "62100": "Dataprogrammering (mjukvaruutveckling)",
  "62201": "IT- och datakonsultverksamhet",
  "62202": "Datadrift- och hostingtjänster",
  "62900": "Andra IT- och datatjänster",
  "58290": "Utgivning av annan programvara",
  "58210": "Utgivning av dataspel",
  "63100": "Databehandling, hosting och webbportaler",
  "68100": "Köp och försäljning av egna fastigheter",
  "68201": "Uthyrning av egna/arrenderade bostäder",
  "68202": "Uthyrning av egna/arrenderade lokaler",
  "68204": "Andra fastighetsbolag",
  "68209": "Uthyrning av egna/arrenderade fastigheter",
  "68320": "Fastighetsförvaltning på uppdrag",
  "68110": "Köp och försäljning av egna fastigheter",
};

function pCost(u: any): number {
  return ((u.input_tokens || 0) + (u.cache_read_input_tokens || 0) + (u.cache_creation_input_tokens || 0)) / 1e6
    + (u.output_tokens || 0) / 1e6 * 5
    + (((u.server_tool_use || {}).web_search_requests) || 0) * 0.01;
}
function firstJson(j: any): any {
  const t = (j.content || []).filter((x: any) => x.type === "text").map((x: any) => x.text).join("");
  const m = t.match(/\{[\s\S]*\}/);
  try { return m ? JSON.parse(m[0]) : null; } catch { return null; }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return J({ error: "POST only" }, 405);
  const url = Deno.env.get("SUPABASE_URL") || "", svc = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const envAnon = Deno.env.get("SUPABASE_ANON_KEY") || "";
  const anon = envAnon.startsWith("eyJ") ? envAnon : LEGACY_ANON_JWT;
  if (!url || !svc) return J({ error: "service env missing" }, 500);

  let b: any = {}; try { b = await req.json(); } catch {}
  const project = String(b.project_id || "novalo");
  const sni: string[] = Array.isArray(b.sni_codes) && b.sni_codes.length ? b.sni_codes.map(String) : Object.keys(SNI_LABEL);
  const minEmp = Math.max(Number(b.min_employees) || 10, 1);
  const source = String(b.source || "Bolagsverket/SCB (Novalo ICP)");
  const listTag = String(b.list_tag || "novalo-icp");
  const limit = Math.min(Math.max(Number(b.limit) || 6, 1), 8);
  const digit = (b.digit === 0 || b.digit) ? String(b.digit) : null;
  const sb = createClient(url, svc);

  const { data: cands, error } = await sb.rpc("pick_icp_candidates", { p_sni: sni, p_digit: digit, p_limit: limit });
  if (error) return J({ error: error.message }, 500);
  if (!cands || !cands.length) return J({ processed: 0, imported: 0, archived: 0, cost_usd: 0, maybe_more: false, done: true });
  if (b.dry_run === true) return J({ batch: cands.length, sample: cands.slice(0, 5).map((c: any) => ({ name: c.name, orgnr: c.orgnr, sni: c.sni_code, city: c.city })) });

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
  // Returns the parsed proxy JSON, or null if the call genuinely failed (429/error/network) after
  // retries. CRITICAL: a null here means "couldn't ask" — the caller must NOT consume the candidate
  // (a 429 is not evidence a company is unsizeable). Anthropic 429s are the main failure under load.
  async function callProxy(task: string, user: string, max: number): Promise<any | null> {
    for (let a = 0; a < 3; a++) {
      try {
        const r = await fetch(`${url}/functions/v1/claude-proxy`, {
          method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + anon, apikey: anon },
          body: JSON.stringify({ model: "claude-haiku-4-5-20251001", task, max_tokens: max, messages: [{ role: "user", content: user }], tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 1 }] }),
        });
        if (r.status === 429) { await sleep(2000 * (a + 1) + Math.floor(Math.random() * 900)); continue; }
        const j = await r.json();
        if (j && j.error === "budget_cap_reached") return null; // global cap hit — stop asking, don't burn retries
        if (j && (j.error || j.type === "error")) { await sleep(1500 * (a + 1)); continue; }
        return j;
      } catch { await sleep(1500 * (a + 1)); }
    }
    return null;
  }

  let cost = 0, imported = 0, archived = 0, failed = 0;
  const results: any[] = [];
  for (const c of cands) {
    const dashed = c.orgnr.length === 10 ? `${c.orgnr.slice(0, 6)}-${c.orgnr.slice(6)}` : c.orgnr;
    const id = "se-" + c.orgnr;
    const where = c.city || c.kommun || "Sweden";
    // 1) size gate — only a DEFINITIVE parsed answer is allowed to consume the candidate.
    const j = await callProxy("find_firmographics", `Company: "${c.name}"\nOrg.nr: ${dashed}\nCity: ${where}\nFind this exact Swedish company's latest employee count and annual revenue.`, 500);
    if (!j) { failed++; results.push({ name: c.name, skipped: "proxy" }); continue; } // 429/err -> leave for next loop
    cost += pCost(j.usage || {});
    const o = firstJson(j);
    if (o === null) { failed++; results.push({ name: c.name, skipped: "nojson" }); continue; } // no parseable answer -> don't consume
    const emp: number | null = (o.employees === null || o.employees === undefined) ? null : Number(o.employees);
    const revSek: number | null = (o.revenue_sek === null || o.revenue_sek === undefined) ? null : Number(o.revenue_sek);
    const conf = String(o.confidence || ""), fsrc = String(o.source || ""), fyear = String(o.revenue_year || "");

    const qualified = emp !== null && !Number.isNaN(emp) && emp >= minEmp;
    let domain: string | null = null;
    if (qualified) {
      const dj = await callProxy("find_domain", `Company: "${c.name}"\nCity: ${where}\nOrg.nr: ${dashed}\nFind this exact Swedish company's official website domain.`, 250);
      if (dj) {
        cost += pCost(dj.usage || {});
        const dobj = firstJson(dj);
        const d = String((dobj && dobj.domain) || "").replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "").toLowerCase().replace(/[^a-z0-9.\-].*$/, "");
        if (d && d.includes(".")) domain = d;
      }
    }

    const row: any = {
      id, name: c.name, orgnr: dashed, project_id: project, source,
      country: "SE", city: c.city || null, county: c.lan || null,
      industry: SNI_LABEL[c.sni_code] || ("SNI " + c.sni_code),
      employees: emp, revenue_ksek: revSek !== null && !Number.isNaN(revSek) ? Math.round(revSek / 1000) : null,
      domain,
      stage: qualified ? "lead" : "archived",
      list_tag: qualified ? listTag : (emp === null ? "size-unknown" : "too-small"),
      enrichment: { firmo: { employees: emp, revenue_sek: revSek, confidence: conf, source: fsrc, year: fyear, min_employees: minEmp }, screened: "icp-screen" },
    };
    const { error: ie } = await sb.from("companies").upsert(row, { onConflict: "id", ignoreDuplicates: true });
    if (!ie) { if (qualified) imported++; else archived++; }
    results.push({ name: c.name, emp, qualified, domain });
  }

  return J({ processed: cands.length, imported, archived, failed, cost_usd: +cost.toFixed(4), maybe_more: cands.length === limit, results });
});
