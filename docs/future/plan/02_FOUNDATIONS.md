# 02 · Foundations: the engine work everything else stands on

*Expansion plan, draft 1 (2026-10-07). Planning only.*

These are the cross-cutting systems that several features need. Building them first keeps each later feature
small and consistent. Every entry gives:

- **What and why**
- **Current state**: from a read-only audit of today's code; `file:line` points into `src/`
- **Approach**
- **Pros and cons**
- **Open questions**
- **Tests**
- **Effort**: S, M, L or XL, relative scope including content and validation, not a time estimate

---

## S1 · Story phases: one region, many moments

**What and why.** Robin's island idea [R2 §10] needs a region that is complete whenever the player arrives and
adapts as the story moves on. The same machinery serves evolving towns (W1), road events (W5), the festival hall,
and the new chapters' post-story states. Astra's refinement keeps three inputs separate:
1. **Story phase**: what has happened, what residents may say.
2. **Profile** (F, E, I, A): how a task is expressed.
3. **Introduced concepts**: which responses and constructions have been taught.

**Current state.**
- Content already varies by flags, in three ways:
  - `if` conditions on NPCs, exits and props (`engine/40_maps.js:79-104`);
  - guarded `talk` lists;
  - `_idle` / `_after` / `_post` variants, plus `alt` ambience.
- Challenges are tiered by profile (all 67 have F/E/I/A tiers; `learn/20_tasks.js:236-249`).
- Introduced concepts are tracked implicitly by the `words` list and `s.learn.intro`.
- There is no named "phase", so every condition restates its flags.

**Approach.**
- **Phase table.** A small phase table derived from chapter flags (`RB.phase.of(s)` returning, for example,
  `early | mid | late | post`, defined per region). Content can write `if: 'phase>=mid'` instead of long flag lists.
- **Phase-locked text.** Dialogue entries may be tagged with the earliest phase that may say them. The validator
  rejects any line that names something introduced later, using a "reveals" vocabulary list per chapter (story
  terms, people, places).
- **Stable activities.** A running activity or puzzle snapshots its phase and profile at start and holds them until
  it ends. It never changes under the player mid-task.
- **Concept gates.** A response or construction used in a task must already be taught by the visit's phase, or the
  task teaches it first. This enforces the existing rule that content uses only "words the player can know by
  then" (AGENT_COMMON).

**Pros.**
- One mechanism for the island, the evolving towns and the new chapters' after-states.
- Spoiler safety becomes testable instead of a matter of discipline.

**Cons.**
- Authoring cost: three phase versions of a region is roughly 1.8 times one version, not three times, since most
  text is phase-neutral.
- The "reveals" vocabulary list needs upkeep.

**Open.** How fine the phases are (four per region is the proposal).

**Tests.**
- Unit: every phase-tagged line respects its phase, using the reveals list.
- Unit: every task's concepts are taught by its earliest phase.
- Browser: visit the island at each phase from fixtures.

**Effort:** M (engine), plus content.

---

## S2 · Seeded event streams (no re-roll by loading)

**What and why.** Wanderers, arrivals, road events and sea events should feel unpredictable [R2 §1]. But the
battle rules use no randomness today, and the battle settings sheet's guarantees depend on that (COMBAT_NOTES).
Loading a save must not become a way to re-roll an event.

**Current state.**
- NPC wandering already uses seeded streams (`engine/50_world.js:683-710`).
- Creature patrols still use `Math.random` (`50_world.js:719-720`).
- The Atlas seeds its generation per run (`atlas/30_gen.js:32-58`).

**Approach.**
- **One per-save stream per event family**, in `s.rng`: a counter per family, seeded from `s.id` and the family
  name.
- **Draw before saving.** An event's outcome is drawn when the event becomes possible, for example when the
  player enters the map, and stored before any autosave. Reloading gives the same outcome. A later visit draws the
  next value.
- **No randomness inside battles.** If a battle can receive an arrival, the arrival schedule is drawn at battle
  start and stored with the battle's own state.
- **Creature patrols** move to a seeded stream. This is a small fix that also makes patrols reproducible in tests.

**Pros.** Fair and reproducible. Tests can force any outcome with a fixture seed.

**Cons.** "Random but recorded" can feel deterministic to a player who replays from a copied slot. That is fine and
honest.

**Tests.** Unit: the same seed gives the same events; loading never changes a drawn event.

**Effort:** S.

---

## S3 · Records that live with each save (stamps, seals, stars, illustrations)

**What and why.** Achievements, witnessed illustrations, mastery stars and the stamp book [R1, H1, H4] need a
home. The spec decides where:
- Deleting a slot removes its associated data (line 228).
- No flag mixing between slots (line 252).
- No visible second roster of saves (line 224).

Robin's H1 makes the gallery *always* viewable from the Main Menu, so viewing never depends on any save. Only the
**witnessed** marks are per save.

