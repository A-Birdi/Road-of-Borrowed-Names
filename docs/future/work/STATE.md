# Continuation state

*The expansion's work state (playbook template, adapted). HANDOFF.md stays the project's front door; this file is
the short, current answer to "where exactly are we?" for the authorised packets. Update it at every checkpoint.*

**Updated:** 2026-10-10 (C-81; P02 to P06 done; P07 under way).

**Latest explicit authorisation:** Robin, 2026-10-10, after the fidelity study, recorded as **C-81**: "continue your
World Proof into full Expansion plan at large. Do your best to implement the *entire* expansion plan without consulting
me … accept fewer to no distractions or concerns that block or halt progress." So **P02 to P17 are authorised**, in
the playbook's order, one packet at a time, each with tests and evidence; the lead decides what the plan leaves open
and logs it in `docs/future/plan/11_CONTRADICTIONS.md` part F. P18 (the full matrix, any release) still waits for
Robin. The fidelity study is a test, not a standard. **C-82** (the same day): Robin's art amendment AC-1, "only consider it when we're working on more
art"; digest in `docs/future/plan/AC1_ART.md`, applied from the next art work (each new region's kit, P16). (Earlier: C-78 adopted the playbook's order; C-79 accepted the
book interface; C-80 the world proof's direction.) Plan: `docs/future/plan/` draft 9; playbook: `docs/future/playbook/`.

**Model and tools:** one implementation model, checked at the start of the work (reported to Robin in the
conversation, not recorded here by project rule); no second model, no parallel writers. Node 22, the project's
Playwright Chromium, Python 3 for document tooling.

**Repository:** A-Birdi/Road-of-Borrowed-Names, branch `claude/stoic-sagan-n3jvgk`. The baseline game build is the
`index.html` of commit 75b67d1 (SHA-256 `8c79777c…6b3570`, 13,089,314 bytes; rebuilding from source reproduces it
byte for byte).

## Packets

