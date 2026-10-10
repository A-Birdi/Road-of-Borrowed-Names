# P05 · The living world, exploration actions and the performance library

*Expansion packet P05 (playbook "P05 · Build the living world and reusable performance library"; plan
[06_WORLD.md](../plan/06_WORLD.md) W1–W6, W9–W17; playbook V4/V5). Authorised by Robin's C-81. Done.*

## What P05 builds

| Part | What | State |
|---|---|---|
| W1 change beats | Bundles a town gains with the story; remembered until seen; the Journey names a town that changed, never what; a setting turns the line off | Done |
| W2 routines | Residents with 1..n places, ticking only on coming back (three transitions away, a story flag the town cares about, a rest), never within the town, never mid-conversation, never on a load; pins while a quest step needs someone | Done |
| W3 "Have you seen…?" | Ask someone after a person you know of: a sighting, their usual places, an unsure recollection, or a refusal or not knowing; notes in Known details, never markers; where you last saw people kept with the save | Done |
| W4 day and night | Kept as story-set states (no free-running cycle), as the plan recommends; nothing added | Accounted for |
| W5 road events | A road's first event until solved (leaving defers it, it is never lost), then seeded variants now and then; a stamp for solving them all; unfinished ones in the Journey | Done |
| W6 return keys | Sealed places visible from the start with an in-world hint, listed in Known details once noticed, opened when the word or mechanic they need is known | Done |
| W9, W11–W17 exploration actions | Templates over Field Inkweaving and the case engine, each with a fixture and its sheet | Done |
| Quiet puzzle spaces | The world waits while a sheet is open; no roaming creature where something is examined (checked) | Done |
| V5 the performance library | A registry of complete actions (anticipation, motion, contact, follow-through, return) generalising the world proof's three, with props, anchors, interruption and a validator | Done: sixteen actions |
| V5 profession behaviours, V6 environment kits | Repeated profession actions and the base kits before regional variants | Done: suggestions by profession; the proof kit's dressing checked safe on every map |

The tables the world reads (`RB.content.towns`, `relations`, `roadEvents`, `sealed`) ship empty: the new chapters
fill them, so a six-chapter journey meets none of it. The exploration actions' fixtures appear only in a throwaway
session (`?dev=verbs`, the flag `dev_verbs`).

## Contracts

### Towns (src/engine/53_town.js)

```
towns[id]     = { name, maps: [ids], residents: { <person>: { slots: n, pin: cond } }, care: [flags],
                  beats: [{ id, when, en, jp }] }
relations[p]  = { knows: { <other>: 'routine' | 'loose' }, friendly: bool, refusal: { jp, en }, usual: { jp, en } }
roadEvents[r] = { maps: [ids], unique: { id, scene, title }, variants: [{ id, scene, when }], rate, stamp }
sealed[id]    = { map, x, y, needs: <concept id> | cond, hint: { jp, en }, opens: <flag>, scene }
```

- A resident's places are ordinary map placements with the condition `slot.<person>=k`; a change beat's content
  uses `beat.<town>.<id>`. An NPC with `asks: true` offers "Have you seen…?".
- Scenes report with `!hook road_done <road> <id>` and `!hook sealed <id>`.
- The record: `s.world = { towns, beats, lastSeen, notes, roads, sealed, moves, rests }` (older saves gain it empty).

### Exploration actions (src/engine/55b_verbs.js)

`RB.verbs.define(kind, spec)` checks a spec, writes the field puzzle (or case) it describes and places its props,
people, creatures and triggers. Ids are letters, digits and `_` (conditions name them). Each kind's spec is described
at the top of its section in the file. Pure functions the screens and tests share: `noticeSafety`, `courierCheck`,
`settle`, `networkSafety` (every reachable state), `pattern`/`phaseAt`, `compareAt`/`conclude`,
`blockingCheck`/`rehearsalPath`.

| Kind | W | Outcome | What is checked when it is defined |
|---|---|---|---|
| notice | W9 | people follow a reading in the goal | readings have words; people only for known behaviours; `noticeSafety`: no wording cuts off a way out |
| courier | W11 | a round that reaches every recipient | every recipient has a place on every leg; several plans work (counted) |
| repair | W12 | mended and tested | every step's tool is supplied; no prerequisite items |
| network | W13 | the goal's levels | gates join known basins; `networkSafety`: every reachable state settled, every required way reopenable |
| observe | W14 | the goal pattern | the goal is reachable by some set of adjustments; clues in real phases |
| follow | W14 | every step done | every step has a right action |
| route | W15 | the creature in a goal place | a way without a fight; a sound has words and a cue |
| layers | W16 | a valid reading concluded | marks on the map; hypotheses rest on marks; at least one valid reading |
| blocking | W17 | a rehearsal that matches | directions for real pieces; none into the scenery |

