The Road of Borrowed Names · draft 7, 8 October 2026

# Expansion plan

Planning only: nothing here gets built until you choose and authorise a scope. Your playthrough notes come first and can change any of it. The sealed story notes are left off this page, so it is safe to read mid-game.

- 0open questions
- 3to confirm
- 0to revisit
- 0proposals standing
- 68decided
- 8bugs fixed

[What's waiting for you](#f11-still-waiting-for-you-at-a-glance) [How the labels read](#f11-how-the-labels-read)

Contents

1. [Overview](#f00)
   1. [How to read it](#f00-how-to-read-it)
   2. [The plan in one page](#f00-the-plan-in-one-page)
   3. [Decided on 2026-10-07](#f00-decided-on-2026-10-07)
   4. [Decided in the fifth round (2026-10-08)](#f00-decided-in-the-fifth-round-2026-10-08)
   5. [Still waiting for you](#f00-still-waiting-for-you)
   6. [Fixed in the current game](#f00-fixed-in-the-current-game)
2. [Decisions & contradictions](#f11)
   1. [Still waiting for you (at a glance)](#f11-still-waiting-for-you-at-a-glance)
   2. [A. Decisions that blocked a feature (all answered 2026-10-07)](#f11-a-decisions-that-blocked-a-feature-all-answered-2026-10-07)
   3. [A2. Questions raised by the first answers (answered 2026-10-07, second round)](#f11-a2-questions-raised-by-the-first-answers-answered-2026-10-07-second-round)
   4. [C-54 · Old saves when the new chapters ship (from C-02)](#f11-c-54--old-saves-when-the-new-chapters-ship-from-c-02)
   5. [C-55 · Festival rewards when the default mode gives none (from C-17)](#f11-c-55--festival-rewards-when-the-default-mode-gives-none-from-c-17)
   6. [C-56 · The bath for they/them and custom pronouns (from C-27)](#f11-c-56--the-bath-for-theythem-and-custom-pronouns-from-c-27)
   7. [C-57 · What "fixed at generation" means for the Atlas (from C-18)](#f11-c-57--what-fixed-at-generation-means-for-the-atlas-from-c-18)
   8. [C-58 · Two Ledgers (from C-37)](#f11-c-58--two-ledgers-from-c-37)
   9. [C-59 · A quarrel and the Bond table (from C-12)](#f11-c-59--a-quarrel-and-the-bond-table-from-c-12)
   10. [C-60 · Unravel where nothing is tangled (from C-09)](#f11-c-60--unravel-where-nothing-is-tangled-from-c-09)
   11. [C-61 · The playtime target for twelve chapters (from C-01)](#f11-c-61--the-playtime-target-for-twelve-chapters-from-c-01)
   12. [C-33 · Hanafuda, a traditional card game](#f11-c-33--hanafuda-a-traditional-card-game)
   13. [C-62 · Suzu's dream (from C-31)](#f11-c-62--suzus-dream-from-c-31)
   14. [A3. Questions raised by the second round (answered 2026-10-07, third round)](#f11-a3-questions-raised-by-the-second-round-answered-2026-10-07-third-round)
   15. [A4. Questions raised by the third round](#f11-a4-questions-raised-by-the-third-round)
   16. [A5. Proposals from the fourth round (all answered 2026-10-08)](#f11-a5-proposals-from-the-fourth-round-all-answered-2026-10-08)
   17. [A6. Readings of the fifth round (to confirm)](#f11-a6-readings-of-the-fifth-round-to-confirm)
   18. [B. Tensions this plan resolves (please confirm or overrule)](#f11-b-tensions-this-plan-resolves-please-confirm-or-overrule)
   19. [C. Already resolved (do not reopen without Robin)](#f11-c-already-resolved-do-not-reopen-without-robin)
   20. [D. Defects found by the audit (fixed 2026-10-07)](#f11-d-defects-found-by-the-audit-fixed-2026-10-07)
3. [Principles](#f01)
   1. [1. The north star](#f01-1-the-north-star)
   2. [2. Learning comes first, and it is never punished](#f01-2-learning-comes-first-and-it-is-never-punished)
   3. [3. Challenge and consequence are allowed](#f01-3-challenge-and-consequence-are-allowed)
   4. [4. Narrative boundaries \[R2 §1\]](#f01-4-narrative-boundaries-r2-1)
   5. [5. Rewards and records](#f01-5-rewards-and-records)
   6. [6. Hard technical boundaries (the spec and the project rules)](#f01-6-hard-technical-boundaries-the-spec-and-the-project-rules)
   7. [7. How the plan is tested and built](#f01-7-how-the-plan-is-tested-and-built)
   8. [8. Art comes last](#f01-8-art-comes-last)
   9. [8a. Words used in this plan](#f01-8a-words-used-in-this-plan)
   10. [9. Spoiler discipline (for this document)](#f01-9-spoiler-discipline-for-this-document)
   11. [10. What is excluded (and stays excluded unless Robin reopens it)](#f01-10-what-is-excluded-and-stays-excluded-unless-robin-reopens-it)
4. [Foundations](#f02)
   1. [S1 · Story phases: one region, many moments](#f02-s1--story-phases-one-region-many-moments)
   2. [S2 · Seeded event streams (no re-roll by loading)](#f02-s2--seeded-event-streams-no-re-roll-by-loading)
   3. [S3 · Records that live with each save (stamps, seals, stars, illustrations)](#f02-s3--records-that-live-with-each-save-stamps-seals-stars-illustrations)
   4. [S4 · Saves, schema and the twelve-chapter edition](#f02-s4--saves-schema-and-the-twelve-chapter-edition)
   5. [S5 · The content pipeline for new regions](#f02-s5--the-content-pipeline-for-new-regions)
   6. [S6 · Size and performance budget](#f02-s6--size-and-performance-budget)
   7. [S7 · Test infrastructure for a larger game](#f02-s7--test-infrastructure-for-a-larger-game)
   8. [S8 · Spec and contract amendments (Robin's sign-off)](#f02-s8--spec-and-contract-amendments-robins-sign-off)
5. [Encounters](#f03)
   1. [What exists today (audit summary)](#f03-what-exists-today-audit-summary)
   2. [E1 · Participants with purposes (the actor model)](#f03-e1--participants-with-purposes-the-actor-model)
   3. [E2 · Arrivals, reinforcements and summons, counted in turns](#f03-e2--arrivals-reinforcements-and-summons-counted-in-turns)
   4. [E3 · Wanderers](#f03-e3--wanderers)
   5. [E4 · Contextual response relationships ("conditions"), not an element chart](#f03-e4--contextual-response-relationships-conditions-not-an-element-chart)
   6. [E5 · An honest preview: "suitable here" or "nothing to do here"](#f03-e5--an-honest-preview-suitable-here-or-nothing-to-do-here)
   7. [E6 · Encounters with different objectives](#f03-e6--encounters-with-different-objectives)
   8. [E7 · Machines and procedures: puzzle battles](#f03-e7--machines-and-procedures-puzzle-battles)
   9. [E8 · Social encounters: mediation, negotiation, argument chains](#f03-e8--social-encounters-mediation-negotiation-argument-chains)
   10. [E9 · Wait: an action, not idleness](#f03-e9--wait-an-action-not-idleness)
   11. [E10 · The companion in new encounter types, and tactical plans](#f03-e10--the-companion-in-new-encounter-types-and-tactical-plans)
   12. [E11 · "Resolve this step"](#f03-e11--resolve-this-step)
   13. [E12 · More than three creatures](#f03-e12--more-than-three-creatures)
   14. [E13 · Equivalent expressions, different practice](#f03-e13--equivalent-expressions-different-practice)
   15. [E14 · Preparation before an encounter](#f03-e14--preparation-before-an-encounter)
   16. [E15 · Fixed-tool tactical studies](#f03-e15--fixed-tool-tactical-studies)
   17. [E16 · Optional superbosses](#f03-e16--optional-superbosses)
   18. [E17 · Lasting outcomes and the consequence rules](#f03-e17--lasting-outcomes-and-the-consequence-rules)
   19. [E18 · Harmony: the open question, and its new roles](#f03-e18--harmony-the-open-question-and-its-new-roles)
   20. [E19 · Help in required story battles after repeated defeat](#f03-e19--help-in-required-story-battles-after-repeated-defeat)
   21. [E20 · Ambushes and visible creatures](#f03-e20--ambushes-and-visible-creatures)
   22. [New creature roster (all regions)](#f03-new-creature-roster-all-regions)
   23. [E21 · Harmony needs a sound](#f03-e21--harmony-needs-a-sound)
   24. [E22 · How groups scale today, and what changes](#f03-e22--how-groups-scale-today-and-what-changes)
   25. [E23 · More kinds of creature](#f03-e23--more-kinds-of-creature)
   26. [E24 · Why fight a roaming creature? (options, as Robin asked)](#f03-e24--why-fight-a-roaming-creature-options-as-robin-asked)
   27. [E25 · Companions grow in battle too](#f03-e25--companions-grow-in-battle-too)
   28. [E26 · Varied tactics: two moves at once, plans, and silencing](#f03-e26--varied-tactics-two-moves-at-once-plans-and-silencing)
   29. [E27 · Modifier words: extending a response's reach](#f03-e27--modifier-words-extending-a-responses-reach)
6. [Dungeons](#f04)
   1. [What exists today (audit summary)](#f04-what-exists-today-audit-summary)
   2. [D1 · The expedition framework](#f04-d1--the-expedition-framework)
   3. [D2 · Persistent condition and stationed resources](#f04-d2--persistent-condition-and-stationed-resources)
   4. [D3 · Failure, retreat and suspend](#f04-d3--failure-retreat-and-suspend)
   5. [D4 · The entrance preview](#f04-d4--the-entrance-preview)
   6. [D5 · Story dungeons](#f04-d5--story-dungeons)
   7. [D6 · Dungeon families: ten kinds of learning space](#f04-d6--dungeon-families-ten-kinds-of-learning-space)
   8. [D7 · Atlas commissions: themed, reactive and mapping expeditions](#f04-d7--atlas-commissions-themed-reactive-and-mapping-expeditions)
   9. [D8 · Delvers: familiar faces in the depths](#f04-d8--delvers-familiar-faces-in-the-depths)
   10. [D9 · The Hall of a Hundred Tales (百物語の館)](#f04-d9--the-hall-of-a-hundred-tales)
   11. [D10 · Shortcuts and walking](#f04-d10--shortcuts-and-walking)
7. [Language](#f05)
   1. [What exists today (audit summary)](#f05-what-exists-today-audit-summary)
   2. [L1 · An evidence log that records what was actually shown](#f05-l1--an-evidence-log-that-records-what-was-actually-shown)
   3. [L2 · What help supplied: the assistance categories](#f05-l2--what-help-supplied-the-assistance-categories)
   4. [L3 · Mastery exams and stars](#f05-l3--mastery-exams-and-stars)
   5. [L4 · Word, kanji and kana pages](#f05-l4--word-kanji-and-kana-pages)
   6. [L5 · "Things I Can Do" (A58)](#f05-l5--things-i-can-do-a58)
   7. [L6 · Spacing that notices days, without pressure](#f05-l6--spacing-that-notices-days-without-pressure)
   8. [L7 · Sentence forging: say what you need](#f05-l7--sentence-forging-say-what-you-need)
   9. [L8–L17 · Language-as-a-tool task families](#f05-l8l17--language-as-a-tool-task-families)
   10. [L18 · Growth offered, never imposed: the Grow route](#f05-l18--growth-offered-never-imposed-the-grow-route)
   11. [L19 · Measuring what players actually meet](#f05-l19--measuring-what-players-actually-meet)
   12. [L20 · The kanji record and the chart](#f05-l20--the-kanji-record-and-the-chart)
8. [World](#f06)
   1. [What exists today (audit summary)](#f06-what-exists-today-audit-summary)
   2. [W1 · Evolving communities](#f06-w1--evolving-communities)
   3. [W2 · NPC routines](#f06-w2--npc-routines)
   4. [W3 · "Have you seen…?": finding people naturally](#f06-w3--have-you-seen-finding-people-naturally)
   5. [W4 · Day and night: evaluated, not recommended first](#f06-w4--day-and-night-evaluated-not-recommended-first)
   6. [W5 · Road events](#f06-w5--road-events)
   7. [W6 · New abilities reopen old places ("return keys")](#f06-w6--new-abilities-reopen-old-places-return-keys)
   8. [W7 · The Harbourmaster's long quest and sailing](#f06-w7--the-harbourmasters-long-quest-and-sailing)
   9. [W8 · The boat as a home: the travelling reading room (A57)](#f06-w8--the-boat-as-a-home-the-travelling-reading-room-a57)
   10. [W9–W17 · Exploration verbs (Astra's group B, all rated solid by Robin)](#f06-w9w17--exploration-verbs-astras-group-b-all-rated-solid-by-robin)
9. [Regions](#f07)
   1. [Overview](#f07-overview)
   2. [The score across twelve chapters (Robin, C-22)](#f07-the-score-across-twelve-chapters-robin-c-22)
   3. [R1 · Manybridge (八百橋, Yaobashi), the city of eight hundred bridges](#f07-r1--manybridge--yaobashi-the-city-of-eight-hundred-bridges)
   4. [R2 · The Cloudroad (雲路, Kumoji)](#f07-r2--the-cloudroad--kumoji)
   5. [R3 · Steamhollow (湯ノ谷, Yunotani)](#f07-r3--steamhollow--yunotani)
   6. [R4 · Kotonoha, the Isle of Word-Leaves (言の葉島)](#f07-r4--kotonoha-the-isle-of-word-leaves)
   7. [R8 · The Keepers' Road (灯守の道, Himori no Michi)](#f07-r8--the-keepers-road--himori-no-michi)
   8. [R5 · The Hall of a Hundred Tales (百物語の館)](#f07-r5--the-hall-of-a-hundred-tales)
   9. [R6 · Sazanami (漣) and East Landing: small ports for sailing](#f07-r6--sazanami--and-east-landing-small-ports-for-sailing)
   10. [R7 · The new settlement (postgame)](#f07-r7--the-new-settlement-postgame)
   11. [Regions considered and not recommended](#f07-regions-considered-and-not-recommended)
10. [Culture](#f08)
    1. [C1 · Register and role-switch scenarios (A41)](#f08-c1--register-and-role-switch-scenarios-a41)
    2. [C2 · Public spaces: observe, read, ask (A42)](#f08-c2--public-spaces-observe-read-ask-a42)
    3. [C3 · Polite boundaries and refusal (A43)](#f08-c3--polite-boundaries-and-refusal-a43)
    4. [C4 · Invitations and commitments (A44)](#f08-c4--invitations-and-commitments-a44)
    5. [C5 · A dialect field guide (A45)](#f08-c5--a-dialect-field-guide-a45)
    6. [C6 · Markets and practical numbers (A46)](#f08-c6--markets-and-practical-numbers-a46)
    7. [C7 · Gifts with communicative intent (A47)](#f08-c7--gifts-with-communicative-intent-a47)
    8. [C8 · Everyday documents (A48)](#f08-c8--everyday-documents-a48)
    9. [C9 · Folklore with several tellers (A49)](#f08-c9--folklore-with-several-tellers-a49)
    10. [C10 · The festival: planning, the night, and games that stay](#f08-c10--the-festival-planning-the-night-and-games-that-stay)
    11. [C11 · Manzai with Suzu: a double act](#f08-c11--manzai-with-suzu-a-double-act)
    12. [C12 · Pastimes](#f08-c12--pastimes)
    13. [C13 · Hot-spring customs (in Steamhollow)](#f08-c13--hot-spring-customs-in-steamhollow)
    14. [C14 · Stepping into a community's quarrel](#f08-c14--stepping-into-a-communitys-quarrel)
    15. [C15 · The press: composing stories readers react to](#f08-c15--the-press-composing-stories-readers-react-to)
    16. [C16 · Apologising and making up (from Robin's C-59)](#f08-c16--apologising-and-making-up-from-robins-c-59)
11. [Records](#f09)
    1. [What exists today (audit summary)](#f09-what-exists-today-audit-summary)
    2. [K1 · The Road Stamp Book (achievements)](#f09-k1--the-road-stamp-book-achievements)
    3. [K2 · The travel volume](#f09-k2--the-travel-volume)
    4. [K3 · The witnessed mark: the player's own seal](#f09-k3--the-witnessed-mark-the-players-own-seal)
    5. [K4 · Viewing: in the Wayfarer's Ledger and on the Main Menu](#f09-k4--viewing-in-the-wayfarers-ledger-and-on-the-main-menu)
    6. [K5 · Spoilers: veiled until you choose](#f09-k5--spoilers-veiled-until-you-choose)
    7. [K6 · Replaying moments](#f09-k6--replaying-moments)
    8. [K7 · Distractions](#f09-k7--distractions)
    9. [K8 · The companion's illustration set](#f09-k8--the-companions-illustration-set)
    10. [K9 · New Game+ and records](#f09-k9--new-game-and-records)
    11. [K10 · Fitting it all into the Wayfarer's Ledger](#f09-k10--fitting-it-all-into-the-wayfarers-ledger)
12. [Story](#f10)
    1. [1. Robin's direction](#f10-1-robins-direction)
    2. [2. The constraints](#f10-2-the-constraints)
    3. [3. How chapters are added](#f10-3-how-chapters-are-added)
    4. [4. The twelve chapters](#f10-4-the-twelve-chapters)
    5. [5. What twelve chapters cost, and how the plan keeps it manageable](#f10-5-what-twelve-chapters-cost-and-how-the-plan-keeps-it-manageable)
    6. [6. Making the Hush "more epic" without changing what it is](#f10-6-making-the-hush-more-epic-without-changing-what-it-is)
    7. [6a. The Hush as a rising tragedy (Robin, 2026-10-08)](#f10-6a-the-hush-as-a-rising-tragedy-robin-2026-10-08)
    8. [7. Companions in the new chapters](#f10-7-companions-in-the-new-chapters)
    9. [7a. Romance (Robin, C-63)](#f10-7a-romance-robin-c-63)
    10. [8. Separations from the companion (Robin's rule)](#f10-8-separations-from-the-companion-robins-rule)
    11. [9. Existing saves and the new chapters](#f10-9-existing-saves-and-the-new-chapters)
    12. [9a. New Game+ and the farewell](#f10-9a-new-game-and-the-farewell)
    13. [10. The postgame, expanded](#f10-10-the-postgame-expanded)
    14. [11. Length (no claims)](#f10-11-length-no-claims)
13. [Companions](#f14)
    1. [1. What Robin asked for](#f14-1-what-robin-asked-for)
    2. [2. The shape every arc shares](#f14-2-the-shape-every-arc-shares)
    3. [3. Separations, kept to a sensible number](#f14-3-separations-kept-to-a-sensible-number)
    4. [4. The four arcs (spoiler-free)](#f14-4-the-four-arcs-spoiler-free)
    5. [5. Music and staging for the night apart](#f14-5-music-and-staging-for-the-night-apart)
    6. [6. Bond](#f14-6-bond)
    7. [7. Building it](#f14-7-building-it)
14. [Roadmap](#f12)
    1. [Overview](#f12-overview)
    2. [Phase 0 · Listen and decide](#f12-phase-0--listen-and-decide)
    3. [Phase 1 · Quick wins (independent of the expansion's scope)](#f12-phase-1--quick-wins-independent-of-the-expansions-scope)
    4. [Phase 2 · Language foundations](#f12-phase-2--language-foundations)
    5. [Phase 3 · Encounter engine](#f12-phase-3--encounter-engine)
    6. [Phase 4 · World systems](#f12-phase-4--world-systems)
    7. [Phase 5 · Records](#f12-phase-5--records)
    8. [Phase 6 · Expeditions](#f12-phase-6--expeditions)
    9. [Phase 7 · Manybridge (new Chapters 3 and 4)](#f12-phase-7--manybridge-new-chapters-3-and-4)
    10. [Phase 7b · The Keepers' Road (new Chapter 7)](#f12-phase-7b--the-keepers-road-new-chapter-7)
    11. [Phase 8 · The sea and Kotonoha (new Chapter 9)](#f12-phase-8--the-sea-and-kotonoha-new-chapter-9)
    12. [Phase 9 · The Cloudroad and Steamhollow (new Chapters 10 and 11), and the edition ships](#f12-phase-9--the-cloudroad-and-steamhollow-new-chapters-10-and-11-and-the-edition-ships)
    13. [Phase 10 · The postgame](#f12-phase-10--the-postgame)
    14. [Phase 11 · Expressive portraits, second round (when Robin asks)](#f12-phase-11--expressive-portraits-second-round-when-robin-asks)
    15. [Phase 12 · Language review](#f12-phase-12--language-review)
    16. [Phase Z · The final art pass (outline only)](#f12-phase-z--the-final-art-pass-outline-only)
    17. [Final validation](#f12-final-validation)
    18. [Testing throughout (Robin's cadence)](#f12-testing-throughout-robins-cadence)
    19. [Alternatives to this order](#f12-alternatives-to-this-order)
15. [Idea register](#f13)
    1. [1. Astra's sixty proposals](#f13-1-astras-sixty-proposals)
    2. [2. Astra's other proposals](#f13-2-astras-other-proposals)
    3. [3. Robin's ideas: the first request \[R0\]](#f13-3-robins-ideas-the-first-request-r0)
    4. [4. Robin's ideas: the written review \[R1\]](#f13-4-robins-ideas-the-written-review-r1)
    5. [5. Robin's ideas: the ten-point clarification \[R2\]](#f13-5-robins-ideas-the-ten-point-clarification-r2)
    6. [6. Robin's later decisions \[H\] and this session](#f13-6-robins-later-decisions-h-and-this-session)
    7. [7. New in this plan (proposals Robin hasn't seen)](#f13-7-new-in-this-plan-proposals-robin-hasnt-seen)
    8. [7. Robin's second round of answers (2026-10-07)](#f13-7-robins-second-round-of-answers-2026-10-07)
    9. [8. Robin's third round of answers (2026-10-07)](#f13-8-robins-third-round-of-answers-2026-10-07)
    10. [9. Robin's fourth round (2026-10-08)](#f13-9-robins-fourth-round-2026-10-08)
    11. [10. Robin's fifth round (2026-10-08)](#f13-10-robins-fifth-round-2026-10-08)

## The Road of Borrowed Names: expansion plan (draft 7)

*2026-10-08. Draft 7 records Robin's answers of 2026-10-07 and 2026-10-08, through the fifth round. A planning document, not authorised work: nothing here gets built until Robin selects and authorises a scope. Robin's playthrough feedback comes first and may change any of it.*

This plan consolidates the expansion consultation with Astra (docs/future/consultation/, condensed in docs/future/EXPANSION_CONTEXT.md) and Robin's later decisions (HANDOFF.md, "Future expansion") into an implementation plan. Every idea is broken down on its own and checked against:

- the current game: a read-only audit of the code, saves, story canon and spec;
- the spec and project rules;
- each other.

> **Spoilers.** The plan is written so Robin, mid-Chapter 2, can read it safely. Existing Chapters 3–6 appear only as the spec describes them. **SEALED_STORY_NOTES.md contains spoilers: don't open it until you've finished the game.**

### How to read it

| File | What it covers |
| --- | --- |
| [01_PRINCIPLES.md](#f01) | The guardrails everything is checked against, and the exclusions |
| [02_FOUNDATIONS.md](#f02) | Engine work the rest stands on: story phases, seeded events, per-save records, inserting chapters, the content pipeline, size budgets, tests, spec amendments |
| [03_ENCOUNTERS.md](#f03) | Participants with purposes, arrivals and summons, wanderers, contextual responses, an honest preview, procedures, social encounters, Wait, Resolve this step, more creatures, consequences, **battles: groups, growth, silencing and modifier words** |
| [04_DUNGEONS.md](#f04) | Expeditions, persistent condition and stations, failure and suspend rules, previews, ten dungeon families, Atlas commissions (reactive and mapping), delvers, **the Hall of a Hundred Tales** |
| [05_LANGUAGE.md](#f05) | Honest learning evidence, what help supplied, mastery stars, word pages, "What I can do", sentence forging, the language-as-a-tool task families, growth offered |
| [06_WORLD.md](#f06) | Evolving towns, routines, "have you seen…?", day and night, road events, return keys, **the Harbourmaster's quest and sailing**, the boat home, exploration verbs |
| [07_REGIONS.md](#f07) | **The new regions**: names, stories, themes, mechanics, encounters, companions, illustrations, main story or postgame |
| [08_CULTURE.md](#f08) | Register, public spaces, refusal, dialects, documents, folklore, **the festival**, manzai, shogi and other pastimes, the press |
| [09_RECORDS.md](#f09) | The stamp book, **the travel volume**, the witnessed seal, the Main Menu gallery, spoilers, replay, Pastimes, the Wayfarer's Ledger |
| [10_STORY.md](#f10) | The twelve chapters, the Hush, companions, separations, old saves, the postgame |
| [14_COMPANIONS.md](#f14) | **A second arc for each companion**, all four at the same depth: a seed, pressure, a crossroads, a night apart, an unfinished matter, a postgame scene, their dream |
| [11_CONTRADICTIONS.md](#f11) | **Every contradiction found**, each labelled decided, open, to confirm or to revisit, plus the defects fixed in the current game |
| [12_ROADMAP.md](#f12) | The drafted order of execution, from your feedback to the final art pass, with testing per phase |
| [13_IDEA_REGISTER.md](#f13) | Where every idea went: Astra's 60, all of Robin's, and this plan's own |
| SEALED_STORY_NOTES.md | ⚠ Spoilers: canon reasoning behind story decisions |

### The plan in one page

**North star.** Japanese as increasing agency: every region gives the player something new to *do* with the language, not just more to look at.

**Regions** ([07_REGIONS.md](#f07)):

- **Manybridge** (八百橋), a canal city of eight hundred bridges. **Two new main chapters** (3–4) after Saltglass:
  - the Exchange (routing goods by who sends what to whom, contracts with conditions);
  - Blockprint Row and Playhouse Row (printing stories that readers react to, staging plays, manzai with Suzu, and **the river festival** with fireworks and games that stay).
- **The Keepers' Road** (灯守の道), the old lantern-keepers' road. **A new main chapter** (7) between Snowbell and Lanternfall: lore told several ways, a vigil of ninety-nine wicks, and the shuttered hall the postgame opens.
- **Kotonoha, the Isle of Word-Leaves** (言の葉島): Robin's island, now **a main chapter** (9). Reachable early by your own boat; it adapts to the story so far.
- **The Cloudroad** (雲路), a mountain highway of post stations, and **Steamhollow** (湯ノ谷), a crowded hot-spring valley. **Two new main chapters** (10–11) before the finale: weighing reports, carrying messages, making and declining arrangements, mediating a feud.
- **The Hall of a Hundred Tales** (百物語の館): the "100 Trials". Ten wings of ten tales, each relighting a lantern. Postgame.
- **Small sailing ports** (Sazanami, East Landing) and **a new settlement** to build up in the postgame.

**Story** ([10_STORY.md](#f10)): **6 → 12 chapters** (Robin's decision), all inserted before the finale, which stays last and stays resolved. Saves from the six-chapter edition don't continue into the new one; they are never deleted.

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

**Order** ([12_ROADMAP.md](#f12)):

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

### Decided on 2026-10-07

| # | Decision |
| --- | --- |
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

### Decided in the fifth round (2026-10-08)

| # | Decision |
| --- | --- |
| C-68 | Suzu's arc approved; Nao's, Mio's and Ren's fleshed out to the same depth by my judgement ([14_COMPANIONS.md](#f14)) |
| C-69 | Reasons to fight roaming creatures: lost words come back, routes change, quest carriers, notable creatures, stamps |
| C-70 | Each creature numbered by its action order, targeting kept; **Unravel and Protect grow** as story moments; **modifier words** (E27); only the Hush silences, and it's always inferable |
| C-71 | About one companion action a chapter; some found off the beaten path; never missable, since areas can be revisited |

### Still waiting for you

C-68 to C-71 are decided. Three small readings of your answers are labelled Confirm in [11_CONTRADICTIONS.md](#f11) part A6:

1. **C-72:** what each of your eleven modifier words does in play, and how they're learned ([03_ENCOUNTERS.md](#f03) E27).
2. **C-73:** no per-round ceiling on what a group can do; your options grow instead (E22).
3. **C-74:** Unravel reaches two in Chapter 4; Protect covers both in Chapter 7 (E27).

Also ready when you want it: **Harmony's sound** (E21), a small change to the current game.

### Fixed in the current game

The eight defects the audit found are fixed and tested ([11_CONTRADICTIONS.md](#f11) part D). For example, **Words › Grammar met** now lists the grammar you've met, and Translate in story activities now applies only to the customer or letter you used it on.

## 11 · Contradictions and open decisions

*Expansion plan, draft 7 (2026-10-08, after Robin's fifth round of answers). Planning only. Spoiler-safe.*

Robin asked for every contradiction that hasn't been answered yet, "like the illustration book we covered", with ideas for covering each. That one is the model:

- **The tension:** chapter passwords for gallery access contradicted the spec's ban on share codes (line 238).
- **The resolution:** Robin dropped passwords for an always-viewable Main Menu gallery \[H1\].

### How the labels read

| Label | Meaning |
| --- | --- |
| Decided | Robin has answered; the plan now follows the answer |
| Decided · detail open | Answered, but the answer raised one follow-up question (listed in part A2) |
| Confirm | I've proposed a reading of Robin's answer; a yes or no is enough |
| Open | Not yet answered by Robin |
| **Open · proposal stands** | Not yet answered; until Robin says otherwise, the plan follows the resolution given |
| Revisit | Robin will come back to it after the playthrough |
| Fixed | A defect in the current game, fixed and tested |

The register has these parts:

- **A. Decisions that blocked a feature.** All answered on 2026-10-07.
- **A2. Questions raised by those answers.** All answered in the second round, except Suzu (revisit).
- **A3. Questions raised by the second round.** All answered in the third round.
- **A4. Questions raised by the third round.** Answered (C-67).
- **A5. Proposals from the fourth round.** All answered (C-68 to C-71).
- **A6. Readings of the fifth round.** **The ones waiting for you** (C-72 to C-74).
- **B. Tensions this plan resolves.** Please confirm or overrule; some answered, the rest still open.
- **C. Already resolved.** Recorded so nobody reopens them by accident.
- **D. Defects found by the audit.** All fixed on 2026-10-07.

### Still waiting for you (at a glance)

| # | Question | Label |
| --- | --- | --- |
| [C-72](#f11-c-72--modifier-words-what-each-family-does) | Modifier words: what each of the eleven does, and how they're learned | Confirm |
| [C-73](#f11-c-73--no-per-round-ceiling-on-what-a-group-can-do) | No per-round ceiling on what a group can do | Confirm |
| [C-74](#f11-c-74--where-the-two-growth-moments-fall) | Unravel reaches two in Chapter 4; Protect covers both in Chapter 7 | Confirm |

---

### A. Decisions that blocked a feature (all answered 2026-10-07)

#### C-01 · Six chapters, or ten (or twelve)

- **Sides.** Spec line 38: "Build six substantial chapters." Robin \[R1\]: "a solid 10, or… 12."
- **Robin's decision:** "It can be 12 chapters." Decided
- **What follows.** The twelve-chapter outline in [10_STORY.md](#f10) §4 is now the plan: six new chapters, all before the finale. Spec line 38 is amended to "twelve". The playtime target (line 36) is a new question: C-61.

#### C-02 · What happens to saves already past an inserted chapter, including Robin's

- **Sides.** Inserting chapters means existing saves skip them. Migrations "must never invent history" (ADDENDUM_CONTRACTS). The project rule was "Do not… require New Game".
- **Robin's decision:** "Do not allow old saves to continue after implementation of new chapters." Decided · detail open
- **What follows.** When the twelve-chapter edition ships, a save from the six-chapter edition can no longer be continued. This replaces the project's "never require New Game" rule for that one change and nothing else: saves are still never deleted or rewritten, and every other update must keep saves working. The spec already asks for "incompatible saves" to be handled "gracefully" without clearing data (line 232), which is how the old saves are treated. The follow-up details are C-54. The four options of draft 1 (detour, Chapter Journey, NG+, postgame visit) are withdrawn.

#### C-03 · Restart-from-the-beginning on dungeon failure, and the spec's checkpoints

- **Sides.** Robin \[R2 §2\]: "If the player fails a dungeon, they should simply be able to restart from the beginning." Spec line 128: "Defeat should return the player to a sensible checkpoint…"
- **Robin's decision:** "Optional dungeons only. Story dungeons remain using checkpoints." Decided
- **What follows.** Optional dungeons restart from the beginning, and say so on their preview card. Story dungeons keep checkpoints and the declineable companion help (E19). Spec line 128 stands as written for story dungeons.

#### C-09 · Encounters that can't be won by Unravel alone

- **Sides.** Content rules: "Every battle must be winnable with Unravel alone" (AGENT_COMMON, CONTENT, ATLAS). Robin wants puzzle battles, mediation, procedures and objectives \[R1, R2 §1\].
- **Robin's decision:** yes, they are exempt. Unravel may have no use there, "unless a mechanic is something like untying a knot or fixing a crumpled ball of paper, stuff where 'unravel' means something, not untying enemy knots that won't exist in that context." Decided
- **What follows.**
  - The rule's wording becomes "every *combat* encounter is winnable with Unravel alone". Ordinary combat is unchanged.
  - Puzzle, social and objective encounters carry their own guarantee instead: at least two distinct ways to their conclusions, never a need for handwriting, and leaving is always possible without penalty.
  - In those encounters, Unravel appears only where something can literally be unravelled: a knot, a tangled line, crumpled paper, a snarled net. How it shows elsewhere: C-60.

#### C-12 · A temporary separation from the companion

- **Sides.** Robin \[R2 §1\] allows a companion to stay behind, be captured or be briefly incapacitated. Spec lines 70 and 290: "exactly two adventurers"; "no event creates a third party member".
- **Robin's decision:** separations can happen for story beats, "as long as you're unable to exchange them for another, you must be able to rejoin them guaranteed — no permanent separation. It can build suspense and tension, or just give you breathing room during a disagreement. They'll make up and be better for it, apologies and understanding abound." Decided
- **What follows.**
  - Spec amendment: "Exactly two adventurers after commitment. A story beat may separate them for a while; the same companion always returns, and no one takes their place."
  - Three kinds of separation are now in the plan ([10_STORY.md](#f10) §8): **staying behind** (the surety at the Mist Barrier), **captivity or danger** (suspense, with a rescue), and **a disagreement** (breathing room, then apologies and understanding).
  - No stand-in companion and no guest fighter. Help while apart comes from the place, notes and people who advise but never join a battle.
  - How a quarrel touches Bond: C-59.

#### C-13 · Mastery stars per input type and "no help-only rewards"

- **Sides.** Robin \[H4\]: stars per input type, awarded below 30% assisted questions. PRACTICE_CONTRACTS line 125: "No speed-only, handwriting-only or no-help-only reward".
- **Robin's decision:** "Mastery stars are just UI flair, not a real reward. It can be perceived that way by completionists, but must be clear that it's just for you to feel good about learning and grasping the language." Decided
- **What follows.** Stars unlock nothing and are never a condition for anything. The page that shows them says so in plain words: "These stars are just for you: a way to see what you've grasped. They don't unlock anything." Contract text added (L3).

#### C-14 · Is choosing the recognizer's second guess "assisted"?

- **Sides.** Today the pad shows the recognizer's top guess *and*, on the same row, its other readings; choosing one of those counts as assisted. Spec line 158: "A manual correction should allow progress while being recorded as assisted."
- **Robin's decision:** "If you draw る but it gets recognized as ろ, or カ when you draw か, it counts as assisted. It could only show one, immediate guess and allow you to redraw it before confirming without making it assisted. If you click a button to 'show more suggestions' then it's assisted." Decided
- **What follows** (a change to the existing pad, planned for Phase 1):
  - The pad shows **one** guess per character.
  - **Redrawing before confirming is free** and never marks anything.
  - A **"Show more suggestions"** button opens the other readings. Pressing it marks that answer as assisted, and the button says so, as Translate does. Picking from the kana or kanji chart stays assisted too.
  - Spec line 158 needs no change. Draft 1's "recognition repair" category is withdrawn.

#### C-17 · Timed or streak-based festival games and the no-clock rule

- **Sides.** Robin \[R1\]: personal streaks and high scores in festival minigames are fine. PRACTICE_CONTRACTS line 123: "No clock anywhere except an explicitly started fishing response entry"; spec line 218: never require fast reactions.
- **Robin's decision:** "an opt-in timed mode would be good. An untimed reward-free practice mode should be default." Decided · detail open
- **What follows.** Every festival game opens in an untimed practice mode that gives no rewards. A timed mode can be chosen, off by default, paused by help and never needed for anything, the same conditions as fishing. The contract is amended to allow that. What, if anything, the timed mode gives: C-55.

#### C-18 · The Atlas adapts during a run; Robin's rule says expeditions are fixed

- **Sides.** Robin \[R2 §3\]: a generated dungeon is fixed at generation and does not change after mistakes. Today the Atlas adds the player's weakest items to each encounter's practice pool during a run.
- **Robin's decision:** "The Atlas should remain the premier randomly generated dungeon for maximum replayability." Decided · detail open
- **What follows.** Draft 1's recommendation (choosing all of a run's content at its start) is withdrawn. The Atlas keeps its current behaviour. It also becomes the home of every generated expedition: the commissions of D7 (practice, themed, survey) are built as Atlas run types rather than a separate system. The reading of "fixed" this depends on: C-57.

#### C-21 · How big the game may get

- **Sides.** The single file is about 13 MiB; illustrations could add much more. Robin plays in Firefox.
- **Robin's decision:** no real concern until about 100 MB, "which is ludicrously large. Even then, it's hosted so not a top concern." Decided
- **What follows.**
  - The ceiling is 100 MB. The per-feature budgets in S6 stay as guidance, not caps.
  - One measurement stays in Phase 1, as a check rather than a limit: how long a large build takes to open in Firefox and on the foldable. A slow first load is a reason to decode art only when needed, not to cut content.
  - Hosting doesn't change the offline rule: the file must still run with no network.

#### C-35 · Fixing the learning record changes existing behaviour

- **Sides.** The audit found three learning-record defects. Fixing them makes evidence honest, but some items promote more slowly than before.
- **Robin's decision:** "I'll trust your best judgment on it." Decided, and fixed (part D).
- **What I decided, and why.**
  - **The promotion rule** said an item can't climb past box 2 "merely by choosing from options". In practice one typed or written attempt *ever*, even a wrong one, lifted that limit for good. Now the current run of correct answers must include a typed or handwritten one. A mistake ends the run.
  - **Copy steps** (Foundations, with the model shown) were recorded as unaided handwriting. The spec forbids counting a displayed answer as recall (line 188). They are now recorded as guided practice, and the feedback says "Guided practice — that's fine."
  - **Translate** in story activities stayed switched on for every later customer or letter. It now applies only to the one it was used on.
  - **Nothing already earned is taken away.** Existing boxes stay as they are. The new rule applies from the next answer. Choice-only play is still a full way to play (spec line 134): it reaches box 2, as it always did.

---

### A2. Questions raised by the first answers (answered 2026-10-07, second round)

#### C-54 · Old saves when the new chapters ship (from C-02)

Decided (second round). Robin's answer, in short:

- **Continuing or loading an old save says so first:** the journey will begin again at the start, *a fresh start*, without any satchel equipment or items. What carries over: settings, pastime records (shiritori, shogi and the rest), unlocked illustrations and other personal data.
- **This is New Game+, and New Game+ means the same everywhere:** it keeps personal learning records, mastery stars, illustrations and other personal metadata, never character or story progression. Over several runs a player can collect every story illustration, with every companion.
- **New Game+ is offered by default at the end of the game.**
- **Starting New Game+ plays a farewell with the companion:** they have unfinished work and hope to meet again. The player is drawn back to the start of the story, a little tearfully, with the promise that they won't be forgotten: the game tells the player that their illustrations, records and "memories" persist.

How the plan carries it out: [10_STORY.md](#f10) §9 and §10, [02_FOUNDATIONS.md](#f02) S4, [09_RECORDS.md](#f09) K9. Four small details: C-66.

#### C-55 · Festival rewards when the default mode gives none (from C-17)

Decided "The Festival Games are just for fun — they can have a personal record tracker, and that's it." The timed mode keeps personal records and nothing else. No stamp or keepsake comes from any score. The festival's story (setting up, the night, the fireworks) can still give its own story moments.

#### C-56 · The bath for they/them and custom pronouns (from C-27)

Decided Robin: "For unclear pronoun choices, the player should be given a choice, and stick with it if they revisit the baths." So:

- she/her: the women's bath; he/him: the men's bath, with no question;
- they/them and custom pronouns: the player chooses once, at the first bath (men's, women's or the inn's reserved bath), and the game keeps that choice for every later visit.
- **Nao and Ren** (they/them) make their own choice in character, and always the same one: written once for each and kept (Robin, third round). The player is never asked to choose for them.

#### C-57 · What "fixed at generation" means for the Atlas (from C-18)

Decided Yes: each run's shape is fixed when it is generated. Robin added an idea: the rooms inside that fixed shape can be generated at random too, so each run feels a little different. The plan adds per-run variation inside the hand-drawn room patterns (mirroring, obstacles, props, decor, where creatures stand), all chosen when the run begins and kept for that run ([04_DUNGEONS.md](#f04)).

#### C-58 · Two Ledgers (from C-37)

Decided **The Wayfarer's Ledger** (the pause menu) and **the Inn Ledger** (宿帳, the title's six saves). The labels change in Phase 1; the plan's text now uses the names.

#### C-59 · A quarrel and the Bond table (from C-12)

Decided A quarrel never lowers Bond, because it is always resolved meaningfully. Robin: it shows conflict and the everyday language of making up; "being apologetic is part of learning the language, too." The plan adds apologies and making up as a language strand ([08_CULTURE.md](#f08) C16). Robin's mention of "romantic partners" raised C-63.

#### C-60 · Unravel where nothing is tangled (from C-09)

Decided Unravel stays available in puzzle, social and objective encounters, **even where it does nothing**. It is never there just to remove knots from creatures. Working out whether it helps is the player's job: not every situation is cut and dried, and analysis is required. **The first non-creature group conflict teaches this:** the Tally Exchange dispute in Manybridge (Chapter 3). How this sits with the "effect here" preview: C-64.

#### C-61 · The playtime target for twelve chapters (from C-01)

Decided About **15 hours** for a brisk playthrough of the main story, later chapters taking slightly longer as they hold more; about **40 hours** for a new learner who takes in the whole game. Spec line 36 is amended to say so. The only figure so far is a content-based estimate, not a measurement: the existing six chapters at roughly 11–14 hours for a learner at a plausible pace. Both targets are checked by timed play, never claimed ([10_STORY.md](#f10) §11).

#### C-33 · Hanafuda, a traditional card game

Decided "Totally in." Koi-koi against people in the world, points only, never stakes ([08_CULTURE.md](#f08) C12).

#### C-62 · Suzu's dream (from C-31)

Decided (2026-10-08). Robin: her story could use an expansion with the new regions. As it stands, the player never meets her troupe again: her resolve to see the player's story through answers "why isn't she chasing them?", but not "do they know she's safe, what do they mean to her, and will they meet again?". So: she crosses paths with members of her troupe, and makes the hard decision to stay with the player; a key separation in which she sorts out her own thoughts, dismissive at first, then apologetic for making the player wait; a heartfelt night scene at a camp or inn, with a sombre, near-silent theme and night ambience; an unfinished matter from her past, resolved; and by the end, the next act with the same partner: the double act. She is a travelling comedian who wants fun and good company, not a star. **And all four companions get the same depth** ([14_COMPANIONS.md](#f14)).

---

### A3. Questions raised by the second round (answered 2026-10-07, third round)

#### C-63 · Romance

Decided Robin: "romance is fine, but probably limited to a kiss and/or holding hands — very much a story conclusion moment, depending on Bond. This could just be for the story ending, or very rarely elsewhere. Nothing explicit."

- **Who:** only the chosen companion. Canon makes all four companions adults (story bible: "Adults, not one-note"), and the player is an adult traveller. Any companion, whatever the player's pronouns.
- **What:** holding hands and/or a kiss. Nothing explicit, ever.
- **When:** the story's ending, at high Bond. Very rarely elsewhere (C-67).
- **Unchanged:** no jealousy, no resentment, no sulking; unchosen candidates never resent the player; Bond never drops. The contract and its test (`tests/unit/company_bond.test.mjs`) change only to allow romance wording inside scenes marked as romance moments.
- How the moment is offered: C-67.

#### C-64 · The "effect here" preview and analysis (from C-60)

Decided The proposal stands, with Robin's note that "puzzles or situations may evolve turn by turn, it may suffice to try something else".

- **Combat** keeps the honest "effect here" line (E5).
- **Puzzle, social and objective encounters** describe what each response does in general; the player reads the situation.
- **Trying something else is the answer** when a response does nothing. To make that easy, a response that did nothing is marked *tried* on its card ("Tried: nothing was tangled") until the situation changes, when the mark clears, because it might work now. Nothing is ever hidden or locked; the mark only saves the player repeating themselves.

#### C-65 · How gruesome a witnessed conflict may be (from C-11)

Decided As proposed: shown with restraint (aftermath, silhouettes, sound and reactions, cutting away at the worst moment, never explicit gore), a "Distressing scenes: shown / summarised" setting, and a reflection scene with the companion every time.

#### C-66 · New Game+ details (from C-54)

Decided Robin:

1. **Keepsakes and lore don't carry.** Nor do the Atlas cosmetics, the pet or Known details. The keepsake catalogue's "found" record and the noted-words notebook carry as personal metadata.
2. **The traveller stays as they are**: name, pronouns, appearance and (for they/them and custom pronouns) the bath they chose. No change is offered.
3. **New Game+ allows either**: beginning in the originating save's own slot (replacing it) or in another slot (keeping it). Replacing anything needs an explicit confirmation. (My reading of "allow either"; say if you meant something else.)
4. **The farewell comes from the originating save**: its companion says goodbye, not the companion of a save being overwritten.
5. An old save from before a companion was chosen gets the short solo farewell.

---

### A4. Questions raised by the third round

#### C-67 · How the romance moment is offered (from C-63)

Decided Robin: "that works." As proposed:

- **Always the player's choice.** At the ending, if Bond is high, the moment is offered in the scene itself: the companion says, in their own words, what the journey has meant, and the player can answer with the romantic moment (holding hands, a kiss) or as the closest of friends. Both are warm; neither is the "right" one; Bond is the same either way.
- **The companion's own consent is shown**, in their voice; nothing happens to anyone by surprise.
- **Elsewhere, at most one earlier moment, holding hands only:** after the reconciliation in Steamhollow (Chapter 11), at high Bond, and only as the player's choice there too.
- **Each moment has its own travel-volume illustration**, witnessed like any other; in New Game+ runs these accumulate per companion.

### A5. Proposals from the fourth round (all answered 2026-10-08)

#### C-68 · The companions' arcs and where their crossroads fall

Decided Robin: "I can only speak to Suzu's, which sounds promising. I would trust your judgment in making the other three equally fleshed out." [14_COMPANIONS.md](#f14) gives each companion a second arc with the same parts (a seed, pressure, a step in Chapter 10, their existing quest, a crossroads, a night apart, an unfinished matter settled, a postgame scene, their dream at the ending). The crossroads fall at: **Ren**, Chapter 7 (the Keepers' Road); **Nao**, Chapter 10 (the Cloudroad, woven into the Mist Barrier); **Mio** and **Suzu**, Chapter 11 (Steamhollow, where Suzu meets her troupe). The specifics are sealed (S14).

- **Corrected while doing it:** checking canon again, I found two of draft 6's arcs leaned on lines spoken *near* the companion by other characters. Nao's and Mio's arcs now rest on their own lines; every canon line is now checked for its speaker as well as its words.

#### C-69 · Reasons to fight roaming creatures

Decided Robin: "Sounds reasonable - yes." From [03_ENCOUNTERS.md](#f03) E24: every roaming creature carries a lost word that comes back to its place when it is settled; cleared routes change (people use them); a few authored quest carriers; notable named creatures that can teach the companion an action or give an exploration cosmetic; and field-guide stamps. No currency, random drops or "slay N".

#### C-70 · Group scaling and varied tactics

**Decided, with Robin's additions.** Robin: "Numbering each enemy by their action order is good. Groups should still respect targeting where applicable." Then three additions, now in the plan:

- **Growth, as story moments:** Unravel reaches up to two creatures after a point in the story; Protect covers both of you, "a meaningful moment of growth - not a surprise / sudden reward. You're a traveling Inkweaver, and still learning the ropes."
- **Modifier words** (E27, new): "Instead of choosing one response, we may be able to learn to use modifiers in battle / the overworld", such as すべてを守る ("Protect Everything") and 風がすべてを動かす ("The wind moves all"). Words that read alike behave differently (すべて / 全部 / あらゆる / 全体; それぞれ / ごとに; 大半 / たくさん / いくつか; 永遠に / 無限). "They play like target modifiers more than direct word/response transformations at heart. Extensions, really." They give options for harder fights with two to five creatures "without restricting what the enemies can do".
- **Two-move turns and silencing** "sound fine, as long as it can be inferred clearly": only Hush or Hush-adjacent creatures silence, never the player (E26).

My readings of the additions are part A6 (C-72 to C-74).

#### C-71 · Companions growing in battle

Decided Robin: "Sounds good - Not every action needs to be laid out in the clearest path, as we're letting unique enemies possibly reward the companion with a new tool or upgrade, too. This wouldn't be FOMO as the player can generally revisit any area at any time (within reason)." From E25: about one new companion action per chapter (from the story, their arcs, notable creatures and secret encounters), some actions growing a wider reach instead of piling up, at most six offered in a battle, and the curve test still guarding the language work. Notable creatures are never placed where an area closes for good.

### A6. Readings of the fifth round (to confirm)

#### C-72 · Modifier words: what each family does

Confirm [03_ENCOUNTERS.md](#f03) E27 gives each of your eleven words a role that follows its real meaning: *breadth* (すべて), *completeness on one* (全部), *every kind* (あらゆる), *the group as one* (全体), *each its own* (それぞれ), *in turn* (ごとに), *two of your choice* (いくつか), *all but one* (大半), *more on one* (たくさん), *lasting* (永遠に) and *no limit, this round* (無限に). Each is a trade, never a plain upgrade. Only natural phrases are offered, the help is honest where two words overlap in everyday Japanese, and with handwriting you write the modifier and its particle while the rest is shown. Six are taught by the new chapters' stories; five are found off the beaten path (the last two in the Trials).

#### C-73 · No per-round ceiling on what a group can do

Confirm Draft 6 proposed capping what a group could take from you in one round. Your "without restricting what the enemies can do" reads to me as dropping it: groups are met by your growing tools (modifiers, companions' growth, party-wide responses), while the curve test still guarantees every encounter can be won, at every setting, and with Unravel alone.

#### C-74 · Where the two growth moments fall

Confirm **Unravel reaches two** (いくつか) in Chapter 4, after the city's crowded fights; **Protect covers both** (すべて) in Chapter 7, on the Keepers' Road, where the keepers' old practice teaches it after a moment when a ward before one of you was not enough. Each is a scene, not a pop-up.

---

### B. Tensions this plan resolves (please confirm or overrule)

Rows marked **Open · proposal stands** are ones you haven't answered yet. Until you do, the plan follows the resolution in the row. Robin answered C-04 to C-11 on 2026-10-07 and the rest on 2026-10-08. All of part B is now decided.

| # | Tension | Sides | This plan's resolution | Where | Status |
| --- | --- | --- | --- | --- | --- |
| C-04 | Persistent health vs mistake costs that never compound | R1 wants health and status to persist; spec line 128 | **Robin: persistent health only where a dungeon specifies it**, not everywhere and not through trips to inns (tedious). In those dungeons, carry over only what tactics cost; restore what language mistakes cost at each encounter's end | D2 | Decided (2026-10-07) |
| C-05 | Stationed resources vs resource softlocks | R2 §2; spec line 216 | Exits always reachable; leaving is always possible; defeat applies the expedition rule | D2, D3 | Decided (2026-10-07: "your resolution fits") |
| C-06 | Suspend in the Trials vs six visible slots and no hidden saves | H2; spec lines 224, 228, 238 | A per-slot recovery-style record, removed with the slot, never listed as a save | D9 | Decided (2026-10-07: "your resolution fits") |
| C-07 | Ambushes vs visible, avoidable foes | R1; AGENT_COMMON | Ambushes only in dungeons whose preview says so; telegraphed on the map | E20 | Decided (2026-10-07: "your resolution fits") |
| C-08 | Arrivals and wanderers vs "Relaxed: one creature" and rules without randomness | R2 §1; COMBAT_NOTES | Relaxed never sees hostile arrivals; every random draw is seeded per save and stored before the battle | E2, S2 | Decided (2026-10-07: "your resolution fits") |
| C-10 | Lasting side-quest outcomes from "choosing incorrectly or waiting" vs no irreversible punishment for honest mistakes | R1; spec line 208 | The game shows the intention it understood before a committing action; recognition failures never commit; Wait counts only when chosen | E17 | Decided (2026-10-07: "your resolution fits") |
| C-11 | NPC deaths vs protected people | R2 §1; spec lines 94, 54, 242 | Never unchosen companion candidates, never people the player helped in a way that undoes their help; rare and authored. **Robin added:** a death is an avoidable consequence of the story and never stops it progressing; a conflict may be a little gruesome, never to NPCs who matter; failing to resolve a conflict never turns on the player: they may witness something terrible and reflect on it with the companion (how it is shown: C-65) | E17, 10_STORY | Decided (2026-10-07) |
| C-15 | A listening star using the device voice vs no listening validation from synthetic speech | H4; spec lines 280, 218 | Labelled "listening practice with your device's voice"; offered only where a voice exists; absent, not missing, elsewhere | L3 | Decided (2026-10-08) |
| C-16 | A "Distractions" tab vs never launching place-based activities remotely | R2 §6; practice index rule | **Robin:** the pastimes get their own **Distractions** tab in the Wayfarer's Ledger, outside Company: a page per game with code-drawn key art around it, how to play and where; companion games offered there, not on the Companion tab (K7, K10) | K7 | Decided (2026-10-08) |
| C-19 | Seals that survive deleting a save vs deletion removing a slot's data | R1's original wish; spec lines 228, 252 | **Robin: seals belong to the save itself, not the slot** — which is what this meant: the seals live inside the save's own data, so copying a save copies them, New Game+ carries them, and deleting a save removes them. A slot is only where a save sits; a new game written into a slot never inherits the old save's seals. The device-level alternative is dropped | S3, K4 | Decided (2026-10-08) |
| C-20 | Always fully viewable vs spoilers | H1; Robin's own wish to avoid spoilers; HX52; Astra | Veiled until revealed; one press per page or chapter; a setting removes the veil. H3 replaces HX53's "event-time appearance" for the Main Menu | K5 | Decided (2026-10-08) |
| C-22 | Inserted chapters vs the strict music intensity ladder | audio rule ZM2 | Re-tier across twelve chapters. **Robin:** energy, lift and intensity build region by region (Chapter 9 needn't be epic); the final region, dungeon and boss themes are unique and imposing; intensity comes from the writing, never from more instruments or a faster tempo; every piece belongs to one coherent score (07_REGIONS, "The score"; G16) | 07_REGIONS | Decided (2026-10-08) |
| C-23 | Achievements without trackers vs counting milestones | R1 | Curated stamps only; natural milestones allowed (Robin's own example); no visible counters towards them | K1 | Decided (2026-10-08) |
| C-24 | Printing stories "without restraint" vs never faking understanding of free text | R1; spec lines 182, 206 | Story blocks with tags; readers react only to what the blocks say; proofreading kept separate. **Robin:** free writing would be too lenient; the story blocks work well | C15 | Decided (2026-10-08) |
| C-25 | Construction tasks vs "accept every valid answer" | R0; spec line 138; validator gap | Authored alternatives, checked by an upgraded validator | L7, S5 | Decided (2026-10-08) |
| C-26 | A dialect field guide vs "questions always use standard Japanese" and no caricature | R1; dialect rules | The guide is for understanding only; questions stay standard. **Robin: no native reviewers are available**, so: careful self-review against references, few well-attested dialect features, always labelled, recorded as self-reviewed (Phase 12) | C5 | Decided (2026-10-08) |
| C-27 | On-screen bathing vs the player's chosen pronouns (Japanese public baths are usually separated by sex) and tone | R1; spec lines 62, 72 | **Robin: follow pronouns.** she/her: the women's bath; he/him: the men's bath; they/them and custom pronouns: C-56. Towel-wrapped, nonsexual, adults; a "shown / summarised" comfort setting | R3, C13 | Decided (C-56) |
| C-28 | Shogi pieces vs furigana on every kanji (and no furigana toggle) | spec line 186; project rule | Pieces show their kanji *with readings*, as Japanese learner sets do. **Robin: build it as I see fit; Robin has never played**, so it is designed to teach from nothing (08_CULTURE C12) | C12 | Decided (2026-10-07) |
| C-29 | A "Grow" route for Advanced players vs no level above Advanced | R0; spec lines 168, 170 | Grow means nuance, genres and conflicting perspectives for A; never an invented tier or certification | L18 | Decided (2026-10-08) |
| C-30 | Road events that "disappear for a time" vs no missable content | R1; spec line 208 | They re-offer themselves on later visits until resolved; the Journey keeps them as unfinished | W5 | Decided (2026-10-08) |
| C-31 | Suzu "aspires to be a star" vs canon (she isn't one; she wants a double-act partner) | R1; canon | **Robin (C-62):** not an aspiring star; a travelling comedian who wants fun, good company and a partner for her shows: the double act. Her story grows with a second arc (14_COMPANIONS) | C11 | Decided (C-62) |
| C-32 | New Bond events vs the exact Bond table capped at 12 | company.md | Rebalance across twelve chapters; no gifts or loops. **Robin:** the table can grow if it needs room (it isn't player-facing); whatever gives Bond a natural progression, with more to do by spending time with the companion and following their story (14_COMPANIONS §6) | 10_STORY §7 | Decided (2026-10-08) |
| C-34 | New Game+ carryover of records | spec line 252 (must be defined) | **Settled by C-54:** New Game+ carries personal learning records, stars, illustrations and seals, stamps, pastime records, settings and other personal metadata; never story or character progression, equipment or items (details C-66) | K9 | Decided (C-54) |
| C-36 | Spacing reviews by days vs "nothing reads the wall clock" | Astra; practice core | Read the date only to space reviews; never show overdue counts or streaks | L6 | Decided (2026-10-08) |
| C-37 | "The Ledger" means two things | Robin calls the pause menu "the Ledger"; the game calls it the *folio*, and its *ledger* is the title's list of saves | **Robin: both are Ledgers, kept distinct.** Proposed names in C-58 | — | Decided (C-58) |
| C-38 | A day/night system vs the flag-only night design | R1 floated it; the night-leak continuity test | Not now; story-set evenings only in new regions; routines move on ticks | W4 | Decided (2026-10-08) |
| C-39 | Companion highlighting answers in story dungeons vs honest evidence | R2 §3 | Recorded as answer-supplied help; changes nothing else | E19 | Decided (2026-10-08) |
| C-41 | "Overly assisted" by weighting suspected fishing vs inferring motives | R2 §4; Astra | **Left to me (Robin):** in mastery exams the first committed answer counts (retries teach but don't count), nothing is suggested up front, undo and redraw are free when nothing prompted them, options are shuffled (L3) | L2, L3 | Decided (2026-10-08) |
| C-42 | More than three creatures vs layout, Harmony and memory | R1; audit | Three for ordinary encounters; up to five actors in authored set pieces with a two-row formation. **Robin:** the Harmony cut-in overlapping creatures is fine; it's quick | E12 | Decided (2026-10-08) |
| C-43 | Hands-on sailing vs untimed play, no reflex, no excessive walking | R1; spec lines 116, 218, 56 | Direct control, nothing chasing, no failure; skip any time; story events never skipped. **Robin:** things can go wrong aboard, fixed during the voyage or at port by writing the fix; seafaring words learned on the boat; no failure, made clear without saying so (W7) | W7 | Decided (2026-10-08) |
| C-44 | Early island content vs "only words the player can know by then" and every profile and companion | R2 §10; AGENT_COMMON; spec lines 246, 298 | Story phase, profile and introduced concepts read separately (S1); concept gates validated | R4, S1 | Decided (2026-10-08) |
| C-45 | "Elimination" in group encounters is undefined | R1 | Defined per encounter, never the most severe by default. **Robin:** every non-battle group situation is a unique, demanding one-off (reusable in the postgame with new characters), never solved in three turns of common sense (E8) | E17 | Decided (2026-10-08) |
| C-46 | Festival clothing vs garment shapes hard-coded in every renderer, and keepsakes that may change colour only | R1; audit | A yukata cut for the festival. **Robin:** festival only, never in battle, so **no Harmony art** for it (C10a) | C10a | Decided (2026-10-08) |
| C-47 | "Suspend only in the Trials" vs shiritori's "rest later" and the Atlas's resume | H2; audit | H2 is about expeditions; shiritori's pause is a game pause, unaffected; the Atlas resumes by ordinary autosave, consistent with H2 | D3 | Decided (2026-10-08) |
| C-48 | Chapter numbers in the consultation (5, 8) vs the renumbered ten | R1; the context note says they were illustrative | Mapped to twelve chapters: the boat around new 7–8; the island's main chapter is new 9 | R4 | Updated for twelve chapters (C-01) |
| C-49 | Tsuru as the Trials' lore source vs her canon voice | R1 | Fits: she had a teacher, and keeper lore is hers; lines in her dry voice | D9 | Decided (2026-10-08) |
| C-51 | The spec's 10–15 hour target vs a longer main story | spec line 36 | About 15 h brisk, about 40 h for a new learner. **Robin:** not measured yet; the goal is about **1–3 hours per chapter** overall (10_STORY §11) | 10_STORY §11 | Decided (2026-10-08) |
| C-52 | A Main Menu illustration of one companion when Continue travels with another | H3; Astra | The other participants stay fixed; only the player's look follows Continue. **Robin:** Main Menu illustrations also show the effects (border, sheen, holographic finish, stamp) earned on the Continue save (K4) | K2 | Decided (2026-10-08) |
| C-53 | Superboss and Trials rewards vs "no exclusive essentials" | A30; R1; spec line 126 | Stamps, illustrations (revealable) and cosmetics only | E16, D9 | Decided (2026-10-08) |

---

### C. Already resolved (do not reopen without Robin)

| Topic | Resolution | Source |
| --- | --- | --- |
| Gallery passwords | Dropped; the book is always viewable from the Main Menu | H1 (passwords also clashed with spec line 238) |
| Player appearance in illustrations | Continue save's look on the Main Menu; the player's own in game | H3 (replaces Astra's event-time appearance) |
| Suspend | Only the Trials; never from a battle | H2 |
| Mastery stars | Per input type; under 30% of questions assisted; **UI flair, not a reward** | H4; C-13 |
| Handwriting guesses | One guess; redraw freely; "Show more suggestions" counts as assisted | C-14 |
| Testing cadence | F/Ren routinely; the 16-combination matrix only on request | R2 §10, 2026-10-06 |
| The final art pass | Near the end, once content is settled | R2 §10, H6 |
| Exclusions | Crafting economy, collectible card game, daily chores, global difficulty scalar, correctness damage, politeness score, streaks outside recreational games, AI grading, RNG drops, pronunciation scoring, battle lanes, route editor, potion satchel, troupe death, gallery accounts | R1, R2 |
| Onsen on screen | Allowed, towel-wrapped and nonsexual; baths follow pronouns (C-56 for they/them) | R1; 2026-10-07 |
| Dungeon failure | Optional dungeons restart from the beginning; story dungeons keep checkpoints | R2 §2; C-03 |
| Generated dungeons | Fixed at generation; previewed before entry; the Atlas is the premier one (C-57) | R2 §3; C-18 |
| Chapter count | Twelve, all new chapters before the finale | C-01 |
| Old saves | Can't continue in the twelve-chapter edition; never deleted (details C-54) | C-02 |
| Unravel alone | Combat only; Unravel elsewhere only where it means something | C-09 |
| Separation | Story beats only; always the same companion back; never replaced | C-12 |
| Festival games, modes | Untimed, reward-free practice by default; opt-in timed mode | C-17 |
| File size | Not a concern below 100 MB | C-21 |
| Learning-record fixes | Done, by my judgement; nothing earned is taken away | C-35 |
| Shogi | Built as I see fit, designed for someone who has never played | C-28 |
| The two Ledgers | The Wayfarer's Ledger (pause menu) and the Inn Ledger (saves) | C-37, C-58 |
| New Game+ | Keeps personal records, stars, illustrations and personal metadata; never story or character progression, equipment or items; offered at the end of the game; a farewell with the companion | C-54 |
| Old saves | Continuing one begins New Game+ from it, with a notice first | C-54 |
| Festival games | Just for fun: personal records only | C-55 |
| Baths | By pronouns; they/them and custom choose once and keep it | C-56 |
| The Atlas | Fixed shape per run; rooms varied inside it at random | C-57 |
| Quarrels | Never lower Bond; always resolved; apologies as language | C-59 |
| Unravel outside combat | Always available, may do nothing; analysis required; taught at the first non-creature conflict | C-60 |
| Playtime | About 15 h brisk main story; about 40 h for a new learner taking in everything | C-61 |
| Hanafuda | In | C-33 |
| Companions' second arcs | All four at Suzu's depth; crossroads at Chapters 7, 10, 11 and 11 | C-68 |
| Roaming creatures | Lost words, changed routes, quest carriers, notable creatures, stamps; no currency, drops or "slay N" | C-69 |
| Group battles | Each creature's slip numbered by action order; targeting kept | C-70 |
| Silencing | Only Hush or Hush-adjacent creatures; never the player; always inferable | C-70 |
| Growth | Unravel reaches two and Protect covers both, as story moments; modifier words extend reach | C-70 |
| Companion actions | About one a chapter; some found off the beaten path, never missable | C-71 |
| Persistent health | Only in dungeons that specify it | C-04 |
| NPC deaths | Avoidable, never blocking the story; never to NPCs who matter; failure never turns on the player | C-11 |
| Romance | With the chosen companion, at high Bond; holding hands and/or a kiss; the story's ending, very rarely elsewhere; nothing explicit | C-63 |
| The "effect here" preview | Combat only; elsewhere read the situation, try something else; a *tried* mark until the situation changes | C-64 |
| Witnessed conflicts | Shown with restraint; a "shown / summarised" setting; a reflection scene | C-65 |
| New Game+ details | No keepsakes or lore; the traveller unchanged; either slot; the farewell from the originating save | C-66 |
| Nao's and Ren's bath | Their own choice, always the same | C-56 |
| The romance moment | Always the player's choice (romantic or closest friends, Bond the same); the companion's consent shown; at most one earlier moment, holding hands, after the Steamhollow reconciliation | C-67 |
| Suzu | A travelling comedian; crosses paths with her troupe; chooses to stay; a night apart; the double act at the end | C-62 |
| Companions | A second arc each, at the same depth (14_COMPANIONS) | C-62 |
| The Hush | A rising tragedy, chapter by chapter; heavy and imposing near its source | 10_STORY §6a |
| Distractions | Their own tab and pages in the Wayfarer's Ledger | C-16 |
| Seals | Belong to the save, not the slot | C-19 |
| Music | One coherent score; build-up by writing, not by volume; a unique, imposing finale | C-22 |
| Language review | No native reviewers: careful self-review against references | C-26 |
| Mastery exams | The first committed answer counts; nothing suggested up front; undo free | C-41 |
| Sailing | Repairs on board or at port; no failure, shown not said | C-43 |
| Situation encounters | Unique, demanding one-offs | C-45 |
| Yukata | Festival only; no Harmony art | C-46 |
| Playtime | About 1–3 hours per chapter | C-51 |
| Main Menu illustrations | Show the Continue save's earned effects | C-52 |

---

### D. Defects found by the audit (fixed 2026-10-07)

Found while reading the code for this plan. Robin asked for them to be fixed; all eight are. Each fix has a test that fails on the old code and passes on the new: `tests/unit/audit_fixes.test.mjs` (22 checks) and `tests/e2e/audit_fixes.mjs` (4 browser tests). Details: VALIDATION.md, "Audit defects fixed (2026-10-07)".

| Defect | Where | What a player saw | Fix | Label |
| --- | --- | --- | --- | --- |
| Words › "Grammar met" always showed its empty message | `ui/50_menu.js` read `RB.grammar.points`, which doesn't exist | The grammar page never listed anything | Reads each point met with `RB.grammar.get`, in the order met, with furigana | Fixed |
| The lantern activity's label lookup had the same bug | `engine/77_lanterns.js`, `ui/88_lanterns.js` | Grammar lamps showed the question's title or "A reading question" | Shows the grammar point's own title | Fixed |
| Story activities' Translate never reset between customers or letters | `ui/75_activities.js` | Later answers in the same activity were recorded as assisted | Resets for each customer and letter | Fixed |
| Foundations copy steps recorded as unaided handwriting | `ui/65_challenge.js` | Handwriting evidence was overstated for F players | Recorded as guided practice (spec line 188) | Fixed |
| The promotion rule's "varied" condition used lifetime tallies, wrong attempts included | `learn/10_mastery.js` | Items could reach the top box by choice alone after one typed attempt | The current run of clean answers must include a typed or written one; existing boxes kept | Fixed |
| The route chart drew a Cinder–Lanternfall road that can't be walked | `content/00_world.js` | A road on the chart that doesn't exist | Removed; a test now checks every chart road can be walked | Fixed |
| Creature patrols used `Math.random`, the language tasks' stream | `engine/50_world.js` | A creature's wandering could change which question came next | Patrols use the world's own seeded stream, as people already did | Fixed |
| Ordering validation never checked `alts` | `tools/validate.mjs` | An authored alternative could be unreachable | Checked now. It found one: an Intermediate ordering drill whose alternative used a tile the drill didn't have. The alternative became an explanation shown after the answer | Fixed |

## 01 · Principles and guardrails

*Expansion plan, draft 7 (2026-10-08, after Robin's fifth round of answers). Planning only: nothing here is authorised work until Robin selects a scope.*

Everything in the later files is checked against this page. Where an idea elsewhere seems to break one of these rules, this page wins, and the conflict belongs in [11_CONTRADICTIONS.md](#f11).

Sources are marked like this:

- **\[R0\]** Robin's first request.
- **\[R1\]** Robin's written review.
- **\[R2\]** Robin's ten-point clarification.
- **\[H\]** The six points Robin settled afterwards (HANDOFF.md, "Future expansion").
- **\[D\]** Robin's answers of 2026-10-07 to the plan's decisions, in two rounds (11_CONTRADICTIONS.md, parts A, A2 and B).
- **\[A#\]** One of Astra's numbered proposals.
- **\[P\]** A proposal made in this plan.

When sources disagree, the later one wins: \[D\] over \[H\] over \[R2\] over \[R1\] over \[R0\], and Robin over Astra.

---

### 1. The north star

> **Japanese as increasing agency.** Early on, the player can identify the right object. Later, they can ask for clarification, explain a plan, negotiate a change, reconstruct an event and solve a problem another way. By the end, the reward includes the real realisation: *"I can do more with this language than I could when I started."* (Astra's closing line, endorsed by Robin's review.)

Every new region, system and dungeon in this plan answers one question first:

> **What can the player do here that changes how they think or act — not just what they are looking at?** \[A, R0\]

A region whose answer is "more quests" is not ready to build. Robin: new regions should "feel fresh and new in general, not just more quests" \[R0\], and "not every region needs something inherently new … but should allow a fresh experience reliably every chapter or area" \[R1\].

### 2. Learning comes first, and it is never punished

| # | Guardrail | Source |
| --- | --- | --- |
| G1 | **Time spent reading, thinking, drawing, looking at help or fixing a recognition error never advances danger.** Only committed actions and turns do. An explicit Wait is an action; leaving the game open is not. | R2 §1, A |
| G2 | **Growth is offered, never imposed.** No hidden or permanent promotion to a harder language profile. Backing out of a stretch challenge is never punished. | R1 |
| G3 | **No global "Japanese accuracy" score governs anything**: not story access, not damage, not difficulty. | R1 (exclusions) |
| G4 | **A recognition or input-device problem is not a language mistake.** That separation, which the challenge runner already makes, survives every new system. | A, existing code |
| G5 | **Help is legitimate.** Assistance is recorded honestly as what it supplied, but it does not lower a reward, withhold a story moment, or remove a "witnessed" mark. Mastery stars \[H4\] are the one place help is weighed, and they are **flair, just for the player**: they unlock nothing, and the game says so (C-13). | R2 §4, R2 §6, H1, H4, D |
| G6 | **Every input mode stays a full way to play**: multiple choice, typing, handwriting. Listening is welcome and never required. Spoken pronunciation is never scored. | R1, H4 |
| G7 | **A dungeon does not move its goalposts.** It is chosen, or generated, before entry and then keeps its shape while the player learns it. Repeated failure never lengthens or reshapes it. The Atlas, the premier generated dungeon, may still choose which words each encounter practises (C-18, C-57). | R2 §3, D |
| G8 | **The main story can always be finished.** Story dungeons keep checkpoints (C-03) and offer escalating, declineable companion help after repeated difficulty, up to highlighting suitable responses. | R2 §3, D |
| G9 | **Sentence construction grows with new content**; existing content is not refactored to fit it. | R1 |

### 3. Challenge and consequence are allowed

Robin wants a world with real stakes, not one where nothing can go wrong \[R1, R2\]:

- Chosen challenges can be lost: a tactical study, an optional superboss, an expedition. Failing an optional dungeon restarts it from the beginning; story dungeons keep checkpoints \[R2 §2, C-03\].
- Side quests can end in more than one way, permanently, and combinations of outcomes can open hidden content \[R1\].
- A bad ending can exist if the player deliberately pursues it \[R2 §1\].
- Reinforcements, arrivals and summons are allowed by authored, turn-based rules (never on a clock). Ordinary ones are finite and uncommon; only a major boss may summon repeatedly, and summons must stay dispatchable \[R2 §1\].

**The boundary, from Astra's reading of Robin's review, carried forward:** a lasting consequence follows an *understood, committed* choice. Before any irreversible action, the game shows the player the intention it understood. A misread handwritten answer, or a sentence misunderstood while learning, never causes something irreversible on its own \[A, R2 §1\].

### 4. Narrative boundaries \[R2 §1\]

- **The troupe never dies**, and the companion and pet are never permanently taken away.
- **Separations are story beats** \[C-12\]: a companion can stay behind, be in danger, or take some breathing room after a disagreement. The same companion always comes back; nobody replaces them; nothing is permanent. A disagreement ends in apologies and understanding, and the pair are better for it; it never lowers Bond \[C-59\]. The solo stretch is playable without the companion: help comes from the place, notes and people who advise but never fight \[A, D\].
- Other NPCs may die: of old age, through bereavement, through an offscreen crime investigated from evidence, or in a conflict the player failed to resolve \[C-11\]. Such deaths are rare and carefully authored:
  - **avoidable**: a consequence the story lets the player prevent, and never one that stops the story going on;
  - **never NPCs who matter** (companion candidates, people central to a region's story);
  - **a little gruesome is allowed**, shown with restraint (C-65), with a "shown / summarised" setting;
  - **never turned on the player**: failing to resolve a conflict means witnessing something terrible, then a scene reflecting on it with the companion; it is never a punishment, and never a random result of a failed Japanese answer.
- **Romance** \[C-63\]: holding hands and/or a kiss with the chosen companion, at the ending and very rarely elsewhere, depending on Bond; always the player's choice (C-67); nothing explicit.
- Capture and other outcomes come from the situation as written. Each event's author decides its possible outcomes and how the player's choices lead to each.

### 5. Rewards and records

| # | Guardrail | Source |
| --- | --- | --- |
| G10 | **No FOMO, grind or bribery.** No rare RNG drops, login streaks, perfect-answer chains or daily chores. No reward that pushes a player to avoid help or change input mode. | R0, R1 |
| G11 | **Streaks and high scores exist only inside recreational minigames built for them** (festival games, for example), as personal records. | R1 |
| G12 | **Achievements mark meaningful moments**: chapters, regions, all side quests, dungeon families, the Trials. There are no checklists or trackers, except naturally earned milestones such as "used 15 different responses". Each comes with a visual badge, stamp or seal. | R1 |
| G13 | **Viewing an illustration is separate from having witnessed it.** Witnessed seals, stars and other personal records carry into New Game+ (C-54). The travel volume can always be viewed in full from the Main Menu. Each save earns a seal, border, sheen or badge on the illustrations it actually witnessed. Opening any illustration shows how it is unlocked. | H1, R2 §6 |
| G14 | **There is no consumable inventory.** The satchel is not a potion bag. Recovery in dungeons comes from stationed, limited resources tied to a place. | R1, R2 §2, R2 §5 |
| G15 | **Optional is genuinely optional.** Mapping dungeons, superbosses and the Trials give worthwhile rewards that are never essential advantages or story prerequisites. | R1 |
| G16 | **One coherent score.** Every piece of music belongs to one intentional score: shared motifs, each region's own small palette, intensity by writing rather than by more instruments or a faster tempo; the final chapter's themes set apart and imposing (07_REGIONS.md, "The score"). | D (C-22) |

### 6. Hard technical boundaries (the spec and the project rules)

These come from SPECIFICATION.txt and CLAUDE.md. No expansion relaxes them.

- **One offline file.** No network, CDN, server, account, login, API key or remote AI grading \[CLAUDE.md, R1\].
- **No save export or import, cloud saves, share codes, download-save buttons or hidden equivalents** (spec, line 238). This is why the gallery has no passwords \[H1\].
- **Every displayed kanji has furigana**, and the content validator enforces it.
- **Recognition stays separate from answer checking.** The expected answer is never used to manufacture a recognition result.
- **Existing saves keep working through every update, with one exception Robin decided** \[C-02\]: saves from the six-chapter edition don't continue into the twelve-chapter edition. Even then, no save is deleted or rewritten; old saves are handled as the spec's "incompatible saves", gracefully (line 232; details C-54). Every other change keeps the schema, database name, keys, slots, learning state and story.
- No new font files, CDNs, remote assets or runtime libraries.
- **Size:** no concern below 100 MB \[C-21\]. Load time on the phone is measured, not capped.

### 7. How the plan is tested and built

- **Routine check: F/Ren.** One full Foundations + Ren route, plus a focused test of whatever a change touches: the companion, the profile, the puzzle, the menu trigger. The 16-combination matrix runs only when Robin asks for the final check \[R2 §10, testing cadence\].
- **Reason before running.** Work out *why* a test is needed before spending a broad run on it.
- **Label evidence honestly.** An F/Ren clear proves that route. It does not prove Suzu's exclusive scene or an Advanced-only prompt.
- **Alternate outcomes** are tested with small saved-state fixtures, not extra full campaigns \[A\].

### 8. Art comes last

Robin: the final art pass is "a fresh coat of primer, paint and polish" once the content is settled \[R2 §10, H6\]. So in this plan:

- Every feature ships with **interim art at today's standard**: code-drawn, consistent, and no worse than the surrounding game.
- Each plan item records its **art requirements** (layers, poses, compositions, illustration slots) so that work is ready when the art pass begins. Producing final art early for content that may still change is not planned.
- The art pass itself is the last phase in [12_ROADMAP.md](#f12), outlined but not detailed, as asked.

### 8a. Words used in this plan

- **Wayfarer's Ledger** (C-58, decided): the pause menu (Journey, Words, Satchel, Map, Company), called the *folio* in the code and in draft 1.
- **Inn Ledger** (宿帳, C-58, decided): the title screen's list of six saves.
- **Profiles F / E / I / A:** Foundations, Elementary, Intermediate, Advanced.
- **Existing Chapter N:** today's numbering. **New Chapter N:** the ten-chapter numbering in [10_STORY.md](#f10).

### 9. Spoiler discipline (for this document)

Robin is mid-Chapter 2 and wants no spoilers. This plan never names or describes events of the existing Chapters 3–6. Where a decision depends on later canon, the main text gives the choice in spoiler-free terms and points to a numbered note in SEALED_STORY_NOTES.md. **Do not open that file until you have finished the game.**

### 10. What is excluded (and stays excluded unless Robin reopens it)

| Excluded | What remains allowed |
| --- | --- |
| Crafting economy | Purposeful, authored repairs and craft interactions |
| Collectible card game | Shogi and other traditional games, judged on their own merits |
| Daily farming or maintenance chores | Seasonal observation; one-off garden problems |
| Global difficulty scalar | Explicit profiles, chosen challenge settings, optional support |
| Damage multiplier for "correct Japanese" | Equivalent expressions of the same intention are equally effective |
| Politeness or cultural-correctness score | Context-specific outcomes, with explanations |
| Login streaks, general perfect-answer chains | Personal scores in a recreational minigame |
| Unreviewed AI dialogue grading | Bounded creative composition, authored alternatives, careful self-review (no native reviewer is available, C-26) |
| Rare rewards behind RNG drop rates | Unpredictable events without loot farming |
| Required spoken-pronunciation scoring | Optional listening |
| Spatial battle lanes (Astra #29) | Actors with intentions; formations stay as they are |
| Player-authored practice-route editor (Astra #60) | Curated commissions and generated expeditions |
| Consumable-hoarding satchel | Stationed resources |
| Permanent loss or death of the troupe | Temporary, solvable separation |
| Accounts or passwords for gallery persistence | An always-viewable Main Menu gallery |

## 02 · Foundations: the engine work everything else stands on

*Expansion plan, draft 7 (2026-10-08, after Robin's fifth round of answers). Planning only.*

These are the cross-cutting systems that several features need. Building them first keeps each later feature small and consistent. Every entry gives:

- **What and why**
- **Current state**: from a read-only audit of today's code; `file:line` points into `src/`
- **Approach**
- **Pros and cons**
- **Open questions**
- **Tests**
- **Effort**: S, M, L or XL, relative scope including content and validation, not a time estimate

---

### S1 · Story phases: one region, many moments

**What and why.** Robin's island idea \[R2 §10\] needs a region that is complete whenever the player arrives and adapts as the story moves on. The same machinery serves evolving towns (W1), road events (W5), the festival hall, and the new chapters' post-story states. Astra's refinement keeps three inputs separate:

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

- **Phase table.** A small phase table derived from chapter flags (`RB.phase.of(s)` returning, for example, `early | mid | late | post`, defined per region). Content can write `if: 'phase>=mid'` instead of long flag lists.
- **Phase-locked text.** Dialogue entries may be tagged with the earliest phase that may say them. The validator rejects any line that names something introduced later, using a "reveals" vocabulary list per chapter (story terms, people, places).
- **Stable activities.** A running activity or puzzle snapshots its phase and profile at start and holds them until it ends. It never changes under the player mid-task.
- **Concept gates.** A response or construction used in a task must already be taught by the visit's phase, or the task teaches it first. This enforces the existing rule that content uses only "words the player can know by then" (AGENT_COMMON).

**Pros.**

- One mechanism for the island, the evolving towns and the new chapters' after-states.
- Spoiler safety becomes testable instead of a matter of discipline.

**Cons.**

- Authoring cost: three phase versions of a region is roughly 1.8 times one version, not three times, since most text is phase-neutral.
- The "reveals" vocabulary list needs upkeep.

**Open.** How fine the phases are (four per region is the proposal).

**Tests.**

- Unit: every phase-tagged line respects its phase, using the reveals list.
- Unit: every task's concepts are taught by its earliest phase.
- Browser: visit the island at each phase from fixtures.

**Effort:** M (engine), plus content.

---

### S2 · Seeded event streams (no re-roll by loading)

**What and why.** Wanderers, arrivals, road events and sea events should feel unpredictable \[R2 §1\]. But the battle rules use no randomness today, and the battle settings sheet's guarantees depend on that (COMBAT_NOTES). Loading a save must not become a way to re-roll an event.

**Current state.**

- NPC wandering already uses seeded streams (`engine/50_world.js:683-710`).
- Creature patrols still use `Math.random` (`50_world.js:719-720`).
- The Atlas seeds its generation per run (`atlas/30_gen.js:32-58`).

**Approach.**

- **One per-save stream per event family**, in `s.rng`: a counter per family, seeded from `s.id` and the family name.
- **Draw before saving.** An event's outcome is drawn when the event becomes possible, for example when the player enters the map, and stored before any autosave. Reloading gives the same outcome. A later visit draws the next value.
- **No randomness inside battles.** If a battle can receive an arrival, the arrival schedule is drawn at battle start and stored with the battle's own state.
- **Creature patrols** move to a seeded stream. This is a small fix that also makes patrols reproducible in tests.

**Pros.** Fair and reproducible. Tests can force any outcome with a fixture seed.

**Cons.** "Random but recorded" can feel deterministic to a player who replays from a copied slot. That is fine and honest.

**Tests.** Unit: the same seed gives the same events; loading never changes a drawn event.

**Effort:** S.

---

### S3 · Records that live with each save (stamps, seals, stars, illustrations)

**What and why.** Achievements, witnessed illustrations, mastery stars and the stamp book \[R1, H1, H4\] need a home. The spec decides where:

- Deleting a slot removes its associated data (line 228).
- No flag mixing between slots (line 252).
- No visible second roster of saves (line 224).

Robin's H1 makes the gallery *always* viewable from the Main Menu, so viewing never depends on any save. Only the **witnessed** marks are per save.

**Current state.**

- Per-save records already exist:
  - `s.seq` counts every illustrated sequence viewed, even skipped ones (`ui/43_sequence.js:635-643`);
  - `s.company.memories`;
  - `s.awarded` once-only guards.
- Nothing is stored outside slots except device settings (`engine/80_save.js:341-353`).
- Slot `meta` has no appearance (`80_save.js:167-182`).

**Approach.**

- **A new per-save `s.records`**, migrated as empty: `{stamps:{}, seals:{}, stars:{}, accomplishments:{}, ...}`. It travels with copy and is removed with delete, exactly like the rest of the slot.
- **The Main Menu gallery reads; it never writes.** It reads the six slots' `records.seals` read-only, to show which existing saves witnessed each illustration ("seen in Journey 2 and Journey 5"). It writes nothing cross-slot.
- **Spoiler reveals.** Which illustrations the player has deliberately unveiled on the Main Menu is a *viewing preference*. It is stored in the device settings record, beside `prologueSeen`, which is already a device setting. It is not gameplay data and never marks anything witnessed ([11_CONTRADICTIONS.md](#f11) C-20).
- **Slot meta gains `look`**, the player's worn appearance, written on every save. The Main Menu uses the Continue slot's look \[H3\]. Older saves without it fall back to reading the slot's full state once, which `list()` already loads.

**Pros.**

- Respects every save rule.
- Deleting a save behaves as players expect.
- No new storage area to explain.

**Cons.**

- A player who deletes their only finished save loses its seals, though never the ability to view.
- Robin's original wish for marks that survive deletion is not met ([11_CONTRADICTIONS.md](#f11) C-19 offers the alternative).

**Tests.**

- Unit: the migration creates empty records.
- Browser: copy carries records; delete removes them; the Main Menu shows the union read-only.
- Browser: no write to another slot.

**Effort:** M.

---

### S4 · Saves, schema and the twelve-chapter edition

**What and why.** Adding chapters *between* existing ones is the plan's biggest structural change ([10_STORY.md](#f10)). **Robin's decision (C-02):** saves from the six-chapter edition don't continue once the new chapters ship. That removes draft 1's detour and migration design for those saves, and replaces it with an **edition boundary**. Saves are still never deleted or rewritten, and every other update keeps them working.

**Current state.**

- `RB.SAVE_SCHEMA = 1`.
- `migrate()` fills missing keys and runs eleven hooks (`80_save.js:155-166`).
- Chapter flags run `ch1_done`…`ch5_done`, plus `postgame`.
- Map links are gated by them, for example `sg.road → co.road` needs `ch2_done`.
- `s.chapter` and the title's list of saves show the chapter number.

**Approach.**

- **An edition number in every save** (`s.edition`, absent = 1). The twelve-chapter build writes edition 2.
- **On load, an edition-1 save is recognised, not migrated.** The slot shows it as "From the six-chapter edition". Continue or Load on it first explains that the journey will begin again (Robin, C-54): no satchel equipment or items; settings, learning records, stars, illustrations and pastime records carry. Until the player accepts, its data is left exactly as it was (spec line 232: incompatible saves handled gracefully, never cleared).
- **Accepting starts New Game+ from it** (the carryover in [10_STORY.md](#f10) §9a), with that save's farewell, in its own slot or another, as the player chooses, with a confirmation before anything is replaced (C-66).
- **One New Game+ carryover function** serves all three ways in (the end of the game, the Inn Ledger, an old save), so "what carries" is defined once (spec line 252) and tested once.
- **One boundary.** All six new chapters ship together, so saves stop only once.
- **New chapters get new flags** (`mb1_done`, `mb2_done`, `kr_done`, `ko_done`, `cr_done`, `yn_done`); existing flags keep their meaning, so the existing chapters' scripts don't change.
- **Chapter numbers are displayed through a map** (internal id to displayed number), so "Cinder Orchard" shows as Chapter 5 without its flags changing.
- **A schema bump to 2** for the edition field and anything else that changes shape. Every update within an edition keeps migrating saves as today.

**Pros.**

- No "after the fact" framing to write for inserted chapters; every edition-2 save plays them in order.
- Old saves are never lost or altered.

**Cons.**

- Players with an old save start again, softened by New Game+: their records and illustrations come with them.
- Robin's own finished save can begin New Game+ but not continue its story once the new edition replaces the current build.

**Tests.**

- Fixtures: an edition-1 save at each existing chapter, a finished one and a postgame one, loaded on the edition-2 build. Each shows as an old save; declining the fresh start leaves it byte-for-byte unchanged; accepting starts New Game+ carrying exactly the defined set and nothing else; the player can still delete it.
- The farewell plays with each companion, and the solo version for a save from before the companion was chosen.

**Effort:** M.

---

### S5 · The content pipeline for new regions

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
- **Recognizer and lexicon intake.** A script lists every new kanji in new content and whether recognition data and lexicon entries exist. KanjiVG-derived data is CC BY-SA 3.0 (docs/RECOGNITION.md); keep the notice.
- **A review ledger** (docs/review/): every new Japanese line is marked "self-reviewed" with the reference it was checked against, since no native reviewer is available (Robin, C-26). It never claims a native review that didn't happen (spec line 178).
- **Authoring templates** for each new task type (05_LANGUAGE.md), with worked examples at all four profiles.

**Tests.** The validator's own unit tests; a new-content report in CI-like runs.

**Effort:** M.

---

### S6 · Size and performance budget

**What and why.** `index.html` is about 13 MiB. The approved Harmony art alone added 1.8 MiB. Robin's illustrated travel volume (high-fidelity, animated, with the player in it) could add far more. **Robin's decision (C-21):** size isn't a concern below 100 MB. So the question is no longer "how big may it get" but "does it still open quickly and run smoothly", especially on the foldable.

**Current state.**

- Measured budgets:
  - battle figures 38.6 of 48 MiB;
  - Harmony caches bounded near 20 MiB;
  - portrait cache 8 MiB.
- There is no per-feature size budget.

**Approach.**

- **The ceiling is 100 MB.** Per-feature sizes are tracked as guidance, not caps:

  | Feature | Guidance | Notes |
  | --- | --- | --- |
  | Regions' tiles, props, creatures (code-drawn) | about 0.6 MiB per region | Code, not images, as today |
  | Travel-volume illustrations | about 250 KiB each (layers included) | Painterly art compresses well as lossy WebP, unlike pixel art; decoded only when opened |
  | New text content | about 1.5 MiB per 2 chapters | Measured from today's chapters |

- **Decode lazily**: illustrations decode only when viewed, and only one at a time.
- **Measure load time and memory** in Firefox and on the foldable as the file grows (Phase 1, then at each phase). A slow first load is a reason to decode later, not to cut content.

**Pros.** Content isn't cut for size; the phone stays usable.

**Cons.** A very large file takes longer to open the first time on a phone.

**Effort:** S.

---

### S7 · Test infrastructure for a larger game

**What and why.** Robin's cadence: F/Ren for the routine full route; focused tests for whatever changed; the full matrix only on request \[R2 §10\]. A larger game with branches, phases and early-access regions needs cheap ways to reach any state.

**Approach.**

- **State fixtures.** Build named fixtures for every chapter start, every phase of each adaptive region, and each side-quest branch point. Tests load them instead of replaying the story.
- **Extend the F/Ren sweep** (`tests/e2e/matrix.mjs F ren 1`) through the new chapters, the island at each phase, the boat, and the Trials' first wing.
- **Branch tests.** Each permanent side-quest outcome gets a small saved-state test (Astra: "a small saved-state test of an alternate outcome can complement the main run").
- **Budget tests** per S6.

**Effort:** M (grows with content).

---

### S8 · Spec and contract amendments (Robin's sign-off)

Several plans contradicted written rules. Robin answered the blocking ones on 2026-10-07. The amendments to write:

| Rule | Where | Amendment | Decision |
| --- | --- | --- | --- |
| "Build six substantial chapters" | spec line 38 | Twelve | C-01 |
| A 10–15 hour first playthrough | spec line 36 | About 15 hours brisk for the main story; about 40 for a new learner taking in the whole game | C-61 |
| New Game+ carryover "clearly defined" | spec line 252 | Personal learning records, stars, illustrations, stamps, pastime records, settings and other personal metadata; never story or character progression, equipment or items; offered at the end of the game | C-54, C-66 |
| Saves keep working | project rules | Except edition-1 saves in the twelve-chapter edition, which begin New Game+ when continued; never deleted without the player's confirmation | C-02, C-54 |
| "Every battle must be winnable with Unravel alone" | AGENT_COMMON, CONTENT, ATLAS | "Every *combat* encounter"; other encounter types carry their own guarantee, and Unravel stays available in them even where it does nothing | C-09, C-60 |
| "No speed-only, handwriting-only or no-help-only reward" | PRACTICE_CONTRACTS line 125 | Mastery stars are flair, not rewards: they unlock nothing | C-13 |
| "No clock anywhere except fishing" | PRACTICE_CONTRACTS line 123 | Also opt-in timed modes in pastimes, under fishing's conditions | C-17 |
| "Exactly two adventurers"; no operation removes the companion | spec lines 70, 290; HX52 | A story beat may separate them for a while; the same companion always returns; no one replaces them | C-12 |
| "Defeat returns to a sensible checkpoint… without grinding" | spec line 128 | Unchanged for story dungeons; optional dungeons restart from the beginning | C-03 |
| Battle themes rise strictly by chapter | audio rule ZM2 | Re-tiered for twelve chapters | C-22 (open) |
| No romance wording | companionship contract; `company_bond` test | Romance wording allowed only inside scenes marked as romance moments (holding hands, a kiss; nothing explicit); jealousy and resentment stay forbidden | C-63, C-67 |
| Replays live in Shared memories, with event-time appearance | HX53 | The Main Menu gallery uses the Continue appearance | C-20 (open) |

**Effort:** S (writing).

## 03 · Encounters

*Expansion plan, draft 7 (2026-10-08, after Robin's fifth round of answers). Planning only.*

Robin's diagnosis \[R1\]: "Given our current enemy diversity, combinations and 'approach' means little — we typically have battle flow in an expectant pattern, which can totally feel stale quickly." The fix is not more creatures. It is **more kinds of decisions**, each one readable, and a few genuine "Wow!" moments for people who pay attention.

### What exists today (audit summary)

- **The rules are clear and deterministic** (`engine/95_combat.js`). One language step per exchange; your response, then the companion's support action, then each creature's telegraphed move.
- **Responses act through global tags.** Water clears Heat on every creature; light clears the target's mist; and so on (`TAG_REACH` at line 112, effects at 353–431). Only an authored creature move can override what answers it (`intents[key].counters`).
- **Whiffs happen silently.** Water with no Heat present, rope with nothing gathered, or stone without Gust or Flood change nothing, and **nothing marks the card as ineffective before you choose**. Robin remembers Light being previewed as useless without Shroud. That was an older build, or a reading of the move's help note; the cards themselves do not say it.
- **Hard-wired limits:**
  - two party slots (`pc`, `comp`) throughout the rules, stage and choreography;
  - at most three creatures, with a formation that breaks at four (`ui/83_battle_stage.js:186,214,219`);
  - outcomes are only win, lose or flee;
  - phases trigger only on knot thresholds;
  - nothing summons;
  - creatures never join mid-battle.
- **Guarantees to keep:**
  - mistakes cost at most 1 per exchange and nothing in Assisted mode;
  - recognition uncertainty never causes damage;
  - defeat returns you to a checkpoint with learning kept;
  - nothing acts while you read.
- **The closest existing base for contextual rules** is Field Inkweaving's rule table: response family × object × state gives an effect, with a plain fallback per family (`engine/55_fieldweave.js`). It already has a "routine" repeat that skips the language step without recall credit, the precedent for Robin's "Resolve this step".

---

### E1 · Participants with purposes (the actor model)

**What and why.** Robin \[R2 §1\]: wanderers who "waltz into battle" with a clear intention and target; allies who fend off a specific creature; people who linger and engage you if you interfere with them. Astra's reading: "each participant has a purpose, rather than everyone belonging permanently to one of two teams."

**Approach.** Generalise the battle state from `pc / comp / foes[]` to a list of **actors**:

| Kind | Controlled by | Example | Can the player target them? |
| --- | --- | --- | --- |
| `party` | the player (you) and the support menu (companion) | you, your companion | (ally effects) |
| `guest` | its own agenda | a canal porter defending their barge | ally effects only, if they accept them |
| `foe` | its pattern | creatures | yes |
| `neutral` | its agenda | a merchant caught in the middle; quarrelling parties | depends on the encounter |
| `object` | the procedure | a sluice gate, a stage trap, a lantern to protect | yes, with procedure actions |

- **Each non-party actor has an agenda**: `{wants, target, leavesWhen, reactsTo}`. For example, *drive off the Tally Crab; leave when it settles or flees; if the player harms the crab before it can, remark and leave satisfied; if the player blocks its way, become engaged*. Robin's rule is honoured: interference has consequences specific to that person, and **helping does not universally provoke hostility**.
- **Spec boundary.** "Exactly two adventurers… other characters… must not become additional controllable party members" (spec lines 70 and 290). Guests are never on your menu. You can *ask* (a social action, E8); they decide.
- **Party rules unchanged:** the companion's turn, Harmony and techniques stay as they are.

**Engineering.**

- A rules refactor (XL). Keep `st.pc`, `st.comp` and `st.foes` as views onto the actor list, so the Atlas's patches, saves (battles are never saved) and tests keep working; this is the same trick `FOE_KEYS` already uses.
- Stage slots for guests and neutrals.
- A third party-status card for a guest ("Wayfarer · Nao · Porter"), without an action menu.

**Pros.** Every later encounter type (E2–E8) becomes data on one model.

**Cons.** The largest engineering item in this file. Choreography and art need guest figures.

**Tests.** Every existing battle test passes unchanged on the refactor before any new feature uses it.

**Effort:** XL.

---

### E2 · Arrivals, reinforcements and summons, counted in turns

**What and why.** Robin \[R1, R2 §1\]:

- Ambush encounters where more enemies join if you take too long.
- Dungeon arrivals by depth, difficulty and how full the room was.
- Bosses that summon, repeatedly if the encounter warrants it, but always dispatchable and never an automatic loss.
- Never time-based, never infinite in ordinary encounters, and not in every battle.

**Approach.**

- **Arrival rules are authored per encounter or per dungeon zone**, never global:

  | Encounter type | Rule |
  | --- | --- |
  | Ordinary map encounter | No arrivals (as today) |
  | Eligible dungeon encounter | 0–2 arrivals, scheduled at battle start from the zone's table (S2 seeded): `after N committed exchanges`, `when the lead falls below K knots`, or `if a signal is not silenced` |
  | Ambush (announced in the dungeon's preview) | Starts with fewer creatures; others arrive on stated exchanges |
  | Summoning boss | A summon every N exchanges, indefinitely if authored, **with at most M summons standing at once**. Summons are weak (1–2 knots) and are themselves a way to gain Harmony |

- **Make arrivals preventable.** An arrival is *telegraphed* like any other move: "A second moth is coming: in 2 exchanges." A response can stop it, such as ringing the bell to call the swarm off or binding the door with rope, so preventing the next arrival can be worth more than attacking.
- **Never a reading clock.** Only committed exchanges count. Opening help, drawing, or the settings sheet does nothing.
- **Tactical challenge settings:**
  - Relaxed: never any hostile arrival (keeps the tested rule "Relaxed: always one creature").
  - Standard: authored arrivals.
  - Demanding: authored arrivals plus the zone's optional extras.

**Pros.** Directly delivers Robin's ambushes and summoning bosses while keeping reading time free.

**Cons.**

- The difficulty curve test needs a new model of arrivals.
- Encounters can get long; cap the total at authoring time.

**Open.**

- Summon cadence and standing caps per boss.
- Whether Standard should ever see an ambush.

**Effort:** L (on E1).

---

### E3 · Wanderers

**What and why.** Robin's passerby allies and passerby threats, "random yet not super common"; the same wanderer should not follow you around \[R2 §1\].

**Approach.**

- **A small authored cast per region** (3–5): the canal porter, the busker, the pilgrim, the smuggler, the bath-keeper, the word-keeper's apprentice. Each has an agenda (E1), a sentence they say on arrival at every profile tier, and an intent bubble showing their target.
- **Eligibility:** dungeon and road encounters only, never story or boss battles unless authored.
- **Budget:** at most about 1 in 8 eligible encounters (tunable), drawn from the seeded stream.
- **Memory:** a wanderer cannot appear again within the next 5 encounters, and never twice in a row (Astra).
- **Dialogue doesn't cost a turn.** An in-battle remark pauses the battle like any line (Astra: "An intervening dialogue box should pause the encounter normally").
- **Reactions are authored per wanderer**:
  - thanks and leaves;
  - lingers and helps with the next creature;
  - grumbles that you stole their catch;
  - becomes engaged after you block them, which is a social mini-encounter, not combat by default.
- **Bond and memory.** A wanderer met several times becomes a known person, with a line in Known details and a cameo in a later scene (evolving communities, W1).

**Pros.** Life and surprise without unfairness.

**Cons.**

- Writing each wanderer at four tiers.
- Choreography for guest actions.

**Effort:** M (content) on E1.

---

### E4 · Contextual response relationships ("conditions"), not an element chart

**What and why.** Robin's example \[R1\]: "An enemy on fire being hit with a Wind-type response flaring up more, or a truly Fire-type enemy like a sentient flame… snuffed out by earth or water, emboldened by fire or wind." Explicitly: **not** "an excuse to tie in an elemental weakness system because it's shared nearly universally among JRPGs."

**Approach: visible conditions with consistent rules.**

- **A condition is something you can see and name**: *burning*, *wet*, *misted*, *frozen*, *airborne*, *rooted*, *made of paper*, *made of flame*, *glass*, *buried*. Creatures and the field can carry them. Each condition is shown on the creature's slip as a word with furigana and an icon, and explained in help.
- **A rule table**, the same model as Field Inkweaving: condition × response family gives an effect. Rules are per condition, *never per species*, so learning one creature teaches the world. Proposed core (to tune):

  | Condition | Water | Wind | Stone / earth | Flame | Ice | Light | Rope |
  | --- | --- | --- | --- | --- | --- | --- | --- |
  | **burning** | puts it out | **flares** (spreads to a neighbour) | smothers it | no change | steam: the field becomes misted | — | — |
  | **made of flame** (a fire spirit) | weakens it (a knot frees more easily) | **emboldens it** (+1 power) | buries it, so it skips a move | emboldens it | steam cloud | — | — |
  | **wet** | — | dries it | — | steam: misted | **freezes** (skips a move) | — | — |
  | **misted** | — | clears all | — | — | — | clears target | — |
  | **paper** | goes soggy (its blows weaken) | scatters (to the back) | — | **catches** (frees a knot, but threatens anything paper you protect) | — | — | bundles (Gathering stops) |
  | **airborne** | — | blown away (skips a move) | — | — | — | — | **grounded** |
  | **frozen** | — | — | **cracks** (frees a knot) | thaws (becomes wet) | — | — | — |

- **Combinations are where the "Wow!" lives** (A23): the companion's draught makes a creature wet, your ice freezes it; your wind clears mist, and the next light finds the hidden knot. They are taught by play, explained in help, and never secret.
- **Trade-offs, not universal success** (Astra, confirmed by Robin \[R2 §9\]): wind on a burning creature is valid Japanese and *bad tactics*. The preview says so (E5).
- **Field conditions** (rain, a flooded floor, a paper-strewn room) come from the place. That ties encounters to where they happen, as the battle backdrops already do.

**Pros.**

- Depth from a small, learnable set.
- The words (みず, かぜ, ほのお) gain meaning beyond a single counter.
- Rewards attention, as Robin asked.

**Cons.**

- Balance: the curve test must model conditions.
- Every creature needs its conditions authored.
- More help text at four tiers.

**Open.**

- The final table.
- Whether some conditions belong only to later chapters.

**Effort:** L.

---

### E5 · An honest preview: "suitable here" or "nothing to do here"

**What and why.** Robin \[R2 §9\]: "I suppose things could whiff, but not feel like you wasted your turn outright… It teaches me that Light did nothing… denoted on the actual choice before I make it." **Today the cards do not say it.** This is a small, high-value fix that does not need the rest of the expansion.

**Scope: combat** (Robin, C-64). Robin later asked puzzle, social and objective encounters to leave the judgement to the player (C-60). So the "effect here" line belongs to fights with creatures, whose state is visible and whose rules are fixed. In the other encounter types, cards describe what a response does *in general*; the result says plainly when it did nothing. As Robin put it, these situations evolve turn by turn, so trying something else is the answer; a response that did nothing is marked *tried* on its card until the situation changes, so the player doesn't repeat it by accident (C-64).

**Approach (combat).**

- Each response card shows a one-line **effect here**, computed from the same rules that will run:
  - "Clears the mist on the Moth."
  - "No Heat to cool: no effect here."
  - "Flares the fire: makes it stronger."
- **The preview is the rule.** It is computed by the rules code, so it cannot disagree with the result.
- **Keep unsuitable cards choosable** (players may still want to see what happens), but mark them.

**Pros.** Directly answers Robin's expectation; teaches; costs little.

**Cons.**

- Card text gets longer, so phone layout needs care.
- "Show what does nothing" makes the battle slightly easier. That is acceptable: the challenge moves to choosing among suitable responses.

**Effort:** S–M. **Recommended as an early, standalone improvement** (12_ROADMAP.md, Phase 1).

---

### E6 · Encounters with different objectives

**What and why.** A21: some encounters ask you to protect a lantern, keep a document dry, escort someone, or prevent arrivals rather than untie every knot.

**Approach.**

- **The objective is shown at the start**, with an icon and one sentence.
- **Objective actors are `object` or `neutral` actors** (E1) with their own small health and conditions. A paper document is *paper*, so a burning creature beside it is a real problem (E4).
- **Losing the objective** ends the encounter in an authored way (a recoverable setback in side content), not necessarily a defeat.
- **The Unravel-only rule.** Objective encounters are a new encounter type and do not have to be winnable with Unravel alone (Robin, C-09). Each must have at least two distinct winning approaches. **Unravel stays available even where it does nothing** (Robin, C-60): it helps only where something is really tangled (a knot, a line, crumpled paper), and working that out is part of the encounter.

**Effort:** M (on E1).

---

### E7 · Machines and procedures: puzzle battles

**What and why.** Robin \[R1\]:

- The battle presentation can host "objects in the room that require a step-by-step procedure."
- A grand boss can be "a deep understanding challenge… where the result of failure or mistake is to restart the encounter from step 1."
- You can "step away and examine the room… get clues… or revisit it later."
- \[R2 §9\]: a "Resolve this step" option for steps already completed.

**Approach.**

- **A procedure** is an ordered set of steps over a machine's state (gates, gears, weights). Each step has:
  - instructions to read (the language task: a notice, a prompt-book, a tablet);
  - one or more correct actions (responses or procedure actions such as "pull", "turn", "wait");
  - the machine's visible reaction.
- **Two kinds of mistake, treated differently:**
  - **Language mistake** (misreading inside a task): the normal retry, never a restart (spec line 128).
  - **Procedural mistake** (a committed action that is wrong for the machine's state): an authored consequence. For a *short* procedure it can restart from step 1, as Robin wants. For long procedures, the restart goes back to the last stable step (Astra: judge the cost by the procedure's length).
- **Commit with your interpretation shown.** Before a procedural action that can cause a restart, the game shows the intention it understood: "You will open the upper sluice first." This separates "I chose a wrong plan" from "the pad misread me" (01_PRINCIPLES.md §3).
- **Step away.** Leaving the encounter costs nothing. The machine's state is kept outside the battle, like field puzzles (`s.discovery.puzzles`); clues found elsewhere are noted in Known details.
- **Resolve this step** (E11) for steps solved before.
- **Spec boundary.** These are a new encounter type: winnable by procedure, not by Unravel (Robin, C-09). Unravel stays on the cards: where a procedure involves something tangled it is one of the steps; elsewhere it does nothing, and saying so plainly is part of the lesson (C-60).

**Examples in the plan:**

- the Nameless Bridge (Manybridge A);
- the Understage (Manybridge B);
- the Root Hollows (Kotonoha);
- several Hundred Tales trials.

**Effort:** L.

---

### E8 · Social encounters: mediation, negotiation, argument chains

**What and why.** Robin \[R2 §1\]:

- Mediating a group argument as a battle scene;
- "conversational choices only, some regular ones like Light or Water, and special options that appear as the situation advances";
- "regardless of what you do, it will come to an end, and what end it reaches will depend on your action or inaction";
- the companion offers "their own unique response options."

Astra's A24 (argument chains) and A28 (negotiation) belong here.

**Approach.**

- **Not every situation is cut and dried** (Robin, C-60). All the usual responses stay on the cards, Unravel included, even where they do nothing. Reading the situation is the player's job.
- **Each one is a unique scenario that makes the player think** (Robin, C-45). Every group situation that isn't an ordinary battle is a one-off, written for its place and people (the postgame may reuse a format with new characters). It must not fall to three turns of common sense: each has at least two of hidden information to uncover, competing goals to balance, a situation that changes in response, or a constraint that rules out the obvious move. A test plays the naive approach and checks that it doesn't simply win.
- **The first one teaches it.** The Tally Exchange dispute in Manybridge (Chapter 3) is the first conflict with no creature in it. It is built so the habit of reaching for Unravel meets a situation where nothing is tangled: Unravel answers "Nothing here is tangled: the problem is what each of them believes." The companion then says, in their own words, that this one needs reading, not untying; a one-line tip names the clues to look at (the claims record, who is heated, what each side wants). Later encounters assume the lesson.
- **The state is human, not knots.** Each party has a *stance*: listening, heated, closed, leaving. They also have a set of *claims* in a visible record (Astra: "a visible record preserves earlier claims, so success depends on reasoning rather than memorizing").
- **Actions:**
  - **Conversational choices** (bounded, authored, tiered): ask, clarify, restate, present evidence, propose.
  - **Ordinary responses where they mean something:** Light reveals the hidden note; Water cools a heated party (Heat is already a creature status, and here it is temper); the bell calls for quiet.
  - **Special options** that appear as the situation develops.
  - **Wait** (E9): let someone else speak.
  - **The companion's own options**, written per companion:
    - Nao spots an inconsistency;
    - Mio calms someone or calls out condescension;
    - Ren sheds light on a document;
    - Suzu breaks the tension with a joke.
- **Harmony as agreement.** In social encounters the Harmony meter tracks *mutual understanding*. Filling it unlocks a joint gesture with the companion that brings the parties together. The word "harmony" (合わせ) fits that better than in battle.
- **Several authored conclusions**, each reachable by a different route. None of them is "defeat". Some preserve disagreement (Astra: "Some valid resolutions can preserve disagreement").
- **Permanent outcomes** (side quests) follow the consequence rules in E17.

**Examples in the plan:**

- the Tally Exchange dispute;
- the Steamhollow inns (that chapter's climax);
- the Mist Barrier interview;
- the Gardener of Unsent Words.

**Effort:** L (system), plus content per encounter.

---

### E9 · Wait: an action, not idleness

**What and why.** Robin: waiting or skipping a turn can decide how an event ends \[R2 §1\]. Astra: Wait is an intentional action; leaving the game open is not.

**Approach.**

- A **Wait and watch** card in encounters that allow it. It costs the exchange.
- What it does is authored: it reveals the next two moves, lets a neutral act, or lets a quarrel run.
- In ordinary combat it can carry a small authored benefit (Nao's "reads the next two moves" is the model) so it is never a pure skip.

**Effort:** S (on E1).

---

### E10 · The companion in new encounter types, and tactical plans

**What and why.**

- Robin wants companions to contribute their own options in event battles, "not all the default support brand" \[R2 §1\].
- A26 (companion tactical plans): a standing intention you can override.

**Approach.**

- **Encounter-specific companion actions** are authored per encounter type: stage cues in the Understage, inconsistency-spotting in arguments, steam-handling in the vents.
- **Tactical plan** (optional, set in Settings or before an encounter):
  - "Choose for me: protect / reveal / press the opening."
  - The companion's turn then plays automatically with that intention unless you open the menu.
  - It speeds up ordinary battles for players who want it, and keeps identity: Nao still reads, Ren still wards.

**Effort:** M.

---

### E11 · "Resolve this step"

**What and why.** Robin \[R2 §9\]: for a longer sequence restarted from step one, an option, unlocked because you completed the step before, that performs the step without further input.

**Approach** (from Robin's wording and Astra's safeguards).

- **Eligible** only for the *same step under the same conditions* (same instructions, same machine state). Opening a valve does not solve a different valve.
- **Does everything the normal action does:** the machine moves, the turn and cost apply, the animation plays per settings.
- **Never:**
  - records fresh mastery evidence;
  - repeats a one-time reward;
  - solves the next step.
- **Labelled:** "Resolve this step (completed before)."
- **Precedent:** Field Inkweaving's "routine" repeats already skip the language step without recall credit (`ui/57_weave.js:293-306`).

**Effort:** S (on E7).

---

### E12 · More than three creatures

**What and why.** Robin raised enemy slots past 3 \[R1\]. Astra: more slots alone don't add depth. The audit:

- the formation code breaks at a fourth creature;
- the phone layout already overlaps at three;
- the Harmony portrait is already left out with three creatures on windows of 1440 px or narrower.

**Approach.**

- **Ordinary encounters stay at three or fewer.**
- **Authored set pieces may hold up to five actors**: a boss with summons, or a group plus a guest. They use a new **two-row formation**: back row smaller, front row larger, depth scaling as the battle stage already does.
  - **Compact slips** below 1280 px.
  - **On phones** the back row draws smaller and its name plates collapse to letters (A–E).
- **Validator:** at most 5 actors; at most 3 hostile at once outside boss summons.
- **Harmony:** the portrait's placement rules already fall back gracefully. Five actors will usually mean no portrait on smaller windows, which is acceptable, and recorded.

**Pros.** Spectacle where it matters, and only there.

**Cons.**

- Layout work.
- The geometry audit must cover 4–5 actors.
- Memory budget: the battle sprite budget is 38.6 of 48 MiB.

**Effort:** L.

---

### E13 · Equivalent expressions, different practice

**What and why.** A22: let a player choose *which* Japanese to practise without paying a tactical price.

**Approach.**

- Some responses gain **alternative phrasings of the same intention** (for example まもる, or a newer construction such as 〜ないように "so that it doesn't…").
- **Same effect, different language task.**
- New phrasings unlock as they are taught. A Grow-route player (L18) can deliberately pick the stretch version.

**Effort:** M.

---

### E14 · Preparation before an encounter

**What and why.** A25: inspect the surroundings, choose what to protect or use.

**Approach.**

- Where a visible creature waits on the map, an optional **"Look around first"** offers one or two preparations from the place: douse the brazier (no *burning* field), shut the shutters (no *wind*), move the lantern out of reach.
- Each is a small language task. Skipping is fine and never penalised.

**Effort:** M.

---

### E15 · Fixed-tool tactical studies

**What and why.** A27: optional compact puzzles with a known toolset and an objective within a number of *committed turns*; instant retry with an explanation of what changed.

**Approach.**

- A **Tactics Board** in Manybridge's Exchange hall and on the boat.
- About 30 authored studies, from teaching conditions (E4) to arrivals (E2).
- Optional; personal best per study (moves, not time).

**Effort:** M.

---

### E16 · Optional superbosses

**What and why.** A30: each tests a different combination of understanding and tactics, not enormous health. They can defeat you, retries preserve learning, and victory earns an honest personal record, not essential loot.

**Approach.**

- One **"old guardian" per region**, awakened in the postgame:
  - the Bridge Founder (Manybridge);
  - the Cloud Ox Elder (Cloudroad);
  - the Kettle's Mother (Steamhollow);
  - the First Keeper (Kotonoha);
  - plus one for each existing region (sealed note S7).
- **Each is built around one mechanic family**: conditions, arrivals, procedure or argument.
- **Rewards:** a stamp (K1), an illustration (K2) and a cosmetic. The illustration can be revealed without winning (H1).

**Effort:** L (content).

---

### E17 · Lasting outcomes and the consequence rules

**What and why.** Robin \[R1\]: an encounter with a larger group where each member is doing something; choosing incorrectly or waiting idly can eliminate a group member, with a permanent effect on the side quest's story; enough outcomes chain into hidden content. \[R2 §1\]: the troupe never dies; other NPCs may, rarely and contextually.

**Approach.**

- **Define "elimination" per encounter.** Fleeing, being captured, falling unconscious, leaving the group, giving up, or (very rarely, authored, offscreen) dying are different events. The author picks; the default is *never* the most severe.
- **Commit with interpretation shown.** Before an action that can cause a permanent outcome, the game shows what it understood the player to intend. A recognition failure never commits. A language mistake gets the normal retry. Only a *confirmed* choice can have a lasting consequence (spec line 208).
- **Wait counts only when chosen.** Waiting idly means the Wait action (E9), never time passing.
- **Record outcomes in quest state** (`quests` plus flags), never as a "failure"; the Journey describes what happened neutrally.
- **Hidden content from combinations.** Authored "outcome sets": for example, three side quests resolved by mediation rather than force unlock a later scene. They are documented in the quest data so the validator can prove each is reachable.
- **Nothing essential.** No main-story content or companion ending depends on a side-quest outcome. Illustrations of every outcome become *viewable* at chapter completion (H1); only the witnessed seal differs.
- **Unchosen companion candidates and the troupe are never subjects of severe outcomes** (spec line 94; Robin's boundary).
- **Robin's rules for deaths (C-11, 2026-10-07):**
  - a death is an *avoidable* consequence: the player could have prevented it, and the story goes on either way;
  - never to NPCs who matter;
  - it may be a little gruesome, shown with restraint, with a "shown / summarised" setting (C-65);
  - failing never turns on the player: they witness it, then reflect on it with the companion in a written scene.

**Effort:** M (system), plus content.

---

### E18 · Harmony: the open question, and its new roles

- **The open decision** (COMBAT_NOTES): one technique per filled bar (today), or capped charges per encounter. The expansion does not need charges. Bosses with summons (E2) give long fights more Harmony naturally. **Recommendation: keep one technique at a time.**
- **New role:** the meter as *mutual understanding* in social encounters (E8).
- **No Harmony in a companion's temporary absence** (10_STORY.md): techniques need two.

---

### E19 · Help in required story battles after repeated defeat

**What and why.** Robin \[R2 §3\]: a required dungeon must never stop the player reaching its finale; the companion can offer better assistance, "even… highlighting good/correct responses." Astra: offer it, and let the player decline it.

**Current state.** The language step always ends in success (wrong answers retry; "I don't know" reveals), so "repeated failure" can only mean **repeated defeat in the same encounter**. Nothing counts defeats today (by design: "no counts").

**Approach.**

- **Count defeats per story encounter**, in the save, used only for this.
- **Offers escalate.** After the first defeat the companion offers:
  1. **Explain**: what the creature's pattern is doing.
  2. **Suggest**: "When it gathers, rope stops it."
  3. **Point**: highlight suitable responses on the cards for the next attempt.
- **Always optional**, both ways: the player can accept or decline each offer. The player can also ask at any time from the battle's help, without waiting for a defeat.
- **Recording:** a highlighted answer counts as *answer-supplied* help in the evidence log (L2), and nothing else changes. The encounter, the profile and the rewards stay the same.

**Effort:** S–M.

---

### E20 · Ambushes and visible creatures

**Contradiction.** The content rules require visible, avoidable foes on maps (AGENT_COMMON). Robin wants ambush-style encounters \[R1\].

**Resolution proposed** ([11_CONTRADICTIONS.md](#f11) C-07):

- Ambushes exist only in dungeons whose preview says so (D4).
- They are telegraphed on the map (rustling, a shadow, a sound with a visual cue).
- They start with fewer creatures than the full group, the rest arriving on stated exchanges (E2).

---

### New creature roster (all regions)

From [07_REGIONS.md](#f07): about 35 new creatures and 8 bosses or spirit climaxes. Each needs:

- art, at code-drawn interim quality;
- a choreography family (coverage tests fail on unmapped families);
- help text at four tiers, a gist and an icon;
- conditions (E4);
- a Creatures Met entry.

The art pass at the end replaces interim art.

---

## Battles: Robin's notes of 2026-10-08

Robin wrote these from the playthrough (nearly the end of Chapter 2, travelling with Suzu). Each gets the facts as the game stands and a proposal. Planning only.

### E21 · Harmony needs a sound

**Robin:** the cut-in "feels a bit empty" without sound. A base Harmony sound as it slides into frame, for every combination; each combination with its own effects that feel important (a sparkle when Suzu's animation reaches its peak, for example); none when battle animations are set to Instant.

**Approach.**

- **A shared arrival sound** for every cut-in, timed to the slide-in: a short rising swell with a soft strike, the same for all four pairs so the player learns "this is Harmony".
- **One accent per companion**, timed to that companion's peak frame and drawn from their technique:
  - **Nao:** a quick throw and a paper snap, like a letter landing on a counter.
  - **Mio:** a rising shimmer of water, then a glass chime.
  - **Ren:** a deep lantern-bell tone that blooms and hangs.
  - **Suzu:** a sparkle and a little drum flourish, a stage's "ta-da".
- **Made in the game's own audio engine** (src/audio, synthesised like every other sound), level-matched to battle music, following the sound settings.
- **Timing follows the cut-in setting:** Normal plays both sounds at their frames; Fast compresses them with the shorter cut-in; **Instant plays none** (Robin).
- **Tests:** a unit test that each pair has its cues and that Instant schedules none; a browser check that the cues fire at the arrival and peak frames.

**Effort:** S. **Recommended for Phase 1**: it improves something Robin plays now.

### E22 · How groups scale today, and what changes

**Robin's question:** as groups grow, all three creatures might attack at once; if Protect blocks only the first, it could become unmanageable. How do player and companion health scale against enemy damage and numbers?

**How it works today** (docs/COMBAT_NOTES.md; checked by `tests/unit/combat_curve.test.mjs`):

- **The setting decides the numbers:** Relaxed always one creature (14 resolve), Standard up to two (12), Demanding up to three (10). Resolve is restored after each encounter.
- **Groups are shared out:** in a pair each creature has half its knots, in a trio 40 %, so a group lasts about as many exchanges as one creature.
- **They take turns:** each creature after the first starts further into its pattern, so their blows don't all open together. Every move is telegraphed on its slip before you choose.
- **Protect (まもる)** raises a ward before one of you: it blocks a Strike aimed at that person, or soaks 2 later. Other responses answer a move from *every* creature: stone, warmth, fire, bell, voice and healing guard the whole party, and water and wind act on every creature.
- **Mistakes cost at most 1 resolve per exchange**, whatever the group; recognition uncertainty never costs any.
- **Measured:** with a companion, a Demanding trio lasts about 4.1 exchanges and leaves you at 70 % at the lowest; alone, the hardest case (an Atlas trio) leaves 20 %. Every encounter is won at every setting.

**So Robin's worry is mostly answered by staggering and the party-wide responses**, but it grows with the new chapters' larger groups and two-move turns (E26).

**Robin's decision (C-70):** "Numbering each enemy by their action order is good. Groups should still respect targeting where applicable." Robin would rather give the player options for the harder fights with two to five creatures "without restricting what the enemies can do". So:

1. **Show the order** (decided). Each creature's slip carries its number in this round's order and whom its move is aimed at (decided when it is telegraphed, as today), so the player sees whose blow lands first and on whom.
2. **No per-round ceiling** (dropped; C-73 to confirm). Draft 6 proposed capping what a group could take in one round. That restricts the enemies, so the player's answers grow instead: modifier words (E27), companions' growth (E25) and the party-wide responses.
3. **Protect grows, as a moment of growth** (decided): 「すべてをまもる」, a ward before each of you, learned in a scene in Chapter 7 (E27). Companions' guarding actions (E25) cover more too.
4. **Teach the party-wide answers** when trios first appear: a short note the first time three moves are telegraphed together, pointing at responses that answer every creature.
5. **The curve test extends to twelve chapters**, with the same promises: Relaxed single and gentle, groups a step and not a spike, companions and modifiers never shortcutting the language work, and every encounter winnable with Unravel alone.

**Effort:** M.

### E23 · More kinds of creature

**Today:** 29 ordinary kinds across the six regions plus 6 bosses (Reedwake 3, Saltglass 7, Cinder Orchard 4, Snowbell 5, Lanternfall 5, the Still Archive 5), and 12 more in the Atlas with 3 guardians.

**Robin:** more types, both for general battles and for the new puzzle and group situations; judge what each region's theme can hold; more than one new kind per region is fine.

**Approach.**

- **Every region at least 6–8 ordinary kinds**, each with a move or combination of moves no other has (never a recolour). New regions already list 6–10 each ([07_REGIONS.md](#f07)).
- **Existing regions get 2–3 new kinds each**, themed from what the spec says of the place:

  | Region | Proposed new kinds (working names) |
  | --- | --- |
  | Reedwake | **Silt Toad** (a Mire that slows your ward), **Reed Whisperer** (Shroud with a False promise), **Storm Kite** (Gust that strips a ward) |
  | Saltglass | **Gull Thief** (snatches a ward away), **Tidepool Imp** (Flood with a slow build), **Net Tangle** (binds a response; Unravel's natural home) |
  | Cinder Orchard | **Glass-Shard Wisp** (Mirror), **Ash Mole** (Gathering from below), **Persimmon Imp** (False promise that ripens) |
  | Snowbell | **Icicle Bat** (Chill from above), **Snow Hare** (Chill and Sweep), **Starling Wisp** (Shroud that light alone clears) |
  | Lanternfall | **Notice-Board Mimic** (Plea and False promise), **Queue Spirit** (Waiting that turns into a Strike), **Ledger Weevil** (Re-tying from the records) |
  | The Still Archive | **Index Card Swarm** (many small blows), **Silent Bell** (Hush that spreads), **Page Wraith** (Mirror and Hush) |

- **Each new kind:** its battle art at today's standard, its moves and help text at four tiers, a Creatures Met page, and a place in the curve test.
- **Situation encounters** (puzzle, social, objective) get their own casts per scenario (E7, E8), never reused creatures.

**Effort:** L (spread across the chapters' phases).

### E24 · Why fight a roaming creature? (options, as Robin asked)

**Today:** roaming creatures give practice and clear the way; only two story creatures give anything at all (both bosses), and the Saltglass nets and sea glass come from scenes, not creatures.

**Robin:** some incentive beyond space and practice; avoid currency (unless for a quest), "slay 5 crabs", and cosmetic drops from ordinary creatures; cosmetics only from harder encounters, perhaps as an exploration bonus.

**Options, each within the plan's guardrails (no random drops, no currency, no counters to grind):**

| # | Option | What the player gets | Verdict |
| --- | --- | --- | --- |
| 1 | **Every roaming creature carries a lost word** | Settling it releases a word the Hush took from that place; a sign, a label or a person's memory comes back nearby (a visible change, W1). The word joins the notebook | **Recommended**: it fits the world exactly, rewards every fight, and turns practice into restoration |
| 2 | **Clearing a route changes it** | When a path's creatures are settled, people start using it: a trader, children, a road event, a shortcut | **Recommended** |
| 3 | **Quest carriers, authored** | A few creatures hold a quest object (a lost float, a bundle of letters), always one named creature, never "collect five" | **Recommended**, sparingly |
| 4 | **Notable creatures** | Fixed, named, harder variants in out-of-the-way places. Settling one can teach the companion a new action (E25) or give a cosmetic as an exploration bonus | **Recommended** (Robin's "cosmetics on harder encounters") |
| 5 | **Inscription fragments** | Settling certain creatures in a particular way leaves part of a stronger form of a word (a gust that also lifts mist) | Possible; overlaps with 4, so only a few |
| 6 | **Field-guide stamps** | A stamp for settling every kind in a region: a natural milestone, no counter shown (K1) | Recommended as a small extra |
| — | Currency, random drops, "slay N", crafting materials | — | **Excluded** (Robin, R1) |

**Effort:** M (options 1–3 are content plus small engine hooks; 4 builds on E25).

### E25 · Companions grow in battle too

**Today:** each companion has five actions across the whole game: one on joining, a second when Chapter 2 ends, one from their personal quest, and two from the optional long quest lines. The player has twelve inscriptions to learn. So Robin's Suzu has only Heckle until the end of Chapter 2 ("Draw its eye" arrives then).

**Robin:** more should open up, steadily, for both the player and the companion; unique creatures and secret encounters could teach companions abilities, not just people or quests.

**Approach.**

- **About one new companion action per chapter**, so twelve chapters give each companion ten or more, from:
  - the main story's chapter ends;
  - their personal quest and their second arc's beats ([14_COMPANIONS.md](#f14));
  - **notable creatures** (E24): a companion learns from a creature they faced, in their own way (Suzu copies a tumbler's pratfall into a routine; Ren learns a lantern-moth's glow; Mio a spring-imp's steam; Nao a gull's swoop);
  - secret encounters off the beaten path.
- **Upgrades as well as additions**, so the menu doesn't sprawl: some actions grow a wider reach later (Heckle learns to reach every creature).
- **A manageable menu:** at most six actions offered in a battle, ordered by usefulness against what is telegraphed; the rest are a page away.
- **The player grows too:** new inscriptions in the new chapters (はし, すみ, みち, ゆ already planned, W6) and stronger forms of familiar ones.
- **The curve test still guards the language work:** companions may never shorten it (rounds with a companion stay at least 70 % of rounds alone).

**Robin's decision (C-71):** "Sounds good. Not every action needs to be laid out in the clearest path, as we're letting unique enemies possibly reward the companion with a new tool or upgrade, too. This wouldn't be FOMO as the player can generally revisit any area at any time (within reason)." So:

- **Discovery is part of it.** No checklist of actions still to find; a notable creature appears on the Creatures Met page once met, and the companion may mention a rumour once.
- **Never missable.** Notable creatures and secret encounters are never placed where an area closes for good; each waits until it is settled.

**Effort:** M (system) plus content per chapter.

### E26 · Varied tactics: two moves at once, plans, and silencing

**Robin:** as battles get harder, creatures should vary their tactics as well as their numbers (outside the easiest setting): strike *and* shroud at once, so the player chooses what to answer, or covers both with a companion's ability; the Hush should be able to silence some responses for a time, forcing a different approach while leaving a solid way to progress.

**Approach.**

- **Two moves in one round** (from the middle chapters, Standard and Demanding only): a creature telegraphs, for example, a Strike and a Shroud together. The player answers one; a few responses and companion actions answer both. Never on Relaxed.
- **Plans over two rounds:** a creature telegraphs a sequence (Gathering, then Flood), so answering the first step heads off the second.
- **Group coordination:** two creatures act together on a telegraphed signal; answering the one giving the signal breaks it.
- **Silencing, extended.** Today one move, Hush, stops Unravel until a bell rings or a voice is raised, and only creatures of Lanternfall and the Still Archive, where the Hush is closest, use it. Later Hush creatures can silence **one family of responses, or the modifiers (E27), for a few rounds**, shown on the cards with the rounds left. It never silences everything; there is always a way through; and the promise that every combat encounter can be won with Unravel alone still holds (Unravel is only silenced when its counter is already known, as today).
- **All of it is telegraphed** before the player chooses, explained in help at four tiers, and tuned with the curve test.

**Robin's decision (C-70):** "Two-move turns and Silencing (Hush or Hush-adjacent enemies can Silence, not us) sound fine, as long as it can be inferred clearly." So:

- **Only the Hush silences.** Silencing belongs to Hush and Hush-adjacent creatures; the player never silences anything, and no response or modifier does.
- **Inferable at a glance:**
  - every creature that can silence carries the same visible Hush mark in its art, and its Creatures Met page says so;
  - its slip shows the silence before it lands: which family, for how many rounds, and what ends it;
  - a two-move turn shows both moves on one slip, joined by "and", in the numbered order;
  - a silenced card says why, how many rounds are left, and what would end it early.

**Effort:** M–L.

### E27 · Modifier words: extending a response's reach

**Robin (C-70):** instead of only choosing one response, the player learns **modifiers**, in battle and in the overworld. Choosing a modifier, then the response it extends: 「すべてを守る」 (*subete o mamoru*, "Protect everything") shields both of you; 「風がすべてを動かす」 (*kaze ga subete o ugokasu*, "The wind moves all") clears or blocks several shrouds; light with a word to reveal or illuminate. They are "target modifiers more than direct word/response transformations at heart. Extensions, really." Words that read alike at first can do different things (Robin's families below). They let targeting and order matter and give the player options in the harder fights with two to five creatures, "without restricting what the enemies can do".

**How reach works today** (src/engine/95_combat.js): Unravel, answers, light and rope act on the target; water and wind act on every creature; stone, warmth, fire, bell, voice and healing protect you both and answer that move from every creature; a ward goes before one of you. Ren's Harmony technique (Lantern Ward) already shields both, once.

**The idea in one line.** A modifier never acts alone. It changes *who*, *how many*, *what kinds*, *how much* or *how long* a response reaches; the response still does what it always did.

#### Choosing one in battle

1. The response panel gains a row of the modifiers the player knows. Choosing one shows on every response card what it would do with that modifier (targets highlighted, the reach in words). A response it can't extend is dimmed, with the reason.
2. Choosing the response then asks for the modifier's option, where it has one (いくつか: which two creatures; 大半: which one to leave out).
3. The player writes the phrase: 「すべてをまもる」, 「ひかりがすべてをてらす」.
4. Without a modifier, everything works exactly as today. Every combat encounter can still be won with Unravel alone.

#### What is written, and how it is recorded

- **A real sentence.** Noun inscriptions gain one partner verb each, with the particle that is natural for it: が for light and wind, which act by themselves (ひかりがてらす, かぜがうごかす); で for rope and water, which the player uses (なわでしばる, みずでながす). The list is settled in the language self-review (Phase 12).
- **Only natural Japanese.** A modifier pairs only with the responses it reads naturally with. An unnatural pairing (たくさん with まもる, say) is simply not offered.
- **How much is written follows the input setting:** typed, the whole phrase; handwritten, the modifier and its particle, with the rest shown (a whole sentence by hand every round would be slow); profiles that don't write yet assemble the phrase from pieces.
- **Honest records.** The modifier, its grammar point, the response word and the partner verb are separate learning items. Only what the player actually wrote counts as written; shown parts count as nothing.

#### The families, and what each does in play

Words that look alike behave differently, and the difference follows each word's real meaning. Where two words overlap in everyday Japanese (すべて and 全部 often mean the same thing), the help says so plainly and presents the battle role as the Inkweavers' own convention, never as a rule of Japanese.

**All (who or what is covered)**

- **すべて (全て, *subete*)**, "all, every one". **Breadth:** every one on that side, each separately, each a little lighter. *Example:* 「すべてをまもる」: a ward before each of you; each blocks a Strike aimed at that person and soaks 1 later, not 2.
- **全部 (ぜんぶ, *zenbu*)**, "all of it". **Completeness on one:** all of it, for one target only. *Example:* 「きずをぜんぶいやす」: restores all of one person's resolve, instead of some to both.
- **あらゆる (*arayuru*)**, "every kind of". **Kinds:** answers a move of any kind, once. *Example:* 「あらゆるわざからまもる」: a ward before one of you that stops the next blow of any kind (Sweep, Gust, Flood, Chill…), not only a Strike.
- **全体 (ぜんたい, *zentai*)**, "the whole, as one". **The group as one body**. *Example:* 「ぜんたいをまもる」: one ward around the party that takes the first blow to land on either of you. Aimed at creatures, it answers what a group does together (a coordinated move, E26) and nothing else.

**Each (how it is shared out)**

- **それぞれ (*sorezore*)**, "each, respectively". **Each its own:** fitted to each target, this round only. *Example:* 「それぞれをまもる」: a ward before each of you that fits the blow aimed at that person (a Strike at one, a Chill at the other); it soaks nothing later.
- **ごとに (*goto ni*)**, "with each, per". **In turn:** repeats as each creature acts, in the numbered order. *Example:* 「いっかいごとにまもる」 (一回ごとに守る): a small ward renewed before every blow this round, whoever it is aimed at (each soaks 1).

**Amount (how many, how much)**

- **いくつか (*ikutsuka*)**, "some, a few". **Two of your choice**. *Example:* 「むすびめをいくつかほどく」: Unravel on two creatures, a knot each (Unravel's growth, below).
- **大半 (たいはん, *taiban*)**, "most, the greater part". **All but one,** the one the player leaves out, each at full strength. *Example:* 「なわでたいはんをしばる」: stops every creature's Gathering but the one left out (a creature you mean to answer another way).
- **たくさん (*takusan*)**, "a lot". **More, on one**. *Example:* 「みずをたくさんかける」: puts out one creature's Heat and soaks it, so it can't raise Heat next round.

**Lasting (how long, how many times)**

- **永遠に (えいえんに, *eien ni*)**, "forever". **Time:** one effect that lasts the rest of the encounter, until a named move breaks it. *Example:* 「かぜがえいえんにふく」: while the wind blows, no creature can raise a Shroud (a Gust breaks it).
- **無限に (むげんに, *mugen ni*)**, "without limit". **Count:** no limit on how many, this round only. *Example:* 「むげんにまもる」: the ward blocks every Strike this round, at either of you, then is gone.

**The grammar they bring** (each taught in a short lesson when first learned, with furigana and examples): すべて and 全部 as nouns and as adverbs, with 全部 often placed straight before the verb with no particle (ぜんぶたべた); あらゆる only before a noun; 全体 as "the whole" of something (クラス全体); それぞれ and それぞれの; ごとに after a noun (一回ごとに "every time", 駅ごとに "at every station"); 大半 (a little formal); たくさん for amount; いくつか after the object (むすびめを いくつか); 永遠に and 無限に, grand words, used here with an Inkweaver's flourish (the help says so).

#### Every modifier is a trade, never an upgrade

Reaching more makes each part lighter (すべて); fitting each target lasts only this round (それぞれ); doing more means one target only (全部, たくさん); lasting means it can be broken (永遠に); no limit means this round only (無限に). The phrase is also longer to write, so a modifier is used when it is worth it. If the curve test finds one modifier dominating anyway, the fallback is a breath: an extended response can't be extended again the very next round. The curve test, not the modifiers, keeps battles their length: groups in the new chapters are tuned with modifiers in hand, so a fight lasts about as many exchanges as before and the language work is never shortened.

#### Learned as growth, in the story and off the path

Robin: "You're a traveling Inkweaver, and still learning the ropes. It makes sense that your abilities improve."

- **Two growth moments, each a scene with weight, never a sudden reward:**
  - **Unravel reaches two (いくつか), Chapter 4.** After the city's crowded fights, where the player meets the limit of untying one creature while the others press in, someone whose craft is untangling shows the wider grip.
  - **Protect covers both (すべて), Chapter 7.** On the Keepers' Road, after a moment where a ward before one of you was not enough, the keepers' old practice teaches the ward that stands before everyone.
- **Taught by the story** in the other new chapters: それぞれ (Chapter 3, a city of people each wanting their own thing), あらゆる (Chapter 9, where every kind of word washes up), ごとに (Chapter 10, station by station), 全体 (Chapter 11, a valley that has to agree as a whole).
- **Found off the beaten path** (C-71): 全部, たくさん, 大半, 永遠に and 無限に come from people, notable creatures and secret encounters across the world, and the last two from the Trials. Nothing is missable: every source waits until found.
- **The overworld:** field puzzles can call for a modifier (light every lantern on a ridge at once with すべて; give each bridge its own name with それぞれ; leave an ice path standing with 永遠に). The wrong modifier on the right object gets the same plain physical feedback as today's field weaves. No required puzzle needs a modifier the player can't have yet.

**The Hush narrows reach.** A Hush or Hush-adjacent creature can silence the modifiers for a few rounds, shown like any silencing (E26): the player's words reach only one at a time until it ends.

**Tests.** Unit: each modifier's reach and effect on every response it pairs with; the validator checks every offered pairing has an authored, natural phrase with furigana. The curve test: battles with modifiers keep their length at every setting and chapter, no modifier dominates, and Unravel alone still wins. Browser: choose a modifier, a response and its option, write the phrase, and see the effect land on the right targets.

**Effort:** L (engine, battle panel, field rules, lessons and content, spread across Phases 3, 7 and 7b).

## 04 · Dungeons, expeditions and the Hall of a Hundred Tales

*Expansion plan, draft 3 (2026-10-07, after Robin's second round of answers). Planning only.*

Robin's direction, consolidated:

- **Scale.** Dungeons can be large, floor by floor, with exploration between staircases \[R2 §2\].
- **Resources.** They belong to places, have limited uses, may need backtracking, and are never collected into an inventory \[R2 §2, R2 §5\].
- **Persistence.** Harder dungeons may keep health and status between encounters \[R1\].
- **Failure.** Failing an ordinary dungeon restarts it from the beginning; special dungeons (the Trials) have their own checkpoint and retreat rules \[R2 §2\].
- **Fixed challenges.** A dungeon is fixed at generation, or authored. The player can preview its topic and scope before entering. Failure does not change it \[R2 §3\].
- **Required dungeons.** They can always be finished, with escalating companion help \[R2 §3\].
- **Suspend** exists only in the 100 Trials, and never from a battle \[H2\].

### What exists today (audit summary)

- **Story dungeons** are authored map sets with checkpoints. Defeat returns you to `s.checkpoint` with learning kept (`engine/90_game.js:372-379`).
- **Resolve is restored after every encounter** (`ui/80_combat.js:1429-1431`, "no attrition grinding"). Inns and the script `!heal` restore too.
- **The Unwritten Atlas** (postgame) is the existing generated expedition:
  - 8–9 rooms of 21×15 tiles, built from 14 hand-drawn patterns, with a camp and a road home.
  - Seeded per run and resumable after closing the browser, through autosaves on room transitions.
  - Its escorted lantern is the only health-like value that persists across rooms. It needed a MutationObserver hack to show its bar.
  - **It adapts during a run:** objective steps are chosen on first contact, and every encounter's pool adds the player's weakest items. **Robin (C-18): the Atlas stays the premier randomly generated dungeon.** Its shape is fixed per run; its practice words keep adapting (Robin confirmed, C-57).
  - **Robin's addition (C-57): more variety inside the fixed shape.** When a run is generated, each room also gets its own variation within its hand-drawn pattern: mirrored or rotated where the pattern allows, different obstacles and props, different decor, creatures standing in different places. All of it is chosen at the run's start, stored with the run, and never changes during it, so a run "feels a little different each time" without moving its goalposts (G7). A layout check proves every variant is walkable and its exits reachable.

---

### D1 · The expedition framework

**What and why.** One engine for every dungeon with expedition rules (persistent condition, stations, restart rules): authored side dungeons, Atlas commissions and the Hundred Tales. Story dungeons keep today's checkpoint model unless a chapter opts in.

**Approach.**

- **Expedition state** `s.expedition = {id, kind, seed, floor, entryState, condition, stations, mechanisms, foes, rules}`. It is saved with the campaign by the ordinary autosave on floor and room transitions, never during a battle. The Atlas run state is the precedent.
- **Floors are real maps**, authored or assembled from authored parts (Atlas-style). They may be large: 40×30 tiles or more, with loops, landmarks and optional chambers, as Robin wants.
- **Fixed at creation.** A generated expedition stores its seed *and* its chosen learning content at entry. It never changes what it asks after a mistake. A *new* expedition is a separate, deliberate choice.
- **Battle hook.** A proper engine hook for expedition values in battle replaces the Atlas's MutationObserver hack: the party's starting resolve, extra bars, and field conditions.

**Effort:** L.

---

### D2 · Persistent condition and stationed resources

**What and why.** Robin \[R1\]: "Where it would mean most is if your health and status persisted throughout harder dungeons." Two spec rules shape the design:

- mistake costs are "small, capped per exchange, and never compounded" (line 128);
- "Prevent resource softlocks" (line 216).

**Where (Robin, C-04, 2026-10-07): only in dungeons that specify it.** Persistent condition is a property a dungeon declares on its preview card, never a world-wide rule, and recovery never depends on walking back to inns (which would be tedious). Everywhere else, resolve resets after each encounter as today.

**Approach: carry over what tactics did, not what language mistakes cost.**

- **What carries over.** In an expedition with *persistent condition*, at the end of each encounter:
  - resolve is restored *only by the amount that language mistakes cost in that encounter*;
  - blows taken from telegraphed moves carry over, together with statuses (chill, wet, Heat on you).

  So learning mistakes never compound across a dungeon; tactical choices do. In Assisted mode mistakes already cost nothing.
- **Stationed resources (no inventory):**

  | Station | Effect | Uses | How it's earned |
  | --- | --- | --- | --- |
  | Rest bench / shrine step | +4 resolve each | 2 per expedition | present |
  | Spring | full resolve, clears statuses | 1 | present, or restored by fixing its pipe (a repair job, A15) |
  | Shelter | clears statuses; the companion talk point | unlimited, no healing | present |
  | Restored lamp | a new rest point where none was | 1 | repair a broken lamp: understanding the environment, as Robin asked |
  | A delver's aid | varies (D8) | once per meeting | chance |

- **Backtracking is a choice.** Going back to a spring is a route decision. Shortcuts opened from the far side (a ladder, a gate) cut the walk, as Astra suggests (D10).
- **No softlock.** Every floor's exit is always reachable, and the expedition can always be left. If condition runs out, defeat applies the expedition's rule (D3), which always gives a way forward.

**Pros.**

- Real attrition and planning.
- Learning mistakes stay cheap.
- The satchel stays free of potions.

**Cons.**

- Balancing needs a new curve test that plays whole expeditions.
- The "restore mistake costs" rule must be explained clearly in one sentence on the preview card.

**Effort:** M.

---

### D3 · Failure, retreat and suspend

| Situation | Ordinary side dungeon | Story dungeon | Atlas commission | Hall of a Hundred Tales |
| --- | --- | --- | --- | --- |
| **Close the browser / leave the game** | Resume from the last autosave: floor or room entry, never mid-battle (Robin's H2: "the regular autosave is enough") | Same | Same | **Suspend**: resume exactly where you stood outside battle (H2) |
| **Defeat in an encounter** | **The expedition restarts from its entrance** (Robin \[R2 §2\]); the temporary state resets coherently (D3a) | Back to the chapter's checkpoint, as today; companion help (E19) | The run ends with its consolation reward, as today | **The current floor restarts**; earlier floors stay done |
| **Choose to leave** | Leave; the next visit starts fresh | Leave freely, as today | "Head home" at camp, as today | **Earned reprieve:** return to the surface with exact state kept. **Emergency retreat:** the floor resets on return |

**D3a · What a restart resets** (Astra: never only the favourable or unfavourable half):

- **Resets:** creatures, stations' uses, mechanisms, the party's condition (to full), and temporary relics.
- **Kept:**
  - the learning record;
  - explanations discovered (Known details);
  - map knowledge (the auto-map stays revealed, an earned convenience);
  - Resolve-this-step eligibility for solved mechanisms (E11).

**Decided (Robin, C-03).** The full restart applies to *optional* dungeons, and their preview card says so. Story dungeons keep checkpoints, as spec line 128 asks, plus the declineable companion help (E19).

---

### D4 · The entrance preview

**What and why.** Robin \[R2 §3\]: "Players should be able to preview the content/scope of the dungeon before entering. If it's a dungeon focusing on conjugation and past-tense verbs, let them know."

**Approach: a preview card at every expedition's entrance.**

> **The Undercroft Locks** — side dungeon **Language:** directions and "who sends what to whom" (に・へ・を・から・まで). New: none. **Size:** 3 floors, about 25–40 minutes. **Rules:** condition carries between encounters (mistakes don't count against it) · 2 rest benches, 1 spring · defeat restarts the dungeon · ambushes: yes, announced. **Suggested for:** any profile; tasks follow yours.

- It names *what is practised*, never the solutions.
- Generated expeditions show their chosen content before entry, and that content stays fixed.

**Effort:** S.

---

### D5 · Story dungeons

- **Keep chapter checkpoints** (spec line 128).
- **Escalating, declineable companion help** after repeated defeat (E19).
- **New chapters' dungeons** (Undercroft, Understage, High Pass, Steam Vents, Root Hollows) use the expedition framework's *mechanisms and stations*, so they feel like the side dungeons. Each may opt in to persistent condition on Demanding only.

---

### D6 · Dungeon families: ten kinds of learning space

Astra's group D, which Robin rated "all solid". Each family is a *design pattern* that regions and the Hall reuse. None is a separate engine.

| # | Family | The idea | Where the plan uses it |
| --- | --- | --- | --- |
| A31 | **Apprenticeship dungeon** | Enter knowing everything but one central construction. A local task teaches it, the next rooms support it, the last combines it with old knowledge | The Understage (reference and omission); the Cloudroad's High Pass (hearsay) |
| A32 | **Transfer-remix chambers** | A known relationship in a different setting: workshop sequencing becomes a procession's order | Kotonoha (words in new places); Hall wing 3 |
| A33 | **Curriculum forks** | At a junction, choose directions, construction, optional listening, or a stretch topic. Both routes reach the same place and reward | Every Atlas commission; Hall wings |
| A34 | **Counterexample halls** | Similar instructions that differ in one feature; test them and see why one fails | Hall wing 6 (exceptions); the Mist Barrier |
| A35 | **Multi-format treasure** | A notice, a conversation, a diagram and a label each hold part of the answer | Manybridge's Lost Contract; Hall wing 8 |
| A36 | **Case-file dungeon** | One investigation across the whole dungeon; evidence changes the theory | The Cloudroad (the last courier); a postgame Atlas case commission |
| A37 | **Restored-return** | Come back after an area is fixed and use it differently | Kotonoha's deeper wing; Manybridge's Undercroft as a working dock postgame |
| A38 | **Playable short-story rooms** | Step into an illustrated tale and carry out or reconstruct it; reading for its own sake, optional questions after | Hall of a Hundred Tales (each wing opens with one); Steamhollow's footbath poet |
| A39 | **Explain it to a partner** | The companion proposes two plausible plans; you explain which condition supports yours | Throughout: a recurring companion beat in dungeons |
| A12 | **Information-gap rooms** | You and your companion see different halves of a mechanism; exchange descriptions | Root Hollows; Understage; Hall wing 2 |

Each family gets an authoring template (S5), a worked example at all four profiles, and one test pattern.

---

### D7 · Atlas commissions: themed, reactive and mapping expeditions

**What and why.**

- Robin \[R1\]: "Totally optional, reactive dungeons that scale in size and content with your weaker skills… a truly great idea." Clarified \[R2 §3\]: chosen and fixed before entry; size chosen, not grown after mistakes.
- Mapping dungeons as optional, self-contained activities with an achievement and their own worthwhile rewards \[R1\].
- Astra A40: themed commissions on the existing generator.

**Approach.** Extend the Unwritten Atlas, rather than build a second generator.

- **The commission board** in the Lantern Hall (where the Atlas begins) offers three kinds:

  | Kind | What it is | Chosen before entry |
  | --- | --- | --- |
  | **Practice commissions** (reactive) | Built around the player's *weaker* items and skills, from the evidence log (L1): "past-tense verbs", "the kanji you've met in Manybridge", "requests and refusals" | The topic, the length (short / standard / long, Robin's "scale in size", *chosen* by the player) and the content, fixed at that moment |
  | **Themed commissions** | Authored objectives (Astra A40): recover a route, resolve conflicting instructions, introduce a named grammar family | Topic and length |
  | **Survey commissions** (mapping) | The Cartographer's work: an incomplete route description and an auto-drawn map; annotate verified landmarks, safe passages and conditions, never redraw corridors (A13) | A survey area |

- **Built as Atlas runs** (Robin, C-18: the Atlas stays the premier generated dungeon). Each commission is an Atlas run type: the commission sets the topic, length and shape when the player accepts it, and the run keeps that shape. Within it, the Atlas keeps choosing practice words from the player's weakest items as it does today (C-57, confirmed).
- **Survey rewards** (Robin: worthwhile without defeating the purpose):
  - each survey adds a page to the **Cartographer's Atlas**, a map collection in the travel volume;
  - surveyed routes become Atlas shortcuts;
  - completing every survey is an achievement with its own stamp and a cosmetic (the cartographer's compass).

**Effort:** L.

---

### D8 · Delvers: familiar faces in the depths

**What and why.** Robin \[R1\]:

- Recurring NPCs can delve alongside the player, met "via exploration or pure chance — not a guaranteed encounter".
- If you can recall key moments with them, answer their questions, or impress them with a joke they'd appreciate, you're rewarded better.
- "Finding them at all should be a clear aide."

**Approach.**

- **A delver** is a known NPC with a short expedition presence: they appear in a side chamber, on a seeded chance per floor (S2), at most once per expedition.
- **Meeting them always helps.** They give one benefit: a rest, a shortcut opened, a field condition removed, or their help as a guest in the next encounter (E1).
- **The bonus.** A short memory conversation:
  - "Do you remember what I said at the ferry?";
  - Suzu wants a punchline;
  - Nao wants to know which road you took.

  Answering from what you experienced (Known details and the dialogue history are allowed: it is *your* memory, not a test) improves the benefit.
- **Fairness.** A wrong answer never removes the base benefit. Astra: the dungeon's viability never depends on meeting them.
- **Cast:** about twelve NPCs across the existing and new regions, with sealed note S7 for later-chapter people.

**Effort:** M.

---

### D9 · The Hall of a Hundred Tales (百物語の館)

**Robin's concept** \[R0, R1, R2\]:

- An optional superdungeon testing everything learned.
- It can push to the next tier by the end, offered and never forced.
- Steeped in folklore, "a place where only the most dedicated and studied inkweavers may prevail", with Tsuru and others knowing of it.
- Consistent checkpoints; returning to the surface with exact floor state after an earned reprieve; restarting the floor if you leave another way.
- Persistent condition and limited stationed resources; delvers.
- Each chapter's reward is a full-page painterly illustration, revealable by confirmation for those who won't finish.
- Suspend only here \[H2\].

#### Lore

- **The custom.** 百物語怪談会 is a real Edo-period gathering: a hundred lights, a hundred strange tales, one light put out after each. Legend held that something appeared after the hundredth.
- **The keepers' version, fiction built on it.** The old lantern-keepers' order kept a hall where apprentices *relit* a hundred lanterns, one per tale understood. The hall was abandoned generations ago.
- **Seeding the rumour.**
  - Tsuru mentions it in passing: "My teacher's teacher sat the Hundred. Nobody finishes it any more." This must fit her canon voice.
  - Manybridge's oldest play is about it; a Cloudroad pilgrim is looking for it; Kotonoha's keepers hold its missing tale.
  - Each new region adds one telling (folklore with multiple tellers, A49).
- **Access.** Postgame: Tsuru gives the player the hall's key ledger after the story.

#### Structure

**Ten wings of ten tales.** Each wing is one story-world inside a lantern's light, with its own map identity, music and language theme. Astra's ten themes are kept and given tales:

| Wing | Tale | Language theme | Folklore source (label in-game) |
| --- | --- | --- | --- |
| 1 | **The Lamp at the Crossroads** | Finding the way: directions, signs, asking for clarification | Invented |
| 2 | **The Fox's Wedding** | Who does what: a procession carrying gifts from whom to whom (particles) | Real image: 狐の嫁入り, a "fox's wedding" in sun-showers |
| 3 | **The Bell Before Dawn** | Sequence and timing | Invented |
| 4 | **The Borrowed Umbrella** | Requests, permission, intention, misunderstanding | Invented, in the style of real folktales |
| 5 | **The Two Wells** | Reasons and contrasts | Invented |
| 6 | **The Toll That Changed** | Conditions and exceptions | Invented |
| 7 | **The House That Remembers** | What was left unsaid: omission, reference | Real legend: マヨイガ, the "wandering house" of Tōno folklore |
| 8 | **Three Witnesses at the Inn** | Whose account? Reports, evidence, uncertainty | Invented |
| 9 | **The Crane's Return** | To whom are you speaking? Register and relationship | Real folktale: 鶴の恩返し (and, quietly, Tsuru's own name) |
| 10 | **The Hundredth Tale** | The unwritten journey: a capstone mixing everything | The player's own journey, told back |

- **A wing's ten trials** mix types. A typical wing:
  - an opening short-story room (A38);
  - three exploration and mechanism trials;
  - two encounters (one with conditions, one social);
  - a counterexample hall (A34);
  - an information-gap room with the companion (A12);
  - a delver chance;
  - a capstone procedure or boss.
- **Floors** are large authored maps with variable sections. A wing is 3–4 floors. The ten tales are authored; the variations inside them (which room order, which version of a puzzle, which items practised) come from controlled patterns fixed when the wing is entered.
- **Hearths** at each wing's start are its checkpoints. Reaching a hearth relights its lantern permanently.

#### Rules (from Robin)

| Rule | Detail |
| --- | --- |
| Persistent condition | Across a wing (D2). Mistake costs never carry |
| Stationed resources | Per floor: one bench (2 uses), a spring every other floor, shelters; restored lamps |
| Earned reprieve | Some trials (a riddle, a puzzle, a unique encounter) grant a **reprieve**: return to the surface with the exact floor state kept, as Robin specified |
| Emergency retreat | Leave at any time outside battle. The current floor resets on return; earlier floors and wings stay done |
| Defeat | The current floor restarts; nothing earlier is lost |
| Suspend | Close the game anywhere outside battle and resume exactly there. Stored as a per-slot recovery-style record, removed with the slot, never a seventh save (spec lines 224, 228) |
| Delvers | D8, rarer and stronger here |

#### Three choices per wing (Astra's separation, kept)

1. **Language profile**: the campaign's, as always.
2. **Route: Consolidate or Grow** (L18).
   - *Consolidate* applies what you have.
   - *Grow* introduces two or three stated next-tier constructions, teaches them in the wing's first trials, and revisits them throughout. It never changes the global profile. For Advanced players, Grow means nuance, genres and conflicting perspectives, never an invented "native" tier.
3. **Tactical challenge**: Relaxed, Standard or Demanding for the wing's encounters.

All three are shown on the wing's preview card (D4) and can change at a hearth.

#### Rewards

- **Each wing:** a lantern relit; a stamp (K1); a painted, animated **travel-volume illustration** of its tale with the party in it (K2); a companion reflection.
- **All ten:** the Hundredth Tale's illustration, the player's journey, animated (the strongest "I can do more than when I started" moment); a commemorative cosmetic; a final conversation with Tsuru.
- **Revealing without finishing** \[R2 §6, H1\]: any wing's illustration can be revealed by confirmation from the gallery. That marks it *viewable*, never *witnessed* or *completed*.
- **Records.** An optional, truthful note per wing: route, tactical setting, and how much answer-supplying help was used, using L2's categories. It is never a gate.

#### What it must not be (Astra's "Bad" list, kept)

- Not one hundred mandatory battles.
- Not restarting from room one.
- Not withholding help.
- Not escalating after mistakes.
- Not a final collectible behind a perfect run.

#### Building it

Start with **one wing** (wing 1, or wing 2 for its particle routing), complete and polished, before committing to all ten. Astra proposed this, and it fits Robin's "time is no issue", because it is about discovering whether the format is fun, not saving effort.

**Effort:** XL (ten wings, about 100 trials).

---

### D10 · Shortcuts and walking

- Spec line 56 forbids "excessive walking" and "repeated corridors". Robin wants backtracking for resources to be meaningful. The compromise:
  - every large floor has at least one **shortcut opened from the far side**;
  - stations sit near junctions;
  - the auto-map marks stations with their remaining uses.
- **Fast travel between hearths** in the Hall, after each is reached.

## 05 · Language: evidence, mastery and Japanese as a tool

*Expansion plan, draft 7 (2026-10-08, after Robin's fifth round of answers). Planning only.*

Two halves:

- **L1–L6, the learning record:** what the game knows about a player's Japanese, and how it shows it.
- **L7–L20, language play:** new ways to *use* Japanese, which Astra's group A and Robin's review rated highest.

### What exists today (audit summary)

The learning record is simpler than the plans assume, and a few existing behaviours are defects worth fixing whatever is decided.

- **Item kinds:** kana (`k:`), vocabulary (`v:`), grammar (`g:`), comprehension (`c:`). **There is no kanji kind, no construction kind and no listening kind** (`learn/10_mastery.js`). Kanji exist only as a derived "met" set.
- **One assisted boolean per answer.** The record stores no help *type*, no stroke retries, and not whether kanji or kana was written.
- **Mode tallies:** choice, recall (typed) and hand (handwritten). They count every attempt, including wrong ones.
- **Ordering answers are recorded as `choice`**, so sentence construction looks like recognition (`ui/65_challenge.js:413`). Ordering can only be arranged, never typed or handwritten.
- **Promotion beyond box 2 is weaker than its comment says.** One typed or handwritten attempt *ever*, even a wrong one, satisfies the "varied" condition for good.
- **Defects found in passing:**
  - **Foundations copy steps** show the answer yet are recorded as clean handwriting.
  - **Story activities' Translate** sets `assisted` and never resets it between customers or letters (`ui/75_activities.js:51,120`).
  - **Words › Grammar met always shows its empty message.** It reads `RB.grammar.points`, which doesn't exist (`ui/50_menu.js:439-443`). The lantern activity's `labelOf` has the same bug.
- **Intervals are counted in learning events**, never days.
- **Measured share of authored steps:** 68% choose, 25% write, 7.3% order. **English-intention construction is 24 steps: 2.3%.**
- **Listening:** the device's local Japanese voice reads dialogue, word help and lessons. **No task uses audio.** The spec: "Never require hearing" and "Do not claim… listening validation based solely on synthetic speech" (lines 218, 280).
- **The richest construction system already built** is the post-story villagers' letters: 220 reply families and 3,167 accepted writings, including every allowed order, answerable by pieces, typing or handwriting (docs/practice/suite_b.md).

---

### L1 · An evidence log that records what was actually shown

**What and why.** Robin \[R1\]: track words, kanji and kana adequately: "how often you get assisted, need to redo strokes, etc." Astra: keep recognition, understanding in context, construction, typed and handwritten production, listening, assisted practice and transfer distinct; "None needs to be treated as morally superior."

**Approach.**

- **New item kind `j:` for kanji**, with readings tracked separately. Seeing 水 in みず does not certify すい.
- **New evidence modes:**

  | Mode | Records |
  | --- | --- |
  | `recog` | choosing among options (existing) |
  | `context` | understanding a sentence or passage in a situation |
  | `construct` | ordering or forging a sentence (new; today recorded as choice) |
  | `typed` | typed production |
  | `hand` | handwritten production; kana or kanji noted |
  | `listen` | understanding spoken input, device voice, optional |
  | `transfer` | the item used in a materially different context type from its earlier successes |

- **A short attempt log per item** (the last 12 attempts): `{mode, contextType, helpCategory (L2), firstTry, recognitionRepairs, strokeRetries, exposed}`. Fishing's `recentAttempts` is the precedent.
- **Input statistics kept apart from language accuracy.** Stroke retries and recognition repairs are *input* data, shown separately and never counted as mistakes. Robin asked for them to be tracked; Astra warned that "someone struggling with the input surface could appear to know less Japanese than they actually do."
- **Encountering versus using.** Reading a label twenty times ("met") stays separate from applying a word successfully in twenty contexts.
- **The defects above were fixed on 2026-10-07** (Robin asked; C-35 left the judgement to me): copy steps record as guided practice; the activity Translate flag resets per customer or letter; the promotion rule's "varied" needs a clean typed or handwritten answer in the current run; the Grammar page reads `RB.grammar.get`. What remains for this work: ordering recorded as `construct`, and copy steps recorded as `exposed` in the new log.
- **Migration.** Additive: older items gain empty logs. Nothing is invented: past attempts stay summarised in their tallies.

**Pros.** Every later feature (stars, word pages, the portfolio, reactive commissions) depends on honest evidence.

**Cons.**

- Save size grows: 12 compact attempts × about 1,000 items is about 150–250 KiB, acceptable.
- Promotions after the 2026-10-07 fix are slower for items answered only by choice, by design; nothing already earned was lowered ([11_CONTRADICTIONS.md](#f11) C-35).

**Effort:** L.

---

### L2 · What help supplied: the assistance categories

**What and why.** Robin \[R2 §4\]: assess every assist system; weigh heavier when someone is consistently assisted or fishing for answers. Robin's later first version \[H4\]: a star when fewer than 30% of an exam's questions were assisted. Robin noted that choosing a recognizer candidate other than the first currently counts as assisted, which "would need ironing out first." **Robin settled it on 2026-10-07 (C-14):** the pad shows one guess, redrawing is free, and asking for more suggestions counts as assisted.

**Approach: categorise every help by what it supplies, relative to the skill being assessed.**

| Help (all that exist today) | Category | Counts as "assisted" for a star? |
| --- | --- | --- |
| Text size, contrast, reduced motion, control guidance, word spacing | Access | **No** |
| Furigana (always shown; there is no toggle, by rule) | Access, except in a reading-recall question, where it would supply the answer, so such questions never show the kanji at all | **No** |
| Pad: same-shape twin (ロ/口) | Input | **No** (already exempt) |
| Pad: redrawing a character before confirming | Input | **No** (C-14) |
| Pad: **"Show more suggestions"**, then any of the recognizer's other readings | Answer-constraining | **Yes** (C-14). The button says so, as Translate does |
| Pad: chart pick, "How to write" model | Answer-constraining or supplied, for that character | Yes |
| Word help or lookup inside the question | Conceptual, or answer-constraining when it defines the asked word | Yes, if it covers a word in the answer |
| Translate (English line) | Conceptual (comprehension tasks: answer-constraining) | Yes for comprehension; no for a production task whose English is the prompt anyway |
| "I don't know": answer shown | Answer supplied | Yes |
| Companion highlights a suitable response (E19) | Answer supplied | Yes |
| Battle tactical help (what a move does) | Tactical, not language | **No** |

- **Repeated opening of the same help doesn't pile up.** The question is *what* was supplied, not how often it was looked at (Astra).
- **Several mild hints that together reveal the answer** count as answer-constraining (authored per task family).
- **Where it's recorded:** each attempt's `helpCategory` in L1's log; the strongest help per question for exams.

**Effort:** M (classification and wiring).

---

### L3 · Mastery exams and stars

**What and why.**

- Robin \[R1\]: optional handwriting and comprehension mastery tests over *groups* of words, kanji or kana; small gold stars that are "inconsequential"; "a reinforcement of the why you learn the way you do"; hints allowed, but no star "if you were overly assisted."
- \[H4\]: **separate stars per input type** (handwriting, multiple choice, typed, listening); first version: a star when **fewer than 30% of the exam's questions were assisted**; weighted measures later.

**Approach.**

- **Groups** come from the content:
  - kana rows;
  - kanji by theme or by region met;
  - vocabulary by region;
  - grammar families (for example "requests", "conditions").

  Each group lists its items. A group is offered once the player has met most of it.
- **An exam** is about 10–15 fresh questions over the group, in **one chosen input type**. Hints stay available (Robin). The exam records each question's strongest help (L2).
- **The star.** Awarded per input type when **fewer than 30% of questions** used help in a counting category. That is Robin's rule; L2 defines "counting".
  - The four stars sit side by side, none above the others. A choice star is as bright as a handwriting star.
  - **A "completed with help" mark** records the attempt honestly without a star (Astra: "demonstrated independently / completed with support / needs another opportunity").
- **Retakes** revisit only the questions that were assisted, not the whole exam (Astra).
- **No fishing for answers** (Robin, C-41: help should feel good, but an obvious path to fishing must be closed; undoing a move isn't help when nothing prompted it; hiding suggestions up front helps a lot):
  - **The first committed answer is the one that counts.** A wrong first answer can be retried for learning, but that question doesn't count towards the star, so trying every option gains nothing.
  - **Nothing is suggested up front:** the pad shows one guess (C-14); choices appear only in a choice exam; hints are a button away and recorded when opened.
  - **Undo is free:** taking back a tile, clearing a stroke or redrawing before committing is never help, because nothing was shown that prompted it.
  - **Order and options are shuffled** per attempt, so a retake can't be answered by position.
- **Listening star.** Offered only where the device has a local Japanese voice. Labelled "Listening practice with your device's voice", never "validated listening" (spec line 280). Absent, not "missing", on devices without one.
- **Flair, just for you** (Robin, C-13: "just UI flair, not a real reward… it's just for you to feel good about learning and grasping the language"). Stars unlock nothing: no item, no route, no illustration, no Bond, no stamp. The Mastery page says so in plain words: "These stars are just for you: a way to see what you've grasped. They don't unlock anything." That is what makes them compatible with the "no handwriting-only or no-help-only reward" contract, with a one-line amendment saying so.
- **Home:** Words › a new "Mastery" page listing groups, stars and "next suggested".

**Effort:** M (on L1, L2).

---

### L4 · Word, kanji and kana pages

**What and why.** Astra's "useful word page", supported by Robin's review: an evidence profile, not a single percentage; denominators shown; "not practised" never red.

**Approach.** Every noted word, every met kanji and every kana gets a page:

> **水 (みず)** — water **Recognised:** 8 of the last 10 times asked · **Used in a sentence:** 3 different situations **Typed:** 2 · **Handwritten:** not practised · **Reading すい:** met once, not asked **Last seen:** a delivery notice (Manybridge), a battle (Saltglass) **Try next:** explain a route to someone (a Kotonoha leaf) →

- Uncertainty labels ("limited evidence").
- No red failure states.
- A "Hear it" button where a voice exists.

**Effort:** M.

---

### L5 · "Things I Can Do" (A58)

**What and why.** Astra rated it Umazing; Robin accepted group F apart from #60. It turns evidence into *abilities*: interpret directions, ask for clarification, refuse politely, report what you heard. Each points to the moments that show it and suggests what to try next.

**Approach.**

- **About 60 can-do statements**, grouped as the Hall's ten themes are, written in plain English with a Japanese title.
- **Each statement lists its evidence:** tasks of the right kind, done in different contexts (transfer), with the help categories noted honestly.
- **Inspired by "can-do" descriptions in Japanese teaching** (the Japan Foundation's approach, named as inspiration only). **Never a certification**, never a JLPT level (spec line 170).
- **Home:** Words › "What I can do", beside Mastery.

**Effort:** M.

---

### L6 · Spacing that notices days, without pressure

**What and why.** Astra: an interval counted in events inside one long evening is not the same as remembering something next week; spacing research supports taking time into account, but "it does not require overdue warnings or login obligations."

**Contradiction.** The practice core's stance is "nothing reads the wall clock" (`engine/08_practice.js:21`). That was written against clocks and streaks, not against spacing. Reading the date to *space reviews* creates no pressure. **Proposal:** record the day of each attempt; let "due" consider both events and days; **never show overdue counts or streaks** ([11_CONTRADICTIONS.md](#f11) C-36).

**Effort:** S.

---

### L7 · Sentence forging: say what you need

**What and why.**

- Robin \[R0\]: "questions that are asked in English and ask to be ordered correctly in Japanese more often."
- Astra rated it the strongest addition (A1): from "recognise the answer" towards "say what you need".
- Robin \[R1\]: grow it in new content; don't shoehorn it into old.

**Approach.**

- **Intention first.** The prompt is a goal: "Ask the keeper to leave the side gate open until evening." It is sometimes in English, sometimes a picture or a situation (L8), sometimes Japanese ("tell her this more simply", L13).
- **A support ladder**, which the player picks and can change mid-task, as input modes switch today:

  | Rung | The player… | Records as |
  | --- | --- | --- |
  | 1 | chooses among complete sentences | `recog` (construction-adjacent) |
  | 2 | arranges meaningful chunks | `construct` |
  | 3 | arranges chunks and picks particles and verb endings in slots | `construct` |
  | 4 | types or handwrites within a bounded answer space | `typed` / `hand` + `construct` |

- **Authored alternatives are accepted** (spec line 138: correct "for its context, not merely match a hard-coded preferred string"). The judge generalises the letters' reply families: alternative orders, interchangeable particles where meaning holds (に/へ for destination), politeness variants where both fit. Where one construction is being *practised*, the task says so explicitly.
- **The result changes the scene:** the keeper opens the gate; the barge goes where you sent it.
- **Validator:** checks every listed alternative (S5) and that a non-handwriting route exists (spec line 132).
- **Target in new content:** about one in four or five language interactions *where construction genuinely fits* (Astra's starting value, to be measured). Today's share of English-intention construction is 2.3%.

**Effort:** L.

---

### L8–L17 · Language-as-a-tool task families

Each family becomes an authoring template with all four tiers, a judge and a recording rule. Where the plan uses each:

| # | Family | What the player does | Used in |
| --- | --- | --- | --- |
| L8 (A2) | **Scene to sentence** | Look at a small situation (which parcel moved, who stayed) and describe the change that matters, with pictures and optional English | Manybridge deliveries; Hall wing 2 |
| L9 (A3) | **Particle routing** | Send letters, goods or gifts by saying who gives what to whom; the result is visible | Manybridge barges; the Fox's Wedding |
| L10 (A4) | **Verb-transforming devices** | An authored magical device needs an instruction: action, prohibition, preparation, completed state. Transform a known verb to fit. Labelled as a game device, not as how Japanese works | The Understage; the Steam Vents |
| L11 (A5) | **Reference detective** | Work out what "that one", an omitted subject or an earlier mention refers to | The Understage prompt-book; Hall wing 7 |
| L12 (A6) | **Asking back** | Ask someone to repeat, simplify, slow down or confirm; they rephrase with an authored simpler version. Asking well is success, never a failure flag | **Every new region's conversations**: a "Clarify" option on hard lines |
| L13 (A7) | **Paraphrase bridges** | Explain a complicated notice in simpler Japanese, keeping its condition | Steamhollow's house rules; the new settlement's notices |
| L14 (A8) | **Evidence reporting** | Report what you saw, heard or suspect, with the right certainty (そうだ・らしい・ようだ) | The Cloudroad relay; Hall wing 8 |
| L15 (A10) | **Comic and dialogue reconstruction** | Rebuild an illustrated exchange from speech bubbles and speakers; several grammatical versions tell different stories | Kotonoha shells; the theatre's scrambled script |
| L16 (A9) | **Sound-and-meaning workshops** | Compare short spoken pairs and use the difference. **Optional**, the device voice only, always a text route, no validation claims | A small optional room in Kotonoha; Distractions |
| L17 (A39) | **Explain it to a partner** | Justify a plan to your companion with evidence | Dungeons (D6) |
| L17b (Robin, C-70) | **Modifier phrases** | Extend a response with a quantity word and write the short sentence it makes (「すべてを守る」, 「光がすべてを照らす」): すべて/全部/あらゆる/全体, それぞれ/ごとに, 大半/たくさん/いくつか, 永遠に/無限に, with が and で chosen by what is natural for each word. Overlaps in everyday Japanese are explained honestly | Battles and field puzzles everywhere, from Chapter 3 ([03_ENCOUNTERS.md](#f03) E27) |

**Effort:** L (all families); each region uses a subset.

---

### L18 · Growth offered, never imposed: the Grow route

**What and why.**

- Robin \[R0\]: push "a tier higher by the end to push growth".
- \[R1\]: "Growth via challenge should 100% be offered… never forced… nudge new, unfamiliar experiences into their path… Backing out should never be punished."

**Approach.**

- **Stretch content** is tagged with the next tier (E for an F player, and so on). It appears as:
  - *offered* side tasks in regions ("This one uses a form you haven't learned yet. It will teach it. Try it?");
  - the Grow route in the Hall and in commissions.
- **Always taught before it is relied on** (spec line 176). It is recorded as stretch evidence and never changes the global profile.
- **Engineering.** Thread a profile override through `stepsOf`, `itemPool` and `vocabStep`. The seams already exist in the Atlas (`objectiveSteps(P)`), `drillPool(lv)` and letters' `tier(prof)`.
- **For Advanced:** stretch means nuance, genres and conflicting perspectives (spec line 168: "approaching N2/N1 style… paraphrase"), never an invented tier above A.
- **Declining or backing out** returns the player to where they were, with no record of "giving up".

**Effort:** M.

---

### L19 · Measuring what players actually meet

- **Instrument the F/Ren sweep** to count the language interactions a playthrough really meets, by kind, per chapter.
- This answers Robin's first question \[R0\] ("I'm not sure if it already happens frequently enough") with data. Today only authored counts exist.

**Effort:** S.

---

### L20 · The kanji record and the chart

- **The kanji chart's practice square records nothing today.** Add optional recording as handwriting practice (`exposed` when tracing, `hand` when from memory).
- **Reading-recall questions never show the kanji they ask about**, so furigana (always on, by rule) never gives the answer away. They ask from meaning or context instead.

**Effort:** S.

## 06 · The world: living towns, roads, return trips and the sea

*Expansion plan, draft 7 (2026-10-08, after Robin's fifth round of answers). Planning only.*

### What exists today (audit summary)

- **Shape.** The world is one chain of regions, each opened by the previous chapter's flag:
  - Reedwake → Saltglass → Cinder Orchard → Snowbell → Lanternfall → the Archive;
  - the side area Koharuno;
  - 91 authored maps.
- **Fast travel** lists five town hubs (`content/00_world.js:63-68`). **Defect:** the route chart draws a Cinder–Lanternfall road that cannot be walked.
- **NPCs are placed by flags.** One person may have several map entries with exclusive conditions; they walk to and from exits when flags change (`engine/50_world.js`). There are **no schedules or routines**, and "where someone was last seen" is kept only for the session.
- **There is no day or night cycle.** Night is set per map by story flags (`rw_night`, `sg_evening`, `sb_evening`) or scene presets. Nothing reads the clock.
- **No "where is X?" system exists.** The quest guide (gold diamond, edge arrows, chart mark) computes the next step.
- **Boats are scene props.** A choice, an illustrated sequence and a warp. There is no vehicle, sea map or sailing.
- **Later content only adds to earlier maps** (`talkFirst`, `addNpcs`, `addProps`); it never rewrites a scene (docs/CONTENT.md §10).

---

### W1 · Evolving communities

**What and why.** Robin: "truly Umazing" \[R1\]. After wider story beats, old towns are reshaped, NPCs have new dialogue and activities, and revisits offer more than first conversations. Astra: make revisits meaningful without making a missed conversation feel like lost content.

**Approach.**

- **Change beats per town.** Every town gets 2–4 *change beats* across the whole game, not just a post-story state. A beat is a bundle:
  - map edits (a new stall, a repaired bridge, a printed notice board);
  - new or moved NPCs;
  - new dialogue;
  - a new small activity or quest;
  - an optional letter announcing it.

  Each is triggered by a story flag elsewhere: "after Manybridge's festival, Saltglass's quay has city traders."
- **The S1 phase table** names the beats, so content reads `if: 'phase>=mid'`.
- **"What's new" is gentle.** The Journey shows a one-line hint per changed town ("Saltglass has changed since you last visited"). It never lists the changes. It can be turned off.
- **Nothing is missable.** A beat's content stays until seen. Later beats add to it, never replace it. A changed NPC still offers the old topic through "Talk about…".
- **Each new region's own after-states** are in [07_REGIONS.md](#f07). Existing towns gain beats from the new chapters:
  - **Reedwake:** a printed notice board from Manybridge; later, a ferry timetable that includes Kotonoha.
  - **Saltglass:** Ōmi's courier boat in the harbour; city traders; Fuku's bench; sea-trial gossip.
  - **Existing later towns:** beats in sealed note S8.

**Pros.** Directly Robin's favourite system; uses existing map and flag machinery.

**Cons.**

- Authoring volume across every town.
- Testing every beat at every chapter: phase fixtures, S7.

**Effort:** L (content-heavy).

---

### W2 · NPC routines

**What and why.** Robin \[R1\]: a variable routine system where, after a region's events, residents shift what they do and where they go, triggered by story beats, by defeating something outside the map and returning, or by walking far enough (2–3 or more screens away) that time seems to have passed. A day/night system was floated. Astra: coherent routines; don't relocate arbitrarily; never reshuffle as the player approaches.

**Approach.**

- **Routine slots.** Each routine NPC has 2–4 *slots*, each a place plus an activity: "at the stall, selling"; "on the quay, checking deliveries"; "at the teahouse, chatting with Hana". Slots are ordinary map entries with exclusive conditions on a per-town routine counter, so the "one person, one place" rule holds.
- **The routine tick** advances a town's counter (seeded choice of each NPC's next slot, S2) when any of these happens:
  - the player has been **at least three map transitions away** and comes back;
  - a story flag the town cares about is set;
  - the party rests at an inn.

  **Never** while the player is on that town's maps, and never mid-conversation.
- **Pinned while needed.** A person whose quest step is active stays put, or keeps a stated slot until the step resolves.
- **Existing walk-in and walk-out movement** already makes changes look natural.

**Pros.** Life and variety with no clock. Robin's own trigger idea.

**Cons.** People can be harder to find, which W3 answers.

**Effort:** M (engine), plus content per NPC.

---

### W3 · "Have you seen…?": finding people naturally

**What and why.** Robin \[R2 §5\]: ask nearby people whether they've seen someone; not everyone knows; some aren't friendly; walking around shouldn't be too hard; the gold diamond helps; "a combination of search-support systems can make this go far."

**Approach.**

- **A "Have you seen…?" topic** on talkable townsfolk (not every NPC), offering the people the player knows. The answer comes from the world, and is one of four kinds, kept distinct as Astra suggested:

  | Answer kind | When | Example |
  | --- | --- | --- |
  | **Current sighting** | The target is on this or an adjacent map now (computed with the existing `mapsWith`) | 「さっき、工房に入っていきましたよ。」 |
  | **Usual routine** | The speaker *knows* the target: authored relations (family, colleagues, neighbours) | "She's usually on the quay after deliveries." |
  | **Uncertain recollection** | A loose acquaintance | "I think he mentioned the upper gate…" |
  | **Refusal / doesn't know** | Unfriendly or a stranger | "Why should I tell you?" |

- **Clues in the world:** a closed stall's sign (「休憩中。港にいます。」, a tiny document mission); a tool left at a workbench; a colleague.
- **Notes, not live trackers.** Answers go into Known details as *notes* ("usually on the quay", unverified), never a live marker. The gold-diamond guide stays the explicit, optional navigation aid.
- **Save "last seen by you".** `W.seenOn` is kept only for the session today; storing it gives the player a truthful "you last saw her at the teahouse."

**Pros.** Language use (asking, understanding answers) with a real purpose; natural.

**Cons.** Writing the relations table per town.

**Effort:** M.

---

### W4 · Day and night: evaluated, not recommended first

**Options:**

| Option | What it is | Pros | Cons |
| --- | --- | --- | --- |
| **A. None (routines by ticks, W2)** | Today's flag-set night stays | No content multiplication; no clock | Towns never change light by themselves |
| **B. Rest-advanced phases** | Resting moves a town through morning, day, evening and night; ambient light and routines follow | Atmosphere; evening strolls in Steamhollow and Manybridge | Every town needs 4 lighting states and 4 sets of placements. The "night leak" test must change. Story scenes must pin a phase. Large |
| **C. Real clock** |  |  | Excluded: wall clock, pressure, missable events |

**Recommendation.** **A** now. Use **B only inside new regions** where it carries the experience: Manybridge's festival night, Steamhollow's evening yukata walk. These are *story-set* phases using the existing `alt` mechanism, not a global cycle. Revisit B after Robin's playthrough.

---

### W5 · Road events

**What and why.** Robin \[R1\]: between regions, an event that always happens the first time you enter a road, seems urgent, and can always be solved there with what you have. Ignoring it or leaving lets it disappear for a while. Once solved, repeatable variants can turn up at random, keeping the lesson. \[R2 §5\]: no renewable resource rewards. Astra: the unique event must stay available until it is resolved.

**Approach.**

- **Every road** (the six existing and the four new) gets:
  - **one unique first-arrival event**, a small self-contained scene with a stated problem:
    - a stranded traveller who speaks only one dialect;
    - a cart with a broken wheel and a repair card;
    - a lost child who knows only landmarks;
    - a toppled waystone;
    - a procession that has lost its order;
  - **a pool of 3–4 variants** that appear afterwards on a seeded chance (S2) of about one visit in five.
- **Looks urgent, has no clock.** Reading takes as long as it takes.
- **Leaving defers it.** The event withdraws and **re-offers itself on the next eligible visit**, recorded as "unfinished" in the Journey. The unique version is never lost to a generic one.
- **Rewards:** a scene, a Known detail, a keepsake for some, and a stamp for solving all of a road's events. Never consumables.
- **Existing roads:** the events trigger on the *next* eligible entry in older saves (content adds, never rewrites).

**Effort:** M (system), plus about 50 small events.

---

### W6 · New abilities reopen old places ("return keys")

**What and why.** Robin \[R1\]: "New abilities or words could be brought backwards to previous regions to help resolve new/old sidequests, access other hidden areas that require a resolution with a newer mechanic first."

**Approach.**

- **New inkweaving words in new chapters**: ordinary Japanese words with their ordinary meanings, as the content rules require; only the effect is fiction. Candidates:

  | Word | Meaning | Its effect (proposed) |
  | --- | --- | --- |
  | はし (橋) | bridge | Spans a gap. In battle, extends your ward to a guest or object. On the map, crosses gaps |
  | すみ (墨) | ink | Restores faded or blanked writing for a while. Battle: stains paper creatures, softening their blows |
  | みち (道) | way, road | Reveals a path in fog. Battle: guides a lost guest or neutral to safety |
  | ゆ (湯) | hot water | Thaws; restores a little resolve; on flame spirits makes steam |

- **Sealed spots in old regions.** About 3 per region, each needing a later word or mechanic: a fog-hidden path, a faded mural, a gap across a river. They lead to hidden rooms, Roadside Keepsakes, old side-quest endings or road shortcuts.
- **They are visible from the start**, with an in-world hint ("The ink here has faded beyond reading"), so returning is a remembered promise, not a hunt.
- **Hints:** the Known details page lists the sealed spots the player has noticed.

**Effort:** M.

---

### W7 · The Harbourmaster's long quest and sailing

**What and why.** Robin \[R1\]: after Chapter 2, a deal with the Harbourmaster begins a long quest reaching into the later chapters. Its reward is a boat and a sailing activity, with:

- a travel log;
- random events;
- direct, manual interaction with the ship;
- learning about the sea;
- no way to fail travel;
- optional skipping;
- access to ports reached in the story;
- a mysterious island hinted at by folklore, reachable later by everyone.

**Canon hooks (Chapter 2, spoiler-safe).**

- **Harbourmaster Ōmi** is in Saltglass: brisk, fair, thirty years in the port. She suspends the ferry until its board tells the truth.
- **Tetsu**, the old ferryman, and **Shiori**, the tide-keeper with her tide book.
- **Fuku**, whose late husband's boat, the *Chidori-maru*, still sits at the quay.
- **The board's eastbound destination is never named**: in this plan, Manybridge.

#### The quest: "A Licence for the Open Sea"

| Stage | When | What happens |
| --- | --- | --- |
| 1. The deal | After Chapter 2 | Ōmi needs a courier boat for the coast. If the player restores an old hull and earns a licence, it is theirs to sail, carrying the coast's post. Fuku, after a conversation about her husband, entrusts the *Chidori-maru*'s hull (her choice; there are other boats if she declines) |
| 2. The yards | Manybridge | Shipwrights in the canal yards; the sail-maker; **the player names the boat** (kana, painted on by Blockprint Row's sign-writers; naming is this world's magic). Help is earned through favours: there is no currency |
| 3. Sea trials | A return to Saltglass, new Chapters 5–6 | Tetsu teaches sea words (帆, 舵, 錨, 潮, 風向き); reading Shiori's tide book; a short trial voyage around the point |
| 4. The licence | Saltglass, new Chapters 6–7 | Ōmi's licence exam: a document mission and a short interview (register with an official). It cannot be failed permanently: retry at once with feedback |
| 5. Maiden voyage | New Chapters 7–8 | First voyage to **Sazanami** and **East Landing**, then the hint of the island leads to **Kotonoha**: an early visit, before its main chapter (9) |

**Everyone gets there in Chapter 9.** Kotonoha is now a main chapter (C-01): players who skipped the quest reach it by **public ferry** in Chapter 9 and miss nothing essential. They can still finish the quest afterwards and get the boat.

#### Sailing itself

- **Choose a destination** on the sea chart from ports already reached: Saltglass, Manybridge, Sazanami, East Landing, Kotonoha, and Reedwake's river landing for the small craft.
- **Two ways to travel, each switchable at any time:**
  1. **Sail yourself.** A top-down sea map with direct control. Steer with the movement keys or touch, set the sail to the wind (a wind arrow and a pennant show it), use the chart. **Untimed:** nothing pursues, nothing runs out, the boat cannot sink or be lost. A poorly set sail just makes the trip longer.
  2. **Let the crew sail.** Skip to arrival, as Robin asked.
- **Sea situations** happen on legs of the voyage (seeded, S2), in either mode:
  - a passing ship hails you (read its flags, answer its call);
  - fog rolls in (read the lighthouse signal, or use みち);
  - floating cargo with a label to read;
  - a creature on deck (an encounter);
  - a sea bird with a message;
  - a seal on the rocks (a sight for the log).

  **Unique first-time situations** per route, as with road events. **Story situations are never skipped:** in "crew sails" mode they interrupt the skip, so skipping never forfeits content.
- **Something goes wrong on board** (Robin, C-43): a sail tears, a line frays, the rudder pin works loose, a hatch leaks. The player can **fix it now**, writing or choosing the part and what to do with it (帆, 綱, 舵, 縫う, 結ぶ), or **at the next port**, where a shipwright helps. Until then the boat simply sails a little slower. The words come from the boat itself, so seafaring vocabulary is learned by handling it.
- **No failure, without saying so.** The boat never sinks, nothing is lost, and the crew's calm lines carry the message ("She'll get us there either way"; "We'll patch it in port if you'd rather"), never a warning or a "you cannot fail" label (Robin).
- **The travel log** (K2): every voyage writes an entry: route, sights, words learned, people met. It becomes a section of the travel volume.
- **Fishing from the boat:** a new station for the existing pastime.
- **Learning about the sea:** weather, tides, directions (北東), sail terms. Taught by Tetsu, practised on voyages.

**Pros.**

- Robin's strongest region idea.
- Makes the world feel larger.
- A home base (W8).

**Cons.**

- A new traversal mode (sea map, boat physics, controls).
- Risk of "excessive walking" at sea (spec line 56), which skipping answers.

**Effort:** XL (quest, sea maps, mode, events, ports).

---

### W8 · The boat as a home: the travelling reading room (A57)

- **The cabin:**
  - a shelf for keepsakes;
  - the travel volume on a lectern;
  - a **Distractions corner** (shogi board, karuta, the tactics board, festival games kept after the festival);
  - a bunk to rest (full resolve, like an inn);
  - companion conversations and the pet aboard.
- **No upkeep, no furniture economy** (Astra: a place for preparation and reflection, not maintenance).
- **Players without a boat** find the same Distractions corner in the Manybridge festival hall, so no pastime is boat-exclusive.

**Effort:** M.

---

### W9–W17 · Exploration verbs (Astra's group B, all rated solid by Robin)

| # | Verb | What the player does | Where |
| --- | --- | --- | --- |
| W9 (A17) | **Notices that change behaviour** | Compose or repair a notice from supported pieces; people visibly follow it (a queue forms on the left; a cart takes the other road). Different valid notices work differently | Manybridge (stalls, the lock); Steamhollow (house rules); the new settlement |
| W10 (A54) | **The press** | Set, print and circulate stories or notices; readers react to what's in them | Manybridge B (system in [08_CULTURE.md](#f08) C15) |
| W11 (A14) | **Courier route planning** | Plan several deliveries around who is where and when (phases, not clocks); several plans work | Manybridge barges; the Cloudroad relay |
| W12 (A15) | **Repair jobs** | Inspect, read instructions, choose a tool, test. Materials come with the job: no gathering | East Landing; Steamhollow vent pipes; restored lamps (D2) |
| W13 (A11) | **Connected inkweaving** | Water, airflow, weights across connected rooms; change one, trace the effect | Undercroft Locks; Steam Vents; Root Hollows |
| W14 (A16) | **Observation-first mechanisms** | Watch a machine's pattern (pausable), inspect a diagram, choose the next adjustment | The Understage; Hall wing 3 |
| W15 (A18) | **Creature routing** | Redirect a creature with light, shade, sound or a written sign rather than fight it | Cloudroad pack horses; Kotonoha leaflings |
| W16 (A19) | **Layered-site investigation** | Compare an old plan with today's place to find what's missing | Manybridge's Lost Contract; East Landing |
| W17 (A20) | **Stage-blocking** | Place actors and props from directions; test; revise the misunderstanding | Playhouse Row rehearsals |

All of these extend **Field Inkweaving's data model** (response family × object × state, three free hint layers) and the **case engine** (evidence, hypotheses) rather than adding new engines.

**Quiet puzzle spaces** (Astra): while the player is examining a mechanism or comparing clues, roaming creatures don't interrupt. Puzzle rooms have no wandering foes.

**Effort:** L in total, spread across regions.

## 07 · Regions

*Expansion plan, draft 7 (2026-10-08, after Robin's fifth round of answers). Planning only. Spoiler-safe: existing Chapters 3–6 appear only as the spec names them. Anything that depends on their contents is in SEALED_STORY_NOTES.md.*

Robin's question for every region: *names, stories, unique encounters and mechanics; main quest or postgame; how should it be themed?* Each region below answers it in the same order. The decisive test from [01_PRINCIPLES.md](#f01) §1 comes first: **what can the player do here that they could not do before?**

All names are proposals. English names follow the world's style (Reedwake, Saltglass, Cinder Orchard, Snowbell, Lanternfall). Each comes with a Japanese name, which, like 葦ノ瀬 and 潮硝子, is a place name invented for the fiction.

### Overview

| # | Region | Kind | Where it sits | Its new verb | Origin in the consultation |
| --- | --- | --- | --- | --- | --- |
| R1 | **Manybridge** (八百橋, Yaobashi): the Exchange | Main story, Chapters 3–4 | After Chapter 2: the destination of Saltglass's eastbound ferry | Route goods and people by saying who sends what to whom; read and negotiate conditional notices | Canal Exchange (A51) |
| R1 | **Manybridge**: Blockprint Row and Playhouse Row | (same city, second chapter) |  | Compose, print and circulate stories and notices; perform on stage | Printers' Quarter (A54), Travelling Stage (A56), festival (A50) |
| R8 | **The Keepers' Road** (灯守の道, Himori no Michi) | Main story, Chapter 7 | Between Snowbell and Lanternfall | Weigh lore told several ways, and act on what each source can vouch for | The twelve-chapter variant (C-01); folklore (A49) |
| R2 | **The Cloudroad** (雲路, Kumoji) | Main story, Chapter 10 | Before Steamhollow and the final chapter | Plan a journey from reports of uneven reliability; carry and verify messages | Mountain Relay (A52) |
| R3 | **Steamhollow** (湯ノ谷, Yunotani) | Main story, Chapter 11 | Straight after the Cloudroad | Make, change and decline arrangements with people; mediate | Hot-Spring Commons (A55) |
| R4 | **Kotonoha, the Isle of Word-Leaves** (言の葉島) | Main story, Chapter 9; also early by your own boat | Off the south-west coast | Restore drifted words to the places that lost them; follow folklore told several ways | Robin's sailing and island idea; Echo Isles folded in (A53) |
| R5 | **The Hall of a Hundred Tales** (百物語の館) | Postgame superdungeon | The old keepers' house in the hills | All of it: the "100 Trials" | Robin's 100 Trials (A§4) |
| R6 | **Sazanami** (漣) and **East Landing** | Small sailing ports, side content | Up the coast | Sea-trade errands; rebuild a lost landing | Sailing destinations (Robin) |
| R7 | **The new settlement** | Postgame region | Sealed note S6 | Help found a village from nothing: name it, sign it, settle its disputes | Evolving communities (Robin) |

The plan takes the main story from **6 to 12 chapters**, Robin's decision of 2026-10-07 (C-01). The full order is in [10_STORY.md](#f10) §4.

Why these placements:

- **A city early.** After a riverside village and a harbour, the player is ready for density: many people, institutions and documents. A city also changes the *kind* of problem: systems, crowds and contracts instead of one village's mystery.
- **The mountains and the hot spring late.** They lengthen the approach to the final chapter, which is what Robin asked for when wishing the Hush to "feel more epic". They also give the companion relationship a lively, social beat before the end, distinct from the spec's quieter stretch in Snowbell.
- **The keepers' road in the middle (7).** Folklore and archives deepen the mystery between Snowbell and Lanternfall.
- **The island after Lanternfall (9).** Robin's own design, now a main chapter: earned early by boat, reached by everyone in Chapter 9, adapting to the story so far.

---

### The score across twelve chapters (Robin, C-22)

**Robin's direction.** Each new area builds more energy, more lift, more intensity, but Chapter 9 needn't be an extravagant epic theme. The final region, its dungeon and its boss each have a unique theme that says the journey is nearing its end: more intense than anything before, slightly imposing, important. And intensity is not more instruments at a higher tempo: **every piece of music in the game should sound like one coherent, intentional score.**

**How the plan does it.**

- **One score, not a playlist.** A small set of motifs runs through the whole game: the road's theme (the title and the overworld), a motif for the lanterns and names, one for the Hush, and one per companion. Regions vary instrument, mode and tempo; the motifs keep it one piece of music.
- **Intensity by writing, not by piling up:** fuller harmony, a stronger bass line, rhythmic drive in the battle themes, longer phrases and bigger ranges, with each region's palette of instruments kept small and its own (shamisen and taiko for Manybridge; biwa for the Keepers' Road; koto harmonics for Kotonoha; shakuhachi and a walking rhythm for the Cloudroad; a lively ensemble for Steamhollow).
- **The ladder, re-tiered for twelve chapters** (C-22): each chapter's battle theme a step above the last; the middle chapters lively, not grand; the last two chapters before the end the most driven yet.
- **The final chapter, set apart:** its region theme, dungeon theme and boss theme are unique, built from the Hush's motif and the road's theme set against each other, slower and heavier rather than faster; the score thins as the land goes quiet ([10_STORY.md](#f10) §6a), so the final battle lands with weight.
- **Quiet cues count too:** the companions' night-apart cues and ambience ([14_COMPANIONS.md](#f14) §5) belong to the same score: the companion's motif, near silent.
- **A check before each region ships:** its themes are heard beside their neighbours and the main motifs, so the score stays one piece (by ear; the existing loudness ceiling still holds).

---

### R1 · Manybridge (八百橋, Yaobashi), the city of eight hundred bridges

**Placement.** Main story: two new chapters directly after Saltglass (the new Chapters 3 and 4; the existing Cinder Orchard onwards renumbers to 5–8, see [10_STORY.md](#f10)). Reached by Saltglass's eastbound ferry, whose destination the board never names. Here it finally has one. A river road also runs down from Reedwake.

**Inspiration (to label honestly in-game).** The merchant river cities of Edo-period Japan: canals, warehouse districts, publishers of woodblock books and prints, and theatre districts, with a Kansai-flavoured speech community. Manybridge is fictional, and the game never presents it as a real city. The "eight hundred bridges" echoes a real nickname given to old Osaka (八百八橋), which a lore entry can mention as that.

**What the player does here that they could not before.**

1. **Route** goods, letters and people through a canal network by stating who sends what, to whom, by which way (particles as consequences, A3).
2. **Read conditions**: notices and contracts with "if", "unless", "until" (A6/A48).
3. **Compose**: build stories and notices from language blocks, print them, and watch the city respond (A54, A17).
4. **Perform**: rehearse and stage a scene, adjusting wording to an audience (A56, A20).

#### Chapter A: "Eight Hundred Bridges" (the Exchange)

**Story.** The party arrives to find the city's bridges forgetting their names. Each Manybridge bridge carries a name plaque, cut from a block printed in Blockprint Row, and the canal boatmen navigate by them. As plaques go blank, barges take wrong turns, deliveries pile up, and the Tally Exchange (札場, fudaba), where merchants post offers on boards, fills with disputes about whose goods went where.

The chapter's thread is a merchant house whose shipments keep "arriving" at the wrong warehouse. It is a three-way puzzle:

- the Hush blanking plaques;
- a canal porter rerouting barges on purpose to cover a loss;
- an honest misunderstanding over a notice whose condition two people read differently.

This mirrors Saltglass's "Labels That Disagree" structure (spec: "the difference between a misunderstanding and a deliberate lie"), but scales it from one harbour to a network.

**Dungeon: the Undercroft Locks** (閘門の地下, the lock tunnels under the Exchange). A connected-water dungeon (A11):

- **Water levels.** Sluices, lock gates and channels across several rooms. Raising one basin lowers another, and a barge (and the party on it) moves between levels.
- **Instructions are routing sentences.** The lock-keeper's old tablets say which gate passes what to where; restoring them means reconstructing the sentence.
- **The boss: the Nameless Bridge** (名無し橋). A bridge spirit that has lost its name and dismantles its own spans to stop anyone crossing to the wrong place. It is a *machine-procedure* encounter (E7 in [03_ENCOUNTERS.md](#f03)): restore the three spans in the right order while answering its moves. It ends when the bridge is given back its name, which the player assembles from evidence gathered across the chapter.

**Signature activities.**

- **Barge routing** (A3, A14): a canal map; packages with recipients and conditions; say who sends what where. The barge visibly goes where the sentence sends it. Several valid plans are accepted.
- **The Tally Exchange** (A46, A48): post an offer, read others' offers, notice the condition that makes a deal impossible. Quantities, counters and prices are kept simple (arithmetic is supported; the language is the point).
- **Negotiating passage** (A28): a lock-keeper will not open for a stranger. Clarify, show evidence, make a workable offer.

#### Chapter B: "Blockprint and Footlights" (Blockprint Row and Playhouse Row)

**Story.** The blanking spreads upstream to its source. The city's printers cut the blocks for plaques, notices, travel papers and **the name slips of lantern shades across the whole region**. That is why the Hush's work reached every road at once. This is a fiction built on Chapter 1's canon that a shade carries the next place's name.

In Blockprint Row a master printer's woodblocks are going blank in their racks. Meanwhile Playhouse Row's theatre is preparing for the city's river festival, the **Opening of the River** (川開き, kawabiraki, a real Edo custom with fireworks). Its script keeps losing its characters' names.

The chapter ends with the festival: planning beforehand, the evening itself, fireworks over the canals with the companion, and minigames that stay playable afterwards (C10 in [08_CULTURE.md](#f08)).

**Dungeon: the Understage** (奈落, naraku). The real name for the machinery pit beneath a kabuki stage:

- **Machinery.** Revolving-stage gears (回り舞台), trap lifts (せり), counterweights and rigging. A machine-procedure dungeon (A16, A4): operate the stage's mechanisms in the order a prompt-book describes, repairing the prompt-book as you go (reference and omission, A5: "lift *it* after *she* exits").
- **Its creatures** are stage spirits:
  - **Prompters' Ghosts** (黒衣, kuroko). The black-clad stagehands whom audiences agree not to see; a creature that is only "there" once acknowledged in words.
  - **Misprint Moths.**
  - **Loose Type Imps** (scattered movable type that rearranges sentences).
  - **the Block Golem** (a woodblock that prints whatever it last heard).
- **The boss: the Understage itself** (奈落の主). A procedure-and-performance encounter: the show must go on above while you bring the machinery back below. The companion's actions are stage cues, distinct from their normal support menu (E10).

**Signature activities.**

- **The press** (A54 with Robin's direction; system in [06_WORLD.md](#f06) W10 and [08_CULTURE.md](#f08) C15): build a short story or notice from blocks, set it, print it, and post or sell it. Readers around the city respond to what the story *contains*. Notices change how NPCs behave.
- **Rehearsal** (A20, A41, A10): place actors and props from stage directions; adjust a line for a children's matinée versus an evening audience; reconstruct a scene from a scrambled prompt-book.
- **Manzai with Suzu** (C11): a comedy double-act routine where the player plays the straight man (ツッコミ). Available as a performance in any route, and deeper in Suzu's.

#### Theme

- **Architecture.** Stone-faced canals with willow banks. White-walled storehouses (蔵) with black tiles. Merchant houses with lattice fronts (格子). Arched and flat timber bridges, each with its plaque. Playhouse Row's banners (のぼり) and lanterns. Blockprint Row's drying racks of printed sheets.
- **Palette.** Indigo and white, canal green, warm cedar, vermilion only on the theatre.
- **Weather.** Humid summer: haze over the water by day, festival dusk at the chapter's end.
- **Music** (src/audio zones). Shamisen-led, brisker than Saltglass. Hand drums and a taiko pulse in Playhouse Row. Wooden clappers (拍子木) as a scene cue. Fireworks as soft, low thumps, never a flash or a harsh crack (spec line 264). Battle and boss themes slot into the per-chapter intensity ladder (the audio rule ZM2 needs re-tiering for twelve chapters; [11_CONTRADICTIONS.md](#f11) C-22).
- **People.** Merchants, porters, boatmen, clerks, printers, apprentices, actors, a troupe manager, festival organisers, street sellers. Speech is lively and quick. A Kansai-flavoured *dialect community* exists here. The questions still use standard Japanese, as the dialect rules require.

#### Language focus by profile

| Profile | Chapter A (Exchange) | Chapter B (Press and Stage) |
| --- | --- | --- |
| **F** | Kana on plaques, crates and names; numbers and counters in kana; "who gets this?" with pictures | Kana on posters and programmes; a character's name restored on the prompt-book; sound words (オノマトペ) in comedy |
| **E** | Particles に・へ・を・から・まで・で in routing; prices and quantities; polite requests | Short notices (〜てください・〜ないでください); ordering events (〜てから・前に); stage directions |
| **I** | Conditions (〜たら・〜ば・なら・〜ないと); contracts; causes and excuses | Reference and omission across lines; adjusting register for an audience; reported speech in reviews |
| **A** | Hedged commitments, implication in a negotiation, reading between a contract's lines | Register shifts, rhetoric, paraphrasing a notice for a different reader, nuance in reviews |

#### Unique encounters

- **Creatures (8–10).**
  - **Tally Crab:** stamps "paid" on whatever it touches.
  - **Lockgate Snail:** closes when spoken to rudely.
  - **Abacus Beetle:** rearranges numbers.
  - **Driftbarge:** an empty barge that goes wherever the last order sent it.
  - **IOU Tangle:** a knot of debt strings, and a natural rope target.
  - **Misprint Moth, Loose Type Imp, Prompter's Ghost, Block Golem** (Chapter B).
  - **Canal Kappa?** Considered and *rejected*: a real folklore figure with established traits. If used at all, only as a told story (C9), not as a creature.
- **Wanderers** (E3): a canal porter who fends off creatures blocking *their* barge; a busker who joins any fight near the theatre and leaves when the crowd does.
- **Social encounters** (E8): the Tally Exchange dispute, a three-party argument over a mis-delivered shipment, resolved by the evidence you bring; a negotiation for lock passage. **The Tally Exchange dispute is the game's first conflict with no creature in it, so it teaches that Unravel can do nothing and the situation must be read** (Robin, C-60; [03_ENCOUNTERS.md](#f03) E8).
- **Machine encounters** (E7): the Nameless Bridge; the Understage.

#### Side quests (sketches, 8 across both chapters)

1. **The Bridge-Name Census.** Walk the canals and restore plaques. Each is a short routing or reading puzzle. Mapping-flavoured, with no compulsory map drawing; ties into Cartographer commissions (D7).
2. **The Rival Noodle Stalls.** Two stalls with near-identical signs. Help each word its notice so customers stop arriving at the wrong one (A17).
3. **A Ghostwriter's Debt.** A writer whose stories were printed under someone else's name, a name theme. Collect evidence; the outcome depends on whether you expose or broker (permanent, side-quest-level, E17).
4. **The Apprentice Printer.** Teach a child to set type. The player becomes the explainer (A39).
5. **The Missing Lead Actor** (the troupe; Suzu's route deepens it). A performer lost their stage name and their nerve. Rehearsal puzzles.
6. **Boatman's Riddles.** An old boatman only gives directions in riddles; optional and repeatable as a Distraction.
7. **The Lost Contract.** A layered-site investigation (A19): compare an old canal plan with today's to find a walled-off warehouse.
8. **Festival preparations** (C10): the festival's committee needs lanterns hung, stalls placed, boats ordered and invitations sent. Planning produces the festival you see.

#### Companions here

- **Nao.** Couriers are everywhere in a trade city: a courier guild hall, rival couriers, old acquaintances from Nao's own courier past. Nao is the natural lead in routing.
- **Mio.** Apothecary labels and patent-medicine posters: a counterfeit-label case in Blockprint Row. Her temper at condescension meets a merchant who talks down to her.
- **Ren.** The lantern-shade name slips are printed here. Ren meets the craft behind their own trade and is hopeless in the city's maze of canals (comedy that the routing system can stage).
- **Suzu.** A performer in a theatre city. **Canon note:** Suzu is not a star. She kept her troupe's books and minded the luggage, and she wants a double-act partner (相方). Robin's review called her someone who "aspires to be a star"; the plan builds her arc on the canon version, finding her 相方 and her own act. That fits a manzai routine with the player, and her troupe can be met here ([11_CONTRADICTIONS.md](#f11) C-31).
- **All four** take part in the rehearsal and festival with distinct roles, as Robin asked for the stage idea.

#### Evolving community

- **After Chapter A:** bridges named again; the barges run; the Exchange's boards fill.
- **After Chapter B:**
  - The printers print the party's exploits as a broadsheet that NPCs across the world mention, with spoiler-safe wording.
  - The theatre stages a play about the festival.
  - The festival games move into a hall for the rest of the game (C10).
- **Later chapters.** Letters from Manybridge arrive; the city prints notices the player helped write; merchants stock things from places the party visited.
- **Postgame:** a "changed world" walk; the broadsheet's last edition.

#### Folklore and Hush seeding

- The printers' oldest blocks include a keepers' warning about しじま, written centuries ago in the same words Tsuru uses. This is the first sign that the phenomenon is older than anyone believed.
- The theatre's oldest play is a version of the "Hundred Tales" gathering (seeds R5).

#### Travel-volume illustrations (see [09_RECORDS.md](#f09))

1. Arriving by ferry under the bridges.
2. The Tally Exchange in uproar.
3. The Nameless Bridge given its name.
4. The press printing its first sheet.
5. The Opening of the River: fireworks over the canals, the party in festival clothes. This is Robin's example of a living, animated illustration.
6. The curtain call, with a different pose for Suzu's route.

#### Size estimate

- **Maps:** about 30 for two chapters (city districts, canal network, interiors, Undercroft, Understage). That is a city of about two Saltglasses.
- **People and creatures:** 60–80 NPCs; 10 creatures and 2 bosses.
- **Language work:** about 100 drills; 16 challenges.

#### Risks

- A city can drown the player in errands. **Keep the quest count near the spec's three per region per chapter** and let the systems (routing, press, stage) carry the novelty.
- The press must not pretend to understand free text. It uses bounded blocks ([11_CONTRADICTIONS.md](#f11) C-24).
- Kansai flavour must not become caricature: the dialect rules, and restraint (no native reviewer is available, C-26: few, well-attested features, always labelled).

---

### R2 · The Cloudroad (雲路, Kumoji)

**Placement.** Main story, Chapter 10, followed by Steamhollow (11) and the final chapter. It lengthens the approach to the final chapter. Exact geography is in sealed note S3.

**Inspiration.** The Edo-period highways and their post stations (宿場町). Relay couriers (飛脚, hikyaku), who carried letters station to station. Mountain checkpoints (関所, sekisho), where travellers showed travel papers (通行手形). All real history, labelled as such where the game teaches it. Everything else is fiction.

**What the player does here.** **Plan a journey from information of uneven reliability.** Weather, landslides and closures change by explicit phases (never a clock). Reports come first-hand, second-hand or as rumour. The player learns to weigh 〜そうだ・〜らしい・〜ようだ・〜と言っていた, carry messages faithfully, and verify them (A8, A52).

**Story.** Seven post stations climb into cloud. The lanterns along the road are failing one by one. In the old days a relay of couriers kept the names on them fresh, and the last courier never arrived. Messages passed station to station have been garbled: each station's version of events differs.

The party must cross:

- the stations;
- the checkpoint, the **Mist Barrier** (霧の関, Kiri-no-seki), whose keeper demands papers the Hush has blanked;
- the high pass.

Along the way they reconstruct what really happened to the last courier, and why. The chapter's stakes (sealed note S3) are about trust in what is reported: the step before the final chapter's questions.

**Dungeon: the High Pass and the Courier's Hut.** A large floor-by-floor dungeon (D1): switchbacks, a landslide detour, a rope bridge, a snow-shelter, a stationed rest hut with limited uses (D2, a story-dungeon version with checkpoints). **The boss: the Courier Who Never Arrived** (届かずの飛脚), a relay spirit still running a message whose sender and recipient have been forgotten. The fight is an argument-chain encounter (E8, A24): the spirit's account changes each round, and the player tracks which version is supported.

**Signature activities.**

- **Route planning** (A52, A14): choose the next leg from station reports, the weather phase and party condition. Any reasonable plan gets through; a better-read plan avoids a detour.
- **The relay** (A8): carry a message between stations and repeat it accurately, *with the certainty you actually have*. The next station acts on what you said: a report of rumour as fact sends a rescue party the wrong way, a recoverable side consequence.
- **Papers at the Mist Barrier** (A48): fill and check travel papers; spot a forged stamp; explain your purpose in suitably formal Japanese (role and register, A41).

**Theme.**

- **Setting:** cedar forest, stone-paved switchbacks, thatched post-station inns, the checkpoint's gate and fences, waystones, cloud seas below the pass.
- **Palette:** cedar green, slate grey, cloud white, ember orange of station lanterns.
- **Music:** shakuhachi and koto with a walking rhythm; a lonely flute at altitude; bells of pack horses.
- **People:** innkeepers, porters, couriers, checkpoint officials, pilgrims, a mapmaker, a pack-horse driver.

**Language focus.**

| Profile | Focus |
| --- | --- |
| **F** | Kana on waystones and inn signs; directions and simple weather words; station names |
| **E** | Directions and order (〜てから, 次に); weather; simple reports (〜と言っていました) |
| **I** | Hearsay versus inference versus appearance (そうだ・らしい・ようだ); conditions on routes; plans (〜つもり, 予定) |
| **A** | Formal speech to officials; implication in reports; paraphrasing a garbled message faithfully |

**Unique encounters.**

- **Creatures:**
  - **Fog Porter:** carries off luggage, a "protect the document" objective, E6.
  - **Waystone Imp:** turns signposts.
  - **Cloud Ox.**
  - **Runner's Echo:** repeats the last thing said, garbled.
  - **Pack-Lantern:** a failing lantern with a creature's will.
- **Wanderers:** a pilgrim who helps against anything blocking the shrine path; a smuggler who helps against the checkpoint's creatures and then asks for a favour.
- **Social:** the Mist Barrier interview (a negotiation, E8); a dispute between two inns over a guest.
- **Road events** (W5): a stranded courier; a pack horse on a ledge (environmental routing, A18).

**Side quests (5).**

1. The Seven Seals: a stamp at each station, as in the real post-station and travel-stamp culture; a natural fit for the Road Stamp Book (K1).
2. The Inn That Lost Its Guest Book.
3. The Mapmaker's Wrong Map: a Cartographer commission.
4. The Pilgrim's Errand.
5. **The Last Courier's Family** (permanent outcomes, E17).

**Companions.**

- **Nao:** a courier among couriers; the Courier boss hits home.
- **Mio:** altitude sickness and herbal remedies, labels in the post-station dispensary.
- **Ren:** the road lanterns, and a keeper's duty to them. Directions are, as ever, Ren's weakness.
- **Suzu:** travelling players took these roads; she knows the inns' tricks and tells the road's stories.

**Evolving community.** The stations' lanterns relit; couriers running again; a relay of letters between the player's past regions starts (Letters system); postgame, the checkpoint becomes a tea house.

**Illustrations.**

1. The cloud sea from the pass.
2. The Mist Barrier at dawn.
3. The courier's message delivered at last.

**Size:** about 18 maps, 30 NPCs, 6 creatures and a boss, about 50 drills, 8 challenges.

**Risks.** "Excessive walking" (spec line 56). The road must be *dense with decisions*, with shortcuts and fast travel between stations once visited.

---

### R3 · Steamhollow (湯ノ谷, Yunotani)

**Placement.** Main story, Chapter 11, directly after the Cloudroad and before the final chapter. A lively, crowded hot-spring town in a volcanic valley. It is deliberately *social*, unlike Snowbell's quiet stretch (spec line 50), and is the last warm place before the end.

**Inspiration.** Hot-spring towns (温泉街) with inns (旅館), public baths, footbaths (足湯) and steam cooking. Customs taught in-game are real and labelled: washing before entering, towels kept out of the water, quiet in the bath. Real hot springs vary by place, and the game says so (A42).

**What the player does here.** **Arrange things with people.** Reservations, requests, changes, refusals, invitations, house rules. The language of hospitality and of polite boundaries (A43, A44, A41, A42).

**Story.** The valley's inns are full. Something is drawing travellers who forgot why they came; the town's own people have begun to quarrel over water rights and old grudges. Two rival inns, the Upper House and the Lower House, share one spring, and their dispute escalates. The valley's spring spirit stirs underground whenever the town argues; this is the chapter's tension.

The resolution is **a mediation encounter rather than a fight** (E8, Robin's "you can step in to help a turbulent situation"). The party brings the two houses, the bath-keepers' guild and the spring itself to an arrangement. Sealed note S4 records how this chapter sets up the finale.

**Dungeon: the Steam Vents.** Volcanic tunnels beneath the town. Connected airflow and water (A11): open a vent, steam shifts elsewhere. The stationed resources are hot pools (D2) that restore a little each and run cool after use. **The boss: the Kettle Below** (釜の主), the spring spirit: rumbling, ancient, more frightened than angry. It is settled, not defeated.

**Signature activities.**

- **Reservations** (A44, A46): book rooms for a group of travellers with conflicting needs; change a booking; decline politely.
- **The baths follow pronouns** (Robin, C-56): she/her uses the women's bath, he/him the men's. They/them and custom pronouns choose once (men's, women's or the inn's reserved bath, 貸切風呂, *kashikiri-buro*, real), and the game keeps that choice. Nao and Ren make their own choice in character, always the same one (C-56). When the player and the companion are in different baths, they talk over the bamboo partition. Scenes are towel-wrapped and nonsexual (Robin's direction).
- **House rules** (A42): learn each inn's own rules from signs and staff. They differ, deliberately.
- **Steam cooking** (温泉卵, onsen eggs, and steamed buns): a cooking minigame. Follow a recipe card, take instructions, no timer. The results feed scenes, not a stat economy.

**Theme.**

- **Setting:** steam rising through the town; wooden inns stacked up the valley; red bridges; lantern-lit evenings; yukata-clad guests strolling with wooden sandals (下駄).
- **Palette:** cedar and lacquer, steam white, sulphur yellow, persimmon dusk.
- **Music:** relaxed koto and shamisen; the hollow sound of 下駄 on stone; a deep drone for the vents.
- **People:** innkeepers, maids and clerks, bath-keepers, travellers (many forgetful), a masseur, egg sellers, a retired actor taking the waters.

**Language focus.**

| Profile | Focus |
| --- | --- |
| **F** | Kana on signs (ゆ, おとこ, おんな, かしきり), room numbers, food words |
| **E** | Requests and permission (〜てもいいですか, 〜てください); refusals (〜はちょっと…); rules (〜てはいけません) |
| **I** | Changing arrangements (〜ことにする/なる); apologies and reasons (〜ので, 〜のに); invitations and commitments |
| **A** | Hospitality keigo in comprehension (いらっしゃいませ, ご予約, 承知いたしました); mediating with tact; implication in complaints |

**Unique encounters.**

- **Creatures:**
  - **Steam Wisp.**
  - **Pebble Stack:** stacked stones that topple when disturbed.
  - **Towel Thief:** comic, a "protect" objective.
  - **Sulphur Toad.**
  - **Lost Guest:** a traveller-shaped echo that forgot its room.
- **Social encounters:**
  - the inns' feud (the chapter climax);
  - a guest complaint;
  - a refusal you must make politely: a persistent salesman, the polite-refusal training ground.
- **Wanderers:** a bath-keeper who joins against anything muddying the water.

**Side quests (5).**

1. The Masseur's Lost Words.
2. A Wedding Party's Booking.
3. The Retired Actor (links to Manybridge's theatre).
4. Eggs for Everyone (the cooking game).
5. The Footbath Poet: a short-story room (A38).

**Companions.** A bath scene, an evening walk in yukata, and a quiet confession are each written per companion.

- **Mio:** the waters' medicinal claims; her honest rejection of a fraud. This must sit consistently after her personal story; sealed note S4.
- **Nao:** a courier's sore feet and finally sitting still.
- **Ren:** the valley's lanterns.
- **Suzu:** the retired actor, her old idol.

**Evolving community.** After the mediation the inns share the spring on a written agreement the player helped word (A17). The town is calmer and the steam cooking game stays open. Postgame, letters from the inns.

**Illustrations.**

1. The steaming valley at dusk.
2. The private bath with the companion (towel-wrapped; one per companion, a companion-set illustration).
3. The settled spring.

**Size:** about 16 maps, 35 NPCs, 6 creatures, a spirit boss and a mediation climax, about 50 drills, 8 challenges.

**Risks.**

- Tone: warm and funny, never voyeuristic; nonsexual; adults only (spec line 72).
- Bathing that follows pronouns, with a remembered choice for they/them and custom (C-27, C-56).
- Cultural accuracy, labelled.

---

### R4 · Kotonoha, the Isle of Word-Leaves (言の葉島)

**Placement.** Main story, **Chapter 9**, after Lanternfall (C-01: twelve chapters). Robin's original design is kept around it:

- **Early access** by the player's own boat, earned through the Harbourmaster's long quest (W7), around new Chapters 7–8. The early visit is side content with its own small story.
- **The chapter itself** is reached by public ferry from Saltglass, or by your own boat.
- Postgame it remains, matured.

**The name.** 言の葉 is a classical word for words and poems ("leaves of words"). The preface of the Kokinshū (early 10th century) says Japanese poetry grows from the human heart as its seed into myriad leaves of words. That is a real text, quoted and labelled in a lore entry. The island's fiction grows from it: words that are lost, forgotten or carried away fall like leaves and drift on the sea to this island, where a great tree catches them.

**What the player does here.** **Return drifted words to the places that lost them** (vocabulary in context, transfer A32: a word met in one region must be recognised in another's situation). Also **follow folklore told several ways** (A49), and **reconstruct who said what** from distributed messages (the Echo Isles idea, A53, done in text with optional voice).

**Story.** Saltglass sailors have always told of an island "where lost words wash up". Robin's folklore-and-mystique request: the rumour is seeded from Chapter 2 onwards. It is told differently by Tetsu, by Ōmi, by a Manybridge playwright and by a Cloudroad pilgrim, and each version is partly true.

On the island the party finds:

- a small community of word-keepers who gather drifted leaves;
- a great camphor tree whose leaves carry fragments of writing;
- a shoreline where the tide brings in what the world forgot.

Over visits the island reveals more: who the first word-keepers were, why some leaves never decay, and what the island has been holding. Sealed note S5 records how this can relate to the Hush's lingering effects without undoing the ending.

**Adapting to the visit's story phase** (Robin's §10 and S1 in [02_FOUNDATIONS.md](#f02)). The island reads three things separately:

1. **Story phase.** What the party knows; what the residents can talk about. Never a later revelation early.
2. **Profile.** How each task is expressed.
3. **Introduced concepts.** Whether a response or construction has been taught yet.

| Visit | What is there |
| --- | --- |
| **Early (boat), side content** | The shore, the village and the tree's lower terraces. The first folklore. Leaves from regions already visited. A complete local story arc: the keepers' apprentice who cannot read the leaves. Progress made now stays made, and Chapter 9 picks up from it. |
| **Chapter 9 (main story)** | Everything above, plus the tree's upper terraces, the Root Hollows and leaves from every region so far. The chapter's own story (below). Written so that it plays fully whether or not the player came early. |
| **After the final chapter** | The matured island: the keepers' full history, the deepest grove, a postgame dungeon wing. Conversations reflect the ending. |

**Chapter 9's story.** The great tree is shedding faster than the keepers can gather, and words are slipping from the mainland sooner than leaves can carry them back. The keepers ask the party for help. They return what they can, learn what the island has been holding, and go down into the roots, where the tide separates the player from the companion for a while (the "in danger" separation, [10_STORY.md](#f10) §8). The chapter asks where lost words go. It does not answer what the finale answers (sealed S5).

**Dungeon: the Root Hollows.** Caves among the great tree's roots. Leaves drift in currents of air; restoring each leaf's word reshapes the roots' passages (connected systems, A11, with words as keys). An optional deeper wing opens later (Restored-return, A37). **The boss: the Gardener of Unsent Words** (届かぬ言葉の庭守), the island's oldest keeper-spirit, guarding leaves that were never meant to be found. It is a social and folklore encounter: ask back (A6), compare tellings (A49), and decide which leaves to return.

**Signature activities.**

- **Leaf returning.** Each leaf holds a word or short sentence. Read it, work out where it was lost from (a sign in Reedwake, a label in Saltglass, a playbill in Manybridge) and return it. Back on the mainland it reappears, a visible evolving-community change (W1).
- **Shell messages** (A53 in text): conch shells hold fragments of conversations. Reconstruct who said what to whom (reference, A5; comic reconstruction, A10). Each shell can be *listened to* with the device's voice where one exists (optional listening), and always *read*.
- **The tellings** (A49): gather versions of the island's legend from four tellers and assemble an exhibition in the keepers' hall, choosing which version each panel shows (no single correct one; each choice is explained).

**Theme.**

- **Setting:** a mystical, quiet island. A huge camphor tree; leaves with faint writing drifting like snow; tide pools that reflect words; a weathered village of netted houses; stone lanterns half-buried in sand.
- **Palette:** sea-glass teal, leaf gold, moonlit silver, ink black. Its own look, as Robin asked for: dreamier than anywhere else, softer edges, more particles.
- **Music:** koto harmonics, a bowed instrument, wind chimes, sparse and spacious. A unique zone with its own battle theme.

**Language focus.** Every profile meets *its own* already-learned words again in new contexts (transfer), plus:

| Profile | Focus |
| --- | --- |
| **F** | Recognising known kana words on leaves; matching them to places |
| **E** | Reporting who said what (〜と言いました); simple folklore narration (past tense) |
| **I** | Comparing versions (〜によると, 〜という話だ); reference across a dialogue |
| **A** | Literary register in folklore; implication; paraphrase between tellings |

**Unique encounters.**

- **Creatures:**
  - **Leafling:** a sprite carrying a word.
  - **Driftword Jelly.**
  - **Tidepool Mirror:** shows a reversed sentence.
  - **Conch Echo.**
  - **Sand Lantern.**
- **Wanderers:** a word-keeper apprentice; a lost sailor's echo.
- **The Gardener** (social and folklore).

**Side quests (5):**

1. The Apprentice Who Cannot Read.
2. The Sailor's Last Letter (permanent outcomes).
3. The Leaf That Is Your Name: a personal story for the player.
4. The Keepers' Census.
5. The Tide Calendar: a phase puzzle.

**Companions.**

- **Nao:** unsent letters.
- **Mio:** labels without bottles.
- **Ren:** the oldest lanterns, half-buried in sand.
- **Suzu:** the island's story told on a sea-cave stage.

**Illustrations.**

1. The first sight of the great tree.
2. Leaves rising on the night wind.
3. The exhibition of tellings.
4. The deepest grove (postgame).

**Size:** about 14 maps, 20 NPCs, 6 creatures, a boss, about 40 drills; plus *three versions* of resident dialogue, one per story phase. This is the region's main authoring cost.

**Risks.**

- The three-phase authoring cost.
- Folklore labelling (spec line 32): invented island lore must not pass as real.
- The early boat visit must not lock in, or lock out, content needed elsewhere, and Chapter 9 must play fully without it.

---

### R8 · The Keepers' Road (灯守の道, Himori no Michi)

**Placement.** Main story, Chapter 7: between Snowbell and Lanternfall. Added when Robin chose twelve chapters (C-01). Sealed note S2 checks the placement against the existing story.

**Inspiration.** All real, and labelled as such where the game teaches it:

- **Pilgrimage roads** lined with stone lanterns (石灯籠), and the stamp books pilgrims carry from temple to temple.
- **Hyaku-monogatari** (百物語怪談会): an Edo-period pastime of telling a hundred ghost stories by lamplight, putting out one wick after each. Tradition says something comes when the hundredth goes out, so people often stopped at ninety-nine.
- **Etoki** (絵解き): itinerant tellers who explained painted scrolls to audiences.
- **Tsukumogami** (付喪神): household things said to gain a spirit after a hundred years.

Everything else, including the keepers' order (灯守, *himori*, the game's own word), is fiction.

**What the player does here.** **Piece together lore told several ways, and weigh where each telling comes from.** An inscription, an old keeper's memory, a children's rhyme and a teller's scroll all describe the same things differently. The player works out what each source can really vouch for, and uses the result to act: find an oil cache, choose the right fork, relight a lantern with its true name (folklore told several ways, A49; sources and reference, A5). It is the chapter where the player learns to read *stories*, not just signs.

**Story.** An old road of stone lanterns climbs from Snowbell's valley through the hills towards Lanternfall. The keepers walked it once, relighting the lanterns and keeping the names of every waystation. Their order dwindled, the road grew over, and the lanterns went dark one by one. After Snowbell the party follows it, looking for the keepers' records. On the way:

- a ruined keepers' lodge and its scriptorium cave;
- **Old Hisae**, the last keeper still living on the road, who remembers Tsuru's teacher as a young apprentice;
- the keepers' first telling of しじま, in three versions that don't agree. The chapter deepens the mystery and answers nothing that belongs to the finale (sealed S1);
- and, high in the hills, **a shuttered hall** where the keepers once told a hundred tales. Its door stays shut: "the hundredth was never told". This is the hall the postgame opens (R5).

**Dungeon: the Scriptorium Cave and the Vigil.** Story dungeon, checkpoints (C-03). Shelves of lantern-registers in a cave behind the lodge: the passages open as the player relights lanterns in the order the tellings describe, and the wrong telling leads to a dead end that explains itself (never a trap). The chapter ends with a **vigil**: ninety-nine wicks, a story at each, the room darkening. **The boss: the Hundredth Tale** (百話目, *hyakuwa-me*), the story that wants to be told. It is a folklore and social encounter (C-09: no Unravel unless something is literally tangled): the party ends the vigil without telling it, by finishing the ninety-ninth in a way that leaves nothing for a hundredth.

**Signature activities.**

- **Weighing tellings:** set the inscription, the memory, the rhyme and the scroll side by side; mark what each can vouch for; act on the result. Any well-supported reading succeeds; a better reading saves a detour.
- **Relighting by name:** each dark lantern relights when its name is read right from the clues on the road.
- **The etoki teller:** help a travelling teller restore a damaged scroll's captions, then hear the story told (optional listening with the device's voice; always readable).

**Theme.**

- **Setting:** cedar and maple forest, moss-covered stone lanterns, worn stone steps, a roofless lodge, a cave of shelves, the shuttered hall in the hills. Late autumn mist.
- **Palette:** moss green, lantern amber, maple red, ink black.
- **Music:** biwa-led (the instrument of Japan's travelling storytellers), slow and narrative, with a single bell at the waystations. Its own zone and battle theme, tiered in the twelve-chapter ladder (C-22).
- **People:** pilgrims, the old keeper, a woodcutter, an etoki teller, a lodge caretaker's family, a scholar copying inscriptions.

**Language focus.**

| Profile | Focus |
| --- | --- |
| **F** | Kana on lanterns and waystones; counting lanterns and steps; むかしむかし and simple story words |
| **E** | Narrative past (〜ました); sequence (それから, そして); simple quoted speech (〜と言いました) |
| **I** | Naming and custom (〜という, 〜ことになっている); comparing sources (〜によると, 〜と伝えられている) |
| **A** | Classical-flavoured set phrases in inscriptions (〜べし, 〜なり), always shown with a modern gloss and labelled as classical; separating a narrator's comment from the story |

Classical forms are optional reading for A only, never needed for progress, and limited to famous, well-attested set phrases with their glosses, self-reviewed against references (no native reviewer is available, C-26).

**Unique encounters.**

- **Creatures:**
  - **Wick Moth:** drinks lantern flame; an objective to keep a lantern lit (E6).
  - **Hundred-Year Sandal:** a tsukumogami (labelled folklore); comic, and kicks dust over signs.
  - **Lantern Ghost** (提灯お化け, labelled folklore): repeats a story with the wrong ending; spotting the change calms it.
  - **Moss Lantern:** a stone lantern that won't let anyone pass until its name is read.
  - **Teller's Shadow:** retells what you just did, wrongly; correct the account.
- **Wanderers:** the etoki teller, who helps against anything that threatens the scroll; a pilgrim who joins briefly to reach a shrine (advises only, never fights: no third party member).
- **Social:** Old Hisae's questions at the lodge, a conversation where asking back (A6) matters more than answering.
- **Road events** (W5): a fallen cedar across the steps; a lantern that will only relight for someone who reads its name; a pilgrim's lost stamp book.

**Side quests (5).**

1. **The Pilgrim's Stamp Book:** stamps at the lantern shrines, for the Road Stamp Book (K1).
2. **Three Tellings of the Fox Bridge:** folklore told three ways; build the version the village will keep.
3. **The Keeper Who Stayed:** whether and how to tell Old Hisae that the order is gone (permanent outcomes, E17, with the understood intention shown before committing).
4. **The Rhyme of the Oil Cache:** a children's rhyme read as a map.
5. **The Teacher's Inkstone:** something of Tsuru's teacher's, to carry back to Reedwake. Tsuru's reply arrives by letter (the Letters system).

**Companions.**

- **Nao:** the keepers' route registers: names and addresses of waystations long gone.
- **Mio:** Old Hisae's health, and the remedies a lone keeper should have had.
- **Ren:** hears one of their own teacher's sayings in a stranger's mouth: a keepers' saying, common to the order. A quiet moment about what is inherited. Ren's teacher's own story stays with Ren's personal quest (sealed S2).
- **Suzu:** the etoki teller is a performer too; Suzu helps tell the ninety-ninth tale at the vigil.

**Evolving community.** The lanterns relit; pilgrims return; the lodge becomes a waystation inn; in the postgame the hall's door opens (R5).

**Illustrations.**

1. The stone-lantern road at dusk.
2. The vigil: ninety-nine wicks and one shadow.
3. The lodge relit.

**Size:** about 14 maps, 20 NPCs, 5 creatures and a boss, about 45 drills, 7 challenges.

**Risks.**

- **Explaining too much.** It must deepen the mystery, never pre-empt the finale (sealed S1, S2).
- **Ren's quest.** Their teacher's story belongs to it.
- **Classical Japanese** stays optional, glossed and labelled.
- **Folklore labelling** (spec line 32): real customs labelled real; the keepers' lore labelled fiction.
- **Walking** (spec line 56): the road must be dense with decisions, with fast travel between relit waystations.

---

### R5 · The Hall of a Hundred Tales (百物語の館)

**Placement.** Postgame superdungeon: Robin's "100 Trials". It sits in the old keepers' house in the hills (Reedwake's lantern keepers had a teacher, and that teacher's order had a hall). Seeded as folklore from the start of the game (Tsuru, then tellers in every new region). **In Chapter 7 the party walks past it** (R8): shut, because the hundredth tale was never told, and at the chapter's vigil they refuse the tale that wanted that place. In the postgame the door opens, and the hundredth tale is finally told: the player's own journey.

**Inspiration (real, labelled).** 百物語怪談会 (hyakumonogatari kaidankai) was an Edo-period gathering where people lit a hundred lamps or candles, told a hundred strange tales, and put out one light after each. Legend held that something would appear after the hundredth.

The Hall **inverts** it, as befits a game about lighting lanterns: a hundred lanterns stand dark, and each trial the player completes *relights* one. The capstone is the hundredth tale, the player's own journey, told back to them.

Full design: [04_DUNGEONS.md](#f04) §D9. In brief:

- Ten wings of ten trials. Each wing is a tale-cycle with its own spatial identity and language theme (Astra's ten themes, refitted to tales).
- **Persistent lantern oil** across a wing. Stationed resources only.
- **Checkpoints** at each wing's hearth. **Suspend** anywhere outside battle (Robin's H2: only here).
- **Earned reprieves**, which let the player return to the surface with exact state kept, and an emergency retreat that resets only the current floor.
- **Delvers:** familiar NPCs met by chance, who help and give better help if you remember shared moments.
- **A Consolidate or Grow route** per wing.
- Each wing's completion adds a **painted, animated illustration** to the travel volume. Players who cannot finish can reveal it through a confirmation, without a fake completion record.

**Theme.**

- **Setting:** a vast old wooden hall, layer upon layer, each wing a different tale's world inside a lantern's glow: a drowned shrine, a fox's wedding procession in rain (a real folklore image, labelled), a mountain inn, a paper city.
- **Palette:** each wing has its own, unified by lantern amber against deep indigo.
- **Music:** a frame theme of solo shakuhachi; each wing's tale has its own instrument.
- **Tone:** occasional unease (spec line 28), never horror.

---

### R6 · Sazanami (漣) and East Landing: small ports for sailing

**Placement.** Side content reached by boat (and on foot for Sazanami, up the coast road). Both have small populations and one or two quests. They exist to make sailing a *journey with destinations*, not a ferry between two hubs.

- **Sazanami**, "ripples": the fishing hamlet "up the coast" where, in Chapter 2's dialogue, Kiyo's elder son works.
  - Net-mending and fish-market numeracy (A46).
  - A tide-pool school for the hamlet's children: the player teaches (A39).
  - A quiet place to fish (an existing pastime at a new station).
- **East Landing**: the vanished landing mentioned in Saltglass's call-bell case.
  - Rebuild it over several visits: repair jobs (A15), notices (A17), negotiation with the old owners.
  - The finished landing is a new port and a changed place to revisit.

---

### R7 · The new settlement (postgame)

**Placement.** Postgame. Its existence comes from the ending, recorded in sealed note S6.

**Pitch.** The purest form of Robin's evolving community. A newly settled village has a name and almost nothing else. Over the postgame the player helps it become a place:

- name its streets (naming is this world's magic);
- write its first notices and settle its first disputes;
- arrange its first festival;
- watch residents move in, with routines that change as the village grows (W2).

**Signature activities.**

- Public notices that change NPC behaviour (A17).
- Mediation (E8).
- Festival planning, a smaller cousin of Manybridge's (A50).
- Each completed improvement visibly changes the map, with new houses and stalls.

**Why postgame.** It gives the end of the journey a gentle, constructive loop that is neither another threat nor a grind. It turns everything learned into *building something*.

---

### Regions considered and not recommended

- **Echo Isles as a separate listening region** (A53). Folded into Kotonoha's shell messages. A region whose core depends on hearing would conflict with the spec ("never require hearing", line 218; no listening validation from synthetic speech, line 280). It would also depend on recorded audio the game does not have.
- **A travelling reading room as a region** (A57). Better as the player's boat cabin, which is a home, a display room and a Distractions venue ([09_RECORDS.md](#f09) K9).
- **A shrine or temple region.** Tempting for culture, but it risks presenting religion superficially. The game already treats shrines lightly. Not recommended without cultural review.

## 08 · Culture, social life, festivals and pastimes

*Expansion plan, draft 7 (2026-10-08, after Robin's fifth round of answers). Planning only.*

Robin \[R0\]: "dialects… etiquette in public places, politeness, social hierarchy review, and more ideas steeped in the Japanese culture." \[R1\]: all of Astra's group E is "solid", especially folklore (A49) and festival planning (A50); lots of simple cultural experiences "without forcing a modern Japan into the style of the game."

**Ground rules** (spec and Astra):

- **Invented lore is never presented as real culture** (spec line 32). Lore entries carry a *fiction / real custom / real history* tag (S5).
- **Teach relationships and context, never a ladder of human worth.** Register is about the person and the situation; "more formal" is not automatically better (Astra, from the Japan Foundation's own course descriptions).
- **No politeness score or cultural-correctness meter** (excluded \[R1\]).
- **No native reviewer is available** (Robin, C-26), so every culturally framed line is written conservatively and self-reviewed against references, recorded as such in the review ledger (S5). The game never claims a review that didn't happen (spec line 178).

---

### C1 · Register and role-switch scenarios (A41)

**What.** Say the same thing as a guest, a colleague, a representative and a friend; the relationship and purpose change what fits. Explain the choice afterwards.

**Where.**

- The Mist Barrier interview (an official);
- the Exchange (a merchant client);
- Steamhollow (host and guest);
- the theatre (audiences);
- Hall wing 9.

**Design.** Bounded choices or constructions (L7). The *reaction* depends on fit, and the feedback explains why. Several responses can suit; none is "most polite = best".

**Effort:** M.

### C2 · Public spaces: observe, read, ask (A42)

**What.** Enter a place, read its signs, watch what people do, ask when unsure, then follow *that place's* requests.

**Where.**

- Steamhollow's baths: each inn's rules differ deliberately;
- a Manybridge playhouse during a performance;
- the Cloudroad checkpoint;
- the new settlement's first public rules.

**Design.** Observation tasks (spot what people do), document reading (signs), asking back (L12). It avoids the "one unwritten rulebook" myth: the game shows variation.

**Effort:** M.

### C3 · Polite boundaries and refusal (A43)

**What.** Decline an invitation, correct an assumption, or offer an alternative while keeping your intention. Refusing is a skill, never a relationship penalty.

**Where.**

- Steamhollow's persistent salesman (the training ground);
- a Manybridge merchant's pressure;
- companion invitations: the existing invitations can be politely declined without any Bond loss, which the Bond table already guarantees.

**Language:** 〜はちょっと…, 申し訳ないんですが, 〜なら大丈夫です; at A, softening and implication.

**Effort:** S–M.

### C4 · Invitations and commitments (A44)

**What.** Arrange something with people who can each commit to different things; confirm details; propose alternatives; tell an invitation from an obligation.

**Where.** Festival planning (C10); a wedding party's booking (Steamhollow); a Cloudroad pilgrim group.

**Effort:** M.

### C5 · A dialect field guide (A45)

**What and why.** Robin: Suzu's Kansai-ben option is a start; dialects are "very cool to see added." Astra: paired standard and regional expressions, context, comprehension or appropriate response, *no imitation required*, fiction kept apart from claims about real speakers.

**Current state.**

- Suzu's Kansai speech is a setting with a full inventory, validated (docs/dialect/suzu_kansai.md).
- **Questions always use standard Japanese.**
- Caricature forms are banned.
- No invented pitch accent (spec line 192).

**Approach.**

- **Words › "Ways of speaking"**: a field guide that fills as the player *hears* dialect in the world. Entries give:
  - the regional form, the standard form and a plain-English gloss;
  - where it was heard;
  - a usage note (real dialect, labelled with its real region where it is real).
- **Manybridge's Kansai-flavoured speech community** fills most of it. It is the natural home, and Suzu's speech finally sounds like the people around her.
- **Optional comprehension exercises** in the guide: understand, never produce.
- **Other dialects** only as a handful of well-documented set phrases, each labelled with its region and source; no dialect is ever *produced* in a task. Kansai, already used for Suzu's speech, stays the only dialect community.

**Pros.** Real culture in context; ties Suzu to a place.

**Cons.** Without native review, the risk of stereotype is managed by restraint: few, well-attested features, always labelled, never mocked.

**Effort:** M.

### C6 · Markets and practical numbers (A46)

**What.** Quantities, packaging, prices, dates and pickup instructions while building an order. Arithmetic stays simple or supported: the language is the point.

**Where:** the Tally Exchange; Sazanami's fish market; Steamhollow's egg stall.

**Language:** counters (〜個, 〜本, 〜枚, 〜匹), prices, dates; the F tier uses kana numbers.

**Note:** there is **no currency** in the game, and none is added. Orders are favours and errands; prices are language content, not an economy.

**Effort:** S–M.

### C7 · Gifts with communicative intent (A47)

**What.** How to present, explain, accept or decline a gift for the occasion and relationship (お土産, お返し). No mandatory gifting, no affection farming, no expensive-gift superiority. The Bond table is exact and capped; gifts never add Bond.

**Where:** returning from travels (omiyage for townsfolk, a tradition with a real basis, labelled); a Steamhollow host's gift; festival.

**Effort:** S.

### C8 · Everyday documents (A48)

**What.** Use authored notices, forms, timetables, labels, menus and receipts to do concrete things. The skill is finding the relevant detail, not translating everything.

**Where:**

- the Cloudroad's travel papers;
- Manybridge contracts and playbills;
- Steamhollow's room cards and house rules;
- the ferry timetable;
- the boat licence (W7).

**Effort:** M (content).

### C9 · Folklore with several tellers (A49)

**What and why.** Robin: "especially #49 and #50… folklore plays a lot into my above idea, and the old-timey word-of-mouth misunderstandings, mystery compel a fun side story."

**Approach.**

- **Recurring folklore threads**, told differently in each region:
  - the island where lost words wash up (Kotonoha);
  - the Hundred Tales;
  - the keepers' old warnings about しじま.
- **Each telling is collected** in a Lore page with who told it, where, and what differs. Contradictions are the point, as in word-of-mouth misunderstandings.
- **Assembling a telling:** in Kotonoha the player builds an exhibition (07_REGIONS.md R4); in Manybridge, a play (R1); in the Hall, each wing is a tale.
- **Real folklore is labelled as real** (the fox's wedding, the wandering house, the grateful crane); invented tales as invented.

**Effort:** M (content).

### C10 · The festival: planning, the night, and games that stay

**What and why.**

- Robin \[R1\]: a festival planning event leading into a one-off festival with fun minigames, kimono, fireworks, and a bonding activity with the companion.
- \[R2 §6\]: the minigames survive the festival, in a building or through the companion, "not gone forever".
- Streaks and high scores are allowed in these games, as the player's own records.
- **Robin's decision (2026-10-07, C-17):** every game opens in an **untimed practice mode that gives no rewards**; a **timed mode** is opt-in.

**The Opening of the River (川開き) in Manybridge**, Chapter B's finale. Its name and fireworks come from a real Edo custom, labelled.

**1. Planning (A50).** The festival committee needs help. Each task is a different language skill, and each one visibly changes the festival:

| Task | Skill | Visible result |
| --- | --- | --- |
| Hang the lanterns along the canal | Stage-blocking from directions (W17) | The lantern line you laid out |
| Place the stalls | Routing and space (L9) | Stalls where you put them |
| Order the boat procession | Sequence (〜てから, 前に) | The procession's order |
| Send the invitations | Register (C1) | Who comes |
| Order food | Numbers and counters (C6) | The food at the stalls |
| Write the safety notice for the fireworks | Notices (W9) | People keep back from the bank |

Optional tasks add things (a second stall row, a children's corner). Nothing is required beyond the core three.

**2. The night.**

- Festival clothes: a **yukata cut** for the player, the companion and the town (C10a below).
- Walk the stalls, play the games, watch the procession.
- At the climax, watch the fireworks with the companion. A bonding scene within the existing Bond table, and the chapter's animated illustration (K2).

**3. The games.** Each has two modes:

- **Practice** (the default): untimed, no score kept, no rewards. Help never changes anything.
- **Timed** (opt-in, chosen each time): the same game against a clock, under fishing's conditions (off by default, paused by help, needed for nothing). It keeps the player's personal bests and, where natural, streaks.
- **Just for fun** (Robin, C-55): the games keep a personal record tracker, and that's it. No stamp, keepsake or other reward comes from any score or mode. The festival's *story* (setting up, the night, the fireworks) keeps its own moments and illustration.

| Game | What it is | Language | Timed mode adds |
| --- | --- | --- | --- |
| **Katanuki** (型抜き, real) | Trace a candy-sheet shape out without breaking it, on the handwriting pad | Stroke control; shapes named in Japanese | A time for the trace (the "steady hand" judgement is the same) |
| **Water-balloon fishing** (ヨーヨー釣り, real) | Hook the balloon whose label you're asked for | Reading kana or kanji labels | Balloons drift; how many in a round |
| **Ring toss** (輪投げ) | Aim at the prize whose description is read out (text and optional voice) | Comprehension of descriptions | A round of throws against the clock |
| **Word lottery stall** | Draw a word and use it in a sentence for the stall-keeper | Sentence forging (L7) | Sentences in a round |
| **Taiko** | A drum pattern from written rhythm words (ドン, カッ) | Reading onomatopoeia | Playing in time; the practice mode is a call-and-response pattern game |

- **Personal bests** are shown only in the game itself. They are the player's own, never ranked.
- **After the festival** the games move to the **festival hall** in Manybridge and to the **boat's Distractions corner** (W8). The companion can also challenge the player (tandem or versus), as Robin suggested. The Distractions list in the Wayfarer's Ledger shows them, but "Begin here" is only at a venue or with the companion ([11_CONTRADICTIONS.md](#f11) C-16).
- **No flashing:** fireworks bloom softly; reduced motion shows a held, glowing sky (spec line 264).

#### C10a · Festival clothing: a big art job, flagged early

- Today the garment *shape* (tunic, robe, coat, apron) is hard-coded in every renderer (road sprite, battle figure, portrait, Harmony bust and its painted kit). Keepsakes may change colour only.
- A **yukata cut** (based on the robe: obi, wide sleeves) touches all of them.
- **Robin (C-46): yukata are for the festival only.** The festival is an isolated event, so there is no scenario where a yukata is worn into battle, and **no Harmony art is needed** for it.
- **So the cut is smaller than first planned:** the road sprite and the portrait (and the festival's illustrations), not the battle figure or the Harmony bust. It is festival dress, put on for the festival and taken off after; not a creation option.

**Effort:** L (the festival), plus M (the cut).

### C11 · Manzai with Suzu: a double act

**What and why.**

- Canon: Suzu wants a double-act partner (相方).
- Robin calls her "a comedian at heart."
- Manzai (漫才) is a real Kansai double-act form: the funny man (ボケ) says something absurd, the straight man (ツッコミ) corrects it.

**Approach.**

- In Manybridge's Playhouse Row, Suzu (or a local double act in other routes) needs a partner for a routine.
- **The player plays the straight man.** Spot what's wrong in the funny man's line (a mis-said word, an impossible claim, a pun) and choose or build the correction.
- Comprehension of humour, wordplay, register and Kansai speech, *understood*, not imitated.
- Performed for an audience that reacts.

**In Suzu's route:**

- the routine becomes her personal arc's centrepiece;
- the player becomes her 相方 on stage;
- a companion illustration.

**Effort:** M.

### C12 · Pastimes

Robin \[R1\]: "Triple Triad / Queen's Blood style… my first thought is Shogi… Shiritori… can also be expanded upon." A collectible card game is **excluded**. Each pastime below is judged on its own merits.

#### Shogi (将棋)

**Robin's direction (2026-10-07):** build it as I see fit; Robin has never played, "so rules won't land with me immediately", and will say if something feels off. So the design starts from someone who has never seen a shogi board.

- **Canon hook.** Fuku plays shogi on Saltglass's hill bench, and a pawn still lies there. A half-finished game appears elsewhere too (sealed note S9). Fuku is the teacher.
- **A ladder, not a wall.** Each rung is playable on its own and takes minutes to learn. Nobody has to climb to the top:
  1. **Meet the pieces.** One piece at a time: its kanji with reading, how it moves (arrows on the piece), and a one-move puzzle that uses it ("Take the pawn with your silver"). Eight short lessons, in any order.
  2. **Hasami shogi** (はさみ将棋, real): a children's game on a shogi board with pawns only. Capture by sandwiching. It teaches the board before the rules of shogi proper.
  3. **The small board:** a 3×4 board with four kinds of piece, in the spirit of the children's teaching variants played in Japan. It teaches capturing and **drops** (putting a captured piece back into play), the idea that makes shogi different from chess. Built with the game's own pieces and names; the commercial teaching game of this kind has its own brand, which isn't used.
  4. **Mini-shogi** (5五将棋, real, a 5×5 variant): every idea of the full game, including **promotion**, on a board small enough to see at once.
  5. **Full shogi** with real rules (spec line 32 requires authenticity): drops, promotion, all eight pieces. Fuku starts with **handicap games** (駒落ち, real: the stronger player removes pieces), so a beginner can win.
- **Always available, never penalised:**
  - **Show moves:** highlight where a piece can go.
  - **Why?** Fuku explains the last move in a sentence at the player's level.
  - **Take back** a move in friendly games.
  - **Pieces show their kanji with readings.** Every displayed kanji needs furigana, by rule, and there is no furigana-off toggle. Learner sets with readings and movement arrows exist in Japan, so this is faithful.
- **Tsume-shogi puzzles** (詰将棋, real): bite-size "checkmate in N" puzzles at every rung, the strategy-puzzle side.
- **No clock** (no byoyomi), by the no-timer rule. Losing costs nothing; nothing in the story needs a win (G15).
- **Opponents:** Fuku and other NPCs at a few levels, with a small built-in engine (no Workers, by CSP).
- **Language value:** piece names are real kanji (王, 飛車, 角, 金, 銀, 桂馬, 香車, 歩); shogi vocabulary (王手, 成る, 持ち駒) and commentary at the player's level.
- **Pros:** deep, culturally real, a natural NPC bond; short sessions; a beginner can play the first rung at once.
- **Cons:** a shogi engine is real work; balancing levels; the board on a phone. The ladder adds lessons and two small variants to build.
- **Playtest:** Robin, as a newcomer, is the right first player. If a rung doesn't land, that rung changes.
- **Where:** Saltglass hill bench, the boat, Manybridge's Exchange hall.
- **Effort:** L (plus M for the ladder).

#### Karuta (かるた)

- **Real:** iroha karuta, where a reader reads a card and players grab the matching picture card.
- **Design.** A **turn-based** version against the companion. The line is read in text, with optional voice, and the player picks the matching card. Speed is never required (spec line 218). An *opt-in* speed mode, like fishing's, for players who want it.
- **Language value:** reading and listening comprehension of proverbs and folklore lines; a perfect fit for the folklore thread.
- **Effort:** M.

#### Shiritori v2

The existing game is a real, deep word game with per-companion stages and two bounded Bond events. Expansion:

- regional word themes (sea words after sailing, festival words);
- a festival shiritori tournament;
- new stages per new chapter.

Its contracts stay (Bond only through its two existing events). **Effort:** M.

#### Hanafuda (花札)

**Robin (C-33): "Totally in."**

- **Real:** a fixed, traditional deck of 48 cards, twelve months of four cards each, every month a flower or plant (松, 梅, 桜, 藤, 菖蒲, 牡丹, 萩, 芒, 菊, 紅葉, 柳, 桐). It is not collectible: the deck never changes.
- **The game: koi-koi** (こいこい), the most played form. Match cards by month, collect sets (*yaku*: 五光, 猪鹿蝶, 赤短, 青短, 月見で一杯, 花見で一杯 …), then choose to stop or call "koi-koi" and play on for more.
- **Teaching first,** as with shogi: a short lesson on months and flowers; matching help that highlights cards of the same month (no penalty); each yaku shown with its name and reading when it forms; untimed.
- **Points only, never stakes.** Hanafuda has a gambling history in Japan; in the game it is points and personal records, nothing else.
- **Language value:** months and seasons (一月 to 十二月, the season words), flowers and their imagery, the yaku names, counters for cards (〜枚); short seasonal poems on the cards' lore pages (real ones, labelled).
- **Where:** the boat's Distractions corner, the Manybridge festival hall, inns in Steamhollow; partners among the people of the world.
- **Effort:** M (rules engine, simple opponents, the deck drawn in the game's style).

#### Considered and not recommended

| Pastime | Why not |
| --- | --- |
| **Go** (囲碁) | Little language value beyond terms; a large engine |
| **Kendama, spinning tops** | Dexterity and timing, little language |
| **Tea ceremony** | Deep and easily trivialised; needs specialist review |
| **Origami** | *Recommended instead* as an instruction-following activity: fold by reading steps (W14). A small activity in Steamhollow or the boat |
| **Calligraphy** (書道) | *Recommended* as a brush mode on the handwriting pad (same recognition, brush rendering), for a New Year writing scene if a winter beat is added. Small |

### C13 · Hot-spring customs (in Steamhollow)

- Real customs, labelled: wash first, keep towels out of the water, no swimming.
- **Each inn's rules differ**: the public-space skill (C2).
- **Bathing scenes** are towel-wrapped, nonsexual and adults only, as Robin directs.
- **Which bath follows pronouns** (Robin, C-56; the game asks for pronouns, never a gender): she/her uses the women's bath (女湯), he/him the men's (男湯), with no question. **They/them and custom pronouns choose** at the first bath: the men's, the women's or the inn's reserved bath (貸切風呂, real and common). The game keeps that choice for every later visit.
- **Companions:** Mio and Suzu use the women's bath. Nao and Ren, who are they/them, make their own choice in character, always the same one, written once and kept; the player is never asked to choose for them ([11_CONTRADICTIONS.md](#f11) C-56).
- When the player and the companion are in different baths, they talk over the bamboo partition, a familiar onsen moment.
- **Comfort option:** "Bathing scenes: shown / summarised", for players who prefer.

### C14 · Stepping into a community's quarrel

Robin \[R1\]: "You can step in to help out a turbulent situation between a group of people, without fear of retaliation for butting your nose in."

- Built on **social encounters** (E8), with cultural framing: neighbourhood disputes, family disagreements, rival inns.
- **Every region gets one.** None punishes the attempt to help.

### C15 · The press: composing stories readers react to

**What and why.**

- Robin \[R1\]: "players could craft stories from building blocks of words, without restraint, and not necessarily be graded on its correctness up front. They would experience their rating by interacting with people around the world who happen to be reading their printed story."
- \[R2 §8\]: keep it simple, interactive and lively; take the reins.
- Astra: keep literary reception separate from language feedback.

**Approach: bounded freedom, honest reactions.**

1. **Compose** from blocks: a character, a setting, a goal, a complication, a response and an ending. Each block is chosen from authored options that unlock as the player travels (a canal boatman, a mountain courier, a festival night…). The wording of each sentence uses sentence forging (L7), so the player *writes* within supported space.
2. **Preview** the short work as a printed page.
3. **Set and print** it: a modest press interaction (ink, press, peel).
4. **Circulate:** post it at the press, sell it from a stall (no money; it is a favour economy), or leave it at an inn.
5. **Readers react** to what the story **actually contains**, from its block tags. A fisherman liked that the courier went back; a child wanted the cat to win; an innkeeper found the ending sad. A bounded number of reactions per version (about 3–5), placed on NPCs around the world, spoiler-safe.
6. **Optional proofreading workshop** at the press: language feedback on the sentences, kept entirely separate from the readers' taste.
7. **Revise** to see new reactions. No sales targets, paper stock or popularity grind.

**Why this answers "without restraint" honestly.** The space is large (thousands of combinations, and absurd or funny stories are welcome), but the game never pretends to understand text it cannot read (spec lines 182, 206). It reacts only to what the blocks tell it.

**Effort:** L.

### C16 · Apologising and making up (from Robin's C-59)

**What and why.** Robin: a quarrel never lowers Bond because it is always resolved meaningfully, and "being apologetic is part of learning the language, too." Quarrels between companions and the player, and between people in the world, are where it comes up.

**Language, by register and closeness:**

- ごめん / ごめんね, ごめんなさい, すみません, 申し訳ありません: who says which to whom, and why;
- saying what you're sorry for: 〜て ごめん, 言い過ぎた, 〜つもりじゃなかった;
- accepting and making up: いいよ, 気にしないで, こちらこそ, 仲直り;
- a formal apology between neighbours can come with a small gift (菓子折り, a box of sweets), which the scenes can show.

**How it is used.**

- **The companion quarrel** (the Steamhollow disagreement, [10_STORY.md](#f10) §8) ends in an apology scene in which the player says sorry in their own way: chosen at lower profiles, built or forged at higher ones.
- **People in the world** quarrel and make up in side quests, giving the player apologies to read and, sometimes, to help word.
- **Never scored for politeness** (an exclusion). Each apology the player gives has an outcome the story explains: a stiff 申し訳ありません to a close friend gets a laugh and a softer reply, never a penalty.

**Effort:** S–M (a task family on L7, plus scenes).

## 09 · Records: stamps, the travel volume, replay and pastimes

*Expansion plan, draft 7 (2026-10-08, after Robin's fifth round of answers). Planning only.*

Robin's settled decisions govern this file:

- **\[H1\]** The illustration book is **always fully viewable from the Main Menu**. Each save earns a border, sheen, holographic finish or badge on the illustrations it witnessed. Opening any illustration shows its unlock and viewing criteria. No passwords.
- **\[H3\]** Illustrations with the player in them are high fidelity and idly animated. On the Main Menu they show the Continue file's character, or the creation default with no save. In game they show the player's own appearance.
- **\[R1\]** Achievements are for meaningful moments, with detailed badges, stamps or seals. There are no trackers, except naturally earned milestones.
- **\[R2 §6\]** Within a campaign, finishing a chapter makes all its illustrations viewable, side quests included; finishing the main story makes all of the chosen companion's. Special illustrations (the Trials) can be revealed with a confirmation. Festival games remain playable.

### What exists today (audit summary)

- **Fourteen illustrated sequences** exist; seven are "kept memories".
  - Each save counts every viewing in `s.seq`, **even skipped ones**.
  - Kept memories store lines and the cast's looks, and replay read-only from Company › Shared memories.
  - A developer viewer already plays any sequence with a fixture look and story branch (`?dev=sequences`): most of a Main Menu gallery's machinery.
- **The prologue's viewed state is a device setting**, and it cannot be replayed.
- **There are no achievements, stamps or global unlocks.** Slot `meta` has no appearance.
- **The Wayfarer's Ledger (the pause menu, called the folio in the code) has five tabs** that already scroll on phones. The Words index has up to 13 entries; Journey has up to 7 sub-pages.

---

### K1 · The Road Stamp Book (achievements)

**What and why.** Robin wants meaningful records with visual badges, stamps or seals, never chore counters.

**The idea.** Japan has a real, much-loved custom of **commemorative stamps** at stations and landmarks (駅スタンプ and their cousins): travellers press an ink stamp into a book at each place. The plan makes achievements into a **stamp book**:

- every achievement is a stamp with its own design;
- many are pressed *in the world*, at a real stamp stand at the place where the moment happened.

It is a cultural custom (labelled, secular), a tactile little ritual, and a record that looks like a journey.

**Which moments earn a stamp** (all naturally reached or deliberately chosen, never grind):

| Family | Examples |
| --- | --- |
| **Chapters and regions** | Each chapter completed; each region's people helped |
| **All side quests of a region** | Counted by the route taken: mutually exclusive outcomes count as done (Astra) |
| **Dungeon families** | Each optional dungeon; every Atlas survey; each superboss |
| **The Hall of a Hundred Tales** | Each wing; all ten |
| **Roads and sea** | All of a road's events; the maiden voyage; every port |
| **Pastimes** | Played each festival game once (not scores); first shogi win; first finished karuta game |
| **Natural milestones** (Robin's allowed kind) | "Used 15 different responses"; "Asked someone to explain"; "Found a second way through a puzzle" |
| **Language** | First mastery star in each input type; first "Things I can do" entry in each family |

**Rules.**

- **No streaks, no "flawless", no timed records** (excluded).
- **No stamp requires a particular input mode or going without help**, except mastery stars, which are records of their own (L3).
- **Hidden stamps show their criteria** in neutral, spoiler-safe words ("A side story in Chapter 7").

**Home:** Journey › Stamp book.

**Effort:** M.

---

### K2 · The travel volume

**What and why.** Robin \[R1\]: full-page, full-screen illustrations of memorable moments, at "the same fidelity as the painterly mockup style… used in our Harmony mockup":

- chapters and key events;
- weighty side quests;
- companion events and bonding;
- each Trials wing;
- several per companion, varying with how they bonded.

\[R2 §7\]: animated, "a still-frame, idling animation like the Main Menu background". The player is in them: "You were there."

**Contents (proposed; about 60–70 pages, sized against the budget in S6):**

| Section | Pages |
| --- | --- |
| **Chapters (10)** | 2–3 per chapter: the arrival, the turning point, the resolution |
| **Side stories** | About 12, chosen for weight, including outcome variants |
| **Companions** | Per companion: 4 bond moments + 1 per ending variant (variants come from the ending's choices, never from a "bad bond": Astra) |
| **The Hall** | 10 wings + the Hundredth Tale |
| **Superbosses** | 1 each |
| **Sea log** | Voyage entries (text with small vignettes, not full pages) |
| **Cartographer's Atlas** | Survey maps (D7) |

**Living illustrations.** Robin's fireworks example sets the target. The animation is subtle and looping, never a cutscene:

- fireworks bloom;
- light moves across faces;
- clothing settles;
- someone gestures.

**Reduced motion** shows the held frame.

**Production (flagged now, made in the art pass).**

- Each illustration with the player needs **player layers in the scene's pose**: body, garment cut, hair, face, accessories, recoloured like the Harmony kit.
- Today's Harmony kit is 183 files for *one* pose family, so each full scene is a substantial layered-art job, as Robin noted in H3.
- **Scene-specific clothing is allowed** (festival yukata): the scene chooses the garment; the player's skin, hair and accessories carry over (Astra).
- **Other people in an illustration stay fixed.** A Suzu scene shows Suzu even when the Continue save travels with Ren (Astra).
- **Interim:** until the art pass, each page shows a code-drawn composition at today's standard, so the system can be built and tested.

**Effort:** L (system); the art is XL, in the art pass.

---

### K3 · The witnessed mark: the player's own seal

**What and why.** H1: each save marks the illustrations it actually witnessed: a border, sheen, holographic finish or badge.

**Proposal: a personal seal.**

- The player has a **name seal** (判子 / 印鑑, real), stamped in red in the corner of every illustration they witnessed. In this world, a seal *is* a name: the existing story already says that lending a seal is lending your name.
- **The seal is designed at creation**, or later, for older saves, from a few frames and the player's name in kana.
- **The seal is also used in the game:** to sign a contract (C8), stamp a travel paper (the Cloudroad), and claim the boat (W7).
- **An optional sheen** (Robin's holographic idea) is a setting. Reduced motion turns it into a static glint.
- **Witnessing rules** (Astra):
  - *witnessed* means the moment happened in this campaign;
  - **skipping the scene still counts** (the moment happened);
  - **using help still counts**;
  - no "watch for N seconds" requirement.

**Effort:** S–M.

---

### K4 · Viewing: in the Wayfarer's Ledger and on the Main Menu

| Where | What is viewable | Marks shown | Player appearance |
| --- | --- | --- | --- |
| **Wayfarer's Ledger, Journey › Travel volume** (not in battle) | In-campaign availability (R2 §6): completed chapters' pages, side stories included; the chosen companion's full set after the story; revealed Trials pages | This save's seals | This campaign's player |
| **Main Menu › Travel volume** | **Everything** (H1), behind a spoiler veil (K5) | **The Continue save's** earned effects on each illustration: its border, sheen, holographic finish or stamp (Robin, C-52) | **The Continue save's** appearance (slot `meta.look`; the creation default if there is no save), fixed while the volume is open |

- **"Opening any illustration shows its unlock and viewing criteria"** (H1): every page's caption says how it is witnessed ("Chapter 4: the main story") and, for veiled pages, how to reveal it.
- **Device data:** only *which pages the player has unveiled* on the Main Menu (a viewing preference, beside `prologueSeen`). It never creates a witnessed mark (S3).

---

### K5 · Spoilers: veiled until you choose

**The contradiction.** "Always fully viewable" \[H1\] meets Robin's own wish to avoid spoilers (Robin is mid-Chapter 2 now), the existing "no future reveals" rule (HX52), and Astra's note that available need not mean "an unprotected thumbnail".

**Proposal.**

- On the Main Menu, pages not yet witnessed in any existing save are **veiled**: blurred, with only the neutral criteria visible.
- **One press reveals a page**, or a whole chapter's pages, after a one-line confirmation: "This shows a moment from Chapter 7."
- Revealing stays revealed (device preference) and can be re-veiled.
- **A setting, "Show all illustrations unveiled", lets players who don't care about spoilers skip the veil.**

This is a design choice for Robin to confirm ([11_CONTRADICTIONS.md](#f11) C-20).

---

### K6 · Replaying moments

**What and why.** Robin \[R2 §6\]: chapter replay "may not necessarily be a bad idea… players would need forethought to save before a moment they didn't know about."

**Approach, in three tiers.**

1. **Watch it again** (exists for kept memories): extend to **every illustrated sequence and every travel-volume page that has a scene behind it**.
   - Read-only, from the Wayfarer's Ledger and the Main Menu.
   - The Main Menu uses fixtures: the illustration's companion and a neutral branch, as the developer viewer already does.
   - **Never changes any state** (HX49).
2. **Scene replay** for selected non-illustrated scenes, needing a side-effect-free mode for the script runner. It doesn't exist yet; M effort.
3. **Chapter Journey** (proposal, for saves of the twelve-chapter edition; old saves don't continue, C-02):
   - **What it is.** Start a *new campaign in a free slot* at the start of any chapter this save has completed, carrying the save's learning, appearance, keepsakes and records (like New Game+).
   - **Earlier choices** take documented defaults, labelled "a retelling", so no false history is claimed.
   - **Why it's useful.** It lets a player revisit a chapter or see another outcome without having saved in advance.

   A plan proposal, not a contradiction: build it if Robin wants it.

**Effort:** M (1), M (2), L (3).

---

### K7 · Distractions

**What and why.** Robin \[R2 §6\]: festival games and pastimes stay available, "in a building somewhere… or via your companion… or from the Ledger in a 'distractions' tab." **Robin (C-16, 2026-10-08):** with hanafuda, shogi, shiritori and more, the pastimes need one central, well-made place in the Ledger: their own pages, outside Company, labelled **Distractions**.

**Current rule.** The practice index "never launches a physical activity remotely": "Begin here" appears only on site.

**Approach (keeps that rule).**

- **A Distractions tab** in the Wayfarer's Ledger (K10): an index of every pastime the player has met.
- **Each pastime has its own page**, drawn like a picture on the Ledger's paper: code-drawn key art around the page that evokes the game (a shogi board's corner and a few pieces; hanafuda cards fanned at the edge; a shiritori chain of words winding round the margin; a festival lantern and a ring-toss post). On the page: what the game is, how to play (a short illustrated how-to), **where to play it**, and the player's personal records.
- **If the companion can play it, it is offered here** ("Play with Suzu"), not on the Companion tab. Companion games start anywhere safe, as shiritori does today: karuta, a festival booth game in tandem, shogi on the companion's travel board, hanafuda on a cloth.
- **Place games start at their place:** the festival hall, the boat's corner, the Exchange hall, Fuku's bench. Their page says where.
- **Personal records** are shown here and in each game, never ranked (G11); the festival games are just for fun (C-55).

**Effort:** M (the pages and their art), on top of each game.

---

### K8 · The companion's illustration set

- **During the story:** each companion has their bond moments (4) and ending variants.
- **On finishing the main story:** *all* of the chosen companion's pages become viewable in that campaign (R2 §6), witnessed ones sealed.
- **Other companions' sets:** on the Main Menu (all viewable, H1). Their seals come from saves that travelled with them, through New Game+ or other slots.
- **Ending variants come from the ending's own choices** (what the party decided at the end), never from a "you cared less" ladder (Astra; the existing ending has no good or bad branches).

---

### K9 · New Game+ and records

**Robin's definition (C-54, 2026-10-07).** New Game+ keeps personal learning records, mastery stars, illustrations and other personal metadata; never character or story progression; no satchel equipment or items. It is offered at the end of the game by default, and it opens with a farewell from the companion ([10_STORY.md](#f10) §9a).

| Carries over | Never carries over |
| --- | --- |
| The learning record and evidence log; "Things I can do"; mastery stars | Story flags, quests, chapter progress, map knowledge |
| Illustrations and their witnessed seals; the travel volume | The companion and Bond; the pet |
| The stamp book | Satchel equipment and items, keepsakes included (C-66) |
| Pastime records: shiritori, shogi, hanafuda, karuta, festival personal bests | Inkweaving words learned in the story; field-puzzle and Atlas progress |
| Settings; the noted-words notebook; the keepsake catalogue's "found" record | Known details and lore notes, which belong to the story's discoveries |
| The traveller as they are: name, pronouns, appearance, and the bath choice for they/them and custom pronouns (C-66) |  |

- **One journey's book across runs.** A player who travels with every companion fills one book: Robin's "complete the story with all of them".
- **Changes from today's New Game+:** keepsakes (cosmetics), lore notes and the Atlas's cosmetic rewards stop carrying (Robin, C-66), and the stamp book, seals, stars and pastime records start carrying.
- **Which slot and which farewell** (C-66): the player chooses the originating save's own slot or another; the farewell is always the originating save's companion.
- **The spec** requires the carryover to be defined (line 252); this table is the definition.

---

### K10 · Fitting it all into the Wayfarer's Ledger

New pages (Travel volume, Stamp book, Mastery, What I can do, Ways of speaking, the sea chart) would overflow the Wayfarer's Ledger if each became a tab; the pastimes earn a tab of their own (K7).

**Proposal: group the sub-pages, and add one tab, Distractions** (Robin, C-16).

| Tab | Sections |
| --- | --- |
| **Journey** | Quests & notes · Dialogue history · **Travel volume** · **Stamp book** · Cases · *Mementos* (Keepsakes, Practice mementos, Fishing notes merged into one page with sections) · The Pages We Keep |
| **Words** | *My learning:* Progress · **Mastery** · **What I can do** · Noted words · Kept sentences · *Reference:* Kana · Kanji · Grammar · Lore · **Ways of speaking** · Creatures met · *Practice:* Ways to practise · Letters · One word, two moments |
| **Satchel** | Unchanged |
| **Map** | Route chart · **Sea chart** · Known details |
| **Company** | Companion · Pet · Shared memories |
| **Distractions** | One page per pastime: shiritori, shogi, hanafuda, karuta, the festival games, fishing's records (K7) |

Words becomes a three-section index rather than a flat list. The layout audit (448/448 English, 168/168 Japanese labels) re-runs on it.

**Effort:** M.

## 10 · Story: more chapters, the Hush, companions and the postgame

*Expansion plan, draft 7 (2026-10-08, after Robin's fifth round of answers). Planning only. Spoiler-safe: the existing Chapters 3–6 appear only as the spec describes them. Every decision that depends on their contents points to a numbered note in SEALED_STORY_NOTES.md, which you should not open until you've finished the game.*

### 1. Robin's direction

- **Length is not a hard cap** \[R0\]. "We can bring it up to a solid 10, or double it to 12 if we want The Hush to feel more epic, something drowned in folklore and mystery, and for us to ultimately remove the threat of the Hush from the world, while still maintaining our problem solving adventure thereafter" \[R1\].
- **More main chapters are "not critical, but a desire for later"** \[R2 §10\].
- **Robin's working assumption** \[R2 §10\]: dispatching the Hush by the end can still leave lingering effects in regions not yet resolved. "If the story differs from my assumption here, it can be reviewed later." Sealed note S10 compares this with canon. In short, the assumption **fits the existing ending well enough to build on**, with one nuance recorded there.
- **Other side regions are welcome as true postgame content** \[R1\].
- **Robin's decision (2026-10-07): twelve chapters** (C-01). Old saves don't continue into the new edition (C-02).

### 2. The constraints

| Constraint | Source | Consequence |
| --- | --- | --- |
| "Build six substantial chapters" | spec line 38 | Amended to twelve (C-01, decided) |
| The Still Archive is "the final connected dungeon and story climax" | spec line 52 | New chapters go *before* it, never after |
| "The final story resolution must remain resolved" | spec line 242 | No sequel threat that undoes the ending |
| Saves from before the new chapters | C-02 (decided) | They don't continue in the new edition; they are never deleted (§9, C-54) |
| Battle music rises strictly by chapter | audio rule ZM2 | Re-tier the music ladder for twelve chapters (C-22) |
| Bond table: exact, capped at 12 | docs/addendum/company.md | New chapters' bond events need a rebalanced table (C-32) |
| Two adventurers, always | spec lines 70, 290 | Amended: a story beat may separate them briefly; the same companion always returns (C-12, decided) |

### 3. How chapters are added

Of draft 1's four options, the one that fits Robin's decisions is **A + C**: new chapters inserted *before* the finale (A), with the Hall of a Hundred Tales, the small ports and the new settlement as postgame (C). Adding chapters *after* the ending (B) stays rejected: it would undo "remains resolved".

### 4. The twelve chapters

| # | Region | Status | Premise (spoiler-safe) |
| --- | --- | --- | --- |
| 1 | Reedwake | existing | The spec's: a riverside village recovering from a storm; the missing-name phenomenon; the companions; the mill |
| 2 | Saltglass | existing | The spec's: a working harbour; labels, letters, contradictory directions; tides and ferry routes |
| **3** | **Manybridge: Eight Hundred Bridges** | **new** | Bridges forget their names; a canal city's trade breaks down; the first sign the phenomenon spreads through *printed* names |
| **4** | **Manybridge: Blockprint and Footlights** | **new** | The printers' blocks go blank at the source; a theatre loses its characters' names; the river festival |
| 5 | Cinder Orchard | existing (was 3) | The spec's: a festival history that contradicts memory; terraces, workshops, a sealed glass kiln |
| 6 | Snowbell | existing (was 4) | The spec's: a mountain hamlet near an observatory; weather, isolation, correspondence, an old promise |
| **7** | **The Keepers' Road** | **new** | The old lantern-keepers' road through the hills: where Tsuru's teacher learned, how the keepers first named しじま, and the shuttered house where they told a hundred tales. Folklore and archives that make the Hush older and stranger without changing what it is |
| 8 | Lanternfall | existing (was 5) | The spec's: an administrative town where disagreement is disappearing from speech |
| **9** | **Kotonoha, the Isle of Word-Leaves** | **new** | The island where lost words wash up. Its keepers gather drifted leaves; the party returns words to the places that lost them. Reached by public ferry, or earlier by your own boat |
| **10** | **The Cloudroad** | **new** | A mountain highway of post stations whose lanterns fail; messages garbled from station to station; the last courier; the Mist Barrier |
| **11** | **Steamhollow** | **new** | A crowded hot-spring valley whose people quarrel as the spring stirs; the party mediates; the last warm place before the end |
| 12 | The Still Archive | existing (was 6) | The spec's: the final dungeon and climax |

**Why this order, without spoilers.**

- **A city early (3–4).** After a village and a harbour, the player is ready for crowds, institutions and documents. It also brings the first hints that the phenomenon is old and widespread.
- **The Keepers' Road between Snowbell and Lanternfall (7).** Robin's "drowned in folklore and mystery": a chapter of old tellings, archives and keepers' lore. It passes the shuttered house that becomes the postgame's Hall of a Hundred Tales, so the postgame opens a door the story walked past. Sealed note S2 checks the placement.
- **The island after Lanternfall (9).** A sea chapter between two mountain stretches. By then the party has seen eight regions, so the island's drifted words have the most to draw on. Its story asks where lost words go without answering what the finale answers (sealed S5).
- **The mountains and the hot spring last (10–11).** They lengthen the approach to the finale, which is Robin's "more epic", and give the companion relationship a lively, social stretch before the end.
- **Variety.** City, orchard, mountain hamlet, keepers' road, orderly town, island, highway, hot-spring valley, archive: no two neighbouring chapters feel alike.

**Kotonoha before its chapter.** Robin's design is kept: players who finish the Harbourmaster's quest (W7) around new Chapters 7–8 can sail there early. The early visit is side content with its own small story (the keepers' apprentice). Progress made then stays made, and Chapter 9 picks up from it. Players who didn't take the quest arrive by ferry in Chapter 9 and miss nothing essential.

### 5. What twelve chapters cost, and how the plan keeps it manageable

- **Half as much new writing again as draft 1's ten-chapter outline** (six new chapters instead of four). The two extra chapters (7 and 9) reuse systems built for the others: the Keepers' Road uses the folklore and records systems (C9, K-series); Kotonoha uses the leaf-returning activity and the Root Hollows dungeon already planned in R4.
- **The music ladder** (ZM2) is re-tiered across twelve chapters (C-22).
- **The Bond table** is rebalanced across twelve chapters, cap unchanged (C-32).
- **Playtime**: about 15 hours brisk for the main story, about 40 for a new learner taking in everything (C-61, §11).
- **Ship as one edition** (C-54): all six new chapters together, so old saves are stopped once.

### 6. Making the Hush "more epic" without changing what it is

- **Seed folklore early and widely.** Every new region adds a telling of the keepers' old warnings (C9). The mystery grows by *questions*, not by new answers that compete with the existing chapters' reveals (sealed S1).
- **Scale up.** Village (1), harbour (2), **a whole city's printed names** (3–4), the keepers' own history (7), an island where the world's lost words gather (9), and a highway that links regions (10). The threat feels larger because its reach is larger.
- **Personal stakes in each new chapter** (a courier's message, a theatre's play, an inn's guest), so scale never becomes abstract.
- **Never re-explain.** New chapters show effects; the existing chapters keep their revelations.

### 6a. The Hush as a rising tragedy (Robin, 2026-10-08)

**Robin's direction.** As the story goes on, what the Hush does to each region should read as a tragedy, and the party's resolve should grow with it. By the end its effects are intense around its source, with a grand, epic feel built from the lore and mystery of the whole journey: a satisfying build-up to a satisfying climax and resolution.

**How the plan does it.**

- **A ladder, one rung per chapter.** Every chapter shows the Hush taking something larger or more personal than the chapter before: labels, then a city's printed names, then stories, memories, promises, a whole order's work, speech itself, the words of a language, the links between places. The full ladder, which leans on later canon, is sealed note S15.
- **Tragedy, not spectacle.** Each rung is shown through people: someone who lost something the player can see and name. Never a statistic.
- **Resolve, spoken.** Each chapter ends with a short exchange in which the companion's resolve visibly grows, from curiosity early on to a vow before the end.
- **The final approach is heavier.** The last chapter's road is reworked so the land itself feels the Hush: colour and sound draining map by map, the score thinning to a drone with its main theme underneath, a moment of silence that the party wins back. The existing events of that chapter stay as they are.
- **Never explained early.** New chapters show effects and deepen the mystery; the existing chapters keep their revelations (sealed S1).

### 7. Companions in the new chapters

- **Personal quests stay as they are.** Each companion also gains **a second arc** through the new chapters (Robin, 2026-10-08): a seed, pressure, a crossroads where their past offers them a way to leave, a night apart, an unfinished matter settled, and their dream at the ending. **The full design is [14_COMPANIONS.md](#f14).**
- **The Bond table** gets new events from the new chapters and the second arcs. Robin (C-32): it can grow if it needs room, since it isn't player-facing; what matters is a natural progression, with more to do by spending time with the companion and following their story.
- **Canon notes kept:**
  - Nao and Ren use they/them (Nao uses 俺 in Japanese); Mio and Suzu use she/her.
  - Suzu is a travelling comedian who wants fun, good company and a partner for her shows: a double act, not stardom (Robin, C-62).
  - No jealousy or resentment wording (an existing test enforces this). Romance is now allowed in one narrow form (§7a).
  - Unchosen candidates remain people in the world and never resent the player.

### 7a. Romance (Robin, C-63)

- **What:** holding hands and/or a kiss with the chosen companion. Nothing explicit, ever.
- **When:** a story-conclusion moment at the ending, depending on Bond; very rarely elsewhere.
- **Who:** the chosen companion only, any of the four, whatever the player's pronouns. Canon makes the companions adults, and the player is an adult traveller.
- **How it is offered** (Robin confirmed, C-67): always the player's choice in the scene, answered as the romantic moment or as the closest of friends; both warm, Bond the same either way; the companion's own consent shown in their voice. At most one earlier moment, holding hands only, after the Steamhollow reconciliation.
- **Unchanged:** no jealousy, resentment or sulking; unchosen candidates never resent the player. The companionship contract and its test change only to allow romance wording inside scenes marked as romance moments.

### 8. Separations from the companion (Robin's rule)

**Robin's rule** \[R2 §1; C-12, 2026-10-07\]. Separations can happen for story beats. The companion can't be swapped for another, rejoining is guaranteed, and nothing is permanent. A separation can build suspense and tension, or give breathing room during a disagreement; afterwards "they'll make up and be better for it, apologies and understanding abound".

**Rules for every separation.**

- **Short and authored.** At most a few maps; always ending in a written reunion.
- **No stand-in.** No guest fighter or replacement companion. While apart, help comes from the place (a stationed shelter, a lever, a rope), from the player's notes (instead of the companion's hints), and from people who advise but never fight.
- **No techniques** while apart, since a technique needs two (E18). The encounters on the way are tuned for one.
- **Never caused by the player's Japanese.** A separation follows the story, never a wrong answer.
- **The reunion** is a scene per companion, with a travel-volume page.

**Each companion's crossroads adds a night apart** (a narrative separation, not a solo stretch). The companion schedule in [14_COMPANIONS.md](#f14) §3 keeps every run to a sensible number of separations.

**Three kinds, one of each at most in the main story.**

| Kind | Where | What happens |
| --- | --- | --- |
| **Staying behind** | The Mist Barrier (Chapter 10) | The checkpoint lets the party through only when their blanked travel papers are verified. Until then one traveller must stay as surety, an old, non-violent custom. The companion volunteers; the player fetches proof from the next station and comes back |
| **In danger** | Kotonoha's Root Hollows (Chapter 9) | The tide fills a passage between them. Each has to find a way round; the player reaches the companion from the other side. Suspense, then relief |
| **A disagreement, or the companion's crossroads** | Steamhollow (Chapter 11) | For Mio and Suzu, their crossroads and night apart ([14_COMPANIONS.md](#f14)). For Nao and Ren, a short disagreement over the mediation, made up the same evening, without a separation |

**Bond.** A quarrel never lowers Bond, because it is always resolved meaningfully; making up is a Bond event, and its apologies are part of the language the player learns (C-59, decided; [08_CULTURE.md](#f08) C16).

**Spec amendment:** "Exactly two adventurers after commitment. A story beat may separate them for a while; the same companion always returns, and no one takes their place."

### 9. Existing saves and the new chapters

**Robin's decisions (C-02, C-54):** saves from the six-chapter edition don't continue once the new chapters ship. Trying to continue or load one says so first, and offers **a fresh start through New Game+** (§9a):

- "This journey began in an earlier edition of the road. It can't go on from here, but it can begin again: back to the start, with no satchel equipment or items. Your settings, learning records, mastery stars, illustrations and pastime records come with you."
- Accepting plays the farewell (§9a) with that save's companion, then starts the new run. Declining leaves the old save exactly as it was.
- Where the new run is written (C-66): the player's choice, either that save's own slot (replacing it) or another slot, with an explicit confirmation before anything is replaced.
- All six new chapters ship together as one edition, so this happens once.
- Every other update, before and after, keeps saves working as the project rules require.

### 9a. New Game+ and the farewell

**What New Game+ keeps** (Robin, C-54): personal learning records, mastery stars, illustrations and their witnessed seals, stamps, pastime records (shiritori, shogi, hanafuda, karuta, festival personal bests), settings and other personal metadata. **What it never keeps:** story or character progression, quests, the companion and Bond, satchel equipment and items, keepsakes and lore included. **The traveller stays as they are**: same name, pronouns and appearance, with nothing to re-create (C-66).

**Why it matters.** Each run can choose a different companion, and the illustrations witnessed in every run accumulate. Over several runs a player can collect every story illustration with every companion.

**Which slot** (C-66): the player chooses, either the originating save's own slot (replacing it) or another slot (keeping it), with an explicit confirmation before anything is replaced.

**Where it is offered.**

- **At the end of the game, by default.** After the ending and its epilogue, the game offers "Begin again (New Game+)" beside carrying on into the postgame. It is also in the Wayfarer's Ledger afterwards. Choosing it later is always possible.
- **From the Inn Ledger** when starting a new game, as today.
- **From an old six-chapter save** (§9).

**The farewell** (Robin's idea). Starting New Game+ plays a short scene with the companion of the **originating save**, the run the player is leaving, never the companion of a save being overwritten:

- the companion has unfinished work here and can't come; they hope to meet again;
- the lanterns along the road brighten and the road folds back on itself: the traveller is drawn back to the morning they first arrived at Reedwake;
- a slightly tearful goodbye, *for now*, never forever;
- before the new run begins, the game says plainly that the illustrations, records and stars (the "memories") come with the player.
- Four written versions, one per companion, each naming their own unfinished work in a way that fits their ending (sealed note S13). A short solo version covers an old save from before a companion was chosen.
- It gets a travel-volume page of its own: the last illustration of one run, and the first memory of the next.

**Canon fit.** New Game+ is a new timeline: the finished run's ending stays resolved (spec line 242), and the spec already allows a New Game+ with another companion choice "without breaking permanence in the original timeline" (line 252). Sealed note S13 explains why a road that folds back fits the world after the ending.

### 10. The postgame, expanded

After the ending ("The story is over. The roads go on."), in addition to what exists:

- **The Hall of a Hundred Tales** (D9);
- **Atlas commissions**: practice, themed and survey (D7);
- **Superbosses** (E16);
- **The new settlement** (07_REGIONS.md R7);
- **Kotonoha's matured state** and deepest grove;
- the **festival hall**, the **boat** and its ports;
- the final editions of Manybridge's broadsheet; the checkpoint teahouse.

None of it reopens the threat. Lingering effects, discoveries, disputes and new places carry the adventure, which is Robin's and Astra's shared position.

### 11. Length (no claims)

**Robin's targets (C-61, C-51):**

- **About 1–3 hours per chapter overall**, depending on pace and how much side content a player takes in.
- **About 15 hours** for a brisk playthrough of the main story, with later chapters taking slightly longer because they hold more.
- **About 40 hours** for a new learner who takes in the whole game: side quests, practice, pastimes, the Atlas and the postgame.

**A per-chapter budget for the brisk target** (planning guidance): 900 minutes spread so that each chapter takes a little longer than the one before, from about 55 minutes for Chapter 1 to about 95 minutes for Chapter 12 (an average of 75), inside Robin's 1–3 hours.

**What is known.** Only a content-based estimate, not a measurement: the existing six chapters at roughly 11–14 hours for a learner at a plausible pace. The targets are plausible, but unproven.

**How it is checked.** L19's instrumentation counts content per chapter; timed play by people, not estimates, decides whether the targets are met (spec: "never claim measured playtime without evidence"). Spec line 36 is amended to these targets.

## 14 · Companions: a second arc for each of the four

*Expansion plan, draft 7 (2026-10-08, after Robin's fifth round of answers). Planning only. Spoiler-safe: each companion's existing personal quest is mentioned only by chapter. The specifics of every arc below, which build on those quests, are in SEALED_STORY_NOTES.md S14.*

### 1. What Robin asked for

- **Suzu** (C-62): cross paths with members of her troupe, and have her make the hard decision to stay with the player because "the investment will be too great". It is a key separation: she reconciles her own thoughts in her own headspace, almost dismissive at first, then apologetic for making the player wait. A heartfelt night scene at a camp or an inn explains the connection, with a sombre, near-silent theme and night ambience (crickets, frogs). By the end she still wants the next act with the same partner: the double act. Resolving an unfinished matter from her past deepens her story and the Bond. She is not an aspiring star: she is a travelling comedian who wants fun, good company, and a partner for her shows.
- **All four equally.** Expanding only Suzu would leave the others thin. Each companion gets the same depth: tension, drama, heartfelt moments, and a way to circle back to the main story. Robin knows little about the others' dreams or why they keep travelling with the player. Size them up to Suzu's level, naturally: "Nothing should feel forced."
- **Robin's decision (C-68):** Suzu's arc "sounds promising"; for the other three, "I would trust your judgment in making the other three equally fleshed out." **Decided.** §4 now gives all four the same parts.
- **Corrected in draft 7.** Checking canon again for this round, I found that two of draft 6's arcs leaned on lines spoken by other characters, not by the companion. Nao's and Mio's arcs now rest on their own lines (sealed S14).

### 2. The shape every arc shares

Each companion keeps their **existing personal quest** unchanged and gains a **second arc** woven through the new chapters. Only the chosen companion's arc plays in a run; the others appear as people in the world, with small updates of their own (as today).

| Beat | What happens | Where |
| --- | --- | --- |
| **1. A seed** | Something from their past turns up: a letter, a name, a playbill, an emblem. They make light of it | New Chapters 3–4 (Manybridge) |
| **2. Pressure** | The past presses: a decision deferred, a worry they won't name. A small quarrel with the player that ends in apologies and understanding (C-59, [08_CULTURE.md](#f08) C16) | New Chapters 7 and 9 |
| **3. Their existing quest** | Unchanged | Its existing chapter |
| **4. The crossroads** | The past offers them a way to leave: a place, a role, people who want them back. They choose to stay with the player, and it costs them | One late chapter each (§3) |
| **5. The night apart** | They take an evening alone to sort out their thoughts: dismissive at first, then apologetic for making the player wait. The player spends the evening in town and then finds them; a quiet scene at a camp or an inn explains everything | The crossroads chapter |
| **6. The unfinished matter** | Settled honestly, with the player's help | The crossroads chapter, or the next |
| **7. The ending** | Their dream, spoken aloud, and how the player fits into it | The final chapter's epilogue |

**Rules.**

- **Natural, never forced.** Every beat comes from who they already are. Nothing new contradicts their existing lines (checked against the content before writing; sealed S14).
- **Always resolved.** No beat ends in resentment. Bond never drops (C-59); the crossroads and the night apart are Bond events.
- **The player is never blamed.** The past is theirs; the player is the reason they stay, not the reason they hurt.
- **Romance** (C-63, C-67): the arc's warmth can lead to the ending's moment, always as the player's choice.

### 3. Separations, kept to a sensible number

With four companions' arcs and the story's own separations ([10_STORY.md](#f10) §8), a run could fill up with goodbyes. The plan keeps it to this:

|  | Their crossroads and night apart | The story's playable separation in their run |
| --- | --- | --- |
| **Nao** | New Chapter 10, the Cloudroad: woven into the wait at the Mist Barrier | The Mist Barrier itself (it carries Nao's crossroads) |
| **Mio** | New Chapter 11, Steamhollow | The Mist Barrier (Chapter 10) |
| **Ren** | New Chapter 7, the Keepers' Road | The Mist Barrier (Chapter 10) |
| **Suzu** | New Chapter 11, Steamhollow | The Mist Barrier (Chapter 10) |

- **The Root Hollows' moment** (Chapter 9, in danger) is a brief scare inside the dungeon for every companion: a few minutes apart, not a separation sequence.
- **The night apart is a narrative separation, not a solo dungeon.** The player spends one evening in town (a few conversations, perhaps a small errand), then finds them.
- **Steamhollow's general disagreement** ([10_STORY.md](#f10) §8) becomes, for Mio and Suzu, their crossroads; for Nao and Ren, a short quarrel and making up without a separation.

### 4. The four arcs (spoiler-free)

Each arc has the same parts, so none is thinner than another: who they are, their dream, why they keep travelling with the player, a seed, pressure, a step in Chapter 10, the crossroads, the night apart, the unfinished matter, the postgame and the ending.

#### Suzu (スズ): the travelling comedian

- **Who she is, as the player first meets her:** a travelling performer who answers hard questions with a joke before an honest answer, and is meticulous about accounts.
- **Her dream** (Robin): a double act. Fun, good company, and a partner for her shows. Not stardom.
- **Why she keeps travelling with the player:** a story worth seeing to its end, and, as the arc reveals, the first person in a long time she wants to share a stage with.
- **Seed (Chapter 4, Playhouse Row):** an old playbill with her name on it, and a letter left for her at a stage door. She pockets it, laughing it off. She leaves word that she is safe.
- **Pressure (Chapters 7 and 9):** the letter, unanswered. On Kotonoha, where lost words drift, something of hers turns up among the leaves.
- **Chapter 10:** she finally sends a reply, by the Cloudroad's restored relay.
- **Crossroads (Chapter 11, Steamhollow):** members of her troupe are playing the hot-spring town. They want her back, and an old partnership is on offer. She chooses the player. "The investment's too great."
- **The night apart:** gone for the evening; brushes it off at first; later, by the inn's garden with crickets and frogs in the dark, she apologises for making the player worry and explains what the troupe means to her and why she needed time.
- **The unfinished matter:** something from her years with the troupe, settled honestly with them (sealed S14). They part as friends: they know she is safe, what they mean to her is said aloud, and their paths will cross again.
- **Postgame:** the troupe passes through the festival hall, and Suzu and the player perform their double act for them.
- **Ending:** she asks for the next act, with the same partner.

#### Nao (ナオ): the courier

- **Who they are:** a courier who knows the road west and checks the exits while seeming to listen; wry, impatient with ceremony; quietly sentimental about handwriting.
- **Their dream:** a road where letters arrive: a relay that links every town the party restored, so nobody waits for word that never comes.
- **Why they keep travelling with the player:** the biggest delivery of their life, carrying names back to where they belong.
- **Seed (Chapter 3, Manybridge):** in the dead-letter office under the Exchange, a bundle held for "the courier Nao", forwarded under an old relay emblem. Nao pockets it unopened, with a joke about fan mail.
- **Pressure (Chapters 7 and 9):** in the Keepers' Road registers, the name of the old courier who taught Nao the road west; on Kotonoha, a stray letter in a hand Nao knows. Nao reads it alone and says nothing yet.
- **Chapter 10:** the bundle's sender is on the Cloudroad, still waiting.
- **Crossroads (Chapter 10, the Cloudroad):** that old courier keeps the last lit station below the Mist Barrier and asks Nao to take it over: a post where letters come to Nao, a place people can find them. Nao chooses to finish the road with the player, and says so face to face rather than by letter.
- **The night apart:** "I need to run this one myself." Nao runs the last leg of the restored relay alone, carrying a reply written by hand, and delivers it in person. Then the station's porch at night: a mountain stream with kajika frogs, wind in the cedars, a horse bell far below.
- **The unfinished matter:** the letters Nao has let wait (sealed S14).
- **Postgame:** the relay runs end to end, and Nao carries the player's letters in it.
- **Ending:** Nao leaves a forwarding address for the first time, and lets the player choose where it is.

#### Mio (ミオ): the apothecary

- **Who she is:** Reedwake's apothecary, gentle with frightened people, stubborn when kindness would become dishonesty, with a fierce, funny temper when someone is condescending.
- **Her dream:** a dispensary where anyone can come in, and where she can say what is true about every remedy.
- **Why she keeps travelling with the player:** she meant to help one village; the road keeps needing help, and with the player she is learning that helping is not the same as never refusing.
- **Seed (Chapter 4, Manybridge):** a tonic seller's playbill promising "cures" for every ailment of a far-off hot-spring valley. Mio's temper, and an old letter in her bag that she doesn't mention.
- **Pressure (Chapters 7 and 9):** a lone keeper's health on the Keepers' Road, which she cannot stop tending; on Kotonoha, labels without bottles, other people's undecided things.
- **Chapter 10:** a message on the relay from the springs: "Come and see us."
- **Crossroads (Chapter 11, Steamhollow):** a healer who knew her mother, retiring, offers her the dispensary of the springs: respected, settled, wanted. She chooses the road, for now.
- **The night apart:** a long night tending a patient alone ("I'm fine. Go to bed."). At dawn by the steaming footbath she answers the old letter at last and apologises for shutting the player out. Frogs in the terraced paddies below, steam from a vent, a bamboo spout ticking into a basin.
- **The unfinished matter:** the letter she never answered (sealed S14).
- **Postgame:** the healer visits the festival hall, bringing something for Mio's shelves.
- **Ending:** her own dispensary, with an honest label on every shelf.

#### Ren (レン): the lantern keeper

- **Who they are:** Reedwake's lantern keeper, earnest and precise, unexpectedly funny when comfortable, and terrible at directions.
- **Their dream:** every dark lantern on the old roads relit, and a keeper's life lived on the road rather than behind a door.
- **Why they keep travelling with the player:** lanterns are going dark everywhere, and a keeper goes where the dark is.
- **Seed (Chapter 3, Manybridge):** the bridges' name plaques, cut by a lantern guild whose mark Ren knows.
- **Crossroads (Chapter 7, the Keepers' Road):** Old Hisae, the road's last keeper, offers Ren the keepership of the road: an order's post, a lodge, belonging. Ren chooses to finish the road with the player first.
- **The night apart:** a vigil kept alone at the lodge, dismissed as "keeper's business", then explained over the last lit lantern. Bell crickets in the pampas grass, an owl, wind in the lantern shutters.
- **The unfinished matter:** an old lantern of Ren's own, on that road (sealed S14). It is kept separate from Ren's existing personal quest, which stays exactly as it is (sealed S2, S14).
- **Pressure afterwards (Chapter 9):** the oldest lanterns, half-buried in Kotonoha's sand, carrying names only Ren can read.
- **Chapter 10:** Ren relights the Cloudroad's station lanterns, and word comes by the relay that the Keepers' Road is lit at every post again.
- **Postgame:** Ren and Old Hisae walk the Keepers' Road together on the night its lanterns are lit.
- **Ending:** the road relit, and Ren's answer to Old Hisae.

### 5. Music and staging for the night apart

- **A family of quiet cues**, one shared motif with a variation per companion: sombre, near-silent, a few sustained notes and long rests (Robin's direction). It sits apart from the battle ladder (§ music in [07_REGIONS.md](#f07)).
- **Night ambience synthesised in the game's own audio engine** (no recordings), different for each companion's night (§4): Suzu, crickets and frogs in an inn garden; Nao, kajika frogs in a mountain stream and wind in the cedars; Mio, frogs in terraced paddies, a steam vent and a bamboo spout; Ren, bell crickets, an owl and lantern shutters in the wind.
- **Staging:** a fixed, still composition; slow idle animation (breathing, a lantern's flicker, steam); no camera movement; text paced slower than usual. One travel-volume illustration per companion.

### 6. Bond

- **Robin (C-32):** the Bond table can grow if it needs room; it is not player-facing. Whatever gives Bond a natural progression, with more to do by spending time with the companion and following their story.
- **So:** the seed, the quarrel and making up, the crossroads, the night apart and the settled matter each add Bond; so do optional moments (Distractions played together, invitations, rest topics). The table is rebalanced across twelve chapters with room to grow; Bond still never drops.

### 7. Building it

- **Where:** each arc's beats are built with its chapter (12_ROADMAP.md phases 7, 7b, 8 and 9).
- **Canon check:** before any line is written, every canon line an arc relies on is checked for its *speaker* as well as its words (draft 6's two misreadings came from lines spoken near the companion, not by them).
- **Tests:** a focused run per companion through their beats (Robin's cadence: companion content is tested with that companion); saved-state fixtures for each crossroads and night apart; the Bond table's curve checked so the cap still arrives late and naturally.
- **Art:** one illustration per companion for the night apart, one for the crossroads, one for the ending's dream; interim art first, the painted pass last.

## 12 · Roadmap: a drafted order of execution

*Expansion plan, draft 7 (2026-10-08, after Robin's fifth round of answers). Planning only: phases begin only when Robin authorises them.*

Robin said time and difficulty are no issue, so the order below is chosen for **quality and risk**, not speed:

- foundations before content, so each region is built once, on finished systems;
- one complete example of a new format before many (one Hall wing before ten);
- the art pass last, as Robin asked.

Effort sizes (S, M, L, XL) are relative scope including content and testing, not durations.

### Overview

| Phase | Name | Main contents | Gate to start |
| --- | --- | --- | --- |
| **0** | Listen and decide | Robin's playthrough feedback; the remaining addendum reviews; the open and to-confirm items in [11_CONTRADICTIONS.md](#f11) (part A3, part B); spec amendments written | Robin finishes the playthrough |
| **1** | Quick wins | ~~The audit's defects~~ (done 2026-10-07); **Harmony's sound** (E21); the one-guess handwriting pad (C-14); the two Ledgers' names (C-58); honest response previews in combat (E5); measuring what players meet (L19); load-time measurement (S6) | C-64 for E5's scope |
| **2** | Language foundations | The evidence log, assistance categories, mastery exams and stars, word pages, sentence forging, validator upgrades, the review ledger | — (C-13, C-14 decided) |
| **3** | Encounter engine | The actor model; Wait; conditions; arrivals; wanderers; objectives; procedures; social encounters; Resolve this step; story-dungeon help; **battles: numbered turns, two-move turns, silencing, companion growth, more creature kinds, reasons to fight roaming creatures** (E22–E26); **modifier words: the system, the battle panel, field rules and the first lessons** (E27) | C-72, C-73 (C-08, C-09, C-60, C-69 to C-71 decided) |
| **4** | World systems | Story phases, seeded streams, change beats, routines, "have you seen…?", road events, return keys | — |
| **5** | Records | Stamp book, travel volume (interim art), personal seal, Main Menu gallery, replay, the **Distractions** tab and pages, the Wayfarer's Ledger's regrouping; **New Game+ redefined, offered at the end, either slot, with the originating save's farewell** | C-20, C-19 (C-34, C-54, C-66 decided) |
| **6** | Expeditions | The expedition framework, persistent condition, previews, Atlas commissions as Atlas run types, varied rooms inside each run's fixed shape, delvers, a pilot side dungeon | — (C-03, C-04, C-18, C-57 decided) |
| **7** | Manybridge (new Chapters 3–4) | The edition boundary (behind a development switch); the city; the press; the stage; manzai; the festival; the yukata cut; the Unravel lesson at the Tally Exchange; the companions' arc seeds; *tried* marks on cards; **modifiers それぞれ and いくつか (Unravel's growth)** | C-74 (C-22, C-32, C-54, C-55, C-60, C-64 decided) |
| **7b** | The Keepers' Road (new Chapter 7) | The keepers' road, the scriptorium, the vigil; folklore and records systems in use; Ren's crossroads; **Protect's growth (すべて)** | C-74 |
| **8** | The sea and Kotonoha (new Chapter 9) | The Harbourmaster's quest, sailing, the boat home, Sazanami, East Landing, Kotonoha's early visit and main chapter; the arcs' pressure beats; **modifier あらゆる** | — |
| **9** | The Cloudroad and Steamhollow (new Chapters 10–11); **the edition ships** | Both chapters; Nao's, Mio's and Suzu's crossroads and nights apart; the separations and the apology scene; **the final chapter's approach reworked** (the Hush at its heaviest; its own themes); the baths; the ending's romance moments; **modifiers ごとに and 全体**, and the ones found off the beaten path; the twelve-chapter edition released at once, with timed play against the playtime targets | — (C-56, C-59, C-61, C-63, C-65, C-67 decided) |
| **10** | The postgame | The Hall of a Hundred Tales (one wing, then ten); superbosses; the Trials' modifiers (永遠に, 無限に); the new settlement; pastimes (shogi, hanafuda, karuta, shiritori v2); the Cinder festival revisit | — |
| **11** | Expressive portraits, second round | The portrait ideas Robin left for later: systems only; the drawing belongs to the art pass | Robin asks |
| **12** | Language review | Self-review of all new Japanese against references, recorded in the review ledger; a native reader if one ever becomes available | — |
| **Z** | **The final art pass** | Outlined only, as Robin asked | Robin: "I'm happy with the final product" |
| **Final** | Final validation | The full 16-combination matrix and every audit on the art-complete build | Robin calls it |

---

### Phase 0 · Listen and decide

- **Robin's full playthrough feedback** comes first. It may reorder everything below.
- **The remaining addendum items** that need Robin's eyes: HX33, HX43 and HX45 (scenes and sequences at play speed), WI5 and WI26 (gestures and portraits at play speed). They are recorded in docs/expressive/CONTRACT.md.
- **Decisions:** all of [11_CONTRADICTIONS.md](#f11) parts A to A4 and B were answered on 2026-10-07 and 2026-10-08, and part A5 (C-68 to C-71) on 2026-10-08. Still to come: three readings to confirm in part A6 (C-72 to C-74).
- **Spec and contract amendments** written for the decisions taken ([02_FOUNDATIONS.md](#f02) S8), and REQUIREMENTS IDs reserved for each feature.
- **The open Harmony question** (one technique or charges) decided. The plan recommends keeping one technique (E18).

### Phase 1 · Quick wins (independent of the expansion's scope)

| Item | Why now |
| --- | --- |
| **E5** honest "effect here" line on every response card | Robin expects it; it teaches; small |
| ~~**Defects**~~ from [11_CONTRADICTIONS.md](#f11) part D | **Done 2026-10-07**, with tests (VALIDATION.md) |
| **Harmony's sound** (E21): a shared arrival sound and one accent per companion at their peak; none on Instant | Robin plays with the cut-in now and found it empty without sound |
| **The one-guess handwriting pad** (C-14): one guess per character, free redraws, "Show more suggestions" marked as assisted | Robin decided it; it changes how help is recorded, so it comes before stars |
| **The two Ledgers' names** (C-58) | A few labels, once Robin confirms the names |
| **L19** measure the language interactions a playthrough meets | Answers Robin's first question with data |
| **S6** load time and memory in Firefox and on the foldable | The ceiling is 100 MB (C-21); this checks the phone stays quick |

**Tests:** focused unit and browser tests per fix; F/Ren once at the end of the phase.

**Effort:** M.

### Phase 2 · Language foundations

- **The evidence log** (L1), with the new kanji and construction kinds and the migration.
- **Assistance categories** (L2), with C-14's rule.
- **Mastery exams and stars** (L3), **word, kanji and kana pages** (L4) and **"What I can do"** (L5).
- **Spacing by days** (L6) if approved, and **the kanji chart's record** (L20).
- **Sentence forging** (L7): engine, judge (generalising the letters' reply families), support ladder, authoring templates.
- **The L8–L17 task families**: templates and judges, with one worked example each at all four profiles.
- **Validator upgrades and the review ledger** (S5).

**Tests:**

- unit tests for every judge and the migration;
- browser tests for each task family on fixtures;
- F/Ren (the record changes touch every answer).

**Effort:** XL.

### Phase 3 · Encounter engine

**Contents:**

- **E1, the actor model.** First as a pure refactor: every existing battle test passes unchanged before anything new uses it.
- Then **E9** (Wait), **E4** (conditions, with the curve test extended), **E2** (arrivals), **E3** (wanderers), **E6** (objectives), **E7** (procedures), **E8** (social encounters), **E10** (companion options and plans), **E11** (Resolve this step), **E13–E15**, and **E19** (story-dungeon help).
- **E12** (two-row formation) only when a set piece needs it.
- **Battles, from Robin's notes (E22–E26):** numbered turn order with each move's target shown; two-move turns and two-round plans; silencing by Hush creatures only, always inferable; companions' growing action sets; the roaming creatures' lost words and notable creatures. New creature kinds arrive with their regions' phases.
- **Modifier words (E27):** the system, the response panel's modifier row and option step, field-puzzle rules, the phrase recording (only what was written counts as written), and the lessons; each modifier's content arrives with the chapter or place that teaches it, the two growth moments (Unravel reaching two, Protect covering both) with Chapters 4 and 7.

**Tests:**

- the battle suite;
- the curve test extended to twelve chapters, two-move turns, silencing and modifiers (battle length kept, no modifier dominating, Unravel alone still winning; Relaxed untouched);
- the difficulty curve with conditions and arrivals;
- the geometry audit (with 4–5 actors if E12 is built);
- new encounter-type tests on fixtures;
- F/Ren.

**Effort:** XL.

### Phase 4 · World systems

**Contents:**

- **S1** (story phases with the validator's reveals check) and **S2** (seeded streams).
- **W1** (change beats, framework and the existing towns' first beats).
- **W2** (routines), **W3** ("have you seen…?", and saving last-seen), **W5** (road events on the existing roads first), **W6** (return keys; the sealed spots wait for the new words).

**Tests:** fixtures per phase; routine-tick tests; road-event recurrence tests; F/Ren.

**Effort:** L.

### Phase 5 · Records

**Contents:**

- **K1** (stamp book) and **K3** (personal seal: designed at creation, defaulted for older saves).
- **K2** (travel volume system, interim compositions) and **K4/K5** (the Main Menu gallery with the Continue look, spoiler veils, and the device preference for reveals).
- **K6** tier 1 ("watch it again" everywhere), **K7** (Pastimes), **K9** (New Game+ as Robin defined it: one carryover function, offered at the end of the game, from the Inn Ledger and later from old saves), and **K10** (the Wayfarer's Ledger's regrouping, with the layout audit re-run).
- **The farewell** ([10_STORY.md](#f10) §9a): four companion versions and a solo version, with interim art and a travel-volume page.

**Tests:**

- save rules: copy carries records, delete removes them, nothing is written cross-slot;
- New Game+ carries exactly the K9 table (and nothing else) from each way in; the finished campaign is unchanged;
- the Main Menu with zero, one and six saves;
- the layout audit at all viewports, English and Japanese labels;
- F/Ren.

**Effort:** L.

### Phase 6 · Expeditions

**Contents:**

- **D1–D4:** the framework, persistent condition, stations, restart rules, previews, and a proper battle hook that replaces the Atlas's MutationObserver.
- **D7:** Atlas commissions, built as Atlas run types; the Atlas keeps adapting its practice words (C-18, C-57).
- **D8:** delvers.
- **A pilot optional dungeon** in an existing region, to prove the whole loop: entrance preview, stations, persistent condition, restart, shortcuts, an apprenticeship pattern.

**Tests:** an expedition curve test (whole runs on the player model); restart and reset tests (D3a); F/Ren plus the pilot.

**Effort:** L.

### Phase 7 · Manybridge (new Chapters 3 and 4)

**Contents:**

- **S4: the edition boundary.** The edition field, old saves shown as such and never altered, new flags, the display numbering map, the save fixtures (including a Robin-like finished save), and C-54's extras if approved.
- **A development switch.** The new chapters stay off in the build Robin plays until all six are finished, so saves are stopped once, when the edition ships (C-54).
- **R1:** two chapters: maps, people, creatures, bosses, dungeons, side quests, and change beats for Reedwake and Saltglass.
- **C15** (the press), **C11** (manzai), **C10** (the festival, its planning and games), **C10a** (the yukata cut in every renderer, interim art), **C1–C8** content, and **C5** (the dialect field guide).
- **Music:** the Manybridge zone (shamisen, taiko, clappers), and the ladder re-tiered (C-22).
- **Bond:** the table rebalanced (C-32).

**Tests:**

- F/Ren through the new chapters;
- a focused companion test for each companion's Manybridge beats;
- profile-specific checks for the festival tasks;
- the save fixtures;
- the layout audit for new screens.

**Effort:** XL.

### Phase 7b · The Keepers' Road (new Chapter 7)

**Contents:**

- **R8:** the keepers' road, the lodge and its scriptorium cave, the vigil and its boss, five side quests, and the change beats; Old Hisae; the shuttered hall the postgame opens.
- **C9** folklore told several ways, and the records it feeds (stamps, travel-volume pages).
- **Music:** a biwa-led zone, tiered in the twelve-chapter ladder (C-22).
- **A-profile classical phrases**, limited to well-attested set phrases, glossed and labelled.

**Tests:**

- F/Ren through the chapter;
- all four profiles for the tellings (content that depends on the Japanese level);
- a focused Ren test (their beat must not touch their personal quest);
- saved-state fixtures for The Keeper Who Stayed's outcomes.

**Effort:** L.

### Phase 8 · The sea and Kotonoha (new Chapter 9)

**Contents:**

- **W7:** the Harbourmaster's quest (stages across chapters), the sea map and boat mode, sea situations, and the travel log.
- **W8:** the boat home.
- **R6:** Sazanami and East Landing.
- **R4:** Kotonoha's early visit (side content), its main chapter (9) with the Root Hollows and the "in danger" separation, then postgame.

**Tests:**

- the sailing mode (keyboard, touch, skip, story events in skip mode);
- Kotonoha at each phase from fixtures, and Chapter 9 played with and without an early visit;
- F/Ren with and without the quest;
- each companion's separation and reunion in the Root Hollows.

**Effort:** XL.

### Phase 9 · The Cloudroad and Steamhollow (new Chapters 10 and 11), and the edition ships

**Contents:**

- **R2** and **R3**, including two separations (C-12): staying behind at the Mist Barrier, and the disagreement in Steamhollow, with apologies and understanding (C-59). The solo encounters are tuned for one.
- The baths by pronouns, with the comfort setting (C-27, C-56).
- **Romance moments** (C-63, C-67): at the ending for each companion, at high Bond, always the player's choice; the companionship contract and its test amended to allow them only inside marked scenes.
- **The twelve-chapter edition ships:** the development switch comes off, the playtime target is restated (C-61), and old saves show as from the six-chapter edition.

**Tests:** F/Ren; the solo section with each companion's reunion; the mediation climax's conclusions on saved-state fixtures.

**Effort:** XL.

### Phase 10 · The postgame

**Contents:**

- **D9:** the Hall of a Hundred Tales. **One wing first**, played and judged by Robin, then the other nine.
- **E16:** superbosses. **R7:** the new settlement.
- **Pastimes:** shogi with its beginner's ladder (lessons, hasami shogi, the small board, mini-shogi, handicap games, tsume puzzles), karuta, shiritori v2, and hanafuda if Robin says yes (C-33).
- **The Cinder Orchard festival revisit** (sealed note S8).

**Tests:**

- Hall wing tests: suspend and resume, reprieves, emergency retreat, floor restart;
- the shogi engine's legality tests;
- F/Ren through one wing.

**Effort:** XL.

### Phase 11 · Expressive portraits, second round (when Robin asks)

The ideas Robin left for later on 2026-10-06 (HANDOFF.md):

- **Expressions for the two-thirds of lines without a tag**, and for the player's lines. A tool *proposes* tags from each sentence; the scripts get ordinary tags after review; nothing is guessed at runtime.
- **Bigger, bouncier one-off cues per line.**
- **Body language with hand and arm layers.** The systems and timing come now; the drawing belongs to the art pass.

**Effort:** M (systems).

### Phase 12 · Language review

**Robin (C-26): no native reviewers are available.** So, continuously from Phase 2:

- **Write conservatively:** standard, textbook-attested forms; no slang or idiom that can't be checked against a reference; dialect and classical forms kept few, well attested and labelled.
- **Self-review against references** (dictionaries, grammar references, the existing lexicon), recorded line by line in the review ledger (S5) as "self-reviewed", never as "native-reviewed".
- **The validator** checks furigana, accepted alternatives and every listed answer.
- **If a native reader ever becomes available**, the ledger shows what to check first: the culturally framed lines, the dialect guide and the classical phrases.
- The game never claims a review that didn't happen (spec line 178).

### Phase Z · The final art pass (outline only)

Robin \[R2 §10, H6\]: once the content is settled, "a fresh coat of primer, paint and polish" across much of the game, towards a more distinct stylised feel. That means far more active and idle animation and a living community; the bar is the dragon-knight reference (material shading, strong silhouettes, overlapping forms, secondary motion), at a smaller scale. **As asked, this plan does not detail it.** It only records what earlier phases leave ready for it:

- **The art register:** every feature above lists its art needs (travel-volume compositions and player layers, creatures, the yukata cut, new regions' tiles and props, guests' battle figures). The register becomes the art pass's scope.
- **Interim art stays at today's standard**, never worse than its surroundings.
- **Infrastructure** (layer and attachment conventions, recolour keys, composition plans) is prepared during development, as Astra advised. Final paintings are not made early.
- **Order:** approve a visual standard → apply it everywhere → measure budgets → final validation.

### Final validation

On the art-complete build, when Robin calls it:

- the full 16-combination campaign matrix;
- the full browser suite;
- the layout audits (English and Japanese labels, every viewport);
- every performance budget;
- Firefox and the foldable by Robin.

---

### Testing throughout (Robin's cadence)

| What changed | What runs |
| --- | --- |
| Any phase's end | F/Ren full route, plus the unit suite |
| A visual adjustment | F/Ren is enough |
| A battle or encounter type | That encounter type's tests, separately |
| A puzzle, or content that depends on the Japanese level | All four profiles for that content |
| A menu system | Its triggers, tested directly |
| Content touching one companion | That companion, focused |
| Side-quest branches | Saved-state fixtures per outcome |
| The whole game, final | The 16-combination matrix, only when Robin asks |

Reason before running. Label evidence honestly: an F/Ren clear proves that route.

### Alternatives to this order

- **Region first.** Build Manybridge early and grow systems as it needs them. More visible progress, sooner. But systems built for one region tend to be rebuilt for the next. Not recommended, though reasonable if Robin wants to see new places soon.
- **Astra's order:** stronger everyday language, then physical problem-solving, then one signature region, then a ten-trial chapter, then the Hundred Rooms, then cultural and audio expansions. Close to this plan's. The main difference is that this plan puts the encounter engine and records before the first region, because Robin's review emphasised encounters and the travel volume.

## 13 · Idea register: where every idea went

*Expansion plan, draft 7 (2026-10-08, after Robin's fifth round of answers). Planning only.*

Robin asked to "leave nothing unaccounted for." This register traces every idea in the consultation to a plan item, or records why it was excluded or folded into another. Statuses:

- **Planned:** an item in this plan.
- **Merged:** folded into another item.
- **Excluded:** Robin excluded it.
- **Not recommended:** this plan argues against it; Robin can overrule.
- **Decided:** Robin answered the related question on 2026-10-07 (11_CONTRADICTIONS.md part A).
- **Robin's decision:** still waiting on an open question in 11_CONTRADICTIONS.md (part A2).

### 1. Astra's sixty proposals

| # | Proposal | Robin's position | Plan item | Status |
| --- | --- | --- | --- | --- |
| 1 | Meaning-first sentence forging | A: solid | L7 | Planned |
| 2 | Scene-to-sentence | A: solid | L8 | Planned |
| 3 | Particle-powered routing | A: solid | L9, Manybridge barges | Planned |
| 4 | Verb-transformation mechanisms | A: solid | L10 | Planned |
| 5 | Reference detective | A: solid | L11 | Planned |
| 6 | Asking back | A: solid | L12 | Planned |
| 7 | Paraphrase bridges | A: solid | L13 | Planned |
| 8 | Evidence-reporting relays | A: solid | L14, the Cloudroad | Planned |
| 9 | Sound-and-meaning workshops | A: solid; listening never required | L16 (optional, device voice) | Planned |
| 10 | Comic and dialogue reconstruction | A: solid | L15 | Planned |
| 11 | Connected inkweaving | B: solid | W13 | Planned |
| 12 | Companion information-gap rooms | B: solid | D6 | Planned |
| 13 | Cartographer commissions | B: solid; mapping only as its own activity | D7 survey commissions | Planned |
| 14 | Courier route planning | B: solid | W11 | Planned |
| 15 | Purposeful repair jobs | B: solid | W12 | Planned |
| 16 | Observation-first mechanisms | B: solid | W14 | Planned |
| 17 | Notices that change behaviour | B: solid | W9 | Planned |
| 18 | Environmental creature routing | B: solid | W15 | Planned |
| 19 | Layered-site investigations | B: solid | W16 | Planned |
| 20 | Stage-blocking puzzles | B: solid | W17, Playhouse Row | Planned |
| 21 | Encounters with different objectives | C: liked | E6 | Planned |
| 22 | Equivalent expressions | C: liked | E13 | Planned |
| 23 | Environmental response combinations | C: liked ("Wow!" moments) | E4 | Planned |
| 24 | Argument-chain encounters | C: liked | E8 | Planned |
| 25 | Preparation that changes the opening | C: liked | E14 | Planned |
| 26 | Companion tactical plans | C: liked | E10 | Planned |
| 27 | Fixed-tool tactical studies | C: liked | E15 | Planned |
| 28 | Negotiation encounters | C: liked | E8 | Planned |
| 29 | Spatial battle lanes | **Excluded** | — | Excluded |
| 30 | Optional superbosses | C: liked | E16 | Planned |
| 31 | Apprenticeship dungeons | D: solid | D6 | Planned |
| 32 | Transfer-remix chambers | D: solid | D6; Kotonoha | Planned |
| 33 | Curriculum forks | D: solid | D6 | Planned |
| 34 | Counterexample halls | D: solid | D6 | Planned |
| 35 | Multi-format treasure | D: solid | D6 | Planned |
| 36 | Case-file dungeons | D: solid | D6 | Planned |
| 37 | Restored-return dungeons | D: solid | D6; Kotonoha's deep wing | Planned |
| 38 | Playable short-story rooms | D: solid | D6; each Hall wing | Planned |
| 39 | Explain it to a partner | D: solid | L17, D6 | Planned |
| 40 | Curated Atlas commissions | D: solid | D7 | Planned |
| 41 | Register and role-switch | E: solid | C1 | Planned |
| 42 | Public-space observation | E: solid | C2 | Planned |
| 43 | Polite refusal | E: solid | C3 | Planned |
| 44 | Invitations and commitments | E: solid | C4 | Planned |
| 45 | Dialect field guide | E: solid | C5 | Planned |
| 46 | Market numeracy | E: solid | C6 | Planned |
| 47 | Gifts | E: solid | C7 | Planned |
| 48 | Everyday documents | E: solid | C8 | Planned |
| 49 | Folklore with multiple tellers | E: **especially** | C9; Kotonoha; the Hall | Planned |
| 50 | Festival planning | E: **especially**, with kimonos, fireworks, minigames, bonding | C10, C10a | Planned |
| 51 | The Canal Exchange | F: liked | R1, Manybridge Chapter A | Planned |
| 52 | The Mountain Relay | F: liked | R2, the Cloudroad | Planned |
| 53 | The Echo Isles | F: liked; listening never required | Folded into R4 (Kotonoha's shells) | Merged |
| 54 | The Printers' Quarter | F: liked, as story-building with reactions | R1 Chapter B, C15 | Planned |
| 55 | The Hot-Spring Commons | F: liked, bathing on screen allowed | R3, Steamhollow | Planned |
| 56 | The Travelling Stage District | F: "fantastic" for Suzu | R1 Chapter B, C11 | Planned |
| 57 | A travelling reading room | F: liked | W8 / K9, the boat | Merged |
| 58 | "Things I Can Do" portfolio | F: liked | L5 | Planned |
| 59 | Achievement stories | F: liked; badges, stamps, seals | K1 | Planned |
| 60 | Player-authored route builder | **Excluded** | — | Excluded |

### 2. Astra's other proposals

| Proposal | Plan item | Status |
| --- | --- | --- |
| "The Hundred Unwritten Rooms" (10 × 10) | D9, renamed the Hall of a Hundred Tales (avoids confusion with the Unwritten Atlas; uses a real Edo custom) | Planned |
| Three separate choices: profile, Consolidate/Grow, tactical challenge | D9, L18 | Planned |
| One ten-trial chapter first | D9, Phase 10 | Planned |
| An evidence-based word page | L4 | Planned |
| Don't count the wrong things | L1, L2 | Planned |
| Adaptation offers help, never punishes | D7, E19 | Planned |
| Elapsed time in the scheduler | L6 (C-36) | Robin's decision |
| A sentence-ordering support ladder | L7 | Planned |
| Ordering in one of every four or five interactions where it fits | L7 target | Planned |
| Quiet puzzle spaces | W9–W17 note | Planned |
| The downgraded or rejected list (crafting, card game, farming, scalar, damage multiplier, politeness score, streaks, AI grading, RNG rewards, pronunciation scoring) | 01_PRINCIPLES §10 | Excluded (Robin agreed) |
| An expansion order | 12_ROADMAP "Alternatives" | Merged |
| "What can the player do here?" | 01_PRINCIPLES §1 | Planned |

### 3. Robin's ideas: the first request \[R0\]

| Idea | Plan item | Status |
| --- | --- | --- |
| More regions | 07_REGIONS | Planned |
| New challenges | 03, 04, 05 | Planned |
| Active learning and repetition, made fun | 05 (L7–L17), D6 | Planned |
| Usage and accuracy per word, kanji and kana | L1, L4 | Planned |
| Achievements | K1 | Planned |
| Recall-focused dungeons; adapting to new words and grammar; weaker showings | D6 (apprenticeship), D7 (practice commissions) | Planned |
| Learner-centric, not punishing | 01_PRINCIPLES | Planned |
| A "100 Trials" superdungeon | D9 | Planned |
| Push a tier higher by the end | L18 (Grow) | Planned |
| No FOMO; no pressure to cheat or change how one practises | 01 G10 | Planned |
| More English → Japanese ordering | L7 | Planned |
| Runtime can grow | 10_STORY | Decided: twelve chapters (C-01); the playtime target is open (C-61) |
| Not 20 distractions per area; fresh regions, not more quests | 01 §1, 07 | Planned |
| Dialects (Suzu's Kansai-ben) | C5 | Planned |
| Etiquette in public places | C2, C13 | Planned |
| Politeness and social hierarchy | C1 (framed as relationships, never a ladder of worth) | Planned |
| More ideas from Japanese culture | 08_CULTURE | Planned |

### 4. Robin's ideas: the written review \[R1\]

| Idea | Plan item | Status |
| --- | --- | --- |
| Dungeon interaction as an activity | D6, W13 | Planned |
| Ambushes where more enemies join if you take too long | E2, E20 (turns, not time) | Planned |
| Puzzles marked required or optional, with a renewable side reward | Optional puzzles marked on the auto-map. Rewards once; replayable for fun. Renewable *resources* were later rejected \[R2 §5\] | Planned, amended |
| Mapping dungeons, optional, with an achievement and unique rewards | D7 survey commissions | Planned |
| Evolving communities | W1 | Planned |
| NPC routines shuffling after events, travel or defeats | W2 | Planned |
| A day/night system | W4: evaluated, not now | Not recommended (yet) |
| Shogi | C12 | Planned |
| Expand shiritori | C12 | Planned |
| A card game only if it fits the world | Collectible card game excluded; hanafuda in (C-33) | Planned |
| Words changing the battle's flow; "Wow!" moments | E4, E8, E2 | Planned |
| More enemy slots past three | E12 | Planned (set pieces only) |
| Contextual fire, wind, water, earth (not an element chart) | E4 | Planned |
| No full whiffs or one-off uses | E4, E5 | Planned |
| Trials: checkpoints, return with exact state, restart floor | D9 | Planned |
| Health and status persisting in harder dungeons | D2 | Planned |
| No item system; resources from creativity and the environment | D2 | Planned |
| Familiar NPCs met by chance; better help if you remember them or amuse them | D8 | Planned |
| English prompts in new regions, not shoehorned into old | L7 | Planned |
| Track assistance and stroke redos | L1 | Planned |
| Mastery tests and gold stars in the Ledger | L3 (Words › Mastery) | Planned |
| Optional reactive dungeons scaling with weaker skills | D7 (scale chosen before entry) | Planned |
| Unique scenarios between regions; first-time road events; repeatable variants | W5 | Planned |
| Side dungeons teaching something totally new | D6 apprenticeship | Planned |
| Growth offered, never forced | L18 | Planned |
| Achievements with badges, stamps and seals for key moments | K1 | Planned |
| The Harbourmaster deal, a boat, sailing, travel log, random events, manual control, skippable, ports | W7 | Planned |
| A mystical side region, early by boat, later for everyone | R4 Kotonoha | Planned |
| Each region with its own systems, rewards and stories | 07 | Planned |
| New abilities reopening old places | W6 | Planned |
| Stepping into a turbulent group without fear of retaliation | C14, E8 | Planned |
| Cultural experiences without forcing modern Japan | 08 | Planned |
| Assess a group and respond to each member; elimination with lasting effects; chained outcomes unlocking content | E17, E8 | Planned |
| Folklore and word-of-mouth mysteries | C9 | Planned |
| A festival with kimonos, fireworks, minigames and companion bonding | C10, C10a | Planned |
| Suzu in a travelling troupe | R1, C11 (C-31; her dream revisited after Robin's playthrough, C-62) | Planned |
| An onsen with on-screen, towel-wrapped bathing | R3, C13 (baths follow pronouns; they/them and custom choose once, C-56) | Planned |
| Printers: stories from building blocks, judged by readers | C15 | Planned |
| The battle system for non-enemies: infighting groups, procedures; restart from step 1; step away and examine | E1, E7, E8 | Planned |
| The Trials covering everything; folklore; Tsuru | D9 | Planned |
| A painterly illustration per Trials chapter | D9, K2 | Planned |
| A travel volume: chapters, side quests, companion bonding | K2 | Planned |
| Gallery viewable from the main menu even after a save is deleted | S3, K4 (C-19) | Planned |
| All companions' illustrations across playthroughs | K8, K9 | Planned |
| Companion illustrations varying with the ending | K8 | Planned |
| The exclusions list | 01 §10 | Excluded |
| Ten or twelve chapters; a more epic Hush; removing its threat | 10_STORY | Decided: twelve (C-01) |
| Side regions as true postgame content | R5, R6, R7 | Planned |
| The island reachable by about Chapter 8 regardless of the quest | R4 (C-48) | Planned |

### 5. Robin's ideas: the ten-point clarification \[R2\]

| Point | Plan item | Status |
| --- | --- | --- |
| 1. Arrivals by event; wanderers with targets and bubbles; interference | E2, E3 | Planned |
| 1. Event battles with conversation, Light, Water and new options; outcomes from action or inaction; companion options | E8, E9, E10 | Planned |
| 1. Boss reinforcements: not infinite except big bosses; dispatchable | E2 | Planned |
| 1. The troupe never dies; temporary separation; NPC deaths possible | 10_STORY §8, E17 (C-11, C-12) | Planned; separation decided (C-12) |
| 2. Large floors; limited stationed resources; restart on failure | D1, D2, D3 (C-03) | Planned; restart for optional dungeons decided (C-03) |
| 3. Fixed generation; preview; companion help in story dungeons | D1, D4, E19 | Planned |
| 4. Weighting "overly assisted" | L2, L3; H4 first version (C-41) | Planned |
| 5. Ask NPCs about others; quest helper; organic schedules | W3, W2 | Planned |
| 5. Road events as discussed; no renewable resources | W5 | Planned |
| 6. Chapter illustrations at chapter end; witnessed marks; companion sets at the story's end | K2, K3, K8 | Planned |
| 6. Special illustrations hidden with criteria; revealed by confirmation | K5, D9 | Planned |
| 6. Chapter replay versus multiple saves | K6 (Chapter Journey, a proposal for new-edition saves) | Planned |
| 6. Festival games revisitable | C10, K7 | Planned |
| 7. Passwords versus an open gallery | Resolved by H1 | Resolved |
| 7. Animated illustrations including the player; the Continue character | K2, K4 | Planned |
| 8. Printers kept simple and lively | C15 | Planned |
| 9. Whiffs allowed if shown beforehand | E5 | Planned |
| 9. Resolve this step | E11 | Planned |
| 10. The side region adapting to the visit | R4, S1 | Planned |
| 10. The Hush assumption | Sealed S10 | Recorded |
| 10. More chapters "a desire for later" | 10_STORY | Decided: twelve (C-01) |
| 10. F/Ren testing | 12_ROADMAP | Planned |
| 10. A final art pass at the end | Phase Z | Planned (outline only) |

### 6. Robin's later decisions \[H\] and this session

| Item | Plan item | Status |
| --- | --- | --- |
| H1 Always viewable; seals per save; criteria shown; no passwords | K2–K5 | Planned |
| H2 Suspend only in the Trials, never from battle | D3, D9 | Planned |
| H3 Animated illustrations with the player; Continue look | K2, K4 | Planned |
| H4 Stars per input type; under 30% assisted; fix the candidate rule first | L3, L2 (C-13, C-14) | Planned; both decided (stars are flair; one-guess pad) |
| H5 Testing cadence | 12_ROADMAP | Planned |
| H6 A final art pass | Phase Z | Planned |
| Portrait ideas (2026-10-06): untagged lines, bigger cues, body language | Phase 11 | Planned (when Robin asks) |
| The open Harmony question (one technique or charges) | E18, Phase 0 | Decision |
| Remaining addendum reviews (HX33, HX43, HX45, WI5, WI26) | Phase 0 | Robin's playthrough |

### 7. New in this plan (proposals Robin hasn't seen)

| Proposal | Where |
| --- | --- |
| The Road Stamp Book, inspired by Japan's commemorative station stamps | K1 |
| A personal name seal as the "witnessed" mark | K3 |
| Manybridge's lantern-shade printing, linking the city to Chapter 1's canon | R1 |
| The river festival (川開き) as the festival | C10 |
| Manzai with Suzu as her 相方 | C11 |
| Kotonoha (言の葉) and its Kokinshū origin | R4 |
| The Hall of a Hundred Tales (百物語), inverted to relighting | D9 |
| Baths by pronoun; they/them and custom choose once; Nao and Ren always their own choice (C-56) | R3, C13 |
| Three kinds of separation: staying behind (the Mist Barrier), in danger (the Root Hollows), a disagreement (Steamhollow) | 10_STORY §8 |
| The new settlement as postgame region | R7 |
| The boat as a home and Distractions venue | W8 |
| New inkweaving words (はし, すみ, みち, ゆ) | W6 |
| Karuta (turn-based); origami; a calligraphy brush mode | C12 |
| A Chapter Journey (start a new campaign at a completed chapter) | K6 |
| Persistent condition that never carries language mistakes | D2 |
| The honest "effect here" preview as an early standalone fix | E5 |
| The Keepers' Road as Chapter 7, passing the shuttered hall the postgame opens | R8 |
| Kotonoha as the main Chapter 9, with an early boat visit kept | R4 |
| An edition boundary for old saves (kept, labelled, never altered) | S4, C-54 |
| A beginner's ladder for shogi | C12 |
| Hanafuda as a pastime (Robin: "totally in") | C12, C-33 |

### 7. Robin's second round of answers (2026-10-07)

| Idea | Plan item | Status |
| --- | --- | --- |
| Continuing an old save begins New Game+ with a notice | 10_STORY §9, S4 | Planned |
| New Game+ keeps personal records only; offered at the end of the game | 10_STORY §9a, K9 | Planned |
| A farewell with the companion when New Game+ begins ("unfinished work; we'll meet again") | 10_STORY §9a | Planned |
| Collecting every illustration with every companion across runs | K9 | Planned |
| Festival games just for fun, personal records only | C10 | Planned |
| They/them and custom pronouns choose a bath once | C13, R3 | Planned |
| Random room variety inside the Atlas's fixed shape | D1 (the Atlas), D7 | Planned |
| Quarrels never lower Bond; apologising as language | 10_STORY §8, C16 | Planned |
| Unravel available where it may do nothing; analysis taught at the first non-creature conflict | E7, E8, R1 | Planned |
| Playtime: about 15 h brisk, about 40 h for a new learner | 10_STORY §11 | Planned (checked by timed play) |
| Hanafuda | C12 | Planned |
| Persistent health only where a dungeon specifies it | D2 | Planned |
| Avoidable, restrained deaths; never NPCs who matter; reflection afterwards | E17, 01 §4 | Planned (C-65 decided) |

### 8. Robin's third round of answers (2026-10-07)

| Idea | Plan item | Status |
| --- | --- | --- |
| Romance limited to holding hands and/or a kiss; a story-conclusion moment by Bond; nothing explicit | 10_STORY §7a | Planned (how it is offered: C-67, decided) |
| Trying something else when a response does nothing; *tried* marks | E5, E8 | Planned |
| New Game+ in either slot; the farewell from the originating save; the traveller unchanged; no keepsakes or lore | 10_STORY §9a, K9 | Planned |
| Nao and Ren always choose the same bath | C13 | Planned |

### 9. Robin's fourth round (2026-10-08)

| Idea | Plan item | Status |
| --- | --- | --- |
| Suzu crosses paths with her troupe, chooses to stay, a night apart, the double act | 14_COMPANIONS §4 | Planned (C-68, decided) |
| A second arc for every companion, at the same depth | 14_COMPANIONS | Planned (C-68: by my judgement, decided) |
| A sombre, near-silent night theme with crickets and frogs | 14_COMPANIONS §5 | Planned |
| The Hush as a rising tragedy; heavy and imposing near its source | 10_STORY §6a | Planned |
| A Distractions tab with a page per pastime and key art | K7, K10 | Planned |
| One coherent score; intensity by writing; a unique, imposing finale | 07_REGIONS "The score", G16 | Planned |
| No native reviewers: careful self-review | Phase 12, C5 | Planned |
| No fishing in mastery exams | L3 | Planned |
| Repairs aboard or at port; no failure, shown not said | W7 | Planned |
| Situation encounters as unique, demanding one-offs | E8 | Planned |
| About 1–3 hours per chapter | 10_STORY §11 | Planned |
| Main Menu illustrations show the Continue save's effects | K4 | Planned |
| Harmony's sound: a shared arrival, an accent per companion, none on Instant | E21 | Planned (Phase 1) |
| How groups scale; numbered turns; Protect's wider form | E22 | Planned (C-70, decided; the ceiling dropped, C-73) |
| More creature kinds in every region | E23 | Planned |
| Reasons to fight roaming creatures | E24 | Planned (C-69, decided) |
| Companions growing in battle; learning from creatures | E25 | Planned (C-71, decided) |
| Two moves at once; plans; silencing responses | E26 | Planned (C-70, decided) |

### 10. Robin's fifth round (2026-10-08)

| Idea | Plan item | Status |
| --- | --- | --- |
| Nao, Mio and Ren fleshed out to Suzu's depth, by my judgement | 14_COMPANIONS §4, S14 | Planned (C-68) |
| Each creature numbered by its action order; targeting kept | E22 | Planned (C-70) |
| Unravel reaching up to two creatures after a point in the story | E27 | Planned (C-74 to confirm) |
| Protect covering both, as a meaningful moment of growth | E27 | Planned (C-74 to confirm) |
| Modifier words in battle and the overworld, as target extensions | E27 | Planned (C-72 to confirm) |
| Words that read alike but behave differently (Robin's four families) | E27 | Planned (C-72 to confirm) |
| Options for the player rather than limits on the enemies | E22 | Planned (C-73 to confirm) |
| Only Hush or Hush-adjacent creatures silence, never the player; always inferable | E26 | Planned |
| Companion tools found off the beaten path; never FOMO, areas revisitable | E25 | Planned |

Generated from docs/future/plan/ on the task branch. The spoiler file, SEALED_STORY_NOTES.md, is not included.