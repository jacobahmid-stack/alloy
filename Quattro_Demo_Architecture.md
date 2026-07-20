# Quattro web demo — architecture & first-build scope

## Two modes
1. **Sandbox (the web demo).** Runs on **Alto-hosted sample data** shaped to the fastAPI / Fi2 entity model. No customer credentials, no security review — self-serve and shareable by link. Anyone in Swedish property management recognises the data, because it's the industry-standard model.
2. **Live (the customer).** Quattro connects to the customer's real property system over **OAuth2**, in the **customer's own environment**. **Read-only first** (fast security clearance), then read-write.

## The connector — build to fastAPI, not per-system
- **fastAPI** = the standard from **Sveriges Allmännytta**, governed/certified by **BIM Alliance**, built on **Fi2 / fi2xml**. **Vitec, Momentum and Fast2 all support it.**
- One client covers the 7 Fi2 entities: `Fi2Partner` (tenant/partner), `Fi2LeaseContract`, `Fi2Property`, `Fi2Structure`, `Fi2SpatiSystem`, `Fi2Space`, `Fi2Equipment`. **Read + write (CRUD).**
- **Build once → reach the big-3.** Drop to each system's richer API (Vitec Arena/Ekonomi, Momentum's modules) only where you need depth (economy/ERP, heavy queries).

## The economy side — Fortnox + Visma
fastAPI covers the **property** data; the **money** lives in the accounting systems. Connect those directly:
- **Fortnox** — Sweden's #1 accounting system (500k+ customers), **open API**, huge pre-built integration ecosystem. The easiest first economy connector.
- **Visma** (eEkonomi etc.) — the other leader, API-rich.
- They already integrate with the property systems, so the flows and field mappings are established. **Decide the source of truth per data type:** contract & rent terms from the **property system**; invoices, ledger and paid/overdue from the **accounting system**. No double answers.
- For the largest companies, add an enterprise-ERP connector later (Visma enterprise tier, Unit4/Agresso).

**The connector set:** fastAPI (property) + Fortnox + Visma (economy) + Teams/Slack (channels) ≈ covers most Swedish property companies. Build the Fortnox connector alongside the fastAPI one (both are OAuth2/JSON).

## First build target: Momentum
- **OAuth2** (client-credentials / PKCE), **JSON**, REST **+ GraphQL**. **fastAPI-1.0-certified.**
- Modules map straight to the use case: **Customers** (tenants), **Errands** (felanmälan), **Payment**, **Bookings**, **Market**, **Signings**.
- Docs: `docs.momentum.se/fastighet-api/fastAPI/`.
- Test the **open self-serve "connect your own"** against **Pigello** (open API + developer portal) — the most developer-friendly of the lot.

## The use case (the wow)
*"What's the status of the case for the tenant at Storgatan 4?"* → Quattro reads `Partner` + `LeaseContract` + `Errand` + `Payment` over fastAPI → answers in Teams → *"mark it resolved and log a note"* → writes back via `Errand`. **One question, four entities, no system switching.**

## Certification
- **BIM Alliance** governs fastAPI certification. It certifies the **API calls** to/from a product — *not* the product's functionality.
- **Third-party services can be certified** (precedents: **AktivBo, Vixinity**), so **Quattro / Alto can get the stamp.** Strong credibility in *allmännyttan* — the segment that owns the standard.

## Channels
- **Microsoft Teams first** (Swedish property companies are Microsoft shops). Slack second.

## Security model
- Sandbox: sample data only — no risk.
- Live: OAuth2; runs in the customer's environment; data stays put; **read-only first**. Sveriges Allmännytta themselves flag that fastAPI "opens the system to read and change customer data — security is the biggest risk", so lead with read-only + the customer's own environment.

## Honest gaps / to verify
- fastAPI is the **property side** and is "best for simpler, standardized, smaller-data" calls. Economy/ERP depth + heavy queries → each system's richer API.
- Pull the full **work-package endpoint spec** from fastAPI.se / BIM Alliance (the Sveriges Allmännytta overview page didn't enumerate them).
- Get **Momentum developer credentials** to build and test the first client.

## Build order
1. **fastAPI / Fi2 client** (7 entities, OAuth2, CRUD) — test against Momentum.
2. **Sample Fi2 dataset** (Alto-hosted) for the sandbox.
3. **Teams app** + the question → answer → act loop on one use case (the tenant case).
4. **Open self-serve connect** for Pigello / Momentum.
5. **BIM Alliance fastAPI certification.**

---
*Sources: Sveriges Allmännytta (fastAPI), BIM Alliance (certification + fi2xml), Vitec / Momentum / Pigello API docs, the Vitec–Momentum–Fast2 standardisation collaboration.*
