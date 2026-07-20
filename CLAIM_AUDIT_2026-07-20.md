<!-- Generated 2026-07-20 by the forj-claim-audit workflow. COVERAGE: 35 of the 78 documents that
carry AWS program mechanics. The 78-file list was passed as a JSON STRING rather than an array, so
the script fell back to its built-in 35. The 43 not covered include FORJ_MDF_STRATEGY.md,
Forj_MDF_Pitch.md, Forj_Pricing_Strategy.md, Forj_Desk_Math_OnePager.md and
Forj_Founding_Paper_Addenda.md. Re-run with the args as a real array to close that. -->

# AWS PROGRAM FACTS: WHAT JACOB CAN SAY IN AUGUST

**107 claims checked. 70 got a verdict, 37 could not be verified at all.**
**8 must never be said out loud, 46 must be hedged, only 16 survive a partner checking the source.**
**Most dangerous right now: "AWS does no discovery." It is the spine of the pitch, it is false, and every ACE-eligible partner disproves it by opening the Lead invitations tab in Partner Central while you are still talking.**

---

## 1. DO NOT SAY

8 instances, 5 distinct claims. Ordered by how likely each is to surface on an August call.

### 1.1 "AWS does no discovery / their contract begins at 'submit your leads'"
**Files: `AWS_PC_HEAD_TO_HEAD.md`, `Forj_Raise_Narrative.md`**
False. AWS creates lead invitations and pushes them to partners unbidden, enriches them with propensity signals and Marketplace scores, and since 9 July 2026 drafts the outreach via Partner Lead Prospecting. There is a Lead invitations tab with a 5-business-day accept/reject window.

**Say instead:** "AWS does send you leads and referrals. They land in Partner Central as invitations, five business days to accept or reject, and they enrich them now with propensity signals and a contact-ready flag. That is all real and it is good. The gap is where they come from. Every one starts from a customer who already raised a hand somewhere in AWS's funnel. Nobody is working the accounts that have never touched AWS. That is where we start."

If pushed on the 2026 features: "Lead enrichment and Partner Lead Prospecting are real and good. They score and write outreach for leads you already have. They do not go find accounts that are not in that set. Different job, happens earlier."

### 1.2 "Partner Lead Prospecting is free to every ACE partner"
**File: `Forj_Raise_Narrative.md`** (and regenerating: it has reappeared in `NEW_MONEY_THESIS.md`, `PLATFORM_GATE.md`, `AWS_PC_HEAD_TO_HEAD.md`)
AWS published **eligibility**, not price: "available to all ACE-eligible AWS Partners globally." No AWS page states a price in either direction. "Every ACE partner" also overstates "ACE-eligible," which is a gated status.

**Say instead:** "AWS launched Partner Lead Prospecting in July. Their words: available to all ACE-eligible partners globally, through the console or their MCP server. It generates sales plays, call scripts and outreach off the leads AWS shares with you." If asked what it costs: "AWS has not published a price. They published eligibility, not pricing. Worth checking in your own Partner Central."

For the raise narrative, the defensible version needs no price: "AWS now ships lead prospecting inside Partner Central to ACE-eligible partners globally. That is the commoditization risk, and it is why our layer sits before Partner Central."

### 1.3 "RA-ID must be submitted by the 7th of the month"
**File: `ACTIVATION_30D.md`**
No such submission event exists. PRM attribution is passive: implement once (Marketplace metering, `aws-apn-id` resource tagging, or user agent string) and AWS measures from there. "RA-ID" is not AWS terminology at all.

**Say instead:** "Revenue attribution under PRM is passive. You implement it once, then AWS measures consumption. Nothing to submit each month. AWS evaluates on the monthly billing cycle and attributed revenue shows in Partner Central about 45 days after the month closes."

The real operational point, which is worth more than the false deadline was: "The thing that catches people out is the user agent method. If your solution makes no qualifying API call against a resource in a month, that resource earns nothing that month. Worth checking your quiet accounts."

Say "the aws-apn-id tag" or "revenue attribution." Never "RA-ID." If someone cites a 31 July PRM deadline, it is on consultancy blogs and no AWS page: "I have seen that going around but have not confirmed it against AWS."

