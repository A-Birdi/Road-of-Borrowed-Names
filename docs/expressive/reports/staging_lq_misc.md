# Staging pass — long quests, cases, Pages, pets, Company, shiritori and the Atlas (§16 whole-game coverage)

Records what this pass changed, what was run and what was observed. Categories as in VALIDATION.md:
**B** = real browser test (Playwright/Chromium, the built `index.html`), **U** = node unit/content test,
**R** = code review/static inspection only, **H** = still needs a human.

Scope: (1) the 30 performed scenes the Chapter 1–2 pass decided but could not stage (its report, "Remaining"):
the long quests "A Fare Thirty Years Owed" and "The Name Nobody Calls" first, in story order, then the deduction
cases, The Pages We Keep and the pet vignettes — together with the rest of those quests', cases' and vignettes'
scenes in the same files (some fall in Chapters 3–5; their chapter passes decide them but the files are this
pass's); (2) the other "Performed overworld" drafts of the "—" row of `docs/expressive/SCENES.md` (material not
tied to one chapter: the Company, the pet greetings, Pages II–III and the ending extensions, the road talk,
shiritori's "How we played", the case talks and the Unwritten Atlas), each reviewed by reading and decided `(C)`.
Not this pass's: the scenes in `src/content/ch3`–`ch6`, the illustrated scenes (`co.assembly`, `co.festival_begin`,
`sb.lamp_name`, `sb.lamp_reply`, `sb.next_day_inn`, `sb.quiet_morning`, `lf.bell_touch`, `lf.boat_to_tower`,
`sa.toya_read`), battle and sequence files. Direction only: no line, branch, quest step, item or outcome was added,
removed or reworded (with staging off, every case's first branch ends in exactly the state the staged run ends
in; below).

## Outcome

142 decisions in `tools/scene_curated_misc.mjs` (merged into the manifest's `CURATED` after the chapter passes'
files; 8 inline reactions in `CURATED_INLINE`): **110 staged** (Performed, decided), **32 Quiet by design**
(decided, with the reason). The manifest's "—" row has no heuristic "Performed (H)" entry left (**U**
`scene_manifest.test.mjs`).

| | staged | Quiet | played (B) |
|---|---:|---:|---:|
| long quests (`src/content/lq`) | 25 | 0 | all |
| deduction cases and keepsakes (`src/content/cases`) | 12 | 4 | all staged |
| pets: vignettes (8) and the sixteen greetings (`src/content/pets`) | 24 | 2 | all staged |
| The Pages We Keep (`src/content/pages`: retro, unfinished, offer, camp, home, home2, ask3, home3) | 8 | 17 | all staged |
| the Company (`src/content/company`: reflections, topics, rituals, invitations) | 34 | 0 | all |
| shiritori, How we played (`src/content/wordplay/20_reflect.js`) | 4 | 0 | all |
| the Atlas (`src/atlas/60_scenes.js`) | 3 | 9 | all staged |

(Quiet in Pages counts the three Hall arrivals `pages.enter_*`, whose staging is positions only, the three
Page II fragments, the five ending extensions `end.*` and six road topics.) The exact per-scene list is the table
below; 113 data-driven cases, 485 branches.

## What was added

- **Direction in the scene files**: `!gesture`, `!look`, `!pose`, `!prop`, `!walkto` cues on the lines they belong
  to and a `# Staged:` note at the top of each staged scene saying what it shows. As in the Chapter 1–2 pass: the
  speaker carries the line, at most one smaller listener response; attention to an object is a turn to it and
  back (`!look … pc` where the conversation goes on); the player is neutral unless the line is theirs or the
  narration says what they do; where lines branch by companion each answers in their own vocabulary; one larger
  gesture at a scene's turn, not on every line. Scenes told "anywhere" (Company talks, Pages, greetings,
  shiritori, the retrospective) are position-free: looks and gestures only.
- **Authored positions** (`!walkto`), each chosen on the map and checked in every branch:
  - the companion steps off the doorway tile where the follow rule leaves it: the teahouse (`lq.fare_koji`,
    `lq.fare_pay`: 4,7), Chigusa's stall at the gardens (`lq.fare_chigusa`: 10,12), the bridge by the far bank
    (`lq.road_loops`: 47,19), the Lantern Hall (`pages.enter_retro/unfinished/offer`: 6,8);
  - the player steps to the giver's side so a handover reads side-on: Tamae's seal (`lq.fare_gull`: 7,3, with
    Chigusa to 8,3), Ume's dried persimmon handed on (`lq.road_ume`: 13,23), Yasu on the pier (`lq.road_yasu2`:
    off the dead-end pier to 33,24 first, see Findings), the lantern by the far bank (`lq.road_write`: 48,18; the
    companion to 47,17 and back to 48,19), Kayo's seed (`lq.road_home`: 22,9), Shiori's shell button
    (`cs.shell_shiori`: 5,3), Nobu's swallow (`cs.swallow_nobu`: 5,5);
  - Chigusa stands to lay out the fare (`lq.fare_pay`: 5,5); Genzō to the window (`cs.view_window`: 5,3).
  No NPC map placement was changed.
