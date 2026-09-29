# Handwriting recognition (RB.recog)

A local, offline recognizer for single characters drawn on the writing pad.
Code: `src/recog/20_recognizer.js`. Data: `src/recog/10_strokedata.js`
(generated, 185 KiB). No network, no server, no machine-learned model.

## Scope

- 164 kana: 46 + 46 basic hiragana/katakana, 25 voiced/semi-voiced hiragana,
  26 voiced/semi-voiced katakana including ヴ, 10 + 10 small kana
  (ぁぃぅぇぉっゃゅょゎ ァィゥェォッャュョヮ), and ー.
- **Every kanji the game displays** (1,547 on 2026-09-29), plus the first 33
  the pad could read (only 王 of those is not in the text): 1,548 kanji, only
  when the caller enables kanji. The list is derived from the source by
  `tools/kanjivg/gamekanji.mjs` (see "Coverage" below); every one exists in
  KanjiVG. The writing pad enables them with **Read as › Kanji or kana** (see
  "Kanji on the writing pad"); the chart lists them all (see "The chart").

## Coverage: which kanji, and keeping it complete

`tools/kanjivg/gamekanji.mjs` scans every source file the build puts into
index.html (content, interface strings, the lexicon under `src/lang`, the
Atlas, the page template). A small JavaScript scanner keeps only the text of
string and template literals: kanji in comments, in object keys or other code
(a table such as `{ 水: 'water' }`), and in regular-expression ranges are not
text the game shows. Generated files (`src/recog/1*_*.js`,
`src/lang/75_kanjiread.js`) are skipped. The first 33 kanji are kept on top
(`tools/kanjivg/chars.mjs` `allChars()`), so nothing readable before is lost.

When new text brings a new kanji, `tests/unit/recog-coverage.test.mjs` fails
and names it with the files that use it. Regenerate with:

```
node tools/kanjivg/fetch.mjs      # downloads the missing KanjiVG SVGs (pinned commit) to tools/kanjivg/.cache
node tools/kanjivg/convert.mjs    # rewrites src/recog/10_strokedata.js
node tools/kanjiread.mjs          # rewrites src/lang/75_kanjiread.js (readings; the test checks it is current)
```

## API

```
RB.recog.supported({kanji})              -> [characters]
RB.recog.knows(ch, {kanji})              -> boolean                              (without decoding the kanji data)
RB.recog.recognize(strokes, opts)        -> {status, candidates:[{ch,score,dist}], sizeHint, notes, kanjiHint, kanjiLike}
RB.recog.reference(ch)                   -> {box:109, strokes:[[{x,y}]]} | null   (real KanjiVG paths)
RB.recog.strokeCount(ch)                 -> number (KanjiVG) | 0
RB.recog.radical(ch)                     -> KanjiVG's radical of a kanji (氵 as 水) | null
RB.recog.sameShape(ch)                   -> ['ロ','口'] | null                     (identical-shape group)
RB.recog.strokeOrderFeedback(strokes, ch)-> {confident, strokeCountOk, issues:[{stroke,kind,en}], mapping?}
RB.recog.warm(done?)                     -> prepares the kanji templates in small idle slices
```

`opts`: `box {w,h}` (writing square, pad coordinates), `script`
(`'any'` = hiragana + katakana, `'hira'`, `'kata'`, `'kanji'` = the kanji set
only), `kanji: true` (also allow kanji with `'any'`, `'hira'` or `'kata'`),
`smallToggle`, and
`mode: 'strict'` (larger reversal/order penalties; the default is lenient).
`sizeHint` is `null` without a box, or when nothing was recognised
(`empty`/`nonsense`, or `kanjiLike`). `ー` belongs to both kana pads. `recognize` has no parameter for the expected
answer, and the unit tests check that answer-like options change nothing.
`score = exp(-dist/0.25)` is a similarity for display ordering. It is not a
calibrated probability.

`kanjiHint` (`{ch, dist}` or `null`) and `kanjiLike` (boolean) describe a
drawing outside the allowed set; neither adds a candidate (see below).

## Method

1. **Normalisation.** Input points (pad pixels, y down) are translated to the
   bounding-box centre and divided by the longest side. The aspect ratio is kept.
   There is no rotation or reflection normalisation, so a mirrored し or a
   rotated い is not read as itself (tested).
2. **Pre-filter.** A symmetric chamfer distance between ~40-point clouds with
   orientation taken mod 180°. It ignores order and direction and keeps the
   best 40 templates.
