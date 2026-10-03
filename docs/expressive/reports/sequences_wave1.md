# Illustrated sequences, wave 1 — validation notes

Scope: the sequence player `RB.sequence` with manual advancement (CONTRACT §3.5, SHOTS §0), the prologue moved
onto it (HX44), the first three sequences (`ch1.bridge` in `rw.bridge_scene`, `ch2.notice` in
`sg.omi_wataru`, `ch2.plate` filling the faded passage `sg.asahi_name`), a read-only replay under Company ›
Shared memories (HX53) and a development viewer (HX57).

Base: task branch at `c2a799d`. Work branch: `worktree-agent-ad47cd73799223017`.
Environment: headless Chromium through the repository's Playwright; Linux; a shared 4-core machine. No other
browser, no physical phone.

Kinds of evidence used below: **browser test** (a check in the built `index.html`), **unit test** (node, no
browser), **stills** (images to look at, not assertions), **code review** (read, not run).

## Commits

| Commit | What |
|---|---|
| `b452770` | `RB.sequence` with manual advancement; the prologue on it; the first sequences |
| `881f46e` | the manual-advance regression test; shots fitted to a phone's band above the sheet |
| `62c9743` | kept memories with a read-only replay; the dev viewer; the API in SHOTS.md §0.1 |
| `0746026` | evidence stills (54 WebP files) and their script |
| `20354a0` | remapped keys in the regression test; the dev preview says on screen that it is synthetic (an optional visible `tag` on the standalone viewer) |
| `85a48d0` | a browser test of the dev viewer (`tests/e2e/sequence_dev.mjs`) |
| (this commit) | this report |

## What was built

**Files (new):**
- `src/ui/43_sequence.js`: the registry (`define`, `shot`), the `Player` state machine, the scene driver
  (script ops, dialogue hooks, controls, skip, seen record, memories), the standalone viewer `view()` used by
  the prologue and by replays. The authoring API is documented at the top of the file and in SHOTS.md §0.1.
- `src/ui/43_sequence_kit.js` (`RB.seqKit`): layout classes, layer caches, grading, people from the game's own
  drawings (road sprites with poses, portraits with expression and frame descriptors, a person from behind),
  hands, small live things.
- `src/ui/43a_seq_ch1.js`: `ch1.bridge`, five shots (`reach`, `cup`, `hana`, `close`, `door`).
- `src/ui/43b_seq_ch2.js`: `ch2.notice`, four shots (`faults`, `face`, `room`, `notice`); `ch2.plate`, three
  shots (`card`, `work`, `done`).
- `src/ui/43z_sequence_dev.js`: `?dev=sequences`, a contact sheet of every shot labelled SYNTHETIC FIXTURE, at
  the three viewport buffers, with a "Play (synthetic branch, read-only)" button per sequence.
- `src/styles/51_sequence.css`; `tests/unit/sequence.test.mjs`; `tests/e2e/sequence_manual.mjs`;
  `tests/e2e/sequence_dev.mjs`; `tests/e2e/sequence_shots.mjs` (evidence writer, not in the default suite).
  None of the new tests is added to `tests/e2e/run.mjs` (the lead's call; `sequence_manual` takes about 12
  minutes in full because of its three 60 s idles and 20 cycles).

**Files (changed):**
- `src/ui/20_dialogue.js`: hooks for the sequence (`onLine`, `intercept`, `advancing`, `onAction`), the skip's
  auto-advance (guarded so it never resolves a later line), `review(line)` that paints a past line without
  resolving the live one.
- `src/engine/70_script.js`: the ops `!sequence` and `!shot`; behind the picture `!move`/`!walkto` finish at
  once, `!emote` does not wait, `!shake` and `!fade` do not fire; the skip stops at challenge, activity,
  battle, lesson and teach; the sequence is disposed when the outermost scene ends.
- `src/engine/05_state.js`: `seq: {}` in `newCampaign` (older saves gain it through `migrate`; no schema,
  key, slot or DB change).
- `src/engine/56_questguide.js`: the new ops count as presentation.
- `tools/validate.mjs`: the ops are known; a sequence must exist, be begun and ended in the same scene, name
  shots and phases that exist, and contain no `!shake`.
