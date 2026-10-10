# P10 · The Keepers' Road, Chapter 7, and the seams of Chapters 5–6

*Playbook P10; plan [07_REGIONS.md](../plan/07_REGIONS.md) R8 (and R5's seeding), [08_CULTURE.md](../plan/08_CULTURE.md)
C9, [03_ENCOUNTERS.md](../plan/03_ENCOUNTERS.md) E6–E8, E23, [14_COMPANIONS.md](../plan/14_COMPANIONS.md) (Ren's
crossroads; the others' pressure), [10_STORY.md](../plan/10_STORY.md) §4, §6a; sealed notes S1, S2, S8, S14, S15 (the
lead's reading; nothing of a later chapter is shown, and Ren's teacher stays with Ren's own quest). C-74: すべて,
Protect covering both, is this chapter's growth. Authorised by C-81; art under C-82 ([AC1_ART.md](../plan/AC1_ART.md)).
Twelve-chapter journeys only (`ed>=2`); the six-chapter game is unchanged.*

## The chapter in one paragraph

Snowbell's light is back, and Hoshino's reply must go down to Lanternfall. In a twelve-chapter journey the lower
road lies under an avalanche until spring, so the way is the old ridge road the lantern-keepers walked: the Keepers'
Road (灯守の道). Its stone lanterns have been dark for years. The party climbs past waystations, a hamlet at the Fox
Bridge and a maple ridge to a roofless lodge where Old Hisae, the last keeper living on the road, still keeps one
lamp. Behind the lodge is the keepers' scriptorium, a cave of lantern-registers; among them, the keepers' first
telling of しじま, in three versions that don't agree. The road teaches the chapter's verb: an inscription, an old
keeper's memory, a children's rhyme and a teller's scroll describe the same things differently, and the party
weighs what each can vouch for before acting on it. The chapter ends with a vigil: ninety-nine wicks, a story at
each, and the story that wants to be the hundredth. Above it all, in the hills, a shuttered hall where the keepers
once told a hundred tales keeps its door shut. At dawn the lanterns are lit along the road and the party goes down
to Lanternfall.

## The seams (the old Chapters 3–4 as 5–6, and 8)

| Seam | Six-chapter journey | Twelve-chapter journey |
|---|---|---|
| Saltglass → Cinder Orchard | the road north | the road north, mended after Manybridge (F-32, built in P09) |
| Snowbell → Lanternfall | Snowbell's east road leads down to the Lantern Road | Snowbell's east road leads up onto the Keepers' Road; Lanternfall's Lantern Road is reached from the Keepers' Road's far end once the chapter is done |
| The route chart | Snowbell–Lanternfall | Snowbell–the Keepers' Road–Lanternfall |
| Chapters 5–6's own content | unchanged | unchanged, plus three new creatures each (E23) and small changed-world lines, in twelve-chapter journeys only |

## What P10 builds

| Part | Source | Where | State |
|---|---|---|---|
| The seams above; the place on the chart; Hayate's line for the high road | R8 placement, S2 | `src/content/kr/01_region.js` | Built (F-56): Snowbell's east road and the Lantern Road's west end lead to the Keepers' Road in twelve-chapter journeys; the chart; `kr.hayate_road`; the six-chapter roads unchanged (geometry record); unit `kr_ch7` |
| The road's maps: the foot and its waystation, the cedar steps, the Fox Bridge hamlet, the maple ridge, the lodge and Hisae's hut, the shuttered hall, the pass and the way down; interiors | R8 | `src/content/kr/10_maps.js`, `02_art.js` | Built: `kr.foot`, `kr.steps`, `kr.fox`, `kr.ridge`, `kr.lodge`, `kr.hall`, `kr.descent` and four interiors; the road's props (stone lanterns dark and lit, cedars, stele, wicks, the hall's door) |
| The cast: Old Hisae, Aya at the first waystation, the woodcutter, the Fox Bridge people (the headman, an old teller, two children), the scholar copying inscriptions, two pilgrims, the etoki teller, the lodge's caretaker family | R8 | `src/content/kr/05_data.js` | Built: fifteen people with portraits; no name shared with anyone earlier (validator rule 8) |
| **Weighing tellings** (the chapter's verb): sources side by side, what each can vouch for, act on the result; any well-supported reading succeeds, a better one saves a detour; four profiles | R8, C9, A49, A5 | `src/engine/72k_tellings.js`, `src/ui/89k_tellings.js`, `src/content/kr/31_tellings.js` | Built (F-57): three tellings (the cave's order, the oil cache, the Fox Bridge's name), each source read at four profiles through its own reading task; the validator checks every telling; unit `kr_ch7` |
| **Relighting by name**: each dark lantern relights when its name is read right from the clues on the road; lit lanterns stay lit | R8 | `kr/10_maps.js` props, `kr/30_learning.js` | Built: the Welcoming, Cedar, Fox and Ridge lights (four profiles each) and the Moss Lantern's name (a one-step machine) |
| The lodge and Old Hisae: a conversation where asking back matters (A6) | R8 | `kr.hisae` (`33_cave.js`) | Built: asking back opens her; plain answers alone do little |
| The Scriptorium Cave: passages open as lanterns are relit in the order the tellings describe; a wrong telling leads to a dead end that explains itself; checkpoints | R8, D6 | `src/content/kr/11_cave.js`, `22_scenes_vigil.js` | Built (F-58): the Register Shelves (the rite), the Copying Room (a bench; the Teller's Shadow at the stairs), the Deepest Shelves (the registers; the Lantern Ghost); unit `kr_ch7` (the door only on the supported order; the dead end only after a wrong one) |
| The vigil and the Hundredth Tale: a folklore and social encounter (no Unravel, C-09) ended by finishing the ninety-ninth tale so nothing is left for a hundredth | R8, E7/E8 | `kr.vigil`, `kr.hyakuwa` | Built (F-59): three endings, all reachable (unit `kr_ch7`); Unravel never ends it |
| The shuttered hall: seen, its door shut ("the hundredth was never told"); the postgame opens it (P15) | R5 seeding | `kr.hall`, `kr.hall_door` | Built (F-64) |
| Five creatures: Wick Moth (keep a lantern lit, E6), Hundred-Year Sandal, Lantern Ghost, Moss Lantern, Teller's Shadow; interim art | R8 | `src/content/kr/33_cave.js` | Built, with the Hundredth Tale: moves their interim families deliver (F-36), lie and plea steps at four profiles; the Wick Moths' protect fight (`kr.wick_ridge`); the fairness table, the curve test's own rows |
| Wanderers and road events: the etoki teller, a pilgrim who advises; a fallen cedar, the lantern that relights only for its name, a pilgrim's lost stamp book | R8, E3, W5 | `kr.wander_kikyo`, `kr.wander_seiji`, `kr.cedar`, `kr.moss_steps`, `kr.iwa_book` | Built |
| C-74's すべて (Protect covers both), in a story scene | C-74 | `kr.subete` | Built: Hisae's saying, after the ridge's lanterns |
| Side quests: the Pilgrim's Stamp Book, Three Tellings of the Fox Bridge, The Keeper Who Stayed (permanent outcomes, intention shown first), The Rhyme of the Oil Cache, The Teacher's Inkstone (Tsuru answers by letter) | R8 | `kr/06_quests.js`, `20_scenes_road.js`, `23_scenes_side.js` | Built (F-62, F-63): every one has its end; unit `kr_ch7` |
| Companions: Ren's crossroads, unfinished lantern and night apart; Nao's, Mio's and Suzu's pressure, each with a small quarrel and making up | 14_COMPANIONS, S14 | `kr/24_scenes_comp.js`, `40_company.js` | Built (F-60, F-61): two bond events, Ren's kept memory; Ren's own quest untouched (unit `kr_ch7`); Suzu's 23 lines in Kansai |
| Music: biwa-led road theme, the cave, the vigil, the battle and the boss, a bell at the waystations; tiered between Snowbell and Lanternfall | R8 Theme, C-22 | `src/audio/38_songs_kr.js`, `39_zones.js` | Built (F-65): six songs; the zone test checks the battle and boss themes sit between Snowbell's and Lanternfall's |
| Records: the chapter's stamps; the shrine stamps; travel-volume illustrations for P16 | K1, R8 | `kr/40_records.js` | Built: the chapter and region stamps at the keepers' stand, the three shrine seals; the travel-volume pages are P16's art (F-39's rule) |
| Chapters 5–6 in twelve-chapter journeys: three new creatures each (E23), changed-world lines; the tools taught by then checked fair in their fights | E23, playbook P10 | `src/content/co2/`, `src/content/sb2/` | Built (F-66): six creatures, ed>=2 only; Heita's and Rokuta's lines; the fairness table, the curve test and the golden record |
| Tests: unit; the route through Chapter 7 at F with Ren from Snowbell's end; all four profiles in the tellings; a focused Ren test; fixtures for The Keeper Who Stayed's outcomes; F/Ren | playbook P10, roadmap 7b | `tests/` | Unit `kr_ch7` (122 checks, incl. the four profiles, Ren's night and the three outcomes); the route and F/Ren: see the phase end |

## Language by profile

| Profile | What the chapter asks |
|---|---|
| F | kana on lanterns and waystones; counting lanterns and steps; むかしむかし and simple story words |
| E | narrative past (〜ました); sequence (それから, そして); simple quoted speech (〜と言いました) |
| I | naming and custom (〜という, 〜ことになっている); comparing sources (〜によると, 〜と伝えられている) |
| A | classical set phrases in inscriptions (〜べし, 〜なり), always with a modern gloss and labelled as classical; a narrator's comment told apart from the story |

Classical forms are optional reading for A only, never needed to progress.

## Rules kept

- S1, S2: the chapter deepens the mystery and answers nothing that belongs to the finale; no new chapter explains
  しじま's origin. Hisae says nothing of Ren's teacher; Ren's personal quest is untouched.
- S15: Chapter 7's rung is a whole order's work over generations: a road of dark lanterns, the last keeper alone.
  The party's resolve: the Hush is old, and they mean to end it.
- Folklore labelled: real customs real (stone lanterns, pilgrims' stamp books, hyaku-monogatari, etoki,
  tsukumogami, the chōchin-obake); the keepers' order and its lore the game's own.
- The hall stays shut until the postgame.
- Every line of new Japanese through the review ledger (self-review only).
