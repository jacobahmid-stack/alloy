# Smith — the complete capability map (canonical, 2026-07-16)

One page: what Smith does today, structured as the working day of the senior partner development manager he is. Status marked honestly on every line: **LIVE** (in production), **DEPLOYED-GATED** (built and on the box, waiting on a human gate), **SPEC** (designed, not built). Commercial framing follows the proof: from a standing start, this machine produced 17-20 booked meetings, 3 proposals, and a closed POC + resell deal across three organisation numbers under one decision-maker (desk-led mode, Alloy/Smith behind 100% of the meetings).

---

## 1. Overnight: the territory (the upstream nobody else sells)
- **Watches the market** - 5 live signal feeders (SE job ads nightly, Vinnova grants nightly, EU tenders weekly, NO job ads nightly, business events weekly) matched to accounts; champion job-change watch weekly. **LIVE**
- **Reads every account** - cloud detected (ladder + BuiltWith deep scan on demand), stack observed, size banded, data/AI maturity 0-4, decision-makers titled. Library: 51,868 SE+NO companies. **LIVE**
- **Scores the fit and names the funded door** - deterministic ICP (70/40) + funding track per account (MAP tiers / POC ladder / PGP / ISV-WMP, MDF rules, RA-ID rhythm) BEFORE any lead exists. No LLM in the scorer, so no hallucinated eligibility. **LIVE**
- This layer is the post-Jul-9 moat: AWS's free tooling starts at "submit your leads." Smith manufactures the leads.

## 2. Morning: the brief
- **Slack morning brief** (smith-brief + hourly cron): who is ready, what is slipping, a champion who moved, act-now lines from signals, with the draft opener attached. **LIVE**
- **Drift detection** on accounts; **NBA strip** (proactive next-best-action cards) on the dashboard. **LIVE**
- **Remembers and learns**: per-tenant account memory, stage transitions, best-plays bias (what converted feeds what gets recommended). **LIVE**

## 3. Prospecting: people and openers
- **Finds the person** - decision-maker titles per account (Vainu SE ~46.5k contacts, Explorium NO), cloud owners first. **LIVE**
- **Drafts the opener in the recipient's language** (language follows the recipient, per-partner voice from the GTM rulebook). **LIVE**
- **Partner Trio** - the "your top 3 ready deals" intro asset per partner, one account per lane (Migrate / Expand / AI-POC), ~$0.04 per trio, dry-run free. **LIVE** (proved again 2026-07-16 on Alto)
- **Air cover (/aircover)** - Smith nominates the accounts worth exec multithreading this week, the seat to target, the sender whose seniority matches, and drafts the note in the exec's voice; the exec sends from their own inbox. Phase A (app) **LIVE**; dashboard NBA card + Slack two-way **SPEC** (B/C).
- **Reply agent** - classifies the reply, drafts the follow-up, recalls shared memory ("already tried X"). **LIVE**
- **Slash shortcuts** - /prospect /score /reply /report /forge /next /campaign /aircover /prm. **LIVE**

## 4. Into the meeting (the arc that makes him a colleague, not a tool)
- **The brief before**: the account read, the play, the funding angle, and who is in the room - on the account card and in chat. **LIVE**
- **Joins the call** (Zoom/Teams/Meet bot, EU chain end to end): records and transcribes in **any European language, auto-detected** (verified coverage: full Nordics incl. Icelandic, core Europe, Baltics; code-switching supported by the provider, explicit enablement untested). The brief and the drafted follow-up come back in the meeting's language. **LIVE** (first Swedish e2e passed 2026-07-16; Zoom needs its Marketplace authorization step; consent notice posted in meeting chat on join).
- **Paste-a-transcript fallback**: same brief with zero bot, usable today. **LIVE** (the back-half is transcript-source-agnostic)
- **After the call**: an account-grounded brief - summary, decisions, action items with owner/due routed to the Today queue, risks and objections, the funding angle, and a drafted follow-up that opens in Gmail. Only what is in the transcript; gaps flagged; never invents a commitment. Saved to account memory. **Back-half LIVE, bot-fed path gated**
- **Phone path** (Telavox webhook + Twilio in-app dialer): both built, **PARKED** on hold.

