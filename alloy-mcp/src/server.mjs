// Shared Alloy MCP server factory: registers the tools once, reused by both the stdio entry
// (src/index.mjs) and the remote HTTP entry (src/http.mjs). Tools route to the live Alloy box
// (claude-proxy, budget-capped); alloy_funding_fit is a pure local scorer (the moat).
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { fundingFit } from "./scoring.mjs";

const BASE = (process.env.ALLOY_SUPABASE_URL || "https://db.forj.se").replace(/\/+$/, "");
const ANON = process.env.ALLOY_ANON_KEY || "";
const MODEL = process.env.ALLOY_MODEL || "claude-sonnet-4-5"; // must be in the proxy ALLOWED_MODELS

// Limit concurrent calls to the box: its edge runtime supervisor cancels workers under burst load
// ("WorkerRequestCancelled"), so we cap in-flight requests and queue the rest. Override via ALLOY_MAX_CONCURRENT.
const MAX_CONCURRENT = Number(process.env.ALLOY_MAX_CONCURRENT || 2);
let _active = 0;
const _waiters = [];
async function withSlot(fn) {
  if (_active >= MAX_CONCURRENT) await new Promise((r) => _waiters.push(r));
  _active++;
  try { return await fn(); }
  finally { _active--; const next = _waiters.shift(); if (next) next(); }
}

// Call the Alloy claude-proxy edge function. The public anon JWT satisfies the box verify_jwt; the box
// enforces the task allow-list (STRICT_TASKS) + the global/per-tenant budget caps. Returns assistant text.
// Concurrency-capped (withSlot) and retried on transient box errors (5xx / 429 / worker cancelled).
async function proxy(task, content, { web = false, maxTokens = 1500 } = {}) {
  if (!ANON) throw new Error("ALLOY_ANON_KEY is not set (the public anon JWT for the Alloy box).");
  const body = { model: MODEL, max_tokens: maxTokens, task, messages: [{ role: "user", content }] };
  if (web) body.tools = [{ type: "web_search_20250305", name: "web_search", max_uses: 4 }];
  return withSlot(() => callProxy(body, task));
}

