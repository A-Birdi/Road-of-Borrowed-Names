# Companion shiritori — rules engine, word banks, opponents (engine worker record)

> **Integrated build (Phase G).** Merged first. The audits and the 3,600-game benchmark were rerun on
> the integrated tree at `25fab16`: certification is unchanged and the benchmark summary is identical;
> the live driver made 0 fallbacks in 3,010 searched moves. `RB.shiritori.removeBank(id)` was added
> for tests that build their own banks.

Owner's brief: *Roadside Practice, A Quiet Cast, and Companion Shiritori* (Practice addendum 1.0,
2 October 2026), §10–§12, §21.5, §22.1, §23.4, §26.2–§26.3, §27. This record covers the engine
slice only: rules, banks, audits, opponents, the strength benchmark and their tests. The table UI,
records, Company page, Bond events and dialogue belong to the Wordplay slice
(`docs/PRACTICE_CONTRACTS.md`). Branch `worktree-agent-a0d6e7dcc28c72796`, based on `c86d615`.

**Evidence kinds** used below: **U** unit/content test (`node tests/run-unit.mjs <name>`), **T** a
tool run whose output is committed, **B** the built page in headless Chromium (Playwright),
**S** source inspection. There was **no human play, no native-speaker review, no Firefox/Safari
and no real device**.

## 1. Files

| File | What it is |
|---|---|
| `src/engine/71_shiritori.js` | Rules core (API kept and extended): house rules, input inspection, bank building, manifests, snapshots, the word registry, game state, Casual. |
| `src/engine/72_shiritori_ai.js` | Opponents (replaces the provisional stub, same API): Learning partner, Casual, Thoughtful, Sharp, exact endgame, cooperative driver, `decide`, `analyse`, starter certification. |
| `src/content/shiritori/00_lex.js` | 122 lexicon entries for bank words the game did not know (meanings written for this game). |
| `src/content/shiritori/10_words.js` | The 368 entries (one line each) with readings, boundaries, forms, ruby display, meanings, themes, level, kind, repeat-group, provenance. |
| `src/content/shiritori/20_banks.js` | The three banks (`pocket`, `everyday`, `extended`), built strictly and registered at load; certified starters. |
| `tools/shiritori_audit.mjs` | §11.3 audits → `docs/practice/shiritori_banks/{pocket,everyday,extended}.md`. |
| `tools/shiritori_verify.mjs` | Re-checks every entry against local JMdict / IPADIC copies → `docs/practice/shiritori_banks/verification.md`. |
| `tools/shiritori_bench.mjs` | §12.5 benchmark (3,600 games) → `docs/practice/shiritori_bench.md` + `.json`. |
| `tools/shiritori_browsercheck.mjs` | The built page under its real CSP: Worker refusal, long tasks, slices. |
| `tests/unit/shiritori_banks.test.mjs`, `tests/unit/shiritori_ai.test.mjs` | Unit/content tests (105 + 47 checks). |
| `docs/practice/shiritori_banks/exclusions.json` | 135 candidates checked but not shipped, with the reason. |

## 2. API (for the Wordplay table)

Everything is plain data on `RB.shiritori` (`SH`); nothing reads the network, a dictionary, the
player's learning record, pets, sound or animation settings.

