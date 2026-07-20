# Forj ICP (canonical, 2026-07-04)

This document is the single source of truth for who Forj sells to and how fit is scored. Every other artifact (code, prompts, site copy, pitch decks, memory notes) maps to this document or gets rewritten. Where a definition here conflicts with an older file, this document wins; the older file is listed in "What this replaces" below.

**Three levels, declared up front. Never mix them again.**

- **Level A: Forj's partner ICP.** Which cloud partners get a Desk slot or a Software seat. That is this document's main body.
- **Level B: the generic end-customer box.** Which accounts score well in Alloy for ANY partner. Owned by the deterministic icpScore in `alloy-page/src/scoring.js` (0-100, cloud-fair, Vitest-locked). Described in "One scoring vocabulary" below.
- **Level C: per-partner wedges.** Quattro/property for Partner A, digital-native mid-market for Partner B. Wedges live INSIDE a partner's workspace as configuration, never inside Level A or Level B. Described in "Wedges vs ICP" below.

Every criterion in this document carries one of exactly three check types:

- **[DATA]** verifiable from what Alloy already holds (registry, headcount, domain, cloud detection, techstack, maturity band).
- **[DIRECTORY]** verifiable in a public partner directory (AWS Partner Finder, the Microsoft Solutions Partner directory, the Google Cloud partner directory), with the tier named exactly, never "or equivalent".
- **[CALL]** verified in the first call, with the exact question and the exact disqualifying answer written down.

If a rep or Smith cannot resolve a criterion in 30 seconds using one of these three, it does not belong in this document.

The quality bar underneath everything stays verbatim and is not up for rewording: a qualified opportunity is **the right stakeholder, with a clear business need and the authority to act.** (Canonical since 2026-06-04, live in the MDF pitch and on the forj.se proof band.)

---

## The one-sentence ICP (who Forj sells to, memorizable)

**Forj sells to the cloud services partner of 10 to 200 people that holds a named partner tier on AWS, Azure, or Google Cloud, sells in a market Alloy's data covers (Sweden today), and puts a named person on every meeting we book.**

Say it shorter on the phone: *a 10 to 200 person cloud partner, tiered on one of the three clouds, in Sweden, with a named closer.*

Why this partner exists as a market: in one summer the three clouds committed roughly $4.25B to embedded delivery and named only their own benches and the global SIs. The mid-market partner, the other ~120,000 firms, is on nobody's list. They must originate their own demand or become subcontractors. That firm is Forj's buyer. (This paragraph is market narrative, not a qualification criterion; the qualification criteria are the tables below.)

The three clouds are equals in every criterion in this document. AWS, Azure, and Google Cloud partners qualify on identical terms. One honesty note that belongs in the ICP, not in the fine print: Forj executes AWS funding mechanics hands-on today; Azure and Google Cloud partners bring their own program access and Forj works inside it. Forj is not yet a Microsoft or Google partner and no document may imply otherwise.

**One partner size band, once: 10 to 200 employees, registry-checkable.** Reasoning: below 10 people the firm cannot both staff a won project and take five qualified opportunities a month, so the make-good clause becomes Forj's cost; above 200 the CEO no longer signs alone, procurement owns vendor onboarding, and the vendor already covers the account. This resolves the earlier 10-200 vs 20-200 conflict in favor of 10-200 because both current partners and the proof outcomes came from firms in the low end of that band. Sweet spot inside the band: 20 to 100.

---

## Tier 1: the Desk ICP (2 to 3 slots; the tight bar)

The Desk is Forj working the partner's market: Jacob and Qubad on the phones, capacity 2 to 3 partner slots total. It produced everything real to date (20 meetings, 3 proposals, 1 win since 1 June, all stage-derived, all human-booked). The engagement promises five qualified opportunities a month with a make-good clause, priced so one closed deal covers it, built to be funded by the partner's own cloud program. A slot is the scarcest asset in the company. This bar protects it.

### The firmographic box (all must pass)

| Criterion | Bar | Check |
|---|---|---|
| Company type | Cloud services partner: systems integrator, managed service provider, or reseller WITH a delivery arm; ISV with a services arm also qualifies | [DATA] registry SNI + website; [DIRECTORY] listed as a services/consulting partner |
| Size | 10 to 200 employees | [DATA] registry headcount; never guess, a null beats a wrong size, resolve before the call |
| Cloud standing | Named tier on at least one of: AWS Partner Finder tier Select or Advanced; Microsoft Solutions Partner designation (any solution area) in the Microsoft partner directory; Google Cloud Partner or Premier Partner in the Google Cloud partner directory | [DIRECTORY] look the firm up; a firm not findable in any of the three directories fails |
| Geography | Registered and selling in a market Alloy's data covers. Today that evaluates to Sweden. Nordics enter when the data does, not before. No document says "Nordics" in the present tense. | [DATA] registry country + Alloy coverage table |
| Ownership present | The owner or CEO is personally on the first call | [CALL] observable the moment the call starts; if a delegate shows up alone, reschedule once, then waitlist |

