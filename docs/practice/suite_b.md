# Practice suite B — Villagers' letters, the Proofreader's Tray, One word, two moments

Practice addendum §17 (correspondence), §18 (proofreading), §19 (comparisons), and the
matching parts of §3 (one session at a time), §4 (learning evidence), §20 (navigation),
§21 (records), §22 (presentation) and §23.6 (tests). The shared contracts are in
`docs/PRACTICE_CONTRACTS.md`.

Status words used here: **automated (unit)** means a node test checks it.
**Automated (browser)** means a Playwright test checks it against the built `index.html` in
Chromium. **Inspected** means a person (the implementer) looked at a capture or the code.
No human play-testing, native-speaker review or real-device testing has been done for this
suite.

## Files and APIs

| File | What it holds |
|---|---|
| `src/engine/79_bcore.js` | `RB.practiceB`. Holds the place (`PLACE`, `atPlace`, `worldSafe`, `launchAfterScene`); the bounded answer space (`writings`, `sequences`, `space`, `match`, `partsMatch`, `pieces`, `replyOf`, `handFold`); the once-per-campaign assessment (`firstAssessment`, `markAssessed`); the cooldown that carries across sittings (`cooldown`, `note`); and the kept-page seam (`keepPage`, `pages`, `MAX_PAGES` 6, `MAX_BYTES` 256 KiB). |
| `src/engine/79_letters.js` | `RB.letters`. The `letters` namespace and its states (waiting/open/answered, met). Also `open`, `setAside`, `complete`, `eligible`, `available`, `answered`. |
| `src/engine/79_proof.js` | `RB.proof`. The `proof` namespace, plus `available` (after Chapter 2), `eligible`, `complete`, `repairedLines`, `pageFor` (a typeset kept page) and `kept`. |
| `src/engine/79_compare.js` | `RB.compare`. The `compare` namespace and source integrity (`hash`, `status`: ok/moved/changed/removed/teach). Seen tracking: `scan` on `story:settled`, `certainlyShown`, `inBacklog`. Also `unlocked`, `locked`, `samples`, `complete`, `mark`/`unmark`, `markStatus` (current/historical) and `eligible`. |
| `src/content/practice_b/00_lex.js` | About 72 lexicon entries (source `practice_b`) for words that appear only in this suite. |
| `src/content/practice_b/10_letters.js` | `C.practiceB.letters`: L01–L12 × F/E/I/A = 48 variants. |
| `src/content/practice_b/20_proof.js` | `C.practiceB.proof`: P01–P12 × F/E/I/A = 48 variants. |
| `src/content/practice_b/30_compare.js` | `C.practiceB.compare`: C01–C12 (real scene lines) and S01 (labelled teaching examples). |
| `src/content/practice_b/40_place.js` | Gives the post box its scene (`pb.postbox`) and the `!hook pb_open`. |
| `src/ui/90_letters.js` | The UI label registry `C.practiceB.ui`, which the validator walks. `RB.ui.pb` holds the shared sheet helpers, `writeStep`/`chooseStep` and `assess`, plus the keep flow. `RB.ui.letters` holds the tray, the letter sheet, the closing and the folder. It also registers activity `letters`, Words page `letters`, Ways to practise `letters` and hook `pb_open`. |
| `src/ui/91_proof.js` | `RB.ui.proof`: the tray, the task sheet (notice beside its evidence), the repair, the result and keeping a page. It registers activity `proofreading`, Ways to practise `proofreading` and memento source `proof`. |
| `src/ui/92_compare.js` | `RB.ui.compare`: the pair, the question, the explanation, the bookmark and the grammar/word link. It registers activity `comparisons`, Words page `compare` and Ways to practise `comparisons`. |
| `src/styles/78_practice_b.css` | All `pb-*` styles. |
| `tests/unit/practice_b.test.mjs` | Unit and content tests: 83 checks. |
| `tests/e2e/practice_b.mjs` | Browser tests: 6 tests, and the captures. |

Records live in `s.practice.letters`, `s.practice.proof` and `s.practice.compare`, each
added with `RB.practice.addNamespace`:

