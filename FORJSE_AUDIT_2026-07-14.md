# forj.se FULL AUDIT — 2026-07-14 (Fable, 7-dimension workflow + adversarial verify)

**Method:** 7 auditors (truthfulness/launch-gate, copy/brand, design/UX, SEO, a11y, security/privacy, performance) over the live site + source (`alloy-landing`), 64 findings → deduped → 14 load-bearing verified against the LIVE endpoint (zero false alarms in the verified set).

**Verdict: FIXABLE-THEN-SHIP.** Foundations are genuinely solid. Four launch-gate items are still live; all four are concrete and fixable. Do them and you can post.

> **✅ ALL 4 MUST-FIX DONE 2026-07-14.** (1) `forj_public_stats` locked to 5 aggregate scalars, applied live + anon-verified (alloy-page `5d7fcd8`, box/sql record). (2) Proof-band hardcoded 20/3/1 fallback removed → hides on null/zero, never fabricates (landing `b15be53`); RPC returns the real 20/3/1 today so no visible change. (3) "as equals" reframed to AWS-first in all 4 spots (landing `b15be53`). (4) cookies.html Google-Fonts-before-consent removed → self-hosted (landing `b15be53`). Landing 2+3+4 deploy via Amplify on the `landing` push. **Jacob still owns:** confirming "first funded deal closed in week five" + "two hyperscaler partners" prose is literally true (the numbers are RPC-real; the prose is your claim). Then the SHOULD-FIX + POLISH lists below remain, none launch-blocking.

---

## 🔴 MUST-FIX before Post #0

### 1. CRITICAL — `forj_public_stats` leaks the crown asset to any anonymous visitor
Called with the embedded anon key (index.html:1066/1098). The page paints only 5 scalar counts, but the RPC also returns to **any anonymous caller**: **named company arrays** with Forj's per-company cloud/play verdict AND a ranked **vendor-adoption table** (`partner_signals`: Microsoft 365=5720, Cloudflare=4840, Sentry=1456, HubSpot=1029, Salesforce=725…). Two verify agents independently POSTed the live endpoint and confirmed it. This is the entire cloud-detection dataset handed to a competitor in one request, plus a machine-readable named list about uninvolved third parties (GDPR-adjacent).
**Fix (server-side, Claude-doable):** rewrite the `forj_public_stats` Postgres function so the anon-role response returns ONLY `companies, aws, azure, gcp, decision_makers`. Drop `aws_companies/azure_companies/gcp_companies/migrate_companies` and `partner_signals/partner_signal_companies`. Verify a consumer check first (the page reads only the 5 scalars — confirm nothing else needs the arrays), then re-verify the live JSON shape.

### 2. HIGH — proof band can paint fabricated "real" numbers
Copy says "We publish these numbers because they are real," but the client hardcodes `OFB={meetings:20,proposals:3,wins:1}` and paints it whenever the outcomes RPC returns null OR all-zeros (index.html:1103-1109). A backend hiccup or a genuine 0/0/0 renders fabricated non-zero proof under an absolute-truth claim.
**Fix — two parts:** (a) **Jacob confirms** 20/3/1, "first funded deal closed in week five," and "two hyperscaler partners" are literally true today (these are real Desk-run engagement records, not seeds). (b) **Remove the hardcoded fallback** — on null/zero/error, hide the band or show a neutral "building the first cohort" state; never paint a constant under "these numbers are real."

### 3. HIGH — retired "as equals" cloud framing still live in 4 spots
`index.html:790` "Tri-cloud by default, AWS, Azure and Google Cloud as equals", `:873` "sits beside AWS and Azure, as an equal", `:884` FAQ "AWS, Azure and Google Cloud, as equals", `pricing.html:252` same. Contradicts the resolved AWS-first specialist identity (a known-fix item that never shipped).
**Fix:** reframe every instance to AWS-first specialist / any-cloud-on-pull; delete every "as equals" / "as an equal" / "Tri-cloud by default" string. KEEP the correct "never move them off their cloud" sentence.

### 4. MEDIUM — cookies.html loads Google Fonts before consent
`cookies.html:15-17` loads fonts from Google's CDN (preconnect + stylesheet) on page load — transmitting IP/UA to Google (US) before opt-in, on the exact page that promises nothing non-essential runs pre-consent. It's the only page not self-hosting `/fonts/fonts.css`.
**Fix:** delete the two Google Fonts `<link>` + the gstatic preconnect; load the self-hosted `/fonts/fonts.css` like every other page; restyle to Space Grotesk/Mono.

---

