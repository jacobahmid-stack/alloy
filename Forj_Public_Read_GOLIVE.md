# forj.se "One Free Read" — go-live checklist

Spec: `Forj_Public_Read_Spec.md`. Built + staged 2026-07-01.

## ✅ LIVE 2026-07-02
Steps 1–6 all executed and verified: migrations + fns on the box (smith-read sha 3322460d, claude-proxy sha 0ee46e06), SES production granted (send.forj.se, IAM ses:SendEmail on bedrockInvokeModel), EU-only proven (every read `bedrock:sonnet`), widget merged `landing`@d5e2978 → forj.se live (read.html 200, suggest/teaser verified outside-in with Origin header). Real e2e: AstraZeneca read delivered to Jacob's inbox and approved. Step 7 approval ran as 2×6 sample batches + the live read (~13 reviewed); formal 15-sample freeze as regression fixture = optional follow-up.
Post-live notes: suggest/request/waitlist REQUIRE a forj.se Origin/Referer (anti-scrape, 403 otherwise); "fused words" in SSM-pasted output are a terminal copy artifact (space dropped at each ~146-col wrap), never in the real bytes.

Branches (pushed, nothing live):
- App/backend: `alloy-page` branch **`feature/forj-public-read`** (commit a5638c1) — migrations + claude-proxy `read` task + `smith-read` fn.
- Site: `alloy-page` repo branch **`feature/free-read-widget`** (the alloy-landing working copy; commit 0b9986f) — `#read` widget, `read.html`, legal pages.

## Do this to go live

1. **Migrations to the box** (psql, per `DEPLOY-BOX.md`), in order:
   - `forj_read_public.sql` (tables + RPCs + cleanup fn)
   - `forj_read_cron.sql` (worker drain every 2 min + nightly cleanup)
2. **Edge secrets** (`docker-compose.functions-secrets.yml`, 6-space indent), then `docker compose up -d --force-recreate functions`:
   - `SES_REGION` (e.g. eu-north-1), `SES_AWS_ACCESS_KEY_ID`, `SES_AWS_SECRET_ACCESS_KEY`
   - `READ_NOTIFY_FROM` (a SES-verified from, e.g. `Smith at Forj <smith@forj.se>`)
   - optional: `READ_SALT`, `READ_PUBLIC_BASE` (default https://forj.se), `READ_FN_BASE`
   - Bedrock secrets already present (shared with smith-demo/claude-proxy).
3. **Deploy the two edge fns** to the box (`DEPLOY-BOX.md`): `smith-read` (new, hot-loads) and `claude-proxy` (WARM: `docker compose restart functions` after the file write, per box gotcha). Ask me for the self-verifying paste blobs when ready.
4. **SES**: verify the forj.se domain in SES (EU region), request production access (leave sandbox), IAM user with `ses:SendEmail`. Until then the fn logs "SES not configured" and no mail sends (safe).
5. **Confirm EU-only**: call claude-proxy with `{"task":"read", ...}` and check the response header `x-alloy-via` starts with `bedrock:` (STRICT_TASKS is on). If it 503s, Bedrock is the only path (by design) — fix Bedrock, never fall back.
6. **Site live**: merge `feature/free-read-widget` into `landing` → Amplify deploys forj.se with the widget + `read.html` + legal pages. Confirm `https://forj.se/read.html?s=pending` serves.
7. **15-sample approval (launch gate)**: generate 15 reads (5 per cloud) on known, floor-passing companies via the worker path; review each for grounded-but-wrong judgement; sign off that all are on point; freeze as the regression fixture. Only then is output "on point" per the launch gate.

## Verify (open items from the spec)
- `alloy.forj.se/?demo` "Create your workspace" button must route to **waitlist/invite**, not live tenant creation (launch gate). Check before go-live.
- Teaser floor needs `companies.cloud_ecosystem` + `cloud_confidence` (medium+) + a `contacts.title` for the company. Thin companies correctly fall to the waitlist.
- `legal_form` / `*_source` columns do not exist: sole traders are inferred from the org-nr shape + `employees<10` suppression, and the org-nr is never rendered. Fine as-is; a real `legal_form` would tighten it later.

## Decisions folded in (from the design pass)
- Full read is **emailed after a verify-link (double opt-in)**, never shown inline — the only clean gate against bots burning the read budget.
- Read runs **Bedrock-EU-only, no Anthropic fallback** (the old `alloy_company_read`/web_search path leaks to the US).
- Teaser shows the **program name but no money figure** (no real deal value for a stranger).
- Public read shows a **role, never a named person**; the name/contact/map is the workspace unlock.
- Dedicated **$25/day `read_budget`**, reserve-before-call, isolated from production `claude_budget`.
- One framing call left open: when the rep's cloud differs from the company's detected cloud, the read stays honest about the company's actual cloud (never "move off it"). If you want a more aggressive cross-cloud migration pitch, that is a copy/brand decision to make deliberately.
