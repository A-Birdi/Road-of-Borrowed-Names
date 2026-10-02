# Contextual battle backdrops (§19)

**Area:** backdrop worker (battle-art addendum, 2 October 2026). Sections
covered: §19 (all), §2.9, §3 (the Moth settings kept), §6, §12.3 (geometry the
layout can rely on), §21.4 (cache and rendering). Contracts:
`docs/BATTLE_ART_CONTRACTS.md`. Coverage list: `docs/battle/INVENTORY.md`.

A battle's backdrop is a glimpse of where the encounter happens. It is
composed once per encounter from the map in its current state, written down
as an **origin record** that rebuilds it exactly, and projected from the
**actors' positions** (never from the overlay's free rectangle), so a larger
canvas, a withdrawn panel or a resize shows more of the same picture instead
of a new one.

## Files and APIs

| File | What it holds |
|---|---|
| `src/ui/76_battle_places.js` | `RB.battlePlaces`: the survey of the map, the composition (structure, context, seeded accessories with homes on the map), the origin record, the geometry and projection, layout, painting of the static layer, the per-frame ambient layer, the layer cache, test hooks. |
| `src/ui/76_battle_placeart.js` | `RB.battlePlaceArt`: every painter (rooms with side walls, open land, water, ladders with hatches, stairs up and down, the gear train and the water wheel in cached phases, light, haze) and the small accessory sprites. Chooses nothing. |
| `src/ui/79_battle_scene.js` | `RB.battleScene.backdrop()`: calls `RB.battlePlaces.draw()` and keeps the region painters as the fallback when a battle has no map position. Unchanged in this pass. |
| `src/content/zz_battle_views.js` (new) | Authored `battleView` metadata on map definitions (the existing content model): stair directions, ladder hatches and rope ladders the tiles cannot describe, with a note of what each view must show. |
| `tests/unit/battle_places.test.mjs` | Node tests of the composition and projection (see *Commands and results*). |
| `tests/e2e/battle_backdrops.mjs` (new) | Browser tests of the built game at five viewports, menu movement, state pairs, motion; the capture harness and the evidence writer. |
| `tests/e2e/backdrops.mjs` | The earlier browser test, brought to the new geometry contract. |

Public API (`RB.battlePlaces`):

- `begin(enemy, opts)` — called once at encounter entry by `RB.combat`'s `placeEnemy` (unchanged call). Seed: `opts.presentSeed`, else `forceSeed(n)`, else a hash of the map, the tile and an in-memory encounter counter (not saved).
- `draw(c, key, w, h, hz, t, still, F)` — draws the backdrop for this frame; returns `false` when there is no composed place (the caller paints the region fallback). `F` is the stage's arrangement in canvas px: `{ ex, ey, ext, scale, ps, px, py, party, creatures, art }`; **`F.S` (the overlay's free rectangle) is accepted and ignored**. Optional: `F.hush` (0 calm … 1 still) to override the scenery's hush; `F.particles === false` draws machinery only (tests).
- `origin([comp])` — the origin record (below); `recompose(record)` — rebuilds the composition from the record alone.
- `last()` — the record plus the current frame's placements (for tests and captures); `resources()` — cache figures.
- Test hooks: `compose`, `survey`, `geometry`, `projector`, `probe(F, w, h, hz, region)` (paints off screen and returns a checksum), `checksum()`, `layerPixels()`, `forceSeed()`, `debug()`.

## The three layers (§19.1)

1. **Structure (never random).** Indoors or out, from `RB.render.enclosed`.
   - A **small room** (at most 20 × 16 cells of floor; the room is the rows and columns that are mostly floor, so a door or passage through the outer wall is not part of it) is one glancing view of the whole room, the same wherever in the room the encounter starts: the back wall with its openings (gaps in the top wall row), **the side walls receding in perspective with their openings at the rows where they are** (doors, passages, stairs), and the landmarks in view, each at its own column and row: ladders on their wall with the hatch at the top open or shut, stairs (up through the back wall or a cliff, down through the floor, or into a side opening), the gear train, shelves, the millstone, counters, pillars, conduits, bells.
   - A **large hall** reads the stretch around the encounter back to the nearest wall ahead.
   - **Out of doors** the composition reads the encounter's **local** window: 10 columns either side, 12 rows ahead, 4 behind. Buildings show the front the map shows; the water wheel; water, cliffs, bridges and the path are the map's cells projected onto the ground plane. Beyond the window the view thins in eight steps into haze (darkness in a hall), so a wide canvas never shows invented country and a distant river does not reach an inland fight.
   - Every piece records the map prop, building or tile run it comes from.
2. **Local context.** The nearest real props per kind (trees, reeds, rocks, barrels, crates, lanterns…) in their current state; far trees, bushes, reeds, rocks and fences become lines on the horizon.
3. **Decoration.** A seeded, bounded choice of themed clusters per kind of place (indoors two on the wall and two or three on the floor; out of doors three or four on the ground; a cobweb now and then). Each cluster gets a **home on the map** at composition time: a stretch of back wall that is wall (not an opening, not beside a wall landmark), a floor cell by the back wall or along a side wall, or a patch of ground that is dry, off every prop and building, a cell clear of the landmarks, on its side of the scene, apart from the other clusters, and meeting its condition (reeds only by water, shells on sand, flowers on grass, mushrooms by trees). Its ordered alternatives (the rest of its side, then the other side) are tried when a frame puts the home behind an actor. Nothing is set down on water, hangs without its beam, stands on a landmark, or sits behind the response's lane.

## The origin record (§19.2)

`RB.battlePlaces.origin()` for the Flour Moth on the mill's ground floor (`rw.mill1`, placement `m1a`, seed 7, gears mended):

