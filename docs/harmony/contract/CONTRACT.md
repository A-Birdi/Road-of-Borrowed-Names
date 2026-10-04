# Harmony painted art — the machine contract (version 3)

**What this is.** The exact, checkable contract for the painted Harmony busts: what files the art comes in,
how they are named, sized, aligned, layered and masked, how the game imports, assembles, recolours, times and
caches them, and how a delivery is validated and kept. It is the authority on formats. The artist-facing brief
(`docs/harmony/ASSET_BRIEF.md`) explains the same contract to people and must agree with it.

**Why version 3.** The owner's Art Direction Correction for the Harmony cut-ins (it wins where it conflicts with
v2): the player's art must not be lower-fidelity than the companions' (v2 snapped every recolourable kit pixel to
five shades), recolouring must keep the illustration's quality on every supported palette, dark and light, the pair
must be compared at a comparable face size (v2 fitted the full canvas, so a 2048 × 1046 view got 1×), reduced
motion uses held poses and restrained fades, a painted checkerboard is never transparency, approved source art is
kept with the means to regenerate the game's files from it, and the art is approved in phases.

**Single sources of truth.**

| What | Where |
|---|---|
| Geometry, states, timeline, reduced-motion plan, names, layer slots, accessories, mask colours, key families, the colour model, thresholds, batches, approval states, manifest schema | `src/ui/88_harmony_contract.js` (`RB.harmonyContract`; the importer loads the same file in node) |
| Everything the game knows about appearance and the asset keys and batches the contract implies | `docs/harmony/contract/registry.json`, from `node tools/harmony_registry.mjs` (reads the built `index.html`) |
| Import, normalisation, masks, regeneration, report | `tools/harmony_import.mjs` (+ `tools/harmony/*.mjs`) |
| Runtime: decode, assemble, recolour, cache, timeline, footprint | `src/ui/88_harmony_raster.js` behind `RB.harmonyArt` (`src/ui/88_harmony_art.js`) |
| Synthetic fixtures | `tests/fixtures/harmony_sample/` (five exact key shades per family) and `tests/fixtures/harmony_rich/` (many values per family, with ground truth) — both SYNTHETIC SAMPLE, not art |
| Threshold calibration | `node tools/harmony_calibrate.mjs [--sweep]` → `docs/harmony/contract/calibration.json` |
| Recolouring proof | `node tools/harmony_recolour_proof.mjs` → `docs/screenshots/harmony/recolour_v3/` |
| Real-colour delivery → key layers and masks (§5.5) | `node tools/harmony_keyify.mjs` (+ `tools/harmony/keyify.mjs`, `keyify_report.mjs`, the look file `tools/harmony/lookA.json`); evidence `node tools/harmony_keyify_proof.mjs` → `docs/screenshots/harmony/keyify/` |

Everything below is in **art px** (one pixel of the pixel-art grid) unless it says CSS px. Colour distances are in
OKLab (§5.1) unless they say sRGB.

## Changes from v2

1. **Key families, free values** (§5). Each recolourable material is painted in its key *family* — the five key
   shades are anchors on an OKLab curve, extended 0.6 steps past both ends — with as many values as the drawing
   needs (6–12 recommended). The importer keeps every painted colour (v2 snapped each to one of five shades) and
   classifies pixels by family with calibrated thresholds; the game recolours each pixel from its own colour: its
   value maps onto the look's ramp, its hue and chroma deviation is carried over. Exact v2 key shades still give
   exactly v2's colours, except on the 15 of 63 ramps where the game's own tones collapse (§5.4).
2. **Fit on the visible footprint** (§3.3). `fitScale` measures painted art by the union of the composed pair's drawn
   pixels across the pairing's whole timeline (`RB.harmonyArt.footprint`), not the full 352 × 160 canvas: the scale
   is fixed for a performance, and 2048 × 1046 gets 2× (v2: 1×).
3. **Reduced motion: held poses** (§4). With painted art: `peak` held, then `settle_b` held, one 100 ms cross-fade, no
   travel, inside the overlay's reduced-motion timing (v2: `settle_b` alone). The code busts are unchanged.
4. **Painted checkerboards** (§2, §9). The detector, which v2 already had, is hardened: it finds the two-grey grid
   with tool noise, under art that covers corners, and inside a file that also has real transparency. v2 imported
   that last case as art.
5. **Source preservation** (§1, §9). Approved deliveries live in `art/harmony/source/<batch>/` (committed, with
   `PROVENANCE.md`); `node tools/harmony_import.mjs art/harmony/source/<batch> … --replace` regenerates
   `assets/harmony/` byte for byte. Unreviewed drops stay in the ignored `art/harmony/incoming/`.
6. **Batches 1a and 1b** (§1.1), Phase 1 (the quality bar) and Phase 2 (the customisation proof), in the contract,
   the registry and the import report.
7. **Approval states** (§12): `provisional`, `candidate`, `approved`, `verified` (and `synthetic`) per pairing and for
   the player kit, in the manifest, `RB.harmonyArt.stats()` and the `?dev=harmony` viewer — never shown to players.
8. `contractVersion` 3. The game still installs v2 manifests (their kit pixels are exact key shades, recoloured as in
   v2). The manifest names the registry by its asset keys, not by the build (so a regeneration is byte-identical).

---

## 1. Folders and file names

```
art/harmony/incoming/<batch>/        as delivered, unreviewed (any enlargement): ignored, never committed
art/harmony/source/<batch>/          approved deliveries, committed exactly as delivered
  <name>.png                         one file per asset key (below)
  <name>.mask.png                    optional hand-made mask (overrides the derived one)
  import.json                        batch settings (§8): set, batch, approval, offsets, faces, …
  PROVENANCE.md                      the owner's rights note for the delivery (required here)
assets/harmony/                      regenerated from art/harmony/source/ by the importer; embedded by the build
  manifest.json                      §8
  <name>.png, <name>.mask.png        192 × 160, native grid
  provenance/<set>.md                each batch's PROVENANCE.md, as delivered
  report/report.json, report/contact.png
```

Moving a batch from `incoming/` to `source/` is the approval step for its *files* (the lead, with the owner's
consent); its `approval` (§12) says how far the *art* has been accepted. Regenerating the game's files:

```
node tools/harmony_import.mjs art/harmony/source/<batch 1> [art/harmony/source/<batch 2> …] --replace
```

| Kind | File name | Notes |
|---|---|---|
| Companion frame (flattened) | `<comp>_<state>.png` | `comp` ∈ nao, mio, ren, suzu; `state` §4 |
| Companion effect (optional) | `<comp>_<state>_fx.png` | a glint or glow drawn over the frame; left out when the overlay asks for `fx: false` |
| Companion frame (layered) | `<comp>_<state>_<layer>.png` | the set's `layers` (back to front) are listed in `import.json` |
| Player head | `pc_head_<expr>.png` | `expr` ∈ focus, cue, peak, settle. Bald head with ears, neck and face; the head never changes angle |
| Player torso | `pc_torso_<shape>.png` | `shape` ∈ tunic, robe, coat, apron, dress (registry `garmentShapes.all`) |
| Player brush arm | `pc_arm_<pose>_<sleeve>.png` | `pose` ∈ prep_a, prep_b, cue, peak_<comp>, settle_<comp>; `sleeve` ∈ fitted, wide |
| Player hair | `pc_hair_<style>_<back\|front>[_swing].png` | every `RB.sprites.HAIRSTYLES` entry; `shaved` is front only; `_swing` optional for prep_b and settle_a |
| Accessory | `acc_<id>[_<part>].png` | §3.4; parts near/far (earrings), back/front (cape); the knitted keepsake scarf is `acc_scarf_knit` |
| Mask | `<name>.mask.png` | §5 |

Names are lower case `a–z`, `0–9` and `_`. A name that is not in this table is rejected. The full list of
asset keys (86 required, 33 optional for the current registry; unchanged from v2) is `assetKeys` in `registry.json`.

### 1.1 Delivery batches (`RB.harmonyContract.BATCHES`, `registry.json` `batches`)

