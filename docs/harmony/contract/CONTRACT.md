# Harmony painted art — the machine contract (version 2)

**What this is.** The exact, checkable contract for the painted Harmony busts: what files the art comes in,
how they are named, sized, aligned, layered and masked, how the game imports, assembles, recolours, times and
caches them, and how a delivery is validated. It is the authority on formats. The artist-facing brief
(`docs/harmony/ASSET_BRIEF.md`) explains the same contract to people and must agree with it.

**Single sources of truth.**

| What | Where |
|---|---|
| Geometry, states, timeline, names, layer slots, accessories, mask colours, key ramps, thresholds, manifest schema | `src/ui/88_harmony_contract.js` (`RB.harmonyContract`; the importer loads the same file in node) |
| Everything the game knows about appearance (hairstyles, cuts, accessories, keepsakes, palettes, channels, companions) and the asset keys the contract implies | `docs/harmony/contract/registry.json`, from `node tools/harmony_registry.mjs` (reads the built `index.html`) |
| Import, normalisation, masks, report | `tools/harmony_import.mjs` (+ `tools/harmony/*.mjs`) |
| Runtime: decode, assemble, recolour, cache, timeline | `src/ui/88_harmony_raster.js` behind `RB.harmonyArt` (`src/ui/88_harmony_art.js`) |
| A working synthetic sample | `tests/fixtures/harmony_sample/` (SYNTHETIC SAMPLE — not art) |

Everything below is in **art px** (one pixel of the pixel-art grid) unless it says CSS px.

---

## 1. Folders and file names

```
art/harmony/incoming/<batch>/        as delivered (any enlargement); NOT committed unless the lead says so
  <name>.png                         one file per asset key (below)
  <name>.mask.png                    optional hand-made mask (overrides the derived one)
  import.json                        optional batch settings (§8)
assets/harmony/                      normalised by the importer; embedded by the build
  manifest.json                      §8
  <name>.png, <name>.mask.png        192 × 160, native grid
  PROVENANCE.md                      the owner's rights note for the delivery
  report/report.json, report/contact.png, report/masks.png
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
asset keys (86 required, 33 optional for the current registry) is `assetKeys` in `registry.json`.

## 2. The PNG format

* PNG, **RGBA 8-bit, straight (not premultiplied) alpha, sRGB, no matte**, hard pixel edges. The importer also
  reads RGB, greyscale, grey + alpha and palette PNGs (1/2/4/8-bit), and 16-bit (reduced to 8). Interlaced
  (Adam7) PNGs are refused with a clear error; re-save without interlacing.
* No colour profile is applied (`iCCP`, `gAMA`, `cHRM` are ignored; pixels are taken as sRGB).
* Transparency: alpha below 128 is transparent, at or above 128 opaque (the importer binarises it). There is
  no partial alpha anywhere: glasses' lenses are left transparent (the eyes show through), with any glint or
  rim painted as opaque pixels; glows and soft shadows are drawn as opaque pixel clusters or left to the game.
  A file with no transparency is accepted only if its background is one flat `#ff00ff` (keyed out
  automatically when all four corners are that magenta, or always with `background: "magenta"`). A painted
  checkerboard "transparency" is rejected.
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

**Changed from the brief's numbers, and why.** The player's band edge is (0, 151) → (192, 145), not
(0, 156) → (192, 150): the band's lower edge is one straight line across the whole pair (§3.2), and at the
player's canvas (x 160–352) that line runs 5 px higher. The other anchors are as given. The face box gives
faces of 52 CSS px at 1× and 104 at 2× (the code-drawn busts: 33 art px tall).

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

### 3.3 Display (CSS px)

`RB.harmonyArt.fitScale(viewW, viewH, variant[, dpr])` — standard: the largest **integer** scale inside the
addendum's §5.2 limits (42 % of the width, 30 % of the height, 12 % of the area); compact: the largest
**DPR-aware** scale (CSS px per art px whose product with `devicePixelRatio` is a whole number, so each art
pixel is a whole number of device pixels), up to the view's width and 27 % of its height.

