# Alloy migration agent — v2: ADS direct-pull (no CSV)

**Goal:** instead of the rep exporting a CSV and importing it (v1, live now), Alloy pulls a customer's AWS discovery data **directly via the ADS API** using a **cross-account read-only role**, then runs the measured assessment automatically.

**Status:** v1 (CSV import → measured assessment) is **live**. v2 below is **designed, not yet built** — it belongs on the **AWS-native Alloy** (it needs an AWS principal to assume the customer's role). Build it there.

---

## Why v2 lands on AWS-native Alloy (not Supabase)
Cross-account access works by Alloy **assuming a role the customer creates**. To assume it, Alloy must itself be an **AWS principal**:
- **Supabase today:** no AWS identity → would require stashing long-lived Forj IAM keys in a secret (avoid).
- **AWS-native Alloy:** the app's Lambda/Fargate **execution role** assumes the customer role natively — **no stored keys, short-lived creds, auditable.** This is the clean home for v2.

---

## Architecture (data flow)
1. Rep enters the customer's **role ARN + ExternalId + region** on the account (one-time).
2. Alloy's execution role calls **`sts:AssumeRole`** on the customer role (with the ExternalId) → 1-hour creds.
3. With those creds, call **ADS read APIs** (below) → server inventory, specs, utilization, dependencies.
4. **Normalize** to the same `inventory` shape v1's CSV path produces.
5. Feed into `migrationAssessment({ measured })` → the measured 7-R + right-sizing + TCO, automatically.
   *(Same downstream as v1 — only the data source changes.)*

## ADS APIs (service prefix `discovery:`)
- **Lightweight (pure read, preferred first):** `DescribeConfigurations`, `ListConfigurations` (SERVER/APPLICATION/PROCESS), `GetDiscoverySummary`, `DescribeAgents`.
- **Rich utilization/dependencies (export path):** `StartExportTask` → poll `DescribeExportTasks` → read the export from the customer's **S3** (`s3:GetObject`). Gives time-series utilization + network dependencies for wave grouping.
- *Confirm the exact action list + the ADS home region with AWS before locking the policy.*

---

## Customer-side IAM (hand this to the customer — the real unblocker)

**1) Trust policy** — lets *only* Alloy assume it, guarded by an ExternalId (anti–confused-deputy):
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "AWS": "arn:aws:iam::<ALLOY_AWS_ACCOUNT_ID>:role/<alloy-execution-role>" },
    "Action": "sts:AssumeRole",
    "Condition": { "StringEquals": { "sts:ExternalId": "<unique-per-customer-id>" } }
  }]
}
```

**2) Permissions policy** — read-only discovery (+ S3 read only if using the export path):
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ADSReadOnly",
      "Effect": "Allow",
      "Action": [
        "discovery:Describe*", "discovery:List*", "discovery:Get*"
      ],
      "Resource": "*"
    },
    {
      "Sid": "ADSExportStartAndRead",
      "Effect": "Allow",
      "Action": ["discovery:StartExportTask", "discovery:DescribeExportTasks"],
      "Resource": "*"
    },
    {
      "Sid": "ExportBucketRead",
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:ListBucket"],
      "Resource": ["arn:aws:s3:::<ads-export-bucket>", "arn:aws:s3:::<ads-export-bucket>/*"]
    }
  ]
}
```
*(Drop the last two statements for a pure-read, no-export pull.)*

---

## Build plan (on the AWS-native Alloy repo)
1. A function/Lambda `ads-pull({ roleArn, externalId, region })`: AssumeRole → ADS read → normalize → return `inventory`.
2. Store the role ARN + ExternalId on the account (encrypted).
3. Smith Migration Kit: add **"Pull from AWS Discovery"** beside "Refine with measured data (CSV)". It calls `ads-pull` → runs the measured assessment with zero manual export.
4. Keep **v1 CSV import** as the fallback for customers who won't grant a role.
5. Generate a **unique ExternalId per customer** + render the two IAM JSON blocks above pre-filled, so the rep hands the customer a copy-paste setup.

**Testing:** needs (a) Alloy's AWS execution role (from the AWS migration), (b) a customer's cross-account role, (c) real ADS data. Validate on the first live deal; until then v1 (CSV) carries it.
