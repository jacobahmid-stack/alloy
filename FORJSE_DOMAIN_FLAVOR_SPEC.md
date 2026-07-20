# forj.se AWS-DOMAIN-EXPERTISE FLAVOR SPEC (FINAL, SHIP-SAFE)

The guide for making every line of forj.se read like an AWS-partner insider wrote it, the way Alta reads like GTM operators wrote it. Source of truth for AWS mechanics is the verified-true list. Every structural moment that carries a mechanic below is stamped as verified against primary AWS sources 2026-07-20.

## 1. THE FLAVOR IN ONE PARAGRAPH

forj.se should feel like it was written by a senior partner development manager who has personally missed a claim window and personally watched an engagement invitation expire, and never wants a partner to feel that again. It speaks in the partner's daily program nouns (co-sell, ACE, MDF, Partner Central, engagement invitation, Launched) and it earns the right to those nouns by attaching the correct mechanic to each one: the real number, the real unit, the real deadline. The insider tell is never a rare word, it is a precise clock. The membership signal is "we know the five business day invitation timer and the December 15 MDF backstop cold"; the exclusion risk is drowning the commercial lead in acronyms with no outcome attached. The line to hold: jargon names the milestone, the sentence right after it names the outcome in plain language. A partner development manager would say "the engagement invitation, accepted before its five-day clock"; they would not say "leverage ACE PRM RA co-sell synergies." Signal membership with the correct mechanic; keep the buyer by always landing on a plain outcome (a fundable account, a claim reimbursed, a deal that counts). If a sentence uses a program term but a commercial lead cannot tell what they get, it fails.

## 2. THE LEXICON (verified-safe terms + the gloss a commercial lead needs)

Use these as section labels and in body copy. The gloss is how you keep the non-engineer buyer; deliver it once, lightly, only where the term changes what the reader does.

| Term (use it) | Plain-language gloss (say once, lightly) |
|---|---|
| **Co-sell** | selling a deal jointly with AWS, so AWS backs it |
| **ACE / ACE pipeline** | the AWS Partner Central program where partner deals are registered and tracked |
| **Partner Central** | AWS's portal where partners register opportunities and manage co-sell |
| **Partner-originated opportunity** | a deal the partner brought to AWS, not one AWS handed the partner |
| **Engagement invitation** | AWS referring a live deal to you; you accept or reject it, on a clock |
| **MDF (Marketing Development Funds)** | AWS money for partner marketing activity, reimbursed after you claim it |
| **MDF claim** | the reimbursement request you file after the activity runs |
| **Revenue attribution (PRM)** | how AWS credits you for revenue you drove; wired once, then passive |
| **Launched** | the ACE stage where a deal is live and counts |
| **Lead Enrichment** | AWS's 2026 capability that layers propensity and program-eligibility signals onto leads you already submitted |
| **Opportunity Quality Score** | AWS's 2026 signal of how co-sell-ready an opportunity is, which shapes how AWS engages on it |
| **Partner Lead Prospecting** | AWS's 2026 capability that drafts personalized sales plays, call scripts, and outreach for leads you already have |
| **AWS Activate** | AWS credits for startups (for Forj itself, not the partner) |
| **FTR** | AWS's Foundational Technical Review; the one attached mechanic that is safe to state is that an approval is valid for three years from the date of approval |
| **Competencies / ISV Accelerate / Marketplace / MAP** | name-only program landmarks; attach no number in copy unless it is on the verified-true list |

