# The minimum GDPR pack

Prepared 2026-08-01. **Not legal advice.** This is the smallest set of documents and controls that
puts Forj AB in a defensible position on the Forgeby contact library, written for a Swedish-qualified
data protection lawyer to review and sign. IMY is the lead authority.

The instruction this was written to: *minimum possible legal way forward, GDPR and ISO as north
stars.* So everything here is the floor, not best practice. Where a maximal option was rejected, the
rejection is recorded with a reason, because "we considered it and chose otherwise" is itself an
accountability artefact under Article 5(2), while silence is not.

---

## What is deliberately NOT being done

| Rejected | Why |
| --- | --- |
| A retrospective notice email to 44,477 people | Article 14(5)(b) disproportionate effort, with the public notice as the compensating measure required by that same provision. Standard position for a B2B library assembled largely from public registers. Revisit only if counsel disagrees or a complaint lands. |
| Per-record source URLs at document granularity | Article 14(2)(f) is satisfied at named-category level. WP260 supports layering. Per-record answers are available on request instead, which is what Article 15(1)(g) actually asks for. |
| A DPO appointment | Not mandatory on these facts (Article 37). Revisit at scale or if the processing profile changes. |
| Reconstructing `collected_at` for the 77,031 historic rows | Cannot be done truthfully. `provenance_note` records that the date was never captured and forbids presenting the documentation date as a collection date. An honest gap beats a fabricated field. |
| ISO 27001 certification | Certification is a commercial decision, not a legal requirement. The controls below are aligned to it so certification later is a paperwork exercise, not a rebuild. |

---

## 1. Record of Processing Activities (Article 30)

Also serves ISO 27001 A.5.34. This is the one document a regulator asks for first.

| Field | Entry |
| --- | --- |
| Controller | Forj AB, org. nr 559019-9161, Gothenburg, Sweden |
| ⚠️ Name check | `NOMINET_UK_EMAIL.md` records the company as still registered under the former name **Zmart Com West AB**, rename in progress. **Confirm before the notice is published.** The controller must be named as the register names it. |
| Contact | privacy@forj.se |
| Processing activity | Identification and prioritisation of business accounts for technology partners, and provision of business contact details to those partners for their own direct outreach |
| Categories of data subject | Employees in professional decision-making roles at companies in the library |
| Categories of personal data | Name, job title, employer, business email, business phone (some), public professional profile URL (some) |
| Special categories | **None.** Not collected, not inferred, not wanted. |
| Lawful basis | Article 6(1)(f) legitimate interests. LIA at section 2. |
| Recipients | Partner customers of Forgeby, who receive contact details for accounts they are working and become controllers of their own copy |
| Third-country transfers | To confirm. See the residency note at section 4; this line must not be written until measured. |
| Retention | While professionally relevant, reviewed periodically. On objection, only the minimum needed to prevent re-addition. |
| Security measures | Section 3 |
| Sources | Official business registers; licensed B2B data providers; public web pages; the founder's own professional-network export |

**Volumes as at 2026-08-01:** 104,240 contact records, of which 44,477 carry a deliverable email
address. 103,105 (98.9%) have a recorded source category and source URL.

---

## 2. Legitimate Interests Assessment (Article 6(1)(f))

The three-part test. Keep it short; a long LIA is not a better LIA.

**Purpose test.** The interest is operating a business-to-business service that connects technology
suppliers with organisations plausibly in need of what they supply. It is a real, present, lawful
commercial interest, and it is also in the interest of the recipient companies, which is what makes
the balance tractable.

**Necessity test.** The processing is limited to professional identity in a professional context:
who holds which role at which company. Consent is not a workable basis because the people concerned
have no prior relationship with Forj AB, and asking for consent would itself require processing the
same data. No less intrusive route achieves the purpose.

**Balancing test.**

| Weighs toward the interest | Weighs toward the individual |
| --- | --- |
| Business contact data only; nothing about private life | The person did not provide the data and may not expect to be in the database |
| The person is contacted about their professional role, in that role | Contact is unsolicited |
| Contact is one-to-one from a named human, never bulk mail | Data was in part obtained from commercial providers rather than the person |
| An unconditional objection route is published and enforced in the database | |
| No special categories, no profiling of the individual, no automated decisions with legal effect | |
| Sources are documented per record and disclosable on request | |

**Conclusion.** The interest is not overridden, provided the safeguards in section 3 remain in force.
The safeguards are the reason the balance holds, so if any of them lapses this assessment expires
with it.

**Review trigger.** Any of: a change of lawful basis, a complaint to a supervisory authority, a
material change in sourcing, or the addition of any special-category or non-professional data.

---

## 3. The safeguards the balance depends on

These are the controls, and they are load-bearing for section 2.

| # | Control | State |
| --- | --- | --- |
| 1 | **Unconditional objection route.** Published, no reason required, no account needed. | Built. `email_suppression` + a `BEFORE INSERT OR UPDATE` trigger on `contacts` that strips email and phone and sets `status='suppressed'`. Proven end to end 2026-08-01. |
| 2 | **The objection survives re-import.** | Built. The trigger runs on the way in, so a later bulk load cannot resurrect a suppressed person. It neutralises rather than raising an error, deliberately: a hard failure would break loaders and invite someone to disable the trigger. |
| 3 | **Provenance per record.** Every row can name its source category and URL. | Built. 98.9%. `source_category`, `source_url`, `provenance_note`, `email_independently_derived`. |
| 4 | **Honest dating.** Where the collection date was never captured, the record says so. | Built. `provenance_note` forbids presenting the documentation date as a collection date. |
| 5 | **Public Article 14 notice.** The Article 14(5)(b) compensating measure. | Page built (`alloy-landing/notice.html`), `noindex`, unlinked. **Blocked on: the company-name check and legal sign-off.** |
| 6 | **Article 21(4) notice at first contact.** The objection right stated clearly and separately in every first-touch message. | **Not built.** Next code change. Article 21(4) is not subject to any Article 14(5) exemption, so this one cannot be traded away. |
| 7 | **No bulk email.** One-to-one, human-sent, from the sender's own mailbox. | In force by product design. |
| 8 | **No special categories.** | In force. Not collected, not inferred. |

---

## 4. Two things that must be measured before they are claimed

**Data residency.** `CLAUDE.md` records a real incident on 2026-07-20 in which a stale read produced
an EU-residency claim while live measurement showed 91.7% of inference going to the US API. Do not
write a residency line into the RoPA, the notice, or any public copy until it is measured again.
Third-country transfers are a RoPA field and a notice field, so this blocks both.

**Sub-processors.** The competitive review flagged that the live sub-processor table omits the
primary AI sub-processor. A sub-processor list that is missing an entry is worse than no list,
because it is a published statement that is untrue.

---

## 5. What is Jacob's, and in what order

1. **Confirm the registered company name** (Forj AB or still Zmart Com West AB). One lookup. Blocks the notice.
2. **Send the Vainu letter** (`VAINU_LETTER.md`). Converts a verbal understanding into a written permission.
3. **Get counsel to review this pack and the notice.** Swedish, GDPR, ideally with B2B data experience.
4. **Decide the residency question** so section 4 can close.

Everything else on this page is built or is Claude's next code change.
