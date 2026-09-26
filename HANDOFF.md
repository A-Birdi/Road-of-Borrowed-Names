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
  Unit tests: 1815 pass. Browser: `node tests/e2e/run.mjs` 12/12 scripts on the final
  build (UI 14/14, systems 4/4, settings), per-chapter story
  tests, Atlas check, and the whole-game matrix: 16/16 profile × companion
  combinations play a new campaign through all six chapters and one Atlas
  expedition (tests/e2e/matrix.mjs). Details and dates in VALIDATION.md.
- Test tooling: tests/e2e/drive.mjs (goal-directed driver: walks real maps,
  interacts through the world), pursue.mjs (whole game), matrix.mjs,
  run.mjs (suite runner), explore.mjs (random explorer, weaker).
- Not verified by automation (needs people): real handwriting accuracy,
  playtime, native-speaker review, music quality, audible TTS.

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

## Next concrete actions
1. Human play-testing: handwriting with real learners, pacing/playtime, and a
   native-speaker review of the Japanese (content in src/content/*/).
2. Optional polish found in review: lexicon part-of-speech warnings between
   chapters (validator warnings), observatory dome sprite clipped at the top
   of sb.obs_path (cosmetic), credits are a single card.

## Known issues / limits
- No human handwriting samples tested (synthetic + font-derived only).
- Playtime not measured.
- Japanese content has not been reviewed by a native speaker.
