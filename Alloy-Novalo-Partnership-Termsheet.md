# Alloy × Novalo — Partnership Term Sheet (discussion draft)

**Status:** Non-binding discussion draft for the Forj ↔ Novalo conversation. NOT legal
advice. Final terms require counsel on both sides.
**Date:** 2026-06-01
**Parties:** Forj (owner of Alloy) · Novalo Technologies AB (org-nr 559427-6411)

---

## The deal in one line

> Forj owns **Alloy** 100%. Novalo is the **paid build + services partner** that takes Alloy
> from MVP to a Bedrock-native SaaS on AWS — funded largely by AWS — and earns its return
> through **services revenue, AWS co-sell, AWS program standing, and an optional vesting
> minority** in the Alloy entity. "Alloy by Forj — powered by Novalo."

This is structured as an AWS **BOX multi-partner solution**: Forj = the ISV (owns the product
and IP), Novalo = the SI (AWS-native build + the competencies + funding access). Both
genuinely contribute to the build — which is exactly what BOX requires.

---

## 1. Ownership & control (non-negotiable spine)

- **Alloy is spun into its own entity ("Alloy NewCo"), owned by Forj.** Keeps Forj's other
  lines clean and makes any alignment grant surgical.
- Forj owns **100%** of Alloy NewCo at formation. Forj controls product, roadmap, pricing,
  the customer relationship, and **all Alloy IP, source, and data.**
- Novalo receives a licence to use/deploy Alloy **only** as needed to deliver the build and
  co-sell — not to resell or fork it.

## 2. Novalo's role

- Lead the AWS-native rebuild: multi-tenancy at scale, **Amazon Bedrock** for Smith's
  inference (EU region), security/compliance hardening, Well-Architected/FTR readiness.
- Bring AWS partner standing (Advanced Tier, the CloudOps + Automotive competencies) and run
  the AWS funding applications jointly with Forj.

## 3. How Novalo gets paid — the four ways they win

1. **Services fees for the build** — paid largely from AWS **MDF + cash** (BOX milestone
   funding), so the build is substantially AWS-subsidised, not out of Forj's pocket.
2. **AWS AI Competency** — Alloy is the reference workload that helps Novalo land the AI
   Competency, which **re-rates Novalo's entire services business** (more fundable on every
   future deal). This prize has nothing to do with owning Alloy.
3. **Co-sell engine (their biggest prize, costs Forj nothing):** every AWS partner who buys
   Alloy is a warm **Novalo services lead.** Alloy refers → Novalo delivers → that services
   revenue is **Novalo's.** Put in writing.
4. **Optional alignment kicker** — see §5.

## 4. The build & funding ladder (BOX, 2026)

> ⚠️ **DO NOT QUOTE ANY FIGURE IN THIS TABLE TO NOVALO OR AWS.** Flagged 2026-07-20 by the corpus claim
> audit. None of these funding amounts ($140K, $290K, $100K, the milestone figures) is traceable to an
> AWS primary source; per memory `aws-funding-for-forj` the "BOX ladder" is folklore, and this whole
> document is a superseded discussion draft (the in-house Bedrock rebuild 2026-06-19 replaced its premise).
> The **WMP row is specifically wrong**: the "10-15% of post-migration ARR" comes from a 2019 AWS blog
> whose neighbouring clause still names retired partner tiers; the live program page carries **no
> percentage**, the disbursement mechanism has changed, and even in 2019 AWS wrote "*may invest up to*"
> (a ceiling, not "credits ="). If WMP comes up, say only: "WMP funding is a percentage of post-migration
> AWS ARR against a per-migration minimum; the current rate is in the Partner Central Program Funding
> Guide, I'm not quoting a number until we pull yours." Salvage from this doc = the co-sell-referral
> clause (§3.3) only.

| Milestone | What it is | Funding | Prereq |
|---|---|---|---|
| **Entry — Enhanced Standard BOX** | Alloy = packaged repeatable solution | **up to $140K** | Multi-partner; 1 partner Validated+ (Novalo qualifies). **No competency needed** — this is the on-ramp. |
| M1 Feasibility | Solution def + Partner Connection in Partner Central | $20K (cash+credits) | Forj in AWS Partner Network |
| M2 MVP + Joint Business Plan | + FTR + 5 ACE opps | $50K | |
| M3 GTM + LOB MDF | LOB lead-gen (70+ SQLs) | $50K MDF | Reach a Line-of-Business buyer |
| **Graduate — AWS AI Competency BOX** | After competency is earned | **up to $290K** | AWS AI Competency (earned *during* the build) |
| M4 GenAI prod-ready | Bedrock in production | up to $100K | **≥25% of AWS ARR on Bedrock/SageMaker/Q** |
| **Then** | Marketplace listing + **WMP** | credits = 10–15% of post-migration AWS ARR | Solution live |

**Honest sequencing:** you enter at **$140K (Standard)**, *not* $290K. The AI Competency is a
prerequisite you earn along the way — Alloy's first customers become the case-study references.

## 5. Optional alignment kicker (decide this)

If Forj wants Novalo locked in for the long haul beyond the build:

- **10–15% of Alloy NewCo**, **vesting over 3–4 years**, **tied to continued contribution**
  and milestones (e.g. AI Competency landed + first N Marketplace customers live).
- **Earned, not granted.** If Novalo stops contributing, unvested equity stops.
- This sits **on top of** the co-sell deal (§3.3), which already makes Novalo well-paid.

## 6. What Novalo explicitly does NOT get (clarity now prevents a knife fight later)

- No control over Alloy's roadmap, pricing, or a future raise/sale.
- No ownership of Alloy IP, source, or customer data.
- No exclusivity that blocks Forj from other build/cloud partners.
- No flat/upfront equity — any equity is the vesting, milestone-tied kicker only.

## 7. Open items for counsel / next conversation

- Is **Forj registered in the AWS Partner Network** yet? (Gate zero — required for BOX.)
- Exact services-fee schedule vs. the MDF/cash that offsets it.
- Whether to take the §5 kicker at all, and the precise % + vesting + milestones.
- Data/GDPR ownership terms (EU customer data; Bedrock eu-north-1).
- IP assignment language (work-for-hire — build output assigns to Alloy NewCo).

---

### The flywheel this protects
Alloy helps AWS partners find AWS-funded deals → Forj+Novalo build Alloy *with* an AWS-funded
deal → Alloy's first proof point is itself → Novalo earns the AI Competency on Alloy → Alloy
hits Marketplace → every Alloy customer is a Novalo co-sell lead → repeat. Forj owning Alloy
100% keeps that flywheel *yours* while Novalo still rides every turn of it.
