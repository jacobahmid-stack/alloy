# Forj's wedge: new money before Partner Central

The all-cloud acquisition thesis. 2026-07-17. Verified against live code.

## 1. The thesis in one paragraph

AWS and its partners make money when a workload lands and consumes, and the money that makes a play real (MAP, POC, MDF, GenAI POC, PGP/greenfield) attaches to a net-new workload that was not running on AWS yesterday. Partner Central / ACE is the system of record where a partner registers an opportunity they have already sourced; AWS does no discovery there. In 2026-07 AWS shipped first-party, free opportunity drafting/scoring/enrichment inside Partner Central, which commoditized the "help finish an opportunity that already exists" layer. The one thing AWS still does not do, and cannot commoditize because it is upstream of its own funnel, is find the account in the first place. That is Forj's wedge: a pre-Partner-Central account-acquisition engine that reads a prospect's current infrastructure (any cloud, on-prem, colo, generic hosting, or none) and converts it into a funded, cloud-verified, ready-to-register AWS opportunity before it exists in Partner Central. Reading on all clouds is not a nice-to-have; it is the engine of new money. You cannot find migration money (MAP) without detecting the estate that is not yet on AWS. You cannot find rival-cloud POC money without detecting the Azure/GCP incumbency that is the reason to call. You cannot find greenfield PGP money without detecting the account that has no cloud at all. An engine that only recognizes companies already on AWS can only ever surface expansion on accounts the partner already holds, which is precisely the layer AWS just made free. All-cloud read is the input; new money is the output; there is no output without the input.

## 2. How AWS and its partners see it

| Stage | Who owns it | Automated / funded today |
|---|---|---|
| Lead / net-new account sourced | Nobody. AWS does no discovery; the partner prospects by hand. | Neither. This is the gap. |
| Qualified (fit + funded reason) | Partner, by hand | No |
| Partner Central / ACE registration | Partner submits; AWS validates | AWS now offers free first-party drafting/scoring/enrichment (the 2026-07 commoditization) |
| ACE co-sell | Shared partner + AWS | Yes (AWS-owned surface) |
| Launched / consuming | AWS records; funding disburses | Yes (MAP/POC/MDF attach here) |

The funded programs attach at or after registration, to a workload that must first be sourced. AWS owns everything from registration rightward and just automated the registration assist. The partner nominally owns lead and qualify but has no tooling for it, which is why "who sources the net-new account" is the unpaid, unautomated, un-commoditized gap. Acquisition is the durable moat because it is structurally upstream of the surface AWS controls: AWS cannot ship a first-party feature to source accounts into its own partners' pipelines without becoming the SI it refuses to be. Forj sits in that gap and hands the partner a registration-ready, funded, cloud-verified opportunity that AWS's own free tools then finish.

## 3. The play matrix (all-cloud to new money)

The spec the product should encode. Frames are cloud-agnostic and legal (never "move off their cloud").

| Current infra detected | New-money play | Funding lane | Smith's one-line frame |
|---|---|---|---|
| AWS already | Resell / Expand + co-sell | ARR / MDF / co-sell (overlay, not a fresh track) | "Own the bill and expand the estate they already run on AWS." |
| Azure | New workload beside Azure | POC (rival-cloud lane); MAP only if a specific workload migrates | "A new data or AI workload on AWS, beside what runs on Azure today." |
| GCP | New workload beside GCP | POC / MAP | "A new workload on AWS, alongside what they run on Google today." |
| on-prem / none, established estate | Migrate | MAP, sized to projected annual spend across its three phases (Assess, Mobilize, Migrate & Modernize); AWS publishes no tier thresholds, confirm in Partner Central | "A funded migration from your own infrastructure onto AWS." |
| none / other, small + data-immature (no estate) | Greenfield | PGP / Greenfield; POC to open | "A funded first build on AWS." |
| other-hosting (colo / VPS / CDN, established) | Migrate (low-confidence until tier-2 confirms) | MAP Lite | "A funded migration from your current hosting onto AWS." |
| AI-active, any cloud (band >= 4 or ai_native) | GenAI POC | POC (confirm the current cap in Partner Central), regardless of current cloud | "A funded GenAI pilot on AWS. POC first, migrate the rest after." |

Coherence rule: POC precedes MAP and never combines with it on the same scope. For a not-yet-committed account, POC is the sharper opener; MAP sizes the migration that follows.

## 4. Gaps to close (ranked by leverage on the new-money thesis)

[LOGIC] = read/score/play engine. [NARRATIVE] = forj.se / Smith story.

