# Before / after screenshots

Real captures of the built game, made with synthetic test fixtures (no player
saves) by `tests/e2e/visual.mjs` in headless Chromium, converted to half-scale
WebP by `tests/e2e/shots_to_docs.mjs`.

- **Before:** the pre-overhaul build `2b79f3b` (the Shift/Load hotfix build).
- **After:** the overhaul build `3cce661` (branch `claude/stoic-sagan-n3jvgk`).
- Phone = 390×844 CSS px (touch emulation), desktop = 1280×800. Both captured at
  device pixel ratio 2, then halved.

Some states are not strictly the same screen: the old creation form was one
long page (now four steps), and the old menu tabs were Journal/Notebook/Items.
World scenes use the same map and start tile; the view is wider in "before"
because the old renderer showed about 26 tiles across on desktop (now about 20,
with twice the art detail per tile).

| State | Phone before | Phone after | Desktop before | Desktop after |
|---|---|---|---|---|
| Title screen | [before](before/title_390x844.webp) | [after](after/title_390x844.webp) | [before](before/title_1280x800.webp) | [after](after/title_1280x800.webp) |
| Six-slot ledger (load) | [before](before/slots_390x844.webp) | [after](after/slots_390x844.webp) | [before](before/slots_1280x800.webp) | [after](after/slots_1280x800.webp) |
| Character creation — before: whole form; after: step 1 Identity | [before](before/create_390x844.webp) | [after](after/create_390x844.webp) | [before](before/create_1280x800.webp) | [after](after/create_1280x800.webp) |
| Character creation — after: step 2 Appearance | [before](before/create2_390x844.webp) | [after](after/create2_390x844.webp) | [before](before/create2_1280x800.webp) | [after](after/create2_1280x800.webp) |
| Pause menu → Journey (before: Journal tab) | [before](before/journey_390x844.webp) | [after](after/journey_390x844.webp) | [before](before/journey_1280x800.webp) | [after](after/journey_1280x800.webp) |
| Words (before: Notebook tab) | [before](before/words_390x844.webp) | [after](after/words_390x844.webp) | [before](before/words_1280x800.webp) | [after](after/words_1280x800.webp) |
| Satchel (before: Items tab) | [before](before/satchel_390x844.webp) | [after](after/satchel_390x844.webp) | [before](before/satchel_1280x800.webp) | [after](after/satchel_1280x800.webp) |
| Map | [before](before/map_390x844.webp) | [after](after/map_390x844.webp) | [before](before/map_1280x800.webp) | [after](after/map_1280x800.webp) |
| Settings | [before](before/settings_390x844.webp) | [after](after/settings_390x844.webp) | [before](before/settings_1280x800.webp) | [after](after/settings_1280x800.webp) |
| Bilingual dialogue (long line, furigana) | [before](before/dialogue_390x844.webp) | [after](after/dialogue_390x844.webp) | [before](before/dialogue_1280x800.webp) | [after](after/dialogue_1280x800.webp) |
| Word help on a tapped/clicked word | [before](before/help_390x844.webp) | [after](after/help_390x844.webp) | [before](before/help_1280x800.webp) | [after](after/help_1280x800.webp) |
| Handwriting challenge | [before](before/chal_390x844.webp) | [after](after/chal_390x844.webp) | [before](before/chal_1280x800.webp) | [after](after/chal_1280x800.webp) |
| Combat | [before](before/combat_390x844.webp) | [after](after/combat_390x844.webp) | [before](before/combat_1280x800.webp) | [after](after/combat_1280x800.webp) |
| World — Reedwake | [before](before/world_rw_390x844.webp) | [after](after/world_rw_390x844.webp) | [before](before/world_rw_1280x800.webp) | [after](after/world_rw_1280x800.webp) |
| World — Saltglass | [before](before/world_sg_390x844.webp) | [after](after/world_sg_390x844.webp) | [before](before/world_sg_1280x800.webp) | [after](after/world_sg_1280x800.webp) |
| World — Cinder Orchard | [before](before/world_co_390x844.webp) | [after](after/world_co_390x844.webp) | [before](before/world_co_1280x800.webp) | [after](after/world_co_1280x800.webp) |
| World — Snowbell | [before](before/world_sb_390x844.webp) | [after](after/world_sb_390x844.webp) | [before](before/world_sb_1280x800.webp) | [after](after/world_sb_1280x800.webp) |
| World — Lanternfall | [before](before/world_lf_390x844.webp) | [after](after/world_lf_390x844.webp) | [before](before/world_lf_1280x800.webp) | [after](after/world_lf_1280x800.webp) |
| World — the Still Archive camp | [before](before/world_sa_390x844.webp) | [after](after/world_sa_390x844.webp) | [before](before/world_sa_1280x800.webp) | [after](after/world_sa_1280x800.webp) |

