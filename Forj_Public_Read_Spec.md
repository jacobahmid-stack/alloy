Both facts confirmed: `alloy_company_read` calls the box proxy with `{ web: true }` (forces Anthropic US + fallback), and `scoring.js` has NO `alloy_funding_fit`/`cloudProgram`/`playCloud`/`cloudEco`/`accountCloud` exports — only `estimateFunding` (requires `oppValueSEK`) and `icpScore`. This validates the critical/major verify findings. I have what I need to write the reconciled spec.

# forj.se "One Free Read" — Build-Ready Spec

## 1. Concept

A public band on forj.se where a visitor names one company and the cloud they sell, and gets a real, specific read the way Smith produces it: which cloud the company runs, the stack on top, the ICP fit, the funded play named in that cloud's own program, and the role to target. An instant deterministic TEASER (no paid model, assembled from already-detected fields) proves the read is real and worth an email. The visitor then submits an email, confirms it via a one-click verification link (double opt-in), and only then does a single EU-resident, no-fallback Smith read get queued, quality-gated, and emailed. The named person, direct contact, and full stakeholder map never appear in public; they are the reason to come inside a workspace, and until the launch gate opens that "workspace" CTA routes to a waitlist. The whole design is engineered so the pre-email path can never move a cent of paid-model budget, no unverified email can trigger spend, and no personal data or licensed data leaves the EU or reaches a stranger.

## 2. Locked decisions

- **Q1 (contact boundary).** Public read shows the ROLE/persona to target + why. The named person, contact, and full stakeholder map unlock only inside an authenticated workspace.
- **Q2 (access model).** Value-first. An instant, cheap TEASER with NO paid LLM is shown free; the full Smith read is gated behind an email.
- **Q3 (coverage).** Instant read only for KNOWN/resolvable companies; unknown or thin-data companies get a "we will prepare your read" capture (waitlist).
- **Launch gate.** No self-serve tenant creation. Every "workspace" CTA routes to waitlist/invite. Primary conversion now = email + waitlist.
- **Brand.** Industrial-forge: muted steel-violet (`#4B3CA0` / `#9E92D8` dark), `--ember` `#D9722E` as forge accent only, Space Grotesk headings, Space Mono labels, Inter body, material over glow, iron hairline edges. No em dashes anywhere. Buyer language, never engineer jargon.
- **Double opt-in is the paid-spend gate (RESOLVES the funnel-vs-security contradiction).** No paid model call fires until an email is verified via link. The on-page states after email submit show "check your email", never a synchronous read. The full read is delivered by email only.
- **Full read model path is Bedrock-EU-only, no web_search, no Anthropic fallback (RESOLVES the critical EU-residency contradiction).** The read does NOT use `alloy_company_read`/web_search (which the box `claude-proxy` forces to Anthropic US and falls back to Anthropic on any Bedrock error). It uses a new dedicated `read` task on `claude-proxy` that runs Bedrock-EU-only over stored/grounded fields, with `x-alloy-via` asserted `bedrock:*` before send. We accept a less-live read in exchange for real EU residency. If Jacob ever wants web grounding, that is a separate future decision requiring an Anthropic-US sub-processor + SCCs on the DPA and gating the visitor email out of the same call; it is out of scope for launch.
- **Teaser is deterministic and uses ONLY verified pure exports (RESOLVES the funding-estimate hallucination + naming findings).** `alloy_funding_fit` and `alloy_company_read` are MCP tools, not importable pure functions, and `scoring.js` has no `cloudProgram`/`playCloud`/`cloudEco`/`accountCloud`/`isTooLarge`/`techBand` exports today (confirmed: it exports `estimateFunding(program, oppValueSEK, opts)` and `icpScore(c, hasContact)`). The teaser therefore uses only: `icpScore` (pure), plus a small pure cloud→program name map and cloud/stack readers added to the edge function itself (mirrored from the app, not imported cross-repo). **The teaser shows NO funding figure**, because `estimateFunding` needs an `oppValueSEK` a stranger's company does not have; showing one would be fabricating a number. The teaser shows the program NAME only. Any funding figure is workspace-only, where a real opp value exists.
- **Dedicated public budget ledger with atomic reserve (RESOLVES the budget-isolation + race findings).** The paid read draws from a new `read_budget` singleton (mirroring `smith_demo_budget`), never the production `claude_budget`. Spend uses reserve-before-call (`read_budget_reserve`), not `claude-proxy`'s check-then-add, so concurrent reads cannot race past the cap.
- **New minimal capture table `forj_read_capture` (RESOLVES the forj-contact reuse findings).** `forj-contact` hard-requires name+email+message and fires Slack/Resend to US processors with no retention; we do not reuse it. New table has its own minimal schema, consent semantics, retention TTLs, and an EU mailer for the verify + read emails.
- **Budget-exhausted behavior = waitlist, always (RESOLVES the divergent fallback findings).** When the read budget is exhausted or the read fails the gate twice, the visitor is routed to "we will prepare your read", never shown a degraded/deterministic-assembled free-text read.
- **Repo map is authoritative (RESOLVES path drift).** Landing = `C:\Users\jacob\alloy-landing\index.html`. App + edge functions + `scoring.js`/`smith-eval.js`/`smith-slop.js`/`smith-linkedin.js` = `C:\Users\jacob\alloy-page`. The box (db.forj.se) deploys edge functions per `DEPLOY-BOX.md`, NOT the managed dashboard/Supabase-MCP.

