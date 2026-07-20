# FORJSE_REBUILD_PROMPT.md - the rebuild instrument (fire verbatim)

The fourth protocol instrument. NORTHSTAR_AUDIT = truth. COPY = words. GRAPHICS = pixels. REBUILD = structure and currency. Fire this when forj.se must be rebuilt around what is true TODAY. Anchor date: set it to the day you fire.

---

## THE PROMPT (copy everything below this line)

You are rebuilding forj.se end to end. You hold three jobs at once and are held to all three bars: a senior AWS partner development manager who has carried a quota (every claim must survive a partner who knows the programs), a design lead at a studio known for restraint (every pixel must survive the brand canon), and a fact auditor (every number, date, and capability statement must be true on the anchor date). ultracode is on: fan out, verify adversarially, and let no finding ship unexamined.

ANCHOR DATE: 2026-07-16. Everything on the site must be true as of this date, and nothing on the site may be staler than its replacement in the canon.

### Phase 0. Read the canon, in this order, before touching anything

1. `C:\Users\jacob\alloy\SMITH_CAPABILITY_MAP.md` - the fifteen jobs with honest statuses. This is the site's substance. Anything the site claims must trace to a LIVE line here. DEPLOYED-GATED and SPEC lines never appear on the site.
2. The ARC LINE (Jacob-approved, the organizing sentence): "Territory overnight. Brief in the morning. Into the room with you. Follow-up and paperwork on the way out. You keep the send button." Five beats. This is the page's spine, not a tagline to paste.
3. THE TWO MODES (canonical, never conflate): Desk-led ("Forj works the outbound") is proven with closed revenue. Self-serve (your reps run Smith) is how most partners will run it. Both get named; the proof attaches to the machine, not to one mode.
4. `C:\Users\jacob\alloy\brand\BRAND.md` + the canon color system: grounds = warm bone paper (light) and near-black soot (dark); ONE brand color, steel-violet #4B3CA0 / #7B6BCB / #9E92D8; ember #D9722E as content accent only (#C0561A text on light); AWS amber family anchored #D98A33 (#C17A12 text on light) for cloud tags only. #FF9900 is banned absolutely. Marks are OLED violet on the #141310 tile. Material over glow. Stillness law: motion is rare, earned, and respects prefers-reduced-motion.
5. `C:\Users\jacob\alloy\FORJ_ICP.md` - who the page speaks to: Nordic AWS partners, roughly 10 to 200 people, tiered. Write for their owner or sales lead, not for engineers ("commercial not technical copy").
6. The redaction law: the public site shows OUTCOMES ONLY. Never vendors, never backend, never methods, never economics, never partner or customer names. The meeting arc's supply chain (the bot vendor, the transcription provider, the storage host) is NEVER named; say what it means ("the whole meeting chain runs on EU soil"), not what it is.
7. The single sanctioned backend mention: "Built on Amazon Bedrock in the EU" lives in the Smith console footer, once. A second placement anywhere requires Jacob's explicit yes; propose it if you believe the governance band earns it, but build with one until he says two.

### Phase 1. AUDIT (fan out, then adversarially verify every finding)

Run parallel audit lenses over the live site (repo: `C:\Users\jacob\alloy-landing` on the `landing` branch, deployed to forj.se via Amplify; audit index.html plus smith/index.html, pricing.html, integrations.html, trust.html, live.html):

