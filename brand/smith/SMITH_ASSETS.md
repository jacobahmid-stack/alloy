# Smith asset kit — AWS-first era (2026-07-15; tri-cloud set below retired from forj.se)

Current Smith on forj.se = **AWS-forward: one glowing deal-piece, no cloud cubes** (per the
2026-07-14 "built for AWS partners" remake). The tri-cloud cartoon set (2026-06-20) below is
retired from the site but kept as source; the character model is unchanged.

## AWS-first assets (2026-07-15)
| File | Origin | Use |
|---|---|---|
| `smith-forging-aws.png` | Gemini `prti3p` (Jacob, 2026-07-15) — forging ONE glowing ingot, violet rounded frame, no cubes | Source art for the OG v5 card; hero-grade portrait for posts/decks |
| `../banners/og-image-aws-v5.png` | PIL composition: `smith-forging-aws` left + "Built for **AWS** partners." (AWS in amber anchor `#D98A33`, recolored at deploy, landing `dd0e368`; NOT AWS orange `#FF9900`) + molten rule + Alloy tile + forj.se, Space Grotesk/Mono | **DEPLOYED** as `alloy-landing/og-image.png?v=5` (all og/twitter/JSON-LD refs bumped, landing `2f64af2`). Kit copy re-exported 2026-07-15 from the deployed og-image with the corrected steel-violet A-tile composited in; the deployed og-image.png still carries the old-ramp tile until the next landing deploy. |
| `smith-present-clean-cut.png` | Derived from `smith-cosell-cut`: floating cloud + cubes erased (component-clean, verified no artifacts) | Presenting pose with open hand, nothing vendor-colored — pairs with any content placed beside him |

**Already AWS-safe in the old set (no rework needed):** `smith-cartoon-forging` (one glowing billet),
`smith-alloy-cut` (tablet),
`smith-cartoon-new7`/`new8` (busts with a single AMBER cube → the live `smith.png`/`smith-avatar.png` avatars are these, fine as-is).

**Needs Gemini regeneration for AWS-only reuse (cubes touch the figure — classical-CV removal FAILED, do not retry):**
`smith-hold-tricloud` (→ holding ONE glowing ingot), `smith-live`/`smith-live-3cube` (→ map with one amber piece),
`smith-readiness` (→ one ingot onto the stone pile), `smith-ecosystem` (→ one ingot over the parts burst),
`smith-armscross-3cube`/`smith-bust-cubes-a`/`smith-team` (→ same pose, single amber cube or none),
`smith-bust-focused` (→ same pose, ONE glowing amber ingot, plain grey bg for cutting; NOT AWS-safe as previously listed: the art shows three equal cloud-echo cubes, and the current `-cut` has a failed blotchy brown alpha-matte halo, so do not place it on any surface),
`smith-forge-hero` (superseded by `smith-forging-aws`). Prompt base: "same semi-realistic cartoon blacksmith
(dark hair, short beard, leather apron), [POSE], with ONE glowing amber deal-ingot, warm sparks, no cloud cubes,
no logos, plain light grey background for cutting."

**Rules (locked):**
- Cubes are **solid/opaque** (never translucent glass — that washes out on background removal).
- RETIRED (tri-cloud-era history, kept for the record only): cloud cube colours AWS `#FF9900` · Azure blue `#0089D6` · Google four-colour (`#4285F4/#EA4335/#FBBC05/#34A853`). `#FF9900` is banned absolutely; AWS = amber anchor `#D98A33`.
- **No trademarked cloud logos / partner badges** anywhere — Forj is not a cloud partner; colour + naming only (see memory `multicloud-pivot`).
- Background strip = `rembg` (alpha-matting for busts) → `*-cut.png`. Plain light/grey source bg cuts cleanest.

## Web assets in use (`alloy-landing/`, forj.se) — cache-bust `?v=` on swap
| File | Source (this folder) | Use |
|---|---|---|
| `smith-hero.png` | `smith-hold-tricloud-cut` (Gemini a7ll3q) | Hero — 3/4, holds the 3 cloud cubes. Also the OG card (via `_og.html`). |
| `smith.png` + `smith-avatar.png` | `smith-cartoon-new7-cut` (face crop) | Chat avatar — fab, panel header, hero console, "Smith's read" |
| `smith-process.png` | `smith-cartoon-new2-cut` | How it works — forge action (hammer raised) |
| `smith-win.png` | `smith-cartoon-new6-cut` | The commitment — cube raised in triumph |
| `smith-bust.png` | `smith-cartoon-new5-cut` | CTA — confident bust |
| `og-image.png` | rendered from `alloy-landing/_og.html` (pulls `smith-hero.png`) | OG / Twitter share card (1200×630) |

## Source library (this folder) — tri-cloud cartoon set
Each has a `.png` (original) and `-cut.png` (transparent).
- `smith-hold-tricloud` — Gemini a7ll3q — 3/4, holds 3 solid cubes → **hero/OG**.
- `smith-cartoon-new1` — 4-cube stack on the anvil (presenting), full body.
- `smith-cartoon-new2` — forge action, hammer raised → **process**.
- `smith-cartoon-new3` — 3 cubes on the anvil, hammer in hand (prior hero).
- `smith-cartoon-new4` — bust holding 2 cubes.
- `smith-cartoon-new5` — confident bust → **CTA**.
- `smith-cartoon-new6` — cube raised in triumph → **win**.
- `smith-cartoon-new7` — warm friendly bust, amber cube on shoulder → **avatar**.
- `smith-cartoon-new8` — focused/serious bust, amber cube.
- `smith-bust-cubes-a` / `-b` — Gemini 89cqxs / atf6yt — warm busts + floating tri-cloud cubes (avatar alternates).
- `smith-bust-focused` — Gemini a64vkj — focused bust holding 2 cubes (a "working" mood).

## Superseded (kept for reference, not used on forj.se)
- Voxel set (`smith-voxel*`, `../logos/`) and the realistic portrait — replaced by this cartoon set.
- Raw concept sheets `smith21`–`smith38` (multi-panel, translucent cubes on a baked checkerboard — do NOT extract cleanly; source only).
- The raw Gemini drops `Gemini_Generated_Image_*.png` are duplicated above under clean names; safe to delete.
