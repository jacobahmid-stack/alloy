# Forj + Alloy + Smith brand — canonical reference

**System name:** Forged Light. The forge and the metal: Forj is the dark smithy, Alloy is the molten metal pulled from it, Smith is the maker at the anvil. (Aesthetic note in PHILOSOPHY.md.)

**Logo direction (locked 2026-06-18): unified dark tiles.** All three marks live on the same dark forge tile (`#141310`) with a lower-left ember glow. Same shape, same radius, same palette, same fonts. Aligned as a set.

## Marks
- **Forj = the "F" glyph** (stem + two bars), cream `#FDFAF5` on the dark tile. The company.
- **Alloy = the "A" apex** (filled molten chevron, no crossbar), ember molten gradient on the dark tile. The product. This is the live favicon mark. (The old stroked-A-with-crossbar is retired.)
- **Smith = his portrait** in an ember ring on the dark tile. The AI co-worker who forges your AWS deals. His face is the mark; never an "S".
- Never use the F for Alloy or the A for Forj.

## Palette
- Rust `#B83D0C` · ember `#E2622A` · light ember `#F0883E`
- Molten gradient: `linear-gradient(120deg,#B83D0C,#E2622A 55%,#F0883E)`
- Cream `#FDFAF5` · warm light bg `#F3F0EA`
- Warm near-black `#141310` / ink `#1A1916` · dim `#8C8880`

## Type (modern cloud-native system, updated 2026-06-19)
- **Space Grotesk** — headlines, taglines, wordmarks, labels. The technical grotesque; operative word lit in molten.
- **Inter** — body + UI. The cloud / SaaS standard.
- Retired: DM Serif Display / Bricolage Grotesque / DM Sans (the serif read "old-school", off-brand for a cloud/AI product).

## Wordmarks / lines
- `FORJ` · `ALLOY by FORJ`
- Forj line: "Where pipeline is forged."
- Smith line: "**Smith forges your AWS deals.**" (verb *forges* lit in molten). Role descriptor: "the AI co-worker who forges your AWS deals." Personality: "I forge it. You close it." (Retired: "AI engagement manager" and "AWS pipeline co-worker".)

## Folder structure
- `logos/` — forj / alloy / smith, each at 1024 (master), 512, 180. Dark tiles, hi-res.
- `banners/` — `forj-cover-3x` + `alloy-cover-3x` (LinkedIn company cover, 3384×573), `personal-banner-2x` (LinkedIn personal background, 3168×792).
- `social/` — `og-forj`, `og-alloy` (1200×630 @2x = 2400×1260).
- `sources/` — every asset's `.html` source. Re-render with headless Chrome at the size/scale noted in each render (logos: 512 viewBox, dsf for size; covers: 1128×191 @ dsf 3; og: 1200×630 @ dsf 2; personal: 1584×396 @ dsf 2). Smith assets need `--allow-file-access-from-files` (face image) + `--virtual-time-budget` (web fonts).
- `_archive/` — superseded low-res renders + dev screenshots + old Chrome profile. Safe to delete once the kit is in use.

## Where it's applied
- **forj.se** (landing): F favicon, og-forj. · **alloy.forj.se** (app): A favicon, og-alloy.
- **LinkedIn:** logos from `logos/`, covers from `banners/`. Always upload the 1024 logo and the 3x cover so they stay crisp on retina.
