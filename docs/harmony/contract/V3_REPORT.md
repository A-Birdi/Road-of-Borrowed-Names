# Harmony painted art — contract v3, validation notes

The worker's notes for contract v3 (docs/harmony/contract/CONTRACT.md, "Changes from v2"), in the style of
VALIDATION.md: what was run, on which commit, what came out, and what is **not** verified. Everything here was run
in headless Chromium 141 (Playwright) or node on a shared 4-core Linux machine while other workers ran browser
tests; nothing on a physical device, in Firefox or Safari, or with real painted art (none has been delivered). Every
fixture is SYNTHETIC: the sample (`tests/fixtures/harmony_sample/`, the code busts on the template, five exact key
shades per family) and the new rich fixture (`tests/fixtures/harmony_rich/`, the same kit repainted with 9–11 values
per family, ±4° hue and ±6 % chroma jitter, rim lights 8° cooler and 10 % paler, warm highlights 8° warmer, with ground
truth). Neither is art or a style reference.

## What changed (by part of the brief)

- **A. Key families, free values.** The shared colour model lives in `src/ui/88_harmony_contract.js` (`colour`: OKLab,
  key curves through the anchors extended 0.6 steps, projection at the pixel's own lightness, a relative family
  distance, target curves, recolouring). Importer (`tools/harmony/masks.mjs`): family classification with calibrated
  thresholds; painted colours kept (no snapping); supplied masks checked against the family; `values` per material in
  the report. Runtime (`src/ui/88_harmony_raster.js`): material from the mask, value and deviation from the pixel's
  own colour, exact anchors short-circuited to the ramp tones, memoised per colour; a value floor on target curves.
  New tools: `tools/harmony_rich.mjs` (the rich fixture), `tools/harmony_calibrate.mjs` (thresholds, →
  `calibration.json`), `tools/harmony_recolour_proof.mjs` (proof sheets and numbers, → `docs/screenshots/harmony/recolour_v3/`).
- **B. Fit on the visible footprint.** `RB.harmonyArt.footprint(spec)` (union of the composed pair's alpha bounds over
  the whole timeline); `fitScale(vw, vh, variant, dpr, footprint)`; `compose().scale` (a lazy getter, so a cold compose
  costs what it did); the overlay (`src/ui/82d_harmony_cutin.js` `place`) fits on it, placement rules unchanged.
- **C. Reduced motion.** `RB.harmonyContract.REDUCED_MOTION`; the overlay shows `peak` held, then `settle_b` held, one
  100 ms cross-fade (`lighter`, 1 − k / k) at the middle of the hold, no travel; `prepare()` builds both; code busts
  unchanged.
- **D. Painted checkerboards.** The existing detector (`tools/harmony/grid.mjs looksLikeCheckerboard`, enforced by the
  importer) had gaps, found by test: it ran only on fully opaque files (a checkerboard inside a file with transparent
  padding was imported as art), and it needed exactly two greys in all four corners (tool noise, or a bust covering a
  bottom corner, fell through to a generic "no transparency" error). It now fits a two-grey grid to the light,
  near-neutral pixels; the refusal names the cell size and coverage.
- **E. Source preservation.** `art/harmony/source/<batch>/` (committed, `PROVENANCE.md` required there; `.gitignore`
  still ignores `art/harmony/incoming/`); `tools/harmony_import.mjs` takes several folders in order; provenance copied
  to `assets/harmony/provenance/`; the manifest names the registry by its asset keys, so regeneration is byte-for-byte.
- **F. Batches 1a and 1b** in the contract (`BATCHES`, `batchCoverage`), the registry (`batches`), the import report and
  manifest. The synthetic sample's looks now follow the batches (look A gained the satchel, look B swapped the satchel
  for the headband; `tools/harmony_sample.mjs`). `ref_palettes.png` shows key families with free values.
- **G. Approval states** in the manifest (per pairing and `pc`), `RB.harmonyArt.approval()`, `stats().approval`,
  `stats().raster.approval`, and the `?dev=harmony` panel (`RB.harmonyCutin.dev.status()`).
- **H. CONTRACT.md version 3** with "Changes from v2"; `contractVersion` 3 in the contract and the registry; v2
  manifests still install; budgets remeasured.

## The chosen numbers and their evidence

