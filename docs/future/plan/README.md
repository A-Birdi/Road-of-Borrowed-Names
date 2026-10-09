# The Road of Borrowed Names: expansion plan (draft 8)

*2026-10-09. Draft 8 records Robin's answers through the sixth round (2026-10-07 to 2026-10-09) and Robin's
playbook package of 2026-10-09. A planning document, not authorised work: nothing
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
| [03_ENCOUNTERS.md](03_ENCOUNTERS.md) | Participants with purposes, arrivals and summons, wanderers, contextual responses, an honest preview, procedures, social encounters, Wait, Resolve this step, more creatures, consequences, **battles: groups, growth, silencing and modifier words** |
| [04_DUNGEONS.md](04_DUNGEONS.md) | Expeditions, persistent condition and stations, failure and suspend rules, previews, ten dungeon families, Atlas commissions (reactive and mapping), delvers, **the Hall of a Hundred Tales** |
| [05_LANGUAGE.md](05_LANGUAGE.md) | Honest learning evidence, what help supplied, mastery stars, word pages, "What I can do", sentence forging, the language-as-a-tool task families, growth offered |
| [06_WORLD.md](06_WORLD.md) | Evolving towns, routines, "have you seen…?", day and night, road events, return keys, **the Harbourmaster's quest and sailing**, the boat home, exploration verbs |
| [07_REGIONS.md](07_REGIONS.md) | **The new regions**: names, stories, themes, mechanics, encounters, companions, illustrations, main story or postgame |
| [08_CULTURE.md](08_CULTURE.md) | Register, public spaces, refusal, dialects, documents, folklore, **the festival**, manzai, shogi and other pastimes, the press |
| [09_RECORDS.md](09_RECORDS.md) | The stamp book, **the travel volume**, the witnessed seal, the Main Menu gallery, spoilers, replay, Pastimes, the Wayfarer's Ledger |
| [10_STORY.md](10_STORY.md) | The twelve chapters, the Hush, companions, separations, old saves, the postgame |
| [15_INTERFACE.md](15_INTERFACE.md) | **The interface as an authored travel book**, not nested panels; type and the new-font permission; how it would be built and reviewed |
| [14_COMPANIONS.md](14_COMPANIONS.md) | **A second arc for each companion**, all four at the same depth: a seed, pressure, a crossroads, a night apart, an unfinished matter, a postgame scene, their dream |
| [11_CONTRADICTIONS.md](11_CONTRADICTIONS.md) | **Every contradiction found**, each labelled decided, open, to confirm or to revisit, plus the defects fixed in the current game |
| [12_ROADMAP.md](12_ROADMAP.md) | The drafted order of execution, from your feedback to the final art pass, with testing per phase |
| [13_IDEA_REGISTER.md](13_IDEA_REGISTER.md) | Where every idea went: Astra's 60, all of Robin's, and this plan's own |
| [SEALED_STORY_NOTES.md](SEALED_STORY_NOTES.md) | ⚠ Spoilers: canon reasoning behind story decisions |
| [../playbook/](../playbook/README.md) | Robin's playbook package of 2026-10-09: a proposed order of work (P00–P18), the book interface in full (§15A), and its review of draft 7 |

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
- **modifier words** that extend a response's reach (「すべてを守る」 shields you both), learned as you grow;
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
- careful language review throughout (self-review; no native reviewer is available);
- **the art pass last**;
- the full matrix on the finished build.

## Decided on 2026-10-07

