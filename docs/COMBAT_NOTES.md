# Combat notes: groups of creatures, the companion's turn, the difficulty curve

Status (2026-09-29): battles with more than one creature, the companion's
turn and a tuned difficulty curve are implemented. The Harmony question at
the end (one technique at a time or stored charges) is still open; Harmony
works as before.

The rules are in `src/engine/95_combat.js` (`RB.combatLogic`), the
companions' actions in `src/content/02_companions.js`, the player model used
by the tests in `src/engine/96_combat_sim.js` (`RB.combatSim`), the screen in
`src/ui/80_combat.js` and the stage in `src/ui/83_battle_stage.js`
(presentation: `docs/ART_DIRECTION.md` §11).

## Groups of creatures

### How many, and where
- **The setting decides.** Relaxed: always one creature. Standard: up to two.
  Demanding: up to three (`DIFF.maxFoes`).
- **A placement names its group.** A map foe may carry
  `group: { normal: [ids], hard: [ids] }`; `RB.combatLogic.groupFor(lead,
  place, difficulty)` gives the lead, then the group for the setting (a list
  written for one setting is used on the other, cut to size). The content
  validator checks every id and size.
- **The last chapter's final stretch** (the placements that already stood
  there; no new placements):

  | Map | Placement | Lead | Standard adds | Demanding adds |
  |---|---|---|---|---|
  | `sa.stacks` | w1 | Hush Wraith | Catalogue Moth | Moth, Paper Crane |
  | `sa.stacks` | w2 | Hush Wraith | Paper Crane | Crane, Moth |
  | `sa.stacks` | m1 | Catalogue Moth | Moth | Moth, Moth |
  | `sa.stacks` | e1 | Echo | Moth | Moth, Moth |
  | `sa.conduits` | g1 | Nameless Lantern | Lantern | Lantern, Crane |
  | `sa.conduits` | g2 | Nameless Lantern | Crane | Crane, Moth |
  | `sa.conduits` | c1 | Paper Crane | Crane | Crane, Crane |

- **The Atlas** (`src/atlas/30_gen.js`, seeded per run and room): a room's
  guardian always brings one creature on Standard and two on Demanding; a
  roaming creature does about half the time. The guardian of the last room
  brings its attendants (cartographer: stray and moth; bell: echo and lamp;
  gate: milestone and toll).

### The rules of a group
- **One state per creature.** `st.foes[i]` holds each creature's knots,
  pattern, telegraphed move, Heat, mist, Gathering and this round's support
  marks; `st.cur` is the target. `st.knots`, `st.intent` and the other old
  fields read and write the target's, so single-creature code, the Atlas
  wrappers and saves are unchanged (a battle is never saved).
- **Fewer knots each.** A pair has half its usual knots each, a trio 40 %
  (at least 1); a boss keeps all of its knots (`GROUP.share`, `knotsIn`).
- **They take turns.** Each creature after the lead starts a step further
  into its own pattern, so their blows do not all open together.
- **Order of an exchange.** Your response (one language step) → your
  companion's action → each creature still standing, in turn → the end of
  the round. Every creature's move is telegraphed on its slip before you
  choose; nothing acts while you read, write, choose or open help.
- **Whom a response reaches** (`TAG_REACH`, `reachOf`): water and wind act on
  every creature; light and rope on the target; stone, warmth, fire, bell,
  voice and healing answer that move from every creature (they guard the
  party); a ward goes before the one you choose. Unravel, the answers to a
  move and a truth act on the target. The keyword help says this per word.
- **Techniques in a group** (single-creature numbers unchanged): Nao's is
  aimed at the target; Mio's washes every creature; Ren's wards stand
  against every blow; Suzu's Curtain Call turns every creature's move back,
  and each of the others loses a knot too.
- **Each creature settles on its own** (its line, its slip marked, it stops
  acting; the target moves on). The encounter is won when the last one
  settles. The placement's own flag and rewards are given once.
- **Unchanged guarantees.** One language step per exchange; mistakes cost at
  most 1 per exchange, whatever the group; assisted mode has no mistake
  penalty; recognition uncertainty never causes damage; defeat returns you
  to the checkpoint with nothing learned lost.

### Targeting
- **The default target** is the most threatening creature standing
  (`defaultTarget`, `threatOf`), and it is remembered from exchange to
  exchange until it settles.
- **Choosing** (`RB.combat.target(i)`): press a creature on the stage or its
  slip (mouse or touch), the arrow keys on the slips (a radio group), or
  `[` and `]` anywhere in the battle. Screen readers hear each creature's
  knots and move, and "Target: …" when it changes.
- **Previews:** pointing at a response (or moving to it with the keyboard)
  marks every creature and ally it would act on; the marks stay while its
  step is open and clear on "Choose a different response".

