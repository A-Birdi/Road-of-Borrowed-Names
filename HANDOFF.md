# Handoff

- Repository: `https://github.com/A-Birdi/Road-of-Borrowed-Names.git`
- Active task branch: `claude/stoic-sagan-n3jvgk` (base `main`; checkpoints are NOT on main)
- Spec: `SPECIFICATION.txt` (byte-identical copy of the brief)
- Deliverable: `index.html` at repo root, built by `node tools/build.mjs`.

## Architecture (src/, concatenated in `src/manifest.json` order)
- `core/` namespace + utils (RB.util, RB.bus).
- `lang/` Japanese core: RB.kana, RB.jp (ruby markup parse/render, deinflect,
  lookup), RB.lex (lexicon), RB.grammar, RB.answers (answer checking + feedback),
  RB.kanaLessons; `70_lookup_ext.js` (counters, names).
- `recog/` handwriting recognizer (KanjiVG-derived data, CC BY-SA 3.0; see
  docs/RECOGNITION.md). API: RB.recog.recognize / reference / strokeOrderFeedback.
- `audio/` Web Audio synth, sequencer, 33 songs, 44 sfx, local-only TTS (docs/AUDIO.md).
- `engine/` state+conditions, input, tiles, props, sprites, portraits, maps,
  mapkit, world, render, script DSL runner, save (IndexedDB slots), game
  controller, combat logic (95), test harness (99, inert unless enabled).
- `learn/` mastery scheduler, task generation.
- `ui/` UI core + lightbulb help + HUD, dialogue, title/slots, creation
  (prologue, placement, NG+), menus, handwriting pad, challenge runner, lessons,
  activities (orders/letters/signpost/history), combat UI + enemy art.
- `content/` 00_world (cast/places), 01_inkweaving (words, telegraph lines),
  ch1..ch6 chapters, zz_names (auto-registers names in lexicon).
- `atlas/` Unwritten Atlas (post-game expeditions) — by a worker.
- Docs: docs/STORY.md (bible), docs/CONTENT.md (authoring formats),
  docs/AGENT_COMMON.md, docs/LANGUAGE.md, docs/RECOGNITION.md, docs/AUDIO.md.

## State
- Complete: engine, UI, saves, learning, combat, recognizer, language, audio,
  Chapters 1–6 with ending/denouement, the Unwritten Atlas, New Game+; since
  2026-09-29 also groups of creatures and the companion's turn, two long
  quest lines with the side area Koharuno, quest guidance (nudges and
  markers), every displayed kanji on the pad with the kanji chart, and the
  new title scene.
- Since 2026-09-30 also the owner's **Living Company and Discovery addendum**
  (all of it, integrated): four cosmetic pets, the Company tab (Companion,
  Pet, Shared memories), bond, companion thoughts/invitations/reflections/rest
  topics, ending extensions and The Pages We Keep, Field Inkweaving with the
  Mill Road and puzzles F1–F6, two deduction cases with evidence pages and
  Known Details, twelve Roadside Keepsakes, sentence bookmarks and Creatures
  Met. See the section below and docs/addendum/COVERAGE.md.
- Latest full check (5312690 + the test-only fix 24f8730, VALIDATION.md
  "Addendum — integrated validation"): validator no errors (634 registry
  texts); unit 6321/0; `node tests/e2e/run.mjs` 49/50 (battle_group's phone
  section, a test pointer issue fixed in 24f8730, then 6/6 twice), including a
  whole-game run; layout audit 536/536 (English, 8 viewports) and 201/201
  (Japanese, 3); whole-game matrix 16/16. Earlier milestones and dates are in
  VALIDATION.md.
