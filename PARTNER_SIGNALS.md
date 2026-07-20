# Partner-ecosystem signals → AWS co-sell map

**What this is.** Alloy detects the tools a company runs and turns each one into a *co-sell hook for a specific kind of AWS partner*. The thesis: you don't only sell migrations — every vendor signal is a reason for a different AWS partner (and AWS itself) to want the account. Detect broadly → route each signal to the partner who closes it.

**How a signal is detected (two engines, both evidence-based):**
1. **BuiltWith** (`builtwith-lookup`, `SIGNAL_RULES`) — web-observable tools (analytics, identity SSO, CDN/security, commerce, support, RUM). Credit-metered, cached 60 days. Stores the full tech list in `companies.techstack`; the matched vendors land in `techstack.signals`.
2. **Claude job-ad / GitHub scanner** (`analyzeInnovation`) — *backend* tools that have no web fingerprint (Snowflake, Databricks, CrowdStrike, dbt, vector DBs). Evidence-quoted from careers pages + eng blogs + public repos.

> Re-deriving signals from an already-fetched `techstack` is **free** — credits only ever buy the raw tech list, so the catalog below can grow without re-spending.

---

## The map

| Vendor signal | Category | AWS partner / competency it lights up | Co-sell angle |
|---|---|---|---|
| **Snowflake** | Data warehouse | Data & Analytics partners; Snowflake-on-AWS | Snowflake runs on AWS — joint account, Redshift/Glue/lakehouse expansion or co-managed Snowflake |
| **Databricks** | Lakehouse / ML | Data & Analytics; ML competency | Databricks-on-AWS optimization, MLOps, SageMaker adjacency |
| **Google BigQuery / Looker** | Warehouse / BI (GCP) | Migration + Data partners | Cross-cloud → Redshift/QuickSight displacement play |
| **Segment / Amplitude / Mixpanel** | CDP / product analytics | Data & Analytics; ISV co-sell | Pipe events into an AWS data platform; CDP-on-AWS |
| **Tableau** | Enterprise BI | Data & Analytics | QuickSight adjacency / BI modernization |
| **Datadog / New Relic / Dynatrace / Grafana** | Observability / APM | DevOps & Monitoring competency partners | Observability-on-AWS, cost/perf tuning, CloudWatch/OpenTelemetry |
| **Splunk** | SIEM / logs | Security + DevOps partners | Splunk-on-AWS, security-data-lake on AWS |
| **Sentry / Snyk** | App quality / sec-dev | DevOps / DevSecOps partners | Pipeline security, shift-left on AWS CI/CD |
| **CrowdStrike / Imperva** | Security (EDR / WAF) | Security competency partners | Joint security account; AWS-native security stack |
| **Okta / Auth0 / OneLogin** | Identity / access | Security + Identity partners | IAM/Identity Center integration, Zero-Trust on AWS |
| **OneTrust** | Privacy / consent | GRC / compliance partners | Compliance-on-AWS, data-residency |
| **Cloudflare / Akamai** | CDN / edge security | Networking partners | CloudFront/Shield/WAF migration or multi-CDN |
| **Salesforce** | CRM | Salesforce-on-AWS ISV partners | AWS+Salesforce integration, data sharing, AppFlow |
| **Microsoft Dynamics / Microsoft 365** | CRM / productivity (Microsoft) | Migration + displacement partners | Microsoft-ecosystem account → AWS workload migration / displacement |
| **SAP / NetSuite** | ERP | SAP-on-AWS competency partners | RISE/SAP-on-AWS, ERP modernization |
| **Visma / Fortnox** | Nordic finance/ERP | Alto (Quattro) + integration partners | Back-office automation on AWS; embed agents into the ERP |
| **HubSpot** | Marketing/CRM (SMB) | RevOps / ISV partners | Pipeline + data integration on AWS |
| **Shopify / Magento** | Commerce | Retail / commerce partners | Commerce-on-AWS, peak-scale, headless |
| **Twilio / Intercom / Zendesk** | Comms / CX | CX + contact-center partners | Amazon Connect / GenAI CX, comms-on-AWS |
| **Kubernetes / HashiCorp / Terraform** | Infra / IaC | DevOps + Migration partners | EKS, IaC-on-AWS, platform modernization |

---

## How to use it
- **Filter** companies by a signal (e.g. all SE accounts flagged `Datadog`) → that's a warm list for the observability partner; `Snowflake` → the data partner; `Okta` → the security partner.
- **Microsoft signals** (Dynamics / M365) double as the **cloud-displacement** pool (see `cloud_ecosystem`).
- **BuiltWith Lists API** (`api.builtwith.com`) can also go the other way: "give me every SE site using X with >N employees / >Y revenue" — a reverse prospecting feed per partner.
- **Next build (task #50 finish):** surface `techstack.signals` + this map in the Alloy UI (a "partner hooks" row on the account) and in Smith's grounding ("this account runs Datadog + Snowflake → two co-sell partners").

_Detection catalog lives in `builtwith-lookup` `SIGNAL_RULES` (web) + `analyzeInnovation` (backend). Keep this table and those in sync._