| View (CSS px, DPR) | Standard | Footprint | Faces (CSS px) | Compact | Footprint | Faces |
|---|---|---|---|---|---|---|
| 1280 × 720, 1 | 1× | 352 × 160 (27.5 % × 22.2 %) | 52 | 1× | 248 × 128 | 52 |
| 1366 × 768, 1 | 1× | 352 × 160 | 52 | 1× | 248 × 128 | 52 |
| 1440 × 900, 1 | 1× | 352 × 160 | 52 | 1× | 248 × 128 | 52 |
| 1600 × 900, 1 | 1× | 352 × 160 (22 % × 17.8 %) | 52 | 1× | 248 × 128 | 52 |
| 1680 × 1050, 1 | 1× | 352 × 160 | 52 | 2× | 496 × 256 | 104 |
| 1920 × 1080, 1 | 2× | 704 × 320 (36.7 % × 29.6 %) | 104 | 2× | 496 × 256 | 104 |
| 2560 × 1440, 1 | 2× | 704 × 320 | 104 | 3× | 744 × 384 | 156 |
| 768 × 1024, 2 (tablet) | — | | | 2× | 496 × 256 | 104 |
| 844 × 390, 3 (phone, landscape) | — | | | 0.67× | 165 × 85 | 35 |
| 390 × 844, 3 | — | | | 1.33× | 331 × 171 | 69 |
| 412 × 915, 2.625 | — | | | 1.52× | 378 × 195 | 79 |
| 360 × 800, 3 | — | | | 1.33× | 331 × 171 | 69 |
| 375 × 667, 2 | — | | | 1× | 248 × 128 | 52 |
| 320 × 640, 2 | — | | | 1× | 248 × 128 | 52 |

**Against the fixed decisions:** 2× needs at least 1677 × 1067 CSS px under §5.2 (704 px must be ≤ 42 % of
the width and 320 ≤ 30 % of the height), so 1600–1676-wide and 1680 × 1050 views get 1×, not 2×. Phones
below 360 CSS px wide at DPR 2, and short ones (375 × 667), get faces of 52 CSS px, not ≥ 64: the 27 % height
cap and the two faces side by side leave no larger whole-device-pixel scale. Which pair the overlay shows is
its decision (src/ui/82d_harmony_cutin.js; it reads only `NATIVE`, `fitScale` and the composed size).

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

The character's left is the player's **near** side in contract v2 (screen right): the flower, leaf, ribbon
and quill are on the visible side of the player's head; in the code-drawn busts (turned right) they were on
the far side. The registry's `codeBust` entries record how 88_harmony_acc.js draws each one (layers changed
and screen side), from a pixel diff. Same-place rule: a hat or cap keepsake replaces the other
(`RB.equip.SAME_PLACE`). Charms and tools are never drawn (`registry.statisticalItems`).

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
  `RB.battleSeq.T.cutin`). Instant shows nothing. Reduced motion shows `settle_b` alone.
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

The sleeve follows the cut: **wide for the robe only**; fitted for tunic, coat, apron and dress (the road
sprites flare only the robe's sleeve, `src/engine/32_spriteart.js` armsFB; the dress's puffed sleeve heads
belong to its torso). Companion performances: Nao — Read the Opening (a directional hand cue); Mio —
Clearwater Draught (lifts the vial); Ren — Lantern Ward (raises the lamp); Suzu — Curtain Call (a theatrical
flourish, then one wink and one glint). Names from `RB.combat.TECHS`.

## 5. Masks and recolouring

**Companions are fixed identity: never recoloured, no masks.** Each player-kit file has a mask: the derived one
(written by the importer) or a supplied `<name>.mask.png`, which always wins.

| Material | Mask colour | Feeds from the look | Target ramp (built as the code busts build it) | Steps used |
|---|---|---|---|---|
| skin | #ff0000 | skin | `skinMat(colorsOf(look).skin)` (6 tones) | 0, 1, 2, 4, 5 |
| hair | #00ff00 | hairColor | `hairMat(colorsOf(look).hair)` | 1–5 |
| clothMain | #0000ff | outfit / cloth | `clothMat(cloth[0])` | 1–5 |
| clothTrim | #ffff00 | outfit / cloth (the wrap: wrapCol) | `clothMat(cloth[2], { step: 0.09 })`; the wrap `clothMat(wrapCol ‖ cloth[2])` | 1–5 |
| accessory | #ff00ff | the accessory's field (§3.4) | `M(name, colour, opts)` as in 88_harmony_acc.js; earrings without earCol: `metalMat('#e0b850')` | 1–5 (6 tones) or 0–4 (5) |
| fixed | #000000 | — | keeps its painted colour | |
| transparent | alpha 0 | | | |

