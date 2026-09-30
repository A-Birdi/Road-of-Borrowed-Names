# Words: sentence bookmarks and Creatures Met

Worker W's record for the Living Company and Discovery addendum, §20 (with
§21 persistence, §22 authoring, §23.6 tests and Appendix B). Base: the lead's
foundation `aa825c3` on `claude/stoic-sagan-n3jvgk`.

## What was built

### Sentence bookmarks (§20.1)

- **Keep this sentence** in three places, all through the same records:
  - **The dialogue box.** A paper tab labelled Keep / Kept stands on the
    right of the sheet's top edge; the speaker's tab is on the left. It lives
    in the sheet's tab row, so it is outside the text (a press on the text
    advances the line) and outside the control row. Next keeps exactly the
    place it would have without the tab (measured in the browser test).
  - **The K key** keeps the line on screen. It works only while the dialogue
    is the top layer, and only when K is not one of the player's bound keys.
  - **Journey › Dialogue history.** Every line with Japanese gets a Keep
    button.
  - Pressing Kept again un-keeps the line, as long as you have not written a
    title or note for it. Once it has your words, it can be removed only from
    its page.
  - **Readable inscriptions.** A sign, notice or tablet is read in the same
    box, so the same tab keeps it. Its source is recorded: the prop in front
    of the player, whether it runs a scene or carries its own line.