- **One gesture and fourteen held props**, in new files of this pass:
  - `src/engine/51e_gestures_misc.js`: `pointup` — reaching up into a tree's branches to pick (the pose layer's
    existing `pointup` key, eyes up, a lift onto the toes; the hand comes down holding the fruit). No profile lists
    it, so idle life never picks it. Used for Kayo's first persimmon (`lq.road_home`).
  - `src/engine/32h_props_misc.js`: `coins`, `parcel`, `persimmon`, `kaki`, `wax`, `bellpart`, `shell`, `knife`,
    `shears`, `star`, `swallow`, `spool`, `leaf`, `tenugui`, added to the pose layer's prop table. Drawing only;
    no letters drawn (the parcel's label and the stamped scrap stay blank).
- **The runner** (`tests/e2e/staging_runner.mjs`, used by `staging_chapters.mjs`):
  - fixtures `cases` (deduction cases open or solved: `RB.cases.open`), `bond` (the companion's bond),
    `company` (records the Company keeps, e.g. The Pages We Keep's project) and a per-case `settle` bound
    (default 5 s) for a case whose story moves someone across the map (named with its reason in the fixture: the
    three Yasu cases, 15 s);
  - the history length is now taken before the scene starts, so a scene whose first line is a hook's narration
    (`pages.home2`'s `!hook pages_event`, shown in the same tick as the run begins) is followed line by line
    instead of waiting forever. No assertion was changed.
- **The group** `--ch=misc` in `tests/e2e/staging_chapters.mjs`, fixtures in `tests/e2e/staging_misc_cases.mjs`
  (113 cases, 485 branches; each lists the branches that matter: choice picks, companions, the flags and
  quest stages that change what is said or who is there).
- **Decisions** `tools/scene_curated_misc.mjs` (generated from the `# Staged:` notes, the fixtures and the
  hand-written Quiet decisions), merged by `tools/scene_manifest.mjs` after `scene_curated_ch12.mjs`; where a
  chapter pass also decides one of these folders' scenes (its chapter), this file's decision, which records the
  staging, stands. `docs/expressive/SCENES.md` and `scenes.json` regenerated.
- **Three documented escalations** in `tests/unit/conversation_continuity.test.mjs` `KNOWN` (each the narration's
  own action, outside the person's habitual vocabulary): `lq.fare_gull|tamae|stamp` ("Tamae presses it onto a slip
  of paper"), `lq.road_yasu2|yasu|sip` ("he takes a bite" of the dried persimmon), `lq.road_kayo_certainly|
  lq_kayo|fidget` ("the shears in her hand are trembling").
- **Profiles**: no change to `src/content/mannerisms/10_cast.js` (every cue fits an existing `talk`, tell,
  habit or the everyday/object classes, or is one of the three escalations above).
- `practice_b` (`30_compare.js`) quotes no line of these scenes; no index moved.

## Per-scene decisions

Direction as in each scene's `# Staged:` note (abridged where long); "branches played" is the number of branches
of that scene in `--ch=misc` (each companion counts as a branch where lines branch by companion).

#### Long quest: A Fare Thirty Years Owed (8)

| scene | ch | decision | direction / reason | branches played (B) |
|---|---|---|---|---:|
| `lq.chigusa_idle` | Ch4 | Performed, staged | Chigusa pours as she offers, and hands you the cup from her hand to yours; she laughs at your face over the strong tea. Before you know her story, you look at the one cup turned upside down on her stall. Mio laughs behind her hand at three sleepless days; Suzu's open hand. | 3 |
| `lq.fare_book` | Ch1 | Performed, staged | you take the fare book from the shelf and read down its columns, the book in your hands; once the seal has printed, you look over the stamped scrap; alone, you glance west towards the harbour town. Your companion answers in their own way (Nao looks between you and the way west, Mio's hand to her chest, Ren's open hand, Suzu's laugh at the interest). Put back for later, you bend to the shelf; reading it again, the book is in your hands. | 8 |
| `lq.fare_chigusa` | Ch4 | Performed, staged | Chigusa starts back at the old name; you hold up the stamped scrap and she leans in to it, then stands still with her head down and lets the kettle whistle; Koharuno lifts her head to you; her head goes down again over her mother's death, she looks up to ask after the ferrywoman, and bows to the news. Your companion steps up beside you and answers her in their own way (Nao's hand to the satchel of undelivered letters, Mio's open hand, Ren's open hand, Suzu flips her own book of debts); Chigusa nods, asks your help with an open hand, holds up the finished letter, looks along the road to the carts and back to you, and turns to her fire while your companion speaks to you quietly (you turn to them): Nao's restrained downward hand, Mio's self-conscious hands, Ren raises the lamp, Suzu's small celebration. | 7 |
| `lq.fare_fusa` | Ch3 | Performed, staged | Fusa turns to listen across the counter as you ask with an open hand; she laughs at the name, tells it with an open hand and a hand to her chin over the cup kept upside down. Your companion's own answer (Nao's glance aside, Mio's hand to her chest, Ren tends their lamp — "like leaving one lantern burning" — and Suzu's head goes down: the debts that never go in the books). | 4 |
| `lq.fare_gull` | Ch2 | Performed, staged | Tamae's small celebration as she tells you; Chigusa hides a laugh behind her hand, then goes round to Tamae's end of the counter and hands the seal back to her; Tamae presses it (the line says so), her head goes down over her mother's words and comes up laughing; Chigusa offers to work it off with an open hand, Tamae points at her; Chigusa's own small celebration as she heads back to the pass. You step up beside her and she gives you the kept cup from her hand to yours. Your companion's answer (Nao's nod, Mio's laugh, Ren's breath out, Suzu's open hand). | 5 |
| `lq.fare_koji` | Ch1 | Performed, staged | Kōji, his cup in hand, glances aside as he comes to the unpaid fare and takes a sip over his mother's waiting; Hana, behind the counter, looks away to the cups; the seal is small between his hands; he points east to the ferry house and turns back to you. Your companion, on the step behind you by the door (off your own tile, where the doorway's follow rule leaves them), answers in their own way (Nao's glance aside, Mio's hand to her chin, Ren's open hand to Kōji, Suzu flips her account book). | 6 |
| `lq.fare_pay` | Ch1 | Performed, staged | Kōji takes a sip of the tea Chigusa will not touch, and Hana laughs at the face she made; Chigusa comes round the small table to Kōji and holds out the coins in both hands, bows over her apology, and the coins pass to him when he takes them; he holds the fare book open for her and she writes her name; he hands her the seal (the pledge), she laughs at the pun, and looks west towards the sea she will take it to; Hana nods her off. Your companion (on the step by the door, off your tile) answers in their own way (Nao's nod, Mio leans to look at the book, Ren's glasses, Suzu's small celebration). | 6 |
| `lq.fare_tamae` | Ch2 | Performed, staged | you hold up the stamped scrap across the counter and Tamae leans in to it; she corrects herself with an open hand, thinks back to the girl in the kitchen with a hand to her chin, her head goes down over the postcard with no name, she laughs at the tea strong enough to stand a spoon in, and nods: an inn. Your companion's own answer (Nao's hand to the satchel where an undelivered letter waits, Mio's open hand, Ren's nod to Tamae, Suzu's laugh about patient debts). | 4 |

#### Long quest: The Name Nobody Calls (16)

| scene | ch | decision | direction / reason | branches played (B) |
|---|---|---|---|---:|
| `lq.kayo_idle` | Ch5 | Performed, staged | Kayo points to the young tree she grew from a seed and turns back to you; her hand goes to her chin over the village's name, and a quick nod — "certainly". Your companion's quiet aside (Mio's hand to her chest, Nao looks between her and you, Ren's hand to the chin, Suzu's glance away). | 4 |
| `lq.kayo_idle_after` | Ch5 | Performed, staged | Kayo's head goes down over the name she forgot, then a nod: she can say it now. Mio's nod. | 2 |
| `lq.kh_arrive` | Ch1 | Performed, staged | you stop where the path opens out and look along it to the empty houses and the great tree. Your companion's own answer (Nao looks along the road, Mio's slow breath out, Ren tends their lamp — glad to be a keeper — and Suzu presents the waiting stage with both hands). | 4 |
| `lq.kh_chest` | Ch1 | Performed, staged | you kneel at the open chest and lift out the folded cloth, then hold it up in both hands. Mio leans in to the dye; Suzu laughs: it suits you. | 3 |
| `lq.kh_stone` | Ch1 | Performed, staged | you bend to the mossy stone and read down its rows; the name from the pass brings your hand to your chin. Your companion's own answer (Nao leans in to the addresses, Mio's head goes down, Ren pushes their glasses up at the galling truth, Suzu's open hand over the cast list). | 5 |
| `lq.kh_tree` | Ch1 | Performed, staged | you lean in to the marks cut into the trunk and stay looking while you read them. Your companion's own answer (Nao's glance aside, Mio's hand to her chest, Ren's open hand to the tree, Suzu points up at where the next mark should go). | 6 |
| `lq.road_home` | Ch1 | Performed, staged | Kayo shades her eyes to look up into the heavy branches, stretches up and picks a fruit (her reach up), calls the tree's name with a small fist of joy, turns to the trunk and cuts her new line with her knife, and turns back; you step to her side and she gives you the seed bag from her hand to yours. Your companion's own answer (Nao's nod, Mio leans to the seed, Ren's breath out, Suzu presents the stage). | 4 |
| `lq.road_kayo` | Ch5 | Performed, staged | at the name Kayo looks to her young tree and back; her head goes down over her fear; told of the height marks she glances away, told of Yasu a small fist of joy. Your companion's own answer (Mio's flat hand: you can say no; Nao's nod; Ren's open hand; Suzu's open hand); Kayo's nod: she will go. | 6 |
| `lq.road_kayo_certainly` | Ch5 | Performed, staged | Kayo leans in at the name; your open hand as you ask her home; her quick nod — "certainly" — and her hands fidgeting with the trembling shears (the narration says so). Your companion's own answer (Nao's head shake, Mio's own fidget, Ren tends their lamp — "a certainly with the lamp gone out" — Suzu's shake). | 4 |
| `lq.road_lantern` | Ch1 | Performed, staged | you lean in to the blank shade, then look along the grassy path running east. Your companion's own answer (Nao's head shake, Mio's hand to her chest, Ren's hand to the chin over their teacher's words, Suzu's shrug). | 6 |
| `lq.road_loops` | Ch1 | Performed, staged | your companion steps off the path beside you as you walk east; the path brings you back, and you look round at the same lantern. Their own answer: Nao points east down the road that is lost, Mio looks between you and the way you went, Ren pushes their glasses up, Suzu laughs at the old trick. | 6 |
| `lq.road_tetsu` | Ch2 | Performed, staged | told unasked, Tetsu points up the river to Reedwake and turns back; asked, his hand goes to his chin; remembering the flood he looks upriver, turns back to tell of the branches, and shakes his head over the name. Your companion's own answer (Nao's nod, Mio's two hands for the graft and its tree, Ren's nod, Suzu's hand to her chin). | 6 |
| `lq.road_ume` | Ch3 | Performed, staged | Grandma Ume turns to listen to your question, looks up the terraces to the tree at the top, her hand goes to her chin over the name, she nods over the picking-day call, and you step to her side to take the dried persimmon from her hand. Your companion's own answer (Nao's nod, Mio leans to look at the fruit, Ren's hand to the chin, Suzu's laugh at the stage name). | 4 |
| `lq.road_write` | Ch1 | Performed, staged | you step up before the blank shade, Yasu beside it, and your companion goes round to the shade's other side; Yasu turns to you for his one word and nods. Once the name holds, you look along the path where the branches part; Yasu reads the shade, points to its edge for the two names, and his head goes down over Mitsu's. You write your name and your companion writes theirs beside it (side-on, from the shade's left), then answers in their own way (Nao's glance aside, Mio's nod, Ren's small formal bow, Suzu's showman's two hands) and comes back round to your side. Yasu points the way east to Koharuno and turns back, a hand to his chin for Kayo. Not yet written: his nod — no hurry. | 5 |
| `lq.road_yasu1` | Ch1 | Performed, staged | you point east to the blank lantern as you tell Yasu; his hand goes to his chin, then he points across the river to where the hamlet was and turns back; his head goes down when the name will not come. Your companion's own answer (Nao points west, down to the harbour; Mio's open hand to him; Ren's hand to the chin over their teacher's words; Suzu's laugh about the tongue's memory). | 5 |
| `lq.road_yasu2` | Ch1 | Performed, staged | you hand Yasu Ume's dried persimmon from your hand to his, and he takes a bite (the narration says so); his head goes down over the name; he points east to the lantern for you to write on, and nods that he will wait there; you step back off the end of the pier (his only way off it) to let him go ahead. Your companion's own answer (Nao's nod, Mio's breath of relief, Ren's nod, Suzu's open-handed appreciation of a good line). | 4 |

