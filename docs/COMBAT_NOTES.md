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

## Settings in battle (owner's request of 2026-10-03)

The owner found no Settings in battle and asked for a battle-formatted sheet
with only the safe options, no way out of a boss through the menu or a save,
and Load allowed as long as nothing of the battle survives it. Code:
`src/ui/55_settings.js` (the sheet: the folio's Settings in a battle mode),
`src/ui/80_combat.js` (`abandon()`, `live()`), `src/ui/82_battle_seq.js`
(`pause()`, `drop()`), `src/engine/80_save.js` (no saving in battle),
`src/engine/90_game.js` (the menu key; a load that does not happen),
`src/engine/70_script.js` (scenes of a campaign being left end there),
`src/ui/10_ui.js` (`popLayersIn`). Test: `tests/e2e/battle_settings.mjs`.
Screenshots: `docs/screenshots/battle_settings/`.

### Opening it, and the pause

- **Where:** a cloth **Settings** button in the scene's lower right corner
  (clear of the creatures' plates and Skip at the top and of the party on
  the left), and the menu key (C by default). The same key, Escape or
  "Back to the encounter" closes it. The folio cannot open in battle (as
  before), and Settings asked for by any route while a battle is open
  (`RB.ui.settings.open()`) opens this sheet, never the full Settings.
- **When:** while you choose a response, while your companion chooses, and
  while an exchange plays. Not during the opening lines, a line or teaching
  card when a creature changes its ways, the step-back question, the
  closing lines and rewards, or **the language task**: the sheet cannot
  open over the task (the button is gone, the key does nothing). Of the two
  options (cannot open, or open and keep the draft) this is the safer one:
  nothing of the task is touched (the draft, the pad, recognition, the
  assisted flag, a pace timer), and the task's own "Choose a different
  response" already returns, at no cost, to where the sheet opens.
- **The pause:** opening calls `RB.battleSeq.pause(true)`. The presentation
  clock stands still, no cue or result fires, no sequence ends, and the
  watchdog waits (its time is extended by the pause, so it cannot settle the
  action on resuming). The rules resolved the whole exchange before its
  sequence started and use no randomness (each creature follows its
  pattern), so there is nothing to re-roll. The
  idle animation (breathing, drifting motes) goes on: it is decoration and
  reads no state. A hidden tab still settles the playing action, as it
  always has. Closing resumes exactly where it stood. Two exceptions, both
  presentation: Instant chosen, or Reduce motion turned on, while an action
  stood paused, shows the rest of that action at once (`settle`, the same
  results in the same order, as a hidden tab does); later actions follow the
  new setting.
- **No leak back into the battle:** the sheet is a layer above the battle's
  own, so every key goes to it while it is open (keys never reach the
  responses; Escape never steps back). Closing leaves a transparent shield
  for 0.4 s that takes the second click of a double click (on Back, or on
  the dim area over a response card); a held Enter repeats nothing (the
  input layer drops repeats) and the release of Space activates nothing.
  "Load a journey…" and "Return to title…" ignore the second click of a
  double click, so they ask once.

### What it offers (the audit)

Every setting the game has, by where it is stored. **Allowed**: changed in
the sheet, applied at once, and it changes no rule, reward, learning
difficulty or campaign state. **Locked**: listed read-only in "Until the
encounter is over" with its current value and why (they change in the
folio's Settings afterwards); shown rather than hidden because they are the
ones a player looks for and should see are fixed. **Not shown**: has no
meaning in an encounter. The sheet also refuses any change that is not
allowed whatever sends it (a forged control is ignored), and offers no key
capture, key reset or storage request.

| Setting (key) | In battle | Why |
|---|---|---|
| Battle animations (`battleAnim`) | Allowed — Speed & motion | Presentation timing only; the exchange is resolved before it plays. From the next action (Instant while paused: the paused action settles). |
| Text speed (`textSpeed`) | Allowed — Speed & motion | How lines are revealed; battle timing never reads it. |
| Reduce motion (`reducedMotion`) | Allowed — Speed & motion | Presentation; a paused action settles on closing. |
| Volumes (`vol.master`, `vol.music`, `vol.sfx`, `vol.voice`), Mute (`muted`) | Allowed — Audio | Sound only. |
| Japanese voice (`voice.uri`), Speak automatically (`voice.auto`), Speech rate (`voice.rate`) | Allowed — Audio | The device's speech of lines; no rule. |
| Quiet pet sounds (`petSounds`) | Allowed — Audio | Cosmetic. |
| Dialogue leads with (`lead`), The second language (`secondary`) | Allowed — Reading | The lines' layout. Neither reveals a creature's translation: that stays behind Translate (counted as assisted), as before. |
| Spaces between words (`spacing`), Word help (`lightbulb`), Romaji in word help (`romaji`) | Allowed — Reading | Reading aids on the same text. Word help inside a question counts as assisted, as always (and the sheet cannot open over a question). |
| Suzu's speech (`suzuSpeech`) | Allowed — Reading | How Suzu's lines are worded; questions always use standard Japanese. |
| Text size (`textScale`), High contrast (`contrast`) | Allowed — Display | Layout and colour. While an action plays the overlay keeps its committed sizes, so the stage does not move. |
| Battle controls during actions (`battleControls`) | Allowed — Battle display | Where the menus go while actions play; from the next exchange. |
| What creatures are about to do (`intentDisplay`) | Allowed — Battle display | More or less room for what is already telegraphed; reveals nothing new. |
| Show pet in battle (`petBattle`) | Allowed — Battle display | Cosmetic; the pet never acts. |
| Japanese level (`learn.profile`) | Locked | Which version of each question and telegraph you meet: learning difficulty. |
| Mistakes in battle (`learn.assist`) | Locked | A rule: what a mistake costs (fixed when the encounter began). |
| Tactical challenge (`learn.difficulty`) | Locked | A rule: how many creatures and how much resolve (fixed at the start). |
| Default way to answer (`input`) | Locked | Could make the next answer easier. Inside each question you can still switch how you answer, as always. |
| Handwriting reads (`padKanji`) | Locked | What the pad accepts. Read as on the pad still works inside a question. |
| Stroke-order notes (`strokePractice`) | Locked | How strictly handwriting is checked. |
| Keys (`binds`, Reset all keys) | Locked | A remap mid-fight could leave no key for Back or Confirm, and key capture takes the next press. |
| Quest guidance (`questGuide`) | Locked (listed) | Belongs to the road (markers, hints); it reveals nothing about a creature, but has nothing to do in an encounter. |
| Menu language (`uiLang`) | Not shown | The menus outside the encounter; the battle's own words do not use it. |
| Offer to skip seen scenes (`skipSeen`) | Not shown | Scenes only. |
| Touch controls (`touch`, `touchHand`, `touchSize`) | Not shown | The touch pad belongs to exploration. |
| Show pet in exploration (`petWorld`), Keepsake counts (`keepsakeCounts`) | Not shown | Exploration and the folio. |
| Activity options (`activityChatter`, `hideTotals`, `fishSeconds`, `fishWait`) and the campaign's fishing pace (`practice.settings`) | Not shown | Roadside activities, which cannot run in battle. |
| Storage (ask the browser to keep saves) | Not shown | A storage request, not a preference. |

### Saving, loading, the title

- **No saving in battle, by any route:** while `RB.game.inBattle()` (from
  the moment a battle is asked for until its screen has handed the map
  back), `RB.save.manualSave` and a write of the playing campaign by
  `writeSlot`/`writeRecovery` throw "Saving is available after the
  encounter." and `RB.save.autosave` writes nothing (quietly; counted by
  `RB.save.skippedInBattle()`). That covers the folio's Save & Load (which
  cannot open in battle anyway), the ledger's Save, a scene's `!autosave`,
  the activities' autosaves (they cannot start in battle) and any timer.
  Copying or deleting slots writes no playing state and is unchanged. The
  sheet's foot says "Saving is available after the encounter."