## The companion's turn

- **Flow.** After your response's one language step succeeds, the response
  is queued (nothing is applied). Your companion's menu opens: support
  moves, no language step. "Back to <you>" (or Escape) returns to your
  choice with nothing lost: the rules are not called, and resolve, knots,
  Harmony and the once-per-encounter uses are exactly as before. Choosing
  an action resolves the exchange: response → companion → creatures.
- **Aiming.** An action aimed at a creature acts on the target; choosing
  another creature while the menu is open aims the companion there without
  changing your own target. The menu previews each action like a response.
- **A new action** is marked New and announced once (a short note); the
  first menu of a campaign explains the turn once.
- **When the queued response is the technique,** the companion is part of
  it (their menu offers only "Join the technique").

### The arsenal (`C.companionActions`)

| Unlock | Nao | Mio | Ren | Suzu |
|---|---|---|---|---|
| joins you | Spot the opening: a right-first-time answer readies a two-knot Unravel | Warm draught: +1 each | Lamp ward: 1 before whoever the blow aims at | Heckle: the target's blow 1 softer; its False promise falls flat on a right answer |
| `ch2_done` | Call out its aim: the target's blow 1 softer | Salve: +2 to whoever has less | Flare the lamp (once): burns off the target's mist and Gathering | Draw its eye: the target's blow at you comes at Suzu |
| own quest | Lend a hand (once): one more knot on a right-first-time answer | Clearing vapour (once): washes the target's Heat, mist and Gathering | Keep watch (once): 2 before each of you | Encore (once): one more Harmony on a right-first-time answer |
| `lq_ally1` | Seize the opening (once): the target's move comes to nothing | Smelling salts (once): nobody falls below 1 this round | Raise the lamps (once): mist off every creature, the Hush breaks, any Shroud or Hush about to fall is stopped | On her own cue (once): a feint, the target's move comes to nothing |
| `lq_ally2` | Take half (once): every blow at you this round is shared, Nao takes the larger half | Right beside you (once): +3 each | Stand in front (once): 3 before you | Grand gesture (once): every creature taking aim at you aims at Suzu |

- **The late alliances keep the scenes' promises.** `lq_ally1` is set when
  Chigusa decides (`src/content/lq/30_fare.js`: the companion will "move
  before you have to ask", "without waiting for your signal"; toast: "act
  on their own initiative"): each companion's action there is one they take
  unprompted. `lq_ally2` is set at the Koharuno lantern
  (`src/content/lq/40_road.js`: "I'll take half", "I'm right beside you",
  "I'll stand in front of you", "I'll draw the audience's eye"; toast:
  "stand with you"): each one shares or takes what comes for you.
- **Overlaps worth knowing:** Suzu's `lq_ally2` gesture is her `ch2_done`
  "Draw its eye" for every creature at once; Nao's `lq_ally1` "Seize the
  opening" shares its theme with his first action "Spot the opening" (that
  one readies a stronger Unravel; this one cancels a move).
- **Traits that stay passive:** Nao reads each creature's next two moves;
  Ren starts each encounter behind a small ward; once per encounter Suzu
  turns aside a blow that would leave one of you at 2 or less.
- **Folded in, not doubled:** the old per-exchange passives (Mio's draught,
  Nao's opening, Ren's lamp against a Gathering, Suzu's laugh at a false
  promise) are now actions; none of them happens by itself any more.
- **Support, not play:** the technique is still the companion's one strong
  act. The curve below checks that companions do not shorten the language
  work (rounds with a companion stay at least 70 % of rounds alone; the
  whole arsenal at least 85 % of the first action alone).

## Difficulty curve

`tests/unit/combat_curve.test.mjs` plays every story encounter, every group
placement and the Atlas rooms and guardians of four seeded runs through the
real rules with `RB.combatSim` (a player who reads the telegraphs and slips on
one answer in four), at every setting, alone and with each companion (with
the words and companion actions available at that point of the story). It
asserts: nothing is lost or left stalled; Relaxed is single and gentle (an
ordinary encounter never leaves you below half); a group stays within 5
exchanges and half a resolve bar of its lead alone at the same setting, and
costs more resolve on average (a step up); companions do not shortcut the
language steps. It prints the table this summary comes from.

Battle resolve now follows the setting: Relaxed 14, Standard 12, Demanding
10 (`DIFF.resolve` existed but was unused); it is restored after each
encounter as before.

