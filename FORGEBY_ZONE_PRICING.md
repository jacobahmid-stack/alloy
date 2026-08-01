# Forgeby zone pricing and free-access design

Research of record, 2026-08-01. 26 agents across six sourced angles, adversarial verification on
every load-bearing claim, then a critic pass. Produced in answer to: *"no credits, full access per
market instead, and imitate how AWS divides its markets."*

> Read the CRITIQUE at the bottom before acting on the memo. Where they disagree, the critique wins.

---

# DECISION MEMO: Zone Pricing and the Free Tier

**To:** Jacob | **Date:** 2026-07-30 | **Subject:** "Full free access per market, no credits" — verdict, zone map, prices

---

## 1. VERDICT ON THE INSTINCT

**Yes, with one named modification: the unit is the COUNTRY, the zone is a bundle preset, and "full access" must mean unlimited READING with metered EXTRACTION.**

Three parts of your instinct are supported by evidence. One is not.

**Right: kill the 3 free reads.** A read counter is the single worst free-tier design for your buyer, because it makes the visitor experience scarcity before they experience competence. It also puts you in the same UI grammar as every incumbent (ZoomInfo, Lusha, Apollo all run credit counters), which throws away your only free differentiator.

**Right: geography is a real, sellable scope unit.** Two independent classes of evidence.