3. **Structured match.** Each stroke is resampled to 16 points. The cost of
   pairing a stroke with a template stroke is the mean point distance plus
   0.3 × the mean direction mismatch. A reversed stroke is allowed at a cost
   (0.12 lenient, 0.35 strict). The handakuten circle is compared start- and
   direction-free, with a penalty if the drawn stroke is not closed. Strokes are
   paired by an optimal (Hungarian) assignment. Unpaired strokes cost
   0.35 + 0.12 × length, which is how a missing or extra ゛/゜ separates か/が
   and ば/ぱ. A small penalty is added for stroke-order inversions.
4. **Joins and splits.** When the input has fewer strokes, joined consecutive
   template strokes are tried: 0.045 in general, about zero for curated
   variants. When it has more, consecutive input strokes with a small gap are
   tried as one pen-lifted stroke. Base strokes are never joined to their ゛/゜.
5. **Refinement.** For the 8 best candidates, a bounded least-squares per-axis
   scale (0.8–1.25) and shift (±0.1) is fitted from the paired strokes, then
   the character is re-matched. This allows for individual proportions without
   rotation or reflection.
6. Final distance = structured distance + 0.45 × chamfer distance.

### At scale: 1,548 kanji (2026-09-29)

With every kanji of the game the templates crowd each other and a naive
pass over all of them would take far too long, so kanji go through two more
steps. **Kana are matched exactly as before**: with kanji off, every result
(status, candidates and distances, size hint, notes) is identical to the
recognizer before this change (tested, see "Measured results").

1. **Coarse pre-filter (kanji only).** A directional feature of the drawing:
   the ink length per cell of a 6 × 6 grid over the normalised square, in 4
   orientations taken mod 180° (so stroke order and direction do not matter),
   spread bilinearly over cells and orientations, from a walk along each
   stroke in 0.05 steps (a drawn line's jitter must not spread its ink over
   every orientation), normalised and square-rooted; L1 distance, plus 1.2 ×
   a soft stroke-count term (missing strokes count 1, extra strokes 0.5, over
   the larger count). All 1,548 kanji are ranked per call; the best 100 go on.
2. **Chamfer + coarse shortlist.** The chamfer distance of step 2 above is
   computed for those 100; the 20 best by chamfer + 0.05 × coarse distance
   get the structured match (among many similar kanji the coarse feature ranks
   the right one better than the chamfer alone). Kana keep their own 40
   chamfer shortlist.
3. **Joins for kanji** are searched greedily (a kanji has no curated
   variants): the best single join of two consecutive strokes, then the best
   further join (or a third stroke onto a joined pair) on top of it, up to 4,
   each at the generic join cost, and only next to a template stroke the
   current assignment leaves unpaired. A pen lift inside a stroke is tried as
   for kana.
4. **Speed.** Stroke-pair costs are memoised per call (the join alternatives
   reuse them; the values are exactly those of the formula, so results do not
   change), and the Hungarian solver reuses its buffers. The kanji templates
   are decoded on first use (about 130 ms in node here) and their structured
   forms built only when a kanji first reaches the chamfer stage; a pad that
   reads kanji calls `RB.recog.warm()` when it opens, which prepares them in
   small idle slices before the first stroke.
5. **Confidence for kanji** needs a wider margin: the best must be a kanji at
   0.17 or less, and the nearest different shape at least 0.04 (and 25 %)
   further away (kana: 0.02 / 12 %, unchanged). Tuned on the `dev-strong`
   synthetic family and on half of the Tomoe kanji the game does not use
   (`tests/fixtures/recog/tomoe-unknown.json`, odd entries); the other half and
   the held-out families are only reported.

The constants of this section (grid 6, keep 100, stroke weight 1.2, shortlist
20, blend 0.05, the kanji margins) were chosen on `dev-strong` (a tuning
family as strong as `heldout-mixed` with its own seeds, `tools/kanjivg/synth.mjs`)
and the odd Tomoe half; the held-out families and the Tomoe kanji the game uses
were not used for tuning.

