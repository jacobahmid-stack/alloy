# PLATFORM_GATE.md

**Standing gate. Date stamped 2026-07-19.**
Owner: Jacob. Applies to every build hour in `alloy-page` and every roadmap line in `alloy`.

---

## Why this exists

In July 2026 AWS shipped opportunity drafting, scoring and enrichment first-party and free to all ACE partners. Forj then verified in its own code that what had been its flagship asset was a thin proxy over AWS's own `GetAwsOpportunitySummary`. A quarter of build effort was destroyed by the platform Forj depends on. Nothing prevented that, and nothing prevented a repeat. This document is the thing that does.

## The gate question

> **Could AWS plausibly ship this first-party, free, within two releases?**

Anything answering YES gets no further build hours.

**Two releases is roughly one quarter, not one year.** AWS partner-facing releases ran about one per five months through Nov 2025 and about one per 24 days since. The agents track alone shipped 2026-03-16, 2026-05-15, 2026-06-16, 2026-07-09. Each step landed one notch earlier in the funnel. Calibrate to 2 to 4 months.

## The asymmetry rule

A wrong AT_RISK verdict costs Forj a feature it did not need.
A wrong DEFENSIBLE verdict costs another quarter.

**DEFENSIBLE is the claim that must be earned. Default to AT_RISK when uncertain.**

Two defences are permanently inadmissible:
- "We understand our data best."
- "We built it first."

Every vendor in the graveyard had a better product than the free thing that killed it. Tackle raised $148M against a $1.25B mark and sold undisclosed. NetApp spent over $650M on Spot.io plus CloudCheckr and sold for about $100M. Product quality was never the variable. **They were out-priced at zero, not out-built.**

## What counts as a chokepoint

Only three. Nothing else.

**(a) DATA GRAVITY.** Accumulated state AWS does not hold and cannot cheaply manufacture. Test it two ways: can AWS *build* it, and can AWS or a competitor simply *buy* it. Most of Forj's gravity claims died on the buy test, not the build test.

**(b) LEGAL / JURISDICTIONAL STANDING.** Someone must sign, and bear liability. Compliance that every competitor performs identically is a cost of entry, not standing. Note: AWS European Sovereign Cloud reached GA 2026-01-15 with EU-resident personnel and EUR 7.8B committed. Generic "we are EU-resident" is dead as differentiation. What survives is narrower: who signs for the lawfulness of prospecting and outreach against Nordic companies.

**(c) STRUCTURAL DISINTEREST.** AWS has a durable reason not to build it. **This only counts when the disinterest leaves a vacuum.** If four commercial vendors already occupy the space AWS declined, disinterest protects nothing. This is where most of the DEFENSIBLE claims collapsed.

## The established boundary

AWS does no discovery, but the line moved and it is thinner than it was. The claim that still holds is narrower than "AWS does no discovery." It is:

> **AWS will not build the target list.**

Everything downstream of "here is a company" is now first-party: enrichment, scoring, qualification, funding eligibility, outreach drafting, CRM sync. Treat all of that as shipped territory, not at-risk territory.

The defensible zone is **list construction from non-AWS state**. Nothing else.

---

## VERDICT TABLE

