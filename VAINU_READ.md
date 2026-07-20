# VAINU READ - triggers, nyckeltal, and the layer question (verified 2026-07-17)

Sources fetched live 2026-07-17. Subject articles: [triggers-i-saljprocessen](https://www.vainu.com/sv/blogg/triggers-i-saljprocessen/) (Ella Tyrväinen, jun 25 2020) and [sok-enkelt-efter-svensk-foretagsdata-och-nyckeltal](https://www.vainu.com/sv/blogg/sok-enkelt-efter-svensk-foretagsdata-och-nyckeltal) (Mikko Honkanen, Vainu co-founder, mar 13 2025). Product surface verified separately against Vainu's own developer docs, help centre, and pricing page.

---

## 1. THE ONE-PARAGRAPH ANSWER

Both articles are marketing, and both accidentally publish the case against their own author. The trigger article (2020, never updated) defines a trigger correctly as a *timing* signal - "Triggerhändelser indikerar när det är rätt tid och kontext för att ta kontakt med ett prospekt" - and then, in the only worked template it ships, instructs the reader to open the email with the trigger: **"Gratulera till den nya rollen."** That sentence would be rejected by the `TRIGGER_AS_MESSAGE` lint Alloy shipped on 2026-07-17. The nyckeltal article (2025, from the co-founder) maps you to the free Swedish registers, tells you årsredovisningar "kan kräva betalning", and does so five weeks after Bolagsverket and SCB made exactly that data free under värdefulla datamängder - the largest open-data event in Swedish B2B history, still unmentioned 16 months later. Together they say: Vainu's moat is the aggregation tax on public data, and the Swedish state repealed most of that tax in Feb-June 2025. **The single most useful thing to do about it is not a build - it is one email to Vainu's account team asking three contract questions:** does the licence include API entitlement, does it include the Signals endpoint, and which of the 71 signal tags are Sweden-live? That answer decides whether Vainu stays a contacts layer forever or becomes a cheap backfill for the ~15 news-derived tags Alloy will never build. Second-most useful, and it costs zero kronor: add **varsel** (Arbetsförmedlingen) as feeder #6 and pull **omsättning** from the Bolagsverket HVD API.

---

## 2. THE TRIGGER TENSION, RESOLVED

**Verdict: Alloy's shipped rule is CONFIRMED correct, and this evidence is stronger than expected - Vainu is not merely wrong, it is structurally incapable of being right.**

### What Vainu actually advocates - both sides, quoted

Vainu's *theory* section is Clay-compatible. Verbatim:

> "Triggerhändelser indikerar när det är rätt tid och kontext för att ta kontakt med ett prospekt."

> "**Hitta de bästa prospekten och prioritera rätt företag.** Du har kanske hundratals företag i ditt CRM, triggers hjälper dig att sortera ut de du bör prioritera just nu."

That middle line is functionally identical to Rob Cook's *"it does tell us where we should pay attention"*. Vainu had the right idea in the abstract.

Then the copy guidance drifts:

> "**Ha smartare konversationer.** Eftersom du vet mer om vad som händer hos företaget i fråga kan du enklare anpassa din säljpitch och uppfattas som mer relevant."

And then the only worked template removes all doubt. Section heading "Exempel på trigger: Förändring i högsta ledningen", under the sub-heading literally titled *sharpen your sales pitch*:

> "**Vässa din säljpitch**
> Gratulera till den nya rollen och lyft fram hur dina tjänster hjälper beslutsfattare under de första 90 dagarna."

**So: YES, Vainu advocates naming the trigger in outreach.** Explicitly, as the first instruction in the message section, on the *same trigger type* Clay used to argue the opposite.

### The head-to-head, cleanly

| | Trigger | Instruction |
|---|---|---|
| Clay (Rob Cook) | job change | "The trigger (the job change) does not become our message. But it does tell us where we should pay attention." |
| Vainu | job change (Change of CEO / ledningsgrupp) | "Gratulera till den nya rollen." |

Same trigger. Opposite instruction. **Alloy's `TRIGGER_AS_MESSAGE` lint in smith-slop.js would reject Vainu's own flagship template** - "congrats on the" is on the ban list. That is artifact-grade: Vainu's worked example fails Forj's shipped deterministic gate, with a URL and a verbatim quote behind it.

### Why Alloy still should not name the trigger, even though a category leader says to

Three reasons, in order of weight:

1. **Vainu's definition forces it.** Their canonical line, pulled out as a blockquote on the page: *"Vilken förändring som helst i en (företags-)datapunkt kan agera som en triggerhändelse och skapa en ny möjlighet för sälj- eller marknad."* Any change in any company data point. A change in a *public* data point is public by definition. And Vainu's docs admit the sources outright: **"The primary sources for these events are various news outlets, job postings, company websites, and other registries."** ([developers.vainu.com/docs/signal-and-event-data](https://developers.vainu.com/docs/signal-and-event-data)). Their entire 71-tag surface is therefore, by construction, the googleable set. Vainu is not being lazy with "Gratulera till den nya rollen" - **they have nothing ungoogleable to put in the email.**

2. **Vainu has a commercial incentive Forj does not.** The product IS the trigger. If the trigger never appears in the copy, the buyer cannot see what they paid for. Forj sells the funding lane, not the signal, so Forj has no reason to make the signal visible - and every reason to keep it internal as evidence.

3. **The article self-refutes.** It opens by citing that 50% of prospects find salespeople pushy and 3% trust them, then prescribes the single most recognisable move in the pushy-salesperson repertoire. Vainu diagnoses the disease and prescribes a symptom.

**Deepest read, and the line worth keeping:** Clay's law and Alloy's moat are the same fact seen from two sides. Clay says the message needs something the recipient cannot google. Alloy has exactly one ungoogleable asset - the AWS funding lane. Vainu has zero. **The rule is confirmed, not nuanced.** The only nuance worth carrying is that Vainu's *targeting* framing ("sortera ut de du bör prioritera just nu") is correct and stealable - see §4.1.

---

## 3. COVERAGE MATRIX

Two scoreboards, because Vainu publishes two different lists: the 14 types in the SE blog, and the real 71 signal tags in the developer docs.

### 3a. The blog taxonomy (14 types, verbatim SE)

Source sentence, verbatim: *"Händelser som triggar igång agerande från ditt håll kan till exempel vara relaterade till förändringar i företagets ledning, rekryteringar, expansion av verksamheten, fusioner eller förvärv, produktlanseringar, företagsflytt, uppsägningar eller avslutade finansieringsrundor. Vidare kan även förändringar i företagets teknologiska portfölj, nyregistrerade webbdomäner, nya årsredovisningar eller förändringar i antalet anställda öppna upp så att du ska kunna inleda nya diskussioner."*

| # | Vainu trigger (verbatim SE) | Alloy feeder today | Free/paid | Verdict |
|---|---|---|---|---|
| 1 | rekryteringar | JobTech (SE, nightly) + NAV (NO, nightly) | free | **Covered, and deeper.** Alloy holds ad text; Vainu restates it. No NO equivalent named by Vainu. |
| 2 | förändringar i företagets teknologiska portfölj | BuiltWith + cloud-detect + innovation-maturity band | paid (BuiltWith) | **Covered and beaten.** See §7. |
| 3 | förändringar i företagets ledning / ledningsgrupp | champion-watch (weekly, ~160→300+) | free | **Gap worth closing (partial).** Champion-watch is *inverted*: fires when someone **we already watch** moves. Blind to "new CTO arrived from a company we do not track". |
| 4 | avslutade finansieringsrundor | Vinnova (nightly) | free | **Gap worth closing.** Vinnova = public innovation grants. Vainu means closed VC/PE rounds. Different money, different buyer, different urgency. |
| 5 | nytt stort kontrakt | TED (weekly) | free | **Partial, acceptable.** TED = EU-threshold public procurement. Private wins invisible. Matters less for AWS-12; more for Quattro/property. |
| 6 | expansion av verksamheten | Explorium business events + JobTech geo as proxy | paid/free | **Partial.** Alloy ingests the proxy but does not *label* it as expansion. |
| 7 | fusioner eller förvärv | Explorium business events | paid | **Partial, unverified** as a labelled matched class. |
| 8 | förändringar i antalet anställda | **none** | free (SCB, pending) | **GAP - highest leverage.** Cannot read the *level*, let alone the delta. Also an ICP gate (Desk 10-200) and a funding-tier input. The pending SCB size-class email is the unblock. |
| 9 | uppsägningar | **none** | free (Arbetsförmedlingen varsel) | **GAP - close this one.** See §4.2. |
| 10 | produktlanseringar | **none** | needs news layer | **Ignore.** See §6. |
| 11 | företagsflytt / adressbyte | none (se_registry holds address, not diffed) | free | **Gap, near-zero cost.** A nightly address-delta SQL job, not a feeder. |
| 12 | nyregistrerade webbdomäner | none live (.se zone route scoped) | free | **Gap - but reframe.** Zone file is worth more as *domain-fill infrastructure* than as a trigger. Domain is the choke point (~4,700 usable of 52,318). Do not let Vainu's framing set this priority. |
| 13 | nya årsredovisningar | none live (Bolagsverket HVD free) | free | **Gap worth closing.** Unlocks #8's sibling: omsättning. |
| 14 | inbound triggers (marketing automation) | LinkedIn engagement pipeline Phase 1 | free | **Partial, idle** until a first authored post exists. |

**Blog-taxonomy score: 2 of 14 fully covered, 5 partial, 7 open.** That scoreboard is on Vainu's axes, and Vainu's axes are the commodity axes. See §7 before reading it as bad news.

### 3b. The real product surface (71 tags, developer docs)

Vainu publishes **71 signal tags** at [developers.vainu.com/docs/signal-and-event-data](https://developers.vainu.com/docs/signal-and-event-data). Compressed against Alloy:

| Vainu tag cluster | Alloy equivalent | Free/paid | Verdict |
|---|---|---|---|
| Open Positions | JobTech + NAV nightly | free | Covered, deeper |
| New Company Established | se_registry, +331,863 post-2019 formations | free | Covered (landed 2026-07-17) |
| Bankruptcy, Change of Status | se_registry, 22,367 konkurs/likvidation | free | Covered, **and inverted** - see §4.4 |
| Change of Company Name / Form, New Auxiliary Name | Bolagsverket | free | Covered |
| Change of CEO, Board, Key Person Appointment/Departure | Bolagsverket + champion-watch | free | Partial (the inversion, #3 above) |
| 17× "New \[X\] Technology" (Analytics, CRM, CMS, ATS, e-comm, Payment, **Server**, Social, Ads, Chat, MA, Reservation…) | BuiltWith Change API + cloud-detect | paid | Covered, **deeper** - "New Server Technology" is a web-server fingerprint, not cloud truth |
| Registered web-address / domain | .se zone file (scoped, not live) | free | Gap, reframed as infra |
| EU funding, Public Decision on Financing | Vinnova nightly | free | Partial |
| Government & Public Contract Notices, Won Contracts | TED weekly | free | Partial (EU-threshold only) |
| Funding, M&A, IPO, Partnerships | Explorium business events weekly | paid | Partial, unverified |
| **Layoffs** | **none** | free (varsel) | **GAP - the prize** |
| **Stock Trade / Financial (Equity) Arrangements** | **none** | free (FI insynsregistret API) | Gap, cheap |
| **New Trademark, Patents** | **none** | free (PRV/EUIPO/EPO OPS) | Gap, low value for ICP |
| New Financial Statement / Late Registration / Growth-Decline in Sales / Achieved 1MEUR Turnover | none (Bolagsverket HVD holds it) | free | **Gap worth closing** - omsättment is the missing Desk 10-200 input |
| Change in Credit Rating | none | paid (UC/Creditsafe/Bisnode) | **Ignore.** Not replicable free, ever. |
| ~15 news-derived (Awards, Partnerships, New Product/Service, Internationalization, Change in Strategy, Relocation, Investment-Machines/Software/Place-of-Business, Events, Minutes, Decline in Sales) | none | needs news corpus + licensing | **Ignore.** Vainu's only real moat. See §6. |
| Construction Project, Real Estate Transactions, Apartment sales notice, Permit, 6× Granted-License tags | none | 290 kommuner, one authority each | **Ignore.** Irrelevant to ICP. |

**71-tag verdict, plainly: ~30 of 71 are already Alloy's or one free feeder away. ~6 are free and uncollected (varsel is the prize). ~15 need a news layer Alloy does not have and should not build. ~20 are irrelevant to the ICP. Alloy can reach roughly 50 percent of Vainu's trigger surface at ~0 SEK, and 100 percent of the half that matters to an AWS funding motion.**

**Not one of the 71 is "runs on AWS". Not one is "eligible for MAP". Not one is "POC lane open". Not one is "program window closes in 40 days".**

---

## 4. WHAT TO STEAL

Ranked by value. Each is safe under the standing laws because none require scraping, none send anything, none hide that Smith is an AI.

### 1. "Bygg ett workflow för varje trigger" - the pre-committed response plan (HIGHEST VALUE)

Verbatim:
> "För varje triggerhändelse bör du ha en plan redo. På detta sätt säkerställer du att du kan agera på triggers så fort som möjligt, utan tvekan eller krångel."

Alloy has the detection half (signal_events → matcher → ACT NOW line). The **pre-committed workflow per event class** is the missing half: a JobTech hit on an Azure shop should deterministically route to POC-lane, not to Smith's general discretion.

**Why it is safe, and why it is better than Vainu's version:** it *hardens* the trigger-stays-internal contract by making the trigger a **router in code** rather than a **topic in prose**. This is the single highest-value steal because it turns the brief from *notification* into *instruction* and simultaneously reinforces the lint. No sends, no scraping, all internal.

### 2. Varsel as feeder #6 (HIGHEST VALUE, LOWEST COST)

Vainu sells "Layoffs" as a paid tag. In Sweden, **varsel om uppsägning** is filed with Arbetsförmedlingen and published free, monthly, by county and sector - the same data owner Alloy already ingests from via JobTech. New endpoint, not a new relationship.

**Why it matters more than it looks:** layoffs are a **cost-pressure signal**, and cost pressure is the best precondition for an AWS **MAP migration** conversation - migrate to cut run-rate. This is emphatically *not* a "sorry to hear about the layoffs" email (that fails the lint and is grotesque). It is a **lane selector**: varsel + rival-cloud truth + MAP eligibility routes the account to the cost lane instead of the growth lane. **The trigger stays internal; the funding lane goes in the email.** Textbook Clay-compliant, textbook licensed-source, textbook human-sends.

### 3. Omsättning via the Bolagsverket HVD API (HIGH VALUE, ZERO KRONOR)

Not a Vainu steal - a state-register pickup that Vainu's own article accidentally scoped for Jacob. The article's Step 4 (resultaträkning, balansräkning, vinstmarginal, skuldsättningsgrad, omsättning) is real, buyer-legible, and Alloy does not carry it. HVD scope explicitly includes "räkenskaper och årsredovisningar" ([Bolagsverket HVD](https://bolagsverket.se/apierochoppnadata/hamtaforetagsinformation/vardefulladatamangder.5294.html)). Omsättning is also the missing input to the Desk 10-200 tiered-partner bar while the SCB size-class email is pending. **This is the one genuine gap the nyckeltal article exposes, and the fix costs nothing.**

### 4. The suppression insight Vainu does NOT have (HIGH POSITIONING VALUE, ZERO BUILD)

Vainu names "uppsägningar" and "Bankruptcy" as **buy** triggers. Alloy's 22,367 konkurs/likvidation rows are the **anti-trigger** - a suppression list. **Vainu's taxonomy has no concept of a signal that means DO NOT CONTACT.** Every one of the 71 tags is a reason to reach out. That is a vendor tell: a change-detection product priced on volume has no incentive to model negative signals. Forj, priced on outcomes, has every incentive.

Falls straight out of their blind spot: **"We are the only ones who will tell you which accounts to skip."** Safe - it is an argument for sending *less*, which is the no-mass-email law stated as a benefit.

### 5. The 24-hour law (MEDIUM VALUE, CHEAP)

Verbatim:
> "Gör detta, helst inom 24 timmar, för att minska risken att förlora möjligheter till dina konkurrenter."

Unsourced folklore with good instincts, and Alloy's nightly crons already make it physically achievable. Adopt as an **internal freshness gate**: a signal_event older than N days should *decay* out of ACT NOW rather than sit there. **UNVERIFIED** whether Alloy ages out stale signal_events today - check before building, because a stale trigger surfaced as "ACT NOW" is worse than no trigger.

### 6. The six-step article shape (MEDIUM VALUE, CONTENT ONLY)

The nyckeltal piece's "Steg 1-6" walkthrough is a decent skeleton for a "Smith's Read" newsletter piece. Copy the *shape*, not the content. Alloy's version writes itself and is strictly true where theirs is stale:

> *"Svensk företagsdata blev gratis i juni 2025. Här är vad du faktiskt kan hämta, och vad du fortfarande inte kan se."*

Then land the punch: cloud truth and funding eligibility are the two fields no register and no data vendor sells. Safe - openly-AI byline, gated draft, human-posted.

### 7. The reverse-engineering method (PARKED, NOT YET USABLE)

Verbatim:
> "Börja med att titta närmare på dina befintliga kunder. Vilka förändringar inträffade i deras organisationer innan de blev kunder? Hitta ett samband mellan en nöjd kund och en specifik händelse... Validera alltid din magkänsla med data-drivna insikter."

Correct method, currently unusable - the customer set is too small (partner Smith usage was 0 ever until the ACTIVATION_30D push). Park it. **Note it as a reason the day-91 gate matters beyond revenue: it is the first moment Alloy can learn which triggers actually predict.**

---

## 5. WHAT TO REDEFINE

### A. Completeness → actionability

Their closing thesis, verbatim:
> "Ingen enskild databas innehåller allt, så genom att kombinera information från officiella register, branschrapporter och bokslut får du en mer komplett och korrekt bild."

That thesis rested on aggregation friction the Swedish state deleted in Feb-June 2025. More sources is not the win; the registers now hand out completeness for free, so **completeness is table stakes and no longer a product.**

**Forj-side sentence:** *"Registren berättar att företaget finns. De berättar inte vilket moln det kör på, eller vilket AWS-fönster som står öppet just nu."*

That reframe survives HVD. Theirs does not.

### B. "Triggers tell you when" → "eligibility tells you what to say"

Vainu's own theory line is correct and worth taking: *"Triggerhändelser indikerar när det är rätt tid och kontext"*. Take it, then invert the second half.

**Forj-side sentence:** *"Triggern säger var vi ska titta. Finansieringsläget säger vad vi ska säga - och det är det enda på listan som mottagaren inte kan googla."*

### C. "Buying signals" → "lane selectors"

Vainu's in-app vocabulary is "buying signals" grouped into 10 buckets (Financial Development, Technology, Negative changes, …). The word *signal* implies the signal is the deliverable. For Alloy, the signal is an input to a routing decision.

**Forj-side sentence (internal):** *A signal does not produce a message. It produces a lane: MAP-Assess (cost), POC (rival-cloud), MDF (co-marketing), or SKIP.*

### D. "Prospekteringstriggers" → the word Vainu never defines

The 2025 co-founder article names "prospekteringstriggers" in the product bullets and **never defines it, never gives one example.** The 2020 article defines it and never updates. This is the vocabulary vacuum Alloy can occupy in Swedish: define the term properly, in public, on Forj's terms, with the lane concept attached.

### E. The negative-signal category that has no Swedish name yet

Vainu has no word for it because their product has no slot for it. Coin one: **spärrsignal** / suppression signal. 22,367 rows of konkurs/likvidation is the first instance.

---

## 6. WHAT TO IGNORE

- **The HubSpot 50%/3% and Forrester 22% stats.** Named by vendor only, **not linked, not dated, not titled**, 2020-vintage at best, and about salesperson trust rather than trigger efficacy. Deployed as fear-setup before the pitch. **Do not repeat them as fact.** If a trust stat is needed for a deck, source a fresh one directly.
- **"Gratulera till den nya rollen."** Already banned in code. The article is now the *citation* for the ban, not a source of copy.
- **"Bara din fantasi sätter gränser."** The trigger article's own closer, and it is the whole problem in five words: unlimited trigger workflows, zero evidence any of them work, lead-gen form at the bottom. Volume-as-virtue is the exact opposite of the ONE-scoring-vocabulary discipline.
- **The taxonomy as a build backlog.** Do not chase 14/14 or 71/71. Matching a commodity checklist makes Alloy a worse Vainu. Close varsel + SCB headcount because they route to funding lanes, check Explorium against VC rounds before building, leave the rest open.
- **The news layer.** Vainu's only genuine moat (~15 tags), and it produces exactly the class of signal Alloy's lint bans from customer-facing text. **Buying it via the existing contract beats building it; ignoring it also beats building it.** Never build it.
- **Change in Credit Rating.** UC/Creditsafe/Bisnode licensed. Not replicable free, ever. Not a GTM field anyway.
- **Municipal/authority fragmentation.** Construction Project, Real Estate Transactions, Apartment sales notice, Permit, the 6 Granted-License tags (Taxi, Alcohol, Cargo Transport, Public Transport, Energy Certificate, social/health services). 290 kommuner, one authority each. Irrelevant to the ICP.
- **Vainu's scale numbers as a target:** "90M+ Company profiles", "8M+ Contacts in the Nordics", "300+ Data fields", "900+ Proprietary industry categories", "14K+ Web technologies" ([our-data](https://www.vainu.com/our-data/)). Alloy will never match the count and should never try.
- **The nyckeltal article's Skatteverket step, ägarstruktur step, and all pricing claims.** Ägarstruktur is due-diligence, not GTM, and genuinely paid. Skattehistorik is compliance. Pricing claims are stale.
- **The nyckeltal article's "prospekteringstriggers" bullet as competitive intel.** It carries zero information. The developer docs carry all of it.
- **Sections 1 and 4 of the nyckeltal article** (generic sales advice, ~85% of body text): "lyfta fram kostnadsbesparingar vid kontakt med en CFO eller betona innovation i dialog med en FoU-chef".

---

## 7. THE POSITIONING READ

### Where Vainu wins

- **News corpus + AI tagging at scale.** ~15 of 71 tags exist only because Vainu ingests "various news outlets" and classifies at volume. Real engineering, real licensing, a decade of spend. Alloy has none of it and should keep it that way.
- **Credit rating.** UC/Creditsafe/Bisnode licensed. Structurally closed to Alloy.
- **Contacts.** 8M+ Nordic contacts. This is exactly what Alloy already buys them for (46.5k SE decision-makers). **The current contract shape is correct.**
- **Count.** 90M+ profiles, 4 Nordic markets, registry partnerships. Uncatchable and irrelevant.
- **A permanent free tier that is sharper than expected.** [search.vainu.com](https://search.vainu.com/) - "No credit card necessary; no meetings required", *"not a free trial, so there's no specific end date"*, *"all the data points, including the contacts, for the first 20 companies relevant to each search"*, Excel export. **This is real competitive pressure on the forj.se "one free read".**

### Where Vainu loses

- **The state repealed the aggregation tax and Vainu's Swedish SEO has not noticed in public.** The co-founder's own 2025 article routes readers to Allabolag for årsredovisningar and calls them paid - published five weeks *after* Bolagsverket + SCB launched värdefulla datamängder (3 Feb 2025, free via API or files, no avtal, scope explicitly includes "räkenskaper och årsredovisningar"), and never updated through SCB's företagsregister going avgiftsfritt in June 2025.
- **Their own article documents that the Swedish base layer is public.** From Vainu's co-founder: *"När du har hittat en pålitlig datakälla kan du enkelt söka efter företaget genom att ange dess namn eller organisationsnummer i sökfältet på exempelvis Bolagsverket, Allabolag.se, SCB eller Skatteverket."* Useful leverage in a renegotiation.
- **It also gets a basic fact wrong.** FAQ heading, verbatim: *"Så här söker du i Bolagsverkets register (Allabolag)?"* with the answer *"Du kan söka i Bolagsverkets register via Allabolag.se."* Allabolag is a commercial reseller, not Bolagsverket's register. Vainu is telling Swedish sales readers a private product *is* the state register.
- **The API is a paid add-on.** [help.vainu.app/en/articles/120126-vainu-api](https://help.vainu.app/en/articles/120126-vainu-api), verbatim: **"Access to Vainu API is an additional feature and is not automatically included in Vainu licenses."** On top of a 12-month auto-renewing 3,500-4,200 EUR/year contract with 60-day notice. **The programmatic surface - the only surface an agent can consume - is not included.**
- **Trigger webhooks cannot be configured programmatically.** Verbatim: *"Workflow triggers are available as webhooks from the Vainu platform... **This feature has no API support yet.**"* A human must click them into existence in the UI. Polling the Get Signals endpoint is the real integration. Hard ceiling for an agent-native buyer.
- **Zero efficacy evidence, after a decade of selling triggers.** The trigger article contains no conversion lift, no response-rate, no win-rate, no timing evidence, no customer outcome numbers, no links to any. The only three real percentages are borrowed and are about how much buyers dislike salespeople. **If the category leader cannot show that triggers lift conversion, that is the strongest available argument that the trigger is not the value.**
- **No slot for the product.** Not one of 71 tags is cloud truth or funding eligibility. The nearest is "New Server Technology" - a web-server fingerprint. Vainu can tell you a company adopted a marketing automation tool. It cannot tell you the company runs on Azure and is therefore a POC-lane rival-cloud target. **AWS funding eligibility is not a structural gap Vainu can close: it is not a company *change* at all, so a change-detection vendor cannot model it. It is a *state* at the intersection of the company, the cloud, and AWS's program rules.**

### The one sentence (Jacob's own use, never on forj.se, never names a vendor publicly)

> **"They sell 71 flavours of what happened. We sell what it entitles you to - and ours is the only fact on the table your prospect cannot google."**

Swedish, for the room:

> **"Alla kan sälja signaler om vad som hänt. Vi är de enda som kan säga vad det ger rätt till - vilket moln, vilken AWS-lane, hur mycket, och hur länge fönstret står öppet."**

**Layer verdict:** Vainu is the **input layer**. Alloy is the **judgment layer**. They are not the same product, and the 71-tag list is the proof. Keep them for contacts, which their own article admits is the part that is not public ("privata databaser kan ge djupare affärsinsikter genom att erbjuda exempelvis kreditupplysningar, marknadsanalyser och kontaktuppgifter"). Do not compete on registry coverage - that layer is now a commodity and Vainu has not noticed. **Compete where Alloy is alone: cloud truth plus AWS funding eligibility.** And note the reciprocal risk: Vainu's free tier gives *data*; Alloy's free read must give *judgment*, or it loses on volume to a tool that never expires.

---

## 8. OPEN QUESTIONS / UNVERIFIED

**The contract questions (ask Vainu's account team - these are the deliverable's action item):**
1. Does the Forj/Novalo licence include **API entitlement at all**? Docs are explicit it is not automatic.
2. If yes, does it include the **Signals endpoint** specifically?
3. **Which of the 71 tags are Sweden-live?** Vainu does not publish a per-country matrix - by design. The only statement is *"Some tags are only available for countries where required data is available."* A paying customer can force the answer; a prospect cannot.
4. What is the **remaining quota**, and what is the renewal date minus 60 days? (12-month auto-renew, 60-day notice window.)

**Unverified inferences and gaps carried forward:**
- **The 71-tag list is very likely a union across all markets, with Sweden getting a subset.** HIGH CONFIDENCE INFERENCE, NOT VERIFIED. Tells: "Apartment sales notice", "Protest list", "Minutes", "Granted Taxi License", and "Achieved 1MEUR Turnover" (a EUR threshold in a SEK country) read as Finland-origin artifacts. Note the direction of the one published country caveat: *"Displaying specific vehicle data is restricted by law in Finland"* - Finland is the restricted market, and Finland is Vainu's home.
- **Free-tier country scope.** The get-started fetch returned *"Our complete Norwegian company database"* as the free scope. Likely a geo/locale-served variant, not a global statement. **UNVERIFIED for Sweden - worth a manual check from a Swedish IP before anyone cites it.**
- **Whether triggers are excluded from the free tier.** The page is silent. Given triggers are the paid product, almost certainly excluded. **UNVERIFIED.**
- **"Global: €12,000/year"** appears in a third-party review ([syncgtm.com/blog/vainu-review](https://syncgtm.com/blog/vainu-review)) and **is absent from Vainu's own pricing page.** The review is **not independent** - it is a competitor's comparison content with CTAs for their own product. **Do not cite the 12k.**
- **Whether Explorium's business-events feed already carries VC/PE funding rounds for Nordic companies.** The feeder is live and weekly. **Check before building anything for gap 3b/#4.**
- **Whether Explorium carries M&A as a labelled, matched event class in Alloy.** Not verified.
- **Whether Alloy currently ages out stale signal_events.** Not verified. Blocks the 24-hour-law steal.
- **Allabolag's current ownership** (Bisnode → Dun & Bradstreet lineage) is training memory, not a fetched citation. The claim that Allabolag ≠ Bolagsverket's register is independently sound; the ownership chain is **UNVERIFIED**.
- **The HubSpot and Forrester studies** were not traced. Cited by vendor name only, unlinked, likely 2018-2020 vintage. **Do not repeat as fact.**
- **Vainu's Swedish data sourcing** is never disclosed. No mention of licensing, purchase, crawling, or which registers feed the product. UC, Bisnode, D&B, Roaring, Creditsafe: none named anywhere. The inference that the Swedish base layer is the four public registers plus a commercial contacts/credit tier is **structural inference from the article's shape, not an admission. UNVERIFIED.**
- **No signal-object JSON schema is published** for the Get Signals endpoint. Filtering is thin: one documented parameter, `signals__datetime`, with `_gte`/`_gt`/`_lte`/`_lt`.
- **Vainu's SE trigger article is 6 years old** (jun 25, 2020) with no "uppdaterad" stamp. It may not reflect current product guidance - but it is what they still publish and still rank on, so it is what a Swedish buyer reads.
