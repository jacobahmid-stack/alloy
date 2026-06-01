import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";

/* ============================================================================
   ALLOY by FORJ - Forj's prospecting platform
   ----------------------------------------------------------------------------
   Stomme: G-FLOW-logik (hub, produktion, dashboard, företagskort, webbteknik-
   analys, lead-analys, callbacks, mål). Ovanpå: Forjs två-fas-modell
   (Commercial Readiness -> Pipeline).

   Dataåtkomst går genom `db` längst ner. Idag window.storage. Byt bara ut
   db-modulen för Supabase senare - resten av appen rörs inte.

   Webbteknik-analys + Lead-analys körs mot Anthropic-API:t som artifacts har
   inbyggd tillgång till (ingen nyckel behövs). Resultat cachas per company_id.
   ============================================================================ */

// ---- brand ----
// ALLOY is the platform; FORJ is the services company that builds it.
// Product name everywhere: "ALLOY by FORJ".
const BRAND = "ALLOY";           // the platform
const MAKER = "Forj";            // the company behind it
const BRAND_FULL = "ALLOY by FORJ";
const SLOGAN = "Where pipeline is forged.";  // swap this one line to change the tagline everywhere

// ---- små helpers ----
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const now = () => new Date().toISOString();
const norm = (v) => (v == null ? "" : String(v).trim());
const lc = (v) => norm(v).toLowerCase();
const num = (v) => {
  const n = parseFloat(String(v).replace(/[^0-9.,-]/g, "").replace(/\s/g, "").replace(",", "."));
  return isNaN(n) ? null : n;
};
const initials = (s) =>
  norm(s).split(/\s+/).slice(0, 2).map((w) => w[0] || "").join("").toUpperCase();

function fmtDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const months = ["jan", "feb", "mar", "apr", "maj", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];
  return `${d.getDate()} ${months[d.getMonth()]} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
function fmtDateShort(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const months = ["jan", "feb", "mar", "apr", "maj", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}
function daysAgo(iso) {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}
function dayStr(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), da = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
}
function isToday(iso) {
  if (!iso) return false;
  const d = new Date(iso), t = new Date();
  return d.toDateString() === t.toDateString();
}
function isThisWeek(iso) {
  if (!iso) return false;
  return daysAgo(iso) <= 7 && daysAgo(iso) >= 0;
}
function isThisMonth(iso) {
  if (!iso) return false;
  const d = new Date(iso), t = new Date();
  return d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear();
}

/* ============================================================================
   PIPELINE-STADIER  -  Forjs två faser
   ============================================================================ */
const PHASES = {
  readiness: {
    label: "Commercial Readiness",
    short: "Readiness",
    color: "#B83D0C",
    stages: [
      { key: "lead", label: "Lead" },
      { key: "research", label: "Researched" },
      { key: "hypotes", label: "Hypothesis ready" },
      { key: "redo", label: "Ready to contact" },
    ],
  },
  pipeline: {
    label: "Pipeline",
    short: "Pipeline",
    color: "#3E5A7A",
    stages: [
      { key: "kontaktad", label: "Contacted" },
      { key: "mote_bokat", label: "Meeting booked" },
      { key: "kvalificerad", label: "Qualified" },
      { key: "forslag", label: "Proposal" },
      { key: "vunnen", label: "Won" },
      { key: "forlorad", label: "Lost" },
    ],
  },
};
const ALL_STAGES = [...PHASES.readiness.stages, ...PHASES.pipeline.stages];
const STAGE_LABEL = Object.fromEntries(ALL_STAGES.map((s) => [s.key, s.label]));
const READINESS_KEYS = PHASES.readiness.stages.map((s) => s.key);
const PIPELINE_KEYS = PHASES.pipeline.stages.map((s) => s.key);
function phaseOf(stage) {
  if (READINESS_KEYS.includes(stage)) return "readiness";
  if (PIPELINE_KEYS.includes(stage)) return "pipeline";
  return "readiness";
}
/* One-click call outcomes - drive activity log + next action + stage in one tap */
const OUTCOMES = {
  no_answer:    { label: "No answer",      type: "Call",    act: "No answer",            days: 2,    next: "Call again - no answer",  tone: "dim" },
  gatekeeper:   { label: "Gatekeeper",     type: "Call",    act: "Reached gatekeeper",   days: 3,    next: "Get past gatekeeper",     stage: "kontaktad", tone: "dim" },
  spoke:        { label: "Spoke",          type: "Call",    act: "Spoke with prospect",  days: 7,    next: "Follow up after call",    stage: "kontaktad", tone: "blue" },
  booked:       { label: "Booked",         type: "Meeting", act: "Meeting booked",       days: null, next: "Prepare for meeting",     stage: "mote_bokat", clearDate: true, always: true, tone: "green" },
  not_interest: { label: "Not interested", type: "Call",    act: "Not interested",       days: null, next: "",                        stage: "forlorad",   clearDate: true, always: true, tone: "red" },
};
const OUTCOME_ORDER = ["no_answer", "gatekeeper", "spoke", "booked", "not_interest"];
/* Unified ICP score (0-100): one sortable number combining fit + AWS + contact + size + website */
function icpScore(c, hasContact) {
  let s = 0;
  if (c.leadanalysis && c.leadanalysis.score != null) s += c.leadanalysis.score * 0.45; // fit, max 45
  // Cloud infrastructure signal: on AWS = warm/partner-aligned; GCP/Azure = prime migration/displacement target
  const prov = c.cloud_provider || (c.aws_detected ? "aws" : "");
  if (c.aws_detected || prov === "aws") s += 20;
  else if (prov === "gcp" || prov === "azure") s += 14;            // displacement target
  else if (prov === "cloudflare" || prov === "other") s += 4;      // some cloud footprint
  if (hasContact) s += 12;                                                              // reachable, 12
  const e = c.employees || 0;                                                           // size sweet spot, max 10
  if (e >= 10 && e <= 500) s += 10; else if (e > 500 && e <= 2000) s += 6; else if (e > 0) s += 3;
  if (c.domain) s += 8;                                                                 // has website, 8
  if (c.score) s += Math.min(5, (c.score / 10) * 5);                                    // manual score, max 5
  return Math.round(Math.min(100, s));
}
function icpColor(v) { return v >= 65 ? C.green : v >= 40 ? C.amber : C.dim2; }
/* Forecast: probability a deal closes, by stage */
const STAGE_PROB = { lead: 0, research: 0, hypotes: 0, redo: 5, kontaktad: 10, mote_bokat: 25, kvalificerad: 45, forslag: 70, vunnen: 100, forlorad: 0 };
function fmtSEK(n) {
  const v = Number(n) || 0;
  if (v >= 1e6) return (v / 1e6).toFixed(v >= 1e7 ? 0 : 1).replace(".", ",") + " M kr";
  if (v >= 1e3) return Math.round(v / 1e3) + " k kr";
  return Math.round(v) + " kr";
}

/* ============================================================================
   CUSTOMER AWS FUNDING JOURNEY - catalog + per-deal recommendation logic
   Customer-facing programs only, by journey phase: OLA/MRA (assess),
   POC / Credits / Jumpstart (build & prove), MAP / WMP (migrate & modernize).
   ============================================================================ */
const FUNDING_STAGES = ["Created", "AWS Review", "Tech Approval", "Business Approval", "Finance Approval", "Pre-Approval", "Cash Claim", "Completed"];
const FUNDING_STATUSES = ["Draft", "Submitted", "Approved", "Active", "Completed", "Rejected", "Cancelled"];
const MAP_PHASES = ["Assess", "Mobilize", "Migrate & Modernize"];
/* The customer's AWS funding journey - every program a prospect can tap, by phase. */
const FUNDING_JOURNEY = ["Assess", "Build & Prove", "Migrate & Modernize"];
const FUNDING_PROGRAMS = {
  OLA:       { name: "Optimization & Licensing Assessment (OLA)", journey: "Assess",              type: "credits", blurb: "Free AWS assessment of the customer's workloads & licensing - surfaces right-sizing and cost savings. A strong door-opener." },
  MRA:       { name: "Migration Readiness Assessment (MRA)",      journey: "Assess",              type: "credits", blurb: "Structured review of the customer's readiness to migrate; identifies gaps and builds the migration business case." },
  POC:       { name: "Proof of Concept (POC)",                    journey: "Build & Prove",       type: "credits", blurb: "AWS credits to build a POC / pilot for the customer. Routes through AWS Review + Tech Approval (PSA)." },
  Credits:   { name: "AWS Promotional Credits",                   journey: "Build & Prove",       type: "credits", blurb: "Credits that de-risk experimentation and early build for the customer." },
  Jumpstart: { name: "Jumpstart",                                 journey: "Build & Prove",       type: "credits", blurb: "Kickstart funding to get the customer's first workload moving." },
  MAP:       { name: "Migration Acceleration Program (MAP)",      journey: "Migrate & Modernize", type: "both",    blurb: "Co-funds the customer's migration to AWS (assess → mobilize → migrate). Cash + credits scale with committed migration spend." },
  WMP:       { name: "Workload Migration Program (WMP)",          journey: "Migrate & Modernize", type: "both",    blurb: "Co-funds migrating a specific customer workload to AWS." },
};
const JOURNEY_COLOR = { "Assess": "#3E5A7A", "Build & Prove": "#B83D0C", "Migrate & Modernize": "#2E7D32" };
function fmtMoney(amount, currency) {
  const v = Number(amount) || 0; const c = currency || "USD";
  const n = v >= 1e6 ? (v / 1e6).toFixed(1).replace(".", ",") + " M" : v >= 1e3 ? Math.round(v / 1e3) + " k" : String(Math.round(v));
  return c === "USD" ? "$" + n : n + " " + c;
}
/* Rough planning estimate only - AWS determines real eligibility/amounts. opp_value is annual SEK. */
function estimateFunding(program, oppValueSEK) {
  const usd = (Number(oppValueSEK) || 0) / 10.5;
  if (program === "MAP") return Math.round(Math.min(usd * 0.25, 100000));
  if (program === "WMP") return Math.round(Math.min(usd * 0.15, 50000));
  if (program === "POC") return usd ? Math.min(Math.round(usd * 0.1), 15000) : 5000;
  if (program === "Credits") return 2500;
  if (program === "Jumpstart") return 2500;
  return 0; // OLA & MRA are free assessments
}
/* Which customer-journey programs this prospect can tap - mirrors AWS's stage + value + use-case + AWS-path logic */
function recommendFunding(company) {
  const txt = lc([company.industry, company.enrichment?.aws_value, company.enrichment?.description, company.enrichment?.research_notes, company.leadanalysis?.angle].filter(Boolean).join(" "));
  const onAws = !!company.aws_detected;
  const migrationSignal = /migrat|on-?prem|datacenter|data center|lyfta|flytta|vmware|legacy|server/.test(txt);
  const optimizeSignal = /cost|kostnad|optim|licens|right-?siz|spend|besparing/.test(txt);
  const recs = [];
  if (!onAws) {
    recs.push({ key: "MRA", reason: "Not on AWS yet - an MRA maps their readiness to migrate and builds the business case before you commit them." });
    recs.push({ key: "MAP", reason: "Greenfield migration play - MAP co-funds the whole journey (assess → mobilize → migrate)." });
  } else {
    recs.push({ key: "OLA", reason: "Already on AWS - OLA surfaces right-sizing and licensing savings to justify the next phase." });
    if (optimizeSignal) recs.push({ key: "MAP", reason: "Cost/optimization signals in the notes - MAP funding can underwrite the modernization phase." });
  }
  if (phaseOf(company.stage) === "readiness" || company.stage === "kontaktad") {
    recs.push({ key: "POC", reason: "Early in the cycle - POC credits fund a pilot to prove value before a bigger commitment." });
  } else {
    recs.push({ key: "Credits", reason: "Promotional credits de-risk the customer's next workload and keep momentum." });
  }
  if (migrationSignal && !recs.some((r) => r.key === "MAP")) recs.push({ key: "MAP", reason: "Migration language in the notes - MAP is the core migration funding vehicle." });
  const seen = new Set(); const out = [];
  for (const r of recs) { if (!seen.has(r.key) && FUNDING_PROGRAMS[r.key]) { seen.add(r.key); out.push(r); } if (out.length === 3) break; }
  return out;
}
const STATUS_COLOR = {
  lead: "#A4A09B", research: "#A4A09B", hypotes: "#B83D0C", redo: "#B83D0C",
  kontaktad: "#3E5A7A", mote_bokat: "#4E7A3E", kvalificerad: "#3E5A7A",
  forslag: "#9A6A18", vunnen: "#4E7A3E", forlorad: "#A33214",
};
// Canonical contact-status vocabulary - the single set the UI writes. The read
// path and the write path share this vocabulary (see normalizeStatus).
const CONTACT_STATUSES = [
  "Not contacted", "Contacted", "Active dialogue", "Ready to call",
  "No answer", "Meeting booked", "Keep warm", "Not interested", "Disqualified",
];
// Bridge: legacy Swedish (seed) + older English variants → canonical. Lets us
// display stored data consistently without rewriting it; editing a contact
// migrates its status to canonical on save. Unknown values pass through.
const STATUS_ALIASES = {
  "Ej kontaktad": "Not contacted", "Kontaktad": "Contacted", "Möte bokat": "Meeting booked",
  "Ej svar": "No answer", "EJ SVAR": "No answer", "Växel": "No answer",
  "Ringt – inget svar": "No answer", "Called – no answer": "No answer", "Switchboard": "No answer",
  "Diskvalificerad": "Disqualified", "EJ AKTUELL": "Disqualified", "Not relevant": "Disqualified",
  "EJ INTRESSERAD": "Not interested", "Aktiv dialog": "Active dialogue",
  "Redo att ringa": "Ready to call",
  "Håll varm": "Keep warm", "Håll varm – möte efter sommaren": "Keep warm",
  // "Cloud Family" left unmapped on purpose - it's an existing-partner signal,
  // not a contact status, and should become a real flag (see audit).
};
function normalizeStatus(s) {
  if (!s) return "Not contacted";
  if (CONTACT_STATUSES.includes(s)) return s; // already canonical
  return STATUS_ALIASES[s] || s;              // bridge, or pass through unknown
}
const statusLabel = normalizeStatus;

/* ============================================================================
   CSV-IMPORT  -  återanvänd från tidigare, robust mot tre listformat
   ============================================================================ */
function parseCSV(text) {
  const rows = [];
  let row = [], field = "", inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i], next = text[i + 1];
    if (inQuotes) {
      if (c === '"' && next === '"') { field += '"'; i++; }
      else if (c === '"') inQuotes = false;
      else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ",") { row.push(field); field = ""; }
      else if (c === "\t") { row.push(field); field = ""; }
      else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
      else if (c === "\r") { /* skip */ }
      else field += c;
    }
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((c) => norm(c) !== ""));
}

function findHeaderRow(rows) {
  const keywords = [
    "company", "company name", "company / account", "företag", "namn",
    "first name", "last name", "email", "title", "tier", "score",
    "lead lifecycle", "domain", "org.nr", "employees", "industry",
  ];
  let best = 0, bestScore = -1;
  for (let i = 0; i < Math.min(rows.length, 15); i++) {
    const cells = rows[i].map(lc);
    let score = cells.filter((c) => keywords.includes(c)).length;
    score += rows[i].filter((c) => norm(c) !== "").length * 0.1;
    if (score > bestScore) { bestScore = score; best = i; }
  }
  return best;
}

function mapRow(obj, source) {
  const g = (...keys) => {
    for (const k of keys) {
      const found = Object.keys(obj).find((h) => lc(h) === lc(k));
      if (found && norm(obj[found]) !== "") return norm(obj[found]);
    }
    return "";
  };
  const companyName = g("company", "company name", "company / account", "företag", "account");
  if (!companyName) return null;

  const first = g("first name", "förnamn");
  const last = g("last name", "efternamn");
  const title = g("title", "titel", "roll");
  const email = g("email", "e-post", "epost");
  const phone = g("mobile phone", "phone", "telefon", "corporate phone", "växel");
  const personStatus = g("person status", "status");

  const tier = g("tier");
  const score = num(g("score", "lead_score", "lead score"));

  const company = {
    id: uid(),
    name: companyName,
    orgnr: g("org.nr", "orgnr", "org nr"),
    domain: g("domain", "hemsida", "website", "webb"),
    city: g("city", "hq", "stad", "ort"),
    county: g("county", "län"),
    country: g("country", "land"),
    industry: g("industry", "sni industry", "bransch"),
    employees: num(g("employees", "# employees", "anställda", "antal anställda")),
    revenue_ksek: num(g("revenue (ksek)", "revenue", "omsättning", "nettoomsättning")),
    ceo: g("vd", "ceo"),
    company_type: g("company type", "bolagstyp"),
    source,
    list_tag: tier || "",
    stage: "lead",
    score,
    tier,
    aws_detected:
      lc(g("aws detected", "has_aws")) === "true" || lc(g("aws detected", "has_aws")) === "ja",
    aws_signals: g("aws signals", "aws_signals"),
    next_action: g("next action", "next_action"),
    notes: g("your_notes", "notes", "anteckningar"),
    enrichment: {
      description: g("description", "beskrivning"),
      aws_value: g("aws_value", "aws value", "suggested aws use cases"),
      research_notes: g("research_notes", "research notes"),
      lead_source: g("lead source"),
      opportunity: g("opportunity name"),
    },
    techstack: null,    // sätts av webbteknik-analys
    techstack_at: null,
    leadanalysis: null, // sätts av lead-analys
    leadanalysis_at: null,
    innovation: null,   // sätts av data/AI-innovationsanalys (analyzeInnovation)
    innovation_at: null,
    maturity_band: null, ai_native: null, aws_alignment: null,
    created_at: now(),
    updated_at: now(),
  };

  const contacts = [];
  if (first || last || email) {
    contacts.push({
      id: uid(),
      company_id: company.id,
      first_name: first,
      last_name: last,
      title,
      email,
      phone,
      status: personStatus || "Ej kontaktad",
    });
  }
  return { company, contacts };
}

function parseToRecords(text, source) {
  const rows = parseCSV(text);
  if (!rows.length) return { companies: [], contacts: [], total: 0 };
  const hr = findHeaderRow(rows);
  const headers = rows[hr].map(norm);
  const dataRows = rows.slice(hr + 1);
  const companies = [], contacts = [];
  const byName = new Map();
  for (const r of dataRows) {
    const obj = {};
    headers.forEach((h, i) => (obj[h] = r[i]));
    const mapped = mapRow(obj, source);
    if (!mapped) continue;
    const key = lc(mapped.company.name);
    if (byName.has(key)) {
      const existing = byName.get(key);
      mapped.contacts.forEach((c) => { c.company_id = existing.id; contacts.push(c); });
    } else {
      byName.set(key, mapped.company);
      companies.push(mapped.company);
      contacts.push(...mapped.contacts);
    }
  }
  return { companies, contacts, total: dataRows.length };
}

/* ============================================================================
   CLAUDE-API  -  webbteknik-analys + lead-analys
   ----------------------------------------------------------------------------
   Artifacts har inbyggd åtkomst till Anthropic /v1/messages utan nyckel.
   Vi ber Claude hämta sajten (web_fetch) och returnera strukturerad JSON.
   ============================================================================ */
const MODEL_API = "claude-sonnet-4-5";             // via claude-proxy → real Anthropic API (the only path now)

async function callClaude({ user, tools, maxTokens = 2000, task }) {
  // Resolve the Claude endpoint. Priority:
  //   1. Explicit override window.__ALLOY_CLAUDE_PROXY__ (full URL), if ever set.
  //   2. The Supabase claude-proxy edge function, whenever Supabase is configured.
  //      This is the deployed/standalone path: the real ANTHROPIC_API_KEY lives
  //      server-side in the edge function and the client authenticates with its JWT
  //      (the anon key satisfies verify_jwt). Works inside a Claude artifact too.
  //   3. Key-less in-artifact endpoint, only as a last resort when no Supabase config
  //      is present (otherwise this 401s on a deployed build - the bug this replaces).
  const sbUrl = (typeof window !== "undefined" && window.__ALLOY_SUPABASE__?.url) || "";
  const explicitProxy = (typeof window !== "undefined" && window.__ALLOY_CLAUDE_PROXY__) || "";
  const proxy = explicitProxy || (sbUrl ? `${sbUrl}/functions/v1/claude-proxy` : "");
  if (!proxy) throw new Error("Alloy requires its backend - claude-proxy is not configured.");
  const body = {
    model: MODEL_API,
    max_tokens: maxTokens,
    messages: [{ role: "user", content: user }],
  };
  if (tools) body.tools = tools;
  if (task) body.task = task;
  const endpoint = proxy;
  const headers = { "Content-Type": "application/json" };
  if (proxy) {
    // Proxy requires a valid Supabase JWT (verify_jwt). The anon key is one.
    const ak = (typeof window !== "undefined" && window.__ALLOY_SUPABASE__?.anonKey) || "";
    if (ak) { headers["Authorization"] = "Bearer " + ak; headers["apikey"] = ak; }
  }
  const DELAYS = [5000, 15000, 30000];
  for (let attempt = 0; attempt <= DELAYS.length; attempt++) {
    const res = await fetch(endpoint, { method: "POST", headers, body: JSON.stringify(body) });
    if (res.ok) {
      const data = await res.json();
      return (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
    }
    let detail = "";
    try { detail = await res.text(); } catch {}
    const is429 = res.status === 429 || res.status === 529 || res.status === 503;
    if (is429 && attempt < DELAYS.length) {
      const retryAfter = res.headers?.get("retry-after");
      const wait = retryAfter ? Math.min(Number(retryAfter) * 1000 + 500, 60000) : DELAYS[attempt];
      await new Promise((r) => setTimeout(r, wait));
      continue;
    }
    let msg = "API " + res.status;
    try { const j = JSON.parse(detail); msg += " - " + (j?.error?.message || j?.message || detail.slice(0, 160)); } catch { if (detail) msg += " - " + detail.slice(0, 160); }
    throw new Error(msg);
  }
}

function extractJSON(text) {
  let t = (text || "").replace(/```json\s*/gi, "").replace(/```/g, "").trim();
  const s = t.indexOf("{"), e = t.lastIndexOf("}");
  if (s === -1 || e === -1) throw new Error("ingen JSON i svar");
  return JSON.parse(t.slice(s, e + 1));
}

// ---- WEBBTEKNIK-ANALYS ----
// Efterliknar G-FLOW: kategoriserad stack, allt ovanpå och utanför CDN/proxy.
const TECH_CATEGORIES = [
  { key: "ramverk", label: "Frameworks & libraries" },
  { key: "cms", label: "CMS & e-commerce" },
  { key: "datadriven", label: "Customer data & product analytics" },  // CDP + product analytics - data-maturity tell
  { key: "sok", label: "Site search & discovery" },                   // Algolia etc - applied ML
  { key: "baas", label: "App platform / BaaS" },                      // Supabase/Firebase
  { key: "genai_ui", label: "AI interface" },                         // browser-visible GenAI artifacts
  { key: "analys", label: "Analytics & tracking" },
  { key: "widgets", label: "Widgets & advertising" },
  { key: "cdn", label: "CDN / proxy" },
  { key: "hosting", label: "Hosting / infrastructure" },
  { key: "dns", label: "DNS" },
  { key: "epost", label: "Email" },
  { key: "server", label: "Languages & server" },
  { key: "typsnitt", label: "Fonts & UI" },
];

async function detectAws(domain) {
  const cfg = (typeof window !== "undefined" && window.__ALLOY_SUPABASE__) || {};
  const base = (cfg.url || "").replace(/\/+$/, "");
  if (!base) throw new Error("Supabase URL missing (requires the standalone build)");
  const ak = cfg.anonKey || "";
  const headers = { "Content-Type": "application/json" };
  if (ak) { headers["Authorization"] = "Bearer " + ak; headers["apikey"] = ak; }
  const res = await fetch(base + "/functions/v1/aws-detect", { method: "POST", headers, body: JSON.stringify({ domain }) });
  const text = await res.text();
  if (!res.ok) throw new Error("aws-detect " + res.status + " - " + text.slice(0, 160));
  return JSON.parse(text);
}

// Deterministic AWS funding-program fit (track + score + rationale). $0 - no LLM.
// apply:false = compute/preview; apply:true = persist to funding_eligibility.
async function scoreFundingFit(companyId, apply = false) {
  const cfg = (typeof window !== "undefined" && window.__ALLOY_SUPABASE__) || {};
  const base = (cfg.url || "").replace(/\/+$/, "");
  if (!base) throw new Error("Supabase URL missing (requires the standalone build)");
  const ak = cfg.anonKey || "";
  const headers = { "Content-Type": "application/json" };
  if (ak) { headers["Authorization"] = "Bearer " + ak; headers["apikey"] = ak; }
  const res = await fetch(base + "/functions/v1/funding-eligibility", {
    method: "POST", headers, body: JSON.stringify({ company_ids: [companyId], apply }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error("funding-eligibility " + res.status + " - " + text.slice(0, 160));
  const data = JSON.parse(text);
  return (data.report || [])[0] || null;
}

async function registrySearch(params) {
  const cfg = (typeof window !== "undefined" && window.__ALLOY_SUPABASE__) || {};
  const base = (cfg.url || "").replace(/\/+$/, "");
  if (!base) throw new Error("Supabase URL missing (requires the standalone build)");
  const ak = cfg.anonKey || "";
  const headers = { "Content-Type": "application/json" };
  if (ak) { headers["Authorization"] = "Bearer " + ak; headers["apikey"] = ak; }
  const res = await fetch(base + "/functions/v1/registry-search", { method: "POST", headers, body: JSON.stringify(params || {}) });
  const text = await res.text();
  if (!res.ok) throw new Error("registry-search " + res.status + " - " + text.slice(0, 160));
  const data = JSON.parse(text);
  if (data && data.error) throw new Error(data.error);
  return data;
}

// Normalize a Swedish org number to 10 digits (strip dash + optional 16-prefix).
function normOrgnr(raw) {
  const d = String(raw || "").replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("16")) return d.slice(2);
  return d;
}
// Look up a Swedish company by org number against the loaded SCB registry (se_registry).
// $0, instant, no external call beyond our own edge function. Returns a registry row or null.
async function orgLookup(orgnr) {
  const data = await registrySearch({ country: "SE", orgnr: normOrgnr(orgnr) });
  return (data.results || [])[0] || null;
}

async function seIngest(body) {
  const cfg = (typeof window !== "undefined" && window.__ALLOY_SUPABASE__) || {};
  const base = (cfg.url || "").replace(/\/+$/, "");
  if (!base) throw new Error("Supabase URL missing (requires the standalone build)");
  const ak = cfg.anonKey || "";
  const tok = AUTH_TOKEN || ak;
  const res = await fetch(base + "/functions/v1/se-ingest", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer " + tok, "apikey": ak },
    body: JSON.stringify(body || {}),
  });
  const text = await res.text();
  if (!res.ok) throw new Error("se-ingest " + res.status + " - " + text.slice(0, 200));
  const data = JSON.parse(text);
  if (data && data.ok === false) throw new Error(data.error || "ingest failed");
  return data;
}

async function seEdge(name, body) {
  const cfg = (typeof window !== "undefined" && window.__ALLOY_SUPABASE__) || {};
  const base = (cfg.url || "").replace(/\/+$/, "");
  if (!base) throw new Error("Supabase URL missing (requires the standalone build)");
  const ak = cfg.anonKey || "";
  const tok = AUTH_TOKEN || ak;
  const res = await fetch(base + "/functions/v1/" + name, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer " + tok, "apikey": ak },
    body: JSON.stringify(body || {}),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(name + " " + res.status + " - " + text.slice(0, 200));
  const data = JSON.parse(text);
  if (data && data.ok === false) throw new Error(data.error || (name + " failed"));
  return data;
}
const seStage = (body) => seEdge("se-stage", body);
const seProcess = (body) => seEdge("se-process", body);

async function seIngestState() {
  const { url, anonKey } = sbConf();
  const base = (url || "").replace(/\/+$/, "");
  if (!base) return null;
  const res = await fetch(base + "/rest/v1/se_ingest_state?id=eq.1&select=*", {
    headers: { apikey: anonKey, Authorization: "Bearer " + (AUTH_TOKEN || anonKey) },
  });
  if (!res.ok) return null;
  const rows = await res.json().catch(() => []);
  return Array.isArray(rows) && rows[0] ? rows[0] : null;
}

async function analyzeTechStack(domain) {
  const url = domain.startsWith("http") ? domain : "https://" + domain.replace(/^\/+/, "");
  // Agent loop with the real-HTML fetch_tech tool - frontend fingerprints (window.posthog,
  // cdn.segment.com, response headers) are only visible this way; web_search alone can't see them.
  const prompt =
    `Identify the web + data/AI technology stack of ${url}.\n` +
    `FIRST call fetch_tech("${url}") to get the real fingerprint surface (script/link hosts, headers, <meta generator>, detected JS globals). ` +
    `You may call fetch_tech once more on an obvious sub-path (e.g. ${url}/blog or a /app login) if the homepage is thin. Then classify ONLY what the fingerprints show.\n\n` +
    `Map evidence to categories:\n` +
    `- ramverk frameworks (Next.js via x-powered-by/_next, React, Vue, Gatsby via meta generator); cms (WordPress, Sitevision, Shopify, Payload); analys plain web analytics (GA4/gtag, Matomo, Hotjar); widgets (Cookiebot, Intercom, HubSpot); cdn (Cloudflare, CloudFront, Fastly, Akamai via headers/hosts); hosting (Vercel, Netlify, S3, Azure via server header); dns; epost; server (nginx/apache/php via server header); typsnitt (Google Fonts, Tailwind).\n` +
    `- datadriven CDP & product analytics: window.analytics/cdn.segment.com=Segment, rudderanalytics=RudderStack, snowplow, window.amplitude=Amplitude, window.mixpanel=Mixpanel, window.heap=Heap, window.posthog=PostHog. (Plain GA4/gtag stays in 'analys'.)\n` +
    `- sok site search: algolia, coveo, klevu, loop54.\n` +
    `- baas: supabase, firebase.\n` +
    `- genai_ui browser GenAI: vercel-ai-sdk (x-vercel-ai-data-stream), copilotkit, streamlit, gradio, chainlit, huggingface (*.hf.space).\n` +
    `The fetch_tech "globals" list names the detected fingerprint directly - trust it. Report a tool ONLY if a fingerprint shows it; never guess from the brand or industry. Do not report bare programming languages.\n\n` +
    `Respond ONLY with JSON in exactly this shape:\n` +
    `{"items":[{"category":"<one of: ramverk|cms|datadriven|sok|baas|genai_ui|analys|widgets|cdn|hosting|dns|epost|server|typsnitt>","name":"<technology name>"}],` +
    `"behind_proxy":<true if Cloudflare/WAF hides the stack, else false>,` +
    `"note":"<short comment, e.g. if something couldn't be verified>"}`;
  const { text } = await runAgent({ prompt, task: "techstack", tools: [
    { name: "fetch_tech", description: "Fetch a page's tech fingerprint surface (script/link hosts, headers, meta generator, JS globals).", input_schema: { type: "object", properties: { url: { type: "string" } }, required: ["url"] } },
  ], maxTokens: 1500, maxSteps: 3 });
  const json = extractJSON(text);
  return { ...json, analyzed_at: now(), url };
}

// Legacy search-only analyzer (kept for reference; superseded by the fetch_tech agent above).
async function analyzeTechStackLegacy(domain) {
  const url = domain.startsWith("http") ? domain : "https://" + domain.replace(/^\/+/, "");
  const user =
    `Fetch ${url} and identify every web technology you find evidence for. ` +
    `Look broadly: frameworks (Next.js, React, Vue), CMS (WordPress, Sitevision), ` +
    `analytics (GA4, Matomo), widgets (Cookiebot, chat), CDN/proxy (CloudFront, ` +
    `Cloudflare), hosting (S3, Vercel, Azure), DNS (Route 53, One.com), email ` +
    `(Google Workspace, Microsoft 365 via MX), server (Apache, Nginx, PHP), ` +
    `fonts (Google Fonts, Tailwind).\n\n` +
    `ALSO look specifically for these data/AI maturity signals (match by the EXACT fingerprint, not the brand name alone - a wrong hit is worse than a miss):\n` +
    `- datadriven (customer data platforms & product analytics): Segment (window.analytics + cdn.segment.com), RudderStack (window.rudderanalytics + cdn.rudderlabs.com - distinguish from Segment by the CDN host), Snowplow (collector path /com.snowplowanalytics.snowplow/tp2 or sp.js), Amplitude (window.amplitude / *.amplitude.com incl. api.eu.amplitude.com), Mixpanel (window.mixpanel / api*.mixpanel.com / cdn.mxpnl.com), Heap (window.heap / cdn.heapanalytics.com), PostHog (window.posthog / *.posthog.com incl. eu.i.posthog.com). Put plain GA4/Matomo/Hotjar in 'analys', NOT here.\n` +
    `- sok (site search / discovery): Algolia (*.algolia.net XHR or window.algoliasearch), Coveo, Constructor.io, Klevu, Loop54 (Nordic).\n` +
    `- baas (backend-as-a-service): Supabase (*.supabase.co requests / supabase-js), Firebase (window.firebase / *.firebaseio.com / firebaseapp.com).\n` +
    `- genai_ui (browser-visible GenAI artifacts): Vercel AI SDK (response header x-vercel-ai-data-stream or a data-stream body to /api/chat), CopilotKit (copilotkit bundle/DOM or /copilotkit endpoint), Streamlit (/_stcore/stream, .stApp), Gradio (window.gradio_config, gradio-app), Chainlit (__chainlit), Hugging Face Spaces (*.hf.space iframe). A live LLM chat/demo here is a strong 'ships GenAI' signal.\n` +
    `Do NOT report programming languages as products. Only report a data/AI tool if you actually saw its fingerprint.\n\n` +
    `Return JSON in exactly this shape:\n` +
    `{"items":[{"category":"<one of: ramverk|cms|datadriven|sok|baas|genai_ui|analys|widgets|cdn|hosting|dns|epost|server|typsnitt>","name":"<technology name>"}],` +
    `"behind_proxy":<true if Cloudflare/WAF hides the stack, else false>,` +
    `"note":"<short comment, e.g. if something couldn't be verified>"}`;
  const tools = [{ type: "web_search_20250305", name: "web_search", max_uses: 2 }];
  const text = await callClaude({
    user: user + "\n\n(Use web_search to fetch and verify the site.)",
    tools,
    maxTokens: 1500,
    task: "techstack",
  });
  const json = extractJSON(text);
  return { ...json, analyzed_at: now(), url };
}

/* ============================================================================
   DATA & AI INNOVATION PROFILE  -  reads a company's digitalization maturity
   from its data/AI/automation tooling. Backend tools (Snowflake, LangChain,
   Bedrock, dbt, vector DBs…) have NO frontend fingerprint, so this is an
   LLM research pass over job ads / eng blog / public GitHub (+ the site for
   the few browser-visible tools). Every tool carries an evidence quote +
   source URL; the maturity band is derived deterministically in JS so it's
   auditable and re-derivable. See innovation TASK_SYSTEM in claude-proxy.
   ============================================================================ */
// category -> maturity band (0..4). The LLM classifies each tool into a category;
// JS maps category->band so scoring never depends on the model's own band guess.
const INNOVATION_CATEGORIES = {
  genai_build:       { band: 4, label: "GenAI / LLM framework" },
  vector_db:         { band: 4, label: "Vector database" },
  mlops:             { band: 4, label: "ML / MLOps" },
  genai_app:         { band: 4, label: "Shipped GenAI app" },
  warehouse:         { band: 3, label: "Data warehouse / lakehouse" },
  table_format:      { band: 3, label: "Open table format" },
  elt_streaming:     { band: 3, label: "ELT / streaming" },
  orchestration:     { band: 3, label: "Data orchestration" },
  enterprise_bi:     { band: 3, label: "Enterprise BI" },
  cdp:               { band: 2, label: "Customer data platform" },
  product_analytics: { band: 2, label: "Product analytics" },
  baas:              { band: 2, label: "Backend-as-a-service" },
  database:          { band: 1, label: "Database" },
  nocode_automation: { band: 1, label: "No-code automation" },
  identity:          { band: 1, label: "Identity / access" },
  web_analytics:     { band: 1, label: "Web analytics" },
  ai_intent:         { band: 0, label: "AI intent (unconfirmed)" },
};
const MATURITY_BANDS = ["Unknown", "Baseline", "Analytics-aware", "Modern data stack", "GenAI-native"];
const AWS_ALIGN_HINTS = [
  ["aws", /\b(bedrock|sagemaker|redshift|aurora|athena|glue|lake formation|\baws\b|hopsworks|amazon)\b/i],
  ["azure", /\b(azure|synapse|microsoft fabric|onelake|power bi|entra|cosmos ?db)\b/i],
  ["gcp", /\b(bigquery|big query|vertex|google cloud|gcs|looker|bigtable|gke)\b/i],
];
// Derive {maturity_band, ai_native, aws_alignment} from grounded signals. Pure, re-runnable.
const BAND4_CATEGORIES = ["genai_build", "vector_db", "mlops", "genai_app"];
function scoreMaturity(signals) {
  const named = (signals || []).filter((s) => s && s.tool && s.category && s.category !== "ai_intent");
  // GenAI-native (Band 4) requires CORROBORATION: ≥2 distinct band-4 signals. A single
  // genai/vector/mlops/genai_app hit is real but uncorroborated, so it caps at Band 3 -
  // avoids one stray ML library (e.g. pymc3) declaring a company "GenAI-native".
  const genai = named.filter((s) => BAND4_CATEGORIES.includes(s.category));
  const ai_native = genai.length >= 2;
  let band = 0;
  for (const s of named) {
    let b = INNOVATION_CATEGORIES[s.category]?.band || 0;
    if (b === 4 && !ai_native) b = 3; // demote uncorroborated band-4 signal to band 3
    if (b > band) band = b;
  }
  const tally = { aws: 0, azure: 0, gcp: 0 };
  for (const s of named) {
    const hay = (s.tool + " " + (s.evidence_quote || "")).toString();
    for (const [k, re] of AWS_ALIGN_HINTS) if (re.test(hay)) tally[k]++;
  }
  const top = Object.entries(tally).sort((a, b) => b[1] - a[1]);
  let aws_alignment = "unknown";
  if (top[0][1] > 0) aws_alignment = top[1][1] === top[0][1] ? "mixed" : top[0][0];
  return { maturity_band: band, ai_native, aws_alignment };
}

async function analyzeInnovation(company) {
  const name = company.name || "";
  const domain = (company.domain || "").replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "");
  const cats = Object.keys(INNOVATION_CATEGORIES).join("|");
  const user =
`Research the DATA, AI and AUTOMATION tooling of this company to read its digitalization maturity.
COMPANY: ${name}${domain ? " (" + domain + ")" : ""}

Use web search across these channels (most data/AI tools are backend - look here, not just the site):
- Job ads / careers page / LinkedIn (the strongest source: "Data Engineer - Snowflake, dbt, Airflow", "ML Engineer - LangChain, vector DB")
- Engineering blog, conference talks, public GitHub (requirements.txt, package.json, pyproject.toml, docker-compose, terraform)
- The company website itself (for browser-visible tools: Segment, Amplitude, Algolia, Streamlit/Gradio demos, etc.)

For EVERY tool you report you MUST have actually seen it named in a fetched page or search snippet, and you MUST give the verbatim quote + the source URL. If you can't cite it, leave it out. Do NOT infer tools from the industry or from peers. Generic words like "AI"/"GenAI"/"LLM"/"RAG" are NOT tools - put them in ai_intent. Do NOT report bare programming languages (Python, Java, Go, etc.) or generic skills as tools - only named products/platforms/frameworks.

Classify each tool's category as one of: ${cats}. Be STRICT - category drives a maturity score, so do not inflate:
- genai_build = LLM/agent frameworks ONLY (LangChain, LlamaIndex, Semantic Kernel, Bedrock Agents, Haystack, CrewAI). vector_db = Pinecone/Weaviate/Qdrant/pgvector/Chroma/Milvus. genai_app = a shipped LLM app (Streamlit/Gradio/Chainlit/Vercel AI SDK/CopilotKit). mlops = REAL ML/MLOps ONLY (SageMaker, Vertex AI, Azure ML, MLflow, Kubeflow, W&B, Hugging Face, Databricks ML). These are Band 4 - never put generic cloud/infra/DevOps here.
- warehouse = Snowflake/BigQuery/Redshift/Databricks/Synapse/ClickHouse. elt_streaming = dbt/Fivetran/Airbyte/Kafka/Flink. orchestration = Airflow/Dagster/Prefect/Temporal. enterprise_bi = Power BI/Tableau/Looker/Qlik. (Band 3.)
- cdp = Segment/RudderStack/Snowplow; product_analytics = Amplitude/Mixpanel/Heap/PostHog; baas = Supabase/Firebase. (Band 2.)
- database = Postgres/MySQL/Mongo/DynamoDB/Redis/Yardi etc; identity = Okta/Entra/BankID/e-ID; nocode_automation = Zapier/Make/Power Automate; web_analytics = GA4/Matomo/Hotjar/SendGrid/WordPress/CMS/web frameworks. (Band 1.)
- IMPORTANT exclusions - do NOT report these as data/AI signals at all (omit them): bare cloud/hosting (AWS, Azure, GCP, Vercel as hosting), IaC/DevOps (Terraform, Docker, Kubernetes, CloudFormation, Ansible), observability/APM (New Relic, Datadog, Grafana, Sentry), and generic dev tools. They are infra, not data/AI maturity. (A cloud name only matters for aws_alignment, which is derived separately - you don't need to report it.)
Set channel to where you found it: job_ad | blog | github | frontend.

Respond ONLY with JSON in exactly this shape:
{"signals":[{"tool":"<exact product name>","category":"<one category>","channel":"<channel>","evidence_quote":"<≤20-word verbatim quote>","source_url":"<url you saw it on>","confidence":"<high|medium|low>"}],
"ai_intent":["<generic AI/data phrase you saw, if any>"],
"note":"<≤20 words: what you could/couldn't verify>"}`;
  const tools = [{ type: "web_search_20250305", name: "web_search", max_uses: 4 }];
  const text = await callClaude({ user, tools, maxTokens: 1800, task: "innovation" });
  const json = extractJSON(text);
  // keep only signals that carry a real source URL (drop ungrounded ones - receipts or it didn't happen)
  const signals = (Array.isArray(json.signals) ? json.signals : []).filter(
    (s) => s && s.tool && s.category && /^https?:\/\//i.test(String(s.source_url || ""))
  );
  const score = scoreMaturity(signals);
  return { signals, ai_intent: Array.isArray(json.ai_intent) ? json.ai_intent : [], note: json.note || "", ...score, analyzed_at: now() };
}

// ---- BUILTWITH-BRYGGA (Väg A) ----
// Översätter BuiltWith Domain API (v22) JSON till appens techstack-form, så att
// resultatet flödar in i lead-prompten och AWS-pillarna precis som web-analysen.
// Ren funktion - samma logik flyttas senare in i Väg B:s Supabase Edge Function.
const BW_TAG_TO_CAT = {
  framework: "ramverk", "javascript-frameworks": "ramverk", javascript: "ramverk",
  "web-frameworks": "ramverk", js: "ramverk",
  cms: "cms", ecommerce: "cms", blog: "cms", blogs: "cms",
  analytics: "analys", ga: "analys", "tag-managers": "analys", "marketing-automation": "analys",
  widgets: "widgets", "live-chat": "widgets", advertising: "widgets", ads: "widgets",
  retargeting: "widgets", captcha: "widgets", feeds: "widgets", audience: "widgets",
  cdn: "cdn", cdns: "cdn",
  hosting: "hosting", paas: "hosting", iaas: "hosting",
  ns: "dns", dns: "dns",
  mx: "epost", email: "epost", "email-hosting": "epost", "email-providers": "epost",
  "web-server": "server", server: "server", ssl: "server", "server-side": "server",
  "programming-language": "server", php: "server",
  fonts: "typsnitt", "font-scripts": "typsnitt", css: "typsnitt",
};
function bwCat(tag) { return BW_TAG_TO_CAT[(tag || "").toLowerCase()] || "server"; }

function parseBuiltWithToTechstack(raw) {
  if (!raw || !raw.trim()) throw new Error("Paste the BuiltWith Domain API JSON first.");
  let parsed;
  try { parsed = JSON.parse(raw); }
  catch (e) { throw new Error("Invalid JSON - use the Domain API (v22/api.json)."); }
  const results = Array.isArray(parsed?.Results) && parsed.Results.length
    ? parsed.Results
    : parsed?.Result ? [parsed] : null;
  if (!results) {
    const errs = parsed?.Errors;
    if (Array.isArray(errs) && errs.length)
      throw new Error("BuiltWith: " + (errs[0].Message || errs[0].message || "error in response"));
    throw new Error("Found no Results - use the Domain API link, not Free/Lists.");
  }
  const r = results[0];
  const lookup = r.Lookup || r.Result?.Paths?.[0]?.Domain || "";
  const paths = r.Result?.Paths || [];
  const seen = new Map();
  paths.forEach((p) => (p.Technologies || []).forEach((t) => {
    if (!t || !t.Name) return;
    const key = t.Name.toLowerCase();
    if (!seen.has(key)) seen.set(key, { category: bwCat(t.Tag), name: t.Name });
  }));
  const items = [...seen.values()];
  if (!items.length) throw new Error("No technologies found (may be behind Cloudflare/WAF).");
  const behind_proxy = items.some((i) => /cloudflare/i.test(i.name));
  const lastRaw = r.LastIndexed;
  const last = lastRaw != null ? new Date(typeof lastRaw === "number" ? lastRaw : Number(lastRaw)) : null;
  const lastStr = last && !isNaN(last.getTime()) ? last.toISOString().slice(0, 10) : null;
  const note = "Imported from BuiltWith Domain API" + (lookup ? " (" + lookup + ")" : "") +
    (lastStr ? " - last indexed " + lastStr : "") +
    (behind_proxy ? ". Cloudflare detected - parts may be hidden." : ".");
  return { items, behind_proxy, note };
}

// ---- LEAD-ANALYS  (Jacobs tvåfas-prompt) ----
// PARTNER-kontext är förinställd per projekt; PROSPEKT byggs från company+contacts.
// Rikare webbteknik-signal till prompten: AWS-verdict + proxy-flagga + grupperad
// stack + källa. Mer beslutsunderlag än en rad teknik-namn (jfr fristående bron).
function techSignal(company) {
  const ts = company.techstack;
  if (!ts?.items?.length) return "(no web tech analysis run yet)";
  const items = ts.items;
  const awsRe = /aws|amazon|cloudfront|route\s?53|\bs3\b|\bec2\b|lambda|dynamodb|\bses\b|\belb\b|elastic\s?beanstalk/i;
  const aws = items.filter((i) => awsRe.test(i.name)).map((i) => i.name);
  const cf = ts.behind_proxy || items.some((i) => /cloudflare/i.test(i.name));
  const grouped = TECH_CATEGORIES
    .map((c) => {
      const xs = items.filter((i) => i.category === c.key).map((i) => i.name);
      return xs.length ? `  • ${c.label}: ${xs.join(", ")}` : null;
    })
    .filter(Boolean)
    .join("\n");
  const lines = [];
  lines.push(
    aws.length
      ? `AWS SIGNAL: YES - ${aws.join(", ")}`
      : "AWS SIGNAL: none in visible stack (absence ≠ absence of AWS - may be hidden by a proxy)"
  );
  if (cf) lines.push("PROXY: Cloudflare/WAF detected - parts of the stack may be hidden.");
  lines.push("STACK:\n" + (grouped || "  (no categorized technology)"));
  if (ts.note) lines.push("SOURCE: " + ts.note);
  return lines.join("\n");
}

async function resolveDomain(company) {
  const facts = [
    company.name,
    company.city || company.postort ? "City: " + (company.city || company.postort) : "",
    company.county ? "Region: " + company.county : "",
    company.orgnr ? "Org.nr: " + company.orgnr : "",
    company.industry ? "Industry: " + company.industry : "",
  ].filter(Boolean).join("\n");
  const user =
    "Find the official website for this Swedish company:\n" + facts +
    "\n\nUse web search. Be strict about matching name + city so you don't pick the wrong company. " +
    'Respond ONLY with JSON:\n{"domain":"<registered domain, no http/www, or empty>","confidence":"<low|medium|high>","evidence":"<max 15 words: why this is the right site>"}';
  const tools = [{ type: "web_search_20250305", name: "web_search", max_uses: 2 }];
  const text = await callClaude({ user, tools, maxTokens: 400, task: "find_domain" });
  const json = extractJSON(text);
  const domain = String(json.domain || "").trim().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "").toLowerCase();
  return { domain, confidence: json.confidence || "", evidence: json.evidence || "" };
}

async function findDecisionMakers(company) {
  const domain = (company.domain || "").replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "");
  const facts = [
    company.name,
    company.city || company.postort ? "City: " + (company.city || company.postort) : "",
    domain ? "Website: " + domain : "",
    company.orgnr ? "Org.nr: " + company.orgnr : "",
    company.industry ? "Industry: " + company.industry : "",
  ].filter(Boolean).join("\n");
  const user =
    "Find the key people to contact at this Swedish company for selling cloud/AWS services:\n" + facts +
    "\n\nUse web search. Prioritise whoever owns a cloud/IT decision (VD/CEO, CTO, IT-chef, Head of Digital). Max 4 people. " +
    'Respond ONLY with JSON:\n{"people":[{"name":"<full name>","title":"<role>","linkedin":"<url or empty>","email":"<likely business email or empty>","email_is_guess":true,"why":"<max 12 words why this person>"}]}';
  const tools = [{ type: "web_search_20250305", name: "web_search", max_uses: 3 }];
  const text = await callClaude({ user, tools, maxTokens: 900, task: "find_contacts" });
  const json = extractJSON(text);
  return Array.isArray(json.people) ? json.people : [];
}

function buildLeadPrompt(partner, company, contacts) {
  const contactLines = contacts.length
    ? contacts.map((c) => `- ${[c.first_name, c.last_name].filter(Boolean).join(" ")}${c.title ? " (" + c.title + ")" : ""}${c.email ? " · " + c.email : ""}`).join("\n")
    : "(no known contacts)";
  const tech = techSignal(company);
  return (
`You are a sales engineer prospecting on behalf of an AWS partner. Build a sharp, grounded
angle to test on a sales call - not a research report. Reason through the partner's offer and
the prospect's situation, then output ONLY the few things a rep needs before dialing. Be terse.

=== PARTNER (who we sell for) ===
PARTNER: ${partner.name}
WEBSITE: ${partner.domain || ""}
WHAT I KNOW: ${partner.brief || ""}

=== PROSPECT (who we're contacting) ===
PROSPECT: ${company.name}
DOMAIN: ${company.domain || ""}
ORG.NO: ${company.orgnr || "unknown"}
INDUSTRY: ${company.industry || "unknown"}
EMPLOYEES: ${company.employees ?? "unknown"}
CONTACT: ${contactLines}
SOURCE/STAGE: ${company.source || ""} / ${STAGE_LABEL[company.stage] || company.stage}
WEB TECH SIGNALS:
${tech}
OTHER THINGS I KNOW: ${company.enrichment?.description || ""} ${company.notes || ""}

Use web search sparingly to verify the company and find one or two real, recent signals
(growth, hiring, funding, expansion, leadership statements, regulatory drivers). Quote their
own words where you can. An honest "unknown" beats a slick guess. If it's a weak match, say so
in the verdict and score it low.

Respond ONLY with JSON, nothing else, in exactly this shape. Respect every word limit:
{
 "score": <0-100 ICP fit>,
 "verdict": "<max 6 words, e.g. 'Hot, strong match' / 'Lukewarm' / 'Weak match'>",
 "angle": "<max 25 words: the single best reason to call - tie ONE prospect signal to ONE partner capability>",
 "opener": "<2-3 sentences you could say when they pick up, in their language, no pitch>",
 "ask": ["<max 3 short questions to test on the call>"],
 "avoid": "<max 12 words: the one thing NOT to pitch, or empty string>",
 "contact": "<who to reach + a few words why, or empty string>",
 "confidence": "<low | medium | high - how solid this read is>"
}`
  );
}

async function analyzeLead(partner, company, contacts) {
  const tools = [{ type: "web_search_20250305", name: "web_search", max_uses: 2 }];
  const text = await callClaude({
    user: buildLeadPrompt(partner, company, contacts),
    tools,
    maxTokens: 1200,
    task: "lead",
  });
  const json = extractJSON(text);
  return { ...json, analyzed_at: now() };
}

/* ============================================================================
   AI AGENTS  (inlined - single-file build; previously alloy-agents.js)
   research → outreach → triage. Portable: only claudeRaw() changes for Bedrock.
   Every call carries a `task` so the hardened claude-proxy owns the system prompt.
   ============================================================================ */
const AGENT_MODEL = MODEL_API;
const MAX_AGENT_STEPS = 5;

// Full-message Claude call (returns the whole message: content blocks + stop_reason).
// SWAP THIS for Bedrock on AWS - the agents above it stay untouched.
async function claudeRaw({ messages, tools, maxTokens = 1500, task }) {
  const sbUrl = (typeof window !== "undefined" && window.__ALLOY_SUPABASE__?.url) || "";
  const explicitProxy = (typeof window !== "undefined" && window.__ALLOY_CLAUDE_PROXY__) || "";
  const proxy = explicitProxy || (sbUrl ? `${sbUrl}/functions/v1/claude-proxy` : "");
  if (!proxy) throw new Error("Alloy requires its backend - claude-proxy is not configured.");
  const body = { model: AGENT_MODEL, max_tokens: maxTokens, messages };
  if (tools) body.tools = tools;
  if (task) body.task = task;
  const endpoint = proxy;
  const headers = { "Content-Type": "application/json" };
  if (proxy) {
    const ak = (typeof window !== "undefined" && window.__ALLOY_SUPABASE__?.anonKey) || "";
    if (ak) { headers["Authorization"] = "Bearer " + ak; headers["apikey"] = ak; }
  }
  const DELAYS = [4000, 12000, 30000];
  for (let attempt = 0; attempt <= DELAYS.length; attempt++) {
    const res = await fetch(endpoint, { method: "POST", headers, body: JSON.stringify(body) });
    if (res.ok) return res.json();
    let detail = ""; try { detail = await res.text(); } catch {}
    if ([429, 503, 529].includes(res.status) && attempt < DELAYS.length) {
      const ra = res.headers?.get("retry-after");
      await new Promise((r) => setTimeout(r, ra ? Math.min(Number(ra) * 1000 + 500, 60000) : DELAYS[attempt]));
      continue;
    }
    throw new Error(`Claude ${res.status}${detail ? " - " + detail.slice(0, 200) : ""}`);
  }
}

const agentTextOf = (msg) => (msg?.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");

async function agentEdge(path, payload) {
  const cfg = (typeof window !== "undefined" && window.__ALLOY_SUPABASE__) || {};
  const base = (cfg.url || "").replace(/\/+$/, "");
  if (!base) throw new Error("Supabase URL missing");
  const headers = { "Content-Type": "application/json" };
  if (cfg.anonKey) { headers["Authorization"] = "Bearer " + cfg.anonKey; headers["apikey"] = cfg.anonKey; }
  const res = await fetch(`${base}/functions/v1/${path}`, { method: "POST", headers, body: JSON.stringify(payload || {}) });
  const txt = await res.text();
  if (!res.ok) throw new Error(`${path} ${res.status} - ${txt.slice(0, 160)}`);
  const data = JSON.parse(txt);
  if (data && data.error) throw new Error(data.error);
  return data;
}

const AGENT_TOOLS = [
  { type: "web_search_20250305", name: "web_search", max_uses: 3 },
  { name: "inspect_site_tech", description: "Detect a company's cloud provider and web tech stack from its domain (live fetch). Use to confirm whether a prospect runs on AWS vs a competitor cloud.", input_schema: { type: "object", properties: { domain: { type: "string", description: "Bare domain, e.g. example.com" } }, required: ["domain"] } },
  { name: "company_registry", description: "Look up official company-registry data (Norway live; Sweden via loaded SCB data). Use to confirm legal entity, org number, location, size.", input_schema: { type: "object", properties: { name: { type: "string" }, orgnr: { type: "string" }, country: { type: "string", description: "'SE' or 'NO'" } } } },
  { name: "fetch_page", description: "Fetch the readable text of a specific web page (server-side, no CORS). Use to read an article/about/careers page surfaced via web_search.", input_schema: { type: "object", properties: { url: { type: "string", description: "Full http(s) URL" } }, required: ["url"] } },
  { name: "fetch_tech", description: "Fetch a page's TECH FINGERPRINT SURFACE (not prose): script/link/iframe hosts, response headers, <meta generator>, and detected JS globals like window.posthog / cdn.segment.com. Use to identify the web/data/AI stack of a site.", input_schema: { type: "object", properties: { url: { type: "string", description: "Full http(s) URL of the page to fingerprint" } }, required: ["url"] } },
];
const TOOL_IMPLS = {
  inspect_site_tech: (input) => detectAws(input.domain),
  company_registry: (input) => registrySearch(input),
  fetch_page: (input) => agentEdge("web-fetch", { url: input.url }),
  fetch_tech: (input) => agentEdge("web-fetch", { url: input.url, mode: "tech" }),
  // web_search runs server-side at Anthropic - no client impl.
};

// Generic tool-use loop: runs the model until it stops requesting custom tools.
async function runAgent({ prompt, task, tools = AGENT_TOOLS, impls = TOOL_IMPLS, maxTokens = 1500, maxSteps = MAX_AGENT_STEPS }) {
  const messages = [{ role: "user", content: prompt }];
  const toolTrace = [];
  for (let step = 0; step < maxSteps; step++) {
    const msg = await claudeRaw({ messages, tools, maxTokens, task });
    messages.push({ role: "assistant", content: msg.content || [] });
    const calls = (msg.content || []).filter((b) => b.type === "tool_use" && impls[b.name]);
    if (msg.stop_reason !== "tool_use" || calls.length === 0) return { text: agentTextOf(msg), steps: step + 1, toolTrace };
    const results = [];
    for (const call of calls) {
      let out, isErr = false;
      try { out = await impls[call.name](call.input || {}); }
      catch (e) { out = { error: String(e?.message || e) }; isErr = true; }
      toolTrace.push({ tool: call.name, ok: !isErr });
      results.push({ type: "tool_result", tool_use_id: call.id, content: JSON.stringify(out).slice(0, 6000), is_error: isErr });
    }
    messages.push({ role: "user", content: results });
  }
  const fin = await claudeRaw({ messages: [...messages, { role: "user", content: "Stop researching. Answer now with the required JSON only." }], maxTokens, task });
  return { text: agentTextOf(fin), steps: maxSteps, toolTrace };
}

// AGENT 1 - researchLead: true tool-use agent; returns the analyzeLead JSON shape (drop-in).
function researchPrompt(partner, company, contacts) {
  const contactLines = (contacts && contacts.length)
    ? contacts.map((c) => `- ${[c.first_name, c.last_name].filter(Boolean).join(" ")}${c.title ? " (" + c.title + ")" : ""}${c.email ? " · " + c.email : ""}`).join("\n")
    : "(no known contacts)";
  return (
`You are a sales engineer prospecting on behalf of an AWS partner. Build a sharp, grounded
angle to test on a sales call - not a research report. Be terse. An honest "unknown" beats a
slick guess; if it's a weak match, say so and score it low.

You have tools. Use them to GROUND your read before you answer:
- inspect_site_tech(domain): confirm the prospect's cloud (AWS vs competitor) and stack.
- company_registry({name, orgnr, country}): confirm entity, size, location.
- web_search: find ONE or TWO real recent signals (growth, hiring, funding, expansion, leadership, regulatory drivers). Quote their own words where you can.
- fetch_page(url): read a specific page (article/about/careers) found via web_search.
Call tools only when they sharpen the angle. Don't over-research; 1-3 tool calls is plenty.

=== PARTNER (who we sell for) ===
PARTNER: ${partner.name}
WEBSITE: ${partner.domain || ""}
WHAT I KNOW: ${partner.brief || ""}

=== PROSPECT (who we're contacting) ===
PROSPECT: ${company.name}
DOMAIN: ${company.domain || ""}
ORG.NO: ${company.orgnr || "unknown"}
INDUSTRY: ${company.industry || "unknown"}
EMPLOYEES: ${company.employees ?? "unknown"}
CITY: ${company.city || company.postort || "unknown"}
CONTACT: ${contactLines}
KNOWN CLOUD: ${company.cloud_provider || (company.aws_detected ? "aws" : "unknown")}
OTHER: ${company.enrichment?.description || ""} ${company.notes || ""}

When done, respond ONLY with JSON, nothing else, in exactly this shape. Respect every word limit:
{
 "score": <0-100 ICP fit>,
 "verdict": "<max 6 words>",
 "angle": "<max 25 words: tie ONE prospect signal to ONE partner capability>",
 "opener": "<2-3 sentences you could say when they pick up, in their language, no pitch>",
 "ask": ["<max 3 short questions to test on the call>"],
 "avoid": "<max 12 words: the one thing NOT to pitch, or empty string>",
 "contact": "<who to reach + why, or empty string>",
 "confidence": "<low | medium | high>"
}`);
}
async function researchLead(partner, company, contacts = []) {
  const { text, toolTrace } = await runAgent({ prompt: researchPrompt(partner, company, contacts), task: "research", maxTokens: 1400 });
  const json = extractJSON(text);
  return { ...json, analyzed_at: now(), _toolTrace: toolTrace };
}

// AGENT 2 - draftOutreach: grounded first-touch. analysis = researchLead/analyzeLead output.
async function draftOutreach(partner, company, analysis, contact) {
  const who = contact
    ? `${[contact.first_name, contact.last_name].filter(Boolean).join(" ")}${contact.title ? ", " + contact.title : ""}`
    : (analysis?.contact || "the most relevant decision-maker");
  const prompt =
`Write a first-touch message on behalf of an AWS partner. It must read like a senior person who
did their homework - short, specific, one clear reason to talk, one soft ask. No pitch dump.

PARTNER: ${partner.name} - ${partner.brief || ""}
PROSPECT: ${company.name} (${company.industry || ""}, ${company.city || company.postort || ""})
RECIPIENT: ${who}
CALL ANGLE: ${analysis?.angle || ""}
OPENER IDEA: ${analysis?.opener || ""}
DO NOT PITCH: ${analysis?.avoid || ""}

Respond ONLY with JSON:
{
 "channel": "email | linkedin",
 "subject": "<max 8 words, no clickbait - empty for linkedin>",
 "body": "<90-130 words. Specific opening tied to the angle. One ask: a short call. Plain sign-off.>",
 "alt_body": "<a shorter, punchier variant, 40-60 words>",
 "notes": "<max 15 words: why this angle, or what to verify before sending>"
}`;
  const msg = await claudeRaw({ messages: [{ role: "user", content: prompt }], maxTokens: 900, task: "outreach" });
  return { ...extractJSON(agentTextOf(msg)), drafted_at: now() };
}

// AGENT 3 - triagePipeline: rank an already-scored shortlist into "call today, for this reason".
async function triagePipeline(partner, candidates, limit = 8) {
  const list = (candidates || []).slice(0, 25).map((c, i) =>
    `${i + 1}. id=${c.id} | ${c.name} | score ${c.score ?? "?"} | stage ${c.stage || "lead"} | ${c.industry || ""} | ${c.city || ""} | ${c.aws ? "on AWS" : "not AWS"} | last touch ${c.last_touch || "never"}`
  ).join("\n");
  const prompt =
`Partner we sell for: ${partner.name} - ${partner.brief || ""}

Here is today's candidate shortlist (already scored). Pick the ${limit} worth calling TODAY and
order them. Favour: strong ICP fit, AWS-aligned, warm but not yet contacted, and momentum
(don't let good leads go cold). For each, give a one-line reason a rep can act on.

CANDIDATES:
${list}

Respond ONLY with JSON:
{ "ranked": [ { "id": "<id>", "priority": <1..${limit}>, "why": "<max 16 words: the signal + the move>" } ] }`;
  const msg = await claudeRaw({ messages: [{ role: "user", content: prompt }], maxTokens: 900, task: "triage" });
  return { date: now().slice(0, 10), ...extractJSON(agentTextOf(msg)) };
}

/* ============================================================================
   PROJEKT  -  varje partner-engagemang är ett projekt (G-FLOW: Alto)
   ============================================================================ */
const DEFAULT_PROJECTS = [
  {
    id: "alto",
    name: "Alto",
    color: "#3E5A7A",
    partner: {
      name: "Alto",
      domain: "alto.se",
      brief:
        "Swedish AWS Advanced Tier partner with AI Competency. Builds Quattro - an " +
        "MCP-based integration platform that connects AI agents to business systems " +
        "(Visma, Fortnox, Microsoft Dynamics, Salesforce) through Outlook, Teams, and Slack. " +
        "The integration is universal across sectors. Sold as an embedded backoffice " +
        "automation layer, NOT as a tenant-facing or frontend platform.",
    },
    goal_week: 1,
    goal_month: 5,
  },
  {
    id: "novalo",
    name: "Novalo",
    color: "#6A4A6E",
    partner: {
      name: "Novalo Technologies",
      domain: "novalo.se",
      brief:
        "Nordic AWS Advanced Tier partner with Service Delivery designations for " +
        "Lambda, API Gateway, DynamoDB and CloudFormation. Edge: hands-on " +
        "implementation and continuous optimization - helps product teams take ideas " +
        "to production-ready systems. Offers two Fast Tracks: AI Fast Track (14 " +
        "days, idea to production AI solution) and Migration Jump Start (21 days, " +
        "executable migration plan). Strong on cost optimization as an entry point. Sells " +
        "senior specialists without delivery overhead, shared ownership, long-term " +
        "tuning - NOT one-off recommendations or pure advisory. " +
        "AWS status (May 2026): both CloudOps and Automotive Competency applications " +
        "submitted - unlocking ~$20,000 in AWS funding soon plus leverage for AWS Originated " +
        "opportunities (opens AWS co-sell and co-funding). CloudOps now covers " +
        "the Observability & Monitoring, FinOps and Operations subcategories. " +
        "Solution catalog (AWS Partner Solutions, Professional Service): Novalo GenAI Journey " +
        "(GenAI idea to production) and Novalo Migrate (migration). Sales angle: AWS-funded " +
        "engagements, FinOps/cost control as entry, GenAI for AI-mature prospects. " +
        "Next milestone: 1-2 customer references required for AI Competency, which together unlock " +
        "~$70,000 in AWS funding. After that the BOX program opens to build an own SaaS " +
        "service with $290,000 funding - a fast-growing funding runway into " +
        "autumn 2026 and a strong entry for AWS co-funded engagements and co-sell.",
    },
    goal_week: 1,
    goal_month: 5,
  },
];


/* FORGE_SEED removed - initial data lives in Supabase; any re-seed is a one-time SQL migration, not shipped to the client. */

/* ============================================================================
   DB  -  window.storage idag, Supabase imorgon (byt bara denna modul)
   ============================================================================ */
const KEYS = {
  companies: "forjg:companies",
  contacts: "forjg:contacts",
  activities: "forjg:activities",
  projects: "forjg:projects",
  tasks: "forjg:tasks",
  fundings: "forjg:fundings",
};
async function _read(key, fallback = []) {
  try { const r = await window.storage.get(key); return r ? JSON.parse(r.value) : fallback; }
  catch { return fallback; }
}
async function _write(key, val) {
  try { await window.storage.set(key, JSON.stringify(val)); }
  catch (e) { console.error("storage write failed", e); }
}

const localDb = {
  async allProjects() {
    // Koden (DEFAULT_PROJECTS) är sanningskällan för VILKA projekt som finns.
    // Storage lagrar bara per-projekt-ändringar (mål m.m.) och mergas in.
    const overrides = await _read(KEYS.projects, []);
    const byId = Object.fromEntries((overrides || []).map((o) => [o.id, o]));
    return DEFAULT_PROJECTS.map((p) => ({ ...p, ...(byId[p.id] || {}) }));
  },
  async updateProject(id, patch) {
    const cur = await _read(KEYS.projects, []);
    const exists = cur.some((p) => p.id === id);
    const next = exists
      ? cur.map((p) => (p.id === id ? { ...p, ...patch } : p))
      : [...cur, { id, ...patch }];
    await _write(KEYS.projects, next);
  },

  async allCompanies() {
    const c = await _read(KEYS.companies);
    return c.sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
  },
  async bulkAddCompanies(list) {
    const cur = await _read(KEYS.companies);
    await _write(KEYS.companies, [...list, ...cur]);
  },
  async updateCompany(id, patch) {
    const cur = await _read(KEYS.companies);
    await _write(KEYS.companies, cur.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  },

  async allContacts() { return _read(KEYS.contacts); },
  async bulkAddContacts(list) {
    const cur = await _read(KEYS.contacts);
    await _write(KEYS.contacts, [...list, ...cur]);
  },
  async updateContact(id, patch) {
    const cur = await _read(KEYS.contacts);
    await _write(KEYS.contacts, cur.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  },
  async addContact(c) {
    const cur = await _read(KEYS.contacts);
    await _write(KEYS.contacts, [c, ...cur]);
  },

  async allActivities() { return _read(KEYS.activities); },
  async addActivity(act) {
    const cur = await _read(KEYS.activities);
    await _write(KEYS.activities, [act, ...cur]);
  },
  async allFundings() { return _read(KEYS.fundings); },
  async addFunding(f) {
    const cur = await _read(KEYS.fundings);
    await _write(KEYS.fundings, [f, ...cur]);
  },
  async updateFunding(id, patch) {
    const cur = await _read(KEYS.fundings);
    await _write(KEYS.fundings, cur.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  },
  async isAdmin() { return true; },
  async myProjectIds() { return DEFAULT_PROJECTS.map((p) => p.id); },
  async myRole() { return "admin"; },
  async partnerOpportunities() { return []; },
  async partnerFunding() { return []; },
  async acceptInvite() { return null; },
  async userIdByEmail() { return null; },
  async listMembers() { return []; },
  async addMember() {},
  async removeMember() {},
  async listInvites() { return []; },
  async createInvite() {},
  async revokeInvite() {},
  async getOutcome(companyId) { const all = await _read("forjg:outcomes", []); return all.find((o) => o.company_id === companyId) || null; },
  async upsertOutcome(row) {
    const all = await _read("forjg:outcomes", []);
    const i = all.findIndex((o) => o.company_id === row.company_id);
    const merged = i >= 0 ? { ...all[i], ...row, updated_at: new Date().toISOString() } : { ...row, id: uid(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    const next = i >= 0 ? all.map((o, j) => (j === i ? merged : o)) : [merged, ...all];
    await _write("forjg:outcomes", next);
    return merged;
  },
};

/* ----------------------------------------------------------------------------
   SUPABASE BACKEND (Väg B) - ACTIVE. The anon key below is a PUBLIC client key
   (safe to ship in the client; data is guarded by RLS). The service_role key must
   NEVER go here. A runtime window.__ALLOY_SUPABASE__ override still wins if set.
   To go back to local storage: comment out the block below (DB_BACKEND="auto"
   falls back to local when no config is present).
   ---------------------------------------------------------------------------- */
if (typeof window !== "undefined" && !window.__ALLOY_SUPABASE__) {
  window.__ALLOY_SUPABASE__ = {
    url: "https://nvjizahtcqgmfhiodtej.supabase.co",
    anonKey:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52aml6YWh0Y3FnbWZoaW9kdGVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5ODk0NDMsImV4cCI6MjA5NTU2NTQ0M30.G0gf0z0wg9RQqsyZcEBXPYJ1YVeTe_NOULtDAEI2xEA",
  };
}
const DB_BACKEND = "auto"; // "auto" | "local" | "supabase"  (auto = supabase iff window.__ALLOY_SUPABASE__ is set)

function sbConf() {
  const c = (typeof window !== "undefined" && window.__ALLOY_SUPABASE__) || null;
  if (!c?.url || !c?.anonKey) throw new Error("Supabase not configured - set window.__ALLOY_SUPABASE__ = { url, anonKey }");
  return c;
}
// The signed-in user's access token. Set by the app whenever the session changes.
// Data requests run AS THIS USER so row-level security can scope projects per user.
// Falls back to the anon key when signed out (which now has no data access).
let AUTH_TOKEN = null;
function setAuthToken(t) { AUTH_TOKEN = t || null; }
async function sb(table, { method = "GET", query = "", body, single = false, prefer } = {}) {
  const { url, anonKey } = sbConf();
  const res = await fetch(`${url}/rest/v1/${table}${query}`, {
    method,
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${AUTH_TOKEN || anonKey}`,
      "Content-Type": "application/json",
      Prefer: prefer ?? (method === "POST" ? "return=representation" : method === "PATCH" ? "return=minimal" : ""),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`Supabase ${method} ${table}: ${res.status} ${await res.text()}`);
  if (method === "PATCH" || method === "DELETE" || res.status === 204) return null;
  const text = await res.text();
  if (!text) return null;
  const data = JSON.parse(text);
  return single ? data[0] : data;
}
async function sbRpc(fn, args) {
  const { url, anonKey } = sbConf();
  const res = await fetch(`${url}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: { apikey: anonKey, Authorization: `Bearer ${AUTH_TOKEN || anonKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(args || {}),
  });
  if (!res.ok) throw new Error(`rpc ${fn}: ${res.status} ${await res.text()}`);
  return res.json();
}

/* ----------------------------------------------------------------------------
   AUTH (Supabase GoTrue) - password + magic link. The DATA layer stays on the
   public anon key (RLS unchanged), so a login problem can never lock anyone out
   of the data. Session is kept in window.storage and restored on load. Magic-link
   clicks land back here with tokens in the URL hash, which we parse and wipe.
   ---------------------------------------------------------------------------- */
const SESSION_KEY = "forjg:session";
const PENDING_INVITE_KEY = "forjg:pending_invite";

async function gotrue(path, body) {
  const { url, anonKey } = sbConf();
  const res = await fetch(`${url}/auth/v1/${path}`, {
    method: "POST",
    headers: { apikey: anonKey, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error_description || data?.msg || data?.error || data?.message || `Auth ${res.status}`);
  }
  return data;
}
function sessionFromToken(d) {
  if (!d?.access_token) return null;
  const expires_at = d.expires_at ? d.expires_at * 1000 : Date.now() + (d.expires_in ? d.expires_in * 1000 : 3600000);
  return { access_token: d.access_token, refresh_token: d.refresh_token || "", expires_at, email: d.user?.email || "" };
}
function authRedirectOrigin() {
  return (typeof window !== "undefined" && window.location && window.location.origin) ? window.location.origin : "";
}
function withRedirect(path) {
  const o = authRedirectOrigin();
  if (!o) return path;
  return path + (path.includes("?") ? "&" : "?") + "redirect_to=" + encodeURIComponent(o);
}
const Auth = {
  async signInPassword(email, password) { return sessionFromToken(await gotrue("token?grant_type=password", { email, password })); },
  async signUpPassword(email, password) { return sessionFromToken(await gotrue(withRedirect("signup"), { email, password })); },
  async sendMagicLink(email) { await gotrue(withRedirect("otp"), { email, create_user: true }); },
  async refresh(refresh_token) { return sessionFromToken(await gotrue("token?grant_type=refresh_token", { refresh_token })); },
  async updatePassword(accessToken, password) {
    const { url, anonKey } = sbConf();
    const res = await fetch(`${url}/auth/v1/user`, {
      method: "PUT",
      headers: { apikey: anonKey, Authorization: "Bearer " + accessToken, "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error_description || data?.msg || data?.error || data?.message || `Auth ${res.status}`);
    return data;
  },
  async store(s) { await _write(SESSION_KEY, s); },
  async clear() { await _write(SESSION_KEY, null); },
  async load() { return _read(SESSION_KEY, null); },
  parseHash() {
    try {
      if (typeof window === "undefined" || !window.location.hash) return null;
      const h = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const access_token = h.get("access_token");
      if (!access_token) return null;
      const expires_in = parseInt(h.get("expires_in") || "3600", 10);
      const s = { access_token, refresh_token: h.get("refresh_token") || "", expires_at: Date.now() + expires_in * 1000, email: "" };
      history.replaceState(null, "", window.location.pathname + window.location.search);
      return s;
    } catch { return null; }
  },
};

// PostgREST bulk insert (PGRST102) requires every object in the array to have the
// SAME keys. Seed rows are heterogeneous, so normalize to the union of keys (missing → null).
function uniformRows(list) {
  const keys = new Set();
  for (const o of list) for (const k of Object.keys(o)) keys.add(k);
  const allKeys = [...keys];
  return list.map((o) => { const r = {}; for (const k of allKeys) r[k] = k in o ? o[k] : null; return r; });
}

const supabaseDb = {
  async allProjects() {
    const rows = await sb("projects", { query: "?select=*" }).catch(() => []);
    const byId = Object.fromEntries((rows || []).map((o) => [o.id, o]));
    return DEFAULT_PROJECTS.map((p) => ({ ...p, ...(byId[p.id] || {}) }));
  },
  async updateProject(id, patch) {
    await sb("projects", { method: "POST", query: "?on_conflict=id", prefer: "resolution=merge-duplicates,return=minimal", body: [{ id, ...patch }] });
  },
  async allCompanies() {
    return (await sb("companies", { query: "?select=*&order=created_at.desc" })) || [];
  },
  async bulkAddCompanies(list) { if (list.length) await sb("companies", { method: "POST", body: uniformRows(list) }); },
  async updateCompany(id, patch) { await sb("companies", { method: "PATCH", query: `?id=eq.${id}`, body: patch }); },
  async allContacts() { return (await sb("contacts", { query: "?select=*" })) || []; },
  async bulkAddContacts(list) { if (list.length) await sb("contacts", { method: "POST", body: uniformRows(list) }); },
  async updateContact(id, patch) { await sb("contacts", { method: "PATCH", query: `?id=eq.${id}`, body: patch }); },
  async addContact(c) { await sb("contacts", { method: "POST", body: [c] }); },
  async allActivities() { return (await sb("activities", { query: "?select=*&order=created_at.desc" })) || []; },
  async addActivity(act) { await sb("activities", { method: "POST", body: [act] }); },
  async allFundings() { return (await sb("fundings", { query: "?select=*&order=created_at.desc" })) || []; },
  async addFunding(f) { await sb("fundings", { method: "POST", body: [f] }); },
  async updateFunding(id, patch) { await sb("fundings", { method: "PATCH", query: `?id=eq.${id}`, body: patch }); },
  // --- access control ---
  async isAdmin() { try { return !!(await sbRpc("app_is_admin", {})); } catch { return false; } },
  async myProjectIds() { try { return (await sbRpc("app_my_project_ids", {})) || []; } catch { return []; } },
  async myRole(pid) { try { return await sbRpc("app_my_role", { pid }); } catch { return null; } },
  async partnerOpportunities(pid) { try { return (await sbRpc("partner_opportunities", { pid })) || []; } catch { return []; } },
  async partnerFunding(pid) { try { return (await sbRpc("partner_funding", { pid })) || []; } catch { return []; } },
  async acceptInvite(token) { return sbRpc("app_accept_invite", { tok: token }); },
  async userIdByEmail(email) { return sbRpc("app_user_id_by_email", { em: email }); },
  async listMembers() { return (await sb("project_members", { query: "?select=*&order=created_at.desc" })) || []; },
  async addMember(project_id, user_id, email, role) { await sb("project_members", { method: "POST", query: "?on_conflict=project_id,user_id", prefer: "resolution=merge-duplicates,return=minimal", body: [{ project_id, user_id, email, role: role || "member" }] }); },
  async removeMember(project_id, user_id) { await sb("project_members", { method: "DELETE", query: `?project_id=eq.${project_id}&user_id=eq.${user_id}` }); },
  async listInvites() { return (await sb("project_invites", { query: "?select=*&order=created_at.desc" })) || []; },
  async createInvite(row) { await sb("project_invites", { method: "POST", prefer: "return=minimal", body: [row] }); },
  async revokeInvite(token) { await sb("project_invites", { method: "PATCH", query: `?token=eq.${token}`, body: { revoked: true } }); },
  // --- lead outcomes (predicted vs actual; the closed-loop moat) ---
  async getOutcome(companyId) { return (await sb("lead_outcomes", { query: `?company_id=eq.${companyId}&select=*`, single: true })) || null; },
  async upsertOutcome(row) { return await sb("lead_outcomes", { method: "POST", query: "?on_conflict=company_id", prefer: "resolution=merge-duplicates,return=representation", body: [row], single: true }); },
};

// Single seam the whole app talks to. auto = Supabase when configured, else local.
function activeDb() {
  if (DB_BACKEND === "supabase") return supabaseDb;
  if (DB_BACKEND === "local") return localDb;
  try {
    return (typeof window !== "undefined" && window.__ALLOY_SUPABASE__?.url) ? supabaseDb : localDb;
  } catch { return localDb; }
}
const db = new Proxy({}, { get: (_t, prop) => (...args) => activeDb()[prop](...args) });

/* ============================================================================
   STIL  -  exakt forj.se-designspråk (varmt papper, editorial, rost-accent)
   ============================================================================ */
const C = {
  bg: "#F3F0EA",        // --bg, varmt papper
  cream: "#FDFAF5",     // --cream
  panel: "#FDFAF5",     // kort
  panel2: "#ECE8E0",    // nedtonat kort
  line: "#D8D4CC",      // --rule (något starkare)
  line2: "#C9C3B8",
  text: "#1A1916",      // --ink (mörkare)
  ink: "#1A1916",
  dim: "#54514A",       // --ink-mid (mer kontrast)
  dim2: "#6E6962",      // --ink-dim (mer kontrast)
  accent: "#B83D0C",    // --accent, rost (punchigare)
  lime: "#B83D0C",      // alias -> accent (gamla referenser)
  limeSoft: "rgba(184,61,12,0.12)",
  limeDim: "#97320B",
  // mörka sektioner
  dark: "#141310",
  darkRule: "#3F3D3A",
  darkText: "#C2BEB5",
  darkMuted: "#8C8880",
  darkLabel: "#87827A",
  // semantiska (mer mättade för färg & kontrast)
  green: "#3F8A2E",
  amber: "#C77D11",
  red: "#C13715",
  blue: "#2F6FAE",
  teal: "#1F8A78",
  violet: "#6A3FA0",
  gold: "#C77D11",
  pink: "#B83D0C",      // alias -> accent
};
const FONT_DISPLAY = "'DM Serif Display', Georgia, serif";   // serif, ofta kursiv
const FONT_HEAD = "'Bricolage Grotesque', sans-serif";        // brand/etiketter, uppercase
const FONT_BODY = "'DM Sans', system-ui, sans-serif";
const FONT_MONO = "'DM Sans', system-ui, sans-serif";

const fontLink =
  "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,700&family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap";

/* ============================================================================
   SMÅ UI-BYGGSTENAR
   ============================================================================ */
function Pill({ children, color = C.dim, bg }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5, fontSize: 9.5,
      fontWeight: 600, padding: "3px 8px", borderRadius: 2,
      background: bg || (color + "22"), color, whiteSpace: "nowrap",
      border: `1px solid ${color}33`,
      fontFamily: FONT_HEAD, letterSpacing: ".08em", textTransform: "uppercase",
    }}>{children}</span>
  );
}
function Dot({ color }) {
  return <span style={{ width: 6, height: 6, borderRadius: 999, background: color, display: "inline-block" }} />;
}
// Cloud infrastructure provider → label + colour. Central to AWS-specific targeting.
const CLOUD = {
  aws: { label: "AWS", color: "#B83D0C", note: "On AWS - partner-aligned, warm." },
  gcp: { label: "GCP", color: "#2F6FAE", note: "On Google Cloud - competitive displacement play." },
  azure: { label: "Azure", color: "#6A3FA0", note: "On Microsoft Azure - competitive displacement play." },
  cloudflare: { label: "Cloudflare", color: "#C77D11", note: "Behind Cloudflare - origin cloud hidden." },
  other: { label: "Other host", color: "#827E76", note: "Hosted elsewhere / no major cloud detected." },
  unknown: { label: "", color: "#827E76", note: "Not checked yet." },
};
function cloudMeta(c) {
  const p = c?.cloud_provider || (c?.aws_detected ? "aws" : "");
  return p && CLOUD[p] && CLOUD[p].label ? { provider: p, ...CLOUD[p] } : null;
}
const EMAIL_LABEL = { google: "Google Workspace", microsoft: "Microsoft 365", other: "Other email" };
function CloudChip({ company, size = "sm" }) {
  const m = cloudMeta(company);
  if (!m) return null;
  return <Pill color={m.color}><span title={m.note + (company.aws_signals ? " - " + company.aws_signals : "")}>{m.label}</span></Pill>;
}

function Metric({ label, value, accent = C.accent, icon }) {
  return (
    <div style={{
      background: C.panel, border: `1px solid ${C.line}`, borderTop: `3px solid ${accent}`, borderRadius: 2,
      padding: "16px 20px 18px", flex: 1, minWidth: 0,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontSize: 10, color: C.dim, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", fontFamily: FONT_HEAD }}>{label}</span>
        {icon && ICON_PATHS[icon] && <Icon name={icon} size={15} color={accent} />}
      </div>
      <div style={{ fontSize: 38, fontWeight: 400, color: accent, fontFamily: FONT_DISPLAY, lineHeight: 1, letterSpacing: "-.02em" }}>
        {value}
      </div>
    </div>
  );
}
function Section({ title, icon, children, right }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          {icon && <span style={{ display: "flex", color: C.accent }}>{ICON_PATHS[icon] ? <Icon name={icon} size={14} /> : <span style={{ fontSize: 13 }}>{icon}</span>}</span>}
          <h3 style={{
            margin: 0, fontSize: 10.5, fontWeight: 600, letterSpacing: ".15em",
            textTransform: "uppercase", color: C.dim, fontFamily: FONT_HEAD,
          }}>{title}</h3>
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}
/* Collapsible card chrome — the standard box on a company card. Click the header
   to minimize/expand; state persists per-card-section in localStorage so a rep's
   layout sticks. `right` = optional header-right node (status pill etc). */
function Collapsible({ title, sectionKey, defaultOpen = true, right, accent, children }) {
  const storeKey = sectionKey ? "alloy:box:" + sectionKey : null;
  const [open, setOpen] = useState(() => {
    if (!storeKey) return defaultOpen;
    try { const v = localStorage.getItem(storeKey); return v === null ? defaultOpen : v === "1"; } catch { return defaultOpen; }
  });
  const toggle = () => setOpen((o) => { const n = !o; if (storeKey) { try { localStorage.setItem(storeKey, n ? "1" : "0"); } catch { /* ignore */ } } return n; });
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderTop: accent ? `3px solid ${accent}` : `1px solid ${C.line}`, borderRadius: 2, marginBottom: 16, overflow: "hidden" }}>
      <div onClick={toggle} style={{ display: "flex", alignItems: "center", gap: 9, padding: open ? "16px 18px 10px" : "14px 18px", cursor: "pointer", userSelect: "none" }}>
        <span style={{ fontSize: 12, color: C.dim2, width: 12, flexShrink: 0, transition: "transform .15s", transform: open ? "rotate(90deg)" : "none" }}>›</span>
        <span style={{ flex: 1, fontSize: 10, fontWeight: 600, letterSpacing: ".15em", textTransform: "uppercase", color: C.dim2 }}>{title}</span>
        {right}
      </div>
      {open && <div style={{ padding: "0 18px 18px" }}>{children}</div>}
    </div>
  );
}
function Btn({ children, onClick, variant = "ghost", disabled, size = "md", full }) {
  const [hover, setHover] = useState(false);
  const base = {
    cursor: disabled ? "not-allowed" : "pointer", border: "none", borderRadius: 0,
    fontFamily: FONT_HEAD, fontWeight: 500, display: "inline-flex", alignItems: "center",
    justifyContent: "center", gap: 8, transition: "background .18s, color .18s, border-color .18s, opacity .2s", opacity: disabled ? 0.45 : 1,
    width: full ? "100%" : "auto", letterSpacing: ".1em", textTransform: "uppercase",
    fontSize: size === "sm" ? 10 : 11,
    padding: size === "sm" ? "9px 16px" : "13px 26px",
  };
  const variants = {
    primary: { background: C.ink, color: C.cream, border: `1px solid ${C.ink}` },
    dark: { background: C.ink, color: C.cream, border: `1px solid ${C.ink}` },
    ghost: { background: "transparent", color: C.dim, border: `1px solid ${C.line}` },
    danger: { background: "transparent", color: C.red, border: `1px solid ${C.red}55` },
  };
  const hovers = {
    primary: { background: C.accent, color: C.cream, borderColor: C.accent },
    dark: { background: C.accent, color: C.cream, borderColor: C.accent },
    ghost: { color: C.ink, borderColor: C.ink },
    danger: { background: C.red, color: C.cream, borderColor: C.red },
  };
  const v = variants[variant] || variants.ghost;
  const h = !disabled && hover ? (hovers[variant] || null) : null;
  return (
    <button onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ ...base, ...v, ...h }}>
      {children}
    </button>
  );
}
// Forj wordmark - letter paths from the brand SVG (no background plate, inherits color).
function ForjLogo({ height = 28, color = "currentColor", title = "Forj", style }) {
  const s = "scale(0.2857142857142857, -0.2857142857142857)";
  return (
    <svg height={height} viewBox="83 380 800 220" fill={color} role="img" aria-label={title}
         xmlns="http://www.w3.org/2000/svg" style={{ display: "block", ...style }}>
      <g transform={`translate(83.14, 582) ${s}`}><path d="M86 0V660H178V0ZM122 283V362H501V283ZM122 579V660H544V579Z"/></g>
      <g transform={`translate(297.43, 582) ${s}`}><path d="M356 -13Q284 -13 229.5 11.0Q175 35 137.5 80.0Q100 125 81.0 187.5Q62 250 62 328Q62 442 100.0 518.5Q138 595 205.0 634.0Q272 673 357 673Q424 673 478.0 650.0Q532 627 570.5 582.0Q609 537 630.0 472.5Q651 408 651 326Q651 249 631.5 186.5Q612 124 574.5 79.5Q537 35 482.5 11.0Q428 -13 356 -13ZM357 66Q421 66 465.5 96.5Q510 127 533.5 184.5Q557 242 557 324Q557 409 533.0 468.5Q509 528 464.0 560.0Q419 592 355 592Q294 592 249.0 561.0Q204 530 180.0 471.0Q156 412 156 326Q156 264 169.5 215.5Q183 167 208.5 133.5Q234 100 271.5 83.0Q309 66 357 66Z"/></g>
      <g transform={`translate(552.57, 582) ${s}`}><path d="M86 0V660H316Q366 660 407.5 652.0Q449 644 481.5 628.0Q514 612 536.5 589.0Q559 566 570.5 535.5Q582 505 582 468Q582 433 571.5 404.0Q561 375 540.0 353.0Q519 331 488.0 317.5Q457 304 416 299V286Q452 282 479.0 267.0Q506 252 525.0 223.5Q544 195 558 148L600 0H501L467 135Q458 176 436.5 201.0Q415 226 383.0 238.0Q351 250 308 250H178V0ZM178 325H308Q397 325 442.5 357.0Q488 389 488 455Q488 521 444.5 552.5Q401 584 310 584H178Z"/></g>
      <g transform={`translate(789.71, 582) ${s}`}><path d="M23 -9 9 78Q20 76 29.0 76.0Q38 76 45 76Q99 76 126.5 93.0Q154 110 164.0 144.5Q174 179 174 230V660H265V229Q265 157 246.5 103.0Q228 49 183.0 19.5Q138 -10 57 -10Q51 -10 43.0 -10.0Q35 -10 23 -9Z"/></g>
    </svg>
  );
}
// Forj-style icons - thin monoline, geometric, inherit color (matches the wordmark).
const ICON_PATHS = {
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3c2.6 2.8 2.6 15.2 0 18M12 3c-2.6 2.8-2.6 15.2 0 18" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></>,
  bolt: <path d="M13 2 4 14h6l-1 8 9-12h-6z" />,
  target: <><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="3.5" /></>,
  spark: <path d="M12 4c.5 5 2.5 7 7.5 7.5-5 .5-7 2.5-7.5 7.5-.5-5-2.5-7-7.5-7.5 5-.5 7-2.5 7.5-7.5z" />,
  building: <><rect x="6" y="3" width="12" height="18" rx="1" /><path d="M9.5 7h1M13.5 7h1M9.5 11h1M13.5 11h1M9.5 15h1M13.5 15h1M10 21v-3h4v3" /></>,
  tag: <><path d="M3 3h8l9.5 9.5a1.5 1.5 0 0 1 0 2.1l-5.9 5.9a1.5 1.5 0 0 1-2.1 0L3 11z" /><circle cx="7.6" cy="7.6" r="1.3" /></>,
  users: <><circle cx="9" cy="8" r="3.2" /><path d="M3.6 20c0-3.3 2.6-5.2 5.4-5.2s5.4 1.9 5.4 5.2" /><path d="M16 5.2a3.2 3.2 0 0 1 0 6.2M17.5 14.9c2.2.5 3.9 2.2 3.9 5.1" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4.5 20.5c0-3.6 3.4-5.8 7.5-5.8s7.5 2.2 7.5 5.8" /></>,
  pin: <><path d="M12 21c4-4.4 6.5-7.6 6.5-11A6.5 6.5 0 0 0 5.5 10c0 3.4 2.5 6.6 6.5 11z" /><circle cx="12" cy="10" r="2.3" /></>,
  star: <path d="M12 3.5l2.5 5.4 5.9.6-4.4 4 1.2 5.8L12 16.9 6.8 19.3 8 13.5 3.6 9.5l5.9-.6z" />,
  chart: <><path d="M3.5 20.5h17" /><path d="M7 20.5v-7M12 20.5V8M17 20.5v-4.5" /></>,
  folder: <path d="M3.5 7a1.5 1.5 0 0 1 1.5-1.5h3.8l2 2H19a1.5 1.5 0 0 1 1.5 1.5v8.5A1.5 1.5 0 0 1 19 19H5a1.5 1.5 0 0 1-1.5-1.5z" />,
  trend: <><path d="M3.5 16.5 9 11l3.5 3.5L20.5 6.5" /><path d="M15.5 6.5h5v5" /></>,
  phone: <path d="M6 3.5h3.2l1.5 4.2-2.2 1.6a12.5 12.5 0 0 0 6.2 6.2l1.6-2.2 4.2 1.5V18a2.5 2.5 0 0 1-2.7 2.5A17.5 17.5 0 0 1 3.5 6.2 2.5 2.5 0 0 1 6 3.5z" />,
  calendar: <><rect x="4" y="5" width="16" height="15.5" rx="1.5" /><path d="M4 9.5h16M8.5 3v4M15.5 3v4" /></>,
  percent: <><path d="M6 18 18 6" /><circle cx="7.5" cy="7.5" r="2" /><circle cx="16.5" cy="16.5" r="2" /></>,
  external: <><path d="M14 4h6v6" /><path d="M20 4 10 14" /><path d="M18 13v5.5A1.5 1.5 0 0 1 16.5 20h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H11" /></>,
  copy: <><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15.5V6A1.5 1.5 0 0 1 6.5 4.5H16" /></>,
  layers: <><path d="M12 3.5 3.5 8 12 12.5 20.5 8z" /><path d="M3.5 13 12 17.5 20.5 13" /></>,
  download: <><path d="M12 3.5v11M7.5 10l4.5 4.5 4.5-4.5" /><path d="M4 19.5h16" /></>,
};
function Icon({ name, size = 16, stroke = 1.6, color = "currentColor", style }) {
  const body = ICON_PATHS[name];
  if (!body) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
      style={{ display: "block", flexShrink: 0, ...style }}>
      {body}
    </svg>
  );
}
function Spinner({ size = 13, color = C.accent }) {
  return (
    <span style={{
      width: size, height: size, border: `2px solid ${color}33`,
      borderTopColor: color, borderRadius: 999, display: "inline-block",
      animation: "forjspin .7s linear infinite",
    }} />
  );
}
function Confidence({ level }) {
  const map = { high: C.green, low: C.dim2, medium: C.amber };
  const l = lc(level);
  return <Pill color={map[l] || C.dim}>{level}</Pill>;
}

/* ============================================================================
   WEBBTEKNIK-ANALYS-PANEL
   ============================================================================ */
// Data & AI maturity panel - runs analyzeInnovation and shows the grounded result.
const BAND_COLOR = (b) => (b >= 4 ? C.green : b === 3 ? C.blue : b === 2 ? C.amber : C.dim2);
function InnovationPanel({ company, onSave, flash }) {
  const [busy, setBusy] = useState(false);
  const data = company.innovation;

  async function run() {
    if (!company.name && !company.domain) { flash("Need a company name or domain first"); return; }
    setBusy(true);
    try {
      const result = await analyzeInnovation(company);
      await onSave(company.id, {
        innovation: result, innovation_at: now(),
        maturity_band: result.maturity_band, ai_native: result.ai_native, aws_alignment: result.aws_alignment,
      });
      // best-effort: persist evidence rows for cross-company audit (never blocks the save)
      try {
        if (result.signals.length && typeof sb === "function") {
          await sb("company_signals", { method: "POST", prefer: "return=minimal", body: result.signals.map((s) => ({
            company_id: company.id, tool: s.tool, category: s.category, channel: s.channel,
            evidence_quote: s.evidence_quote || null, source_url: s.source_url || null, confidence: s.confidence || null,
          })) });
        }
      } catch {}
      flash(`Innovation scan: ${result.signals.length} signals · ${MATURITY_BANDS[result.maturity_band]}`);
    } catch (e) {
      flash("Innovation scan failed: " + (e?.message || e));
    } finally { setBusy(false); }
  }

  const card = { background: C.panel, border: `1px solid ${C.line}`, borderRadius: 2, padding: 18, marginBottom: 16 };
  const grouped = {};
  for (const s of (data?.signals || [])) (grouped[s.category] ||= []).push(s);

  return (
    <div style={card}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="spark" size={15} color={C.accent} />
          <span style={{ fontWeight: 700, fontSize: 14, color: C.text, fontFamily: FONT_BODY }}>Data &amp; AI maturity</span>
        </div>
        {data?.analyzed_at && <span style={{ fontSize: 11, color: C.dim2, fontFamily: FONT_MONO }}>{fmtDate(data.analyzed_at)}</span>}
      </div>

      {!data && (
        <Btn variant="dark" onClick={run} disabled={busy} full>
          {busy ? <Spinner /> : <Icon name="spark" size={14} color={C.cream} />} {busy ? "Researching stack…" : "Research data & AI stack"}
        </Btn>
      )}

      {data && (
        <>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, background: BAND_COLOR(data.maturity_band) + "14", border: `1px solid ${BAND_COLOR(data.maturity_band)}40`, borderRadius: 2, padding: "8px 14px" }}>
              <span style={{ fontSize: 26, fontWeight: 400, color: BAND_COLOR(data.maturity_band), fontFamily: FONT_DISPLAY, lineHeight: 1 }}>{data.maturity_band}</span>
              <span style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>{MATURITY_BANDS[data.maturity_band] || "Unknown"}</span>
            </div>
            {data.ai_native && <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".04em", color: C.green, border: `1px solid ${C.green}55`, borderRadius: 2, padding: "5px 9px" }}>GenAI-native</span>}
            {data.aws_alignment && data.aws_alignment !== "unknown" && (
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".04em", color: data.aws_alignment === "aws" ? C.accent : C.dim, border: `1px solid ${data.aws_alignment === "aws" ? C.accent : C.line2}`, borderRadius: 2, padding: "5px 9px" }}>
                {data.aws_alignment === "aws" ? "AWS-aligned" : data.aws_alignment === "mixed" ? "Mixed cloud" : data.aws_alignment.toUpperCase() + "-leaning"}
              </span>
            )}
          </div>

          {Object.keys(grouped).length === 0 ? (
            <div style={{ fontSize: 12.5, color: C.dim2, fontStyle: "italic", marginBottom: 10 }}>No grounded data/AI signals found (absence is weak - most live in job ads).</div>
          ) : (
            Object.entries(grouped).sort((a, b) => (INNOVATION_CATEGORIES[b[0]]?.band || 0) - (INNOVATION_CATEGORIES[a[0]]?.band || 0)).map(([cat, sigs]) => (
              <div key={cat} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: C.dim2, marginBottom: 5 }}>
                  {INNOVATION_CATEGORIES[cat]?.label || cat}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {sigs.map((s, i) => (
                    <a key={i} href={s.source_url} target="_blank" rel="noreferrer" title={(s.evidence_quote || "") + (s.source_url ? "\n" + s.source_url : "")}
                      style={{ fontSize: 12, color: C.text, background: C.bg, border: `1px solid ${C.line2}`, borderRadius: 2, padding: "4px 9px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 5 }}>
                      {s.tool}
                      <span style={{ fontSize: 9.5, color: C.dim2, textTransform: "uppercase", letterSpacing: ".05em" }}>{s.channel}</span>
                    </a>
                  ))}
                </div>
              </div>
            ))
          )}

          {data.ai_intent?.length > 0 && (
            <div style={{ fontSize: 11.5, color: C.dim2, marginTop: 8, lineHeight: 1.5 }}>
              <span style={{ fontWeight: 600 }}>AI-intent (unconfirmed):</span> {data.ai_intent.join(" · ")}
            </div>
          )}
          {data.note && <div style={{ fontSize: 11.5, color: C.dim2, fontStyle: "italic", marginTop: 8 }}>{data.note}</div>}

          <div style={{ marginTop: 12 }}>
            <button onClick={run} disabled={busy} style={{ background: "transparent", border: "none", color: C.dim, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: FONT_HEAD }}>
              {busy ? <Spinner size={12} /> : "↻"} Re-scan
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function TechStackPanel({ company, onSave, flash }) {
  const [domain, setDomain] = useState(company.domain || "");
  const [busy, setBusy] = useState(false);
  const [bwOpen, setBwOpen] = useState(false);
  const [bwRaw, setBwRaw] = useState("");
  const [bwKey, setBwKey] = useState("");
  const [bwFnUrl, setBwFnUrl] = useState("");
  const [bwBusy, setBwBusy] = useState(false);
  const [awsBusy, setAwsBusy] = useState(false);
  const [findBusy, setFindBusy] = useState(false);
  const [bwManual, setBwManual] = useState(false);
  const data = company.techstack;

  useEffect(() => {
    (async () => {
      try {
        const k = await window.storage?.get("forjg:builtwith:key");
        if (k && k.value) setBwKey(k.value);
      } catch {}
      try {
        const u = await window.storage?.get("forjg:builtwith:fnurl");
        if (u && u.value) setBwFnUrl(u.value);
        else {
          const base = (typeof window !== "undefined" && window.__ALLOY_SUPABASE__?.url) || "";
          if (base) setBwFnUrl(base.replace(/\/+$/, "") + "/functions/v1/builtwith-lookup");
        }
      } catch {}
    })();
  }, []);
  function saveBwKey(v) {
    setBwKey(v);
    try { window.storage?.set("forjg:builtwith:key", v, false); } catch {}
  }
  function saveBwFnUrl(v) {
    setBwFnUrl(v);
    try { window.storage?.set("forjg:builtwith:fnurl", v, false); } catch {}
  }
  async function fetchViaBackend() {
    const d = bwLookupDomain();
    if (!d) { flash("Enter a domain first"); return; }
    if (!bwFnUrl.trim()) { flash("Set your backend function URL first"); return; }
    setBwBusy(true);
    try {
      const ak = (typeof window !== "undefined" && window.__ALLOY_SUPABASE__?.anonKey) || "";
      const headers = { "Content-Type": "application/json" };
      if (ak) { headers["Authorization"] = "Bearer " + ak; headers["apikey"] = ak; }
      const res = await fetch(bwFnUrl.trim(), {
        method: "POST",
        headers,
        body: JSON.stringify({ domain: d }),
      });
      const text = await res.text();
      if (!res.ok) throw new Error("backend " + res.status + " - " + text.slice(0, 140));
      const parsed = parseBuiltWithToTechstack(text);
      await onSave(company.id, {
        techstack: { ...parsed, analyzed_at: now(), url: d },
        techstack_at: now(),
        domain: d,
      });
      flash("BuiltWith fetched via backend (" + parsed.items.length + " technologies)");
    } catch (e) {
      flash("Backend fetch failed: " + e.message);
    } finally { setBwBusy(false); }
  }
  async function runFindDomain() {
    setFindBusy(true);
    try {
      const r = await resolveDomain(company);
      if (r.domain) {
        setDomain(r.domain);
        await onSave(company.id, { domain: r.domain, enrichment: { ...(company.enrichment || {}), domain_confidence: r.confidence, domain_evidence: r.evidence } });
        flash("Found website: " + r.domain + (r.confidence ? " (" + r.confidence + " confidence)" : ""));
      } else {
        flash("No website found - add it manually if you know it");
      }
    } catch (e) { flash("Find website failed: " + e.message); }
    finally { setFindBusy(false); }
  }
  async function runAwsDetect() {
    const d = bwLookupDomain();
    if (!d) { flash("Enter a domain first"); return; }
    setAwsBusy(true);
    try {
      const r = await detectAws(d);
      await onSave(company.id, {
        aws_detected: !!r.aws_detected,
        cloud_provider: r.provider || (r.aws_detected ? "aws" : "unknown"),
        email_provider: r.email_provider || null,
        aws_signals: (r.signals || []).join(", ") || (r.cdn ? "Behind " + r.cdn : ""),
        domain: d,
      });
      flash((r.provider && CLOUD[r.provider]?.label ? CLOUD[r.provider].label + ": " : "") + ((r.signals || []).join(", ") || (r.cdn ? "behind " + r.cdn : "no major-cloud signal")) + (r.email_label ? " · " + r.email_label : ""));
    } catch (e) {
      flash("AWS check failed: " + e.message);
    } finally { setAwsBusy(false); }
  }
  function bwLookupDomain() {
    return (domain.trim() || company.domain || "").replace(/^https?:\/\//, "").replace(/\/+$/, "");
  }
  function bwApiUrl() {
    return "https://api.builtwith.com/v22/api.json?KEY=" +
      encodeURIComponent(bwKey.trim() || "YOUR_KEY") +
      "&LOOKUP=" + encodeURIComponent(bwLookupDomain());
  }
  function openBwUrl() {
    if (!bwLookupDomain()) { flash("Enter a domain first"); return; }
    if (!bwOpen) setBwOpen(true);
    window.open(bwApiUrl(), "_blank", "noopener");
  }
  async function copyBwUrl() {
    if (!bwLookupDomain()) { flash("Enter a domain first"); return; }
    try {
      await navigator.clipboard.writeText(bwApiUrl());
      flash(bwKey.trim() ? "BuiltWith API URL copied" : "URL copied - add your key first");
    } catch { flash("Copy failed - select the URL below and copy manually"); }
  }

  async function run() {
    if (!domain.trim()) { flash("Enter a domain first"); return; }
    setBusy(true);
    try {
      const result = await analyzeTechStack(domain.trim());
      await onSave(company.id, { techstack: result, techstack_at: now(), domain: domain.trim() });
      flash("Web tech analysis complete");
    } catch (e) {
      flash("Analysis failed: " + e.message);
    } finally { setBusy(false); }
  }

  async function runBuiltWith() {
    try {
      const parsed = parseBuiltWithToTechstack(bwRaw);
      const url = domain.trim() || company.domain || "";
      await onSave(company.id, {
        techstack: { ...parsed, analyzed_at: now(), url },
        techstack_at: now(),
        ...(url ? { domain: url } : {}),
      });
      setBwRaw(""); setBwOpen(false);
      flash("BuiltWith stack imported (" + parsed.items.length + " technologies)");
    } catch (e) {
      flash(e.message);
    }
  }

  const grouped = useMemo(() => {
    if (!data?.items) return [];
    return TECH_CATEGORIES
      .map((cat) => ({ ...cat, items: data.items.filter((i) => i.category === cat.key) }))
      .filter((g) => g.items.length);
  }, [data]);

  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 2, padding: 18, marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="globe" size={16} color={C.accent} />
          <span style={{ fontWeight: 700, fontSize: 14, color: C.text, fontFamily: FONT_BODY }}>Web tech analysis</span>
        </div>
        {data?.analyzed_at && <span style={{ fontSize: 11, color: C.dim2, fontFamily: FONT_MONO }}>{fmtDate(data.analyzed_at)}</span>}
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: grouped.length ? 16 : 0 }}>
        <input
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="https://exempel.se"
          style={{
            flex: 1, background: C.panel2, border: `1px solid ${C.line2}`, borderRadius: 2,
            padding: "10px 13px", color: C.text, fontSize: 13.5, fontFamily: FONT_MONO, outline: "none",
          }}
        />
        <Btn variant="dark" onClick={run} disabled={busy}>
          {busy ? <Spinner /> : <Icon name="search" size={14} color={C.cream} />} {busy ? "Analyzing…" : "Analyze"}
        </Btn>
      </div>

      {!domain.trim() && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 12, background: C.panel2, border: `1px dashed ${C.line2}`, borderRadius: 2, padding: "9px 11px" }}>
          <Btn variant="dark" size="sm" onClick={runFindDomain} disabled={findBusy}>
            {findBusy ? <Spinner /> : <Icon name="globe" size={13} color={C.cream} />} {findBusy ? "Searching the web…" : "Find website"}
          </Btn>
          <span style={{ fontSize: 11.5, color: C.dim2, lineHeight: 1.45, flex: 1 }}>No website yet. Looks it up from name + city - then AWS check & tech analysis unlock.</span>
        </div>
      )}
      {domain.trim() && company.enrichment?.domain_evidence && (
        <div style={{ fontSize: 11, color: C.dim2, marginBottom: 12, marginTop: -4 }}>Website found{company.enrichment.domain_confidence ? ` (${company.enrichment.domain_confidence})` : ""}: {company.enrichment.domain_evidence}</div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
        <Btn variant="ghost" size="sm" onClick={runAwsDetect} disabled={awsBusy}>
          {awsBusy ? <Spinner /> : <Icon name="target" size={13} color={C.accent} />} {awsBusy ? "Detecting cloud…" : "Detect cloud provider (free)"}
        </Btn>
        {cloudMeta(company) && <CloudChip company={company} />}
        {company.email_provider && <Pill color={C.dim2}>{EMAIL_LABEL[company.email_provider] || company.email_provider}</Pill>}
        {company.aws_signals && <span style={{ fontSize: 12, color: C.dim }}>{company.aws_signals}</span>}
      </div>
      {cloudMeta(company) && <div style={{ fontSize: 11.5, color: C.dim2, marginTop: -6, marginBottom: 12, lineHeight: 1.5 }}>{cloudMeta(company).note}</div>}

      <div style={{ fontSize: 11.5, color: C.dim2, marginTop: -4, marginBottom: grouped.length || data?.behind_proxy ? 14 : 0, lineHeight: 1.5 }}>
        AI-powered via web search - detects the stack and cloud from the live site.
      </div>

      {/* BuiltWith "exact stack" UI removed from the card to declutter (2026-05).
          Backend stays intact: the builtwith-lookup edge function,
          parseBuiltWithToTechstack(), and the CSV aws_value/import path are all
          still present - re-add a toggle here to bring the manual lookup back. */}

      {data?.behind_proxy && (
        <div style={{ background: C.amber + "18", border: `1px solid ${C.amber}40`, borderRadius: 2, padding: "10px 13px", marginBottom: 12, fontSize: 12.5, color: C.amber }}>
          This site is behind a proxy/WAF - parts of the stack can't be verified.
        </div>
      )}

      {grouped.map((g) => (
        <div key={g.key} style={{ marginBottom: 13 }}>
          <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: ".15em", textTransform: "uppercase", color: C.dim2, marginBottom: 7 }}>
            {g.label} <span style={{ color: C.dim2 }}>({g.items.length})</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {g.items.map((it, i) => {
              const isAWS = /aws|amazon|cloudfront|route 53|s3|ec2|lambda/i.test(it.name);
              return (
                <span key={i} style={{
                  fontSize: 12.5, fontWeight: 500, padding: "6px 11px", borderRadius: 2,
                  background: isAWS ? C.lime + "1c" : C.panel2,
                  border: `1px solid ${isAWS ? C.lime + "55" : C.line2}`,
                  color: isAWS ? C.lime : C.text, fontFamily: FONT_BODY,
                }}>{it.name}</span>
              );
            })}
          </div>
        </div>
      ))}

      {data?.note && (
        <div style={{ fontSize: 11.5, color: C.dim2, marginTop: 8, fontStyle: "italic" }}>{data.note}</div>
      )}
      {!data && !busy && (
        <div style={{ fontSize: 12.5, color: C.dim2, marginTop: 12 }}>
          Run the analysis to see what tech this company uses - on top of and beyond the CDN.
        </div>
      )}
    </div>
  );
}

/* ============================================================================
   LEAD-ANALYS-PANEL  (samtalshypotesen - "magin")
   ============================================================================ */
function LeadAnalysisPanel({ project, company, contacts, onSave, onAddContact, flash }) {
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState(null);
  const [draftBusy, setDraftBusy] = useState(false);
  const data = company.leadanalysis;

  async function run(deep = false) {
    setBusy(true);
    try {
      const result = deep
        ? await researchLead(project.partner, company, contacts)
        : await analyzeLead(project.partner, company, contacts);
      await onSave(company.id, { leadanalysis: result, leadanalysis_at: now() });
      flash(deep ? "Deep research complete" : "Lead analysis complete");
    } catch (e) {
      flash((deep ? "Deep research" : "Lead analysis") + " failed: " + e.message);
    } finally { setBusy(false); }
  }

  async function makeDraft() {
    setDraftBusy(true);
    try {
      const d = await draftOutreach(project.partner, company, data, contacts && contacts[0]);
      setDraft(d);
    } catch (e) {
      flash("Outreach draft failed: " + e.message);
    } finally { setDraftBusy(false); }
  }

  const copy = (t) => { try { navigator.clipboard?.writeText(t || ""); flash("Copied"); } catch {} };
  const miniBtn = { background: "transparent", border: `1px solid ${C.line}`, borderRadius: 2, padding: "5px 10px", fontSize: 12, color: C.text, cursor: "pointer", fontFamily: FONT_HEAD };
  const linkBtn = { background: "transparent", border: "none", color: C.dim, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: FONT_HEAD };

  const scoreColor = (s) => (s >= 70 ? C.green : s >= 45 ? C.amber : C.dim2);

  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 2, padding: 18, marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="target" size={16} color={C.accent} />
          <span style={{ fontWeight: 700, fontSize: 14, color: C.text, fontFamily: FONT_BODY }}>Lead analysis & call hypothesis</span>
        </div>
        {data?.analyzed_at && <span style={{ fontSize: 11, color: C.dim2, fontFamily: FONT_MONO }}>{fmtDate(data.analyzed_at)}</span>}
      </div>

      {!data && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Btn variant="dark" onClick={() => run(false)} disabled={busy} full>
            {busy ? <Spinner /> : <Icon name="spark" size={14} color={C.cream} />} {busy ? "Working…" : "Analyze lead - build call hypothesis"}
          </Btn>
          {/* "Deep research" (researchLead agent) button removed to declutter (2026-05):
              it overlapped "Analyze lead" (same output shape) and is token-heavy /
              rate-limit-prone on Tier 1. researchLead() + run(true) remain in code. */}
        </div>
      )}

      {data && (
        <>
          {/* score + verdict + angle */}
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start", background: scoreColor(data.score) + "14", border: `1px solid ${scoreColor(data.score)}40`, borderRadius: 2, padding: "14px 16px", marginBottom: 16 }}>
            <div style={{ fontSize: 34, fontWeight: 400, color: scoreColor(data.score), fontFamily: FONT_DISPLAY, lineHeight: 1 }}>
              {data.score}<span style={{ fontSize: 16 }}>%</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13.5, color: C.text, marginBottom: 3 }}>{data.verdict}</div>
              {data.angle && <div style={{ fontSize: 12.5, color: C.dim, lineHeight: 1.5 }}>{data.angle}</div>}
            </div>
          </div>

          {/* call opener - the deliverable */}
          {data.opener && (
            <div style={{ background: C.dark, borderRadius: 2, padding: "20px 22px", marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: ".15em", textTransform: "uppercase", color: C.accent, marginBottom: 12 }}>Call opener</div>
              <div style={{ fontSize: 17, color: C.cream, lineHeight: 1.55, fontFamily: FONT_DISPLAY, fontStyle: "italic", letterSpacing: "-.005em" }}>{data.opener}</div>
            </div>
          )}

          {/* what to ask on the call */}
          {data.ask?.length > 0 && (
            <AnalysisBlock title="Ask on the call">
              {data.ask.map((q, i) => (
                <div key={i} style={{ display: "flex", gap: 9, marginBottom: 9, fontSize: 13, color: C.text, lineHeight: 1.5 }}>
                  <span style={{ color: C.lime, fontWeight: 700, fontFamily: FONT_MONO }}>{i + 1}</span>
                  <span>{q}</span>
                </div>
              ))}
            </AnalysisBlock>
          )}

          {/* one-line caveats */}
          {(data.avoid || data.contact) && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
              {data.avoid && <div style={{ fontSize: 12.5, color: C.dim, lineHeight: 1.5 }}><span style={{ color: C.red, fontWeight: 600 }}>Avoid:</span> {data.avoid}</div>}
              {data.contact && <div style={{ fontSize: 12.5, color: C.dim, lineHeight: 1.5 }}><span style={{ color: C.blue, fontWeight: 600 }}>Who:</span> {data.contact}</div>}
            </div>
          )}

          {/* outreach draft (agent) - on-demand only; phone-first workflow */}
          {draft && (
            <div style={{ marginTop: 14, borderTop: `1px solid ${C.line}`, paddingTop: 14 }}>
              <div style={{ background: C.bg, border: `1px solid ${C.line}`, borderRadius: 2, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: ".15em", textTransform: "uppercase", color: C.accent }}>{draft.channel === "linkedin" ? "LinkedIn" : "Email"} draft</span>
                  <button onClick={() => setDraft(null)} style={{ background: "transparent", border: "none", color: C.dim2, fontSize: 13, cursor: "pointer" }}>✕</button>
                </div>
                {draft.subject ? <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6 }}>{draft.subject}</div> : null}
                <div style={{ fontSize: 13, color: C.text, lineHeight: 1.55, whiteSpace: "pre-wrap", marginBottom: 10 }}>{draft.body}</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button onClick={() => copy([draft.subject, draft.body].filter(Boolean).join("\n\n"))} style={miniBtn}>Copy</button>
                  {draft.alt_body ? <button onClick={() => copy(draft.alt_body)} style={miniBtn}>Copy short</button> : null}
                  <button onClick={makeDraft} disabled={draftBusy} style={miniBtn}>{draftBusy ? "…" : "↻ Redraft"}</button>
                </div>
                {draft.notes ? <div style={{ fontSize: 11.5, color: C.dim2, marginTop: 10, fontStyle: "italic" }}>{draft.notes}</div> : null}
              </div>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, gap: 10, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {data.confidence && <Confidence level={data.confidence} />}
              <span style={{ fontSize: 11, color: C.dim2, fontStyle: "italic" }}>Double-check before calling.</span>
            </div>
            <div style={{ display: "flex", gap: 14 }}>
              {!draft && <button onClick={makeDraft} disabled={draftBusy} style={linkBtn} title="Only if email earns the meeting">{draftBusy ? <Spinner size={12} /> : "✉"} Email draft</button>}
              <button onClick={() => run(false)} disabled={busy} style={linkBtn}>{busy ? <Spinner size={12} /> : "↻"} Re-run</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
function AnalysisBlock({ title, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: ".15em", textTransform: "uppercase", color: C.dim2, marginBottom: 9 }}>{title}</div>
      {children}
    </div>
  );
}

/* ============================================================================
   COMPANY INTELLIGENCE  -  merged cloud + web-tech + data/AI maturity (one box).
   Smart default: "Analyze" runs the free cloud detect + live web-tech scan;
   "+ Data & AI deep scan" runs the heavier job-ad/blog/GitHub innovation agent
   only when a lead is worth the dig (Tier-1 token budget). Replaces the separate
   TechStackPanel + InnovationPanel mounts on the card (those defs are now unused).
   ============================================================================ */
function CompanyIntelPanel({ company, onSave, flash }) {
  const [domain, setDomain] = useState(company.domain || "");
  const [findBusy, setFindBusy] = useState(false);
  const [busy, setBusy] = useState(false);      // cloud + web tech
  const [aiBusy, setAiBusy] = useState(false);  // data/AI deep scan
  const tech = company.techstack;
  const innov = company.innovation;

  const lookupDomain = () => (domain.trim() || company.domain || "").replace(/^https?:\/\//, "").replace(/\/+$/, "");

  async function runFindDomain() {
    setFindBusy(true);
    try {
      const r = await resolveDomain(company);
      if (r.domain) {
        setDomain(r.domain);
        await onSave(company.id, { domain: r.domain, enrichment: { ...(company.enrichment || {}), domain_confidence: r.confidence, domain_evidence: r.evidence } });
        flash("Found website: " + r.domain + (r.confidence ? " (" + r.confidence + " confidence)" : ""));
      } else flash("No website found - add it manually if you know it");
    } catch (e) { flash("Find website failed: " + e.message); }
    finally { setFindBusy(false); }
  }

  // Smart default: free cloud detect first, then the live web-tech (fetch_tech) scan.
  async function runAnalyze() {
    const d = lookupDomain();
    if (!d) { flash("Find or enter a website first"); return; }
    setBusy(true);
    try {
      try {
        const r = await detectAws(d);
        await onSave(company.id, {
          aws_detected: !!r.aws_detected,
          cloud_provider: r.provider || (r.aws_detected ? "aws" : "unknown"),
          email_provider: r.email_provider || null,
          aws_signals: (r.signals || []).join(", ") || (r.cdn ? "Behind " + r.cdn : ""),
          domain: d,
        });
      } catch (e) { flash("Cloud detect failed: " + e.message); }
      const result = await analyzeTechStack(d);
      await onSave(company.id, { techstack: result, techstack_at: now(), domain: d });
      flash("Company analysis complete");
    } catch (e) { flash("Analysis failed: " + e.message); }
    finally { setBusy(false); }
  }

  async function runDeep() {
    if (!company.name && !lookupDomain()) { flash("Need a company name or domain first"); return; }
    setAiBusy(true);
    try {
      const result = await analyzeInnovation(company);
      await onSave(company.id, { innovation: result, innovation_at: now(), maturity_band: result.maturity_band, ai_native: result.ai_native, aws_alignment: result.aws_alignment });
      try {
        if (result.signals.length && typeof sb === "function") {
          await sb("company_signals", { method: "POST", prefer: "return=minimal", body: result.signals.map((s) => ({
            company_id: company.id, tool: s.tool, category: s.category, channel: s.channel,
            evidence_quote: s.evidence_quote || null, source_url: s.source_url || null, confidence: s.confidence || null,
          })) });
        }
      } catch {}
      flash(`Data & AI scan: ${result.signals.length} signals · ${MATURITY_BANDS[result.maturity_band]}`);
    } catch (e) { flash("Data & AI scan failed: " + (e?.message || e)); }
    finally { setAiBusy(false); }
  }

  const techGrouped = useMemo(() => {
    if (!tech?.items) return [];
    return TECH_CATEGORIES.map((cat) => ({ ...cat, items: tech.items.filter((i) => i.category === cat.key) })).filter((g) => g.items.length);
  }, [tech]);
  const innovGrouped = {};
  for (const s of (innov?.signals || [])) (innovGrouped[s.category] ||= []).push(s);

  const card = { background: C.panel, border: `1px solid ${C.line}`, borderRadius: 2, padding: 18, marginBottom: 16 };
  const subhead = { fontSize: 10, fontWeight: 600, letterSpacing: ".15em", textTransform: "uppercase", color: C.dim2, marginBottom: 8 };

  return (
    <Collapsible title="Company intelligence" sectionKey="intel"
      right={(tech?.analyzed_at || innov?.analyzed_at) ? <span style={{ fontSize: 11, color: C.dim2, fontFamily: FONT_MONO }}>{fmtDate(innov?.analyzed_at || tech?.analyzed_at)}</span> : null}>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="https://exempel.se"
          style={{ flex: 1, background: C.panel2, border: `1px solid ${C.line2}`, borderRadius: 2, padding: "10px 13px", color: C.text, fontSize: 13.5, fontFamily: FONT_MONO, outline: "none" }} />
        <Btn variant="dark" onClick={runAnalyze} disabled={busy}>
          {busy ? <Spinner /> : <Icon name="search" size={14} color={C.cream} />} {busy ? "Analyzing…" : "Analyze"}
        </Btn>
      </div>

      {!lookupDomain() && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 12, background: C.panel2, border: `1px dashed ${C.line2}`, borderRadius: 2, padding: "9px 11px" }}>
          <Btn variant="dark" size="sm" onClick={runFindDomain} disabled={findBusy}>
            {findBusy ? <Spinner /> : <Icon name="globe" size={13} color={C.cream} />} {findBusy ? "Searching…" : "Find website"}
          </Btn>
          <span style={{ fontSize: 11.5, color: C.dim2, lineHeight: 1.45, flex: 1 }}>No website yet. Looks it up from name + city - then cloud + tech analysis unlock.</span>
        </div>
      )}

      <div style={{ fontSize: 11.5, color: C.dim2, marginBottom: 14, lineHeight: 1.5 }}>
        “Analyze” runs a free cloud-provider check + live web-tech scan. The data &amp; AI deep scan reads job ads, eng blogs &amp; GitHub - slower, run it on leads worth the dig.
      </div>

      {(cloudMeta(company) || company.aws_signals || company.email_provider) && (
        <div style={{ marginBottom: 14 }}>
          <div style={subhead}>Cloud &amp; infrastructure</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {cloudMeta(company) && <CloudChip company={company} />}
            {company.email_provider && <Pill color={C.dim2}>{EMAIL_LABEL[company.email_provider] || company.email_provider}</Pill>}
            {company.aws_signals && <span style={{ fontSize: 12, color: C.dim }}>{company.aws_signals}</span>}
          </div>
          {cloudMeta(company) && <div style={{ fontSize: 11.5, color: C.dim2, marginTop: 6, lineHeight: 1.5 }}>{cloudMeta(company).note}</div>}
        </div>
      )}

      {tech?.behind_proxy && (
        <div style={{ background: C.amber + "18", border: `1px solid ${C.amber}40`, borderRadius: 2, padding: "10px 13px", marginBottom: 12, fontSize: 12.5, color: C.amber }}>
          This site is behind a proxy/WAF - parts of the stack can't be verified.
        </div>
      )}
      {techGrouped.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={subhead}>Web tech stack</div>
          {techGrouped.map((g) => (
            <div key={g.key} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: C.dim2, marginBottom: 5 }}>{g.label} <span style={{ color: C.dim2 }}>({g.items.length})</span></div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {g.items.map((it, i) => {
                  const isAWS = /aws|amazon|cloudfront|route 53|s3|ec2|lambda/i.test(it.name);
                  return <span key={i} style={{ fontSize: 12, fontWeight: 500, padding: "5px 10px", borderRadius: 2, background: isAWS ? C.lime + "1c" : C.panel2, border: `1px solid ${isAWS ? C.lime + "55" : C.line2}`, color: isAWS ? C.lime : C.text, fontFamily: FONT_BODY }}>{it.name}</span>;
                })}
              </div>
            </div>
          ))}
          {tech?.note && <div style={{ fontSize: 11.5, color: C.dim2, marginTop: 4, fontStyle: "italic" }}>{tech.note}</div>}
        </div>
      )}

      <div style={{ borderTop: `1px solid ${C.line}`, paddingTop: 14, marginTop: 4 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, gap: 10, flexWrap: "wrap" }}>
          <div style={{ ...subhead, marginBottom: 0 }}>Data &amp; AI maturity</div>
          {innov && (
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 7, background: BAND_COLOR(innov.maturity_band) + "14", border: `1px solid ${BAND_COLOR(innov.maturity_band)}40`, borderRadius: 2, padding: "5px 11px" }}>
                <span style={{ fontSize: 20, fontWeight: 400, color: BAND_COLOR(innov.maturity_band), fontFamily: FONT_DISPLAY, lineHeight: 1 }}>{innov.maturity_band}</span>
                <span style={{ fontSize: 12, color: C.text, fontWeight: 600 }}>{MATURITY_BANDS[innov.maturity_band] || "Unknown"}</span>
              </div>
              {innov.ai_native && <span style={{ fontSize: 10.5, fontWeight: 700, color: C.green, border: `1px solid ${C.green}55`, borderRadius: 2, padding: "4px 8px" }}>GenAI-native</span>}
              {innov.aws_alignment && innov.aws_alignment !== "unknown" && <span style={{ fontSize: 10.5, fontWeight: 700, color: innov.aws_alignment === "aws" ? C.accent : C.dim, border: `1px solid ${innov.aws_alignment === "aws" ? C.accent : C.line2}`, borderRadius: 2, padding: "4px 8px" }}>{innov.aws_alignment === "aws" ? "AWS-aligned" : innov.aws_alignment === "mixed" ? "Mixed cloud" : innov.aws_alignment.toUpperCase() + "-leaning"}</span>}
            </div>
          )}
        </div>

        {!innov && (
          <Btn variant="ghost" size="sm" onClick={runDeep} disabled={aiBusy}>
            {aiBusy ? <Spinner /> : <Icon name="spark" size={13} color={C.accent} />} {aiBusy ? "Researching stack…" : "+ Data & AI deep scan"}
          </Btn>
        )}

        {innov && (
          <>
            {Object.keys(innovGrouped).length === 0 ? (
              <div style={{ fontSize: 12.5, color: C.dim2, fontStyle: "italic", marginBottom: 8 }}>No grounded data/AI signals found (absence is weak - most live in job ads).</div>
            ) : (
              Object.entries(innovGrouped).sort((a, b) => (INNOVATION_CATEGORIES[b[0]]?.band || 0) - (INNOVATION_CATEGORIES[a[0]]?.band || 0)).map(([cat, sigs]) => (
                <div key={cat} style={{ marginBottom: 9 }}>
                  <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: C.dim2, marginBottom: 5 }}>{INNOVATION_CATEGORIES[cat]?.label || cat}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {sigs.map((s, i) => (
                      <a key={i} href={s.source_url} target="_blank" rel="noreferrer" title={(s.evidence_quote || "") + (s.source_url ? "\n" + s.source_url : "")}
                        style={{ fontSize: 12, color: C.text, background: C.bg, border: `1px solid ${C.line2}`, borderRadius: 2, padding: "4px 9px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 5 }}>
                        {s.tool}<span style={{ fontSize: 9.5, color: C.dim2, textTransform: "uppercase", letterSpacing: ".05em" }}>{s.channel}</span>
                      </a>
                    ))}
                  </div>
                </div>
              ))
            )}
            {innov.ai_intent?.length > 0 && <div style={{ fontSize: 11.5, color: C.dim2, marginTop: 8, lineHeight: 1.5 }}><span style={{ fontWeight: 600 }}>AI-intent (unconfirmed):</span> {innov.ai_intent.join(" · ")}</div>}
            {innov.note && <div style={{ fontSize: 11.5, color: C.dim2, fontStyle: "italic", marginTop: 8 }}>{innov.note}</div>}
            <button onClick={runDeep} disabled={aiBusy} style={{ marginTop: 10, background: "transparent", border: "none", color: C.dim, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: FONT_HEAD }}>{aiBusy ? <Spinner size={12} /> : "↻"} Re-scan data &amp; AI</button>
          </>
        )}
      </div>
    </Collapsible>
  );
}

/* AWS funding-fit - deterministic track + score, UPSTREAM of Partner Central.
   Reads the persisted funding_eligibility row; "Re-score" recomputes ($0, no LLM). */
const FUND_TRACK_META = {
  MAP:            { label: "MAP - Migrate to AWS",     blurb: "Competitor-cloud / on-prem takeout" },
  MAP_MODERNIZE:  { label: "MAP - Modernize",          blurb: "GenAI/agentic on existing AWS workloads" },
  POC:            { label: "POC",                       blurb: "Net-new GenAI proof-of-concept" },
  ISV_WMP:        { label: "ISV · Marketplace (WMP)",   blurb: "List SaaS on AWS Marketplace" },
  GREENFIELD_PGP: { label: "Greenfield (PGP)",          blurb: "No current cloud - net-new build" },
  NONE:           { label: "No funding signal",         blurb: "Pure AWS or no migration signal" },
};

/* ----------------------------------------------------------------------------
   AWS PLAYBOOK  —  Smith's brain. One source of per-play truth that the
   Funding Brief, Next-best-action, Qualification and Co-sell panels all read,
   so guidance is consistent. This is what makes Smith AWS-funding-native
   instead of a generic CRM: each play maps to its own AWS programs, money line,
   objections, MEDDIC anchors, and stage-by-stage next move. $0, deterministic.
   ---------------------------------------------------------------------------- */
const AWS_PLAYBOOK = {
  MAP: {
    motion: "On a competitor cloud or on-prem → migrate to AWS, AWS co-funds the move.",
    programSeq: "OLA (free assessment) → MAP Assess → Mobilize → Migrate",
    moneyLine: "AWS co-funds ~25% of the migration via MAP credits + partner funding. An OLA quantifies the savings at no cost.",
    leadWith: "Offer a free OLA assessment — it quantifies their current spend and the AWS savings before any commitment.",
    meddic: {
      Metrics: "Current cloud / on-prem spend — the size of the migration (drives the MAP funding amount).",
      "Economic buyer": "Who signs off on a multi-year cloud commitment (CIO / CFO / Head of IT).",
      "Decision criteria": "Cost, risk, and lock-in of staying on Azure/GCP vs moving.",
      "Decision process": "Is there a migration-readiness review or cloud RFP underway?",
      "Identify pain": "Cost pressure, end-of-life hardware, vendor lock-in, or a renewal deadline.",
      Champion: "Who owns the migration / modernization budget internally.",
    },
    objections: [
      ["“We're committed to Azure/GCP.”", "MAP de-risks the move and AWS co-funds it; an OLA quantifies the savings for free — no commitment."],
      ["“Migration is too risky.”", "MAP Assess builds the full business case and migration plan before you commit a krona."],
      ["“No time or people for this.”", "It's partner-led and AWS-funded — you don't staff it; the partner runs it."],
    ],
    nextByStage: {
      lead: "Confirm current cloud + spend band, then book a discovery call.",
      research: "Confirm the decision-maker and current cloud spend before outreach.",
      kontaktad: "Offer a free OLA assessment to quantify their AWS savings.",
      mote_bokat: "Run the OLA / scope MAP Assess in the meeting.",
      kvalificerad: "Submit the MAP Assess funding request via Partner Central.",
      forslag: "Get sign-off on the migration business case; mobilize.",
    },
  },
  MAP_MODERNIZE: {
    motion: "Already on AWS → modernize existing workloads (GenAI / containers / data).",
    programSeq: "OLA → MAP Modernize → GenAI / modernization credits",
    moneyLine: "MAP Modernize funds the modernization of workloads they already run on AWS — expansion revenue, warm account.",
    leadWith: "They already trust AWS — lead with a specific modernization win (cost, GenAI, or resilience) on a workload they run today.",
    meddic: {
      Metrics: "Current AWS spend + the workload targeted for modernization.",
      "Economic buyer": "Who owns the AWS account / the workload's P&L.",
      "Decision criteria": "ROI of modernizing vs leaving the workload as-is.",
      "Decision process": "Existing AWS account team + their internal roadmap.",
      "Identify pain": "Tech debt, scaling limits, or a GenAI ambition they can't yet ship.",
      Champion: "The engineering or product owner of the target workload.",
    },
    objections: [
      ["“What we have works fine.”", "Modernization is funded — MAP Modernize underwrites the upgrade, so it's low-cost to prove value."],
      ["“We'll do it ourselves.”", "The partner + AWS funding accelerates it; you keep ownership, they de-risk delivery."],
    ],
    nextByStage: {
      lead: "Identify the modernization-ready workload + the AWS account owner.",
      kontaktad: "Propose a modernization assessment on a named workload.",
      mote_bokat: "Scope the modernization + the MAP Modernize funding ask.",
      kvalificerad: "Submit the MAP Modernize funding request.",
    },
  },
  POC: {
    motion: "Net-new GenAI use case → AWS funds a proof-of-concept, convert to production.",
    programSeq: "POC credits → production commitment → (MAP Modernize at scale)",
    moneyLine: "AWS funds the GenAI pilot with POC credits — prove value cheaply, then convert to a funded production build.",
    leadWith: "Anchor on ONE concrete GenAI use case with a measurable outcome; AWS credits cover the pilot.",
    meddic: {
      Metrics: "The KPI the GenAI pilot will move (cost saved / revenue / time).",
      "Economic buyer": "Who funds production after a successful pilot.",
      "Decision criteria": "Pilot success metric + path to production.",
      "Decision process": "Pilot → review → production decision.",
      "Identify pain": "A manual/expensive process GenAI can automate.",
      Champion: "The innovation / data / product sponsor.",
    },
    objections: [
      ["“GenAI is hype.”", "That's why it's a funded POC — prove one concrete outcome with AWS credits before committing."],
      ["“Data isn't ready.”", "The POC scopes exactly what data is needed; AWS funds the readiness work."],
    ],
    nextByStage: {
      lead: "Pin down the single GenAI use case + its success metric.",
      kontaktad: "Propose a scoped, AWS-funded POC.",
      mote_bokat: "Agree the pilot scope + the POC credits ask.",
      kvalificerad: "Submit the POC funding request.",
    },
  },
  ISV_WMP: {
    motion: "Software vendor → list on AWS Marketplace, co-sell with AWS.",
    programSeq: "Marketplace listing → WMP funding → co-sell motion",
    moneyLine: "WMP funds the Marketplace listing + go-to-market; AWS sellers then co-sell the product.",
    leadWith: "Frame AWS Marketplace as a new distribution channel with AWS's sales force behind it, funded by WMP.",
    meddic: {
      Metrics: "Current ARR + the channel revenue Marketplace could add.",
      "Economic buyer": "The vendor's CEO / VP Sales.",
      "Decision criteria": "Channel economics + listing effort vs funded support.",
      "Decision process": "Listing + co-sell enablement.",
      "Identify pain": "Slow distribution / high CAC the AWS channel can offset.",
      Champion: "Head of partnerships / sales.",
    },
    objections: [
      ["“Marketplace is just billing.”", "It's a co-sell channel — AWS sellers bring it into their accounts, and WMP funds the launch."],
    ],
    nextByStage: {
      lead: "Confirm it's a SaaS product fit for Marketplace.",
      kontaktad: "Propose a funded Marketplace listing + co-sell plan.",
      mote_bokat: "Scope the listing + WMP funding.",
    },
  },
  GREENFIELD_PGP: {
    motion: "No cloud yet → net-new build on AWS, partner-led with activation funding.",
    programSeq: "Partner-led PGP → activation credits → MAP at scale",
    moneyLine: "Partner-led PGP + activation credits fund the net-new build; lands the account on AWS from day one.",
    leadWith: "They're choosing a cloud for the first time — be the trusted guide; AWS funds the first build.",
    meddic: {
      Metrics: "Scope of the net-new project + expected AWS spend.",
      "Economic buyer": "Project sponsor / founder / CTO.",
      "Decision criteria": "Which cloud to standardize on.",
      "Decision process": "Vendor selection for the new build.",
      "Identify pain": "A new product/system that needs infrastructure now.",
      Champion: "The technical lead of the new initiative.",
    },
    objections: [
      ["“We haven't picked a cloud.”", "That's the moment — AWS funds the first build via PGP, so the safe choice is also the cheapest to start."],
    ],
    nextByStage: {
      lead: "Confirm the net-new project scope + timeline.",
      kontaktad: "Position AWS + partner-led build with activation funding.",
      mote_bokat: "Scope the build + the PGP funding ask.",
    },
  },
  NONE: {
    motion: "No clear funding signal yet — qualify the cloud situation before investing time.",
    programSeq: "Re-detect cloud / re-score → assign a play",
    moneyLine: "No fundable play detected. Confirm their cloud + a migration/modernization trigger first.",
    leadWith: "Qualify: confirm cloud, spend, and any change trigger before spending sales effort here.",
    meddic: {},
    objections: [],
    nextByStage: { lead: "Confirm cloud + look for a migration/modernization trigger." },
  },
};
function playbookFor(track) { return AWS_PLAYBOOK[track] || AWS_PLAYBOOK.NONE; }

// ---- SMITH RECOMMENDATION ENGINE (deterministic, $0) ----------------------------------
// Smith's proactive brain. Given the project's companies + their real funding tracks
// (trackMap from funding_eligibility) + contacts + activities, pick the single best
// account to work for EACH fundable play, and arm the rep with why + the opener.
// Pure function: no LLM, no network. Reused by the dashboard hero AND the floating launcher.
const SMITH_PLAYS = [
  { track: "MAP", label: "Migrate", prog: "MAP", accent: "accent" },
  { track: "MAP_MODERNIZE", label: "Modernize", prog: "MAP Modernize", accent: "teal" },
  { track: "POC", label: "GenAI", prog: "POC credits", accent: "violet" },
  { track: "GREENFIELD_PGP", label: "Greenfield", prog: "Partner-led", accent: "blue" },
];
function daysSince(iso) {
  if (!iso) return Infinity;
  const t = Date.parse(iso);
  if (!isFinite(t)) return Infinity;
  return Math.floor((Date.now() - t) / 86400000);
}
// Why this account needs the rep now (highest-priority reason wins).
function smithReason(c, hasContact, lastActDays, stage) {
  if (!hasContact) return { tag: "no contact", urgency: 3, action: "Find the decision-maker, then open the funding play." };
  if (stage === "mote_bokat") return { tag: "meeting booked", urgency: 2, action: "Log the outcome + confirm the funding next step." };
  if (lastActDays >= 30) return { tag: lastActDays === Infinity ? "never worked" : lastActDays + "d cold", urgency: 2, action: "Re-engage before it goes fully cold." };
  if (phaseOf(stage) === "readiness") return { tag: "ready, not opened", urgency: 1, action: "Open the play — they're qualified and untouched." };
  return { tag: "in motion", urgency: 0, action: "Advance to the next stage." };
}
function smithRecommendations(projCompanies, trackMap, contactSet, activities, opts = {}) {
  const lastActOf = {};
  for (const a of (activities || [])) {
    const d = a && a.company_id;
    if (!d) continue;
    const cur = lastActOf[d];
    if (cur === undefined || (a.created_at || "") > cur) lastActOf[d] = a.created_at || "";
  }
  const recs = [];
  for (const play of SMITH_PLAYS) {
    const cands = projCompanies
      .filter((c) => (trackMap[c.id] && trackMap[c.id].primary_track) === play.track)
      .map((c) => {
        const fe = trackMap[c.id] || {};
        const hasContact = contactSet.has(c.id);
        const lastActDays = daysSince(lastActOf[c.id]);
        const reason = smithReason(c, hasContact, lastActDays, c.stage);
        // priority = urgency first, then fundability, then confidence
        const conf = fe.confidence === "high" ? 2 : fe.confidence === "med" ? 1 : 0;
        const priority = reason.urgency * 1000 + (fe.fundability_score || 0) + conf;
        return { company: c, fe, reason, priority, hasContact, lastActDays };
      })
      .sort((a, b) => b.priority - a.priority);
    if (!cands.length) continue;
    const top = cands[0];
    const pb = playbookFor(play.track);
    recs.push({
      track: play.track, label: play.label, prog: play.prog, accent: play.accent,
      count: cands.length,
      company: top.company,
      fundability: top.fe.fundability_score ?? null,
      confidence: top.fe.confidence || null,
      reasonTag: top.reason.tag,
      action: top.reason.action,
      opener: pb.leadWith,
      needyCount: cands.filter((x) => x.reason.urgency >= 2).length,
    });
  }
  // strongest play first (most urgent need, then biggest fundability on the top account)
  recs.sort((a, b) => (b.needyCount - a.needyCount) || ((b.fundability || 0) - (a.fundability || 0)));
  return recs;
}

// Build a compact, grounded CONTEXT block for Smith's chat from the real loaded data, then
// ---- SMITH'S VOICE — one character, reused across chat / drafts / briefing ----------------
// Forj forges the Alloy; Smith works the forge. He's a warm, seasoned craftsman: a peer who
// knows the AWS-funding trade cold, takes quiet pride in good work, and never fakes it.
// This is appended client-side to ground tone; the proxy's smith_chat system carries the rules.
const SMITH_VOICE = `You are Smith — Forj's AWS sales co-worker inside Alloy. Forj forges the Alloy; you work the forge.
Character: a warm, seasoned craftsman. You're a peer who has worked hundreds of AWS deals, not an eager assistant. You take quiet pride in a well-built pipeline and you genuinely want the rep to win.
Voice: warm but economical; Nordic-understated, never hype. Encouraging without being soft — you acknowledge good work, then point at the next move. You speak AWS-funding natively (MAP, MAP-Modernize, POC credits, Greenfield/PGP, ISV/WMP, ACE, MDF) and explain a term only when it helps.
Always: name the account + the number that matters + one concrete next move. Flag risk plainly ("this is a guess", "30 days cold"). Be brief — a busy AE is reading between calls.
Never: emoji spam, "As an AI", "Great question!", fake urgency, marketing fluff, or inventing a company/number/contact you don't have. If you don't know, say so and say how to find out.
Integrity: you ADVISE, you don't act. You'd never send or file something in the rep's name — out of respect, not limitation. You draft; they send. Say so when relevant ("I drafted it — you send it").`;

// ask claude-proxy (task smith_chat). Read-only: Smith advises, never acts. Returns text.
async function smithChat({ question, history, project, projCompanies, trackMap, contacts, recs, web }) {
  const contactSet = new Set((contacts || []).map((x) => x.company_id));
  const byTrack = {};
  for (const c of projCompanies) { const t = (trackMap[c.id] && trackMap[c.id].primary_track) || "NONE"; (byTrack[t] = byTrack[t] || []).push(c); }
  const PLAY_NAME = { MAP: "Migrate", MAP_MODERNIZE: "Modernize", POC: "GenAI", GREENFIELD_PGP: "Greenfield", ISV_WMP: "Marketplace", NONE: "No play" };
  const counts = Object.entries(byTrack).map(([t, arr]) => `${PLAY_NAME[t] || t}: ${arr.length}`).join(", ");
  // top accounts per play by fundability (cap so we stay well under input limits)
  const topPerPlay = Object.entries(byTrack).map(([t, arr]) => {
    const top = arr
      .map((c) => ({ c, fe: trackMap[c.id] || {} }))
      .sort((a, b) => (b.fe.fundability_score || 0) - (a.fe.fundability_score || 0))
      .slice(0, 8)
      .map(({ c, fe }) => `${c.name} (fund ${fe.fundability_score ?? "?"}${fe.confidence ? "/" + fe.confidence : ""}${contactSet.has(c.id) ? "" : ", no contact"}${c.stage ? ", " + (STAGE_LABEL[c.stage] || c.stage) : ""})`)
      .join("; ");
    return `${PLAY_NAME[t] || t} [${arr.length}]: ${top}`;
  }).join("\n");
  const recLines = (recs || []).map((r) => `- ${r.label}: work ${r.company.name} (${r.reasonTag}; ${r.action})`).join("\n");
  const context =
`CONTEXT (the rep's real pipeline — ground every answer in this; do not invent companies/numbers):
PARTNER: ${project?.partner?.name || project?.name || "AWS partner"}
PROJECT: ${project?.name} — ${projCompanies.length} active companies.
PLAY COUNTS: ${counts}
TOP ACCOUNTS PER PLAY:
${topPerPlay}
SMITH'S CURRENT PICKS:
${recLines || "(none)"}

The plays = AWS funding programs: Migrate(MAP, move existing estate to AWS), Modernize(MAP-Modernize, already on AWS → optimize/resell/expand), GenAI(POC credits, net-new GenAI pilot), Greenfield(PGP/Partner-led, net-new build), Marketplace(ISV-WMP).`;
  const convo = (history || []).slice(-6).map((m) => `${m.role === "user" ? "REP" : "SMITH"}: ${m.text}`).join("\n");
  const webNote = web
    ? `\n\nWEB SEARCH IS ON: for questions about what's new / recent signals at a COMPANY (funding, leadership change, hiring, product, cloud move), use web_search and cite what you find. Research the COMPANY for B2B context only — not private detail on individuals. If search returns nothing solid, say so; never fabricate a signal.`
    : "";
  const user = `${SMITH_VOICE}\n\n${context}${webNote}\n\n${convo ? "CONVERSATION SO FAR:\n" + convo + "\n\n" : ""}REP'S QUESTION: ${question}\n\nAnswer as Smith — in character, grounded in the context above.`;
  const tools = web ? [{ type: "web_search_20250305", name: "web_search", max_uses: 3 }] : undefined;
  return await callClaude({ user, task: "smith_chat", maxTokens: 900, tools });
}

// Deterministic AWS cost estimate for the MAP fund request. Itemizes the SAME spend figure
// already on the card (ace.expected_revenue_usd = the est. annual AWS spend) across the
// services a typical migration uses - so there is never a second, contradictory number.
// $0, no AWS creds. The exact figure is refined in the AWS Pricing Calculator (link below);
// a future MCP sidecar can mint a real shareable calculator.aws estimate URL post-AWS-move.
const CALC = {
  regionLabel: "Europe (Stockholm) · eu-north-1",
  calcUrl: "https://calculator.aws/#/",
  mapOffsetPct: 25,   // mirrors funding_config.migration_offset_pct (display only here)
  split: [            // typical MAP migration cost split (sums to 1.0)
    ["Compute (EC2)", 0.50],
    ["Database (RDS)", 0.22],
    ["Storage (S3 / EBS)", 0.13],
    ["Network / data transfer", 0.08],
    ["Mgmt, backup, support", 0.07],
  ],
};
function estimateAwsCost(annualUsd) {
  const yr = Number(annualUsd) || 0;
  if (yr <= 0) return null;
  const mo = yr / 12;
  const items = CALC.split.map(([label, pct]) => ({ label, mo: mo * pct }));
  return { yr, mo, items, mapYr: yr * (CALC.mapOffsetPct / 100) };
}
function FundingFitPanel({ company, flash }) {
  const [fit, setFit] = useState(null);
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        if (typeof sb === "function") {
          const rows = await sb("funding_eligibility", { query: `?company_id=eq.${company.id}&select=*` });
          if (live && rows && rows[0]) { setFit(rows[0]); setLoaded(true); return; }
        }
      } catch { /* fall through to lazy compute */ }
      if (live) setLoaded(true);
    })();
    return () => { live = false; };
  }, [company.id]);

  async function rescore() {
    setBusy(true);
    try {
      const r = await scoreFundingFit(company.id, true); // apply:true → persists
      if (r) { setFit({ ...r, fundability_score: r.fundability_score, scored_at: new Date().toISOString() }); flash("Funding fit scored"); }
      else flash("No score returned");
    } catch (e) { flash("Funding scoring failed: " + (e?.message || e)); }
    finally { setBusy(false); }
  }

  const card = { background: C.panel, border: `1px solid ${C.line}`, borderRadius: 2, padding: 18, marginBottom: 16 };
  const subhead = { fontSize: 10, fontWeight: 600, letterSpacing: ".15em", textTransform: "uppercase", color: C.dim2, marginBottom: 8 };
  const track = fit?.primary_track || "NONE";
  const meta = FUND_TRACK_META[track] || FUND_TRACK_META.NONE;
  const score = fit?.fundability_score ?? 0;
  const scoreColor = score >= 65 ? C.green : score >= 45 ? C.amber : C.dim2;
  const ace = fit?.ace_draft || {};
  const secondaries = fit?.secondary_tracks || ace.secondary_tracks || [];

  return (
    <div style={card}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, gap: 10, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="tag" size={16} color={C.accent} />
          <span style={{ fontWeight: 700, fontSize: 14, color: C.text, fontFamily: FONT_BODY }}>AWS funding fit</span>
          <span title="Deterministic pre-score, upstream of Partner Central. AWS's own agent makes the authoritative call post-handoff." style={{ fontSize: 10, color: C.dim2, border: `1px solid ${C.line2}`, borderRadius: 2, padding: "1px 6px" }}>pre-score</span>
        </div>
        {fit?.scored_at && <span style={{ fontSize: 11, color: C.dim2, fontFamily: FONT_MONO }}>{fmtDate(fit.scored_at)}</span>}
      </div>

      {!loaded ? (
        <div style={{ fontSize: 12.5, color: C.dim2 }}><Spinner size={12} /> Loading…</div>
      ) : !fit ? (
        <div>
          <div style={{ fontSize: 12.5, color: C.dim2, marginBottom: 12, lineHeight: 1.5 }}>No funding fit scored yet. Deterministic - reads cloud + maturity + size + sector. No AI, instant.</div>
          <Btn variant="dark" size="sm" onClick={rescore} disabled={busy}>{busy ? <Spinner /> : <Icon name="tag" size={13} color={C.cream} />} {busy ? "Scoring…" : "Score funding fit"}</Btn>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "stretch", gap: 14, flexWrap: "wrap", marginBottom: 14 }}>
            <div style={{ flex: "1 1 230px", minWidth: 0 }}>
              <div style={subhead}>Recommended track</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: C.accent, fontFamily: FONT_DISPLAY }}>{meta.label}</span>
                {secondaries.map((s) => <span key={s} style={{ fontSize: 10.5, fontWeight: 700, color: C.blue, border: `1px solid ${C.blue}55`, borderRadius: 2, padding: "2px 7px" }}>+ {s}</span>)}
              </div>
              <div style={{ fontSize: 11.5, color: C.dim2, marginTop: 4, lineHeight: 1.5 }}>{meta.blurb}</div>
            </div>
            <div style={{ flex: "0 0 130px" }}>
              <div style={subhead}>Fundability</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{ fontSize: 26, fontWeight: 400, color: scoreColor, fontFamily: FONT_DISPLAY, lineHeight: 1 }}>{score}</span>
                <span style={{ fontSize: 12, color: C.dim2 }}>/100</span>
              </div>
              <div style={{ height: 5, background: C.line2, borderRadius: 3, marginTop: 6, overflow: "hidden" }}>
                <div style={{ width: score + "%", height: "100%", background: scoreColor }} />
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            <Pill color={fit.confidence === "high" ? C.green : fit.confidence === "med" ? C.amber : C.dim2}>{fit.confidence} confidence</Pill>
            {fit.migration_source && fit.migration_source !== "unknown" && <Pill color={C.dim}>from {fit.migration_source}</Pill>}
            {fit.est_spend_band && <Pill color={C.dim}>{fit.est_spend_band} est. spend</Pill>}
            {ace.sector_label && <Pill color={C.dim}>{ace.sector_label}</Pill>}
            {fit.needs_human_review && <Pill color={C.amber}>needs review</Pill>}
          </div>

          {(fit.rationale || []).length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={subhead}>Why</div>
              <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: C.dim, lineHeight: 1.6 }}>
                {fit.rationale.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          )}

          {ace.use_case && (
            <div style={{ background: C.panel2, border: `1px solid ${C.line2}`, borderRadius: 2, padding: "10px 12px", marginBottom: 12 }}>
              <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: C.dim2, marginBottom: 4 }}>ACE opportunity draft</div>
              <div style={{ fontSize: 12.5, color: C.text, lineHeight: 1.5 }}>{ace.use_case}</div>
              <div style={{ fontSize: 11, color: C.dim2, marginTop: 6 }}>Stage: <strong>{ace.stage || "Qualified"}</strong>{ace.expected_revenue_usd ? <> · Est. revenue: <strong>${Number(ace.expected_revenue_usd).toLocaleString("en-US")}</strong></> : null}</div>
            </div>
          )}

          {["MAP", "MAP_MODERNIZE", "POC", "GREENFIELD_PGP"].includes(track) && estimateAwsCost(ace.expected_revenue_usd) && (() => {
            const est = estimateAwsCost(ace.expected_revenue_usd);
            return (
              <div style={{ background: C.panel2, border: `1px solid ${C.line2}`, borderRadius: 2, padding: "10px 12px", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                  <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: C.dim2 }}>AWS cost estimate · {CALC.regionLabel}</div>
                  <a href={CALC.calcUrl} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: C.blue, textDecoration: "none" }}>Open AWS Calculator ↗</a>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 20, fontWeight: 400, color: C.text, fontFamily: FONT_DISPLAY }}>{fmtMoney(est.yr, "USD")}<span style={{ fontSize: 12, color: C.dim2 }}>/yr</span></span>
                  <span style={{ fontSize: 13, color: C.dim }}>{fmtMoney(est.mo, "USD")}/mo est. AWS spend</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 8 }}>
                  {est.items.map((it) => (
                    <div key={it.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: C.dim }}>
                      <span>{it.label}</span><span style={{ fontFamily: FONT_MONO }}>{fmtMoney(it.mo, "USD")}/mo</span>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 11.5, color: C.text, background: C.bg, border: `1px solid ${C.line2}`, borderRadius: 2, padding: "6px 9px" }}>
                  Est. MAP funding offset (~{CALC.mapOffsetPct}%): <strong style={{ color: C.accent }}>{fmtMoney(est.mapYr, "USD")}/yr</strong>
                </div>
                <div style={{ fontSize: 10, color: C.dim2, marginTop: 6, lineHeight: 1.5 }}>Rough estimate from the spend band - refine the exact figure in the AWS Pricing Calculator. Offset is a partner heuristic; AWS sets the final amount.</div>
              </div>
            );
          })()}

          <div style={{ fontSize: 10.5, color: C.dim2, lineHeight: 1.5, marginBottom: 10 }}>{ace.partner_path_note || "Pre-score only. AWS's Partner Central agent makes the authoritative funding call after handoff."}</div>
          <button onClick={rescore} disabled={busy} style={{ background: "transparent", border: "none", color: C.dim, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: FONT_HEAD }}>{busy ? <Spinner size={12} /> : "↻"} Re-score</button>
        </>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------------------
   OUTCOME CAPTURE  -  predicted vs actual (the closed-loop moat)
   Snapshots the funding engine's PREDICTION the first time an outcome is opened,
   then lets the rep record what ACTUALLY happened. This delta is the only data a
   competitor can't buy or backfill, and it's what later turns the deterministic
   scorer into a learning one. $0, no AI.
   ---------------------------------------------------------------------------- */
const OUTCOME_META = {
  pending:      { label: "In progress",  color: "#6E6962" },
  won:          { label: "Won",          color: "#3F8A2E" },
  lost:         { label: "Lost",         color: "#C13715" },
  stalled:      { label: "Stalled",      color: "#C77D11" },
  disqualified: { label: "Disqualified", color: "#6E6962" },
  no_decision:  { label: "No decision",  color: "#6E6962" },
};
const OUTCOME_TRACKS = ["MAP", "MAP_MODERNIZE", "POC", "ISV_WMP", "GREENFIELD_PGP", "NONE"];

function OutcomePanel({ company, flash }) {
  const [outcome, setOutcome] = useState(null);
  const [predicted, setPredicted] = useState(null); // snapshot from funding_eligibility
  const [loaded, setLoaded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  // editable fields
  const [actualOutcome, setActualOutcome] = useState("pending");
  const [actualTrack, setActualTrack] = useState("");
  const [actualValue, setActualValue] = useState("");
  const [fundingSubmitted, setFundingSubmitted] = useState(false);
  const [fundingApproved, setFundingApproved] = useState("");
  const [lostReason, setLostReason] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const o = await db.getOutcome(company.id);
        if (!live) return;
        if (o) {
          setOutcome(o);
          setActualOutcome(o.actual_outcome || "pending");
          setActualTrack(o.actual_track || "");
          setActualValue(o.actual_value_sek != null ? String(o.actual_value_sek) : "");
          setFundingSubmitted(!!o.funding_submitted);
          setFundingApproved(o.funding_approved_usd != null ? String(o.funding_approved_usd) : "");
          setLostReason(o.lost_reason || "");
          setNotes(o.notes || "");
          setPredicted({ track: o.predicted_track, score: o.predicted_score, confidence: o.predicted_confidence, at: o.predicted_at });
        }
        // Always read the current funding prediction so we can snapshot it on first save.
        try {
          const rows = await sb("funding_eligibility", { query: `?company_id=eq.${company.id}&select=primary_track,fundability_score,confidence,scored_at` });
          if (live && rows && rows[0] && !o) {
            setPredicted({ track: rows[0].primary_track, score: rows[0].fundability_score, confidence: rows[0].confidence, at: rows[0].scored_at });
          }
        } catch { /* prediction stays null; outcome still capturable */ }
      } catch { /* ignore */ }
      if (live) setLoaded(true);
    })();
    return () => { live = false; };
  }, [company.id]);

  async function save() {
    setBusy(true);
    try {
      const row = {
        company_id: company.id,
        // snapshot the prediction the FIRST time only (immutable record of what the engine said)
        ...(outcome ? {} : {
          predicted_track: predicted?.track || null,
          predicted_score: predicted?.score ?? null,
          predicted_confidence: predicted?.confidence || null,
          predicted_at: predicted?.at || null,
        }),
        actual_outcome: actualOutcome,
        actual_track: actualTrack || null,
        actual_value_sek: actualValue ? Number(actualValue) : null,
        funding_submitted: fundingSubmitted,
        funding_approved_usd: fundingApproved ? Number(fundingApproved) : null,
        lost_reason: actualOutcome === "lost" ? (lostReason || null) : null,
        notes: notes || null,
      };
      const saved = await db.upsertOutcome(row);
      setOutcome(saved || row);
      if (saved?.predicted_track || row.predicted_track) {
        setPredicted({ track: (saved || row).predicted_track, score: (saved || row).predicted_score, confidence: (saved || row).predicted_confidence, at: (saved || row).predicted_at });
      }
      setEditing(false);
      flash("Outcome saved");
    } catch (e) { flash("Save failed: " + (e?.message || e)); }
    finally { setBusy(false); }
  }

  const card = { background: C.panel, border: `1px solid ${C.line}`, borderRadius: 2, padding: 18, marginBottom: 16 };
  const subhead = { fontSize: 10, fontWeight: 600, letterSpacing: ".15em", textTransform: "uppercase", color: C.dim2, marginBottom: 8 };
  const field = { background: C.cream, border: `1px solid ${C.line2}`, borderRadius: 2, padding: "8px 10px", color: C.text, fontSize: 12.5, fontFamily: FONT_BODY, outline: "none", width: "100%", boxSizing: "border-box" };
  const lbl = { fontSize: 10, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: C.dim2, marginBottom: 4, display: "block" };

  const om = OUTCOME_META[outcome?.actual_outcome || "pending"];
  const predTrack = predicted?.track ? (FUND_TRACK_META[predicted.track]?.label || predicted.track) : "-";
  const matchKnown = outcome && outcome.actual_track && outcome.predicted_track;
  const trackMatched = matchKnown && outcome.actual_track === outcome.predicted_track;

  return (
    <Collapsible title="Outcome" sectionKey="outcome"
      right={outcome ? <span style={{ fontSize: 11, fontWeight: 700, color: om.color }}>{om.label}</span> : <span title="Predicted vs actual. Feeds the closed-loop learning." style={{ fontSize: 10, color: C.dim2, border: `1px solid ${C.line2}`, borderRadius: 2, padding: "1px 6px" }}>closed loop</span>}>

      {!loaded ? (
        <div style={{ fontSize: 12.5, color: C.dim2 }}><Spinner size={12} /> Loading…</div>
      ) : (!outcome && !editing) ? (
        <div>
          <div style={{ fontSize: 12.5, color: C.dim2, marginBottom: 12, lineHeight: 1.5 }}>
            No outcome recorded. Capturing what actually happened{predicted?.track ? <> (engine predicted <strong style={{ color: C.dim }}>{predTrack}</strong>)</> : null} is what makes the funding score smarter over time.
          </div>
          <Btn variant="dark" size="sm" onClick={() => setEditing(true)}><Icon name="target" size={13} color={C.cream} /> Record outcome</Btn>
        </div>
      ) : editing ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {predicted?.track && (
            <div style={{ fontSize: 11.5, color: C.dim2, background: C.panel2, border: `1px solid ${C.line2}`, borderRadius: 2, padding: "7px 10px" }}>
              Engine predicted <strong style={{ color: C.dim }}>{predTrack}</strong>{predicted.score != null ? <> · score {predicted.score}</> : null}{predicted.confidence ? <> · {predicted.confidence} confidence</> : null}. Snapshotted on first save.
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div><label style={lbl}>Outcome</label>
              <select style={field} value={actualOutcome} onChange={(e) => setActualOutcome(e.target.value)}>
                {Object.entries(OUTCOME_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div><label style={lbl}>Actual funding track</label>
              <select style={field} value={actualTrack} onChange={(e) => setActualTrack(e.target.value)}>
                <option value="">- not known -</option>
                {OUTCOME_TRACKS.map((t) => <option key={t} value={t}>{FUND_TRACK_META[t]?.label || t}</option>)}
              </select>
            </div>
            <div><label style={lbl}>Deal value (SEK)</label><input style={field} inputMode="numeric" value={actualValue} onChange={(e) => setActualValue(e.target.value.replace(/[^\d]/g, ""))} placeholder="e.g. 250000" /></div>
            <div><label style={lbl}>AWS funding approved (USD)</label><input style={field} inputMode="numeric" value={fundingApproved} onChange={(e) => setFundingApproved(e.target.value.replace(/[^\d]/g, ""))} placeholder="e.g. 20000" /></div>
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: C.dim, cursor: "pointer" }}>
            <input type="checkbox" checked={fundingSubmitted} onChange={(e) => setFundingSubmitted(e.target.checked)} /> Funding request submitted to AWS
          </label>
          {actualOutcome === "lost" && (
            <div><label style={lbl}>Lost reason</label><input style={field} value={lostReason} onChange={(e) => setLostReason(e.target.value)} placeholder="Why did it not close?" /></div>
          )}
          <div><label style={lbl}>Notes</label><textarea style={{ ...field, minHeight: 56, resize: "vertical" }} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything worth remembering for the learning loop." /></div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn variant="primary" size="sm" onClick={save} disabled={busy}>{busy ? <Spinner /> : null} Save outcome</Btn>
            <Btn variant="ghost" size="sm" onClick={() => { setEditing(false); }}>Cancel</Btn>
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 12 }}>
            <div style={{ flex: "1 1 150px" }}>
              <div style={subhead}>Predicted</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.dim, fontFamily: FONT_DISPLAY }}>{predTrack}</div>
              {predicted?.score != null && <div style={{ fontSize: 11, color: C.dim2, marginTop: 2 }}>score {predicted.score} · {predicted.confidence || "-"}</div>}
            </div>
            <div style={{ flex: "1 1 150px" }}>
              <div style={subhead}>Actual</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: om.color, fontFamily: FONT_DISPLAY }}>
                {outcome.actual_track ? (FUND_TRACK_META[outcome.actual_track]?.label || outcome.actual_track) : om.label}
              </div>
              {matchKnown && (
                <div style={{ fontSize: 11, marginTop: 2, color: trackMatched ? C.green : C.amber }}>
                  {trackMatched ? "✓ matched prediction" : "✗ differed from prediction"}
                </div>
              )}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            {outcome.actual_value_sek != null && <Pill color={C.dim}>{fmtMoney(outcome.actual_value_sek, "SEK")}</Pill>}
            {outcome.funding_submitted && <Pill color={C.blue}>funding submitted</Pill>}
            {outcome.funding_approved_usd != null && <Pill color={C.green}>{fmtMoney(outcome.funding_approved_usd, "USD")} approved</Pill>}
            {outcome.lost_reason && <Pill color={C.red}>{outcome.lost_reason}</Pill>}
          </div>
          {outcome.notes && <div style={{ fontSize: 12, color: C.dim, lineHeight: 1.5, marginBottom: 10 }}>{outcome.notes}</div>}
          <button onClick={() => setEditing(true)} style={{ background: "transparent", border: "none", color: C.dim, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: FONT_HEAD }}>✎ Update outcome</button>
        </>
      )}
    </Collapsible>
  );
}

/* ============================================================================
   FÖRETAGSKORT  (detaljvy)
   ============================================================================ */
/* ----------------------------------------------------------------------------
   SMITH  —  Alloy's AWS sales co-worker. Arms the rep for the funding conversation.
   (Brand: Forj forges the Alloy; Smith works the forge.) Deterministic ($0), reads
   the persisted funding_eligibility row + the playbook brain. Four sections: Funding
   Brief (meeting prep), Next best action (per-play, per-stage), Qualification
   (AWS-MEDDIC anchored to the track), Co-sell / ACE prep. Human drives; Smith
   suggests. Filing to Partner Central stays out (gated on IAM).
   (Component kept as CoPilotPanel / enrichment key copilot_qual to avoid orphaning
   saved data; only the user-facing name is "Smith".)
   ---------------------------------------------------------------------------- */
function CoPilotPanel({ company, contacts, onAddContact, onUpdate, flash }) {
  const [fit, setFit] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState({ brief: true, nba: true, qual: false, cosell: false });
  const [qual, setQual] = useState(() => (company.enrichment && company.enrichment.copilot_qual) || {});
  const [finding, setFinding] = useState(false);
  const [findNote, setFindNote] = useState("");

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        if (typeof sb === "function") {
          const rows = await sb("funding_eligibility", { query: `?company_id=eq.${company.id}&select=*` });
          if (live && rows && rows[0]) setFit(rows[0]);
        }
      } catch { /* fall through; brief still works off cloud guess */ }
      if (live) setLoaded(true);
    })();
    return () => { live = false; };
  }, [company.id]);

  // Track from the funding engine; if unscored, fall back to a cloud-derived guess so the brief still arms the rep.
  const cloud = String(company.cloud_provider || (company.enrichment && company.enrichment.aws_verdict) || "").toLowerCase();
  const guess = cloud === "aws" ? "MAP_MODERNIZE" : (cloud === "azure" || cloud === "gcp") ? "MAP" : (!cloud || cloud === "none") ? "GREENFIELD_PGP" : "NONE";
  const track = (fit && fit.primary_track) || guess;
  const pb = playbookFor(track);
  const meta = FUND_TRACK_META[track] || FUND_TRACK_META.NONE;
  const ace = (fit && fit.ace_draft) || {};
  const champRole = pb.meddic && pb.meddic.Champion;
  const topContact = (contacts || [])[0];
  const stageKey = company.stage || "lead";
  const nextMove = pb.nextByStage[stageKey] || pb.nextByStage.lead || "Confirm the play and book a discovery call.";
  const score = fit ? (fit.fundability_score ?? 0) : null;
  const scoreColor = score == null ? C.dim2 : score >= 65 ? C.green : score >= 45 ? C.amber : C.dim2;

  async function rescore() {
    setBusy(true);
    try {
      const r = await scoreFundingFit(company.id, true); // apply:true → persists
      if (r) { setFit({ ...r, scored_at: new Date().toISOString() }); flash("Funding fit scored"); }
      else flash("No score returned");
    } catch (e) { flash("Funding scoring failed: " + (e?.message || e)); }
    finally { setBusy(false); }
  }

  const card = { background: C.panel, border: `1px solid ${C.line}`, borderRadius: 2, padding: 18, marginBottom: 16 };
  // Smith finds the decision-makers (web search) and populates the card automatically.
  // Auto-adds everyone new; guessed emails are marked so a rep verifies before sending.
  async function findPeople() {
    setFinding(true); setFindNote("");
    try {
      const ppl = await findDecisionMakers(company);
      const have = new Set((contacts || []).map((c) => norm([c.first_name, c.last_name].filter(Boolean).join(" ")).toLowerCase()));
      const fresh = ppl.filter((p) => p.name && !have.has(norm(p.name).toLowerCase()));
      if (!fresh.length) {
        setFindNote(ppl.length ? "Everyone Smith found is already on the card." : "No decision-makers found" + (company.domain ? "." : ". Find the website first."));
      } else {
        const cleanLi = (li) => {
          li = (li || "").trim();
          if (!/^https?:\/\/([a-z]{2,3}\.)?linkedin\.com\/in\/[^/\s]/i.test(li)) return "";
          if (/1a2b3c|123456|abcdef|xxxx|example|placeholder|firstname|lastname/i.test(li)) return "";
          return li;
        };
        for (const p of fresh) {
          await onAddContact(company.id, {
            name: p.name,
            title: (p.title || "") + (p.email && p.email_is_guess ? " · email guessed" : ""),
            email: p.email || "",
            linkedin: cleanLi(p.linkedin),
            source: "smith_find",
          });
        }
        setFindNote("Smith added " + fresh.length + " decision-maker" + (fresh.length > 1 ? "s" : "") + " to the card.");
        flash("Smith added " + fresh.length + " contact" + (fresh.length > 1 ? "s" : ""));
      }
    } catch (e) {
      setFindNote("Find failed: " + (e?.message || e));
      flash("Find decision-makers failed: " + (e?.message || e));
    } finally { setFinding(false); }
  }

  const secHead = (key, label, hint) => (
    <button onClick={() => setOpen((o) => ({ ...o, [key]: !o[key] }))}
      style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, background: "transparent", border: "none", cursor: "pointer", padding: "8px 0", fontFamily: FONT_BODY, textAlign: "left" }}>
      <span style={{ fontSize: 11, color: C.dim2, width: 12 }}>{open[key] ? "−" : "+"}</span>
      <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: C.text }}>{label}</span>
      {hint && <span style={{ fontSize: 11, color: C.dim2, fontWeight: 400, letterSpacing: 0, textTransform: "none" }}>{hint}</span>}
    </button>
  );
  const sub = { fontSize: 10, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", color: C.dim2, marginBottom: 6 };

  function copyBrief() {
    const lines = [
      `AWS FUNDING BRIEF — ${company.name}`,
      `Play: ${meta.label}${fit && fit.confidence ? ` (${fit.confidence} confidence)` : " (estimated from cloud)"}`,
      cloud ? `Cloud: ${cloud.toUpperCase()}${fit && fit.est_spend_band ? ` · est. spend ${fit.est_spend_band}` : ""}` : "",
      ``,
      `Motion: ${pb.motion}`,
      `AWS path: ${pb.programSeq}`,
      `The money: ${pb.moneyLine}`,
      `Lead with: ${pb.leadWith}`,
      ace.use_case ? `\nACE use case: ${ace.use_case}` : "",
      `\nLikely objections:`,
      ...pb.objections.map(([o, a]) => `  • ${o}\n    → ${a}`),
      `\nAsk for: ${topContact ? `${topContact.name}${topContact.title ? " (" + topContact.title + ")" : ""}` : (champRole || "the budget owner for this play")}`,
      `\nNext move (${STATUS_COLOR[stageKey] ? stageKey : "stage"}): ${nextMove}`,
    ].filter((x) => x !== "");
    const text = lines.join("\n");
    try { navigator.clipboard.writeText(text); flash("Funding brief copied"); }
    catch { flash("Copy failed - select & copy manually"); }
  }

  function setQualField(k, patch) {
    const next = { ...qual, [k]: { ...(qual[k] || {}), ...patch } };
    setQual(next);
    onUpdate(company.id, { enrichment: { ...(company.enrichment || {}), copilot_qual: next } });
  }
  const qualKeys = Object.keys(pb.meddic || {});
  const qualDone = qualKeys.filter((k) => qual[k] && qual[k].ok).length;

  return (
    <Collapsible title="Smith" sectionKey="smith" accent={C.accent}
      right={<><span title="Smith — your AWS sales co-worker. Forj forges the Alloy; Smith works the forge." style={{ fontSize: 10, color: C.dim2, border: `1px solid ${C.line2}`, borderRadius: 2, padding: "1px 6px" }}>AWS co-worker</span><Pill color={C.accent}>{meta.label}</Pill>{!loaded ? <Spinner size={12} /> : !fit && <span style={{ fontSize: 10.5, color: C.dim2 }}>est. from cloud</span>}</>}>

      {/* fundability score (folded in from the old Funding-fit box) */}
      {loaded && (fit ? (
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
          <div style={{ flex: "0 0 120px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
              <span style={{ fontSize: 24, fontWeight: 400, color: scoreColor, fontFamily: FONT_DISPLAY, lineHeight: 1 }}>{score}</span>
              <span style={{ fontSize: 11, color: C.dim2 }}>/100 fundability</span>
            </div>
            <div style={{ height: 5, background: C.line2, borderRadius: 3, marginTop: 5, overflow: "hidden" }}>
              <div style={{ width: score + "%", height: "100%", background: scoreColor }} />
            </div>
          </div>
          {fit.confidence && <Pill color={fit.confidence === "high" ? C.green : fit.confidence === "med" ? C.amber : C.dim2}>{fit.confidence} confidence</Pill>}
          {fit.est_spend_band && <Pill color={C.dim}>{fit.est_spend_band} est. spend</Pill>}
          <span style={{ flex: 1 }} />
          <button onClick={rescore} disabled={busy} style={{ background: "transparent", border: "none", color: C.dim, fontSize: 11.5, cursor: busy ? "default" : "pointer", fontFamily: FONT_HEAD }}>{busy ? <Spinner size={11} /> : "↻"} Re-score</button>
        </div>
      ) : (
        <div style={{ marginBottom: 12 }}>
          <Btn variant="dark" size="sm" onClick={rescore} disabled={busy}>{busy ? <Spinner /> : <Icon name="tag" size={13} color={C.cream} />} {busy ? "Scoring…" : "Score funding fit"}</Btn>
        </div>
      ))}

      {/* 1 — FUNDING BRIEF (meeting prep) */}
      {secHead("brief", "Funding brief", "what to say in the room")}
      {open.brief && (
        <div style={{ paddingLeft: 20, marginBottom: 8 }}>
          <div style={{ marginBottom: 10 }}>
            <div style={sub}>The motion</div>
            <div style={{ fontSize: 12.5, color: C.text, lineHeight: 1.5 }}>{pb.motion}</div>
          </div>
          <div style={{ background: C.panel2, border: `1px solid ${C.line2}`, borderRadius: 2, padding: "10px 12px", marginBottom: 10 }}>
            <div style={sub}>AWS path → the money</div>
            <div style={{ fontSize: 12.5, color: C.accent, fontWeight: 600, marginBottom: 3 }}>{pb.programSeq}</div>
            <div style={{ fontSize: 12, color: C.dim, lineHeight: 1.5 }}>{pb.moneyLine}</div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <div style={sub}>Lead with</div>
            <div style={{ fontSize: 12.5, color: C.text, lineHeight: 1.5 }}>{pb.leadWith}</div>
          </div>
          {pb.objections.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <div style={sub}>Likely objections → response</div>
              {pb.objections.map(([o, a], i) => (
                <div key={i} style={{ marginBottom: 6 }}>
                  <div style={{ fontSize: 12, color: C.text, fontWeight: 600 }}>{o}</div>
                  <div style={{ fontSize: 11.5, color: C.dim, lineHeight: 1.45, paddingLeft: 10 }}>→ {a}</div>
                </div>
              ))}
            </div>
          )}
          <div style={{ marginBottom: 10 }}>
            <div style={sub}>Ask for</div>
            <div style={{ fontSize: 12.5, color: C.text }}>
              {topContact ? <>{topContact.name}{topContact.title ? <span style={{ color: C.dim2 }}> · {topContact.title}</span> : null}</> : (champRole || "the budget owner for this play")}
            </div>
          </div>
          <Btn variant="dark" size="sm" onClick={copyBrief}><Icon name="copy" size={13} color={C.cream} /> Copy brief</Btn>
        </div>
      )}

      {/* 2 — NEXT BEST ACTION */}
      <div style={{ borderTop: `1px solid ${C.line}`, marginTop: 8 }} />
      {secHead("nba", "Next best action", "for this play, this stage")}
      {open.nba && (
        <div style={{ paddingLeft: 20, marginBottom: 8 }}>
          <div style={{ fontSize: 12.5, color: C.text, lineHeight: 1.5, marginBottom: 8 }}>{nextMove}</div>
          <Btn variant="ghost" size="sm" onClick={() => { onUpdate(company.id, { next_action: nextMove }); flash("Set as next step"); }}>Set as next step</Btn>
        </div>
      )}

      {/* WHO TO TALK TO: Smith finds the decision-makers and populates the card */}
      <div style={{ borderTop: `1px solid ${C.line}`, marginTop: 8 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", padding: "12px 0 2px" }}>
        <Btn variant="dark" size="sm" onClick={findPeople} disabled={finding}>
          {finding ? <Spinner /> : <Icon name="search" size={13} color={C.cream} />} {finding ? "Searching the web…" : "Find decision-makers"}
        </Btn>
        <span style={{ fontSize: 11.5, color: C.dim2, flex: 1, minWidth: 180 }}>
          {findNote || ((contacts && contacts.length) ? contacts.length + " on the card · Smith adds anyone missing to Decision-makers above" : "Smith finds who owns the cloud decision and adds them to Decision-makers above")}
        </span>
      </div>

      {/* 3 — QUALIFICATION (AWS-MEDDIC) */}
      {qualKeys.length > 0 && <>
        <div style={{ borderTop: `1px solid ${C.line}`, marginTop: 8 }} />
        {secHead("qual", "Qualification", `AWS-MEDDIC · ${qualDone}/${qualKeys.length}`)}
        {open.qual && (
          <div style={{ paddingLeft: 20, marginBottom: 8 }}>
            {qualKeys.map((k) => {
              const v = qual[k] || {};
              return (
                <div key={k} style={{ marginBottom: 10 }}>
                  <label style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer" }}>
                    <input type="checkbox" checked={!!v.ok} onChange={(e) => setQualField(k, { ok: e.target.checked })} style={{ marginTop: 3 }} />
                    <span>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: v.ok ? C.green : C.text }}>{k}</span>
                      <span style={{ fontSize: 11.5, color: C.dim, lineHeight: 1.45, display: "block" }}>{pb.meddic[k]}</span>
                    </span>
                  </label>
                  <input value={v.note || ""} onChange={(e) => setQualField(k, { note: e.target.value })} placeholder="who / what you learned"
                    style={{ width: "100%", background: C.bg, border: `1px solid ${C.line2}`, borderRadius: 2, padding: "6px 9px", color: C.text, fontSize: 12, fontFamily: FONT_BODY, outline: "none", boxSizing: "border-box", marginTop: 4 }} />
                </div>
              );
            })}
          </div>
        )}
      </>}

      {/* 4 — CO-SELL / ACE PREP */}
      <div style={{ borderTop: `1px solid ${C.line}`, marginTop: 8 }} />
      {secHead("cosell", "Co-sell / ACE", "prepare the opportunity")}
      {open.cosell && (
        <div style={{ paddingLeft: 20 }}>
          {ace.use_case ? (
            <div style={{ background: C.panel2, border: `1px solid ${C.line2}`, borderRadius: 2, padding: "10px 12px", marginBottom: 10 }}>
              <div style={sub}>ACE opportunity draft</div>
              <div style={{ fontSize: 12.5, color: C.text, lineHeight: 1.5 }}>{ace.use_case}</div>
              <div style={{ fontSize: 11, color: C.dim2, marginTop: 6 }}>Stage: <strong>{ace.stage || "Qualified"}</strong>{ace.expected_revenue_usd ? <> · Est. revenue: <strong>${Number(ace.expected_revenue_usd).toLocaleString("en-US")}</strong></> : null}</div>
            </div>
          ) : (
            <div style={{ fontSize: 12, color: C.dim2, marginBottom: 10, lineHeight: 1.5 }}>No ACE draft yet — score funding fit to generate the opportunity draft.</div>
          )}
          <div style={sub}>Before you register</div>
          <ul style={{ margin: "0 0 10px", paddingLeft: 16, fontSize: 12, color: C.dim, lineHeight: 1.7 }}>
            <li>Confirm the play + funding program ({meta.label})</li>
            <li>Named champion + economic buyer (see Qualification)</li>
            <li>Estimated AWS spend / project value</li>
            <li>Partner-originated vs AWS-originated decided</li>
          </ul>
          <div style={{ fontSize: 10.5, color: C.dim2, lineHeight: 1.5 }}>Filing to Partner Central is done by a human in ACE (Alloy assembles the inputs; automated write-back is gated on the AWS IAM identity).</div>
        </div>
      )}
    </Collapsible>
  );
}

function StageSelect({ stage, onChange }) {
  return (
    <select
      value={stage}
      onChange={(e) => onChange(e.target.value)}
      style={{
        background: C.panel2, color: STATUS_COLOR[stage] || C.text,
        border: `1px solid ${C.line2}`, borderRadius: 2, padding: "7px 14px",
        fontSize: 12.5, fontWeight: 600, fontFamily: FONT_BODY, cursor: "pointer", outline: "none",
      }}
    >
      <optgroup label="- Commercial Readiness -">
        {PHASES.readiness.stages.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
      </optgroup>
      <optgroup label="- Pipeline -">
        {PHASES.pipeline.stages.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
      </optgroup>
    </select>
  );
}

function InfoRow({ icon, label, value, mono }) {
  if (!value && value !== 0) return null;
  return (
    <div style={{ display: "flex", gap: 12, padding: "6px 0", fontSize: 13 }}>
      <span style={{ width: 110, color: C.dim, display: "flex", alignItems: "center", gap: 7, flexShrink: 0 }}>
        {ICON_PATHS[icon] ? <Icon name={icon} size={13} color={C.accent} /> : <span style={{ fontSize: 12 }}>{icon}</span>}{label}
      </span>
      <span style={{ color: C.text, fontFamily: mono ? FONT_MONO : FONT_BODY, wordBreak: "break-word" }}>{value}</span>
    </div>
  );
}


function CompanyCard({ project, company, contacts, activities, onBack, onUpdate, onStage, onAddActivity, onAddContact, onUpdateContact, flash, me, fundings, onAddFunding, onUpdateFunding }) {
  const [actType, setActType] = useState("Note");
  const [actBody, setActBody] = useState("");
  const [naText, setNaText] = useState(company.next_action || "");
  const [naDate, setNaDate] = useState(company.next_action_at || "");
  const [oppVal, setOppVal] = useState(company.opp_value != null ? String(company.opp_value) : "");
  const [oppNote, setOppNote] = useState(company.enrichment?.opportunity || "");
  useEffect(() => {
    setNaText(company.next_action || "");
    setNaDate(company.next_action_at || "");
    setOppVal(company.opp_value != null ? String(company.opp_value) : "");
    setOppNote(company.enrichment?.opportunity || "");
  }, [company.id]);
  const myContacts = contacts.filter((c) => c.company_id === company.id);
  const myActs = activities.filter((a) => a.company_id === company.id);

  const fin = [
    company.revenue_ksek != null && { label: "Net revenue", value: company.revenue_ksek.toLocaleString("sv-SE") + " kSEK" },
    company.employees != null && { label: "Employees", value: company.employees },
  ].filter(Boolean);

  async function saveActivity() {
    if (!actBody.trim()) return;
    await onAddActivity(company.id, actType, actBody.trim());
    setActBody("");
    flash("Activity logged");
  }

  // CONTACT_STATUSES is the canonical set defined at module scope.
  const qbtn = { background: "transparent", border: `1px solid ${C.line2}`, color: C.dim, borderRadius: 2, padding: "7px 11px", fontSize: 12, cursor: "pointer", fontFamily: FONT_BODY };

  // Remove a lead/company card: soft-archive (list_tag = "archived_shell"), which hides
  // it from every list, dashboard and count in the app. Reversible - the row is kept and
  // an admin can restore it. This is the only in-app way to "erase" a card.
  async function removeLead() {
    if (!confirm(`Remove "${company.name}" from the list?\n\nThis hides the card from every view in ${BRAND}. Nothing is permanently deleted - an admin can restore it later.`)) return;
    try {
      await onUpdate(company.id, { list_tag: "archived_shell" });
      flash("Lead removed");
      onBack();
    } catch (e) { flash("Couldn't remove: " + (e?.message || e)); }
  }

  return (
    <div>
      {/* header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, minWidth: 0 }}>
          <button onClick={onBack} style={{ background: C.panel2, border: `1px solid ${C.line2}`, color: C.dim, borderRadius: 2, padding: "8px 12px", cursor: "pointer", fontSize: 13, fontFamily: FONT_BODY, flexShrink: 0 }}>← Back</button>
          <div style={{ minWidth: 0 }}>
            <h2 style={{ margin: 0, fontSize: 21, fontWeight: 400, color: C.text, fontFamily: FONT_DISPLAY }}>{company.name}</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
              {company.domain && <a href={company.domain.startsWith("http") ? company.domain : "https://" + company.domain} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, color: C.blue, textDecoration: "none", fontFamily: FONT_MONO }}><Icon name="globe" size={13} color={C.blue} />{company.domain}</a>}
              {(company.city || company.county) && <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, color: C.dim }}><Icon name="pin" size={13} color={C.dim2} />{[company.city, company.county].filter(Boolean).join(", ")}</span>}
              {company.employees != null && <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, color: C.dim }}><Icon name="users" size={13} color={C.dim2} />{company.employees} empl.</span>}
              {company.tier && <Pill color={C.dim}>{company.tier}</Pill>}
              {company.leadanalysis?.score != null && <Pill color={company.leadanalysis.score >= 70 ? C.green : company.leadanalysis.score >= 45 ? C.amber : C.dim2}>{company.leadanalysis.score}% fit</Pill>}
              {cloudMeta(company) && <CloudChip company={company} />}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <StageSelect stage={company.stage} onChange={(s) => onStage(company.id, s)} />
          <button onClick={removeLead} title="Archive this lead - hides the card from every list (recoverable by an admin)"
            style={{ background: "transparent", border: `1px solid ${C.line2}`, color: C.dim2, borderRadius: 2, padding: "8px 11px", fontSize: 12, cursor: "pointer", fontFamily: FONT_BODY }}>Remove</button>
        </div>
      </div>

      {/* Company information - slimmed: header already shows domain/location/employees/tier/cloud,
          so this box keeps only what the header doesn't (orgnr, industry, CEO, source, financials, description). */}
      <Collapsible title="Company information" sectionKey="info">
        <InfoRow icon="#" label="Org. no." value={company.orgnr} mono />
        <InfoRow icon="tag" label="Industry" value={company.industry} />
        <InfoRow icon="user" label="CEO" value={company.ceo} />
        <InfoRow icon="target" label="Source" value={company.source} />
        {fin.length > 0 && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.line}`, display: "flex", gap: 28, flexWrap: "wrap" }}>
            {fin.map((f, i) => (
              <div key={i}>
                <div style={{ fontSize: 11, color: C.dim, marginBottom: 3 }}>{f.label}</div>
                <div style={{ fontSize: 17, fontWeight: 400, color: C.text, fontFamily: FONT_DISPLAY }}>{f.value}</div>
              </div>
            ))}
          </div>
        )}
        {company.enrichment?.description && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.line}`, fontSize: 12.5, color: C.dim, lineHeight: 1.6 }}>
            {company.enrichment.description}
          </div>
        )}
      </Collapsible>

      {/* Decision-makers & contacts - who to call */}
      <Collapsible sectionKey="contacts"
        title={"Decision-makers & contacts" + (myContacts.length ? " · " + myContacts.length : "")}
        right={<button onClick={(e) => { e.stopPropagation(); onAddContact(company.id, { name: "", role: "" }); }} style={{ background: "transparent", border: `1px solid ${C.line2}`, color: C.dim, borderRadius: 2, padding: "5px 10px", fontSize: 11.5, cursor: "pointer", fontFamily: FONT_BODY }}>+ Contact</button>}>
        {myContacts.length === 0 && <div style={{ fontSize: 12.5, color: C.dim2 }}>No contacts registered.</div>}
        {myContacts.map((c) => (
          <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 11, padding: "9px 0", borderBottom: `1px solid ${C.line}` }}>
            <div style={{ width: 32, height: 32, borderRadius: 2, background: C.panel2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, color: C.dim, flexShrink: 0, fontFamily: FONT_BODY }}>
              {initials([c.first_name, c.last_name].join(" ")) || "?"}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{[c.first_name, c.last_name].filter(Boolean).join(" ") || "Unnamed"}</div>
              <div style={{ fontSize: 12, color: C.dim }}>{[c.title, c.phone, c.email].filter(Boolean).join(" · ")}{c.linkedin ? <> · <a href={c.linkedin} target="_blank" rel="noreferrer" style={{ color: C.blue, textDecoration: "none" }}>LinkedIn</a></> : null}</div>
            </div>
            <select
              value={normalizeStatus(c.status)}
              onChange={(e) => onUpdateContact(c.id, { status: e.target.value })}
              style={{ background: C.panel2, border: `1px solid ${C.line2}`, color: C.dim, borderRadius: 2, padding: "5px 10px", fontSize: 11, cursor: "pointer", fontFamily: FONT_BODY, outline: "none" }}
            >
              {[...new Set([...CONTACT_STATUSES, normalizeStatus(c.status)].filter(Boolean))].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        ))}
        {/* Smith (below) finds decision-makers and populates this list. One finder, in the co-worker. */}
      </Collapsible>

      {/* company intelligence (merged cloud + web tech + data/AI) */}
      <CompanyIntelPanel company={company} onSave={onUpdate} flash={flash} />

      {/* Smith (Alloy's AWS sales co-worker) - the single AWS box: fundability score + funding brief,
          next-best-action, qualification, co-sell. (Funding-fit folded in here 2026-05-31.) */}
      <CoPilotPanel company={company} contacts={myContacts} onAddContact={onAddContact} onUpdate={onUpdate} flash={flash} />

      {/* outcome capture - predicted vs actual (the closed-loop moat) */}
      <OutcomePanel company={company} flash={flash} />

      {/* Lead-analysis panel removed (2026-05-31): the co-pilot Funding Brief now owns
          "what to say on the call", AWS-native; the old panel duplicated it and leaked
          raw <cite> markup. researchLead/draftOutreach agents remain in code for reuse. */}

      {/* follow-up + activity - the next step lives with the call log so it's never empty dead-space */}
      <Collapsible title="Next step &amp; activity" sectionKey="activity">
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
          <input type="date" value={naDate} onChange={(e) => { setNaDate(e.target.value); onUpdate(company.id, { next_action_at: e.target.value || null }); }}
            style={{ background: C.bg, border: `1px solid ${C.line2}`, borderRadius: 2, padding: "8px 10px", color: C.text, fontSize: 13, fontFamily: FONT_BODY, outline: "none" }} />
          <button onClick={() => { const d = dayStr(0); setNaDate(d); onUpdate(company.id, { next_action_at: d }); }} style={qbtn}>Today</button>
          <button onClick={() => { const d = dayStr(1); setNaDate(d); onUpdate(company.id, { next_action_at: d }); }} style={qbtn}>+1 day</button>
          <button onClick={() => { const d = dayStr(7); setNaDate(d); onUpdate(company.id, { next_action_at: d }); }} style={qbtn}>+7 days</button>
          {naDate && <button onClick={() => { setNaDate(""); onUpdate(company.id, { next_action_at: null }); }} style={{ ...qbtn, color: C.red }}>Clear</button>}
        </div>
        <input value={naText} onChange={(e) => setNaText(e.target.value)} onBlur={() => onUpdate(company.id, { next_action: naText.trim() })} placeholder="Next step - what needs to happen?"
          style={{ width: "100%", background: C.bg, border: `1px solid ${C.line2}`, borderRadius: 2, padding: "10px 12px", color: C.text, fontSize: 13.5, fontFamily: FONT_BODY, outline: "none", boxSizing: "border-box", marginBottom: 14 }} />
        <div style={{ borderTop: `1px solid ${C.line}`, paddingTop: 14 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <select value={actType} onChange={(e) => setActType(e.target.value)} style={{ background: C.panel2, border: `1px solid ${C.line2}`, color: C.text, borderRadius: 2, padding: "9px 12px", fontSize: 13, fontFamily: FONT_BODY, outline: "none" }}>
            {["Note", "Call", "Email", "Meeting", "Reminder"].map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        {actType === "Meeting" && <div style={{ fontSize: 11, color: C.dim2, marginBottom: 8, lineHeight: 1.5 }}>After a meeting, also update <strong style={{ color: C.dim }}>Outcome</strong> above — did the predicted funding track hold? That feeds Smith's learning loop.</div>}
        <textarea
          value={actBody}
          onChange={(e) => setActBody(e.target.value)}
          placeholder={actType === "Meeting" ? "Meeting notes — who, what was discussed, next step…" : "Describe the activity…"}
          rows={3}
          style={{ width: "100%", background: C.panel2, border: `1px solid ${C.line2}`, borderRadius: 2, padding: "11px 13px", color: C.text, fontSize: 13.5, fontFamily: FONT_BODY, outline: "none", resize: "vertical", boxSizing: "border-box", marginBottom: 10 }}
        />
        <Btn variant="primary" onClick={saveActivity} disabled={!actBody.trim()}>Save</Btn>

        {myActs.length > 0 && (
          <div style={{ marginTop: 18 }}>
            <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: ".15em", textTransform: "uppercase", color: C.dim2, marginBottom: 10 }}>Activity log</div>
            {myActs.map((a) => (
              <div key={a.id} style={{ display: "flex", gap: 11, padding: "10px 0", borderBottom: `1px solid ${C.line}` }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 3 }}>
                    <Pill color={C.blue}>{a.type}</Pill>
                    <span style={{ fontSize: 11, color: C.dim2, fontFamily: FONT_MONO }}>{fmtDate(a.created_at)}</span>
                  </div>
                  <div style={{ fontSize: 13, color: C.text, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{a.body}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>{/* /activity sub-section (border-top divider) */}
      </Collapsible>

      {/* Deal & funding - opportunity value/owner + the AWS funding programs, merged */}
      <Collapsible title="Deal &amp; funding" sectionKey="deal">
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: "1 1 180px" }}>
            <label style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", color: C.dim2, marginBottom: 4, display: "block" }}>Est. value (SEK / year)</label>
            <input value={oppVal} onChange={(e) => setOppVal(e.target.value.replace(/[^\d]/g, ""))} onBlur={() => onUpdate(company.id, { opp_value: oppVal ? Number(oppVal) : null })} inputMode="numeric" placeholder="e.g. 600000"
              style={{ width: "100%", background: C.bg, border: `1px solid ${C.line2}`, borderRadius: 2, padding: "10px 12px", color: C.text, fontSize: 13.5, fontFamily: FONT_MONO, outline: "none", boxSizing: "border-box" }} />
            {oppVal ? <div style={{ fontSize: 11, color: C.dim2, marginTop: 4 }}>{fmtSEK(Number(oppVal))} · weighted {fmtSEK(Number(oppVal) * (STAGE_PROB[company.stage] || 0) / 100)} at {STAGE_PROB[company.stage] || 0}%</div> : null}
          </div>
          <div style={{ flex: "1 1 180px" }}>
            <label style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", color: C.dim2, marginBottom: 4, display: "block" }}>Owner</label>
            <div style={{ display: "flex", gap: 6 }}>
              <input value={company.owner || ""} onChange={(e) => onUpdate(company.id, { owner: e.target.value })} placeholder="unassigned"
                style={{ flex: 1, minWidth: 0, background: C.bg, border: `1px solid ${C.line2}`, borderRadius: 2, padding: "10px 12px", color: C.text, fontSize: 13, fontFamily: FONT_BODY, outline: "none", boxSizing: "border-box" }} />
              {me && company.owner !== me && <button onClick={() => onUpdate(company.id, { owner: me })} style={qbtn}>Me</button>}
            </div>
          </div>
        </div>
        <input value={oppNote} onChange={(e) => setOppNote(e.target.value)} onBlur={() => onUpdate(company.id, { enrichment: { ...(company.enrichment || {}), opportunity: oppNote.trim() } })} placeholder="What's the deal? (AWS spend, migration scope, workloads, services…)"
          style={{ width: "100%", marginTop: 12, background: C.bg, border: `1px solid ${C.line2}`, borderRadius: 2, padding: "10px 12px", color: C.text, fontSize: 13, fontFamily: FONT_BODY, outline: "none", boxSizing: "border-box" }} />
        <div style={{ borderTop: `1px solid ${C.line}`, marginTop: 16, paddingTop: 4 }} />
        <FundingPanel company={company} fundings={fundings || []} onAddFunding={onAddFunding} onUpdateFunding={onUpdateFunding} />
      </Collapsible>
    </div>
  );
}

/* ============================================================================
   DASHBOARD
   ============================================================================ */
function TodayQueue({ project, companies, contacts, activities, trackMap, onOpen, onOutcome, onSnooze, flash }) {
  const today = dayStr(0);
  const score = (c) => (c.score ?? 0) * 10 + (c.leadanalysis?.score ?? 0);
  const proj = companies.filter((c) => c.project_id === project.id && c.list_tag !== "archived_shell");
  const dated = proj.filter((c) => c.next_action_at);
  const overdue = dated.filter((c) => c.next_action_at < today).sort((a, b) => (a.next_action_at < b.next_action_at ? -1 : 1));
  const dueToday = dated.filter((c) => c.next_action_at === today).sort((a, b) => score(b) - score(a));
  const ready = proj.filter((c) => !c.next_action_at && (phaseOf(c.stage) === "readiness" || c.stage === "kontaktad")).sort((a, b) => score(b) - score(a)).slice(0, 15);
  const total = overdue.length + dueToday.length;

  // --- SMITH day-to-day nudges (deterministic, $0) ---
  const contactSet = useMemo(() => new Set((contacts || []).map((x) => x.company_id)), [contacts]);
  const tMap = trackMap || {};
  // Smith's per-play picks (top account in each fundable play that needs work now).
  const smithPicks = useMemo(
    () => smithRecommendations(proj, tMap, contactSet, activities),
    [proj, tMap, contactSet, activities],
  );
  // Stale / going-cold detection: last activity per company.
  const lastActOf = useMemo(() => {
    const m = {};
    for (const a of (activities || [])) { const d = a && a.company_id; if (!d) continue; if (m[d] === undefined || (a.created_at || "") > m[d]) m[d] = a.created_at || ""; }
    return m;
  }, [activities]);
  const stale = useMemo(() => {
    const out = [];
    for (const c of proj) {
      if (c.stage === "vunnen" || c.stage === "forlorad") continue;
      // (1) meeting booked but no outcome logged for 3d+  (2) in-motion deal cold 30d+
      const last = lastActOf[c.id];
      const days = last ? Math.floor((Date.now() - Date.parse(last)) / 86400000) : Infinity;
      if (c.stage === "mote_bokat" && days >= 3) out.push({ c, why: "Meeting booked, no outcome logged in " + (days === Infinity ? "a while" : days + "d") + " — log it or re-book.", days: days === Infinity ? 9999 : days });
      else if (phaseOf(c.stage) === "pipeline" && days >= 30) out.push({ c, why: (days === Infinity ? "No logged activity" : days + "d cold") + " — re-engage before it dies.", days: days === Infinity ? 9999 : days });
    }
    return out.sort((a, b) => b.days - a.days).slice(0, 12);
  }, [proj, lastActOf]);
  const toneColor = { dim: C.dim, blue: C.blue, green: C.green, red: C.red };
  const outcomeBtn = (tone) => ({ background: "transparent", border: `1px solid ${C.line2}`, color: toneColor[tone] || C.dim, borderRadius: 2, padding: "6px 10px", fontSize: 11.5, fontWeight: 600, cursor: "pointer", fontFamily: FONT_BODY });
  const snoozeBtn = { background: "transparent", border: `1px solid ${C.line}`, color: C.dim2, borderRadius: 2, padding: "6px 9px", fontSize: 11, cursor: "pointer", fontFamily: FONT_BODY };

  const [triage, setTriage] = useState(null);
  const [triBusy, setTriBusy] = useState(false);
  const byId = Object.fromEntries(proj.map((c) => [c.id, c]));
  async function runTriage() {
    setTriBusy(true);
    try {
      const seen = new Set();
      const cands = [...dueToday, ...ready]
        .filter((c) => !seen.has(c.id) && seen.add(c.id))
        .map((c) => ({
          id: c.id, name: c.name, score: score(c), stage: c.stage,
          industry: c.industry || "", city: c.city || "",
          aws: !!(c.aws_detected || c.cloud_provider === "aws"),
          last_touch: c.last_contacted_at || "",
        }));
      if (!cands.length) { setTriage([]); return; }
      const res = await triagePipeline(project.partner, cands, 8);
      setTriage(res.ranked || []);
    } catch (e) {
      setTriage(null); flash && flash("Triage failed: " + e.message);
    } finally { setTriBusy(false); }
  }

  function Row({ c, badge, badgeColor }) {
    const cc = contacts.filter((x) => x.company_id === c.id);
    const primary = cc[0];
    const phone = (cc.find((x) => x.phone) || {}).phone;
    return (
      <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderLeft: `3px solid ${badgeColor}`, borderRadius: 2, padding: "12px 14px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0, cursor: "pointer" }} onClick={() => onOpen(c.id)}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 15, fontWeight: 400, color: C.text, fontFamily: FONT_DISPLAY }}>{c.name}</span>
              {badge ? <Pill color={badgeColor}>{badge}</Pill> : null}
              <Pill color={STATUS_COLOR[c.stage]} bg={C.panel2}><Dot color={STATUS_COLOR[c.stage]} />{STAGE_LABEL[c.stage]}</Pill>
              {c.leadanalysis?.score != null && <Pill color={c.leadanalysis.score >= 70 ? C.green : c.leadanalysis.score >= 45 ? C.amber : C.dim2}>{c.leadanalysis.score}%</Pill>}
            </div>
            <div style={{ fontSize: 12, color: C.dim, marginTop: 4 }}>
              {primary ? [primary.first_name, primary.last_name].filter(Boolean).join(" ") + (primary.title ? " · " + primary.title : "") : "No contact yet - find decision-makers on the card"}
              {phone ? " · " + phone : ""}
            </div>
            {c.next_action ? <div style={{ fontSize: 11.5, color: C.dim2, marginTop: 3 }}>→ {c.next_action}</div> : null}
          </div>
          {phone ? <a href={"tel:" + phone.replace(/\s/g, "")} onClick={(e) => e.stopPropagation()} title="Call" style={{ flexShrink: 0, paddingTop: 2 }}><Icon name="phone" size={16} color={C.accent} /></a> : null}
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10, alignItems: "center" }}>
          {OUTCOME_ORDER.map((k) => (
            <button key={k} onClick={() => onOutcome(c.id, k)} style={outcomeBtn(OUTCOMES[k].tone)}>{OUTCOMES[k].label}</button>
          ))}
          <span style={{ flex: 1 }} />
          <button onClick={() => onSnooze(c.id, 1)} style={snoozeBtn}>+1d</button>
          <button onClick={() => onSnooze(c.id, 7)} style={snoozeBtn}>+1w</button>
        </div>
      </div>
    );
  }

  const Group = ({ title, color, items, badge }) => items.length === 0 ? null : (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 11 }}>
        <Dot color={color} />
        <h3 style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: C.dim, fontFamily: FONT_BODY }}>{title}</h3>
        <Pill color={color}>{items.length}</Pill>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((c) => <Row key={c.id} c={c} badge={badge ? badge(c) : null} badgeColor={color} />)}
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <Icon name="phone" size={20} color={C.accent} />
          <h2 style={{ margin: 0, fontSize: 23, fontWeight: 400, color: C.text, fontFamily: FONT_DISPLAY }}>Today - {project.name}</h2>
        </div>
        <div style={{ fontSize: 12.5, color: C.dim, marginTop: 5 }}>
          {total > 0 ? `${total} ${total === 1 ? "call" : "calls"} to make. Log each outcome with one tap - it sets the next action automatically.` : "No calls scheduled. Pick from the ready leads below, or schedule follow-ups from a company card."}
        </div>
        <button onClick={runTriage} disabled={triBusy} style={{ marginTop: 12, background: C.dark, color: C.cream, border: "none", borderRadius: 2, padding: "8px 14px", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: FONT_HEAD, display: "inline-flex", alignItems: "center", gap: 7 }}>
          {triBusy ? <Spinner size={13} /> : <Icon name="spark" size={13} color={C.accent} />} {triBusy ? "Prioritising…" : "Prioritise today (agent)"}
        </button>
      </div>

      {/* SMITH SAYS — deterministic per-play picks, $0, always on (above the optional LLM agent) */}
      {smithPicks.length > 0 && (
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 11 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.accent }} />
            <h3 style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: C.dim, fontFamily: FONT_BODY }}>Smith says — work these first</h3>
            <Pill color={C.accent}>{smithPicks.length}</Pill>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {smithPicks.map((r) => {
              const accent = C[r.accent] || C.accent;
              return (
                <div key={r.track} onClick={() => onOpen(r.company.id)} style={{ background: C.panel, border: `1px solid ${C.line}`, borderLeft: `3px solid ${accent}`, borderRadius: 2, padding: "12px 14px", cursor: "pointer", display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ minWidth: 74 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: accent, fontFamily: FONT_HEAD }}>{r.label}</div>
                    {r.fundability != null && <div style={{ fontSize: 11, color: C.dim2, marginTop: 2 }}>fund {r.fundability}</div>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 14.5, fontWeight: 400, color: C.text, fontFamily: FONT_DISPLAY }}>{r.company.name}</span>
                      <span style={{ background: C.panel2, border: `1px solid ${C.line2}`, borderRadius: 2, padding: "1px 6px", fontSize: 10, color: C.dim }}>{r.reasonTag}</span>
                    </div>
                    <div style={{ fontSize: 12, color: C.dim, marginTop: 3, lineHeight: 1.45 }}>{r.action}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* GOING COLD — stale-deal reminders */}
      {stale.length > 0 && (
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 11 }}>
            <Dot color={C.amber} />
            <h3 style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: C.dim, fontFamily: FONT_BODY }}>Going cold</h3>
            <Pill color={C.amber}>{stale.length}</Pill>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {stale.map(({ c, why }) => (
              <div key={c.id} onClick={() => onOpen(c.id)} style={{ background: C.panel, border: `1px solid ${C.line}`, borderLeft: `3px solid ${C.amber}`, borderRadius: 2, padding: "11px 14px", cursor: "pointer", display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 14, fontWeight: 400, color: C.text, fontFamily: FONT_DISPLAY }}>{c.name}</span>
                    <Pill color={STATUS_COLOR[c.stage]} bg={C.panel2}><Dot color={STATUS_COLOR[c.stage]} />{STAGE_LABEL[c.stage]}</Pill>
                  </div>
                  <div style={{ fontSize: 12, color: C.dim, marginTop: 3 }}>{why}</div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); onSnooze(c.id, 1); }} style={snoozeBtn}>+1d</button>
              </div>
            ))}
          </div>
        </div>
      )}
      {triage && triage.length > 0 && (
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 11 }}>
            <Dot color={C.accent} />
            <h3 style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: C.dim, fontFamily: FONT_BODY }}>Prioritised by agent</h3>
            <Pill color={C.accent}>{triage.length}</Pill>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {triage.map((r) => { const c = byId[r.id]; if (!c) return null; return (
              <div key={r.id} onClick={() => onOpen(r.id)} style={{ background: C.panel, border: `1px solid ${C.line}`, borderLeft: `3px solid ${C.accent}`, borderRadius: 2, padding: "12px 14px", cursor: "pointer", display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ fontSize: 18, fontWeight: 400, color: C.accent, fontFamily: FONT_DISPLAY, lineHeight: 1, minWidth: 22 }}>{r.priority}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 400, color: C.text, fontFamily: FONT_DISPLAY }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: C.dim, marginTop: 3, lineHeight: 1.45 }}>{r.why}</div>
                </div>
              </div>
            ); })}
          </div>
        </div>
      )}
      {triage && triage.length === 0 && !triBusy && (
        <div style={{ fontSize: 12.5, color: C.dim2, marginBottom: 18 }}>Nothing to prioritise - no due or ready leads.</div>
      )}
      <Group title="Overdue" color={C.red} items={overdue} badge={(c) => { const d = Math.round((new Date(today) - new Date(c.next_action_at)) / 864e5); return d === 1 ? "1 day late" : d + " days late"; }} />
      <Group title="Due today" color={C.accent} items={dueToday} />
      <Group title="Ready to call - no date set" color={C.dim2} items={ready} />
      {total === 0 && ready.length === 0 && (
        <div style={{ textAlign: "center", padding: 48, color: C.dim2, fontSize: 13 }}>Nothing in the queue. Schedule a next action on a company to see it here.</div>
      )}
    </div>
  );
}

function HotLeads({ projects, companies, onOpen, flash }) {
  const score = (c) => (c.score ?? 0) * 10 + (c.leadanalysis?.score ?? 0);
  const groups = projects.map((p) => ({
    project: p,
    list: companies
      .filter((c) => c.project_id === p.id && c.aws_detected && c.list_tag !== "archived_shell")
      .sort((a, b) => score(b) - score(a)),
  }));
  const totalHot = groups.reduce((n, g) => n + g.list.length, 0);

  const [triage, setTriage] = useState({});       // { [projectId]: ranked[] }
  const [triBusyId, setTriBusyId] = useState(null);
  const triBtn = { background: C.dark, color: C.cream, border: "none", borderRadius: 2, padding: "6px 12px", fontSize: 11.5, fontWeight: 600, cursor: "pointer", fontFamily: FONT_HEAD, display: "inline-flex", alignItems: "center", gap: 6 };
  async function runTriage(project, list) {
    setTriBusyId(project.id);
    try {
      const cands = list.slice(0, 25).map((c) => ({
        id: c.id, name: c.name, score: score(c), stage: c.stage,
        industry: c.industry || "", city: c.city || c.postort || "",
        aws: true, last_touch: c.last_contacted_at || "",
      }));
      const res = await triagePipeline(project.partner, cands, Math.min(8, cands.length) || 1);
      setTriage((t) => ({ ...t, [project.id]: res.ranked || [] }));
    } catch (e) {
      flash && flash("Triage failed: " + e.message);
    } finally { setTriBusyId(null); }
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <Icon name="spark" size={20} color={C.accent} />
          <h2 style={{ margin: 0, fontSize: 23, fontWeight: 400, color: C.text, fontFamily: FONT_DISPLAY }}>Hot Leads</h2>
        </div>
        <div style={{ fontSize: 12.5, color: C.dim, marginTop: 5 }}>Companies confirmed to run on AWS - warmest at the top. {totalHot} total.</div>
      </div>
      {groups.map(({ project, list }) => {
        const byId = Object.fromEntries(list.map((c) => [c.id, c]));
        const ranked = triage[project.id];
        return (
        <div key={project.id} style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
            <Dot color={project.color} />
            <h3 style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: C.dim, fontFamily: FONT_BODY }}>{project.name}</h3>
            <Pill color={project.color}>{list.length}</Pill>
            <span style={{ flex: 1 }} />
            {list.length > 0 && (
              <button onClick={() => runTriage(project, list)} disabled={triBusyId === project.id} style={triBtn}>
                {triBusyId === project.id ? <Spinner size={12} /> : <Icon name="spark" size={12} color={C.accent} />} {triBusyId === project.id ? "Prioritising…" : "Prioritise (agent)"}
              </button>
            )}
          </div>
          {ranked && ranked.length > 0 && (
            <div style={{ marginBottom: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              {ranked.map((r) => { const c = byId[r.id]; if (!c) return null; return (
                <div key={r.id} onClick={() => onOpen(r.id)} style={{ background: C.panel, border: `1px solid ${C.line}`, borderLeft: `3px solid ${C.accent}`, borderRadius: 2, padding: "12px 14px", cursor: "pointer", display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ fontSize: 18, fontWeight: 400, color: C.accent, fontFamily: FONT_DISPLAY, lineHeight: 1, minWidth: 22 }}>{r.priority}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 400, color: C.text, fontFamily: FONT_DISPLAY }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: C.dim, marginTop: 3, lineHeight: 1.45 }}>{r.why}</div>
                  </div>
                </div>
              ); })}
            </div>
          )}
          {list.length === 0 ? (
            <div style={{ fontSize: 12.5, color: C.dim2, padding: "8px 0 4px" }}>No AWS-confirmed companies yet - run the AWS check on the project from the Dashboard.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {list.map((c) => (
                <div key={c.id} onClick={() => onOpen(c.id)} style={{
                  background: C.panel, border: `1px solid ${C.line}`, borderLeft: `3px solid ${C.lime}`, borderRadius: 2,
                  padding: "12px 15px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 15, fontWeight: 400, color: C.text, fontFamily: FONT_DISPLAY }}>{c.name}</span>
                      <Pill color={C.lime}>AWS</Pill>
                      {c.tier && <Pill color={C.dim}>{c.tier}</Pill>}
                      {c.leadanalysis?.score != null && <Pill color={c.leadanalysis.score >= 70 ? C.green : c.leadanalysis.score >= 45 ? C.amber : C.dim2}>{c.leadanalysis.score}% fit</Pill>}
                    </div>
                    <div style={{ fontSize: 12, color: C.dim, marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.aws_signals || "AWS"}{c.domain ? " · " + c.domain : ""}
                    </div>
                    {c.next_action && <div style={{ fontSize: 11.5, color: C.dim2, marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>→ {c.next_action}</div>}
                  </div>
                  <Icon name="trend" size={15} color={C.dim2} />
                </div>
              ))}
            </div>
          )}
        </div>
        );
      })}
    </div>
  );
}

function FundingPanel({ company, fundings, onAddFunding, onUpdateFunding }) {
  const mine = fundings.filter((f) => f.company_id === company.id);
  const recs = recommendFunding(company);
  const have = new Set(mine.map((f) => f.program));
  const lblCss = { fontSize: 10, fontWeight: 500, letterSpacing: ".15em", textTransform: "uppercase", color: C.dim2, marginBottom: 12 };
  const sel = { background: C.panel2, border: `1px solid ${C.line2}`, color: C.dim, borderRadius: 2, padding: "4px 7px", fontSize: 11, cursor: "pointer", fontFamily: FONT_BODY, outline: "none" };
  const addFromRec = (key) => {
    const p = FUNDING_PROGRAMS[key];
    onAddFunding({ project_id: company.project_id, company_id: company.id, program: key, audience: "customer", funding_type: p.type, amount: estimateFunding(key, company.opp_value) || null, currency: "USD", stage: "Created", status: "Draft", phase: key === "MAP" ? "Assess" : null, title: company.name + " - " + key });
  };
  return (
    <div>
      <div style={{ ...lblCss, marginTop: 4 }}>AWS funding the customer can tap</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {recs.map((r) => {
          const p = FUNDING_PROGRAMS[r.key]; const est = estimateFunding(r.key, company.opp_value);
          return (
            <div key={r.key} style={{ background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 2, padding: "10px 12px", display: "flex", gap: 10, justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                  <Pill color={JOURNEY_COLOR[p.journey] || C.blue}>{r.key}</Pill>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: C.text }}>{p.name}</span>
                  <span style={{ fontSize: 10, color: C.dim2, textTransform: "uppercase", letterSpacing: ".08em" }}>{p.journey}</span>
                  <span style={{ fontSize: 11, color: C.dim2 }}>· {est ? "~" + fmtMoney(est, "USD") + " est." : "free assessment"}</span>
                </div>
                <div style={{ fontSize: 11.5, color: C.dim, marginTop: 3, lineHeight: 1.5 }}>{r.reason}</div>
              </div>
              {have.has(r.key)
                ? <span style={{ fontSize: 11, color: C.green, whiteSpace: "nowrap", paddingTop: 3 }}>tracking ✓</span>
                : <button onClick={() => addFromRec(r.key)} style={{ alignSelf: "flex-start", background: "transparent", border: `1px solid ${C.line2}`, color: C.dim, borderRadius: 2, padding: "5px 9px", fontSize: 11.5, cursor: "pointer", fontFamily: FONT_BODY, whiteSpace: "nowrap" }}>+ Track</button>}
            </div>
          );
        })}
      </div>
      {mine.length > 0 && (
        <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.line}` }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: C.dim2, marginBottom: 9 }}>Tracked fund requests</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {mine.map((f) => (
              <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <Pill color={C.accent}>{f.program}</Pill>
                <span style={{ fontSize: 12, color: C.text, fontFamily: FONT_MONO }}>{f.amount ? fmtMoney(f.amount, f.currency) : "-"}</span>
                <span style={{ fontSize: 11, color: C.dim2 }}>{f.funding_type}</span>
                {f.program === "MAP" && (
                  <select value={f.phase || "Assess"} onChange={(e) => onUpdateFunding(f.id, { phase: e.target.value })} style={{ ...sel, color: C.green }} title="MAP phase">
                    {MAP_PHASES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                )}
                <span style={{ flex: 1 }} />
                <select value={f.stage || "Created"} onChange={(e) => onUpdateFunding(f.id, { stage: e.target.value })} style={sel}>
                  {FUNDING_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={f.status || "Draft"} onChange={(e) => onUpdateFunding(f.id, { status: e.target.value })} style={sel}>
                  {FUNDING_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}
      <div style={{ fontSize: 11, color: C.dim2, marginTop: 12, lineHeight: 1.5 }}>Estimates are rough planning figures - AWS sets real eligibility &amp; amounts. These are funding options the customer can use along their AWS journey (assess → build → migrate); lead with them as value, not price.</div>
    </div>
  );
}

function FundingView({ project, companies, fundings, onAddFunding, onUpdateFunding }) {
  const rows = fundings.filter((f) => f.project_id === project.id);
  const nameById = {}; companies.forEach((c) => (nameById[c.id] = c.name));
  const sum = (type) => rows.filter((f) => (type === "credits" ? f.funding_type !== "cash" : f.funding_type !== "credits") && f.status !== "Rejected" && f.status !== "Cancelled").reduce((s, f) => s + (Number(f.amount) || 0), 0);
  const sel = { background: C.panel2, border: `1px solid ${C.line2}`, color: C.dim, borderRadius: 2, padding: "5px 8px", fontSize: 11.5, cursor: "pointer", fontFamily: FONT_BODY, outline: "none" };
  const Row = ({ f }) => {
    const jc = JOURNEY_COLOR[FUNDING_PROGRAMS[f.program]?.journey] || C.accent;
    return (
      <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderLeft: `3px solid ${jc}`, borderRadius: 2, padding: "11px 13px", display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
        <Pill color={jc}>{f.program}</Pill>
        <div style={{ flex: 1, minWidth: 120 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{nameById[f.company_id] || f.title || "-"}</div>
          <div style={{ fontSize: 11, color: C.dim2 }}>{FUNDING_PROGRAMS[f.program]?.name || f.program} · {f.funding_type}</div>
        </div>
        <span style={{ fontSize: 13, color: C.text, fontFamily: FONT_MONO, whiteSpace: "nowrap" }}>{f.amount ? fmtMoney(f.amount, f.currency) : "-"}</span>
        {f.program === "MAP" && (
          <select value={f.phase || "Assess"} onChange={(e) => onUpdateFunding(f.id, { phase: e.target.value })} style={{ ...sel, color: C.green }} title="MAP phase">
            {MAP_PHASES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        )}
        <select value={f.stage || "Created"} onChange={(e) => onUpdateFunding(f.id, { stage: e.target.value })} style={sel}>
          {FUNDING_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={f.status || "Draft"} onChange={(e) => onUpdateFunding(f.id, { status: e.target.value })} style={sel}>
          {FUNDING_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
    );
  };
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <Icon name="tag" size={20} color={C.accent} />
          <h2 style={{ margin: 0, fontSize: 23, fontWeight: 400, color: C.text, fontFamily: FONT_DISPLAY }}>Customer Funding - {project.name}</h2>
        </div>
        <div style={{ fontSize: 12.5, color: C.dim, marginTop: 5 }}>Every funding option your customers can tap, mapped to their AWS journey: assess → build &amp; prove → migrate &amp; modernize. Track on a company card, then drive each request through the AWS workflow here.</div>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 22 }}>
        {[["Cash (active)", fmtMoney(sum("cash"), "USD"), C.accent], ["Credits (active)", fmtMoney(sum("credits"), "USD"), C.blue], ["Fund requests", rows.length, C.text]].map(([label, val, color], i) => (
          <div key={i} style={{ flex: 1, minWidth: 140, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 2, padding: "16px 18px" }}>
            <div style={{ fontSize: 12, color: C.dim, marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 20, fontWeight: 400, color, fontFamily: FONT_DISPLAY }}>{val}</div>
          </div>
        ))}
      </div>

      {rows.length === 0 && (
        <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 2, padding: 24, fontSize: 12.5, color: C.dim2, marginBottom: 22 }}>
          No funding tracked yet. Open a company → <strong style={{ color: C.dim }}>“AWS funding the customer can tap”</strong> → <strong style={{ color: C.dim }}>+ Track</strong>. Tracked requests show up here, grouped by journey phase.
        </div>
      )}

      {FUNDING_JOURNEY.map((phase) => {
        const list = rows.filter((f) => FUNDING_PROGRAMS[f.program]?.journey === phase);
        if (!list.length) return null;
        return (
          <div key={phase} style={{ marginBottom: 22 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 11 }}>
              <Dot color={JOURNEY_COLOR[phase]} />
              <h3 style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: C.dim, fontFamily: FONT_BODY }}>{phase}</h3>
              <Pill color={JOURNEY_COLOR[phase]}>{list.length}</Pill>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {list.map((f) => <Row key={f.id} f={f} />)}
            </div>
          </div>
        );
      })}

      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 11 }}>
          <Dot color={C.dim2} />
          <h3 style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: C.dim, fontFamily: FONT_BODY }}>The customer funding journey</h3>
        </div>
        {FUNDING_JOURNEY.map((phase) => (
          <div key={phase} style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: JOURNEY_COLOR[phase], marginBottom: 7 }}>{phase}</div>
            <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 2 }}>
              {Object.entries(FUNDING_PROGRAMS).filter(([, p]) => p.journey === phase).map(([k, p], i, arr) => (
                <div key={k} style={{ padding: "11px 14px", borderBottom: i < arr.length - 1 ? `1px solid ${C.line}` : "none", display: "flex", gap: 10 }}>
                  <Pill color={JOURNEY_COLOR[phase]}>{k}</Pill>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: C.text }}>{p.name} <span style={{ fontWeight: 400, color: C.dim2 }}>· {p.type}</span></div>
                    <div style={{ fontSize: 11.5, color: C.dim, lineHeight: 1.5, marginTop: 2 }}>{p.blurb}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConversionInsights({ companies, trackOf }) {
  const BOOKEDPLUS = new Set(["mote_bokat", "kvalificerad", "forslag", "vunnen"]);
  const PLAY_LABEL = { MAP: "Migrate (MAP)", MAP_MODERNIZE: "Modernize", POC: "GenAI (POC)", ISV_WMP: "ISV / Marketplace", GREENFIELD_PGP: "Greenfield", NONE: "No play", "-": "Unscored" };
  // Group by AWS play (the funding track) — which sales motion actually advances to a meeting/win.
  const groupBy = () => {
    const m = {};
    companies.forEach((c) => { const k = (trackOf && trackOf(c)) || "-"; (m[k] = m[k] || []).push(c); });
    return Object.entries(m).map(([key, list]) => ({
      label: PLAY_LABEL[key] || key, n: list.length,
      booked: list.filter((c) => BOOKEDPLUS.has(c.stage)).length,
      won: list.filter((c) => c.stage === "vunnen").length,
    })).sort((a, b) => b.n - a.n);
  };
  const Table = ({ rows, head }) => (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: C.dim2, marginBottom: 9 }}>{head}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {rows.map((r) => {
          const rate = r.n ? Math.round((r.booked / r.n) * 100) : 0;
          return (
            <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12 }}>
              <span style={{ flex: "0 0 36%", color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={r.label}>{r.label}</span>
              <span style={{ flex: "0 0 auto", color: C.dim, fontFamily: FONT_MONO, fontSize: 11 }} title="targets → booked → won">{r.n}→{r.booked}→{r.won}</span>
              <div style={{ flex: 1, height: 6, background: C.panel2, borderRadius: 3, overflow: "hidden" }}>
                <div style={{ width: rate + "%", height: "100%", background: rate >= 30 ? C.green : rate >= 12 ? C.amber : C.dim2 }} />
              </div>
              <span style={{ flex: "0 0 auto", color: C.dim, fontFamily: FONT_MONO, fontSize: 11, width: 54, textAlign: "right" }}>{rate}% bkd</span>
            </div>
          );
        })}
        {rows.length === 0 && <div style={{ fontSize: 12, color: C.dim2 }}>No data yet.</div>}
      </div>
    </div>
  );
  return (
    <Section title="Advance-rate by AWS play" icon="percent">
      <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 2, padding: "16px 18px" }}>
        <div style={{ fontSize: 11.5, color: C.dim2, marginBottom: 14, lineHeight: 1.5 }}>Which funding motion advances to a meeting / win. Counts read leads → booked+ → won per play — double down on the play that converts.</div>
        <Table rows={groupBy()} head="By play" />
      </div>
    </Section>
  );
}

function PipelineValuePanel({ companies, fundings }) {
  const valued = companies.filter((c) => c.opp_value);
  const fr = (fundings || []).filter((f) => f.status !== "Rejected" && f.status !== "Cancelled");
  const cash = fr.filter((f) => f.funding_type !== "credits").reduce((s, f) => s + (Number(f.amount) || 0), 0);
  const credits = fr.filter((f) => f.funding_type !== "cash").reduce((s, f) => s + (Number(f.amount) || 0), 0);
  if (!valued.length && !fr.length) return null;
  const won = valued.filter((c) => c.stage === "vunnen").reduce((s, c) => s + Number(c.opp_value), 0);
  const openList = valued.filter((c) => c.stage !== "vunnen" && c.stage !== "forlorad");
  const open = openList.reduce((s, c) => s + Number(c.opp_value), 0);
  const weighted = openList.reduce((s, c) => s + Number(c.opp_value) * (STAGE_PROB[c.stage] || 0) / 100, 0);
  const Card = ({ label, value, color }) => (
    <div style={{ flex: 1, minWidth: 140, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 2, padding: "16px 18px" }}>
      <div style={{ fontSize: 12, color: C.dim, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 400, color, fontFamily: FONT_DISPLAY }}>{value}</div>
    </div>
  );
  return (
    <Section title="Pipeline value & forecast" icon="chart">
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Card label={"Weighted forecast (" + openList.length + " open)"} value={fmtSEK(weighted + won)} color={C.accent} />
        <Card label="Open pipeline" value={fmtSEK(open)} color={C.text} />
        <Card label="Won" value={fmtSEK(won)} color={C.green} />
      </div>
      {fr.length > 0 && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
          <Card label={"Customer funding - cash"} value={fmtMoney(cash, "USD")} color={C.accent} />
          <Card label={"Customer funding - credits"} value={fmtMoney(credits, "USD")} color={C.blue} />
          <div style={{ flex: 1, minWidth: 140 }} />
        </div>
      )}
      <div style={{ fontSize: 11.5, color: C.dim2, marginTop: 10, lineHeight: 1.5 }}>Deal value is your SEK pipeline; AWS funding (cash + credits, in USD) is the leverage stacked on top - active fund requests only. Set deal values and track funding on company cards.</div>
    </Section>
  );
}

function ActivityFeed({ companies, activities }) {
  const nameById = {};
  companies.forEach((c) => (nameById[c.id] = c.name));
  const ids = new Set(companies.map((c) => c.id));
  const feed = activities.filter((a) => ids.has(a.company_id)).slice(0, 12);
  if (!feed.length) return null;
  const rel = (iso) => {
    const ms = Date.now() - new Date(iso).getTime();
    const h = ms / 36e5;
    if (h < 1) return Math.max(1, Math.round(ms / 6e4)) + "m ago";
    if (h < 24) return Math.round(h) + "h ago";
    return Math.round(h / 24) + "d ago";
  };
  const typeColor = { Call: C.blue, Meeting: C.green, Note: C.dim2, Email: C.amber };
  return (
    <Section title="Recent activity" icon="users">
      <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 2 }}>
        {feed.map((a, i) => (
          <div key={a.id} style={{ display: "flex", gap: 10, alignItems: "baseline", padding: "10px 16px", borderBottom: i < feed.length - 1 ? `1px solid ${C.line}` : "none" }}>
            <Pill color={typeColor[a.type] || C.dim}>{a.type}</Pill>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 12.5, color: C.text, fontWeight: 600 }}>{nameById[a.company_id] || "-"}</span>
              <span style={{ fontSize: 12, color: C.dim }}> · {a.body}</span>
            </div>
            <span style={{ fontSize: 11, color: C.dim2, fontFamily: FONT_MONO, whiteSpace: "nowrap" }}>{rel(a.created_at)}</span>
          </div>
        ))}
      </div>
    </Section>
  );
}

// Paste a Swedish org number -> open the existing card or create a new lead from the SCB
// registry. onLookup(orgnr) is provided by Forge (handles existing-match + create + enrich).
// SmithCommandBar — one universal bar (replaces the old org-number-only search).
// Auto-detects intent: mostly-digits => SCB org lookup/create; text => live company-name
// search over loaded companies (jump straight to the card); "ask Smith" opens the chat.
function SmithCommandBar({ companies, onLookup, onOpen, onAskSmith }) {
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [focused, setFocused] = useState(false);
  const digits = q.replace(/\D/g, "");
  const looksOrg = digits.length >= 8 && digits.length / Math.max(q.length, 1) > 0.6; // mostly digits
  const validOrg = digits.length === 10 || digits.length === 12;
  const term = lc(q.trim());
  const matches = useMemo(() => {
    if (!term || looksOrg || term.length < 2) return [];
    return (companies || [])
      .filter((c) => lc(c.name).includes(term) || lc(c.domain).includes(term))
      .slice(0, 7);
  }, [companies, term, looksOrg]);

  async function orgGo() {
    if (!validOrg || busy) return;
    setBusy(true); setMsg("");
    try {
      const r = await onLookup(q);
      if (r?.status === "existing") setMsg(`Opening existing card: ${r.name}`);
      else if (r?.status === "created") setMsg(`Added ${r.name} from SCB`);
      else if (r?.status === "notfound") setMsg("No company found for that organisation number in the SCB registry.");
    } catch (e) { setMsg("Lookup failed: " + (e?.message || e)); }
    finally { setBusy(false); }
  }
  function onEnter() {
    if (looksOrg) return orgGo();
    if (matches.length) { onOpen(matches[0].id); setQ(""); return; }
    if (q.trim()) onAskSmith && onAskSmith(q.trim()); // free text → Smith chat
  }

  const showDrop = focused && !looksOrg && matches.length > 0;
  return (
    <div style={{ position: "relative", marginBottom: 22 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", background: C.cream, border: `1px solid ${C.line2}`, borderRadius: 3, padding: "4px 6px 4px 12px" }}>
        <Icon name="search" size={16} color={C.dim2} />
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setMsg(""); }}
          onKeyDown={(e) => { if (e.key === "Enter") onEnter(); if (e.key === "Escape") setQ(""); }}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder="Search a company, paste an org-number to add from SCB, or ask Smith…"
          style={{ flex: 1, minWidth: 200, background: "transparent", border: "none", padding: "9px 4px", color: C.text, fontSize: 13.5, fontFamily: FONT_BODY, outline: "none" }}
        />
        {looksOrg ? (
          <Btn variant="dark" onClick={orgGo} disabled={!validOrg || busy}>
            {busy ? <Spinner color={C.cream} /> : <Icon name="search" size={14} color={C.cream} />} {busy ? "Looking up…" : "Open / create"}
          </Btn>
        ) : q.trim() && !matches.length ? (
          <Btn variant="dark" onClick={() => onAskSmith && onAskSmith(q.trim())}>
            <Icon name="spark" size={14} color={C.accent} /> Ask Smith
          </Btn>
        ) : null}
      </div>
      {showDrop && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: C.cream, border: `1px solid ${C.line2}`, borderRadius: 3, boxShadow: "0 8px 28px rgba(20,19,16,.14)", zIndex: 30, overflow: "hidden" }}>
          {matches.map((c) => (
            <div key={c.id} onMouseDown={() => { onOpen(c.id); setQ(""); }} style={{ padding: "10px 13px", cursor: "pointer", borderBottom: `1px solid ${C.line}`, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 13.5, fontWeight: 500, color: C.text }}>{c.name}</span>
              {c.cloud_provider && <Pill color={c.cloud_provider === "aws" ? C.accent : C.dim2}>{String(c.cloud_provider).toUpperCase()}</Pill>}
              <span style={{ flex: 1 }} />
              {(c.industry || c.domain) && <span style={{ fontSize: 11, color: C.dim2 }}>{(c.industry || c.domain).slice(0, 30)}</span>}
            </div>
          ))}
          <div onMouseDown={() => onAskSmith && onAskSmith(q.trim())} style={{ padding: "9px 13px", cursor: "pointer", fontSize: 12, color: C.dim, display: "flex", alignItems: "center", gap: 8, background: C.panel2 }}>
            <Icon name="spark" size={13} color={C.accent} /> Ask Smith: “{q.trim()}”
          </div>
        </div>
      )}
      {msg && <div style={{ fontSize: 11.5, color: msg.startsWith("Lookup failed") || msg.startsWith("No company") ? C.red : C.dim2, marginTop: 7, lineHeight: 1.4 }}>{msg}</div>}
    </div>
  );
}

// SmithChat — conversational Smith inside the launcher (Phase 2). Grounded in the rep's
// real pipeline via smithChat(); read-only (advises, never acts). seed = optional first
// question passed from the command bar's "Ask Smith".
function SmithChat({ project, projCompanies, trackMap, contacts, recs, seed, onClearSeed, onOpen, flash }) {
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [web, setWeb] = useState(false);
  const [copied, setCopied] = useState(-1);
  const scrollRef = useRef(null);
  async function send(text, opts = {}) {
    const q = (text != null ? text : input).trim();
    if (!q || busy) return;
    const useWeb = opts.web != null ? opts.web : web;
    setInput("");
    const next = [...msgs, { role: "user", text: q }];
    setMsgs(next); setBusy(useWeb ? "web" : true);
    try {
      const answer = await smithChat({ question: q, history: next, project, projCompanies, trackMap, contacts, recs, web: useWeb });
      setMsgs((m) => [...m, { role: "smith", text: (answer || "").trim() || "I didn't get a response — try rephrasing." }]);
    } catch (e) {
      setMsgs((m) => [...m, { role: "smith", text: "Couldn't reach the model: " + (e?.message || e) }]);
    } finally { setBusy(false); }
  }
  function copy(text, i) {
    try { navigator.clipboard.writeText(text); setCopied(i); flash && flash("Copied to clipboard"); setTimeout(() => setCopied(-1), 1500); }
    catch { flash && flash("Copy failed — select the text manually"); }
  }
  // fire the seeded question once
  useEffect(() => { if (seed) { send(seed); onClearSeed && onClearSeed(); } /* eslint-disable-next-line */ }, [seed]);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [msgs, busy]);
  const suggestions = ["Who should I call first today?", "Which Modernize accounts have no contact?", "Draft an opener for my top Migrate account"];
  return (
    <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.line}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: C.dim2, fontFamily: FONT_HEAD }}>Ask Smith</span>
        <span style={{ flex: 1 }} />
        <button onClick={() => setWeb((v) => !v)} title="Let Smith search the web for fresh signals on a company"
          style={{ display: "flex", alignItems: "center", gap: 5, background: web ? C.accent : "transparent", color: web ? "#fff" : C.dim2, border: `1px solid ${web ? C.accent : C.line2}`, borderRadius: 20, padding: "3px 9px", fontSize: 10.5, fontWeight: 600, cursor: "pointer", fontFamily: FONT_BODY }}>
          <Icon name="search" size={11} color={web ? "#fff" : C.dim2} /> Web {web ? "on" : "off"}
        </button>
      </div>
      {msgs.length > 0 && (
        <div ref={scrollRef} style={{ maxHeight: 230, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
          {msgs.map((m, i) => (
            <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "90%" }}>
              <div style={{ background: m.role === "user" ? C.ink : C.panel, color: m.role === "user" ? C.cream : C.text, border: m.role === "user" ? "none" : `1px solid ${C.line}`, borderRadius: 8, padding: "8px 11px", fontSize: 12.5, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{m.text}</div>
              {m.role === "smith" && m.text.length > 90 && (
                <button onClick={() => copy(m.text, i)} style={{ marginTop: 3, background: "transparent", border: "none", color: copied === i ? C.green : C.dim2, fontSize: 10.5, cursor: "pointer", fontFamily: FONT_BODY, display: "flex", alignItems: "center", gap: 4, padding: "1px 2px" }}>
                  <Icon name="copy" size={11} color={copied === i ? C.green : C.dim2} /> {copied === i ? "Copied" : "Copy"}
                </button>
              )}
            </div>
          ))}
          {busy && <div style={{ alignSelf: "flex-start", color: C.dim2, fontSize: 12, display: "flex", alignItems: "center", gap: 7, padding: "4px 2px" }}><Spinner size={12} /> {busy === "web" ? "Smith is searching the web…" : "Smith is thinking…"}</div>}
        </div>
      )}
      {msgs.length === 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
          {suggestions.map((s) => (
            <button key={s} onClick={() => send(s)} style={{ textAlign: "left", background: C.panel, border: `1px solid ${C.line}`, borderRadius: 6, padding: "8px 11px", fontSize: 12, color: C.dim, cursor: "pointer", fontFamily: FONT_BODY }}>{s}</button>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          rows={1}
          placeholder={web ? "Ask Smith to research a prospect…" : "Ask about your pipeline, or draft an email…"}
          style={{ flex: 1, resize: "none", background: C.cream, border: `1px solid ${C.line2}`, borderRadius: 6, padding: "8px 10px", fontSize: 12.5, color: C.text, fontFamily: FONT_BODY, outline: "none", maxHeight: 90 }}
        />
        <button onClick={() => send()} disabled={busy || !input.trim()} style={{ background: C.ink, color: C.cream, border: "none", borderRadius: 6, padding: "9px 12px", fontSize: 12.5, fontWeight: 600, cursor: busy || !input.trim() ? "default" : "pointer", opacity: busy || !input.trim() ? 0.5 : 1, fontFamily: FONT_HEAD }}>Send</button>
      </div>
      <div style={{ fontSize: 10, color: C.dim2, marginTop: 6 }}>Smith advises from your live pipeline and drafts for you. He won't send or change anything.</div>
    </div>
  );
}

// SmithBriefing — Smith's morning digest, shown in-app at the top of the dashboard.
// Deterministic ($0): assembled from the recommendation engine + stale set + day's numbers,
// phrased in Smith's warm-craftsman voice. Dismissible per day (localStorage). No external send.
function smithBriefingLines({ greeting, recs, stale, fundingQualified, bookedNow }) {
  const lines = [];
  const top = recs[0];
  if (top) {
    lines.push(`${greeting}. ${recs.length} ${recs.length === 1 ? "play" : "plays"} in motion — and your sharpest one today is ${top.label}.`);
    lines.push(`Start with ${top.company.name}${top.fundability != null ? ` (fundability ${top.fundability})` : ""}: ${top.reasonTag}. ${top.action}`);
  } else {
    lines.push(`${greeting}. Nothing scored into a play yet — cloud-check and score a few accounts and I'll line up the work.`);
  }
  const others = recs.slice(1).filter((r) => r.needyCount > 0);
  if (others.length) lines.push("Also worth a look: " + others.map((r) => `${r.label} (${r.company.name})`).join(", ") + ".");
  if (stale && stale.length) lines.push(`${stale.length} ${stale.length === 1 ? "deal is" : "deals are"} going cold — I've flagged them under Today so they don't slip.`);
  if (fundingQualified) lines.push(`${fundingQualified} funding-qualified in the pipeline${bookedNow ? `, ${bookedNow} ${bookedNow === 1 ? "meeting" : "meetings"} booked` : ""}. Good base to forge from.`);
  return lines;
}
function SmithBriefing({ greeting, recs, stale, fundingQualified, bookedNow, onOpen, onDismiss }) {
  if (!recs || recs.length === 0) return null;
  const lines = smithBriefingLines({ greeting, recs, stale, fundingQualified, bookedNow });
  const top = recs[0];
  return (
    <div style={{ background: C.dark, border: `1px solid ${C.darkRule}`, borderRadius: 4, padding: "16px 18px", marginBottom: 20, position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
        <span style={{ width: 22, height: 22, borderRadius: "50%", background: C.ink, border: `2px solid ${C.accent}`, color: C.cream, fontSize: 11, fontWeight: 700, fontFamily: FONT_HEAD, display: "flex", alignItems: "center", justifyContent: "center" }}>S</span>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: C.darkText, fontFamily: FONT_HEAD }}>Smith's morning briefing</span>
        <span style={{ flex: 1 }} />
        <button onClick={onDismiss} title="Dismiss for today" style={{ background: "transparent", border: "none", color: C.darkMuted, fontSize: 16, lineHeight: 1, cursor: "pointer" }}>×</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {lines.map((l, i) => (
          <div key={i} style={{ fontSize: i === 0 ? 14.5 : 12.5, color: i === 0 ? C.cream : C.darkText, lineHeight: 1.5, fontFamily: i === 0 ? FONT_DISPLAY : FONT_BODY }}>{l}</div>
        ))}
      </div>
      {top && (
        <button onClick={() => onOpen(top.company.id)} style={{ marginTop: 12, background: C.accent, color: "#fff", border: "none", borderRadius: 3, padding: "8px 14px", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: FONT_HEAD, display: "inline-flex", alignItems: "center", gap: 7 }}>
          Work {top.company.name} <span style={{ fontSize: 14 }}>→</span>
        </button>
      )}
    </div>
  );
}

// SmithPanel — renders Smith's per-play recommendations. Used by the dashboard hero
// (variant="hero") and the floating launcher (variant="rail"). Pure presentation over
// smithRecommendations(); clicking a rec opens that company card.
function SmithPanel({ recs, onOpen, onOpenPlay, variant = "hero", greeting }) {
  if (!recs || !recs.length) {
    return <div style={{ fontSize: 12.5, color: C.dim2 }}>No fundable plays to recommend yet. Cloud-check + score companies first.</div>;
  }
  const top = recs[0];
  const rest = recs.slice(1);
  const card = (r, big) => {
    const accent = C[r.accent] || C.accent;
    const c = r.company;
    return (
      <div key={r.track} onClick={() => onOpen && onOpen(c.id)}
        style={{ background: C.panel, border: `1px solid ${C.line}`, borderLeft: `3px solid ${accent}`, borderRadius: 2, padding: big ? "13px 15px" : "10px 12px", cursor: "pointer", display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
          <span style={{ fontSize: big ? 10.5 : 9.5, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: accent, fontFamily: FONT_HEAD }}>{r.label}</span>
          <span style={{ fontSize: 9.5, color: C.dim2 }}>{r.count} in play{r.needyCount ? ` · ${r.needyCount} need you` : ""}</span>
        </div>
        <div style={{ fontSize: big ? 15 : 13, fontWeight: 600, color: C.text, lineHeight: 1.2 }}>{c.name}</div>
        <div style={{ fontSize: 11, color: C.dim, display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
          <span style={{ background: C.panel2, border: `1px solid ${C.line2}`, borderRadius: 2, padding: "1px 6px", fontSize: 10, color: C.dim }}>{r.reasonTag}</span>
          {r.fundability != null && <span>fundability {r.fundability}{r.confidence ? ` · ${r.confidence}` : ""}</span>}
        </div>
        <div style={{ fontSize: big ? 12 : 11.5, color: C.dim, lineHeight: 1.45, marginTop: 2 }}>{r.action}</div>
        {big && r.opener && <div style={{ fontSize: 11.5, color: C.dim2, lineHeight: 1.45, marginTop: 4, paddingTop: 6, borderTop: `1px solid ${C.line}` }}><span style={{ fontWeight: 600, color: C.dim }}>Open with:</span> {r.opener}</div>}
      </div>
    );
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: variant === "hero" ? 10 : 8 }}>
      {variant === "rail" && greeting && <div style={{ fontSize: 13, fontWeight: 600, color: C.text, fontFamily: FONT_HEAD }}>{greeting}. Here's where to spend today.</div>}
      {card(top, true)}
      {rest.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: variant === "hero" ? "repeat(auto-fit, minmax(190px, 1fr))" : "1fr", gap: 8 }}>
          {rest.map((r) => card(r, false))}
        </div>
      )}
    </div>
  );
}

function Dashboard({ project, projects, companies, contacts, activities, fundings, onSelectProject, onOpen, onUpdate, onOrgLookup, onAwsBatch, awsBatch, onDomainBatch, domainBatch, onOpenPlay, onAskSmith }) {
  const projCompanies = companies.filter((c) => c.project_id === project.id && c.list_tag !== "archived_shell");
  const wbtn = { background: "transparent", border: `1px solid ${C.line2}`, color: C.dim, borderRadius: 2, padding: "6px 10px", fontSize: 11.5, cursor: "pointer", fontFamily: FONT_BODY };
  const today = dayStr(0), soon = dayStr(7);
  const fuSort = (a, b) => (a.next_action_at < b.next_action_at ? -1 : 1);
  const fu = projCompanies.filter((c) => c.next_action_at);
  const overdue = fu.filter((c) => c.next_action_at < today).sort(fuSort);
  const dueToday = fu.filter((c) => c.next_action_at === today).sort(fuSort);
  const upcoming = fu.filter((c) => c.next_action_at > today && c.next_action_at <= soon).sort(fuSort);
  const worklist = [
    ...overdue.map((c) => ({ c, kind: "overdue" })),
    ...dueToday.map((c) => ({ c, kind: "today" })),
    ...upcoming.map((c) => ({ c, kind: "upcoming" })),
  ];
  const calls = activities.filter((a) => a.type === "Call");
  const bookedNow = projCompanies.filter((c) => c.stage === "mote_bokat");
  const leads = projCompanies.filter((c) => phaseOf(c.stage) === "readiness");
  const won = projCompanies.filter((c) => c.stage === "vunnen");
  const contacted = projCompanies.filter((c) => c.stage === "kontaktad");

  const bookedThisMonth = activities.filter((a) => a.type === "Meeting" && isThisMonth(a.created_at)).length;

  // --- REAL funding tracks (not a cloud guess) — fetched once from funding_eligibility.
  // companies rows don't carry primary_track, so the play tiles + funding metrics read this map.
  const [trackMap, setTrackMap] = useState({});
  useEffect(() => {
    let live = true;
    (async () => {
      try {
        if (typeof sb === "function") {
          const rows = await sb("funding_eligibility", { query: "?select=company_id,primary_track,confidence,fundability_score" });
          if (live && Array.isArray(rows)) { const m = {}; for (const r of rows) m[r.company_id] = r; setTrackMap(m); }
        }
      } catch { /* falls back to empty → tiles show 0 until loaded */ }
    })();
    return () => { live = false; };
  }, [project.id]);
  const trackOf = (c) => (trackMap[c.id] && trackMap[c.id].primary_track) || null;

  // --- AWS PLAYS - the sales motions, each = an AWS funding program. Counts read the REAL
  // funding-engine track (primary_track), so "Modernize" = genuinely on-AWS deals, not every AWS card. ---
  const PLAYS = [
    { key: "migrate",   track: "MAP",            label: "Migrate",   prog: "MAP",            accent: C.accent,
      hits: projCompanies.filter((c) => trackOf(c) === "MAP"),
      pitch: "Existing estate on Azure/GCP/on-prem → move to AWS, AWS co-funds it" },
    { key: "modernize", track: "MAP_MODERNIZE",  label: "Modernize", prog: "MAP Modernize",  accent: C.teal,
      hits: projCompanies.filter((c) => trackOf(c) === "MAP_MODERNIZE"),
      pitch: "Already on AWS → optimize, resell, expand" },
    { key: "genai",     track: "POC",            label: "GenAI",     prog: "POC credits",    accent: C.violet,
      hits: projCompanies.filter((c) => trackOf(c) === "POC"),
      pitch: "AI/data use case → AWS funds a GenAI pilot" },
    { key: "greenfield",track: "GREENFIELD_PGP", label: "Greenfield",prog: "Partner-led",    accent: C.blue,
      hits: projCompanies.filter((c) => trackOf(c) === "GREENFIELD_PGP"),
      pitch: "No estate to migrate → net-new build on AWS (Partner-led)" },
  ];
  // funding-native KPIs
  const FUNDABLE = new Set(["MAP", "MAP_MODERNIZE", "POC", "ISV_WMP", "GREENFIELD_PGP"]);
  const fundingQualified = projCompanies.filter((c) => { const t = trackMap[c.id]; return t && FUNDABLE.has(t.primary_track) && (t.confidence === "high" || t.confidence === "med"); }).length;
  const meddicQualified = projCompanies.filter((c) => { const q = c.enrichment && c.enrichment.copilot_qual; return q && Object.values(q).some((v) => v && v.ok); }).length;
  const hour = new Date().getHours();
  const greeting = hour < 5 ? "Working late" : hour < 11 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // Smith's proactive per-play recommendations (deterministic, $0) — needs the real tracks loaded.
  const smithContactSet = useMemo(() => new Set((contacts || []).map((x) => x.company_id)), [contacts]);
  const smithRecs = useMemo(
    () => smithRecommendations(projCompanies, trackMap, smithContactSet, activities),
    [projCompanies, trackMap, smithContactSet, activities],
  );
  // stale-deal count for the briefing (same rule as the Today "Going cold" group)
  const staleCount = useMemo(() => {
    const lastAct = {};
    for (const a of (activities || [])) { const d = a && a.company_id; if (!d) continue; if (lastAct[d] === undefined || (a.created_at || "") > lastAct[d]) lastAct[d] = a.created_at || ""; }
    let n = 0;
    for (const c of projCompanies) {
      if (c.stage === "vunnen" || c.stage === "forlorad") continue;
      const last = lastAct[c.id];
      const days = last ? Math.floor((Date.now() - Date.parse(last)) / 86400000) : Infinity;
      if (c.stage === "mote_bokat" && days >= 3) n++;
      else if (phaseOf(c.stage) === "pipeline" && days >= 30) n++;
    }
    return n;
  }, [projCompanies, activities]);
  // Morning briefing: show once per day per project unless dismissed.
  const briefKey = "alloy:brief:" + project.id + ":" + dayStr(0);
  const [briefDismissed, setBriefDismissed] = useState(() => { try { return localStorage.getItem(briefKey) === "1"; } catch { return false; } });
  const dismissBrief = () => { setBriefDismissed(true); try { localStorage.setItem(briefKey, "1"); } catch {} };

  // per-projekt-statistik för översikten
  const projStats = projects.map((p) => {
    const pc = companies.filter((c) => c.project_id === p.id && c.list_tag !== "archived_shell");
    return {
      ...p,
      total: pc.length,
      contacts: 0,
      readiness: pc.filter((c) => phaseOf(c.stage) === "readiness").length,
      pipeline: pc.filter((c) => phaseOf(c.stage) === "pipeline" && c.stage !== "vunnen" && c.stage !== "forlorad").length,
      booked: pc.filter((c) => c.stage === "mote_bokat").length,
      won: pc.filter((c) => c.stage === "vunnen").length,
    };
  });

  return (
    <div>
      {/* Smith's morning briefing — in-app digest, dismissible per day */}
      {!briefDismissed && <SmithBriefing greeting={greeting} recs={smithRecs} stale={Array(staleCount)} fundingQualified={fundingQualified} bookedNow={bookedNow.length} onOpen={onOpen} onDismiss={dismissBrief} />}

      {/* universal command bar — search company / add by org-nr / ask Smith */}
      {onOrgLookup && <SmithCommandBar companies={projCompanies} onLookup={onOrgLookup} onOpen={onOpen} onAskSmith={onAskSmith} />}

      {/* welcome hero - greeting */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 24, fontWeight: 400, color: C.text, fontFamily: FONT_DISPLAY, letterSpacing: "-.01em" }}>
          {greeting}.
        </div>
        <div style={{ fontSize: 13, color: C.dim, marginTop: 3 }}>
          {project.name} · {projCompanies.length} companies · {worklist.length > 0
            ? <><strong style={{ color: C.accent }}>{worklist.length}</strong> need follow-up today</>
            : "no follow-ups due. Pick a play below"}
        </div>
      </div>

      {/* SMITH recommends — the single most valuable account to work per play, right now */}
      {smithRecs.length > 0 && (
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.accent, display: "inline-block" }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: C.text, fontFamily: FONT_HEAD }}>Smith recommends</span>
            <span style={{ fontSize: 11, color: C.dim2 }}>your best account in each play, right now</span>
          </div>
          <SmithPanel recs={smithRecs} onOpen={onOpen} onOpenPlay={onOpenPlay} variant="hero" />
        </div>
      )}

      {/* AWS PLAYS - one horizontal row (4 cols). Each = a funding program; click to work its list. */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 26 }}>
        {PLAYS.map((p) => (
          <div key={p.key}
            title={p.hits.length ? `${p.pitch} — click to work these ${p.hits.length}` : p.pitch}
            onClick={() => onOpenPlay && p.hits.length && onOpenPlay(p.track)}
            style={{ background: C.panel, border: `1px solid ${C.line}`, borderTop: `3px solid ${p.accent}`, borderRadius: 2, padding: "14px 16px", cursor: (onOpenPlay && p.hits.length) ? "pointer" : "default" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: 10, color: C.dim, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", fontFamily: FONT_HEAD }}>{p.label}</span>
              <span style={{ fontSize: 9.5, color: p.accent, fontWeight: 700, letterSpacing: ".04em" }}>{p.prog}</span>
            </div>
            <div style={{ fontSize: 34, fontWeight: 400, color: p.accent, fontFamily: FONT_DISPLAY, lineHeight: 1, letterSpacing: "-.02em", marginTop: 8 }}>
              {p.hits.length}
            </div>
            <div style={{ fontSize: 10.5, color: C.dim2, marginTop: 7, lineHeight: 1.4 }}>{p.pitch}</div>
          </div>
        ))}
      </div>

      {worklist.length > 0 && (
        <Section title="Today & overdue" icon="target">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {worklist.map(({ c, kind }) => {
              const col = kind === "overdue" ? C.red : kind === "today" ? C.green : C.dim2;
              const lbl = kind === "overdue" ? "Overdue" : kind === "today" ? "Today" : "Upcoming";
              return (
                <div key={c.id} style={{ background: C.panel, border: `1px solid ${C.line}`, borderLeft: `3px solid ${col}`, borderRadius: 2, padding: "11px 14px", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0, cursor: "pointer" }} onClick={() => onOpen && onOpen(c.id)}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 14, fontWeight: 400, color: C.text, fontFamily: FONT_DISPLAY }}>{c.name}</span>
                      <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", color: col }}>{lbl}</span>
                      <span style={{ fontSize: 11, color: C.dim2, fontFamily: FONT_MONO }}>{c.next_action_at}</span>
                    </div>
                    {c.next_action && <div style={{ fontSize: 12, color: C.dim, marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.next_action}</div>}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button onClick={() => onUpdate && onUpdate(c.id, { next_action_at: dayStr(1) })} title="Snooze to tomorrow" style={wbtn}>Tomorrow</button>
                    <button onClick={() => onUpdate && onUpdate(c.id, { next_action_at: null })} title="Mark done (clear date)" style={wbtn}>Done</button>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      )}
      <Section title="My active projects" icon="folder">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {projStats.map((p) => {
            const active = p.id === project.id;
            return (
              <div key={p.id} onClick={() => onSelectProject(p.id)} style={{
                background: active ? C.panel2 : C.panel,
                border: `1px solid ${active ? p.color + "66" : C.line}`,
                borderRadius: 2, padding: "14px 18px", display: "flex", alignItems: "center",
                gap: 14, cursor: "pointer", transition: "all .15s",
              }}>
                <div style={{ width: 38, height: 38, borderRadius: 2, background: p.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 500, color: C.cream, fontFamily: FONT_HEAD, letterSpacing: ".05em", flexShrink: 0 }}>{initials(p.name)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 15.5, fontWeight: 400, color: C.text, fontFamily: FONT_DISPLAY }}>{p.name}</span>
                    {active && <Pill color={p.color}>active</Pill>}
                  </div>
                  <div style={{ fontSize: 12, color: C.dim, marginTop: 2 }}>
                    {p.partner?.name} · {p.total} companies
                  </div>
                </div>
                <div style={{ display: "flex", gap: 18, textAlign: "center" }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 400, color: C.text, fontFamily: FONT_DISPLAY }}>{p.readiness}</div>
                    <div style={{ fontSize: 10, color: C.dim2, textTransform: "uppercase", letterSpacing: 0.5 }}>Readiness</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 400, color: C.blue, fontFamily: FONT_DISPLAY }}>{p.pipeline}</div>
                    <div style={{ fontSize: 10, color: C.dim2, textTransform: "uppercase", letterSpacing: 0.5 }}>Pipeline</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 400, color: C.green, fontFamily: FONT_DISPLAY }}>{p.won}</div>
                    <div style={{ fontSize: 10, color: C.dim2, textTransform: "uppercase", letterSpacing: 0.5 }}>Won</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* AT A GLANCE — funding KPIs + goals in one compact strip (merged from Metrics + Goals) */}
      <Section title="At a glance" icon="chart">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
          <Metric label="Funding-qualified" value={fundingQualified} icon="tag" accent={C.accent} />
          <Metric label="Meetings booked" value={bookedNow.length} icon="calendar" accent={C.green} />
          <Metric label="Qualified (MEDDIC)" value={meddicQualified} icon="target" accent={C.blue} />
          <Metric label="Won" value={won.length} icon="spark" accent={C.violet} />
          <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 2, padding: "13px 16px" }}>
            <div style={{ fontSize: 11, color: C.dim2, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>Goal · week</div>
            <div style={{ fontSize: 21, fontWeight: 400, color: C.text, fontFamily: FONT_DISPLAY }}>{bookedNow.filter((c) => isThisWeek(c.updated_at)).length} <span style={{ fontSize: 13, color: C.dim2 }}>/ {project.goal_week}</span></div>
          </div>
          <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 2, padding: "13px 16px" }}>
            <div style={{ fontSize: 11, color: C.dim2, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>Goal · month</div>
            <div style={{ fontSize: 21, fontWeight: 400, color: C.text, fontFamily: FONT_DISPLAY }}>{bookedThisMonth} <span style={{ fontSize: 13, color: C.dim2 }}>/ {project.goal_month}</span></div>
          </div>
        </div>
      </Section>

      <ConversionInsights companies={projCompanies} trackOf={trackOf} />

      <PipelineValuePanel companies={projCompanies} fundings={(fundings || []).filter((f) => f.project_id === project.id)} />

      <ActivityFeed companies={projCompanies} activities={activities} />
    </div>
  );
}

/* ============================================================================
   PIPELINE  -  två faser sida vid sida
   ============================================================================ */
function PipelineView({ project, companies, onOpen, onStage }) {
  const projCompanies = companies.filter((c) => c.project_id === project.id && c.list_tag !== "archived_shell");
  function Column({ stage }) {
    const items = projCompanies.filter((c) => c.stage === stage.key);
    return (
      <div style={{ minWidth: 212, flex: "0 0 212px", background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 4, padding: 10, alignSelf: "flex-start" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10, paddingBottom: 9, borderBottom: `1px solid ${C.line}` }}>
          <Dot color={STATUS_COLOR[stage.key]} />
          <span style={{ fontSize: 12, fontWeight: 600, color: C.text, flex: 1 }}>{stage.label}</span>
          <span style={{ fontSize: 11, color: C.dim2, fontFamily: FONT_MONO }}>{items.length}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map((c) => (
            <div key={c.id} onClick={() => onOpen(c.id)} style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 2, padding: "10px 12px", cursor: "pointer" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>{c.name}</div>
              <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                {(c.industry || c.domain) && <span style={{ fontSize: 11, color: C.dim }}>{(c.industry || c.domain).slice(0, 26)}</span>}
                {c.leadanalysis?.score != null && <Pill color={c.leadanalysis.score >= 70 ? C.green : c.leadanalysis.score >= 45 ? C.amber : C.dim2}>{c.leadanalysis.score}%</Pill>}
              </div>
            </div>
          ))}
          {items.length === 0 && <div style={{ fontSize: 11.5, color: C.dim2, padding: "6px 2px" }}>-</div>}
        </div>
      </div>
    );
  }
  return (
    <div>
      {["readiness", "pipeline"].map((ph) => (
        <div key={ph} style={{ marginBottom: 26 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
            <span style={{ width: 9, height: 9, borderRadius: 2, background: PHASES[ph].color }} />
            <h3 style={{ margin: 0, fontSize: 13, fontWeight: 400, letterSpacing: 0.5, color: C.text, fontFamily: FONT_DISPLAY }}>Phase {ph === "readiness" ? "1" : "2"} - {PHASES[ph].label}</h3>
          </div>
          <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 8 }}>
            {PHASES[ph].stages.map((s) => <Column key={s.key} stage={s} />)}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================================================================
   FÖRETAGSLISTA
   ============================================================================ */
function CompanyList({ project, companies, contacts, onOpen, query, setQuery, tab, setTab, me, onDomainBatch, domainBatch, onAwsBatch, awsBatch, playFilter, setPlayFilter }) {
  const projCompanies = companies.filter((c) => c.project_id === project.id && c.list_tag !== "archived_shell");
  const [mineOnly, setMineOnly] = useState(false);
  // When a dashboard play tile is clicked, playFilter holds a primary_track (e.g. "MAP_MODERNIZE").
  // Fetch the real funding tracks so the list shows exactly the companies behind that tile's count.
  const [trackMap, setTrackMap] = useState({});
  useEffect(() => {
    if (!playFilter) return;
    let live = true;
    (async () => {
      try {
        if (typeof sb === "function") {
          const rows = await sb("funding_eligibility", { query: "?select=company_id,primary_track" });
          if (live && Array.isArray(rows)) { const m = {}; for (const r of rows) m[r.company_id] = r.primary_track; setTrackMap(m); }
        }
      } catch { /* leave empty -> filter shows nothing rather than wrong rows */ }
    })();
    return () => { live = false; };
  }, [playFilter]);
  const PLAY_LABEL = { MAP: "Migrate", MAP_MODERNIZE: "Modernize", POC: "GenAI", ISV_WMP: "Marketplace", GREENFIELD_PGP: "Greenfield", NONE: "No play" };
  const missingDomain = projCompanies.filter((c) => !c.domain).length;
  const uncheckedAws = projCompanies.filter((c) => c.domain && !c.cloud_provider).length;
  const counts = {
    all: projCompanies.length,
    leads: projCompanies.filter((c) => phaseOf(c.stage) === "readiness").length,
    booked: projCompanies.filter((c) => c.stage === "mote_bokat").length,
    won: projCompanies.filter((c) => c.stage === "vunnen").length,
  };
  const cloudCounts = useMemo(() => {
    const m = { aws: 0, gcp: 0, azure: 0, cloudflare: 0, other: 0, unchecked: 0 };
    projCompanies.forEach((c) => { const p = c.cloud_provider || (c.aws_detected ? "aws" : ""); if (!p) m.unchecked++; else if (m[p] != null) m[p]++; else m.other++; });
    return m;
  }, [projCompanies]);
  const filtered = useMemo(() => {
    const q = lc(query);
    return projCompanies.filter((c) => {
      if (playFilter && trackMap[c.id] !== playFilter) return false;
      if (tab === "leads" && phaseOf(c.stage) !== "readiness") return false;
      if (tab === "booked" && c.stage !== "mote_bokat") return false;
      if (tab === "won" && c.stage !== "vunnen") return false;
      if (mineOnly && lc(c.owner) !== lc(me)) return false;
      if (!q) return true;
      return lc(c.name).includes(q) || lc(c.industry).includes(q) || lc(c.city).includes(q);
    });
  }, [projCompanies, query, tab, mineOnly, me, playFilter, trackMap]);

  const [sort, setSort] = useState("icp");
  const [cloudFilter, setCloudFilter] = useState("all");
  const [limit, setLimit] = useState(150);
  const contactSet = useMemo(() => new Set(contacts.map((x) => x.company_id)), [contacts]);
  const icpOf = (c) => icpScore(c, contactSet.has(c.id));
  const sorted = useMemo(() => {
    const provOf = (c) => c.cloud_provider || (c.aws_detected ? "aws" : "");
    let arr = filtered.filter((c) => {
      if (cloudFilter === "all") return true;
      if (cloudFilter === "unchecked") return !provOf(c);
      return provOf(c) === cloudFilter;
    });
    arr = [...arr];
    if (sort === "icp") arr.sort((a, b) => icpOf(b) - icpOf(a));
    else if (sort === "lead") arr.sort((a, b) => (b.leadanalysis?.score ?? -1) - (a.leadanalysis?.score ?? -1));
    else if (sort === "employees") arr.sort((a, b) => (b.employees || 0) - (a.employees || 0));
    else if (sort === "name") arr.sort((a, b) => lc(a.name).localeCompare(lc(b.name)));
    else if (sort === "recent") arr.sort((a, b) => ((b.updated_at || "") < (a.updated_at || "") ? -1 : 1));
    return arr;
  }, [filtered, sort, cloudFilter, contactSet]);

  const tabs = [
    { key: "all", label: "All targets", n: counts.all },
    { key: "leads", label: "Readiness", n: counts.leads },
    { key: "booked", label: "Booked", n: counts.booked },
    { key: "won", label: "Won", n: counts.won },
  ];
  
  return (
  <div>
  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
            <Btn variant="dark" size="sm" onClick={onDomainBatch} disabled={domainBatch?.running || (!missingDomain && !domainBatch?.running)}>
              {domainBatch?.running ? `Finding… ${domainBatch.done}/${domainBatch.total}` : missingDomain ? `Find ${missingDomain} websites` : "Websites done"}
            </Btn>
            <Btn variant="dark" size="sm" onClick={onAwsBatch} disabled={awsBatch?.running || (!uncheckedAws && !awsBatch?.running)}>
              {awsBatch?.running ? `Checking… ${awsBatch.done}/${awsBatch.total}` : uncheckedAws ? `Cloud-check ${uncheckedAws}` : "Cloud done"}
            </Btn>
            <span style={{ flex: 1 }} />
            <span style={{ fontSize: 11.5, color: C.dim2 }}>
              {domainBatch?.running ? `${domainBatch.found} found` : awsBatch?.running ? `${awsBatch.found} on AWS` :
                ((domainBatch && !domainBatch.running ? `${domainBatch.found} found · ` : "") + (awsBatch && !awsBatch.running ? `${awsBatch.found} on AWS` : "")) || "Find websites, then cloud-check to flag AWS / GCP / Azure."}
            </span>
          </div>
          {(domainBatch?.running || awsBatch?.running) && (
            <div style={{ height: 5, background: C.panel2, borderRadius: 3, marginTop: 10, overflow: "hidden" }}>
              <div style={{ height: "100%", width: Math.round((((domainBatch?.running ? domainBatch : awsBatch).done) / ((domainBatch?.running ? domainBatch : awsBatch).total || 1)) * 100) + "%", background: C.lime, transition: "width .2s" }} />
            </div>
          )}
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            background: tab === t.key ? C.ink : "transparent", color: tab === t.key ? C.cream : C.dim,
            border: `1px solid ${tab === t.key ? C.ink : C.line}`, borderRadius: 2, padding: "8px 15px",
            fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: FONT_BODY,
          }}>{t.label} <span style={{ opacity: 0.6 }}>{t.n}</span></button>
        ))}
        {me && (
          <button onClick={() => setMineOnly((v) => !v)} title="Show only companies I own" style={{
            background: mineOnly ? C.accent : "transparent", color: mineOnly ? "#fff" : C.dim,
            border: `1px solid ${mineOnly ? C.accent : C.line}`, borderRadius: 2, padding: "8px 15px",
            fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: FONT_BODY, marginLeft: "auto",
          }}>Mine</button>
        )}
        {playFilter && setPlayFilter && (
          <button onClick={() => setPlayFilter(null)} title="Clear play filter" style={{
            background: C.ink, color: C.cream, border: `1px solid ${C.ink}`, borderRadius: 2, padding: "8px 15px",
            fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: FONT_BODY, marginLeft: me ? 8 : "auto",
            display: "flex", alignItems: "center", gap: 7,
          }}>Play: {PLAY_LABEL[playFilter] || playFilter} <span style={{ opacity: 0.7 }}>✕</span></button>
        )}
      </div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search companies…"
        style={{ width: "100%", background: C.panel, border: `1px solid ${C.line2}`, borderRadius: 2, padding: "11px 14px", color: C.text, fontSize: 13.5, fontFamily: FONT_BODY, outline: "none", boxSizing: "border-box", marginBottom: 14 }}
      />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, gap: 10, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, color: C.dim }}>{sorted.length} companies</span>
          {cloudCounts.aws > 0 && <span style={{ fontSize: 11, color: CLOUD.aws.color, cursor: "pointer", fontWeight: 600 }} title="Filter to AWS" onClick={() => setCloudFilter(cloudFilter === "aws" ? "all" : "aws")}>{cloudCounts.aws} AWS</span>}
          {cloudCounts.gcp > 0 && <span style={{ fontSize: 11, color: CLOUD.gcp.color, cursor: "pointer", fontWeight: 600 }} title="Filter to GCP" onClick={() => setCloudFilter(cloudFilter === "gcp" ? "all" : "gcp")}>{cloudCounts.gcp} GCP</span>}
          {cloudCounts.azure > 0 && <span style={{ fontSize: 11, color: CLOUD.azure.color, cursor: "pointer", fontWeight: 600 }} title="Filter to Azure" onClick={() => setCloudFilter(cloudFilter === "azure" ? "all" : "azure")}>{cloudCounts.azure} Azure</span>}
          {cloudCounts.unchecked > 0 && <span style={{ fontSize: 11, color: C.dim2, cursor: "pointer" }} title="Filter to unchecked" onClick={() => setCloudFilter(cloudFilter === "unchecked" ? "all" : "unchecked")}>{cloudCounts.unchecked} unchecked</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <select value={cloudFilter} onChange={(e) => setCloudFilter(e.target.value)} title="Filter by cloud provider"
            style={{ background: cloudFilter !== "all" ? C.accent : C.panel, border: `1px solid ${cloudFilter !== "all" ? C.accent : C.line2}`, color: cloudFilter !== "all" ? "#fff" : C.dim, borderRadius: 2, padding: "5px 9px", fontSize: 11.5, cursor: "pointer", fontFamily: FONT_BODY, outline: "none" }}>
            <option value="all">All clouds</option>
            <option value="aws">AWS</option>
            <option value="gcp">GCP</option>
            <option value="azure">Azure</option>
            <option value="cloudflare">Cloudflare</option>
            <option value="other">Other host</option>
            <option value="unchecked">Unchecked</option>
          </select>
          <span style={{ fontSize: 11, color: C.dim2 }}>Sort</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)}
            style={{ background: C.panel, border: `1px solid ${C.line2}`, color: C.dim, borderRadius: 2, padding: "5px 9px", fontSize: 11.5, cursor: "pointer", fontFamily: FONT_BODY, outline: "none" }}>
            <option value="icp">ICP score</option>
            <option value="lead">Lead fit</option>
            <option value="employees">Employees</option>
            <option value="name">Name</option>
            <option value="recent">Recently updated</option>
          </select>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {sorted.slice(0, limit).map((c) => {
          const cc = contacts.filter((x) => x.company_id === c.id);
          return (
            <div key={c.id} onClick={() => onOpen(c.id)} style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 2, padding: "13px 15px", cursor: "pointer", display: "flex", alignItems: "center", gap: 13 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 3 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{c.name}</span>
                  {(() => { const v = icpOf(c); return <Pill color={icpColor(v)}><span title="ICP score: lead fit + cloud (AWS warm / GCP·Azure displacement) + contact + size + website">ICP {v}</span></Pill>; })()}
                  {c.tier && <Pill color={C.dim}>{c.tier}</Pill>}
                  {c.leadanalysis?.score != null && <Pill color={c.leadanalysis.score >= 70 ? C.green : c.leadanalysis.score >= 45 ? C.amber : C.dim2}>{c.leadanalysis.score}% fit</Pill>}
                  <CloudChip company={c} />
                  {c.email_provider === "microsoft" && <Pill color={C.dim2}><span title="Microsoft 365 email - Microsoft-leaning stack">M365</span></Pill>}
                  {c.email_provider === "google" && <Pill color={C.dim2}><span title="Google Workspace email">Google</span></Pill>}
                  {c.enrichment?.domain_confidence === "low" && <Pill color={C.amber}><span title={"Auto-found website (low confidence)" + (c.enrichment.domain_evidence ? " - " + c.enrichment.domain_evidence : "") + ". Verify before relying on it."}>domain?</span></Pill>}
                </div>
                <div style={{ fontSize: 12, color: C.dim }}>
                  {[c.industry, c.employees ? c.employees + " empl." : "", cc.length ? cc.length + " contacts" : "", c.opp_value ? fmtSEK(c.opp_value) : "", c.owner ? "@" + c.owner.split("@")[0] : ""].filter(Boolean).join(" · ")}
                </div>
              </div>
              <Pill color={STATUS_COLOR[c.stage]} bg={C.panel2}>
                <Dot color={STATUS_COLOR[c.stage]} />{STAGE_LABEL[c.stage]}
              </Pill>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: 40, color: C.dim2, fontSize: 13 }}>No companies here yet.</div>
        )}
        {sorted.length > limit && (
          <button onClick={() => setLimit((l) => l + 250)} style={{ background: "transparent", border: `1px solid ${C.line}`, color: C.dim, borderRadius: 2, padding: "10px 15px", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: FONT_BODY, marginTop: 4 }}>
            Show {Math.min(250, sorted.length - limit)} more ({sorted.length - limit} hidden)
          </button>
        )}
      </div>
    </div>
  );
}

/* ============================================================================
   IMPORT
   ============================================================================ */
/* ============================================================================
   AWS PARTNER CENTRAL (ACE) EXPORT
   Maps Alloy companies -> ACE bulk-import opportunity rows.
   Field schema + sales stages per AWS Partner Central Sales Guide.
   ============================================================================ */
// Alloy pipeline stage -> ACE sales stage. Submit at Qualified or higher.
const ACE_STAGE = {
  lead: "Prospect", research: "Prospect", hypotes: "Prospect", redo: "Prospect",
  kontaktad: "Prospect", mote_bokat: "Qualified", kvalificerad: "Qualified",
  forslag: "Business Validation", vunnen: "Launched", forlorad: "Closed Lost",
};
// Exact column order for the ACE bulk-import template (required + key optional).
const ACE_COLUMNS = [
  "Customer company name", "Customer website", "Country", "Postal code",
  "Industry vertical", "Partner primary need from AWS", "Sales activities",
  "Partner project title", "Customer business problem", "Solution offered",
  "Use case", "Estimated AWS monthly recurring revenue", "Target close date",
  "Opportunity type", "Delivery model", "Is opportunity from marketing activity?",
  "Primary contact first name", "Primary contact last name", "Primary contact title",
  "Primary contact email", "Primary contact phone", "AWS products",
  "Partner CRM unique identifier",
];
function aceCell(v) {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}
function aceTargetDate() {
  const t = new Date(); t.setDate(t.getDate() + 90);
  const mm = String(t.getMonth() + 1).padStart(2, "0");
  const dd = String(t.getDate()).padStart(2, "0");
  return mm + "/" + dd + "/" + t.getFullYear();
}
function companyToAceRow(c, contacts, partnerName) {
  const ct = (contacts || []).find((x) => x.company_id === c.id) || {};
  const e = c.enrichment || {};
  let problem = (e.opportunity || e.aws_value || e.description || "").trim();
  if (problem.length < 20) {
    problem = (problem + " - AWS modernization & cloud opportunity identified by " +
      (partnerName || "partner") + ".").trim();
  }
  const aws = (c.techstack?.items || [])
    .filter((i) => /aws|amazon/i.test(i.name)).map((i) => i.name).join("; ");
  const web = c.domain ? (/^https?:\/\//.test(c.domain) ? c.domain : "https://" + c.domain) : "";
  return {
    "Customer company name": c.name || "",
    "Customer website": web,
    "Country": c.country || "Sweden",
    "Postal code": "",
    "Industry vertical": "",   // pick-list - set in official ACE template
    "Partner primary need from AWS": "Co-Sell",
    "Sales activities": c.next_action || "",
    "Partner project title": (c.name ? c.name + " - " : "") + "AWS opportunity",
    "Customer business problem": problem,
    "Solution offered": "Other",
    "Use case": "",            // pick-list - set in official ACE template
    "Estimated AWS monthly recurring revenue": "",
    "Target close date": aceTargetDate(),
    "Opportunity type": "Net New Business",
    "Delivery model": "",      // pick-list - set in official ACE template
    "Is opportunity from marketing activity?": "No",
    "Primary contact first name": ct.first_name || "",
    "Primary contact last name": ct.last_name || "",
    "Primary contact title": ct.title || "",
    "Primary contact email": ct.email || "",
    "Primary contact phone": ct.phone || "",
    "AWS products": aws,
    "Partner CRM unique identifier": "alloy-" + (c.id || ""),
  };
}
function buildAceCsv(companies, contacts, partnerName) {
  const head = ACE_COLUMNS.join(",");
  const body = companies
    .map((c) => companyToAceRow(c, contacts, partnerName))
    .map((r) => ACE_COLUMNS.map((k) => aceCell(r[k])).join(","))
    .join("\n");
  return head + "\n" + body;
}
function downloadCsv(filename, csv) {
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

function SeSyncPanel() {
  const [url, setUrl] = useState("");
  const [st, setSt] = useState(null);
  const [busy, setBusy] = useState(false);
  const [testing, setTesting] = useState(false);
  const [peekRes, setPeekRes] = useState(null);
  const [msg, setMsg] = useState("");
  const [sniFilter, setSniFilter] = useState("");
  const [ortFilter, setOrtFilter] = useState("");
  const stopRef = useRef(false);

  useEffect(() => { (async () => { try { setSt(await seIngestState()); } catch {} })(); }, []);

  async function poll() { try { setSt(await seIngestState()); } catch {} }

  async function runPeek() {
    const u = url.trim();
    if (!u) { setMsg("Paste the scb_bulkfil.zip download link first."); return; }
    setTesting(true); setMsg(""); setPeekRes(null);
    try {
      const res = await seIngest({ url: u, mode: "peek" });
      setPeekRes(res);
    } catch (e) { setMsg("Test failed: " + (e?.message || e)); }
    finally { setTesting(false); }
  }

  async function runFull() {
    const u = url.trim();
    if (!u) { setMsg("Paste the scb_bulkfil.zip download link first."); return; }
    const sni = sniFilter.split(",").map((s) => s.trim()).filter(Boolean);
    const ort = ortFilter.split(",").map((s) => s.trim()).filter(Boolean);
    setBusy(true); stopRef.current = false;
    try {
      // Phase 1 - stage the file to storage (one pass, no parsing)
      setMsg("Staging - downloading and decompressing to storage (this is the slow part, ~1-2 min)…");
      const staged = await seStage({ url: u });
      await poll();
      if (!staged.done) { setMsg(`Staging stopped early at ${staged.parts} parts (compute limit). Tell me this number - we may need a plan bump for the full file.`); setBusy(false); return; }
      const parts = staged.parts || 0;
      // Phase 2 - process each staged part (parse + filter + insert)
      const scope = (sni.length || ort.length) ? ` (filter: ${[sni.length ? "SNI " + sni.join("/") : "", ort.length ? ort.join("/") : ""].filter(Boolean).join(", ")})` : "";
      for (let p = 0; p < parts && !stopRef.current; p++) {
        const res = await seProcess({ part: p, truncate: p === 0, sni, ort });
        setMsg(`Processing part ${p + 1}/${parts}${scope} - ${Number(res.total || 0).toLocaleString()} companies loaded${res.done ? " - done." : "…"}`);
        await poll();
        if (res.done) break;
        await new Promise((r) => setTimeout(r, 150));
      }
      setMsg((m) => stopRef.current ? "Paused - processed parts are saved." : m);
    } catch (e) { setMsg("Error: " + (e?.message || e)); }
    finally { setBusy(false); }
  }

  const input = { background: C.panel, border: `1px solid ${C.line2}`, borderRadius: 2, padding: "9px 11px", color: C.text, fontSize: 12.5, fontFamily: FONT_BODY, outline: "none", boxSizing: "border-box", width: "100%" };
  const loaded = st && (st.rows_loaded || 0);
  const verified = peekRes && peekRes.hasOrgnr && peekRes.hasName;

  return (
    <div style={{ background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 4, padding: "14px 16px", marginBottom: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: C.dim2, marginBottom: 8 }}>Admin · Sync Sweden registry</div>
      <div style={{ fontSize: 12.5, color: C.dim, lineHeight: 1.55, marginBottom: 10 }}>
        Loads the full SCB open-data company file (~1.8M orgs) into Alloy so the full Swedish registry is searchable. Open Bolagsverket's "Nedladdningsbara filer", copy the <strong>scb_bulkfil.zip</strong> link, paste it here. <strong>Test the file first</strong>, then load. Weekly refresh keeps it current.
      </div>
      <input style={{ ...input, marginBottom: 8 }} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…/scb_bulkfil.zip" />
      <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 200px" }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: C.dim2, marginBottom: 4 }}>Load only SNI (optional, comma-sep)</div>
          <input style={input} value={sniFilter} onChange={(e) => setSniFilter(e.target.value)} placeholder="e.g. 68, 69  ·  or 62, 58, 63" />
        </div>
        <div style={{ flex: "1 1 200px" }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: C.dim2, marginBottom: 4 }}>Load only cities (optional, comma-sep)</div>
          <input style={input} value={ortFilter} onChange={(e) => setOrtFilter(e.target.value)} placeholder="e.g. göteborg, stockholm" />
        </div>
      </div>
      <div style={{ fontSize: 11, color: C.dim2, marginBottom: 8, lineHeight: 1.5 }}>Leave filters empty to load every real company (aktiebolag, bank/insurance, public sector). Fill them to load just a target slice - e.g. SNI <strong>68, 69</strong> for Alto or <strong>62, 58, 63, 29</strong> for Novalo.</div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <Btn variant="dark" size="sm" onClick={runPeek} disabled={testing || busy}>{testing ? "Testing…" : "Test file"}</Btn>
        <Btn variant="primary" size="sm" onClick={runFull} disabled={busy || testing || !verified}>{busy ? "Loading…" : (loaded ? "Reload full registry" : "Load full registry")}</Btn>
        {busy && <Btn variant="ghost" size="sm" onClick={() => { stopRef.current = true; }}>Pause</Btn>}
        <Btn variant="ghost" size="sm" onClick={poll} disabled={busy}>Refresh status</Btn>
        {st && <span style={{ fontSize: 12, color: st.status === "error" || st.status === "stage_error" ? C.red : C.dim2 }}>
          {st.status === "done" ? `✓ ${Number(loaded).toLocaleString()} companies loaded` : (st.status === "error" || st.status === "stage_error") ? `Error: ${st.message}` : (st.message ? st.message : (loaded ? `${Number(loaded).toLocaleString()} loaded` : "Not loaded yet"))}
        </span>}
      </div>
      {!verified && !peekRes && <div style={{ fontSize: 11.5, color: C.dim2, marginTop: 6 }}>Run "Test file" first - the load unlocks once the format is verified.</div>}
      {peekRes && (
        <div style={{ marginTop: 12, background: C.panel, border: `1px solid ${verified ? C.green : C.amber}55`, borderRadius: 3, padding: "11px 13px" }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: verified ? C.green : C.amber, marginBottom: 6 }}>
            {verified ? "✓ Format verified" : "⚠ Needs attention"} · {peekRes.encoding} · delimiter {peekRes.delimiter}
          </div>
          <div style={{ fontSize: 11.5, color: C.dim, lineHeight: 1.5, marginBottom: 8 }}>{peekRes.note}</div>
          {peekRes.resolved && (
            <div style={{ fontSize: 11, color: C.dim2, marginBottom: 8, lineHeight: 1.6 }}>
              <strong style={{ color: C.dim }}>Resolved mapping:</strong>{" "}
              {Object.entries(peekRes.resolved).map(([field, col], i) => (
                <span key={field}>{i ? " · " : ""}<span style={{ color: C.text }}>{field}</span> ← {col}</span>
              ))}
            </div>
          )}
          {(peekRes.sample || []).length > 0 && (
            <div style={{ marginTop: 4, border: `1px solid ${C.line}`, borderRadius: 3, overflow: "hidden" }}>
              {peekRes.sample.map((r, i) => (
                <div key={i} style={{ padding: "6px 9px", borderTop: i ? `1px solid ${C.line}` : "none", fontSize: 11, color: C.text }}>
                  <strong>{r.name || "(no name)"}</strong>
                  <span style={{ color: C.dim2 }}>{r.sni_text ? " · " + r.sni_text : (r.sni_code ? " · SNI " + r.sni_code : "")}{r.postort ? " · " + r.postort : ""}{r.orgnr ? " · " + r.orgnr : ""}</span>
                </div>
              ))}
            </div>
          )}
          {peekRes.rawHeaders && (
            <details style={{ marginTop: 8 }}>
              <summary style={{ fontSize: 11, color: C.dim2, cursor: "pointer" }}>Raw column headers ({peekRes.rawHeaders.length})</summary>
              <div style={{ fontSize: 10.5, color: C.dim2, marginTop: 4, fontFamily: FONT_MONO, lineHeight: 1.5, wordBreak: "break-word" }}>{peekRes.rawHeaders.join("  ·  ")}</div>
            </details>
          )}
        </div>
      )}
      {msg && <div style={{ fontSize: 12, color: C.dim, marginTop: 8 }}>{msg}</div>}
    </div>
  );
}

function RegistrySearch({ project, onImportRows, isAdmin }) {
  const [country, setCountry] = useState("SE");
  const [navn, setNavn] = useState("");
  const [nace, setNace] = useState("");
  const [komm, setKomm] = useState("");
  const [minAns, setMinAns] = useState("");
  const [maxAns, setMaxAns] = useState("");
     const [orgform, setOrgform] = useState("");
     const [lan, setLan] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [rows, setRows] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(1);
  const [sel, setSel] = useState(() => new Set());

  const keyOf = (r, i) => (r.orgnr || "") + "|" + (r.name || "") + "|" + i;
  const isSE = country === "SE";

  async function run(nextPage) {
    const p = nextPage || 0;
    setBusy(true); setErr("");
    try {
      const params = { country, navn: navn.trim(), naeringskode: nace.trim(), kommunenummer: komm.trim(), ort: komm.trim(), minAnsatte: minAns.trim(), maxAnsatte: maxAns.trim(), orgform: orgform.trim(), lan: lan.trim(), size: 50, page: p };
      const data = await registrySearch(params);
      const got = (data.results || []);
      setTotal(data.total || got.length);
      setPages(data.totalPages || 1);
      setPage(p);
      if (p === 0) { setRows(got); setSel(new Set()); }
      else setRows((prev) => [...(prev || []), ...got]);
    } catch (e) { setErr(e?.message || "Search failed"); if (!nextPage) setRows([]); }
    finally { setBusy(false); }
  }

  function toggle(k) { setSel((s) => { const n = new Set(s); n.has(k) ? n.delete(k) : n.add(k); return n; }); }
  function allKeys() { return (rows || []).map((r, i) => keyOf(r, i)); }
  function selectAll() { const ks = allKeys(); setSel((s) => (s.size === ks.length ? new Set() : new Set(ks))); }
  function importSel() {
    const chosen = (rows || []).filter((r, i) => sel.has(keyOf(r, i)));
    onImportRows(chosen);
  }

  const input = { background: C.panel, border: `1px solid ${C.line2}`, borderRadius: 2, padding: "9px 11px", color: C.text, fontSize: 12.5, fontFamily: FONT_BODY, outline: "none", boxSizing: "border-box" };
  const lbl = { fontSize: 10.5, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", color: C.dim2, marginBottom: 4, display: "block" };
  const selCount = sel.size;

  return (
    <Section title="Find companies in official registries" icon="globe">
      <div style={{ fontSize: 12.5, color: C.dim, lineHeight: 1.55, marginBottom: 14 }}>
        Pull prospects straight from the Swedish company registry, powered by SCB open data loaded into Alloy{isAdmin ? "" : " by an admin"}.
      </div>

      {isAdmin && <SeSyncPanel />}

<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
        <div><label style={lbl}>Name contains</label><input style={{ ...input, width: "100%" }} value={navn} onChange={(e) => setNavn(e.target.value)} placeholder="e.g. logistik" /></div>
        <div><label style={lbl}>SNI industry code</label><input style={{ ...input, width: "100%" }} value={nace} onChange={(e) => setNace(e.target.value)} placeholder="e.g. 62 (IT)" /></div>
        <div><label style={lbl}>City / municipality</label><input style={{ ...input, width: "100%" }} value={komm} onChange={(e) => setKomm(e.target.value)} placeholder="e.g. Göteborg" /></div>
        <div><label style={lbl}>County</label><input style={{ ...input, width: "100%" }} value={lan} onChange={(e) => setLan(e.target.value)} placeholder="e.g. Västra Götaland" /></div>
      </div>
      <Btn variant="primary" onClick={() => run(0)} disabled={busy}>{busy && page === 0 ? "Searching…" : "Search registry"}</Btn>

      {err && <div style={{ fontSize: 12.5, color: C.red, marginTop: 12 }}>{err}</div>}

      {rows && (
        <div style={{ marginTop: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
            <div style={{ fontSize: 12.5, color: C.dim }}>
              {rows.length === 0 ? (isSE ? "No matches. (If nothing matches at all, the Swedish registry may not be loaded yet.)" : "No matches.") : <>Showing <strong style={{ color: C.text }}>{rows.length}</strong> of {total.toLocaleString()} matches</>}
            </div>
            {rows.length > 0 && (
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button onClick={selectAll} style={{ background: "transparent", border: "none", color: C.blue, fontSize: 12, cursor: "pointer", fontFamily: FONT_BODY, textDecoration: "underline", padding: 0 }}>
                  {sel.size === rows.length ? "Clear all" : "Select all"}
                </button>
                <Btn variant="primary" size="sm" onClick={importSel} disabled={!selCount}>Import selected ({selCount})</Btn>
              </div>
            )}
          </div>

          {rows.length > 0 && (
            <div style={{ border: `1px solid ${C.line}`, borderRadius: 3, overflow: "hidden" }}>
              {rows.map((r, i) => {
                const k = keyOf(r, i);
                const on = sel.has(k);
                return (
                  <div key={k} onClick={() => toggle(k)} style={{
                    display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px", cursor: "pointer",
                    borderTop: i ? `1px solid ${C.line}` : "none", background: on ? C.blue + "10" : C.panel,
                  }}>
                    <div style={{ width: 16, height: 16, marginTop: 1, flexShrink: 0, borderRadius: 3, border: `1.5px solid ${on ? C.blue : C.line2}`, background: on ? C.blue : "transparent", color: C.cream, fontSize: 11, lineHeight: "13px", textAlign: "center" }}>{on ? "✓" : ""}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{r.name}</div>
                      <div style={{ fontSize: 11.5, color: C.dim2, marginTop: 2, display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {r.industry && <span>{r.industry}</span>}
                        {r.city && <span>· {r.city}</span>}
                        {(r.employees || r.employees === 0) && <span>· {r.employees} emp.</span>}
                        {r.orgnr && <span>· {r.orgnr}</span>}
                      </div>
                    </div>
                    {r.domain && <Pill color={C.teal}>{r.domain}</Pill>}
                  </div>
                );
              })}
            </div>
          )}

          {rows.length > 0 && page + 1 < pages && (
            <div style={{ marginTop: 10 }}>
              <Btn variant="ghost" onClick={() => run(page + 1)} disabled={busy}>{busy ? "Loading…" : "Load 50 more"}</Btn>
            </div>
          )}
        </div>
      )}
    </Section>
  );
}

// AWS Discovery - runs the discovery agent and reviews its candidate queue.
// Agent finds Swedish companies on AWS (edge fn) -> candidates land in a review
// queue -> approve here inserts real companies; reject discards. Approve/list/reject
// go through the aws-discovery-approve edge fn; running an angle hits aws-discovery.
const DISCOVERY_ANGLES = [
  { key: "case_study", label: "Case studies" },
  { key: "job_ad", label: "Job ads" },
  { key: "web_search", label: "Broad web search" },
];
const DISCOVERY_CLOUDS = [
  { key: "aws", label: "AWS" },
  { key: "gcp", label: "Google Cloud" },
  { key: "azure", label: "Azure" },
];
const CLOUD_LABEL = { aws: "AWS", gcp: "GCP", azure: "Azure", cloudflare: "Cloudflare", other: "Other", none: "none", unverified: "unverified" };
// Badge from a candidate row: detected_provider is the verifier verdict; aws_confidence
// holds the (generic) confidence; target_cloud is what we searched for. Green when the
// verifier confirmed the searched cloud, amber for a different detected cloud, grey for asserted-only.
function cloudBadge(c) {
  const det = c.detected_provider || "unverified";
  const target = c.target_cloud || "aws";
  const conf = c.aws_confidence || "asserted";
  if (det === target && det !== "unverified" && det !== "none") {
    const col = conf === "high" ? C.green : conf === "medium" ? C.amber : C.dim2;
    return { col, txt: (CLOUD_LABEL[det] || det) + " · " + conf };
  }
  if (det && det !== "unverified" && det !== "none") {
    // verifier found a DIFFERENT cloud than searched - still a real cloud signal
    return { col: C.amber, txt: (CLOUD_LABEL[det] || det) + " (detected)" };
  }
  return { col: C.dim2, txt: (CLOUD_LABEL[target] || target) + " · asserted" };
}
function AwsDiscoveryView({ projectId, flash, onAfterApprove }) {
  const [cloud, setCloud] = useState("aws");
  const [angle, setAngle] = useState("case_study");
  const [max, setMax] = useState(8);
  const [running, setRunning] = useState(false);
  const [summary, setSummary] = useState(null);
  const [pending, setPending] = useState([]);
  const [sel, setSel] = useState(() => new Set());
  const [loading, setLoading] = useState(false);
  const [acting, setActing] = useState(false);

  const loadPending = useCallback(async () => {
    setLoading(true);
    try {
      const r = await agentEdge("aws-discovery-approve", { action: "list", status: "pending" });
      setPending(r.candidates || []);
    } catch (e) { flash("Couldn't load queue: " + (e?.message || e)); }
    finally { setLoading(false); }
  }, [flash]);

  useEffect(() => { loadPending(); }, [loadPending]);

  async function runAngle() {
    setRunning(true); setSummary(null);
    try {
      const r = await agentEdge("aws-discovery", { target_cloud: cloud, angle, max: Number(max) || 8, mode: "run" });
      if (r.error) { flash("Agent: " + r.error); }
      else { setSummary(r.summary); flash(`Discovery (${CLOUD_LABEL[cloud] || cloud}): ${r.summary.inserted} new · ${r.summary.dup_company} already in CRM`); }
      await loadPending();
    } catch (e) { flash("Discovery failed: " + (e?.message || e)); }
    finally { setRunning(false); }
  }

  const toggle = (id) => setSel((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const allSel = pending.length > 0 && sel.size === pending.length;
  const toggleAll = () => setSel(allSel ? new Set() : new Set(pending.map((c) => c.id)));

  async function act(action) {
    const ids = [...sel];
    if (!ids.length) { flash("Select candidates first"); return; }
    setActing(true);
    try {
      const r = await agentEdge("aws-discovery-approve", { action, ids, project_id: projectId });
      if (action === "approve") flash(`Approved ${r.approved || 0} - added to Companies`);
      else flash(`Rejected ${r.rejected || ids.length}`);
      setSel(new Set());
      await loadPending();
      if (action === "approve" && onAfterApprove) onAfterApprove();
    } catch (e) { flash(action + " failed: " + (e?.message || e)); }
    finally { setActing(false); }
  }

  const cardSt = { background: C.panel, border: `1px solid ${C.line}`, borderRadius: 2, padding: 16, marginBottom: 14 };
  const lbl = { fontSize: 10, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: C.dim2, marginBottom: 8 };

  return (
    <div>
      <div style={cardSt}>
        <div style={lbl}>Run discovery - find Swedish companies on a cloud</div>
        <div style={{ fontSize: 12.5, color: C.dim, marginBottom: 14, lineHeight: 1.5, maxWidth: 660 }}>
          Pick a cloud and an angle. The agent web-searches for Swedish users of that cloud, verifies each domain
          (ASN + IP ranges), dedups against your CRM, and queues fresh finds below. GCP/Azure finds are migration
          prospects. Nothing is added to Companies until you approve.
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <select value={cloud} onChange={(e) => setCloud(e.target.value)} disabled={running}
            style={{ background: C.bg, border: `1px solid ${C.line2}`, borderRadius: 2, padding: "8px 12px", color: C.text, fontSize: 13, fontFamily: FONT_BODY }}>
            {DISCOVERY_CLOUDS.map((a) => <option key={a.key} value={a.key}>{a.label}</option>)}
          </select>
          <select value={angle} onChange={(e) => setAngle(e.target.value)} disabled={running}
            style={{ background: C.bg, border: `1px solid ${C.line2}`, borderRadius: 2, padding: "8px 12px", color: C.text, fontSize: 13, fontFamily: FONT_BODY }}>
            {DISCOVERY_ANGLES.map((a) => <option key={a.key} value={a.key}>{a.label}</option>)}
          </select>
          <input type="number" min={1} max={25} value={max} onChange={(e) => setMax(e.target.value)} disabled={running}
            style={{ width: 64, background: C.bg, border: `1px solid ${C.line2}`, borderRadius: 2, padding: "8px 10px", color: C.text, fontSize: 13, fontFamily: FONT_BODY }} />
          <Btn variant="primary" size="sm" onClick={runAngle} disabled={running}>
            {running ? <><Spinner size={13} /> Searching…</> : "Run discovery"}
          </Btn>
          {summary && <span style={{ fontSize: 12, color: C.dim2 }}>found {summary.agent_found} · {summary.inserted} new · {summary.dup_company} in CRM · {summary.cloud_verified} verified</span>}
        </div>
      </div>

      <div style={cardSt}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={lbl}>Review queue {pending.length ? `· ${pending.length} pending` : ""}</div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn size="sm" onClick={loadPending} disabled={loading}>{loading ? "…" : "Refresh"}</Btn>
            <Btn size="sm" onClick={() => act("reject")} disabled={acting || !sel.size}>Reject ({sel.size})</Btn>
            <Btn variant="primary" size="sm" onClick={() => act("approve")} disabled={acting || !sel.size}>Approve ({sel.size})</Btn>
          </div>
        </div>
        {pending.length === 0 ? (
          <div style={{ fontSize: 13, color: C.dim2, padding: "18px 0", textAlign: "center" }}>
            {loading ? "Loading…" : "No pending candidates. Pick a cloud + angle and run discovery above."}
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
            <thead>
              <tr style={{ textAlign: "left", color: C.dim2, fontSize: 10, textTransform: "uppercase", letterSpacing: ".08em" }}>
                <th style={{ padding: "6px 8px" }}><input type="checkbox" checked={allSel} onChange={toggleAll} /></th>
                <th style={{ padding: "6px 8px" }}>Company</th>
                <th style={{ padding: "6px 8px" }}>Domain</th>
                <th style={{ padding: "6px 8px" }}>AWS</th>
                <th style={{ padding: "6px 8px" }}>Evidence</th>
              </tr>
            </thead>
            <tbody>
              {pending.map((c) => {
                const b = cloudBadge(c);
                return (
                  <tr key={c.id} style={{ borderTop: `1px solid ${C.line}` }}>
                    <td style={{ padding: "8px" }}><input type="checkbox" checked={sel.has(c.id)} onChange={() => toggle(c.id)} /></td>
                    <td style={{ padding: "8px", color: C.text, fontWeight: 600 }}>
                      {c.name}{c.city ? <span style={{ color: C.dim2, fontWeight: 400 }}> · {c.city}</span> : ""}
                      {c.industry ? <div style={{ color: C.dim2, fontWeight: 400, fontSize: 11 }}>{c.industry}</div> : null}
                    </td>
                    <td style={{ padding: "8px", color: C.dim }}>{c.domain || "-"}</td>
                    <td style={{ padding: "8px" }}>
                      <span style={{ color: b.col, fontWeight: 600, fontSize: 11 }}>{b.txt}</span>
                      {Array.isArray(c.aws_services) && c.aws_services.length ? <div style={{ color: C.dim2, fontSize: 10 }}>{c.aws_services.join(", ")}</div> : null}
                    </td>
                    <td style={{ padding: "8px", color: C.dim, maxWidth: 320 }}>
                      <div style={{ lineHeight: 1.4 }}>{c.discovery_evidence || "-"}</div>
                      {Array.isArray(c.source_urls) && c.source_urls.length ? (
                        <a href={c.source_urls[0]} target="_blank" rel="noreferrer" style={{ color: C.accent, fontSize: 11 }}>source ↗</a>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function ImportView({ project, companies, contacts, onImport, onImportRows, flash, isAdmin }) {
  const aceReady = (companies || []).filter((c) => ["kvalificerad", "forslag"].includes(c.stage));
  const acePipe = (companies || []).filter((c) => ["kontaktad", "mote_bokat", "kvalificerad", "forslag"].includes(c.stage));
  function exportAce(list, tag) {
    if (!list.length) return;
    const csv = buildAceCsv(list, contacts, project.partner?.name);
    downloadCsv("ace-" + project.id + "-" + tag + ".csv", csv);
    flash && flash("ACE CSV exported - " + list.length + " opportunities");
  }
  return ImportViewBody({ project, onImport, onImportRows, aceReady, acePipe, exportAce, isAdmin });
}
function ImportViewBody({ project, onImport, onImportRows, aceReady, acePipe, exportAce, isAdmin }) {
  const [text, setText] = useState("");
  const fileRef = useRef();
  function onFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setText(String(r.result));
    r.readAsText(f);
  }
  return (
    <div>
      <RegistrySearch project={project} onImportRows={onImportRows} isAdmin={isAdmin} />
      <Section title={`Import to ${project.name}`} icon="download">
        <div style={{ background: C.amber + "14", border: `1px solid ${C.amber}40`, borderRadius: 2, padding: "12px 15px", marginBottom: 14, fontSize: 12.5, color: C.amber, lineHeight: 1.5 }}>
          The browser can't read .xlsx directly. Export your Excel list as <strong>CSV (UTF-8)</strong> and paste or upload it here. The importer recognizes the property, SaaS and AWS lead lists automatically.
        </div>
        <input ref={fileRef} type="file" accept=".csv,.tsv,.txt" onChange={onFile} style={{ display: "none" }} />
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <Btn variant="dark" onClick={() => fileRef.current?.click()}>📎 Choose CSV file</Btn>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="…or paste CSV/TSV here"
          rows={8}
          style={{ width: "100%", background: C.panel, border: `1px solid ${C.line2}`, borderRadius: 2, padding: "12px 14px", color: C.text, fontSize: 12.5, fontFamily: FONT_MONO, outline: "none", resize: "vertical", boxSizing: "border-box", marginBottom: 12 }}
        />
        <Btn variant="primary" onClick={() => onImport(text)} disabled={!text.trim()}>Import</Btn>
      </Section>

      <Section title="Export to AWS Partner Central (ACE)" icon="🚀">
        <div style={{ background: C.blue + "12", border: `1px solid ${C.blue}40`, borderRadius: 2, padding: "12px 15px", marginBottom: 14, fontSize: 12.5, color: C.blue, lineHeight: 1.55 }}>
          Generates an ACE bulk-import CSV from this project's pipeline. Open the official ACE template, paste the rows, and complete the pick-list fields (<strong>Industry vertical</strong>, <strong>Use case</strong>, <strong>Delivery model</strong>) and <strong>Estimated AWS MRR</strong> before upload. AWS recommends submitting opportunities at <strong>Qualified</strong> or higher.
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Btn variant="primary" onClick={() => exportAce(aceReady, "qualified")} disabled={!aceReady.length}>
            ⬇ Qualified+ ({aceReady.length})
          </Btn>
          <Btn variant="ghost" onClick={() => exportAce(acePipe, "pipeline")} disabled={!acePipe.length}>
            ⬇ All pipeline ({acePipe.length})
          </Btn>
        </div>
        <div style={{ marginTop: 10, fontSize: 11.5, color: C.dim2, lineHeight: 1.5 }}>
          Stage mapping → Contacted/Meeting&nbsp;booked = Prospect/Qualified · Qualified = Qualified · Proposal = Business&nbsp;Validation. Won/Lost are terminal and excluded.
        </div>
      </Section>
    </div>
  );
}

/* ============================================================================
   APPEN
   ============================================================================ */
function LoginScreen({ onAuthed }) {
  const [mode, setMode] = useState("password"); // password | magic
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");

  async function doPassword(signup) {
    setErr(""); setInfo(""); setBusy(true);
    try {
      const s = signup ? await Auth.signUpPassword(email.trim(), password) : await Auth.signInPassword(email.trim(), password);
      if (s) { await Auth.store(s); onAuthed(s); }
      else setInfo("Account created - check your email to confirm, then sign in.");
    } catch (e) { setErr(e.message || "Sign-in failed."); }
    finally { setBusy(false); }
  }
  async function doMagic() {
    setErr(""); setInfo(""); setBusy(true);
    try { await Auth.sendMagicLink(email.trim()); setInfo("Link sent - check your email and click to sign in."); }
    catch (e) { setErr(e.message || "Couldn't send link."); }
    finally { setBusy(false); }
  }
  const canSubmit = email.trim() && (mode === "magic" || password);
  const onKey = (e) => { if (e.key === "Enter" && canSubmit && !busy) (mode === "magic" ? doMagic() : doPassword(false)); };
  const input = { width: "100%", background: C.bg, border: `1px solid ${C.line2}`, borderRadius: 2, padding: "11px 13px", color: C.text, fontSize: 14, fontFamily: FONT_BODY, outline: "none", boxSizing: "border-box", marginBottom: 10 };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: FONT_BODY }}>
      <link rel="stylesheet" href={fontLink} />
      <style>{`@keyframes forjspin{to{transform:rotate(360deg)}} *:focus-visible{outline:2px solid #B83D0C!important;outline-offset:1px} ::selection{background:#B83D0C;color:#FDFAF5}`}</style>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7, marginBottom: 24 }}>
          <span style={{ fontFamily: FONT_HEAD, fontSize: 26, letterSpacing: ".24em", textTransform: "uppercase", color: C.ink, fontWeight: 700 }}>{BRAND}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ fontFamily: FONT_HEAD, fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: C.dim }}>by</span>
            <ForjLogo height={15} color={C.ink} />
          </div>
          <div style={{ fontSize: 12.5, color: C.dim, marginTop: 3, letterSpacing: ".02em" }}>{SLOGAN}</div>
        </div>
        <div style={{ background: C.cream, border: `1px solid ${C.line}`, borderRadius: 4, padding: 26 }}>
          <div style={{ fontSize: 19, fontFamily: FONT_DISPLAY, color: C.text, marginBottom: 20 }}>Sign in</div>

          <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
            {[["password", "Password"], ["magic", "Magic link"]].map(([k, l]) => (
              <button key={k} onClick={() => { setMode(k); setErr(""); setInfo(""); }} style={{
                flex: 1, background: mode === k ? C.ink : "transparent", color: mode === k ? C.cream : C.dim,
                border: `1px solid ${mode === k ? C.ink : C.line2}`, borderRadius: 2, padding: "8px 0", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: FONT_BODY,
              }}>{l}</button>
            ))}
          </div>

          <input style={input} type="email" placeholder="namn@forj.se" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={onKey} autoFocus />
          {mode === "password" && (
            <input style={input} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={onKey} />
          )}

          {err && <div style={{ fontSize: 12.5, color: C.red, marginBottom: 10 }}>{err}</div>}
          {info && <div style={{ fontSize: 12.5, color: C.text, marginBottom: 10, lineHeight: 1.5 }}>{info}</div>}

          {mode === "password" ? (
            <>
              <Btn variant="primary" full onClick={() => doPassword(false)} disabled={busy || !canSubmit}>{busy ? "…" : "Sign in"}</Btn>
              <button onClick={() => !busy && canSubmit && doPassword(true)} disabled={busy || !canSubmit} style={{ width: "100%", background: "transparent", border: "none", color: C.dim, fontSize: 12, cursor: busy || !canSubmit ? "not-allowed" : "pointer", fontFamily: FONT_BODY, textDecoration: "underline", marginTop: 10, padding: 0 }}>Create account with this password</button>
            </>
          ) : (
            <Btn variant="primary" full onClick={doMagic} disabled={busy || !email.trim()}>{busy ? "…" : "Send sign-in link"}</Btn>
          )}
        </div>
        <div style={{ textAlign: "center", fontSize: 11, color: C.dim2, marginTop: 14 }}>Invite-only · data secured in Supabase</div>
      </div>
    </div>
  );
}

function PasswordModal({ session, onClose, flash }) {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  async function save() {
    setErr("");
    if (pw.length < 8) { setErr("Use at least 8 characters."); return; }
    if (pw !== pw2) { setErr("Passwords don't match."); return; }
    setBusy(true);
    try {
      await Auth.updatePassword(session.access_token, pw);
      flash("Password updated - use it next time you sign in");
      onClose();
    } catch (e) { setErr(e?.message || "Couldn't update password."); }
    finally { setBusy(false); }
  }
  const field = { width: "100%", background: C.bg, border: `1px solid ${C.line2}`, borderRadius: 2, padding: "10px 12px", color: C.text, fontSize: 13.5, fontFamily: FONT_BODY, outline: "none", boxSizing: "border-box", marginBottom: 12 };
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(20,19,16,0.55)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "10vh 20px" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 420, background: C.cream, border: `1px solid ${C.line}`, borderRadius: 4, padding: 24, fontFamily: FONT_BODY }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 400, color: C.text, fontFamily: FONT_DISPLAY }}>Set a new password</h2>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: C.dim, fontSize: 22, cursor: "pointer", lineHeight: 1, padding: 0 }}>×</button>
        </div>
        <div style={{ fontSize: 12.5, color: C.dim, marginBottom: 18 }}>Signed in as {session.email || "your account"}. Choose a new password - it replaces the old one immediately.</div>
        <input style={field} type="password" placeholder="New password (min 8 chars)" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus />
        <input style={field} type="password" placeholder="Repeat new password" value={pw2} onChange={(e) => setPw2(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") save(); }} />
        {err && <div style={{ fontSize: 12.5, color: C.red, marginBottom: 10 }}>{err}</div>}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" onClick={save} disabled={busy || !pw || !pw2}>{busy ? "Saving…" : "Save password"}</Btn>
        </div>
      </div>
    </div>
  );
}

function PartnerEditor({ project, onClose, onSave }) {
  const p0 = project.partner || {};
  const [name, setName] = useState(p0.name || project.name || "");
  const [domain, setDomain] = useState(p0.domain || "");
  const [brief, setBrief] = useState(p0.brief || "");
  const [busy, setBusy] = useState(false);
  const [rawNotes, setRawNotes] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [aiErr, setAiErr] = useState("");
  async function save() {
    setBusy(true);
    try { await onSave({ name: name.trim(), domain: domain.trim(), brief: brief.trim() }); }
    finally { setBusy(false); }
  }
  async function aiRefine() {
    setAiErr(""); setAiBusy(true);
    try {
      const text = await callClaude({
        task: "brief_refine",
        user:
          "PARTNER: " + (name || "") + "\n" +
          "DOMAIN/LINKS: " + (domain || "") + "\n\n" +
          "CURRENT BRIEF:\n" + (brief || "(empty)") + "\n\n" +
          "NEW RAW NOTES / NEWS (Slack, email, scribbles):\n" + (rawNotes || "(none)") + "\n\n" +
          "Task: merge the current brief with the new notes into ONE updated, tight brief in English. Keep still-valid facts, weave in the new info, remove duplicates and fluff. Cover: what the partner sells & delivers, packages/Fast Tracks, AWS tier & competencies/status, funding, edge/ICP, sales angle, and what they should NOT pitch. Max ~180 words. Respond with ONLY the brief text - no heading, no explanation.",
        maxTokens: 1200,
      });
      const clean = (text || "").trim();
      if (clean) { setBrief(clean); setRawNotes(""); }
      else setAiErr("Empty response - try again.");
    } catch (e) { setAiErr(e?.message || "AI request failed."); }
    finally { setAiBusy(false); }
  }
  const field = { width: "100%", background: C.bg, border: `1px solid ${C.line2}`, borderRadius: 2, padding: "10px 12px", color: C.text, fontSize: 13.5, fontFamily: FONT_BODY, outline: "none", boxSizing: "border-box" };
  const label = { fontSize: 10, fontWeight: 500, letterSpacing: ".12em", textTransform: "uppercase", color: C.dim2, marginBottom: 6, display: "block" };
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(20,19,16,0.55)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "6vh 20px", overflowY: "auto" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 600, background: C.cream, border: `1px solid ${C.line}`, borderRadius: 4, padding: 24, fontFamily: FONT_BODY }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 400, color: C.text, fontFamily: FONT_DISPLAY }}>Partner context - {project.name}</h2>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: C.dim, fontSize: 22, cursor: "pointer", lineHeight: 1, padding: 0 }}>×</button>
        </div>
        <div style={{ fontSize: 12.5, color: C.dim, marginBottom: 18, lineHeight: 1.5 }}>Fed into the lead analysis as "PARTNER (who we sell for)". Describe what the partner sells, AWS status, edge/ICP, sales angle - and what they should NOT be positioned on. The AI also web-searches the domain/links.</div>

        <label style={label}>Partner name</label>
        <input style={{ ...field, marginBottom: 14 }} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Alto" />

        <label style={label}>Domain / links</label>
        <input style={{ ...field, marginBottom: 14 }} value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="e.g. alto.se, quattro-by-alto.netlify.app" />

        <label style={label}>Raw notes / news (optional)</label>
        <textarea style={{ ...field, minHeight: 90, resize: "vertical", lineHeight: 1.5, marginBottom: 8 }} value={rawNotes} onChange={(e) => setRawNotes(e.target.value)} placeholder="Paste a Slack thread, an email or rough notes - Claude distills it into the brief below." />
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <Btn variant="ghost" size="sm" onClick={aiRefine} disabled={aiBusy || (!rawNotes.trim() && !brief.trim())}>{aiBusy ? "Structuring…" : "Structure into brief with AI"}</Btn>
          {aiBusy && <Spinner size={14} />}
          {aiErr && <span style={{ fontSize: 12, color: C.red }}>{aiErr}</span>}
        </div>

        <label style={label}>Brief - what the partner sells & delivers</label>
        <textarea style={{ ...field, minHeight: 220, resize: "vertical", lineHeight: 1.55 }} value={brief} onChange={(e) => setBrief(e.target.value)} placeholder="What they do, packages/Fast Tracks, AWS tier & competencies, edge/ICP, sales angle, and what they should NOT pitch…" />

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" onClick={save} disabled={busy || !name.trim()}>{busy ? "Saving…" : "Save"}</Btn>
        </div>
      </div>
    </div>
  );
}

function AccessPanel({ projects, onClose, flash }) {
  const [pid, setPid] = useState(projects[0]?.id || "");
  const [members, setMembers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [busy, setBusy] = useState(false);
  const [link, setLink] = useState("");
  async function load() {
    try { const [m, i] = await Promise.all([db.listMembers(), db.listInvites()]); setMembers(m || []); setInvites(i || []); }
    catch (e) { flash("Couldn't load access: " + (e?.message || e)); }
  }
  useEffect(() => { load(); }, []);
  const projName = (id) => projects.find((p) => p.id === id)?.name || id;
  const myMembers = members.filter((m) => m.project_id === pid);
  const myInvites = invites.filter((i) => i.project_id === pid && !i.revoked && !i.used_at);
  async function genLink() {
    setBusy(true); setLink("");
    try {
      const token = (crypto.randomUUID() + crypto.randomUUID()).replace(/-/g, "");
      await db.createInvite({ token, project_id: pid, role });
      setLink(window.location.origin + "/?invite=" + token);
      await load();
    } catch (e) { flash("Couldn't create link: " + (e?.message || e)); } finally { setBusy(false); }
  }
  async function assign() {
    const em = email.trim(); if (!em) return; setBusy(true);
    try {
      const uid = await db.userIdByEmail(em);
      if (!uid) { flash("No account with that email yet - send them an invite link instead."); return; }
      await db.addMember(pid, uid, em, role); setEmail(""); await load(); flash("Added " + em + " to " + projName(pid) + " as " + role);
    } catch (e) { flash("Couldn't assign: " + (e?.message || e)); } finally { setBusy(false); }
  }
  async function remove(m) {
    if (!confirm("Remove " + (m.email || m.user_id) + " from " + projName(m.project_id) + "?")) return;
    try { await db.removeMember(m.project_id, m.user_id); await load(); } catch (e) { flash("Couldn't remove: " + (e?.message || e)); }
  }
  async function revoke(tok) {
    try { await db.revokeInvite(tok); await load(); } catch (e) { flash("Couldn't revoke: " + (e?.message || e)); }
  }
  async function copy(text) { try { await navigator.clipboard.writeText(text); flash("Link copied"); } catch { flash("Copy failed"); } }
  const field = { width: "100%", background: C.bg, border: `1px solid ${C.line2}`, borderRadius: 2, padding: "10px 12px", color: C.text, fontSize: 13.5, fontFamily: FONT_BODY, outline: "none", boxSizing: "border-box" };
  const lbl = { fontSize: 10, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", color: C.dim2, marginBottom: 8, display: "block" };
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(20,19,16,0.55)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "6vh 20px", overflowY: "auto" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 560, background: C.cream, border: `1px solid ${C.line}`, borderRadius: 4, padding: 24, fontFamily: FONT_BODY }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 400, color: C.text, fontFamily: FONT_DISPLAY }}>Project access</h2>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: C.dim, fontSize: 22, cursor: "pointer", lineHeight: 1, padding: 0 }}>×</button>
        </div>
        <div style={{ fontSize: 12.5, color: C.dim, marginBottom: 18 }}>Assign people to a project by email, or share an invite link. Members see only the projects they're added to; you (admin) see everything.</div>

        <label style={lbl}>Project</label>
        <select value={pid} onChange={(e) => { setPid(e.target.value); setLink(""); }} style={{ ...field, marginBottom: 18 }}>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>

        <label style={lbl}>Role</label>
        <select value={role} onChange={(e) => { setRole(e.target.value); setLink(""); }} style={{ ...field, marginBottom: 6 }}>
          <option value="member">Member - full operator access (your team)</option>
          <option value="stakeholder">Stakeholder - read-only curated portal (Novalo / Alto)</option>
        </select>
        <div style={{ fontSize: 11.5, color: C.dim2, marginBottom: 18 }}>{role === "stakeholder" ? "Stakeholders see only qualified opportunities, meetings and funding - contacts and notes are hidden." : "Members work the full CRM for this project."}</div>

        <label style={lbl}>Members</label>
        <div style={{ marginBottom: 8 }}>
          {myMembers.length === 0 && <div style={{ fontSize: 12.5, color: C.dim2 }}>No members yet (besides you).</div>}
          {myMembers.map((m) => (
            <div key={m.user_id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${C.line}` }}>
              <span style={{ fontSize: 13, color: C.text }}>{m.email || m.user_id} {m.role === "stakeholder" && <Pill color={C.blue}>stakeholder</Pill>}</span>
              <button onClick={() => remove(m)} style={{ background: "transparent", border: "none", color: C.red, fontSize: 12, cursor: "pointer", fontFamily: FONT_BODY }}>Remove</button>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <input style={{ ...field, flex: 1 }} type="email" placeholder="person@company.com" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") assign(); }} />
          <Btn variant="dark" size="sm" onClick={assign} disabled={busy || !email.trim()}>Add</Btn>
        </div>

        <label style={lbl}>Invite link</label>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
          <Btn variant="primary" size="sm" onClick={genLink} disabled={busy}>{busy ? "…" : "Generate invite link"}</Btn>
          <span style={{ fontSize: 11.5, color: C.dim2 }}>Anyone who opens it and signs up joins {projName(pid)}.</span>
        </div>
        {link && (
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <input readOnly value={link} style={{ ...field, flex: 1, fontFamily: FONT_MONO, fontSize: 12 }} onFocus={(e) => e.target.select()} />
            <Btn variant="ghost" size="sm" onClick={() => copy(link)}>Copy</Btn>
          </div>
        )}
        {myInvites.length > 0 && (
          <div>
            <div style={{ fontSize: 11, color: C.dim2, marginBottom: 6 }}>Active links</div>
            {myInvites.map((i) => (
              <div key={i.token} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.line}`, gap: 10 }}>
                <span style={{ fontSize: 11.5, color: C.dim, fontFamily: FONT_MONO, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>…/?invite={i.token.slice(0, 12)}…</span>
                <button onClick={() => copy(window.location.origin + "/?invite=" + i.token)} style={{ background: "transparent", border: "none", color: C.blue, fontSize: 12, cursor: "pointer", fontFamily: FONT_BODY }}>Copy</button>
                <button onClick={() => revoke(i.token)} style={{ background: "transparent", border: "none", color: C.red, fontSize: 12, cursor: "pointer", fontFamily: FONT_BODY }}>Revoke</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PartnerPortal({ project, onSignOut }) {
  const [opps, setOpps] = useState(null);
  const [funding, setFunding] = useState([]);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [o, f] = await Promise.all([db.partnerOpportunities(project.id), db.partnerFunding(project.id)]);
        if (!alive) return;
        setOpps(Array.isArray(o) ? o : []);
        setFunding(Array.isArray(f) ? f : []);
      } catch { if (alive) setOpps([]); }
    })();
    return () => { alive = false; };
  }, [project.id]);

  const partnerName = project.partner?.name || project.name;
  const sectionH = { margin: "0 0 12px", fontSize: 12, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: C.dim, fontFamily: FONT_BODY };
  const fundingByCompany = {};
  funding.forEach((f) => { const k = f.company || "-"; (fundingByCompany[k] = fundingByCompany[k] || []).push(f); });
  const list = opps || [];
  const isAws = (o) => o.aws_detected || o.cloud_provider === "aws";
  const awsList = list.filter(isAws);
  const otherList = list.filter((o) => !isAws(o));
  const dealValue = list.reduce((s, o) => s + (Number(o.opp_value) || 0), 0);
  const cash = funding.filter((f) => f.funding_type !== "credits").reduce((s, f) => s + (Number(f.amount) || 0), 0);
  const credits = funding.filter((f) => f.funding_type !== "cash").reduce((s, f) => s + (Number(f.amount) || 0), 0);
  const meetings = list.filter((o) => o.stage === "mote_bokat").length;
  const won = list.filter((o) => o.stage === "vunnen").length;
  const actions = [];
  list.forEach((o) => {
    if (o.stage === "mote_bokat") actions.push({ co: o.name, tag: "Meeting", detail: o.meeting_date ? `Meeting booked for ${o.meeting_date} - join to support the technical conversation.` : "Meeting booked - join to support the technical conversation." });
    else if (o.stage === "forslag") actions.push({ co: o.name, tag: "Proposal", detail: "Proposal out - your technical sign-off or a customer quote may be needed." });
  });
  funding.forEach((f) => {
    actions.push({ co: f.company || partnerName, tag: f.program + (f.program === "MAP" && f.phase ? " · " + f.phase : ""), detail: `AWS funding ${f.stage || "in progress"}${f.status ? " · " + f.status : ""} - confirm eligibility / paperwork on your side.` });
  });
  const topActions = actions.slice(0, 8);

  const Kpi = ({ label, value, color }) => (
    <div style={{ flex: 1, minWidth: 124, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 2, padding: "15px 18px" }}>
      <div style={{ fontSize: 11.5, color: C.dim, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 23, fontWeight: 400, color: color || C.text, fontFamily: FONT_DISPLAY }}>{value}</div>
    </div>
  );

  const OppCard = ({ o }) => {
    const progs = fundingByCompany[o.name] || [];
    const m = cloudMeta(o);
    const hl = m ? m.color : C.line2;
    const cs = Array.isArray(o.contacts) ? o.contacts.filter((c) => c.name) : [];
    return (
      <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderLeft: `3px solid ${hl}`, borderRadius: 2, padding: "16px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap", marginBottom: 5 }}>
          <span style={{ fontSize: 17, fontWeight: 400, color: C.text, fontFamily: FONT_DISPLAY }}>{o.name}</span>
          {o.is_hot && <Pill color={C.accent}><span title="Earmarked by Forj as a low-hanging-fruit / hot account">Hot</span></Pill>}
          {m && <CloudChip company={o} />}
          <Pill color={STATUS_COLOR[o.stage]} bg={C.panel2}><Dot color={STATUS_COLOR[o.stage]} />{STAGE_LABEL[o.stage]}</Pill>
          {o.opp_value ? <Pill color={C.dim}>{fmtSEK(o.opp_value)}</Pill> : null}
        </div>
        <div style={{ fontSize: 12, color: C.dim, marginBottom: o.meeting_date || o.angle || o.about ? 9 : 0 }}>
          {[o.city, o.industry, o.employees ? o.employees + " employees" : ""].filter(Boolean).join(" · ")}
        </div>
        {o.meeting_date && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: C.accent, marginBottom: 10 }}>
            <Icon name="calendar" size={13} color={C.accent} /> Meeting booked · {o.meeting_date}
          </div>
        )}
        {o.angle && (
          <div style={{ marginBottom: o.about || cs.length ? 9 : 0 }}>
            <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: C.dim2, marginRight: 7 }}>Forj's take</span>
            <span style={{ fontSize: 13, color: C.text, lineHeight: 1.55 }}>{o.angle}</span>
          </div>
        )}
        {o.about && <div style={{ fontSize: 12, color: C.dim, lineHeight: 1.5, marginBottom: cs.length ? 9 : 0 }}>{o.about}</div>}
        {cs.length > 0 && (
          <div style={{ fontSize: 12, color: C.dim, marginBottom: 10 }}>
            <span style={{ fontWeight: 600 }}>Decision-makers: </span>
            {cs.slice(0, 6).map((c, i) => <span key={i}>{c.name}{c.title ? ` - ${c.title}` : ""}{i < Math.min(cs.length, 6) - 1 ? " · " : ""}</span>)}
            {cs.length > 6 ? ` +${cs.length - 6}` : ""}
          </div>
        )}
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", alignItems: "center" }}>
          {progs.map((f, i) => <Pill key={i} color={JOURNEY_COLOR[FUNDING_PROGRAMS[f.program]?.journey] || C.blue}>{f.program}{f.program === "MAP" && f.phase ? ` · ${f.phase}` : ""}</Pill>)}
          <span style={{ flex: 1 }} />
          {o.owner && <span style={{ fontSize: 11.5, color: C.dim2 }}>Forj: {String(o.owner).split("@")[0]}</span>}
        </div>
      </div>
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: FONT_BODY }}>
      <link rel="stylesheet" href={fontLink} />
      <style>{`@keyframes forjspin{to{transform:rotate(360deg)}} *:focus-visible{outline:2px solid #B83D0C!important;outline-offset:1px} ::selection{background:#B83D0C;color:#FDFAF5}`}</style>
      <div style={{ borderBottom: `1px solid ${C.line}`, background: `linear-gradient(180deg, ${C.cream} 0%, ${C.bg} 100%)` }}>
        <div style={{ maxWidth: 940, margin: "0 auto", padding: "16px 18px", display: "flex", alignItems: "center", gap: 14 }}>
          <ForjLogo height={24} color={C.text} />
          <div style={{ width: 1, height: 22, background: C.line }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{partnerName}</div>
            <div style={{ fontSize: 11, color: C.dim2 }}>AWS pipeline - engineered by Forj</div>
          </div>
          <button onClick={onSignOut} style={{ background: "transparent", border: `1px solid ${C.line2}`, color: C.dim, borderRadius: 2, padding: "7px 13px", fontSize: 12, cursor: "pointer", fontFamily: FONT_BODY }}>Sign out</button>
        </div>
      </div>

      <div style={{ maxWidth: 940, margin: "0 auto", padding: "26px 18px 64px" }}>
        {opps === null ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><Spinner size={22} /></div>
        ) : (
          <>
            <h1 style={{ margin: "0 0 6px", fontSize: 28, fontWeight: 400, color: C.text, fontFamily: FONT_DISPLAY }}>Your AWS pipeline</h1>
            <div style={{ fontSize: 13.5, color: C.dim, marginBottom: 24, lineHeight: 1.5, maxWidth: 620 }}>A live, curated view of the accounts, booked meetings and AWS funding Forj is building for {partnerName} - refreshed continuously as the work moves.</div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
              <Kpi label="On AWS" value={awsList.length} color={C.accent} />
              <Kpi label="Meetings booked" value={meetings} color={C.text} />
              <Kpi label="Accounts in play" value={list.length} color={C.text} />
              <Kpi label="Won" value={won} color={C.green} />
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 30 }}>
              <Kpi label="Pipeline value" value={fmtSEK(dealValue)} color={C.text} />
              <Kpi label="AWS funding - cash" value={fmtMoney(cash, "USD")} color={C.accent} />
              <Kpi label="AWS funding - credits" value={fmtMoney(credits, "USD")} color={C.blue} />
            </div>

            {topActions.length > 0 && (
              <div style={{ marginBottom: 30 }}>
                <h2 style={sectionH}>Action needed from you</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {topActions.map((a, i) => (
                    <div key={i} style={{ background: C.panel, border: `1px solid ${C.line}`, borderLeft: `3px solid ${C.accent}`, borderRadius: 2, padding: "12px 15px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                      <Pill color={C.accent}>{a.tag}</Pill>
                      <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{a.co}</span>
                      <span style={{ flex: 1, minWidth: 180, fontSize: 12.5, color: C.dim }}>{a.detail}</span>
                    </div>
                  ))}
                </div>
                {actions.length > topActions.length && <div style={{ fontSize: 11.5, color: C.dim2, marginTop: 8 }}>+{actions.length - topActions.length} more in the pipeline below.</div>}
              </div>
            )}

            <div style={{ marginBottom: 30 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 12 }}>
                <h2 style={{ ...sectionH, margin: 0, color: C.accent }}>AWS Hit-list</h2>
                <span style={{ fontSize: 12, color: C.dim2 }}>{awsList.length} AWS account{awsList.length === 1 ? "" : "s"} - your low-hanging fruit</span>
              </div>
              {awsList.length === 0 ? (
                <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 2, padding: 22, fontSize: 13, color: C.dim2 }}>No AWS-confirmed accounts yet. Forj is verifying infrastructure across the target list - accounts confirmed on AWS will surface here with their AWS marking.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {awsList.map((o) => <OppCard key={o.id} o={o} />)}
                </div>
              )}
            </div>

            {otherList.length > 0 && (
              <div style={{ marginBottom: 30 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 12 }}>
                  <h2 style={{ ...sectionH, margin: 0 }}>Wider pipeline</h2>
                  <span style={{ fontSize: 12, color: C.dim2 }}>GCP / Azure / other - migration & displacement targets</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {otherList.map((o) => <OppCard key={o.id} o={o} />)}
                </div>
              </div>
            )}

            {funding.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <h2 style={sectionH}>AWS funding in motion</h2>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {FUNDING_JOURNEY.map((phase) => {
                    const fl = funding.filter((f) => FUNDING_PROGRAMS[f.program]?.journey === phase);
                    const amt = fl.reduce((s, f) => s + (Number(f.amount) || 0), 0);
                    return (
                      <div key={phase} style={{ flex: 1, minWidth: 160, background: C.panel, border: `1px solid ${C.line}`, borderLeft: `3px solid ${JOURNEY_COLOR[phase]}`, borderRadius: 2, padding: "13px 15px" }}>
                        <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: JOURNEY_COLOR[phase], marginBottom: 6 }}>{phase}</div>
                        <div style={{ fontSize: 13, color: C.text }}>{fl.length} {fl.length === 1 ? "program" : "programs"}{amt ? ` · ${fmtMoney(amt, "USD")}` : ""}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div style={{ fontSize: 11, color: C.dim2, marginTop: 26, lineHeight: 1.5 }}>Curated view, prepared by Forj. Contact phone and email are managed privately by Forj. Funding figures are planning estimates - AWS determines final eligibility and amounts.</div>
          </>
        )}
      </div>
    </div>
  );
}

export default function Forge() {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState(DEFAULT_PROJECTS);
  const [activeProject, setActiveProject] = useState("alto");
  const [editingPartner, setEditingPartner] = useState(false);
  const [editingPw, setEditingPw] = useState(false);
  const [awsBatch, setAwsBatch] = useState(null);
  const [domainBatch, setDomainBatch] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [activities, setActivities] = useState([]);
  const [fundings, setFundings] = useState([]);
  const [nav, setNav] = useState("dashboard"); // dashboard | today | hot | list | pipeline | import
  const [playFilter, setPlayFilter] = useState(null); // when a dashboard play tile is clicked -> filter the list
  const [autoEnrich, setAutoEnrich] = useState(false);
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("all");
  const [toast, setToast] = useState(null);
  const [session, setSession] = useState(undefined); // undefined = checking, null = logged out, object = authed
  const [isAdmin, setIsAdmin] = useState(false);
  const [myRole, setMyRole] = useState(null);
  const [editingAccess, setEditingAccess] = useState(false);

  // Auth init: magic-link tokens in URL hash win; else restore stored session; refresh if expired.
  useEffect(() => {
    (async () => {
      try {
        try {
          const qp = new URLSearchParams(window.location.search);
          const inv = qp.get("invite");
          if (inv) { await _write(PENDING_INVITE_KEY, inv); const u = new URL(window.location.href); u.searchParams.delete("invite"); history.replaceState(null, "", u.pathname + u.search + u.hash); }
        } catch {}
        const fromHash = Auth.parseHash();
        if (fromHash) { await Auth.store(fromHash); setSession(fromHash); return; }
        const stored = await Auth.load();
        if (!stored) { setSession(null); return; }
        if (stored.expires_at && stored.expires_at < Date.now() + 60000) {
          if (stored.refresh_token) {
            try { const r = await Auth.refresh(stored.refresh_token); if (r) { await Auth.store(r); setSession(r); return; } } catch {}
          }
          await Auth.clear(); setSession(null); return;
        }
        setSession(stored);
      } catch { setSession(null); }
    })();
  }, []);

  // Keep the data layer authenticated as the current user; refresh before token expiry.
  useEffect(() => {
    if (!session) { setAuthToken(null); return; }
    setAuthToken(session.access_token);
    if (!session.expires_at || !session.refresh_token) return;
    const delay = Math.max(5000, session.expires_at - Date.now() - 120000);
    const t = setTimeout(async () => {
      try { const r = await Auth.refresh(session.refresh_token); if (r) { await Auth.store(r); setSession(r); } } catch {}
    }, delay);
    return () => clearTimeout(t);
  }, [session]);

  // Resolve the signed-in user's role for the active project (stakeholder → read-only portal)
  useEffect(() => {
    if (!session) { setMyRole(null); return; }
    if (isAdmin) { setMyRole("admin"); return; }
    if (!activeProject) return;
    let alive = true;
    db.myRole(activeProject).then((r) => { if (alive) setMyRole(r || "member"); }).catch(() => { if (alive) setMyRole("member"); });
    return () => { alive = false; };
  }, [session, isAdmin, activeProject]);

  async function signOut() {
    await Auth.clear();
    setSession(null);
    setSelected(null);
    setNav("dashboard");
  }

  async function savePartner(patch) {
    try {
      await db.updateProject(activeProject, { partner: patch });
      setProjects((ps) => ps.map((p) => (p.id === activeProject ? { ...p, partner: { ...(p.partner || {}), ...patch } } : p)));
      setEditingPartner(false);
      flash("Partner context saved");
    } catch (e) {
      flash("Couldn't save: " + (e?.message || e));
    }
  }

  useEffect(() => {
    if (session === undefined) return;
    if (!session) { setLoading(false); return; }
    (async () => {
      setAuthToken(session.access_token);
      setLoading(true);
      let admin = false;
      try { admin = await db.isAdmin(); } catch {}
      setIsAdmin(admin);
      // Seed + one-time pipeline patches removed; initial data lives in Supabase and any
      // backfill is a separate one-time SQL migration (kept out of the shipped client).

      const [p, c, ct, a] = await Promise.all([db.allProjects(), db.allCompanies(), db.allContacts(), db.allActivities()]);
      let visible = p;
      if (!admin) {
        const ids = await db.myProjectIds().catch(() => []);
        visible = p.filter((pr) => ids.includes(pr.id));
      }
      setProjects(visible); setCompanies(c); setContacts(ct); setActivities(a);
      db.allFundings().then(setFundings).catch(() => {});
      setActiveProject((cur) => (visible.some((pr) => pr.id === cur) ? cur : (visible[0]?.id || cur)));

      try {
        const pend = await _read(PENDING_INVITE_KEY, null);
        if (pend) {
          await _write(PENDING_INVITE_KEY, null);
          const pidNew = await db.acceptInvite(pend);
          const [p2, c2, ct2, a2] = await Promise.all([db.allProjects(), db.allCompanies(), db.allContacts(), db.allActivities()]);
          let vis2 = p2;
          if (!admin) { const ids2 = await db.myProjectIds().catch(() => []); vis2 = p2.filter((pr) => ids2.includes(pr.id)); }
          setProjects(vis2); setCompanies(c2); setContacts(ct2); setActivities(a2);
          db.allFundings().then(setFundings).catch(() => {});
          if (pidNew) setActiveProject(pidNew);
          flash("Added to project");
        }
      } catch (e) { /* invalid/expired invite */ }

      setLoading(false);
    })();
  }, [session]);

  const flash = useCallback((msg) => { setToast(msg); setTimeout(() => setToast(null), 2800); }, []);
  const project = projects.find((p) => p.id === activeProject) || projects[0];

  const enrichList = useCallback(async (list) => {
    const batch = list.slice(0, 25); // cap to protect API rate limits
    if (!batch.length) return;
    const applyPatch = async (id, patch) => {
      const merged = { ...patch, updated_at: now() };
      setCompanies((p) => p.map((x) => (x.id === id ? { ...x, ...merged } : x)));
      await db.updateCompany(id, merged);
    };
    flash(`Auto-enriching ${batch.length} ${batch.length === 1 ? "company" : "companies"} in the background…`);
    for (const c of batch) {
      let domain = c.domain;
      if (!domain) {
        try {
          const r = await resolveDomain(c);
          if (r && r.domain) {
            domain = r.domain;
            await applyPatch(c.id, { domain: r.domain, enrichment: { ...(c.enrichment || {}), domain_confidence: r.confidence, domain_evidence: r.evidence } });
          }
        } catch { /* skip */ }
        await new Promise((res) => setTimeout(res, 1200));
      }
      if (domain) {
        try {
          const a = await detectAws(domain);
          await applyPatch(c.id, { aws_detected: !!a.aws_detected, cloud_provider: a.provider || (a.aws_detected ? "aws" : "unknown"), email_provider: a.email_provider || null, aws_signals: (a.signals || []).join(", ") || (a.cdn ? "Behind " + a.cdn : "No major-cloud signal") });
        } catch { /* skip */ }
        await new Promise((res) => setTimeout(res, 700));
      }
    }
    flash("Auto-enrich done");
  }, [flash]);

  // Org-number search bar (dashboard). Existing customer -> open it. Otherwise pull from the
  // SCB registry, create a lead, open it, and auto-run cloud + funding scoring ($0, deterministic).
  const handleOrgLookup = useCallback(async (raw) => {
    const orgnr = normOrgnr(raw);
    if (orgnr.length < 10) { flash("Enter a 10-digit Swedish organisation number"); return { status: "notfound" }; }
    // 1) Already in the platform? (match on normalized orgnr, any project, skip archived)
    const hit = companies.find((c) => c.list_tag !== "archived_shell" && normOrgnr(c.orgnr) === orgnr);
    if (hit) { setNav("dashboard"); setSelected(hit.id); return { status: "existing", name: hit.name, id: hit.id }; }
    // 2) Pull from SCB registry
    let r;
    try { r = await orgLookup(orgnr); } catch (e) { flash("Registry lookup failed: " + (e?.message || e)); throw e; }
    if (!r) return { status: "notfound" };
    // 3) Create the lead
    const ts = now();
    const rec = {
      id: uid(), name: (r.name || "").trim(), orgnr: r.orgnr || orgnr, domain: "",
      city: r.city || "", county: r.county || "", country: r.country || "Sverige",
      industry: r.industry || "",
      employees: null, revenue_ksek: null, ceo: "", company_type: r.company_type || "",
      source: "SCB lookup", list_tag: "", stage: "lead", score: null, tier: "",
      aws_detected: false, aws_signals: "", next_action: "", notes: "",
      // industry_code is NOT a companies column - stash the SNI code in enrichment (jsonb) instead.
      enrichment: { description: "", lead_source: "Org-number search", opportunity: "", industry_code: r.industry_code || "" },
      techstack: null, techstack_at: null, leadanalysis: null, leadanalysis_at: null,
      created_at: ts, updated_at: ts, project_id: activeProject,
    };
    await db.bulkAddCompanies([rec]);
    setCompanies((p) => [rec, ...p]);
    setNav("dashboard"); setSelected(rec.id);
    flash(`Added ${rec.name} from SCB - finding website + scoring…`);
    // 4) Best-effort enrich in the background (find domain -> cloud -> funding). Never blocks the open.
    (async () => {
      try {
        const dom = await resolveDomain(rec).catch(() => null);
        if (dom?.domain) await updateCompany(rec.id, { domain: dom.domain });
        try { const cd = await detectAws(dom?.domain || rec.name); if (cd) await updateCompany(rec.id, { aws_detected: !!cd.aws_detected, cloud_provider: cd.provider || "unknown", aws_signals: (cd.signals || []).join(", ") }); } catch {}
        try { await scoreFundingFit(rec.id, true); } catch {}
      } catch {}
    })();
    return { status: "created", name: rec.name, id: rec.id };
    // NOTE: updateCompany is intentionally NOT in deps - it's defined later in this component,
    // and a dep-array reference would hit its temporal-dead-zone at render (white-screen crash).
    // It's only called inside the deferred IIFE above (runs on click, long after init) and is a
    // stable useCallback, so omitting it is safe.
  }, [companies, activeProject, flash]);

  const handleImport = useCallback(async (text) => {
    const { companies: newC, contacts: newCt } = parseToRecords(text, "import");
    if (!newC.length) { flash("No companies found - check the CSV format"); return; }
    newC.forEach((c) => (c.project_id = activeProject));
    const existing = new Set(companies.filter((c) => c.project_id === activeProject).map((c) => lc(c.name) + "|" + lc(c.orgnr)));
    const toAdd = newC.filter((c) => !existing.has(lc(c.name) + "|" + lc(c.orgnr)));
    const ids = new Set(toAdd.map((c) => c.id));
    const ctAdd = newCt.filter((ct) => ids.has(ct.company_id));
    await db.bulkAddCompanies(toAdd);
    await db.bulkAddContacts(ctAdd);
    setCompanies((p) => [...toAdd, ...p]);
    setContacts((p) => [...ctAdd, ...p]);
    const skipped = newC.length - toAdd.length;
    flash(`Imported ${toAdd.length} companies · ${ctAdd.length} contacts` + (skipped ? ` · ${skipped} duplicates` : ""));
    setNav("list");
    if (autoEnrich && toAdd.length) enrichList(toAdd);
  }, [companies, activeProject, flash, autoEnrich, enrichList]);

  const handleImportRows = useCallback(async (rows) => {
    const clean = (rows || []).filter((r) => r && (r.name || "").trim());
    if (!clean.length) { flash("Nothing selected to import"); return; }
    const ts = now();
    const recs = clean.map((r) => ({
      id: uid(),
      name: (r.name || "").trim(),
      orgnr: r.orgnr || "",
      domain: r.domain || "",
      city: r.city || "",
      county: r.county || "",
      country: r.country || "",
      industry: r.industry || "",
      employees: (r.employees === 0 || r.employees) ? Number(r.employees) : null,
      revenue_ksek: null,
      ceo: "",
      company_type: r.company_type || "",
      source: r.source || "Registry",
      list_tag: "",
      stage: "lead",
      score: null,
      tier: "",
      aws_detected: false,
      aws_signals: "",
      next_action: "",
      notes: "",
      enrichment: { description: "", aws_value: "", research_notes: "", lead_source: r.source || "Registry", opportunity: "" },
      techstack: null, techstack_at: null, leadanalysis: null, leadanalysis_at: null,
      created_at: ts, updated_at: ts, project_id: activeProject,
    }));
    const existing = new Set(companies.filter((c) => c.project_id === activeProject).map((c) => lc(c.name) + "|" + lc(c.orgnr)));
    const seen = new Set();
    const toAdd = recs.filter((c) => {
      const k = lc(c.name) + "|" + lc(c.orgnr);
      if (existing.has(k) || seen.has(k)) return false;
      seen.add(k); return true;
    });
    if (!toAdd.length) { flash("All selected companies are already in this project"); return; }
    await db.bulkAddCompanies(toAdd);
    setCompanies((p) => [...toAdd, ...p]);
    const skipped = recs.length - toAdd.length;
    flash(`Imported ${toAdd.length} companies` + (skipped ? ` · ${skipped} duplicates skipped` : ""));
    setNav("list");
    if (autoEnrich && toAdd.length) enrichList(toAdd);
  }, [companies, activeProject, flash, autoEnrich, enrichList]);

  const updateCompany = useCallback(async (id, patch) => {
    const merged = { ...patch, updated_at: now() };
    setCompanies((p) => p.map((c) => (c.id === id ? { ...c, ...merged } : c)));
    await db.updateCompany(id, merged);
  }, []);
  const runAwsBatch = useCallback(async () => {
    const targets = companies.filter((c) => c.project_id === activeProject && c.list_tag !== "archived_shell" && c.domain && !c.cloud_provider);
    if (!targets.length) { flash("No companies to check - all already classified or lack a domain"); return; }
    setAwsBatch({ running: true, done: 0, total: targets.length, errors: 0, found: 0 });
    let done = 0, errors = 0, found = 0;
    for (const c of targets) {
      try {
        const r = await detectAws(c.domain);
        await updateCompany(c.id, { aws_detected: !!r.aws_detected, cloud_provider: r.provider || (r.aws_detected ? "aws" : "unknown"), email_provider: r.email_provider || null, aws_signals: (r.signals || []).join(", ") || (r.cdn ? "Behind " + r.cdn : "No major-cloud signal") });
        if (r.aws_detected) found++;
      } catch { errors++; }
      done++;
      setAwsBatch({ running: true, done, total: targets.length, errors, found });
      await new Promise((res) => setTimeout(res, 700));
    }
    setAwsBatch({ running: false, done, total: targets.length, errors, found });
    flash(`Cloud check done: ${found} on AWS, ${errors} errors of ${targets.length}`);
  }, [companies, activeProject, updateCompany, flash]);
  const runDomainBatch = useCallback(async () => {
    const targets = companies.filter((c) => c.project_id === activeProject && c.list_tag !== "archived_shell" && !c.domain);
    if (!targets.length) { flash("No companies need a domain - all in this project already have one"); return; }
    setDomainBatch({ running: true, done: 0, total: targets.length, found: 0, errors: 0 });
    let done = 0, found = 0, errors = 0;
    for (const c of targets) {
      let attempt = 0;
      while (attempt < 2) {
        try {
          const r = await resolveDomain(c);
          if (r.domain) { await updateCompany(c.id, { domain: r.domain, enrichment: { ...(c.enrichment || {}), domain_confidence: r.confidence, domain_evidence: r.evidence } }); found++; }
          break;
        } catch (e) {
          const msg = String(e?.message || e);
          if (attempt === 0 && /429|rate|overload|529|503/i.test(msg)) { await new Promise((res) => setTimeout(res, 9000)); attempt++; continue; }
          errors++; break;
        }
      }
      done++;
      setDomainBatch({ running: true, done, total: targets.length, found, errors });
      await new Promise((res) => setTimeout(res, 1500)); // gentle throttle to spare the proxy
    }
    setDomainBatch({ running: false, done, total: targets.length, found, errors });
    flash(`Domain lookup done: ${found} found, ${errors} errors of ${targets.length}`);
  }, [companies, activeProject, updateCompany, flash]);
  const moveStage = useCallback(async (id, stage) => {
    setCompanies((p) => p.map((c) => (c.id === id ? { ...c, stage, updated_at: now() } : c)));
    await db.updateCompany(id, { stage, updated_at: now() });
  }, []);
  const addActivity = useCallback(async (companyId, type, body) => {
    const act = { id: uid(), company_id: companyId, type, body, created_at: now() };
    await db.addActivity(act);
    setActivities((p) => [act, ...p]);
  }, []);
  const addFunding = useCallback(async (row) => {
    const f = { id: uid(), created_at: now(), updated_at: now(), currency: "USD", ...row };
    await db.addFunding(f);
    setFundings((p) => [f, ...p]);
    flash("Funding request added");
  }, [flash]);
  const updateFunding = useCallback(async (id, patch) => {
    const merged = { ...patch, updated_at: now() };
    setFundings((p) => p.map((x) => (x.id === id ? { ...x, ...merged } : x)));
    await db.updateFunding(id, merged);
  }, []);
  const logOutcome = useCallback(async (companyId, key, note) => {
    const o = OUTCOMES[key]; if (!o) return;
    const act = { id: uid(), company_id: companyId, type: o.type || "Call", body: o.act + (note ? " - " + note : ""), created_at: now() };
    await db.addActivity(act);
    setActivities((p) => [act, ...p]);
    const co = companies.find((c) => c.id === companyId);
    const patch = { next_action: o.next };
    if (o.clearDate) patch.next_action_at = null;
    else if (o.days != null) patch.next_action_at = dayStr(o.days);
    if (o.stage) {
      const order = ALL_STAGES.map((s) => s.key);
      const cur = co ? order.indexOf(co.stage) : -1;
      const tgt = order.indexOf(o.stage);
      if (o.always || tgt > cur) patch.stage = o.stage;
    }
    await updateCompany(companyId, patch);
    flash(o.label + " logged");
  }, [companies, updateCompany, flash]);
  const addContact = useCallback(async (companyId, suggestion) => {
    const parts = norm(suggestion.name).split(/\s+/);
    const c = { id: uid(), company_id: companyId, first_name: parts[0] || "", last_name: parts.slice(1).join(" "), title: suggestion.role || suggestion.title || "", email: suggestion.email || "", phone: suggestion.phone || "", linkedin: suggestion.linkedin || "", source: suggestion.source || "", status: "Not contacted" };
    await db.addContact(c);
    setContacts((p) => [c, ...p]);
    flash("Contact added");
  }, [flash]);
  const updateContact = useCallback(async (id, patch) => {
    setContacts((p) => p.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    await db.updateContact(id, patch);
  }, []);

  const selectedCompany = companies.find((c) => c.id === selected);

  // --- SMITH global launcher: reachable from any screen. Recs computed at App level so the
  // floating panel works on cards/lists/funding too, not just the dashboard. ---
  const [smithOpen, setSmithOpen] = useState(false);
  const [smithSeed, setSmithSeed] = useState(""); // text passed from the command bar's "Ask Smith"
  const [smithTracks, setSmithTracks] = useState({});
  useEffect(() => {
    let live = true;
    (async () => {
      try {
        if (typeof sb === "function") {
          const rows = await sb("funding_eligibility", { query: "?select=company_id,primary_track,confidence,fundability_score" });
          if (live && Array.isArray(rows)) { const m = {}; for (const r of rows) m[r.company_id] = r; setSmithTracks(m); }
        }
      } catch { /* empty -> launcher shows the "score first" empty state */ }
    })();
    return () => { live = false; };
  }, [companies.length]);
  const smithLauncherRecs = useMemo(() => {
    const pc = companies.filter((c) => c.project_id === activeProject && c.list_tag !== "archived_shell");
    const cset = new Set((contacts || []).map((x) => x.company_id));
    return smithRecommendations(pc, smithTracks, cset, activities);
  }, [companies, activeProject, contacts, smithTracks, activities]);
  const smithHour = new Date().getHours();
  const smithGreeting = smithHour < 5 ? "Working late" : smithHour < 11 ? "Good morning" : smithHour < 17 ? "Good afternoon" : "Good evening";

  const NAV = [
    { key: "dashboard", label: "Dashboard", icon: "chart" },
    { key: "today", label: "Today", icon: "phone" },
    { key: "hot", label: "Hot Leads", icon: "spark" },
    { key: "list", label: "Companies", icon: "layers" },
    { key: "pipeline", label: "Pipeline", icon: "trend" },
    { key: "funding", label: "Funding", icon: "tag" },
    { key: "discovery", label: "Cloud Discovery", icon: "spark" },
    { key: "import", label: "Import", icon: "download" },
  ];

  if (session === undefined) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <link rel="stylesheet" href={fontLink} />
        <style>{`@keyframes forjspin{to{transform:rotate(360deg)}} *:focus-visible{outline:2px solid #B83D0C!important;outline-offset:1px} ::selection{background:#B83D0C;color:#FDFAF5}`}</style>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7 }}>
          <span style={{ fontFamily: FONT_HEAD, fontSize: 28, letterSpacing: ".26em", textTransform: "uppercase", color: C.text, fontWeight: 700, paddingLeft: ".26em" }}>{BRAND}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ fontFamily: FONT_HEAD, fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: C.dim }}>by</span>
            <ForjLogo height={16} color={C.text} />
          </div>
          <div style={{ fontSize: 12.5, color: C.dim, marginTop: 4, letterSpacing: ".02em" }}>{SLOGAN}</div>
        </div>
        <Spinner size={22} />
      </div>
    );
  }
  if (session === null) {
    return <LoginScreen onAuthed={(s) => setSession(s)} />;
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <link rel="stylesheet" href={fontLink} />
        <style>{`@keyframes forjspin{to{transform:rotate(360deg)}} *:focus-visible{outline:2px solid #B83D0C!important;outline-offset:1px} ::selection{background:#B83D0C;color:#FDFAF5}`}</style>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7 }}>
          <span style={{ fontFamily: FONT_HEAD, fontSize: 28, letterSpacing: ".26em", textTransform: "uppercase", color: C.text, fontWeight: 700, paddingLeft: ".26em" }}>{BRAND}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ fontFamily: FONT_HEAD, fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: C.dim }}>by</span>
            <ForjLogo height={16} color={C.text} />
          </div>
          <div style={{ fontSize: 12.5, color: C.dim, marginTop: 4, letterSpacing: ".02em" }}>{SLOGAN}</div>
        </div>
        <Spinner size={22} />
      </div>
    );
  }

  // Role still resolving for a non-admin - avoid flashing the operator UI
  if (!isAdmin && myRole === null) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <link rel="stylesheet" href={fontLink} />
        <style>{`@keyframes forjspin{to{transform:rotate(360deg)}} *:focus-visible{outline:2px solid #B83D0C!important;outline-offset:1px} ::selection{background:#B83D0C;color:#FDFAF5}`}</style>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7 }}>
          <span style={{ fontFamily: FONT_HEAD, fontSize: 28, letterSpacing: ".26em", textTransform: "uppercase", color: C.text, fontWeight: 700, paddingLeft: ".26em" }}>{BRAND}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ fontFamily: FONT_HEAD, fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: C.dim }}>by</span>
            <ForjLogo height={16} color={C.text} />
          </div>
          <div style={{ fontSize: 12.5, color: C.dim, marginTop: 4, letterSpacing: ".02em" }}>{SLOGAN}</div>
        </div>
        <Spinner size={22} />
      </div>
    );
  }
  // Stakeholders (Novalo / Alto) get a curated, read-only portal - no operator chrome
  if (myRole === "stakeholder" && project) {
    return <PartnerPortal project={project} onSignOut={signOut} />;
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: FONT_BODY }}>
      <link rel="stylesheet" href={fontLink} />
      <style>{`@keyframes forjspin{to{transform:rotate(360deg)}} *:focus-visible{outline:2px solid #B83D0C!important;outline-offset:1px} ::selection{background:#B83D0C;color:#FDFAF5}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        *{scrollbar-width:thin;scrollbar-color:${C.line2} transparent}
        select option{background:${C.cream};color:${C.text}}
        ::selection{background:${C.accent};color:${C.cream}}
        @media(max-width:900px){.alloy-shell{grid-template-columns:1fr!important}.alloy-rail{position:static!important;height:auto!important;flex-direction:row!important;flex-wrap:wrap!important;align-items:center!important;gap:14px!important;overflow:visible!important}.alloy-rail nav{flex-direction:row!important;flex-wrap:wrap!important}.alloy-rail .rail-foot{margin:0!important}}`}</style>

      {editingPartner && <PartnerEditor project={project} onClose={() => setEditingPartner(false)} onSave={savePartner} />}
      {editingPw && session && <PasswordModal session={session} onClose={() => setEditingPw(false)} flash={flash} />}
      {editingAccess && <AccessPanel projects={projects} onClose={() => setEditingAccess(false)} flash={flash} />}

      <div className="alloy-shell" style={{ display: "grid", gridTemplateColumns: "232px 1fr", minHeight: "100vh" }}>

        {/* ===== RAIL (dark) ===== */}
        <aside className="alloy-rail" style={{ background: C.dark, borderRight: `1px solid ${C.darkRule}`, display: "flex", flexDirection: "column", padding: "24px 18px", position: "sticky", top: 0, height: "100vh", maxHeight: "100vh", boxSizing: "border-box", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }} title={BRAND_FULL}>
            <span style={{ fontFamily: FONT_HEAD, fontSize: 15, letterSpacing: ".2em", textTransform: "uppercase", color: "#F1ECE3", fontWeight: 700 }}>{BRAND}</span>
            <span style={{ fontFamily: FONT_HEAD, fontSize: 8.5, letterSpacing: ".18em", textTransform: "uppercase", color: C.darkLabel }}>by</span>
            <ForjLogo height={13} color={C.darkLabel} />
          </div>

          {/* project switcher */}
          <div style={{ marginTop: 26, border: `1px solid ${C.darkRule}`, flexShrink: 0 }}>
            {projects.map((p, i) => {
              const isA = p.id === activeProject;
              const cnt = companies.filter((c) => c.project_id === p.id && c.list_tag !== "archived_shell").length;
              return (
                <button key={p.id} onClick={() => { setActiveProject(p.id); setSelected(null); }} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", background: isA ? "#1E1C18" : "transparent", border: "none", borderTop: i === 0 ? "none" : `1px solid ${C.darkRule}`, padding: "11px 13px", color: isA ? "#F1ECE3" : C.darkText, fontSize: 13, fontFamily: FONT_BODY, cursor: "pointer", textAlign: "left" }}>
                  <span>{p.name}</span>
                  <span style={{ fontFamily: FONT_HEAD, fontSize: 10, color: isA ? C.accent : C.darkMuted }}>{cnt || "\u00b7"}</span>
                </button>
              );
            })}
          </div>

          {/* nav - the ONLY scrollable zone; foot stays pinned + clickable on any screen height */}
          <nav style={{ marginTop: 26, display: "flex", flexDirection: "column", flex: "1 1 auto", minHeight: 0, overflowY: "auto" }}>
            {NAV.map((n, i) => {
              const on = nav === n.key && !selectedCompany;
              return (
                <button key={n.key} onClick={() => { setNav(n.key); setSelected(null); }} style={{ display: "flex", alignItems: "center", gap: 10, background: "transparent", border: "none", borderTop: i === 0 ? `1px solid ${C.darkRule}` : "none", borderBottom: `1px solid ${C.darkRule}`, borderLeft: `2px solid ${on ? C.accent : "transparent"}`, padding: "11px 0 11px 12px", color: on ? "#F1ECE3" : C.darkMuted, fontFamily: FONT_HEAD, fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", cursor: "pointer", textAlign: "left", whiteSpace: "nowrap" }}>
                  <Icon name={n.icon} size={14} color={on ? C.accent : C.darkMuted} />{n.label}
                </button>
              );
            })}
          </nav>

          {/* account (foot) - pinned, never scrolls off screen */}
          <div className="rail-foot" style={{ flexShrink: 0, marginTop: 14, paddingTop: 16, borderTop: `1px solid ${C.darkRule}`, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontFamily: FONT_HEAD, fontSize: 9, letterSpacing: ".16em", textTransform: "uppercase", color: C.darkLabel, wordBreak: "break-word" }}>{session?.email || "Signed in"}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px" }}>
              <button onClick={() => setEditingPartner(true)} style={{ background: "transparent", border: "none", color: C.darkMuted, fontFamily: FONT_HEAD, fontSize: 9, letterSpacing: ".1em", textTransform: "uppercase", cursor: "pointer", padding: 0 }}>Partner</button>
              {isAdmin && <button onClick={() => setEditingAccess(true)} style={{ background: "transparent", border: "none", color: C.darkMuted, fontFamily: FONT_HEAD, fontSize: 9, letterSpacing: ".1em", textTransform: "uppercase", cursor: "pointer", padding: 0 }}>Access</button>}
              <button onClick={() => setEditingPw(true)} style={{ background: "transparent", border: "none", color: C.darkMuted, fontFamily: FONT_HEAD, fontSize: 9, letterSpacing: ".1em", textTransform: "uppercase", cursor: "pointer", padding: 0 }}>Password</button>
              <button onClick={signOut} style={{ background: "transparent", border: "none", color: C.darkMuted, fontFamily: FONT_HEAD, fontSize: 9, letterSpacing: ".1em", textTransform: "uppercase", cursor: "pointer", padding: 0 }}>Sign out</button>
            </div>
          </div>
        </aside>

        {/* ===== MAIN ===== */}
        <div style={{ minWidth: 0, display: "flex", flexDirection: "column" }}>

          {/* context bar */}
          <div style={{ position: "sticky", top: 0, zIndex: 10, background: "rgba(243,240,234,0.9)", backdropFilter: "blur(10px)", borderBottom: `1px solid ${C.line}`, padding: "16px 32px" }}>
            <div style={{ fontFamily: FONT_HEAD, fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: C.dim }}>
              {(project?.name) || BRAND_FULL} <span style={{ color: C.line2 }}>/</span> <span style={{ color: C.ink, fontWeight: 600 }}>{selectedCompany ? "Lead" : (NAV.find((n) => n.key === nav)?.label || "")}</span>
            </div>
          </div>

          {/* stat strip - lead-centric view */}
          {!selectedCompany && nav === "list" && (
            <div style={{ background: C.dark, display: "flex", flexWrap: "wrap" }}>
              {(() => {
                const inProj = companies.filter((c) => c.project_id === activeProject && c.list_tag !== "archived_shell");
                const cells = [
                  { l: "Leads", v: inProj.length, a: false },
                  { l: "On AWS", v: inProj.filter((c) => c.aws_detected).length, a: true },
                  { l: "Warm \u2265 60", v: inProj.filter((c) => (Number(c.score) || 0) >= 60).length, a: false },
                  { l: "Needs domain", v: inProj.filter((c) => !c.domain).length, a: false },
                ];
                return cells.map((s, i) => (
                  <div key={i} style={{ flex: 1, minWidth: 130, padding: "16px 32px", borderRight: i < cells.length - 1 ? `1px solid ${C.darkRule}` : "none" }}>
                    <div style={{ fontFamily: FONT_HEAD, fontSize: 9, letterSpacing: ".16em", textTransform: "uppercase", color: C.darkLabel, marginBottom: 5 }}>{s.l}</div>
                    <div style={{ fontFamily: FONT_DISPLAY, fontSize: 28, lineHeight: 1, color: s.a ? C.accent : "#F1ECE3", letterSpacing: "-.02em" }}>{s.v}</div>
                  </div>
                ));
              })()}
            </div>
          )}

          {/* innehåll */}
          <div style={{ maxWidth: 760, width: "100%", margin: "0 auto", padding: "24px 18px 60px" }}>
        {selectedCompany ? (
          <CompanyCard
            project={project}
            company={selectedCompany}
            contacts={contacts}
            activities={activities}
            onBack={() => setSelected(null)}
            onUpdate={updateCompany}
            onStage={moveStage}
            onAddActivity={addActivity}
            onAddContact={addContact}
            onUpdateContact={updateContact}
            flash={flash}
            me={session?.email || ""}
            fundings={fundings}
            onAddFunding={addFunding}
            onUpdateFunding={updateFunding}
          />
        ) : nav === "dashboard" ? (
          <Dashboard project={project} projects={projects} companies={companies} contacts={contacts} activities={activities} fundings={fundings} onSelectProject={(id) => { setActiveProject(id); setSelected(null); setNav("list"); }} onOpen={setSelected} onUpdate={updateCompany} onOrgLookup={handleOrgLookup} onAwsBatch={runAwsBatch} awsBatch={awsBatch} onDomainBatch={runDomainBatch} domainBatch={domainBatch} onOpenPlay={(t) => { setPlayFilter(t); setTab("all"); setNav("list"); }} onAskSmith={(text) => { setSmithSeed(text); setSmithOpen(true); }} />
        ) : nav === "today" ? (
          <TodayQueue project={project} companies={companies} contacts={contacts} activities={activities} trackMap={smithTracks} onOpen={setSelected} onOutcome={logOutcome} onSnooze={(id, days) => updateCompany(id, { next_action_at: dayStr(days) })} flash={flash} />
        ) : nav === "hot" ? (
          <HotLeads projects={projects} companies={companies} onOpen={setSelected} flash={flash} />
        ) : nav === "list" ? (
          <CompanyList project={project} companies={companies} contacts={contacts} onOpen={setSelected} query={query} setQuery={setQuery} tab={tab} setTab={setTab} me={session?.email || ""} onDomainBatch={runDomainBatch} domainBatch={domainBatch} onAwsBatch={runAwsBatch} awsBatch={awsBatch} playFilter={playFilter} setPlayFilter={setPlayFilter} />
        ) : nav === "pipeline" ? (
          <PipelineView project={project} companies={companies} onOpen={setSelected} onStage={moveStage} />
        ) : nav === "funding" ? (
          <FundingView project={project} companies={companies} fundings={fundings} onAddFunding={addFunding} onUpdateFunding={updateFunding} />
        ) : nav === "discovery" ? (
          <AwsDiscoveryView projectId={activeProject} flash={flash} onAfterApprove={async () => { try { setCompanies(await db.allCompanies()); } catch {} }} />
        ) : (
          <>
            <label style={{ display: "flex", alignItems: "center", gap: 9, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 2, padding: "11px 14px", marginBottom: 14, cursor: "pointer" }}>
              <input type="checkbox" checked={autoEnrich} onChange={(e) => setAutoEnrich(e.target.checked)} style={{ width: 15, height: 15, accentColor: C.accent, cursor: "pointer" }} />
              <span style={{ fontSize: 12.5, color: C.text, fontWeight: 600 }}>Auto-enrich new imports</span>
              <span style={{ fontSize: 11.5, color: C.dim2 }}>- find website + AWS check in the background (first 25)</span>
            </label>
            <ImportView project={project} companies={companies} contacts={contacts} onImport={handleImport} onImportRows={handleImportRows} flash={flash} isAdmin={isAdmin} />
          </>
        )}
          </div>
        </div>
      </div>

      {/* SMITH floating launcher — reachable from every screen */}
      {session && (
        <>
          {smithOpen && (
            <div style={{ position: "fixed", bottom: 86, right: 24, width: 380, maxWidth: "calc(100vw - 48px)", maxHeight: "min(70vh, 620px)", overflowY: "auto", background: C.bg, border: `1px solid ${C.line2}`, borderRadius: 4, boxShadow: "0 12px 40px rgba(20,19,16,.22)", zIndex: 60, padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.accent }} />
                  <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: C.text, fontFamily: FONT_HEAD }}>Smith</span>
                  <span style={{ fontSize: 10.5, color: C.dim2 }}>{(project?.name) || ""}</span>
                </div>
                <button onClick={() => setSmithOpen(false)} style={{ background: "transparent", border: "none", color: C.dim, fontSize: 18, lineHeight: 1, cursor: "pointer", padding: 2 }}>×</button>
              </div>
              <SmithPanel recs={smithLauncherRecs} greeting={smithGreeting} variant="rail"
                onOpen={(id) => { setSelected(id); setSmithOpen(false); }}
                onOpenPlay={(t) => { setPlayFilter(t); setTab("all"); setNav("list"); setSelected(null); setSmithOpen(false); }} />
              <SmithChat
                project={project}
                projCompanies={companies.filter((c) => c.project_id === activeProject && c.list_tag !== "archived_shell")}
                trackMap={smithTracks}
                contacts={contacts}
                recs={smithLauncherRecs}
                seed={smithSeed}
                onClearSeed={() => setSmithSeed("")}
                onOpen={(id) => { setSelected(id); setSmithOpen(false); }} flash={flash} />
            </div>
          )}
          <button onClick={() => setSmithOpen((v) => !v)} title="Smith — your AWS sales co-worker"
            style={{ position: "fixed", bottom: 24, right: 24, zIndex: 61, width: 52, height: 52, borderRadius: "50%", background: C.ink, color: C.cream, border: `2px solid ${C.accent}`, cursor: "pointer", boxShadow: "0 6px 20px rgba(20,19,16,.28)", fontFamily: FONT_HEAD, fontWeight: 700, fontSize: 17, letterSpacing: ".02em", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {smithLauncherRecs.reduce((n, r) => n + (r.needyCount || 0), 0) > 0 && !smithOpen && (
              <span style={{ position: "absolute", top: -3, right: -3, minWidth: 18, height: 18, padding: "0 4px", borderRadius: 9, background: C.accent, color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${C.bg}` }}>{smithLauncherRecs.reduce((n, r) => n + (r.needyCount || 0), 0)}</span>
            )}
            S
          </button>
        </>
      )}

      {/* toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 22, left: "50%", transform: "translateX(-50%)", background: C.ink, color: C.cream, padding: "12px 22px", borderRadius: 2, fontSize: 12, fontWeight: 500, letterSpacing: ".05em", fontFamily: FONT_BODY, zIndex: 50, boxShadow: "0 10px 30px rgba(26,25,22,.25)" }}>{toast}</div>
      )}
    </div>
  );
}


