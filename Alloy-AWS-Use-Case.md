# AWS Funding Request & Business Case — **Alloy** (Forj)

**To:** Amazon Web Services — Partner Development Manager / Partner Funding team
**From:** Novalo Technologies AB — AWS Partner (org-nr 559427-6411), submitting on behalf of **Forj** (ISV; product: **Alloy**)
**Date:** 1 June 2026
**Re:** Funding request — **ISV Workload Migration Program (ISV WMP)**, with a **Generative-AI Proof-of-Concept** as the on-ramp, for the **Alloy** SaaS workload on AWS
**Requested AWS region:** primary **eu-north-1 (Stockholm)**, expanding to US & APAC regions as the platform scales globally

---

## 1. Executive summary

Forj is building **Alloy**, a generative-AI B2B SaaS that helps **AWS Partners worldwide** find, size, and qualify their next AWS customers — surfacing cloud-migration and AI-readiness signals and routing partners to the right AWS motion (MAP, GenAI, Marketplace/Resell). Alloy is, in effect, **a pipeline engine for the AWS Partner Network itself.**

Alloy runs today on managed PostgreSQL and a third-party LLM API. Novalo will **re-platform Alloy onto AWS-native services — Amazon Bedrock (Claude on Bedrock), Amazon Aurora PostgreSQL, Knowledge Bases, and a serverless data pipeline** — generating **net-new AWS consumption that scales with every partner-tenant Alloy onboards globally.**

**We request AWS's support to:**
1. fund a **Generative-AI Proof-of-Concept** (Bedrock + Aurora) to validate the AWS-native build, and
2. convert it, on success, into **ISV Workload Migration Program** funding sized against Alloy's projected post-migration AWS ARR (below),
with **Novalo delivering the funded engineering** and serving as Partner of record.

> **The strategic case for AWS:** every Alloy tenant is an AWS Partner who, using Alloy, sources and closes *more* AWS business. Funding Alloy compounds AWS consumption twice — once through Alloy's own workload, and again through the partner pipeline Alloy generates.

---

## 2. Customer & partner

- **Customer / ISV:** Forj — owner and developer of Alloy. Global ambition: serve AWS Partners across EMEA, North America, and APAC.
- **Partner of record:** Novalo Technologies AB — AWS Partner delivering the AWS-native architecture, migration, and ongoing optimisation. Novalo owns the SOW, the technical review, milestone delivery, and all AWS Partner Central / funding-portal submissions.

---

## 3. The workload — what Alloy is

Alloy ingests company data globally, then for each company: **finds the website, sizes the firm (employees/revenue), detects the current cloud provider, scores AI & digitalisation maturity, identifies decision-makers, and recommends the AWS motion** — all surfaced to the partner through **"Smith," an AI sales co-pilot,** and through on-demand **prospect-list generation** ("build me a new-money MAP list of 1,000+-employee enterprises with cloud & AI signals"). The output is a continuously-refreshed, signal-scored pipeline of AWS opportunities for the partner.

This is an **inherently AWS-aligned workload**: its purpose is to grow AWS adoption, and its core (LLM reasoning + retrieval over a large company knowledge base) is a textbook fit for **Amazon Bedrock + Knowledge Bases.**

---

## 4. Current state (Current Operating Model)

| Dimension | Today |
|---|---|
| Application | React SPA + "Smith" AI co-pilot + prospect-list generation |
| Data store | Managed **PostgreSQL** — companies, contacts, signals, scores |
| AI / inference | Third-party LLM API (Claude) via a hardened, task-bound proxy |
| Compute | Serverless functions for enrichment, cloud detection, discovery |
| Scheduled work | Daily discovery/enrichment jobs |
| Drivers to move to AWS | First-class GenAI (Bedrock model choice, Knowledge Bases, Guardrails, Agents), AWS-grade data/identity/observability, **multi-region data residency for a global user base**, and native presence in the **AWS ecosystem Alloy serves** |

---

## 5. Target-state architecture on AWS (Future Operating Model)

