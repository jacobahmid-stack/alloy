# RUNE v3 — Gemini image prompt kit
### "Forged, not born." The constructed smith, generated in Google Gemini.

**How to use (this order matters):**
1. Paste **Prompt 1** (the character sheet) first. Generate several variants; pick the one where the faceplate reads calm and the materials look hand-forged, not sci-fi.
2. For every later image, **attach the approved character-sheet image as a reference** in the same Gemini chat and paste the pose prompt. Gemini holds character consistency far better from a reference image than from words alone.
3. Every prompt below already contains the same CHARACTER DNA paragraph. Never edit it between generations; consistency comes from repetition.
4. Reject and re-roll anything on the acceptance checklist at the bottom. Ask Gemini to "keep the character exactly as in the reference image, change only the pose and scene" when drifting.
5. Hex codes are anchors, not guarantees; the color words around them do the real steering.

---

## THE CHARACTER DNA (identical in every prompt; do not edit)

> Rune, a forged automaton blacksmith, assembled by hand in a Gothenburg smithy. A broad, grounded, slightly stocky figure built from brushed steel plates in cool grey (#8B93A3) with visible rivets and honest tool marks, joints of dark coal-black iron (#3A3E48), and warm ember-orange light (#D9722E) glowing from inside the seams between the plates, brightest at the knuckles, forearms and chest seams. Instead of a human face he has a smooth forged-steel faceplate with one single horizontal glowing ember slit, like the sight-glass of a furnace door: calm, warm, friendly. No eyes, no mouth, no nose, no hair, no skin anywhere on the body. He wears a worn brown leather blacksmith apron with brass buckles and a small blue heraldic lion patch on the chest pocket. His silhouette is a strong working craftsman at rest, unhurried and trustworthy. Style: clean graphic-novel line art with semi-flat cel shading, confident dark ink outlines, muted Nordic industrial palette, near-black blue-steel background tones (#0E0F13). He must look hand-forged in a nineteenth-century industrial smithy: no chrome, no polish, no sci-fi robot design, no blue LED light, no antennas, no visible wires, no digital screens, not cute, not a toy, not a mascot.

---

## Prompt 1 — the character sheet (generate this first)

Character reference sheet of the following character, on one single dark canvas (#0E0F13), three views side by side: front view standing, three-quarter view, side profile view. Full body, feet visible, neutral standing pose, arms relaxed. Small inset in one corner: a close-up bust of the head and shoulders. Flat dark background, no scene, no props except the apron he wears. No text, no labels, no watermark, no signature.

[CHARACTER DNA paragraph]

Aspect ratio 16:9.

## Prompt 2 — the portrait · identity (for /rune, the byline, the footer)

Waist-up portrait of the character below, facing the viewer directly, standing on a stone quay at the Gothenburg harbour at dusk. Behind him, softly out of focus and drawn in the same graphic-novel hand: harbour cranes, a blue-and-white Gothenburg tram, brick warehouse facades, gulls, the river. The ember slit of his faceplate glows warmly; the seams of his arms give faint ember light. Calm, welcoming presence, like a craftsman greeting a visitor at his shop door. Keep the character exactly as in the reference image.

[CHARACTER DNA paragraph]

No text, no watermark. Aspect ratio 3:4.

## Prompt 3 — at the anvil · the manufacture (build states, the moment an account takes shape)

The character below at work in his smithy, mid-hammer-strike on a glowing orange metal bar on a black anvil, bright sparks flying, the ember seams of his arms and knuckles flaring brightest at the moment of impact. Stone walls, hanging tongs and tools, a coal forge burning warm orange to one side. Through a large arched industrial window behind him: Gothenburg harbour with cranes and the blue tram, drawn in the same hand. Dynamic but controlled: a master at work, not violence. Keep the character exactly as in the reference image.

[CHARACTER DNA paragraph]

No text, no watermark. Aspect ratio 3:4.

## Prompt 4 — arms crossed · trust (the guarantee, the desk, the two ways)

The character below standing calmly with arms crossed in front of his forge, the coal fire burning warm behind him, tools hung in order on the wall, the wooden sign above the forge showing only a hammer and anvil symbol. His ember face-slit and chest seams glow steadily. Composed, certain, restful: a maker you would hand your market to, not a mascot. Through the window: the harbour and the tram. Keep the character exactly as in the reference image.

[CHARACTER DNA paragraph]

No text, no watermark. Aspect ratio 3:4.

## Prompt 5 — the avatar (the widget launcher and chat lane; must read at 24 pixels)

Minimal head-and-shoulders bust of the character below, perfectly centered, facing the viewer, on a plain flat near-black background (#0B0C10). Composition simple and iconic: the steel faceplate with its single warm ember slit is the only focal point, one soft ember rim light. No scene, no props, no gradient background, no text. Must stay readable when shrunk to a tiny avatar. Keep the character exactly as in the reference image.

[CHARACTER DNA paragraph]

Aspect ratio 1:1.

---

## The face is DECIDED: the lantern visor (do not re-open)

The visual system page `alloy-landing/rune-v3.html` (Claude Design, approved 2026-08-01) commits to the
**lantern visor** and records why the other two lost:
- **the rune face — rejected:** reads as mysticism before machinery, and a glyph turns to noise at 24 pixels.
- **the open seam — rejected:** austere to the point of cold; the visor keeps the warmth the counter needs.

So the DNA paragraph above is final. Do not prompt the rune-glyph or bare-seam variants.

**The visor is also the state channel** (match these in any state-specific art you generate):
- **working** — the slit is narrow and bright (#E8823B)
- **listening** — the slit is wider and softer (#D9722E at ~75% opacity)
- **greeting** — the bright slit plus a second, brief shorter line beneath it (#FFC08A over #E8823B)

## Append to every prompt (the avoid list)

No human face, no eyes, no mouth, no skin, no hair, no beard. No chrome, no glossy plastic, no blue or cyan glow, no LEDs, no antennas, no cables, no screens, no holograms. Not medieval fantasy, no runes floating in the air, no magic effects. Not cute, not chibi, not a toy or mascot. No photorealism. No text, letters, numbers, logos, watermarks or signatures anywhere in the image.

## Acceptance checklist (reject the image if ANY is true)

- [ ] You could mistake it for a person at a glance (too humanlike: reject; that is the whole point of v3)
- [ ] It reads as a sci-fi robot or mech (chrome, LEDs, panels-and-wires: reject)
- [ ] The fire is outside him as decoration instead of inside the seams and the work
- [ ] The face slit looks angry, dead, or like a visor of a soldier rather than a furnace sight-glass
- [ ] Cute/mascot energy, big-head proportions
- [ ] The apron or the lion patch is missing in a pose shot
- [ ] Gothenburg backdrop missing in poses 2-4, or drawn in a different style than the character
- [ ] Any text or watermark artifacts
- [ ] At thumbnail size the head does not read as one calm ember mark (test by zooming out before accepting Prompt 5)

## After approval

The winning images replace `alloy-landing/assets/rune-portrait.webp`, `rune-anvil.webp`, `rune-armscrossed.webp` (plus a new `rune-avatar.webp` for the widget), and the brand-system-v2 page's Rune section gets re-shot. The voice, the poses' jobs, and the openly-AI caption bar are unchanged: only the being.
