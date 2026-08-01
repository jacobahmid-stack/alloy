# FORGEBY PLATFORM SUPERPROMPT
### One building: forgeby.com and the platform, on one canon, with Rune working the wheels

**Status:** authoring brief, 2026-08-01. Grounded in a live extraction of the real files, not from memory.
**Decisions locked by Jacob (2026-08-01):**
- **Brand = Forgeby** (the company *and* the platform, one). **Rune** is the AI that works the wheels. **"alloy"** is a lowercase common noun for the forged output. (Confirmed "Forgeby + Rune".)
- **Design canon = Forged Light** (Familjen Grotesk + Martian Mono, box-crisp 2px, dark-forge). The landing AND the app match this 100%.
- **AWS-positive always.** Never negative, never indifferent.

> **One flippable pivot:** the brand architecture is B (Forgeby is company + platform; there is no separate "Alloy" product name). Everything below assumes B. If B ever flips, only the naming section changes; the canon does not.

---

## 0. What this is, in one line

Rebuild so that a visitor walks from **forgeby.com** through a sign-in into the **platform** and never feels a seam: the same dark forge, the same rail, the same type, the same 2px edges. The public page and the logged-in floor are one building, walked deeper. Rune is the maker at the anvil throughout.

---

## 1. The metaphor spine (organizes copy AND the platform IA)

Every actor gets ONE verb; none overlap. This is the story and the information architecture.

| Actor | Verb | Is |
| --- | --- | --- |
| **The market** | (lies in the ground) | the ore-bed: public registries, cloud fingerprints, hiring/growth events, reachability. Raw signal. |
| **Rune** | **mines** then **forges** | originates the net-new account, then fuses the signals into a ready opportunity. |
| **the alloy** | (comes out) | the forged output handed to the partner: one reachable, funded-door-eligible, Partner-Central-ready opportunity. |
| **AWS / Partner Central** | **scores + funds + co-sells** | the assay office: it scores, funds and co-sells what Forgeby brings it. The paying, certifying partner. |
| **The partner (you)** | **closes** | takes the alloy and closes it. "I forge it, you close it." |

**"Mine" means drawing ore from OPEN ground, lawfully. Never scraping private data.** If "mining" ever reads as harvesting, it undercuts the lawful-channel moat. Frame it as public-ground origination.

**Platform IA can run the chain literally:** ore/signals in → forge/qualify → alloy/ready opportunities → file to AWS → closed. The logged-in floor is the continuation of the run the landing narrates.

---

## 2. Voice and positioning (hard rules, every surface)

