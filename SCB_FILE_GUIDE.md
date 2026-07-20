# THE SCB FILE: WHAT TO DO, CLICK BY CLICK

Verified 2026-07-17 against live pages (4 independent live verifiers + one spot re-check of the fee claim on scb.se the same day). Every claim carries its source URL. Anchors: Novalo Technologies AB 559427-6411, claude-proxy headroom $444.72, pre-wired emp_size column, S5/S6/S7 in `ALLOY_DATA_AUDIT.md`.

## 1. THE ANSWER IN ONE PARAGRAPH

The whole gate opens for 0 SEK, in two moves, in this order. First (today, 10 minutes, no account): download Bolagsverket's two free weekly bulk files. They give you liveness (deregistration date and reason, ongoing konkurs/likvidation, plus SCB's Ftgstat active-flag) and every post-2019 formation, for all Swedish organisations. That fixes two of your three missing fields immediately but carries NO employee size class, confirmed absent in both files. Second (today, one email, then wait for credentials): the size class comes from SCB's allmänna företagsregistret, which became entirely fee-free by government regulation on 26 June 2025 (https://www.regeringen.se/pressmeddelanden/2025/05/scbs-dataregister-blir-avgiftsfritt-och-oppet/). Access is a free REST API; you request it by emailing scbforetag@scb.se, you receive a certificate and password, and the base layout ("Basutbud") already includes Storleksklass anställda (codes 0-16), Företagsstatus, Registreringsdatum, SNI 1-5, juridisk form and kommun (postbeskrivning PDF dated 2025-06-26: https://www.scb.se/contentassets/8a8eb5c3d45f461ea93482f8e8d4de4f/postbeskrivning-foretag.pdf). One afternoon of API pulls covers the full AB stock. Pay nothing. The only scenario where money changes hands is if you insist on a delivered file instead of the API and SCB still invoices its legacy tier: worst case 10,000 SEK for 25k-500k rows. Do not pay it unless the API route fails, and do not touch the $1,640-2,000 screening spend at all; it is dead.

Note on conflicting reports: one verifier says the paid order is moot, another lists the legacy price table still live on scb.se. Resolution: the regulation (in force 2025-06-26) and SCB's own main page ("SCB inte längre ska ta ut avgifter för uppgifter ur företagsregistret", https://www.scb.se/vara-tjanster/bestall-data-och-statistik/foretagsregistret/ — re-verified same day, sentence live) outrank the stale legacy page and FAQ. The API is the free channel that certainly exists; the bespoke delivered file is the only ambiguous one. Use the API.

Internal cross-check before sending anything: `BACKLOG.md` (A6 re-scope note) already names the "SCB size-class join (free 2025 API)" as planned work, but there is no record in the repo that the scbforetag@scb.se access request was ever sent. Confirm before emailing, to avoid a duplicate application.

## 2. ROUTE A: THE FREE BOLAGSVERKET FILES (do first, today, no account)

What it fixes: liveness/status for all 489k rows, and every AB formed after 2019 (the library has 88 rows with reg_date 2020+; these files are current full-register snapshots refreshed weekly, last-modified verified 2026-07-13).