## After only

| Screen | Image |
|---|---|
| Ledger states: newer autosave, Manage area with recovery/copy/delete | [image](after/extra/slots_states_390x844.webp) |
| Handwriting: "I could not read that clearly" (not a wrong answer) | [image](after/extra/chal_unsure_390x844.webp) |
| Title with session-only storage (warning stays prominent) | [image](after/extra/title_session_390x844.webp) |
| Title at 200 % text | [image](after/extra/title_big_390x844.webp) |
| Dialogue, landscape phone | [image](after/extra/dialogue_844x390.webp) |
| Combat, landscape phone | [image](after/extra/combat_844x390.webp) |
| Handwriting, landscape phone | [image](after/extra/chal_844x390.webp) |
| Journey spread on a tablet | [image](after/extra/journey_768x1024.webp) |
| Settings index/detail on a tablet | [image](after/extra/settings_768x1024.webp) |
| Kana lesson sheet (cloth cover, readable title and furigana) | [image](after/extra/lesson_390x844.webp) |
| Teahouse activity sheet, desktop | [image](after/extra/activity_1280x800.webp) |
| Journey at 320 px with Japanese interface labels (all four tabs, no scroll arrows) | [image](after/extra/journey_ja_320x640.webp) |

## The character standard (2026-09-28)

Real renders of the built game by `tests/e2e/characters.mjs` (PNG, pixel
for pixel at 2–3 CSS px per art px, so every art pixel can be inspected).
See `docs/ART_DIRECTION.md` §10.

| What | Image |
|---|---|
| Road sprites at 40×58: every hairstyle, clothing colour and cut, skin tone, hair colour, accessory and keepsake, the companions — front, left, right, back | [image](after/characters/road_options.png) |
| The player look and the four companions: eight-phase walk and idle breathing, four directions | [image](after/characters/road_walk_cycle.png) |
| In the world: the player standing in front of Mio, by a house door (depth sorting, scale against the door) | [image](after/characters/world_cast.png) |
| Battle figure, the player: stance, calm, hit, brace, down, cheer, and anticipate → act → recover for all seven gestures | [image](after/characters/battle_poses_pc.png) |
| Battle figure, Nao (companion) | [image](after/characters/battle_poses_nao.png) |
| Battle figure, Ren (companion; lantern kept in the left hand) | [image](after/characters/battle_poses_ren.png) |
| Ready idle as a frame sequence: the player (5.2-s loop) and two companions (6.0-s loop) — different timing and gestures, feet planted on the line | [image](after/characters/battle_idle_sequence.png) |
| Battle figures for every creation option, keepsake and a sample of NPCs | [image](after/characters/battle_all_looks.png) |
| Composition preview drawn by the test (not the battle screen, which still uses the old sprite until the combat code is wired to `RB.battlers`): backdrop, creature and the two figures at scale 1, shown at 2× | [image](after/characters/battle_scene_preview.png) |

## Map edges and the dialogue (player report, 2026-09-27)

Before = the build before the fix (c6850ad); after = b1185f9. Mill Road (the
map after the first battle) at 1600×870 and 1600×397 CSS px with 125 %
scaling, a phone at 390×844, the village, and a room on a phone.

