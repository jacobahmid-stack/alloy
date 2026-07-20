# Smith on Claude Managed Agents — one-agent experiment spec

**Status:** proposed (2026-06-03). Low-risk evaluation, not a commitment.
**Owner:** Jacob. **Read-only, no writes, budget-capped.**

## Why run this

Smith today runs on `claude-proxy`, a **single-shot relay**. That is the reason the entire grounding stack is an app-side "retrieve then inject" workaround: the model cannot call AWS Knowledge / SCB / MS Learn / pricing / the brain itself in a loop, so the app pre-fetches and stuffs the prompt. Claude Managed Agents give a **real multi-step tool-use loop over MCP servers + skills**.

This experiment answers one question with evidence, before any architectural bet:

> **Does a real tool-use loop produce a materially better account brief than the current retrieve-then-inject path, at an acceptable cost?**

If yes, we graduate async jobs (overnight enrichment, Meetings, deep research) to Managed Agents and keep the multi-tenant interactive chat on the cost-capped proxy until Bedrock + budget control + GA land. If no, we keep the proxy and the workaround, and we've spent a few dollars to learn it.

## The ONE job to test: deep account research

Pick this over the migration assessment because it is the job where the loop most clearly beats single-shot: the agent must *go gather* from several sources and synthesize, rather than just process a supplied CSV. It is also read-only (safe) and touches the most tools.

**Task given to the agent (per account):**
> Given this Swedish company, produce a one-page AWS account brief for a partner rep: current cloud + tech stack (with evidence), AI/data maturity, the right AWS play (Migrate / Modernize / GenAI-POC / Greenfield / Resell) and the funding track, the named decision-maker to open (IT/digitalisation first), a grounded business case, and the market context (TAM/segment via SCB). Cite every external fact. Draft only; do not act.

**Input:** paste the account's row from Alloy (name, orgnr, domain, city, industry/SNI, employees, revenue_ksek, cloud_provider, maturity_band, any known contacts). No data-MCP needed for v0 — the value under test is the *gathering*, not the internal DB read.

## Agent config

- **Model:** `claude-sonnet-4-5` (account uses 4.x naming; 3.x names 404).
- **System prompt:** reuse `SMITH_VOICE` + `HUMAN_STYLE` + citation discipline + advise-not-act, all already in `forge.jsx`. Add one line: "Use your tools to verify before asserting; if a fact isn't grounded, say so."
- **Tools / MCP servers:**
  - **AWS Knowledge MCP** — hosted, free, no auth. Base URL `https://knowledge-mcp.global.api.aws` (NOT `/mcp` — the gateway rejects tool-calls on `/mcp`). Works immediately.
  - **Built-in web search + fetch** — the `agent_toolset` covers this; it's how the agent reads tech-stack / firmographics / LinkedIn (allabolag/ratsit figures live on the page, so fetch matters here in a way single-shot web_search couldn't reach).
  - **SCB market intel** — his `scb-mcp-http` (cloned at `C:\Users\jacob\alloy\scb-mcp-http`). WIRING NOTE: a hosted Anthropic sandbox reaches it only via a public URL or an MCP tunnel (tunnels are limited-preview, request access). For v0 either (a) deploy scb-mcp-http to a public URL, or (b) skip it and let web search cover market context, then add SCB in v1. Don't block the test on this.
  - **MS Learn MCP** (optional) — hosted `learn.microsoft.com/api/mcp`, the Azure/multi-cloud lever.
- **Environment:** for the FIRST quick test, the Anthropic cloud sandbox is fine (fastest to stand up). For anything customer-facing later, switch to a **self-hosted sandbox** or **Claude Platform on AWS** (ownership + EU data residency). Note: Managed Agents are stateful and **not ZDR/HIPAA-eligible** — see guardrails.
- **Beta:** requires the `managed-agents-2026-04-01` beta header (SDK sets it automatically).

## Success bar (quality)

Run on **5 real accounts** chosen to span the model:
1. one already on AWS (Modernize/Resell),
2. one on Azure/GCP (Migrate),
3. one AI-native (GenAI-POC),
4. one net-new small (Greenfield),
5. one deliberately too-large (must be flagged off-ICP, not pitched).

For each, run **both** the Managed Agent and current Smith (retrieve-then-inject) on the identical input, side by side. Score each brief 1-5 on:
- **Grounding** — cites real sources, zero fabrication (auto-fail on any invented company/person/number).
- **Play + funding correctness** — right track per the engine taxonomy; flags the too-large one.
- **Decision-maker** — names a real, plausibly-correct IT/digitalisation contact.
- **Market context** — TAM/segment grounded (SCB or cited web).
- **Did it catch something single-shot missed?** (the whole point of the loop).

**WIN = the loop version is clearly better on ≥3 of the 5 accounts on grounding + play correctness, with no new fabrication.**

## Cost bar

Measure tokens and $ per account run (Managed Agents bill through the API account; your `claude_budget`/`tenant_budgets` caps do NOT auto-apply, so meter manually).

- **Reference:** current enrich calls run ~$0.04-0.10/company (Haiku find_contacts; Sonnet innovation). A multi-step research agent will be pricier.
- **Target:** ≤ **$0.75 / account**. **Hard stop:** $2 / account (cap the session).
- **Verdict gate:** graduate only if **quality wins AND cost ≤ target**, OR quality is dramatically better and the cost is justifiable for a high-value deep brief (a rep would pay for it). Otherwise keep the proxy.

## Guardrails (non-negotiable)

- **Read-only.** No tools that write to HubSpot, the DB, email, or calendar. The agent drafts; the human acts (Smith's standing rule).
- **Budget cap** on the session; stop at the hard ceiling.
- **Data residency / privacy.** Managed Agents are stateful and not ZDR/HIPAA-eligible. Feed only the account row + public research. Do NOT feed Wagyu-confidential docs, Jacob's personal sales plan, or any other tenant's data (e.g. Alto's MDF doc). Delete sessions after the test.

## Setup checklist

1. Get a Claude API key; confirm Managed Agents access (on by default for API accounts).
2. Define the agent: model + system prompt (paste SMITH_VOICE + HUMAN_STYLE) + tools (AWS Knowledge MCP + web + optionally SCB/MS Learn).
3. Pick the 5 accounts; export their rows from Alloy.
4. Run the agent on each (cloud sandbox v0); capture output + token/$ per run.
5. Run current Smith on the same 5; score both on the rubric above.
6. Tally quality + cost against the bars → decision.

## Decision fork (what we conclude)

- **Graduate:** move async jobs (overnight enrichment/ICP-screen, Smith Meetings transcript→brief, deep research) onto Managed Agents (self-hosted sandbox or Claude Platform on AWS); rebuild budget metering at that layer.
- **Park:** if quality/cost don't clear the bar, keep the proxy + retrieve-then-inject; revisit at GA or after the Bedrock cutover.
- **Always, regardless:** the multi-tenant interactive Smith chat stays on the cost-capped `claude-proxy` until Bedrock + per-tenant budget control + GA are all in place.

## Strategic alignment (North Star)

The on-AWS variant + skills support point the same way as the **Agentic AI Competency BOX** ($345K, solo partner, requires Bedrock AgentCore): a genuinely agentic Smith on AWS is both a product upgrade and a funding story. That makes this experiment worth its few dollars even if v0 stays on the Anthropic sandbox.