- Since 2026-10-02 also the **Practice addendum** and the **Battle addendum**, both
  complete on this branch (sections below). Latest checks (VALIDATION.md "Battle addendum —
  Phase F"): validator no errors; unit 15,334/0; `node tests/e2e/run.mjs` 63/65 on the merged
  build (the two explained and passing on the final build), including a whole-game run; battle
  geometry, invariance, 20-battle cleanup and memory budget on the final build; then the
  full-game matrix with both addenda (VALIDATION.md "Full-game matrix — both addenda"):
  whole-game matrix 16/16, layout audit 536/536 (English, 8 viewports) and 201/201 (Japanese, 3).
- Since 2026-10-03 also the **Harmony & Expressive Storytelling** and **World Idle Life** addenda (sections below),
  with the approved painted Harmony art imported on 2026-10-06.
  - Latest checks, chosen by the clarified testing cadence (VALIDATION.md "Checks on the approved art"):
    - unit 27,245/0;
    - Foundations campaigns with each companion 4/4;
    - staging_chapters 13,850/0;
    - the default suite's first half (two failures explained and fixed);
    - layout audit 535/536 → fixed, and 201/201;
    - battle_party 14/0, battle_anim 16/0, harmony_cutin 11/0.
  - **The machine-side items Robin asked to finish (2026-10-06), done** (VALIDATION.md "HX59, HX66, HX67 and HX70 on
    the approved art"):
    - HX66: appearance fixtures 75/0.
    - HX67: painted sheets and refreshed recordings.
    - HX59: the art measured in 16 real encounters, budget 1/0.
    - HX70: cleanup cycles; F/Ren 1/1 on 54b2673; the 16-combination matrix kept for Robin's final check.
  - **Found and fixed on the way:**
    - The painted cut-in was left out in group battles at desktop sizes, Robin's 2048×1046 included. It now slides
      past the left edge, or trims up to 16 art px of hair crowns at the top, faces always whole (HARMONY.md §7.2).
      Windows of 1440 px and narrower still leave it out with three creatures, and some with two (recorded).
    - In a group the cut-in's start cost 0.4–0.8 s; now 12–21 ms.
    - Latest: unit 27,245/0; harmony_cutin 12/0 on 524e6e2.
  - Still open in those addenda: a person watching the conversation gestures and portraits at play speed (WI5, WI26,
    HX33), and the uneven portrait scaling on phones (WI14, deferred). Robin (2026-10-06): set phone *testing* aside for
    now; it must still work there. Robin's next playthrough goes to the end with all feedback at once; those items
    wait for it.
  - **Portrait viewer for Robin's review (2026-10-06):** `?dev=portraits` (src/ui/21z_portrait_dev.js; B
    portrait_dev). It shows the game's own renderer and timeline: every speaker, with Chapter 2 and later hidden
    until revealed; every expression and its lead-in cue; the player's look; and the three dialogue layouts × six
    device pixel ratios at real device pixels. Published for Robin as the private page "Dialogue Portraits" (a copy
    of the build with the dev flag on). Robin (2026-10-06): "It looks pretty good for now - we can expand on it
    further given the ideas discussed at a later time."
  - **Portrait ideas discussed, for later (not started; Robin will ask):**
    - expressions for the untagged two-thirds of lines and the player's lines, proposed by a tool from the sentence
      and written into the scripts as ordinary tags;
    - bigger, bouncier one-off cues per line;
    - body language with hand and arm layers, which may belong in the final art pass.
- Test tooling: tests/e2e/drive.mjs (goal-directed driver: walks real maps,
  interacts through the world), pursue.mjs (whole game), matrix.mjs,
  run.mjs (suite runner), explore.mjs (random explorer, weaker).
- Hotfix (user-reported): Shift froze the world; Load/Continue left the title
  backdrop over the world. Fixed in src/engine/10_input.js, 50_world.js,
  90_game.js; regression tests/e2e/shift_load_regression.mjs (+ fixture
  tests/fixtures/shift_load_legacy.json), 18/18 in http-origin and file://
  modes; original build 3/18. See VALIDATION.md.
- **Testing cadence (Robin, 2026-10-06, clarified the same day):** the routine full run is **F/Ren** (Foundations,
  Ren). Before starting a long or broad run, work out *why* it is needed, and run only what the change can affect.
  - **A visual adjustment:** F/Ren is enough; no full suite.
  - **A new battle sequence:** test it on its own, not with a full run of the whole game.
  - **A new puzzle, or a feature or area that depends on the Japanese level:** test it on all four language
    profiles, with good reason.
  - **Menu systems such as a future illustration book:** test the triggers directly in a test environment (e.g.
    every combination of the earned marker, effect or border), not with a playthrough.
  - **Content that touches a specific companion:** that companion too.
  - **The 16-combination matrix:** only when the reasoning calls for it, or when Robin asks for a final full check.

  Robin: "It's likely that any issues you may come across with F/Ren would be discovered with A/Suzu as well."
- **Future expansion (discussion only, NOT authorised work):** Robin shared a consolidated note of expansion ideas on
  2026-10-05 (stored unchanged at Robin's request in docs/future/EXPANSION_CONTEXT.md) and settled these points for when it is picked up; nothing is to be built until
  Robin selects and specifies a scope:
  1. Illustrations: the book is always fully viewable from the Main Menu; each save earns a border, sheen,
     holographic finish or badge on the illustrations it witnessed in the story; opening any illustration shows its
     unlock and viewing criteria. No passwords (which would also clash with the spec's no-share-code rule).
  2. Suspend: only for the 100 Trials superdungeon, to pick up where the player left off; never from a battle, least
     of all a boss. Everywhere else the regular autosave is enough.
  3. Illustrations with the player in them are high fidelity, idly animated, like Robin's Astra mockups: from the
     Main Menu they show the Continue file's character (or the creation default with no save); in game, the player's
     own appearance. Each is a substantial layered-art job.
  4. Mastery: separate stars (or similar) per input type: handwriting, multiple choice, typed, listening (typing or
     writing what a repeatable voice says; depends on the device having a Japanese voice). First version: a mastery
     exam per group, a star when fewer than 30 % of its questions were assisted; weighted measures come later.
     Robin notes that today some recognizer corrections count as assisted (in src/ui/60_pad.js, choosing a candidate
     other than the recognizer's first counts as assisted), which would need ironing out first.
  5. (The testing cadence above, as clarified.)
  6. A final art pass near the end, across much of the game, toward a more distinct stylised feel with far more
     active and idle animation and a living community; the bar is the dragon-knight reference
     (docs/BATTLE_ART_CONTRACTS.md: material shading, strong silhouette, overlapping forms, secondary motion) at a
     smaller scale.

  Robin also supplied the full consultation transcript behind the note (2026-10-06). It is stored unchanged in
  docs/future/consultation/; `sha256sum -c MANIFEST.sha256` there verifies it. It is also discussion only. Where it
  differs from the six points above, the six points win, because they are later:
  - Its point 7 floated chapter "password" codes for the gallery. Point 1 drops them.
  - Its closing testing plan used one F/Ren run as the routine check. Robin confirmed this on 2026-10-06; see the
    testing cadence above.
  - Its point 4 left "overly assisted" to a weighted judgement. Point 4 above gives the first version: under 30 %
    of questions assisted, per input type.
  **Expansion plan, draft 9 (2026-10-09), at Robin's request:** docs/future/plan/ (start with README.md). It
  consolidates the consultation into an implementation plan, written from a read-only audit of the code, saves,
  canon and spec: regions (Manybridge, the Keepers' Road, Kotonoha, the Cloudroad, Steamhollow, the Hall of a
  Hundred Tales), systems, the story at twelve chapters, a roadmap, every idea traced, and a register of
  contradictions. Planning only; nothing is built until Robin authorises a scope. SEALED_STORY_NOTES.md holds
  spoilers for Robin. A reading page of the plan (without the sealed notes) is published as a private artifact and
  republished after each round of answers.
  - **Robin's answers of 2026-10-07, two rounds** (11_CONTRADICTIONS.md parts A, A2 and B): twelve chapters; old
    six-chapter saves can't continue, and continuing one begins New Game+ after a notice; New Game+ keeps personal
    records only (learning, stars, illustrations, pastime records, settings), is offered at the end of the game, and
    opens with a farewell from the companion; optional dungeons restart, story dungeons keep checkpoints; persistent
    health only where a dungeon specifies it; puzzle, social and objective encounters are exempt from "winnable by
    Unravel alone", and Unravel stays available there even where it does nothing (taught at the Tally Exchange);
    story separations allowed, quarrels never lower Bond; stars are flair; one-guess handwriting; festival games
    just for fun; the Atlas keeps a fixed shape with varied rooms; no size concern below 100 MB; baths follow
    pronouns, they/them and custom choose once; the Wayfarer's Ledger and the Inn Ledger; about 15 h brisk and about
    40 h for a new learner; hanafuda in; avoidable deaths, never to NPCs who matter.
  - **Third round (same day):** romance limited to holding hands and/or a kiss with the chosen companion, at the
    ending by Bond, very rarely elsewhere, nothing explicit; the "effect here" preview in combat only, with *tried*
    marks elsewhere; witnessed conflicts shown with restraint; New Game+ keeps the traveller unchanged, carries no
    keepsakes or lore, may use either slot, and plays the originating save's farewell; Nao and Ren always choose
    the same bath.
  - **Fourth round:** C-67 confirmed (the romance moment is always the player's choice, the companion's consent
    shown, at most one earlier moment holding hands after the Steamhollow reconciliation).
  - **2026-10-08:** Suzu expanded (a travelling comedian; crosses paths with her troupe, chooses to stay, a night
    apart, the double act) and every companion given a second arc of the same depth (14_COMPANIONS.md; specifics
    in sealed S14); the Hush as a rising tragedy (10_STORY §6a; sealed S15); all of part B decided, including a
    Distractions tab, one coherent score, no native reviewers (self-review), no fishing in mastery exams, repairs at
    sea, unique situation encounters, festival-only yukata, 1–3 h per chapter; battle notes planned as E21–E26
    (Harmony's sound, group scaling, more creatures, reasons to fight roaming creatures, companion growth, varied
    tactics and silencing).
  - **Fifth round (2026-10-08):** C-68 to C-71 decided. Suzu's arc approved and Nao's, Mio's and Ren's fleshed out
    to the same depth by the lead's judgement (while doing it, two canon lines used in draft 6 turned out to be
    spoken by other characters; Nao's and Mio's arcs were rebuilt on their own lines, sealed S14). Battles: each
    creature numbered by action order, targeting kept; Unravel reaching two and Protect covering both as story
    moments; **modifier words** that extend a response's reach (03_ENCOUNTERS.md E27, from Robin's four families);
    only Hush or Hush-adjacent creatures silence, always inferable; companion tools found off the beaten path,
    never missable.
  - **Sixth round and Robin's playbook package (2026-10-09):** C-72 to C-74 approved "as asked". Robin asked for menus
    that look and feel like a physical book in the 2.5D world rather than nested panels, and allowed a new font if it
    is readable and fits the game's tone (embedded, offline; this replaces the earlier "no new font files" rule for
    that purpose only). The package (a proposed order of work P00–P18, the book interface in full, a review of
    draft 7) is stored in docs/future/playbook/ with model names neutralised, images as WebP and the PDFs left out
    (hashes listed). Draft 8 adds plan/15_INTERFACE.md and settles the review's discrepancies (part E).
  - **Seventh round (2026-10-09):** C-75 to C-78 decided. **C-78: the playbook's order of work is adopted**, and the
    authorised scope is **P00** (baseline receipt and census, no change to the game) and **P01's interface proof,
    U00–U02** (inventory, the book shell on Journey and Company with a dialogue strip and phone layout, and the type
    specimen), ending in one review set for Robin. P01's Reedwake/Saltglass presentation proof and all later
    milestones are not yet authorised. C-75: a wrong first exam answer counts like help; C-76: up to five hostile
    creatures in set pieces; C-77: one Harmony technique per filled bar. Nothing is waiting on Robin.
  - **Work records for the authorised packets:** docs/future/work/ (state, P00 baseline receipt, census, U00
    inventory, U01 record). **U01 is done:** the book on Journey and Company and the dialogue strip, as a preview
    behind Settings › Display › "The Wayfarer's Ledger (preview)" (classic stays the default; Robin's game is
    unchanged unless it is chosen). Evidence: `tests/e2e/book.mjs` 13/0, captures in docs/screenshots/book/u01/.
    **U02 is done:** the preview's type (Vollkorn, BIZ UDPGothic, Shippori Mincho, BIZ UDGothic), embedded in the
    game file and made into fonts only when the preview is on (data/fonts/README.md; record U02_TYPE.md).
    **The U01/U02 review set is published for Robin** (one question: does it feel like a book that belongs to this
    journey, and is it easy to use?). Round 1 answer: "the tabs at the top were fine, it's more of the inner layout
    that needed some proper style and organization". **Round 2** restores the classic top tabs and reorganises
    Journey's and Company's inner pages (U01_BOOK.md "Review round 2"); the review page shows it. Robin on round 2:
    "I think it's an improvement - you may proceed." **C-79: the book direction is accepted** as revised (still a
    preview behind its setting), and **the rest of P01 is authorised**: Reedwake's presentation proof, then Saltglass
    reusing it, ending in its own visual gate. P02 and later wait for that gate. State: docs/future/work/STATE.md.
    **P01 is built (W00–W05) and its visual gate is published to Robin (2026-10-10)** as a private review page:
    Reedwake and Saltglass step by step against their plates, people at work, a battle in each town, phones, the
    numbers, and six smaller questions. Record: docs/future/work/P01_WORLD.md. Waiting on Robin's answer; P02 waits
    for it. To try the proof: open `index.html?dev=world`; at the title the panel offers Visit Reedwake and Visit
    Saltglass (never saved).
    **Robin's answer (C-80):** the direction is solid; push the detail toward the mockup and Octopath Traveler, with a
    nearer camera; battles keep their own framing (fixed). **The fidelity study** Robin asked for is built: Suzu
    redrawn from scratch alone at the Mill, rendered by the game with her idle and the scenery moving (panel: "Study:
    Suzu at the Mill", or `index.html?dev=world&study=mill`). Record: docs/future/work/P01_STUDY.md. **Its review
    page is published to Robin (2026-10-10)**, with the recordings, her frames, close-ups and four things that would
    help. Waiting on Robin's view of it.
    **C-81 (Robin, 2026-10-10): the whole expansion is authorised.** The fidelity study is kept as a test, not a
    standard (Robin will give feedback later). P02 to P17 are to be built in the playbook's order without consulting
    Robin; the lead decides what the plan leaves open and logs it in docs/future/plan/11_CONTRADICTIONS.md part F;
    Robin reviews it all at completion. **C-82:** Robin's art amendment AC-1 applies to art work only
    (digest: docs/future/plan/AC1_ART.md). P18 (the full matrix, any release) still waits for Robin. The twelve-chapter
    edition stays behind its development switch (Settings › Edition for new journeys, or `?edition=12`) until the
    release, so Robin's saves are never changed. **P02 (foundations), P03 (learning evidence, task families,
    Mastery, What I can do), P04 (encounters), P05 (the living world) and P06 (records, pastimes, the book) are
    done**; P07 (expeditions) is under way: the engine and the pilot, the Flood Cellars under Reedwake's warehouse
    (a hatch there, twelve-chapter journeys after Chapter 2), are done, as are the Atlas's commissions (a board in the Lantern Hall), delvers (people from the journey
    met by chance in the cellars and at the Atlas camp) and the ten dungeon families' templates; P07's phase end is next.
    Development pages: `?dev=enc` (encounter fixtures), `?dev=verbs` (exploration actions). Current state:
    docs/future/work/STATE.md.
  - **Working method the playbook asks for, once a scope is named:** one implementation model writing, one packet
    at a time, no parallel writers or second model; each packet with tests and rendered evidence; F/Ren cadence.
  - **The audit's eight defects were fixed on 2026-10-07** at Robin's request (part D; C-35 left the learning-record
    judgement to the lead): the Grammar met page, lantern grammar labels, activity Translate, Foundations copy steps,
    the promotion rule, the chart's phantom road, creature patrols' random stream, and the `alts` validator (which
    then found one unbuildable alternative in an Intermediate drill). Evidence: VALIDATION.md "Audit defects fixed
    (2026-10-07)"; REQUIREMENTS.md AD1–AD8.
