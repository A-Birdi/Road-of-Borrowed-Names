# P06 · Records, replay, New Game+, pastimes and the book everywhere

*Playbook P06 ("Complete records, replay and pastime foundations"); plan [09_RECORDS.md](../plan/09_RECORDS.md)
K1–K10, [08_CULTURE.md](../plan/08_CULTURE.md) C12, [02_FOUNDATIONS.md](../plan/02_FOUNDATIONS.md) S3–S4; playbook
§15A U02–U05. Authorised by Robin's C-81. Under way.*

Everything here appears only in journeys of the twelve-chapter edition, and on the Main Menu only with the
development switch (`?edition=12`) until the edition ships (F-21). A six-chapter journey's Ledger, title screen and
maps are unchanged; the records browser test checks it.

## What P06 builds

| Part | Source | Where | State |
|---|---|---|---|
| The Road Stamp Book: families (chapters, side stories, the Atlas, pastimes, milestones, language), criteria in words, pressed at a town's stand or on the spot, never withdrawn | K1 | `src/engine/58b_records.js` (`RB.stampBook`), `src/content/records/00_stamps.js`, `zz_stamps_lang.js`; the page in `src/ui/66c_records.js` | Done |
| Stamp stands in five towns, as props, placed where they cut off nothing | K1 | `src/content/records/00_stamps.js`, `05_stand.js` | Done |
| The travel volume: pages witnessed in the story, veiled until reached | K2, K5 | `RB.volume`; the page | Done (the new chapters add their pages) |
| The traveller's seal: frame, style, kana; on every witnessed page | K3 | `RB.seal` | Done |
| Viewing in the Ledger and on the Main Menu; veils kept by the device; reveal a chapter after a confirmation | K4, K5 | `src/ui/66c_records.js` (`menuVolume`), `src/ui/30_title.js` | Done |
| Watch it again: read-only replay that changes nothing in the journey | K6 tiers 1–2 | `src/ui/66c_records.js` (`watch`) | Done (tier 3 stays gated) |
| New Game+: one carryover, the ending companion's farewell, the slot chosen with confirmations | K9, S4 | `src/ui/66d_ngplus.js`, `src/content/records/10_ngplus.js`, the Inn Ledger | Done |
| The pastime registry and records (personal, never ranked, carried by New Game+) | K7, C12, F-03 | `src/engine/72c_pastimes.js` (`RB.pastimes`) | Done |
| Shogi: the ladder (eight lessons, hasami shogi, the small board, mini-shogi, shogi with handicaps), mate-in-one puzzles, Show moves, Why?, Take back, three levels, no clock | C12 | `src/engine/72b_shogi.js` (`RB.shogi`, `RB.hasami`), `src/content/pastimes/`, `src/ui/88_shogi.js`, `src/styles/65_pastimes.css` | Done |
| Fuku's bench: after her nameplate she walks down and offers a game; the board opens with her | C12, K7 | `src/content/pastimes/20_scenes.js`, the hooks in `src/ui/88_shogi.js`; one gated line in `sg.bench_fuku` | Done (F-24) |
| The Distractions tab: an index of the games met, one page per game round its key art (what it is, how to play, where, records), Play with your companion; shiritori's card moves here from Company; fishing's page once the survey has begun | K7, K10 | `src/ui/50_menu.js` (`addSection`), `src/ui/68b_distractions.js`, `src/content/pastimes/10_registry.js`, `src/ui/87_wordplay_links.js` | Done (F-23) |
| Hanafuda: koi-koi with the real deck drawn in code (48 cards), the months and their flowers, the sets with names and readings, matching help, stop or koi-koi, a three-level partner, games of one to twelve months; met through the chapter that teaches it (flag `pt_hanafuda`) | C12 | `src/engine/72d_hanafuda.js`, `src/ui/88b_hanafuda.js`, `88c_hanafuda_cards.js`, `src/content/pastimes/30_hanafuda.js` | Done (F-25) |
| Karuta: iroha karuta, 35 real proverbs (Edo set, two from other traditional sets, named), turn-based, read a word at a time with its first sound first, the device's own voice if chosen, お手つき, an opt-in speed mode, each proverb shown whole with its meaning, the proverbs you take kept; a stamp for a first game played to the end | C12 | `src/engine/72e_karuta.js`, `src/ui/88d_karuta.js`, `src/content/pastimes/40_karuta.js` | Done |
| Shiritori's new themes, festival game support | C12, C10/C11 | — | Next |
| The book shell on the remaining pages | U03–U05 | — | Next |

## Shogi

- **Rules.** Real shogi: drops and their limits (二歩, 打ち歩詰め, no piece where it could never move), promotion
  optional in the zone and forced where needed, no move that leaves your king in check, mate, 千日手 (four times the
  same position). Perft from the start matches the published counts: shogi 30 / 900 / 25,470; mini-shogi 14 / 181 /
  2,512 / 35,401.
- **Handicaps** (駒落ち): lance, bishop, rook, two pieces; the giver moves first, as in real handicap games.
- **The partner** is whoever the launch names (Fuku at her bench), else your companion. Three levels (Gentle, Steady,
  Thoughtful): a small search with a time budget, deterministic in a given position; about a second a move at most on
  the full board.
