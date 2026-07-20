# forj.se → "The GTM platform built for AWS partners" — REMAKE SPEC (2026-07-14)

Workflow-designed (gap audit + design direction + reference scan) + doctrine/trademark-verified + design-critiqued. Full agent output: `tasks/wk8axo83y.output`. Built on staging branch **`aws-remake`** (NOT live `landing`) — Jacob reviews + generates the 2 images, then merges.

## STATUS (2026-07-14)
- **P0 DONE on `aws-remake`** (commits: head meta/JSON-LD + hero copy + chips earlier; **`b4fbb43`** = the two demonstration artifacts). Both non-negotiable BUILT artifacts are in and preview-verified:
  1. Hero right column is now the **AWS co-sell scorecard** (`.hero-scard`, reuses `.shot-app`/`.sr-*`): fictional Nordvind Logistik AB, score 86, MAP migration funding line, ACE opportunity Launched, RA-ID submitted-before-7th, smith.png signature avatar, "Worked example: fictional company, real program math." Uses `.hero-scard` NOT `.shot-app.sr`, so the account-read tab JS still binds to the one showcase card (verified: tabs switch, default AWS).
  2. Cross-cloud co-sell band replaced by **"The AWS machinery"** band (`.mach-grid`, 4 `.cscloud` tiles: co-sell AWS can see / funding on the migration / marketing behind the motion / credit for every launched deal; programs named in subtext ACE/MAP/MDF/RA-ID + `.mach-note`). Pruned dead `.cosell-clouds/.cs-*` CSS, kept `.cscloud`.
  - Verified: 0 console errors, 0 em/en dashes, amber pill = sanctioned #D98A33, 2-col grid collapses to 1-col at 375px with no horizontal scroll.
