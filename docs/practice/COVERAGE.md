# Practice addendum — implementation and coverage checklist (Phase G)

The brief is *Roadside Practice, A Quiet Cast, and Companion Shiritori* (version 1.0, 2 October 2026).
This file covers each of its sections on the **integrated build**, with all six areas merged.
Each area keeps its full record:

| Area | Record |
|---|---|
| Fishing | [`fishing.md`](fishing.md) |
| Fishing pace | [`pace.md`](pace.md) |
| Shiritori rules, banks and opponents | [`shiritori_engine.md`](shiritori_engine.md), [`shiritori_bench.md`](shiritori_bench.md), [`shiritori_banks/`](shiritori_banks/) |
| The shiritori table and Bond | [`wordplay.md`](wordplay.md) |
| Lamps, desk and mementos | [`suite_a.md`](suite_a.md) |
| Letters, proofreading and comparisons | [`suite_b.md`](suite_b.md) |
| Shared contracts | [`../PRACTICE_CONTRACTS.md`](../PRACTICE_CONTRACTS.md) |

**Evidence codes** (addendum §23.1):
- **S**: source inspection.
- **U**: unit or content test (`node tests/run-unit.mjs`).
- **B**: browser interaction against the built `index.html` in headless Chromium.
- **I**: visual review of captures or recordings, by the implementer only.
- **H**: human play. **There is none for any section.**

## Build identity

| | |
|---|---|
| Source | branch `claude/stoic-sagan-n3jvgk`; the integration commits are listed in VALIDATION.md (Practice addendum — integrated validation) |
| Practice base | `c86d615`: `index.html` 6,923,624 bytes, 2,166,463 gzip -9 |
| After the six merges | `25fab16`: `index.html` 8,134,843 bytes, 2,501,047 gzip -9, sha256 `406e8634a865d321…` |
| Growth | +1.16 MiB raw, +327 KiB gzip. This is under the §23.7 review trigger of 1.5 MiB. The largest additions are proofreading content (105 KB), letters (94 KB), fishing situations (75 KB), the wordplay UI and engine (57 + 50 KB), comparisons (50 KB), the desk UI (49 KB), the fishing stage (49 KB) and the shiritori word list (47 KB). |
| Shiritori rules | `roadside-1`. Strategy `roadside-ai-1`. Bank hashes: pocket `x41ib7`, everyday `47ijfy`, extended `u1mvsz`. |
| Environment | Linux container with Node v22.22.2 and Playwright Chromium. **Firefox, Safari, real phones, the foldable and a stylus were not available.** |

## Section by section

