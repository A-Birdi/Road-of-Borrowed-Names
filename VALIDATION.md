# Validation log

Records commands actually executed and what was observed. Categories:
**B** = real browser test (Playwright/Chromium), **U** = node unit/content test,
**R** = code review/static inspection only, **H** = still needs a human.

## Environment
- Linux container, Node 22, Playwright 1.56.1, Chromium (headless) build 1194.

## Log
- Bootstrap: `SPECIFICATION.txt` copied from the supplied brief; md5
  `a1487841ac8fd0b145c358c1b5224b83` matches source, 310 lines.
- **B** Bootstrap smoke test (scratch page via `file://`, Playwright Chromium
  headless): page loaded, 2 clicks → counter "2", console captured
  (`ready`, `idb ok`), IndexedDB opened under file://, no page errors.

## Session log (task branch, headless Chromium 1194 via Playwright 1.56.1, Linux)
Revisions: see git log; results below were observed on the working tree at or
just before the commit that recorded them.

- **U** `node tests/run-unit.mjs` — 1731 passed, 0 failed (lang 357, recog 396,
  audio 978 among them). Recognizer accuracy figures are in docs/RECOGNITION.md
  (held-out synthetic and font/sample-derived data; NOT human handwriting).
- **U** `node tools/validate.mjs --filter rw --unknown` — Chapter 1: 0 unknown
  tokens, 0 errors except the Atlas hook (pending the Atlas worker).
- **B** `node tests/e2e/story_ch1.mjs` — 8/8 PASS (nao/mio/ren/suzu × F/A):
  mist lock before first lantern, all quest-1 threads, mill road, mill, Mill Echo
  (won with Unravel only in 4 rounds), bridge/Kōji, Lantern Hall provisional
  switch, commitment via "Set out with…", lock afterwards, no third member.
  RB.test auto mode answers steps with their canonical answers and checks every
  accepted form passes the answer checker (0 problems).
- **B** `node tests/e2e/ui.mjs` — 12/12 PASS after fixes: new game via UI;
  IndexedDB reload persistence and Continue; copy independence (original
  unchanged after saving the copy); delete removes manual + recovery (checked
  after reload); overwrite confirmation (cancel keeps data); storage refused →
  "session-only" banner; cross-tab second tab warned and read-only (save
  refused); pre-departure recovery record restorable; handwriting: KanjiVG
  reference strokes with jitter recognised, clearly drawn wrong kana (め for ぬ)
  recognised as め then explained, empty submit refused, nonsense zigzag not
  accepted, real mouse stroke captured without page scroll, composition
  insert/replace/delete, switch to IME mid-step, Enter during IME composition
  does not submit; real combat UI to victory in Assisted mode; lightbulb help
  (tap, pin, notebook) with furigana present; 390×844 touch viewport (touch
  pad visible, tapping the writing pad does not move the player, no horizontal
  overflow); direct file:// mode boots with no network requests.
  Bugs found and fixed by these tests: same-tab slot re-claim raised a false
  cross-tab warning; phone challenge layout overlapped pad controls.
- **R** Screenshots reviewed: title, creation, first dialogue, slots, combat,
  pad (desktop/phone), atlas fork. Visual judgement is the author's, not a user
  study.
- **H** Still needs humans: real handwriting accuracy, playtime, native-speaker
  review of Japanese, music quality, voice quality (no ja voice in test browser).

### Session log — Chapter 1 exploration and Chapter 5 intake
- **B** `node tests/e2e/explore.mjs rw.road 3 9 ch1_done none E 5 2500` —
  seeded blind explorer (talks, props, triggers, exits at random; no scripted
  route) reached `ch1_done` in 1014 actions / 188 s: all 8 Chapter 1 side and
  main quests done including the new Mochi side story, companion chosen
  (Suzu) only through "Set out with…", 8 battles won with Unravel only, 0
  harness problems, 0 page errors. First run failed: exposed (a) the harness
  never cleared a Flour Moth "shroud" (policy fixed to use a light/wind word,
  and the in-game disabled-card hint now names the remedy) and (b) the explorer
  state signature ignored provisional companion choice (fixed).
- **B** Mochi side story (`rw_mochi`): scripted check at F/E/I/A — quest
  starts at Tomo, cat NPC appears/disappears, challenge solved, quest done,
  cat at home afterwards; 0 problems.
- **B** `node tests/e2e/story_ch1.mjs F mio` — PASS (30 checks) after the
  Mochi addition.
- **U** `node tools/validate.mjs --filter lf --unknown` — Chapter 5
  (Lanternfall) 0 errors, 0 unknown tokens. Chapter 5 worker reports a real
  browser playthrough to `ch5_done` with each companion (worker's run, not
  re-run by the coordinator yet).

### Session log — chapter integration (Chapters 2–6, Atlas)
Commands run by the coordinator on the integrated build (B = browser, U = unit/static):
- **U** `node tools/validate.mjs` — no errors (atlas module now loaded; 17
  lexicon part-of-speech warnings between chapters remain, harmless). New
  checks: unreachable interactable props (0 found).
- **U** `node tests/run-unit.mjs` — 1815 passed, 0 failed (includes new
  learn_prepare test: Foundations one-kana blanks always offer the right kana
  in choice mode; the test fails without the fix).
- **B** `node tests/e2e/ui.mjs` — 13/13 PASS after the engine changes below.
- **B** `node tests/e2e/story_ch3.mjs F nao` — PASS 39 checks (5 battles won,
  Unravel only); `side_ch3.mjs` — 3/3 PASS.
- **B** `node tests/e2e/story_ch4.mjs F ren stay` — 53/53; `A nao both` — 52/52.
- **B** `node tests/e2e/story_ch6.mjs 0` (Ren/A, smart policy) — all ok,
  through the Hush, three ending choices, epilogue to rw.hall.
- **B** `node tests/e2e/atlas.check.mjs` — full expedition, rewards,
  restoration flag, cleanup; no console errors (52.8 s scripted, not playtime).
- **B** Chapter 2 blind explorer (`explore.mjs sg.road 37 10
  "sg_wataru_resolved>sg_tide_low>sg_boss_done>ch2_done" ren I 3 3000 … sg.`)
  — reached ch2_done in 1887 actions, 14 battles won, 0 problems.
- **B** Full-game explorer from a new campaign (seed 21): Chapter 1 → Chapter 2
  end reached continuously (4276 actions, 21 battles won, 0 problems, 0 page
  errors); it then stalled because the explorer's leg restriction forbade
  walking out of Saltglass — explorer fixed, rerun in progress.
- **B** Atlas restoration details: all six props present and their scenes play
  when the matching flag is set (scratch check).
- **B** Ren's journal quest `ren_ushio`: stage 1 at the grave, done at the
  folio choice (scratch check); Chapter 4 story test still passes with it.