```text
SH.RULES = 'roadside-1'            SH.ai.STRATEGY = 'roadside-ai-1'
SH.BANDS[id] -> { title, version, target, groups, complete, hash, starters }
SH.bank('pocket'|'everyday'|'extended') -> bank { manifest:{id,version,rules,hash,groups[],entries[]}, starters[], entries, groups, edges, … }
SH.ai.prepare(bank)                 compile the search graph ahead of play (optional)
SH.pickStarter(bank, rng, recentStarters)  a certified starter, avoiding recent ones (§13.4)
SH.newGame(bank, { starter, first:'pc'|'cpu' }) -> state { used, required, next, over, history }
SH.inspect(text) / SH.resolve(bank, text) -> { matches:[{entry, edges, needsReading}], why, display }
   why: null | 'empty' | 'markup' | 'unsupported-script' | 'internal-punctuation' | 'outside-bank'
SH.check(state, bank, edge, 'pc') -> { ok, why? , terminal? }   never commits (invalid draft = turn kept)
SH.play(state, bank, edge, actor, extra) commits; ends with { winner, reason:'no-safe-reply'|'terminal-n' }
SH.concede(state, actor)            'human-concession' (distinct from bank exhaustion)
SH.status(state, bank) / SH.moves(state, actor) / SH.safeReplies / SH.safeGroups / SH.legalEdges
SH.WHY[reason]                      plain English reasons ("That word is outside this match's word bank.")
SH.decide(state, bank, level, SH.strategyRng(seed, state, bank, level), { companion })
   -> { edge|null, level, depth, exact, label:'exact'|'estimated'|'no-safe-reply'|'none', nodes,
        fallback, reason, value, proof, mode, iterations, elapsedMs, … }; stored in state.cpuChoice
SH.chooseMove(…same…)               the same without storing (tests, review)
SH.analyse(state, bank, { deep }) -> { notes:[{kind, turn, actor, label, proven, en, …}], one }
SH.snapshot(bank) / SH.thaw(snapshot) -> { ok, bank } | { ok:false, why:'hash-mismatch'|'rules-changed'|'unreadable' }
SH.ai.certifyStarters(bank) / starterCheck(bank, edge)   for a custom (journey) bank
```

Recipe: build the table from `SH.bank(band)`; start with `pickStarter` using a seeded stream that
pets and decoration cannot touch; for a player draft call `resolve`, ask for a reading when
`needsReading`, `check`, show the ん warning when `terminal`, and `play` only on **Play word** /
**Play anyway**. For the computer: `decide(...)` (store happens before any animation), then
`play(state, bank, r.edge, 'cpu', { depth: r.depth, exact: r.exact, label: r.label })`; `r.edge
=== null` means it concedes (only ん words or nothing left). A suspended game saves
`SH.snapshot(bank)` with the state and resumes with `SH.thaw(snapshot)`; if the current bank's
hash equals the snapshot's, the current bank can be used. The seed and turn give the same move
back after a reload (`strategyRng` is a pure function of seed, bank hash, level and turn), and a
decided move is kept in `state.cpuChoice` until it is played.

## 3. The Roadside House Rules as implemented (§10)

| Rule | Implementation | Evidence |
|---|---|---|
| NFKC, trim, katakana = hiragana | `norm`: ゛/゜ (U+309B/C) mapped to combining marks, NFKC, trim, katakana → hiragana; the original text is kept for display | U banks: ﾈｺ, ネコ, decomposed and spacing dakuten, half-width ﾀﾏｺﾞ, full-width spaces |
| Dakuten distinct; no じ/ぢ, ず/づ collapse | nothing strips voicing; ちず is answered from ず only | U: が vs か wrong-head; ちづ ≠ ちず |
| Small kana at the boundary only | `boundary` converts a final small kana for the next head; spellings unchanged | U: おもちゃ → や and おもちや is outside the bank; でんしや ≠ でんしゃ |
| Final ー = vowel of the authored mora | authored `head`/`tail` per entry are checked against `boundary` when a bank is built strictly | U: コーヒー い, スーパー あ, ルビー い, ジュース す, セーター あ; こーひ/こおひい not accepted |
| Written vowel sequences | the final written kana is the tail | U: ぎゅうにゅう う, とけい い, ふうとう う |
| ん | a ん word is legal but terminal: `check` warns, `play` makes it the mover's loss; never counted as a chain move; never searched or played by the computer | U banks (みかん), U ai (concession) |
| Script variants, alternate readings, homophones = one repeat-group | union-find over `repeatGroup` and identical readings; an approved kanji form with two readings sets `needsReading`; choosing one consumes the group | U: 猫 after ねこ → repeat; 橋/箸; 工場 こうじょう/こうば (test fixture) |
| Internal punctuation, unsupported scripts, markup | `inspect`: nothing is removed inside a word; letters/other scripts are `unsupported-script`; `<>&"'\`` is `markup` and is shown escaped; an explicitly approved variant with internal formatting is accepted | U: ね・こ, ね こ, ねこ。, neko, ｎｅｋｏ, 고양이, `<img …>`, ティー・シャツ fixture |
| Outside the bank ≠ not Japanese | `WHY['outside-bank']`; no message calls a word "not Japanese" | U |
| No safe reply → the mover wins; concession is separate | `play` checks the exact unused frozen bank; `concede` records `human-concession` | U both files |

