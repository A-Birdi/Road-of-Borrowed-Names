# Look-and-feel review — people, places and props across the whole game

For the owner's paired addendum of 2026-10-03 (World Idle Life, Character Mannerisms, and Animated
Dialogue Portraits) §3, §9, §10 and §12.5. **Phase A** (the first version of this ledger) was done **from the
source** at `20277f1`: maps, NPC placements, props and their art specs, ambience, the scene manifest and the
character registrations, plus one cheap capture of the dialogue portraits. It ran no play session and no map
captures.

**Kept current** (CONTRACT.md WI19, WI28): this version is on the task branch after `c2a799d`, with the
actor system, the animated portraits and the world-review fixes merged, plus the props and environment balance
pass. That pass looked at a running build:
- 29 representative places in headless Chromium at 1280×800, covering every chapter, Koharuno and an Atlas room
  (`tests/e2e/props_balance.mjs`);
- every placed prop kind measured over 12 s.

Its record, with before/after numbers and captures, is `docs/expressive/reports/props_review.md`.

The by-eye judgements below are a worker's reading of captures. No person has reviewed them on a real screen.
Battles were skipped, as the addendum allows.

**Classes of finding** (paired §10.1): **[IP]** already addressed in current in-progress work · **[AD]** likely
addressed by another active addendum (the Harmony / Expressive Storytelling addendum) but not yet implemented ·
**[ACT]** still unresolved, worth actioning now · **[KEEP]** a strength to preserve. A finding fixed since Phase
A keeps its Phase A class and gets a **Now** status: *fixed* (by what, with evidence), *partly*, or *open*.

## 0. The ledger now

### Fixed since Phase A, and by what

