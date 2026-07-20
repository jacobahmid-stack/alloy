# ICP Qualification — Level B/C data pipeline gate

> **SCOPE (2026-07-04): this file is NOT the ICP.** It is the enrichment-spend gate for accounts
> (Level B) inside Alloy's data pipeline. **The canonical ICP — who Forj sells to, the Desk/Software
> tiers, the anti-ICP, the unified 70/40 scoring vocabulary — lives in [FORJ_ICP.md](FORJ_ICP.md)
> and wins on any conflict.** The two-tier free-before-paid gate below and the never-guess rule are
> promoted into that doc; the mechanics stay here.

How a raw Swedish org from `se_registry` (~489k companies) becomes a paid-for, enriched account in
Alloy — and, critically, **what we check for free before spending a single Claude token**.

## Why this exists
Every account we enrich costs money: the importer makes a paid Claude call (firmographics, then
domain) per candidate. Historically that call ran on *every* registry row and then archived the
rejects — i.e. we paid to discover a company was too small or a shell. This gate moves every check
we can do **for free** ahead of the paid step.

## The two tiers

### Tier 1 — FREE gate (deterministic SQL, $0, no Claude/API)
Implemented in `pick_icp_candidates` (migration `icp_free_prequalify_gate`). A registry row must
pass ALL of these before it can ever reach a paid call:

| # | Rule | Field | Why |
|---|------|-------|-----|
| 1 | In a target SNI industry | `sni_code` | ICP fit (caller supplies the list) |
| 2 | Aktiebolag only (`= '49'`) | `juridisk_form` | operating company, not förening/stiftelse/branch |
| 3 | Has a city | `postort` | data quality (`lan` is never populated in the registry) |
| 4 | Name is not a shell/holding | `name` | excludes `holding, invest, förvaltning, intressenter, fastighet, likvidation, konkurs, vilande, lagerbolag` |
| 5 | Not already imported | anti-join on `companies` | dedupe — never pay twice |

Rejects are never returned, so re-runs re-test them for free. On the software pool this removes
~2.7% (the obvious junk) at zero cost; the value is that holdings, property shells, and
dormant/bankrupt entities never burn a paid call again.

### Tier 2 — PAID enrichment (Claude, only on Tier-1 survivors)
Runs in `icp-screen`, one survivor at a time:
1. **Size** — `find_firmographics` (employees + revenue). `employees >= min_employees` → **lead**;
   below → archived `too-small`; unknown → archived `size-unknown`.
2. **Domain** — `find_domain` (only if it qualified on size).

Then the **free** crons take over: cloud detection (AWS/GCP/Azure, ASN-based) and
funding-eligibility (deterministic play score). Neither uses Claude.

## The honest limit: size isn't free (yet)
`se_registry` carries **no headcount** (`raw` and `status` are null), and allabolag/proff serve a
bot challenge to server fetches (verified 2026-06-02 — HTTP 202, empty body). So the single most
common reject reason — *too small* — cannot be decided for free today. Options, cheapest first:

- **Wire a size source (investigated 2026-06-02 — blocked on data, not code).** The size gate would
  be free if `se_registry` carried an employee *size class*. The ingest pipeline (`se-ingest` /
  `se-process`) maps a fixed `COLS` set with **no** employee/size field, and the loaded rows have
  empty `sni_text` + null `status` — i.e. the source was a **basic SCB extract**. SCB's employee
  size class lives in the fuller **Företagsregistret**, a **paid** SCB order (needs Jacob's SCB
  account — not actionable autonomously). Path when ready: order a file with the size-class column →
  add `emp_size` to `COLS` + a `colFor()` rule (e.g. matches `anställda`/`storleksklass`) in both
  ingest functions → add the column to `se_registry` → have the free gate read it. ~30 min once the
  source file is confirmed (use `se-ingest` `mode:"peek"` to verify the field name first).
- **Lean out the paid call.** Drop `find_firmographics` web_search 2→1 and trim max_tokens —
  ~40–50% cheaper per call, with a small accuracy risk on obscure SMEs.
- **Flip push → pull.** Enrich on demand (when a user actually opens / wants an account) instead
  of pre-paying to size cold registry rows.

## Nightly free feeder (every night, $0)
`feed_free_prospects(p_limit)` + the pg_cron job `feed-free-prospects-nightly` (01:00 UTC) walk the
registry and insert the next batch of Tier-1-qualified prospects — **pure SQL, no Claude, no API**,
server-side, independent of any laptop/agent session. They land as `stage='lead'`,
`list_tag='nightly-free'`, carrying name / org-nr / city / industry (SNI division label) only — no
size or domain, because those aren't free. Idempotent: the anti-join skips anything already
imported, so each night advances further through the ~22.5k qualified pool (≈ 80/night). Triage by
the `nightly-free` tag; enrich the keepers on demand.

## Guardrails (standing)
- The free gate runs first, always; nothing reaches a paid call without passing Tier 1.
- Never invent a number: if firmographics returns no parseable answer the candidate is left
  unconsumed (not guessed) — a `null` beats a wrong size.
- Rejects are archived, not deleted, so dedupe holds across re-runs.
- Size threshold (`min_employees`) and target SNIs are passed per import, not hard-coded, so each
  ICP (Novalo software, Alto mid-market) tunes its own bar.
