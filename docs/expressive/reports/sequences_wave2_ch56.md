# Illustrated sequences, wave 2 (Chapters 5 and 6) — validation notes

Scope: the Chapter 5 sequence `ch5.bell` (the drowned bell rings, `lf.bell_touch`; SHOTS.md §5), the faded passage
`lf.boat_to_tower` filled by `ch5.boat` (SHOTS.md §7b), and the Chapter 6 sequence `ch6.toya` (Tōya's four words
read in context, `sa.toya_read`; SHOTS.md §6), on the existing player `RB.sequence` (no change to the core, its kit,
or the Chapter 1–2 files). **Addendum** (after the lead's answers to the open questions): `ch6.ren`, the §8 insert
in `sa.shelf_ren`'s open branch (`:ropen`; SHOTS.md §8.4) — see "Addendum: `ch6.ren`" at the end.

Base: task branch `claude/stoic-sagan-n3jvgk` at `da9751c`. Work branch: `worktree-agent-af9f99b3ea940f299`.
Environment: headless Chromium through the repository's Playwright; Linux; a shared 4-core machine (load average
6–12 during the runs). No other browser, no physical phone.

Kinds of evidence used below: **browser test** (a check in the built `index.html`), **unit test** (node, no
browser), **stills** (images to look at, not assertions), **code review** (read, not run).

## Commits

| Commit | What |
|---|---|
| `e8bfafc` | `src/ui/43e_seq_ch5.js` (`ch5.bell`, `ch5.boat`); the ops in `lf.bell_touch` and `lf.boat_to_tower` |
| `eea0439` | `src/ui/43f_seq_ch6.js` (`ch6.toya`); the ops in `sa.toya_read` |
| `1660a47` | `tests/e2e/sequence_chapters_56.mjs` |
| `fe68694` | `tests/unit/sequence_ch56.test.mjs`; SHOTS.md §7b row and "As built" notes under §5 and §6 |
| `d5ff4b8` | evidence stills (30 WebP, 0.83 MB); Kasane's hands in the light of their face |
| `30f4a8f` | the test replays the kept memories read-only |
| `2ad4915` | this report (wave 2 as merged in `b07c492`) |
| `46ee8e7` | addendum: `ch6.ren` in `src/ui/43f_seq_ch6.js`; the ops in `sa.shelf_ren` (`:ropen` only) |
| `aebe046` | addendum: `tests/e2e/sequence_chapters_56.mjs` — four `sa.shelf_ren` runs and the per-sequence checks for `ch6.ren` |
| `d147cbf` | addendum: `tests/unit/sequence_ch56.test.mjs` — `ch6.ren` in the registry and the scene |
| `038a0b6` | addendum: `ch6.ren` framing on a phone held upright and on its side |
| `cd3ef1a` | addendum: 9 stills of `ch6.ren` (0.30 MB) |
| `e7e3036` | addendum: SHOTS.md §8.4 "As built" |
| (this commit) | addendum: this report's `ch6.ren` rows |

## What was built

**Files (new):**
- `src/ui/43e_seq_ch5.js`. `ch5.bell`, four compositions: `bell` (a low view up at the great green bell, you and
  your companion small on the platform; a slow light slides across it and the cast relief stands out; held through
  the kana lesson, the challenge and the choice), `gong` (the lip close over the water and a conduit's foot: one
  swing in place of the screen shake, the green flaked off the lip where it struck, rings over the water; then the
  pale line of sound up the pipe), `town` (from a window high in the tower: two pulses up the pipes, then down and
  out along the pipeline, the town's windows lighting street by street), `hall` (the chamber three-quarter from
  across the water: a ring on the empty water for the voice — nobody drawn; you both turn to it; the companion's own
  gesture; the water drawing back on the last line). `ch5.boat`, one composition: a cut at the water's surface, the
  boat in profile (you at the oars, your companion in the bow), the drowned lower town below, the tower and its
  green bell ahead; the stroke is the action.
