# Look-and-feel review — people, places and props across the whole game

For the owner's paired addendum of 2026-10-03 (World Idle Life, Character Mannerisms, and Animated
Dialogue Portraits) §3, §9, §10 and §12.5. Done **from the source** at `20277f1` (maps, NPC placements,
props and their art specs, ambience, the scene manifest and the character registrations), plus one cheap
capture of the dialogue portraits (`docs/screenshots/expressive/portraits_*.png`). No play session and no
map captures were run for this review (CPU budget), so anything about how a place *looks in motion* is an
inference from the code and is marked as such; battles were skipped, as the addendum allows while battle
presentation is revised elsewhere.

**Classes of finding** (paired §10.1): **[IP]** already addressed in current in-progress work · **[AD]** likely
addressed by another active addendum (the Harmony / Expressive Storytelling addendum) but not yet implemented ·
**[ACT]** still unresolved, worth actioning now · **[KEEP]** a strength to preserve.

## Summary for the owner (no plot details)

- **Assessed:** all 91 maps of Chapters 1–6 and Koharuno (towns, roads, interiors, dungeons; per-map table at
  the end), the 199 NPC placements and 71 recurring characters (GESTURES.md §7), the 1,504 placed props and the
  63 prop kinds whose art animates, the 1,292 scenes (SCENES.md) and the dialogue portraits (PORTRAITS.md).
  Chapters 2–6 were assessed as fully as Chapter 1.
- **The main gap is people, not places.** Every person in the world idles the same way (breathing, blinking, a
  random sideways glance); 33 of 199 placements wander, without pauses; nobody works at their station, reacts
  to weather or talks to a neighbour. Meanwhile the busiest places have lively props (the harbour has 36
  animated props and 2 wandering people). Animals already idle with more life than people do.
