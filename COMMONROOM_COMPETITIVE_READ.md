# Common Room: verified competitive read

2026-08-01. 20 agents, six sourced angles, adversarial verification with a publication-safety
gate on every load-bearing claim, then a critic pass.

> **HEADLINE: Zoom announced acquisition of Common Room on 2026-07-02.**
> Read the CRITIQUE before quoting anything from the memo. Where they disagree, the critique wins.
> Nothing here is cleared for public use unless the critique says so explicitly.

---

# DECISION MEMO: Should Forgeby position publicly against Common Room?

**To:** Jacob
**Date:** 2026-08-01
**Answer in one line:** No. Do not publish a comparison. Build a one-page internal battlecard for the "we looked at Common Room" moment, and spend the public copy on Forgeby's own provenance instead.

A note on the evidence base before you read on: this memo rests on a verified dossier in which two of the researchers' load-bearing framings were refuted or downgraded on adversarial review. Where a verdict corrected a finding, I use the corrected version. Several items the first pass treated as damning turned out to be either wrong (the "close not verified" claim) or innocently explainable (the 400M/200M "contradiction"). That pattern is itself the argument against publishing.

---

## 1. What Common Room actually is

Common Room is a US buyer-intelligence platform, founded 2020 in Seattle, that ingests a customer's own first-party signals (Slack, Discord, GitHub, product telemetry, website visits, CRM, social), resolves them to people via a product called Person360, layers a bought contact directory called Prospector on top, and fires AI agents (RoomieAI: Capture, Spark, Activate, plus DataAgent) at the result. It also ships an MCP server and a CLI with write capability, launched 2026-05-27, on an explicit "buyer intelligence needs to be headless" thesis (https://www.commonroom.io/blog/buyer-intelligence-just-went-headless/). It raised $52.9M across three rounds, the last on 2021-03-31, and nothing since (https://www.commonroom.io/careers/ states "Over $50 million raised since 2020"). Zoom announced a definitive agreement to acquire it on 2026-07-02, terms undisclosed (https://news.zoom.com/zoom-to-acquire-common-room-bringing-buyer-intelligence-to-its-ai-revenue-platform/); Zoom's blog copy of the same announcement now reads "The transaction closed in July 2026" (https://www.zoom.com/en/blog/zoom-to-acquire-common-room/). Confidence high on the announcement, medium-high on the close: the closing sentence sits on a single vendor page that was edited in place without updating its own dateModified, the newsroom release still says "expected to close," and commonroom.io itself still mentions Zoom nowhere.

Price, all primary: published entry is $2,500/month billed annually, i.e. $30,000/year, for 5 seats and up to 100k contacts (https://www.commonroom.io/pricing/). Advanced and Enterprise are "Custom." Their own AWS Marketplace listing publishes a cheaper floor, $12,000 for 12 months at 2 seats and 35k contacts, with the Team tier at $30,000 matching the website exactly (https://aws.amazon.com/marketplace/pp/prodview-tfbfrefl2t6jk). Procurement aggregator Vendr reports a $27,000 median across 75 purchases as of Feb 2026 (secondary, https://www.vendr.com/marketplace/common-room). Scale is where the evidence is genuinely thin: **there is no published customer count anywhere**, no ARR figure from any primary source, and headcount estimates from LinkedIn-derived aggregators range 108 to 183, a 70% spread, with at least one demonstrably wrong (it claims staff on five continents; the vendor's own careers page says US and Canada only). Do not put a headcount or ARR number in any document. The only hard scale signal I trust is their live Ashby job board on 2026-08-01: 7 open roles, all Remote-US or Remote-Canada, zero EMEA, and 4 of the 5 sales roles are renewals or account management rather than new-logo hunting.

---

## 2. Is it even a competitor

**No. Verdict: different category, different budget line, near-zero overlap with Forgeby's buyer.**

Common Room replaces the *signal unification and enrichment* budget: the ZoomInfo/Clearbit/6sense/Clay line. It originates nothing. Its entire value proposition presupposes you already have an audience, a community, a product with telemetry, or inbound traffic. The Prospector directory is bought coverage layered on top of that, and by their own documentation it is "sourced from LinkedIn and enhanced with various other sources" (https://www.commonroom.io/docs/using-common-room/prospector/). Forgeby replaces nothing; it manufactures net-new accounts a partner has never touched, from registries, and names a funded door.

Three independent checks confirm the non-overlap. First, eleven of their own surfaces were searched for AWS partner, Partner Central, ACE, co-sell, channel, or marketplace-selling use cases. Zero hits. Their only AWS relationships are that they sell as an ISV on Marketplace and run on AWS as a customer. Second, their customer wall is US B2B SaaS and dev tools (Notion, Figma, Databricks, Snowflake, GitLab, MongoDB, Atlassian, Anthropic), with a handful of European names (incident.io, SUSE, n8n, Northflank, Trengo) and **not one AWS consulting partner, reseller, or SI** (https://www.commonroom.io/customers/). Third, across G2, TrustRadius, Gartner Peer Insights, and Reddit, not a single reviewer identified as a cloud-partner sales leader.

**The real closest competitor is Andsend**, per Forj's own prior competitive read: it wins on polish and loses on the data and funding moat. Second in line, and arguably the more serious threat, is **AWS itself**: Partner Central shipped Lead Prospecting in July 2026, which kills the "AWS does no discovery" line and squeezes the layer above Forgeby's origination. Third, on the origination axis specifically, the structural rivals are the EU registry-data incumbents (Vainu in Sweden, Bisnode/Dun & Bradstreet across the Nordics), not US GTM platforms. Confidence high on Common Room's non-competition, medium on the ranking of the alternatives (drawn from Forj's own prior research files, not re-verified in this pass).

What this means practically: a Forgeby vs Common Room page would teach your buyer that Forgeby is a generic GTM tool. That is the exact frame the origination moat exists to escape. You would be paying to be miscategorised.

---

## 3. The 400M claim

| Where | Figure | Noun | URL |
|---|---|---|---|
| Product page | 400M+ | "contact directory" | https://www.commonroom.io/product/prospector/ |
| Docs overview | 400M-plus | "B2B profiles" | https://www.commonroom.io/docs/using-common-room/prospector/ |
| Docs FAQ, same page | 200M+ | "B2B contact database" | same |
| Person360 page | 200 million | "contacts" | https://www.commonroom.io/product/person-360/ |

Verified: all four strings exist, on live pages, the docs page stamped "Last updated May 14th, 2026." What is *not* verified is that this is a contradiction. The docs sentence carrying 400M explicitly says "contact **and organization** profiles," and Person360 is sold as identity resolution, so a roughly 2:1 profile-to-contact ratio is the expected output of the machine, not evidence of inflation. The adversarial review graded the "they contradict themselves" framing PARTLY_TRUE and unsafe on exactly this ground. Treat the gap as loose marketing, not as a lie.

What is marketing, plainly: the number itself. Common Room publishes no unit definition, no dedup method, no freshness measurement, no audit. And 400M is unremarkable in this market. People Data Labs, a **named sub-processor in Common Room's own DPA**, publishes 2,466,550,602 person profiles, of which 814,855,745 carry LinkedIn URLs (https://docs.peopledatalabs.com/docs/datasets). Size is their home ground and you will lose that fight.

**Does it hold in Europe? Unknown, and nobody can say otherwise.** There is no regional, country, or EU/US breakdown anywhere on their site, docs, pricing, privacy policy, or DPA. The only Europe-adjacent vendor statement is their own FullEnrich launch post claiming "2-3x expanded coverage for verified phone numbers across North America and EMEA" (https://www.commonroom.io/blog/common-room-fullenrich-smartlead/), which is partner-launch marketing about phones only, but which does concede an international coverage gap in their own voice. Note the awkward detail: FullEnrich is the same vendor in Forgeby's own waterfall.

The one number that actually matters, and which nobody uses: the directory is metered. Plans cap contacts at 100k / 250k / 750k and Prospector at 2,500 / 7,500 / 15,000 credits per year, with action on a Prospector contact requiring a paid add-on (https://www.commonroom.io/pricing/). A 400M pool that yields 15,000 actionable credits a year is a shop window, not inventory. That is the honest reframe, and it is entirely their own published pricing.

---

## 4. Their EU posture

Strictly what the documents show.

**Published and real (this is stronger than most US GTM vendors, and any copy implying otherwise would be false):** a DPA incorporating the full EU Standard Contractual Clauses, Modules One through Four, with Annexes I, II and III completed (https://cdn.sanity.io/files/vt347z5x/production/281d92d1e7f243c8c7a118ff9c5d9caaf0645a60.pdf). Sub-processor objection rights with ten days' notice, breach notification, audit rights, deletion on termination, and a government-demand notice clause. A public "Remove My Info" route that the Prospector docs state covers **EU residents** as well as California, Colorado, Virginia and Connecticut, for both opt-out of sale and right to be forgotten. A SOC 2 claim. A CCPA disclosure in their own words that Prospector "may be considered a 'sale' of personal information."

**Published and factual, but neutral rather than damning:** all 21 sub-processors in Annex III are US territory, with AWS specified as US-West (Oregon), and the annex is dated "Last updated: Oct 30, 2024," roughly 21 months stale, missing Vector and Bombora which they announced later. Six are "contact profile augmentation" vendors: Clearbit, People Data Labs, RampedUp, MixRank, Wiza, and GetEmails/Retention.com. No EU data residency option appears on the pricing page. Common Room, Inc. does not appear on the EU-US Data Privacy Framework list, active or inactive (checked 2026-08-01 at https://www.dataprivacyframework.gov/list), **which is meaningless as criticism** because DPF is voluntary and they use SCCs instead. Their flagship person-level visitor identification is, by their own April 2025 announcement, geofenced: it routes "US-based traffic (and only US-based traffic)" and the partner "does not store any data for non-US website visitors" (https://www.commonroom.io/blog/enhanced-website-visitor-identification/).

**Not published, which is not the same as not done.** I could not find: a GDPR lawful-basis statement or legitimate-interests assessment for the directory; an Article 14 source disclosure (the privacy policy's entire third-party sourcing text is one sentence, "We may obtain information about you from other sources, including from third-party services and organizations," and contains zero occurrences of "Article 14," "lawful basis," or "GDPR"); a standalone sub-processor page (/subprocessors/ returns 404); a dated SOC 2 report, auditor, or period; an ISO 27001 claim; an Article 27 EU representative; any EU coverage or customer-share figure. Every one of these is an absence in *my* search of *published* material. None is evidence of a failing. Several (an LIA, a SOC 2 report) are documents vendors routinely hold under NDA.

**Calibration against what regulators have actually done.** CNIL fined KASPR EUR 240,000 and ordered deletion over a ~160M-contact LinkedIn-derived database, on Article 6 *and* Article 14 grounds, faulting it for starting to inform people four years late and doing so in English (Délibération SAN-2024-020, 5 December 2024, https://www.cnil.fr/fr/aspiration-de-donnees-sanction-de-240-000-euros-lencontre-de-la-societe-kaspr). Poland's UODO fined Bisnode just over PLN 943,000 for failing the Article 14 notice duty on ~6.6M people whose data came from public registers, upheld by the Supreme Administrative Court in III OSK 2538/21 on 19 September 2023 (https://uodo.gov.pl/pl/138/2827). **Correction to your standing brief: that decision is Polish, not Swedish.** Do not cite a Swedish IMY Bisnode decision; I could not find one. The Apollo.io/RocketReach matter in Luxembourg is live but has produced no fine. And no regulatory action, complaint, or court record involving Common Room surfaced at all.

Read those two cases carefully, because they point at Forgeby as much as at anyone. Bisnode was fined for *public-register* data. That is your library's exact provenance. Article 14 is the exposure, and Forgeby's task #17 (Article 14 gap on 77,028 contacts) is open.

---

## 5. Where Forgeby is genuinely stronger

Only claims that survived verification.

- **Named provenance per row.** Forgeby can name Bolagsverket, Brønnøysund, CVR, PRH, Companies House, INSEE, CRO for any record. Common Room's privacy policy names no upstream at all, and the only vendors named anywhere sit inside a customer-facing contract annex.
- **Origination versus activation.** They read signal from an audience you already have. Forgeby produces companies a partner has never touched. Verified by the total absence of registry or company-discovery language across their product surface.
- **The funded door.** MAP and PoC, named per account, mapped to Partner Central verbs. Zero evidence of any AWS partner, co-sell, or ACE capability on their side after eleven surfaces checked.
- **Deliverable versus access.** They sell seats plus a contact cap plus two credit pools; Forgeby sells a held meeting and an ACE-ready dossier. Their own pricing page proves the metering.
- **EU jurisdiction and EU processing.** Their published stack is 21 US sub-processors with AWS in Oregon; Forgeby runs Bedrock eu-north-1 and self-hosted Supabase in-region. State this as residency, never as compliance.
- **Refusals as product.** Nobody else publishes what they will not hand over. **Caveat: this is not yet true.** The lawful-channel field (task #15) is unbuilt and the Article 14 notice (task #17) is open. This is your strongest differentiator and you cannot claim it until it exists.

---

## 6. Where Common Room is genuinely stronger

A memo with no losses is not credible, so:

- **Distribution.** They are inside Zoom. You are not going to out-distribute that, and any size comparison argues against you.
- **The agent rail is not yours.** They shipped MCP write capability and a CLI on 2026-05-27 with an explicit headless thesis, and MCP server docs dated 19 June 2026. Forgeby's MCP/agent tier is **not differentiating**. A larger player got there first and now has Zoom behind it. The moat has to be origination and refusals, full stop.
- **Third-party validation.** 115 G2 reviews at 4.5/5 (https://www.g2.com/products/common-room/reviews). Forgeby has none anywhere. Do not attack their review thinness (0 Gartner Peer Insights reviews, 3 written TrustRadius reviews all incentivized and all dated 27 December 2025) because the identical audit of Forgeby returns zero.
- **First-party signal depth.** Slack, Discord, GitHub, product telemetry, website deanonymization. Forgeby has none of this and does not need it, but for a PLG company they are simply better.
- **Enrichment breadth.** Six contact vendors under contract plus a FullEnrich partnership. On raw reachability volume they win.
- **Real EU paperwork.** Full SCCs across all four modules, an EU-inclusive deletion route, and CCPA sale disclosure. They are not a compliance soft target.

---

## 7. The recommendation

**Ignore publicly. Arm privately. Do not partner.**

Why not compare. Four reasons, any one sufficient. (1) The target dissolved. Zoom announced on 2026-07-02 and says the deal closed in July. Any page you publish compares against a product whose name, packaging, pricing and DPA are Zoom's to restate, and half the evidence in this dossier has a shelf life measured in weeks. (2) The attack you would most want to make is unsupported. There is **zero** sourced European complaint against Common Room, from any reviewer, anywhere. Writing "weak in Europe" would be a Forj document citing a Forj document, which is the exact failure mode already burned into CLAUDE.md. (3) EU comparative-advertising law is not on your side here. Directive 2006/114/EC Art. 4 and Sweden's Marknadsföringslagen §18 permit comparison only of material, relevant, verifiable and representative *features*, and forbid discrediting. Ownership changes, review counts, DPA scoping, and noun mismatches are not product features. The burden of substantiation sits on the advertiser, and you would be a pre-scale company defending negatives against a Zoom legal team. (4) Every sharp line boomerangs. Their docs tell reps to review AI output before sending; so does Rune. Their Article 14 posture is undocumented; so is yours, on 77,028 contacts. Attacking either invites a counter-audit you currently lose.

Why not partner. There is nothing to trade. They have no AWS partner motion, no co-sell surface, no EU origination need that Forgeby fills, and they are mid-absorption into an acquirer with its own agenda. Revisit only if Zoom wires Common Room into cloud co-sell, which nothing in the evidence suggests.

What to build instead: a **one-page internal battlecard** for the single moment this matters, when a prospect says "we looked at Common Room." The answer is one sentence: *they read signal from a community you do not have; we originate the company from a register you can audit.* Everything else in this dossier is context for that sentence.

---

## 8. Safe public wording

If you want the contrast on the site, it goes in Forgeby's voice, names nobody, and asserts nothing about anyone else. Exact sentences:

> **Where the library comes from.**
> Forgeby builds its company library from EU national business registries: Bolagsverket in Sweden, Brønnøysund in Norway, CVR in Denmark, PRH in Finland, Companies House in the UK, INSEE in France, and the CRO in Ireland. We do not buy company coverage. We do not accept LinkedIn-derived data. Ask us where any row came from and we will name the register.

> **What we measure ourselves.**
> We read each company's cloud estate from the outside, from public technical signals, and we tell you what we measured and when. Every number we publish states what it counts and the date it was counted.

> **What we will not hand over.**
> Where we cannot establish a lawful channel to a person, you get the refusal and the reason instead of the contact. That is part of the product, not a gap in it.

> **What you actually receive.**
> Forgeby does not sell access to a pool of records. It hands over a specific meeting-ready dossier with a named AWS funded door, MAP for an existing estate or PoC for a net-new workload, and a human approves every message and every submission before it leaves.

> **Who we answer to.**
> Forgeby is independent and European. The people who build it answer to the partners who use it.

Three hard gates before any of this ships. First, **the refusals paragraph must not go live until the lawful-channel field (task #15) and the Article 14 notice (task #17) actually exist.** Publishing it early is the single most self-destructive thing on this list, because it invites precisely the KASPR and Bisnode question, and Bisnode was fined for public-register data. Second, **verify the library count before it appears.** The brief says ~332,000; the internal records I can see give conflicting subtotals. One number, one definition, one count date. Third, the cloud-measurement sentence must not drift into naming methods or vendors, per the public-exposure doctrine: publish the what, never the how.

---

## 9. What must never be said publicly

Each of these is true-ish, sourced, and would cost more than it earns.

| Claim | Why it is unsafe |
|---|---|
| "Common Room is being acquired by Zoom" or "is now a Zoom product" | Ownership is not a product feature, so it sits outside the comparative-advertising safe harbour while carrying the denigration risk. It reads as instability FUD, and the implication (roadmap risk, support decay) is unverifiable. It also went stale in under four weeks: the newsroom release and the blog now disagree with each other. |
| "Their 400M is really 200M" / "their own pages contradict each other" | Graded PARTLY_TRUE on review. Their docs say "contact and organization profiles," which reconciles both figures innocently. They rebut it in one sentence and your page becomes the misleading one. |
| "Their GDPR paperwork does not cover their own database" | A processor-scoped DPA is what every SaaS DPA looks like, including the one Forgeby will publish. A partner DPO reading this concludes you either do not understand DPAs or are arguing in bad faith. |
| "They have no Article 14 notice" / "no lawful basis for the directory" | This asserts a compliance failing from an absence in *published* material, with no regulator finding behind it. It is the highest-risk sentence type available, and Forgeby's own Article 14 gap is open. |
| "They are not on the Data Privacy Framework list" | True and irrelevant. DPF is voluntary; they use SCCs. Instantly rebutted, and the rebuttal damages your credibility more than the claim damages theirs. |
| "They scrape LinkedIn" / "their data is unlawfully sourced" | Their docs say Prospector is "sourced from LinkedIn"; they never say how. Their LinkedIn *integration* genuinely uses an official permissioned API (r_basicprofile, r_organization_social, rw_organization_admin) on the customer's own page. Conflating the two hands them a single-sentence rebuttal that discredits your whole page, and the inferential step from "Wiza is in their sub-processor annex" to "this data is unlawful" is defamation-adjacent. |
| "Their marketing says no hallucinations but their docs admit hallucinations" | Both quotes are real, but the marketing line is on the homepage, not a comparison table, and the docs caution is scoped to one feature and predates it by ten months. It also boomerangs: Rune is human-gated for the same reason. |
| "They are weak in Europe" | Zero sourced European complaints exist. This would be unsourced assertion presented as finding. |
| "They have thin enterprise validation" (0 Gartner reviews, 3 incentivized TrustRadius reviews) | Invites the identical audit of Forgeby, which has none at all. |
| Any quote from Salesforge, MarketBetter, Warmly, Prospeo, Tomba, 11x, Reo.dev, or ZoomInfo's blog | "Six months on implementation," "dashboard fatigue," "70% five stars" and similar could not be located in the actual review corpus on G2 or TrustRadius. They may be invented. One of these landing in Forgeby copy and turning out to be fabricated would destroy the provenance position the whole company rests on. |

Also correct in your own files: the public-register Article 14 precedent is **Polish UODO ZSPR.421.3.2018, upheld NSA III OSK 2538/21 (19 September 2023)**, not a Swedish IMY decision. That error is currently in the brief and would be embarrassing in front of a DPO.

---

# ADVERSARIAL CRITIQUE + PUBLICATION SAFETY

## ADVERSARIAL REVIEW: "Should Forgeby position publicly against Common Room?"

**Reviewer verdict up front:** the recommendation is right, the reasoning is partly wrong, and Section 8 is not safe as written. Six of the corrections below are blocking.

---

## P0 — BLOCKING. Do not let Section 8 near a page until these are fixed.

### P0-1. "We do not accept LinkedIn-derived data" is very likely false as written, in Forgeby's own pipeline

**What is wrong.** Section 8 publishes an absolute. `C:\Users\jacob\alloy\ENRICHMENT_WATERFALL_SPEC.md:9` states the goal as "LinkedIn URL and email are must-haves on every worked account." Line 119 makes rung R1 "Serper: LinkedIn URL discovery," described at line 140 as "1,752 finds already banked," with a `serper_linkedin` ledger of 7,500 tried / 822 verified (line 28). `NORDIC_ENRICHMENT_SOURCES.md:21` describes a shortlisted vendor's coverage as "Thin Nordic (LinkedIn-sourced)." FullEnrich sits at R2 and has, per the memo's own Section 4, never named its upstream.

**Why it matters more than anything else in the memo.** This is the one sentence on the page whose falsification is trivially cheap for a competitor or a DPO: it requires one screenshot of a Forgeby contact record carrying a `linkedin_url`. Publishing it torches the provenance position that the entire company rests on, and it does so on the exact page whose purpose is provenance. It is also strictly worse than the memo's own Section 9 entries, which it kills for far smaller exposure.

**The fix.** Publish the internal rule as an internal rule, precisely and narrowly. The standing doctrine in memory is "buying the scrape does not launder it; make vendors name the upstream," which is a purchasing rule, not a statement that no LinkedIn-derived datum exists in the system. Replace with: *"We do not buy scraped social profiles as a data source, and we require every enrichment vendor to name its upstream."* Then gate even that on task #20 (`contacts.collected_at` + `source_url`, still pending) shipping, and on written upstream statements from FullEnrich, Serper, Icypeas and Prospeo. Until #20 exists you cannot audit your own rows to know whether the sentence is true.

### P0-2. Section 5's residency bullet and Section 8's "European" paragraph reproduce the exact error CLAUDE.md was written to prevent

**What is wrong.** Section 5 offers "EU jurisdiction and EU processing" as a verified Forgeby advantage against "21 US sub-processors with AWS in Oregon." `ALLOY_360_AUDIT.md` (2026-07-24) says the opposite about Forgeby: "the site's flagship EU-residency claim is false for the primary product surface, and Anthropic PBC appears on no sub-processor list anywhere. That is a contract problem, not a copy problem." `FORGEBY_GLOBAL_PLATFORM_STRATEGY.md:43` puts it numerically: "today the claim is falsifiable (91.7% of hot-path inference hits the US API; Anthropic absent from sub-processor lists)."

Worse, `FORJSE_ENTERPRISE_BUILD_PLAN.md:192` records that the **live** forj.se `trust.html:62` and `dpa.html:91` sub-processor rows assert "AI inference (Amazon Bedrock)" / "EU (Stockholm)" and therefore "still misstate where the primary inference happens." So the comparison the memo proposes is: a competitor with a complete but 21-month-stale sub-processor annex, versus Forgeby, which has a **currently published sub-processor table that omits its primary AI sub-processor.** That is not a favourable contrast. It is a self-report.

**Why it matters.** CLAUDE.md exists because this precise claim was shipped once already on 2026-07-20. The memo does not mention the 91.7% measurement anywhere. An adversarial review that misses the reviewed party's own documented, unremediated instance of the failure mode it is reviewing for has not done the job.

**The fix.** Delete the "EU jurisdiction and EU processing" bullet from Section 5 outright until `FORGEBY_GLOBAL_PLATFORM_STRATEGY.md:82`'s gate is met ("Gate ALL residency copy on re-measurement >99% EU on tenant paths"). Add a hard gate to Section 8: no residency, sourcing, sub-processor or "European" language ships until the trust.html and dpa.html tables are corrected and the routing is re-measured. Also strike the Section 5 line "Common Room's privacy policy names no upstream at all" from the battlecard: it invites the identical audit of forj.se/privacy.html, which currently fails it.

### P0-3. Section 8 lists Companies House among "EU national business registries"

The UK is not in the EU. This appears in the single paragraph whose whole function is precision about provenance, in front of a reader who is being invited to test that precision. Fix: "national business registers across Europe." Trivial to correct, disproportionate to get wrong.

### P0-4. The Swedish provenance name is unverified and may be the wrong register

Section 8 names **Bolagsverket** as the Swedish source. The repo's own account is more complicated: `BACKLOG.md` A6 describes the Swedish route as "Bolagsverket HVD bulk (`scb_bulkfil.zip`, CC0) + SCB Företagsregistret free API," and memory records `se_registry` at 820,926 with size gated on SCB, plus a separate signed SCB agreement that is "redistributable **with attribution**." If any published Swedish row's employee band, VAT flag or employer flag came from SCB rather than Bolagsverket, then naming only Bolagsverket is both an incomplete provenance statement and a possible breach of the SCB attribution term the company signed on 2026-07-23.

**Fix:** before publishing, resolve per-attribute which register supplied which field for each of the seven countries, and add the SCB attribution if SCB fields are exposed. Do the same check for France: memory says the French cohort came from **INSEE/Sirene**, which is the statistical business register, not the commercial court register, and a French DPO will know the difference. Also verify Ireland: task #25 says the CRO load was "loaded IT-only in error," so the Irish coverage claim is not what the sentence implies.

### P0-5. "Ask us where any row came from and we will name the register" is a promise the system probably cannot keep

Task #20 (`contacts.collected_at` + `source_url`) is **pending**. Task #30 (cross-shelf domain re-verify) is in progress and reports slug-name proofs at only ~62% precision. If per-row source is not stored, this sentence converts a data-model gap into a public commitment, and the first partner who takes you up on it gets a hand-assembled answer or none. It is also the sentence a competitor would most enjoy testing.

**Fix:** ship #20 first, or downgrade to what is true today: "We name the register behind every country in the library, and we will show you the source for any record on request during diligence." Note that `FORGEBY_PUBLIC_EXPOSURE_DOCTRINE.md:52` already says full per-attribute provenance belongs "in the DPA, the security pack, or under NDA during diligence," not on a public page. Section 8 as drafted contradicts the doctrine the memo elsewhere invokes.

### P0-6. "A human approves every message and every submission before it leaves" is unscoped

Twenty-six active crons run against this system, including the weekly champion-watch and the Partner Trio email, which memory records as "live and verified at ~$0.04/trio." Whether those are human-gated at send is not established in the memo. As drafted, one automated partner-facing email falsifies an absolute.

**Fix:** scope it. *"No message to a prospect and no Partner Central submission leaves without a named human approving it."* Then verify that against the cron inventory before publishing, not after.

---

## P1 — Reasoning defects that will mislead the decision even though the answer survives

### P1-1. Section 2 applies the opposite evidentiary standard to the one Section 4 demands

Section 4 correctly insists that absence in published material is not evidence of a failing. Section 2 then reaches "**Verdict: near-zero overlap**, confidence high" from exactly that inference form: eleven surfaces searched, zero AWS-partner hits; customer wall contains no SI; no reviewer self-identifies as a cloud-partner seller. What that evidence supports is that Common Room does not **market** to this buyer. It does not support "near-zero overlap," because an AWS consulting partner is itself a B2B tech company with inbound traffic, a CRM and possibly a community, and could buy Common Room for reasons that have nothing to do with AWS co-sell and still spend the budget Forgeby wanted.

**Fix:** restate as two claims with two confidences. High: Common Room publishes no AWS-partner or co-sell motion. Medium: Forgeby will rarely meet it in a competitive deal. Low, and unmeasured: whether it competes for the same budget line inside an AWS partner. Then note explicitly that the recommendation is over-determined and does not depend on this, so the correction costs nothing.

### P1-2. "A shop window, not inventory" is an inference presented as a fact, and it is the memo's own double standard

Section 3 calls this "the honest reframe, and it is entirely their own published pricing." It is not. The Prospector credit caps (2,500 / 7,500 / 15,000 per year) meter **directory pulls**. The 100k / 250k / 750k caps meter **contacts under management**, which customers also reach through their own first-party signals, which is the actual product thesis. "A 400M pool that yields 15,000 actionable credits a year" therefore mischaracterises the architecture and is rebuttable in one sentence, which is the disqualifying test the memo applies to everything in Section 9.

**Fix:** either move it into Section 9's never-say table, or relabel it INFERENCE, confine it to the internal battlecard, and state the rebuttal alongside it so a rep does not walk into it.

### P1-3. Section 7's legal argument overreaches, and the overreach hides the one lawful comparison available

Reason (3) says ownership changes, review counts, DPA scoping and noun mismatches "are not product features." Correct. But it is written as though comparison is legally closed, which is false: under Directive 2006/114/EC Art. 4(c), **published price and metering are material, relevant, verifiable and representative features**, and comparing "seats plus a contact cap plus two credit pools" against "a held meeting and a dossier" would sit inside the safe harbour. The memo declines the one comparison it could lawfully make, and dresses a strategic reason (category contamination, per Section 2's closing paragraph, which is the genuinely strong argument) in legal clothing.

**Fix:** say plainly that comparison on published price and metering is lawful and is being declined on positioning grounds, not legal ones. A memo that lets a legal rationale do a strategic rationale's work will be overruled the first time someone reads the Directive. Also correct the citation: the burden-of-substantiation point traces to **Art. 5(3)**, not Art. 4, and Swedish `marknadsföringslagen` (2008:486) 18 § is the comparative-advertising provision while 10 § (misleading marketing) and 5 § (god marknadsföringssed) are the ones that actually catch a self-referential claim like "we do not accept LinkedIn-derived data." Section 8 is governed by 10 §, not 18 §, which the memo never says.

### P1-4. Section 8 is described as asserting "nothing about anyone else." It does, by design

"We do not buy company coverage. We do not accept LinkedIn-derived data. You get the refusal and the reason instead of the contact. Forgeby is independent and European." Every one of these is read comparatively by a buyer who knows the alternatives, and the "Who we answer to" paragraph exists for no reason except the Zoom acquisition. That is lawful today, because comparative advertising requires an **identifiable** competitor and none is named. But it stops being lawful-by-default the moment this copy shares a surface with anything that identifies Common Room: a leaked battlecard, a "US GTM platforms" blog post, a deck slide.

**Fix:** state honestly that Section 8 works because it is read comparatively, and add the operational rule the memo is missing: **the Section 8 copy and any competitor reference must never appear on the same surface, and the internal battlecard must never be quoted verbatim into public copy.**

### P1-5. "Independent" is an unverified corporate claim

Memory records that IP title through Novalo is an open existential gap, that all AWS activity runs through Novalo, and that Novalo and Forj are merging. "Independent" is a statement about ownership and control that a diligence reader can test. Replace with the specific, defensible, and actually more useful claim: *"Forgeby is a European company. No cloud vendor and no data broker owns any part of it."* Verify both halves before it ships.

---

## P2 — Precision and durability

- **P2-1. The Bisnode correction is right but stated too flatly.** Verified against UODO's own page (uodo.gov.pl/pl/138/2827, mirrored EN at /en/553/1572): PLN ~943,000, Art. 14, data from KRS/CEIDG/REGON, NSA dismissed the cassation appeal on 19 Sept 2023, III OSK 2538/21, and held that the disproportionate-effort exemption must be read narrowly. But the chain runs through a WSA Warsaw judgment that **partly annulled** the UODO decision before NSA. Write "the fine and the Art. 14 finding were upheld," not a bare "upheld." And the safe form of the correction is "the ~PLN 943k public-register Art. 14 fine is Polish (UODO); I found no Swedish IMY equivalent," not "that decision is Polish, not Swedish" — otherwise the correction itself becomes a propagated error if an IMY decision turns out to exist. Fix the memory index line, which currently says "Bisnode fined for public-register data" with no jurisdiction.
- **P2-2. Every Common Room URL in this dossier is about to break.** The memo's own thesis is that Zoom is absorbing the company. Capture Wayback snapshots of all cited pages (pricing, Prospector docs, Person360, DPA PDF, customers, careers, the Ashby board) **today**. Otherwise the battlecard will carry citations that 404 within the quarter, and an unverifiable citation in a sales conversation is worse than no citation.
- **P2-3. The Ashby job-board reading is thinner than its placement suggests.** Seven roles on one day, with "4 of 5 sales roles are renewals" inferred from titles, is a snapshot with a shelf life of weeks. Label it inference, low durability, and date-stamp it inside the battlecard.
- **P2-4. Section 1's Zoom-close treatment contradicts itself.** The preamble says a researcher's "close not verified" claim was "wrong," then Section 1 grades the close medium-high on a single vendor page, i.e. not verified. Both cannot stand. The accurate statement is that the earlier claim was **over-stated**, not wrong. Separately, inferring an in-place edit from an unchanged `dateModified` is weak; that field is routinely stale or absent. Drop the inference, keep the fact that the newsroom release and the blog now disagree.
- **P2-5. "There is no published customer count anywhere" plus "do not put a headcount or ARR number in any document"** is the best-calibrated instruction in the memo. Keep it, and extend it to the library count: `ENRICHMENT_WATERFALL_SPEC.md:19` says 96,877 companies, `ALLOY_360_AUDIT.md` says 97,562 rows, memory says 129,179 → 257,773 for the Nordic 2+ build and the brief says ~332,000. Four numbers, four definitions. The memo flags this; make it a hard gate with a named owner, because Section 8 publishes a promise ("every number states what it counts and the date it was counted") that the company is currently in breach of.
- **P2-6. Section 9's "Any quote from Salesforge, MarketBetter, Warmly…" row is the best row in the memo.** Strengthen it from a prohibition to a rule: no third-party quote enters any Forgeby document without a URL and an archive snapshot, full stop.

---

## Sections that are sound

- **Section 6 (where Common Room is stronger)** is sound and is the section that makes the memo credible. The "the agent rail is not yours" concession in particular is correct and unflattering, which is how you know it is honest.
- **Section 9's table** is sound in every row. The reasoning on the 400M/200M reconciliation ("contact and organization profiles"), on the DPF irrelevance, and on the LinkedIn conflation being defamation-adjacent is right and well-calibrated.
- **Section 7's "do not partner"** is sound and adequately supported.
- **Section 4's separation of published / not-published / regulator-verified** is the correct structure and should be the template for future competitive work.

---

## VERDICT

**The recommendation is safe to act on. The memo is not safe to hand to a copywriter.** "Do not publish a comparison, build an internal battlecard, spend the public copy on Forgeby's own provenance" is correct and over-determined: it survives every correction above, including the ones that weaken its stated reasoning, because the category-contamination argument in Section 2's closing paragraph is sufficient on its own. But Section 8, the only part of this document that was ever going to reach a public page, contains at least four sentences that are false, unverified, or unkeepable as Forgeby stands today (LinkedIn-derived, Companies House-in-the-EU, name-the-register-on-any-row, human-approves-every-message), and Section 5 offers an EU-processing advantage that the repo's own 2026-07-24 audit and the 91.7% measurement in `FORGEBY_GLOBAL_PLATFORM_STRATEGY.md:43` say Forgeby does not currently have, while forj.se's live sub-processor table omits its primary AI sub-processor. A memo whose central discipline is "do not assert about others what you cannot source" has not applied that discipline to its own side. Act on Section 7 today; treat Sections 5 and 8 as blocked until P0-1 through P0-6 close, and treat the residency and sub-processor remediation as the precondition for the entire provenance position, not as a separate workstream.