### 1.4 "Activate Portfolio is up to $100k"
**Files: `Alloy-AWS-Use-Case.md`, `Alloy-Smith-Playbook.md`**
Stale by half. AWS publishes **up to $200,000** on the Portfolio tier. This is the number an AWS-side person is most likely to correct, and the correction is in the partner's favour so it costs nothing to fix.

**Say instead:** "Activate Portfolio is the provider-backed tier. You need an Activate Provider, a VC, accelerator or incubator, and their Org ID, pre-Series B, founded in the last ten years, and the account on a paid support plan. AWS currently publishes up to $200,000. It is a ceiling, not an award. Self-funded goes on the Founders track instead, starts at $1,000, can reach $5,000."

Do not quote a per-stage breakdown of the $200k. AWS publishes none. If anyone cites $100k, an older AWS explainer page still carries it; the credits page governs.

### 1.5 "ISV WMP is 10-15% of post-migration ARR with a $36k ARR minimum"
**Files: `Alloy-AWS-Use-Case.md`, `Alloy-Smith-Playbook.md`, `Alloy-Novalo-Partnership-Termsheet.md`**
Both figures are genuinely AWS-published, in a June 2019 blog whose neighbouring eligibility clause still names the retired Select/Advanced/Premier tiers. The live program page carries no percentage, no ARR threshold, and the disbursement mechanism has since changed. Also: even in 2019 the $36k was **per end-customer migration**, not a partner or account bar. And "10-15%" was "may invest up to," a ceiling, written in the termsheet with an equals sign.

**Say instead:** "WMP funding is a percentage of post-migration AWS ARR with a minimum ARR bar per migration. AWS published 10 to 15 percent and $36,000, but that was 2019 and AWS no longer publishes those numbers. They sit in the Program Funding Guide in Partner Central now. I am not quoting a rate until we pull your current guide."

Safe adjacent fact if you need to show command: "AWS's current program page requires a fully managed SaaS offering on AWS, a completed Foundational Technical Review for the nominated workload, and a qualified migration use case." That is live and checkable. Do not repeat the 15%-under-500K / 25%-over-500K split circulating on partner blogs.

---

## 2. HEDGE OR AVOID

46 claims. The point of this section: **Jacob currently believes these are facts.** They are not marked as uncertain anywhere in the corpus. Most sit in AWS's gated Partner Central guides, which means unsourced, not false. The hedge is what makes them safe.

### Funding mechanics: PoC, MAP, WMP stacking

