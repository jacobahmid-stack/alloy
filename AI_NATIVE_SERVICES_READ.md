# THE AI-NATIVE SERVICES READ: what it means for Forj (2026-07-18)

Method flags: **[V]** = verified in a Forj doc I read this session or a cited public source. **[I]** = my inference or arithmetic from those inputs. **[U]** = unverifiable now. No em dashes, by house rule.

---

## 1. THE ONE-PARAGRAPH VERDICT

The article is a good mirror and a bad map. It correctly names things Forj is already doing right and one thing Forj is measuring wrong, but its central move (become the autopilot, sell the outcome past the professional, make senior judgement the engine) does not transfer to the AWS channel and would, if followed, walk Jacob directly away from his north star. **Jacob is not running the wrong primary motion.** forj.se already sells both doors, and the desk motion (Jacob and Qubad on the phones) produced 100% of the only revenue proof that exists (20 meetings, 3 proposals, 1 closed win since 1 June, all human-booked) **[V]**, while partner self-serve produced literally zero calls ever **[V]**. The correct read of the article is not "pivot to services." It is: the tool-first plan with a capped desk as its proof engine is right, but Jacob is quoting the software gross margin (90-95%) against revenue that was produced by two humans on a phone, which is the article's exact definition of Mirage PMF, and he is writing the exit story as SaaS ARR when the proof and the mix are services **[V, pricing doc concedes "the mix will lean services"]**. Keep the motion. Steal four instruments. Do not touch the business model. The one genuinely load-bearing correction is that founder-dependence is unavoidable for the next ~12 months and is actually the right trade, provided the desk stays contractually capped so it stays the proof engine and never becomes the balance sheet.

---

## 2. WHAT THE ARTICLE GETS RIGHT ABOUT FORJ

These are the uncomfortable hits, each with Forj's own evidence.

**Delivery is the company, and Forj already treats it that way.** forj.se leads with "Two ways to run it, your desk or ours," desk first, published weeks before this article **[V]**. The article's "most expensive mistake" (treating delivery as something to figure out after the product) is one Forj did not make.

**The software you built as a vendor is partly the wrong software.** The article says vendor-built software is optimized for sellability, not throughput. Forj found this in its own code: `PLAY_PIVOT` ranked already-on-AWS plays highest, so "The Letter renders whatever ranks first, so the daily brief was optimizing for the inverse of the directive," and ~11,977 rows silently fell to `prepare` because `cloud_ecosystem` was hyperscaler-only **[V]**. Both are throughput defects that survived because nobody ran the tool at volume against the real objective. That is the article's diagnosis, verbatim, in Forj's repo.

**Engineering DNA, not an engineering department.** The article wants the gap between "this is broken" and a fix measured in hours. Forj found and fixed the ranking-inversion bug same day, "Build green, 343 tests pass" **[V]**. This is a genuine strength, not a flatter.

**Hiring (here, founder-hours) to mask product gaps is already happening.** At least three verified instances: the Gatling remap is a manual data write to surface a rep's warmest fuel **[V]**; tenant #3 onboarding is "still a code-edit + redeploy" **[V]**; the hardcoded two-partner AWS-branded prompt inside `icp-brief` is named by Forj's own ICP doc as "the named anti-pattern this rule exists to kill," fix scoped and not done **[V]**. The article's line applies without adjustment: "throwing a person at a broken step feels like progress and quietly becomes your business model."

**The Mirage PMF risk is real and currently unmeasured on the motion that matters.** The software margin is genuine and instrumented to the cent (440 calls cost $2.60, cap code-enforced at $900) **[V]**. But the 20/3/1 was produced by two humans, and **no hours-per-booked-meeting figure exists in any document I read**. Forj therefore cannot run the article's core test ("is gross margin expanding as revenue grows") on the motion that produced all its revenue proof. Quoting the 90-95% software margin while the revenue is desk revenue is precisely the mirage the article warns about.

### The one market test, applied to both motions

*"As models get better, does your service get stronger, or do the models commoditise you?"*