```json
{
 "v": 1, "map": "rw.mill1", "x": 3, "y": 4, "enemy": "rw.dustmoth",
 "key": "mill", "fam": "mill", "setting": "indoor", "fallback": null,
 "zone": "room:mill",
 "view": { "mode": "room", "x0": 1, "x1": 13, "yBack": 2, "yNear": 10,
           "room": { "xl": 1, "xr": 13, "yt": 2, "yb": 10 }, "zone": null },
 "facing": "north", "override": null,
 "note": "Ground floor: ladder up on the west wall (hatch shut until the gears are mended), gear train on the north wall, stairs down to the wheel pit at the east front.",
 "anchors": ["prop:millstone@6,4", "prop:gears@10,2", "prop:ladder@2,2>hatch-open", "prop:stairs@12,9>down"],
 "context": ["prop:hay@1,6", "prop:crate@2,9", "prop:crate@1,8", "prop:barrel@13,4"],
 "lines": [],
 "state": ["prop:gears@10,2?!rw_gears=0", "prop:gears@10,2?rw_gears=1", "view:hatch@2,2?rw_gears=1"],
 "light": "dusk", "seed": 7,
 "accessories": [
  { "id": "scrolls", "zone": "hang", "side": "L", "variant": 2, "at": "wall:4,1" },
  { "id": "shelf", "zone": "hang", "side": "R", "variant": 0, "at": "wall:8,1" },
  { "id": "baskets", "zone": "base", "side": "L", "variant": 1, "at": "1,4" },
  { "id": "grain", "zone": "base", "side": "R", "variant": 0, "at": "8,2" }],
 "sig": "1s3ar5h"
}
```