- **P1/P2/P3 DONE on `aws-remake`** (commit **`3e8bab3`**, preview-verified): stat strip 5→4 (run-on-AWS amber hero stat + `lb-oth` = azure+gcp "more in the any-cloud library", painter mapping proven against the live RPC = 10,409); console SCRIPT all-AWS (MAP window / co-sell shaped to pass validation / funding request); loop node1 MAP-MDF-Marketplace; free-read defaults AWS (`.rd-cloud.on` + `cloud="aws"`); showcase az/gcp tabs+pills neutralized (only AWS keeps the amber spark); FAQ + "Do I need to be an AWS partner already?" (ends "Forj is an independent company, not part of AWS"); ZERO `#FF9900` site-wide (tokens deleted from index.html AND smith/index.html, smith passport cubes muted); integrations clouds section "AWS deepest. Every cloud in the library."; smith meta "AWS partners". Env note: the stat-strip IntersectionObserver gate can't fire in the embedded preview renderer (env quirk, gate code unchanged + live in prod).
- **MERGED + LIVE 2026-07-15:** Jacob chose merge-now; `aws-remake` fast-forwarded into `landing` (`96d5de9`→`3e8bab3`) and pushed → Amplify deploy. Known accepted gap: `og-image.png` is still the tri-cloud card (`?v=4`) so LINK PREVIEWS lag the AWS-first copy until the new card exists (on-page there is no image dependency, the hero is the built HTML scorecard).
- **OG card DONE 2026-07-15** (composed from Jacob's smith-forging art, live as ?v=5).
- **NORTH-STAR AUDIT RUN 1 (2026-07-15, the FORJSE_NORTHSTAR_AUDIT_PROMPT.md protocol): 8 musts + 12 shoulds implemented across 3 deploy units, all live-verified.** Headline catches: the LIVE console handed an AWS reader Azure funding programs (SAMPLE script root-caused + rewritten to the play grammar); legal tier (terms/privacy/dpa) still said "multicloud sales machine for hyperscaler partners"; Teams falsely badged Live; signed passport named the model vendor (reissued, same key); "inference stays in-region"/"No US SaaS in the data path" absolutes softened to the precise claims; tagline budget enforced (1x sitewide); teaser rate-cap soft-flag bug fixed. AUDIT DEBT: ✅ CLEARED same day (2026-07-15, run from the box's fresh IP via SSM): teaser matrix 6/6 (AWS→Expand+co-sell/MAP, Azure+GCP→New workload/AWS POC funding, Independent→Migrate/MAP, nonsense+person-orgnr→honest prepare/refusal); demo probes 3/3 clean (Azure Q, GCP Q, ACE Q: zero rival programs named, AWS lane in every answer); emailed full read runtime-verified end-to-end (request→queued→worker→gate→SENT to jacob@forj.se, attempts=1, err=none). Bonus finding: companies.orgnr is stored DASHED for some rows; exact-match lookups must use replace(orgnr,'-','') (my first test harness hit this, the product's own normOrgnr path handles it). HELD FOR JACOB: pricing signed-card optional wording ("in AWS's own programs", ACE line); D12 brand call (AWS amber #D98A33/#C17A12 vs neutral violet for cloud tags); FB stat-strip constants refresh on deploys (checklist habit).

## Identity (nominative, trademark-safe)
**"The GTM platform built for AWS partners."** Positions the VISITOR as the AWS partner → claims no AWS endorsement, safe while Forj is non-APN. Use verbatim sitewide. Retire the borderline literal "The AWS partner platform" from title/footer.

## THE decisive insight (design critique)
Land the identity by **demonstration, not assertion**. Two BUILT artifacts are non-negotiable, or the site is just a violet AI-mascot page that says "AWS" a lot:
1. **Hero right column = a built AWS co-sell scorecard** (HTML, reuse `.shot-app/.sr-*`): a FICTIONAL ACE opportunity, "Launched" stage, a MAP funding line, an RA-ID "submitted, 7th" row, smith.png avatar as the signature, disclaimer "Worked example: fictional company, real program math." Replaces the tri-cloud hero IMAGE.
2. **A deep "AWS program machinery" band** (replaces the deleted cross-cloud co-sell band 860-881): ACE co-sell + MAP funding math + MDF + RA-ID monthly rhythm as buyer-outcome tiles, program named only in subtext, one labelled fictional mock.

## Hero (exact)
- Eyebrow: `THE GTM PLATFORM BUILT FOR AWS PARTNERS`
- H1: **Smith forges the funded AWS deal. You close.** ("AWS" in `<span class="ember">` quench; "You close." em.hl violet)
- Subhead: "The hard part was never AWS. It is capacity: turning your whole territory into ACE-ready co-sell and funded migrations faster than a team your size can work it. Smith, your AI co-worker, finds the AWS-fit accounts, names the funded play in AWS's own programs, MAP, MDF, Marketplace, and drafts the opener. Forj works the outbound, or your reps do. He reads Azure and Google Cloud too, when you have the pull."
- CTAs: primary "Read an AWS account free" → #read; secondary "See how Smith works →" → #loop
- Under-hero: retire the 3 equal cloud chips → one "Built for AWS partners" pill + muted steel-violet program chips "ACE co-sell · MAP · MDF" (no cloud dots, no AWS orange).

## Guardrails (verified)
- NO AWS logos / smile / "Powered by AWS" / partner-or-tier badges (Forj is non-APN). AWS = NAME (nominative) + program vocabulary + Smith's focus.
- NO AWS orange (#FF9900) as brand/structural. Keep Forj forge-violet (#4B3CA0/#7B6BCB/#9E92D8); ember #D9722E as content accent only; ONE muted amber (#D98A33) allowed on the account-read AWS pill as a content spark.
- Azure/GCP = quiet library ONLY: the meta description + one FAQ line + muted secondary showcase tabs + muted integrations tiles. Never co-headlined, never dropped. Watch cumulative count so it never re-reads tri-cloud-equal.
- Honesty: proof numbers only from the live RPC; **"two hyperscaler partners" → "two partners"** (do NOT assert both tenants are AWS-consulting partners); every new stat from real RPC fields, not constants. Fictional mocks carry the disclaimer + must not look like a live Partner Central integration.
- No em dashes; no vendor/backend/tenant names.

## Meta/OG (exact)
- title: `Built for AWS partners: co-sell and funding | Forj`
- meta desc (the sanctioned Azure/GCP spot): "The GTM platform built for AWS partners. Smith, your AI co-worker, finds the AWS-fit accounts, names the funded play in AWS's own programs (MAP, MDF, Marketplace) and drafts the opener. Forj works the outbound, or your reps do, and you close. Smith reads Azure and Google Cloud too."
- og/twitter title: "Built for AWS partners. Smith forges the funded deal, you close. | Alloy by Forj"
- og/twitter desc: "The platform built for AWS partners. Smith finds the AWS-fit accounts, names the funded play in AWS's own programs, and drafts the opener. Forj works the outbound, or you do."
- og/twitter image alt: "Alloy by Forj: the GTM platform built for AWS partners"
- JSON-LD desc: "The GTM platform built for AWS partners: co-sell and funded migrations, forged by Smith."
- og:image ?v→5 once the new card exists (current renders tri-cloud Smith — must not ship with new copy).

## Smith assets
- KEEP/USE: `smith.png`/avatar (hero scorecard signature, console, brain center); `smith-forging.png` (anvil, ONE glowing piece, no cubes = the AWS-forward illustration) for integrations hero + optional accents.
- RETIRE on the site (do not delete files): smith-hero-cubes/smith-hero/-cut, smith-cosell(-cut), smith-live(-cut), all *-tricloud/*-3cube/bust-cubes-* (three equal cubes = tri-cloud + AWS orange).

## Build order (branch `aws-remake`)
P0: head meta/JSON-LD · hero copy + built AWS co-sell scorecard · new AWS-machinery band (replace 860-881).
P1: live-stat strip (collapse 3 cloud columns → "run on AWS" hero stat + "+N in the any-cloud library") · Meet-Smith H2 + starter chips/SCRIPT to AWS motions · loop node1 AWS-only · free-read AWS default + "Read any AWS account".
P2: proof "two partners" · showcase tab relabel + neutral az/gcp · partner-manager name ACE/Marketplace · FAQ keep AWS-first + add "Do I need to be an AWS partner already?" (nominative) · footer "Built for AWS partners. Every cloud in the library."
P3: palette cleanup (drop --aws/--azure/--gcp tokens, cloud dots, dead cosell CSS) · integrations.html AWS-first · smith/index "hyperscaler partners"→"AWS partners" · verify light/dark/375px + smith-slop + grep no retired-asset refs + no #FF9900 structural.

## JACOB — new images to generate (Gemini; Claude can't)
1. **New OG card** `og-image.png` 1200x630 AWS-forward: "Semi-realistic cartoon blacksmith (Smith: dark hair, short beard, leather apron) at a dark anvil forging ONE glowing deal-ingot, warm molten-amber sparks, near-black bg with a steel-violet (#4B3CA0→#9E92D8) rim glow; NO cloud cubes, NO logos, NO text; leave right third clean for the wordmark." Then overlay "Built for AWS partners" + Alloy-by-Forj mark. (`smith-forging.png` is a stand-in until then.)
2. OPTIONAL cube-free "Smith presents one funded AWS deal" bust for the machinery band → `smith-awsdeal-cut.png`.
3. **NO-GO (never generate):** AWS smile logo, "Powered by AWS"/APN/tier badges, any AWS-Partner-tier lockup, anything AWS-orange-dominant.