- `letters`: `{ v, active, done{id: {st:'sent', tone, via, reply, prof, t, replays, last?}}, assessed{}, recent[≤8] }`. A reply is kept to at most 80 characters.
- `proof`: `{ v, done{id: {prof, t, replays, ...}}, assessed{}, recent[≤8] }`.
- `compare`: `{ v, seen{≤64 'scene#line': {h, t}}, done{}, marks{≤32 id: {quotes[≤2], t}}, assessed{}, recent[≤8] }`.

Each record has a normaliser that bounds it. Malformed entries are dropped, and an
unknown letter, task or pair id is kept, not lost. Kept proofreading pages go to
`s.practice.deskPages` through `RB.practiceDesk.keepPage(s, page)` when suite A's desk is
present. Otherwise `RB.practiceB.keepPage` uses its own fallback with the same six-page
budget (see Merge notes).

## The furniture

There is one place for letters and the tray: **the post box in Shino's Post House, Cinder
Orchard**.

- Map `co.post`, prop `mailbox` at tile **(7, 5)**. Before this suite the prop had no scene,
  no text and no quest.
- It is reached from (6, 5) facing right, (7, 4) facing down, or (7, 6) facing up.
- Cinder Orchard has fast travel (`cinder`), so the post box stays reachable after the
  journey's end.