| § | Requirement (short) | Status on the integrated build | Evidence |
|---|---|---|---|
| 1.1–1.4 | Identity kept: no new region, no economy, and fishing is the only timing exception | Done. No new maps (props are placed on existing maps at load time). No currency. The only clock is the fishing response entry. | S; U `pace_noclock`: one place creates a clock; only fishing calls `RB.pace.attempt`; no other caller passes a pace option. |
| 2.1–2.2 | Extend the existing systems; keep Bond values | Done. `RB.company.award` is called only by wordplay, with `activity:shiritori:together` and `activity:shiritori:reflection`. CAP 12 and the thresholds are unchanged. | S (grep of every new file); U `wordplay_bond` |
| 3.1 | One session owner | Done: `RB.activity` (09_activity.js). Seven kinds are registered (fishing, shiritori, lanterns, desk, letters, proofreading, comparisons). | U `practice_core`; B in every activity suite |
| 3.2 | Eligibility, re-checked at launch, with a truthful reason | Done. **Integration fix:** solitary activities no longer require the companion beside you; shiritori declares `companion: true`. | U; B (practice_b, practice_a_lamps, fishing, wordplay) |
| 3.3 | The existing conversation path is kept; Just chat stays first | Done. Activities come after the existing rest choices. | B `wordplay` (rest menu order, How We Travel pending before and after); U `wordplay_bond` |
| 3.4 | Leaving from the Ledger returns to the page, and only if safe | Done: the return view is restored after a 220 ms input hold. | B `fishing` (Words → back to the page), `practice_b` |
| 3.5 | Story state or campaign changes during an activity | Done: `campaign:changing` disposes the session, and `alive()` guards late writes. | B `practice_b` #6, `practice_a_lamps`, `wordplay` (campaign change with the table open) |
| 4.1 | Five outcomes kept apart | Done. A misread, uncertain recognition, timeout or abandon is never a language error. **Integration:** the pace and fishing "That is not what I wrote" buttons are now one button with both modules' bookkeeping. | U `practice_core`, `pace_*`, `fishing`; B `pace`, `fishing` (repair) |
| 4.2 | Shared input contract (choose, IME, handwriting, repair) | Done through `RB.challenge.runStep`. | B (pace, fishing, lamps, desk, practice_b, wordplay: real mouse strokes, CDP touch, IME composition) |
| 4.3 | Ordinary mastery vs activity records | Done. At most one mastery event per objective. Exposed or paced attempts never record. | U `practice_core`, `practice_a`, `practice_b`, `fishing`; B fishing Gentle (learn.items unchanged by the timed catch) |
| 4.4 | Event-based review and cooldowns | Done: `RB.practice.cooldown` and `pickItems`, with no dates. A short pool gives a short session. | U; B `practice_a_lamps` (short pool) |
| 4.5 | Content and sourcing | Partly. Shiritori readings were checked against JMdict (2021 build, local copy, not shipped): 368/368. **Fish captions are pending a source check** (reference sites were blocked here). **No native-speaker review anywhere.** | U `shiritori_banks`; `shiritori_banks/verification.md`; fishing.md §9 |
| 5.1 | A Quiet Cast: Yasu's favour, postgame, three species at the first site, catch and release | Done | U `fishing`; B `fishing` (Yasu, one complete catch, survey) |
| 5.2 | Three sites on existing maps, three readable patches each | Done: `fish.reedwake.current`, `fish.reedwake.quiet`, `fish.saltglass.harbor`, each with 3 patches. | U (reachability unchanged); B; I |
| 5.3 | Nine fish with original art | Done: 9 fish with distinct silhouettes (IoU < 0.9). Captions pending a source check (§4.5). | U; I |
| 5.4 | Availability and discovery (frozen queue, Discover, manual patch) | Done | U; B survey |
| 6.1 | A complete ordinary catch | Done | B (real clicks, keyboard, touch); recording `docs/screenshots/fishing/fishing_catch.webm` |
| 6.2–6.3 | 18 situations × 4 profiles = 72 variants | Done (counted on the integrated build: 18 situations, 72 variants) | U (every variant and accepted form) |
| 6.4 | Invalid, uncertain and alternative responses | Done (`wrongNote`, misread repair, limit notes) | U; B repair |
| 7.1 | Pace modes Off, Gentle, Brisk and Custom 5–180; Off by default | Done | U `pace_*`; B `pace` (Off default), `fishing` (Off, Gentle) |
| 7.2 | Exact timing model (monotonic active time, nested pauses, Ready) | Done | U `pace_clock` (fake monotonic clock: boundaries, nested pauses, IME, pointer cancel, hidden, resize) |
| 7.3 | Soft expiry | Done | B `pace` (generic step); **B `fishing` Gentle on the integrated build: soft expiry, Continue untimed, the fish is landed** |
| 7.4 | Calibration (12 samples, nearest-rank p75, Gentle ⌈1.8B+5⌉, Brisk ⌈1.25B+3⌉, offered then fixed) | Done | U `pace_calibration` (0/11/12/24 samples, outliers, >180 s, recalibrate); B `pace` Gentle offer and acceptance; B `fishing` Gentle 7 s from a 1 s baseline |
| 7.5 | Separate timing records | Done (latest 50 attempts, 24 samples per bucket) | U; B |
| 7.6 | Human evaluation plan | **Pending (H).** The pilot plan and consent-gated local tooling exist (`RB.pace.dev`). No human data. | pace.md §5 |
| 8.1 | Catalogue, milestones 1/3/6/9, mementos, no Bond | Done | U; B notes page, reload without duplicates |
| 8.2 | Animation and composition budget | Done: 12 poses, 7 behaviours × 4 companions, reduced motion kept. | B stats; I captures and recording |
| 8.3 | Companion and pet behaviour | Done: 8 remarks per companion (at least 6 required); all 16 companion × pet pairs and no pet; Quiet chatter. | U; B (16 pairs); I |
| 9.1–9.2 | Competitive first; available after commitment at rest places; defaults Pocket / Casual / Open-book / one game; demonstration or Skip | Done | U; B `wordplay` |
| 9.3–9.4 | Bands and levels are separate axes; a 3×3 grid per companion | Done (all nine cells in four isolated companion campaigns) | U `wordplay` |
| 10.1–10.5 | Roadside house rules (reading, normalisation, boundary, repeats, the ん warning, victory and concession) | Done: `RB.shiritori` with `RULES = 'roadside-1'` | U `practice_core`, `shiritori_banks`, `shiritori_ai`, `wordplay` (the §26.3 fixtures); B (IME, ん warning, outside-bank) |
| 11.1–11.3 | A fixed shared bank, its data contract and audits | Done: Pocket 72 ⊆ Everyday 180 ⊆ Extended 360 repeat-groups, certified. Audits were rerun on the integrated tree at `25fab16`. | U; `node tools/shiritori_audit.mjs`; `shiritori_banks/*.md` |
| 11.4 | Sparse personal banks ("From my journey") | Done: explained, never padded, flagged when small. | U `wordplay` |
| 11.5 | Licensing and provenance | Done. The bank is original selection with provenance per entry. JMdict and IPADIC were used only to check readings and are not committed or shipped. | S; `shiritori_banks/verification.md` |
| 12.1–12.2 | Public-state model; level policies and budgets (Casual, Thoughtful 4,000 nodes, Sharp 30,000, exact endgame at ≤12 groups) | Done | U `shiritori_ai` (1,035 generated states against naive solvers) |
| 12.3 | Responsiveness and determinism | Done: a chunked search on the page thread (the CSP forbids Workers) that yields every 8 ms; the computer's move is stored before it is shown. | U; B `wordplay`; live driver on the integrated tree: **0 fallbacks in 3,010 searched moves** |
| 12.4 | Legitimate traps vs data defects | Done (audits: no dead ends except ん words) | U; audits |
| 12.5 | 3,600-game benchmark | Done. **Rerun on the integrated tree at `25fab16`: the summary is identical to the engine branch.** The higher level wins in all 9 cells. Seeds and per-move depths are in `shiritori_bench.json`. | `node tools/shiritori_bench.mjs --threads 3 --live 60`; `shiritori_bench.md` |
| 13.1–13.6 | Open-book and Recall, the Wordplay record, no fabricated progression, end of game, honest analysis, suspend and resume | Done | U; B `wordplay`, `wordplay_layout` |
| 14.1–14.3 | Two bounded Bond events, the cap kept, the reflection | Done | U `wordplay_bond` (the full §23.5 matrix); B |
| 14.4 | Four distinct presentations, 14 categories, at least 2 variants where repeated | Done: 13 table categories + the reflection scene per companion; 124 table lines; 4 reflection scenes | U |
| 14.5–14.6 | Thoughts and memories; pets cosmetic only | Done: 16 thoughts and at most 4 memories; pets do not touch the strategy stream. | U; B |
| 15 | Lantern tending | Done: Lantern Hall rack after `ch1_done`; 3 or 6 lamps; Review, Focus or Introduce; no dates, no story flags. | U `practice_a`; B `practice_a_lamps` 51/51 |
| 16 | The copying desk | Done: 4 modes, 20 cards mapped to existing lexicon records, six pages of up to 256 KiB, an explicit replace or cancel choice, "Not saved" when storage refuses. | U; B `practice_a_desk` 45/45 |
| 17 | Villagers' correspondence | Done: L01–L12 × 4 profiles = 48; postgame, at the Cinder Orchard post box; one active letter; equal completion for every accepted tone. | U `practice_b`; B `practice_b` |
| 18 | The Proofreader's Tray | Done: P01–P12 × 4 = 48; after Chapter 2; P12 is answered with a question. **Integration:** kept pages go through the desk's six-page budget, and the Tray now says when a page is kept but not saved. | U; B `practice_b` |
| 19 | One Word, Two Moments | Done: C01–C12 cite real scene lines (id, index, speaker, frozen quote, hash), plus the labelled sample S01. Unlocked only when seen. | U; B `practice_b` (C11 unlocked by actually hearing the lines) |
| 20.1 | Menu organisation (no sixth tab) | Done: Company › Companion Wordplay card; Shared memories; Journey › Fishing notes and Practice mementos; Words › Ways to practise; rest options; station scenes. | B |
| 20.2 | Controls: 44 px targets, keyboard, mouse and touch, the five layouts plus 200 % text, reduced motion | Done in every activity's layout pass. **Integration fix:** the hover word-help card no longer opens over the word it describes at 200 % text (it had taken the click meant for that word's button). | B `practice_a_layout` 350/350, `wordplay_layout` 63/0, `fishing`, `practice_b` #5, `pace`; B `learning_ui` (new 200 % word-help check) |
| 20.3 | Settings and their defaults | Done: fishing pace Off, seconds off, waiting animation on, Competitive / Pocket / Casual / Open-book, Hide totals off, chatter Normal. An absent setting means the default. | U; B |
| 21.1–21.1a | Namespace ownership and durable records | Done: `s.practice` with registered namespaces. | U (each area) |
| 21.2 | Transactions and idempotency | Done: no duplicate catch, clear, Bond, memory or page after repeats or a reload. | U; B (reload) |
| 21.3 | Limits | Done (bounded records in every area) | U |
| 21.4 | Migration | Done: older saves gain empty namespaces, with nothing inferred. | U |
| 21.5 | Active-session content updates | Done (bank and version checks; incompatible resume handled) | U `wordplay` |
| 21.6 | Offline and privacy | Done: no network, no Worker, no uploads. | S; B (no external requests in the suites) |
| 22.1 | Complete-scope inventory | Done. Counted on the integrated build: 3 sites × 3 patches; 9 fish; 72 fishing variants; 4 companions × 4 pets; 8 remarks per companion; banks 72/180/360; 9 stages × 4; 14 categories; 2 Bond events and 4 reflections; lamps 3/6; desk 20 cards × 4 modes, 6 pages; letters 48; proofreading 48; comparisons 12 pairs + 1 sample. | `inventory` count (VALIDATION); U |
| 22.2–22.3 | Bounded decisions, documented; hard rules unchanged | Done. Each area lists its decisions; no hard rule was changed. | area records |
| 23.2 | Shared invariants | Each is covered by U/B in the areas above; see the table below. | |
| 23.3 | Fishing tests | Done, except for the gaps named below | see §7 and §5–§8 rows |
| 23.4 | Shiritori linguistic and game tests | Done | see §10–§13 rows |
| 23.5 | Bond and dialogue matrix | Done: every row by U, several also by B | wordplay.md §5 |
| 23.6 | Other activity tests | Done | see §15–§19 rows |
| 23.7 | Performance and storage | Partly. Search slices end at 8.0 ms CPU once warm. Headless Chromium on this shared machine showed no long tasks. Bundle growth is reported above. **Real devices were not measured.** | shiritori_engine.md §5; pace.md; this file |
| 23.8 | Human acceptance questions | **Pending (H)** | — |
| 24 | Phases A–G | A–F were built by the foundation and six workers; G is this integration. | git history |
| 25 | Decision register and non-goals | Kept: no cooking or selling, no tournaments, no timed shiritori, no online play, no clock elsewhere. | S |
| 26.1–26.6 | Worked examples and fixtures | 26.1 quiet catch (B fishing); 26.2 restrictive-ending win (U `wordplay`, `shiritori_ai`); 26.3 input fixtures (U `wordplay`, B IME); 26.4 Ledger (B wordplay card); 26.5 dialogue priority (B); 26.6 finite rewards (U). | |
| 27 | Sources and evidence boundaries | JMdict and IPADIC were used locally to check readings. Web dictionaries and natural-history sites were blocked by this session's network policy, so the fish captions remain pending. | |

