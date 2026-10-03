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
- **Not verified:** Firefox; the "slot open in another tab, then Cancel" path (only the unreadable-slot path ran); the default suite as a whole on this build.
