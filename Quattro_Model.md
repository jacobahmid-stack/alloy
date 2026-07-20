# Quattro — the self-serve funnel + commercial model

**Thesis.** Buyers now consume tweakable products, not custom projects. Quattro scales by letting customers *self-serve the believing* (try → connect → validate on their own systems) and staying *high-touch at the money moment* (production go-live into their own environment, AWS-first; uppstart MAP-funded on AWS case-by-case). Self-serve the dev/test layer; assist the production cutover. Never try to self-serve the cutover — that is the credential/security wall.

---

## The three stages

### 1 · Sandbox — *Try*  (live: forj.se/quattro)
- Instant interactive demo on Alto-hosted **sample Fi2 data**. No signup, no credentials.
- Proves the **concept**: ask-and-act across property (fastAPI) + economy (Fortnox / Visma), with the autonomy dial + audit log.
- **Price: free.** Marginal cost to Alto ≈ 0. Pure top-of-funnel marketing.

### 2 · Developer workspace — *Build & prove*  (the scale layer)
- Self-serve signup → **"Connect a system"** → guided OAuth to the customer's **test / sandbox** endpoints (Momentum, Fast2, Fortnox, Visma).
- Quattro auto-maps the Fi2 + economy entities; the customer runs **pre-built templates** (tenant case, invoice match, budget variance) against *their own* data, in Teams / Slack.
- It is a **self-serve POC** — far stronger proof than sample data.
- **Who:** the customer's IT / an integration partner (the technical door). Non-technical buyers use the assisted door instead.
- **Coverage:** open dev programs — Momentum, Fast2, Fortnox, Visma. **Vitec (~40% share) is partner-gated → assisted only.**
- **Price: free Builder tier** (test endpoints, read-only, capped). Optional paid Builder for more seats / connectors. Low marginal cost (self-serve).
- **Trust:** read-only by default, test endpoints, EU-hosted, nothing retained, every action logged, fastAPI-certified connector.

### 3 · Production / Migration — *Go live & scale*  (where the money is)
- Quattro goes live in the **customer's own environment** (AWS-first, but any cloud) — they own the data + environment; Alto licenses the platform and operates it.
- This is the assisted, **funded** event the self-serve work has already de-risked. The customer has built it and seen it work on their systems; now it is moved to production.

---

## The commercial model — Software · Modules · Support · Uppstart

**Live prices (forj.se/quattro, 2026-06-11):**

| Plan | Software (licence) | Uppstart (one-time) | Support |
|---|---|---|---|
| **Start** | 3 900 kr/mån | 19 000 kr | Base |
| **Väx** (most popular) | 8 900 kr/mån | 39 000 kr | Priority, 4h SLA |
| **Skala** | 17 900 kr/mån | 79 000 kr | Premium, 1h SLA + dedicated |

**À la carte:** +module 1 900 kr/mån · +system 690 kr/mån · Premium SLA from 4 900 kr/mån. Sandbox + dev workspace free. All prices /month at annual terms, ex. VAT. (Fictional but realistic placeholders — easy to tune.)

| Line | What it is | Type | Notes |
|---|---|---|---|
| **Software (licence)** | Platform fee to run Quattro in production | Recurring (ARR) | The tier fee (3 900–17 900 kr/mån). Direct-billed by Alto, **environment-agnostic** |
| **Modules** | Add-on capabilities, land-and-expand | Recurring (ARR) | 1 900 kr/mån each · invoice & attest · deadlines · data consolidation · reporting · CRM sync |
| **Support** | SLA — base / priority / premium | Recurring (ARR) | Base included; Premium SLA from 4 900 kr/mån |
| **Uppstart** | Prepare + deploy Quattro production-ready (any env) | One-time | 19–79k. **The private ace: MAP funds it on AWS, case-by-case — never advertised.** Other envs: customer pays Alto direct |

### Money mapped to the funnel
| Stage | Price | Revenue type |
|---|---|---|
| Sandbox | Free | — (marketing) |
| Dev workspace | Free Builder | — (qualification) |
| **Uppstart** (go-live) | 19–79k one-time | Services (MAP-funded on AWS, case-by-case) |
| **Production run** | 3 900–17 900 kr/mån + modules + support | **Recurring ARR** (direct-billed) |