| Alloy capability | AWS service |
|---|---|
| Smith co-pilot, scoring, summarisation (LLM reasoning) | **Amazon Bedrock** — Claude on Bedrock (like-for-like, low migration risk) |
| Model flexibility | **Bedrock model families** (Anthropic, Meta, Mistral, Cohere, Amazon Nova, AI21, Stability) |
| Maturity/fit scoring grounded in company & AWS knowledge (RAG) | **Knowledge Bases for Amazon Bedrock** |
| Vector store | **Amazon Aurora PostgreSQL (pgvector)** (preferred) / **OpenSearch Serverless** |
| Primary application database | **Amazon Aurora PostgreSQL** (Postgres-to-Postgres continuity) |
| Agentic Smith + safety | **Bedrock Agents/AgentCore + Guardrails** |
| Discovery / enrichment / cloud-detection jobs | **AWS Lambda + Step Functions** |
| Daily discovery cron | **Amazon EventBridge Scheduler** |
| API layer | **Amazon API Gateway** |
| Containerised services | **Amazon ECS on AWS Fargate** |
| Object storage (research, exports, KB sources) | **Amazon S3** |
| Multi-tenant identity | **Amazon Cognito** |
| Global frontend delivery | **Amazon CloudFront** |
| Secrets / keys | **AWS Secrets Manager + KMS** |
| Observability / cost governance | **Amazon CloudWatch, AWS Cost Explorer / Budgets** |
| Resilience & DR (multi-region) | designed against **AWS Resilience Hub** targets |

**Flow:** CloudFront → S3/Amplify (web) and API Gateway → Lambda/Fargate (app + Smith). Smith and the scoring engine call **Bedrock**; grounded answers retrieve from **Knowledge Bases** on **Aurora pgvector**. The discovery/enrichment pipeline runs **EventBridge → Step Functions → Lambda**, persisting to **Aurora** and **S3**. Identity via **Cognito**; secrets in **Secrets Manager/KMS**; observed in **CloudWatch** with **Budgets** governing spend. Multi-region from launch in **eu-north-1**, extending to **us-east-1** and an APAC region as the global user base grows.

---

## 6. Net-new AWS consumption — 3-year projection (the funding basis)

Alloy is a **global** SaaS; AWS consumption scales with partner-tenants and their prospecting/AI usage. The dominant cost drivers are **Bedrock inference** (enrichment + Smith, per tenant) plus the **Aurora + vector + serverless** platform base.

*Illustrative model — Forj/Novalo to confirm against the final plan:*

| | Year 1 | Year 2 | Year 3 |
|---|---|---|---|
| Active partner-tenants (global) | ~75 | ~400 | ~1,200 |
| Bedrock + attributable infra / tenant / mo | ~$120 | ~$140 | ~$160 |
| Platform base / mo (Aurora, vector, Lambda, CloudFront, S3, Cognito) | ~$2.5k | ~$7k | ~$15k |
| **Monthly AWS run-rate (≈)** | **~$11.5k** | **~$63k** | **~$207k** |
| **Annualised AWS run-rate (ARR, ≈)** | **~$140k** | **~$760k** | **~$2.5M** |

**Year-1 ARR (~$140k) clears the ISV WMP minimum (≥ $36k AWS ARR in 12 months) by roughly 4×**, and the trajectory reaches a **~$2.5M annual AWS run-rate by Year 3** as Alloy scales across EMEA, North America, and APAC. (Figures are planning estimates to be validated jointly; the model is bottoms-up from tenant count × per-tenant Bedrock usage + platform base.)

---

## 7. Business outcomes & KPIs

