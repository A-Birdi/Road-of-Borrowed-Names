# P07 · Expeditions, Atlas extensions and a pilot dungeon

*Playbook P07 ("Finish the expedition framework and one pilot"); plan [04_DUNGEONS.md](../plan/04_DUNGEONS.md)
D1–D8, D10. Authorised by Robin's C-81. Under way: the framework, the pilot and the Atlas's commissions done;
delvers and the room-variation evidence next.*

## What P07 builds

| Part | Source | Where | State |
|---|---|---|---|
| Expedition state and reset policies: enter, leave, restart; what a restart resets (creatures, station uses, mechanisms, condition, the visit's own flags) and keeps (learning, Known details, the map, shortcuts, solved steps) | D1, D3, D3a | `src/engine/98_expedition.js` | Done (engine) |
| Persistent condition with a tested accounting: two pools per party member (language mistakes; everything else), heals repairing the rest first, the mistake pool given back after each encounter and never more than is missing | D2, playbook P07 | `RB.expedition.track / mistake / settle`; the two mistake sites in `95_combat.js` and `97_encounter.js` | Done (engine) |
| Stations as places with uses per visit (bench, spring, shelter, a lamp mended into a rest point) | D2 | `RB.expedition.useStation` | Done (engine) |
| Shortcuts opened from the far side, kept like the map | D10 | `RB.expedition.openShortcut` | Done (engine) |
| Defeat by the expedition's rule (entrance, floor or checkpoint) | D3 | `RB.expedition.onDefeat`, the defeat flow in `90_game.js` | Done (engine) |
| The battle screen's hooks: start/end for expeditions; a bar registry (`RB.ui.combatBars`) that now draws the Atlas's escorted lantern, replacing its page observer | D1 | `src/ui/80_combat.js`, `src/atlas/50_run.js` | Done |
| The entrance preview card (what is practised, size, the rules in words, ambushes, leaving), read from the same definition the run uses | D4 | `RB.expedition.preview`; `src/ui/89b_expedition.js` | Done |
| A pilot optional dungeon in an existing region: entrance preview, a large looped floor, stations, a procedure, an optional route, a visible encounter, a shortcut, retreat and restart, an apprenticeship pattern | P07 pilot, D6 A31; F-26 | The Flood Cellars: `src/content/expeditions/` (maps and definition, the language, the scenes), Suzu's Kansai lines | Done |
| Coherence: a visit begun or ended by walking onto or off its maps; rest places kept at full resolve; machines part-way through reset on a restart (solved steps kept); unlimited uses survive a save; the floors seen kept | D3, D3a; F-27 | `src/engine/98_expedition.js` | Done |
| Carried resolve on the map (a chip) and the Map page's Expedition plan (the floors seen, the stations with uses left, the shortcuts) | D2, D10 | `src/ui/89b_expedition.js`, `src/styles/67_expedition.css` | Done |
| The whole-expedition curve: the player model plays the cellars end to end with carried condition | D2 ("a new curve test that plays whole expeditions"); F-29 | `tests/unit/expedition_curve.test.mjs`; `RB.combatSim.run`'s `onInit` | Done |
| Atlas commissions: the board in the Lantern Hall; practice topics from the evidence, three errands, three survey areas; a length chosen; the card with exact rooms before anything is fixed; topic lanterns and revisits, unmet items taught first; survey landmarks; safe passage; the Cartographer's Atlas (Map tab); the compass and the stamp | D7; F-30 | `src/atlas/80_commissions.js`, the generator's hooks in `src/atlas/30_gen.js`, `50_run.js`, `40_combat.js`; `src/ui/89c_atlas_board.js`; drills `src/content/expeditions/30_drills.js` | Done |
| Varied rooms inside each run's fixed shape (evidence), delvers | C-57, D8 | — | Next |

## The accounting (D2), as tested

| Fixture | Start → in battle | After the encounter |
|---|---|---|
| Two mistakes and a blow of 3 | 12 → 7 | 9 (the mistakes come back) |
| Mistake, then a heal of 1 | 12 → 12 | 12 (nothing left to give back; never above full) |
| Blow 4, heal 2, mistake | 12 → 9 | 10 (the heal mended the blow first) |
| Mistake, blow 3, heal 2 | 12 → 10 | 11 (the mistake still comes back) |
| Starting 4 short, two mistakes | 8 → 6 | 8 (the old loss stays) |
| At 2: a blow of 5, then a mistake at 0 | 2 → 0 | 0 (a mistake at 0 cost nothing) |
| Six capped mistakes | 12 → 6 | 12 |
| Random sequences (2,000) | | the pools always add up to what is missing; the refund never exceeds it |

## Checks of the engine slice (85f39c8)

| Check | Command | Result |
|---|---|---|
| The accounting, the instance, stations, shortcuts, defeat, the hooks, the preview, the Atlas lantern bar | `node tests/run-unit.mjs expedition` | 29/0 |
| Recorded battles unchanged; encounters; modifiers; the Atlas | `combat_golden`, `encounters`, `modifiers`, `encounter_rules`, `atlas` | 2/0 (1,710 battles), 184/0, 127/0, 17/0, 77/0 |
| The battle screen | `node tests/e2e/combat_ui.mjs`, `battle_settings.mjs` | 7/0, 10/0 |

## The pilot: the Flood Cellars

Under Reedwake's River Warehouse, in twelve-chapter journeys once Chapter 2 is over (F-26). Old Yasu tells you the
young hands ran off halfway through draining it, leaving their notices; reading what they had already done is the
way through.

| What P07 asks for | In the cellars |
|---|---|
| Entry preview | The hatch shows the card: 〜て ある (new), 〜て いる and 〜て ください (used); two floors and an optional room; the rules in words; "Go down" or "Not now" |
| A large looped floor | B1 (40 × 26): a ring of passages round the rice store; two ways to the stairs (north past the bench, south past the lamp room) and the store as a cut across. Tested: with either passage closed, the stairs are still reached |
| A station | The bench (B1, +4, twice), the spring (B2, full, once), the lamp (mended into one more rest) |
| A procedure | The drain sluice: three steps read from the hands' plate, each a 〜て ある notice (what is done) and a 〜て ください one (what is asked); a wrong move goes back to the last stable step |
| An optional route | The lamp room east of B1 (its lamp, its note): closing it off changes nothing about the way on |
| A visible encounter | Every creature is in sight; the blot at the outflow door is an authored encounter of its own |
| A shortcut | The grate by the first ladder, bolted from below: opened from B2's outflow chamber, it stays open on every visit, and lands beyond the water |
| Retreat and restart | Climb out at the first ladder whenever you like (the next visit starts fresh); defeat starts the cellars again from the ladder: the water back, the lamp out, the creatures returned, the stations and condition full; kept: the grate, what was taught, the floors seen, the steps solved |
| An apprenticeship pattern (A31) | Taught at the foot of the ladder with its grammar card and a task; used by the lamp, the grate, the sluice; combined at the outflow door with 〜て いる and 〜て ください |
| All profiles and input routes | Every task at Foundations, Elementary, Intermediate and Advanced; choosing, ordering and writing all meet 〜て ある; the browser test answers the notice by mouse, by tiles, by typing and by handwriting |

### The curve (F-29)

`node tests/run-unit.mjs expedition_curve`: the player model plays all six creatures in walking order at every
difficulty, with each companion, reading the telegraphs or mostly unravelling, with no slips and with one in three
(48 runs). All won. The lowest resolve between encounters: 11 (Relaxed), 8 (Standard, a rest used in some runs), 8
(Demanding, up to two rests). What slips cost was given back after each encounter. B2's two groups (a blot and a
strayed flour moth) are authored encounters, each within 5 exchanges and half a resolve bar of the blot alone at
every setting with and without a companion; the six-chapter story's group rules and recorded battles are untouched
(`combat_fairness` 621/0, `combat_golden` 2/0, `combat_curve` 287/0).

