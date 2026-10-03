# Harmony busts: brief for painted art (contract v2)

**Why.** Robin judged the code-drawn busts far below the fidelity of his mockup. An external review then
sharpened the requirement (`docs/review/WORLD_REVIEW_RECONCILIATION.md`; packet document 02):

- The mockup is the **fidelity target as well as the composition target**.
- **Both** participants must play a short, internally animated, one-off performance. Sliding and fading a still
  picture is not enough.
- The player keeps their **actual** customised appearance.

The busts are therefore painted with an image tool. The game imports, assembles, recolours and animates them.

**This brief is for the person producing the art.** The authority on formats is the machine contract,
`docs/harmony/contract/CONTRACT.md`, backed by `src/ui/88_harmony_contract.js`. Where the two differ, the
contract wins, and this brief is a bug.

**Status:**
- Waiting for Batch 1.
- The code-drawn busts stay in the game as a **provisional fallback**. Their visual acceptance is reopened.
- The importer, the raster path and a synthetic sample are built and tested
  (`docs/screenshots/harmony/raster_sample/`, labelled SYNTHETIC SAMPLE — not art).

**Changes from v1:**
- Six performance states replace enter/flourish/hold/blink.
- The player faces left, toward the companion.
- New key ramps.
- A pose-specific player kit, with brush arms per technique.
- Explicit masks.
- Batch 1 must prove a second, materially different player look.

---

## 1. What to attach to the image tool

| Attach | Where | Purpose |
|---|---|---|
| Robin's Harmony mockup (the compact pairing) | Robin's copy; **never committed** | style, fidelity and composition target |
| `ref_companion_<name>.png` (nao, mio, ren, suzu) | `docs/harmony/asset_brief/` | identity: portraits, battle figure, world sprite, colours |
| `ref_player_hairstyles.png`, `ref_player_wear.png` | same | the player's options |
| `ref_palettes.png` | same | the game's palettes and the **key ramps** for the player kit (§6) |
| `template_bust_comp_4x.png`, `template_bust_pc_4x.png` | same | transparent 768 × 640 guides; use as the base image when the tool accepts one |
| `template_bust_labelled.png`, `template_pair_labelled.png` | same | the guides explained |
| From Batch 2 on: the approved Batch 1 images | — | the style lock |

The reference sheets show **who** each character is. Their low detail is exactly what is being replaced.

## 2. The look

**Fidelity like the mockup:**
- Clearly shaped eyes with a coloured iris, a dark upper lash line and highlights.
- Expressive brows and mouths, with plane and light separation on the face.
- Hair in layered locks with contour variation and light moving across the masses.
- Cloth with folds following the pose, overlapping fabric and warm highlights.
- Ribbons, earrings, glasses and hands properly integrated.
- Faces and hands come first. Detail goes where it reads, not as uniform strand noise.

**Rendering:**
- Painterly pixel art: crisp square pixels, no blur, airbrush or anti-aliased edges against the background,
  no texture noise.
