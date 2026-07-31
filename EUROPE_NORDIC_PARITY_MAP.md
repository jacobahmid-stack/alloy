# THE NORDIC STACK, TRANSPLANTED: A DECISION DOCUMENT FOR THE TOP 10 EUROPEAN AWS-PARTNER MARKETS

Markets in scope: Germany, France, Netherlands, United Kingdom, Ireland, Spain, Italy, Belgium, Poland, Switzerland. Research date 2026-07-31. Every claim below is drawn from the adversarially-verified per-country cards; where a card and its verification conflicted, the verification wins and the correction is stated inline.

---

## 1. THE PARITY CHECKLIST

"As good as the Nordics" means all ten layers present, free or cheap, and lawful. Score any country 0 to 10 against this.

1. **Company universe** - every active company, as bulk or reconstructable feed.
2. **Headcount / employee size** - to run the 10+ ICP gate and the Activate known-size gate. This is the layer that broke Finland and it breaks most of Europe.
3. **Founding date / company age** - gates the Activate young-company funding track.
4. **NACE / industry code** - to filter to the AWS-partner buyers (NACE 62-63 IT firms).
5. **Domain** - the choke point; no domain, no cloud read, no email pattern.
6. **Named directors** - for a small firm the director is the IT buyer.
7. **Register-published phone / email** - the free reachability layer that took Denmark from 80 to 27,289 contacts in a day.
8. **Suppression / do-not-contact register** - so the protected are never contacted.
9. **Marketing law** - is cold email, cold call, LinkedIn DM lawful to a named business person.
10. **AWS-partner density** - is the market worth the build at all.

(Layer 11, cloud/hosting detection, is already solved universally at $0 and is excluded.)

**The Nordic result to match:** 257,773 companies for zero cash, statutory headcount on most, founding dates, 159,661 domains cloud-measured, named directors with phones. The two layers that are hardest to replicate abroad are exactly **Layer 2 (headcount)** and **Layer 7 (register contacts)** - hold that thought, it is the spine of the cost section.

---

## 2. THE ONE INSIGHT THAT REORDERS EVERYTHING

**The EU High-Value-Datasets mandate (Reg (EU) 2023/138, in force from 9 June 2024) frees the ROWS, never the JOINS. It did NOT un-trap the big three traps.** Verdict per flagged country, unambiguous:

| Country | Did HVD un-trap it? | Primary-source reality |
|---|---|---|
| **Ireland** | **YES, fully (for the company layer)** | CRO Open Data Portal is HVD-designated: full register, daily CSV **bulk + API, CC BY 4.0, free**. Verified live: companies.csv.zip downloads clean, 821,291 rows, ~329,757 active. This is the one clean HVD win. |
| **Spain** | **NO for the register; PARTIAL via a side door** | The official registradores open data is **aggregates only** (verified against its CKAN catalog); HVD is NOT complied for company-level bulk. The free universe exists only by reconstructing it from the **BORME** gazette (BOE datos-abiertos REST API), which is a pre-existing reuse right, not HVD. |
| **Germany** | **NO** | The Handelsregister became free to VIEW on 1 Aug 2022, but that was **DiRUG (Directive 2017/1151), not HVD**. There is still no official free bulk or API and a request cap; HVD compliance is partial and contested. Free-to-view is not free-to-acquire-in-bulk. |
| **Italy** | **NO** | HVD freed only aggregates plus single-company BRIS lookup. The company universe is still paid (Telemaco), though cheap (EUR 0.02 to 0.12 per record). |

**Why this is the finding that reorders the plan:** the mandate hands you name, ID, address, legal form, status and founding date for free almost everywhere. Those are the commodity rows. It does **not** hand you headcount, it does **not** hand you directors where GDPR gates them (the Netherlands strips names from its "compliant" open set), and it does **not** hand you register phone/email. Those are the ICP-defining joins, and they stay partial or paid exactly where the Nordics were. **This is direct proof of Forj's doctrine: rows are the mandated-free commodity, the joins are the moat.** Do not let "it's HVD now" become the next shipped error; it is the claim restated, and the register's own access page is the only thing that settles it.