- **On screen.** Every piece shows its kanji with its reading; promoted pieces in red; their pieces point toward you
  with upright kanji (F-22). Show moves (on by default), Why? (the partner's last move in a sentence, in Japanese with
  readings and in English), Take back. Promotion is always asked. A lesson draws how its piece moves (dots, lines,
  rings) beside a one-move puzzle. A wrong try at a puzzle leaves the board as it was and says why.
- **Records.** Lessons met, puzzles solved, games and wins by board; Take back on a finished game takes its result off
  again (F-22). The stamp "A first win at the board" for a win on the small board, mini-shogi or shogi.
- **Words.** 25 shogi words added to the dictionary (`src/content/pastimes/01_lex.js`); the handwriting data and the
  embedded fonts now include 桂, 龍 and the promoted faces 圭 and 杏 (made with the project's tools:
  `tools/kanjivg/fetch.mjs`, `convert.mjs`, `tools/kanjiread.mjs`, `tools/fonts/subset.py`).

## Lead's decisions (11_CONTRADICTIONS.md part F)

F-21 where the records appear before the release; F-22 shogi's piece orientation, Take back on a finished game, and
stamps after Take back; F-23 the Distractions tab (what it lists, where the companion's games live, when a record is
made); F-24 when Fuku offers a game; F-25 koi-koi's house rules.

## Found and fixed on the way

- The layered site's stone mark covered the Lantern Road's fishing stand tile (a development fixture, but the fishing
  test is right that nothing should): a mark can now name its own area.
- The P05 phase-end unit run (on b5311b6) had three failures, all fixed since: the map census now leaves out gated
  additions (6d6a50a), the fixture above, and the handwriting reading table regenerated.
- The pastime records were first registered as practice namespaces, which filled them in on load: the save-fixture
  test caught older saves changing. They are now made at first play, and reading a page makes nothing (F-23).
- Fishing in this game is Yasu's postgame survey; its page appears only then, matching the fishing engine's rule.
- The Main Menu's travel volume chose its "Continue journey" by a save time it never read (always 0), so with several
  saves it showed the lowest slot's seals and look. It now uses the title's own rule (the newest of each slot's save
  and autosave). The browser test puts the older journey in the lower slot; it fails on the old code and passes now.

## Checks so far

| Check | Command | Result |
|---|---|---|
| Stamps, volume, seal, replay, New Game+ (a keepsake carried only as a record of finding; the pastimes' records carried, never a game under way) | `node tests/run-unit.mjs records` | 105/0 |
| The same in the browser, with the playbook's checks: zero saves (veiled, the creation look), saves (the Continue journey's seals, fixed while open), New Game+ into another journey's slot (asked first, Choose again changes nothing, the ending journey's farewell, the origin slot untouched) | `node tests/e2e/records.mjs` | 7/0 (captures `docs/screenshots/records/`) |
| Shogi's rules, engine, lessons, puzzles, hasami, words | `node tests/run-unit.mjs shogi` | 64/0 |
| Shogi in the browser: ladder, lesson, puzzles with promotion, mini-shogi with Why? and Take back, a win recorded and taken back, hasami, handicap at phone width | `node tests/e2e/shogi.mjs` | 5/0 (captures `docs/screenshots/shogi/`) |
| Fonts and handwriting cover every displayed kanji | `book_type`, `recog-coverage` | 60/0, 15/0 |
| The tab's gating, the index, records never made by reading, older saves unchanged, Fuku's gate, the Japanese | `node tests/run-unit.mjs distractions` | 19/0 |
| Save fixtures load exactly as they were | `node tests/run-unit.mjs fixtures_campaign` | 148/0 |
| Distractions in the browser: five tabs in a six-chapter journey; the sixth tab, a page, Play with Mio and back to the Ledger; Company's pointer; phone index/page/back; Fuku's bench in both editions | `node tests/e2e/distractions.mjs` | 4/0 (captures `docs/screenshots/distractions/`) |
| Hanafuda: the deck, the deal, taking by month, the sets and house rules, stop and koi-koi, doubling, 1,200 rounds with nothing lost, the levels, the words | `node tests/run-unit.mjs hanafuda` | 40/0 |
| Hanafuda in the browser: the months (48 cards), the sets, a game (take one, choose between two, lay down, the partner, a set, stop, the record), phone, its Distractions page | `node tests/e2e/hanafuda.mjs` | 3/0 (captures `docs/screenshots/hanafuda/`) |
| Karuta: the deck (35, one per sound, iroha order, each beginning with its sound), the game (right, お手つき, the speed mode's reach, every card read once), the gate, the stamp, the words | `node tests/run-unit.mjs karuta` | 22/0 |
| Karuta in the browser: a game word by word, right and wrong, to the end with the record and the stamp; the speed mode; all 35 at phone width; its Distractions page | `node tests/e2e/karuta.mjs` | 3/0 (captures `docs/screenshots/karuta/`) |
| Review ledger (self-review only; no native review is claimed) | `node tools/review_ledger.mjs` | 664 lines, 0 without an entry |

**Not verified yet:** Firefox; the foldable; a newcomer to shogi playing the ladder (Robin, by the plan's own
playtest note).
