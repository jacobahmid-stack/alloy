# CLAY_STEAL.md
## What we take from Clay's playbook library, what we invert, what we ignore
### Founder document. Internal only. 2026-07-17.

Source: full read of ~40 Clay guides across 8 themes (foundations/TAM, waterfall data, signals/intent, AI-SDR/GTM-engineering, research/Claygent, contacts, scoring/inbound, ICP/ABM/MCP), gatekept against our laws, the day-91 gate (Sep 1: Alto/Novalo activation + first self-sufficient tenant), and the 2026-07-16 data audit (ALLOY_DATA_AUDIT.md). Budget reality: $444.72 headroom under the $900 code-enforced cap. Everything in STEAL NOW fits inside it with room to spare.

---

# 1. THE ONE PRINCIPLE

Rob Cook, Head of Sales Development at Clay, 2026-07:

> "Never tell a prospect something that anybody with access to the internet could know... The trigger does not become our message. But it does tell us where we should pay attention."

This is the sharpest sentence in the entire Clay corpus, and it cuts against Clay harder than it cuts for them. Clay's answer to "go deeper" is an AI research agent reading public web pages. Everything a research agent retrieves is, by definition, on the internet. Their deepest layer fails their own head of sales development's bar.

Ours does not. Alloy's message layer is computed, not found: MAP/POC/MDF lane and sizing, program windows, ACE and RA-ID paperwork state, the cloud read from primary infrastructure evidence. None of it exists on any web page in per-account form. The signal decides WHERE Smith looks. The funded-play math is WHAT the human says.

## The rulebook rule, ready to paste into every per-workspace GTM rulebook:

```
RULE: THE TRIGGER IS NOT THE MESSAGE

1. A signal (job ad, grant, tender, champion move, free read, business event)
   decides WHICH account gets a draft and WHEN. The signal itself never
   appears in the draft. Never "saw you are hiring", never "congrats on",
   never any reference to the event that fired.
2. Every opener must contain at least one fact the recipient cannot find
   with a search engine: their funding lane and size, the program window,
   the eligibility math, the co-sell paperwork state.
3. If no such fact exists for the account, Smith returns SKIP. A draft is
   never written around the gap. SKIP is a pass, not a failure.
4. Opener discipline: one sentence, under 25 words, no greeting filler,
   no flattery, no "I noticed", no exclamation marks, no em or en dashes.
5. The evidence stays internal: every ACT NOW line in the brief carries the
   verbatim signal quote, source URL, and one-line why, so the human knows
   the trigger even though the prospect never hears it.
```

Enforcement surfaces: Smith system prompts (reply agent, partner-trio, slash shortcuts), the self-verify judge pass, and the smith-slop/smith-eval Vitest floor (new cases: SKIP compliance on a signal-less account, opener length, banned-phrase list, trigger-naming ban).

## Before and after, with our own data

Signal: JobTech ad matched to a Swedish mid-market logistics company, hiring a "DevOps-ingenjor med AWS-erfarenhet". Library says: domained, ~120 employees, no hyperscaler footprint detected until last quarter, now early AWS traces, ICP fit 74, MAP Assess eligible, no prior ACE opportunity.

