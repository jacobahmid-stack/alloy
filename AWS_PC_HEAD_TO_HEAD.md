# The Alto head-to-head artifact (the 30-day move)

**Why this exists.** On 2026-07-09 AWS shipped Partner Lead Prospecting, available to all ACE-eligible partners globally (drafting, scoring, enrichment; AWS published *eligibility*, not a price, so do not say "free"). That takes the downstream half of Smith off the table as something to sell. What AWS does not do is manufacture net-new accounts: it enriches and scores leads already in a partner's funnel, and even its own prospecting (`StartProspectingFromEngagementTask`) starts from an existing engagement, not a national registry. That split is the wedge, and it is the single highest-leverage move to land the first paying tenant. Full context: [[aws-pc-commoditization-2026-07]]. Corrected 2026-07-20: earlier drafts said "free to every ACE partner" and "AWS does no discovery / its contract begins at submit your leads" — both false, both disprovable by a partner in the room.

**The claim it lands, in the partner's own accounts:**
1. *AWS itself scored these* (so the read is not my opinion, it is the counterparty's).
2. *AWS could never have found them* (because AWS starts at a lead you already own; Alloy is the machine that made the lead).

## What is built now (no dependency on you)
- `head-to-head/render.mjs` = the shared renderer; `gen.mjs` = fictional worked example (`alto-example.html`); **`alto.mjs` = THE REAL ONE (`alto-live.html`)**, populated 2026-07-16 from a live partner-trio dry-run (zero paid calls, unclaimed accounts only, titles not names):
  - **Lagans Byggnads Aktiebolag** (Lagan, 50-199, construction) - no hyperscaler, M365, ICP hot 78 -> Migrate (MAP), VD / Tf. Områdeschef
  - **ServiceNow Sweden AB** (Stockholm, 50-199, software) - AWS detected, Grafana, ICP hot 75 -> Expand and co-sell, Sales Director. ⚠️ REVIEW before the meeting: this is the Swedish office of a US software giant; mechanically a hot expand lane, commercially an odd door to pitch Alto. Regenerate the lane (partner-trio dry_run again after claiming/excluding it) if it reads wrong in the room.
  - **Byggnadsförvaltarna i Skaraborg AB** (Lidköping, 10-49, property mgmt) - Azure, M365, ICP hot 85 -> New workload on AWS (POC), Extern verkställande direktör
- The AWS column states the structural truth ("AWS enriches leads you already own; this is not yet your lead") with a slot per account for the live enrichment result (`awsEnrichment: {score, readiness, eligibility}` or `'miss'`).

## The exact registration punch-list (from AWS's own onboarding agent, live session 2026-07-16)
Access to the Partner Central agents MCP is WORKING (dedicated IAM user `alloy-pc-readonly`, both catalogs). The onboarding agent read the real account state and returned this checklist. Steps 1-4 are required for all partners; 5-6 per business model:
1. **Complete Partner Registration** - company legal name, business address, contact info, alliance lead (name, email, title), partner type (Consulting). Creates the partner entity and unlocks everything else.
2. **Complete Partner Profile** - display name, description in English, HTTPS website, logo PNG 300x150 max 500KB, primary solution type, industry segments.
3. **Set Profile Visibility to PUBLIC** - one click; makes Forj discoverable to AWS field teams.
4. **Associate the Training and Certification email domain** - forj.se + a verification code sent to the domain.
5. **Seller account** (only for Marketplace listing) - tax interview, bank details, KYC.
6. **Register Solutions** (for co-sell) - solution name, description, AWS service mappings, pricing.
Fastest path: talk to the agent itself (`pc-mcp`, catalog AWS, "Help me onboard to Partner Central"; it can even fill the profile from the website: "Can you look at my website and fill in my partner profile?"). Writes are human-in-the-loop on AWS's side; you approve each one. NOTE: pc-mcp is now auth-gated (service_role or cron key; anon blocked).

## The live half (gated on your Partner Central migration)
The migration to the Console Partner Central experience lapsed 2026-06-30. It gates the live enrichment call. Two paths:

**Path A (preferred): run real enrichment.**
1. Migrate Forj's Partner Central to the Console experience.
2. Submit Alto's same accounts to Partner Central lead enrichment as partner-sourced leads (console Leads page, or the Selling API in us-east-1, or the Partner Central MCP server).
3. Record per account: readiness (Contact Ready / Nurture / Limited), quality/engagement score, program eligibility, and critically the accounts that come back "enrichment data was not available."
4. In `gen.mjs`, set each account's `awsEnrichment` to the real result, or the literal string `'miss'`. Re-run. The rollup now shows AWS's OWN miss rate: every miss is a company AWS has no read on and Alloy surfaced.

**Path B (fallback, if the migration is not done by day 5): docs-only.**
Run the artifact as-is, but the AWS column must stand on the TRUE distinction, not "AWS does no discovery" (false: `StartProspectingFromEngagementTask` exists). The accurate, still-defensible line: AWS's tools all start from a lead or engagement already in the partner's funnel; they enrich, score and prospect from that set, they do not manufacture net-new accounts from a national registry. That is enough to land the objection and it survives a partner checking.

## The talk track (30 seconds)
"Here are three accounts. Alloy found each one from observable signals, read the cloud, named the funded AWS play, and named who owns the call, before any of them was a lead anywhere. Now watch: I put the same three into AWS's own free enrichment. AWS scores the ones I hand it, and it says outright it has no data on the rest. AWS is the free downstream. Alloy is the upstream that feeds it. You bring my accounts to their free tool, not the other way around."

**The proof line (use it, it is true):** "This is not a projection. This is the machine we ran ourselves, from zero: it found the accounts, named the funded plays, drafted the openers, we made the calls. It ended in about twenty booked meetings, three proposals, and a closed POC-plus-resell deal across three organisation numbers under one decision-maker. AWS's free prospecting shipped last week; this machine has a closed-deal trail." (Aggregate numbers only in partner rooms; the customer behind the deal is never named publicly.)

## Hard rules (do not cross)
- Forj is an independent company, not part of AWS. Never imply endorsement, affiliation, certification, or privileged access. The enrichment result is AWS's public feature working as documented for any partner.
- "Ready to submit in Partner Central" describes drafting, never "AWS-integrated" or "official integration."
- A human approves and sends every play. Smith never contacts anyone autonomously.
- Never fabricate a program amount or eligibility. Pioneer Credits, PGP and the Partner-Led Sales Motion are AWS-determined; name them, confirm them in Partner Central, do not put a number on them.
- This is a private sales leave-behind. It is NOT for forj.se (the launch gate holds) and carries no AWS logo.

## After it lands
The miss rate becomes the headline number in the deck (replaces the dead "Partner Central read" asset), and the first booked meeting from it is the first-tenant hero number the raise has been waiting on ([[forj-positioning-spine]]). Then sell only for the rest of the window. Do not open the editor.