- Interacting runs scene `pb.postbox`. Its choice offers *Answer the villagers' letters*
  when `post` (the journey's end) and *Look at the proofreader's tray* when `ch2_done`.
  Before either, it says there is nothing to use yet.
- The activity starts after the scene ends (`!hook pb_open` → `launchAfterScene` → on
  `story:settled` → `RB.activity.launch(kind, {source:'world-prop'})`).
- Words › Ways to practise lists all three activities:
  - Letters and the tray show *Begin here* only inside the post house, when the world is
    safe. Elsewhere they say where to go, and a direct launch is refused.
  - Comparisons can begin anywhere the world is safe. They are also in Words › One word,
    two moments.

## Villagers' letters (§17)

Each letter names its sender and the scene that must have been seen first (`met`). A letter
whose sender you have not met waits face down. Only one letter is open at a time; the
others wait without expiring. Each variant has an authored, bounded set of reply
*families*. Each family is a sequence of parts, with optional parts and allowed
reorderings. A part counts in kanji or in its reading, so mixed kana and kanji writing is
accepted. Every family is tagged with a tone (polite, friendly, warm, thankful...). All
accepted tones close the letter the same way, with the villager's acknowledgement.

A reply can be entered in three ways:

- built from pieces;
- chosen (F);
- written by hand or typed with an IME (a `writeStep` whose `judge` uses the answer space).

A reply outside the space gets *Outside what this letter can read* and is not counted as
a mistake. A reply in the space that says something else (another intention) is explained
and counted. *Show the replies it can read* marks the result as exposed. After the first
reply, a letter opens as a *practice copy — not sent*: it is counted as a replay, and it is
neither delivered nor assessed again.

| Id | From | Unlocked by | Function | Title | ok/total families F E I A | Objective per tier |
|---|---|---|---|---|---|---|
| L01 | hana | `seen.rw.hana_first` | ack-parcel | A parcel from the teahouse | 2/4 2/4 3/5 3/5 | g:v_masu_forms ×3, g:indirectness |
| L02 | co_ume | `seen.co.ume_first` | accept | Persimmons on the terraces | 3/4 3/5 3/5 3/5 | g:v_mashou ×2, g:keigo_kenjo, g:indirectness |
| L03 | co_goro | `seen.co.goro_first` | decline | An evening at the lookout | 3/4 3/5 3/5 3/5 | g:v_potential ×2, g:conj_node, g:keigo_kenjo |
| L04 | sousuke | `seen.sb.sousuke` | which-day | A day at the post shelter | 3/4 3/5 3/5 3/5 | g:qword_ka_mo, g:kosoado, g:v_te_kudasai, g:indirectness |
| L05 | tamae | `seen.sg.tamae_first` | where | A box at the Gull | 2/4 3/5 3/5 3/5 | g:prt_ni, g:prt_he, g:te_giving, g:keigo_sonkei |
| L06 | akari | `seen.lf.akari` | thanks | The brush comes home | 2/3 3/5 3/5 3/5 | g:te_giving ×3, g:keigo_sonkei |
| L07 | shiori | `seen.sg.shiori_early` | clarify | Smudged tide times | 2/3 3/5 3/5 3/5 | g:qword_ka_mo, g:prt_kara_made, g:prt_tte, g:keigo_kenjo |
| L08 | hoshino | `seen.sb.hoshino` | no-hurry | A question about the stars | 2/3 3/5 3/5 3/5 | g:v_temo_ii, g:v_te_kara, g:v_nakereba, g:keigo_kenjo |
| L09 | lf_tokuji | `seen.lf.tokuji_story` | request vs promise | The boat at the sluice | 2/3 3/5 3/5 3/5 | g:v_te_kudasai, g:te_giving ×3 |
| L10 | co_isao | `seen.co.isao_first` | bounded offer | Glass to carry | 2/3 3/5 3/5 3/5 | g:prt_dake_shika ×2, g:prt_kara_made, g:toki |
| L11 | tsuru | `seen.rw.tsuru_first` | sequence | First the hall, then the bridge | 2/3 3/5 3/5 3/5 | g:v_te_kara, g:mae_ato, g:v_te_kara ×2 |
| L12 | genzo | `seen.sg.genzo_wind` | ambiguous request | "Bring that" | 2/3 3/5 3/5 3/5 | g:kosoado, g:prt_no, g:comp_yori_hou, g:sentence_final |

There are 220 authored reply families: 134 accepted tones and 86 other intentions. They
come to 3,167 writings, counting every allowed order and every kanji/kana mix. The unit
test checks each writing (typed or built from pieces) and confirms it reads as its own
family. It also checks that unrelated text falls outside the space.

## The Proofreader's Tray (§18)

The tray becomes available after Chapter 2's resolution (`ch2_done`), at the same post box.
Each task shows its purpose, then the notice and its evidence side by side:

- **Evidence kinds**: plan, count, slip, rule, note, steps, sequence, objects, table and
  measure. Each kind states things in words as well as drawing them.
- **Finding the wrong portion**: the player picks the portion that disagrees with the
  evidence. A portion that agrees is explained, not counted.
- **Repair kinds**: replace (choose on F; write or type otherwise), order, choose, and ask.
- **Result**: the repaired notice is shown with the change marked, followed by its
  consequence and an explanation.

**P12** cannot be settled. Every tier's evidence is insufficient. Changing any portion is
answered *That would be a guess*. The right finding is *The evidence can't settle this*,
followed by a question for the sender, from a bounded set: a leading or settled guess is
explained, and a real question is accepted. The notice is left unchanged.

A result can be **kept as a page**: typeset, not handwriting. The label is plain text of up
to 40 characters. The page goes to the shared six-page budget, where a seventh asks which
page to replace, and cancelling keeps them all. Kept pages are listed as a Practice
mementos source (`proof`).

| Id | Function | Title | Repair F, E, I, A | Objective per tier |
|---|---|---|---|---|
| P01 | left / right | Which door? | replace ×4 | v:右 ×3, v:向かう |
| P02 | quantity | How many? | replace ×4 | g:counters ×4 |
| P03 | recipient | To whom, and where? | replace, order, replace, replace | v:郵便, g:prt_he, v:手前, v:様 |
| P04 | negation | Allowed, or not? | replace ×4 | g:v_naide_kudasai, g:v_temo_ii, g:v_naide_kudasai ×2 |
| P05 | steps | In what order? | order ×4 | v:沸かす, g:v_te_kara ×3 |
| P06 | before / after | Before, or after? | replace ×4 | g:mae_ato ×4 |
| P07 | label | Which one is which? | replace ×4 | v:塩, v:水門, v:薬, v:干潮 |
| P08 | date | Which day? | replace ×4 | v:木曜日, v:金曜日, g:counters ×2 |
| P09 | vague wording | Clear enough? | choose + find ×4 | v:桟橋, g:prt_de, g:keigo_sonkei, g:keigo_kenjo |
| P10 | comparison | Which is more? | replace ×3, choose + find | g:comp_yori_hou ×4 |
| P11 | condition | Only when? | order + find ×3, choose + find | g:prt_wa, g:cond_tara, g:toki, g:cond_ba |
| P12 | insufficient evidence | Can the tray settle it? | ask ×4 | g:qword_ka_mo, g:counters, g:qword_ka_mo, g:keigo_kenjo |

## One word, two moments (§19)

Each pair quotes two real lines from the scene script by scene id and line index. Each
side also stores the speaker, a frozen quotation (Japanese and English), its reading and a
hash: `RB.util.hashStr(jp + '||' + en)` in base 36.

**Unlocking.** A line counts as seen only in one of two ways:

- it is in the backlog with that scene as its source; or
- its scene is in `s.seen` and the line is *certainly shown* — before the scene's first
  choice, condition, jump, end, battle or hook, and not conditional itself.

A pair unlocks only when both of its lines have been seen. A locked pair shows nothing of
itself, only a count.

**Changed source lines.** If a line's hash no longer matches, the line is shown as
*historical*: its frozen text, marked as such. If it moved, it is found again by hash.

**Sample pair.** S01 is a labelled teaching example, offered while nothing is unlocked:
"Teaching example — nobody in the story says this".

**What the player gets.** The question is scaffolded by tier (F: choose with English; E–A:
choose or write). Then come the explanation, an optional bookmark (bookmarked
comparisons, frozen quotations), and a link to the grammar point or word. There is no
score and no bond. One comparison is a complete sitting; *three* is offered (by cooldown).

| Id | Category | Line A (speaker, hash) | Line B (speaker, hash) | Link |
|---|---|---|---|---|
| C01 | referent | `rw.mio_first`#5 (mio, 1kwv91i) | `rw.ren_lanterns_done`#3 (ren, 1ql4edx) | grammar kosoado |
| C02 | literal / contextual | `rw.mochi_find`#2 (narrator, 15bemcq) | `sg.omi_checking`#3 (omi, 1reantf) | word 重い |
| C03 | request / statement | `sg.wataru_first`#4 (wataru, 1307a5p) | `sg.omi_report`#1 (player, cr3pdy) | grammar v_te_kudasai |
| C04 | permission / prohibition | `rw.hall_gather`#7 (tsuru, 3plw8i) | `co.sayo_seats`#3 (co_sayo, 1n1ng2e) | grammar v_temo_ii |
| C05 | direct / indirect | `rw.ren_first`#6 (ren, 1m6k9nr) | `co.bell_ring`#13 (co_tokiwa, 8q057i) | grammar te_giving |
| C06 | certainty | `co.tokiwa_confront`#4 (co_tokiwa, vskyv) | `rw.ren_after`#1 (ren, 19gyz5e) | grammar kamo |
| C07 | cause / sequence | `sg.omi_intro`#15 (omi, aidvpi) | `rw.nao_first`#1 (nao, 1ycxraj) | grammar conj_kara |
| C08 | completed / intended | `sg.wataru_confront`#10 (wataru, nswt9r) | `sg.omi_wataru`#9 (omi, btsulm) | grammar tsumori |
| C09 | bounded / open offer | `rw.tsuru_first`#10 (tsuru, q303s4) | `co.fusa_first`#2 (co_fusa, 1xt33ha) | grammar prt_dake_shika |
| C10 | before / after | `sg.harbor_first`#4 (daigo, 1c6yhf3) | `rw.bridge_scene`#11 (narrator, 1wj9g1x) | grammar mae_ato |
| C11 | register | `rw.oto_post`#1 (oto, 18vpck4) | `co.shino_post`#0 (co_shino, 1lnqqq9) | grammar register_polite_plain |
| C12 | ambiguity | `sg.genzo_grump`#4 (genzo, 1hi8j6u) | `sg.genzo_truth`#4 (player, 7f6dbr) | grammar v_nakereba |
| S01 | sample (teaching) | teaching example | teaching example | grammar indirectness |

All 24 source lines currently resolve with a matching hash; the unit test checks this.

## Learning evidence, sessions and records (§3, §4, §21)

- **One session at a time.** Each activity is one `RB.activity` session. The letters and
  the tray are begun from the world prop, or from *Begin here* inside the post house. A
  campaign change disposes the sheets, and `session.alive()` is checked after every await.
- **Answer steps.** They are run with `RB.challenge.runStep(step, {noRecord: true})`, and
  learning is recorded through `RB.practice.objectives(session).assess(objective, item,
  result, o)`.
- **One mastery event per objective per campaign.** Each objective is `letter:<id>`,
  `proof:<id>` or `compare:<id>`. A replay or practice copy goes to `RB.practice.tally`
  only. An exposed answer (shown replies) or an assisted result never promotes.
- **What is not a mistake.** A coverage limit, a recognition repair, and a portion that
  agrees with the evidence are never counted as language errors.
- **Cooldown.** `RB.practice.cooldown()` is primed from each record's `recent` list, so the
  cooldown holds across sittings (comparison suggestions, and the next letter or task).
- **No bond, no rewards.** None of these activities calls `RB.company.award` or emits
  `discovery:resolved`.

## Presentation (§20, §22)

- **Furigana on every kanji.** This covers content, UI labels and options. English with
  Japanese inside is written as mixed markup. Text shown through `runStep`'s escaped
  strings is converted to kana (`RB.ui.pb.kana`). The validator walks `C.practiceB`. The
  browser tests check that every visible kanji is inside a `<ruby>`.
- **Layout.**
  - 44 px controls.
  - At 200 % text, nothing is wider than the screen. Long header and footer buttons wrap.
  - A disabled primary button no longer looks ready.
  - Icons are text-sized.
- **Recognition.** It is never biased toward the expected answer. The handwriting step uses
  the game's standard pad and its candidates. The answer space judges only the text the
  recognizer produced.

## Coverage matrix

| Requirement | Where | Evidence |
|---|---|---|
| §17 12 letters × F/E/I/A, real correspondents, unlocked by meeting them | `10_letters.js`, `79_letters.js` | automated (unit): 48 variants, met conditions, states; automated (browser): tray of 12 |
| §17 bounded answer space; all authored valid tones accepted; tones close the same | `79_bcore.js`, `10_letters.js` | automated (unit): every family's writings and orders accepted, other intentions explained; automated (browser): pieces, IME, handwriting |
| §17 reply outside the space is a limit, not a mistake | `65_challenge.js` (`judge`/`limit`), `RB.ui.pb.writeStep` | automated (unit): judge; automated (browser): IME limit, then `seen 1 ok 1` |
| §17 one letter open; nothing expires; practice copy not resent | `79_letters.js`, `90_letters.js` | automated (unit + browser) |
| §17 folder in Words | `90_letters.js` | automated (browser); inspected capture |
| §18 12 tasks × F/E/I/A, evidence on the same sheet, function categories | `20_proof.js`, `91_proof.js` | automated (unit): 48 variants, evidence and repair rules; automated (browser): P01, P06, P10, P12 |
| §18 P12 insufficient evidence → ask | `20_proof.js` P12 | automated (unit): every tier; automated (browser): guess refused, question accepted, notice unchanged |
| §18 after Chapter 2, same furniture | `79_proof.js`, `40_place.js` | automated (unit + browser): only the tray is offered before the journey's end |
| §18 kept page, six-page shared budget, replace/cancel, memento source | `79_bcore.js keepPage`, `91_proof.js` | automated (unit): fallback (6, cancel, replace, update, too big); automated (browser): keep with an HTML-like label kept as plain text; memento listed |
| §19 12 pairs from real lines with hash; never reveal unseen | `30_compare.js`, `79_compare.js` | automated (unit): hashes, statuses, scan; automated (browser): empty page leaks nothing, then C11 unlocked by actually hearing Oto and Shino |
| §19 hash mismatch → historical | `79_compare.js status/markStatus` | automated (unit) |
| §19 F/E/I/A scaffolding, explanation, bookmark, link, no score/bond | `92_compare.js` | automated (unit + browser) |
| §3 one session, disposal on campaign change, no remote launch | all three UIs | automated (browser) |
| §4 one mastery event per objective; assisted/exposed never promote | `RB.ui.pb.assess` | automated (unit + browser) |
| §21 bounded records, migration from older saves | three normalisers | automated (unit) |
| §22 four profiles, 320×640, 390×844, 844×390, 1280×800, 200 % text; keyboard, mouse, touch | e2e tests 4–5 | automated (browser); captures inspected |
| §23.6 tests above | `tests/unit/practice_b.test.mjs`, `tests/e2e/practice_b.mjs` | — |

## Commands and results

These were run in this worktree. The machine was shared with other workers.

- `node tools/build.mjs`: builds `index.html` (241 source files).
- `node tests/run-unit.mjs`: 6470 passed, 0 failed. `practice_b.test.mjs` passes its 83
  checks. An earlier full run failed only the timing check `p95 recognize() time < 60 ms`
  (73 ms on the loaded shared machine). That check is unrelated to this suite and
  timing-sensitive; on the rerun it passed (p95 52 ms).
- `node tests/e2e/practice_b.mjs`: 6 passed, 0 failed (run three times in full).
- `node tools/validate.mjs`: no errors.
- `node tools/validate.mjs --unknown`: no unknown tokens from this suite. The 20 it lists
  are already present on the base branch (atlas decor, battle intent texts).
- `node tools/kanjiread.mjs --check`: `src/lang/75_kanjiread.js is up to date`.

The browser tests write captures to `tests/e2e/out/practice_b/`. `--docs` copies a selection
to `docs/screenshots/practice_b/`, and those were looked at.

## Limitations and findings

- **No human review.** No native-speaker review of the Japanese, and no human
  play-testing or real-device (phone, tablet, IME) testing. The browser is Chromium only.
- **Handwriting in the tests.** It is drawn from the recognizer's own reference strokes
  with the real mouse. When the top candidate differs, the intended one is picked from the
  candidate list, as a person would. This is synthetic input, not human handwriting.
- **IME composition in the tests.** It is simulated with `compositionstart`/`compositionend`
  events.
- **Answer space.** It is authored and bounded. Natural replies outside it get a coverage
  note, and are never marked wrong.
- **Shared finding: the word-help card can cover the pointer.** At 200 % text in a desktop
  window, the hover word-help card (`src/ui/10_ui.js`, `position()`) can be placed over the
  word under the pointer, when it fits neither above nor below the word. A mouse click on a
  button that contains words (pieces, notice portions, answer choices anywhere in the game)
  then lands on the card. The large-text desktop pass of the layout test switches word help
  off for that reason; touch is unaffected. A fix belongs to the owner of `10_ui.js`, for
  example placing the card beside the word, or docking it, when it would cover its anchor.
- **Shared finding: *Begin here* needs a companion.** `RB.activity.safe()` uses
  `RB.company.safeHere()`, which needs a companion walking with you ("apart" otherwise). So
  *Begin here* in Words › Ways to practise is hidden when no companion follows. The post box
  itself does not depend on this: `RB.practiceB.worldSafe()` checks for no scene, the world
  on top, and no foe within 6 tiles.
- **Place-name card.** A place-name card from walking into a map can sit over an activity
  sheet for up to three seconds, because it is shared overlay behaviour.

## Merge notes (shared files touched)

1. `src/ui/65_challenge.js`. Write steps may carry `step.judge(input, opts) → { ok,
   feedback, limit?, head?, html? }`, and `limit` shows a coverage note that is not counted
   as a mistake (`res.limits`). Successful results now carry `res.given` (text and mode, the
   option, or the order). These are additive; existing steps are unchanged.
2. `tools/validate.mjs`. One line: `practiceB: C.practiceB` added to the registry roots.
3. `src/ui/50_menu.js`. One line: menu aliases `letters` and `compare` for the two Words
   pages.
4. `src/lang/75_kanjiread.js`. Generated. Regenerate it after merging with
   `node tools/kanjiread.mjs` (new ruby groups change frequencies); `--check` must pass.
5. `tests/e2e/run.mjs`. One line: `['practice_b.mjs']`.
6. `index.html`. Rebuild after merging (`node tools/build.mjs`).
7. Suite A seam. When suite A's `RB.practiceDesk.keepPage(s, page)` is present, kept
   proofreading pages go through it. The page shape is `{ id: 'proof:<task>:<tier>', kind:
   'proof', mode: 'proof', typeset: { task, lv, lines, title }, label, saved, created,
   updated }`. Otherwise the internal fallback keeps the same six-page budget in
   `s.practice.deskPages`. The keep dialog mentions "the writing desk" only when the desk
   exists.
8. Map `co.post`. The `mailbox` prop at (7, 5) gains `scene: 'pb.postbox'` at load. This is
   done from `src/content/practice_b/40_place.js`; the map file is not edited.
