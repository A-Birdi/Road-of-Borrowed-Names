# P04 · The encounter platform

*Playbook P04; plan `docs/future/plan/03_ENCOUNTERS.md` (E1–E27). Authorised by C-81. Everything new is reached only
from encounter content; a battle of the six-chapter game plays exactly as before (1,710 recorded battles, below).*

## What P04 builds

| Part | Source | Where | State |
|---|---|---|---|
| The recorded battles: every creature alone and in its groups, every setting, alone and with each companion, both player models | playbook "all existing combat results before feature activation" | `tools/combat_golden.mjs`, `tests/fixtures/combat_golden.json`, `tests/unit/combat_golden.test.mjs` | Done |
| Participants: one list of everyone in the encounter (`st.actors`), with `st.foes`, `st.pc`, `st.comp` kept as the views the rules read | E1 | `src/engine/95_combat.js` (`addActor`, `actors`) | Done |
| One exchange, one transaction, shared by the screen, the player model and the story runs | playbook §07 | `src/engine/97_encounter.js` (`exchange` and its steps) | Done |
| The numbered order and whom each move is aimed at | C-70 | `RB.combatLogic.order` | Engine done; screen below |
| Wait and watch | E9 | the rules (`kind: 'wait'`), offered where an encounter allows it | Engine done; screen below |
| Conditions with a rule table, bounded spread, durations, and the preview from the same rules | E4, E5 | `src/engine/95a_conditions.js` | Engine done; screen below |
| Guests and neutrals with agendas; reactions to what you did | E1, E3 | `RB.encounter.guests` | Engine done; screen below |
| Arrivals: scheduled, called (a summoner, capped), telegraphed, preventable; Relaxed never | E2 | `RB.encounter` (`schedule`, `arrive`, `coming`) | Engine done; screen below |
| Objectives and authored conclusions (win, end, lose) | E6, E17 | `RB.encounter.conclude`, `test` | Engine done; screen below |
| Procedures, restarts to the start or the last stable step, stepping away, Resolve this step | E7, E11 | `RB.encounter` (`procBegin`, `procAct`, `solvedKey`) | Engine done; screen below |
| Social encounters: stances, a claims record, choices, ordinary responses where they mean something, Wait, each companion's own options, agreement as Harmony, several conclusions | E8 | `RB.encounter` (`socialBegin`, `socialAct`, `socialDrift`) | Engine done; screen below |
| Two moves at once, plans over two exchanges, group signals | E26 | the rules (`intent2`, `then`, `signal` / `cue`) | Engine done; screen below |
| A Hush on one family of responses, for a few exchanges; never on a bell or a voice | E26 | the rules (`st.hushed`), `RB.encounter.cards` | Engine done; screen below |
| Set pieces of up to five on the creatures' side; group shares for four and five | E12, C-76 | `init(…, { maxFoes })`, `GROUP.share` | Engine done; two-row stage below |
| Help after defeat in a story encounter: explain, suggest, point | E19 | `RB.encounter.helpOffer`, `s.enc.defeats` | Engine done; screen below |
| Wanderers: rare, remembered, never twice in a row | E3 | `RB.encounter.wanderer`, `s.enc.wanderers` | Engine done; casts come with the chapters |
| Tactics Board studies: a fixed toolset, a goal within committed exchanges, a personal best | E15 | `kind: 'study'`, `s.enc.studies` | Engine done; the board below |
| Encounter content rules | playbook "authoring and diagnostics" | `tools/encounter_rules.mjs` (run by `tools/validate.mjs`) | Done |
| The fixtures (ordinary fight, summoner, guest, protected object, short and long machines, disagreement, Hush recovery, two moves, arrivals, every modifier option, studies) | playbook P04 | `src/content/encounters/00_fixtures.js` | Done |
| Modifier words: eleven families, thirteen natural pairings, each a trade; the phrase by route (typed whole, handwritten span with the rest shown); the Hush on modifiers; the breath and the two-knot rule (F-12) | E27, C-72, C-74 | `src/engine/95b_modifiers.js`, `src/content/encounters/10_modifiers.js` | Engine done; screen below |
| Companion plans and encounter-specific companion actions; the six-action menu | E10, E25 | encounter actions done (`companionOptions`) | Plans to do |
| The screens: order numbers, conditions, guests, objects, arrivals, objectives, two-move slips, hushed cards, Wait, procedures, conversations, the two-row stage | E1–E27 | — | To do |
| Roaming-world consequences: lost words, cleared routes, quest carriers, notable creatures, field-guide stamps | E24 | — | To do |
| Equivalent expressions; preparation before an encounter | E13, E14 | — | To do |

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

## Lead's decisions (logged in 11_CONTRADICTIONS.md part F)
- F-08: New Game+ keeps the Tactics Board's personal bests (a pastime-like record) and nothing else of `s.enc`.
- F-09: Wait takes no language step: it is a decision, not an inscription, and it answers nothing, so it is never a
  way round the language work.
- F-10: A Hush of n exchanges is met for n whole exchanges (set at n + 1 by the move, counted down at each close).
- F-11: The order numbers are shown in both editions (Robin's C-70 decided them; they change no rule).
- F-12: Modifier encounters keep their length by two rules: a creature in a group keeps at least two knots where
  modifiers are allowed, and the breath (E27's fallback). Measured on the fixture: see Checks.

## Checks

| Check | Command | Result |
|---|---|---|
| The recorded battles | `node tests/run-unit.mjs combat_golden` | 2/0 (1,710 battles) |
| The platform on its fixtures | `node tests/run-unit.mjs encounters` | 152/0 |
| Modifiers: each pairing (preview equal to rule, effect, trade, phrase routes), the Hush on modifiers, the curve policy | `node tests/run-unit.mjs modifiers` | 127/0 |
| The encounter content rules | `node tests/run-unit.mjs encounter_rules` | 14/0 |
| Validator | `node tools/validate.mjs` | no errors |
| Combat suites after the refactor | `combat_preview`, `combat_rules`, `combat_fairness`, `combat_curve`, `battle_party`, `battle_seams` | 597/0, 241/0, 621/0, 287/0, 73/0, 12/0 |
| The battle screen after the refactor | `node tests/e2e/combat_ui.mjs`; `battle_group.mjs` | 7/0; 6/0 |
