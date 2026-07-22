# Smith regeneration brief — lock the character (2026-07-21)

> **v3 STATUS NOTE (2026-07-22).** The site went PRODUCT-FIRST after a human-eyed design review:
> forj.se now uses only the face chip and the CTA bust. The workshop scene renders are retired from
> the site (style fracture: flat cut-outs vs painted interiors vs CG avatar, and the gold bar read
> as game loot). The v2 face lock HOLDS. Any future generation is for decks and social, and adds one
> rule to everything below: ONE rendering style across the whole set, flat ink-and-wash matching the
> site's engineered bands. No painted fantasy interiors, no photoreal, no CG. Master sheet first,
> then poses, same sitting.


**Why this exists.** A vision audit of the whole library on 2026-07-21 found that `brand/smith/` does
not contain one character. It contains at least four different men plus a retired voxel set. The face
currently live as the chat avatar (`smith-cartoon-new7-cut`) is visibly a different person from the
best hero art (`smith-present-clean-cut`, `smith-cartoon-calm`, `smith-forges`): different face width,
different beard density, different hair colour, different build.

That is survivable while Smith is a 26px avatar. It is fatal for a character-led landing page, where he
appears large in the hero **and** small on signal cards on the same screen. So we regenerate one
definitive set in a single sitting, from one prompt lineage, and retire the rest.

Decision taken 2026-07-21: **regenerate a definitive Smith**, hero composition = **figure beside the
headline** (open gesture toward the copy).

---

## 1. The locked character block

Paste this **verbatim** into every prompt. Do not paraphrase it between images. Paraphrasing is how
the library drifted into four men.

> A semi-realistic stylized cartoon illustration of the same man throughout: a blacksmith in his late
> thirties. Dark brown hair, short, swept up and back, slightly textured. A short full beard, neatly
> groomed, dark brown, no grey. Warm brown eyes, direct friendly gaze, slight smile lines. Athletic
> broad-shouldered build, not heavy. He wears a cream off-white shirt with the sleeves rolled to the
> elbow, and a tan russet leather apron with a chest pocket, brass rivets and shoulder straps. Clean
> confident linework, painterly shading, warm palette. Not photorealistic. Not 3D Pixar style.

**Anchor face:** the canonical warm Smith seen in `smith-present-clean-cut.png`, `smith-cartoon-calm.png`
and `smith-forges.png`. Attach one of these as a style/face reference on the very first generation.

---

## 2. Global rules (every image, no exceptions)

These are the locked brand rules plus every defect the audit actually found in the old set.

- **No text, letters, numbers, words, signage or logos anywhere in the image.** The old
  `smith-live-cut.png` shipped garbled AI pseudo-text reading "NORDIK MURDLE" and a mangled "AWS
  MARKET". Nothing legible, ever, including on maps, screens, tablets, papers or tools.
- **No cloud cubes, no multi-coloured cubes, no vendor colours.** The multi-cloud era is retired. Where
  a "deal object" is needed it is **ONE glowing amber ingot / billet**.
- **Amber is `#D98A33` warm amber-bronze.** Never pure saturated orange. `#FF9900` is banned absolutely.
- **Props are solid and opaque.** Never translucent or glassy. The old `smith-cartoon-new6-cut` went
  92-95% partially transparent on the anvil and the raised cube and turned muddy on dark backgrounds.
- **Plain flat light grey background** (roughly `#D8D8D8`), evenly lit, no gradient, no vignette, no
  scene. This is what cuts cleanly. Do not generate the character on a dark, framed or decorated field
  unless the slot below explicitly says "card".
- **No baked drop shadow, no glow halo, no outer rim light.** These become grey haze after cutting.
- **Full margin inside the frame.** The subject must not touch or bleed off any edge.
  `smith-present-clean-cut` is cropped at the right frame edge and that permanently limits it.
- **One consistent light direction:** soft key from the upper left, warm fill from the forge side.

---

## 3. The slots to generate

Generate **#1 first**. Then attach #1 as a reference image to every subsequent prompt and open with:
*"The exact same man as the attached reference: same face, same beard, same hair, same build, same
apron."* Consistency comes from the reference chain, not from the text alone.

| # | Slot | Pose prompt (append to the character block) |
|---|---|---|
| 1 | **HERO** — figure beside the headline | Three-quarter view, waist up, turned slightly to his right, looking at the viewer with a calm confident half-smile. His near arm is extended forward and open, palm up, in a relaxed "here it is" offering gesture, as if presenting something to the space beside him. The other hand rests at his side. Nothing in either hand. Generous empty margin on all sides. |
| 2 | **AVATAR** — chat + signal cards | Tight head-and-shoulders portrait, front facing, warm neutral expression, slight smile, looking directly at the viewer. Simple and readable when shrunk to a 32px circle: no props, no background objects, strong clear silhouette. |
| 3 | **FORGING** — how it works | Side three-quarter view at an anvil, hammer raised mid-strike in his right hand, tongs in his left gripping ONE glowing amber ingot on the anvil face. Warm sparks arcing up and to the right. Focused expression, eyes on the work. |
| 4 | **THE READ** — analysis | Seated or leaning, head slightly tilted, studying something unseen just off frame to his left with a thoughtful measuring expression, one hand at his beard. Nothing legible in frame. |
| 5 | **THE WIN** — proof | Standing, facing the viewer, holding ONE finished glowing amber ingot up at chest height in an open palm, quietly satisfied rather than triumphant. Warm confident smile. |
| 6 | **CTA** — closing band | Head and upper chest, front facing, warm inviting expression, arms relaxed and out of frame. Composed so the bottom of the chest **fades softly to nothing** so it can dissolve into a coloured band. |
| 7 | **FULL BODY** — meet Smith | Full standing figure, feet included, weight on one leg, arms loosely crossed, calm and grounded, looking at the viewer. Generous margin above the head and below the feet. |
| 8 | **AT THE DESK** — the workspace | Three-quarter view, standing behind a plain workbench, one hand resting on a blank slate tablet lying flat on the bench. The tablet surface is **completely blank and featureless** — no screen content, no glow, no icons, no text. |

