# The Alloy enrichment waterfall

_2026-07-26. Investigation, audit and decision. Sources: live measurements taken today against
FullEnrich, Serper and the box; 125 verified research findings from a five-angle fan-out
(architecture, lazy economics, phone providers, legal, competitors), of which 4 load-bearing claims
were adversarially refuted and corrected; an inline sweep of the EU vendor scene. Where a number
could not be established, this document says so instead of inventing one._

Goal: enrich Europe. EU services as far as possible. LinkedIn URL and email are must-haves on every
worked account. Mobile numbers are on-demand only, enriched when a human asks on an account.
Enrichment is included in the 10,000 SEK/month tier as Forj's cost of goods; there is no per-credit
customer billing.

---

## 1. What we hold today, measured

| | |
| --- | --- |
| Library | 96,877 companies (SE 41,252 / NO 35,458 / FI 19,986; DK API ~2 weeks out) |
| Contacts | 77,028 people at 29,272 companies |
| With email | 29,313 (38%) |
| With phone | 15,685 (20%, mostly switchboards) |
| Companies with nobody on file | **67,605 (70%)** |
| Serper balance | 14,944 credits (287,553 burned 23-25 July on the eager SCB load) |
| FullEnrich balance | 493.25 credits |
| Pattern candidates staged | 26,978, **zero verified, zero promoted** |
| serper_linkedin ledger | 7,500 tried, 822 verified |

The Serper burn is the whole argument for lazy enrichment in one number: three days of eager
library-wide work consumed 19x what now remains. One partner working 200 accounts a month consumes
about 1,000 credits. Same balance, a year of runway, and the only difference is the trigger.

## 2. The two facts that reorder everything

**Lazy is not just cheaper, it is legally safer.** Article 14 GDPR applies to every enriched named
person because we obtain the data from third parties, and the notification duty starts at
acquisition, with notice due at the latest at first communication. Pre-enriching 67,605 companies
would create that duty toward every person found, immediately, at library scale. Enriching only
opened accounts creates it a few hundred people at a time, attached to accounts a human is actually
working. The disproportionate-effort exemption is NOT available for people we intend to contact.

**A found email is not a sendable email.** FullEnrich's own published bounce rates: DELIVERABLE 2%,
HIGH_PROBABILITY 9%, CATCH_ALL worse. Amazon SES puts an account under review at 9% bounce. So the
measured 88% find rate is not an 88% deliverable rate, and only DELIVERABLE-status results may
auto-promote to `contacts.email`. Everything else stages for verification. This rule is what was
missing when 26,978 pattern candidates piled up unverified.

## 3. The country matrix that shapes the product

ePrivacy leaves legal-person protection to national law, and the four countries landed in four
different places. This is bigger than the waterfall: it decides what Smith is allowed to draft
per country.

| | Cold B2B EMAIL to a named person | Cold CALL to a business | Statutory suppression |
| --- | --- | --- | --- |
| Sweden | ✅ no prior consent needed (MFL 19 § protects only fysisk person) | ✅ check NIX for sole traders | reklamspärr covers post + phone only, NOT email; honour anyway as god marknadsföringssed |
| Finland | ✅ cleanest market: permitted unless the org forbade it | ✅ opt-out for human calls | Traficom route for individuals |
| Norway | ⛔ PRIOR CONSENT required even at a work address (mfl. § 15) | ✅ business-relevant calls OK | Reservasjonsregisteret: monthly scrub, phone/post, no free API |
| Denmark | ⛔ spam ban covers everyone, consent required | ✅ ban protects only consumers | CVR reklamebeskyttelse is STATUTORY; published fine tariff from DKK 20,000 |

Consequences, encoded as product rules:
- **SE and FI accounts get email-first plays. NO and DK accounts get call-first plays.** In Norway
  and Denmark the deliverable is a call brief with a number, not an email draft. This is why phone
  reachability matters more than email volume for half the library, and it changes what "enriched"
  means per country.
- Sole traders (enskild firma, enkeltpersonforetak, enkeltmandsvirksomhed): the whole company
  record is personal data. Treat them as persons throughout.
