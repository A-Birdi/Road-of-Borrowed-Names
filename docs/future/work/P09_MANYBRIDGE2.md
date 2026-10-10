# P09 · Manybridge, Chapter 4: Blockprint and Footlights (print, stage and festival)

*Playbook P09; plan [07_REGIONS.md](../plan/07_REGIONS.md) R1 Chapter B, [08_CULTURE.md](../plan/08_CULTURE.md) C10,
C10a, C11, C15, [06_WORLD.md](../plan/06_WORLD.md) W10, W17, [03_ENCOUNTERS.md](../plan/03_ENCOUNTERS.md) E7, E10,
E17, [14_COMPANIONS.md](../plan/14_COMPANIONS.md) seeds; sealed notes S1, S15 and the companions' notes (the lead's
reading; nothing of a later chapter is shown). C-74: Unravel reaches two (いくつか) here, after the city's crowded
fights. Authorised by C-81; art under C-82 ([AC1_ART.md](../plan/AC1_ART.md)). Twelve-chapter journeys only
(`ed>=2`); the six-chapter game is unchanged.*

## The chapter in one paragraph

The blanking spreads upstream to its source. Blockprint Row's printers cut the blocks for plaques, notices, travel
papers and the name slips of lantern shades across the whole region, which is why the Hush reached every road at once.
In master Sōbē's workshop the woodblocks are going blank in their racks. Downstream on Playhouse Row the theatre is
preparing for the city's river festival, the Opening of the River (川開き, a real Edo custom with fireworks, labelled),
and its script keeps losing its characters' names; actors forget the roles they loved. The party restarts the press,
rehearses the play back into shape, and goes down into the Understage (奈落), the machinery pit beneath the stage,
where the trouble sits. The show goes on above while the machinery is brought back below. The chapter ends on the
festival night: the stalls and the procession as the party arranged them, the games, and fireworks over the canals
with the companion. The river opens; the road north from Saltglass is mended.

## What P09 builds

