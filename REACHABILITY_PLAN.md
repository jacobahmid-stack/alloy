# Reachability + Estonia: the build order

2026-07-18. Live-verified recon (RIK/EMTA/PRH/Explorium endpoints probed, all shelf numbers from real SQL).

**The bottleneck is reachability, not discovery.** ~41,700 domained + cloud-read accounts, contacts on ~8,500, and 8,392 of those are Swedish. Every step below is judged on one number: net new accounts a human can actually contact.

## Verdicts

**Sweden shelf: the dominant action.** Running the existing .se zone engine against `se_registry` on a tightened allowlist yields ~14,600 verified-domain new Swedish accounts, into the ONE country where contacts work (prior domained SE cohorts sit at 95.7% contactable). Everything else on the shelf is a rounding error. STATUS: RUNNING (unit `alloy-se-shelf`, 14.6% sustained).

**Estonia: buildable free, but 8x smaller than the doc claimed.** RIK `yldandmed.json.zip` (CC BY 4.0, daily, NACE native) joins 1:1 to the EMTA quarterly tax CSV on `ariregistri_kood` for CURRENT headcount, and ~95% of in-band rows carry a corporate registry email. Real ceiling: **1,282 promotable at 5+ employees** (756 at 10+), not the 6,052 in LIBRARY_CAMPAIGN_PROMPT.md. Estonia is still the best reachability-per-row on the board: it arrives sized AND with a contact on the same row, which is exactly what Finland lacks.

**Finland size: NO FREE ROUTE.** PRH XBRL is 4.7% coverage, EUR-only, zero headcount facts. Vero has no turnover/employees. Tilastokeskus has the exact size class and CHARGES for it. Free consolation prize, already in the weekly-downloaded file: `registeredEntries[]` employer/VAT/prepayment flags (~8,000 verified employers, ~3,500 dormant shells) for ~10 lines in `fi_load.py`. That is a warm-signal + suppression list, NOT a size gate.

**Norway contacts: measure before buying.** Unit cost unknown (repo guesses 3 credits, Explorium publishes 8 per fully enriched contact). Only 1,900 credits remain (~$45 replacement). Two crons draw on it unattended at ~184/week.

## Build order

1. **SE shelf zone match** (free, running). Long pole, highest yield, lands in the contactable country.
2. **Explorium credit floor + ledger** (free). SHIPPED 2026-07-18 (commit b11a5cf): pre-flight `/v1/credits` read, hard abort below 300, per-run `credits_before/after/spent/per_company`. Stops an unattended drain of the exact budget the paid decision needs.
3. **FI register flags** (free, ~1h). `registeredEntries[]` codes 5/6/7 (prepayment / VAT / EMPLOYER), active = no `endDate`. Confirmed at `avoindata.prh.fi/opendata-ytj-api/v3/description?code=REK`. Warm-signal boost only; the no-register-at-all rows become a suppression list.
4. **Promote SE output, then free size + cloud.** Bolagsverket HVD (43.7% measured), then cloud-detect the new domains.
5. **Estonia load** (free, half a day). Spec below.
6. Loop-closers: SE domainless residue (~320), FI allowlist residue (2,151).
7. Doc corrections (Estonia numbers, FI licence stamp).
8. **THEN the paid Norway decision.** Steps 1-6 add ~15,500 accounts for zero spend, which changes the shape of the Norway question anyway.

**Deliberately NOT doing: widening the FI TOL allowlist.** The 76,684 unpromoted domained Finnish rows are 60%+ construction, retail, wholesale, real estate, restaurants. Even the defensible industrial slice (~3,950) lands with zero employees and zero revenue, cannot be scored or tiered, and joins a cohort that has produced 31 contacts total. Finland's blocker is size data, not row count. This is the Norway census mistake in a Finnish hat.

## Estonia spec (step 5)

