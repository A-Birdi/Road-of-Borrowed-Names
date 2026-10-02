# Practice suite A — lantern tending, the copying desk, Practice mementos

> **Integrated build (Phase G).** Suite B is merged. Its kept proofreading pages go through
> `RB.practiceDesk.keepPage`, and the Tray now shows the desk's `statusText` when a page is kept but
> not saved (no slot, a read-only tab, or session-only storage). The limitation below about *Begin here*
> needing the companion is fixed: `RB.activity.safe()` needs the companion only for activities that
> declare `companion: true`. Results on the integrated build: lamps 51/51, desk 45/45, layout 350/350.

Owner's brief: *Roadside Practice, A Quiet Cast, and Companion Shiritori* (Practice addendum,
v1.0, 2 October 2026), §15, §16, the Practice mementos page (§8.1, §16.3, §20.1) and the matching
parts of §3, §4, §20–§23.6. Built on the foundation in `docs/PRACTICE_CONTRACTS.md` (base commit
c86d615). Evidence categories are kept apart below: **unit** (node), **browser** (Playwright +
Chromium against the built `index.html`, synthetic campaigns in fresh profiles), **inspected**
(captures looked at), **human** (none).

## Files and APIs

| File | What it holds |
|---|---|
| `src/engine/77_lanterns.js` | `RB.lanterns`: unlock/place, pool, topics, plan, caller-side cooldown, the step for a lamp, the new word's card, recording a lamp, the end of a session. Namespace `s.practice.lanterns`. |
| `src/engine/78_desk.js` | `RB.practiceDesk`: the twenty cards and notebook words, compact strokes, page records, **`keepPage`**, persistence, rename/remove, the learning adapter for each mode, the load normaliser, the desk's memento source. Namespaces `s.practice.desk`, `s.practice.mementoDisplay`. |
| `src/ui/88_lanterns.js` | `RB.practiceA` (shared: `worldSafe`, `afterScene`, `launch`, the pixel lamp) and `RB.ui.lanterns`: the session sheet; the `lanterns` activity, the rack's hook `pa_lamps`, the Words entry. |
| `src/ui/89_desk.js` | `RB.ui.deskPage` (`draw`, `typesetHtml`, `preview` for any page record) and `RB.ui.desk`: the desk sheet, the writing square, the observations, the page view, the replace/cancel chooser; the `copying` activity, hook `pa_desk`, the rest option, the Words entry. |
| `src/ui/67_practice_mementos.js` | Journey › Practice mementos (`RB.ui.menu.addPage('journey', { id: 'mementos' … })`), the practice shelf, the optional pin on Company › Shared memories. |
| `src/content/practice_a/00_lex.js` | Four lexicon entries the suite's own text needed (夜空, 仮名, 文法, 練習用). |
| `src/content/practice_a/10_text.js` | `RB.content.practiceA` (every Japanese label, the twenty cards), note `pa_lamps`, scenes `pa.lamps`, `pa.desk`. |
| `src/content/practice_a/20_world.js` | Prop `pa_lamprack` (+ art), its placement in the Lantern Hall, the desk scene on the Gull's small table, the load normaliser registration. |
| `src/styles/77_practice_a.css` | Styles for all three. |
| `tests/unit/practice_a.test.mjs` | 234 checks. |
| `tests/e2e/practice_a_lamps.mjs`, `practice_a_desk.mjs`, `practice_a_layout.mjs`, `practice_a_lib.mjs` | Browser tests and helpers (real mouse strokes, DevTools touch events, IME composition). |

### `RB.practiceDesk.keepPage(s, page)` — the shared six-page contract (for suite B)

