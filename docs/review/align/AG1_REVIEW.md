# AG-1 · The dialogue highlight's grammar: what was changed, how it was checked, what remains

Robin's packet of 2026-10-16 (`RBN_Word_Highlight_Review_AG1`, a reviewer's report, 34 examples, a candidate patch
and a harness) asked to reconcile its candidate with the current aligner and to finish its six open requirements:
keep the two colours, support phrase and group relations, and give grammatical explanations without inventing English
counterparts. Its base revision was this branch's HEAD at the time (`fb85958`), so the candidate applied to the current
source unchanged. This page records the work. Test results, the review of real lines, and what remains uncertain are
kept separate.

## What changed

**Source:** `src/lang/88_speech_align.js` (the aligner), `src/ui/22_speech_mark.js` (hover and the spoken mark),
`src/ui/10_ui.js` (word help), `src/styles/50_play.css`, `src/content/align/00_reviewed.js` (reviewed alignments).

1. **The candidate's six fixes, kept:**
   - a て-form ending is recognised only straight after a verb in its て-form, never across punctuation or after a
     locative で;
   - links stay inside their sentence when the two lines split into sentences the same way (and, beyond the
     candidate, only when the sentences are of comparable size: equal counts alone were not enough);
   - と, が, か and の are read by role: coordination, comitative, quotation and condition for と; subject or "but"
     for が; coordination, question, "some-" or "whether" for か; possession, "of", nominaliser or sentence-final for
     の;
   - the noun 中 keeps its meaning;
   - です after an adjective is politeness, not "is"; じゃ opening a turn is "well then", not the copula;
   - "he's"/"it's" are not possession;
   - a command is not "please".
2. **Relations instead of one word for one word.**
   - An English word has parts: "I'm" is I + be, "won't" will + not, "my" I + possession, "Ren's" Ren + possession
     or "is". A Japanese word or construction claims a part, never one already claimed.
   - So 私 and です share "I'm", and 私 の shares "my", without an unjustified collision.
   - A relation may join several Japanese words; each records its English parts (`claims`).
3. **Constructions before their endings.** Each of these is recognised from the Japanese, so its parts never stand for
   themselves (しか…ない's negative is never "not"):
   - obligation (～なければならない, ～なきゃ, ～ないといけない);
   - no obligation (～なくてもいい);
   - prohibition (～てはいけない);
   - permission (～てもいい);
   - しか…ない ("only", "nothing but");
   - invitations (～ませんか, when the English invites);
   - explanations (～んだ / ～のです: a note, no "is");
   - naming (X と申します / といいます, after a name);
   - a short reviewed list of noun + verb said as one English word (雨が降る "it rains", 気がする "feel");
   - place noun + particle as one preposition (井戸の近くで "by the well").
4. **Each ending on its own:**
   - 食べたくない gives "want" and "not";
   - English do-support goes with the negative ("do not", "don't");
   - "even if" is claimed whole;
   - endings are looked for beside the English of their own word;
   - particles are looked for beside their noun's English, case particles just before it with only that noun
     phrase's words between.
5. **Three outcomes for every word** (`status`): `linked`, `function`, or `unresolved`.
   - `function` means a grammar note with no English word: は topic, を object, が subject, よ, ね, polite endings,
     past, ～ている, ～てしまう, quotation, nominaliser and others, each with a sentence of explanation.
   - `unresolved` means the role was not worked out, and is said as such.
   - No blank is filled with an arbitrary English word.
6. **Hover and the spoken mark from the same relations** (`22_speech_mark.js`):
   - Pointing at either side marks every relation the word belongs to, with all its words: amber for meaning, blue and
     dotted for grammar.
   - The reverse direction now holds several Japanese words per English word.
   - While a voice speaks, the spoken word's relations are marked: `.spk` for its meaning, and the new `.spk2` (blue,
     dotted) for its grammar.
   - Pointing still waits while a voice speaks (unchanged).
   - The timing estimate is unchanged and is still an estimate, not forced alignment.
7. **Word help** has an "In this line" note for a dialogue word: the construction it is part of (with its other words
   and the English), its grammar note, or "Not worked out".
8. **Reviewed alignments for authored lines** (`src/content/align/`, used before the rules):
   - **Key:** each entry is keyed to the displayed pair: the Japanese words with the player's name as `$name`, the
     dialect, and the English with `$name`. Every word is named by its place and its text. A changed line falls back
     to the rules.
   - **Tool:** `node tools/review/align_registry.mjs --propose <scene> <n>` drafts an entry from the rules;
     `--check` finds stale ones.
   - **Seed:** five reviewed lines, including Ren's self-introduction (Robin's example) and a line with the player's
     name.
   - **Runtime:** the game makes no model or network call; only shipped data is read.

## Tests (executed)

- **U, the packet's own harness**, pointed at this repository's aligner
  (`RBN_Word_Highlight_AG1/tests/run_review.mjs`, its vendored core files checked identical to `src/` by git blob):
  - **26 / 26** safety cases and **8 / 8** open cases;
  - `--require-all` exits 0;
  - the timing comparison is unchanged.
  - Before this work, the same harness gave 15 / 34.