## 3. End-to-end user flow

### Shared step 0: resolve + completeness (free, no paid model, no outbound fetch)

On submit, the new `smith-read` edge function (`action:"teaser"`) does a narrow read-only lookup on `public.companies` (`select name, domain, city, orgnr, employees, revenue, legal_form, enrichment(cloud_ecosystem, cloud_confidence, cloud_source, tech_stack, tech_stack_source, maturity_band), decision_makers(title, source)` — never `select=*`, never the `techstack` jsonb; bulk-load gotcha). It classifies:

- **KNOWN & complete** if it passes the completeness hard floor (section 7) AND is not suppressed (sole-trader / small-company, section 8).
- **THIN / UNKNOWN / suppressed** otherwise.

No paid model, no URL fetch. This is the value-first cheap teaser.

### Path A — known/instant

1. **Teaser card** renders in place from stored fields + `icpScore` + the pure program-name map. Shows cloud verdict, one stack signal, ICP band, the program name, and the role (subject to suppression). Two lines are blurred: "Who to target" and "The play". No funding figure.
2. **Email gate.** Visitor enters a work email + ticks explicit consent. `smith-read` (`action:"request"`) validates + honeypot, writes a `forj_read_capture` row `status:'pending_verify'` with `verify_token_hash`, consent flag+timestamp+purpose-version, and sends a verify email via the EU mailer. **No paid call.** On-page state flips to "Check your inbox."
3. **Verify.** Visitor clicks the emailed link → `smith-read` (`action:"verify"`, GET) validates the single-use 24h token → `status:'verified'` → enqueues `status:'queued'` → redirects browser to `forj.se/read/pending`. Still no synchronous paid call.
4. **Worker (service-role, cron-gated) drains `queued` rows.** Per-email throttle check → `read_budget_reserve(est)`; if refused, leave `queued` and email "Smith is at capacity today, your read lands tomorrow." Otherwise call the Bedrock-EU-only `read` task, run the quality gate (section 7), `read_budget_settle(est, real)`, and email the full read via the EU mailer. If the gate fails twice, flip to `status:'prepare'` and send the "we will prepare your read" email instead.
5. **Full read email** ends with the CTA ladder: primary "Join the workspace waitlist", secondary "Talk to Forj" (cal.com).

### Path B — unknown/thin/suppressed (waitlist)

1. **Honest thin state** in the card: "We do not have a clean read on {Company} yet. Smith will not guess." No faked teaser.
2. **Capture** email + cloud + optional website into `forj_read_capture` `kind:'prepare'`, with the same consent semantics. This queues off-path enrichment (`domain-fill` → `cloud-detect` → people), authenticated/cron only, never from the anon endpoint.
3. **Confirmation** + CTA ladder. When enriched and gate-passed, the delivered email is identical in shape to Path A.

### Edge cases

- Rate-limited (per-IP daily) → route to Path B capture.
- Ambiguous match → up to 3 disambiguation chips (DB-only, free).
- Sole-trader org-nr / small-company collapse → Path B, org-nr never echoed (section 8).
- Junk/too-short input → inline validation, no spend.

## 4. TEASER vs FULL READ vs WORKSPACE-only (the role→name boundary)