- Not verified by automation (needs people): real handwriting accuracy,
  playtime, native-speaker review, music quality, audible TTS.

## Visual overhaul: "Wayfarer's Folio" (brief of 2026-09-26) — complete on this branch
All four phases are done on `claude/stoic-sagan-n3jvgk` (not on main). Final
build 6031612: full browser suite 19/19 (d5d4b95; 6031612 differs by one CSS
property, re-tested), unit 1866, layout audit 448/448 (English, 8
viewports) and 168/168 (Japanese labels), whole-game matrix 16/16.
Follow-up (player report, 2026-09-27): the dialogue no longer moves the map
and outdoor maps continue past their edges (b1185f9; full suite 20/20).
Follow-up (player report, 2026-09-28), full suite 24/24, layout audit
448/448 + 168/168 and whole-game matrix 16/16 on bbee0e2; then multiple-choice
options shuffled (src/ui/65_challenge.js choicesFor; the right option had been
shown first ~99% of the time) — see REQUIREMENTS.md P1–P16 and VALIDATION.md
"Playtest fixes":
- World (src/engine/40_maps.js shut doors + shutDoorAt; 50_world.js walk
  in/out (leave, arriveOnFoot, routeOut), extras (ensureSpeaker,
  dismissExtras), idle glances, map `hold` rule; 60_render.js breathing;
  27_propart.js `sway`; 70_script.js `!speakerless` now meaningful;
  chars[id].bodiless; npc `was` for a renamed figure; 90_game.js play time
  in every mode with a 5-minute idle stop). Test runs list bodiless lines,
  walk-ins and night leaks (tests/e2e/pursue.mjs).
Sprite and battle polish (owner's brief of 2026-09-28, amended). The full default suite passed 29/29 on ecb584b; on c113f3a the layout audit was 448/448 + 168/168 and the whole-game matrix 16/16. See REQUIREMENTS.md B1–B12, VALIDATION.md "Sprite and battle polish" and docs/ART_DIRECTION.md §8, §10 and §11:
- **World** (src/engine/50_world.js): people leave for where the story puts them next. `wayFor()`, `towards()` and `mapsWith()` find the map where the person now appears (or an authored `npc.leaveTo`) and the first exit on a shortest usable chain of map links. Arrivals come from `W.seenOn` or from where the story keeps them. `W.departures` records every coming and going, and test runs keep them in `RB.test.departures`, which pursue.mjs reports.
- **Encounter place:** 90_game `startBattle` passes `opts.where`, and 80_combat `placeEnemy()` sets the setting, placement bg/intro/settle and `bgKey`. `RB.combat.context()` reports all of this. Enemies declare `setting` when their lines describe a place, and validate.mjs checks each placement's lines and backdrop against its map.
- **Next button:** the battle overlay is inserted first in `#ui`, and `body.in-dialogue` turns off its pointer input. In 20_dialogue.js, a press that began before a line or its replies appeared doesn't dismiss it.
- **Characters:** 32_spriteart.js (40×58 road frames from one rig), 32h_spritehair.js and 32k_spriteacc.js; `RB.battlers` in 34_battlers.js (80×104 rear three-quarter battle figures, with a pose library).
- **Backdrops:** `RB.battlePlaces` (src/ui/76_battle_places.js, plus 76_battle_placeart.js) composes each backdrop from the map around the encounter, with seeded accessories. The old region painters in 79_battle_scene.js are the fallback.
- **Battle presentation:**
  - `RB.battleSeq` (82_battle_seq.js) stages the rules' fx.
  - `RB.battleStage` (83_battle_stage.js) handles layout and anchors, including `foe:i` for later.
  - `RB.battleFx` (84_battle_fx.js) draws effects and status marks; creature motion is in 78_enemy_art.js.
  - `Sc.effect`, `Sc.ward` and `Sc.mist` in 79_battle_scene.js are no longer called.
- **Groups of creatures, the companion's turn, the difficulty curve** (lead's brief of 2026-09-29; docs/COMBAT_NOTES.md, ART_DIRECTION §11; REQUIREMENTS E1–E12):
  - Rules: `st.foes[]` with `st.cur` the target (95_combat.js `groupFor`, `target`, `reachOf`, `compOptions`, `compAct`, `enemyAct` per creature); Relaxed 1, Standard 2, Demanding 3 creatures, only at the group placements of `sa.stacks`/`sa.conduits` and in the Atlas (30_gen.js). Battle resolve 14/12/10 by setting.
  - Companion's turn: after the response's step, a support menu (`C.companionActions`, src/content/02_companions.js; unlocks at recruitment, `ch2_done`, the personal quest, `lq_ally1`, `lq_ally2`); Back returns at no cost.
  - Screen: target slips and bracket, previews, formation, per-creature sequences (80_combat.js, 83_battle_stage.js, 82_battle_seq.js).
  - Player model `RB.combatSim` (96_combat_sim.js) drives `RB.test.battle` and the curve test `tests/unit/combat_curve.test.mjs`.
  - Tests: `tests/e2e/battle_group.mjs`, `tests/e2e/companion_turn.mjs` (both in run.mjs); unit combat_rules/combat_fairness/combat_curve.
  - Harmony charges: still undecided (docs/COMBAT_NOTES.md, last section).
Title screen (player report of 2026-09-29; REQUIREMENTS.md T1–T5, VALIDATION.md "Title screen"):
- The scene in src/ui/30_title.js is the open doorway of a roadside inn: sliding doors, a noren, a sill, and the folio lying flat on the desk.
- `mastAside()` reads the page's title layout from the same media queries as 40_title.css ('' centred, 's' beside the folio, 'sl' short landscape). The noren and the moon follow it.
- The stars dodge the title's words as measured on the page (`mastRects`, re-measured by a ResizeObserver), the moon and the ridge skyline.
- `drawSky()` twinkles the stars and runs the shooting star and comet. `RB.ui.title.sky()` / `.sky.soon()` are the test hooks.
- Chapter banner: src/ui/10_ui.js card() + 50_play.css .banner.
- Combat clarity: src/engine/95_combat.js (TECHS, blowOf/heatBonus/answers),
  src/ui/80_combat.js, src/ui/81_combat_help.js; boss theme in
  src/audio/30_songs.js. Kanji handwriting: src/recog/20_recognizer.js,
  src/ui/60_pad.js, src/lang/50_answers.js, Settings `padKanji`.
  Equipment: src/engine/07_equip.js (the worn look), Satchel in
  src/ui/50_menu.js. Design record, tokens, component rules, the old→new menu mapping and
the pixel-art record: docs/ART_DIRECTION.md. Before/after captures of the
real builds: docs/screenshots/ (README indexes them). Evidence: VALIDATION.md
("Visual overhaul — final build"). Checklist: REQUIREMENTS.md V1–V21.
- Interface: CSS per area in src/styles/ (00_tokens, 10_legacy, 20_folio,
  30_folio_pages, 40_title, 45_create, 50_play, 60_learning; concatenated in
  name order). RB.ui.folio (src/ui/12_folio.js): frame, APG paper tabs
  (roving tabindex, ribbon, overflow arrows measured from natural tab
  widths), inline SVG icons. Pause folio (src/ui/50_menu.js): Journey /
  Words / Satchel / Map + Save & Load and Settings utilities; old names
  (journal, log, notebook, guide, items) still open the right page.
  Settings (55_settings.js), dialogue (20_dialogue.js), word help, HUD,
  confirm sheets and cards (10_ui.js), touch pad (engine/10_input.js),
  title + six-slot ledger (30_title.js), four-step creation (40_create.js),
  the prologue's shots (41_prologue_art.js, 41b–41d),
  challenge/pad/lessons/activities/combat (60–80_*.js), Atlas sheets
  (atlas/50_run.js).
- Art: renderer at 2 art px per logical px (engine/60_render.js; hooks
  draw2/anim2/STRUCT2/getArt, legacy x2 adapter, prewarm on door
  transitions; outdoor maps continue past their edges — the "apron" built
  with the static layer — and walled maps keep a surround; the camera is
  never moved by the dialogue, which docks at the top when it would cover
  the player or speaker: 20_dialogue.js dock()); tiles 20–21, props/buildings 26–29 + chapter blocks,
  characters 31–33, portraits 35–36, battle creatures/backdrops 77–79 +
  chapter enemy-art blocks, title scene in 30_title.js.
- Tests added: folio, play_ui, title_ledger, create, learning_ui (in
  run.mjs); visual.mjs (captures + `--check` layout/target/furigana-contrast
  audit, `--lang ja`), art_shots.mjs, perf.mjs, shots_to_docs.mjs;
  tests/unit/ui_contrast.test.mjs.

