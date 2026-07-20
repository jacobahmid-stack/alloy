# Quattro Self-Serve — pitch for Erik & Emilio

*Working draft. Jacob → Alto. The thesis, the honest if's/but's, and the wedge.*

---

## The one-liner

**Turn Quattro from a platform Alto *sells and installs* into a platform property companies can *try, sandbox, and switch on themselves* — with an AI co-pilot doing the hand-holding that onboarding does today.** Same enterprise ARR at the end; a cheaper, faster, self-qualifying funnel in front of it.

## Start here: a brilliant engine isn't a business — yet

Quattro today is positioned as **Universal Intelligence Connectivity** — connect any AI to any data, any API, any LLM, via secure MCP. The tech is genuinely strong. But "connect anything to anything" is hard to sell as a *business*:

- **No wedge.** Horizontal middleware has no specific buyer or owned pain — a vitamin, not a painkiller.
- **"Universal" breaks on contact.** Real backoffice integrations are messy and customer-specific; "works with any API regardless of auth" is the promise that needs a human — or an AI — per case.
- **It's commoditizing.** Anthropic, OpenAI and every platform now ship native MCP connectors. A standalone "universal connector" gets squeezed between the model providers and the apps.
- **No self-serve motion.** Horizontal infra is sold top-down, enterprise-by-enterprise — headcount-capped, no land-and-expand.

**The reframe (the rest of this doc):** keep the engine, point it at a *vertical with an owned pain* — property backoffice — and wrap it in a self-serve motion. "Universal" becomes **templated depth** for the few systems property cos actually run; the sandbox→gate→production model gives land-and-expand at low CAC; and **Quattro's own engine makes the self-serve integration work** — exactly what "universal connectivity" is built for; Alloy + Smith simply *feed* it the right customers (they never touch the product).

> *The connectivity engine is brilliant — it's just not the business yet. The business is a vertical wedge sold self-serve, and the engine is what makes the self-serve real. That's what Forj brings.*

---

## The shift

| Today | With self-serve |
|---|---|
| Sales-led: every deal is a meeting, a demo, a proposal | A prospect provisions a sandbox in minutes and sees *their own* workflow run |
| Onboarding is a services project (headcount-capped) | Onboarding is mostly **configuration the customer does**, AI-guided; services reserved for the genuinely hard stuff |
| Growth ceiling = how many onboardings Alto can staff | Growth ceiling = market size |
| Modernization is a big scary migration you have to *sell* | Modernization is something they *watch happen* in a sandbox before they commit |

## Why this is an Alto-with-Forj bet, not a generic PLG pivot

"Self-serve backoffice integration" is normally a fantasy — backoffice is exactly the gnarly, customer-specific part that *needs* humans. The thing that changes that math is **AI that sets the integration up with the customer** instead of handing them a blank config screen — and that's exactly what Quattro's own engine (Universal Intelligence Connectivity) is built to do. So the engine isn't the gap. The gap is **demand and motion**: Forj's Alloy + Smith feed the right customers, the model is self-serve, and an AWS partner wires the funding. **No one else pairs Quattro's engine with a demand engine + AWS money. That's the unfair advantage — lead with it.**

## The model (how it actually works)

1. **Sandbox in minutes.** Prospect spins up an isolated Quattro environment seeded with sample (or a slice of their real) data.
2. **Templated integrations, not raw build.** They pick their systems from a menu — the handful of fastighetssystem / ekonomisystem your customers actually run — and connect. The hard adapters stay Alto-built and *templated*; the customer self-serves the **configuration**, not the engineering.
3. **Quattro's own AI guides them.** "Connect your ärende source," "map these fields," "here's your felanmälan flow running" — Quattro's connectivity engine turns a services project into a guided setup.
4. **Land → expand.** Sandbox → switch on one module → add modules → modernize the legacy backoffice. Each step is self-initiated and self-evident.

## The architecture — who owns what, and where the money is

**Sandbox → the gate → production.** A clean value-capture point — the same pattern Supabase, Shopify, and GitLab-self-managed run on.

- **Sandbox** — free, self-serve, synthetic data, Quattro's AI guides setup. Low CAC; the customer qualifies themselves.
- **The gate (sandbox → production)** — where *all* the monetization sits: the **platform license**, the **modules** they activate, the **modernization / go-live**, and **production support**. The free trial doesn't erode revenue; the money lives at the gate.
- **Production** — runs in the **customer's own environment (their AWS)**. So production *is a MAP migration AWS funds* — net-new AWS money that de-risks the customer's cost and makes Alto's deal easier.

