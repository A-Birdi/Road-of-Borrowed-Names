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
  Chapters 1–6 with ending/denouement, the Unwritten Atlas, New Game+; since
  2026-09-29 also groups of creatures and the companion's turn, two long
  quest lines with the side area Koharuno, quest guidance (nudges and
  markers), every displayed kanji on the pad with the kanji chart, and the
  new title scene.
- Since 2026-09-30 also the owner's **Living Company and Discovery addendum**
  (all of it, integrated): four cosmetic pets, the Company tab (Companion,
  Pet, Shared memories), bond, companion thoughts/invitations/reflections/rest
  topics, ending extensions and The Pages We Keep, Field Inkweaving with the
  Mill Road and puzzles F1–F6, two deduction cases with evidence pages and
  Known Details, twelve Roadside Keepsakes, sentence bookmarks and Creatures
  Met. See the section below and docs/addendum/COVERAGE.md.
- Latest full check (5312690 + the test-only fix 24f8730, VALIDATION.md
  "Addendum — integrated validation"): validator no errors (634 registry
  texts); unit 6321/0; `node tests/e2e/run.mjs` 49/50 (battle_group's phone
  section, a test pointer issue fixed in 24f8730, then 6/6 twice), including a
  whole-game run; layout audit 536/536 (English, 8 viewports) and 201/201
  (Japanese, 3); whole-game matrix 16/16. Earlier milestones and dates are in
  VALIDATION.md.
