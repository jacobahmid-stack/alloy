# ALLOY LIBRARY: THE AUDIT AND THE COMPLETION PLAN
**Written 2026-07-16. Every figure measured against the live box (i-0f5162624bebb00d8, `supabase-db`) and independently re-measured by a second pass. Anything not measured is labelled ESTIMATE or CEILING. Four figures in MEMORY are stale and are corrected below.**

---

## 1. THE AUDIT

### The single most important finding

**The library is 52,318 rows and roughly 4,700 usable accounts.** Everything else is either a Norwegian census we loaded because it was free, or a Swedish registry snapshot that stopped in 2019 and cannot be enriched for free.

Concretely: **"complete Sweden" is 2,375 companies today, not 12,773. "Addressable Norway" is 3,381, not 35,409, and its AWS installed base is 149 distinct domains against Sweden's 1,124.** Norway is 67.7% of the library by row count and delivers about 13% of Sweden's addressable AWS base.

**Stop quoting 51,868 or 52,318 as the library.** The defensible sentence is: *~4,700 enriched Nordic accounts, of which 2,375 are fully contactable, on a base of 52,318 registry-grade rows.*

### The library in numbers

| Country | Rows | Domained | Cloud read | Sized | In ICP window | Contacts |
|---|---|---|---|---|---|---|
| NO | 35,409 | 9,414 (26.6%) | 9,414 | 35,406 (100%) | 34,260 (10 to 200) | **59, across 13 companies** |
| SE | 12,773 | 8,650 (67.7%) | 8,643 | 6,745 (53%) | 4,910 (10 to 500) | 43,985, across 7,100 companies |
| country NULL | 4,105 | 825 | partial | few | n/a | few |
| DK / FI / GB | 31 | | | | | |
| **Total** | **52,318** | **19,425** | **19,420** | | | **53,894** |

Other tables: `contacts` 53,894 · `se_registry` 489,063 · `account_readiness_state` 52,318 (0 orphans) · `funding_eligibility` 18,929 (0 orphans) · `kb_chunks` 16,906 · `company_cloud` 5,188 (0 orphans) · `engagements` 5,185 · `company_signals` 2,199 · `signal_events` 171 · `smith_account_memory` 747.

### What is enriched, and with what

**Free and working:**
- `no-ingest` (Brønnøysund): gave us 35,409 NO companies, 100% headcount, and 9,414 domains from brreg's own `hjemmeside` field. Finished 2026-07-03.
- `aws-detect` + `cloud-detect` (DoH, AWS ip-ranges, CT logs, Team Cymru ASN): 19,420 cloud reads. **Domained-but-uncloud-read is 7 rows in SE and 0 in NO.** Cloud is free and follows domain roughly 1:1. Residue: 7,559 tier-2 escalations, about 9 days at current cron limits.
- `funding-eligibility` (deterministic, never an LLM): 18,929 rows.
- `se-ingest` / `se-registry`: 489,063 Swedish ABs, free, one-shot.
- Signal feeders: `jobtech` and `nav-feed` are genuinely producing on cron. `vinnova`, `ted-awards` and `explorium-events` are not (see Defect 8).

**Paid, and effectively parked:**
- `vainu-se-scan`: 5,011 companies, the only cohort with 100% domain and 95% headcount. **SE-only by contract.** ~$441 spent of a quota nobody has re-measured.
- `builtwith-lookup`: 9,969 done, **3 of them Norwegian**.
- `maturity-fill`: 762 SE, **3 NO**.
- `explorium-people`: 184 prospect_ids, 48 business_ids, and **55 of Norway's 59 contacts**. The NO path is proven in production.
- `domain-fill`, `icp-screen`, `bulk-enrich`, `property-scan`, `icp-brief`: deployed, no cron, idle.

**Budget:** `claude_budget` cap **$900**, spent **$455.28**, headroom **$444.72**. Burn is about $0.50/day. Every paid pipeline is parked.

### Four MEMORY corrections

1. **The cap is $900, code-enforced.** `claude-proxy` L541-546 reads `claude_budget.cap_usd` and refuses at `spent >= cap`. There is no `700` anywhere in the file. The "$700 soft cap" is fiction.
2. **The Explorium key is live and in production use.** BACKLOG and MEMORY both say PENDING. It is set on the box with 184 live prospect_ids.
3. **"Vainu spend ~$441 of $900" is almost certainly the `claude_budget` row read a second time under a different name.** Vainu's real remaining quota is unknown and is a Jacob question.
4. **The library is 52,318**, and Norway's defensible contribution is 3,381 / 149.

### Honest state per country

**Sweden: enriched, small, and cannot grow for free.** 4,910 sized-and-domained, 2,375 complete, 593 at `icp_score >= 70`. Do not substitute 593 for the legacy 599 figure: 599 was the Vainu/Alto partner-routed count (measured today: 403). Different populations.

