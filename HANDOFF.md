# Handoff

- Repository: `https://github.com/A-Birdi/Road-of-Borrowed-Names.git`
- Active task branch: `claude/stoic-sagan-n3jvgk` (base `main`; checkpoints are NOT on main)
- Spec: `SPECIFICATION.txt` (byte-identical copy of the brief)
- Deliverable: `index.html` at repo root, built by `node tools/build.mjs`.

## Architecture (src/, concatenated in `src/manifest.json` order)
- `core/` namespace + utils (RB.util, RB.bus).
- `lang/` Japanese core: RB.kana, RB.jp (ruby markup parse/render, deinflect,
  lookup), RB.lex (lexicon), RB.grammar, RB.answers (answer checking + feedback),
  RB.kanaLessons; `70_lookup_ext.js` (counters, names).
- `recog/` handwriting recognizer (KanjiVG-derived data, CC BY-SA 3.0; see
  docs/RECOGNITION.md). API: RB.recog.recognize / reference / strokeOrderFeedback.
- `audio/` Web Audio synth, sequencer, 33 songs, 44 sfx, local-only TTS (docs/AUDIO.md).
- `engine/` state+conditions, input, tiles, props, sprites, portraits, maps,
  mapkit, world, render, script DSL runner, save (IndexedDB slots), game
  controller, combat logic (95), test harness (99, inert unless enabled).
- `learn/` mastery scheduler, task generation.
- `ui/` UI core + lightbulb help + HUD, dialogue, title/slots, creation
  (prologue, placement, NG+), menus, handwriting pad, challenge runner, lessons,
  activities (orders/letters/signpost/history), combat UI + enemy art.
- `content/` 00_world (cast/places), 01_inkweaving (words, telegraph lines),
  ch1..ch6 chapters, zz_names (auto-registers names in lexicon).
- `atlas/` Unwritten Atlas (post-game expeditions) — by a worker.
- Docs: docs/STORY.md (bible), docs/CONTENT.md (authoring formats),
  docs/AGENT_COMMON.md, docs/LANGUAGE.md, docs/RECOGNITION.md, docs/AUDIO.md.

## State
- Complete: engine, UI, saves, learning, combat, recognizer, language, audio,
  Chapters 1–6 with ending/denouement, the Unwritten Atlas, New Game+.
- Validator: no errors (`node tools/validate.mjs --stats` for counts).
  Unit tests: 3084 pass (1866 at the overhaul). Browser: `node tests/e2e/run.mjs` 19/19 scripts on
  the overhaul build d5d4b95 (UI, systems, settings, folio, play UI, title +
  ledger, creation, learning UI, audio, Shift/Load regression in both modes,
  per-chapter story tests, Atlas check, one whole-game run). The 16/16
  profile × companion whole-game matrix (tests/e2e/matrix.mjs) passed 16/16
  on the final overhaul build 6031612 (and earlier on the hotfix build).
  Details and dates in VALIDATION.md.
- Test tooling: tests/e2e/drive.mjs (goal-directed driver: walks real maps,
  interacts through the world), pursue.mjs (whole game), matrix.mjs,
  run.mjs (suite runner), explore.mjs (random explorer, weaker).
- Hotfix (user-reported): Shift froze the world; Load/Continue left the title
  backdrop over the world. Fixed in src/engine/10_input.js, 50_world.js,
  90_game.js; regression tests/e2e/shift_load_regression.mjs (+ fixture
  tests/fixtures/shift_load_legacy.json), 18/18 in http-origin and file://
  modes; original build 3/18. See VALIDATION.md.
- Not verified by automation (needs people): real handwriting accuracy,
  playtime, native-speaker review, music quality, audible TTS.

## Visual overhaul: "Wayfarer's Folio" (brief of 2026-09-26) — complete on this branch
All four phases are done on `claude/stoic-sagan-n3jvgk` (not on main). Final
build 6031612: full browser suite 19/19 (d5d4b95; 6031612 differs by one CSS
property, re-tested), unit 1866, layout audit 448/448 (English, 8
viewports) and 168/168 (Japanese labels), whole-game matrix 16/16.
Follow-up (player report, 2026-09-27): the dialogue no longer moves the map
and outdoor maps continue past their edges (b1185f9; full suite 20/20).
Follow-up (player report, 2026-09-28), full suite 24/24, layout audit
448/448 + 168/168 and whole-game matrix 16/16 on bbee0e2; then multiple-choice
options shuffled (src/ui/65_challenge.js choicesFor; the right option had been
shown first ~99% of the time) — see REQUIREMENTS.md P1–P16 and VALIDATION.md
"Playtest fixes":
- World (src/engine/40_maps.js shut doors + shutDoorAt; 50_world.js walk
  in/out (leave, arriveOnFoot, routeOut), extras (ensureSpeaker,
  dismissExtras), idle glances, map `hold` rule; 60_render.js breathing;
  27_propart.js `sway`; 70_script.js `!speakerless` now meaningful;
  chars[id].bodiless; npc `was` for a renamed figure; 90_game.js play time
  in every mode with a 5-minute idle stop). Test runs list bodiless lines,
  walk-ins and night leaks (tests/e2e/pursue.mjs).