1. **AWS-positive, additive, never negative or indifferent.** The line is **"AWS scores your pipeline. We build it."** (then AWS funds it, you close it). AWS does its part; Forgeby builds the part that completes it. NEVER "AWS never builds you one", "AWS refuses", "AWS leaves you stranded", and never a detached "AWS does its thing, we do ours". Warm ally register. The moat (origination is hard, we do it) is stated as OUR strength, never AWS's failure.
2. **AWS is "it", always singular.** Never "they/their/them" for AWS.
3. **No em dash. Anywhere.** In any Forgeby / alloy copy or Rune output. Use commas and periods.
4. **Commercial buyer language, never engineer/backend jargon.**
5. **Lead with MANUFACTURE** (making net-new opportunities), not a flywheel or automation-volume story. Origination is the defensible line; the flywheel is commoditized by AWS's own agents.
6. **Outcomes only in public.** Never expose vendors, data sources, enrichment/backend methods, economics (pricing math, unit costs, credit/MDF mechanics), or partner names (customers' customers) on any public surface. The moat is the manufacture; exposing how it is made hands it away.
7. **No AWS ACE / co-sell pipeline shown publicly** at any granularity without written PDM consent (§8.11). Use an AWS-free own-book gauge instead.
8. **No numeric magnitude or AWS-programme rule goes public without a primary AWS source.** A Forj internal doc is not a source. Several load-bearing "facts" have shipped false.
9. **Ember lights the single operative verb** (e.g. "forges") and nothing else. One gesture of heat per line, never a heated headline.
10. **Rune = amplify, not replace.** "I forge it, you close it." Never the retired descriptors "AI engagement manager" or "AWS pipeline co-worker". The human always closes.

---

## 3. The canon: FORGED LIGHT (dark-forge). Exact values.

The building is dark. Separation is carried by a 1px hairline plus a one-step surface change plus a single warm ember glow. **Zero drop shadows on content.** Corners are near-square. Micro-type is machined mono. This is "identity, not styling".

### 3.1 Color tokens (dark-forge, single theme)
| Token | Value | Role |
| --- | --- | --- |
| `--void` | `#0A0E13` | Darkest surface. Rail, footer, text inputs, canvas. NOT the body. |
| `--steel` | `#111820` | **Body / main-scroll ground.** Also ink-on-violet (button text). Also plain screenshot-card bg. |
| `--plate` | `#18212C` | Raised card / panel surface. |
| `--rule` | `#26313E` | Default 1px hairline: borders, section dividers. |
| `--rule-hot` | `#33404F` | Hover / focus-within hairline. |
| `--control` | `#53606F` | Default text-input border (hover/focus → `--violet`). |
| `--ink` | `#E6EDF3` | Primary text; the Forgeby glyph fill. |
| `--ink-mid` | `#9FB0C0` | Secondary text, ledes, labels. |
| `--ink-dim` | `#7C90A4` | Tertiary / muted, captions, metadata. |
| `--violet` | `#9E92D8` | **THE single fixed accent.** Links, button fill, active rail state, focus ring, code-on. |
| `--violet-hi` | `#B9AFE4` | Accent hover. |
| `--quench` | `#FF4D1F` | Live-dot pulse only (the "liveness" signal). |
| ember | `#E2622A` @ 7-10% alpha | The single warm section glow (radial). Content accent, never chrome, never status. |

**Cloud-viz palette (categorical, theme-invariant):** AWS `#D98A33`, Azure `#4C9DEA`, GCP `#E4645A`, no-major-cloud `#8FA3B5`, not-yet-read `#4F6174`. **`#FF9900` is BANNED absolutely** (never impersonate AWS chrome). **App status colors:** success `#5FB85A`, warning `#D7A23F`, danger `#E8694A`, "quench steel" secondary `#4C9DEA`.

### 3.2 Type
- **Familjen Grotesk** carries the entire human voice: display, headings, body, wordmarks, AND labels' fallback. Self-hosted `@font-face` (already in the app's `index.css`).
- **Martian Mono** carries EVERY numeral, stamp, table, eyebrow, section label, pill, button label and code chip. **Its width axis is the signature:** `font-stretch: 75%` for condensed labels, `112.5%` for expanded big data numerals. `font-variant-numeric: tabular-nums` everywhere numbers align.
- **Retired, never reintroduce:** Inter, Space Grotesk, Space Mono (the AI-startup default pairing, deliberately rejected). Also DM Serif / Bricolage / DM Sans.

| Role | Size | Weight | Family | Detail |
| --- | --- | --- | --- | --- |
| Display / H1 | `clamp(52px,6.5vw,96px)` | 500 | Familjen | leading .95, tracking -.03em, balance |
| H2 | `clamp(30px,3.4vw,44px)` | 500 | Familjen | leading 1.1, -.02em, balance |
| H3 | 21px | 500 | Familjen | leading 1.3 |
| Body | 17px (app may go 13 for density) | 400 | Familjen | leading 1.55, measure 62ch |
| Big data numeral | `clamp(40px,5vw,72px)` | 300 | **Martian**, stretch 112.5% | tabular, .01em |
| KPI value (app) | 38px | 300-400 | **Martian**, stretch 112.5% | accent-colored, tabular |
| Data / legend num | 15px | 500 | **Martian**, stretch 75% | tabular |
| **Label / eyebrow / pill / button / code** | 11px | 500 | **Martian**, stretch 75% | **.14em, UPPERCASE** |

