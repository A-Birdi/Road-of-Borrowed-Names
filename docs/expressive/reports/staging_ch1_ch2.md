# Staging pass — Chapters 1 and 2 (§16 whole-game coverage)

Records what this pass changed, what was run and what was observed. Categories as in VALIDATION.md:
**B** = real browser test (Playwright/Chromium, the built `index.html`), **U** = node unit/content test,
**R** = code review/static inspection only, **H** = still needs a human.

Scope: the scenes of Chapter 1 (62) and Chapter 2 (76) that `docs/expressive/SCENES.md` drafted as
"Performed overworld" by heuristic `(H)`. Not in this pass: `rw.hana_first` (staged earlier; its entry stays in
`CURATED`), `sg.asahi_name` (the illustrated-sequence pass), `rw.bridge_scene` and the prologue (illustrated
sequences, untouched), and the other staged scenes of the earlier pass. This is direction only: no line, branch,
quest step, item or outcome was added, removed or reworded (with staging off, every scene's first branch ends in
exactly the state the staged run ends in; below).

## Outcome

All 138 entries were reviewed by reading and are now decided `(C)` except the two not in this pass (136 decisions
in `tools/scene_curated_ch12.mjs`, merged into the manifest's `CURATED` / `CURATED_INLINE`).

| | Ch1 | Ch2 | total |
|---|---|---|---|
| drafted "Performed overworld (H)" | 62 | 76 | 138 |
| **staged** (Performed, decided) and played branch by branch in the browser | 36 | 60 | **96** (300 branches) |
| Performed, decided by reading, **not staged** (files outside this pass: `src/content/lq`, `cases`, `pets`, `pages`) | 19 | 11 | 30 |
| Quiet by design (decided) | 4 | 4 | 8 |
| Interface/system text (decided) | 2 | 0 | 2 |
| not in this pass (`rw.hana_first`, `sg.asahi_name`) | 1 | 1 | 2 |

Every scene in `src/content/ch1/**` and `src/content/ch2/**` that stays "Performed overworld" is staged (except
`sg.asahi_name`, not in this pass). The 30 performed scenes outside those folders are the open item of this pass
(see "Remaining").

## What was added

- **Direction in the scene files** (`src/content/ch1/30–34_*.js`, `src/content/ch2/20–24_*.js`): `!gesture`,
  `!look`, `!prop`, `!walkto`, `!ambience` cues on the lines they belong to, and a `# Staged:` note at the top of
  each staged scene saying what it shows. The speaker carries the line; at most one listener answers, smaller; an
  attention change is a turn to the thing and back (a turn persists, so each look away is followed by
  `!look … pc` where the scene goes on); the player is neutral unless the line is theirs or says what they do.
  Where the line branches by companion (`?(comp=…)`), each companion answers in their own vocabulary (Nao's glance
  at the exit and the satchel strap, Mio's hand to her chest and guarded hands, Ren's glasses and lamp, Suzu's
  showman's hands and shrug); escalation stays in character (one larger gesture at the turn of a scene, not on
  every line). Constraints of the figures were kept: cane users (Tsuru, Yasu, Fuku) are given one-handed
  gestures, glasses gestures only for glasses wearers, the archive's clerk (a non-human figure) only the
  attention gestures its look allows.
- **Authored positions** (`!walkto`): the player steps to the giver's side before a handover so the hands read
  side-on instead of hidden behind the player (Tsuru's letter, Ren's record, Mio's salve, Oto's sign, Bunta's and
  Kiku's tallies, Tetsu's rope, Wataru's notebook, Sōta's nets, the vane in Genzō's lighthouse); Mio walks to her
  shelf when her line says she lines the bottles up; Nao kneels to clear the reeds; at three doorways where the
  follow rule puts the companion on your own tile (the road from the harbour, the archive reading room, the
  cove) the companion steps off beside you before it is given anything to do. Each position was chosen on the
  map (free, reachable, not furniture) and is checked in every branch. No NPC map placement was changed.
- **One gesture and seven held props**, in new files:
  - `src/engine/51e_gestures_ch12.js`: `wave` (hello / goodbye), built from the pose layer's existing `half` and
    `wave` key poses through `RB.gestures.G`, so `validate()`, `duration()` and the `?dev=actors` habits sheet
    see it like the others; no profile lists it, so idle life never picks it. Used for Mame's wave from the
    square and at the see-off.
  - `src/engine/32h_props_ch12.js`: `charm`, `plane`, `shuttle`, `seaglass`, `plate` (a blank blue glass plate —
    no letters drawn), `rope`, `nets`, added to the pose layer's prop table. Drawing only; `!give`/`!take` are
    unchanged.
- **Minimal fixes outside the scene files** (each reported here):
  - `src/engine/52_staging.js` `rejoin()` (one line): after a scene that moved you, the companion walks back
    behind you; when that place was free but **unreachable** (behind you could only be reached through you or the
    person you talk to — Sōta's quay), the path search returned nothing and the companion stayed three tiles off
    until your next step. It now falls back to any free place beside you, as it already did when the place behind
    you was occupied.
  - `src/content/practice_b/30_compare.js`: the cue lines added before 13 quoted lines (One Word, Two Moments)
    moved them to later command indices; the quotations now name the indices the unchanged lines are at (the
    earlier staging pass did the same for `sg.omi_wataru`). `src/engine/79_compare.js`: a sighting saved under the
    old index (`s.practice.compare.seen['<scene>#<index>']`) still counts for the same line (same scene and hash),
    so an existing save keeps the comparisons it had unlocked (unit test added in
    `tests/unit/practice_b.test.mjs`). No save field, key or schema changed.
  - `tools/scene_manifest.mjs`: imports the decisions; decisions for inline entries (the two oral histories)
    go in a separate `CURATED_INLINE` (the unit test requires `CURATED` to name scenes), checked by a new
    assertion in `tests/unit/scene_manifest.test.mjs`. `SCENES.md` and `scenes.json` regenerated.
- **Tests**: `tests/e2e/staging_runner.mjs` (the runner), `tests/e2e/staging_ch12_cases.mjs` (96 fixtures, 300
  branches), and the Chapter 1/2 loop in `tests/e2e/staging_chapters.mjs`
  (`--ch=1|2|showcase`, `--only=<scene prefix>,…`, `--branches`).

## How a scene is checked (`tests/e2e/staging_runner.mjs`)

Each case is a synthetic fixture of the moment the scene plays (map, where you stand and face, companion, flags,
quests, items, variables, who you talk to — that person turns to you, as `50_world.js talkTo` does), not a
campaign played to it. Every branch is played to its end, answering choices in order. A challenge, activity,
battle, lesson, card, rest, shop or menu inside a scene is answered by the same stand-in in the staged,
reduced-motion and unstaged runs (their own runners are tested elsewhere); creatures and other arrival scenes
are kept out. Per branch (staged, normal motion):

1. the scene plays to its end (at least its minimum number of lines);
2. every cue names somebody who is there, and every gesture cue can be made by that person (a gesture the
   library cannot fit to the figure counts as a failure, though the game would drop it silently);
3. every authored position is reached (each `!walkto` resolves `true`);
4. at every animation frame nobody shares a tile (including the tile someone is stepping into) and nobody stands
   on furniture (`blockedStatic`);
5. nobody's idle life plays while the scene runs;
6. afterwards (once nobody has moved for a moment, bounded at 5 s) every non-wandering NPC is at their place,
   nobody is left mid-walk (a wanderer's own round excepted), and your companion is within two tiles;
7. the gestures the case expects (what the scene is about) are cued.

Per scene (its first branch; every branch with `--branches`): with reduced motion the same people get the same
gestures in the same order and the scene ends in the same state; with staging off it ends in exactly the same
state (map, flags, inventory, quests, variables, notes, seen scenes, companion). Runtime: about 7 min for
Chapter 1 and 12 min for Chapter 2 on the shared box. `runBranch` uses only `page.evaluate` (no element handles
are taken).

Recorded but not counted as staging failures, because the walking is the world's own coming and going, not
direction: someone who walks in to speak passing through a standing person (`50_world.js ensureSpeaker`), and
someone the story moves to a new place on the map walking there through people (`shiftTo` / `routeOut`, "people
are ignored"). Staging can still put someone in such a path: in `sg.sota_nets` the companion, back beside you on
the quay, stands where Sōta walks to his new place (with staging off nobody is in his way there). They are printed on the test line as "the world's walk-ins and
moves passing through" (seen in `rw.seeoff` and `sg.sota_nets`). The lead is changing those routes on the task
branch; this classification (`world()` in the runner) is to be re-tightened after that. A companion that arrived
on your own tile by the follow rule is not counted until the scene moves it off or gives it anything to do.

## Validation log

Run on the shared 4-core box (other workers' browser tests running at the same time), headless Chromium via
the installed Playwright, on the built `index.html`, browser test files one at a time.

- **U** `node tools/validate.mjs --filter rw` and `--filter sg` — no errors; 13 warnings each, all lexicon
  conflicts that were there before this pass (no warning about a cue, a gesture or a position).
- **B** `node tests/e2e/staging_chapters.mjs --ch=2` — first run **1622 passed, 1 failed**:
  `sg.genzo_wind (written · nao)`, "afterwards … nao@8,5; companion 2 tiles away" (the unit suite was running
  at the same time). Rerun alone, `--only=sg.genzo_wind --branches`: **48 passed, 1 failed**, the same symptom on
  the Ren branch. Diagnosed with a trace of the companion after the scene: it was walking back to your side and
  arrived normally; the runner's wait for everybody to stop had ended in the instant between two steps of that
  walk (neither moving nor routed). Fixed in the runner (wait until nobody has moved for 300 ms, still bounded at
  5 s; the assertion is unchanged). Then `--only=sg.genzo_wind --branches`: **49 passed, 0 failed**; full
  `--ch=2`: **1623 passed, 0 failed** (701 s).
- **B** `node tests/e2e/staging_chapters.mjs --ch=1` — **698 passed, 0 failed** (439 s), and again after the
  runner fix **698 passed, 0 failed** (484 s).
- **B** after placing the companion beside you on the lighthouse roof (`sg.genzo_wind`):
  `--only=sg.genzo_wind --branches` **49 passed, 0 failed**.
- **B** `node tests/e2e/staging_chapters.mjs --ch=showcase` (the earlier per-chapter scenes) — **66 passed,
  0 failed**.
- **B** `node tests/e2e/actor_life.mjs` — **39 passed, 0 failed**; `staging_wataru.mjs` — **112 passed,
  0 failed**; `departures.mjs` — all ok (20 checks); `world_fixes.mjs` — all ok (15 checks); `story_ch1.mjs` —
  **8/8 PASS** (profiles F and A × the four companions, 30–31 checks each); `practice_b.mjs` — **6 passed,
  0 failed**. (These ran before the runner fix and the lighthouse change, neither of which they use.)
- **B** `node tests/e2e/pursue.mjs E mio "ch1_done@rw.@rw_mill>ch2_done@sg.@sg_main"` — a new campaign played
  through the real world with staging on: reached `ch1_done` (214 site visits, 161 s) and `ch2_done` (51 visits,
  46 s); problems `[]`, page errors `[]`. One companion (Mio) only.
- **B** the same after the lighthouse change: `pursue.mjs E mio …` reached `ch1_done` (214 visits, 157 s) and
  `ch2_done` (51 visits, 43 s); `pursue.mjs F ren …` reached `ch1_done` (219 visits, 162 s) and `ch2_done` (51
  visits, 43 s); both: problems `[]`, page errors `[]`. Nao and Suzu were not played through the story here
  (they are covered scene by scene by the cases).
- **U** `node tests/run-unit.mjs scene_manifest` — **322 passed, 0 failed**; `practice_b` — **96 passed,
  0 failed** (with the new sightings test).
- **U** `node tests/run-unit.mjs` — first run during the pass **24581 passed, 4 failed** (the manifest test
  rejecting inline ids in `CURATED` ×3, and `practice_b` naming the 13 moved quotations); after the fixes
  above: **24585 passed, 0 failed**.
- **R** the frame sheets below were looked at (the four sheets, 16 frames).

## Contract rows advanced (docs/expressive/CONTRACT.md; boxes not ticked here)

- **HX33** (speaker primary, one smaller listener response, attention staged, the player follows the chosen
  line) — *in progress → Chapters 1–2 done for the scene folders.* Authored in the 96 scenes by these rules and
  reviewed by reading each scene (**R**); the cue order per branch is browser-checked (**B**), but "primary vs
  smaller" and "reads well" are a judgement, partly visible in the frame sheets (**R**), not measured. **H**:
  watching the scenes at play speed.
- **HX35** (authored reachable positions, usable sides, no furniture or stacking, reservations, plausible end
  positions, consistent state) — *in progress → verified for the 96 scenes, every branch* (**B**: no shared tile
  or furniture at any frame, every `!walkto` reached, people back home and the companion beside you, the same end
  state staged/unstaged/reduced). Not this pass's: the world's walk-ins/moves passing through people (above).
- **HX39** (manifest 100 % classified, decided) — *Chapters 1–2: all 138 drafts decided by reading* (**R**,
  generated `(C)`; **U** `scene_manifest.test.mjs` passes). The other chapters' heuristic entries remain.
- **HX40** (every selected item implemented or reported blocked; all meaningful branches inspected) — *Chapters
  1–2: the 96 staged scenes are played on every listed branch (300)* (**B**); the 30 performed scenes outside the
  scene folders are **reported, not implemented** (ownership; below). Branch selection per scene is a reading
  judgement (**R**): choice picks, each companion where lines branch by companion, and the flags that change
  what is said; branches that only change narration text without cues were not all enumerated (e.g. every
  combination of `rw.tsuru_hint`'s five places is covered by three flag sets, not all 32).
- **HX45** (personal and long questlines audited, direction throughout) — *not advanced for Chapters 1–2*: the
  long-quest scenes (`lq.*`) are decided Performed but not staged.

## Remaining, not verified, open questions

- **Not staged (outside this pass's files)** — 30 performed scenes: the long quests 'the unpaid fare' and 'the
  nameless road' (`src/content/lq/30_fare.js`, `40_road.js`, `50_letters.js`: 17), the cases of the parcel,
  the view and the shell button (`src/content/cases`: 6), The Pages We Keep (`src/content/pages`: 3) and the pet
  vignettes (`src/content/pets`: 4). Each has a decided reason with the direction it needs ("Proposed" in the
  table). Priority if assigned: long quests (personal/long-quest tier), then the cases, pets and pages.
  **Open question:** may this pass (or another) edit `src/content/lq/**` etc. for that?
- `rw.seeoff`: the friends who see you off walk up as each one speaks (`ensureSpeaker` walk-ins), so they
  cannot be cued before their first line; their own lines carry no gesture. Staged: you look back along the
  road at the start, and at the end, once they have all walked up, you look back to Tsuru and Mame waves. The
  walk-ins crowd round you where the world places them (frame 4 of the depart sheet); that placement is the
  world's, not this pass's.
- `sg.genzo_wind`: on the lighthouse's small roof the camera cannot centre you, and a companion behind you
  stood under the dialogue box; your companion is now set beside you during the fade up the stairs
  (`!walkto comp 6 5 up now`). Other scenes were not checked frame by frame for the dialogue box covering a
  listener (the tests do not measure it; the camera centres you on the larger maps, where one row behind you is
  clear of the box).
- `sg.asahi_glass`: the `:have` line that calls `sg.asahi_name` is left unstaged (the other pass's scene).
- The oral histories (`inline.history.*`) are decided Quiet: the fragments are dialogue-box lines inside the
  activity, with no script line to carry a cue; a per-fragment gesture would need a hook in
  `src/ui/75_activities.js` (not done).
- The compare re-indexing (`30_compare.js`) will recur whenever direction is added before a quoted line; the
  other chapters' passes should expect `practice_b.test.mjs` to name the moved quotations.
- Not verified: how the scenes look at play speed to a person (**H**); real-device performance; the frame sheets
  are from the headless browser at 960×640.

## Evidence

Frame sheets (four frames each, cropped around the people at full size from 960×640 headless Chromium frames,
staged, normal motion) in
`docs/screenshots/staging/ch1_ch2/`:

- `ch1_rw.tsuru_first_letter.png` — you step to Tsuru's side and hand over the letter (side-on); she reads it;
  she sends you round the square; she turns to the performer by the well.
- `ch1_rw.depart_mio.png` — you write the two names on the hall lantern from its side; Mio steps in behind you
  for her first words as your companion; the see-off: you look back along the road; the friends who walked up
  to see you off, Mame waving at the back (the crowding is the world's walk-in placement).
- `ch2_sg.genzo_wind_mio.png` — Genzō downstairs; on the roof, Mio beside you as Genzō shows the vane; you write
  on the vane's fin from its side; the vane turned, Genzō's small celebration (the dialogue box is docked at the
  top in the second frame).
- `ch2_sg.isamu_nao.png` — Nao's personal thread in Isamu's empty house: you lean towards the chair at the
  window; Nao's head down over the undelivered letter; a hand to the satchel strap ("it's still at the bottom
  of my bag"); the glance to the door.

Each is 60–170 KiB. They show single frames at the line's dwell; the gestures' motion is not captured (no
clips were made).

## Decisions and staging, scene by scene

"branches run": the variants played in the browser (each `· comp` is one companion). "read; not run": decided
by reading, not staged in this pass. The full reason of each decision is in `tools/scene_curated_ch12.mjs` and
`SCENES.md`; the full direction is the scene's `# Staged:` note.

#### Chapter 1 (62)

| scene | decision | what is staged / reason | branches run |
|---|---|---|---|
| `rw.arrive` | Performed (C), staged | you stop on the wet road and look along it; what your background notices, you do (the courier points out the dark lantern, the craftsperson looks down at the mud, the student checks the letter); then you face east … | 3 (courier; craft; student) |
| `rw.tsuru_first` | Performed (C), staged | Tsuru points back down the road to the lantern that went out; you step up beside her to hand over the letter (side-on, so the hands show) and she reads it; she shows you a dark lantern of her own … | 2 (letter · help; wrote · what) |
| `rw.tsuru_hint` | Performed (C), staged | each place Tsuru still sends you to, she points at as she names it (Mio's door, the warehouse, the bridge, the well, the teahouse chimney); each line names a different place, so the points differ. | 3 (nobody yet; only Hana left; all heard: the report) |
| `rw.tsuru_report` | Performed (C), staged | you tell her what you found with an open hand and she listens, still; she thinks over the old word, points north to the mill, and her head shakes at the voices; a nod to send you. | 1 |
| `rw.mio_first` | Performed (C), staged | Mio's worried welcome with a hand at her chest; you both look at the blank labels; as she talks she goes to the shelf and lines the bottles up (the line says so) and speaks to you from there … | 3 (labels written; later; from her side) |
| `rw.nao_first` | Performed (C), staged | Nao points straight down at the missing board, eyes the way out, holds up one of the damp letters and you lean in to it; after the sorting, a nod, a point to the chalked crates (you look) … | 3 (sorted; a courier; later) |
| `rw.ren_first` | Performed (C), staged | caught talking to a lantern, Ren pushes their glasses up; you look them over (the patched coat, the mud); they explain with an open hand, turn to the lantern whose name won't take root … | 1 |
| `rw.ren_lanterns_done` | Performed (C), staged | Ren leans to the bridge lantern beside them, points across to the far bank (the second name), thinks with a hand to their chin; then turns to you with a nod for the word, and looks down at their boots. | 2 (at the south lantern; at the bridge lantern) |
| `rw.suzu_first` | Performed (C), staged | Suzu's showman's welcome with both hands; Mame points her out and Suzu answers her; when she lowers her voice she looks away and back to you; the lanterns closing like books in her hands; a laugh … | 1 |
| `rw.hana_first` | not in this pass (staged earlier) | — | — |
| `rw.tea_bed` | Interface/system (C) | the futon in Hana's room, a narrated rest prompt (three narration lines, nobody else present) that hands over to the inn rest (!inn); like the other rest prompts, the rest screen carries it — nothing to perform. | read |
| `rw.mr_sae` | Performed (C), staged | Sae starts back from you (a voice?), then holds herself; when she can say no more, her head goes down, and Mio, beside her, kneels to her box of medicines (you look round at her). | 1 |
| `rw.mr_mio` | Performed (C), staged | Mio holds the warm cup she has brewed, puts it in Sae's hands and turns to her; Sae's head goes down over her confession; Mio's nod; Sae looks away, then at you, and gives up the pin; Mio's nod to her. | 1 |
| `rw.mr_nao` | Performed (C), staged | Nao points out the narrows and turns to the reeds as they name the other way (you look); when you have read the reeds yourself, a nod and a look between the two ways … | 4 (told · reeds cleared; told · the narrows; read the reeds · cleared; took them for reeds · narrows) |
| `rw.mr_suzu_talk` | Performed (C), staged | Suzu shows off the cliffs like a theatre and gives the idea of a round with both hands; if you sing, you both turn to the narrows and she conducts the cliff with an open hand; then she turns back to you, pleased with herself. | 3 (sing; ask, then sing; heard the echo · read it) |
| `rw.m1_gears` | Performed (C), staged | you lean in to the jammed gears; you reach in and set the pin; at the faint heat you turn to the millstone, and the bang of the trapdoor makes you look up at the ladder. | 2 (with the pin; no pin) |
| `rw.m0_chest` | Performed (C), staged | you kneel at the old box to take out the charm. | 1 |
| `rw.m1_boss` | Performed (C), staged | you face the millstone where the voices swirl, start at the echo's words, and stand still to understand them (no gesture on that line); remembering the word on the gear plate, a hand to your chin … | 2 (knows mizu; remembers mizu) |
| `rw.hall_gather` | Performed (C), staged | you walk in to the middle of the four; Tsuru points west down the road, counts the two names on her fingers and points to the threshold; Nao looks from Tsuru to you ("only one of us"), and Tsuru turns to her for her answer … | 1 |
| `rw.hall_nao` | Performed (C), staged | Nao's case for themself with a point to the door (the escape routes); a hand to the satchel where the undelivered letter is; your ask answered with a nod; unsure, a shrug; reconsidered, a nod. | 4 (asked; not yet; chosen · reconsider; chosen · go together) |
| `rw.hall_mio` | Performed (C), staged | Mio's hands busy at her waist as she lists what she can do; her half-hidden laugh at wanting the village to struggle; asked, a nod and then the flat hand of a boundary ("don't take me home"); unsure, she measures with both hands … | 4 (asked; not yet; chosen · reconsider; chosen · go together) |
| `rw.hall_ren` | Performed (C), staged | Ren counts their reasons (the second is their teacher), pushes their glasses up over the face they cannot recall; asked, a small formal bow; unsure, they point to the door where it is decided; revised, a nod. | 4 (asked; not yet; chosen · reconsider; chosen · go together) |
| `rw.hall_suzu` | Performed (C), staged | Suzu sells herself with both hands, then drops the act to explain with an open palm; the lie she never finished makes her look away and back; asked, a plain nod (no flourish on the serious line); unsure, an open hand … | 4 (asked; not yet; chosen · reconsider; chosen · go together) |
| `rw.hall_shrine` | Performed (C), staged | you look closely at the lantern; Tsuru, behind you, points to the door it will cross; the one who chose to come answers from where they stand, in their own way (a nod, a nod, a small bow, an open hand). | 7 (Nao chosen · set out; Ren chosen · set out; Mio chosen · not yet; Suzu chosen · not yet; nobody asked yet; before the gathering; after setting out) |
| `rw.depart` | Performed (C), staged | you step to the side of the lantern and write the two names on its paper (seen side-on, so the brush shows); the new companion steps in behind you and you turn to them for their first words as a pair: Nao points to the door (the … | 4 (nao; mio; ren; suzu) |
| `rw.seeoff` | Performed (C), staged | you look back east along the road to those who came to see you off. They walk up as each one speaks (the walk-in of speakers who are not on the road), so their own lines carry no gesture; at the end … | 4 (nao; mio; ren; suzu) |
| `rw.sign_road` | Performed (C), staged | you lean in to the blank signpost; once its arms are mended, if Mame still has her charm to give, she waves from the square and you turn to see her. | 3 (mended; later; already mended) |
| `rw.oto_sign` | Performed (C), staged | you step to Oto's side and she leans in to the old sign you show her; then she hands you the boots she made. | 1 |
| `rw.bench_tools` | Performed (C), staged | you kneel to look under the workbench, and reach in for the plane that glints there. | 3 (the record; read already; no quest) |
| `rw.bunta_tally` | Performed (C), staged | you step to Bunta's side and hold up the plane, and he rubs his forehead; he takes it from you as he owns up, then holds out Kiku's shuttle for you to take to her. | 2 (with the plane; the shuttle not yet taken) |
| `rw.kiku_tally` | Performed (C), staged | you step to Kiku's side and hand her the shuttle; she holds it and smiles over Bunta; then she gives you the faded ribbon from her hand to yours. | 2 (with the shuttle; waiting) |
| `rw.yasu_first` | Performed (C), staged | Old Yasu points to his boat, idle on the high river; after the story, a nod to a good listener. | 2 (told; another time) |
| `rw.mame_first` | Performed (C), staged | Mame's hands twist together over her name; told it won't vanish, a little celebration; told you don't know, she points at you (you won't forget). | 2 (it won't; I don't know) |
| `rw.mame_charm` | Performed (C), staged | Mame holds out the reed charm she made and it passes into your hand; her laugh at "probably". | 1 |
| `rw.hana_rush` | Performed (C), staged | Hana is pouring as she greets you in the rush; after the orders, she hands you a pouch of her morning tea leaves across the counter. | 2 (helped; later) |
| `rw.tsuru_post` | Performed (C), staged | Tsuru thinks over the news of the Archive's keeper with a hand to her chin, and points to the new ledger on the desk. | 4 (the trial; the keeper; no news; the Atlas, not now) |
| `rw.tomo_lost` | Performed (C), staged | Tomo points to the notice on the board, a hand at her chest over the blank name tag, and a point across the bridge to where Kōji saw a white cat. | 1 |
| `rw.tomo_mochi` | Performed (C), staged | Tomo's breath goes out in relief at the sight of Mochi; after the tag, a nod over the name, and she hands you Mochi's old bell. | 2 (the tag written; later) |
| `inline.history.rw.a_history` | Quiet by design (C) | Yasu's four fragments of how Reedwake began, said in the dialogue box before the ordering task (src/ui/75_activities.js history), not script lines that can carry cues; Yasu faces you from rw.yasu_first (which is staged: the point to his boat, the nod after) … | read |
| `cs.parcel_shelf` | Performed (C), not staged here | the unclaimed parcel read and picked up from the shelf (the address, the red stamp, the notched bell seal), the companion's own reaction, the choice to take it. Proposed: a bend to the shelf and the parcel in hand. | read; not run |
| `fw.f1.screen` | Interface/system (C) | a choice menu whose acting is done by the field-puzzle hooks (fw_look/fw_act/fw_open/fw_hint), and once solved three narrated slips read in place: interface, not a performed exchange. | read |
| `lq.fare_pay` | Performed (C), not staged here | Long quest 'the unpaid fare': Chigusa lays the fare before Kōji, he takes it and opens the book, she writes her name; Hana's and Kōji's teasing. Proposed: coins laid down, the brush, the book. | read; not run |
| `lq.fare_book` | Performed (C), not staged here | Long quest 'the unpaid fare': the fare book read at the shelf, the seal found and pressed, the seal kept; companion answers. Proposed: a bend to the book, the seal in hand. | read; not run |
| `lq.fare_koji` | Performed (C), not staged here | Long quest 'the unpaid fare' (start): Kōji asks for a reader's help with his mother's fare book, Hana remembers her waiting; each companion's answer. | read; not run |
| `lq.road_write` | Performed (C), not staged here | Long quest 'the nameless road': the name written on the shade (a challenge), the lantern lit, both names written side by side; the companion's promise to stand with you. Proposed: you write on the shade, the companion writes beside you. | read; not run |
| `lq.kh_arrive` | Performed (C), not staged here | Long quest 'the nameless road': arriving at the empty hamlet and the great persimmon tree, each companion's answer. Proposed: you look up at the tree, the companion's own reaction. | read; not run |
| `lq.kh_tree` | Performed (C), not staged here | Long quest 'the nameless road': the height marks cut into the trunk read, each companion's answer. Proposed: you lean to the marks. | read; not run |
| `lq.kh_stone` | Performed (C), not staged here | Long quest 'the nameless road': the names on the stone read, each companion's answer. Proposed: you lean to the stone. | read; not run |
| `lq.kh_chest` | Performed (C), not staged here | Long quest 'the nameless road': the persimmon-dyed cloth found in the chest. Proposed: a kneel to the chest, the cloth in hand. | read; not run |
| `lq.road_loops` | Performed (C), not staged here | Long quest 'the nameless road': the path brings you back to the same lantern (already moves you back a step), each companion's answer. Proposed: a look round at the lantern, the companion's own reaction. | read; not run |
| `lq.road_home` | Performed (C), not staged here | Long quest 'the nameless road' (end): Kayo picks a fruit and calls the tree's name, cuts her new height mark, gives you the seed. Proposed: reach, call, carve, handover. | read; not run |
| `lq.road_yasu1` | Performed (C), not staged here | Long quest 'the nameless road': Yasu remembers the hamlet and the persimmon tree, and that the name has gone; sad. Proposed: Yasu (a cane) looks across the river. | read; not run |
| `lq.road_lantern` | Performed (C), not staged here | Long quest 'the nameless road': the blank lantern looked at, the path beyond, each companion's answer. Proposed: you look at the shade and along the path. | read; not run |
| `lq.road_yasu2` | Performed (C), not staged here | Long quest 'the nameless road': the dried persimmon handed to Yasu, his bite, the name Koharuno said aloud after thirty years. Proposed: a handover and his reaction. | read; not run |
| `pages.enter_retro` | Quiet by design (C) | Post-game Pages: your companion asks for a moment to talk, with the choice to talk now or later; they turn to you, and the conversation itself is pages.retro: facing only. | read |
| `pages.retro` | Performed (C), not staged here | Post-game Pages, the retrospective in the Lantern Hall: the narration gives each companion's action (Nao's satchel set down and the lean on the wall, Mio sits first and leaves a ledger crooked, Ren cleans their glasses and hands you the lamp … | read; not run |
| `pages.enter_unfinished` | Quiet by design (C) | Post-game Pages: Nao or Mio asks you to hear the rest of what they said, with the choice to hear it now or later; they turn to you, and the conversation is pages.unfinished: facing only. | read |
| `pages.unfinished` | Performed (C), not staged here | Post-game Pages: Nao's pat on a lighter satchel, Mio's laugh and her thanks for the hand on her back. | read; not run |
| `pages.offer` | Performed (C), not staged here | Post-game Pages: each companion proposes making a page together and asks which theme, with their own reasons (Tsuru's ledger, Umi, resting, the margins, the small scenes). Proposed: the companion's own conversational gestures. | read; not run |
| `pets.cat.notice` | Quiet by design (C) | Pet vignette: one remark from a party member about the cat by the carpenter's; they look that way: attention only. | read |
| `pets.cat.cat` | Performed (C), not staged here | Pet vignette 'the cat': the ginger cat and the swinging screen; settled, you offer a hand low or sit nearby and wait (two ways in), and invite it. Proposed: the hand held out low, sitting down beside it. | read; not run |
| `pets.cat.screen` | Performed (C), not staged here | Pet vignette 'the cat': the reed screen set back on its stone or tied to the nail (two ways). Proposed: a bend to the screen's foot or a reach to the nail. | read; not run |

#### Chapter 2 (76)

| scene | decision | what is staged / reason | branches run |
|---|---|---|---|
| `sg.arrive` | Performed (C), staged | you turn to the sea at the smell of it and lean to look down at the town below the cliffs; you and your companion turn to each other for your exchange … | 4 (nao; mio; ren; suzu) |
| `sg.road_forklantern` | Performed (C), staged | you lean in to the shade whose name keeps changing; your companion answers it in kind (Ren leans in too, Nao looks between it and you, Mio looks away from it, Suzu shrugs); once lit, you look up at it. | 5 (flickering · nao; flickering · mio; flickering · ren; flickering · suzu; lit) |
| `sg.road_bench` | Performed (C), staged | you look out over the harbour from the bench and lean to the darker water round the island; your companion answers in their own way (Mio's laugh, Nao's glance away, Ren's open hand to the view, Suzu's long breath out). | 4 (nao; mio; ren; suzu) |
| `sg.road_inland_closed` | Performed (C), staged | back at the fork, your companion reacts as the road has fooled you (Nao points up the road you took, Mio looks between the road and the lantern, Ren pushes their glasses up, Suzu laughs it off and shakes her head) … | 4 (nao; mio; ren; suzu) |
| `sg.road_open` | Performed (C), staged | your companion steps up off the harbour steps beside you; you look up the road to the lit fork lantern; your companion's own answer (Ren a nod to the lettering, Nao a point up the north road, Mio's laugh … | 4 (nao; mio; ren; suzu) |
| `sg.harbor_first` | Performed (C), staged | you look down into the harbour; you bend to the label that lands at your feet and pick it up, and turn towards Daigo calling from below (he is down on the quay, so he is heard before he is near) … | 4 (nao; mio; ren; suzu) |
| `sg.return_harbor` | Performed (C), staged | you shade your eyes to watch the letters wheel down over the harbour; your companion's own response (Nao's nod, Mio points to Kiyo crying over her letter, Ren's long breath out, Suzu's small celebration) … | 4 (nao; mio; ren; suzu) |
| `sg.ch2_end` | Performed (C), staged | night at the end of the pier (the scene's night ambience, set while the screen is dark: the line says "that night"; and dark again for the morning, so the fades cover only the time changing) … | 4 (nao; mio; ren; suzu) |
| `sg.omi_intro` | Performed (C), staged | Ōmi keeps writing through her first words; at "Reedwake too?" her working hand stops and she looks up at you; she separates the three troubles with both hands and makes her point with a flat downward hand … | 4 (nao; mio; ren; suzu) |
| `sg.wataru_first` | Performed (C), staged | Wataru starts up from his counting; an open hand at the mess; his hands twist over the storm; he turns away to his ledger as he says he will check it … | 4 (nao; mio; ren; suzu) |
| `sg.crate_blank` | Performed (C), staged | you lean in to the label that will not keep still; your companion's own reaction (Ren leans in too, Nao looks between it and you, Mio's hand to her chest, Suzu looks away). | 5 (the first crate · nao; the first crate · mio; the first crate · ren; the first crate · suzu; the second crate · asked) |
| `sg.crate_glued` | Performed (C), staged | you lean in to the new label and reach to lift its corner; your companion's own reaction (Nao and Mio lean in to the hand and the paste, Ren pushes their glasses up, Suzu an open hand: an old trick) … | 4 (nao; mio; ren; suzu) |
| `sg.crates_check` | Performed (C), staged | you look from one label to the other; Wataru turns to you and starts at the question; your companion's aside names what he does (Nao: he glances at the door; Mio: he will not meet your eyes) or is their own (Ren's glasses … | 6 (asked · nao; asked · mio; asked · ren; asked · suzu; nothing yet; not compared yet) |
| `sg.tamae_first` | Performed (C), staged | Tamae wipes the counter as she greets you, an open hand at the rush, then points at you: help; a small celebration for yes and a count of the regulars' habits; her laugh when it is done; your companion's own answer (Mio's nod … | 6 (helped · nao; helped · mio; helped · ren; helped · suzu; later; a break) |
| `sg.tamae_postbag` | Performed (C), staged | Tamae hands the bundle of post across the counter and you read the blank envelopes; when the last letter turns up she holds it up, and its red stamp is what you lean in to; she hands it over … | 5 (delivered · nao; delivered · mio; delivered · ren; delivered · suzu; later) |
| `sg.tetsu_first` | Performed (C), staged | Tetsu points you to the board and you look at it; his arms fold over "boards lie"; he points the way to Shiori's hut; you step to his side and he hands you a coil of rope; your companion's own answer (Nao's nod, Suzu's laugh … | 4 (nao; mio; ren; suzu) |
| `sg.omi_report` | Performed (C), staged | Ōmi asks without looking up from her writing, and stops to listen when you say the causes differ; a nod; then her point made with a flat hand, the two kinds of fault held apart in her two hands, a breath out over Sōta's boat … | 2 (sorted; not yet) |
| `sg.genzo_clue` | Performed (C), staged | Genzō points to the oil barrel, folds his arms over "washed away", and turns aside over Sōta's boat; your companion's own answer (Ren's head lowered, Mio's shake of the head, Nao's nod, Suzu counts). | 4 (nao; mio; ren; suzu) |
| `sg.kiyo_clue` | Performed (C), staged | Kiyo's guarded hand at "who told you?", a look away over the cheap salt, a shrug; she points to the barrels by the stall and you look; her head goes down as she takes her share of the blame. | 1 |
| `sg.check_clues` | Performed (C), staged | you put the three together with a hand to your chin; your companion turns to you to say it, each their own way (Nao's nod, Mio's hand to her chest, Ren's open hand, Suzu's lowered head). | 4 (nao; mio; ren; suzu) |
| `sg.wataru_confront` | Performed (C), staged | Wataru's hands twist; you count off the three things; he looks away as the lie holds; when it breaks his head goes down, then he faces you to say "I did it" (a fidget resolving into a lowered but direct posture) … | 6 (he speaks for himself · nao; he speaks for himself · mio; he speaks for himself · ren; he speaks for himself · suzu; we tell her; not yet) |
| `sg.wataru_letter` | Performed (C), staged | Wataru reads over his unfinished reply and holds it out to you; relief breathed out when it is done; you step to his side and he hands you his notebook of labels, his hands twisting over the reason; you read its last page … | 5 (written · nao; written · mio; written · ren; written · suzu; not yet) |
| `sg.shiori_tide` | Performed (C), staged | Shiori looks up at "the branch"; she points to the telescope that looks out to the island, opens a hand for the sand road, and points to the tide table on the wall (you look at it); a nod when you read it right … | 4 (read · come back later; read · wait; not read; read before) |
| `sg.shiori_fog` | Performed (C), staged | Shiori points out towards the lighthouse; with Ren, they look from one wall to the other for the tip of the point, and she points them out of the window to the tallest building. | 2 (Ren; Nao) |
| `sg.causeway_fog` | Performed (C), staged | in the fog you look down at the sand at your feet; back at the marker, your companion's own reaction (Nao looks back down at the causeway, Mio looks between the ways, Ren pushes their glasses up, Suzu shrugs) … | 4 (nao; mio; ren; suzu) |
| `sg.genzo_wind` | Performed (C), staged | Genzō shakes his head over the dead wind and points to the stairs up to the vane, a nod: come on; at the top (your companion beside you, not under the dialogue box on this small roof) you lean in to the still vane … | 5 (written · nao; written · mio; written · ren; written · suzu; not yet) |
| `sg.causeway_walk` | Performed (C), staged | you look out along the sand road; your companion's own answer (Nao looks back up to the harbour for the time, Mio bends to the shells, Ren looks along the road, Suzu's showman's hands); you look ahead to the doorway in the cliff. | 4 (nao; mio; ren; suzu) |
| `sg.da_arrive` | Performed (C), staged | you look up into the cold hall and lean to the wet letters on the shelves; your companion's own reaction (Nao holds out an envelope with a Reedwake postmark, Mio's hand to her chest at the lit lamps, Ren looks up at them … | 4 (nao; mio; ren; suzu) |
| `sg.da_catalog` | Performed (C), staged | you lean in to the jumbled drawers and follow the cord to the inner door; your companion's own way of explaining the order (Ren counts the kana off, Nao's open hand, Mio's laugh at herself, Suzu's shrug) … | 6 (sorted · nao; sorted · mio; sorted · ren; sorted · suzu; later; done before) |
| `sg.da_stacks_first` | Performed (C), staged | you look up along the channel where the paper cranes drift; your companion's own reaction (Mio's hand to her chest, Nao shakes their head, Ren points to the shelf labels, Suzu looks between the cranes and you). | 4 (nao; mio; ren; suzu) |
| `sg.da_reading_first` | Performed (C), staged | your companion steps in from the doorway beside you; a breath out in the warm, dry room; your companion's own way of resting (Nao looks from one exit to the next, Mio hands you a ginger sweet, Ren leans to the lamp … | 4 (nao; mio; ren; suzu) |
| `sg.da_ledger` | Performed (C), staged | you lean in to the open register; your companion's own reaction to the head office's seal (Ren starts, then looks away from their master; Nao's flat hand; Mio's hand to her chest; Suzu's hand to her chin) … | 6 (read · nao; read · mio; read · ren; read · suzu; later; again) |
| `sg.da_registry` | Performed (C), staged | you lean to the card on the desk, then pick it up and read it. | 3 (for Asahi; nobody asked yet; taken) |
| `sg.da_raft` | Performed (C), staged | you look across the channel at the floating cabinet; with the rope in hand you reach to throw it, and it falls short; your companion's own way of suggesting the word (Nao's and Mio's open hand, Ren's glasses, Suzu's laugh) … | 6 (tied · nao; tied · mio; tied · ren; tied · suzu; later; done) |
| `sg.da_boss` | Performed (C), staged | you walk up to the long counter towards the stamping; the Clerk (a figure that only turns and tilts) tilts to you at "Next"; you answer with an open hand; your companion's own reply (Nao's and Mio's flat hand, Ren's open hand … | 4 (nao; mio; ren; suzu) |
| `sg.da_boss_after` | Performed (C), staged | you look down at the broken stamp; the Clerk tilts to you; you explain with an open hand and ask after "the master"; you look up at the letters lifting off the shelves; your companion's own reaction (Nao's nod … | 4 (nao; mio; ren; suzu) |
| `sg.omi_final` | Performed (C), staged | Ōmi looks up to the window as she remembers the rain of letters, then listens, still, to your account; a nod for her thanks; an open hand or a shrug for Wataru, depending on how he came to her; and a point east to the Gull … | 2 (he came himself · Nao; we told her · Suzu) |
| `sg.tamae_rest` | Quiet by design (C) | Tamae's offer of a room and her morning line around the inn rest (!inn), two lines; she already faces you (talking to her turns her to you), and the rest screen carries the night: stillness is right. | read |
| `sg.tamae_after` | Performed (C), staged | Tamae holds up the letter from her sister that came down on her window, and laughs at the length of the reply. | 2 (rest; good luck) |
| `sg.tamae_post` | Performed (C), staged | Tamae laughs at her own joke, and holds up her sister's reply. | 2 (rest; another time) |
| `sg.nao_cameo` | Performed (C), staged | Nao settles the satchel strap, points to Tamae's bag at the counter, turns to your companion for a word of their own, and glances at the door before heading off. | 3 (mio; ren; suzu) |
| `sg.tetsu_history` | Performed (C), staged | Tetsu looks out towards the island as he remembers, then back at you; his head goes down at his father taking off his hat. | 2 (told; another time) |
| `sg.dir_check` | Performed (C), staged | Ren looks left and right and gives up (you turn to tease them; they look away); you point to the sea for Daigo, hold the two facings apart in your hands for Tobi, and point east for Kiyo; your companion's own answer (Nao's nod … | 4 (nao; mio; ren; suzu) |
| `sg.sota_start` | Performed (C), staged | Sōta points east to the cove he cannot reach, looks away over the blank signpost, and rubs his forehead over his mother's worry. | 1 |
| `sg.sota_nets` | Performed (C), staged | you step to Sōta's side and hand him his nets; he looks away over his own part in the scrape; then he hands you the glass float; your companion's own answer (Nao's nod, Mio leans in to the float, Ren's glasses … | 5 (before Wataru · nao; before Wataru · mio; before Wataru · ren; before Wataru · suzu; after Wataru) |
| `sg.fuku_idle` | Performed (C), staged | Fuku points to the bench where she played shōgi with Isamu and shakes her head over his letter; with Nao, she peers at them (didn't you collect his letters?), and Nao looks away and shakes their head. | 2 (Nao; the wind back · Mio) |
| `sg.fuku_boat` | Performed (C), staged | Fuku looks out to sea, where the boat went every morning, and shakes her head over the lost name. | 1 |
| `sg.fuku_plate` | Performed (C), staged | you step to Fuku's side and hand her the nameplate; she reads the name on it; her head goes down over the quarrel; your companion's own answer (Mio's apologetic bow, Nao's, Ren's and Suzu's lowered heads) … | 4 (nao; mio; ren; suzu) |
| `sg.glass_pick1` | Performed (C), staged | you kneel to the glint and pick up the sea glass. | 1 |
| `sg.glass_pick2` | Performed (C), staged | you kneel to the glint and pick up the sea glass. | 1 |
| `sg.glass_pick3` | Performed (C), staged | you kneel to the glint and pick up the sea glass. | 1 |
| `sg.glass_pick4` | Performed (C), staged | you kneel to the glint and pick up the sea glass. | 1 |
| `sg.asahi_order` | Performed (C), staged | Asahi counts off her two problems and, putting the second off, points at you: glass first. | 1 |
| `sg.asahi_glass` | Performed (C), staged | you step to Asahi's side and hand her the sea glass; a hand to her chin over the boat's name and a look away at the strangeness of it; with Ren, their glasses at "shelved". | 2 (no name yet · Ren; with the registry card) |
| `sg.asahi_name` | not in this pass (illustrated-sequence worker) | — | — |
| `sg.genzo_grump` | Performed (C), staged | Genzō's arms fold; with Mio, he eyes her and she answers with a flat hand, and he turns to her with new respect; he points to his daughter's letter on the table and turns away over it … | 4 (nao; mio; ren; suzu) |
| `sg.genzo_truth` | Performed (C), staged | Genzō's arms fold; you read him the blurred line from the letter; he turns to you, arms down; you explain with an open hand; his head goes down over his knees; your companion's own word (Nao's shrug, Suzu's laugh) … | 3 (Nao; Suzu; Mio) |
| `sg.ferry_arrives` | Performed (C), staged | Nagisa turns to her father at the landing; he looks away (knees are knees), she laughs; his head goes down at "welcome home" and she nods; she gives you a small polite bow for her father, and thanks him with both hands … | 4 (nao; mio; ren; suzu) |
| `sg.isamu_nao` | Performed (C), staged | Nao steps in beside you; you lean to the chair at the window, and Nao looks at it and away; you turn to them; they look to the old man's desk as they remember his hand … | 2 (should I have?; say nothing) |
| `sg.suzu_cameo` | Performed (C), staged | Suzu works the thin crowd with both hands, nods to you, makes her joke with an open hand, and turns serious, looking away and back, for the warning. | 1 |
| `sg.cove_arrive` | Performed (C), staged | your companion steps down off the cliff path beside you; you look along the little beach; your companion's own answer (Nao looks back at the only way out, Mio's breath out, Ren looks away, Suzu's showman's hands). | 4 (nao; mio; ren; suzu) |
| `sg.cove_nets` | Performed (C), staged | you lift the nets down off the rocks; your companion's own answer (Nao's shrug, Mio leans in to the neat drying, Ren counts the knots, Suzu bends to let the crab go). | 4 (nao; mio; ren; suzu) |
| `inline.history.sg.a_history` | Quiet by design (C) | Tetsu's four fragments about the island and the bell, said in the dialogue box before the ordering task (src/ui/75_activities.js history), not script lines that can carry cues; sg.tetsu_history around it is staged (he looks out to the island before … | read |
| `cs.parcel_record` | Quiet by design (C) | narration of a page read in place and a clue noted, nobody else present; you stand reading the ledger — attention only, the record page is the interface. | read |
| `cs.parcel_oldsite` | Performed (C), not staged here | the empty bracket at the old East Landing, the parcel held out and kept, each companion's answer. Proposed: you hold the parcel out at the post and draw it back. | read; not run |
| `cs.seto_parcel` | Performed (C), not staged here | Seto looks at the seal, compares her crest and hands the parcel back. Proposed: the parcel passes to her and back. | read; not run |
| `cs.hama_parcel` | Performed (C), not staged here | Hama reads the address, takes the parcel, unties it and finds the bell part, gives you the wax seal; a branch on telling her. Proposed: a handover, the unwrapping, the wax given. | read; not run |
| `cs.view_window` | Performed (C), not staged here | the sketch in Genzō's window, his doubt, the sketch and chart paper lent, each companion's answer. Proposed: he looks to the window, takes it down and hands it over. | read; not run |
| `cs.shell_shiori` | Performed (C), not staged here | Shiori gives a shell button from the jar for reading the tide right. Proposed: the button handed over. | read; not run |
| `lq.fare_gull` | Performed (C), not staged here | Long quest 'the unpaid fare' (end): Chigusa returns the seal to Tamae, who presses it; the kept cup is given to you. Proposed: two handovers, a stamp pressed. | read; not run |
| `lq.fare_tamae` | Performed (C), not staged here | Long quest 'the unpaid fare': Tamae recognises her mother's seal and tells of Sister Dove, sad and laughing. Proposed: the seal shown and handed back. | read; not run |
| `lq.road_tetsu` | Performed (C), not staged here | Long quest 'the nameless road': Tetsu remembers the flood and the people carrying persimmon branches downriver. Proposed: Tetsu looks upriver as he remembers. | read; not run |
| `lq.letters_home` | Performed (C), not staged here | Long quest letters: a courier runs up with letters from Reedwake, the seal's print and Tsuru's note read; companion answers. Proposed: the letters received and read (the courier is narrated, not on the map). | read; not run |
| `pets.bird.notice` | Quiet by design (C) | Pet vignette: one remark from a party member about the bird at the end of the quay; they look that way: attention only. | read |
| `pets.bird.bird` | Performed (C), not staged here | Pet vignette 'the bird': the bird and the flapping ribbon; settled, you stand still by the post or hold out an open palm (two ways in), and invite it. Proposed: stillness by the post, the open palm. | read; not run |
| `pets.bird.post` | Performed (C), not staged here | Pet vignette 'the bird': the ribbon untied or wound round the post (two ways). Proposed: hands at the knot. | read; not run |
