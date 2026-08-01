# CloudFront + WAF front door — **APPLIED 2026-08-02 on db.forgeby.com**

> **STATUS: LIVE.** Built straight onto `db.forgeby.com` rather than `db.forj.se`, so the domain
> migration and the security cutover happened once instead of twice (Jacob's call).
>
> | | |
> | --- | --- |
> | Distribution | `E1YMWB7KSH7RTB` -> `d3iqzihvg9i81b.cloudfront.net` |
> | Public name | `db.forgeby.com` (Route53 alias, zone `Z0761206313YI1ZCCA5UJ`) |
> | Origin | `origin.db.forgeby.com` -> 51.21.44.111, Caddy serves it, LE cert |
> | WAF ACL | `forj-db-frontdoor` — RateLimit 2000/5min/IP, CommonRuleSet, KnownBadInputs, IpReputation |
> | Cert | ACM us-east-1 `b0eddbcf-...`, ISSUED |
> | Caching | **DISABLED** (Managed-CachingDisabled). Security front, not a CDN. |
> | Validated | GET 401 = origin, bad apikey 401, OPTIONS 200, POST 400, `Via: Caddy, CloudFront` |
> | `db.forj.se` | **untouched, still 401 direct-to-box.** Nothing was cut over. |
>
> ### Two things the original template below got wrong, found by applying it
>
> **1. `Managed-AllViewer` is the wrong origin request policy here.** It forwards the viewer's Host
> header, so the origin receives `Host: db.forgeby.com` and Caddy needs a site block for the PUBLIC
> name. That drags the box into obtaining a Let's Encrypt cert for a name that points at CloudFront,
> which is NXDOMAIN from the box's point of view. Caddy then loops on ACME forever and fails the TLS
> handshake CloudFront depends on: **502 on every request.** Use
> **`Managed-AllViewerExceptHostHeader`** (`b689b0a8-53d0-40ab-baf2-68738e2966ac`) so the origin sees
> `Host: origin.db.forgeby.com` and never needs a cert for the public name.
>
> **2. Prerequisite 2 was recorded as satisfied and was not.** `origin.db.forj.se` had a DNS record
> but Caddy answered only for `{$PROXY_DOMAIN}`, a single host, so the origin returned 000. Pointing
> a distribution at it would have 502'd. The Caddyfile site address now lists every origin name
> explicitly, and NEVER a public CloudFront-fronted name.
>
> ### Remaining
> Migrate the code from `db.forj.se` to `db.forgeby.com` (6 direct refs; 46 forj.se refs overall),
> then retire `db.forj.se`. Both work today, so there is no urgency and no outage window.
> CloudWatch WAF metrics need `cloudwatch:GetMetricStatistics`, which `claude-box-deploy` lacks; the
> ACL attachment is verifiable from the distribution config instead.

---

**Why this file exists and is not already applied:** the credentials I hold on the box
(`claude-box-deploy`, account 701275662474) are a locked SSM-deploy identity with **zero CloudFront,
WAF, ACM or Route53 permissions** (probed 2026-07-30: `cloudfront:ListDistributions` and
`wafv2:ListWebACLs` both AccessDenied), and the AWS API MCP has no credentials at all. Creating this
front door needs an operator credential I do not have, and self-granting IAM to get it is a line I
will not cross. So this is the exact stack + runbook to paste-and-apply. Jacob authorized the change;
the wall is IAM, not authorization.

**What is already done (safe, in-reach, shipped):** the Alloy app (alloy.forj.se) now carries HSTS,
X-Frame-Options DENY, nosniff, Referrer-Policy and CSP frame-ancestors (commit 8c4adb4, via Amplify
customHeaders). forj.se and alloy.forj.se already sit behind CloudFront (Amplify/S3); WAF on those
static origins is low value and is intentionally skipped.

**Design choice that removes the biggest risk:** CloudFront here is a **transparent WAF + Shield +
origin-cloak front, with caching DISABLED**. All methods and all viewer headers/cookies/query are
forwarded to the origin; nothing is cached. That eliminates any chance of caching an authenticated
response and serving it to another tenant. Edge caching of the public GET reads is a later, separate
optimization, not part of this security change.

## Prerequisites (operator, one-time)
1. **ACM cert for `db.forj.se` in us-east-1** (CloudFront only uses us-east-1 certs), DNS-validated.
2. **An origin hostname that is NOT `db.forj.se`** so CloudFront does not loop into itself. Create
   `origin.db.forj.se` → the box's Elastic IP (the same target `db.forj.se` points at today). The box
   Caddy already answers for any host on 443; confirm it serves `origin.db.forj.se` (add it to
   `{$PROXY_DOMAIN}` if that var is single-host).
3. IAM for the runner: `cloudfront:*`, `wafv2:*`, `acm:DescribeCertificate`, and Route53 (or the
   registrar) for the final CNAME cutover. A scoped policy is fine; these are the actions the stack uses.

## The stack (CloudFormation, us-east-1)

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Description: WAF + CloudFront transparent front door for db.forj.se (caching disabled)
Parameters:
  OriginDomainName: { Type: String, Default: origin.db.forj.se }
  AcmCertArn:       { Type: String }   # us-east-1 cert covering db.forj.se
Resources:
  WebACL:
    Type: AWS::WAFv2::WebACL
    Properties:
      Name: forj-db-frontdoor
      Scope: CLOUDFRONT
      DefaultAction: { Allow: {} }
      VisibilityConfig: { SampledRequestsEnabled: true, CloudWatchMetricsEnabled: true, MetricName: forj-db-acl }
      Rules:
        - Name: RateLimit
          Priority: 0
          Action: { Block: {} }
          Statement: { RateBasedStatement: { Limit: 2000, AggregateKeyType: IP } }   # req / 5 min / IP; protects the $900 spend cap
          VisibilityConfig: { SampledRequestsEnabled: true, CloudWatchMetricsEnabled: true, MetricName: rate }
        - Name: CommonRuleSet
          Priority: 1
          OverrideAction: { None: {} }
          Statement: { ManagedRuleGroupStatement: { VendorName: AWS, Name: AWSManagedRulesCommonRuleSet } }
          VisibilityConfig: { SampledRequestsEnabled: true, CloudWatchMetricsEnabled: true, MetricName: common }
        - Name: KnownBadInputs
          Priority: 2
          OverrideAction: { None: {} }
          Statement: { ManagedRuleGroupStatement: { VendorName: AWS, Name: AWSManagedRulesKnownBadInputsRuleSet } }
          VisibilityConfig: { SampledRequestsEnabled: true, CloudWatchMetricsEnabled: true, MetricName: badinputs }
        - Name: IpReputation
          Priority: 3
          OverrideAction: { None: {} }
          Statement: { ManagedRuleGroupStatement: { VendorName: AWS, Name: AWSManagedRulesAmazonIpReputationList } }
          VisibilityConfig: { SampledRequestsEnabled: true, CloudWatchMetricsEnabled: true, MetricName: iprep }
  Distribution:
    Type: AWS::CloudFront::Distribution
    Properties:
      DistributionConfig:
        Enabled: true
        Aliases: [ db.forj.se ]
        WebACLId: !GetAtt WebACL.Arn
        ViewerCertificate: { AcmCertificateArn: !Ref AcmCertArn, SslSupportMethod: sni-only, MinimumProtocolVersion: TLSv1.2_2021 }
        Origins:
          - Id: box
            DomainName: !Ref OriginDomainName
            CustomOriginConfig: { OriginProtocolPolicy: https-only, OriginSSLProtocols: [ TLSv1.2 ] }
        DefaultCacheBehavior:
          TargetOriginId: box
          ViewerProtocolPolicy: redirect-to-https
          AllowedMethods: [ GET, HEAD, OPTIONS, PUT, PATCH, POST, DELETE ]
          CachePolicyId: 4135ea2d-6df8-44a3-9df3-4b5a84be39ad          # Managed-CachingDisabled
          OriginRequestPolicyId: 216adef6-5c7f-47e4-b989-5492eafa07d3  # Managed-AllViewer (forwards everything)
```

## Runbook (zero-downtime, with rollback)
1. Apply the stack (`aws cloudformation deploy --template-file … --stack-name forj-db-frontdoor
   --parameter-overrides AcmCertArn=… --capabilities CAPABILITY_NAMED_IAM --region us-east-1`).
2. **Validate on the `*.cloudfront.net` domain BEFORE any DNS change**: a public GET
   (`/rest/v1/…` health) AND a real authenticated POST through the distribution domain, confirming
   the app's JWT/headers pass and responses are correct. Confirm WAF is counting (CloudWatch metrics).
3. Only then cut `db.forj.se` CNAME → the distribution domain. Keep the DNS TTL low (60s) for the
   cutover so rollback is fast.
4. Watch for 5 minutes: app loads, auth works, no 4xx spike from the rate rule (tune `Limit` up if
   legit traffic trips it). **Rollback = flip the CNAME back to the box IP** (that is why TTL is low).

## Honest scope note
The high-value control here is the **rate-based rule + managed rulesets + Shield Standard (free) +
origin-cloak**. Note that some abuse vectors are ALREADY mitigated in-app: claude-proxy enforces a
global + per-tenant spend cap, and the 2026-07 security pass gated the anon-reachable functions. So
this front door is defense-in-depth, not the only thing standing between an attacker and the box.
Cost is small (a WAF web ACL fee + per-rule + per-request, plus CloudFront request/transfer);
confirm current AWS pricing before committing.