**Batch 1a — Phase 1, the quality bar** (Suzu and the player's look A: ponytail, coat, glasses, flower, satchel).
The owner approves it before anything else is produced. 18 required files:

* `suzu_prep_a`, `suzu_cue`, `suzu_peak`, `suzu_settle_b` (optional: `suzu_prep_b`, `suzu_settle_a`, `suzu_peak_fx`)
* `pc_head_focus`, `pc_head_cue`, `pc_head_peak`, `pc_head_settle`
* `pc_torso_coat`
* `pc_arm_prep_a_fitted`, `pc_arm_cue_fitted`, `pc_arm_peak_suzu_fitted`, `pc_arm_settle_suzu_fitted` (optional: `pc_arm_prep_b_fitted`)
* `pc_hair_ponytail_back`, `pc_hair_ponytail_front`
* `acc_glasses`, `acc_flower`, `acc_satchel` (the satchel strap is in look A: the owner's mockup shows it)

**Batch 1b — Phase 2, the customisation proof** (a materially different look B on the same kit: curly hair, robe
with its wide sleeve, scarf, headband — a hair-mounted, recolourable accessory on another hairstyle). After 1a is
approved. 9 required files:

* `pc_torso_robe`
* `pc_arm_prep_a_wide`, `pc_arm_cue_wide`, `pc_arm_peak_suzu_wide`, `pc_arm_settle_suzu_wide` (optional: `pc_arm_prep_b_wide`)
* `pc_hair_curly_back`, `pc_hair_curly_front`
* `acc_scarf`, `acc_headband`

A batch's `import.json` names it (`"batch": "1a"`); the importer then warns about files outside the batch and
about missing required files, and the report and manifest record every batch's coverage (`batches`). Every file
of both batches is a registry asset key (the effect file aside, as effects always are). The synthetic sample
covers both batches (§11).

## 2. The PNG format

* PNG, **RGBA 8-bit, straight (not premultiplied) alpha, sRGB, no matte**, hard pixel edges. The importer also
  reads RGB, greyscale, grey + alpha and palette PNGs (1/2/4/8-bit), and 16-bit (reduced to 8). Interlaced
  (Adam7) PNGs are refused with a clear error; re-save without interlacing.
* No colour profile is applied (`iCCP`, `gAMA`, `cHRM` are ignored; pixels are taken as sRGB).
* Transparency: alpha below 128 is transparent, at or above 128 opaque (the importer binarises it). There is
  no partial alpha anywhere: glasses' lenses are left transparent (the eyes show through), with any glint or
  rim painted as opaque pixels; glows and soft shadows are drawn as opaque pixel clusters or left to the game.
  A file with no transparency is accepted only if its background is one flat `#ff00ff` (keyed out
  automatically when all four corners are that magenta, or always with `background: "magenta"`).
* **A painted transparency checkerboard is rejected** by name, wherever it is: the light, near-neutral pixels are
  split into two grey levels, a cell size of 4–64 px and a phase are fitted to where the levels meet, and the file is
  refused when ≥ 90 % of those pixels follow the grid, they cover ≥ 10 % of the image and they reach two of its
  edges. That holds with tool noise (more than two greys), with art over the corners, and inside a file that also
  has real transparency (padding round a flattened image) — cases the v2 test (exactly two greys in all four
  corners of an opaque file) missed or reported only as "no transparency".
* Any enlargement of the grid: whole (4× = 768 × 640) or not (a 1024 × 1024 square holding the 192 × 160
  canvas at 5.333×). The importer finds the grid (§9). Anti-aliased in-between colours at cell edges are
  ignored by sampling each cell's centre.
* No text, letters, numbers, kana or kanji, signatures, watermarks, logos, frames or backings in any file.

## 3. Canvases, origins and anchors

### 3.1 The bust canvas: 192 × 160, origin top left

Every bust file (frame, layer, mask) is the whole 192 × 160 canvas, aligned to the template: nothing is
trimmed, so the file's origin is the canvas origin and no per-layer offsets are stored for art (the only
offsets are the import alignment in §9 and the runtime group/attachment offsets in §6).

| Anchor (half-open boxes [x0, y0, x1, y1)) | Companion | Player |
|---|---|---|
| Facing | three-quarter, turned toward screen **right** | three-quarter, turned toward screen **left** (toward the companion) |
| Near side | the character's right (screen left) | the character's left (screen right) |
| Neck pit (registration point) | (94, 118) | (98, 118) |
| Head box (crown to chin; hair may spill out) | 62, 18, 130, 104 | 62, 18, 130, 104 |
| Face box (brow to chin; 50 × 52) | 74, 52, 124, 104 | 68, 52, 118, 104 |
| Signature-hand zone | near side 8, 36, 76, 150 — or forward 76, 30, 190, 150 | near side 124, 30, 188, 150 |
| Ink band's lower edge (the crop) | (0, 156) → (192, 150) | (0, 151) → (192, 145) |
| Compact-safe box (face and hand above y 128) | 8, 0, 184, 128 | 8, 0, 184, 128 |

The player's band edge is (0, 151) → (192, 145): the band's lower edge is one straight line across the whole pair
(§3.2), and at the player's canvas (x 160–352) that line runs 5 px higher. The face box gives faces of 50 CSS px
wide at 1×, 100 at 2× (the owner's mockup: about 110).

### 3.2 The pair, built by the game

| Variant | Canvas | Companion canvas at | Player canvas at | Band top edge | Band lower edge (crop) |
|---|---|---|---|---|---|
| standard | 352 × 160 | (0, 0) | (160, 0) | from y 42 at the left, rising 0.05 per px, a brush edge | (0, 156) → (352, 145) |
| compact | 248 × 128 | (−38, 0) | (98, 0) | from y 34, rising 0.035 per px | (0, 126) → (248, 120) |

The player is drawn after (in front of) the companion. Per-companion offsets (`companions.<id>.offset` and
`pc.offset` in the manifest, whole px, |d| ≤ 64) move a canvas inside the pair. The compact pair is a crop for
narrow screens: the player is 24 px closer, and the outer hands are cut (only the face and what is above
y 128 near the face are guaranteed). The game draws the indigo ink band behind the pair (§7); the art never
contains it.

### 3.3 Display (CSS px): fitted on the visible footprint

`RB.harmonyArt.footprint({ comp, look, variant })` is the pairing's **visible footprint**: the union of the composed
pair's alpha bounding box (busts, hands, effects and the ink band) across every state the companion's timeline
shows — one rectangle for the whole performance. `RB.harmonyArt.fitScale(viewW, viewH, variant[, dpr[, footprint]])`
measures painted art by it (without it, by the full canvas, as v2 did): standard — the largest **integer** scale
inside the addendum's §5.2 limits (42 % of the width, 30 % of the height, 12 % of the area); compact — the largest
**DPR-aware** scale (CSS px per art px whose product with `devicePixelRatio` is whole) up to the view's width and
27 % of its height. `compose(spec).scale` and the cut-in overlay use the footprint, so the scale never changes
mid-performance; reduced motion shows two of those states and gets the same scale. The code-drawn busts keep
their own fit (their canvas is their footprint).

The synthetic sample's footprint is 343 × 132 (standard) and 244 × 103 (compact) of 352 × 160 and 248 × 128 — the
canvas's top rows and right end are empty. Real art will differ: a hairstyle reaching y 8 makes it about 150 rows.

| View (CSS px, DPR) | Standard v2 (canvas) | Standard v3 (sample footprint) | Footprint | Faces* | Compact v2 | Compact v3 | Faces* |
|---|---|---|---|---|---|---|---|
| 2048 × 1046, 1 (the owner's Firefox) | 1× | **2×** | 686 × 264 (33.5 % × 25.2 %) | 100 | 2× | 2× | 100 |
| 1920 × 1080, 1 | 2× | 2× | 686 × 264 (35.7 % × 24.4 %) | 100 | 2× | 2× | 100 |
| 2560 × 1440, 1 | 2× | **3×** | 1029 × 396 (40.2 % × 27.5 %) | 150 | 3× | 3× | 150 |
| 1680 × 1050, 1 | 1× | **2×** | 686 × 264 (40.8 % × 25.1 %) | 100 | 2× | 2× | 100 |
| 1600 × 900, 1 | 1× | 1× | 343 × 132 | 50 | 1× | **2×** | 100 |
| 1440 × 900, 1 | 1× | 1× | 343 × 132 | 50 | 1× | **2×** | 100 |
| 1366 × 768, 1 | 1× | 1× | 343 × 132 | 50 | 1× | **2×** | 100 |
| 1280 × 720, 1 | 1× | 1× | 343 × 132 | 50 | 1× | 1× | 50 |
| 768 × 1024, 2 (tablet) | — | — | | | 2× | **2.5×** | 125 |
| 844 × 390, 3 (phone, landscape) | — | — | | | 0.67× | **1×** | 50 |
| 390 × 844, 3 | — | — | | | 1.33× | 1.33× | 67 |
| 412 × 915, 2.625 | — | — | | | 1.52× | 1.52× | 76 |
| 360 × 800, 3 | — | — | | | 1.33× | 1.33× | 67 |
| 375 × 667, 2 | — | — | | | 1× | **1.5×** | 75 |
| 320 × 640, 2 | — | — | | | 1× | 1× | 50 |

\* Face width in CSS px for the template's 50-px face box (the sample's code-drawn faces are 36 × 33 art px).
Computed from the rule; the browser test measures the same scales in the game at the geometry viewports
(`docs/screenshots/harmony/cutin/painted_v3.json`). On the sample's footprint 2× needs at least 1634 CSS px of
width, 880 of height and 1,509,200 px² of area (e.g. 1634 × 924, 1680 × 899); a 150-row footprint needs 1000 of
height. **Which pair the overlay shows is its decision** (src/ui/82d_harmony_cutin.js): since 2026-10-04 it tries its
candidates (standard at mid height, standard moved, compact, compact bare, compact smaller) in the order of the face size
each gives at its own fitted scale — each variant inside its own limits above — larger first, ties to the standard pair.
So at 1440 × 900 and 1600 × 900 real art's faces (the template's 50 × 52 box) show the compact pair at 2× (100 CSS px)
rather than the standard at 1× (50), and at 2048 × 1046, where both give 100, the standard pair; at 1366 × 768 the
compact pair at 2× is tried first but comes within 12 px of the creature's plate at every height in the measured
encounter, so the standard at 1× stays (measured with the sample carrying the template's face boxes: V3_REPORT.md, open
question 2). Before, it tried the standard pair first
unless its faces were under 48 CSS px.

### 3.4 Accessories: files, slots, sides

| Accessory (look `acc`) | Files → slot | Hair-mounted | Accessory channel (look field → default) | Character side |
|---|---|---|---|---|
| cape | `acc_cape_back` → acc_back, `acc_cape_front` → acc_chest | | capeCol → #6a3a4a | both |
| satchel | `acc_satchel` → acc_chest | | none (final colours) | strap right shoulder → left hip |
| atlas_sash | `acc_atlas_sash` → acc_chest | | sashCol → #d8c89a | right shoulder → left hip |
| bell | `acc_bell` → acc_chest | | cordCol → #b8342a (the bell's metal is fixed) | centre |
| atlas_pin | `acc_atlas_pin` → acc_chest | | none | right chest |
| scarf | `acc_scarf` → acc_neck; with `scarfStripe`: `acc_scarf_knit` | | scarfCol → #c8962e | tail on the left breast |
| glasses | `acc_glasses` → glasses | | none (never recoloured) | both |
| hat / cap | `acc_hat` / `acc_cap` → acc_head | yes; hides hair above its band | hatCol → #8a6a44 / capCol → #2c4468 | both |
| headband | `acc_headband` → acc_head | yes | bandCol → the cloth trim | both |
| ribbon, flower, leaf | `acc_ribbon`, `acc_flower`, `acc_leaf` → acc_head | yes | ribbonCol #c8687a, flowerCol #f4a6a0, leafCol #c8452a | the character's left |
| atlas_quill | `acc_atlas_quill` → acc_head | yes | none | the character's left |
| earrings | `acc_earrings_far` → acc_ear_far, `acc_earrings_near` → acc_ear_near | | earCol → the gold metal ramp | both ears |
| atlas_lamplet | — not painted: hangs at the hip, below the ink band crop | | | |

The character's left is the player's **near** side (screen right): the flower, leaf, ribbon and quill are on the
visible side of the player's head; in the code-drawn busts (turned right) they were on the far side. The registry's
`codeBust` entries record how 88_harmony_acc.js draws each one. Same-place rule: a hat or cap keepsake replaces
the other (`RB.equip.SAME_PLACE`). Charms and tools are never drawn (`registry.statisticalItems`).

## 4. Performance states and timing

| State | Required | Overlay segment | From–to (fraction of the segment) | Normal (ms from the action's start) |
|---|---|---|---|---|
| prep_a | yes | in | 0–0.5 | 0–90 |
| prep_b | optional (holds prep_a) | in | 0.5–1 | 90–180 |
| cue | yes | hold | 0–0.21 | 180–260 |
| peak | yes | hold | 0.21–0.58 | 260–400 |
| settle_a | optional (holds peak) | hold | 0.58–0.79 | 400–480 |
| settle_b | yes | hold, then all of out | 0.79–1, 0–1 | 480–780 (fading 560–780) |

* Segments: Normal in 180 / hold 380 / out 220 ms; Fast 100 / 220 / 160 ms (the overlay's
  `RB.battleSeq.T.cutin`). Instant shows nothing.
* **Reduced motion** (`RB.harmonyContract.REDUCED_MOTION`): no travel, the overlay's own fade in where it stands,
  hold and fade out. With painted art, **two held poses**: `peak` from the start, then `settle_b`, joined by one
  cross-fade of 100 presentation ms centred at the middle of the hold (Normal: peak 0–320, cross-fade 320–420,
  settle_b 420–780; Fast: centred at 301 presentation ms). The cross-fade adds the two drawings (`lighter`) at
  1 − k and k, so shared pixels keep full opacity. The code-drawn busts keep their single held drawing.
* One-off: each state appears once, in order; nothing loops, blinks on a timer or repeats.
* `RB.harmonyArt.timeline(comp)` → `[{ phase, seg: 'in'|'hold'|'out', from, to }]`, only while painted art is
  installed. A missing optional state is left out and the state before it spans its time. A companion's
  `timeline` in the manifest may replace a state's `{ seg, from, to }`; the result must pass
  `validTimeline` (known states, 0 ≤ from < to ≤ 1, in order, no overlap, ending on settle_b).
* `RB.harmonyArt.PHASES` is the state list while painted art is installed, `['enter', 'hold']` otherwise; with
  no assets there is no `timeline` and the code-drawn busts behave exactly as before.
* A bust with no complete painted set shows its code drawing: `enter` for prep_a/prep_b, `hold` from cue on.

**The player's kit per state** (comp = the companion of the pairing):

| State | Head | Arm pose | Hair |
|---|---|---|---|
| prep_a | pc_head_focus | prep_a | plain |
| prep_b | pc_head_focus | prep_b (else prep_a) | `_swing` if delivered |
| cue | pc_head_cue | cue | plain |
| peak | pc_head_peak | peak_<comp> | plain |
| settle_a | pc_head_settle | settle_<comp> | `_swing` if delivered |
| settle_b | pc_head_settle | settle_<comp> | plain |

The sleeve follows the cut: **wide for the robe only**; fitted for tunic, coat, apron and dress. Companion
performances: Nao — Read the Opening; Mio — Clearwater Draught; Ren — Lantern Ward; Suzu — Curtain Call.

## 5. Masks and recolouring: key families, free values

**Companions are fixed identity: never recoloured, no masks.** Each player-kit file has a mask: the derived one
(written by the importer) or a supplied `<name>.mask.png`, which always wins.

| Material | Mask colour | Feeds from the look | Target ramp (built as the code busts build it) | PICK (tones the key shades take) |
|---|---|---|---|---|
| skin | #ff0000 | skin | `skinMat(colorsOf(look).skin)` (6 tones) | 0, 1, 2, 4, 5 |
| hair | #00ff00 | hairColor | `hairMat(colorsOf(look).hair)` | 1–5 |
| clothMain | #0000ff | outfit / cloth | `clothMat(cloth[0])` | 1–5 |
| clothTrim | #ffff00 | outfit / cloth (the wrap: wrapCol) | `clothMat(cloth[2], { step: 0.09 })`; the wrap `clothMat(wrapCol ‖ cloth[2])` | 1–5 |
| accessory | #ff00ff | the accessory's field (§3.4) | `M(name, colour, opts)` as in 88_harmony_acc.js; earrings without earCol: `metalMat('#e0b850')` | 1–5 (6 tones) or 0–4 (5) |
| fixed | #000000 | — | keeps its painted colour | |
| transparent | alpha 0 | | | |

### 5.1 The key families (paint the kit's recolourable parts in these)

The five **anchor shades** per family, darkest → lightest (unchanged from v2; `KEY_RAMPS`;
`docs/harmony/asset_brief/ref_palettes.png` shows each family as a band with its anchors and tolerance):

| Family | s0 | s1 | s2 | s3 | s4 |
|---|---|---|---|---|---|
| skin (an unnatural orange key) | #601c00 | #943c08 | #d06018 | #f48c40 | #ffc0a0 |
| hair | #3c0a5c | #5a1470 | #8a24a0 | #b848c8 | #e088ec |
| clothMain | #0c3a14 | #1a6428 | #2e8c3c | #52b45a | #8ad88a |
| clothTrim | #004e60 | #12687a | #22a0b4 | #5ccce0 | #a8f0f8 |
| accessory | #10164a | #222e8a | #3a4cc8 | #6a80ec | #a8b8ff |

**The colour model** (`RB.harmonyContract.colour`, used by the importer and the game alike). Each family's **key
curve** is piecewise linear in OKLab through its anchors at t = 0…4, extended 0.6 steps past both ends along the end
segments (each curve's lightness rises strictly, so lightness gives t). A colour is **projected** onto a curve at its
own lightness: `t` (its value, in shade steps), and its **relative distance** `d` — the chroma-plane deviation from
the curve's point (mapped into the sRGB gamut) divided by the curve's chroma there, combined with any shade steps of
lightness beyond the extended ends. Relative, because every curve fades toward neutral at its ends: in absolute
OKLab terms the sample's ivory shirt is 0.036 from the skin curve's pale end and a lash 0.056 from its dark end;
relative to the curve's chroma both are more than half the family's colour away.

**Painting within a family.** Any value along the band, beyond s0 and s4 by up to 0.6 steps, with hue up to about
12° and chroma up to about 16 % off the band in total (rim lights and warm highlights included) is that material.
Exact anchor shades are allowed and give exactly v2's colours (§5.4). Keep fixed colours (eyes, lips if fixed,
brush, metal, leather) clearly away from the families — more than a third off in chroma or 20° in hue.

### 5.2 Derivation (importer) and the thresholds

Per file, only the materials its kind allows: heads skin + hair (brows, stubble); torsos clothMain + clothTrim +
skin; arms skin + clothMain + clothTrim; hair hair + clothTrim (ties, the wrap); accessories accessory. For each
opaque pixel, in order:

1. within 24 (sRGB) of #140c18 (outline ink, snapped to it) or of #ffffff / #f6f2ee (highlights, eye whites) →
   **fixed**;
2. within **foreign = 0.1** of a family the file may **not** hold, and nearer to it than to every allowed one by the
   margin → **unresolved** ("a skin-family colour in a file that may not contain skin": it would keep a key colour
   in every look);
3. the nearest allowed family within **inner = 0.31** and nearer than the next allowed one by **margin = 0.1** →
   that **material**; the pixel **keeps its painted colour** (no snapping);
4. farther than **outer = 0.34** from every allowed family → **fixed** (keeps its colour);
5. otherwise **unresolved** — the import fails and the report lists each pixel, its colour, the nearest family and
   its distance, unless a supplied `<name>.mask.png` decides.

The mask stores the material; the shade index in the codes (`2 + material × 5 + round(t)`) is kept for reports and
mask views only. The report counts each material's painted values per file (`values`).

**Calibration** (`node tools/harmony_calibrate.mjs`, `calibration.json`; synthetic fixtures only): 38,154 material and
2,138 unprotected fixed pixels (4,322 and 300 distinct colours per file) of the sample and the rich fixture, with ground
truth.

| Measured | Value | Threshold | Headroom |
|---|---|---|---|
| a material pixel's distance to its own family (rich fixture: p50 0.070, p99 0.227) | max **0.276** (a rim-lit hair value at t 4.5) | inner 0.31 | 1.12× |
| a fixed pixel's distance to the nearest allowed family | min **0.379** (the code iris #7a4630 vs skin: same hue, 38 % less chroma) | outer 0.34 | 1.11× |
| a material pixel's gap to the next allowed family | min **0.555** | margin 0.1 | 5.6× |
| a legitimate fixed pixel's distance to a foreign family | min **0.118** (the flower centre's orange #ce6d1c vs skin, in an accessory file) | foreign 0.1 | 1.18× |
| value recovered from colour vs the value painted | max 0.018 steps, mean 0.004 | | |

With these: 0 pixels misclassified, 0 unresolved, on both fixtures. The stated painting tolerance (12° and 16 % together)
gives 0.25; the rest is gamut and 8-bit rounding. The sweep (`--sweep`) shows inner 0.25 leaves 27 rich pixels
unresolved and outer 0.38 makes the iris unresolved. The unresolved band (0.31–0.34) is narrow because the sample's
iris is that close to the skin family: real art must keep its fixed colours farther away, or supply masks.

**Supplied masks** decide: a pixel the derivation leaves unresolved may be marked a material (kept as painted). A
pixel marked as a material must lie within outer of that family (else an error: it could not be recoloured
faithfully); outline ink and highlights marked as a material are kept fixed (warning); a pixel marked fixed inside an
allowed family is a warning (it keeps a key-family colour in every look). A fixed pixel may not be exactly an anchor
shade (refused, as in v2).

### 5.3 Recolouring (runtime)

For each pixel the mask marks as material m: an **exact anchor shade** takes its ramp tone (PICK) — v2's colour;
any other colour is **decomposed** against m's key curve (value t; chroma relative to the curve's, ρ; hue angle off
the curve's, θ — look-independent, memoised by colour) and rebuilt on the look's **target curve**: the game's own
material ramp in OKLab, with key shade s at its PICKed tone and the tones PICK skips at their fractional places (skin's
middle tone at t 2.5; a 6-tone ramp's darkest at t −1), extended past its ends. The target point at t gets its chroma
× (1 + k·ρ) and its hue + k·θ (k = **residual factor**, ρ capped at +100 %, θ at 0.6 rad), then is mapped into the
sRGB gamut at constant lightness and hue. Outline ink, highlights and fixed pixels are never recoloured, whatever a
mask says.

**The residual factor is 1** (`RECOLOUR.residual`), chosen on the rich fixture (`proof.json` `residual.sweep`):

| k | identity round trip (rich fixture → its own key ramps), ΔE mean / max | painted variation kept (mean ΔE vs k 0) | outputs' distance from their target family, mean / max | gamut-clipped |
|---|---|---|---|---|
| 0 | 0.0106 / 0.0521 | 0 | 0.011 / 0.126 | 0.03 % |
| 0.5 | 0.0054 / 0.0265 | 0.0025 | 0.038 / 0.190 | 0.03 % |
| 0.75 | 0.0027 / 0.0136 | 0.0036 | 0.053 / 0.252 | 0.03 % |
| **1** | **0 / 0.0031** | **0.0047** | **0.070 / 0.47** | **0.08 %** |

At 1 the recolouring is lossless (recolouring the fixture into the key ramps gives it back within 8-bit rounding),
and a recoloured pixel sits as far from its target family, relatively, as the painted one sat from its key family
(≤ 0.30, inside inner) — except the 0.08 % pulled into the gamut near white (the worst, 0.47, a skin-0 highlight at t
4.5). Anything less discards part of what the artist painted. Hue deviations rotate with the family, so the
12° tolerance also bounds how far a hue-shifted rim light can move on any target.

### 5.4 The value floor: dark and light palettes keep readable form

The game's own ramps collapse at the extremes: skin 6's tones 1 and 2 are 0.002 apart in lightness, white hair's two
lightest tones are the same colour (v2's s3 and s4 were identical there), very dark or very light accessory colours
repeat a tone. No painted value between them could stay distinct. So the target curve is **opened to a floor** of
0.05 OKLab lightness per shade step (`RECOLOUR.valueFloor`): a weighted least-squares fit (isotonic regression on
lightness less the floor's running total; key nodes weigh 100, the others 1), lightness only, within 0–1; a ramp that
already meets the floor is left exactly as it is. Measured over the 63 supported targets (7 skins, 10 hair colours,
8 cloth main, 8 cloth trim, 30 accessory channels; `proof.json`):

* every pair of neighbouring painted values of the rich fixture (half steps from −0.5 to 4.5) stays ≥ **0.022** ΔE
  and ΔL apart on every target (floor 0.02 ≈ one just-noticeable difference), the darkest (skin 6, black hair, cloth 5)
  and the lightest (skin 0, white hair, cloth 6) included;
* exact anchor shades give exactly v2's tones, bit for bit, on the **48 ramps the floor leaves alone** (315 of 315
  shades as specified); the **15 opened ramps** move key tones in lightness only, by at most 0.028 (skin 6) except
  white hair and #f4f0e8 accessories (up to 0.092: v2 gave them no room under white): skin 0, 1, 5, 6; hair gold, white; cloth 0
  and 1 trim; cloth 6 main; #d8c89a and #f4f0e8 accessories. `valueFloor: 0` restores v2's tones everywhere.

**Never recoloured:** fixed pixels, outline ink, near-white highlights and eye whites, glasses, every companion pixel —
enforced again at runtime. A fixed pixel may not be exactly an anchor shade (the importer refuses it).

### 5.5 Real-colour delivery: the keyify step

**Why.** Image tools paint the unnatural key families badly: their examples came back with real brown skin and pink
ties. So the player kit may be delivered in **look A's real colours** and converted to the key families by
`node tools/harmony_keyify.mjs` (a dev tool; nothing of it ships). Its output is an ordinary delivery in key colours
with a supplied mask per file, which the importer then reads as in §9. The art is made in one place (look A, as the
owner approves it); the conversion, alignment, recolouring checks and import proof are tooling.

**What the painter delivers.**

* Every kit layer of the batch under its contract name (§1), on the template (§3.1), in the format of §2: binary alpha, real
  transparency or one flat #ff00ff, no painted checkerboard, any whole enlargement or the 1024 square.
* Painted in **look A's real colours**: light skin, an auburn ponytail, a green coat with a darker teal trim and collar,
  a pink flower; the glasses (round, brown frames), the satchel (brown leather, brass buckle) and the brush (black
  lacquer, brass ferrule, cream bristles) in their final colours.
* **One palette per material across all layers.** The face, the neck and the hand use the same skin colours; the
  collar, the cuffs and the hair ties the same trim colours. The value mapping is per material across the whole kit.
* **Each material's darkest painted value is its deepest shadow and its lightest is its highlight** (the default
  `range` mapping places them at s0 and s4). A material painted without one of them is mapped with `--values=reference`.
* **Fixed colours visibly apart from the materials beside them in the same layer:** eyes, eye whites, lips and mouth
  in a head; the inner collar in a torso; lacquer, brass and bristles in an arm; leaves and the flower's centre in the
  flower. Measured (below), auburn hair's light values, light skin's shadows, cream bristles and a light skin's
  highlight are each within one just-noticeable difference of the other in real colours; they come back as reported
  pixels, so expect masks there.
* **No material value within 24 (sRGB) of the outline ink #140c18.** It is taken as ink, as the importer takes it.
  Within 4 of #ffffff or the eye white #f6f2ee a pixel is always fixed; other near-whites stay fixed unless a material's
  ramp claims them, for example a pink flower's palest petal.
* Recommended: the **style master** (look A complete at `peak`, in real colours) and a rough mask of it in the mask
  colours (§5) in `refs/`. `--sample` derives the reference colours from them; the master must show each material's
  whole value range. Optional: `<name>.mask.png` for any layer, which may be partial, to settle reported pixels.

**What keyify does.**

1. **Read.** Every file goes through the importer's own normalisation (`normaliseImage` in `tools/harmony/importer.mjs`:
   checkerboard refusal, magenta keying, grid detection, cell-centre downsampling, binary alpha, the `import.json`
   cell, origin, offset and background). Companion frames are copied byte for byte.
2. **Classify** each opaque pixel of a kit layer into a **part** its kind may hold. The look file
   (`tools/harmony/lookA.json` by default; `--look`) gives the parts:
   * material parts, matched against a reference ramp. The default ramps are the game's own ramps for its game look:
     skin 1, auburn hair, cloth #4e7a4a / #3c5e38 with the trim #2e6a6e (no shipped outfit has this trim), and the
     flower channel's default. They are built as `88_harmony_raster.js` builds them; a unit test checks they are equal.
   * fixed parts, matched against colour lists: eyes, eye whites, lips, mouth, inner collar, lacquer, brass, bristles,
     leaves and the flower's centre. These defaults are generic starting points, not measured from art.
   * The parts per kind:

     | Kind | Parts |
     |---|---|
     | head | skin, hair (brows, stubble), eyes, eye whites, lips, mouth |
     | torso | cloth main, cloth trim, skin, inner collar (fixed unless the look's `as` says otherwise) |
     | arm | cloth main (sleeve), cloth trim (cuff), skin (hand), lacquer, brass, bristles |
     | hair | hair, cloth trim (ties, the wrap) |
     | acc_flower | accessory, leaves, the flower's centre |
     | acc_glasses, acc_satchel, other accessories without a channel | everything fixed |

   Matching works in absolute OKLab. A ramp is matched by the chroma-plane distance at the pixel's own lightness, plus
   any lightness beyond its ends. A colour list is matched by its nearest colour, with lightness at half weight. The
   nearest part within **0.09** wins if it is nearer than every part of another material by **0.015**. A pixel between
   two parts is decided by its neighbours when at least 3 of its 8 decided neighbours, and twice as many as the other,
   belong to one of the two. Such pixels are flagged `neighbours` and counted. Anything else is **unresolved**: reported
   with its colour, position and nearest parts, never guessed. A layer with unresolved pixels is not written unless
   `--force` is given, and then those pixels stay fixed. A supplied mask decides every pixel it covers. A pixel that
   matches no part but lies clearly in a key family (within half of `inner`) is kept as painted. A layer most of whose
   unprotected pixels lie that clearly in a key family it may hold is passed through whole, exactly as delivered, its
   mask the importer's own (derived, or the supplied one read). A delivery wholly in key colours therefore comes out
   of keyify and the importer byte for byte as from the importer alone (tested on the sample). Measured shares: look A's
   real-colour layers 0 %, the sample's key-coloured ones 77–100 %. Within `inner` itself the importer finds 27 % of a
   real-colour head in the orange skin family, so `inner` is not the test.
3. **Value mapping,** per material across the whole kit, monotonic in lightness. It keeps the number of values and
   their order; merges caused by 8-bit rounding are reported.
   * `range` (the default): the material's painted lightness range maps onto s0…s4. The darkest painted value lands
     at s0 and the lightest at s4, shaped by the reference ramp's value scale.
   * `reference`: each value's place on the reference ramp, so the reference's s0 lightness lands at s0. Values beyond
     the key curve's ±0.6 steps are squeezed into it.
   * A material with fewer than 3 values, or spanning under 2 reference steps, uses `reference`, because a range needs
     a range. A range that stretches (the values reach under 3.5 or start over 0.5 on the reference) or squeezes is
     reported.
4. **Residual.** The colour's chroma, relative, and its hue offset are measured from the reference ramp at its own
   lightness and rebuilt on the key curve at its value. They stay within the painting tolerance of §5.1: 12° of hue,
   16 % of chroma and 0.25 together, so rim lights and warm highlights survive. Larger offsets are clamped and
   reported. A key colour the importer would take for ink or a highlight is moved inward.
5. **Fixed pixels keep their colours.** Each one is checked against every key family:
   * within `outer` of a family the layer may hold: a warning, since the supplied mask keeps it fixed;
   * within `foreign` of a family it may not hold: a warning;
   * exactly an anchor shade: an error, since the importer refuses it.
6. **Write** `<outDir>`:
   * a native 192 × 160 key layer and `<name>.mask.png` per kit file;
   * the companion frames;
   * `import.json`: the delivery's, without the per-file grid and offset settings keyify has applied, plus a
     `keyify` note with the look, the mapping and each source's sha256;
   * `PROVENANCE.md`;
   * `keyify.json`, the report.

   The same inputs give the same bytes.

```
node tools/harmony_keyify.mjs art/harmony/incoming/<batch> <out> [--look=<look.json>] [--masks=<dir>] [--values=range|reference]
                              [--sample=refs/<master>.png [--sample-mask=refs/<master>.mask.png]] [--report] [--force]
node tools/harmony_import.mjs <out> --suggest
```

A committed source batch delivered in real colours stays in `art/harmony/source/<batch>/` exactly as delivered, and
regeneration runs both steps: keyify into a scratch folder, then the importer from it.

**The report** (`--report`, `<outDir>/keyify_report/`):

* **Round trip.** Every converted material pixel is recoloured back to the reference ramps by the runtime's own
  per-pixel recolour (`rowOf` / `recolourPx`) and compared with the input: ΔE in OKLab per material (mean, p95, max),
  pixels changed, and pixels over 0.02.
* **Import proof.** The importer runs on the result, then `--verify`.
* **The bust.** The converted kit is installed in the runtime and assembled in the game look and 7 more looks: skins
  0–6, white, black, teal, gold, plum and grey hair, and light, dark and vivid cloth. Beside them is the input
  assembled unrecoloured by the same code, with their ΔE.
* **The value floor (§5.4).** Neighbouring painted values are checked on every supported target ramp: the smallest
  ΔE, and pairs apart when painted that fall under 0.02 somewhere.
* **Sheets.** `files.png` shows, per layer, the input, the key layer, the mask over the input, the round trip, a ΔE map
  and the flagged pixels (unresolved, clamped, colliding, foreign, gamut-clipped, merged, decided by neighbours, kept in
  key colours). `looks.png` shows the busts. `report.json` holds everything.

**Measured on the synthetic kits** (`node tools/harmony_keyify_proof.mjs` → `docs/screenshots/harmony/keyify/`, every
image SYNTHETIC; `tests/unit/harmony_keyify.test.mjs` checks the same bounds). The kits were recoloured into look A by
the runtime, keyified, imported, and recoloured into the 8 looks. They were compared with the same looks painted from
the original key kits over 38,232 bust pixels:

| Kit, mapping | ΔE mean | p95 | max | > 0.02 | Notes |
|---|---|---|---|---|---|
| sample (5 shades), `reference` | 0.0002 | 0.0031 | 0.0062 | 0 | 8-bit rounding twice; bound 0.01 |
| sample, `range` (default) | 0.0013 | 0.0033 | 0.0973 | 792 | all in the trim and headband: the sample paints them without their lightest shade, so `range` stretches s0…s3 to s0…s4 (reported) |
| rich (9–11 values, jitter, rim and warm lights), `reference` | 0.0008 | 0.0032 | 0.518 | 8 | 19 pixels reported (masks painted over them, 25 after re-runs); 510 decided by neighbours; 333 residuals clamped; the 8 are one trim value per look that look A's dark teal puts within 24 of the ink |
| sample, `range`, look sampled from a style master and its mask | 0.0028 | 0.0059 | 0.488 | 1,089 | 7 pixels reported. The master's fixed colours are one list for every layer, so the flower's palest petal stays fixed beside a near-white fixed colour. The master shows the trim's darkest value on 1 pixel (the strap and the arm cover the rest), so its 43 pixels in the torsos are read as a fixed colour |

Round trip on the sample (`range`): skin, hair, cloth main and the flower come back exactly (anchor shades). The trim's
mean is 0.052 and the headband's 0.040, both from the stretch. Value floor: no pair of painted values falls under 0.02
on any of the 63 targets.

**Limits** (what the painter must still get right):

* **Palette match.** The default reference ramps are the game's look A. A painter whose look A differs, for example a
  pinker skin, a greener trim or another auburn, is classified against the wrong colours. Give the style master and
  its mask (`--sample`), or edit the look file. `--sample` keeps the base look's value scale, since a master shows
  colours, not where each sits among the shade steps.
* **Colour alone cannot separate materials that look alike in real colours.** Those pixels are decided by their
  neighbours or reported, never guessed silently, but a neighbour decision can be wrong at a boundary: check the
  flagged sheet, and settle with masks.
* **`range` trusts the painted extremes.** A few misread extreme pixels move a whole material's mapping. A stray
  near-white or near-ink value does the same. Read the stretch warnings.
* **The palette difference is discarded.** Hue and chroma offsets from the reference beyond the tolerance are
  clamped, so a look A whose palette differs from the reference by more than 12° or 16 % loses that difference in every
  look, look A included. The round trip shows it.
* **Not covered.** Partial alpha, anti-aliased edges and colour profiles are refused or ignored, as the importer
  refuses or ignores them. Alignment is the importer's (`--suggest`).
* **Untested on painted art.** Every number above is synthetic. Batch 1a's real-colour layers are the first real test.
  Re-run with their style master and read the report before importing.

## 6. Layer order and transforms

Player bust, back to front (`PC_SLOTS`):

| # | Slot | Files | Group |
|---|---|---|---|
| 1 | acc_back | acc_cape_back | torso |
| 2 | hair_back | pc_hair_<style>_back — all hair behind the head and shoulders | head |
| 3 | acc_ear_far | acc_earrings_far (peeks under the jaw, behind the head) | head |
| 4 | torso | pc_torso_<shape> (with the hanging arm) | torso |
| 5 | acc_chest | satchel, atlas_sash, bell, atlas_pin, cape_front (in this order: straps lie on the torso) | torso |
| 6 | acc_neck | acc_scarf / acc_scarf_knit | torso |
| 7 | head | pc_head_<expr> (ears, neck, face, brows) | head |
| 8 | glasses | acc_glasses | head |
| 9 | hair_front | pc_hair_<style>_front[_swing] — crown, fringe, side locks, locks in front of the shoulders | head |
| 10 | acc_head | hat, cap, headband, ribbon, flower, leaf, atlas_quill (in this order) | head |
| 11 | acc_ear_near | acc_earrings_near (at the near ear's lobe, over the hair) | head |
| 12 | arm | pc_arm_<pose>_<sleeve> (sleeve, hand and brush in one layer: the sleeve behind the hand) | torso |

Pose-dependent occlusion:

* **A hand crossing the face:** the arm is last by default, so a raised hand covers the face and glasses.
* **A hand behind something:** `pc.armSlot[pose]` puts the arm under `acc_head`, `hair_front`, `head` or `torso`.
* **Fringe and glasses:** the fringe is drawn over the glasses; list a hairstyle in `pc.glassesOver` to draw
  the glasses over its fringe.
* **Earrings** hang at their attachment points: the far one behind the head and torso, the near one over the hair.
* **Straps** (satchel, sash) are on the torso; **rear hair** is behind the shoulders, locks that fall in front
  belong to the front file.
* **Hats and caps** hide every hair pixel above their band line (`pc.hatBand.<hat|cap>` plus the hairstyle's
  attachment offset); the painted hat must cover the bald scalp above that line (the validator checks it).

**Transforms (the only ones):** whole-pixel translation of the head group and the torso group per state
(`pc.groups.<state>.head|torso = [dx, dy]`), of hair-mounted accessories per hairstyle (`pc.attach.<style>.<acc>`),
and of a whole bust inside the pair (`offset`). No rotation, scaling, mirroring, blending or resampling of pixel art;
anything else is new drawing. Companion frames are used exactly as delivered. (Reduced motion's cross-fade blends two
whole compositions on the overlay's canvas; it never touches the art.)

## 7. The game's side

* **Embedding:** `node tools/build.mjs` embeds `assets/harmony/manifest.json` and every PNG it lists (base64) into
  `index.html` when the manifest exists; without it the build is unchanged apart from the loader code. No fetch.
* **Install:** `RB.harmonyRaster.install({ manifest, files })` (the build's embedded set installs itself);
  `validateManifest` must pass and `contractVersion` must be 3 (or 2: a v2 manifest's kit pixels are exact anchor
  shades and are recoloured exactly as in v2), or nothing is installed (`RB.harmonyArt.stats().raster.error`).
* **Decode:** `RB.harmonyArt.prepare(spec, { async: true })` decodes only the files the companion's states and the
  look need (`createImageBitmap`, no premultiplication or colour conversion), then builds the compositions in idle
  slices. `compose()` never waits: a bust whose files are not decoded yet draws its code version for that call.
* **Recolour cost:** each painted colour is decomposed once per material (memoised, cap 32,768) and rebuilt once per
  look ramp (memoised per ramp); no per-pixel value channel is stored (measured, §10: recomputing from colour costs
  nothing measurable; a value channel would add a PNG per kit file to decode).
* **Whole-bust fallback:** a bust is painted only when every file it needs for that state and look exists and is
  decoded; otherwise the **whole** bust is the code drawing, placed at the neck pit (`stats().raster.fallbacks`).
* **Caches:** busts 24, compositions 16, footprints 16, decoded files 48, decompositions 32,768. Keys carry
  `ART_VERSION`, the contract version, the manifest's `artVersion`, the companion, the state, the variant,
  painted/code for each bust and the resolved look; `equip:change` drops the player's stale entries,
  `campaign:changing` clears everything.
* **API** (unchanged meaning): `compose`, `bust`, `prepare`, `fitScale`, `NATIVE` (`standard` 352 × 160 and
  `compact` 248 × 128 while painted art is installed), `COMPANIONS`, `stats`, `clear`, `invalidate`, `keyOf`,
  `PHASES`, `timeline(comp)`; new: `footprint(spec)`, `approval()`.

## 8. The manifest and the batch settings

`assets/harmony/manifest.json` (written by the importer; `RB.harmonyContract.validateManifest` is the schema):

```json
{
  "schema": "rbn-harmony-manifest",
  "contractVersion": 3,
  "artVersion": 1,
  "set": "batch1a",
  "synthetic": false,
  "source": { "importer": "tools/harmony_import.mjs", "registry": { "contractVersion": 3, "assetKeysSha256": "…" },
              "sets": ["batch1a"], "provenance": { "batch1a": { "file": "provenance/batch1a.md", "sha256": "…" } } },
  "files": {
    "suzu_peak": {
      "png": "suzu_peak.png", "w": 192, "h": 160, "kind": "comp", "sha256": "…", "bytes": 9124,
      "mask": null, "maskSource": "none", "bbox": [14, 9, 181, 160], "materials": { "fixed": 11873 },
      "import": { "set": "batch1a", "source": "suzu_peak.png", "sourceSha256": "…", "srcW": 768, "srcH": 640, "cell": [4, 4], "origin": [0, 0], "offset": [0, 0] }
    },
    "pc_head_focus": {
      "png": "pc_head_focus.png", "w": 192, "h": 160, "kind": "head", "sha256": "…", "bytes": 3010,
      "mask": "pc_head_focus.mask.png", "maskSource": "derived", "maskSha256": "…",
      "bbox": [74, 63, 120, 147], "materials": { "skin": 1490, "hair": 40, "fixed": 310 }, "import": { "…": "…" }
    }
  },
  "companions": {
    "suzu": { "mode": "flat", "states": ["prep_a", "prep_b", "cue", "peak", "settle_b"], "layers": null, "fx": ["peak"],
              "face": { "peak": [74, 52, 124, 104] }, "timeline": null, "offset": { "standard": [0, 0], "compact": [0, 0] },
              "approval": "candidate" }
  },
  "pc": {
    "face": { "focus": [68, 52, 118, 104] }, "groups": { "prep_b": { "head": [0, -1], "torso": [0, 0] } },
    "attach": { "curly": { "flower": [1, -3] } }, "hatBand": { "hat": 46, "cap": 46 }, "armSlot": { "prep_a": "front" },
    "glassesOver": [], "offset": { "standard": [0, 0], "compact": [0, 0] }, "approval": "candidate"
  },
  "coverage": { "required": 86, "present": 18, "missingRequired": ["…"] },
  "batches": { "1a": { "phase": 1, "required": 18, "present": 18, "missingRequired": [], "optionalPresent": ["suzu_prep_b"], "complete": true }, "1b": { "…": "…" } }
}
```

v3 requires an `approval` on every companion entry and on `pc` (§12): one of `provisional`, `candidate`, `approved`,
`verified` — or `synthetic`, exactly when the set is synthetic. The registry is named by its asset keys only, so a
later build regenerates the same manifest.

`<batch>/import.json` (optional; everything has a default) — the same `companions` and `pc` blocks, plus:

```json
{
  "set": "batch1a", "batch": "1a", "approval": "candidate", "synthetic": false, "artVersion": 1,
  "files": { "suzu_peak": { "offset": [0, -16], "cell": 5.3333, "origin": [0, 85.33], "background": "magenta" } },
  "companions": { "suzu": { "layers": ["body", "hand", "fx"], "approval": "approved" } },
  "pc": { "approval": "candidate" }
}
```

A batch that delivers a companion's frames sets that pairing's approval (and one that delivers kit files, the kit's)
to the batch's `approval` (default `candidate`) unless it names one per pairing or for `pc`; what it does not deliver
keeps its approval. `offset` places the downsampled image on the 192 × 160 canvas (default: centred); `cell`/`origin`
override grid detection; `background: "magenta"` keys out a flat #ff00ff. Later batches add or replace files
unless the first is imported with `--replace`.

## 9. Import, validation and regeneration

```
node tools/harmony_import.mjs <inDir> [<inDir> …] [--set <name>] [--out assets/harmony] [--check] [--replace] [--suggest]
node tools/harmony_import.mjs --verify assets/harmony
```

1. **Grid:** a file that is an exact whole multiple of 192 × 160 is tried at that multiple first (1: native).
   Otherwise, along each axis: the edge weight at every pixel boundary (colours more than 40 apart), for each
   candidate cell size from 1.5 to 24 px the phase that puts most edge weight near a grid line, scored against
   chance; the **largest** size scoring within 10 % of the best wins, refined by least squares. Pixels are square.
   Non-integer sizes work (1024 / 192 found as 5.3334). Override with `cell` and `origin`.
2. **Downsample:** each cell's centre region (the middle half), majority colour; with no repeated colour (noise),
   the per-channel median.
3. **Alpha:** binarised at 128; a flat `#ff00ff` background keyed out; **painted checkerboards rejected** (§2).
4. **Palette:** outline ink within 24 (sRGB) snapped to #140c18. Kit colours are kept as painted (v3).
5. **Masks** (§5.2): derived or read; supplied masks are checked against the file and the families.
6. **Align:** the per-file `offset` (from `import.json`). `--suggest` matches each file's silhouette against a
   reference over ±24 px and reports the best offset; it never applies it by itself.
7. **Write** the 192 × 160 PNGs, masks, `provenance/<set>.md` and `manifest.json` (not with `--check`).
8. **Report:** `report/report.json` (per file: source size, grid, offset and suggestion, alpha, materials and their
   painted values, unresolved pixels, hashes; per set: names not in the contract, missing keys, companion and kit
   completeness, batch coverage, approval) and `report/contact.png`. A synthetic set is labelled SYNTHETIC SAMPLE —
   not art on every sheet.

**Several batches** are imported in the order given, each merged over the ones before (the first replaces the
output with `--replace`). **Regeneration is byte for byte**: the same sources, contract and registry asset keys give
the same bytes in `assets/harmony/` (PNGs, masks, manifest, provenance, report) — nothing records the time, the
build or the machine (tested: the synthetic sample with a provenance note, then the rich fixture over it, imported
twice — every file of the output identical). A folder
under `art/harmony/source/` without `PROVENANCE.md` is refused.

Exit status: 0 when every file imports; 1 on any error (bad name, size, interlacing, a checkerboard, unresolved
pixels, a fixed pixel in an anchor shade, a supplied mask marking a colour outside its family, a missing provenance
note, an invalid manifest). Missing keys are reported, not errors (batches are partial). `--verify` re-checks a
normalised folder: schema, hashes, sizes, masks against pixels (material pixels within outer of their family, never
outline or highlight), anchor shades on fixed pixels, hat cover.

## 10. Budgets

Measured by `node tests/e2e/harmony_raster.mjs --sheets` (written to `docs/harmony/contract/budgets.json`):
Playwright, headless Chromium with a software canvas, 1920 × 1080, DPR 1, a shared 4-core Linux machine with other
browser tests running — not a physical device, not a phone. Painted figures: Suzu + look A or B, every state the
timeline shows, standard and compact (what the overlay prepares for one cut-in), on the sample (five anchor shades
per family) and on the rich fixture over it (9–11 values per family).

**Time**

| | Code-drawn busts | Painted, sample | Painted, rich fixture |
|---|---|---|---|
| Cold pairing (both busts + composition + ink backing) | 71–82 ms | 66–83 ms | 64–69 ms |
| A further state, nothing cached but the backing | — | 3.5 ms | 2.9–3.2 ms |
| One bust from decoded files (recolour + assemble) | — | mean 1.2–1.4 ms, max 9.1 | mean 1.1 ms, max 7.7 |
| Decoding a pairing's and look's files (19–22 PNGs, async) | — | mean 81–84 ms per batch, max 159 | mean 85–89 ms, max 159 |
| Everything for one cut-in (`prepare({ async: true })`) | 257 ms for both phases × variants | 378–471 ms wall, in idle slices | 300–404 ms wall |
| Recolouring work (rich) | | | 953 colours decomposed; 2,417 (A) / 3,334 (B) rebuilt; 1–2 gamut-clipped |
| Warm (cached) composition | ≤ 0.1 ms | ≤ 0.1 ms | ≤ 0.1 ms |

(The decode and prepare times are higher than v2's measurement on the same kind of machine; they vary with the
machine's load from other workers' browser tests, and the code path for decoding is unchanged.)

**Decoded memory** (uncompressed surfaces: w × h × 4 bytes; the kit adds 1 byte per pixel of material codes)

| | Code-drawn busts | Painted path |
|---|---|---|
| One decoded file | — | 122,880 B (companion) / 153,600 B (kit file with codes) |
| One pairing and look, every state and both variants | 8 busts + 4 compositions = 1.18 MiB | look A: 3.19 MB decoded (22 files) + caches = **7.91 MiB peak**; look B (19 files): 7.47 MiB — the same for both fixtures |
| Recolour memo | — | ≤ 32,768 decompositions + ≤ 8,192 colours per look ramp (16 looks), a few hundred KiB at most |
| Bound at the caches' caps | ≈ 5.8 MiB | ≈ 17 MiB (as in v2) |

**Encoded size** (embedded as base64, +33 %)

| | Bytes |
|---|---|
| The sample: 31 files + 25 masks (56 PNGs) | 57,327 B → 75 KiB embedded |
| The rich fixture over the sample (56 PNGs) | 98,500 B → 128 KiB embedded (+72 %: many values compress less than five) |
| A full delivery at the mockup's density (projected, as in v2) | **0.70 MiB → ≈ 0.94 MiB embedded** |

The projection measured the owner's mockup at its own pixel grid (in a scratch folder; the image is never copied into
the project), so it already reflects many values per material. An estimate, not a measurement of delivered art:
re-measure on Batch 1a. **Budget policy:** no new hard limit; decoding never runs when a technique fires.

## 11. Tests and evidence

| Command | What it checks |
|---|---|
| `node tests/run-unit.mjs harmony_png` | the codec |
| `node tests/run-unit.mjs harmony_import` | grid detection, downsampling, family derivation (free values kept, thresholds, the foreign rule), supplied masks against the family, checkerboards (pure, noisy, under art, padded), the sample's import and `--verify`, the rich fixture against its ground truth (every pixel's material, every colour kept), byte-for-byte regeneration of two batches, provenance, approval, the batches |
| `node tests/run-unit.mjs harmony_raster` | timeline fractions, painted compositions, the footprint and its scale, approval, the rich fixture's values kept apart on dark and pale looks, exact anchor shades = v2's tones on unopened ramps, recolouring discipline, whole-bust fallback, registry coverage, manifest schema, the code path after uninstall |
| `node tests/run-unit.mjs harmony_timing` | the overlay's timeline playback, reduced motion's two held poses and its ≤ 120 ms cross-fade, the code busts' single held drawing |
| `node tools/harmony_calibrate.mjs` | the thresholds against both fixtures: 0 errors and the stated headroom |
| `node tools/harmony_recolour_proof.mjs` | value floor on 63 targets, exact anchors, the residual sweep; writes the proof sheets |
| `node tests/run-unit.mjs harmony_keyify` | the keyify step (§5.5): the default look file is the game's ramps; the synthetic sample and rich fixture recoloured into look A, converted (enlarged, magenta, 1024-square layers; partial masks), imported, verified and recoloured into 8 looks against the original kits; range vs reference; materials against the ground truth; reported, unwritten and mask-settled pixels; collisions; checkerboards; `--sample`; determinism |
| `node tools/harmony_keyify_proof.mjs` | the same measurements as evidence: `docs/screenshots/harmony/keyify/` (files.png, looks.png, report.json, proof.json) |
| `node tests/e2e/harmony_raster.mjs [--sheets]` | the painted path in the built game (both fixtures), the footprint scale, approval, the embedded build, no network; `--sheets` writes the evidence and the budgets |
| `node tests/e2e/harmony_cutin.mjs painted [--painted-docs]` | the painted overlay: timeline, reduced motion (held poses, cross-fade, no travel), and every geometry viewport plus 2048 × 1046 and 1920 × 1080 with the sample and the rich fixture (scale, faces in CSS px, nothing within 12 px of a protected rectangle, nothing shown over a withdrawn menu still leaving); the sample with the template's face boxes at 1366, 1440, 1600 and 2048 wide (the pair with the larger faces is shown) |
| `node tests/run-unit.mjs harmony_art`, `node tests/e2e/harmony_art.mjs` | the code-drawn busts, unchanged |

Evidence (every image labelled SYNTHETIC SAMPLE — not art): `docs/screenshots/harmony/recolour_v3/` (the rich
fixture recoloured into every skin, hair colour, cloth palette and accessory channel; `proof.json`),
`docs/screenshots/harmony/raster_sample/` (both batch looks across the states, recolouring, masks, fallback, the
import report), `docs/screenshots/harmony/cutin/painted_v3.json` (scales and face sizes per viewport),
`docs/harmony/contract/calibration.json`, `docs/harmony/contract/budgets.json`.

## 12. Approval states

| State | Label (dev viewer and stats) | Meaning |
|---|---|---|
| `provisional` | provisional artwork | the code-drawn busts (every companion without a complete painted set, the kit without painted files) |
| `candidate` | visual candidate awaiting approval | delivered and imported, not yet accepted by the owner |
| `approved` | approved visual direction | the owner accepted the art (Phase 1: the quality bar for everything after it) |
| `verified` | integrated and verified | approved, integrated and checked in the game by the tests and by hand |
| `synthetic` | synthetic sample — not art | the synthetic fixtures |

`RB.harmonyArt.approval()` and `stats().approval` (and `stats().raster.approval` for the installed manifest) report
them; the `?dev=harmony` panel shows them. They are never shown to players.