async function callProxy(body, task, attempt = 1) {
  const r = await fetch(`${BASE}/functions/v1/claude-proxy`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${ANON}`, apikey: ANON },
    body: JSON.stringify(body),
  });
  const txt = await r.text();
  if (!r.ok) {
    const transient = r.status >= 500 || r.status === 429 || /WorkerRequestCancelled|cancelled by supervisor/i.test(txt);
    if (transient && attempt < 3) {
      await new Promise((res) => setTimeout(res, 600 * attempt));
      return callProxy(body, task, attempt + 1);
    }
    throw new Error(`Alloy ${task} ${r.status}: ${txt.slice(0, 200)}`);
  }
  try {
    const j = JSON.parse(txt);
    if (j && j.error) throw new Error(j.message || j.error);
    return (j.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n").trim() || txt;
  } catch (e) { if (e instanceof SyntaxError) return txt; throw e; }
}

export function createAlloyServer() {
  const server = new McpServer({ name: "alloy", version: "0.1.0" });

  server.tool(
    "alloy_company_read",
    "Smith's grounded read of a company for hyperscaler-partner GTM, framed from the partner's home cloud (AWS, Azure, or Google Cloud): which cloud the company runs (and how we know), notable stack, rough size, the sharpest play (migrate / modernize / GenAI), and the funding angle named in the partner's own program. Use for 'tell me about <company>' in a sales or partner context.",
    {
      company: z.string().describe("Company name or website domain, e.g. 'Spotify' or 'spotify.com'"),
      partner_cloud: z.enum(["aws", "azure", "gcp"]).default("aws").describe("The partner's home cloud; the read leads with this one and treats the others as the customer's estate"),
    },
    async ({ company, partner_cloud = "aws" }) => {
      try {
        const pc = partner_cloud.toUpperCase();
        const out = await proxy("smith_chat",
          `Read this company for a ${pc} partner: ${company}. Lead with ${pc}; treat the other clouds as the customer's estate to migrate, modernize, or coexist with. Give a tight, grounded read: which cloud they run and how you know, their notable stack, rough size, the sharpest play for a ${pc} partner (migrate, modernize, or GenAI), and the funding angle named in ${pc}'s own program, stated as a DIRECTION only. Never assert that an account is eligible, and never state a program threshold, cap or percentage: close the funding sentence with "confirm eligibility and amounts with the ${pc} partner manager". Say "unknown" rather than guess.`,
          { web: true, maxTokens: 1200 });
        return { content: [{ type: "text", text: out }] };
      } catch (e) { return { content: [{ type: "text", text: "Error: " + (e?.message || e) }], isError: true }; }
    },
  );

  server.tool(
    "alloy_cloud_and_stack",
    "Detect which hyperscaler (AWS, Azure, Google Cloud) a company runs and identify its public technology stack from its domain. The cloud + ISV signals that a horizontal firmographic graph does not provide.",
    { domain: z.string().describe("Website domain, e.g. 'example.com'") },
    async ({ domain }) => {
      try {
        const out = await proxy("techstack", domain, { web: true, maxTokens: 1200 });
        return { content: [{ type: "text", text: out }] };
      } catch (e) { return { content: [{ type: "text", text: "Error: " + (e?.message || e) }], isError: true }; }
    },
  );

  server.tool(
    "alloy_funding_fit",
    "Deterministic hyperscaler funding-program fit + ICP score for an account, from its cloud posture and size. Free, no LLM. Returns the recommended program (MAP, MAP-Modernize, GenAI PoC, Resell), an ICP score 0-100 with a hot/warm/cold band, and a directional funding estimate. This is the authoritative funding verdict: prefer it over any funding statement in alloy_company_read, which is directional only. The vertical partner layer a horizontal identity graph does not cover.",
    {
      cloud: z.enum(["aws", "azure", "gcp", "on-prem", "other", "unknown"]).describe("The account's current cloud"),
      partner_cloud: z.enum(["aws", "azure", "gcp"]).default("aws").describe("The partner's primary (home) cloud"),
      employees: z.number().optional().describe("Headcount, if known"),
      revenue_ksek: z.number().optional().describe("Annual revenue in thousands of SEK, if known"),
      maturity_band: z.number().min(0).max(4).optional().describe("Data/AI maturity band 0-4, if known"),
      genai: z.boolean().default(false).describe("Active AI or data initiative?"),
      has_contact: z.boolean().default(false).describe("Is a decision-maker reachable?"),
      annual_opp_sek: z.number().optional().describe("Estimated annual opportunity value in SEK, for the funding estimate"),
    },
    async (a) => {
      try { return { content: [{ type: "text", text: JSON.stringify(fundingFit(a), null, 2) }] }; }
      catch (e) { return { content: [{ type: "text", text: "Error: " + (e?.message || e) }], isError: true }; }
    },
  );

  server.tool(
    "alloy_find_prospects",
    "Find REAL companies matching a natural-language target description (geography, size, industry, cloud or AI signals), grounded with web search and framed for the partner's home cloud (AWS, Azure, or Google Cloud). Each returns with its cloud, an AI-maturity read, the fit reason, and the suggested cloud play. Smith's prospecting researcher.",
    {
      description: z.string().describe("e.g. 'Swedish mid-market manufacturers on Azure with active AI initiatives'"),
      partner_cloud: z.enum(["aws", "azure", "gcp"]).default("aws").describe("The partner's home cloud; every play is framed against this cloud"),
    },
    async ({ description, partner_cloud = "aws" }) => {
      try {
        const out = await proxy("discover_prospects", `Partner cloud: ${partner_cloud.toUpperCase()} (frame every play against this cloud). Target: ${description}`, { web: true, maxTokens: 3000 });
        return { content: [{ type: "text", text: out }] };
      } catch (e) { return { content: [{ type: "text", text: "Error: " + (e?.message || e) }], isError: true }; }
    },
  );

  return server;
}