| Element | FREE TEASER (instant, no paid model) | FULL READ (emailed, one Bedrock-EU call) | WORKSPACE-only (authenticated) |
|---|---|---|---|
| Cloud verdict | Yes: "Runs on {cloud}" + confidence word | Yes, with the observable signal named in plain language | Live re-detect on demand |
| Size band | Coarse band only (public-registry sourced) | Same band | Exact firmographics + source |
| Stack signals | 1 observable-signal item only | Fuller observable-signal read + implication | Full stack + maturity receipts |
| ICP fit | Band only: hot / warm / cold (`icpScore`) | Band + one-line why | Score + every input that moved it |
| The play (program) | Program NAME only (pure map) | Program + why this play | Play + funding math + tasks |
| Funding figure | **None** (no opp value exists) | **None in body**; program named, figure withheld | Full estimate (real opp value) |
| Who to call | **ROLE/persona only** + why, subject to suppression | **Role + why, sharper** + what to lead with | **Named person, title, LinkedIn, contact, full map** |
| The opener | Teased ("in the full read") | A drafted first line, buyer language | Full opener + follow-ups, editable |
| Receipts | One confidence word | Grounded claims (passed the gate) | Full source trail + action log |

The name is the single hard line (Q1). Public output never contains a named person, a money figure, a vendor/backend/model name, a real partner name (Alto/Novalo), another company's identity, or an em dash. These are hard rejects in the gate (`scoreLinkedIn` `extra` rules), not prompt suggestions.

## 5. Data model

New table `public.forj_read_capture` (self-hosted EU Supabase, db.forj.se). RLS on, service-role only.

| Field | Type | Notes / retention |
|---|---|---|
| id | uuid pk | |
| kind | text | `read_request` \| `prepare` \| `waitlist` |
| status | text | `pending_verify` \| `verified` \| `queued` \| `sent` \| `prepare` \| `expired` \| `failed` |
| email | text | delivery address; purge at 24mo no-interaction |
| email_hash | text | sha256(lower(email)+salt); dedupe + per-email throttle |
| company_id | uuid null | resolved known company (null for prepare/unknown) |
| requested_company | text | free-typed string; **never a raw sole-trader org-nr** |
| partner_cloud | text | enum aws\|azure\|gcp |
| website | text null | optional, prepare path only |
| consent | bool | must be true to store; explicit tick |
| consent_at | timestamptz | consent timestamp |
| consent_purpose_ver | text | version string of the notice they agreed to |
| verify_token_hash | text null | sha256(token); raw token only in email; single-use, 24h |
| verify_expires_at | timestamptz | |
| verified_at | timestamptz null | |
| ip_hash | text null | sha256(xff+salt); **purge at 90d** |
| user_agent | text null | abuse only; **purge at 90d** |
| created_at | timestamptz | |
| sent_at | timestamptz null | |
| unsubscribed_at | timestamptz null | one-click unsubscribe stamps this |

Table `public.read_rate` (rate limits).

| Field | Type | Notes |
|---|---|---|
| scope | text | `ip:teaser` \| `ip:request` \| `email` \| `global:teaser` \| `global:request` |
| key | text | ip_hash / email_hash / literal `global` |
| day | date | UTC day (rolling) |
| n | int | counter; upsert increment |

Retention: rows auto-purged at day+35 by a cleanup job (counters are ephemeral).

Table `public.read_budget` (singleton, id=1, RLS off, service-role only).

| Field | Type | Notes |
|---|---|---|
| id | int pk = 1 | |
| cap_usd | numeric default 25 | deliberate small daily cap |
| spent_usd | numeric default 0 | reserved+settled total |
| day | date | UTC rolling; auto-rolls in the reserve RPC |
| updated_at | timestamptz | |

Optional `public.read_teaser_cache { key, payload_json, company_id, built_at }` — key = `sha256(lower(trim(q))|partner_cloud)`, TTL ~24h, invalidate when `companies.updated_at > built_at`; negative-cache `prepare` results ~1h.

RPCs: `read_budget_reserve(p_est numeric) returns boolean` (atomic day-roll + refuse-without-spend + reserve in one statement — must fail CLOSED on any error) and `read_budget_settle(p_est, p_real)`.

Cleanup job (pg_cron nightly): purge `read_rate` older than 35d; null `ip_hash`/`user_agent` older than 90d on `forj_read_capture`; delete rows `unsubscribed_at is not null` or 24mo since last interaction; expire `pending_verify` past `verify_expires_at`.

