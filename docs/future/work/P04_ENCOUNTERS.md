# P04 · The encounter platform

*Playbook P04; plan `docs/future/plan/03_ENCOUNTERS.md` (E1–E27). Authorised by C-81. Everything new is reached only
from encounter content; a battle of the six-chapter game plays exactly as before (1,710 recorded battles, below).*

## What P04 builds

| Part | Source | Where | State |
|---|---|---|---|
| The recorded battles: every creature alone and in its groups, every setting, alone and with each companion, both player models | playbook "all existing combat results before feature activation" | `tools/combat_golden.mjs`, `tests/fixtures/combat_golden.json`, `tests/unit/combat_golden.test.mjs` | Done |
| Participants: one list of everyone in the encounter (`st.actors`), with `st.foes`, `st.pc`, `st.comp` kept as the views the rules read | E1 | `src/engine/95_combat.js` (`addActor`, `actors`) | Done |
| One exchange, one transaction, shared by the screen, the player model and the story runs | playbook §07 | `src/engine/97_encounter.js` (`exchange` and its steps) | Done |
| The numbered order and whom each move is aimed at, on slips and badges | C-70, F-11 | `RB.combatLogic.order`; `src/ui/80_combat.js`, `82c_battle_intents.js` | Done |
| Wait: chosen on purpose, answers nothing, shows the next moves | E9, F-09 | the rules (`kind: 'wait'`); the screen confirms it | Done |
| Conditions: a rule table (condition × family), bounded spread, durations, the place; the "Here:" line from the same rule; named on slips with a note | E4, E5 | `src/engine/95a_conditions.js`; the screen | Done |
| Guests and neutrals with agendas and reactions; objects to protect; on the party's slip, never on your menu | E1, E3, E6 | `RB.encounter.guests`; the screen | Done |
| Arrivals: scheduled, called (a summoner, capped), telegraphed ("coming: in 2 exchanges"), preventable by a bell or a rope; never on Relaxed; joining the stage | E2 | `RB.encounter` (`schedule`, `arrive`, `coming`); the screen | Done |
| Objectives and authored conclusions (win, end, lose) | E6, E17 | `RB.encounter.conclude`, `test` | Done |
| Procedures: restarts to the start or the last stable step, the interpretation shown before a step commits, stepping away, Resolve this step | E7, E11 | `RB.encounter` (`procAct`, `solvedKey`); `src/ui/80s_encounter.js` | Done |
| Conversations: stances, the record of claims, choices with language steps, ordinary responses where they mean something, Wait, each companion's own options, understanding as Harmony and a joint gesture, several conclusions | E8 | `RB.encounter` (`socialAct`, `socialDrift`); `src/ui/80s_encounter.js` | Done |
| Two moves at once, plans over two exchanges, group signals | E26 | the rules (`intent2`, `then`, `signal` / `cue`) | Done |
| A Hush on one family of responses or on the modifiers, for a few exchanges; never on a bell or a voice | E26, F-10 | the rules (`st.hushed`), `RB.encounter.cards`, `RB.modifiers.offered` | Done |
| Modifier words: eleven families, thirteen natural pairings, each a trade; options (whom, which two, which to leave out); the phrase by route (typed whole, handwritten span with the rest shown, recorded as written); the breath and the two-knot rule | E27, C-72, C-74, F-12 | `src/engine/95b_modifiers.js`, `src/content/encounters/10_modifiers.js`; the screen's modifier row | Done |
| Set pieces of up to five: two rows on the stage, letters for the plates on a phone | E12, C-76 | `src/ui/83_battle_stage.js`; the screen | Done |
| Help in a story battle after a defeat: explain, suggest, point (pointed responses recorded as supplied help) | E19 | `RB.encounter.helpOffer`, `pointCards`; the screen | Done |
| Companion plans (Ask me, Protect, Reveal, Press the opening); encounter-specific companion actions; six actions shown at most, the rest a page away; actions that grow | E10, E25 | `RB.encounter` (`planned`, `compMenu`), `RB.combatLogic` (`growthOf`); Settings | Done |
| Equivalent phrasings (same effect, another language task, once taught) | E13 | word `phrasings`; the screen | Done |
| Preparation before an encounter ("Look around first?") | E14 | `RB.encounter.prepared`; the screen | Done |
| The Tactics Board: studies with a fixed toolset, a goal within committed exchanges, instant retry with what changed, a personal best | E15 | `kind: 'study'`; `src/ui/64c_tactics.js` | Done (studies placed with Manybridge, P08) |
| Roaming-world consequences: lost words come back, carried things handed over, notable creatures teach, cleared routes, field-guide stamps (twelve-chapter game) | E24 | `RB.encounter.roamingWon`; `src/engine/90_game.js` | Done (content with the chapters) |
| Lasting outcomes, outcome sets, grave outcomes shown or summarised and followed by a reflection | E17, C-11, C-65 | `finishEncounter`, `conclusionText`; Settings › Grave outcomes | Done (content with the chapters) |
| Wanderers: rare, remembered, never twice in a row | E3 | `RB.encounter.wanderer` | Done (casts with the chapters) |
| The trio note: the answers that reach every creature | E22 | the screen's coach | Done |
| Encounter content rules | playbook "authoring and diagnostics" | `tools/encounter_rules.mjs` (run by `tools/validate.mjs`) | Done |
| The fixtures, the development panel (`?dev=enc`), `!encounter` in scenes, `RB.game.startEncounter` | playbook P04 | `src/content/encounters/00_fixtures.js`, `src/ui/80t_encounter_dev.js`, `src/engine/70_script.js`, `90_game.js` | Done |
| Belongs to later packets: superbosses (E16, P15), ambushes in dungeons (E20, P07), new creature kinds (E23, with the chapters and P14), the curve test over twelve chapters (E22, with the chapters) | — | — | Planned there |

