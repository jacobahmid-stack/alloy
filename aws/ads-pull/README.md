# ads-pull — Alloy v2 migration agent (cross-account ADS reader)

Portable AWS artifacts for v2 of the migration agent. **Built standalone so they drop into the
AWS-native Alloy repo unchanged** — they don't depend on the app codebase. (v1, the CSV import →
measured assessment, is already live in the app.)

> **Status: untested until first deploy.** The architecture (assume-role → ADS read → return raw)
> is correct; validate the ADS **region** and field coverage against live data on the first real pull.
> For utilization time-series (better right-sizing) add the export path later (StartExportTask → S3).

## What it does
1. Alloy POSTs `{ roleArn, externalId, region }` (+ `x-alloy-secret` header) to the Function URL.
2. The Lambda assumes the **customer's** cross-account **read-only** role.
3. Reads ADS: `GetDiscoverySummary`, `ListConfigurations(SERVER)`, `DescribeConfigurations`.
4. Returns `{ summary, serverCount, servers }` — raw ADS configs.
5. Alloy passes `servers` as the `inventory` to `migrationAssessment({ measured })` → real 7-R + right-sizing + TCO. No CSV.

## Deploy (Novalo/AWS account)
```bash
cd aws/ads-pull
sam build
sam deploy --guided --parameter-overrides AlloySharedSecret=$(openssl rand -hex 24)
```
Note the two outputs: **FunctionUrl** (give to Alloy) and **ExecutionRoleArn** (the customer trusts this).

## Customer setup (hand them this)
Create a read-only role in the customer's AWS account whose **trust policy** names the **ExecutionRoleArn**
above as Principal + a unique **ExternalId**, with read-only `discovery:Describe*/List*/Get*` permissions.
Full templates are in `../../Alloy-ADS-DirectPull-v2.md`.

## Wire into Alloy (apply in the AWS-native Alloy repo)
Add a **"Pull from AWS Discovery"** action to the Migration Kit (beside CSV "Refine with measured data"):
- POST `{ roleArn, externalId, region }` + `x-alloy-secret` to the FunctionUrl.
- Pass the returned `servers` JSON as `inventory` to `migrationAssessment({ company, project, inventory })`.
- Store the customer's roleArn + externalId on the account.
This wiring is intentionally NOT added to the current GitHub-Pages repo (would diverge from the AWS repo);
it goes into the migrated repo when it arrives.

## Security notes
- Function URL is `AuthType: NONE` + shared secret for simplicity. Once Alloy runs on AWS and can SigV4-sign,
  switch to `AWS_IAM`.
- The exec-role `sts:AssumeRole` is scoped to `arn:aws:iam::*:role/alloy-ads-*`. Tighten to your exact convention.
