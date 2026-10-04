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

## Title screen — player report of 2026-09-29
Report: the book looks oddly placed for the table's perspective; the water
lines clip over the bridge; the stars are too static (a shooting star or
comet was suggested); and it is hard to tell whether the view is a window.
- **What the view is:** the open doorway of a roadside inn at dusk, looking out from the threshold, past the writing desk, to the lantern road, the river and the bridge.
  - The old frame had a rolled blind across the top, which read as a window. It now has sliding paper doors pushed open at each side, a short noren under the lintel and a threshold sill.
  - The noren is drawn only when the title sits beside the folio, so it never crosses the title.
- **S The book:** it now lies closed and flat on the desk top. The desk shows its top face, and the book is drawn in the desk's perspective: a foreshortened cover, a page block, the binding and a ribbon over the edge.
- **S The bridge, reproduced from close-ups (3× captures of the committed build):**
  - Water glints drifted across the arch.
  - The bridge lantern's reflection was drawn about 30 px too high, so its dashes sat on the arch and the centre pier.
  - Fixed: the glints keep clear of the bridge with margin for their ±3 px drift. The reflection is mirrored about the water line, squashed like the bridge's own, and so sits in the water below it.
- **The sky:**
  - Stars twinkle on their own beats; bright ones sparkle at their peak; one flares now and then.
  - A shooting star every 7–19 s, a comet every 70–140 s.
  - Stars appear only in open sky: never behind the title's words (measured from the page, and again when the text size or fonts change), the moon or the ridges.
  - With reduced motion, everything holds still.
- **Layout, found while checking:**
  - At 900×1000 (the title centred across the top) the noren crossed "The Road of" and the moon sat behind 「の道」.
  - At 1280×800 and 844×390 the title's first letters lay over the open door's paper.
  - At 844×390 the moon was hidden behind the folio.
  - On portrait phones the new star filter left almost no stars.
  - All fixed: the scene follows the page's title layout, and the title's left padding clears the door.
- **B `title_ledger.mjs`:**
  - "title scene" at 1280×800 (beside), 900×1000 (centred), 390×844 (tall) and 844×390 (short landscape): layout detected, noren only where expected, more than 10 stars, and the moon's disc clear of the title's words and the folio; beside the folio, the title starts past the door.
  - "title sky": a shooting star and a comet appear when hurried; with reduced motion the sky is still.
- **S Captures inspected:** 1280×800, 900×1000, 900×865 (a foldable's inner screen), 390×844, 844×390 and 667×375. Bridge close-ups at 1280×800 and 390×844, before and after. No page errors.

## Quest guidance — owner's question of 2026-09-29 (hints in the ledger, map markers)
Branch worktree of `claude/stoic-sagan-n3jvgk` from ba6869d. REQUIREMENTS.md G1–G6.
- **U `tests/unit/quest_guide.test.mjs`** (54 checks, all pass):
  - Every stage of every quest (33 quests, 121 stages): 116 have a derived
    place, 1 is authored (`rw_depart` 1: no scene finishes it; the coast
    road), 4 are set and passed within one scene (`lf_form` 0–1, `lf_mio`
    0–1), 0 missing. `QG_LIST=1 node tests/run-unit.mjs quest_guide` prints
    the list.
  - Live analysis on built states: "ask around the square" → Mio, Nao, Ren,
    Suzu, Hana (not Tsuru); half done → only those not yet helped (Hana,
    Suzu, the two lanterns); one lantern lit → the other; all done →
    Tsuru; Chapter 2 → the three contradictions, not the Drowned Archive
    (not reachable yet); "ask at three places" → Asahi, Kiyo, Genzō;
    Chapter 3 → Ume, Gorō, Isao; "look around" → too many, none marked;
    `lf_akari` 0 → waiting (Akari not targeted before the bell).
  - 465 generated nudge and "Next:" lines: valid markup, furigana on every
    kanji, every word known to the lexicon, English present; every target
    prop has a name.
  - Following: the main road by default (this chapter's; not the never-closed
    `rw_depart`), follow, unfollow, finished quest hands back; an old save
    without `follow` validates, loads and follows the main road; a new
    campaign has no `follow` field; the setting defaults to markers and hints;
    every map belongs to a chart place.
- **B `tests/e2e/quest_guide.mjs`** (added to run.mjs; 50 checks, all pass):
  derived targets in the page for Chapters 1–6; the diamond centred above
  Suzu's head (renderer positions), on the south lantern, an edge pointer
  at the right edge for the east lantern, Tsuru not marked; hidden during
  dialogue and a battle, back after; bobs (pixel scan over time: 5 heights)
  and holds still with reduced motion (1 height); the Journey lists the
  followed quest first, "Following", four "Next:" lines with directions;
  nudges 1 → 2 → "Show on the map" (the Map opens with the chart's next-step
  mark in Reedwake and "you are here" kept, the quest followed); learning
  stats and mastery byte-identical after the nudges; following a side quest
  reorders the list, keeps focus and moves the arrow to Kiku's door (17,28 →
  rw.house2); unfollowing hands back to the main road; Settings › Quest
  guidance → Hints only (no markers, no Follow/Next, two nudges, nothing on
  the chart) → Off (objectives only); Japanese labels (追う, 手がかり with
  furigana, English for screen readers); rw.road: the edge pointer toward
  the exit to the village (31,9) and, closer, the arrow over it pointing
  out; Snowbell: the arrow leads to the inn; phone 390×844 with touch
  controls: edge pointers stay between the HUD and the touch pad, guidance
  buttons ≥ 44 px; 320×640 at 200 % text: no sideways overflow; no page
  errors. Screenshots in tests/e2e/out/quest_guide/, WebP copies in
  docs/screenshots/quest_guide/ (all inspected by eye).
- **B Whole-game audit `node tests/e2e/quest_guide_audit.mjs E nao`**
  (driver plays a new campaign through Chapters 1–6, following the main road
  by default): 901 scenes started in the world while a quest was followed;
  54 of them moved the followed quest on; 52 had been pointed at by the
  guidance just before; 2 not marked by design (`rw_labels` 0→1 by Tsuru's
  quiet bookkeeping update while the five people were marked; `co_main`
  1→2, "look around", more than six places); 0 misses. Analysis time per
  fresh state (uncached): median 15 ms, 95th percentile 38 ms, max 79 ms
  (in play it is cached until the state changes). A first run counted
  arrival scenes as misses because their once-flag is set just before they
  run; the audit now asks as of the moment before.
- **B Layout audit** `visual.mjs --check`: journey, journey_guide (new:
  "Next" and two nudges shown), map, settings, settings_guide (new),
  world_rw, world_sg at 320×640, 390×844, 1280×720 — all ok; with
  `--lang ja` at 390×844 (journey, journey_guide, map, settings,
  settings_guide) — all ok.
- **B Suites on the final build** (index.html of e13a62a): folio,
  settings, play_ui, world_view, world_fixes, departures, ui, systems and
  quest_guide (50 checks) all pass. world_view.mjs: its phone "camera
  unchanged when the dialogue opens" check is timing-sensitive (the first
  camera read can fall while the view eases in under the touch reserve).
  With a whole-game run in parallel it failed on the base build ba6869d
  (1 of 3) and on this build (3 of 3); without load this build passed 12 of
  13 runs (this one included) and the base 11 of 11 (the failing run read 118.5,31 → 118.5,55,
  i.e. mid ease). No quest is set in that test, so the guidance code draws
  nothing there.
- **U** unit suite 3707 pass; validator no errors (it now checks stage
  `hint`/`at`).
- **H** Not verified: whether markers make the game too easy or help the
  right amount (needs players); real phones; Firefox and Safari.

## Long quest lines — owner's request of 2026-09-29
Built by a worker on its own branch (from ba6869d), then merged into the task
branch (5feb4a0) and re-run there. REQUIREMENTS.md L1–L7.
- **Worker's runs on its branch:**
  - Validator: no errors. Unit: 3681.
  - `long_quests.mjs --fixtures-only --all-companions`: 183 checks, 237 s. Both lines are walked through the real maps by the driver, for every companion, including the side area, the ally flags, the rewards, an old save loaded through a real slot and a post-ending save. Nobody was drawn twice, no speaker was missing, and there were no page errors.
  - Whole game with both lines as goals: E/Suzu (821 s) and I/Nao (880 s) both finished both lines. `pursue.mjs E mio`: 838 s.
  - departures, world_fixes, story_ch1 F mio, side_ch3, story_ch3–ch6, systems, equipment and characters all pass.
- **B On the merge (5feb4a0):** rebuilt; validator no errors; unit 3681; `long_quests.mjs --fixtures-only` passed (113 s); departures and world_fixes pass.
- **B With the quest guidance merged as well:**
  - Two gaps between the branches were found by `quest_guide.test.mjs` and fixed: the persimmon tree prop had no name for the markers, and the Koharuno maps had no place on the route chart (now `place: 'reedwake'`).
  - `QG_LIST=1`: every stage of both lines is authored (15 stages); 0 missing.
  - Unit 3749; validator no errors.
  - long_quests (fixtures, 109 s), folio, settings, play_ui, world_fixes, departures, ui (14/14), systems (4/4), equipment, story_ch1 (8/8 runs) and quest_guide pass.
- **Not verified:** a native speaker's review of the new Japanese; how the pacing across chapters feels to a player.

### Chapter 1's last main step never closed (found by the quest guidance worker)
- **The bug:** `rw_depart` stage 1 ("Take the lantern road west") was never marked done, so from Chapter 2 on the Journey kept "Two Names" under "Now — the main road".
- **The fix:** Chapter 2's arrival scene `sg.arrive` now closes it quietly. For saves made before the fix, the Journey reads a main-road quest from an earlier chapter as completed without changing the save.
- **B `quest_guide.mjs`:**
  - An older Chapter 2 save with `rw_depart` at stage 1 shows "Two Names" as Completed, the save still holds it open, and the main road shown is `sg_main`.
  - Running `sg.arrive` marks it completed.
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

### Merged into the task branch (with the title screen, the long quest lines and the quest guidance)
- Conflicts were only in docs and `tests/e2e/run.mjs`, and both sides were kept. The group checklist items were renumbered E1–E12, because the quest guidance already uses G1–G6.
- **U / validator on the merge:** unit 4527 (including combat_curve); validator no errors.
- **B on the merge:**
  - battle_group 6/6, combat_ui 7/7, battle_anim 16/16, learning_ui 14/14, pad_kanji 8/8, ui 14/14 and systems 4/4.
  - encounters, backdrops (61/61) and atlas.check pass; long_quests (fixtures) passes in 117 s.
- **Two test weaknesses showed up under load** (another worker's suite was running at the same time). Both are fixed in the tests; the game was not at fault.
  - `companion_turn.mjs` assumed the response's step was always multiple choice.
    - Sometimes it is putting pieces in order, depending on timing. It failed 3 of 5 times under load; labelled waits showed the step open with tiles.
    - The test now answers either kind with the mouse. Forced to the ordering kind once, it passed (3 steps put in order); then 5 of 5 passed normally.
  - `quest_guide.mjs` "with reduced motion it holds still" failed once with rows (30, 4).
    - Its pixel scan covered 60 rows above Suzu. When she idled a step, a lantern's amber shade entered the column 26 px higher.
    - The scan is now limited to the band where the diamond is drawn. It passed again: the marker held at one row with reduced motion and bobbed across 5 rows without.


## Every kanji on the pad, and the chart — owner's brief of 2026-09-29

"Expand recognizable drawn kanji to cover every kanji present in the game,
with pages in the chart to cycle lists of kanji by type … the chart option in
battles can have a search function" (守る, a default response, could not be
written or practised on Elementary). Worker branch, headless Chromium 1194 /
Playwright 1.56.1 / node v22, Linux, 4 cores. **B** = browser test, **U** = unit
test, **T** = measurement tool, **S** = screenshot inspected by eye.

- **U Coverage** (`tests/unit/recog-coverage.test.mjs`): the game displays
  1,547 distinct kanji (text of string/template literals in every built source
  file); all have KanjiVG data (1,548 with 王, one of the first 33); no stale
  data; every kanji but 々 has a reading for its furigana; the readings table
  is current; every clean reference reads as itself (1,548/1,548, all
  `confident`); 守 from 21 held-out samples: first reading 21/21 in the
  kana+kanji pad, always in the first five; 守 in its standard order gets no
  stroke-order note, with two strokes swapped an order note; the kana/kanji
  pairs within 0.09 are exactly the declared one-shape pairs, and the answer
  checker folds the same ones.
- **T Kana unchanged** (`node tools/kanjivg/kanaparity.mjs --n 3`, ba6869d vs
  this branch, kana-only pads, run on the final code): 6,888/6,888 held-out
  results identical (status, candidates with distances, size hint, reading
  notes), and 1,036/1,036 more (AnimCJK and Tomoe kana, 200 nonsense
  drawings); kanji hint and kanji-like unchanged on all of them; median time
  per call 4.5 → 7.1 ms (the kanji hint now looks through 1,548 kanji).
- **T Accuracy** (`node tools/kanjivg/eval.mjs --kanji --n 10 --kanji-n 2`): see
  docs/RECOGNITION.md "Every kanji in the game, 2026-09-29" for the table.
  Kanji held out (1,548 × 7 families × 2 = 21,672): top-1 99.8 %, top-5
  99.8 %, `confident` 97.2 % with precision 100.0 % (kanji pad and Kanji or
  kana pad; exact 99.3 % there, twins read as their kana); hardest family
  (mixed) 99.2 % / top-5 99.4 %; clean references 1,548/1,548. Tomoe's
  hand-entered game kanji (1,579, independent): top-1 98.7 %, top-5 99.3 %.
  Kana unchanged (hiragana 99.9 %, katakana 99.7 % in their pads); kana in
  the Kanji or kana pad 98.2 % (a kanji first 7× of 11,480); kana/kanji
  lookalike sets 99.6 % of 2,430. With kanji reading off, the hint names the
  drawn game kanji 96.5 % (21,560). Kanji the game does not use (Tomoe, held
  out half): `confident` as a game kanji 8.7 %. Node: median 11.3 ms, p95
  24.1 ms over 142,957 calls.
- **U Classification and search** (`tests/unit/kanji_chart.test.mjs`): an
  entry for all 1,548; themes water 63, nature 70, living 80, body 137,
  places 102, time 89, mind 154, speech 127, actions 321, things 146, society
  55, qualities 134, other 70 (4.5 %); uses noun 1,265, verb 529, describing
  314, counters/numbers 51, names 40; 46 clear cases themed right; search 守 /
  守る / まもる / マモル / mamoru / Mamoru → 守 first, protect / to protect → 守
  in the first three, 水 / みず / mizu / water → 水 first, sea → 海 first;
  searches well under 25 ms; "met" from scenes, inscriptions and practised
  words.
- **B `kanji_chart.mjs` 8/8** (added to run.mjs; the final run on the final code):
  1. Elementary: 守 drawn with real mouse strokes (its KanjiVG reference, three
     moves per segment) is read as 守 with まも; る; 守る accepted "written
     with kanji", unassisted, no mistakes.
  2. In a battle (rw.reedling, Elementary, hand input): the "protect" response
     opens a pad that reads kanji; the chart from that pad; typing "mamoru"
     into its search changes nothing in the game (mode, word help, layers);
     守 / まもる / 守る first and protect → 守 in the first three, no kanji
     without furigana; ↓ reaches the first result, Enter opens it, Escape
     returns to the results with focus on 守; in the field Escape clears the
     search, then closes the chart; then 守 + る drawn by hand, accepted, the
     exchange resolves.
  3. Pages: Kana | Kanji by theme | Kanji by use, 16 page names checked (both
     kana, 8 themes, Other, the 5 uses); opens
     on Water and liquids; every kanji with furigana and no bare kanji
     anywhere; Next/Previous and the select move pages; 守 on Movement and
     actions; on Verbs 守 is met and listed before the unmet kanji, and only
     unmet kanji follow; the chart reopens on the page it was left on.
  4. Entry: 守 large with まも, readings, 6 strokes, 守る "to protect" with
     furigana, the stroke canvas; Practise: 守 drawn in the square → "Read as
     守 — that's it", "Stroke order and direction match the model"; 字 drawn →
     not taken for 守; 守 with strokes 4 and 5 swapped → an order note; Show
     the model toggles; Use in my answer → 守 in the answer, assisted, chart
     closed.
  5. Foundations, 390×844 touch: Words › Kanji chart (no task) → search まもる
     → 守 → no "Use" → practise 守 → read as 守; Escape steps practice → entry
     → results → cleared → closed, back on Words. A Foundations task pad
     (kana only) opens the chart on Hiragana, a kanji entry has Practise but
     no Use (with a note), a kana is still picked in one tap (assisted).
  6. Kana pad unchanged: み ず ア ン し ツ drawn with the mouse read as
     themselves; 守 there gets "Looks like the kanji 守, but kanji reading is
     off".
  7. Layout: 320×640 at 100 % and 200 % text, 390×844 and 1280×800 at 200 %:
     list, search, entry and practice have no horizontal overflow; search,
     page select, ‹ ›, every character, result, action and practice button
     at least 44 px.
  8. Browser speed (headless Chromium, this machine; four runs, the last two
     on the final code, one of them inside the default suite): kanji tables
     88–144 ms once (prepared in idle slices when a kanji pad opens); a
     kana+kanji reading of 120 jittered kanji: median 15.4–18.2 ms, p95
     29–35 ms, max 34–51 ms; the chart index 97–178 ms on first open, the
     first search 50–70 ms (builds the search keys), then at most 5–20 ms.
- **B `pad_kanji.mjs` 8/8**: the chart test rewritten for the new chart (kana
  pages by the pad's script, every kanji with furigana, picking assisted); a
  kanji outside the game is now 弦 as Tomoe entered it (林, the old stand-in,
  is a game kanji now): kana reading off → the plain message and Read kanji
  too, no kana; kanji reading on → "Not sure — pick the kanji you meant, if it
  is here, or look it up in the chart" with the closest kanji, Confirm after a
  choice.
- **B required suites, one after another on the final code**: kanji_chart
  8/8, pad_kanji 8/8, learning_ui 14/14, ui 14/14, combat_ui 7/7,
  battle_anim 16/16, create 382/382.
- **B default suite** (`node tests/e2e/run.mjs`, the build of f5e6b0c): 30/30
  scripts passed, including the story chapters, atlas.check and pursue.mjs E
  mio (whole game, 750 s).
- **U all**: `node tests/run-unit.mjs` 3,765 passed, 0 failed (final code);
  `node tools/validate.mjs` no errors.
- **S** Screenshots inspected: the pad reading 守 (まも) with 安 字 完 庁 午 as
  alternatives (final code); 弦, a kanji outside the game, drawn with kanji
  reading on: "Not sure" with 呟 to pick and the chart (final code); the chart's Verbs page (met kanji first, the rest dashed and
  muted); search "protect" in a battle; the 守 entry; practice feedback; the
  same at 320×640 and 200 % text (it stacks; the sheet's header wraps above
  the paper). Copies: docs/screenshots/after/kanji_chart/.
- **Size**: src/recog/10_strokedata.js 17 KiB → 185 KiB (189,299 bytes);
  index.html 4,953,466 → 5,234,631 bytes (+281,165, +5.7 %).