---

## 3. PER-COUNTRY SCORECARD

Verdict scale: READY (drop-in Nordic recipe), MODERATE (works, some cash or engineering), HARD (buildable but a real gate remains), TRAP (defer). Cost = rough one-time cash to reach parity, data layers only.

| Country | AWS value | Universe | Headcount | Directors | Domains | Cold email | Cold call | Verdict | Cost to parity |
|---|---|---|---|---|---|---|---|---|---|
| **Germany** | **Highest in EU** | Free-to-view, no bulk (rebuild from gazette) | Gated: buried in filed accounts, patchy | **Free** (Geschäftsführer in register) | No zone; R4 + §5 DDG Impressum proof | **BLOCKED** | Lawful (call-first) | **HARD** | ~EUR 0 data + 2-4 wks eng; optional EUR 1-5k seed |
| **France** | High | **Free** (Sirene 29.8M) | **Free band** (tranche) | **Free** (INPI RNE) | **Free** (.fr full zone oracle) | Lawful w/ conditions | Lawful w/ conditions | **READY (built, 7,960 ICP)** | ~EUR 0 |
| **UK** | Very high | **Free** (Companies House) | Free, derived (iXBRL, parser fix) | **Free** (PSC bulk + officers API) | No zone; R4 + reg-25 number verifier | Lawful opt-out (corporate) | Lawful (screen TPS+CTPS) | **READY (~90% built, 7,647 ICP)** | under GBP 300 |
| **Netherlands** | High | Paid (~EUR 2k selectiebestand; free set is name-stripped) | Weak (self-reported count, often empty) | Paid (~EUR 2.6k officials) | No zone; R4 | Lawful opt-out (all businesses) | Lawful (legal persons, no consent) | **MODERATE** | ~EUR 5,000 one-time |
| **Ireland** | High per-capita | **Free** (CRO HVD bulk) | **HARD GAP** (no public iXBRL; PDF index only) | Free per-company (CORE, unverified) | No zone; R4 | Lawful opt-out (corporate) | **Split:** fixed-line opt-out, mobile consent | **MODERATE** | ~EUR 0 data; headcount paid/parsed |
| **Spain** | Rising (eu-south-2) | Free via BORME rebuild | **Paid** (~EUR 2-10k/yr; DIRCE bands are free but nameless) | **Free** via BORME | No zone; R4 | **BLOCKED** | Lawful (mandatory Robinson screen) | **HARD** | ~EUR 2-10k/yr (headcount) |
| **Italy** | Mid-high (eu-south-1) | Paid, cheap (~EUR 1,450 Telemaco) | Cheap but **banded** (INPS estimate, straddles 10) | Paid (~EUR 5 visura) | No zone; R4; PEC free but inert | **BLOCKED** | Lawful (mandatory RPO screen) | **MODERATE** | ~EUR 2-4k one-time |
| **Belgium** | Mid (EU capital) | **Free** (KBO, daily) | Free per-company (NBB XBRL, exact FTE) | Free per-company (kbopub) | No zone; R4 + contact.csv webadres | Lawful opt-out (impersonal addr) | Lawful (screen DNCM) | **READY** | ~EUR 0 + low-hundreds/yr |
| **Poland** | Rising | **Free** (REGON BIR) | **GAP** (absent from REGON) | **Masked** at free tier (asterisked) | No zone; R4 | **BLOCKED** | **BLOCKED** | **TRAP (library-only)** | ~EUR 0, but no lawful cold channel |
| **Switzerland** | Mid, non-EU | **Free** (LINDAS ~791k) | **HARD GAP** (buy ~CHF 3-8k/yr) | Free per-company (cantonal) | No zone; R4 | BLOCKED (mass) | Lawful (screen Sterneintrag) | **HARD** | ~CHF 5-12k/yr |

