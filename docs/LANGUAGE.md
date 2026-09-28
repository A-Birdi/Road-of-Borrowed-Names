# Language systems (src/lang)

Plain scripts on the global `RB`; no DOM access at load; all work in node `vm`
(`load(['core','lang'])`). Tests: `node tests/run-unit.mjs lang`.

| File | Namespace | Purpose |
|---|---|---|
| `10_kana.js` | `RB.kana` | kana tables, script tests, conversions, romaji, mora |
| `20_jp.js` | `RB.jp` | line markup, rendering, validation, deinflection, lookup |
| `30_lexicon.js` | `RB.lex` | lexicon API + core entries |
| `40_grammar.js` | `RB.grammar` | grammar points |
| `50_answers.js` | `RB.answers` | answer checking, feedback, distractors |
| `60_kanalessons.js` | `RB.kanaLessons` | Foundations kana sequence |

## Japanese line markup

All Japanese shown in the game uses this markup.

- Tokens are separated by **single ASCII spaces**. Rendering joins tokens with
  no space; `render(line, {spacing:true})` puts a space between word tokens
  (never before punctuation). Write tokens at word/phrase (文節) boundaries,
  e.g. `{私|わたし}は {港|みなと}へ {行|い}きます。`
- Ruby: `{漢字|かんじ}`. Mix with kana inside a token: `{食|た}べる`,
  `お{茶|ちゃ}`. Word-level ruby for irregular readings: `{今日|きょう}`.
  **Every kanji (incl. 々) must be inside a ruby group** — `RB.jp.validate`.
- Suffixes, in this order: `@lemma` (dictionary form for lookup, e.g.
  `{食|た}べた@食べる`, `はし@箸`), then `=(gloss)` (meaning in this context;
  may contain spaces and parentheses; English only, no bare kanji).
- Punctuation `。、！？「」『』…‥―・（）〜～` (and ASCII `!?,.:;"()~`, full-width
  space, newline) is split off automatically. `ー` is a kana.
- `_` inside a token renders as a literal space. Latin letters/digits are fine.
- Placeholders `$name`, `$comp`, any `$word` (letters/digits, no `_`) are
  filled from `vars` (or `RB.jp.setVars` defaults) and HTML-escaped.

**Mixed text** (help text, grammar explanations, lexicon notes, feedback
messages) is English with optional `{漢字|かんじ}` groups: `renderMixed`,
`plainMixed`, `validateMixed`.

### RB.jp API
```
parse(line[, vars]) -> [{surface, reading, segs:[{t, r|null, ph?}], lemma, gloss, punct, ph, after?}]
plain(line, vars) / reading(line, vars)      // display text / kana for TTS
render(line, {spacing, vars, furigana}) -> {html, tokens}
   // word → <span class="jt" data-i="N" tabindex="0">…</span>, kanji → <ruby>漢<rt>かん</rt></ruby>
validate(line) -> [{code, msg, token}]       // [] = OK
renderMixed / plainMixed / validateMixed(text)
rubyize(w, r) -> markup                       // ('食べる','たべる') → '{食|た}べる'
deinflect(word[, {known}]) -> [{base, rules:[steps, dictionary form outward], type}]
lookup(token | markupString) -> {surface, entry, lemma, forms, reading, romaji, mora,
        gloss, meaning, parts?, others, unknown, name?, punct?}
setVars(defaults)
```
`validate` codes: `kanji_outside_ruby`, `empty_base`, `empty_reading`,
`reading_has_kanji`, `reading_not_kana`, `unbalanced_braces`, `nested_brace`,
`missing_bar`, `extra_bar`, `stray_bar`, `unclosed_gloss`, `empty_gloss`,
`kanji_in_gloss`, `empty_lemma`, `bad_placeholder`, `suffix_without_word`,
`text_after_gloss`, `not_string`.

**Lookup.** Candidates come from: the `@lemma` hint (always wins), exact
surface+reading, surface, reading (kana tokens), then table-driven
deinflection with a part-of-speech check. They are ranked, not tried in strict
order: for a kana-only token, a word spelled exactly as written and reached by
inflection (した → する) outranks a kana spelling of a word normally written in
kanji (した → 下, kept in `others`). A preceding て-form favours auxiliaries
(`買って おきます` → 置く). If the whole token is not one word, it is split
into a head word + trailing particles/copula/grammatical nouns
(`わたしは`, `{先生|せんせい}です`, `{雪|ゆき}だそうです`), then into any known words
(`{行|い}かざるを{得|え}ない`). Unknown tokens still return reading, romaji and
mora (the UI says "no dictionary note for this word"). Ambiguous content should
use `@lemma` and `=(gloss)`.

## Lexicon

