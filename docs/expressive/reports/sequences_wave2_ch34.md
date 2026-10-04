# Illustrated sequences, wave 2 (Chapters 3 and 4) — validation notes

Scope: the illustrated sequences of Chapter 3 (`ch3.assembly` in `co.assembly`; `ch3.firebreaks` filling the faded
passage `co.festival_begin`) and Chapter 4 (`ch4.lamp` in `sb.lamp_name`, `ch4.reply` in `sb.lamp_reply`;
`ch4.inn` filling `sb.next_day_inn`; `ch4.morning`, one window shot after the kept darkness of
`sb.quiet_morning`), on the player and kit built in wave 1 (`RB.sequence`, `RB.seqKit`; SHOTS.md §0.1).

Base: task branch `claude/stoic-sagan-n3jvgk` at `da9751c`. Work branch: `worktree-agent-ad88dc238f27af23d`.
Environment: headless Chromium through the repository's Playwright; Linux; a shared 4-core machine (other workers
testing at the same time). No other browser, no physical phone.

Kinds of evidence below: **browser test** (a check in the built `index.html`), **unit test** (node), **stills**
(images to look at, not assertions), **code review** (read, not run).

## Commits

| Commit | What |
|---|---|
| `e2d026a` | the two shot files; the `!sequence`/`!shot` ops in the six scenes; the `!shake` comment |
| `dbe5a88` | `tests/e2e/sequence_chapters.mjs`; the lamp, flint and seal inserts fitted to any sheet height |
| `e6631e3` | subjects raised on upright phones; a milder lamplight on Hoshino; SHOTS.md as built and §7b; the stills writer extended |
| `1643482` | dithered ground and wall gradients (no hard seams); the stills writer catches the reply's handover |
| `eba71d6` | no half-frame tint seams; the far ridge without vertical bands; the stills writer presses Next once per line |
| `fe46d66` | the brush hand in the character's own skin tones (**the final source and build**) |
| `33c52d2` | the evidence stills (72 WebP) |
| (this commit) | this report |

## What was built

**Files (new):**
- `src/ui/43c_seq_ch3.js`: `ch3.assembly`, nine compositions — `dusk`, `confess`, `voices`, the three branch shots
  `names` / `living` / `ume`, `hands`, `ink`, `night` (a reader sees seven on any one branch); `ch3.firebreaks`,
  four — `climb`, `gate`, `breaks`, `rope`. A terrace renderer (rows of dry-stone risers and flats bowing round the
  hill) is shared by the morning's shots.
- `src/ui/43d_seq_ch4.js`: `ch4.lamp`, seven compositions — `akari`, `ask`, the branch shots `stay` / `go` / `both`,
  `flint`, `valley` (five on any one branch); `ch4.reply`, two — `seal`, `give`; `ch4.inn`, one — `night`;
  `ch4.morning`, one — `snow`.
- `tests/e2e/sequence_chapters.mjs`: the browser test of the new sequences (below).
- this report.

**Files (changed):**
- Content, ops and `#` comments only: `src/content/ch3/43_scenes_end.js` (`co.assembly`, `co.festival_begin`),
  `src/content/ch4/34_scenes_end.js` (`sb.lamp_name`, `sb.lamp_reply`, `sb.next_day_inn`),
  `src/content/ch4/32_scenes_quiet.js` (`sb.quiet_morning`). One removal: the `!shake` at `co.assembly` line 59
  (inside the sequence) is now a `#` comment. The validator rejects a shake inside a sequence, it would never fire
  there, and SHOTS.md §0 and §3 plan it as the `ink` shot's own action (the ink sinking into the paper). No line,
  branch, state command or outcome changed. `practice_b/30_compare.js` quotes none of these scenes: no index moved.
- `tests/e2e/sequence_shots.mjs`: the evidence writer extended to these sequences (a choice picked by its text, the
  two challenges and the kana lesson stubbed to pass, a branch run limited to its branch shots), and Next pressed
  once per line shown (see open question 6).
