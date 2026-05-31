// funding-eligibility — deterministic AWS funding-program fit scoring, UPSTREAM of
// Partner Central. Mirrors aws-origin-detect's contract:
//   report-only by default; {apply:true} writes to funding_eligibility;
//   modes {limit,offset} (DB rows) or {company_ids:[...]}.
//
// DETERMINISTIC CORE: the rules below decide the track + score — never an LLM. An LLM
// hallucinating a funding rule is a credibility-killer the first time an AE checks it.
// claude-proxy is reserved for {render:true} to phrase ace_draft prose ONLY (not wired
// yet — default render:false => $0 / no LLM call). It must never change track or number.
//
// Confidence inheritance: funding_confidence = min(detection_confidence, rule_confidence).
// Reads companies + latest_origin_scan (P1 view) + funding_config (tunable heuristics).
import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (o: unknown, status = 200) =>
  new Response(JSON.stringify(o), { status, headers: { ...cors, "Content-Type": "application/json" } });

const COMPETITOR_CLOUDS = ["azure", "gcp"];
const CONF_RANK: Record<string, number> = { low: 1, med: 2, high: 3 };
const minConf = (a: string, b: string) => (CONF_RANK[a] <= CONF_RANK[b] ? a : b);

const TRACK_STRENGTH: Record<string, number> = {
  MAP: 40, ISV_WMP: 35, MAP_MODERNIZE: 35, GREENFIELD_PGP: 30, POC: 25, NONE: 0,
};
const BAND_SCORE: Record<string, number> = {
  "<50k": 4, "50-250k": 10, "250k-1m": 18, "1m-10m": 22, ">10m": 25,
};
const BAND_MID: Record<string, number> = {
  "<50k": 25000, "50-250k": 150000, "250k-1m": 625000, "1m-10m": 5000000, ">10m": 15000000,
};
const CONF_PTS: Record<string, number> = { high: 15, med: 9, low: 4 };

function spendBand(employees: any, empMap: [number | null, string][]): string | null {
  const e = Number(employees);
  if (!isFinite(e) || e <= 0) return null;
  for (const [thr, band] of empMap) { if (thr === null || e < thr) return band; }
  return ">10m";
}

function useCaseText(track: string, c: any): string {
  const ind = c.industry ? ` (${c.industry})` : "";
  switch (track) {
    case "MAP": return `Migrate ${c.name}${ind} from its current non-AWS estate to AWS (MAP) — takeout of competitor-cloud / on-prem workloads.`;
    case "MAP_MODERNIZE": return `Modernize ${c.name}${ind} on AWS with GenAI/agentic capability on existing workloads (MAP modernize).`;
    case "POC": return `Net-new GenAI/agentic proof-of-concept for ${c.name}${ind}.`;
    case "ISV_WMP": return `List ${c.name}'s SaaS on AWS Marketplace (WMP) — credit routes to the end customer.`;
    case "GREENFIELD_PGP": return `Greenfield AWS build for ${c.name}${ind} (no current cloud detected).`;
    default: return `${c.name}${ind}: no current migration/expansion signal — monitor.`;
  }
}

