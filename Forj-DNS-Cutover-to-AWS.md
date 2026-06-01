# forj.se — cut over from Netlify (paused) to AWS S3 + CloudFront

**Why:** Netlify team is **paused (credit limit exceeded)** → forj.se returns 503. Moving the site to AWS (S3 + CloudFront) — the direction already chosen — fixes the outage and is what the repo deploys to.

**⚠️ DO NOT LOSE EMAIL.** `jacob@forj.se` runs on this domain via **one.com**:
- `MX  forj.se → c2doo8kfj.mx.service.one`
- `TXT forj.se → v=spf1 include:_spf.one.com -all`
These MUST be recreated exactly in the new DNS, or email stops. Recreate them **first**.

---

## Current state
- **Registrar:** forj.se (registered at one.com, per the one.com mail records).
- **Nameservers:** Netlify DNS — `dns1.p06.nsone.net` … `dns4.p06.nsone.net`.
- **Netlify project:** `forj-final` (Site ID c35663b2-11b3-44c7-a0a2-22e5e8a71760), **paused**.
- **DNS records (Netlify):**
  | name | type | value |
  |---|---|---|
  | forj.se | NETLIFY | forj-final.netlify.app |
  | www.forj.se | NETLIFY | forj-final.netlify.app |
  | forj.se | MX | c2doo8kfj.mx.service.one |
  | forj.se | TXT | v=spf1 include:_spf.one.com -all |
  | forj.se | TXT | google-site-verification=v4E46_fICRaFIejrYOqusp9BdzWzbXk-S9YvB3aOUhA |

## Target state
- DNS on **Amazon Route 53**; apex + www **ALIAS → CloudFront**; CloudFront origin = the **S3 bucket** the GitHub Action deploys to; **ACM cert (us-east-1)**. Email (MX/SPF) + google-verification carried over unchanged.

---

## Runbook (order matters; email-safe)

**1. Confirm the site is on S3.** In the AWS account, open the bucket the Action deploys to (`S3_BUCKET_NAME` in the repo's GitHub vars/secrets). It should contain `index.html`, `privacy.html`, `robots.txt`, `sitemap.xml` (pushed already). If empty, re-run the GitHub Action (Deploy Static Site to S3).

**2. ACM certificate (region us-east-1 — required for CloudFront).** Request a public cert for **`forj.se` and `www.forj.se`**, DNS-validated. (You'll add its validation CNAMEs in step 4.)

**3. CloudFront distribution.**
- Origin: the S3 bucket (use **OAC** + a private bucket, or the S3 *website endpoint* if you keep it public).
- Alternate domain names (CNAMEs): `forj.se`, `www.forj.se`.
- SSL cert: the ACM cert from step 2.
- **Default root object: `index.html`.**

**4. Route 53 hosted zone for `forj.se`.** Create it, then add **every** record:
  | name | type | value |
  |---|---|---|
  | forj.se | **A — Alias** | → the CloudFront distribution |
  | www.forj.se | **A — Alias** | → the CloudFront distribution |
  | forj.se | **MX** | `10 c2doo8kfj.mx.service.one` *(preserve — email)* |
  | forj.se | **TXT** | `v=spf1 include:_spf.one.com -all` *(preserve — email)* |
  | forj.se | **TXT** | `google-site-verification=v4E46_fICRaFIejrYOqusp9BdzWzbXk-S9YvB3aOUhA` *(preserve)* |
  | _acme…_ | **CNAME** | the ACM validation record(s) from step 2 |

**5. Switch nameservers at the registrar (one.com).** Change forj.se's nameservers from the Netlify set (`dns1–4.p06.nsone.net`) to the **4 Route 53 nameservers** shown on your new hosted zone. *This is the switch that takes you off Netlify.*

**6. Verify** (after propagation, minutes–hours):
- `https://forj.se/` loads the new site with the Alloy section.
- `https://www.forj.se/` works.
- **Email still flows** — send a test to jacob@forj.se. `dig MX forj.se` should still show `service.one`.

---

## The honest interim
Cert validation + nameserver propagation take **anywhere from ~30 min to a few hours**. Until the cutover completes, forj.se stays down (Netlify paused). Options:
- **Bridge it:** temporarily upgrade Netlify to un-pause (costs money) — only if you need it up this instant.
- **Just cut over:** accept a short window down and land on AWS (free-tier S3/CloudFront ≈ pennies). Recommended, since you're leaving Netlify anyway.

## Repo-side I can do for you
- Add a **CloudFront cache-invalidation** step to the deploy workflow (so each push shows instantly) — send me the **CloudFront distribution ID** once it exists.
- Anything else in the repo (redirects, headers, a `404.html`, etc.).