**Value to AWS:** net-new Bedrock/Aurora/serverless consumption **plus** the partner pipeline Alloy generates (more AWS deals sourced by Alloy's tenants). **Value to Forj:** managed GenAI velocity, global multi-region scale, AWS-ecosystem co-sell.

**KPIs reported against milestones:**
- Monthly AWS run-rate (the funding hero metric)
- Active partner-tenants (global) & net revenue retention
- Bedrock token volume (Smith queries + enrichment)
- Companies enriched / decision-makers found / prospect-lists generated per month
- AWS opportunities sourced *by Alloy's tenants* (ecosystem pipeline)

---

## 8. Funding requested

1. **Generative-AI Proof-of-Concept (on-ramp).** Fund a scoped PoC — Smith + the enrichment pipeline on **Bedrock + Aurora pgvector** — to validate quality, latency, and EU residency before the full migration. *(We will secure written pre-approval before any funded work begins.)* AWS's **Generative AI Innovation Center** engagement is welcomed to co-build and de-risk.
2. **ISV Workload Migration Program (primary).** On a successful PoC, convert to ISV WMP funding sized against the projected post-migration AWS ARR in §6, with milestones tied to realised AWS consumption.
3. **Supporting vehicles** we intend to use alongside: **AWS Activate** (Forj startup credits, incl. Bedrock model credits), **APN Innovation Sandbox** credits (Novalo's build/dev AWS usage), **Marketing Development Funds** (joint launch demand-gen), and — as Alloy reaches GA on **AWS Marketplace** — **ISV Accelerate** co-sell.

*(We understand PoC and WMP/MAP funding are sequential, not stacked, and that the PoC amount is credited against the subsequent WMP award.)*

---

## 9. Delivery plan & milestones

| # | Milestone | Owner | Unlocks |
|---|---|---|---|
| 1 | Register Forj as an ACE opportunity in AWS Partner Central | Novalo | Engagement of record |
| 2 | **GenAI PoC**: Smith + enrichment on Bedrock + Aurora pgvector (EU) | Novalo | Validated AWS-native core |
| 3 | **Foundational Technical Review** (or WAFR via a WAPP partner) on the Alloy workload | Novalo | ISV WMP technical gate; Well-Architected ISV credits |
| 4 | **ISV WMP**: migrate full workload in waves; cut over from Supabase → Aurora | Novalo | Net-new AWS ARR (§6), milestone funding |
| 5 | Multi-region rollout (US, APAC) for the global user base | Novalo | ARR ramp Year 2–3 |
| 6 | **AWS Marketplace** GA listing + **ISV Accelerate** co-sell | Forj + Novalo | Co-sold growth |

Each milestone carries a deliverable, owner, date, and the AWS run-rate it unlocks.

---

## 10. Partner commitments — Novalo

Novalo delivers the funded engineering: **Bedrock integration** (Claude on Bedrock + Guardrails + Agents), **Knowledge Bases / pgvector RAG**, the **Supabase → Aurora** migration, the **Lambda/Step Functions** enrichment pipeline, **Cognito** multi-tenant identity, **CloudFront/API Gateway**, and **observability & cost governance** — and owns the SOW, the FTR/WAFR and remediation, milestone reporting, and all Partner Central / funding-portal submissions.

---

## 11. Requested next steps from AWS

1. Confirm the **PoC funding instrument and pre-approval** so funded work can begin.
2. Assign a **Partner Solutions Architect** for the PoC review / FTR path.
3. Confirm the **ISV WMP fit and sizing** against the §6 projection.
4. Advise on **AWS Generative AI Innovation Center** participation for the PoC.

**Novalo contact:** Anders — Novalo Technologies AB — *[insert email/phone]*

---
---

> ### ⛔ INTERNAL — Novalo only. **Delete this section before submitting to AWS.**
>
> **Vehicle & mechanics (from research; confirm with the AWS PDM/PSA against the gated Program Funding Guide):**
> - **ISV WMP** is the primary fit (SaaS workload → net-new ARR), publicly described as **~10–15% of post-migration AWS ARR**, min **$36k ARR/12mo**, partner-applied, **FTR**-gated. *Do not quote the % to AWS — state the ARR projection and let AWS size it.*
> - **GenAI PoC**: ~lower of **10% of year-1 spend or SOW cost**; **pre-approval email required before any work**; PoC is **deducted** from a later WMP award; **cannot** be stacked with WMP/MAP simultaneously.
> - **AWS Activate**: Founders **$1k initial, up to $5k**; Portfolio **up to $200k** (needs an Activate **Provider Org ID** — use Forj's VC/accelerator; pre-Series B, founded within 10 years, paid support plan). Activate credits are **redeemable on Bedrock 3P models (Claude)**. Verified 2026-07-20 vs aws.amazon.com/startups/credits (was "$100k", a stale figure).
> - **Innovation Sandbox** (dev-env AWS credits) + **MDF** (pay-first, claim within 30 days) — Novalo-side.
> - **ISV Accelerate / Marketplace**: later-stage; needs a Marketplace GA listing + opportunity history.
> - All funding flows through **AWS Partner Central → AWS Partner Funding Portal (APFP)**; requires an **AWS Payee Central** account.
> - **Figures to confirm before submission:** exact ISV WMP/MAP %/caps; exact GenAI PoC cap; whether the WMP technical gate is now formally the FTR; Novalo's current partner stage (Validated/Differentiated) & designations; Forj's Activate tier eligibility.
> - **The §6 numbers are illustrative** — replace with Forj's real tenant/usage plan before sending; keep them defensible (bottoms-up).

*Compiled from AWS public documentation (ISV WMP / MAP / Activate / ISV Accelerate / Bedrock / Knowledge Bases / FTR pages, AWS Partner Central funding docs, AWS Prescriptive Guidance business-case framework), 1 June 2026.*
