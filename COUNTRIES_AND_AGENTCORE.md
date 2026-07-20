# COUNTRIES TODAY (no email) + AGENTCORE READ - verified 2026-07-17

All load-critical claims verified against live endpoints. Composing the ruling.

---

# COUNTRIES WITHOUT EMAILS - WHAT LOADS TODAY

Ruling for: *"Which countries could you add to Alloy without emails - what can be added today?"* Anchor date 2026-07-17. Every endpoint below was hit live by me today; probe-measured join counts are attributed to the probes and re-flagged where I could not re-run them.

## 1. THE DIRECT ANSWER

Yardstick for "usable accounts": the audit's choke point is **domain** (no domain = scoring returns off-profile, cloud detection cannot run). Norway is the cautionary number: **35,458 rows -> 3,381 addressable -> 149 AWS domains**.

| # | Country / source | Loadable today, no credential? | Carries DOMAIN? | Carries EMPLOYEES? | What it actually ADDS (usable accounts, not rows) | Verdict |
|---|---|---|---|---|---|---|
| 1 | **Estonia** RIK registry + EMTA | **YES** - I re-hit both files live: RIK `lihtandmed.csv.zip` HTTP 200 / 18,355,718 B / `application/zip`; EMTA employees CSV HTTP 200 / 61,876,591 B / `text/csv` | **YES** - 77.9% of the in-band cohort (probe-measured registry email -> corporate domain) | **YES** - EMTA, per quarter, per company | **~6,052 domained in-band (10-200 emp) accounts** (probe join). Larger than Alloy's entire current usable base (~4,700); 1.8x Norway's 3,381. The only source on the board carrying domain + employees + NACE at once | **BEST DATA. But Baltic, not Nordic** - see ranking |
| 2 | **Finland** PRH/YTJ `all_companies` | **YES** - re-hit live: HTTP 200, `application/zip`, `all_companies_20260717.zip`, last-modified today, no key | **YES** - `website.url` first-class; ~70k active Oy, 63,357 distinct domains (probe-measured) | **NO** - field does not exist in the register; **and I confirmed the free PRH XBRL accounts API carries no employee field either** (see below) | **~70,000 domained active Oy for one 95 MB GET, free**, no Claude domain-fill spend. Scoreable + cloud-detectable at load; Desk 10-200 gate cannot run at load | **ONLY in-region free clean-domain option** |
| 3 | **Czechia** ARES + CSU RES | **YES** (probe-verified; not re-hit by me today) | **NO** - header carries none; domain problem UNVERIFIED-but-likely | **YES** - KATPO size-class, the field SCB gates Sweden on | **81,795 active in-band (floor)** with NACE + status, but **domainless** -> re-runs the Norway failure unless Claude domain-fill carries it ($ against $445 headroom) | **PARK with receipt** - not Nordic, no paying pull |
| 4 | **Denmark** CVR + regnskabsdata | **SPLIT - NEEDS EMAIL for the base.** I verified: company base `cvr-permanent/_search` = **HTTP 401** (needs the `cvrselvbetjening@erst.dk` credential); accounts `offentliggoerelser/_search` = **HTTP 200 anonymous, 6,416,496 filings** | Base: yes once credentialed. Accounts feed: no domain field | Base: yes. Accounts (XBRL): **UNVERIFIED** - filings served gzip-binary, I did not decode employee tags | You cannot enumerate a loadable company base without the 401 index. The open accounts feed is keyed by CVR you don't yet have | **NEEDS EMAIL** (~3-week clock) |
| 5 | **France** INSEE Sirene | **YES** (probe-verified; prior `files.data.gouv.fr` path is dead/404, live path via data.gouv API) | **NO - zero** (verified against INSEE's own 35-var dictionary) | Partial - **~15% of active** carry a tranche (probe-measured; string sentinel `'NN'`, not null) | **29.8M domainless rows.** ~840x the Norway mistake. 15% of a domainless row is still a domainless row | **REJECT** - Norway again, at scale |
| 6 | **United Kingdom** Companies House | **YES** (probe-verified) | **NO** - col #33 `URI` is a linked-data id (`business.data.gov.uk/...`), a trap, not a website | Yes, but only via a **separate ~24 GB/yr iXBRL accounts join** | Domainless base; employees cost a 24 GB/yr join to enrich rows that still cannot be scored or cloud-detected | **REJECT** - Norway again |
| 7 | **Latvia** UR register.csv | **YES** (probe-verified) | **NO** | **NO** - and **NO free NACE** either (probe checked all 30 UR datasets) | Name + org-nr + status only. Blind on industry, size, domain | **REJECT** - Norway's mistake with worse fields |
| 8 | **Lithuania** JAR + Sodra | JAR **YES**; Sodra (employees) **BLOCKED** by Cloudflare challenge, not auth | **NO** | **NO** (JAR); Sodra bot-challenged | Name + org-nr + status only | **REJECT** - blind; never-scrape line forbids defeating the challenge |

## 2. THE HONEST RANKING - if Jacob said "go" right now

**The disciplined answer is: do not add a new country today. The single highest-value free, no-email move is the Norway `oppdateringer` delta feed on the base you already own (Section 3), not any new load.** That is the non-yes-man call and it follows directly from the audit: rows are not assets, and improving the 3,381 addressable NO accounts you already have beats manufacturing new untiered rows.

If Jacob overrides that and insists on adding one country:

- **Finland is the only defensible new load.** It is Nordic (in-region - the north star is "AWS-first Nordics NOW; other geographies execute ONLY on paying pull"), free, one anonymous URL, needs no credential email, and it **clears the choke point at arrival**: ~70,000 domained active Oy, 63,357 distinct domains, at zero Claude domain-fill spend. Finland is the *inverse* of Norway - Norway gave rows without domains; Finland gives domains without employees - and by the audit's own logic those are not symmetric. A domained row is scoreable and cloud-detectable on arrival; an employee band on a domainless row buys nothing. Caveat that must ride along: with no employee field, the **Desk 10-200 tier gate cannot run at load** - cloud detection becomes the first gate, not ICP size. Load Oy only; drop housing corporations (91,817 rows, pure manager-site pollution); flag the ~13% shared-domain Oy as franchise/manager layer.

- **Estonia is the best data on the entire board and is still the wrong move today.** It is the only source carrying domain + employees + NACE together, and its 6,052 domained in-band accounts exceed Alloy's whole current usable base. But Estonia is **Baltic, not Nordic** - it sits in the exact bucket that parks Czechia, France and the UK: "execution only on paying pull." Pulling Estonia forward now breaks the same geography rule the probe itself invoked to park CZ. **Recommendation: Estonia is the first country to load the moment there is a paying pull into the Baltics - queue it as the #1 pull-triggered load, do not load it speculatively.** Its fields are good enough that when a paying reason appears, it jumps every other country.

- **The Norway-repeats - reject outright, not "park pending an email":** France (29.8M domainless rows), UK (domainless base), Latvia (blind, no free NACE - settled 30/30 datasets), Lithuania (blind, Sodra Cloudflare-walled). None is a data problem a loader can fix; the domain was never collected. Loading any of them reproduces the 32,893-domainless-row mistake with equal or worse fields.

- **Czechia** is real (81,795 in-band with the size-class Sweden lacks) but domainless and out-of-region: park with a receipt, same as Estonia but a rung lower because it lacks the domain.

## 3. WHAT IS ACTUALLY WORTH DOING TODAY, FREE, NO EMAIL - ranked against the countries

Ranked by value-per-effort against the audit's lesson. The top item beats every new country because it improves accounts you already own instead of adding blind rows.

| Rank | Move | Live-verified today | What it does | Beats a new country because |
|---|---|---|---|---|
| **1** | **Norway `oppdateringer` delta feed** | **YES** - `oppdateringer/enheter?dato=2026-07-16...` HTTP 200, real payload (`endringstype`: `Endring`/`Ny`/`Sletting`), ~4,785 updates on 2026-07-16 alone (1,594 pages x 3). Enhet record confirmed to carry `antallAnsatte`, `hjemmeside`, `konkurs`, `underAvvikling`, `naeringskode1` | Drift / bankruptcy / employee / domain / NACE refresh on the NO base you already hold - keeps the 3,381 addressable accounts current and fires signals (konkurs, underAvvikling, employee swings) | It raises the value of assets you own to $0 marginal cost. A new country adds rows; this adds *freshness and signals*, which the audit says is what you actually pay for |
| **2** | **Load Finland (Oy only)** | **YES** (Section 1) | ~70,000 domained active Oy, free, one GET, no domain-fill spend | Only in-region, credential-free, choke-point-clearing new load available |
| **3** | **Norway `underenheter` HQ-outlet join** | **YES** - `underenheter?size=1` HTTP 200, `totalElements` = **850,835** | Joins outlet establishments to their HQ enhet - resolves the franchise-layer confusion that made Norway's census look like 35k accounts, and gives outlet-level reach on real employers | Turns rows you already have into a correct org hierarchy; no new blind rows |
| **4** | **Queue Estonia for first paying-pull load** | **YES** (endpoints live, Section 1) | Best-fielded country on the board; load on the first Baltic paying pull | Highest data quality, but geography rule says not speculatively |
| **5** | **SE `omsättning` via Bolagsverket free annual accounts** | **PARTIAL / CREDENTIAL** - the free "värdefulla datamängder" HVD set does include digitally-filed annual reports (iXBRL), but I hit the HVD API live and it returns **HTTP 401 "Missing Credentials"** - "free" means no *cost*, not no *token*. The downloadable-files route may carry omsättning without a token but its doc page is CAPTCHA-gated - **UNVERIFIED** | Would add turnover as an ICP dimension on the SE base | Not a clean "no-email" win: needs a Bolagsverket API token; bulk-file content UNVERIFIED |
| **DROP** | **~~Swedish `varsel` from Arbetsförmedlingen as a per-company layoffs feeder~~** | **FALSIFIED** - I verified the varsel downloads: only three files exist and all are aggregate - `Näringsgren (riket) månad`, `Berörda personer per län 1992-2026-03`, `Näringsgren (län) år`. **No per-company or per-workplace varsel is published.** The premise that varsel is a company-level feeder is wrong | - | Cannot attach a layoff signal to a company; the data is county x industry only. Do not build this |

## 4. UNVERIFIED / ESTIMATE - carried forward, not laundered

**Resolved by me today (upgrading probe UNVERIFIEDs):**
- **Finland's employee gap does NOT close via the free PRH XBRL API.** The probe flagged this as "the single highest-value next probe." I ran it: the API base is `https://avoindata.prh.fi/opendata-xbrl-api/v3` (keyless, `/financials`, `/financial`, `/all_financial_statements`), and across 19 real 2026 filings / 1,562 facts, **100% of facts are `ISO4217_EUR` with zero non-monetary units - no employee element exists.** Coverage is also thin: **46,556 filings since 2023-07-01 vs 322,850 Oy (~14%).** Conclusion: **Finland loads as domained-but-untiered; the employee gate cannot be closed for free.** (Confidence: high on the negative; I sampled 19 filings + unit-checked, did not exhaustively scan all 46,556.)
- **Denmark base vs accounts split** is now exact: company base 401 (needs email), accounts 200 anonymous (6.4M filings).

**Still open, carried forward verbatim from the probes:**
- **Estonia:** the 77.9% domain figure is the *in-band* rate (probe-measured); do not confuse with the 64.9% all-company free-provider rate. Estonia's AWS-ecosystem count is **unmeasured** - cloud detection settles it in one run. The CC-BY 4.0 "license acceptance" is a legal notice, not a technical gate (probe pulled 228 MB with plain curl).
- **Czechia:** email/domain presence in `res_data.csv` is **UNVERIFIED** (header shows none -> likely domainless). KATPO is `000`/blank for ~2.07M rows, so **81,795 in-band is a floor, not a ceiling**.
- **Latvia:** VID quarterly employee data - **UNVERIFIED**, no free per-company file found. No free NACE - settled NO (30/30 UR datasets checked).
- **Lithuania:** Sodra employee data behind a Cloudflare challenge (not auth); not attempted per the never-scrape line.
- **France:** the ~260,000 "10+ employee pool" is an **ESTIMATE** extrapolated from a 558,832-row sample, not a full scan. INSEE's own "no longer systematically populated" wording (Lettre Sirene n°5/n°9) is **UNVERIFIED verbatim** - insee.fr 404'd every fetch; the ~80%-of-active-establishments-unpopulated figure is the probe's own measurement and stands independently.
- **Finland:** status-code semantics (`status='2'`) **UNVERIFIED** - no code table located. The probe's "~1,000 AWS accounts" for Finland is an **ESTIMATE / UNVERIFIED** ratio-transplant from Norway's 1.6% hit rate; Finland's domained slice is self-selected (filed-a-URL skews larger/more digital), which likely pushes the true rate up. Cloud detection settles it.
- **Denmark:** whether the open accounts XBRL carries employees or revenue - **UNVERIFIED** (filings are gzip-binary; I did not decode). Note also the DK fine-backed `reklamebeskyttelse` direct-marketing ban sits on top of the open licence regardless.

**Artifacts on disk (this session):** `C:\tmp\` (`xs.json` PRH XBRL OpenAPI spec, `idx.json` filing index, `f_*.xml` Finnish filings, `dk.json` Danish accounts hit). Prior probe artifacts in the scratchpad path. Registry-routes doc: `C:\Users\jacob\alloy\REGISTRY_ROUTES_EU.md`.

---

# BEDROCK AGENTS DEPRECATION - DOES IT TOUCH FORJ?

## 1. THE ANSWER IN TWO SENTENCES

**No. Zero exposure, zero migration burden.** Smith calls `bedrock-runtime.<region>.amazonaws.com/model/{modelId}/invoke` - raw InvokeModel on the data plane (`C:\Users\jacob\alloy-page\supabase\functions\claude-proxy\index.ts:129`, second identical call site `smith-demo\index.ts:75`, and a repo-wide grep for `bedrock-agent|InvokeAgent|agentId|knowledgeBaseId` returns **zero hits in any AWS call path**), while AWS's own notice scopes the change to a different service entirely: "Only the Amazon Bedrock Agents Classic service is no longer open to new customers as of July 30, 2026. Your existing Amazon Bedrock models, Knowledge Bases, and Guardrails are not affected" (<https://docs.aws.amazon.com/bedrock/latest/userguide/agents-classic-maintenance-mode.html>).

---

## 2. THE POST, FACT-CHECKED

| Claim | Verdict | Evidence |
|---|---|---|
| "AWS just deprecated Bedrock Agents" | **MISLEADING** | AWS never uses the word. The doc says maintenance mode: "There is no migration deadline. Bedrock Agents Classic remains available to existing customers in maintenance mode with no planned end-of-life date." The headline is the strongest possible reading of the weakest possible fact. [agents-classic-maintenance-mode] |
| "now officially 'Bedrock Agents Classic'" | **TRUE** | "This is a naming update only. No action is required on your part." API namespaces, SDK clients, CFN types, IAM prefixes unchanged. |
| "closes to new customers on July 30, 2026" | **TRUE (verbatim)** | "will no longer be open to new customers starting on July 30, 2026." But the scope is two API calls: "Only CreateAgent and InvokeInlineAgent are restricted for accounts without prior usage." |
| "The replacement? Amazon Bedrock AgentCore" | **TRUE** | GA Oct 13, 2025. <https://aws.amazon.com/about-aws/whats-new/2025/10/amazon-bedrock-agentcore-available/> |
| Managed Identity / Persistent Memory / Tool Gateway / Observability | **TRUE** | All four verbatim in the GA blog. Gateway "transforms existing APIs and AWS Lambda functions into agent-compatible tools, connects to existing MCP servers" - matches the post precisely. |
| "Cedar-based Policy Engine" | **TRUE, with caveat** | Not part of the GA feature set. Separate feature, "Policy in AgentCore", GA'd March 2026: "directly use Cedar - an open source policy language for fine-grained permissions." Fair as a today-claim, wrong as a launch-claim. |
| "SDK downloaded over 2 million times in just 5 months" | **TRUE** | AWS's own figure, in the evaluations/policy blog. He quoted the newer number over the GA blog's "over a million". Credit where due. |
| "Agent tasks grew 15x in the last 6 months" | **UNVERIFIED** | Not in the GA announcement, GA blog, policy/evaluations blog, or the product page. Site-restricted searches on aws.amazon.com return nothing. Untraceable to any AWS primary source. |
| "Nasdaq, Visa, and Experian are already scaling agents on it" | **MISLEADING (composite)** | Real names, assembled by the poster. Nasdaq + Visa come from the re:Invent 2025 keynote recap; Experian from the GA blog's customer list. The trio appears together in no AWS source, and "scaling agents in production" is his attribution, not AWS's. |
| "If you're building on the old Bedrock Agents today, you have until July 30 to start your migration plan" | **FALSE - exactly inverted** | "If your account has had Bedrock Agents activity in the past 12 months, you are allowlisted and unaffected." Current builders are precisely the safe population. "Do I need to take action? Not immediately. Your existing workloads are unaffected." The post manufactures a 13-day deadline for the one group AWS explicitly exempts. |

**What the post omits, and it is the only real reason to migrate:** "The model catalog available in Bedrock Agents Classic is frozen as of the maintenance mode effective date (July 30, 2026)", plus "no new features will be added". A frozen model catalog is the actual slow death. He led with a word AWS does not use and buried the fact that does bite.

Net: ~70% accurate facts inside a false urgency frame, with the central mechanic of the announcement - the allowlist - inverted. That is not a nuance missed; it is in the FAQ he skimmed.

---

## 3. WHAT AGENTCORE ACTUALLY IS, AND WHETHER IT MATTERS TO SMITH

AgentCore is a managed, consumption-priced set of agent primitives: Runtime, Memory, Gateway, Identity, Observability, Policy, Evaluations. Harness free; Runtime $0.0895/vCPU-hour + $0.00945/GB-hour; Memory $0.25 per 1,000 new events, $0.75 per 1,000 records stored/month, $0.50 per 1,000 retrievals; Gateway $0.005 per 1,000 API invocations. (<https://aws.amazon.com/bedrock/agentcore/pricing/>)

**Verdict: frame (b), NON-EVENT. Not by luck, and not by dismissal - by architecture, and the code proves it.**

The threat frame (a) is the right instinct applied to the wrong object. It fails on the mechanism. Partner Central asset #1 died because it was **a proxy over AWS's own API** (GetAwsOpportunitySummary): Forj had built a thin managed layer on someone else's surface, and AWS walked down one rung. Bedrock Agents Classic just suffered *the same death* - AWS absorbed its own orchestration layer into AgentCore. **Smith is not on that layer.** `claude-proxy` treats Bedrock as a dumb model endpoint and owns everything above it. That is the opposite position, and this announcement is what being on the right side of that line looks like.

What Smith already owns, in Forj's repo, versus what AgentCore sells:

| AgentCore sells | Smith already has | Cite |
|---|---|---|
| Runtime / orchestration | Capped ReAct loop, hard-clamped so callers cannot opt out: `iterCap` ≤ 8, `callCap` ≤ 24; tools dropped on the final pass to force an answer | `src\forge.jsx:918-944`, `:933` |
| Memory ($0.25/1k events) | `biasPlays()` re-ranks toward plays that actually booked meetings; `MIN_ATTEMPTS = 5` floor so a 1-of-1 fluke never reorders; per-account rollup to `smith_account_memory` | `src\learn.js:1-100`, `:22`; `claude-proxy\index.ts:498` |
| Gateway / tools | Declarative `{ def, exec }` registry, read-only and client-side by design: "no network, no spend, no outward action, human-in-the-loop intact" | `src\smith-tools.js:1-13` |
| Observability | `captureRun()` → `smith_run` insert, called on both Bedrock and Anthropic paths, fail-open; user-visible `calledTools` trace in VerifyBadge | `claude-proxy\index.ts:699-739`, `:726`, `:834`, `:867`; `forge.jsx:4735,4779` |
| Policy / guardrails | Deterministic lint (`lintSmith()`, no LLM, no network - "The LLM critic is an opinion; this is a gate"), injection guard, 13-regex `PLAY_DENY[]` blocking secrets/injection/URLs from the system prompt | `src\smith-slop.js:1-14`; `claude-proxy\index.ts:62-74`, `:188-192` |
| Identity / isolation | Postgres RLS at the DB, not the agent framework | `multicloud_slice1.sql:76-87` |
| (not sold) | Code-enforced spend caps: global refuses at `spent_usd >= cap_usd` **without spending**; per-tenant daily/weekly/monthly | `claude-proxy\index.ts:541-546`, `:598-607` |

AgentCore sells Smith's plumbing back to Smith, metered. Adopting it would trade owned code for a rented dependency on the exact vendor whose roadmap already ate one Forj asset - and it would put the spend cap, the lint, and the human-in-the-loop tool contract inside someone else's runtime. Against the North Star lens ("more founder-independent and more ownable"), that is a downgrade paid for by the hour.

**eu-north-1: available, so residency is not the reason to say no.** Stockholm landed January 2026 with "the full AgentCore capability set" (release notes), and the region matrix shows ✓ for Runtime, Memory, Gateway, Identity, Tools, Observability, Policy, Evaluations. Say no on ownership, not on residency - the residency argument would be false. ⚠️ AWS contradicts itself here: the General Reference endpoints page still lists 9 regions without eu-north-1. The service docs are newer; treat the general reference as stale (see UNVERIFIED).

One thing the threat frame gets right and should be banked: **this is a second data point on the commoditization thesis, not a counterexample.** Anything that is a thin managed layer over an AWS primitive is on AWS's roadmap, not Forj's. Worth one line in `AWS_PC_COMMODITIZATION`. Had Smith been built on Bedrock Agents in 2024 - the obvious, sensible, well-documented choice at the time - Forj would today be inside a frozen model catalog with no new features. For an AI co-worker whose whole product is model quality, that is terminal. The hedge is already wired: Anthropic-API fallback (`index.ts:867`), with `NO_FALLBACK = new Set(["read"])` (`:112`) keeping the public read EU-resident by returning 503 rather than leaking email+company to a US processor, and env-overridable model fallback chains (`:86-90`) so even a model deprecation is an edge-secret change, no redeploy.

---

## 4. THE ONE THING WORTH WATCHING

**The survivor thesis is untouched. AgentCore is a runtime, not a data source.** "AWS does NO discovery" is a statement about what AWS knows (which Nordic companies exist, which run rival clouds, which qualify for MAP/POC funding), not about where an agent's loop executes. AgentCore ships Memory, Gateway, and Policy; it ships no company library, no funding-eligibility logic, and no Nordic registry. Alloy remains the layer BEFORE Partner Central. Nothing in this announcement moves that line - and note the asymmetry: AgentCore commoditizing runtimes makes agents cheaper for everyone, which raises the value of the thing that is not commoditized (the ~4,700 usable accounts and the funding logic), not lowers it.

**One small, real exposure - a watch item, not a migration.** `supabase\functions\aws-knowledge\index.ts:8` calls `https://knowledge-mcp.global.api.aws`, AWS's free hosted Knowledge MCP server, which AWS itself runs behind an AgentCore gateway (the comment at `:3` records why Forj must speak Streamable-HTTP MCP rather than raw POSTs). Forj is a **client of a public endpoint**; it provisions no AgentCore resource and holds no agentId. Blast radius if AWS retires it: one 35-line function that already fails closed to a 502 with `text: ""` (`:33`) - degraded grounding, not an outage. No action.

**The content play, gated.** An AWS partner-ecosystem consultant published an inverted deadline into the exact audience Forj sells into. Smith's byline is "openly-AI PDM", and the highest-credibility thing publishable is not another AgentCore explainer but the correction with the FAQ quotes attached: no EOL, no migration deadline, current builders allowlisted, the real cost is the frozen catalog. It demonstrates the product (reads verified against primary sources) against a live example of the thing Forj sells against, and it has a falsifiable claim at its center. Per the launch gate this is Post #0-adjacent, not a fire-now - but the raw material will not be fresher than this week. **Do not name or subtweet the poster.** Correct the claim, not the person; he is inside the ecosystem being sold to.

---

## 5. UNVERIFIED

- **"Agent tasks grew 15x in the last 6 months"** - not traceable to any AWS primary source. May exist in an unindexed keynote transcript. Treat as unsupported.
- **eu-north-1 AgentCore endpoints** - confirmed by the service region matrix and January 2026 release notes; **contradicted** by <https://docs.aws.amazon.com/general/latest/gr/bedrock_agentcore.html>, which lists 9 regions and omits eu-north-1. Resolved in favour of the newer service docs, but if this is ever acted on, verify with a live `bedrock-agentcore-control.eu-north-1.amazonaws.com` call rather than trusting either page. Moot unless adoption is reconsidered.
- **"Nasdaq, Visa, Experian scaling agents in production"** - names are real and individually sourced; the trio and the production claim are the poster's construction, not an AWS statement.
- **The LinkedIn post's own wording** - fact-checked as quoted in the source report; the live post was not fetched by this ruling.
- **The AWS deprecation notice vs. the code audit** - the code audit was performed from code alone, without fetching the notice. The finding is robust to that gap: Forj calls neither `bedrock-agent` nor `bedrock-agent-runtime` at all, so any change confined to those planes cannot reach it. The residual scenario worth naming: if AWS ever moves on `bedrock-runtime` itself (an InvokeModel-to-Converse push, which AWS has signalled directionally but which is **not** part of this announcement), it lands on `claude-proxy:128-135` and `smith-demo:75` - two functions, one signature shape. Not today's problem, and explicitly not a reason to migrate now.