| # | Claim (file) | Hedged phrasing |
|---|---|---|
| 1 | GenAI PoC "pre-approval email required" (`Alloy-AWS-Use-Case.md`, `Alloy-Smith-Playbook.md`) | Drop the word email. "It has to reach the Pre-Approval stage in Partner Central before you begin. AWS's docs say that stage means all approvals are in." |
| 2 | PoC "deducted from a later WMP/MAP award" (`Alloy-AWS-Use-Case.md`, `Alloy-Smith-Playbook.md`) | Do not raise it. If they do: "How they interact is not something AWS publishes. Your PDM can tell you from the Program Funding Guide, worth asking before you size the PoC." |
| 3 | PoC "cannot be stacked with WMP/MAP" (`Alloy-AWS-Use-Case.md`, `Alloy-Smith-Playbook.md`) | Turn it into a question: "If we run a PoC first, does that affect the WMP request on the same workload, and is the PoC netted off?" Also cut the parenthetical on line 116 of `Alloy-AWS-Use-Case.md`, which states this back to AWS as fact. |
| 4 | "POC precedes MAP and never shares its scope" (`FORJSE_COPY_PROMPT.md`, `NEW_MONEY_THESIS.md`) | "PoC and MAP are separate fund requests with separate approval paths. You would not draw both against the same scope, but check the current rule in Partner Central." Note AWS's own guidance puts PoC work **inside** MAP's Mobilize phase, so "PoC precedes MAP" is wrong as a flat statement. |
| 5 | GenAI PoC "lower of 10% of year-1 spend or SOW cost" (`Alloy-Smith-Playbook.md`, `FORJSE_COPY_PROMPT.md`) | Quote no formula. "AWS does not publish one and the numbers online contradict each other. Your partner manager gives you the figure for your deal." Our version also drops the $25k cap even the folklore agrees on. |
| 6 | "POC cash on customer sign-off, credits upfront" (`FORJSE_COPY_PROMPT.md`) | Wrong trigger. "Credits disburse at pre-approval. Cash you claim after the project or milestone is complete, you submit actuals, AWS approves, then you invoice through Payee Central. The gate is AWS approving your claim, not the customer signing." |
| 7 | "Azure/GCP customer is a POC-funded new-workload play" (`FORJSE_COPY_PROMPT.md`) | "Azure and GCP are named competitor values in Partner Central, so it registers cleanly. I will not tell you being on another cloud is what makes it fundable. Worth putting in front of your partner manager." |
| 8 | MAP "delivered through partners with AWS Migration Competency" (`Alloy-Smith-Playbook.md`) | Two doors, not a gate. "If you hold the AWS Migration **and Modernization** Competency you get MAP funding. But any partner at Validated Stage can access the MAP template too. The question is whether you are at Validated yet." Never say the pre-2024 name. |
| 9 | MAP "tiered on projected ARR" (`FORJSE_COPY_PROMPT.md`) | Say the phases, drop the tiers. "MAP runs Assess, Mobilize, Migrate and Modernize. AWS funds migrations of any size and the investment scales with deal size." One usable figure: "MAP now scales to support migrations up to $10M ARR." |
| 10 | "AWS publishes no thresholds or percentages" (`FORJSE_COPY_PROMPT.md`) | Drop the absolute. The $10M ARR ceiling **is** published. "AWS publishes no MAP funding percentages and no funding tiers. The numbers in circulation come from partners, not AWS." |
| 11 | "MAP pays against milestones and consumption, Lite lanes exist" (`SMITH_ENABLEMENT.md`) | Cut the Lite parenthetical entirely. Two mechanisms, not one: "Customer MAP credits accrue off tagged consumption, calculated at quarter end. Your partner cash is a separate fund request claimed against milestones. Nobody gets paid on signature." |
| 12 | "AWS funds net-new consumption, MAP/SPI, $543B, 90%+ workloads" (`BACKLOG.md`) | SPI lanes are Greenfield, **VMware**, Modernization. Migration is MAP itself. $543B is IDC market size, not AWS money: "IDC has cloud spend at $1.3T by 2027, AWS frames that as a $543B incremental opportunity for the ecosystem." Drop the 90%; AWS's Dec 2025 post says 42% of strategic workloads remain on-prem, and points at the Partner Greenfield Program. |

### BOX and the Novalo termsheet

| # | Claim (file) | Hedged phrasing |
|---|---|---|
| 13 | "Enhanced Standard BOX, up to $140K" (`Alloy-Novalo-Partnership-Termsheet.md`) | AWS publishes no BOX tier names and no BOX dollar figures. Do not say "Enhanced Standard" on a call; a PDM will not recognise it. "BOX pays cash and credits against milestones. The amounts are in the BOX Funding Benefit Guide in Partner Central and I would rather pull the current numbers with you." |
| 14 | "AWS AI Competency BOX, up to $290K" (`Alloy-Novalo-Partnership-Termsheet.md`) | Same. The $290K is our own arithmetic sum of the milestone rows. If pressed: "I have seen a figure around $290K but I cannot source it to AWS, so I am not standing behind it." |
| 15 | "No competency needed, this is the on-ramp" (`Alloy-Novalo-Partnership-Termsheet.md`) | Substance holds, but state the real bar: "BOX does not gate on a competency. What AWS publishes is Validated or Differentiated status, ACE eligibility or a partner who has it, and a Partner Connection." |
| 16 | "You enter at $140K (Standard), not $290K" (`Alloy-Novalo-Partnership-Termsheet.md`) | Strike the line. Only public BOX numbers are ~$70K milestone cash and credits (non-Amazon source) and up to $50K industry MDF (AWS APN blog, usable). |
| 17 | "WMP credits = 10-15% of post-migration ARR" as a **term** (`Alloy-Novalo-Partnership-Termsheet.md`) | Fix before it reaches a counterparty. "Credits =" reads as something Forj is promising. AWS's word is "may invest up to," cash **or** credits, rate set by projected ARR and complexity. |

