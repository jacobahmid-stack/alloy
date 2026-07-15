# Forj + Alloy + Smith brand — canonical reference

**System name:** Forged Light. The forge and the metal: Forj is the dark smithy, Alloy is the molten metal pulled from it, Smith is the maker at the anvil. (Aesthetic note in PHILOSOPHY.md.)

**Logo direction (locked 2026-06-18): unified dark tiles.** All three marks live on the same dark forge tile (`#141310`) with a lower-left violet glow (Smith's tile alone keeps the ember glow). Same shape, same radius, same palette, same fonts. Aligned as a set.

## Marks
**OLED violet marks (2026-07-06).** Logo marks moved OFF the molten ramp onto the steel-violet system: near-black tile, a soft violet glow rising from the lower-left, the glyph in a steel-violet gradient (F stays cream). Molten is retired from marks; it lives on ONLY as a content accent (hero heat-then-quench, the free-read strike burst, the word *forges*). Smith keeps the ember ring: the maker at the anvil is the one place the fire stays.
- **Forj = the "F" glyph** (stem + two bars), cream `#FDFAF5` on the dark tile, violet glow. The company. This is the live favicon + apple-touch mark.
- **Alloy = the "A" apex** (filled chevron, no crossbar), steel-violet gradient `#4B3CA0 → #7B6BCB → #9E92D8` on the dark tile, violet glow. The product. This is the on-page rail + footer mark. (The old stroked-A-with-crossbar and the molten fill are both retired.)
- Violet mark glow: radial `#9E92D8`.55 → `#4B3CA0`.20 → transparent, from `cx 24% cy 80%`.
- **Smith = his portrait** in an ember ring on the dark tile. The AI co-worker who forges your AWS deals. His face is the mark; never an "S". Smith is the one mark that stays ember.
- Never use the F for Alloy or the A for Forj.

## Palette
- **Brand violet (steel-violet, ONE hue in three strengths):** deep `#4B3CA0` (accent on light grounds) · mid `#7B6BCB` (gradient middle) · pale `#9E92D8` (accent on dark grounds). Mark/wordmark gradient: `linear-gradient(120deg,#4B3CA0,#7B6BCB 55%,#9E92D8)`.
- **Heat = ember `#D9722E`, content accent ONLY** (hero heat-then-quench, strike burst, the word *forges*; Smith's ring is the one mark exception). As text on light paper: `#C0561A`. Never UI chrome, never status.
- **AWS amber family:** anchor `#D98A33` (pills, surfaces, dark-theme text) · `#C17A12` as text on light paper only. `#FF9900` is banned absolutely.
- **Grounds:** bone paper light `#F4F2ED` bg / `#FFFFFF` cream / `#ECE9E2` panel / `#E4E0D8` rule · soot dark `#0C0D10` bg / `#16171B` / `#1B1C20` / `#24262B`.
- **Inks:** light `#0F1419` / `#46535E` / `#5C6873` · dark `#ECF0F3` / `#9BA8B3` / `#7C8893`.
- **Status (app only):** green `#357A26` · amber `#946410` · red `#C13715` · steel-blue `#2E6E9E`.
- **Mark-tile values only:** near-black tile `#141310` · cream glyph `#FDFAF5`.
- **Retired:** the molten ramp `#B83D0C / #E2622A / #F0883E` and the old violet ramp `#4A2A9E / #7C5CFC / #A99BFF`. They persist only in `_archive/` sources; never reuse.

## Type (modern cloud-native system, updated 2026-06-19)
- **Space Grotesk** — headlines, taglines, wordmarks, labels. The technical grotesque; operative word lit in ember `#D9722E`.
- **Inter** — body + UI. The cloud / SaaS standard.
- Retired: DM Serif Display / Bricolage Grotesque / DM Sans (the serif read "old-school", off-brand for a cloud/AI product).

## Wordmarks / lines
- `FORJ` · `ALLOY by FORJ`
- Forj line: "Where pipeline is forged."
- Smith line: "**Smith forges your AWS deals.**" (verb *forges* lit in ember `#D9722E`). Role descriptor: "the AI co-worker who forges your AWS deals." Personality: "I forge it. You close it." (Retired: "AI engagement manager" and "AWS pipeline co-worker".)

## Folder structure
- `logos/` — forj / alloy / smith, each at 1024 (master), 512, 180. Dark tiles, hi-res.
- `banners/` — `forj-cover-3x` + `alloy-cover-3x` (LinkedIn company cover, 3384×573), `personal-banner-2x` (LinkedIn personal background, 3168×792).
- `social/` — `og-forj`, `og-alloy` (1200×630 @2x = 2400×1260).
- `sources/` — every asset's `.html` source. Re-render with headless Chrome at the size/scale noted in each render (logos: 512 viewBox, dsf for size; covers: 1128×191 @ dsf 3; og: 1200×630 @ dsf 2; personal: 1584×396 @ dsf 2). Smith assets need `--allow-file-access-from-files` (face image) + `--virtual-time-budget` (web fonts).
- `_archive/` — superseded low-res renders + dev screenshots + old Chrome profile. Safe to delete once the kit is in use.

## Where it's applied
- **forj.se** (landing): F favicon; live OG = `banners/og-image-aws-v5.png` (deployed as `og-image.png?v=5`); `social/og-forj` is the kit card only. · **alloy.forj.se** (app): A favicon, og-alloy.
- **LinkedIn:** logos from `logos/`, covers from `banners/`. Always upload the 1024 logo and the 3x cover so they stay crisp on retina.
