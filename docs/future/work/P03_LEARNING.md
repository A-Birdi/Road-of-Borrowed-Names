# P03 · Learning evidence and the task families

*Playbook P03; plan `docs/future/plan/05_LANGUAGE.md` (L1–L20, L17b). Authorised by C-81.*

## What P03 builds

| Part | Source | Where | State |
|---|---|---|---|
| The evidence log: mode, place, help, first try, exposure, repairs; transfer; kanji in words with readings | L1 | `src/learn/40_evidence.js`; the runner passes what happened (`src/ui/65_challenge.js`) | Done |
| Help by category (conceptual < constrain < supplied; access and input never count) | L2 | `src/ui/65_challenge.js` (`helpCat`) | Done |
| Spacing that notices days (orders suggestions only; no overdue counts, streaks or reminders) | L6, C-36 | `src/learn/10_mastery.js` (`DAY_GAP`) | Done |
| The kanji chart's practice square recorded (traced = exposed; from memory = handwriting practice) | L20 | `src/ui/62_kanjichart.js` | Done |
| Sentence forging: an intention, a bounded answer space of authored replies, the support ladder (choose · pieces · word by word · type or write), a result the scene can use | L7 | `src/learn/50_forge.js`; the runner's forge step | Done |
| The task families, each with a worked example at all four levels | L8–L17, L17b | `src/content/workshop/10_families.js`; Words › Ways to practise › The workshop (`src/ui/64_workshop.js`) | Done |
| Asking back: a hard line can carry a simpler version (`~ JP \|\| EN` after it); the dialogue box offers Ask back | L12 | `src/engine/70_script.js`, `src/ui/20_dialogue.js` | Done |
| Optional listening with a text route that is never help | L16 | the runner's listen step | Done |
| Mastery exams and stars: groups from the content, one input type per exam, first committed answer per slot, the 30% rule (assisted or missed together), retakes of just those slots, "completed with help" kept; stars unlock nothing | L3, C-13, C-75 | `src/learn/60_exams.js`; Words › Mastery (`src/ui/66b_mastery.js`) | Done |
| Word, kanji and kana pages: an evidence profile with denominators, never a single percentage, never red; kanji pages on the chart's entries | L4 | `src/ui/66b_mastery.js` (`itemHtml`); `src/ui/62_kanjichart.js` | Done |
| What I can do: 60 statements in ten themes, shown by independent use in two kinds of place, help noted | L5 | `src/content/workshop/20_cando.js`; Words › What I can do | Done |
| The Grow route: one level up, offered, taught first, recorded as stretch, the level never changed, declining leaves no trace; Advanced grows by a task's own `stretchA` | L18 | `src/learn/70_grow.js`; the workshop offers any level | Done (the chapters offer it in their tasks) |

## Contracts

### The evidence log (L1)
Every committed answer (`RB.learn.record`) is also logged per item: `{ d (day), m (mode), c (place), h (help), f (first
try), x (exposed), r (repairs) }`, the last 12 kept. Modes: `recog`, `context`, `construct`, `typed`, `hand`, `listen`.
`ev[mode]` counts independent successes (right first time, no counting help, nothing shown); `ev.transfer` counts an
independent success in a kind of place the item had not succeeded in before. Kanji (`s.learn.kanji[char]`) keep the
words they were met in, each with its reading (`水（みず）`), and handwriting of the kanji itself. The scheduler's own
record (boxes, tallies) is unchanged.

### Help (L2)
| Help | Category | Counts for a star |
|---|---|---|
| Text size, contrast, motion, spacing, furigana, redrawing, a same-shape twin, the same kana at another size | access / input | no |
| Word help on a word that is not the answer; Translate of a production prompt | conceptual | no |
| More suggestions, the chart, word help on the answer, Translate on a comprehension question, an assisted IME conversion | constrain | yes |
| I don't know; How to write | supplied | yes |

### Forging (L7)
A forge step: `{ kind: 'forge', prompt (the intention), families: [{ parts, also?, ok, en, why?, result?, tone? }],
extra?, extraFine?, header?, ctx? }`. Parts may be optional (`?`); sentences may come in either order; every word in
kanji or kana. Anything outside the authored replies is "outside what this can read", never wrong. A family that is
not accepted says why. The validator checks every accepted reply is readable typed and buildable from its own pieces.
The rung chosen is remembered (device setting `forgeRung`); the starting rung follows the level.

## Checks

| Check | Command | Result |
|---|---|---|
| The evidence log | `node tests/run-unit.mjs evidence` | 24/0 |
| The workshop and task families in the browser | `node tests/e2e/workshop.mjs` | 5/0 |
| Validator (forge and listen steps, grammar ids) | `node tools/validate.mjs` | no errors |
| Review ledger (the workshop's 267 lines, self-reviewed) | `node tests/run-unit.mjs review_ledger` | 2/0 |
| Exams, stars, can-do | `node tests/run-unit.mjs exams` | 113/0 |
| The Grow route | `node tests/run-unit.mjs grow` | 6/0 |
| A Mastery exam in the browser (Choose, a star) | `node tests/e2e/workshop.mjs` | 6/0 (with the five above) |
| The kanji chart with records | `node tests/e2e/kanji_chart.mjs` | 8/0 |
