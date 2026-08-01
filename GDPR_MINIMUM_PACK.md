# The minimum GDPR pack

Prepared 2026-08-01. **Not legal advice.** This is the smallest set of documents and controls that
puts Zmart Com West AB (trading as Forgeby) in a defensible position on the contact library, written for a Swedish-qualified
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
| Controller | **Zmart Com West AB**, org. nr 559019-9161, Gothenburg, Sweden. Trades as Forgeby. Registered-name change to **Forgeby AB** in progress. |
| ✅ Name confirmed | Jacob confirmed 2026-08-01: the register says **Zmart Com West AB**; the rename in flight is to **Forgeby AB**, NOT Forj AB as older repo notes assumed. The notice names the registered entity and states the pending change, so it stays true on both sides of the rename. |
| Contact | privacy@forj.se |
| Processing activity | Identification and prioritisation of business accounts for technology partners, and provision of business contact details to those partners for their own direct outreach |
| Categories of data subject | Employees in professional decision-making roles at companies in the library |
| Categories of personal data | Name, job title, employer, business email, business phone (some), public professional profile URL (some) |
| Special categories | **None.** Not collected, not inferred, not wanted. |
| Lawful basis | Article 6(1)(f) legitimate interests. LIA at section 2. |
| Recipients | Partner customers of Forgeby, who receive contact details for accounts they are working and become controllers of their own copy |
| Third-country transfers | **Yes.** AI inference to **Anthropic PBC (United States)** under Standard Contractual Clauses, in three cases established from the deployed proxy code on 2026-08-01: tasks needing live web search (Bedrock does not offer it), streamed responses (`claude-proxy` line 919: Bedrock streaming is pending, so streamed calls use the Anthropic API), and fallback when the EU route is unavailable (line 1042 logs `anthropic-fallback`). Default non-streaming inference runs on Amazon Bedrock EU (`eu.anthropic.*` profiles, eu-north-1). All storage is EU (Stockholm). No customer records are stored in the US. |
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
have no prior relationship with the controller, and asking for consent would itself require processing the
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
| 5 | **Public Article 14 notice.** The Article 14(5)(b) compensating measure. | **LIVE** at forgeby.com/notice.html, indexable, linked from the footer and from every outreach message. A compensating measure that cannot be found is not one, so `noindex` was removed deliberately. |
| 6 | **Article 21(4) notice at first contact.** | **BUILT.** `article14Notice()` in `src/bdr.js`: named source categories (never "public sources", the wording CNIL fined KASPR over), the registered controller, the partner named alongside Forgeby so objecting to one cannot leave the other holding the data, the notice URL, the objection route, and "no reason needed". Separated by a rule per Art 21(4). Appended in `draftOutreach` AFTER the critic, because the critic would trim a legal footer it read as clutter, and onto `alt_body` too, which is the variant a footer would otherwise be dropped from. `draftCarriesNotice()` is a hard boolean, not a warning. Swedish only for SE recipients; English elsewhere, since a Swedish footer on a Danish message is the KASPR mistake. 10 compliance tests. |
| 7 | **No bulk email.** One-to-one, human-sent, from the sender's own mailbox. | In force by product design. |
| 8 | **No special categories.** | In force. Not collected, not inferred. |

---

## 4. Residency and sub-processors: RESOLVED 2026-08-01

**Data residency: settled from the code, not from a percentage.** A percentage was the wrong
instrument. What the RoPA needs is whether transfers occur and under what mechanism, and the
deployed `claude-proxy` answers that unambiguously: streamed calls always use the Anthropic API
(line 919), non-streaming falls back to it (line 1042 logs `anthropic-fallback`), and only the
public free-read tier is EU-only with no fallback (line 142). So transfers DO occur, and the honest
line is the one now in the RoPA above. Storage is genuinely EU-only.

**Sub-processors: the earlier claim was wrong and is withdrawn.** The competitive review asserted the
live sub-processor table omits the primary AI sub-processor. It does not. `dpa.html` names
**Anthropic PBC**, discloses the US transfer and cites Standard Contractual Clauses. The real defect
was narrower: both `dpa.html` and `trust.html` said the US transfer was ONLY for live web search,
which understated it. Corrected 2026-08-01 to name all three cases.

**A third correction, on the public site.** `trust.html` claimed "nothing is LinkedIn-derived" and
carried a "Never LinkedIn-derived" badge. That was false: the founder's own 2,616-contact network
export is LinkedIn-derived, lawfully. Now reads "no LinkedIn-derived data is bought from anyone"
with the exception stated plainly. The true claim is about *how it was obtained*, never a blanket
never.

**Superseded note, kept for the record.** `CLAUDE.md` records a real incident on 2026-07-20 in which
a stale read produced an EU-residency claim while live measurement showed 91.7% of inference going
to the US API. Do not
write a residency line into the RoPA, the notice, or any public copy until it is measured again.
Third-country transfers are a RoPA field and a notice field, so this blocks both.

**Sub-processors.** The competitive review flagged that the live sub-processor table omits the
primary AI sub-processor. A sub-processor list that is missing an entry is worse than no list,
because it is a published statement that is untrue.

---

## 4b. FOUNDER DECISION, recorded under Article 5(2)

**Decision: rely on Article 14(5)(b) disproportionate effort. Do not run a retrospective notice
campaign to the 44,477 contacts holding a deliverable email address.**

Decided by: Jacob Ahmid, founder and controller representative. Date: 2026-08-01. Stated as "relying
on Art 14(5)(b) 100%, my decision."

Reasoning of record:
- The library is assembled substantially from official public business registers, which is the
  archetypal case the provision contemplates.
- The compensating measure the provision itself requires is in force: the public notice is live,
  indexable and linked, and it carries the source categories, the lawful basis and a working
  objection route.
- Every person reached is given the Article 14 information at first contact regardless, because the
  notice block is appended to every draft and the send path checks for it. So the exemption is
  relied on only for people who are never contacted.
- Contacting 44,477 people who have not been contacted, solely to tell them they are in a database,
  would itself be a large unsolicited mailing to people who have shown no interest.

Known counter-argument, recorded rather than hidden: EDPB guidance treats 14(5)(b) as narrow, and
the one-month clock in 14(3)(a) has expired for the historic rows. This decision accepts that
residual risk knowingly. Revisit if a complaint is received or if counsel advises otherwise.

---

## 5. What is Jacob's, and in what order

1. ~~Confirm the registered company name.~~ **Done: Zmart Com West AB, becoming Forgeby AB.** Re-check the notice when the rename completes.
2. ~~Send the Vainu letter.~~ **Done 2026-08-01, confirmed by Jacob.** Store the reply with full headers.
3. **Optional: have counsel review this pack.** The floor is built and live. Two positions remain judgment calls rather than settled facts: the Art 6(1)(f) balance, and relying on Art 14(5)(b) instead of notifying 44,477 people. A lawyer's sign-off converts "we decided" into "we took advice", which is a different conversation with IMY. Not a blocker.
4. **Decide the residency question** so section 4 can close.

Everything else on this page is built or is Claude's next code change.
