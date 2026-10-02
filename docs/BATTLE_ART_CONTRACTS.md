# Battle art, adaptive combat UI and playtest repairs — shared contracts

**The brief:** *Expressive Battle Art, Adaptive Combat UI, and Verified Playtest Repairs*
(owner's addendum, 2 October 2026). Section numbers (§) refer to it.

**This file records:**
- who owns which files;
- the seams the art work builds on;
- the rules every area follows.

Each area keeps its own record in `docs/battle/<area>.md`. The coverage list for every area is
`docs/battle/INVENTORY.md`.

## Ownership

| Area | Owner | Files |
|---|---|---|
| Presentation contract: playback speed, banner, status dock, intents, adaptive layout, skip, recap; repairs RBN-01–05 and RBN-07 | integrator | `src/ui/80_combat.js`, `81_combat_help.js`, `src/ui/82_battle_seq.js` (run, settle, hurry, speed, delivery registry), `src/ui/83_battle_stage.js` `layout()` and geometry, the new banner module, the battle section of `src/styles/60_learning.css`, settings |
| Party art (the player, Nao, Mio, Ren, Suzu) | party worker | `src/engine/34_battlers.js` (and new `34*_*.js` party files); battle-consistency of portraits and previews; in `82_battle_seq.js`: `choreo.player`, `choreo.companion`, `choreo.finish`, `choreo.revive`, `planOf`, `travelCue` and the party-side cases of `reactions`; party effects in new `src/ui/84p_*.js` files; party anchors in `83_battle_stage.js` (not `layout()`) |
| Creatures A (Chapters 1–3 families and the Flour Moth proof) | creature worker A | new `src/ui/78a_*.js`–`78f_*.js` files; families `wisp`, `moth`, `blot`, `echo`, `crab`, `crane`, `golem`, `sg_letter`, `clerk`, `warden` (and `sg_letter`'s definition in `src/content/ch2/01_art.js`); deliveries via `RB.battleSeq.addDelivery`; effects in new `src/ui/84a_*.js` files |
| Creatures B (Chapters 4–6 and the Atlas) | creature worker B | new `src/ui/78m_*.js`–`78z_*.js` files; families `sb_snowfox`, `lantern`, `sb_frostlamp`, `lf_conduit`, `bell`, `lf_keeper`, `hush`, `sa_hush`, `fox`, `atlas_cartographer`, `spirit` (and their definitions in `src/content/ch4/05_art.js`, `ch5/12_tower.js`, `ch6/10_world.js`); deliveries via `addDelivery`; effects in new `src/ui/84m_*.js` files |
| Contextual backdrops | backdrop worker | `src/ui/76_battle_places.js`, `76_battle_placeart.js`, `79_battle_scene.js` |
| Pets in battle and the overworld parity pass | pets/overworld worker | `src/ui/85_battle_pets.js`, `src/engine/37_pets_*.js` (art), the overworld sprite and prop art (`src/engine/30_sprites.js`, `32*_*.js`, prop painters) |

**Shared files outside your area:** edit them only with a small, documented change, and list it in your record's merge notes. `index.html`, `src/lang/75_kanjiread.js` and `src/recog/10_strokedata.js` are generated. Never hand-merge them.

## Seams (in place at the base commit)

- **Authored creature poses** (`RB.enemyArt.def(id, spec)`, `src/ui/78_enemy_art.js`):
  - `poses: { prep, exec, cast, recoil, recover, balk, release, settle, rest }` gives frames per act.
  - `pose(L, act, i, n, o, H, side)` draws frame i of n.
  - `poseMotion: 'travel' | 'full' | 'none'` says how much of the old motion style stays on top.
  - Frames are cached per act, step and side.
  - A later file can re-`def` a family. Files load in name order, so `78a_*.js` overrides `78_enemy_art.js`.
- **Creature travel** (`src/ui/83_battle_stage.js`):
  - A `foe` cue may carry `travel: { to, peak, arc, shape: 'out'|'back'|'outback'|'hold' }`.
  - The creature then moves bodily towards the actual target's chest anchor. The offset is recomputed from live anchors every frame, so a resize or a withdrawn panel never leaves it aiming at old coordinates.
  - The shadow follows the travel sideways.
- **Creature delivery** (`RB.battleSeq.addDelivery(art, kind|family|'*', fn)`, `src/ui/82_battle_seq.js`):
  - The function returns `{ cues, contact, end }`. Cues are visual only: `foe`, `fx`, `pose`, `sfx`.
  - **The sequencer places every rules result**, once, in the rules' order, at `contact`. A `beat` cue from a delivery is dropped.
  - `end` is the end of the creature's own performance, recovery included. It is the action interval the banner uses.
  - A delivery that throws falls back to the generic choreography.
  - Covered by `tests/unit/battle_seams.test.mjs`.
- **Effects and status marks:**
  - `RB.battleFx.fx[name] = (c, e, k, A, t, still) => …` adds a transient effect. The stage draws a cue `{ type: 'fx', name, d, p }` with it.
  - `RB.battleFx.status[name]` holds the persistent marks.
  - Use your own new names and files. Do not rewrite another area's effects.
- **Party art:** `RB.battlers` (`src/engine/34_battlers.js`) draws the player and the companion from the shared appearance source (`RB.equip.look(s)`, `RB.content.chars[id].look`). The stage cues are `pose(who, pose, gesture, d, at)`.

## Rules every area keeps (§0, §6, §10, §17, §21)

- **No rule changes:**
  - No change to damage, targets, knots, learning, help, Harmony, Bond, rewards, or the number of adventurers (exactly two after commitment; solo before).
  - Presentation reads results that are already committed. It never applies them again.
- **Truthful feedback:**
  - Hit, block, softened, miss, heal (including zero), condition applied, condition cleared, revealed and interrupted all look different.
  - Effects play only on the actual recipients.
  - No flash implies an extra target, cure, ward or damage.
- **Language:**
  - The written response shows the actual resolved Japanese with its reading.
  - Never invent glyphs, translate a label at runtime, or show a wrong attempt as a success.
  - A cosmetic ink reveal is not a stroke-order lesson.
- **Randomness and identity:**
  - Cosmetic randomness is seeded and separate from the rules and learning streams. Never use `Math.random` for anything that could be confused with an outcome.
  - Pets never change an outcome, an option, an order or the schedule.
- **Reduced motion** keeps every cue and result. It removes disruptive movement and flashes; it does not remove meaning.
- **Resources:**
  - Cache keys are bounded: appearance, variant, pose and parameters only; never elapsed time or particle positions.
  - Budget: 48 MiB of estimated resident battle sprite and pose pixels (w × h × 4 × frames), backdrops reported separately. Measure and report it.
- **Pixel art direction (§6):**
  - Warm, earthy environments; indigo cloth and parchment UI; ink, paper and lantern motifs.
  - Volume comes from grouped light, mid and shadow planes and material-specific edges (cloth, hair, wood, wing membrane, fur, stone, metal). No noise or dither layer.
  - Key poses read well when paused.
  - Larger canvases only where they add visible authored information. No misleading "high resolution" toggle.
- **The owner's art reference (§5):**
  - A high-detail armoured dragon knight with a spear: material-specific shading (metal highlights, wing membranes with darker veins and spots), strong silhouette, overlapping forms, and secondary motion in a scarf and ribbons.
  - It is an 8-frame loop at 120 ms per frame (584 × 494 including the background).
  - **Study it for craft only.** It is not an asset to insert, a creature to reproduce, or a palette to copy. Its lesson: pose content and timing matter more than frame-rate numbers.
- **No network, CDN, library or Worker.** Everything is drawn in code; the game's CSP stays as it is.
- **Tests:**
  - Synthetic campaigns in fresh browser contexts; never a player's save.
  - Label every diagnostic fixture (for example, a companion in a Chapter 1 room) as diagnostic.
  - Captures go to `tests/e2e/out/<area>/`. Committed evidence goes to `docs/screenshots/battle/<area>/` as WebP, plus WebM recordings with Playwright's recorder.
  - Report the native frame sheets and timing traces.
- **Git:**
  - Commit on your own worktree branch.
  - Never push, merge into the task branch, rebase another branch, or force-push.
  - If a git operation is refused, stop and report it; do not work around it.