| Cluster | Verdict | Chokepoint | Build |
|---|---|---|---|
| smith-outputs (brief, nba, read, author, codify, reply-agent, campaign, rulebook) | ALREADY_SHIPPED | NONE | **STOP** |
| crm-sync (crm, lime, pipedrive, salesforce, webcrm, onepage) | AT_RISK | NONE | **STOP** |
| meetings-voice (meeting-*, voice-*, call-ingest) | ALREADY_SHIPPED | NONE | **STOP** |
| partner-central-integration (pc-sync, pc-cosell-sync, pc-mcp) | ALREADY_SHIPPED | NONE | MAINTAIN_ONLY |
| funding-eligibility (funding-eligibility, partner-fit) | ALREADY_SHIPPED | NONE | MAINTAIN_ONLY |
| knowledge-base (kb-*, aws-knowledge, aws-docs, ms-docs, gcp-docs) | ALREADY_SHIPPED | NONE | MAINTAIN_ONLY |
| nordic-corpus (no-ingest, se-stage/process, brreg-updates, domain-fill, registry-search, vainu-*, scb) | ~~DEFENSIBLE~~ **AT_RISK (downgraded, attack succeeded)** | claimed (a)+(c), **refuted** | MAINTAIN_ONLY |
| signal-feeders (jobtech, nav, vinnova, ted, explorium-events, explorium-people) | ~~DEFENSIBLE~~ **AT_RISK (downgraded, attack succeeded)** | claimed (a)+(c), **refuted** | MAINTAIN_ONLY |
| champion-watch | ~~DEFENSIBLE~~ **AT_RISK (downgraded, attack succeeded)** | claimed (c), **refuted** | MAINTAIN_ONLY |
| icp-scoring (icp-brief, icp-screen, recompute_icp_scores) | AT_RISK | NONE | MAINTAIN_ONLY |
| maturity-deepscan (maturity-fill, bulk-enrich) | AT_RISK | NONE | MAINTAIN_ONLY |
| cloud-detection (aws-detect, cloud-detect, aws-origin-detect, chatbot-detect, builtwith*, property-scan) | AT_RISK | NONE | MAINTAIN_ONLY |
| partner-trio | AT_RISK | NONE | MAINTAIN_ONLY |
| public-free-read (forj-contact, forj-notify, web-fetch, smith-demo) | AT_RISK | NONE | MAINTAIN_ONLY |

**Fourteen clusters assessed. Zero hold a chokepoint that survived adversarial attack.**

Three clusters earned a provisional DEFENSIBLE on first pass. All three were attacked and all three fell. That is the single most important line in this document, and it is stated in full below rather than buried.

---

## THE THREE DOWNGRADES

These were the best cases Forj had. They are written out at length because the temptation to re-argue them next quarter will be strong, and re-litigating them is itself a cost.

### nordic-corpus: DEFENSIBLE, downgraded to AT_RISK

**The claim.** Three accumulated states AWS cannot manufacture: the brreg delta cursor at 24,874,060, the `enrichment.domain_tried` measured-absence corpus, and the hostile-source Swedish bulkfil parser.

**Why it failed.**

1. **The cursor is replayable, and Forj's own code has the replay button.** `brreg-updates/index.ts:78` reads `const startCursor = b.reset ? 0 : ...` and line 85 builds `oppdateringsid=` or `dato=` from it. brreg's oppdateringer feed is a permanently addressable public event log on a monotonic integer. Forj obtained its history by replaying it. Anyone can replay it the same way. Worse, brreg publishes a full NLOD entity extract, so konkurs, underAvvikling, employee deltas, hjemmeside and address are all reconstructable by diffing two daily dumps from day two. The cursor is a bandwidth optimisation over a free file, not gravity.

2. **Measured absence costs about $500 to reproduce and has no expiry.** Price it off `domain-fill/index.ts:87`: Haiku tokens plus `web_search_requests * 0.01`, `max_uses: 2`. Ceiling around $0.02 per row. The 32,893-row domainless gap reproduces for roughly $400 to $700 unattended, inside existing proxy headroom. And line 95 writes a bare boolean with no timestamp and no attempt count, while line 63 excludes on it permanently. Companies launch websites. This is a depreciating liability wearing an asset's label.

3. **The gate was tested against build and never against buy.** "AWS cannot cheaply manufacture it" only ever asked whether AWS would engineer a Brønnøysund pipeline. It would not. It would not have to. AWS shipped firmographics in June 2026 without building a registry pipeline anywhere, which is direct evidence it already licenses third-party firmographic data. Extending that licence to Nordic coverage is a procurement cycle, not a build.

