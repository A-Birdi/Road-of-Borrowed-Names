# Staging pass — Chapters 3 and 4 (§16 whole-game coverage)

Records what this pass changed, what was run and what was observed. Categories as in VALIDATION.md:
**B** = real browser test (Playwright/Chromium, the built `index.html`), **U** = node unit/content test,
**R** = code review/static inspection only, **H** = still needs a human.

Scope: the scenes of Chapter 3 (Kaedemura, 84) and Chapter 4 (Snowbell, 50) that `docs/expressive/SCENES.md`
drafted as "Performed overworld" by heuristic `(H)`, done the way the Chapter 1–2 pass did them
(`staging_ch1_ch2.md`). Not in this pass: the scenes being illustrated by another worker (`co.festival_begin`,
`sb.quiet_morning`; `co.assembly`, `sb.lamp_name`, `sb.lamp_reply` and `sb.next_day_inn` are not among the
drafts but were left untouched too), the three already staged (`co.suzu_night`, `co.hiro_first`, `sb.yae`), and
the other worker's files (`src/content/lq`, `cases`, `pages`, `pets`). This is direction only: no line, branch,
quest step, item or outcome was added, removed or reworded (with staging off, every scene's first branch ends in
exactly the state the staged run ends in; below). One NPC placement was moved by one tile (Sōsuke in the
evening square; below).

## Outcome

All 134 entries were reviewed by reading. The 113 in `src/content/ch3/**` and `src/content/ch4/**` are now
decided `(C)` (in `tools/scene_curated_ch34.mjs`, merged into the manifest's `CURATED` like the Chapter 1–2
file; `SCENES.md` and `scenes.json` regenerated: 1,392 entries, 268 decided).

| | Ch3 | Ch4 | total |
|---|---|---|---|
| drafted "Performed overworld (H)" | 84 | 50 | 134 |
| **staged** (Performed, decided) and played branch by branch in the browser | 71 | 42 | **113** (108 cases, 481 branches) |
| Quiet by design (decided) | 0 | 0 | 0 |
| left to their owner (`lq`, `cases`, `pets`: another worker's files; a proposal each in the table) | 10 | 6 | 16 |
| not in this pass (being illustrated: 2; staged earlier: 3) | 3 | 2 | 5 |

Every draft in the two chapter folders was performed: each one has a person speaking to you, a thing you look
at or hand over, or a companion answering, so none was decided quiet. The smallest (a signpost, a locked door,
the goat's note) got the smallest direction — one look or one lean, and the companion's one answer. The 16 drafts
outside the folders are not decided here; each has a proposal in the table (two of them, the pet "notice"
remarks, proposed quiet).

## What was added

- **Direction in the scene files** (`src/content/ch3/40–46_*.js`, `src/content/ch4/30–35_*.js`): `!gesture`,
  `!look`, `!pose`, `!prop`, `!walkto`, `!ambience` cues on the lines they belong to, and a `# Staged:` note at
  the top of each staged scene saying what it shows. The rules of the Chapter 1–2 pass: the speaker carries the
  line; at most one listener answers, smaller; an attention change is a turn to the thing and back (`!look … pc`
  where the scene goes on after a turning gesture); the player is neutral unless the line is theirs or says what
  they do; no cue stacked on a cue for the same person and line. Where lines branch by companion (`?(comp=…)`),
  each companion answers in their own vocabulary (Nao: the glance at the exit, the satchel strap, the open hand;
  Mio: a hand to the chin, guarded hands, bending to look; Ren: the glasses, the lamp's wick, measuring with both
  hands; Suzu: the laugh, the shrug, the account book, the head going down when it is not a joke). Escalation
  stays in character: one larger gesture at the turn of a scene (Yae's celebration on the evening the lamp is
  lit, Kotarō's bounce, the children's verdict on the snow sculptures), not on every line.
  Figures' limits were kept: Fuki carries a cane, so her two-handed `rubhands` in `sb.fuki` (found by the
  runner's fit check) became a look up towards the bell; glasses gestures only for wearers (Tokiwa, Sōsuke,
  Hoshino, Ren); the goats (custom figures) only the attention gestures their look allows.
- **Authored positions** (`!walkto`), each chosen on the map (free, reachable, not furniture) and checked in
  every branch:
  - the player steps to the other person's side so a handover reads side-on: the page to Tokiwa
    (`co.tokiwa_page`, 6,5), the bell rope to Gorō (`co.bell_ring`, 13,13), Hiro's earrings (`co.hiro_after`,
    24,19), Ume's hairpin (`co.ume`, `co.ume_after`, 15,23), the letters to Hoshino (`sb.hoshino`, 5,4) and his
    observatory key (`sb.morning_hoshino`, 7,8);
  - in Hiro's workshop with Suzu (`co.suzu_ask`, Suzu branch) the two of you step to the door (6,8 and 5,8) for
    "Suzu looks back just once" and her decision;
  - Tokiwa comes to the reading table to look at the records with you (`co.hall_reading`, 8,6) and to the foot of
    the lookout when the bell rings (`co.bell_ring`, 17,14); he walks back to his place after each (checked);
  - the quiet night (`sb.quiet_nao/mio/ren/suzu`): you and your companion go to the foot of your futons (4,4 and
    2,4) and sit up there, turned to each other, under the night ambience; the ambience is ended with the
    conversation, before the morning's fade; the sitting poses last into the morning and are released when the
    night's outer scene (`sb.quiet_begin`) ends;
  - at ten doorways where the follow rule puts the companion on your own tile (`co.village_first`,
    `co.upper_enter`, `co.ice_enter`, `co.kiln_enter`, `co.reflection`, `sb.hamlet_first`, `sb.path_enter`,
    `sb.hall_enter`, `sb.gallery_enter`, `sb.dome_enter`) the companion steps off beside you before it is given
    anything to do.
- **One NPC placement** (`src/content/ch4/20_maps.js`, the evening square): Sōsuke stood at 27,19, right behind
  the well, whose roof drew over him — in `sb.eve_start` he turns and holds up the envelopes with their addresses
  back, and none of it showed (seen on the frame sheet). He now stands beside the well (26,19), still facing the
  mountain with the others. Nothing else of the map changed. The geometry record
  (`tests/fixtures/overworld_geometry_982c8df.json`) was re-recorded for this deliberate change: one line, only
  `sb.hamlet`'s NPC-places hash differs.
- **Nine held props**, in a new file (`src/engine/32h_props_ch34.js`, same contract as `32h_props_ch12.js`;
  drawing only, `!give`/`!take` unchanged, no letters drawn): `globe` (Tomoe's lantern globe, `co.core_lantern`),
  `key` (Tamotsu's fence key, Hoshino's observatory key), `beads` (Hiro's earrings), `hoshigaki` (Fusa's dried
  persimmons), `leafpin` (Ume's hairpin), `strawhat` (Asa's hat), `tin` (Nao's tin of old address labels in the
  quiet night), `goatbell` (Tetsuji's spare bell), `cord` (Fuki's braided bell cord). No new gesture was needed.
- **Profiles**: no change to `src/content/10_cast.js`. Where the continuity check (`conversation_continuity`)
  found a gesture outside a person's profile, the cue was changed to one in the profile (the goat's glance →
  `stiff`; Heita's look along the strip → `point`; Hiro's breath out → `stretch`, which is his line; Sōsuke's
  head shake → `glasses`), except two that the text itself performs, recorded as escalations in the test's
  `KNOWN` list with the line that motivates them:
  - `co.isao | co_isao | palm` — narrated: "Isao opens his right hand and looks at the palm. An old burn scar
    puckers white across it."
  - `sb.hall_enter | mio | rubhands` — her line: "Stay too long and you'll damage your fingers. Rub your hands
    together. Like this." (she shows you how).
