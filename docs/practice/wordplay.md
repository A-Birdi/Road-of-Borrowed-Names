# Companion shiritori: the table, records and the relationship (wordplay worker)

Practice addendum (*Roadside Practice, A Quiet Cast, and Companion Shiritori*, v1.0, 2 October 2026):
§9, §13, §14, the shiritori parts of §3.2–§3.5, §4.2–§4.3, §20, §21 (records, limits,
migration), §23.4 (table and records), §23.5, §26.3–§26.6. Built on the foundation at
c86d615 (`docs/PRACTICE_CONTRACTS.md`). The word banks and the searching opponents are the
shiritori engine worker's (`src/engine/71_shiritori.js`, `72_shiritori_ai.js`,
`src/content/shiritori/`); this slice is built against their API only and ships **no bank**.

Evidence categories are kept apart below: **unit** (node, `tests/run-unit.mjs`), **browser**
(headless Chromium against the built `index.html`), **inspection** (captures looked at by the
author), and **human** (none — no human play, no real handwriting, no native-speaker review).

## 1. What was built

### Files (all new unless marked)

| File | What |
|---|---|
| `src/engine/73_wordplay.js` | `RB.wordplay`: eligibility, bank access (fixed bands and the journey pool), frozen bank snapshots, the one active game, drafts, moves, the stored computer move, results with verification by replay, stage receipts, cooperative and custom records, transcripts, pins, suspension and resume, the two relationship events, memories, the reflection record, the recent thought, line selection and the comment limit. Registers the `shiritori` practice namespace and the `wordplay.*` condition head. |
| `src/ui/87_wordplay.js` | The activity (`RB.activity.register('shiritori', …)`): preparation sheet, first-time demonstration offer, the table (Write / Type / Choose, draft panel, ん warning, Stuck?, Leave), the companion's skippable thinking gesture, the result screen with save status. |
| `src/ui/87_wordplay_views.js` | Rules (Roadside House Rules summary), Browse the word bank, the demonstration, the "Learn a few more words together" primer, Look back at the chain (non-mutating, opt-in analysis, pins, optional practice of the chain's words). |
| `src/ui/87_wordplay_links.js` | Company › Companion › Wordplay card (`RB.ui.companyPages.addSection`), Review a saved chain (a sheet over the folio), launch helpers (`U.launch`, `U.launchAfterScene`), the `wp_reflect` / `wp_reflect_defer` scene hooks, the memory → record link (`addRef('wordplay', …)`). |
| `src/content/wordplay/00_lex.js` | 16 lexicon entries for the new text. |
| `src/content/wordplay/05_labels.js` | 56 interface labels with their Japanese (validated: the registry is walked by `tools/validate.mjs`). |
| `src/content/wordplay/10_lines.js` | The companions' table lines: 13 categories × 4 companions (+ the reflection scene = 14), 124 lines (31 each); table-presence gestures. |
| `src/content/wordplay/20_reflect.js` | How we played: 4 scenes, 37 spoken lines (3 statements + Not now, cooperative wording, the real winner named only as a fact); 16 recent-game thoughts; memory texts. |
| `src/content/wordplay/90_hooks.js` | The rest-menu choices (Talk: How we played, Play shiritori) after the existing ones; the Words › Ways to practise entry. |
| `src/styles/76_wordplay.css` | Table, sheet, card and review styles; phone/landscape layouts; finite gestures, none with reduced motion. |
| `tests/unit/wordplay.test.mjs` | Rules of record (see §6). |
| `tests/unit/wordplay_bond.test.mjs` | The §23.5 matrix rows that need no page, memories, thoughts, lines, scenes, the Company card. |
| `tests/e2e/wordplay.mjs` | Browser flows (see §6). |
| `tests/e2e/wordplay_layout.mjs` | Layouts, the four companions at the table, Japanese labels, reduced motion. |
| `tests/e2e/wordplay_fixture.mjs` | **Test-only** fixture bank of ordinary nouns (never registered by the game). |
| `docs/screenshots/wordplay/` | Curated captures (see §7). |
| shared, small: `src/ui/53_company_pages.js`, `tools/validate.mjs`, `tests/e2e/run.mjs` | See §9 merge notes. |

### Public API (`RB.wordplay`)

```
eligible(s, ctx) -> { ok, why?, code? }      committed companion beside you (safeHere) at a rest place (restHere)
installed() -> ['pocket'|'everyday'|'extended']
bankFor(s, setup) -> { ok, bank, kind:'fixed'|'journey', size, small, certified, why?, code? }
journeyPool(s) / primer(s, n) / markEncountered(s, ids)
start(s, setup, { first?, ctx?, starter? }) -> { ok, active, bank } | { ok:false, why, code }
live(s) -> { ok, active, bank } | { ok:false, code:'none'|'campaign'|'companion'|'rules'|'bank', why }
draft(s, text, { entry?, reading? }) -> { status:'empty'|'script'|'outside'|'needs-reading'|'wrong-head'|'repeat'|'ok', edge?, reading?, readings?, senses?, terminal? }
playWord(s, edge, { mode:'hand'|'ime'|'select', repaired?, sense?, form? }) -> { ok, over?, result? } | { ok:false, why }
cpuChoose(s) -> stored move { edge, level, depth, exact, nodes, fallback, provisional, sr }   (chosen once, stored before any animation)
cpuCommit(s) -> { ok, edge, over?, result? }
noteSuggestion(s) / noteInputAssist(s) / concede(s) / stopChain(s) / abandon(s, 'abandoned'|'incompatible-resume') / suspend(s, draft) / resumed(s) -> draft
reflection(s) / deferReflection(s) / reflect(s, 'endings'|'finding'|'together', { said, reply, lines })
cells(s, comp) / supportLabel(support) / transcripts(s, comp) / findTranscript(s, id) / pin(s, id, replaceId?) / unpin(s, id)
line(s, category, salt, facts) / mayComment(s, category) / recentThought(s)
```

`RB.ui.wordplay`: `launch(ctx)`, `launchAfterScene(ctx)`, `records(s, id?)`, `rulesSheet()`, `card(s, comp)`,
`reviewHtml(s, transcript, turn)`, `saveNow(s)`.

Conditions: `wordplay.recent[=win|loss|coop|stop]`, `wordplay.reflect[=cooperative|competitive]`,
`wordplay.won`, `wordplay.lost`, `wordplay.played`.

Events: `wordplay:stage-cleared { stage, comp, session, first }` (after the record is committed);
`activity:session-resolved` is emitted by the activity controller at the end of the session with
`{ games: [{ session, winner, reason, stage }], suspended }`. `discovery:resolved` is never emitted.

## 2. How it plays

- **Ways in.** (a) Talking to the committed companion at a rest place opens the existing rest menu;
  *Just chat* stays first and default, then the ritual, the next topic, the pet's greeting, then
  *Talk: How we played* (only while it waits) and *Play shiritori* (or *Shiritori: resume the match*),
  then *Not now*. The choice closes the conversation first; the activity opens once the scene has let
  go of the screen. (b) Company › Companion › Wordplay › Play shiritori / Resume match. (c) Words ›
  Ways to practise lists it everywhere; *Begin here* only at a rest place with the world safe.
  All three open the same preparation sheet through `RB.activity.launch`, which re-checks eligibility
  at the moment of launch, closes the folio, pauses the world, and afterwards reopens the folio on the
  same page and scroll if the world is safe; focus returns to the card's Play/Resume button.
- **Eligibility** (`RB.wordplay.eligible`): `s.comp` (a provisional companion is refused), then
  `RB.company.safeHere()` (world mode, no scene, the companion on this map, no creature within 6
  tiles), then `RB.company.restHere(s)`. The Company card stays readable everywhere; Play is disabled
  with the truthful reason.
- **Preparation sheet**: Game (Competitive: one game / Learning partner: cooperative, chain 6/12/20,
  default 12), Words (Pocket / Everyday / Extended / From my journey — free play, competitive or
  cooperative, a custom record), Opponent (Casual / Thoughtful / Sharp; cooperative uses the learning
  partner), Support (Open-book / Recall). Every choice is direct and remembered per campaign in
  `RB.practice.settings(s)`; nothing is locked, nothing is auto-adjusted. Rules and Browse the word
  bank are available before play. The first Start offers a short demonstration built from the
  installed bank, or *Skip demonstration* (`demoSeen`). With no bank installed the sheet says *The
  shiritori word banks are not installed in this copy of the game* and Start is disabled. While the
  opponents are the foundation's stub (no `RB.shiritori.ai.STRATEGY` export), the sheet says plainly that
  every level currently plays the Casual policy.
- **The table**: the required kana is always shown; the chain lists every committed word with
  furigana, reading, meaning, who played it and the kana it passes on (and the homophones its reading
  uses up). Whose turn it is is written out. Input: **Write** (the shared pad, no target — it reads
  your strokes only; Confirm puts a character in your word), **Type** (Japanese IME; an Enter during
  composition only finishes the composition; a later Enter plays), **Choose** (Open-book: the whole
  bank, sorted by reading, filtered by the required kana or any kana you type; used words and ん words
  are marked; Recall: hidden until *Find a word*, which marks the game for good). The draft panel
  says what the input could be: outside this match's word bank, the wrong kana, already used, a choice
  among approved readings (工場: こうじょう / こうば), an optional sense (はし), or legal. *Play word* is the
  move; a recognised character, a draft or a choice is not. An invalid draft keeps the turn. A ん word
  opens the warning card (*This ends in ん, so playing it ends the game as your loss.*) with focus on
  *Edit*; *Play anyway* commits. *That is not what I wrote* (Write) shows the pad's other readings or
  clears the last character; it costs no turn and is recorded as input assistance, never as a word
  suggestion. *Stuck?* offers Find a word, Keep thinking, Concede this game (cooperative: End the chain
  here). No timer anywhere. After 24 combined words a low-key slip offers to rest and resume later.
- **The companion's move**: `cpuChoose` asks `RB.shiritori.chooseMove(state, bank, level, rng)` with a
  per-ply strategy stream `RB.practice.stream(s, 'shiritori:strategy', session + ':' + ply)` and stores
  the move in `active.cpuMove` *before* anything is shown; a 0.4–0.8 s thinking gesture (decorative
  stream, 0.4 s with reduced motion, none in fast-forward) can be skipped with *Skip* or a tap on the
  scene; then `cpuCommit` plays exactly the stored move. A reload between the two commits the stored
  move without asking again. A null or illegal answer while a safe reply exists is replaced by a legal
  Casual move and recorded (`fallback: 'invalid-or-null'`); a concession is never faked.
- **Leaving**: *Leave the table* (or Escape) asks: *Keep it for later* (suspend at the confirmed-word
  boundary; the draft is kept beside it and handed back as a draft on resume), *End this match without
  a result*, *Keep playing* (focused). Neither counts as a loss.
- **Result** (§13.4): the persistence of the record is awaited before the result is shown ("Recorded
  and saved." / session-only / no save slot / save failed — said as it is). Truthful reasons:
  *No playable continuation remained in this match's bank for ど. Its ど words had already been used: …*;
  *Your word みかん ends in ん, which ends the game under the house rules.*; *You conceded. 2 unused words
  beginning with み were still in the bank, for example みみ, みず.*; cooperative goal reached / chain
  ended. The companion's line follows the real outcome. Rematch (same setup, the other responder, a
  different certified starter before any repeats), Change setup, Look back at the chain, Leave —
  nothing is executed automatically, and nothing is pre-focused that a held key could trigger.
- **Look back** (§13.5): the exact committed chain with furigana; select any turn to see the required
  kana then, how many safe words began with it (counted in this match's bank at that moment), how many
  the other side had after it, and the words already used. Computer moves are labelled by what the
  search actually did (`exact` → proven; otherwise "looked stronger within the checked moves"; Casual →
  no search). *More analysis* calls `RB.shiritori.analyse` only on the exact frozen bank and shows its
  notes tagged by their own `label`/`proven` (a fact of this chain / proven / within the checked moves, not proven); the stub's empty answer is shown as "No further analysis is available in
  this build". *Practise words from this chain* (when a chain word has a word card) runs ordinary
  practice through `RB.challenge.runStep(..., { noRecord: true })` and `RB.practice.objectives`, at most
  one assessment event per word — the game's moves themselves are never mastery events.

## 3. Records (`s.practice.shiritori`)

Registered with `RB.practice.addNamespace('shiritori', …, norm)`; `norm` fills what is missing and
bounds what grows on every load (old saves: empty, *No matches recorded*; unknown future fields kept).

```
shiritori = {
  byCompanion: { <comp>: {
    v: 1,
    stages: { 'pocket:casual': { played, won, first: Receipt|null, current: Receipt|null, noSuggest: Receipt|null }, … },
    cooperative: { goals: { '6'|'12'|'20': { done, first: { t, session, band, chain, support } } }, chains, best },
    customSummary: { played, won, lost, coop, best, last: { t, format, level, winner, reason, size, session } },
    together: { session, t, event:'activity:shiritori:together', memory:'wordplay:together', committed, raised, format, winner, reason, band, level } | null,
    reflection: { st:'available'|'deferred'|'completed', source, event:'activity:shiritori:reflection', memory:'wordplay:reflection',
                  format, winner, reason, band, level, t, choice?, said?, raised? } | null,
    recent: [Transcript] (≤ 20), firstClearTranscripts: { <stage>: Transcript } (≤ 9), pinned: [Transcript] (≤ 5),
    totals: { played, won, lost }, firsts: { invited, together, clear, sharp, reflection },
    lastWin: { stage, t, session, chain, support, bank, rules } | null, lastFirst: 'pc'|'cpu', thought: { kind, pt, ch, session } | null,
  } },
  active: ActiveGame | null,            // one per campaign
  encountered: { <entryId>: 1 },        // shown with their meaning at the table or in the primer (bounded by the banks)
  recentStarters: { '<bank>@<hash>': [entryId] },   // ≤ 8 bank versions
}
Receipt = { stage, band, level, comp, session, t (first-win time), chain (combined words), pmoves, rules, bank: { id, version, hash },
            ai (strategy version), starter, support: { support, suggested, inputAssist, inputs: ['hand','ime','select'] }, transcript }
ActiveGame = { v, session, campaign, comp, format, band, level, support, goal, kind:'fixed'|'journey', ctx: { source, map },
               bank: { id, version, hash, rules, size, src, starters, snap: [[id, readings, forms, jp, en, repeatGroup, lemmaId]] },
               ai, seed, starter, certified, first, st (RB.shiritori public state; each move carries m, sr, left, rep, sug, f, depth, exact, nodes, fb, prov, ai),
               cpuMove, flags: { suggested, inputAssist, inputs, restPrompted, findUsed }, lastComment, t0, place, pet, susp: { t, map, draft } | null, resumes }
Transcript = { id, t0, t1, comp, format, band, level, goal, bank, rules, ai, certified,
               moves: [{ a, e, r, t, j, en, m?, f?, sr?, left?, rep?, d?, x?, fb?, prov? }],
               result: { winner, reason, pmoves, cmoves, stage, note }, support, place, pet, map }
```

**Saved-stage example** (a real record from the unit test's linear fixture, abbreviated):

```json
"stages": { "pocket:sharp": { "played": 1, "won": 1,
  "first": { "stage": "pocket:sharp", "band": "pocket", "level": "sharp", "comp": "ren", "session": "wp1",
    "t": 1791000000000, "chain": 14, "pmoves": 7, "rules": "roadside-1", "bank": { "id": "pocket", "version": 1, "hash": "…" },
    "ai": "provisional-1", "starter": "po0", "support": { "support": "open", "suggested": true, "inputAssist": false, "inputs": ["ime"] },
    "transcript": "wp1" }, "current": null, "noSuggest": null } }
```

Rules of record:
- A stage cell is cleared only by a competitive, fixed-bank, verified win by no playable
  continuation from a starter the bank certifies (`bank.starters`). Verification replays the
  committed moves from the starter on the frozen bank; a result set by hand fails it. Concession,
  abandonment, cooperative completion, a journey bank and an uncertified opening never clear one.
  A higher level never backfills a lower one. Playing it records *Played* (finished games only).
- Bank or rule upgrades keep the first receipt with its original version; a later win under a
  different bank hash adds `current`. A Recall win without suggestions adds `noSuggest`.
- A suspended match keeps a compact snapshot of the approved entries; on resume the installed bank is
  used when its hash matches, otherwise the snapshot is rebuilt and must reproduce the hash. If not
  (or the house rules, companion or campaign differ), the match is ended as `incompatible-resume`:
  transcript kept as unfinished, no winner, no loss.
- Result reasons: `no-safe-reply`, `terminal-n`, `human-concession`, `cooperative-goal`, `abandoned`,
  `incompatible-resume`; winner is a separate field (`null` for cooperative, abandoned, incompatible).
- Limits (§21.3): 20 rolling transcripts per campaign (one committed companion), 9 first-clear, 5 pinned
  with explicit replacement, one active game; transcripts are bounded by the bank. No raw strokes are
  stored. New Game+ starts a new campaign, so nothing here is carried (`src/ui/40_create.js carry()`
  copies learning only).

## 4. Bond, memories, thoughts — compatibility report

| | Before this slice | After |
|---|---|---|
| Rest menu at an inn (co.inn, Nao) | Just chat · Set the bags down together · Talk: The right-hand pier · Not now | Just chat · Set the bags down together · Talk: The right-hand pier · **Play shiritori** · Not now (and **Talk: How we played** before Play shiritori while it waits). Just chat still first and default. |
| Talking to the companion with a story topic waiting | the topic plays first | unchanged: `companion:chat` and the Pages wrapper still run first; the rest menu (and so Play shiritori) is only reached when nothing outranks it. |
| `talk._pending`, scenes heard, invitations | — | never read or written by this slice (unit row 9 and browser: How We Travel waiting before and after a game, `RB.company.pending` identical). |
| Company › Companion | identity, thought, actions, topics, support, sections | + one Wordplay section (card) at order 60, after the support block. Nothing else changed. |
| Shared memories | story, pets, discoveries, reflections | + at most four: `wordplay:together` (first substantial game, real result, place, chain), `wordplay:reflection` (the reply actually chosen and the companion's answer), `wordplay:first-clear` (links to the receipt's chain; combined text when it was also Sharp), `wordplay:first-sharp` (only if distinct). |
| Bond | chapter, quest, puzzles, reflections, ending, project | + `activity:shiritori:together` (+1 once) and `activity:shiritori:reflection` (+1 once), through `RB.company.award`; cap 12 and thresholds untouched. |
| Thoughts | recent result > quest > rest > place > any | + 16 `kind: 'rest'` thoughts (`prio 5`, condition `wordplay.recent=…`): only at a rest place, only when no recent story result, no quest thought, no pending topic and no Pages conversation; gone after 8 minutes of play (`s.playtime`, which only counts active play) or a chapter change. |

Bond events, exactly (§14.1): together = a finished competitive game (`no-safe-reply`, `terminal-n`,
`human-concession`) with at least three player words (a deliberate ん word does not count), or a
completed cooperative chain with at least six player words, the committed companion having played.
Reflection = after that, any of the three replies. At the cap the events are still recorded
(`company.bond[...] = 1`), the record says `raised: false`, and the screen says *A shared moment
recorded* instead of a rise.

## 5. Coverage matrix

Evidence: U = unit test, B = browser test, I = author's inspection of captures, — = not done.

### §9 identity, modes, stages
| Item | Evidence |
|---|---|
| Competitive one game with real win/loss; cooperative 6/12/20 (default 12); From my journey free play (competitive or cooperative, custom record) | U (all three), B (competitive, cooperative, journey via U only) |
| Available after commitment at rest places; not postgame-only; no Bond/level gate | U (eligibility), B (provisional refused; rest places) |
| Defaults Pocket / Casual / Open-book / one game; any setting directly; remembered | B (defaults), U (normSetup, settings) |
| Demonstration or Skip on first opening | B |
| Bands and levels are separate axes; levels never auto-adjusted | U (three wins → same level) |
| 3×3 grid per companion, exact cell only, no backfill, four isolated campaigns | U (all nine cells; four companions) |
| One companion's records per campaign; no switching | U |

### §10.4–§10.5 (table side), §26.3 input fixtures
| Item | Evidence |
|---|---|
| ねこ / 猫 repeat / ﾈｺ / が≠か / decomposed dakuten / おもちゃ や / コーヒー い / スーパー あ / ぎゅうにゅう う / みかん warning / はし homophone / outside bank / markup / IME composition Enter / recognised candidate is no move / Recall + suggestions / Sharp-with-suggestions clears only P-S / pet changes nothing | U (drafts, support, stream), B (IME composition, recognised character, outside-bank, wrong kana, ん warning) |
| Invalid draft keeps the turn, no record | U, B |
| ん warning: focus on Edit, Play anyway commits | B |
| No safe reply = immediate truthful win; concession distinct | U, B |
| Find a word / Keep thinking / Concede, no timer; rest prompt at 24 | B (stuck), U — rest prompt by code only (inspection) |

### §13 winning, help, records, replay
| Item | Evidence |
|---|---|
| Open-book = whole legal bank searchable by kana, never a subset | B (Choose lists the bank), I |
| Recall hides suggestions; Find a word marks permanently; recognition repair = input assistance | U, B (That is not what I wrote) |
| Wordplay card: name + portrait, Play/Resume, Rules, Review, grid, receipts (band, level, first-win date, chain, support, rules/bank), no-suggestions marker, coop/custom rows, totals with Hide totals | U (card html), B (card), I |
| No fabricated progression (coop, concession, abandon, journey, uncertified, test hook) | U |
| Old saves: No matches recorded; upgrades keep historical wins | U |
| Result: truthful acknowledgement, Rematch (other responder, different starter), Change setup, Look back, Leave, nothing automatic | B |
| Look back: exact chain, required kana at a turn, used words, honest labels, non-mutating | B, U (no bond change) |
| 20 / 9 / 5 transcripts; suspend at a confirmed boundary; draft kept; resume restores; incompatible resume | U, B (suspend/resume from Company) |

### §14 Bond, personality, Ledger
| Item | Evidence |
|---|---|
| Two events, once, via `RB.company.award`; ≤ +2 total | U (matrix), B (together, reflection once) |
| Cap 12 truthful ("A shared moment recorded") | U |
| Reflection: 4 scenes × 3 replies + Not now, cooperative wording, same point for each, activity-owned flag | U, B (Nao, rest menu) |
| Four presentations, ≥ 14 categories, ≥ 2 variants where repeated, no mockery | U (counts), I (captures of all four) |
| One optional comment per four combined moves; Quiet; silent while you write | U (limiter, Quiet), code |
| Thought priority and expiry (8 min active play / chapter) | U (all four companions) |
| Memories bounded (first game, reflection, first clear, first Sharp / combined) | U |
| Pets cosmetic only, event-time snapshot | U (stream unaffected), B (pet drawn), I |

### §23.5 Bond and dialogue matrix
| Row | Evidence |
|---|---|
| Loss after 3 player words → +1, reflection available, no resentment | U |
| Win after 2 player words → stage clear, no bond | U |
| Cooperative 6 player words → +1, no stage | U |
| How we played → +1 once, same for each reply and support | U, B |
| Rematch / replay / reload → nothing more | U, B |
| Score 11 → 12 with both, truthful | U |
| Score 12 → recorded, no rise, later memories kept | U |
| All nine stages → still ≤ +2 | U |
| Pending personal/ending/Pages topic preserved | U (invitation), B (How We Travel) |
| Just chat stays default at an inn | B |
| Ledger where the companion is absent / creature nearby → readable, Play disabled with reason, no teleport | U (reasons), B (away from rest stop, creature) |
| Activity ended while another slot loads → old callbacks cannot write | B (campaign change with the table open) |

## 6. Commands and results

Environment: this worktree (branch `worktree-agent-a2b4665ba0214bd49`, from c86d615), node v22.22.2,
headless Chromium 141.0.7390.37 (Playwright), Linux, a machine shared with five other workers (load
average 12–22 during the runs). Build `node tools/build.mjs` → `index.html` 7,141,444 bytes
(c86d615: 6,923,624; +217,820 raw, +58,787 gzip -9).

Final verification on the commit that adds this text (after f520480) for the wordplay checks below.
The full unit run and recog-coverage are from 0446a1e; the source changes since are keyboard focus in
`87_wordplay.js` and the two engine-compatibility fixes in §9, plus tests and this document. All of
this is against the foundation's stub opponents and a test-only fixture bank, **not** the engine
worker's real banks and opponents (see §9: the merge of the engine was not done in this worktree).

| Command | Result |
|---|---|
| `node tools/validate.mjs --unknown` | **no errors**; `registryTexts` 848 (634 at c86d615), `unknownTokens` 20 (= c86d615: none from this slice) |
| `node tests/run-unit.mjs` (0446a1e) | 6701 passed, 1 failed — the failure is `recog-accuracy` "p95 recognize() time < 60 ms" (61.6 ms at load ≈ 22; the recognizer is untouched here). Rerun alone: `node tests/run-unit.mjs recog-accuracy` **64/0** (p95 23.8 ms). |
| `node tests/run-unit.mjs wordplay` | **317/0** (`wordplay` 149, `wordplay_bond` 168) |
| `node tests/run-unit.mjs recog-coverage` (0446a1e) | **15/0** after `node tools/kanjiread.mjs` (see merge notes) |
| `node tests/e2e/wordplay.mjs` | **82/0** (83/0 on f520480; the count varies by one because the reading step is asserted only when the picked word has two readings). Earlier full runs failed intermittently in the keyboard (and once the touch) section; a diagnostic showed the cause: when the opening ended in こ the test picked 工場, and the table — correctly — asked which approved reading was meant. The tests now choose the reading meant, and the keyboard section checks that choice by keyboard alone. The same diagnosis found a real keyboard defect, fixed: the redrawn reading buttons dropped focus to the page; focus now moves to the reading choice and then to Play word. |
| `node tests/e2e/wordplay_layout.mjs` | **63/0** (5 viewports incl. 200 % text, 4 companions, Japanese, reduced motion); captures from the `--docs` run on 0446a1e (layout unchanged since) |
| `node tests/e2e/company.mjs` | **all passed** (61 checks on 0446a1e; the Company page with the Wordplay card added; an earlier run caught a visually-hidden table caption counted as sideways overflow — fixed by labelling the table instead) |
| `node tests/e2e/company_pets.mjs` | all ok (13), exit 0 (on 1a77db8) |
| `node tests/e2e/pets_greet.mjs` | 17/0 (on 1a77db8) |
| `node tests/e2e/side_ch3.mjs` | 3/3 configurations (banter at the Cinder inn still first) (on 1a77db8) |
| `node tests/e2e/addendum_integration.mjs` | all ok (12), exit 0 (on 1a77db8) |

Not run here: the whole default browser suite (`node tests/e2e/run.mjs`, an hour-plus on this shared
machine), Firefox/Safari/real devices, `visual.mjs --check` over every page.

What the browser test covers (each line an assertion; see `tests/e2e/wordplay.mjs`): Just chat first and
Play shiritori after the existing rest choices; the activity owns the screen; defaults; Nao's
invitation; the provisional-opponent note; the demonstration from the real bank; required kana, turn
and chain with furigana; outside-the-bank and wrong-kana drafts keep the turn; IME composition Enter;
a recognised character is not a move; That is not what I wrote (no turn, input assistance); a full
game by handwriting (pointer strokes), choosing and typing to a real result; mixed input on the
transcript; result options and save status; the together event said truthfully; Look back (turn
selection, non-mutating); Rematch (other responder, different starter); Stuck? (no timer, Keep
thinking, Concede with the unused words named); the ん warning (focus on Edit, Edit by keyboard, Play
anyway → terminal ん loss); How we played once from the rest menu; a restrictive-ending stage clear
(Extended · Casual) with the bank-only reason; a cooperative chain without a stage; Company: nine Not
played cells and No matches recorded, Play closes the folio, the waiting story topic and
`talk._pending` untouched, return to the same page and scroll with focus on the card, How we played
offered on the card, the story topic still first when talking; Keep it for later with the draft kept,
Resume with the draft handed back; a campaign change with the table open; Play disabled away from a
rest stop and with a creature close by, launching anyway refused; Ways to practise (no remote launch;
Begin here at the rest stop); a provisional companion refused; keyboard-only play (including choosing
between two approved readings of 工場, with focus moving to the choice and then to Play word); touch play; no page
errors, no external requests.

## 7. Captures

`docs/screenshots/wordplay/` (15 WebP, 696 KiB, index in its README) from `wordplay_layout.mjs --docs`;
every capture of every viewport is in `tests/e2e/out/wordplay/` (not committed). Inspected by the
author (not by anyone else): all four companions at the table in their own portraits (Nao's scarf and
pencil, Mio's apron and bottles, Ren's glasses and lamp, Suzu's ribbon and earrings), with the slips on
the board and their gesture lines; Mio's with a cat resting beside the table; the phone, landscape and
200 % text layouts with the required kana first; the Japanese interface; the Company card as a 3×3
table on wide pages and a list of lines on phones. Observed and fixed by inspection: the pet first
overlapped the player's name; the chain's auto-scroll scrolled the whole leaf away from the kana at
200 % text; readings were repeated beside kana-only words.

## 8. Limitations (honest)

- **Not yet run against the real banks and opponents.** The engine (three certified banks, searching
  opponents) was merged on the task branch at e7f47db after this work; merging it into this worktree
  was refused by the session's permission system, so it was not done here. Every game in the tests
  uses a test-only fixture (or abstract kana chains in unit tests) registered by the test, against
  the foundation's stub opponents. Compatibility with e7f47db was checked **by reading its code and
  `docs/practice/shiritori_engine.md` only** (§9). On this branch alone the sheet shows *not
  installed*.
- **Provisional opponents on this branch.** With the stub, Thoughtful and Sharp play Casual; the sheet
  and every receipt say so (`ai: provisional-1`, transcript `prov`).
- **Handwriting** was exercised with pointer strokes along KanjiVG references (synthetic), not real
  hands; kana with small marks were typed or chosen instead.
- **No human play, no native-speaker review** of the 124 table lines, 4 reflections (37 lines) and 16 thoughts
  (my judgement only), no real phone, Firefox or Safari (headless Chromium only).
- Strategy-strength, timing (§12.3 elapsed safeguards) and the 3,600-game benchmark are the engine's.
- The 24-word rest prompt and the deeper "More analysis" path are exercised only by code review and
  the stub (which returns no notes).
- `encountered` words are this activity's own set; ordinary learning records are not touched by play.

## 9. Merge notes

Shared files touched (each a small, documented change):
1. `src/ui/53_company_pages.js` — a registry for memory links to records other systems own:
   `addRef(kind, { html(m), click(button, s, api) })`, checked first in `refButton`, dispatched in the
   memories click handler, exported. Existing keepsake and case links unchanged.
2. `tools/validate.mjs` — one line in the registry roots: `wordplay: { content: C.wordplay, BAND, LEVEL }`.
3. `tests/e2e/run.mjs` — two single-line entries: `['wordplay.mjs']`, `['wordplay_layout.mjs']`.
4. `src/lang/75_kanjiread.js` — regenerated by `node tools/kanjiread.mjs` (two lines). On a conflict
   take either side and regenerate (`node tools/kanjivg/fetch.mjs && node tools/kanjivg/convert.mjs &&
   node tools/kanjiread.mjs`).
5. `index.html` — regenerated by `node tools/build.mjs` (rebuild after merging; never resolve by hand).
No other worker's file was edited. `71_shiritori.js` / `72_shiritori_ai.js` were not touched.

**Merge status.** The integrator asked for `git merge e7f47db` (task branch with the real engine, Pace
and suite B) into this worktree branch; the session's permission system refused the merge, so this
branch is still based on c86d615 and nothing here was run against the real engine. The merge (a
merge commit, generated files regenerated as above) and a rerun of `node tests/run-unit.mjs wordplay`,
`node tests/e2e/wordplay.mjs` and `node tests/e2e/wordplay_layout.mjs` on the merged build remain to
be done by whoever holds that permission. `src/content/shiritori/` and `src/engine/71_*`/`72_*` do not
overlap with this slice's files, so conflicts are expected only in the generated files.

Compatibility with e7f47db, **by reading its code and `docs/practice/shiritori_engine.md` §2 only**:
- Banks: `SH.bank('pocket'|'everyday'|'extended')` with `entries` carrying `display: { jp, en }`,
  `forms`, `reading`, `repeatGroup`, `lemmaId`, and `starters` as entry ids (e.g. `w.atama`) — the
  shapes this table reads. `buildBank`'s hash input is unchanged (`[id, readings, forms,
  repeatGroup]`), so the compact snapshot rebuild here keeps matching; `bank.hash` is still on the bank.
- Rules core: `resolve` still returns `key` and `matches[].entry/edges` (`why`, `display`,
  `needsReading` are new and not needed: the table asks for a reading itself); `check` reasons
  `wrong-head`/`repeat` unchanged; `newGame`, `play`, `concede`, `moves`, `safeReplies`, `safeGroups`,
  `legalEdges`, `casualMove`, `readingsOf` exported with the same signatures.
- Opponents: `chooseMove(state, bank, level, rng, o)` with level ids `partner|casual|thoughtful|sharp`
  (the same as `RB.wordplay.LEVEL`); the result's `edge`, `depth`, `exact`, `nodes`, `fallback`,
  `provisional:false` are what the table stores. The table stores its own decided move
  (`active.cpuMove`, before any animation, reload-stable) and does not use `decide`/`state.cpuChoice`;
  `play` clearing `state.cpuChoice` is harmless here.
- **Fixed here after reading it:** (1) the strategy version is exported as `SH.ai.STRATEGY`
  (`'roadside-ai-1'`), which `strategyVersion()` did not read — receipts would have said
  `provisional-1` and the sheet would have kept the provisional note; it now reads it first (unit
  check added). (2) `analyse` notes carry `label: 'fact'|'proven'|'checked'` and `proven`, not
  `exact`; More analysis would have tagged every fact as "looked stronger within the checked moves".
  Notes are now tagged by `label`/`proven` (fact / proven / within the checked moves, not proven),
  with the old `exact` wording kept for notes that have neither.
- Not adopted (left as is, worth a look after the merge): `SH.pickStarter` and `SH.snapshot/thaw`
  (this table has its own starter rotation per bank hash and its own compact snapshot);
  `analyse(…, { deep: true })` for More analysis (its timing with the real search was not measured
  here, so More analysis asks for the default notes only).