```js
const r = await RB.practiceDesk.keepPage(RB.game.s, {
  kind: 'proof',                 // 'desk' | 'proof'
  mode: 'proof',                 // desk: 'trace' | 'copy' | 'prompt' | 'typeset'
  word: '右', reading: 'みぎ',    // optional for proof pages
  ink: [{ ch: '右', strokes: [[{ x, y }, …], …] }],   // raw strokes, 0..1 box units (packed for you)
  // or strokes: [{ ch, s: ['…packed…'] }]            // already packed with RB.practiceDesk.pack
  typeset: { jp: '{右|みぎ} へ', layout: 'card', paper: 'plain', en: '…', lines: ['…', { jp, en }] },
  label: 'The notice, mended',  // ≤ 40 characters, plain text (escaped when shown)
});
// r: { ok, id?, replaced? (the replaced page's id), cancelled?, updated?, saved?, why?, error?, page }
// why when not kept: 'cancelled' | 'too-large' | 'error' (storage refused) | 'invalid';
// why when kept but not saved: 'no-slot' | 'read-only' | 'session'
```

- One budget for every page kind: at most **six** records in `s.practice.deskPages`, each at most
  **256 KiB** (UTF-8 bytes of the stored record, `RB.practiceDesk.measure`) after compacting
  (Ramer–Douglas–Peucker, 12-bit coordinates, 4 bytes a point; coarser simplification is tried
  before refusing). Over budget: `{ ok: false, error: 'too-large', page }`, nothing changed.
- At six, the chooser (the replace/cancel sheet with previews of the six and the new page) is
  asked; only an explicit choice, confirmed, replaces one page in place. Cancel:
  `{ ok: false, cancelled: true }`, nothing changed. Nothing is ever removed otherwise.
- The campaign is then written (an autosave). `saved: true` only after a write that succeeded.
  A refused write puts the pages back exactly as they were (so ordinary saving keeps working) and
  returns `{ ok: false, error: 'storage', saved: false, page }`: the caller keeps the art on
  screen marked unsaved. No slot / read-only tab / session-only storage: kept in the journey,
  `saved: false` with `why` ('no-slot' | 'read-only' | 'session').
- A record with an existing `id` is updated in place (editing grants nothing).
- Rendering any record: `RB.ui.deskPage.preview(page)`, `draw(canvas, page, { cell })`,
  `typesetHtml(page)` (`typeset.jp` or `typeset.lines`). Proof pages show "Proofreading page".