- `docs/expressive/SHOTS.md`: "As built" notes under §3 and §4; the §7b rows for `co.festival_begin`,
  `sb.quiet_morning`, `sb.next_day_inn`; the audit re-run.
- `index.html` rebuilt with each source change.

Not edited: `43_sequence.js`, `43_sequence_kit.js`, `43a`, `43b`, battle files, `50_world.js`, `51_*`,
`52_staging.js`, `10_cast.js`, HANDOFF/REQUIREMENTS/VALIDATION, the CONTRACT boxes. No API gap needed a fix.

### Deviations from the shot plans (SHOTS.md §3, §4), and why

- **Sequence ids** follow wave 1 and the §0.1 example (`ch3.assembly`, `ch4.lamp`), not `co.assembly`.
- **Chapter 4 is two sequences.** A sequence must begin and end in one scene (the validator's rule), and
  `sb.lamp_reply` is also reached on its own (from `sb.dome_hoshino`), so the plan's shot 5 is `ch4.reply`. Between
  the two, line 114 and the reply challenge play over the dome map. `ch4.reply` has a second composition, `give`
  (118): the plan's single insert left the handover (`!give sb_reply_letter`) unseen; it is now shown once.
- **Chapter 3 shot 6 is two shots**, `ink` and `night`, as the plan's "cut back to a quieter wide on 61" describes.
- **Entry.** The `!warp` in `co.assembly` fades back in by itself (`RB.game.transition`), so the scene's
  `!fade in` finds the map already shown; `!sequence … begin` sits after it and shot 1 dissolves in from the square,
  as Chapter 1 does. At the end the square shows for the 300 ms dissolve, then `co.festival_begin`'s `!fade out`.
- **`co.festival_begin`** gets its own short sequence rather than joining `ch3.assembly` (the same-scene rule).

## Runs

Browser tests were run one at a time, except where noted; the machine was shared with other workers' runs.

**On the final build** (`index.html` of `fe46d66`; `33c52d2` adds only stills):

| Check | Kind | Result |
|---|---|---|
| `node tools/build.mjs` | build | 359 source files; the committed `index.html` is current (no diff after a rebuild) |
| `node tools/validate.mjs` | content validator | no errors (the usual lexicon-conflict and two map-reachability warnings, none from this work) |
| `node tests/run-unit.mjs` | unit | **25,051 passed, 0 failed** |
| `tests/e2e/sequence_chapters.mjs` (new; full) | browser | **121 passed, 0 failed** |
| `tests/e2e/sequence_manual.mjs --quick` | browser | **64 passed, 0 failed** (6 cycles: listeners 97 → 97, nodes 244 → 244) |
| `tests/e2e/interludes.mjs` | browser | **76 passed, 0 failed** |
| `tests/e2e/story_ch3.mjs F ren` (one profile and companion; the full 16 ran on `e6631e3`, below) | browser | **PASS**, 39 checks |
| `tests/e2e/story_ch4.mjs A mio` (one profile and companion, the stay ending; the full 8 ran on `e6631e3`, below) | browser | **PASS**, 52 of 52 checks |

**On earlier builds of this branch** (each later change is drawing code in `43c`/`43d` only: positions, colours,
dithering; no op, scene, flow or player change):

| Check | Build | Kind | Result |
|---|---|---|---|
| `tests/e2e/sequence_manual.mjs --quick` | `dbe5a88` | browser | 64 passed, 0 failed |
| `tests/e2e/interludes.mjs` | `dbe5a88` | browser | 76 passed, 0 failed |
| `tests/e2e/staging_chapters.mjs --ch=showcase` | `dbe5a88`; `e6631e3` from its Chapter 5 scene on (rebuilt mid-run) | browser | 66 passed, 0 failed. Its showcase set is `rw.hana_first`, `co.suzu_night`, `sb.yae`, `lf.mio_refuse`, `sa.isamu_return`: **none of the six scenes here** (run because the task asked; it shows nothing broke near them) |
| `tests/e2e/story_ch3.mjs` (4 profiles × 4 companions; plays `co.assembly` and `co.festival_begin` through) | `e6631e3` | browser | **16 of 16 PASS** (36–39 checks each) |
| `tests/e2e/story_ch4.mjs` (2 profiles × 4 companions; `sb.lamp_name`, `sb.lamp_reply`, the evening, the inn's night, the quiet morning; stay, go and both all taken) | `e6631e3` | browser | **8 of 8 PASS** (52–53 checks each; no problems, no console errors) |
| `tests/e2e/sequence_chapters.mjs` (full, earlier version) | `dbe5a88` | browser | 119 passed, 0 failed |

`docs/screenshots/actors/*.png` (rewritten by `staging_chapters.mjs` when it runs) were restored afterwards; this
branch does not change them.

**What `sequence_chapters` checks** (built game, real clicks and keys; only the two challenges and the kana lesson
are stubbed to pass, since the sequences begin after them):
- every branch played by hand, nine runs: the assembly's three answers (with Mio and the bell rung, Nao without it,
  Suzu), Hoshino's three answers (Ren, Mio, no companion), the reply reached on its own later (Suzu), the inn's night
  (Nao), the quiet morning (Mio). Each run: the shots appear in the planned order (`ch3.assembly` seven per branch,
  then `ch3.firebreaks` four; `ch4.lamp` five per branch, then `ch4.reply` two); Gorō's `bell` phase only when
  `co_bell_rung`; each sequence begins and ends once and its seen record counts 1; the branch flag is the one chosen;
  a Shared memory kept for `ch3.assembly` and `ch4.lamp` only with a companion, none for the passages or the reply;
  the reply letter given once; no sequence left open; the world not left in the dark; nothing shook the screen; no
  page errors;
- per sequence (all six): 8 s of idle on its second shot (or its only one), the same line, shot and beats, holding;
  Escape asks before any skip and Keep watching keeps the line; where a new line lies ahead (by the player's own
  `aheadUnseen`), the Skip button asks first too; Previous looks back read-only (campaign state compared before and
  after: flags, vars, items, quests, notes, Company, words, learning, seen record, place) and Next returns to the
  live line without moving on; on the one-line sequences (inn, morning) Previous is off and P changes nothing;
- a confirmed skip in `ch4.lamp` runs the state line before it once (`sb_name_done`), stops at the choice on its
  shot, and sets none of the three answers' flags nor `sb_lamp_lit`;
- reduced motion: every shot of the assembly and firebreaks run (11) and the morning shot hold at their end state
  (k = 1) once their dissolve is over; nothing shook the screen;
- the focal area of every shot, every phase, motion and reduced motion, with no companion, Mio and Nao, with and
  without the branch flags, inside the band above the sheet at 1280×720, 390×844 and 844×390. It is checked at the
  sheet top measured on screen and at the range a sheet takes at that shape: wide 216/259, upright 506/608,
  landscape 66/117/154 of 234. That is 1,800 to 2,400 drawings per shape.

## The HX rows, honestly

| Row | Status after this wave | Evidence |
|---|---|---|
| HX41 | **Partial (advanced).** Chapters 3 and 4 now have integrated sequences: `ch3.assembly` (nine compositions, seven seen on any branch), `ch4.lamp` (seven, five per branch) with `ch4.reply` (two). With wave 1, the prologue and Chapters 1–4 are done; **Chapters 5 and 6 are not started.** | browser test (shot order per branch), stills |
| HX42 | **Done for these sequences**: SHOTS.md §3, §4 and §7b specify them; they are built as specified, with the deviations and their reasons recorded under "As built" (two Chapter 4 sequences; the added `give` and `night` compositions; the entry after the warp's own fade-in). | code review against SHOTS.md; browser test |
| HX43 | **Self-reviewed only.** Code-drawn in the prologue's manner. Perspective: the stage and square, terraces bowing round the hill, the converging lookout, the dome's ribs. The game's portraits and road figures are graded into dusk, night, dawn, noon and lamplight. Drawn props: hands, books, the sickle, the brush, the flint, the envelope. The defining events are staged and their end states held: the hands rising, the brush and the ink, the lanterns lit name by name, the water falling, the flame turning, the light crossing the valley, the handover. Limits: busts are the 1× portraits (closeness comes from framing); several hands are simple; the landscape phone keeps only faces or the focal object above the sheet. **No person has reviewed the art.** | stills |
| HX46 | **Done where these sequences exist**, at 8 s of idle per sequence. This is not the 60 s idle: that is wave 1's, on the prologue and Chapters 1–2, and the full `sequence_manual` was not re-run here. | browser test |
| HX47 | **Exercised for these sequences**: Next by click, Previous by key, the Skip button and Escape. Replay shot and Hide text are the shared player's (checked by `sequence_manual` on Chapter 1–2 shots) and were not separately exercised on these. | browser test |
| HX48 | Unchanged player. These sequences were advanced only by real clicks after each dissolve; held keys and rapid clicks were not re-tested on them. | browser test (`sequence_manual --quick`, shared player) |
| HX49 | **Done for these sequences**: Previous is read-only (campaign state unchanged) and Next rejoins without moving on; Previous is off on one-line sequences. | browser test |
| HX50 | **Done for these sequences**: Skip asks first while anything ahead is new; Escape always asks; a confirmed skip runs state lines once and stops at the choice, answering nothing (`ch4.lamp`); the seen record per sequence counts once. | browser test |
| HX51 | **Partial.** Reduced motion holds every shot's end state at once; nothing shakes in any run; the one `!shake` inside a wrapped section is now the ink shot's own slow action. Large text, sound-off parity, TTS and a viewport change mid-shot: not tested. | browser test |
| HX52 | **Done for these sequences, by code review plus the test's state checks.** Only the companion on the map is drawn (`cast.comp`). Suzu stands in the crowd only when she is not your companion. The villagers stand where `co.eve` puts them. The lanterns lit on the names branch stay lit in the night shot. The dome map draws its lamp lit as soon as `sb_lamp_lit` is set (the prop's condition is tested per frame), so it matches the shots on return, with Hoshino on the map. The reply letter is shown changing hands once, on the line that gives it (count 1). The morning window shows the observatory unlit (it is lit only later). One known mismatch: at the end of `ch3.assembly` the dusk square shows for the 300 ms dissolve before the festival's fade, after the night shot (open question 3). | browser test, code review |
| HX53 | **Done for the two chapter sequences**: `ch3.assembly` and `ch4.lamp` keep a Shared memory when a companion travels with you (checked present; absent without one); the passages and the reply keep none. Their replay is the shared player's (wave 1) and was not re-run on these memories. | browser test |
| HX71 | **Advanced**: `co.festival_begin` filled (`ch3.firebreaks`), `sb.next_day_inn` filled (`ch4.inn`), `sb.quiet_morning` decided as darkness intended (kept) with one quiet window shot after its fade-in (`ch4.morning`). With wave 1's four, 7 of the §7b table's 8 passages are handled; `lf.boat_to_tower` (Chapter 5) remains. The audit was re-run from source and found no new passage. | browser test, stills, code review |

## Evidence

`docs/screenshots/sequences/`: 72 new WebP files (3.2 MB). Each shot of `ch3.assembly`, `ch3.firebreaks`, `ch4.lamp`,
`ch4.reply`, `ch4.inn` and `ch4.morning` at 1280×720, 390×844 and 844×390, captured in the built game at the hold of
the shot's last line with the dialogue sheet and controls on screen. Names: `<sequence>_<shot>_<size>.webp`.
Companions and branches: the common shots come from the names / Mio and stay / Ren runs; `living` (Nao), `ume`
(Suzu), `go` and `give` (Mio; `give` shows the handover, on the branch where line 120 holds it), `both` (Suzu), the
inn (Nao), the morning (Mio). Regenerate with
`node tests/e2e/sequence_shots.mjs --only ch3.assembly,ch4.lamp,ch4.inn,ch4.morning`. Wave 1's stills were not
changed.

## Not verified

- A person's review of the art, the pacing and the readability of each shot; the art is self-reviewed from stills.
- Firefox, Safari, a physical phone or tablet; real touch hardware (no touch run of these sequences at all).
- The 60 s idle on these sequences (8 s each was run); Replay shot and Hide text on these sequences; held keys and
  rapid clicks on them (the shared player is checked by `sequence_manual` on Chapter 1–2 shots).
- The two challenges and the kana lesson inside these scenes in my test (stubbed); the story tests run them only
  through their auto-answer harness.
- The full story suites on the final build: `story_ch3` (16 runs) and `story_ch4` (8 runs) ran in full on
  `e6631e3`; on the final build one run of each was repeated (both pass). The later changes are drawing-only.
- Every companion's gesture in every aside: the night shot's and the lamp shots' companion gestures were seen in
  the stills for some companions only (as listed above), not all four in each.
- Large text (150 %), screen readers, sound-off parity, TTS, a viewport change mid-shot.
- `docs/expressive/scenes.json` and `tools/scene_manifest.mjs` were not regenerated or edited. `co.festival_begin`,
  `sb.next_day_inn` and `sb.quiet_morning` could now be classed as illustrated (a faded passage filled, one quiet
  shot); the CURATED entries for `co.assembly`, `sb.lamp_name` and `sb.lamp_reply` already say illustrated.

## Open questions for the lead

1. **The `!shake` in `co.assembly`** (line 59) is now a `#` comment: an op removed, not added. The validator rejects
   a shake inside a sequence and the player never fires one there; SHOTS.md planned it as the ink shot's own action.
   Confirm that is acceptable, or say if the sequence should end before it instead (which would split shot 6).
2. **Chapter 4 as two sequences** (`ch4.lamp`, `ch4.reply`), because a sequence must begin and end in one scene and
   `sb.lamp_reply` is also reached alone. Line 114 and the reply challenge play over the dome map between them.
3. **The square at the end of `ch3.assembly`**: the sequence ends on the night picture, then the dusk square shows
   for the 300 ms dissolve before `co.festival_begin`'s `!fade out`. To end in the dark instead, the sequence would
   have to begin in the dark, but the scene's `!warp` fades back in by itself before the `!fade in`. A fix would be
   a content or player change (not made).
4. **`ch4.morning`**: the task allowed "at most a single quiet window shot … if it reads better". I judged it does
   (the line is about the view from the window). It is three inserted ops; removing them restores the plain room.
   The scene's fade-in comes first, so the room shows briefly before the window dissolves in.
5. The name on the shade, the word on the slip and the chronicle's columns are drawn as marks only (dabs, slanted
   strokes, dashes). An early version of the name made cross-like shapes; it was redrawn so that no mark crosses
   another. Say if even these should be plainer.
6. `tests/e2e/sequence_shots.mjs` now presses Next only once per line shown. The old loop could press twice in the
   gap before a fade and carry a short sequence through unseen under load (it lost the landscape captures of the inn
   and the morning twice). The Chapter 1–2 runs still capture all their shots with it (`ch2.plate` checked).
7. `staging_chapters.mjs --ch=showcase` does not include any of these six scenes. Staging `co.assembly` and
   `sb.lamp_name` in the world (behind the pictures) belongs to the workers staging Chapters 3–6.