### 3.3 Radius, shadow, motion
- **Radius: `2px` on EVERY box** (buttons, cards, panels, inputs, modals, popovers, rail controls, chips). **`999px` only for true pills and dots.** `50%` only for the account avatar. **No 6/8/9/10/11/12/14/16/18/20 anywhere.**
- **Shadow: none on content.** Separation = 1px `--rule` + surface step + the single ember. Overlays (popover, tooltip, modal) separate with a **1px `--rule` border on a `--plate` surface**, not a shadow. If exactly one menu shadow is required for legibility, flag it as the single sanctioned exception; default is none.
- **Ember:** one warm radial per long section, e.g. `radial-gradient(1100px 540px at 74% -14%, rgba(226,98,42,.10), transparent 68%)`. Delete any multi-color (amber/blue/green) glow stacks.
- **Motion:** `--ease-in-out: cubic-bezier(.22,1,.36,1)`. Link hover = a 1px violet underline drawn via `scaleX` over .18s. Live-dot pulse 2.8s. **Full `prefers-reduced-motion` reset required.**
- **Focus ring:** `outline: 2px solid var(--violet); outline-offset: 2px; border-radius: 0`. Global.

### 3.4 Components (build these exactly)
- **Button primary (`.btn`):** fill `--violet #9E92D8`, text `--steel #111820`, 1px `--violet` border, **radius 2px**, Martian Mono 11px/.14em/stretch75/UPPERCASE, padding 13px 22px, hover fill+border `--violet-hi #B9AFE4`.
- **Button ghost (`.btn--ghost`):** transparent, text+border `--violet`, hover `--violet-hi`. (The rail CTA and secondary actions.)
- **Pill:** transparent bg, 1px `--rule` border, **radius 999px** (or 2px for a code tag), Martian Mono 10-11px/.14em/stretch75/UPPERCASE, `--ink-mid` text. Variant `code--on`: border+text `--violet` (for MAP / PoC tags). No color washes.
- **Card / plate:** bg `--plate #18212C`, plain **1px `--rule` all-round** (hover `--rule-hot`), radius 2px, no shadow, padding `clamp(18px,2.6vw,24px)`. Accent appears only on a KPI value, never as a 3px top-bar.
- **Text input:** bg `--void`, 1px `--control #53606F` border (hover/focus `--violet`), radius 2px, Familjen 15px, placeholder `--ink-dim`.
- **Stamp eyebrow:** `icon · Martian-mono hour · label · trailing 1px --rule`. The repeating section header.
- **Live pill:** 1px `--rule`, radius 999px, `--ink-mid`, with a 6px `--quench` dot pulsing.

### 3.5 The Forgeby mark
Anvil glyph, **no text wordmark**. SVG `viewBox 0 0 512 512`, single path:
`M228 84 L284 84 L432 428 L344 428 L256 264 L168 428 L80 428 Z`, `fill: currentColor`. 26px in the rail, 24px in the footer. The AI (Rune) is marked by its portrait in an ember ring, never a lettermark. Fire lives ONLY in Rune's ring and in working content accents (heat-then-quench, the strike burst, the lit verb "forges").

---

## 4. The one shared rail (the chassis that hosts both surfaces)

A fixed left column, identical skeleton on the public page and in the app. **Only the middle destination stack changes.**

- **Frame:** `position: fixed; left:0; top:0; bottom:0; width:72px; background: var(--void) #0A0E13; border-right:1px solid var(--rule); z-index:40`. Shown at `>=1080px`.
- **Top:** the Forgeby anvil glyph (~26px, `fill:--ink`) linking home.
- **Middle (the only variable part):**
  - *Public (forgeby.com):* the section destinations (The stakes, The manufacture, Why it is real, Rune) + Read + Pricing, as the run-progress nav.
  - *App:* the workspace nav, thin monoline icons: Dashboard, Companies, Discover, Funding, Today, Co-Sell, Import. Active = `--violet` icon + a 3px accent left bar + `rgba(158,146,216,.16)` wash. Group boundaries = a 20x1px `--rule` hairline, not a text header (icon-only rail).
- **Bottom:** the primary CTA (public: "Name your market"; app: the account control). **No theme toggle** (dark-only building).
- **Below 1080px:** collapse to a `--void #0A0E13` horizontal top bar, 56px, `border-bottom:1px --rule` (never a paper row). The landing may keep its 3px `--violet` scroll-progress bar + current-section chip.
- **The seam:** the index footer's "Partner sign in" link to the app is the literal door. Public "Read a company" rail and the app's workspace nav are the same void column with a different destination list.

