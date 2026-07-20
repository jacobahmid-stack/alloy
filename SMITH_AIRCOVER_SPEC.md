# Smith Air Cover — exec multithreading, spec (/aircover)

Status: **SPEC** (2026-07-03), build not started. Flagship use case for Smith on Shift **Phase 2** (two-way @smith), but Phase A ships app-only with no Slack dependency.

Origin / proof point: Clay's Head of Sales runs a dedicated Slack channel where any rep can ask a senior leader (CEO, founders, VPs) to send a drafted note to a specific contact at an account. The exec makes it their voice and sends. Publicly shared result: **more than 25% of one rep's quarterly number** attributed to that channel; one deal $60K, another tracking ~50% larger than average. The mechanic works because the *ask* is near-zero-friction.

## The insight Alloy adds

Clay killed the friction of **sending**. The best comment on that post named the gap: someone should kill the friction of **deciding** — which account deserves exec air cover this week, which seat to target, and what the hook is. That is exactly what Alloy already computes: `icp_score` + `enrichment.icp_brief`, stakeholder maps (`contacts.title`), engagement stage + staleness, funded-program fit, and event triggers. Smith doesn't just draft the exec's note; **Smith nominates the accounts, the seat, the sender, and the hook.**

## The motion

1. Rep (or Smith proactively) flags an account for air cover.
2. Smith produces an **Air Cover card**: why-now (signals), target seat (role, from the stakeholder map), suggested sender (the partner exec whose seniority matches), the drafted note **in the exec's voice**, and a fallback CTA (dinner, intro, on-site).
3. The exec reads, edits, and sends **from their own inbox/LinkedIn**. Smith never sends.
4. Outcome is logged; wins feed back into which hooks get drafted next.

## Surfaces (one engine, three doors)

- **`/aircover [company]`** slash-shortcut in Smith chat (joins /prospect /score /reply /report). With a company: the card. Without: Smith ranks the **top 3 air-cover-worthy accounts this week** (stage + icp + senior-seat-mapped + stalled-days + trigger recency).
- **NBA card** on the dashboard (NbaStrip): "This account earns exec air cover" with one-click "Draft the ask".
- **Slack** (Phase 2 two-way): `@smith aircover <company>` in the partner channel → card in-thread; exec copies the draft and sends. Uses the existing smith-brief recipients table for exec identity.

## Hard rules (unchanged Smith doctrine)

- **Human sends, always.** No auto-send, no scheduling, no exceptions (the email-outreach-scratched rule: targeted, human-sent, from the human's own inbox).
- **Exec voice from the GTM rulebook** (per-partner voice + do-not-say). **Language follows the recipient** (language-preference rule; langMismatch gate).
- Drafts pass **smith-slop + smith-eval** before display. No em dashes. Buyer language only.
- Logged to `smith_call_log` (task `aircover`); learn.js biases future hooks toward what converted.

## Build sketch (small; ~1–2 sessions)

- **claude-proxy**: additive `aircover` task in TASK_SYSTEM (exec-voice drafting), NL task, Bedrock sonnet tier. Additive only — same pattern as `linkedin_author`.
- **forge.jsx**: extend the slash-shortcut registry; `AirCoverCard` component reusing NbaStrip card chrome; ranking = a pure, unit-tested function over existing account fields (same pattern as the scoring module).
- **Slack**: extends the smith-brief fn; gated on Slack Events two-way (already the Phase 2 plan). Not needed for Phase A.
- **No schema changes.** Reuses contacts, icp_brief, engagements/claimed_by, gtm_rulebook, smith_call_log.

## Phasing

- **A (app-only):** `/aircover` + card + gated draft. Smallest useful slice; demo-able same week.
- **B:** dashboard NBA card.
- **C:** Slack `@smith aircover` with Smith on Shift Phase 2.
- **Metric:** air-cover asks human-sent, and replies/meetings attributed. Goal: replicate the ">25% of quota influenced" story as an Alloy case study (aggregate-safe, per the launch gate).

## Why this wins vs the Clay version

Pre-qualified accounts, mapped seats, funded-play hooks, per-partner exec voice, an audit trail, and the same brand promise as everything else Smith does: the AI forges it, the human opens the door.