- `src/ui/43f_seq_ch6.js`. `ch6.toya`, five compositions: `folio` (over your shoulder: the folio passes into
  Kasane's hands; their eyes close on their line; faint rain of the memory behind), `floor` (from above: the open
  folio, the key slip back-up and the notice laid beside it; held through the challenge), `turned` (Kasane with the
  slip: surprise as they read; turned over on the line about its front; eyes closed), `bell` (only with Tōya's bell:
  your hand with it, Kasane rings it once — one ripple of light — and holds it out again), `decide` (Kasane between
  your back and your companion's: head lowered, lifted; the companion's own gesture). Kasane kneels among the pages
  (their portrait over a drawn, pooled robe).
- `tests/e2e/sequence_chapters_56.mjs` (data-driven; see below), `tests/unit/sequence_ch56.test.mjs`.
- `docs/screenshots/sequences/ch5.*.webp`, `ch6.*.webp` (30 stills).

**Files (changed):**
- Content, ops and `#` comments only, with one exception: `src/content/ch5/24_tower.js` (`lf.bell_touch`): `!sequence`
  / `!shot` ops; **the scene's `!shake` was removed** (a `#` comment marks its place). SHOTS.md §0 and §5 prescribe
  it ("a `!shake` inside a wrapped section … is shown as the shot's own one-time action instead"), the validator
  rejects a `!shake` inside a sequence, and the runner never fires one there (`70_script.js`), so the scene behaves
  as before. `src/content/ch5/22_main.js` (`lf.boat_to_tower`) and `src/content/ch6/52_scenes_climax.js`
  (`sa.toya_read`): ops and a comment only. `git diff da9751c -- src/content` shows no other non-op change.
- `docs/expressive/SHOTS.md`: the §7b row for `lf.boat_to_tower` (Filled); "As built" notes under §5 and §6.
- `index.html` rebuilt.
- `src/content/practice_b/30_compare.js`: **not changed** — no comparison quotes a line of these three scenes.
  The dialect tables' `@ ch5/tower:327` references are informative only (`85_dialect.js` keys on the Japanese).

## Runs

All on the build of `30f4a8f` (the rebuilt `index.html` is committed). Browser tests one at a time.

| Check | Kind | Result |
|---|---|---|
| `node tools/build.mjs` | build | 359 source files; the committed `index.html` is current |
| `node tools/validate.mjs` | content validator | no errors (15 warnings: lexicon conflicts and two map reachability notes, none from this work) |
| `node tests/run-unit.mjs` | unit | **25,091 passed, 0 failed** (25,051 at the base + 40 in `sequence_ch56.test.mjs`) |
| `tests/e2e/sequence_chapters_56.mjs` | browser | **144 passed, 0 failed** (4 m 43 s) |
| `tests/e2e/sequence_chapters_56.mjs --shots` (on `d5ff4b8`, art as now) | browser + stills | 138 passed, 0 failed (before the replay checks were added); wrote the 30 stills |
| `tests/e2e/sequence_manual.mjs --quick` | browser | 64 passed, 0 failed |
| `tests/e2e/story_ch5.mjs` (F and I × the four companions; plays `lf.boat_to_tower` and `lf.bell_touch`) | browser | 8 of 8 PASS |
| `tests/e2e/story_ch6.mjs` (five runs; plays `sa.toya_read` through `sa.after_battle`) | browser | all ok (37/37, 36/36, 36/36, 36/36, 37/37) |
| `tests/e2e/interludes.mjs` | browser | 76 passed, 0 failed |
| `tests/e2e/staging_chapters.mjs --ch=showcase` | browser | 66 passed, 0 failed (it rewrote ten committed stills in `docs/screenshots/actors`; restored, not part of this branch) |
| `tests/e2e/sequence_dev.mjs` | browser | 9 passed, 0 failed (contact sheet: 51 pictures in 7 sequences, no drawing errors at three sizes) |