Entry: `{w, r, m, pos, lv, n?, alt?, ro?, fic?}` — `w` written form, `r` kana
reading (`= w` for kana words, katakana for katakana words), `m` concise
meaning, `n` note, `alt` meanings in other contexts, `ro` romaji override,
`fic:true` for invented terms (must also say "fictional" in `m` and `n`).
`m`/`n`/`alt` are mixed text. Levels: `F` Foundations (kana-level), `E`, `I`, `A`.
POS: `n pn v1 v5u v5k v5g v5s v5t v5n v5b v5m v5r v5k-s v5aru vs vs-i vk adj-i
adj-ii adj-na adv prt conj int exp ctr suf pref aux name` (`v5aru` = いらっしゃる,
おっしゃる, なさる, くださる).

```
RB.lex.add(entries, sourceTag)   // same w+r+pos merges (new meaning → alt); different pos → conflicts()
RB.lex.get(w, r) / bySurface(w) / byReading(r) / all() / conflicts() / problems() / stats() / markup(entry)
```
Content adds its own words (names with `pos:'name'`) via `RB.lex.add`.

## Answer checking

```
RB.answers.check(input, {accept:[markup…], mode, scriptFree?, vars?, handwritten?})
  -> {ok, matched, form?, notes?, normalized, feedback:[{code, en, jp?, at?, got?, want?}], assisted:false, closest}
RB.answers.distractors(answer, {count=3, kind:'kana'|'word', accept?, scriptFree?, seed?})
RB.answers.kanjiReading(ch) -> kana | null      // a common reading of one kanji (no word context)
RB.answers.rubyText(text)  -> markup            // the player's text, each kanji with that reading
```
- **Kanji spellings** are accepted where the step lists them (`accept:
  ['みず', '水']`; the content convention for every word task, checked by
  `tests/unit/lang_answers_kanji.test.mjs`, including that a step's own
  `explain.jp` spelling of the answer word is listed). On success `form` is
  the accepted spelling that matched and `notes` (mixed text) say how it was
  written: `{水|みず} (みず) — written in kanji.`, `{出|で}ません (でません) —
  written with kanji.` The reading comes from the accepted markup, else from
  a kana answer that lines up with the okurigana.
- **Handwriting** (`handwritten: true`, set by the challenge runner for the
  writing pad only): characters written with one shape — the recognizer's
  identical-shape groups へ/ヘ べ/ベ ぺ/ペ ー/一 ロ/口 カ/力 ニ/二
  (`RB.answers.HAND_SAME`, tested equal to `RB.recog`) — count as one form,
  with a `same_shape` note. Typed answers are never folded.
- **Kanji in a wrong answer**: a kanji whose reading is an accepted kana
  answer gets `needs_kana` where the step accepts only kana (田 for the kana
  blank た) and `other_word` where it accepts another kanji (日 for 火, both
  ひ). Character feedback names a kanji with its reading in ruby, never as
  "romaji".
- Always: NFC, trim, remove spaces, half-width → full-width katakana; sentence
  punctuation is ignored. Meaning mode: full-width ASCII → ASCII, case-insensitive,
  punctuation, articles and a leading "to" dropped.
- Never folded: small/large kana, dakuten/handakuten, long vowels, は/わ, を/お,
  へ/え, hiragana/katakana (unless `scriptFree`).
- Modes: `exact` (plain surface), `kana` (kana reading), `reading` (surface or
  the markup's kana reading; plus the other script if `scriptFree`), `meaning`.
- Feedback codes: `missing_dakuten`, `extra_dakuten`, `handakuten_mixup`,
  `small_large`, `long_vowel`, `script`, `particle_wa`, `particle_o`,
  `particle_e`, `confusable`, `missing_char`, `extra_char`, `swapped`,
  `other_word`, `wrong_char`, `reading_only`, `needs_kana`, `spelling`,
  `empty`, `generic`. Messages (`en`, mixed text) explain the language
  difference and never mention recognition.
- Distractors come from real confusions (diacritics, small/large, long vowels,
  っ, shape pairs, particles, script swap; single kana also get same-row/column
  kana) and never include an accepted answer. Deterministic per answer/seed.

## Kana lessons

`RB.kanaLessons.groups[i] = {id, script, title, jp, kana:[{k, r, note}], chars, notes, words:[{w, m, lemma}]}`;
`knownSet(i)`, `usesOnly(s, i)`, `indexOf(id)`, `get(id)`, `groupOf(ch)`.
Order: あ か さ た な は ま や ら わ/を/ん, dakuten, handakuten, small ゃゅょ, small っ,
long vowels; then the same for katakana, ー, and extended combinations.
Example words use only kana taught so far and each has a lexicon entry (tested).