- **Tool sold to AWS partners: FAILS, already, in the strongest possible form.** Not "as models improve" but "the counterparty shipped it free." AWS Partner Central now provides lead enrichment with AWS-generated propensity insights and program/funding eligibility, plus Partner Lead Prospecting, available to all ACE-eligible partners ([AWS, Jun 2026](https://aws.amazon.com/about-aws/whats-new/2026/06/lead-enrichment-and-prospecting/); [AWS, Jul 2026](https://aws.amazon.com/about-aws/whats-new/2026/07/aws-partner-central-prospecting/)), and Forj verified in its own code that exit asset #1 was a proxy over AWS's own `GetAwsOpportunitySummary` **[V]**. The read is commoditised. What survives is the corpus, not the read: a better model does not manufacture 820,926 Swedish registry rows, verified domains, or a detected Azure footprint.
- **Forj's own desk selling the work: PASSES, with a narrowing margin.** Every model gain sharpens the read, score, funding fit, opener and prep note. None of it touches Qubad on the phone or Jacob in the room with a partner-CEO whose stated fear is "their name, the outreach carries their brand into their own market" **[V]**. The qualification: Forj sells judgement about *who to call and what to say*, which is one layer thinner than Eilla's judgement about *whether this deal closes at this price*. Thin judgement is more model-exposed over five years than thick judgement. The durable half is the two human relationships (partner-CEO trust, and the Swedish phone call), not the drafting.

**The test's verdict is the strategy:** the corpus and the desk pass; the read fails. Forj's own July pivot already reached this conclusion. The article validates it and says keep applying the test to every feature.

---

## 3. WHERE THE ANALOGY BREAKS

The AWS channel is structurally different from M&A in four ways that matter, and every one of them cuts against the autopilot.

**1. Forj cannot reach past its professional, because it cannot deliver the outcome.** The article's whole engine is "reach past the professional and sell the outcome, because the outcome is where the real budget has always lived." In M&A the outcome is a transaction Eilla can be paid a success fee on. In this channel the outcome is an AWS migration or POC, worth 300k-1M SEK of services plus 160-260k SEK of program funding per deal **[V, Forj's own anchor map]**, and it is delivered by the partner. Forj has no engineers, no competencies, no FTR, no Marketplace listing, and the Partner Central registration punch-list is unstarted **[V]**. To sell the outcome you must own delivery. Eilla bought one banker; Forj would have to buy an entire AWS delivery practice. **Forj's desk is not the autopilot. It is a demand autopilot bolted onto someone else's delivery.**

**2. The intelligence/judgement split is inverted, and the leverage is already spent.** In M&A, intelligence (buyer universes, materials, diligence) is most of the hours and judgement is the small high-value residue that AI leverage frees up. In an AWS migration, the intelligence (find and qualify the account) is maybe 5-10% of total hours; the other ~90% is engineering labour Forj cannot supply **[I]**. Forj automates a thin upstream slice of a value chain whose money sits downstream. Worse, Forj has *already harvested* its AI leverage: the intelligence half costs six-tenths of a cent per call, and it still took two humans to produce the 20 meetings. What remains in the desk is the judgement half only. The article's own test says "a market where every step needs human judgement cannot scale." Uncapping the desk enters the model at exactly the point where the leverage is gone.

**3. The scarce senior is external and rented from the customer.** Eilla's scarce input is internal ("mandates per senior banker"). Forj's converting senior is the partner's own closer. Forj holds deal flow IN and the super-human junior; it rents the senior judgement from the customer it is selling to. That is a materially weaker position, and it is why the unbounded make-good clause is dangerous (section 4).

**4. The unit economics do not clear a Swedish salary, and ACE rules forbid the ownership the model needs.** At the signed price (100k SEK/mo, 2-3 slots), the desk ceiling is ~3.6M SEK/yr at ~40% gross margin on my hours estimate **[I]**, above the article's "traditional services top out ~30%" but far below the "north of 50%" the AI-native bet requires. A senior banker's judgement monetises at hundreds of thousands per mandate; Jacob's judgement on the phone monetises at ~20,000 SEK per qualified opportunity **[I]**, which is BDR-adjacent pricing. And ACE requires that submitted opportunities be "prospected by your firm"; registering Forj to hold its own opportunities makes it a competitor to Alto and Novalo in the same directory, and detonates the ICP's own promise that "your partner manager should be glad you hired us" **[V]**. The article's central virtue is speed; the path to owning opportunities at all starts with 3-6 months of AWS onboarding, competency and FTR work **[I]**.

**Where the analogy breaks in Forj's favour, and this is the good news:** Eilla had to *buy* domain credibility (a banker, 50+ closed deals) and was at the "you cannot actually deliver the service" step. Forj is past that step. It ran both motions from the start and already delivered: 1 closed deal, a POC plus resell across three org numbers under one decision-maker **[V]**. Forj does not need to discover the economics inversion; it has already conceded it (Desk at ~13-17x the software monthly price) and it is arguing *against* the inversion in the exit narrative on purpose. That is a defensible choice, covered in section 4.

---

## 4. THE NORTH-STAR RESOLUTION

The crux, stated without hedging: the article says the winning model makes senior human judgement the scarce, binding input. Jacob's north star is founder-*independence* and a clean exit so he is present for Gabriel. These genuinely pull opposite ways, and the resolution is not to split the difference. It is to be precise about what "senior judgement" is in Forj's case, and then decide which parts get systematised, which get capped, and which get accepted as a temporary, exit-buying cost.

**What "senior judgement" actually is in Forj.** It sits at exactly two points, with pure automatable intelligence between them:
1. The partner-CEO slot conversation (the sale, Tier 1 [CALL] with the owner on the line) **[V]**.
2. The Swedish prospect call that converts to a booked meeting **[V]**.
Everything else (registry loading, domain resolution, all-cloud detection, `icpScore`, funding-fit, play matching, contact discovery, six signal feeders, every draft, self-verification via `smith-eval`) is intelligence Smith already does **[V]**. The close itself is a third judgement point that Forj does not own at all; the partner owns it.

**Can that judgement be hired, systematised into Smith, or productised? Answer each honestly:**
- **Point 1 (the partner sale) cannot be systematised into Smith and cannot be cheaply hired.** It is trust sold before delivery. The article is right that this is the one thing you cannot fake or hire junior. This is irreducibly senior-human for the foreseeable term. It is also low-volume: at 2-3 slots, it happens 2-3 times, not continuously.
- **Point 2 (the prospect call) is partly systematisable and is the correct target for leverage.** Smith already does 100% of the pre-call intelligence. The residual judgement is real but thin, and it is exactly the thing the Aug 10 activation window tests: can a *non-founder* (the partner's own rep) make that call using Smith's prep. That has never been measured, because attribution was broken until 2026-07-15 and partner self-serve usage was zero **[V]**. **You cannot conclude "partners will not operate it" from a metric that was never measured and a rollout that never happened.** Eilla concluded copilot adoption was hopeless after two years of real selling; Forj is four weeks into an activation plan that has not started.
- **The whole loop is already productised except those two points.** That is the shape the article says must exist for the model to scale: two judgement nodes, pure intelligence between them.

**The honest trade.** Founder-independence is not achieved by removing Jacob from judgement in the next 12 months. It cannot be. The 20/3/1 was produced with Jacob's full attention on it, in the same period partner self-serve produced zero; the leverage may have been *attention*, not AI, and that is testable in August and nobody has scheduled the test. So the honest answer is: **some founder-dependence is unavoidable for roughly the next 12 months, and it is the right trade, because those founder-minutes are what manufacture the only three things an acqui-hire actually prices at this stage: closed-deal proof, a live reference desk, and an appreciating data asset.** 10x on a few hundred thousand SEK of software ARR is still a rounding error; in an acqui-hire the price is on people, proof and proprietary corpus, and the desk is what makes all three.

**The mechanism that keeps this from becoming the trap.** Founder-independence is bought by *capping how many judgement-slots exist*, not by pretending they can be zero. The desk stays contractually capped at 2-3 slots. That cap is not a limitation, it is the deliberate answer to the first question a buyer asks. The pricing doc already has this exactly right and it should be treated as an exit-critical control, not a billing convention: "the revenue is separable: software ARR (founder-independent) versus a capped 2-3 slot services line that converts down into ARR, which is the key-person answer an acqui-hire negotiation opens with" **[V]**. Uncapping the desk deletes that answer. The north star and the article are reconciled by this one sentence: **sell the work, never let the work become the balance sheet.**

---

## 5. RECOMMENDATIONS

### DO NOW (this week, no judgement call required)

**1. Instrument founder-minutes per qualified opportunity, starting the Aug 10 strike window.**
*Reason:* without it the AI-native-services claim is unmeasurable and the Mirage PMF check cannot run on the motion that produced all revenue. It is also the exact denominator an acquirer will ask for.
*First step:* add wall-clock logging (call prep, dial, every Smith correction) to the desk workflow before Aug 10; reconstruct the baseline from the existing engagement and call logs behind the 20/3/1 first (that reconstruction is the single highest-value hour available before any pricing decision).
*30-day signal:* you have a real baseline number and week-4 > week-2 movement in the right direction (down).

**2. Put the right-to-learn clause into every Desk engagement letter, before the Novalo annual paper signs.**
*Reason:* the article's single most transferable instruction. Without it Forj is building Alto's flywheel, not its own. It is currently absent from the pricing doc and the north-star gap list, and the W3 Novalo untangling meeting (IP quitclaim + annual paper, same sitting) is the natural venue **[V]**.
*First step:* draft one clause granting Forj the right to learn from the work product; attach to the annual paper.
*30-day signal:* clause is in the signed Novalo paper and in the Alto template.

**3. Add the AWS origination tripwire as a named watch item.**
*Reason:* the entire company rests on one *inference*, not a verified fact: "AWS cannot ship a first-party feature to source net-new accounts into partner pipelines without becoming the SI it refuses to be" **[V, stated as inference]**. Nothing currently watches for its falsification. The tripwire: *any AWS feature that sources not-yet-a-lead accounts into partner pipelines kills the thesis.*
*First step:* add it to the north-star gap list with a monthly check against AWS "What's New."
*30-day signal:* the watch exists and has been checked once.

**4. Resolve the ICP/pricing contradiction in writing: take the outbound-agency budget line, keep the closer gate.**
*Reason:* the easiest vendor swap is the outsourced SDR/BDR retainer, a real budget line with a real habit (the buyer "has been sold leads before"; Novalo's imported lost/disqualified rows are literally the prior agency's outcomes) **[V]**. But anti-ICP row one rejects "we just want the meetings, our guys are busy" **[V]**. The disqualifier is about the *named closer*, not the source of the money. As written, the two documents pull opposite ways.
*First step:* one paragraph in FORJ_ICP.md stating the money can come from the outbound line as long as a named closer gate is passed.
*30-day signal:* the contradiction is gone and the next desk pitch anchors on the agency line, not the unfilled hire.

### DECIDE (needs Jacob's judgement; options laid out)

**5. Rewrite the exit thesis as corpus-plus-desk, not ARR-plus-NRR.**
*The tension:* the pricing doc argues exit on ARR/NRR/logo count (a SaaS story) sitting on a mix the same doc says "will lean services," on top of a proof that is 100% desk-produced. That is the article's named failure state, "a SaaS company moonlighting as an advisor." But AWS killed exit asset #1, and the public comp for AI-native services is unforgiving.
*Options:*
  - (a) Hold the SaaS story and push software ARR toward parity with the desk by month 12 (the doc's current target). Risk: the proof stays desk-shaped and a corp-dev analyst prices on the services line.
  - (b) Rewrite the one-line pitch as: *a verified 72,257-company Nordic all-cloud origination asset with a closed-deal trail, sitting upstream of the exact layer AWS just made free and AppDirect just consolidated.* That is a tuck-in an AppDirect or Tackle can price; the current story asks them to price a 42,000 SEK/yr subscription business.
*The honest external context:* the only AI-native services company that reached a real price is M&A Research Institute (now TSE:9552), at roughly **2.0x revenue** despite 60%+ CAGR ([verify at earnings](https://www.google.com/finance/quote/9552:TYO)). Private venture rounds price these firms like software (Crosby at ~$400M, Lawhive $60M Series B), but *the market prices them like services the moment a real price is discovered.* Forj's exit is a price-discovery event, not a funding round. **Recommendation: (b).** The corpus and the closed-deal trail cannot be commoditised by a feature release; the ARR can.

**6. Add two outcome fees on top of the block (do not replace the block).**
*Reason:* raises revenue per unit of founder time at ~100% incremental margin, without adding key-person exposure beyond what exists.
*Options:*
  - Keep the 300k block as the floor and MDF vehicle (unchanged).
  - Add an origination success fee: ~10% of year-one services revenue on Forj-sourced closed deals, capped at ~150k SEK per deal, waived if the make-good fires. The cap is what makes it signable by a 10-person owner; the waiver answers the "sold leads before" fear.
  - Add a funding-capture fee: ~15-20% of approved AWS program funding actually secured (~25-50k SEK/deal). This is the easiest yes in the pricing surface, because the partner is net-positive by construction (cash they would not otherwise have received), Forj already runs the funding mechanics hands-on, and it is the only fee AWS's 2026 New Customer Incentive makes structurally larger over time.
*The decision Jacob owns:* whether to introduce fee complexity before the Sep 1 gate or after. **Recommendation: after the gate**, so the activation experiment runs clean, but draft them now.

**7. Bound the make-good clause.**
*Reason:* "if agreed deliverables are not met, the block extends unbilled until they are" **[V]** converts under-delivery directly into uncapped Jacob-and-Qubad time at zero revenue. Forj instruments AI COGS to the cent and desk hours nowhere. This is the single largest measurement gap against the article.
*Options:* cap the extension at one additional block, or convert the remedy to a partial refund. *Recommendation: cap at one block*, and only after recommendation 1 gives you the hours data to price it.

### DO NOT DO

**8. Do not uncap the desk or register Forj to hold its own AWS opportunities.**
*Reason:* it makes Forj a competitor to its two tenants in the same directory, requires an AWS delivery bench Forj cannot build, collides with the ACE "prospected by your firm" rule and Forj's own gate ("the REP registers manually in the partner's OWN Partner Central seat"), and at ~40% margin and a 3.6M SEK ceiling it is a company no one in this class buys. It also converts founder-dependence into founder-permanence and prices the exit as an earn-out, which is the literal opposite of the north star.

**9. Do not move to success-fee-only as the primary model.**
*Reason:* Eilla carries success-fee timing risk on $1.5M of seed cash and smooths it with deal *volume* in an underserved segment. Forj runs a $900 AI cap, no raise, 2-3 slots, and cannot manufacture volume. Observed run rate is 1 close in six weeks across the whole desk **[V]**. Success-fee-only would roughly halve near-term revenue and add a 6-12 month AWS-cycle lag Forj cannot carry.

**10. Do not buy your way in by acquiring a legacy consultancy or a delivery practice.**
*Reason:* the article itself says this almost never works as a way in ("you cannot acquire product-market fit"). Forj does not need AWS *delivery* credibility (the partner delivers) and already bought AWS *selling* credibility cheaply and correctly via the verified enablement canon.

**11. Do not abandon the activation experiment before Sep 8.**
*Reason:* it is the only falsifiable test of founder-independence Forj has ever designed, with numeric exit criteria and a date (Aug `smith_calls_mtd` ≥20/tenant AND week 4 > week 2, read Sep 1) **[V]**. Pivoting now abandons it one measurement short of the answer, and then permanently loses the ability to run it.

---

## 6. THE ONE NUMBER FOR THE WALL

> **FOUNDER-MINUTES PER QUALIFIED OPPORTUNITY DELIVERED.** Measured monthly, per desk slot, wall-clock, including prep, dialling, and every Smith correction.

This is Forj's version of "mandates per senior banker." Inferred baseline today: **~720 minutes** (roughly 1.5 person-days per booked meeting, from the 20/3/1) **[I]**. The falsifiable claim of the whole company is that this number halves twice inside 12 months, to **under 180 minutes**. It is the only number that cannot be gamed by working harder, because working harder is exactly what it measures.

Track its sibling beside it, which is the north star wearing economic clothes:

> **PARTNER TERRITORIES PER SENIOR OPERATOR.** Today: 1 (Jacob effectively runs both tenants). The bet is this reaches 8-10 without a proportional hire. Every product decision can now be scored against whether it moves this number, which is a sharper gate than "does this feel more ownable."

**The monthly Mirage-PMF check (one line, run on the desk motion, not the software motion):**

> Is founder-minutes per qualified opportunity *falling* as desk revenue *rises*?
> If revenue grows while that number sits flat, the AI is decorative and Forj is a two-person agency in an AI costume. Do not accept the 90-95% software margin as the answer to this question. That margin describes a different product; the desk margin is ~40% today and must be shown to be bending, or the AI-native premium is unavailable at any price and Forj should optimise for a clean small sale rather than a multiple.

---

## 7. WHAT WOULD CHANGE MY MIND

I would flip toward a genuine services build (uncap the desk, add a senior, pursue the origination-broker model in B) only if **all** of the following became true, not any one:

1. **The Aug 10-Sep 8 activation window fails outright** with sponsor buy-in secured and enablement shipped: both tenants below the week-4 gates, near-zero self-initiated calls. That is the article's "bureaucracy" finding, honestly earned, and it would mean the tool motion cannot be operated by a non-founder.
2. **A partner pulls for outcome pricing unprompted**, at a number that clears ~3x a senior hire (a desk block near 200k SEK/mo, double the signed card). Willingness to pay at that level would mean the outcome budget is reachable without owning delivery.
3. **Forj can hire senior AWS channel judgement that is not Jacob and not Qubad on loan from a customer**, and the second slot demonstrably does not consume founder hours. (Note the open governance risk: Qubad is not a Forj employee and `alloy-page` sits in Novalo's GitHub org with an unsigned IP assignment **[V]**. Both must be resolved regardless.)
4. **A structure exists to source deals without becoming a partner of record**, verified against the ACE "prospected by your firm" rule in writing, not by assumption. The channel-origination broker shape (originate against the end-market, broker delivery to a bench of partners, take origination + funding-capture fees from the partner side) is the only version of "sell the work" that restores the article's arithmetic without requiring a delivery bench. It is worth *designing on paper* now; it is not worth *building* until 1 through 3 are true.
5. **Founder-minutes per qualified opportunity refuses to bend** across a full quarter despite Smith improvements. That would prove the AI leverage is spent and the desk is pure labour, at which point the services build is at least honest about what it is.

Until 1, 2 and 3 are simultaneously true, the article argues for a company Jacob cannot staff, at a margin that does not clear a Swedish salary, in a channel whose rules forbid the ownership the model requires, priced by acquirers at a fraction of what he is building, and paid out in an earn-out that keeps him from his son for exactly the years he is trying to buy back. The current plan is mostly right. It needs better instruments and a rewritten exit story, not a pivot.

**Sources:** [AWS lead enrichment + prospecting](https://aws.amazon.com/about-aws/whats-new/2026/06/lead-enrichment-and-prospecting/), [AWS Partner Lead Prospecting](https://aws.amazon.com/about-aws/whats-new/2026/07/aws-partner-central-prospecting/), [AWS ACE program](https://aws.amazon.com/partners/programs/ace/), [ACE Opportunity Submission Quick Guide](https://www.alignedtg.com/wp-content/uploads/2025/11/ACE-Opportunity-Submission-Quick-Guide.pdf), [AppDirect acquires Tackle](https://boisedev.com/news/2025/12/01/tackle-appdirect/), [Eilla $1.5M seed](https://www.fuel.ventures/eilla-announce-1-5m-seed-round), [Eilla first AI-native M&A deal](https://tech.eu/2026/04/08/eilla-ai-executes-europes-first-ai-native-ma-deal/), [SaaS valuation multiples](https://aventis-advisors.com/saas-valuation-multiples/), [Outsourced SDR pricing 2026](https://www.whistle.ltd/post/outsourced-sdr-pricing-guide-2026). Forj docs read this session: `FORJ_ICP.md`, `ACTIVATION_30D.md`, `Forj_Pricing_Strategy.md`, `NEW_MONEY_THESIS.md`, `AWS_PC_HEAD_TO_HEAD.md`, `NORTH_STAR_GAPS.md`, `REACHABILITY_PLAN.md`, `alloy-landing/index.html`, `pricing.html`.
