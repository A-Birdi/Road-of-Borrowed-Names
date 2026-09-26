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

## API

```
RB.recog.supported({kanji})              -> [characters]
RB.recog.recognize(strokes, opts)        -> {status, candidates:[{ch,score,dist}], sizeHint, notes}
RB.recog.reference(ch)                   -> {box:109, strokes:[[{x,y}]]} | null   (real KanjiVG paths)
RB.recog.strokeOrderFeedback(strokes, ch)-> {confident, strokeCountOk, issues:[{stroke,kind,en}], mapping?}
```

`opts`: `box {w,h}` (writing square, pad coordinates), `script`
(`'any'` = hiragana + katakana, `'hira'`, `'kata'`, `'kanji'` = the kanji set
only), `kanji: true` (also allow kanji in `'any'`), `smallToggle`, and
`mode: 'strict'` (larger reversal/order penalties; the default is lenient).
`sizeHint` is `null` without a box, or when nothing was recognised
(`empty`/`nonsense`). `ー` belongs to both kana pads. `recognize` has no parameter for the expected
answer, and the unit tests check that answer-like options change nothing.
`score = exp(-dist/0.25)` is a similarity for display ordering. It is not a
calibrated probability.

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
`'hira'` or `'kata'` pad returns only that script's form.

**Status.**
- `empty`: no usable points.
- `nonsense`: rejected by a filter or by distance:
  - a dot (less than 6% of the box, or under 4 px);
  - more strokes than any allowed template plus 3;
  - ink more than 1.6× the densest template (blobs);
  - 5 more sharp reversals than any template (zigzags);
  - best distance above 0.38.
- `confident`: best distance at most 0.20, and the nearest different shape is
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

Commands (node v22, 2026-09-26):

```
node tests/run-unit.mjs recog                 # 396 assertions, ~16 s
node tools/kanjivg/eval.mjs --n 10 --kanji    # full report below, ~85 s
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

**Speed**: 2.8 ms median and 4.6 ms p95 per call over 28.5k calls in node. The
worst case seen was ~9 ms (8-stroke kanji with kana+kanji allowed). In
headless Chromium, the median is 2.7 ms.

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
