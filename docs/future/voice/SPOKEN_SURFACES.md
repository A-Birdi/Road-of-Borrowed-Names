# Spoken surfaces: every place the game shows Japanese sentences, and whether they are spoken

Robin, 2026-10-19: "every line in-game should have spoken lines with properly highlightable text as well"; 2026-10-20:
"If something isn't set up to be spoken yet, explain why and find a proper way to resolve it completely."

## How a line is spoken (what "spoken" means below)

A recording is found by the scene id a line is shown under and its Japanese: key = `sceneId + '#' + sha256(jp)[:10]`,
plus the speaker (`src/audio/52_voicebank.js` `wanted`). So a line is **spoken** when

1. the code that shows it passes a scene id (the scene runner does it for every scene line; the game's own code passes
   one itself), and
2. the line is in the recording list (`node tools/voice/lines.mjs`): scene lines are read from the scenes; a line the
   game's code makes is listed by a function on `RB.content.spokenSources`, which runs the game's own code over its data
   (`src/content/00_prologue.js` explains both).

Until a recording is made the line falls back to the device's Japanese voice (or silence), as every line does. Lines
with a run-time name (`$name`) can never be recorded and are left out of every list.

Where a line is shown: the **dialogue strip** (`src/ui/20_dialogue.js`: spoken as it appears, Voice button, the spoken
word marked, pointing pairs words); a sequence's own **caption slip** (`src/ui/43_sequence.js` `view`: the prologue,
Records replays, kept memories); and since 2026-10-20 a **panel line** (`src/ui/22c_spoken_panel.js`, `RB.ui.spoken`):
the same Japanese and English, a Voice button, the spoken word marked (`src/ui/22_speech_mark.js` covers `.say-line`),
pointing pairs words, said as it appears when lines are spoken automatically.

The counts below are computed: `node tools/voice/lines.mjs --json` (what is listed) and `node tools/voice/surfaces.mjs`
(every Japanese sentence in the game's data, grouped by where it lives, with how many of them the recording list already
carries; `--code` does the same for sentences written as string literals in the code). A sentence ends in 。！？ or a
closing quote, or is 14 characters or more; shorter Japanese (names, labels, choices) is counted as a phrase.

## 1. Spoken now

Scene lines (every `say` of every compiled scene, ~14,200 lines) are spoken in the dialogue strip under their scene. The
lines the game's own code shows, by family (lines listed once per speaker; the player's lines are recorded in four
variants, Suzu's also in Kansai where it differs):