**The whole funding ladder in section 4 of the termsheet is unsourced:** $140K, $20K, $50K, $50K, $100K, $290K, $345K, and the ">=25% of AWS ARR on Bedrock/SageMaker/Q" gate. Novalo's own AWS contacts will check them.

### MDF, Payee Central, fund-request plumbing

| # | Claim (file) | Hedged phrasing |
|---|---|---|
| 18 | "MDF, pay-first, claim within 30 days" (`Alloy-AWS-Use-Case.md`) | Add the backstop, drop "pay-first." "Within 30 days of activity completion **or by December 15** of that calendar year, whichever comes first. If you run something in late November, December 15 is the wall." |
| 19 | "30 days with itemized receipts" (`Alloy-Smith-Playbook.md`, `FORJSE_COPY_PROMPT.md`) | "Itemized receipts" appears nowhere in the live Partner Central docs (it is in a 2023 Marketplace ISV guide only). "You submit actuals for the claim, AWS approves them, then you invoice in Payee Central. On exact backup, check the MDF program guide in Partner Central." Also say "offsets," not "reimburses." |
| 20 | "All funding runs through APFP and requires Payee Central" (`Alloy-Smith-Playbook.md`) | Three errors. Credits never touch Payee Central (they are codes). Payee Central is named for MDF and POA specifically. Training credits and Business Value Realization funding do not use fund requests at all. Drop "all," drop "single sign-on," drop the acronym APFP. |
| 21 | "Register the ACE opportunity, then raise a fund request" (`Alloy-Smith-Playbook.md`) | Not a required sequence. "For deal-linked programs like MAP and POC you want the opportunity linked. For MDF, training credits or Innovation Sandbox there is no opportunity at all. The hard prerequisites are IAM permissions and a Payee Central account before cash moves." |
| 22 | "Eligibility = Partner Path/Stage + MDF wallet" (`BACKLOG.md`) | AWS says **or**, not and, says "Partner Path status" not Stage, and it is a per-program troubleshooting note about one greyed-out button. |
| 23 | ACE submission payload (`BACKLOG.md`) | Co-Sell with AWS is **optional**, it is the switch that makes named partner needs mandatory. And the list omits the one that blocks partners in practice: you must associate at least one solution or Marketplace product, in Limited or Public status, to create an opportunity at all. |

### Programs, tiers, status

