# THE LIBRARY CAMPAIGN — the loading instrument (6th instrument) — v1 FIRE-READY

Fire this verbatim in any Claude Code session, cwd C:\Users\jacob\alloy. It authorizes long autonomous work across sessions and limit resets. v1 = zone table verified live + red-team fixes folded (2026-07-17).

---

ultracode. CAMPAIGN: build out the company library across the Nordics, Baltics and (assembled) UK on free official registries, and SOLVE THE DOMAINS PROBLEM with a measured engine. Load Finland, then Estonia. Keep Norway fresh. Stand up the domain engine. Extend to Latvia/Lithuania/Czechia/UK only as far as the engine actually delivers domains. Arm Denmark and Sweden so their loaders fire the day my credential emails land. Work on your own for many hours: loading, loading, loading, gate by gate.

READ FIRST (in order): `LIBRARY_CAMPAIGN.md` (the ledger — the resume point; if it exists, obey it over this prompt for what is already done), then `ALLOY_DATA_AUDIT.md`, `REGISTRY_ROUTES_EU.md`, `COUNTRIES_AND_AGENTCORE.md`, `SCB_FILE_GUIDE.md`, and `alloy-page/box/registry/se-registry-weekly.sh` + `registry-transform.sql` (the loader pattern you extend).

SCOPE RULING (mine, recorded so no session relitigates it): library BREADTH is now an asset in itself — the ownable data moat. Loading ≠ selling: GTM execution stays AWS-first Nordics; nothing in this campaign sends, contacts, or markets. "Execution only on paying pull" governs OUTREACH, not loading. France, Germany, Netherlands, Belgium stay OUT (verified 2026-07-17: domainless at scale, paid, or anonymized — do not revisit without new evidence).