**The ownership split — state it exactly:**
- **The customer owns their production instance** — data, configuration, workflows, integration mappings. Portable, exportable. *No hostage.*
- **Alto owns the Quattro platform** — engine, modules, integration templates, agents. *Licensed, not sold.* (Smith and Alloy are Forj's — they feed customers in; they never touch the product.)

**"So can they just leave?"** They own their data + config (the trust); the engine is Alto's licensed IP (leaving = rebuild the runtime). Stickiness through value, not a hostage — the healthy SaaS equilibrium.

**Why only Forj can wire this:** production-on-AWS is an AWS-funded migration. An AWS partner turns the production gate into a MAP-funded move — AWS pays for the migration, Alto banks the license, the customer keeps their data on their own cloud. **Alloy finds it · the sandbox proves it · AWS funds the move · Alto owns the platform.**

## The question Erik & Emilio will actually ask: *does this cannibalize our services revenue?*

Answer it head-on. **No — it changes its shape and grows the pie:**
- Self-serve is a **new top-of-funnel**, not a replacement for the enterprise close. More logos enter; they convert to the *same* platform + modernization ARR, faster and at lower CAC.
- You **keep charging for the hard stuff** (complex migrations, bespoke integrations, white-glove for the big accounts). What self-serve removes is the *cost* of low-value onboarding labor, not the *revenue* of high-value services. Margin goes up.
- The thing that's actually capped today is **Alto's onboarding headcount.** Self-serve + AI lifts that cap without hiring linearly. (This is the same "founder/headcount-independent, ownable" logic Forj runs Alloy on.)

## The honest if's and but's

**BUT — public procurement (LOU).** The juiciest ICP, *allmännyttan* (municipal housing), legally **can't** "swipe a card and buy." A pure self-serve buy-flow clashes with offentlig upphandling.
→ *De-risk:* For municipal, the sandbox is an **evaluation / RFP-response tool**, not a checkout. Self-serve *buying* starts with **private landlords** (Stena Fastigheter, Heimstaden, Wallenstam, John Mattson, Einar Mattsson — all real, all already modernizing) who can sign themselves.

**BUT — backoffice integrations are genuinely hard.** Promise "easy self-serve integration," deliver integration hell, and the first impression is poison.
→ *De-risk:* Ship templates for the top systems *first*; gate self-serve to the ones you've templated. Everything else routes to "talk to us" — which is a *qualified sales lead*, not a failure.

**BUT — sandbox data is sensitive** (tenant PII, financials, GDPR).
→ *De-risk:* Sandboxes seeded with synthetic/sample data by default; real-data connect is an explicit, isolated, consent-gated step. Lead with security — it's a trust sell, and you already carry that posture for enterprise.

**BUT — channel conflict.** A self-serve motion can undercut the enterprise sales team's deals and comp.
→ *De-risk:* Position self-serve as **lead-gen for sales** (PLG-assisted-sales), not a parallel store. Sales gets credited on sandbox-sourced conversions. No internal civil war.

**BUT — support load.** More, smaller, less-qualified users hitting support.
→ *De-risk:* Quattro's own AI that guides setup is tier-1 support. Self-serve only pencils out *because* the engine absorbs the "how do I…" volume.

## The wedge — and where Forj/Alloy plugs in

Don't boil the ocean. Start with a list that's **already proven it self-serve-adopts tools**:

- Alloy + Smith just identified **17 Nordic property companies running Kundo** (they chose a tenant-service tool *themselves* — Nyköpingshem, Stena, Heimstaden, Wallenstam, John Mattson, Lulebo, Kopparstaden, and more). **Kundo on the front = appetite for the backoffice next.**
- **Split the list by buyer type:** private landlords → the self-serve sandbox wedge; municipal → sandbox-as-evaluation feeding a procurement-compliant sale.
- **Alloy fills the funnel, the sandbox converts it, Alto's sales closes it.** That's the whole loop: Forj finds and warms the right property cos → they self-serve a Quattro backoffice sandbox → Alto books platform + modernization ARR.

## The ask (what this pitch is requesting)

1. Agreement that **AI-guided self-serve sandbox** (not raw PLG) is the right frame.
2. A **3-system integration-template scope** to gate the first self-serve cohort.
3. A **10–15 private-landlord pilot** drawn from the Kundo list, with Forj (Alloy + Smith) running top-of-funnel and Quattro's own AI guiding setup.
4. Success metric for the pilot: sandbox → activated-module conversion rate, and CAC vs. the current sales-led baseline.

---

*Forj's role: the demand engine — Alloy + Smith find, warm, and feed the right customers to Quattro — plus the go-to-market reframe and the AWS-funding wiring. Smith and Alloy never touch the Quattro product; they fill the funnel.*