**Thresholds** (`IMPORT`; relative family distance, dimensionless): inner **0.31**, outer **0.34**, margin **0.1**,
foreign **0.1**, extend **0.6** steps. Calibration on both fixtures (`node tools/harmony_calibrate.mjs --sweep`,
`calibration.json`): material pixels max 0.276 from their own family (rich p99 0.227; sample 0), fixed pixels min 0.379
from an allowed family (the code iris #7a4630: skin's hue, 38 % less chroma), smallest gap to the next allowed family
0.555, nearest legitimate fixed pixel to a foreign family 0.118 (the flower centre's orange in an accessory file).
Result: 0 misclassified, 0 unresolved; headroom 1.12× / 1.11× / 5.6× / 1.18×. The relative metric was chosen after an
absolute OKLab distance failed: the sample's ivory shirt sits 0.036 from the skin curve's pale end, a lash 0.056 from its
dark end, closer than any useful tolerance for painted variation.

**Residual factor** 1 (`RECOLOUR.residual`; sweep in `proof.json`): identity round trip max ΔE 0.0031 (k 0.75: 0.0136,
0.5: 0.0265, 0: 0.0521); outputs stay as far from their target family as the painting was from its key family (mean
0.070, ≤ 0.30) except 0.08 % of pixels clipped into the gamut near white (worst 0.47); gamut-clipped 0.08 % (k ≤ 0.75:
0.03 %).

**Value floor** 0.05 OKLab lightness per shade step (`RECOLOUR.valueFloor`): every neighbouring pair of the rich
fixture's painted values ≥ 0.022 ΔE and ΔL apart on all 63 targets (floor 0.02); without the floor, skin 6 had 0.0053,
white hair, #2c2430 and #f4f0e8 accessories 0 (identical colours) — the game's own ramps collapse there. Cost: 15 of 63
ramps opened; exact anchors keep v2's tones bit for bit on the other 48 (315/315 as specified); on the opened ones key
tones move in lightness by ≤ 0.028 (skin 6), up to 0.092 on white hair and #f4f0e8 (they had no room under white).
Look A's skin 1 ramp is among them (s3/s4 by ±0.007).

**Runtime value**: recomputed from colour, no value channel. Rich fixture in the page: 953 colours decomposed per pairing
and look, 2,417–3,334 rebuilt, 1–2 gamut-clipped; bust paint mean 1.1 ms (sample 1.2–1.4 ms) — a value channel would add
a decoded PNG per kit file for nothing measurable.

## Scales and face sizes (old = v2, full canvas; new = v3, visible footprint)

The sample's footprint: 343 × 132 (standard), 244 × 103 (compact). Face sizes below are for the template's 50 × 52
face box (the sample's code faces are 36 × 33; the browser rows record those).

| View | v2 standard | v3 standard | v2 compact | v3 compact | v3 faces (template, CSS px) |
|---|---|---|---|---|---|
| 2048 × 1046 | 1× | **2×** | 2× | 2× | 100 wide |
| 1920 × 1080 | 2× | 2× | 2× | 2× | 100 |
| 1680 × 1050 | 1× | **2×** | 2× | 2× | 100 |
| 1648 × 840 | 1× | 1× | 1× | **2×** | 50 standard / 100 compact |
| 1440 × 900 | 1× | 1× | 1× | **2×** | 50 / 100 |
| 1280 × 720 | 1× | 1× | 1× | 1× | 50 |
| 768 × 1024 @2 | — | — | 2× | **2.5×** | 125 |
| 390 × 844 @3 | — | — | 1.33× | 1.33× | 67 |
| 320 × 640 @2 | — | — | 1× | 1× | 50 |
| 844 × 390 @3 | — | — | 0.67× | **1×** | 50 |

**Measured in the game** (`node tests/e2e/harmony_cutin.mjs painted --painted-docs`, the painted sample and the rich
fixture installed, a real Suzu technique per view; `docs/screenshots/harmony/cutin/painted_v3.json`). The sample's faces
are the code busts' 36 × 33 art px, so its CSS face sizes are about 0.7 of real art's:

| View (DPR) | Fit chosen | Scale | v2 scales (standard / compact) | v3 scales | Sample faces (CSS px) | Frames checked, within 12 px |
|---|---|---|---|---|---|---|
| 2048 × 1046 (1) | standard | **2** | 1 / 2 | 2 / 2 | 72 × 66 | 13, 0 |
| 2048 × 1046 (1), rich | standard | **2** | 1 / 2 | 2 / 2 | 72 × 66 | 22, 0 |
| 1920 × 1080 (1) | standard-moved | 2 | 2 / 2 | 2 / 2 | 72 × 66 | 15, 0 |
| 1920 × 1080 (1), rich | standard-moved | 2 | 2 / 2 | 2 / 2 | 72 × 66 | 21, 0 |
| 1648 × 840 (1) | compact (sample faces < 48 at 1×) | 2 | 1 / 1 | 1 / 2 | 72 × 66 | 27, 0 |
| 1440 × 900 (1) | compact (the same) | 2 | 1 / 1 | 1 / 2 | 72 × 66 | 15, 0 |
| 1280 × 720 (1) | standard-moved | 1 | 1 / 1 | 1 / 1 | 36 × 33 | 24, 0 |
| 768 × 1024 (2) | compact | 2.5 | — / 2 | — / 2.5 | 90 × 82.5 | 17, 0 |
| 390 × 844 (3) | compact | 1.333 | — / 1.333 | — / 1.333 | 48 × 44 | 18, 0 |
| 320 × 640 (2) | compact | 1 | — / 1 | — / 1 | 36 × 33 | 27, 0 |
| 844 × 390 (3) | omitted (compact: overlaps banner; bare: overlaps plate) | — | — / 0.667 | — / 1 | — | — |

At 844 × 390 the code busts too are omitted at 200 % text and squeezed to `compact-bare` at 1× at 100 %
(`cutin_results.json`); the painted sample's footprint lets the compact pair be 1× instead of 0.67× (whose faces
would be under the overlay's 24-px minimum), and the overlay then finds no clear place for it.

**Reduced motion** (1280 × 720): Normal `peak → (cross-fade) → settle_b`, cross-fade frames spanning 83 ms of
presentation time, travel 0 px; Fast the same, 71 ms. The plan: centred at 370 ms (Normal) / 300.5 (Fast), 100 ms.

## Tests run

On commit 1194048's sources with one later comment rewrap in `src/ui/88_harmony_raster.js` (rebuilt; committed
with this report). Browser tests one at a time, Playwright with the preinstalled headless Chromium 141.

- **Unit, whole suite** `node tests/run-unit.mjs`: **24,365 passed, 0 failed** (harmony: png, import 78/78, raster
  79/79, timing 89/89, art unchanged). Content validator: no errors.
- **Tools**: `node tools/harmony_calibrate.mjs --sweep` OK (0 errors, headroom as above); `node
  tools/harmony_recolour_proof.mjs` OK (63 targets, 0 under the floor, 315/315 exact shades as specified);
  `node tools/harmony_rich.mjs` and `node tools/harmony_sample.mjs` regenerate their fixtures deterministically (the
  sample changed only by `acc_headband.png` and `import.json`); `node tools/harmony_registry.mjs`: 86 required + 33
  optional asset keys (unchanged), contract 3, batches 1a/1b (every file an asset key, `suzu_peak_fx` aside).
- **`tests/e2e/harmony_raster.mjs`**: 26/26 (four runs: three with `--sheets`, which rewrote the budgets and the synthetic evidence; the last on the final build). Harmony unit tests on the final build: 324/324.
- **`tests/e2e/harmony_art.mjs`**: 39/39 (the code busts unchanged).
- **`tests/e2e/harmony_cutin.mjs`** (no `--docs`: the code-bust evidence is unchanged): first full run 7 passed, 4
  failed, on a machine busy with other workers' browser tests:
  - *geometry* (code busts): one frame at 768 × 1024 with the response dock visible within 12 px (the dock's 200 ms
    withdrawal against the portrait's 180 ms entrance; the code busts' scale there is as before, 3×), and 390 × 844 at
    200 % text recording one layout where the portrait-off run recorded two;
  - *frozen frame*: the cut-in element was already gone when the test hid it (`null.style`);
  - *life*: no "holding" state within 8 s;
  - *painted sample*: one frame at 390 × 844 (DPR 3), state holding at 183 ms presentation time, the response dock
    still visible within 12 px — the same race; the painted scale there is v2's (1.333).
  Reruns alone: geometry **PASS**, frozen frame **PASS**, life **PASS**, painted sample + painted geometry **PASS**
  (2/2, the evidence run). An earlier painted-geometry run had the same dock frame once at 768 × 1024 (compact 2.5×);
  two reruns of that view alone and three later full painted-geometry runs passed.
  A **second full run** on the same build: **11 passed, 0 failed**.
- **`tests/e2e/battle_settings.mjs`** 10/10, **`tests/e2e/combat_ui.mjs`** 7/7, **`tests/e2e/playtest_repairs.mjs`**
  7/7, **`tests/e2e/battle_invariance.mjs --tech`**: 96 configurations, every fixture identical across its
  presentation settings (rules unchanged).
- **`tests/e2e/harmony_asset_refs.mjs`**: regenerated; `ref_palettes.png` (key families) and
  `template_bust_labelled.png` (version label, 62 px) committed; the other sheets left as they were (they differ only in
  the dialogue portraits, changed elsewhere since).
- Not run: the default browser suite as a whole (`tests/e2e/run.mjs`).

## Not verified

- **Real art.** Nothing here has seen a painted delivery: the thresholds, the residual factor and the value floor are
  calibrated on synthetic fixtures whose painting tolerance I chose (12° and 16 % in total). Batch 1a will show whether
  real painting stays inside it; real eyes, lips, metal or leather painted near a key family will come back
  unresolved (the band is 0.31–0.34) and need masks. Re-run `tools/harmony_calibrate.mjs` with Batch 1a's files.
- **How the recoloured art looks.** The proof sheets are code-drawn busts with synthetic values; numbers say neighbouring
  values stay a just-noticeable difference apart, not that forms read well. The owner's judgement on Batch 1a in
  several palettes, dark and light, is the real test.
- **The value floor's look on near-white ramps.** White hair and #f4f0e8 accessories get darker mid-tones (up to 0.092
  in lightness) than v2 gave them; whether that reads as "white" is a visual question.
- **Faces at 1366–1600 wide.** The overlay keeps its order (standard first unless its faces are under 48 CSS px), so a
  real 52-px face shows the standard pair at 1× there although the compact pair fits at 2× (100-px faces). Not changed:
  it is a placement rule; see Open questions.
- **Firefox and Safari**, the owner's 2048 × 1046 Firefox view itself, any phone, any DPR not emulated.
- **Real-device performance** of the recolour memo and the footprint (measured only in headless Chromium).
- The approval states' workflow (who sets `approved` and `verified`, and when) — the fields and their display exist.

## Open questions

1. **The value floor vs exact v2 tones.** The brief asked that exact v2 key shades give exactly today's colours; the
   owner asked that dark and light palettes keep readable form. Where the game's own ramps collapse (15 of 63) these
   conflict; I chose the owner's (floor 0.05; `valueFloor: 0` restores v2 everywhere). The better long-term fix may be
   the game's material ramps themselves (skinMat, hairMat, the accessory ramps), which the code busts share.
2. **Fit order at 1366–1600 wide** (above): should the overlay try the compact pair first whenever its faces are
   larger (e.g. raise the 48-px threshold toward the mockup's ~100 px)?
3. **The response dock's withdrawal** (CSS, 200 ms of wall time) outlasts the portrait's entrance (180 ms of
   presentation time): under load one frame can catch the dock still visible while the portrait already holds over its
   region (the overlay treats withdrawn menus as free space). Seen three times today, each one frame, each passing on
   rerun: the painted sample's compact pair at 768 × 1024 (2.5×, larger than v2's 2×), the code busts at 768 × 1024
   (3×, unchanged), the painted sample at 390 × 844 (1.333×, the same as v2). Pre-existing, not introduced by v3; v3's
   larger compact scale on a tablet reaches the dock's region more often. Aligning the two durations, or keeping the
   portrait unseen until the dock's transition has ended, would close it (src/ui/82d_harmony_cutin.js or the dock's
   CSS; I left the placement rules as they are).
4. **The registry's `source.git.branch`** records the worktree branch it was generated on; regenerate after merging
   if that matters.
5. The other asset-brief sheets (`ref_companion_*`, `ref_player_*`) differ from the game now (its dialogue portraits
   changed since they were made); I left them as they were.
