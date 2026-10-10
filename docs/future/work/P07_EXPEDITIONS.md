# P07 · Expeditions, Atlas extensions and a pilot dungeon

*Playbook P07 ("Finish the expedition framework and one pilot"); plan [04_DUNGEONS.md](../plan/04_DUNGEONS.md)
D1–D8, D10. Authorised by Robin's C-81. Under way.*

## What P07 builds

| Part | Source | Where | State |
|---|---|---|---|
| Expedition state and reset policies: enter, leave, restart; what a restart resets (creatures, station uses, mechanisms, condition, the visit's own flags) and keeps (learning, Known details, the map, shortcuts, solved steps) | D1, D3, D3a | `src/engine/98_expedition.js` | Done (engine) |
| Persistent condition with a tested accounting: two pools per party member (language mistakes; everything else), heals repairing the rest first, the mistake pool given back after each encounter and never more than is missing | D2, playbook P07 | `RB.expedition.track / mistake / settle`; the two mistake sites in `95_combat.js` and `97_encounter.js` | Done (engine) |
| Stations as places with uses per visit (bench, spring, shelter, a lamp mended into a rest point) | D2 | `RB.expedition.useStation` | Done (engine) |
| Shortcuts opened from the far side, kept like the map | D10 | `RB.expedition.openShortcut` | Done (engine) |
| Defeat by the expedition's rule (entrance, floor or checkpoint) | D3 | `RB.expedition.onDefeat`, the defeat flow in `90_game.js` | Done (engine) |
| The battle screen's hooks: start/end for expeditions; a bar registry (`RB.ui.combatBars`) that now draws the Atlas's escorted lantern, replacing its page observer | D1 | `src/ui/80_combat.js`, `src/atlas/50_run.js` | Done |
| The entrance preview card (what is practised, size, the rules in words) | D4 | `RB.expedition.preview`; the card on screen | Engine done; screen next |
| A pilot optional dungeon in an existing region: entrance preview, a large looped floor, stations, a procedure, an optional route, a visible encounter, a shortcut, retreat and restart, an apprenticeship pattern | P07 pilot, D6 A31 | — | Next |
| Atlas commissions (practice, themed, survey), varied rooms inside each run's fixed shape, delvers | D7, C-57, D8 | — | Next |

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

## Checks so far

| Check | Command | Result |
|---|---|---|
| The accounting, the instance, stations, shortcuts, defeat, the hooks, the preview, the Atlas lantern bar | `node tests/run-unit.mjs expedition` | 29/0 |
| Recorded battles unchanged; encounters; modifiers; the Atlas | `combat_golden`, `encounters`, `modifiers`, `encounter_rules`, `atlas` | 2/0 (1,710 battles), 184/0, 127/0, 17/0, 77/0 |
| The battle screen | `node tests/e2e/combat_ui.mjs`, `battle_settings.mjs` | 7/0, 10/0 |