### The performance library (src/engine/67a_perform.js)

`RB.perform.define(id, { phases: [{ name: 'anticipation' | 'motion' | 'contact' | 'follow' | 'return', frames, pose,
props }], anchors, traits, interrupt })` registers a complete action on the pose layer. Sixteen ship: fish, fold and
sell (external), sweep, sort, carry, tie, tend, read, grind, point the way, consider, laugh, offer, thanks, a mistake.
A person with `perform` on their placement works through rounds; anyone who speaks to them is answered after the
action yields (it restarts from its anticipation, never mid-motion); `perform <npc> <act>` plays one in a scene.
`RB.perform.check(map)` validates anchors and props on a map (lazily, once content is loaded); `WORK` and
`suggest(class)` propose actions by profession. The gallery (`?dev=perform`, the flag `dev_perform`) puts seven
people on the Saltglass road.

## Lead's decisions (11_CONTRADICTIONS.md part F)

F-13 what a routine tick counts and does; F-14 when "Have you seen…?" appears; F-15 one road event offer per visit;
F-16 an action's outcome stays; F-17 what the sheets record as language evidence; F-18 how water settles; F-19
readings in a layered site; F-20 where the fixtures live.

## Found and fixed on the way

- A road's first event re-offered itself as soon as it ended: the game re-checks enter events after every scene
  (F-15). Found by the browser test; guarded and unit-tested.
- A map compiled while content was still loading lacked the props added after it (the layered site's check compiled
  it): checks now read a map's size from its definition, and adding to a map forgets its compiled copy.
- `tests/e2e/play_ui.mjs` had been failing since P02 (the HUD's button became "Ledger" with C-58); the test was
  corrected.
- The performance library: validating an action when it was defined failed because the content's prop kinds load
  later (validation is now lazy); an action interrupted mid-round resumed mid-motion (it now restarts from its
  anticipation); the tie action named anchors that did not exist.

## Checks so far

| Check | Command | Result |
|---|---|---|
| Towns, routines, beats, whereabouts, road events, sealed places | `node tests/run-unit.mjs town` | 87/0 |
| The ask menu, the Journey's Places, Known details' People, routines in play | `node tests/e2e/world_living.mjs` | 4/0 (three runs in a row) |
| The exploration actions | `node tests/run-unit.mjs verbs` | 116/0 |
| Their sheets in the browser | `node tests/e2e/verbs.mjs` | 5/0 (captures `docs/screenshots/verbs/`) |
| Field puzzles and cases unchanged | `fieldweave`, `cases` | 390/0, 194/0 |
| Settings, Known details, the folio, play | `settings`, `known`, `folio`, `play_ui` | all ok, all passed, all ok, all ok |
| Validator | `node tools/validate.mjs` | no errors |
| The unit suite (after the town engine) | `node tests/run-unit.mjs` | 28,838/0 |
| The performance library | `node tests/run-unit.mjs perform` | 85/0 |
| Its gallery in the browser (anticipation to return, interruption, reduced motion, phone) | `node tests/e2e/perform.mjs` | 3/0 (captures `docs/screenshots/perform/`) |
| The proof kit's dressing on every map | `node tests/run-unit.mjs worldkit` | 10/0 |

### Phase end (snapshot b5311b6)

| Check | Result |
|---|---|
| Browser suites: world_living, verbs, perform, departures, known, fieldweave, cases, world, world_slice, settings, folio, play_ui, ui | all pass (4/0, 5/0, 3/0, all ok, all passed, 89/89, all passed, 12/0, 5/0, all ok, all ok, all ok, 14/0) |
| F/Ren (`node tests/e2e/matrix.mjs F ren 1`) | PASS: all six chapters and an Atlas expedition, 15.3 min |
| The unit suite | 29,174 passed, 3 failed: the map census counted gated additions (fixed in 6d6a50a), a development fixture's trigger covered a fishing stand, and the handwriting reading table was stale. All three fixed; the suite on the fixed code is in P06_RECORDS.md |

**Not verified yet:** Firefox; the foldable; a person using the sheets.