- Suite B lists its own pages in Practice mementos with its own `RB.practice.addMementoSource`
  (the desk's source lists `kind: 'desk'` only, so nothing is shown twice).
- Checked against suite B's documented shape (`docs/practice/suite_b.md` at e7f47db, read only):
  `{ id: 'proof:<task>:<tier>', kind: 'proof', mode: 'proof', typeset: { task, lv, lines, title },
  label, saved, created, updated }` is kept as given (id, kind, mode, typeset untouched, never
  handwriting); keeping the same task again updates it in place keeping the first `created`;
  a cancelled seventh returns `why: 'cancelled'`, which suite B's keep flow reads; previews show the
  typeset title and lines with furigana; Practice mementos shows its `kind: 'proof'` entries with
  their own `html()` art (unit + browser, the browser test using a stand-in source of the same
  shape when suite B's code is absent).

Page record (stored): `{ id, kind, mode, word?, reading?, item?, strokes?: [{ ch, s: [packed] }],
typeset?, label, bytes, saved, created, updated }` — `created`/`updated` are records of when,
never a gate. Pages read from storage are marked saved by the load normaliser; unknown kinds are
kept.

## Places (bounded placement, existing maps only)

| Activity | Map | Tile | Faced from | Why there |
|---|---|---|---|---|
| Practice lamps' rack (`pa_lamprack`, new prop) | `rw.hall` (Lantern Hall, 11×10) | (9,2), top-right corner, `if: ch1_done` | (8,2) facing right | A dead-end corner beside the shelf (9,3): checked by a unit test to close no path (every tile reachable before is reachable after, except its own). Clear of the travelling lantern's shrine (4–5,2), Tsuru (5,4), the desk (7–8,7) and the wall cards (2,1), (7,1). Not a story lantern; its scene changes no flag. |
| Writing desk | `sg.inn` (The Gull, Saltglass, a rest setting) | the existing `smalltable` (9,7) beside its chair (10,7) | (9,6), (8,7), (9,8) | It had no interaction of its own (no quest, no scene); the scene is attached from `src/content/practice_a/20_world.js` only if still empty. |

Lamps are offered after **Chapter 1's resolution**: the flag `ch1_done` (set by `rw.depart` when
the two names are written on the travelling lantern and the chapter ends), or any later chapter.
Before that the Hall belongs to the evening gathering and the companion choice. The desk is
offered from Chapter 2 (where the Gull is).

Entry routes: the rack / desk scene ("Tend a few lamps." / "Sit at the writing desk.", with "Not
now"); Words › Ways to practise ("Begin here" only on that map and when the world is safe, from
the foundation's index); at the Gull the rest menu adds **Writing desk** after the existing choices
(Just chat stays first, Not now last; browser-tested). A scene or the rest menu never launches on
top of itself: the activity starts once the scene has ended (`RB.practiceA.afterScene`).

## The twenty cards → existing lexicon records

All twenty resolve to the core lexicon (`src/lang/30_lexicon.js`, src `core`), none to the suite's
own file (unit-tested). Item ids are the game's (`'v:' + written form`). Sentences are authored
for the prompt (the word is blanked in it).

| Concept | Word | Contextual reading | Record's meaning | Level | Item | Sentence | Accepted |
|---|---|---|---|---|---|---|---|
| water | 水 | みず | water | F | `v:水` | 冷たい水を一杯ください。 | みず, 水 |
| light | 光 | ひかり | light | E | `v:光` | 窓から光が入る。 | ひかり, 光 |
| wind | 風 | かぜ | wind | F | `v:風` | 今日は風が強い。 | かぜ, 風 |
| stone | 石 | いし | stone | F | `v:石` | 道に大きな石がある。 | いし, 石 |
| voice | 声 | こえ | voice | F | `v:声` | 遠くから子どもの声がする。 | こえ, 声 |
| road | 道 | みち | road, path, way | F | `v:道` | この道は海へ続いている。 | みち, 道 |
| name | 名前 | なまえ | name | F | `v:名前` | 紙に名前を書く。 | なまえ, 名前 (not the literary 名【な】) |
| letter | 手紙 | てがみ | letter (mail) | E | `v:手紙` | 家から手紙が届いた。 | てがみ, 手紙 (letter as correspondence, as in the game's letters from home; not 文字/字) |
| sky | 空 | そら | sky | F | `v:空` | 今日は空が青い。 | そら, 空 |
| rain | 雨 | あめ | rain | F | `v:雨` | 朝から雨が降っている。 | あめ, 雨 |
| flower | 花 | はな | flower | F | `v:花` | 道の端に花が咲いている。 | はな, 花 |
| tree | 木 | き | tree; wood | F | `v:木` | 大きな木の下で休む。 | き, 木 |
| river | 川 | かわ | river | F | `v:川` | 川を舟で渡る。 | かわ, 川 |
| sea | 海 | うみ | sea | F | `v:海` | 海の近くに町がある。 | うみ, 海 |
| mountain | 山 | やま | mountain | F | `v:山` | 北に高い山が見える。 | やま, 山 |
| star | 星 | ほし | star | F | `v:星` | 夜空に星が光っている。 | ほし, 星 |
| moon | 月 | つき | moon; month | E | `v:月` | 今夜は月が明るい。 | つき, 月 (the noun, not the counters がつ/げつ) |
| morning | 朝 | あさ | morning | F | `v:朝` | 朝早く出発する。 | あさ, 朝 |
| night | 夜 | よる | night; evening | F | `v:夜` | 夜の村は静かだ。 | よる, 夜 |
| home | 家 | うち | home; my house | F | `v:家` | そろそろ家に帰ろう。 | うち, 家, いえ (the record 家【うち】; 家【いえ】 "house, home" is also correct here, so accepted) |

Every character of each word and its kana has KanjiVG reference strokes (unit-tested); the suite
added no kanji the recognizer lacks (`recog-coverage` passes; 活字 was replaced by 印刷 for that
reason). Notebook words are offered when the noted lemma and reading resolve to a lexicon record,
the word has at most eight displayed grapheme clusters (`Intl.Segmenter`) and every character has
reference strokes.

## How each requirement is met

### §15 Lantern tending

| Requirement | Where | Evidence |
|---|---|---|
| At the Lantern Hall after Chapter 1's resolution; Words index when there and safe | `RB.lanterns.unlocked/here`, `eligible`, `addActivity` | unit; browser (rack absent before `ch1_done`, present after; Begin here only in the Hall) |
| Keeper conversations and story lamps keep priority | a separate prop with an explicit choice; onEnter conversations and Tsuru's talk untouched | unit (scene has no flag/quest ops); browser (Not now leaves flags identical) |
| Practice shades / separate small lamps, never the story lantern | `pa_lamprack`; text "apart from the travelling lantern" | unit + browser: `s.flags` byte-identical after a whole session |
| "Tend a few lamps", event-based, no dates/streaks/missed-day text | no `Date` in 77/88 logic; wording | unit: `Date.now` counted 0 calls across plan/tend/finish; browser: no daily/missed/streak counting text |
| 3 or 6 lamps, default 3; leave any time | prep radios; Stop here; Leave inside a step; Escape | browser |
| Review familiar / Focus on a topic; scheduler + caller cooldowns | `pool`, `topics`, `plan` → `RB.practice.pickItems` with a cooldown fed from the kept history (8 ids, no dates); the scheduler's own mistake cooldown honoured | unit (missed item waits four objectives, also across sessions; never the identical objective at once; resting item left out) |
| New vocabulary excluded by default; "Introduce something new" teaches first | `pool('new')`, `teachFor` → the existing teach card | unit; browser (card first, then the lamp) |
| One lamp = one authored assessment through existing input | drill at or below the player's level, else the task generator's step; `runStep(noRecord)` + `objectives(session).assess` | browser: three lamps answered by choice (a wrong option first), IME composition, real handwriting → exactly 3 events, the mistake recorded as given; unit: all four profiles produce answerable steps |
| Mistake explained and continued; help never dims | the challenge runner's feedback; every completed lamp is drawn the same | unit (assisted → lit); browser (all three lit after a mistake) |
| End view: lamps together, optional reviewed list, one first-session note, nothing else collectible, no bond/currency | `endView`, `finish` | unit + browser (company/inventory/gold/discovery identical; one note, not repeated; New Game+ adds none) |
| A two-item pool gives two lamps | `plan` | unit; browser ("Only 2 familiar items are ready…") |
| No enemy behaviour change | nothing touches foes; the world is paused (mode `activity`) | source inspection |

Exposure note: a lamp right after a new word's card is recorded as practice (`exposed`), not as an
ordinary assessment — the answer was on screen moments before. The word is introduced.

### §16 The copying desk

| Requirement | Where | Evidence |
|---|---|---|
| Existing safe desk/inn; Writing desk in rest choices and Words; secondary explicit action | the Gull's small table, `addRestOption`, `addActivity`, scene choice | unit; browser (rest menu order, Begin here at the Gull) |
| Four modes, directly selectable; no trace needed first | paper tabs on the sheet; any card in any mode | browser |
| Trace: numbered reference strokes underneath; motor practice only | `surface({mode:'trace'})`; `record` → `exposed` | browser (mouse strokes over 木; no mastery event; introduced, not promoted); unit |
| Copy: model in its own pane; copying only | `.dk-model` beside (left of) the square | browser (touch strokes, pointerType `touch`, model not overlapping; no event) |
| Prompt: meaning/context first; model via help; ordinary assessment only when unexposed | cards list meanings only; gapped sentence; `How to write`; `record(prompt)` with `exposed` = help used, the word's card just shown, or shown earlier at this sitting | browser: unexposed handwriting → one event; written again → practice; model shown → practice; unit: each case |
| Typeset: approved word, readable layout; decoration | layouts Card / Vertical / With its sentence; papers Plain / Squares / Lined; never strokes | unit + browser (labelled typeset, never "Your handwriting") |
| Verified stroke data; uncertain recognition vs supported stroke-order observation; no beauty grading | `observe`: the recognizer reads all kana and kanji without being told the character; a stroke-order note only when `strokeOrderFeedback` is `confident`; otherwise "No stroke-order note…" | browser (木 read and "Stroke order and direction match the model"); inspected |
| Twenty cards → existing records; unencountered = optional model practice | table above; "new to you" / "its card comes first" | unit |
| Notebook words ≤ 8 clusters with reference data | `notebookCards` | unit |
| Six pages, mode and chosen label; "Your handwriting" only for real strokes | `keepPage`, `makePage`, `handwritten` | unit + browser |
| Display alongside mementos; keepsake untouched unless explicitly pinned instead | Practice mementos shelf; pin asks first when a keepsake is up | browser (declined: keepsake stays; accepted: keepsake down but still found; one pinned display on Shared memories) |
| ≤ 256 KiB after compacting; replace/cancel with previews; never silently delete; no repeated reward | `keepPage` + chooser | unit (noise page compacted 400 strokes → 57 KB; an uncompressible page refused); browser (previews, cancel, confirmed replace) |
| Storage failure: art visible, marked unsaved; progress usable | `persist`, `keepPage` revert | unit; browser (refused write → "Not saved", page count unchanged; then kept on retry) |

### §8.1 / §16.3 / §20.1 Practice mementos

Journey › Practice mementos renders every registered source (`RB.practice.mementos(s)`), with an
entry's `html()` or `draw(canvas, { cell })`. Fishing's rod ribbon and framed illustration and the
proofreader's page appear once their owners register them; until merge only desk pages exist
here. The page is listed when there is at least one memento.

### Shared rules (§3, §4, §20–§23)

- One session at a time through `RB.activity` (kinds `lanterns`, `copying`); states preparing →
  active → resolving → result; eligibility rechecked at launch; the world paused; a campaign
  change disposes the session and closes its sheets, steps, cards and the replace sheet
  (browser-tested for the lamps).
- Recognition is never told the expected character; the character is used only afterwards to
  compare and for the stroke-order matching (the kanji chart's own method).
- Keyboard (Tab/Enter/Escape, native radios), mouse and touch paths; 44×44 targets; no horizontal
  overflow at 320×640, 390×844, 844×390, 1280×800, each also at 200 % text where listed below.
- Reduced motion: the lamp's light animation is off (`body.reduced-motion`, `prefers-reduced-motion`).
- `s.practice` only: `lanterns` (sessions, lamps, 8-entry history, note given, last choice),
  `desk` (last choice), `mementoDisplay` (shelf, pin), `deskPages`. New Game+ carries none of it
  (unit). Old saves start empty (foundation).
- Offline only; no `Math.random` for an outcome (the scheduler's own scoring aside, as in the
  rest of the game).

## Commands and results (this worktree, Linux, Chromium via Playwright)

| Command | Result |
|---|---|
| `node tools/build.mjs` | built `index.html` — 237 source files |
| `node tools/validate.mjs` | no errors (existing lexicon-conflict warnings only) |
| `node tools/validate.mjs --unknown` | no unknown tokens in `practiceA` registry text or `pa.` scenes |
| `node tests/run-unit.mjs practice_a` | 234 passed, 0 failed |
| `node tests/run-unit.mjs` | 6621 passed, 0 failed (base c86d615: 6387) |
| `node tests/e2e/practice_a_lamps.mjs` | 51/51 |
| `node tests/e2e/practice_a_desk.mjs` | 45/45 |
| `node tests/e2e/practice_a_layout.mjs` | 350/350 (7 configurations × 13 screens: overflow, 44 px targets, focus, no errors) |
| Related existing browser suites (shared files touched: pad, challenge runner, Company page, journey pages) | learning_ui 14/0, pad_kanji 8/0, keepsakes 32/32, company all passed, folio, settings, ui 14/0, play_ui, addendum_integration, systems 4/0 — all passed. kanji_chart: 7/8 on the first run (its timing check, recognize p95 114.8 ms, while other tests ran on the shared machine); rerun: the speed check passed twice and the full file 8/8. |

Bundle: `index.html` 6,923,624 → 7,066,361 bytes raw (+139 KiB), 2,166,446 → 2,207,244 gzip
(+40 KiB). Largest additions: `src/ui/89_desk.js` 49.5 KB, `src/ui/88_lanterns.js` 20.4 KB,
`src/engine/78_desk.js` 18.9 KB, `src/styles/77_practice_a.css` 16.3 KB.

Captures (inspected): `docs/screenshots/practice_a/` — `lamps_*` (world rack, preparation, a lamp
step, handwriting, between lamps, end, short pool, new word card, topic, Words index, phone),
`desk_*` (rest menu, word lists per mode, trace before/after, prompt task and page, typeset,
replace sheet and its confirmation, mementos, pinned on Shared memories, copy on a phone, unsaved
after a refused write, the replace sheet with a proofreading page), `mementos_with_proof_1280`,
`lamps_end_foundations_1280`, `layout_*` at 320×640 with 200 % text and at 844×390. At merge the
committed copies were converted to WebP (quality 0.9, same size; 9.3 MB of PNG became 5.1 MB).

## Limitations (honest)

- **No human testing** of any kind: no player has tended a lamp or written at the desk. Comfort,
  usefulness and enjoyment are unmeasured.
- **Handwriting** in the browser tests is synthetic: real pointer/touch events following KanjiVG
  reference strokes. It proves the input path, not recognition accuracy on human writing. No real
  touch device, pen or Firefox/Safari run was made (Chromium only; emulated phone sizes).
- **Japanese**: the twenty sentences and the suite's labels are authored and validator-checked
  (furigana, known tokens) but have had **no native-speaker review**.
- The Words index's "Begin here" uses the foundation's world-safety check, which also needs the
  companion beside you; the world props themselves only need a safe world. After Chapter 1 the
  companion normally follows, so this rarely differs.
- Practice mementos from fishing and the proofreader cannot be shown until those suites register
  their sources (contract above); the page is generic and was tested with desk pages only.
- The rack's art and the lamp pictures are inspected in captures only (no animation review beyond
  the light's CSS fade).

## Merge notes (every shared file touched)

| File | Change | Why |
|---|---|---|
| `src/ui/60_pad.js` | +`ink()` on the pad API (3 lines) | the prompted desk page keeps the player's own strokes |
| `src/ui/65_challenge.js` | `opts.keepInk` → `res.ink` before the pad is destroyed (1 line) | same |
| `tools/validate.mjs` | registry root `practiceA: C.practiceA` (1 line) | the suite's Japanese is validated |
| `tests/e2e/run.mjs` | one line adding the three browser scripts | suite runner |
| `RB.content.maps['rw.hall'].props`, `['sg.inn']` small table | changed at load from `src/content/practice_a/20_world.js` (no edit to chapter files) | placements above |
| `RB.ui.company.render` | wrapped (after the keepsakes' wrapper) to show a pinned practice memento on Shared memories when no keepsake is up | §16.3 explicit pin |
| `RB.company.addRestOption` | one option, only at a rest place with a desk | §16.1 |
| `index.html` | rebuilt | resolve conflicts by rebuilding, never by hand |

Integrator: `docs/PRACTICE_CONTRACTS.md` may take the `keepPage` paragraph above (suite B calls
it by name). Namespaces added: `lanterns`, `desk`, `mementoDisplay`.

**Not yet merged with e7f47db.** The integrator asked for `git merge e7f47db` (suite B, fishing
pace, the shiritori engine) in this worktree; the merge command was refused by this session's
permission check, so it was not run and not worked around. Everything above was tested on this
branch alone (base c86d615). Expected overlaps when merging: `src/ui/65_challenge.js` (this
branch adds one line, `opts.keepInk`, in `finish()` before the pad is destroyed; e7f47db adds pace
hooks, `step.judge` and `res.given`), `tools/validate.mjs` roots (one line each), `tests/e2e/run.mjs`
(one line each), `index.html` (rebuild). After merging: rebuild and rerun
`node tests/run-unit.mjs`, `node tests/e2e/practice_a_lamps.mjs`, `practice_a_desk.mjs`,
`practice_a_layout.mjs` (the desk test's suite-B block then uses suite B's real memento source).
