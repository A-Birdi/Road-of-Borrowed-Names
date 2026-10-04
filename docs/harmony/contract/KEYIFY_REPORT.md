# Harmony keyify: validation notes (2026-10-04)

The worker's notes for the keyify step: the player kit delivered in look A's real colours and converted to key-family
layers and masks (docs/harmony/contract/CONTRACT.md §5.5). They follow VALIDATION.md's style: what was run, what came
out, and what is **not** verified.

Everything was run in node on a shared Linux machine. No painted art was used; none has been delivered. The kits are
the SYNTHETIC sample (`tests/fixtures/harmony_sample/`, five exact key shades per family) and the SYNTHETIC rich
fixture (`tests/fixtures/harmony_rich/`, 9–11 values per family, hue and chroma jitter, rim and warm lights, with
ground truth). The game's own runtime recolours each one into look A's real colours.

## What was built

| Part | Where |
|---|---|
| CLI | `tools/harmony_keyify.mjs <inDir> <outDir> [--look] [--masks] [--values=range\|reference] [--sample [--sample-mask] [--sample-acc]] [--report] [--force]` |
| Core: reading through the importer, classification, value mapping, residual, collisions, writing, `--sample` | `tools/harmony/keyify.mjs` |
| Validation: round trip with the runtime recolour, import proof, 8-look busts, value floor, sheets; the synthetic delivery | `tools/harmony/keyify_report.mjs` |
| Default look (the brief's look A) | `tools/harmony/lookA.json` |
| Evidence | `node tools/harmony_keyify_proof.mjs` → `docs/screenshots/harmony/keyify/` (files.png, looks.png, report.json, proof.json; regenerates byte for byte) |
| Test | `tests/unit/harmony_keyify.test.mjs` (54 checks) |
| Importer refactor (no change in behaviour) | `tools/harmony/importer.mjs`: `normaliseImage` and `placeMask` split out of `normaliseFile`, so keyify reads files exactly as the importer does. harmony_import 78/78 is unchanged; the e2e harmony_raster run is below |

## Choices and why

* **Value mapping per material across the kit,** not per layer. One painted skin colour must give one key colour in
  the face, the neck and the hand, or the hand would recolour to another tone than the face.
* **`range` is the default,** as the brief for this work asked: each material's painted lightness range maps onto
  s0…s4, shaped by the reference ramp's value scale. `reference` maps each value by its place on the reference ramp
  instead. They agree where the painted range is the reference's: on the sample, |Δt| < 0.03 for skin, hair, cloth main
  and the flower. They differ where it is not: the sample paints its trim and headband without their lightest shade,
  so `range` stretches s0…s3 to s0…s4. The tool reports every stretch and squeeze; use `reference` when the extremes
  are not the material's deepest shadow and highlight.
* **Classification is in absolute OKLab,** against ramps at the pixel's own lightness and against colour lists.
  * near 0.09, margin 0.015.
  * margin 0.02 left the sample's own nose shading (#bb9269), fixed in the key kit, unresolved against light skin at
    0.0165.
  * Pixels between two parts go to their neighbours: at least 3 of 8, and twice the other. The rich fixture put 510
    pixels there. Each is flagged and counted, never silent.
* **Per-pixel "already in key colours" only for pixels that match nothing,** and only when they lie within half of
  `inner` of a key family. A first version also took ambiguous pixels and read the rich fixture's rim-lit auburn brows
  (#b75f4a) as skin keys: real auburn sits at the edge of the orange skin family.
* **Whole-layer pass-through** happens when most unprotected pixels lie within half of `inner` of a key family the
  layer may hold. A layer in key colours, such as the flower in the image tool's examples, is then read exactly as the
  importer reads it. Measured shares:
  * look A's real-colour layers: 0 %, every layer;
  * the sample's key-coloured layers: 77–100 %.

  The importer's own threshold (`inner`) does not separate them: it finds 27 % of a real-colour head in the skin family.
  A first test, "matches no part of the look", missed key-coloured arms, because the green key sleeve matches look A's
  green coat. Pass-through also restores the layer as delivered (keyify had snapped near-ink pixels), so importing the
  whole key-coloured sample after keyify gives every layer and mask byte for byte as importing it directly (50 of 50).
* **Near-whites.** Only pixels within 4 (sRGB) of #ffffff or #f6f2ee are always fixed. A radius of 10 (the importer
  uses 24) kept the rich flower's palest petals fixed in every look: look A's pink at t 4.5 is #faf6f3. Measured before
  the change, that was ΔE up to 0.40 on 4 pixels per look.
* **Residuals.** They are measured from the reference at the colour's own lightness and clamped to the contract's
  painting tolerance (12°, 16 %, 0.25 together). The derived classification of the output then agrees with the
  supplied mask, and a palette-wide offset from the reference does not leak into other looks.
* **`--sample` keeps the base look's value scale.** A style master shows colours, not where each sits among the shade
  steps. Measured during development on the same synthetic delivery, ΔE mean / p95 across the 8 looks:

  | Version | mean | p95 |
  |---|---|---|
  | the master's lightness quantiles as both colours and scale | 0.026 | 0.149 |
  | quantile colours on the base scale | 0.012 | 0.060 |
  | 8 equal lightness bins (they merged skin's s3 and s4) | 0.015 | 0.098 |
  | lightness groups, the final version | 0.0028 | 0.0059 |

  The groups break where lightness jumps by more than 0.01 or a group would span 0.04, each group taking median
  colours.

## Measurements (`node tools/harmony_keyify_proof.mjs`, `proof.json`)

The converted kit was recoloured into 8 looks and compared with the same looks painted from the original key kit:
38,232 bust pixels, peak state, Suzu pairing. The looks were:

* the game look: skin 1, auburn, cloth #4e7a4a / #3c5e38 / #2e6a6e;
* skin 0, white hair, cloth 6;
* skin 6, black hair, cloth 5;
* skin 4, teal hair, cloth 0;
* skin 2, gold hair, cloth 3;
* skin 5, plum hair, cloth 7;
* skin 3, dark brown hair, cloth 1;
* skin 1, grey hair, cloth 4.

The flower, scarf and headband colours were varied with them.

| Run | ΔE mean | p95 | max | pixels > 0.02 |
|---|---|---|---|---|
| sample, `reference` | 0.0002 | 0.0031 | 0.0062 | 0 |
| sample, `range` | 0.0013 | 0.0033 | 0.0973 | 792 (trim and headband stretched) |
| rich, `reference`, masks over the reported pixels | 0.0008 | 0.0032 | 0.518 | 8 |
| sample, `range`, look from `--sample` (master + mask) | 0.0028 | 0.0059 | 0.488 | 1,089 |

* **Sample, `reference`:** 0 unresolved after the partial masks. The mouth's #4a1a24 lies 0.0096 from auburn hair's
  darkest value. Without a mask, neighbours decided 5 of its 9 pixels in pc_head_cue and reported 4. The imported
  masks equal the original kit's on every opaque pixel.
* **Rich:**
  * 19 pixels were reported in the four heads; masks painted from the ground truth over them, 25 pixels after 3
    rounds, settled them.
  * Materials equal the ground truth on all 20,117 unprotected pixels, the 510 decided by neighbours included.
  * No two painted values share a key colour.
  * 333 pixels' residuals were clamped.
  * The 8 pixels over 0.02 are one per look: a trim value that look A's dark teal puts within 24 of the outline ink.
    It is taken as ink and stays #140c18.
* **Round trip,** sample, `range`, via the runtime's `recolourPx`: skin, hair, cloth main and the flower come back
  exactly, 0 changed. The scarf's mean is 0.0003 and its max 0.0009. The trim's mean is 0.0517 and its max 0.0875;
  the headband's mean is 0.0397 and its max 0.076.
* **The game look against the input,** both assembled by the runtime: mean 0.0013, max 0.0875, on the same trim
  pixels.
* **Value floor (§5.4):**
  * No pair of painted values falls under 0.02 on any target: 7 skins, 10 hair colours, 8 cloth palettes (main and
    trim), and the accessory channels with 9 colours.
  * The smallest neighbour ΔE is 0.048 (the scarf on #f4f0e8).
* **`--sample`:**
  * 7 pixels were reported and 52 decided by neighbours.
  * Materials match the original kit on 20,093 unprotected pixels; 43 differ. They are the trim's darkest value in the
    two torsos. The test's master, the layers laid over each other, shows that value on 1 pixel (the strap and the arm
    cover it), so the sampled trim lacks it and it is read as the nearest fixed colour.
  * The flower's palest petal stays fixed: the master's fixed colours, one list for every layer, include near-whites
    beside it.
  * Both are why a master must show each material's whole value range.
* **Tolerances in the test and the proof:**
  * sample, `reference`: max ≤ 0.01, half a just-noticeable difference. The chain rounds to 8 bits twice.
  * rich: mean ≤ 0.002, p95 ≤ 0.005 and ≤ 0.1 % over 0.02, covering the clamped residuals and the ink-near pixel.
  * `range`: mean ≤ 0.005, plus |Δt| < 0.03 against `reference` where the ranges agree.
  * `--sample`: mean ≤ 0.005, p95 ≤ 0.01, and at most 0.5 % of materials differing from the original kit.

## Not verified

* **Painted art.** All of it is synthetic. The thresholds (0.09, 0.015, neighbours 3) and the default fixed colours of
  `lookA.json` are set on the code-drawn kit and generic guesses. Batch 1a's real-colour layers and their style master
  are the first real test.
* **How the converted art looks** in other palettes is the owner's judgement. The numbers say it matches recolouring
  the original key kit, not that the art reads well.
* **`--sample` without a mask** classifies the master against the default look first. On the sample, bristles and
  the scarf came back unresolved. A rough mask is the supported route.
* **The neighbour rule's error rate on real art.** On the rich fixture it decided 510 pixels with none wrong against
  the ground truth. A wrong vote at a boundary is possible, so check the flagged sheet.
* **The browser.** Keyify is a node tool. Its output goes through the importer and the same runtime code the browser
  runs, but no browser test was added.

## Open questions

1. **Lips. Settled by the lead (2026-10-04): lips follow skin.** `lookA.json` now sets `"as": { "lips": "skin" }`,
   as the brief asks, so a darker skin gets darker lips, as the code busts do. Run with `--values=reference` if the
   lips' darkest value should not set skin's s0 under `range`. (Was:) The brief puts blush and lips in the skin
   family; this task asked for them fixed. `lookA.json` keeps them
   fixed (part `lips`). `"as": { "lips": "skin" }` maps them as skin instead. They then also join skin's value range,
   so under `range` the darkest lip value becomes skin's s0.
2. **Look A's trim. Settled by the lead: teal stays.** It is only the colour the layers are painted in. It is well
   clear of the brass parts, where a gold trim would sit too close to the buckle and the ferrule, and the game
   recolours it to the look's own trim. (Was:) The brief's look A has a darker teal trim, but the game's outfit 2
   has a gold one. The default
   look file uses #2e6a6e, which no shipped outfit offers, so "look A" here is not selectable in the game.
3. **Regeneration from a real-colour source batch: two steps, kept** (keyify, then the importer, unchanged). (Was:)
   It is two steps: keyify, then the importer. Should
   `harmony_import.mjs` run keyify itself when `import.json` says `"colours": "real"`? The two-step form keeps the
   importer unchanged.