**Norway: a census of employers, not a library of accounts.** Loaded at a 10+ floor across all sectors in a country of 5.5M, so it returned the franchise layer. NACE 62 (IT) is **1,006 rows, 2.9% of the window**. Retail plus restaurants plus construction plus education plus transport is **48.5%**.

---

## 2. THE GAPS, RANKED BY PIPELINE COST

An account with no domain is invisible to Smith: no cloud read, no play, no meeting. That is the ranking axis.

| Rank | Gap | Rows | What it costs us |
|---|---|---|---|
| **1** | **No domain** | **32,893 of 52,318** | Total invisibility. `isOffProfile()` (scoring.js:96-103) returns true on a missing domain. `funding-eligibility` gates on `.not("domain","is",null)`. `builtwith-lookup` refuses. `aws-detect` cannot run. These rows exist and do nothing. |
| **2** | **Norway has no contacts** | **35,396 of 35,409** | 59 contacts total, across 13 companies. Even the 149 AWS accounts are unreachable. Vainu will never cover NO. |
| **3** | **Norway is unscored** | **9,411 domained NO rows have `icp_score IS NULL`** | Every one is already cloud-scanned. The scorer has simply never been pointed at Norway. No brief, no Hett, no trio. |
| **4** | **The `independent` blind spot** | **2,340 SE (avg score 32.7) + 1,920 NO** | Mid-market, domained, no hyperscaler, `aws_detected = 0` on every one. That is the textbook MAP Assess / rival-cloud POC cohort, the exact lane the funding platform is built for, and it scores cold and therefore invisible. |
| **5** | **Chain-domain corruption in Norway** | **1,432 rows + 15 junk** | Not thin data, *wrong* data. `KIOSKDRIFT ANETTE AS` (10 employees) carries `domain = narvesen.no` and therefore Narvesen's cloud verdict, written 28 times as 28 companies. Smith would pitch a kiosk on the chain's stack. |
| **6** | **3,940 blind-promoted rows with neither domain nor headcount** | 3,940 of 4,358 | Manufactured by the nightly feeder. Structurally invisible from birth. Still growing at 80/night. |
| **7** | **Sweden's unsized rows** | **1,905 domained but unsized** | The cheapest real win in the estate. ~$25 converts them straight into the 10-500 window. |
| **8** | **country = NULL** | 4,105 | Cannot be country-gated, so cannot be safely enriched. 49 of them are Norwegian. |
| **9** | **No liveness, no post-2019 companies** | 474,315 unpromoted | `se_registry` `reg_date` 2020+ = **88 rows**; `202001` = **1**; `status` **100% NULL**. Six and a half years of Swedish ABs are invisible and we cannot tell which of the 489,063 are dead. |

---

## 3. THE DEFECTS

### FREE AND SAFE (run tonight)

**D1. `domain-fill` is misfiring at Norway today. This is the top item in the document.**
The function has **no country filter and no employees filter**. Its query is `.or("domain.is.null,domain.eq.").is("enrichment->>domain_tried", null)`, scoped only by project, source, and orgnr-digit shard. Measured untried pool: **NO 25,995 / SE 3,339 / NULL 2,576 = 31,910, i.e. 81% Norwegian**. The prompt is hardcoded Swedish (grep it; two independent reads placed it at line 50 and line 54): *"Find this exact Swedish company's official website domain... look it up on allabolag.se / ratsit.se / proff.se BY ORG-NR"*. Those registries do not cover Norway. And **a miss writes `enrichment.domain_tried = true` permanently** (documented at index.ts:4 as the anti-retry marker). One unfiltered run irreversibly poisons ~26k rows. There is no undo.
**Fix:** country-branch the prompt (NO to proff.no / 1881.no / brreg.no), add the `employees >= 10` gate the plans assume and the code does not have, and lean `web_search max_uses` from 3 to 2. BACKLOG task #14 claims that lean landed; it did not land here.
**Gate:** a dry run with `{country:'SE', min_employees:10}` returns 0 NO rows and 0 rows under 10 employees.

**D2. The normalized-orgnr unique index, before any promotion.**
Both existing dupes are pure formatting collisions (`556091-1256` vs `5560911256`, `556310-7134` vs `5563107134`), and `companies.orgnr` is mixed-format (11,674 dashed / 39,018 undashed). Merge the 2 by hand first (do not script it: stages live only in `engagements`), then:
```sql
create unique index concurrently companies_orgnr_norm_uidx
  on public.companies ((regexp_replace(orgnr,'[^0-9]','','g')))
  where orgnr is not null and orgnr <> '';
```
474,315 registry rows are queued behind this and they join on exactly this normalization. Adding it afterwards is a much worse job.
**Do NOT dedup on domain.** 893 groups, 1,713 excess rows, and `fastighetsbyran.se` resolves to **10 legally distinct ABs in 10 cities**. Naive domain dedup destroys real franchisee accounts.

