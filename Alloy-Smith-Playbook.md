# Smith Playbook — AWS funding, plays & qualification (Alloy brain)

Knowledge Smith uses to advise AWS partners. Funding figures are directional from AWS public sources — always tell the rep to confirm exact %/caps with their AWS PDM against the gated Program Funding Guide.

## AWS funding programs (which door to knock on)

**ISV Workload Migration Program (ISV WMP)** — the right vehicle for an ISV standing up or moving a SaaS workload onto AWS to drive net-new AWS ARR. Funding is roughly 10–15% of post-migration AWS ARR; minimum about $36,000 AWS ARR within 12 months for the workload; the partner applies on the customer's behalf; a technical review / Foundational Technical Review (FTR) gates it. Funding form: cash or AWS promotional credits. Use this when there is no classic on-prem estate — a SaaS re-platform onto AWS-native services.

**Migration Acceleration Program (MAP)** — the classic migration program for moving an existing (often on-prem or other-cloud) estate to AWS. Three phases: Assess (build a data-driven TCO/business case using the AWS Cloud Adoption Framework), Mobilize (close gaps, build the landing zone, skill up), Migrate & Modernize (execute). Funding is earned against milestones and realized AWS consumption, not granted upfront; the largest tranche pays as a percentage of first-year AWS run-rate of MAP-eligible workloads. Delivered through partners with AWS Migration Competency. Exact phase percentages are not published — confirm with AWS.

**MAP-eligibility signals (how Smith spots a MAP / "new money" prospect):** a sizable company with substantial existing workloads that are NOT already all-in on AWS — i.e. on-prem data centers, or running primarily on Azure / Google Cloud / hybrid — showing migration or modernization intent (datacenter exit, cloud-first strategy, SAP move, VMware exit, end-of-life hardware, M&A consolidation). A company already all-in on AWS is a Resell/optimize motion, not MAP.

**PoC / Sell funding** (not a named "GenAI PoC" program) — the on-ramp. Funds a scoped proof-of-concept (e.g. a Bedrock build) before the full migration/modernization commitment. Directionally around 10% of expected year-one spend bounded by SOW/project cost, but AWS publishes no figure, so treat any number as directional. Critical rules, guide-gated (Partner Funding Benefits Guide, not a public AWS page): it requires **pre-approval in Partner Central** BEFORE any work begins (the Fund Request reaches the Pre-Approval stage; work started before is unclaimable) NOT an "email"; a PoC and MAP are not run on the same deal at once, and a PoC can be credited toward a later **MAP** award. Do NOT tie this to ISV WMP, which is a separate program. [Corrected 2026-07-20 per the claim audit.]

**AWS Generative AI Innovation Center (GAIIC)** — an expert-delivery program pairing customers with AWS AI scientists for hands-on PoC-to-production work, bundling credits, architecture guidance and go-to-market support. Name it as the delivery mechanism behind a GenAI PoC; do not quote a per-customer grant (it is a pooled AWS investment).

**AWS Activate** — startup credits for the ISV directly (not via the partner). Founders tier: $1,000 initial, up to $5,000 (self-funded, early-stage); Portfolio tier up to $200,000 (requires association with an AWS Activate Provider — a VC/accelerator/incubator — and their Org ID; pre-Series-B, founded within the last 10 years, AWS account on a paid support plan). Activate credits are redeemable on Amazon Bedrock third-party models including Claude — useful to fund GenAI build/usage. [Figures verified 2026-07-20 vs aws.amazon.com/startups/credits; the earlier "$100,000" was stale.]

**ISV Accelerate + AWS Marketplace** — the co-sell / go-to-market layer, later-stage. ISV Accelerate gives AWS account managers incentives to co-sell your SaaS via Marketplace Private Offers and a reduced Marketplace listing fee. High bar: a GA product listed on AWS Marketplace, ACE eligibility, Validated/Differentiated partner stage, a track record of launched and qualified opportunities. Position as the Phase-2 scale path once the workload is live.