- Suppression lists are never TTL'd and are checked before the first PAID call, not before the send.
- Every enriched attribute records its source, because the Article 14 notice must name it. A
  black-box aggregator that will not say which provider found an email is a compliance liability,
  not a convenience.

## 4. The vendor audit, EU-first

Verified today and from the fan-out. "EU" means established in the EU, not merely GDPR-claiming.

**Genuinely EU, earns a place:**
- **Dropcontact (FR).** No database at all: generates and verifies algorithmically on EU servers,
  GDPR by design, does LinkedIn URL enrichment, API + MCP, from €79/month flat. No phones. The
  no-database model also simplifies our Article 14 source line. Untested on Nordics: pilot.
- **Icypeas (FR).** Email finder + verifier (catch-all detection), pay-as-you-go credits that roll
  over, TLMR-audited, ISO 27001 hosting. Claims 3-10x cheaper than Wiza/Findymail; exact per-verify
  price to be confirmed in the pilot. Candidate verifier for the 26,978 staged patterns.
- **FullEnrich (FR controller).** The only vendor with a measured Nordic result: 44/50 = 88% on our
  own pre-registered hard sample, success-only billing confirmed real, mobile $0.55 success-only.
  Caveat: the waterfall underneath is largely US sources (Clearbit, Hunter, Wiza, ContactOut,
  Anymail Finder, Snov named), so it is an EU shell over mixed data. ⚠️ Still no working opt-out
  route on their site; written erasure route required before we scale volume through them.
- **Datagma (FR).** Success-only, email + mobile (~$0.39-0.49/mobile), 72h opt-out. Reported weaker
  outside Western Europe. The EU-native mobile price probe.
- **Explorium.** Already contracted, covers Norway, 5cr phone / 2cr email, no success-only
  guarantee. Keep for NO.

**Aggregators, judged:** BetterContact (success-only, email+mobile, 20+ unnamed providers) and
ColdIQ (US LLC, 40+ providers) are waterfalls-of-waterfalls. Redundant with what we are building,
and unnamed sources collide with the per-attribute provenance rule. Skip. Datazn is a B2C-leaning
marketplace: skip. Limadata: no stated EU footing, Google-Form opt-out: skip.

**Big platforms, judged:** Cognism scopes its coverage claim to 50+ employees, outside much of our
ICP, and its API is gated behind a paid seat. Kaspr is the CNIL fine (€240,000, scraping
restricted LinkedIn profiles) and named no Nordic country at acquisition. Apollo/Surfe/Amplemarket
bundle credits per seat, structurally wrong for our unlimited-seat included model. Ocean.io and
Leadfeeder validate our model (unlimited seats, shared pool) and Leadfeeder builds from national
registries exactly as we do, at €79-599/month. They are competitors to watch, not rungs.
No vendor except Vainu publishes any Nordic coverage rate, so every "best European coverage" claim
in this market is unfalsifiable. Ours is measurable, which is the moat.

## 5. The ladder

Ordering rule (verified): expected cost per success. Under success-only billing, hit rate drops out
and cheapest-first is provably optimal. At our lazy volumes, ordering saves little money; the
trigger controls cost, so the ladder is engineered for quality and provenance.

**STACK DECIDED 2026-07-31 (Jacob): Serper + Icypeas + FullEnrich. Dropcontact is OUT.**

```
R0  FREE      registry identity + pattern-infer            always, pre-warm eligible
R1  ~$0.001   Serper: LinkedIn URL discovery               must-have rung; also /places switchboard
R2  $0.001    Icypeas VERIFIER (0.1 credit)                the R0 pattern gate; MEASURED 32% real
R3  ~$0.06    FullEnrich email (1cr, success-only)         the proven closer; DELIVERABLE only
R4  ~$0.55    FullEnrich mobile (10cr) + Twilio Lookup     ON DEMAND, human-gated, never speculative
              ($0.008 line-type check on every number)     Datagma as EU probe; Explorium for NO
```

Three tools, each doing the one job it is best at: Serper discovers, Icypeas verifies cheaply,
FullEnrich closes expensively. Dropcontact was never measured (its pilot results were lost to an
SSM timeout and only ever inferred from credit consumption), so this is a decision, not a
head-to-head verdict. Nothing in this file should claim Icypeas beat it.