- **What is stored** (`s.bookmarks`, the array the foundation reserved):
  - the original Japanese with its reading markup;
  - the values of any placeholders it was shown with (`$name`, `$comp`, or
    any key a later system adds to the scene variables, such as a pet's name);
  - the faithful English as it read then;
  - the speaker (and the player's name then, for your own replies) or the
    object it was written on;
  - the map and that map's name;
  - a compact source reference (`sc` scene, `pr` prop, `bt` encounter, `ln`
    unrecorded) with a hash of the source's Japanese and English;
  - the time, and your title (≤ 60 characters) and note (≤ 280).
- **Event-time context.** Every line the dialogue box shows gets a small
  context record `k` on its dialogue-history entry. A chosen reply gets one
  too, one tick after the scene runner adds it. So a line kept later from the
  history is truthful. History entries from before this change have no
  context: a line kept from one is marked "approx", and the page says its
  names are shown as they are now.
- **Branch wording and mutable names.** The page renders the stored markup
  with the stored placeholder values, never the current ones. Tested:
  - renaming the player after keeping a line;
  - changing the companion after keeping a branch-specific line;
  - a pet-style placeholder renamed later (unit test).
- **Saved excerpts.** `RB.bookmarks.status(b)` looks the line up in its
  source by hash:
  - a scene's lines and replies;
  - a prop's line;
  - an encounter's (or its placement's) opening, settling and phase lines.
  A changed line (Japanese or English) or a removed source shows a
  "Saved excerpt" note. The page never re-reads the source to display a
  bookmark, so a content change cannot give it another meaning.
- **Words › Kept sentences.** Newest first, 40 at a time ("Show older
  ones"; a link to an older entry extends the page to it). Each entry opens
  in place. It shows:
  - the sentence with furigana and word help;
  - who said it or what it was read on (English and Japanese labels), where,
    and when it was kept;
  - the saved-excerpt note, when there is one;
  - the lexicon words in it with their meanings;
  - **your own words:** title and note as plain text, labelled as yours,
    set in a handwritten face on a dashed-edged slip. They are never markup:
    they are escaped, control and direction-override characters are
    stripped, and length is bounded;
  - **Hear it**, only when the device has a local Japanese voice
    (`RB.voice`). Otherwise a line says there is nothing to play, and the
    sentence is kept all the same;
  - **Remove**, with a confirmation.
- **Noted words.** A word you noted (Words › Words you noted) becomes a
  filter chip when a kept sentence uses it. It lists only kept sentences,
  never other lines of the game: the test shows the game has many more
  unseen lines with the same word. Matching is by lemma or surface, through
  the game's own parser and lookup.
- **Practise its words** (optional) uses the game's word-recognition
  template ("What does this word mean?"):
  - the word with its reading;
  - the lexicon meaning as the one right option;
  - other words' meanings of the same part of speech as the rest;
  - up to 3 words, with the kept sentence shown as context.

  The steps carry no learning item, and the run passes `noRecord`, so
  **nothing is recorded**. The template is rebuilt in `RB.bookmarks`,
  because `RB.tasks.vocabStep` reads `RB.learn.rec`, which creates empty
  records; that would have shown up as "met" vocabulary. The option order
  uses its own seeded generator, not a game stream.
- **No mastery.** Keeping, titling, noting, practising and removing leave
  `s.learn` byte-identical (unit and browser tests).
- **Cap.** 300 kept sentences per campaign. At the cap, Keep says the page
  is full; nothing is evicted.
- **Link.** `RB.ui.wordsPages.show('bookmarks' | 'creatures', id)` opens the
  folio at that entry, for evidence or memory pages.

### Creatures Met (§20.2)

- **When a creature is registered.** `RB.creatures.meet` runs when an
  encounter begins (`RB.combat.start`), for every creature in it.
  Definitions loading registers nothing (tested: 50 definitions, 0
  registered).
- **What is stored** (`s.creatures[enemyId]`):
  - first met, and its name then (kept for an id a later version removes);
  - `maps`: one record per placement, keyed by map id (every Unwritten Atlas
    room is `atlas`), at most 24. Each has:
    - the setting then (indoor or outdoor, measured the way the battle
      measures it);
    - the map's name, and the nearby place (quest-guide `placeOf`);
    - the opening line the screen showed there. A placement's own line wins,
      as in battle; the other creatures of a group get `with` instead;
    - the line it settled with;
  - `notes`, each recorded once with the time and place:
    - `i:<kind>`: a move it telegraphed;
    - `s:<effect>`: an unanswered move that took effect;
    - `a:<kind>:<how>`: what answered its move (a word id, Answer, See
      through, a technique, or the companion);
    - `c:<state>:<how>`: what cleared its Heat, mist or gathered force;
    - `w:<kind>`: a standing ward soaked some of its blow;
    - `p:<n>`: a phase that has begun, with the line shown;
  - `settled`: set on a win. There are no counts anywhere.
- **Where the notes come from.** The battle's own authoritative results:
  the telegraphs on screen, the fx arrays of `playerAct`, `compAct` and
  `enemyAct`, and `answered`. They are recorded after each part has been
  shown. A later phase, its moves and a plea's answer exist in the notebook
  only after they happen (tested on the Mill Echo, whose phases add Mirror
  and a Plea).
- **Automated test battles** (`RB.test.auto`) register the creature as met
  but keep no line, since nothing was shown.
- **The page, per creature:**
  - its real battle art (`RB.enemyArt.drawArt`, frame 0, cropped by
    `extent`, whole pixels when enlarged) in a specimen frame, with a text
    alternative (its name and its first-seen line);
  - its name with furigana, and the first-seen line;
  - **where you have met it:** each place with Indoors or Out of doors (text
    and an icon, not colour), near which place, "met alongside" for a group
    member, and that placement's own line;
  - **what you have seen it do:** each move named as the battle help names
    it (`RB.combatHelp.intentInfo` title), with its observations worded from
    the battle's own log messages;
  - **how it changed:** phase lines;
  - **when it settled:** the settle line;
  - a closing line: reading the page changes nothing in a battle.
- **No farming, capture, stat boost or advantage.** Nothing reads
  `s.creatures` during play except the notebook itself.

### Language and accessibility (§20.3)

- All kanji in the labels carry readings.
- The labels use only words the lexicon already knows, so these pages add
  no lexicon entries. An earlier version added seven (観察, 出会う, …).
  That tipped the statistical `choice_order` unit test, whose four-option
  place counts are already near their tolerance: 456 of 1644 in one place
  on the base, 465 with the seven words, against a limit of 28 %. The
  labels were reworded (見たものの記録, 会った場所, 建物の中 / 外, 碑,
  棚, 語り).
- The unit test checks every Japanese label: valid markup, a reading on
  every kanji, every word known to the lexicon.
- No new kanji needed pad data (`recog-coverage` passes;
  `src/lang/75_kanjiread.js` is unchanged).
- Your own text is always marked as yours (a "Your title" / "Your note"
  label and a distinct face) and is never markup.
- Controls are at least 44 px. The kept state is a label (Keep / Kept) and
  `aria-pressed`, not colour.
- A polite live region announces keep and un-keep. The "Kept. Find it in
  Words › Kept sentences." notice shows once per session.

## Files and APIs

| File | What |
|---|---|
| `src/engine/63_bookmarks.js` | `RB.bookmarks`: `capture`, `chose`, `keep`, `find`, `remove`, `rename`, `setNote`, `byId`, `status`, `wordsOf`, `usesOf`, `practiceSteps`, `eligible`, `clean`, `migrate`, `placeName`, `MAX`, `TITLE_MAX`, `NOTE_MAX` |
| `src/engine/64_creatures.js` | `RB.creatures`: `meet`, `saw`, `settle` (each guarded: a fault logs and never reaches the battle), `moves`, `phases`, `met`, `migrate`, `placeKey` |
| `src/ui/66_words_pages.js` | `RB.ui.keep` (the tab, K, history buttons: `attach`, `line`, `chose`, `sync`, `toggle`, `historyButton`, `historyClick`), `RB.ui.wordsPages` (`bmHtml`, `crHtml`, `moveTitle`, `drawArt`, `show`); registers Words pages `bookmarks` and `creatures`; adds the folio icons `bookmark` and `creature` |
| `src/styles/66_words.css` | the Keep tab, both pages (classes `bm-*`, `cm-*`, `wd-*`, `utext`, `hkeep`) |
| `src/content/words/10_text.js` | bilingual labels, names of readable things by prop type, and the two `RB.save.addMigration` normalisers |
| `tests/unit/bookmarks.test.mjs` | 65 checks |
| `tests/e2e/bookmarks.mjs` | 6 browser scenarios (in `tests/e2e/run.mjs`): **Keep** (the tab, K, history), **Kept sentences** (own words, keyboard, practice, noted word, save/reload, excerpts), **Inscriptions** (signpost, notice, link), **Creatures** (placements, the Mill Echo battle, page), **390** and **320** (200 % text, touch) |

## Coverage matrix (§22.1)

| Requirement | Implemented | Tested by | Missing / remainder |
|---|---|---|---|
| Keep on the current dialogue line | Keep tab, K | e2e Keep (mouse, K); 390 and 320 (touch) | none known |
| Keep on dialogue-history lines | history buttons | e2e Keep (mouse, Enter) | none known |
| Keep on readable inscriptions | the tab for scene and prop lines, object recorded | e2e Inscriptions (village signpost, mill notice) | object names for less common prop types fall back to "Something you looked at" |
| Next not moved, no stolen clicks | tab in the tab row | e2e Keep, 390 and 320: Next's rect with and without the tab; no overlap with text, controls or Next; elementFromPoint; a Keep press never advances; `world_fixes`, `combat_ui`, `play_ui` | only Chromium |
| Original Japanese, reading markup, faithful English, speaker or object, source, place | stored per bookmark | unit; e2e Keep, Kept sentences, Inscriptions | none known |
| Event-time text for mutable names and branch wording | placeholder values and resolved English on each history entry; replies too | unit (rename, companion change, pet-style placeholder); e2e Kept sentences (save, reload, names and companion changed) | old history entries: honest "approx" note |
| Title, note (escaped, plain), remove | page | unit (escaping, control and bidi characters, bounds); e2e Kept sentences (typed unsafe markup, keyboard, Remove with Escape and confirm) | none known |
| Voice replay when available | Hear it, only with a local Japanese voice | code path only: headless Chromium has no voices, so the button is absent (e2e); not heard | audible check needs a device with a Japanese voice |
| Saved word shows its kept uses, never unseen lines | noted-word chips on Kept sentences | unit; e2e Kept sentences (1 kept sentence vs many game lines) | the Words-you-noted page itself does not link to it (not my file); a one-line link could be added there |
| Optional practice from supported templates, real answers | recognition template, lexicon meanings | unit; e2e Kept sentences (steps run, `s.learn` unchanged) | none known |
| Bookmarks never award mastery | no item, `noRecord`, `s.learn` untouched | unit and e2e Kept sentences (byte-identical `s.learn`) | none known |
| Changed or removed source becomes a saved excerpt | `status()` | unit; e2e Kept sentences (changed line, removed scene) | none known |
| Links from evidence or memories | `RB.ui.wordsPages.show` | e2e Inscriptions | no other page calls it yet (their owners may) |
| Creature registered when met, not when defined | `meet` at encounter start | unit; e2e Creatures | none known |
| Real art, name, reading | `drawArt`, name with furigana | e2e Creatures (art pixels > 200, text alternative), captures | a creature drawn only by an old vector drawer uses a fixed 132 px box (none in the current bestiary) |
| Setting per encounter; species vs placement | `maps` per place, with setting, near-place and line | unit; e2e Creatures (Reedling out of doors on the Mill Road and indoors in the Wheel Pit, each with its own line); 390 and 320 (moth out of doors) | none known |
| Short observed description | the first-seen line (placement's own) | e2e Creatures | none known |
| Intents, statuses, responses only after they occur | notes from telegraphs and fx | unit (step by step on the Mill Echo's rules); e2e Creatures (a real battle) | none known |
| No undiscovered phase, variant, final boss, later plea answer | notes appear only as they happen; the page shows only records | unit and e2e Creatures (before the first change, then before the plea) | none known |
| Settled observation after a win | `settled`, and the settle line | unit; e2e Creatures | none known |
| No counts, farming, capture, stat boost or advantage | nothing stored but first times; nothing read by play | unit and e2e Creatures (no count fields; page text) | none known |
| Kanji with furigana; user text apart; text equivalents | labels via `jhtml`; `utext`; `aria-label`s | unit (labels); e2e (alternatives) | Japanese not reviewed by a native speaker |
| 320×640 and 200 % text; keyboard and touch | layout | e2e phones at 390×844 and 320×640 with 200 % text (no overflow, 44 px targets, nothing cut off); keyboard in e2e Keep, Kept sentences and Creatures; touch at 390 and 320 | none known |
| Save migration, old saves | normalisers keep every record | unit | none known |

## Evidence

- Browser captures: `tests/e2e/out/words/`. The curated WebP set is in
  `docs/screenshots/words/` (README there). I looked at every capture
  myself; nobody else has.
- Test logs: the commands and results are in the final report.

## Measured

- Source: about 72 KB of new source (engine 27 KB, UI 33 KB, CSS 8 KB,
  content 3 KB). `index.html` grew by about 73 KB.
- Stored per history line: a context record of about 40–80 bytes; the
  history keeps at most 220 lines.
- Stored per bookmark: about 420 bytes on average (300 real game lines kept
  came to 125 KB); the cap is 300.
- Page cost with 300 kept and 40 noted words (headless Chromium, while other
  workers' tests ran, load average about 20–25):
  - building the page's HTML: 7–33 ms;
  - first opening in a session: 0.8–1.3 s (the words of every kept sentence
    are parsed once, then cached);
  - opening again: 0.07–0.54 s.
  An unloaded machine should be faster; this was not measured.
- Stored per creature: a few hundred bytes, bounded by 24 places and the
  finite set of notes.

## Limitations

- Only headless Chromium has been used, with emulated touch. There has
  been no real phone, no Firefox and no Safari.
- No Japanese voice is installed here, so "Hear it" has not been heard.
- There has been no human playtesting. The Japanese labels have not been
  reviewed by a native speaker.
- At 320×640 with 200 % text, the battle screen (not changed here) puts its
  "Last exchange" recap over the Step back button. The phone test steps
  back with a programmatic click for that reason; see the merge notes.
- The K shortcut is not in the remappable key list (Settings), because
  that would be an edit to `src/engine/10_input.js`. It stands down
  whenever K is bound to something else.

## Merge notes: every shared file touched

- `src/ui/20_dialogue.js` (3 hook lines):
  - `ensure()`: `RB.ui.keep.attach(box)` adds the tab;
  - `say()`: `RB.ui.keep.line(line, entry)`, after the history push, records
    the line's context on its history entry and updates the tab;
  - `choose()` click: `RB.ui.keep.chose(op)` records the reply's context.

  Next, its handlers and the press-before-line guard are untouched. Every
  call is wrapped in a try/catch inside `66_words_pages.js`.
- `src/ui/50_menu.js` (2 hook lines): the Keep button on history lines
  (`historyButton`) and its click (`historyClick`).
- `src/ui/80_combat.js` (5 hook lines):
  - `RB.creatures.meet` at the start of `start()`, before the automated-test
    branch;
  - `saw` after the telegraphs are rendered;
  - `saw` after the player's and companion's sequences, and after the
    creatures' sequences;
  - `settle` after the win's settle line.

  Each is guarded.
- `tests/e2e/run.mjs`: `bookmarks.mjs` added to the default list.
- **History entries.** They gain an optional `k` record (dialogue history in
  the save). Old entries without it still work. `RB.save.validate` does not
  inspect history entries.
- **Class names.** Creature classes use `cm-*`, because `cr-*` belongs to
  character creation (`45_create.css`). Chips are `bm-chip`, because a bare
  `.chip` is styled inside creation's swatches.
- **`tests/unit/choice_order.test.mjs`** is statistically fragile. Its
  four-option share is 27.7 % on the base, against a limit of 28 %. Any
  worker's new lexicon nouns or verbs can tip it, because they change the
  distractors of the generated meaning questions. If it fails after the
  merge, the cause is likely the combined lexicon, not a bug.
- **Kanji data.** No regeneration was needed. If a merge brings kanji data
  conflicts, regenerate as the brief says.
- **Battle screen at 320×640 with 200 % text.** The "Last exchange" recap
  covers "Step back from this encounter". This was found by
  `tests/e2e/bookmarks.mjs`; it is not in my files, so I have not changed
  it. It may deserve a look from the battle UI's owner.
