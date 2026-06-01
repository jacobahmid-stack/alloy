# Alloy on AWS — Partner-Led Use Case & Funding Brief

**Prepared for:** Anders @ Novalo Technologies AB (AWS Partner of record)
**Customer / ISV:** Forj — product: **Alloy** (B2B AWS-partner prospecting platform)
**Purpose:** package Forj/Alloy as a referenceable AWS customer case and secure AWS funding for the AWS-native build.
**Status:** draft for Novalo to adapt and submit via AWS Partner Central. *All funding percentages/caps below are directional from public sources and MUST be confirmed against the gated Program Funding Guide by Novalo's AWS Partner Development Manager (PDM) / Partner Solutions Architect (PSA) before they go in front of AWS.*

---

## 0. The ask in one paragraph

Forj is building **Alloy**, a generative-AI B2B SaaS that helps **AWS partners** find, size, and qualify their next customers. Alloy runs today on managed Postgres (Supabase) and the Anthropic API. Novalo will **re-platform Alloy onto AWS-native services — Amazon Bedrock (Claude on Bedrock), Aurora PostgreSQL, and a serverless data pipeline** — generating **net-new AWS consumption**. We are requesting **GenAI Proof-of-Concept funding as the on-ramp**, converting to **ISV Workload Migration Program (ISV WMP) funding** sized against projected post-migration AWS ARR, with Novalo delivering the funded engineering.

> **Why AWS should care, in one line:** Alloy is an AWS-ecosystem product — it *grows AWS's partner pipeline* — built *on* AWS. Funding it compounds: every Alloy tenant is an AWS partner selling more AWS.

---

## 1. Strategic framing (read this first)

Alloy is **not a classic "lift servers from a data center" migration** — it has no on-prem estate. It is a **SaaS workload being stood up / re-platformed onto AWS-native services to drive net-new AWS ARR**. That points to a specific funding door:

- **Primary vehicle → ISV Workload Migration Program (ISV WMP).** Purpose-built for an ISV moving or standing up a SaaS workload on AWS. Funding scales with projected **post-migration AWS ARR**.
- **On-ramp → GenAI Proof-of-Concept (PoC) funding** (optionally delivered with the **AWS Generative AI Innovation Center, GAIIC**), to build and prove the Bedrock + Aurora pipeline before the full commitment. The formal **"PoC → production"** path lets PoC convert into ISV WMP (PoC amount is deducted from the later award).
- **Classic MAP** is a secondary/fallback framing only — it fits awkwardly because there is no on-prem estate to assess.

**The universal currency AWS actually buys is net-new AWS consumption (ARR / run-rate).** Every section below ladders up to that number.

---

## 2. Current state (Current Operating Model)

| Dimension | Today |
|---|---|
| Application | Single-page React app (Alloy) + AI sales co-pilot ("Smith") |
| Data store | Managed **PostgreSQL** (Supabase) — companies, contacts, scores, signals |
| AI / inference | **Anthropic Claude** via a hardened server-side proxy (task-bound) |
| Compute | Serverless edge functions (Deno) for enrichment, cloud detection, discovery |
| Scheduled work | Daily discovery/enrichment cron |
| Core pipeline | Discover Swedish companies → size (employees/revenue) → detect cloud provider → score AI/digitalisation maturity → find decision-makers → Smith co-pilot |
| Constraints driving the move | Wants first-class GenAI tooling (Bedrock model choice, Knowledge Bases, Guardrails, Agents), AWS-grade data/identity/observability, EU data residency, and to be **co-sellable inside the AWS ecosystem** it serves |

---

## 3. Target-state architecture on AWS (Future Operating Model)

**Capability → AWS service map** (this is the bill of materials behind the consumption forecast):

| Alloy capability | AWS service | Note |
|---|---|---|
| Smith co-pilot, scoring, summarisation (core LLM reasoning) | **Amazon Bedrock** | **Claude is available on Bedrock** → like-for-like, minimal model-migration risk |
| Model flexibility | **Bedrock model families** (Anthropic/Claude lead; Meta, Mistral, Cohere, Amazon Nova, AI21, Stability) | Avoids single-model lock-in |
| Maturity / fit scoring grounded in company data (RAG) | **Knowledge Bases for Amazon Bedrock** | Managed ingest → embeddings → retrieval |
| Vector store | **Aurora PostgreSQL (pgvector)** *(preferred)* or **OpenSearch Serverless** | pgvector keeps Postgres continuity and a far lower monthly floor |
| Primary application database | **Amazon Aurora PostgreSQL** | Postgres-to-Postgres continuity from Supabase |
| Agentic Smith / multi-step tools + safety | **Bedrock Agents/AgentCore + Guardrails** | |
| Discovery / enrichment / cloud-detection jobs | **AWS Lambda + Step Functions** | Replaces edge functions |
| Daily discovery cron | **Amazon EventBridge Scheduler** → Step Functions | |
| API layer | **Amazon API Gateway** | Fronts Lambda/Fargate |
| Long-running/containerised services | **Amazon ECS on AWS Fargate** | |
| Object storage (raw research, exports, KB sources) | **Amazon S3** | Also the standard KB data source |
| Multi-tenant identity | **Amazon Cognito** | Tenant user pools |
| Frontend delivery | **Amazon CloudFront** (+ S3 / Amplify) | |
| Secrets / keys | **AWS Secrets Manager + KMS** | |
| Observability / cost governance | **CloudWatch, Cost Explorer/Budgets** | Feeds the milestone & KPI reporting AWS expects |
| Region | **eu-north-1 (Stockholm)** | EU data residency for Swedish customers |