- **Load and Return to title** are in the sheet's foot. Each asks first
  ("Leave this encounter and load another journey? This battle won't count —
  the creature will still be there."; the title adds that anything since the
  last save or autosave is lost), then Load opens the ledger (it asks again
  for the slot; closing it returns to the sheet with the encounter still
  paused) and Return to title goes to the title.
- **Teardown:** the campaign change (`campaign:changing`) takes the battle
  down whole before the next campaign appears (`RB.combat.abandon()`): the
  playing sequence is dropped unresolved (`RB.battleSeq.drop()`), the
  overlay, its listeners and its layers (`RB.ui.popLayersIn`), the notes,
  the banner, the badges, the stage, the battle music and any line on screen
  go; the screen stays dark until the next campaign draws, and 'combat'
  stays on the mode stack until the change replaces it, so the map being left
  cannot start another encounter meanwhile. Every await of the battle goes
  through `live()`, so the battle's coroutine never resumes: no outcome, no
  closing callback (no win, flee or defeat flag, no "You stepped back"), no
  Harmony, no rewards, no word marks, no fade over the next campaign, and
  `startBattle` and the scene that asked for the battle never continue.
  Scenes of the campaign being left stop counting as running and, should one
  ever resume, stop at their next line without writing (`70_script.js`).
  `inBattle()` is false from that moment. The loaded campaign is exactly
  its save: the boss is still at its trigger, unbeaten and unseen.
- **A load that does not happen** after the change has begun (the slot is
  open in another tab and you cancel, or the save cannot be read): the
  battle was already left, so the journey goes on from the map
  (`keepJourney()`), where the creature still is (a creature that walked
  into you engages again).

### Shenanigans ruled out

| Attempt | What happens | Test (`battle_settings.mjs`) |
|---|---|---|
| Escape a boss (or any fight without stepping back) through the menu | The sheet has no step back; Escape and X do nothing; Load and Return to title only leave by going to another journey or the title, and the boss is still there, unbeaten | boss |
| Save in the middle of a battle | Every save route refuses; nothing written to any slot or autosave | saves |
| Load the save made just before a boss | The map as saved: no win, no flag, the boss scene not seen, its trigger starts the boss again | boss |
| Open and close the sheet to dodge or re-roll a move | The pause holds the presentation; the state, telegraphs, cards and Harmony are identical after ten openings, and the creature then does the move it telegraphed before | sheet |
| Change assistance or difficulty mid-fight | Not offered (read-only); forged controls refused; the full Settings and the folio cannot open | saves |
| Use the settings to skip a learning task | The sheet cannot open over the task; the draft is kept; nothing in the sheet answers, steps back or skips | task |
| A held key or double click on Load or Close | Shield, dropped repeats, Space release inert; a double click on Load asks once | sheet, boss |
| Resize or change the text size mid-animation | The stage holds; the pause holds through a resize; the exchange ends on the rules' state | exchange |
| Return to title from a battle, then continue | No battle screen, rules, modes, layers or sequence left; `inBattle()` false; the frame loop running | boss |
| A load cancelled after the battle was left | Back on the map with the creature there | saves (an unreadable slot) |

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
