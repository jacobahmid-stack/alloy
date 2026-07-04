// Deterministic funding/ICP scorer: the Alloy "moat" layer (cloud posture -> funding-program fit),
// pure functions, no LLM, no network. Mirrors alloy-page/src/scoring.js so the MCP tool gives the
// same answer the app does. This is the part a horizontal firmographic graph cannot do.

export function estimateFunding(program, oppValueSEK, opts) {
  const usd = (Number(oppValueSEK) || 0) / 10.5; // SEK -> USD, rough planning rate
  if (program === "MAP" || program === "MAP_MODERNIZE") return Math.round(Math.min(usd * 0.25, 100000));
  if (program === "WMP") return Math.round(Math.min(usd * 0.15, 50000));
  if (program === "POC") return (opts && opts.genai)
    ? (usd ? Math.min(Math.round(usd * 0.4), 250000) : 50000)
    : (usd ? Math.min(Math.round(usd * 0.1), 25000) : 5000);
  return 0; // RESELL and unknown carry no upfront program credit
}

const ICP_MAX_EMP = 1000;
const ICP_MAX_REV_KSEK = 2000000;

// Unified ICP score 0-100: cloud + data/AI maturity + reachable contact + size + revenue, minus an
// oversized penalty. Major hyperscalers are scored equally (the home-vs-migrate call is the play, below).
export function icpScore(c, hasContact) {
  let s = 0;
  const prov = c.cloud || "";
  if (prov === "aws" || prov === "azure" || prov === "gcp") s += 28;
  else if (prov === "other" || prov === "cloudflare") s += 5;
  const band = Number(c.maturity_band || 0);
  if (band >= 4) s += 28; else if (band === 3) s += 18; else if (band === 2) s += 8; else if (band === 1) s += 3;
  if (hasContact) s += 16;
  const e = Number(c.employees || 0);
  if (e >= 10 && e <= 500) s += 12; else if (e > 500 && e < ICP_MAX_EMP) s += 6; else if (e > 0 && e < 10) s += 3;
  const rev = Number(c.revenue_ksek || 0);
  if (rev >= 20000 && rev <= 500000) s += 10; else if (rev > 500000 && rev <= ICP_MAX_REV_KSEK) s += 5; else if (rev > 0 && rev < 20000) s += 3;
  if (e >= ICP_MAX_EMP || rev >= ICP_MAX_REV_KSEK) s -= 25; // oversized = off-ICP
  return Math.round(Math.max(0, Math.min(100, s)));
}

// Tri-cloud correctness: the same PLAY maps to a different PROGRAM NAME per hyperscaler. A "migrate"
// play is AWS MAP, Azure Migrate and Modernize, or Google RAMP; an AI play is AWS GenAI PoC, Azure
// Innovate, or Google Cloud AI funding. This is the neutral layer, the answer is cloud-correct per partner.
const PROGRAMS = {
  aws:   { POC: "GenAI PoC funding",             MAP: "Migration Acceleration Program (MAP)",               MAP_MODERNIZE: "MAP Modernize",                RESELL: "Partner-led Resell" },
  azure: { POC: "Azure Innovate (AI and data)",  MAP: "Azure Migrate and Modernize",                        MAP_MODERNIZE: "Azure Migrate and Modernize",  RESELL: "CSP partner-led Resell" },
  gcp:   { POC: "Google Cloud AI funding",        MAP: "Rapid Migration and Modernization Program (RAMP)",  MAP_MODERNIZE: "RAMP (modernize)",             RESELL: "Partner-led Resell" },
};
const TRACK_DESC = {
  POC: "AI/GenAI proof of concept, funded",
  MAP: "migrate net-new workloads to the partner cloud, co-funded",
  MAP_MODERNIZE: "already on the partner cloud, modernize and expand",
  RESELL: "recurring ARR, margin, account control",
};

// The play: net-new money the cloud funds hardest. GenAI initiative -> PoC; not on the partner cloud
// -> migrate; already on the partner cloud -> modernize (or resell). Cloud-agnostic logic, named per cloud below.
export function recommendTrack({ cloud, partner_cloud = "aws", genai = false }) {
  if (genai) return "POC";
  if (cloud === "on-prem" || cloud === "other" || cloud === "unknown") return "MAP";
  if (cloud === partner_cloud) return "MAP_MODERNIZE";
  return "MAP"; // on a different hyperscaler: migrate to the partner cloud
}

export function fundingFit(input) {
  const pc = (input.partner_cloud === "azure" || input.partner_cloud === "gcp") ? input.partner_cloud : "aws";
  const track = recommendTrack({ ...input, partner_cloud: pc });
  const score = icpScore(input, !!input.has_contact);
  const estimate_usd = estimateFunding(track, input.annual_opp_sek || 0, { genai: !!input.genai });
  return {
    partner_cloud: pc,
    play: track,
    play_meaning: TRACK_DESC[track] || "",
    program: (PROGRAMS[pc] || PROGRAMS.aws)[track] || track, // the cloud-correct program name
    icp_score: score,
    // Canonical band thresholds, mirrored from alloy-page/src/scoring.js (FORJ_ICP.md, 2026-07-04).
    // 70/40 everywhere; never fork these numbers again.
    icp_band: score >= 70 ? "hot" : score >= 40 ? "warm" : "cold",
    estimated_funding_usd: estimate_usd,
    estimate_basis: input.annual_opp_sek ? `~${input.annual_opp_sek} SEK annual opportunity` : "no opportunity value given, default tier",
    note: `Directional estimate. Confirm eligibility and amounts with the ${pc.toUpperCase()} partner manager.`,
  };
}