* Every material pixel has a **shade index 0–4**: its luminance (0.299 R + 0.587 G + 0.114 B) nearest to one
  of that material's five key shades. At runtime shade *s* becomes `targetRamp[material][s]`.
* **Key ramps** (paint the kit's recolourable parts in these, darkest → lightest):

  | Material | s0 | s1 | s2 | s3 | s4 |
  |---|---|---|---|---|---|
  | skin (key) | #601c00 | #943c08 | #d06018 | #f48c40 | #ffc0a0 |
  | hair | #3c0a5c | #5a1470 | #8a24a0 | #b848c8 | #e088ec |
  | clothMain | #0c3a14 | #1a6428 | #2e8c3c | #52b45a | #8ad88a |
  | clothTrim | #004e60 | #12687a | #22a0b4 | #5ccce0 | #a8f0f8 |
  | accessory | #10164a | #222e8a | #3a4cc8 | #6a80ec | #a8b8ff |

  **Changed from the brief (all measured):**
  * The skin key is an unnatural orange. The brief's natural one (#6e3e2a … #f2d0a8, kept as `KEY_SKIN_V1`)
    is skin palette 2's own ramp — a recoloured skin-2 player would contain key colours, so "no key colour
    survives" could not be checked — and it lies within 40 of 28 of the code's own face colours (the default
    iris #7a4630 at 15.6, a mouth at 11.1, a blush at 10.3), which a mask derived by colour cannot tell from
    skin. The orange key is within 40 of 5 of them (none within the snap radius), ≥ 91 from every other key
    ramp and ≥ 19 from every real skin colour.
  * The darkest hair and trim shades are more saturated (#3c0a5c, #004e60; brief: #2a0a3a, #0a3a44, kept as
    `KEY_V1`). The brief's sat within 40 of the near-blacks every kit file holds: on the sample, lashes
    (#2b1a20 at 30.5, #341c1c at 36.4) and the brush lacquer (#24203a at 38.1, #262248 at 37.1) were
    unresolved; after the change the sample imports with none.
  * Measured on the final ramps: every two key shades ≥ 37.4 apart (≥ 3 × the snap radius), every key shade
    ≥ 46.9 from the outline ink, each ramp strictly rising in luminance (the shade index is luminance order).
* **Derivation** (importer, per file; only the materials the file kind allows): heads skin + hair (brows,
  stubble); torsos clothMain + clothTrim + skin; arms skin + clothMain + clothTrim; hair hair + clothTrim (ties,
  the wrap); accessories accessory. For each opaque pixel, in order: within 24 of #140c18 (outline ink) or
  of #ffffff / #f6f2ee (highlights, eye whites) → **fixed**; within **12** (Euclidean, sRGB 0–255) of an
  allowed key shade → that material and shade (the pixel is snapped to the exact key colour); farther than
  **40** from every allowed key shade → **fixed**; otherwise **unresolved** — the import fails and the report
  lists each pixel. Blush and lips painted in skin key shades recolour with the skin.
* **Never recoloured:** fixed pixels, outline ink, near-white highlights and eye whites, glasses, every
  companion pixel — enforced again at runtime (a supplied mask cannot recolour an outline or a highlight).
* A fixed pixel may not be exactly a key colour (the importer refuses it), so a recoloured output never
  contains a key colour.

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
  the glasses over its fringe (a fringe swept beside the glasses needs nothing: they do not overlap).
* **Earrings** hang at their attachment points: the far one behind the head and torso, the near one over the
  hair.
* **Straps** (satchel, sash) are on the torso; **rear hair** is behind the shoulders, locks that fall in front
  belong to the front file.
* **Hats and caps** hide every hair pixel above their band line (`pc.hatBand.<hat|cap>`, a row, plus the
  hairstyle's attachment offset); the painted hat must cover the bald scalp above that line (the validator
  checks it on every head expression).

**Transforms (the only ones):** whole-pixel translation of the head group and the torso group per state
(`pc.groups.<state>.head|torso = [dx, dy]`), of hair-mounted accessories per hairstyle (`pc.attach.<style>.<acc>`),
and of a whole bust inside the pair (`offset`). No rotation, scaling, mirroring, blending or resampling of
pixel art; anything else is new drawing. Companion frames are used exactly as delivered.

## 7. The game's side

* **Embedding:** `node tools/build.mjs` embeds `assets/harmony/manifest.json` and every PNG it lists (base64)
  into `index.html` when the manifest exists, and prints the size; without it the build is unchanged apart
  from the loader code. No fetch, no network.
* **Install:** `RB.harmonyRaster.install({ manifest, files })` (the build's embedded set installs itself);
  `validateManifest` must pass and `contractVersion` must be 2, or nothing is installed (reported in
  `RB.harmonyArt.stats().raster.error`).
* **Decode:** `RB.harmonyArt.prepare(spec, { async: true })` decodes only the files the companion's states and
  the look need (`createImageBitmap` with no premultiplication or colour conversion, else an `Image`), then
  builds the compositions in idle slices. `compose()` never waits: a bust whose files are not decoded yet
  draws its code version for that call and decoding starts.
* **Whole-bust fallback:** a bust is painted only when every file it needs for that state and look exists and
  is decoded; otherwise the **whole** bust is the code drawing (never painted and code parts in one bust),
  placed at the neck pit. Recorded in `stats().raster.fallbacks` with the missing files.
* **Caches:** the existing LRU caches (busts 24, compositions 16). Keys carry `ART_VERSION`, the contract
  version, the manifest's `artVersion`, the companion, the state, the variant, painted/code for each bust and
  the resolved look; `equip:change` drops the player's stale entries, `campaign:changing` clears everything.
  Decoded files: their own LRU (cap 48 files).
* **API** (unchanged meaning): `compose`, `bust`, `prepare`, `fitScale`, `NATIVE` (`standard` 352 × 160 and
  `compact` 248 × 128 while painted art is installed), `COMPANIONS`, `stats`, `clear`, `invalidate`, `keyOf`;
  plus `PHASES` and `timeline(comp)`.

## 8. The manifest and the batch settings

`assets/harmony/manifest.json` (written by the importer; `RB.harmonyContract.validateManifest` is the schema):

```json
{
  "schema": "rbn-harmony-manifest",
  "contractVersion": 2,
  "artVersion": 1,
  "set": "batch1",
  "synthetic": false,
  "source": { "importer": "tools/harmony_import.mjs", "registry": { "sha256": "…", "indexHtml": "…" } },
  "files": {
    "suzu_peak": {
      "png": "suzu_peak.png", "w": 192, "h": 160, "kind": "comp", "sha256": "…", "bytes": 9124,
      "mask": null, "maskSource": "none", "bbox": [14, 9, 181, 160], "materials": { "fixed": 11873 },
      "import": { "source": "suzu_peak.png", "sourceSha256": "…", "srcW": 768, "srcH": 640, "cell": [4, 4], "origin": [0, 0], "offset": [0, 0] }
    },
    "pc_head_focus": {
      "png": "pc_head_focus.png", "w": 192, "h": 160, "kind": "head", "sha256": "…", "bytes": 3010,
      "mask": "pc_head_focus.mask.png", "maskSource": "derived", "maskSha256": "…",
      "bbox": [74, 63, 120, 147], "materials": { "skin": 1490, "hair": 40, "fixed": 310 }, "import": { "…": "…" }
    }
  },
  "companions": {
    "suzu": { "mode": "flat", "states": ["prep_a", "prep_b", "cue", "peak", "settle_b"], "layers": null, "fx": ["peak"],
              "face": { "peak": [74, 52, 124, 104] }, "timeline": null, "offset": { "standard": [0, 0], "compact": [0, 0] } }
  },
  "pc": {
    "face": { "focus": [68, 52, 118, 104] },
    "groups": { "prep_b": { "head": [0, -1], "torso": [0, 0] } },
    "attach": { "curly": { "flower": [1, -3] } },
    "hatBand": { "hat": 46, "cap": 46 },
    "armSlot": { "prep_a": "front" },
    "glassesOver": [],
    "offset": { "standard": [0, 0], "compact": [0, 0] }
  },
  "coverage": { "required": 86, "present": 31, "missingRequired": ["…"] }
}
```

`<batch>/import.json` (optional; everything has a default) — the same `companions` and `pc` blocks, plus:

```json
{
  "set": "batch1", "synthetic": false, "artVersion": 1,
  "files": { "suzu_peak": { "offset": [0, -16], "cell": 5.3333, "origin": [0, 85.33], "background": "magenta" } },
  "companions": { "suzu": { "layers": ["body", "hand", "fx"] } }
}
```

`offset` places the downsampled image on the 192 × 160 canvas (default: centred); `cell`/`origin` override grid
detection; `background: "magenta"` keys out a flat #ff00ff. The importer merges a batch into an existing
`assets/harmony/` (later batches add or replace files) unless given `--replace`.

## 9. Import and validation

```
node tools/harmony_import.mjs <inDir> [--set <name>] [--out assets/harmony] [--check] [--replace] [--suggest]
node tools/harmony_import.mjs --verify assets/harmony
```

1. **Grid:** a file that is an exact whole multiple of 192 × 160 is tried at that multiple first (1: native).
   Otherwise, along each axis: the edge weight at every pixel boundary (colours more than 40 apart, so a tool's
   noise inside a cell is ignored); for each candidate cell size from 1.5 to 24 px, in steps that drift at most
   0.2 px across the image, the phase that puts most edge weight within ±0.44 px of a grid line (±0.8 px from
   3 px cells up, so both halves of a blended cell edge count), scored against chance; the **largest** size
   scoring within 10 % of the best wins (a grid's halves and thirds fit the same edges), refined by least
   squares. Pixels are square: when the axes disagree, the larger size that fits both is used. Non-integer
   sizes work (1024 / 192 found as 5.3334). Override with `cell` and `origin`.
2. **Downsample:** each cell's centre region (the middle half), majority colour; with no repeated colour (noise),
   the per-channel median.
3. **Alpha:** binarised at 128; a flat `#ff00ff` background keyed out; checkerboards rejected.
4. **Palette:** outline ink within 24 snapped to #140c18; key shades within 12 snapped (kit files).
5. **Masks and shades** (§5): derived or read; supplied masks are checked against the file.
6. **Align:** the per-file `offset` (from `import.json`). `--suggest` matches each file's silhouette (inside the
   head box) against a reference — the same name already in `assets/harmony/`, else the kind's first file —
   over ±24 px and reports the best offset; it never applies it by itself.
7. **Write** the 192 × 160 PNGs, masks and `manifest.json` (not with `--check`).
8. **Report:** `report/report.json` (per file: source size, grid, offset and suggestion, alpha, materials,
   unresolved pixels, hashes; per set: names not in the contract, missing required keys, companion and kit
   completeness) and `report/contact.png` (every file at 2× over the template's guides, with its mask view).
   A set marked `synthetic` is labelled SYNTHETIC SAMPLE — not art on every sheet.

Exit status: 0 when every file imports; 1 on any error (bad name, size, interlacing, unresolved pixels, a
fixed pixel in a key colour, an invalid manifest). Missing keys are reported, not errors (batches are partial).
`--verify` re-checks a normalised folder: schema, hashes, sizes, masks against pixels, key colours, hat cover.

## 10. Budgets

Measured by `node tests/e2e/harmony_raster.mjs --sheets` (written to `docs/harmony/contract/budgets.json`):
Playwright, headless Chromium 141 with a software canvas, 1920 × 1080, DPR 1, a shared 4-core Linux machine — not
a physical device, not a phone. The painted figures use the SYNTHETIC sample (Suzu + look A or B, every state the
timeline shows, standard and compact: what the overlay prepares for one cut-in).

**Time**

| | Code-drawn busts (today) | Painted path (sample) |
|---|---|---|
| Cold pairing (both busts + composition + ink backing) | 62–95 ms | 62–82 ms (almost all of it the backing, rebuilt after `clear()`) |
| A further state, nothing cached but the backing | — (2 drawings only) | 2.7–3.5 ms |
| One bust from decoded files (recolour + assemble) | — | mean 1.0–1.2 ms, max 7.6 ms |
| Decoding a pairing's and look's files (19–21 PNGs, `createImageBitmap`, async) | — | mean 51 ms per batch, max 120 ms — off the learning task |
| Everything for one cut-in (`prepare({ async: true })`: decode, then idle slices) | 230 ms for both phases × variants | 236–326 ms wall time, in idle slices |
| Warm (cached) composition | ≤ 0.1 ms | ≤ 0.1 ms |

**Decoded memory** (uncompressed surfaces: w × h × 4 bytes; the player kit adds 1 byte per pixel of material codes)

| | Code-drawn busts | Painted path |
|---|---|---|
| One decoded file | — | 122,880 B (companion) / 153,600 B (kit file with codes) |
| One bust / one composition (layer + canvas) | 64,000 / 182,400 B | 122,880 / 450,560 B standard, 253,952 B compact |
| One pairing and look, every state and both variants | 8 busts + 4 compositions = 1.18 MiB | 3.04 MB decoded (21 files) + 10 busts + 10 compositions + 2 backings 5.10 MB = **7.77 MiB peak** (look B: 7.47 MiB) |
| Bound at the caches' caps (busts 24, compositions 16, decoded files 48) | ≈ 5.8 MiB | 2.9 + 7.2 + 7.4 + 0.35 MB ≈ **17 MiB** |

**Encoded size** (embedded as base64, +33 %; the game stays one offline file)

| | Bytes |
|---|---|
| The sample: 30 files + 24 masks | 56,287 B (55 KiB) → 94 KiB embedded |
| A full delivery at the sample's density (119 keys: 86 required + 33 optional, 95 masks) | 0.22 MiB |
| A full delivery at the mockup's density (projected) | **0.70 MiB → ≈ 0.94 MiB embedded** (index.html is 9.6 MiB today) |

The projection: the per-kind opaque area of the sample's files × 2.19 (the template's 50 × 52 face over the code
busts' 36 × 33) × 1.452 B per opaque pixel — the owner's mockup crop measured at its own pixel grid (2 px cells,
364 × 148, 1,343 colours) in a scratch folder (the image is never copied into the project) — plus the sample's mask
sizes. An estimate, not a measurement of delivered art: re-measure on Batch 1.

**Budget policy.** No new hard limit: the measured peak (≈ 8 MiB per pairing) and the cap bound (≈ 17 MiB) are
reported; if phones need less, lower the composition cap first (each painted composition is 450 KiB with its
canvas). Decoding never runs when a technique fires: the overlay prepares at the encounter's start.

## 11. Tests and evidence

| Command | What it checks |
|---|---|
| `node tests/run-unit.mjs harmony_png` | the codec: every colour type and filter, 16-bit, tRNS, iTXt, CRC, interlace refusal |
| `node tests/run-unit.mjs harmony_import` | grid detection (1×–6.4×, 1024 / 192, padding, noise), downsampling, masks and their refusals, supplied masks, whole files, the sample's import and `--verify` |
| `node tests/run-unit.mjs harmony_raster` | timeline fractions, painted compositions, recolouring discipline, no key colour in any output, shared colour logic, whole-bust fallback, invalidation, registry coverage, manifest schema, the code path after uninstall |
| `node tests/e2e/harmony_raster.mjs [--sheets]` | the same in the built game through `compose()`/`prepare()`, the equip event, the embedded build, no network; `--sheets` writes the evidence and the budgets |
| `node tests/run-unit.mjs harmony_art`, `node tests/e2e/harmony_art.mjs` | the code-drawn busts, unchanged |

Evidence (`docs/screenshots/harmony/raster_sample/`, every image labelled SYNTHETIC SAMPLE — not art):
`looks_states_1x.png` and `looks_states_2x.png` (both looks with Suzu across the six states, standard and compact),
`recolour_2x.png` (one kit, eight skin / hair / cloth combinations), `masks_2x.png` (every kit file and its mask as
the game reads it), `fallback_2x.png` (the whole-bust fallback), `import_contact.png` and `import_report.json` (the
importer's own report on the sample).
