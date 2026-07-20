# Vainu API: benchmark from the June trial

2026-07-18. Internal. Measured from what actually landed in the platform, 51,857 records.
Not an estimate. Every number below is a count from production.

---

## THE HEADLINE

**552.**

That is how many Swedish mobile numbers to technical decision-makers arrived, out of 51,857 records
retrieved. One in ninety-four.

This is the finding flagged on 12 June ("mobilnummer till tekniska beslutsfattare är en bristvara").
It holds, and it is worse than "scarce" suggests.

---

## 1. VOLUME AND REACHABILITY

| | Count | Share |
|---|---|---|
| Records retrieved | 51,857 | |
| Companies matched | 8,153 | |
| With an email | 28,036 | 54% |
| With a phone | 14,723 | 28% |
| With both | 11,851 | 23% |
| **With NEITHER** | **20,949** | **40%** |

**Two records in five carry no way to reach the person.** For a product bought specifically for
contact data, that is the number that matters most.

## 2. PHONE TYPE

Of the 14,723 phone numbers:

| | Count |
|---|---|
| Swedish mobile | 7,155 |
| Swedish landline, regional | 4,334 |
| Swedish landline, Stockholm | 1,023 |
| Unclassified | 1,213 |
| Finland | 452 |
| Denmark | 301 |
| Norway mobile | 177 |
| Norway other | 68 |

Swedish mobiles are **13.8% of all records retrieved**. A landline in 2026 reaches a desk that is
often empty; the mobile is the number that converts a dial into a conversation.

## 3. ROLE MIX

| Bucket | Records | With a phone |
|---|---|---|
| IT and technical leaders | 7,822 | 1,620 |
| CEO, VD, founder | 10,292 | 2,140 |
| Finance | 2,548 | 920 |
| **Registry roles (auditor, deputy, board member)** | **1,061** | 35 |
| Other or unclassified | 30,134 | |

**58% of the file is "other or unclassified".** And 1,061 records are registry roles: an external
auditor is not a buyer of anything, and carries a phone number 3% of the time.

## 4. THE COHORT THAT WAS ACTUALLY BOUGHT FOR

Filtering to genuine IT and technical decision-makers:

| | Count |
|---|---|
| Technical decision-maker records | 7,175 |
| Companies they sit in | 1,581 |
| With an email | 3,590 (50%) |
| With a phone | 1,271 (18%) |
| **With a Swedish mobile** | **552 (7.7%)** |

### Against what was quoted

The 25 June summary scoped the target as **"4 731 svenska bolag med totalt ca 9 500 beslutsfattare
inom Ops/Tech (med antingen telefonnummer eller e-post)"**.

What arrived: **7,175 technical decision-makers across 1,581 companies**, of which roughly 4,000 to
4,800 carry either a phone or an email once overlap is accounted for.

**That is around half the reachable Ops/Tech decision-makers quoted, across a third of the companies.**

## 5. DUPLICATION

| | Count |
|---|---|
| Records | 51,857 |
| Distinct email addresses | 23,466 |
| Distinct phone numbers | 11,727 |

Of 28,036 emails, 4,570 are repeats (16%). Of 14,723 phones, 2,996 are repeats (20%). Billing is per
API call, so duplication is paid for twice.

## 6. GEOGRAPHIC COVERAGE

| Market | Companies in library | Covered |
|---|---|---|
| Sweden | 30,079 | 7,897 (26%) |
| Norway | 35,458 | **0** |
| Finland | 19,941 | **0** |

Sweden only, as scoped. Norway was offered at +10,000 SEK and is untested.

---

## WHAT IT IS WORTH

The quote is 80,000 SEK for 40,000 API calls over 12 months, 90,000 with Norway.

| Priced against | Unit cost |
|---|---|
| Records retrieved | ~1.5 SEK |
| Reachable records (email or phone) | ~2.6 SEK |
| Reachable technical decision-makers | **~18 SEK** |
| **Mobile to a technical decision-maker** | **~145 SEK** |

The first two numbers look cheap. The last one is what the product was bought for.

**The honest read: the data is good value as a company and email layer, and poor value as a way to
reach technical decision-makers by phone.** Which is precisely the use case it was proposed for.

---

## THE POSITION

1. **The base and tech-stack layers were already solved** and were correctly declined in June. Nothing
   in the trial changes that. The cloud read is now positively evidenced across 85,693 Nordic
   companies, including named private-estate detection, which is beyond what was on offer.
2. **Email coverage is the real product here.** 28,036 emails, 23,466 distinct, on Swedish companies
   that are otherwise cold. That has genuine value.
3. **Phone to technical decision-makers is not deliverable at the quoted level.** 552 mobiles is not
   a phone layer; it is a rounding error against a 15-meeting-per-block commitment.
4. **Norway and Finland are zero.** The +10,000 SEK Norway add-on is unevidenced and should be
   trialled before it is bought, not after.

## THE ASKS

In priority order.

**1. Explicit licence over data already retrieved.**
The single most important term, and it costs the vendor nothing. Any agreement must state that the
licence covers records retrieved during the evaluation period, on the same internal-enrichment terms
already agreed on 5 June ("data som berikar din plattform internt, används inte för återförsäljning
utan som ett data layer"). **Do not sign an agreement that is silent on this.** Silence leaves the
question open, and it is the question that matters.

**2. Price against the reachable cohort, not the record count.**
The value delivered is roughly half the quoted Ops/Tech reach. That is the basis for the discussion.

**3. Norway on trial before purchase.**
Zero Norwegian records arrived. The add-on is untested and should stay unpaid until it is not.

**4. Duplicate handling.**
20% of phone numbers and 16% of emails are repeats. Repeat retrievals of an unchanged record should
not consume quota.

## WHAT NOT TO DO

- Do not lead with the compliance angle. The position is strong on the merits; leading with the loose
  end converts a negotiation into an apology.
- Do not resell, sub-license or expose the data as a data product to tenants. The agreed use is
  internal enrichment, that boundary is clear and Forj is inside it. Stay inside it.
- Do not buy Norway on the strength of the Swedish result.
