# forj.se ENTERPRISE BUILD PLAN

Execution spec. Reviewed by Jacob, then executed against `C:\Users\jacob\alloy-landing` (branch `landing`, Amplify). All replacement copy below is final and em-dash-free. Where lenses proposed competing rewrites, this plan resolves them into one canonical string so there is nothing left to reconcile at build time.

---

## 1. VERDICT (three lines)

forj.se is engineered better than most AI-GTM peers (honest cert stance, hide-on-zero live numbers, a verifiable Smith passport, real dark theme, clean mobile), but it is **not enterprise-grade today** because it opens on a claim the buyer disproves from his own console and states EU residency as an absolute the live routing breaks.

The two things most in the way: **(1) Truth.** The hero, all three social cards, one program tile, and one Smith demo line assert AWS mechanics that a working Nordic AWS partner falsifies in the first meeting ("AWS does no discovery", an invented "RA-ID monthly rhythm", hard funding caps, a blanket "runs on Amazon Bedrock in the EU"). **(2) Restraint.** The site owns Inception42's exact palette but sprays the accent across ~30 elements and leans on 700 bold, so it reads as a capable dashboard, not an ownable foundry brand.

Fix the truth first (it is cheap, it is do-now, and it does not wait on the redesign), then rebuild toward show-not-tell.

---

## 2. P0 SHIP-BLOCKERS (do immediately, independent of redesign)

These four land regardless of everything below. Each is exact replacement copy.

