# The Road of Borrowed Names: expansion plan (draft 1)

*2026-10-07. A planning document, not authorised work. Nothing here gets built until Robin selects and authorises a
scope. Robin's playthrough feedback comes first and may change any of it.*

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
| [10_STORY.md](10_STORY.md) | Adding chapters, the ten-chapter outline, the twelve-chapter variant, the Hush, companions, a temporary separation, existing saves, the postgame |
| [11_CONTRADICTIONS.md](11_CONTRADICTIONS.md) | **Every contradiction found**, with options and recommendations, plus defects found in the current game |
| [12_ROADMAP.md](12_ROADMAP.md) | The drafted order of execution, from your feedback to the final art pass, with testing per phase |
| [13_IDEA_REGISTER.md](13_IDEA_REGISTER.md) | Where every idea went: Astra's 60, all of Robin's, and this plan's own |
| [SEALED_STORY_NOTES.md](SEALED_STORY_NOTES.md) | ⚠ Spoilers: canon reasoning behind story decisions |

## The plan in one page

**North star.** Japanese as increasing agency: every region gives the player something new to *do* with the
language, not just more to look at.

**Regions** ([07_REGIONS.md](07_REGIONS.md)):
- **Manybridge** (八百橋), a canal city of eight hundred bridges. **Two new main chapters** after Saltglass:
  - the Exchange (routing goods by who sends what to whom, contracts with conditions);
  - Blockprint Row and Playhouse Row (printing stories that readers react to, staging plays, manzai with Suzu,
    and **the river festival** with fireworks and games that stay).
- **The Cloudroad** (雲路), a mountain highway of post stations, and **Steamhollow** (湯ノ谷), a crowded hot-spring
  valley. **Two new main chapters** before the finale: weighing reports, carrying messages, making and declining
  arrangements, mediating a feud.
- **Kotonoha, the Isle of Word-Leaves** (言の葉島): Robin's island. Reached early by your own boat, later by
  everyone; it adapts to the story so far.
- **The Hall of a Hundred Tales** (百物語の館): the "100 Trials". Ten wings of ten tales, each relighting a lantern.
  Postgame.
- **Small sailing ports** (Sazanami, East Landing) and **a new settlement** to build up in the postgame.

**Story** ([10_STORY.md](10_STORY.md)): **6 → 10 chapters**, all inserted before the finale, which stays last and
stays resolved. A twelve-chapter variant is described; the recommendation is to decide after playing ten.

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

## Decisions waiting for Robin

The ones that block whole features (details in [11_CONTRADICTIONS.md](11_CONTRADICTIONS.md) part A):

1. **C-01:** six chapters, ten or twelve (a spec amendment).
2. **C-02:** how saves already past an inserted chapter, including yours, experience it.
3. **C-03:** "restart from the beginning" for optional dungeons only, with checkpoints kept in story dungeons?
4. **C-09:** puzzle, social and objective encounters exempt from "winnable by Unravel alone".
5. **C-12:** a short authored separation from the companion (a spec amendment).
6. **C-13 / C-14:** mastery stars as records; whether picking the recognizer's second guess counts as help.
7. **C-17:** opt-in timed modes for festival games.
8. **C-18:** making the Atlas choose its content at the start (an existing behaviour change).
9. **C-21:** how large the single file may become (a Firefox test first).
10. **C-35:** fixing the learning record's defects, which changes how fast some items promote.

## Found while auditing (current game, not expansion)

A short list of existing defects is in [11_CONTRADICTIONS.md](11_CONTRADICTIONS.md) part D. For example,
**Words › Grammar met always shows an empty page**. None has been changed. Each is small and can be fixed whenever
Robin wants.