Sprite and battle polish (owner's brief of 2026-09-28, amended). The full default suite passed 29/29 on ecb584b; on c113f3a the layout audit was 448/448 + 168/168 and the whole-game matrix 16/16. See REQUIREMENTS.md B1–B12, VALIDATION.md "Sprite and battle polish" and docs/ART_DIRECTION.md §8, §10 and §11:
- **World** (src/engine/50_world.js): people leave for where the story puts them next. `wayFor()`, `towards()` and `mapsWith()` find the map where the person now appears (or an authored `npc.leaveTo`) and the first exit on a shortest usable chain of map links. Arrivals come from `W.seenOn` or from where the story keeps them. `W.departures` records every coming and going, and test runs keep them in `RB.test.departures`, which pursue.mjs reports.
- **Encounter place:** 90_game `startBattle` passes `opts.where`, and 80_combat `placeEnemy()` sets the setting, placement bg/intro/settle and `bgKey`. `RB.combat.context()` reports all of this. Enemies declare `setting` when their lines describe a place, and validate.mjs checks each placement's lines and backdrop against its map.
- **Next button:** the battle overlay is inserted first in `#ui`, and `body.in-dialogue` turns off its pointer input. In 20_dialogue.js, a press that began before a line or its replies appeared doesn't dismiss it.
- **Characters:** 32_spriteart.js (40×58 road frames from one rig), 32h_spritehair.js and 32k_spriteacc.js; `RB.battlers` in 34_battlers.js (80×104 rear three-quarter battle figures, with a pose library).
- **Backdrops:** `RB.battlePlaces` (src/ui/76_battle_places.js, plus 76_battle_placeart.js) composes each backdrop from the map around the encounter, with seeded accessories. The old region painters in 79_battle_scene.js are the fallback.
- **Battle presentation:**
  - `RB.battleSeq` (82_battle_seq.js) stages the rules' fx.
  - `RB.battleStage` (83_battle_stage.js) handles layout and anchors, including `foe:i` for later.
  - `RB.battleFx` (84_battle_fx.js) draws effects and status marks; creature motion is in 78_enemy_art.js.
  - `Sc.effect`, `Sc.ward` and `Sc.mist` in 79_battle_scene.js are no longer called.
- **Groups of creatures, the companion's turn, the difficulty curve** (lead's brief of 2026-09-29; docs/COMBAT_NOTES.md, ART_DIRECTION §11; REQUIREMENTS E1–E12):
  - Rules: `st.foes[]` with `st.cur` the target (95_combat.js `groupFor`, `target`, `reachOf`, `compOptions`, `compAct`, `enemyAct` per creature); Relaxed 1, Standard 2, Demanding 3 creatures, only at the group placements of `sa.stacks`/`sa.conduits` and in the Atlas (30_gen.js). Battle resolve 14/12/10 by setting.
  - Companion's turn: after the response's step, a support menu (`C.companionActions`, src/content/02_companions.js; unlocks at recruitment, `ch2_done`, the personal quest, `lq_ally1`, `lq_ally2`); Back returns at no cost.
  - Screen: target slips and bracket, previews, formation, per-creature sequences (80_combat.js, 83_battle_stage.js, 82_battle_seq.js).
  - Player model `RB.combatSim` (96_combat_sim.js) drives `RB.test.battle` and the curve test `tests/unit/combat_curve.test.mjs`.
  - Tests: `tests/e2e/battle_group.mjs`, `tests/e2e/companion_turn.mjs` (both in run.mjs); unit combat_rules/combat_fairness/combat_curve.
  - Harmony charges: still undecided (docs/COMBAT_NOTES.md, last section).