#### Long quests: letters home (1)

| scene | ch | decision | direction / reason | branches played (B) |
|---|---|---|---|---:|
| `lq.letters_home` | Ch2 | Performed, staged | Ch2 long quests: the letters from home (staged): you open the letters from home and read them, one after the other, a letter in your hands. Nao's shrug at being caught up by a courier; Ren leans in to Tsuru's hand. | 4 |

#### Deduction cases and keepsakes (16)

| scene | ch | decision | direction / reason | branches played (B) |
|---|---|---|---|---:|
| `cs.hama_parcel` | Ch2 | Performed, staged | you hold out the parcel and Hama leans in to read the address; she points east to the old landing where her workshop began, turns back, and takes it from you as hers; she unties it and holds up the small metal part, points to the call bell on its post, nods over the address that stayed alive, and gives you the wax seal from her hand to yours. | 3 |
| `cs.parcel_marks` | Ch3 | Quiet | Ch3 case 'A Parcel for a Place That Moved' (the post house's record of marks): a ledger page read in place and a clue noted, with Nao's one remark; you stand reading the ledger — attention only, the record page is the interface (as cs.parcel_record). | — |
| `cs.parcel_oldsite` | Ch2 | Performed, staged | you lean in to the old footing and the empty bracket on its post; holding the parcel out at the post, you draw it back and look at it again. Your companion's own answer (Nao's head shake, Mio's open hand, Ren leans in to the empty place, Suzu's shrug: no bouquet on an empty stage). | 6 |
| `cs.parcel_shelf` | Ch1 | Performed, staged | you bend to the shelf of unclaimed parcels and take up the small package; you read its label with it in your hands, turn it to look at the wax seal, and look along the shelf to the notice. Your companion's own answer (Nao looks between you and the shelf, Mio's hand to her chest, Ren's open hand, Suzu's hand to her chin); once you take it on, Nao's nod, Mio points west to Saltglass, Ren tends their lamp, Suzu presents the mystery with both hands. | 7 |
| `cs.rosette_box` | Ch4 | Performed, staged | you bend to the little box of paper stars and read its lid; you take one and look at it in your hand (Ren pushes their glasses up: a star does not point the way). With one already, you look at the box. | 3 |
| `cs.seto_parcel` | Ch2 | Performed, staged | you hold the parcel out; Seto takes it to look at the seal, points to the crest carved on her own door (a wave, no notch), turns back to explain with an open hand and gives it back into your hands, still sealed. | 2 |
| `cs.shell_shiori` | Ch2 | Performed, staged | Shiori's nod for the tide read right; you step up beside her desk and she gives you a shell button from her hand to yours; Mio's nod at the jar she sorted; you look at the button in your hand. | 2 |
| `cs.spool_tokuji` | Ch5 | Performed, staged | Tokuji's nod for the plates worked as they read; he holds out the spool of mending thread from his hand to yours, beside him on the shore; you look at it in your hand. | 2 |
| `cs.swallow_nobu` | Ch3 | Performed, staged | Nobu, arms folded as ever, gives one nod for Tomoe's hand read properly; you step to his side and he hands you the clay swallow; you look at it in your hand. | 2 |
| `cs.talk_parcel` | — | Quiet | Case 'A Parcel for a Place That Moved': the companion's one remark when you talk to them while the case is open (or after it is solved), face to face as any talk to the companion; one line, no beat beyond it (as co.mind). | — |
| `cs.talk_view` | — | Quiet | Case 'The View on the Other Side': the companion's one remark when you talk to them while the case is open (or after it is solved), face to face as any talk to the companion; one line, no beat beyond it (as co.mind). | — |
| `cs.view_east` | Ch4 | Performed, staged | looking out, you turn back west along the slope; holding up the sketch as it hung, you hold it up before you, facing the view; turned over, you turn it in your hands to look. | 3 |
| `cs.view_note` | Ch3 | Quiet | Ch3 case 'The View on the Other Side' (the guestbook at Fusa's inn): an old page read in place and a clue noted, with Suzu's one remark; attention only, the record page is the interface (as cs.parcel_record). | — |
| `cs.view_seat` | Ch4 | Performed, staged | sitting a while, you look up the stair (north) as the view is described; holding up the sketch as it hung in the window, you hold it up before you; turned over, you turn it in your hands to look; leaving it here, you reach to set it on the post beside the seat, and your companion nods. | 4 |
| `cs.view_west` | Ch4 | Performed, staged | looking out, you turn east across the slope; holding up the sketch as it hung, you hold it up before you, facing the view; turned over, you turn it in your hands to look. | 3 |
| `cs.view_window` | Ch2 | Performed, staged | you lean in to the sketch pinned in the window; Genzō points up at it as he tells of the artist and you turn to him; he shakes his head: it matches nowhere. Lent, he steps up beside you and hands you the sketch, then holds up the white chart paper. Your companion's own answer (Nao looks between you and the window, Mio leans in to the thin paper, Ren's open hand, Suzu presents the stage with both hands). Once lent, you look at the pinholes; after the case, Genzō's nod. | 7 |

