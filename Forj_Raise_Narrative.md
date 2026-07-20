# Forj raise + acquirer narrative

## ⚠️ 2026-07-16 REPRICE — AWS commoditized the downstream half. Read this first.

On 2026-07-09 AWS shipped **Partner Lead Prospecting** (GA, available to all ACE-eligible partners globally: AI sales plays, call scripts, email outreach), on top of **lead enrichment** (2026-06-15: propensity + program/funding/sales-motion eligibility), delivered via the console and a managed AWS Partner Central MCP server. This is the fifth agentic partner release since March. It takes the downstream half of Smith first-party. Full analysis: [[aws-pc-commoditization-2026-07]] and `AWS_PDM_CROSSWALK.md` sibling read. (Corrected 2026-07-20: AWS published *eligibility* for these capabilities, not a price; do not tell an investor it is "free" without a primary source, none exists.)

**What this kills (say it before an investor says it to you).** "The live Partner Central read" as exit asset #1 is dead: it was a read-only proxy over AWS's own GetAwsOpportunitySummary (verified in `pc-cosell-sync/index.ts`), and AWS now ships that read to everyone free. Drafting, lead scoring, public-web profiles, solution matching, fund-request drafting and the RA-ID/PRM wedge are all now free-for-ACE table stakes. Do not price any of them. WorkSpan (the #2 acquirer) is now on AWS's own blog as a Partner Central agents integrator, so a second-choice acquirer got armed for free.

**The one thing AWS does NOT do: manufacture net-new accounts.** Its tools enrich, score and even prospect (`StartProspectingFromEngagementTask`), but every one of them starts from a lead or engagement already in the partner's funnel; none searches a national registry for a company that has never touched AWS. So Alloy is not a worse copy of AWS's tool. **Alloy is the layer before it: the machine that manufactures the leads AWS's machine only enriches.** (Corrected 2026-07-20: the earlier framing "AWS does no discovery / their contract begins at submit your leads" was false and disprovable in the room; the net-new-vs-existing-funnel distinction is the version that survives.)

**The 3 assets, restated for this world (these replace the old list below):**
1. **The layer before Partner Central.** The Nordic net-new discovery library (51,868 companies) + 5 live signal feeders + champion-watch that originate the leads AWS can only enrich. Quantified by AWS's own per-batch miss rate. "AWS starts at submit-your-leads; Alloy makes the leads."
2. **The EU-resident book AWS never sees**, drawn as a code egress boundary, not "we are EU and they are not" (that dies on an AWS region launch): only opportunity-shaped fields the partner would submit anyway ever cross to us-east-1, and the partner approves each crossing.
3. **Smith graded by AWS's OWN Opportunity Quality Score**, plus the ops layer AWS explicitly refuses to own (their docs: "sessions expire 48h, do not rely on them for long-term storage"): per-tenant memory, action-trace, RLS isolation, spend caps. Stop leading with 328 internal tests a buyer cannot falsify; lead with a score AWS authored.

**Honest limit for the raise room:** none of the three is a wall against Vainu / Explorium / Clay / Labra / WorkSpan. It is a head start. **The outcome proof exists and is real:** from a standing start, Alloy + Smith operated by Forj's own desk produced 17-20 booked meetings, 3 proposals, and a closed deal (POC + resell across three organisation numbers under one decision-maker, locked by Novalo). The desk-led mode is a purchasable product mode, so these are product outcomes, not a demo. What is still outstanding is the self-sufficient PAYING tenant operating it themselves (the day-91 gate) - that is the number that converts a talent-price conversation into a strategic one. Exit thesis rewritten here; the 30-day move is the Alto head-to-head artifact (see `AWS_PC_HEAD_TO_HEAD.md`), then sell only. Against AWS's free tools the contrast line is: their prospecting shipped last week with no outcome record in this market; Smith has a closed-deal trail behind it.

---

## The FDE macro slide (2026-07-03)

Trigger, now a **tri-cloud arms race** (updated 2026-07-03): in ten weeks all three clouds priced the same bottleneck.
- **AWS** (CNBC 2026-06-30): **$1B**, dedicated FDE unit, pods of 5–6 on ~45-day rotations, thousands planned, first customers incl. NBA, NFL, Ricoh, Southwest. Route: **direct** (own bench). Same month AWS cut the Marketplace ProServ listing fee **2.5% → 0.5%** (2026-06-16) — greasing partner-services rails while fielding its own bench.
- **Microsoft** (CNBC 2026-07-02, two days after AWS): **$2.5B + 6,000 people**, "Microsoft Frontier Company", led by Rodrigo Kede Lima (ex-president Microsoft Asia). Route: **hybrid** — direct teams scaled through Accenture, Capgemini, EY "and other major industry players".
- **Google Cloud** (2026-04-22, Cloud Next): **$750M** partner fund for the 120,000-firm ecosystem (credits, co-investment, training, GTM), Google FDEs embedded alongside the global SIs. Route: **ecosystem**.
- Also: frontier model labs launched FDE ventures in May with outside capital (a reported $1.5B vehicle aimed at mid-sized companies). Embedded delivery is now table stakes, ~**$4.25B committed in one summer**.