| Scene id | What | Where (code) | Lines by speaker |
| --- | --- | --- | --- |
| `prologue` | the six captions | src/content/00_prologue.js, src/ui/40_create.js | narrator 6 |
| `code.door` / `code.prop` | a shut door; a marked object | src/engine/50_world.js | narrator 16 / 24 |
| `code.fw` | field puzzles: looks, actions, weaves, hints, resets, rewards; **and since 2026-10-20 every exploration action's own rules** (notice, courier, repair, network with near/far, observe, follow, route) | src/engine/55_fieldweave.js `spoken`; src/engine/55b_verbs.js `ruleLines` | narrator 487, Isao 1, Oyone 1 |
| `code.history` | oral histories, every level | src/ui/75_activities.js | Kasane 24, Yasu 16, Tetsu 16 |
| `code.battle` | battle intros, settled lines, phases | src/ui/80_combat.js | narrator 265, Kasane 1 |
| `code.wb` | "Have you seen…?" and the answers | src/ui/53w_whereabouts.js, src/engine/53_town.js | player 162, residents 644 |
| `code.comp` (new) | the companion's remark on a result (also a field puzzle's first reaction, a case's), "What's on your mind?", "Talk about this place", What We Keep (the honest none, each kept moment's own words, the framing around every title a memory can have), the Company page's thought and first words | src/engine/58_companion.js `spoken`, `memoryTitles`; src/ui/57_weave.js; src/engine/59_cases.js; src/ui/53_company_pages.js | Nao 94, Ren 93, Mio 90, Suzu 90 |
| `code.ngplus` (new) | the New Game+ farewell | src/ui/66d_ngplus.js | Nao, Mio, Ren, Suzu 4 each; narrator 4 |
| `code.weave` (new) | weaving at an animal's meeting place; the Weave sheet's look there | src/ui/57_weave.js | narrator 12 |
| `code.town` (new) | a sealed spot's hint | src/engine/53_town.js | narrator 38 |
| `code.verbs` (new) | a layered site's mark, reached; an action sheet's own words (stale, rehearsal, conclusions, each direction, each hypothesis's mismatch) | src/engine/55b_verbs.js; src/ui/57b_verbs.js | narrator 20 |
| `code.stamp` (new) | a stamp stand: every set of its stamps that can be waiting at once (each stand has 1–5), and "nothing to press" | src/engine/58b_records.js | narrator 86 |
| `code.pages` (new) | The Pages We Keep: the narrator naming the recorded moment (every moment an outing can record, from here or that road), the companion recalling a shared memory by its title (every title), the pinned page | src/content/pages/10_pages.js `spoken`, `events`; 30_project.js | narrator 150, each companion 47 |
| `code.atlas` (new) | everything an expedition says: the narration table (`NARR`), objectives, lanterns left, each name's way home, relics, combinations, branches and forks by side, the compass; each companion's tables | src/atlas/50_run.js `spoken` | narrator 89, Nao/Mio/Ren 20, Suzu 19 |
| `code.fish` (new, panel) | the companion's remarks by the water (stage, catch, reflection question and answers) | src/ui/86_fishing.js, 86_fishing_stage.js | 14 each |
| `code.play` (new, panel) | the companion at the shiritori table (invitation, rules, moves, results, first win); `thinking` is never shown, so not listed | src/engine/73_wordplay.js; src/ui/87_wordplay*.js | 29 each |
| `code.letters` (new, panel) | a villager's acknowledgement of your reply, every level | src/ui/90_letters.js | 12 villagers, 4 each |
| `mp.press_react` (listed) | a press reader's reaction | src/engine/72p_press.js | 8 readers, 28 |
| `cs.view_<point>` (listed) | the view from each of the case's viewpoints | src/content/cases/30_view.js | narrator 6 |
| `code.case` | a case's acknowledgement (`case_ack`): no case defines one, so nothing is listed (a case that adds one must list its lines) | src/engine/59_cases.js | — |
| the scene's own id | a speaker's simpler version (asking back "more simply") | src/ui/20_dialogue.js | Kōji 2 (ws.ask) |

Also since 2026-10-20: a kept memory's replay (Company › Shared memories) keeps each line's scene id
(`src/ui/43_sequence.js` `beatsOf`), so it is said from the scene's own recordings as a Records replay is; a kept
sentence (Words › Kept sentences, "Hear it") of a code-shown line now has its scene id too.

Code-shown lines listed: 2,968 (1,381 before this pass). The unit test `tests/unit/spoken_sites.test.mjs` checks that
every call that shows a line from the game's code passes a scene id, that every listed line is recordable, and runs the
code paths (stamp stands, sealed spots, marks, the companion's thoughts, place talk and What We Keep, the farewell,
the viewpoints) checking that each line they show is listed.

## 2. Not spoken yet: every other surface with Japanese sentences

Grouped by surface. "Sentences" is the number of distinct Japanese sentences there (`tools/voice/surfaces.mjs`), "voiced
elsewhere" how many of them the recording list already carries under some scene (a recording that could be reused).

### 2.1 Lines someone says, in places this pass did not wire (others are working there, or the design needs a decision)

| Surface | Where | Sentences | Why not spoken | Proposal |
| --- | --- | --- | --- | --- |
| Battle: what creatures say beyond intro/phase/settled (tiered speech, intents `$tgt`, "Explain its pattern", "Suggest an answer"), the companion's turn lines | content.enemies (807; 227 voiced as `code.battle`), content.intentText (48, all with `$tgt`); src/ui/80_combat.js, src/engine/95_combat.js | ~580 + 48 | Battle files are being worked on by others (not to be edited in this pass); intents carry a run-time target name | Extend `code.battle`'s enumerator (80_combat.js) to every tier of every creature line; give intents a fixed wording per target kind (no `$tgt`) or keep them unvoiced |
| Encounters (conversations and procedures): what people say each exchange, your social card's line, the conclusion | content.encounters (819 sentences, 623 phrases); the log in src/ui/80s_encounter.js `logHtml`, the battle screen's encounter (80_combat.js) | 819 | Shared with the battle screen (an encounter with someone present is played there) | Scene `code.enc`: list each encounter's effect lines by speaker (the def's `fx.who`), its cards' social lines (the player, four variants) and conclusions; `RB.ui.spoken.html` in `logHtml` with Voice, the newest entry said as it appears |
| Company › Shared memories: the companion's reply kept with a memory; a recollection's transcript | src/ui/53_company_pages.js `memItem`, `recollection`; content.company.mem replies, company.pets, pets.meeting, fishing/wordplay memory replies | ~120 | A discovery's reply is its reaction's lines joined; a recollection keeps the backlog's last lines, which have no scene id | Replies: list each source's reply under `code.comp` (story memories' replies by companion, the pets' words, the joined reaction lines, fishing/wordplay replies) and use `saidNow`; transcripts: keep `sceneId` in the backlog entry (20_dialogue.js `say`) so a memory's lines carry it, then Voice per line |
| The Log (Journey › the conversation so far) | src/ui/50_menu.js (log view, `s.backlog`) | every line shown | The backlog keeps `{ who, jp, en }`, no scene id | Keep `sceneId` in backlog entries (one field, saved); a Voice button per entry says it from its recording |
| Customers' orders, the signpost clues | content.activities (345 sentences; 56 voiced are the oral histories); src/ui/75_activities.js `act-say` | ~290 | The order is the reading task itself: hearing it changes what is asked | A decision for Robin: a "Hear it" that counts as help (like the translation), or a listening variant of the task |
| Letters' text, the pieces of a reply | content.practiceB.letters (145; 48 voiced: the acknowledgements) | ~95 | Written letters, and the reply is the task | The narrator (or the sender) reads the letter: a Voice on the letter sheet, counted as help |
| Shogi lessons: the teacher's explanation of each piece | content.shogi (15); src/ui/88_shogi.js `sg-why` | 15 | Instruction text, no speaker named | If a teacher is meant to be speaking: scene `code.shogi`, speaker the teacher, `RB.ui.spoken.html` in `sg-why` |
| Hanafuda calls ("こいこい！") | src/ui/88b_hanafuda.js | 2 | Calls made by the players, shown as status text | Scene `code.hanafuda`, the caller's voice (companion / player) |
| Asking back: the player's three questions ("もう一度、お願いします。") | src/ui/20_dialogue.js `ASKS` | 3 | They are choices (buttons), like every reply choice: not shown as a line | If wanted: say the chosen one in the player's voice before the answer (scene `code.ask`, four variants) |