4. **The cluster's own membership refutes the moat.** `vainu-se-scan/index.ts` is Forj *buying* the Swedish corpus it claims is unmanufacturable. If it were unmanufacturable, Vainu could not sell it. Roaring, Bisnode/D&B Nordic, Creditsafe, Enin and Proff all sell the same join key. A Nordic consultancy buys a Vainu seat on Monday and has more coverage than Forj by Friday.

**What survives, stated narrowly:** nothing here is at risk *from AWS*, and the registry loaders will not be commoditized by Partner Central. That is worth knowing. "AWS will not take this" is a necessary condition for defensibility, not a sufficient one.

**Actions:** add a timestamp and attempt count to `domain_tried` so absence can be aged rather than trusted forever. Add the missing role gate on `scb/index.ts:108`, the only function in the cluster without one. Score `vainu-*` separately as vendor-dependency risk. **Stop describing the corpus as an owned asset in any exit or investor narrative** until reachability, which is the measured constraint, is closed.

### signal-feeders: DEFENSIBLE, downgraded to AT_RISK

**The claim.** Joining Nordic public-source events (JobTech, NAV, Vinnova, TED) to an org-nr keyed company base for firms with no AWS record.

**Why it failed.**

1. **The chokepoint is already sold, by a vendor Forj pays.** That join is Vainu's entire product. `vainu-orgnr-load/index.ts` queries `api.vainu.io` with `business_id__in=`, which is a bulk org-nr join returning domain, staff, turnover, city and contacts. Vainu sells company data plus buying signals across SE/NO/FI/DK to anyone with a card. Explorium covers Norway. A chokepoint you can buy from four vendors, one of whom already invoices you, is a subscription.

2. **Scope laundering.** The verdict conceded in its own text that each feeder is about 100 lines a competitor rebuilds in a day, and that credit belongs to the registry loaders. It then issued DEFENSIBLE to the feeder cluster anyway. That double-counts the corpus.

3. **Graded on intent, not on what ships.** `smith-brief/index.ts:303`: `const hitIds = ids.filter((id) => engaged[id]); if (!hitIds.length) return [];`, capped at 3 lines. The only output reaching a human is a signal on an account already in an active engagement, which is enrichment of known records, exactly what AWS shipped free on 2026-06-15. The discovery half that would be structurally safe is computed and thrown away. Volume: 171 rows total. `ted-awards-weekly` and `explorium-events-weekly` have never fired.

4. **Compliance is not standing.** The enskild-firma personnummer drop and the NAV no-raw-body row shape are six lines and a column list. GDPR and NAV's licence bind everyone equally. A Swedish partner signs its own DPA with Vainu and gets the same lawful pipeline.

5. **The faster threat is not AWS.** Clay ships job-posting and funding signals plus an HTTP enrichment column that calls Arbetsförmedlingen's CC0 API with no key. Andsend is Nordic and better polished. The Nordic data half is a commodity purchase; the AWS interpretation half is a free first-party feature since 2026-07-09. Squeezed from both ends.

**Action worth minutes, not days:** change `smith-brief:303` to surface unengaged and `no_match` rows. That is the only line in the cluster producing output nobody is already selling to Forj.

### champion-watch: DEFENSIBLE, downgraded to AT_RISK

**The claim.** Structural disinterest with a written citation. AWS withholds contact name, email and phone at invitation stage, "ensuring customer privacy and preventing lead farming behavior," in its own API docs.

**Why it failed.** The AWS reading is accepted and is not the problem.

1. **Disinterest is only load-bearing when it correlates with difficulty.** It worked for WorkSpan because orchestrating a partner's Microsoft pipeline is expensive and relationship-heavy for everyone. Here AWS's disinterest deters nobody. Job-change alerting ships inside LinkedIn Sales Navigator, a seat many Nordic partner reps already hold, plus UserGems, Champify, Clay and ZoomInfo. A chokepoint that routes Forj away from one non-competitor and into a field of ten actual ones is a redirect.

2. **There is no build to protect.** `champion-watch/index.ts:33-43` is one POST to `api.explorium.ai/v1/prospects/events`. Explorium detects; Forj polls. Forj is a reseller of a competitor's finished feature with 120 lines of polling in front.