Steps:
1. Read the field tables once: "Nedladdningsbara filer - Bolagsverket", https://bolagsverket.se/apierochoppnadata/hamtaforetagsinformation/nedladdningsbarafiler.2517.html. Page states "Det kostar ingenting och det krävs inga avtal. Våra filer uppdateras veckovis."
2. Download file 1: https://vardefulla-datamangder.bolagsverket.se/bolagsverket/bolagsverket_bulkfil.zip (~249 MB, unzips to .txt). Fields per orgnr: organisationsform (AB-ORGFO = Aktiebolag), registreringsdatum, avregistreringsdatum, avregistreringsorsak (KKAV konkurs, LIAV likvidation, FUAV fusion, AVREG, VERKUPP), pågående avvecklings-/omstruktureringsförfarande (ongoing KK/LI/FR with from-date), verksamhetsbeskrivning, postadress. No SNI, no employees.
3. Download file 2: https://vardefulla-datamangder.bolagsverket.se/scb/scb_bulkfil.zip (~71 MB, .txt). Fields: PeOrgNr, Ftgstat (0 never active, 1 active on moms/F-skatt/employer, 9 not active), Jestat, RegDatKtid, Jurform (49 = övriga aktiebolag), SNI Ng1-Ng5 (SNI 2025), address. No employees.
4. Caveat: SCB purges deregistered rows 6 months after Jestat=9, so file 2 is "current plus recently dead", not an archive. File 1 keeps the deregistered rows with reason. Join both on orgnr for the strongest liveness signal.
5. Scripting is fine: the file host is not CAPTCHA-protected (unlike www.bolagsverket.se pages) and pulls work unauthenticated; a weekly cron is legitimate under the EU HVD regulation (2023/138, free since 2025-02-03, per https://bolagsverket.se/apierochoppnadata/hamtaforetagsinformation/vardefulladatamangder.5294.html).

Skip the Bolagsverket API (kundanmälan, OAuth2, 60 req/min) for now; the open bulk files make it unnecessary for this job.

## 3. ROUTE B: THE SIZE CLASS (SCB free API, 0 SEK)

Source pages: "Avgiftsfria uppgifter i företagsregistret", https://www.scb.se/vara-tjanster/bestall-data-och-statistik/foretagsregistret/avgiftsfria-uppgifter-i-foretagsregistret/ and the variabelbeskrivning, https://www.scb.se/vara-tjanster/bestall-data-och-statistik/foretagsregistret/variabelbeskrivning/.

What the free base layout (Basutbud) already contains, verified in the postbeskrivning PDF: OrgNr (10) + PeOrgNr (12), Företagsnamn, address, Säteskommun kod+text, Stkl kod ("Storleksklass på företaget, antal anställda"), Företagsstatus, Juridisk form (49 = övriga aktiebolag), Startdatum, Slutdatum, Registreringsdatum, Bransch_1-5 (SNI 5-digit). Every variable on the tick-list is in the default layout; there is no form with checkboxes, you name the layout in the email.

Size class codes for the promotion rule: 0 = uppgift saknas, 1 = 0 anst, 2 = 1-4, 3 = 5-9, 4 = 10-19, 5 = 20-49, 6 = 50-99, 7 = 100-199, 8 = 200-499, 9+ = larger. Desk 10-200 ICP = Stkl 4-7 plus the 8 boundary. Liveness = Företagsstatus 1 and Slutdatum empty.

Steps:
1. Email scbforetag@scb.se (draft in section 4). Include: organisation name and orgnr, the person accepting användarvillkoren, the credential recipient's name/email/phone, and which layouts you want. No BankID, no webshop.
2. Receive certificate + password (turnaround not stated on the page: UNVERIFIED, plan for days not hours).
3. Pull: REST, JSON or XML (not CSV; convert locally). Limits verbatim: "Maximalt 2 000 rader kan hämtas hem vid varje anrop", 10 calls per 10 seconds. Partition by kommun x storleksklass (add SNI in Stockholm/Göteborg/Malmö) to keep every slice under 2,000 rows. The full ~490k AB stock is one afternoon.
4. Price: 0 SEK (regulation-backed). Only if you demand a delivered file via the legacy route ("Beställ en lista...", https://www.scb.se/vara-tjanster/bestall-data-och-statistik/foretagsregistret/foretagsregistrets-tjanster/bestall-en-lista-med-foretag-eller-arbetsstallen/) might the old tier apply: 10,000 SEK for 25,000-500,000 poster. Whether SCB still invoices that is UNVERIFIED; the same email settles it.
5. Timing caveat: a replacement API ships September 2026 (API-key auth). Stkl, Företagsstatus, SNI and Registreringsdatum all survive the migration; the current API stays up through the transition. Get credentials now, before the switchover queue.

Optional add-ons to request in the same email, all free: TG07Oms (omsättningsklass), TG09Epost, TG15Stat_Bol (Bolagsverket status). Skip the rest.

Backup size source if SCB stalls (verified real, $0, more work): the open årsredovisningar bucket, https://vardefulla-datamangder.bolagsverket.se/arsredovisningar/ (1,371 weekly zips, 2020 to now, ~127 GB, no account). Every digital K2/K3 filing carries the mandatory tag `se-gen-base:MedelantaletAnstallda` (schema: http://xbrl.taxonomier.se/se/common/base/se-gen-base/2021-10-31/se-gen-base-2021-10-31.xsd). Covers ~63% of ABs (the digital filers), 1-2 days of scripting on the box. Use only if the SCB credentials do not arrive; the SCB route is strictly better (100% coverage, ready-made classes).

## 4. WHAT TO SAY: the email Jacob pastes and sends himself

To: scbforetag@scb.se
Subject: Ansökan om åtkomst till avgiftsfria API:et för allmänna företagsregistret

Hej,

Vi önskar åtkomst till det avgiftsfria API:et för uppgifter ur SCB:s allmänna företagsregister.

Organisation: Novalo Technologies AB, org.nr 559427-6411
Person som accepterar användarvillkoren: Jacob Ahmid, jacob@forj.se
Mottagare av certifikat och lösenord: Jacob Ahmid, jacob@forj.se, [telefonnummer]

Vi önskar postbeskrivning Företag (basutbudet), samt tilläggen TG07Oms, TG09Epost och TG15Stat_Bol.

Användningsområde: urval av aktiva aktiebolag per storleksklass, bransch (SNI) och kommun för vår egen marknadsbearbetning.

Två korta frågor:
1. Ingår Storleksklass anställda och Företagsstatus i basutbudet via API:et utan avgift, i enlighet med förordningsändringen som trädde i kraft 26 juni 2025?
2. Om vi i stället vill ha en levererad fil (tab-separerad) med samtliga aktiebolag, utgår någon avgift för det idag?

Tack på förhand,
Jacob Ahmid
Novalo Technologies AB

(Fill in the phone number before sending. Question 2 settles the 10,000 SEK ambiguity for free.)

## 5. HAND-OFF: where the file goes and what fires automatically

1. Convert the API pulls (JSON/XML) or bulk .txt to one CSV with headers including orgnr, name, emp_size (Stkl code or band text), status (Företagsstatus), sni_code, kommun, juridisk_form, reg_date.
2. Host it where the box can reach it (Supabase storage or the box itself), then run `se-ingest` in peek mode first: it takes `{mode:"peek", url}` and reports encoding, delimiter, resolved column mapping, and whether orgnr and name resolved ("Safe to run the full load" note). Add the emp_size column mapping (the pre-wired 30-minute job per the audit).
3. Full load into `se_registry`. Prerequisite from the audit: merge the 2 orgnr formatting dupes by hand and create the normalized-orgnr unique index BEFORE any promotion (D2 in `ALLOY_DATA_AUDIT.md`).
4. S6 fires: the pre-written promotion rule (juridisk_form = '49' AND emp_size in the 10-199 classes AND status = active AND sni allowlist) promotes ~17-21k rows for $0, minutes of runtime. Gate: 0 rows under 10 employees, count within 20% of prediction, 20 random names with no shells.
5. S7 fires gated: domain-fill the promoted pool, tranched, $375-672. Hard gate: measure the hit rate on the first 1,000 rows ($32); below 30%, STOP. That $32 decides the $672 question. S3 (domain-fill guard: 0 NO rows, 0 under-10 rows on dry run) must be deployed before S7.

## 6. WHAT NOT TO BUY

- The $1,640-2,000 screening spend. Dead the moment the SCB email is answered.
- SCB Aviseringar (change files) and NÄRA: still "enligt gällande prislista", and the API has no delta endpoint anyway; a periodic re-sweep is free and sufficient.
- The legacy delivered-file tiers (1,000 / 5,000 / 10,000 / 75,000 kr) unless the email confirms the API route is somehow unavailable AND the file is invoiced at worst 10,000 SEK. Never the 75,000 kr full-register tier; you do not need over 500k rows.
- Aggregators (allabolag/UC, Ratsit, Proff): no legitimate bulk route, ToS-hostile, and now pointless since the official register is free.
- Vainu or any paid enrichment for employee counts on the registry pool. Also, per the audit, do not spend on contacts for the existing library (92.5% already covered); contacts for S6/S7 newcomers are out of scope until S7's gate passes.
- The Bolagsverket API kundanmälan for this job (bulk files suffice), and the ~127 GB årsredovisningar corpus unless SCB stalls.

One open item beyond the email: confirm whether the SCB access request was already filed under the BACKLOG A6 work; the repo shows it planned, not sent.