Ordinary encounters, with a companion (the story's usual case) — average
exchanges / lowest resolve left, as a share of the bar:

| Setting | Ch 1 | Ch 2 | Ch 3 | Ch 4 | Ch 5 | Ch 6 | Ch 6 groups | Atlas rooms (groups) | Atlas guardian |
|---|---|---|---|---|---|---|---|---|---|
| Relaxed | 2.8 / 93 % | 3.0 / 79 % | 2.3 / 100 % | 2.4 / 93 % | 3.0 / 86 % | 2.9 / 93 % | single: 3.2 / 93 % | single: 2.4 / 93 % | 4.5 / 93 % |
| Standard | 3.0 / 83 % | 3.1 / 67 % | 2.4 / 92 % | 2.5 / 83 % | 3.0 / 75 % | 2.9 / 83 % | pairs: 3.1 / 83 % | pairs: 3.0 / 92 % | +1: 5.3 / 83 % |
| Demanding | 3.8 / 70 % | 4.1 / 40 % | 3.6 / 80 % | 3.9 / 70 % | 4.5 / 60 % | 4.0 / 60 % | trios: 4.1 / 70 % | trios: 4.7 / 70 % | +2: 7.5 / 90 % |

Alone (the model's worst case; the story gives you a companion early):

| Setting | Ch 1 | Ch 2 | Ch 3 | Ch 4 | Ch 5 | Ch 6 | Ch 6 groups | Atlas rooms (groups) | Atlas guardian |
|---|---|---|---|---|---|---|---|---|---|
| Relaxed | 3.0 / 93 % | 3.1 / 71 % | 2.3 / 79 % | 2.4 / 79 % | 3.2 / 86 % | 3.2 / 86 % | single: 3.6 / 86 % | single: 2.8 / 79 % | 6.0 / 79 % |
| Standard | 3.3 / 83 % | 3.6 / 75 % | 2.8 / 92 % | 2.6 / 75 % | 3.4 / 75 % | 3.2 / 75 % | pairs: 4.0 / 58 % | pairs: 3.4 / 75 % | +1: 7.0 / 75 % |
| Demanding | 4.3 / 40 % | 4.9 / 50 % | 4.0 / 50 % | 4.2 / 40 % | 5.6 / 50 % | 5.2 / 50 % | trios: 5.6 / 40 % | trios: 8.6 / 20 % | +2: 9.0 / 30 % |

Every encounter in both tables is won at every setting (100 %). What it shows:
- **Relaxed stays single and gentle**: never more than one creature; an
  ordinary encounter never leaves you below 71 % even alone.
- **Groups are a step, not a spike**: with a companion, a pair on Standard
  lasts 3.1 exchanges against 2.9 for an ordinary creature of the chapter
  and costs a little more resolve (1.1 against 0.8 on average); a trio on
  Demanding 4.1 against 4.0 (2.6 against 1.7).
- **The steepest case** is an Atlas trio on Demanding played alone (8.6
  exchanges on average, 14 at most, lowest 20 %); with a companion it is
  4.7 / 70 %.
- **Tuning that got it there:** the group knot shares; staggered patterns
  (without them a Demanding trio of Atlas milestones and toll gates could
  open with three blows together); the Stacks' echo trio at Demanding (its
  lantern swapped for a second moth); the model's stall-breaking (a policy
  that answered only the most dangerous move could stall against a mending
  keeper).

## Known limits
- **320×640 portrait:** the stage keeps its 60 px minimum, as it does with one
  creature; the creatures show partly behind the panels there. The slips,
  the telegraph and the response list are compacted; everything stays
  reachable.
- **A short phone stage** (390 px wide): the creature furthest left can
  stand partly behind the party.
- **On the map** only the lead of a group is drawn; the others appear when
  the battle starts.
- **Atlas run modifiers** that act on a creature's move apply to each
  creature's move; those that act on the exchange apply once.

## Harmony: one opportunity versus stored charges (open)

Unchanged: Harmony is per encounter, 0–3, +1 for a response right on the
first try that answers a move or unravels a knot, never lowered by mistakes;
at 3 (with a companion) the technique card appears, and the technique
cancels the target's move and empties Harmony. Three charms start an
encounter at 1.

| | One technique at a time (now) | Capped charges (e.g. up to 2) |
|---|---|---|
| Hoarding | None: the bar caps at 3 and resets each encounter | Only within the encounter if never carried over; trivialises bosses if carried |
| Pacing | About one technique per ordinary encounter, more in long boss fights | Lets a player save a technique for a boss phase; more planning, more to explain |
| Telegraph interaction | Use it to cancel the move you most want to stop | Two cancels in a row can skip a boss's teaching phase, so needs a cooldown |
| Companion's role | Companion identity shows once per fill | With a group, a charge could go to either creature, which gives the companion more say |

If charges are wanted, keep them per encounter, never carried between
battles, capped at 2, earned a little slower (for example 4 clean answers
per charge), and with a boss-phase rule so one charge can't bypass a newly
taught mechanic. Otherwise keep the single opportunity: it rewards clean
play without hoarding or new rules to learn. This needs the owner's
decision.