| Case | Before | After |
|---|---|---|
| Mill Road, no dialogue | [before](before/edges/mr_desk_a.webp) | [after](after/edges/mr_desk_a.webp) |
| Mill Road, dialogue open (before: map pushed up over an empty band; after: map still, sheet docked at the top) | [before](before/edges/mr_desk_b.webp) | [after](after/edges/mr_desk_b.webp) |
| Short wide window, no dialogue (before: dark band past the edges; after: woods and river continue) | [before](before/edges/mr_short_a.webp) | [after](after/edges/mr_short_a.webp) |
| Short wide window, dialogue open (after: the map stays still; the sheet is taller than half this window, so either position overlaps the player and it stays at the bottom) | [before](before/edges/mr_short_b.webp) | [after](after/edges/mr_short_b.webp) |
| Phone, dialogue open near the bottom of the map | [before](before/edges/mr_phone_b.webp) | [after](after/edges/mr_phone_b.webp) |
| Village, dialogue open mid-map (unchanged: sheet stays at the bottom) | [before](before/edges/vil_desk_b.webp) | [after](after/edges/vil_desk_b.webp) |
| Room on a phone, dialogue open (room no longer jumps; surround kept) | [before](before/edges/hall_phone_b.webp) | [after](after/edges/hall_phone_b.webp) |

## Battle backdrops: the place of the encounter (2026-09-28)

Captures of the built game by `node tests/e2e/backdrops.mjs --docs` (the
test's own evidence; full records with the chosen context in
`tests/e2e/out/backdrops/*.json`). Desktop 1280×800 at device pixel ratio 1
(2 device px per art px, halved to one pixel per art px); phone 390×844 at
ratio 2, halved. Reduced motion is on, so no ambient particles. File names
carry what was chosen: `<case>__<map>__<x>_<y>__seed<N>__<zone>`.