**Current state.**
- Per-save records already exist:
  - `s.seq` counts every illustrated sequence viewed, even skipped ones (`ui/43_sequence.js:635-643`);
  - `s.company.memories`;
  - `s.awarded` once-only guards.
- Nothing is stored outside slots except device settings (`engine/80_save.js:341-353`).
- Slot `meta` has no appearance (`80_save.js:167-182`).

**Approach.**
- **A new per-save `s.records`**, migrated as empty: `{stamps:{}, seals:{}, stars:{}, accomplishments:{}, ...}`.
  It travels with copy and is removed with delete, exactly like the rest of the slot.
- **The Main Menu gallery reads; it never writes.** It reads the six slots' `records.seals` read-only, to show
  which existing saves witnessed each illustration ("seen in Journey 2 and Journey 5"). It writes nothing
  cross-slot.
- **Spoiler reveals.** Which illustrations the player has deliberately unveiled on the Main Menu is a *viewing
  preference*. It is stored in the device settings record, beside `prologueSeen`, which is already a device setting.
  It is not gameplay data and never marks anything witnessed ([11_CONTRADICTIONS.md](11_CONTRADICTIONS.md) C-20).
- **Slot meta gains `look`**, the player's worn appearance, written on every save. The Main Menu uses the
  Continue slot's look [H3]. Older saves without it fall back to reading the slot's full state once, which
  `list()` already loads.

**Pros.**
- Respects every save rule.
- Deleting a save behaves as players expect.
- No new storage area to explain.

**Cons.**
- A player who deletes their only finished save loses its seals, though never the ability to view.
- Robin's original wish for marks that survive deletion is not met ([11_CONTRADICTIONS.md](11_CONTRADICTIONS.md)
  C-19 offers the alternative).

**Tests.**
- Unit: the migration creates empty records.
- Browser: copy carries records; delete removes them; the Main Menu shows the union read-only.
- Browser: no write to another slot.

**Effort:** M.

---

## S4 · Saves, schema and inserting chapters

**What and why.** Adding chapters *between* existing ones is the plan's biggest structural change
([10_STORY.md](10_STORY.md)). Every existing save must keep loading, including Robin's, which will be finished by
the time the expansion lands. Migrations "must never invent history" (ADDENDUM_CONTRACTS).

**Current state.**
- `RB.SAVE_SCHEMA = 1`.
- `migrate()` fills missing keys and runs eleven hooks (`80_save.js:155-166`).
- Chapter flags run `ch1_done`…`ch5_done`, plus `postgame`.
- Map links are gated by them, for example `sg.road → co.road` needs `ch2_done`.
- `s.chapter` and the ledger show the chapter number.

**Approach.**
- **Never change an existing flag's meaning.** New chapters get new flags (`mb1_done`, `mb2_done`, `kr_done`,
  `yn_done`).
- **The main road gains new gates only for saves that have not passed them.**
  - The link `sg.road → co.road` additionally requires `mb2_done`, *unless* the save already has `ch3_started` or any
    later flag. For those saves, Manybridge is reachable as a **detour** (by ferry from Saltglass, by road from
    Reedwake).
  - Its story is framed for that save's phase, using S1, or offered through a Chapter Journey. These are two
    options for Robin in [10_STORY.md](10_STORY.md) §3.
- **Display chapter numbers through a map** (internal id to displayed number) rather than storing the new number.
  An old save in "Chapter 3: Cinder Orchard" displays as "Chapter 5: Cinder Orchard" after the update. The ledger
  explains the renumbering once.
- **A schema bump to 2** only if a field changes shape; additive fields need none. The proposed evidence log (L1)
  is additive.

**Pros.** No save breaks. New players get the full sequence. Existing players are not forced to restart.

**Cons.**
- The renumbering is mildly confusing for anyone mid-game.
- "Detour" framing adds authoring for every inserted chapter.

**Tests.**
- Fixtures: a save at each existing chapter, plus Robin-like saves (late Chapter 2, finished, postgame) loaded on
  the expanded build.
- Each fixture can reach every new region, and nothing it had is lost.

**Effort:** L.

---

## S5 · The content pipeline for new regions

**What and why.** Every new line must pass today's rules, and several gaps found in the audit need closing first.

**Current state** (`tools/validate.mjs`).
- Enforced:
  - furigana on every displayed kanji;
  - step shapes;
  - ordering tiles equal the answer as a multiset;
  - Suzu's Kansai inventory.
- Not enforced:
  - **ordering `alts` are never checked**;
  - **a missing profile tier is only a warning**;
  - **unknown lexicon tokens are not errors**.
- Recognizer data must exist for every displayed kanji (a unit test).

