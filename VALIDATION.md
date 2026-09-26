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
