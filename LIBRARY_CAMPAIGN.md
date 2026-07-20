# LIBRARY CAMPAIGN — ledger (the resume point)

Instrument: `LIBRARY_CAMPAIGN_PROMPT.md` (v1). This file is the single source of truth across sessions and limit resets. On resume: re-run the funnel queries FIRST; if the DB disagrees with a claim here, the DB wins and the divergence gets logged.

Anchor date started: 2026-07-17 (Fri). Weekly limits reset Wednesdays. Paid rung R5 authorized $50 total, CZ only. Production STOPs: 25GB disk floor, off-peak for multi-GB, pool never below $300 headroom.

## FUNNEL (usable accounts, not raw rows) — update every phase
| Country | staged | domained | in-band | cloud-read | promoted to `companies` | refresh live? |
|---------|--------|----------|---------|-----------|------------------------|---------------|
| SE | 820,926 (se_registry) | — | — | — | (existing SE library) | ✅ weekly Bolagsverket bulk (alloy-registry.timer) |
| NO | 35,458 (companies) | **15,749** (+1,841 from underenheter) | 3,381 addressable | flowing | (existing NO library) | ✅ **brreg-updates every 4h (self-draining) + underenheter join DONE** |
| FI | **316,098** (fi_registry) | 68,434 | 16,794 dom+TOL | draining (cloudcheck 5-min crons) | **14,694** (DNS-verified, 1,223 chain-flagged, tenant-excluded) | ✅ P1 DONE 2026-07-17; refresh cadence TODO |
| EE | — | — | — | — | — | ⏳ P2 |
| LV/LT | — | — | — | — | — | ⏳ P3 stage-and-hold |
| CZ | — | — | — | — | — | ⏳ P3 (R5 country) |
| UK | — | — | — | — | — | ⏳ P3 |
| DK | — | — | — | — | — | 🔒 armed loader pending ERST email |