Note the recurring pattern in the two hardest columns: **Layer 7 (register phone/email) exists in only ONE of the ten (Belgium)**, and **free statutory headcount exists cleanly in only France and Belgium**. Denmark's CVR gift essentially does not repeat outside Belgium.

---

## 4. THE BUILD ORDER

Ranked by (AWS opportunity) x (ease of access) x (lawful reachability). Opportunity and access pull in opposite directions, so the two rankings are stated separately and then reconciled.

**Pure opportunity ranking (partner money):** Germany #1, UK #2, France #3, Netherlands #4, Spain ~#5, Italy ~#6, Poland #7, Ireland #8 (small base, outsized hyperscaler footprint), Belgium #9, Switzerland #10. **Germany is unambiguously the #1 opportunity: the largest AWS-partner market in Europe, Frankfurt eu-central-1 since 2014, a second announced German region, the Sovereign Cloud in Brandenburg, and the largest NACE 62-63 population in the EU (est. ~15,000 ICP firms 10+).** The only historical objection was data cost, and that objection is now half-dead (free to view). So say it plainly: on opportunity, Germany ranks first.

**Reconciled build sequence (opportunity discounted by friction):**

1. **Finish France (built).** First move: domain-fill the loaded 7,960-firm sized ICT cohort. Run R2 name-match against the .fr and .com oracles, then domainfill.py --country FR --tlds fr,com, then point the zero-build cloud pass at the newly-domained rows. Wire the two hard gates (non_diffusible and the lawful-channel field) before any outreach surface exists.
2. **Finish UK (built).** First move: pull today's free PSC daily snapshot and JOIN beneficial owners onto gb_registry on company_number (adds named buyers to the whole shelf at GBP 0), and fix the iXBRL headcount parser with uktrade/stream-read-xbrl plus an AccountCategory sanity cap, then re-stamp.
3. **Belgium - the quickest free new market and the closest Denmark repeat.** First move: register for KBO Open Data, download the daily full ZIP, load enterprise.csv + activity.csv + contact.csv, filter to legal-person / Status=AC / NACEBEL 62-63. That single download delivers universe + founding date + NACE + a large free phone/email/website slice in one pass.
4. **Ireland - free clean universe, tiny ICP, cheap to cover fully.** First move: download companies.csv.zip from the CRO portal, filter nace_v2_code to 62/63 and status active. Accept that headcount is a hard gap (no public iXBRL) and that mobile cold-calls are consent-gated.
5. **Germany - the prize, funded as invest-to-enter.** First move: correct the internal "trap (register data paid/gated)" flag (the paid half is false) and stand up the free .de universe rebuild: offeneregister CC-BY seed (treat as licence-encumbered and of unknown currency, not clean CC0) plus a gazette harvester off the Unternehmensregister, plus a Gegenstand-to-NACE classifier. Set the channel to call-first, cold-email-blocked. Data cost ~EUR 0; the cost is engineering.
6. **Netherlands - accept a small paid budget.** First move: email the KVK selection desk (account@kvk.nl) for a selectiebestand filtered to SBI 62/63 and size >=10, and ask for the free count and quote first. ~EUR 5,000 all-in.
7. **Italy - cheap paid universe, call-first.** First move: open a free Telemaco account and read the FREE preventivo for ATECO 62-63 + classe di addetti covering 10+ (nearest bands are 6-10 and 11-15, so post-filter on the per-company addetti field). That one free quote returns the exact ICP size and price.
8. **Spain - start the free flow now, defer the paid headcount.** First move: build the BORME reconstruction pipeline off the BOE datos-abiertos REST API for universe + founding + directors at ~EUR 0.

**Quick free wins:** France (finishing), UK (finishing), **Belgium** (one download), Ireland (one download). **Genuine traps to defer:** **Poland (TRAP - no lawful cold channel at all, directors masked, headcount absent; library-only), Switzerland (HARD - headcount must be bought, non-EU), Spain/Italy (HARD/MODERATE - workable but call-first and either paid headcount or paid universe).** Germany is NOT a trap; it is a HARD-but-high-value engineering build.