| # | Claim (file) | Hedged phrasing |
|---|---|---|
| 24 | "ACE requires opportunities be prospected by your firm" (`AI_NATIVE_SERVICES_READ.md`, 3 occurrences, load-bearing) | No AWS page says this. It comes from a 2022 deck hosted on consultancy sites. "ACE opportunities go in as partner referrals, AWS asks you to submit after discovery at Qualified or higher, and they validate on deal size, solution alignment and customer engagement status." Describe our mechanic instead: "The rep registers in your own Partner Central seat, under your name." |
| 25 | "FTR pre-clears the Marketplace/ISVA chain" (`AWS_IAM_CLEANUP.md`) | Backwards on Marketplace. "You list on Marketplace first; the listing plus PRM enabled are prerequisites to **submit** the FTR. Approved FTR puts you at Validated, and Validated is required for ISV Accelerate." Also: a WAFR must be clean across Security, **Operational Excellence and Reliability**, on the solution's own workload. IAM tidying in Forj's account produces no artifact AWS accepts. Drop the claim from that doc. |
| 26 | "Partner Finder tier Select or Advanced" (`FORJ_ICP.md`) | Drops Premier, and tiers belong to the Services Path, not Partner Finder. "AWS names three services tiers, Select, Advanced and Premier. You must be Select or higher to appear in Partner Finder at all." ISVs are not tiered; ask about FTR instead. This also breaks our own ICP gate, which admits ISVs at line 45 and rejects them at line 47. |
| 27 | "Tiers are Services-path only" (`SMITH_ENABLEMENT.md`) | Training Path has Select and Advanced too. Say "Services, and Training." Premier is Services-only. And tiers are not earned on launched opportunities alone; the certified-headcount requirement is usually what actually blocks a partner. |
| 28 | "Only Launched earns tier credit and most funding" (`SMITH_ENABLEMENT.md`) | The funding half is backwards. "AWS tells you not to submit an opportunity already at Launched, and funding signals only show on earlier stages. Money is decided upstream of Launched. Launched is what pays you back in tier credit." |
| 29 | "Committed is not a signature; only Launched earns" (`SMITH_ENABLEMENT.md`) | AWS's Selling API says Committed = "The customer signed the contract, but AWS hasn't started billing." Say: "Committed means signed but not yet billing. AWS words it two ways, the API says signed contract, the sales guide only says committed on technology and economics. If a signature matters to your forecast, ask what your partner manager counts." |
| 30 | "POD retired 1 Jan 2026 into a single New Customer Incentive" (`SMITH_ENABLEMENT.md`, `PLATFORM_GATE.md`) | AWS said the updates "begin rolling out January 1, 2026" phased through the year, not retired on that date. And it is channel-only: POD was a Solution Provider incentive. Ask whether they resell before raising it. Quote no thresholds or payouts. |
| 31 | "Since 2026-07-01 AWS requires Marketplace listings to reach Committed/Launched" (`PLATFORM_GATE.md`) | It is a **solution-association** gate, and a Partner Solution alone satisfies it. "You need a solution associated, Marketplace solution, Marketplace product, or your own Partner Solution, in Limited or Public status. You do not need a Marketplace listing." The POD-retired and Committed-redefined clauses in that same sentence are not covered by the July 1 source. |
| 32 | "Partner Central 3.0 migration deadline 30 Jun 2026" (`FORJ_ICP.md`, `Forj_Raise_Narrative.md`, and in memory) | AWS uses neither the name nor the date. Both come from co-sell migration vendors. AWS's own FAQ is still routing unmigrated partners through migration today. "AWS moved Partner Central into the console and partners have to migrate to keep access. I have seen a June 30 date going around, it is from the vendors, not AWS. Where are you in that migration?" Say "Partner Central in the AWS Console." |

### The 2026 AWS releases

| # | Claim (file) | Hedged phrasing |
|---|---|---|
| 33 | "2026-07-09 AWS shipped prospecting free, drafting/scoring/enrichment" (`AWS_PC_HEAD_TO_HEAD.md`) | Three fixes: not free, "ACE-eligible" not "every ACE partner," and scoring/enrichment shipped separately in June. July was drafting. |
| 34 | "In 2026-07 AWS shipped free drafting/scoring/enrichment" (`NEW_MONEY_THESIS.md`) | Rollout was March to July: agents 16 Mar, opportunity creation 15 May, enrichment 15 Jun, quality score 16 Jun, prospecting 9 Jul. Say "through 2026" or name the months. |
| 35 | "Readiness verdicts 2026-06-15" in the four-date sequence (`PLATFORM_GATE.md`) | "Readiness verdict" is our word. 15 June was lead enrichment: propensity-to-buy, Marketplace scores, program eligibility. "Readiness" belongs to the 16 June Opportunity Quality Score. Also, sales plays were in the March announcement, not new in July. That doc's line 18 and this claim disagree with each other on 15 vs 16 June; reconcile before either is said aloud. |
| 36 | "Free-for-ACE table stakes including RA-ID/PRM" (`Forj_Raise_Narrative.md`) | Five of six capabilities are real. Drop "free," and pull PRM out: it needs a Marketplace product code and metering or tagging work. It is plumbing the partner implements, not a capability AWS hands over. |
| 37 | "Alto and Novalo are ACE-eligible and can call it free today" (`PLATFORM_GATE.md`) | Not free, and prospecting enriches leads already in Partner Central rather than pointing at arbitrary companies. Confirm ACE eligibility inside each partner's own account before asserting it. |
| 38 | "AWS stated 2026 for AI agents for marketing orchestration and campaign automation" (`PLATFORM_GATE.md`) | Do not put that in quotation marks; AWS never wrote it. AWS wrote "AI-powered agents" and "intelligent campaign orchestration," scoped to Partner Central including Marketing Central, as a looking-ahead statement with no date. Nothing marketing-specific has shipped. |

### Activate

