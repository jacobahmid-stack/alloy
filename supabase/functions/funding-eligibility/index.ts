// funding-eligibility - deterministic AWS funding-program fit scoring, UPSTREAM of
// Partner Central. report-only by default; {apply:true} writes; modes {limit,offset} or
// {company_ids:[...]} or {unscored_only:true}. DETERMINISTIC CORE - never an LLM.
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
  switch (track) {
    case "MAP": return `Migrate ${c.name} from its current non-AWS estate to AWS (MAP): takeout of competitor-cloud / on-prem workloads.`;
    case "MAP_MODERNIZE": return `Modernize ${c.name} on AWS with GenAI/agentic capability on existing workloads (MAP modernize).`;
    case "POC": return `Net-new GenAI/agentic proof-of-concept for ${c.name} (POC credits).`;
    case "ISV_WMP": return `List ${c.name}'s SaaS on AWS Marketplace (WMP): credit routes to the end customer.`;
    case "GREENFIELD_PGP": return `Net-new greenfield build on AWS for ${c.name} (Partner-led / PGP): no existing estate to migrate.`;
    default: return `${c.name}: no current migration/expansion signal, monitor.`;
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

  if (scan && scan.verdict === "aws") detConf = scan.confidence || "med";
  else if (["azure", "gcp", "aws"].includes(cp)) detConf = "high";
  else if (["none", "other"].includes(cp)) detConf = "med";
  else detConf = "low";

  // emp signal for greenfield-vs-migrate split (small + no real estate = net-new build).
  const emp = Number(company.employees);
  const empKnown = isFinite(emp) && emp > 0;
  const onAws = cp === "aws" || awsDet || (scan && scan.verdict === "aws");
  // Greenfield (Partner-led/PGP) vs Migrate (MAP): a company with NO detectable hyperscaler
  // that is also SMALL and data/AI-immature has no real estate to migrate -> net-new build on
  // AWS (PGP). A larger or data-mature non-cloud company DOES have an estate (on-prem/colo)
  // -> Migrate (MAP). cfg.greenfield_max_emp tunes the cutoff.
  const gfMaxEmp = Number(cfg.greenfield_max_emp) || 50;
  const isNetNew = empKnown && emp < gfMaxEmp && (band === null || band <= 1);

  // GenAI-native (band 4 / ai_native) = a net-new GenAI workload -> POC credits is the
  // PRIMARY play, ahead of migrate/modernize, regardless of current cloud. (AWS funds a
  // net-new GenAI pilot as POC, not MAP.) Migrate/Modernize the rest of the estate = secondary.
  if (aiNative || (band !== null && band >= 4)) {
    migration_source = onAws ? "aws" : (cp || "unknown");
    primary = "POC"; ruleConf = "high";
    secondary.push(onAws ? "MAP_MODERNIZE" : "MAP");
    rationale.push(`GenAI-native (band ${band ?? "?"}, ai_native) -> net-new GenAI pilot = POC credits (primary); migrate/modernize the rest (secondary)`);
  } else if (COMPETITOR_CLOUDS.includes(cp)) {
    migration_source = cp; primary = "MAP"; ruleConf = "high";
    rationale.push(`${cp.toUpperCase()} origin -> AWS takeout = MAP`);
    if (band !== null && band >= 3) { secondary.push("POC"); rationale.push(`Data/AI maturity band ${band} -> net-new GenAI workload = POC (secondary)`); }
  } else if (cp === "aws" || awsDet) {
    migration_source = "aws";
    if (band !== null && band >= 3) {
      primary = "MAP_MODERNIZE"; ruleConf = "med";
      rationale.push(`Already on AWS + modern data stack (band ${band}) -> MAP modernize candidate`);
    } else {
      // Already on AWS with no extra AI/data signal is STILL the core partner play:
      // optimize / FinOps / resell / expand on the existing AWS estate (MAP modernize).
      primary = "MAP_MODERNIZE"; ruleConf = "med";
      rationale.push(`Already on AWS -> optimize / FinOps / resell / expand on existing estate (MAP modernize)`);
    }
  } else if (cp === "cloudflare") {
    if (scan && scan.verdict === "aws") {
      migration_source = "aws";
      primary = "MAP_MODERNIZE"; ruleConf = "med";
      rationale.push(`AWS origin behind Cloudflare (${scan.confidence}) -> already on AWS -> optimize / resell / expand (MAP modernize)`);
      if (band !== null && band >= 3) secondary.push("POC");
    } else if (isNetNew) {
      migration_source = "net_new"; primary = "GREENFIELD_PGP"; ruleConf = "low";
      rationale.push(`Behind Cloudflare, no AWS origin, small (${emp} emp) + data/AI-immature -> net-new build on AWS (PGP)`);
    } else {
      migration_source = "unknown"; primary = "MAP"; ruleConf = "low";
      rationale.push(`Behind Cloudflare, no AWS origin -> existing non-AWS estate likely, MAP candidate (low conf)`);
    }
  } else if (cp === "none") {
    if (isNetNew) {
      migration_source = "net_new"; primary = "GREENFIELD_PGP"; ruleConf = "med";
      rationale.push(`No cloud + small (${emp} emp) + data/AI-immature -> net-new build on AWS (PGP)`);
    } else {
      migration_source = "on_prem"; primary = "MAP"; ruleConf = "low";
      rationale.push(`No detectable cloud but established estate -> on-prem/colo migration (MAP)`);
    }
  } else {
    // "other"/"unknown" cloud: CDN-fronted or colo. Small+immature = net-new greenfield;
    // otherwise an existing estate to migrate.
    if (isNetNew) {
      migration_source = "net_new"; primary = "GREENFIELD_PGP"; ruleConf = "low";
      rationale.push(`${cp || "unknown"} footprint, small (${emp} emp) + data/AI-immature -> net-new build on AWS (PGP)`);
    } else {
      migration_source = cp === "other" ? "other_cloud" : "unknown";
      primary = "MAP"; ruleConf = "low";
      rationale.push(`${cp || "unknown"} cloud -> possible on-prem/colo/other estate, MAP candidate (low conf)`);
    }
  }

  const empMap: [number | null, string][] = cfg.employee_band_map ||
    [[10, "<50k"], [50, "50-250k"], [250, "250k-1m"], [1000, "1m-10m"], [null, ">10m"]];
  const est_spend_band = spendBand(company.employees, empMap);
  if (est_spend_band) rationale.push(`~${company.employees ?? "?"} employees -> est. spend ${est_spend_band}`);

  // P4: sector AI-maturity (keyword-match industry -> tier 0..3).
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

  if (primary === "MAP" && (est_spend_band === "<50k" || est_spend_band === "50-250k")) {
    if (!secondary.includes("POC")) secondary.unshift("POC");
    rationale.push(`Below ~$${cfg.map_floor_usd || 250000} MAP floor -> POC better-sized (secondary)`);
  }
  if (band !== null) rationale.push(`Maturity band ${band}${aiNative ? " (AI-native)" : ""}`);

  const confidence = minConf(detConf, ruleConf);
  let score = (TRACK_STRENGTH[primary] || 0)
    + (BAND_SCORE[est_spend_band || ""] || 0)
    + (band !== null ? band * 4 : 0)
    + (sector_tier * 2)
    + (CONF_PTS[confidence] || 0);
  score = Math.max(0, Math.min(100, Math.round(score)));

  const needs_human_review = confidence === "low" || migration_source === "unknown" || primary === "NONE";

  const ace_draft = {
    stage: "Qualified",
    expected_revenue_usd: BAND_MID[est_spend_band || ""] ?? null,
    expected_revenue_band: est_spend_band,
    primary_track: primary,
    secondary_tracks: secondary,
    use_case: useCaseText(primary, company),
    customer: { name: company.name, domain: company.domain, industry: company.industry ?? null, employees: company.employees ?? null },
    sector_tier, sector_label,
    partner_path_note: "Funding access is gated by Partner Path/Tier (and an MDF Wallet for MDF). This score is necessary, not sufficient: org standing is the real gate.",
  };

  return { primary, secondary, score, confidence, migration_source, est_spend_band, rationale, ace_draft, needs_human_review };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  let body: any = {};
  try { body = await req.json(); } catch { /* empty ok */ }
  const limit = Math.min(Math.max(Number(body.limit) || 30, 1), 200);
  const offset = Number(body.offset) || 0;
  const apply = body.apply === true;
  const render = body.render === true;
  const ids = Array.isArray(body.company_ids) ? body.company_ids.filter((x: any) => typeof x === "string") : null;
  const unscoredOnly = body.unscored_only === true;

  const cfg: Record<string, any> = {};
  const { data: cfgRows } = await sb.from("funding_config").select("key, value");
  for (const r of (cfgRows || [])) cfg[r.key] = r.value;

  let rows: any[] | null = null;
  let error: any = null;
  if (unscoredOnly) {
    const scored = new Set<string>();
    const { data: feRows } = await sb.from("funding_eligibility").select("company_id");
    for (const r of (feRows || [])) scored.add(r.company_id);
    const { data: comp, error: cErr } = await sb.from("companies")
      .select("id, name, domain, cloud_provider, aws_detected, maturity_band, ai_native, employees, revenue_ksek, industry")
      .or("list_tag.is.null,list_tag.neq.archived_shell")
      .not("domain", "is", null).order("id", { ascending: true });
    error = cErr;
    rows = (comp || []).filter((c: any) => !scored.has(c.id)).slice(0, limit);
  } else {
    let q = sb.from("companies")
      .select("id, name, domain, cloud_provider, aws_detected, maturity_band, ai_native, employees, revenue_ksek, industry")
      .or("list_tag.is.null,list_tag.neq.archived_shell");
    if (ids && ids.length) q = q.in("id", ids);
    else q = q.not("domain", "is", null).order("id", { ascending: true }).range(offset, offset + limit - 1);
    const res = await q;
    rows = res.data; error = res.error;
  }
  if (error) return json({ error: error.message }, 500);
  const writeRows = unscoredOnly || apply;

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
    if (writeRows) {
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
      mode: unscoredOnly ? "unscored_only" : (ids ? "company_ids" : "range"), batch: (rows || []).length, offset,
      apply: writeRows, wrote, render_requested: render, tracks,
    },
    report,
  });
});
