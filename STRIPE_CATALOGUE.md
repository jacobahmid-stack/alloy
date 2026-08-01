# Stripe catalogue for Forgeby

Everything needed to create the billing objects, written so the price card on forgeby.com and the
objects in Stripe cannot drift apart. Prepared 2026-08-01.

**The rule that makes this maintainable: the page and Stripe both derive from the table in §2.**
If a number changes, change it there, then change both. A price on a public page that Stripe does not
charge is the kind of error a customer finds first.

---

## 1. Why monthly leads

The card was originally annual-first. That was wrong for the buyer. A five-person AWS consultancy
has no basis to commit EUR 11,880 to software it has used for a week, and asking it to is asking for
trust that has not been earned yet.

So: **monthly is the headline, the discount is a reward for staying rather than a toll for
entering.** Three terms, same 29% annual saving in every band, so the ladder is legible at a glance
and nobody has to work out whether their band is the one being squeezed.

The free tier does the first stretch of trust-building; the monthly term does the second. Annual is
for a customer who has already decided.

---

## 2. The catalogue

All amounts in **EUR**, in **cents**, `tax_behavior: exclusive`. Lookup keys are stable and are what
application code should reference, never a `price_...` id pasted into a config file.

### Subscriptions

| Product | Term | Lookup key | Unit amount | Interval | Displayed as |
| --- | --- | --- | --- | --- | --- |
| **Band A** (Nordics, UKI) | Monthly | `band_a_monthly` | `139000` | `month` | EUR 1,390/mo |
| | Quarterly | `band_a_quarterly` | `357000` | `month`, `interval_count: 3` | EUR 1,190/mo, save 14% |
| | Annual | `band_a_annual` | `1188000` | `year` | EUR 990/mo, save 29% |
| **Band B** (France) | Monthly | `band_b_monthly` | `97000` | `month` | EUR 970/mo |
| | Quarterly | `band_b_quarterly` | `249000` | `month`, `interval_count: 3` | EUR 830/mo, save 14% |
| | Annual | `band_b_annual` | `828000` | `year` | EUR 690/mo, save 29% |

Quarterly is `interval: month, interval_count: 3`, **not** a "quarter" interval, because Stripe has
no quarterly interval. Getting this wrong silently bills monthly.

### Zone and country add-ons

Priced off the band list, per §4 of `FORGEBY_ZONE_PRICING.md`.

| Item | Lookup key | Rule |
| --- | --- | --- |
| Second zone | `zone_add_2` | 60% of that zone's list price, same term as the parent subscription |
| Third zone and beyond | `zone_add_3plus` | 40% of list, same term |
| Single country | `country_single` | 55% of the zone price, same term |
| All loaded zones | `europe_all` | Capped at EUR 2,450/mo equivalent in the chosen term |

The cap is a real cap: once a customer's zone add-ons exceed `europe_all`, move them to it rather
than letting the arithmetic run past it. A ladder that costs more than the everything-tier is a
pricing bug that customers experience as bad faith.

### Metered

| Item | Lookup key | Amount | Notes |
| --- | --- | --- | --- |
| Dossier beyond allowance | `dossier_overage` | `9000` (EUR 90) | Graduated, billed in arrears, published on the page |
| Contacts | `contacts_metered` | to set | The free tier's meter. Contacts are the real COGS. |

Included allowances: Band A **25 dossiers/month**, Band B **18/month**. On quarterly and annual, the
allowance is still monthly and does not roll over, which must be stated at checkout, not discovered.

---

## 3. Tax

- **Stripe Tax on**, `tax_behavior: exclusive` throughout. The page says "excludes VAT" and must
  continue to.
- **EU B2B reverse charge**: collect and validate the customer's VAT number
  (`customer_update.address`, `tax_id_collection.enabled: true`). A validated VAT number in another
  member state reverse-charges; a Swedish customer pays Swedish VAT.
- **UK** is not in the EU VAT area. UKI is in Band A, so a UK customer is a normal export of
  services. Confirm treatment before the first UK invoice.
- Invoices carry **Zmart Com West AB**, org. nr **559019-9161**, Gothenburg. Update when the rename
  to Forgeby AB completes; the org number does not change.

## 4. Checkout behaviour

- `payment_method_collection: always`, card plus SEPA direct debit. A Nordic B2B buyer expects SEPA
  and will churn at a card-only wall.
- **No trial on paid plans.** The free tier IS the trial, and it does not expire. A 14-day clock on
  top of a free tier is two conflicting promises.
- **Cancellation: `cancel_at_period_end`**, self-serve in the billing portal. The page says you keep
  access to the end of the month you paid for, so the code must not cancel immediately.
- **Proration on** for zone add-ons mid-term, so adding Norway in month two costs the remainder of
  the term, not a full one.
- Term changes take effect **at renewal**, not mid-term. Also stated on the page.

## 5. What has to be true before the first charge

1. **Stripe account, live mode, on the correct legal entity.** Zmart Com West AB, matching the
   invoice footer and the DPA.
2. **`STRIPE_SECRET_KEY` in SSM**, never in the repo, never in an edge function's source.
3. **Webhook endpoint** for `checkout.session.completed`, `customer.subscription.updated` and
   `customer.subscription.deleted`, so an entitlement in the app matches what was actually paid for.
   Until this exists, a cancellation in Stripe leaves the zone unlocked in the product.
4. **Entitlement model in the database.** Per [[forgeby-price-card]] and `src/lens.js`, entitlement
   is a **set of ISO country codes**, and zones are presets over that set. Stripe holds the
   subscription; the app holds the country set; the webhook is what keeps them equal.
5. **Reconcile the page and this file.** Both derive from §2.

## 6. Not built yet

There is no Stripe integration in the product today. This document is the specification, not a
record of something running. The price card is live and correct; the mechanism to charge it is not.

The smallest first slice: Band A and Band B, three terms each, Stripe Checkout in hosted mode, the
billing portal for cancellation, and one webhook that writes the entitlement country set. Zone
add-ons, the cap and the metered items can follow, because a customer can be moved by hand for the
first ten accounts and no one will notice.