Engine fixes made during integration, each found by a worker or a test:
nested scene runs leaked a dialogue mode (world froze) — fixed in the runner;
Foundations one-kana blanks kept whole-word choices (no correct option) —
fixed; counters without their own scene blocked talking across — fixed;
harness could not stand next to multi-tile props — fixed.

### Session log — whole-game reachability
- **B** `node tests/e2e/matrix.mjs FEIA nao,mio,ren,suzu 3` (runs
  `tests/e2e/pursue.mjs` per combination): from a brand-new campaign on the
  first road, the goal-directed driver (tests/e2e/drive.mjs) walks the real
  maps (flood-fill reachability with current blockers, open exits only),
  talks/examines/steps on triggers through `RB.world.interact`, answers every
  step with its canonical answer (accept lists checked) and fights with
  Unravel only. The companion is recruited through the Lantern Hall dialogue.
  Result: **16/16 combinations reached the end of all six chapters** (ch1…ch6
  done, epilogue, return to Reedwake with post-game flags), 9.6–11.4 min each,
  0 harness problems, 0 lost battles, 0 page errors. 14/16 also completed an
  Unwritten Atlas expedition in the same run; E/Nao and A/Nao stalled inside
  the expedition (investigated below).
- **B** `node tests/e2e/story_ch5.mjs` — 8/8 (F and I × all companions), plus
  A/Suzu; Chapter 5 main path through the real world with gate puzzles in
  order and the boss won.
- **B** `node tests/e2e/systems.mjs` — 4/4: fast travel to all five hubs from
  the map tab (arrival tile free), stepping back from a regular encounter
  (foe not marked defeated), no step-back on bosses, defeat → last checkpoint
  with resolve restored and learning kept (combat result stubbed for that test).
- Driver development found only harness issues plus one Atlas integration gap:
  the Atlas reading panel waited for a click even in test auto mode (fixed; it
  now resolves in auto mode like dialogue). No story softlocks were found.
- The two Atlas stalls were a driver defect: the "hall of three doors" room has
  three door exits sharing one scene, and the driver keyed sites by scene, so
  it only ever tried one door. Keyed by place instead (tests only; `index.html`
  unchanged), 20/20 Atlas-only runs with Nao at E and A passed (6 of them met
  the three-doors room), and `node tests/e2e/matrix.mjs EA nao 2` then passed
  both combinations through all six chapters and an expedition. Together with
  the 14 passes above: **16/16 profile × companion combinations played a new
  campaign through the whole story and one Unwritten Atlas expedition.**

### Session log — final-build suite and a click-handling bug
- **B** First `node tests/e2e/run.mjs` on the near-final build: 10/11 scripts
  passed; `ui.mjs` "real combat UI" failed intermittently (1 in 3). Root cause
  (a real bug, not a flake): with lightbulb help on (the default), a capture
  click handler turned any click on a Japanese word into a help request, even
  inside buttons — so clicking the text of an answer choice, a battle card, a
  dialogue choice or an activity tile opened help instead of acting; only
  clicks on a button's padding or English line worked. Fixed in
  src/ui/10_ui.js: inside controls a click/tap acts; word help there comes
  from hover, keyboard focus, or a long press (which does not also press the
  button). Also: a wrong choice on a writing step is now disabled after use,
  as comprehension choices already were. New UI test "clicking the Japanese
  word on an answer button answers it; a long press shows help instead"
  fails on the old code and passes on the new; `ui.mjs` then 14/14 twice.
- Note: the 16/16 whole-game matrix above ran on the build before this click
  fix. It answers through RB.test auto mode (no button clicks), so its
  reachability result is unaffected; the suite rerun below includes one
  whole-game run on the final build.
- **B** Final `node tests/e2e/run.mjs` on the final build (commit 87bb614's
  index.html): **12/12 scripts passed** — ui.mjs 14/14, systems 4/4,
  settings (contrast, reduced motion, Japanese lead, instant text, text size
  persist across reload), audio.check, story_ch1 F/Mio, story_ch3 E/Nao,
  side_ch3 3/3, story_ch4 I/Ren/"go", story_ch5 A/Suzu, story_ch6 run 2,
  atlas.check (complete expedition), and pursue E/Mio: a new campaign through
  all six chapters (ch1 150, ch2 32, ch3 370, ch4 33, ch5 132, ch6 157 site
  visits) and one Atlas expedition (13), 11 min, no problems or page errors.
- **B** Real-click spot checks after the fix: clicking the Japanese words of a
  dialogue choice chose it (Nao became the provisional companion); clicking
  the Japanese word on a café kitchen tile added it to the tray.
- **U** `node tests/run-unit.mjs` 1815 passed; `node tools/validate.mjs` no errors.

### Session log — Shift / Load hotfix (user-reported, reproduced)
Starting point: branch head b4dd315, whose index.html matches the user's file
(git blob 066c9755…, sha256 3788278a…). Two defects were confirmed in source:
(1) src/engine/10_input.js recorded the held `run` action as the last pressed
direction, so `RB.input.dir()` returned 'run' while Shift was held and
src/engine/50_world.js `tryMovePlayer('run')` threw on `DIRS['run']` inside the
frame loop before the next `requestAnimationFrame` — one Shift press froze the
world; (2) src/engine/90_game.js `loadCampaign` never cleared the title's
render override, so after Load/Continue the lantern backdrop stayed on screen
and world pointer input was ignored. The earlier tests never pressed Shift and
checked load by state, not by what is drawn.
Fix: the supplied source.patch (checked with `git apply --check`, applied to
the modular source unchanged): Run is only a speed modifier; direction
priority is limited to the four directions and reset with held input;
`tryMovePlayer` rejects non-directions; successful `loadCampaign` and
`startNewCampaign` clear held input and the old override after the map entered
(a cancelled/failed load returns earlier and keeps the title). The rebuilt
index.html is byte-identical to the supplied repaired standalone
(sha256 d890792d744c70e69bc6a2280676090f9269997b43785ec1c2f947a33d26129c).
Save module, schema, database name, keys and slots are unchanged.
- **B** `node tests/e2e/shift_load_regression.mjs --origin` (stable
  http://127.0.0.1 origin, IndexedDB): **18/18** — both Shift keys alone
  (no movement, loop alive), movement→Shift (105 ms run steps), Shift→movement
  and releasing direction first, releasing Run first (back to 160 ms), remapped
  Run key, focus loss, text-field isolation, an injected invalid direction,
  manual Load (legacy fixture fields preserved), Continue, autosave Load,
  pre-departure Load, three title→load→run cycles, New Game through the real
  UI, `startNewCampaign` after a title override, a real page reload keeping the
  campaign, and a reload + load leaving another slot's campaign untouched.
  Visibility is asserted by world sprites drawn AND canvas pixels no longer
  matching the title backdrop (checked: 165/165 sample points change on a real
  load, 0/165 when the backdrop is forced back on).
- **B** Same script, default file:// navigation: **18/18**, storage mode
  IndexedDB in every test (Chromium allows it for file URLs).
- **B** `--inline` (setContent, session-only storage; not a persistence test): 16/16.
- **B** Against the original b4dd315 index.html: **3/18** (all Shift-direction
  and Load-visibility checks fail as reported).
- **B** `node tests/e2e/run.mjs` on the hotfix build: **14/14 scripts**
  (ui 14/14, systems, settings, audio, both regression modes, story_ch1/3/4/5/6,
  side_ch3, atlas.check, and a whole-game run through six chapters + one Atlas
  expedition). **U** unit 1815 passed; validator no errors.
- Not tested here: Windows, Brave, Firefox, Safari (only Chromium 141 headless
  is installed); the user's actual saved slot (not provided — the fixture is a
  synthetic save made by the pre-hotfix build); human play.

