# Continuation state

*The expansion's work state (playbook template, adapted). HANDOFF.md stays the project's front door; this file is
the short, current answer to "where exactly are we?" for the authorised packets. Update it at every checkpoint.*

**Updated:** 2026-10-09.

**Latest explicit authorisation:** Robin, 2026-10-09, C-78 "Yes": the playbook's order of work, and the first scope
**P00** (baseline, no change to the game) then **P01's interface proof, U00–U02**, ending in one review set for
Robin. Not authorised yet: P01's Reedwake/Saltglass presentation proof and every later milestone. Plan:
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
| P00 · baseline | In progress: census done; unit suite passed; F/Ren route running | [P00_BASELINE.md](P00_BASELINE.md), [CENSUS.md](CENSUS.md) |
| U00 · interface inventory | Done | [U00_INVENTORY.md](U00_INVENTORY.md), [ui_inventory.json](ui_inventory.json), `docs/screenshots/book/baseline/` |
| U01 · the book on Journey and Company | Not started | — |
| U02 · type roles and specimen | Not started | — |
| Review set for Robin | Not started | — |

**Pending Robin gates:** the U01/U02 review set (one question: does it feel like a book that belongs to this
journey, and is it easy to use?).

**Known issue to fix inside U01:** the Journey's "Next" box repeats one destination when a step's guidance targets
lead to the same scene (U00_INVENTORY.md, "Found during the inventory").

## Guardrails

Decisions in the plan win; no sealed spoilers in anything Robin reads; one writer; no new runtime library, CDN or
network use; the single offline file; saves and their schema untouched; the full matrix and any publication only
when Robin asks.
