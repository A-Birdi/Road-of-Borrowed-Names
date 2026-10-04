# Staging pass — Chapters 5 and 6 (§16 whole-game coverage)

Records what this pass changed, what was run and what was observed. Categories as in VALIDATION.md:
**B** = real browser test (Playwright/Chromium, the built `index.html`), **U** = node unit/content test,
**R** = code review/static inspection only, **H** = still needs a human.

Scope: the scenes of Chapter 5 (72) and Chapter 6 (62) that `docs/expressive/SCENES.md` drafted as "Performed
overworld" by heuristic `(H)` (plus `lf.nao_deliver` and `sa.end_comp`, decided Performed earlier but not staged).
Not in this pass: `lf.boat_to_tower` (its faded crossing is now the illustrated `ch5.boat`, another worker's),
`lf.bell_touch` and `sa.toya_read` (the illustrated selections, not drafts), `lf.mio_refuse` and `sa.isamu_return` (staged earlier; their entries stay in
`CURATED`), and the files of other workers (`src/content/lq`, `cases`, `pages`, `pets`). This is direction only:
no line, branch, quest step, item or outcome was added, removed or reworded (below: every scene's story commands
are identical to the base commit, and with staging off every staged branch ends in exactly the state the staged
run ends in).

## Outcome

All 134 drafts were reviewed by reading and are now decided `(C)` except the three not in this pass (131 decisions
in `tools/scene_curated_ch56.mjs` — 130 scenes and one inline fragment — merged into the manifest's `CURATED` /
`CURATED_INLINE`).

| | Ch5 | Ch6 | total |
|---|---|---|---|
| drafted "Performed overworld" (heuristic, plus the two decided-but-unstaged) | 72 | 62 | 134 |
| **staged** (Performed, decided) and played branch by branch in the browser | 66 | 60 | **126** (537 branches) |
| Performed, decided by reading, **not staged** (`src/content/lq`, another worker's files) | 4 | 0 | 4 |
| Quiet by design (decided) | 0 | 1 | 1 |
| not in this pass (`lf.boat_to_tower`; `lf.mio_refuse`, `sa.isamu_return` staged earlier) | 2 | 1 | 3 |

Every scene in `src/content/ch5/**` and `src/content/ch6/**` that the manifest lists as "Performed overworld" is now
staged (except `lf.boat_to_tower`, the other pass's). After this pass the manifest has one heuristic Performed entry
left in these two chapters (`lf.boat_to_tower`: after the merge below it holds the illustrated crossing `ch5.boat`
between its fade-out and the warp, but no decision for the scene was recorded, so it still reads "Performed
overworld (H)"; its owner should record it).

On "quiet by design": every draft was read for whether something is there to perform — an object handled or read, a
turn of feeling written into a line or the narration, a companion answering something in front of them, a mechanism
worked. Only the oral history (dialogue-box fragments inside an activity, no script lines) has none. A handful of
short scenes are staged with one or two cues and could equally be read as quiet: `lf.ritsu_post`, `lf.setsu_post`,
`lf.akari_post`, `sa.oyone_inn`, `sa.oyone_post`, `sa.clerk_post`, `sa.kasane_walk` (a greeting and a single gesture
before a rest or a menu); they are listed so the owner can strip them if the restraint should be greater.

## What was added

- **Direction in the scene files** (`src/content/ch5/20–28_*.js`, `src/content/ch6/50–54_*.js`): `!gesture`, `!look`,
  `!pose`, `!prop`, `!walkto` cues on the lines they belong to, and a `# Staged:` note at the top of each staged scene
  saying what it shows. As in Chapters 1–2: the speaker carries the line; at most one listener answers, smaller; an
  attention change is a turn to the thing and back (`!look … pc` where the scene goes on); the player is neutral
  unless the line or narration says what they do (read, kneel, hand over, ring the bell, listen); each companion's
  branch line gets one gesture from their own vocabulary (Nao's point, strap and glance away; Mio's guarded hand,
  lean-in and hidden laugh; Ren's open hand, lamp and stillness, glasses at most once a scene; Suzu's showman's
  hands, account book, and the serious register — head down, look away — on grave lines). Restraint follows the
  places: Lanternfall before the bell and the Still Archive get few, small cues (the world's own MOODS slow them
  too); the larger gestures are kept for the turns written into the text (Tokuji's bell, the council back in
  session, Kasane's fear at the gate, the endings). Cues before conditional lines carry the same condition, and the
  cues inside a scene's companion branches (`!if comp=x -> label`) carry `?(comp=x)`, so each companion's cues are
  only theirs (the continuity check reads them that way).
- **Stronger reactions written in the profiles, now shown where they belong**: Nao's handover and Umi's reading in
  `lf.nao_deliver`; Akari's look away and her thanks in `lf.akari_letter`; Tami's celebration in `lf.yae_after`;
  Tokuji's lowered head in `lf.tokuji_story`; Kasane's lowered head in `sa.choose_kasane`; Suzu's handover (the
  ribbon) in `sa.end_comp`. Kasane's bow (written for `sa.toya_read`) is also used for the narrated bow in
  `sa.epi_lf`.
- **Authored positions** (`!walkto`), each chosen on the map (free, reachable, not furniture) and checked in every
  branch: Nao steps up to the ferry counter while you step aside (`lf.nao_umi_first`, `lf.nao_deliver`); Umi brings
  the ferry log round the counter (`lf.timetable`); you walk down to the avenue with Mio (the narration,
  `lf.mio_start`); you go to the rope ladder to unhook it (the narration, `lf.mid_enter`); Ren comes to the side of
  Ushio's stone so the kneel and the lamp read side-on (`sa.ushio_grave`); at the bridge your companion steps to your
  side and you turn to them, so the four gifts read side-on (`sa.end_comp`); at doorways where the follow rule puts
  the companion on your own tile they step off beside you first (`lf.low_enter`, `lf.after_town`, `sa.camp_first`,
  `sa.conduits_enter`); in the council room your companion steps up beside you so the townspeople who walk in have
  somewhere to stand (`lf.yae_after`); before you step back on the locked north road, your companion steps back off
  the path behind you (`lf.road_north_locked`); in `lf.water_returns` your companion makes room and you step back
  north out of the returning water; in `sa.kasane_meet` your companion walks up behind you after the scene's own
  `!move pc up 4`. No NPC map placement was changed.
- **Two held props**, in a new file `src/engine/32h_props_ch56.js` (same contract as `32h_props_ch12.js`; drawing
  only, no letters): `key` (Akari's brass key) and `bell` (Tōya's messenger bell, which you ring towards the tower).
  No new gesture was needed.
- **Profile change** (`src/content/mannerisms/10_cast.js`, on the existing line, number appended): `lf_kei` talk
  `[17, 10]` → `[17, 10, 20]`, the head shake — Kei is the one person in Lanternfall who can still say no (`lf.kei`,
  and Nagi says so in `lf.nagi`).
- **KNOWN escalations** (`tests/unit/conversation_continuity.test.mjs`), each where the narration says what the body
  does: `lf.town_intro|lf_hayato|stamp` ("He nods pleasantly and stamps it."), `lf.tokuji_story|lf_tokuji|flinch`
  ("Having said it, Tokuji looks surprised at himself."), `lf.nao_umi_first|nao|exhale` ("Outside the office, Nao
  leans against the wall and lets out a long breath.").
- **Decisions**: `tools/scene_curated_ch56.mjs` (reason = the scene's `# Staged` note; evidence = the branches the
  runner plays, and a frame sheet where there is one), imported by `tools/scene_manifest.mjs` like the Chapter 1–2
  file; `lf.nao_deliver` and `sa.end_comp` supersede their earlier `CURATED` entries. `SCENES.md` and `scenes.json`
  regenerated.
- **Tests**: `tests/e2e/staging_ch56_cases.mjs` (126 fixtures, 537 branches); `tests/e2e/staging_chapters.mjs` takes
  `--ch=5` / `--ch=6` (and runs them with the others when no chapter is given); two fixture fields in
  `tests/e2e/staging_runner.mjs` — `seen` (scenes already seen: a second visit, a message heard) and `compAt` (where
  your companion really stands when the place you talk from has no room behind you, so the follow rule would put them
  on your tile) — no assertion changed; `tests/e2e/staging_ch56_sheets.mjs` (the frame sheets).
- **Not changed**: `src/content/practice_b/30_compare.js` quotes no Chapter 5–6 line, so no index moved; none of
  `50_world.js`, `51_gestures.js`, `51_mannerisms.js`, `52_staging.js`, `32g_spritepose.js`, `70_script.js`, the
  battle or sequence files.

## How a scene is checked

The same runner as Chapters 1–2 (`tests/e2e/staging_runner.mjs`; described in `staging_ch1_ch2.md` "How a scene is
checked"): each case is a synthetic fixture of the moment the scene plays; every branch is played to its end with
its cues; per branch, every cue names somebody who is there and can make it, every `!walkto` is reached, nobody
shares a tile or stands on furniture at any frame (the world's walkers included; only a walker forced through after
waiting is recorded apart — in this pass only in `sa.epi_lf`, see Findings), nobody idles, afterwards everyone is where the world expects them and your
companion is within two tiles, and the gestures the case expects are cued; per case (every branch with `--branches`),
reduced motion keeps the cues, their order and the outcome, and staging off ends in exactly the same state.

## Validation log

Run on the shared 4-core box (other workers' tests running at the same time), headless Chromium via the installed
Playwright, on the built `index.html`, browser test files one at a time. No assertion was weakened.

**On this pass's own branch** (before the merge below; the build of that commit):

- **U** `node tests/run-unit.mjs` — 25843 passed, 0 failed (`conversation_continuity` 860 / 0, `scene_manifest`
  579 / 0, `practice_b` 96 / 0).
- **U** `node tools/validate.mjs` — no errors; 15 warnings, all there before this pass (13 lexicon conflicts, 2 map
  exits not reachable from the default spawn: `co.oldworks`, `sb.obs_path`).
- **U** story unchanged (a scratch script, not committed): every scene's story commands — everything but the
  `gesture`/`look`/`pose`/`walkto`/`prop`/`beat`/`ambience` ops, labels resolved to the command they point at —
  compared with the base commit `da9751c`: 1250 scenes the same, 0 differ.
- **B** `node tests/e2e/staging_chapters.mjs --ch=5` — 2174 passed, 0 failed (66 scenes, 908 s); no walker forced
  through.
- **B** `… --ch=6` — 2042 passed, 0 failed (60 scenes, 885 s); six world's-fallback records, all in `sa.epi_lf`
  (Findings). Then the epilogue fixtures were corrected (Kasane staying no longer also carried the flags of Kasane
  coming down) and `… --ch=6 --only=sa.epi_lf,sa.epi_sb --branches` — 116 passed, 0 failed (275 s; the same six
  records, Tae instead of Kasane in the branch where Kasane stayed).
- **B** `… --ch=showcase` — 66 passed, 0 failed. `tests/e2e/actor_life.mjs` — 39 passed, 0 failed.
  `tests/e2e/walk_round.mjs` — all passed. `tests/e2e/story_ch5.mjs` — 8 / 8 PASS (profiles F and I with each
  companion, 44–46 steps, `lf.keeper` won). `tests/e2e/story_ch6.mjs` — all ok (ren/A 37/37, nao/F 36/36, mio/E 36/36,
  suzu/I 36/36, ren/F 37/37). `tests/e2e/pages_ending.mjs` — all ok. `tests/e2e/staging_ch56_sheets.mjs` — 5 sheets
  written. (The screenshots the other suites rewrite as a side effect — `docs/screenshots/actors/`,
  `docs/screenshots/pages/` — were restored, not committed.)

**After merging the task branch** (`91eb61f`: the Chapter 3–4 staging pass and the Chapter 5–6 illustrated
sequences; merge commit below): conflicts in `tests/e2e/staging_runner.mjs` (both passes had added `seen` and
`compAt`: kept as one, with the optional direction of the 3–4 side and the cleared step of this side; the 3–4 side's
reset of every NPC to their map place before each branch now applies to these cases too), `tests/e2e/staging_chapters.mjs`
(runs CH12, CH34 and CH56; `--ch=1 … 6`), `tools/scene_manifest.mjs` (both decision files), `index.html` (rebuilt) and
`SCENES.md` / `scenes.json` (regenerated, not hand-merged). `10_cast.js` needed no union (the 3–4 pass changed no
`talk` list). On the merged build:

- **U** `node tests/run-unit.mjs` — 26538 passed, 0 failed; alone: `conversation_continuity` 1291 / 0,
  `scene_manifest` 803 / 0, `practice_b` 96 / 0. `node tools/validate.mjs` — no errors, the same 15 warnings.
- **B** `… --ch=5` — 2174 passed, 0 failed (66 scenes, 875 s); no walker forced through.
- **B** `… --ch=6` — 2042 passed, 0 failed (60 scenes, 862 s); the same six `sa.epi_lf` records.
- **B** `… --ch=showcase` — 66 passed, 0 failed. `tests/e2e/story_ch5.mjs` — 8 / 8 PASS (as before).
  `tests/e2e/story_ch6.mjs` — all ok (ren/A 37/37, nao/F 36/36, mio/E 36/36, suzu/I 36/36, ren/F 37/37).
  `tests/e2e/sequence_chapters_56.mjs` (the sequence pass's test, run because its sequences sit in three of this
  pass's scene files) — 144 passed, 0 failed. (Showcase screenshots restored, not committed.)
- Not rerun after the merge: `actor_life.mjs`, `walk_round.mjs`, `pages_ending.mjs`, the frame sheets.

## Contract rows advanced (docs/expressive/CONTRACT.md; boxes not ticked here)

- **HX33** (speaker primary, one smaller listener response, attention staged, the player follows the chosen line) —
  *Chapters 5–6 done for the scene folders.* Authored in the 126 scenes by these rules and reviewed by reading each
  scene (**R**); the cue order per branch is browser-checked (**B**); "primary vs smaller" and "reads well" are a
  judgement, partly visible in the five frame sheets (**R**), not measured. **H**: watching them at play speed.
- **HX35** (authored reachable positions, usable sides, no furniture or stacking, plausible end positions, consistent
  state) — *verified for the 126 scenes, every listed branch* (**B**).
- **HX39** (manifest 100 % classified, decided) — *Chapters 5–6: 131 of 134 drafts decided by reading* (**R**; **U**
  `scene_manifest.test.mjs`); `lf.boat_to_tower` (now holding the illustrated crossing) still needs its decision
  recorded by the sequence pass.
- **HX40** (every selected item implemented or reported blocked; all meaningful branches inspected) — *Chapters 5–6:
  the 126 staged scenes are played on every listed branch (537)* (**B**); the four long-quest scenes in
  `src/content/lq` are **reported, not implemented** (ownership). Branch selection per scene is a reading judgement
  (**R**): choice picks, each companion where lines branch by companion, and the flags, quest stages, items and seen
  scenes that change what is said.
- **HX45** (personal questlines, long questlines, endings, The Pages We Keep; direction throughout) — *advanced for
  Chapters 5–6*: Nao's letter for Umi (`lf.nao_umi_first`, `lf.nao_deliver`, the cameos) and Mio's start
  (`lf.mio_start`, the cameos) are staged; Ren's thread in Chapter 6 (`sa.ushio_grave`, `sa.study_*`,
  `sa.epi_ren_home`, Ren's ending) is staged around the illustrated `sa.shelf_ren`; the endings performed in the
  world (`sa.camp_descent`, `sa.kasane_walk`, the five `sa.epi_*` towns, `sa.end_comp` for each companion and alone)
  are staged. Not advanced: the long quests (`lq.*`, another worker's files) and the Pages (`end.<comp>.*`,
  `pages.*`).

## Findings, remaining, not verified

- **The world, not this pass** (reported, not changed):
  - `lf.water_returns`: with staging off the scene leaves you standing on the row that floods again (the scene has no
    move; the flood props then block the tile you stand on). Staged, you step back north out of it — to a fixed tile
    (10,9), with your companion at (11,8): from another column of the trigger row that walk is longer.
  - `sa.kasane_meet`: the scene's `!move pc up 4` does not bring a scene-owned companion along, and nothing walks
    them back afterwards (five tiles behind you); staged, your companion now walks up behind you first.
  - Walk-ins: in the small council room (`lf.yae_after`) four townspeople walk in near you; with your companion behind
    you the last walker had no way round and was forced through after waiting (the world's fallback). Staged, your
    companion steps up beside you first and all four find room. In `lf.mio_start`, Hayato walked out of the Records
    Hall door you stood in front of; staged, you now walk down to the avenue first (the narration). Approaching
    these scenes from another side gives the walk-ins another geometry (not tested).
  - `sa.epi_lf` (the Lanternfall epilogue, you at (2,17) by the west gate): in all six branches one walker is forced
    through after waiting — Kasane walking in (or Tae, in the branch where Kasane stayed) passes through Yae at (3,17),
    having no way round her. Recorded by the runner as the world's fallback, not a failure; the scene has no
    `!walkto`, the walk-ins are the world's. A staged step-in for you (`!walkto pc 6 17`, then
    `3 17`) was tried and reverted: the world's path search avoids the town's trigger column (x = 2) whatever its
    condition, so your companion took a long detour. Left for the world's walk-in placement.
  - The epilogue: people who live far across a hub map speak from where they stand (in `sa.epi_co` Hiro is 22 tiles
    from you, off screen); they are not cued.
- **Viewpoint**: at counters (the ferry office, the Records Hall, the clerks' office) you and your companion face up
  at someone behind the counter, so your faces are not seen; Nao's envelope across the ferry counter reads from
  behind (sheet `ch5_lf.nao_deliver.png`). The two moments where it mattered most were moved side-on (Ushio's grave,
  the bridge at the end).
- **Not played here**: `sa.memories_enter` with Ren (it calls `sa.shelf_ren`, the illustrated insert) and the
  `sa.after_battle` branch with Kasane's folio already in hand (it calls `sa.toya_read`, illustrated) are left to
  the sequence pass's tests; the Ren cases of the other scenes are played. The stand-in challenges return success
  but apply no rewards, so the world change after a challenge (the catalogue clerk becoming Tsuzuri on the map) is
  not exercised; in `sa.clerk_name` the cues on Tsuzuri's lines address `sa_clerk`, the actor the world keeps
  until the map is entered again.
- **Not staged (ownership)**: `lq.kayo_idle`, `lq.kayo_idle_after`, `lq.road_kayo`, `lq.road_kayo_certainly`
  (`src/content/lq`), decided Performed by reading with the direction they need in the reason.
- **Not verified**: how the scenes look at play speed to a person (**H**); the frame sheets are single frames from
  the headless browser at 960×640 (the motion of a gesture is not captured); real devices, Firefox and Safari; the
  owner's view on the restraint of the short scenes listed under "Outcome". (The Chapter 3–4 pass changed no `talk`
  list, so nothing in `10_cast.js` needed a union at the merge.)

## Evidence

Frame sheets (four frames each, staged, normal motion, 960×640 headless Chromium, cropped round the people near
you; `node tests/e2e/staging_ch56_sheets.mjs`; made on this pass's branch before the merge, not retaken after it) in
`docs/screenshots/staging/ch5_ch6/`:

- `ch5_lf.tokuji_story_nao.png` — you hold out the minutes and Tokuji leans in; his head down at the water coming;
  the messenger's bell passes from his hand to yours; you raise it and ring it towards the tower.
- `ch5_lf.nao_deliver.png` — Nao at the ferry counter asking Umi (you beside them); the envelope handed over;
  Umi reading it; Umi handing her one-line reply to Nao.
- `ch5_lf.yae_after_mio.png` — Tami calls "Order!" with you and Mio beside her table; Tadashi's flat hand for "I am
  unable to comply" among the townspeople who walked in; Tami's celebration at one for, one against; Tami holds out
  the minutes for Kasane.
- `ch6_sa.ushio_grave_ren.png` — you bend to the carved letters; Ren beside the stone, head down; Ren kneeling with
  the lamp set down, polishing it; Ren standing, turned to you: "Let's go."
- `ch6_sa.end_comp_suzu.png` — at the bridge, Suzu beside you closes her account book; points to you (the lead of
  her play); holds out the faded ribbon; ties it on (the handover), side-on.

## Decisions and staging, scene by scene

"branches run": the variants played in the browser (each `· comp` is one companion). "read; not run": decided by
reading, not staged in this pass. The full reason of each decision is in `tools/scene_curated_ch56.mjs` and
`SCENES.md`; the full direction is the scene's `# Staged:` note.

#### Chapter 5 (72)

| scene | decision | what is staged / reason | branches run |
|---|---|---|---|
| `lf.after_town` | Performed (C), staged | coming into town you look up the avenue at the voices; the townspeople who walk up shouting their "no"s carry their own lines, and on the narration everyone starts a little at their own voice (Masaru, Kinu and Setsu a small start, … | 4 (nao; mio; ren; suzu) |
| `lf.akari_hint` | Performed (C), staged | Akari's guarded hand as she owns up to the recopying; she looks away and back over what the original said; as she tells you not to go down she holds out the brass key; your companion reads the gap between her words and her hands … | 5 (the letters heard · nao; the letters heard · mio; the letters heard · ren; the letters heard · suzu; first the letters) |
| `lf.akari_letter` | Performed (C), staged | after the bell Akari tells you of her refusal with an open hand and looks up towards Snowbell; shy of the address that kept coming back, she looks away before she asks (her stronger reaction, avert); once it holds, her open thanks … | 4 (the reply had · he goes · nao; both · mio; he stays · ren; no reply · suzu) |
| `lf.akari_letters` | Performed (C), staged | you notice the snow-coloured scarf folded on her desk and turn back to her; Akari's small start at her father's name (or a look up towards the mountain where he watches the stars); her head goes down over the letters that come … | 6 (after Snowbell · nao; after Snowbell · mio; after Snowbell · ren; after Snowbell · suzu; before Snowbell; with Hoshino's letter) |
| `lf.akari_post` | Performed (C), staged | back from her leave, Akari holds up this week's letter from her father, the argument about lamp oil. | 2 (he went; he stayed) |
| `lf.akari_reply` | Performed (C), staged | you hold out Hoshino's letter; Akari's small start, and she leans in to the blank address line; once you have written it, the envelope passes from your hand to hers and she reads it; she holds it in both hands at "Keep warm when … | 4 (he goes · nao; both · mio; he stays · ren; he stays · suzu) |
| `lf.arrive` | Performed (C), staged | where the road comes out of the pines you look down the valley, and shade your eyes at the tower out in the lake; your companion's first look at the town in their own way (Nao points it out and settles the satchel strap over the … | 4 (nao; mio; ren; suzu) |
| `lf.bench_canal` | Performed (C), staged | in the little park you listen towards the canal, where the water sounds like water; your companion's own answer (Nao stretches a tired head, Mio breathes out at the sound, Ren opens a hand to the canal, Suzu hums). | 4 (nao; mio; ren; suzu) |
| `lf.board` | Performed (C), staged | you lean in to the council noticeboard and look from item one to item two; your companion's own answer (Nao's shrug, Mio's guarded hand, Ren's two hands for round and square, Suzu's laugh). After the bell: you lean in to the board … | 5 (before the bell · nao; before the bell · mio; before the bell · ren; before the bell · suzu; after the bell) |
| `lf.boat_to_tower` | not in this pass (the crossing illustrated by another worker, `ch5.boat`; no decision recorded) | — | — |
| `lf.boss_intro` | Performed (C), staged | you start as the water before the bell heaves up; your companion faces the keeper in their own way (Nao points to it, one move at a time; Mio's guarded hand; Ren holds the lamp forward; Suzu points it out). After the battle: you … | 4 (nao; mio; ren; suzu) |
| `lf.conduit` | Performed (C), staged | you look over the thick pipe, put your ear to it (the narration), and bend to the brass tag at its joint; your companion's own answer (Nao's flat hand of anger at the delivery route, Mio's guarded hand, Ren looks up along the … | 5 (first · nao; first · mio; first · ren; first · suzu; again) |
| `lf.east_door` | Performed (C), staged | you look over the handle of the east door and haul on it, open or shut; once the room has drained, you haul it shut and the bar drops; your companion's own answer (Nao's nod, Mio points to the stairs, Ren counts condition, timing, … | 9 (open it; leave it shut; shut it again; drained · seal it · nao; drained · seal it · mio; drained · seal it · ren; drained · seal it · suzu; drained · leave it open; barred) |
| `lf.fence_talk` | Performed (C), staged | Kōhei and Kinu, either side of the fence, talk across it: he points out his neighbour, they point to the persimmon in turn and nod each other an "of course"; you lean in to the row of pulled-up post holes; Kōhei's tired shrug, … | 16 (first · nao; first · mio; first · ren; first · suzu; after the bell; looking · before the bell; looking · after the bell; the record · nao; the record · mio; the record · ren; the record · suzu; the record · again; settled after the bell · nao; settled after the bell · mio; settled after the bell · ren; settled after the bell · suzu) |
| `lf.hayato` | Performed (C), staged | Hayato's nod, and he holds out the form with his worried question; his head goes down at a form nobody can read; your companion's own answer (Nao and Ren lean in to the form, Mio's hand to her chin, Suzu counts the five writers). … | 5 (before the bell · nao; before the bell · mio; before the bell · ren; before the bell · suzu; after the bell) |
| `lf.junction` | Performed (C), staged | you look over the pipes gathering into one, listen to the voices inside, look up the way they are carried, and lay a hand on the pipe (the narration); your companion's own answer (Nao's flat hand of anger, Mio's head goes down, … | 5 (first · nao; first · mio; first · ren; first · suzu; again) |
| `lf.kei` | Performed (C), staged | Kei peeks at you; her "No!" with a shake of the head (the one person in town who still can); a shrug at the grown-ups' "of course"; she points to the singing grate; your companion's own answer (Nao's nod, Mio bends down to her and … | 4 (nao; mio; ren; suzu) |
| `lf.low_enter` | Performed (C), staged | at the top of the drowned stair you look down the flooded walkway and stand still, feeling for the weight of the bell; your companion's own answer (Nao looks down the way, Mio looks you over in the cold, Ren tends the flickering … | 4 (nao; mio; ren; suzu) |
| `lf.masaru` | Performed (C), staged | Masaru's floury welcome with a laugh; you look him over (flour, rings under his eyes); he counts the orders off; at "Of course!" he turns back to the kneading bench (the narration); your companion's own answer (Nao looks between … | 4 (nao; mio; ren; suzu) |
| `lf.masaru_after` | Performed (C), staged | after the bell Masaru's shout of refusal is carried by his face; he laughs at the Records Hall's "fifty, then", and turns to the bench to knead the cat loaf he wants to bake. | 1 |
| `lf.masaru_post` | Performed (C), staged | Masaru counts the orders he turned down and the breads he invented; he laughs over Kasane's bread, or at how hungry refusing makes you. | 2 (Kasane tried; otherwise) |
| `lf.memorial` | Performed (C), staged | you lean in to the memorial stone, then kneel to the one shallow name left at the end of it; your companion's own answer (Nao's head goes down at "seventeen", Mio kneels to the flowers, Ren's head goes down, Suzu's lowered head, … | 5 (before the bell · nao; before the bell · mio; before the bell · ren; before the bell · suzu; the names back) |
| `lf.mid_enter` | Performed (C), staged | arriving in the gate works you look over the slowly turning gears and down at the black water; you go to the rope ladder and bend to unhook its catch (the narration), your companion coming along beside you; their own answer (Nao's … | 4 (nao; mio; ren; suzu) |
| `lf.minutes_chest` | Performed (C), staged | you kneel at the chest and, kneeling, read the old minutes bound with string; your companion leans in to the angry margins over your shoulder (Nao and Mio lean in, Ren's nod to carry it carefully, Suzu's laugh at the heckles). | 4 (nao; mio; ren; suzu) |
| `lf.mio_refuse` | not in this pass (staged earlier) | — | showcase |
| `lf.mio_start` | Performed (C), staged | Mio's personal quest begins: you walk down to the avenue with Mio (the narration) and turn to her; the townspeople walk up to her one after another and she nods to each "of course", her hands fidget at the third, and she writes … | 1 |
| `lf.mioc` | Performed (C), staged | Mio's cameo when travelling with someone else: Mio's tired nod, an open hand at three days of requests, a guarded hand when "of course" slips out; your companion's own answer (Nao looks her over, Ren's open hand, Suzu writes her a … | 3 (nao; ren; suzu) |
| `lf.mioc_after` | Performed (C), staged | Mio's cameo after the bell: Mio's small celebration at her fourteenth "no", her laugh behind her hand; your companion's own answer (Nao's nod, Ren's and Suzu's open-handed applause); she checks her bottles as she talks of going … | 3 (nao; ren; suzu) |
| `lf.nagi` | Performed (C), staged | Nagi tends the lamp in his hand as he warns you about the oil; he points to a lamp post whose shade says only "Lanternfall", turns back to you, and glances over at his daughter Kei, the one who can still say no; Ren thinks it over … | 3 (first · ren; first · mio; again) |
| `lf.nao_deliver` | Performed (C), staged | Nao's personal quest, the delivery: you step aside and Nao steps up to the counter; Umi's flat hand for "does NOT run!" (or for "A whole year late"); Nao's hand to the strap, Umi's start at her father's name; Nao looks away and … | 2 (met before; first meeting) |
| `lf.nao_umi_first` | Performed (C), staged | Nao's personal quest: you step aside and Nao steps up to the counter; Umi's open hand; at her name Nao's hand goes to the satchel strap; Umi starts at "Isamu" and holds out her hand, fingertips trembling (held); Nao speaks plainly … | 1 |
| `lf.naoc` | Performed (C), staged | Nao's cameo when travelling with someone else: Nao's nod; a point to the ferry office for Umi's letter; a look between it and you over a town that cannot say no; the hand on the satchel strap: "I'll wait"; your companion's own … | 3 (mio; ren; suzu) |
| `lf.naoc_after` | Performed (C), staged | Nao's cameo after the bell: Nao's nod; the reply held up, "I read it."; your companion's own exchange with them (Mio looks Nao over and Nao's hand goes to a lighter satchel; Ren's open thanks and Nao's smirk away; Suzu checks her … | 3 (mio; ren; suzu) |
| `lf.north_plug` | Performed (C), staged | you look over the north plug and haul it out; you look down the wet stone path to the bell chamber; your companion's own answer (Nao points out the path, Mio's nod to you, Ren's open hand to it, Suzu's open hand inviting you on). … | 10 (pulled · nao; pulled · mio; pulled · ren; pulled · suzu; too soon · nao; too soon · mio; too soon · ren; too soon · suzu; leave it; out already) |
| `lf.records_ledger` | Performed (C), staged | you hold the flood-year ledger open at the desk and read down the pages of "nothing of note"; your companion's own reaction (Nao's flat hand of anger, Mio leans in to the new paper edges, Ren's hand to the chin over the new ink, … | 5 (with the slip · nao; with the slip · mio; with the slip · ren; with the slip · suzu; no permit) |
| `lf.ritsu` | Performed (C), staged | Ritsu's hands fidget at the counter as she owns up to orders she cannot refuse; an open hand at the rainbow tea and the flying dango; Suzu's hand to the chin and Ritsu's head down at "I threw them"; her open hand asking for help. … | 4 (helped · suzu; helped · mio; another time; orders muddled) |
| `lf.ritsu_after` | Performed (C), staged | after the bell, Ritsu's small celebration at her own "no", and an open hand at the new yuzu daifuku. | 2 (help; another time) |
| `lf.ritsu_post` | Performed (C), staged | Ritsu laughs about the new line on her menu. | 1 |
| `lf.road_bench` | Performed (C), staged | you look out from the bench over the valley to the town; your companion answers in their own way (Nao points out the lamps lighting at their exact interval, Mio looks you over for sore feet, Ren counts the interval, Suzu presents … | 4 (nao; mio; ren; suzu) |
| `lf.road_lantern` | Performed (C), staged | you lean in to the blank shade at the fork; Ren leans in too, to the name that will not take a flame. Once the chapter is done: you lean in to the fine brushwork that names the Still Archive. | 3 (blank · ren; blank · nao; lit) |
| `lf.road_north_locked` | Performed (C), staged | you look up the mountain road into the mist; your companion answers it in kind (Nao points you back down to the town, Mio's guarded hand at her spinning head, Ren points to the nameless lantern at the fork, Suzu shrugs at the … | 5 (at the left of the gap · nao; at the left of the gap · mio; at the left of the gap · ren; at the left of the gap · suzu; at the right) |
| `lf.roster` | Performed (C), staged | you lean in to the duty roster, and bend close to the hurried line at its foot; your companion's own answer (Nao's nod, Mio's head goes down, Ren leans in to the record, Suzu breathes out). | 4 (nao; mio; ren; suzu) |
| `lf.setsu` | Performed (C), staged | Setsu welcomes you with an open hand; you look along the inn to the futons laid out in the corridor and back; her tired laugh at three guests to a room; she shows you the futons by the window. | 2 (rest; all right) |
| `lf.setsu_after` | Performed (C), staged | after the bell, Setsu's small celebration at the three refusals she managed this morning, and her open hand to the window spot she kept for you. | 2 (rest; another time) |
| `lf.setsu_post` | Performed (C), staged | Setsu's open hand at the rooms that are free at last; for Kasane's early morning she looks along to the corridor they wiped. | 2 (Kasane tried; Kasane the keeper) |
| `lf.shu` | Performed (C), staged | Shū wipes his brow; his two hands for round and square; your open hand for the question; holding the shears, his head goes down (the narration's sad look); Mio leans in to the over-pruned leaves. | 2 (mio; ren) |
| `lf.south_plug` | Performed (C), staged | you look over the south plug and haul it out; you look across to the north plug still holding the water. | 3 (pulled; leave it; out already) |
| `lf.stacks_enter` | Performed (C), staged | at the foot of the stairs you look along the shelves into the dark and listen for the thump of a stamp; your companion's own answer (Nao points back up the one way out, Mio's guarded hand at the bad air, Ren holds the lamp up … | 4 (nao; mio; ren; suzu) |
| `lf.tadashi` | Performed (C), staged | Tadashi greets you with a small nod and holds out the request form; you lean in to the ruled handwriting on the counter; once it is filled in he stamps it, and opens a hand to the ledger desk on your left; your companion's own … | 9 (the form · nao; the form · mio; the form · ren; the form · suzu; the slip in hand; the ledger read; the ledger read · the key had; later; after Mio refused) |
| `lf.tadashi_after` | Performed (C), staged | after the bell Tadashi breathes out over the words he had not said in thirty years, and stamps his own approval; your companion's own answer (Nao's open hand, Mio's nod, Ren tends the lamp for "relighting", Suzu counts the paper). … | 5 (first · nao; first · mio; first · ren; first · suzu; again) |
| `lf.timetable` | Performed (C), staged | you lean in to the ferry timetable and bend to the last character in its different ink; asking for the log, you turn to Umi, who brings it over from behind the counter and hands it to you; you notice the draft slip in her drawer; … | 4 (no errand; ask for the log; leave it; after the bell) |
| `lf.tokuji_early` | Performed (C), staged | Tokuji answers "yeah" and turns back to stare at the tower in the lake (the narration); your companion's own answer (Nao looks between him and you, Mio's small shake of the head, Ren looks out to the tower with him, Suzu's open … | 4 (nao; mio; ren; suzu) |
| `lf.tokuji_post` | Performed (C), staged | after the ending Tokuji looks out at the lake where Kasane stood with him, or nods at the town that can cry again. | 2 (Kasane came; the memories back) |
| `lf.tokuji_story` | Performed (C), staged | you hold out the minutes and Tokuji leans in to the handwriting; he looks over to the gate he kept that night, and his head goes down at the water coming (his stronger reaction); he turns to you, takes the messenger's small brass … | 4 (nao; mio; ren; suzu) |
| `lf.tower_arrive` | Performed (C), staged | in the belfry loft you look down at the soft, wet floorboards and listen towards the water and the whispering below; your companion's own answer (Nao points back down to the one window, Mio checks the lids of her bottles, Ren … | 4 (nao; mio; ren; suzu) |
| `lf.tower_key` | Performed (C), staged | you lean in to the open padlock and bend to the rusted key and its tag; your companion's own answer (Nao looks between the lock and you, Mio's guarded hand, Ren's hand to the chin, Suzu's lowered head). | 4 (nao; mio; ren; suzu) |
| `lf.town_intro` | Performed (C), staged | Hayato's open-handed welcome at the west gate; he holds out the form and you lean in to read it (every box already "approved"); his pleasant nod, your open hand for the question he cannot answer, and the stamp (the narration says … | 4 (nao; mio; ren; suzu) |
| `lf.tsuya` | Performed (C), staged | Tsuya looks out over the water for the three o'clock boat, thinks over the timetable with a hand to her chin and laughs it off; your companion's own answer (Nao shakes their head, Mio looks her over against the chill, Ren's open … | 10 (first · nao; first · mio; first · ren; first · suzu; waiting; told · before the bell; told · after the bell · nao; told · after the bell · mio; told · after the bell · ren; told · after the bell · suzu) |
| `lf.umi` | Performed (C), staged | Umi's open hand over the counter; her "of course" with a nod, then she bites her lip (a fidget, the narration); your companion's own answer (Nao's hand goes to the satchel strap, Mio's guarded hand, Suzu's open hand towards her). | 3 (nao; mio; suzu) |
| `lf.umi_after` | Performed (C), staged | after the bell Umi's flat hand for "does NOT run!"; she holds up her father's letter; with Nao (the letter delivered), an open hand to them for the reply, and Nao's nod. | 2 (the letter came · mio; nao delivered) |
| `lf.water_returns` | Performed (C), staged | you start as the lake pours in through the open east door; your companion makes room and you step back north out of it (with staging off the scene leaves you standing on the flooded row); you look to the silted drain; your … | 4 (nao; mio; ren; suzu) |
| `lf.waterline` | Performed (C), staged | you lean in to the water lines ringing the pillar; your companion's own answer (Nao's slow shake of the head, Mio's head goes down, Ren leans in to the notch, Suzu looks away and back). | 4 (nao; mio; ren; suzu) |
| `lf.west_plug` | Performed (C), staged | you look over the handle of the west plug and haul on it; as the room drains you look down to the stairs appearing. Stuck: you haul in vain, and look over to the plate on the north wall. | 5 (pulled; stuck · plate unread; stuck · plate read; leave it; out already) |
| `lf.wheel_lower` | Performed (C), staged | you look over the wheel of the lower gate and lean into it; as the water drains you look to the stairs down; your companion's own answer (Nao's nod, Mio points to the stairs, Ren's open hand to them, Suzu's small celebration). … | 11 (turned · nao; turned · mio; turned · ren; turned · suzu; left; stuck · plate unread; stuck · plate read · nao; stuck · plate read · mio; stuck · plate read · ren; stuck · plate read · suzu; open already) |
| `lf.wheel_upper` | Performed (C), staged | you look over the wheel of the upper gate; turning it, you lean into it as it groans shut. Already closed: you look it over. | 3 (turn it; leave it; closed already) |
| `lf.yae` | Performed (C), staged | Councillor Tami's open hand for the early finish, a hand to her chin for the old midnight sessions, a nod for "no particular problem"; her brow creases and she glances away and back (the narration); your companion's own answer … | 3 (mio; suzu; nao) |
| `lf.yae_after` | Performed (C), staged | the chair calls "Order!" with a flat hand (her line); the townspeople who walk in to argue carry their own lines; Tami waves Kinu's fence off to next week; Tadashi's glasses over the instructions with no sender, and his firm flat … | 5 (the council back · nao; the council back · mio; the council back · ren; the council back · suzu; later) |
| `lf.yae_minutes` | Performed (C), staged | you hand Tami the minutes and she reads them aloud, slowly; her head goes down at Kasane's name and comes up to tell the rest; she glances away at the quarrel in the corridor and her head goes down again at "Only Tōya didn't come … | 4 (nao; mio; ren; suzu) |
| `lq.kayo_idle` | Performed (C) | Long quest 'the nameless road' (Ch5, the gardens of Lanternfall): Kayo by her young persimmon tree says "certainly" over the name of the village she has forgotten, smiling with her eyes far away; each companion's reading of it. … | read; not run |
| `lq.kayo_idle_after` | Performed (C) | Long quest 'the nameless road' (Ch5, after the bell): Kayo can now say she is sad to have forgotten home's name; Mio's one line. A small turn in feeling (her head goes down and comes up). Decided by reading; not staged in this … | read; not run |
| `lq.road_kayo` | Performed (C) | Long quest 'the nameless road' (Ch5, after the bell): told the road is back, Kayo remembers Koharuno, owns her fear of the empty village, chooses (the height marks, or Uncle Yasu alive) and decides to go because she wants to; each … | read; not run |
| `lq.road_kayo_certainly` | Performed (C) | Long quest 'the nameless road' (Ch5, before the bell): asked to go home, Kayo says "Yes, certainly" while the shears in her hand tremble (the narration); each companion reads the empty "certainly". Decided by reading; not staged … | read; not run |

#### Chapter 6 (62)

| scene | decision | what is staged / reason | branches run |
|---|---|---|---|
| `inline.history.sa.flood_history` | Quiet by design (C) | Ch6: Kasane's fragments of the flood thirty years ago, said in the dialogue box before the ordering task (src/ui/75_activities.js history), not script lines that can carry cues; sa.after_battle around it is staged (their head goes … | read; not run |
| `sa.after_battle` | Performed (C), staged | as the Hush comes undone you lean in to the settling pages, and listen down the mountain to the sound coming back; Kasane looks at the pages, then turns to you; your companion's own exchange with them (Nao's shrug and Kasane's … | 5 (after the council · nao; after the council · mio; after the council · ren; after the council · suzu; without the message) |
| `sa.arrive` | Performed (C), staged | where the road goes quiet above Lanternfall you look up it, and lean in towards the first lantern post, whose name is fading; your companion's own answer (Nao looks between up and down and points up the road, Mio's guarded hand at … | 4 (nao; mio; ren; suzu) |
| `sa.cabinet` | Performed (C), staged | you lean in to the blank drawer labels; when the last card goes in you look to the west door as its grille lifts; the clerk's tilt; your companion's own answer (Nao's shrug, Mio glances aside at kind vagueness, Ren's open hand, … | 5 (sorted · nao; sorted · mio; sorted · ren; sorted · suzu; not yet) |
| `sa.camp_board` | Performed (C), staged | you lean in to the notes pinned to the board; your companion's own answer (Nao points to the third note, Mio breathes out at the one who went home, Ren looks up the mountain to the Archive that no longer answers, Suzu counts the … | 4 (nao; mio; ren; suzu) |
| `sa.camp_descent` | Performed (C), staged | the way down: you turn to Oyone waiting outside the hut; she looks up at the noisy birds; with Kasane coming down, Oyone looks them over and Kasane looks away and back for one cup of tea, and Oyone points them to the hut; with … | 6 (Kasane comes down · Isamu helped · nao; Kasane comes down · Isamu helped · mio; Kasane comes down · Isamu helped · ren; Kasane comes down · Isamu helped · suzu; Kasane stays · Isamu waiting; Isamu never met) |
| `sa.camp_first` | Performed (C), staged | your companion steps off the path beside you; you look over to the hut with smoke rising and lean in to the one lantern burning brightly; your companion's own answer (Nao points to the fire, Mio's open hand to the hut, Ren leans … | 4 (nao; mio; ren; suzu) |
| `sa.charter_gate` | Performed (C), staged | you look at the gate of water, bend to Kasane's note beneath the plaque, and lean in to the charter on the wall; once you read it rightly you look down the plank bridge; your companion's own answer (Nao points to the charter, … | 6 (read rightly · nao; read rightly · mio; read rightly · ren; read rightly · suzu; not yet; open) |
| `sa.choose_archive` | Performed (C), staged | in the Reading Room Kasane looks between the shelves and the doors, opens a hand to the shelves (a library) and points to the doors (closing them); the clerk tilts from its desk; your companion's own answer (Nao's shrug, Mio's … | 9 (a library · nao; a library · mio; a library · ren; a library · suzu; closed · nao; closed · mio; closed · ren; closed · suzu; Tsuzuri named · library) |
| `sa.choose_kasane` | Performed (C), staged | at the gate Kasane looks down the road to Lanternfall, then back to the Archive behind them; their head goes down and stays down as they own their fear of going down (their stronger reaction); if you saw the empty shelf, your open … | 9 (go down · nao; go down · mio; go down · ren; go down · suzu; stay · nao; stay · mio; stay · ren; stay · suzu; the empty shelf seen · closed · stay) |
| `sa.choose_mem` | Performed (C), staged | among the shelves Kasane opens a hand to the memories kept there, their head goes down over the requests they read and did not answer; they point east to the conduits that could carry everything back and open a hand the other way … | 9 (return them · nao; return them · mio; return them · ren; return them · suzu; keep them · nao; keep them · mio; keep them · suzu; keep them · Ren took the face; keep them · Ren left it) |
| `sa.clerk_first` | Performed (C), staged | the Catalogue Clerk (a figure of stacked paper: only a fixed tilt and a turn of its head) tilts at you for a call number; you lean in to its blank name tag; it looks over at the white catalogue labels and turns back; your … | 4 (nao; mio; ren; suzu) |
| `sa.clerk_name` | Performed (C), staged | the clerk tilts; you hold up Ushio's notebook and it turns its attention to it; once you have read the name, you lean in to the writing appearing on its tag; Tsuzuri tilts at its own name; your companion's own answer (Nao's nod, … | 6 (met · named · nao; met · named · mio; met · named · ren; met · named · suzu; first meeting · named; not yet) |
| `sa.clerk_post` | Performed (C), staged | after the ending the clerk at the camp tilts as it says it still has no name. | 1 |
| `sa.conduit_crate` | Performed (C), staged | you bend to the crate of scraps stamped "Unprocessed" and read one; your companion's own answer (Nao's shake of the head, Mio's laugh behind her hand, Ren's head goes down, Suzu's two hands for the mountain of bills). | 4 (nao; mio; ren; suzu) |
| `sa.conduits_enter` | Performed (C), staged | your companion steps off the stairfoot beside you; you look over to the basin where the faint characters sink, and listen to water that makes no sound; your companion's own answer (Nao points to the end of the delivery route, … | 4 (nao; mio; ren; suzu) |
| `sa.end_comp` | Performed (C), staged | the companion's ending at the bridge; no item is given, the handovers are staging only; your companion steps to your side and you turn to them, so the hands read side-on: alone, you listen to the river. Nao bends to set down the … | 6 (nao; mio; ren · took the face; ren · left it; suzu; alone) |
| `sa.epi_co` | Performed (C), staged | Cinder Orchard: you look across the terraces at the sound of scything, and listen at dusk for Gorō's bell; with Suzu, her head goes down and she nods to Hiro; otherwise the companions answer (Nao looks out over the terraces, Mio … | 4 (suzu; nao; mio · the seat named; ren · no bell yet) |
| `sa.epi_lf` | Performed (C), staged | the denouement in Lanternfall: you look up the noisy avenue and listen to the haggling; the townspeople who come up to you carry their own lines as they arrive; Tami laughs at three days of council; Tae puts a hand to her ear for … | 6 (Kasane came down · Mio; Kasane stayed · Nao delivered; Nao came back too soon; Nao's letter undelivered; Ren; Suzu) |
| `sa.epi_ren_home` | Performed (C), staged | Ren not travelling with you: your open hand as you tell Ren of the stone; their head goes down, and they tend the lamp they will keep lit at the grave; carrying the folio, you hand it over and Ren reads the label in their … | 4 (the folio carried; told of the folio; the grave only; no news) |
| `sa.epi_rw` | Performed (C), staged | Reedwake: you look out to the bridge that reaches the far bank; Hana, coming up with the tea, holds out a cup; Tsuru points you to the Lantern Hall. | 3 (mio; ren; nao · Ren at home) |
| `sa.epi_sb` | Performed (C), staged | Snowbell: you look up the hamlet to the observatory, shading your eyes at the lamp lit in daylight; Hoshino looks up to it, or Kanta's nod for the lamp he keeps lit; you look up to where the Archive's light was; your companion's … | 5 (the lamp lit early · Ren took the face; Hoshino went down · Ren left it; nao; mio; suzu) |
| `sa.epi_sg` | Performed (C), staged | Saltglass: you look down over the harbour; Wataru breathes out (he sleeps at night now); Isamu's hand to his ear for the laugh that rubbed off; Nao, not travelling with you, holds up the bundle of letters; your companion's own … | 4 (Isamu helped · mio; nao; ren; suzu) |
| `sa.gate_first` | Performed (C), staged | at the top of the steps you look up at the paper-white Archive, listen for the sound that does not come, and look between the two channels where black water runs uphill; your companion's own answer (Nao glances away, Mio points to … | 4 (nao; mio; ren; suzu) |
| `sa.heart_enter` | Performed (C), staged | you look up over the paper floor and lean in towards the slow spiral at its centre; your companion's own answer (Nao points back to the one exit, Mio's hand to her aching ear, Ren holds the lamp up high, Suzu's showman's hands for … | 4 (nao; mio; ren; suzu) |
| `sa.heart_kasane` | Performed (C), staged | Kasane's nod and an open hand: have you read enough? Their head goes down over deciding for everyone (or they look away, then down, over Tōya's four words); as the spiral quickens you look to it and Kasane turns to it and starts … | 7 (you are wrong · nao; you are wrong · mio; you are wrong · ren; you are wrong · suzu; Tōya's note; again · go; again · wait) |
| `sa.hut_register_signed` | Performed (C), staged | you write your name in the register at the table; your companion signs too (Nao, Mio and Suzu write theirs; Ren leans in to the register and finds Ushio's name with no date coming down). | 4 (nao; mio; ren; suzu) |
| `sa.isamu_first` | Performed (C), staged | you look at the sunburnt man by the fire; Isamu (sitting) looks up the slope to the Archive, puts a hand to his ear for his wife's laugh, his head goes down, and he rubs his cold hands over three days of waiting; your companion's … | 4 (nao; mio; ren; suzu) |
| `sa.isamu_return` | not in this pass (staged earlier) | — | showcase |
| `sa.kasane_meet` | Performed (C), staged | the Archive is still; little moves: you walk in, your companion behind you, and look up the room to the one standing beyond the desks; Kasane's open hand of welcome and a nod for "I keep this archive"; each companion meets them in … | 5 (without being asked? · nao; without being asked? · mio; without being asked? · ren; without being asked? · suzu; why arguments?) |
| `sa.kasane_post` | Performed (C), staged | after the ending Kasane's open hand of welcome for today's objection; they look over to the readers' shelves or to the shut doors; they hold up one of the week's letters, and nod at being asked to tell it again. | 3 (at the shut gate · another time; at the shut gate · tell it; in the library) |
| `sa.kasane_walk` | Performed (C), staged | Kasane looks down the slope they will walk for the first time in thirty years; with Mio, her laugh. | 2 (mio; nao) |
| `sa.lantern1` | Performed (C), staged | you lean in to the pale writing on the dark lantern, and closer to the watered-down ink; your companion's own answer (Ren holds the lamp to it, Nao looks on up the road, Mio leans in to the layered strokes, Suzu's shrug). | 4 (nao; mio; ren; suzu) |
| `sa.lantern2` | Performed (C), staged | you lean in to the shade with parts of its writing missing; Suzu looks away from the actor who has dried, Ren opens a hand to the lantern. | 3 (suzu; ren; nao) |
| `sa.lantern3` | Performed (C), staged | you lean in to the shade that only says "This road…"; Mio's guarded hand, Nao's shake of the head. | 3 (mio; nao; ren) |
| `sa.lantern4` | Performed (C), staged | you lean in to the shade wiped white; your companion's own answer (Nao leans in to the old post, Mio's guarded hand, Ren's head goes down, Suzu shakes her head at what someone erased). | 4 (nao; mio; ren; suzu) |
| `sa.mem_requests` | Performed (C), staged | you lean in to the drawers full of return requests and read the one on top; your companion's own answer (Nao's flat hand of anger, Mio's and Ren's shake of the head, Suzu points to the drawer of standing claims). | 4 (nao; mio; ren; suzu) |
| `sa.memories_enter` | Performed (C), staged | you look along the held-breath room, lean in to the nearest shelf of folios, and look over to the one labelled differently at the back on the left; your companion's own answer (Nao looks along the room, Mio's head goes down, … | 3 (nao; mio; suzu) |
| `sa.notice_desk` | Performed (C), staged | you lean in to the water-stained notice and bend to read it, then hold it; your companion's own answer (Nao's shake of the head, Mio leans in to the notice in your hands, Ren's hand to the chin, Suzu's shake of the head). Taken … | 5 (found · nao; found · mio; found · ren; found · suzu; taken) |
| `sa.oyone_first` | Performed (C), staged | Oyone points you to the fire; a hand to her chin for the thin clerk who couldn't sleep, her head down at burdens going up by themselves; your companion's own answer (Nao's smirk away; Mio looks at her inky hands and Oyone nods; … | 4 (nao; mio; ren; suzu) |
| `sa.oyone_inn` | Performed (C), staged | staying, Oyone tends the stove fire and in the morning looks you over; otherwise her nod. | 2 (rest; not now) |
| `sa.oyone_post` | Performed (C), staged | after the ending Oyone points you to the register (up and down, both), and nods over Kasane's letters. | 2 (Kasane in Lanternfall; Kasane kept the Archive) |
| `sa.reading_desk` | Performed (C), staged | you lean in to the open ledger and bend to the day's accessions; your companion's own answer (Suzu's shake of the head at the honest count, Nao's nod, Mio's shake of the head, Ren's head goes down for twelve roads). | 4 (nao; mio; ren; suzu) |
| `sa.road_bundle` | Performed (C), staged | you bend to the box of new sandals and its tag; your companion's own answer (Nao's nod, Mio kneels to leave ointment, Ren glances away from their boots, Suzu's laugh). | 4 (nao; mio; ren; suzu) |
| `sa.road_marker` | Performed (C), staged | you lean in to the mossy waymarker and bend to its carving; your companion's own answer (Nao's hand on the satchel strap, Mio glances aside, Ren leans in to the keepers' carving, Suzu checks her account book for the receipt). | 4 (nao; mio; ren; suzu) |
| `sa.shelf_empty` | Performed (C), staged | you lean in to the empty shelf and bend to Kasane's label; your companion's own answer (Nao's flat hand of anger, Mio's guarded hand, Ren's and Suzu's shake of the head). | 4 (nao; mio; ren; suzu) |
| `sa.shelf_grief2` | Performed (C), staged | you lean in to the folio of the shop sign and bend to the one beside it; Suzu laughs at "overslept", Nao shrugs. | 2 (suzu; nao) |
| `sa.shelf_isamu` | Performed (C), staged | you lean in to the Saltglass shelf and, once you find Isamu's folio, read the request on its spine; your companion's own answer (Nao points down the mountain to the hut, Mio checks the cloths she will need, Ren's nod, Suzu writes … | 8 (found · nao; found · mio; found · ren; found · suzu; not found; no errand; carrying it; returned) |
| `sa.shelf_kasane` | Performed (C), staged | you open Kasane's first folio and read it while the voices from the rain and the stone corridor are heard (nobody seen); your companion's own answer (Nao looks away, Mio's head goes down, Ren's hand to the chin, Suzu looks away … | 6 (opened · nao; opened · mio; opened · ren; opened · suzu; asked for; taken) |
| `sa.shelf_returned_co` | Performed (C), staged | you lean in to the Cinder Orchard folio (still on the shelf, or returned); returned, Suzu's head goes down over Hiro's mother. | 2 (still there; returned) |
| `sa.shelf_returned_lf` | Performed (C), staged | you lean in to the shelf of Lanternfall's "no", returned by the sound of a bell; Mio's laugh, Nao's nod. | 2 (mio; nao) |
| `sa.shelf_returned_rw` | Performed (C), staged | you lean in to the empty shelf stamped "Returned"; Mio's nod, Nao points to the stamp. | 2 (mio; nao) |
| `sa.shelf_tae` | Performed (C), staged | you lean in to Tae's folio and read the slip tucked in its cover; your companion's own answer (Nao's hand to the chin, Mio's guarded hand, Ren's head goes down, Suzu looks away). Taken: you lean in to the empty folio. | 5 (the slip · nao; the slip · mio; the slip · ren; the slip · suzu; taken) |
| `sa.shortcut_open` | Performed (C), staged | you look over the bolted west door and draw the bolt; Nao's nod at one more exit, Ren glances away. | 2 (nao; ren) |
| `sa.stacks_enter` | Performed (C), staged | you look along the stone shelves of name slips and lean in to the nearest; your companion's own answer (Nao looks along them, Mio's guarded hand, Ren points left, Suzu's open hand to the costume store). | 4 (nao; mio; ren; suzu) |
| `sa.stacks_gate` | Performed (C), staged | you lean in to the lock plate on the grille; when it lifts you look down the stairs; your companion's own answer (Nao's nod, Mio checks her bottles, Ren's open hand, Suzu's laugh). Without the slip: you look over to the desk by … | 7 (read the slip · nao; read the slip · mio; read the slip · ren; read the slip · suzu; no slip yet; not yet; open) |
| `sa.study_cups` | Performed (C), staged | you lean in to the two teacups and bend to the name at the bottom of the dusty one; your companion's own answer (Mio's head goes down, Nao looks between the cups and you, Ren leans in to the chipped rim, Suzu's head goes down). | 4 (nao; mio; ren; suzu) |
| `sa.study_desk` | Performed (C), staged | you bend to the slip under the paperweight, then hold it and read the form on its back; your companion's own answer (Nao points to the slip in your hand, Mio leans in to its worn corners, Ren's hand to the chin, Suzu's open hand). … | 5 (the slip · nao; the slip · mio; the slip · ren; the slip · suzu; taken) |
| `sa.study_enter` | Performed (C), staged | you look over to the one old keeper's lamp burning and lean in to the slip on the desk; your companion's own answer (Ren turns to their teacher's lamp and stays turned, Nao points to the stair up, Mio leans in to the two teacups, … | 4 (nao; mio; ren; suzu) |
| `sa.study_notebook` | Performed (C), staged | you bend to the battered notebook and read it; with Ren, they trim their lamp's wick the way it is written; otherwise you look to the west door, the short way to the Reading Room. Taken: you lean in to the gap in the dust. | 4 (no errand; for the clerk · Ren; for the clerk · Mio; taken) |
| `sa.study_objections` | Performed (C), staged | you lean in to the boxes of objections and read the ones you draw out; your companion's own answer (Nao's hand to the satchel of kept labels, Mio's laugh at the weak tea, Ren's head goes down over their teacher's hand, Suzu looks … | 4 (nao; mio; ren; suzu) |
| `sa.ushio_grave` | Performed (C), staged | you lean in to the small stone and bend to its careful letters; your companion's own answer (Nao looks between the stone and you, Mio's and Suzu's heads go down). With Ren: you stand before the stone and Ren comes to its side … | 5 (without Ren · nao; without Ren · mio; without Ren · suzu; Ren; seen before) |