Unsupported spelling structures stay out: readings must be hiragana (with ー), cannot start
with ー, ん or a small kana, and forms may not contain letters or digits.

## 4. Word banks (§9.3, §11, §22.1)

**Sizes achieved: Pocket 72, Everyday 180, Extended 360 distinct repeat-groups** (78 / 188 / 368
entries; homophone senses add entries, not groups). Pocket ⊆ Everyday ⊆ Extended by
construction (`lexicalLevel`). Every bank is certified by `tools/shiritori_audit.mjs` (T):

| | Pocket | Everyday | Extended |
|---|---:|---:|---:|
| repeat-groups / target | 72 / 72 | 180 / 180 | 360 / 360 |
| entries, accepted readings | 78, 78 | 188, 188 | 368, 368 |
| spelling aliases | 68 | 148 | 260 |
| ん-only groups (losing words) | 4 | 10 | 24 |
| homophone groups | 6 | 8 | 8 |
| starting / non-ん ending kana | 33 / 30 | 57 / 51 | 64 / 58 |
| non-ん dead-end endings | **0** | **0** | **0** |
| endings with 1 / 2 replies | 15 / 6 | 10 / 16 | 2 / 14 |
| certified starter groups (stored) | 18 (18) | 73 (70) | 212 (206) |
| groups in the largest strongly connected part of the kana graph | 63 | 156 | 304 |

Pocket includes verified **のり** and **のど** (and therefore so do the larger banks).

**Content.** Common nouns only: animals, food, body, nature, places as common nouns, household
objects, clothing, vehicles, writing and light, performing and art, tools; a few established
compounds (靴下, 手袋, 歯ブラシ, …). No proper names, counters, numbers, inflected words or
ad-hoc compounds. Each entry follows the §11.2 contract (`id, lemmaId, repeatGroup, reading,
forms, display {jp with {漢字|かな} ruby, en}, nounKind, themes, lexicalLevel, head, tail,
lookupRef, provenance[]`). English meanings are written for this game.

**Selection.** 501 candidates were written by hand and checked (below); membership was then
chosen by a seeded local search (scratch tooling, not shipped) under hard constraints — exact
sizes, nesting, initial-bank closure, のり and のど in Pocket, a ん-word quota (4 / 10 / 24) — while
maximising basicness (hand-marked core words, JMdict priority, the project lexicon's level),
certified openings, few one-reply endings, and **connectivity**. The first selection gave Pocket a
connected core of only 34 groups: games fell into a small region after two moves and the exact
solver decided them; the connectivity term raised it to 63. Iconic basics were pinned in Pocket
(いぬ ねこ とり はな かさ あめ いす さくら すし みかん やま はし いえ ほし かお ふく). Two manual
swaps: ルビー instead of 瑠璃 as Everyday's る word; いのしし instead of いなか (田舎 is a whole-word
reading, so 舎 would have no reading of its own for the handwriting pad's furigana). The 135
candidates not shipped are listed with reasons in `exclusions.json`; no difficult ending was
normalised away and no fake noun was added.

**Verification and provenance (§11.5, §27).** The owner's references (Kanjipedia) and other
dictionary sites were **blocked by this session's network policy** (403 for kanjipedia.jp,
jisho.org, edrdg.org, goo, kotobank). Instead, local copies obtained from the package registries
were used, for checking only — they are not shipped or committed: **JMdict** (EDRDG, CC BY-SA 4.0;
the 2021-04-17 build in `jamdict-data` 1.5) and **IPADIC 2.7.0** (in `kuromoji` 0.1.2). Result (T,
`verification.md`): **368/368** entries' JMdict entry holds the reading and every approved form
with a common-noun sense and no reading restriction against the form; 359/368 carry a
common-priority tag (the rest — e.g. ろば, ふくろう — are reported); IPADIC reads 364/368 displayed
forms the same way (米 べい, 琴 きん, 土 ど as single-kanji on-readings; 図形 as づけい). Each entry's
`provenance` names the JMdict entry and its tags, the IPADIC agreement, and whether the meaning
came from the project lexicon or was written for this bank; `lookupRef` is `jmdict:<entry>`.
`reviewed: true` means "consulted and agreed", **not** human review. **Not verified:** learner
suitability per band, meanings, themes (authoring judgement); **no native-speaker review**.