| # | Claim (file) | Hedged phrasing |
|---|---|---|
| 39-40 | "Activate Founders $1k" (`Alloy-AWS-Use-Case.md`, `Alloy-Smith-Playbook.md`) | $1,000 is the entry, not the package. "You start at $1,000 and select participants qualify for up to $5,000. Pre-Series B, founded in the last ten years, paid support plan." The $1k-only version is the 2020 program. |

### Remaining hedges, same treatment

41. "GenAI PoC pre-approval, work started pre-approval is unclaimable" (`Alloy-Smith-Playbook.md`): the sequencing rule is real and contractual (APN T&C 2.1(b)), but it is a general funding rule, not GenAI-specific, and the artifact is a portal stage, not an email.
42. "GenAI PoC cannot be combined with MAP/WMP, they are sequential" (`Alloy-Smith-Playbook.md`): drop "they are sequential." Counter-fact you *can* use: AWS's 2026 partner blog says MAP now covers generative AI and agentic features built as part of modernizing existing workloads.
43. "PoC amount deducted from later MAP/WMP" (`Alloy-Smith-Playbook.md`): if already said to someone, walk it back: "I checked that after we spoke and I cannot source it to AWS."
44. "MDF claims third-party receipts inside 30 days" (`FORJSE_COPY_PROMPT.md`): as #19.
45. "MAP three phases tiered on ARR" (`FORJSE_COPY_PROMPT.md`): as #9.
46. "AWS retired POD, redefined Committed" (`PLATFORM_GATE.md`): hold both until separately sourced. They are currently riding on a date that only covers the solution-association rule.

---

## 3. SAFE TO SAY

The two anchors, both primary-sourced, use them freely:

- **MDF claims: within 30 days after activity completion or by December 15 of the calendar year of the request.** `docs.aws.amazon.com/partner-central/latest/getting-started/extend-fund-request.html`
- **AWS-referred engagement invitations expire in 5 business days if not accepted or rejected.** `docs.aws.amazon.com/partner-central/latest/sales-guide/accepting-opportunities.html`

The 16 verified:

| Say | Source to cite |
|---|---|
| Lead enrichment gives propensity signals, Marketplace scores, program/funding eligibility; Partner Lead Prospecting drafts plays, scripts and email; both to ACE-eligible partners (say available, never free) | `aws.amazon.com/about-aws/whats-new/2026/06/lead-enrichment-and-prospecting/` |
| Partner Lead Prospecting shipped 9 July 2026 | `aws.amazon.com/about-aws/whats-new/2026/07/aws-partner-central-prospecting/` |
| Conversational opportunity creation shipped 15 May 2026; fund-request drafting was in the 16 March agents launch (two dates, keep them separate) | `aws.amazon.com/about-aws/whats-new/2026/05/aws-partner-central-agents-oppo/` |
| Activate credits are redeemable on third-party Bedrock models including Anthropic's (say Anthropic, not Claude; Activate-specific carve-out, not general AWS credits) | `aws.amazon.com/activate/terms/` §1.2 |
| ISV Accelerate: GA Marketplace listing, ACE eligibility, Validated/Differentiated **plus** Payee Central, 15 qualified and 5 launched ACE opps in 12 months, Co-Selling module, $2,000 recognized revenue | `aws.amazon.com/partners/programs/isv-accelerate/` |
| Funding requires approval before the project start date; in Partner Central that is the Pre-Approval stage | `aws.amazon.com/partners/terms-and-conditions/` §2.1(b) |
| ACE validation runs Submitted → In review → Approved, up to 5 business days per pass, Action Required restarts it (different 5 days from the invitation window) | `docs.aws.amazon.com/partner-central/latest/crm/crm-integration-business-flows.html` |
| MAP 2.0 phases: Assess, Mobilize, Migrate & Modernize | `aws.amazon.com/migration-acceleration-program/` |
| MAP scales to support migrations up to $10M ARR | `aws.amazon.com/about-aws/whats-new/2024/07/streamlined-map-funding-approval-aws-partner-central/` |
| FTR is free, valid three years, earns the Qualified Software badge, unlocks Competency and ISV Accelerate. Say **Foundational** Technical Review. Never "First-Time Revenue." | `aws.amazon.com/partners/foundational-technical-review/` |
| A lead or prospect must be matured to Qualified before submission (AWS now also encourages submitting early and letting the agent help qualify) | `docs.aws.amazon.com/partner-central/latest/APIReference/API_LifeCycle.html` |
| You cannot submit a Prospect; the gate is on submission, not on holding the record | same |
| Software and hardware partners earn badges, not tiers (say "Services, and Training" for where tiers apply) | `aws.amazon.com/partners/foundational-technical-review/` |
| Marketplace professional services **private offer** listing fee cut 2.5% to 0.5%, 16 June 2026, automatic on existing listings, not retroactive to live subscriptions | `aws.amazon.com/about-aws/whats-new/2026/06/reduce-listing-fee-professional-services-aws-marketplace/` |
| Partner Central API and agents MCP server are us-east-1 only (a partner anywhere can use it; the call still goes to N. Virginia) | `docs.aws.amazon.com/partner-central/latest/APIReference/mcp-configuration-reference.html` |
| MCP sessions expire 48 hours from creation, absolute not idle; all writes are human-approved; credentials never in tool parameters | same |