- `src/ui/40_create.js`, `41_prologue_art.js`, `41c_prologue_lantern.js`: the prologue on `RB.sequence.view`.
- `src/ui/42_interlude.js`: `sheetTop(rec, h)` exported (the sheet's highest top over a picture).
- Content, ops only (plus `#` comments): `src/content/ch1/31_scenes_mill.js` (`rw.bridge_scene`),
  `src/content/ch2/21_scenes_main.js` (`sg.omi_wataru`), `src/content/ch2/24_scenes_hub.js`
  (`sg.asahi_name`). `src/content/practice_b/30_compare.js`: two command indices moved by the inserted ops
  (`sg.omi_wataru` 34 → 37, `rw.bridge_scene` 11 → 20; unit-checked).
- Tests: `tests/e2e/create.mjs`, `ui.mjs`, `visual.mjs` confirm the new "Skip the prologue?" question (a
  first-time skip now asks); `create.mjs` also waits for the first shot's entrance before pressing Next.
- `docs/expressive/SHOTS.md`: §0.1 (the API) and the §7b row for `sg.asahi_name`.

## Runs

All runs on the build of `20354a0` (the rebuilt `index.html` is committed with it; `85a48d0` adds only a test
file). Browser tests were run one at a time; the machine was shared with other workers' runs (load average 6–9).

| Check | Kind | Result |
|---|---|---|
| `node tools/build.mjs` | build | 355 source files; no diff against the committed `index.html` |
| `node tools/validate.mjs` | content validator | no errors (lexicon-conflict warnings only, none from this work) |
| `node tests/run-unit.mjs` | unit | 24,393 passed, 0 failed (`sequence.test.mjs`: the state machine on a fake clock, the registry, the scripts, `aheadUnseen`, migrate) |
| `tests/e2e/sequence_manual.mjs` (full: 60 s idles, 20 cycles) | browser | **64 passed, 0 failed** (754 s). The same file without the remap check passed 63/0 in full on `0746026` |
| `tests/e2e/sequence_dev.mjs` | browser | 9 passed, 0 failed |
| `tests/e2e/prologue.mjs` | browser | 100 passed, 0 failed |
| `tests/e2e/create.mjs` | browser | 382 passed, 0 failed |
| `tests/e2e/visual.mjs --only create_prologue,create,create_err,dialogue,company_mem` (390×844, 1280×800; out to a scratch folder) | browser (captures) | all 10 captured, no errors |

Run on `0746026`, whose build is identical except for the dev viewer's tag and its page-hiding class:

| Check | Kind | Result |
|---|---|---|
| `tests/e2e/ui.mjs` | browser | 14 passed, 0 failed |
| `tests/e2e/interludes.mjs` | browser | 76 passed, 0 failed |
| `tests/e2e/staging_wataru.mjs` (both routes through `sg.omi_wataru` with the sequence on) | browser | 112 passed, 0 failed |
| `tests/e2e/departures.mjs` | browser | all ok |
| `tests/e2e/quest_guide.mjs` | browser | all quest guidance checks passed |
| `tests/e2e/company.mjs` | browser | all passed |
| `tests/e2e/settings.mjs` (lists the three new bindings) | browser | all ok |
| `tests/e2e/play_ui.mjs` | browser | all ok |
| `tests/e2e/story_ch1.mjs F mio` (plays through `rw.bridge_scene`) | browser | PASS, 31 checks |
| `tests/e2e/bookmarks.mjs` | browser | all ok (6) |
| `tests/e2e/dialect_kansai.mjs` | browser | all passed |
| `tests/e2e/review_held_portrait.mjs` | browser (measurement) | no errors at 1440×900 and 390×844 |

**What `sequence_manual` checks** (each in the built game with real clicks, taps and keys):
- 60 s idle on the prologue's last shot, a Chapter 1 shot with the word-help card left open, and a Chapter 2
  shot: same line, same shot, holding; the card still open.
- One click reveals, a second advances one line; a held key advances at most once; a press during a dissolve
  only completes it; six rapid clicks move at most three lines; a click on a word opens help and never
  advances.
- P and ← look back; R replays; Next rejoins the live line without moving it; I hides the text and Next brings
  it back; campaign state (flags, items, quests, notes, Company, learning, seen record, place) unchanged by all
  of it.
- Remapped keys (Previous on B, Next on N) work; P and Enter then do nothing. Keyboard focus was taken off the
  buttons first: Enter on a focused button activates that button natively, as anywhere in the game.
- Escape opens the skip question and Escape again keeps watching; Skip asks when unseen; Keep watching keeps the
  line; a confirmed skip runs the scene's state commands once and stops where the sequence ends; a seen scene
  skips without asking; a skip stops at a choice and answers nothing.
- Touch: a tap on the picture never advances; taps reveal then advance; the phone's "Scene" button opens the
  labelled group; a tap on the picture brings hidden text back.
- Reduced motion: the end state at once after the dissolve; a `!shake` inside a sequence never shakes.
- Prologue: Escape asks; Previous, Next back, Hide, Replay; seen before on this device: Skip goes straight on.
- Every shot's focal area above the sheet at 1280×720, 390×844 and 844×390.
- A kept memory replays read-only from Company › Shared memories and Escape returns to the page.
- 20 enter/exit cycles: listeners 97 → 97, nodes 244 → 244, no player listener, timer, overlay, control row or
  cached layer left; 6 prologue views leave nothing; Return to title mid-sequence disposes everything.

## The HX rows, honestly

| Row | Status after this wave | Evidence |
|---|---|---|
| HX41 | **Partial.** Chapter 1, Chapter 2 and the prologue have integrated sequences (5, 4 and 6 compositions; `ch2.plate` adds 3 more for the faded passage). Chapters 3–6: not started. | browser test (each shot reached in the built game), stills |
| HX42 | **Done for the three sequences built**: beat, composition, participants, one-time phases and hold, lines, safe areas and entry/continue/review/skip/return as SHOTS.md §1, §2 and §7b plan them. | code review against SHOTS.md; focal-area check at three sizes (browser test) |
| HX43 | **Self-reviewed only.** Perspective bridge, interiors, hands, light and props drawn in code in the game's pixel style; the changed state is held. No human art review. Close-ups are limited by the 1× portrait scale: closeness comes from framing and code-drawn inserts. | stills |
| HX44 | **Done for the prologue**: entrance, one-time action, indefinite hold and requested exit are separate; no `next()` and no fade on a duration; the walk and the anonymous traveller kept; creation follows. | browser test (60 s idle on the last shot; prologue controls), `prologue.mjs`, `create.mjs` |
| HX46 | **Done where sequences exist** (the prologue and the three sequences): manual only; text speed controls the reveal only; 60 s idle moves nothing. Music, TTS and focus loss were not separately exercised beyond the idle check. | browser test |
| HX47 | **Done** for sequences: Next, Previous, Replay shot, Hide text, Skip scene, by mouse, touch and keys; remappable in Settings › Controls; on phones the secondary controls sit behind a labelled "Scene" button (group "Scene controls"). The tide interlude (`42b_interlude_tide.js`) has **not** been given these controls. | browser test |
| HX48 | **Done** for sequences: reveal → one beat → next shot → exit once; held key and rapid clicks cannot skip unseen lines; a word click never advances. A press during a shot's dissolve completes the dissolve and does not advance (a deliberate guard; see open questions). | browser test, unit test |
| HX49 | **Done**: Previous is read-only (campaign state compared before and after review, replay and hide) and rejoins without advancing; Replay shot is presentation only; Hide text keeps Show text and navigation; word help works in captions. | browser test |
| HX50 | **Done** for sequences and the prologue: Skip asks when anything ahead is unseen; Escape opens the question and never skips; a confirmed skip runs state commands once and stops at the sequence's end and at a choice; seen state per line hash (so per branch). The prologue's "seen" is a device setting (`settings.prologueSeen`). | browser test, unit test |
| HX51 | **Partial.** Reduced motion: each action's end state at once, same order; `!shake` never fires inside (validator plus browser test). Sound-off parity and large-text layouts were not tested; viewport change mid-shot not tested. | browser test (reduced motion, no shake) |
| HX52 | **Done for the three sequences**: world staging keeps running behind the picture (moves finish at once, positions change), absent companions are not drawn (`cast.comp` is only the companion on the map). | `staging_wataru.mjs` end-state checks; code review |
| HX53 | **Done (optional item)**: a kept memory stores compact selectors (shot, phase, scene, line number, line hash, cast) of the branch actually seen; "Watch it again" under Company › Shared memories replays read-only. No legacy reconstruction. | browser test (memory replay section) |
| HX55 | **Done** for the sequence player: explicit states with tokens; no timer from hold to the next beat. | unit test, browser test |
| HX56 | **Done** for the sequence player: disposal on scene end, error, load and campaign change (Return to title mid-sequence checked); listeners, timers, overlays and caches released. | browser test |
| HX57 | **Partial (shots only)**: `?dev=sequences` contact sheet labelled SYNTHETIC FIXTURE, refused without the flag, not a player menu; its Play says on screen that it is a synthetic preview. Poses and Harmony pairings are other workers'. | browser test (`sequence_dev.mjs`) |
| HX69 | **Done for the listed checks**, remapped keys included, except "interruption during exit" and "during a gesture" as named cases (an interruption during the entrance and during the hold are covered; the exit dissolve is 300 ms). | browser test |
| HX70 | **Partial**: 20 enter/exit cycles of a sequence plus 6 prologue views with flat counters. Cut-ins are not part of this wave; the full matrix on a frozen candidate is not done. | browser test |
| HX71 | **Advanced**: `sg.asahi_name` filled by `ch2.plate` (with the three the ledger already counts, 4 of 9). | browser test, stills |

## Evidence

`docs/screenshots/sequences/` (54 WebP files, 1.9 MB): each shot of each sequence and each prologue shot at
1280×720, 390×844 and 844×390, captured in the built game at the shot's hold with the dialogue sheet and the
controls on screen. Names: `<sequence>_<shot>_<size>.webp`, `prologue_<n>_<shot>_<size>.webp`.
Regenerate: `node tests/e2e/sequence_shots.mjs [--only ch1.bridge,prologue]`.

## Not verified

- A person's review of the art and of the pacing of each shot.
- Firefox, Safari, a physical phone or tablet; real touch hardware (touch was emulated).
- The `ch2.notice` route without `sg_wataru_self` in the evidence stills (both routes run through the sequence
  in `staging_wataru.mjs`, and `sequence_manual` uses the other route, but the stills show only Wataru's own
  route); companions other than Mio and Suzu in the shots.
- Chapters 3–6 sequences; the tide interlude's shared controls.
- Landscape phone framing quality: at 844×390 the sheet leaves a band of about a third of the buffer; faces and
  the focal object are kept in it (checked), the rest of each composition goes under the sheet.
- Large text (150 %) inside sequences; screen readers.
- Sound-off parity, TTS during a sequence.

## Open questions for the lead

1. `staging_wataru.mjs` rewrites `docs/screenshots/actors/*.png`: its stills now catch the close-up for the
   pivot lines. I restored the committed files after running it; the stills may want regenerating once the
   lead decides which view they should show.
2. "Skip prologue" asks once per device until the prologue has been seen through (`settings.prologueSeen`).
   Three existing tests (`create`, `ui`, `visual`) now confirm the question.
3. New default keys: P / PageUp (Previous), R (Replay shot), I (Hide text), and ← → while looking back. They
   are remappable; none collided with an existing default.
4. A press during a new shot's dissolve (≈350 ms) only completes the dissolve. This is what keeps rapid clicks
   from skipping, but a fast reader may feel one press "eaten" at each shot change.
5. `docs/expressive/scenes.json` was not regenerated (the unit tests pass without it).
6. The noren in `ch1.bridge` carries the same ring-and-dot lantern crest as the approved prologue room
   (`41b_prologue_room.js`): a mark, not a letter. Say if even that should go.
7. `quest_guide.mjs` and `staging_wataru.mjs` rewrite committed stills when run (`docs/screenshots/quest_guide`,
   `docs/screenshots/actors`); I restored both after each run, so this branch changes neither.
8. `RB.sequence.view` gained an optional `tag` (a visible note above the caption) for the dev preview.
