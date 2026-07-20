# THE forj.se NORTH-STAR AUDIT PROMPT (v1, 2026-07-15)

Fire this verbatim (to Claude, ultracode on) whenever forj.se needs the full pass. It exists because the 2026-07-15 lesson was: **auditing the static pages is not enough — the runtime outputs (widget teasers, console answers, emailed reads) are copy too, and they drift separately.**

---

Run a full multi-agent audit of every forj.se surface against one lens: **Forj/Alloy/Smith is becoming the #1 AWS partner development and sales platform, built toward the north star (founder-independent, ownable, clean exit on Jacob's clock).** Then implement every must-fix, stage should-fixes, and verify live.

SURFACES (all of them, no sampling):
1. Static pages: / (index), /pricing.html, /integrations.html, /smith/ (incl. the signed passport JSON claims), /trust.html, /privacy.html, /dpa.html, /cookies.html, /terms.html, /how-we-read.html, /read (if routed), plus robots/sitemap/OG cards as fetched objects.
2. RUNTIME OUTPUTS (fire them, do not just read code): the free-read teaser for at least 4 live cases (an AWS-running company, an Azure-running company, a GCP-running company, an independent/on-prem company, by real org-nr); all 5 Smith console starter answers plus 2 free-typed questions through the live smith-demo endpoint; the emailed full read if testable without sending to a stranger.
3. Metadata: every title/meta/OG/twitter/JSON-LD, and whether Google-visible text tells the same AWS-first story as the page.

THE SEVEN LENSES (one agent each, then adversarial verify of every must-fix):
A. AWS ALIGNMENT: every claim, example, program name, demo answer, and widget output must serve an AWS PARTNER reader. Rival clouds may appear only as (1) honestly detected facts about an account, (2) the sanctioned quiet-library spots (meta description, one FAQ line, muted showcase tabs, integrations tiles, Alloy-band map art). Any output that hands an AWS partner another cloud's funding program or play is a MUST-FIX. The play grammar: runs AWS = expand + co-sell (MAP/ACE/MDF); runs rival cloud = NEW workload on AWS beside the estate (POC funding), never move-off framing; independent/on-prem = funded migration (MAP). "Fit" never "qualify".
B. SMITH POSITIONING: one identity home (Meet-Smith: eyebrow "Openly an AI", H2 senior partner development manager). Everything else demos, proves, or converts. No new identity boxes; new Smith copy must displace, not duplicate. Canon: openly an AI, no fabricated past, human sends and closes (statement home = FAQ), "I forge it, you close it" once.
C. TRUTHFULNESS vs TODAY: every capability claim maps to a feature LIVE in production right now (not built-and-parked, not staged). Every number from the live RPCs, never a constant. Fictional demo universe internally consistent (one company = one cloud everywhere). Disclaimers on every mock.
D. TRADEMARK/LEGAL: no APN-membership implication (AWS attaches to customers/programs, never to Forj/Alloy: "for AWS partners"); no AWS logos/badges/orange #FF9900; nominative use only; "Forj is an independent company, not part of AWS" stays; GDPR posture on every form and font load; public site shows OUTCOMES only (no vendors/backends/methods/economics/tenant names; "Amazon Bedrock in the EU" is the one sanctioned backend mention).
E. OUTCOMES (Marc Hillander's lens: outcome first, mechanism second, persona third; "demand numbers"): every band answers "what does the partner get"; the steps 1-2-3 arc, proof counters, and scorecard stay load-bearing; no promise of specific results (Marc's pilot numbers never public); conditional voice on step 3.
F. DESIGN SYSTEM: industrial-forge (muted steel-violet, material over glow, stillness law, no em dashes anywhere, Space Grotesk/Mono, self-hosted fonts); band rhythm and count still tight after edits; light + dark + 375px all verified; every image earns its band and matches its message.
G. FUNNEL: claim -> proof -> try (free read) -> believe (console + samples) -> ask (book). CTAs do distinct jobs; no dead ends; the free read is the conversion spine and must be flawless end-to-end including its error and prepare states.

HARD MECHANICS (verifier kills any fix that breaks these): rail anchors #smith #loop #alloy #read #contact; JS ids (chips/console/type/caret/rd-*/lb-*/pf-*/srt-*/srp-*); RPC-painted counters; the signed passport must re-verify in-browser after any /smith edit (re-sign with the existing key via the sign script if claims change); heading hierarchy and SEO intact; fixes ship via the landing branch (Amplify) and box/DEPLOY_MANIFEST GitOps for edge functions, then get verified LIVE with fresh-cache curls.

OUTPUT CONTRACT: a band-by-band + surface-by-surface findings table (must/should/polish, each with the exact replacement text or action), the adversarial-verify verdict on every must-fix, then the implementation, then live verification receipts. Anything held for Jacob (judgment calls, image generation, LinkedIn actions) listed separately with what is needed from him.

---

Standing follow-ups after every run: update `smith-linkedin-persona.md` one-home map if homes moved; keep `FORJSE_AWS_REMAKE_SPEC.md` status current; never re-add retired tri-cloud framing.