> **✅ SHOULD-FIX + POLISH BATCH DONE 2026-07-14** (landing `176e652`/`96d5de9`, render-verified on the local preview: `<main>` wraps content, AWS is the default tab, skip-link + rail aria-labels live, 0 console errors, 0 em-dashes site-wide). DONE: a11y cluster (`<main>` + skip-link + rail aria-labels), account-read defaults to AWS, "companies analyzed"→"tracked" + stale fallback refreshed (10069→18911), demo-workspace CTAs repointed to the live free read (login-wall risk removed), "Amazon Quick"→"Amazon Quick Suite", Smith "verifiable AI agent"→"AI co-worker", decoder "His name works", "Forj/Alloy"→"Alloy by Forj", pricing "a fraction of a standalone data license", pricing meta 2900 founding rate, console autoplay→play-on-interaction (stillness), Organization JSON-LD.
> **HELD (Jacob's call — judgment/ground-truth needed, noted for you):** (1) repetition trim of the "human approves" theme — the instances are in *different* contexts (stance section, a feature card, an FAQ, the footer motto), not pure duplication, so cutting risks tuned copy; point me at the specific ones to cut. (2) nav-chrome unify (rail vs top-bar vs minimal) — a real redesign, not a bug; per-page chrome may be intentional. (3) smith-page hard-locked dark — the passport page is designed dark and may lack light-theme vars, so forcing the saved theme could break it. (4) integrations tile Live/Roadmap markers — needs your ground truth on which connectors are genuinely customer-live vs on-request (mislabeling would be a truthfulness risk). (5) location Gothenburg (company) vs Stockholm (data) is NOT actually inconsistent — kept both, distinct meanings.

## 🟡 SHOULD-FIX (before or just after launch)
- **Demo CTAs** ("Explore a sample workspace" ×2, integrations "Open the live workspace" → `/?demo`): confirm `/?demo` loads a real read-only sample, not a login wall; if it gates, hedge the button ("Book a walkthrough").
- **"companies analyzed"** overstates bare registry rows; stale hardcoded fallback 10,069 vs live ~18,911. Soften the verb ("companies tracked/in the map") and refresh/drop the fallback.
- **A11y cluster:** no `<main>` landmark on the 4 top pages; no skip-link anywhere; on mobile (≤780px) rail links lose their accessible name (text span display:none + aria-hidden SVG). Add `aria-label` per rail link, a skip-link, and `<main>`.
- **"Amazon Quick"** (index:748) → "Amazon Quick Suite" (an AWS-literate buyer reads it as a typo of "Amazon Q").
- **Smith "verifiable AI agent"** (smith title/h1) contradicts "AI co-worker" everywhere else + risks the "AI agent" framing; align to co-worker.
- **"Forj / Alloy" lockup** (integrations:109) vs canonical "Alloy by Forj".
- **Tri-cloud defaults:** the interactive Account Read opens on the AZURE tab; co-sell band shows parity — defaults contradict AWS-first. Default to AWS.
- **Nav chrome** changes shape across pages (left rail vs top bar vs minimal) — unify.
- **Repetition:** the "software forges, human approves" promise restated ~8× across ~13 homepage bands (past the one-home rule). Cut to ~3.
- **Smith console autoplay** (1113-1124) auto-fires a multi-second typewriter on scroll — against the stillness law; make it play-on-interaction.

## 🟢 POLISH
pricing "a tenth of a data license" (unbacked comparative → soften) · location inconsistent (Gothenburg vs Stockholm — say once) · integrations tiles need "Roadmap"/"On request" markers (only HubSpot Live) · pricing meta still "from 3 900 SEK" vs 2 900 founding rate · smith decoder "His works the same way" (dropped referent) · motto punctuation (comma vs period — pick "I forge it, you close it.") · smith page hard-locked dark (ignores saved theme) · hero demo CTA same-tab (drops funnel) · dead CSS rail width (48 vs 56px) · no schema.org/JSON-LD anywhere (add Organization + Product).

## ✅ PRESERVE (genuinely good — don't regress)
Em-dash ban fully honored (source + live) · free-read widget's two known overclaims already FIXED (cloud starts empty "pick the cloud you sell first"; teaser hedges workspace) · Smith canon intact (openly AI, no fabricated past, decoder maps to real facts) · vendor discipline correct on marketing pages (only "EU region/Stockholm", no backend names) · Desk 100k kept OFF public pricing · anti-token SPINE live verbatim on pricing:243 · how-we-read.html is a strong aggregate-safe truthfulness asset · consent scaffolding right (Consent Mode v2 default-deny, GTM/GA4/Albacross gated) everywhere except the cookies.html font slip.

## ❌ FALSE ALARMS (killed by verify — do NOT re-raise)
Widget-AWS-default, workspace-teaser overclaim, and "companies read" wording were ALL already fixed; the "em dash in live copy" was a WebFetch paraphrase artifact (raw source is clean).