---

## 5. THE EU-WIDE UNLOCKS

Build the instrument, not the country. What buys coverage across many markets at once:

- **HVD company bulk files (Reg 2023/138).** The real multiplier where complied: **Ireland fully, France (Sirene), Belgium (KBO), UK (pre-existing).** Where it is compliance-by-anonymisation (NL) or compliance-by-minimum (DE, IT), it buys nothing usable. Build a generic HVD-CSV loader; it pays off in 4 of 10.
- **BORME-style gazette reconstruction.** A flow-to-stock harvester (parse daily registered acts, dedup) is the same engine for **Spain (BORME)** and **Germany (Registerbekanntmachungen)** and partially Belgium (Moniteur belge for directors). One instrument, three countries. This is the highest-leverage engineering unlock on the map.
- **The R4 guess-and-prove domain engine.** Already built, already country-agnostic. Confirmed necessary for 9 of 10 (only France publishes an open .fr zone; DENIC, SIDN, Nominet, DNS Belgium, Registro.it, Red.es, NASK, SWITCH, IEDR all publish no zone). **Do not budget for zone files.** Germany is the best proof case: no zone, but the mandatory §5 DDG Impressum guarantees a register number on the page, giving the highest match confidence in Europe.
- **BRIS (e-Justice) and VIES.** Verification instruments only, not universes. BRIS resolves EUID per company across all 27; VIES is a free VAT-liveness check that returns name+address in some states. Use them to validate and cross-link, never to load.
- **GLEIF / LEI daily file.** Free, but SME coverage is thin. Use for parent/ownership enrichment on the larger accounts only.
- **The lawful-channel field.** Not a data source but the one instrument that gates all ten: a per-country email_ok / call_ok / basis / authority record, populated from Section 6. Build it once, apply everywhere.

---

## 6. THE LAWFUL-CHANNEL MATRIX

This drives what Smith is allowed to draft per market. LinkedIn is UNCLEAR nearly everywhere and is moot under standing doctrine (never scrape or buy LinkedIn data), so it is shown but never relied upon.

| Country | Cold EMAIL to named B2B person | Cold CALL to business | LinkedIn DM | Controlling statute |
|---|---|---|---|---|
| **Germany** | **BLOCKED** - express prior consent, no B2B carve-out | **Lawful** on presumed consent (call-first); log the basis per call | Unclear | UWG §7(2) Nr.2 (email), Nr.1 (call) |
| **France** | **Lawful** w/ conditions - legitimate interest, professional address, job-related, opt-out | **Lawful** - B2B is outside the Aug-2026 consumer opt-in flip; no Bloctel screen for B2B | Unclear | CNIL guidance + RGPD 6.1.f; Code conso L223-1 (consumer only) |
| **Netherlands** | **Lawful** opt-out to ALL businesses incl. sole traders (correction: professional natural persons are opt-out, not consent) | **Lawful** to legal persons, no consent, no register | Unclear | Telecommunicatiewet Art 11.7 lid 2 |
| **UK** | **Lawful** opt-out to corporate subscribers; filter out sole traders + non-LLP partnerships | **Lawful** only after screening TPS + CTPS | Unclear | PECR 2003 reg 22 (email), reg 21+26 (call) |
| **Ireland** | **Lawful** opt-out to a genuine corporate address | **Split:** fixed-line opt-out (screen NDD); **MOBILE = consent required** (opt-in) | Unclear | SI 336/2011 reg 13(2),(5),(6) |
| **Spain** | **BLOCKED** - express opt-in, B2B included | **Lawful** w/ conditions - legitimate interest + **mandatory Robinson (Lista Robinson) screen** | Consent | LSSI Ley 34/2002 art 21; LGT art 66 + LOPDGDD art 23 + AEPD Circular 1/2023 |
| **Italy** | **BLOCKED** - opt-in (harvesting a public address and emailing is unlawful) | **Lawful** w/ conditions - **mandatory RPO screen** | Unclear | Art 130 D.Lgs 196/2003; DPR 178/2010 (RPO) |
| **Belgium** | **Lawful** opt-out ONLY to a legal person at an impersonal address (info@, contact@); a named person = consent | **Lawful** - screen the DNCM "Ne m'appelez plus" list (covers B2B numbers) | Consent | Code XII.13 WER + RD 4 Apr 2003 (email); Book VI WER (call) |
| **Poland** | **BLOCKED** - consent, B2B included | **BLOCKED** - consent, B2B included (no call-first fallback) | Not caught by PKE | PKE Art 398 (in force 10 Nov 2024) |
| **Switzerland** | **BLOCKED** for mass; a genuine 1:1 human send is a grey zone, treat as consent | **Lawful** - must skip the phone-directory Sterneintrag (star) entries | Unclear | UWG Art 3(1)(o) email; (u)+(v) call |