**D3. Stop the leak.** Unschedule `feed-free-prospects-nightly` (jobid 1). It has added **exactly 80 rows on every one of the last 20 nights**, and 3,940 of the 4,358 it has produced carry neither domain nor headcount. Its Novalo lane hardcodes SNI `62100, 58290, 63100, 58210`, which is the worst-yielding sector in the library (see D5). Same sitting: unschedule `chatbot-detect`. Its candidate pool measures **0** and it has burned **1,440 successful runs in 48h** on an empty gate.

**D4. Country backfill, orgnr rule first.** `Kvitten konsult AB` (orgnr 5566180146, domain `kvitten.no`, city ÅHUS) is a Swedish AB with a `.no` domain. A TLD-first rule mislabels it.
```sql
-- 1) registry-proven Swedish. Expect 3,844.
update public.companies c set country='SE'
where c.country is null and c.orgnr is not null and c.orgnr <> ''
  and exists (select 1 from public.se_registry r
              where regexp_replace(r.orgnr,'[^0-9]','','g') = regexp_replace(c.orgnr,'[^0-9]','','g'));
-- 2) Norwegian by domain, orgnr-less only. Expect 49.
update public.companies set country='NO'
where country is null and (orgnr is null or orgnr='') and domain like '%.no';
```
Residual 212 rows by hand, one sitting. Then fix the `novalo-import-fixed` and `SaaS Re-sell` importers and add `check (country is null or country in ('SE','NO','DK','FI','GB'))`.

**D5. Chain-outlet flag (Norway). Flag, do not null.** Set `is_chain_outlet` on the 1,432 shared-domain rows plus 15 junk-domain rows (facebook.com and similar). **Nulling the domain is destructive**: the 1,432 includes the chain HQ's own legitimate row, it destroys true parent/subsidiary pairs, and `sulland.no` x19 is a car-dealer group where the outlet plausibly is the buying unit. Suppress cloud verdicts and scores on flagged rows.

**D6. Dead schema.** Drop `champion_checked_at` (**0 of 52,318 populated, ever**; one repo reference, the create line). Drop `icp_band` after fixing its one bad reader. Convert `techstack_at` from `text` to `timestamptz` (verified safe: 9,969 non-null, 0 failing `^\d{4}-\d{2}-\d{2}T`). Note `leadanalysis_at` is 2 rows and `next_action_at` is 0, so that pair is cosmetic.

### NEEDS A CALL