### The three 30-second qualifying questions (the card a rep or Smith runs, in order)

Cheap deterministic NOs first, judgment second. Before the call, the [DATA] and [DIRECTORY] rows above are already resolved from the registry and the partner directories. On the call, three questions:

1. **"Which partner tier do you hold, and who is your partner manager at that cloud?"**
   Pass: names a tier that matches the directory AND names a person (or at least a live program: MDF, MAP, ECIF, Google Partner Advantage funds).
   Disqualify: cannot name a tier or any contact at their own cloud. Then the engagement is an unfunded cost and their CEO will not sign it.
2. **"Who, by name, takes the meetings we book, and who, by name, leads delivery when one closes?"**
   Pass: two names recorded before signature (they may be the same person in a 10 to 20 person firm). The closer commits to taking each qualified opportunity within 5 business days, five per month.
   Disqualify: "we will rotate whoever is free." The make-good clause makes an absent closer Forj's unbounded cost, not theirs.
3. **"What did your last funded or typical project sell for?"**
   Pass: a figure at or above the engagement price, recorded by the rep in the card. Cloud-funded migration, modernization, or GenAI delivery, or product ARR on the Quattro pattern (one-time go-live plus recurring license) all qualify.
   Disqualify: a figure below the engagement price, or no project of that shape ever. One close must cover the engagement or the economics fail for both sides.

Note the honesty of check types: questions 1 to 3 are [CALL] criteria. The partner states it, the rep records the answer verbatim. Staffing speed promises ("we can staff in 30 days") are contract clauses, not ICP criteria, and are not asked here.

### Hard disqualifiers (any one kills the slot conversation)

- **Global SI or vendor bench class** (Accenture, Atea, Nordcloud class): already on the vendors' named rosters, not the buyer. [DATA] headcount over 200 or [DIRECTORY] listed as a premier global bench.
- **Resell-only license flipper, no delivery arm**: the funded programs the whole engine runs on (MAP, Azure Migrate and Modernize, Google RAMP) do not apply. [DATA] website + registry SNI.
- **Procurement-gated**: vendor onboarding must pass a procurement review. [CALL] tripwire utterance: "procurement will review the vendor onboarding." That is a Tier 2 waitlist entry, never a slot.
- **Pure staffing body-shop**: no service of its own to sell. [DATA] website + SNI.
- **No named closer**: see question 2. A slot without a closer is free work.
- **Market outside Alloy's data coverage**: today, anything outside Sweden. [DATA].

### What makes a slot pay

- One closed funded deal per quarter, or the slot frees up. This is the slot rule; it is written into the engagement conversation, not discovered later.
- The partner's cloud program funds the engagement (AWS MDF/MAP executed by Forj today; Microsoft and Google program funding brought by the partner, executed together).
- Five qualified opportunities a month, each one a phone conversation with the right stakeholder, with a clear business need and the authority to act. Forj never promises the close; the close depends on the partner's own delivery and sales, which is exactly why the closer and delivery-lead names are gates.

---

## Tier 2: the Software ICP (post launch gate; the broader bar)

**Status today: WAITLIST.** The launch gate (2026-06-28) is in force: Alloy and Smith do not open to new tenants or self-serve signup until the output is on point. Nothing in this tier is buyable today and no document may imply it is. What follows is the qualification bar for the waitlist and for the day the gate lifts.

### The firmographic box (all must pass)

| Criterion | Bar | Check |
|---|---|---|
| Company type | Same as Tier 1: partner org on AWS, Azure, or Google Cloud, three clouds equal | [DATA] + [DIRECTORY] |
| Size | 10 to 200 employees (same single band as Level A everywhere) | [DATA] registry |
| Cloud named | The partner names which cloud their workspace runs plays on (one to start; expand to N later) | [CALL] at signup: "which cloud do we set your workspace up for first?" |
| Seller attached | A named seller who will work the pipeline weekly | [CALL] at signup: "who, by name, works this every week?" Disqualify: no name. A partner without a seller attached is a tourist; waitlist them. |
| Onboarding target defined | A target list or territory defined at signup (a vertical, an SNI range, a geography, or an imported list) | [DATA] observable onboarding artifact: the list or territory exists in the workspace or it does not |
| Geography | A market Alloy's data covers (Sweden today) | [DATA] |