- RIK: `https://avaandmed.ariregister.rik.ee/sites/default/files/avaandmed/ettevotja_rekvisiidid__yldandmed.json.zip` (228 MB, daily, CC BY 4.0). The `lihtandmed` CSV has no industry code and no email; not sufficient.
- EMTA: `https://ncfailid.emta.ee/s/e4DneiWeKFfje6d/download/tasutud_maksud_kaesolev_aasta_eng.csv` (62 MB, 442,910 rows, quarterly).
- `.ee` zone AXFR `dig @zone.internet.ee ee. axfr` confirmed OPEN (rcode 0, 67.5 MB in 14.4s, CC BY 4.0). Demoted to validation/residual since R1 email covers ~95%.
- Gates in order: `status='R'` -> corporate legal forms (drops FIE/korteriühistu/MTÜ) -> EMTA `Type='Company'` (second FIE filter) -> nace2 in (21,26,35,58,61,62,63,64,65,66,70,71,72) -> `emp_emta >= 5` (EMTA row REQUIRED; no row = dormant = reject) -> verified domain at promotion.
- Industry from RIK's native `nace_kood` where `on_pohitegevusala = true`. No EMTAK crosswalk needed. Size from EMTA, never RIK's annual-report `tootajate_arv` (RIK says 3,012 at 10+ where EMTA says 1,518; RIK lags 6-18 months).
- Funnel: 374,535 total -> 364,853 active -> ~298,271 corporate staged -> 62,676 in allowlist -> 32,712 with an EMTA row -> **1,410 at 5+ -> 1,282 promoted with a corporate domain.**
- Four known traps: (a) the JSON is pretty-printed and expands to GBs, STREAM it, never `json.load`; (b) legal-form literals contain `ü`/`ä` and accented Python literals silently matched zero on this toolchain, match ASCII prefixes or `oiguslik_vorm_nr`; (c) GDPR, drop registry emails whose local part matches a `kaardile_kantud_isikud` person name, on top of the freemail filter; (d) EMTA's licence is "free to use, reuse and share" but not a named CC licence, so Estonian rows stay staged and OUT of partner-facing surfaces until the wording is confirmed.
- Do NOT touch the RIK annual-report open data files: every one is labelled "until 30.06.2026" and is now EOL.

## The paid decision (Norway, needs Jacob)

- **Probe: 5 companies, max ~100 credits.** Sole purpose: measure true credits-per-Norwegian-company. Free `/v1/credits` before and after now does the measuring automatically (shipped in step 2).
- **Batch 1: 25 companies, 150-450 credits**, only if the probe passes every gate.
- **Hard ceiling for the track: 550 credits (~$13).**
- **Cohort:** NO, domained, cloud-read, `is_addressable`, non-chain, no existing contact, `.no` TLD, unique domain, **50+ employees = 274 accounts.** Ranked by HEADCOUNT, not icp_score (Norwegian icp_score does not discriminate: 14,811 rows sit at exactly 50, and only 11 NO companies reach 70).
- **Kill gates:** >16 credits/company; match rate <60%; emails <40% (prior NO run: 36%); balance <300 after; any foreign decision-maker (subsidiary-to-global-parent leak).
- Do not buy phones in Norway: prior yield 3.6%.
- Rollback: `update companies set list_tags = array_remove(list_tags,'no_probe1');`

## Bigger paid question than Norway

**Vainu people-enrichment on the ~14,600 new Swedish accounts.** 76.8% hit rate, potentially ~10,900 contactable accounts, which would more than double the reachable base from 8,392. Subscription-quota, needs its own quote and gate. This is the actual reachability payoff of step 1 and the largest paid decision in the plan.

## Gated on Jacob (not doing without him)

- Any Explorium spend (probe or batch); buying credits.
- Vainu enrichment on the new Swedish cohort.
- Emails: `yritystietopalvelut@stat.fi` (the ONLY thing that fixes Finland's 10-200 band), EMTA licence wording, `avoindata@prh.fi` (FI rows are live under an unverified CC BY 4.0 stamp), SCB (still open).
- Article 14 notice path for Norwegian Explorium contacts: confirm BEFORE the paid probe, not after.
- Estonia allowlist choice: disciplined FI-mirror (1,282) vs extended +27/28/46/59/60 (2,546).
- **Security note, reported not touched:** `supabase-rest` exposes an `EXPLORIUM_API_KEY` at length 129, a DIFFERENT value from the length-32 one in `supabase-edge-functions`, in a container with no business holding it. Not rotated, not deleted.
