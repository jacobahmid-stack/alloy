# GTM vendor review: buy nothing, build one thing

**Date:** 2026-07-30. **Internal.** Companion to `GTM_CLI_LANDSCAPE.md` (2026-07-21, the strategic
framing). This one is the buy/no-buy decision on six named vendors.

**Verdict: six vendors, six SKIPs.** Not one sells a capability Forj lacks. The recommended spend is
a week of engineering and about $100 of credits on an account we already pay for.

---

## The table

| Vendor | What it really is | Real price | Provenance | Verdict |
| --- | --- | --- | --- | --- |
| **Deepline** (Aero AI Labs, Delaware/NY) | Router over 108+ providers. Owns essentially no data; its one "native" DB has a 404 docs page. | BYOK $0 markup; managed credits $0.10; **Growth $395/mo**. Only 6 of 2,121 operations have a published price. Compute rate unpublished. | Apify LinkedIn + Sales Navigator scraping is a **headline documented play**. Zero European registries. | SKIP |
| **GetLeads** | One person in London reselling a 402M-contact DB via MCP, plus done-for-you LinkedIn follower scraping. | Free / $249 / $497 mo. $249 is conditional on posting about them on LinkedIn twice a month. | Explicitly LinkedIn-scraped. Upstream never named. | SKIP |
| **MoltSets** (GetEmails LLC dba Retention.com) | API-only enrichment from the RB2B pixel-identity company. Closed beta, search in alpha. | $0 / $27 / $97 / $997. "Unlimited" is capped at 5,000 records/week. | LinkedIn-keyed. **Contributory database**: uploading a CRM puts those contacts in a pool other customers query. | SKIP |
| **Lens** (lens.ly) | Prepaid-credit API, ~25 signal plays, plus an explicit passthrough proxy over someone else's scraper. | $0.03/credit. LinkedIn profile scrape 10 credits. | Docs state verbatim: "`meta` never includes upstream vendor names." Supplier concealment is shipped behaviour. | SKIP |
| **Oxygen** (OXYGEN GTM Inc., Delaware) | Router over 116 providers plus Postgres, CRM, workflow engine and a sequencer. ~10 weeks old. | $99 / $249 / $749 mo. Sends are 0 credits but **managed inbox 3,000 cr/mo, dedicated egress IP 15,000 cr/mo**. | Sells a **first-party** "Managed LinkedIn Scraper... no ban risk". Plus HeyReach, Bright Data, ContactOut, Wiza. | SKIP |
| **Clay CLI** | Free CLI+MCP wrapper over the Clay account we already have. No new data. | **No added cost.** Underlying Launch $185/mo. | Aggregator over 150+ partners; **you select providers**, which is the mitigation that matters. | **WATCH. Test one number.** |

**Two of the six (GetLeads, Lens) publish no legal entity, company number, address or jurisdiction
anywhere.** There is no counterparty to sign an Article 28 DPA with, no controller to name in our
Article 30 record, and no route to service an access or erasure request. That ends it before any
product assessment, including on the free tier.

**Two (MoltSets, Oxygen) have terms that forbid our business model.** MoltSets s.6 forbids access
"on behalf of any third-party entity or organization", which is a plain-language description of what
Alloy does for partners.

---

## A correction to our own story

Regulation (EU) 2023/138 made company registry basics a mandated free open dataset. That is *why*
257,773 Nordic rows cost zero, and it means **row counts are not a moat**. But the mandated attribute
list is name, status, registration date, address, legal form, registration number, NACE and filed
accounts. **No headcount, no domain, no contact, no technology signal.**

That is exactly why Finland's headcount still has a price and why the 132,179-domain cloud
measurement, the R4 guess-and-prove domain engine, the .com oracle and the headcount joins are not
registry outputs and are not free.

**The six reproducible fields are commodity. The joins are not. Stop pitching rows, keep the joins.**

If a partner ever compares us on rows-per-dollar we lose by 10x to 50x, and there is no answer:
Bright Data sells LinkedIn profile records from $0.0025. The line is that rows cost a quarter of a
cent, and what you pay for is which forty of them have AWS money attached and which of those you may
lawfully contact this week.

---

## What we actually lack, and whether the market fixes it