- **U `tests/unit/speech_align_ag1.test.mjs`**, on the whole game's dictionary rather than the packet's core one:
  - the packet's 34 cases;
  - 22 neighbouring controls:
    - positive and negative cases beside each open requirement ("I'd rather not eat" gives no "want"; なければ
      without its ending is a condition; ても alone is "even if"; "Snow is falling" is not the idiom);
    - the explanation construction;
    - naming;
    - the topic note.
  - **56 / 56**; three outcomes for every word; timeline unchanged.
- **U `tests/unit/speech_align.test.mjs` 25 / 0.**
  - The old "no English word for two Japanese words" check was replaced, on the packet's advice, by: no English
    *part* is claimed twice, and a word shared by two relations always has parts, each relation its own.
  - Both hold over all 8,417 spoken lines.
  - The coverage floor (lines with a pair > 90%) is unchanged.
- **U `tests/unit/align_registry.test.mjs` 9 / 0:**
  - every reviewed alignment is used on its line;
  - another player name still matches;
  - a changed line, another dialect, or `authored: false` falls back to the rules.
- **B (headless Chromium) `tests/e2e/speech_relations.mjs`, all pass:**
  - "I'm" marks 私 (amber) and です (blue);
  - ならない marks 行かなければ and "must" (not "go");
  - word help on は says "Topic marker", and on ならない names the obligation with 行かなければ;
  - while 行かない is spoken, "go" is `.spk` and "won't" is `.spk2` (blue, dotted);
  - with Highlight off, nothing is marked.
- **B `ledger_li`, `speech_mark`, `dialect_kansai`:** pass on the AG-1 build (VALIDATION.md "AG-1" has the final run).

## Real lines (reviewed by hand, not tests)

`node tools/review/align_compare.mjs --before <aligner at fb85958>` compares, line by line, what every Japanese word
pairs with before and after, over all 13,931 lines with English.

- **Final totals:**
  - 5,993 lines changed;
  - per word and tier: 72,554 links kept, 4,004 removed, 3,601 added, 2,183 changed.
- **Constructions found:**

  | construction | count |
  | --- | ---: |
  | possessives | 1,657 |
  | coordinations | 298 |
  | place noun + particle | 285 |
  | noun + verb as one word | 95 |
  | しか…ない | 55 |
  | obligations | 27 |
  | invitations | 9 |
  | prohibitions | 7 |
  | naming | 3 |
  | permission | 2 |

Samples were drawn reproducibly (a fixed seed) from the changed lines. Each changed word was marked better, worse, or
neutral/unclear by the developer against the whole line. Several earlier samples were used to find and fix faults; the
two below were drawn as held-out checks:

| sample | when | better | worse | neutral / unclear |
| --- | --- | ---: | ---: | ---: |
| seed 31415, 60 lines ([sheet](HELDOUT_31415.md)) | before the last two fixes (which it found) | 66 | 11 | 24 |
| seed 27182, 50 lines ([sheet](HELDOUT_27182.md)) | the final rules | 55 | 6 | 19 |

**False links removed** (from the samples):
- と → "and" on quotation and ～ようとする;
- が → "but" on a subject;
- question-final か → "or";
- cross-sentence pairs (舞台, 書こう, 来た, 名 …);
- して → "didn't";
- ございます → "are";
- 取り決め → "take";
- particles taking a neighbouring phrase's preposition ("at least", "goes on", "rain-soaked").

**Useful relations recovered:**
- 誰か → "someone";
- 中 → "inside";
- 私の推測 → "my";
- の → "Ren's" / "my" / "mine";
- しても いい → "May";
- しか…知らない → "only";
- 替えず → "without";
- たら / と → "once", "when", "if";
- 入れるか → "whether";
- case particles beside their nouns ("into the Hall", "with one finger", "on the floor");
- head nouns ("powder", "tag", "sandals", not "face", "name", "straw");
- do-support ("Does not move").

## What remains (uncertainty, kept apart from the test results)

- **Not a parser.** The rules use the game's dictionary, deinflection and a few reviewed tables as evidence. Scope,
  long-distance dependencies, relative clauses and English paraphrase are not analysed.
- **Unresolved, by design.** On the final run:

  | pattern | lines |
  | --- | ---: |
  | と between nouns with no "and" found | 315 |
  | の with no role decided | 604 |
  | other と | 350 |
  | じゃ | 120 |
  | ～られる (passive, potential or respectful) | 97 |
  | か | 62 |
  | ねえ | 59 |
  | ん | 41 |
  | が | 38 |
  | しか…ない with no "only" | 34 |

  These show as "Not worked out" in word help, not as a guess.
- **Known weaker spots in the held-out samples:**
  - a negative claiming the object "no" in "can't say no";
  - a copula lost where the English has "it's" far from it;
  - the conditional と rendered "and" in English (now accepted as a candidate, but only by position);
  - one particle (道標に) placed by position where its noun has no English;
  - だろう / でしょう no longer pair with "must": the packet's reviewer judged the deduction/obligation ambiguity worth
    the loss, and one held-out line lost a correct "must".
- **Dictionary issues found, outside AG-1:**
  - おれ is looked up as the imperative of おる in 16 spoken tokens, so word help shows the wrong meaning; a separate
    task was suggested.
  - Some compounds (継ぎ飛脚, 灯守) have senses that make their head word ambiguous.
- **No native-speaker review.** Better/worse marks are the developer's own judgements.
- **Not checked:** another browser (Firefox) or a real device; speech with a real Japanese voice.
- **The reviewed alignments are only five lines.** The mechanism is in place; growing the set is review work, line by
  line.