**R2 is a VERIFIER, not a finder.** The 2026-07-29 pilot found Icypeas adds almost nothing stacked
as a finder: union with FullEnrich was 46/50 against FullEnrich's own 44/50, so 2 net. Its real
value is the 0.1-credit verification that turns free R0 pattern guesses into known-good addresses.

**Measured on 100 staged candidates, 2026-07-31:** 32% return `DEBITED` with `certainty:
ultra_sure` and MX confirmed; 68% return `DEBITED_NOT_FOUND`, meaning the guessed mailbox does not
exist. ⚠️ **Both outcomes debit 0.1 credit** - for a verifier, "this address does not exist" IS a
successful result, so budget the whole population, not just the hits.

- **LinkedIn URL (must-have)** is R1: Serper at ~$0.001 with 1,752 finds already banked.
- **Email (must-have)** cascades R0 → R2 → R3, stopping at first DELIVERABLE result.
- **Mobile** never cascades automatically. A human presses Enrich on an account; R4 fires once;
  the Twilio line-type check runs before the number is shown as a mobile.
- Stop conditions and misses are cached: an authoritative "not found" gets a long TTL keyed on the
  full query tuple (person + company + domain + linkedin_url), so acquiring a new input legitimately
  re-opens it. A transient provider failure gets a short TTL and a token-bucket retry so an outage
  cannot drain budget down the expensive tail. Every attempt carries an idempotency key: async
  webhook providers double-charge on naive retries without one.
- The whole thing is a queue with async completion, never a blocking call. Measured industry
  latency for a full cascade is ~56 seconds, 5-6x past what a user will watch. The account card
  renders immediately from registry data; person fields fill as webhooks land.

## 6. Triggers

- **On account open** (a partner moves a company into their working set): R0-R3 fire queued.
- **On instruction** (the Enrich button): R4 mobile, plus a forced re-run of R1-R3 if stale.
- **Pre-warm** fires only R0 and R1 (free and near-free), only on a partner's working set or a
  signal firing against an ICP-fit account. Never on ICP score alone across the library: 14,944
  Serper credits is four days of eager burn. FullEnrich is never speculative.
- **Never**: suppressed companies (reklamspärr, CVR-protected, phone_opt_out), sole traders without
  a legal-basis check, any account in Norway/Denmark for email-first plays.

## 7. Economics per tenant

Typical opened account: ~5 Serper lookups ($0.005) + ~3 email credits across R2/R3 (~$0.17).
Call it $0.20 without mobile. A busy partner at 200 opened accounts and ~120 on-demand mobiles a
month: $40 + ~$66 = **~$106/month against $950 revenue, ~11% COGS.** The research benchmark for
included-enrichment entitlements is 1,000-2,000 records/seat/month; we can afford that envelope.