#### Pets (26)

| scene | ch | decision | direction / reason | branches played (B) |
|---|---|---|---|---:|
| `pets.bird.bird` | Ch2 | Performed, staged | you lean in to watch the bird miss its landing; your companion's own answer (Nao points at its post, Mio's hand to her chest, Ren's hand to the chin, Suzu laughs at the actor who trips on the same board). Once it is settled: you look at it; standing still beside the post, you only listen to the waves; or you hold out an open palm, low. Then Nao's open hand (one letter's weight), Mio's nod, Ren's glance aside (birds read the road better), Suzu's small celebration; not now, you look at its post. | 10 |
| `pets.bird.post` | Ch2 | Performed, staged | you lean in to the low mooring post and the flapping ribbon; working the knot loose, you crouch to it (a kneel); winding the ribbon round, you stoop over the post to tuck it in. Your companion's own answer (Nao's nod, Mio points to the post the bird can land on now, Ren's nod, Suzu's small celebration), and you look up as the bird lands. Steady already, you look at the post. | 7 |
| `pets.cat.cat` | Ch1 | Performed, staged | you lean in to watch the cat creep in and back off; your companion's own answer (Nao points at the knocking screen, Mio leans in to the cat, Ren points at the screen, Suzu laughs: in, out, in, out). Once it is settled: you look at it; offering a hand, you get down low to it (a kneel held); waiting, you sit down a little way off. Then Nao's nod, Mio's laugh behind her hand, Ren's glasses (envious of a cat's sense of direction), Suzu's small celebration; not now, you get up and look at its corner. | 11 |
| `pets.cat.screen` | Ch1 | Performed, staged | you lean in to the loose reed screen and stay looking at its foot and the cord; set back on its stone, you bend to its foot (a kneel); tied to the nail, you reach up to it. Your companion's own answer (Nao's nod, Mio points to the cat coming in, Ren's nod for the small jobs, Suzu's small celebration), and you turn to watch the cat curl up in its corner. Steady already, you look at it. | 8 |
| `pets.dog.dog` | Ch3 | Performed, staged | you lean in to watch the dog lie down and get up again; your companion's own answer (Nao points at the swinging gate, Mio leans in to the dog, Ren points at the gate, Suzu's shrug at the curtain that won't stay down). Once he is settled: you look at him; crouching, you get down low to him (a kneel held); waiting, you sit down by the barrel. Then Nao's nod, Mio's laugh behind her hand, Ren's nod, Suzu's small celebration; Tamotsu turns to you from his yard to say the dog is nobody's; as the dog stands, so do you; not now, you look at his corner. | 10 |
| `pets.dog.gate` | Ch3 | Performed, staged | you lean in to the gate hanging from one post; dropping the latch loop back, you bend to the post; pushing the stop peg in, you crouch to it (a kneel). Your companion's own answer (Nao's nod, Mio points to the dog's corner, Ren's nod, Suzu's small celebration), and you turn to watch the dog lie down. Shut already, you look at the gate. | 7 |
| `pets.dog.notice` | Ch3 | Quiet | Pet vignette: one remark from a party member about the dog in the channel keeper's yard; they look that way: attention only (as pets.cat.notice). | — |
| `pets.greet.mio.bird` | — | Performed, staged | you watch; Mio looks down at the bird as she hums, and her hands fidget over her singing. | 1 |
| `pets.greet.mio.cat` | — | Performed, staged | you watch; Mio kneels (held through the scene) to scratch under the cat's chin, and nods. | 1 |
| `pets.greet.mio.dog` | — | Performed, staged | you watch; Mio kneels (held) and takes up one of the dog's front paws, nods (no thorns), and laughs behind her hand when he hops. | 1 |
| `pets.greet.mio.tanuki` | — | Performed, staged | you watch; Mio holds the leaf out to the tanuki in both hands, shakes her head (not a herb), and laughs behind her hand. | 1 |
| `pets.greet.nao.bird` | — | Performed, staged | you watch; Nao holds an arm out low for the bird, then a hand to the satchel strap (no pecking it). | 1 |
| `pets.greet.nao.cat` | — | Performed, staged | you watch; Nao crouches (held through the scene) with the letters held out, and nods: received. | 1 |
| `pets.greet.nao.dog` | — | Performed, staged | you watch; Nao looks down at the dog at their feet, asks with an open hand, and nods. | 1 |
| `pets.greet.nao.tanuki` | — | Performed, staged | you watch; Nao looks down at the tanuki at the satchel, shrugs (only letters), and nods at the guard who won't budge. | 1 |
| `pets.greet.ren.bird` | — | Performed, staged | you watch; Ren leans to look at the bird, a hand to the chin (no dictionary yet), a nod. | 1 |
| `pets.greet.ren.cat` | — | Performed, staged | you watch; Ren kneels (held) to the cat's eye level, and nods at the slow blink. | 1 |
| `pets.greet.ren.dog` | — | Performed, staged | you watch; Ren reads the line aloud from a book, and nods down to the good listener. | 1 |
| `pets.greet.ren.tanuki` | — | Performed, staged | you watch; Ren bows politely to the tanuki and breathes out at being outdone. | 1 |
| `pets.greet.suzu.bird` | — | Performed, staged | you watch; Suzu hums a phrase (whistled), and a small celebration at the duet. | 1 |
| `pets.greet.suzu.cat` | — | Performed, staged | you watch; Suzu presents the star with both hands and laughs at the aloof one. | 1 |
| `pets.greet.suzu.dog` | — | Performed, staged | you watch; Suzu claps out a rhythm (both palms), counts it in on her fingers, and laughs at the changed choreography. | 1 |
| `pets.greet.suzu.tanuki` | — | Performed, staged | you watch; Suzu's showman's hands, then the grand pose (both arms up), and a small celebration for the headliner. | 1 |
| `pets.tanuki.notice` | Ch3 | Quiet | Pet vignette: one remark from a party member about the tanuki under the trees; they look that way: attention only (as pets.cat.notice). | — |
| `pets.tanuki.papers` | Ch3 | Performed, staged | you lean in to the loose papers by the hollow; stacking them under a flat stone, you crouch to them (a kneel); tucking them into the rock's lee, you bend to it. Your companion's own answer (Nao's nod at a bundle ready for delivery, Mio points to the clear way into the hollow, Ren's open hand for someone's writing kept, Suzu's small celebration), and you turn to watch the tanuki curl up. Tidied already, you look at them. | 7 |
| `pets.tanuki.tanuki` | Ch3 | Performed, staged | you lean in to watch the tanuki try to get back into its hollow; your companion's own answer (Nao's glance aside, Mio points to the papers before its bed, Ren points to the gap in the trees, Suzu laughs at the confetti). Once it is settled: you look at it, and waiting, you sit down at the edge of the path and stay still while it comes out to sit beside you; then Nao's nod, Mio's laugh behind her hand, Ren's nod, Suzu's small celebration; not now, you get up and look at its hollow. | 9 |

