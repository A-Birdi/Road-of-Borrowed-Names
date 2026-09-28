# Combat notes: multiple enemies and Harmony (investigation, 2026-09-28)

This is an investigation only. Nothing described under "Recommendation" is
implemented. The owner has not decided how Harmony should work, and
SPECIFICATION.txt §7 asks for variety through "telegraphed patterns,
positioning, changing objectives, environmental interactions, and
conflicting priorities". It does not ask for encounters with several enemies.

## What exists (read from the code, not inferred from names)

### One creature per encounter
- **Starting a battle.** `RB.combat.start(enemyId, opts)` (`src/ui/80_combat.js`) and
  `RB.combatLogic.init(enemy, s, opts)` (`src/engine/95_combat.js`) take one
  enemy.
- **Battle state.** The state `st` holds one `enemyId`, one knot count
  (`knots`/`maxKnots`), one `pattern`, and one telegraphed `intent` (with
  `nextIntents`).
- **Art.** One creature is drawn (`RB.enemyArt.drawArt`).
- **Starting points.** Map `foes[]` entries each start their own battle, and scripted
  `battle` commands name one enemy.
- **No multi-enemy scaffolding.** There are no arrays of foes, no enemy
  targeting and no group encounter data anywhere in `src/`.

### Targeting
- **Enemy moves.** They target the party side only:
  - Strike, False promise, Chill and Mirror hit one adventurer (`target: 'rand'`).
  - Sweep and Flood hit both.
  - Gust strips every ward and hits the player.
  - The `'rand'` target is picked by a formula
    (`(round*7 + pattern index*3 + knots) % 2`); combat has no randomness.
- **Player responses.** They always act on the one creature. The one exception is
  守る (ward), where the player chooses whom to protect (`card.target` =
  'pc' or 'comp').

### Turns
- **Order.** Each round the player chooses one response and does one language step
  (one written, typed or chosen answer covers both adventurers, spec §7).
  Then the rules resolve it (`playerAct`), the creature acts (`enemyAct`), and
  the round ends (`endRound`).
- **Telegraphs.** The next move is shown before the player chooses.
- **No hidden turns.** The creature never acts while the player is reading or writing.

### Harmony (`src/engine/95_combat.js`)
- **Earning.** Harmony is kept per encounter in `st.harmony`, from 0 up to
  `harmonyMax` = 3. It goes up by 1 when a response is right on the first try
  and either answers the telegraphed move (counters it) or unravels a knot.
  Mistakes never lower it. The technique itself adds nothing.
- **Head start.** Three charms start an encounter at 1 (`effect.harmonyStart`):
  the Millstone charm, the Lens chip and the Bell-rope braid.
- **Spending.** At 3, and only with a companion, a technique card appears. There is one
  technique per companion:
  - Nao, "Read the Opening": frees 2 knots.
  - Mio, "Clearwater Draught": full resolve for both, washes away Heat, mist
    and Gathering, frees 1 knot.
  - Ren, "Lantern Ward": a 3-point ward on each adventurer, frees 1 knot.
  - Suzu, "Curtain Call": turns the move back, frees 2 knots.

  Every technique also cancels the telegraphed move and sets Harmony back to 0.
- **Reset.** Harmony is never saved, so each encounter starts from 0 (or 1 with
  a charm). A full bar waits with no decay and no overflow.
- **Display.** Harmony has its own band above the party, with a one-time
  explanation (`src/ui/81_combat_help.js`, the `combat_ui.mjs` tests).

### Partial scaffolding
- The new battle presentation is written to be target-aware (see
  `docs/ART_DIRECTION.md`, "Battle presentation"). Effects anchor to whichever
  combatant an event names, not to fixed screen spots. A second creature would
  not need the animation layer rebuilt.
- The rules, the state, the overlay layout (one foe slip, one intent paper)
  and the content format are all single-enemy.

## Recommendation (short)

**Multiple enemies should add decisions, not answers.** A second creature
doubles the knots to untie and so the number of language steps, unless the
extra creature changes which move matters. Suggested shape if it is built:

- **At most two creatures, with one response per round.** The decision is
  which telegraph to answer ("conflicting priorities", spec §7). For example:
  cool the kiln golem's rising Heat, or ward against the moth's Strike aimed
  at your companion.
- **Fewer knots each (1–2)**, so an encounter lasts about as many rounds as
  now.
- **Responses that act on the group.** 風 (wind) against both mists, 水
  against both Heats, a companion technique that hits every creature. These
  give existing words new value without new mechanics.
- **Everything shown up front.** Both telegraphs visible, untimed, and no
  creature acts while the player is writing.

**Harmony: one opportunity versus stored charges.**

| | One technique at a time (now) | Capped charges (e.g. up to 2) |
|---|---|---|
| Hoarding | None: the bar caps at 3 and resets each encounter | Only within the encounter if never carried over; trivialises bosses if carried |
| Pacing | About one technique per ordinary encounter, more in long boss fights | Lets a player save a technique for a boss phase; more planning, more to explain |
| Telegraph interaction | Use it to cancel the move you most want to stop | Two cancels in a row can skip a boss's teaching phase, so needs a cooldown |
| Companion's role | Companion identity shows once per fill | With two creatures, a charge could go to either, which gives the companion more say |

If charges are wanted, keep them per encounter, never carried between
battles, capped at 2, earned a little slower (for example 4 clean answers
per charge), and with a boss-phase rule so one charge can't bypass a newly
taught mechanic. Otherwise, keep the single opportunity. It already
rewards clean play without hoarding or new rules to learn.

Neither change is implemented. Both need the owner's decision, content
authoring (group encounters, phase rules), and rebalancing, checked with
`tests/unit/combat_rules.test.mjs` and `tests/unit/combat_fairness.test.mjs`.