| Field | Meaning |
|---|---|
| `map`, `x`, `y` | The source map and the encounter's tile: the foe's tile at contact for a placed foe (`RB.world` `startFoe`, so a patrolling foe's record follows where it actually met you), the player's tile for a scripted battle. |
| `zone`, `view` | The room or zone and how it is read: `room` (the whole small room), `hall` (around the encounter to the nearest wall ahead), `land` (the local window). `view.zone` names an authored zone. |
| `facing`, `override` | Always `north` (the world camera's direction: left is west). `override` is set when the map's `battleView` overrides the view (`'map'` or `'zone:<name>'`). |
| `note` | The authored note of what the view must show (from `battleView.note`). |
| `anchors` | Structural anchor ids, `src:id@at`, with `>up`/`>down`/`>east`/`>west` for stairs and `>hatch-open`/`>hatch-shut` (and `rope`) for ladders. |
| `context`, `lines` | The nearby scenery chosen, and the far scenery drawn as horizon lines. |
| `state` | The **state keys**: every conditional prop, building, hatch and map light variant in view, as `key?condition=0|1` (whether its condition held). |
| `light` | `day`, `dusk` (a dark map or evening) or `night` (the map's or, for a room, the outside's). |
| `seed`, `accessories` | The cosmetic seed and the seeded choice: cluster, zone, side, variant, home (`x,y` on the floor or `wall:x,y`). |
| `sig` | A hash of the map, tile, key, family, seed, view and state keys: part of every cache key. |

`recompose(record)` answers every condition from the record's state keys,
so the record rebuilds the identical composition (and record) without the
live campaign. This holds for every encounter setting (unit and browser
tests below).

### Authored metadata (`battleView`, §19.2)

Added through the existing content model, without touching any map's tiles
or props (`src/content/zz_battle_views.js`):

| Map | What is authored | Why |
|---|---|---|
| `rw.mill1` | stairs `12,9` down; ladder `2,2` hatch open while `rw_gears` | The stairs lead down to the wheel pit (`rw.m1_stairs`); the loft trapdoor is held shut by the jammed gear shaft (`rw.m1_ladder`). |
| `rw.mill0` | stairs `2,8` up | Up to the ground floor. |
| `sb.obs_gallery` | ladder `10,4` hatch open while `sb_crank` | The dome exit is locked (`sb.hatch`) until the crank is turned. |
| `sb.obs_charts` | stairs `14,5` east | Through the east wall's opening to the gallery (closed by ice until the log is solved: the ice wall is the map's own conditional prop). |
| `lf.tower_mid` | ladder `3,3` rope | "A rope ladder up to the loft" (`lf.ladder_mid`). |

Everything else is read from the tiles: stairs flanked by wall or cliff
climb through it (the kiln's levels, the Cinder Terraces); stairs on the
back row in front of an opening in the back wall go up into it (the
Lanternfall stacks to the records room, the tower's top floor); stairs at a
room's side wall with an opening beside them go into it; any other stairs go
down through the floor.

## Geometry for any canvas (§19.3, §12.3)

The geometry is derived from the actors only: `F.ex/ey/ext/scale` (the lead
creature, or every creature of a group), `F.party` (the stage's box round
the party and the pet), `F.px/py/ps` (your feet) and the horizon `hz`.

- **Scale.** A map column is a fixed width: 24 backdrop px at the horizon out of doors and in halls, and `clamp(400 / columns, 20, 32)` in a small room. Columns widen toward the viewer by a fixed rate (1/250 per px below the horizon out of doors, 1/330 in rooms). The backdrop is painted at the actors' whole-number scale `u` and blitted ×`u`.
- **Anchor.** Out of doors and in halls the encounter's tile lies under the creature, at its feet; the row behind it at the party's feet (a perspective curve through those two rows and the horizon). A small room is centred on the formation (between the party's left edge and the creature's right edge) and its floor runs from the horizon to the party's feet.
- **The overlay is ignored.** `F.S` changes nothing; withdrawn or returned panels change nothing; the static layer is not rebuilt (tested).
- **A larger canvas only reveals more.** Nothing in layout or paint depends on the canvas size: textures are drawn on lattices anchored to the scene, rows and columns come from the projection, the water mask has a margin. With the same actors, a canvas twice as large repeats the smaller one pixel for pixel where they overlap (tested for a room, open land and a hall).
- **A resize** with a new arrangement re-projects the same composition: the same record, seed and accessory choice, nothing mirrored, the back wall's landmarks in the same west-to-east order; a floor landmark that would fall behind a combatant (the mill's stairs) slides along its row away from the creature, keeping its side, or is left out of view; large quiet landmarks behind the creature (the gear train, shelves) are drawn in shadow.
- **For the integrator:** keep the actors where they are when panels withdraw (the backdrop follows the actors, so moving them would pan it with them, consistently). The fields read from `F` are listed above.

## Persistent state (§19.1, §19.4)

The survey evaluates every conditional prop, building, hatch and light
variant in view against the campaign (or the record) and records it as a
state key; the painters draw the state:

- **The mill's gears** (`rw_gears`): jammed — a split wedge between the cogs, a timber prop lashed against the pit wheel, the drive shaft cocked with a split along it, sheared pegs on the floor, the loft hatch planked and barred; mended — a true, banded shaft, the hatch open, and (with motion) the train turning slowly.
- **The water wheel** (`rw_echo_done`): still, with a calm dark race and a leaf of debris; freed, white water where the paddles meet the race and spray (a still frame keeps that meaning under reduced motion), and the wheel turning.
- **The reed bed across the animal track** (`rw_mr_nao`): standing, then gone.
- **The village bridge** (`bridge_fixed`): open water in its gap with the planks broken off at both ends; whole.
- Also every other conditional prop in view (dead/lit lanterns, ice walls and their doors, levers, flooded floors draining, the kiln door, the great lamp, cranks, dials, chests).

The state keys are in the record's `sig`, which is part of every layer cache
key, so a later encounter never shows an old broken version.

## Detail and motion (§19.5, §6)

- **Light and planes.** Rooms: the back wall in the room's warm shade, darker toward the top and into the loft or vault above; the side walls one step darker and darker toward the viewer; the floor lit where the party and the creature stand and deeper toward the viewer; windows in the building's front throw a pale shaft over the party's shoulders by day; lamps make stepped warm pools. Out of doors: a stepped sky in twice as many tones with a few high strata, ridges and tree lines on the horizon, ground bands at fixed depths (the far ground lighter and calmer), the near ground one step deeper, the periphery hazed. No blur, no dither or noise layer: grouped light/mid/shadow planes and lattice-anchored clusters.
- **The backdrop is never the busiest layer.** World props behind the creature or the party are in shadow; mid-distance props a step hazed; accessories one step quieter than the landmarks; nothing decorative in the actors' boxes or the response's lane.
- **Ambient motion (per frame, not cached).** Dust, snow, embers or pages on a fixed field round the scene anchor (so their density does not change with the canvas), dust turning in window shafts, a lamp's pool breathing now and then, glints on the map's water, the gear train and the wheel turning in eight cached phases. Slow: one phase every 380–420 ms of the ambient clock.
- **Hush.** While you read, choose and write (`RB.combat.phase()` is `choose`, `challenge` or `companion`) the scenery runs at half (motes thinned, smaller drift); for 450 ms after each placed result (`RB.battleSeq.stats().counters.beats` rising: the moment a blow, a ward or a heal lands) it falls almost still and the lamps and glints stop. The ambient clock itself is already slowed while you read (`80_combat.js`).
- **Reduced motion** draws no particles, glints or flicker; machinery rests at its rest phase. Its state is still drawn (the jam, the white water), so no meaning is lost.

## Caching and resources (§21.4)

- The static layer is painted once per **(record signature, actor geometry, size bucket)**: the canvas size rounded up to 64 px. Up to three layers are kept (least recently used out); a new encounter drops the previous encounter's layers. Turns, hits and statuses never rebuild it.
- The water mask is kept as one byte per pixel (its canvas is dropped after painting).
- The art caches behind it: world-prop crops, accessory sprites, tinted copies, wheel and gear phases (capped at 600 entries).
- Figures (`RB.battlePlaces.resources()`, measured in the browser test at five viewports, three encounters; layer bytes = RGBA pixels of the kept layers plus their water masks): see the table below. These are **pixel arithmetic, not measured process memory**, and are **reported separately from the 48 MiB sprite budget** (they are not sprite or pose pixels).

| Encounter, viewport | Layers kept | Layer bytes | Art cache (sprites, bytes) | Last build | Max build in that page |
|---|---|---|---|---|---|
| mill-ground-floor 320×640 | 2 | 1.56 MiB | 25, 0.10 MiB | 4.2 ms | 27.6 ms |
| mill-ground-floor 390×844 | 2 | 3.06 MiB | 26, 0.10 MiB | 10.9 ms | 36.9 ms |
| mill-ground-floor 844×390 | 2 | 3.06 MiB | 23, 0.09 MiB | 17.5 ms | 39.1 ms |
| mill-ground-floor 1280×800 | 2 | 2.19 MiB | 24, 0.10 MiB | 17.1 ms | 49.7 ms |
| mill-ground-floor 1920×1080 | 2 | 1.88 MiB | 24, 0.09 MiB | 7.6 ms | 38.8 ms |
| reedwake-mill-front 320×640 | 2 | 1.98 MiB | 25, 0.10 MiB | 32.2 ms | 53.4 ms |
| reedwake-mill-front 390×844 | 2 | 3.87 MiB | 27, 0.12 MiB | 54.6 ms | 152.4 ms |
| reedwake-mill-front 844×390 | 2 | 3.87 MiB | 23, 0.10 MiB | 95.6 ms | 95.6 ms |
| reedwake-mill-front 1280×800 | 2 | 2.77 MiB | 23, 0.10 MiB | 33.1 ms | 81.7 ms |
| reedwake-mill-front 1920×1080 | 2 | 2.38 MiB | 26, 0.12 MiB | 33.2 ms | 53.7 ms |
| saltglass-shore 320×640 | 2 | 1.98 MiB | 18, 0.06 MiB | 16.6 ms | 70.6 ms |
| saltglass-shore 390×844 | 2 | 3.87 MiB | 18, 0.06 MiB | 41.4 ms | 157.6 ms |
| saltglass-shore 844×390 | 2 | 3.87 MiB | 16, 0.03 MiB | 58.1 ms | 59 ms |
| saltglass-shore 1280×800 | 2 | 2.77 MiB | 17, 0.06 MiB | 21.1 ms | 146 ms |
| saltglass-shore 1920×1080 | 2 | 2.38 MiB | 16, 0.03 MiB | 16 ms | 46 ms |

Reading the figures:

- **Worst case:** 3 kept layers of the largest bucket measured (448 × 896 at 390 × 844) ≈ 5.8 MiB. The 1280 × 800 and 1920 × 1080 desktops paint 640 × 448 buckets (the art buffer is 640 art px wide there).
- **Two layers per battle:** the stage settles its arrangement once after the overlay's first measurement, so the first frame's geometry is replaced once; the first layer stays cached until evicted.
- **Build times** are the composition's first layout and paint, including the first use of each prop's art (cropped with `getImageData`). They were measured on a shared 4-core machine running five workers (load average roughly 17–35), so they are indicative only: in the run above most builds took 4–60 ms and the slowest 158 ms; an earlier run under heavier load had outliers up to 771 ms. The older test `tests/e2e/backdrops.mjs` logs every encounter setting's build over 60 ms. A build happens once per encounter (twice on entry, see above) and on a resize; never per frame.
- **Per frame:** one blit of the layer, at most two machinery sprites, ≤ 44 motes, a few glints.

## Every encounter setting (§19, Chapters 1–6 and the Atlas)

Generated from the composer for every placed foe and every scripted boss
(each at a campaign state where its placement is live), seed 7. **Upgraded**:
the setting's composition was reviewed in the before/after captures of the
representative set (24 settings, every backdrop family indoors and out).
**Verified**: the same composer and painters, checked by the unit and
browser tests (origin record rebuilds it; every piece traces to the map;
dry, supported, actor-clear decoration; no page errors) but not reviewed one
by one. No setting is left on the old presentation; the region painters
remain only for a battle without a map position.

| Setting | Creature | Tile | Key · view | Zone | Structural anchors (from the map) | State keys | Disposition |
|---|---|---|---|---|---|---|---|
| `rw.millroad` f1 | Reedling | 10,21 | reedwake · land | waterside+by-building+trees+cliffs:meadow | bldg@14,19, water@19-20, cliffs@1-5, cliffs@7-11, cliffs@13-17 | 6 | upgraded |
| `rw.millroad` f2 | Reedling | 6,9 | reedwake · land | water-beyond+mill+trees:meadow | millwheel@14,2, bldg@6,1, water@13-16 | 3 | verified |
| `rw.millroad` f3 | Flour Moth | 11,7 | reedwake · land | waterside+by-building+mill+trees:meadow | millwheel@14,2, bldg@6,1, water@13-21 | 2 | upgraded |
| `rw.mill1` m1a | Flour Moth | 3,4 | mill · room | room:mill | millstone@6,4, gears@10,2, ladder@2,2>hatch-open, stairs@12,9>down | 3 | upgraded |
| `rw.mill1` m1b | Runoff Blot | 11,6 | mill · room | room:mill | millstone@6,4, gears@10,2, ladder@2,2>hatch-open, stairs@12,9>down | 3 | verified |
| `rw.mill0` p1 | Runoff Blot | 11,6 | mill · room | room:mill | stairs@2,8>up, water@6-8, bridge@6-8 | 2 | verified |
| `rw.mill0` p2 | Reedling | 3,4 | mill · room | room:mill | stairs@2,8>up, water@6-8, bridge@6-8 | 2 | upgraded |
| `sg.road` r1 | Label Crab | 8,16 | saltglass · land | waterside:meadow | water@0-14 | 2 | upgraded |
| `sg.cove` c1 | Label Crab | 14,8 | saltglass · land | waterside+cliffs+shore:sand | sg_wreck@11,11, water@19-22, cliffs@4-24 | 2 | verified |
| `sg.cove` c2 | Label Crab | 22,12 | saltglass · land | waterside+cliffs+shore:sand | sg_wreck@11,11, water@12-29, cliffs@12-29 | 2 | upgraded |
| `sg.cove` w1 | Harbour Fog | 19,6 | saltglass · land | waterside+cliffs+shore:sand | water@19-22, cliffs@9-29 | 2 | verified |
| `sg.da_entry` e1 | Label Crab | 6,12 | archive · hall | hall:archive | shelf@2,2, shelf@3,2, shelf@4,2, shelf@5,2, shelf@6,2, shelf@7,2, shelf@8,2 +8 | 0 | verified |
| `sg.da_entry` e2 | Label Crab | 21,11 | archive · hall | hall:archive | shelf@14,2, shelf@15,2, shelf@16,2, shelf@20,4, shelf@21,4, shelf@22,4, sg_drawers@11,3 +4 | 0 | upgraded |
| `sg.da_stacks` s1 | Soggy Paper Crane | 8,13 | archive · hall | hall:archive | shelf@3,4, shelf@4,4, shelf@5,4, shelf@6,4, shelf@7,4, shelf@8,4, shelf@9,4 +9 | 0 | verified |
| `sg.da_stacks` s2 | Soggy Paper Crane | 20,8 | archive · hall | hall:archive | shelf@9,4, shelf@10,4, shelf@11,4, shelf@17,4, shelf@18,4, shelf@19,4, shelf@20,4 +9 | 0 | verified |
| `sg.da_stacks` s3 | Runaway Ink | 24,5 | archive · hall | hall:archive | shelf@17,4, shelf@18,4, shelf@19,4, shelf@20,4, shelf@21,4, shelf@22,4, shelf@23,4 +5 | 0 | verified |
| `sg.da_reading` r1 | Undelivered Letter | 14,9 | archive · room | room:archive | shelf@1,2, shelf@2,2, shelf@3,2, shelf@4,2, shelf@5,2, shelf@6,2, shelf@11,2 +9 | 0 | upgraded |
| `sg.da_sluice` m1 | Postmark Moth | 6,5 | archive · hall | hall:archive | water@1-16, doorway@13,1 | 7 | verified |
| `sg.da_sluice` m2 | Postmark Moth | 21,15 | archive · hall | hall:archive | water@11-26, doorway@11,4 | 9 | verified |
| `sg.da_sluice` g1 | Ledger Heap | 17,4 | archive · hall | hall:archive | water@7-26, doorway@13,1 | 5 | verified |
| `co.upper` m1 | Ash Moth | 10,18 | cinder · land | trees+cliffs:ash | cliffs@2-20 | 8 | upgraded |
| `co.upper` s1 | Smoke Blot | 25,11 | cinder · land | cliffs:ash | stairs@30,7>up, stairs@31,7>up, cliffs@15-29, cliffs@32-35 | 6 | verified |
| `co.upper` m2 | Ash Moth | 26,18 | cinder · land | trees+cliffs:ash | stairs@30,7>up, stairs@31,7>up, cliffs@16-36 | 6 | verified |
| `co.oldworks` g1 | Glass Golem | 13,15 | cinder · land | open:earth | kiln@11,3, bldg@16,1 | 2 | verified |
| `co.oldworks` s2 | Smoke Blot | 29,10 | cinder · land | trees+cliffs:stone | co_beam@27,9, bldg@16,1, cliffs@19-39 | 2 | upgraded |
| `co.oldworks` e1 | Ember Wisp | 20,21 | cinder · land | open:stone | co_beam@11,21, co_beam@27,9 | 0 | verified |
| `co.kiln` e2 | Ember Wisp | 20,19 | kiln · hall | hall:kiln | — | 1 | verified |
| `co.kiln` g2 | Glass Golem | 14,13 | kiln · hall | hall:kiln | stairs@6,16>up, stairs@7,16>up, stairs@22,9>up, stairs@23,9>up, pillar@10,12, pillar@19,12, doorway@22,9 | 1 | upgraded |
| `co.kiln` e3 | Ember Wisp | 8,5 | kiln · hall | hall:kiln | co_kilnwall@11,3, kiln@18,2, co_beam@3,5 | 4 | verified |
| `sb.obs_path` fox1 | Snow Fox | 9,22 | snowbell · land | trees+cliffs:snow | cliffs@0-19 | 4 | verified |
| `sb.obs_path` fox2 | Snow Fox | 18,26 | snowbell · land | trees+cliffs:snow | shrine@9,30, cliffs@8-20, cliffs@24-27 | 2 | verified |
| `sb.obs_path` wisp1 | Frost Wisp | 14,11 | snowbell · land | trees+cliffs:snow | sb_observatory@10,1, telescope@23,5, bldg@19,2, cliffs@7-24 | 5 | upgraded |
| `sb.obs_hall` wisp2 | Frost Wisp | 5,5 | observatory · room | room:observatory | sb_icewall@10,1, sb_dial@12,3, noticeboard@6,2, pillar@4,3, pillar@16,3, pillar@4,12, pillar@16,12 +4 | 4 | upgraded |
| `sb.obs_hall` wisp3 | Frost Wisp | 14,10 | observatory · room | room:observatory | sb_icewall@10,1, sb_dial@12,3, noticeboard@6,2, pillar@4,3, pillar@16,3, pillar@4,12, pillar@16,12 +4 | 4 | verified |
| `sb.obs_hall` ghost1 | Lantern Ghost | 9,7 | observatory · room | room:observatory | sb_icewall@10,1, sb_dial@12,3, noticeboard@6,2, pillar@4,3, pillar@16,3, pillar@4,12, pillar@16,12 +4 | 4 | verified |
| `sb.obs_charts` moth1 | Chart Moth | 5,8 | observatory · room | room:observatory | shelf@1,2, shelf@2,2, shelf@3,2, shelf@6,2, shelf@7,2, shelf@8,2, sb_starchart@4,5 +7 | 3 | upgraded |
| `sb.obs_gallery` ghost2 | Lantern Ghost | 3,7 | observatory · room | room:observatory | ladder@10,4>hatch-shut, sb_crank@12,3, noticeboard@7,2, telescope@2,6, telescope@17,3, pillar@5,4, pillar@14,4 +4 | 3 | verified |
| `sb.obs_gallery` golem1 | Icicle Warden | 16,7 | observatory · room | room:observatory | ladder@10,4>hatch-shut, sb_crank@12,3, noticeboard@7,2, telescope@2,6, telescope@17,3, pillar@5,4, pillar@14,4 +4 | 3 | verified |
| `lf.stacks` st1 | Consent Stamp | 10,6 | belltower · hall | hall:belltower | shelf@4,4, shelf@8,4, shelf@12,4, shelf@16,4, stairs@2,2>up, doorway@2,1 | 2 | upgraded |
| `lf.stacks` st2 | Silence Blot | 18,9 | belltower · hall | hall:belltower | shelf@8,4, shelf@12,4, shelf@16,4, shelf@19,12, shelf@20,12, shelf@21,12, lf_conduit@22,6 +3 | 2 | verified |
| `lf.tower_upper` tu1 | Silence Blot | 14,5 | belltower · room | room:belltower | stairs@16,2>up, lf_wheel@2,5, lf_wheel@17,9, pillar@4,9, pillar@15,12, water@1-3, water@6-13 +1 | 25 | verified |
| `lf.tower_upper` tu2 | Hush Mote | 4,12 | belltower · room | room:belltower | stairs@16,2>up, lf_wheel@2,5, lf_wheel@17,9, pillar@4,9, pillar@15,12, water@1-3, water@6-13 +1 | 25 | verified |
| `lf.tower_mid` tm1 | Conduit Spirit | 14,6 | belltower · room | room:belltower | gears@6,2, gears@13,2, ladder@3,3>rope,hatch-open, lf_conduit@19,3, lf_conduit@19,4, lf_conduit@19,5, lf_conduit@18,5 +6 | 127 | upgraded |
| `lf.tower_mid` tm2 | Conduit Spirit | 7,8 | belltower · room | room:belltower | gears@6,2, gears@13,2, ladder@3,3>rope,hatch-open, lf_conduit@19,3, lf_conduit@19,4, lf_conduit@19,5, lf_conduit@18,5 +6 | 127 | verified |
| `lf.tower_low` tl1 | Bell Wraith | 4,8 | belltower · room | room:belltower | lf_lever@2,14, lf_lever@16,3, pillar@14,5, pillar@5,5, water@1-4, water@6-13, water@15-18 +1 | 23 | verified |
| `lf.tower_low` tl2 | Bell Wraith | 16,11 | belltower · room | room:belltower | lf_lever@2,14, lf_lever@16,3, pillar@14,5, pillar@5,5, water@1-4, water@6-13, water@15-18 +1 | 23 | verified |
| `sa.road` c1 | Paper Crane | 17,16 | still · land | cliffs:meadow | cliffs@7-27 | 4 | upgraded |
| `sa.road` c2 | Paper Crane | 20,10 | still · land | cliffs:snow | cliffs@10-29 | 4 | verified |
| `sa.gate` w1 | Hush Wraith | 9,17 | still · land | waterside+trees:stone | sa_statue@11,10, sa_statue@18,10, bldg@8,2, water@3-4 | 1 | verified |
| `sa.stacks` w1 | Hush Wraith | 10,6 | still · hall | hall:still | shelf@4,3, shelf@8,3, shelf@12,3, shelf@16,3, shelf@20,3, shelf@6,10, shelf@18,11 | 0 | upgraded |
| `sa.stacks` w2 | Hush Wraith | 22,15 | still · hall | hall:still | shelf@12,4, shelf@16,4, shelf@20,4, shelf@24,4, shelf@27,4, shelf@22,10, shelf@18,11 +5 | 3 | verified |
| `sa.stacks` m1 | Catalogue Moth | 26,5 | still · hall | hall:still | shelf@16,3, shelf@20,3, shelf@24,3, shelf@27,3, shelf@22,10 | 0 | verified |
| `sa.stacks` e1 | Shelved Echo | 6,15 | still · hall | hall:still | shelf@4,4, shelf@8,4, shelf@12,4, shelf@16,4, shelf@6,10, sa_gate@13,19, sa_gate@14,19 +2 | 3 | verified |
| `sa.conduits` g1 | Nameless Lantern | 11,9 | still · hall | hall:still | sa_pipe@7,2, sa_pipe@14,2, sa_pipe@21,2, desk@2,4, water@1-21, bridge@7-8, bridge@14-15 +1 | 1 | upgraded |
| `sa.conduits` g2 | Nameless Lantern | 16,18 | still · hall | hall:still | water@6-26, bridge@21-22, doorway@6,7 | 0 | verified |
| `sa.conduits` c1 | Paper Crane | 25,10 | still · hall | hall:still | sa_pipe@14,2, sa_pipe@21,2, water@15-28, bridge@15-15, bridge@21-22 | 0 | verified |
| `rw.mill1` boss | The Mill Echo | 6,6 | mill · room | room:mill | millstone@6,4, gears@10,2, ladder@2,2>hatch-open, stairs@12,9>down | 3 | upgraded |
| `sg.da_vault` boss | The Tide Clerk | 4,9 | archive · room | room:archive | counter@5,5, counter@12,5, water@1-3, water@16-18 | 0 | upgraded |
| `co.kiln_core` boss | The Kiln Warden | 7,8 | kiln · room | room:kiln | co_furnace@1,2, co_furnace@12,2 | 2 | upgraded |
| `sb.obs_dome` boss | The Lamp That Waited | 4,6 | observatory · room | room:observatory | sb_greatlamp@6,4, telescope@2,2, telescope@11,2, sb_starchart@10,8, hole@7,10 | 2 | upgraded |
| `lf.bellhall` boss | The Drowned Bell's Keeper | 1,5 | belltower · room | room:belltower | lf_bigbell@7,7, pillar@3,5, pillar@12,5, pillar@3,10, pillar@12,10, lf_conduit@1,7, lf_conduit@14,7 +3 | 2 | upgraded |
| `sa.heart` boss | The Hush | 11,11 | still · land | open:paper | pillar@5,8, pillar@19,8 | 0 | upgraded |
| Unwritten Atlas (generated rooms) | per run | per room | atlas · land or room | per pattern | the room's own props (waystones, lamps, shelves, pillars…) | per run | verified (one room reviewed: `tests/e2e/backdrops.mjs` atlas capture) |

The Atlas rooms are generated per run from a stored seed; their maps are
registered like any other, so they use the same composition. The unit test
composes every foe-bearing room of a seeded run (3 or more); the browser
test composes 8 rooms over two seeded runs, and every record rebuilds its
composition.

The Flour Moth settings (§3) are kept as they were decided: the moth on the
mill road fights out of doors by the mill's front and its wheel (placement
`f3`, `bg: 'reedwake'`, its own lines), the one inside fights in the mill
(placement `m1a`); the encounter's placement, not the species, chooses the
backdrop (`tests/e2e/backdrops.mjs` (a), `tests/e2e/encounters.mjs`).

## §2.9: the warehouse's missing floorboard

- **The narration:** `src/content/ch1/30_scenes_arrival.js`, line 176, scene `rw.nao_first`, Nao's first line: 「…… 入口から来たなら、足元気をつけて。三つ目の床板、抜けてるから。」 / "…If you came in the front, watch your step. The third floorboard is gone."
- **The same line is quoted verbatim** in `src/content/practice_b/30_compare.js`, line 182: comparison item **C07** ("Because, or after"), side `b` (`scene: 'rw.nao_first', line: 1`), with its reading and hash `h: '1ycxraj'`. Its questions are built on this line's two から (抜けてるから "because", 入口から "from"). Softening the narration means changing C07 with it (its text, reading and hash, and the Intermediate question that contrasts the two から).
- **The place:** `rw.warehouse`, `src/content/ch1/10_maps.js` lines 141–147 (11 × 9; the door at (5,8), the exit mat at (5,7)). No prop or tile there stands for a missing board; the floor is the interior's plain board tile. **No battle happens in the warehouse** (no placed foe, no scripted battle), so the backdrop system cannot show it. Capture: `docs/screenshots/battle/backdrops/warehouse-2_9.webp` (the room from its door: no gap is drawn).
- **Disposition: reported, not changed** (the fix belongs to the overworld art or the text, not to the backdrops). Two ways, for the integrator: (a) make it visible: a **non-blocking, non-interactive** floor detail (a dark gap where one board is missing) a few boards in from the door, e.g. beside the walking line at (4,5), drawn by the overworld prop art (pets/overworld worker's prop painters) and placed in `rw.warehouse`'s props without `block` or `scene`, so it adds no obstacle and no interaction; or (b) soften the line to less specific incidental narration, and update C07 in the same change. No obstacle or gameplay was invented.

## Commands and results

All runs on the built `index.html` (`node tools/build.mjs`), in fresh
browser contexts with synthetic campaigns (`RB.game.debugStart`), never a
player's save.

| Command | Result |
|---|---|
| `node tools/build.mjs` | built index.html — 275 source files |
| `node tests/run-unit.mjs battle_places` | 6722 passed, 0 failed |
| `node tests/run-unit.mjs` (full suite) | 14165 passed, 1 failed (run twice, same result). The failure is `recog-accuracy.test.mjs`: "p95 recognize() time < 60 ms", a wall-clock threshold on the handwriting recogniser, which this branch does not touch (no change under `src/recog`, `src/learn`, `src/lang`); it fails under the shared machine's load. Every other file passes, `battle_places` included. |
| `node tests/e2e/battle_backdrops.mjs --docs` | 38 passed, 0 failed (viewports, menu movement and reveal, state pairs, motion and reduced motion, records for 70 settings, no page errors); evidence written |
| `node tests/e2e/backdrops.mjs` | 61 passed, 0 failed (the Moth inside and out, a fixed room structure with varying accessories, outdoor locality, stability through turns, seed isolation of battle state, keep-outs, the Atlas, a phone, every placed foe and the scripted bosses) |
| `node tests/e2e/encounters.mjs` | all ok (19 checks) |
| `node tests/e2e/battle_group.mjs` | 6 passed, 0 failed |

What the tests establish (and what they do not):

- **Unit (`tests/unit/battle_places.test.mjs`, node, no canvas):** for every placed foe, the six scripted bosses and the rooms of a seeded Atlas run: the place composes; every structural and context piece traces to a prop, building or tile run of that map (doorways and side openings to gaps in the wall); no interior backdrop out of doors; the same seed makes the same choice and the seed never changes the structure; 2–7 clusters, each only where its condition holds; every accessory home and alternative is on a dry floor cell off every prop, or on wall; `recompose(origin)` gives the same record. Composing never calls `Math.random`. A small room's structure is the same from any tile; riverbank / inland / by the mill differ; gears jammed → mended with the hatch shut → open; the reed bed standing → cleared; the bridge's gap water → planks; the wheel still → turning; the dome hatch shut → open; signatures differ while the seeded choice does not; stair directions for seven stairs; the projection is unchanged by `F.S` and by a canvas three times larger, the encounter tile is under the creature, and moving the creature moves the place with it.
- **Browser (`tests/e2e/battle_backdrops.mjs`):** at 320 × 640, 390 × 844, 844 × 390, 1280 × 800 and 1920 × 1080 (dpr 1), three encounters (the mill's ground floor, the moth by the mill, the Saltglass shore): one origin record at every size, nothing decorative over an actor or the response lane, everything on its support, the back wall's landmarks in their west-to-east order, a wider canvas showing more columns. At 1280 × 800: the overlay rectangle changes nothing (same key and checksum for three different `F.S`); a canvas twice as large with the same actors repeats the layer pixel for pixel (0 pixels differ, room, land and hall); panels hidden and shown: no rebuild, same checksum. Four state pairs (gears, reeds, bridge, wheel): different state keys, signature, cache key and drawn layer. Motion: the mended gear train and the freed wheel change between frames, the jammed train never does, reduced motion rests both; hush is 0.5 while choosing. Records for 70 settings rebuild exactly. No page or console errors.
- **Not covered:** the integrator's full-viewport layout (§12) is not merged here, so the browser runs use today's decision-view stage; the "withdrawn panel" case is tested as hidden panels plus off-screen probes with a changed `F.S`, not with the new layout. Physical phones were not used (Chromium emulation at dpr 1 and 2). Build times were measured under heavy shared load.

## Evidence (`docs/screenshots/battle/backdrops/`)

Captured from the built game; "before" is the base build (982c8df, rebuilt),
"after" this branch. Party: the player and Mio (a **diagnostic fixture** in
Chapter 1 maps, where Mio has not yet been recruited); reduced motion for
stable stills.

| Files | What they show |
|---|---|
| `family-<setting>.webp` (24) | Per backdrop family indoors and out (reedwake ×2, mill ×2, saltglass ×2, archive ×3, cinder ×2, kiln ×2, snowbell, observatory ×3, lanternfall/belltower ×3, still ×4): before at 1280 × 800 \| after \| after with the panels hidden (the whole scene, as an action view would reveal it). |
| `phone-<setting>.webp` (8) | 390 × 844 (dpr 2) before \| after. The current decision-view stage is a narrow strip; the backdrop is composed for it the same way. |
| `state-mill-gears-diag.webp` | **Diagnostic** (no battle happens in the mill before the gears are mended): jammed (wedge, lashed prop, cocked shaft, sheared pegs, loft hatch barred) \| mended. Partly behind the moth: the gear train is truthfully behind the formation's right. |
| `state-millroad-reeds-diag.webp` | **Diagnostic tile** (7,18) on the road below the narrows: the reed bed across the animal track \| cleared (other real reeds of the bank are then the nearest). |
| `state-village-bridge-diag.webp` | **Diagnostic** (no foes in the village): the bridge with open water in its gap \| mended. |
| `state-millroad-wheel.webp` | Placement `f3`: the still wheel (calm race) \| freed (white water at the race). |
| `state-*-backdrop.webp` (4) | The same four pairs, the backdrop alone at its art resolution (static layer and machinery at rest; no actors, no overlay), so nothing hides the change. |
| `viewports-<setting>.webp` (3) | The same encounter at the five viewport sizes (panels hidden): one composition, more of it on larger canvases. |
| `warehouse-2_9.webp` | §2.9: the warehouse from its door. |
| `motion-mill-gears-and-wheel.webm` | Real-time recording (Playwright, 640 × 400): the mended gear train turning and dust in the window light, then the freed wheel turning by the mill. |

Scratch captures (with a JSON origin record beside each) are written to
`tests/e2e/out/battle_backdrops/` (`before/`, `after/`, `run/`).

## Limitations

- The integrator's full-viewport layout (§12) is not part of this branch. The backdrop is built to its contract (any canvas up to the viewport; the overlay ignored; a larger canvas reveals more), but it has only been seen with today's decision-view stage, which leaves little room on phones and few free spots for decoration in small rooms (one or two clusters in view at 1280 × 800 in the mill).
- The backdrop follows the actors. If a future layout moves the actors between the decision and action views, the backdrop moves with them (consistently, without a rebuild of the composition, but with a new layer).
- The view always looks north, as the world's camera does; a scripted battle that starts while the player faces south still shows what lies north of them. Orientation overrides are recorded (`facing`) but none is authored.
- World props keep their top-down three-quarter drawing inside the eye-level scene. Heights are simplified (one horizon; far rows on it). Sprites are not scaled with depth (the pixel grid stays whole); depth comes from placement, haze, shade and the widening ground.
- Halls (large interiors) have no side walls: the back wall spans the view and darkens beyond the local window.
- Group battles use each creature's box; their backdrops were not reviewed one by one (`tests/e2e/battle_group.mjs` passes).
- The impact hush is driven by the sequencer's beat counter (any placed result: hit, ward, heal). A caller can pass `F.hush` for finer control.
- The jammed gear train's evidence is partly hidden by the creature in the mill's composition; the hatch and the cocked shaft remain visible.
- §2.9 is reported, not fixed (see above).

## Merge notes

- **Owned files:** `src/ui/76_battle_places.js` and `src/ui/76_battle_placeart.js` were rewritten; `src/ui/79_battle_scene.js` is unchanged.
- **Callers unchanged:** `RB.battlePlaces.begin(e, opts)` (`80_combat.js` `placeEnemy`) and `RB.battlePlaces.draw(c, key, w, h, hz, t, still, F)` (`79_battle_scene.js`) keep their signatures. `last().frame` no longer has `stage` (the overlay rectangle is not used); it has `lane`, `feetP`, `feetC`, `cols`, `Wb`, `Hb`, `colPx`, `ax`. New: `origin`, `recompose`, `resources`, `probe`, `geometry`, `projector`.
- **For §12 (integrator):** keep passing `F = { ex, ey, ext, scale, ps, px, py, party, creatures, art }` from the stage's arrangement (as `80_combat.js` `draw` does today). `F.S` can be anything. Optionally pass `F.hush` (0–1) to quiet the scenery for your own beats. If the actors stay put when panels withdraw, the backdrop is pixel-stable.
- **Removed painters** from `RB.battlePlaceArt`: `wheel`, `bigGear` (replaced by `wheelHousing`/`wheelSpin` and `gearBoard`/`gearWheels`). Nothing outside this area used them.
- **New content file:** `src/content/zz_battle_views.js` adds an optional `battleView` field to five map definitions at load (`rw.mill1`, `rw.mill0`, `sb.obs_gallery`, `sb.obs_charts`, `lf.tower_mid`). It edits no existing file; no tile, prop, exit or trigger changes. Its notes are English documentation, never displayed.
- **Shared test files touched (this area's own tests):** `tests/unit/battle_places.test.mjs` (extended), `tests/e2e/backdrops.mjs` (assertions brought to the new geometry: no stage rectangle; clusters in view ≥ 1 per seed and ≥ 1.5 on average in the narrow decision view; the arena moving keeps the landmarks' order; a resize keeps the origin record).
- **Shared doc touched:** `docs/ART_DIRECTION.md`, one paragraph at the head of "Battle backdrops: the place of the encounter" pointing here (its geometry statements are superseded).
- **`index.html` is not committed** (generated): rebuild after merging.
- `HANDOFF.md`, `REQUIREMENTS.md` and `VALIDATION.md` were not edited.
