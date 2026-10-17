# FR-1 · Foundations clarity pass: report

Robin's request of 2026-10-17 (packet `RBN_Foundations_Clarity_FR1`, findings F01–F17). Bounded implementation and
focused verification on the task branch; no planning cycle, no full campaign matrix, no new audio. Local's voice batch
stays pinned and unchanged (§6).

How the evidence below was obtained is marked on every line: **B** a browser run of the built `index.html` through the
real interface (Chromium; clicks, keys, touch emulation, a drawn pen), **U** a Node unit test, **R** reading the source.
"Emulation" means a desktop Chromium window sized like a phone, not a phone.

## 1 · The opening, before and after (B)

Both runs: `tests/e2e/fr1_opening.mjs`, a fresh browser profile, New Game, the prologue skipped, creation by clicks
(Foundations, no kana, Demanding tactics, answers by Choices), "Before you set out", then the Reedwake road lantern,
Tsuru, the five town requests (Ren, Nao, Mio, Suzu, Hana), the report, the Mill Road, the gears, the loft lantern and the
Mill Echo. Every lesson page, question, letter, conversation and battle turn went through the interface; travel between
places used the test's placement helper; the answers were chosen by the script (a scripted player, not a learner).
Before = the build at `7c07fa9`; after = this branch's final build. A second after run wrote every answer with the pen
(`--input hand`, drawn reference strokes) and took the requests in the reverse order (Hana, Suzu, Mio, Nao, Ren).

| | Before (7c07fa9) | After (this branch) |
| --- | --- | --- |
| Mistake setting the new journey got | Standard (`normal`), never chosen | Assisted (no battle cost); Demanding tactics kept |
| Learning step | 8 fields on one page | profile, placement, kana, Answering; mistakes, tactics and reading folded under one line that says what they are |
| "Before you set out" | 14 fields | a summary (what is set, the Sound link, the answer mode), every field one press away (Adjust details) |
| Kana lessons before the boss | 7 rows, 35 kana: vowels, k, s, t, n, **h** (before the gears), **m** (before the loft lantern) | 5 rows + 2 kana, 27: vowels, k, s, t, n, then **よ ん only, for the gear plates**; nothing before the loft lantern (its あしのせ was all met) |
| First practice options (う) | ぅ つ ゔ う (small kana, untaught row, dakuten) | vowels only, e.g. い え お う |
| Loft-lantern options (あしのせ) | あっしのせ, あじのせ … (っ, じ unmet) | あしのせい, あしのうせ, おしのせ (all met kana) |
| Journal on arrival, carrying the letter | "Nothing pressing" | "A Letter for Keeper Tsuru", following, with a marker to Tsuru |
| Journal when every request is done | stage 1 "Who haven't you helped yet?" (Next said Tsuru) | "Tell Keeper Tsuru what everyone found" |
| Letters delivered with the English shown | recorded as unassisted recognition | recorded as context reading, supported (assisted) |
| First practice, a wrong vowel | "You gave ぅ … Small vowels join the kana before them" | "The answer has う (u) where you chose い (i)." |
| The boss | the run stopped at the Mirror phase card (the driver had no handling for it; the old review never finished it either) | finished: 8 turns, Mirror and Plea phases, won; resolve 10/10 until a tactical miss at the Mirror (−5), never from a language slip |
| Handwriting (second after run) | n/a | all 26 answers written with the pen and accepted; Submit before Add character gave the notice and counted nothing; Remove, redraw and a switch to Choices and back kept the answer |

## 2 · Findings F01–F17

