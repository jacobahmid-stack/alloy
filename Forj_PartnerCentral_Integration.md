# AWS Partner Central , Alloy/Smith integration

You now have Partner Central access, which unblocks the integration that was parked on it. This is the plan.

## The two AWS surfaces (don't confuse them)
1. **Selling API** , `partnercentral-selling.us-east-1.amazonaws.com`, SigV4, AWS JSON 1.0 (`X-Amz-Target: AWSPartnerCentralSelling.<Op>`), `Catalog` = `AWS` | `Sandbox`. Structured CRUD on **Opportunities**, **Engagements** (the co-sell collaboration), **Benefit Applications** (funding/MDF). This is the **system-of-record sync** rail.
2. **Agents MCP** , `partnercentral-agents-mcp.us-east-1.api.aws/mcp`, SigV4, JSON-RPC 2.0. Conversational access to AWS's own agents (pipeline intelligence, opportunity-from-notes, funding optimization, Opportunity Quality Score). This is the **invoke-AWS's-agents** rail. (Our `pc-mcp` stub already targets this.)

## The benefit (why bother)
- **Close Smith's loop on AWS:** Smith drafts the ACE opportunity + funding paperwork today and you paste it in. With the API he drafts → you approve → he files it (`CreateOpportunity` / `CreateEngagement` / `CreateBenefitApplication`). *Writes are phase 3, human-gated.*
- **One pane over the live co-sell pipeline:** pull real ACE opportunities + AWS's enriched summary, recommendations, and Opportunity Quality Score into the Alloy card (`ListOpportunities` + `GetAwsOpportunitySummary`).
- **Funding end-to-end:** Alloy's eligibility engine → Smith drafts the Benefit/MDF application → (phase 3) files it.
- **Ride AWS's agents, don't fight them:** AWS's agents are AWS-only and downstream (they act on opportunities already in Partner Central). Forj stays **upstream** (find the account, read the whole stack, name the play) and **cross-cloud** (AWS + Azure + GCP, one motion). AWS validated the category and handed us the API + MCP to plug in. Win above them, feed them.