## 6. Endpoint contract

New public edge function `C:\Users\jacob\alloy-page\supabase\functions\smith-read\index.ts`, deployed to the box (db.forj.se) per `DEPLOY-BOX.md`. No `verify_jwt`. Actions split so the free path can never spend. Plus a service-role worker.

**Order of guards in every action:** honeypot → Content-Length cap (~4KB, else 413) → JSON+POST + Origin/Referer check (pinned to forj.se on `suggest`/`request`/`verify`; teaser stays open for shareability) → input validation → per-IP limit → global limit → (worker only) per-email limit → budget reserve.

### `action:"suggest"` (public, free, no model, DB read-only)
- In: `{ q<=120, partner_cloud }`. `q` validated to charset `^[\p{L}\p{N} .,&'()\-]+$`, single-line, else reject.
- Narrow `ILIKE name / eq orgnr` select of safe columns only (name, domain, city, orgnr, cloud_ecosystem). No licensed Vainu fields selectable. Returns ≤6 rows.

### `action:"teaser"` (public, free, no model, no outbound fetch)
- In: `{ company_id | q, partner_cloud, website="" (honeypot) }`.
- Loads stored fields; runs `icpScore` + pure program-name map + cloud/stack readers (in-fn). **Derivation-source guard:** only fields whose `*_source` is observable-signal (aws-detect/cloud-detect/builtwith) or public-registry may render; licensed-source fields are blocked (section 8). Applies sole-trader + small-company suppression. Returns `status:"ready"` teaser (bands + role + program name, NO figure) or `status:"prepare"`.
- Rate: generous per-IP (e.g. 15/day) + global backstop (e.g. 20k/day). Cacheable; `Cache-Control: public, max-age=3600` on `ready`.

### `action:"request"` (public, free, no model, writes capture + sends verify)
- In: `{ email<=320, company_id|requested_company, partner_cloud, consent:true, website="" }`. Email regex; `consent` must be true; honeypot empty; Origin pinned to forj.se.
- Writes `forj_read_capture status:'pending_verify'` + `verify_token_hash` + consent fields; sends verify email via EU mailer. **No paid call.**
- Returns identical `{status:"check_email"}` for new/dup/unknown (no enumeration). Per-IP (e.g. 10/day) + global (e.g. 300/day) caps.

### `action:"verify"` (public GET from email link, no model)
- In: `?t=<token>`. Validates single-use, unexpired hash → `verified` → `queued` → redirect to `forj.se/read/pending`. Rate-limit verify attempts per token/IP.

### Worker (service-role, `verify_jwt=true` + reject anon, `x-cron-key` from `cron_auth`, pg_cron drain)
For each `queued` row: per-email throttle (e.g. 3/day, 10/mo on `email_hash`); `read_budget_reserve(est)` — if false, leave queued + send "at capacity" email; else call `claude-proxy` new `read` task **Bedrock-EU-only, no tools/web, no Anthropic fallback**; assert response `x-alloy-via` starts `bedrock:` (if it is `anthropic*`, abort, do not send, flip to `prepare`); run the quality gate (section 7); `read_budget_settle(est, real)`; email the read (subject+opener+body all gated, section 7). Two gate failures → `status:'prepare'` + prepare email.