| ID | Disposition | What was done / found | Evidence |
| --- | --- | --- | --- |
| F01 | reproduced / fixed | Seven rows (35 kana) met before the boss, two of them not used by the tasks after them. The gears' lesson now introduces only the kana that task needs and the player has not met (`!lesson kana for <challenge>`, at most four, from the raw tier, no record made by looking); the loft lantern needed none, so none. Rows keep their order for later lessons and show only what is still new. Consequence: the row lessons each run two lesson points later (the h row moved to after the boss; with 22 lesson points in the game, the last two rows of the sequence come later than before). | B route; U `fr1_foundations` |
| F02 | reproduced / fixed | The h row came before the gears; the gear plates need よ and ん, which were unmet. Now a two-page sheet, "New kana for this task", shows よ and ん with the task's own words (よん four, さん three), then the task. The romanised order, English and order hint are unchanged. With よ and ん already met, nothing is shown again. The gear task itself succeeded without help in both runs ("Yes.", no help line). | B route (lesson-6 shot); U |
| F03 | reproduced / fixed | The first vowel questions offered ぉ, を, ゔ, つ, katakana twins and rows still to come. Foundations options are now made of kana the player has met; the contrasts return when their kana are met; everyone else's options are unchanged (the first three are the same). Every vowel after the vowel lesson offers only vowels. | B route; U (all five vowels) |
| F04 | reproduced / fixed | The single-kana お/を feedback spoke of words and particles. A single kana now gets feedback at its scale ("For the basic vowel o, the answer is お. を sounds the same; you will meet it in sentences later, as a particle."), likewise え/へ, わ/は and a small vowel for a full-size one. Another kana given for a single kana is named as a kana, not as a word (い for う no longer reads "That's 胃, the stomach"). In words the particle explanations are unchanged. Unvoiced UI text. | U; B final route (い for う) |
| F05 | reproduced / fixed | The Learning step had 8 fields and the review 14, a second pass over everything. The Learning step keeps level, placement, kana and Answering in view and folds mistakes, tactics and reading under one line that names their values. "Before you set out" opens on a summary: a headline (e.g. "Teach me from the beginning"), Japanese, learning mistakes, battles, sound (with its tab), the answer mode on the page, and "Adjust details" for every setting; anything not the usual start (Japanese-first dialogue, a hidden second language, Japanese menus, guidance off) is named. The previously addressed voice and volume explanations are untouched (the Sound tab and the details page carry them). | B `fr1_defaults`, `settings_review`, `create`, route |
| F06 | reproduced / fixed | On arrival the Journal said "Nothing pressing" while the player carried the letter. A quest, "A Letter for Keeper Tsuru", starts on arrival and ends on meeting Tsuru (`auto`, after every scene); its marker points at Tsuru. No new dialogue. | B route (journal shots); U |
| F07 | reproduced / fixed | With every request done the Journal still showed "Who haven't you helped yet?". The report stage now has the same condition as Tsuru's report scene and is reached after the last request in any order. | B route; U |
| F08 | reproduced / fixed | After the report the finished quest stayed selected. A finished quest that was open moves to the followed (or main) quest; when another entry is selected, "Show the followed quest" is on the page. | B route (after-07); R (the button) |
| F09 | already addressed in part / fixed | The warning for Submit before confirming existed. The pad's confirm now reads "Add character" ("Add character & continue" under pace review); the warning says so ("…press Add character (or Clear it), then Submit. Nothing was counted."). Recognition uncertainty stays "I could not read that clearly" (no mistake). | B route `--input hand` (probe); B `pace` |
| F10 | not reproduced as reported / fixed | No help label appeared without help (the gear success carried none in either run). A helped success now names the help: "Practiced with word help", "…with the English shown", "…with the model to copy", "…with the kana chart", "…with the answer shown", instead of "Assisted — that's fine." The evidence record's help category is unchanged. | B route (boss copy steps); R |
| F11 | reproduced / fixed | Letters (and orders) read with the English beside them were recorded as unassisted recognition. They are now recorded as context reading, supported (`assisted`, help `constrain`); the deliveries and the story are unchanged. An optional one-line note names a word met before when one is in the letter (not seen in this route: no letter word had been met). | B route (records); R (the note) |
| F12 | reproduced / fixed (lantern); retained (millstone) | A click or tap on a lantern's drawn lamp (which stands in the tile above its footprint) walked behind it. A tap inside that drawn part now uses the lantern; beside and above the picture is still ground. The millstone's picture lies inside its 2×2 footprint: a click on it inspects it, above it walks; the confrontation starts on stepping in front of it after the loft, as designed. The action key from the front was already right for all three. | B `fr1_targets` (mouse + touch emulation, 3 runs) |
| F13 | deferred in FR-1; done in AR-1 Mill | Captured: the stair-well is a flat grey block beside detailed planking; the waterwheel has no visible axle into the mill wall. This is region-kit art under `docs/future/plan/AC1_ART.md`, P3 after the learning fixes, and is left for the art queue with these captures; it is listed there in HANDOFF.md (Next concrete actions, item 3). Still deferred after FR-1V. Done in AR-1 Mill (2026-10-17): the stair-well and the wheel's attachment, approved by Robin from a before/after review and pushed (millstone reviewed and retained): docs/review/ar1_mill/AR1_MILL_REPORT.md. | B captures |
| F14 | reproduced / fixed | Cards led with the general description and ended with "Here:". The "Here:" line (what it does now, "No effect here: …" kept) now leads; the description and "Answers:" follow, folded to two lines (whole on keyboard focus, as the tooltip and to a screen reader). The phase cards (Mirror, Plea) appear when the phase begins. | B route (battle shot); R |
| F15 | retained with rationale | The boss was finished on Foundations + Demanding + Assisted (8 turns; won). One group battle sampled (the Stacks, three creatures, Demanding, Assisted): won in 13 turns at 1/10 resolve, a deliberate wrong answer cost nothing, enemy moves landed. A sample, not a balance verdict: no rebalance. | B route; B `fr1_group_sample` |
| F16 | reproduced / fixed | At 390 px and 320 px "Headband" broke as "Headban/d" and "Back" as "Bac/k". Compound piece names carry a soft hyphen ("Head-/band"); Back keeps its word. Desktop, 844×390, 150 % text and 390 px at 150 % were measured before and after; no other label is cut mid-word or overflows. Text size is unchanged. | B measurement + captures |
| F17 | reproduced / fixed | New journeys had Standard mistakes without a choice. The default is now Assisted at every level (`RB.state.newCampaign`, the creation wizard); an explicit Standard choice is kept (journey, autosave, reload); tactics stay their own axis; a save that already has a setting keeps it; only a save without the field gets the new default. `normal` was not bulk-replaced: diagnostic simulations and tactical difficulty keep their own explicit values. | B `fr1_defaults`; U |