## Visual overhaul — Wayfarer's Folio (interim runs, 2026-09-26)
Key: **B** = browser test of the built index.html (Playwright, Chromium
headless, this container), **U** = unit test, **S** = screenshot inspected by
eye, **R** = code review only. These are interim runs on the listed commits;
a full re-run of every suite on the final build is recorded at the end.
- **B** `tests/e2e/folio.mjs` (commit da82a12, again on 4079011): all ok.
  Covers: four tabs in fixed order, tablist/tabpanel wiring, roving tabindex,
  focus on the selected tab, click/ArrowLeft/ArrowRight/Home/End with wrap,
  the game not acting on arrows, 16 hit probes inside visible tab boxes all
  reaching their own tab, labels uncovered/unclipped, Settings and Save & Load
  utilities, Escape closing one layer at a time, old names (journal, log,
  notebook, guide, items, map, settings), Words › Guide kept across a
  desktop→phone resize, one page on phones; at 390x844, 360x800, 320x640 and
  390x844 with 200 % text: no element wider than the screen, no clipped tab
  label, rail fits or scrolls with arrows, ≥44 px controls, Close on screen,
  touch tap selects a tab, Back leaves a sub-page before closing, character
  does not move.
- **B** `tests/e2e/settings.mjs` (da82a12, 4079011): switches and radios in
  named groups, reading preview with furigana from a real game line, all
  values applied and persisted across a reload (IndexedDB).
- **B** `tests/e2e/play_ui.mjs` (4079011, again on 031e71a): all ok. Covers
  touch-action none only on the world canvas and touch controls, exactly one
  visible Menu entry, "Talk" label when facing an NPC, hold-to-Run, sliding
  move pad (left→right→released), one Next, HUD and touch controls hidden in
  dialogue, ≥44 px dialogue controls, player drawn above the dialogue sheet,
  tapped word → bottom sheet with Close in view and no advance, tap outside
  only closes the sheet, Escape closes help first, a touch scroll over nine
  replies does not choose one while a tap does, "More" before advancing an
  overflowing line (640x320 at 130 % text), HUD hidden under the folio, Tab
  moves focus into the page without closing it, a hover card does not block
  a click on Next.
- **B** `tests/e2e/ui.mjs` 14/14 (4079011 and 031e71a) — updated for the
  new touch pad selector and for help pausing the question (a click while a
  long-press card is open closes it without answering; the next click
  answers). **B** `systems.mjs` 4/4, `shift_load_regression.mjs` 18/18 in
  both modes, `story_ch1.mjs F mio` pass (4079011); `atlas.check.mjs` 15
  checks ok (7bd3b9c). **U** 1866 passed incl. `ui_contrast.test.mjs`
  (token contrast pairs in default and high-contrast modes).
- **S** Folio (Journey/Words/Satchel/Map/Settings) at 390x844, 320x640,
  390x844 @200 % text and 1280x800; dialogue, word help and world at
  390x844, 844x390 and 1280x800; Atlas sheet/panel/chip at 390x844 and
  1280x800.
- **B** `tests/e2e/perf.mjs`, 1280x800 @1x, same container: pre-overhaul
  build 2b79f3b vs 031e71a+ (art renderer, legacy art at 2x): frame work
  1.6–3.6 ms vs 2.2–4.2 ms; static map build 2–46 ms vs 5–43 ms; folio
  open+close 18 ms vs 34 ms; DOM size unchanged after 20 open/close cycles
  in both. Desktop headless only — phone performance and battery NOT tested.
- **B** Merged title + ledger (commit 3def4a9 build): `title_ledger.mjs`
  13/13 (real clicks/keys/taps: initial focus not on the subtitle word and no
  help card, Continue only with a save, storage line + details, session-only
  variant, ledger at 390x844 and 1280x800 with six and five slots, no
  overflow and ≥44 px at 320/360/390 and 200 % text, Manage → Delete asks and
  Cancel keeps the save, Copy, loading enters the world with the title
  override cleared, in-game Save here by click). Merged creation:
  `create.mjs` 382 checks (all four steps into the world with every choice
  checked in the saved state, Back keeps entries, no prologue replay, the
  accessory limit announced, empty-name error, no overflow/clipping and ≥44
  px at 320/360/390 (100 % and 200 %), 844x390 and 1280x800, resize
  mid-flow, emulated software keyboard and pinch zoom, Inspect, placement,
  New Game+ choice). Same build: ui.mjs 14/14, shift_load_regression 18/18
  (both modes), story_ch1 F mio pass, play_ui all ok, unit 1866.
  The software keyboard was only emulated (visualViewport stub); no real
  phone keyboard was used.
- **B** Learning/combat merge (2788ac3): `learning_ui.mjs` 13/13 (pad
  controls distinct and ≥44 px, canvas the only touch-action:none element,
  mode switch keeps the task, uncertain vs wrong feedback distinguishable,
  no overflow at 320/360/390 and 200 % text, a touch scroll over choices does
  not select, resize mid-writing keeps the task, combat shows intent and
  target at phone size), ui 14/14, systems 4/4, story_ch1 F mio, atlas
  check, play_ui, shift_load --origin 18/18.
- **B/S** Layout audit `visual.mjs --check` (3ef41cc build) over 56 states ×
  7 viewports (360x800, 390x844, 412x915, 844x390, 768x1024, 1280x720,
  1920x1080): 386/392 clean; the 6 reports were the move pad's arrow
  glyphs at 844x390, which pass taps to the 128-px pad (the audit now skips
  pass-through controls). Earlier 360 px run found 34-px rail arrows and
  22-px insertion points (fixed to 44 and 28 px).