1. [LOGIC] Invert the recommendation pivot. forge.jsx:4398 `PLAY_PIVOT` + :4435 `pivotBonus` ranked already-on-AWS plays highest and new-money plays lowest, and gave every AWS-native account +120 that buried non-AWS accounts inside their own play. The Letter renders whatever ranks first, so the daily brief was optimizing for the inverse of the directive. FIXED 2026-07-17: `{ MAP: 3, POC: 3, GREENFIELD_PGP: 3, MAP_MODERNIZE: 2, RESELL: 1 }`; pivotBonus flipped to `(isAwsNative(c) ? 0 : 90) + techBand(c) * 40`. Build green, 343 tests pass.
2. [LOGIC] On-prem / other ICP under-scoring. scoring.js:66 gives cloudflare/other +5 vs :65 +28 for any hyperscaler, so an established on-prem manufacturer (textbook MAP-Assess) scores cold and is invisible. Fix: tier the non-hyperscaler cohort by "has estate". GOVERNANCE: this shifts companies across the 70/40 bands, guarded by scoring.test.js + smith-read.eval.test.js; change with the evals run, in one commit everywhere (FORJ_ICP.md rule).
3. [LOGIC/DATA] Ecosystem blind spot. smith-read/index.ts:298-299 returns `prepare` (waitlist) for any row whose `cloud_ecosystem` is not a hyperscaler token. The detectors write `cloud_provider='other'` but `cloud_ecosystem` is a different, hyperscaler-only column, so the ~11,977 other/none rows have `cloud_ecosystem = NULL` and silently fall to prepare AND to the +5 score. One backfill (mirror multicloud_slice1.sql:98-101, mapping other/none/on-prem to an 'independent'-class token) plus extending normCloud/ecoOk unblocks the biggest chunk of the pool for both read and score.
4. [NARRATIVE] smith-brief playFor() frames non-AWS accounts in their OWN cloud's program (azure to "Azure Migrate and Modernize", gcp to "Google RAMP"). For an AWS-first partner this pitches Microsoft's program. Fix: AWS-first, new-money framing.
5. [NARRATIVE] forj.se says "AWS account / your territory", narrowing every invitation to accounts the partner already holds. Keep the AWS-first brand; stop labeling the reader AWS-only. Paste-ready lines: "Read any company free," "on any cloud or none," "the accounts you have, and the ones you do not have yet." NEEDS JACOB'S GO (public copy).
6. [NARRATIVE] "Before Partner Central" appears nowhere a buyer looks (only a code comment + tooltip). Add the FAQ item + tighten the close ("Bring your market, not just your pipeline"). NEEDS JACOB'S GO (public copy).
7. [LOGIC] Rival-cloud primary track inconsistent between engines. funding-eligibility:83-86 leads Azure/GCP with MAP ("takeout"); smith-read:307-309 leads the same account with POC ("new workload"). POC-leads is the directive-correct frame. Reconcile so both engines tell one story.
8. [LOGIC] Fundability buries on-prem migrate targets on detection fuzziness, not deal quality (funding-eligibility:59-62,173-180). Let a tier-2-confirmed on-prem verdict carry med confidence.
9. [LOGIC/DATA] Azure under-detected at tier 1 (aws-detect:62-82 loads no azureRanges(); Azure caught only by DNS). Add an Azure ServiceTags matcher so a first-class MAP source stops leaking into `other`.
10. [NARRATIVE] The Letter never names the wedge even with the right play (letter.js:96). Add a deterministic clause when the top rec is MAP/POC/Greenfield on a non-AWS account.
11. [MINOR] Banned AWS orange constant scoring.js:124 `#FF9900`; move to `#D98A33` if it renders.

Fix order: 1 (done) unblocks everything, then 3 (ecosystem backfill) makes the pool visible, then 2 (scoring) makes it rank, then 4/5/6 (narrative), then 7/8/9 (engine coherence + detection), then 10/11 (polish).

## 5. The one sentence

Public-safe (forj.se, redaction-legal, cloud-agnostic):
> Smith reads every company in your market overnight, on any cloud or none, and hands you the ones not yet on AWS with a funded reason to start. The play and the opener ready, before any of it reaches co-sell.

Internal one-liner:
> Forj is the net-new AWS account-acquisition engine that runs BEFORE Partner Central: read any infrastructure, convert every non-AWS account into a funded, cloud-verified, ready-to-register opportunity. Partner Central only registers what we already sourced, and AWS's free assist can only finish what someone else found.