## Built this session , `pc-sync` (read-only Selling API)
`supabase/functions/pc-sync/index.ts`. SigV4 (reuses the aws4fetch pattern from claude-proxy's Bedrock path), us-east-1, AWS JSON 1.0, `Catalog` param.
- **Read-only by construction:** a hard allowlist of `ListOpportunities, GetOpportunity, GetAwsOpportunitySummary, ListEngagements, GetEngagement, ListEngagementMembers, ListEngagementInvitations, ListSolutions, GetSellingSystemSettings`. Any write op → 403. It physically cannot change anything in Partner Central.
- **Auth-gated** (authenticated / service_role / cron; never anon).
- **Creds-gated:** returns 503 until `PC_AWS_*` secrets exist , safe to deploy ahead of the IAM identity.
- Body: `{ op, params?, catalog? }`. Defaults `Catalog` to `AWS` (set `PC_CATALOG=Sandbox` or pass `catalog:"Sandbox"` to test against isolated sandbox data first).

## Your steps (the only blockers)
1. **Provision a dedicated least-privilege IAM identity** in your Partner Central AWS account (NOT the SSO ViewOnlyAccess login; the earlier exposed creds are burned). For pc-sync (read), attach the READ subset:
   `partnercentral:ListOpportunities`, `partnercentral:GetOpportunity`, `partnercentral:GetAwsOpportunitySummary` (use a `partnercentral:Get*` wildcard , the guide misspells it `GetAwsOpporunitySummary`), `partnercentral:ListEngagements`, `partnercentral:GetEngagement`, `partnercentral:ListEngagementInvitations`, `partnercentral:ListSolutions`, with condition `partnercentral:Catalog` in `[AWS, Sandbox]`. (Managed-policy shortcut for sandbox dev: `AWSPartnerCentralSandboxFullAccess`.)
2. **Set box secrets** (same recipe as Explorium , `echo '…' | sudo tee -a .env`, then `up -d --force-recreate functions`): `PC_AWS_ACCESS_KEY_ID`, `PC_AWS_SECRET_ACCESS_KEY` (+ `PC_AWS_SESSION_TOKEN` only if STS).
3. **Deploy** `box/pc-sync.txt` (paste) + the recreate above.
4. **Test** (Sandbox first): `POST /functions/v1/pc-sync {"op":"ListOpportunities","catalog":"Sandbox","params":{"MaxResults":10}}` → expect a JSON opportunity list. Then `catalog:"AWS"` for real data.

## Where it lands on the card (phase 1b, after the read works)
A small **AWS co-sell** panel on the Alloy company card: the matched ACE opportunity's stage, the **Opportunity Quality Score**, AWS's next-step recommendations, and engagement state. A sync (cron + on-demand) calls `pc-sync ListOpportunities`, matches each opportunity's customer to the Alloy company (name/domain), and stores it in `enrichment.aws_cosell`. Built against live data once the read is flowing.

## Phased plan
- **P1 (now): read-only sync** , `pc-sync` built; you provision IAM + deploy; then the card panel + the sync job.
- **P2: invoke the agents** , finish `pc-mcp` (the agents MCP), so Smith can surface AWS's Quality Score + recommendations conversationally. Add the auth gate it currently lacks before deploying.
- **P3: writes (human-gated)** , Smith files/updates opportunities + drafts benefit applications on your explicit click only. Separate allowlist, separate review UI, always approved.
- **P4: multicloud parity** , the same pattern for Azure Partner Center + GCP Partner Advantage. AWS is the deepest, proven first; that's the cross-cloud co-sell story.

## Boundary (non-negotiable)
Reads are free. **Every write to Partner Central is a human-approved action** (it affects your AWS partner standing). pc-sync enforces read-only in code; P3 writes get an explicit approval gate, never automatic.

---

## Update 2026-06-28 , LIVE on real data + multicloud built

**AWS is LIVE.** `pc-sync` reads Novalo's real Partner Central pipeline via a clean cross-account role (Forj user `701275662474` → `sts:AssumeRole` → `arn:aws:iam::497260983102:role/smith-integration`; `PC_ROLE_ARN` set as a box secret, no shared partner keys). Verified dry-run: **30 AWS opportunities, 8 matched** to Alloy companies (Axis, Adeprimo, CJ Automotive, Zmart, …).

### P1b shipped , the co-sell card panel (`pc-cosell-sync`)
- Pulls opps via `pc-sync ListOpportunities` (paginated), matches each customer to an Alloy company, writes `enrichment.aws_cosell`, renders in the **Co-sell** card panel (`CoSellPanel` in forge.jsx).
- **#1 Insights (GetAwsOpportunitySummary):** for each matched opp, fetches AWS's own read , `Insights.OpportunityQuality.Score` (number, with trend), `Insights.EngagementScore` (`High|Medium|Low`), `Insights.NextBestActions`, `Insights.Recommendations[]` , and renders a quality meter + engagement badge + next-best-action + recs on the card. Best-effort (AWS has no summary for many partner-led opps; those just show without insights). Request param is `RelatedOpportunityIdentifier` (the partner opp Id, `O[0-9]+`).
- **#2 Matching upgraded** (`src/pc-match.js`, 11 Vitest tests): domain → exact name → **normalized name** (folds Swedish legal suffixes: AB, AB (publ), Aktiebolag, HB, Sweden…) → **fuzzy** (char-bigram Dice ≥ 0.9, prefix-bucketed). Plus **dedup-promotion**: any match lands on the most-canonical Alloy row of that identity (domain + uuid beats an `lc-` placeholder), so e.g. Axis's two opps consolidate onto ONE card instead of splitting across duplicate rows.
- **#3 Nightly cron** (`supabase/migrations/pc_cosell_sync_cron.sql`): `pg_cron` → `net.http_post` `pc-cosell-sync` at 03:20 UTC, anon Bearer + `x-cron-key`. Applied on the box via `box/pc-cosell-cron.txt`.

### #4 Multicloud , the cross-cloud co-sell story (researched + built, status-honest)
The card panel + data model are now **cloud-generic**: `enrichment.{aws,azure,gcp}_cosell`, one `CoSellPanel` renders all three with equal accents (per brand).

- **Azure , real API, credential-gated.** Microsoft **Partner Center Referrals API** is real: `GET https://api.partner.microsoft.com/v1.0/engagements/referrals` (co-sell = `type eq 'Shared'`; fields `customerProfile.name`, `details.dealValue/currency/closingDateTime`, `status`/`substatus`/`qualification`). Built `azure-cosell-sync` (vendored matcher, writes `azure_cosell`) , **gated → 503 until creds.** Auth is **delegated (App+User) only**, so before it can run you must, on your side:
  1. Partner Center account with an **MPN/Partner ID**.
  2. A service user granted the **Referrals Admin** role.
  3. An **Entra (Azure AD) app registration** with delegated **`user_impersonation`** on the **"Microsoft Partner"** API (client id starts `4990c…`), **admin-consented**.
  4. Mint a refresh token once (Secure Application Model), then set box secrets: `AZURE_PC_TENANT_ID`, `AZURE_PC_CLIENT_ID`, `AZURE_PC_CLIENT_SECRET`, `AZURE_PC_REFRESH_TOKEN` (or `AZURE_PC_ACCESS_TOKEN` for a quick test). No sandbox; test with a throwaway Partner ID + $2 "Test" deals.

- **GCP , no public co-sell API (verified).** Google Cloud has **no** first-party REST endpoint for co-sell opportunities/leads/deal-registration; Partner Advantage + Partner Sales Console are **portal-only**. (The Procurement/Channel APIs that exist are Marketplace entitlements + reseller provisioning, not pipeline.) So the honest path is an **importer**, not a poller: `gcp-cosell-import` accepts a POSTed opportunities array (manual console export → JSON), matches, writes `gcp_cosell`. Same panel lights up. Revisit if/when a GCP partner motion is real.

### Deploy (box pastes generated in `Downloads/alloy-deploy/box/`)
`pc-cosell-sync.txt`, `azure-cosell-sync.txt`, `gcp-cosell-import.txt` (paste each → `SHA OK`), then `pc-cosell-cron.txt` (→ table + `CRON OK`). App side (`forge.jsx` panel) ships via Amplify on push. Azure/GCP stay dormant (503 / awaiting import) until their inputs exist.