- **B** Art merges — characters (aa8a66e), props/buildings (f749019), ground
  tiles (d2dd910): each followed by unit 1866, validator, ui 14/14, systems
  4/4, shift_load 18/18 (both modes), atlas check, story_ch1, play_ui; one
  file-mode run of shift_load hit its 60-Enter budget in the New Game walk
  while seven browser suites shared the CPU (passed alone twice; the walk
  now allows up to 20 s of presses). **S** art_shots world scenes for
  rw.village, rw.hall, sg.harbor, co.village, sb.hamlet, lf.town, sa.camp,
  sa.memories, sg.da_stacks inspected.
- **B** `perf.mjs` after the art merges (1280x800 @1x): frame work 1.6–3.3 ms,
  first static build per map 10–102 ms (sg.harbor largest), folio
  open+close 17 ms, DOM unchanged after 20 cycles. Door transitions now build
  the new map's art while the screen is still black (RB.render.prewarm).
  Desktop headless only; phones not measured.

## Visual overhaul — final build (2026-09-26)
Same key (**B** browser, **U** unit, **S** screenshot inspected by eye,
**R** review). Headless Chromium 1194 in this Linux container only; touch
and the software keyboard are emulated. No real phone, Firefox or Safari.
- **B** Full default suite `node tests/e2e/run.mjs` on fbdc102 (all art and
  interface merged): 18/19 scripts passed. The failure was real:
  `folio.mjs` at 320x640 — "tap selects Words" (and the two Back steps
  after it). Root cause: phone tabs grow to fill the rail, so the
  overflow test (natural tab span vs rail width) depended on the arrow
  padding its own answer adds; after the folio opened, the rail flipped
  between "fits" and "scrolls" every frame (logged frame by frame: the
  overflowing class alternated and the Words tab moved 42 px), so a quick
  tap could land on a neighbour. Fixed in 3cce661: the tabs are measured
  with growth switched off, the first placement is synchronous and instant,
  and the ResizeObserver watches the border box. New check "tab rail is
  steady from the first frame" fails on the previous build at 390, 360,
  320 and 390 @200 % text, and passes now; folio.mjs passed 6/6 repeats.
- **B** New furigana-contrast audit (visual.mjs `--check`, every visible
  reading against the paint behind it, English and `--lang ja`) over all
  states at 320x640, 390x844 and 1280x800 found two real defects, both
  fixed in 3cce661: (1) tab furigana used the old light-on-dark reading
  colour on paper (1.1–1.2:1 on the previous build); (2) lesson and
  activity sheets also carry the old `panel` class, and the paper restyle
  of `.panel` had replaced their cloth cover, leaving the sheet title
  almost invisible (1.5:1). New learning_ui.mjs test "lesson and activity
  sheets keep their cloth cover" fails on the previous build and passes
  now. After the tab fix the only warnings left (9 per language) were the
  lesson/activity sheets; after the sheet fix those states were re-audited
  clean at 390x844 and 1280x800. The whole set is re-audited on the final
  build below.
- **B** Japanese interface labels (uiLang ja) at 390x844, 320x640 and
  1280x800: no clipped tab label, no page overflow, readings present on all
  tabs; all four tabs fit without arrows from 320 px. **S** 320 px capture
  in docs/screenshots/after/extra/journey_ja_320x640.webp.
- **B** Small maps: the patterned surround is painted only around the map
  (d5d4b95). Frames compared pixel for pixel with the previous build at
  1280x800 and 390x844 (three positions × three frames in rw.hall): all
  identical; a self-comparison confirmed the capture is deterministic.
- **B** Full default suite `node tests/e2e/run.mjs` on d5d4b95: **19/19
  scripts passed** — ui 14/14, systems 4/4, settings, folio (incl. the new
  steady-rail checks), play_ui, title_ledger, create, learning_ui 14/14,
  audio check, shift_load_regression 18/18 in http-origin and file:// modes,
  story_ch1 F/mio, story_ch3 E/nao, side_ch3, story_ch4 I/ren (go),
  story_ch5 A/suzu, story_ch6 run 2 (36/36), atlas check, and the whole
  game `pursue.mjs E mio` from a new campaign: ch1–ch6 and the first Atlas
  expedition reached through the real world (721 s). **U** 1866 passed.
  The final commit 6031612 differs from d5d4b95 only by one CSS property
  (the tab measuring rule no longer overrides transitions); on 6031612:
  unit 1866, folio (4 runs), play_ui, learning_ui 14/14, settings all pass.
- **B** `perf.mjs`, same container, pre-overhaul 2b79f3b vs 3cce661 (the
  renderer is unchanged since, except the surround change measured above),
  two runs each at 1280x800 @1x and one at 390x844 @2x. Steady frame work
  (world update + draw, flushed): outdoor maps before 1.4–1.9 ms, after
  1.5–2.4 ms; the small interior rw.hall 1.2–1.4 ms before, 2.9–4.1 ms
  after, and about 2.6 ms after d5d4b95. First static build of a map
  (once per map entry, done during the door transition's black frame):
  before 2–29 ms, after 8–117 ms (4x the pixels; sg.harbor largest). Folio
  open+close 16–17 ms in both; DOM unchanged after 20 cycles. Headless
  Chromium on a desktop-class CPU with software canvas; phones NOT
  measured.
- **B** Final layout audit on 6031612, `visual.mjs --check` (overflow outside
  scrollers, text clipped by its own box, touch targets under 44 px on
  touch viewports, furigana under 4.5:1 against the paint behind it, page
  errors, state errors): English labels, 56 states × 8 viewports (320x640,
  360x800, 390x844, 412x915, 844x390, 768x1024, 1280x720, 1920x1080):
  **448/448 clean**; Japanese interface labels (`--lang ja`), 56 states ×
  320x640, 390x844, 1280x800: **168/168 clean**. States include title
  (with/without save, session-only, details, 200 % text), six-slot ledger
  (empty, states, new, save, read-only, error, 200 %), all creation steps
  (100 % and 200 %, high contrast, focus, keyboard, errors, placement,
  NG+), the four folio pages and Settings, dialogue, word help, challenge
  modes (write/IME/choose/order/unsure/wrong), teaching card, lesson,
  activities, combat, and six world regions. **S** after-captures in
  docs/screenshots/ regenerated from 3cce661 and inspected.
- **B** Whole-game matrix on the final build 6031612,
  `node tests/e2e/matrix.mjs FEIA nao,mio,ren,suzu 3`: **16/16** — every
  learning profile (F/E/I/A) × companion (Nao/Mio/Ren/Suzu) played a new
  campaign through the real world to the end of chapters 1–6 and the first
  Atlas expedition (10.4–12.5 min each, three at a time), through the new
  folio, dialogue, challenge and combat interfaces.
- Not tested (needs people or hardware): real phones and tablets (touch,
  software keyboard, safe areas, frame rate, battery), Firefox and
  Safari/WebKit (only Chromium is installed here), screen readers beyond the
  ARIA roles the tests check, and a human judgement of the art.

## Map edges and the dialogue — player report (2026-09-27)
Report: on the Mill Road (after the first battle) opening a dialogue pushed
the whole map up above the text box, exposing an empty band, and it dropped
back on close; wider windows showed the same band past the map's sides.
- **B** Reproduced on c6850ad with the player's scenario (Mill Road, Mio
  speaking; 1600x870 and 1600x397 CSS px at 125 %, 390x844 phone): camera
  moved on open (e.g. y 216 → 269 at 1280x800) and the dark weave band
  showed past the edges. Captures: docs/screenshots/{before,after}/edges/.
