# Handwriting recognition (RB.recog)

A local, offline recognizer for single characters drawn on the writing pad.
Code: `src/recog/20_recognizer.js`. Data: `src/recog/10_strokedata.js`
(generated, 17 KiB). No network, no server, no machine-learned model.

## Scope

- 164 kana: 46 + 46 basic hiragana/katakana, 25 voiced/semi-voiced hiragana,
  26 voiced/semi-voiced katakana including ヴ, 10 + 10 small kana
  (ぁぃぅぇぉっゃゅょゎ ァィゥェォッャュョヮ), and ー.
- 33 optional kanji, only when the caller enables kanji:
  一二三十人口日月山川木水火土石田力大小上下中名手目雨本入出王門心花.
  All 197 characters exist in KanjiVG; nothing had to be omitted or invented.
  The writing pad enables them with **Read as › Kanji or kana** (see "Kanji
  on the writing pad" below).

## API

```
RB.recog.supported({kanji})              -> [characters]
RB.recog.recognize(strokes, opts)        -> {status, candidates:[{ch,score,dist}], sizeHint, notes, kanjiHint, kanjiLike}
RB.recog.reference(ch)                   -> {box:109, strokes:[[{x,y}]]} | null   (real KanjiVG paths)
RB.recog.sameShape(ch)                   -> ['ロ','口'] | null                     (identical-shape group)
RB.recog.strokeOrderFeedback(strokes, ch)-> {confident, strokeCountOk, issues:[{stroke,kind,en}], mapping?}
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
カ/力, ニ/二. These are confirmed as the closest template pairs in the data.
Both forms are returned with a note such as `identical-shape: へ/ヘ`. A
`'hira'` or `'kata'` pad returns only that script's form. The kana/kanji
twins (ー/一, ロ/口, カ/力, ニ/二) are returned **at one distance, kana form
first**: the tiny template differences between them are not information
about the drawing, and this keeps every kana reading exactly as it is with
kanji off. Which one the player meant is left to the pad (context) and the
answer checker (handwriting counts both as one form).

**Kanji outside the pad's set.** Both checks use the drawing only.
- `kanjiHint` (kanji not enabled): the same match is run on the 33 kanji
  templates alone (chamfer shortlist of 6, structured match, refinement of
  the best 3, skipped when no kanji can come close). If the best kanji is
  within 0.16 and at least 0.04 better than every allowed character (and is
  not the twin of the best kana), it is named: note `kanji-hint: 水`.
- `kanjiLike`: at least 5 strokes, mostly straight (mean chord/length ≥ 0.6;
  random scribbles are about 0.15), and nothing allowed matches well —
  rejected as `no-match`/`too-many-strokes`, or the best match is above 0.2,
  or above 0.27 when the best is a kana with no more than one stroke fewer
  than drawn (a sloppy ボ or ぎ is not a kanji). Note `kanji-like`;
  `sizeHint` is then `null`.
- A kanji is `confident` only at a distance of 0.17 or less (kana: 0.20):
  33 templates cannot cover the lookalikes of all other kanji (朋 vs 門).

**Status.**
- `empty`: no usable points.
- `nonsense`: rejected by a filter or by distance:
  - a dot (less than 6% of the box, or under 4 px);
  - more strokes than any allowed template plus 3;
  - ink more than 1.6× the densest template (blobs);
  - 5 more sharp reversals than any template (zigzags);
  - best distance above 0.38.
- `confident`: best distance at most 0.20 (0.17 for a kanji), and the nearest different shape is
  at least 0.02 (and 12%) further away. The gap must be 0.06 when the
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
kana** (the kana the task uses plus the 33 kanji), Either kana, ひらがな and
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
- **Twins.** For ロ/口, ニ/二, カ/力, ー/一 the pad offers first the one that
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
- **A kanji the pad doesn't know** (`kanjiLike`): "Looks like a kanji the pad
  doesn't know. Write the word in kana." (with kanji off: "…and kanji
  reading is off. Try it, or write the word in kana." plus Read kanji too),
  and the Chart. No candidates are offered, so unrelated kana are never
  presented as readings.
- The "looks small" hint appears only when a small kana is among the
  readings (it used to fire on kanji drawn in a kana pad: 水 → "looks small —
  小?" with ネ ホ か…).
- Kanji on the pad (the reading box, candidates, the answer line, the chart)
  carry furigana: a common reading of the single character
  (`RB.answers.kanjiReading`), since there is no word yet; the feedback
  shows the word with its own reading ("{水|みず} (みず) — written in kanji").
- The chart shows the kana the pad is reading (both scripts for Either kana)
  and, with kanji on, "Kanji the pad can read" (all 33, with furigana).
  Chart picks count as assisted.

## Data provenance

`src/recog/10_strokedata.js` is generated from KanjiVG
(https://kanjivg.tagaini.net, commit 422b553; © Ulrich Apel and the KanjiVG
project, CC BY-SA 3.0). Each SVG path (M/C/S/Q/T/L/H/V/Z, absolute and
relative) is parsed and its beziers are sampled densely. The result is
resampled at 0.5 units, simplified with Ramer–Douglas–Peucker (ε 0.45) and
quantised to integers in the 109 box (max deviation 1.03 units). Points are
packed 3 base64url characters each. Stroke order and direction are
KanjiVG's. The attribution is in the file header and `data/NOTICE.txt`.

```
node tools/kanjivg/fetch.mjs      # downloads pinned SVGs to tools/kanjivg/.cache (gitignored)
node tools/kanjivg/convert.mjs    # writes src/recog/10_strokedata.js
```

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