---

## 4. Output spec

- **Resolution:** the largest Gemini will give. Target ≥1400px on the long edge for #1, #3, #7; ≥1024px
  for the rest. The current hero candidate is only 861×731, which caps it at ~430px on a 2× display.
- **Format:** PNG.
- **Naming:** `smith-v2-hero.png`, `smith-v2-avatar.png`, `smith-v2-forging.png`, `smith-v2-read.png`,
  `smith-v2-win.png`, `smith-v2-cta.png`, `smith-v2-body.png`, `smith-v2-desk.png`.
  The `v2-` prefix keeps the new locked set unambiguous. **Do not** repeat the `smith-cta` / `smith-cta-v2`
  trap, where the file *without* the suffix was the newer and broken one.
- **Cutting:** background strip with `rembg` (alpha-matting for busts) to `smith-v2-*-cut.png`. Keep the
  uncut originals.

---

## 5. QA checklist before anything ships

Run this on every cut file. Each line corresponds to a real defect found in the old library.

- [ ] **Same man?** Put all eight face crops in one grid and look. If any face reads as a different
      person, regenerate that one against the reference. This is the whole point of the exercise.
- [ ] **No legible text** anywhere, at any zoom.
- [ ] **No cube, no vendor colour**, and no pixel within L1 distance 30 of `#FF9900`.
- [ ] **Alpha is clean:** composite over pure white *and* mid grey and look for haze, ghost blobs or
      coloured fringing away from the figure. Check for connected components ≥40px that are not the
      character.
- [ ] **No block-quantized alpha.** Render the alpha channel alone at 5×; look for a hard 8px staircase
      in the gaps between arm and torso. That defect is invisible in the RGB and obvious on the page.
- [ ] **Edge luminance** is equal to or darker than the figure rim, so he does not glow on dark bands.
- [ ] **Props fully opaque** — no anvil or ingot below ~95% alpha.
- [ ] **Nothing touches the frame edge.**
- [ ] **Intentional bottom fades** (slot #6 only) are noted, so they are never butted against a hard
      container edge.
- [ ] **Automated cleanup is safe:** if any pose has a detached floating prop, do NOT run a
      "keep the largest connected component" pass — it silently deletes real art.
- [ ] **No hidden RGB under transparent pixels.** See §5.1 — this is the subtlest defect in the old set
      and the easiest to ship by accident.

### 5.1 The hidden-RGB hazard (measured 2026-07-21)

Erasing something by setting alpha to 0 does **not** remove it. The colour data stays in the file. Every
`-cut` file that had cubes erased still carries them:

| File | Fully transparent px | Of those, still holding colour | Max RGB |
|---|---|---|---|
| `smith-present-clean-cut.png` | 362,081 | **25,946** | 167 |
| `smith-alloy-cut.png` | 218,681 | 7,382 | 190 |
| `smith-forges.png` | 409,170 | 7,069 | 136 |
| `smith-cta-v2.png` | 226,445 | 644 | 214 |
| `smith-cartoon-calm.png` | 100,547 | **0** | — |
| `smith-cartoon-win.png` | 103,670 | **0** | — |

The retired vendor-coloured cubes are still sitting in `smith-present-clean-cut.png`, invisible only
because alpha is 0. Any pipeline that flattens without honouring alpha resurrects them. Note the pattern:
files that never had cubes erased are perfectly clean, so this is a by-product of the erase-and-cut
workflow, not of `rembg` itself.

**Rules:**

- Zero the RGB wherever alpha is 0 before any encode:
  ```python
  from PIL import Image; import numpy as np
  a = np.array(Image.open(src).convert('RGBA'))
  a[a[..., 3] == 0, :3] = 0
  Image.fromarray(a).save(dst)
  ```
- **Never pass `cwebp -exact`.** That flag exists specifically to preserve RGB under transparent pixels.
- Prefer *not generating* the unwanted object over erasing it afterwards. The v2 prompts in §3 ask for a
  clean plate from the start, which is why none of this applies to them if they are followed.

---

## 6. What this retires

Once the v2 set passes QA, retire from site use: the entire `smith-cartoon-new*` family, the
`smith-bust-*` family, `smith-hold-tricloud*`, `smith-live*`, `smith-readiness*`, `smith-ecosystem*`,
`smith-armscross*`, `smith-team*`, `smith-cta.png` (broken alpha), and the voxel `smith-bust.png`.
Keep them as source history only.

`smith-forging-aws.png` is **not** retired and is **not** a page asset: it has a violet frame and dark
navy field baked in and no alpha, so it is a card, not a cut-out. It stays the OG / social / deck image.

---

## 7. Known-good assets, if you want to ship before the v2 set exists

All verified artifact-free and colour-legal in the 2026-07-21 audit:

- `smith-present-clean-cut.png` — hero-beside-headline, transparent, verified clean (0 stray components
  ≥40px, 0.018% stray semi-transparent pixels). Caveats: 861×731, cropped at the waist and the right edge.
- `smith-alloy-cut.png` — the workspace slot; also passes the public-site redaction rule (no legible text).
- `smith-cartoon-win.png` — the proof slot; near-perfect matte.
- `smith-cta-v2.png` — the CTA band. **Use the `-v2` file, not `smith-cta.png`.**
- `smith-cartoon-calm.png` — cleanest matte in the folder; the consistent avatar to pair with
  `present-clean`, and the closest existing face to the canonical Smith.