**D7. The `icp_band` reader bug is real but nearly harmless, and it was mis-ranked.**
`smith-brief/index.ts:319` reads `band: c.icp_band || (...)`, letting the dead column win. The cross-tab is alarming (52% of "strong" score cold, 14 "weak" score hot). But line 316 filters `stage='lead'`, and **exactly 1 row of 52,318 has both a lead stage and a band**: `Bambora Group AB`, score 62, band 'moderate', project `forj-q`, which every partner-scoped brief filters out by `project_id`. **Partner-visible impact is zero.** Take the one-liner as latent-defect hygiene because a stage flip re-arms it, not as an emergency. Same commit: collapse the vocabulary drift (`scoring.js icpBand` returns hot/warm/**cold**, `smith-tools.js:15 bandOf` returns hot/warm/**cool**, and `smith-tools.test.js:77` asserts "cool", so the drift is test-locked).

**D8. Three of four signal feeders are manual backfills wearing a cron badge.**
`ted-awards-weekly` and `explorium-events-weekly` have **zero rows in `cron.job_run_details` across the entire 41,821-row retained history spanning four Mondays**. They have never fired. TED's 36 events and Vinnova's 76 all landed in one manual invocation at 2026-07-15 11:50. Only `jobtech` (04:30) and `nav-feed` (05:15) have genuinely cron-produced events. The "explorium-events is coverage-bound" diagnosis is a story about a function that has never run. **Call:** investigate the two dead schedules before trusting any signal-lane claim.

**D9. The enrichment-stamp trigger must be `before insert or update`, not update-only.**
No code in the repo writes `icp_at` or `icp_band` at all (`grep -rE "icp_at\s*[:=]"` returns zero hits): they are write-dead schema. Coverage is `icp_score` 7,183 vs `icp_at` 1,125 (15.7%), every stamp dated 2026-05-31, one batch. **The proposed trigger fires on UPDATE only, so the bulk INSERTs that this entire plan is built on would still land undated**, and `old.icp_score` raises on INSERT. It needs `before insert or update` with an `old is null` guard per branch. **Do not backfill the 6,058 undated scores**: null correctly reads as "unknown age". You cannot age out what you cannot date, so there is no re-scan policy until this lands.

**D10. The `independent` fix is in `cloudEco`, not `icpScore`. The obvious one-liner is a no-op.**
`cloudEco()` (scoring.js:51-56) **never returns 'independent'**. It returns `cloud_ecosystem` only for aws/azure/gcp and otherwise falls through to `cloud_provider`, where these rows measure `other` 1,708 / `cloudflare` 353 / `unknown` 246 / `none` 33. So **88% already score 5 points, not 0**. The defect is the 23-point gap between 5 and 28, and the patch site is **`cloudEco` (scoring.js:51-56)**. Anyone who follows the "one-line fix at 65-66" instruction ships a no-op and believes it is fixed.
**Call for Jacob:** how many `icp_score` points is "mid-market, domained, no hyperscaler" worth? That is the MAP Assess lane's visibility. It is a positioning decision, not a code decision.

**D11. `company_cloud` is a half-populated Sunday artifact.** 5,188 rows, **all dated 2026-06-20** (min = max), 5,188 distinct company_id (not one company has a second row, despite a multi-cloud schema), country split SE 4,471 / NO **3**. It looks authoritative and is 26 days stale with no refresh path. **Call:** backfill or drop. Do not leave it. And price the backfill first: it carries `confidence, spend_band, services jsonb, maturity, alignment, fit_score, signals`, which is enrichment depth, not a DNS lookup, and 14,232 rows of it is the largest unpriced batch anyone has proposed.

**D12. A live anon JWT is committed at `champion_watch.sql:17`** (ref nvjizahtcqgmfhiodtej, role anon, exp 2036), while line 18 directly below already reads `x-cron-key` from `cron_auth`. Bounded by RLS, but it is a committed credential in a repo whose IP title is already a NORTH_STAR_GAPS item. Rotate it. Related: `champion-watch/index.ts:77-78` ranks by engagement then `icp_score` and `.slice(0, limit)` with **no recently-watched exclusion**, so it deterministically re-picks the same head every Monday. The "self-draining pool" does not drain.

**D13. Hold the 11 backup tables. — RESOLVED 2026-07-17: dropped, sequence honored.** pg_dump→S3 was already nightly-live; a FULL restore drill into a scratch db passed the same day (row parity on all key tables, receipt in `alloy-page/box/RESTORE.md`), then all 11 dropped in one transaction (615→605 MB). Historical copies now live only inside the dumps (local 14 d, S3 lifecycle). Original finding kept below for the record. 10.6 MB, about 2% of a DB dominated by `kb_chunks` 288 MB and `se_registry` 120 MB. Dropping them reclaims nothing and costs the only historical copies in a database with **zero backups** (the existential NORTH_STAR_GAPS item). 590 of `dedup_backup_companies`' 1,188 ids are still live in `companies`, so it is a pre-modification snapshot, not a graveyard. `_goteborg_aws_backup` is load-bearing rollback. **Sequence: pg_dump to S3, verify one restore, then drop all 11 in one commit.**

---

## 4. SWEDEN: THE COMPLETION PLAN

**The governing fact: `se_registry` cannot complete Sweden.** It is a 2019 snapshot with no employees column, no status, and empty `raw` jsonb. Every breadth stage is downstream of replacing that file, which is not ours to execute.

**Two things the plan does not need to build:** `icp-screen` **already sizes before it domain-fills** (`index.ts:113` computes `qualified = emp >= minEmp`, `:115` calls `find_domain` only if qualified). The "inverted order" defect is confined to the `feed_free_prospects` pg function. The fix is to redirect a cron, not re-architect a pipeline.

| Stage | What | Rows | Cost | Wall-clock | Proof gate |
|---|---|---|---|---|---|
| **S0** | Stop the leak (D3) | halts 80/night | $0 | 15 min | Zero new `Bolagsverket/SCB (free nightly feed)` rows after the cut date |
| **S1** | Guards: orgnr index, insert-or-update trigger, `techstack_at` type, D6/D7 housekeeping | n/a | $0 | ~2h | Re-inserting `556091-1256` fails; an INSERT with a score lands with a non-null `icp_at`; `icp_band` errors (column gone) |
| **S2** | Country backfill (D4) | 4,105 to 212 | $0 | 20 min + one sitting | `country is null` = 212; both statements idempotent |
| **S3** | Gate `domain-fill` (D1). **BLOCKING for S4 and S7** | n/a | $0 | ~2h + deploy | Dry run returns 0 NO rows, 0 under-10-employee rows |
| **S4** | **Size the 1,905 domained-but-unsized SE rows.** The best-value spend in the estate | 1,905 | **~$25** (ceiling $38) | 4 to 6h ESTIMATE, 429-bound | `employees is not null` 6,745 to ~8,300; window 4,910 to ~6,000-6,300 ESTIMATE |
| **S5** | **JACOB GATE: a registry file with `emp_size` and `status`** | 489,063 | $0 if HVD, unknown if ordered | file turnaround + 30 min | `emp_size` non-null on >90% of ABs; a `status` column; `count(*) where reg_date >= '2020'` > 0 |
| **S6** | Registry promotion, size- and sector-gated | ~17-21k ESTIMATE | $0 | minutes | 0 rows with `emp_size < 10`; count within 20% of the S5 prediction; 20 random names, no shells |
| **S7** | Domain-fill the promoted pool, tranched | ~17-21k | **$375-672** | 1 to 2 days ESTIMATE | **Measure the hit rate on the first 1,000 rows. Below 30%, STOP.** |
| **S8** | Cloud-read (existing crons, unattended) | follows domain 1:1 | $0 | 1 to 3 days | `domained_no_cloud` < 20 for SE |
| **S9** | The `cloudEco` fix (D10) | 2,340 | $0 | ~1h | `scoring.test.js` covers the branch; warm count moves to a number Jacob signs off |
| **S10** | Contacts | decision, not a stage | see below | | |

**S4 mechanism:** `icp-screen` reads from `se_registry`, so it cannot serve already-promoted rows. Add a `mode:'size-only'` branch (~30 lines) selecting `companies where country='SE' and domain is not null and employees is null`, calling `find_firmographics` only. Do not use `bulk-enrich` (Sonnet, highest per-row in the estate).

**S6, the rule that keeps 400k shells out:**
```
juridisk_form = '49'                        -- AB. 488,161 of 489,063.
AND emp_size >= '10-19'                     -- S5. THE gate. ~86% of the register dies here.
AND status = 'active'                       -- S5. Today status is 100% NULL: unknowable.
AND sni_code NOT LIKE '00%'                 -- 43,796 dormant. Vainu cohort: 2/78 reach 10 emp.
AND SNI2 IN <allowlist>                     -- the gate ALWAYS requires sni_code = ANY(p_sni).
AND postort <> ''
AND name !~* '(holding|invest|förvaltning|intressenter|fastighet|likvidation|konkurs|vilande|lagerbolag)'
AND NOT EXISTS (... regexp_replace(c.orgnr,'[^0-9]','','g') = r.orgnr)
```
The regex is **nine** terms and it filters `fastighet` **by name**, which self-limits real estate whether or not you allow the sector.

**Sector allowlist, by measured hot rate** (the 5,011 vainu-se-scan rows, the only unbiased cohort):

| Priority | SNI2 | Sector | Hot | Major cloud | Survivors (2019 file) |
|---|---|---|---|---|---|
| 1 | 41,42,43 | Construction | 14-25% | 42-45% | 45,900 |
| 2 | 10-33 | Industry | 13-15% | 59-61% | 21,244 |
| 3 | 46 | Wholesale | 11% | 48% | 22,648 |
| 4 | 68 | **Real estate, explicit call** | 23-24% | 49% | 27,826 |
| 5 | 49-53 | Transport | | | 13,360 |
| 6 | 58 | Publishing | 7% | **63%** | in 23,128 |
| 7 | 62,63 | IT, **deprioritize** | **5%** | 60% | 23,128 |

**Two calls to make out loud:**
- **SNI 62 is the trap.** High cloud rate, **lowest hot rate of any real sector (5%)**. Swedish IT firms are on the cloud and too small to matter: SCB counts 48,616 SNI-62 firms, of which **1,097** are 20 to 499. The nightly feeder's Novalo lane has been aimed at exactly this sector.
- **Real estate is IN, deliberately.** Largest sector in the registry (51,231), second-hottest measured, and Alto's Quattro property play targets it directly. A prior audit dropped it wordlessly. Say yes or no explicitly.

**S5 is the whole plan.** Without a free size class, screening the 126-154k survivor pool at $0.013 costs **$1,640 to $2,000** against $444.72. There is no cheaper size proxy in the data. **Breadth is dead without S5.**

**S7's failure mode if you do not tranche:** `claude-proxy` refuses at `spent >= cap`, so you do not breach. You get a **half-domained Sweden plus collateral denial of every other Claude-backed feature** (bulk-enrich, icp-screen, Smith reads, partner-trio) until someone raises the cap by hand. That is worse than a bill. Tranche in 5k blocks, re-read `claude_budget` between blocks. Use the **blended 36.8% yield**, not 49.3%: 49.3% is the four-SNI IT-targeted cohort; the bulk se_registry cohort measured 16.3%.

**S10, contacts:** **do not spend for the existing library.** Of the 4,910 domained + 10-500 SE rows, **4,541 (92.5%) already have a contact**. The gap is 369. Contacts are not Sweden's bottleneck. But **every company S6/S7 adds arrives with zero contacts**, and that 92.5% is a Vainu artifact on a quota nobody has re-measured. Out of scope until S7's gate passes, and it is an Article 14 decision as much as a credit decision.

---

## 5. NORWAY: THE COMPLETION PLAN

### The strategic ruling: RE-CUT. Not keep, not delete.

**"Complete Norway" should be struck from the plan.** The 35,409 rows are a census of Norwegian employers. Three measured facts settle it:

1. **NACE 62 is 1,006 rows, 2.9% of the 34,260-company window.** Five consumer sectors are 48.5%. The addressable digital-native plus data-heavy cut is **3,381 companies, 9.9%**.
2. **The rows are outlets, not accounts.** 9,414 domained rows resolve to **8,383 distinct domains**; **1,432 sit in a shared-domain group**: espira.no x64, nordicchoicehotels.no x57, rema.no x38, narvesen.no x28. The 1,602 grocery rows are Rema/Kiwi/Coop franchisees. The IT decision is at chain HQ.
3. **149 distinct AWS domains** in the addressable slice, against Sweden's 1,124 at 2.8x fewer rows.

**But do not delete it.** It cost ~0 SEK and the 3,381 is real. **Norway becomes a flagged, scoped subset, not a headline, and it executes only on paying pull.** This is the geographic form of the multicloud ruling already in canon. Alto and Novalo are Swedish. There is no Norwegian tenant and no Norwegian hero number available by day 91. The free stages run anyway, because they cost nothing, fix a live bug, and leave Norway one week from useful.

| Stage | What | Rows | Cost | Wall-clock | Proof gate |
|---|---|---|---|---|---|
| **P1** | **Gate `domain-fill` (D1). BLOCKING.** | n/a | $0 | ~2h | Dry run: 0 NO rows from an SE call |
| **A** | Sector re-cut, `is_addressable` from `enrichment->'brreg'->'nk1'->>'kode'` | 34,260 to **3,381** | $0 | 1h | `count(*) where is_addressable` = 3,381; NACE coverage on the window is 100%, so this is a census cut, not a sample |
| **B** | Chain-outlet flag (D5) | 1,432 + 15 | $0 | 2h | Flagged rows' cloud verdicts suppressed from reads; distinct-domain count unchanged at 8,383 |
| **C** | Free domains from brreg `epost` | **~5,000** total, **~366 addressable** | $0 | 1h | Zero new rows land in a domain group of size >3 |
| **D** | Free domains from name to `.no` DNS, **verified** | 1,901 addressable | $0 | 1 day to write | The run is the measurement. Report the true rate. |
| **E** | Paid domain-fill on the residual only | ~1,000 | **~$25-32 CEILING** | ~1 day | `claude_budget` delta <= $35. Any NO row with a Swedish-registry citation in its trace means P1 did not land: stop. |
| **F** | Contacts via Explorium, Tier A only | **~800-1,000** | credits | weeks by design | **Zero contacts on `is_chain_outlet` rows.** Blocked on Article 14. |
| **G** | ICP scoring, NO branch | ~3,381 | trivial (Haiku, no web_search) | 1-2 days | Scored NO rows > 3,000; flagged rows suppressed |

**Route 1 is dead. Do not spend a day on it.** `web_but_no_domain = 0`, `web_and_domain = 9,411`. **26.6% is brreg's ceiling, not our backlog.**

**Stage C detail:** the brreg blob has exactly 7 keys. The email key is **`epost`, not `epostadresse`**; the wrong key returns zero rows. Quote as ~5,000 / ~4,800 / ~366, never to four significant figures: the freemail split moves with the exclusion list. **GDPR: split on `@`, keep the domain, never store or log the local-part.** An unknown share are named-individual addresses.

**Stage D detail:** measured on n=41, 28/41 resolved and **19/41 (46%) verified** by fetching the site and matching orgnr or name. `SET` to set.no and `SUPEROFFICE AS` to superoffice.no both matched on orgnr. False positives are the expected class (`ENERGY AS` to energy.no). **Do not spend the projection:** n=41 carries a 95% CI of roughly 31-62%, so 590 to 1,180 domains, not "~875". **Stage F must not size its Explorium buy on it.**

**Do not run `no-ingest` at `min_employees=5`.** It is sold as "$0, pure free headroom" (+25,245 companies; live brreg check confirms AS/ASA 5+ = 61,173 vs 10+ = 35,928). With P1 unfixed it dumps ~18,700 new undomained rows into domain-fill's untried pool and pushes the spend problem from ~$520 toward ~$890 against $444.72. It is a decision to defer, not a stage.

### Azure dominance, honestly

Measured: Azure to AWS is **5.6:1** in the addressable slice, **7.8:1** across all domained NO. Sweden's IT sector runs **1.29:1**. Norway is genuinely about 4x more Azure-skewed in our own data.

**But `cloud_ecosystem` is not an installed base.** `cloud-detect` (index.ts:204-229) classifies the **apex host's IP/ASN**. It reads where the website is hosted, not where workloads run. On `cloud_ecosystem`, barnehager are 54% "azure" and IT consultancies 47%, which is what you see when you measure the Norwegian web-hosting market.

**The database contains its own correction.** On `cloud_provider`, the strict apex-agreeing verdict, barnehager are **1/282 azure (0.4%)** and Dataprogrammering is **14/223 (6.3%)**. A **16x separation.** The data *can* tell a kindergarten from an IT firm.

So: **`cloud_provider` is the defensible column, and on it the Norwegian Azure base is far smaller than either 5,701 or 910.** Measure it after Stage B and publish that number. "5,701 Norwegian Azure companies" is not a claim we can defend. And strike the figure "IT consultancies 60% azure (133/223)" wherever it appears: it is 105/223 = 47%.

### The funded play

**Norway is not a migration market and must never be pitched as one.** "Move off Azure" is false there and violates the standing rule. **Norway is a POC-lane market:** a new workload on AWS beside their Azure, the AI or data workload Azure is not already holding, funded by AWS POC money. This is the same rival-cloud POC lane already encoded across the funding platform. **The 149 AWS domains are the expand lane. The Azure-hosted addressable set is the POC target, sized on `cloud_provider` after Stage B.** The Azure incumbency is the reason to call, not the reason not to.

**One caveat in the same breath:** the library holds **end customers**; FORJ_ICP.md scores **partners**. Norway's value is not "3,381 leads", it is whether a Nordic-spanning AWS partner would pay for that list. Today, 149 expand accounts and a thin POC set is not a tenant-winning list. That is why every Norwegian stage is gated on a named partner asking.

---

## 6. THE ORDER

### Tonight (free, zero-risk, ~4 hours)

1. **Unschedule `feed-free-prospects-nightly` and `chatbot-detect`.** 15 min. Stops 80 bad rows and 720 pointless calls per day.
2. **Merge the 2 orgnr dupes by hand, then create `companies_orgnr_norm_uidx`.** The gate in front of a 474k promotion.
3. **Run the two country backfills** (3,844 SE, 49 NO), orgnr rule first.
4. **Norway Stage A:** write `is_addressable`. 3,381.
5. **Norway Stage B:** write `is_chain_outlet` on 1,432 + 15, and suppress their verdicts from reads. **Flag, never null.**
6. **Drop `champion_checked_at`. Rotate the JWT at `champion_watch.sql:17`.**

### This week (free code, ~2 days)

7. **Gate `domain-fill`:** country filter, `employees >= 10`, NO prompt branch, `max_uses` 3 to 2. **This blocks everything paid, in both countries.**
8. **The `cloudEco` fix (scoring.js:51-56), not `icpScore`.** Plus the cold/cool vocabulary collapse and the `smith-brief:319` one-liner.
9. **The `before insert or update` stamp trigger** plus the `techstack_at` type conversion. Before any bulk write.
10. **Norway Stages C and D:** the `epost` SQL and the DNS-plus-verify run. Free, and they take the addressable slice from 1,480 domained to somewhere in the 2,000 to 2,600 range.
11. **Investigate why `ted-awards-weekly` and `explorium-events-weekly` have never fired.**
12. ~~**Stand up `pg_dump` to S3 and verify one restore.** Then, and only then, drop the 11 backup tables.~~ **DONE 2026-07-17** — S3 tier was already nightly-live; full scratch-db restore drill passed (receipt in `alloy-page/box/RESTORE.md`), 11 tables dropped in one transaction.

### Money (small, and the gate is cheap)

13. **Sweden S4: size the 1,905 domained-but-unsized rows. ~$25.** Highest value per dollar in the estate.
14. **Norway Stage E: ~1,000 residual rows. ~$25-32 ceiling.** Never the 25,995 ($520-780).
15. **Sweden S7: $375-672, tranched, gated on the first 1,000 rows.** If the hit rate is under 30%, stop. **That gate costs $32 and decides a $672 question.**

### Needs Jacob

| Item | Question |
|---|---|
| **S5, the whole of breadth** | Does SCB's free HVD carry the employee size class and a status column, or does it need a paid Företagsregistret order? BACKLOG #15 investigated; the answer is not in the DB. **Nothing below S4 moves without this.** |
| **The budget row** | One `claude_budget` row appears to be read as both "the $700 soft cap" and "Vainu $441 of $900". **Vainu's real remaining quota is unknown**, and the contacts decision depends on it. |
| **S9 / D10 re-weighting** | How many `icp_score` points is "mid-market, domained, no hyperscaler"? That is the MAP Assess lane's visibility. Positioning call. |
| **Real estate in or out of S6** | I have it in, on 23-24% measured hot and the live Quattro play. Say so either way. |
| **Article 14 for Norway** | Stage F is bulk acquisition of personal data on Norwegian individuals from a broker. Norway is EEA. The Art 13/14 pages BACKLOG #132 built for the Vainu path must cover NO first. **Not a footnote, a gate.** |
| **Norway pull** | Every Norwegian stage past B is gated on a named partner asking. |

### Total cost

| | USD | SEK (~10.5) |
|---|---|---|
| Everything free (tonight + this week) | **$0** | 0 |
| Sweden S4, size 1,905 | $25 (ceiling $38) | ~260 |
| Norway Stage E, residual ~1,000 | $25-32 CEILING | ~260-340 |
| Sweden S7, tranched, gated | $375-672 | ~3,900-7,100 |
| **Total against $444.72 headroom** | **$425-729** | |

At the realistic mid-case it fits. At the ceiling it does not. **S7's 1,000-row gate is what decides that, and it decides it for $32.**

### The honest end-state (ESTIMATE, and only if S5 clears)

| | now | after |
|---|---|---|
| SE rows | 12,773 | ~30-34k, mostly promoted and size-gated |
| SE domained | 8,650 | **~15,000-16,400** |
| SE cloud-read | 8,643 | **~15,000-16,400** (free, follows domain 1:1) |
| SE sized + domained + window | 4,910 | **~12,000-13,500** |
| **SE contactable** | **2,375** | **~2,700-3,800 unless a contacts buy is authorized** |
| NO addressable | undefined | **3,381 flagged**, ~2,000-2,600 domained |
| NO AWS expand lane | undefined | **149 distinct accounts** |
| NO contacts | 59 | ~800-1,000 companies, Art 14 permitting |

**The shape of that table is the finding: domain and cloud roughly double for a few hundred dollars. Contactable barely moves, because contacts are the one thing that does not scale for free.**

---

## 7. WHAT WE WILL STILL NOT HAVE

1. **Any Swedish company formed after 2019-12.** The registry snapshot ends there (2020+ = 88 rows). Six and a half years of ABs are invisible and no enrichment finds them. **Only S5 fixes this, and S5 is not ours to execute.**
2. **Liveness.** `status` is 100% NULL. We cannot know which of the 489,063 died since 2019. Until S5, every promotion imports bankruptcies at an unmeasurable rate. The name regex catches `konkurs` only where the *name* says so.
3. **Where any workload actually runs.** Apex-ASN detection is a hosting signal, in both countries. `cloud_provider` narrows the lie; it does not tell the truth. The AWS and Azure counts are a call list, not an installed base. This must survive into every deck.
4. **The corporate graph in Norway.** brreg exposes `overordnetEnhet` for *underenheter*, but Rema/Kiwi/Espira franchisees are separate AS entities with no registry link to the parent. Stage B flags the symptom. The graph is genuinely unavailable from our free source.
5. **More Norwegian domains from brreg.** Route 1 is exhausted at 100%. 26.6% is the ceiling. Remaining domains come only from inference or purchase. The `.no` zone file is **UNVERIFIED**: Norid does not publish it the way IIS publishes `.se`, and I will not assert otherwise.
6. **The 785 tried-and-missed Swedish rows.** `domain-fill` ran, found nothing, wrote `domain_tried` permanently by design. These companies have no website. Retiring them is the correct end-state, not retrying them.
7. **The ~4,062 SE rows with neither domain nor size.** ~$150 buys ~1,230 domains, and they would still land off-profile for lack of a headcount. Park them.
8. **Sub-10-employee Sweden (~86% of the register) and the Norwegian 5-9 band (~25,245 free rows).** Excluded by the ICP floor. The Norwegian band stays shut not because it costs money but because opening it before P1 makes every other problem strictly worse.
9. **Dates on the 6,058 undated `icp_score` values.** Backfilling means asserting a date we do not know. Null reads correctly as "unknown age".
10. **Contacts at scale, free.** Vainu is SE-only and contract-bound. Explorium bills and is Article 14 load-bearing. Neither is a data problem. Both are a budget and privacy problem.
11. **A clean separation of franchisee from subsidiary from duplicate** on the 893 shared-domain groups in Sweden. `fastighetsbyran.se` is 10 real ABs. Dedup on domain destroys real accounts, permanently.

**And the plain one: Norway will not produce the hero number.** Sweden has 1,124 AWS companies, 43,985 contacts across 7,100 companies, Vainu already paid for, and two live tenants. Norway has 149 addressable AWS companies and 59 contacts. Under the north-star lens, the 30-day move is the Alto head-to-head artifact, and that runs on Swedish data. **This plan's job is to stop the library from lying to us, and to leave Norway one week from useful. Not to complete it.**