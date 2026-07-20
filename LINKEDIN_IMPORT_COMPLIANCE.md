# LinkedIn connections import — lawful-basis record

**Date:** 2026-07-17. **Authorised by:** Jacob Ahmid, explicit consent in-session ("I am okay with this ... it's necessary").

## What was processed
2,622 of Jacob's first-degree LinkedIn connections imported into `public.contacts`, tagged `source='linkedin-network'`, `status='Ej kontaktad'` (not contacted). Fields: first name, last name, title, LinkedIn profile URL, company name, and email **where the connection chose to make it exportable** (61 of 2,622). 583 were linked to an existing library account (`company_id`); the rest carry `company_name` only.

## Source — NOT scraping
The data comes from **Jacob's own LinkedIn data export (GDPR Article 20 data portability)**, downloaded by the account holder. This is categorically different from scraping third-party LinkedIn profiles, which Forj never does (the never-scrape rule stands). No LinkedIn ToS-restricted collection occurred.

## Lawful basis (GDPR Art 6(1)(f) — legitimate interest)
- **Data:** professional B2B contact data (work role, employer, business profile), not special-category data.
- **Relationship:** every record is a first-degree connection — a mutually accepted professional link — so processing is within the data subjects' reasonable expectation.
- **Purpose:** identifying warm relationship paths to companies already in Forj's B2B sales-intelligence library. Minimal, proportionate, professional.
- **Balancing:** low impact on the individuals; no profiling of private life; standard B2B sales-intelligence use, same posture as the licensed Vainu/Explorium contacts already held.

## Art 13/14 & data-subject rights
Transparency is met via the existing forj.se privacy notice + "How we read companies" pages + the DPA/sub-processor list. Data-subject requests (access, objection, erasure) are honoured. **One-command erasure:** `delete from public.contacts where source='linkedin-network';` — the source tag makes the whole cohort isolatable and deletable.

## Purpose limitation — IMPORTANT
These contacts are a **reference / warm-path layer ONLY**. They are NOT enrolled in any automated outreach. The standing rules hold without exception: **humans send everything, no mass email, Smith only drafts, outreach is per-account and human-initiated.** The `status='Ej kontaktad'` default and the `source` tag keep them distinguishable from any engaged pipeline. No `linkedin-network` contact enters a send flow without Jacob's per-account decision.

## Retention
Reviewed with the rest of the `contacts` store under the standard retention policy; the source tag allows targeted review or purge at any time.