Title screen (player report of 2026-09-29; REQUIREMENTS.md T1–T5, VALIDATION.md "Title screen"):
- The scene in src/ui/30_title.js is the open doorway of a roadside inn: sliding doors, a noren, a sill, and the folio lying flat on the desk.
- `mastAside()` reads the page's title layout from the same media queries as 40_title.css ('' centred, 's' beside the folio, 'sl' short landscape). The noren and the moon follow it.
- The stars dodge the title's words as measured on the page (`mastRects`, re-measured by a ResizeObserver), the moon and the ridge skyline.
- `drawSky()` twinkles the stars and runs the shooting star and comet. `RB.ui.title.sky()` / `.sky.soon()` are the test hooks.
- Chapter banner: src/ui/10_ui.js card() + 50_play.css .banner.
- Combat clarity: src/engine/95_combat.js (TECHS, blowOf/heatBonus/answers),
  src/ui/80_combat.js, src/ui/81_combat_help.js; boss theme in
  src/audio/30_songs.js. Kanji handwriting: src/recog/20_recognizer.js,
  src/ui/60_pad.js, src/lang/50_answers.js, Settings `padKanji`.
  Equipment: src/engine/07_equip.js (the worn look), Satchel in
  src/ui/50_menu.js. Design record, tokens, component rules, the old→new menu mapping and
the pixel-art record: docs/ART_DIRECTION.md. Before/after captures of the
real builds: docs/screenshots/ (README indexes them). Evidence: VALIDATION.md
("Visual overhaul — final build"). Checklist: REQUIREMENTS.md V1–V21.
- Interface: CSS per area in src/styles/ (00_tokens, 10_legacy, 20_folio,
  30_folio_pages, 40_title, 45_create, 50_play, 60_learning; concatenated in
  name order). RB.ui.folio (src/ui/12_folio.js): frame, APG paper tabs
  (roving tabindex, ribbon, overflow arrows measured from natural tab
  widths), inline SVG icons. Pause folio (src/ui/50_menu.js): Journey /
  Words / Satchel / Map + Save & Load and Settings utilities; old names
  (journal, log, notebook, guide, items) still open the right page.
  Settings (55_settings.js), dialogue (20_dialogue.js), word help, HUD,
  confirm sheets and cards (10_ui.js), touch pad (engine/10_input.js),
  title + six-slot ledger (30_title.js), four-step creation (40_create.js),
  challenge/pad/lessons/activities/combat (60–80_*.js), Atlas sheets
  (atlas/50_run.js).
- Art: renderer at 2 art px per logical px (engine/60_render.js; hooks
  draw2/anim2/STRUCT2/getArt, legacy x2 adapter, prewarm on door
  transitions; outdoor maps continue past their edges — the "apron" built
  with the static layer — and walled maps keep a surround; the camera is
  never moved by the dialogue, which docks at the top when it would cover
  the player or speaker: 20_dialogue.js dock()); tiles 20–21, props/buildings 26–29 + chapter blocks,
  characters 31–33, portraits 35–36, battle creatures/backdrops 77–79 +
  chapter enemy-art blocks, title scene in 30_title.js.
- Tests added: folio, play_ui, title_ledger, create, learning_ui (in
  run.mjs); visual.mjs (captures + `--check` layout/target/furigana-contrast
  audit, `--lang ja`), art_shots.mjs, perf.mjs, shots_to_docs.mjs;
  tests/unit/ui_contrast.test.mjs.

## Long quest lines (owner's request of 2026-09-29) — REQUIREMENTS.md L1–L7, VALIDATION.md "Long quest lines", docs/STORY.md "Long roads", docs/CONTENT.md §10
- **Content:** everything is in src/content/lq/ (lexicon, data, maps with hooks into earlier maps, and scenes for each line and the letters from home).
- **Test:** tests/e2e/long_quests.mjs. The suite runs `--fixtures-only`; a full run adds `--all-companions`.
- **Ally flags:** `lq_ally1` (Chigusa decides) and `lq_ally2` (the Koharuno lantern) are set here. The companion's battle actions read them (see the combat notes).
- **rw_depart:** closed by `sg.arrive`. The Journey reads an earlier chapter's main quest as completed for older saves.

## Quest guidance (owner's question of 2026-09-29) — REQUIREMENTS.md G1–G6, VALIDATION.md "Quest guidance"
- `RB.questGuide` (src/engine/56_questguide.js) derives where each quest's
  next step happens by walking, against the current state, the scenes each
  world entry point would run (talk options, props, triggers, onEnter,
  foes; `!call`ed scenes included); needs of blocked steps two levels deep;
  reachability through usable exits, doors, fast travel and `!warp` scenes.
  Optional per-stage `hint` / `at` (docs/CONTENT.md §4); the validator checks
  them. API: `analyse(qid, st, {static})`, `targets(qid)` (cached),
  `followed()`, `follow(id)`, `unfollow(id)`, `nudges(qid)`, `nextLines(r)`,
  `wayFrom(r)`, `placeOf(map)`, `mode()`.
- `RB.questMarks` (src/engine/62_questmarks.js) draws the markers, called at
  the end of `drawWorld` (60_render.js); `RB.questMarks.marks()` reports what
  was drawn (tests). `RB.world` now exports `towards`, `linksOf`, `mapsWith`.