**Land-and-expand:** land at Start (one module) → grow to Skala + à la carte → ARR compounds with **no new uppstart**. One go-live seeds years of recurring.

**AWS = the private ace, not a public requirement.** The public landing says "production in your own environment, anywhere" and shows no AWS. MAP funding for the uppstart is raised case-by-case — it makes AWS the cheapest path for the customer, but is never advertised and never required. ARR is direct-billed software, so Alto gets paid wherever Quattro runs.

---

## Why it scales
- Self-serve dev = **~0 marginal-cost POC** (vs a bespoke POC each time). The unlock.
- Customers self-qualify, self-educate, self-validate → the cycle collapses; they arrive wanting *production*, not a demo.
- A top-of-funnel of **technical believers** (IT, integration partners) pulls Quattro into orgs.
- Monetize at production; **AWS MAP funds the migration**; modules compound the ARR.

## The one rule (the boundary)
**Self-serve the believing; stay high-touch on the buying.**
Self-serve = sandbox + dev/test connect + validate. Assisted = production cutover (real data, their AWS, MAP-funded). Cross that line and you hit the security wall.

---

## Architecture per stage
- **Sandbox:** static page + inline JS on sample Fi2 data, no backend. → `quattro/index.html` (forj.se/quattro).
- **Dev workspace:** auth + per-tenant workspace; **OAuth (PKCE) connect** to test endpoints; the connector (fastAPI + economy clients); a **template runner**; an audit log. → `quattro-connector/` is the seed.
- **Production:** the same connector + orchestrator deployed to the customer's AWS; live OAuth; SLA, monitoring, RLS tenant isolation.

> One engine across all three: the same connector, orchestrator and modules — only the data source and the operating environment change.

## Two doors, one engine
- **Self-serve door:** sandbox → dev workspace → **"Take it to production"** → Alto. (IT / integration partners; open systems.)
- **Assisted door:** Alto-run demo + scoping → migration → production. (Conservative / non-technical buyers; Vitec accounts.)

Same connector, same orchestrator, same modules — different on-ramp. Mirrors Forj's "two ways" model: a product you adopt, or done-with-you.

---

## Attest leder modulberättelsen (beslut 2026-06-12)

**Första modulen i varje demo och varje pitch = Fakturaattest.** Alla hatar den, alla har den, och den rör pengar → höga insatser → autonomi-ratten lyser som starkast (auto inom gräns, eskalering över gräns, allt loggat). Demon på landningen har nu ett attestflöde (morgonrapporten → "Visa attestkön") och Start-paketet säger "de flesta startar med Attest". Berättelseordning i demos: **morgonrapporten → attestkön → ratten → "över gränsen passerar aldrig utan människa".**

## Per-lägenhet-priset · muntligt experiment (INTE på sidan)

Branschen räknar per objekt/lägenhet (Momentum prissätter så). Testa muntligt i demos innan något ändras publikt.

**Omräkningen (säg detta, visa inget):**

| Portfölj | Tier | Licens | ≈ kr/lägenhet/mån |
|---|---|---|---|
| 500 lgh | Start 3 900 | 46 800 kr/år | **7,80** |
| 1 000 lgh | Väx 8 900 | 106 800 kr/år | **8,90** |
| 1 500 lgh | Väx 8 900 | 106 800 kr/år | **5,93** |
| 3 000 lgh | Skala 17 900 | 214 800 kr/år | **5,97** |
| 6 000 lgh | Skala 17 900 | 214 800 kr/år | **2,98** |

**Den muntliga raden:** *"Räkna på det som under en tia per lägenhet och månad · i samma härad som er boendeapp, fast för kontoret."*
**Följdrad vid prisinvändning:** *"En administrativ timme kostar er ~420 kr. Quattro behöver frigöra under en timme per hundra lägenheter och månad för att betala sig · räknaren på sidan visar att det är försiktigt räknat."*
**Beslutsregel:** kör raden i 5 demos. Landar per-lägenhet bättre än paketpriset i ≥3 → byt prissidans modell till per-lägenhet med golv (annars behåll tiers).
