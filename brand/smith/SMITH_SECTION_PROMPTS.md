# Smith — one image per forj.se section (generation prompts)

Goal: a Smith picture in **every** section, each pose matching that section's message,
all the same character + style. Generate one image per scene below.

## How to use
1. **Prepend the BASE block to every SCENE.** Base = the character + style + rules. Scene = the pose.
2. **Attach a reference image** in your tool (use `smith-hold-tricloud.png` or `smith-cartoon-new3.png`)
   so the face/outfit/style stay identical across all of them.
3. Generate, drop the files in this folder, tell Claude — each gets background-removed (rembg) and placed.

## BASE (paste before each scene)
> A rugged cartoon blacksmith named Smith — a man in his early 30s, fair skin, dark brown swept-back
> hair, full neat dark beard, warm confident expression; cream shirt with sleeves rolled to the
> forearms, a worn brown leather blacksmith apron with a chest pocket, brown leather tool belt with
> small pouches, brown work gloves. Style: high-quality semi-realistic cartoon illustration, warm soft
> painterly shading, clean crisp edges, full colour. Any cloud cubes are SOLID and opaque (never glass
> or transparent), coloured AWS amber, Azure blue, and Google four-colour (red/blue/green/yellow).
> Plain light-grey studio background, even lighting, no scenery. No text, no letters, no logos, no brand
> marks. — SCENE: {scene}. {framing}.

## Rules that matter most (these are what failed before)
- **Solid cubes, plain background** — translucent cubes on a busy/checkerboard bg do not cut out cleanly.
- **Keep props close to the body** — anything floating far from Smith may get removed on cut-out.
- **No logos / text** — the cloud colours carry the meaning; Forj is not a cloud partner, so no real marks.
- **Portrait** unless noted; leave headroom + a little space around him for the crop.

---

## The scenes (one per section)

**1 · HERO** — "Smith forges your next cloud, data and AI deal"  → `smith-hero.png` *(have it)*
SCENE: Smith faces forward, presenting three solid cloud cubes (amber, blue, four-colour) stacked in his gloved hands at chest height, calm and confident, a soft glow from the cubes.
FRAMING: three-quarter body, portrait.

**2 · THE READINESS GAP** — "Most pipeline issues are readiness issues in disguise"  → *new*
SCENE: Smith at his anvil lifts three bright solid cloud cubes up out of a dull pile of grey, cracked, lifeless cubes — separating the few live, fundable opportunities from the dead pipeline.
FRAMING: three-quarter body, portrait.

**3 · HOW SMITH WORKS** — "He's already working your pipeline"  → `smith-process.png` *(have it)*
SCENE: Smith mid-strike at the anvil, hammer raised, shaping a single glowing cloud cube on the anvil, a few bright sparks; focused and in motion.
FRAMING: full body, portrait, dynamic.

**4 · ALLOY (the workspace)** — "Where pipeline is forged"  → *new*
SCENE: Smith holds up a large solid slate/tablet that shows a tidy grid of small glowing account cards and ranked rows, his other hand gesturing toward it, looking at the viewer — presenting the workspace.
FRAMING: three-quarter body, portrait.

**5 · THE INTELLIGENCE LAYER** — "Every tool they run is a co-sell signal"  → *new*
SCENE: Smith with arms slightly open, a tight cluster of small solid cubes in varied colours hovering close around his hands and shoulders (each one a tool/signal), the three cloud cubes the largest among them — reading the whole stack.
FRAMING: three-quarter body, portrait. (Keep cubes close so they survive the cut-out.)

**6 · THE CLOUD CO-SELL REALITY** — "Co-sell isn't a form you file. It's a human motion."  → *new*
SCENE: Smith steps forward and extends one open hand, offering a single forged glowing cloud cube toward the viewer, warm and direct; his other hand rests on his hammer — handing off a co-sell-ready opportunity.
FRAMING: three-quarter body, portrait.

**7 · PROOF & TEAM** — "Senior Business Developers, forging your pipeline"  → *new*
SCENE: Smith stands confidently with arms crossed, hammer tucked in his belt, a steady seasoned look, a faint warm forge glow behind him — the senior operator.
FRAMING: bust to waist, portrait.

**8 · THE COMMITMENT** — "Five qualified opportunities a month"  → `smith-win.png` *(have it)*
SCENE: Smith raises a single solid glowing multicolour cube triumphantly above his head beside the anvil, a big confident grin — a win delivered.
FRAMING: full body, portrait.

**9 · CTA** — "Start with a conversation"  → `smith-bust.png` *(have it)*
SCENE: Smith faces forward with a warm welcoming smile, one hand open in a friendly "let's talk" gesture, relaxed and approachable.
FRAMING: bust to chest, portrait.

**10 · LIVE PAGE** — "Smith has been working the Nordic market"  → *new* (live.html)
SCENE: Smith leans over a glowing relief map of the Nordic countries laid on a table, small bright cloud-cube pins dotted across it, one hand resting on the map — surveying the market he's already worked.
FRAMING: three-quarter body, portrait. (If the map gets cut on extraction, we'll keep it as a full scene.)

**Bonus · CHAT AVATAR**  → `smith.png` / `smith-avatar.png` *(have it = new7)*
SCENE: tight head and shoulders, warm friendly smile, looking straight at the viewer, a small solid amber cube glowing at his shoulder.
FRAMING: square, centred on the face.

---
Slots marked *(have it)* already use a good pic — regenerate only if you want them tighter/consistent.
The four *new* scenes (2, 4, 5, 6, 7, 10) are the gaps that would put Smith in every section.
