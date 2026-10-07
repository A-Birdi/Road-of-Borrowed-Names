# The Road of Borrowed Names: expansion plan (draft 2)

*2026-10-07. Draft 2 records Robin's answers of the same day. A planning document, not authorised work: nothing
here gets built until Robin selects and authorises a scope. Robin's playthrough feedback comes first and may change
any of it.*

This plan consolidates the expansion consultation with Astra (docs/future/consultation/, condensed in
docs/future/EXPANSION_CONTEXT.md) and Robin's later decisions (HANDOFF.md, "Future expansion") into an
implementation plan. Every idea is broken down on its own and checked against:
- the current game: a read-only audit of the code, saves, story canon and spec;
- the spec and project rules;
- each other.

> **Spoilers.** The plan is written so Robin, mid-Chapter 2, can read it safely. Existing Chapters 3–6 appear only
> as the spec describes them. **[SEALED_STORY_NOTES.md](SEALED_STORY_NOTES.md) contains spoilers: don't open it
> until you've finished the game.**

## How to read it

| File | What it covers |
|---|---|
| [01_PRINCIPLES.md](01_PRINCIPLES.md) | The guardrails everything is checked against, and the exclusions |
| [02_FOUNDATIONS.md](02_FOUNDATIONS.md) | Engine work the rest stands on: story phases, seeded events, per-save records, inserting chapters, the content pipeline, size budgets, tests, spec amendments |
| [03_ENCOUNTERS.md](03_ENCOUNTERS.md) | Participants with purposes, arrivals and summons, wanderers, contextual responses, an honest preview, procedures, social encounters, Wait, Resolve this step, more creatures, consequences |
| [04_DUNGEONS.md](04_DUNGEONS.md) | Expeditions, persistent condition and stations, failure and suspend rules, previews, ten dungeon families, Atlas commissions (reactive and mapping), delvers, **the Hall of a Hundred Tales** |
| [05_LANGUAGE.md](05_LANGUAGE.md) | Honest learning evidence, what help supplied, mastery stars, word pages, "What I can do", sentence forging, the language-as-a-tool task families, growth offered |
| [06_WORLD.md](06_WORLD.md) | Evolving towns, routines, "have you seen…?", day and night, road events, return keys, **the Harbourmaster's quest and sailing**, the boat home, exploration verbs |
| [07_REGIONS.md](07_REGIONS.md) | **The new regions**: names, stories, themes, mechanics, encounters, companions, illustrations, main story or postgame |
| [08_CULTURE.md](08_CULTURE.md) | Register, public spaces, refusal, dialects, documents, folklore, **the festival**, manzai, shogi and other pastimes, the press |
| [09_RECORDS.md](09_RECORDS.md) | The stamp book, **the travel volume**, the witnessed seal, the Main Menu gallery, spoilers, replay, Pastimes, the folio |
| [10_STORY.md](10_STORY.md) | The twelve chapters, the Hush, companions, separations, old saves, the postgame |
| [11_CONTRADICTIONS.md](11_CONTRADICTIONS.md) | **Every contradiction found**, each labelled decided, open, to confirm or to revisit, plus the defects fixed in the current game |
| [12_ROADMAP.md](12_ROADMAP.md) | The drafted order of execution, from your feedback to the final art pass, with testing per phase |
| [13_IDEA_REGISTER.md](13_IDEA_REGISTER.md) | Where every idea went: Astra's 60, all of Robin's, and this plan's own |
| [SEALED_STORY_NOTES.md](SEALED_STORY_NOTES.md) | ⚠ Spoilers: canon reasoning behind story decisions |

## The plan in one page

**North star.** Japanese as increasing agency: every region gives the player something new to *do* with the
language, not just more to look at.

**Regions** ([07_REGIONS.md](07_REGIONS.md)):
- **Manybridge** (八百橋), a canal city of eight hundred bridges. **Two new main chapters** (3–4) after Saltglass:
  - the Exchange (routing goods by who sends what to whom, contracts with conditions);
  - Blockprint Row and Playhouse Row (printing stories that readers react to, staging plays, manzai with Suzu,
    and **the river festival** with fireworks and games that stay).
- **The Keepers' Road** (灯守の道), the old lantern-keepers' road. **A new main chapter** (7) between Snowbell and
  Lanternfall: lore told several ways, a vigil of ninety-nine wicks, and the shuttered hall the postgame opens.