3. **Forj already ran the defensibility experiment and got a negative result.** `src/champion-watch.js`, the roster-diff with the tested empty-roster guard, is dead. The header records it was replaced because "the Vainu roster-diff is dead with the Vainu trial." Swapping proprietary logic for a vendor call cost the product nothing. That is the operational definition of fungible. And the retired algorithm was itself a diff over *Vainu's* roster, so there was never Forj-owned detection here at all.

4. **Scale.** 160 watched contacts against a hard cap of 300, on a library of 52,318 rows. Not a corpus.

5. **The price floor is set by parties Forj does not control:** Explorium's invoice below, already documented as draining unattended, and a bundled Sales Navigator alert above. That is the Tackle and CloudCheckr configuration exactly.

**Actions:** keep the cron, keep the credit floor, **delete `src/champion-watch.js`** so it stops reading as owned IP, and never cite this cluster as evidence of a moat in a deck or a diligence conversation. The 20 lines worth keeping are the routing in `smith-brief:347` and `smith-nba:141`, which are defensible only in the trivial sense that nobody else has Forj's pipeline.

---

## PER-CLUSTER REASONING

### ALREADY_SHIPPED

**smith-outputs. STOP.**
Strip the plumbing and this is one prompt per function turning facts into Swedish or English sentences. `smith-nba/index.ts:123-163` is a hardcoded map plus two switch statements, and `stubCard()` at :164-184 returns the same copy with `grounded:false` when the model fails, proving the model is a wording layer not a decision layer. `campaign/index.ts:53` returns a hardcoded Swedish pitch identical per recipient bar the first name, and its own header lists drafting as "Coming." AWS shipped next-step recommendations 2026-03-16, readiness verdicts 2026-06-15, Opportunity Quality Score 2026-06-16, and sales plays plus call scripts plus email outreach 2026-07-09. Aggravating: `smith-brief/index.ts:186-233` proxies AWS's own `ListEngagementInvitations`, added 2026-07-18, one day before this gate. Same failure mode as the asset already destroyed, gated to one partner via `PC_TENANT` so it cannot serve tenants. Decisive fact is usage, not architecture: `ACTIVATION_30D.md` records against the live DB that Alto and Novalo have zero Smith calls ever. Forj hardened output quality for a product no paying customer has consumed, while AWS gave the same outputs away.

**partner-central-integration. MAINTAIN_ONLY.**
This is the asset that already died, still in the tree. `AI_NATIVE_SERVICES_READ.md:31` records the verified finding that asset #1 was a proxy over `GetAwsOpportunitySummary`. That call site is `pc-cosell-sync/index.ts:196`. `pc-mcp/index.ts:43` dials AWS's own hosted agents MCP server, which the customer reaches with their own IAM credentials. Every scored field rendered is authored by AWS. The only original code is a name matcher, and a join over someone else's data is plumbing. Note the maintenance tax made visible: `pc-mcp:22-24` is a comment working around AWS misspelling `GetAwsOpporunitySummary` in its own guide. Not fully live anyway (Console migration lapsed 2026-06-30, per-tenant IAM blocked on Novalo), so stopping forfeits little. **P3 writes and the ACE submission loop are cancelled**: AWS shipped conversational opportunity creation 2026-05-15 and fund-request drafting in the MCP funding tool.

**funding-eligibility. MAINTAIN_ONLY.**
A hardcoded decision tree, not an eligibility engine. Seven columns in, one of seven track labels out. Makes zero AWS calls, so it is not a proxy, it is an independent *guess* at AWS's number. `BAND_MID` at :66 asserts a 50-249 employee company is worth exactly $150,000 with no consumption signal, against AWS deal sizing computed from telemetry. Worse than dead weight: lines 203-219 push 2024 MAP thresholds and percentages as literal English into `rationale[]`, surfaced in the app. `multicloud_seed_partner_programs.sql` already carries two stale rows (Google Partner Advantage restructured Q1 2026, Microsoft PRACR co-sell ended 2026-07-01). **A wrong MAP percentage told to a partner is a credibility loss no build effort buys back**, and Forj holds no AWS partnership with which to check. The upstream defence fails: this is a pure function over a row that already exists. Upstream is a property of the corpus, not of every function that reads it.