## Long quest lines (owner's request of 2026-09-29) — REQUIREMENTS.md L1–L7, VALIDATION.md "Long quest lines", docs/STORY.md "Long roads", docs/CONTENT.md §10
- **Content:** everything is in src/content/lq/ (lexicon, data, maps with hooks into earlier maps, and scenes for each line and the letters from home).
- **Test:** tests/e2e/long_quests.mjs. The suite runs `--fixtures-only`; a full run adds `--all-companions`.
- **Ally flags:** `lq_ally1` (Chigusa decides) and `lq_ally2` (the Koharuno lantern) are set here. The companion's battle actions read them (see the combat notes).
- **rw_depart:** closed by `sg.arrive`. The Journey reads an earlier chapter's main quest as completed for older saves.

## Quest guidance (owner's question of 2026-09-29) — REQUIREMENTS.md G1–G6, VALIDATION.md "Quest guidance"
- `RB.questGuide` (src/engine/56_questguide.js) derives where each quest's
  next step happens by walking, against the current state, the scenes each
  world entry point would run (talk options, props, triggers, onEnter,
  foes; `!call`ed scenes included); needs of blocked steps two levels deep;
  reachability through usable exits, doors, fast travel and `!warp` scenes.
  Optional per-stage `hint` / `at` (docs/CONTENT.md §4); the validator checks
  them. API: `analyse(qid, st, {static})`, `targets(qid)` (cached),
  `followed()`, `follow(id)`, `unfollow(id)`, `nudges(qid)`, `nextLines(r)`,
  `wayFrom(r)`, `placeOf(map)`, `mode()`.
- `RB.questMarks` (src/engine/62_questmarks.js) draws the markers, called at
  the end of `drawWorld` (60_render.js); `RB.questMarks.marks()` reports what
  was drawn (tests). `RB.world` now exports `towards`, `linksOf`, `mapsWith`.
- Journey (50_menu.js `guideBlock`, `guideClick`): Follow / Following,
  "Next: …", nudges; Map: the chart marks the followed step. Settings ›
  Learning & Challenge › Quest guidance (`settings.questGuide`: full | hints
  | off; default full). The followed quest is the optional `s.follow`.
- Tests: tests/unit/quest_guide.test.mjs (every quest stage listed with
  `QG_LIST=1`), tests/e2e/quest_guide.mjs (in run.mjs),
  tests/e2e/quest_guide_audit.mjs (whole game, on demand), visual.mjs states
  `journey_guide`, `settings_guide`.
- New quests (e.g. under src/content/lq/): run the unit test; a stage listed
  as missing needs an `at` (or `at: 'open'`); a new kind of target prop needs
  a noun in `PROP`/`PROP_PREFIX` (56_questguide.js).
- Content finding, not changed here: `rw_depart` is never marked done (it
  stays under "Now — the main road" from Chapter 2 on). Guidance ignores it
  after Chapter 1; the fix would be `!quest rw_depart done quiet` in the
  Chapter 2 arrival scene.