- **Kotonoha, the Isle of Word-Leaves** (言の葉島): Robin's island, now **a main chapter** (9). Reachable early by
  your own boat; it adapts to the story so far.
- **The Cloudroad** (雲路), a mountain highway of post stations, and **Steamhollow** (湯ノ谷), a crowded hot-spring
  valley. **Two new main chapters** (10–11) before the finale: weighing reports, carrying messages, making and
  declining arrangements, mediating a feud.
- **The Hall of a Hundred Tales** (百物語の館): the "100 Trials". Ten wings of ten tales, each relighting a lantern.
  Postgame.
- **Small sailing ports** (Sazanami, East Landing) and **a new settlement** to build up in the postgame.

**Story** ([10_STORY.md](10_STORY.md)): **6 → 12 chapters** (Robin's decision), all inserted before the finale,
which stays last and stays resolved. Saves from the six-chapter edition don't continue into the new one; they are
never deleted.

**Systems**, in short:
- encounters where people have their own purposes;
- contextual responses (fire and wind, water and paper) with an honest preview;
- arrivals counted in turns;
- puzzle and social "battles";
- large dungeons with stationed resources, where language mistakes never carry over;
- reactive, mapping and themed expeditions in the Atlas;
- honest learning evidence, mastery stars per input type, and "What I can do";
- sentence forging;
- living towns, routines and road events;
- sailing;
- a stamp book;
- a travel volume of animated illustrations with your character in them, sealed with your own name seal.

**Order** ([12_ROADMAP.md](12_ROADMAP.md)):
- your feedback and decisions;
- quick wins;
- language, then encounters, then the world, records and expeditions;
- Manybridge;
- the sea;
- the Cloudroad and Steamhollow;
- the postgame;
- native review throughout;
- **the art pass last**;
- the full matrix on the finished build.

## Decided on 2026-10-07

| # | Decision |
|---|---|
| C-01 | **Twelve chapters** |
| C-02 | Old saves don't continue once the new chapters ship (never deleted; details open in C-54) |
| C-03 | Optional dungeons restart from the beginning; story dungeons keep checkpoints |
| C-09 | Puzzle, social and objective encounters are exempt from "winnable by Unravel alone"; Unravel appears there only where something can really be unravelled |
| C-12 | Story separations are allowed: the same companion always comes back, never replaced, never permanent |
| C-13 | Mastery stars are flair, just for you; they unlock nothing |
| C-14 | Handwriting shows one guess; redraw freely; "Show more suggestions" counts as assisted |
| C-17 | Festival games: untimed, reward-free practice by default; opt-in timed mode |
| C-18 | The Atlas stays the premier randomly generated dungeon |
| C-21 | File size isn't a concern below 100 MB |
| C-35 | The learning-record fixes, by my judgement: done (nothing earned is taken away) |
| Others | Baths follow pronouns; both menus are "Ledgers", kept distinct; shogi designed for a newcomer |

## Still waiting for you

Labelled **Open**, **Confirm** or **Revisit** in [11_CONTRADICTIONS.md](11_CONTRADICTIONS.md):

1. **C-54 (Open):** old saves: what they show, whether one can start the new edition as New Game+, and shipping all
   six chapters together.
2. **C-55 (Open):** does the timed mode of a festival game give anything beyond personal records?
3. **C-56 (Open):** which bath for they/them and custom pronouns (the reserved bath is recommended)?
4. **C-61 (Open):** the playtime target for twelve chapters.
5. **C-33 (Open):** hanafuda, in or out?
6. **C-57, C-58, C-59, C-60 (Confirm):** the Atlas's "fixed" means its shape; names for the two Ledgers; a quarrel
   never lowers Bond; Unravel hidden where nothing is tangled.
7. **C-62 (Revisit):** Suzu's dream, after you've played her story.
8. **Part B:** 33 smaller tensions, each with a proposal that stands until you say otherwise.

## Fixed in the current game

The eight defects the audit found are fixed and tested
([11_CONTRADICTIONS.md](11_CONTRADICTIONS.md) part D). For example, **Words › Grammar met** now lists the grammar
you've met, and Translate in story activities now applies only to the customer or letter you used it on.