**Kanji.** 23 kanji were new to the game (凧 司 城 寺 寿 沼 狸 猿 琴 芽 虎 蛛 蛸 蜘 蝶 豚 銀 院 電 鯉 鯨 鳩 鶏); stroke data and pad readings were
regenerated with the documented pipeline (`fetch` → `convert` → `kanjiread`); the recognizer
coverage test passes (1,605 kanji, every clean reference read as itself). Every display has
furigana (`node tools/validate.mjs`: no errors; the bank texts are walked through the new
`shiritori` registry root; 0 unknown tokens).

**Companion themes** for tie-breaks (entries per bank, Pocket / Everyday / Extended): practical
(Nao) 4 / 12 / 33; household + care (Mio) 11 / 34 / 67; writing + light (Ren) 8 / 18 / 39; performing
+ art (Suzu) 1 / 8 / 21. Suzu's preference will rarely find a themed tie in Pocket.

## 5. Opponents (§12)

| Level | Policy as built | Budget | Evidence |
|---|---|---|---|
| Learning partner | among safe words, prefer those leaving you ≥1 (then up to 3) safe replies; uniform seeded among the best | one-ply degree check | U: never closes the chain when a continuing word exists (42/42 Pocket positions) |
| Casual | `casualMove`: uniform seeded among safe repeat-groups, then among that group's safe readings; no planning, no mercy | none | U: χ² 3.6 over 8 safe groups, 3,000 seeds |
| Thoughtful | terminal check first (a word leaving no safe reply wins at once), then alpha–beta negamax to 2 plies (its move and your reply) with H at the leaves | 4,000 nodes; 100 ms | U: same root value as a naive negamax on 379 states |
| Sharp | the same, iterative deepening one ply at a time until the budget is spent, the tree is exhausted or a win is proven; ≥4 plies where the budget permits (measured mean 7.4–9.9) | 30,000 nodes; 250 ms | U: matches naive negamax at fixed depth 3 on 129 states |
| Exact endgame (both searched levels) | memoized W(S,h) over the groups still **reachable** from the required kana when ≤12 remain (unreachable groups cannot affect the game); quicker proven wins / longer proven resistance as tie-breaks | 100,000 nodes; 500 ms | U: agrees with an independent solver on 527 states; always plays a winning move when one exists (672 checks) |

- **Leaf (§12.2):** terminal check (no safe move = loss now; a move leaving no safe reply = win next
  ply), else `H = log2(1+safeMoveGroups) + 0.25·log2(1+distinctSafeTails) − 0.20·mean(log2(1+opponentReplyGroupsAfterCandidate))`
  from the side to move, negated across turns. Terminal values `±(100000 − ply)` dominate. H is
  never shown as a probability.
- **Labels:** `exact` when the chosen evaluation is proven (immediate win, completed exact
  endgame, or a search with no heuristic leaf); `estimated` otherwise; `no-safe-reply` for a
  concession. `proof` is `win`, `loss`, `complete` or null.
- **Tie-breaks:** only among root moves whose value equals the best (within 1e-9): Nao practical,
  Mio household/care, Ren writing/light, Suzu performing/art, applied to the move and then to the
  homophone sense shown; then the seeded stream. Casual stays uniform (no themes). U: themed ties
  for both searched levels; a themed word never replaces a better result.
- **Determinism:** the choice depends only on (state, bank, level, companion, rng). U: the same
  seed gives the same move chunked or synchronous, with arbitrary pet/sound/motion options passed.
- **Never illegal:** U: 24 complete games across all level pairs, every computer move legal and
  never ん; plus the 3,600 benchmark games.