function classify(company: any, scan: any, cfg: any) {
  const cp = String(company.cloud_provider || "").toLowerCase();
  const awsDet = company.aws_detected === true;
  const band = Number.isInteger(company.maturity_band) ? company.maturity_band as number : null;
  const aiNative = company.ai_native === true;
  const rationale: string[] = [];
  const secondary: string[] = [];
  let migration_source = "unknown";
  let primary = "NONE";
  let ruleConf = "low";
  let detConf = "med";

  // --- detection confidence (how sure are we of the CURRENT cloud state) ---
  if (scan && scan.verdict === "aws") detConf = scan.confidence || "med";
  else if (["azure", "gcp", "aws"].includes(cp)) detConf = "high"; // ASN-derived
  else if (["none", "other"].includes(cp)) detConf = "med";
  else detConf = "low"; // cloudflare-unscanned / unknown / null

  // --- migration source + track (the deterministic decision) ---
  if (COMPETITOR_CLOUDS.includes(cp)) {
    migration_source = cp; primary = "MAP"; ruleConf = "high";
    rationale.push(`${cp.toUpperCase()} origin → AWS takeout = MAP`);
    if (band !== null && band >= 3) { secondary.push("POC"); rationale.push(`Data/AI maturity band ${band} → net-new GenAI workload = POC (secondary)`); }
  } else if (cp === "aws" || awsDet) {
    migration_source = "aws";
    if (aiNative || (band !== null && band >= 4)) {
      primary = "MAP_MODERNIZE"; ruleConf = "high"; secondary.push("POC");
      rationale.push(`Already on AWS + GenAI-native (band ${band ?? "?"}) → MAP modernize`);
    } else if (band !== null && band >= 3) {
      primary = "MAP_MODERNIZE"; ruleConf = "med";
      rationale.push(`Already on AWS + modern data stack (band ${band}) → MAP modernize candidate`);
    } else {
      primary = "NONE"; ruleConf = "med";
      rationale.push(`Pure AWS, no migration/expansion signal (band ${band ?? "?"}) → evaluate later`);
    }
  } else if (cp === "cloudflare") {
    if (scan && scan.verdict === "aws") {
      migration_source = "aws";
      primary = (band !== null && band >= 3) ? "MAP_MODERNIZE" : "NONE"; ruleConf = "med";
      rationale.push(`AWS origin behind Cloudflare (${scan.confidence}) → already on AWS`);
      if (primary === "MAP_MODERNIZE") secondary.push("POC");
    } else if (scan && scan.verdict === "none") {
      migration_source = "unknown"; primary = "MAP"; ruleConf = "low";
      rationale.push(`Behind Cloudflare, no AWS origin found → non-AWS origin likely, MAP candidate (low conf)`);
    } else {
      migration_source = "unknown"; primary = "MAP"; ruleConf = "low";
      rationale.push(`Behind Cloudflare, origin not yet scanned → run aws-origin-detect; MAP candidate (low conf)`);
    }
  } else if (cp === "none") {
    migration_source = "unknown"; primary = "GREENFIELD_PGP"; ruleConf = "med";
    rationale.push(`No current cloud detected → greenfield (PGP)`);
  } else {
    migration_source = cp === "other" ? "other_cloud" : "unknown";
    primary = "MAP"; ruleConf = "low";
    rationale.push(`${cp || "unknown"} cloud → possible on-prem/colo/other, MAP candidate (low conf)`);
  }

  // --- spend band (size heuristic; config-driven) ---
  const empMap: [number | null, string][] = cfg.employee_band_map ||
    [[10, "<50k"], [50, "50-250k"], [250, "250k-1m"], [1000, "1m-10m"], [null, ">10m"]];
  const est_spend_band = spendBand(company.employees, empMap);
  if (est_spend_band) rationale.push(`~${company.employees ?? "?"} employees → est. spend ${est_spend_band}`);

  // --- P4: sector AI-maturity (keyword-match industry → tier 0..3; from Strand reports). ---
  // tier 1 (basic, e.g. retail/real-estate) = greenfield digitalization headroom;
  // tier 3 (advanced, e.g. info/comms/finance) = sophisticated buyers. Both lift fit.
  let sector_tier = 0; let sector_label: string | null = null;
  const indL = String(company.industry || "").toLowerCase();
  const sectorCfg = (cfg.sector_maturity && typeof cfg.sector_maturity === "object") ? cfg.sector_maturity : {};
  if (indL) {
    for (const [kw, meta] of Object.entries(sectorCfg as Record<string, any>)) {
      if (indL.includes(kw)) {
        const t = meta && typeof meta === "object" ? Number(meta.tier) || 0 : 0;
        if (t > sector_tier) { sector_tier = t; sector_label = (meta && meta.label) || kw; }
      }
    }
  }
  if (sector_label) rationale.push(`Sector: ${sector_label}`);

  // MAP floor gate: below the ~$250K floor, POC is better-sized.
  if (primary === "MAP" && (est_spend_band === "<50k" || est_spend_band === "50-250k")) {
    if (!secondary.includes("POC")) secondary.unshift("POC");
    rationale.push(`Below ~$${(cfg.map_floor_usd ?? 250000).toLocaleString?.() || cfg.map_floor_usd || 250000} MAP floor → POC better-sized (secondary)`);
  }
  if (band !== null) rationale.push(`Maturity band ${band}${aiNative ? " (AI-native)" : ""}`);

  // --- score (deterministic blend) ---
  const confidence = minConf(detConf, ruleConf);
  let score = (TRACK_STRENGTH[primary] || 0)
    + (BAND_SCORE[est_spend_band || ""] || 0)
    + (band !== null ? band * 4 : 0)
    + (sector_tier * 2)            // P4 sector AI-maturity modifier
    + (CONF_PTS[confidence] || 0);
  score = Math.max(0, Math.min(100, Math.round(score)));

  const needs_human_review = confidence === "low" || migration_source === "unknown" || primary === "NONE";

  // ace_draft carries exactly what AWS's Funding Recommendation agent keys off:
  // opportunity stage, expected revenue, customer use case (Appendix E).
  const ace_draft = {
    stage: "Qualified",
    expected_revenue_usd: BAND_MID[est_spend_band || ""] ?? null,
    expected_revenue_band: est_spend_band,
    primary_track: primary,
    secondary_tracks: secondary,
    use_case: useCaseText(primary, company),
    customer: { name: company.name, domain: company.domain, industry: company.industry ?? null, employees: company.employees ?? null },
    sector_tier, sector_label,
    partner_path_note: "Funding access is gated by Partner Path/Tier (and an MDF Wallet for MDF). This score is necessary, not sufficient — org standing is the real gate.",
  };

  return { primary, secondary, score, confidence, migration_source, est_spend_band, rationale, ace_draft, needs_human_review };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  let body: any = {};
  try { body = await req.json(); } catch { /* empty ok */ }
  const limit = Math.min(Math.max(Number(body.limit) || 30, 1), 100);
  const offset = Number(body.offset) || 0;
  const apply = body.apply === true;             // opt-in write to funding_eligibility
  const render = body.render === true;            // reserved for LLM prose (not wired; $0)
  const ids = Array.isArray(body.company_ids) ? body.company_ids.filter((x: any) => typeof x === "string") : null;

  // config (tunable heuristics)
  const cfg: Record<string, any> = {};
  const { data: cfgRows } = await sb.from("funding_config").select("key, value");
  for (const r of (cfgRows || [])) cfg[r.key] = r.value;

  // company selection
  let q = sb.from("companies")
    .select("id, name, domain, cloud_provider, aws_detected, maturity_band, ai_native, employees, revenue_ksek, industry")
    .or("list_tag.is.null,list_tag.neq.archived_shell");
  if (ids && ids.length) q = q.in("id", ids);
  else q = q.not("domain", "is", null).order("id", { ascending: true }).range(offset, offset + limit - 1);
  const { data: rows, error } = await q;
  if (error) return json({ error: error.message }, 500);

  // latest origin scan per company (P1 view)
  const idList = (rows || []).map((r: any) => r.id);
  const scanMap = new Map<string, any>();
  if (idList.length) {
    const { data: scans } = await sb.from("latest_origin_scan")
      .select("company_id, verdict, confidence").in("company_id", idList);
    for (const s of (scans || [])) scanMap.set(s.company_id, s);
  }

  const report: any[] = [];
  let wrote = 0;
  const tracks: Record<string, number> = {};
  for (const row of (rows || [])) {
    const r = classify(row, scanMap.get(row.id), cfg);
    tracks[r.primary] = (tracks[r.primary] || 0) + 1;
    const rec = {
      company_id: row.id, name: row.name, domain: row.domain,
      primary_track: r.primary, secondary_tracks: r.secondary,
      fundability_score: r.score, confidence: r.confidence,
      migration_source: r.migration_source, est_spend_band: r.est_spend_band,
      rationale: r.rationale, ace_draft: r.ace_draft, needs_human_review: r.needs_human_review,
    };
    if (apply) {
      const { error: upErr } = await sb.from("funding_eligibility").upsert({
        company_id: row.id, primary_track: r.primary, secondary_tracks: r.secondary,
        fundability_score: r.score, confidence: r.confidence, migration_source: r.migration_source,
        est_spend_band: r.est_spend_band, rationale: r.rationale, ace_draft: r.ace_draft,
        needs_human_review: r.needs_human_review, scored_at: new Date().toISOString(),
      }, { onConflict: "company_id" });
      if (!upErr) wrote++; else (rec as any).write_error = upErr.message;
    }
    report.push(rec);
  }

  return json({
    summary: {
      mode: ids ? "company_ids" : "range", batch: (rows || []).length, offset,
      apply, wrote, render_requested: render, render_note: render ? "LLM rendering not wired yet — deterministic rationale only ($0)" : undefined,
      tracks,
    },
    report,
  });
});