- TRUTH-VS-TODAY: every claim, number, count, and date on the site checked against the capability map and the anchor date. Flag anything stale (library counts, feeder counts, "what's new" items, copyright years, OG metadata) and anything the last month made true that the site does not yet say (the meeting arc is LIVE; the two modes; the proof chain).
- ARCHITECTURE: does the page's band order tell the arc? Map every existing band to a beat of the arc line or mark it homeless. Homeless bands are candidates to cut, merge, or move to a subpage.
- OUTCOME-CENTERING: the hero and the first screenful must lead with outcomes forged by Smith, not features. Grade the current hero against this bar.
- CONNECTED-AND-WHY: is there a band that shows WHERE Smith shows up (the app, Slack, the rep's own CRM, inside other assistants) and why that matters to a buyer (no new tab to live in, the read follows you)? Today this is one thin strip; grade it as under-told.
- GOVERNANCE-AND-EU: is there a band that carries the trust story as a story (human approves every send, every run logged, spend caps, workspace isolation, EU residency end to end, evals with teeth), not as a checklist? The strongest new fact: the meeting chain is EU-resident end to end. Tell it without naming a single vendor.
- THEME COVERAGE: every mockup, screenshot, and illustration graded in BOTH light and dark. Product screenshots currently exist only in dark; that is a defect, not a style.
- CRAFT: accessibility (contrast in both themes, keyboard, focus states, reduced motion), performance (image weights, lazy loading), dead CSS, mobile at 375 px.

Every finding passes an adversarial verify (a second agent tries to refute it) before it reaches the fix list. Kill authority is real: findings that do not survive verification are dropped, not softened.

### Phase 2. PROPOSE the new architecture before building

The prescribed spine (deviate only with a reason a design lead would sign):

1. HERO - outcome-led. Smith forges the funded AWS deal; you close. Proof numbers in the first screenful, aggregate-safe (see HELD FOR JACOB before adding any number not already public on the site).
2. THE ARC - five bands, one per beat, in order. Each band = one beat's name, one buyer-language paragraph, one visual (product capture or sanctioned Smith art), and the capability it proves. Beat 3 ("into the room with you") is NEW to the site and now true: Smith briefs before the meeting, joins the call as a visible notetaker, and returns with decisions, action items, and a drafted follow-up. Two selling points live in this beat: LANGUAGE (Smith listens in the customer's language, any European language, auto-detected, and the brief and follow-up come back in that language) and CONSENT (the bot announces itself; recording is never silent).
3. MEET SMITH - identity moment (openly an AI, the fusion paragraph, the console demo). Keep; sharpen only against the anchor date.
4. CONNECTED, AND WHY IT MATTERS - the distribution band, promoted from a strip to a band: Alloy is the workshop, but the read follows the rep into Slack, into their own CRM, into the assistant they already use. Buyer meaning: no new tab to live in, no data hostage, works where the team already works.
5. GOVERNANCE AND TRUST - the story band: a human approves every send (the design, not a limitation); every run logged under a spend cap; each workspace isolated; everything EU-resident, end to end, including the meeting chain; output held to an eval gate before it reaches you. One sanctioned Bedrock line placement per the canon rule.
6. THE TWO MODES + PRICING, SIMPLIFIED - two clear doors: "Your reps run Smith" and "Forj works the outbound." Two prices, one sentence each, the spine line ("We don't sell you tokens..."), and a link to pricing.html. Rework pricing.html to the same two-door shape; rolling quarters stays but becomes a supporting detail, not the headline.
7. INSIDE ALLOY - the shots band with the CAROUSEL V2 and BOTH-THEME captures (spec below).
8. FAQ + CTA - keep, re-verify each answer against today, CTA stays "Book a call" (launch gate: no signup, no self-serve, no waitlist form beyond what exists).

### Phase 3. BUILD

- One-file inline discipline (index.html on the landing branch), design tokens only, no new dependencies, no external assets. Grep for dead CSS after every band you cut.
- MULTI-THEME MOCKUPS (hard requirement): every product screenshot is captured TWICE, light and dark, at 1600x1000 with deviceScaleFactor 2, exported WebP quality 88. Serve theme-aware: both images in the DOM with CSS gating (`:root[data-theme="dark"] .shot-light { display:none }` and the mirror), so the toggle swaps instantly with no JS and no flash. prefers-color-scheme fallback for first paint. The shooter pattern exists in the session scratchpad (Playwright, channel chrome, localStorage theme keys `alloy:theme` and `forj-theme`).
- CAROUSEL V2 (hard requirement): replace the static overflow strip. Vanilla JS, CSP-safe, no library. Scroll-snap rail with: previous/next buttons (44 px targets, disabled states at the ends), drag and touch swipe, keyboard arrows when focused, a counter ("3 of 6") plus dots, visible captions per slide, lazy-loaded images, and a subtle active-slide affordance. NO autoplay (stillness law). Full prefers-reduced-motion respect (snap without smooth-scroll). Both themes. Focus states visible. Test with a keyboard only.
- Copy passes the standing gates as it is written, not after: zero em or en dashes, "fit" never "qualify", no AI-tell vocabulary, buyer language only, language of the page is English, program names exact (MAP, MAP Lite, POC, PGP, MDF, ACE, the Partner-Led Sales Motion and Pioneer Credits may be NAMED but never given invented amounts or thresholds).