- **Responsiveness (§12.3):** the page CSP is `default-src 'none'; script-src 'unsafe-inline'` with
  no `worker-src`, and Chromium refuses a blob Worker ("violates … script-src 'unsafe-inline' …
  'worker-src' was not explicitly set") (B). So the search runs on the page thread as an
  **explicit-stack task** that can pause at any node and yields through a MessageChannel whenever
  the decision's current slice reaches 8 ms (the clock is read every 8 node steps; the slice
  deadline spans root moves and iterations; the first decision on a bank yields after compiling
  its graph). No CSP change is proposed. The search allocates nothing per node (pooled frames,
  typed move lists); the first version allocated per node and showed 10–25 ms slices.
  Measurements: U with a fake clock, slices ≤ 8 ms; Node with process CPU time as the clock,
  warmed-up slices end at 8.0 ms with ≤0.2 ms (rarely ~2 ms) between clock reads. B (Chromium 141,
  built page, 12 busy Extended positions + a Pocket endgame, this machine at load average 13–15
  on 4 CPUs): no long tasks (>50 ms) observed; no fallbacks; Sharp decisions median 21.6 ms, max
  130 ms of wall time including yields; Thoughtful ≤0.3 ms. Wall-clock slices overran 8.5 ms in 8 of
  12 Sharp decisions (longest 19 ms), but the longest gap between two consecutive clock reads —
  only 8 node steps, microseconds of work, apart — was 11.5 ms, matching the overruns: time lost
  to the overloaded machine (preemption or page GC), not search work. A test on a quiet machine
  and on real devices is still needed before calling the 8 ms target met in the browser.
- **Safeguards:** elapsed 100 / 250 / 500 ms (wall clock from the start of the decision). Depth 1
  always completes; past the safeguard the last completed depth is used and `fallback: true,
  reason: 'time'` is reported; an exact attempt stopped by time or by its node ceiling is reported
  as `exactAborted` and the bounded search decides. U: fake clocks for both levels and the
  endgame. Benchmark: 0 fallbacks in 1,049 live-driver moves.
- **`decide`** stores the decision in `state.cpuChoice` before it is shown; a second call for the
  same turn returns it (`stored: true`) instead of rerolling; `play` clears it (U).
