# Illustrated sequences, wave 2 (Chapters 5 and 6) — validation notes

Scope: the Chapter 5 sequence `ch5.bell` (the drowned bell rings, `lf.bell_touch`; SHOTS.md §5), the faded passage
`lf.boat_to_tower` filled by `ch5.boat` (SHOTS.md §7b), and the Chapter 6 sequence `ch6.toya` (Tōya's four words
read in context, `sa.toya_read`; SHOTS.md §6), on the existing player `RB.sequence` (no change to the core, its kit,
or the Chapter 1–2 files).

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
| (this commit) | this report |

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
| HX40 | **Advanced** (branches of the three new sequences played: 11 runs). Other chapters' scenes not covered here. | browser test |
| HX41 | **Advanced**: Chapter 5 (`ch5.bell`, 4 compositions) and Chapter 6 (`ch6.toya`, 5) now have integrated sequences. Chapters 3–4 belong to another worker. `ch5.boat` (the faded passage) has **one** composition: the passage has one line, and a second picture would have no line to open it — below the 3–6 asked of a sequence. | browser test, unit test, stills |
| HX42 | **Done for the three sequences built**, as SHOTS.md §5, §6 and §7b plan them, with the deviations written down under "As built" (the hall framing and its four phases; the slip turned on the line that reveals its front; Kasane kneeling; the bell shot's three phases; the decide shot's `aside`). | code review against SHOTS.md; focal areas (browser test) |
| HX43 | **Self-reviewed only.** Drawn in code in the game's pixel style; the changed states are held (the green flaked off, the bell gold, the windows lit, the water drawn back, the slip turned). No person has reviewed the art. Known weak points: Kasane's hands are small and plain; the pooled robe is a simple shape; the gong close-up's reflection is heavy; the wall stone is regular. | stills |
| HX45 | **Not built.** The §8 audit's strongest candidate in these chapters is `sa.shelf_ren` on its open branch (`:ropen`): the teacher's face surfacing on the folio's paper is unreadable at tile scale. Recommended as a three-shot insert in `43f` (the folio opening; the face surfacing on its narration line; Ren with the glasses off). Not started, as asked: reported first. | code review |
| HX46–HX50 | **Hold for the new sequences**: manual only (8 s idle, not 60 s), controls by click and key, Previous read-only, Skip asked and stopping at the challenge, Escape never skipping. | browser test |
| HX51 | **Partial for the new sequences**: reduced motion holds each action's end at once; no `!shake` inside (validator, unit, browser). Sound-off, large text and a viewport change mid-shot were not tested. | browser test, unit test |
| HX52 | **Done for the three sequences, checked by name**: the flags, items, quests and place after every branch; the bell gold in the last shot as the world draws it once rung; nobody drawn for Tōya; only the companion who is here. | browser test |
| HX53 | **Done for the two kept sequences** (`ch5.bell`, `ch6.toya`; `ch5.boat` keeps none): compact beats, read-only replay with the same shots. | browser test |
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
5. **§8 candidate**: `sa.shelf_ren` (`:ropen`) as above — say whether to build it.
6. Kasane is written "they" in comments and here (the story's "their folio").