- **Strongest assets:** the prop and environment craft (water, lanterns, chimney smoke, snow, leaves, pages,
  embers, fireflies, dark interiors lit by the player's lamp, puzzle props that change state), the restored mill,
  the tide-window picture, the town animals, and the world's handling of who comes and goes.
- **Worth doing now:** the shared mannerism system with occupation idles for station NPCs (cheap, high value
  in shops, inns and workshops), route pauses, a few social pairs in crowded rooms, companion presence when you
  stop, and animated portraits with the eye-area fixes.
- **Counts:** 41 findings — 2 [IP], 5 [AD], 24 [ACT], 10 [KEEP] (tallied at the end).

## 1. Whole game

| # | Class | Finding | Evidence | Action |
|---|---|---|---|---|
| R1 | [ACT] | Every person idles identically: four breathing keys on a 2.6 s cycle, blinking, and a random body turn to one side for ≈1 s every 5–12 s, whoever they are | `60_render.js actorFrame()`, `50_world.js` line 624; no per-character idle data exists | the mannerism system and profiles (GESTURES.md §3–§7; WI1–WI6) |
| R2 | [ACT] | Wanderers step, stop and step again with no pause behaviour | 33 of 199 placements have `wander`; `50_world.js` update loop | route pauses from the profile (GESTURES.md §4) |
| R3 | [ACT] | Groups never interact: crowded rooms and squares are rows of still people | `sb.inn` 17 placements / 0 wander, `co.eve` 14 / 0, `co.festival` 14 / 2, `sg.harbor` 13 / 2, `rw.village` 13 / 2 | social ambient pairs (GESTURES.md §4) |
| R4 | [ACT] | Props outclass people where both are busiest | `sg.harbor` 36 animated props, 2 wanderers; `rw.village` 14 and 2; `sb.hamlet` 8 and 8 is the balanced case | occupation idles at the busy stations before adding prop motion |
| R5 | [ACT] | Dialogue portraits are still images, repainted once per line; eye areas hard to read (dark irises, small whites, glasses, light brows, non-integer scaling) | PORTRAITS.md §1, §3; captures | animated portraits with the eye fixes (WI9–WI12) |
| R6 | [AD] | Story emotion is carried by text: 10 `!move`, 5 `!emote` and 117 `!faceplayer` across 1,292 scenes (6,308 lines); no gestures exist | SCENES.md; `70_script.js` | the expressive actor system and staging (HX28–HX38) |
| R7 | [AD] | The key moments of each chapter are seen at tile scale only (one picture exists: the tide window) | SHOTS.md | the chapter sequences (HX41–HX45) |
| R8 | [ACT] | The travelling companion is a following token: when you stop it breathes like any NPC, never reacts to what you look at | `W.comp` follower; no presence behaviour | companion presence and shared stillness (GESTURES.md §4) |
| R9 | [ACT] | The player has no idle beyond breathing (no looking at what is in front, no satchel settle) | `drawActor` frames | player ambient set (GESTURES.md §4) |
| R10 | [KEEP] | Environment craft: 63 animated prop kinds (frames or sway: lanterns, water, reeds, trees, stoves, mill wheel and stones, gears, ink, crystals, campfires, the great lamp, the drowned bell…), animated water tiles, chimney smoke, weather (snow, leaves, pages, motes, embers, fireflies), dark interiors lit by the player's lamp | `27_propart.js`, `28_propwork.js`, chapter `*_art.js`, `29_structart.js smoke`, `21_tileart.js anim2`, `60_render.js` weather | preserve; balance against people rather than add more |
| R11 | [KEEP] | Town animals and the pets idle with personality (breath, tail, sit, curl up) | REQUIREMENTS TA1–TA5; `57_petworld.js life` | the bar people should reach |
| R12 | [KEEP] | People leave for where the story puts them and arrive on foot; the dialogue never moves the camera | HANDOFF "Sprite and battle polish"; `50_world.js wayFor`; `20_dialogue.js dock()` | preserve when staging scenes |
| R13 | [IP] | Area feel through sound (zone music, cutscene music cues) is being revised by another worker | lead's note; `src/audio/**`, 48 `!music` cues | not reassessed here |
| R14 | [IP] | Battle presentation (skipped here) is under separate revision | the battle addendum's rounds | — |
| R15 | [ACT] | Reduced motion keeps people still (correct) but must also cover every new idle, social and portrait motion | `RB.game.reducedMotion()`; WI15 | build into the scheduler |

## 2. Chapter by chapter

### Chapter 1 — Reedwake

| # | Class | Place | Finding |
|---|---|---|---|
| R16 | [ACT] | `rw.tea` Hana's Teahouse (14 scenes, 6 on the main road) | Hana stands still at the counter (2, 2) although the chapter's motif is her pouring two cups every morning; only the stove animates. Occupation idle: pouring, wiping, a look at the door. |
| R17 | [ACT] | `rw.hall` Lantern Hall (17 scenes) | the four candidates stand still side by side in the room where you choose one of them — their first impression is identical. Bespoke companion rests and habits here (GESTURES.md §6). Shrine, lanterns and the lamp rack animate [KEEP]. |
| R18 | [ACT] | `rw.apoth`, `rw.carpenter`, `rw.house1`, `rw.house2` | one person each, no animated props: Mio among her bottles, Bunta at the anvil, Oto with boots, Kiku at the thread — four cheap occupation idles. |
| R19 | [KEEP] | `rw.village`, `rw.millroad`, `rw.mill1–2` | lanterns, reeds, water, the mill wheel and stones, the echo and the motes; Mochi and the pets. |
| R20 | [AD] | `rw.bridge_scene` | the chapter's emotional close is staged at tile scale; Chapter 1 sequence (SHOTS.md §1). |

### Chapter 2 — Saltglass

| # | Class | Place | Finding |
|---|---|---|---|
| R21 | [ACT] | `sg.harbor` (89 scenes start here) | a working harbour whose workers are still: Daigo (cargo), Kiyo (salting), Tetsu (the tide board), Sōta (nets), Fuku (washing). Occupation idles and one social pair at the quay. The ferry, fog, sparkle and water are strong [KEEP]. |
| R22 | [ACT] | `sg.office` Harbour Office (13 scenes, 6 on the main road) | the room of the chapter's turning point has no animated prop and a still harbourmaster; Ōmi's writing idle at the desk (also her §14 baseline). Staging itself: [AD] (HX37). |
| R23 | [ACT] | `sg.inn` The Gull | Tamae's lines describe the lunch rush, but nobody moves; trays and calls as her occupation loop. |
| R24 | [ACT] | `sg.glass` Asahi's Glassworks | the kiln prop has no animated glow (the generic `kiln` art has no frames) and Asahi is still; compare Chapter 3's furnace, which animates. |
| R25 | [KEEP] | `sg.tide_wait` picture; `sg.lighthouse_top` | the tide window (an existing picture) and the top of the lighthouse with the vane's frames (the latter landed with the most recent merge, `20277f1`). |
| R26 | [KEEP] | the Drowned Archive maps | pages, ink, lanterns and sluice water; empty of people by design. |

### Chapter 3 — Cinder Orchard

| # | Class | Place | Finding |
|---|---|---|---|
| R27 | [KEEP] | `co.village` | the most mobile town (8 of 11 wander), leaves, glass lanterns, the kept seat; add route pauses only. |
| R28 | [ACT] | `co.eve` at dusk (14 people, 0 wander) | the square before the assembly is a still crowd; a murmuring social idle until the scene. The assembly itself: [AD] (Chapter 3 sequence). |
| R29 | [ACT] | `co.festival` (14 people, fireflies, lanterns) | a lantern-lit festival where people stand still; festive social pairs, children running between seats. |
| R30 | [ACT] | `co.glass`, `co.pottery` | Hiro "keeps working" in his story but idles still; Nobu's wheel does not turn. The furnace animates [KEEP]. |
| R31 | [KEEP] | `co.terraces`, `co.upper`, `co.oldworks`, `co.kiln`, `co.kiln_core` | leaves, motes, embers, darkness. |

### Chapter 4 — Snowbell

| # | Class | Place | Finding |
|---|---|---|---|
| R32 | [ACT] | `sb.inn` Yukimiya (17 placements, the snowed-in stretch) | the fullest room in the game is entirely still; people round the irori (warming hands, Yae counting the days, children fidgeting). |
| R33 | [ACT] | `sb.hamlet` (19 placements, snow) | nobody reacts to the snow or the cold; Fuki's bell post could mark the hours. The snow sculptures and children wandering [KEEP]. |
| R34 | [AD] | `sb.obs_dome` and the lamp | the chapter's moment; Chapter 4 sequence. The great lamp's frames [KEEP]. |

### Chapter 5 — Lanternfall

| # | Class | Place | Finding |
|---|---|---|---|
| R35 | [ACT] | `lf.town` (52 × 40, 6 placements, 3 animated props) | the largest town is the emptiest and stillest. Its early orderliness is thematic and may stay calm, but after the chapter's turning point the town is described as getting noisy and nothing visible changes — a post-turn idle set and social pairs. |
| R36 | [ACT] | `lf.gardens` | the fence quarrel is a ready-made social pair (two neighbours on either side of the persimmon) and plays still. |
| R37 | [ACT] | `lf.records`, `lf.clerks`, `lf.cafe`, `lf.bakery`, `lf.inn` | clerks and hosts at their stations (stamping, sorting, kneading, polishing cups) are still; the stoves animate. |
| R38 | [KEEP] | the tower and the bell chamber | gears, conduits, the sunken tower and the bell. |

### Chapter 6 — the Archive road and the Archive

| # | Class | Place | Finding |
|---|---|---|---|
| R39 | [ACT] | `sa.camp` (5 people, campfire, snow) | people around a campfire in the snow stand still: warming hands, the ledger, a look up the road. |
| R40 | [KEEP] | `sa.reading`, `sa.stacks`, `sa.conduits`, `sa.memories`, `sa.heart` | cabinets, doors, crystals, pages, the core; the Archive's clerks are rightly stiff (non-human). |
| R41 | [AD] | the walk back through the towns | the epilogue revisits are staged in the world (SHOTS.md §8.7): people's idles there should show what changed (some lines describe it, e.g. a clerk writing labels all day) — a profile state switch on story flags. |

### Koharuno and the Atlas

- `lq.koharu` and the persimmon tree: leaves, lantern [KEEP]; the hut is empty by design.
- The Unwritten Atlas rooms are generated; their decor props animate (`atlas_*`); routine rooms need no new
  life (first addendum §17.2) [KEEP — not counted separately].

## 3. Props: over- and under-animation

From the art specs (static scan: a `f:` frame function, `live:` per-frame extra or `sway:` crown in the
spec; some frame functions are states rather than time — not distinguished here):

- **Under-animated relative to the person who works there:** the generic `kiln` (Saltglass glassworks), the
  potter's wheel (`co_wheel`), counters, desks and shelves (by design static; the person should do the work).
- **Possibly busy (to check by eye, not verified):** water sparkle at `co.lookout` (8 sparkle props) and on the
  harbour; the 138 props of `lf.tower_mid`. No prop was judged to over-animate from the source alone.
- **Quest props that change state read well:** field-puzzle props (`fw_*`), the bell post, the ferry and fog,
  the restored mill wheel [KEEP].

## 4. Tally

| Class | Findings | Count |
|---|---|---:|
| [IP] already addressed in current in-progress work | R13 (sound and music), R14 (battle presentation) | 2 |
| [AD] likely addressed by the Harmony / Expressive Storytelling addendum, not yet implemented | R6, R7, R20, R34, R41 | 5 |
| [ACT] unresolved, worth actioning now | R1–R5, R8, R9, R15, R16–R18, R21–R24, R28–R30, R32, R33, R35–R37, R39 | 24 |
| [KEEP] strengths to preserve | R10–R12, R19, R25–R27, R31, R38, R40 | 10 |
| **All** | | **41** |

## 5. What was assessed — every map

Generated from the content at `20277f1`: size, interior/exterior (by region and size; heuristic), NPC
placements (wanderers), props (animated by the static art-spec scan, and chimneys), ambience, and how many
scenes start on the map (of which on the main road, personal quests, long questlines or endings).

#### Chapter 1

| map | name | size | kind | people (wander) | props (animated: kinds) | ambience | scenes started here (story) |
|---|---|---|---|---:|---|---|---:|
| `rw.village` | Reedwake | 50×36 | exterior | 13 (2) | 40 (14: lantern, water, fw_slipscreen, fw_clamppost, reeds) + 3 chimney | — | 63 (14) |
| `rw.hall` | Lantern Hall | 11×10 | interior | 5 (0) | 11 (4: shrine, lantern, pa_lamprack) | dark 0.35 | 17 (7) |
| `rw.tea` | Hana's Teahouse | 9×9 | interior | 3 (0) | 12 (1: stove) | — | 14 (6) |
| `rw.apoth` | Mio's Apothecary | 9×9 | interior | 1 (0) | 10 (0) | — | 6 (1) |
| `rw.warehouse` | River Warehouse | 11×9 | interior | 1 (0) | 11 (0) | — | 4 (1) |
| `rw.carpenter` | Bunta's Workshop | 9×8 | interior | 1 (0) | 5 (0) | — | 6 (0) |
| `rw.house1` | Oto's House | 8×8 | interior | 1 (0) | 5 (0) | — | 6 (0) |
| `rw.house2` | Kiku's House | 9×8 | interior | 1 (0) | 5 (0) | — | 6 (0) |
| `rw.ferry` | Kōji's Ferry House | 8×8 | interior | 0 (0) | 5 (0) | — | 2 (1) |
| `rw.road` | The Lantern Road | 32×18 | exterior | 0 (0) | 7 (4: lantern) | — | 6 (0) |
| `rw.millroad` | The Mill Road | 26×26 | exterior | 5 (0) | 15 (10: millwheel, lantern, reeds, echo) | motes | 17 (2) |
| `rw.mill1` | The Old Mill | 15×12 | interior | 0 (0) | 11 (3: millstone, gears) | motes, dark 0.45 | 6 (3) |
| `rw.mill2` | The Mill Loft | 13×9 | interior | 0 (0) | 9 (4: lantern, echo) | motes, dark 0.5 | 5 (1) |
| `rw.mill0` | The Wheel Pit | 16×10 | interior | 0 (0) | 5 (0) | dark 0.55 | 1 (0) |

#### Chapter 2

| map | name | size | kind | people (wander) | props (animated: kinds) | ambience | scenes started here (story) |
|---|---|---|---|---:|---|---|---:|
| `sg.road` | The Coast Road | 40×22 | exterior | 0 (0) | 8 (4: lantern) | — | 7 (1) |
| `sg.harbor` | Saltglass | 56×42 | exterior | 13 (2) | 88 (36: lantern, lamppost, sg_ferry, sparkle, water, sg_fog, fw_pulleypost, fw_winch, fw_floattank, cs_bellpost) + 3 chimney | — | 89 (11) |
| `sg.office` | Harbour Office | 11×9 | interior | 2 (0) | 8 (0) | — | 13 (6) |
| `sg.inn` | The Gull | 13×10 | interior | 3 (0) | 15 (1: stove) | — | 15 (5) |
| `sg.warehouse` | No. 2 Warehouse | 13×10 | interior | 1 (0) | 14 (0) | — | 10 (3) |
| `sg.glass` | Asahi's Glassworks | 10×9 | interior | 1 (0) | 8 (0) | — | 12 (1) |
| `sg.lighthouse` | Lighthouse | 9×10 | interior | 2 (0) | 8 (1: sg_lens) | — | 16 (2) |
| `sg.lighthouse_top` | Top of the Lighthouse | 11×8 | interior | 1 (0) | 46 (2: sg_vane) | sea calm | 6 (1) |
| `sg.tidehut` | Tide-Watch Hut | 9×8 | interior | 1 (0) | 6 (0) | — | 10 (4) |
| `sg.isamu` | Isamu's House | 8×8 | interior | 0 (0) | 6 (0) | — | 4 (0) |
| `sg.cove` | The Fishers' Cove | 30×20 | exterior | 0 (0) | 7 (2: sparkle) | — | 7 (0) |
| `sg.da_entry` | Drowned Archive — Receiving Hall | 24×18 | exterior | 0 (0) | 9 (4: lantern, ink) | pages, dark 0.42 | 7 (1) |
| `sg.da_stacks` | Drowned Archive — The Stacks | 30×22 | exterior | 0 (0) | 11 (4: lantern, ink) | pages, dark 0.42 | 6 (0) |
| `sg.da_reading` | Drowned Archive — Reading Room | 18×14 | exterior | 0 (0) | 9 (2: lantern) | motes, dark 0.3 | 5 (0) |
| `sg.da_sluice` | Drowned Archive — Sluice Channels | 28×20 | exterior | 0 (0) | 17 (12: sg_raft, lantern, water) | pages, dark 0.42 | 4 (0) |
| `sg.da_vault` | Drowned Archive — Returns Counter | 20×16 | exterior | 1 (0) | 9 (3: lantern, sparkle) | pages, dark 0.38 | 2 (0) |

#### Chapter 3

| map | name | size | kind | people (wander) | props (animated: kinds) | ambience | scenes started here (story) |
|---|---|---|---|---:|---|---|---:|
| `co.road` | The Orchard Road | 36×20 | exterior | 0 (0) | 18 (3: lantern) | leaves | 8 (1) |
| `co.village` | Cinder Orchard | 52×40 | exterior | 11 (8) | 58 (12: co_lookout, co_glasslantern, co_seat, lantern, bush) + 4 chimney | leaves | 36 (5) |
| `co.eve` | Cinder Orchard at dusk | 52×40 | exterior | 14 (0) | 49 (8: co_lookout, lantern, co_seat) + 4 chimney | leaves, dark 0.25 | 7 (0) |
| `co.festival` | The Autumn Festival | 52×40 | exterior | 14 (2) | 57 (16: lantern, co_lookout, co_seat, co_glasslantern) + 4 chimney | fireflies, dark 0.55 | 23 (0) |
| `co.hall` | Chronicle Hall | 13×10 | interior | 1 (0) | 12 (2: lantern) | dark 0.2 | 7 (1) |
| `co.inn` | Fusa's Inn | 13×10 | interior | 3 (0) | 14 (1: stove) | — | 10 (3) |
| `co.glass` | Glass Workshop | 13×10 | interior | 3 (0) | 13 (2: co_furnace, fw_tray) | dark 0.15 | 13 (1) |
| `co.pottery` | Nobu's Pottery | 11×9 | interior | 1 (0) | 8 (0) | — | 6 (0) |
| `co.post` | Shino's Post House | 9×8 | interior | 2 (0) | 6 (0) | — | 7 (0) |
| `co.terraces` | The Terraces | 44×34 | exterior | 4 (3) | 32 (0) + 1 chimney | leaves | 16 (2) |
| `co.ume` | Ume's House | 9×8 | interior | 0 (0) | 6 (1: stove) | — | 1 (0) |
| `co.upper` | The Upper Terraces | 40×30 | exterior | 0 (0) | 18 (1: lantern) | motes | 5 (0) |
| `co.oldworks` | The Old Workshop Row | 40×26 | exterior | 0 (0) | 14 (2: co_seal, lantern) | motes, dark 0.12 | 7 (0) |
| `co.icehouse` | The Ice House | 11×10 | interior | 0 (0) | 9 (0) | dark 0.35 | 3 (0) |
| `co.kiln` | The Great Kiln | 30×24 | exterior | 0 (0) | 16 (0) | embers, dark 0.45 | 7 (0) |
| `co.kiln_core` | The Kiln's Heart | 15×12 | interior | 0 (0) | 5 (3: co_glasslantern, co_furnace) | embers, dark 0.4 | 3 (1) |
| `co.lookout` | The Lookout | 16×12 | interior | 0 (0) | 19 (8: sparkle) | fireflies, dark 0.5 | 2 (0) |

#### Chapter 4

| map | name | size | kind | people (wander) | props (animated: kinds) | ambience | scenes started here (story) |
|---|---|---|---|---:|---|---|---:|
| `sb.road` | The Snowbell Road | 36×22 | exterior | 2 (0) | 15 (5: lantern, shrine, campfire) | snow | 14 (7) |
| `sb.hamlet` | Snowbell | 46×36 | exterior | 19 (8) | 34 (8: lantern, sb_icewall, fw_warmbox) + 5 chimney | snow | 44 (4) |
| `sb.inn` | Yukimiya Inn | 17×12 | interior | 17 (0) | 16 (3: sb_irori, lantern) | dark 0.12 | 28 (3) |
| `sb.inn_room` | Upstairs at Yukimiya | 9×8 | interior | 0 (0) | 5 (1: lantern) | dark 0.15 | 4 (0) |
| `sb.post` | The Post Shelter | 10×8 | interior | 1 (0) | 9 (1: stove) | — | 6 (1) |
| `sb.hoshino` | Hoshino's House | 11×9 | interior | 1 (0) | 11 (1: stove) | dark 0.15 | 8 (1) |
| `sb.goatshed` | Tetsuji's Goat Shed | 12×9 | interior | 5 (2) | 8 (0) | dark 0.2 | 4 (0) |
| `sb.sachi` | Sachi and Kanta's House | 9×8 | interior | 1 (0) | 6 (1: stove) | — | 3 (0) |
| `sb.fuki` | Fuki's House | 8×7 | interior | 1 (0) | 5 (1: stove) | dark 0.15 | 3 (0) |
| `sb.obs_path` | The Star Stair | 28×40 | exterior | 0 (0) | 20 (6: sb_observatory, lantern, shrine, deadtree) | snow, dark 0.1 | 15 (0) |
| `sb.obs_hall` | Observatory — Ground Floor | 20×16 | exterior | 0 (0) | 18 (1: sb_icewall) | dark 0.35 | 7 (1) |
| `sb.obs_charts` | The Chart Room | 16×12 | interior | 0 (0) | 17 (4: stove, sb_icewall) | dark 0.4 | 6 (0) |
| `sb.obs_gallery` | The Upper Gallery | 20×14 | exterior | 0 (0) | 14 (0) | dark 0.4 | 7 (1) |
| `sb.obs_dome` | The Lamp Room | 14×12 | interior | 1 (0) | 8 (2: sb_greatlamp) | dark 0.5 | 6 (0) |

#### Chapter 5

| map | name | size | kind | people (wander) | props (animated: kinds) | ambience | scenes started here (story) |
|---|---|---|---|---:|---|---|---:|
| `lf.road` | The Lantern Road above Lanternfall | 36×22 | exterior | 0 (0) | 8 (4: lantern) | leaves | 6 (1) |
| `lf.town` | Lanternfall | 52×40 | exterior | 6 (3) | 24 (3: lf_grate) + 2 chimney | — | 25 (3) |
| `lf.gardens` | The Garden Quarter | 34×24 | exterior | 5 (1) | 21 (4: orchard, shrine, fw_alcove, fw_display) + 1 chimney | leaves | 26 (2) |
| `lf.sluice` | The Sluice Shore | 34×28 | exterior | 1 (0) | 17 (1: lf_sunktower) + 1 chimney | — | 13 (1) |
| `lf.records` | Public Records Hall | 17×12 | interior | 2 (0) | 11 (2: lantern) | dark 0.12 | 12 (3) |
| `lf.council` | Council Chamber | 15×10 | interior | 1 (0) | 11 (2: lantern) | dark 0.15 | 7 (2) |
| `lf.clerks` | Clerks' Office | 13×9 | interior | 1 (0) | 11 (0) | — | 10 (1) |
| `lf.inn` | The Lamplit Inn | 13×10 | interior | 2 (0) | 13 (1: stove) | — | 8 (0) |
| `lf.cafe` | Ritsu's Café | 11×9 | interior | 1 (0) | 11 (1: stove) | — | 5 (0) |
| `lf.bakery` | Masaru's Bakery | 9×8 | interior | 1 (0) | 8 (2: stove) | — | 4 (0) |
| `lf.ferry` | Ferry Office | 11×9 | interior | 1 (0) | 8 (0) | — | 7 (2) |
| `lf.tokuji` | Tokuji's Hut | 8×8 | interior | 0 (0) | 6 (0) | — | 2 (0) |
| `lf.stacks` | Basement Stacks | 24×16 | exterior | 0 (0) | 13 (4: lantern, lf_conduit) | pages, dark 0.55 | 5 (0) |
| `lf.tower_top` | Belfry Loft | 16×12 | interior | 0 (0) | 9 (1: lantern) | dark 0.45 | 4 (1) |
| `lf.tower_upper` | Upper Floor | 20×16 | exterior | 0 (0) | 31 (21: lf_flood) | dark 0.5 | 4 (0) |
| `lf.tower_mid` | Gate Works | 22×18 | exterior | 0 (0) | 138 (130: gears, lf_conduit, echo, lf_flood) | dark 0.5 | 8 (0) |
| `lf.tower_low` | Drowned Stair | 20×18 | exterior | 0 (0) | 27 (19: lf_flood) | dark 0.58 | 5 (0) |
| `lf.bellhall` | Bell Chamber | 16×14 | exterior | 0 (0) | 10 (4: lf_bigbell, lf_conduit) | dark 0.5 | 8 (2) |

#### Chapter 6

| map | name | size | kind | people (wander) | props (animated: kinds) | ambience | scenes started here (story) |
|---|---|---|---|---:|---|---|---:|
| `sa.road` | The Archive Road | 36×26 | exterior | 0 (0) | 11 (4: lantern) | pages | 13 (2) |
| `sa.camp` | Last Lamp Hut | 28×20 | exterior | 5 (0) | 10 (2: lantern, campfire) + 1 chimney | snow | 15 (4) |
| `sa.hut` | Last Lamp Hut | 11×9 | interior | 1 (0) | 11 (1: stove) | dark 0.2 | 10 (1) |
| `sa.gate` | The Archive Gate | 30×22 | exterior | 4 (1) | 12 (8: sa_statue, sa_grave, lantern, deadtree, bush, sa_pipe) | pages | 9 (2) |
| `sa.reading` | The Reading Room | 28×20 | exterior | 6 (1) | 38 (12: sa_cabinet, lantern, sa_gate, sa_door) | pages, dark 0.15 | 17 (3) |
| `sa.stacks` | The Stacks | 32×24 | exterior | 0 (0) | 18 (9: sa_gate, crystal, ink) | pages, dark 0.3 | 8 (1) |
| `sa.conduits` | The Quiet Conduits | 30×22 | exterior | 0 (0) | 15 (10: sa_pipe, sparkle, water, lantern) | dark 0.45 | 4 (1) |
| `sa.memories` | The Room of Set-Down Memories | 24×18 | exterior | 2 (0) | 19 (4: crystal, sa_cabinet) | motes, dark 0.2 | 18 (3) |
| `sa.study` | The Keeper's Study | 15×12 | interior | 0 (0) | 11 (2: sa_lamp, sa_door) | dark 0.35 | 8 (1) |
| `sa.heart` | The Heart of the Hush | 25×20 | exterior | 2 (0) | 6 (2: sa_hushcore) | pages, dark 0.4 | 6 (0) |

#### Koharuno (long questline)

| map | name | size | kind | people (wander) | props (animated: kinds) | ambience | scenes started here (story) |
|---|---|---|---|---:|---|---|---:|
| `lq.koharu` | Koharuno | 36×24 | exterior | 1 (0) | 9 (2: lantern, deadtree) | leaves | 14 (4) |
| `lq.koharu_hut` | The Tree-Keeper's Hut | 9×8 | interior | 0 (0) | 7 (0) | dark 0.25 | 2 (0) |