## PRIME LAW — DOMAINS DECIDE
A row without a verified domain is invisible (scoring off-profiles it, cloud-detect can't run; audit: 32,893 of 52,318 rows are dead weight for exactly this). Registry STAGING may hold domainless rows; the LIBRARY (`companies`) admits a row ONLY with a verified domain AND an ICP slice. Success metric = USABLE ACCOUNTS, never raw rows. Every phase logs the funnel: rows → staged → domained → in-band → cloud-read.

## PRE-FLIGHT (run once at campaign start, before any non-SE/NO load — BLOCKER fixes)
1. **orgnr uniqueness is per-country.** Verify the live unique index on `companies`. If a digits-only `companies_orgnr_norm_uidx` exists (audit D2), REBUILD it as UNIQUE `(country, regexp_replace(orgnr,'[^0-9]','','g'))` — FI/EE/CZ/UK are 8-digit, LT is 9-digit and collides with NO. Without this, legitimate foreign rows unique-violate against unrelated Nordic rows. Log the before/after index def.
2. **country CHECK constraint.** If a `country in (...)` CHECK exists (audit D4), widen it to the campaign set, ISO codes: `SE, NO, DK, FI, GB, EE, LV, LT, CZ`. Existing UK data uses `GB` — use GB, not UK, everywhere.
3. **staging architecture (pin it so sessions don't diverge):** each country gets a PERSISTENT `<cc>_registry` table mirroring `se_registry`'s role (survives, diffs on refresh) + TRANSIENT `stage_<cc>_*` tables dropped after transform. Never load a country into `companies` directly.
4. **tenant firewall:** new-country rows default-EXCLUDED from partner-facing prospect surfaces until I flip each country on (Activation-30D is Alto/Novalo, both Swedish, and is the standing priority). Verify the tenant query filters on country or list_tags before promoting any foreign row.
5. **rollback stamp:** every promotion into `companies` stamps `source='<cc>-campaign-<YYYY-MM-DD>'`. Rollback = delete-by-stamp. No promotion without it.

## THE LAWS (checked at every gate)
1. **GDPR floor — legal-form filter BEFORE staging, exact codes, counted in the gate log:** SE personnummer rows + `PERSON-IDORG`/`DODSBO` (Bolagsverket-file artifact); NO **ENK** (enkeltpersonforetak — and P0 `Ny` events carry ENK personal names, filter them there too); FI **toiminimi / yksityinen elinkeinonharjoittaja**; EE **FIE**; LV **IK** (individuālais komersants); LT **IĮ** (individuali įmonė) — but **MB (mažoji bendrija) is a legal entity, KEEP it**; CZ **OSVČ / fyzická osoba podnikající**. Person-level data (boards, roles, signatories) = Article 14 gate: per-orgnr at engagement time, never bulk. **Email→domain rule (verbatim, audit Stage C): split on `@`, keep ONLY the domain, never store or log the local-part** — applies to EE registry email and NO subunit epost.
2. **Never-scrape:** official registry endpoints, published bulk files, officially-published zone files (see ZONE TABLE), CT logs, DNS. A Cloudflare challenge / CAPTCHA / ToS wall = STOP that source, log it, move on. Sodra (LT employees) = known-blocked, never attempt. Aggregators (allabolag/proff/ratsit/UC) = never.
3. **Free-first ladder:** every enrichment walks free rungs before any paid rung. Paid = tranched with measured hit gates.
4. **Chain guard:** no domain lands in a shared group > 3 without `is_chain_outlet=true` (Norway Stage C pattern: freemail excluded, would-be group size checked). Applies across countries.
5. **Suppression carried:** dead/dying status loads WITH the row (konkurs, likvidation, dissolved, under_avveckling). **DK `reklamebeskyttelse` AND SE `Reklamsparrtyp` (SCB bulkfil col 18 — currently DROPPED by se-registry-weekly's awk slim; ADD it) = fine-backed hard suppression flags**, encoded before any outreach can ever see the row. The anti-trigger is an asset (spärrsignal).
6. **ONE vocabulary:** icp_score 70/40 untouched. New countries get `is_addressable`-style flags, never new score words. **"In-band" for employee-less countries (FI/LV/LT) = domained AND NACE/TOL-addressable** (size gate deferred), so the funnel table is always computable.
7. **Everything is an engine:** idempotent loader + format-drift + size gates + a scheduled refresh (systemd timer, `alloy-registry.timer` pattern) or the country rots. PEEK before load — never assume a format (the Bolagsverket "CSV" that wasn't). Commit each loader to `alloy-page/box/registry/<cc>/` with its receipt, **path-scoped commits only (never `git add -A`** — main triggers Amplify prod builds).
8. **Staging ≠ library:** promotion to `companies` only through domain gate + ICP slice + rollback stamp + liveness (DNS-resolve at promotion, since registry `website` fields are self-reported and decay).

## THE DOMAIN ENGINE (the centerpiece — ordered rungs, each: verified-hit-or-pass-down; `domain_source` stamped; chain-guarded; per-rung per-country stats in the ledger)
- **R0 AUTHORITATIVE registrant→orgnr map (best, use wherever it exists):** FI `https://odata.domain.fi/odata/Domains/` (OData, paginated, CC BY 4.0, legal-persons-only) returns every .fi domain joined to holder **OrganizationId** — a direct join, not a guess. This makes Finland domained on arrival. Check each country for an equivalent before dropping to R2.
- **R1 registry-native:** website/url field (FI PRH `website.url`, EE where present); registry email → domain (local-part discarded per law 1; freemail excluded; guard ≤ 3).
- **R2 zone-file name-match (ONLY on verified-open zones — see ZONE TABLE):** .se/.nu/.ee via AXFR (CC BY 4.0). Full name set pulled offline, matched to registry names. NOT available for .fi (R0 is better), .no/.dk/.lv/.lt (no open zone), .cz/.uk (gated).
- **R3 CT-log lookup — run FROM THE BOX** (crt.sh is blocked from Deno edge fns). Daily query cap (e.g. 5,000), accept partial coverage; stop-on-challenge per law 2.
- **R4 deterministic slug-guess:** name-normalize → candidate hosts → DNS A/MX → **content verify by ORGNR on the page preferred, name second**. A "verified hit" = DNS resolves AND (org-nr on site OR strong name match). Weaker = candidate, not a domain.
- **R5 PAID Claude domain-fill (country-gated fn):** PRECONDITION — the fn is SE/NO-only today (`domain-fill/index.ts` 400s on other countries; `min_employees` defaults to 10 which blocks employee-less FI/LV/LT unless nulled). Before R5 on any country: write + dry-run that country's PROMPT branch. Then tranched, first **300 rows = the gate at ~$10**; hit rate < 30% ⇒ STOP that country's paid rung permanently, log the receipt. Re-read `claude_budget` between tranches.
- **Per rung per country measure:** attempts, verified hits, and a **50-row false-positive audit = deterministic orgnr-on-site check, the 50 rows listed in the ledger for my spot-check** (not the matcher re-grading itself).

## ZONE TABLE (verified live 2026-07-17 — do not re-probe unless a route fails)
| TLD | R2 usable? | Route | Note |
|-----|-----------|-------|------|
| .se/.nu | YES | AXFR zonedata.iis.se, CC BY 4.0, hourly | courtesy email hostmaster@iis.se before heavy use |
| .ee | YES | AXFR zone.internet.ee, CC BY 4.0 | attribution required |
| .fi | use R0 instead | odata.domain.fi (org-nr join) | authoritative, better than name-match |
| .cz | NO (gated) | AXFR zone.nic.cz needs signed TSIG agreement; redistribution forbidden | disqualified for a resold data product — CZ domains via R3/R4/R5 only |
| .uk | file-once | Nominet zone + full domain list, free, but membership/approved application | not same-day; re-verify signup (Cloudflare blocked the page today) |
| .lv/.lt/.dk/.no | NO | stats only; Norid/Punktum explicitly refuse bulk | domains via registry email / R3 / R4 / R5 only |
ICANN CZDS = gTLDs only, zero ccTLDs, useless here.

## THE ORDER (reorder only with a written reason in the ledger)
**P0 — NORWAY FRESH** (highest value; proves the refresh pattern on a base you own). brreg `oppdateringer` nightly delta poll (`/oppdateringer/enheter?dato=…`, cursor `oppdateringsid`, endringstype Ny/Endring/Sletting): diff `konkurs`/`konkursdato`, `antallAnsatte`, `hjemmeside`, address → signal_events + companies refresh; Sletting → suppress; filter ENK from `Ny`. Then `underenheter` bulk join (850,835 subunits, `overordnetEnhet`): HQ-outlet graph hardens `is_chain_outlet`, adds per-location employees + domain surface. Free, no auth, NLOD. Expected: freshness on 3,381 addressable NO accounts + a live bankruptcy signal.

**P1 — FINLAND** (domained on arrival via R0). PRH/YTJ `all_companies` zip (anon GET) → `fi_registry`. Oy only; DROP housing corporations (~91,817); resolve status-code semantics from PRH docs BEFORE trusting "active" (code '2' unverified). Join R0 (odata.domain.fi org-nr map) → domains without guessing. **Promote ONLY through a TOL-2008 NACE allowlist (Norway Stage A pattern) — NOT all ~70k** (no employee field means `isTooLarge` can never fire, so NACE is the only gate keeping Finnish enterprises + hairdressers out of `companies`). Expected promote: the domained ∩ NACE-addressable slice (state the count in the ledger before promoting). Point the free cloud ladder at FI domains **in a low-priority lane, SE/NO first, FI daily cap** so the existing queue isn't starved. Attribution (PRH + odata.domain.fi CC BY) in the receipt. No paid size enrichment without a separate OK.

**P2 — ESTONIA** (best fields on the board; Baltic override recorded: load because breadth is now the asset, keep OUT of tenant surfaces per pre-flight #4). RIK basic + general files (CC BY 4.0) → `ee_registry`; EMTA quarterly employees/turnover join on registry code (**names the file/column behind the probe's 77.9% email-domain rate — if not obvious, budget a find step**). FIE filtered at load. R1 email→domain + R2 .ee zone name-match. EMTA gives the size gate AT LOAD → promote domained in-band (~6,052 expected). Attribution per CC BY.

**P3 — DOMAIN ENGINE HARDENING + LV/LT/CZ/UK to the extent it delivers**
- LV (`lv_registry`, UR CSV) + LT (`lt_registry`, JAR API): name/org-nr/status only, no NACE/employees/domains. Stage-and-HOLD. Run R3/R4 only on any ICP-sliceable subset; if none, hold with a receipt (do NOT mass-run paid R5 — they'd fail the domain gate wholesale). Verify LV VID (employees) live once; Sodra untouched.
- CZ (`cz_registry`, ARES bulk + ČSÚ RES 2x/month, KATPO size class): stage; **CZ is the single authorized R5 country** (largest sized-but-domainless pool, 81,795 in-band floor) — run the 300-row/$10 gate; promote only what clears the domain gate. Confirm ČSÚ licence at load.
- UK (`gb_registry`): Companies House monthly snapshot, stage FILTERED (live + SIC allowlist + size proxy), never the whole ~5M register; the `URI` column is a linked-data trap, not a website. **iXBRL accounts harvest: ONE monthly archive at a time — download, extract only (CompanyNumber, `AverageNumberEmployeesDuringPeriod`, period), delete before the next; hard STOP below 25GB free disk.** Dissolved = snapshot diff (dropped rows). Domains via R3/R4/R5-CZ-budget-permitting only.

**P4 — ARMED LOADERS (build now, fire on credentials)**
- Denmark: CVR Elasticsearch scroll loader (band filter on `intervalKodeAntalAnsatte`; window pinned 10-200 = brackets 10-19…100-199, note 200 sits in DK's 200-499; `reklamebeskyttelse` suppression; monthly headcount). **Validate the schema now against the anonymously-answering endpoints (`_mapping`, `offentliggoerelser/_search` both 200) so armed ≠ untested.** Fires the day ERST credentials arrive.
- Sweden: SCB emp_size join into se_registry + pre-written S6 promotion (juridisk_form 49, size class 10-199, status aktiv, SNI allowlist) + gated S7. Fires the day SCB credentials arrive. **Also now: add `Reklamsparrtyp` to scb_slim + se_registry (law 5 fix).**
- Ledger NAGS me about both emails (cvrselvbetjening@erst.dk, scbforetag@scb.se; drafts in REGISTRY_ROUTES_EU.md + SCB_FILE_GUIDE.md) in EVERY update until sent.

**P5 — STANDING REFRESH:** every loaded country gets its timer + drift gates + a cadence row in the ledger. A country without a refresh story is a bug.

## BUDGET + AUTHORIZATION (Jacob: numbers are set; edit before firing if you disagree)
- **Tokens/sessions:** authorized — that's what the refill is for. Weekly limits reset Wednesday; a session that dies on limits resumes from the ledger, no re-planning.
- **Box/DB/bandwidth:** free, authorized, with production protection (below).
- **Paid rung R5:** authorized up to **$50 total**, CZ only, one 300-row/$10 gate then tranches, 30% gate. Draws from the claude-proxy pool (~$445 headroom; that pool also runs Smith for live tenants — never let a tranche take the pool below $300 headroom; re-read `claude_budget` between tranches).
- **BuiltWith, Vainu expansion, any other paid vendor: NOT authorized — ask separately.**

## PRODUCTION PROTECTION (the box runs live Supabase for tenants — non-negotiable numeric STOPs)
- `df -h` before AND after each phase; **hard STOP below 25GB free.** Drop transient stages immediately after transform.
- Multi-GB pulls/transforms run **off-peak (box night, ~00:00-05:00 UTC)** and under `nice -n 15 ionice -c3`.
- Before each heavy phase, probe DB load; if a tenant-facing query is slow or locks appear, PAUSE that phase and log it. Keep COPY batches bounded; never hold a long lock on `companies`.
- These STOPs OVERRIDE the "don't stop" autonomy clause.

## OPERATING PROTOCOL (many hours, alone)
- Ledger = `C:\Users\jacob\alloy\LIBRARY_CAMPAIGN.md`: append per phase — what ran, every gate with its number, the funnel table, spend vs cap, what's armed/blocked, next move. Single resume point across sessions + limit resets.
- **On resume: re-run the funnel queries FIRST; if the DB disagrees with the ledger, the DB wins and you log the divergence** (a session killed mid-phase leaves aspirational entries).
- Verify with live probes; peek every file; gate every load; Bolagsverket is the standard (4 attempts, gates held, zero bad rows landed).
- Checkpoint-commit after every green phase, path-scoped, receipts included.
- STOP to ask only if: a law conflicts, a paid cap or the $300 pool floor would break, a production STOP fires, or something destructive/irreversible outside scope appears. Else: decide, log, continue.
- End-of-run report: funnel table per country (before/after), domains recovered per rung with hit rates, spend vs cap, what's armed, what's blocked, next session's first move.

## WHAT DONE LOOKS LIKE (with expected yields, so no mid-run guessing)
- `companies` holds every domained, NACE/size-sliced FI + EE account (FI ≈ the domained∩addressable Oy slice; EE ≈ ~6,052), each carrying `country` (ISO), `domain_source`, `is_addressable`, suppression flags, and the campaign `source` stamp — and none of them visible to tenants until I flip the country on.
- The domain engine exists as a reusable, measured ladder (R0-R5) with per-rung hit rates in the ledger — the domains problem has NUMBERS on it: R0 authoritative for FI, R1/R2 free for EE, R3/R4 free everywhere, R5 paid CZ-only. LV/LT held honestly if the engine couldn't domain them.
- Norway fresh (delta feed live) and correctly structured (subunit join done).
- DK + SE loaders armed and schema-validated, waiting only on my two emails.
- Every loader committed + timered. The ledger tells the whole story in one table.