#### The Pages We Keep (and the ending extensions, road talk) (25)

| scene | ch | decision | direction / reason | branches played (B) |
|---|---|---|---|---:|
| `end.mio.core` | — | Quiet | The companion ending extension: the recognition and the personal quest as it stands, called inside the ending (sa.end_comp, the Chapter 6 pass) and the retrospective (pages.retro, staged here): the call sites carry the direction, so the same lines are not directed twice, or differently in two places. | — |
| `end.mio.reply` | — | Quiet | The companion ending extension: the optional, never-scored reply (a question, three answers, one line back), called inside the ending (sa.end_comp, the Chapter 6 pass) and the retrospective (pages.retro, staged here, where the answer is followed by a nod): the call sites carry the direction. | — |
| `end.nao.core` | — | Quiet | The companion ending extension: the recognition and the personal quest as it stands, called inside the ending (sa.end_comp, the Chapter 6 pass) and the retrospective (pages.retro, staged here): the call sites carry the direction, so the same lines are not directed twice, or differently in two places. | — |
| `end.suzu.core` | — | Quiet | The companion ending extension: the recognition and the personal quest as it stands, called inside the ending (sa.end_comp, the Chapter 6 pass) and the retrospective (pages.retro, staged here): the call sites carry the direction, so the same lines are not directed twice, or differently in two places. | — |
| `end.suzu.reply` | — | Quiet | The companion ending extension: the optional, never-scored reply, called inside the ending (sa.end_comp, the Chapter 6 pass) and the retrospective (pages.retro, staged here, where the answer is followed by an open hand): the call sites carry the direction. | — |
| `pages.ask3` | — | Performed, staged | you and your companion turn to each other; the question in their own way (Nao's hand to the satchel where the card will go, Mio's hands fidget, Ren's hand to the chin, Suzu's two hands for the programme); put off, a nod. | 5 |
| `pages.camp` | — | Performed, staged | you turn to your companion and they to you as the moment is named; the page is left for home in their own way: Nao's hand to the satchel strap (fold it later), Mio's cup in her hands (tea while she draws), Ren tends the lamp (the fair copy in the Lantern Hall), Suzu's two showman's hands (pictures by me, title by you); put off, a nod. | 5 |
| `pages.enter_offer` | Ch1 | Quiet | Post-game Pages: the arrival in the Hall that opens Page I; the conversation is pages.offer (staged). Positions only here: the companion steps off the doorway to your side and you turn to each other. | 9 |
| `pages.enter_retro` | Ch1 | Quiet | Post-game Pages (Ch1 pass decision kept): your companion asks for a moment to talk, with the choice to talk now or later; the conversation itself is pages.retro (staged). Positions only here: arriving in the Hall, the companion steps off the doorway (your own tile, where the follow rule leaves them) to your side and you turn to each other. | 5 |
| `pages.enter_unfinished` | Ch1 | Quiet | Post-game Pages (Ch1 pass decision kept): Nao or Mio asks you to hear the rest of what they said, with the choice to hear it now or later; the conversation is pages.unfinished (staged). Positions only here: the companion steps off the doorway to your side and you turn to each other. | 3 |
| `pages.home` | — | Performed, staged | you and your companion turn to each other. Home with nothing to keep: Nao's shrug, Mio's breath out, Ren's open hand, Suzu's showman's two hands (tickets carry over); with Page II waiting, the question with an open hand; put off, a nod. | 3 |
| `pages.home2` | — | Performed, staged | you turn to your companion and they to you as the moment is named (the question, the aspect and Page III follow in pages.p2q/p2r, pages.ask3 and pages.home3); put off, their own easy sign: Nao's hand to the satchel, Mio's and Ren's nod, Suzu's open hand. | 9 |
| `pages.home3` | — | Performed, staged | you and your companion turn to each other, and the page is made between you: each draws it (Nao the line of the road, Mio the two teacups, Ren the lantern, Suzu the programme), asks for your line with an open hand and nods at it; Ren's margin is written in turn (yours first, then theirs, small); the copy is put in your hands (a handover, you receive it). Nao's hand goes to the satchel for the third copy (or the paper kept for later); Suzu reads the programme aloud if you listen, and her account book closes the scene (no debt in the ledger). Put off, a nod. | 11 |
| `pages.offer` | Ch1 | Performed, staged | the companion proposes the page in their own conversational gestures, one at a time. Nao points to Tsuru's new ledger and turns back with an open hand, a head shake (knowing the way is not deciding for someone), a glance aside at the trusted line, looks between you and the door for "which?", then a nod or a hand to the satchel. Mio's hand at her chest over the loads she carried, an open hand, a touch to her hair at resting, a laugh behind her hand at the trusted line, two hands for "this or that", then a nod or her flat hand ("stop me"). Ren's open hand for the margins, the glasses for the teacher's hand, a glance aside about directions, two hands for "certain or not", and a nod. Suzu's two showman's hands for the little scenes, an open hand, a laugh, a shrug for "funny or quiet", then a small celebration or a nod, and her account book for the fireside. | 9 |
| `pages.p2q` | — | Quiet | The Pages We Keep, Page II: a one-line fragment (the companion's question for the theme), called inside pages.camp and pages.home2, which carry the direction (you and your companion already turned to each other there); a cue here would be directed twice. | — |
| `pages.p2r` | — | Quiet | The Pages We Keep, Page II: a one-line fragment (the companion's answer to the aspect chosen), called inside pages.camp and pages.home2, which carry the direction; a cue here would be directed twice. | — |
| `pages.p2ret` | — | Quiet | The Pages We Keep, Page II: a one-line fragment (how the outing came home, in honest words), called inside pages.home2, which carries the direction; a cue here would be directed twice. | — |
| `pages.retro` | Ch1 | Performed, staged | you turn to your companion and the narration's action is theirs. Nao sets the satchel down (a bend), turns back to you with an open hand, nods at choosing the roads together, and shoulders the satchel, looking one way and the other. Mio sits down first, nods at the plan, then gets up to straighten the ledgers. Ren bends to set the lamp down and cleans their glasses (the one adjustment of the scene), explains with an open hand, then puts their own lamp in your hand. Suzu breathes out like a costume coming off, her head goes down for the hard lines, an open hand for the next act, and she writes the line in her ledger. | 4 |
| `pages.unfinished` | Ch1 | Performed, staged | you turn to your companion. Nao pats the lighter satchel, nods at Umi's one line, and pats it again; Mio laughs as she tells it, her hands fidget over how they shook, and she thanks you with both hands for the hand on her back. | 2 |
| `road.mio.h4` | — | Quiet | The Pages We Keep, road talk: a two- or three-line remark by the fire or in the Hall, chosen from the rest menu with you and your companion already facing each other; like the other 56 road topics, the words carry it. | — |
| `road.mio.o1` | — | Quiet | The Pages We Keep, road talk: a one-line remark about the pet with you (or none), told by the fire or in the Hall; like the other 56 road topics, the words carry it. | — |
| `road.nao.h1` | — | Quiet | The Pages We Keep, road talk: a two- or three-line remark by the fire or in the Hall, chosen from the rest menu with you and your companion already facing each other; like the other 56 road topics, the words carry it. | — |
| `road.nao.o1` | — | Quiet | The Pages We Keep, road talk: a one- or two-line remark about the pet with you (or none), told by the fire or in the Hall; like the other 56 road topics, the words carry it. | — |
| `road.ren.o1` | — | Quiet | The Pages We Keep, road talk: a one-line remark about the pet with you (or none), told by the fire or in the Hall; like the other 56 road topics, the words carry it. | — |
| `road.suzu.o1` | — | Quiet | The Pages We Keep, road talk: a one-line remark about the pet with you (or none), told by the fire or in the Hall; like the other 56 road topics, the words carry it. | — |

#### Company (34)

| scene | ch | decision | direction / reason | branches played (B) |
|---|---|---|---|---:|
| `co.inv_co_fire` | — | Performed, staged | you turn to each other. The question in their own way (Nao looks between you and the way you came, Mio's hand to her chin, Ren's head goes down, Suzu looks away and back); each answer gets a reply in kind (Nao: a nod, the restrained downward hand, a shrug; Mio: her hand at her chest, thanks with both hands, a head shake; Ren: lowered eyes, an open hand, a nod; Suzu: an open hand, her head down or a nod, a nod); put off, a nod. | 14 |
| `co.inv_co_fire_after` | — | Performed, staged | you turn to each other; Nao's nod (chosen by themselves), Mio's breath out, Ren's head goes down (for when my own turn comes), Suzu's open-handed thanks for a good show. | 4 |
| `co.inv_lf_word` | — | Performed, staged | you turn to each other. The question in their own way (Nao looks between you and the town, Mio's hand to her chin, Ren's hand to the chin, Suzu's showman's two hands for a script of only "certainly"); each answer gets a reply in kind (Nao: a nod, a head shake, a glance aside; Mio: her head down, an open hand, a breath out; Ren: the glasses, an open hand, a glance aside; Suzu: two hands, an open hand, a slow breath out); put off, a nod. | 13 |
| `co.inv_lf_word_after` | — | Performed, staged | you turn to each other; Nao's open hand, Mio's breath out, Ren's slow breath out, Suzu's laugh at the heckling. | 4 |
| `co.inv_sg_hands` | — | Performed, staged | you and your companion turn to each other. The question in their own way (Nao looks between you and the way you came, Mio's hand at her chest, Ren's hand to the chin, Suzu flips her account book: someone fiddled the books); each answer gets its own reply in kind (a nod, a hand to the satchel or a shrug for Nao; a nod, a hand to the chin or an open hand for Mio; an open hand, a nod or the glasses for Ren; an open hand, a laugh or two showman's hands for Suzu); put off, a nod. | 13 |
| `co.inv_sg_hands_after` | — | Performed, staged | you turn to each other; Nao's hand to the satchel (a load put down), Mio's breath out, Ren's nod, Suzu's open hand. | 8 |
| `co.reflect_keep_mio` | — | Performed, staged | you and Mio turn to each other. Her hands together at her chest as she asks; put off, a nod. A bottle from her belt looked over for the shelf she labels, a hand to her chin, an open hand: and you? Your answer gets her hidden laugh, a nod, a breath out; on the close, her hands fidget. | 4 |
| `co.reflect_keep_nao` | — | Performed, staged | you and Nao turn to each other. A glance between you and the road as Nao asks; put off, a shrug. Nao takes one of the kept address labels from the satchel and looks at it, then a hand to the strap for the one from this journey, and an open hand: and you? Your answer gets a nod, a shrug, a nod; on the close, the look away. | 4 |
| `co.reflect_keep_ren` | — | Performed, staged | you and Ren turn to each other. Ren's open hand to ask; put off, a nod. Two hands for the names a keeper chooses to keep, a hand to the chin, a turn of the head to you for your choice; your answer gets thanks with open hands, a nod, a slow breath out; on the close, the lamp tended. | 4 |
| `co.reflect_keep_suzu` | — | Performed, staged | you and Suzu turn to each other. No flourish: Suzu's head goes down as she asks to be serious; put off, a nod. Two hands for the scene an actor takes home, a hand to her chin, an open hand: and you? Your answer gets a small celebration, a nod, a laugh; on the close, a glance away and back. | 4 |
| `co.reflect_travel_mio` | — | Performed, staged | you and Mio turn to each other. Her hands together at her chest as she asks; put off, a smile and a nod. Two hands for matching her pace to others, a hand to her chin over losing her own, an open hand for her question; your answer gets a nod (a promise), her hidden laugh, a breath out; on the close, her thanks with both hands. | 4 |
| `co.reflect_travel_nao` | — | Performed, staged | you and Nao turn to each other. A hand to the satchel strap as Nao asks; put off, a shrug. Nao explains the courier's pace with an open hand, glances aside at the detours, shakes the head: not a complaint; your answer gets a nod, a shrug, a nod; on the close, the smirk and the look away. | 4 |
| `co.reflect_travel_ren` | — | Performed, staged | you and Ren turn to each other. Ren's open hand to begin; put off, a glance aside. Ren counts the three checks of the map, a hand to the chin over asking the way, the glasses before the question (the one adjustment of the scene); your answer gets thanks with open hands, a nod, a start of surprise; on the close, a slow breath out. | 4 |
| `co.reflect_travel_suzu` | — | Performed, staged | you and Suzu turn to each other. Suzu's showman's two hands for the "interval meeting"; put off, her laugh. She flips her account book open over the troupe's schedule, explains with an open hand, glances away on the serious line; your answer gets a small celebration, a nod, a shrug (rock-paper-scissors); on the close, her open-handed thanks. | 4 |
| `co.ritual_mio` | — | Performed, staged | Mio straightens the lamp stand (or, at a camp, kneels to set the water on), then a slow breath out: time doing nothing. | 4 |
| `co.ritual_nao` | — | Performed, staged | Nao looks one way and the other (the window and the door, or the dark round the fire), then a hand to the satchel strap as it comes off; a nod to you: keep an eye on the bags. | 4 |
| `co.ritual_ren` | — | Performed, staged | Ren sits with the travelling lamp and tends it, then speaks from there with an open hand. | 4 |
| `co.ritual_suzu` | — | Performed, staged | Suzu opens her account book and closes it again, then sits down beside you without a word (across the fire at a camp). | 4 |
| `co.t_mio_after` | — | Performed, staged | you and Mio turn to each other. An open hand for the shop, a hand to her chin (carrying on is changing a little at a time); a nod, her laugh, or her thanks with both hands. | 3 |
| `co.t_mio_box` | — | Performed, staged | you and Mio turn to each other. Two hands for the chest split in two, an open hand (would you carry one?), her hands fidget (asking is harder); offered the heavy one, her flat hand: no, that's mine; or thanks with both hands; a breath out at the close. | 2 |
| `co.t_mio_sea` | — | Performed, staged | you and Mio turn to each other. A touch to her hair (honestly…), her laugh behind her hand at the salt remedy; a glance aside (the second thought kept) or a hand at her chest (no end in sight); a breath out for walking it together. | 2 |
| `co.t_mio_tea` | — | Performed, staged | you and Mio turn to each other. She looks at the cup in her hand; her hands fidget over the tea she always forgets; her laugh (she'll wait) or a nod (tea for two). | 2 |
| `co.t_nao_back` | — | Performed, staged | you and Nao turn to each other. An open hand: getting back is what matters; a glance aside (where to go back to); a shrug (several addresses), a point at you (you the destination), or a nod. | 3 |
| `co.t_nao_half` | — | Performed, staged | you and Nao turn to each other. A hand on the satchel strap (nobody else carries it), a glance aside, an open hand: you choose where we go; offered the map, Nao hands it over; or a nod: the satchel's mine; at the close, the look away. | 2 |
| `co.t_nao_pencil` | — | Performed, staged | you and Nao turn to each other. An open hand: a pencil person; a hand to the ear where the pencil sits; a nod (the brush for addresses) or a shrug (the third pencil); a glance aside — first time talking tools with anyone. | 2 |
| `co.t_nao_pier` | — | Performed, staged | you and Nao turn to each other. A glance aside back to being fifteen; both arms up, the parcel held over the head in the sea; a shrug for the old woman; a head shake ("the opposite") or a hand to the satchel (parcel first); a point to the right for the right-hand pier. | 2 |
| `co.t_ren_after` | — | Performed, staged | you and Ren turn to each other. Two hands for the mountains of names, a hand to the chin; a nod, a slow breath out, or the glasses (days off, as a way of answering back). | 3 |
| `co.t_ren_alone` | — | Performed, staged | you and Ren turn to each other. An open hand for the teacher's lesson, a hand to the chin, a slow breath out (perhaps it was said to me); a point to you (that would be you) or the glasses (galling). | 2 |
| `co.t_ren_polish` | — | Performed, staged | you and Ren turn to each other. The lamp tended (the favourite part of the day), a look down at the boots; an open hand (lamps answer), or a glance aside (within the year). | 2 |
| `co.t_ren_stars` | — | Performed, staged | you and Ren turn to each other. A glance aside (the first sleepless night), counting on the fingers (stars instead of lanterns); the glasses for four hundred and twelve, or the lamp tended (one inn lamp is enough now). | 2 |
| `co.t_suzu_after` | — | Performed, staged | you and Suzu turn to each other. Two showman's hands for the next show; then no flourish, she looks away and back to ask for the same partner; a nod, a small celebration, or a slow breath out. | 3 |
| `co.t_suzu_amazake` | — | Performed, staged | you and Suzu turn to each other. A touch to her hair (a weakness), her account book (a necessary expense); a small celebration (the audit passed) or she writes the debt down and nods. | 2 |
| `co.t_suzu_books` | — | Performed, staged | you and Suzu turn to each other. She holds out her account book in both hands; no flourish, her head goes down over ten years of keeping it alone; she looks away and back (mistakes, or lies); her open-handed thanks, or her laugh at the change of subject; a glance aside about the last page. | 2 |
| `co.t_suzu_house` | — | Performed, staged | you and Suzu turn to each other. Two showman's hands for the troupe's first show, her laugh at the fishermen who never laughed, an open hand for the crate of dried fish; a nod, or her account book ("value unknown"). | 2 |

#### Shiritori (4)

| scene | ch | decision | direction / reason | branches played (B) |
|---|---|---|---|---:|
| `wp.reflect_mio` | — | Performed, staged | you and Mio turn to each other. A hand to her chin (she hadn't thought about medicine once); put off, a nod; then a breath out (not the only one counting slips), an open hand (every shelf in her head) or her hands fidget (fun, and of no use: allowed?); her laugh at your win, a head shake at hers; a nod: a new rule of hers. | 4 |
| `wp.reflect_nao` | — | Performed, staged | you and Nao turn to each other. Nao looks one way and the other (counting exits partway through the game); put off, a nod; then a nod (we were reading the same map), a hand to the satchel (same as deliveries) or a glance aside (somebody keeping up); a shrug at your win, an open hand at theirs. | 4 |
| `wp.reflect_ren` | — | Performed, staged | you and Ren turn to each other. Ren reads from the record of the game, and looks back up; put off, a nod; then counting on the fingers (the tally never kept), a hand to the chin (like searching for a lamp) or an open hand (one small rule, two people at one table); the glasses for your win, a glance aside at theirs (a record doesn't tell everything); a nod. | 4 |
| `wp.reflect_suzu` | — | Performed, staged | you and Suzu turn to each other. Two showman's hands (a stage with no script); put off, her laugh; then a nod (someone who reads ahead), she looks away and back (the pause when your line won't come) or her open-handed thanks (sharing the spotlight); a small celebration at your lead role, an open hand at hers (the applause is for both of us). | 4 |

#### The Atlas (12)

| scene | ch | decision | direction / reason | branches played (B) |
|---|---|---|---|---:|
| `atlas.camp` | — | Performed, staged | you both sit down where you stand and turn to each other; the companion's camp thought is their own line, with no gesture over it (the talks at the fire are pages.camp and the road talk); heading home, or going on, you both get up. | 8 |
| `atlas.climax` | — | Quiet | The Atlas: after the battle screen, the narration of how the keeper yields and the companion's one line; the room is drawn anew for each outing and the outcome is the battle's own presentation. | — |
| `atlas.climax.bell` | — | Quiet | The Atlas: the keeper's two narrated lines and the companion's one remark, said on the way into the battle screen; the keeper is a figure of the generated room (no position can be authored). | — |
| `atlas.climax.cartographer` | — | Quiet | The Atlas: the keeper's two narrated lines and the companion's one remark, said on the way into the battle screen; the keeper is a figure of the generated room (no position can be authored). | — |
| `atlas.climax.gate` | — | Quiet | The Atlas: the keeper's two narrated lines and the companion's one remark, said on the way into the battle screen; the keeper is a figure of the generated room (no position can be authored). | — |
| `atlas.extract.room` | — | Quiet | The Atlas: the lit lantern at the road's end, the companion's one remark and the choice to go home; the lantern stands in a room drawn anew for each outing, so attention to it cannot be authored, and going home changes the screen at once. | — |
| `atlas.home` | — | Performed, staged | you and your companion turn to each other. Sent back (a defeat), you find yourself sitting on the floor: Nao's hand to the satchel (the parcel's safe), Mio bends to you (are you all right?), Ren tends the lamp (the light didn't go out), Suzu's two showman's hands (tonight's show is cancelled); you get up as the name caught on the way down comes back. Walked to the end: Nao's and Mio's nod, Ren writes the road on the map, Suzu's small celebration; turned back, a nod. (Then pages.home.) | 9 |
| `atlas.intro.again` | — | Quiet | The Atlas: Tsuru's one-line greeting and the companion's one reply before the road menu (the first time, atlas.intro.first, is staged); attention only, you are already talking to her. | — |
| `atlas.intro.first` | — | Performed, staged | you and your companion turn to Tsuru. She looks off down the road (the unwritten roads and their lost names), counts the changes on her fingers, and points down: the road itself sets you back down here. The companion's one answer in their own way (Nao's hand to the satchel, Mio's nod to Tsuru, Ren's glasses, Suzu's laugh). | 4 |
| `atlas.intro.go` | — | Quiet | The Atlas: the narrated moment a road-name surfaces on a lantern shade, and the companion's one word before the road opens; a transition to the expedition (the screen changes straight after). | — |
| `atlas.room.climax` | — | Quiet | The Atlas: arrival narration in the road's last room (the keeper standing at the far end) with the companion's one remark; the room and the keeper are drawn anew for each outing (no position can be authored), as the other room arrivals. | — |
| `atlas.room.threshold` | — | Quiet | The Atlas: arrival narration in the first room of an expedition, with the companion's one remark; the room is drawn anew for each outing (no position can be authored), as the other room arrivals (atlas.room.*), which are quiet. | — |

## Runs (exact results)

@@RUNS@@

## Findings

- **The dog's corner cannot be faced on foot** (`co.village` 32–33,26: the barrel, the crate and the wall close
  off 33,25). `pets.dog.dog` is reached from the gate (31,26), which calls it once the gate stays shut, so it is
  played from the gate's side. A map question for whoever owns `co.village`, not changed here.
- **Yasu's move across the village** (`lq.road_yasu2` → `lq.road_write`, `lq.road_yasu_bank`): the story moves
  him from the pier to the far bank (`quest.lq_road=4`, `!refresh`) and the world walks the same figure there
  after the scene (`50_world.js shiftTo`: about 35 tiles round by the bridge, some 9 s). The pier is a dead end:
  with you standing on it his route had no way round and the world's forced pass-through (after 2.4 s) put him
  on your tile for a frame. Staged fix: you step off the pier (33,24) before handing the persimmon over; the
  three cases name a 15 s `settle` so his walk is waited for (he must still arrive; nobody may share a tile).
  The long walk itself is the world's behaviour (not this pass's file).
- **Gestures read small at play scale**: the pose layer's key poses are a few pixels (e.g. `pointup`'s raised
  arm), visible in the enlarged frame sheets but easy to miss at 1×; a human look at play speed is still owed
  (**H**).
- **Parts of some branches cannot be reached by fixture**: the lines behind `seen.*` (e.g. `co.t_suzu_books`'s
  last line) and the shiritori record (`wordplay.reflect=cooperative`, `wordplay.won/lost`) were not set (no
  fixture for them), so those lines' cues are reviewed (**R**) but not played; `pages.home`'s "came home with
  nothing to keep" branch needs the homecoming's own event (`pages.empty`), played by `pages_ending.mjs` rather
  than the runner; `pages.camp` in the runner stands in a camp-less map (the Atlas camp's map is drawn per
  outing), so Page II is not committed there — `pages_ending.mjs` plays the real camp talk with staging on.
- **The invitation prompts inside `pets.*` vignettes** answer "not now" in the fixtures (the invitation flow is
  the pets' own suite's).
- **Merge notes for the lead**: `KNOWN` in `conversation_continuity.test.mjs`, the import list in
  `scene_manifest.mjs` and `staging_chapters.mjs`'s group filter are also touched by the Chapter 3–6 passes;
  the additions here are self-contained lines (append-only).

## Remaining, not verified

- Not verified: how the scenes look at play speed to a person (**H**); real devices and other browsers (only
  headless Chromium); performance on a slow machine (the runs below were on a shared, loaded 4-core box).
- The Atlas's room arrivals, keeper scenes and extraction are Quiet: the rooms are generated per outing, so no
  position or object attention can be authored without a generator hook (not done).
- `end.*` (the ending extensions) are directed at their call sites: `pages.retro` here, `sa.end_comp` by the
  Chapter 6 pass. If that pass leaves the calls unstaged, those lines play without direction in the ending.

## Evidence

Frame sheets in `docs/screenshots/staging/misc/` (headless Chromium at 960×640, staged, normal motion; each frame
cropped around the people near you, enlarged 2×; no captions drawn):

- `lq.fare_pay_mio.png` — the payment in the teahouse (Mio steps off the doorway tile beside you): Chigusa, standing
  at the counter, lays out the coins; Kōji takes them and opens the fare book; Chigusa writes her name; Kōji hands
  over the pledge and she receives it, facing him (the dialogue sheet docks at the top: you stand low on the map).
- `lq.road_home_ren.png` — Kayo at Koharuno's tree: she reaches up into the branches (`pointup`); comes down with
  the persimmon in her hand; turns to the trunk to cut the new height mark; you have stepped to her side and she
  hands you the seed, side-on.
- `cs.hama_parcel_nao.png` — you hold out the parcel to Hama; she has it in her hands ("…which means it's for me");
  the bell's clapper shown; the wax seal held out to you.
- `pages.home3_ren.png` — Page III in the Hall: you and Ren face each other (Tsuru at her place); Ren draws the
  lantern; Ren's open hand (choose the first line); you write your line in the margin (the copy handed over next
  is under the keepsake notice, so not shown).
- `atlas.home_sent_back_mio.png` — sent back by the road: you find yourself sitting on the Hall floor; Mio, facing
  you, bends towards you (`bend`, small at this scale); you are up again as the name caught on the way down comes back.
- `co.t_nao_half.png` — the rest-place topic at the Gull: Nao's hand to the satchel strap; the open hand ("you
  choose where we go"); the map handed over and in your hand; the glance aside.
