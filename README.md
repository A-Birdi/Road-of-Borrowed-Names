# The Road of Borrowed Names

A single-file fantasy RPG for learning Japanese. A storm has washed the names
off a river country's signs, lanterns and letters; you and one companion walk
the lantern road from Reedwake to the Still Archive, restoring what was lost by
reading and writing real Japanese.

The whole game is **`index.html`** at the repository root: no install, server,
account, network connection or API key.

## Playing
1. Download or clone the repository (or just `index.html`).
2. Open `index.html` in a current desktop or mobile browser (Chromium, Firefox
   or Safari). Opening it straight from disk (`file://`) works.
3. Choose **New Game**, pick a save slot, and follow the prologue (skippable).

Saves stay in your browser (IndexedDB, six slots). The game tells you honestly
if the browser refuses storage and you are playing session-only. There is no
save export or import.

### Updating the game file without losing saves
Saves are not inside `index.html`; the browser keeps them per browser profile
and per page location (for a file opened from disk, its folder path). To
install a newer `index.html`:
1. Close every tab running the game.
2. Keep a copy of the old `index.html` somewhere else (a code backup only).
3. Put the new file at exactly the same path with the same name, replacing
   the old one.
4. Open it the same way as before (same browser, same profile, same path or
   address) and use Continue or Load.

Do not clear site data or cookies for the page, switch browser or profile,
move the file to another folder, or start a New Game in an occupied slot as
a "repair" — any of those can hide or overwrite existing saves.

### Controls
| Action | Keyboard | Mouse / touch |
|---|---|---|
| Move | Arrows or WASD (hold Shift to run) | Click/tap a tile to walk there, or the movement pad (slide your thumb) and hold **Run** |
| Talk / examine / confirm | Enter, Space or Z | Click/tap the person or object, or the **Action** button (it says what it will do: Talk, Read, Look…) |
| Back / cancel | Esc, X or Backspace | Back / Close buttons |
| Menu: Journey, Words, Satchel, Map, plus Save & Load and Settings | C (Tab also opens it from the world) | **Menu** (top right) |
| Word help on Japanese | H | **Word help** switch, then click/tap a word; press and hold a word on an answer button |
| Dialogue history / map / translation | L / M / T | **History** and **Translation** in the dialogue |

Keys can be remapped in Settings › Controls, where you can also move the
touch Action/Run buttons to the left and make the touch controls larger.

### Learning
- **Profiles**: Foundations (kana from zero), Elementary, Intermediate and
  Advanced. The same story adapts every challenge to your profile; combat
  difficulty is a separate setting.
- **Input**: handwriting (recognised on your device), multiple choice, or your
  keyboard's Japanese IME. You can switch mid-challenge; the whole game is
  completable without handwriting.
- **Furigana** on every kanji; tap or hover any word for reading, meaning and
  notes (the lightbulb). Help is never punished; it is recorded as assisted.
- **Inkweaving** battles: read the enemy's telegraphed intent, answer with a
  written response, untie its knots. Nothing is timed.

### Content (counts from `node tools/validate.mjs --stats`)
Six chapters (Reedwake, Saltglass, Cinder Orchard, Snowbell, Lanternfall, the
Still Archive), 88 hand-made maps, six dungeon sequences, about 4,900 lines of
bilingual dialogue, 21 side quests plus a personal quest for each of the four
possible companions (Nao, Mio, Ren, Suzu), an ending with a denouement across
all five towns, and the **Unwritten Atlas**: repeatable post-game expeditions.
New Game+ carries over learning progress only.

## Development
The game is built from modular source in `src/` into the single `index.html`.

```sh
node tools/build.mjs            # build index.html
node tools/validate.mjs --stats # content checks (furigana, exits, answers, …) and counts
node tests/run-unit.mjs         # unit tests (language, recogniser, audio, atlas, …)
npm install                     # Playwright, for browser tests (local machines:
npx playwright install chromium #   also install its Chromium)
node tests/e2e/run.mjs          # browser tests of the built file ([--full] for everything)
```

Useful browser tests: `tests/e2e/ui.mjs` (UI, saves, handwriting, combat),
`tests/e2e/pursue.mjs` (plays a new campaign through all six chapters and an
Atlas expedition), `tests/e2e/matrix.mjs` (every profile × companion).
Node.js 20+ is needed for development only.

Project documents: `SPECIFICATION.txt` (the brief), `REQUIREMENTS.md`
(checklist with evidence), `VALIDATION.md` (what was actually tested),
`HANDOFF.md` (architecture and state), `docs/` (story bible, authoring formats,
recogniser, audio, language, Atlas).

## Status and limits
Tested by automation only (see `VALIDATION.md`): handwriting recognition has
not been tested with real human handwriting samples, playtime has not been
measured with players, and the Japanese has not been reviewed by a native
speaker. Text-to-speech uses a local Japanese voice only if your system has one.

## Third-party data
Kana stroke data is adapted from KanjiVG (© Ulrich Apel and the KanjiVG
project, CC BY-SA 3.0); see `data/NOTICE.txt`, which is also embedded in the
game. No licence has been chosen for the project's own code and content.