### Hard disqualifiers

- No seller attached (the tourist rule, above).
- Wants the AI to send and book unsupervised. Software forges, humans close. See anti-ICP.
- Demands exclusivity over the shared Swedish library. Breaks the shared-library model that every future tenant depends on.

### What makes a seat pay

- The partner's own reps run Alloy and Smith weekly against their defined territory; marginal cost to Forj is near zero, so the box is wider than the Desk box on commitment, never on honesty of fit.
- **Graduation upward:** a software partner whose rep books 3 or more meetings in a month is a Desk-slot conversation.
- **Graduation downward is a win:** a Desk partner whose own reps start running Alloy themselves is the founder-independent path the whole company is built toward, not churn.

---

## Triggers (the events that open a conversation, each checkable)

Each trigger is labeled: **[OBSERVABLE]** = checkable from outside before the call; **[DISCOVERY]** = a first-call question, not qualification data. The list is deliberately cloud-balanced; leading every conversation with an AWS trigger quietly re-narrows the company to AWS, which the pivot forbids.

1. **[OBSERVABLE, AWS] Partner Central 3.0 migration deadline passed 30 Jun 2026.** Every AWS partner is right now mid-migration or behind. Perishable, measured in weeks. Check: partner is AWS-tiered in Partner Finder.
2. **[OBSERVABLE, Azure] Microsoft Frontier launched 2026-07-02.** Azure partners are being pushed toward the new agentic delivery motion with no mid-market onboarding path. Check: partner holds a Microsoft Solutions Partner designation.
3. **[OBSERVABLE, GCP] Google's $750M partner fund (announced 2026-04-22)** aimed at a ~120,000-firm ecosystem in which only ~2,900 are certified services partners. Money is chasing a thin bench. Check: partner is in the Google Cloud partner directory.
4. **[OBSERVABLE, all three] The FDE squeeze:** ~$4.25B committed to embedded delivery in one summer, mid-market partners on no roster. Structural, always on.
5. **[OBSERVABLE] New competency, specialization, or designation just earned** (visible in the directory with a date): fresh co-sell rights, no pipeline to use them on.
6. **[OBSERVABLE, AWS] Marketplace ProServ listing fee cut 2.5% to 0.5% (2026-06-16):** services listings suddenly pencil.
7. **[DISCOVERY] Lost or rotated partner-manager coverage:** "who is your PDM / partner development manager right now?" A shrug is the trigger.
8. **[DISCOVERY] Program funds expiring unspent at quarter end** (MDF, ECIF, Partner Advantage funds): "do you have allocated program funds you have not used this quarter?"
9. **[OBSERVABLE] A vertical product with no demand engine** (the Quattro pattern): the partner built it, the website shows it, the pipeline does not. Check: product page exists, no case studies newer than a year.
10. **[OBSERVABLE/DISCOVERY] First-salesperson events:** just hired one (needs a system) or just lost one (needs a desk). Visible on LinkedIn, confirmable in the call.

---

## The anti-ICP (looks right, burns slots; explicit, with first-call tripwires)

Every profile below ships with the utterance or observable fact that detects it IN the call, so the rep disqualifies live, not in the retro.

| Profile | Why it burns a slot | First-call tripwire |
|---|---|---|
| **The lead buyer** | Wants meetings delivered, no closer, no co-sell intent; the make-good clause turns them into unbounded free work | "We just want the meetings, our guys are busy." Also: refuses to name the closer in question 2. |
| **The no-bench boutique** | 3 to 5 seniors at full billability; meetings rot in two weeks and the proof story dies with them | Cannot name a delivery lead in question 2, or: "we would hire once something closes." |
| **The procurement enterprise** | The signature outlives the slot; they already have vendor coverage and internal GTM | "Procurement will review the vendor onboarding." / "Legal needs 6 to 8 weeks." |
| **The resell-only flipper** | No delivery arm, so MAP / Migrate and Modernize / RAMP funding never applies | "We do not do delivery ourselves, we pass it to a partner." |
| **The off-cloud crusader** | Wants outreach that rips customers off a rival cloud; violates cloud-fair, burns the partner's own vendor relationship and Forj's | "Can you find us Azure shops we can move to AWS?" (or any cloud-to-cloud version). The answer is the standing rule: we sell the funded play ON the customer's cloud, in that cloud's own program. |
| **The autonomy shopper** | Wants the AI to send and book unsupervised; violates "software forges, humans close", the public credibility floor | "Can it just send the emails itself?" / "Why do we need a human in the loop?" |
| **The exclusivity demander** | Wants the Swedish library locked to them; breaks the shared-library model and caps every future tenant | "Are we the only ones who see these companies?" asked as a purchase condition rather than a question. |

