# Nordic coverage: the 2+ employee build

**Date:** 2026-07-30 (one night)
**Goal:** complete Nordic coverage from 2 employees upwards, every domained company cloud-scanned,
without paying Statistics Finland EUR 2,336.

**Result:** the Nordic library went from **129,179 to 257,773 companies**. Every one of them either
carries a headcount or a statutory floor of at least 2 employees. Total cash spent: **zero**.

---

## Before and after

| | before | after | headcount or >=2 floor | founding date | domained |
| --- | ---: | ---: | ---: | ---: | ---: |
| Denmark | 32,468 | **87,955** | 87,929 | 87,927 | 31,134 |
| Norway | 35,458 | **71,936** | 71,884 | 67,893 | 34,589 |
| Finland | 19,996 | **56,625** | 44,124 | 56,577 | 56,625 |
| Sweden | 41,257 | 41,257 | 22,317 | 39,813 | 37,313 |
| **total** | **129,179** | **257,773** | | | |

Norway's founding dates went from **zero to 67,893**, and Sweden's from 14,693 to 39,813. Both were
silently blocking the AWS Activate funding gate, which needs a company age.

---

## What each country actually cost

### Denmark: free, and it was already ours

`dk_registry` had 860,195 rows carrying an `employees` integer, `emp_interval`, `stiftelses_dato`
and `reklamebeskyttet`. Only the 10+ band had ever been promoted. The 2-9 band was sitting on our
own shelf, unread, the whole time.

Promoted 55,487 companies. One trap: the status column holds **both** `NORMAL` and `Aktiv`, and a
filter on `NORMAL` alone silently drops 30,595 rows.

### Norway: free, and it fixed a second problem

Brreg's Enhetsregisteret bulk CSV is 154 MB gzipped, rebuilt nightly, licensed NLOD 2.0, and needs
no key. 1,170,062 units with `antallAnsatte`, `stiftelsesdato`, `hjemmeside`, `epostadresse`,
`telefon` and `mobil`.

Promoted 36,478 new companies and backfilled 35,394 founding dates onto the ones we already held.
The phone and email columns went into `enrichment.brreg`; they are free reachability we were
previously paying to guess at.

**Known limit, and it is not in Brreg's docs:** Norway suppresses the 1-4 band entirely. Where a
unit has employees but fewer than five, `antallAnsatte` is blank rather than a number. So Norway's
floor is genuinely 5, not 2. Do not claim otherwise.

### Finland: free, and it is a floor rather than a number

This is the one that was supposed to cost EUR 2,336. It did not, but the thing we got is **not** a
headcount and must never be described as one.

Finnish tax law splits employers in two. A **regular employer**, who must register, "regularly pays
wages or salaries to 2 or more employees". A **casual employer**, who need not register, "employs
only one regular employee". So an active entry in the tax employer register is a statutory statement
that a company has **at least two employees**.

That register is inside PRH's free YTJ bulk file. No key, no contract, CC BY 4.0, rebuilt daily:

```bash
curl -sSL -o ytj.zip 'https://avoindata.prh.fi/opendata-ytj-api/v3/all_companies'
```

The predicate, verified against two real companies before trusting it:

```python
active = any(e["register"] == "7" and e["type"] in ("41", "42") and not e.get("endDate")
             for e in rec["registeredEntries"])
```

The `endDate` clause is load-bearing. Trimble Finland Oy has an open `register=7 type=41` entry and
passes. Sensor Software Consulting SSC Oy has the same entry with `endDate: 2024-08-31` and
correctly fails. Ignoring `endDate` roughly doubles the count with dead registrations.

Census over all 461,431 Finnish companies: **94,989 active employers (20.6%)**.

Promoted 36,629 domained Finnish companies. Finland went from 19,996 to 56,625, and from **zero**
size information to 44,124 companies with a defensible ">= 2 employees".

Stored honestly, in two new columns rather than by faking `employees`:

- `employees_min = 2`
- `employees_source = 'FI tax employer register (regular employer = pays wages to 2+)'`

**What this is not.** It is one boolean, not a band. Against StatFin ground truth it is only about
24% precise as a *10 or more* gate, so it cannot serve as the ICP gate. Its value is that recall is
statutory: any Finnish company with 10 employees is necessarily a registered regular employer, so
nothing real is missed. That makes it a safe **pre-filter**, which is what makes the paid option
cheaper (below).