This lands in the same quarter as the mandatory Partner Central 3.0 migration (30 Jun 2026): **the vendors are reshaping partner plumbing AND delivery motion simultaneously.** That is the timing argument for running the raise + acquirer outreach as ONE motion now.

## The slide (insert as slide 2, before the "3 assets" slide)

**Title: One summer, $4.25B, three clouds priced the same bottleneck**

- AWS **$1B** direct · Microsoft **$2.5B** hybrid · Google **$750M** ecosystem — all three bet that the constraint on cloud/AI revenue is **embedded GTM + delivery capacity** (small teams, heavy AI leverage, outcomes over hours), not platform.
- **Read the delivery rosters**: AWS named its own bench, Microsoft named the global SIs, Google named the ecosystem but embeds with the largest integrators. **The mid-market partner — the other ~120,000 firms — is on nobody's list.** They must originate their own demand or become subcontractors. **Alloy is that layer**: a hyperscaler-ecosystem CRM + an eval-gated AI co-worker (Smith) that reads the market, matches funded programs, and drafts the motion — human closes.
- In **Europe**, the same shift sharpens control and sovereignty questions the vendors cannot answer for their partners. Forj's EU-resident stack is the sovereign version of the model.

Footnote: CNBC 2026-06-30 + 2026-07-02; aboutamazon.com; Google Cloud press corner 2026-04-22; aws.amazon.com whats-new 2026-06-16. Never anti-vendor — Forj is a partner; this is co-sell context.

## The one-liner, per audience

- **AppDirect** (first call): "AWS just spent $1B proving that embedded human+AI capacity wins accounts. You own the billing layer (Tackle) and the affiliate layer (PartnerStack). Alloy is the missing **demand layer** for the partner tier those pods will squeeze."
- **WorkSpan**: "When the vendor fields its own bench, **sourced pipeline becomes the partner's proof of existence**. Alloy manufactures provable sourced pipeline — that makes co-sell platforms more valuable, not less."
- **GTMfund / Creandum / M12**: "Hyperscalers are verticalizing GTM+delivery ($1B FDE unit) while rebuilding partner plumbing (Partner Central 3.0) — in the same quarter. The partner ecosystem must industrialize its own motion *now*. Alloy is the 'Salesforce of tech sales' for that ecosystem, EU-sovereign by construction."

## Objection handling

- **"Isn't the FDE unit just ProServ rebranded?"** Maybe (the credible skeptic take: thin staffing + AI agents, quality risk at scale). Either way it validates outcome-priced, small-team, AI-leveraged delivery — and either way partner anxiety is real, which is demand for Alloy.
- **"Doesn't AWS's move threaten Alloy?"** No. Alloy sells *to partners*, not against AWS. More vendor pressure on partners = more need to originate demand. AWS builds, doesn't buy, GTM tooling (per the acquirer map) — this doesn't change that.
- **"Why not Clay/ZoomInfo?"** They read companies generically and US-first. Alloy reads **cloud ecosystems**: tri-cloud detection, funded-program eligibility, EU/Nordic data moat, and it does the PDM's *work* (read → play → program → draft), not just the list.
- **"Won't a frontier model (or AWS) just do this itself?"** (added 2026-07-06, the Karp read.) The model is a **commodity you rent** — Smith runs on Bedrock, and we would swap the weights the day a cheaper better one ships. The moat is the **grounded layer the model plugs into**: EU-resident registries, tri-cloud detection, funded-program eligibility, the scored ICP judgments, and the human who closes. Karp's own thesis is that value accrues to the app + data + sovereignty layer, not the weights. A raw frontier model has none of Forj's grounding and cannot legally hold a Nordic partner's pipeline in the EU. "Rent the model, own the layer" is a deliberate deck slide.

## The labor-market beat (added 2026-07-03): the market is now pricing the role Alloy splits

The capital beat (slide 2) said the clouds priced embedded delivery. The new beat: **the labor market is pricing, and starting to name, the hybrid human who owns AI outcomes end to end** — and every price point argues for Forj's split.