## §23.2 shared invariants

| Invariant | Evidence on the integrated build |
|---|---|
| No main story, battle, puzzle, conversation or non-fishing activity gets a clock | U `pace_noclock` (source); B `pace` ("ordinary challenges have no clock") |
| No clock by default; everything is reachable with Off | U settings defaults; B `fishing` pace Off and the survey under Off |
| No uncertainty, misread, interruption or expiry becomes a language failure or a lost turn | U `pace_*`, `fishing`, `wordplay`; B `pace` (repair, expiry), `fishing` (repair, Gentle expiry keeps the fish) |
| No duplicate catch, result, clear, Bond, reward or memory | U every area; B reload tests (fishing, wordplay) |
| No activity steals a pending story, ending or Atlas conversation, or changes Just chat | U `wordplay_bond`; B `wordplay` (How We Travel), rest-menu order |
| No cross-slot, cross-companion or New Game+ leakage | U (four isolated campaigns, NG+); B campaign change mid-session (practice_b, lamps, wordplay) |
| Pets, animation settings and decorative draws change no outcome | U (separate seeded streams; the pet-stream test in `wordplay`) |
| No false claim of saving, native review, recognition accuracy, human testing or exact analysis | S; B (the "kept but not saved" message); `analyse()` claims a forced finish only when proven |
| No external request; nothing left running after exit | S; B (no requests; disposal on exit and on campaign change) |

## What is not verified (named, not replaced by a pass)

- **Human play (H):** none, for any activity. That includes the §7.6 pace pilot and the §23.8 acceptance questions.
- **Native-speaker review:** none, of any new Japanese: letters, proofreading, comparisons, wordplay lines, fishing situations or desk cards.
- **Real handwriting:** none. Tests draw the recognizer's own reference strokes with the real mouse or touch.
- **Browsers and devices:** Firefox, which the owner uses, Safari, real phones, the foldable, a stylus and real software keyboards. Only Chromium (headless) was available.
- **Fish captions:** pending a source check.
- **Timed paces in fishing:** browser-tested with Off and Gentle. Brisk and Custom are tested on a generic step in `pace.mjs` but not inside a fishing cast.
