# Smith — Rive Rig Spec (v1)

The brief for building the animated Smith mascot in **Rive** (rive.app) so it drops
straight into Alloy (React) and forj.se (HTML) with no rework. Hand this to whoever
rigs it (you, a Rive designer, or Rive's AI-assist). The **names below are a contract** —
the integration code binds to these exact strings.

---

## 1. Where it's used
- **forj.se** — standing hero mascot (replaces / sits beside the round photo avatar).
- **Alloy app** — welcome screen + empty states (full-body), corner mascot optional.
- The small round **face avatar already shipped** stays in the rail/chat. This rig is the
  full-body mascot, not a replacement for that.

## 2. Art prep (do this first — it determines rig quality)
Rive animates a character cut into parts, not flat poses. Provide ONE base figure:
- **Single neutral A-pose Smith** (arms slightly out, relaxed), front-facing, transparent
  background, same art style as the 4 reference poses.
- **Separated limbs** as their own layers/PNGs (or a layered PSD / SVG import):
  `head` (with `jaw`/`eyes` sub-layers if possible), `torso`, `upper_arm_L`, `forearm_L`,
  `hand_L`, `upper_arm_R`, `forearm_R`, `hand_R`, `thigh_L`, `shin_L`, `foot_L`,
  `thigh_R`, `shin_R`, `foot_R`.
- Overlap the joints by ~10–15px so bones don't reveal gaps when they bend.
- How to get it: ask the same image tool for "T-pose / A-pose, separated limbs,
  transparent background, front view," or cut the parts in Photopea/Photoshop.
- The 4 poses you sent are the **target keyframes**: white-tee relaxed = idle, navy
  blazer = "deal/pro", suit = "deal", fists-up = win.

## 3. Artboard
- Name: `Smith`
- Size: `600 × 1000` (portrait, full-body), transparent background.
- Origin centered horizontally, feet near the bottom. Must scale cleanly 80px→600px tall.

## 4. State machine (the contract)
- State machine name: **`SmithSM`**
- Inputs (exact names + types):
  - `mood` — **Number** — `0` Idle · `1` Thinking · `2` Forging · `3` Won
  - `greet` — **Trigger** — one-shot wave (fired once on first load)
- Default `mood = 0` (Idle).

## 5. States / animations
Each is a looping timeline unless noted.
- **Idle** (`mood=0`): slow breathing (chest/shoulders rise ~3–4s), tiny weight shift,
  occasional blink. Calm, alive. Base = relaxed white-tee pose.
- **Thinking** (`mood=1`): one hand rises toward chin, slight head tilt + look up, brows.
  Loop subtle. (Embers/dots are added in CSS around it — rig doesn't need them.)
- **Forging** (`mood=2`): purposeful — forearm pumps as if working/hammering, leaning in,
  faster breath. (We add the ember glow + sparks in CSS behind the canvas.)
- **Won** (`mood=3`): the fists-up celebration — both arms pump up, big grin, a small jump
  or bounce. Energetic loop. Should read instantly as "we won."
- **Greet** (`greet` trigger): a one-shot wave, then return to current `mood`.

## 6. Transitions
- Any → target state on `mood` change; use 150–250ms blends so swaps feel smooth, not cut.
- `greet` trigger plays over the current state then exits back to it.
- Keep everything loopable and seamless (last frame ≈ first frame).

## 7. Performance / delivery
- Export a single **`smith.riv`** (target < ~150KB; vector + mesh keeps it tiny).
- Lock the names: artboard `Smith`, state machine `SmithSM`, inputs `mood` / `greet`.
- Deliver `smith.riv` — that's all the code needs.

## 8. Integration (my side — already planned)
- **Alloy (React):** `@rive-app/react-canvas`, set `mood` from live state —
  batch running → `2` (forging), chat busy → `1` (thinking), deal advanced → `3` (won),
  else `0` (idle). `greet` on first mount.
- **forj.se (HTML):** `@rive-app/canvas` web runtime, same input names.
- **Fallback:** if the runtime/`.riv` fails or `prefers-reduced-motion`, render the static
  full-body PNG (or the current photo avatar). No broken state, ever.
- `.riv` lives in each repo's `public/`. Drop-in the day it's delivered.

## 9. Who can build the rig
- **You** — Rive has strong tutorials; a basic character rig is ~an afternoon.
- **A Rive designer** — Rive community/Discord, Fiverr, Upwork; "2D character rig +
  4 states in Rive" is a common, well-scoped gig. Hand them this doc.
- **Rive AI-assist** — if available in your plan, for first-pass rigging/meshing.

## 10. Acceptance check
Rig is done when: load shows a `greet` wave → settles to Idle breathing; setting
`mood` to 1/2/3 smoothly blends to Thinking/Forging/Won and loops; file < ~150KB;
names match §4 exactly.