**Partner-side vehicles** — APN Innovation Sandbox credits cover the partner's/customer's dev-environment AWS bill during solution development (AWS promotional credits). Marketing Development Funds (MDF) fund joint demand-generation/marketing (not build or migration); the partner pays first then claims reimbursement within 30 days with itemized receipts. AWS Marketplace Private Offer promotions are a later customer-incentive lever.

**Mechanics** — all partner funding runs through AWS Partner Central → the AWS Partner Funding Portal (APFP) via single sign-on, and requires an AWS Payee Central account for any cash/credit disbursement. The partner registers the customer as an ACE (APN Customer Engagement) opportunity, then raises a Fund Request per program. Credit/PoC requests require written pre-approval before work starts.

## What makes AWS approve vs reject funding

Approve: lead with net-new AWS consumption (state the projected year-1 AWS ARR/run-rate and clear the program floor); a defined, validated scope with an AWS-native target architecture AWS can sanity-check; milestones tied to realized revenue; measurable business outcomes and KPIs; partner-delivered engineering; pre-approval secured before work; pass the FTR. Reject: no milestones, no revenue impact, no architectural change; funding framed for open-ended steady-state managed services; vague consumption forecasts; trying to stack incompatible programs; starting work before approval; missing the claim window or Payee Central setup.

## The AWS plays (which motion fits a prospect)

**MAP — Migrate:** lift-and-shift an existing on-prem or other-cloud estate to AWS. Fit: datacenter exit, hardware EOL, VMware/cost pressure, large non-AWS footprint. Value: net-new AWS run-rate + MAP funding.

**MAP — Modernize:** re-architect during/after migration (containers, serverless, managed databases, data & analytics). Fit: legacy apps, monoliths, expensive licensing (e.g. SAP, SQL Server) — re-platform to Aurora/containers. Higher AWS consumption and stickiness.

**GenAI POC / Bedrock:** stand up a generative-AI use case on Amazon Bedrock (assistants, RAG over company data, document processing, agents). Fit: companies with active AI/data initiatives, "AI" in strategy, data teams. On-ramp via GenAI PoC funding + GAIIC.

**Greenfield / Partner-Originated (build new on AWS):** net-new workloads built AWS-native from day one. Fit: new products, startups, digital initiatives.

**ISV Marketplace / Resell:** for accounts already consuming AWS — drive recurring ARR, margin, account control and stickiness through partner-led AWS resale and Marketplace Private Offers. Fit: companies already on AWS where the play is optimize + resell, not migrate.

## How Smith qualifies a prospect (signals → motion)

Read the prospect's cloud and AI posture. If primarily on-prem / Azure / GCP / hybrid and sizable → MAP (migrate, and modernize the legacy parts), with new-money funding. If active AI/data initiatives → layer a GenAI POC on Bedrock as the on-ramp. If already on AWS → Resell/optimize + Marketplace. Always size the opportunity by projected net-new AWS run-rate (the number AWS funds against), and identify the IT/digitalisation decision-maker (CIO, CTO, Head of Cloud/Platform, Head of Data/AI) who owns the cloud budget. Larger enterprises (1000+ employees) with hybrid estates and modernization intent are the strongest MAP/new-money candidates.

## AWS architecture building blocks Smith can reference

Generative AI: Amazon Bedrock (Claude and other model families), Knowledge Bases for Bedrock (managed RAG), Bedrock Agents and Guardrails, vector storage via Aurora PostgreSQL pgvector or OpenSearch Serverless. Data & app: Amazon Aurora PostgreSQL / RDS, S3, AWS Lambda, Step Functions, EventBridge, API Gateway, ECS on Fargate, Amazon Cognito, CloudFront, Secrets Manager, KMS, CloudWatch. Migration: AWS Migration Hub, Application Migration Service (MGN), Database Migration Service (DMS), Schema Conversion Tool — relevant when moving databases (e.g. SAP ASE or SQL Server to Aurora/RDS). Resilience: design to AWS Resilience Hub assessments for RTO/RPO and Well-Architected reliability. Marketplace: list SaaS as a product, transact via Private Offers, receive disbursements through Marketplace seller accounts.