### Sweden: free universe, but the headcount is still the paid one

Bolagsverket publishes a free weekly high-value dataset, 70 MB, 1,817,146 rows, CP1252 encoded:

```bash
curl -O https://vardefulla-datamangder.bolagsverket.se/scb/scb_bulkfil.zip
```

It carries name, industry, address, `RegDatKtid` and `Reklamsparrtyp`, but **no size field at all**.
So it backfilled 25,120 founding dates and 165 reklamspärr flags, and it cannot close Sweden's
headcount gap.

Sweden's 1-9 band still needs a fresh SCB delivery. `scb_shelf` holds 52,889 per-company rows whose
`stkl` codes start at **4 (10-19 employees)**; codes 1-3 were never ordered. That data arrived as a
delivered file rather than a queryable API, so it is an order to place, not a job to run.

---

## The Finland invoice, if we ever want the real number

Nothing free yields a Finnish employee *number*. That is now a verified negative, three ways: the
YTJ bulk has no size field anywhere in 1.45 GB; PRH's XBRL filings use six metric tags whose only
unit is EUR, so no count-typed fact can exist, and they cover 2.2% of companies anyway; Vero's public
tax file has eight columns and none is headcount.

But the employer flag makes the paid order **smaller**. Statistics Finland prices by row count, so
ordering only the employer-flagged ICP cohort instead of all 19,996 drops the band:

| order scope | band | base | x0.40 x0.80 x2.00 |
| --- | --- | ---: | ---: |
| all companies | 15,000-19,999 | 3,650 | EUR 2,336/yr |
| **employer-flagged only (~4,210)** | 4,000-4,999 | 2,050 | **EUR 1,312/yr** |

Same data, 44% less, because the free flag pre-filters the order. Details and caveats in
`FINLAND_TILASTOKESKUS.md`.

---

## Things that were checked and rejected

- **SERP / LinkedIn employee bands.** Cheap and structurally broken. There is no Y-tunnus anchor on
  a LinkedIn page: a test lookup for Arksoft Oy resolved to an unrelated Ankara consultancy and
  would have passed the gate. Large Finnish subsidiaries return the worldwide parent's band. Also
  the EU sui generis database right applies in both Sweden and Finland, and hiQ is US-only.
- **FullEnrich** for headcount. Their terms forbid making enriched data available to third parties,
  which is the entire product. Worse, **`headcount` returns `0` rather than null when unknown**, and
  a zero silently passes a "known employees" gate. Measurement only until a written agreement.
- **TheirStack.** Requires deleting all copies on termination, so it can never be a durable column.
- **PRH Virre** at EUR 4.02 per document: EUR 16,924 for the cohort, as PDFs needing OCR.
- **Enrichlayer / Proxycurl.** LinkedIn sued Proxycurl in January 2025; it shut down 4 July 2025.

---

## Two silent bugs found along the way

Both fail open, returning HTTP 200 and zero rows rather than an error.

1. **Finland moved to TOIMI4 on 2026-01-01.** Querying the old `62010` returns 4,800 rows of which
   99.5% are ceased companies. Live codes are 62100, 62200, 62900, 63100, 63910, 63920.
2. **Norway moved to NACE 2.1.** `62.010 / 62.020 / 62.030 / 62.090 / 63.110 / 63.120` all return
   zero. Live codes are 62.100, 62.200, 62.900, 63.100.

Also noted, not fixed: Swedish `companies.orgnr` holds two formats at once, 14,693 bare ten-digit
(from SCB) and 25,188 hyphenated (from Vainu). Every join must normalise. And 263 companies are
outright duplicates of each other, differing only by a `www.` prefix on the domain.

---

## What is left

- **Sweden 1-9**: order SCB `Stkl` codes 2 and 3. The only remaining paid step, and the terms signed
  2026-07-23 should be re-read before the value is shown to a paying customer.
- **Norway 1-4**: unobtainable. Brreg suppresses it. Accept a floor of 5 for Norway.
- **Finland exact numbers**: EUR 1,312/yr if wanted. The floor may well be enough.