- Journey (50_menu.js `guideBlock`, `guideClick`): Follow / Following,
  "Next: …", nudges; Map: the chart marks the followed step. Settings ›
  Learning & Challenge › Quest guidance (`settings.questGuide`: full | hints
  | off; default full). The followed quest is the optional `s.follow`.
- Tests: tests/unit/quest_guide.test.mjs (every quest stage listed with
  `QG_LIST=1`), tests/e2e/quest_guide.mjs (in run.mjs),
  tests/e2e/quest_guide_audit.mjs (whole game, on demand), visual.mjs states
  `journey_guide`, `settings_guide`.
- New quests (e.g. under src/content/lq/): run the unit test; a stage listed
  as missing needs an `at` (or `at: 'open'`); a new kind of target prop needs
  a noun in `PROP`/`PROP_PREFIX` (56_questguide.js).
- Content finding, not changed here: `rw_depart` is never marked done (it
  stays under "Now — the main road" from Chapter 2 on). Guidance ignores it
  after Chapter 1; the fix would be `!quest rw_depart done quiet` in the
  Chapter 2 arrival scene.

## Commands
- Build: `node tools/build.mjs`
- Content validation: `node tools/validate.mjs [--filter sg] [--unknown]`
- Unit tests: `node tests/run-unit.mjs [filter]`
- Browser: `node tests/e2e/story_ch1.mjs [F|E|I|A] [nao|mio|ren|suzu]`,
  `node tests/e2e/story_ch3.mjs [prof] [comp]`, `story_ch4.mjs [prof] [comp] [stay|go|both]`,
  `story_ch6.mjs [runIndex 0-4]`, `node tests/e2e/atlas.check.mjs`,
  `story_ch5.mjs [prof] [comp]` (driven through the world by tests/e2e/drive.mjs),
  `node tests/e2e/systems.mjs` (fast travel, step back, bosses, defeat),
  goal pursuit (whole game from a new campaign by default):
  `node tests/e2e/pursue.mjs [prof] [comp|none] ["flag@prefix@mainQuest>…"] [map x y] [flags] [words]`,
  random explorer: `node tests/e2e/explore.mjs <map> <x> <y> <flag[@prefix][>…]> [comp|none] [prof] [seed] [maxActions] [flags] [words] [mapPrefix]`,
  `node tests/e2e/ui.mjs [filter]`, `node tests/e2e/audio.check.mjs`,
  screenshots: `node tests/e2e/shot.mjs out.png "<js>" [ms] [WxH]`.
- Interface/art review: `node tests/e2e/visual.mjs <outDir> [--vp 390x844,1280x800] [--only a,b] [--lang ja] [--check]`
  (synthetic fixtures; `--check` audits overflow, clipped text, touch targets
  and furigana contrast), `node tests/e2e/art_shots.mjs`, timing
  `node tests/e2e/perf.mjs [--html file] [--vp WxH] [--dpr n]`, docs images
  `node tests/e2e/shots_to_docs.mjs <beforeDir> <afterDir>`.

## Next concrete actions
1. Human play-testing: handwriting with real learners, pacing/playtime, and a
   native-speaker review of the Japanese (content in src/content/*/).
2. Real-device pass of the overhaul (everything so far is headless Chromium
   with emulated touch and an emulated software keyboard): a phone in
   portrait and landscape (tabs, move pad, word-help sheet, creation with the
   real keyboard, handwriting pad), frame rate on a mid-range phone, and
   Firefox and Safari/WebKit (not installed here, not tested).
3. A human look at the art (docs/screenshots/, `art_shots.mjs`) — quality
   was judged only by the author from captures.
4. Listen to the new boss theme (checked at signal level only) and play a
   few battles with a companion to judge the Harmony notes and keyword
   cards; try the pad's kanji reading with real handwriting.
5. In Firefox, the owner's browser: click Next after a battle, and watch the
   new battle presentation and figures. Only Chromium is installed here.
   Decide on Harmony charges (docs/COMBAT_NOTES.md). Play a few group
   battles (Standard and Demanding, the Stacks and the Conduits) and judge the
   companion's turn by hand; only headless Chromium has played them.
6. Optional polish found in review: lexicon part-of-speech warnings between
   chapters (validator warnings), observatory dome sprite clipped at the top
   of sb.obs_path (cosmetic), credits are a single card.

## Known issues / limits
- No human handwriting samples tested (synthetic + font-derived only).
- Playtime not measured.
- Japanese content has not been reviewed by a native speaker.
- Overhaul: validated in headless Chromium only (touch and keyboard
  emulated); no real phone, Firefox or Safari; phone performance and battery
  not measured. Entering a map now builds about 4x the pixels of before
  (hidden behind the door transition; see VALIDATION.md timings).