- Since 2026-10-02 also the **Practice addendum** and the **Battle addendum**, both
  complete on this branch (sections below). Latest checks (VALIDATION.md "Battle addendum —
  Phase F"): validator no errors; unit 15,334/0; `node tests/e2e/run.mjs` 63/65 on the merged
  build (the two explained and passing on the final build), including a whole-game run; battle
  geometry, invariance, 20-battle cleanup and memory budget on the final build; then the
  full-game matrix with both addenda (VALIDATION.md "Full-game matrix — both addenda"):
  whole-game matrix 16/16, layout audit 536/536 (English, 8 viewports) and 201/201 (Japanese, 3).
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
  the prologue's shots (41_prologue_art.js, 41b–41d),
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

## Every kanji on the pad, and the chart (owner's brief of 2026-09-29)
"Expand recognizable drawn kanji to cover every kanji present in the game,
with pages in the chart to cycle lists of kanji by type … the chart option in
battles can have a search" (守る could not be written on Elementary). Details,
method and measurements: docs/RECOGNITION.md ("Coverage", "At scale", "The
chart", "Measured results"); evidence: VALIDATION.md ("Every kanji on the pad").
- Recognizer: all 1,547 displayed kanji + the first 33 (1,548) from KanjiVG
  (src/recog/10_strokedata.js, 185 KiB, generated). The list comes from the
  source (tools/kanjivg/gamekanji.mjs); tests/unit/recog-coverage.test.mjs
  fails when new text brings a kanji without data. Kana-only pads return
  identical results (tools/kanjivg/kanaparity.mjs).
- Readings: src/lang/75_kanjiread.js (generated by tools/kanjiread.mjs from
  the game's furigana and lexicon); RB.answers.kanjiReading covers every kanji.
- Chart: RB.kanjiChart (src/ui/62_kanjichart.js) with RB.kanjiInfo
  (src/lang/80_kanjiinfo.js): pages by theme and by use, search, entries,
  practice; from the pad (battles too) and Words › Kanji chart.
- Regenerate after new text: `node tools/kanjivg/fetch.mjs && node
  tools/kanjivg/convert.mjs && node tools/kanjiread.mjs`, then
  `node tools/build.mjs`. `tests/unit/recog-coverage.test.mjs` names any
  kanji that needs it. After merging other branches, resolve index.html by
  rebuilding it, never by hand.
- Status on the worker branch: unit 3,765/3,765, default browser suite
  30/30, validator no errors (VALIDATION.md).

## Living Company and Discovery addendum (owner's brief of 2026-09-30) — REQUIREMENTS.md D1–D13, VALIDATION.md "Addendum — integrated validation", docs/addendum/
- Built in slices by workers on top of a foundation (docs/ADDENDUM_CONTRACTS.md:
  save namespaces, `RB.company`/`RB.discovery` core, bus events, page registries),
  then merged and integrated here. One record per slice in docs/addendum/:
  `pets.md`, `company.md` (+ `companion_decisions.md`), `endings_pages.md`,
  `fieldweave.md`, `cases.md`, `words.md`; the combined §23 matrix is
  `COVERAGE.md`, with the integration fixes found by testing the merged tree.
- Where things live: engine `src/engine/06_company.js` (core), `37_pets_*.js`,
  `57_petworld.js`, `58_companion.js`, `55_fieldweave.js`, `59_cases.js`,
  `63_bookmarks.js`, `64_creatures.js`; UI `src/ui/52_company.js`,
  `53_company_pages.js`, `54_company_pet.js`, `57_weave.js`, `58_keepsakes.js`,
  `59_casebook.js`, `61_known.js`, `66_words_pages.js`, `85_battle_pets.js`;
  content `src/content/{pets,company,pages,discovery,cases,words}/`.
- Tests: unit `pets`, `company_core`, `company_bond`, `pages_project`,
  `fieldweave`, `cases`, `bookmarks`; browser `pets*.mjs`, `company*.mjs`,
  `addendum_integration.mjs`, `pages_ending.mjs`, `fieldweave.mjs`,
  `mill_road.mjs`, `keepsakes.mjs`, `cases*.mjs`, `known.mjs`, `bookmarks.mjs`;
  `visual.mjs` audits the new pages. All in `tests/e2e/run.mjs`.
- Save compatibility: older saves migrate (namespaces filled, legacy milestones
  rebuilt from verified flags only); nothing is deleted and no New Game is
  needed. No export/import was added.

## Practice, Fishing and Shiritori addendum (owner's brief of 2026-10-02) — complete on this branch; REQUIREMENTS.md PA1–PA8, VALIDATION.md "Practice addendum — integrated validation", docs/practice/COVERAGE.md
- Foundation (c86d615): `s.practice`, the one-session activity controller (`RB.activity`,
  src/engine/09_activity.js), the learning adapter and cooldowns, Words › Ways to practise, the
  Company hook, Practice mementos, device settings, the shiritori rules core. Contract:
  docs/PRACTICE_CONTRACTS.md.
- Merged (Phase G): shiritori engine (banks, audits, opponents, benchmark), the fishing pace clock
  (the only clock in the game, off by default), suite B (letters, proofreading, comparisons; the
  post box in Shino's Post House), the shiritori table and wordplay (records, Company card, the two
  Bond events), suite A (lantern tending, the copying desk, Practice mementos), fishing (three sites,
  nine fish, the stage, notes). Each area's record: docs/practice/<area>.md.
- Checked on the integrated build: unit 7987/0; default suite 57/58, the one failure a gap in the test
  player (a practice activity opened from a scene), fixed in src/engine/99_test.js, after which the
  whole-game run passed. Audits and the 3,600-game benchmark unchanged.
- Not verified: human play, native review, real handwriting, Firefox/Safari/devices, fish captions.

## Battle art, adaptive combat UI and playtest repairs addendum (owner's brief of 2026-10-02) — complete on this branch; REQUIREMENTS.md BA1–BA16, VALIDATION.md "Battle addendum — Phases A and B" and "— Phase F", docs/battle/, docs/BATTLE_ART_CONTRACTS.md
- Phase A (32edf8c, 982c8df): playtest repairs RBN-01 (target-aware tap-to-interact, 50_world.js),
  RBN-02 (prompts name the script they accept; validator check), RBN-04 (truthful heal lines),
  RBN-05 (neutral letter lead), RBN-07 (guided gears example); the reconciliation ledger for RBN-01 to
  -08 (docs/battle/LEDGER.md); the art seams (authored creature poses, creature travel,
  `RB.battleSeq.addDelivery`, the effect registry), the shared contracts and the battle-content
  inventory (docs/battle/INVENTORY.md).
- Phase B (50e44f7, the integrator; docs/battle/PRESENTATION.md): Battle animations Normal / Fast /
  Instant independent of Text speed; the current-action banner (src/ui/82b_battle_banner.js); per-creature
  intent badges and the inspector, Adaptive / Expanded intent display, reading-critical moves named
  neutrally with their wording kept in view (src/ui/82c_battle_intents.js, 80_combat.js); menus that
  withdraw on commitment, inert while away, Keep visible; Skip; fresh-press ownership and focus return;
  Resolve and Harmony visible in every state; portrait phones put the dock above the party slip.
- Phases C–E (five workers, merged e21bf2f, 04ad864, 03cb94a, 6f90736, ba3f4cb): party art (an
  articulated rig, pose library, party choreography `RB.partyChoreo`, word motifs and effects;
  docs/battle/party.md), creatures A (Chapter 1–3 families and the Flour Moth proof;
  creatures_a.md), creatures B (Chapter 4–6 and Atlas families; creatures_b.md), contextual backdrops
  (backdrops.md), pets in battle and overworld parity (pets_overworld.md). Each record has its files and
  APIs, frame standard, pose/timing tables, a self-review against the rubric, cache budget, results and
  limitations. What the merges changed in the seams: docs/BATTLE_ART_CONTRACTS.md.
- Phase F (integrated validation; VALIDATION.md): fixed on the merged build — at large text the banner
  scrolled off the top of a phone and wrapped into the half right of centre, and the stage moved during
  an exchange (the withdrawn menus re-sized behind it; a condition line on a creature's slip); the
  overlay's rows and the withdrawn menus now hold their committed sizes until the menus return.
  Measured: geometry (docs/battle/GEOMETRY.md), rules invariance, the 20-battle cleanup, the §21.5 memory
  budget (37.12 MiB of 48; tests/e2e/battle_budget.mjs). Evidence: recordings in
  docs/screenshots/battle/presentation/ (Normal, Fast, Instant, reduced motion, a 390×844 phone), layout
  stills in docs/screenshots/battle/layout/, each area's folder (index: docs/screenshots/battle/README.md).
- Found, left for the owner: Nao's "missing third floorboard" in rw.warehouse is not drawn (§2.9; the
  line is also quoted by the comparisons item C07, so softening it means editing C07 too); learning task
  picks use the page's shared `Math.random`, which world blink timers also draw from, so which item a
  battle task asks about varies with frame timing (no rule uses it); Moth and Lantern is recognised by its
  flame colour because its `artOpts` carry no variant flag (creatures_b.md); creatures are drawn before the
  party, so at contact a moth's near wing passes behind the adventurer it strikes (creatures_a.md).
- Not verified: Firefox (the owner's browser), Safari, a real phone or the foldable, the art judged by a
  person (every rubric is a self-review), a native speaker's review, frame rate on named hardware.
- The owner's playtest of 2026-10-02 (Firefox, about 2000 × 1090), answered on this branch
  (VALIDATION.md "Battle playtest round", REQUIREMENTS BA17–BA21): one cadence in every phase (the scene
  had run at half speed once the opening lines closed); Adaptive shows a routine move as its badge only
  (§13.3); each creature's name, knots and conditions on a translucent plate above it with its badge
  (the solid navy slip is gone); no empty panels during the opening lines; the battle art restyled
  toward the owner's reference by three workers (party, creatures A with the Flour Moth and the Mill
  Echo first, creatures B) — records in docs/battle/party.md (round 2), creatures_a.md ("The restyle
  round"), creatures_b.md ("Restyle round"); evidence in docs/screenshots/battle/*_restyle/.
- The full-game matrix with both addenda in ran after both were complete, as the owner asked:
  16/16 whole-game runs, layout audit clean (VALIDATION.md "Full-game matrix — both addenda").
  What remains is by hand (Next concrete actions, item 10).

## Prologue (owner's report of 2026-10-03) — complete on this branch; REQUIREMENTS.md PR1–PR5, VALIDATION.md "Prologue round", docs/ART_DIRECTION.md §12
- **The report:** the prologue's panels were flat blocks beside the title scene's pixel art. In the last shot the traveller walked up from the screen's centre, beside the river and at full size; on a phone the caption slip hid them.
- **The traveller now walks the road (`src/ui/41_prologue_art.js`):**
  - The walk starts just above the slip and follows the road's centre (`RB.ui.title.roadGuide`) toward the horizon at a steady pace.
  - The figure shrinks with distance, using the real walk frames shrunk onto the same grid, night-graded and lit by the lantern they carry.
- **The four flat shots are redrawn with the pixel kit:** the teahouse twice (41b; Hana's own portrait), the riverbank lantern whose name leaves it (41c), and the broken bridge in the morning (41d).
- **Tests and evidence:**
  - `tests/e2e/prologue.mjs` (in the default suite) checks the pixel under the traveller's feet at every moment, at four screen shapes.
  - `tests/e2e/prologue_shots.mjs` writes docs/screenshots/prologue/after/; before/ is the previous build.

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
6. The owner's report of 2026-09-29, to be checked by hand:
   - the title screen (the inn's doorway, the flat folio, the sky) on the
     foldable and in Firefox;
   - the long quest lines' pacing, played across chapters;
   - whether quest markers help the right amount or make it too easy
     (Settings › Quest guidance can turn them down);
   - the kanji chart's themes (keyword-based; about 1 in 12 is debatable);
   - 守る and other kanji written by real hands (the accuracy figures are
     synthetic).
   The battle recording docs/screenshots/battle/play_moth_outside.webm
   predates the companion's turn; `tests/e2e/battle_video.mjs` re-records it.
7. Optional polish found in review: lexicon part-of-speech warnings between
   chapters (validator warnings), observatory dome sprite clipped at the top
   of sb.obs_path (cosmetic), credits are a single card.

8. The addendum (2026-09-30), by hand: meet an animal and watch it follow and
   react in battle; play a puzzle two ways; try a case without help; finish the
   game with a committed companion and a pet and read the ending extension; one
   Atlas outing of The Pages We Keep. Only headless Chromium has played any of
   it, answering through the solver. A native speaker should read the new
   Japanese (src/content/{pets,company,pages,discovery,cases}/).
9. Found, left alone: Snowbell's tone-1 morning lines never play
   (docs/addendum/companion_decisions.md); the arrival place label can sit over
   a folio opened at once.
10. The battle addendum (2026-10-02), by hand, in Firefox and on the foldable
   (folded and open): a few battles at Normal, Fast and Instant, with and without
   reduced motion; open a badge by hover, focus and tap; watch the banner and the
   menus withdraw and return; try 140 % and 200 % text; turn or unfold the device
   during an exchange. Judge the new party, creature and backdrop art (the rubrics in
   docs/battle/*.md are self-reviews). After the playtest round: does the scene keep its pace once the
   opening lines close; do the plates above the creatures read well over each backdrop; is the restyled
   art (start with the Flour Moth and the Mill Echo) closer to the reference — the workers list what is
   still short of it (the crane and clerk stay fairly frontal; an 80 × 104 party figure cannot carry the
   reference's detail density).
11. The prologue (2026-10-03), in Firefox and on the foldable: watch the six shots through once (New
   Game → a slot). Does the traveller read as walking up the road into the distance? Do the teahouse,
   the riverbank lantern and the bridge sit with the title scene? Try reduced motion and a phone held
   sideways (the slip covers most of the road there, so that walk is short). Every judgement of this
   art so far is a self-review.

## Known issues / limits
- No human handwriting samples tested (synthetic + font-derived only).
- Playtime not measured.
- Japanese content has not been reviewed by a native speaker.
- Overhaul: validated in headless Chromium only (touch and keyboard
  emulated); no real phone, Firefox or Safari; phone performance and battery
  not measured. Entering a map now builds about 4x the pixels of before
  (hidden behind the door transition; see VALIDATION.md timings).