## The order within an exchange

Derived from the rules as they stood and held to the recorded battles:

1. your response (or a procedure step, or a conversational choice), and the Harmony it earns;
2. your companion's action, aimed where you aimed it; then the target goes back to yours;
3. guests and neutrals, each by its agenda, in the order they joined (in a conversation, the people react);
4. every creature still standing, in its numbered order (left to right as they stand), a creature's second move
   straight after its first;
5. the close: creatures whose knots are all free settle, what lasts a time counts down, the next moves are
   telegraphed, then calls and scheduled arrivals come, while there is room.

After each step the encounter's conclusions are checked in the order the encounter lists them; the first that holds
ends the exchange there. So a creature settled by your response never acts; a guest who frees the last knot ends the
encounter before the creature moves; a conclusion reached in the close comes before any arrival. Only a committed
exchange moves anything: reading, writing, help, previews and the settings sheet change nothing (tested).

## Contracts

### An encounter definition
`RB.content.encounters[id]`:
`{ id, kind: 'battle' | 'social' | 'procedure' | 'study', name, lead, group, setPiece, capacity, rules: { wait,
conditions, doubles }, field, actors, arrivals, extras, arrivalTable, calls, objective, conclusions, procedure,
social, study, companion, story, lasting, settleWins }`. A creature is an existing one, or `{ enemy, …changes }` for
this encounter (pattern, moves, conditions, knots): a set piece's variation, never a new species. Results: `win`,
`end` (an authored conclusion that is neither a win nor a defeat), `lose`, `flee`.

### Conditions (E4)
Burning, made of flame, wet, frozen, airborne, made of paper, made of glass, rooted; misted is the Shroud, as ever.
The table (condition × family: water, ice, wind, stone, flame, light, rope) is in `95a_conditions.js`, each rule with
its effect, its preview sentence and, where it changes nothing, a no-effect sentence. A fanned fire spreads at most
once per response, to one neighbour that was not itself a target. Burning and wet last three exchanges; frozen one,
then wet. Rain makes every creature wet and nothing can catch fire.

### Procedures (E7, E11)
A step is solved before only under the same key: procedure, step, version of its instructions, and the machine's
state when the step began. Resolve this step does what the step does (the machine moves, the creatures still act),
without a language step, records nothing new and gives no one-time reward again. A short procedure restarts from the
first step after a wrong move; a long one goes back to its last stable step. Stepping away keeps the machine.

