# Smith = the acquisition department

Companion to the "Alloy is your acquisition department" graphic
(source archived at `brand/_archive/old-html/alloy-acquisition-department.html` -> `brand/social/alloy-acquisition-department.png`; pre-canon colors, recolor per BRAND.md Palette before any revival).

Today Smith is strong on **FIND + OPEN** (the Outreach agent). This sketches the three
agents that complete the lifecycle: **Follow-up, Scheduling, Retention**. Same engine,
three new jobs. Each agent has one job; together they turn a chaotic pipeline into a
predictable, funded one.

## The shared spine (every agent runs on this)
- **Alloy brain.** The signal and data layer (ICP fit, cloud and funding signals,
  decision-makers, stack), kept current. This is the moat the LinkedIn-skill clones do not have.
- **One agent, many skills.** Smith's ReAct loop, capped per request, critic-checked,
  with the action-trace log (`smith_call_log`) written on every run.
- **Daily caps + dedup.** Each agent is rate-limited and an account is never double-worked.
  Same discipline as the "daily cap" in the viral graphic, and it keeps us off spam-detection.
- **Human on the send button by default.** Smith drafts and stages; a person approves the
  outward action (email send, booking). Tighten or loosen per agent as trust grows.
- **Grounded and on-brand.** Real receipts only, buyer language, no em dashes,
  cloud-agnostic framing (the funded play ON their cloud, never "move off it").
- **Writes back to the CRM.** Every output lands as a task, note, or stage on the account
  (HubSpot and the major CRMs on the sync engine).
- **Callable tools first, agent-led onboarding (Harvey read, 2026-07-06).** Build each new
  capability (Follow-up, Scheduling, Retention, discovery, funding-fit, champion-watch, the
  morning brief) as a **tool Smith can invoke**, not a separate product a human CSM has to teach.
  A tenant who came for "read one company" gets pulled into the rest of the platform by Smith
  itself. This is the single most acqui-hire-relevant and bus-factor-of-one-relevant bet in the
  roadmap: agent-led onboarding removes the human-onboarding cost that makes solo-founder SaaS
  look un-acquirable, and it is exactly how Harvey added $100M in a quarter without a new sales
  team. The lifecycle agents below are the first tools in that registry, not standalone apps.

## Shipped 2026-07-06: the three fleet bets (from the Market Fit / Harvey read)
Built + deployed + verified, one by one:
1. **Callable tool-registry** (`src/smith-tools.js`, wired into `smithChat`). Smith can pull Alloy's own
   intelligence INTO a chat on demand: `lookup_account` (cloud/ICP-score/funded-play/stage/contacts by
   name/domain/org-nr) and `list_ready_accounts` (Alloy's own prioritization). Declarative `{def, exec}`
   registry, so future tools (tag/list/CRM/enrich) add as one entry. 13 tests, 279 green.
2. **Visible self-verify checklist** (expandable `VerifyBadge` + tool trace). The per-message badge now
   expands in-thread to show what Smith checked (buyer-friendly tool names) and, on a softened answer,
   the exact claims that were not grounded. Turns the verification machinery into a trust feature.
3. **Shared account memory across the fleet** (`smith_account_memory`, recall + record). `smith-nba` and
   `reply-agent` now READ the store before generating and WRITE to it after (reply-agent records the
   objection as an open objection; smith-nba records the play). So the retention/NBA agent knows what the
   reply/outreach agent said. Box-verified e2e. `smith-brief` joined the fleet too (compact
   "already tried X; open objection: Y" hint folded into each act-now account line). Whole fleet now
   reads the shared store; smith-nba + reply-agent also write to it.

## 01 - Outreach  (live today, the baseline)
**Job:** catch the signal, find the fit, name the funded play, draft the first touch.
Already running via Event-Driven readiness + Smith's read.

## 02 - Follow-up  (to build)
**Job:** run the multi-touch sequence at the right moment so no account slips.
- **Trigger:** account opened (Outreach fired) and no reply after N days; or a fresh
  signal on a previously-touched account (the re-engage hook).
- **Inputs:** last touch + channel + response state (CRM), the account's live signal
  (Alloy), the original funded play.
- **Steps:** 1) read state and why-now, 2) pick the next touch in the sequence (value-add,
  referencing the live signal, never "just checking in"), 3) draft on-brand, 4) stage for
  approval or send within cap, 5) log and schedule the next step.
- **Guardrails:** max touches per account; stop on reply or opt-out; quiet hours; never
  repeat the same angle.
- **Output:** drafted next touch + updated sequence state + CRM task.
- **Needs:** a sequence-state table (touch #, last_at, next_at, angles_used[]), a daily-cap
  counter, the re-engage trigger wired to the Event-Driven signals.

## 03 - Scheduling  (to build)
**Job:** turn a reply into a booked, confirmed meeting and kill the no-show.
- **Trigger:** a positive reply or meeting-intent detected on an account.
- **Inputs:** reply text, your real availability (calendar), account + play context.
- **Steps:** 1) detect intent, 2) propose 2-3 times from live availability, 3) on pick,
  create the event + invite, 4) remind at T-24h and T-1h, 5) on no-show or decline,
  auto-offer a reschedule.