**Tooltips/popovers off the rail:** 1px `--rule` border on `--plate`, radius 2px, no shadow.

---

## 5. Section rhythm (the app echoes the landing)

The landing tells the nightly run as a vertical scrollytelling timeline; the rail doubles as its progress bar. The repeating unit is:

> **MONO STAMP EYEBROW** (icon · hour · name · trailing rule) → **H2** → a few restrained body ledes, one idea per full-width band, ledes capped ~640px.

Render the app's morning **Letter / brief** as the same stacked, timestamped bands, so the logged-in surface reads as the continuation of the run. One idea per band. Vast calm fields of warm dark broken by one gesture of light and one line of type. Restraint is the luxury.

---

## 6. Workstream A: re-skin the landing onto Forged Light

The newest hero page (`alloy-landing/index.forgeby.html`) has the right **content, positioning, IA and hero** but the wrong **skin** (Inter + Space Grotesk, rounded 14-20px, light/dark, drop shadows). Keep the words, change the skin.

1. **Hero copy → AWS-positive:** "AWS scores your pipeline. **We build it.**" (drop "It never builds you one"). Keep "Name your market" as the primary CTA. The lit verb is "build"/"forge" in ember.
2. **Fonts:** Space Grotesk → Familjen Grotesk; Inter → Familjen Grotesk; introduce Martian Mono for every numeral, eyebrow, label, pill, button and code chip (stretch 75% / 112.5%).
3. **Radii:** every 8-20px box → 2px; pills/dots → 999px.
4. **Elevation:** delete every drop shadow; separate with 1px `--rule` + surface step + the single warm ember.
5. **Palette:** move to `--void / --steel / --plate / --rule / --ink*` and the fixed `--violet #9E92D8`. Body ground `--steel #111820`, not pure black.
6. **Theme:** dark-only. Remove the light toggle and its localStorage flag.
7. **Rail:** conform to Section 4 (72px void chassis, Forgeby glyph, mono run-stamps).
8. **Then migrate `smith/`, `pricing.html`, `integrations.html`, and the legal pages off System B onto this same canon**, and canonicalize the footer to one pattern that keeps the "Partner sign in" app seam. One site, one system.

> Retire `index.html` (the older "The funded AWS deal" run-narrative) in favor of the re-skinned `index.forgeby.html` as the canonical landing, OR fold its live-canvas hero into the Forgeby page. Jacob's call on which hero mechanic survives; the *skin* is settled.

---

## 7. Workstream B: finish the app to match 100%

The app (`alloy-page/src/forge.jsx`) already implements Forged Light as its dark theme (the 2026-07-29 reskin). This is a finishing pass, not a rebuild. Exact edits (line refs approximate to the current file):