**Curated variants** (low-cost; voiced forms inherit them): き 3+4 joined,
さ 2+3, ふ 1+2 and 2+3, り 1+2, こ 1+2, い 1+2, た 3+4, に 2+3, け 1+2, ち 1+2;
そ as 2 strokes (KanjiVG's single stroke split at its first corner); both ゛
ticks in one movement. No curated variant was added for や, because no common
alternative stroke structure could be verified; the generic join tolerance
applies.

**Small kana** match through their large form's shape. The result returns
both forms. The order comes from `smallToggle` if it is on; otherwise from
`sizeHint`, which is computed from box-relative size and vertical position
compared with the recognised character's standard KanjiVG proportions
(KanjiVG small kana are ~0.8× the size and ~0.1 box lower). With no box and
no toggle, the large form comes first.

**Identical shapes**: へ/ヘ, べ/ベ, ぺ/ペ, and with kanji enabled ー/一, ロ/口,
カ/力, ニ/二, エ/工, チ/千, タ/夕, オ/才. The kana/kanji pairs are exactly the
pairs whose clean KanjiVG templates read each other within 0.09 (ー/一 0.02,
ニ/二 0.03, エ/工 0.03, ロ/口 0.04, チ/千 0.06, カ/力 0.07, タ/夕 0.08, オ/才
0.09); the next closest, ナ/十 and ハ/八 (0.11–0.12), stay two shapes, and
`tests/unit/recog-coverage.test.mjs` re-measures this.
Both forms are returned with a note such as `identical-shape: へ/ヘ`. A
`'hira'` or `'kata'` pad returns only that script's form. The kana/kanji
twins are returned **at one distance, kana form first** (and before a small
form: オ 才 ォ); the size hint is judged against the kana form: the tiny
template differences between them are not information about the drawing,
and this keeps every kana reading exactly as it is with kanji off. Which one
the player meant is left to the pad (context) and the answer checker
(handwriting counts both as one form).

**Kanji outside the pad's set.** Both checks use the drawing only.
- `kanjiHint` (kanji not enabled): the same match is run on the kanji
  templates alone (the coarse pre-filter's best 30, a chamfer shortlist of 6,
  structured match, refinement of the best 3, skipped when no kanji can come
  close). If the best kanji is
  within 0.16 and at least 0.04 better than every allowed character (and is
  not the twin of the best kana), it is named: note `kanji-hint: 水`.
- `kanjiLike`: at least 5 strokes, mostly straight (mean chord/length ≥ 0.6;
  random scribbles are about 0.15), and nothing allowed matches well —
  rejected as `no-match`/`too-many-strokes`, or the best match is above 0.2,
  or above 0.27 when the best is a kana with no more than one stroke fewer
  than drawn (a sloppy ボ or ぎ is not a kanji). Note `kanji-like`;
  `sizeHint` is then `null`.
- A kanji is `confident` only at a distance of 0.17 or less (kana: 0.20) and
  with the wider kanji margin: a kanji outside the game's set can come close to
  one inside it (較 and 軟 share 車).

**Status.**
- `empty`: no usable points.
- `nonsense`: rejected by a filter or by distance:
  - a dot (less than 6% of the box, or under 4 px);
  - more strokes than any allowed template plus 3;
  - ink more than 1.6× the densest template (blobs);
  - 5 more sharp reversals than any template (zigzags);
  - best distance above 0.38.
- `confident`: best distance at most 0.20 (0.17 for a kanji), and the nearest different shape is
  at least 0.02 (and 12%) further away (a kanji: 0.04 and 25%). The gap must be 0.06 when the
  runner-up is the other script's lookalike (り/リ, も/モ).
- `uncertain`: everything else. The notes give the reason (`close-alternative`,
  `weak-match`), plus `reversed-strokes`, `variant: join3`, `size-variant`.

**Stroke-order feedback** (practice mode) compares the input with the real
reference strokes of the requested character. With equal counts it reports:
- `order` issues where the optimal assignment differs from the reference order;
- `direction` issues where a long stroke fits clearly better reversed.

It does this only when every paired stroke resembles its reference stroke and
the optimal assignment beats every alternative by a margin. A count mismatch
of one is explained (`count` issue) only when a single join or split accounts
for it unambiguously. Otherwise the result is `confident:false` with no issues.

## Kanji on the writing pad

**Read as** (`src/ui/60_pad.js`, under More on phones) offers **Kanji or
kana** (the kana the task uses plus every kanji in the game), Either kana, ひらがな and
カタカナ. It is a real `<select>` (keyboard and touch; at 320 px and 200 %
text it drops under its label).

- **Where it starts.** A kana-practice step (a `k:` item: kana lessons, kana
  drills, the Foundations single-kana blanks) reads kana only, in its script.
  Every other step starts from the player's preference, Settings › Learning ›
  **Handwriting reads**: *By Japanese level* (the default, and what older
  settings records without the field get: Foundations kana only, Elementary
  and above kanji or kana), *Kanji or kana*, or *Kana only*. Choosing Kanji
  or kana / Either kana on a pad, or "Read kanji too", updates the
  preference. Why by level: Foundations players are learning kana, so kanji
  candidates would only add lookalikes to rule out; from Elementary the
  tasks quote words in kanji and the playtest showed players writing them.
  **Nothing about the start depends on the task's answer**, and the
  recognizer still never receives it.
- **Twins.** For ロ/口, ニ/二, カ/力, ー/一, エ/工, チ/千, タ/夕, オ/才 the pad offers first the one that
  fits the character written just before it: after a kanji the kanji, after
  katakana the kana, after hiragana the kanji (ー stays ー: it lengthens a
  vowel), at the start the kana (一: no word starts with ー). The other one is
  shown beside it, marked kanji/katakana; choosing it is not "assisted".
  The answer checker also counts handwritten twins as one form
  (`RB.answers.check(…, {handwritten:true})`, docs/LANGUAGE.md).
- **Kanji with kanji reading off** (`kanjiHint`): "Looks like the kanji 水,
  but kanji reading is off." with **Read kanji too** (one tap re-reads the
  drawing) and, if a kana was meant, the kana readings. Confirm waits for a
  choice.
