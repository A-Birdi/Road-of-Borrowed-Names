# Continuation state

*The expansion's work state (playbook template, adapted). HANDOFF.md stays the project's front door; this file is
the short, current answer to "where exactly are we?" for the authorised packets. Update it at every checkpoint.*

**Updated:** 2026-10-10 (C-81; P02 under way).

**Latest explicit authorisation:** Robin, 2026-10-10, after the fidelity study, recorded as **C-81**: "continue your
World Proof into full Expansion plan at large. Do your best to implement the *entire* expansion plan without consulting
me … accept fewer to no distractions or concerns that block or halt progress." So **P02 to P17 are authorised**, in
the playbook's order, one packet at a time, each with tests and evidence; the lead decides what the plan leaves open
and logs it in `docs/future/plan/11_CONTRADICTIONS.md` part F. P18 (the full matrix, any release) still waits for
Robin. The fidelity study is a test, not a standard. (Earlier: C-78 adopted the playbook's order; C-79 accepted the
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

| P02 · foundations | **Under way.** Done so far: the edition field and twelve-chapter display map (`05a_edition.js`), records, seeded streams, story phases, the result envelope and the one New Game+ carryover (`05b_foundations.js`); foundations tests 66/0 | [P02_FOUNDATIONS.md](P02_FOUNDATIONS.md) |
| P03 · learning evidence and task families | Not started | — |
| P04 · encounters | Not started | — |
| P05 · living world | Not started | — |
| P06 · records, replay, New Game+, pastimes, the book everywhere | Not started | — |
| P07 · expeditions and a pilot | Not started | — |
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