- **The overworld actor system** (merged `4a9c357`; Masaru's kneading `ec34081`; VALIDATION.md "Overworld actor
  system"): 76 mannerism profiles (26 bespoke) and a profile derived from station and tool for every other NPC.
  It brings:
  - station and occupation idles, route pauses, neighbours turning to each other;
  - glances at arrivals, departures, examined objects and snow;
  - player and companion ambient life, and shared stillness;
  - restraint moods (Lanternfall before its bell, the Archive road, the storm-night inn);
  - reduced motion held.

  It fixes R1–R3, R8, R9, R15–R18, R21–R23, R28, R29, R32, R33, R37 and R39, and the people half of R4 and R30.
  Evidence: actor_life 39/39 and actor_workplaces 30/30 (lead's runs).
- **Scene direction** (same merge): 7 staged scenes (`sg.omi_wataru`, `rw.hana_first`, `co.suzu_night`,
  `co.hiro_first`, `sb.yae`, `lf.mio_refuse`, `sa.isamu_return`). This is part of R6; the rest is in progress
  (another worker is staging Chapter 1–2 scenes).
- **Animated dialogue portraits** (`1be42bd`, pushed with `fe75862`; world review WR-02): idle loops, lead-in
  cues and the eye-area fixes. This fixes R5. This pass adds a check from the scripts' side
  (`tests/unit/portrait_speakers.test.mjs`):
  - all 88 speakers have a portrait;
  - the 45 with 20 or more lines all have a living loop;
  - every tag their lines use has a cue under 900 ms that settles.
- **World review WR-04, WR-05 and the two listed checks** (`089ade7`, `7b4ae3c`; `docs/review/
  WORLD_REVIEW_RECONCILIATION.md`):
  - the four long-quest landmarks drawn at art resolution (Koharuno, `lf.gardens`, `sb.road`);
  - Masaru's bakery fitted out;
  - Nao's floorboard drawn in `rw.warehouse`;
  - the Star Stair's observatory no longer cut off (`sb.obs_path` headroom).
- **The props and environment balance pass** (this pass; `docs/expressive/reports/props_review.md`; findings
  N1–N10 and N14 below):
  - props that contradicted their own text now match it;
  - scenery glints no longer read as pickups;
  - lamps and light pools are calm;
  - the campfire, Hiro's furnace and the lighthouse lens are slower;
  - 27 usable tables and desks show what their scenes describe lying on them;
  - the potter's wheel reads against its floor.

  This completes R4, R10's balance note and R24, and the props half of R30.
- **Conversation continuity** (this pass; `tests/unit/conversation_continuity.test.mjs`): every staged gesture is
  checked against the person's profile. Three escalations are documented and seven findings are open (N12).

### Open, honestly

| # | Class | What is still open | Why / who |
|---|---|---|---|
| R6 | [AD] | Most "performed overworld" scenes of the manifest are not staged (7 are; Chapter 1–2 in progress) | the scene-staging worker |
| R7, R20, R34 | [AD] | The chapter sequences (illustrated close-ups) are not built; the tide window and the prologue are the only pictures | the sequence/interlude worker |
| R35 | [ACT] | Lanternfall after its turning point: the lines say the town gets noisy, the people do not change. Profiles support `states: [{ if, … }]`, but none is written | actor-system profiles (`src/content/mannerisms/`) |
| R36 | [ACT] | The fence quarrel in `lf.gardens`: social turns come from proximity only, with no `pairs` map data. Whether the two neighbours turn to each other was not checked | actor-system data |
| R41 | [AD] | The epilogue revisits: no profile switches on story flags yet (same `states` hook) | actor-system profiles, with the sequence worker |
| N11 | [ACT] | Two pairs of characters read alike in portrait and sprite: **Tamae** (the Gull) and **Yae** (Yukimiya) share skin, a red head-wrap (`#c8503a`/`#b8483a`), round eyes and an apron; **Ōmi** and **Umi** share a dark hat, sharp eyes, skin tone and high collar. They never meet, but a player can take one for the other | character looks: an owner's call (not changed here) |
| N12 | [ACT] | Seven gesture-vocabulary findings in the staged scenes (Suzu's head shake, Tadashi's surprise tell against his scene, Hana's point, Yae's aside and half-raise, Wataru's size gesture) | profiles or scenes (the documented cases in `conversation_continuity.test.mjs`) |
| N16 | [ACT] | Asahi wipes her brow (a heat habit) while her furnace is now cold, before the ash arrives | a `states` switch in her profile (actor system) |
| R5 (rest) | [ACT] | Phones at device-pixel ratio 1, 2 and 2.625 still show the 64-px portrait unevenly scaled | the portrait worker (CSS / a phone art size) |
| — | — | Everything above is headless Chromium only: no Firefox, Safari or real phone, and no person's look | — |

### Strengths (kept)

- R10: the environment craft. It is now measured: 64 animated prop kinds × option sets, every one holding one
  frame with reduced motion.
- R11, R12, R19, R25–R27, R31, R38, R40.
- The restored mill (the wheel at 9.5 changes a second is the place's subject).
- The great lamp's lively flame (Chapter 4's subject, kept lively on purpose).
- The puzzle props that change state, which stay quick so they read.

## Summary for the owner (no plot details)

- **Assessed:** all 91 maps of Chapters 1–6 and Koharuno, the 199 NPC placements and 71 recurring characters,
  the 1,504 placed props and the dialogue portraits. Phase A did this from the source; this pass measured
  29 places and every placed prop kind in a running build, and added an Atlas room.
- **People now carry the busy places.** Phase A found every person idling the same way while props did the
  moving. With the actor system, people own most of the on-screen motion where they gather:
  - the Saltglass quay (79 %);
  - the Cinder Orchard square (75 %);
  - the Snowbell square and inn (86 % and 76 %);
  - the Reedwake square (62 %);
  - the teahouse (89 %).

  The numbers are in the props review.
- **What this pass changed:**
  - **Props that said one thing and showed another:** the glassworks furnace burned before its fire was
    lit; the lighthouse lens shone full on rationed oil; a "faintly warm" kiln blazed; a disused kiln wore the
    puzzle seal's mark.
  - **Decorations that looked like things to pick up:** sparkles with pools of light at the lookout, the
    conduits and the Drowned Archive's counter.
  - **Lamps everywhere twinkling about seven times a second, and every pool of light pulsing together:** now
    about twice a second, each on its own beat.
  - **Bare tables whose scenes describe a letter, an order slip or two cups on them:** now drawn.
- **Strongest assets:** unchanged — water, lanterns, smoke, weather, dark interiors lit by your lamp, the
  restored mill, the tide window, the town animals, and the comings and goings.
- **Still open:** most performed scenes and all chapter close-ups (other workers); Lanternfall's change after
  its turning point; two pairs of look-alike characters; phone portrait scaling; and every by-eye judgement
  still needs a person.
- **Counts:** Phase A had 41 findings (2 [IP], 5 [AD], 24 [ACT], 10 [KEEP]). Of its 24 [ACT], 22 are fixed and
  2 are open (R35 partly, R36). This pass adds 16 (N1–N16):
  - 11 fixed: N1–N10 and N14;
  - 3 open [ACT]: N11, N12, N16;
  - 2 [KEEP]: N13, N15.

  The tally is at the end.

## 1. Whole game

| # | Class | Finding (Phase A) | Now |
|---|---|---|---|
| R1 | [ACT] | Every person idles identically (breathing, blinking, a random body turn every 5–12 s) | **fixed**: mannerism profiles and the idle scheduler (`4a9c357`); actor_life (2–12 people change pose per area, never more than the cap at once) |
| R2 | [ACT] | Wanderers step, stop and step again with no pause | **fixed**: route pauses (actor_life: "a wanderer pauses on their round") |
| R3 | [ACT] | Groups never interact | **fixed** in general (neighbours turn to each other for a word); no `pairs` data yet (R36) |
| R4 | [ACT] | Props outclass people where both are busiest | **fixed**: occupation idles, plus this pass. People's share of on-screen motion, before → after this pass (props review, place balance): the Saltglass quay 74 → 79 %, the Cinder Orchard square 68 → 75 %, the Snowbell square 70 → 86 % and inn 68 → 76 %, the Reedwake square 57 → 62 %; lamps calmer everywhere |
| R5 | [ACT] | Portraits still; eye areas hard to read | **fixed** (`1be42bd`, WR-02); phones at ratios 1, 2 and 2.625 still scale unevenly (open) |
| R6 | [AD] | Story emotion carried by text; no gestures | **partly**: 7 staged scenes; Chapter 1–2 staging in progress |
| R7 | [AD] | Key moments seen at tile scale only | **open** [AD]: sequences not built |
| R8 | [ACT] | The companion is a following token | **fixed**: companion presence and shared stillness (WI16, WI17) |
| R9 | [ACT] | The player has no idle beyond breathing | **fixed**: the strap, a look, a weight shift after 3 s still (WI15) |
| R10 | [KEEP] | Environment craft | **kept and balanced** this pass (N6–N8) |
| R11 | [KEEP] | Town animals and pets | kept |
| R12 | [KEEP] | People come and go; dialogue never moves the camera | kept (world_view) |
| R13 | [IP] | Area feel through sound | **landed**: zone music (REQUIREMENTS ZM1–ZM3) |
| R14 | [IP] | Battle presentation | **landed**: the battle addendum and the Harmony cut-in (`95f4708`) |
| R15 | [ACT] | Reduced motion must cover every new motion | **fixed**: actor_life and portrait_anim; this pass: every placed prop kind holds one frame (props_balance) |

## 2. Chapter by chapter

### Chapter 1 — Reedwake

| # | Class | Place | Finding (Phase A) | Now |
|---|---|---|---|---|
| R16 | [ACT] | `rw.tea` | Hana still although her motif is pouring | **fixed**: she pours and tidies (profile); staged `rw.hana_first`; people make 89 % of the teahouse's motion (props review) |
| R17 | [ACT] | `rw.hall` | The four candidates stand identically | **fixed**: bespoke companion rests and habits |
| R18 | [ACT] | `rw.apoth`, `rw.carpenter`, `rw.house1`, `rw.house2` | Mio, Bunta, Oto and Kiku without occupation | **fixed** by profiles (unit: every placement has a habit it can do); this pass: Mio's apothecary notebook drawn open on her table (N9) |
| R19 | [KEEP] | `rw.village`, `rw.millroad`, `rw.mill1–2` | Lanterns, reeds, water, the mill | kept; the square's lanterns calmer (N6) |
| R20 | [AD] | `rw.bridge_scene` | The emotional close at tile scale | **open** [AD] |

### Chapter 2 — Saltglass

| # | Class | Place | Finding (Phase A) | Now |
|---|---|---|---|---|
| R21 | [ACT] | `sg.harbor` | A working harbour whose workers are still | **fixed**: Daigo, Kiyo, Tetsu, Sōta, Fuku have profiles; the quay's motion is 79 % people (74 % before this pass's lamp change) |
| R22 | [ACT] | `sg.office` | The turning point's room is still | **fixed**: Ōmi writes (actor_workplaces); staged `sg.omi_wataru`; this pass: her desk shows the mountain of papers and three cold cups (N9) |
| R23 | [ACT] | `sg.inn` | Tamae still through her lunch rush | **fixed** by her profile; this pass: the writing desk shows paper and ink (N9) |
| R24 | [ACT] | `sg.glass` | The kiln has no glow; Asahi still | **fixed** this pass: cold and ashen until the ash arrives (its scene: "The fire is out"), then lit with the gather turning slowly (N1); Asahi has her profile; her brow-wiping while the furnace is cold is N16 |
| R25 | [KEEP] | `sg.tide_wait`, `sg.lighthouse_top` | The tide window; the lighthouse top | kept; this pass: the lens below is small and dim until the oil arrives (N2) |
| R26 | [KEEP] | the Drowned Archive | Pages, ink, lanterns, water | kept; the counter's post-battle glint made faint (N5) |

### Chapter 3 — Cinder Orchard

| # | Class | Place | Finding (Phase A) | Now |
|---|---|---|---|---|
| R27 | [KEEP] | `co.village` | The most mobile town | kept; Nobu's kiln shows embers, not an open fire (N3); Sayo's seating chart drawn (N9) |
| R28 | [ACT] | `co.eve` | A still crowd at dusk | **fixed**: social idles (actor_life's Chapter 3 area) |
| R29 | [ACT] | `co.festival` | People stand still at the festival | **fixed**: social idles (the actor system; actor_life's Chapter 3 area is the same square at dusk) |
| R30 | [ACT] | `co.glass`, `co.pottery` | Hiro still; Nobu's wheel does not turn | **fixed** for Hiro (WR-03); the furnace's throb slower (N8). The wheel **stays still** on purpose: its text says the clay is still damp and nobody is at it. It now reads against the floor (N10) |
| R31 | [KEEP] | terraces, upper, old works, kiln | Leaves, motes, embers, darkness | kept; the old workshop row's bisque kiln no longer wears the Great Kiln's seal mark (N4) |

### Chapter 4 — Snowbell

| # | Class | Place | Finding (Phase A) | Now |
|---|---|---|---|---|
| R32 | [ACT] | `sb.inn` | The fullest room is entirely still | **fixed**: Yae stirs and counts; guests look to the road (actor_workplaces); the shogi game left mid-play drawn on its table (N9) |
| R33 | [ACT] | `sb.hamlet` | Nobody reacts to the snow | **fixed**: snow reactions (WI10); people make 86 % of the square's motion (70 % before this pass) |
| R34 | [AD] | `sb.obs_dome` | The chapter's moment | **open** [AD]; the great lamp keeps its lively flame [KEEP]; the Star Stair's observatory headroom fixed (`089ade7`) |

### Chapter 5 — Lanternfall

| # | Class | Place | Finding (Phase A) | Now |
|---|---|---|---|---|
| R35 | [ACT] | `lf.town` | The largest town is the stillest; nothing changes after the turning point | **partly**: calm before the bell is now deliberate (restraint mood), and its lampposts no longer twinkle (N6). The after-bell idle set is **open** (no profile `states`) |
| R36 | [ACT] | `lf.gardens` | The fence quarrel plays still | **open**: no `pairs` data; not checked by eye |
| R37 | [ACT] | records, clerks, café, bakery, inn | Clerks and hosts still | **fixed** by profiles; Masaru kneads (WR-05); this pass: the bakery's order slips, the café's plate, the council's open book, Akari's card, the clerk's piled ledgers drawn (N9) |
| R38 | [KEEP] | the tower, the bell chamber | Gears, conduits, the bell | kept (gears turning are machinery; no people there) |

### Chapter 6 — the Archive road and the Archive

| # | Class | Place | Finding (Phase A) | Now |
|---|---|---|---|---|
| R39 | [ACT] | `sa.camp` | People round a campfire stand still | **fixed**: Isamu sits by the fire (actor_workplaces); the fire calmer (N8) |
| R40 | [KEEP] | reading room, stacks, conduits, memories, heart | Cabinets, crystals, the core | kept; the conduits' basin glints made faint (N5) |
| R41 | [AD] | the walk back | Epilogue idles should show what changed | **open** (no profile `states`) |

### Koharuno and the Atlas

- `lq.koharu`: the great persimmon and the stone of names redrawn (WR-04, `089ade7`); the tree-keeper's ledger
  drawn open on the hut's table (N9). [KEEP]
- The Unwritten Atlas: its lamps and waystones calmer like every lamp (N6: 2.1 and 1.75 changes a second, were
  5.8 and 5). An Atlas room (seed 4242) was among the measured places. [KEEP]

### New findings of this pass (N1–N16)

From the running build. Before/after for each is in the props review.

| # | Class | Finding | Now |
|---|---|---|---|
| N1 | [ACT] | `sg.glass`: the furnace glowed before its fire was lit (scene: "The fire is out"), and was static after ("Orange glass turns slowly") | **fixed**: cold until `sg_boss_done`, then the gather turns (2.8 changes/s) |
| N2 | [ACT] | `sg.lighthouse`: the lens shone full while "the flame is small; oil is being rationed" | **fixed**: dim until `sg_boss_done` (76 bright px against 273 after); a slower pulse (6.2 → 4 changes/s) |
| N3 | [ACT] | `co.village`: Nobu's "faintly warm" kiln showed an open fire | **fixed**: a low bed of embers (3 warm px, was 188) |
| N4 | [ACT] | `co.oldworks`: a disused kiln wore the Great Kiln's glass-seal mark nine tiles from the real seal (a false lead); its text says "choked with ash" | **fixed**: choked with ash, no seal mark |
| N5 | [ACT] | The sparkle that means "something to find" was decoration at the lookout (8, each with a pool of light over the dark), the conduits (3) and the Drowned Archive's counter (1) | **fixed**: a faint glint (1.4 changes/s, 4 bright px against a pickup's 88) with no pool of light; the sea-glass pickups unchanged |
| N6 | [ACT] | Every lamp (lanterns, lampposts, shrines, the lamp rack, glass lanterns, the Archive's and the Atlas's lamps) dipped every 150–200 ms: 4–6.7 changes a second, a street of them twinkling like a sign | **fixed**: steady with two dips per turn, 1.3–3 changes/s |
| N7 | [ACT] | Every pool of light on a dark map pulsed together (one `sin(t/180)`) | **fixed**: each on its own phase, slower (`60_render.js drawLighting`) |
| N8 | [ACT] | The campfire redrew its whole flame 11 times a second, more motion than the three people at the Archive-road camp; Hiro's furnace mouth throbbed 6.6 times a second | **fixed**: 7.9 and 4.3 changes/s |
| N9 | [ACT] | 27 usable tables and desks whose scenes describe what lies on them (an order slip, a letter, two cups with one upside down, a shogi game, a tray, envelopes, a register) were drawn bare | **fixed**: drawn (dashes, never letters); e.g. the pottery's order-slip table 30 % → 39 % of its pixels apart from the floor, Ōmi's desk 35 % → 42 % |
| N10 | [ACT] | `co.pottery`: the potter's wheel (the room's key prop) melted into the wood floor | **fixed**: slip-grey head and darker damp clay with a sheen, 40 % → 49 % apart; still, as its text implies |
| N11 | [ACT] | Look-alike pairs: Tamae and Yae; Ōmi and Umi | **open** (owner's call) |
| N12 | [ACT] | Seven gesture-vocabulary findings in staged scenes | **open** (WI25 test lists them) |
| N13 | [KEEP] | The mill wheel and gears, the great lamp, the harbour fog and ferry: subjects whose motion is the point | kept |
| N14 | [ACT] | Lanternfall before its bell: its lampposts were the town's main motion | **fixed** with N6 (the calm stays deliberate); the after-bell set is R35 |
| N15 | [KEEP] | Trees and bushes lean a pixel in a wave with calm spells: quiet wind, never in step | kept |
| N16 | [ACT] | Asahi's heat habit (wiping her brow) plays while her furnace is cold | **open** (a `states` switch in her profile) |

## 3. Props: over- and under-animation (measured)

Phase A could only scan the art specs. This pass drew every placed prop kind and option set alone over 12 s,
at 40 ms steps (`tests/e2e/props_balance.mjs` part 1). That is about 270 kind × option sets (269–271: the Atlas
rooms vary slightly between pages) from the authored maps and three Atlas seeds; 64 animate.

- **Over-animated, now calmer:** lamps (N6), the campfire and Hiro's furnace (N8), the lighthouse lens (N2), and
  the light pools (N7).
- **Over-bright or misleading, now quiet:** the decor sparkles (N5) and the disused kiln's seal mark (N4).
- **Dead where the story is alive, now alive:** the glassworks furnace once lit (N1).
- **Still where the story is still:** the potter's wheel (damp clay, nobody at it), counters, desks and shelves.
  People do the work there (the actor system), and the props show what the scenes describe (N9).
- **Busy by design:** the mill wheel and gears; the great lamp; the fog over the causeway; the puzzle props while
  they work, such as the clamp post's wind (25 changes/s while that puzzle is live). All [KEEP].
- **Place balance** (part 4, `--places`): props review §3.

## 4. Tally

| | Phase A | Now |
|---|---:|---|
| [IP] | 2 (R13, R14) | both landed |
| [AD] | 5 (R6, R7, R20, R34, R41) | R6 partly; R7, R20, R34, R41 open |
| [ACT] | 24 | 22 fixed; R35 partly; R36 open |
| [KEEP] | 10 | all kept |
| New this pass | — | 16: 11 fixed (N1–N10, N14), 3 open [ACT] (N11, N12, N16), 2 [KEEP] (N13, N15) |

## 5. What was assessed — every map (Phase A data)

Generated in Phase A from the content at `20277f1` (the counts are not re-generated; this pass added props to no
map and changed no placement, only options): size, interior/exterior (by region and size; heuristic), NPC
placements (wanderers), props (animated by the static art-spec scan, and chimneys), ambience, and how many
scenes start on the map (of which on the main road, personal quests, long questlines or endings).

#### Chapter 1

| map | name | size | kind | people (wander) | props (animated: kinds) | ambience | scenes started here (story) |
|---|---|---|---|---:|---|---|---:|
| `rw.village` | Reedwake | 50×36 | exterior | 13 (2) | 40 (14: lantern, water, fw_slipscreen, fw_clamppost, reeds) + 3 chimney | — | 63 (14) |
| `rw.hall` | Lantern Hall | 11×10 | interior | 5 (0) | 11 (4: shrine, lantern, pa_lamprack) | dark 0.35 | 17 (7) |
| `rw.tea` | Hana's Teahouse | 9×9 | interior | 3 (0) | 12 (1: stove) | — | 14 (6) |
| `rw.apoth` | Mio's Apothecary | 9×9 | interior | 1 (0) | 10 (0) | — | 6 (1) |
| `rw.warehouse` | River Warehouse | 11×9 | interior | 1 (0) | 11 (0) | — | 4 (1) |
| `rw.carpenter` | Bunta's Workshop | 9×8 | interior | 1 (0) | 5 (0) | — | 6 (0) |
| `rw.house1` | Oto's House | 8×8 | interior | 1 (0) | 5 (0) | — | 6 (0) |
| `rw.house2` | Kiku's House | 9×8 | interior | 1 (0) | 5 (0) | — | 6 (0) |
| `rw.ferry` | Kōji's Ferry House | 8×8 | interior | 0 (0) | 5 (0) | — | 2 (1) |
| `rw.road` | The Lantern Road | 32×18 | exterior | 0 (0) | 7 (4: lantern) | — | 6 (0) |
| `rw.millroad` | The Mill Road | 26×26 | exterior | 5 (0) | 15 (10: millwheel, lantern, reeds, echo) | motes | 17 (2) |
| `rw.mill1` | The Old Mill | 15×12 | interior | 0 (0) | 11 (3: millstone, gears) | motes, dark 0.45 | 6 (3) |
| `rw.mill2` | The Mill Loft | 13×9 | interior | 0 (0) | 9 (4: lantern, echo) | motes, dark 0.5 | 5 (1) |
| `rw.mill0` | The Wheel Pit | 16×10 | interior | 0 (0) | 5 (0) | dark 0.55 | 1 (0) |

#### Chapter 2

| map | name | size | kind | people (wander) | props (animated: kinds) | ambience | scenes started here (story) |
|---|---|---|---|---:|---|---|---:|
| `sg.road` | The Coast Road | 40×22 | exterior | 0 (0) | 8 (4: lantern) | — | 7 (1) |
| `sg.harbor` | Saltglass | 56×42 | exterior | 13 (2) | 88 (36: lantern, lamppost, sg_ferry, sparkle, water, sg_fog, fw_pulleypost, fw_winch, fw_floattank, cs_bellpost) + 3 chimney | — | 89 (11) |
| `sg.office` | Harbour Office | 11×9 | interior | 2 (0) | 8 (0) | — | 13 (6) |
| `sg.inn` | The Gull | 13×10 | interior | 3 (0) | 15 (1: stove) | — | 15 (5) |
| `sg.warehouse` | No. 2 Warehouse | 13×10 | interior | 1 (0) | 14 (0) | — | 10 (3) |
| `sg.glass` | Asahi's Glassworks | 10×9 | interior | 1 (0) | 8 (0) | — | 12 (1) |
| `sg.lighthouse` | Lighthouse | 9×10 | interior | 2 (0) | 8 (1: sg_lens) | — | 16 (2) |
| `sg.lighthouse_top` | Top of the Lighthouse | 11×8 | interior | 1 (0) | 46 (2: sg_vane) | sea calm | 6 (1) |
| `sg.tidehut` | Tide-Watch Hut | 9×8 | interior | 1 (0) | 6 (0) | — | 10 (4) |
| `sg.isamu` | Isamu's House | 8×8 | interior | 0 (0) | 6 (0) | — | 4 (0) |
| `sg.cove` | The Fishers' Cove | 30×20 | exterior | 0 (0) | 7 (2: sparkle) | — | 7 (0) |
| `sg.da_entry` | Drowned Archive — Receiving Hall | 24×18 | exterior | 0 (0) | 9 (4: lantern, ink) | pages, dark 0.42 | 7 (1) |
| `sg.da_stacks` | Drowned Archive — The Stacks | 30×22 | exterior | 0 (0) | 11 (4: lantern, ink) | pages, dark 0.42 | 6 (0) |
| `sg.da_reading` | Drowned Archive — Reading Room | 18×14 | exterior | 0 (0) | 9 (2: lantern) | motes, dark 0.3 | 5 (0) |
| `sg.da_sluice` | Drowned Archive — Sluice Channels | 28×20 | exterior | 0 (0) | 17 (12: sg_raft, lantern, water) | pages, dark 0.42 | 4 (0) |
| `sg.da_vault` | Drowned Archive — Returns Counter | 20×16 | exterior | 1 (0) | 9 (3: lantern, sparkle) | pages, dark 0.38 | 2 (0) |

#### Chapter 3

| map | name | size | kind | people (wander) | props (animated: kinds) | ambience | scenes started here (story) |
|---|---|---|---|---:|---|---|---:|
| `co.road` | The Orchard Road | 36×20 | exterior | 0 (0) | 18 (3: lantern) | leaves | 8 (1) |
| `co.village` | Cinder Orchard | 52×40 | exterior | 11 (8) | 58 (12: co_lookout, co_glasslantern, co_seat, lantern, bush) + 4 chimney | leaves | 36 (5) |
| `co.eve` | Cinder Orchard at dusk | 52×40 | exterior | 14 (0) | 49 (8: co_lookout, lantern, co_seat) + 4 chimney | leaves, dark 0.25 | 7 (0) |
| `co.festival` | The Autumn Festival | 52×40 | exterior | 14 (2) | 57 (16: lantern, co_lookout, co_seat, co_glasslantern) + 4 chimney | fireflies, dark 0.55 | 23 (0) |
| `co.hall` | Chronicle Hall | 13×10 | interior | 1 (0) | 12 (2: lantern) | dark 0.2 | 7 (1) |
| `co.inn` | Fusa's Inn | 13×10 | interior | 3 (0) | 14 (1: stove) | — | 10 (3) |
| `co.glass` | Glass Workshop | 13×10 | interior | 3 (0) | 13 (2: co_furnace, fw_tray) | dark 0.15 | 13 (1) |
| `co.pottery` | Nobu's Pottery | 11×9 | interior | 1 (0) | 8 (0) | — | 6 (0) |
| `co.post` | Shino's Post House | 9×8 | interior | 2 (0) | 6 (0) | — | 7 (0) |
| `co.terraces` | The Terraces | 44×34 | exterior | 4 (3) | 32 (0) + 1 chimney | leaves | 16 (2) |
| `co.ume` | Ume's House | 9×8 | interior | 0 (0) | 6 (1: stove) | — | 1 (0) |
| `co.upper` | The Upper Terraces | 40×30 | exterior | 0 (0) | 18 (1: lantern) | motes | 5 (0) |
| `co.oldworks` | The Old Workshop Row | 40×26 | exterior | 0 (0) | 14 (2: co_seal, lantern) | motes, dark 0.12 | 7 (0) |
| `co.icehouse` | The Ice House | 11×10 | interior | 0 (0) | 9 (0) | dark 0.35 | 3 (0) |
| `co.kiln` | The Great Kiln | 30×24 | exterior | 0 (0) | 16 (0) | embers, dark 0.45 | 7 (0) |
| `co.kiln_core` | The Kiln's Heart | 15×12 | interior | 0 (0) | 5 (3: co_glasslantern, co_furnace) | embers, dark 0.4 | 3 (1) |
| `co.lookout` | The Lookout | 16×12 | interior | 0 (0) | 19 (8: sparkle) | fireflies, dark 0.5 | 2 (0) |

#### Chapter 4

| map | name | size | kind | people (wander) | props (animated: kinds) | ambience | scenes started here (story) |
|---|---|---|---|---:|---|---|---:|
| `sb.road` | The Snowbell Road | 36×22 | exterior | 2 (0) | 15 (5: lantern, shrine, campfire) | snow | 14 (7) |
| `sb.hamlet` | Snowbell | 46×36 | exterior | 19 (8) | 34 (8: lantern, sb_icewall, fw_warmbox) + 5 chimney | snow | 44 (4) |
| `sb.inn` | Yukimiya Inn | 17×12 | interior | 17 (0) | 16 (3: sb_irori, lantern) | dark 0.12 | 28 (3) |
| `sb.inn_room` | Upstairs at Yukimiya | 9×8 | interior | 0 (0) | 5 (1: lantern) | dark 0.15 | 4 (0) |
| `sb.post` | The Post Shelter | 10×8 | interior | 1 (0) | 9 (1: stove) | — | 6 (1) |
| `sb.hoshino` | Hoshino's House | 11×9 | interior | 1 (0) | 11 (1: stove) | dark 0.15 | 8 (1) |
| `sb.goatshed` | Tetsuji's Goat Shed | 12×9 | interior | 5 (2) | 8 (0) | dark 0.2 | 4 (0) |
| `sb.sachi` | Sachi and Kanta's House | 9×8 | interior | 1 (0) | 6 (1: stove) | — | 3 (0) |
| `sb.fuki` | Fuki's House | 8×7 | interior | 1 (0) | 5 (1: stove) | dark 0.15 | 3 (0) |
| `sb.obs_path` | The Star Stair | 28×40 | exterior | 0 (0) | 20 (6: sb_observatory, lantern, shrine, deadtree) | snow, dark 0.1 | 15 (0) |
| `sb.obs_hall` | Observatory — Ground Floor | 20×16 | exterior | 0 (0) | 18 (1: sb_icewall) | dark 0.35 | 7 (1) |
| `sb.obs_charts` | The Chart Room | 16×12 | interior | 0 (0) | 17 (4: stove, sb_icewall) | dark 0.4 | 6 (0) |
| `sb.obs_gallery` | The Upper Gallery | 20×14 | exterior | 0 (0) | 14 (0) | dark 0.4 | 7 (1) |
| `sb.obs_dome` | The Lamp Room | 14×12 | interior | 1 (0) | 8 (2: sb_greatlamp) | dark 0.5 | 6 (0) |

#### Chapter 5

| map | name | size | kind | people (wander) | props (animated: kinds) | ambience | scenes started here (story) |
|---|---|---|---|---:|---|---|---:|
| `lf.road` | The Lantern Road above Lanternfall | 36×22 | exterior | 0 (0) | 8 (4: lantern) | leaves | 6 (1) |
| `lf.town` | Lanternfall | 52×40 | exterior | 6 (3) | 24 (3: lf_grate) + 2 chimney | — | 25 (3) |
| `lf.gardens` | The Garden Quarter | 34×24 | exterior | 5 (1) | 21 (4: orchard, shrine, fw_alcove, fw_display) + 1 chimney | leaves | 26 (2) |
| `lf.sluice` | The Sluice Shore | 34×28 | exterior | 1 (0) | 17 (1: lf_sunktower) + 1 chimney | — | 13 (1) |
| `lf.records` | Public Records Hall | 17×12 | interior | 2 (0) | 11 (2: lantern) | dark 0.12 | 12 (3) |
| `lf.council` | Council Chamber | 15×10 | interior | 1 (0) | 11 (2: lantern) | dark 0.15 | 7 (2) |
| `lf.clerks` | Clerks' Office | 13×9 | interior | 1 (0) | 11 (0) | — | 10 (1) |
| `lf.inn` | The Lamplit Inn | 13×10 | interior | 2 (0) | 13 (1: stove) | — | 8 (0) |
| `lf.cafe` | Ritsu's Café | 11×9 | interior | 1 (0) | 11 (1: stove) | — | 5 (0) |
| `lf.bakery` | Masaru's Bakery | 9×8 | interior | 1 (0) | 8 (2: stove) | — | 4 (0) |
| `lf.ferry` | Ferry Office | 11×9 | interior | 1 (0) | 8 (0) | — | 7 (2) |
| `lf.tokuji` | Tokuji's Hut | 8×8 | interior | 0 (0) | 6 (0) | — | 2 (0) |
| `lf.stacks` | Basement Stacks | 24×16 | exterior | 0 (0) | 13 (4: lantern, lf_conduit) | pages, dark 0.55 | 5 (0) |
| `lf.tower_top` | Belfry Loft | 16×12 | interior | 0 (0) | 9 (1: lantern) | dark 0.45 | 4 (1) |
| `lf.tower_upper` | Upper Floor | 20×16 | exterior | 0 (0) | 31 (21: lf_flood) | dark 0.5 | 4 (0) |
| `lf.tower_mid` | Gate Works | 22×18 | exterior | 0 (0) | 138 (130: gears, lf_conduit, echo, lf_flood) | dark 0.5 | 8 (0) |
| `lf.tower_low` | Drowned Stair | 20×18 | exterior | 0 (0) | 27 (19: lf_flood) | dark 0.58 | 5 (0) |
| `lf.bellhall` | Bell Chamber | 16×14 | exterior | 0 (0) | 10 (4: lf_bigbell, lf_conduit) | dark 0.5 | 8 (2) |

#### Chapter 6

| map | name | size | kind | people (wander) | props (animated: kinds) | ambience | scenes started here (story) |
|---|---|---|---|---:|---|---|---:|
| `sa.road` | The Archive Road | 36×26 | exterior | 0 (0) | 11 (4: lantern) | pages | 13 (2) |
| `sa.camp` | Last Lamp Hut | 28×20 | exterior | 5 (0) | 10 (2: lantern, campfire) + 1 chimney | snow | 15 (4) |
| `sa.hut` | Last Lamp Hut | 11×9 | interior | 1 (0) | 11 (1: stove) | dark 0.2 | 10 (1) |
| `sa.gate` | The Archive Gate | 30×22 | exterior | 4 (1) | 12 (8: sa_statue, sa_grave, lantern, deadtree, bush, sa_pipe) | pages | 9 (2) |
| `sa.reading` | The Reading Room | 28×20 | exterior | 6 (1) | 38 (12: sa_cabinet, lantern, sa_gate, sa_door) | pages, dark 0.15 | 17 (3) |
| `sa.stacks` | The Stacks | 32×24 | exterior | 0 (0) | 18 (9: sa_gate, crystal, ink) | pages, dark 0.3 | 8 (1) |
| `sa.conduits` | The Quiet Conduits | 30×22 | exterior | 0 (0) | 15 (10: sa_pipe, sparkle, water, lantern) | dark 0.45 | 4 (1) |
| `sa.memories` | The Room of Set-Down Memories | 24×18 | exterior | 2 (0) | 19 (4: crystal, sa_cabinet) | motes, dark 0.2 | 18 (3) |
| `sa.study` | The Keeper's Study | 15×12 | interior | 0 (0) | 11 (2: sa_lamp, sa_door) | dark 0.35 | 8 (1) |
| `sa.heart` | The Heart of the Hush | 25×20 | exterior | 2 (0) | 6 (2: sa_hushcore) | pages, dark 0.4 | 6 (0) |

#### Koharuno (long questline)

| map | name | size | kind | people (wander) | props (animated: kinds) | ambience | scenes started here (story) |
|---|---|---|---|---:|---|---|---:|
| `lq.koharu` | Koharuno | 36×24 | exterior | 1 (0) | 9 (2: lantern, deadtree) | leaves | 14 (4) |
| `lq.koharu_hut` | The Tree-Keeper's Hut | 9×8 | interior | 0 (0) | 7 (0) | dark 0.25 | 2 (0) |
