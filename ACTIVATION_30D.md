# ACTIVATION 30D — Alto + Novalo money-loop activation

> **⚠️ RE-ANCHORED 2026-07-14 (same day as authored): everybody at the partners is on vacation until Aug 10.** The original Jul 15 start is void. New shape:
> - **PREP WINDOW Jul 15 → Aug 8 (Forj-side only, zero partner time needed):** all Week-0 plumbing + builds, campaign waves pre-staged and eval-gated, worklist click-through, canary, Gatling remap, funding-fit coverage — PLUS the entire NORTH_STAR_GAPS clean-room lane (entity rename, FORJ filing at PRV — e-filing runs in July, backups→S3, rotations, founder IP assignment draft). August 10 arrives with a loaded product and clean paper.
> - **BOOK NOW, MEET LATER:** send the two sponsor notes (below, vacation-respecting) so the Aug-11 sponsor calls + rep sessions are in calendars before re-entry week fills up. Do NOT send app invite links now — generate them fresh at session time.
> - **STRIKE WINDOW Aug 10 → Sep 8:** W1 (Aug 10–14) = sponsor calls + session 1s + rebook the slipped meetings; W2 (Aug 17–21) = meeting week + funding-fit; W3 (Aug 24–28) = money loop + session 2 + send the pre-staged waves (they go EARLY now since prospects are back); W4 (Aug 31–Sep 4) = self-serve rhythm + annual paper with the scorecard. (Attribution is passive: set the tagging up once, no monthly checkpoint or 7th-of-month deadline exists; see the Week 3 correction.)
> - **Sep 1 day-91 gate reads a 3-week rising pulse, not 30 days** — that is a fine retention story ("activated in re-entry week, rising since") and the full 30-day proof lands Sep 8. Weekly targets below apply to the strike window; the original dated headers are kept for the logic, shift them +4 weeks.

*(Original plan below — all mechanics, runbooks, gates and per-partner tracks unchanged.)*

**Goal:** Smith usage per partner tenant goes from **0 calls ever** to **daily habit**, proven two weeks before Marc's day-91 gate (**Sep 1**). The habit being installed is the **money loop** (detect → funding-fit → co-sell → attribution); outreach (/forge, /campaign) is the daily doorway.