### 2.1 "AWS does no discovery" (hero + all three social cards + FAQ)
The single most damaging line. It is false (AWS enriches, scores, and prospects leads already in a partner's funnel via `StartProspectingFromEngagementTask`), it is load-bearing, and it torches the wedge in the first ten seconds. The true, sharper wedge is that AWS never manufactures a net-new account from the national market.

**Hero lead (index.html line 415):**
> AWS enriches and prospects the leads already in your funnel. It will not go find the account that is not in anyone's funnel yet. That is our work. We read every company in the market for what it actually runs today, name the AWS program that funds the first project on each one, and hand it over with the paperwork already forged.

Keep the `<title>` / H1 ("before Partner Central can see it" is true and defensible once the body no longer claims zero discovery).

**og:description + twitter:description (lines 20, 28)** — the richer truthful mirror:
> The work that decides who wins happens before an account is ever an opportunity. AWS works the deals already in your funnel. Forj reads every company in the Nordics for what it runs today, names the AWS program that funds the first project, and hands you the ones that were never there. Your reps work it, or our desk does.

**meta description (line 8)** — the SEO-trimmed, value-first cut (~150 chars, so Google does not truncate the payload):
> Forj reads every Nordic company for the cloud and stack it runs, names the AWS program that funds the first project, and hands your reps a ready account.

**FAQ answer (line 596), minor tightening (optional but recommended):**
> You walk in with the account that was never in AWS's view, because it had never yet become an opportunity.

### 2.2 "RA-ID / the monthly attribution rhythm" (program grid, line 552)
Invented AWS mechanic. Attribution is passive: no submission event, no 7th-of-month, and "RA-ID" is not AWS wording. Retitle and describe the passive truth.

**Replacement tile:**
> **Attribution.** Every launched deal is credited to your partner account in AWS automatically, so the co-sell revenue is on the books and it is yours.

("automatically" affirms the mechanic is passive; no acronym, no cadence, no tier overclaim.)

### 2.3 Smith demo funding answer (line 644) — hard AWS figures asserted as fact
Strips the $25k / ten-percent cap, "MAP lane at any size" (flagged false in memory), and "cash on customer sign-off" (third unverified mechanic). Keeps the true POC-then-migration shape and moves all program specifics to runtime grounding.

**Replacement answer:**
> Solna Strand Health, Stockholm, around 40 people, on AWS and building clinical AI. The ladder is proof of concept funding first, because they are still proving the workload, then a funded migration on the move that follows once they commit. I pull the current program caps into the read when we scope it, so the number in the paperwork is the real one and never a guess. I draft the POC scope and the funding paperwork the way the program wants them. You submit, and the customer hears it from you.

### 2.4 Unverifiable program figures sweep
- **GenAI PoC tile (line 549):** drop "the largest of the four."
  > **Generative AI PoC.** The GenAI door. Where a customer already has the workload, this is the one to open.
- **Activate figure:** anywhere the site cites $100k for Activate, correct to "up to $200,000" (verified on aws.amazon.com/startups/credits) or drop the number.
- **Standing rule for the build:** publish an AWS cap, deadline, or price only if it traces to a primary AWS source. Otherwise keep it directional.

### 2.5 EU residency (the shipped-error risk, decision required, see Section 5)
This one is P0 but has two valid paths. **Do not ship any absolute EU-inference claim until routing is measured.** Path A (fix routing, then the existing copy becomes true) is preferred and preserves the wedge Jacob wants. Path B (rewrite copy now with a named exception) is the fallback. Full per-file copy for Path B is in Phase 4 below; the decision is in Section 5.

---

## 3. THE ENTERPRISE REBUILD (phased, ordered by impact)

### Phase 1 — Make the hero the product doing real work, and ration the accent
*Steals: Attention (product is the hero, concrete before abstract), Inception42 (accent rationing + light display weight).*

**What changes:**
1. **Live read in the fold.** Move the band-3 "Read any company" input up into the hero frame so the first interaction is a real, visitor-triggered read. Critical: **move** the existing form, do not clone it (duplicate `id="rd-q"/"rd-panel"/"rd-form"` on one page double-binds). If auto-animation is chosen instead, it must be a scripted typed-out read of a **fictional** account (the pattern the Smith console chips already use), labelled "Sample read," never a live endpoint call on page load and never a real named company (spend cap + leak risk). Static `shots/01-dashboard-signals.webp` stays as the reduced-motion / no-JS fallback.
2. **Accent rationing.** Count every accented element, then cut until a violet touch is an event. Concretely: set `.beat .bn` and `.faq summary::after` to `var(--ink-dim)`; demote three of four `.stat b` to `var(--ink)` and keep only `#lb-aws` amber; make `.link-a` underline a neutral rule colour that turns `var(--accent)` on `:hover`. Reserve the live accent budget for `.btn-p`, the active rail item, one hero emphasis, and `.sr-score`. **Pick one home for amber:** the program keys (`.prog .pk`) OR the AWS stat, not both, since amber means "AWS" and should mean only that. Keep at most one coloured word in the H1. Demote `.smith-tag` and `.live-lab` to ink. The Smith console interior may keep its product-UI chrome.
3. **One molten bar, not six.** `.plate::before` currently paints a 3px accent-to-ember gradient on all six framed plates (glow, multiplied, against "material over glow"). Move the base declaration onto `.plate-hero::before` only; the other five fall back to their existing `1px var(--rule)` border (do not add a new top edge, it already exists).
4. **Light display weight.** Test the H1 at Space Grotesk **500** (variable font already carries it), keep the tight `-.03em` tracking and the large clamp, let scale and tightness carry hierarchy instead of 700 bold. Reserve 600/700 for the small uppercase brand lockup.
5. **Warm temperature split.** Push the forge/molten family redder so AWS-amber and forge-ember are a clear temperature apart in both themes. `--ember` #D9722E → ~#C0561A; the real offender, dark-override `--ember-text` → ~#E4663A (stays legible on #0C0D10, verify >=4.5:1 for the 11px mono). Leave the AWS amber family as the single anchor. Do **not** fold ember into amber (erases the forge lineage and would paint the non-AWS hero word in the AWS colour).
6. **Left-align the lead** in a max-60ch column (centred body past two lines reads as a template), keep eyebrow + H1 centred, let the product plate be where the eye lands.

**Why it moves a partner buyer:** the first thing he sees is the product succeeding on a company he chose, not a JPEG, and the restraint makes the brand read as deliberate rather than assembled from a starter theme.

### Phase 2 — Diagram the thesis and the loop (stop telling)
*Steals: Cloudflare (diagram-as-thesis for a technical buyer, one idea per diagram).*

**What changes:**
1. **The wedge timeline.** The positioning ("we find the funded deal before Partner Central can see it") is currently a prose paragraph. Render it as a redaction-safe timeline: market read → fundable account named → it becomes an opportunity → AWS can now see it. The picture makes the precise claim so the sentence does not have to inflate, and it states the true scope (AWS works what is in the funnel; we hand over what was never there) cleanly and unfalsifiably.
2. **The Smith loop.** Band 2's overnight-read → morning-brief → in-the-room → follow-up cycle is four prose beats and a pull quote. Turn it into a circular or left-to-right loop with the four stops and an arrow back to start, one accent-violet stroke, outcomes only, no vendors or backend. Animate the arrow once on scroll-in, then hold still (stillness law).

**Why it moves a buyer:** a technical buyer trusts a diagram he cannot falsify in one sentence more than a slogan he can argue with, and the loop is the highest-value illustration on the page currently delivered as the most purely "told" section.

### Phase 3 — Surface the trust proof you already own; make Smith openly-AI on the home page
*Steals: EdenAI (one clean single-purpose trust promise), Inception42 (keep the block calm, not badge-heavy), your own /smith/ passport + og:image alt.*

**What changes:**
1. **Trust block on the home page.** The four-rule governance model, EU posture, verifiable identity, and named AWS credential are all reachable only from the footer, where the governance buyer never looks. Add a calm block near the Smith band (reuse `.pills` / label-list, no emoji markers): "A human approves every send · Every run logged · Per-workspace spend cap · Output checked against source," the cert line verbatim ("GDPR-aligned today, ISO 27001 on our roadmap; we do not claim certifications we have not earned"), "Openly an AI with a verifiable identity" linking /smith/, and a "Full security posture and sub-processors" link to /trust.html. Scope the residency line per Law 6 (no bare absolute) — the exact wording depends on the Section 5 decision.
2. **Smith is openly an AI, on the home page.** The "Meet Smith" band reads as a human hire ("a senior partner development manager," "held to the same bar as any senior hire"), which is the opposite of the openly-AI stance. Change the lead first sentence (line 488):
   > Smith is openly an AI, held to the same bar as any senior hire: the meetings and wins on this page.

   Keep "I forge it, you close it."

**Why it moves a buyer:** procurement and governance form their judgement in the homepage flow, and today it carries almost no security signal above the footer. Naming the openly-AI position proudly is the trust differentiator, not a caveat to hide.

### Phase 4 — Residency stated precisely (scope + exception)
*Steals: Cloudflare (named residency scope + named jurisdiction caveat), EdenAI (one clear promise).*

**This is where the Section 5 decision lands.** If Path B (ship copy before routing is fixed), apply exactly this, at every location, and never re-assert blanket EU inference:

- **smith/index.html:240** — delete the Atlantic sentence entirely (most falsifiable line on the site). Replace with:
  > Your pipeline and customer data stay in the EU, hosted in Stockholm (eu-north-1), encrypted at rest and isolated per tenant. Smith's AI model calls may be processed outside the EU under GDPR-appropriate safeguards; they carry the public company being read, never your CRM or pipeline data.
- **Passport card (smith/index.html:187)** — change AI-inference value from "Amazon Bedrock, EU" to "EU-first; model calls may leave the EU (public data only)", or drop the AI-inference row and keep Your data / Isolation / Hosting.
- **Metas (smith/index.html:9, integrations.html:11)** — drop "AI inference on Amazon Bedrock in the EU"; keep "data hosted in Stockholm."
- **index.html:521, :558** — remove the EU-inference assertion; keep the Bedrock provider mention without the location guarantee, or move to "your data stays in Stockholm."
- **integrations.html:219** — "the AI runs in the EU" → "Your data stays in Stockholm."
- **trust.html Hosting (:44)** add one honest line:
  > Some enrichment and research steps that need live web search run on a US-hosted AI service under Standard Contractual Clauses; they see public company information, never your CRM or pipeline records, and results are written back to the EU.
- **trust.html sub-processor table (:57-66)** add a row so "the current list" is current: Sub-processor "AI web-search enrichment provider (Anthropic, via the Anthropic API)" | Purpose "Web-search-backed enrichment and research; not used for the EU-resident company read or quality check" | Region "US (under Standard Contractual Clauses)".
- **dpa.html Annex B (:85)** replace the absolute with:
  > Forj-operated hosting, storage and the AI company read run in the EU (Stockholm, eu-north-1). One category is the exception: web-search-backed enrichment and research runs on a US-hosted AI service under the Standard Contractual Clauses referenced in Section 4; it processes public company information, not customer CRM or pipeline records.
- **how-we-read.html:59** — name the exception without naming a vendor:
  > The read is generated by an AI model running in the EU, and the data behind it is stored on Forj's own infrastructure in the EU, with no fallback outside the EU. Your email is never sent outside the EU. If we do not yet know a company's website, resolving it may use a public web lookup that can run outside the EU, and it sees only the public company name.

Present the US search-tool exception as a **separate public-data step**, never as the reason the EU claim holds.

**Why it moves a buyer:** an enterprise DPA reviewer who finds any undisclosed US sub-processor turns "no hidden export" from a promise into a liability. The named caveat reads as more trustworthy, not less.

### Phase 5 — Demo payoff before effort, and design-system unification
*Steals: Attention (autoplay the demo, concrete before abstract), Sierra (show the annotated output, not a distant UI shot).*

**What changes:**
1. **Free Read auto-sample.** On scroll-into-view, auto-run one labelled sample read (fictional account, "Sample read" tag) into `rd-panel` via the existing `renderTeaser`, then leave the input ready. Keep the email gate only on the full read.
2. **Anatomy of a read.** In the "#alloy" evidence band, add one static annotated `sr-card` (fictional account) with callouts pointing at the cloud tag, stack chips, funded-play line, and target role, so the visitor learns what a read is by looking at one. Keep the three screenshots, let the card lead.
3. **Live numbers paint on first response, not on scroll.** The four hero flagship numbers render blank because they are gated behind a 35%-visibility IntersectionObserver while the smaller split line paints immediately. Point `paint0` at the ungated painter so `lb-co/lb-aws/lb-dm/lb-cos` paint in the same `.then` as `geoLive()`/`paintSplit()`. **Guardrail:** keep the fallback discipline exactly — on RPC null/timeout call `geoSoft()` (label → "Recent totals · Sweden, Norway, Finland") BEFORE painting FB constants, and never put a hardcoded figure under the "Live … updated nightly" label (that is a Law 1 violation).
4. **Design-system unification.** Lift shared tokens and base rules into one included stylesheet so pages cannot drift. Reconcile the three home-vs-pricing divergences: mono eyebrows in `var(--ink-dim)` everywhere, one ground recipe (grid-only in light on both, noise reserved for dark), one lead weight.
5. **Technical drags:**
   - Hero LCP: wrap each hero `<img>` in the `<picture>` pattern the evidence row already uses, add `<source media="(max-width:700px)" srcset="shots/01-dashboard-signals-light-m.webp?v=4">` (+ dark), cutting mobile LCP from ~216KB to ~63KB (variants already on disk, unreferenced).
   - Move the descriptive `alt` onto the shot actually shown in the default light theme (currently only the hidden dark twin carries it): `alt="Alloy's dashboard: the day ranked by Smith, a funded play attached to every account."`
   - Inline the eight `@font-face` rules from `/fonts/fonts.css` into the `<style>` block, delete the `<link>` (last render-blocking request).
   - `.live-sub`: drop the opacity (fails AA at 10px), lean on `ink-dim` at full opacity or bump to 11px.
   - Define one `<symbol id="arc">` and `<use>` it at each of the six separators.

---

## 4. THE STEAL SHEET

| Example | The ONE thing to take to forj.se | The one thing NOT to take |
|---|---|---|
| **Inception42** | Severe accent rationing + a light display weight set large and tight; it is Forj's own palette executed with discipline. | Its state-backed "intelligence the world has been waiting for" register; a two-partner company cannot earn it. |
| **Sierra** | Show the agent doing real work, annotated output over distant UI shots; calm enterprise trust. | Its scale-of-deployment framing Forj cannot yet claim. |
| **Attention** | The product IS the hero: put a real/scripted demo in the fold, concrete before abstract, autoplay the payoff. | Its high-velocity SDR-blast register (against Smith's human-sends, never-scrape stance). |
| **Cloudflare ref arch** | Diagram-as-thesis for a technical buyer; a named residency scope with a named jurisdiction exception. | Its deep infra jargon; the buyer here is a commercial partner lead, not an SRE. |
| **EdenAI EU endpoint** | One clean single-purpose trust surface with one clear residency promise; pull it forward instead of hiding /trust.html. | A bare blanket "all in the EU" with no exception. |
| **Understory / Signaliz / Alta** | The anti-pattern lesson: over-specific program claims a domain expert can falsify lose the technical buyer. Say less, be right. | Their over-promised specifics and inflated metrics. |

---

## 5. WHAT I NEED FROM JACOB

**Decisions only you can make:**
1. **Residency, Path A or Path B.** Path A: I fix inference routing so read/judge/chat genuinely run on Bedrock eu-north-1, measure it, and the existing "runs on Amazon Bedrock in the EU" copy at all nine locations becomes true with no rewrite — this preserves the residency wedge. Path B: ship the scoped copy in Phase 4 now, fix routing later. **Recommendation:** if routing can be fixed within days, do A and ship nothing false in the meantime; if not, ship B today (the blanket claim is the CLAUDE.md-documented shipped error and cannot stay live) and pursue A after. Your call on the timeline.
2. **Novalo naming (index.html:557).** Naming a paying partner and enumerating its AWS competencies on the public marketing page cuts against the redaction law. If it must stay for the IP-title / ownership story, that is defensible; if not, generalize to "built with an AWS Advanced Tier Services Partner." Your intent decides.

**Proof / facts I cannot invent (redaction forbids fabrication):**
3. **The hero proof sentence** "First funded deal closed in week five: a multi-entity deal, from a standing start." (line 423) is hardcoded copy, not RPC-fed. Confirm it maps to a real closed engagement (the Quattro/Alto multi-entity deal appears to be the referent). If it does not map cleanly, it becomes a fabricated outcome (P0) and must change.
4. **AWS credential wording.** "AWS service validations" is not AWS's designation language (AWS uses Service Delivery, Service Ready, Competency). Give me the exact designations as they appear on AWS Partner Finder so the credential survives a check, or approve the neutral "AWS-validated services."
5. **Any real metric or reference** you want surfaced in the new trust block or hero. I will not fabricate a customer quote or a number; if you want one, it has to be a real, attributable record.

**Optional, budget-gated:**
6. **One licensed display face** is the single highest-leverage upgrade toward the Inception42 bar. Space Grotesk 500 gets us most of the way for free; a licensed foundry face is the paid finish. Say if there is budget.

---

Source files to execute against: `C:\Users\jacob\alloy-landing\index.html`, `\smith\index.html`, `\trust.html`, `\dpa.html`, `\how-we-read.html`, `\integrations.html`, `\pricing.html`. Sections 2.1 through 2.4 are do-now and block nothing; the residency decision (5.1) gates Phase 4; everything else is sequenced Phase 1 to 5 by buyer impact.

---

# COMPLETENESS CRITIC

Verified against the actual source files (not the plan's own line references). Findings below are ranked, each is a concrete MISS or a plan-introduced law break, with file:line. I re-scanned the truth risk first, as instructed.

---

# COMPLETENESS CRITIC — what the plan missed

## A. TRUTH (priority) — uncaught over-claims and one plan-introduced falsehood

**A1. The residency exception is under-scoped, and Phase 4 as written would ship a NEW falsehood. This is the single biggest gap.**
The plan frames the US leg as only "a periodic web-search-backed enrichment step ... not used for the EU-resident company read or quality check" (its proposed dpa Annex B, trust sub-processor row, and Smith passport value). But CLAUDE.md's own 2026-07-20 measurement says the live `claude-proxy` routes ~91.7% of **inference** to the US Anthropic API, i.e. the company *reads/judge/chat themselves*, not a domain-enrichment batch. If that is current, then the plan's new sentences ("model calls may leave the EU, public data only", "not used for the EU-resident company read") are themselves false and carry the company being read. Consequence: **Path B does not fix the shipped error, it launders it into legal docs (DPA/trust) where an undisclosed-sub-processor finding is worst.** The routing split MUST be measured before a single Phase-4 string is written. The plan treats Path A ("fix routing") as an optional preference; if the 91.7% figure holds it is the only honest option. The plan never reconciles its "enrichment-only" scope with the CLAUDE.md measurement it is supposed to be correcting.

**A2. Phase 4's residency location list is incomplete. Absolute EU-inference claims the plan never touches:**
- `privacy.html:82` — "The read is generated by an AI model run in the EU region (Amazon Bedrock, AWS EU). Your request does not leave the EU." (privacy.html is absent from the plan's entire execute file list.)
- `privacy.html:92` — "AI reasoning via Amazon Bedrock in the EU."
- `privacy.html:96` — Smith demo: "processed by Amazon Bedrock in the EU to generate a reply."
- `smith/index.html:212` — "my work runs in the EU."
- `how-we-read.html:41` pill "Runs and stays in the EU" and `:58` H2 "It all runs, and stays, in the EU." (Plan fixes only the `:59` body, leaving the pill and the H2 asserting the absolute directly above the fixed paragraph.)
- `trust.html:44` — plan ADDS a US-enrichment line but LEAVES standing "Smith's company reads and quality checks run on Amazon Bedrock in the EU (Stockholm, eu-north-1)." If reads route to US, *that* sentence is the actual falsehood and it survives the plan untouched.
- `dpa.html:91` / `trust.html:62` — the existing AWS sub-processor row asserts "AI inference (Amazon Bedrock)" / region "EU (Stockholm)." The plan adds an Anthropic row for "enrichment" but leaves the AWS row claiming EU inference, so the table still misstates where the primary inference happens.

**A3. Two more live Smith-demo canned answers assert AWS funding mechanics as fact; the plan fixes only the third.**
- `index.html:641` (Mälarhamn) — "a MAP assessment now means part of the move is paid before the renewal locks them in" asserts MAP Assess pays for part of the migration.
- `index.html:642` (champion-move) — "built on AWS with proof of concept funding behind it."
The plan rewrites only `:644` and writes a standing rule (2.4) but never applies it to `:641`/`:642`, which are equally falsifiable in the room. All three canned answers must pass the same trace-to-source bar.

**A4. Program grid `index.html:553` uncaught.** "Partner Central — Read live, so the referrals AWS sends you are surfaced before they expire." Asserts a mechanic (Forj reads your Partner Central live) and leaks method. Plan catches `:549` "largest of the four" but not this tile.

**A5. Plan-introduced risk.** The Attribution replacement (2.2) "credited to your partner account in AWS automatically" still asserts a mechanic. Under the plan's own rule 2.4 it must trace to a primary PRM source, or soften to the outcome: "co-sell revenue lands against your account, with no monthly filing to remember."

## B. REDACTION (Law 2) — the plan under-scoped the biggest breach on the page

**B1.** `index.html:555-558` "Who builds this" is a redaction cluster, not the single Novalo-naming decision the plan flagged (5.2). Beyond the partner name it publishes: the exact tier, the **specific AWS service validations enumerated** (Lambda, DynamoDB, API Gateway, CloudFormation), and the **make-vs-own economics** ("Forj owns Alloy and its data. Novalo brings the AWS-native build"). Even if Jacob keeps the ownership story for the IP-title narrative, enumerating a partner's specific competencies and the internal build split is "how the sausage is made." The plan should treat the whole paragraph, not line 557 alone. (The enumerated validations are also a truth risk — they must match AWS Partner Finder exactly or drop, which ties to the plan's own 5.4 wording concern.)

## C. AN ENTERPRISE BUYER'S UNASKED QUESTION THE PLAN NEVER ANSWERS

**C1. "What is the Desk, and who staffs it?"** The site sells "The Desk" as one of two ways to buy (`index.html:567-590`, comparison table) and the new hero leads with "or our desk does" (`:414`). For a two-person company, the first procurement question about a done-for-you desk is **capacity / continuity / key-person / SLA**. The plan's trust block (Phase 3) lists governance signals but never answers who runs the desk or with what continuity. Memory frames "the desk cap IS the key-person answer" — so this is the load-bearing enterprise question and both site and plan leave it implicit. Add a redaction-safe desk continuity/accountability line; the named owner (Jacob) already exists on `/smith/` and can be pulled forward as the continuity signal without claiming headcount.

## D. DEMO / ILLUSTRATIVE OPPORTUNITY THE PLAN UNDERUSES

**D1. Show the handover artifact, not just the read.** The plan diagrams the wedge and loop and adds an "anatomy of a read" (5.2) — but the read is the *input*. The actual product payoff, and the answer to "what happens after I hand a deal over," is the **drafted co-sell/POC paperwork "shaped for a human to submit"** (asserted only in prose at loop beat 04, `index.html:452`). Attention/Sierra's lesson is to show the agent *finishing the job*. Add a redaction-safe annotated "what lands in your inbox" artifact (the drafted opener + the co-sell draft), which is a stronger enterprise proof than a second dashboard shot.

**D2. `hn-*` hero-proof numbers.** Phase 5.3 fixes the blank-paint bug for the four `lb-*` library numbers but ignores the hero-proof outcomes `hn-mtg` / `hn-prop` / `hn-win` (`index.html:422`), which also default to `&nbsp;` and may share the same gating. If they don't paint, three blank slots sit directly under "Outcomes first. Here are ours." Verify and include them in the same fix, with the same `geoSoft()`-style fallback discipline (never a hardcoded figure under a "Live" label).

---

## Verified-clean (so the plan need not chase these)
- No em/en dashes anywhere in copy across all 10 files (checked U+2014 and U+2013).
- Pricing is legible: `pricing.html` carries real SEK figures, whole-firm-no-seats, the +10%/yr cap, and is linked from nav, footer, and a "See pricing" CTA (`index.html:590`) — so "pricing legibility" is not a gap; the gap is the Desk (C1), not price.
- "Who is behind it" is partially answered: Jacob Ahmid is named with a reachable email on `smith/index.html:162`. The gap is continuity of the *Desk*, not founder identity.

Source files inspected: `C:\Users\jacob\alloy-landing\index.html`, `smith\index.html`, `trust.html`, `dpa.html`, `privacy.html`, `how-we-read.html`, `integrations.html`, `pricing.html`, `cookies.html`, `terms.html`.