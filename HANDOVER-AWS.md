# ALLOY by FORJ — AWS Infrastructure Handover

**For:** Anders @ Novalo
**From:** Jacob (with Claude Code)
**Date:** 2026-05-31
**Repo:** https://github.com/jacobahmid-stack/alloy (private — request collaborator access)

---

## 0. TL;DR — what to do first

Two tracks, both small. **Track A** provisions the AWS IAM identity that unblocks the Partner
Central integration. **Track B** moves the *frontend only* (the Alloy app + www.forj.se) to AWS
S3+CloudFront — **the Supabase backend stays put.** Do A first; it's the documented blocker.

| Track | What | Effort | Why |
|---|---|---|---|
| **A. IAM + Partner Central** | Provision a dedicated IAM identity, set 3 secrets, migrate the Partner Central account to the AWS console | ~hours | Unblocks `pc-mcp` / the AWS funding agent. The whole "hand pre-qualified opportunities to AWS" thesis depends on this. |
| **B. Host frontend on AWS** | Deploy the static Alloy app (and **www.forj.se**) to **S3 + CloudFront**. **Backend stays on Supabase** — no DB/function migration. | ~days | Own the public web tier on AWS; the app still talks to the existing Supabase backend. |

**Do NOT zip the working folder.** Use the GitHub repo (Jacob will add you as a collaborator).
A naïve zip of the folder is **107 MB** of `node_modules` + a duplicate copy; the actual source is
**~170 KB**. `git clone` gives you exactly the right files, version-controlled.

---

## 1. What Alloy is (one paragraph)

A B2B prospecting platform that (1) detects which companies run AWS — even behind Cloudflare,
(2) scores them for AWS funding-program fit **before an opportunity exists** (the moat), and
(3) hands pre-qualified opportunities into **AWS Partner Central**, where AWS's own agent makes the
authoritative funding call. We sit **upstream** of Partner Central; we don't rebuild it.

Two customer projects live in the DB today: **alto** and **novalo**.

---

## 2. Current architecture (what's running now)

```
  Browser (single-file React app, src/forge.jsx)
        |  HTTPS, anon JWT
        v
  Supabase Edge Functions (Deno)  ──────────────►  Anthropic API (claude-proxy only)
        |                          ──────────────►  BuiltWith API (builtwith-lookup)
        v
  Supabase Postgres  +  pg_cron (4 jobs)  +  pg_net (server-side fn calls)
```

- **Frontend:** one React file (`src/forge.jsx`, ~5,100 lines), built with Vite. Config is injected
  at runtime via `window.__ALLOY_SUPABASE__` and `window.__ALLOY_CLAUDE_PROXY__` (see `src/main.jsx`).
  Currently a static build; hostable on any static host (today: not formally hosted / run locally).
- **Backend:** 15 Supabase edge functions (all in `supabase/functions/`, now all in git — see §4).
- **DB:** Postgres. Schema captured in `supabase/migrations/`. Key fact: **`companies.id` is TEXT**
  (e.g. `19e700817…`, `disc-…`, `nn-…`), not bigint — all foreign keys are text.
- **Project ref:** `nvjizahtcqgmfhiodtej` · URL `https://nvjizahtcqgmfhiodtej.supabase.co`

---

## 3. Secrets / environment (full list)

See `.env.example` for the authoritative list with descriptions. Summary of what must exist
wherever the functions run:

| Secret | Used by | Notes |
|---|---|---|
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | most functions | auto-injected on Supabase; provide manually on AWS |
| `SUPABASE_DB_URL` | `se-ingest`, `se-stage`, `se-process`, `registry-search` | direct Postgres connection |
| `ANTHROPIC_API_KEY` | `claude-proxy` | **the cost driver** — all LLM spend flows here |
| `BUILTWITH_API_KEY` | `builtwith-lookup` | PAID, credit-metered; omit to disable |
| `ALLOY_GATEWAY_JWT` | `bulk-enrich`, `aws-discovery` | optional; falls back to embedded anon JWT |
| `PC_AWS_ACCESS_KEY_ID/SECRET/SESSION_TOKEN` | `pc-mcp` | **not set yet** — Track A provisions these |
| `ALLOWED_MODELS`, `MAX_TOKENS_CAP`, `STRICT_TASKS` | `claude-proxy` | guardrails; keep `STRICT_TASKS=false` until public |

⚠️ The anon/publishable JWT appears in committed code and cron SQL **by design** — it's the public
key that ships to browsers. The **service-role key and `ANTHROPIC_API_KEY` are the real secrets** and
are NOT in the repo. Earlier exposed AWS credentials are **BURNED** — never reuse them.

---

## 4. Edge functions (15) — all now in `supabase/functions/`

> ⚠️ **Important:** 6 of these were live in production but were NOT in git until this handover
> (`aws-detect`, `builtwith-lookup`, `registry-search`, `se-ingest`, `se-stage`, `se-process`).
> They are now captured. The repo is the complete picture.