**Why now (live DB, 2026-07-14):** all 440 Smith calls MTD are Jacob-as-master. Alto and Novalo: zero calls ever, zero partner-logged stage moves ever, July output all zeros — while pipeline sits loaded (Novalo: 71 in-flight, 13 booked meetings, 1 proposal, the system's ONLY won deal; Alto: 18 in-flight, 4 booked meetings, 1 proposal). The morning brief reaches exactly one human: Jacob. Fuel is ready: 1,078 Alto-routed companies with named contact email (599 hot), 340 Novalo-routed (172 hot).

This plan was designed via repo audit + activation/cadence design + adversarial doctrine review (verdict: ship-with-fixes; all fixes applied below).

---

## 0 · THE AHA (what activation means)

Within **10 minutes of clicking the invite link**, the rep asks Smith about a deal already on their calendar (one of their booked meetings) and gets back, in one answer: the customer's cloud/stack read, the funding program that deal qualifies for with rough amounts, and a ready-to-send meeting-prep note in Swedish. Value lands on THEIR live stakes with zero data entry. Funding-fit on a live deal is the one output no CRM or generic AI gives them — found money in the currency partner reps think in. And it is the first turn of the money loop, so the aha and the habit are the same gesture.

---

## 1 · WEEK 0 (Jul 15–18): plumbing + sponsor + first session, BEFORE vacation deepens

### 1a. Sponsor agreement first (NEW — the verifier caught this)
Qubad and Anders (**names/roles to CONFIRM — they are not Forj employees**) can't be "activated" without their owners' buy-in. Before any invite goes out, Jacob gets Alto's and Novalo's leadership to agree to: the 15-min daily quarter, two live sessions, Friday check-ins during the window. **This conversation is also the natural opener for the ANNUAL paper** (price card v1.1): "we're investing a month of white-glove activation; the annual paper is how we both commit." Target: paper signed **before Sep 1** — the week-4 usage scorecard is the closing artifact.

### 1b. Plumbing (build/ops, in order)
| # | Item | Status |
|---|------|--------|
| 1 | **Per-tenant attribution**: app sends `body.tenant_id` on every Smith call (was: master/NULL — the metric was corrupt) | ✅ SHIPPED 2026-07-14, commit `07ab844` |
| 2 | **Daily-doorway chips**: "Forge today's move" (/forge) + "Draft my first-touch batch" (/campaign) on the dashboard | ✅ SHIPPED, same commit |
| 3 | **Verify `app_accept_invite`** on the live box: must write BOTH `project_members` AND `tenant_members(alto\|novalo)`. RPC lives only in the DB (not repo). If it only writes project_members → patch via DEPLOY-BOX path. **Budget 2h for the patch branch, don't assume verify-only.** | ☐ Claude+Jacob |
| 4 | **Slack decision** (blocks the daily hook): reps must be DM-able by the Forj-workspace bot. Options: (a) invite reps as Slack **multi-channel guests** in Forj's workspace (recommended, free-ish, fastest), or (b) build an email fallback for the brief. Decide day 1; guest invites are Jacob's action. | ☐ Jacob |
| 5 | **Brief subscriptions**: one INSERT per rep into `smith_brief_recipients` (project scope alto/novalo, `sv` — the language is a per-partner SETTING, confirm, never guess; hour = **7**, integer — the rep reads at 07:30 but the cron fires on the hour) | ☐ after #4 |
| 6 | **Gatling remap** (data-only): Novalo's imported `lost/disqualified` engagements → `ny`/Ej kontaktad (they were the PRIOR agency's outcomes; re-attempt is sanctioned). Without this the rep's warmest fuel is filtered out of every active view. | ☐ Claude (read-only rule: this write is hereby the authorized change) |
| 7 | **NULL-tenant canary**: extend Jacob's own 07:00 brief (smith-brief founder block) with `count(smith_call_log where tenant_id is null)` — must stay 0. (Small build; rides existing Slack plumbing, no new webhook needed.) | ☐ Claude |
| 8 | **aws_cosell/funding-fit coverage one-shot**: script the extension from 10 companies to every meeting- and proposal-stage deal for both tenants NOW (moved up from Week 2 so Jacob's later weeks are monitoring only) | ☐ Claude |
| 9 | **Invites**: generate from the members panel for alto + novalo | ☐ Jacob |

### 1c. Session 1 — "Första passet vid ratten" (45 min per rep, rep drives, Jacob never touches their keyboard)
**Hard rule (vacation): session 1 happens BEFORE the rep's semester or within their first 48h back — whichever comes first. If both slip past Aug 11 the window compresses fatally against Sep 1; escalate to the sponsor.**

- 00–03 Frame: "Det här är ingen demo. Du kör. Smith förbereder, du stänger. Säg högt när Smith har fel — det är så han blir bra."
- 03–08 Rep logs in via own invite, lands on own lens. Checkpoint: rep sees their own book and pipeline. (Their routed prospect list arrives as a clickable worklist in week 1 — today show the counts on the welcome card and reach the first prospect via `/next`.)
- 08–18 **THE AHA, rep's hands, rep's own deal**: Novalo rep picks the nearest of their 13 booked meetings, Alto rep one of 4 (fallback: the open proposal). Opens the account card, types `/forge`. Smith lays the meeting play in Swedish. Rep reads ALOUD and grades it: what's right, wrong, missing. Jacob writes down every correction.
- 18–26 Rep types `/next`, picks ONE move, executes it live — **copies the draft and sends it from their own inbox** (nothing is ever sent by Smith).
- 26–35 Rep types `/campaign`, reviews 2–3 drafts aloud, approve-or-kill, at least one goes out for real from their own inbox. Teach the signing rule: "inget går ut som du inte skulle signera själv." (Novalo note: gamla 'förlorad' kom från förra byrån — de är öppna igen.)
- 35–40 Rep drags ONE pipeline card to its true stage (first partner `stage_transitions` row ever) **and sets `next_action_at` on each of their booked meetings** — this is what makes the meeting-prep alarms computable (meetings have no calendar dates in the system; Recall capture is Jacob-side only and on hold).
- 40–45 **Mandatory close**: brief subscription switched ON in the room (Slack guest already sorted in 1b#4). "Imorgon 07:30 ligger Smiths hälsning i din Slack." Tape the routine card to the monitor. Book session 2. **State the claiming rule** (18 companies are routed 'both'): first to claim works it; a claimed account is theirs until released — say it now, not as a week-3 dispute.

**Pass criteria:** rep made ≥3 Smith calls with own hands; ≥1 thing left the building for real; subscription ON before goodbye.

---

## 2 · WEEKS 1–4

### Week 1 (Jul 20–25) — Meeting week: work the booked 17, no cold outreach
- **Partners:** Smith prep before each held meeting, Smith-drafted follow-up after (sent from own inbox), drag the card same day. Vacation-slipped meetings get a Smith-drafted rebook note queued for Aug 11. Alto also asks Smith for a close plan on its proposal.
- **Smith:** brief leads with "meetings needing prep" (computed from `next_action_at`, set in session 1); NBA surfaces the next booked meeting; amber alarm to Jacob if a meeting-stage account passes its `next_action_at` with zero Smith calls.
- **Forj:** ship the worklist doorway — PlatformWelcome own-fit counts click through to CompanyList filtered on `enrichment.icp_brief.partner` = own tenant (narrow column add, day-scale). Stand up kpi-sheet weekly lines + Friday Slack receipt.
- **Exit:** per-tenant weekly smith_calls ≥5; `last_stage_move` NOT NULL for both tenants; **every meeting-stage engagement has ≥1 smith_call_log row this week** (the computable proxy — no meeting-date join exists); brief delivered ≥4 days/rep.

### Week 2 (Jul 27–31) — Industrisemester trough: funding-fit on everything in flight, reply-independent by design
- **Partners:** 10 min/day even from the hammock: read brief, run funding-fit on a slice. Novalo: 13 meeting-stage + proposal + the won deal first, then top icp_score of the 71. Alto: 4 meetings + proposal + 18 in-flight. Nothing customer-facing scheduled — prospects are on vacation too.
- **Smith:** brief switches to signals mode (champion-watch job changes, cloud detections, "deals with unclaimed funding" counter that visibly climbs). Red alarm on 48h zero-call outside declared vacation days.
- **Forj (monitoring only — coverage one-shot already ran in Week 0):** verify per-tenant COGS now that tenant_id flows; tune vacation-adjusted alarms.
- **Exit:** funding-fit run on 100% of meeting+proposal-stage deals — **for Alto's non-AWS deals this means the on-their-own-cloud program read (Azure/GCP via the tri-cloud program maps); where no honest program fit exists the deal is marked "no funded angle" and that COUNTS as covered** (never force junk output). ≥3 active days per tenant; COGS line populating.

### Week 3 (Aug 3–7) — Money loop part 2: co-sell rhythm + campaign staging for the re-entry volley
- **Partners:** Novalo identifies ACE-loggable deals from the funding-fit passes. **The REP registers manually in the partner's OWN Partner Central seat — Smith only drafts the submission text. Forj-side PC-write stays gated. CONFIRM before this week that Novalo actually holds an APN/ACE seat; if not, this week's ACE work becomes the seat application itself.** The won deal is **attribution material** (an already-won deal is attribution material, NOT a new ACE registration — closed deals don't validate). **⚠️ Corrected 2026-07-20: there is NO "Aug 7 monthly checkpoint" and no monthly RA-ID submission — that deadline does not exist.** Revenue attribution under PRM is passive: set the tagging up once (Marketplace metering, `aws-apn-id` resource tag, or user-agent string) and AWS measures from the billing cycle, with attributed revenue appearing ~45 days after month close. Do not chase a 7th-of-month date; there isn't one. Both reps stage /campaign waves as DRAFTS (Novalo: Gatling re-attempt with the funding-fit hook, hot-first from the 172; Alto: Kundo-17 as wave one, hot property as wave two from the 599). Staged, NOT sent — aimed at Aug 11 when Sweden is back at its desk.
- **Smith:** /campaign drafts in the recipient's language with the funding hook; brief adds "staged and waiting" counter (NOT an "RA-ID deadline reminder" — there is no such deadline; see the Week 3 correction).
- **Forj (≤5h/wk):** drafts gate through **automated** smith-slop/smith-eval (scripts, not Jacob); Jacob spot-samples **max 5 drafts per wave**; wave size capped to what passes the automated gate. Wire kpi-sheet campaign columns.
- **Exit:** ≥2 staged waves per tenant; Novalo ≥3 ACE-eligible deals identified + passive attribution tagging set up on the won deal (no "by Aug 7" deadline, it does not exist); weekly calls ≥ week-2 (no backslide).

### Week 4 (Aug 10–14) — Re-entry volley: send, rebook, prove the habit
- **Partners:** fire the staged waves Aug 11–13 **from their own inboxes**, send rebook notes, work replies with /reply + /forge. Daily rhythm fully self-serve.
- **Smith:** brief leads with reply triage; Friday receipt posts the month scorecard per tenant.
- **Forj:** Jacob deliberately hands-off (founder-independence test) — watches alarms and the receipt only; **sends the annual paper with the scorecard attached** (this is the close the whole window was building).
- **Exit (= what the Sep 1 gate reads):** Aug smith_calls_mtd ≥20/tenant AND week 4 > week 2 (rising, not spiking); ≥1 wave sent per tenant; ≥2 stage advances per tenant in August; both reps active ≥3 days this week; margin (contract vs COGS) ≥95%/tenant.

---

## 3 · THE DAILY QUARTER (rep-facing card, tape to monitor — Swedish, no em dashes)

> **MORGONKVARTEN (15 min, varje arbetsdag, sedan stänger du)**
> 07:30 Läs Smiths hälsning i Slack med kaffet. Tre namn, varför just idag. Välj ETT.
> 07:32 Öppna Alloy. Din egen vy, din egen bok.
> 07:33 Klicka "Forge today's move" (eller skriv /forge). Läs. Stryk det som inte stämmer.
> 07:36 Svar igår? Klistra in det, skriv /reply. Justera med din egen ton. Skicka från din egen inkorg.
> 07:40 Gör draget: ring, boka, eller **kopiera utkastet och skicka från din egen inkorg**. Fler drag: /next.
> 07:44 Flytta kortet. Tavlan ska tala sanning, annars ljuger fredagsrapporten.
> 07:45 Klart. Stäng Alloy.
>
> Regel 1: Inget går ut som du inte skulle signera med ditt eget namn.
> Regel 2: Ett verkligt drag om dagen slår tio planer.
> Regel 3: Tar kvarten mer än 15 min efter vecka två, säg till Jacob. Då är det byggt fel, inte du.

**Veckorytm:** Mån = riktning (/next över boken + champion-flaggor först). Tis = /campaign-batch (30 min block). Ons = ringdag (60–90 min) + /aircover på ett konto. **Tors = pengadag** (30 min, låst från session 2): finansieringskoll → rep registrerar affären i sitt eget Partner Central → Smith skriver pappren. Fre = /report + sanningspass + 15 min med Jacob (t.o.m. 14 aug, sedan varannan vecka).

**Session 2 (week 2, 30 min): "Hur AWS betalar en del av din affär"** — rep runs the full money loop once on their own live deal (funding check → registration draft → /prm rhythm). Alto flex: if Alto's hottest deal is property/Quattro-shaped, run the block on their best cloud-fit account instead; the loop is the lesson. Honest line about the button: today the rep's own PC seat does the submitting; Smith writes, the rep files.

**Objection bank (session-ready, Swedish):** covered in the design output — "jag har min egen lista" (behåll den; Smith säger vilket namn som är varmt idag), "ännu ett verktyg" (dagen börjar i Slack, kvarten är taket), "AI-mejl låter fejk" (Smith skickar inget; ditt namn, din inkorg, din delete-knapp), "kontakterna är brända" (förra byråns nej, inte ert), "jag hinner inte" (juli står på noll just därför; kvarten är billigare än fredagspaniken), "varför blanda in AWS" (registrering ger inte bort affären; den får AWS att betala en del och dra åt ditt håll).

---

## 4 · INSTRUMENTATION (visible without asking anyone)

1. **kpi-sheet weekly lines per tenant**: smith_calls wtd/mtd + distinct active days + distinct users; stage_transitions count; funding-fit coverage %; campaigns staged/sent/replied; COGS + margin vs contract; **NULL-tenant call count (must stay 0 — the canary that attribution regressed)**.
2. **Brief alarms**: Jacob's 07:00 founder block gets red = 48h tenant silence outside vacation, red = NULL-tenant row, amber = meeting past `next_action_at` without prep, amber = staged wave untouched 5+ days. **Reps' briefs get the positive mirror only (deals with unclaimed funding, meetings needing prep) — never surveillance framing.**
3. **Friday Slack receipt** (15:00, reuses smith-brief plumbing): one message per tenant — pulse, stage moves, coverage, staged/sent, margin, one green/amber/red verdict per gate. Four consecutive receipts = the pre-evidenced Sep 1 day-91 decision AND the annual-paper proof artifact.
4. **Jacob degraded mode** (solo founder, July): alarms accumulate to Monday if unacknowledged; briefs and receipts run unattended; nothing in the loop hard-requires Jacob after week 1 except the two sessions and spot-samples.

## 5 · GATES (map to Marc's sheet)

| Gate | Measure | Marc mapping |
|---|---|---|
| Activation pulse | calls/wk ≥5 (W1) → ≥15 (W4), vacation-adjusted; 48h silence = red | "is anyone using it" |
| Output per customer | ≥1 partner stage move W1 → ≥2/wk W4 | output per customer |
| Loaded-book conversion | Novalo ≥3 of 13 meetings → proposal; Alto ≥1 of 4 (by Aug 14; existing book only) | closed revenue path |
| Money-loop depth | funding-fit 100% of meeting+proposal deals by W2 (honest "no angle" counts); ≥3 ACE-eligible identified + attribution tagging set up on the won deal (no Aug 7 deadline) | product-vs-desk |
| Day-91 leading indicator | W4: each rep active ≥3 days AND W4 > W2 calls (read Aug 10–14) | day-91 retention |
| Margin | contract price vs tenant COGS ≥95% (Jacob's own 440 calls cost $2.60 — holds trivially if attribution is clean) | product-vs-desk margin |

## 6 · OPEN CONFIRMATIONS (Jacob, before Jul 15)
1. Rep names/roles: Qubad = Alto? Anders = Novalo? (assumed from dialer + IAM history, never verified)
2. Sponsor yes from both owners + annual-paper conversation opened
3. Slack: guest invites vs email fallback
4. Smith language per partner (assumed sv — it's a setting)
5. Novalo's own APN/ACE seat exists? (gates week 3)
6. Reps' vacation windows (gates flex per rep)