### Phase 4. VERIFY (nothing ships on trust)

- Full-page screenshots, BOTH themes, desktop and 375 px mobile, every band eyeballed by a design-critique agent against the brand canon.
- `node --check` every inline script block (the free-read widget died once from an unchecked script; never again).
- Grep gates: zero em/en dashes in copy; zero banned words ("qualify" in our voice, "unlock", "leverage", "seamless", "delve", "robust", "empower"); zero vendor names (search explicitly for the meeting-chain vendors, the data vendors, and every backend name you know); zero #FF9900 or retired ramp hexes; "two hyperscaler partners" absent; no AWS logos or badge art.
- Truth re-check: an agent re-reads the finished page against the capability map line by line. Any claim without a LIVE line dies.
- Link check every href. OG/meta and structured data updated to the anchor date. Favicon and share-card consistency.
- The free-read widget, the console demo, and every interactive element e2e-tested on the built page before push.
- Ship: commit to the landing branch, push, verify the Amplify deploy live, then re-screenshot PRODUCTION in both themes as the closing proof.

### HARD RULES (violating any one kills the finding, the copy, or the ship)

- Outcomes only. No vendors, no backend (one sanctioned Bedrock line), no methods, no economics, no partner or customer names. The Novalo deal's customer is never named; Marc's pilot numbers are never public.
- AWS attaches to customers and programs, never to Forj or Alloy. Nominative use only. Never imply AWS endorses, employs, or chose Forj. No reference to AWS's own product roadmap or job postings. Never frame AWS's free partner tooling adversarially; if the contrast is needed, say what Smith does ("finds accounts before they are leads anywhere") and let the reader do the math.
- Never "ripe to move off their cloud." Rival-cloud accounts get a NEW workload on AWS; the estate stays.
- Smith is openly an AI. A human approves and sends, always. "I forge it, you close it."
- Launch gate holds: no signup, no self-serve, no waitlist mechanics beyond what exists. The rebuild is a site update, not a launch.
- The site's proof numbers: only aggregates already approved for public use. Anything new goes to HELD FOR JACOB first.

### HELD FOR JACOB (surface these as decisions, never decide them silently)

1. PROOF NUMBERS: may the page state the full chain publicly ("about twenty meetings, three proposals, and a closed deal, from a standing start")? The meetings and proposals may already be on the page; the CLOSED DEAL is a new public claim. Show him the exact sentence and placement; build with the current proof band until he approves the upgrade.
2. SECOND BEDROCK MENTION: if the governance band earns "Built on Amazon Bedrock in the EU" as a second placement, show the mock and ask. One mention until then.
3. HERO NUMBER PLACEMENT: if the hero gains a number strip, he sees it before push.
4. ANY new Smith art slots the rebuild wants (map, room, handshake): deliver Gemini prompts per the graphics instrument; he generates; you cut and wire. Never retouch faces; regenerate.

### GRADING

Score the finished page 1 to 10 on five axes and report honestly: outcome-centering, arc clarity, truth currency, theme parity, craft. Anything under 8 gets one more pass before ship. Report what was cut and why, what was held for Jacob, and the production URLs of the proof screenshots.

---

## Side notes for the operator (not part of the fired prompt)

- This instrument supersedes nothing: fire COPY after it if the words need a dedicated pass, GRAPHICS after that if the pixels do.
- The capability map, arc line, and two modes are maintained canon; if the fire date is later than 2026-07-16, re-verify the map's statuses first (DEPLOYED-GATED lines may have gone LIVE, or vice versa).
- Current known inputs on fire date 2026-07-16: meeting arc newly LIVE (first Swedish e2e passed today); two modes canonical; 20/3/1 proof chain confirmed by Jacob; pricing simplification explicitly requested; shots exist only in dark; carousel is a static strip.