| Function | Cost | Purpose |
|---|---|---|
| `claude-proxy` | 💰 Anthropic | Hardened LLM gateway. Task-bound system prompts, model/token caps. ALL AI spend. |
| `funding-eligibility` | free | **The killer feature.** Deterministic AWS funding-track + score (P2/P4). Report-only by default; `{apply:true}` writes. |
| `aws-origin-detect` | free | AWS-behind-Cloudflare detector (CT logs → DoH → AWS IP ranges). Feeds the time-series. |
| `cloud-detect` | free | Multi-cloud (AWS/GCP/Azure) ASN classifier. |
| `aws-detect` | free | DNS/IP cloud heuristics + batch writer. **Cron: every 5 min.** |
| `builtwith-lookup` | 💰 BuiltWith | Tech-stack enrichment, credit-safe gating. **Cron: every 5 min.** |
| `web-fetch` | free | Page fetch — text mode + `mode:"tech"` fingerprint surface. |
| `bulk-enrich` | 💰 (calls claude-proxy) | Batch enrichment: cloud + tech + Data&AI innovation deep-scan. |
| `aws-discovery` / `aws-discovery-approve` | 💰 | Discovery agent — finds new SE companies on AWS. **Cron: daily.** |
| `registry-search` | free | Live NO (Brønnøysund) + SE (SCB) company registry search. |
| `se-ingest` / `se-stage` / `se-process` | free | SCB bulk-file (~1.8M orgs) loader pipeline → `se_registry` (489k rows). |
| `pc-mcp` | free | **NOT DEPLOYED.** Partner Central MCP client (Track A). See §6. |

---

## 5. Scheduled jobs (pg_cron) — captured in `migrations/20260531100005_cron_jobs.sql`

| Job | Schedule | Calls | Cost |
|---|---|---|---|
| `builtwith-enrich-batch` | every 5 min | `builtwith-lookup` (30/run) | 💰 **continuous BuiltWith spend** |
| `cloudcheck-batch` | every 5 min | `aws-detect` (40/run) | free |
| `aws-discovery-morning` | daily 06:13 UTC | `run_aws_discovery_daily()` | 💰 |
| `origin-rescan-weekly` | Mon 03:00 UTC | `schedule_origin_rescan(false,20)` | free |
| `funding-score-batch` | every 30 min | `funding-eligibility` (unscored_only) | free |

⚠️ **`builtwith-enrich-batch` spends BuiltWith credits every 5 minutes.** If you want to pause spend:
`select cron.unschedule('builtwith-enrich-batch');`

---

## 6. TRACK A — IAM identity + Partner Central (do this first)

This is the documented blocker for the funding-agent handoff (`pc-mcp`). Three steps:

### 6.1 Provision a dedicated IAM identity
- Create a **dedicated IAM user or role used ONLY by the `pc-mcp` edge function** — NOT the human
  SSO login (`jacob@novalo.se`, account `497260983102`, alias `novalo`, currently ViewOnlyAccess).
- Attach the least-privilege policy at **`supabase/functions/pc-mcp/IAM_POLICY.json`** — this was
  **verified against the AWS Partner Central Getting Started Guide (© 2026)**, not guessed.
  - Managed-policy shortcut alternative: `PartnerCentralIncentiveBenefitManagement` +
    `AWSPartnerCentralSandboxFullAccess` (dev) — simpler than the custom JSON.
- Generate access keys → set as Supabase secrets `PC_AWS_ACCESS_KEY_ID` / `PC_AWS_SECRET_ACCESS_KEY`
  (or use web-identity federation → short-term STS creds, the better option). Supabase runs outside
  AWS, so there is no instance role.

### 6.2 Migrate the Partner Central account to the AWS console
- Prerequisite for the MCP server AND the funding agent to exist at all.
- Existing partners must **NOT** register a new account. The **Alliance Lead** migrates the existing
  account to the AWS console experience. **Action: find out who Novalo's Alliance Lead is and confirm
  migration status.** (Guide §"Migrating to Partner Central in the AWS Console".)

### 6.3 Deploy + test pc-mcp
- Once 6.1 + 6.2 are done: deploy `pc-mcp`, then test against the **Sandbox** catalog first:
  `curl -X POST "$FN_URL" -d '{"text":"Hello, what can you help me with?","catalog":"Sandbox"}'`
- Endpoint is **us-east-1 only**; sessions expire after **48 h** (persist state in our DB);
  **all writes require human approval** (the agent only drafts a fund request + returns a portal
  link — a human submits). Never pass AWS creds in tool params — SigV4 at the transport layer.
- Until the identity exists, `pc-mcp` returns **HTTP 403 on `partnercentral:UseSession`** — that 403
  is expected confirmation the permission set is the blocker, not a code bug.

**Constraint for whoever runs this:** Claude Code must NOT create AWS accounts/identities or change
permission sets — that is Anders's / Jacob's task. The repo only contains the *policy to attach*.

---

## 7. TRACK B — Host the frontend on AWS (backend stays on Supabase)