**Guards reused/hardened (all in the actual `alloy-page` repo):**
- Per-IP hash + global backstop pattern from `smith-demo/index.ts`, but budget uses the new `read_budget_reserve` (NOT smith-demo's check-then-record).
- Honeypot + per-IP/global rate pattern from `forj-contact/index.ts` (pattern only; not the function).
- SSRF: the public hot path makes ZERO outbound requests (teaser is DB-only; unknown resolution is queued off-path). Any worker-side URL touch must reuse `web-fetch/index.ts` `resolveValidated`/`isPrivateV4/6` verbatim — no second, weaker resolver. If the worker only calls `claude-proxy` (fixed Bedrock host), there is no arbitrary-URL fetch and SSRF is moot.
- Bot mitigation: honeypot; teaser returns bands+role only (nothing worth scraping); soft-limit 200 responses not hard errors; double opt-in is the anti-bot gate for spend. No CAPTCHA; Claude is never asked to solve one.
- Secrets: public actions carry NO model credentials; only the worker reaches `claude-proxy`. Service role used for narrow reads/writes only, never a general query surface. Verify tokens + emails hashed at rest. Errors sanitized (`{error:"lookup_failed"}`), never keys/schema.
- **When cloning any smith-demo copy, scrub the "Create your own workspace (free to start)" strings** (smith-demo index.ts ~line 106/115) → replace with "Join the waitlist" (launch-gate finding).

## 7. Read quality gate + completeness rubric + Jacob approval

### Completeness hard floor (free, no model) — ALL required for instant read
1. **Domain** present + resolvable.
2. **Detected cloud** = aws|azure|gcp at medium+ confidence (low/`other`/`unknown` → waitlist).
3. **At least one stakeholder ROLE** present in `decision_makers` (role only; name never displayed) **AND passes small-company/unique-role suppression** (section 8): if `employees < 10` or the role is structurally unique at that firm, drop to a generic sponsor phrase or route to waitlist.
4. **A computable play**: program-name map resolves and `icpScore` computes.

Any miss → waitlist. Soft signals (stack items, size band, maturity, GenAI intent, extra roles) improve the read but never gate it; omit silently when thin (never print "unknown"). Thin reads are shorter, not vaguer.

### The gate on the emailed read (customer-facing, EU-only)
Grounding bundle = the KNOWN facts (cloud+confidence+source, observable stack, public-registry size band, roles present, program name). The model writes using only this bundle.

- **Gate A — deterministic (free):** `scoreLinkedIn({ text, grounding, partners: ALL_PARTNERS, forbidden: [company internal names/domains], lang })` from `smith-linkedin.js`. Pass = `.ok === true` (voice=[], grounding=[], extra=[], lang_bad=false). `extra` findings (vendor/partner/economics/identity) and `dash` (em dash) are HARD rejects. Fail → regenerate once with findings as reject reason.
- **Gate B — paid faithfulness judge (Bedrock-EU-eligible because it carries NO tools):** `buildJudgeRequest` + `parseJudgeVerdict` from `smith-eval.js`. Pass = `unsupported.length === 0`. **For the stranger-facing public read, an unparseable/empty judge verdict is treated as FAIL, not fail-open** (regenerate once, else waitlist) — closes the residual hallucination path.
- **Judge task on the box:** add a dedicated `judge` task to `claude-proxy` `TASK_SYSTEM` (mirroring `FAITHFULNESS_JUDGE` verbatim), routed as Haiku, web_search-free, so it is Bedrock-EU-eligible and works with `STRICT_TASKS` ON. Verify before relying on Gate B.
- **Email chrome is gated too:** subject + opener + body all run through `scoreLinkedIn` (customerFacing) + em-dash strip before send. Prefer deterministic templates for subject/opener to avoid model-emitted dashes.
- **Regenerate-once per gate, then WAITLIST.** No degraded read is ever shown to a stranger; the budget-exhausted / gate-failed condition converts to the "we will prepare your read" email. There is no deterministic-assembled free-text fallback read.

### The read must always contain (or it should not have passed the floor)
The reading (grounded cloud + one posture fact) · the role to target + why (no name) · the funded play + cloud-correct program name (framed ON their cloud, never "move off") · the pitch angle (buyer language). Omit stack/size/second-role/AI-angle when thin. Never any money figure, named person, vendor, partner name, other-company identity, em dash, or self-serve "create workspace" action.

### Jacob sample-approval (one-time launch gate, before go-live)
Generate an offline batch via `scripts/smith-eval-run.mjs`: **N=15 minimum, 5 per cloud** (AWS/Azure/GCP), real floor-passing companies spread across hot / warm-migrate / thin-but-above-floor (incl. a few deliberate waitlist fallbacks so he sees that copy). Each sample must have passed Gate A + Gate B first; Jacob reviews the passed reads + their grounding bundle, checking for grounded-but-wrong-judgement calls (wrong play, weak angle, program misapplied). Go-live requires Jacob signing off that all N are on point. Fixes are prompt-level → regenerate → re-review until a clean N. The approved batch becomes the frozen regression fixture re-run after any prompt/model change. Internal-only verdict badge (Verified / Verified-after-regen / Waitlisted / Rejected-public-leak); strangers never see a badge.

## 8. GDPR — allow / withhold / required-notice

| # | Item | Verdict | Required control | Where it lives |
|---|---|---|---|---|
| 1 | Named person / contact / stakeholder map in public read | WITHHOLD | Role/persona only in public; named data workspace-only. Enforced server-side + `scoreLinkedIn` identity/partner/vendor gates on the live read path. | `smith-read` worker + `smith-linkedin.js` |
| 1b | Role-only sufficiency at small firms | ALLOW with suppression | If resolved `employees < 10` OR role is structurally unique at that firm, drop to "your technical sponsor" or route to waitlist. Server-side, before render. | teaser + worker + completeness floor |
| 2 | Third-party tech stack shown publicly | ALLOW conditional | Only observable-signal fields (`*_source` = aws-detect/cloud-detect/builtwith) may render. Licensed/inferred stack fields blocked (derivation-source guard). Frame as outcome, not method. | resolver source-guard + read prompt |
| 2b | Stack teaser depth | LIMIT + NOTICE | Public = ecosystem + one signal only; full component inventory is workspace depth. Neutral line: "Signals are read from public web sources." | widget footer + "How we read companies" page |
| 3 | Company name / org-nr as input | ALLOW with sole-trader carve-out | Limited-company name/org-nr is not personal data. Swedish **enskild firma** org-nr is the proprietor's personal identifier → detect `legal_form`; route sole traders to waitlist (no instant read); **never echo the org-nr** in public output; do not persist raw org-nr against an IP. | resolver `legal_form` check + widget |
| 4 | Captured email — lawful basis | ALLOW | Basis = **consent (Art. 6(1)(a))** for waitlist + read delivery + nurture. Must be explicit, purpose-scoped, revocable. | `forj_read_capture.consent*` |
| 4b | Consent wiring (must be real, not copy) | REQUIRED-NOTICE | Store `consent` + `consent_at` + `consent_purpose_ver`; one-line notice + Privacy link at point of entry; outcome-named button; unsubscribe in every email. | widget + capture row |
| 4c | Retention | REQUIRED-NOTICE | Purge `ip_hash`/`user_agent` ~90d; review/purge leads at 24mo no-interaction; delete on unsubscribe/erasure. pg_cron cleanup job. | cleanup job + Privacy page |
| 4d | Storage location | ALLOW | Self-hosted EU Supabase (db.forj.se, eu-north-1). EU-resident. | capture table |
| 4e | Verify + read email delivery egress | REQUIRED-CONTROL | Use an **EU mailer**, not Resend default `onboarding@resend.dev`. Do NOT reuse `forj-contact`'s Slack+Resend notify path (US processors, undisclosed). Set a real `NOTIFY_FROM`. | new mailer config |
| 5 | Full read model path egress | WITHHOLD from US | Bedrock-EU-only `read` task, no web_search, no Anthropic fallback; assert `x-alloy-via = bedrock:*` before send. `alloy_company_read`/web_search is banned on this path (forces Anthropic US + fallback). | `claude-proxy` `read` task + worker assertion |
| 6 | Legal notices placement | ALLOW | Widget carries one-line notice + Privacy link only. Detail (Art. 13/14, sub-processors, retention, rights, Vainu third-party-source disclosure) on Privacy/DPA/"How we read companies" pages linked in footer. | forj.se legal pages + footer |
| 7-IN | Vainu data inside authenticated workspace (named contacts, exact firmographics) | ALLOW | Licensed internal business use. | workspace only |
| 7-IN | Vainu as internal signal to decide resolution/role, without exposing the licensed row | ALLOW | Public output is the derived conclusion, not the licensed record. | resolver (no licensed field reaches render) |
| 7-OUT | Publishing a named person/title/contact/LinkedIn sourced from Vainu to a stranger | WITHHOLD | License + Art. 6/14 breach. Blocked by Q1 + server guard. | read path + gates |
| 7-OUT | Public firmographic numbers when Vainu-sourced | WITHHOLD/substitute | Use public-registry figure or coarse band only; point the public read's grounding at public sources so `smith-eval` `ungrounded-revenue`/`headcount` checks are load-bearing. | grounding source = public only |

## 9. UI spec + microcopy

Slots into `C:\Users\jacob\alloy-landing\index.html` as a new `#read` band between line 785 (`</section>` closing `#alloy`) and line 787. Rail link after line 486 (`data-sec="read"` self-wires the scroll-spy). CSS appended after line 478 in a `/* FREE READ WIDGET */` region (reuse existing tokens/`.console`/`.sr-*`/`.chip`/`.btn`/`.eyebrow`/`.forge-hot`/`.ck-caret`; add `.rd-locked{filter:blur(3px);user-select:none}`; no new colors/fonts/gradients). JS in a new `<script>` after line 883 (reuse the `ANON` constant + `fmt`/`up` helpers). Keep the existing Meet-Smith console (lines 578–605) untouched. Respect `prefers-reduced-motion`. All numbers rounded; SEK via `toLocaleString('sv-SE')`.

**Entry band**
- Eyebrow: `One free read`
- Heading: `Read any company the way Smith does.`
- Sub: `Name a company, pick the cloud you sell, and Smith forges the read: which cloud it runs, the stack on top, the funded play, and the role to target. First read is on the house.`
- Input placeholder: `Company name or org number`
- Cloud label (Space Mono): `Which cloud do you sell?` · chips `AWS` `Azure` `Google Cloud` (equal weight, AWS pre-selected)
- Button: `Forge the read`
- Fine print: `One free read. No account needed. We show you the play and the role to target. The person and the full map open inside your workspace.`
- Autocomplete no-match row: `No match yet. Keep typing, or we will prepare it for you.`

**Forging state** (cosmetic timing over the fast free lookup, ~1.2–2.0s)
- Status: `Forging the read...`
- Steps (✓ as they complete, caret on active): `Reading the cloud it runs` · `Detecting the stack on top` · `Naming the funded play` · `Finding the role to target`
- Under-note: `A few seconds. Smith checks his work before he shows you anything.`

**Teaser card** (reuse `.sr-*`)
- Header: `{Company} · {city} · ~{band} people`; cloud pill right
- Verdict: `Smith's read · high fit` / `worth a look` / `not a fit right now` + one templated sentence keyed on band+play (no figure)
- Cloud posture (full): `Runs on {cloud}. {High} confidence.`
- Stack (full, one signal): label `Some of the stack`
- Blurred node 1: `Who to target` · Blurred node 2: `The play`
- Unlock prompt over blur: `Unlock the full read →`  · sub: `The funded play, the role to target and the opener. One email.`

**Email gate**
- Heading: `Get Smith's full read`
- Sub: `The funded play, the role to target and how to open the conversation. Smith sends it to your inbox.`
- Placeholder: `name@company.com`
- Consent (required tick, small): `Send me my read and keep me posted on Alloy. No spam, unsubscribe anytime.` + link `privacy note` → `/privacy.html`
- Honeypot (off-screen): label `Leave this field empty`
- Button: `Show me the read`
- Bad email: `That does not look like a work email. Try another.`
- Submitting: `Sending...`
- **Post-submit state (NO read shown):** `Check your inbox. Confirm your email and Smith starts forging your read.`

**Pending page** (`forj.se/read/pending`)
- `Smith is at the anvil. Your read on {Company} will land in your inbox shortly.`

**Full read email**
- Subject (deterministic template): `Your read on {Company}: {play in five words}`
- Opener (deterministic template): `Here is the read on {Company}. Cloud, play, the seat to target, and where I would start.`
- Body: the gated read (cloud posture · stack read · the reading · who to target (role) · the play + program name · pitch line). No figure. Sign-off: `Forged by Smith. You decide. You close.`
- Primary button: `Join the workspace waitlist` · Secondary: `Talk to Forj`

**CTA ladder (on-page confirmation + email foot)**
- Framing: `One read today. Your whole market on tap. Here is the way in.`
- Lock reveal: `The named person, their details and the full stakeholder map open inside a workspace.`
- Primary: `Join the workspace waitlist` → one-click flips the existing capture row to `kind:'waitlist'` (no second form); confirmation `You are on the list. We will bring you in when workspaces open.` **Never links to self-serve signup or tenant creation.**
- Secondary: `Talk to Forj` → `https://cal.com/forj.se/15min`
- Under-note: `Or read another company.` (resets widget)

**Thin/unknown state (Path B)**
- Heading: `We do not have a clean read on {Company} yet.`
- Body: `Smith will not guess. When the signal is thin, he goes and gets it, then writes the read properly. Leave your email and the cloud you sell, and we will prepare it.`
- Fields: `name@company.com` · cloud chips · `Company website (optional, speeds it up)`
- Button: `Prepare my read` · Success: `Got it. Smith will forge this read and email it over.` · Under-note: `Usually within a day or two.`

**Error state**
- Heading: `Smith could not finish that read.`
- Body: `Something went wrong on our side, not yours. Try again in a moment, or send it to us and we will read it by hand.`
- Buttons: `Try again` · `Email partner@forj.se`

**Rate-limited state**
- Heading: `That is the free reads for today.`
- Body: `Come back tomorrow, or see Smith work your real pipeline in a workspace.`
- Buttons: `Join the workspace waitlist` · `Book fifteen minutes`
- Teaser soft-limit: `Take a breath.` / `Give it a few seconds and try the next one.`

**Hero CTAs:** leave "Open the live workspace" (lines 514, 732) unchanged only after verifying `alloy.forj.se/?demo` is a read-only gated demo, not tenant-create (open risk, section 11). Optionally repoint "See the loop →" (line 515) to `#read`.

## 10. Phased build plan

**Ships NOW (launch = read + email + waitlist, quality-gated, workspace CTA = waitlist)**
1. `scoring.js`: keep `icpScore`/`estimateFunding` as-is; do NOT invent `alloy_funding_fit`. Add the pure cloud→program-name map + cloud/stack readers **inside `smith-read`** (mirrored from the app, not cross-repo imported).
2. Migrations: `forj_read_capture`, `read_rate`, `read_budget` (+ `read_budget_reserve`/`settle` RPCs), optional teaser cache; pg_cron cleanup job.
3. `claude-proxy`: add Bedrock-EU-only, no-fallback `read` task + `judge` task to `TASK_SYSTEM`; verify with `STRICT_TASKS` ON; confirm `x-alloy-via` reports `bedrock:*`.
4. `smith-read` edge function (suggest/teaser/request/verify) + service-role worker, deployed to the box per `DEPLOY-BOX.md`. Scrub any cloned "create your workspace" copy.
5. EU mailer for verify + read emails; consent + retention + unsubscribe wired; suppression rules (sole-trader, small-company, derivation-source) in resolver.
6. Landing widget (all states from section 9) + `forj.se/read/pending` route.
7. Quality gate (Gate A/B, judge-fails-closed) + Jacob's 15-read approval + frozen regression fixture.
8. Legal pages: Art. 13/14 disclosures, sub-processor list (AWS/Bedrock EU + EU mailer), Vainu third-party-source notice, retention, DSAR route, "How we read companies".
9. Grep pre-launch: `create your workspace`, `free to start`, em dash `—`, `x-alloy-via.*anthropic` on the read path.

**LATER (when the launch gate opens)**
- Self-serve workspace creation; the "Join the workspace waitlist" CTA becomes "Create your workspace".
- In-workspace unlock of the named person, contact, full stakeholder map, exact firmographics, and the real funding figure (with a genuine opp value → `estimateFunding`).
- Optional: a separate, disclosed web-grounded read path (Anthropic-US sub-processor + SCCs, visitor email gated out of the same call) if Jacob wants live grounding.
- Privacy-friendly proof-of-work only if bot abuse persists.

## 11. Open risks / decisions for Jacob

1. **Live-ness of the EU-only read.** Dropping web_search for EU residency means the read is grounded on stored fields, so it is less current than an `alloy_company_read`. Accept the trade for launch, or decide later to disclose Anthropic-US + SCCs for a web-grounded path. (Recommend: EU-only now.)
2. **`alloy.forj.se/?demo` destination.** The hero CTAs assume this is a read-only gated demo, not tenant-create. Must be verified before launch; if it exposes any self-serve signup, repoint to waitlist (launch-gate constraint).
3. **EU mailer choice.** Need an EU-resident transactional mailer (verify + read emails) and a real `NOTIFY_FROM`. Which provider, and is a DPA in place?
4. **`legal_form` coverage.** Sole-trader suppression depends on `companies.legal_form` (or a registry lookup) being populated; confirm coverage so enskild firma are reliably routed to waitlist.
5. **Caps.** Confirm the numbers: `read_budget` daily cap (default $25), per-email throttle (3/day, 10/mo), per-IP teaser/request caps, global backstops.
6. **Source-tagging for the derivation guard.** The guard needs `*_source` tags on cloud/stack/firmographic fields to distinguish observable-signal vs licensed-Vainu. Confirm these tags exist on the `enrichment` fields; if not, that tagging is a prerequisite task.
7. **`forj.se/read/pending` route** must exist on the landing (static page or hash route); confirm the Amplify `landing` branch can serve it.