### The campaign's record
`s.enc = { proc, solved, rewarded, defeats, outcomes, wanderers: { recent, met }, studies }`, empty for an older save
on load. New Game+ starts it fresh except the studies' personal bests (lead's decision F-08).

### Modifiers (E27)
A pairing is data: `{ mod, resp, respEn, jp (the whole phrase), hand: { before, write, after, items }, items, en, effect,
option, does, trade, wrong }`. Not listed, not offered; the response with no modifier is unchanged. Typed, the whole
phrase is written and its items (modifier, grammar point, response, partner verb) are recorded; handwritten, only the
modifier and its particle, recorded as that; the rest is shown and earns nothing. Taught by a scene setting
`mod_<id>` (concepts declared for the phases); a study or fixture may grant them all. The breath: an extended response
cannot be extended again the very next exchange.

### Companion actions that grow (E25)
`companionActions[c][k].grows: [{ when, aim, effect, name, desc }]`: the last growth whose condition holds when the
encounter begins replaces what it changes (its aim, its effect's fields, its name). Six or fewer actions are shown as
they always were; beyond six, the six most useful now, the rest a page away.

### Where encounters start
`!encounter <id>` in a scene (`_res` 1 for a win, `_enc` the conclusion's id); a map placement's `encounter`;
`RB.game.startEncounter(id)`; the Tactics Board. With creatures, the battle screen; without, the encounter screen.

## Lead's decisions (logged in 11_CONTRADICTIONS.md part F)
- F-08: New Game+ keeps the Tactics Board's personal bests (a pastime-like record) and nothing else of `s.enc`.
- F-09: Wait takes no language step: it is a decision, not an inscription, and it answers nothing, so it is never a
  way round the language work.
- F-10: A Hush of n exchanges is met for n whole exchanges (set at n + 1 by the move, counted down at each close).
- F-11: The order numbers are shown in both editions (Robin's C-70 decided them; they change no rule).
- F-12: Modifier encounters keep their length by two rules: a creature in a group keeps at least two knots where
  modifiers are allowed, and the breath (E27's fallback). Measured on the fixture: see Checks.

## Checks

Phase end, on 6f300ce (the companions' growth followed in 763fe59 and is checked there).

| Check | Command | Result |
|---|---|---|
| The recorded battles | `node tests/run-unit.mjs combat_golden` | 2/0 (1,710 battles; unchanged by the growth in 763fe59) |
| The platform on its fixtures | `node tests/run-unit.mjs encounters` | 184/0 (with the growth, 763fe59) |
| Modifiers: each pairing (preview equal to rule, effect, trade, phrase routes), the Hush on modifiers, the curve policy | `node tests/run-unit.mjs modifiers` | 127/0 |
| The encounter content rules | `node tests/run-unit.mjs encounter_rules` | 17/0 |
| New Game+ and older saves | `foundations`, `fixtures_campaign` | 67/0, 145/0 |
| Validator | `node tools/validate.mjs` | no errors |
| Combat suites after the refactor | `combat_preview`, `combat_rules`, `combat_fairness`, `combat_curve`, `battle_party`, `battle_seams` | 597/0, 241/0, 621/0, 287/0, 73/0, 12/0 |
| The platform on screen | `node tests/e2e/encounters.mjs` | 10/0 (captures `docs/screenshots/encounters/`) |
| The battle screens | `combat_ui`, `battle_group`, `combat_small`, `battle_party`, `battle_settings`, `companion_turn` | 7/0, 6/0, all ok, 14/0, 10/0, 4/0 |
| Twenty battles in a row | `node tests/e2e/battle_cycle.mjs` | stable: listeners 106 → 106, nodes 257 → 255, heap 29.5 → 30 MB |
| Presentation never changes a battle | `node tests/e2e/battle_invariance.mjs` | 640 configurations in 1,826 s, 24 fixtures, every one identical across its settings |
| Settings, saves, the pad | `settings`, `ui`, `learning_ui` | all ok, 14/0, 15/0 |
| The whole campaign | `node tests/e2e/matrix.mjs F ren 1` | PASS: all six chapters and an Atlas expedition (15.0 min) |
| The unit suite | `node tests/run-unit.mjs` | 28,748/0 |

**Not verified:** Firefox; the foldable; a person playing the fixtures (`?dev=enc`).