---

## Wedges vs ICP (how Quattro and its siblings relate without polluting)

A **wedge** is a per-partner, per-market play (Level C). It lives in the partner's workspace configuration, never in Level A or Level B. The Quattro/property motion is Partner A's wedge; digital-native mid-market is Partner B's wedge. Neither belongs in Forj's own ICP or in the generic scoring box, and their rules (like the LOU procurement carve-out) apply ONLY at wedge level.

**The wedge template (documented pattern, parameterized):**

1. **An observable signal** that a prospect already buys tooling of the relevant shape. Template case: a detected Kundo widget on a property company's site = pre-qualified for the back-office play. Signals are facts a scanner can verify, never vibes.
2. **A qualification rule set** on top of the generic box: which SNI codes are in (property management on assignment, SNI 6832), which are explicitly OUT (estate agents, SNI 6831), which floors are overridden (the property vertical uses the org-nr route because the 10-employee floor misses real targets).
3. **Wedge-level hard disqualifiers, including legal ones.** Template case: municipal housing companies cannot buy self-serve under public procurement (LOU); they route to the tender path, not the demo path. This is the model of a real falsifiable disqualifier, and it stays at wedge level.
4. **A booked-meeting proof** before the wedge is called validated. Template case: the first Quattro meeting was inbound, an IT manager asking for it himself.
5. **The never-guess rule carries over verbatim:** never invent a number; a null beats a wrong size.

**The parameterization rule (binding):** per-partner wedge definitions move OUT of edge-function prompt strings and INTO configuration, so onboarding partner three is a config row, not a code edit and redeploy. The current hardcoded two-partner, AWS-branded prompt inside the icp-brief function is the named anti-pattern this rule exists to kill.

**Wedges feed the Desk's working order, not the tiering.** "Which accounts the desk works first" = high-fit accounts routed to that partner with a reachable decision-maker. That is an account filter inside a wedge. It is NOT the Desk-vs-Software bar; partners choose the door, accounts do not.

---

## The persona (who signs, what they fear, what convinces them)

**Who signs:** the partner-CEO, usually the owner, of a 10 to 200 person cloud consultancy. Below the size cap the CEO owns GTM personally and signs a program-funded engagement in one or two calls. Above it, that authority dissolves into procurement, which is exactly why the cap is a gate. Both current partners fit this shape.

**What they fear, in order (each fear is a real recorded wound, not a guess):**

1. **Their name.** The outreach carries their brand into their own market. One spammy sequence and ten years of reputation is spent.
2. **Their vendor relationship.** The cloud partnership IS their business. Anything that reads as anti-vendor, or as poaching customers off a rival cloud, endangers the relationship they live on.
3. **Their money.** They have been sold "leads" before. An unfunded retainer with soft deliverables is a no in the first meeting.

**What convinces them, in the same order (the pitch order is fixed):**

1. **Brand safety first:** humans on the phone, your name honored, every booked meeting a phone conversation with the right stakeholder, with a clear business need and the authority to act. Real numbers behind it: 20 meetings, 3 proposals, 1 win since 1 June, produced exactly this way.
2. **Relationship protection second:** we sell the funded play ON your customer's cloud, in that cloud's own program. Never a displacement pitch. Your partner manager should be glad you hired us.
3. **Cost shape third:** built to be funded by your cloud's partner program, priced so one closed deal covers the engagement, with the make-good clause carrying the risk on our side.

---

## ONE scoring vocabulary (the canonical table every layer maps to)

### The spine

**One score:** `companies.icp_score`, 0 to 100, written by exactly ONE producer: the deterministic, Vitest-locked `icpScore()` in `alloy-page/src/scoring.js`. It is cloud-fair by construction (AWS, Azure, and Google Cloud each score equally, locked by test) and tenant-aware (per-partner size caps). The LLM's `icp_fit` inside `enrichment.icp_brief` is routing advice ("which partner, what angle"), stays in that jsonb, is documented as routing-only, and never writes the score column again. The jsonb key rename to `partner_fit` is deferred; the write is what gets stopped now. Any column that ever had two writers gets a `producer` + `scored_at` stamp so provenance is auditable.

**One band, derived at read time, never stored:**

| Score | Band | Customer words (fixed, already live on forj.se) |
|---|---|---|
| 70 to 100 | hot | High fit |
| 40 to 69 | warm | Worth a look |
| 0 to 39 | cold | Not a fit right now |
| per-tenant predicate fails | off profile (computed) | never shown publicly; the public path routes to the waitlist |