## Every kanji on the pad, and the chart (owner's brief of 2026-09-29)
"Expand recognizable drawn kanji to cover every kanji present in the game,
with pages in the chart to cycle lists of kanji by type … the chart option in
battles can have a search" (守る could not be written on Elementary). Details,
method and measurements: docs/RECOGNITION.md ("Coverage", "At scale", "The
chart", "Measured results"); evidence: VALIDATION.md ("Every kanji on the pad").
- Recognizer: all 1,547 displayed kanji + the first 33 (1,548) from KanjiVG
  (src/recog/10_strokedata.js, 185 KiB, generated). The list comes from the
  source (tools/kanjivg/gamekanji.mjs); tests/unit/recog-coverage.test.mjs
  fails when new text brings a kanji without data. Kana-only pads return
  identical results (tools/kanjivg/kanaparity.mjs).
- Readings: src/lang/75_kanjiread.js (generated by tools/kanjiread.mjs from
  the game's furigana and lexicon); RB.answers.kanjiReading covers every kanji.
- Chart: RB.kanjiChart (src/ui/62_kanjichart.js) with RB.kanjiInfo
  (src/lang/80_kanjiinfo.js): pages by theme and by use, search, entries,
  practice; from the pad (battles too) and Words › Kanji chart.
- Regenerate after new text: `node tools/kanjivg/fetch.mjs && node
  tools/kanjivg/convert.mjs && node tools/kanjiread.mjs`, then
  `node tools/build.mjs`. `tests/unit/recog-coverage.test.mjs` names any
  kanji that needs it. After merging other branches, resolve index.html by
  rebuilding it, never by hand.
- Status on the worker branch: unit 3,765/3,765, default browser suite
  30/30, validator no errors (VALIDATION.md).

## Living Company and Discovery addendum (owner's brief of 2026-09-30) — REQUIREMENTS.md D1–D13, VALIDATION.md "Addendum — integrated validation", docs/addendum/
- Built in slices by workers on top of a foundation (docs/ADDENDUM_CONTRACTS.md:
  save namespaces, `RB.company`/`RB.discovery` core, bus events, page registries),
  then merged and integrated here. One record per slice in docs/addendum/:
  `pets.md`, `company.md` (+ `companion_decisions.md`), `endings_pages.md`,
  `fieldweave.md`, `cases.md`, `words.md`; the combined §23 matrix is
  `COVERAGE.md`, with the integration fixes found by testing the merged tree.
- Where things live: engine `src/engine/06_company.js` (core), `37_pets_*.js`,
  `57_petworld.js`, `58_companion.js`, `55_fieldweave.js`, `59_cases.js`,
  `63_bookmarks.js`, `64_creatures.js`; UI `src/ui/52_company.js`,
  `53_company_pages.js`, `54_company_pet.js`, `57_weave.js`, `58_keepsakes.js`,
  `59_casebook.js`, `61_known.js`, `66_words_pages.js`, `85_battle_pets.js`;
  content `src/content/{pets,company,pages,discovery,cases,words}/`.
- Tests: unit `pets`, `company_core`, `company_bond`, `pages_project`,
  `fieldweave`, `cases`, `bookmarks`; browser `pets*.mjs`, `company*.mjs`,
  `addendum_integration.mjs`, `pages_ending.mjs`, `fieldweave.mjs`,
  `mill_road.mjs`, `keepsakes.mjs`, `cases*.mjs`, `known.mjs`, `bookmarks.mjs`;
  `visual.mjs` audits the new pages. All in `tests/e2e/run.mjs`.
- Save compatibility: older saves migrate (namespaces filled, legacy milestones
  rebuilt from verified flags only); nothing is deleted and no New Game is
  needed. No export/import was added.

## Practice, Fishing and Shiritori addendum (owner's brief of 2026-10-02) — complete on this branch; REQUIREMENTS.md PA1–PA8, VALIDATION.md "Practice addendum — integrated validation", docs/practice/COVERAGE.md
- Foundation (c86d615): `s.practice`, the one-session activity controller (`RB.activity`,
  src/engine/09_activity.js), the learning adapter and cooldowns, Words › Ways to practise, the
  Company hook, Practice mementos, device settings, the shiritori rules core. Contract:
  docs/PRACTICE_CONTRACTS.md.
- Merged (Phase G): shiritori engine (banks, audits, opponents, benchmark), the fishing pace clock
  (the only clock in the game, off by default), suite B (letters, proofreading, comparisons; the
  post box in Shino's Post House), the shiritori table and wordplay (records, Company card, the two
  Bond events), suite A (lantern tending, the copying desk, Practice mementos), fishing (three sites,
  nine fish, the stage, notes). Each area's record: docs/practice/<area>.md.
- Checked on the integrated build: unit 7987/0; default suite 57/58, the one failure a gap in the test
  player (a practice activity opened from a scene), fixed in src/engine/99_test.js, after which the
  whole-game run passed. Audits and the 3,600-game benchmark unchanged.
- Not verified: human play, native review, real handwriting, Firefox/Safari/devices, fish captions.

## Battle art, adaptive combat UI and playtest repairs addendum (owner's brief of 2026-10-02) — complete on this branch; REQUIREMENTS.md BA1–BA16, VALIDATION.md "Battle addendum — Phases A and B" and "— Phase F", docs/battle/, docs/BATTLE_ART_CONTRACTS.md
- Phase A (32edf8c, 982c8df): playtest repairs RBN-01 (target-aware tap-to-interact, 50_world.js),
  RBN-02 (prompts name the script they accept; validator check), RBN-04 (truthful heal lines),
  RBN-05 (neutral letter lead), RBN-07 (guided gears example); the reconciliation ledger for RBN-01 to
  -08 (docs/battle/LEDGER.md); the art seams (authored creature poses, creature travel,
  `RB.battleSeq.addDelivery`, the effect registry), the shared contracts and the battle-content
  inventory (docs/battle/INVENTORY.md).
- Phase B (50e44f7, the integrator; docs/battle/PRESENTATION.md): Battle animations Normal / Fast /
  Instant independent of Text speed; the current-action banner (src/ui/82b_battle_banner.js); per-creature
  intent badges and the inspector, Adaptive / Expanded intent display, reading-critical moves named
  neutrally with their wording kept in view (src/ui/82c_battle_intents.js, 80_combat.js); menus that
  withdraw on commitment, inert while away, Keep visible; Skip; fresh-press ownership and focus return;
  Resolve and Harmony visible in every state; portrait phones put the dock above the party slip.
- Phases C–E (five workers, merged e21bf2f, 04ad864, 03cb94a, 6f90736, ba3f4cb): party art (an
  articulated rig, pose library, party choreography `RB.partyChoreo`, word motifs and effects;
  docs/battle/party.md), creatures A (Chapter 1–3 families and the Flour Moth proof;
  creatures_a.md), creatures B (Chapter 4–6 and Atlas families; creatures_b.md), contextual backdrops
  (backdrops.md), pets in battle and overworld parity (pets_overworld.md). Each record has its files and
  APIs, frame standard, pose/timing tables, a self-review against the rubric, cache budget, results and
  limitations. What the merges changed in the seams: docs/BATTLE_ART_CONTRACTS.md.
- Phase F (integrated validation; VALIDATION.md): fixed on the merged build — at large text the banner
  scrolled off the top of a phone and wrapped into the half right of centre, and the stage moved during
  an exchange (the withdrawn menus re-sized behind it; a condition line on a creature's slip); the
  overlay's rows and the withdrawn menus now hold their committed sizes until the menus return.
  Measured: geometry (docs/battle/GEOMETRY.md), rules invariance, the 20-battle cleanup, the §21.5 memory
  budget (37.12 MiB of 48; tests/e2e/battle_budget.mjs). Evidence: recordings in
  docs/screenshots/battle/presentation/ (Normal, Fast, Instant, reduced motion, a 390×844 phone), layout
  stills in docs/screenshots/battle/layout/, each area's folder (index: docs/screenshots/battle/README.md).
- Found, left for the owner: Nao's "missing third floorboard" in rw.warehouse was not drawn (§2.9; the
  line is also quoted by the comparisons item C07) — now drawn (resolved in art, no text changed: see
  "World review" below); learning task
  picks use the page's shared `Math.random`, which world blink timers also draw from, so which item a
  battle task asks about varies with frame timing (no rule uses it); Moth and Lantern is recognised by its
  flame colour because its `artOpts` carry no variant flag (creatures_b.md); creatures are drawn before the
  party, so at contact a moth's near wing passes behind the adventurer it strikes (creatures_a.md).
- Not verified: Firefox (the owner's browser), Safari, a real phone or the foldable, the art judged by a
  person (every rubric is a self-review), a native speaker's review, frame rate on named hardware.
- World review (owner's external review, 2026-10-03; WR-04, WR-05 and two listed checks), art only:
  the four long-quest landmarks redrawn at art resolution (`src/content/lq/15_art.js`: the great
  persimmon of Koharuno, Kayo's young tree, the stone of names, Chigusa's tea stall) with footprints,
  blocking, placements, scenes and use tiles unchanged (recorded before, `tests/fixtures/
  landmarks_before.json`); Masaru's bakery fitted out as a bakery (`src/content/ch5/11_bakery.js`:
  oven, bread rack, kneading bench, flour sacks; Masaru's working place is in front of the bench's
  right end at 3,4, facing up); Nao's missing floorboard drawn and blocking at rw.warehouse 5,5
  (`src/content/ch1/12_floorgap.js`) — resolved in art; the Star Stair path's observatory dome no
  longer cut off at the top (a per-map `headroom`, `src/engine/60_render.js`, set to 2 rows on
  sb.obs_path). Test: tests/e2e/landmarks.mjs (in run.mjs); captures: docs/screenshots/landmarks/,
  docs/screenshots/bakery/ (landmarks_shots.mjs); notes: docs/ART_DIRECTION.md §8. The look is a
  self-review; the owner reviews the art.
- The owner's playtest of 2026-10-02 (Firefox, about 2000 × 1090), answered on this branch
  (VALIDATION.md "Battle playtest round", REQUIREMENTS BA17–BA21): one cadence in every phase (the scene
  had run at half speed once the opening lines closed); Adaptive shows a routine move as its badge only
  (§13.3); each creature's name, knots and conditions on a translucent plate above it with its badge
  (the solid navy slip is gone); no empty panels during the opening lines; the battle art restyled
  toward the owner's reference by three workers (party, creatures A with the Flour Moth and the Mill
  Echo first, creatures B) — records in docs/battle/party.md (round 2), creatures_a.md ("The restyle
  round"), creatures_b.md ("Restyle round"); evidence in docs/screenshots/battle/*_restyle/.
- The full-game matrix with both addenda in ran after both were complete, as the owner asked:
  16/16 whole-game runs, layout audit clean (VALIDATION.md "Full-game matrix — both addenda").
  What remains is by hand (Next concrete actions, item 10).

## Prologue (owner's report of 2026-10-03) — complete on this branch; REQUIREMENTS.md PR1–PR5, VALIDATION.md "Prologue round", docs/ART_DIRECTION.md §12
- **The report:** the prologue's panels were flat blocks beside the title scene's pixel art. In the last shot the traveller walked up from the screen's centre, beside the river and at full size; on a phone the caption slip hid them.
- **The traveller now walks the road (`src/ui/41_prologue_art.js`):**
  - The walk starts just above the slip and follows the road's centre (`RB.ui.title.roadGuide`) toward the horizon at a steady pace.
  - The figure shrinks with distance, using the real walk frames shrunk onto the same grid, night-graded and lit by the lantern they carry.
- **The four flat shots are redrawn with the pixel kit:** the teahouse twice (41b; Hana's own portrait), the riverbank lantern whose name leaves it (41c), and the broken bridge in the morning (41d).
- **Tests and evidence:**
  - `tests/e2e/prologue.mjs` (in the default suite) checks the pixel under the traveller's feet at every moment, at four screen shapes.
  - `tests/e2e/prologue_shots.mjs` writes docs/screenshots/prologue/after/; before/ is the previous build.

## Town animals (owner's reports of 2026-10-03) — complete on this branch; REQUIREMENTS.md TA1–TA5, VALIDATION.md "Town animals"
- **Idle:** at rest, animals breathe and keep their tails moving — your pet, the not-yet-met animals, and
  Mochi (`life` in `src/engine/57_petworld.js`; one short cycle per species, so the frames repeat).
- **Mochi's look:** she is drawn with the pets' rig like every other cat (`RB.petWorld.actorFrame`; her look
  `cat/mochi`).
- **Mochi's path:** picked up, she no longer walks off to the nearest door (Kōji's house); given back, she
  appears beside Tomo. This uses the npc options `leave: 'here'` and `arrive: 'here'` in
  `src/engine/50_world.js`.
- **Her line at home:** it follows the hour (`rw_night`).
- **Test:** `tests/e2e/town_animals.mjs`, in the default suite.
- **Case props:** the props of the two cases (Hama's workbench and the call bell on the Saltglass quay, among
  others) are redrawn at art resolution (`src/content/cases/06_art2.js`).
- **Pet looks in the sprite functions:** `RB.sprites.getArt` and `get` accept a pet look (Mochi's) and return
  the rig's animal on the standard frame, so anything that asks for a character by look gets the same cat.

## Lines in the dark; the tide-watcher's window (owner's reports of 2026-10-03) — REQUIREMENTS.md IN1–IN4, VALIDATION.md "Interludes", docs/ART_DIRECTION.md §13
- **The report:** choosing to wait with Shiori faded to black. Its lines could be advanced but not read: the fade
  covered the dialogue sheet, and it does so in every scene that speaks in the dark (nine).
- **The fix in the fade (`src/ui/10_ui.js`, `50_play.css`):** `body.veiled` from the moment the screen darkens until
  it has cleared. The sheet, its replies, History and dialogs stay above the black.
- **Interludes (`src/ui/42_interlude.js`):** `!interlude <id> [stage]` / `!interlude -` puts a picture in place of the
  map while the lines go on. It is cleared at the scene's end, and the validator and quest guide know the op.
- **The tide wait (`src/ui/42b_interlude_tide.js`, `sg.tide_wait`):** the view from Shiori's window as the tide
  goes out. The sand road comes up, then the fog sits on it; the room comes back for her worry.
- **Genzō's climb** now arrives on its own map, `sg.lighthouse_top` (see "The top of the lighthouse" below).
- **Faded passages still to fill** where darkness is a shortcut, not the intent: docs/expressive/SHOTS.md §7b
  (ledger HX71).
- **Test:** `tests/e2e/interludes.mjs`, in the default suite. Evidence: `tests/e2e/interlude_shots.mjs` →
  docs/screenshots/interludes/.

## Suzu's Kansai-ben (owner's requests of 2026-10-03) — REQUIREMENTS.md KS1–KS5, VALIDATION.md "Suzu's Kansai-ben", docs/dialect/suzu_kansai.md
- **What:** an optional Kansai version of every line of Suzu's (896), in Japanese and in re-voiced English, chosen
  when she joins, in Settings, or on her Company page ("Talk with Suzu"). It is the global setting
  `settings.suzuSpeech`; nothing is written into a campaign.
- **Mechanism:** `src/lang/85_dialect.js` swaps a line at display time (dialogue, History, kept sentences, fishing,
  shiritori, Company). The tables are in `src/content/dialect/` and the choice UI in `src/ui/56_suzu_speech.js`.
- **Inventory:** `tools/suzu_inventory.mjs`; the validator fails on any line of hers without a version. A new
  table of her words must be added to the inventory.
- **Tests:** `tests/unit/dialect_kansai.test.mjs`, `tests/e2e/dialect_kansai.mjs` (default suite).
- **Open:** a native speaker's review. Found in passing: `src/content/ch1/31_scenes_mill.js` has
  `{少|すこ}なくとも`, which should read すくなくとも.

## One battle at a time (owner's reports of 2026-10-03) — REQUIREMENTS.md BO1–BO5, VALIDATION.md "Battles one at a time"
- **Causes:**
  - A creature still touching you during a battle's closing fade started a second battle, and the first's teardown
    then broke it.
  - Contact was checked against a stale mode.
  - Scene ends put creatures back on their starting tiles.
- **Fix:**
  - `RB.game.startBattle` refuses while a battle is open or closing (`RB.game.inBattle()`), and win handling runs
    while the screen is dark (`opts.closing` in `src/ui/80_combat.js`).
  - `canEngage()` and `RB.world.hush` in `src/engine/50_world.js`; creatures you stepped back from back off and stay
    calm; `refreshActors` keeps creatures in place.
  - The frame loop survives errors.
- **Test:** `tests/e2e/battle_overlap.mjs`, in the default suite.

## The top of the lighthouse and the view from height (owner's reports of 2026-10-03) — REQUIREMENTS.md LH1–LH3
- **The map:** `sg.lighthouse_top` (src/content/ch2/10_maps.js; props in 01_art.js; scenes in 22_scenes_tide.js).
  Genzō is moved by `sg_genzo_up` while the screen is dark.
- **The view from height:** `src/engine/61_below.js` (`RB.below`) draws the real ground map small under an
  elevated deck: `surround: { below, at, hide, scale, drop, shaft, … }`. It is used by the lighthouse top and
  `co.lookout`. Views are cached (at most 2) and released on leaving.
- **Test:** `tests/e2e/lighthouse_top.mjs` (default suite; `--slow` runs it with a slowed game clock).

## Zone music (owner's requests of 2026-10-03) — REQUIREMENTS.md ZM1–ZM3, docs/AUDIO.md
- **The score:** each chapter's songs are in `src/audio/31_songs_ch2.js` … `36_songs_atlas.js`, and the zone map in
  `39_zones.js`. `RB.audio.battleSong` picks a fight's theme by zone; the instruments are in `10_synth.js`.
- **Tests:** `tests/unit/audio_zones.test.mjs` (intensity rises), `tests/e2e/audio_instruments.mjs`,
  `audio_zones.mjs`, `audio.check.mjs`.
- **Owner's ear (2026-10-04):** Saltglass, its coast road and its battle theme had a harsh, deep "crashing wave" in
  them. The cause was the shakuhachi's breath (down to 50 Hz) and the 3 s reverb's dark tail after hard attacks.
  Fixed in the instruments and the room, so every chapter's music changes (Chapter 1 within 0.15 dB): see
  docs/AUDIO.md. The owner will report anything else that sounds off in music not yet heard.
- **Second listen (2026-10-04):** the shakuhachi's breath was still a "hissy, steamy puff", so the instrument is now
  played clean. The town's flute was a little loud. A harsh "rhythmic droning drum" ran through the town theme,
  most likely the shamisen chord strokes (each string now has its own sawari clipper); the bass is the other
  candidate. The owner has a parts-by-part file to name it if it remains. The owner allows "only a handful more"
  attempts at this music, so keep changes targeted and send before/after clips each time.
- **Open:** if a phone struggles, thin the Chapter 5–6 battle and boss themes first.

## Settings in battle (owner's request of 2026-10-03) — REQUIREMENTS.md BS1–BS4, VALIDATION.md "Settings in battle"
- **The sheet:** `src/ui/55_settings.js` opens the folio's Settings in a battle mode, with an allow-list of
  presentation settings. `RB.battleSeq.pause()` (src/ui/82_battle_seq.js) stops the animation clock while it is
  open. The audit table is in docs/COMBAT_NOTES.md, "Settings in battle".
- **Saving:** `src/engine/80_save.js` refuses every write of the playing campaign while `inBattle()`; autosave
  counts the skip.
- **Leaving:** Load and Return to title ask first. The campaign change runs `RB.combat.abandon()`
  (src/ui/80_combat.js); every await in a battle goes through `live()`, so nothing of an abandoned battle is
  written. A load that does not happen calls `keepJourney()` (src/engine/90_game.js).
- **Test:** `tests/e2e/battle_settings.mjs` (default suite).

## Harmony busts, painted (owner's review of 2026-10-03) — REQUIREMENTS.md HB1–HB2, docs/harmony/ASSET_BRIEF.md
- **Why:** the owner judged the code-drawn busts far below their mockup. The busts will be painted with the owner's
  image tool and integrated behind the same `RB.harmonyArt` API.
- **What exists:** the brief (docs/harmony/ASSET_BRIEF.md) and the reference sheets and templates in
  docs/harmony/asset_brief/ (`node tests/e2e/harmony_asset_refs.mjs`). The owner also has a published page with
  a prompt builder.
- **Contract v2, machine side (built 2026-10-03; REQUIREMENTS.md HB3–HB8; VALIDATION.md "Harmony painted art — contract v2"):**
  - The authority on formats is docs/harmony/contract/CONTRACT.md; its data is `RB.harmonyContract`
    (src/ui/88_harmony_contract.js), which the importer also loads. Bust 192 × 160 (companion turned right, player
    turned left), pair 352 × 160 (compact 248 × 128), states prep_a, prep_b, cue, peak, settle_a, settle_b with
    `timeline(comp)`, layered player kit with masks, key ramps (skin key now orange; hair and trim s0 darker).
  - `node tools/harmony_registry.mjs` → docs/harmony/contract/registry.json (86 required + 33 optional asset keys).
  - `node tools/harmony_import.mjs <inDir> [--check]` (+ `--verify assets/harmony`): incoming batches go in
    art/harmony/incoming/<batch>/ (ignored, not committed), normalised files in assets/harmony/, which the build embeds.
  - Runtime: src/ui/88_harmony_raster.js behind `RB.harmonyArt`; with nothing installed the code busts are
    pixel-identical and `PHASES` is ['enter', 'hold'] with no `timeline`.
  - SYNTHETIC sample (not art): tests/fixtures/harmony_sample/ (`node tools/harmony_sample.mjs`), evidence in
    docs/screenshots/harmony/raster_sample/, budgets in CONTRACT.md §10.
  - docs/harmony/ASSET_BRIEF.md (the lead's) still describes v1 (enter/flourish/hold/blink, player facing right,
    old skin key): it must be rewritten to the contract before the artist starts. The templates and palette sheet
    in docs/harmony/asset_brief/ are already regenerated from the contract.
- **The overlay worker** was told to read sizes from `NATIVE`/`fitScale()` only, to treat the phase list as
  data and to use `timeline()` when it exists (its src/ui/82d_harmony_cutin.js is not on this branch yet).
- **Four-tile companion sheets (2026-10-04):** Robin's 2 × 2 Suzu sheet was redrawn in code as a seven-frame
  sequence (four tiles + three in-betweens; renderer in the session scratchpad, not committed; the sheet itself is
  Robin's and never committed). For Nao, Mio and Ren: prompts in docs/harmony/asset_brief/four_tile/PROMPTS.md and
  reference pages `ref_four_tile_<name>.png` (`node tests/e2e/harmony_four_tile_refs.mjs`). Waiting on Robin's sheets.
- **The owner's Art Direction Correction (2026-10-03)** is kept verbatim in docs/harmony/ART_DIRECTION_CORRECTION.md and wins over
  every earlier Harmony directive. docs/harmony/DIRECTIVE_RECONCILIATION.md lists the agreements, the nine conflicts (C1–C9)
  and their resolutions, and the open points. The brief is v3; contract v3 (REQUIREMENTS.md HB9) is being built by a worker.
  Labels: the code busts are **provisional artwork**; a delivered batch is a **visual candidate awaiting approval**.
- **Never commit** the owner's mockup images.
- **Portrait timing, Robin's decision (2026-10-05; REQUIREMENTS.md HB10, VALIDATION.md "Harmony portrait timing — Robin's
  decision"):** Normal 220 / 820 / 360 ms (1.4 s) with a small motion (3 art px overshoot, 2.5 lean at the peak, 1.5
  drift; placement keeps that reach clear); Fast 180 / 380 / 220 ms of wall time (Normal's old timing, no motion); the
  technique's stage waits for the portrait (`84p_party_choreo.js player()`: first result ≥ 120 ms after it; Normal
  waits Nao 220, Mio 270, Ren 320, Suzu 240 ms); no cue and no wait with the setting Off or at Instant. A seventh,
  optional state `cue_b` (contract `TIMELINES` per mode; importer accepts `<comp>_cue_b`). No art imported.
- **Harmony art status (2026-10-05):** Robin approved the code-drawn seven-frame cut-ins of Suzu, Nao, Mio (frame 5
  redrawn from Robin's revised tile) and Ren; they live outside the repo until they are imported (not yet). The
  player's kit is next, drawn in code from nine reference sheets: prompts in
  `docs/harmony/asset_brief/player_kit/PROMPTS.md` (ASSET_BRIEF.md §8 note). Robin makes Sheet 1 first.
- **Player kit progress (2026-10-05, overnight):** all nine sheets arrived and passed Robin's eye test (Sheet 9 with the
  sash corrected to run from the near shoulder down-left over the strap). Robin's decisions: the game's ponytail is
  Sheet 1's loose mane; the coat keeps fitted sleeves; Robin's hand standard (no "rounded shapes placed on a blob":
  constructed fingers, warm creases, never the dark outline inside a hand) applies to every hand.
  - Look A (Batch 1a: four heads, coat, five fitted brush arms, ponytail back and front, glasses, flower, satchel) is
    drawn in code, keyified, and passes the importer's check, import and verify and an eight-look recolour proof.
    **Robin approved look A on 2026-10-05** (with Nao's rebuilt hands, the previous version kept for comparison).
  - Sheets 2–9 are registered (46 tiles, ≤ 1.7 art px landmark error) and measured in the player's canvas (hat band
    y 41, cap band y 46; per-hairstyle mount offsets measured or placed by eye and corrected by the integration proof).
  - The rest of the kit (Batches 1b–4: 11 hairstyles, the robe and eleven wide-sleeve arms, tunic/apron/dress and the
    six pairing arms, 13 accessories) is drawn in code by five groups and integrated: 72 kit files + the four
    companions' frames keyify, import (`--check`, `--verify`) and cover the registry (86/86); the game's own runtime
    painted 2,681 busts (every hairstyle × cut × state × pairing, every accessory) with 0 errors. A fix round by six
    workers took the proof's defects from 147 groups (70 major) to 23 (1 major: a 3-px speck already in approved look
    A); bald scalp 0; hats cut nothing flat. The neck gap other styles showed (the ponytail always covered it) is
    closed by raised collars on tunic/apron/dress/robe and nape hair in each style's back file (shaved's in its new
    optional back file); look A is unchanged. A review page (build any look, watch the paired cut-in at Normal) went
    to Robin on 2026-10-05 with the known weak points.
  - **Robin's review of the kit (2026-10-05)** led to two more rounds, both done outside the repo:
    - **Motion:** settle_b was settle_a and the player looked stiff next to Suzu, so the player now has in-between
      heads (prep_b, cue_b, settle_a), arms per pairing (cue_b, settle_a), hair motion for 11 styles and a body arc
      (contract support: REQUIREMENTS HB13). Ren's peak arm no longer folds the elbow in.
    - **Neck:** the neck was redrawn as a proper column with the collar's back behind it (look A's heads and coat
      collar changed at Robin's request), collarbones on the dress, the nape patches removed, the cape drapes over
      the dress's puffs, and the hair rim recolours with the hair.
  - The review page was republished (version 2), with every pairing's seven frames and the neck before and after.
  - **Junction round (Robin's direction, 2026-10-05/06):** the head layer drew the whole neck over every torso's
    neckline (rows 83–116, 459–534 px painted over), so garments could never overlap the neck base. Fixed within the
    contract: the head keeps a short neck stub under the jaw; every torso is built on one shared body base (shoulders,
    neck base) with the rear collar behind the neck and the front edges over its base; the satchel strap was moved
    across the far shoulder. Kit proof unchanged (2,681 busts, 0 errors, 1 major = look A's speck). Review page
    version 3 with 1× and 8× before/after.
  - **Approved and imported (2026-10-06):** Robin: "The new Harmony pass I would consider finished." Source
    art/harmony/source/full_v1/ → assets/harmony/ (regenerates byte for byte), embedded in index.html (12.7 MiB).
    The shipped game paints the cut-ins with the approved art; the code-drawn busts remain the fallback.
  - **Checked (2026-10-06, VALIDATION.md "Checks on the approved art"),** by the clarified cadence:
    - Foundations campaigns with all four companions 4/4; staging 13,850/0; layout audit 535/536 + 201/201; save
      loading in both modes; the art from `file://`; battle_party, battle_anim and harmony_cutin all passing.
    - **Fixed on the way:**
      - The sequence buttons were 40 px on landscape phones, from before the import; now 44 px.
      - Ren's Lantern Ward started 20 ms after your brush. Robin's decision: Ren's performance moves 120 ms earlier
        and now leads by 100 ms.
    - **Added:** the credit "Project Development: Robin Amaral" (About & credits, and the end card).
    - **Not run, by the cadence:** the E, I and A campaigns and the rest of the default suite's second half.
  - Robin also shared a discussion-only expansion note (future ideas, explicitly not authorised); reviewed in chat,
    stored in docs/future/EXPANSION_CONTEXT.md, no work started from it.
  - **Hat rule changed (lead, 2026-10-05; CONTRACT.md §6, VALIDATION.md "Hats hide hair above their own top
    edge"):** a hat or cap hides hair only above its own top edge in the columns it covers (was: every hair pixel
    above the band row, which cut twintails and wide styles flat), and the edge hidden hair leaves over background
    closes with the outline ink. `pc.hatBand` stays the scalp-cover line the importer checks.
  - These working files live outside the repo; nothing of the kit or the cut-ins is committed until Robin approves
    and the art is imported (art/harmony/source/<batch>/ per ASSET_BRIEF.md §10).

## Overworld actor system: poses, gestures, mannerisms, idle life, scene direction (expressive addenda, work packages D and (a)) — CONTRACT.md ledger HX28–HX38, WI1–WI24; VALIDATION.md "Overworld actor system"
- **Where:** pose layer `src/engine/32g_spritepose.js` (hooks in `32_spriteart.js`); gestures `51_gestures.js`;
  profiles `51_mannerisms.js` + `src/content/mannerisms/10_cast.js`; scheduler and scene cues `52_staging.js`
  (renderer hook in `60_render.js drawActor`, tick in `50_world.js update`); ops `!gesture !look !pose !walkto !prop
  !beat !ambience` in `70_script.js` (validator, quest guide); dev viewer `src/ui/44_actor_dev.js` (`?dev=actors`).
  Design and legibility per primitive: docs/expressive/GESTURES.md §9.
- **Staged:** `sg.omi_wataru` (both routes; the beats `omi.pivot.begin`/`end` mark where the illustrated close-up
  goes), `rw.hana_first`, `co.suzu_night` (the night line over the room), `sb.yae`, `lf.mio_refuse`, `sa.isamu_return`,
  `co.hiro_first`. Practice B's reference into `sg.omi_wataru` moved to command 34 (same hash).
- **Tests:** unit `tests/unit/actors.test.mjs`; browser `tests/e2e/actor_life.mjs`, `actor_workplaces.mjs`,
  `staging_wataru.mjs`, `staging_chapters.mjs` (all but actor_workplaces in run.mjs; that one watches five
  workplaces 45 s each and runs on its own). `--video` on actor_life / staging_wataru writes clips.
- **Every performed scene staged (2026-10-03/04):** Chapters 1–2 (96), 3–4 (113), 5–6 (126) and the misc folders (112: long quests,
  cases, Pages, pets, Company, the Atlas, shiritori). Decisions in tools/scene_curated_{ch12,ch34,ch56,misc}.mjs; play them with
  `node tests/e2e/staging_chapters.mjs --ch=1…6|misc|showcase [--only=<scene>] [--branches]` (the runner fails on any shared tile).
  Every staged gesture is checked against the mannerism profiles by unit conversation_continuity.
- **Illustrated sequences (2026-10-03/04):** RB.sequence (src/ui/43_sequence.js; API in SHOTS.md §0.1) with the prologue on manual
  advancement and sequences for every chapter (43a–43f) plus Ren's §8 insert; all eight faded passages handled. Tests:
  sequence_manual (--quick in the default suite), sequence_chapters (Ch3–4), sequence_chapters_56 (Ch5–6), sequence_dev.
  Nobody has reviewed the art yet: that is the owner's.
- **The sequences against the world, and scenes under the conditions of play (2026-10-04; HX52, HX68):**
  `tests/e2e/sequence_world.mjs` checks every registered sequence by name against the world (who is drawn, who stays
  or left, hand-overs, the ways on, branches, what each shot depicts); `tests/e2e/staging_variants.mjs` starts staged
  scenes through the world (other sides, taken tiles, absent versions, interrupted, a held key, repeat, revisit). Both
  `--quick` in run.mjs. Fixes they found: behind a sequence a `!refresh` places people at once (50_world.js; the
  bridge scene's Kōji and Hana); your following companion makes way for your own staged walk (52_staging.js makeWay).
- **Left for later:** game-wide per-scene staging of the manifest's other "Performed overworld" scenes; Masaru's
  kneading waits on the bakery props (TODO in his profile); the portrait worker reads `RB.mannerisms.of(id).portrait`.

## Props balance and the look-and-feel ledger (paired addendum WI18, WI19, WI25–WI28; merged 2026-10-03) — VALIDATION.md "Props balance…"
- Prop options live in src/engine/28_propwork.js (kiln `glass`/`litIf`/`embers`/`ash`, sparkle `faint`, lamp `flick` vs `flickLively`,
  table/desk `on`); map files set them. Light pools breathe per position (60_render.js drawLighting).
- docs/expressive/REVIEW.md is the current ledger; docs/expressive/reports/props_review.md is the record.
- tests: e2e props_balance.mjs (default suite), unit conversation_continuity (fails on a staged gesture outside the person's
  profile: add it to the profile or to KNOWN with a reason) and portrait_speakers.
- Open: look-alike pairs (Tamae/Yae, Ōmi/Umi; owner decision), Asahi's heat habit by a cold furnace, story-state idles.

## Commands
- Build: `node tools/build.mjs`
- Content validation: `node tools/validate.mjs [--filter sg] [--unknown]`
- Unit tests: `node tests/run-unit.mjs [filter]`
- Browser: `node tests/e2e/story_ch1.mjs [F|E|I|A] [nao|mio|ren|suzu]`,
  `node tests/e2e/story_ch3.mjs [prof] [comp]`, `story_ch4.mjs [prof] [comp] [stay|go|both]`,
  `story_ch6.mjs [runIndex 0-4]`, `node tests/e2e/atlas.check.mjs`,
  `story_ch5.mjs [prof] [comp]` (driven through the world by tests/e2e/drive.mjs),
  `node tests/e2e/systems.mjs` (fast travel, step back, bosses, defeat),
  goal pursuit (whole game from a new campaign by default):
  `node tests/e2e/pursue.mjs [prof] [comp|none] ["flag@prefix@mainQuest>…"] [map x y] [flags] [words]`,
  random explorer: `node tests/e2e/explore.mjs <map> <x> <y> <flag[@prefix][>…]> [comp|none] [prof] [seed] [maxActions] [flags] [words] [mapPrefix]`,
  `node tests/e2e/ui.mjs [filter]`, `node tests/e2e/audio.check.mjs`,
  screenshots: `node tests/e2e/shot.mjs out.png "<js>" [ms] [WxH]`.
- Interface/art review: `node tests/e2e/visual.mjs <outDir> [--vp 390x844,1280x800] [--only a,b] [--lang ja] [--check]`
  (synthetic fixtures; `--check` audits overflow, clipped text, touch targets
  and furigana contrast), `node tests/e2e/art_shots.mjs`, timing
  `node tests/e2e/perf.mjs [--html file] [--vp WxH] [--dpr n]`, docs images
  `node tests/e2e/shots_to_docs.mjs <beforeDir> <afterDir>`.

## Next concrete actions
1. Human play-testing: handwriting with real learners, pacing/playtime, and a
   native-speaker review of the Japanese (content in src/content/*/).
2. Real-device pass of the overhaul (everything so far is headless Chromium
   with emulated touch and an emulated software keyboard): a phone in
   portrait and landscape (tabs, move pad, word-help sheet, creation with the
   real keyboard, handwriting pad), frame rate on a mid-range phone, and
   Firefox and Safari/WebKit (not installed here, not tested).
3. A human look at the art (docs/screenshots/, `art_shots.mjs`) — quality
   was judged only by the author from captures.
4. Listen to the new boss theme (checked at signal level only) and play a
   few battles with a companion to judge the Harmony notes and keyword
   cards; try the pad's kanji reading with real handwriting.
5. In Firefox, the owner's browser: click Next after a battle, and watch the
   new battle presentation and figures. Only Chromium is installed here.
   Decide on Harmony charges (docs/COMBAT_NOTES.md). Play a few group
   battles (Standard and Demanding, the Stacks and the Conduits) and judge the
   companion's turn by hand; only headless Chromium has played them.
6. The owner's report of 2026-09-29, to be checked by hand:
   - the title screen (the inn's doorway, the flat folio, the sky) on the
     foldable and in Firefox;
   - the long quest lines' pacing, played across chapters;
   - whether quest markers help the right amount or make it too easy
     (Settings › Quest guidance can turn them down);
   - the kanji chart's themes (keyword-based; about 1 in 12 is debatable);
   - 守る and other kanji written by real hands (the accuracy figures are
     synthetic).
   The battle recording docs/screenshots/battle/play_moth_outside.webm
   predates the companion's turn; `tests/e2e/battle_video.mjs` re-records it.
7. Optional polish found in review: lexicon part-of-speech warnings between
   chapters (validator warnings), observatory dome sprite clipped at the top
   of sb.obs_path (cosmetic), credits are a single card.

8. The addendum (2026-09-30), by hand: meet an animal and watch it follow and
   react in battle; play a puzzle two ways; try a case without help; finish the
   game with a committed companion and a pet and read the ending extension; one
   Atlas outing of The Pages We Keep. Only headless Chromium has played any of
   it, answering through the solver. A native speaker should read the new
   Japanese (src/content/{pets,company,pages,discovery,cases}/).
9. Found, left alone: Snowbell's tone-1 morning lines never play
   (docs/addendum/companion_decisions.md); the arrival place label can sit over
   a folio opened at once.
10. The battle addendum (2026-10-02), by hand, in Firefox and on the foldable
   (folded and open): a few battles at Normal, Fast and Instant, with and without
   reduced motion; open a badge by hover, focus and tap; watch the banner and the
   menus withdraw and return; try 140 % and 200 % text; turn or unfold the device
   during an exchange. Judge the new party, creature and backdrop art (the rubrics in
   docs/battle/*.md are self-reviews). After the playtest round: does the scene keep its pace once the
   opening lines close; do the plates above the creatures read well over each backdrop; is the restyled
   art (start with the Flour Moth and the Mill Echo) closer to the reference — the workers list what is
   still short of it (the crane and clerk stay fairly frontal; an 80 × 104 party figure cannot carry the
   reference's detail density).
11. The prologue (2026-10-03), in Firefox and on the foldable: watch the six shots through once (New
   Game → a slot). Does the traveller read as walking up the road into the distance? Do the teahouse,
   the riverbank lantern and the bridge sit with the title scene? Try reduced motion and a phone held
   sideways (the slip covers most of the road there, so that walk is short). Every judgement of this
   art so far is a self-review.
12. The town animals (2026-10-03), by hand in Firefox: stand by your pet and by Mochi for a while (they
   should breathe and move their tails, then sit and curl up); pick Mochi up (A Cat Called Mochi) and give
   her back to Tomo by day and at night.
13. The tide wait (2026-10-03), in Firefox and on the foldable: talk to Shiori at the tide table in Saltglass and
   choose to wait. Watch the tide go out over the lines, the road come up, the fog settle; then a scene that speaks
   in the dark (Genzō's climb) shows its line over the black.
14. Suzu's Kansai-ben (2026-10-03): a native Kansai speaker should read her lines, starting with her emotional
   high points (docs/dialect/suzu_kansai.md lists what to check first); the owner can switch it on and off on her
   Company page.
15. Settings in battle (2026-10-03), in Firefox: open the sheet mid-exchange (C or the button), change text speed and
   motion, close it, and check that the exchange continues. Try Load and Return to title from a boss. The other-tab Cancel path is
   untested.
16. Harmony busts (brief v3, docs/harmony/ASSET_BRIEF.md; the owner's correction wins): merge contract v3 (HB9). When Batch 1a arrives,
   put it in art/harmony/incoming/batch1a/, run `node tools/harmony_import.mjs art/harmony/incoming/batch1a --suggest`, fix what the
   report lists (masks, offsets in import.json), import, build, then show it as a visual candidate: the peak at in-battle and native
   size, the animation, a real battle at Normal, Fast and reduced motion, particles on and off. Only after the owner approves: Batch 1b,
   then 2–4. Re-measure the budgets on real art (CONTRACT.md §10). Open points for the owner: ASSET_BRIEF.md §11 (point 1 settled: the ponytail is the owner's character's hairstyle).
   The owner took the two folders as ZIPs on 2026-10-04 and is making Batch 1a.
   **Done since:** the art was drawn in code from Robin's sheets, approved and imported on 2026-10-06 (HB1, HB2); the
   budgets were re-measured on it the same day (VALIDATION.md "HX59, HX66, HX67 and HX70 on the approved art").
17. The owner's notes of 2026-10-04 (VALIDATION.md "The owner's notes of 2026-10-04"):
   - The four Harmony stage performances, Nao's and Mio's v2 included, are approved as they are: "keep steady". Mio's
     stream keeps its weight.
   - The desktop dialogue portrait is back to 116 px. That was the owner's choice, made after trying 96.
   - The Saltglass "crashing wave" is reduced at its source. That source was the shakuhachi's breath and the reverb's
     low tail. The owner will say if other zones' music sounds off.
   - The music's second round (a clean shakuhachi, the town rebalanced) was "a marked improvement - 10/10".
   - The Chapter 2 reworked scenes and illustrated moments need no wait for the owner. They will replay from the start
     once the Harmony and World Idle Life passes are done, so the lead's judgment stands until then.
18. The four world findings of the Chapters 5–6 staging pass are fixed (2026-10-04; VALIDATION.md "Four staging
   findings fixed"). A scene's own `!move pc` now brings your companion along (they follow, or step aside when you walk
   back onto them), with staging on or off. A speaker walking in is never given a place someone else is still walking
   to. `lf.water_returns` steps you back off the flooding row itself. The dog's corner in Cinder Orchard is faced from
   a gap in the reeds below it (32,27). By hand, in Firefox: the dog's yard (does the gap read naturally?), and the
   Lanternfall epilogue's townspeople gathering round you.
19. Wave 3 (2026-10-04, while the owner's image tool paints Batch 1a), merged:
   - **Portraits** play each person's shared actor profile (WI13).
   - **The cut-in** waits for withdrawn menus on phones and tablets. It tries the layout with the larger faces first:
     100-px faces at 1440 and 1600 wide.
   - **Pronouns:** Nao and Ren are they/them in docs and comments, and in two player texts.
   - **The staging fixes** of item 18.
   - **HX52:** every sequence is checked against the world by name (`sequence_world.mjs`).
   - **HX68:** staged scenes are started from other sides, with taken tiles, absences, interruptions, repeats and
     revisits (`staging_variants.mjs`). A companion blocking your only way round now makes way. Kōji and Hana are
     placed at once when the bridge sequence returns to the world.
   - **HX66 was paused at the owner's request** until the painted busts arrived; done on 2026-10-06
     (harmony_appearance 75/0).
   - **Two small rules kept, by the lead's judgment:**
     - when you stand on Umi's place at the ferry office, she stays put and hands the log across a one-tile gap,
       which is the general rule for a taken place;
     - a person can stand over a pet for a split second before it steps aside.

## Known issues / limits
- No human handwriting samples tested (synthetic + font-derived only).
- Playtime not measured.
- Japanese content has not been reviewed by a native speaker.
- Overhaul: validated in headless Chromium only (touch and keyboard
  emulated); no real phone, Firefox or Safari; phone performance and battery
  not measured. Entering a map now builds about 4x the pixels of before
  (hidden behind the door transition; see VALIDATION.md timings).