## PRE-FLIGHT — status
- [ ] orgnr unique index → rebuild as `(country, digits)` before any non-Nordic promotion (UNVERIFIED whether a digits-only index exists live; check before P1's promote step — FI is 8-digit)
- [ ] country CHECK → widen to ISO set incl. GB/EE/LV/LT/CZ (check live before P1)
- [x] staging pattern pinned: persistent `<cc>_registry` + transient `stage_<cc>_*`
- [ ] tenant firewall: verify foreign rows excluded from partner surfaces before promoting any
- [x] rollback stamp convention: `source='<cc>-campaign-<date>'`

## LOG

### 2026-07-17 — P0 Norway refresh: brreg-updates delta feed
- **Built + deployed + verified LIVE.** `supabase/functions/brreg-updates/index.ts` (manifest-tracked), migration `box/sql/2026-07-17-brreg-updates.sql` (source CHECK widened to include 'brreg'; cron `brreg-updates-nightly` @ 04:00 UTC). Commits f670982, ce707b3.
- Polls brreg `oppdateringer/enheter` (cursor = last `oppdateringsid` in `signal_feed_state` source='brreg-no'), intersects with the 35,458 NO base, refreshes konkurs/likvidation/employees/new-domain/address + fires `signal_events` source='brreg' (dereg, konkurs=suppression, employee_growth, new_domain chain-guarded). ENK filtered (law 1). Free, NLOD.
- Dry-run (2-day seed): 18,848 updates pulled, **8,277 of our NO orgs changed**, real signals (employee jumps 12→18/25→32, 3 dereg, 2 konkurs). Caught a correctness bug — hydrate budget could skip orgs past the cursor; fixed to id-ordered cursor that advances only to the last fully-resolved id (self-draining, zero loss). Wall-time guard 120s, nightly hydrate default 700.
- **LIVE DRAIN DONE + VERIFIED (14 runs).** Cursor 0 → 24,874,060. Patches verified landing on `companies`: signal "Ansatte 16→21" → employees=21 + enrichment.brreg.ansatte=21 (both synced); 5 konkurs → stage='konkurs'. signal_events source='brreg': **498 rows, 498/498 matched** (employee_growth 488, konkurs 5, dereg 3, new_domain 2). ~9,600 NO companies had employees refreshed.
- **CADENCE FIX (measured, important):** live NO churn = **4,328 country updates/day, ~44% ours ≈ 1,900 library orgs/day needing a hydrate** — above one run's 700 budget, so nightly would lag forever. Cron changed nightly → **every 4h** (`brreg-updates-4h`, 6×700=4,200/day) so it self-drains the ~26k-id backlog over ~2 days and stays caught up. Commit fce318c.
- **P0 PART 1 (delta feed) = DONE + SELF-SUSTAINING.** Backlog drains automatically via the 4h cron (no further manual runs needed).
### 2026-07-17 — P0 part 2: underenheter join DONE
- `box/registry/no-underenheter/` (run.sh + no_under_agg.py + no_under.sql), committed 4a4e81b. One-shot, re-runnable. Streams the 1.03M-row underenheter CSV, aggregates per parent HQ.
- **Result: 1,841 free domains recovered** for domainless NO HQs (from sub-unit hjemmeside/epost, chain-guarded); domainless NO **21,550 → 19,709**; outlet_count + sub_employees stamped on 35,386 HQs; +430 chain flags. Recovered domains flow to the free cloud ladder.
- GOTCHAS (folded into the SQL): Supabase postgres role can't server-side COPY → use `\copy`; the correlated-subquery chain-guard TIMED OUT (no lower(domain) index) → rewrote to a grouped pass + `create index companies_lower_domain_idx`. Killed the hung query cleanly (only row locks, no prod impact).

### 2026-07-17 — P1 Finland: staging IN PROGRESS
- Pre-flight GREEN, no changes needed: NO unique orgnr constraint exists (only non-unique `idx_companies_orgnr_nodash`), NO country CHECK exists (FI/GB/DK rows already coexist) → red-team blockers #1/#2 don't apply. pip3 present (ijson installable). Disk 86GB.
- **Spec corrected from research (`w4mjkt9gq`):** bulk `all_companies` = 1.44GB JSON array, 460,988 records; **website.url IS in the bulk** (~25.8% coverage) = the domain source; **odata.domain.fi is DEAD (404s → Traficom redirect)** so R0 authoritative join is unavailable, domain = register website only. KEEP-whitelist form type '16' (Oy); active = tradeRegisterStatus=='1' AND status=='2'; insolvency KONK/SELTILA/SANE carried+excluded. `box/registry/fi/` (fi_schema.sql + fi_load.py + run.sh), NOT yet committed.
- **P1 DONE (2026-07-17, commits 580b744 + 6155301):** staged 316,098 active Oy (of 460,988 records; KEEP-whitelist form 16, active = tradeRegisterStatus 1 AND status 2; 8,869 insolvent carried+excluded). Funnel: 68,434 domained → 16,794 domained+TOL-addressable → 16,327 non-insolvent candidates → **14,694 DNS-verified (90.0%) → 14,694 PROMOTED** to companies (country=FI, project_id='finland' tenant-excluded, source='fi-campaign-2026-07-17', CC BY attribution stamped, 1,223 chain-flagged). All 14,694 cloud_pending → the existing cloudcheck-batch + cloud-escalate-batch crons (every 5 min, no country scoping) drain FI + the 1,841 recovered NO domains automatically. **The FI promoted cohort alone is ~3x the pre-campaign usable base (~4,700).**
- REMAINING for FI: a weekly refresh cadence (re-download bulk, diff status/insolvency/website, new formations) — same pattern as alloy-registry.timer; TODO next session.

### 2026-07-17 — Bolagsverket API credentials ARRIVED (Jacob registered; zips in Downloads)
- Prod + test client id/secret received from api@bolagsverket.se (OAuth2 client-credentials, token endpoint portal.api.bolagsverket.se/oauth2/token). **This is the token the omsättning probe 401'd on** → unlocks the HVD årsredovisningar API: SE turnover + iXBRL `medelantal anställda` = the SCB-INDEPENDENT employee/size backup route for the 651,490 aktiv ABs.
- **Jacob's move:** run `python C:\Users\jacob\alloy-page\box\registry\bolagsverket-api\install_bolagsverket_creds.py` in PowerShell, type the SMS code from 300595 when prompted (masked). It validates against the live token endpoint, then pushes to the box as `/opt/registry/secrets/bolagsverket.env` (chmod 600). NEVER paste the code or zip contents in chat.
- **INSTALLED + VERIFIED END-TO-END 2026-07-17.** Creds live at `/opt/registry/secrets/bolagsverket.env` (chmod 600). API CONTRACT (all live-verified, secrets never in chat):
  - Token: `POST https://portal.api.bolagsverket.se/oauth2/token`, OAuth2 client-credentials, **scope `vardefulla-datamangder vardefulla-datamangder:read vd:read read`** (bare token gets scope 'default' and 403s the API — MUST request the scope). 1h expiry.
  - API base = **`https://gw.api.bolagsverket.se/vardefulla-datamangder/v1`** (the `gw.` host, NOT `portal.`). `POST /organisationer {identitetsbeteckning}` → SNI + juridisk form + status. `POST /dokumentlista {identitetsbeteckning}` → [{dokumentId (…_paket), rapporteringsperiodTom, registreringstidpunkt}]. `GET /dokument/{dokumentId}` → zip paket (iXBRL årsredovisning).
  - **Parser PROVEN on Novalo (5594276411): nettoomsättning 2,924,586 SEK, medelantal anställda 2, FY 2025-12-31.** iXBRL: `ix:nonFraction name="…Nettoomsattning"` + `…MedelantaletAnstallda`, pick the fact whose context has the latest endDate; apply scale + sign.
- Fetcher: `box/registry/bolagsverket-api/arsredovisning_fetch.py` (`--selftest <orgnr>`, `--batch <N>`, marks `bolagsverket_at`). Added `companies.bolagsverket_at`. **DRAIN LIVE: `alloy-arsredovisning.timer` runs `--batch 150` every 8 min, self-limiting** → the 16,617 SE library drains over ~15h, free. Commits f2fe689 + 2fd74ba.
- ⚠️ **COVERAGE = ~63-67%, verified** (random-AB test 8/12; matches the digital-filer rate). NOT a bug — the ~1/3 misses are 556-era ABs that file on PAPER (no digital iXBRL). Skew is toward NEWER digital-native ABs = well-aligned with Desk 10-200. First batch showed 12% only because it sorted highest-icp-first (front-loads established paper filers); `bolagsverket_at` marks them tried so the drain covers everyone once. Both orgnr formats work (11-dash 11,655 + 10-nodash 3,608 SE rows).
- The SCB email is now OPTIONAL (registry-native size class still marginally cleaner, but this delivers today on ~2/3 of ABs). Future refinement: annual re-fetch (reset bolagsverket_at >1yr) for a refresh cadence; extend the fetcher to the se_registry aktiv pool once those promote.

### 2026-07-17 — SWEDEN domain optimization (focus request, strict budget)
- **Assessment:** SE was 58.5% domained (9,719/16,617); 6,898 domainless (many are se-fastighet property SPVs with no website). Domainless rows can't be scored (choke point).
- **FREE rung DONE (`box/registry/se-zone/`, commit b5ebe8a):** pulled the IIS `.se` zone (1,418,185 domains, CC BY 4.0) as the oracle; name-slug match + homepage verify → **522 verified domains recovered at $0** (61 org-nr-proven, 461 exact-distinctive-name; generic short words gated to require org-nr). SE domained 9,719 → **10,241 (61.6%)**, chain-guarded, tagged `enrichment.domain_source=se-zone-{strong,medium}`. Flowing to cloud-detect. Re-runnable (one-shot, not cronned).
- **RESIDUAL for paid:** 6,376 domainless; **non-property untried = 2,920** (plausibly ICP mid-market — pulled as such but Vainu-unmatched); **confirmed sized 10-200 non-property = 0** (domainless = unsized). Their domains are NOT their names (zone rung missed them) → only paid web-search domain-fill (SE prompt exists; pass min_employees:null to include unsized) can find them. Historic hit ~30-40%.
- **PAID tier DONE (Jacob approved $15 gated).** Two runs: curated workspaces (novalo/alto/top-1000) = **45% hit (63/140, $5.18)**; broad se-scan pool = **11% hit (16/150, $5.50) → KILL-GATE TRIPPED** and auto-stopped. **Total: 79 paid domains, ~$10.68 of $15, self-stopped.** LESSON: pay for CURATED ICP lists, not broad Vainu pulls. First-run bug (docker-curl timeout misread as "exhausted" → skipped se-scan) fixed with a dry_run exhaustion probe + image pre-pull (commit 748f493).
- **SE RESULT: 58.5% → 62.2% domained** (9,719 → 10,331; +522 free zone + 79 paid = 601 new; 901 chain-flagged). Remaining 6,286 domainless = mostly property SPVs (no sites) + low-yield se-scan residual. Diminishing returns on paid; the free CZDS `.com` oracle is the next lever.
- **CZDS `.com` oracle = the next free win (Jacob applying 2026-07-17).** Registered CZDS as Novalo Technologies AB, requesting All Available TLDs (1,123), reason = data-enrichment/market-analysis. `.org`+new-gTLDs approve fast, `.com`/`.net` (Verisign) days. When `.com` lands: generalize the se-zone engine to a multi-TLD on-disk/DB oracle (160M won't fit RAM), extend matcher to try `.com`/`.org` per company, re-run the free rung library-wide. `.io`/`.ai` = ccTLDs NOT in CZDS + thin for Nordic ICP → per-candidate DNS/CT-log probe only, never bulk (see [[eu-registry-routes]] note).

### 2026-07-17 — CZDS status + CT-logs verdict
- **CZDS (Jacob's export `zone_requests_all_2026-07-17.csv`): 856 approved / 267 pending of 1,123.** Approved incl. `.org .info .cloud .tech .app .dev .xyz .online .site .shop .store`. **PENDING (Verisign, days): `.com .net .biz`** — the ones that matter. WAIT for `.com`, then wire the multi-TLD oracle (don't do a half-pass on .org+tech now). No Jacob action; approvals self-flip.
- **⛔ CT-logs org-name search = DEAD END for cold domain-finding (tested, 0/12).** crt.sh `?O=CompanyName` keys on the cert Subject ORGANIZATION field = OV/EV certs only; Nordic SMEs use Let's Encrypt DV (no O field). Verified the method works (Spotify O-query returns domains) so 0/12 is real, not a broken query. **Do NOT build CT as a domain-recovery rung.** CT stays useful ONLY for enumerating a KNOWN company's other subdomains/certs, never for finding a domainless company's first domain. The free lever for the residual is the CZDS `.com` oracle; the paid lever is curated-lists-only domain-fill.

## OPEN NAGS (every update until cleared)
- 📧 **Jacob: send the SCB email** (scbforetag@scb.se) — unlocks the SE employee size class (S6/S7). Draft in `SCB_FILE_GUIDE.md` §4.
- 📧 **Jacob: send the Denmark CVR email** (cvrselvbetjening@erst.dk) — ~3-week clock, unlocks the best-fielded EU country. Draft in `REGISTRY_ROUTES_EU.md`.