1. **Go dark-only.** Delete the `LIGHT` theme object; make `THEMES.light = DARK` (or pin `_theme = 'dark'`); strip the toggle path + `localStorage 'alloy:theme'`. Remove the context-bar toggle button and the account-menu "Light/Dark" item. Pin accent to fixed `#9E92D8` (hover `#B9AFE4`); drop `accentDark / accentFill / lime / #4B3CA0`.
2. **Delete the stale font loader.** Remove `const fontLink = ...` (Google Fonts: Space Grotesk / Space Mono / Inter) and its `<link>`. Real faces already load from `index.css`.
3. **Ground + ember.** Main scroll bg `--void` → `--steel #111820`; replace the amber/blue/green radial stack with the single warm `#E2622A` ember. Reserve `--void #0A0E13` for rail, context bar, inputs, footer.
4. **Focus ring:** outline-offset 1px → 2px; accent fixed `#9E92D8`.
5. **Rail:** grid track `64px` → `72px`; `aside` bg `C.bg` → `railBg #0A0E13`; add `border-right:1px solid #26313E`; wire contents to `railText #E6EDF3 / railMuted #9FB0C0 / --rule`. Swap the `ForjLogo` wordmark for the Forgeby anvil glyph. Rail icon buttons + workspace switcher radius 10 → 2 (keep the 3px accent left bar + `rgba(158,146,216,.16)` wash; keep avatar 50%). No theme toggle.
6. **Kill overlay shadows.** Popovers, rail tooltip, modals: remove `box-shadow`; separate with 1px `#26313E` on `#18212C`; radius → 2.
7. **Rebuild `Btn`** to the landing `.btn` (violet fill `#9E92D8`, steel ink `#111820`, 1px violet, radius 2, Martian Mono 11px/.14em/stretch75, padding 13px 22px, hover `#B9AFE4`). Add the `ghost` variant.
8. **Rebuild `Pill`** (transparent, 1px `#26313E`, radius 999 or 2, Martian Mono 10-11px/.14em/stretch75, `#9FB0C0`; add `code--on` = `#9E92D8` for MAP/PoC).
9. **Move micro-labels to Martian Mono** (section h3 eyebrow, metric label, breadcrumb, pill labels): stretch 75%, .14em, uppercase.
10. **Cards / `Metric`:** surface `C.panel #111820` → `panel2 #18212C`; replace the 3px accent top-bar with a plain 1px `#26313E` all-round (hover `#33404F`); keep radius 2 + no shadow; widen padding toward `clamp(18px,2.6vw,24px)`; accent only on the 38px value.
11. **Modals:** radius 14 → 2; remove shadow → 1px `#26313E`; save button restyled to the landing `.btn`.
12. **Text inputs:** default border `--control #53606F`, bg `--void`, hover/focus `#9E92D8`.
13. **Responsive collapse (<900px):** rail becomes a `--void #0A0E13` horizontal top bar with `border-bottom:1px #26313E`, not a paper row.

---

## 8. Workstream C: the Forgeby / Rune rename (GATED)

**Do not touch code names until the Forgeby name is secured** (domains + npm/PyPI/GitHub org, then TM knockout + EUIPO filing classes 9/35/42). See the brand-decision memory. When cleared:
- `BRAND "ALLOY"` / `BRAND_FULL "ALLOY by FORJ"` → **Forgeby**. `ForjLogo / AlloyMark` → the Forgeby glyph.
- **Smith → Rune** across the shell, personas, briefs, and the partner-trio email ("Alloy by Forj" → Forgeby). This is a large rename (canon-locked persona, ~261 voice/gate tests, shipped surfaces). Schedule as its own sweep.
- Remove the now-dead light-rail sub-palette tokens once the light theme is gone.

---

## 9. Acceptance criteria (match-100% checklist)

- [ ] Landing and app share: `--void/--steel/--plate` palette, fixed `--violet #9E92D8`, Familjen Grotesk + Martian Mono, 2px on every box, zero content shadows, one warm ember, the 72px void rail with the Forgeby glyph.
- [ ] No Inter, Space Grotesk, Space Mono, or `#FF9900` anywhere. No rounded (>2px) boxes except true pills/dots.
- [ ] Dark-only end to end; no theme toggle on either surface.
- [ ] Every eyebrow/label/pill/button/code is Martian Mono, stretch 75%, .14em, uppercase.
- [ ] Signing in from forgeby.com is seamless: same rail, same edges, same fire. The "Partner sign in" seam works.
- [ ] Every AWS reference is "it", singular, and every AWS line is **AWS-positive** ("we build it"), never negative or indifferent.
- [ ] No em dash; buyer language; outcomes only; no exposed methods/economics/vendors/partner names; no public ACE pipeline; no unsourced magnitudes.
- [ ] Rune is amplify-not-replace; the human closes.

---

## 10. Do NOT

Inter / Space Grotesk / Space Mono · rounded 14-20px cards · drop shadows on content · a light theme or toggle on the product surface · `#FF9900` or AWS-chrome mimicry · multi-color ember stacks · AWS-negative or AWS-indifferent copy · em dashes · exposing vendors, methods, economics, partner names, or an AWS co-sell pipeline in public · unsourced AWS magnitudes · the retired descriptors "AI engagement manager" / "AWS pipeline co-worker" · renaming code before the Forgeby name is secured.
