# Alloy → forj.se quality uplift plan

*From the multi-agent audit, 2026-06-27 (60 found, 55 verified). Full raw report + all 55 findings: the workflow output file `tasks/ww9we2z6m.output`.*

## Verdict

Alloy is **structurally sound but a brand-direction and multicloud-positioning generation behind forj.se, with a cluster of launch-blocking security holes underneath the cosmetics.** The visual layer is stranded on the pre-pivot identity (candy violet, orange glow-haze, two card languages, cool neutrals); the product still talks AWS-first in the funding panel, the playbook brain and the demo; and it leaked vendor names into buyer copy. The good news: the right primitives already exist next to the offending code (`scoring.js` CLOUD_PROGRAMS/playCloud, the `C` theme proxy), so most of it is mechanical retunes and sweeps, not rebuilds. Estimate: ~2-3 focused days to clear P0, ~3-4 more to reach visual + multicloud parity.

---

## P0 — Security (launch-blocking, anon-reachable / financial exposure) — NOT STARTED

This is the long-open "harden anon-reachable fns" task, now mapped. All are box edge fns (deploy = box paste).

| # | Item | File | Fix |
|---|------|------|-----|
| 1 | Paid LLM proxy anon-reachable (`REQUIRE_AUTH` defaults off) | claude-proxy/index.ts:370 | Default to `on` (callers already send service_role, verified); keep env flag as instant rollback; fix stale comments |
| 2 | kb-ingest has zero auth (anon can poison/wipe the KB) | kb-ingest/index.ts:9-41 | Add cron-key OR service_role gate (copy maturity-fill) |
| 3 | 4 paid enrichment fns no enforced auth | bulk-enrich:162, domain-fill:18, icp-screen:49, aws-discovery:196 | Service_role-or-cron-key gate at top of each |
| 4 | voice-token mints Twilio tokens for anon (toll fraud) | voice-token/index.ts:12,21 | Require authenticated; allow-list outbound numbers |

## P0 — Multicloud / cloud-agnostic (customer-facing) — PARTIALLY DONE

Done today (`8efa403`): the kit widget, the 3 Smith deliverables, tripartite, dashboard plays, resell. **Remaining:**

| Item | File | Fix |
|------|------|-----|
| Public `?demo` frames Azure/GCP customers as migrating OFF their cloud to AWS | forge.jsx:2502-2532, 2563; SmithRead Play 5944-5945 | Rewrite seed rows + playText per the account's cloud (Azure M&M / Google RAMP); keep one on-prem→AWS story |
| FundingPanel + recommendFunding AWS-hardcoded, render for every cloud | forge.jsx:640-682, 6744-6894 | Drive from `cloudProgram(playCloud(company,project))` |
| Funding-fit panel computes cloud-aware track then renders AWS-only label | forge.jsx:4003-4010, 5114/5136 | Label/blurb off `cloudProgram(playCloud(...))` |
| AWS_PLAYBOOK + SMITH_PLAYS (the $0 deterministic brain) AWS-only | forge.jsx:4019-4148, 4156-4168 | Make playbook cloud-relative via playCloud + CLOUD_PROGRAMS; fix the "committed to Azure/GCP" objection |

## P0 — Exposed vendor (buyer-facing) — ✅ DONE 2026-06-27

- Header badge "Powered by Claude" → "Advises · you approve" + tagline → "your cloud co-worker" (`b938f96`).
- Smith persona "you run on Claude" → "Forj's own secure cloud, EU region, top-tier large language models" (`902d039`).

## P1 — Reliability — NOT STARTED

| Item | File | Fix |
|------|------|-----|
| Failed boot = permanent loading splash (no error/retry) | forge.jsx:10676-10717 | Wrap boot in try/catch; on failure set error state + setLoading(false); error screen with Retry |
| No top-level ErrorBoundary (any render throw blanks the app) | main.jsx:24 | Class ErrorBoundary around <Forge/> with branded fallback + reload |

## P1 — Design / brand direction (the "forj.se level" uplift) — NOT STARTED

| Item | File | Fix |
|------|------|-----|
| Accent is candy violet, not industrial-forge steel-violet | forge.jsx:2607-2613, 2644-2653 | LIGHT.accent #5E33D6→#4B3CA0, DARK #8B7BFF→#9E92D8; retune accent2/spark/accentFill/rail; **sweep ~20 hardcoded literals** (SMITH_AV_BG, AlloyMark gradients, JOURNEY, ::selection, project defaults) |
| (+ remaining P1/P2 design + code/perf items) | — | See the full report in `tasks/ww9we2z6m.output`: two card languages → one (boxShadow:C.cardSh), glow→material, cool→warm neutrals, dead code, select=* checks, gradient text |

---

## Recommended sequence

1. **Security P0 (1-4)** — the only true launch-blockers (real billing-DoS + toll-fraud + KB-poison exposure). I write the gates + hand box pastes + a test checklist; Jacob deploys + we feature-test (Smith, demo, nightly crons must keep working).
2. **Multicloud P0 remainder** — de-AWS the funding panel, the demo, and Smith's deterministic brain (ships via Amplify).
3. **Design P1** — port the industrial-forge palette + material into the app's theme (ships via Amplify).
4. **Reliability P1** (ErrorBoundary) + **P2 polish**.