- **A kanji-like drawing nothing matches well** (`kanjiLike`). With kanji
  reading off: "Looks like a kanji, and kanji reading is off. Try it, or
  write the word in kana." plus Read kanji too and the Chart; no candidates,
  so unrelated kana are never presented as readings. With kanji reading on,
  every kanji of the game is known, so the pad cannot honestly say "a kanji
  I don't know": it says "Not sure — pick the kanji you meant, if it is here,
  or look it up in the chart", offers the closest kanji, and Confirm waits
  for a choice. (Only when no kanji is among the readings does it still say
  "Looks like a kanji the pad doesn't know. Write the word in kana.")
- The "looks small" hint appears only when a small kana is among the
  readings (it used to fire on kanji drawn in a kana pad: 水 → "looks small —
  小?" with ネ ホ か…).
- Kanji on the pad (the reading box, candidates, the answer line, the chart)
  carry furigana: a common reading of the single character
  (`RB.answers.kanjiReading`: the first 33's table, then the kanji's own word
  in the lexicon, then the reading the game's words use most, from
  `src/lang/75_kanjiread.js`), since there is no word yet; the feedback shows
  the word with its own reading ("{水|みず} (みず) — written in kanji"). 々,
  the repeat mark, has no reading of its own (in the player's text it takes
  the reading of the kanji before it).
- The **Chart** button opens the chart below. When the pad reads kanji, the
  kanji templates are prepared in idle slices as it opens (`RB.recog.warm`).

## The chart

`RB.kanjiChart` (`src/ui/62_kanjichart.js`; data `RB.kanjiInfo`,
`src/lang/80_kanjiinfo.js`). It opens from the pad's **Chart** (every pad,
in battles too) and from **Words › Kanji chart** (no task: browse and
practise any time, at every level).

- **Pages** to cycle with ‹ › or the page list (a real `<select>`, grouped):
  the kana the pad reads (Hiragana / Katakana), then **Kanji by theme** —
  Water and liquids, Nature and weather, Animals and plants, People and the
  body, Places and buildings, Time and numbers, Feelings and the mind, Speech
  and writing, Movement and actions, Things and tools, Society and work,
  Colours and qualities, Other — then **Kanji by use** — Nouns, Verbs,
  Describing words, Counters and numbers, Names. Pages over 120 kanji are
  split ("Nouns · 2 of 11"). A pad that reads kanji opens on the first kanji
  page, a kana pad on its kana; the chart reopens where it was left.
- **Order and spoilers.** On every kanji page the kanji the player has met
  come first (by the level of their most basic word, then stroke count), then
  the rest, **dimmed** (dashed, muted, "not met yet" for screen readers).
  "Met" means: in a scene the player has seen (`s.seen`), in an inscription
  they can weave, or in a word they have practised or noted
  (`RB.kanjiInfo.met`). An unmet kanji's entry and search result never show
  names or invented terms; if those are its only words, the entry says "Used
  in a name you haven't met yet". Every kanji is listed (so 守 is there at
  every level) and every one carries furigana.