---

## 4. NOT VERIFIED

37 claims got no verdict. They are not cleared and they are not condemned. Treat every one as hedge-or-avoid until checked.

1. FTR is a free self-service review. `SMITH_ENABLEMENT.md`
2. FTR is valid for three years. `SMITH_ENABLEMENT.md`
3. Passing FTR gates funding, Competency, and ISV Accelerate. `SMITH_ENABLEMENT.md`
4. APN/tier annual fee is $2,500 per year. `SMITH_ENABLEMENT.md`
5. MDF is often gated behind a Competency or Service Ready requirement. `SMITH_ENABLEMENT.md`
6. No ACE plus no PRM makes a deal invisible to the AWS incentive engine. `SMITH_ENABLEMENT.md`
7. New Customer Incentive spans Solution Provider and Distribution. `SMITH_ENABLEMENT.md`
8. MAP has Lite lanes for non-enterprise customers. `SMITH_ENABLEMENT.md`
9. FTR can be waived by SOC 2 Type II or a Well-Architected Review. `SMITH_ENABLEMENT.md`
10. ACE eligibility requires 15 validated opportunities. `SMITH_ENABLEMENT.md`
11. WAFR prioritizes MFA enforcement for human console users as its top security concern. `AWS_IAM_CLEANUP.md`
12. PC registration steps 1-4 required for all partner types, 5-6 by business model. `AWS_PC_HEAD_TO_HEAD.md`
13. Partner Central console migration deadline was 2026-06-30. `AWS_PC_HEAD_TO_HEAD.md`
14. Activate credits redeemable on Bedrock third-party models including Claude. `Alloy-AWS-Use-Case.md`
15. All AWS funding flows through Partner Central + APFP and requires Payee Central. `Alloy-AWS-Use-Case.md`
16. ISV WMP provides ~10-15% of post-migration AWS ARR. `Alloy-AWS-Use-Case.md`
17. GenAI PoC is typically the lower of 10% of year-1 spend or SOW cost. `Alloy-AWS-Use-Case.md`
18. M1 Feasibility milestone provides $20K cash and credits. `Alloy-Novalo-Partnership-Termsheet.md`
19. M2 MVP + Joint Business Plan provides $50K. `Alloy-Novalo-Partnership-Termsheet.md`
20. M3 GTM + LOB MDF provides $50K MDF. `Alloy-Novalo-Partnership-Termsheet.md`
21. M4 GenAI prod-ready requires ≥25% of AWS ARR on Bedrock/SageMaker/Q. `Alloy-Novalo-Partnership-Termsheet.md`
22. BOX milestone funding comprises MDF and cash components. `Alloy-Novalo-Partnership-Termsheet.md`
23. MAP credits are tied to real consumption via the map-migrated tag. `BACKLOG.md`
24. RA-ID submission must occur before or by the 7th of the month. `FORJSE_AWS_REMAKE_SPEC.md` **(this is the known-false claim, still live in this file)**
25. RA-ID allocations are reviewed monthly. `FORJSE_COPY_PROMPT.md`
26. AWS shipped drafting/scoring/enrichment free to partners from July 2026. `FORJ_TWO_DOORS_PROMPT.md`
27. Lead enrichment with propensity and eligibility shipped 2026-06-15. `Forj_Raise_Narrative.md`
28. Marketplace ProServ fee cut 2.5% to 0.5% on 2026-06-16. `Forj_Raise_Narrative.md`
29. AWS does not perform discovery to source net-new account leads. `NEW_MONEY_THESIS.md` **(same claim as DO NOT SAY 1.1, in a third file)**
30. AWS publishes no tier thresholds for MAP funding. `NEW_MONEY_THESIS.md`
31. MAP is sized to projected annual spend across three phases. `NEW_MONEY_THESIS.md`
32. AWS withholds contact name, email and phone from engagement invitations to prevent lead farming. `PLATFORM_GATE.md`
33. AWS MAP funding is offered in multiple tiers or levels. `SMITH_CAPABILITY_MAP.md`
34. AWS provides PoC funding through a ladder of progressive levels. `SMITH_CAPABILITY_MAP.md`
35. AWS MAP provides an Assess kit. `SMITH_CAPABILITY_MAP.md`
36. AWS Partner Central does not provide discovery capabilities. `FORJ_TWO_DOORS_PROMPT.md` **(same claim, fourth file)**
37. Partner Central displays no account information until accounts are already opportunities. `FORJ_TWO_DOORS_PROMPT.md`