The `sequence_manual`, story, interlude, staging and dev-viewer runs were made on the build of `fe68694`, which
differs from the final one only in the colour of Kasane's hands (`43f`) and in test files; they were not re-run on
`30f4a8f`.

**What `sequence_chapters_56.mjs` checks** (real clicks on Next and on the replies; challenges answered by the game's
own test solver through the real checker, except where noted):
- Every branch: `ch5.bell` "Ring the bell" with Nao, Mio, Ren and Suzu (each companion's lines and gesture), "Not
  yet"; `ch5.boat` "Row out" and "Not yet"; `ch6.toya` with and without Tōya's bell, with each companion. For each:
  the shots in order, every phase of each reached on its line, the state after the scene (`lf_bell_rung`, `lf_main`
  9 and the shore; the bell hall and nothing rung on "Not yet"; the tower top and no dark left after the crossing;
  `sa_toya_read`, the folio taken once, the bell kept, `sa_main` 6), the Shared memory kept, no screen shake, nothing
  of the player left (listeners, timers, overlays, control rows), no page error.
- The Foundations profile: the kana lesson and its practice, then the bell's challenge (left with its own "Come back
  later", as a player can), all over the held first shot.
- Per sequence: 8 s idle — same line, same shot, holding. Previous (P) looks back, Replay (R), Next returns to the
  live line without moving it on; campaign state unchanged. Escape opens the skip question; Keep watching keeps the
  line; Skip scene asks first (unseen) and a confirmed skip stops at the challenge, then runs to the end with the state
  lines once and the sequence counted once (the crossing: one line, nothing new ahead, so Skip goes on without asking).
- Reduced motion: every line's shot at its end state at once after the dissolve; no shake.
- 1280×720, 390×844 and 844×390: the fullest branch of each sequence played through; at every line the shot's focal
  rectangle (`RB.sequence.focus()`) lies above the sheet's live top.
- The kept memories of `ch5.bell` and `ch6.toya` replay read-only: the beats shown (20 of 20 in Chapter 6), the same
  shots in the same order, no campaign change.

## The HX rows, honestly

| Row | Status after this work | Evidence |
|---|---|---|
| HX40 | **Advanced** (branches of the four new sequences played: 11 runs, and 4 more for `sa.shelf_ren` in the addendum). Other chapters' scenes not covered here. | browser test |
| HX41 | **Advanced**: Chapter 5 (`ch5.bell`, 4 compositions) and Chapter 6 (`ch6.toya`, 5; the addendum's `ch6.ren`, 3) now have integrated sequences. Chapters 3–4 belong to another worker. `ch5.boat` (the faded passage) has **one** composition: the passage has one line, and a second picture would have no line to open it — below the 3–6 asked of a sequence. | browser test, unit test, stills |
| HX42 | **Done for the four sequences built**, as SHOTS.md §5, §6, §7b and §8.4 plan them, with the deviations written down under "As built" (the hall framing and its four phases; the slip turned on the line that reveals its front; Kasane kneeling; the bell shot's three phases; the decide shot's `aside`; for `ch6.ren`, the phases of the face and close shots). | code review against SHOTS.md; focal areas (browser test) |
| HX43 | **Self-reviewed only.** Drawn in code in the game's pixel style; the changed states are held (the green flaked off, the bell gold, the windows lit, the water drawn back, the slip turned). No person has reviewed the art. Known weak points: Kasane's hands are small and plain; the pooled robe is a simple shape; the gong close-up's reflection is heavy; the wall stone is regular. `ch6.ren`: Ren's figure is small on a phone held upright (the portrait's own 96 px, as in Chapter 1); the glasses in the hands are a few pixels; the filing slip's marks are the same abstract blots as `ch6.toya`'s pages. | stills |
| HX45 | **Built for `sa.shelf_ren`** (addendum, after the lead's go-ahead): `ch6.ren`, three shots on the open branch only (the folio opening; the face surfacing on its narration line, held through the challenge; Ren with the glasses off); "Leave it" and the path without Ren stay in the world. Other §8 candidates (§8.1–§8.3, §8.5–§8.8) not built. | browser test, unit test, stills |
| HX46–HX50 | **Hold for the new sequences** (`ch6.ren` included): manual only (8 s idle, not 60 s), controls by click and key, Previous read-only, Skip asked and stopping at the challenge, Escape never skipping. | browser test |
| HX51 | **Partial for the new sequences** (`ch6.ren` included): reduced motion holds each action's end at once; no `!shake` inside (validator, unit, browser). Sound-off, large text and a viewport change mid-shot were not tested. | browser test, unit test |
| HX52 | **Done for the four sequences, checked by name**: the flags, items, quests and place after every branch (for `sa.shelf_ren`: `sa_ren_took` and the quest done on the open branch, `sa_ren_left` on "Leave it", `sa_ren_carried` and the folio carried without Ren); the bell gold in the last shot as the world draws it once rung; nobody drawn for Tōya; only the companion who is here. | browser test |
| HX53 | **Done for the three kept sequences** (`ch5.bell`, `ch6.toya`, `ch6.ren`; `ch5.boat` keeps none): compact beats (9 of 9 for `ch6.ren`), read-only replay with the same shots. | browser test |
| HX71 | **Advanced**: `lf.boat_to_tower` filled by `ch5.boat` — 5 of the 9 faded passages filled. Re-run from source on this build: lines still said in the dark only in `sg.genzo_wind` (1), `co.festival_begin` (4), `sb.quiet_morning` (1), `sb.next_day_inn` (1) — all already in the §7b table; none new. | browser test, unit test, stills; a node scan of every scene's `!fade out … !fade in` |

## Evidence

`docs/screenshots/sequences/` — `ch5.bell_{bell,gong,town,hall}_<size>.webp`, `ch5.boat_cross_<size>.webp`,
`ch6.toya_{folio,floor,turned,bell,decide}_<size>.webp` at 1280x720, 390x844 and 844x390 (30 files, 0.83 MB):
each shot at its hold in the built game with the dialogue sheet and the controls on screen (Mio for Chapter 5,
Suzu on the crossing, Ren with the bell for Chapter 6). Regenerate: `node tests/e2e/sequence_chapters_56.mjs
--shots-only`.

## Not verified

- A person's review of the art and the pacing of each shot (HX43).
- Firefox, Safari, a physical phone or tablet; touch (the phone-sized runs used clicks, not taps).
- A 60-second idle on these sequences (8 s was run, as asked); sound off, TTS, large text (150 %), a viewport change
  in the middle of a shot.
- The Foundations lesson path was played with Nao only; the challenge's "Come back later" once; every other run
  used the test solver for the challenge.
- `sa.toya_read` was started directly with its items given (a synthetic start); its callers (`sa.after_battle`,
  `sa.after_return`) were exercised only by `story_ch6.mjs` (RB.test auto mode).
- The merge with the Chapter 3–4 worker's branch (they may also edit `SHOTS.md`, possibly the §7b table).

## Open questions for the lead

1. **The one non-additive edit**: `lf.bell_touch`'s `!shake` is replaced by a `#` comment, as SHOTS.md §0/§5 and the
   validator ask. If the rule "add ops only" should win, the alternative is to keep the `!shake` and relax the
   validator (the runner already never fires a shake inside a sequence).
2. **Layouts that change mid-shot**: the sheet's top only rises during a sequence (`sheetTop` keeps the highest), and
   the kit's `stage()` switches a 1280×720 frame to its phone-on-its-side layout when a long line pushes the sheet
   above 56 % of the height. A shot then re-frames on that line (seen in `ch6.toya`'s `turned` with Ren's long
   lines). The focal area stays visible; the jump is the cost. Holding a shot's first layout would need the player
   to pass a per-shot vb (an API change; not made).
3. **The crossing has one composition** (one line in the passage). A pier shot on "Tokuji's boat" (before the
   choice) would make two, but ending such a sequence before the fade means a glimpse of the pier after the
   crossing; not done.
4. `docs/expressive/scenes.json` / `tools/scene_manifest.mjs` were not touched: `lf.bell_touch` and `sa.toya_read`
   are already classed as illustrated; `lf.boat_to_tower` is not yet marked "faded passage filled".
5. **§8 candidate**: `sa.shelf_ren` (`:ropen`) as above — say whether to build it. *(Answered: build it — done, see the addendum. Q1 accepted, Q2 one composition is fine, Q3 stays open with no API change.)*
6. Kasane is written "they" in comments and here (the story's "their folio").

## Addendum: `ch6.ren` — Ren's folio on the open branch (SHOTS.md §8.4, HX45)

Built after the lead's answers. Base: the task branch at `b07c492` (wave 2 merged; this work branch was brought up to it
with `git merge b07c492`, a fast-forward). Same environment as above (load average 6–9 during these runs).

**What was built.**
- `src/ui/43f_seq_ch6.js` (appended; nothing above it changed): `ch6.ren`, title {師|し} の {顔|かお} / "The teacher's
  face", kept as a memory. Three compositions: `open` (one phase: Ren's bust before the Room of Set-Down Memories'
  shelves, the folio's cover swinging open at their chest, one hand on the spine and one turning the cover); `face`
  (`surface`, `smile`, `fade`: the open spread close, the cover's inside with Ushio's filing slip as abstract marks and a
  red seal square; on the right-hand page the teacher's face — `sa_ushio`'s portrait turned to ink — surfaces on
  "On the paper, a face surfaces", changes to the smile on Ushio's own line, and the voice's light goes out on "The voice
  fades" while the face stays; held through the challenge `sa.ren_reply`); `ren` (`sad`, `smirk`, `glasses`: close on
  Ren, sad, the smirk at the eyebrows, then the glasses lifted off to their hands — the portrait drawn without its
  glasses, eyes half-lidded and down — and a cloth going round one lens, longer than it needs). No letters, kana or
  kanji are drawn: the slip's marks are blots, the glasses two rims. Ren is "they" in comments, the memo and here.
- `src/content/ch6/51_scenes_archive.js` (`sa.shelf_ren`): one `#` comment, `!sequence ch6.ren begin|end` and seven
  `!shot` ops, all between `:ropen` and `:rleave`, after the branch's `!set`, `!quest` and `!music` (they run once, as
  before); the sequence ends on the glasses line, before `!music sorrow`. "Take it back" falls through to `:ropen` and
  "You decide" reaches it by its `!goto`; "Leave it" and the path without Ren ("Don't open it" / "Leave it here") never
  start it. No line, branch or outcome changed: the unit test pins the scene's lines and state commands to their
  counts at `b07c492` and the only additions to 2 `sequence` and 7 `shot` ops.
- Framing (`038a0b6`): on a phone held upright Ren's bust sits low with the shoulders meeting the sheet, as Chapter 1
  frames Hana (the first build floated it mid-screen over a long column of robe); on a phone on its side with the
  challenge's tall sheet up, the face page rises only until the face's brow meets the top (the first test run caught
  the face's focal area at y = −8 there; see Runs).
- `docs/expressive/SHOTS.md` §8.4: "As built". `docs/expressive/scenes.json` already classes `sa.shelf_ren` as an
  Illustrated sequence; not touched.

**Runs** (on the build of `e7e3036`, whose `index.html` is that of `038a0b6`; browser tests one at a time):

| Check | Kind | Result |
|---|---|---|
| `node tools/build.mjs` | build | 359 source files; the committed `index.html` is current |
| `node tools/validate.mjs` | content validator | no errors (15 warnings, the same as before; none from this work) |
| `node tests/run-unit.mjs` | unit | **25,109 passed, 0 failed** (25,091 before + 18 new in `sequence_ch56.test.mjs`, now 58) |
| `tests/e2e/sequence_chapters_56.mjs` (all four sequences) | browser | **196 passed, 0 failed** (6 m 7 s; 144 as before + 52 for `ch6.ren`) |
| `tests/e2e/sequence_chapters_56.mjs --only ch6.ren` | browser | first run (before `038a0b6`): 51 passed, **1 failed** — 844×390, the `face` shot's focal area at y = −8 under the challenge's tall sheet; fixed in `038a0b6`. After it: 52 passed, 0 failed. One later run failed the 8 s idle check with the runner stuck before the sequence's first line (a 30 s `page.click` timeout; load average 8); rerun alone: **52 passed, 0 failed**; no assertion changed |
| `tests/e2e/sequence_chapters_56.mjs --shots-only --only ch6.ren` | browser + stills | 6 passed, 0 failed; wrote the 9 stills |
| `tests/e2e/story_ch6.mjs` (five runs; `ren/A` answers "Take it back", so plays `ch6.ren` in auto mode; `ren/F` answers "Leave it"; Mio and Suzu carry the folio home; Nao leaves it) | browser | all ok (37/37, 36/36, 36/36, 36/36, 37/37) |
| `tests/e2e/sequence_manual.mjs --quick` | browser | 64 passed, 0 failed |
| `tests/e2e/sequence_dev.mjs` | browser | 9 passed, 0 failed (contact sheet: 58 pictures in 8 sequences, no drawing errors at three sizes) |

**What the browser test adds for `ch6.ren`** (synthetic start in `sa.memories` with the chapter's flags, `sa_main` 4
and `ren_ushio` 1; real clicks; the challenge answered by the game's test solver through the real checker):
- Ren, "Take it back": shots `open → face → ren`, every phase reached on its line, the challenge met once inside the
  sequence, `sa_ren_took` and `ren_ushio` done, still in `sa.memories` with the world back; the Shared memory kept (9 of
  9 beats, no picture) and replayed read-only with the same shots and no campaign change; no shake; nothing of the
  player left; no page error.
- Ren, "You decide" (Ren's own line, then the `!goto ropen`): the same shots, phases, challenge and state.
- Ren, "Leave it. You already have the lessons." and Mio, "Don't open it. Take it home to Ren.": no shot, no challenge,
  `sa_ren_left` / `sa_ren_carried` with the folio in the bag.
- 8 s idle (same line, same shot, holding); Previous (P), Replay and Next read-only; Escape asks; Keep watching keeps the
  line; Skip asks first and a confirmed skip stops at the challenge, then runs to the end with the state lines once and
  the sequence counted once; reduced motion (each line's shot at its end state at once; no shake).
- 1280×720, 390×844 and 844×390: every line's focal area above the sheet's live top.

**Evidence.** `docs/screenshots/sequences/ch6.ren_{open,face,ren}_{1280x720,390x844,844x390}.webp` (9 files,
0.30 MB; 39 stills in this wave, 1.13 MB): each shot at its hold in the built game with Ren, the sheet and the controls
on screen. In `open` the game's own "Quest complete" notice (from the branch's `!quest`, just before the sequence)
is still on screen; at 844×390 it covers Ren's face until it fades. Regenerate: `node
tests/e2e/sequence_chapters_56.mjs --shots-only --only ch6.ren`.

**Not verified** (in addition to the list above): a person's review of the three shots; the "You decide" branch's
memory replay (replayed for "Take it back" only); the Foundations profile on this scene (every run used the test
solver); `sa.shelf_ren` reached from `sa.memories_enter` in a played campaign other than `story_ch6.mjs`'s auto mode;
a 60-second idle; sound off, large text, a viewport change mid-shot.