**Doctrine implication.** The full Nordic cold-email motion is lawful in **France, UK, Netherlands, Ireland (corporate lane), and Belgium (impersonal lane)**. **Germany, Spain, Italy, Switzerland are call-first** (email blocked, call lawful with screening). **Poland is neither** - it is inbound/warm/partner-intro only. This maps straight onto the existing NO/DK call-first waterfall; Germany, Spain, Italy, Switzerland simply join that bucket, and Poland sits below it.

---

## 7. WHAT IS GENUINELY BLOCKED, AND THE CHEAPEST WORKAROUND

Ranked by how much it hurts.

1. **Germany headcount.** Correction to the internal card: it is NOT a §288 HGB exemption (that reasoning is false). The employee count is an exact figure legally owed in the free published Anhang for 11-50-employee "klein" companies; only sub-10-employee micro-entities may omit it. The real block is that the number is buried as free-text in a per-company Jahresabschluss in the Unternehmensregister, not a queryable field, with patchy filing. **Workaround: parse it from filed accounts (free, the UK-iXBRL pattern) for the ICP subset; proxy from balance-sheet total where missing. No cash needed, engineering only.**
2. **Spain headcount.** Exact figures exist but only paid per-company (deposited accounts, ~EUR 6-15 each) or as a reseller feed. INE DIRCE gives free aggregate bands with a clean cut at 10, but nameless. **Workaround: buy a scoped size feed from Informa/eInforma/Axesor for the IT cohort, ~EUR 2,000-10,000/yr. Do not buy accounts one-by-one (~EUR 60k-150k, uneconomic).**
3. **Switzerland headcount.** No free per-company figure exists at all (STATENT is secrecy-locked to aggregates). **Workaround: buy from Bisnode/D&B CH/Moneyhouse-CRIF, ~CHF 3,000-8,000/yr. This is the Swiss analogue of the Finnish Tilastokeskus buy, but there is no cheap statistics-office route.**
4. **Ireland headcount.** No public iXBRL; the free Financial Statements dataset is a PDF index with zero employee data (the card's join recipe does not work). **Workaround: none free at scale. Buy or OCR-parse; or accept the 10+ gate is unsatisfiable free for IE and lean on other ICP signals.**
5. **Poland reachability + lawful channel.** No lawful cold channel (both email and call consent-gated by PKE Art 398), directors masked at the free API tier, headcount absent from REGON. **Workaround: there is none for cold outreach; treat Poland as a free library shelf and an inbound/partner market only. No amount of cash fixes the law.**
6. **Register phone/email everywhere except Belgium.** Nine of ten registers publish no company phone/email. **Workaround: the R4 domain-prove crawl already lands the company website, and in Germany the §5 DDG Impressum guarantees a free email on it (a phone is often present but not mandated). Named professional emails/mobiles come from the existing FullEnrich waterfall, applied lazily per lead. This is the one Denmark advantage that does not travel.**
7. **Italy / Netherlands universe.** Paid, but cheap (IT ~EUR 1,450; NL ~EUR 2,000). **Workaround: just buy it; the free reconstruction is not worth the engineering at these prices.**

---

## 8. TOTAL COST TO BRING ALL TEN TO NORDIC PARITY

Separating free layers from the few cash lines, because the Nordic lesson was that most of it turned out free.

**FREE data layers (EUR 0, engineering only):**
- France, UK: already built.
- Belgium: universe + founding + NACE + register phone/email/website, one free daily download.
- Ireland: universe + founding + NACE, free HVD bulk.
- Germany: universe (rebuilt from gazette) + founding + directors, free.
- Spain: universe + founding + directors via BORME, free.
- Poland, Switzerland: universe + founding + NACE, free.
- Domain fill (all ten): R4 guess-and-prove, $0 compute.
- Cloud/tech detection (all ten): already solved, $0.

**CASH lines (the whole cost of the exercise):**

| Item | Type | Amount |
|---|---|---|
| Netherlands named universe (selectiebestand) | one-time | ~EUR 2,000 |
| Netherlands directors (officials table) | one-time | ~EUR 2,600 |
| Italy universe (Telemaco Esteso, ~12k ICP) | one-time | ~EUR 1,450-1,800 |
| Germany optional current bulk seed | one-time, optional | EUR 0-5,000 |
| Spain headcount reseller feed | recurring | ~EUR 2,000-10,000/yr |
| Switzerland headcount reseller feed | recurring | ~CHF 3,000-8,000/yr (~EUR 3-8k) |
| Call-screening subscriptions (BE DNCM, IT RPO, ES Robinson, CH directory, UK CTPS) | recurring | low hundreds each, ~EUR 1,000-2,000/yr total |
| Per-lead enrichment (FullEnrich), all markets | variable, lazy | pay-per-hit at engagement |

**Totals:**
- **One-time cash: ~EUR 8,000-13,000** (dominated by NL universe+directors ~EUR 4,600 and IT universe ~EUR 1,500, plus an optional DE seed).
- **Recurring cash: ~EUR 6,000-20,000/yr** (dominated by the two paid headcount feeds, ES and CH).
- **Everything else - six of ten markets' core data, and every domain and cloud layer - is EUR 0.**

The Nordic pattern repeats exactly: the cash concentrates in four cells (NL universe, IT universe, ES headcount, CH headcount), and the rest is free rows plus the joins Forj already owns.

---

## THE THREE MOVES TO MAKE FIRST THIS WEEK

1. **Belgium, in one download.** Register for KBO Open Data, pull the daily full ZIP, load enterprise.csv + activity.csv + contact.csv, filter to legal-person / Status=AC / NACEBEL 62-63. This is the single fastest new market on the map and the only near-exact Denmark repeat: universe + founding date + NACE + free register phone/email/website land in one free pass. Then queue the two free follow-on harvests (NBB XBRL headcount, kbopub directors).

2. **Finish the two built shelves and wire the gate.** Pull today's free UK PSC daily snapshot and join beneficial owners onto gb_registry (named buyers across the whole shelf at GBP 0), fix the iXBRL headcount parser (stream-read-xbrl + AccountCategory cap) and re-stamp; run the France domain-fill on the loaded 7,960 cohort. In the same commit, stand up the lawful-channel field (backlog #15) populated from Section 6: FR/GB/NL/IE-fixed-line/BE = cold-email-capable; DE/ES/IT/CH = call-first; PL = blocked. Nothing sends until this field is live.

3. **Kick off Germany and kill the "trap" label.** It is the #1 opportunity in Europe and the paid-register objection is now false. Start the free .de universe rebuild: ingest the offeneregister CC-BY seed (treat as licence-encumbered, currency unknown), build the Registerbekanntmachungen/Unternehmensregister gazette harvester, and run the Gegenstand-to-NACE classifier. Set Germany to call-first with cold-email blocked, and defer headcount as a known parse-from-filings job. This is ~EUR 0 in data and roughly 2 to 4 weeks of engineering for the largest partner market on the continent.