| Gap | Fixed by anything here? |
| --- | --- |
| Reachability to named humans | **Only maybe Clay.** Our measured position is FullEnrich 88% email but mobile 65% found / ~55% right-person. Clay publishes 83% European mobile usability and Finland 92%. Source is n=5,006 by The Kiln, which Clay itself calls a Solutions Partner, so not independent and the FI cell is probably 100-300 rows. **Testable for ~$100 on the account we hold.** |
| Sequencing + activity logging | **Nobody.** Oxygen's sequencer is a mailbox farm, which is what the no-mass-email rule exists to prevent. And the MDF activity log is the *evidence for the claim*, so it cannot live in a US vendor's Postgres. Build it (task #12). |
| CRM write-back into partners' systems | **Nobody.** Not one of the six touches it. |
| Company data, firmographics, technographics | All six are **substitutes for things we own and do better.** |

**Buy reachability, success-billed, and nothing else. Never buy company coverage again.**

---

## The one thing worth building: the lawful-channel field

One week, on data we already own, no vendor. Per company and per contact: `email_ok`, `call_ok`,
`reason`, `authority`. Computed from country plus the suppression registers we already hold (SCB
reklamspärr, DK reklamebeskyttelse, NO Reservasjonsregisteret) plus the ePrivacy Article 13(5)
national map.

| Country | Cold email to a named human | Cold call | Authority |
| --- | --- | --- | --- |
| Finland | Yes, opt-out | Yes | Act 917/2014 §202 |
| France | Yes, legitimate interest + 3 conditions | Yes | CNIL BtoB guidance |
| Sweden | Probably, with care (medium confidence) | Yes | MFL 2008:486 19§/21§ |
| Norway | **No.** Call first | Yes | Mfl §15 |
| Denmark | **No**, including info@ | **Yes**, ~60% of the shelf | Mfl §10 covers electronic post only |
| Germany | **Never** | **Yes**, presumed consent for market participants | UWG §7(2) no.1 |

**Two corrections to what we believed: Denmark and Germany are call-first markets, not dead markets.**
Germany is the largest AWS partner market in Europe and §7(2) explicitly sets a lower bar for
business-to-business calls. Do not ship the field with DE as a blanket no.

Wire it into Smith so it refuses to draft a Danish or German cold email and offers a call script
instead. No competitor ships this and a US vendor structurally cannot, because it means caring about
six national regimes worth 3% of their revenue. The ePrivacy Regulation was withdrawn in Feb 2025
and the Digital Omnibus data half is still contested, so **this fragmentation is durable for at
least two years.** It is a product feature, not a hack.

---

## The doctrine wording has to change

"Buy capture, never self-scrape" **protects nothing as written.** LinkedIn's User Agreement §8.2 has
a second clause: members must not copy, use, display or distribute information obtained from the
service "whether directly or through third parties (such as search tools or data aggregators or
brokers)". Buying the scrape does not launder it.

**Restate as: never scrape, and never buy LinkedIn-derived person data.**

Then ask every vendor in the waterfall, on the record, to name its person-data upstream. If the
answer is "public web data" or "professional networks", that is LinkedIn. People Data Labs names a
source for job postings ("company career pages") and no source at all for people, which tells you
they can name one when it is defensible.

---

## Worth stealing without buying

1. **Cost preflight plus a cap that pauses.** Deepline ships "estimated USD shown before any provider
   is called" on its free tier. Our $900 claude-proxy cap is a backstop, not a promise. Promote it.
   "It cannot spend or send without a human approving the scope" is a sales asset in Europe.
2. **A published one-pool unit price table.** Ours is stronger than Oxygen's because the registry
   rows genuinely cost zero: the forty companies cost nothing, the mobile number cost 99 öre. Copy
   the shape, never the competitor column (Oxygen asserts a "Clay 15-30x" markup with no method).
3. **BYOK at explicitly zero markup.** Let a partner bring their own FullEnrich key and show it in
   the log as a zero-cost line. Kills "you are marking up data I could buy myself" permanently.
4. **Free sizing before spend.** Every Alloy MCP tool should let Smith size a Nordic segment for free
   before committing. Cheapest possible demo of registry depth.
5. **"Every field names its registry."** Bolagsverket, Brønnøysund, CVR, PRH, Companies House,
   Sirene, not "proprietary data capture mechanisms". Plus the three suppression registers no
   competitor screens. A procurement advantage.
6. **"No result, no charge", in writing on the pricing page.** Our waterfall already behaves this way.

---

## Three claims to stop making

1. **Do not pitch "US vendors are illegal."** Latombe v Commission was dismissed 2025-09-03 and a
   DPF-certified US vendor is fine on transfers. It is under appeal (C-703/25 P) so it is not settled
   either. The argument that survives is procurement friction and provenance, not illegality.
   Overclaiming here is the exact failure mode of 2026-07-20.
2. **Retire the Cognism/KASPR attack line.** KASPR remediated and CNIL closed the file 2026-03-04.
3. **Do not self-score against the EU Cloud Sovereignty Framework.** It scores cloud *providers*. As
   an AWS customer we would sit at SEAL-1, below the SEAL-2 threshold, and publishing that documents
   that our infrastructure sits with a US hyperscaler. Unfixable given our AWS-partner identity.

---

## The legal exposure that is actually ours

**The Article 14 gap on the 77,028 contacts and the sole-trader registry rows.** This is the
highest-probability legal exposure Forj has, and it is self-inflicted rather than vendor-inflicted.

UODO fined Bisnode PLN 943,000 for taking data from *public registers* and failing Article 14
notification, and the Polish court dismissed the "disproportionate effort" defence on 2023-09-19.
More pointedly, CNIL closed its injunction against KASPR on 2026-03-04 only after KASPR **deleted its
entire database** and began notifying data subjects in every official EU language. The
English-only notice is specifically what CNIL penalised.

Before selling to any regulated buyer we need: a documented legitimate-interest assessment per
purpose, an Article 14 notice in the recipient's own language, a DSAR and erasure path that
propagates into the purchased contact layer, and retention limits.

---

## The three actions

1. **Build the lawful-channel field.** One week, owned data, no vendor. Ship DE and DK as
   call-yes / email-no, not as dead.
2. **Test Clay's European mobile claim.** 200 rows, Finland and Sweden, existing account, measured
   against our own contacts exactly the way FullEnrich was. About $50 to $100. The only number in
   this review that could move our reachability position.
3. **Close the Article 14 gap** before the first regulated partner's DPO asks.

Everything else: no.