## Checks

| Check | Command | Result |
|---|---|---|
| The engine: accounting, instance, stations (kept at full resolve), shortcuts, defeat, hooks, preview, the Atlas lantern bar | `node tests/run-unit.mjs expedition.test` | 30/0 |
| The cellars: the card says what the run does; the places where the definition says; walking (the loop, the optional room, the flood, the shortcut beyond it); story maps outside any expedition; an instance through the reset matrix, coherence and a save; four profiles and every input route; no bare kanji in an English line | `node tests/run-unit.mjs expedition_cellars` | 51/0 |
| The whole-expedition curve, and the groups' spike bound | `node tests/run-unit.mjs expedition_curve` | 6/0 |
| In the browser: the whole loop (hatch, card, B1, B2, sluice, shortcut, plan, door, stamp, out); a defeat; a real battle carrying the blow and giving back the mistake; the notice by hand at all four profiles (mouse, tiles, typing, handwriting); phone width | `node tests/e2e/expedition.mjs` | 5/0 (captures `docs/screenshots/expedition/`) |
| The challenge screen's English fields with readings (F-28), and the suites around it | `node tests/e2e/ui.mjs`, `encounters.mjs` | 14/0, 10/0 |
| The defeat test gives the battle's outcome (the game's defeat flow after it is its own); the real battle test steps back rather than playing to a finish | — | stated, not hidden |

## The Atlas's commissions (F-30)

| Check | Command | Result |
|---|---|---|
| The board (topics from evidence, never a group with none; errands; surveys; reading makes no record; a commission fixed when taken); the shape (a standard practice commission exactly an ordinary run's shape over 60 seeds; short always shorter, long always longer; a survey keeps to its area; the lost route leans on the hall of doors); the topic (every lamp of 90 about it; an unmet item marked to be taught; ordinary lamps unchanged); the route fixed after forty mistakes; a saved run rebuilding the same maps; a landmark in every area room of every variant (40 seeds × 3 areas); the landmark task at four profiles; finishing (the record made at the first finish; an incomplete survey not recorded; safe passage: no veil, planks laid, the right door open; all three: the compass and the stamp) | `node tests/run-unit.mjs atlas_commissions` | 38/0 |
| Ordinary runs unchanged | `atlas`, `overworld_geometry` (three seeds' rooms), `combat_golden` | 77/0, 3/0, 2/0 |
| In the browser: the board with the card and a short road taken; a lantern of the family of endings (the grammar card first, then the question through the challenge screen, the lamp lit); a survey landmark verified and counted in the Atlas panel; the Cartographer's Atlas page and the board at phone width | `node tests/e2e/atlas_board.mjs` | 4/0 (captures `docs/screenshots/atlas_board/`) |