**Architecture narrative:** CloudFront → S3/Amplify (web) and API Gateway → Lambda/Fargate (app + Smith). Smith and the scoring engine call **Bedrock**; grounded answers retrieve from **Knowledge Bases** backed by **Aurora pgvector**. The discovery/enrichment pipeline runs as **EventBridge → Step Functions → Lambda**, persisting to **Aurora PostgreSQL** and **S3**. Identity via **Cognito**; secrets in **Secrets Manager/KMS**; everything observed in **CloudWatch** with **Budgets** guarding spend.

> **Forecast driver:** the largest AWS line items for a GenAI SaaS are **Bedrock inference tokens + vector store + Aurora**. Build the year-1 run-rate primarily from *projected Bedrock token volume × per-tenant usage × tenant count* — that is the number that sizes ISV WMP.

---

## 4. Business outcomes & KPIs

**AWS value buckets (use AWS's own framing):**
- **Business agility** — faster release cadence; new GenAI features (Knowledge Bases, Agents, Guardrails) ship without bespoke plumbing.
- **Resilience** — managed, multi-AZ Aurora + serverless; EU residency.
- **IT productivity** — managed Bedrock/KB replaces hand-rolled inference + retrieval infrastructure.

**Product KPIs (the ones to report against milestones):**
- Companies discovered & enriched / month
- Decision-makers identified / month
- Smith co-pilot queries / month (Bedrock token volume)
- Paying tenants (AWS partners) & net revenue retention
- **Monthly AWS run-rate (the funding hero metric)**

---

## 5. Consumption forecast — projected AWS ARR (the hero number)

*Forj to insert real figures; the model below shows the method and that the ISV WMP floor is comfortably cleared.*

**Method:** `monthly AWS ≈ Bedrock tokens (enrichment + Smith) + Aurora + vector store + serverless/egress`.

Illustrative, conservative single-region model (replace with Forj's plan):

| Driver | Assumption (illustrative) | Monthly AWS |
|---|---|---|
| Bedrock inference (enrichment + Smith, all tenants) | scales with tenants & usage | $X |
| Aurora PostgreSQL (Serverless v2) | always-on app DB | $Y |
| Vector store (Aurora pgvector) | KB retrieval | $Z |
| Lambda/Step Functions/EventBridge/S3/CloudFront/Cognito | pipeline + delivery | $W |
| **Total monthly run-rate** | | **$T** |
| **Year-1 AWS ARR (×12)** | | **$T × 12** |

**Eligibility gate:** ISV WMP requires a minimum of **$36,000 AWS ARR within 12 months** for the migrated workload *(confirm current figure with AWS)* — i.e. an average AWS run-rate of **$3,000/month**, which a multi-tenant GenAI SaaS clears quickly. Provide a **3-year ramp** (conservative + most-likely scenarios; keep to 3–4 scenarios total) per AWS Prescriptive Guidance.

---

## 6. Funding plan (programs, in sequence)

| Program | Role in the plan | What it funds | Who applies | Figure *(confirm w/ AWS)* |
|---|---|---|---|---|
| **GenAI PoC funding** (+ optional **GAIIC**) | **On-ramp** | A scoped PoC of the Bedrock+Aurora build (e.g. Smith + enrichment) | **Novalo** | ≈ lower of 10% of yr-1 spend **or** SOW cost; requires **pre-approval email before work starts** |
| **ISV Workload Migration Program (ISV WMP)** | **Primary** | Credits/cash offsetting the SaaS build on AWS | **Novalo** | ≈ **10–15% of post-migration AWS ARR**; min **$36k ARR/12mo**; requires a technical review/**FTR** |
| **AWS Generative AI Innovation Center (GAIIC)** | Expert delivery + credits behind the PoC | AWS AI scientists co-build; credits | Via AWS/partner | Pool program — name as the delivery mechanism, **don't quote a per-customer grant** |
| **AWS Activate** | Credits for **Forj directly** | AWS credits (incl. **Bedrock 3P models like Claude**) | **Forj** | Founders **$1,000**; Portfolio **up to $100,000** (needs an Activate Provider Org ID) |
| **APN Innovation Sandbox** credits | Covers **Novalo's dev-env AWS bill** during the build | Promotional credits | **Novalo** | up to ~3 months dev usage |
| **Marketing Development Funds (MDF)** | Joint demand-gen for the launch | Marketing (not build) | **Novalo** | Pay-first/claim-back; **claim within 30 days** |
| **ISV Accelerate + AWS Marketplace** | **Phase 2** co-sell / scale | Co-sell incentives, reduced listing fee | **Forj/Novalo** | Later-stage; needs Marketplace GA listing + opportunity history |
| **Classic MAP** | Secondary/fallback framing only | Migration funding vs realized consumption | Novalo (Migration Competency) | Awkward fit — no on-prem estate |

**Critical rules (from AWS):** PoC funding **cannot be combined** with MAP/WMP simultaneously — it is **sequential**, and the PoC amount is **deducted** from the later WMP award. All partner funding flows through the **AWS Partner Funding Portal (APFP)** via SSO from **Partner Central**, requires an **AWS Payee Central** account, and **credit/PoC work must be pre-approved in writing before it begins** (pre-approval work is unclaimable).

---

## 7. Delivery plan & milestones (milestones are what AWS pays against)

1. **Register** Forj as an **ACE opportunity** (APN Customer Engagement) in Partner Central.
2. **GenAI PoC** (Novalo-led, GAIIC optional): stand up Smith + enrichment on **Bedrock + Aurora pgvector**; prove quality, latency, EU residency. *(Secure the pre-approval email first.)*
3. **FTR / WAFR** on the Alloy workload — the technical gate for ISV WMP/Accelerate (also unlocks **Well-Architected ISV Funding** credits).
4. **Convert to ISV WMP**, sized at ~10–15% of projected post-migration AWS ARR (PoC deducted). Migrate the full workload in waves, each wave a **milestone tied to realized AWS consumption**.
5. **List on AWS Marketplace** + pursue **ISV Accelerate** co-sell as Alloy scales.
6. In parallel, Novalo taps **Innovation Sandbox** (dev credits) and **MDF** (launch marketing); Forj applies for **Activate**.

Each milestone carries: deliverable, owner (Novalo vs Forj), date, and the AWS run-rate it unlocks.

---

## 8. Partner role — Novalo

- **Delivered (funded) engineering:** Bedrock integration (Claude on Bedrock + Guardrails + Agents), Knowledge Bases/pgvector RAG, Supabase→Aurora migration, the Lambda/Step Functions enrichment pipeline, Cognito multi-tenant identity, CloudFront/API Gateway, observability & cost governance.
- **Owns:** the SOW, the technical review/FTR remediation, milestone delivery and reporting, and all Partner-Central/APFP submissions.
- **Partner status to confirm:** Novalo's current stage (**Validated / Differentiated**) and designations (ISV WMP enrolment; Migration Competency if MAP is used) — these gate which doors open.

---

## 9. Why AWS approves this (and the pitfalls we've avoided)

**Approves because:** it is anchored on **net-new AWS consumption** with an explicit year-1 run-rate; the scope and **AWS-native target architecture** are concrete and reviewable; **milestones tie to realized revenue**; outcomes/KPIs are measurable; it is **partner-delivered** (Novalo de-risks scope/architecture for AWS); and it follows the **PoC→production** path correctly with pre-approval and an FTR.

**Pitfalls avoided:** no vague forecast, no open-ended "managed services" framing, no stacking of incompatible programs, no work started before approval, no missed claim windows.

---

## 10. Submission checklist (artifacts AWS expects)

- [ ] ACE opportunity registered for Forj
- [ ] Fund Request(s) raised in APFP (PoC first, then ISV WMP)
- [ ] **This use case / business case** (current state → AWS-native target → KPIs → consumption forecast → milestones)
- [ ] **SOW / project plan** for the funded engineering
- [ ] **Projected AWS ARR / consumption model** (the sizing input)
- [ ] **Target-state architecture diagram** (from §3)
- [ ] **FTR (or WAFR via a WAPP partner / SOC 2 Type II)** on the Alloy workload
- [ ] **Pre-approval email** captured before any funded work starts
- [ ] **AWS Payee Central** account active (for cash/credit disbursement)

---

## Appendix — figures Novalo must confirm with the AWS PDM/PSA (do NOT present as fact)

1. Exact **ISV WMP / MAP** funding percentages and caps (live only in the gated Program Funding Guide).
2. Exact **GenAI/PoC** cap (public sources conflict; likely program/region-specific).
3. Whether the ISV WMP technical gate is now formally the **FTR** vs. the older WMP-PSA review.
4. **Novalo's** current partner stage/designations (Validated/Differentiated; ISV WMP enrolment; Migration Competency).
5. **Forj's Activate** eligibility (Founders $1k is straightforward; Portfolio $100k needs an Activate Provider Org ID).
6. Current **MAP** thresholds (e.g. "MAP Lite" minimum) — secondary-source figures only.

---

*Sources: AWS APN blog (ISV WMP), AWS ISV WMP / MAP / Activate / ISV Accelerate / Bedrock / Knowledge Bases / FTR pages, AWS Partner Central funding docs, AWS Prescriptive Guidance (business case). Compiled 2026-06-01; verify program terms before submission.*