| Part | Source | Where | State |
|---|---|---|---|
| Blockprint Row and Playhouse Row (outdoor) and their interiors; the Understage (three levels and the boss's stage) | R1 B | `src/content/mp/10_maps.js`, `11_under.js` | Built: `mp.blockprint`, `mp.playhouse` (day and festival night), seven interiors (F-42), `mp.under1–3`, `mp.bottom`; the way up from the Exchange opens after Chapter 3; unit `mp_ch4` |
| The press (C15, W10): compose from blocks, proof, set and print, post; readers react to the blocks' tags; no grind | C15, C-24 | `src/engine/72p_press.js`, `src/ui/89p_press.js`, `src/content/mp/30_press.js` | Built (F-45): stories and notices, eight readers across the world; browser `manybridge2` (compose, proof, ink / press / peel, post, the record and a reader) |
| Rehearsal (A20, A41, A10): actors and props placed from stage directions; a scene rebuilt from a scrambled prompt-book | R1 B | `src/ui/89f_stage.js`, `src/content/mp/21_scenes_stage.js`, `30_learning.js` | Built: the rehearsal and Sakutarō's lines; browser `manybridge2` (the stage above the task; a wrong answer shows where it puts them) |
| Manzai (C11): the player as the straight one (ツッコミ); Suzu in her journeys, Genta in the others | C11 | `src/content/mp/31_manzai.js`, `mp.manzai` | Built: three bits (the last Manybridge's own 箸 / 橋 pun), two retorts at F and E, three at I and A, nothing scored; unit `mp_ch4` |
| The Understage: trap lifts, the revolve, counterweights, operated in the prompt-book's order; a story dungeon with checkpoints | R1 B, A16, A4 | `src/content/mp/11_under.js`, `33_under.js`, `23_scenes_under.js` | Built: three procedures (`mp_lifts`, `mp_revolve`, `mp_weights`), each gate opening only by working its machine; the prompt-book's pages; the bench as the rest place; restarts by F-47; unit `mp_ch4` |
| The boss, the Lord of the Understage (奈落の主): procedure and performance; the companion's actions are stage cues (E10) | E7, E10 | `src/content/mp/33_under.js` (`mp.boss`) | Built: a boss with a procedure, a stage cue for each companion, the roll call as its end; unit `mp_ch4` |
| Four creatures: Prompter's Ghost (there only once named), Misprint Moth, Loose Type Imp, Block Golem | R1 B | `33_under.js`, interim art on Creatures A families (F-36's rule) | Built; the Understage's family of battle places (`76_battle_places.js`); groups beneath the revolve (F-46) |
| Festival preparations (C10): the core three and the optional three; each visibly changes the festival | C10 | `src/content/mp/22_scenes_fest.js`, `32_festival.js` | Built (F-43); unit `mp_ch4` (every right plan becomes the festival's; a plan that could not work falls back) |
| The festival night: yukata, the stalls, the procession, fireworks with the companion (soft; reduced motion a held glow), a bonding scene | C10, C10a | `22_scenes_fest.js`, `src/engine/58f_festdress.js`, `60_render.js`, `40_company.js` | Built (F-44): the fireworks are a bond event and a kept memory for every companion; browser `manybridge2` (fireworks moving and under reduced motion; the yukata on the night only) |
| The festival's other four games: katanuki (the pad), ring toss (descriptions), word lottery (forging), taiko (rhythm words); the festival hall after | C10, P06 shell | `src/ui/88g_festival_games.js`, `src/content/pastimes/51_festival_games.js` | Built (F-49): Practice by default, Timed opt-in keeping a personal best only; booths on the night and in the hall; browser `festival_games` 5/5 |
| Wanderers (E3): a canal porter and a busker | R1 | `src/content/mp/35_ghost.js` | Built (F-52): Gonta's barge, Hayashi's crowd; unit `mp_ch4` |
| C-74's growth: いくつか, Unravel reaching two | C-74 | `mp.ikutsuka` | Built: at the top of the weight well, after the revolve's crowded fights; unit `mp_ch4` |
| Side content: the census's second stage, A Ghostwriter's Debt (expose or broker, E17), The Apprentice Printer (the player explains, A39), The Missing Lead Actor, Festival preparations: the extras; the noodle stalls at the festival; Kansuke's riddles 7–10 | R1 | `15_side.js`, `24_scenes_side.js`, `35_ghost.js`, `src/content/mb/22_scenes_side.js` | Built: every side story has its end (unit `mp_ch4`); Shinobu's debt reaches both lasting ends |
| Companion seeds: Suzu's old playbill and Koume's letter; Mio's tonic seller; Nao's rival couriers; Ren and the shade slips | 14_COMPANIONS | `20_scenes_print.js`, `21_scenes_stage.js` | Built: `mp.stagedoor`, `mp.tonic_bill`, `mp.hayate`, `mp.sobe_printed` (Ren); unit `mp_ch4` |
| Folklore seeds: the printers' oldest block in Tsuru's words; the theatre's oldest play, the Hundred Tales | R1 folklore | `mp.oldest_block`, `mp.oldest_play` | Built (F-53), each with its notebook page |
| The world after: the broadsheet, the theatre's festival play, the festival hall; the river road down from Reedwake (F-40); the north road from Saltglass mended | R1, F-32, F-40 | `22_scenes_fest.js`, `src/content/mp/10_maps.js` | Built: Kōji's boat both ways (twelve-chapter journeys), the north road open after `mb2_done`, the city's people after the festival; unit `mp_ch4` |
| Music: Playhouse Row, the Understage, the festival night, the fireworks, the boss | R1 Theme | `src/audio/38_songs_mp.js`, `39_zones.js`; taiko sounds in `40_sfx.js` | Built: five songs; zones by map |
| Records: the chapter's stamps; travel-volume pages for P16 | K1 | `src/content/mp/40_records.js` | Built (F-48) |
| Tests: unit; the automated route through Chapter 4 at F with Ren; browser tests of the press, rehearsal, a festival game and the fireworks under reduced motion | playbook P09 evidence | `tests/unit/mp_ch4.test.mjs`, `tests/e2e/manybridge2.mjs`, `festival_games.mjs`, the route from `F-ren-mb1_done.json` | Built; results at the phase end below |
| Language review | 02_FOUNDATIONS S5 | `docs/review/language/mp.json` and others | Every new line self-reviewed (1,030 unique lines; corrections listed in the ledger's reference) |

## Rules kept

- S1: may show the names in stories and plays lifted; must not show disagreement disappearing or "certainly" replacing
  "no"; never names Kasane or the grief-keeping.
- S15: Chapter 4's rung: the names in stories and plays; a playhouse that can't remember its characters; actors who
  forget the roles they loved. The party's resolve: anger on others' behalf.
- Suzu's troupe is not met here (the reunion is Chapter 11's); Koume's letter asks where she went and why.
- The press reacts to blocks, never to free text; no popularity or currency grind; proofreading is separate.
- Festival games: Practice by default (untimed, nothing kept), Timed opt-in; no reward from any score (C-17, C-55).
- Every line of new Japanese through the review ledger (self-review only).

## Phase end

Run on a clean copy of 112496c (logs kept outside the repository); details in VALIDATION.md "The expansion, P08 and P09".

| Check | Result |
|---|---|
| Browser suites it touched or could disturb (20) | 18 pass as they were; `audio_zones` crashed on the Understage's boss-only zone (a test fix; then 82/0) |
| The route through Chapter 3 (Chapter 2 fixture) | Stuck after the Undercroft's bench (a story-driver ranking gap, fixed); then 166 visits |
| The route through Chapter 4 at F with Ren (Chapter 3 fixture) | Reached `mb2_done` (237 visits; 215 with the fixed driver) |
| F/Ren through the six-chapter game and one Atlas expedition | PASS (12.5 min) |
| Unit suite | 33,136 passed, 0 failed |

After the phase end three people were renamed so that no new person shares a name with an older one (F-54, F-55),
and a validator rule now enforces it.