- **Not verified**: real handwriting of kanji by people (all accuracy numbers
  are synthetic distortions of KanjiVG or Tomoe's hand-entered templates);
  Firefox, Safari and real phones (headless Chromium only); the theme of every
  one of the 1,548 kanji was not checked by hand: 46 clear cases are tested;
  three samples of 70 were read by eye (**S**), the first two before the
  okurigana rule and the verb and keyword fixes they led to, the third
  (every 22nd kanji, offset 17) after: 64 of 70 expected or acceptable, 6
  debatable or wrong (御 → People and the body, 式 → actions, 福 → things,
  章 and 果 → Time and numbers, 割 → actions).

### Merged into the task branch (after the title screen, quest lines, quest guidance and groups)
- Conflicts were in docs, `tests/e2e/run.mjs` and `src/ui/55_settings.js`, and both sides were kept (the new pad help text and the Quest guidance choice). `index.html` was rebuilt.
- **Seven new kanji** came in with the long quest lines: 冴 刃 匙 液 縫 貯 郷.
  - `recog-coverage.test.mjs` named them. `tools/kanjivg/fetch.mjs`, `convert.mjs` and `tools/kanjiread.mjs` were re-run, with KanjiVG pinned at 422b553 (1,719 of 1,719 present).
  - The pad now reads 1,555 kanji: every kanji displayed, plus the first 33.
- **守's first reading had flipped to もり.** The quest lines add 木守 (tree-keeper), and each ～守 compound counts once, so they outnumbered 守る.
  - `tools/kanjiread.mjs` now pins 守 to まも (then もり, も), with the reason in a comment.
  - `lang_answers_kanji.test.mjs` found this.
- **U / validator on the merge:** unit 4639; validator no errors.
- **B `kanji_chart.mjs` on the merge: 8/8.** It covers 守 on Elementary, 守 + る by hand in a battle, and the chart's search from a battle's pad, which still works with the new target slips and companion's turn.

## Integration — everything from 2026-09-29 together (c7860c4)
This covers the title screen, the long quest lines, quest guidance, groups
of creatures with the companion's turn, and every kanji on the pad with
the chart.
- **U / validator:** unit 4639; validator no errors.
- **B Full default suite `node tests/e2e/run.mjs`: 34/34 scripts passed**, including:
  - ui, systems, settings, folio, equipment and characters;
  - play_ui, world_view, world_fixes, encounters, departures, quest_guide and backdrops;
  - title_ledger, create, learning_ui, pad_kanji and kanji_chart;
  - combat_ui, battle_anim, battle_group, companion_turn and audio;
  - shift_load_regression in both modes;
  - story_ch1, story_ch3, side_ch3, story_ch4, story_ch5 and story_ch6;
  - atlas.check and long_quests (fixtures);
  - a whole-game `pursue.mjs E mio` in 779 s.
- **B Layout audit on c7860c4:** `visual.mjs --check` covers 58 states, adding journey_guide and settings_guide. It checks overflow, clipped text, touch targets, furigana contrast, page errors and state errors.
  - English labels at 8 viewports (320x640 … 1920x1080): **464/464 clean**.
  - Japanese labels at 320x640, 390x844 and 1280x800: **174/174 clean**.
- **B Whole-game matrix on c7860c4** (`node tests/e2e/matrix.mjs FEIA nao,mio,ren,suzu 3`): **16/16**.
  - Every learning profile × companion played a new campaign through chapters 1–6 and one Atlas expedition, in 11.4–13.7 min each.
  - These runs include the group placements' settings, the companion's turn in the solver, the quest guidance and the new maps.
  - The solver answers battles, so these runs show that the game can be finished; they don't judge how it feels.
- **Not verified:** Firefox (the owner's browser), Safari and real phones.
  - Real handwriting of the new kanji; the accuracy figures are synthetic.
  - A human judgement of the group formation, the companion's menu, the markers' helpfulness, the kanji chart's themes and the quest lines' pacing.
  - A native speaker's review of the new Japanese.

## Addendum — integrated validation (Living Company and Discovery, owner's brief of 2026-09-30)
All six slices are merged: pets, companionship, endings and The Pages We Keep, field weaving
and keepsakes, cases and Known Details, bookmarks and Creatures Met. Every run below used
the integrated build, in headless Chromium on Linux (Playwright's headless shell), with
synthetic campaigns in fresh browser profiles. No player save was used. The acceptance
matrix is `docs/addendum/COVERAGE.md`, and each area's own record is in `docs/addendum/`.
- **Validator** (`node tools/validate.mjs`, 5312690): **no errors**.
  - It now also walks the addendum registries: 634 Japanese texts, every kanji with
    furigana.
  - 1270 scenes, 6235 lines, 90 maps, 37 quests.
- **U Unit** (`node tests/run-unit.mjs`, 5312690): **6321 passed, 0 failed** (4 min 31 s).
  - Run on their own on the integrated tree: pets 164, company_bond 237, and pages_project
    601 (now with the real pets system).
  - The other addendum files (company_core, fieldweave, cases, bookmarks) are inside the
    6321; their own counts are in their area records.
- **B Default suite** (`node tests/e2e/run.mjs`, 5312690, 79 min): **49/50 scripts passed**.
  - The 50 scripts are: every earlier script, and the addendum's fieldweave, mill_road,
    keepsakes, bookmarks, pets, pets_greet, pets_weave, pets_gallery, pages_ending,
    company, company_pets, addendum_integration, cases, cases_shots and known.
  - Also: combat_small, and a whole-game `pursue.mjs E mio`. The whole-game run went
    through chapters 1–6 and the first Atlas restoration in 1122 s, with no problems and no
    page errors.
  - The failure was `battle_group.mjs`, in its phone section. It failed twice: once with
    "no feedback after answering", and once with the right option covered at 844×390.
    - Cause: the test leaves the pointer where it clicked the response card. That spot is
      on another option's word, so that word's hover help card opened over the right option
      between measuring and clicking.
    - The game is unchanged. The test now moves the pointer off the options first
      (24f8730), and passed 6/6 twice.
    - The section also passed 3/3 alone, both on the final build and on a build without
      this branch's recap CSS. That rules the CSS out.
- **B Whole-game matrix** (`node tests/e2e/matrix.mjs FEIA nao,mio,ren,suzu 3`, 24f8730, the same
  game build): **16/16**.
  - Every learning profile × companion played a new campaign through chapters 1–6 and one
    Atlas expedition, in 17.2–21.0 min each.
  - The field puzzles, cases, pets' meeting places and rest menus were on the way. The
    test player looks at the Weave and filing sheets and closes them.
  - The solver answers the language steps, so these runs show that the game can be
    finished. They don't show how it plays.
- **B Layout audit** (`visual.mjs --check`, 24f8730, the same game build as 5312690): 67 states. the states now include company,
  company_pet, company_mem, keepsakes, cases, known, bookmarks, creatures and weave. The
  audit checks overflow, clipped text, touch targets, furigana contrast, and page and state
  errors.
  - English labels at 8 viewports (320x640 … 1920x1080): **536/536 clean**.
  - Japanese labels at 320x640, 390x844 and 1280x800: **201/201 clean**.
- **B + V Pets**: the 16 species × companion sheets were made on the integrated build, in
  the world, in battle and on Company › Pet. `pets_sheets.mjs` found no problems, and all
  three sheets were looked at.
- **Integration fixes made and checked here:** see `docs/addendum/COVERAGE.md`, "Integration work in Phase F".
  - One Pets memory per meeting.
  - The pet never ends its walk on a person. The fix was checked against the old code,
    where the pet stopped on the player and shuffled.
  - Notices no longer take clicks meant for the folio underneath. The check fails without
    the fix.
  - The recap gives way to Step back on small phones.
  - The test driver closes an opened Weave sheet and F6's filing sheet.
  - The pages tests use the real pets system.
  - pets_greet settles its fixture first.
  - The validator walks the addendum registries.
  - `RB.pix.hex` channels are always two hex digits.
- **Evidence (§23.7):**
  - Refreshed on the integrated build: `docs/screenshots/company/`,
    `docs/screenshots/pages/` and `docs/screenshots/words/`. The capture scripts clear
    passing notices, toasts and arrival labels first.
  - Kept from the slices' branches: `docs/screenshots/pets/` (including `tanuki_battle.webm`),
    `fieldweave/f1_two_routes.webm` and `cases/`.
- **Build:** `index.html` is 6,887,116 bytes, up from 5,568,246 at c7860c4. It still
  makes no network request, and the only URLs in it are the licence attributions and the
  SVG namespace.
- **Not verified:**
  - Human play of any of it. Nobody has judged whether puzzles and cases are fair or fun,
    or whether companions feel like people.
  - A native speaker's review of the new Japanese.
  - Firefox (the owner's browser), Safari, real phones, frame rate on a phone.
  - An audible Japanese voice for "Hear it".
  - Known and left alone:
    - Snowbell's tone-1 morning lines never play.
    - An arrival label or a toast can sit over the first choice for a few seconds while
      the dialogue box is at the top.

## Practice addendum — integrated validation (Roadside Practice, A Quiet Cast, Companion Shiritori; owner's brief of 2026-10-02)
All six areas are merged on the task branch: shiritori engine (da04afb), fishing pace (4e67a21), suite B
(60d3c58), the shiritori table and wordplay (f388ffa), suite A (4913b5d) and fishing (25fab16). The
section-by-section checklist with evidence classes, build identity and bundle growth is
`docs/practice/COVERAGE.md`; each area keeps its record in `docs/practice/`. Every run below was in
headless Chromium on Linux (Playwright), with synthetic campaigns in fresh browser profiles. No player
save was used.
- **Build identity:** `25fab16`, `index.html` 8,134,843 bytes (sha256 `406e8634a865d321…`); growth over
  the practice base c86d615: +1.16 MiB raw, +327 KiB gzip (under the §23.7 review trigger of 1.5 MiB).
- **U Unit** (`node tests/run-unit.mjs`, 25fab16): **7987 passed, 0 failed**.
- **Shiritori audits and the 3,600-game benchmark** rerun at 25fab16: certification unchanged, the
  benchmark summary identical, the live driver 0 fallbacks in 3,010 searched moves (be4c98c).
- **B Default suite** (`node tests/e2e/run.mjs`, the 25fab16 build, 2026-10-02): **57/58 scripts passed**,
  including every practice script (pace, practice_b, wordplay, wordplay_layout, practice_a_lamps,
  practice_a_desk, practice_a_layout, fishing) and every earlier one.
  - The failure was the whole-game run (`pursue.mjs E mio`): it stopped in Chapter 3 at Shino's Post
    House, in mode `activity`. The automated player chose "Look at the proofreader's tray" at the new
    post box (practice suite B), and the proofreading practice opened after the scene; the test player
    had no rule for a practice activity and waited until its timeout.
  - Cause: a gap in the test player (src/engine/99_test.js, inert unless a test enables it), not the
    game. Back leaves the activity at once (checked for proofreading and comparisons; the other
    practice kinds are not offered at that point).
  - Fix: the test player now looks at an activity opened from a scene and leaves it with Back, as it
    already does for the folio and the Weave sheet. With the fix the whole-game run finished Chapters
    1–6 and the first Atlas restoration with no problems and no page errors (on the integrated build
    plus the battle addendum's Phase B, in a separate worktree).
  - For one minute during this suite a work-in-progress `index.html` replaced the 25fab16 build by
    mistake (restored from git). Only `practice_a_layout.mjs` was running then; it passed, and it is
    rerun on the final build (see the battle addendum's Phase B entry).
- **Not verified:** human play of any activity (including the §7.6 pace pilot and the §23.8 questions),
  a native speaker's review of the new Japanese, real handwriting, Firefox, Safari, real phones, the
  foldable, a stylus, real software keyboards, and the fish captions' source check
  (`docs/practice/COVERAGE.md`, "What is not verified").

## Battle addendum — Phases A and B (Expressive Battle Art, Adaptive Combat UI, and Verified Playtest Repairs; owner's brief of 2026-10-02)
Phase A (repairs, seams, contracts, inventory) and Phase B (the integrator's presentation contract)
on the task branch. The art areas (Phases C–E) are built by five workers and merged next; Phase F and
then the full-game matrix follow. What each part does: `docs/battle/PRESENTATION.md`; the RBN ledger:
`docs/battle/LEDGER.md`; contracts: `docs/BATTLE_ART_CONTRACTS.md`. Every run below was in headless
Chromium on Linux (Playwright) with synthetic campaigns in fresh profiles; no player save was used.
The machine was shared with five art workers running their own tests (load average 12–36 on 4 cores);
timing assertions that failed under that load are listed with their rerun.
- **Build identity:** `index.html` 8,201,452 bytes, 2,519,872 gzip -9, sha256 `b5202fc6166f52c1…`
  (the Phase B commit). Growth over 25fab16: +66,609 bytes raw.
- **Validator** (`node tools/validate.mjs`): no errors.
- **U Unit** (`node tests/run-unit.mjs`, the build before the last frame-cost change): **8008 passed,
  1 failed** — kanji_chart's "a search takes well under 25 ms" at load ~30; rerun alone on the final
  build: 53/0. New: `script_prompts` 10/0 (RBN-02 beyond the recall step), `battle_seams` 12/0.
- **B Repairs** (`playtest_repairs.mjs`): **7/7** (RBN-01 ×3, -02, -04, -05, -07). On the build before
  the repairs (25fab16's `index.html`), 6 of the 7 fail as the review describes; the seventh (a target
  gone before arrival) passes on both. The new RBN-07 test checks the guided note, the "Guided practice"
  feedback and the record (assisted 1, ok 0).
- **B Presentation** (`battle_presentation.mjs`, final build): **9/9** — banner truth table (decision,
  language task, support choice, gaps, after; blue/red with actor and name; companion support; one
  banner for a shared technique; the finishing response's banner gone while the settling plays; no
  banner for a creature's move that never ran; a hidden tab; tokens: a late hide cannot clear a newer
  title), Normal / Fast / Instant with Text speed independence, Skip, intent badges (three viewports),
  reading-critical intents and Expanded, the held-Enter guard and focus return, withdrawn and Keep-visible
  controls unreachable by Tab and pointer with Resolve and Harmony visible in every recorded frame
  (Adaptive and Keep visible, 1280×800 and 390×844).
- **B Battle suites** (final build unless noted): combat_ui 7/7, companion_turn 4/4, kanji_chart 8/8,
  battle_group 6/6, combat_small all ok (the build before the last frame-cost change), learning_ui 15/15,
  fieldweave 89/89, practice_a_desk 45/45, practice_a_layout 350/350 (the script that had run during the
  one-minute build mix-up of the practice suite: passes on the final build).
  - battle_anim: **16/16** on the final build at load ~4 (frame cost during sequences avg 1.7 ms, limit
    8). In the batch at load ~25 it was 14/16: "a complete exchange" (the frame-cost limit) and "rapid
    input" (a key press timed against the companion menu's 250 ms guard); "rapid input" also failed on
    the pre-Phase-B build at that load and passed there alone.
  - Fixed in tests on the way: a pointer left on a word opened hover word help over the next card or
    Continue (companion_turn, battle_anim, battle_presentation, battle_geometry), and clicks inside the
    companion menu's first 250 ms (a designed guard) were ignored (battle_presentation, battle_geometry).
- **B Geometry** (`battle_geometry.mjs --doc`, final build): 21 scenes at the eight §22.2 viewports plus
  200 % text, a Japanese-led long-name case, a simulated keyboard and Keep visible; **all targets met**:
  action-safe height 488 at 390×844 alone and 448 with three creatures (target 300), 308 and 260 at
  320×640 (target 240). Report: `docs/battle/GEOMETRY.md`.
- **B Invariance** (`battle_invariance.mjs`, the Phase B build before the last two UI-only edits):
  **544 configurations** — no companion and each of the four × one, two and three creatures × Normal /
  Fast / Instant × full / reduced motion × Adaptive / Keep visible × Text speed Normal / Fast / Instant,
  plus no pet / cat shown / cat hidden / dog — **every fixture identical** in resolve, knots, intents,
  states, Harmony, support uses, round, target, outcome, rewards, the learning record's counts, and the
  next decision. No combination was excluded.
- **B Long session** (`battle_cycle.mjs`, final build): 20 battle entries and exits (every companion,
  1–3 creatures, every playback, reduced motion, pets, Skip, a hidden tab, a finish, Step back): no
  battle-only element left after any exit; JS listeners 101 → 101 and DOM nodes 247 → 245 from battle 5
  to 20. (A first run showed growth: it was the test's own undisposed element handles, retained by the
  DevTools session — found with a heap snapshot; the test disposes them now.)
- **B Whole game** (`pursue.mjs E mio`, the integrated build with Phase B, before its last edits):
  Chapters 1–6 and the first Atlas restoration, no problems, no page errors.
- **Found and fixed in Phase B testing:** at 200 % text on a portrait phone the companion's support
  cards had an 8 px scroll box (the dock now takes the height it needs there); keyword help and word
  help on phones opened over the party slip (they now rise from its top); Japanese words in the banner
  and the word strip could take keyboard focus (both inert now); badges kept stale positions when the
  stage collapsed (they stand down then); the battle weave, field weave and copying desk prompts said
  "(kana or kanji)" while accepting only the hiragana reading or the kanji (RBN-02).
- **Not verified:** Firefox, Safari, a real phone or the foldable; the art and the badges by a person;
  a native speaker's review; real handwriting.

## Battle addendum — Phase F (the five art areas merged; integrated validation)
The party art, creatures A (with the Flour Moth proof), creatures B, contextual backdrops and pets /
overworld parity were merged into the task branch (e21bf2f, 04ad864, 03cb94a, 6f90736, ba3f4cb), each
checked on the merged build before the next (VALIDATION entries in each area's record,
`docs/battle/<area>.md`; what the merges changed in the seams: `docs/BATTLE_ART_CONTRACTS.md`).
Every run below was in headless Chromium on Linux (Playwright) with synthetic campaigns in fresh
profiles; no player save was used. The machine was shared with other runs (load average 3–8 on 4 cores).
- **Build identities.** `ba3f4cb` (all five merges): `index.html` 8,850,097 bytes, sha256
  `e039152a7510f798…`. **Final** (ba3f4cb + the fixes below; committed with this entry's last update): `index.html`
  8,852,108 bytes, 2,700,153 gzip -9, sha256 `a6a8f20d729d976b…` — byte-identical to the build the
  final-build runs below used (built from the same source in a scratch copy). Growth over Phase B's
  b5202fc6: +650,656 bytes raw (the five art areas).
- **Validator:** no errors (final source).
- **U Unit** (`node tests/run-unit.mjs`): **15,334 passed, 0 failed** on ba3f4cb's source with
  `cacheStats()`; on the final source **15,334 passed, 0 failed**.
- **Merges, each on its merged build:** pets / overworld — battle_pets_overworld 3/3, pets 20/20;
  backdrops — battle_backdrops 38/38, backdrops 61/61, encounters ok; creatures B — battle_creatures_b
  25/25; party — battle_party 14/14, battle_anim 16/16, characters 23/23; creatures A — its browser test
  15/15, including playback Normal 1,310 ms / Fast 910 ms / Instant 1 ms for the moth's Strike.
- **Found and fixed in Phase F** (on ba3f4cb's build; each fix checked by a test that fails before it):
  - At 200 % text on a phone the battle overlay scrolls, and the action banner scrolled with it: its
    top was 59 px above the screen for the whole exchange. It was also squeezed into the half of the
    screen right of centre (`left: 50%` shrink-to-fit), so "Wayfarer — ほどく Unravel" took two lines at
    390 px and four at 200 % text. Now it is as wide as its words need and stays at the top of what is
    in view (`82b_battle_banner.js`, `60_learning.css`).
  - The stage moved during an exchange: at 140 % and 200 % text the withdrawn dock and telegraph
    (prepared for the next decision while hidden) changed height, shrinking the stage from 274 to
    128 px (140 %) or shifting it 74 px (200 %); at 100 % text the stage dropped 14 px when Shroud
    put a condition line on a creature's slip. The overlay's rows and the withdrawn menus now keep
    their committed sizes until the menus return; a resize measures them again (`80_combat.js`
    `hold`). Remaining: a slip that grows mid-exchange extends into the withdrawn telegraph's space
    (portrait), or in the wide and landscape group layouts into the row gap and at most a few pixels
    of the scene's top edge, until the menus return.
  - New test (battle_presentation, "large text on a phone", 100 / 140 / 200 %): the banner in view in
    every frame of an exchange, one line at 100 %, the stage's place and size constant. On ba3f4cb's
    build it fails (stage top 224–239 at 100 %); on the final build it passes.
  - Tests only: the phone recording is driven by taps (its mouse path crossed a keyword whose hover
    help covered the badge); companion_turn presses a card once it has stopped moving (the menus slide
    back in over 200 ms; in the suite under load a point measured mid-slide missed the card — it passes
    4/4 alone on both builds); battle_geometry moves the pointer off the clicked card before the
    language view (its hover word help covered the sheet in a still; the measurements never counted it).
- **B Battle suites on the final build:** battle_presentation **10/10**, combat_ui 7/7, companion_turn
  4/4, battle_group 6/6, battle_anim 16/16, battle_party 14/14, playtest_repairs 7/7.
- **B Geometry** (`battle_geometry.mjs --doc`, final build): 21 scenes, **all targets met**: action-safe
  height 488 at 390×844 alone and 444 with three creatures (target 300), 308 and 256 at 320×640
  (target 240); at 200 % text 328 (was 284 with the four-line banner). The wider banner costs 4 px of
  height at 390×844 and 320×640 with three creatures and gives the full 392 px width. Report:
  `docs/battle/GEOMETRY.md`; stills of the narrow, landscape-phone, large-text and Japanese-led scenes
  (decision, language and action views): `docs/screenshots/battle/layout/`.
- **B Invariance** (`battle_invariance.mjs`): on ba3f4cb's build **544 configurations, 16 fixtures,
  every fixture identical** across Normal / Fast / Instant, reduced motion, Adaptive / Keep visible,
  Text speed and pet variations (1,646 s). On the final build, `--quick`: **52 configurations, 5 fixtures, every fixture identical** (154 s).
- **B Long session** (`battle_cycle.mjs`): 20 battle entries and exits — on ba3f4cb's build listeners
  101 → 101, DOM nodes 247 → 245 from battle 5 to 20; on the final build listeners 101 → 101, nodes
  247 → 245 (the banner's scroll listener and the resize hold are removed with the battle).
- **B Memory budget** (`battle_budget.mjs`, §21.5; first on ba3f4cb + `cacheStats()`): one page, 30 encounters
  (each of the 15 creature families alone and in threes, every companion and pet in turn, one exchange
  each, Step back): largest estimated residency **37.12 MiB** after three Snow Foxes with Nao and the
  cat (party 4.38 MiB in 138 frames, creatures 28.89 MiB in 140 frames — the shared cache's cap — pets
  3.85 MiB in 415 frames), under the 48 MiB budget; no encounter failed. Caps: party 22.85 MiB, creature
  cache 140 frames, pet cache 900 frames. These are pixel estimates (w × h × 4 per cached frame), not
  measured process memory; backdrop layers are reported by battle_backdrops. On the final build:
  30/30 encounters, largest **37.05 MiB** (again after three Snow Foxes with Nao and the cat: party 4.38,
  creatures 28.92, pets 3.75). A first final-build run measured 35.1 MiB but lost 17 encounters to the
  test: the 14th drew a task whose right option it did not recognise, the option it pressed left the
  step waiting, and each later encounter began with that task open; the test now ends such a step with
  "I don't know" and leaves an open task after a failure.
- **B Recordings** (`battle_presentation_video.mjs`, final build): five real-time clips (VP8, no sound) of one exchange in
  the Mill — Unravel answered right with real clicks at an unhurried pace, Mio's Warm draught, the Flour
  Moth's move — a diagnostic placement of the party in the Mill: `normal_1280.webm` 19.2 s,
  `fast_1280.webm` 17.6 s, `instant_1280.webm` 13.3 s (no movement, no banner; the recap in the log),
  `reduced_1280.webm` 18.9 s, and `narrow_390.webm` 24.9 s (a 390×844 phone driven by taps, three Flour
  Moths, a badge card opened, read and closed). The clips share the same fixed pauses, so the
  differences in length are the exchange's playback. WebP stills: the badge card, your response's blue
  banner, the creature's red banner. In `docs/screenshots/battle/presentation/`; durations read in
  Chromium.
- **B Default suite** (`node tests/e2e/run.mjs`, on ba3f4cb's build with the working tree's tests):
  **63/65 scripts passed**, including the whole-game run (`pursue.mjs E mio`, Chapters 1–6 and the first
  Atlas restoration, 1,002 s), every story chapter, the practice and wordplay scripts, the art areas'
  battle scripts and the 20-battle cleanup. The two that failed, with their cause:
  - battle_presentation: its new "large text on a phone" test ran against ba3f4cb's build, which does
    not have the fix it checks (the other nine passed).
  - companion_turn: a press measured while the menus slid back in missed the card (the test now
    waits for the card to settle).
  Both rerun on the final build in this checkout: battle_presentation **10/10**, companion_turn **4/4**.
  Side effects of the run that were not kept: several scripts rewrite their captures in
  `docs/screenshots/` (quest_guide, words, pages) or leave PNG working files (practice_a); those were
  restored or removed, so the committed captures are unchanged.
- **Not verified:** Firefox (Robin's browser), Safari, a real phone or the foldable; the art by a
  person (every rubric is a self-review); a native speaker's review; frame rate on named hardware
  (headless playback and video cadence are not frame-rate measurements).

## Full-game matrix — both addenda of 2026-10-02 (Practice; Battle art, UI and repairs)
Run after both addenda were complete, as the owner asked, on the final build (`index.html` 8,852,108
bytes, sha256 `a6a8f20d729d976b…`, a1eee28), in a scratch copy of the same source and build so the
scripts' captures stayed out of the repository. Headless Chromium on Linux (Playwright), synthetic
campaigns in fresh profiles; no player save was used.
- **B Whole-game matrix** (`node tests/e2e/matrix.mjs FE …` then `IA …`, `nao,mio,ren,suzu`, three at
  a time): **16/16**. Every learning profile (F, E, I, A) × companion played a new campaign through
  Chapters 1–6 and one Atlas restoration, in 14.8–17.2 min each. The battles on the way used the new
  presentation (Normal playback, Adaptive menus, the badges and the banner) and the merged art; the
  practice activities met on the way were left by the test player. The solver answers the language
  steps, so these runs show that the game can be finished with both addenda in, not how it plays.
- **B Layout audit** (`visual.mjs --check`): English labels at 8 viewports (320×640 … 1920×1080)
  **536/536 clean**; Japanese labels at 320×640, 390×844 and 1280×800 **201/201 clean** (overflow,
  clipped text, touch targets, furigana contrast, page and state errors).
- With the default suite (63/65 on the merged build, the two explained and passing on the final
  build; VALIDATION "Battle addendum — Phase F") this completes the matrix stage for both addenda.
- **Not verified:** Firefox, Safari, a real phone or the foldable; play by a person; a native speaker's
  review.

## Battle playtest round — the owner's report of 2026-10-02 (cadence, creature plates, Adaptive intents, the opening lines, the art restyle)
The owner played the battle addendum's build in Firefox (about 2000 × 1090) and reported: the scene
animated faster while the opening lines were up than once the battle was in focus; the Adaptive intent
display still showed the telegraph panel; the creature's name sat in a solid navy box in the top-left
instead of above it; blank panels during the opening lines; and, with the reference re-supplied, that
the battle art should be reshaped toward its style (keeping the Moth's and the Mill Echo's motion).
Every run below was in headless Chromium on Linux (Playwright) with synthetic campaigns in fresh
profiles; no player save was used; nothing was checked in Firefox.
- **Build identity:** `index.html` 9,003,781 bytes, 2,750,955 gzip -9, sha256 `1b1a85e9d01d4817…` (3ae7e37: the three restyles merged; b11290a after it changes a test helper only). Growth over the battle addendum's final build (a6a8f20d…): +151,673 bytes.
- **Cadence (6855ba1).** Cause: while choosing, writing or choosing support, the ambient clock (the
  creatures' idle, the backdrop, lingering effects) ran at half speed and the party took its quieter
  calm stance. Now one clock at the authored rate in every phase; ready stances while choosing; calm
  only during the language task. Test: battle_presentation "one cadence" — the clock against the page's
  over a second: 1.005 (opening lines), 1.016 (choosing), 1.000 (choosing support); fails on the build
  before (calm stances while choosing).
- **Adaptive intents (§13.3), creature plates, the opening lines (febb86e … dbaf196).** A routine move is
  its badge only; the panel holds just the passages to read (promise, mirror, plea) and is otherwise
  absent; the badge card gained Translate (assisted) and Nao's foresight. Each creature's name, knots
  and conditions sit on a translucent plate above it, with its badge (pushed apart → compact → a rail
  along the top of the scene); a group's plates choose the target; a settled creature keeps its plate.
  During the opening lines the decision surfaces are away and inert and the party slip is filled; they
  come in at the first decision. Found while testing and fixed: a plate's keyword note opened over the
  plate, under the pointer that opened it (8dbbb23); compact plates were 42 px tall (target buttons keep
  44 px).
- **Art restyle (three workers, merged aeb2c12, 9b8f10d, 3ae7e37).** Party (the player in every look
  option and the four companions), creatures A (Chapters 1–3; the Flour Moth and the Mill Echo first)
  and creatures B (Chapters 4–6 and the Atlas) reshaped and re-rendered toward the reference: three-
  quarter forms, coloured selective outlines, hue-shifted high-contrast ramps, one key light and a cool
  rim, cast shadows, a recipe per material. Motion kept: every pose, delivery, contact beat and idle
  cadence (the party's ready idle now changes pose 7–10 times a second, was 3–5). Records:
  `docs/battle/party.md` (round 2), `creatures_a.md` ("The restyle round"), `creatures_b.md` ("Restyle
  round"); evidence in `docs/screenshots/battle/{party,creatures_a,creatures_b}_restyle/`. Every art
  judgement is the workers' and the integrator's self-review; no person has looked at it.
- **Each merge on its merged build:** party — unit 15,339/0, battle_party 14/14, characters 23/23,
  battle_presentation 13/13, battle_pets_overworld 3/3; creatures B and A — see the integrated runs.
- **Integrated build, every run on 1b1a85e9:** validator no errors; unit **15,388 passed, 0 failed**;
  battle_presentation **13/13**, combat_ui 7/7, battle_group 6/6, companion_turn 4/4, playtest_repairs
  7/7, battle_party 14/14, characters 23/23, creatures_a 15/15, battle_creatures_b 26/26,
  battle_backdrops 38/38, encounters ok, battle_pets_overworld --battles-only 3/3, battle_cycle stable
  (listeners 101 → 101, nodes 247 → 245 from battle 5 to 20).
  - battle_anim **15/16**: "learning stays central" timed out on a click — the third time across runs
    (also on the build before the restyle). Root cause: left where the language task's Continue was,
    the pointer rested on the phone layout's Harmony keyword; its hover note covered the coach's "Got
    it" that the shared helper then pressed. Fixed in the helper (b11290a: the pointer moves off
    first); the test then passed 3 of 3 alone under load.
- **Geometry** (`battle_geometry.mjs --doc`): 21 scenes, all targets met; action-safe height 640 at
  390×844 alone and 600 with three creatures (target 300), 476 and 396 at 320×640 (target 240).
- **Invariance** (`battle_invariance.mjs`, full): **544 configurations, 16 fixtures, every fixture
  identical** across its presentation settings (1,551 s).
- **Memory budget** (`battle_budget.mjs`): 30/30 encounters; largest **38.58 MiB** of 48 (party 5.84,
  creatures 28.92, pets 3.83; three Snow Foxes). The shared creature cache is now bounded by 140 frames
  and 30 MiB, whichever comes first.
- **Recordings** (`docs/screenshots/battle/presentation/`, remade on this build): Normal 18.4 s, Fast
  16.6 s, Instant 13.2 s, reduced motion 18.8 s, a 390×844 phone by taps 24.6 s (three Flour Moths, a
  badge card), with stills of the badge card and the blue and red banners; layout stills
  (`docs/screenshots/battle/layout/`) at 320×640, 390×844, 844×390, 200 % text and Japanese-led.
- **Default suite** (`node tests/e2e/run.mjs`, on 1b1a85e9 with the tests as of 6ee24ee): **61/65
  scripts passed**, including the whole-game run (`pursue.mjs E mio`, 982 s). The four that failed were
  tests written for the old screen or racing a timing, each fixed and then passing on the same build:
  - ui.mjs read the move from the telegraph panel (Adaptive: a routine move is its badge) — reads the
    badge's label (8202fcb); passes.
  - backdrops.mjs pinned the slips' heights to hold the layout still; the Adaptive panel was not there
    when pinned and appeared for the Mill Echo's passage to read — the pin keeps it not there
    (64c329c); 61/61.
  - learning_ui.mjs checked the telegraph panel at phone and landscape sizes — with Expanded now, plus
    Adaptive checks that the badge and the plate are in view and uncovered (64c329c); 15/15.
  - wordplay.mjs read the leave sheet's focus before the sheet moved it (practice addendum; not touched
    this round) — waits for it (4c5fa84); 82/82.
- **Layout audit** (`visual.mjs --check`, 1b1a85e9): English labels at 8 viewports **536/536 clean**;
  Japanese labels at 320×640, 390×844 and 1280×800 **201/201 clean**. (A first run was lost to a
  container restart and run again from the start.)
- **Behaviour to know:** in Adaptive the telegraph panel appears only for a passage to read, so the
  scene re-frames a little at the start of such a decision (never during an exchange); the backdrop keeps
  its composition when it does.
- **Not verified:** Firefox (the owner's browser), Safari, a real phone or the foldable; the art judged by
  a person; frame rate on named hardware.

## Prologue round — the owner's report of 2026-10-03 (the traveller's walk, the shots' art)
The owner wrote that the prologue cutscene's panels did not match the current art style. In the last
shot the traveller walked up from the centre of the screen as if into the water; they should start on
the road and recede into the distance, shrinking or using a lower-detail model. Measured on the build
before: the walk was the screen's centre column, from 95 % of the height up by 20 %, at full size.
On the title scene that column is off the road at 16 of 21 moments at 1920×1080 and 1280×800 and 17
of 21 at 844×390, on the grass beside the river. At 390×844 the caption slip covered the traveller
for the whole shot. Every run below was in headless Chromium on Linux (Playwright) with fresh
profiles; no player save was used; nothing was checked in Firefox.
- **Build identities:** 5a2877e (the prologue round: `index.html` 9,067,541 bytes, sha256 `b64abcbe6b32a128…`), then 12a9757 (with the town animals' fixes and the case props, below), on which the default suite ran.
- **The traveller (`src/ui/41_prologue_art.js`).**
  - The walk starts on the road just above the caption slip and follows the road's centre line
    (`RB.ui.title.roadGuide`) toward the horizon at a steady pace.
  - Height is proportional to distance below the horizon, matched at the start to 0.75 of a roadside
    lantern post there.
  - The figure is the real walk frames shrunk onto the same grid, keeping the outline and the hand
    lantern, night-graded and lit by that lantern.
- **The shots (41b, 41c, 41d):** the teahouse twice, the riverbank lantern and the broken bridge,
  redrawn at art resolution with the pixel kit. Details: docs/ART_DIRECTION.md §12.
- **B `tests/e2e/prologue.mjs` (new, in the default suite): 100/100** at 1920×1080, 1280×800,
  390×844 and 844×390.
  - Every shot draws at the start, middle and end, moving and with reduced motion, and is a picture
    (12 or more sampled colours).
  - **The pixel of the title scene under the traveller's feet is road at all 21 moments on all four
    screens** (blue minus red at most 30; the river is 46 or more).
  - The feet stay within 0.04 of the road's half-width from its centre (0.16 at 844×390).
  - The walk starts 4 px above the slip and goes up at least halfway to the horizon. At 1920×1080 the
    feet go from row 287 to row 211 (horizon 169) and the figure from 31 to 11 px; at 390×844 from 573
    to 363 (horizon 245), 31 → 11 px. At 844×390 the slip leaves only 12 px of road in view: 118 → 113,
    17 → 6 px.
  - With reduced motion the traveller stands at one place.
  - The lantern's ink pixels go 139 → 70 → 0 (at 0.05, 0.4 and 0.95 of the shot; 43 → 24 → 0 at
    844×390).
  - The real flow shows six different pictures. The last Next reaches creation with the caches
    released (0 layers, 0 frames). No console errors and no network requests.
  - Cost: the first frame of a shot builds its layer in 31–92 ms (the teahouse the most); later frames
    take 0–9 ms (draw calls timed in the page, not frame rate).
- **Other runs on this build:**
  - U unit 15,388 passed, 0 failed; validator no errors.
  - B prologue 100/100 on 5a2877e (alone) and in the default suite on 12a9757; create 382/0, ui 14/0, title_ledger 18/0, settings all ok, audio checks all passed,
    shift_load_regression 18/18 (http origin) and 18/18 (file://).
  - Layout audit (`visual.mjs --check`): create_prologue and title ok at 320×568, 390×844, 844×390,
    1280×800 and 1920×1080, and create_prologue Japanese-led at 390×844 and 1280×800.
  - Default suite: **67/67 scripts passed on 12a9757** (headless Chromium, one run, no reruns).
- **Evidence:** docs/screenshots/prologue/.
  - `after/`: every shot at 1920×1080, 2000×1090 (the owner's size) and 390×844, each with its own
    caption, and the traveller at the start, middle and end of the walk.
  - Two real-time clips at 1280×720: `lantern_1280.webm` and `walker_1280.webm` (VP8, about 1.2 MB
    each).
  - `before/`: the previous build at 1920×1080 and 390×844.
- **Self-review against the title scene** (the author's, from captures at 3× and 6×; no person has
  looked):
  - **Matches:**
    - the banded skies and dithered seams;
    - the stepped glows;
    - hue-shifted ramps with cool shadows;
    - selective outlines on every object;
    - the same night palette for the lantern and the walk.
  - **Short of it:**
    - the bank in shot 4 is a broad dark shape;
    - Hana's portrait is large against the cups;
    - the traveller below about 9 px is a silhouette with a lit dot.
- **Not verified:** Firefox (the owner's browser), Safari, a real phone or the foldable; the art judged by a
  person.


## Town animals — the owner's reports of 2026-10-03 (the cat's idle, Mochi's look, her path, her line)
The owner reported four things about the town cats:
- The cat in town had no proper idle: its tail should swish and it should have a small idle bounce, like
  everyone else.
- Mochi, Tomo's cat, should look like the ginger cat by the reed screen.
- Picking Mochi up during A Cat Called Mochi, she walked into Kōji's house.
- At night her line said she was stretched out in the sun.

Every run below was in headless Chromium on Linux (Playwright) with synthetic campaigns in fresh
profiles; no player save was used; nothing was checked in Firefox.
- **Causes.**
  - **Idle:** your pet and the animals not yet met changed pose only every few seconds (a blink, an ear,
    a look), and stood still in between.
  - **Mochi's look:** she was a separate 32×48 hand-drawn creature sprite with no idle at all.
  - **Mochi's path:** when picked up, her npc stopped showing and the world treated her as a person
    leaving. No map placed her anywhere while carried, so she took the nearest way out within 18 tiles,
    the door at 45,15. Given back, she came out of the nearest door (11,24) and walked to Tomo.
  - **Her line:** the line had no night version.
- **Fixes (340bf68).**
  - **Idle:** a life layer: breath on the people's settle-and-rise beat, and a tail on one short cycle
    per species.
  - **Mochi's look:** Mochi is drawn with the pets' rig (look `cat/mochi`, white with a red collar), is
    found lying, and stays where the scenes say she is curled up.
  - **Mochi's path:** two npc options, `leave: 'here'` and `arrive: 'here'`.
  - **Her line:** it branches on `rw_night`.
- **B `tests/e2e/town_animals.mjs` (new, in the default suite): 41/41** on 340bf68.
  - **On the previous build 19 of its checks fail,** reproducing each report: no breath or tail values,
    Mochi on the old sprite, the departure to 45,15 "nearest (unknown)", the arrival from 11,24, "in the
    sun" at night.
  - **The idle:**
    - Every species breathes (3 steps) and moves its tail at rest, standing, sitting and lying (cat
      tSide 5–8 values in 2.6–4 s, dog wag 3, tanuki 3, bird tUp 3).
    - The picture changes with it (36 pictures in 4 s).
    - A further 4 s of the same posture builds 4–9 new frames.
    - The reed-screen cat and Mochi breathe and swish too.
  - **Mochi's path:**
    - Picked up with a real key press, she stays at 46,20 for every frame while she fades (alpha 0.94 →
      0.04).
    - Her departure is recorded as "authored: gone where they were", with no exit.
    - Given back, she appears at 8,25 beside Tomo with no route.
  - **Her line:** "stretched out in the sun" by day, "curled up at Tomo's feet" at night.
  - **Reduced motion:** nothing is added (0 of 23–27 poses).
- **Other runs on 340bf68:** unit 15,388/0; validator no errors; departures all ok; prologue 100/100.
  Default suite: 67/67 scripts on 12a9757, which includes these fixes (see the prologue round above).
- **Not verified:** Firefox, the foldable, a person's look at the animals.

## Case props — the owner's report of 2026-10-03 (Hama's workbench and the call bell looked crude)
The owner marked Hama's workbench and the ferry's call bell on the Saltglass quay as crude next to the
newer art. They were the first pass's flat 16-px drawings, scaled up. Every run below was in headless
Chromium on Linux (Playwright) with synthetic campaigns in fresh profiles; no player save was used;
nothing was checked in Firefox.
- **Fix (12a9757):** `src/content/cases/06_art2.js` gives all seven case props an art-resolution
  `draw2` in the world's prop style: ramps, light from the upper left, an ink outline and a contact
  shadow. The clues are kept: the bench's evenly spaced notches, the bell's notch in its right
  shoulder, the empty bracket at the old landing. Details: docs/addendum/cases.md.
- **A regression found on the way:** `characters.mjs` failed on Mochi's new look (the sprite functions
  drew a pet look as a person and threw on its hair). `RB.sprites.getArt` and `get` now return the
  rig's animal for a pet look; the test treats it like the other creatures.
- **Runs on 12a9757:** unit 15,388/0; validator no errors; characters 23/0; town_animals 41/41; the
  default suite: 67/67 scripts, including cases and cases_shots.
- **Evidence:** `docs/screenshots/cases_props/quay_before.webp` and `quay_after.webp` (a 760×400 crop of the
  quay on the previous build and this one).
- **Not verified:** Firefox; a person's look at the props. The other five props were reviewed by the
  author from captures only.

## Interludes — the owner's report of 2026-10-03 (lines said in the dark; the wait at Shiori's window)
The owner chose to wait with Shiori (Chapter 2) and got a black screen. Its lines could be advanced with Z but
not read until the screen came back; "if it's meant to be a cutscene, it should be animated such, … at minimum
show the whole dialogue box". The cause: the fade layer sits above the dialogue sheet. Nine scenes in the game
speak while the screen is dark (found by code review). Every run below was in headless Chromium on Linux
(Playwright) with synthetic campaigns in fresh profiles; no player save was used; nothing was checked in Firefox.
- **Fixes:** 6e6f079 (source), built in 6ce2929 together with Suzu's Kansai-ben.
  - `RB.ui.fade` marks the page `veiled` from the moment the screen darkens until it has cleared.
  - **Interludes** (`!interlude`, `src/ui/42_interlude.js`) put a picture in place of the map while a scene's
    lines go on.
  - **The tide wait** (`src/ui/42b_interlude_tide.js`, `sg.tide_wait`). Details: docs/ART_DIRECTION.md §13.
- **B `tests/e2e/interludes.mjs` (new, in the default suite): 76/76** on the merged build.
  - **In the dark** (1280×800, 390×844): the sheet is the element on top at its own centre while the fade is
    on, and History opens on top with the line in it. A real click on Next moves on. After the fade-in nothing
    is left raised.
  - **The tide wait**, from Shiori's real question with a real key press, at 1280×800, 2000×1090, 390×844 and
    844×390:
    - It is a picture and not the map (340–560 colours in a 200×120 sample), with the line over it.
    - The sill, the point's tip and the island stand above the sheet.
    - The road starts under water (0–1 % of its crown dry) and comes up from the point while the first line
      stays up (tide level 2 → 33–34 of 48).
    - When Shiori says it is time, the road's crown lies dry from the point to the island, white sand
      between open water.
    - Then the fog: white on the road's middle, and open water beside it.
    - Then the room again for her worry, and the scene ends with `sg_main` 6 and `sg_tide_low` as before.
  - **Reduced motion:** one still picture per stage (tide 0.55 while waiting, 1 when it is time).
  - **Scene end:** a picture left showing is cleared when its scene ends.
  - **Cost:** about 1 ms per frame (median of 30 draws); the first frame builds its layers in about 250 ms.
  - No console errors and no network requests.
  - **The first scratch run** of this test failed 4 checks, all in the test itself: Escape steps back through
    History's pages before closing it, so the test now presses it until History is closed.
- **Other runs:**
  - On 6e6f079 (source): unit 15,388/0; validator no errors.
  - On the merged build: unit 21,732/0; validator no errors; dialect_kansai, settings and company all passed.
  - Default suite on this build: not yet run when this entry was written (to be added below).
- **Evidence:** docs/screenshots/interludes/ (`interlude_shots.mjs`): each stage at 2000×1090, 1280×800 and
  390×844, and a line said in the dark. `before_2000x1090_wait.webp` and `before_1280x800_dark_line.webp` are the previous build (12a9757) at the same moments: a black screen with no dialogue.
- **Not verified:** Firefox (the owner's browser), the foldable, a person's judgement of the picture. The other
  eight dark passages are readable but are not pictures.

## Suzu's Kansai-ben — the owner's requests of 2026-10-03 (a dialect choice; a switch on her Company page)
The owner asked for all of Suzu's Japanese in a Kansai dialect, as a choice, with the English re-voiced in a
casual country tone. Later the same day they asked for a switch on her Company page, in "Talk with Suzu", for
existing saves and for turning it back. The work was done in a worker branch (9df9006 … 06cc4b0) and merged
(af9e6b2); the build is 6ce2929. Headless Chromium, fresh profiles, no player save. The Kansai text was written
by the model; **no native speaker has reviewed it.**
- **What:** every line of Suzu's has a Kansai version in Japanese and in English: 896 lines (872 distinct) from
  scenes, Company, field and case reactions, shiritori, fishing, pet meetings, The Pages We Keep and the Atlas.
  - **The inventory** (`tools/suzu_inventory.mjs`) is built three ways: tracing scenes, reading her data tables,
    and a source scan for Japanese next to a `suzu` key.
  - **Enforcement:** the validator and a unit test fail on a line without a version, a kanji without furigana,
    a word no lexicon explains, mismatched placeholders, or caricature forms (さかい, まんねん, でんがな, でっせ/まっせ,
    わて, おおきに).
- **Where it is chosen:** a sheet when she joins; Settings › Reading & Language; her Company page under "Talk with
  Suzu" (a radio group, plus an in-world ask with a one-line reply). A loaded save with Suzu and no choice is
  offered the sheet once.
- **What is stored:** `settings.suzuSpeech`, an optional key in the global settings record (absent means
  standard). No save-schema change. History, memories and kept sentences store the standard line and swap it
  only when shown.
- **Learning:** word help reads her Kansai lines with a separate 68-entry Kansai lexicon first (Kansai words, and
  verb forms explained through their standard form), with a note "Kansai dialect (関西弁). In standard Japanese:
  …". Standard vocabulary practice never sees it. A noted Kansai word is marked and skipped by the writing desk,
  the shiritori pool and "kanji met". Challenges, answers, recognition and the story are unchanged.
- **The worker's runs** (Chromium, on its branch): unit 21,732/0; validator no errors.
  - Browser tests passed: dialect_kansai (59 ok), settings, company, wordplay (83), story_ch3 E nao,
    pages_ending, story_ch5 A suzu, ui, fishing, bookmarks, practice_a_desk, cases, company_pets, learning_ui.
- **B `tests/e2e/dialect_kansai.mjs`** (new, in the default suite) checks:
  - the choice at joining, and her next line in Kansai with furigana;
  - word help on a Kansai word;
  - History in Kansai while the campaign keeps standard;
  - the setting in Settings, surviving a reload;
  - a loaded save offered the choice once (Escape keeps standard);
  - the Company control both ways by pointer and keyboard, mirrored in Settings, and the in-world ask;
  - a case line, a Company thought and a shiritori invitation;
  - no Kansai text in the campaign, and the saved slot unchanged;
  - at 390×844, controls of 44 px or more.
- **The lead's runs on the merged build:** unit 21,732/0, validator no errors, dialect_kansai all passed, settings
  all ok, company all passed. Default suite on this build: not yet run when this entry was written (to be added below).
- **Not verified:** a native Kansai speaker's review (the style sheet and review priorities are in
  docs/dialect/suzu_kansai.md); the device voice reads Kansai lines with a standard accent; Firefox; the
  foldable.

## Battles one at a time — the owner's reports of 2026-10-03 (Saltglass: a second battle over the map after a win and after a step back)
The owner played in Firefox at about 2000×1090. After beating a Label Crab, and separately after stepping back
from a Harbour Fog, a battle screen came up over the map with nothing queued. Winning it said the crab was
defeated again, and the screen went black. A save and load in the same page did not recover it; a page reload
did. The fix was made in a worker branch (6fa0f72) and merged (886556d). Every run below was in headless
Chromium on Linux (Playwright) with synthetic campaigns in fresh profiles; no player save was used; nothing was
checked in Firefox.
- **Causes, reproduced on 12a9757:**
  - **A second battle while the first closed.** The creature you had beaten or stepped back from still touched
    you during the closing fade, with the mode already back to exploration, so it started a second battle.
    - The first battle's teardown cleared the second's creature list. The second's drawing then threw every frame
      (`reading 'left'`), and the exception ended the frame loop for good.
    - The battle UI sat over a frozen map: 2 battles started, 0 frames in 600 ms, and the crab's settle line
      played twice.
    - A window resize blacked the canvas. A same-page load left it black with 0 frames drawn; a page reload
      recovered.
  - **Contact checked against a stale mode** (the mode from before the frame's step). A tap on a crab started 2
    battles at once; a tap on the plaque beside a crab started a battle under the plaque's lines; a tap on the way
    out beside a crab started a battle during the map change.
  - **Scene ends** put every creature back on its starting tile, onto the player.
- **Fix:**
  - One battle at a time: `RB.game.startBattle` refuses while a battle is open or closing.
  - Creatures engage only in free exploration, never during a battle or its closing, and not for 1 s after one.
    Contact uses the current mode.
  - While the closing screen is dark, a beaten creature is gone. One you stepped back from backs off a step and
    stays calm for 5 s, and for as long as you touch it.
  - Creatures stay where they are when a scene ends.
  - The frame loop survives an error in any part of a frame, and a campaign change removes an orphaned battle
    overlay.
- **B `tests/e2e/battle_overlap.mjs`** (new, in the default suite) at 1280×800 and 390×844, with real keys, mouse
  and taps: **30 ok / 66 FAIL on 12a9757; 96/96 on 6fa0f72** (the worker's runs).
- **The worker's other runs on 6fa0f72:**
  - unit 15,388/0; validator no errors;
  - encounters 19/19, world_fixes 15/15, departures 20/20 (19/20 once while unit tests ran alongside: a Tsuru
    walk-in timed against world time);
  - battle_cycle stable (listeners 101 → 101, nodes 247 → 245);
  - combat_ui 7/7, combat_small 9/9, playtest_repairs 7/7, battle_pets_overworld --battles-only 3/3,
    shift_load_regression 18/18, town_animals 41/41, battle_group 6/6, companion_turn 4/4.
- **The lead's runs on the merged build (886556d):** unit 21,732/0; battle_overlap all ok; encounters all ok; combat_ui 7/7; playtest_repairs 7/7; interludes 76/76; departures all ok (one sequential run while other workers loaded the machine). On 96b60fd (with the travel rules): battle_overlap all ok again.
- **Not verified:** Firefox, where the black screen was seen; the whole-game drivers' timing with the new 1 s pause.

## Quick travel rules — the owner's report of 2026-10-03 (the Travel list on the Fishers' Cove)
The owner, on the Fishers' Cove (an outdoor beach), opened the Map to travel to Reedwake and was told "You can't
travel quickly from here. Step outside first." The cove carried `noTravel: true`, and one generic message,
written for buildings, served every map with the flag. Asked whether travel should be limited to towns, the lead
recommended "anywhere out in the open" and implemented that. The work was done in a worker branch (089f2b2) and
merged (c9cbee2). Every run below was in headless Chromium on Linux (Playwright) with synthetic campaigns in
fresh profiles; no player save was used; nothing was checked in Firefox.
- **Change:**
  - Travel works from anywhere out in the open when nothing is under way.
  - Inside a building, inside a dungeon or on a story-locked map, the Travel list says why in the place's own
    terms and where the way out leads (found through the exits usable now).
  - Every `noTravel` map is classified (`src/engine/52_travel.js`; docs/CONTENT.md "Quick travel: where it
    works"): 39 interiors, 26 dungeon rooms in 7 places, 2 story locks, and the Atlas rooms. The validator rejects
    an unclassified map.
  - Five open-air maps were opened: `sg.cove`, `co.upper`, `co.oldworks`, `co.lookout`, `sb.obs_path`.
  - At the merge the new lighthouse top was classified with the lighthouse ("You're in the lighthouse…").
- **Found and fixed on the way:** the folio opened over a conversation (History, then Map) offered Travel. A click
  moved the player to another town with the scene still running (modes `world>dialogue>menu`, 2 buttons on the
  unfixed build).
- **B `tests/e2e/travel_rules.mjs`** (new, in the default suite; real clicks at 1280×800 and 390×844): **0/10 on the
  unfixed build (6e6f079), 10/10 on 089f2b2** (the worker's runs, twice). It covers:
  - the cove travelling to Reedwake with the companion, the pet, the checkpoint and an autosave request;
  - the building, dungeon and story-lock messages;
  - no travel over a conversation, restored after it.
- **The worker's other runs on 089f2b2:** unit 15,720/0 (`travel_rules.test.mjs` adds 332: every map classified,
  exact messages, the validator rule including a kanji without furigana); validator no errors; systems 4/4, folio
  151 ok, ui 14/14, world_fixes 15 ok, departures 20 ok, quest_guide 55 ok, known 22 ok, atlas.check 15 ok.
- **The lead's runs on the merged build:** on 96b60fd: validator no errors; unit 22,067/0; travel_rules 10/10; systems 4/4; folio all ok; lighthouse_top 76/76; battle_overlap all ok.
- **Not verified:** the Atlas message in a browser; Firefox, Safari or a real phone.

## Zone music — the owner's requests of 2026-10-03 (a score per zone, Japanese instruments, rising intensity)
The owner asked for thematic music for each zone (overworld, battle and boss), rising in intensity through the
story without becoming epic, using Japanese instruments such as the shamisen, with Reedwake kept as it was and
cues for important scenes. The route north of Saltglass still played Chapter 1's road theme. The work was done in
a worker branch (02e86c7 … 25b6bed, on 340bf68) and merged (7deb98f). **Nobody has listened to it**: every
musical judgement is analysis.
- **Instruments, synthesised in code** (no samples, no libraries):
  - Strings: shamisen and biwa (a sawari buzz, a plectrum click, a pitch drop at the strike), koto, koto_oshi.
  - Winds: shakuhachi (meri scoop, breath, muraiki), shinobue, shō.
  - Bell: rin.
  - Percussion: ōdaiko, shime, taiko rim, kotsuzumi, ōtsuzumi, hyōshigi, atarigane, chappa.
  - Measured by `tests/e2e/audio_instruments.mjs`. The shamisen starts 15 cents sharp and settles, with 32.5 % of
    its late energy above the 6th harmonic (the buzz). koto_oshi starts −198 cents; the shakuhachi has more than
    twice the flute's breath energy; the ōdaiko peaks at 86 Hz and rings 0.61 s.
- **Per chapter:**
  - Chapter 1 is unchanged: identical events, and renders that differ by at most 2e-5.
  - Chapters 2–6 and the Atlas have route, town, dungeon, battle and boss themes, plus scene cues (docs/AUDIO.md).
  - `RB.audio.battleSong` picks a fight's theme by zone. After a fight the map's own music returns.
  - No map outside Chapter 1 plays Chapter 1's road theme.
- **Intensity** (unit-tested, `tests/unit/audio_zones.test.mjs`): the battle themes' score, tempo, note density and
  percussion weight rise strictly from chapter to chapter (score 4.50 → 9.72, 100 → 120 bpm), and dissonance and
  layering never fall. Each chapter's battle theme sits below its boss theme (boss 8.62 → 9.93, 138 → 152 bpm).
- **Loudness:** the zone songs open between −27.0 and −17.2 dBFS RMS (the originals −30.3 to −17.0). The highest
  whole-song peak is 0.581, against 0.585 for Chapter 1's boss. Nothing clips.
- **CPU** (offline 12 s windows on a busy shared machine): the heaviest is 31.3 % (`boss_hush`), against 29.8–34.3 %
  for Chapter 1's boss in the same run. Phone CPU was not measured.
- **The worker's runs** (on its branch):
  - unit 17,068/0 (audio subset 2,662/0); validator no errors;
  - audio_zones 69/0, audio_instruments all passed, audio.check all passed, combat_ui 7/0, battle_presentation
    13/0;
  - story_ch1 F mio, story_ch3 E nao, story_ch4 I ren go 53/53, story_ch5 A suzu, story_ch6 2 36/36;
  - pursue E mio across every chapter and an Atlas expedition: 10 battles, 0 problems, 0 page errors.
- **The merge:** the Chapter 3–6 map lines where the music changed `music` and the travel rules changed travel
  fields; both changes kept.
- **The lead's runs on the merged build (7deb98f):** unit 23,748/0; validator no errors; audio.check all passed, audio_zones 69/69, audio_instruments all passed, travel_rules 10/10, combat_ui 7/7, battle_overlap all ok, encounters all ok, interludes 76/76, lighthouse_top 76/76, playtest_repairs 7/7. On the next combined build (34ec977): unit 23,804/0, audio_zones 69/69.
- **Not verified:** listening (the owner's ears in Firefox and on the foldable are the real test); CPU on a phone.
  If the phone struggles, thin the Chapter 5–6 battle and boss themes first.

## The top of the lighthouse, and the view from height — the owner's reports of 2026-10-03
- **The reports:**
  - After Genzō says "I'll show you the top", the screen faded and the scene stayed on the ground floor while its
    lines described the top.
  - On the first version of the new map, the owner wrote that it "looks more like an island surrounded by water":
    the bottom edge should show the top of a tall stone structure, with Saltglass visible below and shrunk by the
    height. The owner asked for the same thinking for other elevated outdoor places.
- **Where the work came from:** a worker branch (28e415c, merged in 20277f1; then 2631046, 6b75609 and 45d24fb for
  the view from height, merged in 34ec977, together with the zone music). Every run below was in headless Chromium on Linux (Playwright) with
  synthetic campaigns in fresh profiles; no player save was used; nothing was checked in Firefox.
- **The map:** `sg.lighthouse_top`, an 11×8 stone gallery with the lamp room (green dome, the lens), the weather
  vane, the stairhead and a railing worn bare where Genzō holds it.
  - **Genzō climbs with you and is never in two places:** the ground-floor and top figures share `char: 'genzo'`
    and fade where they stand, and the flag that moves him is set while the screen is dark.
  - **Up and down:** the ground-floor stairs lead up once the vane scene has been seen. `sg_fog_cleared` is set
    two lines earlier in the same branch, so the vane and the sea change when the lines say so.
  - **The carving:** the lead drew the vane's fin carving as three wind lines, not a legible 風; the dialogue gives
    「{風|かぜ}」 with its reading.
  - **Travel:** the map is classified with the lighthouse ("You're in the lighthouse…").
- **The view from height (`src/engine/61_below.js`, `surround: { below, at, hide, scale, drop, shaft, … }`):**
  - **The ground map below:** the real ground map, drawn small through the game's own tile and prop drawing with
    the story state applied. The causeway fog shows until `sg_fog_cleared`; the lift redraws only the changed area,
    in 7–10 ms, pixel-identical to a full rebuild.
  - **How it is drawn:** a palette-preserving shrink, snapped to whole pixels per tile (0.3125 for the lighthouse,
    0.40625 for the lookout); haze toward the edges; a slight drift with the camera (still with reduced motion);
    the town's own sea, calm and then with whitecaps.
  - **The structure:** a stone tower drops from the gallery's south edge to its foot. The same treatment is applied
    to the Cinder Orchard lookout platform: timber legs over the village at night with its lanterns.
  - **Caching:** at most 2 cached views, released on leaving. The first build takes 395–538 ms (during the darkened
    map change); a rebuild takes 200–450 ms.
- **B `tests/e2e/lighthouse_top.mjs` (in the default suite): 106/106**, also with `--slow` (the game clock forced to
  a quarter of real time). It covers:
  - The scene ends beside the vane with the companion and pet.
  - Exactly one Genzō at every sampled frame, refresh and map entry; he never walks to a door.
  - The vane is one picture stuck and moving once free.
  - Landmark colours at their projected positions: 7 for the lighthouse, 8 for the lookout (with a night test).
  - The stone tower, the timber legs and the lanterns.
  - Calm sea, then whitecaps; the fog area; the drift; reduced motion; release on leaving.
  - "Later", down and back up; the stairs closed before the vane scene; a save at the top loading there.
  - The lookout's platform unchanged (0 exits, the way-down trigger, the bell, 22 walkable tiles).
- **An earlier failure:** on 20277f1, under heavy load, the test passed 73 of 76. The worker traced this to the
  test's own fixed 300 ms waits against a game clock that runs slower than real time on a loaded machine
  (reproduced with the clock forced slow). It now waits for each step to finish.
- **The worker's runs on 45d24fb:** validator no errors; unit 22,067/0; departures 20/20, characters 23/23,
  world_view 20/20, interludes 76/76, travel_rules 10/10.
- **The lead's runs on the merged build:** on 34ec977: unit 23,804/0; lighthouse_top 106/106; combat_ui 7/7; playtest_repairs 7/7; battle_overlap all ok; travel_rules 10/10; interludes 76/76; world_view all ok; audio_zones 69/69. (In a scratch merge before that: lighthouse_top 106/106, travel_rules 10/10, world_view and departures all ok.)
- **Evidence:** docs/screenshots/lighthouse_top/ (the scene, before and after the wind) and docs/screenshots/lookout/
  (the festival night and the village), at 1280×800 and 390×844.
- **Not verified:** Firefox (the owner's browser); a real phone; a person's judgement of the art. The town below
  is crisp in places, and more haze or a cooler tint may read as farther away.

## Settings in battle — the owner's request of 2026-10-03 (presentation-only sheet; no saving; Load and Return to title leave the battle)
- **What:** a Settings button in the battle, plus the menu key (C), opens the folio's Settings in a battle mode.
  - It offers speed and motion, audio, reading, display and battle display. The learning and rule choices are listed read-only until the encounter is over.
  - The encounter pauses while it is open (`RB.battleSeq.pause`) and resumes where it stood.
  - Every save route refuses while `inBattle()`.
  - Load and Return to title ask first. The campaign change then abandons the battle whole (`RB.combat.abandon`, `live()`), so nothing of it is written to the next campaign.
  - The audit is in docs/COMBAT_NOTES.md, "Settings in battle".
- **The worker's runs** (Chromium, on 34ba9eb unless noted): unit 22,067/0; validator no errors.
  - New `tests/e2e/battle_settings.mjs` (in the default suite): 10/10 at 1280×800 and 390×844, twice.
  - The same test on the unfixed build 96b60fd: 0/10.
  - A probe on 96b60fd: manual saves and autosaves were written mid-battle. A mid-boss load left the battle screen, its rules state, a running scene and the response layer over the loaded map.
  - settings 13 ok, combat_small 9 ok.
  - On 240d3d0: combat_ui 7/7, playtest_repairs 7/7, battle_overlap 96 ok, battle_presentation 13/13, ui 14/14, shift_load_regression 18/18 (file://), and 18/18 (http origin, on 34ba9eb).
- **The lead's runs on the merged build b4a598e** (with interludes, travel, zone music, lighthouse and the Harmony art): unit 23,856/0; validator no errors; battle_settings 10/10; settings all ok; combat_ui 7/7; combat_small all ok; battle_overlap all ok; playtest_repairs 7/7; battle_presentation 13/13; shift_load_regression 18/18 (file://); harmony_art 39/39.
- **The default suite** (run on b67d469, before this merge): 68/69 scripts passed. mill_road failed one check ("click the mill door: walked there and went in") while the whole suite was running. Run alone on 408c051 it passed 36/36. Treated as load-related; it has not recurred.
- **Not verified:** Firefox; the "slot open in another tab, then Cancel" path (only the unreadable-slot path ran); the default suite as a whole on this build.

## Animated dialogue portraits — the paired addendum §7 and the world review's WR-02 (merged 2026-10-03)

**What:** every speaking portrait has an idle loop, and every expression tag a one-off lead-in cue
(`src/ui/21_portrait_anim.js`; layers in `src/engine/35_portraits.js`).
- **Idle loop:** blink, breath, glance, sway and lens glint, one motion at a time.
- **Eye-area fixes:** docs/expressive/PORTRAITS.md §3 items 1–8.
- **Display size:** whole device pixels per art pixel on desktop, so 96 CSS px at ratio 1 (was 116). The phone layout never grows.
- **Reduce motion:** shows the still.
- **Cost:** one 8 MiB byte-capped LRU for layers and frames.

**The worker's runs** (headless Chromium, on its branch at 28dfd61):
- Unit 23,851/0, including portrait_anim 47 checks.
- New `tests/e2e/portrait_anim.mjs`: 67 ok.
- ui 14/14, play_ui 35 ok, dialect_kansai 59 ok, company 61 ok, bookmarks all ok, interludes 76/76, equipment 53 ok.
- Box heights re-measured at 7 viewports: identical before and after.
- Costs: a first frame 4.8 ms median, 14.6 max; a cached frame 0.03 ms; the cache peaked at 4.6 MiB of 8 over 50 lines.

**The lead's runs on the merged build fe75862** (squash merge 1be42bd, with the battle settings, interludes, zone music, lighthouse and Harmony art):
- Unit 23,903/0; validator no errors.
- portrait_anim all passed; ui 14/14; play_ui all ok; dialect_kansai all passed; equipment all ok; interludes 76/76; battle_settings 10/10; harmony_art 39/39; company all passed.
- `tests/e2e/review_held_portrait.mjs` (WR-02 probe): 5 distinct images in 11 samples over about 5 s at both 1440×900 (96 CSS px) and 390×844 (64 CSS px). On 243069a, before the merge: 1 distinct image at both.

**Evidence:** docs/screenshots/portraits/:
- eye crops before/after, at 4× and at real size;
- sizes;
- held-still sheets for desktop and phone;
- cue sheets per companion;
- NPC idle frames;
- a 12-line conversation clip (webm) and its still.

**Not verified:**
- Firefox; a real phone.
- A person's judgment of the expressions and the eye fixes on all 85 human faces; the worker looked at about 20 by eye, and the rest only through automated invariants.
- Phones at ratio 1, 2 and 2.625 still downscale the 64-px portrait unevenly.
- NPC cues outside the bespoke set share the generic variants.

## Harmony painted art — contract v2, machine side (the lead's brief of 2026-10-03; REQUIREMENTS.md HB3–HB8)
- **What:** the exact contract the painted busts are checked against, and an importer and runtime path that work
  with no art yet delivered. docs/harmony/contract/CONTRACT.md; `RB.harmonyContract` (src/ui/88_harmony_contract.js);
  the registry export (tools/harmony_registry.mjs → docs/harmony/contract/registry.json); the importer
  (tools/harmony_import.mjs, tools/harmony/*.mjs, no dependencies); the raster path (src/ui/88_harmony_raster.js and
  hooks in 88_harmony_art.js); build embedding (tools/build.mjs); a SYNTHETIC sample (tests/fixtures/harmony_sample/).
- **The worker's runs** (headless Chromium 141, a shared 4-core machine; on d8f44b3, this worktree):
  - Validator: no errors. Unit, whole suite: 23,996/0. Of these, new: harmony_png 26/26, harmony_import 51/51,
    harmony_raster 63/63; harmony_art 52/52 (unchanged test).
  - Browser: `tests/e2e/harmony_raster.mjs` 21/21 (three runs, one with `--sheets`); `tests/e2e/harmony_art.mjs`
    39/39 (unchanged test; its art_test_results.json was restored, not committed).
  - The importer on the sample: 30/30 files, 0 errors, 11 warnings (outline snaps, the magenta key, the 1024 square's
    centring); `--verify` ok. Grid detection exact at 1×, 2.5×, 3×, 4×, 5.333× (1024 / 192), 6.4×, and within the
    noise at 4× and 5.333× with ±8 noise per channel (unit).
  - Code path unchanged: a node hash over 144 code compositions, both backings, keys, sizes and scales was equal
    before and after (unit and browser tests compare too); the asset-free build differs from 243069a's only in the
    sections of 88_harmony_art.js and 88_harmony_cast.js (an opt-in `keepLayers` hook) plus the two new modules;
    `--harmony` pointing at nothing gives a byte-identical build.
  - The reference sheets were regenerated (`node tests/e2e/harmony_asset_refs.mjs`): the identity sheets came out
    byte-identical; the templates and palette sheet changed to contract v2.
- **Measured budgets:** CONTRACT.md §10 and docs/harmony/contract/budgets.json.
- **Evidence:** docs/screenshots/harmony/raster_sample/ (every image labelled SYNTHETIC SAMPLE — not art).
- **Not verified:** any real painted art (none delivered); the cut-in overlay (src/ui/82d_harmony_cutin.js, not on
  this branch) playing `timeline()` in a legal battle — the API was matched to that worker's source, not run with
  it; Firefox and Safari (`createImageBitmap` options, decoding); a real phone (compact scales are arithmetic);
  the default browser suite as a whole on this build; the sample's look (it is code art, mirrored, with reversed
  worn sides, and not a style reference).

## World review — landmarks, Masaru's bakery, Nao's floorboard, the observatory's headroom (2026-10-03)
From the owner's external world review (WR-04, WR-05, and two listed checks: Nao's missing floorboard and the
observatory's headroom). Art and one camera option; no text, scene, item or system changed. Every run below was in
headless Chromium on Linux (Playwright) with synthetic campaigns in fresh profiles; no player save was used.
- **What:** the four long-quest landmarks drawn at art resolution (`src/content/lq/15_art.js`); the bakery fitted
  out (`src/content/ch5/11_bakery.js`: `lf_oven`, `lf_breadrack`, `lf_kneadbench`, `lf_floursacks` in place of the two
  stoves, the bookcase and one crate, plus the bench at 2,3); `rw_floorgap` at rw.warehouse 5,5
  (`src/content/ch1/12_floorgap.js`); a per-map `headroom` in `src/engine/60_render.js`, 2 rows on sb.obs_path.
  Notes: docs/ART_DIRECTION.md §8 "Landmarks, the bakery, a floorboard and the observatory's headroom".
- **Recorded before the change** (the build at 243069a): `tests/fixtures/landmarks_before.json` — each landmark's
  w/h/block/light, placement and conditions, the static and current blocking of lq.koharu, sb.road and lf.gardens, and
  every tile each landmark is used from (and the scene that starts there), through the real `interact()`.
- **New `tests/e2e/landmarks.mjs`** (in run.mjs): 54/54 on this build. Its first version (40 checks) on the build
  before: 29/40 — the geometry, placements and use tiles matched the record; the draw2, bakery-fitting, floorboard and
  headroom checks failed, as expected. It also presses the action key at the great tree from below and above, checks the bakery's order table and
  Masaru are reachable from the door, Nao (rw.nao_first) and the crates (rw.crates) from the warehouse door, and the
  dome's top pixel on screen at 2000×1090, 1440×900, 390×844 and 844×390 with the HUD buttons clear of it (by 74, 82,
  15 and 8 css px; at 1.5 rows of headroom the phone's Word help button touched it, so it is 2).
- **Geometry record:** `tests/unit/overworld_geometry.test.mjs` failed on lf.bakery and rw.warehouse only (deliberate:
  new props); their two records and the five new prop kinds were updated in the fixture, nothing else.
- **Runs:** validator no errors (the same 15 warnings as before); unit 23,856/0; landmarks 54/54; and, on the same
  source before a comment-only edit: long_quests --fixtures-only all passed, world_view all ok, world_fixes all ok,
  story_ch1 F mio 31 checks, story_ch4 I ren go 53/53, story_ch5 A suzu 44 steps, cases all passed, quest_guide all
  passed, encounters all ok, backdrops 61/61, battle_backdrops 38/38 (12/12 scripts).
- **Evidence:** docs/screenshots/landmarks/ and docs/screenshots/bakery/, `before_*` (the build at 243069a) and
  `after_*`, at 1280×800 and 390×844 (the observatory at its four sizes), and a 3× close-up sheet of the four props
  (`*_closeup_3x.webp`), all from the real renderer and camera (`tests/e2e/landmarks_shots.mjs`). One file is over the
  80 KB aim: after_observatory_2000x1090.webp (99 KB).
- **Not verified:** Firefox; a real phone; a person's judgement of the art (self-review only); the default suite as a
  whole; NPC behaviour at the new bench (left to the worker on NPC actions).

## Overworld actor system — expressive addenda, work packages D and (a) (poses, gestures, mannerisms, idle life, scene direction; the world review's WR-01, WR-03, WR-06)
Built in a worker branch on the task branch at 6306dfa. The design, the scheduler's rules and the legibility of each
primitive at play scale are in docs/expressive/GESTURES.md §9; the ledger rows are HX28–HX38 and WI1–WI24 in
docs/expressive/CONTRACT.md. Every browser run below was in headless Chromium on Linux (Playwright) with synthetic
campaigns started in fresh profiles; no player save was used; nothing was checked in Firefox, Safari or on a phone.
Other workers' browser runs shared the machine, so the timings are noisy.
- **Change:**
  - **Pose layer** (`src/engine/32g_spritepose.js`, hooks in `32_spriteart.js`): 118 named key poses and 25 held
    objects drawn from the walking figure's own parts at 40 × 58, cached per look × direction × key (LRU, cap 900).
  - **Gestures** (`51_gestures.js`): the 32 primitives of §11.2 (entry → peak → recovery, 250–700 ms to the peak,
    handovers 600–1,200 ms, a held key pose for reduced motion) and 44 idle habits and occupation loops.
  - **Profiles** (`51_mannerisms.js`, `src/content/mannerisms/10_cast.js`): 12 class overlays, 76 authored
    profiles (26 bespoke); everyone else derived from station and tool, never from glasses, age, dress, gender or
    skin tone.
  - **Scheduler and scene cues** (`52_staging.js`, hooked into `50_world.js`, `60_render.js`, `70_script.js`):
    idle life on screen only, capped, seeded per person; restraint moods (Lanternfall before its bell, the Archive
    road, the Snowbell inn on the storm night); everything yields at once to a scene, a key, a battle, a menu or a
    map change; a tool in hand stays in hand through a conversation.
  - **Script ops** `!gesture !look !pose !walkto !prop !beat !ambience` (validator, quest guide's command list).
  - **Staged:** `sg.omi_wataru` (both routes × 4 companions), Ch1 `rw.hana_first`, Ch3 `co.suzu_night` (the
    faded passage of SHOTS.md §7b: the night line is said over the room), Ch4 `sb.yae`, Ch5 `lf.mio_refuse`, Ch6
    `sa.isamu_return`, and Hiro's working introduction `co.hiro_first` (WR-03). No line, condition, reward or
    `!music` cue changed. Practice B's reference into `sg.omi_wataru` moved to command 34 (same line).
  - **Shared random state:** world blink and glance timers (`50_world.js`) and the weather (`60_render.js`) now
    draw from their own xorshift streams, and the scheduler from per-person seeded hashes; nothing in the actor
    system calls `Math.random`, which picks language tasks. Foes' patrol steps still use it (outside this package).
- **U `tests/unit/actors.test.mjs` (new): 180/180.** The library is complete (32 primitives, one per number,
  timings, a held pose each, legibility recorded); every primitive drawn for 7 looks × 3 views (no blank frame,
  every standing pose on the foot anchor, nothing touching the frame edge, every `full` primitive's peak changes
  at least 10 art px from the front and the side); a cane hand never leaves the cane; frame-key parsing; the
  cache is bounded; 76 profiles, every habit, tell and stance real; every overworld NPC placement (190+) has a
  profile it can live by; the ops parse and none is a state op in disguise; two simulated minutes in Reedwake are
  deterministic per seed, never more than four people busy; a scene stops idle life at once; cues take people for
  the scene, an early advance settles them, holds and chains settle to their peak, the scene's end releases them.
- **U** full suite on the final build: **23,994/0**. The first full run failed 1 check in
  `pace_noclock.test.mjs`: the restraint moods had a key named `pace:`, which that test's source scan reads as a
  pace option for the challenge runner. Renamed `slower:`; 23,994/0 after.
- **Validator** on the final build: no errors (15 warnings, none from the new ops). Scene manifest regenerated.
- **B `tests/e2e/actor_life.mjs` (new, in run.mjs): 39/39.**
  - One representative area per chapter (rw.village, sg.harbor, co.eve, sb.hamlet, lf.gardens, sa.camp), 16 s
    each: 2–12 people change their drawn pose; at most 1–2 things at once against a cap of 1–4; nobody off screen
    does anything; no page errors.
  - The player idles after a few seconds still, and a key press clears the player's and the companion's idles at
    once; a line opening stops every habit by the next frame; two neighbours turn to face each other for a word; a
    wanderer pauses on their round; standing still facing a noticeboard, the companion turns to look at it about
    2.7 s later (the shared stillness, at most once a minute).
  - Reduced motion: nobody starts a habit, every drawn pose holds still, resting stances still show.
  - The same seed gives the same choices per person in two fresh pages (13/13); another seed does not (2/9 alike).
  - Contact sheets from the dev viewer (`?dev=actors`, labelled synthetic).
- **B `tests/e2e/actor_workplaces.mjs` (new, runs on its own, about 5 min): 29/29.** Each workplace watched 45 s
  from the door in a real story state (the world review's WR-01): the Harbourmaster's office before the
  confession (Omi writes, the brush in her hand), the Cinder glass workshop before the festival (Hiro turns the
  blowpipe and works the gather; Isao observes), the Snowbell inn on the storm night (Yae stirs and counts; the
  sheltering guests look to the road, nobody bounces), the Lanternfall bakery before the bell (Masaru only checks
  and counts: his kneading waits on the bakery props, TODO in his profile), the Archive camp (Isamu sits by the
  fire). No routine moves anyone off their place or into a doorway; at most 1–3 things at once. Talking to Omi,
  the brush stays in her hand, she faces you and no habit plays; she writes again about 2 s after (1.9 and 2.1 s in two runs). Hiro keeps
  the pipe turning on "can't let go of this", holds the gather still to cool when he says he will listen, and
  goes back to the pipe about 3.9 s after the scene. Observation log: `docs/screenshots/actors/workplaces.txt`.
- **B `tests/e2e/staging_wataru.mjs` (new, in run.mjs): 112/112.** `sg.omi_wataru` on both routes with each of
  the four companions: the scene plays to its end with the lines and the conditional line as written; Omi's
  acknowledgement once, on his own route; Wataru takes the forward place before his first line; the notice
  passes from your hand to his and he reads it; the companion reacts in their own way (Suzu's lowered head only
  when she is there; her hand-on-hip stance never shows); nobody shares a tile or stands on furniture; no idle life
  during the scene; the office plausible at the end; staged and unstaged runs end in the same flags, inventory,
  quests, variables, notes and seen scenes. Also: the cue log per line, a fast reader (every cue settles on an
  early advance, no waits), and reduced motion (held key poses).
- **B `tests/e2e/staging_chapters.mjs` (new, in run.mjs): 66/66.** `rw.hana_first` (both replies),
  `co.suzu_night` (both replies: "That night, Suzu is sitting alone…" is said over the room, not a black screen;
  she sits on the raised floor's edge in the night ambience, which ends with the scene), `sb.yae`,
  `lf.mio_refuse` (before and after the bell), `sa.isamu_return`: each plays to its end, the cued people perform,
  nobody shares a tile or stands on furniture, no idle life during it, people back at their places and the
  companion beside you after, the same end state staged and unstaged, no page errors.
- **Other runs on the final build:** characters 23/23, departures 20 ok, world_view 20 ok, town_animals 41/41,
  quest_guide 55 ok (its screenshots restored afterwards), story_ch1 F mio PASS (31 checks), interludes 76/76,
  practice_b 6/6.
- **Performance** (actor_life, the Cinder Orchard eve, 14 people, 1280 × 800, 300 frames of world update +
  render each way, over several runs): with the actor system p50 1.9–2.3 ms, p95 3–6.7 ms; with it switched off p50
  1.9–2.1 ms, p95 2.9–6.8 ms (the difference is inside the noise of a shared machine); the scheduler 0.09–0.12 ms a
  tick on average (max 0.4–3.1 ms); 35 posed frames built on that square (cap 900), the slowest 5–12 ms, once,
  the first time a pose appears.
- **Evidence:** `docs/screenshots/actors/`: `gestures_*_down.png`/`_right.png` (the 32 primitives, entry · peak ·
  recovery), `profiles_bespoke.png`, `profiles_overlay.png`, `life_ch1…6_*.png`, `workplace_*.png` and
  `workplaces.txt`, `wataru_self_*.png`/`wataru_party_*.png`, `ch1_…ch6_*.png`; clips in `video/`:
  `idle_life_co_eve.webm` (14 s of the eve's square), `wataru_omi_self_route.webm`, `wataru_omi_party_route.webm`
  (the scene with Mio, about 37 s each, 1280 × 800 scaled to 960 × 600).
- **Not verified:** Firefox, Safari, a phone; a person's judgement of the poses at play scale (the legibility
  grades are my reading of the contact sheets plus the unit test's pixel floor); Masaru's kneading (the bakery
  props are another worker's); the staged scenes approached from another side, with an absent actor, or on a
  revisit; the other "Performed overworld" scenes of the manifest (the game-wide staging package).

**The lead's runs on the merged build** (actor system merged as `4a9c357` on top of the portraits, the Harmony
contract and the landmarks; tested in a scratch worktree before fast-forwarding):
- Unit 24,233/0; validator no errors.
- Browser: actor_life 39/39, staging_wataru 112/112, staging_chapters 66/66, landmarks 54/54, portrait_anim
  all passed, interludes 76/76, battle_settings 10/10, harmony_raster 21/21, quest_guide all passed,
  world_view all ok.

**Masaru's kneading, added by the lead after the merge:**
- The kneading bench now counts as a work surface.
- Masaru moved to (4,3), facing left, so the work reads side-on.
- Results: overworld_geometry re-recorded for that one NPC place (3/3); landmarks 54/54 (Masaru talked to
  from (4,4)); actor_workplaces 30/30 (the bakery: "lf_masaru works at their station before anyone speaks
  (knead)").

## Harmony cut-in and the four stage performances — the Harmony addendum §1–§10, §20–§21, §23.1–§23.4 (2026-10-03)

**What:** one paired portrait per committed technique, and a new stage performance for each pairing.
- **The overlay:** `RB.harmonyCutin` (src/ui/82d_harmony_cutin.js, src/styles/61h_harmony_cutin.css) runs on the battle's presentation clock. Its lifecycle is tokened: inactive → entering → holding → fading → disposed.
  - Normal 180 / 380 / 220 ms; Fast 100 / 220 / 160 ms of wall time; Instant none.
  - Reduced motion: a fade in where it stands.
  - Non-interactive: `pointer-events: none`, `inert`, `aria-hidden`.
- **Placement:** measured at each start and on every layout change. Every protected rectangle (now including the battle's Settings button) is kept 12 px clear of the drawn rows.
  - Fit order: standard → moved → compact (bare, smaller) → omitted.
  - Every omission is recorded in `stats().fallbacks`.
- **Setting:** "Harmony portrait flourish", default On, in the folio's Battles rows and the battle's own sheet. Off removes only the portrait.
- **Stage:** the technique's timeline is 2.30–2.45 s at Normal and 1.61–1.71 s at Fast.
  - Nao `opening`, Mio `draught`, Ren `ward_plane`, Suzu `curtain` (a full turn of the rig), with the player's rally terminals.
  - Mio's restoring, washing and knot are separate beats.
- **Dev viewer:** `?dev=harmony`, labelled synthetic.
- **Art timeline:** where painted art provides a timeline of states, the overlay plays it (docs/expressive/HARMONY.md §7).

**The worker's runs** (headless Chromium on a shared, loaded 4-core machine; the merged build with the task branch at 6f4fbda):
- Unit 24,315/0 (harmony_timing 82 checks); validator no errors.
- `tests/e2e/harmony_cutin.mjs --docs` 11/11:
  - core: 24 configurations, plus the portrait Off and a pet shown or hidden (30 in all).
  - never; plan (8 scenes); frozen frame; life; 20 cycles; setting; dev viewer; the painted sample (synthetic, Suzu, including 390×844 at ratio 3); evidence.
  - geometry: 7 viewports × 100 / 200 % text, 0 frames within 12 px of a protected rectangle.
  - The same layouts with the portrait Off at 1648×840, 1280×720 and 390×844.
- combat_ui 7/7, combat_small 9 ok, playtest_repairs 7/7, battle_presentation 13/13, battle_party 14/14, battle_cycle stable (listeners 104 → 104, nodes 247 → 245 over battles 5–20), battle_overlap 96 ok, companion_turn 4/4, harmony_art 39/39, harmony_raster 21/21, battle_settings 10/10.
- `tests/e2e/battle_invariance.mjs --tech`: 96 configurations (4 pairings × 1 / 3 creatures × Normal / Fast / Instant × motion × the portrait On / Off), 8 fixtures, every fixture identical.
- **After the merges:**
  - The life test now changes campaign for real; since the battle-settings merge, a campaign change abandons the battle whole.
  - The dev viewer's group of two at 1280×720 is the recorded omission.
  - The unit stub fits the art's getter-only `timeline`.
  - The new Settings button is protected.
- **Not mine, seen in passing:**
  - Listener and node growth per encounter. One page that starts encounters from fresh synthetic campaigns and leaves them grew by listeners 204 → 418 and nodes 1,372 → 4,844 over encounters 5–20. The base commit grew the same way. battle_cycle, a different flow, stays flat. **Later investigated: not a game leak.** The harness kept Playwright element handles; see "The per-encounter listener and DOM growth" below.
  - At 390×844 the action banner overlaps the Skip button (compact_390x844_ren.webp).

**Evidence:** docs/screenshots/harmony/cutin/ contains:
- a real-time WebM of each pairing at Normal, 1280×720;
- the four stage performances with the portrait Off, as frame sheets;
- the compact cut-in at 390×844;
- `cutin_results.json`.

**Not verified:**
- Firefox; a physical phone; a person's judgement of the performances and the portrait's timing.
- 200 % text beyond the slider's 150 %: it was reached only by setting `textScale` to 2.
- Painted art other than the synthetic sample.

**The lead's runs on the merged build with the Harmony cut-in** (fast-forward to `95f4708`, plus a ledger commit):
- Validator: no errors. The rebuilt index.html is byte-identical to the committed one.
- Unit: 24,315/0.
- Browser:
  - harmony_cutin 10/10 (without `--docs`, so the worker's eleventh section, the evidence writer, did not run);
  - harmony_raster 21/21; harmony_art 39/39;
  - battle_settings 10/10; battle_overlap all ok; combat_ui 7/7; playtest_repairs 7/7;
  - portrait_anim all passed; actor_life 39/39; landmarks 54/54.

## The per-encounter listener and DOM growth — investigated (2026-10-03): not a game leak; the cut-in test held element handles

**Question.** The Harmony cut-in worker reported that one page running encounters back to back grew by about 13
listeners and 210 DOM nodes per encounter. It also grew on the base commit, and battle_cycle stayed flat.

**Method.** `tests/e2e/leak_probe.mjs` (new, a diagnostic outside the default suite):
- It wraps `addEventListener` and `removeEventListener` with weak references, so the probe retains nothing, and
  records each adding call site, mapped to its src/ file.
- Each cycle: a fresh synthetic campaign → a battle → optionally one full exchange (a response, its language
  task answered right, Continue, the companion's turn) → Step back.
- After each garbage-collected cycle it groups the live listeners by call site, target, and whether the target
  is still in the page.

**Results** (headless Chromium, build 4fc421e plus the battle_group test fix):

| Setup | Listeners | Nodes |
|---|---|---|
| Battle then Step back, 10 cycles | 104 throughout | 212 throughout |
| A full exchange each time, then Step back, 10 cycles | 104 throughout | 208 throughout |
| The cut-in test's own cycles section, unchanged | 208 → 253 | 1,433 → 2,149 (cycles 5–8) |

- **Unchanged cut-in cycles:** the connected page stayed at about 148 elements and the mode returned to the map
  every time. The growth was one **detached** learning-task panel per encounter: `.chal` with its choice grid and
  tab rail, listeners from `65_challenge.js` and `60_pad.js` guardTaps.
- **Cause:** that test called `waitForSelector` 12 times and kept every returned element handle. A handle held
  through the DevTools session keeps its element's whole detached subtree alive. battle_cycle already disposed
  its handles, which is why it stayed flat.
- **Fix, in the test only:** `waitSel()` releases each handle. The cycles section now asserts the page-wide
  counters stay flat from cycle 5 on (nodes within +40, listeners within +20).
- **Result after the fix:** 20 cycles: nodes 266 → 266, listeners 134 → 141. Listeners wobble 133–142 with no
  trend; the probe finds no call site that grows.
- **The whole harmony_cutin after the fix:** 10/10. Its cycles section: listeners 137 → 137, nodes 266 → 266.
- **No game code changed.**

**Found on the way: real, but not reachable by a player.**
- If the campaign changes while a learning task is open, the task panel stays in the page. So do its two
  `visualViewport` listeners (65_challenge.js line 474) and the abandoned battle's UI it references.
- My first probe did this by starting a new debug campaign over an open task. That added about 22 listeners and
  270 nodes a cycle.
- A player cannot do it: an open task is the top layer and swallows every key and the menu, and the battle's
  Settings sheet (with Load and Return to title) is not offered over a task.
- Left as is. The note is here in case a future path, such as an automatic campaign switch, ever needs it.

**Not verified:** Firefox; a real phone; long sessions outside battles (the world, practice activities, cases).

## World walk-ins step round standing people (2026-10-03; the staging worker's finding; REQUIREMENTS.md B2)

**What:** the world's own comings and goings (walking in to speak, walking off, the story moving someone to a new place on
the same map) used to plan their routes ignoring people. A walker only noticed you or the companion on bumping into you
(a 300 ms pause, one detour, then through after 1.5 s). It walked straight through villagers, creatures, and people
walking in or off.
- **Seen in the staging runs:** the see-off in Reedwake; Sōta moving down the harbour.
- **Now** (src/engine/50_world.js):
  - `routeRound` plans round everyone's tile (`peopleTiles`: you, the companion, placed people, walk-ins, people
    walking off, creatures). It falls back to the people-blind route only when there is no way round.
  - `followRoute` checks anyone in the way (`personAt`). It re-plans round them every 500 ms after a 200 ms beat, and
    goes on regardless only after 2.4 s of game time, so nothing stalls.
  - Staging's walks home use the same follower.

**The lead's runs** (headless Chromium on a loaded 4-core machine with five workers testing; build of this commit):
- **New `tests/e2e/walk_round.mjs`: all passed (17 checks).**
  - Sōta's move, planned round the companion and you, is on his old line from the start.
  - Four walk-ins in the Reedwake square, with the companion beside you. Two of them would have crossed someone on the
    old route.
  - Suzu leaving round a villager who steps onto her way.
  - Hana waiting about 2.8 s for you in the tea-house doorway, then going in.
- **The same test on the old routing code** (only the test hooks added): **4 failed.**
  - The two "planned from the start" checks.
  - Kasane walking through the villager at (17,17).
  - Suzu walking through the villager at (18,17).
- Unit 24,315/0.
- departures.mjs all ok, including its own "someone leaving steps round the player".
- **Finished after the commit** (same build, one at a time):
  - world_fixes all ok;
  - actor_life 39/39;
  - staging_wataru 112/112;
  - staging_chapters 66/66;
  - story_ch1: 4 companions × 30 checks, all PASS;
  - town_animals 41/41.
- Their re-captured evidence screenshots (docs/screenshots/actors/) differed only by capture timing, so the committed
  ones were kept.

**Not verified:** Firefox; a real phone; the staging worker's runner (on its branch, not merged yet). Its `world()`
classification still lists these overlaps as non-failures; it is to be tightened after the merge.

## Props balance, the review ledger, conversation continuity, portraits — the paired addendum's WI18, WI19, WI25–WI28 (merged 2026-10-03)

**What** (worker branch, final aa27e1a; the full record is docs/expressive/reports/props_review.md; the ledger is
docs/expressive/REVIEW.md):
- Props now follow their own text:
  - three kilns (a glassworks furnace cold until its story flag, a kiln with only embers, a kiln choked with ash and
    without a false seal mark);
  - the lighthouse lens, dim until its flag.
- 12 decorative glints no longer look like pickups.
- Every kind of lamp flickers more calmly (115+ placements); the great lamp keeps the lively flicker.
- Pools of light breathe on their own phases, so a map's lamps no longer pulse in unison.
- The campfire and Hiro's furnace are slower.
- 27 tables and desks show what their scene describes, with dashes for writing and never letters.
- The potter's wheel reads against the floor.
- People's share of on-screen motion rose at every measured place (e.g. the lighthouse 55 → 91 %, Snowbell square
  70 → 86 %). This depends on timing, so it is reported, not asserted.
- **New tests:**
  - `tests/e2e/props_balance.mjs`, now in the default suite: 48 checks. 13 of them fail on c2a799d, one per change.
  - Unit `conversation_continuity.test.mjs`: every staged gesture is inside the person's mannerism profile, or a
    documented escalation. 7 open findings are listed as KNOWN.
  - Unit `portrait_speakers.test.mjs`: all 88 scripted speakers have a portrait; the 45 major ones animate.
- **Open, not changed:**
  - two look-alike pairs (Tamae/Yae, Ōmi/Umi): an owner decision;
  - Asahi's heat habit beside her now-cold furnace;
  - idles that don't yet change with the story;
  - phone portrait scaling at DPR 1, 2 and 2.625.

**The worker's runs** (headless Chromium, shared machine):
- Unit 24,351/0; validator no errors.
- props_balance --places 48/48 (35/13 on c2a799d).
- landmarks 54/54; portrait_anim all passed; world_view all ok; town_animals 41/41; practice_a_desk 45/45;
  lighthouse_top 106/106; staging_wataru 112/112; staging_chapters 66/66; actor_workplaces 30/30.
- actor_life 37/39 inside the shared sequence. Its two timing checks passed 39/39 twice when run alone.
- The overworld geometry fixture is unchanged: only placement options changed. Geometry 3/3.

**The lead's runs on the merge** (task branch with the walk-round fix; the merged index.html is byte-identical to a
fresh build):
- unit 24,351/0;
- props_balance 48/48;
- walk_round all passed.

**Not verified:** Firefox, Safari, phones; a person's eye on the art (the contrast measure stands in for it); Atlas rooms
from the same seed differ by a few props between page loads (269–271 kind/option combinations), which was not
investigated.

## Harmony contract v3 — the owner's Art Direction Correction, machine side (merged 2026-10-03; REQUIREMENTS.md HB9)

**What** (worker branch, final 152411f; CONTRACT.md v3 and docs/harmony/contract/V3_REPORT.md have the full record):
- **Key families with free values.** The importer classifies by family, using a relative OKLab distance (inner 0.31,
  outer 0.34, margin 0.1), and keeps the painted colours. The runtime recolours each pixel along its family's curve and
  keeps its hue/chroma residual (factor 1).
- **A value floor of 0.05 L per step.** It opens 15 of the 63 target ramps that collapse at an extreme: white hair,
  skin 6, some accessory colours. On those, neighbouring values stay ≥ ΔE 0.022 apart. The other 48 ramps give v2's tones
  bit for bit for exact key shades.
- **Fit on the visible footprint**, taken as the union over the timeline:
  - 2048 × 1046 and 1680 × 1050 go from 1× to 2×, and 2560 × 1440 from 2× to 3×;
  - compact sizes: 1648 × 840 and 1440 × 900 at 2×, 768 × 1024 at 2.5×, 844 × 390 at 1× (there the portrait is omitted:
    no clear place).
- **Reduced motion:** `peak` held, a 100 ms cross-fade, then `settle_b` held.
- **Approval states** in the manifest, `stats()` and the dev viewer.
- **Approved source art** goes in art/harmony/source/ (with PROVENANCE.md) and regenerates byte for byte.
- **Batches 1a and 1b** in the registry.
- **The checkerboard detector** is hardened (a grid fitted to light near-neutral pixels; it now catches padding
  checkerboards and noisy greys).
- **New fixture** `tests/fixtures/harmony_rich/` (9–11 values per material, with jitter, rim lights and highlights):
  calibration 0 misclassified and 0 unresolved over 38,154 material and 2,138 fixed pixels. The recolour proof sheets
  are in docs/screenshots/harmony/recolour_v3/ (SYNTHETIC).

**The worker's runs:**
- Unit 24,365/0; validator no errors.
- harmony_raster 26/26 (four runs); harmony_art 39/39.
- battle_settings 10/10, combat_ui 7/7, playtest_repairs 7/7.
- battle_invariance --tech: 96 configurations, all identical.
- harmony_cutin: a first full run 7/4. The failures were timing (a frame within 12 px of the withdrawing response dock;
  an element already gone; "holding" not reached under load). Each passed alone, and a second full run was 11/0.

**The lead's runs on the merge** (task branch with the walk-round fix and the props merge; the merged index.html is
byte-identical to a fresh build; registry.json regenerated for this branch):
- unit 24,401/0;
- browser, one at a time: harmony_raster 26/26; harmony_art 39/39; harmony_cutin 11/11, including the painted geometry at 2048 × 1046 and 1920 × 1080, and painted reduced motion as two held poses.

**Not verified:**
- Real art: every number is synthetic, and the calibration must be rerun on Batch 1a.
- The unresolved band is narrow, so eyes or metal painted near a family will need masks.
- Whether recoloured forms read well, and whether white hair still looks white with the value floor, needs the owner's
  eye.
- Firefox, the owner's actual 2048 × 1046 view, phones.

**Open:**
- At 1366–1600 px wide the standard pair is chosen at 1× (faces about 52 px) although the compact pair would fit at 2×.
  The overlay's 48 px face threshold could move toward the mockup's size.
- The response dock withdraws over 200 ms while the portrait finishes entering at 180 ms, so under load one frame can
  touch the dock. This predates v3; aligning the two durations would fix it.

## Chapters 1–2 staged: every "Performed overworld" scene directed (merged 2026-10-03; HX33–HX36, HX39, HX40 for Ch1–Ch2)

**What** (worker branch, final 6ae3611; record in docs/expressive/reports/staging_ch1_ch2.md):
- 96 scenes staged: 36 in Chapter 1, 60 in Chapter 2. Each carries a `# Staged:` note.
- 136 of the 138 drafts are decided in `tools/scene_curated_ch12.mjs`, and SCENES.md and scenes.json are regenerated.
- 30 scenes are decided "performed" but not staged: lq 17, cases 6, pages 3, pets 4. They were outside the worker's files.
- **New pieces:** the `wave` gesture, seven held props, and a one-line `rejoin()` fallback in 52_staging.js.
- **Quoted lines kept working:**
  - 13 quoted lines in practice_b were re-pointed after the cues moved them;
  - `79_compare.js` keeps a sighting saved under a line's old position when the scene and the text match, so old
    saves keep their comparisons;
  - no save field or schema changed.

**The lead's integration** (on top of the walk-round fix and the props/continuity merge):
- **The conversation-continuity check** (from the props merge) failed 75 times on the newly staged gestures, across 56
  person/gesture pairs. Resolved:
  - Gestures that fit each person were added to their conversation list:
    - the player;
    - Nao (shrug, head shake, open palm, emphatic, looking away);
    - Mio, Ren, Suzu;
    - Genzō, Ōmi, Wataru, Tamae, Tomo, Tsuru, Shiori, Sae, Mame, Asahi, Fuku, Yasu, Nagisa, Kiyo.
  - Anger tells: Nao's emphatic hand, Genzō's folded arms.
  - Six everyday actions any person may do when a scene calls for it: wave, a hand to the ear, shading the eyes,
    writing, a stretch, wiping the brow.
  - Tsuru's stronger reaction moved to the real farewell, `rw.seeoff`: she lowers her head as you look back.
  - Two openers documented as narrated or spoken escalations: Bunta, Sae.
  - Two of the earlier open findings are resolved by the profile additions: Ren's bow, Suzu's head shake.
- **Two false positives fixed in the check:**
  - a companion's cue was compared with another companion's branch line;
  - a tense opener that is the person's own tell was flagged when the gesture was also in their ordinary list.
- **Pronoun slips fixed in four player-visible lines.** The specification and the story use they/them for Nao and Ren:
  - the practice comparison about Ren;
  - Nao's "take half" support line;
  - two pet greetings.
- **The staging runner now fails on world walkers passing through people.** Only a walker that found no way round and
  waited before going on (`forced`, set in 50_world.js followRoute) is recorded apart.
- **Runs:**
  - unit 24,966/0;
  - validator: no errors;
  - the merged index.html is byte-identical to a fresh build before the lead's edits;
  - Chapter 1–2 staging in the browser: see the next line.
- **The lead's browser runs on the fully merged build** (3cf1e06: walk-round, props, contract v3, staging, Nao/Mio), one
  at a time. The staging runner now fails on world walkers passing through people.
  - staging_chapters: --ch=1 698/0, --ch=2 1623/0, --ch=showcase 66/0;
  - walk_round all passed; departures all ok;
  - practice_b 6/6; battle_anim 16/16.

**The worker's runs:**
- staging_chapters --ch=1 698/0; --ch=2 1623/0 (after a runner fix for the wait between steps); showcase 66/0.
- actor_life 39/39, staging_wataru 112/112, departures and world_fixes all ok, story_ch1 8/8, practice_b 6/6.
- pursue.mjs through Chapter 2 with staging on (Mio twice, Ren): no problems, no page errors.

**Not verified:**
- How the scenes feel at play speed to a person.
- Real devices.
- Whether the dialogue box covers a listener (checked only on the lighthouse roof).
- Oral-history fragments carry no gestures.

## Nao's and Mio's Harmony stage performances, v2 (merged 2026-10-03; HX22, HX23, HX26, HX27; the owner's note "Nao and Mio's feel a tad lacking")

**What** (worker branch, final 97bd57a; record in docs/expressive/reports/harmony_nao_mio.md; HARMONY.md §7.1, §7.3):
- **Nao, Read the Opening:**
  - the courier pencil drawn from behind the ear (a new prop in the battle rig);
  - a side-on turn and step;
  - a dotted gold route sketched in the air, with waypoint ticks on the knots;
  - your thread runs along it, and both knots come loose at the same moment in one shared burst. That happens only when
    two really come loose; otherwise the route lands on the one.
  - the pencil goes back, a nod.
- **Mio, Clearwater Draught:**
  - the vial is drawn larger, uncorked and lifted high side-on;
  - a stream arcs over both of you, with ripples at both your feet;
  - the restoring glow shows only on whoever was below full;
  - a visible rinse only on creatures that really had Heat, mist or Gathering;
  - one drop to the knot; the cork back, a nod.
- **Timings:** Normal 2.35 s / 2.40 s, Fast 1.63 / 1.66 s; the first result at 1.25–1.32 s. The portrait is gone
  before the contact.
- **Rules unchanged.**
- Before/after frame sheets: docs/screenshots/harmony/cutin/perf_v2/.

**The worker's runs:**
- unit 24,322/0;
- battle_invariance --tech: 96 configurations, all identical (twice);
- harmony_cutin --docs 11/11 (two earlier runs under load had timing-only failures that passed alone);
- battle_party 14/14, battle_anim 16/16, battle_presentation 13/13, combat_ui 7/7, playtest_repairs 7/7;
- battle_overlap all ok; battle_cycle stable;
- harmony_perf_sheets --check: ward marks and anchors held in every frame; the pet reacted.

**The lead's runs:**
- The same merge on the contract v3 build, in a scratch checkout: unit 24,408/0; battle_anim 16/16;
  battle_invariance --tech all identical; harmony_cutin all passed; battle_party 14/14.
- On the task branch with everything merged: unit 24,973/0; the merged index.html is byte-identical to a fresh build.
- The lead looked at the 1280 × 720 sheets.
  - Nao's route, the shared burst and the turn read clearly.
  - Mio's lifted vial, the ripples at both feet and the rinse read. Her stream is a thin clean line that may want more
    weight: the owner's call. **Settled 2026-10-04:** the owner watched the four technique videos and found the
    reworked performances "pretty good": keep them as they are, the stream included.

**Not verified:** a person's judgement at play speed; Firefox; phones; the new sound accents were not listened to.

**Open:** docs and code comments from this merge call Nao "he"; the specification and the story use they/them. To be
tidied.

## Illustrated sequences, wave 1: the player, the prologue on manual advancement, three sequences (merged 2026-10-03; HX41–HX53, HX44, HX69)

**What** (worker branch, final 9ad725e; the record is docs/expressive/reports/sequences_wave1.md; the API is SHOTS.md §0.1):
- **`RB.sequence`** (src/ui/43_sequence.js, the drawing kit 43_sequence_kit.js):
  - a tokened player: entering → presenting → holding → advancing/reviewing → exiting → disposed;
  - manual only. Next reveals, then advances. Previous is read-only. Replay this shot; Hide text; Skip asks first when
    the scene is unseen. Escape never discards;
  - while a picture shows: moves finish at once, `!shake` and `!fade` don't fire, skip stops at challenges and
    battles;
  - an optional per-line seen record (`seq: {}`, filled by migrate; no schema, key or slot change);
  - a read-only replay under Company › Shared memories;
  - a `?dev=sequences` viewer, labelled SYNTHETIC FIXTURE.
- **Sequences:**
  - `ch1.bridge` (5 shots);
  - `ch2.notice` inside `sg.omi_wataru` (4 shots, both routes);
  - `ch2.plate` (3 shots), filling the faded passage `sg.asahi_name`.
- **The prologue is on manual advancement:** no duration `next()`. "Skip the prologue?" is asked once per device
  until it has been watched.
- **New default keys:** P/PageUp Previous, R Replay shot, I Hide text. They can be remapped and collide with nothing.
- **New ops:** `!sequence <id> begin|end` and `!shot <shot> [phase]`, checked by the validator.

**The worker's runs:**
- On its merge with the staging build (5d012cc):
  - unit 25,044/0; validator clean;
  - sequence_manual (full) 64/0;
  - staging_chapters 2,386/0; staging_wataru 112/0;
  - story_ch1 F mio PASS; walk_round passed;
  - prologue 100/0; create 382/0; interludes 76/0; sequence_dev 9/0;
  - quest_guide and company passed.
- Earlier, on 0746026: ui 14/0; departures, settings, play_ui, bookmarks and dialect_kansai passed.
- sequence_manual covers:
  - 60 s idle on the prologue and on the Chapter 1 and 2 shots, with word help open;
  - reveal then advance; a held key; rapid clicks; touch; remapped keys;
  - read-only Previous; confirmed Skip;
  - reduced motion;
  - focal areas at three sizes;
  - memory replay;
  - 20 cycles: listeners 97 → 97, nodes 244 → 244.

**The lead's runs on the merge** (the task branch with everything above; the merged index.html is byte-identical to a
fresh build; scenes.json and SCENES.md regenerated):
- unit 25,051/0; validator clean;
- browser, one at a time, on the fully merged build (ab5a23b):
  - sequence_manual (full) 64/0;
  - prologue 100/0; create 382/0; interludes 76/0;
  - staging_wataru 112/0;
  - story_ch1: 8/8 PASS (profiles A and F × four companions);
  - harmony_cutin 11/0.

**Not verified:**
- A person's review of the art and pacing.
- Firefox, Safari, real phones and touch.
- Large text; text-to-speech during a sequence.
- On a phone held sideways only a band of each picture shows above the dialogue sheet (faces kept in view).
- HX70 cut-in cycles inside sequences.

**Open:**
- A press during a shot's 350 ms fade-in only finishes the fade, so a fast reader may feel one press "eaten" at each
  shot change.
- The noren in ch1.bridge repeats the approved prologue's ring-and-dot crest (a mark, not a letter).

## Illustrated sequences, wave 2: Chapters 5 and 6, and the boat crossing (merged 2026-10-04; HX41, HX42, HX52, HX53, HX71)

**What** (worker branch, final 2ad4915; the record is docs/expressive/reports/sequences_wave2_ch56.md):
- **`ch5.bell`, in `lf.bell_touch`, 4 shots:** the bell from below; the strike (one swing replaces the screen shake,
  which SHOTS.md §0 and §5 prescribe); the town lighting street by street; the chamber, where the voice is a ring on the
  water and is never drawn.
- **`ch5.boat`, in `lf.boat_to_tower`, 1 shot:** the faded passage filled with a cut at the water's surface, showing
  the boat, the drowned town below and the tower ahead. It has one composition because the passage has one line.
- **`ch6.toya`, in `sa.toya_read`, 5 shots:** one of them only when the bell is carried. Papers carry marks and stamps
  only, never writing.
- Faded passages filled: 5 of 9.

**The worker's runs** (on its branch, identical to this merge):
- unit 25,091/0; validator clean;
- sequence_chapters_56 144/0: 11 branch runs with real clicks, the 8 s idle, read-only Previous, Skip asking first,
  reduced motion with no shake, focal areas at three sizes, memory replays;
- sequence_manual --quick 64/0;
- story_ch5 8/8; story_ch6 all 5 runs ok;
- interludes 76/0; staging showcase 66/0; sequence_dev 9/0.

**The lead's runs:** unit 25,091/0; validator clean; the merged index.html is byte-identical to a fresh build;
scenes.json and SCENES.md regenerated.

**Not verified:**
- A person's review of the art.
- Phones, Firefox and Safari, taps; a 60 s idle; large text; TTS.
- When a long line pushes the dialogue sheet past 56 % of the height, a 1280 × 720 shot re-frames mid-way to its
  phone-sideways layout.

## Chapters 3–4 staged (merged 2026-10-04; HX33–HX36, HX39, HX40 for Ch3–Ch4)

**What** (worker branch `staging-ch3-ch4`, final 7b51b0a; the record is docs/expressive/reports/staging_ch3_ch4.md):
- 113 performed scenes directed, decided `(C)` in tools/scene_curated_ch34.mjs, and played on 481 branches.
- 16 drafts in lq, cases and pets are left with a proposal each.
- Six handovers are staged side-on; quiet nights at the futons; ten doorway step-offs.
- Sōsuke moved one tile (26,19), out from behind the well roof. The overworld geometry record was re-recorded; only
  sb.hamlet changed.
- Nine new props (no letters drawn); no new gestures.
- **No profile changes:** out-of-profile cues were swapped for in-profile ones. Two escalations the text performs are in
  KNOWN.
- practice_b indices moved: C04, C05, C06, C09.
- **The runner** resets every NPC to their place before each branch (no assertion weakened). Chapters 1–2 were rerun
  for it.

**The worker's runs** (final round, one at a time, no timing failures):
- staging_chapters: --ch=3 2267/0 (twice), --ch=4 1350/0, --ch=showcase 66/0, --ch=1 698/0, --ch=2 1623/0;
- story_ch3 16/16; story_ch4 8/8; side_ch3 3/3;
- actor_life 39/0; walk_round all passed;
- unit 25,704/0 (scene_manifest 546/0, conversation_continuity 754/0, practice_b 96/0, overworld_geometry 3/0);
- validator: no errors.

**The lead's runs on the merge** (with the Chapter 5–6 sequences; the merged index.html is byte-identical to a fresh
build; the manifest regenerates unchanged):
- unit 25,744/0; validator clean;
- browser, one at a time, on 91eb61f: staging_chapters --ch=3 2267/0, --ch=4 1350/0; sequence_chapters_56 144/0;
  walk_round all passed.

**Not verified:**
- Play speed with a person watching; real devices.
- Whole-story pursue.mjs runs through Chapters 3–4.
- Some speakers are heard before they are near (the world's placements).
- In the quiet nights the room brightens for a few frames during the morning fade.

## Illustrated sequences, wave 2: Chapters 3 and 4, three faded passages, and Ren's insert (merged 2026-10-04; HX41–HX53, HX45, HX71)

**What:**
- **Chapters 3–4** (worker branch, final f53c231; record in docs/expressive/reports/sequences_wave2_ch34.md):
  - `ch3.assembly`: 9 shots, kept as a memory, with a bell phase when the bell was rung;
  - `ch3.firebreaks`: fills the faded passage `co.festival_begin`;
  - `ch4.lamp`: three branches, kept as a memory;
  - `ch4.reply`: the hand-over, with a blank envelope;
  - `ch4.inn`: fills `sb.next_day_inn`;
  - `ch4.morning`: `sb.quiet_morning` keeps its line over the dark, then one window shot as the light returns.
  - The assembly's `!shake` became a comment: a shake can't fire inside a sequence, so the ink shot carries that beat.
  - Name marks are abstract dabs and strokes, never letters.
- **Ren's insert, `ch6.ren`** (the Chapter 5–6 worker, final f29408b; SHOTS.md §8.4): three shots on `sa.shelf_ren`'s
  open branch only. The folio opens; the teacher's face surfaces in ink; Ren takes off their glasses. It is kept as a
  memory, and no writing is drawn.
- Faded passages filled: **8 of 9**. `sb.quiet_morning` keeps its intended dark line.

**The workers' runs:**
- Chapters 3–4, final build:
  - unit 25,051/0;
  - sequence_chapters 121/0: every branch played by hand; idle; Escape and Skip ask first; Previous is read-only;
    Skip stops at a choice; reduced motion; focal areas at three sizes and several sheet heights;
  - sequence_manual --quick 64/0; interludes 76/0;
  - story_ch3 F/ren PASS (39 checks); story_ch4 A/mio 52/52 (earlier commit: 16/16 and 8/8).
- Ren's insert, final build:
  - unit 25,109/0;
  - sequence_chapters_56 196/0, four runs of `sa.shelf_ren`. One timing failure at load 8 passed alone. One real
    framing fault at 844 × 390 was fixed;
  - story_ch6 all ok; sequence_manual --quick 64/0; sequence_dev 9/0.

**The lead's runs on the merge** (the task branch with the Chapter 3–4 staging):
- SHOTS.md §7b conflict resolved: the Chapter 3–4 rows, plus the Chapter 5 crossing row;
- the merged index.html is byte-identical to a fresh build;
- unit 25,762/0; validator clean;
- browser, one at a time, on 55b97b1:
  - sequence_chapters 121/0; sequence_chapters_56 196/0; sequence_manual --quick 64/0;
  - staging_chapters --ch=3 2267/0, --ch=4 1350/0;
  - story_ch4: all 8 runs ok (52–53 checks each).

**Not verified:**
- A person's review of the art and pacing.
- Phones, Firefox and Safari; a 60 s idle; large text; TTS.
- On a 390 × 844 screen Ren is drawn small, and the glasses are a few pixels.
- The "Quest complete" notice shows over the first `ch6.ren` shot at 844 × 390 until it fades.
- The dusk square shows for about 300 ms as the assembly closes.

## Chapters 5–6 staged, and the pass over long quests, cases, Pages, pets, Company, the Atlas and shiritori (merged 2026-10-04; HX33–HX40, HX45)

**What:**
- **Chapters 5–6** (worker branch, final 335d39b; the record is docs/expressive/reports/staging_ch5_ch6.md):
  - 126 performed scenes directed and played on 537 branches, including the endings performed in the world
    (`sa.end_comp`, the epilogue towns);
  - one quiet oral history;
  - props `key` and `bell`;
  - Kei gains the head shake (the one person in Lanternfall who can still say no);
  - three narrated escalations in KNOWN;
  - a scratch comparison found the story commands identical in all 1,250 scenes.
- **The rest** (worker branch, final e58fe4a; the record is docs/expressive/reports/staging_lq_misc.md):
  - 142 decisions, 112 staged and 30 quiet, including the drafts the chapter passes left in these folders;
  - by area:
    - long quests: 25 staged;
    - cases: 14 staged;
    - pets: 24 staged (8 vignettes and all 16 greetings);
    - Pages: 8 staged;
    - Company: 34 staged;
    - shiritori: 4 staged;
    - the Atlas: 3 staged; 9 quiet, because its rooms are generated;
  - one gesture (`pointup`) and 14 props;
  - runner fixtures for cases, bond, Company and settle;
  - three narrated escalations in KNOWN.
- **No "Performed overworld (H)" draft remains undecided** in any chapter's or group's files.

**The workers' runs, each on its own branch merged with 91eb61f:**
- Chapters 5–6:
  - unit 26,538/0; validator no errors;
  - staging_chapters --ch=5 2174/0 (no walker forced through); --ch=6 2042/0 (6 world's-fallback records, all
    `sa.epi_lf`); --ch=showcase 66/0;
  - story_ch5 8/8; story_ch6 all ok; sequence_chapters_56 144/0.
- The rest:
  - unit: conversation_continuity 1070/0, scene_manifest 774/0, practice_b 96/0; the full suite 25,587/0 before
    the merge;
  - staging_chapters --ch=misc 3586/0 (116 scenes, 493 branches); --ch=showcase 66/0;
  - pages_ending all ok; pets 20/0; pets_greet 17/0; company all passed; actor_life 39/0; walk_round all passed;
    cases all passed; long_quests all passed.

**The lead's merge** (done in a scratch checkout, then the task branch fast-forwarded):
- Conflicts resolved by union:
  - staging_chapters.mjs runs CH12, CH34, CH56 and MISC (`--ch=1..6|misc|showcase`);
  - scene_manifest.mjs merges the ch56 decisions, then misc;
  - the manifest and index.html regenerated.
- unit 27,093/0; validator clean.
- browser, on the merged build (fc860b6 sources, run one after another): walk_round all passed;
  sequence_chapters_56 196/0; staging_chapters --ch=5 2174/0, --ch=6 2042/0, --ch=misc 3586/0; story_ch6 all ok.

**Not verified:**
- Play speed with a person watching; real devices; Firefox and Safari.

(Four world findings listed here before were fixed on 2026-10-04: the dog's corner in co.village, the forced walk-in
in `sa.epi_lf`, the flooding row in `lf.water_returns` with staging off, and the companion left behind by
`sa.kasane_meet`'s `!move pc up 4`. See "Four staging findings fixed" at the end.)

## The owner's notes of 2026-10-04: the dialogue portrait back to 116 px; the "crashing wave" in the Saltglass music

**The portrait.** The owner found the 96-px desktop portrait "a little small" and chose 116 px. `fitSize`
(`src/ui/21_portrait_anim.js`) now keeps the layout's size unless a whole number of device pixels per art pixel lies
within 15 % of it:
- desktop: 116 at ratio 1, 1.25 and 2 (1.21× the art, uneven rows, as before the integer pass); 128 at 1.5 and 3;
- short landscape: 96; phones: 64, unchanged.
- U portrait_anim (fitSize table, in the full unit run 27,093/0).
- B portrait_anim all passed, including the display-scale table: desktop 1280×800 at ratio 1 → 116 CSS px, the dialogue
  box 210 px tall; ratio 2 → 116; 1.5 → 128; 1.25 → 116; 844×390 at 3 → 96; the phone rows 64.

**The music.** The owner heard Saltglass, the coast road and the Saltglass battle theme as harsh, with deep
crashing-wave sounds from an unknown instrument. Found by rendering each track alone and drawing spectrograms, new
arrangement against old (docs/AUDIO.md, last section):
- the shakuhachi's breath reached from about 50 Hz to past 3 kHz under every note;
- the dark tail of the 3 s music reverb turned the low end of each hard attack into a long deep rush. Rendered
  without the reverb, the smear under the shamisen chords is gone;
- the ōdaiko's noise rumble was long.

Changed in `src/audio/10_synth.js`:
- the shakuhachi's breath is quieter and high-passed under the note;
- the reverb send is high-passed at 300 Hz, 24 dB per octave;
- the ōdaiko's rumble is shorter and lower;
- the sawari buzz is high-passed.

Evidence:
- (A) Spectrograms of `saltglass`, `sg_road` and `battle_saltglass`, per track, before and after (scratch renders,
  not committed). The breath now sits above the note, and the low smear after each shamisen stroke is gone.
- (A) `renderOffline`, 24 s, before → after:
  - Chapter 1 songs within 0.15 dB and 6 Hz brightness;
  - `saltglass` brightness 662 → 574 Hz; `sg_road` 630 → 530; `battle_saltglass` 418 → 380; `boss_saltglass`
    406 → 390;
  - levels within 0.5 dB.
- B audio_suite --quick: audio_zones, audio_instruments (shakuhachi still breathier than the flute: off-harmonic
  0.009 vs 0.001), audio.check — 3/3 passed. U full run 27,093/0.

**Not verified:** how it sounds. Nobody here can listen; the owner's ear decides. Firefox renders biquads slightly
differently.

## The owner's second listen (2026-10-04): a clean shakuhachi, the town's levels, the chord strokes, the Archive's low pass

The owner's notes, the causes and the changes are in docs/AUDIO.md, "Owner feedback, 2026-10-04, second listen".
In short:
- the shakuhachi is played clean (no breath stream, no accent burst, no air band);
- the shinobue's breath is at the flute's level;
- each shamisen or biwa string has its own sawari clipper (a chord no longer clips into a noisy crash);
- in the town, the flute is lower (and lower still in the shinobue's section), and the shamisen and bass are lower;
- the Archive's shakuhachi pass is an octave lower and softer;
- the notation gained `v: { track: scale }` on form entries.

Evidence:
- (A) Spectrograms per track, round 1 against round 2 (scratch renders):
  - `saltglass` and `sg_road`: the shakuhachi shows harmonic lines with no noise band. Its late centroid is 0.6 kHz
    (the tone), where before it was 6.4 kHz (the hiss).
  - The shamisen chord strokes show discrete harmonics instead of a noise cloud.
  - `drowned_archive` 52–72 s: the pass that sat in a breath wash from 50 Hz to 5 kHz is a clean low line.
- (A) A-weighted levels, 44 s from the start, round 1 → round 2:
  - `saltglass` flute 39.7 → 36.8 dB (Reedwake's flute: 36.6); shamisen 20.8 → 17.4; bass 23.3 → 22.4; mix 41.0 → 38.4;
  - `sg_road`, `battle_saltglass` and the first 44 s of `drowned_archive` within 1.5 dB per track (the breath is a
    small part of the level).
- B audio_suite --quick 3/3, on the built index.html:
  - audio_zones;
  - audio_instruments: the shakuhachi claim is now "clean, the breath only a trace" (off-harmonic 0.005, late
    centroid 618 Hz for 560 Hz); the shinobue is checked as brighter than the shakuhachi rather than the flute, since
    its brightness had come from its breath;
  - audio.check.
- U:
  - audio_songs, audio_voice, audio_zones 2663/0;
  - the full run 27,092/1 before the shakuhachi's range in the test was widened to A3 (a 2.4-shaku instrument;
    the Archive's low pass reaches B3); the only failure was that range.
- Listening files for the owner:
  - before/after for the town, the coast road, the battle and the Archive;
  - the town's parts one at a time;
  - the boss theme (76 s).
  These are offline renders, recorded through Chromium's MediaRecorder and checked for dropouts (none).

**Not verified:** how it sounds; that is the owner's ear. The "droning drum" is not identified for certain: the
shamisen chord strokes are the likeliest, and the bass is the other candidate. The parts file lets the owner name it.


## 2026-10-04 — Shared portrait profiles (WI13), the cut-in's dock race and fit order, Nao and Ren as they/them

A worker's branch from `claude/stoic-sagan-n3jvgk` at 7cc138e. Headless Chromium (Playwright) and node on a shared
4-core Linux machine while other workers ran browser tests; nothing on a device, in Firefox or Safari. B = browser test
of the built `index.html`, U = unit test, C = code review only.

What changed:
- **WI13.** The dialogue portrait reads the actor system's mannerism profile (`shared()` in
  `src/ui/21_portrait_anim.js`): the class overlay is the actor class (the player's block keeps `base`); 25 structured
  `portrait` blocks in `src/content/mannerisms/10_cast.js` set rates, habits and the cue variant each emotion uses;
  tells with a portrait counterpart shape the cue (sad aside/avert; think → glasses). The portrait table (`PEOPLE`) is
  the fallback, and the whole profile for the 13 speakers without an actor profile; no profile anywhere → the default
  loop. Loop limits unchanged (PORTRAITS.md §5).
- **Dock race** (docs/harmony/contract/V3_REPORT.md, open question 3). The cut-in stays unseen, its state not advancing,
  until the withdrawn response dock and telegraph have left its rows and slide path (measured each frame, as drawn);
  then its whole entrance plays (its clock starts late by the wait). Omitted and recorded if the wait would run past
  the middle of the hold or past 1,140 presentation ms. Reduced motion never waits; the dock's CSS is unchanged.
- **Fit order** (open question 2). Candidates are tried larger faces first (each at its own fitted scale, inside its own
  limits), ties to the old order, instead of standard-first with a 48-px threshold.
- **Pronouns.** Nao and Ren are they/them in docs, code comments, test messages and the Harmony registry's reasons;
  two player-visible English texts fixed (C): the companions' support descriptions (`src/content/00_world.js`) and the
  これ / いただけますか practice explanations about Ren (`src/content/practice_b/30_compare.js`). No Japanese changed.

Commands and results (final build unless stated; a last comment-only edit in `82d_harmony_cutin.js` changed two
comment lines of `index.html` after these runs):
- U `node tests/run-unit.mjs`: **27,110 passed, 0 failed** (after the pronoun edits, and again on the final sources).
  `node tests/run-unit.mjs portrait`: 70/0 (was 53; the new checks: every authored speaker's merged profile by id,
  each block's rates and cue variants, the fallback, the default, and the bespoke row alone without the actor system).
  `node tests/run-unit.mjs harmony`: 331/0. `node tools/validate.mjs`: no errors.
- B `node tests/e2e/portrait_anim.mjs`: **all passed (77 checks)**, twice (before and after the cut-in revision). New
  section J: the companions, the player and 9 recurring NPCs play their actor profile through the real dialogue, by id
  (`state().profile` equals the merged profile; class and block rates as authored; glances only in the profile's
  directions; ≤ 8 frame changes a second); Seto (no actor profile) keeps the portrait table's row; a one-off character
  with no profile gets the default loop; Nao's sad cue ends looking away and that frame is painted.
- B `node tests/e2e/harmony_cutin.mjs geometry` (the code busts' geometry and the painted geometry): on the final build
  **4 runs, 2/2 each** — three alone, one while the full unit suite ran alongside (load average ~7.9 on 4 cores) —
  plus the geometry inside the full run below: 5 geometry passes, 0 overlaps at every view, entrance frames now
  checked against the withdrawn menus. Waits for the menus: 768 × 1024 83–100 ms, 390 × 844 67–100 ms, 320 × 640 83 ms
  of presentation time; none on desktop views. One earlier run, on an intermediate build (the portrait faded in after
  the wait), failed twice: 390 × 844 at 200 % text recorded one layout where the portrait-off run recorded two (the
  intermittent already noted in V3_REPORT.md; the portrait was omitted in that scene), and the template-face check's
  first form at 1366 × 768 (the compact pair refused there by the 12-px rule; the check now accepts a smaller face only
  when the larger was tried and refused).
- B `node tests/e2e/harmony_cutin.mjs` (all): **11 passed, 0 failed** (core 24 configurations incl. reduced motion and
  Fast, never, geometry, plan, frozen frame, life, cycles, setting, dev viewer, painted sample, painted geometry).
- B fit order, faces in CSS px with the sample carrying the template's 50 × 52 face boxes (`painted geometry`), before
  (the earlier `82d_harmony_cutin.js` rebuilt in) → after: 1366 × 768 standard ×1 50 × 52 → the same (compact ×2
  refused: within 12 px of the creature's plate at every height); 1440 × 900 standard ×1 50 × 52 → **compact ×2
  100 × 104**; 1600 × 900 the same → **compact ×2 100 × 104**; 2048 × 1046 standard ×2 100 × 104 → the same. The code
  busts and the sample's own faces choose as before at every geometry view.
- B `node tests/e2e/battle_presentation.mjs`: 13 passed, 0 failed.
- C the pronoun edits (≈110 lines in 25 files), reviewed line by line; "he/him" referring to other people left alone.
- No tracked evidence file was rewritten (no `--docs` runs).

**Not verified:** the new portrait habits and the tablet/phone entrance after the wait, by eye; real painted art (the
face sizes use the synthetic sample with template face boxes); the 1366 × 768 result in other encounters (one creature
in the Mill here); phones, Firefox, Safari.

**The lead's run on the merged task branch (ef61dbb: the shared portrait profile, the cut-in's wait and fit order, the
pronoun tidy):** unit 27,110 passed, 0 failed; B portrait_anim all passed; B harmony_cutin 11 passed, 0 failed;
B battle_presentation 13 passed, 0 failed. These were run one after another while two other workers ran browser
tests in their own worktrees.

## Four staging findings fixed (2026-10-04): the companion on a scene's own walk, walk-in places, the flooding row, the dog's corner

The four world findings left open by the Chapters 5–6 staging pass (that section's "Not verified" list). Each was
reproduced first with a scratch browser probe (staged and unstaged runs of the case fixtures; not committed), then
fixed, then checked by a committed test that fails on the old sources.

**Causes and fixes:**
- `sa.kasane_meet`: the scene's `!move pc up 4` moved only you. With staging off your companion stayed five tiles
  behind. A companion the scene directs was never walked back, because staging did not know you had moved.
  - `50_world.js scriptMove` takes `o.party`, passed only by a scene's `!move` (70_script.js); staging's own
    `!walkto` walks are unchanged. With it, your companion comes along, staging on or off. If they stand where you
    are going, they first step aside onto open ground across your way. Then they follow a step behind over the tiles
    you leave.
  - A companion the scene directs stays put. `52_staging.js playerMoved` tells the scene you moved, so at its end
    they walk back to your side.
- `sa.epi_lf`: not a routing problem. Yae was still on her long walk in when Kasane (or Tae) was called. `spotNear`
  gave both the tile in front of you (3,17): it checked who stood there, not who was walking there. The later
  walker arrived first, and Yae had no way round. `spotNear` now leaves out every walker's destination. Kasane and
  Tae stand at (1,16) and (1,18); the scene's lines and cues are unchanged.
- `lf.water_returns`: the step back out of the water was staging's (`!walkto pc 10 9`). With staging off you stayed
  on the row that floods, until `afterScene`'s `unstick` jumped you onto your companion's tile. The scene now
  steps you back with its own `!move pc up 1`, one tile from whichever column you stepped onto the row. Your
  companion makes room beside you (the change above). This works with staging on or off, and the long staged walk
  to (10,9) from the row's ends is gone.
- `co.village`, the dog's corner (32–33,26): the barrel, the crate, the gate and the reeds closed it in. The dog's
  first look (`pets.dog.dog` before the gate is shut) could not be had on foot.
  - Fix: a gap in the reeds below the corner. Tile (32,27) is now grass (`src/content/ch3/20_maps.js`, after the reed
    scatter), so you face the dog from it.
  - Why a gap, not a new place for the dog: the reeds along the bank are a seeded scatter with grass gaps already,
    and one gap more reads naturally (checked in a capture). Moving the corner would mean re-staging his animation
    (the corner, the tile he gets up to, the gate swinging into him) and the scene's "the corner by the barrel".
  - The geometry record was re-recorded deliberately. Only the co.village, co.eve and co.festival entries changed;
    they share the terrain.

**Tests added:**
- `tests/e2e/staging_runner.mjs`, opt-in per case:
  - `checkOff`: every branch is also played unstaged, and there too nobody shares a tile or stands on furniture,
    and your companion ends beside you. Set on `sa.kasane_meet` and `lf.water_returns`.
  - `noForced`: no walker of the world's goes through anyone. Set on `sa.epi_lf`.
- `lf.water_returns` also plays from both ends of the row: (1,10) and (20,10).
- `pets.dog.dog` plays from the gap (32,27) as well.
- `tests/e2e/walk_round.mjs` (in the default suite):
  - section 5: two speakers called while the first still walks in get places of their own;
  - section 6: a scene's `!move pc` with staging on and off. Your companion follows; walking back onto them, they
    step aside and you never share a tile; one the scene directs is walked back after it.
- `tests/e2e/pets.mjs`: each vignette's standing place must be reachable on foot from the start (BFS over open
  ground). The dog's steps now stand at (32,27).

**Evidence:**
- B. The new checks on the OLD sources, 7cc138e (my tests; `src` temporarily restored, then put back):
  - staging --ch=5 `--only=lf.water_returns`: 50/6. The six failures are the staging-off checks: you stand on
    (x,10), the flooding row, and your companion is 0 tiles away.
  - --ch=6 `--only=sa.kasane_meet,sa.epi_lf`: 105/11. Five companions are 5 tiles away; six walkers are forced at
    `lf.town@3,17`.
  - pets.mjs dog vignette: 0/1 ("the place 32,27 can be reached on foot").
  - walk_round: 7 failed (sections 5 and 6).
  - The staging case played from (32,27) passed even on the old map (78/0). The runner sets you where the fixture
    says, so reachability is checked by pets.mjs, not by the staging runner.
- B. The fixed build, 47db168 sources, run one after another:
  - staging_chapters:
    - --ch=5: 2199/0 (no world's-fallback record);
    - --ch=6: 2057/0 (no world's-fallback record; before, 6 in `sa.epi_lf`);
    - --ch=3: 2267/0;
    - --ch=misc: 3593/0;
    - --ch=1: 698/0;
    - --ch=2: 1623/0;
    - --ch=4: 1350/0;
    - --ch=showcase: 66/0. Its re-captured docs/screenshots/actors/ were restored, unchanged in git.
  - walk_round 24/24; departures all ok (20); world_fixes all ok (15); pets 20/0; long_quests --fixtures-only all
    passed.
  - story_ch1 F mio PASS (31 checks), story_ch5 A suzu PASS, story_ch6 2 all ok.
- U: full run 27,093/0, after the geometry re-record (before it, 27,092/1: the geometry check named exactly those
  three maps).
- Validator: no errors. Scene manifest regenerated; `lf.water_returns` and `pets.dog.dog` have updated reasons
  and branch lists.

**Not verified:**
- Watched at play speed by a person.
- Firefox and Safari.
- Whether the gap in the reeds reads naturally to the owner.
- Other scenes with several walk-ins now get different places wherever two were given the same one before. All
  staged chapter suites pass, but only the staged fixtures were played.
- The Chapter 1 step-backs at blocked roads (`rw.road_west_blocked`, `rw.mill_blocked`, `rw.leave_early`,
  `rw.mr_narrows`) now have your companion step aside instead of standing on your tile. They have no staging case,
  and story_ch1 F mio (which passed) is not known to step on those triggers.

**The lead's run on the task branch with both wave-3 merges (4b728f2):**
- unit 27,110 passed, 0 failed;
- B walk_round all passed; B pets 20/0; B portrait_anim all passed; B harmony_cutin 11/0;
- B staging_chapters --ch=1 698/0 and --ch=2 1623/0, covering the chapters the owner will replay first. Scene moves now
  bring the companion along there too.