- **Volume:** FDE job postings on Indeed went 643 → 5,330 in twelve months, +729% YoY (Computerworld, 2026). a16z runs a whole taxonomy piece on the new hybrid titles ("Forward-deployed Job Titles", Jan 2026).
- **Price:** FDE median total comp $385K mid-level, $610K staff at the frontier labs (Perspective AI 2026 survey, directional); Anthropic FDE base $200-300K; "Head of AI" averages $351K (Glassdoor). Distyl's "AI Operator" family (the closest named version of the owner-of-outcomes role): $140-200K base + equity. Tribe AI priced its Strategic Partnerships Lead at $175-225K + equity. Mid-market firms cannot pay any of these numbers per seat.
- **The admission inside the trend:** the loudest evangelists (Bijlani/AMP's "AI Operator" chart, the FDE literature) concede that no single role is strong across all three muscles — business judgment, technical depth, adoption/continuity — and their fix is a rarer, more expensive human who *still rotates off*.
- **Discipline note for diligence:** say "the market is converging on a highly paid hybrid owner-of-outcomes role" (bulletproof: FDE + GTM Engineer + AI Operations Manager + Distyl's AI Operator). Do NOT say "the market calls it the AI Operator" — that title today is one job family plus one consultant's post, and it collides with $23/hr listings and OpenAI's Operator product.

**The slide line:** *"The market's answer to the three-muscle problem is a $400K unicorn who leaves in 18 months. Ours is a $X/month co-worker who holds two of the muscles permanently, so the partner only has to staff the room."* That is the same economics the clouds just endorsed with $4.25B — small human teams, heavy AI leverage, outcomes over hours — sold downmarket at software margins.

**The ops-leverage twin (AWS-published):** ProGlove runs 6,000 tenant AWS accounts and ~1M Lambdas with a **3-person platform team, 2,000 accounts per person** (AWS Architecture Blog, 2026-02-25), because "every new workload adds only marginal operational load while the platform absorbs the exponential scale." Same curve, different layer: Alloy is the platform that absorbs partner-development toil, which is how a Swedish 2-person shop already runs a 10,000-company library, a tri-cloud signals engine and a proof band of real outcomes. Founder-independence is the same property investors read as scalability.

## Where it slots

- **Phase 1 outreach (now):** add the FDE hook to the AppDirect + WorkSpan openers alongside the Partner Central 3.0 wedge.
- **Public track:** Smith's Read #2 is drafted and gate-verified in `Smith_Content_Engine.md` (validation-framed) — publishing it makes the narrative citable before the investor conversations. Read #3 ("The three muscles and the one who stays") is now drafted and gate-verified there too.
- **Deck:** this file's slide 2 (capital beat) → the labor-market beat above (as slide 3 or a voiceover on slide 2) → then the 3 assets (the layer-before-Partner-Central that makes the leads / the EU code-boundary book / Smith graded by AWS's own Opportunity Quality Score) [repriced 2026-07-16, see top of doc] → then the two-person execution proof, now armed with the ProGlove 2,000:1 analogy.
- **Tribe thread:** the comp point doubles as the market-comp line in `Tribe_AI_Application.md` (a hypergrowth AI consultancy priced the seat at $175-225K + equity).

## The positioning spine + sequencing discipline (2026-07-06, Market Fit read)

Distilled from reading the Market Fit / Product Market Fit / AI Opportunities set and
adversarially filtering the generic AI-hype. Four decisions that hold across the deck, the
launch, and the pricing page.

- **The spine line (already live on forj.se/pricing.html):** *"We don't sell you tokens. We sell
  you the next closed deal. And your pipeline never leaves your workspace to train someone else's
  model."* It fuses the three hardest-to-copy assets — outcome pricing + EU residency +
  anti-lab-data-capture — into one sentence, and it lands on the live Karp news cycle. This is
  also the Post #0 spine. Everything else is downstream of it.
- **Sell the goose, not the eggs (SoftBank read):** acquirers and investors default to valuing the
  ~52k enriched SE+NO records — a **depreciating dataset**. The durable asset is the **repeatable
  engine** (read-any-company → detect cloud/stack/size/people → score ICP → find the funded play →
  draft the opener) that extends to any geography or cloud. Price the compounding capability, not
  the row count. This is the same thing `ops/CODE-TIERS.md` protects: the goose is Tier-1
  primitives, and un-promoted per-tenant glue is how the goose quietly turns back into eggs.
- **Competitor framing — public vs private (resolves the "each solves only half" tension):** in
  PUBLIC copy, position only against **generic CRM + the spreadsheet-and-portal status quo** (safe,
  true). NEVER publicly name Tackle / WorkSpan / AppDirect / Partner Central as the incumbents Forj
  beats — they are the acqui-hire targets. The sharp "each solves only half" map lives ONLY in the
  raise deck and 1:1s. (The per-audience one-liners above already do this correctly: they frame
  Alloy as making Tackle/WorkSpan *more* valuable, never as displacing them.)
- **Sequencing (the uncomfortable meta-point):** almost every launch and fundraise move here is
  downstream of **one flagship first-tenant number that does not exist yet** (52k companies loaded
  is inventory, not pull). Honest order: land the first paying self-sufficient tenant → capture one
  aggregate-safe hero number (meetings booked / funded plays Smith forged that a human closed) →
  THEN the deck structure, the content cadence, and the reverse-sell moves have something real to
  stand on. Do not over-invest in deck polish or a content-template factory before that number.
