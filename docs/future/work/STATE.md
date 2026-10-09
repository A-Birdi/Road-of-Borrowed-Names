# Continuation state

*The expansion's work state (playbook template, adapted). HANDOFF.md stays the project's front door; this file is
the short, current answer to "where exactly are we?" for the authorised packets. Update it at every checkpoint.*

**Updated:** 2026-10-09.

**Latest explicit authorisation:** Robin, 2026-10-09, on the round-2 review set: "I think it's an improvement - you
may proceed." Recorded as **C-79**: the book direction is accepted as revised, and **the rest of P01** is authorised:
Reedwake's presentation proof, then Saltglass reusing it, ending in its own visual gate. P02 and later wait for that
gate. (Earlier: C-78 adopted the playbook's order of work and authorised P00 and U00–U02.) Plan:
`docs/future/plan/` draft 9; playbook: `docs/future/playbook/`.

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
| P01 · world proof (Reedwake, then Saltglass) | **Active.** W00 (art contract, far view, `?dev=world`), W01 (light and atmosphere), W02 (Reedwake's kit, first pass) and W03 (two purposeful actions) done; world tests 9/0. Next: W04, the slice with a battle, and the evidence | [P01_WORLD.md](P01_WORLD.md) |

**Pending Robin gates:** none now. The next is P01's visual gate (Reedwake and Saltglass, old beside new).

**Fixed in U01:** the Journey's "Next" box repeated one destination when a step's guidance targets led to the same
scene (U00_INVENTORY.md), and the closing book showed a blank cover (found while recording). Noted for U03: on a phone,
an opened quest is not brought into view (same as the classic folio).

## Guardrails

Decisions in the plan win; no sealed spoilers in anything Robin reads; one writer; no new runtime library, CDN or
network use; the single offline file; saves and their schema untouched; the full matrix and any publication only
when Robin asks.
