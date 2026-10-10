# P02 · Foundations

*Playbook P02; plan `docs/future/plan/02_FOUNDATIONS.md` (S1–S8) and the quick wins (E5, E21, L19, C-14, C-58).
Authorised by C-81 (2026-10-10). The existing game keeps working; new editions stay behind the development switch.*

## What P02 builds

| Part | Source | Where | State |
|---|---|---|---|
| The edition field and the twelve-chapter display map | S4 | `src/engine/05a_edition.js` | Done |
| Records that live with each save | S3 | `src/engine/05b_foundations.js` (`RB.records`) | Done |
| Seeded event streams, drawn once and kept | S2 | `05b_foundations.js` (`RB.streams`) | Done |
| Story phases as conditions; concepts; task snapshots | S1 | `05b_foundations.js` (`RB.phase`) | Done |
| The frozen result envelope | playbook §06 | `05b_foundations.js` (`RB.events`) | Done |
| The one New Game+ carryover | K9, C-54, C-66 | `05b_foundations.js` (`RB.ngplus`); the creation screen uses it | Done |
| The development switch for new journeys | F-01 | Settings | — |
| Validator upgrades and the review ledger | S5 | `tools/validate.mjs`, `docs/review/` | — |
| State fixtures | S7 | `tests/fixtures/` | — |
| Spec amendments | S8 | `SPECIFICATION.txt` appendix | — |
| Honest "effect here" line | E5 | combat | — |
| Harmony's sound | E21 | audio | — |
| One-guess handwriting pad | C-14 | pad | — |
| The two Ledgers' names | C-58 | menus | — |
| Measuring what players meet | L19 | learning | — |
| Load time and memory | S6 | tools | — |

## Contracts

### The edition (S4)
- `s.edition`: 1 (six chapters; every save made before the expansion; absent means 1) or 2 (twelve). A new journey's is
  `RB.edition.forNew()`: 1 until the release, unless the development switch is on.
- Existing chapter flags and `s.chapter` keep their meaning. A new chapter is named by `s.chapterKey`
  (`mb1 mb2 kr ko cr yn`); `!chapter mb1` sets the key and leaves `s.chapter` alone, so `ch>=3` in existing content
  stays false in Manybridge.
- Story order: `rw sg mb1 mb2 co sb kr lf ko cr yn sa`. The number a player sees is `RB.edition.number(s)`: the old
  number for edition 1, the position in this order for edition 2. Slot meta carries it, with `edition` and `look`.
- Conditions: `ed>=2`; `chap>=mb1`, `chap=kr` (story order; an edition-1 campaign is placed by its old chapter).
- No schema bump (F-02).
- Once the edition ships (P18), an edition-1 save is shown as such and begins New Game+ (C-54); until then
  `RB.edition.isOld()` is always false.

### Records (S3)
`s.records = { stamps, seals, stars, found }`, each `id -> { t, … }`; `RB.records.award(s, kind, id, data)` is once
only. They travel with the slot (copy, delete) and nothing writes another slot's.

### Streams (S2)
`RB.streams.next(s, family)` is a value in [0, 1) that depends only on the campaign id, the family and how many have
been drawn from that family. `RB.streams.fixed(s, key, family, fn)` draws an outcome once and keeps it in
`s.rng.drawn[key]` until `consume`: a load never re-rolls it. Families are independent.

### Phases (S1)
`RB.phase.define(region, [{ id }, { id, if }, …])`; a region is in the last phase whose condition holds. Every
existing region has `before / story / after / post` from its chapter flags, edition-aware (in edition 2, Cinder
Orchard waits for `mb2_done`, Lanternfall for `kr_done`, the Still Archive for `yn_done`). Condition:
`phase.cinder>=story`. `RB.phase.concept(id, { kind, ch, taught })` declares a response, construction or modifier
and the condition that teaches it; `RB.phase.snapshot(s)` freezes phase, profile and known concepts for a running
task.

### The result envelope (playbook §06)
`RB.events.make({ src, action, targets, changes, evidence, cues })` returns a deep-frozen record with an id: the rule
runs once; presentation reads it.

### New Game+ (K9; C-54, C-66; F-03 to F-05)
`RB.ngplus.carry(from)` is the only carryover. It carries the learning record, records (stamps, seals, stars, the
keepsake catalogue's found record), illustrations seen, pastime records, noted words, kept sentences and the traveller
as they are. It never carries story, chapter, quests, the companion and Bond, the pet, story words, items and
keepsakes, Known details, lore, creatures met, Atlas progress or cosmetics. `s.ngFrom` remembers the origin's id and
companion for the farewell (P06).
- Changed from before: lore notes and cosmetic keepsakes no longer carry (C-66); stamps, seals, stars and pastime
  records now do. `tests/e2e/ui.mjs` and `tests/unit/practice_a.test.mjs` were updated to the decided contract.

## Checks

| Check | Command | Result |
|---|---|---|
| Foundations | `node tests/run-unit.mjs foundations` | 66/0 |
| Practice (New Game+ contract updated) | `node tests/run-unit.mjs practice_a` | 234/0 |