- **By use** comes from the lexicon's parts of speech of the words written
  with the kanji: nouns (n, pn, vs, suf, pref), verbs (v1, v5…, vk, vs-i),
  describing words (adj-i, adj-na, adv), counters and numbers (ctr, the
  lookup's counters and numerals), names (name). A kanji is on every page its
  words give it.
- **By theme** is one page per kanji, from its words' meanings: English
  keywords (listed in `80_kanjiinfo.js`, ambiguous words such as light, well,
  spring, pass left out) are matched in the first sense of its own word's
  meaning (weight 3; the lexicon has the kanji alone as a word, e.g. 水
  "water") and of its four most basic words (1 each; the most basic counts 2
  when there is no word of its own), with 1.5× for the head word ("walking
  stick" is a stick, "to protect" is protect). KanjiVG's radical adds 1 to a
  theme the words already point to (氵 → water), never on its own. A theme
  needs a score of 2 and a clear lead (a tie is settled by the head of the
  most basic word); anything else goes to **Other** (77 of 1,548, 5 %) rather
  than a guess. Numerals are Time and numbers. The unit test
  `tests/unit/kanji_chart.test.mjs` checks 40 clear cases (水 海 川 酒 → water,
  雨 山 雪 火 → nature, 手 口 目 母 → body, 心 怒 夢 → mind, 守 → movement and
  actions, 王 → other…) and the size of Other.
- **Search** (required in battle, there everywhere): by kanji (守), by a word
  written with it (守る), by kana reading in hiragana or katakana (まもる,
  マモル, まも), by rōmaji in Hepburn or wāpuro spelling (mamoru, mamo; long
  vowels folded: kyou = kyo) and by English meaning (protect, to protect, sea:
  a whole gloss of a kanji's own word ranks first). Results as you type (about
  2–7 ms per search here), up to 60, each with its readings and a word. The
  field is a real `type=search` input: typing never reaches the game's keys;
  ↓ or Enter moves to the first result; **Escape clears the search, then
  closes the chart**; outside the field, Back/Escape steps back from practice
  to the entry to the list, clears a search, then closes.
- **An entry**: the kanji large with furigana, its stroke count, the readings
  the game uses (kana, with rōmaji), the meaning (its own word's), or its
  words with furigana and meanings (at most four), its theme and uses, and
  the numbered stroke-order demonstration (`RB.lessons.demo`: animated, static
  with reduced motion). **Practise writing it** opens a practice square;
  **Use in my answer** (in a task, when the pad reads kanji) puts it in the
  answer, marked assisted. A kana pad says kanji go into the answer only with
  Read as › Kanji or kana, and a kana is still picked in one tap.
- **Practice**: a square like the pad's (Undo, Clear, Show the model with
  numbered strokes, Check). Check reads the drawing with the pad's
  recognizer (every kana and kanji; nothing about the character practised),
  then says whether the reading is that character ("Read as 守 — that's it",
  "Read first as 字; 守 was reading 2", "Read as 字, not 守"), gives the
  stroke count if it differs, and the stroke-order notes of
  `strokeOrderFeedback` for that character when they are certain ("Stroke
  order and direction match the model" otherwise).
- **In a task** (battles included), picking a character counts as assisted,
  and opening a kanji's entry or practising it counts as help for that
  question (like How to write); browsing pages and searching do not. The
  chart says so in one line.
- Layout: the sheet takes the phone's width; at 320 px and 200 % text the
  search, the pager and the grid stack with no horizontal scrolling, and
  every control is at least 44 px (browser-tested).

## Data provenance

`src/recog/10_strokedata.js` is generated from KanjiVG
(https://kanjivg.tagaini.net, commit 422b553; © Ulrich Apel and the KanjiVG
project, CC BY-SA 3.0). Each SVG path (M/C/S/Q/T/L/H/V/Z, absolute and
relative) is parsed and its beziers are sampled densely. The result is
resampled at 0.5 units, simplified with Ramer–Douglas–Peucker and quantised to
integers in the 109 box. Stroke order and direction are KanjiVG's. The
attribution is in the file header and `data/NOTICE.txt`.

- **Kana** (unchanged, so kana results stay identical): ε 0.45 (max deviation
  1.03 units), 3 base64url characters per point.
- **Kanji** (1,548): ε 0.8 (max deviation 1.33 units, about 1 % of the box,
  far below what the 16-point resampling of the matcher sees), stored as the
  first point (3 characters) and then steps of 2 characters (dx+32, dy+32; a
  step longer than 31 is split into equal steps on the same segment), one
  line per kanji. `rad` keeps KanjiVG's radical per kanji (the element marked
  `kvg:radical` general, else tradit, else nelson; its `kvg:original` form,
  so 氵 is 水), used only by the chart's themes.

Size: 17 KiB before (164 kana + 33 kanji), **185 KiB** now (189,299 bytes;
the kanji part is about 168 KiB). With the readings table (17.6 KiB), the
chart and its data code, index.html grew from 4,837.4 KiB (4,953,466 bytes) to
5,109.x KiB, about +272 KiB (see "Measured results").

```
node tools/kanjivg/fetch.mjs      # downloads pinned SVGs to tools/kanjivg/.cache (gitignored)
node tools/kanjivg/convert.mjs    # writes src/recog/10_strokedata.js
node tools/kanjiread.mjs          # writes src/lang/75_kanjiread.js from the game's furigana and lexicon
```

**Readings** (`src/lang/75_kanjiread.js`, generated by `tools/kanjiread.mjs`,
nothing from outside the repository): every ruby group `{漢字|かんじ}` in the
game's text and every lexicon word split at its okurigana. A one-kanji group
gives that kanji's reading. A group of several kanji is split only when
exactly one division of its reading fits readings already known (with
rendaku and っ for a final つ/ち/く/き), one kanji whose reading is still
unknown taking the rest; then, for kanji that occur only in such compounds, a
split shaped like on-readings (each kanji one mora, or one mora and
い/う/ん/き/く/ち/つ/っ) when exactly one exists. Whole-word readings
(jukujikun such as 今日, 大人, 部屋, 風呂) are never split. A hand-checked list
covers the 33 kanji this cannot reach (伯 刀 王 為…) and one correction (祖 そ,
not the voiced ぞ of 先祖). Each distinct word counts once; readings are
listed most used first, at most four. 1,547 of 1,548 kanji have one; 々 has
none of its own.

## Measured results

Commands (node v22, 2026-09-26; re-run 2026-09-28 after the kana + kanji pad
change, which left every kana figure below unchanged):

```
node tests/run-unit.mjs recog                 # 396 assertions, ~16 s (915 with recog-kanji, ~65 s)
node tools/kanjivg/eval.mjs --n 10 --kanji    # full report below (~85 s; several minutes with the kana+kanji section)
```

**Held-out synthetic data.** Each sample is a KanjiVG reference distorted
with seeds and transform families never used in template construction or
tuning (`tools/kanjivg/synth.mjs`). The constants were tuned only on the
separate `dev` family, which scores 100% top-1 at n=10.

The generator follows three realism rules, added after reviewing failures:
- joins never connect a base character to its ゛/゜;
- a reversed stroke is never also joined;
- reversal is skipped for ソンシツゾジヅッ, because a reversed ソ stroke *is* ン;
  direction is tested separately. "pad" means the
player's script pad; "any" is the mixed hiragana+katakana pad, where へ/ヘ-type
pairs count as correct. Top-1 treats つ/っ as one shape; "exact" also requires
the size decision to be right, without the toggle.

| family (10 samples/char) | kana top-1 pad | top-1 any | exact-size pad | top-3 |
|---|---|---|---|---|
| affine (±12° rotation, shear ±0.18, anisotropic ±20%) | 100.0% | 99.8% | 98.1% | 100% |
| noise (stroke jitter, wobble, point noise) | 100.0% | 100.0% | 99.7% | 100% |
| truncation/extension of stroke ends | 99.9% | 99.7% | 97.9% | 100% |
| consecutive strokes joined | 100.0% | 100.0% | 99.7% | 100% |
| stroke order permuted | 100.0% | 100.0% | 99.8% | 100% |
| one stroke reversed | 100.0% | 100.0% | 99.4% | 100% |
| mixed (all of the above, stronger) | 98.8% | 98.3% | 96.4% | 99.9% |
| **all held-out, hiragana (n=5670)** | **99.9%** | 99.8% | 98.7% | 100% |
| **all held-out, katakana (n=5810)** | **99.7%** | 99.6% | 98.7% | 100% |
| kanji, `script:'kanji'` (n=2310) | 100.0% | 99.9% (kana+kanji pad) | 100% | 100% |

Across all held-out kana, 98.3% of samples were `confident` in pad mode, and
100.0% of those were correct (99.9% in the any pad). 2 of 11,480 (ろ, ヘ in
the mixed family) were falsely rejected. The worst confusions were ヮ→ク ×2,
then single cases of ひ→い, れ→ゎ, し→く, ち→ろ, よ→ぇ, ク→リ, ケ→ク, ス→ィ,
ソ→リ, テ→ラ, ナ→イ, ム→レ, モ→チ, ヲ→ラ, グ→ブ, ゲ→グ and ヮ→リ.

Confusable sets, tested with direction-preserving families (888 samples, `script:'any'`):
- 99.7% top-1 overall;
- errors: ソ→リ ×2, コ→ユ;
- every set is at least 90%.

Sets covered: シツ ソン ぬめ ねれわ さち るろ はほ いり こに クケタ ウワフ
ヌス コユ かが はばぱ ソリ シミ アマ チテ ラヲ きさ あお けは ぬね すむ ちら
ほま ルレ ヘハ エユ ナメ セヒ.

- **Small vs large from box size alone**: 80/80. The same shape was drawn at
  1.1× centred and at 0.6× in the lower-left, for 10 pairs.
- **Direction**: for an in-between ソ/ン geometry, drawing the long stroke
  downward gives ソ and upward gives ン.

**Independent sources.** These were drawn by other people for other
projects and are unmodified apart from densification. Numeric constants were
tuned on `dev`, but these sets are **not fully blind**. Several structural
changes were made after inspecting their errors:
- start-free comparison of the ゜ circle;
- a higher unmatched-stroke cost, which had let び beat a poorly drawn ひ;
- the wider cross-script margin.

| source | pad top-1 | any top-1 | top-3 | notes |
|---|---|---|---|---|
| AnimCJK kana medians (164 chars, LGPL) | 98.8% | 98.2% | 99.4% | errors: む→お (AnimCJK's む puts the dot top-right like お), で→づ; exact-size 94.5% |
| Tomoe handwriting-ja.xml kana (54, LGPL) | 96.3% | 90.7% | 100% | errors: そ→ろ (1-stroke そ), み→け; any-mode adds り→リ, も→モ, や→ヤ (all `uncertain`) |
| Tomoe kanji (47 entries) | 100% | – | 100% | `script:'kanji'` |

**Nonsense** (100 each, `script:'any'`):
- dots, filled blobs, big zigzags: 100% rejected;
- random wandering scribbles: 93% rejected, 7% `uncertain`, never `confident`;
- random straight-segment tangles: 99% rejected, 1% `uncertain`.

Empty input returns `empty`.

**Speed** (before the kanji hint): 2.8 ms median and 4.6 ms p95 per call over
28.5k calls in node. The worst case seen was ~9 ms (8-stroke kanji with
kana+kanji allowed). In headless Chromium, the median is 2.7 ms. With the
kanji hint (the kanji templates are also matched when kanji are off and a
kanji could still come close) a kana-pad call costs about 1.2–1.3× as much:
on the same 2,296 held-out kana samples (pad + any pair, two runs on a shared
machine) the median went from 7.3–7.8 to 9.3–9.5 ms in node, and every kana
result (status, candidates, size hint) was identical to before. The full
report run on 2026-09-28 (61.6k calls, with another evaluation running at the
same time) measured 5.2 ms median, 10.5 ms p95 per call.

### The kana + kanji pad ("Kanji or kana"), 2026-09-28

Commands: `node tests/run-unit.mjs recog-kanji` (unit tests, fixed seeds) and
`node tools/kanjivg/eval.mjs --n 10 --kanji` (the section "kana + kanji pad").
Before/after compares the recognizer at commit fd61367 with this one on the
same held-out samples (all 7 held-out families, 10 samples per character).
"Top-1" is strict (the character or its small/large partner); for kanji a
kana/kanji twin read as its twin counts, and "exact" does not.

| held-out, all families | before | after |
|---|---|---|
| kana, kana pad (`'any'`), top-1 (n=11,480) | 98.28% | 98.28% (unchanged: every kana result is identical) |
| kana, kana+kanji pad, top-1 | 97.63% | **98.26%** |
| kana, kana+kanji pad, a kanji read first | 75 (72 of them ロ→口-type twins) | 3 (ナ→十 ×1, ん→人 as one stroke ×2; all `uncertain`) |
| kana, kana+kanji pad, `confident` (precision) | 97.73% (99.95%) | 97.73% (99.95%) |
| kanji, kana+kanji pad, top-1 (n=2,310) | 99.87% | 99.87% |
| kanji, kana+kanji pad, exact | 97.58% | 87.75% (一二口力 now come second, after their kana twin; the pad reorders by context) |
| kanji, kana+kanji pad, `confident` (precision) | 98.01% (100%) | 97.01% (100%) (kanji need ≤ 0.17) |
| kanji drawn with kanji off: named by the hint (n=2,030, twins excluded) | – | 96.8%, never a different kanji |
| kanji drawn with kanji off: a kana read `confident` | 13.45% | 13.45% (the pad shows the hint instead where there is one) |
| unknown kanji (composed, n=1,610): read `confident` as a supported kanji, kana+kanji pad | 2.17% | **0.00%** |
| unknown kanji: flagged kanji-like, kana pad / kana+kanji pad | – | 98.9% / 96.8% |
| unknown kanji, kana pad: offered kana candidates as if readable | 77.1% | 1.1% |

From the full report (`eval.mjs --n 10 --kanji`, same date):
- kana in the three pads: kanji-like 0× in 11,480; kanji hint 1× (a ナ whose
  second stroke came out straight, read as 十; the kana stays offered);
- kana/kanji confusable sets (29 sets, direction-preserving families, n=2,220,
  shape-identical pairs count): **99.7%**; errors ナ→十 ×2, ソ→リ ×4. Sets:
  口ロ 二ニ 力カ 一ー 入人 十ナメ エハタ 三ミ 川ルリり 小ハ 土エ上 王エキ 手キチ
  木ホ本 大ナ 下トテ 日目ヨ 田ロ 中ロ 心ルい 水ホ 火ソメ 人入ヘ 花イヒ 名タ 山出
  二こに ソリ川 ノ人. 工, 八 and 夕 are not supported: エ, ハ and タ are read as
  themselves and no unsupported kanji is ever returned;
- independent sources: AnimCJK kana in the kana+kanji pad 98.2% top-1 (same
  as the kana pad); Tomoe kana 90.7% (same); Tomoe kanji in the kana+kanji pad
  100% top-1 (91.5% exact), and with kanji off the hint names 41 of 43;
- nonsense: unchanged (never kanji-like, hinted or `confident` in the unit
  tests' 300 samples in two pads).

**Unknown kanji** are the 23 kanji in `tools/kanjivg/synth.mjs`
`UNKNOWN_KANJI` (林 明 朋 炎 昌 圭 岩 男 呂 品 森 晶 畑 杏 呆 古 早 杜 相 叶 回 旦 吉),
each built from the real KanjiVG strokes of supported kanji placed as
components, then distorted like the other held-out samples. No stroke data
outside the repository was used. The 4-stroke ones (古, 叶, 旦) are the ones
not flagged: with so few strokes they are read as uncertain kana or kanji.

## Limitations (honest)

- **No real human handwriting has been tested.** All accuracy figures come
  from synthetic distortions of KanjiVG, font-like stroke medians (AnimCJK)
  and coarse hand-entered templates (Tomoe). They do not establish accuracy on
  learners' real handwriting, which is likely to be lower, especially for
  sloppy or cursive writing.
- The nonsense threshold is a trade-off. Real-character distances in the
  worst synthetic tail (up to ~0.41) overlap the best scribbles (~0.34). Some
  scribbles come out `uncertain` rather than rejected, and a very distorted
  real character can be rejected (0.0–0.1% in the held-out sets).
- Small vs large depends on writing position when no toggle is used. A large
  kana written small and low in the box will be offered as the small form
  first; both forms are always returned.
- In the mixed `'any'` pad, hiragana/katakana lookalikes (り/リ, も/モ, や/ヤ,
  へ/ヘ) are harder. Use the script pad when the script is known.
- Stroke-order feedback reports only the issue kinds described above, and
  only when the mapping is unambiguous. It does not judge stroke endings
  (とめ/はね/はらい) or calligraphic quality.
- Test fixtures are in `tests/fixtures/recog/` (LGPL, test-only); see `SOURCES.txt`.
- **Only 33 kanji.** Any other kanji can only be written in kana (or typed).
  The kanji-like message is a heuristic (stroke count, straightness, a weak
  match); it was measured on synthetic composites of supported kanji, not on
  real unknown kanji, and kanji of four strokes or fewer are rarely flagged.
  A kanji the pad doesn't know can still be read as a supported one it
  resembles (0% `confident` in the composites, but `uncertain` readings such
  as 回 → 田 do occur).
- The pad cannot tell ロ from 口 (or ニ/二, カ/力, ー/一) by shape; it orders
  them by the character written before, and the answer checker accepts either
  for handwriting. A weak ん written in one stroke can come out as 人
  (`uncertain`, ん second): a one-stroke 人 is allowed like other joins.
- Furigana on a single handwritten kanji is a common reading of that
  character (`RB.answers.kanjiReading`), not the reading in the word being
  written (入り口 shows 入 with い only because い is the table's reading);
  the feedback shows the word's reading.