## 5. The paperwork (the co-sell machinery)
- **ACE-ready opportunity drafts** shaped to pass validation, ready for a human to submit in Partner Central. **LIVE**
- **Live co-sell pipeline pulled in** (pc-cosell-sync nightly, incl. AWS's own quality/engagement read on each opp). **LIVE**
- **Partner Business Plan** (co-built from the partner's real book) and **tri-party plays** (partner + ISV on the stack + distribution). **LIVE**
- **RA-ID attribution rhythm** - monthly allocation review so launched deals count. **LIVE** (the "before the 7th" deadline was found not to exist; corrected 2026-07-20)
- **Partner Central agents MCP access** (AWS's own agent, SigV4, both catalogs) - working; usable for funding checks and onboarding guidance the moment registration completes. **LIVE (data plane gated on registration)**

## 6. Technically: a builder's depth, not a copywriter
Smith's remit runs three lenses, and the technical one is real machinery, not prompt garnish:
- **Architecture**: well-architected pillars, cloud adoption frameworks, the 7 R's, service limits, security and identity, modernization paths - across AWS, Azure, Google Cloud, leading with the partner's cloud. **LIVE**
- **Live pricing + TCO**: aws-pricing, azure-pricing, gcp-pricing engines; rough business cases with real numbers. **LIVE**
- **Migration assessment**: the MAP Assess kit / migration kit widget flow. **LIVE**
- **Grounded documentation lookups**: aws-knowledge, ms-docs, gcp-docs + the KB/RAG layer (AWS program guides ingested, 2026 constructs). **LIVE**
- **Readiness engine**: event-driven account-readiness signals, maturity banding. **LIVE**

## 7. The governance spine (why an enterprise can trust him)
- **Self-verifies** each claim against source before it reaches a human; what he cannot stand behind is flagged, not asserted. **LIVE**
- **Critic-gated output** (critic has teeth, separate from the generator), slop/voice floor, 328-test suite + output evals. **LIVE**
- **Every run logged** (action trace), **per-workspace spend caps**, per-partner **GTM rulebook** (market rules, tone, allowed claims). **LIVE**
- **EU-resident by construction**: Bedrock eu-north-1, self-hosted Supabase Stockholm, per-tenant RLS isolation, exportable in full. **LIVE**
- **A human approves and sends. Always.** Smith never contacts anyone autonomously. **The design, not a limitation.**

## 8. Market intelligence (numbers from the source, never vibes)
- **TAM / ICP sizing live in chat** - Statistics Sweden PxWeb (firms by industry SNI x size class); proven: SNI 62 IT Sweden mid-market = 1,097 of 48,616. **LIVE**
- **Chat-widget / digital-maturity detection** (chatbot-detect): vendor + class per account; aggregate insight already banked (~85% of top Swedish accounts have no front-door assistant). **LIVE**
- **Innovation-maturity deep scans** (0-4 banding, ~162 scanned). **LIVE**

## 9. Drives AWS's own machinery (new 2026-07-16)
- **Partner Central agents MCP client** (pc-mcp, SigV4, dedicated IAM, auth-gated): Smith can ask AWS's own agent for funding eligibility on an opportunity, onboarding steps, co-sell state - consuming AWS's free downstream as a tool on the partner's behalf. **LIVE** (real-data plane opens when registration completes)
- **pc-cosell-sync** nightly: the partner's real ACE pipeline + AWS's own quality/engagement read, into Alloy. **LIVE**
- **azure-cosell-sync** built (gated on Microsoft Partner Center credentials). **DEPLOYED-GATED**

## 10. Distribution: Smith shows up where the rep already lives
- **Alloy's own MCP server** at db.forj.se/mcp - Smith's reads inside Claude, Copilot Studio, Gemini, Amazon Quick; tri-cloud-correct tools; proven end-to-end from inside another assistant. **LIVE**
- **Slack**: morning brief + hourly cron (two-way @smith = Phase 2). **LIVE**
- **CRM sync into the Nordic top-5**: Pipedrive, Lime, webCRM, Salesforce, and more - Smith's output lands pre-filled in the partner's own CRM. **NOT LIVE. Corrected 2026-07-19.** Measured against production: 5,185 engagement rows, **every one of them with `crm_provider` NULL**. No connector has ever written a row. What exists is a one-way single-portal pull with no deal object; five of the six connector directories have never executed. Do not repeat this claim in a deck, on forj.se, or to a partner until a row exists.
- **forj.se**: the public one-free-read funnel (e2e-verified) + the demo console. **LIVE**
- **Multicloud correctness everywhere**: AWS-first, any-cloud library, each cloud's funding grammar right (Azure Migrate and Modernize / Innovate, Google RAMP) - what makes the rival-cloud POC lane credible. **LIVE**

## 11. Funnel + content (gated on launch)
- Lead capture + notify, Cal.com booking webhook. **LIVE**
- LinkedIn engagement harvest (posts -> matcher -> warm contacts + Hett). **LIVE, idle until first authored post**
- Smith's Read content engine: drafts gated, human posts. **BUILT, gated on Post #0**

## 12. Parked, not absent
- Phone: in-app Twilio dialer + recording webhook, Telavox capture - both built, deliberately parked. **PARKED**
- Meeting bot auto-join - deployed, waiting on the consent flow + cost cap greenlight. **DEPLOYED-GATED**

## Surfaces (summary)
App (Alloy) - Slack - forj.se - Alloy's MCP server (any assistant) - the partner's own CRM - and, via pc-mcp, AWS's own agent console.

---

## The two modes (canonical, never conflate)
- **Desk-led** - "Forj works the outbound": Forj's senior desk (founder on the phones) operates Alloy+Smith on the partner's territory. **PROVEN with closed revenue**: from zero, 17-20 booked meetings, 3 proposals, and a closed POC + resell deal across three organisation numbers under one decision-maker. Alloy/Smith behind 100% of the meetings.
- **Self-serve** - the partner's own reps operate Smith. The open question (activation began 2026-07-15; the day-91 gate measures this mode only). A founder-independence and scalability question, not a does-it-work question.

Both go on forj.se as an articulated band in a later deployment, alongside a simplified pricing card (queued 2026-07-16).

## The commercial sentence
Smith compresses the path from public signal to approved send, and now walks into the room with you: he watches the territory overnight, reads the account, names the funded door, drafts the opener, briefs you before the meeting, captures what was said, and hands you the follow-up and the paperwork - while you keep the relationship, the call, and the send button. Proven: ~20 meetings, 3 proposals, 1 closed multi-entity deal, from nothing. The market prices this person at $300K+ and AWS is hiring one; Smith holds the overnight two-thirds of the job permanently, at software margin, in the EU.
