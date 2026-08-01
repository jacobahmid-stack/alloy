# Rune × AWS Partner Central — the GTM integration strategy

_Research 2026-08-01. Every load-bearing claim below was fetched from an AWS PRIMARY source (the
Partner Central Selling API Reference, the AWS Marketplace Catalog API, the AWS Partner
services-tiers page, and the March/June/July 2026 What's-New + APN posts) and adversarially
re-verified. Where a claim could not be primary-sourced it is marked. This supersedes any older
internal figure it contradicts._

## 0. The one-line verdict

Take the integration **all the way downstream on AWS's own rails** (file → qualify → fund → co-sell
→ ledger), because AWS now ships that half first-party — but the **product stays upstream**: the
lawfully-sourced, **manufactured net-new account** is the one thing AWS cannot produce. The broad
IAM access does not create a new product; it makes delivering the existing one (a held meeting +
an ACE-ready co-sell opportunity) cheaper and deeper inside AWS's system.

## 1. The flywheel is now a state machine with an API at every step

An opportunity carries TWO orthogonal axes (Selling API `LifeCycle`):
- **ReviewStatus** (AWS's ACE gate, read-only for partner referrals): `Pending Submission` (editable)
  → `Submitted` → `In review` → `Action Required` ↔ `Approved` | `Rejected`.
- **Stage** (partner-set sales axis): `Prospect` → `Qualified` → `Technical Validation` →
  `Business Validation` → `Committed` → **`Launched`** (= "workload complete, AWS has started
  billing") | `Closed Lost`.

| Flywheel step | AWS action | Who |
| --- | --- | --- |
| Manufacture → file draft | `CreateOpportunity` (→ Pending Submission, editable) | Rune (auto) |
| Qualify to the bar | `AssociateOpportunity` (1-10 Solutions/Marketplace), `UpdateOpportunity` | Rune (auto) |
| **Submit to AWS** | `SubmitOpportunity` OR `StartEngagementFromOpportunityTask` | **HUMAN GATE** |
| AWS reviews → Approved | (AWS-owned) | AWS |
| Remediate "Action Required" | `UpdateOpportunity` (fixed field subset, read-modify-write) | Rune (auto) |
| Fund | `CreateBenefitApplication` (MAP/PoC), `AssociateBenefitApplicationResource` | Rune drafts / HUMAN submits |
| Launched → attribution | `CreateRevenueAttribution` (RA-ID) | Rune (auto) |

**Load-bearing governance fact:** both `SubmitOpportunity` and `StartEngagementFromOpportunityTask`
are ordinary IAM-callable actions — **no AWS doc requires a human to submit.** "A human submits" is
a FORJ policy, enforced by our code (`pc-write` FORBIDDEN set), not by AWS. Submission is also
**irreversible** (no un-submit/withdraw op). Source:
`API_SubmitOpportunity.html`, `API_StartEngagementFromOpportunityTask.html`, `API_LifeCycle.html`.

`StartEngagementFromOpportunityTask` = the recommended submit path; one async call runs
`GetOpportunity` + `CreateEngagement` + `CreateResourceSnapshot` + `CreateResourceSnapshotJob` +
`CreateEngagementInvitation` + `SubmitOpportunity`. It IS the submit button, so our FORBIDDEN set
correctly blocks BOTH it and `SubmitOpportunity`.

## 2. What AWS commoditized (2026) — and what it did not

**Partner Central agents** (GA 2026-03-16, Bedrock AgentCore, all commercial regions) + the managed
**Partner Central agents MCP Server** (`partnercentral-agents-mcp.us-east-1.api.aws/mcp`, JSON-RPC/
SigV4, tools `sendMessage`/`getSession`) now ship FIRST-PARTY: opportunity creation from a document,
an **Opportunity Quality Score** ("measures co-sell readiness and directly influences how AWS
engages"), deal progression from meeting notes, **funding-recommendation** drafts (MAP/PoC),
onboarding, PRM-compliance, revenue-attribution. **Every write on the MCP rail returns
`requires_approval` and will not execute until the caller replies with a `tool_approval_response`** —
AWS enforces the human-submit gate itself. AWS explicitly sanctions THIRD-PARTY agents on this rail
(cites Labra, WorkSpan). Sources: whats-new 2026/03 + 2026/06, `partner-central-mcp-server.html`,
awsmarketplace blog "fit Partner Central agents into your environment".

**Absent across every AWS primary source: net-new origination / account discovery.** The agents work
ONLY on opportunities the partner already has; the customer-profile tool ENRICHES a named account,
it does not FIND it. → **The durable moat = manufacturing the account.** (Caveat: AWS's separate
"Lead Prospecting", Jul 2026, and `LeadInvitation` engagement invitations DO hand partners SOME
scored/invited leads — so "AWS never gives you the list" is now only half true; the exact line is
"AWS never gives you the *manufactured net-new* account".)

## 3. What the broad grant genuinely unlocks (the new plays)

1. **Two-way co-sell.** `ListEngagementInvitations` (RECEIVER) + `StartEngagementByAcceptingInvitationTask`
   ingest AWS-originated leads/opps (`payloadType = LeadInvitation | OpportunityInvitation`) into the
   partner's book. Reject is DESTRUCTIVE (data becomes inaccessible) → hard human gate.
2. **Qualify with AWS's brain.** `StartProspectingFromEngagementTask` (input: up to 100 engagement
   ids we already hold) returns AWS propensity-to-buy + program eligibility (PGP/Pioneer). Pre-qualify
   against AWS's own funding read.
3. **Marketplace-attached co-sell.** As of 2026-07-01 (whats-new) `AssociateOpportunity` →
   `AwsMarketplaceOffers`/`OfferSets` binds a listing to a co-sell opp; a launched Marketplace-
   private-offer opp counts toward the ISV Accelerate bar. `ResaleAuthorization`/CPPO chain readable
   (Novalo-resells-ISV path). NOTE: the grant is READ+ATTACH; it does NOT create offers.
4. **Delivery ledger from AWS's own model.** `CreateResourceSnapshot`/`ResourceSnapshotJob` =
   immutable, timestamped, provenance-chained copies of the opportunity → funded-desk audit trail
   (tasks #12/#26), sourced from AWS.
5. **Ride the MCP agent rail.** `partnercentral:UseSession` attaches Rune to AWS's managed agent;
   the manufactured dossier is the INPUT to AWS's opportunity-creation + funding tools; our pc-write
   connector becomes a thin wrapper; AWS enforces approval.

## 4. Fact-checks that correct the record

- **Services Path tiers (re-verified, services-tiers page): Select = 3 launched / ≥$1,500 MRR;
  Advanced = 20 launched / ≥$10,000 MRR; Premier = 50 launched / ≥$50,000 MRR.** The old internal
  "Advanced = 3 / $1,500" is the STALE 2019 blog number — purge it everywhere. MRR is a COMBINED
  total across the required launched opps. Plus cert/accreditation floors per tier.
- AWS ENFORCES the human-submit gate on the MCP rail — our design was right.
- `q:` actions (Amazon Q Developer) are the in-console HUMAN assistant, NOT Rune's rail; the MCP
  server uses `partnercentral:UseSession`, not `q:`.

## 5. Governance — how far we SHOULD go

- Automate autonomously **up to draft + enrich** (create/update/associate/read AWS scores).
- **Hard human gate at Submit, Reject, Accept-invitation** (irreversible / destructive / commits the
  partner). Keep it even though IAM now allows automation.
- **Tighten IAM to `pc-write/IAM_POLICY.json` + `pc-mcp/IAM_POLICY.json`** (drop SubmitOpportunity,
  StartEngagementFromOpportunityTask, Assign/Associate, ResourceSnapshot, CollaborationChannel, q:*
  not used). Enforce the line in AWS, not only code. (Anders / Novalo action.)
- `pc-mcp` path is AWS-approval-safe (rail forces `requires_approval`); still route through our own
  human surface for one approval UX.

## 6. The build (branch in alloy-page, tested, human-gated, NOT deployed by Rune)

1. MCP-rail re-point (pc-mcp → dossier-in, human-approved file/qualify/fund).
2. Two-way co-sell ingest (pc-cosell-inbound: poll invitations, triage, human accept/reject).
3. AWS-scored qualification (extend pc-lead-enrich prospecting read).
4. Marketplace-attach + delivery ledger (AssociateOpportunity offers + ResourceSnapshot audit).
5. IAM tightening artifact (the exact policy JSON for Anders).

## AWS primary sources (verified)

Partner Central Selling API: `API_CreateOpportunity/UpdateOpportunity/SubmitOpportunity/
AssociateOpportunity/AssignOpportunity/StartEngagementFromOpportunityTask/
StartEngagementByAcceptingInvitationTask/StartOpportunityFromEngagementTask/
StartProspectingFromEngagementTask/CreateResourceSnapshot/ListEngagementInvitations/ListSolutions/
API_LifeCycle` under docs.aws.amazon.com/partner-central/latest/APIReference/ (+ the CLI command
reference mirror). Marketplace: `API_ListEntities/API_DescribeEntity`. Tiers:
aws.amazon.com/partners/services-tiers/. Agents/MCP: whats-new 2026/03 + 2026/05 + 2026/06,
`partner-central-mcp-server.html`, aws.amazon.com/blogs/apn + /awsmarketplace. Marketplace co-sell:
whats-new 2026/07. Full per-claim URL list: session workflow `rune-partnercentral-gtm-research`.
