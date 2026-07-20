# EU/UK REGISTRY ROUTES - THE PARKED MAP (verified 2026-07-17)

All claims below were verified on live pages 2026-07-17 by the four source scans unless marked UNVERIFIED. The bar ("Norway-grade") = per-company registry data, bulk file or API, at literally 0 cost, no negotiated contract, carrying at minimum org number, name, legal form, industry code, status/liveness, and ideally an employee count or size class.

---

## 1. THE ONE-PARAGRAPH ANSWER

Norway-grade free routes exist, verified live, in **Denmark** (arguably above Norway: monthly headcount + FTE, full history, near real-time), **Estonia** (exceeds Norway: exact employees + turnover + taxes + shareholders/UBO, all free), **Czechia** (full bar), **France** (full bar at 10x scale, employee field decaying), **Latvia** and **Lithuania** (bar met with named gaps to close), and the **UK** (full bar, but employees must be assembled from iXBRL accounts filings). **Finland** fails only the employee bar; **Belgium** sits below the bar (registration wall, no employees, direct-marketing ban); **Germany, Netherlands, Austria, Italy, Spain** are not Norway-grade; BRIS and the gov.uk overseas directory are indexes, not data sources. Everything above is PARKED - execution only on paying pull - with two exceptions that matter today because Norway is already live in the library: **(1) the brreg oppdateringer delta feed** (free nightly drift/suppression/bankruptcy detection + employee and domain refresh for all 35k NO rows) and **(2) the brreg underenheter bulk join** (HQ-outlet graph + per-location employees + extra domain surface). Those two are the only build order in this document. One near-free admin move is also allowed: send the Danish CVR credential email now (3-week clock, zero build commitment).

---

## 2. ACT NOW (Norway / brreg) - THE ONLY BUILD ORDER

Catalog root: https://www.brreg.no/en/use-of-data-from-the-bronnoysund-register-centre/datasets-and-api/ - blanket licence quoted from that page: "The datasets follow the provisions of the Norwegian Licence for Open Government Data (NLOD)." No registration for the open datasets. API docs: https://data.brreg.no/enhetsregisteret/api/dokumentasjon/en/index.html

### Exploit #1 - Nightly oppdateringer poll: free drift/suppression feeder into signal_events

