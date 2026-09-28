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