| Packet | State | Record |
|---|---|---|
| P00 · baseline | Done: unit suite 27,267/0; audit fixes 4/0 in the browser; F/Ren PASS (15.1 min) | [P00_BASELINE.md](P00_BASELINE.md), [CENSUS.md](CENSUS.md) |
| U00 · interface inventory | Done | [U00_INVENTORY.md](U00_INVENTORY.md), [ui_inventory.json](ui_inventory.json), `docs/screenshots/book/baseline/` |
| U01 · the book on Journey and Company | Done (preview behind a setting; classic stays the default): book tests 13/0, unit 27,390/0, related browser suites pass; captures in `docs/screenshots/book/u01/` | [U01_BOOK.md](U01_BOOK.md) |
| U02 · type roles and specimen | Done (the preview's type; classic unchanged): Vollkorn, BIZ UDPGothic, Shippori Mincho, BIZ UDGothic, embedded and offline; book tests 14/0, coverage 60/0, specimen 0 furigana overlaps | [U02_TYPE.md](U02_TYPE.md), [data/fonts/README.md](../../../data/fonts/README.md) |
| Review set for Robin | **Accepted** (C-79). Round 1: "the tabs at the top were fine, it's more of the inner layout that needed some proper style and organization". Round 2 (top tabs restored, Journey and Company reorganised): "I think it's an improvement - you may proceed." | [U01_BOOK.md](U01_BOOK.md) "Review round 2" |
| P01 · world proof (Reedwake, then Saltglass) | **Built; at Robin's gate.** W00–W05 done: the art contract and far view, light and atmosphere, Reedwake's kit, two purposeful actions, the slice with a real battle, Saltglass reusing the method (reuse report); world tests 12/0, slice checks pass, unit 27,450/0, F/Ren PASS (14.9 min). While preparing the gate: people at work are no longer interrupted by the game's idle habits (they were restarting every round), Kiyo's handover is clean, and the dev panel offers both visits. **The gate's review page is published to Robin (2026-10-10).** Robin's answer (C-80): the direction is solid, push the detail further toward the mockup and Octopath Traveler, with a nearer camera; battles keep their own framing (fixed). **The fidelity study is built** (P01_STUDY.md): Suzu redrawn from scratch alone at the Mill, rendered by the game with her idle and the scenery moving, three cameras; development only; study tests 4/0, unit 27,450/0, F/Ren PASS on its first pass. **Its review page is published to Robin (2026-10-10).** Waiting on Robin's view of it; the gate waits for that | [P01_WORLD.md](P01_WORLD.md) |
| P02 · foundations | **Done.** The edition field, display map and development switch; records, seeded streams, story phases, the result envelope and the one New Game+ carryover; validator rules (empty exception list) and the review ledger; fixtures; spec amendments (§20); the quick wins E5, E21, C-14, C-58, L19; load budget measured. Foundations 66/0, older-save fixtures 142/0, previews 597/0; pad suites 13/0 and 15/0; F/Ren PASS with fixtures (14.9 min) | [P02_FOUNDATIONS.md](P02_FOUNDATIONS.md) |
| P03 · learning evidence and task families | **Done.** The evidence log, help by category, day-aware spacing, sentence forging, the task families and the workshop, Ask back, listening, Mastery exams and stars, item pages, What I can do, the Grow route. Evidence 24/0, exams 113/0, grow 6/0; workshop in the browser 6/0, kanji chart 8/0 | [P03_LEARNING.md](P03_LEARNING.md) |
| P04 · encounters | **Done.** The actor model (1,710 recorded battles held), one shared exchange, Wait, conditions, guests, arrivals, objectives, procedures, conversations and machines, two-move turns, Hushes, order numbers, modifier words, companion plans and growth, help offers, outcome sets, the Tactics Board, five in two rows. Encounters 184/0, modifiers 127/0; browser suites pass (encounters 10/0); invariance 640 identical; F/Ren PASS (15.0 min); unit 28,748/0 | [P04_ENCOUNTERS.md](P04_ENCOUNTERS.md) |
| P05 · living world | **Done.** The town engine (routines, change beats, "Have you seen…?", road events, sealed places), the exploration actions W9, W11–W17, the performance library (sixteen actions) and profession suggestions, the proof kit's dressing checked on every map. Town 87/0, verbs 116/0, perform 85/0, worldkit 10/0; browser suites all pass; F/Ren PASS (15.3 min); the phase-end unit run's three failures fixed (P06_RECORDS.md) | [P05_WORLD.md](P05_WORLD.md) |
| P06 · records, replay, New Game+, pastimes, the book everywhere | **Done.** The Road Stamp Book and stands, the travel volume, the seal, read-only replay, New Game+ with the farewell; the pastime registry, shogi's ladder with puzzles, Fuku's bench, the Distractions tab; hanafuda, karuta, shiritori's themes, the festival shell with its first game; the Satchel as the book's folio. Phase end on 6c58b74: every browser suite passes, F/Ren PASS (15.2 min), unit 29,473 passed and 1 failed (a generated reading table, regenerated since) | [P06_RECORDS.md](P06_RECORDS.md) |
| P07 · expeditions and a pilot | **Under way (phase end next).** Done: the expedition engine and the pilot, the Flood Cellars under Reedwake's warehouse (〜て ある as an apprenticeship dungeon: preview, looped floor, stations, sluice, optional room, shortcut, climbing out and defeat, the plan; unit 30/0, 51/0, the curve 6/0; browser 5/0); the Atlas's commissions (practice, errands, surveys, lengths; unit 38/0, browser 4/0); delvers in the cellars and at the Atlas camp (unit 39/0 with the self-check over 96 dressed runs; browser 6/0); the ten dungeon families as templates. Next: the phase-end run | [P07_EXPEDITIONS.md](P07_EXPEDITIONS.md) |
| P08–P13 · the six new chapters | Not started | — |
| P14–P17 · integration, postgame, art pass, closure | Not started | — |

**Pending Robin gates:** none until the end (C-81). Robin will review the whole expansion at completion, the
fidelity study included.

**Fixed in U01:** the Journey's "Next" box repeated one destination when a step's guidance targets led to the same
scene (U00_INVENTORY.md), and the closing book showed a blank cover (found while recording). Noted for U03: on a phone,
an opened quest is not brought into view (same as the classic folio).

## Guardrails

Decisions in the plan win; no sealed spoilers in anything Robin reads; one writer; no new runtime library, CDN or
network use; the single offline file; saves and their schema untouched; the full matrix and any publication only
when Robin asks.