- Warm light from the upper left, with a cool rim light down the right-hand silhouette.
- A selective dark outline (#140c18) that lightens inside the shape.

**Composition:**
- A cooperative rally, not two profile cards: diagonal energy, overlapping depth, a hand directed outward,
  two people engaged together.
- No face-off, no "VS", no slogan.

**Never:**
- Text, letters, numbers, kana or kanji, even on a badge or a sash.
- Signatures, watermarks, logos, frames, UI or the battlefield.
- A backing band: the game draws the indigo ink band.
- Copying the mockup's player features (complexion, flower, grin, wink) onto every possible player.

**Originality:** everything must be original, with no resemblance to existing franchise characters.

## 3. Canvas and geometry (art px; see contract §3)

| | Companion | Player |
|---|---|---|
| Canvas (every file) | 192 × 160 | 192 × 160 |
| Facing | three-quarter, turned to screen **right** (toward the player) | three-quarter, turned to screen **left** (toward the companion), looking out |
| Neck pit (alignment point) | (94, 118) | (98, 118) |
| Face, brow to chin | box 74–124 × 52–104 (≈ 52 px tall) | box 68–118 × 52–104 |
| Head, crown to chin | 62–130 × 18–104; hair, bows and spikes may spill out but stay on the canvas | same |
| Signature hand | near side x 8–76, or forward up to x 190 | near side (screen right) x 124–188 |
| Ink band crop (paint past it to the bottom) | (0, 156) → (192, 150) | (0, 151) → (192, 145) |
| Phone-safe region (face and hand) | x 8–184, y 0–128 | same |

- **Seating.** The game seats the pair at 352 × 160: the companion at x 0, the player at x 160, with the
  player in front.
- **Display.**
  - Wide desktops show the pair at 2×: 704 × 320 at 1920 × 1080.
  - Smaller desktops show it at 1×.
  - Phones use a tighter 248 × 128 crop at a device-pixel-exact scale.
- **Format.** Deliver PNG with transparency. Any whole-number enlargement of the grid works (4× is 768 × 640),
  or a 1024 square with the bust centred on the template. The importer finds the grid.
- **Alpha is binary.** Nothing is semi-transparent: glasses lenses are left transparent, with glints painted
  as opaque pixels.
- **Spend the effort on the drawing.** The import snaps the grid and cleans strays, and every frame is
  aligned by its neck pit.

## 4. The performance (contract §4)

Each character has **one short, one-off performance**, played once per real technique. Nothing loops and
nothing blinks on a timer.

| State | Normal timing | What it shows |
|---|---|---|
| `prep_a` | 0–90 ms (sliding in) | anticipation: arriving, gathering, hair and cloth trailing |
| `prep_b` *(optional in-between)* | 90–180 ms | anticipation continuing |
| `cue` | 180–260 ms | the identifying gesture begins |
| `peak` | 260–400 ms | the gesture or expression at its height: the hero moment |
| `settle_a` *(optional in-between)* | 400–480 ms | follow-through |
| `settle_b` | 480–780 ms, fading from 560 ms | the settled finish: attractive when paused |

**Other modes:**
- Fast compresses the same sequence (100 / 220 / 160 ms segments).
- Instant shows nothing.
- Reduced motion shows `settle_b` alone.

**Required states:** `prep_a`, `cue`, `peak` and `settle_b`. The optional in-betweens make the motion read
smoothly. A missing state holds the one before.

**Keep the head in place.** Keep the head in the same place across a character's states, within a pixel or
two. The game may nudge the head group and the torso group by whole pixels per state.

**Per pairing (from the review):**

| Pairing | Companion's one-off | Ties to the stage technique |
|---|---|---|
| **Nao** (he; courier) | a focused glance and settle, then a precise directional hand cue and a small, assured acknowledgment | **Read the Opening**: he spots the opening. Practical, not theatrical |
| **Mio** (she; apothecary) | readying and lifting the small vial at a controlled angle, a reassuring look, a purposeful release cue | **Clearwater Draught**: measured care. No staff, no prayer pose |
| **Ren** (he; lantern keeper) | attention to the lamp, the lamp rising, its light framing his face, quiet certainty; a glasses push may be secondary | **Lantern Ward**: lamp and glasses stay attached and correctly occluded |
| **Suzu** (she; travelling performer) | a theatrical head, shoulder and hand flourish with hair and ribbon follow-through, a knowing smile or a single wink, one quick glint by the face at the peak | **Curtain Call**: sharing the spotlight |

**The player's performance:**
- `prep_a` and `cue`: a shared base. A grounded breath, gathering the brush hand, beginning a coordinated arc.
- `peak` and `settle`: the terminal gesture adapted per technique:
  - Nao: following his cue with the brush.
  - Mio: guiding the ink.
  - Ren: a coordinated seal.
  - Suzu: sharing the spotlight.
- The player is a participant, never a spectator.

## 5. Companions: fixed identity, still animated

Deliver each state as a flattened frame, `<comp>_<state>.png`: four required and two optional per companion.
- **Layered frames** are also accepted, as `<comp>_<state>_<layer>.png` with the layer order in `import.json`.
- An optional `<comp>_<state>_fx.png` holds a glint or glow the game can switch off.
- Companions are never recoloured and need no masks.

Identity follows `ref_companion_<name>.png`:
- **Nao:** spiky dark-brown hair, a pencil behind his ear, a mustard scarf with a tail, an olive tunic, the
  big satchel's strap.
- **Mio:** black hair in a bun with pins, a cream apron over a sage-green dress, small glass vials.
- **Ren:** blue-black ponytail with a side parting, round glasses, a navy high-collared coat with brass
  buttons and patches, a small brass lamp.
- **Suzu:** warm brown skin, long wavy auburn hair, a dusty-pink bow on her left, gold drop earrings, a beauty
  mark below her left eye, a plum dress with a gold trim line.

## 6. The player kit: layers in key colours (contract §1, §5, §6)

The player has 7 skins, 12 hairstyles, 10 hair colours, 8 clothing colours, 5 cuts, accessories and keepsakes.
Painting every combination whole is impossible, so the player is painted as **layers on the same canvas**:

| Files | What | Notes |
|---|---|---|
| `pc_head_focus`, `_cue`, `_peak`, `_settle` | head with ears, neck and face, **bald smooth scalp**, an expression per state | the head never changes angle; one iris colour (dark brown, final colour), since the game has no eye-colour option |
| `pc_torso_tunic`, `_robe`, `_coat`, `_apron`, `_dress` | shoulders and chest to the bottom edge, including the arm that isn't gesturing | the apron bib in its final cream |
| `pc_arm_<pose>_<sleeve>` | the brush arm: sleeve, hand and brush in one file | poses `prep_a`, `prep_b` (optional), `cue`, `peak_<comp>`, `settle_<comp>` for nao, mio, ren and suzu. Sleeve `wide` for the robe only, `fitted` for every other cut. The brush is a slim black lacquer shaft, a brass ferrule, and cream bristles with an ink-dark tip, in final colours |
| `pc_hair_<style>_back`, `pc_hair_<style>_front` | **back:** all hair behind the head and shoulders. **front:** crown, fringe, side locks and locks falling in front of the shoulders | every hairstyle (short, bob, long, ponytail, bun, curly, spiky, braid, shaved, twintails, wavy, wrap). `shaved` is front only (stubble). `wrap` is a cloth head wrap in the **cloth-trim** ramp. Optional `_swing` variants serve prep_b and settle_a. Each hairstyle must fit the bald head exactly; two styles differ in silhouette, not just colour |
| `acc_<id>[_<part>]` | §7 | |

**Key ramps.** Paint recolourable parts **only** in these five shades, darkest to lightest. Use #140c18
outlines. Everything else (eyes, brush, metal, glass, leather) is painted in its final colour and never
recoloured.

| Material | s0 | s1 | s2 | s3 | s4 | Used for |
|---|---|---|---|---|---|---|
| skin | #601c00 | #943c08 | #d06018 | #f48c40 | #ffc0a0 | face, ears, neck, hands; blush and lips in these shades too |
| hair | #3c0a5c | #5a1470 | #8a24a0 | #b848c8 | #e088ec | hair, brows, stubble |
| cloth main | #0c3a14 | #1a6428 | #2e8c3c | #52b45a | #8ad88a | garment body and sleeves |
| cloth trim | #004e60 | #12687a | #22a0b4 | #5ccce0 | #a8f0f8 | collar, cuffs, piping, ties, the head wrap |
| accessory | #10164a | #222e8a | #3a4cc8 | #6a80ec | #a8b8ff | each recolourable accessory's own colour |

- The skin key is deliberately an unnatural orange, so that it can never be confused with a real skin tone or
  a painted mouth.
- **Masks are the authority.** The importer derives a mask per file from these ramps. Any pixel that is
  ambiguous is reported, never guessed.
- Image tools drift off palette. So expect a short cleanup round, or supply your own `<name>.mask.png` using
  flat material colours (contract §5).

## 7. Accessories and keepsakes (registry ids; contract §3.4)

Paint each accessory on the bald preset head and body, as its own file.

**Hair-mounted pieces** sit on the bald scalp at a natural size. The game sets an offset per hairstyle, and
hides the hair above a hat or cap band, so a hat must cover the scalp above its band.

**Recolourable (accessory ramp):**
- `acc_scarf`: also the persimmon-dyed cloth.
- `acc_hat`: also the terrace straw hat.
- `acc_headband`.
- `acc_flower`: also the pressed road-flower.
- `acc_ribbon`, `acc_leaf`: on the character's **left**, which is the player's **near** side, screen right.
- `acc_earrings_near` and `acc_earrings_far`: the drop in the ramp, the hoop in gold.
- `acc_cape_back` and `acc_cape_front`: the clasp in brass.
- `acc_bell`: the cord in the ramp, the bell in brass.
- `acc_cap`: the ferry cap; a plain round brass badge, no lettering.
- `acc_atlas_sash`: map paper; lines only, no writing.

**Final colours:**
- `acc_scarf_knit`: red with yellow stripes, hand-knitted.
- `acc_satchel`: a leather strap from the near shoulder across the chest, with a brass buckle.
- `acc_glasses`: round wire frames, transparent lenses.
- `acc_atlas_pin`: a small brass compass-rose pin.
- `acc_atlas_quill`: a white quill in the hair, on the left.

**Not painted:** the Atlas lamplet, which hangs below the crop. Charms and tools are never drawn.

## 8. Batch 1: the proof (do this first, then stop for review)

**What it proves:**
1. Fidelity against the mockup.
2. Internal animation.
3. That the layered kit can build **two materially different player looks**, not just a colour change.

| Group | Files (26 required, plus optional) |
|---|---|
| Suzu | `suzu_prep_a`, `suzu_cue`, `suzu_peak`, `suzu_settle_b`; optional `suzu_prep_b`, `suzu_settle_a`, `suzu_peak_fx` |
| Heads | `pc_head_focus`, `pc_head_cue`, `pc_head_peak`, `pc_head_settle` |
| Torsos | `pc_torso_coat` (look A), `pc_torso_robe` (look B) |
| Arms | `pc_arm_prep_a_fitted`, `pc_arm_cue_fitted`, `pc_arm_peak_suzu_fitted`, `pc_arm_settle_suzu_fitted`, and the same four `_wide`; optional `pc_arm_prep_b_fitted`, `pc_arm_prep_b_wide` |
| Hair | `pc_hair_ponytail_back`, `pc_hair_ponytail_front` (look A); `pc_hair_curly_back`, `pc_hair_curly_front` (look B) |
| Accessories | `acc_glasses`, `acc_flower` (look A); `acc_scarf`, `acc_satchel` (look B) |

- **Look A** is Robin's acceptance look: auburn ponytail, green coat, glasses, a flower.
- **Look B** is the contrast: curly hair, robe with wide sleeves, scarf, satchel. It will also be shown in a
  dark skin and a contrasting palette.
- **Style masters (optional, recommended).** First paint look A complete and in real colours at `peak` and
  `settle_b`, as style masters. Then derive the layers from them. Keep style masters in a separate `refs/`
  folder: the importer accepts only contract names.

**What I return:**
- The importer's report: each file over the template, its mask, and any unresolved pixels.
- Both looks with Suzu, assembled in a real battle.
- Stills of every state.
- A real-time recording.
- Captures at the actual display scales.

Robin approves the **direction**, or asks for changes, before anything else is painted.

## 9. Batches 2–4

| Batch | Files | Gate |
|---|---|---|
| 2: Nao, Mio, Ren | four required states each, plus optional in-betweens, matching approved Suzu in light, head size and finish | all four pairings distinct with backing and particles off |
| 3: the full player kit | the remaining torsos, the arms for every technique in both sleeves, all 12 hairstyles back and front, any `_swing` | every supported geometry assembles without seams, detached hair or skin mismatches |
| 4: accessories and keepsakes | the rest of §7 | visible equipment correct in every assembled look |

The complete list of keys (86 required, 33 optional) is `assetKeys` in `docs/harmony/contract/registry.json`.
The published brief page has a checklist.

## 10. Delivering

- **Format:** one folder per batch, files named exactly as above, PNG with transparency (or one flat #ff00ff).
  An optional `import.json` holds per-file hints (contract §8).
- **Rights note:** a line or two with each delivery confirming that Robin made the images with his image tool,
  may use them in this project under that tool's terms, and that they are original. It is recorded in
  `assets/harmony/PROVENANCE.md`.
- **Never committed:** Robin's mockup and other reference images.
- **Import:** I run `node tools/harmony_import.mjs <folder> --suggest`, fix alignment in `import.json`, and send
  back a concrete list of anything that must be repainted.

## 11. Open points for Robin

1. **Display size on your screen.**
   - The addendum's limits cap the cut-in at 30 % of the view's height.
   - Today, 2× needs a view at least 1677 × 1067 CSS px; below that the pair shows at 1× (faces about 52 CSS
     px).
   - Your mockup was taken on a view of about 2048 × 1046, which falls just under that height.
   - Planned fix: measure the painted pair's **visible** height, as the code busts already do, rather than the
     full canvas, so your screen gets 2× (faces about 104 px).
   - This will be checked on Batch 1's real art.
2. **Small phones.** At 375 × 667 and 320 × 640, faces are 52 CSS px, short of the addendum's ≥ 64. The
   compact crop can't grow further without covering the battle.
3. **Iris colour.** Painted heads give every player the same dark-brown iris; the game has no eye-colour
   choice.
4. **Memory.** About 8 MiB at peak per cut-in (bounded to about 17 MiB by the caches), measured on the
   sample. Re-measured on Batch 1.