**knowledge-base. MAINTAIN_ONLY.**
The asset #1 kill repeating, four times. `aws-knowledge/index.ts:8,25` proxies AWS's own free unauthenticated `knowledge-mcp.global.api.aws`. `aws-docs` mirrors awslabs. `ms-docs:27` calls Microsoft's free Learn MCP, `gcp-docs:82` calls Google's. The multicloud-disinterest defence dies there: every vendor has maximal incentive to make its own docs findable. The RAG half inverts data gravity, indexing AWS's own published PDFs while AWS holds the authoritative original and now serves semantic retrieval over it free. That is a maintenance liability pointed at Forj, and a live one: AWS retired POD, redefined "Committed," and since 2026-07-01 requires Marketplace listings to reach Committed/Launched. A frozen snapshot answers funding questions **wrong**, where wrong is most expensive. `src/smith-eval.js:172` checks groundedness and cannot check freshness. The one content class AWS could not reproduce, partner-confidential material, was deliberately banned after the 2026-07-14 leak.
**Liability found, fix it:** the private-tenant guarantee is not implemented. `_kb_pdf_ingest.mjs:91` sends `tenant_id`, `kb-ingest/index.ts:25` never reads it, and `kb-search` has no tenant predicate on any of its three paths. Grep for "tenant" across the three KB functions returns nothing. **Any workspace calling kb-search retrieves everything.** The control the leak motivated does not exist in code.

**meetings-voice. STOP.**
Two halves, both fail. The AWS-value half is one prompt at `meeting-webhook/index.ts:21-38` asking for next moves, an AWS funding play and a drafted follow-up email. AWS shipped deal advancement from transcripts 2026-03-16, opportunity drafting from transcripts 2026-05-15, and email outreach 2026-07-09. The half AWS will never build is given away free inside the meeting product the customer already pays for: Teams Copilot, Meet Gemini, Zoom AI Companion. Forj holds no capture IP; `meeting-start:75-93` is a POST body to MeetingBaaS at about $19/month. The EU argument inverts: Forj is *adding* sub-processors to a chain where the customer's own tenant already provides EU-resident transcription under a DPA signed years ago. Standing you rent from a French vendor is not standing you own.
**This is the clearest instance of the failure mode.** `BACKLOG.md:64` already recorded the right answer: "Phase 1 is ALREADY LIVE via briefFromFiles; Phase 2 stays on hold. No action." The hold was overridden anyway, producing a full Recall to MeetingBaaS swap, a v1 to v2 migration and a bot-identity commit across three commits on 2026-07-16, inside the ACTIVATION_30D window, at a partner Smith-usage rate of zero.
STOP means: run as-is until the next vendor break, then delete rather than repair. Twilio go-live abandoned permanently, not deferred. `cal-webhook` is genuinely useful and belongs in the signals cluster, not here.

### AT_RISK

**crm-sync. STOP.**
The stated purpose is false three ways. Not two-way: grep for outbound writes across all six returns exactly two hits, both auth-token exchanges. Not a sync: insert-only, never updates, no cursor, no conflict resolution. Not the partner's CRM: one global secret per vendor, and `crm-sync`'s own header concedes it. No deals or opportunities anywhere, so it cannot read or move pipeline. Five of six have never executed; the sixth ran dry on Jacob's own portal on 3 records. **Completing it (per-tenant OAuth, write-back, incremental sync, conflict resolution, deal mapping, times six vendors) is the most expensive remaining build in the codebase pointed at the least evidence of demand.** Both paying customers use the desk.
**Integrity issue that can reach a buyer:** `SMITH_CAPABILITY_MAP.md:68` states CRM sync into the Nordic top-5 is **LIVE** and that Smith's output lands pre-filled in the partner's CRM. There is no write path in the cluster and four of the five named CRMs have never been connected. `BACKLOG.md:44` stages the same claim for forj.se. **Fix the claim, not the code, and keep it off the public site until a write path exists.**