- **Minimal fixes outside the scene files**:
  - `src/content/practice_b/30_compare.js`: the cue lines added before four quoted lines moved them to later
    command indices (C04 `co.sayo_seats` 3→8, C05 `co.bell_ring` 13→25, C06 `co.tokiwa_confront` 4→10, C09
    `co.fusa_first` 2→5); the quotations name the indices the unchanged lines are at now. An existing save keeps
    its sightings (`79_compare.js` already matches a moved line by scene and hash). The Kansai dialect lines are
    keyed by their Japanese text and are unaffected.
  - `tools/scene_manifest.mjs`: imports `CURATED_CH34` / `CURATED_INLINE_CH34` (no inline entries in these
    chapters) the same way as the Chapter 1–2 decisions; `sb.eve_start`'s decision supersedes the earlier one
    (it was decided before but not staged).
- **Tests**: `tests/e2e/staging_ch34_cases.mjs` (108 fixtures, 481 branches) and `--ch=3`, `--ch=4` in
  `tests/e2e/staging_chapters.mjs`; three fixture additions to `tests/e2e/staging_runner.mjs` (below).

## How a scene is checked

The runner and its per-branch and per-scene checks are those of the Chapter 1–2 pass (`staging_ch1_ch2.md`,
"How a scene is checked"): every branch played to its end; every cue names somebody present and fits the
figure; every `!walkto` reached; at every animation frame nobody shares a tile (the world's walkers included) and
nobody stands on furniture; no idle life during the scene; afterwards everyone at their place and the companion
beside you; the expected gestures cued; per scene, reduced motion gives the same gestures in the same order and
the same end state, and staging off gives exactly the same end state. No assertion was changed or loosened.

Three additions to how a fixture sets up the moment (`tests/e2e/staging_runner.mjs`), each because a case
otherwise started from a moment the game cannot produce:

1. `seen`: scenes already seen (a person's first meeting, a prop already looked at), for scenes whose lines
   depend on `seen.*`.
2. Everyone starts at their place: the world keeps the figures of the map you are on between runs on one page,
   so a person a previous branch moved (a story placement, a wander step) was still there when the next branch
   began on the same map (seen with Rokuta, Hayate, Natsume and Hoshino). The fixture now puts every NPC at their
   map place before the scene, as entering the map does.
3. `compAt`: where the follow rule really leaves your companion when you walk up to someone from the side (at
   Tetsuji's pen and at the goat's note the place behind you is blocked, so the companion is on the tile you came
   from). Used by two cases.

Because (2) changes every case's starting moment, the Chapter 1 and 2 cases were rerun with it (below).

## Validation log

Run on the shared 4-core box (other workers' browser tests running at the same time), headless Chromium via
the installed Playwright, on the built `index.html`, browser test files one at a time.

- **U** `node tools/validate.mjs` — no errors; 15 warnings, none from this pass's files (13 lexicon conflicts
  between the chapters' word lists, and the exits of `co.oldworks` and `sb.obs_path` unreachable from the default
  spawn — maps this pass did not change); none about a cue, a gesture or a position. While authoring, the
  validator's own staging warnings (the same gesture on adjacent lines) and errors (unknown look targets) were
  fixed in the scenes.
- **U** `node tests/run-unit.mjs conversation_continuity` — first runs failed on six gestures outside a
  person's profile (Isao's palm, the goat's glance, Heita's look along the strip, Hiro's breath out, Mio's
  `rubhands`, Sōsuke's head shake); four cues were changed to profile gestures and two recorded as narrated or
  spoken escalations (above); then **754 passed, 0 failed**. `scene_manifest` **546 passed, 0 failed**;
  `practice_b` **96 passed, 0 failed** (after re-indexing the four quotations); `actors` **180 passed,
  0 failed**. Rerun after the last source change (Sōsuke's placement, two unused props removed): the same four
  results.
- **U** `node tests/run-unit.mjs` (everything) — **25704 passed, 0 failed** during the pass. After Sōsuke's
  placement change: **25703 passed, 1 failed** — `overworld_geometry` ("NPC places … are as at the base
  commit": `sb.hamlet.npcs`), the geometry record catching exactly that deliberate change. Re-recorded as the
  test's header prescribes (`RECORD=1 node tests/run-unit.mjs overworld_geometry`); the fixture's diff is one
  line, and in it only `sb.hamlet`'s `npcs` hash changed (collision, exits, doors, triggers, spawn and props
  unchanged). Then `overworld_geometry` **3 passed, 0 failed** and the whole suite **25704 passed, 0 failed**.
  The last change after that was a comment (a `# Staged:` note's wording, `co.ume_first`: "Ume's hand", so the
  pronoun cannot be read as Nao's) and the decisions/manifest regenerated from it: `scene_manifest` **546
  passed, 0 failed**, `conversation_continuity` **754 passed, 0 failed**.
- **B** `node tests/e2e/staging_chapters.mjs --ch=3` — first full run **2231 passed, 19 failed**, all real
  findings, none timing: at the four doorways (`co.village_first`, `co.upper_enter`, `co.ice_enter`,
  `co.kiln_enter`) the companion the follow rule left on your tile was given a cue before stepping off (fixed:
  the companion steps off first); three variants that are one line by design were held to their case's minimum
  line count (`co.hall_reading` too early / cleared, `co.tokiwa_page` getting ready; the variants now name their
  own minimum of 1: fixture, not scene); and `co.isao_first` (with Mio) expected Mio's gestures under the wrong
  key (the case names a companion as `comp`).
  `co.tokiwa_post` was found unstaged while checking the table, and staged and given a case. The failing scenes
  were rerun with `--only=` and passed (**235 passed, 0 failed** for the Chapter 3 subset). Final full run
  **2267 passed, 0 failed** (801 s, 70 cases covering 71 scenes, 301 branches); on the final build again:
  **2267 passed, 0 failed** (789 s).
- **B** `node tests/e2e/staging_chapters.mjs --ch=4` — first full run **1331 passed, 19 failed**, all real
  findings, none timing: at Tetsuji's pen and the goat's note the follow rule really leaves the companion on the
  tile you came from, not on yours (the fixture now says so: `compAt`); Fuki's `rubhands` does not fit a cane
  user (changed to a look up); Rokuta, Hayate, Natsume and the evening crowd were still where an earlier branch
  on the same page had left them (the fixture now starts everyone at their place — this changed every case's
  starting moment, so Chapters 1 and 2 were rerun below); `sb.hoshino` with the bell rules known looped on a
  repeated pick of the bell question (the picks were corrected: [0,3] → [0,2]); `sb.sousuke` "later" had no
  companion in the fixture, which Chapter 4 never has (given Ren). The failing scenes were rerun with `--only=`
  and passed (**381 passed, 0 failed** for the Chapter 4 subset). Final full run, on the final build (Sōsuke
  beside the well): **1350 passed, 0 failed** (601 s, 38 cases covering 42 scenes, 180 branches).
- **B** `node tests/e2e/staging_chapters.mjs --ch=showcase` — **66 passed, 0 failed** (158 s).
- **B** `node tests/e2e/staging_chapters.mjs --ch=1` — **698 passed, 0 failed** (468 s) and `--ch=2` —
  **1623 passed, 0 failed** (710 s), with the runner's new starting moment (same totals as the Chapter 1–2 pass).
- **B** `node tests/e2e/story_ch3.mjs` — **16/16 PASS** (profiles F, E, I, A × the four companions, 36–39
  checks each; 617 s). `story_ch4.mjs` — **8/8** (profiles F and A × the four companions, Hoshino's three
  endings; 52–53 checks each, every check ok; 376 s). `side_ch3.mjs` — **3/3 PASS** (13–14 checks).
- **B** `node tests/e2e/actor_life.mjs` — **39 passed, 0 failed** (251 s); `walk_round.mjs` — **all passed**
  (16 checks, 29 s). (`actor_life.mjs` rewrites its evidence images under `docs/screenshots/actors/`; those
  rewrites were not committed: they are the other suite's evidence, not this pass's.)
- **R** the four frame sheets below were looked at (16 frames). The evening sheet showed Sōsuke hidden by the
  well's roof (fixed, sheet retaken); the quiet-night sheet showed the night ambience as only darker edges (kept;
  above).

The final round ran the ten browser files one after another: `--ch=3`, `--ch=4`, `--ch=showcase`,
`story_ch3`, `story_ch4`, `side_ch3`, `actor_life`, `walk_round`, `--ch=1`, `--ch=2` (4,049 s in all).
`--ch=3` began before the last two source changes (both Chapter 4 only: Sōsuke's placement and the two unused
props) and was rerun on the final build; every other file ran on the final build. No failure in the final round,
so nothing needed a rerun for timing.

## Contract rows advanced (docs/expressive/CONTRACT.md; boxes not ticked here)

- **HX33** (speaker primary, one smaller listener response, attention staged, the player follows the chosen
  line) — *Chapters 3–4 done for the scene folders.* Authored in the 113 scenes by these rules and reviewed by
  reading each scene (**R**); the cue order per branch is browser-checked (**B**); "primary vs smaller" and "reads
  well" are a judgement, partly visible in the frame sheets (**R**), not measured. **H**: watching the scenes at
  play speed.
- **HX35** (authored reachable positions, usable sides, no furniture or stacking, reservations, plausible end
  positions, consistent state) — *verified for the 113 scenes, every listed branch* (**B**: no shared tile or
  furniture at any frame, every `!walkto` reached, people back home and the companion beside you, the same end
  state staged/unstaged/reduced). One placement fixed (Sōsuke behind the well); the world's own placements of
  speakers who are far away are reported below, not changed.
- **HX39** (manifest 100 % classified, decided) — *Chapters 3–4: the 113 drafts in the chapter folders decided
  by reading* (**R**, generated `(C)`; **U** `scene_manifest.test.mjs` passes); the 16 drafts in the other
  worker's files are still `(H)` (proposals below).
- **HX40** (every selected item implemented or reported blocked; all meaningful branches inspected) — *Chapters
  3–4: the 113 staged scenes are played on every listed branch (481)* (**B**). Branch selection per scene is a
  reading judgement (**R**): choice picks, each companion where lines branch by companion, and the flags that
  change what is said (before/after the festival, the seal, the storm, the lamp). Combinations that only change
  narration without cues were not all enumerated.
- **HX45** (personal and long questlines, direction throughout) — *advanced for the personal threads in the
  chapter folders* (Suzu's debt to Hiro, `co.suzu_ask` → `co.suzu_c_*`; Hoshino's letter; the four quiet-night
  conversations; Ren's and Nao's answers at the evening lamp), **B** by the cases. The long quests (`lq.*`) of
  these chapters are not staged (another worker's files).

## Remaining, not verified, open questions

- **Left to their owner** — 16 drafts in `src/content/lq` (4: `lq.fare_fusa`, `lq.road_ume`,
  `lq.fare_chigusa`, `lq.chigusa_idle`), `cases` (6: `cs.parcel_marks`, `cs.view_note`, `cs.view_seat`,
  `cs.view_east`, `cs.view_west`, `cs.rosette_box`) and `pets` (6: the dog and the tanuki). Proposals are in the
  table. `cs.view_seat` calls `sb.path_bench`, which is staged here.
- **Speakers who are far away** (the world's placement; not changed): Sachi in `sb.kanta` ("Sachi appears from
  behind the children") speaks from her washing line 16 tiles away; Sayo in `co.village_first` and Kanta in
  `sb.hamlet_first` are heard before they are near; Kotarō and Sayo speak off-screen in `co.bell_ring`. Their
  cues are kept to what reads at that distance (none for an off-screen speaker). A walk-in (or a placement
  nearer) would be a world change, not direction.
- **Called scenes played but not staged here**: `sb.boss_pre`'s case plays on through `sb.boss_after` (staged),
  `sb.lamp_name` and `sb.lamp_reply` (being illustrated, unstaged) to `sb.eve_start` (staged); the quiet night's
  case plays `sb.quiet_morning` (being illustrated). The quiet night's ambience ends with each conversation
  (`!ambience -`), and `sb.quiet_morning` begins with `!fade out`: the room lightens during that fade (a few
  frames). Whoever illustrates the morning may prefer to end the ambience after the fade.
- **The quiet night is dim, not dark**: the `night_in` preset (the one `co.suzu_night` uses for the inn) over the
  small upstairs room is mostly inside the player's light pool, so the frame sheet shows only darker edges. The
  darker `night` preset was considered and not used, to keep one look for the two inn nights.
- **Hiro's glasswork** (`co.hiro_after`, `co.beam`): the pipe he works at does not show in his left-facing view;
  that is the existing art (also in the earlier `actor_workplaces` evidence), not this pass's.
- **The compare re-indexing** (`30_compare.js`) recurs whenever direction is added before a quoted line.
- **Not verified**: how the scenes look at play speed to a person (**H**); real-device performance; whole-story
  playthroughs with staging on (`pursue.mjs`) were not run for Chapters 3–4 in this pass (the scenes are covered
  case by case, and the story tests above play each chapter's main path with staging on); the frame sheets are
  single frames from headless Chromium at 960×640; the gestures' motion is not captured.

## Evidence

Frame sheets (four frames each, from 960×640 headless Chromium frames, staged, normal motion, each frame taken
once the line has shown for 0.9 s) in `docs/screenshots/staging/ch3_ch4/`:

- `ch3_co.tokiwa_page_mio.png` — cropped around you: beside Tokiwa on the hall's carpet (side-on) with the page
  from the kiln; he takes it and reads the last line; it slips from his fingers; he faces you ("the keeper of
  the record, running from his own").
- `ch3_co.suzu_ask_suzu.png` — cropped around you: in Hiro's workshop, Suzu, you and Hiro side by side; Hiro
  answers over the blowpipe while Suzu's hand goes to her ribbon; outside the workshop door, Suzu looks back
  at him once.
- `ch4_sb.quiet_nao.png` — cropped around you: the quiet night with Nao (the "sheep, laugh, my fear, one label"
  branch): sitting up at the foot of the futons; the letter never delivered; "if you forget, I'll tell you"; the
  flat tin of labels held out.
- `ch4_sb.eve_start_ren.png` — the whole screen: the square looking up at the lamp; Yae turns to celebrate;
  Sōsuke, beside the well now, turns with the envelopes; Ren's answer (taken after the placement fix; before it,
  the well's roof hid Sōsuke).

## Decisions and staging, scene by scene

"branches run": the variants played in the browser (each `· comp` is one companion). "read; not run": decided
by reading, not staged in this pass. The full reason of each decision is in `tools/scene_curated_ch34.mjs` and
`SCENES.md`; the full direction is the scene's `# Staged:` note.

#### Chapter 3 (84)

| scene | decision | what is staged / reason | branches run |
|---|---|---|---|
| `co.arrive` | Performed (C), staged | you stop where the road starts to climb and look up the terraces to the workshop smoke; your companion's own first look (Nao along the road to the one way out, Mio bends to the wilting herbs, Ren leans in to the rewritten … | 4 (nao, mio, ren, suzu) |
| `co.asa` | Performed (C), staged | Asa points to a blank signpost, shrugs at the vanished writing, points up to the top fence where Ume got lost and looks from the middle signpost to you (later she points it out again); her nod of thanks and the straw hat … | 4 (the blank signposts, on the way, the hat, firebreak path) |
| `co.ashband` | Performed (C), staged | you lean in to the black line in the soil; your companion's own answer (Nao leans in too, Mio bends to measure the depth by eye, Ren's open hand, Suzu's head goes down); once the earth holds, Nao's nod, Mio shows the size of a … | 6 (earth · nao, earth · mio, earth · ren, earth · suzu, later, seen) |
| `co.beam` | Performed (C), staged | you lean in to the charred beam; Hiro answers from his bench without stopping his work; your companion's own answer (Nao leans in, Mio's guarded hand at how deep the char runs, Ren tends their lamp's wick, Suzu looks away). | 5 (Hiro at work · nao, Hiro at work · mio, Hiro at work · ren, Hiro at work · suzu, after the festival) |
| `co.bell_ring` | Performed (C), staged | you step to Gorō's side and hand him the rope; he turns up to the lookout to tie it (the climb is narrated) and back to you rubbing his hands that know the knot; when the bell rings you look up, start at the change in the air … | 4 (nao, mio, ren, suzu) |
| `co.buckets` | Performed (C), staged | you bend to the dusty leather buckets; your companion's own answer (Nao and Mio lean in to them, Ren's hand to the chin over the erased word, Suzu looks away). | 5 (dusty · nao, dusty · mio, dusty · ren, dusty · suzu, filled) |
| `co.channel_marker` | Performed (C), staged | you lean in to the words on the channel stone; your companion's own answer (Nao points down the channel, Mio's nod, Ren measures its width with both hands, Suzu's head goes down, you turn to her, and she laughs it off). | 4 (nao, mio, ren, suzu) |
| `co.chronicle` | Performed (C), staged | you lean over the chronicle on the desk; when you tell Tokiwa the year is in another hand he turns, then his glasses go up over the page he cannot remember and he looks away (a headache, he says), and his flat hand insists the … | 8 (read · nao, read · mio, read · ren, read · suzu, later, before the suspicion, read again, after the assembly) |
| `co.core_lantern` | Performed (C), staged | you bend to the one unbroken globe and hold it up in both hands; your companion's own answer (Nao's nod, Mio holds out a cloth to wrap it, Ren leans in to the name on its base, Suzu's head goes down); later, you look at the … | 5 (the globe · nao, the globe · mio, the globe · ren, the globe · suzu, taken) |
| `co.core_page` | Performed (C), staged | you bend to the scorched page, pick it up and read it while the kiln's night speaks; then you lower it, and your companion answers in their own way (Nao's hand to the satchel strap for the heaviest delivery, Mio's head goes … | 6 (stay a while · nao, stay a while · mio, stay a while · ren, stay a while · suzu, straight back · suzu, straight back · nao) |
| `co.fest_hiro` | Performed (C), staged | Hiro stretches out his shoulders (his line says they felt light); with Suzu, he looks from the seat beside his mother's to her and she pats her account book; otherwise he points to the stage. | 2 (suzu, nao) |
| `co.fest_tokiwa` | Performed (C), staged | Tokiwa reads in the chronicle he has brought to the festival, his glasses pushed up over "this year", and a nod to you for the line you chose. | 3 (the names, for the living, Ume spoke) |
| `co.festival_begin` | not in this pass (being illustrated by another worker) | — | — |
| `co.fusa` | Performed (C), staged | Fusa's open hand for the room and her nod; her guarded hand at the festival rush, an open hand to explain the trays, her laugh at your counting, and she hands you the dried persimmons across the counter; her guarded hand at … | 6 (first meeting, rest, not now, the orders, the orders · later, before the gathering) |
| `co.fusa_first` | Performed (C), staged | Fusa's open-handed welcome, her laugh at your luck, and a look from the aired futons to you; with Mio, her laugh at the persimmon futon. | 2 (mio, nao) |
| `co.fusa_post` | Performed (C), staged | Fusa looks from the bucket and salve at the front desk to you; with Mio, she leans in to the labels; Fusa's head goes down over what she left on the mountain. | 2 (mio, nao) |
| `co.goat` | Performed (C), staged | you lean in to the old goat with its faded tassel; with Suzu, she starts back — the Director! — the goat glances at her, she laughs, and thanks it for its service with both hands. | 2 (suzu, nao) |
| `co.goro` | Performed (C), staged | Gorō's hand goes to his chin, he looks up at the ropeless bell as he remembers the night, and between the bell and you as he tells of the lanterns at the channel; he shakes his head at his own telling; once it is in order, his … | 9 (first meeting, idle, waiting for the rope, the night watch · nao, the night watch · mio, the night watch · ren, the night watch · suzu, the night watch · later, the rope up) |
| `co.goro_first` | Performed (C), staged | Gorō's nod of welcome; he looks up at the ropeless bell, then back to you rubbing his itching hands; his nod for yes, a small shake of the head for "no matter". | 2 (I'll find one, not right now) |
| `co.goro_post` | Performed (C), staged | Gorō looks up at the bell, then back to you for what came down from the mountain; a shake of the head over thanks or a scolding. | 2 (the memories returned, each chose) |
| `co.hall_reading` | Performed (C), staged | you lay the records out on the reading table and Tokiwa comes to stand at its side to look at them with you (he goes back to his place after the scene). | 7 (side by side · nao, side by side · mio, side by side · ren, side by side · suzu, later, too early, cleared) |
| `co.heita` | Performed (C), staged | Heita stretches awake, shrugs at the grass, points along the overgrown strip; your companion's own answer (Nao points along it too and he yawns his answer, Mio's laugh, Ren looks along it too, Suzu's laugh); later, his glance … | 5 (grass duty · nao, grass duty · mio, grass duty · ren, grass duty · suzu, researchers) |
| `co.heita_after` | Performed (C), staged | Heita wipes his brow, proud of the morning's cutting; his head goes down over his father's name; with Mio, her open-handed thanks. | 2 (mio, nao) |
| `co.hiro_after` | Performed (C), staged | Hiro glances to the named seat and back to you; with Suzu, he turns to her for her payment and she laughs; you step to his side and he hands you the glass-bead earrings. | 3 (with the globe · suzu, with the globe · nao, beads given) |
| `co.hiro_first` | not in this pass (staged earlier; actor_workplaces) | — | — |
| `co.ice_block` | Performed (C), staged | you kneel to the leaf sealed in the ice; your companion's own answer (Nao leans in, Mio bends to it, Ren's hand to the chin, Suzu's head goes down); when the cold becomes a word you rise, and your companion answers (Nao's nod, … | 6 (ice · nao, ice · mio, ice · ren, ice · suzu, later, seen) |
| `co.ice_enter` | Performed (C), staged | your companion steps in off the doorway beside you; your breath shows in the cold and you look over the blocks in the straw; your companion's own answer (Nao's open hand, Mio's long breath out, Ren listens with a hand to the … | 4 (nao, mio, ren, suzu) |
| `co.isao` | Performed (C), staged | Isao's hand to his chin; he opens his right hand and looks at the old burn (the narration says so); his hand to the chin again over the iron door, a glance aside at the wind, a lean towards the furnace as he names Tomoe, a … | 7 (first meeting, idle, the burn · nao, the burn · mio, the burn · ren, the burn · suzu, the burn · later) |
| `co.isao_first` | Performed (C), staged | Isao looks from Hiro at the bench to you as he introduces himself; with Mio, she leans in to his burned hand, he glances aside from it, and she shakes her head; otherwise you lean in to the scar. | 2 (with Mio, with Nao) |
| `co.kiln_enter` | Performed (C), staged | your companion steps in off the doorway beside you; you wipe your brow in the heat and look up the three chambers; your companion's own answer (Nao looks back at the only exit, Mio holds out her water bottle to you, Ren's pun … | 4 (nao, mio, ren, suzu) |
| `co.kiln_return` | Performed (C), staged | back in the village, Suzu turns to you and asks for Hiro's sake (an averted look that comes back to you, then her head goes down); when she is not with you, Shino walks up with her message and nods it delivered. | 4 (nao, mio, ren, suzu) |
| `co.kiln_seal` | Performed (C), staged | you hold your hand out to the warm glass seal; your companion's own way of saying it needs cold (Nao's shake of the head, Mio's hand to the chin, Ren's open hand, Suzu's laugh then a shrug), and you look along the row to the … | 9 (too hot · nao, too hot · mio, too hot · ren, too hot · suzu, with the ice · nao, with the ice · mio, with the ice · ren, with the ice · suzu, with the ice · later) |
| `co.kiln_wall` | Performed (C), staged | you lean in to the slots and vents in the chamber wall; with all three tiles, Ren's open hand; when the vent opens you turn to the kiln's sigh and then to the firebox glass clearing; your companion's own answer (Nao looks away … | 6 (the tiles in order · nao, the tiles in order · mio, the tiles in order · ren, the tiles in order · suzu, tiles missing, later) |
| `co.kotaro` | Performed (C), staged | Kotarō bounces as he greets you and points at the forbidden chair; your companion's own answer (Nao's shrug, Mio bends down to his height, Ren's open hand, Suzu's laugh); he points up at the lookout bell; after the bell, his … | 10 (the chair · nao, the chair · mio, the chair · ren, the chair · suzu, the bell, after the bell, thirty what · nao, thirty what · mio, thirty what · ren, thirty what · suzu) |
| `co.lookout_base` | Performed (C), staged | you look up at the ropeless bell on the lookout; your companion's own answer (Nao looks from the bell to Gorō, Mio's hand to the chin, Ren's nod, Suzu's head goes down: it rang once, all night); later you look up at it again. | 6 (the ropeless bell · nao, the ropeless bell · mio, the ropeless bell · ren, the ropeless bell · suzu, looked at before, after the festival) |
| `co.nao_cameo` | Performed (C), staged | Nao (on the road with the post) nods hello and settles the satchel strap over the heavy letters; your companion's own exchange with them (Mio leans in to their boots and Nao shrugs, Ren asks the way and Nao points to the door, … | 3 (mio, ren, suzu) |
| `co.nobu` | Performed (C), staged | Nobu points to the thirty flasks, his arms fold over the order, he shows how long "long things" are; a nod or his arms folded at your answer; when you explain, he glances aside at Kotarō's mistake and makes his point about the … | 9 (I'll ask Sayo, that sounds rough, waiting, the order slip · nao, the order slip · mio, the order slip · ren, the order slip · suzu, the order slip · not yet, plates fired) |
| `co.oldworks_enter` | Performed (C), staged | you look up the burned row to the kiln building and shade your eyes at its glassed-up door; your companion's own answer (Nao points out the barred gate down on the left, Mio's head goes down at the cooking pot and the clogs, … | 4 (nao, mio, ren, suzu) |
| `co.reflection` | Performed (C), staged | your companion steps up beside you at the lookout rail and you both look out over the lit village; then each says what the night brought, in their own way (Nao scans the exits, a hand to the satchel strap over the letter, a … | 4 (nao, mio, ren, suzu) |
| `co.road_marker` | Performed (C), staged | you lean in to the carved words on the stone; your companion answers in their own way (Nao points out the grass strip beyond it, Mio's guarded hand, Ren's open hand to the strip, Suzu's head goes down, then she laughs it off … | 4 (nao, mio, ren, suzu) |
| `co.road_north` | Performed (C), staged | you look at the thorn scrub over the old road and shade your eyes to the snow peaks beyond; your companion's own answer (Nao's shrug, Mio leans in to the dry brambles, Ren's open hand, Suzu glances away from the road north). | 4 (nao, mio, ren, suzu) |
| `co.sayo` | Performed (C), staged | Sayo's hand to her chin over the fifty-two seats; an open hand for the performer (with Suzu, she looks from her to you) and a point across to Tamotsu's channel; her guarded hand at the dusk gathering; she starts back at the … | 6 (the seats, the seats again, the performer · nao, the performer · suzu, before the gathering, thirty flasks) |
| `co.sayo_seats` | Performed (C), staged | Sayo holds up her seating chart and points to the empty seat at the end of the glassmakers' table; you look at it as you ask, and her hand goes to her chin; with Suzu, her head goes down. | 2 (nao, suzu) |
| `co.seat` | Performed (C), staged | you lean in to the chair with its overturned cup and look from the named seats to it; your companion's own answer (Nao leans in, Mio bends to the cup, Ren's open hand, Suzu's head goes down and she laughs it off); once it has … | 5 (the empty seat · nao, the empty seat · mio, the empty seat · ren, the empty seat · suzu, named) |
| `co.shino` | Performed (C), staged | Shino holds out the bundle of invitations whose address tags came off; when every one is placed, her nod; with Nao, an open hand; when the invitations are out, she sorts the post. | 5 (first meeting, the invitations · nao, the invitations · mio, the invitations · another time, all out) |
| `co.shino_first` | Performed (C), staged | Shino's nod, then she points to the sorting rack with its five empty slots; with Nao, they look from the rack to her. | 2 (nao, ren) |
| `co.shortcut_open` | Performed (C), staged | you bend to lift the bar from the gate; your companion's own answer (Nao's nod, Mio's nod, Ren's breath out, Suzu points through the stage door). | 4 (nao, mio, ren, suzu) |
| `co.signpost` | Performed (C), staged | you lean in to the blank signpost; once the names come back, you look along its arms, and your companion answers in their own way (Nao's nod, Mio's laugh, Ren's open hand, Suzu points along the firebreak path). | 5 (not asked yet, mended · nao, mended · mio, mended · ren, mended · suzu) |
| `co.suspect` | Performed (C), staged | your feet stop in the square and you look from the empty seat to the ropeless bell; your companion says it in their own way (Nao looks between the same two things, Mio's guarded hand and a shake of the head, Ren's hand to the … | 4 (nao, mio, ren, suzu) |
| `co.suzu_ask` | Performed (C), staged | Hiro keeps the blowpipe turning while he answers, shakes his head at his own strange story and works on; with Suzu, her hand brushes the ribbon; when his head goes white the gather is held still; Suzu's thanks, he turns to her … | 2 (suzu, nao) |
| `co.suzu_c_after` | Performed (C), staged | Suzu points to the seat next to Hiro's that she is booked for, and holds out her account book at "Paid in part"; with Nao, she shrugs at her own advice and Nao glances away. | 2 (nao, mio) |
| `co.suzu_c_inn` | Performed (C), staged | Suzu's open hand to the seat; she glances away as she begins, and your companion answers (Nao's shake of the head, Mio's guarded hand, Ren's hand to the chin); her head goes down over the woman who did not come back and the … | 3 (nao, mio, ren) |
| `co.suzu_c_post` | Performed (C), staged | Suzu's laugh at this year's payment; a shrug at standing before an audience, an open hand for the watched keeper. | 2 (the trial, the keeper) |
| `co.suzu_c_square` | Performed (C), staged | Suzu's small celebration at meeting you again; she greets your companion in kind (points Nao out and Nao's nod, an open hand for Mio and Mio's thanks, a laugh for Ren and Ren counts the times they got lost); her showman's … | 4 (meeting again · nao, meeting again · mio, meeting again · ren, again) |
| `co.suzu_c_wait` | Performed (C), staged | Suzu shrugs at the twenty years; when you report, your open hand, her hand goes to the ribbon, and her nod as she promises. | 2 (waiting, the report) |
| `co.suzu_night` | not in this pass (staged earlier; showcase) | — | — |
| `co.tamotsu` | Performed (C), staged | Tamotsu points to the low channel beside him and turns back to you with its width in his hands; his arms fold over the night watch he keeps without knowing why; he points up to the water gate; for Gorō's rope, his nod, and he … | 4 (the channel, the night watch, the fence key, rope for Gorō) |
| `co.tamotsu_gate` | Performed (C), staged | Tamotsu's nod; he holds up the rusty key from his belt, looks across to the fence he never asked about and shades his eyes up past the water gate; his flat hand for "be careful"; when the fence opens you look to it, and your … | 4 (nao, mio, ren, suzu) |
| `co.tokiwa` | Performed (C), staged | Tokiwa looks from the desk to you when he sends you to the chronicle or the reading table, adjusts his glasses over half a memory, and glances away when he says the kiln is sealed. | 5 (first meeting, idle, asked around, the records, after the records) |
| `co.tokiwa_confront` | Performed (C), staged | you both lean over the records; you turn to Tokiwa to say it, and his flat hand refuses it; he takes up one record after another to explain each away; your companion's own answer (Nao points at the records, Mio's flat hand, … | 4 (side by side · nao, side by side · mio, side by side · ren, side by side · suzu) via `co.hall_reading` |
| `co.tokiwa_intro` | Performed (C), staged | Tokiwa's nod of welcome and his glasses pushed up over his badly written apprentice years; your companion's own answer (Nao looks from him to the square-cornered shelves, Mio leans in to the tidy shelves, Ren's open hand, … | 4 (nao, mio, ren, suzu) |
| `co.tokiwa_page` | Performed (C), staged | you step to Tokiwa's side and hand him the page; he reads its last line, it slips from his fingers and his head goes down; he faces you to ask you to laugh; your companion's own answer (Nao's hand to the satchel strap, Mio's … | 5 (the page · nao, the page · mio, the page · ren, the page · suzu, getting ready) |
| `co.tokiwa_post` | Performed (C), staged | Tokiwa reads a letter from the other villages' recorders; then, for what became of the Archive and the memories, his nod for the copy deposited, his glasses over the closed archive, his head down under the grief come back, a … | 2 (a library · all returned · the trial, closed · each chose · the keeper) |
| `co.ume` | Performed (C), staged | Ume looks up to the black terraces, shakes her head at her own order, glances towards the channel, a hand to her chin for the rainless month; once it is in order her head goes down; you step to her side and she hands you the … | 7 (first meeting, idle, the night of the fire · nao, the night of the fire · mio, the night of the fire · ren, the night of the fire · suzu, the night · later) |
| `co.ume_after` | Performed (C), staged | Ume's nod, a look up to the young trees on the upper terraces; you step to her side and she presses the maple-leaf pin on you. | 2 (the pin, pin given) |
| `co.ume_first` | Performed (C), staged | Ume's nod of welcome; she looks across to her house over the beams that smell of smoke, then back with a shake of the head; your companion's own answer (Nao points to her house and Ume's hand goes to her chin, Mio leans in to … | 4 (nao, mio, ren, suzu) |
| `co.ume_post` | Performed (C), staged | Ume looks up to the upper persimmons, then back to you; she rubs her hands over the backs she rubbed, shakes her head at forced medicine. | 2 (the memories returned, each chose) |
| `co.upper_enter` | Performed (C), staged | your companion steps off the gate beside you; you look up the rows of young trees on the ash-coloured ground; your companion's own answer (Nao looks up the rows, Mio bends to the black stumps, Ren's open hand at the one path, … | 4 (nao, mio, ren, suzu) |
| `co.upper_locked` | Performed (C), staged | you lean in to the locked fence and its bleached sign; your companion's own answer (Nao looks from the sign to you, Mio glances away, Ren leans in to the too-even trees, Suzu shakes her head); once you know the key, you look … | 5 (locked · nao, locked · mio, locked · ren, locked · suzu, the key is with Tamotsu) |
| `co.upper_stone` | Performed (C), staged | you lean in to the words cut in the stone; your companion's own answer (Nao's nod, Mio points to the words, Ren leans in to the cut, Suzu's shrug at herself). | 4 (nao, mio, ren, suzu) |
| `co.upper_wall` | Performed (C), staged | you lean in to the crumbling wall; your companion's own answer (Nao's shrug, Mio's hand to the chin, Ren's open hand, Suzu's open hand); once the stones hold, your companion's nod, Ren tends their lamp (lantern bases are … | 5 (stone · nao, stone · mio, stone · ren, stone · suzu, later) |
| `co.village_first` | Performed (C), staged | your companion steps off the road beside you (the follow rule left them on your tile); you look along the square being decorated and turn towards Sayo calling from it (she is up the square among the ladders, heard before she … | 4 (nao, mio, ren, suzu) |
| `co.warden_fight` | Performed (C), staged | you turn to the warden rising in the heart of the kiln; your companion's own answer before the fight (Nao looks from it to you, Mio's guarded hand, Ren raises their lamp, Suzu points it out on its stage); after, your breath … | 4 (nao, mio, ren, suzu) |
| `co.works_sign` | Performed (C), staged | you lean in to the sooted signboard; your companion's own answer (Nao's nod at the name, Mio leans in to the lettering, Ren's open hand, Suzu's head goes down over the name she never knew). | 4 (nao, mio, ren, suzu) |
| `cs.parcel_marks` | left (H): src/content/cases/20_parcel.js is another worker's | Performed (proposed): a case page read at the post-house bookpile, the companion's answer. Proposed: you lean in to the pile and read. | read; not run |
| `cs.view_note` | left (H): src/content/cases/30_view.js is another worker's | Performed (proposed): the view case's note found at the inn's bookpile. Proposed: a bend to the pile, the note read. | read; not run |
| `lq.fare_fusa` | left (H): src/content/lq/30_fare.js is another worker's | Performed (proposed): Fusa remembers Chigusa, laughing; the cup kept upside down; each companion's answer. Proposed: Fusa's laugh and a hand to the chin over the odd habit. | read; not run |
| `lq.road_ume` | left (H): src/content/lq/40_road.js is another worker's | Performed (proposed): Ume recognises the Koharu persimmon and gives you a dried one for Yasu. Proposed: a look up to the top terrace, the dried persimmon handed over side-on. | read; not run |
| `pets.dog.dog` | left (H): src/content/pets/30_dog.js is another worker's | Performed (proposed): the dog at the broken gate, Tamotsu's word, the two ways in; a crouch and a hand held out low. | read; not run |
| `pets.dog.gate` | left (H): src/content/pets/30_dog.js is another worker's | Performed (proposed): the gate mended (two ways); a bend to the latch or the peg. | read; not run |
| `pets.dog.notice` | left (H): src/content/pets/30_dog.js is another worker's | Quiet by design (proposed): one remark about the dog by the gate; a look that way (as pets.cat.notice in Ch1). | read; not run |
| `pets.tanuki.notice` | left (H): src/content/pets/40_tanuki.js is another worker's | Quiet by design (proposed): one remark about the tanuki on the road; a look that way. | read; not run |
| `pets.tanuki.papers` | left (H): src/content/pets/40_tanuki.js is another worker's | Performed (proposed): the scattered papers tidied (two ways); a bend to gather them. | read; not run |
| `pets.tanuki.tanuki` | left (H): src/content/pets/40_tanuki.js is another worker's | Performed (proposed): the tanuki in its hollow, two ways in; you kneel and wait. | read; not run |

#### Chapter 4 (50)

| scene | decision | what is staged / reason | branches run |
|---|---|---|---|
| `cs.rosette_box` | left (H): src/content/cases/40_refine.js is another worker's | Performed (proposed): the rosette box opened at Hoshino's bookpile; the companion's answer. Proposed: a bend to the box, the rosette in hand. | read; not run |
| `cs.view_east` | left (H): src/content/cases/30_view.js is another worker's | Quiet or performed (proposed): three narration lines at the east view-stone; you look out (attention only) — decide with the case's other views. | read; not run |
| `cs.view_seat` | left (H): src/content/cases/30_view.js is another worker's | Performed (proposed): the view case at the stair's stone seat (it calls sb.path_bench, staged here). Proposed: you sit or lean to the seat's view. | read; not run |
| `cs.view_west` | left (H): src/content/cases/30_view.js is another worker's | Quiet or performed (proposed): three narration lines at the west view-stone; you look out (attention only). | read; not run |
| `lq.chigusa_idle` | left (H): src/content/lq/30_fare.js is another worker's | Performed (proposed): Chigusa pours you her black tea, her laugh; the upside-down cup. Proposed: the cup handed over, her laugh. | read; not run |
| `lq.fare_chigusa` | left (H): src/content/lq/30_fare.js is another worker's | Performed (proposed): Chigusa at the pass hears the seal's name, leaves the kettle whistling, tells the stormy night, decides to pay (personal/long-quest high point; SHOTS.md §8.5: 25, the kettle not lifted, 27). Proposed: her stillness at the kettle, head down, then facing you. | read; not run |
| `sb.arrive` | Performed (C), staged | your breath shows in the thin cold air; your companion's own way into the snow (Nao shrugs at the cold, looks up the road to the village where the post waits, a hand to the satchel strap; Mio looks you over for cold fingers … | 4 (nao, mio, ren, suzu) |
| `sb.bellpost` | Performed (C), staged | you lean in to the blank (or rewritten) board on the bell-post; for the noon bell you look up to the bell; one stroke or three, your companion shakes their head or laughs at the wrong signal (Nao shrugs, Ren's open hand); the … | 11 (blank, rewritten, once, twice · nao, twice · mio, twice · ren, twice · suzu, three times · nao, three times · ren, the storm signal · mio, the storm signal · suzu) |
| `sb.boss_after` | Performed (C), staged | you breathe out as the ice melts and lean in to the trembling flame; you turn to the hatch at the feet on the ladder; Hoshino (who climbed up after you) catches his breath on the back stair's line, leans in to the blank shade … | 5 (by the back stair · nao, by the back stair · mio, by the back stair · ren, by the back stair · suzu, every door open · mio) via `sb.boss_pre` |
| `sb.boss_pre` | Performed (C), staged | you turn to the blue flame rising in the ice; your companion's own answer before the fight (Nao's hand to the satchel strap: a delivery; Mio's guarded hand; Ren tends their lamp; Suzu's open hand). | 5 (by the back stair · nao, by the back stair · mio, by the back stair · ren, by the back stair · suzu, every door open · mio) |
| `sb.charts_desk` | Performed (C), staged | you read Hoshino's note to Denji; your companion's own answer (Nao's nod at how friends write, Suzu's laugh); then they look from the log on the big table to you. | 4 (the note · nao, the note · suzu, the note · mio, the log solved) |
| `sb.charts_sketch` | Performed (C), staged | you unfold the sketch and read it. With Ren: you hand it to them, they read the words they know, hold it further away and close again over the face they do not (the narration says so), their head goes down; then they hand it … | 5 (the sketch · nao, the sketch · mio, the sketch · suzu, Ren · keep it, Ren · the lamp first) via `sb.charts_log` |
| `sb.charts_stove` | Performed (C), staged | you bend to the cold stove; you reach to trace the flame word and the wood flares; you breathe out warming your hands; your companion's own answer (Nao's nod, Mio looks at your pink hands, Ren's open hand, Suzu's breath out). | 6 (lit · nao, lit · mio, lit · ren, lit · suzu, left, already lit) |
| `sb.chiyo` | Performed (C), staged | Chiyo points to her snow observatory with its berry lamp; she celebrates her win, and with the lamp lit points up to the real one. | 3 (the berry lamp, won, won twice) |
| `sb.denji` | Performed (C), staged | Denji, sitting by his ice hole, glances at the line, looks up to the dome he built, and nods about the writing on the walls; when the lamp is back he looks up to it and shows with both hands the back stair he is proud of. | 2 (the ice hole, the lamp back) |
| `sb.dome_enter` | Performed (C), staged | your companion steps off the hatch beside you; you look up at the great lamp wrapped in ice and lean towards its blank shade; your companion's own answer (Nao looks from it to you, Mio's guarded hand, Ren leans in, Suzu points … | 4 (nao, mio, ren, suzu) |
| `sb.eve_hoshino` | Performed (C), staged | Hoshino looks from the lamp to you; he breathes out over climbing every night, nods to following you down, or a hand to his chin over sharing the lamp; his glasses over his message for Akari. | 3 (stays, goes, both) |
| `sb.eve_start` | Performed (C), staged | the square stands looking up at the lamp on the mountain (Snowbell is placed facing north, its backs to you); you look up with them; Yae turns to celebrate the eleven days and count the twelve years; Sōsuke turns and holds up … | 4 (nao, mio, ren, suzu) |
| `sb.fuki` | Performed (C), staged | Fuki (in bed with her cold, a cane at hand) nods hello, shakes her head over the blank board, looks from her notebook to you; her laugh and her nod for help; when the noon bell has rung she laughs and hands you the cord she … | 5 (leave it to us, busy, the notebook, the noon bell rang, done) |
| `sb.fuki_after` | Performed (C), staged | Fuki laughs at her cold getting better and looks from the bell-post to the lamp on the mountain (two marks for the way home); still unable to climb, she looks up at the post, nods to ask, and laughs her thanks. | 2 (the bell rung, the bell still to ring) |
| `sb.gallery_enter` | Performed (C), staged | your companion steps off the doorway beside you; you look up round the ring of the gallery and lean towards the frozen hatch; your companion's own answer (Ren looks up at the cold coming down, Nao looks from it to you, Mio's … | 4 (nao, mio, ren, suzu) |
| `sb.goat_note` | Performed (C), staged | you lean in to the note pinned to the post; once read, your companion's own answer (Nao looks between the two kids, Mio bends to the mother goat, Ren's nod, Suzu's laugh); later you read it again. | 6 (not ours to read, read · nao, read · mio, read · ren, read · suzu, read again) |
| `sb.hall_dial` | Performed (C), staged | you lean in to the frosted dial; when the needle rests on south you turn to the click and look to the door as the ice falls; your companion's own answer (Nao's shrug, Mio's laugh, Ren's open hand, Suzu's laugh); later, you … | 6 (south · nao, south · mio, south · ren, south · suzu, not yet, open) |
| `sb.hall_enter` | Performed (C), staged | your companion steps in off the doorway beside you; you look up at the icicles and lean towards the iced door and its dial; your companion's own answer (Nao's shrug, Mio rubs her hands to show you how — her line says so, Ren's … | 4 (nao, mio, ren, suzu) |
| `sb.hamlet_first` | Performed (C), staged | your companion steps up off the road beside you; you shade your eyes to the dark observatory on the mountain and turn towards Kanta calling from the square (he is up by the snow goats, heard before he is near); your … | 4 (nao, mio, ren, suzu) |
| `sb.hayate` | Performed (C), staged | Hayate points to the iced stair and looks up the mountain at what calls the foxes; with Mio, he turns to her at her offer; in the morning he shows with his hands how to slip past, and his arms fold over the fighting. | 3 (the foxes · mio, the foxes · nao, the morning) |
| `sb.hearth_fails` | Performed (C), staged | you turn to the hearth as it shrinks; Yae starts back, Denji's hand to his chin, Kanta's hands twist as the frost creeps in; your companion's own urging (Nao points to the hearth, Mio looks from the children to you, Ren's open … | 4 (nao, mio, ren, suzu) |
| `sb.hoshino` | Performed (C), staged | Hoshino is watching the road from his window and turns, startled, to you; his glasses over his work of watching the road; your open hand; his head goes down at "Yae sent you", he looks up to the lamp and back to you over the … | 12 (the promise · nao, the promise · mio, the promise · ren, the promise · suzu, waiting, the letters · nao, the letters · mio, the letters · ren, the letters · suzu, the letters · the bell known · nao, the letters · the bell known · mio, the stair melted?) |
| `sb.hoshino_post` | Performed (C), staged | Hoshino looks from the lit lamp to you; he breathes out over Akari's "no", or holds up her letter; a nod for the copied star charts, a look up at a sky of only stars. | 2 (both · the library, stays · closed) |
| `sb.kanta` | Performed (C), staged | Kanta bounces as he asks you to judge, looks between the snow goat and the snow fox, points to the cards, his hands twist over the wind's damage and he points you round the three; your companion's own answer (Suzu's laugh, … | 7 (a judge · suzu, a judge · ren, not seen all three, the judging, the judging · later, judged, the lamp on) |
| `sb.morning_hoshino` | Performed (C), staged | Hoshino's nod good morning, a look up the mountain he cannot climb; you step to his side and he hands you the observatory key; his nod; your companion's own answer (Mio leans in to look him over, Nao's nod). | 2 (mio, nao) |
| `sb.natsume` | Performed (C), staged | Natsume yawns and laughs over her uncle; dozes off over the note she wrote; laughs at "it was snow" and yawns over the kids' names; once the lamp is lit, her nod. | 4 (first meeting, the hint, the kids, after the lamp) |
| `sb.path_bench` | Performed (C), staged | you lean in to the height notches on the post by the stone seat; your companion's own answer (Mio leans in to them too, Nao glances away at fifteen, Suzu checks her own account book, Ren's nod). | 4 (nao, mio, ren, suzu) |
| `sb.path_enter` | Performed (C), staged | your companion steps up off the stair beside you; you shade your eyes up the zigzag stair to the small round roof, and look along the snow where the fox moved; your companion's own answer (Nao's shrug at "don't run", Mio's … | 4 (nao, mio, ren, suzu) |
| `sb.quiet_mio` | Performed (C), staged | with the lamp out the room goes dark (night ambience, ended before the morning); you and Mio sit up at the foot of your futons, turned to each other. Mio turns to you, her hands fidget over her pillow and her rule; her laugh … | 3 (Mio · rules, angry, reassure, the jar, Mio · company, what, honest, good, Mio · share) via `sb.quiet_begin` |
| `sb.quiet_morning` | not in this pass (being illustrated by another worker) | — | — |
| `sb.quiet_nao` | Performed (C), staged | with the lamp out the room goes dark (the scene's night ambience, ended before the morning); you and Nao go to the foot of your futons and sit up there, turned to each other. Nao looks to the door at the knocking wind, shrugs; … | 3 (Nao · talk, go on, deliver it, no laughing, Nao · sheep, laugh, my fear, one label, Nao · listen) via `sb.quiet_begin` |
| `sb.quiet_ren` | Performed (C), staged | with the lamp out the room goes dark (night ambience, ended before the morning); you and Ren sit up at the foot of your futons, turned to each other. Ren counts the three walks of tomorrow's route; a nod for walking it … | 3 (Ren · joke, laugh, recite, Ren · gentle, pun, keep, Ren · hope) via `sb.quiet_begin` |
| `sb.quiet_suzu` | Performed (C), staged | with the lamp out the room goes dark (night ambience, ended before the morning); you and Suzu sit up at the foot of your futons, turned to each other. Suzu's open hand about the snoring audience; her laugh, or a look away from … | 3 (Suzu · snoring, exact, which, mine, Suzu · scared, the goat now, wait, free, Suzu · helped) via `sb.quiet_begin` |
| `sb.road_east_locked` | Performed (C), staged | you look at the drift over the road down to Lanternfall; your companion's own answer (Nao's shrug, Mio's shake of the head, Ren leans in to the snow, Suzu points up to the village). | 4 (nao, mio, ren, suzu) |
| `sb.rokuta` | Performed (C), staged | Rokuta shows how big his fox's tail was; with Nao, they lean in to the card and he claps a hand to his forehead (comic); after losing, he glances aside at his plan, and Suzu laughs. | 2 (the tail, lost) |
| `sb.sachi` | Performed (C), staged | Sachi looks from her frozen washing to you and opens a hand over the winter without letters; she holds up her husband's letter and laughs about the doll; an open hand over Kanta at the window, and a laugh at his late night. | 4 (frozen washing, the letter, after the lamp, the evening) |
| `sb.service_bolt` | Performed (C), staged | you look at the barred back door and bend to lift the bar; your companion's own answer (Nao's nod, Ren's open hand). | 3 (lift the bar · nao, lift the bar · ren, leave it) |
| `sb.sousuke` | Performed (C), staged | Sōsuke's nod of welcome and his glasses over the postmaster's waiting; asked about the letters he glances away, holds up the blank envelopes and looks from the shelf to you; your companion's own idea (Nao's open hand for the … | 8 (first meeting, the blank post · nao, the blank post · mio, the blank post · suzu, the blank post · later, after, the morning, the lamp lit) |
| `sb.stair_ice` | Performed (C), staged | you lean in to the ice over the stair (in the morning your companion looks from it to Hoshino's house); with the flame word you hold your hand up to it, start back at the crack, and your companion answers in their own way … | 8 (no word yet, the storm night, the morning, no key, melted · nao, melted · mio, melted · ren, melted · suzu, not melted yet) |
| `sb.storm_kids` | Performed (C), staged | Chiyo points at Rokuta over the "draw"; he weighs the fair wind in his hands (or glances aside at his plan to cancel her win), and she points at him again. | 2 (a draw, cancelled?) |
| `sb.tetsuji` | Performed (C), staged | Tetsuji counts on his fingers and comes out at twelve again, counts the ten and the two, his arms fold over the strays; your companion's own answer (Nao's shrug, Suzu's laugh); he points you to the shed; at the note, a hand to … | 7 (twelve · nao, twelve · suzu, waiting, born · mio, born · ren, twelve, good, after the lamp) |
| `sb.yae` | not in this pass (staged earlier; showcase) | — | — |
| `sb.yae_post` | Performed (C), staged | Yae laughs over Kanta keeping the lamp (or opens a hand over Hoshino's nightly cup), a hand to her chin over borrowing books in winter, her nod for your room, and her laugh at your help with the orders. | 3 (Kanta keeps the lamp · rest, Hoshino stays · help, another time) |
| `sb.yae_storm` | Performed (C), staged | Yae, behind the counter in the storm, asks for help with an open hand and counts the orders on her fingers; her laugh when you get every count right (an open hand if she does it herself); later she points you up to the room … | 3 (the orders, not helped, not lit, the fire lit) |