- Fix (b1185f9): camera independent of the dialogue (touch controls keep a
  fixed reserve), sheet docks at the top when it would cover the player or
  speaker, outdoor maps continue past their edges with scenery at the edge's
  density and a gentle fade, walled maps unchanged. See ART_DIRECTION §7.
- **B** `tests/e2e/world_view.mjs` (new): all ok on b1185f9; on c6850ad 9
  of its checks fail (camera moves on open, no top docking, the edge colour
  past the river and woods is the surround's (31,45,39)). Covers desktop and
  phone camera unchanged on open and close, top docking near the bottom,
  replies below a top sheet, mid-map sheet at the bottom, river and woods
  continuing past the edges and darker than inside, trees continued (50)
  and none on the river or road, the band rebuilt when the window grows
  (margin 3 → 9 tiles), and a room keeping its surround. `play_ui.mjs`
  camera check rewritten to the new rule (fails on c6850ad).
- **B** On the build just before b1185f9 (which differs only by keeping the
  old choice of surround pattern for walled maps; world_view and play_ui
  were re-run on b1185f9): unit 1866; ui 14/14, systems 4/4, folio, settings,
  learning_ui 14/14, create 382, title_ledger 13/13, shift_load 18/18 in
  both modes, story_ch1 F/mio, atlas check; layout audit of dialogue, help,
  challenge and six world states at 320x640, 390x844, 844x390, 1280x800,
  1920x1080: 45/45 clean.
- **S** Every outdoor map small enough to show its edges, captured at
  390x844 (14 maps) and 1600x397: woods, sea, orchard, snow and pines
  continue; floating places (co.lookout, sa.heart) keep their night sky.
- **B** `perf.mjs` c6850ad vs the fix (same container, two runs at
  1280x800 @1x, one at 390x844 @2x): steady frame work unchanged within
  noise — outdoors 1.8–2.8 ms before, 1.9–2.8 ms after (one 3.5 ms reading,
  sb.hamlet on the phone size); first static build per map about 12 %
  longer on average (−16 % to +30 % across readings; the band past the
  edge), still done during the door transition.
- Limitation: on very short windows (e.g. 1600x397, landscape phones) the
  sheet is taller than half the screen, so both positions overlap the
  player and it stays at the bottom; the portrait and name tab still show
  who speaks.
- **B** Full default suite `node tests/e2e/run.mjs` on b1185f9: **20/20
  scripts passed** (the 19 before plus world_view), including Shift/Load
  18/18 in both modes, every per-chapter story test, the Atlas check and
  the whole game `pursue.mjs E mio` (739 s).

## Playtest fixes — player report of 2026-09-28
Key as above (**B** browser, **U** unit, **S** inspected by eye). Headless
Chromium in this container; touch emulated; no real devices. Three parts
were built by parallel workers in their own git worktrees and merged here
(equipment 7025909/16f303f → c1f212c; combat 9c9d73c..8ce638e → c99a516;
handwriting 82b2789/8e274f7 → ce42be9); every merge was rebuilt, validated
and re-tested on the merged tree.
- **B** Reproduced before fixing (on c6850ad/fd61367): the opening road's
  lantern stays a dead-lantern prop after `rw_road_lit`; the door of the
  first house is walkable; the warehouse re-entry spawns at 4,7 beside its
  mat (5,7); the Lantern Hall gathering scene has Nao speak while no
  companion NPC is on the map (the whole-game audit listed 54 lines by
  absent speakers across the game); the route chart places Reedwake west of
  Saltglass while every direction line, signpost and road exit puts it
  east; play time is added only in the free-walking world mode.
  `tests/e2e/world_fixes.mjs` fails on the old build from its first checks.
- **B** `tests/e2e/world_fixes.mjs` (new): lantern lit; shut door solid and
  says so; warehouse spawn on the mat; Nao walks out (4 steps) and fades,
  and walks back in; nobody speaks in the Lantern Hall without being there;
  at night the road out holds you in Reedwake with a reason; rendered
  moments differ (breathing, sway) and are identical with reduced motion;
  chart order; chapter banner at the top (416×93 at 1280×800), sliding in
  from the left and out to the right, place name after it; play time runs
  during dialogue. All ok (repeated).
- **U/B** Validator rules added: dead lanterns with scenes need a lit twin
  or `staysDark`; door spawns on the interior's mat and interior exits in
  front of the door; hold scenes exist. `node tools/validate.mjs`: no
  errors.
- **B** Whole-game speaker audit (pursue.mjs now reports it): with
  walk-ins, E/nao and E/ren runs reached ch1–ch6 and the first Atlas
  expedition; the only bodiless lines left are the mill echo, the kiln
  warden (a visible foe), Tomoe's memory, the observatory lamp and the
  Still Archive memory shelf (all intended, marked); ~40 walk-ins reviewed
  (send-off on the road, harbour arrivals, Lanternfall arguments, epilogue
  visits). Two wrong ones found and fixed: memory voices walking in
  (marked `!speakerless`) and Tsuru's Atlas introduction firing on an
  expedition map (the hand-over now only fires in the Lantern Hall).
- **B** Combat (worker): `combat_ui.mjs` 6/6 (Harmony band and card,
  keyword cards by hover, focus and tap, New markers, Heat status);
  **U** combat_rules and combat_fairness (Heat numbers equal applied damage;
  no foe uses a move before its answer is learnable: mill boss Heat, ch2
  moth/sluice Gathering, ch5 blot/stacks Hush fixed). `story_ch1` checks
  みず is known right after the mill gears. Boss theme checked by
  `audio.check.mjs` at signal level only — nobody has listened to it.
- **B/U** Handwriting (worker): `pad_kanji.mjs` 8/8 (Kanji or kana chosen
  and remembered, 水 accepted for みず with a note, unknown-kanji message,
  kana-only unchanged, look-alike ordering, chart, 320/360 px at 200 %);
  recognizer measurements in docs/RECOGNITION.md (kana-only pad identical
  to before on 4,592 outputs; kana misread as kanji 75 → 3). No real human
  handwriting.
- **B/U** Equipment (worker): `equipment.mjs` (keepsakes change the world
  sprite, battle party and portrait in pixels; tags for all 27 wearables;
  Equipped marker; 320 px at 200 %); unit equip.test. Found: keepsakes were
  drawn only on the world sprite, and several were invisible (0 px).
- **B** After the merges: the furigana audit caught response-card readings
  in the old light colour (1.1:1) — fixed; `play_ui.mjs` camera check made
  to wait for a walking step to finish (a 1-px flake under load came from
  the player still moving, not from the dialogue); battle party breathes.
- **B** Full default suite `node tests/e2e/run.mjs` on bbee0e2: **24/24
  scripts passed** (adds equipment, world_view, world_fixes, pad_kanji,
  combat_ui), including the whole game `pursue.mjs E mio` (767 s).
  **U** 3074 passed.
- **B** `perf.mjs` (same container, c6850ad vs the world-fix build): steady
  frame work unchanged within noise with breathing and sway on (about
  2–2.6 ms outdoors on both).
- **B** Final layout audit on bbee0e2, `visual.mjs --check` (same states
  and checks as the overhaul audit above): English labels, 8 viewports
  (320x640 … 1920x1080): **448/448 clean**; Japanese interface labels,
  320x640, 390x844, 1280x800: **168/168 clean**.
- **B** Whole-game matrix on bbee0e2,
  `node tests/e2e/matrix.mjs FEIA nao,mio,ren,suzu 3`: **16/16** — every
  learning profile × companion played a new campaign through chapters 1–6
  and the first Atlas expedition (10.9–13.1 min each, three at a time).
- **Choice order (player report, same day: "the correct answer choice was
  almost always the first option").** Reproduced: `choicesFor` showed a
  multiple-choice question's options in the order written, and the right
  option is written first in 657 of 667 authored questions (chapters,
  battles, side stories, Atlas) and in every generated "What does this word
  mean?" question. Fixed in src/ui/65_challenge.js: the options are
  shuffled, seeded by the question and the review clock (steady while a
  question is open, different at the next asking); the right answer is
  still marked by its data, not its place.
  - **U** tests/unit/choice_order.test.mjs: every authored question plus
    120 generated ones, 12 askings each — same options and right answer,
    step not reordered, order steady on redraw, the right option moves in
    every question; right option first **32.4%** of 9,444 askings (chance
    32.3%), four-option places 427/396/419/402; write steps in choice mode
    also at chance. On the old code the same test fails: first 98.7%,
    places 1596/48/0/0. A wider sweep (237,780 generated four-option
    questions) put the right option in each place 25.0%.
  - **B** combat_ui.mjs "multiple-choice questions in battle": real battles
    (Unravel, choice mode), one learner across battles, the right option
    found on screen by its own text: new build — 17 meaning questions,
    right option at places 0,1,2,3 (5/5/2/5); the old build (bbee0e2) —
    **0 in all 17**. Full combat_ui 7/7 and learning_ui 14/14 on the new
    build; atlas.check passes; unit 3084 passed; validator no errors. The
    full suite and the matrix were not re-run for this one-function change
    (they answer through the test solver, not by position).
- Not verified: how the new boss music sounds; real handwriting; real
  phones; the Atlas intro hand-over was changed by reading the code path
  and re-running the whole game, not by a dedicated test.

## Sprite and battle polish — owner's brief of 2026-09-28 (amended)
Key as above (**B** browser, **U** unit, **S** inspected by eye). Headless
Chromium in this container; touch emulated; no real devices; Firefox and
Safari are not installed here.

The work was built by parallel workers in their own git worktrees and merged
here. Every merge was rebuilt, validated and re-tested on the merged tree.
- backdrops: 10e408d..5272dca → 1594aa9
- characters: c2c5890..ee4216d → 0b47c13
- battle presentation: 6bd658c..0b83dc7 → ecb584b

The world fixes were made directly on this branch (0c78eca, 0c4d36d, 8706340).

- **Next button after a battle — reproduced before fixing (B).**
  - My first probes started from a debug state. There the dialogue sheet is created during the battle, after the battle overlay, so the bug did not show.
  - A mouse-only replay that first creates the sheet (as the opening scenes do in real play) reproduced it. The top element at Next was the overlay's empty Respond dock (`.cb-dock`). Every click on Next was "STUCK after 4 clicks", while Z advanced.
  - After the fix, the same replay gives "on top of Next: button" and "advanced after 2 clicks". The first click completes the typing; Z behaves the same.
- **B `tests/e2e/encounters.mjs` (new, 19 checks, 1600×816).** The dialogue sheet exists before the battle, and all input is the real mouse and keyboard.
  - **The moth on the mill road:** it is met by walking up to it and pressing Z. It fights outdoors (`reedwake` backdrop) with its own intro. The intro is clicked through with Next (the overlay is not on top), and the exchange is answered by mouse.
  - **The last line:** it says the moth leaves "over the mill roof" (no window). The click that finished the exchange did not dismiss it. Next returns to the mill road with the win recorded once, and no line was skipped.
  - **Z separately:** Z advances the intro and the last line.
  - **Inside the mill:** the mill interior and the window line.
  - **Two more places:** the wheel-pit Reedling and the path Frost Wisp.
- **B `tests/e2e/departures.mjs` (new, 14 checks). The original sequence:**
  - A fresh campaign in which everyone has been talked to. Facing Tsuru and pressing Z runs her report and then the kana lesson (paged, practice skipped).
  - Nao, Ren and Suzu then head for the north road, tiles (22–23, 0), toward `rw.millroad`, for the reason "destination". A door was nearer for each: the tea house at 6 and 5 steps, the apothecary at 11.
  - They walked only on open ground and were gone in 7.2 s.
  - **Map change and save/load:**
    - On the mill road the four stand exactly once.
    - After loading the save, the village has neither them nor anyone mid-walk, and Tsuru is still there to talk to.
  - **A second destination:** in the evening gathering they go to the Lantern Hall door (21,8), and Hana goes into the tea house (30,15).
  - **Detour:** someone leaving steps round the player standing on their route.
- **B Whole-game departure audit** (`pursue.mjs E nao`, before the art merges, 774 s, all chapters and the Atlas, no problems). It recorded 62 comings and goings.
  - 23 used the nearest way.
  - I reviewed them: people standing in their doorway already, and arrivals with no known origin.
  - As a result, arrivals now come from where the story keeps a person, and a person in the doorway just goes (8706340).
- **U/B Backdrops:**
  - Unit `battle_places` (555 checks): every placed foe is composed, every piece traces to the map, no interior outdoors, the seed changes accessories only, a room's structure is the same from any tile, and riverbank, inland and mill positions differ.
  - B `backdrops.mjs` (61):
    - The mill-road moth sees the mill front and wheel; the mill1 moth sees the ladder, gears, millstone and stairs; the reading room has none of those.
    - Six seeds give one structure and six accessory sets.
    - Locality differs on the mill road, the village and Saltglass.
    - The static layer is pixel-identical through turns, hits and states, and a resize keeps the same selection.
    - Two seeds give identical battle state, with no `Math.random`.
    - No accessory pixels fall in the creature or party boxes.
  - Build time is 2.5–9.4 ms per composition. Battle frame cost rose by +0.04–0.23 ms.
  - **S** I inspected the captures: the moth outside and inside, and riverbank vs inland in the village.
- **B/S Characters (`characters.mjs`, 23):**
  - 149 looks × 4 directions × 17 frames are the standard size, not blank, anchored and unclipped.
  - One-sided details stay on their real side, and depth sorting holds.
  - 5 figures × 129 battle frames: feet planted, accessories present in every pose, reduced motion still, and the two idle timings differ.
  - `perf.mjs` shows no change within noise.
  - **S** I inspected the pose sheets, the road cast and the battle composition.
- **B Battle presentation (`battle_anim.mjs`, 16):**
  - Choice, typed and handwritten answers reach the same sequence. Wrong or cancelled answers play nothing, and rapid clicks add nothing.
  - Strike on one target and Sweep on both: each target reacts.
  - Blocks: full block, partial absorb, plain damage, and a raised seal.
  - States: Heat, Shroud, Hush and Gathering are each applied, persistent and cleared.
  - The rules run once per exchange, and the screen ends equal to them.
  - Robustness: reduced motion, hurry, hidden tab, resize, and three encounters with nothing left over. The finishing line was advanced once by mouse and once by Z.
  - Timing: a response takes about 1.14 s and an enemy move about 1.0 s. Frame cost is 1.5–1.7 ms average and 11–15 ms maximum during sequences.
  - **S** I inspected the exchange strips and the galleries (docs/screenshots/battle/).
- **B A recording of real play** (`tests/e2e/battle_video.mjs`, docs/screenshots/battle/play_moth_outside.webm, 33 s):
  - It walks up to the mill-road moth, then uses the mouse only.
  - It shows the intro, Unravel on paper, a knot loosened, the Shroud and 光 clearing it, its Strike (−2), the last Unravel, and the last line advanced with Next.
  - There were no page errors. **S** I viewed the frames at 13 timestamps.
- **B Full default suite `node tests/e2e/run.mjs` on ecb584b:** 29 of 29 scripts passed. It adds encounters, departures, characters, backdrops and battle_anim, and includes a whole-game `pursue.mjs E mio` run.
- **U / validator:** 3653 unit checks passed; `node tools/validate.mjs` reports no errors.
- **B Final layout audit on c113f3a** (the ecb584b game plus docs), `visual.mjs --check`, same states and checks as before:
  - English labels at 8 viewports (320x640 … 1920x1080): **448/448 clean**.
  - Japanese labels at 320x640, 390x844 and 1280x800: **168/168 clean**.
- **B Whole-game matrix on c113f3a**, `node tests/e2e/matrix.mjs FEIA nao,mio,ren,suzu 3`: **16/16**. Every learning profile × companion played a new campaign through chapters 1–6 and the first Atlas expedition (10.9–12.9 min each), with the new road figures and departure routing. These runs answer battles through the test solver, so they check that the game can be completed, not the battle presentation.
- **Not verified:**
  - Firefox (the owner's browser) and Safari. The Next-button cause is a stacking order that holds in any browser, but the fix was run only in Chromium.
  - Real phones or touch hardware, and phone frame rates.
  - A human judgement of the new art and motion.

### Follow-up: player report of 2026-09-29
- **Duplicate Tsuru after the Mill, reproduced from the content and code.**
  - In `rw.bridge_scene`, `!set rw_koji_back` + `!refresh` hid Tsuru's evening placement (`tsuru_out`, condition `!rw_koji_back`), so she walked off toward the Hall.
  - Her next three lines then made `ensureSpeaker('tsuru')` walk a second Tsuru in: it matched by placement id, and walkers leaving weren't counted.
  - Before that, while she still stood there as `tsuru_out`, a `tsuru:` line would also have walked a duplicate in (id ≠ `tsuru`).
  - The whole-game speaker audit had been masked by those duplicates. It too matched ids only (hana_out, tsuru_out, the Saltglass harbour cast).
- **B `departures.mjs` §5 (the real bridge scene in a fresh page):**
  - At most 1 Tsuru on screen for the whole scene, and 1 for every one of her 38 sampled line frames.
  - At nightfall she heads to the Lantern Hall door (21,8).
  - No one is drawn twice.
- **B `departures.mjs` §6 (a same-person move):** Tsuru's placement moves from 21,15 to `tsuru_out` at 27,17 on the same map. One figure walks there, fully visible.
- **B `equipment.mjs`:** the Satchel preview shows Front, Side, Back, In battle and Portrait, in order. **S** I inspected it at 1064×783 and 390×844.
- **B/S Side profile:**
  - The mouth was drawn 2 px outside `FACE_S`, and is now a notch on the face edge.
  - The nose tip is joined to the face.
  - `characters.mjs` 23/23; I inspected the side views of seven looks at 5×; the road review sheets are refreshed in docs/screenshots/after/characters/.
- **B Suites on 61e7e0e:** characters, world_fixes, play_ui, encounters and departures pass. Unit 3653; validator no errors.
- **B Whole game `pursue.mjs E nao` (8a498fe, 767 s):**
  - All chapters and the Atlas, no lost battles, no problems.
  - **Nobody drawn twice**; pursue.mjs now fails if anyone is.
  - Unseen speakers: only the 8 intended lines (mill echo, kiln warden, Tomoe's memory, the observatory lamp ×3, the Still Archive memory).
  - 32 walk-ins to speak.
  - 49 comings and goings; 3 used the nearest way (arrivals with no known place: Mochi, Tōya, Tae).
- **Multiple enemies at once: none**, confirmed from the code.
  - `RB.combat.start` / `RB.combatLogic.init` take one enemy.
  - Story `!battle` commands: 7, including the Hush's retry path.
  - Map foes: 49, each its own battle.
  - Atlas rooms: a guard and/or one roaming foe, each its own battle; climaxes are single.
  - (Superseded by the next section: groups now come at some placements.)

## Groups of creatures, the companion's turn, the difficulty curve — lead's brief of 2026-09-29
Key as above (**B** browser, **U** unit, **S** inspected by eye). Headless
Chromium in this container, touch emulated. Built in a worker's git worktree
(branch `worktree-agent-a8728f8cb6f184752`, from ba6869d); the lead merges it.

- **U `node tests/run-unit.mjs`: 4431 passed, 0 failed** (the final commit). New or extended:
  - `combat_rules`: group state and accessors, the knot shares, targets, reach per word, per-creature turns and settling, the win after the last, techniques in a group (single-creature numbers unchanged), the companion's actions and their uses, the passives folded into actions (none happens by itself), staggered patterns, a slip costing at most 1 per exchange whatever the group (none in assisted mode), the late-alliance actions (Take half splits a blow and adds up to it; Grand gesture draws both creatures; Raise the lamps breaks the Hush and the mist; Stand in front wards you by 3), battle resolve 14/12/10.
  - `combat_fairness`: every move of every group creature is answerable with the words known there; story groups only at the Stacks and the Conduits; seeded Atlas groups within size (one more on Standard, two on Demanding) and made of the Atlas's regular creatures.
  - `combat_curve` (new, 287 checks): the difficulty curve (docs/COMBAT_NOTES.md, whose tables it prints), and the whole-game driver's solver against every story group at every setting with every companion.
- **Validator:** `node tools/validate.mjs` reports no errors (it now checks group ids and sizes).
- **B Browser suites on 30a0782** (each script run on its own, in this order): combat_ui 7/7, battle_anim 16/16, companion_turn 3/3 (new), battle_group 6/6 (new), encounters all ok, backdrops 61/61, systems 4/4, ui 14/14, learning_ui 14/14, atlas.check exit 0, equipment exit 0.
- **B On the final commit** (its index.html differs from 30a0782 only by the link effect for Nao's "take half" in 82_battle_seq.js): companion_turn 4/4 (with the late-alliance test), battle_group 6/6 with `--docs`, battle_anim's exchange capture with `--docs`.
- **B `battle_group.mjs` (new, 6):**
  - Counts: the Stacks (w1) and the Conduits (g1) at Relaxed/Standard/Demanding give 1/2/3 creatures, with one slip each in a group; a seeded Atlas room's guardian 1/2/3; the Atlas guardian's attendants 1/2/3.
  - Targeting with the real mouse (a pixel of the creature on the stage, its slip), the keyboard (Tab to the slips, ArrowRight in stage order with visible focus, `]` and `[` from the responses) and touch (a tap on the creature and on a slip at 390×844); the bracket, the slip, the telegraph and the cards' "on the …" labels follow; a radio group with labels and "Target: …" announced.
  - Previews: Unravel marks the target only, water all three, healing you both; keyboard focus previews; kept while the step is open ("on all three" in the task); gone after "Choose a different response", with the rules never called.
  - A Demanding trio of moths played out by mouse: each creature has its own sequence, in order; one settles (its slip, its pose, its line, the target moves on) while the others act; every enemy exchange's resolve lost equals its hits and names its creature; one response and one creature exchange per round; won, the placement's flag set once.
  - 320×640, 320×640 at 200 % text, 1280×800 reduced motion and 844×390: nothing off the side, three slips of at least 44 px, the row of slips as tall as its fullest slip, the scene and the preview marks still under reduced motion, the fight played out and Next on top after it.
  - Captures: tests/e2e/out/battle_group/ (WebP copies in docs/screenshots/battle/group_*.webp).
- **B `companion_turn.mjs` (new, 4):**
  - After the response's step: the menu (the queued response, "Back to <name>", Mio's two actions, no task), the rules not yet called and the state unchanged; one language step so far.
  - Back by click, then by Escape: the choice again, the rules untouched, resolve, knots, Harmony and uses exactly as before.
  - Confirmed: `playerAct`, `compAct`, `enemyAct`, `endRound` in that order; Unravel freed its knot once; then her draught; on screen the response, her action, then both creatures in turn.
  - Unlocks for all four companions along the story (1, 2, 3, 4, 5 actions; nothing taken away; the quest's action needs the quest); Suzu's menu before and after chapter 2; "Draw its eye" marked New and announced once, not again next exchange; remembered in the campaign's tips.
  - Previews: Heckle the target, the Grand gesture both creatures; another creature chosen during her menu is marked and heckled, while your own target stays yours.
  - The late alliances on screen (both creatures' moves set to a Strike at you): Nao's Take half shares every blow (hits on both of you, "Nao takes half of it" in the log); Suzu's Grand gesture sends both blows to her; Ren's Stand in front puts a 3-point ward before you; the screen ends equal to the rules; no page errors.
- **Fixes the new tests found:** keyboard-focus previews had never worked (focusin/focusout have no on… properties in browsers; now listeners), and the card focused for you at the start no longer previews until you move; the companion's menu stayed on screen, pressable-looking, during the exchange (now cleared); a phone's row of slips was stretched to one-per-line height by a column flexbox (now a grid: 48 px instead of 150 px at 390×844); a short portrait phone's telegraph is tighter.
- **S** I looked at every capture in `tests/e2e/out/battle_group/` (a pair with the target bracket, a trio with the water preview, a trio on a phone, the companion's turn), at 320×640 with one and three creatures, and at the three refreshed exchange strips in docs/screenshots/battle/.
- **B Whole game `pursue.mjs E nao` (30a0782, 781 s, Standard):** all six chapters and the first Atlas expedition; 10 battles, none lost; no problems, no page errors, nobody drawn twice; 49 comings and goings (3 by the nearest way). Groups met: 1 (the Atlas cartographer with a stray, won in 4 exchanges). The companion's actions taken by the solver: Spot the opening 20, Call out its aim 14, joining the technique 6. The driver fights only what stands in its way, so it met none of the Stacks or Conduits groups; the driver's own solver (`RB.test.battle`) plays every one of them at every setting with every companion in unit `combat_curve` (all won, no problems), and battle_group.mjs plays one through the screen.
- **B Whole-game matrix `matrix.mjs FA nao,suzu 2` (30a0782): 4/4** — F/nao, F/suzu, A/nao, A/suzu each played a new campaign through chapters 1–6 and the first Atlas expedition (12.4–12.9 min each). The matrix does not print the groups met.
- **B Layout audit of the battle states on e03fc56** (`visual.mjs --check --only combat,combat_f,combat_step`; they are single-creature fixtures, and the shorter telegraph on short portrait phones applies to them): English labels at the 8 viewports: **24/24 clean**; Japanese labels at 320x640, 390x844, 1280x800: **9/9 clean**. The group layouts are checked by battle_group.mjs §5 instead.
- **Not verified:** Firefox, Safari and real phones; a human judgement of the formation and of the companion's menu; the 320×640 portrait stage stays at its 60 px minimum (as with one creature).