| Case | Place (map, tile) | Seed | Image |
|---|---|---|---|
| Flour Moth out on the mill road: the mill's front and wheel, the race beyond | rw.millroad 11,7 | 7 | [image](backdrops/a-moth-outside__rw.millroad__11_7__seed7__water-beyond-by-building-mill-trees-meadow.webp) |
| Flour Moth in the mill: timber wall, ladder, gear train, millstone, stairs down | rw.mill1 3,4 | 7 | [image](backdrops/a-moth-inside__rw.mill1__3_4__seed7__room-mill.webp) |
| Reading room (no ladder or stairs on its map, none drawn) | sg.da_reading 14,9 | 7 | [image](backdrops/a-reading-room__sg.da_reading__14_9__seed7__room-archive.webp) |
| The mill, same structure, other accessories | rw.mill1 3,4 | 1 | [image](backdrops/b-mill-seed__rw.mill1__3_4__seed1__room-mill.webp) |
| … | rw.mill1 3,4 | 2 | [image](backdrops/b-mill-seed__rw.mill1__3_4__seed2__room-mill.webp) |
| … | rw.mill1 3,4 | 3 | [image](backdrops/b-mill-seed__rw.mill1__3_4__seed3__room-mill.webp) |
| Mill road by the river (water and reeds on the right, the mill far left) | rw.millroad 17,12 | 5 | [image](backdrops/c-millroad-1__rw.millroad__17_12__seed5__waterside-mill-trees-meadow.webp) |
| Mill road inland (the narrows' cliffs, bushes, the hut; no water) | rw.millroad 6,21 | 5 | [image](backdrops/c-millroad-2__rw.millroad__6_21__seed5__trees-cliffs-meadow.webp) |
| Village by the river (bank, pier, reeds) | rw.village 30,20 | 5 | [image](backdrops/c-village-1__rw.village__30_20__seed5__waterside-meadow.webp) |
| Village inland (houses, trees) | rw.village 12,14 | 5 | [image](backdrops/c-village-2__rw.village__12_14__seed5__by-building-trees-meadow.webp) |
| Saltglass cove shore (sand, shallows, cliffs, the wreck) | sg.cove 22,12 | 5 | [image](backdrops/c-Saltglass-1__sg.cove__22_12__seed5__waterside-cliffs-shore-sand.webp) |
| Saltglass road inland (grass, trees, a lantern) | sg.road 30,8 | 5 | [image](backdrops/c-Saltglass-2__sg.road__30_8__seed5__trees-meadow.webp) |
| After a resize (same composition, reframed) | rw.mill1 5,6 | 9 | [image](backdrops/d-after-resize__rw.mill1__5_6__seed9__room-mill.webp) |
| The Tide Clerk (Drowned Archive vault) | sg.da_vault 4,9 | 1 | [image](backdrops/boss-sg.tideclerk__sg.da_vault__4_9__seed1__room-archive.webp) |
| The Kiln Warden (kiln core: furnaces glowing) | co.kiln_core 7,8 | 1 | [image](backdrops/boss-co.warden__co.kiln_core__7_8__seed1__room-kiln.webp) |
| The Lamp That Waited (observatory dome) | sb.obs_dome 4,6 | 1 | [image](backdrops/boss-sb.boss__sb.obs_dome__4_6__seed1__room-observatory.webp) |
| The Drowned Bell's Keeper (bell hall) | lf.bellhall 1,5 | 1 | [image](backdrops/boss-lf.keeper__lf.bellhall__1_5__seed1__room-belltower.webp) |
| The Hush (the Still Archive's heart) | sa.heart 11,11 | 1 | [image](backdrops/boss-sa.hush__sa.heart__11_11__seed1__open-paper.webp) |
| An Unwritten Atlas room (parchment sky and grid, map-symbol hills, the room's own props) | atlas.7.p1 6,6 | 3 | [image](backdrops/atlas__atlas.7.p1__6_6__seed3__open-meadow.webp) |
| Phone: the mill | rw.mill1 3,4 | 3 | [image](backdrops/phone-m1a__rw.mill1__3_4__seed3__room-mill.webp) |
| Phone: the mill road by the mill | rw.millroad 11,7 | 3 | [image](backdrops/phone-f3__rw.millroad__11_7__seed3__water-beyond-by-building-mill-trees-meadow.webp) |
| Phone: the cove | sg.cove 22,12 | 3 | [image](backdrops/phone-c2__sg.cove__22_12__seed3__waterside-cliffs-shore-sand.webp) |

## Every kanji on the pad, and the chart (2026-09-29)

Captures made by `tests/e2e/kanji_chart.mjs` and `tests/e2e/pad_kanji.mjs`
(headless Chromium; desktop at full size, phone captures halved), in
`after/kanji_chart/`.

| State | Image |
|---|---|
| Elementary pad: 守 drawn with pointer strokes, read as 守 (まも) with alternatives | [image](after/kanji_chart/pad_mamoru_1280x800.webp) |
| In a battle: the chart's search from the pad ("protect") | [image](after/kanji_chart/battle_search_1280x800.webp) |
| In a battle: 守 + る written by hand for the protect response | [image](after/kanji_chart/battle_mamoru_1280x800.webp) |
| Chart page Verbs · 1 of 5: kanji met first, the rest dimmed | [image](after/kanji_chart/pages_verbs_1280x800.webp) |
| Entry for 守: readings, words with furigana, stroke order | [image](after/kanji_chart/entry_mamoru_1280x800.webp) |
| Practice: 守 read as 守, stroke order right | [image](after/kanji_chart/practice_mamoru_1280x800.webp) |
| Foundations, Words › Kanji chart, practising 守 (390×844) | [image](after/kanji_chart/foundations_practice_390x844.webp) |
| 320×640, 200 % text: list, search, entry, practice | [list](after/kanji_chart/list_320x640_text200.webp) · [search](after/kanji_chart/search_320x640_text200.webp) · [entry](after/kanji_chart/entry_320x640_text200.webp) · [practice](after/kanji_chart/practice_320x640_text200.webp) |
| A kanji outside the game (弦) with kanji reading on: the closest kanji to pick from | [image](after/kanji_chart/pad_outside_kanji_390x844.webp) |