- European registry-data vendors already price this way. Goava's live pricing page states "In Discover, one market is included in the price. Additional markets cost 2,000 SEK/month per country" (https://www.goava.com/en/pricing). Vainu's pricing calculator ships country checkboxes at +EUR 500/year per additional Nordic database on a EUR 3,500/year base (https://www.vainu.com/pricing).
- AWS itself already treats geography as a price modifier. AWS Marketplace applies "an additional regional listing fee... additive with the standard listing fee" — South Korea +1%, effective 04/01/2025 (https://docs.aws.amazon.com/marketplace/latest/userguide/listing-fees.html).

**Right: your cost genuinely scales by geography.** You load registries country by country. Price tracks cost honestly, which is the only durable defence against the attack in section 6.

**Wrong, and this is the modification: nobody sells unmetered access to anything, and the reason is not greed.** Across every territory-priced vendor checked, the territory sets SCOPE and a second dial always sets VOLUME. Creditsafe gives "Freedom access" to home-market reports but hard-counts international at 5/50/150 (https://www.creditsafe.com/us/en/credit-risk/product-packages/packages-full.html). Vainu meters annual download volume on a declining ladder. Crossbeam meters record exports (5,000 / 25,000 / 100,000) and its free tier caps what you can even SEE at 50 records single-partner, 10 records on Advanced Account Mapping (https://www.crossbeam.com/pricing/).

The failure mode is documented and it is not weak conversion. Baremetrics killed its free plan after 11 weeks with an 11.5% conversion rate — perfectly healthy — because database load doubled and support tripled, causing downtime that churned *paying* customers faster than free users converted, ending in a net customer loss (https://baremetrics.com/blog/freemium-saas-implode). Your expensive operations are live estate reads, enrichment, and LLM dossier generation. An unmetered free zone points a firehose at exactly those.

**Wrong, second: do not market the zones as "how AWS divides its markets" without qualification.** AWS names the units but publishes no canonical zone-to-country roster anywhere. You will be authoring the map. That is fine, and section 2 makes it defensible, but the copy must say "the way an AWS partner's territory is actually shaped," not "AWS's regions."

**Also wrong, and it is in your own docs: "Nordics are email-friendly" is not true.** Denmark and Norway are call-first consent markets (per `ENRICHMENT_WATERFALL_SPEC.md` and the DK 40% reklamebeskyttet finding). Sweden and Finland are the email-friendly pair. This matters for zone design because a Nordics zone contains two opposite outreach regimes and the product has to say so.

**One architectural rule, non-negotiable.** AWS Partner Central has no territory object. The Selling API `Address` type exposes only City, CountryCode, PostalCode, StateOrRegion, StreetAddress; `CountryCode` is a flat ISO-3166 enum and is **not required**; `StateOrRegion` accepts US states only (https://docs.aws.amazon.com/partner-central/latest/APIReference/API_Address.html). So store entitlement as a **set of ISO country codes**, and make zones named presets over that set. You get three things at once: the ACE write is always clean, "add one country" becomes an upsell primitive, and you can re-cut zones without a migration when AWS renames things — which it just did, `/emea/nordics/` now 302s to `/emea/north/` and `/emea/dach-cee/` to `/emea/de-central-growth/`.

---

## 2. THE ZONE MAP

The best AWS source is not the sales org, it is the **partner** org. The APN blog "Announcing the Regional 2025 AWS Partners of the Year for Europe, Middle East, and Africa" divides EMEA partner-side into 13 named sub-regions as section headings: United Kingdom and Ireland, Iberia, Italy, France, Benelux, Central and Eastern Europe (CEE), MENA, Sub-Saharan Africa, Turkey, **Nordics**, Germany, Alps (Austria and Switzerland), Israel (https://aws.amazon.com/blogs/apn/announcing-the-regional-2025-aws-partners-of-the-year-for-europe-middle-east-and-africa/). Corroborated by AWS's own event platform, which resolves to exactly six European units: `/emea/north/`, `/emea/uki/`, `/emea/france/`, `/emea/iberia/`, `/emea/italia/`, `/emea/de-central-growth/` (https://aws-experience.com/emea/uki/, linked from https://aws.amazon.com/local/nordics/).

**Your proposed list has two errors and two omissions.**

- **Drop "Baltics" as a zone.** It appears in zero AWS partner taxonomies. AWS attaches it to Finland on the sales side ("Sr Sales Manager, Finland & Baltics, Europe North") and markets "the Nordics and Baltics" as a pair on https://aws.amazon.com/local/nordics/. No European AWS partner has a Baltics patch. Fold it into Nordics as included coverage, not a SKU.
- **Germany alone is not a partner territory.** The "Partner Development Manager, EMEA Central APO" posting states verbatim that the team drives "partner success across Germany, ALPS (Austria, Switzerland), and CEE markets" (https://www.amazon.jobs/en/jobs/10434052/partner-development-manager-emea-central-apo). Sell **DACH**. Note honestly that APN's awards list Germany and Alps separately, so DACH is a commercial bundle, not an AWS unit — say so if asked.
- **Add Italy.** Named at every AWS layer (AWS Experience Italia, `/local/italy/`, EMEA South staffing, MDF agency country list). Strictly better evidenced than Baltics.
- **Add Benelux.** APN award region, plus `/local/benelux/`, plus AWS staffs Europe North roles out of Amsterdam.

**Proposed zones:**

| Zone | Countries | AWS precedent | Forgeby coverage today | Lawful channel |
|---|---|---|---|---|
| **Nordics** | SE, NO, DK, FI, IS (+EE, LV, LT included) | APN award region "Nordics"; dedicated "Nordics PDM" on AWS's own Stockholm Partner Summit page; AWS markets "Nordics and Baltics" | **Deep.** ~257k Nordic library, SE registry 820,926, DK 125,503, NO 35,406 | **Split.** SE + FI email-first; **DK + NO call-first (consent)** |
| **UKI** | GB, IE | Best-evidenced of all: AWS Experience UKI, `/local/ukir/`, APN "United Kingdom and Ireland", many live UKI sales roles | **Good.** GB 365,809 IT cohort, ICP 7,647, 851 verified; IE 18,687 | Email-friendly (PECR, B2B corporate subscriber) |
| **France** | FR | AWS Experience France; APN "France" | **Partial.** 7,960 ICT 10+, .fr oracle 10.05M | Email-friendly with opt-out |
| **DACH** | DE, AT, CH | EMEA Central APO covers "Germany, ALPS, and CEE"; APN awards Germany and Alps separately | **Not loaded.** Register free since 2022, so loadable | **Call-first.** UWG consent regime |
| **Benelux** | NL, BE, LU | APN award region "Benelux"; `/local/benelux/`; Europe North staffed from Amsterdam | **Not loaded.** BE KBO needs an account | Email-friendly |
| **Iberia** | ES, PT | AWS Experience Iberia; APN "Iberia" | **Not loaded.** | **Call-first** |
| **Italy** | IT | AWS Experience Italia; `/local/italy/`; APN "Italy" | **Not loaded.** | **Call-first** |
| **CEE** | PL, CZ, SK, HU, RO, BG, HR, SI | APN "Central and Eastern Europe (CEE)" | **Not loaded.** PL blocked | Mixed; PL blocked |

**Sell order:** Nordics and UKI now (they are the only two you can actually deliver at depth). France next quarter. Everything else is a roadmap SKU with a waitlist price, not a live SKU. **Do not sell a zone you cannot fill** — that is the fastest way to make zone pricing look like a gate rather than a shelf.

**The one thing the zone must NOT be keyed on: the buyer.** Regulation (EU) 2018/302 Art 4(2) permits different general conditions "offered to customers on a specific territory," but you may not block or reprice based on where the buyer is established (https://eur-lex.europa.eu/eli/reg/2018/302/oj/eng). A German partner must be able to buy Nordics at the Nordics price. Define the SKU on the registry country of the companies in the library. And never grant a partner zone exclusivity — under VBER (EU) 2022/720 restricting passive sales is a hardcore restriction (https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX:32022R0720).

---

## 3. THE LIMIT DESIGN

**The rule: unlimited reading, metered manufacturing, gated handover.**

The visitor picks a zone in step one and gets the whole platform pointed at it. Nothing is feature-crippled. What is bounded is (a) how many finished dossiers they can manufacture, and (b) whether anything can leave.

### Free zone (EUR 0, no card, unlimited seats, forever)

| Dimension | Free |
|---|---|
| Companies visible in chosen zone | **Unlimited** — full library, full scoring |
| Estate read (cloud, M365/Entra, web stack) | **Unlimited**, but from cached measurement |
| Funded-door verdict (MAP vs PoC) | **Unlimited**, shown on every company |
| Seats | **Unlimited** |
| Rune conversation over the zone | **Unlimited** |
| **Finished dossiers** | **3 total, ever** (not per month) |
| Contact reveal | **Zero.** Roles and org shape shown, no name, no email, no phone |
| Export / CRM push / Partner Central handover | **Zero** |
| Fresh signals (new domains, job ads, estate changes) | **Delayed 30 days** |
| Live re-scan of a company's estate | **Zero** |

Unlimited seats is deliberate. Leadfeeder gives unlimited users on its EUR 0 Lite tier (https://www.leadfeeder.com/pricing/), and seat-gating a free tier is the one dimension that provably blocks habit formation, because it excludes exactly the colleagues who create internal pull.

### The wall, precisely

The user hits it at one of three moments, in this priority order:

1. **"Show me who to call."** They have a scored company with an obvious MAP door and they want the name. This is the strongest wall because it arrives *after* value is proven, not before.
2. **"Send to Partner Central" / "Export."** Crossbeam's entire model is monetising the moment data tries to leave; CEO Bob Moore's stated logic is that you charge when data exits toward Salesforce, at roughly 20% conversion (https://technical.ly/startups/25-million-series-b-crossbeam-free-services-fundraising-bob-moore-partnerships-data/ — secondary source, treat the 20% as indicative, do not repeat externally).
3. **Fourth dossier.** Suger's precedent: a free allowance then a hard per-result price ($583.33/month platform fee, then $1,000 for each accepted net-new private offer beyond the fifth — https://aws.amazon.com/marketplace/pp/prodview-gn75qtuylmx6m).

### Addressing "the free tier is permanently sufficient" head-on

This is the real risk and it deserves a direct answer. A library read is a **one-time** value. Once a partner has seen the 400 Swedish companies with an AWS estate and a MAP door, they have got what they came for and can walk. Three defences, all cheap:

- **The free tier delivers a snapshot; the paid tier delivers a stream.** Signals delayed 30 days on free is the whole game. Leadfeeder does the same thing with a 7-day visitor history window on its free plan. The list is stale by the time it is free, and the partner can feel it.
- **The free tier cannot produce a contactable person.** A scored company without a reachable human is a research artifact, not a pipeline. This is also honest: reachability is where your actual per-record cost sits (FullEnrich mobile at 10 credits, Icypeas verification), so the meter sits exactly where the money goes.
- **Three dossiers, lifetime, not monthly.** A monthly allowance renews and becomes a sufficient trickle. A lifetime allowance forces the decision. This is the single highest-leverage number in the design and I would not go above three.

### The cost-to-serve cap (the Baremetrics lesson)

Cap the **backend work**, never the view. Free accounts read only cached measurement and cached scoring. Any operation that costs real money — live estate re-scan, enrichment call, LLM dossier generation, signal recompute — is either disabled or inside the 3-dossier allowance. Baremetrics' actual fix was automatic data-processing shutdown for non-converters, not a feature cap. Build the shutdown before you build the free tier.

### The human layer

Adding sales assist roughly doubles freemium conversion: 5-7% good / 10-15% great with assist, versus 3-5% / 6-8% self-serve, from a survey of 1,000+ products (https://www.lennysnewsletter.com/p/what-is-a-good-free-to-paid-conversion). You are already designed as the one human layer. **Rule: every free signup that generates its first dossier gets a human touch from you within 48 hours.** That is not overhead on the free tier; on this evidence it is the difference between a 3% and a 10% business.

### On the card gate

ChartMogul's January 2026 study (200 B2B products, free-to-paid within 6 months) measures per 1,000 website visitors: card-gated trial 10.5 paying customers, freemium 5.0, no-card free trial 3.6 (https://chartmogul.com/reports/saas-conversion-report/). A card gate is the biggest single lever available. But it destroys the signup-rate advantage that is the entire point of the free zone, and your visitors are cold European buyers who have never heard of you. **Recommendation: no card at signup, card at the wall.** And do not build a reverse trial — the same study puts reverse trial at 4-6% good / 8-12% great, statistically indistinguishable from plain freemium, and only 7% of products run one. The widely repeated "reverse trials convert 2-3x" line traces to a 2022 OpenView post about trials versus freemium and contains no reverse-trial data at all.

---

## 4. PRICE PER ZONE

### The anchors

| Anchor | Number | Source |
|---|---|---|
| Vainu, one Nordic country database | EUR 3,500/yr (~EUR 292/mo), +EUR 500/yr per extra country | https://www.vainu.com/pricing |
| Goava, extra market | 2,000 SEK/mo (~EUR 175) on a EUR 390-590/mo base | https://www.goava.com/en/pricing |
| Dealfront, all of Europe (2023, since abandoned) | EUR 14,988/yr | https://marketing.dealfront.com/Sales+Intelligence-EN-Downloadable.pdf (Last-Modified 13 Dec 2023) |
| Clazar, cloud GTM tooling | $799/mo QuickStart, $1,499/mo Growth | https://www.clazar.io/pricing |
| Clazar, one additional scope unit | $6,000 | https://aws.amazon.com/marketplace/pp/prodview-hvgop25tipa5g |
| Crossbeam Connector | $4,800/yr, 1 seat | https://www.crossbeam.com/pricing/ |
| Tackle Co-Sell | $20,000 per cloud (medium confidence, marketplace listing) | Microsoft commercial marketplace listing |

### The retention floor, which is the hard constraint

Products above $250/month show 70% GRR and 85% NRR. Products under $50/month show 23% GRR and 32% NRR (n=3,500 companies, ChartMogul data, published 10 Dec 2025 — https://www.growthunhinged.com/p/the-ai-churn-wave). Vainu's EUR 3,500/yr floor sits at EUR 292/mo, just above the cliff. That is not a coincidence.

**Nothing you sell may price below EUR 400/month.** Below that you are buying customers who will not stay.

### Recommended price card

Two bands by addressable universe, not flat. HERE Technologies specifically abandoned flat coverage-area pricing for a base fee "calculated on the population of the coverage area," and added a discount for buying more than one country (https://www.korem.com/everything-you-need-to-know-about-here-technologies-new-pricing-model/ — reseller source, medium confidence). Your zones are far more unequal than HERE's counties: UK ~365k IT-cohort companies against Ireland ~19k on your own shelves. A flat zone price either overprices Iberia or gives away UKI.

| Band | Zones | Price (annual billing) | Monthly billing | Dossiers included / mo |
|---|---|---|---|---|
| **A** | Nordics, UKI, DACH | **EUR 990/mo** (EUR 11,880/yr) | EUR 1,390/mo | 25 |
| **B** | France, Benelux, Italy, Iberia | **EUR 690/mo** (EUR 8,280/yr) | EUR 970/mo | 18 |
| **C** | CEE | **EUR 450/mo** (EUR 5,400/yr) | EUR 630/mo | 12 |
| **Europe** | All loaded zones | **EUR 2,450/mo** (EUR 29,400/yr) | EUR 3,400/mo | 90 |

Annual discount ~30%, matching Leadfeeder's published 30%.

**Additional dossier beyond the allowance: EUR 90.** Published, self-serve, no negotiation.

**Held meeting (desk-delivered, your human layer): EUR 750 each, sold separately.** Keep this off the platform price card. It is the ACTIVATION_30D desk, it has your time in it, and it must not look like a platform feature.

**Reasoning on the Band A number.** EUR 11,880 for Nordics sits at roughly 3.4x Vainu's single-country floor and roughly 2.4x Vainu's four-country Nordic configuration (3,500 + 3×500 = EUR 5,000). That premium has to be earned by the deliverable, not the data: Vainu sells a database, you sell a scored, estate-read, funded-door-classified, ACE-ready dossier. It also sits comfortably below Clazar Growth ($1,499/mo ≈ EUR 1,380/mo) and below the 2023 Dealfront all-Europe anchor, so a buyer comparing does not flinch. **Confidence on these specific numbers: medium.** The anchors are sourced; the placement between them is judgment and should be tested against the first ten quotes.

### Multi-zone bundling and expansion

- Second zone: **60% of list**. Third and beyond: **40% of list**. Published on the pricing page.
- All-loaded-Europe cap at EUR 2,450/mo, so the ladder always terminates somewhere legible.
- **Publish the add-a-zone price.** Clazar publishes $6,000 to add a marketplace. WorkSpan, PartnerStack, Tackle and Superglue publish nothing at all. In a category that is uniformly quote-only — Cognism publishes no price in any currency (https://www.cognism.com/pricing) — a published self-serve zone price is itself the differentiator.
- **Sell single countries too, at 55% of the zone price.** The zone is the preset; the country is the primitive. A partner who only sells into Sweden should be able to buy Sweden, and should see exactly what the Nordics upgrade costs.

### Group structure warning

European AWS consulting partners run one legal entity per country. A zone price card invites each subsidiary to buy its own zone: six small contracts, six procurement cycles, six renewal dates, no group relationship. Put an **Affiliate definition, group co-termination, and the multi-zone discount into the contract template from day one**, so the group has a reason to consolidate rather than fragment.

---

## 5. STICKINESS PLAN

Ranked by evidence strength, with build cost.

| # | Mechanic | Evidence | Build cost | Why |
|---|---|---|---|---|
| 1 | **Human touch within 48h of first dossier** | Strong — sales assist ~2x freemium conversion (Poyar/Lenny, n=1,000+) | Free (your time) | Highest-leverage single item in this memo |
| 2 | **Gate egress, not the read** | Strong — Crossbeam's entire model; Leadfeeder, Clay, Apollo, Lusha all gate activation not search | Low — one entitlement check on export/reveal/ACE-push | Wall arrives after value is felt |
| 3 | **Signal delay on free (30 days)** | Strong — Leadfeeder's rolling-window free tier | Low — one timestamp filter | Converts a one-time snapshot into a recurring reason to pay |
| 4 | **Backend shutdown for non-converting free accounts** | Strong — Baremetrics' actual shipped fix | Medium | Protects paying tenants from free-tier load; this is the survival item |
| 5 | **Weekly "what changed in your zone" digest** | Medium — mechanism widely accepted; your own signal feeders already run | Low — the Partner Trio email already exists at ~$0.04/trio | Makes the zone a subscription to change, not a list |
| 6 | **Published add-a-zone price with self-serve checkout** | Medium — Clazar's $6,000 dimension | Medium | Turns expansion from negotiation into a click; see failure mode 2 |
| 7 | **Outreach-regime routing built into the zone** | Strong internally (your own DK/NO/DE consent findings) | Medium | "Nordics" means SE/FI email plays and DK/NO call plays; nobody else does this and it is the hardest thing to copy |
| 8 | **AWS-funded first year for the first zone** | Medium — Clazar advertises "Free for First year*" asterisked to "*Ask sales about cloud credit program eligibility" (https://www.clazar.io/pricing) | Medium (paperwork, not code) | You hold MDF through Novalo. A first zone free and underwritten by AWS money is precedented in this exact category |

Items 1-4 are the minimum viable set. Do not launch the free zone without item 4.

---

## 6. WHAT WOULD MAKE THIS FAIL

**Failure 1: the free zone is permanently sufficient.**
A partner takes the free Nordics zone, reads the 400 companies that matter to them, exports nothing because they retype the good ones by hand, and never pays. This is the most likely failure and it is a product-design failure, not a pricing failure.
*Early indicator:* dossier generation per free account collapses after week 2, and day-30 return rate is under 25%. Watch specifically for accounts that generate 3 dossiers in the first 48 hours and then go quiet — that is a scrape, not a trial.
*Pre-emptive fix:* the 3-lifetime-dossier cap and zero contact reveal. If the indicator fires anyway, the next lever is capping companies *visible* per session, not per month.

**Failure 2: the zone ceiling caps NRR.**
Six zones is six expansion steps ever. Most European AWS partners sell into one to three countries and will never enter a new one. Territory expansion at every vendor checked is a human sales motion — Creditsafe's own help desk answers geography questions with "call your account manager" (https://creditsafe.freshdesk.com/en/support/solutions/articles/7000020792-how-do-i-view-an-instant-international-credit-report-). And ZoomInfo, the one large GTM-data vendor that does sell geography as an add-on, still reported **87% net revenue retention at 31 Dec 2024** on $1,214.3m revenue (https://www.businesswire.com/news/home/20250225694335/en/ZoomInfo-Announces-Fourth-Quarter-and-Full-Year-2024-Financial-Results). Usage-based vendors run higher NRR than seat-based precisely because expansion happens without a conversation; territory is worse than seats on that axis.
*Early indicator:* by month 9, median zones per account is stuck at 1.0 and expansion revenue is under 10% of new ARR.
*Pre-emptive fix:* the growth meter is the **dossier**, not the zone. Zone sets scope and is the free tier's natural fence; dossiers delivered inside it are what grow. A partner who never leaves Sweden can still triple their spend.

**Failure 3: cost-to-serve outruns conversion.**
Free zones generate estate reads, enrichment calls and LLM dossier work. Baremetrics died of exactly this at a healthy 11.5% conversion rate. You already have a claude-proxy cap at $900 and a "free nightly feeder with blind rows" problem in memory.
*Early indicator:* inference plus enrichment cost per free account per month exceeds EUR 4, **or** p95 dossier generation latency for paying tenants rises above baseline. The second one is the real killer, because it churns payers.
*Pre-emptive fix:* free accounts read cache only; hard per-account monthly compute budget; automatic processing shutdown at day 30 of inactivity.

**Failure 4 (runner-up, worth naming): the Cognism attack.**
Cognism markets, verbatim, "Cognism does NOT charge extra for access to data in NAM, EMEA, and APAC," explicitly aimed at ZoomInfo's passports and at regionally-limited providers (https://www.cognism.com/blog/emea-b2b-data). If you price by zone, expect "why am I paying extra for geography" in every competitive deal.
*Early indicator:* it shows up as a stated loss reason in more than 2 of your first 10 losses.
*Defence:* say the true thing out loud. Each country is a separately loaded national register with its own join keys, its own domain-fill problem, and its own outreach law. You are not gating a global database behind a paywall; you are selling shelves you actually built. That defence is only credible while it stays true, which is another reason not to sell zones you have not loaded.

---

## 7. OPEN QUESTIONS

**Could not be sourced.**

1. **AWS's zone-to-country roster.** AWS names the units (Europe North, UKI, Iberia, Italia, EMEA Central, Nordics) but publishes no membership table anywhere I or the researchers could find. The only explicit prose is the EMEA Central APO posting naming Germany, ALPS and CEE. **Action: get the EMEA partner sub-region map from your PDM in writing.** Until then, publish your own country list per zone and never imply you are quoting AWS.
2. **Whether limiting by SCOPE beats limiting by VOLUME.** There is no published evidence either way. ChartMogul segments by model (freemium / trial / reverse trial / card-gated) but explicitly not by limit dimension. OpenView's own freemium guide names the dimensions and stops. Everything asserting "scope-limiting converts better" is content-farm material. **Treat your core hypothesis as untested and instrument it so it produces an answer.**
3. **What one closed AWS opportunity is worth to a European partner.** I could not source a defensible MAP-funded services figure. Do not put a number on this in any customer-facing material. Instead, make the partner do the arithmetic in the room using their own average deal size.
4. **Time-to-value benchmarks for B2B GTM tools.** The widely quoted "average TTV 1 day 12 hours" and "activation within 24 hours makes a user 2.5x more likely to convert" figures trace to a dead URL. What is defensible: 62% of products use a 14-day trial (ChartMogul, Jan 2026, n=200). Design to a 14-day evaluation window and measure your own.

**Needs a decision from you.**

5. **Can a free-zone user import their own account list?** This is the single biggest architectural leak. If a partner can upload their book and run Rune, scoring, funded-door detection and dossier generation on it, the cheapest zone becomes an unlimited platform licence and the library stops being what they pay for. **My recommendation: import is a paid feature, full stop.** The zone entitlement must sit on the import path and the dossier generator, not just the search index.
6. **Baltics inside Nordics, or inside CEE?** I have put them in Nordics because AWS's sales org does ("Finland & Baltics, Europe North") and AWS markets "Nordics and Baltics" together. But APN's partner awards have CEE and no Baltics. Low-stakes either way; decide once and write it down.
7. **Three lifetime dossiers, or five?** Suger's analogue uses five as its free allowance. Three is my recommendation because it forces the decision faster, but this is the number most worth A/B testing.
8. **Do you take the AWS-funded first year?** Clazar does it openly. You hold MDF through Novalo. If the wallet allows underwriting a first free zone, you get Crossbeam's land motion without eating the cost — but confirm eligibility against the activity-log blocker already flagged in memory before designing the offer around it.

**Confidence summary.** High on: the AWS partner sub-region names, the Partner Central country-only constraint, the competitor price points cited, the retention cliff, the Baremetrics cost-to-serve mechanism, and the EU geo-blocking rule. Medium on: the specific EUR figures in section 4, the band assignment, and the HERE population-pricing precedent (reseller source). Low on: anything about how AWS internally draws territory boundaries, and on whether scope-limiting outperforms volume-limiting — both are genuinely unknown and both are things you will learn faster by shipping than by reading.

---

# ADVERSARIAL CRITIQUE

## PRIORITISED CORRECTIONS

Verification method: I re-fetched every load-bearing external source and checked the memo against `PRICING_v3.md`, `ENRICHMENT_WATERFALL_SPEC.md`, `FORGEBY_GLOBAL_PLATFORM_STRATEGY.md`, `DENMARK_CVR_LOAD.md`, `BACKLOG.md` and the open task list. Fifteen of roughly twenty external citations check out verbatim. Three are inverted, two are inflated, and the memo's largest problems are not external at all: it contradicts a four-day-old internal pricing decision and it prices two zones whose libraries are built from the wrong side of the market.

---

### 1. The memo inverted its own lead source. Creditsafe sells exactly the thing the memo says nobody sells.

**Wrong.** Section 1's central "Wrong" verdict is: *"nobody sells unmetered access to anything,"* evidenced first by Creditsafe. The live page says the opposite. All three Creditsafe packages include **"Freedom access to business credit reports"** for the home market, unlimited, and meter only *international* reports at 5 / 50 / 150. Premier includes unlimited US monitoring as well. (https://www.creditsafe.com/us/en/credit-risk/product-packages/packages-full.html)

**Why it matters.** Creditsafe is a European-founded registry-data vendor selling exactly Forgeby's shape, and it is running Jacob's instinct in production: **unmetered inside your territory, metered outside it.** The memo cited it as the refutation. It is the proof. The whole "one named modification" that reframes the answer rests on a source that says the reverse.

**Fix.** Rewrite section 1's verdict to: *unmetered within the purchased zone, metered outside it.* That is a cleaner, better-evidenced product than "unlimited reading, 3 lifetime dossiers," and it is what Jacob asked for. The paid meter becomes cross-zone access, not dossier count.

---

### 2. UKI and France are libraries of BUYERS, not targets. Both are open bug tickets.

**Wrong.** The zone table's "Forgeby coverage today" column reads: UKI **"GB 365,809 IT cohort, ICP 7,647"** and France **"7,960 ICT 10+."** Per the standing two-sided-market doctrine, NACE 62-63 IT firms are Forj's **buyers**, not the library; the library is the partners' customers, all sectors. Open tasks #6 (*"Re-load UK gb_registry ALL-SECTOR (fix the SIC-62 doctrine error)"*) and #25 (*"FIX Ireland scope: loaded IT-only in error, must be all-sector"*) confirm this is known and unfixed.

**Why it matters.** The memo's single most consequential instruction is *"Nordics and UKI now (they are the only two you can actually deliver at depth)"* and *"Do not sell a zone you cannot fill."* By its own rule, UKI cannot be sold today. Neither can France. That collapses the sell order from two live zones to one, which changes everything downstream: the band structure, the Europe bundle, and the claim that the free tier can be pointed at "the market they choose in step one."

**Fix.** Sell order is **Nordics only**, with UKI gated on task #6 and IE gated on #25. Delete the UKI and France rows from the live card and replace the coverage column with a single honest metric per country: *outreach-grade companies in the target library, all sectors*. Do not put a registry row count next to an ICP count next to a company count in one column again; the table currently reads SE 820,926 against IE 18,687 and implies 44x depth where the two numbers count different things.

---

### 3. It contradicts `PRICING_v3.md` (2026-07-26) on four locked decisions, without naming it once.

**Wrong.** `PRICING_v3.md` is a dated six-agent decision from four days before this memo. The zone memo reverses it silently:

| PRICING_v3 decided | Zone memo does |
|---|---|
| **"No tokens. No credits. Ever, in this business."** | Meters "dossiers," 25/18/12 per month, **EUR 90 overage**. A metered manufactured unit with published overage is a credit with a new noun. |
| **USD quoted, SEK invoiced** (sourced rationale, §3) | Prices entirely in EUR, no mention of the reversal. |
| Desk = **"greater of $10,000/month or $1,000 per meeting held"**, floor-or-share, sourced to memoryBlue $800-1,000 and the $600-1,500 C-suite band | **"Held meeting: EUR 750 each, sold separately."** ~25% below the sourced marginal rate, unsourced, and it deletes the floor. §2 of PRICING_v3 is a page of argument that a pure per-unit meter *cannot* deliver a floor. |
| Monthly billing at **+10%** (Crossbeam's published mechanic) | Monthly at **+40%** (EUR 990 → 1,390). Also stated as "annual discount ~30%, matching Leadfeeder," which is the same number described from the other end. Leadfeeder's actual mechanic is EUR 79 annual vs EUR 113 monthly, a +43% monthly, so the citation happens to survive; the internal contradiction with +10% does not. |

**Why it matters.** Two pricing memos four days apart giving opposite answers on credits, currency and the meter is not a pricing problem, it is a decision-hygiene problem. Whichever wins, the other must be explicitly retired in writing.

**Fix.** The zone memo must open with a reconciliation section against `PRICING_v3.md` and either adopt its meter (greater-of floor, meetings held, USD) or state in one line why each reversal is now correct. Until then, do not put either card in front of a partner.

---

### 4. It anchors Band A to Vainu, which `PRICING_v3.md` names as the losing frame. And the Vainu anchor is unsourced.

**Wrong, twice.**

- **The frame.** `PRICING_v3.md` §1, verbatim: *"If a partner frames Alloy as a Nordic company database, you are 3x the published local benchmark and you lose the argument. If they frame it as cloud-partner GTM tooling, you are between Clazar and AppDirect and you win it."* The zone memo's Band A justification is *"roughly 3.4x Vainu's single-country floor and roughly 2.4x Vainu's four-country Nordic configuration."* It voluntarily enters the frame the previous memo identified as the one that loses.
- **The number.** I fetched https://www.vainu.com/pricing. It states "Starting at 3,500€/year" (Prospecting) and "4,200€/year" (CRM), 200 EUR and 750 EUR onboarding, 12-month auto-renew. It does **not** state "+EUR 500/year per additional Nordic database," it does not ship a country-checkbox calculator, and it publishes no download-volume ladder. So both *"+EUR 500/year per extra country"* and *"Vainu meters annual download volume on a declining ladder"* are unsupported, and the derived "3,500 + 3×500 = EUR 5,000 four-country configuration" is a fabricated comparison used as a price anchor.

**Why it matters.** This is the arithmetic the Band A price is defended with. One half is a frame the company already decided to refuse and the other half is not on the page.

**Fix.** Strike the Vainu ladder and the derived EUR 5,000 figure. Anchor Band A only to Clazar ($799 QuickStart / $1,499 Growth, both billed annually, confirmed live) and AppDirect, per the existing decision. If Vainu appears at all, it appears as the frame to avoid.

---

### 5. "Full free access to a market" exposes licensed and personal data. The memo does not mention Article 14 once.

**Wrong.** The free tier states *"Companies visible in chosen zone: **Unlimited** — full library, full scoring."* Against the actual shelf, that means:

- **Licensed third-party data.** Vainu SE data (~15k companies, 46.5k decision-makers) sits in the library. `BACKLOG.md` lists the **"Vainu license letter"** as an *open* pricing gate. An anonymous, no-card, unlimited-seat surface over "the full library" plausibly redistributes licensed data before the licence question is answered.
- **Personal data.** `ENRICHMENT_WATERFALL_SPEC.md` §3: *"Sole traders (enskild firma, enkeltpersonforetak, enkeltmandsvirksomhed): the whole company record is personal data. Treat them as persons throughout."* Suppressing contact reveal does not help; the *company row itself* is the personal data. Task #17 (*close the Article 14 gap on 77,028 contacts*) is still pending.
- **Attribution obligations.** `DENMARK_CVR_LOAD.md`: CVR is **CC BY 4.0**, attribute *"Det Centrale Virksomhedsregister (CVR)"* **wherever the data surfaces**. Estonia is CC-BY, offeneregister is CC-BY and flagged internally as "licence-encumbered and of unknown currency, not clean CC0." A free public zone is a new surface with new attribution duties.
- **The existing spec already solved this and the memo overrides it.** `FORGEBY_GLOBAL_PLATFORM_STRATEGY.md` specifies the open tier as `read_company` **"(banded, verified-only, watermarked + attribution)"** with a guardrail test that **"no PII columns reachable, ever,"** behind **"seven boring gates before ANY anonymous surface"** (task #38, still pending). "Unlimited, full library, full scoring, no card" is the negation of banded and verified-only.

**Why it matters.** This is the risk that ends the company, not the one that caps NRR. The memo spends 700 words on EU geo-blocking, which is a non-issue once the SKU is keyed to target-company country, and zero words on Article 14, which is live.

**Fix.** Free-zone visibility is **banded and verified-only** (the existing spec), sole-trader records are excluded outright, registry attribution renders on every surface, licensed rows (Vainu, Explorium) are excluded from any free surface until the licence letter lands, and the seven gates ship first. Add a §-level "what the free zone may show" table to the memo; it currently has none.

---

### 6. It kills a 3-read counter and then installs a 3-lifetime counter on the highest-value object.

**Wrong.** Section 1: *"kill the 3 free reads... a read counter is the single worst free-tier design for your buyer, because it makes the visitor experience scarcity before they experience competence."* Section 3: *"Finished dossiers: **3 total, ever**."* Three lifetime is strictly harsher than three per month, and it lands on the one artifact the whole product exists to manufacture. From the visitor's side this is the same product Jacob rejected, renamed.

**Why it matters.** Jacob's verbatim ask was "no credits." The memo answers "no credits," then ships credits. He will notice.

**Fix.** Take correction 1's structure instead: **unlimited dossiers inside the free zone, zero outside it, zero egress, contacts metered.** The fence is geography plus egress, which is what he asked for and what Creditsafe actually runs. If a hard cap is still needed for cost, cap it as a *rate* (per day, resets) not a *lifetime allowance*, so the user never experiences a permanent wall.

---

### 7. The Baremetrics lesson is the opposite of the one drawn.

**Partly wrong.** The numbers are right: 11 weeks, 11.5% conversion (53/461), 1,000+ free accounts, database load doubled, support tripled, "We lost nearly 60 customers during the 11 weeks we had our free plan, doubling our revenue churn." (https://baremetrics.com/blog/freemium-saas-implode)

But the memo says *"Baremetrics' actual fix was automatic data-processing shutdown for non-converters, not a feature cap."* The post's "What we're doing now" section says: *"In the past week, we've switched to a free trial. For 14 days, you get full access to everything, after which you can pick a plan."* The shutdown line (*"If you chose not to pick a plan, we stop processing your data"*) is a **property of the 14-day trial**, not a patch on a free plan. Baremetrics killed freemium.

**Why it matters.** The memo cites the one company that ran a full-access free tier and died of it, and quotes it as support for building a full-access free tier forever. The design Baremetrics adopted after the failure is precisely the design the memo never puts on the table: **full access to everything, time-boxed, no card.** That preserves 100% of Jacob's instinct ("full free access to the platform for the markets they choose"), caps cost-to-serve structurally rather than by policy, and gives a natural conversion moment. ChartMogul's own data says 62% of products use 14 days.

**Fix.** Add a fourth option to section 1 and score it honestly: **time-boxed full-zone access (14 or 30 days, no card), then read-only banded view forever.** It is not a reverse trial and the memo's reverse-trial dismissal does not apply to it. On ChartMogul's per-1,000-visitor numbers this is the model Baremetrics, the closest analogue, converged on after measuring.

---

### 8. Leadfeeder is cited twice for things it does not do, and the third thing it does do is fatal to the memo's rule.

**Wrong.** https://www.leadfeeder.com/pricing/ Lite plan, live: *"14-day full access. Free forever,"* **"Unlimited users,"** *"Last 7 days"* history, and **"Last 100 companies/month."**

- "Unlimited seats" is correct.
- The 7-day window is correct.
- **The memo omits the 100-companies-per-month view cap**, which directly contradicts its own stated rule: *"Cap the backend work, never the view."* The memo's flagship precedent for unlimited viewing caps the view.
- Leadfeeder Lite is also *"14-day full access, free forever,"* i.e. a reverse trial, which the memo tells Jacob not to build.

**Fix.** Either accept the view cap (which is the Leadfeeder mechanic and probably right for a library asset that is also the moat) or stop citing Leadfeeder. Do not do both.

---

### 9. The discount ladder drives most incremental units below the memo's own hard floor.

**Wrong, arithmetically.** Section 4 states: *"Nothing you sell may price below EUR 400/month."* Then:

| Unit | Price | vs floor |
|---|---|---|
| Single country, Band B (55%) | EUR 379.50 | **below** |
| Single country, Band C (55%) | EUR 247.50 | **below**, lands in the $50-249 band (GRR 45%) |
| Second zone, Band C (60%) | EUR 270 | **below** |
| Third+ zone, Band A (40%) | EUR 396 | **below** |
| Third+ zone, Band B (40%) | EUR 276 | **below** |
| Third+ zone, Band C (40%) | EUR 180 | **below** |

Six of the memo's own published SKUs violate its own non-negotiable rule.

**Also wrong: the Europe bundle is more expensive than à-la-carte on day one.** "Europe: all loaded zones, EUR 2,450/mo." Today only Nordics is genuinely loaded (see correction 2); even granting UKI, the ladder gives 990 + 594 = **EUR 1,584**. The Europe SKU is 55% *more* than buying everything that exists. That is a live arbitrage sitting on the pricing page at launch.

**Fix.** Set the floor as a constraint on the *ladder*, not on list price: no billed line below EUR 400 regardless of discount, and cap total discount at whatever keeps the smallest unit above it. Price the Europe bundle as a strict discount to the à-la-carte sum *of currently loaded zones*, recomputed as zones load, or do not publish it until four zones exist.

---

### 10. The retention floor is inflated 17x on sample size and drawn from the wrong population.

**Wrong.** The memo: *"Products above $250/month show 70% GRR and 85% NRR. Products under $50/month show 23% GRR and 32% NRR (n=3,500 companies, ChartMogul data, published 10 Dec 2025)."*

The GRR/NRR figures are correct (23/32, 45/61, 70/85). The attribution is not. The 3,500 is the total set of software companies whose **websites were scraped and AI-categorised**; the price-band retention comparison is run on approximately **200 AI-native companies**. (https://www.growthunhinged.com/p/the-ai-churn-wave)

**Why it matters.** This is the sole evidence for the EUR 400 hard floor, presented at "high confidence." n≈200 AI-native companies, scraped-and-inferred, is not the same object as n=3,500 measured. And the sub-$50 cohort is dominated by prosumer self-serve, so the 23% GRR is confounded by segment, not caused by price. The cliff the data actually shows sits between $50 and $250, and *every* price on the memo's card except the discounted units already clears it. The floor is not binding on anything it is invoked to defend, except the six units in correction 9 where it is violated.

**Fix.** Restate as: *~200 AI-native companies, ChartMogul/Poyar, Dec 2025, scraped-and-inferred, medium confidence.* Move the floor to EUR 250 (where the sourced cliff actually is) or drop the floor claim and keep the discount-ladder constraint on its own merits.

---

### 11. The zone map is invented, the memo half-admits it, and the invention does not buy anything.

**Sourcing is clean; the inference is not.** I verified the APN blog. It does organise EMEA into exactly the 13 headings claimed, including *"Nordics Winners," "Benelux Winners," "Iberia Winners," "Alps (Austria & Switzerland) Winners," "Germany Winners," "Italy Winners,"* and no Baltics heading. (https://aws.amazon.com/blogs/apn/announcing-the-regional-2025-aws-partners-of-the-year-for-europe-middle-east-and-africa/) The Address API check is also exactly right: CountryCode `Required: No`, StateOrRegion valid values are US states plus APO/FPO only. (https://docs.aws.amazon.com/partner-central/latest/APIReference/API_Address.html)

**But:** having established a 13-unit AWS taxonomy, the memo then deviates from it on two of its eight zones. It bundles **DACH** (APN lists Germany and Alps separately) on the strength of one job posting, and folds **Baltics into Nordics** (APN has neither) on the strength of one job title. So 2 of 8 proposed zones are not AWS units, while the memo's copy guidance is *"the way an AWS partner's territory is actually shaped."*

**The deeper problem the memo never states.** Jacob's question was *"how is AWS sales divided by market, imitate that."* The memo answers with a **partner-awards blog** and an **events site**, admits in Open Question 1 that AWS publishes no zone-to-country roster, and then builds the price card on it anyway. The honest answer is: **a European AWS partner's sellable territory is set by their own company's coverage, not by AWS's internal EMEA sub-regions.** The buyer never experiences AWS's sub-region map. Imitating it buys a name and nothing else, while creating the Cognism attack surface for free.

**Fix.** Keep the ISO-country-set architecture (that part is right and well-evidenced). Drop the AWS-derivation claim from customer-facing copy entirely. Present zones as **Forgeby presets over countries, named for what partners call them**, and let the buyer compose. If Jacob still wants AWS alignment, ship the eight-zone preset list but name only the six that match APN exactly, and get the real EMEA sub-region map from the PDM in writing before any of it is published.

---

### 12. Suger is not a free-allowance precedent, and Clazar's free year is not MDF.

**Two source misuses, both load-bearing.**

- **Suger.** Confirmed: $583.33/month platform fee, $1,000 "for each additional accepted net new private offer beyond the fifth." (https://aws.amazon.com/marketplace/pp/prodview-gn75qtuylmx6m) But those five offers are **included in a paid subscription**. It is an overage model on a paid plan, not a free allowance. The memo uses it twice: as the "fourth dossier" wall precedent and as *"Suger's analogue uses five as its free allowance"* in Open Question 7. Both readings are wrong.
- **Clazar's "Free for First year\*"** is asterisked to cloud-credit eligibility (the page also advertises *"Get upto $10k cloud credits back"* / *"$20k"*), which is an AWS credits mechanic. The memo converts this into stickiness item #8, *"AWS-funded first year for the first zone,"* underwritten by **MDF**. MDF is reimbursement to the partner for demand generation, explicitly excludes the partner's internal costs, and per the verified underwriting note **excludes retainers**; the activity-log blocker is still open (task #12, pending). MDF does not fund Forgeby giving away Forgeby's own software subscription. `PRICING_v3.md` §4 already carries a hard stop on publishing MDF economics.

**Fix.** Delete the Suger "free allowance" reading. Move stickiness item #8 to blocked, contingent on task #12 and a written MDF eligibility answer, and stop describing it as precedented by Clazar.

---

### 13. The paid card meters the wrong thing. Contacts are the COGS and they are uncapped.

**Missing.** The free tier caps the cost driver (zero contact reveal, cache-only reads). The paid card meters **dossiers** and says nothing at all about contact reveals. Reveals are where the money goes: FullEnrich mobile at 10 credits, Icypeas verification, Serper. `PRICING_v3.md` Tier 1 had this right and included an explicit fence, *"2,000 revealed contacts per quarter. Overage on reveals: $0.50 each."* The zone memo drops it. A Band A tenant at EUR 990/mo can reveal an unbounded number of mobiles.

**Fix.** Reinstate the reveal allowance and overage on every paid band. Meter reveals, not dossiers. That also removes the credits-under-a-new-name problem in correction 3, because a reveal fence is a fence, not a business, and it is the only meter that tracks actual marginal cost.

---

### 14. "Nordics" as one SKU bundles four markets in four different states, three of them impaired.

**Understated.** The memo correctly catches that DK and NO are call-first consent markets (`ENRICHMENT_WATERFALL_SPEC.md` §3 confirms: NO *"PRIOR CONSENT required even at a work address (mfl. § 15)"*, DK *"spam ban covers everyone, consent required"*). It stops there. The rest:

- **DK**: 40% reklamebeskyttet, so in a call-first market 40% of the shelf cannot be called either. Statutory, fine tariff from DKK 20,000.
- **FI**: produces **zero** signals, and scores zero on the Activate gate because headcount is unknown (Tilastokeskus purchase is task #14, pending).
- **SE**: the only fully working market.
- **Baltics** ("included coverage"): Estonia is 340,886 rows with **zero EMTAK codes and zero promoted** (task #1). Selling it as included coverage sells an empty shelf.

**Why it matters.** One EUR 990 price across a bundle where a Finland-focused buyer gets a market with no signals and no ICP scores is the fastest possible source of a first-renewal loss, and the memo's own rule (*"do not sell a zone you cannot fill"*) applies inside the zone as well as across zones.

**Fix.** Publish per-country readiness inside the Nordics SKU (signals live yes/no, headcount yes/no, lawful channel), price Nordics off Sweden plus Norway, and mark FI, DK-suppressed and Baltics as included-when-ready rather than included.

---

### 15. Smaller corrections, each one line.

- **ChartMogul is a survey, not a measurement.** *"200 responses,"* January 2026, self-reported. The memo calls it a "study" that "measures" 200 B2B products. Restate. Also the memo omits the row closest to its own recommendation: **ungated freemium, 70 signups and 5.6 paying customers per 1,000 visitors**, the best non-card outcome on the page and direct support for "no card at signup." Use it. (https://chartmogul.com/reports/saas-conversion-report/)
- **"Sales assist roughly doubles freemium conversion" is 1.4x at the good band.** Lenny/Poyar: assist 5-7% good / 10-15% great vs self-serve 3-5% / 6-8%, n=1,000+ products, OpenView + Pendo, 2023, self-reported. (https://www.lennysnewsletter.com/p/what-is-a-good-free-to-paid-conversion) Also note the epistemic inconsistency: the memo debunks a 2022 OpenView post as unreliable and then ranks a 2023 OpenView survey as its #1 "strong evidence" item.
- **Crossbeam free tier is 3 seats, not unlimited**, and the "10 records on Advanced Account Mapping" figure did not appear on the page I fetched; "View up to 50 records" for single-partner mapping did. Connector $4,800/yr with 1 seat and the 5,000 / 25,000 / 100,000 export ladder are confirmed. (https://www.crossbeam.com/pricing/)
- **Goava's second dial is SEATS, not volume:** *"One user costs 250 SEK/month."* Crossbeam's is also seats ($1,800/user/yr). The memo asserts *"the territory sets SCOPE and a second dial always sets VOLUME"*; in two of its three anchors the second dial is seats. Meanwhile the memo gives away unlimited seats on both free and paid. That may still be right (it matches `PRICING_v3.md` and Clay), but the section-1 generalisation is false as written. Base price and the 2,000 SEK/month per additional country are confirmed. (https://www.goava.com/en/pricing)
- **The AWS Marketplace regional fee is decorative evidence.** The quote is exact and the table is real (South Korea, 1%, effective 04/01/2025). But it is a single-jurisdiction 1% compliance uplift on a transaction fee, not AWS pricing its own products by sales territory. It is one of only two evidence classes offered for "geography is a sellable scope unit" and it does not carry that weight. Goava and Creditsafe do; lead with them.
- **VBER is probably misapplied.** Regulation 2022/720 governs vertical agreements between undertakings at different levels of the supply chain. An AWS partner buying Forgeby for its own GTM is a customer, not a distributor, so the passive-sales hardcore-restriction analysis does not obviously bite. Either get counsel or drop the paragraph. The geo-blocking point (Reg 2018/302 Art 4(2)) is directionally correct but moot once the SKU is keyed to target-company country, which the memo itself recommends. Two thirds of a page for a non-issue while Article 14 gets zero.
- **ZoomInfo 87% NRR at 31 Dec 2024 confirmed** (https://ir.zoominfo.com/news-releases/news-release-details/zoominfo-announces-fourth-quarter-and-full-year-2024-financial/). Fine as cited.
- **The free tier's real attack surface is enumeration, not compute.** The memo's failure-1 indicator watches for "3 dossiers in 48 hours then quiet." But the asset is the library, and unlimited seats plus no card plus no email verification plus unlimited views is a free anonymous enumeration endpoint over a country's coverage. Cost controls protect Bedrock spend; they do not protect the moat. Add rate limiting, per-account view budgets and watermarking per the existing `forgeby-mcp` spec.
- **The memo also breaks the public-exposure doctrine in its own failure-4 defence.** *"Say the true thing out loud. Each country is a separately loaded national register with its own join keys, its own domain-fill problem, and its own outreach law."* That is the HOW: the pipeline, the registry map and the legal matrix, all three named as never-publish. Answer Cognism with the WHAT (outcomes and refusals), not the forge.
- **There is no traffic engine.** Every conversion percentage in section 3 and every early indicator in section 6 presumes free-signup volume. Per `PRICING_v3.md` §5 the observed record is 20 meetings in aggregate, ever, with 1 win. The memo's #1 recommendation (human touch within 48h of every first dossier) is also flatly incompatible with the published capacity constraint of three partners at a time. Add a section: where do the first 200 free signups come from, and what happens to item #1 at 200.

---

## SOUND, MOVE ON

- **The ISO-country-set entitlement architecture.** Correct, well-evidenced, and the Address API check is exact. Store countries, present zones. Keep it.
- **Gate egress, not the read** (mechanic #2), and **signal delay on free** (mechanic #3). Right shape, right cheapness. The Leadfeeder citation for #3 needs the view-cap footnote from correction 8, but the mechanic stands.
- **Never grant zone exclusivity.** Right conclusion even if the VBER reasoning is shaky.
- **The APN 13-region sourcing, the Address API constraint, the Cognism quote, the Suger and Clazar and Crossbeam and Goava price points, the Baremetrics figures, the ZoomInfo NRR, the AWS Marketplace fee table.** All verified verbatim. The memo's citation discipline is genuinely good; its problem is what it infers from the citations, not the citations.
- **Open Question 5 (can a free user import their own list) and the answer "import is paid, full stop."** Correct, and it is the highest-value line in the memo. Make it a build requirement, not an open question.

---

## THE ONE-LINE RESTATEMENT

Jacob asked for unmetered access inside the market you buy. Creditsafe already sells that, the memo cited it as the refutation and got it backwards, and Baremetrics supplies the missing cost control (time-box the full-access window rather than cripple it). The design that actually answers the question is: **full unmetered platform inside the purchased zone, banded and verified-only outside it, contacts and egress metered everywhere, no dossier counter at all** — sold on a single Nordics SKU until tasks #6 and #25 make UKI real.