- **Guardrails:** only books against real free/busy; never double-books; time-zone aware;
  confirmation before the invite goes out (or auto, once trusted).
- **Output:** calendar event + confirmation + CRM stage move to "meeting booked".
- **Needs:** calendar read/write (Google Calendar is already in the stack), a lean intent
  classifier, a reminder cron. Note: the call-capture work (Telavox/Twilio, on hold) feeds
  this agent once revived.

## 04 - Retention  (first piece LIVE 2026-07-06)
**Job:** keep the account and surface the next co-sell before the window closes.
> **Won->expand shipped (B7).** The first Retention tool is live: a stage->`vunnen` event now
> seeds a `deal_won` readiness signal, and `smith-nba` drafts an **Expand** play card
> (deal_won -> Expand), human-in-the-loop. The nightly `data-health` cron does the seeding +
> a data-quality pulse. So step 2 below ("detect the next funded play on close") already runs
> for the won base; the renewal-window + health-score half is still to build.
- **Trigger:** post-close, then on a cadence: renewal window approaching, a health change,
  or a new fundable signal on an existing account.
- **Inputs:** account stage + close date + stack, live Alloy signals (new cloud workload,
  funding refresh, new decision-maker), CRM history.
- **Steps:** 1) score health + renewal proximity, 2) detect the next funded play (expansion,
  an adjacent cloud workload, a new partner-funded program), 3) draft the renewal or
  expansion motion, 4) hand the outreach back to Follow-up / Scheduling, 5) flag risk early
  if health drops.
- **Guardrails:** do not pitch expansion into an unhealthy account; renewal lead time
  configurable; cloud-agnostic expansion only.
- **Output:** a renewal/expansion play card + early-risk flag + CRM task.
- **Needs:** account-health inputs, a renewal-window field, the "next play" detector
  (reuses the Outreach funded-play engine, pointed at the installed base).

## Suggested build order
1. **Follow-up first** - biggest leak (opened-but-never-worked accounts) and it reuses the
   existing draft + signal stack, so it is the cheapest big win.
2. **Scheduling next** - converts the replies Follow-up earns; calendar wiring is the main lift.
3. **Retention last** - needs a closed-won base and health inputs before it pays off.

## Why this serves the north star
Each agent makes Alloy more founder-independent: the pipeline keeps moving without you
driving every touch, and every action is logged, grounded, and reversible.
Smith forges it. You close it.

---

## Smith learning loop (Capture -> Codify -> Propagate) - BUILT, staged, ships dark

Built on our OWN infra (self-hosted Supabase + Bedrock), no third party, no paywall. It makes Smith
reuse the plays that worked instead of re-deriving them every time. It compounds with use.

Files (all in `alloy-page`, uncommitted on `main`):
- `supabase/migrations/smith_skills.sql` - two tables: `smith_run` (bounded trajectories) and
  `smith_skill` (codified, de-identified plays). Service-role only, same posture as `smith_call_log`.
- `supabase/functions/claude-proxy/index.ts` - added a `codify` task; **Capture** (writes a bounded
  `smith_run` row on deliverable tasks) and **Propagate** (injects the top relevant plays into the
  system prompt). Both behind edge secret `SMITH_SKILLS=on`, fail-open, default OFF.
- `supabase/functions/smith-codify/index.ts` - the **Codify** job: mines recent `smith_run` into
  generalised plays (specifics stripped) and writes `smith_skill`. `{"mode":"peek"}` reports,
  `{"mode":"run"}` writes. Budget-safe (one cheap lean call per tenant, under the global cap).

Flow once on: Smith answers a deliverable -> proxy captures the trajectory -> nightly codify distils
recurring plays -> proxy injects the fitting plays into the next run's prompt.

Ship + enable (your call, DEPLOY-BOX pattern):
1. Apply the migration on the box (psql `smith_skills.sql`).
2. Deploy both functions: `./deploy-fn-to-box.sh claude-proxy` and `./deploy-fn-to-box.sh smith-codify`.
3. Flip it on: set edge secret `SMITH_SKILLS=on` (Capture + Propagate activate; nothing else changes).
4. After a few days of runs, POST `smith-codify {"mode":"peek"}` to review candidate plays; when happy,
   `{"mode":"run"}`.
5. Schedule the nightly codify + the `smith_run` prune via pg_cron (templates in `smith_skills.sql`).

Kill switch: unset `SMITH_SKILLS` (instant, no redeploy). Everything is fail-open, so the loop can
never slow or take Smith down.