**Scope:** only the **static web tier** moves to AWS. The whole backend — Postgres, all 15 edge
functions, pg_cron, storage — **stays on Supabase, unchanged.** The built app is self-contained: it
has the Supabase URL + anon key baked in (`src/forge.jsx`, the `window.__ALLOY_SUPABASE__` fallback)
and calls Supabase directly over HTTPS. So there is **no DB migration, no function porting, no auth
migration.** Two separate sites move:

1. **Alloy app** (this repo, `npm run build` → `dist/`) → S3 + CloudFront.
2. **www.forj.se** (the company marketing site — *separate codebase, not in this repo*) → its own
   S3 + CloudFront.

### 7.1 Alloy app → S3 + CloudFront
| Piece | AWS service | Notes |
|---|---|---|
| Static files | **S3** (private bucket) | `npm run build` → upload `dist/`. Keep the bucket private. |
| CDN / TLS | **CloudFront** + **OAC** (Origin Access Control) | Serves the private S3 bucket; HTTPS + caching. |
| Certificate | **ACM** in **us-east-1** (CloudFront requirement) | For the app domain (e.g. `app.forj.se`). |
| DNS | **Route 53** (or current registrar) | Alias the subdomain to the CloudFront distribution. |
| SPA fallback | CloudFront custom error responses | Map 403/404 → `/index.html` (200) so deep links / refresh work. |

### 7.2 www.forj.se → S3 + CloudFront
Same pattern, separate bucket + distribution + ACM cert for `forj.se` + `www.forj.se`. Source isn't
in this repo — get it from wherever the marketing site currently lives.

### Deploy sequence (Alloy app)
1. `npm install && npm run build` → produces `dist/`.
2. Create a **private S3 bucket**; `aws s3 sync dist/ s3://<bucket>/ --delete`.
3. Create a **CloudFront** distribution, S3 origin via **OAC**, default root object `index.html`,
   add the 403/404 → `/index.html` error responses.
4. Request an **ACM cert in us-east-1** for the app subdomain; attach to the distribution.
5. Point **Route 53** at the distribution. Done — app loads from AWS, talks to Supabase.

### Two cutover checks (both quick)
- **Supabase Auth redirect URLs:** add the new AWS domain in Supabase → Authentication → URL
  Configuration (**Site URL** + **Redirect URLs**), or magic-link / password-reset emails bounce to
  the old origin. *This is the only Supabase-side change in the entire move.*
- **CORS:** none needed — the edge functions already return `Access-Control-Allow-Origin: *`.

### Out of scope (optional, much later)
A full backend re-host (Postgres→Aurora, functions→Lambda, Auth→Cognito, cron→EventBridge) is a
separate future project, **not part of this move** — the backend stays on Supabase. If it's ever
revisited, the hard invariants to carry over: **`companies.id` and all FKs are TEXT, not bigint**;
the `se-*` / `registry-search` functions use a direct Postgres connection (`SUPABASE_DB_URL`), not
the REST API; and `claude-proxy` must stay the single Anthropic egress point.

---

## 8. Data volumes (reference — data stays on Supabase; no migration in this move)

| Table | Rows | Note |
|---|---|---|
| `se_registry` | ~489,000 | SCB Swedish company registry (the big one) |
| `companies` | ~1,482 | core CRM table (incl. archived) |
| `contacts` | ~638 | |
| `funding_eligibility` | 546 | P2 scores (deterministic) |
| `origin_scan_results` | ~517 | append-only cloud-migration time-series |
| `company_signals` | ~282 | Data&AI evidence rows |
| `funding_config` | 6 | tunable heuristics (dollar floors, sector tiers) |
| `projects` | 2 | alto, novalo |
| `alloy_backup_*` | ~1,350 | **backup tables — can be dropped after migration** |

---

## 9. Where to look in the repo

```
src/forge.jsx                     # the entire frontend (single file)
src/main.jsx                      # runtime config injection (Supabase URL, proxy)
supabase/functions/<name>/index.ts# the 15 edge functions
supabase/migrations/*.sql         # schema + cron (apply in filename order)
supabase/functions/pc-mcp/
   ├─ index.ts                    # Partner Central MCP client (gated)
   └─ IAM_POLICY.json             # ⭐ verified least-privilege policy for Track A
.env.example                      # every secret + where it's used
HANDOVER-AWS.md                   # this file
```

Memory/context for the funding platform design decisions also lives in the project history; ask Jacob
for the `alloy-funding-platform.md` notes if you want the full rationale (P1–P6, the verified guide
facts, and the correction history).

---

## 10. Open questions for Anders / Jacob

1. **Track A or B first?** Recommendation: A now (small, unblocks Partner Central), B as a planned project.
2. **Who is Novalo's Alliance Lead?** Needed for the Partner Central console migration (6.2).
3. **AWS account for the platform** — same `novalo` account (`497260983102`) or a dedicated one?
4. **BuiltWith spend** — leave the every-5-min cron running, or pause until needed? (§5)
5. **Region** — Partner Central MCP is us-east-1 only; pick the platform's primary region with that in mind.