### 2.2 Written surfaces (read, not said)

| Surface | Where | Sentences | Why written | Proposal |
| --- | --- | --- | --- | --- |
| Learning tasks: prompts, reading contexts, choices, explanations (challenges, drills, the placement quiz) | content.challenges (2,505), content.drills (194), src/ui/65_challenge.js, src/ui/40_create.js placement (9) | ~2,700 | Reading is the task; listening steps already speak their transcript from a reference reading (`phrase:`) | Leave written; a "Hear it" on the explanation after an answer, counted as help, could use phrase references (narrator) |
| Fishing: Yasu's notes in each situation, the survey notes per fish, the spread, the station names | fishing.SITU (260), fishing.FISH (15), the reflection's spread (src/ui/86_fishing.js) | ~280 | Yasu's note is part of the task ("Reading this is part of the task"); the survey and spread are the notebook | Leave the task note written; the spread could be the narrator's line (`code.fish`, Voice) |
| Quests: titles, stages, descriptions, the guide's nudges | content.quests (279), src/engine/56_questguide.js (10 templates), src/ui/50_menu.js journal | ~290 | The Journal is a written record | The narrator reads the current step: Voice on the Journal's open quest (scene `code.journal`, every stage listed) |
| Lore notes (Notebook) and grammar points with examples | content.notes (128), src/lang/40_grammar.js (239 examples), src/ui/50_menu.js notebook | ~370 | Notes and grammar are reference text | Grammar examples: phrase references (narrator, "Hear it", like words); lore notes: the narrator reads a note (Voice on the note) |
| The Atlas: a name's reading task, legends, the doors' tablet, survey landmarks, modifier descriptions | content.atlas (117; 10 voiced), src/atlas/15_lang.js (149), src/atlas/80_commissions.js (18), src/atlas/10_data.js (18 unvoiced) | ~300 | They are reading tasks (a name to understand, a tablet to read, a landmark to verify) | Leave the tasks written; the tablet could be read aloud after it is solved |
| Pastimes' written texts: tellings, the message relay, the press's blocks, canal/sail/stage, shells, festival stalls, the riddles of Manybridge | content.tellings (127), relay (107), press (75; 28 voiced as reactions), shells (14), festival (15), mbRiddles (10), cloudroad (7), mb/mpBridges (10), src/engine/72v_sail.js (6) | ~370 | Puzzles over written text (or quoted messages to compare) | Per pastime; the riddles are said by someone (a Voice with the asker's recording would fit) |
| Practice B: proofreading and "one word, two moments" | content.practiceB.proof (276), compare (96; 24 voiced: scene quotes) | ~350 | Proofreading is reading; the compare pages quote scene lines | Compare: play the quoted line from its scene's recording (it has one); proof: written |
| Practice A cards | content.practiceA (20) | 20 | Phrase cards | Phrase references (narrator) |
| Town beats, Known details, the Journey's hints | content.towns/living (14), src/ui/61_known.js | 14 | Notes in the Journey | Written |
| Cases: clues, hypotheses, results | content.cases (30), content.clues (15; 7 voiced) | ~40 | The case record is written evidence | Written; a clue that quotes a scene line could play it |
| Stamps' criteria, items' sign texts, the Company's bond lines, the end card, the settings sample | content.stamps (6), content.items (9), src/ui/53_company_pages.js (4), src/ui/50_menu.js end card (1), src/ui/55_settings.js (1) | ~20 | Labels and cards | The end card could be the narrator's line (scene `code.card`) |
| Pets' meeting texts (the memory's text) | pets.meeting (20) | 20 | A memory's written record | Written |
| Notices, toasts and award slips (an item's name, "記録に書き加えた", a quest's title, a stamp's name) | src/ui/10_ui.js `toast`, `notice`; src/ui/15_award.js | names and short labels | System messages; their words are names, which have reference readings | Written |
| Choices (every reply the player can pick, in scenes and hooks: `RB.ui.dialogue.choose`) | src/ui/20_dialogue.js `choose` | (each scene's `*` lines) | A choice is a button, kept in the Log as the player's reply; it is not shown as a line | As asking back: if wanted, say the chosen reply in the player's voice (four variants) before the scene goes on |

### 2.3 Data that no code path shows

`content.relations.*.usual` (12 lines such as "ゲンゾウ さん は 灯台 です。"): a resident's usual place, used only when
someone knows them as a `routine`; every asker knows these twelve `loose`, so no answer can say them. Nothing to record
unless a relation changes.

## 3. Findings on the way (not changed)

- `src/atlas/50_run.js` `RELIC_REACT.bell`: its `any` is the whole `RELIC_ANY` table rather than a line, so for Nao, Mio
  and Ren `compSay` finds no line and says nothing when the bell is found (Suzu has her own). The recording list follows
  the code (nothing listed for them); if they should speak, `any` should name a line, or the table's own line be used.
- The kept memory's transcript and the Log lose the scene id at `s.backlog.push` (20_dialogue.js); see 2.1.
