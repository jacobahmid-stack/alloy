# SMITH ↔ AWS PATTERN CROSSWALK — talk about Smith in AWS's own language

Purpose: describe Smith to AWS PDMs, Solutions Architects, and partner teams (ISV Accelerate, Marketplace, FTR, WAFR conversations) using the EXACT names from AWS Prescriptive Guidance's agentic-AI patterns series. Verified against live AWS docs 2026-07-14 (drafted + adversarially fact-checked; all pattern names confirmed verbatim, no fabrications). This reads as a production agent architecture, not a demo prompt.

Pattern index: https://docs.aws.amazon.com/prescriptive-guidance/latest/agentic-ai-patterns/

## The crosswalk (Smith implements 8 named AWS patterns)

| AWS pattern (their exact name) | How Smith implements it | Leaf source |
|---|---|---|
| **Agent RAG (retrieval-augmented generation)** | Smith grounds every recommendation in a curated knowledge base before answering, combining meaning-based (semantic) search with exact keyword matching, so its output cites real, current facts, not model guesswork. | basic-reasoning-agents.html |
| **Workflow for evaluators and reflect-refine loops** | A separate evaluation pass (a distinct critic step) checks and reforges Smith's draft before it reaches the customer, gating for accuracy, tone, and language, exactly the generate-then-evaluate shape AWS names. | workflow-for-evaluators-and-reflect-refine-loops.html |
| **Tool-based agents for calling functions** | Smith runs a bounded reason-and-act loop, reaching for web search and internal Alloy lookups only as needed, with a hard ceiling on steps so every run stays fast, predictable, and cost-controlled. | tool-based-agents-for-calling-functions.html |
| **Tool-based agents for servers** | Alloy exposes its capabilities over a standard MCP server that AWS-side assistants such as Amazon Quick Suite can call, so Smith plugs into the customer's own AI surface instead of living in a silo. | tool-based-agents-for-servers.html |
| **Memory-augmented agents** | Smith remembers each account with per-company memory and runs a nightly learning pass over what actually moved deals, so its guidance compounds instead of resetting every conversation. | memory-augmented-agents.html |
| **Observer and monitoring agents** | Smith watches accounts for meaningful change, champion departures, buying signals, drift, then surfaces them proactively in a morning brief and next-best-action prompts. (Smith goes beyond the passive framing by acting on what it sees.) | observer-and-monitoring-agents.html |
| **Basic reasoning agents** | Smith's reasoning core runs on Claude in Amazon Bedrock in the EU, with task-specific instructions, right-sized model tiers, built-in spend caps, and per-customer cost attribution. | basic-reasoning-agents.html |
| **Simulation and test-bed agents** (conceptual fit) | Before any change ships, Smith's output passes an automated release gate of 300+ machine checks enforcing voice, factual faithfulness, and Swedish/English correctness, so regressions are caught in testing, not in front of a customer. | simulation-and-test-bed-agents.html |

## Pocket ammo (verified lines for the room)

1. **Defends the no-managed-vector-store choice in an FTR/WAFR:** by AWS's own definition, Agent RAG "queries a knowledge source, such as a vector store, database, or document index **using semantic search or keyword matching**." Smith's grounding is a compliant Agent RAG pattern with no managed vector store required. *(Verbatim on basic-reasoning-agents.html, Agent RAG subsection.)*
2. **Quality story:** Smith implements AWS's Workflow for evaluators and reflect-refine loops directly, a generate step then a separate evaluate-and-reforge step before any output ships.
3. **EU residency:** Smith's reasoning core runs on Claude in Amazon Bedrock in the EU (eu-north-1 Stockholm). Say **"stays in the EU"** unless you can confirm a single-region Stockholm call — if claude-proxy uses the EU cross-region inference profile, requests may route to another EU region (still EU, not necessarily Stockholm). A residency-focused SA will ask which; know the answer before you assert "in-region."
4. **Integration:** Alloy is a Tool-based-agents-for-servers implementation, exposing an HTTP MCP server that Amazon Quick Suite and other AWS-side assistants can call. *(Amazon Quick Suite MCP support is real; say "Quick Suite," not bare "Amazon Quick," so it isn't heard as "Amazon Q.")*
5. **The headline:** Smith maps to four named AWS agent patterns at once, Agent RAG, evaluator reflect-refine, memory-augmented, and observer/monitoring, which reads as a production agent architecture, not a demo prompt.

## Honesty guardrails (do NOT overclaim — a sharp SA will probe these)

- **Judge model:** AWS's evaluator pattern allows same-or-different model. Say "a separate evaluation pass" (true regardless). Only claim "a different model" if you've confirmed Smith's critic runs a distinct model/tier, not the same Claude with a critic prompt.
- **Test-bed row is a conceptual fit:** AWS frames "Simulation and test-bed agents" around simulated/RL environments; Smith's CI harness is a deterministic release gate in the evaluator family. Present it that way, not as the pattern's central use case.
- **The 300+ check number** shifts as tests are added (321 at last run) — say "300+" or "a machine-enforced evaluation gate," never a fragile exact count.
- **Tenant isolation** (RLS, per-tenant budgets, the rulebook membership guard) is real and strong but belongs to AWS's *sibling* guide "Building multi-tenant architectures for agentic AI," not the patterns guide, so it's deliberately not a crosswalk row. Bring it up as multi-tenant architecture, not as a "pattern."
- **Cost governance** (model tiers, prompt caching, per-tenant budget caps, COGS attribution) is operational hardening the patterns guide doesn't name; present it as how Smith runs the Basic-reasoning-agents pattern responsibly, not as its own AWS pattern.

## Acronym reference (verified vs AWS 2026-07-14, also wired into Smith's KB search)
MAP = Migration Acceleration Program · ACE = APN Customer Engagements · **MDF = Marketing Development Funds** (AWS-canonical; "Market Development Funds" is the common channel phrasing) · RA-ID = Revenue Attribution ID · FTR = Foundational Technical Review · WMP = (ISV) Workload Migration Program · PoC = Proof of Concept · WAFR = Well-Architected (Framework) Review · CAF = Cloud Adoption Framework · TCO = Total Cost of Ownership · ISV = Independent Software Vendor · ISV Accelerate = ISV Accelerate Program · **PRM = Partner Revenue Measurement** (AWS's revenue-attribution service — NOT "Partner Relationship Management") · APN = AWS Partner Network · SOW = Statement of Work.
