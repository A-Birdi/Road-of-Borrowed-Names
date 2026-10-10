# P08 · Manybridge, Chapter 3: Eight Hundred Bridges (the Exchange)

*Playbook P08; plan [07_REGIONS.md](../plan/07_REGIONS.md) R1 (Chapter A), [03_ENCOUNTERS.md](../plan/03_ENCOUNTERS.md)
E7/E8, [05_LANGUAGE.md](../plan/05_LANGUAGE.md) L9, [14_COMPANIONS.md](../plan/14_COMPANIONS.md) seeds; sealed notes
S1 and S15 (the lead's reading; no reveal of a later chapter). Authorised by C-81; art under C-82
([AC1_ART.md](../plan/AC1_ART.md)). Twelve-chapter journeys only (`ed>=2`); the six-chapter game is unchanged.*

## The chapter in one paragraph

Tetsu's eastbound ferry, which the Saltglass board never named, finally has a destination: Manybridge (八百橋), a
canal city of merchants, porters and printers. Its bridges are forgetting their names. Each bridge carries a plaque
the boatmen steer by; as the plaques go blank, barges take wrong turns and the Tally Exchange (札場) fills with
disputes. A trading house's shipments keep "arriving" at the wrong warehouse, and the party untangles three causes:
the blanking itself; a porter who rerouted a barge on purpose to cover a loss; and an honest misunderstanding over a
notice whose condition two people read differently. One night a child is lost in the canals (found). The blanking
comes from under the Exchange, in the old lock tunnels: the Undercroft Locks, with connected water levels, and at
their heart the Nameless Bridge, a spirit taking its own spans apart so nobody crosses to the wrong place. It ends
when the bridge is given back its name, assembled from evidence gathered across the chapter. The plaque blocks, it
turns out, were cut upstream in Blockprint Row, where Chapter 4 begins.

## What P08 builds

| Part | Source | Where | State |
|---|---|---|---|
| The route: in a twelve-chapter journey after Chapter 2, Tetsu's ferry sails east to Manybridge; the inland road north opens only after Manybridge (Chapter 4's end); the six-chapter journey unchanged | R1 placement; F-32 | `src/content/ch2` hooks, `src/content/mb/` | Built (F-32): `mb.ferry_east/west`, `mb.north_washed`; unit `mb_ch3`, browser `manybridge` (the chart by edition) |
| Maps: the pier, the Exchange district, the warehouse row, interiors (the Tally Exchange, the trading house, the porters' office, the inn, the dead-letter office, the lock-keeper's house), the Undercroft Locks (three levels) and the Nameless Bridge | R1 | `src/content/mb/10_maps.js` | Built: `mb.pier`, `mb.exchange` (hub, night), `mb.kura`, six interiors; `mb.under1–3`, `mb.firstbridge` (`11_under.js`) |
| The cast, with looks, portraits and voices; the city's Kansai-flavoured speech community (the tasks stay standard Japanese) | R1 | `src/content/mb/05_data.js`, dialect files | Built: fourteen people (`05_data.js`); the city speaks standard Japanese, Suzu Kansai (F-33; 17 lines) |
| **Barge routing** (the chapter's new verb): a canal map, a package, a sentence of who sends what to whom by which way; the barge goes where the sentence sends it, right or wrong; several valid plans | R1, L9 (A3, A14) | a forge step with a canal scene: `src/ui/89e_canal.js`, `src/learn/50_forge.js` hooks | Built: `RB.ui.canal` (`89e_canal.js`), `C.canals['mb.canal_city']`, jobs `mb.route1/2` at F/E/I/A; browser `manybridge` (a wrong sentence sends the barge where it says) |
| The Tally Exchange: notices and offers with conditions; finding the condition that makes a deal impossible | R1 (A46, A48) | challenges in `src/content/mb/30_learning.js` | Built in part: the boards (`mb.board_*`), Heiji's tally and its condition read two ways (the dispute's c3/c4), route2's I tier (〜たら); a dedicated notice-reading job waits for P09's Exchange scenes |
| The Tally Exchange dispute: the game's first conflict with no creature, where Unravel does nothing (C-60) and Wait is taught (`c_wait`) | E8, C-60 | a social encounter | Built: `mb.dispute` (Wait taught: `learn_wait`); every conclusion leads on (F-34); browser `manybridge` |
| Negotiating passage with the lock-keeper | R1 (A28), E8 | a social encounter | Built: `mb.passage` (the letter, the offer, Wait); Sen's leave as the fallback (F-34) |
| The Undercroft Locks: connected water levels across rooms, lock tablets as routing sentences, the barge between levels; a story dungeon with checkpoints | R1 (A11), D6 | maps, procedures, props | Built: tablets (`mb.tablet1/3`), the west sluice, procedures `mb.locks` and `mb.greatlock` with checkpoints, Matsu's lamp as the rest place |
| The Nameless Bridge: a machine-procedure boss (three spans restored in order while answering its moves) that ends when it is given its name | E7 | an encounter with a lead and a procedure | Built: `mb.boss` (lead + procedure; three spans; the name むすびばし / 結び橋 from the evidence) |
| Five creatures: Tally Crab, Lockgate Snail, Abacus Beetle, Driftbarge, IOU Tangle; field-guide entries and help | R1 | `src/content/mb/40_enemies.js`, art | Built in content (field guide, help); art interim on Creatures A families (F-36); their own families in P16 |
| Side content owned by P08: the Bridge-Name Census (begun; finished in P09), the Rival Noodle Stalls, Boatman's Riddles (repeatable, a Distraction), the Lost Contract | R1 side quests | scenes and quests | Built: census (seven bridges, F-38), noodle stalls, Kansuke's riddles (a Distraction), the Lost Contract |
| Companion seeds: Nao's dead-letter bundle; Ren's lantern-guild mark on the plaques; Mio's and Suzu's lines in the city (their seeds are Chapter 4's) | 14_COMPANIONS | scenes | Built: `mb.nao_bundle`, `mb.ren_mark`; Mio's and Suzu's lines throughout |
| Music: Manybridge's palette (shamisen-led, brisker than Saltglass) for the city, the Undercroft and a battle a step above Saltglass's | R1 Theme, C-22 | `src/audio` | Built: four songs (`37_songs_mb.js`), zone `manybridge` (F-35) |
| The automated route through Chapter 3 at F with Ren; a browser test of routing and the dispute | playbook P08 evidence | `tests/e2e/`, `tests/unit/` | Browser `manybridge` 3/3; the automated route: in progress |

## Side content across Manybridge (assigned; none disappears)

| Side quest | Owner | Stage in P08 | Later stage |
|---|---|---|---|
| The Bridge-Name Census | P08 | the Exchange district's and warehouse row's bridges (routing and reading puzzles), recorded on the map | Blockprint and Playhouse Rows' bridges (P09); a Cartographer's survey link (P15) |
| The Rival Noodle Stalls | P08 | complete (まさ屋 and ます屋: two signs a kana apart) | the stalls at the festival (P09) |
| Boatman's Riddles | P08 | complete, repeatable as a Distraction | more riddles once the river is open (P09) |
| The Lost Contract | P08 | complete (an old canal plan against today's) | — |
| A Ghostwriter's Debt | P09 | — | complete |
| The Apprentice Printer | P09 | — | complete |
| The Missing Lead Actor | P09 | — | complete |
| Festival preparations | P09 | — | complete |

## Language by profile (Chapter 3)

| Profile | What the chapter asks |
|---|---|
| F | kana on plaques, crates and names; numbers and counters in kana; who gets this (に), with pictures |
| E | に・へ・を・から・まで・で in routing; prices and quantities; polite requests |
| I | conditions (〜たら・〜ば・なら・〜ないと) on notices and contracts; causes and excuses |
| A | hedged commitments and implication in a negotiation; reading between a contract's lines |

## Rules kept

- S1: Manybridge may show printed names lifted and contracts going blank; it must not show disagreement
  disappearing or "certainly" replacing "no", and never names what later chapters reveal.
- S15: Chapter 3's rung: printed names at a city's scale; barges lost, a family's goods gone, a child lost one night
  (found); the party's resolve, "this is bigger than one village".
- The Canal Kappa stays out (a real folklore figure; at most a told story, C9).
- Every line of new Japanese through the review ledger (self-review only, never claimed as native-reviewed).