BEFORE (Clay's own template, trigger as message):
"Hi Anna! Saw you are hiring a DevOps engineer with AWS experience. Congrats on the growth! Companies like yours use us to..."
Everything in that sentence is on the internet. Anna's own careers page told her this morning.

AFTER (the trigger points, the math speaks):
"Your first AWS workload can be assessed on AWS's budget, not yours: you qualify for a funded assessment lane most Swedish firms your size never claim."
Not on any web page. The ad fired the draft; the ad is nowhere in it. Anna learns something she did not know, from a named human, from that human's real inbox.

---

# 2. STEAL NOW (this week and this month, all $0 unless marked)

Ranked by day-91 value per unit of effort. Every item names its landing surface.

## Tier 1: this week

**S1. Hallucination floor sweep.** (Converged in 6 of 8 themes; it is also the live blind-rows bug from ALLOY_DATA_AUDIT.md.) One instruction pattern retrofitted onto every LLM surface: locked output schema, confidence field, source citation, explicit permission to return Unconfirmed / Not found / SKIP, verdict as the last token (evidence before score), devil's-advocate line in the self-verify judge ("include one reason this might NOT fit").
Landing: domain-fill prompt, nightly feeder prompt, maturity scan, partner-trio, reply agent; Vitest cases in smith-slop/smith-eval.
Effort: 1 day. Cost: $0. This ships first because everything else compounds on clean data.

**S2. Fit x Timing split with a tier-to-action contract.** The single biggest convergent steal (6 of 8 themes independently arrived at it). Two stored axes, never blended: fit_score (registry firmographics + ICP bar + funding-lane eligibility) and timing_score (signal recency and weight). Routed as a 2x2:
- Fit + live signal = ACT NOW.
- Fit + funding-lane eligibility, no live event = the MAP-Assess lane, Tier B, nurtured and watched. This converts the audit's worst finding (the "independent" cohort scoring cold) into a routed lane. The 227/640 rival-cloud POC cohort lives here too.
- Signal without fit = one-line note in the brief, never a draft.
- DQ = persisted dq_reason enum from the FORJ_ICP.md anti-ICP tripwires, hard-excluded from all paid enrichment forever; signal hits on DQ rows are logged but never surface.
Plus: tier_promoted signal_event on line crossings, matcher-triggered live re-score (a 40s account can flip hot the same night), and a routing reason on every brief line ("routed to Alto: Kundo tag + property segment"). The 70/40 vocabulary stays ONE vocabulary, living on the fit axis.
Landing: ICP scoring edge fn, companies columns, signal matcher, smith-brief + src/letter.js, per-workspace GTM rulebook, ICP_QUALIFICATION.md.
Effort: 2-3 days. Cost: $0.

**S3. Composite timing score (the Hett rung our own plan already names).** Rides inside S2. Weights: free-read submission +5, champion move +4, JobTech/NAV cloud-role ad +3, Vinnova +3, TED +3, Explorium event +2, cloud-detect flip +2. Per-type expiry: tender until deadline, grant 4 weeks, job ad while posting is open, champion move 90 days; expired lines silently drop from the brief. Convergence flag at 2+ signals inside 14 days goes to the top of ACT NOW. Evidence contract on every ACT NOW line: verbatim quote, source URL, one-line why.
Landing: matcher edge fn, signal_events schema (expires_at), smith-brief composer, smith-eval gate.
Effort: folded into S2. Cost: $0.

**S4. Free-read instant path.** The only place Clay's 5-minute speed law is real for us. Widget submission on forj.se becomes a signal_event (type free_read, highest weight) and fires an immediate Slack ping to Jacob with the enriched read attached. Today that intent, a prospect typing their own org-nr into our box, dies until the next morning brief.
Landing: free-read backend fn + the smith-on-shift Slack path.
Effort: hours. Cost: $0.

**S5. Feeder healthcheck + idempotency.** Clay's own war story: an upstream format change returned 200 OK with empty parses for weeks. That is our feeder bug in a different hat. Daily row-count and null-rate check (domain, org_nr, signal payload) posting one line into the morning brief; unique (source, entity, day) constraint on signal_events so re-runs overwrite instead of duplicate; alias-to-orgnr normalization enforced at matcher extraction time, never downstream.
Landing: new tiny cron edge fn + signal_events migration + matcher.
Effort: hours. Cost: $0.

## Tier 2: before day-91, activation-facing

**S6. Smith Functions on the alloy MCP as a Claude connector for Alto/Novalo.** Clay's answer to the exact adoption problem ACTIVATION_30D exists for (partner usage was 0 ever) is to meet reps inside the chat tool they already open, via named, admin-vetted Functions. Ours: workspace-scoped Functions returning finished deliverables, not rows: "Account Brief", "Trio Draft", "Funding Fit". Input contracts org-nr first, domain second, name last with fuzzy flagged low-confidence. Scope doctrine in onboarding: 1-20 accounts in chat, bulk stays in Alloy. Ship the one-page "how partners break Smith" failure-modes sheet (name-search, bulk-in-chat, drafting without a contact source). Implement the per-tenant caps in claude-proxy (spec already held from the gateway verdict).
Landing: alloy MCP server (alloy_find_prospects, alloy_company_read, alloy_cloud_and_stack, alloy_funding_fit), ACTIVATION_30D.md, partner onboarding, claude-proxy.
Effort: 2-4 days. Cost: $0.

**S7. Champion-watch back half: the job-changer re-find loop + lost-champion flag.** Detection is live; a detected move currently ends as a line, not a door. New loop: job-change fires, match the new company against the 52,318-row library (Norway is a census, it will often be there), ICP-score it, Explorium re-find the work email with the richest key first, free MX gate on the result, Smith drafts the re-intro, ACT NOW line with a 90-day clock. Risk side too: "your champion LEFT account X" surfaces to the partner holding that engagement.
Landing: champion-watch fn + explorium-people + smith-brief.
Effort: 1-2 days. Cost: a few licensed Explorium lookups per week, inside existing spend.

**S8. Domain-fill ladder upgrade against the 32,893-row choke point.** New free rungs above Haiku, hard halt at first verified hit, per-rung counters so the audit's coverage numbers regenerate nightly:
- Rung 0: slug-guess (.se/.no permutations of the registry name) verified via the existing DoH module.
- Rung 0.5: one-off directory join on org-nr/legal name from OPEN sources only: association member lists (Fastighetsagarna, BIM Alliance, doubles as Quattro targeting), AWS Summit Stockholm exhibitor and sponsor lists, supplier catalogs. No commercial re-publishers behind ToS walls.
- Rung 1: CT-log subject-name match.
- Rung 2: Haiku + web_search, unchanged, country-gated, with the S1 floor.
- No paid rung.
Landing: domain-fill edge fn + one harvest day.
Effort: 1-2 days plus harvest. Cost: $0.

**S9. Contact hygiene at $0 over the 53,894 Vainu rows.** One pass on existing DoH infra: syntax normalize + MX-exists verdict column (valid-domain / dead-domain / role-based / unknown), plus a dedupe and normalize audit. Drafting gate: Smith never drafts to dead-domain, and flags catch-all/unknown in the draft header ("verify before send"). Dead MX on a contact's domain doubles as a company signal_event. Add deterministic seniority buckets (C-suite/VP/Director/Manager/IC) and economic-buyer vs champion role fields via regex/lookup. Enforce richest-key-first (email > domain > bare name) on every Explorium query. Suppression stays provenance-aware: Novalo's Gatling-imported lost/disqualified rows remain the re-attempt pool per the standing rule.
Landing: contacts columns + cloud-detect DoH extension + reply-agent and trio prompt rules + explorium-people query builder.
Effort: 1-1.5 days. Cost: $0.

**S10. Trio committee upgrade.** Every AWS funded deal is a committee deal. Trio v2: 2-3 stakeholders per target where licensed data has them, seniority-classified, and the committee is two-sided: partner-side ACE owner + customer-side economic buyer. "Still here" verification JSON (confidence + evidence URL + employed flag) required before Smith names anyone. Contacts fetched engagement-gated, only when an account crosses hot; this is the working answer to "contacts do not scale free".
Landing: partner-trio edge fn contact-selection step.
Effort: 0.5-1 day. Cost: marginal licensed lookups on hot accounts only.

**S11. Existing-owner-first invariant.** Before the matcher emits an ACT NOW or the trio picks a candidate, check engagements across all three workspaces; an account inside another partner's active engagement never routes again. With multi-workspace live, this is a correctness bug waiting to happen, not hygiene.
Landing: matcher + trio candidate queries.
Effort: hours. Cost: $0.

**S12. Push-to-human send.** The legitimate automation dividend Clay gets from sequencers, captured without the category: Smith's finished draft lands one click into the partner's own mail client (mailto/.eml from the app). The human stays on the send button; the copy-paste friction dies.
Landing: alloy-page draft surfaces.
Effort: 0.5-1 day. Cost: $0.

**S13. Outcomes-replay eval.** "A weight is not a vote on how important an attribute feels." Replay our 24 real outcomes (20 meetings, 3 proposals, 1 closed) through the new two-axis scorer as those accounts looked pre-contact. Recall and precision at the 70 line become a Vitest gate; a monthly scoring-health line ships in the brief; the rulebook gets the re-tune trigger verbatim: re-weight when recent winners stop scoring high.
Landing: Vitest next to the existing scoring evals + smith-brief.
Effort: 1 day. Cost: $0.

## Tier 3: foundation, inside 30 days

**S14. Freshness plumbing.** Per-surface enriched_at / last_verified_at columns; a verified/incomplete/rotted health enum (feeder rows enter incomplete and are never counted usable until they clear the ladder); tiered refresh cadence (active engagements near-daily, hot weekly, warm monthly, DQ and domainless never re-touched); crons pull oldest-first from narrow filtered views (fits the never-select-star gotcha); write trust hierarchy (human-entered > enrichment > monitor flag > stale, stages stay engagements-only); field-level survivorship (registry wins firmographics, Vainu wins contacts, our detectors win cloud and stack, signals accumulate from all); dedupe-at-entry on orgnr + normalized domain; canonical display name and legal name stored separately at ingest. Protects the ~4,700 usable accounts, the only asset decaying at Clay's quoted 30 percent per year, and stops double-spend against the cap.
Landing: companies table + feeder insert path + all loader upserts + cron queries.
Effort: 2-3 days. Cost: $0.

**S15. stack_mentions[] from job-ad and tender text.** HG Insights' whole edge is reading non-website text; we already ingest the Nordic equivalent free. Deterministic keyword pass over JobTech/NAV/TED full text tagging AWS/Azure/GCP/K8s/Snowflake and friends onto signal_events and the company row. A domainless registry row with a matched job ad gets a cloud read WITHOUT a website: a partial bypass of the choke point itself.
Landing: matcher + companies columns.
Effort: 1 day. Cost: $0.

**S16. Install-age timing.** Log first-seen in cloud-detect; read BuiltWith first-detected dates. "Rival-cloud footprint first seen 4+ years ago" is a contract-aging proxy and becomes a POC-ladder timing qualifier in the funding engine and an ACT NOW qualifier. Message stays cloud-agnostic by law: the funded play ON their cloud, never "move off".
Landing: cloud-detect + funding-eligibility engine + brief.
Effort: 0.5-1 day. Cost: inside existing BuiltWith budget.

**S17. Look-alike tag.** One-off deterministic similarity pass (industry, size band, cloud posture, maturity band) against the 24-outcome set; a lookalike entry in list_tags[]; feeds the brief. Free, uses columns we already have.
Landing: one-off script + list_tags[].
Effort: 0.5 day. Cost: $0.

**S18. Plumbing kit.** COALESCE dual-naming on ingest RPCs (kb-ingest, signal ingest) so either side can rename fields without breakage; replace-all child-row strategy on re-runs; pinned test row + strict schema assert per LLM extractor fn.
Landing: db.forj.se RPCs + Vitest contract tests.
Effort: 1 day. Cost: $0.

**S19. Persisted judgment columns.** what_they_sell and switch_trigger ("one phrase or none visible"), enum-locked, written once by the maturity scan instead of re-derived per draft. Feeds the trio first line and alloy_company_read.
Landing: maturity scan output schema + companies columns.
Effort: 0.5 day. Cost: tokens within cap.

**S20. Provider-disagreement flag + hand-check-50.** BuiltWith vs free cloud-detect conflicts flag for review instead of last-write-wins; a random-50 hand-check per domain-fill batch feeds one line into the brief.
Landing: alloy_cloud_and_stack reconciliation + weekly cron.
Effort: 0.5 day. Cost: $0.

## Tier 4: doctrine and documents, hours each, $0

**S21. ACTIVATION_30D KPI frame.** Researched-accounts-per-week per partner as THE activation metric (Clay's 80 manual vs 600 systematic framing: the lever is researched volume, not reply rate). Positive-reply bands as the health readout: under 1 percent means fix the read and the list, not the volume; over 3 percent means scale. Meetings-booked or hours-saved as the only two success metrics per play. Anti-vanity rule: row counts are never reported; 52,318 is a vanity number per our own audit. Same numbers into the CUBE investor-gate sheet.
Landing: ACTIVATION_30D.md + QUATTRO/CUBE sheets.

**S22. Test-batch doctrine.** 25-50 row hand-checked batch plus one named KPI before any new feeder or prompt change reaches the brief; dry-run-first for every new fn (generalizes the trio's dry_run). Halt threshold: over 15 percent generic or hallucinated output kills the batch.
Landing: alloy-tests doctrine + rulebook.

**S23. 200-known-ICP coverage eval.** Run the full ladder against AWS-12 + the hot cohort; publish per-layer coverage (domain %, cloud-read %, contact %) as a Vitest data gate, regenerated in each audit, alongside cost-per-verified-record. Headline we can already state: roughly $0.10 per enriched, scored, program-mapped account, registry to brief.
Landing: Vitest + ALLOY_DATA_AUDIT metrics section.

**S24. Deliverability pre-flight as an onboarding deliverable.** Free SPF/DKIM/DMARC presence check via DoH on each partner's real sending domain, one-page pass/fix read. Rulebook circuit-breaker: over 2 percent hard bounces on tracked sends and Smith stops proposing outreach, surfaces hygiene instead. Doubles as a free credibility artifact in sales conversations.
Landing: small edge fn + ACTIVATION_30D onboarding checklist + GTM rulebook.

**S25. Bottoms-up TAM in Forj_Raise_Narrative.md.** TAM = 52,318 ceiling; SAM = the ICP-matched library including the Norway 3,381 re-cut; SOM = ~4,700 workable today, times price-card ACV, times penetration. AWS-12 = the SOM ring of the account-based motion. Rows with receipts: the thing Clay's own TAM guide says almost nobody has.
Landing: Forj_Raise_Narrative.md, one slide.

**S26. 100-unit effort tiering in the rulebook.** AWS-12 = 1:1 (full account plan + trio + committee map); hot 70+ = 1:few (lane narratives per Migrate/Expand/AI-POC); warm = 1:many (brief mentions only). Brief sections ordered by tier so hot stops being one flat bucket.
Landing: per-workspace GTM rulebook + smith-brief section ordering.

**S27. Vendor renewal ammo.** At Vainu and Explorium renewals, ask the one question Clay says is more revealing than database size: "How often do you re-verify a record, and what triggers it?"
Landing: PARTNER_SIGNALS.md.

---

# 3. STEAL WHEN FUNDED

Each item: what it is, cost against the $444.72 headroom, and the gate that must pass first.

**F1. EU-resident single-address email verification at draft time.** Mailbox-level verdicts (beyond our free MX tier) for the 1-3 contacts actually entering a draft that week, via one licensed EU-resident verifier API. Never list-wide.
Cost: roughly $5-15/month at desk volume.
Gate: S9 free MX tier live first, and a real bounce observed on a partner send. Until a bounce happens, the free tier is sufficient.

**F2. Google Places website-field fallback for the domainless tail.** The one paid rung the domain ladder is allowed to consider, and only after every free rung (S8) has run dry. OSM first, always.
Cost: Places Details is roughly $17 per 1,000; a 5,000-row tail experiment is ~$85.
Gate: S8 shipped, per-rung counters proving the free rungs are exhausted, and the remaining tail demonstrably contains ICP-band rows worth the spend.

**F3. Agentic deep-research on demand.** Clay's Claygent pattern, constrained: a Smith slash shortcut that runs a source-grounded, schema-locked research pass on ONE account, hot-band (70+) or explicitly requested only. Never a library-wide crawl; a 52k-row agentic bill is how the cap dies.
Cost: roughly $0.05-0.15 per account; $10-20/month at realistic usage.
Gate: S1 hallucination floor live (the research output inherits the same contract), and the two-axis scorer (S2) deciding who qualifies as hot.

**F4. BuiltWith change-api cadence increase.** Adoption-date deltas ("adopted X 8 months ago") on the hot cohort at a faster refresh than today.
Cost: inside the existing BuiltWith budget if scoped to hot-only; expand only with tenant revenue.
Gate: S16 install-age timing live and demonstrably feeding ACT NOW lines partners act on.

**F5. AEO visibility tracking (Clay's own dashboard pattern).** Scheduled non-branded buyer prompts through the assistants, strict JSON extraction, Supabase storage, visibility and share-of-voice metrics. Their build lesson (custom on Supabase, 2 days, one fifth the cost of buying) is our doctrine already.
Cost: roughly $20-40/month of tokens if automated; $0 as a manual monthly spot-check.
Gate: LinkedIn launch Post #0 is out and one quarter has passed. Pre-launch there is zero search demand to measure. Start manual, automate only if the numbers move.

**F6. Explorium pool expansion past 300 watched.** Champion-watch pool growth beyond the current self-draining hot_unwatched runway.
Cost: inside existing Explorium terms until the pool math says otherwise.
Gate: S7 re-find loop live, and evidence that champion-move ACT NOW lines convert to partner action.

---

# 4. REDEFINE (Clay's idea, our shape, and why ours is ammo, not a limitation)

**R1. Sending infrastructure becomes no infrastructure.**
Clay's version: burner domain variants, SPF/DKIM/DMARC on throwaways, 3-4 week warmups, 20-30 sends per inbox per day, "never your primary domain."
Our version: Smith drafts; a named human sends from their own long-established inbox. Every send carries a real domain's real reputation.
Why it is ammo: their own best practice concedes cold automation burns domains. Six of their seven deliverability trust factors are solved by our architecture instead of by infrastructure spend. Law: human sends everything; SES scratched.

**R2. The email waterfall becomes a domain waterfall.**
Clay's version: five contact-email providers, cheapest first, pay the winner.
Our version: the same discipline pointed at OUR choke point, domains (32,893 domainless rows): slug-guess, directory join, CT logs, then Haiku, hard halt at first verified hit, per-rung coverage counters. Contacts stay licensed-only.
Why: Article 14 makes scraper-derived contact chains poison in the EEA; domain-fill is where the waterfall math actually pays for us. Law: never scrape, licensed people sources only.

**R3. Bought intent becomes the public record.**
Clay's version: tracking pixels, pricing-page visits, third-party intent panels.
Our version: JobTech and NAV ads, Vinnova grants, TED tenders, registry events, licensed Explorium business events. Plus the strongest first-party signal in the category: a prospect typing their own org-nr into the forj.se free read.
Why: Clay's own guides call tracked activity vanity. Ours is verifiable source documents, free, EEA-clean. Laws: EU residency, free-first, no surveillance-shaped data.

**R4. The blended score becomes fit times timing.**
Clay's version: one number, or at best two axes feeding a sequencer.
Our version: fit and timing multiplied, never summed, with funding-lane eligibility as a first-class citizen of the fit axis. Their 25 percent weight on "funding recency" means VC rounds; ours means MAP/POC/MDF eligibility, which is deterministic program math, not probabilistic intent.
Why: it un-freezes the MAP-Assess cohort the audit caught scoring cold, and our rationale lines are auditable arithmetic while theirs are LLM prose. Law: ONE 70/40 vocabulary, outcome positioning.

**R5. "Hire a GTM engineer" becomes "Smith is the GTM engineer."**
Clay's version: a new org function that duct-tapes the lab together, run like product engineering.
Our version: the finished play for exactly one motion, AWS partner GTM in the Nordics, pre-built: territory, programs, funding math, co-sell paperwork.
Why: they sell the lab; we hand over the finished play. Law: not an AI SDR; Smith is a PDM.

**R6. Credits become outcomes.**
Clay's version: 500 free credits on first connect, per-rep credit limits, metered everything.
Our version: one finished READ, free, once. Then outcome pricing.
Why: a credit is a token by another name, and the anti-token spine is live on the pricing page. Law: outcome pricing, never credits/tokens.

**R7. Committee mapping without the scrape.**
Clay's version: five-role buying committee sourced from profile scraping, job-change alerts keyed on LinkedIn URLs.
Our version: two-sided committee (partner-side ACE owner + customer-side economic buyer) mapped only on Tier-1 and engaged accounts, drawn on demand from Vainu/Explorium with Article 14 basis recorded, stored in engagements, never the shared library. Champion-watch already runs their flagship job-change trigger on licensed identity.
Why: Proxycurl's shutdown is the obituary for their key. Ours survives an audit and a procurement questionnaire. Law: never scrape LinkedIn.

**R8. Verify-before-load becomes verify-before-draft.**
Clay's version: bulk SMTP verification to protect sequencer deliverability.
Our version: a bounce lands on the PARTNER's real inbox, so verification is partner protection: free MX gate on everything, flag catch-all/unknown in the draft header, nobody presses send on Unconfirmed.
Why: depth per draft beats coverage per list at desk volume. Law: human sends.

**R9. Displacement becomes the funded play on their cloud.**
Clay's version: "competitive displacement" against aging installs.
Our version: keep the install-age timing signal (4+ years = renewal-adjacent), flip the message to the funded play ON the detected cloud, in that cloud's own program vocabulary, or the AWS-side POC lane.
Why: displacement economics without displacement language. Law: cloud-agnostic partner-friendly copy.

**R10. Their identity machinery becomes our primary key.**
Clay's version: fuzzy dedupe, AI name canonicalization, waterfall identity resolution, "search by domain, never name."
Our version: org-nr. Sweden and Norway issued the primary key decades ago; the registry name is the legal truth. Fuzzy matching survives only at the domain layer and for joining directory rows to registry rows.
Why: an entire product category of theirs is a solved problem in our territory. Their inbound flow guesses who you are from an email; ours starts from the org number and knows.

---

# 5. IGNORE (one line each)

- Email-provider waterfalls (Findymail, Hunter, Wiza, Enrow, BetterContact, Icypeas): Article 14 poison; the shelf is fixed at Vainu + Explorium.
- Sequencer selection, warmup config, inbox rotation, volume ramps, auto-enrollment: the category we refuse and define ourselves against.
- Phone waterfalls and dialer routing: call capture parked, no dialer ever, mobiles are max-sensitivity Article 14 data.
- Bulk SMTP probing from our infra: port 25 reality plus no bulk motion; MX-only free tier does the job.
- LinkedIn-URL-keyed monitoring and profile scraping wholesale: hard law; champion-watch already does it legally.
- Zenrows/Apify bot-wall bypass: if it is walled, the open-data version is the route or there is no route.
- Third-party intent panels (Bombora-shaped): US panels, GDPR-hostile, paid, redundant to five live free feeders.
- Tracking-pixel website intent: no surveillance-shaped data; the org-nr free read is stronger and legal.
- Per-account bespoke public landing pages: public-copy redaction law; the trio email is the 1:1 artifact.
- HG Insights: enterprise-priced; JobTech/NAV ad text is install-base intelligence at $0.
- Google Maps as a sourcing engine: Bolagsverket and brreg are a census; Places survives only as the F2 tail experiment.
- Predictive ML scoring: needs thousands of outcomes, we have 24; deterministic plus replay is the correct regime and Clay agrees.
- MQL/SQL treaty mechanics, SDR round-robin pools, rep capacity planning: no marketing team, no rep pool, a founder desk.
- Clay Actions/credits billing math, Claygent Builder plumbing, HubSpot/Salesforce field mechanics: their platform's internals, not ours.
- ChatGPT as the distribution wedge: our partners live in Slack and Claude; the connector + @smith two-way is the motion.
- Gmail dot/plus email normalization: consumer-specific, wrong for B2B domains, contacts arrive pre-keyed.
- 3M-company scale claims and 10x-SDR case studies: vendor marketing; our lever is territory coverage, not volume.

---

# 6. POSITIONING

## The "we are not that" paragraph for 1:1s (never name the competitor publicly)

"There is a whole category of tools right now that will sell you a lab: a hundred data providers, a scraping agent, credits, and a course on how to wire it all together so a robot can send more email. It is genuinely clever plumbing. But look at what their own people admit: their head of sales development says never tell a prospect anything they could Google, and everything their research agents retrieve is on the internet by definition. And their own guides tell you to hide your primary domain from your own outbound, because they know what automated sending does to trust. We took the opposite bets on both. Our message layer is computed, not found: whether your customer qualifies for a funded assessment, in which program, at what size, by which deadline. That exists on no web page. And every mail is sent by a person you know, from their own inbox, because Smith is not a sales robot. Smith is a partner development manager: territory, programs, funding math, co-sell paperwork. They sell the shovel and the plumbing. The insight is already in your morning brief, and a human holds the pen."

## Vocabulary to ADOPT (internally, and selectively outward)

- GTM engineering (the discipline is real; we just ship it pre-built)
- State change and play (the rulebook grammar: every state change has a named play)
- Usable coverage, cost per verified record (the honest metrics)
- Signal shelf life / freshness window
- Finished record (tier + contact + signal + opener context = done)
- Clean core, data contract, Not-found floor
- Fit and intent as separate axes (we say fit and timing)
- Draft-then-approve (we say: Smith drafts, you send)

## Vocabulary to REFUSE

- AI SDR (tainted category; Smith is a PDM)
- Credits, tokens, actions (anti-token spine: we sell the next closed deal)
- Sequences, cadences, touches (we have drafts and human sends)
- Intent data (we read the public record)
- Displacement (we fund plays on the cloud they have)
- Waterfall, outward-facing (fine internally; publicly we say "the registry route")

## The one-liners (vendor-name-free, no em or en dashes, cleared for use)

- We do not estimate the Nordic market. We have it, row by row, from the source registries. Norway is literally a census.
- Enrichment waterfalls exist to guess an identity. In the Nordics the government settled identity in 1974.
- Tech stacks are readable by anyone with a subscription. Whether your customer qualifies for a funded assessment, which program, at what size, by which deadline: that exists on no page. We compute it before breakfast.
- No burner domains. No warmup farms. No sequences. A person you know sends every mail, from their own inbox, and the replies show it.
- We do not buy intent panels and we do not track your visitors. We read the public record: job ads, grants, tenders, registry filings.
- Our strongest buying signal is a prospect typing their own organisation number into our reader. Nothing a tracking pixel produces comes close.
- For every contact we can answer where it came from and under which legal basis. That sentence survives a GDPR audit and a procurement questionnaire.
- We do not sell you tokens. We sell you the next closed deal.
- They sell the lab. We hand you the finished play.

---

# 7. WHAT CLAY CANNOT DO THAT WE CAN

Stated plainly, with tonight's numbers where they bite.

**1. Compute the message.** Clay's deepest layer retrieves public web facts at mid-80s provider accuracy. Alloy computes MAP/POC/MDF eligibility, program windows, ACE and RA-ID paperwork state per account, deterministically, from free inputs. This is the only layer that passes Rob Cook's own bar, and Clay's architecture cannot reach it because the data is not on the web to retrieve.

**2. Start from a census.** Clay assembles identity from up to 150 partial providers. We start from Bolagsverket, SCB, and Bronnoysund: 52,318 rows with a government-issued primary key, Norway complete, acquired at roughly zero SEK. Their flagship TAM quote, that the number is a claim and the rows are the asset, describes what we already possess.

**3. Survive an EEA procurement questionnaire.** Every contact in our library has licensed provenance and a recorded Article 14 basis. Clay's contact layer rides on scraper-derived sources whose flagship supplier already shut down under legal pressure. In our territory this is not compliance overhead, it is a moat.

**4. Send with inherited trust.** Clay's own best practice is to hide your primary domain behind burner variants and warm throwaways for weeks. Every Alloy send leaves a real person's real inbox. Six of seven deliverability trust factors, solved by architecture, at $0.

**5. Run the trigger without burning it.** Clay users act on the same default signals every competitor with a seat can buy. Our feeders (JobTech, NAV, Vinnova, TED, Explorium events) are free, Nordic-specific, and matched to a registry-keyed library; and by rulebook the trigger never appears in the message, so the signal cannot be pattern-matched and tuned out by the market.

**6. Price the outcome.** Clay meters credits; we cleared roughly $0.10 per enriched, scored, program-mapped account, registry to brief, under a code-enforced monthly cap, and sell the outcome, not the meter. Their own growth team built its internal dashboard on a free stack in 2 days at a fifth the cost of buying one: our doctrine, argued by their own pen.

**7. Turn the audit's hole into a lane.** A Clay workspace with no live signal on a strong-fit account files it as nurture and waits. Our funding engine gives that same account a standing, non-decaying signal: MAP-Assess eligibility at any size. Tonight's cold "independent" cohort, and the 227/640 rival-cloud POC cohort, become routed Tier-B lanes the moment S2 ships. Clay cannot manufacture that signal for any customer at any price, because it is not data. It is math they do not have.

---

*Execution order: S1-S5 this week (one week of work, fixes a live data-corruption bug and the audit's worst scoring finding before anything compounds on top). S6-S7 in parallel as the purest ACTIVATION_30D levers. Everything in section 2 fits inside the $444.72 headroom; recurring costs are licensed lookups already budgeted. Nothing in this document requires a new vendor, a new law, or a single automated send.*
