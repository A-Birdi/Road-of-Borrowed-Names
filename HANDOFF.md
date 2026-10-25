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
    (digest: docs/future/plan/AC1_ART.md). P18 (the full matrix, any release) still waits for Robin. **C-84 (Robin, 2026-10-11): the twelve-chapter edition ships in the build**: new journeys are twelve-chapter;
    an old six-chapter save explains its fresh start first and begins New Game+ only if accepted ("Not now" leaves it
    byte for byte); the development switch is gone. **C-85:** the twelve-chapter campaign shown playable in the shipped build first, then VA-1, then the full test
    matrix (not before). **C-86 (Robin, 2026-10-11): light and shadow on every map** (the World Proof's light, cast
    shadows, atmosphere and ground dressing are the game's look on every outdoor map, each region under its own sun;
    rooms lit by their windows, lamps, candles, hearths and stoves; a slightly wider outdoor view only where a screen
    allows; Settings → Display → "Light and shadow" for the flat picture): `src/engine/65_worldlook.js`,
    `66_worldkit.js`; tests `tests/e2e/world.mjs`, `tests/e2e/world_light.mjs`; captures for Robin
    `docs/screenshots/light/` (`tests/e2e/light_captures.mjs`). Done before VA-1, as Robin asked; after it, the
    twelve-chapter chain and the complete browser run are redone on the lit build. **C-87 (Robin, 2026-10-12): the
    Living World across the journey, then "shipped live"** (Astra's LW-1 audit confirmed: the engines were built but
    the journey hardly used them). Order: the Living World rollout and the test-suite reconciliation; the complete
    browser run; P17's closure (speed, the final review set, the night sweep); VA-1; then, with everything in the
    plan accounted for, the full matrix (P18) as a last sweep for holes; only when all of it passes, the hosted
    playable page's `index.html` is updated (nothing merged or deployed before). Register and status:
    `docs/future/work/LW1_ROLLOUT.md`; the region brief: `docs/future/work/LW1_AUTHORING.md`; content in
    `src/content/zzz_living/` (helpers `05_author.js`; the work assignments `00_work.js`; Reedwake `10_rw.js`,
    `11_rw_world.js`; the other regions' files; the exploration actions in `src/content/zzz_verbs/`). Done: the work
    performances in ordinary play (LW-01/02, 47 people), sightings only in view (LW-08), a moved same-id placement
    walks (LW-09), every region's routines, askers, change beats, road events and return keys (LW-03…06: 16 towns),
    the exploration actions at every place the plan names (LW-07: 19 instances), the language self-review of every new
    line by region and the word-help fixes it called for (`src/lang/20_jp.js`), the eight browser suites the complete
    run had failing (title_ledger, pages_ending/atlas_board, dialect_kansai, long_quests, practice_a_desk/layout,
    fishing, harmony_appearance, pets: two were real bugs, the Atlas board hiding Nao's wall card and Kōji's boat
    hiding the long road's fare). Tests `tests/unit/living_world.test.mjs`, `tests/e2e/living_world.mjs`,
    `tests/e2e/verbs_journey.mjs`, `tests/unit/word_help.test.mjs`. Since then: the ledger entries, the font subsets
    and the recognizer done; the full unit run 54,681/0; the Keepers' Road's biwa reworked twice on Robin's ear (the
    storyteller's biwa, `I.biwa_tale` in `src/audio/10_synth.js`: an accent is a harder bachi stroke, the voice a
    fifth softer; Robin: "All the alterations on those tracks pan out better") and the final boss theme rewritten as
    its own piece (Robin: "great"; docs/AUDIO.md); sequences on landscape phones keep their picture
    (`src/styles/51_sequence.css`); HX52 specs for the 34 expansion sequences (`tests/e2e/sequence_world_p16_*.mjs`)
    and every picture/world disagreement they and their research found fixed (VALIDATION.md "The 34 expansion
    sequences under HX52"): pets and a map's companion rule, one figure from speaking to its new place
    (`src/engine/50_world.js` dismissExtras), Heisuke, the Hall's endings, Nao's night apart, four pictures re-set where
    their scenes play, six that showed what the world did not have, Steamhollow's evening yukata (`58f_festdress.js`).
    Since then: `sequence_world` 2524/0; the complete browser run's parts 7–8 and `--extra` done and traced (every
    failure a test the game had outgrown, fixed and rerun); `staging_chapters` split by chapter in `run.mjs`, every
    piece passed (14,853 checks): **the complete browser run is done**. **MT-1 (Robin's music performance, 2026-10-12): done in the build, not
    deployed.** Settings › Audio › Music performance, Original (default) or Ensemble, in the title, Ledger and battle
    settings, with a status line saying what actually plays; two pilot recordings (`snowbell`, `battle_keepers`) in
    `assets/music/ensemble/` beside the page, made from the current score by `tools/music/ensemble/` and admitted by
    the build only while their score fingerprint matches; the director in `src/audio/22_ensemble.js` keeps the
    Original warm and hands over on the audio clock both ways. Design, results and limits: `docs/MUSIC_PERFORMANCE.md`;
    decision F-145; captures: `docs/music/ensemble/listen.html` (Robin listened, 2026-10-12: "It sounds great, nice job"; not yet heard in the game on a device); the
    recordings are GPL-2 like their sound bank (Robin, 2026-10-14, C-92; `assets/music/ensemble/NOTICE.md`). Tests: `tests/unit/music_performance.test.mjs`,
    `tests/e2e/music_performance.mjs`; the chain and the full matrix run at Original only, never again with Ensemble
    (Robin's C-88). A new recording: the five steps in that doc, then rebuild.
    **LP-1 (Robin, 2026-10-12): the Ledger lagged in Firefox.** Fixed without changing its look (VALIDATION.md "LP-1"):
    the Quest Guide's state copies (the first open's half second), the grain baked (`tools/book_grain.mjs`), the
    spread's filter replaced by a shadow layer, the spread kept between pages, the tab rail's layouts consolidated,
    the world drawn on one frame in four under the book. `tests/e2e/ledger.mjs` (early and late journeys). Firefox
    cannot be fetched here (network policy; retried after Robin's review, still refused); `RB_BROWSER=firefox` runs a
    suite where it is installed. Robin's review checks: the guide's shared copy of the journey was stale when asked,
    changed and asked again in one callback; now one copy per outside question (`tests/unit/quest_guide_live.test.mjs`);
    weather under the book moves at a quarter speed, recorded, not changed. **Robin's report is resolved after a
    browser configuration change** (hardware acceleration restored on their Windows Firefox; it had been off); not a
    general Firefox certification, not attributed to LP-1 alone; README.md "If the game feels slow" tells players to
    check the setting; software rendering is a separate compatibility consideration, not a blocker.
    **P18 is Plan B (Robin's C-89, 2026-10-12), done:** the four continuous twelve-chapter campaigns (F/Ren, E/Nao,
    I/Mio, A/Suzu) all PASS on one clean export of 2debb3c (17/17 milestones in order, to the ending, 0 problems; the
    batch on 28cb216 failed by the launcher's own order check and is not counted), through
    `node tests/e2e/matrix.mjs --twelve --fixtures --pairs …`; the sixteen namings 16/16 (on b11056e, from those
    campaigns' own fixtures); P17's speed checks run on a quiet machine after them. Plus
    targeted tests: `tests/unit/answer_sweep.test.mjs` (every tier of every task, negative controls),
    `tests/e2e/naming_combos.mjs` (the sixteen companion × level namings at the gate, from each companion's own
    pre-Archive fixture in `tests/fixtures/p18/`), `tests/unit/profile_narration.test.mjs` and
    `tests/e2e/profile_narration.mjs` (the level-dependent narration's selection and rendering). The sixteen-run
    product stays in matrix.mjs, not run. Found and fixed on the way: the New Game+ offer could be made over a
    journey other than its own; a fill-in blank (［　］) could break across lines. Not to be reported as "sixteen
    full campaigns", native-reviewed Japanese or real-device validation. Next (C-87's order, unchanged): VA-1 as
    Robin ordered it, and only when all of it passes the hosted page (its deploy must also copy
    `assets/music/ensemble/`). Open for Robin: the weather's refresh-rate dependence (deferred, P17_CLOSURE).
    **Closure status (2026-10-13, Robin asked):**
    - P14–P16 are done.
    - P17's closure is done, now on the final build too. The complete browser run (12 parts and `--extra`, 140
      scripts) ran on a clean export of the final build (`index.html` e456645a…, unchanged since). 136 passed at
      their first run.
    - The 4 failures were all test faults (measuring too early or the wrong thing), traced and fixed in the tests,
      each then passing in full on that build: `learning_ui`, `pets`, `company`, `actor_life` (VALIDATION.md "P17 —
      the complete run on the final build").
    - The twelve-chapter edition is shipped in the build (C-84). Deploying the hosted page comes last, after VA-1 and
      the full matrix (C-87).
    - Robin's own items stay Robin's: review at completion, human playtests, real devices.

    **VA-1 now:**
    - VS00 (the intake) and VS01 (the frozen corpus: 83 cases, 14 neutral controls) are done.
    - VS02's preparation that costs nothing is done: adapters, the gated runner, the gallery, the Qwen local job and
      casting templates (tools/voice/, docs/future/voice/).
    - No audio yet. All seven configurations are blocked from this environment or unauthorised (untested, not
      inferior). The Google Cloud token stays unused: its purpose and project can't be established.
    - Robin's corrections before the first paid request are done (2026-10-13): proxy-auth mode, the usage ledger
      with a dollar allowance, per-attempt listening identity, control markup kept apart, separate evidence, the
      Windows local-engine kit.
    - **Order (Robin, 2026-10-13): free and local engines first.**
      - VOICEVOX, Nemo and AivisSpeech (and Qwen on a GPU machine) run on Robin's machine with the Windows kit; none
        can run in this environment.
      - If Robin sends `voice-audition/speakers_<engine>.json` (the kit saves it), propose candidates and record
        each voice's terms from it.
    - **Robin's unattended local-run directive (2026-10-13):** this cloud session had no execution access to Robin's
      PC, so it prepared `docs/future/voice/LOCAL_RUN_HANDOFF.md` and the kit `rbn-va1-local-kit.zip`.
      - Robin then started a Remote Control session on the PC to run the audition (2026-10-13). That session is
        separate: this one cannot see or message it, and nothing from it is recorded until its results come back
        (`RUN_SUMMARY.md`, `results.json`, the review ZIPs).
      - Leave `tools/voice/` and the corpus unchanged on the branch while that run uses them.
    - **Robin's direction (C-91, 2026-10-13):** the curated review will take a long time and found no single winner;
      the prepared set may mix models for different roles or kinds of line. The game keeps the device voice (Windows
      voice packs, as today) and adds the vetted prepared voices once the review is done. Nothing moves ahead of
      Robin's picks: no final casting, whole-game generation or change to the game's speech until then.
    - **Only if the free results fall short:** propose the Gemini samples in
      `docs/future/voice/authorizations/gemini-samples-1.json`. That is 9 takes, at most US$0.04, and needs a
      network secret for `generativelanguage.googleapis.com` (`x-goog-api-key`) plus Robin's approval. It is not the
      casting screen or the matrix, each of which would be a later, separate proposal.
    - **Whole-game generation is a separate approval**, after the complete estimate in
      `docs/future/voice/PRODUCTION_ESTIMATE.md` (variants, measured duration, corrections, regeneration). The
      audition runner refuses any authorization not marked `audition`.
    - No casting decision and no whole-game synthesis before Robin has listened.

    **AR-1 (Robin, 2026-10-13), the illustrations' art pass:** bodies were the bust's bottom row painted downwards
    and back figures a ball on a trapezoid. Now a drawn body under every bust (arms that hang, clasp or hold), back
    figures drawn from the character's look (hair, collar, arms, garment, legs; seiza; raised and forward arms),
    holds within reach, and every shot fully painted (eight gaps; the prologue counter's black front). Guard:
    `tests/e2e/sequence_art_integrity.mjs` (every shot, phase, companion and size). Status under AC-1: implemented
    provisionally, internally reviewed; Robin's review open. VALIDATION.md "AR-1", REQUIREMENTS.md XP116, pairs in
    `docs/screenshots/ar1/`.
    Round 2 (Robin: "Ren appears to be floating in a library"): people who stood on a wall's face now stand on a floor
    (`RB.seqKit.floor`), the Exchange street, the stage's edge seen from below, shadows at the feet, your own arm for
    Hoshino's envelope.
    **AR-2 (Robin, 2026-10-13: "any other illustration oddities … animations, framing"):** sequences draw at the
    world's art buffer, not the window (640 × 360 for a 1280 × 720 window, 683 × 349 for Robin's 2048 × 1046, 390 × 844
    and 563 × 260 on phones), and AR-1 had been judged at 1280 × 720: judge illustrations at those sizes (the guard test
    now does). Fixed: floating hands in close-ups (`RB.seqKit.forearm`), six upside-down left hands (an 'L' hand mirrors
    an 'R' one at a + π), the folio handover's arm, the nameplate's splayed elbows, short-legged Sen and Sanpei, the
    bell's one-frame green-to-bronze, the lamp's colour jumps, the assembly speakers' snap back, six end-of-action
    switches, the volume's 160 × 90 pages (now 320 × 180 with the sheet's line), two unpainted places. VALIDATION.md
    "AR-2", REQUIREMENTS.md XP117, pairs in `docs/screenshots/ar2/`. Robin's review open.
    **MT-2 (Robin, 2026-10-13, C-92: "All 115 now", Opus + MP3, TimGM6mb while the rights are decided):** every song
    the game plays was recorded in the Ensemble treatment and measured; **all 117 are ready and in the build, in Opus
    and MP3** (2026-10-14: Robin admitted the last three on a waiver of the handover level, "Definitely include every
    track"; Astra's report that nine songs had one encoding only was fixed).
    `tools/music/ensemble/produce.sh <song>` makes one (export, stems, render, package, verify). Voices for the new
    instruments are the lead's choice, each part balanced against the Original's by measurement; nobody has heard
    them yet: `docs/music/ensemble/listen_all.html` is for Robin. Changed on the evidence: the handover is now an
    equal-power crossfade (the two performances are uncorrelated); a one-shot's recording plays out its decay; the
    onset test has a second detector, a negative control and the rule z ≥ 4; the alignment rule checks the median
    window. `docs/music/ensemble/listen_all.html` has a full-track player for every song. **Open, for Robin:**
    listening. The recordings are GPL-2 (Robin, 2026-10-14). docs/MUSIC_PERFORMANCE.md, VALIDATION.md "MT-2",
    REQUIREMENTS.md XP118.

    **KS-1 (Robin, 2026-10-14, C-94: "only 6 Keepsakes still?"; "Yes, please do so"):** the Keepsakes page now covers
    the whole twelve-chapter road: 46 road keepsakes in 14 regions (12 in 6 before). The 22 items that call
    themselves keepsakes are catalogued (recorded when given; counted while a journey from before holds them; loading
    never writes into a save), and each new chapter has two of its own, findable after the chapter
    (`src/content/zzzz_keepsakes/`). Guard: `tests/unit/keepsakes_road.test.mjs`. VALIDATION.md "KS-1",
    REQUIREMENTS.md XP119.

    **VA-2 (Robin, 2026-10-14, C-93):** Robin chose the voice approach (narrator: an AivisSpeech model with a directed
    tone; player: Voice A and B, each High and Low; NPCs: Qwen3-TTS, with AivisSpeech for bubbly feminine voices and
    VOICEVOX Nemo for middle-aged men only; supernatural speakers treated; a neutral word for the player's name in
    recordings) and asked for casting samples in one gallery file: 60 player, 240 companion (60 each for Nao, Mio,
    Ren and Suzu, added the same day), 14 narrator and one line per NPC (281).
    Ready to run on Robin's PC (the engines cannot run in the cloud): `docs/future/voice/va2/HANDOFF_VA2.md`,
    `tools/voice/va2/`. Robin's unticked NPC choices stand (C-93). **No implementation in the game's speech until
    Robin's decisions on the samples.** Robin's later answers (C-93): the Hush needs no voice; the supernatural
    treatments are right; Mochi's ニャー is a sourced CC0 or public-domain meow (sourced on the PC), else a playful
    female AivisSpeech voice; no voice is
    generated live; one loudness for every line. VALIDATION.md "VA-2", REQUIREMENTS.md XP120.
    **Run on Robin's PC on 2026-10-15:** 595 of 595 samples made (`docs/future/voice/va2/run/RUN_SUMMARY.md`); the
    gallery is with Robin; Mochi's meow is the CC0 recording Robin picked. Waiting for Robin's picks (C-93); do not
    re-run or change the samples.

    **RV-1 (Robin, 2026-10-15, C-95): register and naturalness reviewed before whole-game voice production, a report,
    not a rewrite.** `docs/review/register/REGISTER_REVIEW.md` (six decisions for Robin, D1–D6: Mio's register toward
    the player along the road; the lines any companion says, which Ren cannot voice; the player's register to
    companions; Suzu's Kansai keeping politeness and 〜てん; teaching voices in character speech; word help that names
    the wrong word), `FINDINGS.md` / `findings.json` (304 findings, 80 fix before recording; 112 lines to keep).
    **Decided and applied on 2026-10-16** (see "C-95 resolved" below). VALIDATION.md "RV-1", REQUIREMENTS.md XP121.

    **PT-1 (a coworker's first play as a new learner, relayed by Robin on 2026-10-15):** "The start was confusing - needs
    voices (wip)"; "When the voiced lines are spoken, highlight the spoken word in Japanese and the English
    counterpart(s) in the sentence prominently"; "The UI volume was crazy loud"; "Settings are not prominently
    displayed in the menu / hard to find". Done: interface and feedback effects trimmed under the music (measured,
    `tests/e2e/audio_levels.mjs`); a Settings button on the map beside Word help and the Ledger, and Settings beside
    Close inside the Ledger (`tests/e2e/settings_access.mjs`); the word being spoken marked in the Japanese and its
    English counterpart while a line is voiced, by the device voice now and ready for recordings (Settings › Audio can
    turn it off; `tests/e2e/speech_mark.mjs`, `tests/unit/speech_align.test.mjs`). The start's confusion is the voices,
    which wait on Robin's VA-2 picks (C-93). VALIDATION.md "PT-1", REQUIREMENTS.md XP122.

    **ST-1 (Robin, 2026-10-15: Settings laid out like the Ledger):** tabs at the top instead of the left page's list of
    groups; room for context sentences; option names that read as headings; the switches and radio buttons reshaped to
    feel on the page; drawn icons beside options (Music performance: Original / Ensemble, after Robin's reference image);
    a prompt to review every setting that affects ordinary play when a new save is created; the voice settings saying
    why lines may be silent for now; the spoken-word highlight confirmed and kept apart from Word help. Done:
    `src/ui/55_settings.js` is a book of the Ledger's family with six tabs (Reading, Learning, Play, Sound, Display,
    Controls; Storage folded into Controls › Saves; the battle settings, stories and quest guidance moved from Learning
    to Play), each tab across both pages; a choice is circled in ink (the others pencilled), on/off is a tick box, a
    level a ruled line with a seal; option icons drawn in code (`OI`); the battle's sheet uses the same tabs. "Before you
    set out" (`review(s)`) opens before a new journey's story (wizard, New Game+, fresh start from an old save): level,
    mistakes, challenge, quest markers, reading, volumes and music, voices, the highlight, Suzu's speech, stories,
    battles; Set out begins the story. Sound › Voices: "No recorded voices yet" (why lines are silent); the highlight
    is always shown (it was only shown when the device had a Japanese voice, so Robin could not find it). Same setting
    keys, values and saving. **Open:** when the recordings ship, voices on by default with the choice of recordings,
    the device's voice or none (the Voices slip says so; change `voiceNote()` and the defaults then). VALIDATION.md
    "ST-1", REQUIREMENTS.md XP123.

    **LI (Robin, 2026-10-16: the Ledger, items and their slips):**
    - Satchel: Change… on each slot opens a short list (worn one ticked, and Nothing). `src/ui/50_menu.js` `pickFor`.
    - Icons: every item has its own drawn 16-px icon. `src/ui/11_item_art.js`, drawings in `src/content/item_art/`.
      Tools: `tools/art/item_icons_sheet.mjs` and `item_icons_check.mjs`.
    - Award slips: items, keepsakes and recorded moments share one family. `src/ui/15_award.js`:
      - icon and name, one sound each, a held time and a close button, the gold flare, the slide-in;
      - the glowing "new" mark;
      - a moment of the Travel volume has its own sound (`moment`).
    - Dialogue: the strip rises into place (LI-4). Pointing at a word marks its counterpart while Highlight is on
      (LI-9, `src/ui/22_speech_mark.js`).
    - Pairs in two tiers (LI-12, `src/lang/88_speech_align.js`): `align()` returns `map` (words, amber `.hov`) and
      `gmap` (grammar, blue dotted `.hov2`).
      - The tables are `GRAM` (particles, copula, auxiliaries), `FORMS` (what an inflection adds), `TE_AUX`, `EXTRA`
        (keigo verbs), `NOT_SAID` (no English) and `IRR` (English irregulars, contractions and pronoun cases).
      - Coverage: `node tools/review/align_coverage.mjs [--samples N] [--grep re]`.
      - Astra could review the `GRAM` mappings.
    - **AG-1 (Robin's review packet, 2026-10-16):**
      - The pairs are relations (`align()` → `rels`, `notes`, `status`).
      - English words have parts, each claimed once.
      - Constructions are recognised before their endings.
      - Every word is linked, gets a grammar note (word help's "In this line"), or is marked unresolved.
      - Hover and the spoken mark (`.spk2` for grammar) share the relations.
      - Reviewed alignments live in `src/content/align/`. Propose and check them with
        `tools/review/align_registry.mjs`; compare old and new aligners with `tools/review/align_compare.mjs`.
      - Record: `docs/review/align/AG1_REVIEW.md`.
    - **ST-2:** the creation wizard's learning step uses the Settings choices (`RB.ui.settings.choice`, `.sx-scope`).
    - Satchel detail icons have no dish (LI-10). The icon viewer is `index.html?dev=items` (LI-11,
      `src/ui/11z_items_dev.js`; `&all` shows every place). The Words section headers are headings (LI-13,
      `.index-sec`).
    - Ledger pages: Journey's, Map's and Company's pages are coloured ribbons on the cover by the left page; on a phone
      or without hover they are tags. `bookmarks()`, `src/styles/94_bookmarks.css`.
    - Words and spelling: no empty "Contents"; "Practice" spelled so everywhere a player reads it.
    - Save & Load sits beside Settings and Close and opens a slip of three choices.
    - Route chart: taller, zoom and drag, names placed to fit, the pulsing ring and name of where you are.
      `chartWire()`, `src/styles/95_route_chart.css`.
    - Known details: readable note, People notes fixed and specific (`RB.town.spotWords`), people on the diagram, a
      key in groups.
    - Voice plan: the narrator's reference readings are counted (`tools/voice/reference_count.mjs`,
      PRODUCTION_ESTIMATE.md §1b).
    - Open: the cut-off "My Learning", "Reference" request (asked Robin what it meant). Icons to look at again:
      `yn_letter`, `cr_message`, `atlas_cos_sash`. The browser regression and `harmony_cutin` (ST-1) pass.
    - VALIDATION.md "LI", REQUIREMENTS.md XP124.

    **C-95 resolved, the voice batch's inputs, the recorded-voice runtime and the hosting audit (Robin, 2026-10-16).**
    The current state for anyone picking this up:
    - **C-95 (Robin's bounded editorial authorization):** every RV-1 finding has a disposition:
      `docs/review/register/DISPOSITIONS.md` and `.json`, with 222 accepted, 70 retained and 12 deferred (Robin's).
      - **The script:** 482 lines in 100 files, 19 in the Kansai table. The edits were applied with
        `tools/review/register_apply.mjs`, which refuses any line that is not exactly as reviewed.
      - **The lexicon:** D6, word help, done with no line changed (`tests/unit/word_help_rv1.test.mjs`).
      - **Kept:** the 112 preserved lines are unchanged, and the ledger has entries for every changed line.
      - **Frozen audition texts kept:** VA-1 SUZU_K05, plus VA-2's cr.call and rw.mr_lantern samples.
        `docs/future/voice/{corpus,va2}/DIVERGENCES.json` record them, and `corpus.mjs --check` and `va2/plan.mjs
        --check` accept only those recorded pairs.
    - **The voice batch** (`docs/future/voice/production/`):
      - [READINESS.md](docs/future/voice/production/READINESS.md) keeps generation, the runtime and hosting apart.
      - `PRODUCTION_SCOPE.md` is the authorization, kept apart from the auditions, with the agreed cast. The local worker
        reported player A = Set 3A and B = Set 1B; Mochi's meow is pick H8.
      - `VOICE_DELIVERY.md` is the worker contract: the key, the variants, normalization, the encoding (VA-2's, about
        58 kbit/s, not lowered), the results and the site.
      - `manifest/` holds the manifest, and `GO.json` names the commit.
      - Tools: `tools/voice/attribution.mjs`, `production_manifest.mjs`, `voice_site.mjs`, `delivery_estimate.mjs`.
      - **Status (2026-10-18, the local worker):**
        - the batch finished: 23,816 made, 0 pending, 0 failed;
        - the MW-1 supplement was recorded after it: 7 of 7, 0 failed, `results_MW1.json`;
        - the audio stays on Robin's PC;
        - the run records are in `docs/future/voice/production/run/` (38a397f, the worker's own push), and checked
          here against the GO manifest and the supplement;
        - Wataru's flagged 「……辞めさせないんですか。」 is reconciled: the same id is sent as 「やめさせないんですか。」
          (SC1, `supplements/SEND_CORRECTIONS.json`; VOICE_DELIVERY.md §7 step 8). The worker records it;
        - Robin's listening page for the 151 takes to review is `docs/future/voice/production/run/REVIEW_LISTENING.html`
          (`tools/voice/review_page.mjs`). It is opened from the batch folder and plays the takes beside it. Robin's
          "Copy my decisions" text comes back here (READINESS.md progress list).
    - **The recorded-voice runtime** (VR-1, VR-2; `docs/future/voice/production/VOICE_RUNTIME.md`):
      - `src/audio/52_voicebank.js` loads a voice site:
        - per-scene indexes, and content-named, stable recording URLs;
        - lookahead of three lines, at most 1.5 MB;
        - its own Cache Storage cache, `rbn-voice-v1`, bounded at 150 MB, never touching other caches or saves;
        - the 2 s start rule, the text-hash check and the device fallback.
      - `src/audio/54_voice_route.js` routes every speaking control: recording, then device, then none, independent of
        system voices.
      - Settings › Sound: Who speaks (Recorded / Device / None), your own lines (Silent / A / B), the pitch, Play
        automatically, and Clear the kept recordings.
      - `HOSTED_BASE` is null until Robin chooses the voice host. Until then the hosted game behaves as before.
      - The voiced offline package: `tools/publish/offline_package.mjs`.
      - Browser test: `tests/e2e/voice_runtime.mjs`, with synthetic tones.
    - **Hosting** (`docs/hosting/RUNTIME_PUBLISHING.md`):
      - Pages publishes the whole branch, 1,072,095,009 bytes, on every push (472 deployments since 2026-09-27; the
        older "not deployed" lines were wrong in effect).
      - The runtime-only set is 625 files, 523,674,397 bytes (`tools/publish/prepare_runtime.mjs`;
        `tests/e2e/runtime_publish.mjs`).
      - The voices are about 665 MB, so they need their own same-origin site.
      - Robin's to do: the Pages setting (draft workflow `docs/hosting/pages-runtime.workflow.yml`), and the voice
        repository.
    - **Open, the lead's:**
      - the 116 lines with the player's name, which need a neutral-word version for recording (C-93);
      - build a voice site from the run records (the batch and the MW-1 supplement are made), with
        `voice_site.mjs --production` given a manifest rebuilt at the site's revision; then `HOSTED_BASE`, and timing
        marks if wanted;
      - `tests/e2e/bookmarks.mjs` fails one check at 200 % text on a phone ("Next does not move for the tab"), on the
        previous build too, so it predates this work.
    - VALIDATION.md "C-95 corrections", "VR — the recorded voices" and "Hosting audit"; REQUIREMENTS.md XP121, XP127–XP129.

    **VR-C1, Astra's voice runtime audit (relayed by Robin, 2026-10-16):** reproduced against the full module first, then
    narrow loader and publishing corrections. VALIDATION.md "VR-C1", REQUIREMENTS.md XP130, VOICE_RUNTIME.md.
    - **Lookahead** plans from `RB.script.position()` (the runner's frames, read only) and gives only lines that will
      certainly come:
      - choices and conditions are respected;
      - conditions are read with `RB.state.peek`, which has no side effects (`fish.*` and `slot.*` build records when
        read, so registered heads are declined);
      - it stops at battles, lessons, hooks and the like.
    - **The speculative queue** is one for the game, one transfer at a time, behind the line asked for. It is dropped
      or aborted when obsolete, and never aborts the line on screen's transfer.
    - **Indexes** are retried with a back-off; kept copies are hash-checked.
    - **The bookkeeping** is merged under a Web Lock and reconciled once a session; cache writes are not waited for.
    - **The reference index** is deferred.
    - **The size guard:** `tools/publish/site_size.mjs` (900,000,000 bytes), in `prepare_runtime.mjs`, `voice_site.mjs`
      and the inactive draft workflow. The voice site keeps the current build and the one before it.
    - **Tests:** U `voicebank_vrc1`, `voicebank_plan_content`, `publish_guard`; B `voice_runtime_vrc1` (Chromium).
    - **Open:**
      - real recordings, heard and timed;
      - Firefox, Safari and phones, none installed or tried here;
      - `HOSTED_BASE`.
      - The plan knows the next line at 60 % of positions. Most stops are hooks, choices, registered conditions and
        challenges. Widening it means declaring pure condition heads; it was not done, to stay conservative.

    **FR-1, the Foundations clarity pass (Robin, 2026-10-17):** findings F01–F17 reproduced or checked first, then
    bounded fixes. docs/review/fr1/FR1_REPORT.md (dispositions, before/after, screenshots), VALIDATION.md "FR-1",
    REQUIREMENTS.md XP131.
    - New journeys default to Assisted mistakes (`RB.state.newCampaign`, the creation wizard); explicit choices and
      saved settings are kept; tactics separate. `normal` was not bulk-replaced.
    - Creation's Learning step folds mistakes, tactics and reading under one summary line; "Before you set out" opens
      on a summary (55_settings.js `summaryPages`) with Adjust details for every field.
    - `!lesson kana for <challenge>` (70_lessons.js `kanaFor`, `justInTime`) introduces only the kana a task needs and
      the player has not met (at most four); used at the gears and the loft lantern. Row lessons show only what is new.
    - Foundations choice options are made of met kana (65_challenge.js `choicesFor`); single-kana feedback at its scale
      (50_answers.js); help lines name the help; letters/orders with English recorded as supported context reading.
    - The letter quest `rw_letter` (`auto`, `RB.state.autoQuests` after each scene); quest stages may carry `when`
      (the report stage); the Journal turns to the followed quest and offers "Show the followed quest".
    - The pad's confirm is "Add character"; a lantern's drawn lamp is a tap target (props `top`/`topW`,
      50_world.js `tallTopAt`); battle cards lead with "Here:"; compound creation labels break at a soft hyphen.
    - Tests: U `fr1_foundations`; B `fr1_opening` (the opening route driver: `--input choice|hand`, `--order`, `--shots`),
      `fr1_defaults`, `fr1_targets`, `fr1_group_sample`.
    - Voice: 0 new spoken lines; the production manifest is unchanged (65cd38053ad6); the note to Local is
      READINESS.md §5.
    - F13 (the stair-well and the waterwheel's attachment): done in AR-1 Mill, approved by Robin (Next concrete
      actions, item 3); Firefox, Safari and phones were not tried; a real beginner's play.
    - **FR-1V (Astra's verification of 71d4a95):** a one-kana blank credited its parent word as answered (promotion,
      independent evidence, and a slip set the word back). Reproduced (U and B), fixed: the blank's `item` is the kana,
      the word is `exposure` (RB.tasks.prepare), recorded as seen and supported, never credited (10_mastery `record`,
      40_evidence `add`; callers: challenge `finish`, practice, the test harness). No save migration. Tests: U
      `fr1_partial_word`, B `fr1_partial_word`. FR1_REPORT.md §3 corrected, §8 added.

    **The creation step's "More choices" fold (Robin, 2026-10-18):** it read as a statement, not a menu. It is now a fold
    that shows it opens: a card with a turning chevron and Show/Hide, and section heads inside. VALIDATION.md "The
    creation step's 'More choices' fold"; FR1_REPORT.md F05 follow-up; B `create` checks it.

    **MW-1, the mill follows the gears; a travel tile is walked onto (Robin, 2026-10-17).** VALIDATION.md "MW-1",
    REQUIREMENTS.md XP132.
    - **Engine:** an exit may carry `scene` (50_world.js `useExit`). Stepping onto it plays the scene its thing's own use
      plays, and so does walking into it when it is set in a wall. You are stepped back first, as at a locked door. The
      exit keeps `to`/`tx`/`ty`, so the route chart, quest guide and Known map see it as before.
    - **The Old Mill (rw.mill1):**
      - The stairs are an exit, locked until `rw_gears`. Walked onto before then, they say the pit is flooded because the
        stopped gears keep the water from the millrace.
      - The loft's ladder is not there until the gears are mended. In the gears scene, the pit drains (now you can go
        down), then the trapdoor bangs open and the ladder drops with a thud (どすん, new lexicon word).
      - The millstone stands still until the gears are mended, then turns; its look says so.
      - The wheel outside, looked at after the gears, strains but will not turn; voices under the roof point to the loft.
      - The Mill Echo meets you as you come down from the loft (once). Its approach is the room's whole width (rows 6–7),
        so after a defeat (you wake by the ladder) every way to the door or the stairs meets it again.
    - **Elsewhere:** 19 stairs, ladders and doors that played a scene when used are walk-on exits: the Scriptorium Cave's
      door and stairs, the Undercroft's and Understage's stairs and doors, and the Flood Cellars' shortcut ladder. The
      Steam Vents and stacks doors were exits hidden until opened; walked onto while shut, they now say why.
    - **Not converted; reported to Robin:** the "Go down?" prompts on dungeon thresholds (now asked on walking), vehicles,
      the theatre's stage lift, the bath curtains, stairs that lead nowhere, the stacks key door (walking onto it uses the
      key, then a second step goes down), and the lockhouse's closed hatch. The new scene exits move you by `!warp`, so
      they set no checkpoint or autosave; the mill's stairs and ladder are plain exits and do.
    - **Voice:** docs/future/voice/production/supplements/MW1_SUPPLEMENT.json, narrator only and append-only: 6 lines,
      1 reference reading and 3 retired lines, to record after the batch. GO.json and the frozen manifest are unchanged.
      The note to Local is READINESS.md §1.
    - **Tests:** U `mw1_mill_flow`; B `mw1_mill_flow`. These were updated for the new flow: `ar1_mill_art` (U, B),
      `battle_places`, the geometry record (`rw.mill1`, `lf.records`; deliberate), `story_ch1`, `playtest_repairs`
      (RBN-01; RBN-07's stale wording from FR-1), `fr1_opening`, `battle_backdrops` and `expedition` (the cellars
      battle now chooses Standard mistakes, since FR-1 made Assisted the default). 21 affected browser suites pass
      (VALIDATION.md "MW-1").

    **Robin's message of 2026-10-20, and the QA issue.** Robin: "The cutscene has improved substantially, push it." "The
    battle icons are perfect." "You can push the Road events live" (they stay as frequent as they are: the player
    chooses to approach them). "Voice Loading and Battle Timing: … explore what options you have to fix these." "Create
    the relevant missing voice lines and ensure they're pushed live … Coordinate with the local agent entirely." "Your
    AG-2 work should be complete … in full." Robin plays on from choosing a companion once this is done.
    - **Pushed:** the AR-3 bridge cutscene and the IC-1 battle icons (f039d1c); road events as placed NPCs and props
      (RE-1, already live); BT-1, the battle scene's clock keeps real time on slow frames (7ed1dd1); VT-1, a slow
      browser cache is not waited on step after step (e8c2d76; VALIDATION.md "Voice loading (VT-1)").
    - **Every line spoken, second pass (VL-1, VL-2):** the remaining code-shown lines have scene ids (`code.comp`,
      `code.pages`, `code.atlas`, `code.fish`, `code.play`, `code.stamp`, `code.letters`, `code.town`, `code.ngplus`,
      `code.verbs`, `code.weave`, `code.enc`, `code.hanafuda`, `code.ask`; every telegraph under `code.battle`); the
      panels speak through src/ui/22c_spoken_panel.js; the Log and kept memories keep each line's scene. What is still
      written, and why, with a proposal each: docs/future/voice/SPOKEN_SURFACES.md §2 (Robin's decisions: reading tasks
      and letters, choices, whether a reading-critical telegraph's Voice counts as help). Supplements for Local:
      SL4 (1,779 recordings) and SL5 (868), after SL1 (574) and SL3 (1,292); SC11–SC14 send 葦 as あし on four
      recordings the worker's recognizer check flagged. READINESS.md §1 and §6.
    - **QA (Agnes, A-Birdi/Road-of-Borrowed-Names#1):** Local relays; the lead posts `[Claude Cloud]` handoffs (CC-00N)
      there. The protocol authorises no merges or deploys, and a gated candidate is never pushed for QA's convenience.
      Fixed: RBN-QA-001 (the Voice button's copy), 002 (an empty stamp stand points to the Stamp book), 003 (solo
      telegraphs, `intentTextSolo`), 004 (the Lantern Hall step's marker), 005 (the four walk into the Lantern Hall
      after you, one after another: `!refresh arrive`, src/engine/50_world.js `arriveOnFoot`/`arrivals`), 007 (the
      lighthouse stairs before the vane scene step you back and say why; SL6), 008 (the Foundations tide exercise's
      3:00 is Shiori's rounding of the chalkboard's 3:15), 009 (Tetsu's story after the archive), 010 (Fuku's one
      weather line), 011 (HIGH: in a twelve-chapter journey the Chapter 2 journal and Omi pointed north, where the road
      is washed out until Manybridge; now the journal and a new Omi line point to Tetsu's ferry east, and at the fork a
      new narrator line tells the ferry apart from the east road and corrects the journal once for older saves; SL8;
      B `route_after_ch2`), 012's copy (the keepsake slip's page name), 014 (Suzu's mediation joke no longer names the
      east storehouse before the evidence does), 018's flow (Manbē's introduction at Sōbē's referral, `2ee6378`), 019
      (Tomi's lantern task also reads the place first, through each family's `also`; `8ad05f1`), 021 (a printed Notice
      is called a notice: three press readers' notice wordings, `byKind.notice`, and the press's note; `8132972`; SL9),
      022 (Cinder's synthesis where it fits whatever clue is last; `d357e96`), 025 (HIGH: the Great Kiln's doorway is
      its way in once the seal is broken, and the kiln step's guide; `374196e`), 028 (Shino's tray thanks and Nao's hint
      wait for the invitations to be sorted; `53770cf`, `76352e5`). 001–005, 007, 008 were live in CC-005; 009–012,
      014, 018's flow, 019, 021, 022 and 025 are live in **CC-006** (commit `13d8af2`, `index.html` `79e0ef32…`, built
      from `621aef1`, Pages deployment success 12:03Z; CC-018 on the issue); 028 is in source for the next candidate. REQUIREMENTS.md XP147; VALIDATION.md "QA (Agnes …)".
      Agnes's review boundaries (2026-10-20): gameplay fixes carry a cross-game impact assessment; art goes to Robin as
      a before/after candidate first; a material change to intended behaviour needs Robin's approval; keep source,
      built and retested states distinct.
    - **THREE-PARTY REVIEW (owner direction, CL-046, 2026-10-21; accepted with amendments in CC-037):** fixes no
      longer wait for Robin's individual approval. A change passes only when Agnes, Claude Local and Claude Cloud each
      review it (function, look where visual, reading/text) and all three AGREE; a REFINE iterates; deadlock or
      critical issues go to Robin; proactive fixes are pre-approved on that basis, but no removal sweeps; voice stays
      paused until the full QA ends (a candidate needing a recording is VOICE-HOLD). Procedure: Cloud pushes each
      candidate to `candidate/qa-0NN` (task-branch head + the candidate's commits; Pages publishes only the task
      branch, so these never deploy; build with `node tools/build.mjs` there; refinements are new commits, never a
      force-push); verdicts name the commit; Cloud's candidate post is Cloud's AGREE; on three AGREEs Cloud
      cherry-picks exactly the agreed commits, builds the next CC candidate, and Agnes retests. No media in Git or the
      issue. Pushed 2026-10-21 on base `61b5db7`: qa-015 `3deb6e3`, qa-017a `d41eb3c`, qa-017b `0f230b7` (new: rows
      5-10 only), qa-018 `9fa47fa`, qa-020 `b652f92`, qa-024 `13d578f`, qa-026 `4ace926`, qa-027 `0be2366`, qa-029
      `6be8500`, qa-030 `e365c88`, qa-031 `70f53b2`, qa-034 `1f86084`, qa-035 `c8eeb33` (with the owner's fence
      refinement: north-south fence pieces, corners and joins, src/engine/40_maps.js `o.join` and
      src/engine/28_propwork.js; sb.hamlet, sb.goatshed, cr.barrier), qa-036 `fa14eda`, qa-037 `954db85`. Each passes
      `validate.mjs` on the new base; each candidate's listed suites are to be re-run on its branch. Not yet built:
      006, 012's signs, 013 and Blockprint's arrival, the Sazanami exit, 016/023 options, 028's idle-line sibling, the
      audit's Tier A display fixes. AG-2 (`ag2-work`): asked whether it enters this review.
      Revised and posted in CC-039 (2026-10-21, Cloud AGREE on each): qa-020 `5f492dd` (Local's narration order: the
      bridge line after the walk to the rail; arrival from every column of row 21 through three opt-in `!walkto`
      options used only by `mp.fest_night`: `cross` over a spent trigger, `party` so your companion follows, `max=`
      for this walk's bound; default staging unchanged) and qa-036 `bf4c0ef` (Agnes and Local's converged point 1:
      the walk across a counter retries only for a person who moved; plus the optional identity guard). Proposal
      verdicts (all three AGREE): RBN-QA-048 fog (scene-scoped `fog` ambience with a distance haze), RBN-QA-049 geese
      (one flock actor through the road event's `at`), RBN-QA-050 the fare repayment (seated start, side-by-side
      exchange at the table, approach sides checked). Building next: 048 (`candidate/qa-048`), 049, 050, then 047.
      MERGED: qa-036 (three AGREEs at `bf4c0ef`: Cloud CC-039, Agnes 6306739023, Local CL-061), cherry-picked into the
      task branch as `17591c4`, `1ddd834`, `3b63a2c`; in source, not yet in a built candidate (no `index.html` rebuilt:
      publication is not authorized by the reviewers' messages; the next CC build waits for a batch and a go-ahead).
      qa-020 `5f492dd`: Agnes REFINE (6306759991) and Local REFINE (CL-061) on the new follow's lifecycle (bind the
      tick and catch-up to the scene token, map and companion; settle the last move within a stated bound; word
      `cross` as "if currently false"; document `max=`; focused cancellation/settle/default/active-trigger tests).
      Posted in CC-040 (Cloud AGREE on each): qa-020 `eb841cf` (that lifecycle: follower bound to scene token, map
      and companion; last step settled within max+2 s; `cross` rechecked per step; new B `walkto_options`);
      qa-048 `2610df3` (the fog event's `fog` ambience, a still distance haze via 60_render.js `drawHaze`; new B
      `fog_event`); qa-049 `0c0b8c4` (the geese: one flock actor `lw_rd_geese` through the road event's `at`, a
      pixel-table sprite, crossing to the pond's verge on success; new B `geese_event`). Proposal verdicts given
      (AGREE with refinements) on RBN-QA-039 (combined-kana stroke boxes), 040 (Next letter scroll reset; the order
      activity's "Next customer" sibling) and 042 (small tsu / long-vowel cues). Next: 050, then 039/040/042, then 047.
      INTEGRATED (CC-042, 2026-10-21): qa-020, qa-048 and qa-049 have three AGREEs (Cloud CC-040; Local CL-065; Agnes
      6307589131, 6307646830, 6307800434, source/contract level, her post-integration visual retest pending). Each
      candidate's own commits were cherry-picked (`-x`) onto `66bfb74`, keeping QA-036 (the fog's base `9de4dfb` and
      qa-020's `61b5db7` predate it; Agnes 6307618185, Local CL-065): qa-020 `b652f92`/`5f492dd`/`eb841cf` ->
      `0e4c46e`/`3515144`/`86b9d02`, qa-048 `2610df3` -> `cad556c`, qa-049 `0c0b8c4` -> `cf7c24a`; `git patch-id
      --stable` equal for each pair over every file but `tests/e2e/run.mjs` (the one conflict: each adds its suite in
      the same list line; all kept); 50_world.js and counter_tap.mjs byte-identical to `66bfb74`. In source; no
      `index.html` rebuilt. Corrections owed and made in CC-042: `fog_event`'s 'reload' block only reads the ambience
      and `skipAt` is unused (Skip, a real load and a map change were NOT exercised by that test; Agnes traced them in
      source); the haze's clear zone is centred on the player only (the person you talk to is in it by adjacency) and
      the colour drain covers the centre too. Open visual items stay open (bridge/boat frames, lantern/stall variants,
      fog legibility by approach, the geese crossing, phone framing; observatory, ribbon, drum barge).
      Posted in CC-042: qa-050 `b189471` (Local CL-066 REFINE, Agnes 6307951255 concurring: `!look koji lq_chigusa`
      at "Write your name"; `fare_pay_staging` now reads the drawn facing, which fails on `2b19482` from every side);
      `candidate/qa-039` `6ac5a5d` (RBN-QA-039 combined-kana boxes, 040 Next letter + the reproduced Next customer
      sibling, 042 っ/ッ/ー cues). The batched CC build waits for those two (accepted exact versions only; Agnes and
      Local prefer one batch); then QA-047.
      INTEGRATED (CC-043): qa-050 (three AGREEs at `b189471`: Cloud CC-042, Agnes 6308146009, Local CL-067) and the
      learning candidate (three AGREEs at `6ac5a5d`: Cloud CC-042, Agnes 6308182771, Local CL-067), cherry-picked onto
      `ae545a5` as `774511e` (`2b19482`), `4731de8` (`b189471`), `cdf37db` (`6ac5a5d`); patch-ids equal over every
      file but run.mjs (both suites kept). The full unit run on `cdf37db` found one error, `portrait_anim`: qa-049's
      `C.chars.lw_rd_geese` has a portrait with no skin/hair/cloth, so painting it throws in `palette()`. No player path
      paints it (the geese never speak); no one had run the full unit suite on qa-049. Fix proposed as
      `candidate/qa-049b` (a creature drawn only by its own sprite has no face portrait). The batched build waits for
      it. Also posted: `candidate/qa-047` `be8f90b`; the fog test follow-up `candidate/qa-048-tests`; RBN-QA-053 filed
      by Cloud (after a load mid-scene from the Ledger, the old line's dialogue box stays on screen; History -> Ledger
      -> Save & Load reaches it in ordinary play); proposal verdicts on RBN-QA-051 and 052.
      INTEGRATED (CC-044): qa-047 `be8f90b` -> `748d593`, qa-049b `e93076d` -> `dcec221`, qa-048-tests `b883f1f` ->
      `0f5c3be` (three AGREEs each; patch-ids equal; Agnes 6309061501 and Local CL-072 verified the chain).
      CANDIDATE CC-009 (`index.html` `f9e42742…`, built from `0f5c3be`): accepted-only, CC-008 plus RBN-QA-033, 032,
      036, 020, 048, 049 (+ refine), 050, 039/040/042, 047 and the fog tests; U whole suite 57,696/0 and the batch's B
      suites green on this file except `fog_event` 25/1 (the test read the road's own once-only "north road is open"
      scene as the fog's; a test-only fix, `sg_road_open_seen` in its setup, is on `candidate/qa-048-tests` for
      review). Not in CC-009, each its own candidate for review: QA-051 `4d3197c`, QA-052 `d54e5a2`, qa-024i
      `e3981b8`, QA-053 and QA-054 (in progress); QA-045 (the guide naming a later, unreachable step: the observatory's
      dial before the ice is melted, Keepers' Road's Deepest Shelves before the cave rite) investigated, proposal next.
      CANDIDATE CC-010 (`index.html` `61c5c819…`, built from `5879c31`): CC-009 plus only RBN-QA-056 (a social action on
      the battle screen threw on `card.word.lex`; Agnes's playthrough stopped at the Teller's Shadow), its refine (a
      companion plan's look-ahead applied social actions to the live conversation, Local CL-082) and RBN-QA-057 (a
      press on a card's Japanese words chose the card at the word's index; focus restored likewise), three AGREEs each.
      Not in it, agreed and to integrate next, each by its exact commits: QA-053 `bdb1439`, QA-054 `6ebf2ae`, QA-045
      `d4e42bc`, QA-051 `4d3197c`, QA-052 `d54e5a2`, qa-024i `e3981b8`, the fog test refine `2fc477d` (QA-051 with
      qa-024i needs `hall_door`'s onWall check as an allowlist, Local CL-075). Filed: RBN-QA-058 (a procedure
      encounter's plan look-ahead mutates the live procedure, `kr.moss_steps`, Agnes 6311442246), QA-055 (preview-only),
      the QA-039 Guide follow-up.
      CANDIDATE CC-011 (`index.html` `4b108ae2…`, built from `cffd4ad`): CC-010 plus only the queued batch agreed
      before it, each by its exact commits (cherry-picked with `-x`, patch-identical; verified by Local CL-087 and Agnes
      6311710604): the fog test refine (`89f116d`), qa-024i (`8e9f2db`, `ca6cc86`), RBN-QA-052 (`feb146c`, `c3b1ac2`),
      RBN-QA-051 (`304fd60`; its renderer hunk is qa-024's, applied once), RBN-QA-054 (`4e9670e`), RBN-QA-053 (`19b5cd3`),
      RBN-QA-045 (`58133c0`), and the `hall_door` allowlist test (`cffd4ad`). Not in it: QA-055 (`f4b6a3e`, three AGREEs
      after CC-011 was fixed; to integrate next), QA-058 + RBN-QA-059 (the look-ahead and the "Here:" previews write to
      the live battle: `st.enc` through `combatSim.clone`, `st.mods` through `combatLogic.snapshot`; proposal agreed by
      all three, candidate in progress), RBN-QA-060 (Wait's wording in a conversation; proposal agreed by all three),
      the QA-039 Guide follow-up.
      CANDIDATE CC-012 (`index.html` `cecaeb33…`, built from `acd685a`): CC-011 plus only what was agreed after it,
      each by its exact commits (cherry-picked with `-x`, patch-identical; the chain verified by Local CL-100/CL-102 and
      Agnes 6313970214): RBN-QA-055 (`f4b6a3e` → `6f8218c`: no battle "Here:" line in a conversation), RBN-QA-059 and
      QA-058 (`f91a437`, `3d28e54` → `574da26`, `5ce29ec`: a card's preview and a plan's look-ahead work on their own
      copies of the lasting effects and of the encounter record), RBN-QA-060 (`362c032` → `73de5cc`: Wait in a
      conversation is the conversation's, with "They seem to have more to say." while it would bring something out),
      RBN-QA-061 (`be7021f` → `c85b992`: the vigil's guide names Hisae at her lamp, or Ren on the ridge once she has
      told you), the QA-039 Guide follow-up (`c6ca9cd`, `203fa02`, `600956a` → `c3c190f`, `99638e8`, `acd685a`: a
      combination in the Guide's kana chart as the lesson shows it; っ/ッ/ー named in words), RBN-QA-062 (`0f7f3ce`,
      `bd7d176`, `c51a8fe` → `b12a0e1`, `a42cf49`, `4ff01b7`: after the registers the household is placed round the lamp
      and you walk to it before the gathering line, for that visit). Not in it: RBN-QA-063 (`candidate/qa-063`
      `a148a16` + refine `295a0ed`: a companion who goes off in a quarrel is away at the lodge until the apology; in
      review), the `look_purity` hardening (test only, Local CL-101), RBN-QA-064 and 065 (proposals agreed, queued),
      RBN-QA-066 (Ren's walk-off and return, the same same-map follower mismatch), 067 (the Guide's preview out of view)
      and 068 (Lanternfall's basement search guide names the Belfry Loft): proposals under review.
      CANDIDATE CC-013 (`index.html` `9506f218…`, built from `f133f36`): CC-012 plus only what was agreed after it,
      each by its exact commits (cherry-picked with `-x`, patch-identical over every file but `run.mjs`; three AGREEs
      each, Agnes and Local CL-104 to CL-109): RBN-QA-063 (`a148a16`, `295a0ed`, `f802642` → `33e3188`, `418d61b`,
      `895e049`: a companion who goes off in the quarrel is away at the lodge until the apology, and comes back beside
      you, never on your tile), the `look_purity` hardening (`831b873` → `cdbeb8d`, test only), RBN-QA-068 (`296a48a`
      → `7221ed7`: with the stacks' stairs shut the guide names the stairs in the Public Records Hall), the
      `lodge_evening` guards (`10f1c23`, `bc3e66c` → `e05f9aa`, `b5b2ca4`, test only), RBN-QA-069 (`bb2445a`,
      `714b01d` → `8f66b79`, `2bbe49f`: before the catalogue the archive's guide names the Receiving Hall before the
      inner door; `next_line_once`'s archive case moved to after the catalogue), RBN-QA-066 (`7bd571a`, `55358a1`,
      `9ecdc69` → `cbc3e34`, `fb79a92`, `3fb1c72`: Ren's walk-off and return shown on the spot; at the Ridge Light the
      ridge's Ren is the one who comes with you, never a second Ren), RBN-QA-065 (`2defa40`, `ff88404` → `adbfd15`,
      `337b38a`: Rokusuke's leaking cask lies tipped until it is stood upright), RBN-QA-067 (`47b0bcf` → `0f23389`:
      choosing a kana far down the Guide's chart reveals its stroke order, with "Back to ‹kana› in the chart"),
      RBN-QA-070 (`7af0b05` → `f133f36`: a conversation's first line docks by where the sheet will rest, not where
      LI-4's slide starts; `world_view` green again). Not in it: RBN-QA-064 (the Lanternfall arrival view, AC-1;
      `candidate/qa-064` in progress), RBN-QA-071 (the Bell Chamber's guardian reveal; proposal agreed, queued after
      064), Local's optional `!look comp pc` after the quarrel's return, and the cask pool's sheen (optional polish).
      CANDIDATE CC-014 (`index.html` `5dc39d09…`, built from `5fbdc0b`): CC-013 plus only what was agreed after it,
      each by its exact commits (cherry-picked with `-x`, patch-identical over every file but `run.mjs`; three AGREEs
      each, Agnes and Local CL-113 to CL-124): RBN-QA-064 (`77e9aee`, `911db3e`, `c06e823` → `724f9d1`, `50f1890`,
      `f529f6f`: arriving at Lanternfall, the valley below the town as a picture over the arrival's lines; a picture up
      when the campaign changes is cleared with it; every interlude tested across a load), RBN-QA-071 (`1814be9` →
      `ffd7254`: the Drowned Bell's Keeper rises out of the water and comes apart, in pictures over the Bell Chamber's
      lines; the battle unchanged), the `keeper_reveal` plate check (`b4d4ae8` → `42cf95f`, test only), RBN-QA-077
      (`ac38b0d` → `6e44dcd`: a load while a battle is still starting leaves nothing of it; the opening-fade race only),
      RBN-QA-073 (`ca97c11`, `58ace7f` → `c69868f`, `5fbdc0b`: on the first landing, Kotonoha's great tree as a picture
      over the two lines that describe it, a few large written gold leaves coming down clear of the tree). Not in it:
      RBN-QA-072 (Tetsu's crossing as pictures from the boat; candidate in preparation), RBN-QA-074 to 076 (proposals
      agreed, queued), RBN-QA-078 (a preparation question or task left after a load; a latent engine defect with no
      authored ordinary-play path, proposal agreed, queued after 072 and 074 to 076).
      Verified live by Local (CL-126) and Agnes (6322726687).
      CANDIDATE CC-015 (`index.html` `dcf8eb7c…`, built from `16f8882`): CC-014 plus only what was agreed after it,
      each by its exact commits (cherry-picked with `-x`; three AGREEs each, Agnes 6324060630, 6324073402, 6324717270,
      6325021725 and Local CL-130 to CL-133; integration identities verified by Agnes 6325141876 and Local CL-134 and
      CL-135): RBN-QA-072 (`15f34dd`, `3977fd0`, `b728178`, `5021bdd`, `39f39b2` → `1059f88`, `7fed06e`, `a0bd4dc`,
      `cabd0d2`, `b97bef3`: Tetsu's crossing told over pictures from the boat, out and back, the departing tree the
      first sight's own; a picture's work built ahead belongs to the showing it was asked for), and the RBN-QA-073
      follow-up (`1307194`, `e869c04`, `c73aeab`, `db0f396`, `b7b5377` → `c157c66`, `cbbe649`, `80c736f`, `9f685fa`,
      `16f8882`: the first sight's gold leaves on the picture's own time, readable from its first frame; the leaf test
      judging whole frames, and the opening frames at two page clocks). `db0f396` and `b7b5377` differ from their
      integrated commits only in context lines (QA-072's header comment in the same file); their zero-context
      patch-ids are equal. Not in it: RBN-QA-074 (`candidate/qa-074` @ `d699567`, the leaf drift's marker; under
      review), RBN-QA-075 and 076 (in preparation), RBN-QA-078 (queued after them).
      Verified live by Local (CL-136) and Agnes (6325781957).
      CANDIDATE CC-016 (`index.html` `fc7a7a56…`, built from `e70e9c3`): CC-015 plus only what was agreed after it,
      each by its exact commits (cherry-picked with `-x`; three AGREEs each, Agnes 6325775115, 6326136749, 6326169868,
      6326495570, 6326516748, 6326531441, 6326845166, 6326862010 and Local CL-135 to CL-143; integration identities
      verified by Agnes 6326850214, 6327182752, 6327707377 and Local CL-137, CL-142, CL-143, CL-144): RBN-QA-074
      (`d699567` → `54b66ec`: the guide's diamond over a drift of written leaves sits on the drift), the `leaf_marker`
      fix (`a904614` → `ff8b328`, test only: Reduce motion set by the setting the game reads), RBN-QA-075 (`5bc6e38`,
      `f6873a1`, `6baa152`, `7dedf9c` → `40867a2`, `27258ea`, `4d3aa73`, `ea214c6`: Kotonoha's Wind Stone a broad, low,
      flat stone with the wind over it, on the village's map and in the ending's picture; its test sets Reduce motion
      as the game reads it; its 16-px fallback in the island's three stone tones), RBN-QA-076 (`7820dfa`, `8017916`,
      `7a31a7b` → `ecc051c`, `e06c0af`, `e70e9c3`: a leaf sent home is seen to rise off the stone and go on the wind, a
      still cue with Reduce motion; its test from where the stone is used, in view, clear of the dialogue box, and once
      the ordinary way). Patch-identical to the agreed commits over every file but `run.mjs`, and over it too except
      for `40867a2` and `ecc051c`, whose one-line suite list also carries its neighbours' entries (each adds only its
      own suite, `wind_stone` and `leaf_home`). Not in it, by agreement (Agnes 6327696635, Local CL-144): RBN-QA-078
      (`77b982f`, a preparation question or task taken down unanswered when the campaign changes; latent, fixture-only;
      three AGREEs, Agnes 6327714403 and Local CL-144; integrated after this cut), RBN-QA-079 (`candidate/qa-079` @
      `6392c63`, `e3c824d`, the ending's great tree as the first sight draws it, seated on its hill; under review).
      Verified live by Local (CL-147) and Agnes (6328518996).
      CANDIDATE CC-017 (`index.html` `ceaffb81…`, built from `c69346d`): CC-016 plus only what was agreed after it,
      each by its exact commits (cherry-picked with `-x`; three AGREEs each, Agnes 6327714403, 6328259496 and Local
      CL-144, CL-146; integration identities verified by Agnes 6328769386 and Local CL-148; scope agreed by Agnes
      6328762039 and Local CL-148): RBN-QA-078 (`77b982f` → `3acf399`: a battle still starting owns its preparation
      question or task, and leaving it for another journey takes that down unanswered; latent, only the development
      fixture `fx.prep` has a preparation), RBN-QA-079 (`6392c63`, `e3c824d` → `21c4262`, `c69346d`: the ending's great
      tree drawn as the island's first sight and crossing draw it, one crown shape at every screen shape, seated on its
      hill; the `stone` shot only). Patch-identical to the agreed commits over every file but `run.mjs`, and over it
      too except for `3acf399`, whose one-line suite list also carries `leaf_home` (it adds only `prep_abandon`).
      Nothing agreed is left out. Newly seen in its runs, and not from it: `learning_ui`'s software-keyboard check
      fails now and then under load, on CC-016's bytes too (VALIDATION, CC-017); a fix is proposed as RBN-QA-080.
      Verified live by Local (CL-149) and Agnes (6329410623).
      CANDIDATE CC-018 (`index.html` `aa07a8da…`, built from `d65a598`): CC-017 plus only RBN-QA-080 (`34f5103` →
      `d65a598`, cherry-picked with `-x`; patch-identical, full and without `run.mjs`, and the same tree; three AGREEs,
      Agnes 6329880275 and Local CL-151; proposal refined by Agnes 6329415662, 6329418781 and Local CL-149, CL-150;
      integration identity verified by Agnes 6330105048 and Local CL-152; scope agreed by Agnes 6330097510 and Local
      CL-152): hardening against a synthetically measured reflow, not a bug seen in play. `learning_ui`'s keyboard
      check waits for the book's type to be installed before raising its keyboard, and a typing task with the keyboard
      up keeps its field, and its Submit as far as the field stays in view, in view when its own boxes grow; never
      while feedback is shown or the answer is in, never with the keyboard closed, pinch-zoomed or focus elsewhere,
      and let go when the task is finished or taken down (new suite `kb_reflow`). Nothing agreed is left out.
      Verified live by Local (CL-153) and Agnes (6330526850).
      CANDIDATE CC-019 (`index.html` `3baeeb9f…`, built from `8064756`): CC-018 plus only what was agreed after it,
      each by its exact commits (cherry-picked with `-x`; patch-identical to the agreed commits over every file but
      `run.mjs`, which was merged by hand where it conflicted and only adds each item's own suites; three AGREEs each,
      listed in VALIDATION, CC-019; integrated heads verified by Agnes and Local at `b66f422` (6333264555, CL-164),
      `58a4a1a` (6334301150, CL-174), `32a6c78` (6335140450, CL-176), `5940b34` (6337370911, CL-181) and `8064756`
      (6338763683, CL-185); scope agreed by Agnes 6337648132 and Local CL-181): RBN-QA-081 (`fe50172` → `f7b1240`:
      Kotonoha's stage 3 names its own next place, never the next chapter's tide), RBN-QA-082 (`b4ebb9f`, `6cc52fb` →
      `b66f422`, `f72b28f`: Ao's second lesson ends on the particle は read わ, with its review-ledger entry), RBN-QA-086
      (`facde9e` → `d3cd72f`: stage 4 names the drifting leaf whose word opens the way down, not the Tidal Hollow
      behind it), RBN-QA-083 (`d0cb858` → `fff1ce1`: while Ao reads in the hall, those who know him say so, beside his
      unchanged usual line), RBN-QA-085 (`a9c62f3`, `0e6848f`, `1e24a27` → `2d69d55`, `acf9045`, `58a4a1a`: Yoshino's
      word on the hung tellings is choice-neutral and looks ahead), RBN-QA-087 (`0f8b9cc`, `f067bff` → `bedcd56`,
      `32a6c78`: the quest guide reads an encounter's outcome as unknown, never as what the save carried in),
      RBN-QA-090 (`8270bc8`, `6eb42fd`, `b4b09b4` → `4f1ee52`, `22fdbfd`, `10b0c07`: at the Tidal Hollow your companion
      is left on the far bank and is with you again at the reunion), RBN-QA-092 (`273d6d1`, `f2173c6`, `069353a` →
      `c3f2b1c`, `570a811`, `5940b34`: a guest in an encounter from its start comes in with their own words; Kihei's
      victory says he waits by the water), RBN-QA-088 (`89b73b4`, `7fc43e6` → `9212c34`, `8064756`: the sea cave's
      telling brings Nana into the audience and Suzu onto the rock itself, `!enter`; an entrance and its walk belong to
      their campaign, map, scene and figure). Nothing agreed for this scope is left out. Left out on purpose, each
      separately attributable: RBN-QA-089, 093 and 094 (excluded by the agreed scope) and every later candidate.
      Newly found while building QA-101, and not from this cut: a load while the screen is faded out leaves it
      black (RBN-QA-102; reproduced on `5940b34`).
      Verified live by Local (CL-192) and Agnes (6340095981, 6340185178).
      CANDIDATE CC-020 (`index.html` `6278005a…`, built from `05196f0`): CC-019 plus only what was agreed after it,
      each by its exact commits (cherry-picked with `-x`; patch-identical to the agreed commits over every file but
      `run.mjs`, which was merged by hand where it conflicted and only adds each item's own suites; three AGREEs each,
      listed in VALIDATION, CC-020; integrated heads verified by Agnes and Local at `cf6a4be` (6340888123, CL-194),
      `ac8d3f3` (6341755352, CL-197), `31206a0` (6344257556, CL-203), `7dd1517` (6345357960, CL-207), `da9072c`
      (6346419108, CL-208) and `05196f0` (6347081629, CL-210); scope agreed by Local CL-210 and Agnes 6347081629):
      RBN-QA-094 (`0b3fc0f` → `85d89df`: the boulder beside the Stone Steps is a mossy natural rock, not an inscribed
      marker stone), RBN-QA-089 (`421498e`, `77e792d`, `ff16922` → `15a17f7`, `aabec93`, `6988235`: the spring-tide
      night on the point has its own pictures, the tide drawn out under the full moon and the leaves rising, 1.6 s),
      RBN-QA-095 (`b71f5ec` → `cf6a4be`: the Courier's Inn shelf shows her grandfather's straw hat and relay coat),
      RBN-QA-099 (`64957eb` → `ac8d3f3`: on the Cloudroad the Journey's next step is the furthest station's own work),
      RBN-QA-096 (`4a799c1`, `1f33455` → `52d2441`, `2cb0e5e`: the reunion in the Root Hollows on every way off the
      north side, and its test's key timing), RBN-QA-104 palette (`ffa6222` → `31206a0`: the cloud sea above the
      Barrier drawn from the cloud top's own pale water, not the river ramp), RBN-QA-102 (`ad0b385`, `2807cd2`,
      `c51721a`, `2a8e7d7` → `ea10627`, `62f8d49`, `4adec02`, `d996629`: a change of campaign lifts a scene's fade and
      the scene left goes no further; a door's transition belongs to its campaign and takes only its own mode entry),
      RBN-QA-101 (`9896e70` → `761845d`: the pack horse unloaded and walked back in the dark, not vanished under the
      reactions), RBN-QA-093 (`72c33aa`, `27cfddc`, `c9b0fbd`, `715c080` → `1c8f3e7`, `2b0158b`, `903d0c1`, `7dd1517`:
      Kihei's leaf by Mitsu's door once she has it; Kihei gone where he stood before the narration says so),
      RBN-QA-104 cloud material (`cd27a5a` → `4546a18`: the cloud sea drawn as cloud: soft lit banks, a slow faint
      drift, a rock lip at the drop; no ripples, glints or wet shore), RBN-QA-100 (`647ce60`, `f965534` → `34eecad`,
      `da9072c`: Nakayama's two inns stand side by side and the lamp, Otaki, Seibe and the seal say so; its furigana
      check can't pass vacuously), RBN-QA-109 (`8aa099f` → `05196f0`: a reply's row is as tall as its words; where the
      replies don't fit, the list scrolls). Nothing agreed for this scope is left out. Left out on purpose, each
      separately attributable: RBN-QA-103 and 113 (integrated and checked as `a0f63a9` on `05196f0`; they land on the
      task branch after this cut, with QA-114, 111, 117 and 119, each with three AGREEs) and every later candidate.
      Known and open, not fixed by this cut: RBN-QA-116, the reply list beside the dialogue sheet on a short
      landscape screen (844×390 with 140% text: 8 px against a 103 px reply; 73 px at 100%). Its complete browser
      run (VALIDATION, CC-020), on these bytes: CC-019's 66 suites, 65 passing and `keeper_reveal` 68/1 (its
      contrast check reads one point of animated water once; CC-019's bytes fail it the same way in the same
      harness; retained, not an all-green claim, Agnes 6350299208 and Local CL-219); the 18 suites added or named
      since, all passing; and `sequence_world --only ko.tide_night` 158/0 (`sequence_world_p16_mb`, which I listed,
      is a spec file: not run). `dialect_kansai` 58/1 in QA-109's integration stays on record. Units 57,960/0 on
      `05196f0`.
      CANDIDATE CC-021 (`index.html` `6e3787fd…`, 24,336,422 bytes, built from `26c08c7`): CC-020 plus only what was
      agreed after it, each by its exact commits (cherry-picked with `-x`; patch-identical to the agreed commits in full
      or over every file but `run.mjs`, which was merged by hand where it conflicted and only adds each item's own
      suites; `ac11324` also differs in `50_world.js`'s export line, which on this base already lists `departures`, as
      at `a0f63a9`; AGREEs listed in VALIDATION, CC-021, with the ids the record lacks marked; integrated on the task
      branch as `6a7afbc`, `5cd2cd3`, `730fb40`, `a3883be` and its manifest `f51a635`, `8001c3e` and its manifest
      `e362a8d`, `0fca3fa`, `0944868` and `bc1bf37`, then for this cut `1657b0c` and `26c08c7`; heads verified:
      `5cd2cd3` by Local (CL-230, with Agnes's acceptance), `a3883be` and `f51a635` by Local (CL-236), `e362a8d` agreed
      by Agnes (id not in the record) with Local's check under way; `26c08c7` as integrated source by Agnes 6376933092
      and by Local (CL-254: patch-ids, generated documents, runtime); the other heads' verification is not in the
      record; scope agreed by Agnes 6376014281, 6376447128 and Local CL-249, CL-250, CL-251): RBN-QA-103 (`48d65dd`,
      `fec8666`, `207a831` → `ac11324`, `75ba996`, `0dd5259`: a companion who stays behind is the figure that was
      following you and the one who comes back is theirs here, never a second; Mio's night ends with you outside the
      dispensary's door), RBN-QA-113 (`5aeed6f`, `97dd467` → `25a2107`, `8fda88b`: across the bath's bamboo partition
      the companion is a voice from beyond it, never a figure on your side), RBN-QA-114 (`245d1dd`, `673c501`, `2f9d69f`
      → `a64f531`, `bdad610`, `ecb51f4`: the Lower House's entrance is earthen-floored, as its arrival line says),
      RBN-QA-111 (`b54316f` → `b0b138b`: Sono's noren hangs in the Courier's Inn's doorway once she has named it for her
      grandfather), RBN-QA-117 (`125c079` → `37a5c4c`: Steamhollow's Journey and guide point where the quest can go on:
      the red bridge once Tahei is heard, and Aki while the spring house's grille is shut), RBN-QA-119 (`40f4010` →
      `6a7afbc`: the river's own steam goes when the quarrel runs it cold, and comes back when the Kettle settles),
      RBN-QA-112 (`0a55dab` → `d19a8c1`: the procedures' footer, Step away and wrong-step words no longer call every
      procedure "the machine"), RBN-QA-115 (`e2e4008` → `26b9db2`: Zenroku's complaint ends in an inquiry Kane takes
      over, not a Plum-room booking nobody made), RBN-QA-121 (`3723625` → `5cd2cd3`: the Channel's forward valve line
      says "You turn the valve", true at the big valve and at the small wheel at either end), RBN-QA-130 (`3d5d02a` →
      `6930527`: Ginnojō's line after his quest claims no show he hasn't done), RBN-QA-131 (`b4381a1` → `730fb40`: after
      the Cloudroad Chika speaks of the labels Mio rewrote only on the journey where Mio rewrote them), RBN-QA-120
      (`fa479fd`, `16dc2d0`, `64a6b26`, `8e2e15b` → `357ea18`, `18e161a`, `3d69600`, `a3883be`: Tsuneji walks his spring
      egg home by the Lower House's door before the narration says he went, or fades where he is, recorded; `leave:
      'way'`), RBN-QA-129 (`3ba19ee`, `9e867a7`, `c424b42`, `b846c3b` → `ecf64eb`, `dc1b328`, `9df2157`, `509a041`: Eggs
      for Everyone can be finished after the valley's story; Yasuke and Tsuneji stay while their eggs are owed),
      RBN-QA-128 (`77aa5ef`, `432dc4e`, `cf155c3` → `1f0c553`, `1c8d924`, `a174d40`: Suzu's books play on coming out
      into either town), the `dialect_kansai` test fix (`1b62407` → `04a175d`: the Company page's buttons measured once
      the book has opened), the `keeper_reveal` test fix (`4efc4e6`, `fcae4e6` → `e6a7b9b`, `8001c3e`: the swell and the
      open water each read as a median of pixels at the same rows; the withdrawn first revision kept in the history),
      the language audit's Tier A with RBN-QA-132 (`54e9641`, `74edc10`, `9d66813`, `8380d17` → `c814d6a`, `f20bd83`,
      `cc7adc9`, `0fca3fa`: 48 furigana readings corrected in 35 files, display only; Word Help reads a whole N分のM as a
      fraction; the kanji table regenerated), the kanji exams' place rotation (`734a8cf` → `6afe108`: a target written
      twice or more is asked at each of its places in turn), RBN-QA-133 (`1381eb4` → `9513f64`: Tōya's note is never
      counted as "four words"), RV0047 (`1e4c0e7` → `bcdcaf6`: Nao's fourth orchard banter opens on the bell only if it
      rang), 先々代 at Fujiya (`fe59fa2` → `a68556a`: "the head of Fujiya two generations back", English only), RV0115
      (`3e8bfee` → `cc17077`: Word Help reads Suzu's 断られへん as "can't refuse"), 十分 read じゅっぷん (`bbc7bc1`, `dfa3219`,
      `f8cee4c` → `d0cfc03`, `194a7dd`, `18e177f`: "ten minutes", one lexicon entry, its kanji table and its note), the
      かい hints (`9d0a298` → `a4cceea`: six word@lemma hints give Mio's 甲斐, the notice's 貝 and the letter's 買う), the
      listening page's retired take (`1e2d7a6`, `a5f8511` → `08673c7`, `1e7aca8`: a take whose line has left the script
      keeps its recorded words, marked retired and unused), the `book` test fixture (`729086d` → `0944868`: its journey
      has the Archive's catalogue in order, as RBN-QA-069 needs), RBN-QA-161 (`fc3a758` → `e12fa49`: an open Bell-Post
      comes to Fuki in the square before her news after the story; at stage 0 she reminds you; the report's first line
      says where she stands), RBN-QA-162 (`cc1ce18` → `cf7ac62`: an open snow-sculpture contest comes to Kanta before
      his news after the story), with their browser test (`c209731` → `a534bb4`), the Reedwake return-discovery pilot
      (`4b105e1`, `c6dfc35` → `20dec12`, `b7cb482`: in Reedwake only, Journey › Places and the Map say when something
      you noticed may open now or an earned stamp waits to be pressed; the key line 「…{今|いま} なら {開|あ}けられそう だ 。」),
      RBN-QA-108 (`3bb0e9d`, `4ce2066`, `fa32d23`, `b3a34ac` → `6caf843`, `f556efe`, `85d2ddb`, `2eb1dbb`: Jinpachi runs
      up to you with the valley's letter, `!walkto <who> pc`, a speaker who cannot reach you is marked off screen, and
      after the letter he goes on down the road by his own way out), RBN-QA-124 (`169b4c6`, `af07182`, `3b283cb`,
      `b006a78` → `034f5ea`, `49c22fa`, `5414c61`, `9596103`: Suzu's evening fills the little theatre while the show
      lasts, the theatre is first seen at night, and Koume comes over to you after it), RBN-QA-164 (`20e4121` →
      `178199d`: the Hall's stairs drawn on each floor's way up itself) and RBN-QA-165 (`42e7cd6` → `26c08c7`: a kana
      completion's example word is never one of the lexicon's deliberate non-words). Generated only, each its own commit
      by the unchanged tool, a second generation identical: the scene manifest `f51a635`, `e362a8d`, `6ac5e86`,
      `bc1bf37` and `1657b0c`. Nothing in the agreed scope is left out; QA-164 and QA-165 are in it on Local's AGREEs
      (CL-250, CL-251) and Agnes's (6376447128). Left out on purpose, each separately attributable: RBN-QA-125
      (`afaf2f5`), 127 (`96f8275`) and 134 (`b4325f1`), each waiting on its own reviews; the language follow-up
      (`6f34bf0`, `55db809`, `349e582`: the retired take's recorded key, the じっぷん entry, its kanji table); `book-voice`
      (`d9fbc73`, test only); RBN-QA-163 (A, B and B2 `5b54df6`, three AGREEs; the staged `bc72ae1` withdrawn, never
      pushed; C `c47f171`), RBN-QA-166 (A `6da3544`, B `44ebd46`) and QA-165's follow-up (`a563040`, `7a3d6ee`), each
      for the next cut; the two test-only fixes this cut's matrix calls for (`hall_door` `5273ac7`, `jinpachi_letter`
      `a4b3823`; VALIDATION, CC-021); QA-161's part B (the never-started Bell-Post offer after the story); QA-120's
      optional extra guard `8d298d3` (not part of what was agreed); the `dialect_kansai` message for a bound that runs
      out (promised as its own small commit); and every later candidate. Known and open, not fixed by this cut:
      RBN-QA-116 (the reply list beside the dialogue sheet on a short landscape screen); the postgame shadows beyond
      QA-161 and 162 (Local's and my audits, CC-151 §2: triage, QA-161's shape for the real ones, a guard test, not
      built); 十分 written じっぷん would gloss "enough" (no line writes it today); deliberate non-words can still show as
      wrong options in the meaning-choice tasks (its narrow candidate, outside this cut); `jinpachi_letter`'s Skip-seen
      departure check failed once on `1657b0c`'s build (26/1, kept on record): the test raced the engine's 900 ms
      map-entry window, inside which a figure whose place ends is dropped without a walk or a record; so on an
      on-arrival Skip (only where seen scenes carry over) Jinpachi is simply gone, which stays as it is (Local CL-256),
      and the test's fix is outside this cut (VALIDATION, CC-021); RBN-QA-135 to 160, confirmed in source (CC-148), none
      built here; the three Cloudroad endings' message from Jinpachi six tiles away (out of scope, as Local agrees);
      five Windows-only path failures Local noted (also on `0fca3fa`). Art in this cut went to the owner as private
      captures (QA-111's noren, per AC1_ART.md; QA-114's earth; QA-124's seated audience, "implemented provisionally"
      until then); QA-164's stairs are moved, not redrawn, and not yet captured under Hall lighting. Its complete
      browser run (VALIDATION, CC-021), on these bytes: 107 suites, one after another: 105 passing, among them
      `jinpachi_letter` 27/0; `hall_door` 14/1, its exact allowlist of wall-drawn props never updated when RBN-QA-111
      (`b0b138b`, after CC-020) hung Sono's noren on the inn's wall (the unchanged test fails the same way on the task
      head's own build); `fade_load` stopped after 2 passing cases when a page did not report ready within 15 s, with a
      full unit run alongside, then 15/0 on the same bytes with nothing else running. Units 58,258/0 on `26c08c7`. Voice
      stays paused: every changed spoken line has a new key and plays with the device voice or silence until a listening
      check after QA; recordings kept.
      CANDIDATE CC-022 (`index.html` `90cf14b3…`, 24,347,183 bytes, built from `3d90956`): CC-021 (`3451937`, verified
      by Local CL-257 and, as published, by Agnes 6378492652) plus only what was agreed after it, each by its exact
      commits (cherry-picked with `-x` onto the cut; patch-identical to the agreed commits in full, or for QA-163 C,
      QA-166 B and QA-169 A over every file but `tests/e2e/run.mjs`, merged by hand where it conflicted and only adding
      each item's own suite; AGREEs listed in VALIDATION, CC-022; integrated as `int/cc022`, head `3d90956`, its
      integrated source agreed by Local (CL-276: patch-ids, generated documents, runtime) and by Agnes 6381286063
      (source integration only, not publication or native acceptance)): RBN-QA-163 A, B and B2 (`3406abb`, `e4388aa`,
      `5b54df6` → `487298d`, `192bc4c`, `7d6786c`: the census's three new plaques stay blank until Sen has the names;
      Kakeru, Sanpei and Hayashi are remembered at their bridges, never narrated arriving), RBN-QA-163 C (`c47f171` →
      `dc88c68`: the ink in the water at the Ink Bridge; art, provisional), QA-165's follow-up (`a563040`, `7a3d6ee` →
      `a41e155`, `3a90752`: the three generated wrong-meaning pools never draw the lexicon's deliberate non-words; the
      second commit test only), RBN-QA-166 A (`1b7d127`, `6da3544` → `8d26590`, `12c0a6c`: the first wing's companion
      map is an old map on a stone table; art, provisional; the second commit comments only), RBN-QA-166 B (`44ebd46` →
      `15cf064`: the story rooms' tasks name the written passages, not "pictures"), RBN-QA-167 (`4c26ab3` → `90e343a`: a
      setting changed on the Settings sheet over the Ledger shows on the page under it at once), RBN-QA-168 (`a564e46` →
      `c7ebe62`: a saved Shiritori chain's button spans its row), the `hall_door` test fix (`5273ac7` → `286025b`: its
      allowlist of wall-drawn props includes Sono's noren), the `jinpachi_letter` test fix (`5798c5a`, `627a73c` →
      `5a1695c`, `3117524`: its Skip-seen case begins once the map's 900 ms window is past, with a control inside it),
      RBN-QA-169 A and B (`8d9ef00`, `47feddd` → `29d6f93`, `3a4c11b`: the festival's help says what the timer does, up
      to 2.5 seconds in water-balloon fishing and ring toss only; ring toss's "What does it say?" stops the clock one
      stop at a time, its timer the round's own) and RBN-QA-170 (`d518ebd` → `3d90956`: a companion's action reads this
      exchange's response, a procedure step's included). Generated only, by the unchanged tool, a second generation
      identical: the scene manifest `6c70380` (17 existing entries in each document). Nothing in the agreed scope is
      left out. Left out on purpose, each separately attributable: RBN-QA-125 (`afaf2f5`), 127 (`96f8275`) and 134
      (`b4325f1`), each waiting on its own reviews; RBN-QA-172 (`c2a1616`) and 175 (`5986d0a`), agreed after this
      integration's source was fixed, for the next; 173 (`afef0ca`), 174 (`1e738b7`; a comment-only `f300a0e` to
      follow), 177 (`4d63e7d` and its refinement), 178, 179 and 180 (built on this source), under review; 176 and 181
      (agreed plans, not built); RBN-QA-171 (no candidate: the owner's choice of form, and the transition-free design's
      reviews); `book-voice` (`d9fbc73`, test only); the language follow-up (`6f34bf0`, `55db809`, `349e582`); QA-161's
      part B; QA-120's optional guard `8d298d3`; the `dialect_kansai` message for a bound that runs out; and every later
      candidate. Known and open, not fixed by this cut: RBN-QA-116; the postgame shadows beyond QA-161 and 162 (triage,
      not built); 十分 written じっぷん would gloss "enough" (no line writes it); RBN-QA-135 to 160, confirmed in source
      (CC-148), none built here; the three Cloudroad endings' message from Jinpachi six tiles away; five Windows-only
      path failures Local notes. Art in this cut went to the owner as private captures (QA-163 C's ink, QA-166 A's map
      table, per AC1_ART.md, "implemented provisionally" until Robin approves). The matrix on these bytes, one suite at
      a time from 07:03Z to 09:43Z: 116 of 116 passed (CC-021's 107 in its order and the 9 this cut's items name;
      VALIDATION, CC-022). Units 58,303/0 on `3d90956`. Voice stays paused: every changed spoken line (QA-163's note at
      the three new plaques, Kakeru's, Sanpei's and Hayashi's lines, QA-169's how-to line) has a new key and plays with
      the device voice or silence until a listening check after QA; recordings kept.
      CANDIDATE CC-023 (`index.html` `4d84f291…`, 24,384,000 bytes, built from `3022cea`): CC-022 (`fe868bb`, verified
      by Local CL-291 and, as published, by Agnes 6383006577) plus only what was agreed after it, each by its exact
      commits (cherry-picked with `-x` onto the cut; patch-identical to the agreed commits in full, or for nine over
      every file but `tests/e2e/run.mjs`, merged by hand so that each adds only its own suite; AGREEs listed in
      VALIDATION, CC-023; integrated as `int/cc023`, head `3022cea`, its integrated source agreed by Local (CL-330 and
      CL-331: every pick by patch-id, the list's and runner's hashes, the page rebuilt on Windows to these bytes after
      aligning the 12 platform trim values) and by Agnes 6390439894 (source integration only, not publication or native
      acceptance)): RBN-QA-172 (`748d876`,
      `c2a1616` → `c7d5109`, `aac99d5`: your pet never settles, rests or is placed on water; seen again once there is
      dry ground; Greet together only with a dry spot beside your companion), RBN-QA-173 (`f24c3b3`, `afef0ca` →
      `da7258b`, `6cb9ed8`: Sazanami's fishing station on its rocks, with a rod lashed to it, in both renderers; art,
      provisional), RBN-QA-174 (`2ee9422`, `147fbac`, `1e738b7`, `f300a0e` → `b658979`, `0067ae9`, `3870079`, `a821358`:
      a voyage the crew sails is seen at sea and the fog is shown; the arrival told truthfully when the water is taken;
      a campaign change ends the crossing; the last commit comment only), RBN-QA-175 (`5986d0a` → `021590d`: Ashihara's
      notice board shows the notices it has; art, provisional), RBN-QA-178 (`1105b0e`, `e56104c` → `d986eca`, `de7b85c`:
      each shogi lesson's task in both languages; the rook's two squares named, out of check; the second test only),
      RBN-QA-180 (`67ba07a` → `57d9b6d`: the white box and the red bundle drawn as their tags say; art, provisional),
      RBN-QA-177 (`4d63e7d`, `919a359`, `8022726` → `399c614`, `97cc672`, `675b943`: the festival's pupils with their
      papers, everyone still round the fire, the ring's rest kept per playing, Replay while looking back without a jump;
      art, provisional), RBN-QA-179 (`50634fc`, `b942949` → `a920799`, `6483235`: a lesson, puzzle or game opened from
      the shogi ladder starts at its top, and Back returns to the ladder's place; the second test only), RBN-QA-181
      (`46b8694`, `9cbe4e5` → `094773e`, `847dcaa`: one gift carried at a time, said; the trays show what is on them and
      keep the table's two tiles), QA-180's card (`f4af9c4` → `e0a538e`: the wrong card is gone once the go-between's
      trial is passed), RBN-QA-176 (`35a8369`, `2e216e9`, `8c5d0ed` → `1f0f6aa`, `b3d0759`, `b181af4`: Ashihara's
      quarrels told as they stand, the forge's tag on its door, the gathering over a fade, "Say back" naming who still
      waits; art, provisional), RBN-QA-182 (`7f6fd0d`, `95e8b5f`, `190a275` → `ef4f76f`, `5b7485e`, `97ba6e6`: a tap on
      someone who moves is followed once more; a scene or battle begun meanwhile drops the walk; the last test only),
      the Manybridge origin (`ffd82ce` → `56b90fc`: someone not yet seen walks in from a place the story keeps them, not
      one night's festival crowd), the kanji pad (`93690f1` → `8dd2b59`: every closest kanji stays in view when a pick
      is required), the kept prop line (`2ee20e0`, `12a5492` → `2bc8a5d`, `42a57ed`: kept with its prop, and "Hear it"
      finds its recording), the driver's hold (`ac359cd` → `0a64099`: `RB.world.holdAt`, the same test `arrive()` made
      inline; the driver held where a player is), and test only: the `pets_greet` fixture (`610b7ba` → `52c5d0e`), the
      Windows paths (`9db07a5`, `f3fa22d` → `5fbce3e`, `399e702`), the `manybridge` chart (`e6e47d3` → `1dbe7ad`), the
      `play_ui` New Game+, word-help tap and wording fixtures (`ff154c1`, `e34ce97`, `63f24cc` → `71c042c`, `12a2292`,
      `3dcee25`), the `bookmarks` Next measurement at the phone layouts (`01cbf2f` → `34e8b81`), the `pets_gallery`
      gains (`6cb556c` → `7d2cb31`), `audit_fixes`' F10 line (`d8a1ee6` → `43098c5`) and `battle_anim`'s Assisted
      default (`46e84e2` → `3022cea`). Nothing in the agreed scope is left out. Left out on purpose, each separately
      attributable: the Respond list's fold-press repair (CC-024: proposal CC-193 §3; built since as candidate
      `be29531`, local, excluded from CC-023; the shared tap guard unchanged; a content-size rule in the guard,
      `4451fdd`, withdrawn, never pushed), the `harmony_cutin` painted-section test repairs (CC-024, under Agnes's
      conditions 6390636882; built since as candidate `6314800`, local, excluded from CC-023) and the `bookmarks`
      wide-layout check's repair (CC-024; candidate `dfcaf11`, local, excluded from CC-023); RBN-QA-125 (`afaf2f5`), 127
      (`96f8275`) and 134 (`b4325f1`), each waiting on its own reviews; RBN-QA-171 (the owner's choice of form);
      QA-161's part B; the language follow-up; every later candidate. Known and open, not fixed by this cut: **the first
      mouse press on a Respond card, when the first card has focus-visible styling (given by keyboard focus: of the four
      ways into a battle tested, a mouse click on the foe, a focusable control clicked first, touch taps and the
      keyboard, only the keyboard reproduced it; the pointer ways may have included a click on Next, which the probe
      did not log, so a bare click on the foe's tile is not isolated; a card focused by script in a page where nothing
      focusable had been clicked, as in `card_fold_press`'s first start, also had that styling, so a keyboard-only
      limitation is not established in general; CC-213, Agnes 6394392695), at affected enlarged-text, scrolled layouts,
      does nothing (a second press works; present since `33fc2a0`, FR-1; VALIDATION, CC-023)**; `harmony_cutin`'s
      painted sample and painted geometry checks, classed fixture faults (VALIDATION, CC-023); the Lantern Hall's
      guidance after the companion choice ("Next: here, in Lantern Hall.", no mark on the shrine; since `db05df2`,
      RBN-QA-004; in CC-021 and CC-022 too; repair for CC-024); `fishing`'s unreproduced first-attempt failure
      (VALIDATION, CC-023; reopened if it recurs); RBN-QA-116; the postgame shadows beyond QA-161 and 162; 十分 written
      じっぷん; RBN-QA-135 to 160 (CC-148), none built here; the full log of `sequence_world --only ko.end` lost in CC-021's
      and CC-022's matrices (overwritten by the old runner; their exit codes and totals remain). Art in this cut went to
      the owner as private captures (QA-173's rocks, QA-175's board, QA-177's phases, QA-180's gifts, QA-176's tag),
      "implemented provisionally" under AC1_ART.md until Robin approves. The matrix on these bytes, one invocation at a
      time from 22:53Z on 10-24 to 03:11Z on 10-25 (VALIDATION, CC-023): 167 run; 165 exited 0, 164 of them with no
      finding; `bookmarks` (entry 122) exited 1, classed fixture (the Keep tab's Next read twice during the box's
      entrance; alone, 6/0 three times; a test repair for CC-024); `fishing` (entry 156) exited 1 with a run of Cloud's
      beside it: an unreproduced first-attempt presentation failure, original cause unconfirmed (environment-related
      paint starvation a supported hypothesis, not directly observed; alone, 11/0 three times on Linux and on Windows),
      disclosed and non-blocking; `quest_guide_audit` (entry 151) exited 0 with two findings, both older than this cut
      (the same on CC-021's and CC-022's pages): `rw_depart` a product guidance regression since `db05df2` (RBN-QA-004)
      and `co_main 6→7` the kiln as designed, both with CC-024 repairs proposed. Units 58,358/0 on `3022cea`. Voice
      stays paused: every new or changed spoken line has a new key and plays with the device voice or silence until a
      listening check after QA; recordings kept.
    - **Queued art candidates (Robin approves before push):** the coast road's west exit to Sazanami, which sits on
      open grass where the drawn road stops at the fork (src/content/sz/01_region.js adds the exit for `ed>=2`); and
      RBN-QA-006, the framing of Omi's office cutscene (the four and the desk small at the top of the frame; Omi's
      proportions in the desk shot).; RBN-QA-012, the crossroads signpost's three arms; and RBN-QA-013, Manybridge's first
      entry (`mb.exchange_first` narrates the Tally Exchange across the Long Canal while the camera, which always
      centres on the player, src/engine/60_render.js `updateCamera`, sits on the south entry's paving at 22,41;
      proposal in CC-010: walk to the quay as the scene's staging note says, an opt-in scene camera target in tile
      units, `!view x y` / `!view -`, the default rule unchanged, existing cast outside the Exchange, Gonta's point;
      before/after frames at 1180x757 and a playback for Robin first).
    - **RBN-QA-020 candidate, with Robin (not pushed):** the festival night's arrival (`mp.fest_night`), local branch
      `qa020-festival` (`ba23698`): townsfolk on the night, the two boats unladen by the bridge in the chosen order (the
      lantern boat under lanterns), the bridge's lanterns across its span, a walk to the rail before the boat lines.
      On approval, cherry-pick, build, and run U `mp_ch4`, B `manybridge2`, `festival_games`, `sequence_world --only
      mb2.fireworks`.
    - **RBN-QA-023 (assessment, Robin's decision):** the dakuten row at the chronicle comparison; options in VALIDATION.md.
    - **RBN-QA-024 candidate, with Robin (not pushed):** the Great Kiln's doorway. The seal's art existed but sorted
      just behind the kiln house's wall (prop 6·TS−0.5, house 6·TS), so the plain door showed. A prop def may say
      `onWall` (drawn after the building on its tile; only `co_seal` and the new look-only `co_kilnmouth` set it): the
      glass fills the doorway and runs over its frame; once broken, the doorway stands open, dark, the heat glowing
      inside, glass left on the frame and the step. Local branch `qa024-kiln` (`c6ddc17`). On approval, cherry-pick,
      build, and run B `kiln_door` (15/0 on the candidate) and `story_ch3`.
    - **RBN-QA-029 candidate, with Robin (not pushed):** the Great Kiln's instruction wall draws its two vents upper and
      lower, only the upper opening (`co_kilnwall`); local branch `qa029-kilnwall` (`30444f8`). On approval,
      cherry-pick, build, run `story_ch3` and `staging_chapters --ch=3`.
    - **RBN-QA-027 candidate, with Robin (not pushed):** with Suzu, `co.suzu_ask` (Hiro's story) said "Outside the
      workshop…" while you stood inside by Hiro and Isao; now you walk to the door, fade, and her lines are said just
      outside the workshop's door in co.village (you 43,19, Suzu 42,19), where you are left. Local branch `qa027-suzu`
      (`84f7be9`); B `suzu_ask_outside` 15/0. On approval, cherry-pick, build, and run it with `story_ch3` and
      `staging_chapters --ch=3`.
    - **Shino's idle line (found in RBN-QA-028's review, Robin's call):** before the letters task opens (met, chronicle
      not read) her idle line already says "The invitations are all out"; a fix needs a new line or her introduction
      again.
    - **RBN-QA-026 candidate, with Robin (not pushed):** Koharuno's empty houses (`lq.kh_arrive`: "their thatch gone
      grey") drawn as lived-in Reedwake houses. Opt-in `aged` house (src/engine/29_structart.js; the kit's boxes, the
      light's window glow and the night's window light skip it): grey thatch, weathered timber, dusty dark panes, no
      lamp, no flower boxes; only Koharuno's four houses set it. Local branch `qa026-koharuno` (`bb8b5b3`). Robin's
      call: whether the tree-keeper's hut stays aged after Kayo goes home.
    - **RBN-QA-031 candidate, with Robin (not pushed):** `co.tokiwa_page`: after "…I'm the one who opened it." Tokiwa
      walks to the desk (5,4) and you turn to watch, so the page falls onto the desk the line names. Local branch
      `qa031-desk` (`b1d8cc1`); frames sent to Robin (CC-031).
    - **RBN-QA-030 candidate, with Robin (not pushed):** the Kiln Warden stands in `co.kiln_core` (its existing golem
      look) at 7,4 while `!co_warden_down`, steps to 7,5 after "…slowly rises to its feet.", and a `!refresh` after the
      fight clears it (globe and page left). Not talkable; the fight is still the heart's scene on entry. Local branch
      `qa030-warden` (`7f24d63`); frames sent to Robin. On approval, cherry-pick, build, run `story_ch3`.
    - **RBN-QA-033 IN SOURCE (Robin approved 2026-10-20, `54339ee`, for the next build):** between Cinder Orchard and Snowbell no main quest is open, so the
      Journey said "Nothing pressing" while the narration pointed north (the way is west to the Orchard Road, then
      north). A main quest may now carry `next: { jp, en, until }`, shown in "Now" as "The road on" once it is done
      until `until` holds (src/ui/50_menu.js; a list: the first not yet past); `co_main`'s names west and the Orchard
      Road until `sb_arrived`, then the climb north to the hamlet until `sb_hamlet_seen` (Agnes's 20:53Z endpoint). No
      marker (between chapters nothing is followed, as RBN-QA-011). `validate.mjs` checks `next`. Cherry-picked from
      `qa033-roadon` (`7f948bf`); B `road_on` (new, in the default suite).
    - **RBN-QA-036 candidate, with Robin (not pushed):** a tap on Yae (Yukimiya's counter) did nothing: `tapTile` walks
      to a free place beside the person, and Yae has none (counter, pot, bottles). Now, only when none can be reached,
      the tap walks to the free far side of a counter (or `across` prop) beside them, faces it and acts as the action
      key does there (talk across). Local branch `qa036-counter` (`7bf0030`); B `counter_tap` (new). 30 placements
      beside a counter across the game are within its reach (listed by the test).
    - **RBN-QA-037 candidate, with Robin (not pushed):** Hoshino's first visit: until the first conversation
      (`!seen.sb.hoshino`) Hoshino stands at the north window beside the telescope (8,2, facing out) and the opening
      looks out of it, not at the telescope; two small tables with papers spread (2,5, 6,3) join the wall chart. Then
      the usual place (4,4). Local branch `qa037-hoshino` (`762f86c`); frames sent.
    - **RBN-QA-035 candidate, with Robin (not pushed):** `sb.hamlet_first` plays at the hamlet's south edge (22,33); the
      bell post (22,15) and Kanta (19,19) were out of frame. Robin (2026-10-20): walking the player is fine as long as
      the whole path is shown. So, no fades: you walk up into the square with your companion following (the camera
      follows the whole walk), stop below the bell post, and Kanta comes over from the goats as Kanta calls. Local
      branch `qa035-snowbell` (`a1f014d`); frames sent. On sight approval: cherry-pick, build, run `story_ch4`.
    - **RBN-QA-034 candidate, with Robin (not pushed):** the Snowbell Road's avalanche slope (`sb.lw_road_slope`): read
      right, Gohei crosses first, then you, then your companion (18,3 / 18,4 / 19,4), before the narration; Gohei
      turns for "Phew…" and goes on up after the companion's word. Local branch `qa034-slope` (`ed767e2`); frames sent.
    - **RBN-QA-032 IN SOURCE (Robin approved 2026-10-20 from the frames, `8cfedf2`, for the next build; Robin will
      review it in play when reaching the scene):** the festival lookout's vista
      (`co.reflection` on `co.lookout`, whose surround draws the village at 0.4 scale; no scene camera op). An
      `!interlude co_lookout` picture over the vista lines only (src/ui/42c_interlude_lookout.js, new art under AC-1,
      framed by the lookout's roof edge, posts and rail): `village` (the lit square at the foot of the terraced
      orchard, lantern strings from the stage, the firebreaks pale in the moonlight) for the two vista lines; `seat`
      (the stage hung red and white, the audience, Suzu dancing unless she is with you, Hiro's seat apart with the
      cloth, the slip and the one lit globe) for Suzu's seat line or "Suzu is dancing"; `north` (the road winding up
      to the peaks, glints on the snow) for the snow line. Fades between, as at the tide-watcher's window; every other
      line on the platform. Cherry-picked from `qa032-vista` (`523f9ba`); B `lookout_vista` (new, in the default
      suite).
    - **RBN-QA-012's third sign (Agnes 20:44Z):** the Snowbell Road junction (`sb.road` 16,11) narrates three arms with
      snow on the Lanternfall arm; it joins the opt-in sign variants, with its own snow state, not a global change.
    - **RBN-QA-027 addendum candidate, with Robin (not pushed):** `co.suzu_truth` opened "Before we go in…" inside,
      before Hiro. Now the lead-in and its exercise are said outside the workshop's door (Suzu waits there when not
      your companion: a co.village place shown only while `co_suzu_door`, set and cleared in the scene), then back in
      to Hiro working the blowpipe, cooling the gather at "A fire.", Suzu's ribbon held out over the bench. Root cause
      of "Hiro empty-handed": src/engine/32g_spritepose.js's key regex took lowercase prop names only, so
      glasswork's `pipeA/B/C` failed to parse (a stiff, empty-handed figure in every glassworking scene). Local branch
      `qa027-suzu2` (`5e9b4a0`, on `26bbc7f` = the earlier `84f7be9` replayed on CC-008's source). Not covered (art):
      the worn ribbon stays drawn, no ribbon left on the bench. On approval, cherry-pick both, build, run U
      perform/actors, B `suzu_ask_outside`, `story_ch3`.
    - **The kiln's inside nudge** (Agnes's observation on CC-006, being scoped): inside the Great Kiln the step is
      `'open'`, so the nudge is the generic "You can't take this further just yet"; proposal in CC-020 (the kiln step
      only: name its next place, or an `'open'` nudge of its own).
    - **The guide's far fallback** (RBN-QA-025, a separate review): with a step's needs too deep to resolve it names a
      later step on an unreachable map; the kiln step now names its own places (`atIf`).
    - **Owner-approved language audit (report only):** Claude's game-wide written-Japanese/grammar/furigana review; Local
      shares its reader-comparison findings (CL-027, CL-034). Phase 1 done (scratchpad report, summarised in CC-019:
      23-family inventory; Local's 114 priority headwords judged, 821 contexts read of 17,711; 25 furigana errors
      proposed: 何 なに→なん ×23, 後 あと→ご ×2; send-correction candidates). Phase 2a (game-wide furigana consistency, CC-021) done: 18 furigana
      errors on 36 lines, 10 pedagogy inconsistencies, the furigana rule's enforcement gap in English feedback fields.
      CC-020 gave the 25 phase-1 candidates in context and corrected the identifier wording (a ruby-only fix keeps the
      recording id; the lookup key changes). Phase 2b done (CC-024, CC-025): base scenes 9,078 of 9,078
      (16 findings, no grammar errors); expansion scenes and code-spoken lines 9,222 of 9,857 (32 findings: the
      machine-undo template's を after a verb, Nao's 私, Suzu's register); learning text in full (22 findings, 8 wrong
      answer keys: T01 ぢ/づ, T02 multi-kanji exam words, T03 shared glosses, C09 かねる). T01 and T02 confirmed by Agnes as genuine
      defects; repair plans and tests posted (CC-026). C09 re-tiered to a pedagogical-example question, LX03 to
      ambiguous, T04 narrowed. **T01 and T02 implemented (Robin's approval, revised per Agnes 13:33Z), FIX_READY in
      source (`026965b`) and in candidate CC-007 (`343f54b8…`, with RBN-QA-028), READY_FOR_QA; T02's 々 wording refined after Agnes's review (the counting said in the question):** `learn/20_tasks.js` (じ/ぢ, ず/づ, ジ/ヂ, ズ/ヅ asked by base kana + dakuten, real
      words only for their completions, the same hint on the Foundations one-kana blank), `lang/50_answers.js` (the
      `same_sound` note; still wrong), `learn/60_exams.js` (multi-kanji words name the target's place among the word's
      kanji, 々 counted, kana not; distractors exclude the word's characters; 々's option without the word's reading).
      U `kana_homophones` 1463/0, B `kana_homophones` 174/0 (CC-006 fails 77). Found on the way, not changed (owner's
      call): non-words in the kana word pool (25 F/E), small ァィゥェォ and ウォ sharing rōmaji with ア…/ヲ, 315 glosses
      quoting their own kanji in the exam prompt. Phase 2c (4,170 of 4,170 single-reading forms: 1 furigana error = F10,
      5 questions) and 2d (the 635 template items: 17 findings, no grammar errors) are done and posted (CC-028);
      every inventory family has now been read. CC-007 posted as CC-027. No fixes from
      findings alone; send corrections, if Robin approves, as SC10-SC14.
    - **RBN-QA-012's second sign (Agnes 09:39Z):** the terraces' crossroads (`co.terraces` 18,17) narrates four arms;
      the prop is the shared rectangular `sign`. Both signs become opt-in variants (three arms in Reedwake, four on the
      terraces), placed only there, with their own directions.
    - **RBN-QA-015 candidate, built and with Robin (not pushed):** the Undercroft's drained walkways (mb.under1 26-28,
      2-4; mb.under2 31-32, 18-20) as walkway stone under the floodwater props instead of shallow water. Local branch
      `qa015-walkway` (`ac2014b`, a worktree in the scratchpad); on approval, cherry-pick it onto the task branch, build,
      and run U `mb_ch3`, B `manybridge` and `living_world`.
    - **RBN-QA-017 candidate, with Robin (not pushed):** the First Bridge's spans all water until its naming (local
      branch `qa017-bridge`, `0942e4f`; option (b), rows 5-10 only, was rendered as the no-collision-change alternative).
    - **RBN-QA-016 (assessment, Robin's decision):** the shared "Yes, do it" intention confirmation (E7/E17) and the two
      待つ Wait controls in five procedures; options in VALIDATION.md and CC-013, nothing changed.
    - **Blockprint Row's arrival (QA-013's second establishing scene, queued with it):** `mp.arrive` narrates the
      drying sheets while the camera sits on the entry (22,30); the yard (x 3-13, rows 19-22) is off screen, and its
      props are the generic `laundry` (a shirt and cloths), not printed sheets; Sanpei (7,8) never comes to meet you.
      Proposal in CC-014: the scene camera target or a walk to the yard, Sanpei meeting you, and an opt-in "printed
      sheets" variant of the drying-line prop (new art: Robin's approval).
    - **RBN-QA-018 candidate, with Robin (not pushed):** the rehearsal on the stage (local branch `qa018-rehearsal`,
      `b82a0ab`), and the dress rehearsal with actors on the stage (`0fcd5db`, Agnes 08:38Z: at step 5 Genta on the
      stage at 13,3 until the trap opens, flinching at the jolt, and Saku too when Saku's quest is done), and back from
      the Understage (`d3bd8f4`, Agnes 09:03Z: Genta on the stage at 13,4 until the festival's eve; he and Saku hold
      their scripts through "the actors are hugging their scripts"). Its flow
      defect (Manbē's introduction skipped at step 2) is fixed in source (`2ee6378`). On approval, cherry-pick both
      commits, build, and run U `mp_ch4`, B `manybridge2`.
    - **AG-2, complete and gated (not pushed):** every line the prologue and Reedwake show (441 lines, 473 displays)
      reviewed and audited; the report is docs/review/align/AG2_REVIEW.md on the local branch `ag2-work`. Robin has the
      before/after evidence and decides on publication. To publish: rebase `ag2-work` onto the branch, build, run U
      `speech_align_ag2`, `align_registry`, `word_help*` and B `speech_ag2`, `speech_mark`, `speech_relations`.
    - **Two container restarts** lost running agents; their work was saved as commits and cherry-picked (VL-1 05032a5,
      VL-2 4c32170…a451a91).

    **Every line spoken, first batch: the prologue, Records replays, doors and objects, field puzzles, oral histories
    (Robin, 2026-10-19: "every line in-game should have spoken lines with properly highlightable text as well. This
    goes the same for the Records section"; "the closed door in Reedwake"; "The swinging board between Old Yasu and Ren
    … along with its clamp - no Narrator speaking. Old Yasu's story, when listening, has not begun being spoken").**
    - **Why they were silent:** the voice finds a recording by the scene id a line is shown under
      (`RB.voicebank.wanted`), and these lines were shown by the game's own code with none, and never listed for
      recording (tools/voice/lines.mjs read only the scenes' `say` commands).
    - **Now:** each is shown under a stable scene id and listed for recording through `RB.content.spokenLines` /
      `RB.content.spokenSources` (src/content/00_prologue.js explains both): `prologue` (the six captions, moved to
      src/content/00_prologue.js unchanged), `code.door` and `code.prop` (src/engine/50_world.js), `code.fw` (every line
      the six field puzzles can show: looks, actions, weaves, hints, resets, rewards; computed lines run over every
      arrangement the puzzle allows: src/engine/55_fieldweave.js `spoken()`), `code.history` (each oral-history
      fragment at every learner level, said by its teller: src/ui/75_activities.js), `code.battle` (each creature's
      intro, its line once settled and phase lines, each map's own: src/ui/80_combat.js). Records replays' beats carry
      their scene id (src/engine/58b_records.js).
    - **The prologue and Records replays are spoken lines in their caption slip** (src/ui/43_sequence.js): Japanese
      and English as in the dialogue strip, the spoken word marked, pointing pairs words (src/ui/22_speech_mark.js
      now also covers `.seq-view`), a Voice button, spoken automatically when the strip would be; quiet when left.
    - **Recordings:** 574 new ones (narrator 515, Yasu 16, Tetsu 16, Kasane 25, Isao 1, Oyone 1) in
      docs/future/voice/production/supplements/SL1_SUPPLEMENT.json (append-only, after the batch; built by the new
      tools/voice/supplement.mjs). Until the worker records them these lines are silent with prepared voices, as before
      (or the device's voice where it has a Japanese one). GO.json and the frozen manifest are unchanged.
    - **Not yet:** the inventory's other code-shown lines (about 2,000: whereabouts, battle intros, companion reactions
      and thoughts, Atlas, pages, press, cases …), Company memory replays (`RB.sequence.replay` drops the beats' scene
      id), and the panels (fishing, shiritori, verbs). REQUIREMENTS.md XP136.
    - **With it (Robin's playtest, 2026-10-19):** SC10 sends Nao's 葦 as あし (it was read "goku"); the writing pad keeps
      one size while a character is written in a desktop window (at least 900×560; a phone still changes, the space it
      would need takes the canvas under its minimum); Voice A / Voice B read "More feminine." / "More masculine."; Pat
      brings the pet's picture into view and shows its line. VALIDATION.md "Every line spoken: the first batch".

    **Playtest fixes, second round (Robin, 2026-10-19).** VALIDATION.md "Playtest fixes, second round"; REQUIREMENTS.md
    XP139–XP145.
    - **Road events stand on the road** (src/engine/53_town.js `roadEventAt`/`eventHere`/`placedAt`, the `roadev` term;
      src/engine/90_game.js runs only an unplaced event on arrival; src/content/zzz_living/05_author.js `at`;
      06_road_folk.js; each region file's `L.road`). Validator: tests/unit/road_events.test.mjs. Placing tool:
      tools/review/map_ascii.mjs.
    - **Chart coast** (src/ui/50_menu.js `COAST`, `ISLES`, `coastPath`), **music on fresh entries** (src/engine/
      50_world.js `songAround`, `fresh`), **Heat through a ward word** (src/engine/95_combat.js `wardBlock`; the g1
      Demanding group in src/content/ch6/20_maps.js; tests/fixtures/combat_golden.json regenerated), **stamp slips**
      (src/ui/15_award.js `stamps`), **"Have you seen…?" spoken** (`code.wb`, src/engine/53_town.js `answersOf`),
      **battle icon registry** (`RB.battleArt`, src/ui/80_combat.js `BI`; the drawings in src/content/battle_art/ when
      they land).
    - **After the first push of this round:** a named person a road event places where they already stand steps aside
      while it waits (05_author.js `asides`); "Have you seen…?" answers count buildings' doors, and the recording list
      (tools/voice/lines.mjs) lists a code-shown line once per speaker (code.wb 806). SL3 supplement (1,292
      recordings, all code.wb: 648 questions in the player's four voices, 644 answers) is ready for Local after the
      current batch: docs/future/voice/production/supplements/SL3_SUPPLEMENT.json.
    - **Next:** AR-3 is drawn and waiting for Robin's look, local only (src/ui/43a_seq_ch1.js: blue water, the river's
      lines between a base and a front layer, a spit of land under the hut and the bridge's end, Kōji's cup on his own
      arm, hands along the forearm via `RB.portraitBody.elbow`; a before/after sheet was sent). The battle icons'
      drawings; AG-2 stays local.

    **Playtest fixes (Robin, 2026-10-19): the Stamp Book, revisits, Sae.** VALIDATION.md "Playtest fixes: the Stamp
    Book, revisits, Sae"; REQUIREMENTS.md XP137, XP138.
    - **Stamp Book** (src/content/records/00_stamps.js, src/engine/58b_records.js, src/ui/15_award.js, 66c_records.js):
      field-guide stamps are Stamp Book stamps now (one a region, `guide:<region>`, pressed by `roamingWon` through
      `RB.stampBook.press1`, announced by a "Stamp pressed" award slip); a stamp may carry `known` + `veil` (shown
      veiled until its place is known: the Flood Cellars until Chapter 2); the chapter-keyed families sort by
      `RB.volume.numberOf`. The field guide still leaves bosses out (Robin may want them in: change the boss filter and
      also check after scripted wins).
    - **Revisits** (src/engine/53_town.js `pastTalk`, used by src/engine/50_world.js `talkTo` and the `usual_talk` hook):
      at a routine's place, plain talk from before the routine began is replaced by the routine's line.
    - **Sae** (src/content/ch1/31_scenes_mill.js): the gear pin asked for only until the wheel turns.

    **The repository cleaned; the voices live (Robin, 2026-10-19).** Screenshots, the Ensemble listening media and
    review captures are out of the branch (2,055 files, 479.8 MB; in the history at 185ad9c; `.gitignore` keeps new
    captures out): about 606 MB published, from 1,085.8 MB. Game and voices together would still be about 1,166 MB, so
    the voices get their own site: the worker creates A-Birdi/Road-of-Borrowed-Names-voices with Robin's GitHub CLI
    (this session may not; 403), turned on its Pages and published build `2026-10-19.1` (main `b2496a81`); then
    `HOSTED_BASE = '../Road-of-Borrowed-Names-voices/ja-JP/'` in src/audio/52_voicebank.js, rebuilt, voice tests, pushed.
    No Pages setting needs changing. Settings › Audio now shows one "speak automatically" switch, the one in effect
    (Robin saw two once the recordings played); browser suites run without a voice site unless they ask
    (`page(…, { voiceSite: true })`, tests/e2e/lib.mjs).
    About & credits now credits the voices. REQUIREMENTS.md XP135; docs/hosting/RUNTIME_PUBLISHING.md.

    **Voice build 2026-10-20.1, stage 1 (the worker, CL-041; checked here as VB-1).** Voices main `f5a0dea`,
    index `scriptContentHash` 8495fd8f3ced = CC-007's source (`026965b`): 25,686 recordings (16,590 lines + 9,096
    references); new SL1 574, SL3 1,292 and the SC10–SC14 redos; 2,654 missing = stage 2 (SL4 1,779, SL5 868, SL6–SL9 7).
    Checked here that CC-007 and CC-006 both pick them up: `tools/voice/site_pickup.mjs` (new; the site's index against
    the manifest rebuilt from each build's source) resolves all 574 + 1,292 + 5 in both, the redos as their new takes,
    nothing stale; in Chromium both pages resolve all 1,871 stage-1 lines with the game's own `lineFor` and play seven
    samples from a copy of the published index and recordings (VALIDATION.md "VB-1"). For stage 2, rerun
    `node tools/voice/site_pickup.mjs --site <voices>/ja-JP --sets SL4,SL5,…`. The size guard
    (tools/publish/site_size.mjs) now leaves a clone's `.git` out and reports it apart (the worker: a 607 MB site read
    as over because of ~544 MB of packed history).

    **SC5–SC9 (Robin's final listening round, 2026-10-19: "get these redos sorted, then push the voices live").** Five
    one-word send corrections (頁, 灯守, 台詞 ×2, 釉) in SEND_CORRECTIONS.json; the worker records them.

    **SC4 and withheld references (the worker, after Robin's review round 3).** The narrator's reading of 潮止まり
    (`r1-ref-e5bf48bf7ab94ff8`) is sent as シオドマリ (SEND_CORRECTIONS.json; §7 step 8 names katakana and references).
    A results file's top-level `withheld` names reference readings tools/voice/voice_site.mjs leaves out of the site
    (VOICE_DELIVERY.md §4); the game says those with the device's voice, or hides the control. For Robin's choice on
    大石, 母港, 分類名 (and 三里); nothing withheld yet. READINESS.md (2026-10-19), VALIDATION.md "SC4, and reference
    readings left to the device's voice", REQUIREMENTS.md XP133.

    **Send corrections SC2 and SC3 (Robin's listening decisions, 2026-10-18, relayed by the worker; 50 redo, 101 keep).**
    The narrator's wing-10 tablet line (`r1-6843cbc80ebf3837`) is sent with ふだ for 札; Nao's `r1-2d3ac586bb0e7209` is
    sent without the comma before か. Same ids; appended to supplements/SEND_CORRECTIONS.json; VOICE_DELIVERY.md §7 step
    8 widened; the listening page rebuilt. The worker records them. Lines that may share the faults, the worker's
    lighter reverb (Tide Clerk, Gardener, Nameless Bridge) and the trim finding (1,657 takes, Robin to decide) are in
    READINESS.md. VALIDATION.md "Send corrections SC2 and SC3", REQUIREMENTS.md XP133.

    **CW-1, the traveller's setup book: approved by Robin and pushed (2026-10-18: "Looks good … You can push the
    changes you prepared here").** The candidate (`cw1-candidate` at faad98b) is merged into the task branch unchanged;
    not deployed. VALIDATION.md "CW-1", REQUIREMENTS.md XP134, docs/review/cw1/FIELD_INVENTORY.md.
    - **What:** five steps (Learning on two pages; a Summary that is the review, with Edit and Return); the Settings
      book as a draft of the setup, applied at Begin; printed leaf turns (src/ui/39_leafturn.js) to the package's
      motion contract; folded corners; ornaments as CSS-drawn SVG (sources in docs/review/cw1/ornaments/).
    - **Tests:** B `cw1_setup_book` (new) 86/0; U `cw1_leafturn` (new) 41/0; migrated to five steps: `create`,
      `ui`, `fr1_defaults`, `fr1_opening`, `settings_review`, `shift_load_regression` (helpers in tests/e2e/lib.mjs:
      `settled`, `beginJourney`, a flexible `setOut`).
    - **Evidence recipes:** `tools/review/cw1_capture.mjs` (matched stills, both builds), `tools/review/cw1_motion.mjs`
      (live clips, stepped renders, frames, timings). The gallery and ZIP went to Robin; they are not in the repo.
    - **Approved and merged:** a material change to the setup book's look or motion from here on needs a fresh
      before/after for Robin (Robin's art gate, as for AR-1).

    LP-1: Robin's Firefox report is resolved after a browser configuration change (hardware acceleration restored,
    C-90). The improvements are kept, and the README has a troubleshooting note. State and results: VALIDATION.md
    "P18 — Plan B", "LP-1" and "VA-1".
    Also Robin's two light notes: the room's shadow has rounded corners; the lighthouse deck has none. **P02 (foundations), P03 (learning evidence, task families,
    Mastery, What I can do), P04 (encounters), P05 (the living world) and P06 (records, pastimes, the book) are
    done**; P07 (expeditions) is under way: the engine and the pilot, the Flood Cellars under Reedwake's warehouse
    (a hatch there, twelve-chapter journeys after Chapter 2), are done, as are the Atlas's commissions (a board in the Lantern Hall), delvers (people from the journey
    met by chance in the cellars and at the Atlas camp) and the ten dungeon families' templates; P07 is done (phase end: browser suites pass, F/Ren PASS, unit 30,197/0 after
    two fixes); P08 and P09 (Manybridge, Chapters 3 and 4: the Exchange, barge routing, the Undercroft; the press,
    the stage, the Understage, the river festival and its games) are done (phase ends in VALIDATION.md "The
    expansion, P08 and P09"; F/Ren PASS, unit 33,136/0); P10 (the Keepers' Road, Chapter 7, and the seams of the old
    Chapters 3–4 as 5–6) is done (phase end in VALIDATION.md "The expansion, P10"; F/Ren PASS, unit 35,932/0); P11
    (Kotonoha and the sea: Lanternfall as Chapter 8, Kotonoha as Chapter 9, the licence, sailing and two ports) is
    done (phase end in VALIDATION.md "The expansion, P11's phase end"; route F/Ren to `ko_done`, unit 40,163/0);
    P12 (the Cloudroad, Chapter 10) is done (phase end in VALIDATION.md "The expansion, P12"; route F/Ren to `cr_done`,
    unit 43,709/0); P13 (Steamhollow, Chapter 11) is done (phase end in VALIDATION.md "The expansion, P13"; route F/Ren to
    `yn_done`, unit 46,074/0 on a clean copy); P14 (the twelve chapters joined, four epilogues, the farewell) is done but
    for one test, the chapters' routes chained from a new journey (VALIDATION.md "The expansion, P14"; route F/Ren from
    Chapter 11's fixture to `ch6_done`); **P15a–d are done: the Hall of a Hundred Tales, its engine, the way in, all
    ten wings, the rewards for all ten (Tsuru's last conversation and keepsake, the travel volume's pages, the
    wing's note) and its browser test `tests/e2e/hall.mjs`** (docs/future/work/P15_POSTGAME.md; decisions F-118 to
    F-133; VALIDATION.md "The expansion, P15"); **P15e is done: the nine old guardians** (`src/content/guardians/`,
    shrines in `src/content/zz_guardians.js`, the honest record in `src/engine/98g_guardians.js`; F-135; unit
    `guardians`); **P15f is done: Ashihara Shinden, the new settlement** (`src/content/settle/`; F-136; unit `settle`);
    **P15g: the returns and the companions' postgame beats are done** (`src/content/returns/`; F-137; unit `returns`),
    and shogi's two places (Snowbell's abandoned game as a puzzle at its place, Fuku and Isamu at the hill bench:
    `src/content/pastimes/60_postgame.js`, `src/ui/88_shogi.js`; unit `pastimes_post`); **P15g is done** with A Quiet
    Cast's coast (Sazanami's rocks and the boat, six fish, twelve situations: `src/content/fishing/70_coast.js`,
    `src/content/zz_coast.js`) and the boat's destination after the story, the One-Pine Islet (F-138; unit `fishing`,
    `pastimes_post`; browser `tests/e2e/fishing_coast.mjs`); **P15h is done: the postgame's phase end** (unit
    `postgame_phase`; the clean copy of 3f0841e 51,426/0; F-139, F-140). **P16, the art pass, is under way**
    (docs/future/work/P16_ART.md): **P16a done** (the census, `tools/art_census.mjs`); **P16c done** (the travel volume's
    33 missing paintings: the six new chapters' 13 pages and the 20 after the story, `src/ui/43g_seq_paint.js` …
    `43n_seq_post.js`; F-141; unit `sequence_p16` 363/0, browser `sequence_p16` 41/0 + 62/0); **U05/U06 done** (the book
    on every surface, the classic folio retired with a parity baseline; F-142; then the small-screen defects the suite
    found, F-143); **P16b done** (the 46 interim creatures each on a family of its own, on the creature kit
    `src/ui/78u_creature_kit.js` and `78v`…`78z_kit_*.js`, with their map figures drawn from the same drawings; unit
    `creatures_c`, browser `tests/e2e/creatures_c.mjs`; F-143); **P16d done** (the nine regional kits' 63 props reviewed and
    the weak ones redrawn, the yukata's cut, the hood on the Harmony code bust; F-144). The census now reads 0 interim
    maps, 0 borrowed creatures, 0 interim volume plates (`node tools/art_census.mjs --check`). Next: P17 (closure:
    language, accessibility, speed, a complete browser run), then **VA-1, the voice audition, queued last (C-83)**:
    Robin's package is in docs/future/voice/ (the addendum, sections 01–18, and its templates); start it only after
    P17, run its packets VS00–VS07, and stop at the listening gallery for Robin (no whole-game synthesis, no final
    cast, no purchases; hosted routes without existing access go into one consolidated request). Then Robin's
    review at completion (XP100).
    The chained route from a new journey is done (XP79: one uninterrupted run, all 17 legs, 2,433 site visits, to the
    ending, no problems). Still to do: the complete browser run (P17). Routes for the new chapters from fixtures:
    `PURSUE_FROM=tests/fixtures/campaign/F-ren-ch2_done.json PURSUE_EDITION=2 node tests/e2e/pursue.mjs F ren 'mb1_done@sg.|mb.@mb_main'`,
    `PURSUE_FROM=tests/fixtures/campaign/F-ren-mb1_done.json PURSUE_EDITION=2 node tests/e2e/pursue.mjs F ren 'mb2_done@mb.|mp.@mp_main'`
    and (Chapter 10) `PURSUE_FROM=tests/fixtures/campaign/F-ren-ko_done.json PURSUE_EDITION=2 node tests/e2e/pursue.mjs F ren 'cr_called@ko.|sg.|lf.|lf2.@cr_main>cr_done@sg.|lf.|lf2.|cr.@cr_main'`.
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
   **Art queue (FR-1 F13): AR-1 Mill, approved by Robin and pushed (2026-10-17).** The Old Mill's stair-well and the
   exterior waterwheel's attachment, with the millstone reviewed. Robin reviewed the before/after package and approved
   both changes ("Both art changes are excellent, push them both."). The approved candidate (local commit 2dcd9d4,
   build f4477b81…) is on the task branch unchanged. Report and evidence: docs/review/ar1_mill/AR1_MILL_REPORT.md.
   Robin's art gate stands for later art: a before/after for Robin before pushing art.
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