| # | Decision |
|---|---|
| C-01 | **Twelve chapters** |
| C-02, C-54 | Old saves don't continue; continuing one begins **New Game+**: a fresh start keeping settings, learning records, stars, illustrations and pastime records |
| C-54 | **New Game+** keeps personal records, never story or character progression, equipment or items; it is offered at the end of the game, and opens with a **farewell** from the companion ("unfinished work; we'll meet again") |
| C-03 | Optional dungeons restart from the beginning; story dungeons keep checkpoints |
| C-04 | Persistent health only in dungeons that specify it |
| C-09, C-60 | Puzzle, social and objective encounters are exempt from "winnable by Unravel alone"; **Unravel stays available even where it does nothing**, and the first conflict with no creature teaches that |
| C-11 | Deaths are avoidable and never block the story; never to NPCs who matter; a failure is witnessed and reflected on, never turned on the player |
| C-12, C-59 | Story separations are allowed; the same companion always comes back; **quarrels never lower Bond** and teach apologising |
| C-13 | Mastery stars are flair, just for you |
| C-14 | Handwriting shows one guess; redraw freely; "Show more suggestions" counts as assisted |
| C-17, C-55 | Festival games: untimed practice by default, opt-in timed mode, **just for fun: personal records only** |
| C-18, C-57 | The Atlas stays the premier generated dungeon: fixed shape per run, **rooms varied inside it** |
| C-21 | File size isn't a concern below 100 MB |
| C-33 | **Hanafuda is in** |
| C-35 | The learning-record fixes, by my judgement: done |
| C-56 | Baths follow pronouns; they/them and custom **choose once, and the choice is kept** |
| C-58 | **The Wayfarer's Ledger** (pause menu) and **the Inn Ledger** (saves) |
| C-61 | About **15 hours** brisk for the main story; about **40 hours** for a new learner taking in everything |
| C-63 | **Romance**: holding hands and/or a kiss with the chosen companion, at the ending by Bond, very rarely elsewhere; nothing explicit |
| C-64 | The "effect here" preview in combat only; elsewhere read the situation and try something else (a *tried* mark helps) |
| C-65 | Witnessed conflicts shown with restraint, with a "shown / summarised" setting and a reflection scene |
| C-66 | New Game+: no keepsakes or lore; the traveller unchanged; either slot; **the farewell from the originating save** |
| C-56 | Nao and Ren always choose the same bath, in character |
| C-67 | The romance moment is always your choice (romantic or closest friends, Bond the same); the companion's consent shown; at most one earlier moment, holding hands, after the Steamhollow reconciliation |
| C-62 | **Suzu** is a travelling comedian; she crosses paths with her troupe, chooses to stay, and wants the double act at the end; **every companion gets a second arc** at the same depth |
| Story | **The Hush as a rising tragedy**, heaviest near its source, with a satisfying build-up and climax |
| C-16 | A **Distractions** tab: a page per pastime, with key art, how to play and where |
| C-19 | Seals belong to the save, not the slot |
| C-22 | **One coherent score**: build-up by writing, not by volume; a unique, imposing finale |
| C-26 | No native reviewers: careful self-review against references |
| C-41 | Mastery exams can't be fished: the first committed answer counts |
| C-43 | Things go wrong aboard; fix them at sea or in port; no failure, shown not said |
| C-45 | Situation encounters are unique, demanding one-offs |
| C-46 | Yukata are festival-only: no Harmony art |
| C-51 | About 1–3 hours per chapter |
| C-52 | Main Menu illustrations show the Continue save's earned effects |
| Part B | All of it decided (C-04 to C-53) |

## Decided in the fifth round (2026-10-08)

| # | Decision |
|---|---|
| C-68 | Suzu's arc approved; Nao's, Mio's and Ren's fleshed out to the same depth by my judgement ([14_COMPANIONS.md](14_COMPANIONS.md)) |
| C-69 | Reasons to fight roaming creatures: lost words come back, routes change, quest carriers, notable creatures, stamps |
| C-70 | Each creature numbered by its action order, targeting kept; **Unravel and Protect grow** as story moments; **modifier words** (E27); only the Hush silences, and it's always inferable |
| C-71 | About one companion action a chapter; some found off the beaten path; never missable, since areas can be revisited |

## Decided in the sixth round (2026-10-09)

| # | Decision |
|---|---|
| C-72 to C-74 | "All fine as asked": the modifier words, no per-round ceiling, and the two growth moments in Chapters 4 and 7 |
| The interface | Menus that look and feel like a physical book in the 2.5D world, not rectangles inside rectangles ([15_INTERFACE.md](15_INTERFACE.md)) |
| Fonts | A new font is allowed if it is readable and fits the game's tone; embedded and offline |

Your playbook also found sixteen places where draft 7 disagreed with itself. Twelve are fixed by decisions you'd
already made, one is left to the census at the start of the work, and three come back to you below
([11_CONTRADICTIONS.md](11_CONTRADICTIONS.md) part E).

## Still waiting for you

In [11_CONTRADICTIONS.md](11_CONTRADICTIONS.md) part A7:

1. **C-78 (open): the order of work and the first scope.** Your playbook proposes its own order (P00 to P18) and six
   changes to this roadmap, and says nothing starts until you name a scope. Do you accept them, and what should
   start? The natural first step is **P00**, a recorded baseline that changes nothing in the game, then **the book
   interface proof** on Journey and Company with a type specimen, ending in one review set for you
   ([12_ROADMAP.md](12_ROADMAP.md)).
2. **C-75 (confirm):** a wrong first answer in a mastery exam counts like help, so a star needs fewer than 30% of
   questions assisted or missed.
3. **C-76 (confirm):** authored set pieces may field up to five hostile creatures (your "2-5 enemy fights"); the two
   of you are never counted in that five.
4. **C-77 (confirm):** Harmony keeps one technique per filled bar, as today.

Also ready when you want it: **Harmony's sound** (E21), a small change to the current game.

## Fixed in the current game

The eight defects the audit found are fixed and tested
([11_CONTRADICTIONS.md](11_CONTRADICTIONS.md) part D). For example, **Words › Grammar met** now lists the grammar
you've met, and Translate in story activities now applies only to the customer or letter you used it on.
