# THE LEVEL-UP PROMPT: forj.se + Alloy + Smith, next level

**Written 2026-07-21. Self-contained: paste into a fresh Claude (Fable) session or execute in place.**
**If subagent fan-outs fail with a weekly usage cap, do not stop: execute every lens inline,
sequentially, in the main loop. That mode was proven today. Report the cap, keep working.**

---

## 0. Mission

Three deliverables, in this order:

1. **Tri-surface audit** of forj.se (public site), Alloy (the app), and Smith (the AI co-worker's
   actual output quality), judged against one question: *what stops a Nordic AWS partner from paying,
   activating, and staying?* Not a polish list. The gaps between surfaces are the audit.
2. **Vainu data-parity audit**: field-by-field gap analysis of https://www.vainu.com/product/data/
   against Alloy's measured library, ending in a build/buy/skip decision per field with cost.
3. **Pricing rebuild**: exactly two offers on forj.se, specified below, shipped to production.

## 1. Ground truth (do not rediscover, do not trust beyond this)

| Thing | Where |
|---|---|
| Public site (forj.se) | `C:\Users\jacob\alloy-landing\` — branch `landing`, single-file pages, Amplify deploys on push. Local preview: `.claude/launch.json` name `landing`, port 8098 |
| Live product (Alloy + Smith + edge fns) | `C:\Users\jacob\alloy-page\` — branch `main`, GitOps. `src/forge.jsx` is the app; `supabase/functions/*` are Smith's organs |
| Strategy + docs repo | `C:\Users\jacob\alloy\` — the `.md` files are current; its `src/` is STALE, never read it for how the product works |
| Database | Self-hosted Supabase on EC2 `i-0f5162624bebb00d8` (eu-north-1, profile `forj-box`). Query via SSM Run Command, params as a JSON file under `C:\tmp\ssm\`, psql inside the `supabase-db` container. READS freely; WRITES only as explicit migrations committed to `alloy-page/supabase/migrations/` |
| Public RPCs the site reads | `forj_public_stats` (library + plays: MAP 27,104 / PoC 32,373 / Modernize 5,716, ecosystem basis), `forj_cosell_proof` (28 opps, 15 launched, USD 85,151/mo launched, 1,021,812 annualised, aggregate-only by design), `forj_live_outcomes` |
| Claude budget | Cap $900 code-enforced, ~$471 spent, headroom ~$429. Any paid enrichment must be priced BEFORE running and approved by Jacob. Known unit: maturity-fill ≈ $0.05-0.06/company |
| Tests | `alloy-page`: `npx vitest run` — 391 tests, must stay green |

**Measured library (2026-07-21, live scope, Nordics):** 85,699 rows. `cloud_ecosystem`: independent
27,104 / azure 24,450 / gcp 7,923 / aws 5,716 / NULL 20,291 (= no domain, undetectable). Cloud read
backlog: ZERO (domained-and-unread = 0; `cloudcheck-batch` runs every 5 min). Contacts: 48,354 total,
SE-heavy (SE dm-companies 8,064; NO ~0.6%, FI ~0.2% coverage). Techstack populated: 57,220.
`maturity_band`: 1,060 (1.2%). Signal feeds live but thin (~550 companies total across brreg, jobtech,
vinnova, ted, nav). Finland has NO free size route; SE size class waits on Jacob's SCB email.

**Read the column right:** `cloud_provider` = infrastructure HOST (cloudflare/other/unknown ≠ unread).
`cloud_ecosystem` = the rule the product reasons with. Confusing them produced two wrong diagnoses in
one day. `icp_band` legacy; band derives from `icp_score` 70/40.

## 2. House rules (hard, all surfaces)

- **No em dashes** anywhere in copy. Check CSS comments too; the site-wide check must stay at zero.
- **Public site = outcomes only.** Never vendors, backends, methods, economics, or partner names.
  (Exceptions already deliberate: "Amazon Bedrock in the EU" as the residency statement; CRM names on
  integrations page; sub-processor lists on legal pages.)
- **No invented statistics. A constant never sits under a "Live" label.** Proof bands hide themselves
  if their RPC does not answer.
- **All credit to Forj** (the company). Never the founder personally. Never imply Alloy or Smith
  produced work that predates them: the co-sell record is Forj's, the software's tense is present
  ("the work Alloy and Smith exist to repeat").
- **Keep it simple: not every true thing needs saying in plain sight.** Units stay labelled, but the
  methodology lecture stays out of the shop window.
- Brand: steel-violet `#4B3CA0`/`#9E92D8`, ember `#D9722E` content-accent only, AWS amber `#D98A33`
  (`#FF9900` banned), bone/soot grounds, Space Grotesk / Inter / Space Mono. Smith = the v2 locked
  face ONLY (`alloy-landing/art/smith-*.webp`, `brand/smith/v2/`); anything else is off-model.
- Smith's public demo answers: no dollar amounts, no program percentages, no cap figures.
- Buyer language, never engineer jargon. A human presses send, everywhere, always.

## 3. AWS facts: the verified lists (repeat nothing outside the TRUE list)

**TRUE, dated, primary-sourced:** MDF claims are submitted within 30 days after activity completion
(or by Dec 15), one 1-90-day extension. AWS-referred engagement invitations expire in 5 business days.
PRM revenue attribution is PASSIVE (aws-apn-id resource tags + API activity, monthly billing cycle,
no submission, no deadline). Partner Central agent GA dates: agents 2026-03-16, opportunity creation
05-15, lead enrichment 06-15, Opportunity Quality Score 06-16, Partner Lead Prospecting 07-09.

**FALSE, remove on sight, never reintroduce:** any RA-ID deadline or monthly attribution rhythm;
"MAP Lite" or a $1-100K MAP lane ($100K is the FLOOR); "free to every ACE partner"; "AWS does no
discovery". The 2026-07-20/21 sweeps removed these from 8+ sites including Smith's own briefs and
tests; treat any reappearance as a regression.

**MDF, precisely (feeds the pricing task):** MDF reimburses approved marketing/demand-gen activities.
The partner pays first, claims after, per fund request, through APFP. Approval is per-request. AWS
publishes no standing co-funding guarantee for anyone's service fees.

## 4. TASK 1: the tri-surface audit

One question: **what stops a partner from paying, activating, and staying?** Audit each surface, then
the seams between them; the seams are where today's real finds were (Smith nagging a deadline that
does not exist while the site was already corrected; two different Smith faces; host vs ecosystem).

**Surface A: forj.se.** The machine-checkable lenses ran 2026-07-21 and were CLEAN (truth, redaction,
em dashes, contrast both themes with a color(srgb)-aware meter, overflow 375-1600, links, canonicals).
Do not re-run those first. Instead audit what was NOT covered: (1) the conversion path: from landing to
"read a company" to the email gate to the booked call; walk it end to end, find every point of friction
or silence; (2) message architecture: can a first-time visitor say back, in one sentence, what Forj
sells and what it costs; (3) the two-nav split (rail on home/legal, topbar on pricing/integrations/
cookies): unify after the visual verdict picks a winner; (4) the visual pass NEEDS HUMAN EYES via
`alloy\FORJSE_VISUAL_AUDIT_PROMPT.md` in Claude desktop; fold its verdicts in.

**Surface B: Alloy.** Audit as an activation product, not a codebase: (1) first-session experience of
a brand-new partner workspace: what do they see before any data warms up, how many clicks to first
value ("the letter" dashboard was built for this: verify it actually lands for an empty tenant);
(2) does every funded-door claim on the site exist as a workable feature (play on every card, funding
view, co-sell panel, briefs); (3) vocabulary lock: MAP / PoC / MAP Modernize / Generative AI PoC used
identically in forge.jsx, scoring.js, smith-tools.js, prompts, and the site (known drift: "GenAI POC"
casing in smith-tools.js); (4) the KPI sheet's RLS bug (project_id vs claimed_by membership) is
diagnosed-not-fixed: fix it; (5) 391 tests stay green.

**Surface C: Smith.** Audit the OUTPUT, not the plumbing: (1) pull real recent runs (action-trace
logs, brief history) and judge against the voice bar: senior PDM, amplify-not-replace, no slop,
recipient's language; (2) grounding: does every factual claim in a brief trace to a row (the smith-slop
and eval suites are the floor: run them, then read 10 real outputs as a human would); (3) the morning
brief after today's RA-ID fix: verify the corrected reminder renders and nothing else nags a fake date;
(4) does Smith know the two new proof RPCs exist: can he answer "what is our co-sell record" from data;
(5) demo console answers on the site: still within the no-numbers rule, still the locked voice.

**Deliverable:** one ranked list across all three surfaces: BLOCKS PAYING / BLOCKS ACTIVATING /
BLOCKS STAYING / polish. Each item: surface, evidence (file:line or measured value or quoted output),
fix, effort. Fix inline anything that is small and safe; ship in small verified commits.

## 5. TASK 2: the Vainu data-parity audit

**Why:** Vainu is currently a licensed SE-only source (~15k companies + 46.5k decision-makers,
contract-bound). The goal is to own the layer or know exactly what licensing buys. "Match their data"
means: for every data family Vainu SELLS, know whether Alloy has it, can build it, or should buy it.

**Method:**
1. Fetch https://www.vainu.com/product/data/ and every product subpage linked from it (data coverage,
   firmographics, technographics, financials, decision-makers, buying signals / trigger events,
   industry classification, geographic coverage pages). Public marketing pages only: this is ordinary
   competitive analysis. Do NOT scrape their app, do NOT touch the licensed dataset beyond what the
   contract already delivers, do NOT violate their terms.
2. Enumerate every field/family they claim, with their stated coverage (countries, counts, refresh).
3. For each, measure Alloy's actual state from the live db (never from memory), citing counts.
4. Verdict per field: **HAVE** (parity or better) / **PARTIAL** (have it for a subset: which, how big)
   / **MISSING**. For PARTIAL/MISSING: the cheapest route (free registry / detector we run / paid API /
   license Vainu), estimated cost against the $429 headroom, and: *does the funded-door wedge actually
   need it?* Parity for its own sake is vanity; the wedge needs, in priority order: liveness + size
   class everywhere (FI is the known hole), contacts beyond SE, workload/intent signals (the 1.2%
   maturity gap), and financials only if they gate ICP.
5. Deliverable: `alloy\VAINU_PARITY.md`: the gap table, a bottom line ("to match Vainu on X we need Y
   at Z cost; A and B we already beat; C is not worth matching because..."), and the 3 highest-leverage
   data moves ranked by cost per unlocked account.

**Known before starting** (verify, then build on): SE registry 820,926 rows loaded free; NO is a
census (35k); FI staged but sizeless; techstack 57,220 via BuiltWith; contacts are the moat gap
(NO 0.6%, FI 0.2%); Explorium covers Norway but is paid and Article-14-load-bearing; signal feeds
live but thin. Vainu's own likely edges: refresh cadence, financials depth, industry classification,
NL/global coverage (which the wedge does not need).

## 6. TASK 3: the pricing rebuild (exactly two offers)

Replace the current pricing model on forj.se with exactly two cards, nothing else for sale:

**Card 1: Alloy + Smith.** Full access to everything. **10 000 SEK per month, billed quarterly**
(30 000 SEK per quarter, rolling). Nothing held back: whole library, all plays, briefs, co-sell
drafting, integrations, the same machine Forj runs. Self-serve pace: your reps work the territory.

**Card 2: The Desk + Alloy + Smith.** Everything in Card 1, plus Forj's desk working the territory
and handing back meetings with the funded play attached. **100 000 SEK per month, billed quarterly.**
Desk capacity stays capped at two engagements at a time (existing public constraint: keep it, it is
the key-person answer and scarcity is true).

**MDF co-funding on Card 2, THE COMPLIANT FRAMING (see §7 flag before shipping):** the private fact
is that AWS has approved MDF in both current desk engagements at 50%. The public page may NOT name
the partners, may NOT say "guaranteed", may NOT imply AWS pre-approved anything for future customers.
Default wording unless Jacob picks otherwise:

> *"The Desk is built to qualify for AWS Marketing Development Funds. Where your MDF request is
> approved, AWS reimburses half. Every Desk engagement to date has been approved at 50 percent, and
> we prepare the request with you."*

Truthful (past-tense, factual), no partner named, no guarantee, and it still lands the point: the
real price of the Desk has been 50k for everyone so far.

**Execution:** rewrite `pricing.html` to the two-card model (kill any other tiers/cards/price rows);
sweep EVERY price mention site-wide (index FAQ, meta descriptions, smith demo answers, integrations,
terms) and in the app (forge.jsx, any onboarding copy) to the same two offers; keep the anti-token
SPINE line if present; quarterly terms stated plainly ("runs a quarter at a time"); update
`LAUNCH_RUNBOOK.md` if it references old pricing. Verify rendered, both themes, mobile, then ship.
Note: pricing.html currently uses the TOPBAR nav; do not let the pricing rewrite silently decide the
nav question if the visual audit has not answered it yet.

## 7. Flags: RESOLVED by Jacob 2026-07-21 (do not reopen)

1. **MDF wording: DECIDED = track record, no guarantee.** Ship exactly this framing on the Desk card:
   built to qualify for MDF; where the request is approved AWS reimburses half; every Desk engagement
   to date approved at 50 percent; we prepare the request with you. NEVER: partner names, "guaranteed",
   or anything reading as AWS pre-approval of future customers.
2. **Desk price display: DECIDED = 100k lead, 50k co-funded shown.** Headline 100 000 SEK/month, the
   effective co-funded figure directly beneath it.
3. **Founder lines on /smith** (passport accountability line + "forged the hard way"): still open,
   Jacob's call, both defensible. Leave untouched until he rules.

## 8. Discipline (non-negotiable, learned the hard way this week)

- Verify every "fact" against the live system before repeating it. A Forj doc citing a Forj doc is
  the claim restated. Today alone: an agent invented a live compliance emergency from a stale asset
  table, and two diagnoses went wrong by reading the wrong column.
- Never ship a number you did not just measure. Never let a proof figure fall back to a constant.
- Screenshots/zoom hang in the Claude Code browser: verify with read_page + javascript_tool
  (getBoundingClientRect, computed styles, a color(srgb)-aware contrast meter), and route anything
  aesthetic to human eyes via the visual-audit prompt.
- Small commits, each independently verified, pushed to the right repo (`landing` vs `main`), then
  confirm live on forj.se with curl before claiming done.
- If the subagent fleet is capped: say so, run inline, do not degrade rigor.
