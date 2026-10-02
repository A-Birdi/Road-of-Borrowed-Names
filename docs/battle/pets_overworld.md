# Pets in battle and the overworld parity pass — record

**Brief:** the battle art addendum (*Expressive Battle Art, Adaptive Combat UI, and Verified Playtest Repairs*),
§11 (cosmetic pets), §20 (overworld parity), with §6, §7.6 (the road sprites), §21.4 and §23.5 (pets).
**Area owner:** the pets/overworld worker (`docs/BATTLE_ART_CONTRACTS.md`). **Base:** `982c8df`.

Everything here was checked on the built `index.html` or in node as stated under **Commands and results**.
Nothing here claims human review, real devices, a fun verdict or a natural Chapter 1 route: every battle and
room below is a synthetic, session-only debug campaign (diagnostic fixtures, labelled as such).

## What changed, in one paragraph each

**Pets in battle.** The four animals keep their species, names, three looks each, active/hidden settings and
every authored reaction, but are drawn and timed to a higher standard. Art: neighbouring volumes share one light,
mid and shadow plane (*light masses*), overlaps cast a two-row shadow, speckle is merged into clusters (no noise
layer), warm coats no longer turn red in shadow, decals (eyes, nose) can no longer show through another part,
the tabby's stripes are a few broad bands, the dog and cat lose the pale "collar" line, the tanuki gains its
frosted back and cheek-ruff tufts, eyes have a lid, iris, pupil and glint, the bird's wing reads in bands (coverts,
bar, primaries) on finer legs and a slightly larger body. The battle view turns a little further round (54° instead
of the adventurers' 36°), still facing the creature, so the head's profile — eye, muzzle, ears — reads. Motion:
each reaction is fitted into the action it answers and never outlasts it into the next decision; a creature's
preparation gets a glance and a brace, its contact a quick safe flinch, its recovery a settle; a new timeline
cross-fades from the last pose; tail and ears follow the body; poses are held drawings at ≤12.5 changes a second.
Place: computed every frame from the live party anchors, never on a foot anchor, a creature or a reported badge;
moved aside or resting when crowded. Density: the animal's art grid follows the party's measured figure height,
so a larger revised party frame gives the pet more drawn detail at the same proportion, on the same pixel grid.

**Overworld.** Every regional style was compared at normal play scale with the battle art (see the parity table).
Two specific discontinuities were repaired: the **exit mat** (brown on brown; it vanished on wooden floors) is now an
indigo-dyed mat with a parchment binding, and a **turn on the spot** is drawn through a pivot (a half-turn passes
through the in-between view for 90 ms; a quarter turn shows a 70 ms settle frame) while the game's facing,
interaction tile and collision change at once, as before. The road pets share the battle pets' rasterizer and
looks, so their shading changes (warm shadows, no collar line, the tanuki's ruff) carry over. Grid, interpolation,
pathfinding, foot anchors, depth sorting, entrances, interaction range and map links are untouched — checked
against a record of the base commit (collision of every map, two flag sets; Atlas rooms of three seeds) and, in the
browser, against the base build side by side.

## Files and APIs

| File | Owner | Change |
|---|---|---|
| `src/engine/37_pets_2art.js` | mine | `K.mass(c, r, k)` (light masses: normals bent toward the larger form), `K.decal(p, fn, { grp })` (a decal only on its own part), render options `cast` (two-row cast shadow under a nearer part) and `cluster` (passes merging lone pixels into the colour five of eight neighbours share), warm-coat shadow rule in `shade()`. |
| `src/engine/37_pets_3rig.js` | mine | Patterns (tabby bands; neck part; dog/cat collar line removed; tanuki frost and `ruff` tufts; bird wing bands, cheek, finer legs); eyes; battle yaw 54°; `frame(sp, look, { kind: 'battle', density })` (0.75–2.5 in 0.05 steps; boxes and zoom scale with it; cached per density); bird battle zoom 2.25 (was 1.9); the quadruped battle frame 48×56 (was 48×52: the tanuki's tail lying on the ground touched the bottom edge in 6 of 21 sampled poses at the base); `cast`/`cluster`/masses on views with zoom ≥ 1.4 (battle, preview, portrait; the road frames at zoom 1 keep their old rendering apart from the shared pattern and shadow changes). |
| `src/engine/37_pets_5dev.js` | mine | Gallery rows for the brace and the settle; the dev creature move carries real timing (contact 640, end 1250). |
| `src/ui/85_battle_pets.js` | mine | `PREP`, `SETTLE` (also `IMPACT[sp].prep/.settle`); flinches quickened to 0.7 of their first timing; `fit()` (window, `MAX_RATE` 1.6, `MIN_WIN` 120 ms, optional brace/settle left out when they cannot fit, `SETTLE_GRACE` 450 ms); `CADENCE` 80 ms / `IDLE_STEP` 100 ms; cross-fade (110 ms) and release (160 ms); tail/ear follow-through (90/50 ms); `place(L, w, h)`, `footSpans(L)`, `densityOf(L)` (from the four companions' ready height, 82 px at the base frame), `extentOf(f)`; `stats()` adds `place`, `density`, `ground`, `foot`, `body` (drawn pixels), `cssPerArt` and counts `preps`, `settles`, `fitted`, `skipped`; the arrival starts beside your companion (never through their feet); tanuki ready stance upright; the companions' height measured at battle entry. |
| `src/engine/28_propwork.js` | mine (prop painter) | `exitmat` art: indigo mat, parchment binding, open diamond. Same tile, same footprint, flat. |
| `src/engine/32_spriteart.js` | mine | `RB.sprites.view(actor, t, still, frame) → { dir, frame, turn }`, `RB.sprites.turnStats()`, `RB.sprites.TURN = { PIVOT: 90, SETTLE: 70 }`. |
| `src/engine/60_render.js` | shared | `drawActor` asks `RB.sprites.view` for the drawn direction and frame (3 lines; see merge notes). |
| `tests/unit/pets_battle.test.mjs` | new | Never a target/result; identical tasks, option order, rules results, presentation events and actor schedule across 7 pet setups × 5 encounters with a seeded game stream; fitting, brace/settle, calm cut; placement. |
| `tests/unit/overworld_geometry.test.mjs`, `tests/fixtures/overworld_geometry_982c8df.json` | new | The geometry record of the base commit and its comparison. |
| `tests/e2e/battle_pets_overworld.mjs` | new | The browser test (battles and overworld; below). |
| `tests/e2e/overworld_figures.mjs` | new | §7.6 for the road sprites: the registry composition check and the eight-look gallery. |
| `tests/e2e/overworld_parity_shots.mjs`, `pets_overworld_evidence.mjs`, `pets_exchange_video.mjs`, `overworld_video.mjs`, `sheet.mjs` | new | Evidence tools (captures, sheets, timing trace, recordings). `pets_video.mjs` gained `--size`. |

## Pet reactions (family × species)

Every response, technique and companion action maps to a family (`src/engine/37_pets_0family.js`, unchanged; the
unit test fails on an unmapped id). The established reaction of each cell is kept; what changed is the drawing
(above) and the timing (fitted, held poses, cross-fade, follow-through). A second action in the same exchange gets a
short acknowledgement (0.62 of the time, 0.55 of the amplitude), as before.

| Family | Cat | Dog | Bird | Tanuki |
|---|---|---|---|---|
| unravel | follows the thread, a paw reaches | ears up, tracks it | head up, a small hop | rises, paws reaching |
| protect | sits tall, braced | braces low, leans back | tucks, turns aside | rises, paws held in front |
| light | looks up, a blink | nose to the light | head tilted to it | shades its eyes, then leans in |
| heal | eases, sits tall, blinks | softens, a slow wag | unfluffs, blinks | a breath out, paws folded |
| water | a paw lifted, draws back | head tilt | fluffs and shakes | paws together, looks up |
| wind | flattens, tail blown aside | braces in the gust | wings half out | leans into it |
| bind | watches, tail up and aside | leans back, watches | head tilt | paws busy, as if tying |
| stone | crouches, steady | spreads its stance | crouches | crouches, eyes shut |
| ice | an ear flicks | a sniff, an ear | fluffs against the cold | leans in, then back |
| fire | turns away, half-closed eyes | looks aside, a wag | wings, looks aside | paws up, looks aside |
| bell | ears turn one way, then the other | head tilt, ears up | calls (beak opens), a hop | head tilts side to side |
| interpret | ears forward, a knowing blink | looks to you, then at it | head tilts left and right | scratches its head |
| technique | sits tall, tail straight up | a forward-ready gesture | a wing flourish | a confident imitation, paws folded |
| support | glances to your companion | looks to your companion, a wag | glances over | glances over, paws |
| **creature prepares** (new) | glances at it, ears back, weight down, tail aside | glances at it, ears up, leans back, stance spread | sleeks and tucks, head tilted | glances at it, ears back, paws gathered |
| creature: hit / soft / status | a crouch, a look at whoever it was aimed at / a small crouch / ears back | brace and look / a lean / ears up | a startled flutter / fluff and tuck / head tilt | a lean back, paws / a lean / a sniff |
| **after its move** (new) | re-curls its tail, a flick | shakes out its ruff | fluffs, then smooths | folds its paws, a breath, a blink |
| victory | sits tall, tail up, slow blink | up, wags, sits | a wing flourish and a hop | rises, paws folded |

None of these is an injury cue, a number, a bar, a mark, a ward, a target or a turn.

## Parity table (overworld, §20)

Compared at normal play scale (1280×800: 2 device px per art px — the battle stage's density at that size) with the
current battle art and the addendum's direction. "Retained" means compared and kept, with the reason.

| Region / asset category | Disposition | Why |
|---|---|---|
| **Player, road sprite** (all regions) | **changed: turn transitions**; drawing retained | Front/side/back identity, the 8-phase walk and the idle breathing already match the battle figures' material approach (hue-shifted ramps, articulated rig). A turn on the spot snapped; it now passes through a pivot. Height unchanged (the registry check: 43–56 art px incl. outline; adult 50, a hat 4); no frame clipped; the sole on one row per direction. |
| Player, action transitions (talk, read, use) | retained | Examining opens an untimed dialogue at once; the field weave already has its knee dip and raised brush. A reach pose would need a world event hook (`50_world.js`, not mine) and four new arm drawings; recorded as a candidate, not done. |
| **Companion**, road sprite | changed: turn transitions | Same rig and the same `RB.content.chars[id].look` battle uses (checked in the browser). |
| **Pet**, road sprite | **changed** (shared rasterizer) | Warm shadows no longer red, no collar line, the tanuki's ruff, the bird's wing bands — the same animal as in battle. Road frame (32×32, the bird 24×24) and anchors unchanged (geometry test). |
| Frequent NPCs | changed: turn transitions; drawing retained | Same rig as the player; glancing NPCs now pivot. |
| **Exit mats** (transitions, 43 placements) | **changed** | Brown on brown vanished on wooden floors at ordinary zoom; now indigo with a parchment binding (the game's indigo-cloth-and-parchment motif), legible on wood, stone, grass and snow; flat, same tile. |
| Doors (house doors, `door`, `sa_door`) | retained | Inked frames and warm accents read at ordinary zoom; door fit unchanged (figure ≤ 56 incl. outline; house door frame 38, opening 33 — the standard set on 2026-09-28). |
| Ladders (incl. the mill ladder of RBN-01), stairs | retained | Legible; the ladder's art rises up the wall but its click tile (non-blocking) is clear; stairs inked. |
| Mechanisms: gears, millstone, mill wheel, levers, cranks, valve wheels, sluice gates, grates, dials, padlock, bell post | retained | Each reads as its object at the ordinary zoom; blocking props draw solid, non-blocking ones flat or slender (grid captures). |
| Field-weave mechanisms (`fw_*`: winch, pulley post, clamp post, slip screen) | retained, noted | Legible; the clamp post is small and sits at its tile's edge — not changed because the slip-screen/clamp interaction is a preserved success (§3); noted for the owner. |
| Readables: signs, noticeboards, mailboxes; chests, wells, holes | retained | Inked, with paper/brass accents; legible. |
| Buildings (`29_structart.js`: thatch, tile, slate, snow, glass; plaster, wood, stone) | retained | Grouped planes, material edges and inked doors already at the standard; no change needed for parity. |
| Ground tiles, all regions | retained (deliberately) | §20: a quieter world view; no grass noise. |
| Reedwake village; Reedwake mill (three floors) | retained + the changes above | Compared (regions sheet 1 and the prop grids): houses, mill machinery, ladder and stairs already use the hue-shifted ramps, selective/ink outlines and warm accents of the battle art; nothing else inconsistent at play scale. |
| Saltglass harbour; drowned archive | retained + the changes above | Compared: harbour structures, archive shelves and sluice machinery read at play scale; no discontinuity beyond the categories above. |
| Cinder Orchard village; kiln | retained + the changes above | Compared: as above (the potter's wheel, sluice and kiln props legible). |
| Snowbell hamlet; observatory | retained + the changes above | Compared: snow roofs and observatory machinery (dials, cranks) legible; the indigo mat reads on snow. |
| Lanternfall town; bell tower (flooded floors) | retained + the changes above | Compared: levers, valve wheels, grates and the flooded floors legible; the quieter ground kept. |
| Still Archive mount camp; reading room | retained + the changes above | Compared: the paper-strewn floors and archive doors legible; no change needed. |
| Interiors (tea house, hall, houses) | retained + the changes above | The tea house's exit mat is the before/after example. |
| Atlas rooms | retained + the changes above | Built from the same props and tiles; their geometry is in the record (three seeds). |

**Comparisons to repeat once the party worker's art lands:** the road-versus-battle look gallery
(`overworld_figures.mjs`; same look, road beside battle), the pet's density (automatic: it measures the
companions' drawn height) and its place against the new anchors (the browser test samples it), and the pet's
proportion beside the revised figures (`battle_pets_overworld.mjs` captures). The creatures' and backdrops'
revisions do not affect the overworld comparisons.

Observations from the road-beside-battle gallery for the party worker (battle side, not changed here): in battle,
the apron's bow and the scarf of some looks read less clearly than on the road; the robe's colour split
(upper/skirt) differs from the road's. Repeat the gallery after the revised party lands.

## Commands and results

Environment: this worktree, headless Chromium (Playwright's bundled build) on a shared 4-core Linux container
(load average between 6 and 35 during the runs, other workers testing at the same time), synthetic session-only
campaigns. Build: `node tools/build.mjs` (274 source files, about 7,983 KiB). The base build used for every
before/after comparison is `index.html` built at `982c8df`, kept untracked at
`tests/e2e/out/battle_pets_overworld/base_index.html` (re-create it by building a checkout of `982c8df`).
Browser tests were run one script at a time.

| Command | Result | Kind |
|---|---|---|
| `node tests/run-unit.mjs` | final source: 8,086 passed, 1 failed — the recognizer's p95 timing check (`recog-accuracy`, "p95 recognize() time < 60 ms") under load average ~30; rerun alone it passed (64 passed, 0 failed; p95 53 ms). An earlier full run during the work: 8,087 passed, 0 failed | unit, all files |
| `node tests/run-unit.mjs pets` | 249 passed, 0 failed: `pets.test.mjs` 164 (unchanged file) + `pets_battle.test.mjs` 85 | unit |
| `node tests/run-unit.mjs overworld_geometry` | 3 passed, 0 failed: 121 maps (90 authored + 31 Atlas rooms of three seeds) and 188 prop kinds identical to `982c8df` | unit |
| `node tests/e2e/battle_pets_overworld.mjs --battles-only` | 3 passed, 0 failed | browser |
| `node tests/e2e/battle_pets_overworld.mjs --world-only` | 15 passed, 0 failed (14 maps + the pivot) | browser |
| `node tests/e2e/overworld_figures.mjs` | 177 looks (incl. 15 keepsakes), 12,036 frames drawn, figure heights 43–56 art px, 0 problems, no page errors | browser |
| `node tests/e2e/pets.mjs` | 20 passed, 0 failed | browser (existing) |
| `node tests/e2e/pets_greet.mjs` | 17 passed, 0 failed | browser (existing) |
| `node tests/e2e/pets_gallery.mjs` | 7 passed, 0 failed | browser (existing; one check adapted, see merge notes) |
| `node tests/e2e/company_pets.mjs` | all ok | browser (existing) |
| `node tests/e2e/world_view.mjs` | this build: one run all ok, one run failing 2 checks (the phone camera around a dialogue). The base build failed the same 2 checks in its run under the same load. Timing-sensitive; not from this work | browser (existing) |
| `node tests/e2e/world_fixes.mjs` | all ok | browser (existing) |
| `node tests/e2e/departures.mjs` | this build: 3 runs, each failing 2–3 checks (the evening gathering's destinations; Tsuru's walk to the Hall). The base build: one run all ok, one run failing the same checks under the same load (load average 28–31); this build with the base overworld files swapped into the page also failed one of them. Timing-sensitive under this load; **not certified either way** — rerun on a quiet machine | browser (existing) |

**Battles** (`battle_pets_overworld.mjs`, 1280×800, the Flour Moth on the mill road with Mio, three knots, the real
mouse choosing Unravel / 守る, the answers and Mio's support; four exchanges each):

- no pet, cat, dog (black and tan), bird, tanuki (gray-brown), cat hidden by the setting: all six completed with
  no page errors; every sequence's schedule (10 sequences: player, companion, enemy ×3, finish — every cue's time,
  type, length, actor, pose, gesture, effect and result) identical (hash `688838efd8a5`), the four tasks identical
  (each generated from the same point of the seeded stream — see limitations), the end state identical;
- the game's `Math.random` was called 36–39 times during each battle (NPC blink timers ticking on real time; see
  limitations), never from or through any of the 16 pet source files in the page (stack attribution);
- each shown species: 7 reactions (3 of them second actions in an exchange, acknowledged), 3 braces, 3 flinches,
  3 settles, a victory; 7–12 of these timelines fitted to their action (never faster than 1.6×), none skipped; place
  "between" throughout; density 1;
- sampled every 120 ms through the whole battle: the animal's drawn pixels never contained an adventurer's foot
  anchor and never overlapped the intent box or a badge element; the same travelling alone (place "beside"), at
  390×844 (Nao, tanuki) and with reduced motion (Ren, bird: 7 reactions as held key poses);
- the arrival walk-in was found (by this test) crossing the companion's foot anchor for about 0.3 s; fixed (it now
  starts beside the companion).

**Overworld** (`--world-only`; 1280×800; each of `rw.village`, `rw.mill1`, `sg.harbor`, `sg.da_sluice`, `co.village`,
`co.kiln`, `sb.hamlet`, `sb.obs_hall`, `lf.town`, `lf.tower_mid`, `sa.camp`, `sa.reading`, `rw.tea` and an Atlas room
of seed 4242, with Mio and a cat): ten turn/step moves through the movement call the keyboard uses, then a mouse
click on the nearest readable prop — identical tiles, facing and outcome in the base build and this build (every
click reached its prop and opened it: the screen, signs, noticeboards, a lantern, the tea set, the Atlas fold…);
real key presses walk; the sprite frame (40×58), the foot anchor (20, 55), every figure's bounding box in every
direction and frame (player, Mio, Ren) and the map's collision identical; no figure taller than 56 art px (the base
too); the world draws the same looks the battle draws. A half-turn is drawn through its pivot while the facing
changes at once; with reduced motion there is none, and the walk is the same.

**Pose cadence and timing** (`node tests/e2e/pets_overworld_evidence.mjs`; `pets_timing_trace.json`): one exchange —
your Unravel (beat 560 ms, ends 1,140 ms) then the creature's Strike (contact 640 ms, ends 1,250 ms) — sampled every
40 ms from the real observer over 2.7 s: cat 24 drawn-frame changes (8.8 a second), dog 25 (9.2), bird 25 (9.2),
tanuki 27 (9.9). The Unravel reaction was fitted at 1.25×, the brace at 1×, the flinch at 1×, the settle at about
1.1×. Terms (§5.2): native authored resolution — the 48×56 battle frame at density 1 (the bird 40×40), drawn on the
party's integer grid; pose cadence — the figures above (≤ 12.5 a second by construction while reacting, ≤ 10 idle);
action duration — fitted to the action, as traced; display refresh — the browser's, not measured here.

**Resources** (§21.4, §21.5): the pet frames live in one least-recently-used cache shared by the road, battle,
preview and portrait views (cap 900; keys: species, look, view, density and the quantized pose — never time or a
random sample). After one full battle: cat 96 frames / 1,002 KiB of pixels, dog 85 / 886 KiB, bird 62 / 384 KiB,
tanuki 78 / 813 KiB (`RB.petArt.cacheStats()`; pixel arithmetic, not process memory). A battle frame at density 1
is 48×56×4 = 10.5 KiB; even a cache full of battle frames would be about 9.2 MiB. Not measured: browser surfaces,
GC or real-device memory. The overworld adds no cache (the pivot draws existing road frames; the mat is one cached
sprite per palette, as before).

## Evidence

Committed in `docs/screenshots/battle/pets_overworld/` (WebP and WebM); scratch captures and logs in
`tests/e2e/out/battle_pets_overworld/`. Produced by `pets_overworld_evidence.mjs` (after `overworld_parity_shots.mjs`
on the base and this build, `overworld_figures.mjs` and the battle test), `pets_exchange_video.mjs` and
`overworld_video.mjs`.

| File | What it shows |
|---|---|
| `pets_matrix_native.webp`, `pets_matrix_3x.webp`, `pets_matrix_3x_before.webp` | The coverage matrix — every family, the creature's move (brace, hit, soft, status, settle), victory, idles, stances; three moments and the reduced-motion hold — at native size and 3×; the base build's at 3× |
| `pets_looks_3x.webp`, `pets_looks_3x_before.webp` | Every look of every species: battle calm, battle reaction, road sitting, road walking (3×), this build and the base |
| `pets_timeline_{cat,dog,bird,tanuki}.webp`, `pets_timing_trace.json` | One exchange every 120 ms at 3× from the real observer, and its trace |
| `battle_pets_stage.webp` | The battle stage with no pet, each species, travelling alone, at 390×844 and with reduced motion (captured at each battle's end) |
| `battle_pet_exchange.webm` | Real-time recording (800×450): two exchanges and the last knot with a tanuki — its reactions, the brace, flinch and settle around the moth's Strike, the victory gesture |
| `overworld_regions_{1..4}.webp` | Fourteen regional views before/after at normal play scale |
| `overworld_interactables_{1..3}.webp` | Twenty-nine interactable kinds before/after, with the tile grid (blocking tiles red, the prop's own tiles yellow) |
| `overworld_exitmat.webp` | The exit mat before/after (2×) |
| `overworld_figures_gallery.webp` | Eight deliberately different player looks on the road (four directions, walking, idle) beside the same look in battle |
| `overworld_walk.webm` | Real-time recording (800×450): turns, a half-turn pivot, the exit mat, a door, a click on a readable thing |

## Limitations

- **No human review.** The §22.4 rubric was not scored by a person; the art judgements here are the worker's own,
  from native frames and captures. Headless Chromium only; no phone, tablet, other browser, audio or handwriting.
- **The party and creature art is changing in parallel.** The pet's density and place follow the live party by
  construction, but its proportion beside the revised figures and the road-beside-battle gallery must be looked at
  again once that art lands (see the parity section).
- **Badges.** The integrator's per-enemy badges are not in this worktree. The pet keeps clear of the creatures'
  bodies (where per-enemy badges sit) and of any rectangles the layout reports in `L.badges`; the browser test
  checks the DOM `.intent` box and any `[class*=badge]` element. The pet is drawn on the battle canvas, under every
  DOM layer, so it cannot cover a DOM badge.
- **The settle can outlast the creature's own recovery** by up to 450 ms (`SETTLE_GRACE`), alongside the return to
  the decision, where it is eased out; nothing waits for it. A reaction that cannot fit even at 1.6× may overrun its
  action slightly and is eased out the same way. A brace or settle that cannot fit at 1.6× is left out.
- **The game's learning stream is shared with cosmetic NPC blinks — found here, not fixed (outside this area).** In a
  browser, `RB.learn.pick` (`src/learn/10_mastery.js`) draws from `Math.random`, and so do the world's NPC blink and
  glance timers (`src/engine/50_world.js`, `update`), which keep ticking on real time while a battle plays. So the
  tasks a battle generates depend on frame timing in any run, with or without a pet (two runs with a cat gave
  different tasks; two without one happened to match). The pet modules make no `Math.random` call (stack
  attribution in the browser test), and the node test, with the stream fully controlled, shows identical tasks for
  every pet setup. The browser test therefore reseeds before each task. Recommended to the owner of those files:
  give NPC blinks and glances their own cosmetic stream, as the pets and backdrops have.
- **Road action transitions** (a reach when you examine or use something) were not added (see the parity table).
- **The warehouse floorboard** (§2.9): Nao's line about the missing third floorboard in `rw.warehouse` is not drawn in
  the room. Not in this assignment's sections; left for the owner (a flat, non-blocking decal, or a less specific
  line).
- The field-weave clamp post is small and sits at its tile's edge (noted, not changed: a preserved interaction).
- **`departures.mjs` and `world_view.mjs` were not certified.** Under the shared machine's load (average 28–35,
  several workers testing at once) both failed some timing-sensitive checks on this build and on the base build
  alike (see the results table); they need a rerun on a quiet machine before anyone relies on them.
- `tests/e2e/battle_pets_overworld.mjs` takes about 25 minutes on a loaded machine (the overworld half loads each
  map three times: base, this build, the keyboard check).

## Merge notes

- `src/engine/60_render.js` (shared, no listed owner): `drawActor` asks `RB.sprites.view(a, t, still || isFoe,
  frame)` for the drawn direction and frame (3 lines replace 1). If that file changed elsewhere, re-apply by hand; the
  call only chooses what is drawn — position, depth, shadow and alpha are untouched.
- `src/ui/83_battle_stage.js` was **not** edited. The pet relies on `layout()` still setting `L.pet` (used only as the
  signal that a pet is shown: the stage calls `RB.battlePets.draw` when it is set) and on `L.pc`, `L.comp`, `L.ps`,
  `L.pw`, `L.ph`, `L.F`, `L.Sr`, `L.foes`, `L.scale`. Optional for the integrator: `L.badges` (canvas art-px rects
  `{x0, y0, x1, y1}`) to have the pet keep clear of badges exactly. The backdrop composer's party box still reserves
  the old pet rectangle (24 / 46 × `ps`); at a density above 1 the animal can be a little larger than that.
- `tests/e2e/pets_gallery.mjs`: its event check compares the creature move's own trace entry (a brace and a settle
  now surround it). `RB.battlePets.stats().trace` entries gained `impact` (`prep` | `hit` | `soft` | `status` |
  `settle`) and `rate`; `family` keeps its meaning. `stats()` gained `place`, `density`, `ground`, `foot`, `body`,
  `cssPerArt`.
- `src/engine/37_pets_2art.js` `shade()` changed for warm hues; it is the pets' own copy (the shared `RB.pix.shade`
  is untouched).
- Content-owned prop painters (`sa_door`, `lf_wheel`, `fw_*` in `src/content/…`) were compared, not edited.
- `index.html` is regenerated here; never hand-merge it — rebuild after merging.
- New test files: `tests/unit/pets_battle.test.mjs`, `tests/unit/overworld_geometry.test.mjs` (+ the fixture),
  `tests/e2e/battle_pets_overworld.mjs`, `overworld_figures.mjs`, `overworld_parity_shots.mjs`,
  `pets_overworld_evidence.mjs`, `pets_exchange_video.mjs`, `overworld_video.mjs`, `sheet.mjs`. None is added to
  `tests/e2e/run.mjs` (the battle/overworld one is long); add it there if the integrator wants it in the default run.
