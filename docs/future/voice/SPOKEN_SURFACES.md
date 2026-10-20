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
| `code.battle` | battle intros, settled lines, phases; **and since VL-2** every telegraph a battle can show: each creature's own words for a move at each learner level (256), a move's default words (36, `content.intentText`), and the words that name the companion, once for each companion's name (80; `$tgt`/`$other` put in as the code does: `saidAs`), as the creatures are and as each encounter varies them; shown with a Voice button in the badge's card and the telegraph panel (the task slip, which opens the language step, keeps them as they were); a creature of a group settling, in the exchange log (said as it appears) | src/ui/80_combat.js (`saidAs`, `toldHtml`, the enumerator) | narrator 637 (265 before VL-2), Kasane 1 |
| `code.wb` | "Have you seen…?" and the answers | src/ui/53w_whereabouts.js, src/engine/53_town.js | player 162, residents 644 |
| `code.comp` (new) | the companion's remark on a result (also a field puzzle's first reaction, a case's), "What's on your mind?", "Talk about this place", What We Keep (the honest none, each kept moment's own words, the framing around every title a memory can have), the Company page's thought and first words; **and since VL-2** Company › Shared memories: the reply kept with a memory (a story memory's, every variant; a discovery's remark, its reaction's lines joined as `onResolved` keeps them; an animal's meeting, the pets' vignettes and the words for a meeting without one; the fishing outing's), shown as a spoken line (word play's reply is a line of its reflection scene and keeps that scene's id) | src/engine/58_companion.js `spoken`, `memoryTitles`; src/ui/57_weave.js; src/engine/59_cases.js; src/ui/53_company_pages.js `replyHtml` | Nao 111, Ren 112, Mio 108, Suzu 107 (94, 93, 90, 90 before VL-2) |
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
| `code.ask` (VL-2) | asking back: the question you choose (again, slower, more simply), said in your voice before the answer when lines are spoken automatically ("Once more, please" then has the line said once more) | src/ui/20_dialogue.js `ASKS`, `askSaid` | player 3 |
| `code.enc` (VL-2, panel) | the encounter screen (conversations and machines: no creature leads them): each line of its log with Japanese, by speaker (you, your companion, a named person, else the narrator, as `src/engine/97_encounter.js` says them), the newest said as it appears; how it ended. Today only your choices' words carry Japanese (what you say: "You: …"); every other effect line is authored in English (see 2.1) and is listed as soon as it has Japanese | src/ui/80s_encounter.js `spoken`, `logHtml`, `sayNewest` | player 98 |
| `code.hanafuda` (VL-2, panel) | the calls, koi-koi and shōbu, said by whoever makes them: your partner across the cloth (your companion) or you | src/ui/88b_hanafuda.js `CALL` | each companion 2, player 2 |

Also since 2026-10-20: a kept memory's replay (Company › Shared memories) keeps each line's scene id
(`src/ui/43_sequence.js` `beatsOf`), so it is said from the scene's own recordings as a Records replay is; a kept
sentence (Words › Kept sentences, "Hear it") of a code-shown line now has its scene id too.

Since VL-2 (the second pass) the **dialogue history keeps each line's scene id** (`s.backlog` entries: `sceneId`, and
for the companion's lines `comp`, who that was; `src/ui/20_dialogue.js` `entryOf`, and asking back's two entries). So:
- **the Log** (Journey › Dialogue history, `src/ui/50_menu.js`) shows each such line as a spoken line, with a Voice
  button that says it from its recording (`RB.voice.canSayLine`), the spoken word marked; an entry from an older save
  (no scene id) and a reply you chose have none, and nothing is migrated;
- **a kept transcript** (Company › Shared memories › Recollect): a reflection kept from a conversation
  (`co_remember`), word play's reflection (`wp_reflect`, its reply too) and the fishing reflection keep each line's scene
  id, and the recollection shows those lines as spoken lines (`src/ui/53_company_pages.js` `recollection`).

Code-shown lines listed: 3,516 (2,968 before VL-2; 1,381 before the first pass). The unit test
`tests/unit/spoken_sites.test.mjs` checks that every call that shows a line from the game's code passes a scene id,
that every listed line is recordable, and runs the code paths (stamp stands, sealed spots, marks, the companion's
thoughts, place talk and What We Keep, the farewell, the viewpoints) checking that each line they show is listed; since
VL-2 also every telegraph a battle can show (each creature and each encounter's variation, each move, each learner
level, with each companion and alone, each aim: 22,628 cases, of which 11,196 have a name in them and 5,192 of those
name a companion and are voiced), the encounter screen's log run through the encounter rules over all 42 conversations
and machines, the reply every memory source keeps, asking back's questions, hanafuda's calls, and that every history
entry is either a line with its scene id or a reply you chose.

## 2. Not spoken yet: every other surface with Japanese sentences

Grouped by surface. "Sentences" is the number of distinct Japanese sentences there (`tools/voice/surfaces.mjs`), "voiced
elsewhere" how many of them the recording list already carries under some scene (a recording that could be reused).

### 2.1 Lines someone says that are still not spoken, and why

Wired in VL-2 (moved to section 1): battle telegraphs, the encounter screen, Company › Shared memories (replies and
transcripts), the Log, hanafuda's calls, asking back. What remains:

