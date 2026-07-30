# Finland headcount: what Tilastokeskus alone can give us

**Date:** 2026-07-30
**Question:** Asiakastieto is off the table (no agreement wanted). What can we get from Statistics
Finland (Tilastokeskus) only?

**Answer:** The exact thing Finland is missing, at about **EUR 2,336 a year**. Not a free route,
but a small, clean, contractual one that unblocks the whole Finnish shelf.

---

## The gap it closes

Finland is the only shelf with **zero headcount**:

| | FI |
| --- | --- |
| companies | 19,996 |
| with Y-tunnus | 19,969 |
| with a domain | 19,996 |
| with industry | 19,969 |
| with a founding date | 19,969 |
| **with headcount** | **0** |
| measured on AWS | 2,070 |
| young (<=6y) and on AWS | **786** |
| with a contact | 5,432 |

Headcount is not cosmetic here. It is a gate condition in two places:

1. **The ICP** is 10+ employees. With no headcount, no Finnish company can qualify.
2. **The Activate funding track** requires *known* employees under the greenfield ceiling. This is
   why the 786 young Finnish companies already measured on AWS score nothing, while Sweden and
   Denmark produce 144 Activate candidates between them.

Finland is not short of prospects. It is short of one column.

---

## What the law actually permits

The load-bearing fact is **Section 18 of the Statistics Act (280/2004)**, which names the business
register fields that are *public*. Tilastokeskus's own restatement of the list:

> yritys- ja yhteisotunnus, yrityksen ja yhteison nimi, toimiala, oikeudellinen muoto,
> omistajatyyppi, kielitunnus, kotikunta, osoite, **henkilokunnan maara**, liikevaihdon ja
> henkilokunnan suuruusluokka, ulkomaankaupan harjoittaminen, kuuluminen alv- ja
> ennakkoperintarekisteriin, alkutuottajuus, tyonantajana toimiminen, konsernisuhteet [...]

Two things matter in that list:

- **`henkilokunnan maara` is public.** The actual headcount number, not merely a size band. This is
  better than assumed. Earlier working notes in this repo said Finland could only ever yield a size
  class whose boundary happens to sit on 10 employees; that was too pessimistic.
- **Turnover is public only as a size class** (`liikevaihdon suuruusluokka`). There is no route to a
  Finnish revenue figure here. Do not plan around one.

Because these fields are public by statute, this is a purchase of delivery and licence, not an
application for access to confidential microdata. There is no ethics board, no research permit, and
no data-sharing agreement of the Asiakastieto kind.

---

## The price, computed for our exact order

From the published price list (`stat.fi` -> tietopoiminnat yritysrekisterista -> hinnasto):

| Component | Value | Source |
| --- | --- | --- |
| Base price, 15,000-19,999 units | EUR 3,650 | volume tier table |
| Identifier + **one** variable | x 0.40 | "kun tilataan pelkastaan tunnistetieto seka yksi lisatieto" |
| Use in commercial services | x 2.0 | "tietojen kaytto liiketoiminnan palveluissa" |
| Delivery once per year | x 1.0 | update-frequency table |
| 3-year commitment | -20% | long-term discount |
| **Net per year** | **EUR 2,336** | |
| VAT 25.5% (reclaimable) | EUR 596 | |
| Gross per year | EUR 2,932 | |

Without the 3-year commitment it is EUR 2,920/yr net.

**The 40% rule is the whole trick, and it is why the order must be disciplined:** we ask for
Y-tunnus plus `henkilostomaara` and *nothing else*. We already hold the name, domain, industry and
founding date for 19,969 of the 19,996. Adding a second variable forfeits the 40% rate and takes the
order to EUR 7,300/yr net. Buying what we already have would triple the bill.

Note the band boundary: at 19,996 units we sit 3 rows inside the 15,000-19,999 tier. If the Finnish
shelf grows past 20,000 before we order, the base steps to EUR 4,100 (about EUR 290/yr more). Minor,
but it argues for ordering before the next Finnish load rather than after.

---

## Why there is no free version

Checked and ruled out:

- **StatFin / PxWeb open data.** Genuinely open, genuinely free, and genuinely useless for this:
  it publishes company counts cross-tabulated by industry and size class. Aggregate only, never a
  named company. You cannot join a table of counts to a company.
- **Toimialoittainen yritystietopalvelu.** A paid subscription (EUR 900-1,050 per database per year),
  but it is also aggregate by sector and region. More money for the same wrong shape.
- **PRH / YTJ open data.** The free per-company Finnish register. Excellent for identity, registration
  and status, and it is presumably where our 19,969 Y-tunnus came from. It carries **no headcount**.

So the free Finnish sources give per-company identity without size, and the free Tilastokeskus
sources give size without identity. The paid extract is the only thing that puts the two in the same
row.

---

## What to confirm in the order email

To **yritystietopalvelut@stat.fi**. Four things are inference from published pricing rather than a
quote, and should be settled in writing before committing:

1. **Does `henkilostomaara` qualify for the 40% single-variable rate?** The price list's example of a
   single `lisatieto` is `toimiala`. The wording is "esimerkiksi", so it should be any one variable,
   but the discount is half the economics of this deal and is worth one sentence of confirmation.
2. **Licence terms for loading into our own database and showing the figure to our partner
   customers.** The 2.0x "use in commercial services" multiplier exists precisely for this, so the
   answer is very likely yes, but the general contract terms should be read before signing rather
   than after. Get the attribution requirement in writing at the same time.
3. **Refresh cadence.** Annual (factor 1.0) is priced above. Finnish headcount does not move fast
   enough to justify factor 3.0 for monthly.
4. **Coverage.** Confirm the extract returns a headcount for sole traders and micro units, or tell us
   which units come back null, so we know the true denominator before we build a gate on it.

Ask for the delivery as CSV keyed on Y-tunnus. It joins straight onto `companies.orgnr`, which is
populated on 19,969 of the 19,996 Finnish rows.

---

## Recommendation

Buy it. EUR 2,336/yr is inside a single month of one desk engagement, and it is the difference
between Finland being a 19,996-row shelf we cannot qualify and a working ICP market with 786
Activate candidates already measured on AWS and 5,432 companies already carrying a contact.

It is also the cheapest headcount in the Nordics by a wide margin. Sweden's equivalent came free
from SCB only after signing terms; Denmark's came free with the CVR bulk load. Finland is the one
country where the number has a price, and the price is small.