Items 24, 29, 36 are restatements of already-falsified claims sitting in files this audit did not clear. They should be treated as DO NOT SAY on the strength of the verified copies elsewhere.

---

## 5. FIX THE CORPUS, NOT JUST THIS CALL

Ranked by concentration of bad claims:

**`Alloy-Smith-Playbook.md` — worst file. 11 problem claims (2 false, 9 unsourced).** It is the operating manual for funding conversations and almost every funding mechanic in it is either stale AWS or consultancy folklore. Rewrite the entire funding section against the live pages, or gut it down to the four things that verify.

**`Alloy-Novalo-Partnership-Termsheet.md` — most dangerous per claim. 5 hedged plus 5 unverified, zero verified.** Every dollar figure in the section 4 ladder is unsourced, including $140K, $290K, $345K, and the four milestone rows. This is a document a counterparty may rely on, and "credits = 10-15%" reads as a Forj promise. Do not send it until the numbers come from the live BOX Funding Benefit Guide, or are relabelled as Forj's working model.

**`Alloy-AWS-Use-Case.md` — goes to AWS itself.** 2 false, 5 hedged, 2 unverified. Line 116 states an unverified PoC/WMP netting rule back to AWS as settled fact. Cut it or make it a question in section 9. The file already hedges these in its internal block and the hedge got dropped downstream; that pattern is the real defect.

**`SMITH_ENABLEMENT.md` — 5 hedged, 8 unverified, 3 safe.** This is what teaches reps. Wrong facts here propagate to people who will repeat them without the hedge.

**`FORJSE_COPY_PROMPT.md` — 6 hedged, all funding mechanics, feeding public copy.**

**`Forj_Raise_Narrative.md` and `PLATFORM_GATE.md` — the "free" problem.** "Free" has now regenerated into four documents from a single eligibility sentence. Investors and AWS partners both check that one. Add a standing rule: AWS availability language is never price language.

**`FORJ_TWO_DOORS_PROMPT.md`, `NEW_MONEY_THESIS.md`, `AWS_PC_HEAD_TO_HEAD.md`, `FORJ_ICP.md`, `ACTIVATION_30D.md`, `FORJSE_AWS_REMAKE_SPEC.md`** all still carry copies of claims falsified elsewhere. Killing a claim in one file does not kill it. Grep the whole corpus for: `no discovery`, `free to every ACE`, `RA-ID`, `MAP Lite`, `7th of the month`, `Partner Central 3.0`, `$36k`, `$100,000`, `$140K`, `$290K`, `10-15%`.

**Two structural lessons worth writing into CLAUDE.md:**
1. An `aws.amazon.com` URL is not a primary source on its own. Marketplace listings and partner-authored pages live on that domain. So do 2019 blogs whose neighbouring clauses reference retired tier models. Check domain **and** date **and** internal consistency.
2. Eligibility statements are not prices. That single confusion produced four separate false claims in this corpus.