"Off profile" is a computed per-tenant predicate (the size-cap check reads the partner's own cap, so the same company can be off for one partner and warm for another), plus the floors (no domain, no resolved cloud, under 10 employees, sole trader). It is structurally impossible to store as a single band on the company row, so it never is.

**Threshold choice, with the evidential reason stated:** 70/40 is adopted because it is the definition under which the real outcomes were produced: the qualified-lead bar in the enrichment pipeline defaulted to 70 and the public teaser shipped 70/40 throughout the period that generated the 20/3/1 proof, while the competing 60/35 set lived only in the eval tests and the MCP mirror, which never drove a workflow. This choice knowingly overrules the test-asserted 60/35 and says so here. **Verification step (owned, dated):** within one week of the single-writer persistence landing, run the retro query mapping the 20 booked meetings, 3 proposals, and 1 win to their canonical scores; if the booked meetings cluster below 70, adjust the cutoffs ONCE, in one commit, everywhere. Thresholds live as exported constants in `scoring.js` (`ICP_HOT`, `ICP_WARM`), are imported everywhere else, and a test asserts no other literal threshold exists in the codebase.

**The retired vocabulary:** weak/fair/moderate/strong dies by fixing the READERS, not by migrating data. The orphan column `companies.icp_band` (no writer in any repo) is nulled and then dropped once the readers derive bands from the score. No migration, no trigger, no nightly sync job for a derivable value.

### Layer-by-layer change list (copy-mapping vs code)

| Layer | Today | Change | Type |
|---|---|---|---|
| `src/scoring.js` | score only | add exported `ICP_HOT=70`, `ICP_WARM=40`, `icpBand()` helper + tests | code, small |
| `icp-brief/index.ts:31` | LLM fit overwrites `icp_score` | stop the `p_score` write; `icp_fit` stays in `enrichment.icp_brief` only | code, one line |
| server-side persistence | score computed client-side only, never persisted | persist deterministic score with `producer`/`scored_at` stamp (single-paste box SQL per the box-friction rule) | code, medium |
| `smith-read/index.ts:218` | raw `icp_band` passthrough (the public "strong renders as not a fit" bug) | delete the passthrough; always derive from score | code, one line; kills the public bug by itself |
| `companies.icp_band` | orphan column, weak/fair/moderate/strong + ~9,455 nulls | null, then drop after readers are fixed | data, one statement, no migration machinery |
| `alloy-mcp/src/scoring.mjs:71` | 60/35 | mirror the canonical 70/40 constants | copy-mapping, one line |
| `forge.jsx:620` (icpColor) | 65/40 | 70/40 via imported constants | copy-mapping |
| `smith-read.eval.test.js:27` | HOT=60, WARM=35 | canonical constants | test, one line |
| `smith-brief/index.ts:210` | falls back to printing the raw score as the band ("score 55") | always the derived band word | copy-mapping |
| landing `verdict()` | hot=High fit, warm=Worth a look, else Not a fit right now | no change; already the canonical words | none |
| `forge.jsx:1754` qualify verdict + `forge.jsx:4507` grounding | free-prose fit words, ad-hoc OFF-PROFILE/strong/unconfirmed | canonical band word first, prose second | prompt copy |
| `is_hot` UI flag | manual star named "hot", collides with the band | rename to "Starred" | copy-mapping |
| `forge.jsx:9510` tooltip | "AWS warm / GCP·Azure displacement", pre-pivot and displacement-framed inside the product | rewrite cloud-fair ("any of the three clouds scores equally; the play runs in the account's own cloud program") | copy-mapping |
| `company_cloud.fit_score` | composite includes the polluted score | recompute ONCE after the single writer lands (order is mandatory: single writer first, then derive; never backfill from today's polluted column) | one re-run |
| partner-facing counts (campaigns.sql, segment queries) | ad-hoc query-time thresholds | hot = band hot via one named view built on the canonical function | query-only |
| the historical "1,533/599 and 523/172 hot" figures | produced by non-reproducible query-time thresholds | quoted only as "historical, non-reproducible"; recomputed under the canonical band before ever shown to a partner again | process rule |

### The 30-second qualification card (the artifact, not just the doc)

The ICP is done when the card is in the workflow, not when this file is written. Three cards ship: **Level A Desk card** (the three questions above, deterministic NOs first), **Level A Software waitlist card** (cloud named, seller named, target list defined), **Level B/C account card** (band + off-profile predicate + wedge signal, which Smith already computes). Each card becomes a Smith slash-shortcut so a rep or Smith runs it identically.

---

## Market math (denominators, with sources)

**Level A, the partner universe (Forj's buyers):**

- AWS Partner Network: 100,000+ companies across 150 countries (ITPro/ChannelPro coverage of the APN).
- Google Cloud: a ~120,000-firm ecosystem addressed by the $750M partner fund, of which only ~2,900 are certified services partners (Omdia, re:Invent 2025 analysis). The gap between those two numbers IS the mid-tier Forj sells to.
- Category denominator: close to 1,000,000 partner account managers across 35,000 vendors (Omdia, cited in Forj's PAM positioning).
- The raise-narrative framing, kept as narrative: the ~120,000 mid-market partner firms on nobody's delivery roster.
- **Sweden/Nordics per-cloud partner counts — COUNTED 2026-07-14 (live directory census; ratios are robust, absolute counts carry the method caveats below):**
  - **AWS**: 128 partners with a Swedish office in AWS Partner Solutions Finder; **52 offer Consulting Services**; ~33 of those are global SIs/distributors/telcos outside the ICP, leaving **~10-15 Swedish firms in the 10-200 band** (census names incl. TIQQE, Opsio, Redeploy, Awiant, Playground Tech, Dewire, Cloud Enablers, Complete Synergi, Kolomolo, Pearl Group, Rebura; Novalo itself appears in the directory, validating the census). Nordics: NO 71/24, DK 81/36, FI 82/35 (total/consulting) → ICP band ~30-45 firms Nordics-wide. Tier not publicly filterable (all consulting listings are at least Select-registered on the Services Path).
  - **Microsoft**: 2,702 partners with a Swedish location in the partner directory (ALL partner types incl. resellers/ISVs — not 1:1 comparable with the AWS consulting cut); ~80% Azure-product-tagged; sampled estimate **~1,400+ Azure-designated Solutions Partners** in Sweden. Ratio: **~21x AWS's bench**, ~25-30x on the tiered-services cut.
  - **Google Cloud**: directory shows only top-30 ranked results (no counts); Sweden-based services partners realistically **~10-25 firms**. Smallest bench of the three.
  - **Alloy's own library split (box, 2026-07-14)**: azure 8,696 / aws 2,183 / gcp 1,719 resolved — the end-customer data moat is majority-Azure even though Forj's execution proof is AWS.
  - **What it means for the gate**: the Swedish AWS-consulting Level-A band is a market of TENS, and Forj's two tenants + one warm pilot already touch ~15-25% of it → the AWS side is worked BY NAME (account-based, zero spray). The any-cloud tier gate STAYS — it is what keeps the ~20x Microsoft-side pool and the majority-Azure end-customer moat addressable without any new build. Identity: AWS-first specialist. Library: reads every cloud. Method: AWS = live Finder census (offering filter, office-location based); Microsoft = directory API estimatedTotal + 60-record designation sample; Google = ranked-finder triangulation.

**Level B, the end-customer universe (what partners' pipelines draw from, Sweden):**

- ~15,000 addressable mid-market+ companies with domains; Alloy already holds effectively all of them (re-running the broad pull returns ~0 fresh). Breadth is a dead lever in Sweden; the ICP's job is to ration depth: enrichment spend and Desk attention.
- Coverage shown publicly: 10,069 companies read, 47,438 decision-makers.
- Detected cloud split across the classified base: Azure 3,167, AWS 1,584, GCP 785, independent 5,043, unresolved 4,842. Azure is the LARGEST detected footprint: cloud-fair is not ideology, it is where the pipeline is.
- SNI 62 (IT services) Sweden 2025: 48,616 firms, of which 1,097 are mid-market at 20 to 499 employees (SCB).
- Digital-native SNI pool (Partner B's wedge): ~25,206 aktiebolag.
- Property vertical (Partner A's wedge): SNI 68xxx ~51,231 orgs but mostly tiny SPVs; the true slice is SNI 6832 plus the ~290-company municipal-housing roster; 100 of 114 system-verified targets reachable through one connector standard.

---

## What this replaces (stale definitions retired, by file)

| File | What is stale | Disposition |
|---|---|---|
| `memory/multicloud-pivot.md` (ICP lock line) | The only prior Level A definition: one sentence, no disqualifiers | Superseded; memory note updated to point here |
| `memory/alloy-north-star.md` | "AWS-partner SaaS", "one real AWS partner PAYING": pre-pivot AWS-only framing of the goal | Goal language updated to hyperscaler-partner; the promise sentence stays verbatim |
| `C:/Users/jacob/alloy/ICP_QUALIFICATION.md` | Title implies it is THE ICP; it is actually the Level B/C data gate (and a good one) | Kept, re-scoped: header states "Level B/C data pipeline gate, see FORJ_ICP.md for the ICP"; the two-tier gate pattern and the never-guess rule are promoted into this doc |
| `C:/Users/jacob/alloy/Alloy-Smith-Playbook.md` | "Knowledge Smith uses to advise AWS partners" header; AWS-only program coverage; "1000+ employees strongest candidates" contradicting the scoring caps | Header and size guidance rewritten; size advice becomes per-partner (the caps in scoring.js are the truth) |
| `C:/Users/jacob/alloy/PARTNER_SIGNALS.md` | "AWS co-sell map" title; explicit displacement rows violating the cloud-agnostic rule | Rewritten cloud-fair; displacement framing removed |
| `supabase/functions/icp-brief/index.ts:16` | Hardcoded Swedish two-partner AWS-branded prompt = the de facto end-customer ICP | Moved to per-partner wedge config; prompt reads config; partner three requires no redeploy |
| `Forj_PAM_Positioning.md` | "starting in the Nordics" present tense | "Sweden today, Nordics as the data expands" |
| `Forj_MDF_Pitch.md` | Implies self-serve is buyable now; MDF framing reads AWS-universal | Two doors, one open: Desk now, Software waitlist; funding phrased per the partner's own cloud with the honesty note |
| `smith-read/index.ts:218`, `smith-brief:210`, `alloy-mcp/scoring.mjs:71`, `forge.jsx:620/1754/4507/9510`, `smith-read.eval.test.js:27` | The four-vocabulary, four-threshold fragmentation | The change list in "One scoring vocabulary" above, one commit for the threshold set |
| The "599 / 172 hot" figures anywhere they appear | Query-time thresholds, not reproducible | Historical only; recomputed under the canonical band before reuse |

**Standing rules carried forward unchanged:** right-fit ICP, never the biggest org. Buyer language everywhere, no engineer jargon in anything customer-facing. No em dashes in any copy destined for humans. Never frame a customer as ripe to move off their cloud. Software forges, humans close. A null beats a wrong size.


---

## Cascade actions (the work program this doc mandates)

1. **C:/Users/jacob/alloy-page/src/scoring.js**
   Export ICP_HOT=70 and ICP_WARM=40 as constants, add icpBand(score) helper and an isOffProfile(company, tenant) predicate (wraps isTooLarge + floors), extend Vitest coverage, and add a repo-wide test asserting no other literal band threshold exists (catches 60/35 and 65/40 stragglers).
   Effort: small (half day incl. tests)

2. **C:/Users/jacob/alloy-page/supabase/functions/icp-brief/index.ts:31**
   Stop writing p_score into companies.icp_score (delete the one line in the icp_brief_apply call); icp_fit remains inside enrichment.icp_brief as routing-only, with a code comment declaring it advisory. Defer the partner_fit jsonb rename.
   Effort: one line + deploy to the box per DEPLOY-BOX.md

3. **Box DB (db.forj.se), single-paste SQL file per the box-friction rule**
   Persist the deterministic icpScore server-side (nightly pg_cron), stamping producer='scoring.js-formula' and scored_at; then null and later drop companies.icp_band once readers are fixed; then recompute company_cloud.fit_score ONCE (order mandatory: single writer first, then derive; never backfill from the polluted column).
   Effort: medium (one SQL file, one paste session)

4. **C:/Users/jacob/alloy-page/supabase/functions/smith-read/index.ts:218**
   Delete the co.icp_band passthrough; always derive hot/warm/cold from icp_score via the canonical thresholds. This one line kills the live public 'strong renders as Not a fit' bug on forj.se.
   Effort: one line + box deploy; do first, independent of everything else

5. **C:/Users/jacob/alloy-page/supabase/functions/smith-brief/index.ts:210 and _edge_slack_smith.ts:107**
   Replace the String(icp_score) band fallback with the derived band word so Slack never prints 'score 55' as a band; verify the box Slack fn output after icp_band is dropped.
   Effort: small + box deploy

6. **C:/Users/jacob/alloy-page (one commit): alloy-mcp/src/scoring.mjs:71, src/forge.jsx:620, tests/smith-read.eval.test.js:27**
   Align all threshold literals to the exported canonical constants (60/35 and 65/40 both die) in a SINGLE commit so no window exists where surfaces disagree; note in the commit message that this overrules the test-asserted 60/35 per FORJ_ICP.md.
   Effort: small, three one-liners + test run

7. **Box DB retro query (within one week of server-side persistence landing)**
   Map the 20 booked meetings / 3 proposals / 1 win (stages mote_bokat+/forslag+/vunnen in engagements) to their canonical icpScore values; if booked meetings cluster below 70, adjust ICP_HOT/ICP_WARM once, everywhere, in one commit. This is the outcome-grounding the 70/40 choice is conditioned on.
   Effort: medium (one read-only SQL + a decision)

8. **C:/Users/jacob/alloy-page/src/forge.jsx (copy set)**
   Rewrite the :9510 ICP tooltip cloud-fair (remove 'AWS warm / GCP-Azure displacement' framing), make the :1754 qualify verdict and :4507 grounding emit the canonical band word first, and rename the is_hot star to 'Starred' so 'hot' means exactly one thing system-wide.
   Effort: small (copy-only, one Amplify push)

9. **Box DB + reporting queries (campaigns.sql, novalo_aws_segment.sql)**
   Create one named view (hot = canonical band via the SQL mirror of icpBand) that ALL partner-facing counts read from; recompute the historical 1,533/599 and 523/172 figures under it before they are ever quoted to a partner again.
   Effort: medium

10. **icp-brief prompt -> per-partner wedge config**
   Move the hardcoded Swedish 'Tva AWS-partner-erbjudanden' two-partner prompt into a partner_wedge config table (offer description, buyer roles, SNI in/out, floors, legal disqualifiers like LOU); icp-brief reads config so onboarding partner three is a config row, not a redeploy. De-AWS the framing per cloud-fair.
   Effort: large (schema + fn rewrite + re-route test on a sample)

11. **C:/Users/jacob/alloy/Alloy-Smith-Playbook.md and PARTNER_SIGNALS.md**
   Playbook: rewrite the 'AWS partners' header multicloud, resolve the '1000+ employees = strongest candidates' contradiction to per-partner size caps. PARTNER_SIGNALS: retitle from 'AWS co-sell map', remove every displacement row, reframe each signal as the funded play ON that account's own cloud. These feed Smith's grounding, so they are product changes, not just docs.
   Effort: medium (copy, then KB re-sync so Smith stops citing stale rules)

12. **C:/Users/jacob/alloy/Forj_PAM_Positioning.md, Forj_MDF_Pitch.md, Forj_Raise_Narrative.md, QUATTRO_SELFSERVE_PITCH.md**
   Sweden-today geography (no present-tense 'Nordics'), two-doors-one-open framing (Desk buyable, Software = waitlist), funding phrased per the partner's own cloud with the honesty note that Forj executes AWS mechanics today and is not yet a Microsoft or Google partner.
   Effort: small-medium (copy only, no em dashes)

13. **forj.se landing (alloy-landing/index.html on the landing branch)**
   verdict() words stay unchanged (already canonical); grep the one-file page for any other band vocabulary or 'Nordics' present-tense claims; confirm waitlist copy never implies self-serve is buyable before the gate lifts.
   Effort: small (grep + spot copy, remember dead-CSS grep-before-cut rule)

14. **Smith workflow (slash-shortcuts + GTM rulebook + smith-eval)**
   Ship the three 30-second qualification cards as Smith shortcuts (/qualify-partner-desk, /qualify-partner-software, /qualify-account), add the anti-ICP tripwire utterances to the reply-agent rulebook so Smith flags them live in call notes, and add an eval case asserting Smith emits only canonical band words.
   Effort: medium (the ICP is done when the card is in the workflow, per the doc)

15. **Outreach: Qubad's call script + targeted Smith-drafted outreach templates**
   Rebuild the desk pitch in the fixed persona order (brand safety, relationship protection, cost shape), swap the trigger list in call prep for the cloud-balanced 10-trigger list (at least one Azure-native and one GCP-native lead available), and mark [DISCOVERY] triggers as questions, not claims.
   Effort: small-medium

16. **Partner directories (AWS Partner Finder, Microsoft Solutions Partner directory, Google Cloud partner directory)**
   Count Sweden (then Nordics) partners per cloud in the 10-200 headcount band to put an exact number on the Level A beachhead; until done, no Forj document cites a Swedish partner count.
   Effort: medium (manual directory pass or scripted scrape, one afternoon)

17. **Memory notes (multicloud-pivot.md, alloy-north-star.md, alloy-app-state.md, MEMORY.md index)**
   Point the ICP-lock line at C:/Users/jacob/alloy/FORJ_ICP.md as canon, update north-star 'AWS-partner SaaS' goal language to hyperscaler-partner (promise sentence stays verbatim), add the one-line index entry so every future session reads this doc before ICP work.
   Effort: small

18. **C:/Users/jacob/alloy/ICP_QUALIFICATION.md**
   Re-scope header to 'Level B/C data pipeline gate; the ICP lives in FORJ_ICP.md'; content unchanged (its two-tier gate and never-guess rule are promoted into the canonical doc).
   Effort: small (header only)