**icp-scoring. MAINTAIN_ONLY, zero hours on the weights.**
"Ranks accounts 0-100 and routes them to a partner" describes a product AWS shipped in June 2026. Contact Ready / Nurture / Limited Potential is a fit band with the numbers hidden. The corpus argument is true about the corpus and false about the scorer: eight CASE statements over existing columns, an afternoon to reproduce. It is also barely functioning: maturity is 28 points and populated on 0.60% of the library; 9,898 Norwegian companies tie on exactly 60. The 2026-07-19 eval already resolved that reweighting gains nothing (0 of 144 vectors, trades 76 deep-scanned accounts for 958 evidence-free ones, ceiling 66 against a hot threshold of 70). Keep it running, it is load-bearing for partner-trio, smith-brief, letter.js and champion-watch. Every marginal ranking hour pays off better in corpus coverage than in arithmetic.
**Re-cut note:** `icp-screen` and `pick_icp_candidates` are misfiled. They are registry-side list construction with a persisted suppression list. Move them to the library cluster. Do not use them to launder defensibility onto the scorer they share a prefix with.

**maturity-deepscan. MAINTAIN_ONLY.**
The entire input is `prompt(name, domain)`. No registry data, no corpus, no measured absence crosses into the model call. Any party with the same two strings gets the same answer from the same public sources, and AWS's MCP server already runs that prompt as a free hosted capability. Independently, it failed on economics before AWS was a factor: 516 of 85,693 companies carry a band after a year of running, at Sonnet plus four web searches per account against a $900 code-enforced cap. Commit 9136281 measured both widening and reweighting and shipped neither. There is no third option further hours unlock. Worth preserving as a by-product, not a reason to fund scan 517: `company_signals` holds a verbatim quote plus source URL per tool.

**cloud-detection. MAINTAIN_ONLY, on cost grounds only.**
Stateless per domain over five free public sources including AWS's and Google's own published IP-range files. The 19,420 accumulated reads are a cache of a computation anyone reruns free; the audit records cloud follows domain roughly 1:1. The rival-cloud slice is genuinely outside AWS's line but is a commodity SKU from BuiltWith, Wappalyzer, Datanyze, SecurityTrails, Explorium and Vainu. **Forj already pays two of them and wraps a third inside this very cluster.** The accuracy finding settles it, in Forj's own words: "cloud_provider narrows the lie; it does not tell the truth. The AWS and Azure counts are a call list, not an installed base." Keep it because a free unlimited-volume detector is the only affordable way to read 41,700 domained rows. **That is a cost advantage, not a defensibility advantage, and it must never be sold as one.**
`property-scan` (Swedish fastighetssystem for Alto Quattro) and `chatbot-detect` are mis-clustered and need separate gating. `builtwith/index.ts` is a tombstone returning 410.

**partner-trio. MAINTAIN_ONLY.**
The inputs are genuinely hard for AWS: the `migrate` lane selects on measured absence of every hyperscaler, which is by construction the set of companies AWS has no record of. But those inputs come from other clusters and are consumed in about 90 of 455 lines. What this cluster adds is three LLM reads and a fixed-scaffold email, which is Partner Lead Prospecting, shipped 2026-07-09. **The disqualifier is buyer-side:** Alto and Novalo are ACE-eligible and can call it free today. Forj cannot, but that is Forj's constraint, not a moat. Selling a paid drafting layer to a customer holding the free one is the exact graveyard configuration.
The surviving artifact is already built and free: `dry_run:true` at :366 returns selection plus grounding with zero paid calls, and it produced the only artifact that reached a customer conversation (alto-live.html, 2026-07-16). **The list is the asset. The email around it is not.**
Worth watching rather than funding: the cross-tenant exclusivity ledger at :255 and :259 is Crossbeam-shaped, and AWS has no standing to broker "this account is already worked by another partner." Today it spans two tenants in one database. That becomes a chokepoint at N partners, not at 2.