- **`analyse` (§13.5):** `missed-win` (a word that would have left no safe reply; proven),
  `overlooked` (safe replies that existed at a concession or a ん commitment), `restricting` (a
  move that left exactly one safe reply), `fewer-replies` (left ≥3 where another word left one),
  `forced-finish` (only when the exact solver exhausted the position: "the eventual winner had a
  forced win from turn N"), and with `{deep:true}` `checked-preference` ("looked stronger within
  the checked moves (d plies)", never called proven) or `proven-alternative`. `one` is the single
  default review point. U for each kind, including no forced-finish claim when the solver could not
  finish.

## 6. Strength benchmark (§12.5) — `docs/practice/shiritori_bench.md`

3,600 games (200 opening/seed pairs × 3 pairings × 3 bands × both seats), node budgets only, run
from `ae90536` with Node 22 on 4 shared CPUs at load average ~18–20: **wall time 1.9 min**.
Higher level's share of wins (95% bootstrap interval over openings):

| | Casual–Thoughtful | Casual–Sharp | Thoughtful–Sharp |
|---|---|---|---|
| Pocket | 73.3% (67.5–78.9) | 89.5% (85.1–93.6) | 85.8% (78.3–92.7) |
| Everyday | 99.3% (98.3–100) | 99.8% (99.2–100) | 80.5% (74.8–86.2) |
| Extended | 99.5% (98.8–100) | 100% (100–100) | 93.8% (91.3–96.0) |

The 55% hypothesis holds in every cell, so no policy tuning was needed. Honest caveats: the
searched levels use the seed only for exact ties, so many Thoughtful–Sharp pairs repeat a game
(distinct games: Pocket 85 of 400 from 18 openings, Everyday 253, Extended 400); the table
therefore also gives an interval over openings and judges on it. Everyday Thoughtful–Sharp has a
seat effect (the first responder wins 69.5%; Sharp wins 100% as first responder, 61% as
second). Casual is near-helpless against search in the larger banks, as a uniform policy must be.
Chains: Pocket 8–10 moves, Everyday 9–13, Extended 18–31. Sharp's completed depth in search mode
averages 7.4 (Pocket) to 9.9 (Extended); Thoughtful 2. Synchronous moves over their safeguard on
this loaded machine: 1–2 per level and band.

Automated strength says nothing about whether a level feels interesting; that needs people.

## 7. Coverage matrix

| Item | Status | Evidence |
|---|---|---|
| §10.1 curated common nouns, one-kana nouns, starter used and excluded from counts, alternate turns | done | U banks (め, は, え, き, ひ are entries; `moves` excludes the starter and ん) |
| §10.2 reading not final kanji; reading choice never chosen for the player | done | U (工場 needsReading) |
| §10.3 every house-rule row | done | §3 above, U |
| §10.4 invalid draft keeps the turn; ん warning without commit; computer concedes rather than fabricate | done (engine); the cards are Wordplay's | U |
| §10.5 no-safe-reply from the exact frozen bank; concession separate; finite game | done | U |
| §11.1 identical frozen bank for both sides | done | S/U (one bank object or its snapshot) |
| §11.2 data contract, repeat-groups | done | U strict validation of every entry |
| §11.2 manifests with version and content hash; save freezes manifest and rules | done (engine) | U `manifest`, `snapshot`/`thaw` (hash and rules checked) |
| §11.3 audits: counts, replies per boundary, zero dead ends, 1/2/>2, fragile loops, concentration, ≥12 certified starters with ≥4 responses and no forced win in 2 plies | done | T `tools/shiritori_audit.mjs`, U re-checks with its own search |
| §11.3 のり and のど in Pocket | done | U, T |
| §11.4 sparse personal banks | engine support only: `buildBank` + `ai.certifyStarters` for a journey bank; the notice and recommendation are Wordplay's | S |
| §11.5 licensing/provenance; no runtime dictionary | done; JMdict/IPADIC used offline for checking only | T `verification.md` |
| §12.1 public-state model, W(S,h) memoized | done | U |
| §12.2 levels, budgets, heuristic, exact endgame, thematic ties | done | U, T benchmark |
| §12.3 off-thread where possible; chunked ≤8 ms; safeguards; seeded stream; choice stored before animation | done (no Worker possible under the CSP) | U, B, T |
| §12.4 legitimate traps kept; no forgetting/adaptation | done (policies use public state only) | S |
| §12.5 3,600-game benchmark with seeds, depths, CIs | done | T |
| §13.5 review honesty | done (engine notes) | U |
| §21.5 frozen data for a suspended game | done | U |
| §22.1 72 / 180 / 360 nested groups, reviewed manifests | done; "reviewed" = checked against references, not native review | T, U |
| §23.4 entries, voicing, half-width, decomposed dakuten, small kana, ー, written vowels, ん, alternate readings, homophones, punctuation, scripts, markup | done | U |
| §23.4 ≥1,000 generated states vs exhaustive solvers | done: 1,035 (527 + 379 + 129) | U |
| §23.4 node/time safeguards, exact/estimated labels, no forced win from non-exhaustive search | done | U |
| §23.4 nine stage cells per companion, Open-book/Recall flags, mixed input | Wordplay slice | — |
| §26.2 a real restrictive-ending win | done: no-safe-reply wins from bank exhaustion; the review can say the replies were used | U (tiny bank), T |
| §26.3 rows ねこ … 猫, ﾈｺ, が/か, decomposed dakuten, おもちゃ, コーヒー, スーパー, ぎゅうにゅう, みかん, はし A/B, outside bank, name/markup | done | U |
| §26.3 IME Enter, candidate text before Play word, Recall suggestions flag, Sharp win on Pocket with suggestions | Wordplay slice (the engine never commits on `resolve`/`check`) | U (check does not mutate) |
| §26.3 pet hidden/recoloured | done: the API takes no pet/sound/motion input; same move with them passed | U |
| §23.7 bundle growth | +100.2 KiB raw / +32.6 KiB gzip over `c86d615` (index.html 6,923,624 → 7,026,264 bytes; gzip 2,166,462 → 2,199,818) | T |

## 8. Commands and results (this branch)

| Command | Result |
|---|---|
| `node tests/run-unit.mjs shiritori` | 152 passed, 0 failed (banks 105, ai 47) |
| `node tests/run-unit.mjs` | 6,538 passed, 0 failed (4 min 23 s, at `ae90536`) |
| `node tools/validate.mjs` | no errors; 15 warnings, all pre-existing (the same 15 on `c86d615`) |
| `node tools/shiritori_audit.mjs` | pocket, everyday, extended certified; nested; のり, のど |
| `node tools/shiritori_verify.mjs --jmdict <db> --kuromoji <dir>` | 368 checked, 0 failures, 4 IPADIC differences |
| `node tools/shiritori_bench.mjs --pairs 200 --threads 3 --live 20` | 3,600 + 60 games, 1.9 min; table above |
| `node tools/shiritori_browsercheck.mjs` | banks 72/180/360; blob Worker refused by the CSP; no long tasks; 0 fallbacks; Sharp median 21.6 ms; longest slice 19 ms with an 11.5 ms gap between clock reads (machine load 13–15) |
| `node tests/e2e/pad_kanji.mjs`, `learning_ui.mjs`, `folio.mjs` (built page, Chromium) | 8/8, 14/14, all ok |
| `node tests/e2e/kanji_chart.mjs` | 7/8: every functional check passes; the wall-clock speed check (recognizer median under a threshold) fails at load average 21–24 on **both** this branch (median 29.3 ms, p95 157 ms) and the untouched `c86d615` build run just before it (26.6 ms, 102 ms), so it measures the overloaded machine; re-run on a quiet machine |
| `node tools/build.mjs` | built index.html (7,026,264 bytes) |

## 9. Limitations

- No native-speaker review of any entry, meaning or band placement; no human play; the levels'
  feel is untested. Kanjipedia and other web dictionaries could not be reached from this session.
- JMdict's 2021 build and IPADIC are the only references; priority tags are frequency proxies.
- Responsiveness was measured in headless Chromium on an overloaded shared Linux machine and in
  Node; not on Firefox, Safari or a phone.
- Searched levels are deterministic apart from exact ties, so a player can learn a line against
  Sharp from a given starter; rematches rotate starters (Pocket has 18).
- Suzu's performing/art theme is thin in Pocket (1 entry).
- `analyse` distances for proven wins are upper bounds (a position is settled at its first winning
  move); this only affects the "quicker win" tie-break and plies in notes.

## 10. Merge notes

Shared files touched (each a small, generated or one-line change):

- `tools/validate.mjs`: one line, the `shiritori` registry root (`RB.shiritori.texts()`).
- `src/recog/10_strokedata.js`, `src/lang/75_kanjiread.js`: **generated**; after merging other
  slices that add text, re-run `node tools/kanjivg/fetch.mjs && node tools/kanjivg/convert.mjs &&
  node tools/kanjiread.mjs` instead of hand-merging.
- `index.html`: **generated**; rebuild with `node tools/build.mjs` after merging.
- `src/engine/71_shiritori.js` keeps every name the foundation exported (`RULES, SMALL, VOW, toHira,
  norm, boundary, validateEntry, readingsOf, buildBank, addBank, bank, banks, resolve, newGame,
  legalEdges, safeReplies, safeGroups, check, play, concede, moves, casualMove, other`); behaviour
  changes: `play` clears `state.cpuChoice`; `resolve` adds `why` and `display`; bank objects add
  `manifest`, `groupOf`, group `readings/heads/tails/terminal/themes`.
- `src/engine/72_shiritori_ai.js`: same `chooseMove` / `analyse` signatures; results now say
  `provisional: false`. `docs/PRACTICE_CONTRACTS.md` ("Provisional seams") can drop the shiritori
  line and point here.
- Suggested HANDOFF/REQUIREMENTS/VALIDATION entries: the bank sizes, test counts and benchmark
  table above (left for the integrator, who owns those files).