- Endpoints: `https://data.brreg.no/enhetsregisteret/api/oppdateringer/enheter?dato={lastRunISO}` plus `/oppdateringer/underenheter` and `/oppdateringer/roller`. Cursor on monotonic `oppdateringsid`. Pagination cap quoted from docs: "(Page+1)*size cannot exceed 10,000" - poll by cursor, not deep pages.
- Live probe (2026-07-17): `GET .../oppdateringer/enheter?dato=2026-07-16T00:00:00.000Z&size=3` returned real JSON with `oppdateringsid`, `dato`, `organisasjonsnummer`, `endringstype`, `_links`; `endringstype` values observed live: **"Ny", "Endring", "Sletting"**; ~4,695 changes for roughly one day, whole country.
- Bankruptcy is a first-class entity field: search param `konkurs` (boolean, "Hvorvidt enheten er konkurs") and response field `konkursdato`. (`includeChanges`/`endringer` field-level change detail is referenced in the docs changelog but exact behavior UNVERIFIED.)
- Pipeline: filter events to org-nrs in the library. `Sletting` = suppress. `Ny` matching the 10+ emp / NACE gate = new-registration signal. `Endring` = hydrate `GET /enhetsregisteret/api/enheter/{orgnr}` and diff `konkurs`/`konkursdato` (bankruptcy suppression), address, navn, `antallAnsatte` (fixes the aging employee field for free), `hjemmeside` (new domain harvest for the choke point).
- Cost 0, no auth, NLOD. This also replaces every paid brreg announcement product: the free machine route to the bankruptcy signal is this poll, not the kunngjøringer XML feed (paid, sftp, price in a PDF annex - https://www.brreg.no/bruke-data-fra-bronnoysundregistrene/abonnement/abonnement-pa-kunngjoringer-i-xml-format/).

### Exploit #2 - Underenheter bulk join: HQ-outlet graph + per-location employees

- Bulk download via the documented `lastned` group of the same API (JSON/CSV/Excel; "The data files are updated once every 24 hours"). Probe endpoint `https://data.brreg.no/enhetsregisteret/api/underenheter` verified live returning `overordnetEnhet` (org-nr of parent/HQ), `naeringskode1` (per-location NACE), `beliggenhetsadresse`, `oppstartsdato`, and employee count when `harRegistrertAntallAnsatte` is true.
- Sub-units are explicitly a separate dataset from the main-unit load Alloy did in 2026-06: "Sub-entities from The Central Coordinating Register for Legal Entities and The Register of Business Enterprises" (https://www.brreg.no/en/use-of-data-from-the-bronnoysund-register-centre/datasets-and-api/data-about-organisations/).
- Pipeline: load underenheter for org-nrs already in the library, attach outlets under HQ (kills chain double-counting, corrects true company size = sum of sub-units), harvest sub-unit epost/hjemmeside for the domain choke point.
- Cost 0, no auth, NLOD.

### Runner-up, policy-gated - roller (board/CEO/chair)

- Free open bulk exists: `/api/roller/totalbestand` ("Download total inventory of roles for all entities"); the national-ID variant is Maskinporten-gated. Registry gives "the name and the birth date on a role holder" (https://www.brreg.no/en/use-of-data-from-the-bronnoysund-register-centre/datasets-and-api/roles-in-the-organisation/).
- Name + birth date = personal data. Per Forj policy, Article 14 is a gate for Norway contacts: do NOT bulk-ingest totalbestand blind. The defensible pattern is per-orgnr lookup (`/api/enheter/{orgnr}/roller`) at engagement time, one company, one lawful-basis assessment. This would be a free Norwegian champion-watch feeder if the gate is ever cleared deliberately.

### Narrow extras, not builds

- Regnskapsregisteret open API: `https://data.brreg.no/regnskapsregisteret/regnskap/{orgNummer}` (spec: https://data.brreg.no/regnskapsregisteret/regnskap/v3/api-docs) - free per-orgnr revenue/result (`driftsinntekter`, `driftsresultat`, `aarsresultat`, `egenkapital`, debt/assets fields) for deal-size and MAP/POC sizing on engaged accounts only. No employee field in the schema. Repo caveat: production but "no guarantees of quality of service"; latest year only. The bulk alternative is paid: "Currently, there are five subscribers who pay NOK 480,000.00 each" (https://www.brreg.no/en/use-of-data-from-the-bronnoysund-register-centre/subscription/subscription-to-annual-accounts/) - fails the 0-cost bar by five orders of magnitude.
- Nordic Smart Government lookup (https://www.brreg.no/en/use-of-data-from-the-bronnoysund-register-centre/datasets-and-api/data-on-nordic-businesses/): orgnr search across NO/SE/FI/IS with name, type, **status**, address, registration date, real-time; API key from data.altinn.no; cost not stated on page - presumed free but UNVERIFIED. No employees, so not a new-country route; note it as a free-ish FI/IS liveness lookup.
- Fullmakttjenesten (signature rights, https://data.brreg.no/fullmakt/docs/index.html): free, open inquiry service, "who can sign the agreement" at closing time; same Article 14 personal-data gate as roller. Park.

---

## 3. THE PARKED MAP

Nothing in this section is a build order. Each entry: route, fields, hurdles, licence, verdict.

### DENMARK - CVR via distribution.virk.dk

- **Route**: Elasticsearch system-to-system, `POST http://distribution.virk.dk/cvr-permanent/{virksomhed|produktionsenhed|deltager}/_search` (article: https://datacvr.virk.dk/artikel/system-til-system-adgang-til-cvr-data). Verbatim: "Data opdateres nær realtid, og er baseret på ElasticSearch og JSON. Det er gratis at benytte løsningen." and "Løsningen indeholder CVR's fulde historik - dvs. alle registrerede ændringer i både ophørte og aktive virksomheder." Bulk = scroll API on the same channel (`?scroll=1m`, `match_all`, then `GET /_search/scroll`); official guide PDF shows `"total": 1854028` virksomhed docs; incremental sync via `range` on `Vrvirksomhed.sidstIndlaest`. There is no separate file dump. Datafordeleren is a dead end: CVR REST there "udfases 15. januar 2027" and "Erhvervsstyrelsen har ikke planlagt at udstille CVR data som filudtræk på Datafordeleren" (https://confluence.kds.dk/x/kQCi).
- **Fields**: richest employee data in this scan - nested `maanedsbeskaeftigelse` / `kvartalsbeskaeftigelse` / `aarsbeskaeftigelse` with `antalAnsatte` (real headcount), `antalAarsvaerk` (FTE), interval codes with udfaldsrum `0, 1, 2-4, 5-9, 10-19, 20-49, 50-99, 100-199, 200-499, 500-999, 1000+`; latest values pre-digested in `virksomhedsMetadata`. Status: `sammensatStatus` (guide: "om den f.eks. er normal eller underkonkurs"), plus `virksomhedsstatus`, `statuskode`, `livsforloeb` (open `periode.gyldigTil` = active). Monthly employment beats both Brønnøysund and SCB size class.
- **Bonus open channels, no credentials**: Regnskabsdata Elasticsearch `http://distribution.virk.dk/offentliggoerelser/_search` - "Regnskabsdata opdateres hvert 10. minut ... Det er gratis at benytte løsningen." - live-probed HTTP 200 anonymous (XBRL + PDF of every DK annual report; https://datacvr.virk.dk/artikel/system-til-system-adgang-til-regnskabsdata). `_mapping` on cvr-permanent also returns 200 without credentials. Free web lookup at https://datacvr.virk.dk/ with no login.
- **Hurdles**: `cvr-permanent` search itself returns 401 without credentials. Access = one email, verbatim: "skal du skrive til cvrselvbetjening@erst.dk, hvor du angiver følgende oplysninger: Virksomhedsnavn, CVR-nummer, Kontaktperson(er), E-mailadresse(r)" with "der normalt er tre ugers behandlingstid på denne oprettelse." HTTP Basic credentials issued. No MitID/CPR anywhere in the flow. Whether a Swedish company can apply (SE org-nr in place of CVR-nr): UNVERIFIED - nothing on the live pages addresses foreign applicants either way; the practical move is one email from Novalo. A signed declaration about reklamebeskyttede enheder reported on ERST's old dataset-catalog page: UNVERIFIED live (page redirects), but the underlying obligation is live-verified (see licence). ERST "forbeholder os retten til at spærre adgangen" for abusive query patterns - keep scroll size modest, 1m windows, DELETE scroll when done.
- **Licence**: "Vilkår for brug af danske offentlige data" v4 - "Myndigheden giver en verdensomspændende, gratis ... ikke-eksklusiv, og i øvrigt ubegrænset brugsret til data, som frit bl.a. kan: kopieres, distribueres og offentliggøres; ændres og sammensættes med andet materiale; bruges kommercielt og ikke-kommercielt." Attribution optional. Governs CVR per https://datacvr.virk.dk/artikel/vilkaar-og-betingelser. Two carve-outs: not ALL ERST products are free (registry data is; some bestilte dokumenter are not), and the reklamebeskyttelse marketing ban sits ON TOP of the licence: "oplysninger, der er registeret om en reklamebeskyttet virksomhed eller p-enhed i CVR, ikke må bruges til direkte markedsføring ... Overtrædelse af ovennævnte kan straffes med bøde." (https://datacvr.virk.dk/artikel/reklamebeskyttelse). Fine-backed; Alloy MUST encode `reklamebeskyttet: true` suppression before any Smith outreach on DK rows.
- **Verdict**: Norway-grade, arguably above it - the only EU register in this class shipping real monthly headcount AND FTE, full history, near real-time, 0 cost, explicit commercial-reuse licence. Frictions vs NO: ~3-week credential lead time vs brreg's instant anonymous download; auth'd API vs open bulk file. The 10-200 census = one scroll job on `cvr-permanent/virksomhed` filtered on open livsforloeb + `intervalKodeAntalAnsatte` in {10-19, 20-49, 50-99, 100-199}. **Allowed now: send the application email (3-week clock, zero build commitment). Load nothing until paying DK pull exists.**

### ESTONIA - RIK + EMTA

- **Route**: RIK e-Business Register open data, free bulk files, daily, CC BY 4.0 (https://avaandmed.ariregister.rik.ee/en/downloading-open-data). Basic file: "Name of the legal person, Registry code, Legal form and subtype, VAT number, Current status, Date of first entry, Address" (XML/CSV); general file adds "Areas of activity" (EMTAK/NACE), capital, annual-report list. Separate free daily files for persons on registry cards, **shareholders, beneficial owners** - data no Nordic register gives away.
- **Employees**: EMTA quarterly open data - "The sums paid by taxable persons in total, total amount of turnover (including purchases subject to reverse charge) and the size of the workforce on a quarterly basis", CSV/XLSX, published "on the tenth date of the month following the quarter" (https://www.emta.ee/en/business-client/board-news-and-contact/news-press-information-statistics/statistics-and-open-data). Exact counts, plus turnover and taxes paid = free revenue proxy.
- **Hurdles**: none material; join EMTA to RIK on registry code. GDPR: FIE (self-employed) rows = personal data, filter like NO/SE.
- **Licence**: CC BY 4.0 (RIK).
- **Verdict**: exceeds Norway. #1 next-country route on data quality. PARKED.

### CZECHIA - ARES + ČSÚ RES

- **Route**: ARES free REST API, no key - "K tomuto účelu není pro běžného uživatele přístup k aplikaci ARES omezen"; throttling only above "více než 500 dotazů za minutu" (https://data.mf.gov.cz/topics/ares). Bulk: "ARES - Výstup pro všechna IČO" ("kompletní obraz informací o osobách zapsaných v České republice ve veřejných rejstřících"), daily, CC BY 4.0 noted on the catalog entry (https://data.gov.cz/dataset?iri=https%3A%2F%2Fdata.gov.cz%2Fzdroj%2Fdatov%C3%A9-sady%2F00006947%2F96dd977366fce71c218949296897027f).
- **Employees**: ČSÚ RES full CSV snapshot "aktualizován 2x měsíčně" (res_data.csv + res_pf_nace.csv; https://csu.gov.cz/produkty/registr-ekonomickych-subjektu-otevrena-data). Field verified in documentation: "KATPO - Kategorie dle počtu pracovníků dle číselníku ČSÚ (579)" = employee size class (https://csu.gov.cz/statistika/registr-ekonomickych-subjektu-otevrena-data-dokumentace).
- **Hurdles**: Czech-only docs. ČSÚ uses its own terms-of-use page, not a named CC licence - UNVERIFIED whether CC-equivalent. OSVČ sole traders in files = GDPR filter.
- **Verdict**: full Norway-grade (size class + NACE + status, bulk 2x/month + free API). PARKED.

### FRANCE - INSEE Sirene

- **Route**: Sirene stock files on data.gouv.fr, free, monthly ("Les fichiers mis en ligne à partir du 1er du mois sont une image du répertoire Sirene à la date du dernier jour du mois précédent"), six stock files, legal units + establishments, NAF codes, status incl. ceased: "les unités légales cessées et les établissements fermés y figurent" (https://www.data.gouv.fr/fr/datasets/base-sirene-des-entreprises-et-de-leurs-etablissements-siren-siret/). CSV deliverables end "dans le courant du deuxième semestre 2027, au seul profit du format parquet".
- **Employees**: `trancheEffectifsUniteLegale` size-class codes (NN, 00, 01=1-2 ... 53=10,000+) in the stock files, BUT the variable page warns: "Since the implementation of the new Sirene offering, the trancheEffectifsUniteLegale variables are no longer systematically populated. Now, only employee numbers known through surveys are reported" (http://www.sirene.fr/sirene/public/variable/trancheEffectifsUniteLegale?sirene_locale=en). Decaying coverage, still usable for the 10-200 band (tranches 11-22).
- **Hurdles**: sheer size (millions of rows, parquet future); sole-proprietor rows = personal data with special Sirene diffusion rules.
- **Licence**: "Licence Ouverte / Open Licence version 2.0".
- **Verdict**: full bar at 10x Norway's scale, one decaying field. PARKED.

### LATVIA - UR + VID

- **Route**: UR (Enterprise Register) open data, CSV, CC0-1.0, "Uzņēmumu reģistrs piedāvātos datus aktualizē katru dienu" (daily); fields "tiesību subjekta veids; juridiskā adrese; aktuālais nosaukums; reģistrācijas numurs" + registration/removal dates; tagged HVD category "Uzņēmumi un uzņēmumu īpašumtiesības" (https://data.gov.lv/dati/lv/dataset/uz).
- **Employees**: VID quarterly taxpayer dataset, CSV, CC0-1.0, includes "vidējo nodarbināto personu skaitu" (average number of employed persons) alongside taxes incl. VAT and social contributions (https://data.gov.lv/dati/lv/dataset/nodoklu-maksataju-taksacijas-ceturksni-samaksato-vid-administreto-nodoklu-kopsummas).
- **Gap**: NACE/industry code not visible in the UR base dataset fields - UNVERIFIED whether a companion UR/CSP dataset carries it. Check before any build.
- **Verdict**: Norway-grade combo (CC0, quarterly employees) IF the NACE gap closes. PARKED.

### LITHUANIA - JAR + Sodra

- **Route**: JAR (Register of Legal Entities) via state open-data platform; live no-key API verified returning `ja_kodas`, `ja_pavadinimas`, `pilnas_adresas`, `reg_data`, `isreg_data`, `forma._id`, `statusas._id`, `stat_data`, exportable CSV/JSON/RDF (https://get.data.gov.lt/datasets/gov/rc/jar/iregistruoti/JuridinisAsmuo).
- **Employees**: Sodra employer-level open data - insured-person counts, average wage, contributions, debt, monthly ("Last month's data is given in the portal not later than on the 20th day of current month" per portal description). atvira.sodra.lt and sodra.lt returned 403 to the fetcher, so the field list is UNVERIFIED verbatim; existence corroborated by official dataset listings (https://data.gov.lt/dataset/apdraustieji/ and https://atvira.sodra.lt/imones/rinkiniai/index.html).
- **Gaps**: NACE code in JAR raw data UNVERIFIED; data.gov.lt licence terms UNVERIFIED.
- **Verdict**: bar met in two pieces, most assembly of the shortlist. PARKED.

### FINLAND - PRH/YTJ

- **Route**: PRH open data - "The PRH's open data are available free of charge" ... "The data are digital and updated once a day"; excludes "private traders" (GDPR-clean at source) (https://www.ytj.fi/en/index/opendata.html). BIS v3 schema verified: `businessId`, `names`, `companyForms`, `mainBusinessLine` (TOL 2008), `registrationDate`, `tradeRegisterStatus`, `status`, `companySituations` (restructuring/liquidation/bankruptcy), `addresses` (https://avoindata.prh.fi/opendata-ytj-api/v3/schema?lang=en). Bonus: free iXBRL financial-statement feed (https://avoindata.prh.fi/en).
- **Gap**: NO employee field anywhere in the schema, and no free per-company FI employee source found (Statistics Finland per-company data is not open). The one Nordic that misses the bar.
- **Licence**: attribution required; formal licence name UNVERIFIED.
- **Verdict**: cleanest API of the lot, fails the employee bar; employees only via Vainu (already in stack). Free FI/IS liveness also available via brreg's Nordic Smart Government lookup (cost UNVERIFIED, see section 2). PARKED.

### BELGIUM - KBO/CBE

- **Route**: CBE open data, free after account + accepting terms; "a complete file with all the active registered entities" plus daily update files, kept 31 days, manual or SFTP (https://economie.fgov.be/en/themes/enterprises/crossroads-bank-enterprises/services-everyone/cbe-open-data). NACE + legal form + status in the file catalogue (catalogue fields UNVERIFIED verbatim).
- **Gaps/hurdles**: registration wall; NO employee counts; no free per-company NSSO alternative found (UNVERIFIED). Hard rule: "Personal data may not be reused for direct marketing purposes."
- **Verdict**: below bar. Park outright.

### UNITED KINGDOM - Companies House

- **Route, liveness layer**: Free Company Data Product - "a downloadable data snapshot containing basic company data of live companies on the register"; "This snapshot is provided free of charge and will not be supported." Monthly, "updated within 5 working days of the previous month end", no registration; current file `BasicCompanyDataAsOneFile-2026-07-01.zip`, 473MB (https://download.companieshouse.gov.uk/en_output.html). Field spec verified first-hand (https://resources.companieshouse.gov.uk/toolsToHelp/pdf/freeDataProductDataset.pdf): `CompanyName`, `CompanyNumber`, address, `CompanyCategory` (legal form), `CompanyStatus`, `DissolutionDate`, `IncorporationDate`, `SICCode1-4`, accounts categories, previous names.
- **Route, employees layer**: accounts bulk products ship raw iXBRL instance documents - daily (Tue-Sat, prior day, each file kept 60 days; https://download.companieshouse.gov.uk/en_accountsdata.html) and monthly archive (1.8-4.1 GiB/month, **each file kept only 12 months**, 13 months downloadable now; https://download.companieshouse.gov.uk/en_monthlyaccountsdata.html). Parse `core:AverageNumberEmployeesDuringPeriod` per company number (filenames embed it). Legal basis, Companies Act 2006 s411 verbatim: "The notes to a company's annual accounts must disclose the average number of persons employed by the company in the financial year." (https://www.legislation.gov.uk/ukpga/2006/46/section/411). Mandatory-and-validated in iXBRL since 13 Oct 2020, incl. small/micro (https://www.vtsoftware.co.uk/finalacshelp/average-number-of-employees-ta.html and https://xmlforum.companieshouse.gov.uk/t/accounts-clarification-of-average-number-of-employees-requirement/510). Coverage sentence on both products: "Data is only available for electronically filed accounts, which currently stands at about 75% of the 2.2 million accounts we expect to be filed each year." (2025 FRC taxonomy type change to nonNegativeDecimalItemType: UNVERIFIED on a live page.)
- **Route, API**: free registration, "You can make up to 600 requests within a five-minute period", 429 above (https://developer-specs.company-information.service.gov.uk/guides/rateLimiting, https://developer.company-information.service.gov.uk/get-started). Status vocabulary from CH's api-enumerations repo (https://raw.githubusercontent.com/companieshouse/api-enumerations/master/constants.yml): `active, dissolved, liquidation, receivership, converted-closed, voluntary-arrangement, insolvency-proceedings, administration, open, closed, registered, removed`, plus `company_status_detail` incl. `active-proposal-to-strike-off` - an early-death signal the Nordics don't give this cleanly.
- **Catches**: snapshot is live-companies-only, dissolved rows are DROPPED not flagged - detect dissolution by diffing consecutive monthly snapshots or via API. Employee data is accounts-derived, lagging reality by up to ~21 months (9-month private-company filing deadline: UNVERIFIED figure) vs Brønnøysund's registry-native count. ~25% (paper filers) have no employee number. Monthly accounts archives vanish after 12 months, so a UK build must start a rolling harvest on day one. Huge shell/dormant tail (dormants tag zero) - the SIC+employees+status filter does far more gatekeeping than in Norway.
- **Licence/cost**: free, no contract, no key for bulk; no pricing appears anywhere on the developer hub.
- **Verdict**: Norway-grade YES, with an assembly step Norway doesn't need (snapshot + iXBRL join + monthly diff). PARKED - execute only on paying UK pull.

---

## 4. DO NOT BOTHER

- **Germany**: viewing free since DiRUG 2022 ("Article 11 Nr. 4 DiRUG abolished the fee regulation ... EUR 4.50 ... EUR 1.50") but handelsregister.de has no official API and no bulk export; bundesAPI/handelsregister on GitHub is an unofficial scraper (https://law-blog.de/handelsregister-vereineinsregister-kostenlos-abrufen-dirug-digitalisierung/, https://github.com/bundesAPI/handelsregister). No employees. Free-to-click is not free-in-bulk.
- **Netherlands**: KVK's HVD open dataset is free CC BY 4.0 but deliberately anonymized - it "does NOT include: KVK numbers, company names, full postcodes, employee counts, or data from sole proprietorships" (https://www.kvk.nl/en/ordering-products/kvk-business-register-open-data-set/). Useless for prospecting; real records €2.85/extract or paid API.
- **Austria (Firmenbuch), Italy (Registro Imprese), Spain (Registro Mercantil)**: paid-extract regimes, no free bulk found - UNVERIFIED one-liners, not checked live this pass.
- **BRIS / e-justice portal**: human search UI over interconnected registers, "At the moment you can only request information that the national registers provide free of charge"; no API, no bulk (https://e-justice.europa.eu/topics/registers-business-insolvency-land/business-registers-search-company-eu_en). Value = canonical index of which national register to raid, nothing more.
- **gov.uk overseas-registries directory**: link list, "Updated 5 June 2018", "This is not a comprehensive list of all company registries located around the world." Starting rolodex only (https://www.gov.uk/government/publications/overseas-registries/overseas-registries). EBRA and e-justice are the better indexes - UNVERIFIED, not fetched.
- **brreg paid/gated products**: kunngjøringer XML feed (paid sftp), Regnskapsregisteret bulk (NOK 480,000/subscriber), beneficial-owners register (AML-obligated entities and authorities only, "Only public authorities have access to the register's total inventory" - https://www.brreg.no/en/use-of-data-from-the-bronnoysund-register-centre/datasets-and-api/data-on-beneficial-owners/). The free oppdateringer poll covers the suppression signal; Forj neither qualifies for nor needs UBO.

---

## 5. RULES THAT TRAVEL

- **Sole proprietors = personal data everywhere in this map.** NO/SE rule extends to DK enkeltmandsvirksomheder, EE FIE, CZ OSVČ, FR (special Sirene diffusion rules). Finland strips them at source. Filter on legal form before any load.
- **Licence does not equal permission to market.** Denmark's fine-backed reklamebeskyttelse ban ("... ikke må bruges til direkte markedsføring ... kan straffes med bøde") and Belgium's "Personal data may not be reused for direct marketing purposes" both sit ON TOP of open licences. Encode suppression flags in the pipeline, not in a policy doc.
- **Person-level registry data (boards, CEOs, signatories) is a GDPR Article 14 gate**, per existing Forj policy on brreg roller: per-orgnr at engagement time, one lawful-basis assessment per company, never blind bulk ingest - even when the bulk file is free and open.
- **Verify the licence per dataset, not per country.** Known-good: NLOD (NO), CC BY 4.0 (EE, CZ catalog), CC0 (LV), Licence Ouverte 2.0 (FR), DK vilkår v4 (explicit commercial reuse). Open questions carried forward: ČSÚ terms CC-equivalence UNVERIFIED, data.gov.lt terms UNVERIFIED, PRH licence name UNVERIFIED.
- **HVD Regulation (EU) 2023/138 is the tailwind, not a guarantee.** Applicable since 9 June 2024; mandates HVDs "available free of charge, in machine-readable formats, and through APIs and bulk downloads where relevant" but the EU's own assessment: "The implementation is progressing but is lacking evenness" (https://data.europa.eu/en/news-events/news/high-value-datasets-what-has-changed-and-what-will-come-next; EUR-Lex full text blocked the fetcher, date corroborated at https://eur-lex.europa.eu/eli/reg_impl/2023/138/oj/eng). The regulation lets registers strip personal data - exactly the loophole KVK used. Landed for real: EE/LV/LT/CZ/FR/BE/FI. Landed maliciously: NL. Not landed: DE.
- **Free products can decay - harvest windows matter.** UK monthly accounts archives are deleted after 12 months; DK scroll access can be revoked for abusive patterns; FR CSV dies in H2 2027 (parquet only). If a market ever activates, start the rolling harvest on day one of activation, not later.
- **Sequencing law**: AWS-first Nordics NOW; every non-NO route in this document executes ONLY on paying pull. The two permitted moves today: build the two brreg exploits (section 2), and send the one Danish credential email to cvrselvbetjening@erst.dk (3-week processing clock, zero build commitment).