**public-free-read. MAINTAIN_ONLY.**
The cluster does not contain the defensible thing. The org-nr read lives in `smith-read` and `registry-search`, neither of which is in it. `smith-demo`'s three sample accounts are string literals; it queries no database. `forj-contact` and `forj-notify` are commodity web forms. `web-fetch` mode `tech` is a 19-entry company web-profiler, and AWS shipped profiling from public web data into the MCP server in March 2026 and website scanning into onboarding agents in June. And the audience is the population AWS now serves free: the ACE-eligible partner being impressed can already do it. **Assess `smith-read` on its own; do not let this cluster borrow its verdict.**
Inconsistency worth fixing: `forj-contact` fires Slack and Resend, both US processors, which `Forj_Public_Read_Spec.md` explicitly refused to reuse for that reason.

---

## STOP LIST

**No further build hours. Not deferred. Not backlogged. Stopped.**

STOP does not mean rip it out. Decommissioning costs hours too. It means: runs as-is until it breaks, then gets deleted rather than repaired, and no hour goes into it before then.

1. **smith-outputs, all eight functions.** No new prompt tuning, no new archetypes, no voice-gate work, no codify expansion. The output layer is free first-party as of 2026-07-09.
2. **crm-sync, all six connectors.** No per-tenant OAuth. No write-back. No incremental sync. No deal mapping. No fifth or sixth vendor. **And correct the LIVE claim in `SMITH_CAPABILITY_MAP.md:68` and `BACKLOG.md:44` this week.**
3. **meetings-voice, both halves.** The Twilio go-live checklist is abandoned permanently, not deferred. No further MeetingBaaS work at the next vendor break; delete instead.
4. **Partner Central P3 writes and the ACE submission loop.** Cancelled. AWS shipped it in May and June 2026.
5. **`explorium-events`.** Never fired, zero rows, output class already free from AWS's MCP. Kill it or leave it dark.
6. **ICP weight tuning.** Already measured twice and rejected twice. `alloy/tools/icp_eval/` stays as the gate; nobody touches the weights.
7. **KB embedding backfill, acronym-table maintenance and the four documentation proxies.** Exception: the tenant-isolation defect is a **security fix**, not a build, and ships regardless.
8. **partner-trio paid drafting.** `dry_run` is the product. The three sonnet reads and the composed email are not.
9. **`funding-eligibility`'s `ace_draft` and hardcoded MAP figures.** Removing the dollar thresholds from `rationale[]` is a liability fix, not a feature.
10. **Any new registry loader, any new signal feeder, any new country.** The measured bottleneck is reachability, not discovery: about 41,700 domained accounts against contacts on about 8,500. `REACHABILITY_PLAN.md` already named the failure mode: "the Norway census mistake in a Finnish hat."

## WHAT DOES GET HOURS

Nothing on this list earned DEFENSIBLE. These are the small, cheap, high-leverage items surfaced by the assessment, and they total well under a day.

- **Security:** tenant predicate on `kb-search`, and read `tenant_id` in `kb-ingest/index.ts:25`. The control the July 14 leak motivated does not exist in code.
- **Security:** role gate on `scb/index.ts:108`.
- **Truth:** correct the CRM "LIVE" claim before it reaches forj.se or a buyer.
- **Liability:** strip hardcoded MAP dollar thresholds from `funding-eligibility` `rationale[]`.
- **Hygiene:** timestamp and attempt-count on `domain_tried` so absence ages instead of being trusted forever.
- **Hygiene:** delete `src/champion-watch.js` so dead code stops reading as owned IP.
- **One line of real value:** `smith-brief:303`, surface unengaged and `no_match` signal rows. The only output in the whole feeder cluster nobody is already selling to Forj.
- **Reachability**, which is the measured constraint and belongs to a different plan than this one.