Correction applied (was: "Opportunity Quality Score = AWS's 2026 scoring of how strong an opportunity is"). AWS does not score deal strength or win-likelihood. Opportunity Quality Score measures the co-sell readiness of the submission and directly influences how AWS engages on the deal. Verified against primary AWS sources 2026-07-20 (Partner Central sales guide; AWS What's New 2026-06-16; APN "Sell smarter with AWS"). Name is genuine AWS wording, GA date 2026-06-16 confirmed. Never say "free"; it is ACE eligibility, not price.

Correction applied (was: "Partner Lead Prospecting = AWS's 2026 capability that surfaces leads already in your funnel"). Partner Lead Prospecting does not surface, discover, or score leads. It takes a lead you already have and generates personalized sales plays, call scripts, and email outreach. The funnel-scoring idea belongs to a different, separately dated capability, Lead Enrichment (GA 2026-06-15), which layers propensity and program-eligibility signals onto leads the partner already submitted. Verified against primary AWS sources 2026-07-20 (AWS What's New 2026-07-09 prospecting; AWS What's New 2026-06-15 lead enrichment). Neither manufactures net-new leads.

### Terms to AVOID and why

- **"RA-ID"** — not real AWS wording. A partner clocks it instantly as fake. (Currently live at `index.html:552`; must be removed.)
- **"Submit revenue attribution by the 7th" / any monthly RA deadline** — attribution is passive, there is no submission event. (The "monthly attribution rhythm" phrasing on line 552 is this exact error.)
- **"MAP Lite" / "$1-100K MAP lane" / any MAP dollar threshold** — AWS publishes none.
- **"Free to every ACE partner"** — eligibility is not price. Say "available to ACE-eligible partners."
- **"AWS does no discovery" / "Partner Central sees nothing"** as flat claims — false. Survives only in the precise form in section 3.
- **"Opportunity Quality Score rates how strong the deal is"** — wrong. It rates co-sell readiness, not deal strength.
- **"Partner Lead Prospecting finds you new leads" / "surfaces leads"** — wrong. It drafts outreach for leads you already have.
- **Any claim that FTR, Competencies, ISV Accelerate, or Marketplace carry "no mechanic"** — false for FTR and Competencies (both valid three years). Keep them name-only in copy by attaching no number, but do not assert in the spec that they have none.
- **Em dashes** — banned in all copy.

## 3. THE STRUCTURAL MOMENTS (domain mastery shown, not claimed)

### Moment A. The category spine line (fixes the hero)
*Verified against primary AWS sources 2026-07-20.*
**What:** The single repeatable line that owns "the read before Partner Central," true by construction.
**Copy:**
> "AWS scores and enriches the leads already in your funnel. It does not go find the account for you. That first read is the work we do, before the opportunity ever exists."
**Mechanic it rests on:** The one structural survivor. AWS acts on leads already in the funnel: Lead Enrichment layers propensity and program-eligibility signals onto leads you submitted (GA 2026-06-15), Opportunity Quality Score rates their co-sell readiness (GA 2026-06-16). It does not manufacture net-new accounts from a national registry.
**Device borrowed:** Alta's category coinage + compressed spine line ("the read before Partner Central").

### Moment B. The five-business-day clock (insider micro-detail card)
*Verified against primary AWS sources 2026-07-20.*
**What:** A small floating proof card that reads like lived knowledge.
**Copy:**
> "An AWS-referred engagement invitation expires in five business days. Accept or reject, or the opportunity is removed. Forj watches that clock so your rep does not lose the deal to it."
**Mechanic:** Engagement invitations must be accepted or rejected within 5 business days or the opportunity is removed (AWS partner sales guide + ExpirationDate on EngagementInvitationSummary in the Selling API).
**Device borrowed:** Alta's insider micro-detail card + always-on-anchored-to-a-real-timing-truth.

### Moment C. The MDF claim window (proof-through-precision)
*Verified against primary AWS sources 2026-07-20.*
**What:** A precision line that doubles as a section header ("The MDF claim window").
**Copy:**
> "The MDF claim window closes 30 days after the activity completes, or December 15 of the request year, whichever comes first. One extension of 1 to 90 days, never across the new year. Miss it and the money is gone. We track it so you claim inside it."
**Mechanic:** MDF claims due within 30 days after activity completion or by December 15; one extension 1-90 days, cannot fall 12/16-1/1, cannot cross years (docs.aws.amazon.com/partner-central/latest/getting-started/extend-fund-request.html).
**Device borrowed:** Alta's oddly-specific-metric-as-proof + practitioner vocabulary as header.

### Moment D. The passive-attribution flex (the membership handshake, fixes the RA-ID card)
*Verified against primary AWS sources 2026-07-20.*
**What:** The line that replaces the false "RA-ID / monthly rhythm" card and proves Forj knows the machinery.
**Copy:**
> "Revenue attribution runs itself. You wire it once, through Marketplace metering, a resource tag, or a user-agent string, and AWS measures it on the billing cycle. Attributed revenue shows up about 45 days after the month closes. There is no monthly submission and no deadline to miss."
**Mechanic:** PRM revenue attribution is passive; implement once, AWS measures on the monthly billing cycle, attributed revenue appears ~45 days after month close; no submission event, no 7th-of-month deadline.
**Device borrowed:** the peers' "passive-plumbing flex" + the unexplained-insider-handshake.

### Moment E. The funded-deal motion (workflow-shaped section)
*Verified against primary AWS sources 2026-07-20.*
**What:** The page spine, ordered as the partner's real week, each stage a true step.
**Copy (stage labels + one line each):**
> "1. Read the account. What it actually runs today.
> 2. Name the program. The AWS funding that fits the first project.
> 3. Register the opportunity. In ACE, partner-originated.
> 4. Accept the engagement. Inside the five business day clock.
> 5. Drive to Launched. The stage where it counts.
> 6. Claim the MDF. Inside the 30-day window, before December 15."
**Mechanic:** every stage maps to a verified mechanic (5-business-day timer at stage 4, MDF window at stage 6, Launched as a real ACE stage).
**Device borrowed:** Alta's workflow-shaped IA ("the page is shaped like the buyer's real motion").

### Moment F. Pain in the buyer's own voice (outcomes-only testimonials)
*Verified against primary AWS sources 2026-07-20.*
**What:** Three cut-down pain lines, no vendor praise.
**Copy:**
> "We knew the account was fundable. We just could not see which program fit the first project."
> "The engagement invitation expired before anyone accepted it."
> "We left MDF on the table because the claim window closed."
**Mechanic:** each references a true mechanic (program-fit, 5-day timer, 30-day window) without exposing method.
**Device borrowed:** Alta's "name the buyer's pain in the buyer's own voice."

## 3b. HOW SMITH EMBODIES THE EXPERTISE

Smith is one named co-worker in the AWS partner development seat, and the flavor makes him read as a senior PDM who knows the programs cold because he only ever cites true mechanics. His voice line holds: "I forge it, you close it." He amplifies, never replaces. Concretely:

- **Smith names the exact program, not a category.** In a read, Smith says "This account runs [what it runs]. The first project fits [named AWS program]. Register it partner-originated, and the engagement invitation gives you five business days to accept." That specificity, a named program plus its real clock, is what a senior PDM sounds like.
- **Smith speaks the clocks, correctly.** He flags "the MDF claim window closes 30 days after the activity, or December 15," and "attribution is passive, wire it once." He never invents a 7th-of-month deadline or a MAP dollar lane, because a real PDM would not.
- **Smith knows the boundary, precisely.** He can say "AWS will enrich this and score its co-sell readiness once it is in your funnel; my job is the read before it gets there." He does not say AWS will "find" the lead, because AWS does not. Knowing both the 2026 capability and its exact edge is the proof a generalist cannot fake.
- **Smith glosses lightly, once.** To a commercial lead he says "co-sell (selling it jointly with AWS)" the first time and never again. Enough jargon to signal membership, never so much the buyer is locked out.

## 4. THE GUARDRAILS (check every sentence against these)

1. **No mechanic that is not on the verified-true list.** If a number, date, or deadline is not verified, it does not ship. A false mechanic does not dent trust, it disqualifies. This includes getting a real capability's definition wrong: Opportunity Quality Score is co-sell readiness, Partner Lead Prospecting drafts outreach, Lead Enrichment scores the funnel. Do not swap them.
2. **No backend leak.** Outcomes only. Never Forj's vendors, feeders, methods, models, or unit economics on the public page. The flex is the precision of the AWS-side output, never how it is produced.
3. **No off-cloud framing.** Never "move them off their cloud." The funded play always runs ON their cloud, in that cloud's own program.
4. **No em dashes, and every jargon term lands on a plain outcome.** If a sentence names a program but a commercial lead cannot tell what they get, rewrite it until it does.

## 5. BEFORE / AFTER (two real live lines)

### Line 1: The hero lead (`index.html:415`)
*Verified against primary AWS sources 2026-07-20.*
**BEFORE (live, contains the banned flat claim):**
> "AWS does no discovery. Partner Central shows you nothing until an account is already an opportunity, which means the work that decides who wins happens before AWS is watching..."

**AFTER (more expertise, and true):**
> "AWS enriches and scores the leads already in your funnel, and it even drafts the outreach. Its 2026 agents got sharper at all of it: Lead Enrichment and Opportunity Quality Score in June, Partner Lead Prospecting in July. What none of it does is go find the account for you. So the work that decides who wins happens before the opportunity exists: we read every company in the market for what it runs today, name the AWS program that funds the first project, and hand it over with the paperwork forged."

*Why it reads as more expert:* it names the real, dated 2026 capabilities and attaches each to its exact function (enrichment, co-sell readiness scoring, outreach drafting), then names their shared edge, which is the proof a generalist cannot fake, instead of a flat claim a partner knows is false.

### Line 2: The RA-ID program card (`index.html:552`)
*Verified against primary AWS sources 2026-07-20.*
**BEFORE (live, two banned mechanics: "RA-ID" and a monthly rhythm):**
> "RA-ID — The monthly attribution rhythm, so every launched deal counts."

**AFTER (replace label and mechanic with the truth):**
> "Revenue attribution. Wire it once, and AWS measures it on the billing cycle. Attributed revenue lands about 45 days after the month closes. No monthly submission, no deadline to miss, so every Launched deal counts on its own."

*Why it reads as more expert:* it drops the invented "RA-ID" token and the fictional monthly deadline, and replaces them with the passive-plumbing truth a partner recognizes on sight, which is exactly the mechanic an outsider gets wrong and an insider gets right.

---

**Note for the verify phase:** all AWS mechanics above are drawn from the verified-true list and stamped 2026-07-20. Program landmarks named without a mechanic (Competencies, ISV Accelerate, Marketplace, MAP as a name) carry no numbers and stay name-only. FTR is the one landmark with a safe attached mechanic, valid for three years from date of approval; state that or nothing, and never invent a threshold or deadline for any of them.

---

Corrections made to the source spec, inline:
1. Lexicon "Opportunity Quality Score" gloss rewritten from "how strong an opportunity is" to co-sell readiness that shapes AWS engagement.
2. Lexicon "Partner Lead Prospecting" gloss rewritten from "surfaces leads already in your funnel" to drafting sales plays, scripts, and outreach for existing leads. Added a "Lead Enrichment" row to carry the funnel-scoring function correctly.
3. FTR/Competencies/ISV Accelerate/Marketplace row split. The false blanket "no mechanic" claim removed. FTR now carries its verified 3-year validity; the rest stay name-only in copy without the spec asserting they lack a mechanic.
4. Section 2 avoid-list gained three entries: the two miscast capability definitions and the false "no mechanic" claim.
5. Moment A mechanic note corrected to attribute enrichment to Lead Enrichment (2026-06-15) and co-sell-readiness scoring to Opportunity Quality Score (2026-06-16), rather than crediting Partner Lead Prospecting with funnel scoring.
6. Hero AFTER copy (Line 1) rewritten so each 2026 capability is tied to its true function and the imprecise "scores and enriches ... Partner Lead Prospecting" pairing is gone.
7. Section 3b Smith boundary line tightened to "enrich and score co-sell readiness," and to state AWS does not find the lead.
8. Guardrail 1 extended to forbid mis-defining a real capability, not just inventing numbers.
9. "Verified against primary AWS sources 2026-07-20" stamp added to Moments A-F and both before/after lines.

Everything on the verified-true list (5-business-day timer, MDF window and extension rule, passive attribution and ~45-day lag, Activate, Launched, co-sell/ACE/Partner Central definitions, the "AWS does not manufacture net-new accounts" survivor) was kept intact. The RA-ID card fix and passive-attribution copy were already correct and were left as-is.