The cap (task #187): set the ceiling at ~3x observed normal usage, per the measured industry
pattern, so it never bites an honest user. At the ceiling, degrade: keep serving R0/R1, stop
spending R3/R4. Reuse the claude-proxy cap + COGS-attribution shape; `fullenrich_spend` already
logs per-user. Amplemarket's tier-scoped database access is the fallback lever if a whale appears.

## 8. Europe expansion checklist, per country

The lazy model makes each country a fixed engineering cost instead of a data bill:
1. Free registry loader (the solved pattern: SE/NO/FI live, DK in ~2 weeks, then EE/CZ/FR/LV/LT/UK
   per the registry-routes scan).
2. The country's email/call legality row in the matrix above, written BEFORE first outreach.
3. The country's statutory suppression flag wired into the never-fire list.
4. Domain-fill via the existing zone oracles + Serper.
5. Nothing else. No pre-enrichment. Reachability spend starts when a partner opens an account.

## 9. Fix first, in order

1. **Verify the 26,978 pattern candidates** through a success-only verifier (Icypeas pilot, 500
   contacts, SE first). They are also a compliance asset: verified-then-promoted with provenance
   beats bulk-promoted. Cheapest reachability we own.
2. **Wire provenance + Article 14 machinery**: source recorded per attribute; first-communication
   notice text in Smith's drafts; the absolute Art 21(2) objection route in every sequence.
3. **Country-gate Smith's plays**: email-first SE/FI, call-first NO/DK. This is a product change,
   not copy.
4. **Get FullEnrich's written erasure route** before scaling; their site still has no working
   opt-out form.
5. **Pilot Dropcontact vs Icypeas on the same 50-contact hard sample** we used for FullEnrich, so
   R2 is chosen on measured Nordic evidence like R3 was.
6. **Build the cap** (#187), then **the pre-warm** (#186), in that order: the pre-warm without the
   cap is the July Serper burn again.

## R2 pilot results (2026-07-29, same 50-contact pre-registered hard sample)

| Provider | Found | Rate | Notes |
| --- | --- | --- | --- |
| FullEnrich (R3 baseline) | 44/50 | 88% | measured 2026-07-25 |
| **Dropcontact** | **~42/50** | **~84%** | inferred from credit consumption: 50 credits before, 8 after, and Dropcontact bills ONLY on a returned verified email with misses refunded. The batch results sit in the dashboard; the request id was lost to an SSM timeout. Retrieve and confirm before treating 42 as exact. |
| Icypeas | 24/50 | 48% | all 24 rated ultra_sure; per country FI 6/10, NO 11/20, SE 7/20 |

Provisional verdict, pending the dashboard export: **Dropcontact takes R2.** EU-native, algorithmic
with no database held (which also simplifies the Article 14 source line), and statistically even
with FullEnrich on the exact population Clay failed. FullEnrich drops to R3 closer plus the R4
mobile rung.

**Overlap, measured on the same 50 (2026-07-29):** both found 22 (16 the identical address, 6
disagreements worth a verify), FullEnrich-only 22, Icypeas-only 2, neither 4. Union
**46/50 = 92%** against 44/50 for FullEnrich alone. So Icypeas adds almost nothing as a stacked
FINDER. Its real jobs, priced from Icypeas's own binding rate card (CEO email 2026-07-29,
$19/1,000cr, success-only, credits roll over forever even after cancelling):

1. **THE VERIFIER, and it closes fix-first #1.** Email Verifier is 0.1 credit = $0.0019/check.
   The whole 26,978-candidate pattern pool verifies for ~2,698 credits, about $51. One Premium
   month at $39 buys 4,000 rollover credits: the entire broken rung fixed, with 1,300 credits
   spare. Even a 25% deliverable rate yields ~6,700 verified emails; buying those from FullEnrich
   would cost ~$390. Only DELIVERABLE-status results promote, per section 2.
2. **The EU LinkedIn fallback.** Profile URL Finder: name + company → LinkedIn URL at 1 credit,
   success-only. Serper stays primary at $0.001; this is the fallback when Serper misses, and it
   keeps the must-have rung EU-native end to end.
3. **Norway routing.** Icypeas's country profile inverts FullEnrich's: FI 60 / NO 55 / SE 35
   against FullEnrich's NO 75 being its weakest. When per-country volumes exist, route NO through
   both and measure; the conditional-routing table from the architecture research, not a guess.

Caveat on vendor tables: Icypeas's published comparison ranks itself first at $4.99/1,000 found
with Dropcontact at $28.62; it is marketing and the sample is theirs. The mechanics relied on here
(0.1cr verify, success-only, permanent rollover) come from their own rate card and the CEO's
written statements, which are the binding kind.

## What was refuted, for the record

Four load-bearing claims died in adversarial verification and are corrected here: Ocean.io is a
price MATCH to FullEnrich (and cheaper above ~15k credits/year), not a more expensive ceiling; the
mobile-to-email ratio is 3-10x and is packaging, not data cost — the real reason mobile stays
gated is that vendors allocate it from a separate scarce pool; Cognism screens DNC in SE, NO and FI
(Denmark is its only Nordic gap); Vainu is neither the only per-country publisher nor reliably
€3,500 — its own counts disagree by 2.5x between its pages and its contact-data price is
effectively unpublished. Nothing outside the company may quote a Vainu figure.
