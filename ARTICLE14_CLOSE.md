# Article 14: verified approach, notice, and the Vainu letter

2026-08-01. Legal positions verified against the GDPR text, WP29/EDPB transparency guidance
(WP260 rev.01) and published DPA decisions. **This is not legal advice.** It is preparation for a
qualified Swedish data protection lawyer to review, with IMY as lead authority.


---

## Exactly when must Article 14 notice be given, and does giving it at first contact work for Forgeby?

*Confidence: high*

# Article 14 timing for the Forgeby contact library

**This is not legal advice.** It is a preparation memo for review by a qualified data protection lawyer (Swedish counsel, given Forj's establishment in Gothenburg and IMY as lead authority). Every recommendation below is a position to be tested, not a conclusion to be relied on.

---

## 1. What the text actually says

**Article 14(3) GDPR** — the controller shall provide the Article 14 information:

> "(a) within a reasonable period after obtaining the personal data, but at the latest within one month, having regard to the specific circumstances in which the personal data are processed;
> (b) if the personal data are to be used for communication with the data subject, at the latest at the time of the first communication to that data subject; or
> (c) if a disclosure to another recipient is envisaged, at the latest when the personal data are first disclosed."

**Article 14(5)(b)** — the obligation falls away where and insofar as:

> "the provision of such information proves impossible or would involve a disproportionate effort, in particular for processing for archiving purposes in the public interest, scientific or historical research purposes or statistical purposes, subject to the conditions and safeguards referred to in Article 89(1) or in so far as the obligation referred to in paragraph 1 of this Article is likely to render impossible or seriously impair the achievement of the objectives of that processing. In such cases the controller shall take appropriate measures to protect the data subject's rights and freedoms and legitimate interests, including making the information publicly available."

**Article 21(4)** — a separate, independent obligation:

> "At the latest at the time of the first communication with the data subject, the right referred to in paragraphs 1 and 2 shall be explicitly brought to the attention of the data subject and shall be presented clearly and separately from any other information."

## 2. The mechanic: (b) and (c) can only pull the deadline *earlier*, never later

This is the single most important structural point and it is often got wrong. The three limbs are **not** alternatives the controller may choose between. WP29 Guidelines on transparency (WP260 rev.01), **endorsed by the EDPB** and therefore the authoritative EEA-wide reading, sets it out at **paragraphs 27–28**:

- 14(3)(a) sets the **general** rule and the **outer limit**: one month.
- 14(3)(b) "**may be further curtailed**" — if first communication happens *before* the month expires, notice is due then, "notwithstanding that one month from the point of obtaining the data has not expired."
- Crucially: "**If the first communication with a data subject occurs more than one month after obtaining the personal data then Article 14.3(a) continues to apply**, so that the Article 14 information must be provided to the data subject at the latest within one month after it was obtained." Footnote 31 makes the same point structurally: 14(3)(b) "indicates a specification to the general position ... **but does not replace it**."
- Same logic for 14(3)(c) at para 27 and footnote 32.
- Para 28: "**in any case, the maximum time limit within which Article 14 information must be provided to a data subject is one month**", and fairness/accountability mean controllers should provide it "well in advance of the stipulated time limits."

## 3. Does notice-at-first-contact work for Forgeby?

**For contacted people: yes, but only if the first contact happens within one month of obtaining the record.** Beyond day 31 it is not a lawful discharge of Article 14 — it is a late notice on an already-breached obligation. The human-sends-individually model does not change this; Article 14 attaches to *obtaining*, not to sending. A one-at-a-time human send is excellent for ePrivacy/marketing-law and for legitimate-interest balancing, and it is a genuinely good vehicle for the notice, but it is not a timing answer.

Practical consequence: notice-at-first-contact is a **complete answer only for rows collected and worked inside a 30-day window** — i.e. just-in-time enrichment. It is not an answer for a standing 104,240-row library.

**There is a sharper problem with limb (c) that has not been surfaced.** WP260 footnote 33: "Article 4.9 defines 'recipient' and clarifies that a recipient to whom personal data are disclosed does not have to be a third party. Therefore, **a recipient may be a data controller, joint controller or processor**." If a contact row becomes visible inside a partner tenant, that is arguably a disclosure to a recipient and the 14(3)(c) clock fires *at that moment* — which for most of the library is far earlier than any first communication. Put this to counsel first; it materially changes the historic position, and it is the one trigger entirely within Forgeby's engineering control.

## 4. Contacts never contacted: the clock ran anyway

Yes. **The one-month clock in 14(3)(a) starts at collection regardless of whether contact is ever made.** There is no "dormant record" concept in Article 14. Of the 104,240 rows, the ones never contacted are the *worst* position, not the safest: the deadline expired unnoticed and the breach is continuing for as long as the data is processed. The Experian tribunal made exactly this point about anonymised model residue (see below, FTT para 186).

The missing `created_at` column does not help. It removes the ability to *prove* compliance, which under Article 5(2) accountability is itself the controller's problem, not the regulator's. For the 27,209 cvr-direktion rows with `collected_at`, the clock is computable and has plainly expired. For the 77,031 without it, the honest reconstruction is batch-level: "obtained on or before date X" from job logs, file timestamps and vendor delivery dates. That is sufficient to establish the clock expired, and it is defensible in a way that silence is not.

**Correct remedial action for data already held** (nothing is deleted, per the standing decision):

1. **Publish the Article 14 notice now.** This is mandatory in every scenario — it is the compensating measure required by 14(5)(b) and it is the floor even if every other argument succeeds. It must carry the Article 14(2)(f) source disclosure *per source* (vainu, cvr-direktion, serper-lead, linkedin-network, explorium, clay, pattern-derived-and-verified), the Article 6(1)(f) legitimate interests relied on, retention, and a working objection route.
2. **Hard-gate first contact in code**: Rune cannot hand a human a draft without the notice link and a clearly-separate Article 21(2) objection line. Article 21(4) is *not* subject to any Article 14(5) exemption — it bites at first communication independently, and it is the cheapest thing on this list.
3. **Ship `contacts.collected_at` + `source_url` + a new `notified_at`** (already open as task #20). From that point forward no row enters without a collection timestamp, and the 30-day clock is a computable, monitorable field. This converts an unbounded historic problem into a bounded one with a visible start date.
4. **Backfill `collected_at` at batch granularity** and record the method.
5. **Run a bounded retrospective notice pass on the highest-exposure cohorts with a deliverable email** — the 4,727 pattern-derived-and-verified rows and the 20,160 serper-lead rows first. These are the cohorts where *no upstream vendor ever notified anyone* and where Forgeby is unambiguously the originating controller. Send in the recipient's own language (KASPR was penalised specifically for notifying in English), from a real mailbox, throttled. A pure Article 14 notice is a legal obligation, not marketing, so it should not engage the Danish/Norwegian consent rules — but have counsel confirm that for DK specifically before sending there.
6. **Do not assume the vendor's notice discharges yours.** Article 14 is the controller's own duty. Bisnode's data was almost entirely from public registers and that did not save it.
7. **Write and keep the 14(5)(b) balancing memo** for the residue that has no email at all (~59,763 rows). And build in the re-test: WP260 para 59 says that when the factors causing impossibility cease, "the data controller should **immediately**" provide the information. So the moment the waterfall derives an email for a previously unreachable contact, the impossibility argument evaporates and notice must go with it. Wire that as a trigger, not a policy.

**Note on 14(5)(c):** the instinct with register-sourced data (cvr-direktion, Bolagsverket, Companies House) is to reach for "expressly laid down by law". WP260 para 66 closes it: the law "must **directly address the data controller**" and the obtaining "should be mandatory upon the data controller." Danish and Swedish law mandate the *register's* publication, not Forgeby's collection. **14(5)(c) is not available here.**

## 5. Article 14(5)(b): the real limits

WP260 **para 57**: the Article 14 exceptions "should, as a general rule, be **interpreted and applied narrowly**."

**Para 61** is the killer for a commercial library: given the emphasis in Recital 62 and 14(5)(b) on archiving, research and statistical purposes, "this exception **should not be routinely relied upon by data controllers who are not processing personal data for** the purposes of archiving in the public interest, for scientific or historical research purposes or statistical purposes." Forgeby is a commercial GTM database. It sits outside the paradigm case.

**Para 62**: the impossibility or disproportionate effort "must be **directly connected to the fact that the personal data was obtained other than from the data subject**" — not to cost, not to volume, not to commercial inconvenience.

**Para 64**: a documented **balancing exercise** — effort for the controller against impact on the data subject of not knowing — is required, and "One appropriate measure, as specified in Article 14.5(b), that controllers **must always take is to make the information publicly available**" (website, advertisement, posters). Other measures may include a DPIA, pseudonymisation, minimisation and shortened retention.

**Para 65**: the "seriously impair the objectives" branch requires showing that giving notice "would **nullify** the objectives of the processing." Prospecting is not nullified by telling prospects you hold their data. That branch is unavailable to Forgeby.

Recital 62 does list *number of data subjects* and *age of the data* as relevant — but WP260 para 63 frames them as contributors within the archiving/research paradigm, and the enforcement record is uniformly against reading volume as an excuse:

- **Poland, UODO v Bisnode, ZSPR.421.3.2018 (15 March 2019, ~PLN 943,000):** 7.5m people from public registers, ~6.5m with only a postal address; a PLN/EUR ~9m notification cost was rejected. The authority held the cost of notifying is part of the cost of the data, and declining to pay it was a commercial choice. On appeal the Warsaw administrative court disturbed how the affected population was counted but **upheld the substantive Article 14 duty for active data subjects**.
- **France, CNIL v KASPR, Délibération SAN-2024-020 (5 December 2024, €240,000):** a 160m-contact database built from LinkedIn and other sources. KASPR *did* eventually notify by email — four years late, and in English. Both the lateness and the language were held to breach Articles 12 and 14. This is the closest factual analogue to any LinkedIn-derived cohort.
- **UK, Information Commissioner v Experian Ltd [2024] UKUT 105 (AAC)**, upholding the First-tier Tribunal. This one cuts both ways and is worth reading closely. FTT **para 178**: "The GDPR is clearly written so that the article 14 privacy notice requirement cannot be easily avoided and so that '**disproportionate effort' is to be construed narrowly** ... the fact that notifying the 5.3 million data subjects would involve a considerable business expense does not mean that it would be a disproportionate effort ... That is a business expense which **should have been incurred over time as a matter of routine compliance**." Experian **lost** on the substance. But the FTT then declined, as a matter of *remedial discretion*, to order retrospective notification (paras 184–185), citing the likely "out of the blue" reaction of recipients, while stressing it expected Experian to comply for future collections — and warning at **para 186** that continued processing of data that should have had a notice "will continue to be non-compliant."

That is the honest shape of the best available outcome for Forgeby: **a documented past breach that is remediated prospectively and not cured by a mass retrospective mailing.** It is not an exemption. Note also that Experian is a UK post-Brexit decision, the remedial discretion turned on s.150(2) DPA 2018 which has no EU equivalent, and no Nordic DPA is bound by it.

**Gap worth naming:** I found no published IMY, Datatilsynet (DK) or Datatilsynet (NO) decision squarely on Article 14 timing for B2B prospecting databases. The Danish DPA's June 2023 direct-marketing guidance addresses Article 13(3)/14(4) re-purposing and profiling but not this timing question. The governing authorities here are the Regulation, WP260 as endorsed by the EDPB, and the Polish/French/UK cases. Counsel should not be told there is Nordic precedent, because there is not.

## 6. Name + title + LinkedIn URL vs. a personal email address

**On whether Article 14 applies: no difference.** Both are personal data about an identified natural person. The GDPR has no B2B carve-out — that distinction lives in ePrivacy and national marketing law, not here. A job title and a profile URL identify a person as surely as an email does.

**On three practical axes it matters a great deal:**

1. **Reachability, and therefore which exemption is even arguable.** "Proves impossible" is, per WP260 para 59, "an all or nothing situation ... there are no degrees of impossibility", and in practice "there will be very few situations" where it is made out. A record with no contact route at all has the strongest (still weak) impossibility case — and even then the public-notice measure is mandatory. A record with a LinkedIn URL is *not* obviously unreachable; that a platform's terms make messaging awkward is a contractual constraint, not data-protection impossibility, and KASPR shows LinkedIn-derived data attracts no leniency. A record with a verified email has **no** impossibility argument whatsoever — 14(3)(b) is squarely available and the notice costs a fraction of a cent.
2. **Severity in the 14(5)(b) balancing.** Name/title/profile-URL from an openly professional context is lower-impact than an address enabling direct intrusion into an inbox, so the balance tilts marginally. But per Experian FTT 178, that tilt is about *impact*, never about cost or volume — and it does not survive the fact that these records are the input to outreach.
3. **The 2,468 `linkedin-network` rows have a bigger problem than Article 14.** These are the founder's own connections, repurposed into a commercial database sold through to partner tenants. That is a purpose change engaging Article 6(4) and Article 5(1)(b), and a Recital 47 reasonable-expectations problem: those people connected with *a person*, not with a data product. Article 14(5)(a) ("already has the information") does not help — WP260 para 56 construes the equivalent Article 13(4) exception narrowly and requires the controller to demonstrate *what* the subject knows, *how* and *when*. Recommendation: segregate this cohort, exclude it from partner-tenant disclosure pending counsel's view, and give it its own notice treatment. It is 2.4% of the library and close to 100% of the reputational downside.

**One legitimate way to shrink the population honestly:** rows whose only identifier is a generic role address (info@, sales@) with no named natural person are arguably not personal data at all and fall outside Article 14. Segment and count them before scoping any notice campaign.

## 7. Recommendation

Where the law leaves a genuine choice — mass retrospective notice, versus prospective compliance plus public notice plus a documented 14(5)(b) memo — **take the hybrid, and be candid in the memo that it is remediation of a past gap rather than an exemption.**

- Publish the notice **now** (unconditional).
- Gate first contact on notice + Article 21(4) separation **in code** (unconditional, cheap, immediate).
- Ship `collected_at` / `source_url` / `notified_at` and make the 30-day clock a monitored field.
- Retrospectively notify the self-originated cohorts with deliverable emails (~4,727 + 20,160), throttled, in-language.
- Keep a written 14(5)(b) balancing memo, with public notice as the compensating measure, for the no-email residue — plus the automatic trigger that re-notifies the moment an email is derived.
- Segregate the LinkedIn-network cohort.
- Put the 14(3)(c) partner-tenant-disclosure question to counsel **first**, because it is the trigger most likely to have already fired across the whole library and the one most easily fixed going forward.

The strongest defensible public claim is not "we are exempt." It is: *we know exactly where every record came from, we publish that, we tell every person we contact at the moment we contact them, and we notify the people we originated ourselves.* That is a claim Forgeby can make true within a sprint, and it is closer to compliance than most of the market.

**Sources**

- [GDPR Regulation (EU) 2016/679, consolidated text - Articles 13, 14, 21, Recitals 61-62 (primary source, EUR-Lex)](https://eur-lex.europa.eu/eli/reg/2016/679/oj)
- [Article 14 GDPR full text of paragraphs 3 and 5 as transcribed (verbatim wording verified here)](https://www.privacy-regulation.eu/en/article-14-information-to-be-provided-where-personal-data-have-not-been-obtained-from-the-data-subject-GDPR.htm)
- [Article 21 GDPR paragraphs 2-5, including the 21(4) first-communication objection-notice duty](https://www.privacy-regulation.eu/en/article-21-right-to-object-GDPR.htm)
- [WP29 Guidelines on transparency under Regulation 2016/679, WP260 rev.01 - endorsed by the EDPB. Paras 26-28 (timing), 56-57 (narrow construction), 58-65 (impossible / disproportionate effort / serious impairment), footnotes 31-33. Full text extracted and read.](https://www.cnil.fr/sites/cnil/files/atoms/files/wp260_enpdf_transparency.pdf)
- [EDPB endorsement of the WP29 transparency guidelines (confirms WP260 rev.01 is current EEA-wide guidance)](https://www.edpb.europa.eu/our-work-tools/general-guidance/guidelines-recommendations-best-practices_en)
- [CNIL, KASPR, Deliberation SAN-2024-020 of 5 December 2024, EUR 240,000 - Articles 12 and 14 breaches for notifying four years late and in English](https://www.cnil.fr/en/data-scraping-kaspr-fined-eu240000)
- [EDPB news item on the CNIL KASPR fine (independent confirmation of the decision and amount)](https://www.edpb.europa.eu/news/news/2025/data-scraping-french-supervisory-authority-fined-kaspr-eu240-000_en)
- [Information Commissioner v Experian Ltd [2024] UKUT 105 (AAC), 23 April 2024 - full judgment PDF; FTT paras 172-186 quoted (disproportionate effort construed narrowly; cost is routine compliance expense; retrospective notification not ordered as a remedy; continued processing without notice remains non-compliant). UK post-Brexit, persuasive only.](https://assets.publishing.service.gov.uk/media/662fa61624347c67e8e3cba0/UA_2023_000512_GIA.pdf)
- [Information Commissioner v Experian Ltd [2024] UKUT 105 (AAC) on the National Archives caselaw service](https://caselaw.nationalarchives.gov.uk/ukut/aac/2024/105)
- [UODO (Poland) v Bisnode, decision ZSPR.421.3.2018, 15 March 2019 - Article 14 breach for public-register data; cost of notification rejected as disproportionate effort. NOTE: read via GDPRhub summary and secondary reporting, not from the Polish original.](https://gdprhub.eu/index.php?title=UODO_-_ZSPR.421.3.2018)
- [Datatilsynet (Denmark), Vejledning om direkte markedsforing, June 2023 - full PDF read; covers Art 13(3)/14(4) re-purposing and profiling, but does NOT address Art 14(3) timing for prospecting databases](https://www.datatilsynet.dk/Media/638237218449834564/Vejledning%20om%20direkte%20markedsf%C3%B8ring.pdf)
- [IMY (Sweden), guidance on the data subject's right to information (general Art 13/14 framing; no decision found on Art 14 timing for B2B prospecting)](https://www.imy.se/privatperson/dataskydd/dina-rattigheter/ratt-till-information/)
- [Datatilsynet (Norway), guidance on information and transparency obligations](https://www.datatilsynet.no/rettigheter-og-plikter/virksomhetenes-plikter/informasjon-og-apenhet/)

> Caveat: NOT LEGAL ADVICE - this is preparation for a qualified data protection lawyer (Swedish counsel, IMY as lead authority) to review. Confidence is high on the black-letter Article 14(3) timing mechanic and on the narrowness of Article 14(5)(b): both are directly sourced from the Regulation and from WP260 rev.01 as endorsed by the EDPB, and the wording was transcribed from the text rather than recalled. Confidence is MEDIUM on three things that counsel must resolve. (1) The Article 14(3)(c) partner-tenant reading: WP260 footnote 33 states a recipient may be a controller, joint controller OR processor, which on its face means exposing a contact row inside a partner tenant fires the clock. That reading is textually supported but I found no decision applying it to a SaaS multi-tenant surface, and it is the single most consequential open point. (2) The remedial recommendation (prospective compliance + public notice + documented 14(5)(b) memo, rather than mass retrospective mailing) is modelled on the Experian tribunals - but Experian is a UK post-Brexit decision, the refusal to order retrospective notice turned on remedial discretion under s.150(2) DPA 2018 which has no EU equivalent, and Experian still LOST on the substance. No Nordic DPA is bound by it. (3) Whether a pure Article 14 notice sent by email into Denmark or Norway is caught by local unsolicited-electronic-marketing rules: I believe not (it is a legal obligation, not marketing) but this was not verified against Danish markedsforingsloven or Norwegian equivalents and must be confirmed before any DK/NO send. Two source-quality flags: the UODO Bisnode decision was read via GDPRhub and secondary reporting, not the Polish original, so the fine figure and the appeal outcome should be re-verified from the primary decision before either is repeated externally. And I searched for but did NOT find any published IMY, Datatilsynet DK or Datatilsynet NO decision squarely on Article 14(3) timing for B2B prospecting databases - counsel should not be told Nordic precedent exists. Finally, all figures about Forgeby's data (104,240 contacts, 77,031 without collected_at, 44,477 with email, 4,727 self-derived, 2,468 linkedin-network) are taken from the brief as given and were not independently verified against the database.

---

## What is the correct lawful basis for Forgeby's contact database, how is a legitimate-interests assessment documented, how does Article 21(2) drive suppression-list design, and what do ePrivacy rules in SE/DK/NO/FI and the published DPA decisions actually require?

*Confidence: medium*

# Lawful basis and LIA for the Forgeby contact store

**THIS IS NOT LEGAL ADVICE.** It is preparation for a qualified data protection lawyer (Swedish-qualified, with Nordic reach) to review, correct and sign off. Nothing here should be relied on as a legal opinion, published as a compliance claim, or shown to a partner DPO as a finished position.

---

## 0. Two corrections before anything else

**0.1 The "Swedish IMY/Bisnode decision" does not exist.** The Bisnode decision you are thinking of is **Polish**: the President of the UODO, decision **ZSPR.440.40.2018 of 15 March 2019**, fine PLN 943,470 (~EUR 220,000), against Bisnode Polska for breach of Article 14 in respect of data taken from the public business register (CEIDG). The Warsaw Voivodeship Administrative Court partly annulled it; the **Supreme Administrative Court (NSA) dismissed Bisnode's cassation appeal in 2023**, confirming that the information duty was owed to the sole traders whose data had been taken from the public register. There is a **second, separate** Bisnode case that is genuinely relevant: the **Belgian APD fined Black Tiger Belgium (formerly Bisnode Belgium) EUR 174,640 in January 2024** on the same theme. Do not cite "IMY/Bisnode" to a lawyer or a partner; it will not survive the first check, and this repo's own verification discipline note exists because of exactly this failure mode.

**0.2 The lawful basis question and the channel question are two different questions.** Article 6 GDPR tells you whether you may *hold and process* the record. ePrivacy Article 13, as implemented nationally, tells you whether you may *send an email to it*. They are not substitutes, and the second can veto the first. EDPB Guidelines 1/2024, para. 114 and footnote 143, are explicit: where national law implementing ePrivacy Art. 13 does not permit the message, "there would be no legitimate interest that the controller could invoke in order to justify the collection of personal data for sending such messages." So a valid LIA does not buy you Danish email, and Danish law does not invalidate the library.

---

## 1. Article 6(1)(f) is the correct basis for holding the library. Consent is not.

Consent (Art. 6(1)(a)) is the wrong basis and would be worse, not better: it cannot be validly obtained retrospectively for 104,240 people, and asking for it by email is itself the regulated act in DK and NO. Contract (6(1)(b)) does not apply. **Article 6(1)(f)** is the only realistic basis, and it is the basis the regulators expect for this activity:

- **Recital 47 GDPR**: "The processing of personal data for direct marketing purposes may be regarded as carried out for a legitimate interest."
- **CJEU C-621/22 *KNLTB* (4 October 2024)**: a purely commercial interest can be a legitimate interest; it need not be enshrined in law. This closed off the Dutch DPA's stricter reading and is the case a lawyer will anchor on.
- **CJEU C-252/21 *Meta v Bundeskartellamt* (4 July 2023)**, paras. 106, 109, 112, 116-121: sets the necessity and balancing structure the EDPB then codified.
- **Danish Datatilsynet's *Vejledning om direkte markedsføring* (June 2023)**, Example 3, is close to on-point for Forgeby: an IT company pulls sole traders from the CVR register in order to phone them and sell IT security solutions. Datatilsynet's view is that this collection **can** sit inside Art. 6(1)(f), because a limited quantity of data is collected for a concrete and delimited purpose and the data subjects are clearly told they can object at any time (Art. 21(4)).

But Recital 47 is not a free pass. **EDPB Guidelines 1/2024, para. 110**: the fact that Recital 47 mentions direct marketing "does not mean that direct marketing always constitutes a legitimate interest, and that it is automatically possible to rely on Article 6(1)(f)". Para. 112: it fails if the marketing is unlawful, or if data subjects cannot reasonably expect their data to be used this way.

### The three-part test (EDPB Guidelines 1/2024, paras. 12-13, 32, 55-57)

The three conditions are **cumulative**. The assessment must be made **before** processing starts, with the DPO involved if one is designated, and **must be documented** under the accountability principle in Art. 5(2).

**Step 1 - Purpose.** Identify a legitimate interest that is (i) lawful, (ii) precisely articulated, and (iii) present and real, not speculative or future. "Growing the business" fails. "Enabling AWS Partner Network members established in the EEA to identify, and have a named human contact, those of their prospective business customers whose measured public cloud footprint indicates eligibility for a specific AWS-funded migration or proof-of-concept programme" passes, because it is specific and it is checkable. Third-party interests count too, which matters here: the interest is partly Forgeby's and partly its **partners'** (Art. 6(1)(f) expressly covers "a third party").

**Step 2 - Necessity.** Not "useful", not "efficient". The test (EDPB para. 119, following *Meta* para. 121) is whether the interest "cannot reasonably be achieved just as effectively by other means less restrictive" of Articles 7 and 8 of the Charter. This is where each *field* has to justify itself, not the database as a whole. Name, employer, job title and business email at a company whose cloud estate you have measured: defensible. Mobile phone numbers, personal email addresses, LinkedIn profile URLs, enrichment beyond the buying role: each needs its own necessity sentence or it should not be in the record. Data minimisation (Art. 5(1)(c)) does the killing here, not the balancing test.

**Step 3 - Balancing.** EDPB para. 32 requires you to identify and describe four things:
1. the data subjects' interests, fundamental rights and freedoms;
2. the **impact** of the processing - the nature of the data, the context of the processing, and any further consequences;
3. the **reasonable expectations** of the data subject; and
4. the final balance, including **further mitigating measures**.

Two traps in the balancing step:

- **Para. 34 and 57: measures you are already legally obliged to take do not count as mitigation.** Having a privacy notice, honouring access requests, encrypting the database, minimising data - none of these can be put on the scale. Only measures that go *beyond* GDPR obligations count. Forgeby has real ones available and should claim them explicitly: no bulk send, one message at a time from a human's own mailbox, refusal to hand over the ~14% of mobile numbers that failed right-person verification, no personal-life data, no cross-site tracking, no profiling of individuals (the profiling is of *companies*).
- **Para. 120: intrusiveness is the lever.** The balancing "would hardly yield positive results for intrusive profiling and tracking practices". Forgeby's model is at the benign end of that spectrum and the LIA should say so in those words: a single, individually written, human-sent message about the recipient's own employer's cloud estate is about as far from cross-device tracking as commercial contact gets. This is the strongest paragraph Forgeby has and it should be quoted in the LIA.

---

## 2. What a defensible written LIA must contain

A regulator or a partner DPO asking for "your LIA" wants a dated, versioned, signed document, not a paragraph in a privacy policy. Produce it as `LIA_CONTACT_LIBRARY_v1.md`, one per **processing purpose** (holding the library is one purpose; drafting outreach is arguably a second; enriching contact details is a third - do not try to cover all three in one balancing test). Structure:

**A. Identification**
1. Controller identity (Forj AB, Gothenburg), and an explicit statement of the controller/processor split for partner-side processing. This matters more than it looks: if partners send from their own mailboxes using Forgeby-supplied contacts, you are probably **joint controllers** for that step (Art. 26), and you need an Art. 26 arrangement, not just a DPA.
2. Document version, date, author, reviewer, review date, and who signed it off.
3. Whether a DPO exists; if not, why not (Art. 37 assessment - with 104,240 records and "regular and systematic monitoring" arguably in play, get this looked at, it is not obvious that Art. 37(1)(b) is unmet).

**B. The processing described precisely**
4. Categories of data subject and record counts, **broken out by source and by country** (this is the table that makes the document credible: vainu 49,768 / cvr-direktion 27,209 / serper-lead 20,160 / linkedin-network 2,468 / explorium 683 / clay 669 / unlabelled ~3,300).
5. Categories of data, **field by field**, with a necessity sentence per field.
6. The four processing operations, separately: (i) acquisition, (ii) storage and enrichment, (iii) selection for outreach, (iv) generation of an outreach draft.
7. Retention rule and the trigger for review. Note honestly that there is **no `created_at` column on `contacts`** and that for 77,031 rows collection date was never recorded, so retention currently cannot be evidenced. A lawyer will flag this immediately; better that the document flags it first. (KASPR was fined in part under Art. 5(1)(e) for exactly this class of failure - indefinite renewal of retention.)

**C. Step 1 - Purpose test**
8. The interest, stated in one specific sentence.
9. Whose interest it is (Forgeby's, the partner's, or both).
10. Why it is lawful, articulated and present.

**D. Step 2 - Necessity test**
11. Why the purpose cannot reasonably be achieved as effectively by less intrusive means. Name the alternatives you rejected and why: inbound marketing only, company-level generic addresses only, buying opt-in lists, advertising.
12. Volume justification: why 104,240 and not 5,000.

**E. Step 3 - Balancing test**
13. Data subject interests and rights engaged.
14. Impact: nature of data (B2B professional, no special categories under Art. 9 - state this and state that you have checked), context, and further consequences.
15. **Reasonable expectations**, assessed *per source cohort*. This is the section that will be read hardest. See §3 below.
16. Mitigating measures **that go beyond legal obligations**, itemised.
17. The conclusion, and any cohort or country where the conclusion is *negative* and processing is therefore restricted.

**F. Rights and controls**
18. How Arts. 13/14 are satisfied, per cohort, with the mechanism and the timing.
19. How Art. 21(2) objections are captured and enforced (see §5).
20. How Art. 15(1)(g) source disclosure is answered for each cohort - including honestly, for the 3,300 unlabelled rows, that it cannot be.
21. DPIA screening under Art. 35: record the outcome. Given scale plus data obtained from third parties plus matching/combining of datasets, several EDPB criteria are arguably met. If you conclude no DPIA is needed, write down why; if two or more criteria are met, do the DPIA.

**G. Sign-off and review**
22. Named signatory, date, next review date, and a change log.

Keep a **register of source agreements** alongside it: for each vendor, the contract, the vendor's stated lawful basis, the vendor's stated upstream source, and the vendor's Art. 14 warranty. The Norwegian Datatilsynet's published position on bought marketing addresses is that **the buyer has an independent duty** to establish that the data was lawfully obtained; you cannot inherit the vendor's compliance by contract.

---

## 3. LinkedIn connections vs vendor-sourced: the analysis genuinely differs

It differs on **reasonable expectations** (EDPB paras. 50-54) and on **source lawfulness**, and it differs in opposite directions on two axes.

**The founder's own first-degree connections (2,468) are stronger on expectations.** Recital 47 makes the "relationship with the controller" the hinge of reasonable expectations. A mutually accepted professional connection is a real, bilateral, voluntary relationship with a named human at Forj. The individual chose to connect. They can see who Jacob is and what he does. Nothing was scraped: the data comes from Jacob's **own Art. 20 data-portability export** of his own account, so there is no LinkedIn ToS breach and, critically, **no re-identification of people who restricted their visibility**. That last point is precisely what KASPR was fined for - CNIL found KASPR had no lawful basis under Art. 6 because it collected details of users who had limited visibility to 1st/2nd-degree connections, which "exceeded reasonable expectations".

**But the LinkedIn cohort is weaker on purpose compatibility.** The data was originally shared by those individuals for *networking*, not for *commercial prospecting by a company Jacob later founded*. Repurposing personal-network data into a sales database is exactly the kind of context shift Art. 6(4) and Recital 50 are about. The existing record in `LINKEDIN_IMPORT_COMPLIANCE.md` handles this correctly by confining the cohort to a warm-path reference layer with `status='Ej kontaktad'` and no automated outreach. **That restriction is load-bearing and should be enforced in the schema, not in a policy document.** Add a boolean `marketing_permitted` defaulting to false for `source='linkedin-network'`, and make the outreach path refuse the row. A policy that lives only in a markdown file is not a mitigating measure; a foreign key constraint is.

**Vendor-sourced cohorts are weaker on expectations and weaker on provenance.** The data subject has no relationship with Forgeby, did not choose to be in the database, and in most cases does not know the vendor exists either. That is survivable - it is the ordinary B2B data case and *KNLTB* plus Recital 47 support it - but it raises the burden on transparency and on source disclosure. Two specific exposures:

- **The `vainu` cohort (~49,768)** is under a commercial relationship, which helps on contract but not on lawful basis. Get Vainu's written statement of (a) its own Art. 6 basis, (b) its upstream sources per record type, and (c) whether any of it is LinkedIn-derived. The standing rule in this repo - make vendors name the upstream, because buying a scrape does not launder it - is the right rule and the LIA should record that it was applied.
- **The `serper-lead` cohort (20,160)**, derived from public web search results, is the most exposed. "Publicly available" is not a lawful basis and never has been - that is the entire holding of the Bisnode line of cases. The data still needs Art. 6 and still needs Art. 14. It is also the cohort most likely to contain individuals who are not decision-makers at all.

**The `cvr-direktion` cohort (27,209) is the strongest on provenance and the most constrained on use.** It has `collected_at` and `source_url`, it comes from a statutory public register, and directors' filings are published by law. But **CVR-loven § 19** lets a unit register *reklamebeskyttelse*, and Danish Datatilsynet states in terms that "forbuddet mod direkte markedsføring i CVR-lovens § 19 gælder **alle kommunikationsformer**" - the prohibition covers **every** channel. The repo already knows 40% of the Danish shelf is reklamebeskyttet and treats it as a call screen. It is not only a call screen. For those records, CVR-derived contact data may not be used for direct marketing **at all**, including email, including a human-written one-to-one message that is commercial in purpose. That is a harder gate than "DK is call-first" and the product must enforce it as such.

**Practical recommendation:** treat "source" as a first-class permission dimension. One LIA, but a per-cohort annex with its own expectations analysis and its own conclusion, and a `contact_source_policy` table that the send path joins against. Do not average 104,240 heterogeneous records into a single verdict; a regulator will disaggregate them and you should get there first.

---

## 4. Per-country: is prior consent needed for B2B email? (This drives product behaviour.)

This is where the answers actually diverge, and the divergence is not the one most people assume. ePrivacy Directive Art. 13(5) left Member States free to extend the opt-in rule to legal persons. **Denmark did. Sweden and Finland did not. Norway sits in the middle and is stricter than it looks.**

| | Named person's work address (`anna.svensson@firma.se`) | Generic company address (`info@firma.se`) | Phone |
|---|---|---|---|
| **Sweden** | **Opt-out.** MFL 19 § applies only to "en fysisk person" as subscriber; marketing to a legal person needs no prior consent. 20 § still requires a valid opt-out address **in every message, including to legal persons**. | Opt-out | Permitted B2B; NIX-Telefon is a consumer register |
| **Denmark** | **PRIOR CONSENT REQUIRED.** MFL § 10 stk. 1: "En erhvervsdrivende må ikke rette henvendelse til **nogen** ved brug af elektronisk post ... medmindre den pågældende har givet sit forudgående samtykke." Forbrugerombudsmanden: "Spam er ifølge markedsføringsloven forbudt, uanset om modtagerne er forbrugere, andre virksomheder, offentlige myndigheder eller andre." | **Also prohibited** - "nogen" means anyone | Permitted B2B, but §10 stk. 4 Robinsonlisten/CPR applies to any identified natural person **including sole traders**, and CVR § 19 reklamebeskyttelse blocks all channels |
| **Norway** | **PRIOR CONSENT REQUIRED.** Mfl. § 15 protects "fysiske personer", and Forbrukertilsynet's guidance §2.4 states it covers "en fysisk persons individuelle e-postadresse på jobben, for eksempel ola.nordmann@firmaX.no, **uansett om e-posten inneholder tilbud til virksomheten**" | **Permitted** - "tillatt å sende markedsføring til e-postadresser som ikke tilhører en bestemt fysisk person, f.eks. post@firmaX.no" | Permitted (§ 15 expressly excludes live telephone), subject to Reservasjonsregisteret |
| **Finland** | **Contested - treat as opt-in.** Act 917/2014 § 202: "Direct marketing to legal persons is allowed if the recipient has not specifically prohibited it." But § 200(1) requires prior consent for email "directed at natural persons", and the **Data Protection Ombudsman's position is that an email to `firstname.lastname@company.fi` can be a communication directed at a natural person**, pulling it into § 200. | Opt-out under § 202 | Opt-out (§ 200(2): allowed unless specifically prohibited) |

**The four consequences for the product:**

1. **Denmark: no B2B email at all without prior consent, generic addresses included.** DK is not "call-first because of local consent rules" - it is *email-prohibited*. And for the CVR-derived cohort the reklamebeskyttelse flag closes the phone too. So Denmark has three tiers, not two: consented email / callable / untouchable.
2. **Norway: the split is by address shape, not by country.** `post@firma.no` is sendable; `ola@firma.no` is not. Forgeby already knows how to tell these apart. Norway is therefore only call-first for *named* contacts - a generic-address email lane is lawfully open and is currently being left on the table.
3. **Finland is not a clean opt-out market.** The current treatment (FI as sendable) rests on § 202, but the Ombudsman's named-address reading is the one that would be applied to Forgeby's records, since Forgeby's whole value proposition is the *named* decision-maker. Treat FI named addresses as opt-in until a Finnish lawyer says otherwise. This is the single most likely place where current product behaviour is wrong.
4. **Sweden is genuinely opt-out for named work addresses**, but 20 § MFL requires a working opt-out address in *every* marketing email including to legal persons. If Rune drafts a message and a human sends it from their own Outlook, that message still needs an unambiguous "reply STOP / here is how to opt out" line. A hand-sent one-to-one email is not exempt from 20 § merely because it is hand-sent.

**One-to-one human sending does not exit ePrivacy.** In C-102/20 *StWL* the CJEU held that what matters is a communication with a commercial purpose reaching a person "directly and individually", and that it is **irrelevant** whether it goes to one predetermined recipient or to a mass list. The "we never send bulk mail" design is an excellent *balancing-test* argument under Art. 6(1)(f) and a genuine mitigating measure. It is **not** a defence to MFL § 10 in Denmark or § 15 in Norway. Do not let that conflation into any customer-facing document.

For the non-Nordic shelves already loaded: **UK** PECR reg. 22 exempts corporate subscribers, so B2B email is opt-out (but individuals and sole traders are not corporate subscribers). **France** is opt-out for B2B professional email where the message relates to the recipient's function, per CNIL's long-standing prospection guidance - notably the *inverse* of the consumer rule. **Ireland** SI 336/2011 reg. 13 applies opt-in to individual subscribers, opt-out to others. Each needs its own row in the same table before those shelves are used.

---

## 5. Article 21(2) and the suppression list

**Article 21(2)**: "Where personal data are processed for direct marketing purposes, the data subject shall have the right to object at any time to processing of personal data concerning him or her for such marketing, which includes profiling to the extent that it is related to such direct marketing." **Article 21(3)**: "Where the data subject objects to processing for direct marketing purposes, the personal data shall no longer be processed for such purposes." **Article 21(4)**: the right must be "explicitly brought to the attention of the data subject ... at the latest at the time of the first communication" and "presented clearly and separately from any other information".

**EDPB Guidelines 1/2024, para. 122** is the operative text and it is unusually blunt: the Art. 21(2) right is "**unconditional and irrespective of the legal basis** relied on by the controller. There is no requirement that the data subject provides any reasoning ... there is no need for any 'balancing of interests' ... It is enough that the data subject puts forth an objection for the objection to be successful." There is no compelling-legitimate-grounds override, unlike Art. 21(1). Under Art. 12(2) it must be free and easy, at any time.

Danish Datatilsynet adds a point the product will hit in practice: a *frabedelse* under marketing law "må også forstås som en indsigelse" under Art. 21(3). **A person who replies "stop emailing me" has objected under GDPR, not just under marketing law.** One channel-specific "no" must be recorded as a GDPR objection unless the person clearly limited it.

### What this means for `email_suppression` (currently 0 rows, nothing writes to it)

This is the most serious open item, and it is not a paperwork item - it is the mechanism that makes "we never delete anything" survivable. If nothing deletes and nothing suppresses, then an objection has no effect at all, which is a direct Art. 21(3) breach. Requirements:

1. **It must survive re-imports, and re-imports are the whole point.** A suppression list checked only at send time fails the first time a vendor refresh re-inserts a cleaned row. Enforce it at **write** time: an import that would create or update a suppressed identity must be rejected or immediately re-flagged. Ideally a database trigger, so no future edge function can bypass it.
2. **Key it on identity, not on a row id.** Suppress on normalised email (lowercased, plus-tag stripped, IDN-normalised), and separately on (normalised person name + company domain), and on phone in E.164. A person who objects and later reappears via a different vendor with the same email must stay suppressed. Store a salted hash alongside the plaintext so the suppression check can run without widening exposure.
3. **Record the scope of the objection**: channel (email / phone / all), date received, verbatim wording, how it arrived, and who actioned it. If a partner receives the objection rather than Forgeby, it must propagate to the central store - otherwise the objection is defeated by the multi-tenant architecture, which is precisely the kind of "control true in code but defeated live" problem this repo has already had once.
4. **Suppression entries are never deleted.** The lawful basis for keeping them is Art. 6(1)(c) - processing necessary to comply with the legal obligation in Art. 21(3) - read with Art. 5(2) and Art. 17(3)(b). Keep them minimal (identity keys, date, scope) and document that they exist *only* to enforce the objection and are never used to contact anyone. That documentation is what stops the suppression list from itself becoming an unlawful marketing database.
5. **An erasure request is different from an objection.** Art. 17(1)(c) makes erasure follow automatically from a successful Art. 21(2) objection unless another ground applies. "Nothing will be deleted" is a defensible retention posture for the library; it is **not** defensible against a valid Art. 17 request. The founder's decision not to delete is about *bulk purging*, and should be written down as such, or it will read as a decision to ignore Art. 17.
6. **Art. 21(4) is a product requirement, not a footnote.** Every first outreach message must carry the objection right, clearly and *separately* from the rest of the text. That is a hard constraint on Rune's drafting templates and should be enforced in the send path, not left to the model. Combined with 20 § MFL in Sweden, it means: every message, an opt-out, visibly separated.

---

## 6. What the regulators actually objected to, and what would have made each lawful

| Decision | What was actually wrong | What would have made it lawful |
|---|---|---|
| **UODO, Bisnode Polska**, ZSPR.440.40.2018, 15 Mar 2019, PLN 943,470; upheld by NSA 2023 | **Not** the collection from the public register, and **not** the lawful basis. Bisnode had ~6m sole traders' data from CEIDG and made a deliberate commercial decision that individually notifying them was too expensive, posting a website notice instead. UODO: the cost of notification is part of the cost of the data. Art. 14 must be performed **actively**. | Individually notify by post or email everyone whose contact details it held (it held addresses for a large share), and be able to show the cost analysis rather than assert it. Publishing a privacy notice on your own website is not Art. 14 compliance. |
| **CNIL, KASPR**, délibération SAN-2024-020, 5 Dec 2024, EUR 240,000 + injunction | Four things. (i) **Art. 6**: collecting contact details of LinkedIn users who had *restricted visibility to their own connections* - beyond reasonable expectations, so no valid basis. (ii) **Art. 5(1)(e)**: 5-year retention **renewed on every update**, so effectively perpetual. (iii) **Arts. 12 and 14**: no information to data subjects until 2022, four years after launch, and then only in English. (iv) **Art. 15**: refused to give meaningful source information despite knowing its sources. Ordered to delete the improperly collected data, or where it could not distinguish it, to **notify everyone affected within 3 months**. | Collect only what the individual had made genuinely public; a real retention clock that expires rather than renews; notify data subjects within the Art. 14 window in a language they understand; answer access requests with the actual per-record source. |
| **Belgian APD, Black Tiger Belgium (ex-Bisnode Belgium)**, Jan 2024, EUR 174,640 | Unlawful and unfair processing because data subjects were **not individually informed in a proactive and transparent manner**; failure to comply with data subject requests; incomplete Art. 30 record of processing activities. The legitimate-interests defence for its Data Delivery and Data Quality activities was **rejected on transparency grounds**, not because commercial interest is illegitimate. | Proactive individual notification, working rights-request handling, and a complete Art. 30 register. Note the pattern: the LIA failed *because* transparency failed. |
| **CNIL, FORIOU**, 31 Jan 2024, EUR 310,000 | Used data supplied by **data brokers** for prospecting without verifying that valid consent had been obtained upstream. The brokers' competition-entry forms were misleading and did not systematically name FORIOU among the partners who might make contact. | Verify the upstream collection mechanism, obtain and keep evidence of it, and be named in the upstream notice. This is the decision that most directly threatens a "we bought it, so it's their problem" posture. |
| **CNIL, TAGADAMEDIA**, 29 Dec 2023, EUR 75,000 | Collected prospect data through game and product-test sites without valid consent, then sold it on. Closed after remediation. | Non-deceptive collection forms producing genuine Art. 4(11) consent. |
| **IMY, Klarna Bank AB**, 28 Mar 2022, SEK 7.5m (reduced to SEK 6m on appeal) | Not a prospecting case, but the closest **Swedish** precedent on the exact article at issue: information about purposes and legal grounds was not concise, clear or intelligible; incomplete information about third-country transfers and about data subject rights including the right to object. Breaches of Arts. 5(1)(a), 5(2), 12(1), 13 and **14(2)(g)**. | A layered, specific, readable notice that actually names the purposes, the legal grounds and the rights. IMY will read the notice itself, closely. |

**The pattern across all six.** Not one regulator held that assembling a B2B contact database from public registers and vendors is unlawful per se. Every single one turned on **transparency, retention, source disclosure and rights handling**. Bisnode lost on Art. 14. Black Tiger lost on Art. 14. KASPR lost on Arts. 6, 5(1)(e), 12, 14 and 15. FORIOU lost on failing to verify upstream consent. Klarna lost on Arts. 12-14. **The lawful basis is winnable; the paperwork is what loses.**

---

## 7. The Article 14 problem, stated plainly

This is Forgeby's single largest exposure and it is worth being blunt because a partner DPO will find it in one question.

**Art. 14(3)(a)**: information must be given "within a reasonable period after obtaining the personal data, but at the latest within one month". For the 77,031 rows with no recorded collection date, that month has long passed. **This cannot be retroactively cured.** Any lawyer will tell you the same. What can be done is stop it recurring and mitigate what exists.

**The "disproportionate effort" exemption in Art. 14(5)(b) is almost certainly not available.** WP29 Guidelines on Transparency (**WP260 rev.01**, endorsed by the EDPB) para. 55 is explicit on two points: the exception "**cannot be routinely relied upon by data controllers who are not processing personal data for the purposes of archiving in the public interest, for scientific or historical research purposes or statistical purposes**", and the impossibility or disproportionate effort "must be directly connected to the fact that the personal data was obtained other than from the data subject" - not to cost or inconvenience. Para. 57: if you do rely on it you must carry out a balancing exercise, **document it**, and take appropriate measures including making the information publicly available. Forgeby is a commercial controller with working email addresses for 44,477 of these people. Bisnode ran exactly this argument, at greater scale, and lost twice.

**Art. 14(2)(f) and 15(1)(g) require the source.** WP260 para. 53: the fact that a database was compiled from several sources does **not** lift the source-disclosure duty where it is possible, "although time consuming or burdensome", to identify the source per record. The 103,625 rows that carry a plain-text source label therefore *must* have that source disclosed. The ~3,300 unlabelled rows are the genuinely hard ones - and KASPR was fined under Art. 15 for exactly this evasion.

**But the outreach model contains its own fix, and it is a good one.** **Art. 14(3)(b)**: where the data is to be used for communication with the data subject, the information must be provided "at the latest at the time of the first communication to that data subject". Because Forgeby never bulk-sends and every contact is a deliberate, human, one-at-a-time act, **the first message is a natural and legally recognised Art. 14 delivery point.** It also coincides exactly with the Art. 21(4) requirement. So:

**Recommendation (this is the genuine choice the law leaves you):**
- **Option A** - proactively notify all 44,477 addressable contacts now, in one campaign. Maximally defensible; but in Denmark and Norway the notification email is itself arguably a regulated commercial contact, and it will generate objections at scale.
- **Option B** - do nothing further and rely on Art. 14(5)(b). Not defensible; WP260 para. 55 forecloses it.
- **Option C (recommended)** - a three-layer approach: (i) publish a specific, layered Art. 14 notice at a stable URL naming the source categories, the purposes, the legitimate interests relied on, the retention rule and the objection route, and make it findable; (ii) make **first-contact notification mandatory in the send path** - no message leaves without the Art. 14 link and the Art. 21(4) statement, enforced in code; (iii) write down, dated, why proactive mass notification was not chosen, including the DK/NO analysis. Option C is what the model was already built for; it just is not wired up yet.

Option C does not erase the historic Art. 14(3)(a) timing failure. It stops it continuing, it demonstrates good faith, and it is what the mitigation looks like in every one of the decisions above. **Do not describe Option C to anyone as "Article 14 compliance". Describe it as remediation of a known gap.** The difference matters if IMY ever reads it.

---

## 8. Prerequisites before the LIA can honestly be signed

1. **`contacts.collected_at` and `contacts.source_url`** (already open as task #20). Without these, retention cannot be evidenced and Art. 15(1)(g) cannot be answered. KASPR was fined on both.
2. **Make `email_suppression` real** - write path, import-time enforcement, identity keys, never deleted.
3. **Wire the Art. 14 notice and the Art. 21(4) statement into the send path** as a hard gate, not a prompt instruction to Rune.
4. **A `lawful_channel` field per contact** (already open as task #15), derived from country + address shape + register flags, with the authority recorded per record: SE named = email opt-out; DK any = email consent-only; DK CVR reklamebeskyttet = no channel; NO named = call only; NO generic = email opt-out; FI named = treat as consent-only pending advice.
5. **Vendor provenance file** for Vainu, Explorium and Clay: their Art. 6 basis, upstream source, Art. 14 warranty.
6. **Art. 30 record of processing activities.** Black Tiger was fined partly for not having a complete one. It is a short document and its absence is free evidence against you.
7. **Art. 26 joint-controller analysis** for the partner-sends-from-own-mailbox step.
8. **Decide and record the position on the 3,300 unlabelled rows.** They cannot satisfy Art. 14(2)(f). Given "nothing will be deleted", the honest alternative is to flag them non-marketable rather than to pretend the source is knowable.

Then take the whole package to a Swedish-qualified data protection lawyer with Nordic reach, and get the Danish CVR § 19 point and the Finnish § 200/§ 202 named-address point confirmed locally. Those two are where current product behaviour is most likely to be wrong today.

**Sources**

- [GDPR Article 14 - information to be provided where personal data have not been obtained from the data subject, including 14(3)(a) one-month rule, 14(3)(b) first-communication rule, 14(2)(f) source, and the 14(5)(b) exemptions](https://gdpr-info.eu/art-14-gdpr/)
- [GDPR Article 21 - right to object; 21(2) unconditional right to object to direct marketing, 21(3) must cease, 21(4) must be brought to attention explicitly and separately at first communication](https://gdpr-info.eu/art-21-gdpr/)
- [GDPR Article 6 - lawfulness of processing, including 6(1)(f) legitimate interests](https://gdpr-info.eu/art-6-gdpr/)
- [GDPR Recital 47 - legitimate interests, reasonable expectations based on relationship with the controller, and the statement that direct marketing may be regarded as a legitimate interest](https://gdpr-info.eu/recitals/no-47/)
- [EDPB Guidelines 1/2024 on processing of personal data based on Article 6(1)(f) GDPR - three cumulative conditions (paras 12-13), balancing structure (para 32), mitigating measures must go beyond legal obligations (paras 34, 57), reasonable expectations (paras 50-54), direct marketing (paras 109-121), ePrivacy precludes reliance on 6(1)(f) (para 114 and fn 143), unconditional right to object (para 122)](https://www.edpb.europa.eu/system/files/2024-10/edpb_guidelines_202401_legitimateinterest_en.pdf)
- [WP29 Guidelines on Transparency under Regulation 2016/679 (WP260 rev.01), endorsed by EDPB - paras 53-57 on impossibility, source disclosure, and the narrow scope of the Article 14(5)(b) disproportionate-effort exemption plus the duty to document the balancing exercise](https://www.edpb.europa.eu/system/files/2023-09/wp260rev01_en.pdf)
- [CJEU judgment of 4 October 2024, Case C-621/22 Koninklijke Nederlandse Lawn Tennisbond (KNLTB) - purely commercial interests may qualify as legitimate interests under Article 6(1)(f)](https://ipcuria.eu/case?reference=C-621%2F22)
- [CNIL, English announcement of the KASPR sanction: EUR 240,000 fine, breaches of Article 6 (data of users with restricted LinkedIn visibility), Article 5-1-e (retention), Articles 12 and 14 (transparency, four-year delay, English only), Article 15 (source disclosure), plus the injunction and deletion/notification order](https://www.cnil.fr/en/data-scraping-kaspr-fined-eu240000)
- [CNIL deliberation SAN-2024-020 of 5 December 2024 against KASPR, full text on Legifrance](https://www.legifrance.gouv.fr/cnil/id/CNILTEXT000050791828)
- [CNIL, closure of the order issued against KASPR (confirms the compliance steps actually taken)](https://www.cnil.fr/en/closure-order-issued-against-kaspr)
- [Polish UODO - Supreme Administrative Court (NSA) upholds the UODO decision against Bisnode (now Dun & Bradstreet) on the Article 14 information obligation for data taken from the public register; this is the Polish, not Swedish, Bisnode case](https://uodo.gov.pl/en/553/1572)
- [Analysis of the Polish DPA Bisnode decision: PLN 943,470 fine, ~6 million sole traders, deliberate commercial decision not to notify individually, website notice held insufficient, UODO requiring Article 14 to be performed actively](https://www.blakemorgan.co.uk/digital-marketing-agency-bisnode-fined-by-the-polish-dpa-for-failing-to-be-transparent-with-data-subjects/)
- [EDPB national news: Belgian supervisory authority sanctions Black Tiger Belgium (formerly Bisnode Belgium) for lack of transparency in its data-broking activities - EUR 174,640](https://edpb.europa.eu/news/national-news/2024/belgian-sa-sanctions-black-tiger-belgium-lack-transparency-and-unlawful_hr)
- [Belgian DPA and direct marketing: analysis of the Black Tiger Belgium decision, the rejection of the legitimate-interests defence on transparency grounds, and the Article 30 record failure](https://liedekerke.com/en/insights/belgian-data-protection-authority-and-direct-marketing-recent-developments)
- [CNIL: commercial prospecting - FORIOU fined EUR 310,000 for using data-broker-supplied data without verifying valid upstream consent](https://www.cnil.fr/en/commercial-prospecting-foriou-fined-eu310000)
- [IMY decision of 28 March 2022 against Klarna Bank AB - SEK 7.5m for breaches of Articles 5(1)(a), 5(2), 12(1), 13 and 14(2)(g); the closest Swedish precedent on Articles 13/14 information quality](https://www.imy.se/globalassets/dokument/beslut/2022/beslut-tillsyn-klarna.pdf)
- [IMY guidance on intresseavvagning (the balancing test) as a legal basis under Swedish practice](https://www.imy.se/verksamhet/dataskydd/det-har-galler-enligt-gdpr/rattslig-grund/intresseavvagning/)
- [Swedish Marketing Act (marknadsforingslagen 2008:486) 19-21 §§ on obestalld reklam - 19 § applies to 'en fysisk person' only; 20 § requires a valid opt-out address in every marketing email including to legal persons](https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/marknadsforingslag-2008486_sfs-2008-486/)
- [Swedish preparatory works, prop. 1999/2000:40 Obestalld reklam m.m. - the opt-in rule was drawn at natural-person subscribers; legal persons were not brought within it](https://riksdagen.se/sv/dokument-lagar/dokument/proposition/obestalld-reklam-mm_GN0340/html)
- [Danish markedsforingsloven § 10 in full - stk. 1 prohibits electronic-mail marketing 'til nogen' without prior consent; stk. 2 existing-customer exception; stk. 4-6 Robinsonlisten/CPR and first-contact information duty](https://danskelove.dk/markedsf%C3%B8ringsloven/10)
- [Danish Forbrugerombudsmanden on unsolicited electronic approaches: 'Spam er ifolge markedsforingsloven forbudt, uanset om modtagerne er forbrugere, andre virksomheder, offentlige myndigheder eller andre'](https://forbrugerombudsmanden.dk/alle-emner/uanmodede-henvendelser/uanmodede-elektroniske-henvendelser-spam)
- [Danish Forbrugerombudsmanden, Vejledning om spamforbuddet (2021)](https://forbrugerombudsmanden.dk/media/bjajzdv1/vejledning-om-spamforbuddet-2021-a.pdf)
- [Danish Datatilsynet, Vejledning om direkte markedsforing (June 2023) - the three conditions of the interesseafvejningsregel; Example 3 (IT company calling businesses and sole traders from CVR under Art 6(1)(f)); Example 6 (emailing sole traders found via CVR requires consent); footnote 32 confirming that the CVR-loven § 19 prohibition 'gaelder alle kommunikationsformer'; and that a marketing-law frabedelse must also be read as an Article 21(3) objection](https://www.datatilsynet.dk/Media/638237218449834564/Vejledning%20om%20direkte%20markedsf%C3%B8ring.pdf)
- [Danish CVR-loven § 19 - reklamebeskyttelse; base data of protected units may not be used by private legal entities for direct marketing, and the protection flag must be passed on when data is disclosed to third parties](https://danskelove.dk/cvr-loven/19)
- [Norwegian markedsforingsloven § 15 - prior consent required for electronic marketing to 'fysiske personer'; telephone and existing-customer exceptions](https://lovdata.no/lov/2009-01-09-2/%C2%A715)
- [Norwegian Forbrukertilsynet, guidance on marketing via e-mail and SMS, section 2.4 - § 15 covers a named individual's work address (ola.nordmann@firmaX.no) 'uansett om e-posten inneholder tilbud til virksomheten', while generic addresses such as post@firmaX.no fall outside](https://www.forbrukertilsynet.no/lov-og-rett/veiledninger-og-retningslinjer/forbrukertilsynets-veiledning-markedsforing-via-e-post-sms-o-l)
- [Norwegian Datatilsynet on newsletters and e-mail lists - a buyer of marketing addresses has an independent duty to establish that valid consent exists upstream](https://www.datatilsynet.no/personvern-pa-ulike-omrader/kundehandtering-handel-og-medlemskap/nyhetsbrev-epostlister-og-sms/)
- [Finnish Act on Electronic Communications Services 917/2014, official English translation - Section 200 (direct marketing to natural persons, prior consent for email) and Section 202 (direct marketing to legal persons, permitted unless specifically prohibited), plus Sections 203-204](https://www.finlex.fi/api/media/statute-foreign-language-translation/687931/mainPdf/main.pdf)
- [Finnish Act on Electronic Communications Services, Traficom overview page](https://traficom.fi/en/regulations/act-electronic-communications-services)
- [Electronic marketing in Finland - notes the Finnish Data Protection Ombudsman's position that a marketing email sent to firstname.lastname@company.fi can be treated as directed at a natural person under Section 200 rather than at the organisation under Section 202](https://www.dlapiperdataprotection.com/?t=electronic-marketing&c=FI)
- [CJEU judgment of 25 November 2021, Case C-102/20 StWL Stadtische Werke Lauf a.d. Pegnitz - a communication is direct marketing if it has a commercial purpose and reaches a person directly and individually; it is irrelevant whether it is sent to one predetermined recipient or on a mass basis](https://curia.europa.eu/juris/liste.jsf?num=C-102/20)
- [CJEU judgment of 4 July 2023, Case C-252/21 Meta Platforms v Bundeskartellamt - necessity and balancing under Article 6(1)(f), including paras 106, 109, 112, 116-121](https://curia.europa.eu/juris/liste.jsf?num=C-252/21)
- [Existing internal record of the LinkedIn connections import and its lawful-basis analysis (C:\Users\jacob\alloy\LINKEDIN_IMPORT_COMPLIANCE.md)](file:///C:/Users/jacob/alloy/LINKEDIN_IMPORT_COMPLIANCE.md)

> Caveat: NOT LEGAL ADVICE - preparation for a lawyer, not a legal opinion, and must not be published or shown to a partner as a compliance position. Confidence is high on the GDPR framework (Arts 6/13/14/21, EDPB Guidelines 1/2024, WP260, KNLTB, Meta) and on the Danish and Norwegian positions, both of which I verified against the statutes and the regulators' own guidance. It is lower on two points that I could not close and that a local lawyer must confirm: (1) FINLAND - I have the primary text of §§200/202 of Act 917/2014, but the decisive question of whether an email to firstname.lastname@company.fi falls under §200 (opt-in) or §202 (opt-out) rests on the Data Protection Ombudsman's interpretive position, which I found only through a secondary source (DLA Piper), not in a published decision I could read directly. I have recommended treating FI named addresses as opt-in on the precautionary side; that may be stricter than Finnish practice requires. (2) SWEDEN - MFL 19 § plainly protects natural persons only, and Swedish commentary is consistent that B2B email needs no prior consent, but I found no court or IMY decision squarely holding that an email to a named employee's work address is directed at the legal person rather than the individual. Also note two corrections to the premise of the question: the Bisnode decision is Polish (UODO/NSA), not Swedish IMY, and there is a separate Belgian decision against Black Tiger (ex-Bisnode Belgium); and Danish CVR-loven §19 reklamebeskyttelse blocks ALL channels including telephone, which is stricter than the repo's current "DK is call-first" treatment of the 27,209 cvr-direktion contacts. Several source PDFs (WP260, EDPB 1/2024, Datatilsynet's guidance, the Finnish translation) I extracted locally rather than reading in a browser, so paragraph numbers should be spot-checked against the published documents before quoting them to anyone.

---

## What does GDPR Article 14(2)(f) require you to tell someone about the SOURCE of their data, how exact must it be, is a never-recorded collection date itself a breach, what does Article 5(2) require by way of provenance documentation, does re-deriving a fact from an independent lawful source breach anything, and what should a source_url field hold for a public register / a commercial vendor / a web search result / a member's own social-network export?

*Confidence: high*

# Article 14(2)(f): how exact must "the source" be?

**This is not legal advice.** It is research prepared so a qualified data protection lawyer can review it. Every load-bearing proposition below is tied to a primary text: the Regulation, WP29/EDPB guidance, or a published DPA decision.

---

## 1. The rule and the standard of precision

**The text.** Article 14(2)(f) requires the controller to give "from which source the personal data originate, and if applicable, whether it came from publicly accessible sources" ([Art. 14 GDPR](https://gdpr-info.eu/art-14-gdpr/), consolidated text on [EUR-Lex](https://eur-lex.europa.eu/eli/reg/2016/679/oj)). Recital 61 adds the only softening: "where the origin of the personal data cannot be provided to the data subject because various sources have been used, general information should be provided."

**The governing guidance** is the Article 29 Working Party *Guidelines on transparency under Regulation 2016/679* (WP260 rev.01), formally endorsed by the EDPB ([landing page + PDF](https://ec.europa.eu/newsroom/article29/items/622227/en)). Two passages decide your question.

The Annex row for Article 14(2)(f), **verbatim**:

> "The specific source of the data should be provided unless it is not possible to do so – see further guidance at paragraph 60. If the specific source is not named then information provided should include: the nature of the sources (i.e. publicly/ privately held sources) and the types of organisation/ industry/ sector."

And paragraph 60, **verbatim** (this is the paragraph that will decide the case against you if you get it wrong):

> "Recital 61 states that 'where the origin of the personal data cannot be provided to the data subject because various sources have been used, general information should be provided'. The lifting of the requirement to provide data subjects with information on the source of their personal data applies only where this is not possible because different pieces of personal data relating to the same data subject cannot be attributed to a particular source. For example, the mere fact that a database comprising the personal data of multiple data subjects has been compiled by a data controller using more than one source is not enough to lift this requirement if it is possible (although time consuming or burdensome) to identify the source from which the personal data of individual data subjects derived. Given the requirements of data protection by design and by default, transparency mechanisms should be built into processing systems from the ground up so that all sources of personal data received into an organisation can be tracked and traced back to their source at any point in the data processing life cycle."

**So the answer is two-layered, and the layers have different standards:**

| Layer | Standard | What satisfies it |
| --- | --- | --- |
| The Article 14 **notice** (proactive, ex ante) | Name the **specific source**. Categories only where per-record attribution is genuinely impossible — and "burdensome" is expressly not impossible | "The Danish Central Business Register (CVR)"; "Vainu, a Finnish/Swedish B2B data provider"; "public web search results, retrieved via a search API"; "the founder's own LinkedIn connections export" |
| The **per-record answer** (reactive, on an Art. 15 request) | Art. 15(1)(g): "any available information as to their source" — the actual source of *that* record | The register URL, the vendor batch, the specific result URL |

**A per-record URL is not required in the notice. A per-record answer is required on request, and the notice must name real sources, not shapes of sources.**

The EDPB spells out exactly this ex ante / ex post split in *Guidelines 01/2022 on data subject rights – Right of access*, §120 and Example 21 ([PDF](https://www.edpb.europa.eu/system/files/2023-04/edpb_guidelines_202201_data_subject_rights_access_v2_en.pdf)):

> "If it is not clear ex ante, which of the companies will get involved in the processing, it is sufficient to mention the names of the eligible companies in the privacy policy. In the context of a request based on Art. 15, in addition to the information that a creditworthiness information has been obtained, it would then (ex post) be necessary to disclose, which of the companies mentioned has been involved exactly."

Note what that permits and what it does not: it permits an *ex ante* list. It does not permit an unnamed list.

**The decision directly on point is CNIL's KASPR sanction**, SAN-2024-020 of 5 December 2024, EUR 240,000, for breaches of Articles 5-1-e, 6, 12, 14 and 15 ([CNIL EN summary](https://www.cnil.fr/en/data-scraping-kaspr-fined-eu240000); [full deliberation on Légifrance](https://www.legifrance.gouv.fr/cnil/id/CNILTEXT000050791828)). The wording CNIL held **insufficient**:

> "Nous collectons ces données auprès de sources publiques, d'annuaires professionnels et de nos partenaires ponctuellement."

The wording CNIL **accepted** after correction:

> "Nous collectons ces données auprès des réseaux sociaux tels que LinkedIn, des annuaires professionnels tels que Whois et GitHub et de nos fournisseurs de données."

The delta between those two sentences is the whole answer to "how exact". Both are categories. The second names them. CNIL later closed the injunction ([closure notice](https://www.cnil.fr/en/closure-order-issued-against-kaspr)). CNIL also faulted KASPR for answering Article 15 requests by saying only that the data came from publicly available sources — i.e. reusing the notice-level generality as the per-record answer, which is the exact failure mode to avoid.

**Recommendation where the law leaves a choice.** Article 12(1) requires the notice to be concise and intelligible; a 104,240-row provenance dump would defeat that. Take the named-category notice plus per-record retrieval:

- Notice names each source by its real name, its nature (publicly accessible / privately held), and what it contributed (identity vs contact details).
- Database holds per-record provenance sufficient to answer Article 15(1)(g) exactly, for every row.
- Do not use "public sources and our partners". That sentence has already been fined.

**Norwegian Datatilsynet** states the same duty in its guidance on information and openness — the controller must say "hva kilden for de ulike opplysningene er og om de kom fra en offentlig tilgjengelig kilde", within one month at the outer limit ([Datatilsynet, Informasjon og åpenhet](https://www.datatilsynet.no/rettigheter-og-plikter/virksomhetenes-plikter/informasjon-og-apenhet/)). **Swedish IMY** states the equivalent for data subjects ([Rätt till information](https://www.imy.se/privatperson/dataskydd/dina-rattigheter/ratt-till-information/)).

---

## 2. The 77,031 rows with no recorded collection date

**Is the missing date itself a breach of Article 14(2)(f)? No.** Article 14(2)(f) requires a source, not a date. Nothing in Articles 13, 14, 15 or 30 requires a "collected_at" field as such.

**But the absence is load-bearing for three other obligations, and that is where the exposure sits:**

1. **Article 14(3)(a)** — the notice is due "within a reasonable period after obtaining the personal data, but at the latest within one month". Without an obtaining date you cannot demonstrate you met, or missed, that deadline. That is an accountability failure under Article 5(2), not a source-disclosure failure.
2. **Article 5(1)(e) storage limitation**, plus the storage-period disclosure in Articles 13(2)(a)/14(2)(a)/15(1)(d). A retention clock needs a start. CNIL fined KASPR under Article **5-1-e** in the same decision. CNIL's own reference framework for commercial-management processing sets prospect data at a maximum of three years "à compter de leur collecte ou du dernier contact" ([référentiel gestion des activités commerciales](https://www.cnil.fr/sites/cnil/files/atoms/files/referentiel_traitements-donnees-caractere-personnel_gestion-activites-commerciales.pdf)). No collection date, no runnable clock.
3. **Article 5(1)(d) accuracy** — which applies to the metadata as much as the payload. A fabricated or silently back-filled date is inaccurate data *about the processing*, and it is the kind of thing that converts a documentation gap into a credibility problem in front of a regulator.

**Is a documented first-observed-in-our-system date, clearly labelled as such, acceptable? Yes — and it is the correct remediation, provided three conditions hold.**

- **It is stored in a different field from the true collection date, and never overwrites it.** Concretely: `collected_at` stays NULL where unknown; add `first_observed_at` plus `date_basis` as an explicit enum (`collected` | `first_observed_in_system` | `vendor_declared` | `unknown`). Never back-fill `collected_at`.
- **It is evidenced, not asserted.** Derive it from something you can show a regulator: earliest database write, backup or snapshot timestamp, import file mtime, ingestion log line, vendor invoice or delivery date. Record which evidence was used.
- **It is used conservatively.** Where the true date is unknown, the first-observed date is necessarily *later than or equal to* the real collection date, so using it as the retention-clock start would retain data **longer** than the truth warrants. Start the clock at the **earliest defensible** date instead, and say so. Erring against yourself is what makes the labelling credible.

WP260 §60 is the authority for fixing this prospectively: transparency mechanisms "should be built into processing systems from the ground up so that all sources ... can be tracked and traced back to their source at any point in the data processing life cycle". Backlog item #20 (add `contacts.collected_at` + `source_url`) is the direct implementation of that sentence, and it should be treated as compliance work, not data-engineering nice-to-have.

**Be straight with the lawyer about the one thing that cannot be repaired:** for legacy rows never notified, the Article 14(3)(a) one-month window has already closed. That is a past non-compliance which no amount of documentation undoes. The remediation is prospective and is genuinely strong in your model: because Rune drafts and a human sends one at a time, Article 14(3)(b) — notice "at the latest at the time of the first communication to that data subject" — can be met perfectly, by attaching the source disclosure to the first message. Plus a published notice as the standing measure. Document the gap, date it, and show the fix; do not paper over it.

**And do not reach for Article 14(5)(b) "disproportionate effort".** That is precisely what the Polish DPA rejected against **Bisnode Polska** — a fine of roughly PLN 943,000 for relying on a website notice for data compiled from public registers, upheld all the way to the Supreme Administrative Court ([UODO, NSA judgment](https://uodo.gov.pl/en/553/1572)). The reasoning: the cost of informing is part of the cost of acquiring the data, and a commercial compiler that holds contact details cannot call individual notice disproportionate. WP260 §61 is explicit that the exception "should not be routinely relied upon by data controllers who are not processing personal data for the purposes of archiving in the public interest, for scientific or historical research purposes or statistical purposes."

*Correction for the record:* the Bisnode decision was the **Polish** UODO's, not Swedish IMY's. Any internal note attributing it to Sweden should be fixed before it reaches a partner DPO.

---

## 3. What Article 5(2) accountability requires on provenance

**The text.** Article 5(2): "The controller shall be responsible for, and be able to demonstrate compliance with, paragraph 1 ('accountability')." Read with Article 24 (measures, reviewed and updated), Article 25 (data protection by design and by default), and Article 30 (records of processing activities).

Article 30 does not itself list "sources" as a mandatory field of the ROPA. Accountability for provenance therefore comes from 5(2) + 24 + 25 + the practical need to answer Articles 14 and 15. WP260 §64 states the documentation duty in terms: where a controller relies on an Article 14(5)(b) exception, the balancing exercise "should be documented by the data controller in accordance with its accountability obligations". The Danish Datatilsynet puts the same duty on the legitimate-interest balancing test in its direct-marketing guidance: "Afvejningen skal dokumenteres på en detaljeret og gennemsigtig måde, så du kan påvise, herunder over for Datatilsynet, at testen er gennemført grundigt og korrekt" ([Vejledning om direkte markedsføring, June 2023](https://www.datatilsynet.dk/Media/638237218449834564/Vejledning%20om%20direkte%20markedsf%C3%B8ring.pdf)).

**What that means in practice, for a library of your shape — three artefacts:**

1. **Per-record provenance in the data.** Machine-retrievable, one query, no archaeology. This is what makes an Article 15(1)(g) answer possible at all.
2. **A source register** — one row per source, not per contact. Legal name of the source, nature (public register / commercial vendor / public web / own network / internally derived), jurisdiction, licence or contract and DPA reference, what fields it contributes, lawful basis and the LIA for that source, retention rule, the exact sentence used to describe it in the public notice, and the date the source was first and last used. This is the document a DPO will actually ask for, and it is what turns 104,240 opaque rows into a defensible position.
3. **The ROPA and the LIAs**, cross-referencing the source register.

One gap worth naming while you are in the file: `email_suppression` has 0 rows and nothing writes to it. Article 21(2)–(3) gives an **unconditional** right to object to direct marketing, and Article 12(3) puts a one-month response deadline on it. A suppression table that nothing writes to is not a control; it is a screenshot of a control. Fix it in the same sprint as the provenance columns.

---

## 4. Re-deriving the same fact from an independent lawful source

**Nothing in the GDPR is breached by re-deriving a fact from a new lawful source and recording that new source — provided the original is retained and disclosable.** In fact Article 5(1)(d) points the other way: accuracy requires that data be "accurate and, where necessary, kept up to date", and independent re-derivation with verification is exactly that. Your 4,727 pattern-derived-and-verified emails are the cleanest-provenance records in the entire table.

**The breach would be in the concealment, not the re-derivation.** Two hooks:

- **Article 15(1)(g)** — "any available information as to their source". If both provenance entries exist in your systems, both are "available", and both must be disclosable. Overwriting the earlier entry so that only the newer one survives converts an honest re-derivation into a misrepresentation.
- **EDPB Guidelines 01/2022, §36**, verbatim: "The information included in the copy of the personal data given to the data subject has to comprise the actual information or personal data held about the data subject. This includes the obligation to give information about data that are inaccurate or about data processing which is not or no longer lawful. The data subject may for example use the right of access to find out about **the source of inaccurate data being circulated between different controllers**. If the controller corrected inaccurate data before informing the data subject about it, the data subject would be deprived of this possibility."

That is the EDPB explicitly rejecting sanitise-then-answer. It also happens to be why the append-only provenance model is the right one: **add** a provenance row, never mutate.

**Two limits to put in front of the lawyer, not to decide yourself:**

- Re-derivation establishes a lawful footing for the *new* processing. It does not retroactively cure any defect in the original acquisition, and it is not a laundering mechanism. This matters most for anything traceable to a scrape: acquiring the same fact from a genuinely independent source is fine; relabelling a scrape-derived record as "derived" because you later found it elsewhere is not. The audit question is whether the re-derivation was genuinely independent — did the pipeline actually re-observe the fact, or did it merely confirm a value it already held?
- Field-level honesty. A record whose *name and title* came from the founder's LinkedIn export and whose *email* was pattern-derived and verified has **two sources for two fields**. Article 14(2)(f) speaks of the source of "the personal data" — where different data have different origins, per-field provenance is the only truthful structure. Do not let a single `source` string on the row imply that the whole record came from the newer, cleaner source.

---

## 5. What `source_url` should actually contain, per category

The field is misnamed for the job. A URL is only one of four legitimate shapes of provenance. Recommend splitting it: `source_system` (canonical name), `source_kind` (enum), `source_ref` (URL **or** opaque identifier), `publicly_accessible` (bool, feeding the second limb of 14(2)(f) directly), plus `collected_at` / `first_observed_at` / `date_basis` and `evidence`.

### a. Public register — CVR, Bolagsverket/SCB, Brønnøysund, PRH, Companies House, Sirene, CRO

- **Best:** the stable deep link to the specific record — the CVR unit or participant page, the Companies House officer-appointment URL, the Sirene établissement URL.
- **Where no per-record page exists:** the API endpoint or bulk file identity, plus the record key. E.g. `cvr:direktion/{cvr_nr}/{person_id}` with `dataset=CVR bulk, file=…, extracted=2026-05-14`.
- **Always also record:** the register's legal name, the extraction date, and the licence or terms under which it was taken.
- `publicly_accessible = true`. This is the one category where the second limb of 14(2)(f) is unambiguously engaged.
- Your 27,209 `cvr-direktion` rows already have `collected_at` and `source_url` — these are the model for the rest, and worth saying so to a lawyer.

### b. Commercial vendor — vainu, explorium, clay, fullenrich, icypeas

- **Never a URL you invented.** Record: vendor legal entity, the delivery artefact (export/job/batch id, file name and hash, API endpoint), the delivery date, and a reference to the contract and DPA.
- **Record the vendor's declared upstream** where they will state it — and where they will not, record *that refusal as a fact*, dated. That is itself accountability evidence, and it is the field that tells you which rows are safe.
- `publicly_accessible` = whatever the vendor's upstream actually is — often **false**, or unknown. Do not default it to true because business contact data "feels public".
- In the notice, name the vendor. "A Swedish B2B data provider" is the KASPR sentence with the nouns changed.

### c. Web search result — the 20,160 `serper-lead` rows

- **The result URL: the page on which the name, title or email actually appeared.** Not `serper.dev`, not the search-engine URL. Serper is the *tool*; the page is the *source*.
- Also record: the query string, the fetch timestamp, and — strongly recommended — a stored snippet or content hash as evidence that the fact was on that page on that date. Pages change; your evidence should not depend on the page still saying what it said.
- `publicly_accessible = true`, and say so in the notice: this is the clearest case for the "if applicable" limb.
- If the URL was never retained, this is exactly where `first_observed_at` + `date_basis = 'unknown'` + `source_kind = 'public_web'` is the honest record. "Public web search results, source page not retained for records collected before <date>" is a defensible disclosure. "Public sources" is not.

### d. The founder's own LinkedIn connection export — the 2,468 rows

- **`source_ref` = the export artefact**, identified precisely: "LinkedIn data export (Connections.csv), account holder Jacob Ahmid, export requested <date>, file hash <…>". The person's profile URL goes in a separate per-record locator field, because the profile is *where the person is*, not *where you got the data*.
- **`publicly_accessible = false`** — and this is the counter-intuitive one worth getting right. The data did not come to you from a public page; it came from a private export of a private connection graph, generated by the account holder. Marking these "publicly accessible" would be the kind of small untruth that costs disproportionate credibility if a regulator pulls the thread.
- The disclosure sentence should be plain: "the personal LinkedIn connections of Forj's founder, exported by him from his own account". Concrete, unembarrassing, and it happens to be the most defensible source in the table on the transparency axis.
- Separate question, flagged not answered: whether the LinkedIn User Agreement permits *commercial* reuse of a personal connections export is a contract question, not a GDPR question. It sits alongside the standing rule that buying a scrape does not launder it. Put it to the lawyer as its own item.

### One suggested shape

```
source_system      'cvr' | 'vainu' | 'serper' | 'linkedin-own-export' | 'pattern+icypeas' | …
source_kind        public_register | vendor | public_web | own_network | derived_verified
source_ref         URL, or 'cvr:direktion/{cvr}/{pid}', or 'vainu:export/2025-11-03/batch-114'
publicly_accessible  boolean, nullable (null = not established)
collected_at       timestamptz NULL where genuinely unknown — never back-filled
first_observed_at  timestamptz, evidenced
date_basis         collected | first_observed_in_system | vendor_declared | unknown
evidence           snippet / hash / log ref / invoice ref
notice_variant     FK to the source register row → the exact sentence shown to this person
```

Field-level provenance for `email` specifically, since that is the field most often re-derived.

---

## The short version

- **Source:** name it. Categories are permitted in the notice, unnamed categories are not. The gap between the two KASPR sentences is the whole standard.
- **Per-record URL:** not required in the notice; required as an *answer* under Article 15(1)(g). Build for retrieval, disclose by category.
- **Missing date:** not an Article 14(2)(f) breach; a real Article 5(2) and 5(1)(e) problem. A labelled, evidenced first-observed date is the correct and accepted repair, in a separate field, used conservatively.
- **Accountability:** per-record provenance + a source register + ROPA/LIAs. WP260 §60 says build it in from the ground up.
- **Re-derivation:** lawful and encouraged. Append, never overwrite. Concealment is the breach, not the re-derivation.
- **Do not** invoke Article 14(5)(b) disproportionate effort. Bisnode tried that and lost, twice.
- Nothing above requires deleting a single row.

**Sources**

- [GDPR Article 14, including 14(2)(f) 'from which source the personal data originate, and if applicable, whether it came from publicly accessible sources', and the 14(3)(a) one-month / 14(3)(b) first-communication deadlines and the 14(5)(b) exceptions](https://gdpr-info.eu/art-14-gdpr/)
- [Consolidated official text of Regulation (EU) 2016/679 (Articles 5(2), 12, 14, 15, 21, 24, 25, 30; Recitals 61 and 62)](https://eur-lex.europa.eu/eli/reg/2016/679/oj)
- [Article 29 Working Party, Guidelines on transparency under Regulation 2016/679 (WP260 rev.01), endorsed by the EDPB — Annex row on Art. 14(2)(f) ('The specific source of the data should be provided unless it is not possible to do so... the nature of the sources (i.e. publicly/ privately held sources) and the types of organisation/ industry/ sector'); §60 on impossibility of providing the source and building traceability in from the ground up; §61 on not routinely relying on disproportionate effort; §64 on documenting the balancing exercise](https://ec.europa.eu/newsroom/article29/items/622227/en)
- [EDPB Guidelines 01/2022 on data subject rights – Right of access — §120 and Example 21 (ex ante naming of eligible sources in the notice is sufficient; ex post under Art. 15 you must disclose which one exactly); §36 (the copy must comprise the actual information held, including inaccurate data and unlawful processing; a controller must not correct before informing)](https://www.edpb.europa.eu/system/files/2023-04/edpb_guidelines_202201_data_subject_rights_access_v2_en.pdf)
- [CNIL, Délibération SAN-2024-020 of 5 December 2024 against KASPR, EUR 240,000, for breaches of Articles 5-1-e, 6, 12, 14 and 15 — full published text including the source-description wording held insufficient and the corrected wording accepted](https://www.legifrance.gouv.fr/cnil/id/CNILTEXT000050791828)
- [CNIL English summary of the KASPR sanction (data scraping, EUR 240,000)](https://www.cnil.fr/en/data-scraping-kaspr-fined-eu240000)
- [CNIL, closure of the injunction issued against KASPR — confirms the corrected source disclosure was accepted](https://www.cnil.fr/en/closure-order-issued-against-kaspr)
- [CNIL référentiel relatif aux traitements de données à caractère personnel mis en oeuvre aux fins de gestion des activités commerciales — retention of prospect data limited to three years from collection or last contact](https://www.cnil.fr/sites/cnil/files/atoms/files/referentiel_traitements-donnees-caractere-personnel_gestion-activites-commerciales.pdf)
- [Polish DPA (UODO) v Bisnode Polska — first Polish GDPR fine (~PLN 943,000) for relying on a website notice instead of individual Article 14 notice for data compiled from public registers; Supreme Administrative Court dismissed the cassation appeal, upholding the decision](https://uodo.gov.pl/en/553/1572)
- [Norwegian Datatilsynet, 'Informasjon og åpenhet' — the controller must state what the source of each item of data is and whether it came from a publicly available source, within one month at the outer limit](https://www.datatilsynet.no/rettigheter-og-plikter/virksomhetenes-plikter/informasjon-og-apenhet/)
- [Danish Datatilsynet, Vejledning om direkte markedsføring (June 2023) — the legitimate-interest balancing must be documented in a detailed and transparent way so the controller can demonstrate it to the DPA; treatment of publicly available registers (CVR, Statstidende) in a marketing context](https://www.datatilsynet.dk/Media/638237218449834564/Vejledning%20om%20direkte%20markedsf%C3%B8ring.pdf)
- [Swedish IMY, right to information about how personal data are handled (Articles 13-14 as presented to data subjects in Sweden)](https://www.imy.se/privatperson/dataskydd/dina-rattigheter/ratt-till-information/)

> Caveat: This is research, not legal advice, and no lawyer-client relationship arises from it. It is prepared so that a qualified data protection lawyer (ideally Swedish-qualified, given Forj's establishment, with a view to CNIL and Datatilsynet practice in the FR/DK/NO shelves) can review and adopt or reject it.

Specific limits on what is asserted above:

1. The WP260 rev.01 quotations (the Annex row for Article 14(2)(f) and paragraphs 60, 61 and 64) and the EDPB right-of-access quotations (paragraphs 36 and 120, Example 21) were extracted verbatim from the official PDFs and are reliable. The two French sentences from CNIL SAN-2024-020 were read out of the published Légifrance text; the surrounding paragraph numbers (roughly 101-105) are as reported by that read and should be re-checked against the deliberation before being quoted in anything external.

2. The Bisnode decision is the POLISH DPA's (UODO) against Bisnode Polska, not the Swedish IMY's. Any internal note attributing it to Sweden is wrong and should be corrected before it reaches a partner DPO. The approximate fine figure (PLN 943,000 / ~EUR 220,000) and the Supreme Administrative Court outcome come from secondary reporting alongside the UODO page; verify the figure at source before external use.

3. Three questions are flagged in the answer but deliberately NOT decided here, because they are outside what the GDPR text and DPA decisions settle: (a) whether commercial reuse of a personal LinkedIn connections export is permitted by the LinkedIn User Agreement, which is a contract question, not a data protection one; (b) whether any given re-derivation was genuinely independent of an earlier acquisition, which is a factual audit question about the pipeline; (c) the lawful basis and consent position for email versus telephone contact in each of DK, NO, SE, FI, FR, UK and IE, which turns on national ePrivacy implementations and marketing statutes that this answer does not analyse.

4. The observation that the Article 14(3)(a) one-month window has already closed for legacy un-notified rows is a statement of the position as it appears from the facts given, not a conclusion about liability. Whether and how it is remediable, and what should be recorded about it, is precisely the kind of judgement to put to counsel rather than to settle internally.

5. Nothing here recommends erasure, and nothing here depends on erasure. The founder's decision that nothing will be deleted is treated as fixed, and every recommendation is compatible with full retention.


---

# DRAFT: public privacy notice

**DRAFT FOR LEGAL REVIEW. Not yet published, and not legal advice. This page copy has been prepared for review and sign-off by a qualified data protection lawyer before it goes live on forgeby.com.**

---

# Privacy notice for business contacts

**Last updated: [DATE] · Version 1.0**

If you have found this page because you received a message from someone using Forgeby, or because you were told your details are in our database, this page is for you. It explains what we hold, where it came from, why we hold it, and how to make it stop.

**If you want out, you do not need to read any further.** Go to **[forgeby.com/opt-out](https://forgeby.com/opt-out)**, enter your email address, and press the button. That is the whole process. No account, no login, no reason required, no reply needed from us. You can also write to **privacy@forgeby.com** and simply say "opt out". Either route is enough.

---

## 1. Who we are

Forgeby is operated by **Forj AB**, a company registered in Sweden.

| | |
|---|---|
| Controller | Forj AB |
| Registered number | [ORG NR TO CONFIRM] |
| Address | [REGISTERED ADDRESS], Gothenburg, Sweden |
| Email for anything on this page | **privacy@forgeby.com** |
| Data protection contact | [NAME / ROLE] |

Forj AB is the controller of the data described here. That means we decide what is held and why, and we are the people responsible for it.

## 2. What we hold

We hold business contact information about people in professional roles. For most people in our database, that is:

- name
- job title
- the organisation you work for
- a business email address
- in some cases, a business telephone number
- in some cases, a link to your public professional profile
- information about your employer's business and its publicly visible technology, which is about the company rather than about you

We do not hold, and do not want, your home address, your personal email, your date of birth, your financial details, or anything about your health, beliefs, politics, trade union membership or private life. We do not build profiles of you as an individual. Where we analyse anything, we analyse the company.

## 3. Where it came from

We are required to tell you the sources our data comes from. There are four categories, and we use all four:

**Official business registers.** National company registers operated by governments in Europe and the United Kingdom publish information about companies and, in some countries, about their directors and officers. These registers are publicly accessible by law.

**Commercial B2B data providers.** We license business contact data from established data companies under commercial contracts. These providers collect data from their own sources and are responsible for their own compliance.

**Public web search results.** Some records were built from information published openly on the public internet, such as a company's own website or a public professional listing. This is information that was already public at the time we saw it.

**Our founder's own professional network.** A small number of records come from the personal professional connections of Forj's founder, exported by him from his own account on a professional network. These are people he is genuinely connected to. This is not a public source, and we treat it separately and more carefully than the other three.

Some records also contain a business email address that no supplier gave us. We worked it out from the standard email format used by the company, and then checked with a verification service that the address exists. Where that is the case, the source is us.

**If you want to know which of these your own record came from, ask.** Email privacy@forgeby.com and we will tell you the specific source for your record, and the date we recorded it, to the extent we hold that information. For some older records we can tell you the source but not the exact date it was collected, because that date was not recorded at the time. We are fixing that going forward, and we will not invent a date we do not have.

## 4. Why we hold it, and on what legal basis

**The purpose.** Forgeby helps technology firms in Europe that are partners of Amazon Web Services find organisations that are a genuine fit for a specific, funded AWS programme, and reach the right person there. We measure a company's publicly visible technology, work out whether a particular programme actually applies to it, and identify who at that company would be the right person to talk to. A partner then decides whether to get in touch.

**The legal basis is Article 6(1)(f) of the GDPR, legitimate interests.** The interests we rely on are:

- our own commercial interest in operating this service, and
- the interest of the AWS partner firms we work with in reaching, by a professional channel, the people who hold the relevant responsibility at organisations that are a genuine fit for what they offer.

We assessed those interests against your rights before we started, and we keep that assessment written down and under review. If you would like to understand our reasoning, ask us and we will explain it.

Some things we deliberately do not do, because they affect the balance:

- We never send bulk email. Every message is written for one person and sent by a named human from their own mailbox, one at a time.
- We do not use tracking pixels or cross site tracking on this data.
- We do not sell our database.
- Where the country you work in requires prior consent for commercial email, we do not send you commercial email. In those countries we use other channels or we do not make contact at all.
- Where a public register records that a business does not want marketing approaches, we honour that flag.
- Where we cannot confirm that a contact detail belongs to the right person, we do not pass it on.

## 5. Who receives it

**The AWS partner firm.** When a partner is working on a specific opportunity, the relevant contact details and a short briefing about the company are made available to that partner inside their own workspace on our platform. Each partner sees only what relates to their own opportunities. Partners are contractually bound as to what they may do with it, and a partner who receives your objection is required to pass it to us.

**Our service providers.** We use ordinary business suppliers such as cloud hosting, database and email infrastructure, and data verification services. They act on our instructions under written contracts.

**Nobody else.** We do not sell personal data, we do not rent it, and we do not publish it.

Our infrastructure is hosted in the European Union. Where any processing involves a transfer outside the EEA, we rely on the safeguards required by Chapter V of the GDPR, and we will tell you which ones if you ask.

## 6. How long we keep it

- **Contact records:** kept while the record remains relevant to the purpose above, and reviewed at least every **three years**. Records that have gone stale are removed from active use.
- **Records you have objected to:** we stop using your data for outreach immediately. We keep the minimum needed to make sure your objection is honoured and cannot be undone by a later data import, which is normally your email address, the date, and the scope of your objection. That suppression record is kept indefinitely, because it is the only way to guarantee that you stay out. It is never used to contact you.
- **Records we are required to keep** for legal, accounting or evidential reasons are kept for as long as that requirement lasts.

## 7. Your rights

You have all of the following. They are free, and we will answer within one month.

**The right to object to direct marketing (Article 21(2)).** This is the important one. You can object at any time. You do not have to give a reason, we cannot weigh it against our own interests, and there is nothing for us to consider. If you object, we stop. Use **[forgeby.com/opt-out](https://forgeby.com/opt-out)** or email privacy@forgeby.com.

**The right of access (Article 15).** Ask us for a copy of everything we hold about you, including the specific source of your record.

**The right to rectification (Article 16).** If something is wrong or out of date, tell us and we will correct it.

**The right to erasure (Article 17).** Ask us to delete your record and we will, unless we are legally required to keep something. Note that deletion is different from objecting. If we delete you entirely, a future data import could in principle bring you back, whereas a suppression record cannot. We will explain the difference and let you choose.

**The right to restriction (Article 18).** Ask us to freeze processing while a dispute is resolved.

**The right to data portability (Article 20)**, where it applies.

**The right to object on other grounds (Article 21(1)).** You can object to our processing generally, on grounds relating to your situation.

**The right not to be subject to automated decisions (Article 22).** We do not make decisions about you by automated means that produce legal effects for you or similarly significantly affect you. Our scoring is applied to companies, not to individuals.

**The right to complain.** You can complain to your national data protection authority at any time. Our lead authority is the Swedish Authority for Privacy Protection, IMY ([imy.se](https://www.imy.se)). You can also complain to the authority where you live or work.

**How to use any of them:** email **privacy@forgeby.com**. Tell us what you want. We do not require you to prove your identity unless we have a genuine reason to doubt it, and for a simple opt out we will never ask.

## 8. Changes to this notice

If we change this notice we will update the date at the top and keep the previous versions available on request.

---

*Forj AB, Gothenburg, Sweden. Questions: privacy@forgeby.com*

---

<!--
REVIEWER NOTES, TO BE DELETED BEFORE PUBLICATION

Items to confirm before this page goes live:

1. Forj AB registered number and registered address. A number appears in internal
   records (559019-9161) tied to a pending company rename; confirm the current
   correct entity and number with Bolagsverket before publishing.
2. Whether a DPO is designated under Art 37. If not, record why. Section 1 has a
   placeholder for a named contact either way.
3. privacy@forgeby.com and forgeby.com/opt-out must both exist and work before this
   page is live. The opt-out form must write to the suppression store, which must be
   enforced at IMPORT time, not only at send time. Today that table exists but nothing
   writes to it. Publishing this page before that is wired makes a written promise we
   cannot keep.
4. The three-year retention figure in section 6 is drawn from CNIL's commercial
   activities reference framework. Confirm it is the figure we actually want to be
   held to, and that a review process exists to enforce it.
5. Section 5 states each partner sees only their own opportunities. Confirm this is
   true in the tenant model as built.
6. Section 4's list of things we do not do is a set of public commitments. Each one
   must be enforced in code, not policy, before it is published.
7. Counsel should advise on whether the Art 14(2)(f) source disclosure at category
   level in section 3 is sufficient given CNIL SAN-2024-020, where unnamed categories
   were held inadequate and named ones accepted. The per-record disclosure offer at
   the end of section 3 is the intended bridge.
8. This notice addresses transparency prospectively. It does not cure the Art 14(3)(a)
   one-month window for records already held and never notified. That gap should be
   documented and dated separately, not implied to be closed by this page.
-->


---

# DRAFT: Vainu licence letter

**Subject:** Putting our data use in writing (one line back is plenty)

---

Hi [First name],

Short one. We have been building on the understanding you gave me verbally, and I would like it on the record so neither of us is relying on memory a year from now.

What we actually do with Vainu data: we hold company and decision-maker records inside our own platform, combine them with our registry-derived and technically measured data, and use the result to identify and prioritise target accounts for AWS partners. We generate derived outputs from that (fit scores, account dossiers). When a partner is working an account, we surface the relevant decision-maker's details to that partner so one of their own people can make contact personally. We do not send bulk email and we do not resell the data as data.

Could you confirm, or correct, that the following is covered by our arrangement:

1. Internal use within our platform
2. Enrichment and combination with our own registry data
3. Derived works: scores, dossiers, prioritisation
4. Disclosure of individual contact details to our partner customers, for their own outreach

And is there attribution you would like us to carry?

If part of that sits outside what we have agreed, just tell me which part and what the right shape is. A call is fine too if that is quicker than writing it out.

Thanks,
Jacob Ahmid
Forj, Gothenburg

---

**Note to Jacob:** A good reply names the four items or says "yes, all four confirmed" and answers the attribution question; save it with full headers, and if it is verbal-only, follow up with "just to record our call: you confirmed 1 to 4" and let silence be corroboration rather than the record itself. If the answer is narrower, the likely cut is item 4 (onward disclosure), in which case ask for a written carve-out or a per-partner sublicence rather than arguing, and flag internally that Vainu-sourced contacts may need a display-only or partner-request-triggered route until it is resolved.

*This is preparation for a lawyer to review, not legal advice.*


---

# DRAFT: Rune's first-touch notice line

**NOT LEGAL ADVICE.** Draft copy prepared for review by a Swedish-qualified data protection lawyer. Wording that has already been fined (KASPR, "public sources and our partners") is avoided deliberately; the source categories below still need to be checked against what the source register actually says per cohort.

---

# The Article 14 notice line

Three variants. All are designed to sit **below a horizontal rule, after the signature, in the same typeface as the body** (not smaller, not grey). Article 21(4) requires the objection right to be "presented clearly and separately from any other information", so the rule and the line break are load-bearing, not decoration. Never fold this into the signature block.

Tokens in `{}` are filled by the send path. `{partner}` is the sending company's legal name. `{stop}` is an opaque per-recipient token URL, never an email address in a query string.

---

## A. Minimal (one sentence)

> ---
> Where I got your details: your name, role and work email came from Forgeby, a business contact service run by Forj AB in Gothenburg that builds its records from public company registers, licensed business data providers and public web pages. One click and neither of us contacts you again: {stop} | What we hold and why: {notice}

**Satisfies:** Art 14(2)(f) source at named-category level (this is the KASPR-corrected shape: named categories, not "public sources"). Art 14(1)(a) controller identity for Forj. Layered delivery of the rest via the link (WP260 permits layering in a digital context). Art 21(4) objection route, separated. Swedish MFL 20 § opt-out address.

**Does not satisfy:** does not name `{partner}` as a holder of the data, so a recipient cannot tell that stopping Forgeby also stops the sender, or who to ask under Art 15. Does not signal that two organisations are involved at all, which is exactly the fact most likely to surprise the recipient and therefore the fact WP260 says belongs in the first layer. **Use only where the sending rep is Forj itself.**

---

## B. Standard (two sentences) — RECOMMENDED

> ---
> Where I got your details: your name, role and work address came from Forgeby, a business contact service run by Forj AB in Gothenburg that builds its records from public company registers, licensed business data providers and public web pages, and both {partner} and Forj hold a copy. You can see exactly what we hold and where this record came from at {notice}, and stop all contact from both of us with one click at {stop}, no reason needed.

**Satisfies:** everything in A, plus the two-organisation fact stated in the first layer; a single objection route that visibly binds both parties (which is what Art 21(3) requires in substance and what a multi-tenant architecture will otherwise defeat); "no reason needed" reflects EDPB Guidelines 1/2024 §122, the unconditional right, and reads as courtesy rather than law; "where this record came from" promises the per-record Art 15(1)(g) answer without cluttering the line with it.

**Does not satisfy:** purpose and legal basis (Art 14(1)(c)) are carried by the link and by the body of the email, not by the line. That is acceptable layering **only if the message body actually says why this person's company was selected**. Make that a hard rule in Rune's drafting: no draft ships with a notice line unless the body states the selection reason. Retention (Art 14(2)(a)) and the full rights list sit behind the link. Does not name the specific source for this record.

---

## C. Cautious (four sentences, deliberately over the limit)

> ---
> Where I got your details: your name, role and work address at {company} came from Forgeby, a business contact service run by Forj AB in Gothenburg. This particular record came from {source_sentence}. Both {partner} and Forj hold a copy, and you can object at any time, for any reason or none, and we will stop: one click at {stop}, or just reply to this message and say so. What we hold, how long we keep it and your other rights are at {notice}.

`{source_sentence}` is generated per record from the source register, e.g. "the Danish Central Business Register (CVR)", "a licensed Swedish business data provider", "a public web page listing your role", "Forj's founder's own LinkedIn connections, exported from his own account".

**Satisfies:** per-record source disclosure in the first layer, which is above the required standard. Reply-to as a second objection channel, which is belt-and-braces for MFL 20 § ("a valid address to which the recipient can send a request that the marketing cease" reads more naturally as an address than a URL). Explicit unconditionality.

**Does not satisfy:** the founder test. It is four sentences and it will get cut. **Reserve it for the cohorts where the source is the story**: the 2,468 `linkedin-network` rows (if counsel ever clears them for outreach at all) and the 20,160 `serper-lead` rows, where Forgeby is unambiguously the originating controller and no upstream vendor ever notified anyone.

---

## Recommendation: B, with C reserved by cohort

B is the right default for three reasons.

1. **It puts the surprising fact in the first layer.** The recipient's actual question is not "which register" but "why do two companies have my details". B answers it in the same breath as the source, which is what makes it read as a courtesy rather than a disclaimer.
2. **It solves the controller-relationship problem without pretending to have solved it legally.** B states a *fact* ("both {partner} and Forj hold a copy") rather than a *characterisation* ("we are joint controllers" / "Forj is our processor"). The Art 26 analysis is genuinely open and belongs to counsel; the notice line must not pre-commit you to an answer that turns out to be wrong. A factual statement is accurate under either outcome.
3. **One objection route, binding both.** If the line offered "unsubscribe from {partner}" the recipient would have to object twice, and the second objection would never arrive. B's single link is the only version where Art 21(3) is actually deliverable.

**Three build constraints that come with it.** The line is worthless without them and should be treated as part of the same ticket.

- `{stop}` must write to `email_suppression` (currently 0 rows, nothing writes to it) at **import** time as well as send time, keyed on normalised email plus name+domain, and must propagate to every partner tenant. An opt-out link that suppresses nothing is worse than no link.
- `{notice}` must be a stable URL that names each source by its real name. If it says "public sources and our partners" it is the exact sentence CNIL fined.
- `{stop}` carries an opaque token. No email address, no name, no company in the query string.

**Where the line does not help.** It discharges Art 14 at first communication. It does not make the send lawful under national marketing law. Denmark is email-prohibited under MFL § 10 regardless of how good the notice is, and CVR § 19 reklamebeskyttelse closes the phone too for that cohort. Norwegian named work addresses need consent under mfl. § 15. Treat Finnish named addresses as opt-in pending Finnish advice. The notice line is a gate on the send path, not a licence.

---

## Swedish, variant B

> ---
> Var jag fick dina uppgifter: ditt namn, din roll och din e-postadress på jobbet kommer från Forgeby, en tjänst för företagskontaktuppgifter som drivs av Forj AB i Göteborg och som bygger sina uppgifter på offentliga företagsregister, licensierade företagsdatakällor och offentliga webbsidor. Både {partner} och Forj har en kopia. Du kan se exakt vad vi har och varifrån uppgiften kommer på {notice}, och stoppa all kontakt från oss båda med ett klick på {stop}, utan att behöva ange något skäl.

Notes on the Swedish. It runs to three sentences rather than two: keeping "Både {partner} och Forj har en kopia" as its own clause inside the first sentence made it unreadable in Swedish. The break is the better trade and does not weaken anything.

For Sweden specifically, add the reply route from variant C as a fourth clause if counsel wants MFL 20 § belt-and-braces: `eller svara på det här mejlet och skriv "nej tack"`. My read is that a working one-click URL is a valid address for 20 § purposes, but the reply option costs one clause and removes the argument entirely.

Do not translate `{source_sentence}` mechanically if you move to variant C in Swedish. Register names take their own local form: "Bolagsverkets register", "det danska CVR-registret". KASPR was penalised in part for notifying in English, so the whole line, links included, follows the recipient's language. If the destination page at `{notice}` is English-only, the Swedish line is only half a notice.