**Approach.**
- **Validator upgrades** (apply to new content; existing content is grandfathered with a recorded list):
  - check every `alt` order is a permutation of the tiles and reads differently from the answer;
  - make a missing F/E/I/A tier an error for new challenges;
  - make unknown tokens in new content an error;
  - add a **fiction/real tag** for lore entries (spec line 32: invented lore must not pass as real culture);
  - check S1 phase tags;
  - check that every task has a non-audio route.
- **Recognizer and lexicon intake.** A script lists every new kanji in new content and whether recognition data
  and lexicon entries exist. KanjiVG-derived data is CC BY-SA 3.0 (docs/RECOGNITION.md); keep the notice.
- **A review ledger** (docs/review/): every new Japanese line is "unreviewed" until a native speaker has read it.
  This plan never claims review (spec line 178). Robin [R1]: "we can make appropriate consultation if we need to".
- **Authoring templates** for each new task type (05_LANGUAGE.md), with worked examples at all four profiles.

**Tests.** The validator's own unit tests; a new-content report in CI-like runs.

**Effort:** M.

---

## S6 · Size and performance budget

**What and why.** `index.html` is about 13 MiB. The approved Harmony art alone added 1.8 MiB. Robin's illustrated
travel volume (high-fidelity, animated, with the player in it) could add far more. Robin plays in Firefox, which
was never tested. A 40 MiB single file would load slowly, and the browser must decode it.

**Current state.**
- Measured budgets:
  - battle figures 38.6 of 48 MiB;
  - Harmony caches bounded near 20 MiB;
  - portrait cache 8 MiB.
- There is no per-feature size budget.

**Approach.**
- **Set budgets per feature before production, and measure them in tests** (the `--budget` pattern used for
  Harmony):

  | Feature | Proposed encoded size | Notes |
  |---|---|---|
  | Regions' tiles, props, creatures (code-drawn) | ≤ 0.6 MiB per region | Code, not images, as today |
  | Travel-volume illustrations | ≤ 250 KiB each (layers included), about 60 illustrations: ≤ 15 MiB | Painterly art compresses well as lossy WebP, unlike pixel art; decoded only when opened |
  | New text content | about 1.5 MiB per 2 chapters | Measured from today's chapters |
  | Total target | ≤ 30 MiB | Decide with Robin after a Firefox load test |

- **Decode lazily**: illustrations decode only when viewed, and only one at a time.
- **Measure in Firefox** before committing to the illustration count. This is the first real Firefox test this
  project would run ([11_CONTRADICTIONS.md](11_CONTRADICTIONS.md) C-21).

**Pros.** Prevents the expansion silently making the game unloadable.

**Cons.** May force fewer or lighter illustrations than hoped.

**Effort:** S (budgets and tests); the trade-offs are Robin's.

---

## S7 · Test infrastructure for a larger game

**What and why.** Robin's cadence: F/Ren for the routine full route; focused tests for whatever changed; the full
matrix only on request [R2 §10]. A larger game with branches, phases and early-access regions needs cheap ways to
reach any state.

**Approach.**
- **State fixtures.** Build named fixtures for every chapter start, every phase of each adaptive region, and each
  side-quest branch point. Tests load them instead of replaying the story.
- **Extend the F/Ren sweep** (`tests/e2e/matrix.mjs F ren 1`) through the new chapters, the island at each phase,
  the boat, and the Trials' first wing.
- **Branch tests.** Each permanent side-quest outcome gets a small saved-state test (Astra: "a small saved-state
  test of an alternate outcome can complement the main run").
- **Budget tests** per S6.

**Effort:** M (grows with content).

---

## S8 · Spec and contract amendments (Robin's sign-off)

Several plans contradict written rules. Each needs Robin's explicit amendment, not a quiet workaround. The full
list, with options and recommendations, is [11_CONTRADICTIONS.md](11_CONTRADICTIONS.md). The ones that block whole
features:

| Rule | Where | Blocks |
|---|---|---|
| "Build six substantial chapters" | spec line 38 | 10 or 12 chapters (C-01) |
| "Every battle must be winnable with Unravel alone" | AGENT_COMMON, CONTENT, ATLAS | Puzzle and social encounters (C-09) |
| "No speed-only, handwriting-only or no-help-only reward" | PRACTICE_CONTRACTS line 125 | Mastery stars per input type (C-13) |
| "No clock anywhere except fishing" | PRACTICE_CONTRACTS line 123 | Any timed festival minigame (C-17) |
| "Exactly two adventurers"; no operation removes the companion | spec lines 70, 290; HX52 | Temporary companion absence (C-12) |
| "Defeat returns to a sensible checkpoint… without grinding" | spec line 128 | Ordinary dungeons restarting from the beginning (C-03) |
| Battle themes rise strictly by chapter | audio rule ZM2 | Inserted chapters' music (C-22) |
| Replays live in Shared memories, with event-time appearance | HX53 | The Main Menu gallery with the Continue appearance (C-20) |

**Effort:** S (writing); the decisions are Robin's.