| Surface | Where | Sentences | Why not spoken | Proposal |
| --- | --- | --- | --- | --- |
| A telegraph that names **you** (`$tgt` or `$other` is the player: "{名前} に ぶつかって くる ！") | content.intentText (12 lines with a name), sb.boss's own chill (8); src/ui/80_combat.js `intentLine` | 20 lines; 6,004 of the 22,628 telegraph cases | The player's name is chosen at run time and can never be recorded (`$name` rule); the same line naming the companion is voiced (80 lines) | Keep unvoiced (shown as before, with no Voice), or give these moves a wording without the name ("あなた に …") for Robin to approve |
| The companion's offers after a defeat ("Explain its pattern", "Suggest an answer"), the companion's turn, guests' lines, every result in the battle log | src/ui/80_combat.js `offerHelp`, `applyBeat`; src/engine/97_encounter.js `guests`; content.encounters `help` | — | Shown in English only (the help is `{ en }`; the log results are English): there is no Japanese to say | If they should be heard, author Japanese for them; the strip then says them under `code.battle` like the intro |
| A phase's teaching card ("Something has changed") | content.enemies `phases[].teach`; src/ui/80_combat.js | 15 | A teaching card (instruction), not a line someone says | Written |
| An encounter's effect lines: what you say with a choice, the people's responses and drift, your companion's own moves, the gesture, a machine's results, conclusions | content.encounters (132 says, 30 cases, 64 responses, 29 waits, 35 drifts, 116 + 4 companion moves, 26 gestures, 200 results, 100 untangled, 134 conclusions) | 0 with Japanese | Authored in English only; the screen already shows any of them with Japanese as a spoken line, and the enumerator lists them by speaker as soon as they have it | Author Japanese where a line is speech (the companion's moves and the people's responses especially) |
| An encounter's record ("On record": each person's claim) and a machine's notice | content.encounters `social.claims` (99), `procedure.steps[].text` (100) | 199 | The record is written evidence, and its speakers are an encounter's parties (`n:courier`), not characters with voices; the notice is the reading task itself | Claims: the narrator reads the record, or the parties get voices (Robin's decision); the notice stays written |
| Suzu's Kansai for a discovery's remark of several lines kept with a memory | src/ui/53_company_pages.js `replyHtml` (`RB.dialect.joined`) | none today (every reaction is one line) | A remark is its reaction's lines joined; Kansai recordings are made line by line from the dialect table, so a joined remark of two or more lines would have no Kansai recording and, with Kansai chosen, fall back to the device's voice | If such a remark is authored: record its joined Kansai line too (the production manifest would use `RB.dialect.joined`) |
| Older saves: history lines and kept transcripts from before VL-2; a memory's own words (what happened) | `s.backlog`, `company.memories[].lines`, `.text` | — | They were kept without a scene id (no migration, as asked); a memory's text is its written record | Nothing to do: new lines carry their scene |
| Hanafuda: your partner's moves ("Mio takes the crane with the pine") | src/ui/88b_hanafuda.js `sayPlay` | — | English only (a description of the move) | Written |
| Shogi lessons and puzzles (`sg-why`) | content.shogi lessons (8), tsume (7); src/ui/88_shogi.js | 15 | Checked: plain instruction with no speaker ("{歩|ふ} は {前|まえ} に {一|ひと}つ {進|すす}む 。"); whoever sits across the board varies (Fuku at her bench, or your companion), and nothing names a teacher. The "Why?" note narrates your partner's move in the third person, built from the move (`describe`) | Leave written; if Fuku is meant to teach, give the lessons a speaker (`who: 'fuku'`) and they can be wired as `code.shogi` |
| Customers' orders, the signpost clues | content.activities (345 sentences; 56 voiced are the oral histories); src/ui/75_activities.js `act-say` | ~290 | The order is the reading task itself: hearing it changes what is asked | A decision for Robin: a "Hear it" that counts as help (like the translation), or a listening variant of the task |
| Letters' text, the pieces of a reply | content.practiceB.letters (145; 48 voiced: the acknowledgements) | ~95 | Written letters, and the reply is the task | The narrator (or the sender) reads the letter: a Voice on the letter sheet, counted as help |
| Choices in general (every reply the player can pick) | src/ui/20_dialogue.js `choose` | (each scene's `*` lines) | A choice is a button, kept in the Log as the player's reply; it is not shown as a line | As asking back now does: if wanted, say the chosen reply in the player's voice (four variants) before the scene goes on |

A decision for Robin that VL-2 made visible: a **reading-critical telegraph** (a promise, a mirror, a plea: reading what
the creature says is the task, battle addendum §13.3) now has a Voice button too. It is never said automatically, and
pressing it is not counted as help (that would change the rules); if hearing it should count as help like Translate, or
should not be offered for those three moves, that is a one-line change in `toldHtml`.

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
- (fixed in VL-2) The kept memory's transcript and the Log lost the scene id at `s.backlog.push` (20_dialogue.js).
- Journey › Dialogue history still says "Replay a line's voice from the dialogue box while it is on screen." Since VL-2
  each line there has its own Voice; the sentence was left as written (no text was changed in this pass).
- Encounter conclusions: none of the 134 has Japanese, so the battle screen's `say({ jp: '' … })` and the encounter
  screen's "How it ended" have nothing to say aloud; both are wired for when they do.