## 3 · Learning evidence kept distinct

Meaning, recognition, recall and handwriting stay separate records: copy steps are recorded as guided (exposed); letters
read with English are context reading, supported; a just-in-time introduction marks only the kana it showed as met,
never a row; the help line names the help without changing what the evidence log keeps.

**Correction (FR-1V, after Astra's verification of 71d4a95).** The first version of this section also said that "a
one-kana blank records the kana, not the word". That was not true of the code at 4c304d8 / 71d4a95: `RB.tasks.prepare`
kept the word's id beside the blanked kana (`['k:あ', 'v:葦ノ瀬']`), and the one answer was recorded for both, so the
word was promoted (box 0 → 1) and given independent handwriting, typed or recognition evidence for writing or choosing
one kana; a slip on that kana also set the word back. Reproduced before fixing (§8). It is true now: the blanked kana is
the assessed item, and the word is recorded as supported exposure (seen, kept due for a later look, one log line marked
as part-asked with the rest supplied), never promoted, set back or given independent evidence by the blank. A whole word
written from met kana is still credited as before; a copy model and a revealed answer stay supported, not independent.
Records made before the fix are left as they are: the log never recorded which past answers were blanks, so that
history is not reconstructed.

Interruptions are replaced, not added: before the boss the opening now shows 27 kana in six lesson sheets instead of 35
in seven; no new mandatory drill, quota, timer or detour was added. Familiar reuse after intervening play, from the final
run: the vowels taught at the road lantern are the options in the later practice; あしのせ, first met at the road lantern
with only あ to supply, is asked whole at the loft lantern, all four kana met by then (chosen in the choices run, written
with the pen in the second run). The letters' one-line "a word you have met before" note appears only when a letter
holds such a word; in this route none did, so it was not seen.

## 4 · Tests

Full counts are in VALIDATION.md "FR-1". In short, on the final build: B `fr1_opening` (choices, final) and
`fr1_opening --input hand` (reverse order) both to the end of the boss with no page errors; B `fr1_defaults` 15/0,
`fr1_targets` 24/0 (three consecutive runs), `fr1_group_sample` won with no slip cost, `create` 384/0,
`settings_review` all passed. B `learning_ui` 15/0, `combat_ui` 7/0, `encounters` 10/0, `story_ch1` 8/8 (profiles F
and A, each companion, the Mill Echo won), `quest_guide` all passed, `settings` all ok, `pace` 13/0 ran on the build just before the last two
text-only edits (the single-kana "other word" line and the summary note's wording), which none of them read.
U `fr1_foundations` 25/0 and the full unit run (VALIDATION.md). Firefox and Safari are not installed here; phones were
emulated in a desktop Chromium window, not used.

## 5 · Voice and production inputs

`node tools/voice/production_manifest.mjs --check`: "manifest is current: 14721 recordings + 9095 reference readings,
content 65cd38053ad6", the same as before FR-1. Nothing under `tools/voice/`, `GO.json`, the production manifest or the
accepted audio changed. The only script edits are two stage directions on existing lines (`!lesson kana` →
`!lesson kana for rw.c_mill_gears` / `rw.c_mill_lantern`), in place: no spoken text, speaker, reading or line number
moved. The voice and highlight work and the UI/SFX volume fixes were not touched (the Sound row of the summary links to
the existing Sound tab). Existing Japanese reference audio is reused (the lesson sheet's "Say it" plays the recorded
kana when present).

**Narrator delta: 0 new spoken lines.** The new instruction is written UI text; no narrator supplement is prepared.

## 6 · Status note to Local

Recorded in `docs/future/voice/production/READINESS.md` §5:

> FR-1 needs 0 new spoken lines. Existing reference audio is reused.
> No change to your batch inputs or accepted audio is requested.

## 7 · Screenshots (`shots/`, all from the runs above, Chromium 1280×800 unless named)

| Before (7c07fa9) | After (this branch) |
| --- | --- |
| `before-01-learning-step.jpg` | `after-01-learning-step.jpg` |
| `before-02-before-you-set-out.jpg` (14 fields) | `after-02-before-you-set-out.jpg` (summary) |
| `before-03-journal-arrival.jpg` ("Nothing pressing") | `after-03-journal-arrival.jpg` (the letter quest) |
| `before-04-first-practice-options.jpg` (ぅ つ ゔ) | `after-04-first-practice-options.jpg` (vowels) |
| `before-05-h-row-before-the-gears.jpg` | `after-05-kana-for-the-gears.jpg` (よ ん) |
| `before-06-journal-requests-done.jpg` | `after-06-journal-requests-done.jpg` |
| `before-07-journal-after-report.jpg` (completed quest kept) | `after-07-journal-after-report.jpg` |
| `before-08-battle-cards.jpg` (description first) | `after-08-battle-cards.jpg` ("Here:" first) |
| `before-09-labels-390px.jpg`, `before-10-headband-390px.png`, `before-11-back-390px.png` | `after-12-headband-390px.png`, `after-13-back-390px.png` |
| | `after-09-mirror-phase-card.jpg`, `after-10-boss-won.jpg`, `after-11-add-character-notice.jpg` (pen run) |

Findings without a before/after pair: `f12-road-lantern.jpg` (the lamp above its footprint), `f13-mill-interior.jpg`,
`f13-waterwheel.jpg` (the deferred art), `f15-group-battle.jpg` (the sampled group battle).

## 8 · FR-1V: the one-kana blank and its word (Astra's verification follow-up, 2026-10-17)

Astra found that an adapted one-kana blank still credited its parent word as independently answered, contradicting §3,
and supplied an isolated diagnostic over the four learning modules at 71d4a95 (their Git blobs match this branch's
before the fix).

**Reproduced first.**
- U `tests/unit/fr1_partial_word.test.mjs` run against the unmodified source: 23 of 39 checks failed. For the pen, the
  keyboard and choices alike, v:葦ノ瀬 got box 1, ok 1 and independent `hand` / `typed` / `recog` evidence from
  answering あ; a slip on あ also took an earlier word record from box 2 to 1 and counted a mistake against it; an
  earlier record's review was put later. The whole-word and copy-model controls passed, as Astra's did.
- B `tests/e2e/fr1_partial_word.mjs` (the mill lantern's step through the real challenge sheet: drawn strokes with Add
  character and Submit, typing, choosing) against the build at 71d4a95: 10 failures, the same records.

**Fixed.**
- `src/learn/20_tasks.js` `prepare`: a one-kana blank's `item` is the kana only; the word moves to `exposure`.
- `src/learn/10_mastery.js` `record`: `exposure` ids are seen with support (`modes.assisted`) and kept due (their review
  never put later); no box, streak, ok or mistake change; the totals count the answer once.
- `src/learn/40_evidence.js`: an exposure gets one log line marked `p` (part asked), `h: 'supplied'`, `x: 1`; no try
  counted, no independent evidence; the item page's recent-recognition count leaves such lines out.
- The callers pass it: the challenge runner (`finish`, which also marks the word met), practice objectives (lanterns,
  fishing) and the test harness's automatic answers.
- Saves: nothing is migrated or rewritten; a loaded save's records are byte-identical (U).

**Checked.** U `fr1_partial_word` 39/0; B `fr1_partial_word` all passed on this build (pen, keyboard, choices: k:あ box
1 with its independent evidence, the word box 0, no evidence, one exposure line, met, one answer in the totals; the
whole word credited; the copy model supported; "I don't know" supported for the kana and the word only met). No new
lessons, no campaign matrix, no casting or audio. The full unit run passed (54,469 / 0); B `learning_ui` 15/0,
`practice_a_lamps` 51/51 and `fishing` 11/0 on this build; the voice manifest check is unchanged (content
65cd38053ad6), so 0 new spoken lines.

