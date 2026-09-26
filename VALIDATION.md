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
