# 12 · Roadmap: a drafted order of execution

*Expansion plan, draft 2 (2026-10-07, after Robin's answers). Planning only: phases begin only when Robin
authorises them.*

Robin said time and difficulty are no issue, so the order below is chosen for **quality and risk**, not speed:
- foundations before content, so each region is built once, on finished systems;
- one complete example of a new format before many (one Hall wing before ten);
- the art pass last, as Robin asked.

Effort sizes (S, M, L, XL) are relative scope including content and testing, not durations.

## Overview

| Phase | Name | Main contents | Gate to start |
|---|---|---|---|
| **0** | Listen and decide | Robin's playthrough feedback; the remaining addendum reviews; the open and to-confirm items in [11_CONTRADICTIONS.md](11_CONTRADICTIONS.md) (part A2, part B); spec amendments written | Robin finishes the playthrough |
| **1** | Quick wins | ~~The audit's defects~~ (done 2026-10-07); the one-guess handwriting pad (C-14); the two Ledgers' names (C-58); honest response previews (E5); measuring what players meet (L19); load-time measurement (S6) | C-58 confirmed |
| **2** | Language foundations | The evidence log, assistance categories, mastery exams and stars, word pages, sentence forging, validator upgrades, the review ledger | — (C-13, C-14 decided) |
| **3** | Encounter engine | The actor model; Wait; conditions; arrivals; wanderers; objectives; procedures; social encounters; Resolve this step; story-dungeon help | C-08, C-60 (C-09 decided) |
| **4** | World systems | Story phases, seeded streams, change beats, routines, "have you seen…?", road events, return keys | — |
| **5** | Records | Stamp book, travel volume (interim art), personal seal, Main Menu gallery, replay, Pastimes, the folio's regrouping | C-20, C-19, C-34 |
| **6** | Expeditions | The expedition framework, persistent condition, previews, Atlas commissions as Atlas run types, delvers, a pilot side dungeon | C-57 (C-03, C-18 decided) |
| **7** | Manybridge (new Chapters 3–4) | The edition boundary (behind a development switch); the city; the press; the stage; manzai; the festival; the yukata cut | C-54, C-55, C-22, C-32 |
| **7b** | The Keepers' Road (new Chapter 7) | The keepers' road, the scriptorium, the vigil; folklore and records systems in use | C-33 if hanafuda joins the pastimes later |
| **8** | The sea and Kotonoha (new Chapter 9) | The Harbourmaster's quest, sailing, the boat home, Sazanami, East Landing, Kotonoha's early visit and main chapter | — |
| **9** | The Cloudroad and Steamhollow (new Chapters 10–11); **the edition ships** | Both chapters; the separations; the twelve-chapter edition released at once | C-56, C-59, C-61 |
| **10** | The postgame | The Hall of a Hundred Tales (one wing, then ten); superbosses; the new settlement; pastimes (shogi, karuta, shiritori v2); the Cinder festival revisit | — |
| **11** | Expressive portraits, second round | The portrait ideas Robin left for later: systems only; the drawing belongs to the art pass | Robin asks |
| **12** | Native review | Language and culture review of all new content (also continuous from Phase 2) | A reviewer |
| **Z** | **The final art pass** | Outlined only, as Robin asked | Robin: "I'm happy with the final product" |
| **Final** | Final validation | The full 16-combination matrix and every audit on the art-complete build | Robin calls it |

---

## Phase 0 · Listen and decide

- **Robin's full playthrough feedback** comes first. It may reorder everything below.
- **The remaining addendum items** that need Robin's eyes: HX33, HX43 and HX45 (scenes and sequences at play speed),
  WI5 and WI26 (gestures and portraits at play speed). They are recorded in docs/expressive/CONTRACT.md.
- **Decisions:** part A of [11_CONTRADICTIONS.md](11_CONTRADICTIONS.md) was answered on 2026-10-07. Still to come:
  the open items in part A2 (C-33, C-54, C-55, C-56, C-61), the four to confirm (C-57 to C-60), Suzu after the
  playthrough (C-62), and part B.
- **Spec and contract amendments** written for the decisions taken ([02_FOUNDATIONS.md](02_FOUNDATIONS.md) S8),
  and REQUIREMENTS IDs reserved for each feature.
- **The open Harmony question** (one technique or charges) decided. The plan recommends keeping one technique
  (E18).

## Phase 1 · Quick wins (independent of the expansion's scope)

| Item | Why now |
|---|---|
| **E5** honest "effect here" line on every response card | Robin expects it; it teaches; small |
| ~~**Defects**~~ from [11_CONTRADICTIONS.md](11_CONTRADICTIONS.md) part D | **Done 2026-10-07**, with tests (VALIDATION.md) |
| **The one-guess handwriting pad** (C-14): one guess per character, free redraws, "Show more suggestions" marked as assisted | Robin decided it; it changes how help is recorded, so it comes before stars |
| **The two Ledgers' names** (C-58) | A few labels, once Robin confirms the names |
| **L19** measure the language interactions a playthrough meets | Answers Robin's first question with data |
| **S6** load time and memory in Firefox and on the foldable | The ceiling is 100 MB (C-21); this checks the phone stays quick |

**Tests:** focused unit and browser tests per fix; F/Ren once at the end of the phase.

**Effort:** M.

## Phase 2 · Language foundations

- **The evidence log** (L1), with the new kanji and construction kinds and the migration.
- **Assistance categories** (L2), with C-14's rule.
- **Mastery exams and stars** (L3), **word, kanji and kana pages** (L4) and **"What I can do"** (L5).
- **Spacing by days** (L6) if approved, and **the kanji chart's record** (L20).
- **Sentence forging** (L7): engine, judge (generalising the letters' reply families), support ladder, authoring
  templates.
- **The L8–L17 task families**: templates and judges, with one worked example each at all four profiles.
- **Validator upgrades and the review ledger** (S5).

**Tests:**
- unit tests for every judge and the migration;
- browser tests for each task family on fixtures;
- F/Ren (the record changes touch every answer).

**Effort:** XL.

## Phase 3 · Encounter engine

**Contents:**
- **E1, the actor model.** First as a pure refactor: every existing battle test passes unchanged before anything
  new uses it.
- Then **E9** (Wait), **E4** (conditions, with the curve test extended), **E2** (arrivals), **E3** (wanderers),
  **E6** (objectives), **E7** (procedures), **E8** (social encounters), **E10** (companion options and plans),
  **E11** (Resolve this step), **E13–E15**, and **E19** (story-dungeon help).
- **E12** (two-row formation) only when a set piece needs it.

**Tests:**
- the battle suite;
- the difficulty curve with conditions and arrivals;
- the geometry audit (with 4–5 actors if E12 is built);
- new encounter-type tests on fixtures;
- F/Ren.

**Effort:** XL.

## Phase 4 · World systems

**Contents:**
- **S1** (story phases with the validator's reveals check) and **S2** (seeded streams).
- **W1** (change beats, framework and the existing towns' first beats).
- **W2** (routines), **W3** ("have you seen…?", and saving last-seen), **W5** (road events on the existing roads
  first), **W6** (return keys; the sealed spots wait for the new words).

**Tests:** fixtures per phase; routine-tick tests; road-event recurrence tests; F/Ren.

**Effort:** L.

## Phase 5 · Records

**Contents:**
- **K1** (stamp book) and **K3** (personal seal: designed at creation, defaulted for older saves).
- **K2** (travel volume system, interim compositions) and **K4/K5** (the Main Menu gallery with the Continue look,
  spoiler veils, and the device preference for reveals).
- **K6** tier 1 ("watch it again" everywhere), **K7** (Pastimes), **K9** (NG+ carryover), and **K10** (the folio's
  regrouping, with the layout audit re-run).

**Tests:**
- save rules: copy carries records, delete removes them, nothing is written cross-slot;
- the Main Menu with zero, one and six saves;
- the layout audit at all viewports, English and Japanese labels;
- F/Ren.

**Effort:** L.

## Phase 6 · Expeditions

**Contents:**
- **D1–D4:** the framework, persistent condition, stations, restart rules, previews, and a proper battle hook that
  replaces the Atlas's MutationObserver.
- **D7:** Atlas commissions, built as Atlas run types; the Atlas keeps adapting its practice words (C-18, C-57).
- **D8:** delvers.
- **A pilot optional dungeon** in an existing region, to prove the whole loop: entrance preview, stations,
  persistent condition, restart, shortcuts, an apprenticeship pattern.

**Tests:** an expedition curve test (whole runs on the player model); restart and reset tests (D3a); F/Ren plus the
pilot.

**Effort:** L.

## Phase 7 · Manybridge (new Chapters 3 and 4)

**Contents:**
- **S4: the edition boundary.** The edition field, old saves shown as such and never altered, new flags, the
  display numbering map, the save fixtures (including a Robin-like finished save), and C-54's extras if approved.
- **A development switch.** The new chapters stay off in the build Robin plays until all six are finished, so saves
  are stopped once, when the edition ships (C-54).
- **R1:** two chapters: maps, people, creatures, bosses, dungeons, side quests, and change beats for Reedwake and
  Saltglass.
- **C15** (the press), **C11** (manzai), **C10** (the festival, its planning and games), **C10a** (the yukata cut in
  every renderer, interim art), **C1–C8** content, and **C5** (the dialect field guide).
- **Music:** the Manybridge zone (shamisen, taiko, clappers), and the ladder re-tiered (C-22).
- **Bond:** the table rebalanced (C-32).

**Tests:**
- F/Ren through the new chapters;
- a focused companion test for each companion's Manybridge beats;
- profile-specific checks for the festival tasks;
- the save fixtures;
- the layout audit for new screens.

**Effort:** XL.

## Phase 7b · The Keepers' Road (new Chapter 7)

**Contents:**
- **R8:** the keepers' road, the lodge and its scriptorium cave, the vigil and its boss, five side quests, and the
  change beats; Old Hisae; the shuttered hall the postgame opens.
- **C9** folklore told several ways, and the records it feeds (stamps, travel-volume pages).
- **Music:** a biwa-led zone, tiered in the twelve-chapter ladder (C-22).
- **A-profile classical phrases**, glossed and labelled, queued for native review.

**Tests:**
- F/Ren through the chapter;
- all four profiles for the tellings (content that depends on the Japanese level);
- a focused Ren test (their beat must not touch their personal quest);
- saved-state fixtures for The Keeper Who Stayed's outcomes.

**Effort:** L.

## Phase 8 · The sea and Kotonoha (new Chapter 9)

**Contents:**
- **W7:** the Harbourmaster's quest (stages across chapters), the sea map and boat mode, sea situations, and the
  travel log.
- **W8:** the boat home.
- **R6:** Sazanami and East Landing.
- **R4:** Kotonoha's early visit (side content), its main chapter (9) with the Root Hollows and the "in danger"
  separation, then postgame.

**Tests:**
- the sailing mode (keyboard, touch, skip, story events in skip mode);
- Kotonoha at each phase from fixtures, and Chapter 9 played with and without an early visit;
- F/Ren with and without the quest;
- each companion's separation and reunion in the Root Hollows.

**Effort:** XL.

## Phase 9 · The Cloudroad and Steamhollow (new Chapters 10 and 11), and the edition ships

**Contents:**
- **R2** and **R3**, including two separations (C-12): staying behind at the Mist Barrier, and the disagreement in
  Steamhollow, with apologies and understanding (C-59). The solo encounters are tuned for one.
- The baths by pronouns, with the comfort setting (C-27, C-56).
- **The twelve-chapter edition ships:** the development switch comes off, the playtime target is restated (C-61),
  and old saves show as from the six-chapter edition.

**Tests:** F/Ren; the solo section with each companion's reunion; the mediation climax's conclusions on saved-state
fixtures.

**Effort:** XL.

## Phase 10 · The postgame

**Contents:**
- **D9:** the Hall of a Hundred Tales. **One wing first**, played and judged by Robin, then the other nine.
- **E16:** superbosses. **R7:** the new settlement.
- **Pastimes:** shogi with its beginner's ladder (lessons, hasami shogi, the small board, mini-shogi, handicap
  games, tsume puzzles), karuta, shiritori v2, and hanafuda if Robin says yes (C-33).
- **The Cinder Orchard festival revisit** (sealed note S8).

**Tests:**
- Hall wing tests: suspend and resume, reprieves, emergency retreat, floor restart;
- the shogi engine's legality tests;
- F/Ren through one wing.

**Effort:** XL.

## Phase 11 · Expressive portraits, second round (when Robin asks)

The ideas Robin left for later on 2026-10-06 (HANDOFF.md):
- **Expressions for the two-thirds of lines without a tag**, and for the player's lines. A tool *proposes* tags from
  each sentence; the scripts get ordinary tags after review; nothing is guessed at runtime.
- **Bigger, bouncier one-off cues per line.**
- **Body language with hand and arm layers.** The systems and timing come now; the drawing belongs to the art pass.

**Effort:** M (systems).

## Phase 12 · Native review

All new Japanese, and every culturally framed line, gets read by a native speaker; dialects by a speaker of each.
This runs continuously from Phase 2, using the review ledger (S5). The game never claims review that hasn't
happened (spec line 178).

## Phase Z · The final art pass (outline only)

Robin [R2 §10, H6]: once the content is settled, "a fresh coat of primer, paint and polish" across much of the
game, towards a more distinct stylised feel. That means far more active and idle animation and a living community;
the bar is the dragon-knight reference (material shading, strong silhouettes, overlapping forms, secondary motion),
at a smaller scale. **As asked, this plan does not detail it.** It only records what earlier phases leave ready for
it:

- **The art register:** every feature above lists its art needs (travel-volume compositions and player layers,
  creatures, the yukata cut, new regions' tiles and props, guests' battle figures). The register becomes the art
  pass's scope.
- **Interim art stays at today's standard**, never worse than its surroundings.
- **Infrastructure** (layer and attachment conventions, recolour keys, composition plans) is prepared during
  development, as Astra advised. Final paintings are not made early.
- **Order:** approve a visual standard → apply it everywhere → measure budgets → final validation.

## Final validation

On the art-complete build, when Robin calls it:
- the full 16-combination campaign matrix;
- the full browser suite;
- the layout audits (English and Japanese labels, every viewport);
- every performance budget;
- Firefox and the foldable by Robin.

---

## Testing throughout (Robin's cadence)

| What changed | What runs |
|---|---|
| Any phase's end | F/Ren full route, plus the unit suite |
| A visual adjustment | F/Ren is enough |
| A battle or encounter type | That encounter type's tests, separately |
| A puzzle, or content that depends on the Japanese level | All four profiles for that content |
| A menu system | Its triggers, tested directly |
| Content touching one companion | That companion, focused |
| Side-quest branches | Saved-state fixtures per outcome |
| The whole game, final | The 16-combination matrix, only when Robin asks |

Reason before running. Label evidence honestly: an F/Ren clear proves that route.

## Alternatives to this order

- **Region first.** Build Manybridge early and grow systems as it needs them. More visible progress, sooner. But
  systems built for one region tend to be rebuilt for the next. Not recommended, though reasonable if Robin wants
  to see new places soon.
- **Astra's order:** stronger everyday language, then physical problem-solving, then one signature region, then a
  ten-trial chapter, then the Hundred Rooms, then cultural and audio expansions. Close to this plan's. The main
  difference is that this plan puts the encounter engine and records before the first region, because Robin's
  review emphasised encounters and the travel volume.
