# What actually ranks the library — measured, 2026-07-18

Written after backfilling Norwegian revenue and re-running the whole scoring chain. Every number
here came from a query against production, not from reading code and reasoning about it.

## What was done

1. **Norwegian revenue backfilled from Brønnøysund** (free, no key). 34,267 of 35,458 companies now
   carry `revenue_ksek`, 96.6%. The remaining 1,139 are recorded as `brreg_regnskap_none` — checked,
   no filing — never as revenue 0, because a fabricated zero is a lie the scorer would then act on.
   104 companies do carry a real filed zero; that is measured evidence and different in kind.
2. **Funding eligibility re-scored for Norway**: 21,035 companies, 0 failures. The nightly cron only
   scores companies with *no* funding row (`unscored_only`), so it would never have revisited these.
3. **`recompute_icp_scores()` re-run library-wide**: 38,160 rows changed.

## The headline: it worked, and it revealed something bigger

**Revenue fixed the flatness it was supposed to fix.** Norway's single largest ICP tie went from
**14,782 companies on exactly 50** to **9,898 on exactly 60** — a 33% break-up — and the −25
too-large guard, which Norway was structurally immune to while revenue was NULL, now correctly
fires on **387** Norwegian companies.

**But the remaining tie is now fully explained, and it is not about revenue.** All 9,898 companies
still tied at 60 decompose exactly:

| Term | Weight | These 9,898 |
| --- | --- | --- |
| hyperscaler cloud | 28 | 9,898 / 9,898 ✓ |
| domain | 10 | all ✓ |
| headcount 10–500 | 12 | 9,898 / 9,898 ✓ |
| revenue 20m–500m | 10 | 9,898 / 9,898 ✓ |
| **maturity band** | **28** | **0 / 9,898** |
| **any contact** | **16** | **0 / 9,898** |

28 + 10 + 12 + 10 = 60. Exactly. The tie is not noise — it is what the formula returns when its two
largest remaining terms are both unpopulated.

## The structural finding: the formula's biggest lever is switched off

`maturity_band` is worth **28 points, the single heaviest term in the formula**. Its coverage:

| | Library | With maturity band | Coverage |
| --- | --- | --- | --- |
| All markets | 85,693 | **516** | **0.60%** |

Per market, on domained sellable accounts: Sweden 378 of 23,796, Norway 20 of 21,449, Finland 1 of
19,941.

This is not a bug — maturity is a deliberately expensive deep-scan and has only ever been run on a
few hundred companies. But the consequence is worth stating plainly: **the formula as designed and
the formula as it actually behaves are different formulas.** Nominally the heaviest signal is
maturity. Effectively, for 99.4% of the library, the score is cloud + domain + headcount + revenue
+ contacts, and maturity contributes a constant zero.

## The second lever: contacts, and this one is a real decision

`has any contact` is worth 16 points, all-or-nothing.

| Market | Domained accounts | With a contact | Coverage |
| --- | --- | --- | --- |
| Sweden | 23,796 | 7,555 | **31.7%** |
| Norway | 21,449 | 120 | **0.6%** |
| Finland | 19,941 | 31 | **0.2%** |

Sweden can rank because a third of it has contacts. Norway and Finland cannot meaningfully rank
against each other at all, because for 99%+ of both markets that term is a flat zero.

**This is the precise, costed justification for the paid Norway contacts decision.** The free levers
are now exhausted: revenue is at 96.6%, domains are done, cloud is classified. The next real gain in
Norwegian and Finnish ranking cannot be bought for free — it requires the contacts spend.

## Honest negative: revenue does not move the funded door

The four-door assignment barely changed — roughly 90 companies out of 21,449. Checking why: each
door spans essentially the entire revenue range.

| Door | NO companies | avg revenue (ksek) | min | max |
| --- | --- | --- | --- | --- |
| GREENFIELD_PGP | 14,653 | 56,806 | −282,488 | 9,631,308 |
| MAP | 3,623 | 699,912 | 0 | 66,511,400 |
| MAP_MODERNIZE | 1,544 | 254,628 | −76 | 18,665,154 |
| POC | 1,215 | 446,863 | 0 | 68,915,850 |

Door choice is driven by cloud posture, maturity and AI-native signals — not by revenue. So the
backfill improved *ranking within a door*, not *which door a company belongs to*. I expected more
door movement than this; it did not happen, and the reason is structural rather than a defect.

## Four doors per market, as they now stand

| | MAP | MAP_MODERNIZE | POC | GREENFIELD_PGP |
| --- | --- | --- | --- | --- |
| Sweden | 15,759 | 2,077 | 1,562 | 4,398 |
| Norway | 3,682 | 1,587 | 1,253 | 14,927 |
| Finland | 16,834 | 2,060 | 1,047 | — |

Norway is overwhelmingly GREENFIELD_PGP where Sweden and Finland are overwhelmingly MAP. That gap
is worth understanding before these numbers are used in any partner conversation — it may be a real
difference in cloud posture, or it may be an artefact of how Norwegian cloud was classified. It has
not been checked yet, and should not be quoted until it has.

## Data-quality notes

- **Negative revenue exists** in the Brønnøysund data (down to −282,488 ksek). The formula treats
  `rev <= 0` as zero points, so nothing is corrupted, but the raw values are real and preserved in
  `enrichment.brreg_regnskap`.
- **NOK→SEK at a fixed 0.95.** Documented, approximate, and deliberately not presented as exact
  anywhere. The raw NOK figure and accounting period are kept so the rate can be revised without
  re-fetching.

## What this changes

1. **The paid Norway/Finland contacts decision is now quantified**, not a hunch: 0.6% and 0.2%
   coverage on a 16-point all-or-nothing term.
2. **`maturity_band` deserves a decision**: either widen coverage far beyond 0.6%, or reduce its
   28-point weight to match what it actually contributes. Right now it is the largest number in the
   formula and the smallest contributor to it. Any weight change must be eval-gated — the last
   untested tune of this formula (graded headcount) measured out at −762 hot Swedish accounts.
3. **`recompute_icp_scores()` is now in the repo** (`supabase/migrations/20260718220000_...`). It had
   been running nightly in production with no migration behind it.