---

## RE-RUN TRIGGER

**Scheduled review: 2026-10-19.** One quarter. Not one year. The cadence is one funnel-advancing release per 30 to 60 days.

**Re-run immediately, out of cycle, on any of these:**

1. **AWS returns net-new companies.** If any release accepts a query and returns companies the partner did not submit, "AWS will not build the target list" is dead and every remaining verdict inverts. Watch: any extension of MCP "customer profile creation from publicly available web data" to bulk cardinality or to a bare name or domain.
2. **AWS reverses the contact-data refusal.** If AWS ships contact name, email or phone, the anti-lead-farming position is gone and champion-watch, explorium-people and the reachability plan all change shape.
3. **AWS lists Nordic registry or firmographic data on AWS Data Exchange, or names a Nordic data partner.** This is the buy path, and it is the one the first assessment failed to test.
4. **The pre-announced Marketing Central agents ship.** AWS has stated 2026 for "AI-powered agents for marketing orchestration and campaign automation." That lands on smith-author and campaign and confirms the STOP.
5. **A named competitor (Clay, Vainu, Andsend, Explorium) ships an AWS-partner or cloud-readiness layer.** The faster threat is not AWS, and this gate under-weighted that until the attack round.
6. **Forj obtains its own AWS partnership and becomes ACE-eligible.** This changes the buyer-side disqualifier on partner-trio and the whole free-versus-paid calculus.
7. **A first paying tenant actually uses the software rather than the desk.** Usage was decisive in three verdicts. If it changes, re-read them.

**Before any cluster gets build hours restored, it must pass the gate again in writing, including an adversarial attack round.** The first pass produced three DEFENSIBLE verdicts and the attack round destroyed all three. **A verdict without an attack is not a verdict.**

---

## WHERE THE EVIDENCE WAS THIN

Stated plainly, because a gate that hides its uncertainty is worse than no gate.

1. **"Free to all ACE partners" is not confirmed in any primary source.** It is a reasonable inference from ACE-eligibility framing and AWS's pattern, but no announcement states pricing on any agent capability. **The gate's central premise is currently unverified.** If AWS meters these capabilities, several ALREADY_SHIPPED verdicts soften. This is the single largest hole and should be resolved by asking a partner of record directly.
2. **Feb to July 2025 has thin coverage** in the ship log. Only CRM Connector point releases surfaced. There may be partner-facing releases in that window not captured.
3. **The 2026-07-14 subsidiary-connections item is aggregator-sourced.** Primary not fetched.
4. **Region footprint is unclear.** Lead enrichment is explicitly US-East-1. Partner Lead Prospecting says global. The two may not be on the same footprint, which matters for Nordic relevance and was not resolved.
5. **Per-release API deltas could not be read.** The RC 4 through RC 6.0 release-note pages redirect to a summary table, so operation names come from the leads guide rather than the changelog.
6. **Competitor claims are directionally sourced.** Clay's, Vainu's and Andsend's exact Nordic signal coverage was reasoned from public product surface, not tested against their APIs. The attack arguments rest on these being roughly right. They should be verified before any of the three downgrades is cited externally.
7. **Tackle's 2023 layoff numbers** come from aggregators and one local business post, not primary press. Medium confidence. The undisclosed-price-against-a-$1.25B-mark finding is solid and does the actual work.
8. **The $400 to $700 cost to reproduce measured absence** is computed from Forj's own per-row pricing at `domain-fill:87`, not from an executed run. Order of magnitude, not a quote.

---

## THE ONE LINE TO REMEMBER

Every dead vendor in this category had a genuinely better product than the free thing that killed it. Product quality was never the variable. **The only vendors that lived held something the platform could not hold: someone else's data, someone else's cloud, or someone else's signature.**

As of 2026-07-19, Forj holds none of the three in a form that survived attack. That is not a reason to quit. It is the reason to stop building and go sell the desk.

*Gate applied 2026-07-19. Next scheduled review 2026-10-19.*
