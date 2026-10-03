# Harmony busts: brief for painted art

**Why this exists.** The owner reviewed `docs/screenshots/harmony/art/pairings_standard_3x.webp` and judged the
code-drawn busts far below the fidelity of their own mockup of the Harmony pairing. They should be "very
very close in detail and fidelity" and some of the best art in the project, with "a quick animated flourish
from the party". Pixel art drawn by code cannot reach that level of hand-painted detail. So the busts will
be painted with an image tool, and the game will assemble, recolour and animate them.

This file is the contract between the person producing the art and the integration.

**Status: waiting for art.** Until frames arrive, the code-drawn busts (docs/harmony/ART.md) stay in the
game. They also remain the fallback for anything not yet delivered.

---

## 1. What to attach to the image tool

| Attach | Where | What it is for |
|---|---|---|
| The owner's own Harmony mockup (the compact pairing) | the owner's copy; **never committed** | the style target |
| `ref_companion_<name>.png` (nao, mio, ren, suzu) | `docs/harmony/asset_brief/` | who each companion is: portraits, battle figure, world sprite, colours |
| `ref_player_hairstyles.png`, `ref_player_wear.png` | same | the player's options |
| `ref_palettes.png` | same | the game's palettes, and the **key ramps** used to paint the player kit (§7) |
| `template_bust_comp_4x.png`, `template_bust_pc_4x.png` | same | transparent 768 × 640 guides; use them as the base image when the tool accepts one |
| `template_bust_labelled.png`, `template_pair_labelled.png` | same | the guides explained, for people |

The reference sheets come from `node tests/e2e/harmony_asset_refs.mjs`. They show identity only. Their
low detail is what is being replaced, so it is not something to copy.

## 2. The look

- **Painterly pixel art at mockup fidelity.** Each feature gets several shades:
  - big expressive eyes with a coloured iris, a dark upper lash line and two highlights;
  - hair as large shaded masses broken into locks, with a broken highlight band and a darker underside;
  - cloth showing folds, seams and stitching;
  - metal, glass and lamp light that actually shine.
- **Light** comes from the upper left, warm. A cool rim light runs down the right-hand silhouette (the
  battle figures' convention). Shadows lean toward violet or crimson, highlights toward warm yellow.
- **Pixels:** crisp, every art pixel a clean square. No blur, no soft airbrush, no anti-aliased edge into
  the background, no texture noise, no dithering beyond a few deliberate pixels.
- **Outline:** selective. Dark (#140c18) where the shape meets the background; inside the shape the outline
  goes lighter or disappears.
- **View:** three-quarter, everyone turned toward **screen right** (toward the action). Heads, shoulders and
  chest only, with the hand that makes each character's gesture.
- **Background:** transparent (or one flat #ff00ff, if the tool cannot do transparency), no shadow under the
  figure. The game draws the indigo ink band behind the pair, so **do not paint a backing**.
- **Never in the art:** text, letters, numbers, kana or kanji (not even on a badge, a scroll or a sign),
  signatures, watermarks, logos, frames or speech bubbles. The game's rules forbid writing in art.
- **Originality:** everything original. No resemblance to an existing franchise's characters.

## 3. Canvas and geometry

All sizes are in **art pixels** (the grid of the pixel art), before any enlargement.

| Item | Size | Notes |
|---|---|---|
| One bust (each file) | **192 × 160** | one character per file, aligned to the template |
| The pair (built by the game) | 352 × 160 | companion canvas at x 0, the player's canvas at x 160, the player in front |
| Face, brow to chin | about **52** px tall, ~50 px wide | the yellow box. About 1.6× the face in the dialogue portraits |
| Head, crown to chin | inside the blue box (x 62–130, y 18–104) | hair, bows and spikes may spill past it, but stay on the canvas |
| Neck pit | **(94, 118)** | the red cross; it keeps busts lined up between frames |
| Ink band edge | from (0, 156) to (192, 150) | the game crops the chest along this line; paint past it to the bottom edge |
| Compact-safe box | x 8–184, y 0–128 | phones show only this region: the face and the signature hand must be inside it |
| Signature hand | companion: the near side (x 8–76) or forward up to x 190; player: forward on the right (x 124–188) | the pink box; Nao's pointing hand may reach forward |

**Delivery size:** any whole-number enlargement of the grid. 4× is 768 × 640; 5× is 960 × 800. A
1024-pixel square with the bust centred on the template is also fine. The import tool detects the grid. Do
not spend effort on exact pixels: the import snaps the grid, reduces the palette and cleans stray pixels, and
the integration aligns every frame by its neck pit. **Spend the effort on the drawing.**

**How big it shows.** Native 352 × 160 is shown at:
- **2×** on wide desktops: 704 × 320 at 1920 × 1080, or 35 % × 30 % of the view, within the addendum's
  limits;
- **1×** at 1280–1600 wide;
- on phones, the compact crop is scaled so faces are at least 64 CSS pixels tall.

The code-drawn busts are 228 × 100, so this is about 1.6× the density.

## 4. The animated flourish

Every character has the same frames:

| Frame | When | What it shows |
|---|---|---|
| `enter` | first ~160 ms, while the pair slides in with the ink band | mid-motion arrival: hair and cloth trailing to the left, the gesture starting |
| `flourish` | next ~260 ms | the signature beat (below) at its peak |
| `hold` | the rest of the cut-in | the settled gesture, held. The pose the player remembers |
| `blink` | one ~90 ms blink during the hold | `hold` with the eyes closed; nothing else changes |

The game adds the motion between frames, so those effects are not painted:
- the slide;
- a one-pixel hair settle;
- the blink timing;
- small light effects: Suzu's sparkle, Ren's lamp bloom and lens glint, the shimmer on Mio's vial, Nao's
  gold route stroke, and the player's ink arc and motes.

**Reduced motion** shows `hold` alone.

**Keep the head in the same place in all four frames**, within 2 px. The game can tilt it a pixel or two
itself.

| Who | enter | flourish | hold |
|---|---|---|---|
| **Nao** (he; courier) | turning in mid-stride, big satchel swinging, scarf tail flying | grinning, points forward along the road, arm out toward the right | pointing hand settled, confident grin, pencil behind the ear |
| **Mio** (she; apothecary) | drawing a small glass vial up from her apron | holds the vial up beside her face as it catches the light; soft smile, eyes half closed | vial held up, calm warm smile, hairpins catching light |
| **Ren** (he; lantern keeper) | pushing his glasses up with one hand, lamp held low | lamp raised; the flame flares; lenses glint; a steady look | lamp held at chest height, glow on his face from below |
| **Suzu** (she; travelling performer) | hand coming up to wave, wavy hair swinging, earrings swinging | a wink and a grin, open hand beside her face | an open-handed wave beside her face, playful smile |
| **Player** (any gender) | drawing an ink brush up from the hip | the brush flicked in an arc to the right, determined look | brush raised, a bead of ink at the tip, quietly confident |

Every companion's features, colours and clothes follow `ref_companion_<name>.png`:
- **Nao:** spiky dark-brown hair, mustard scarf, olive tunic, satchel strap, a pencil.
- **Mio:** black hair in a bun with pins, a cream apron over a sage-green dress.
- **Ren:** blue-black ponytail, glasses, navy high-collared coat with brass buttons and patches, a small lamp.
- **Suzu:** wavy auburn hair, a dusty-pink bow, gold drop earrings, a beauty mark, a plum dress with a gold
  trim necklace line.

## 5. Batch 1: the style key (do this first, then stop for review)

1. **Suzu**: `suzu_enter`, `suzu_flourish`, `suzu_hold`, `suzu_blink`, in her real colours.
2. **One complete player** in real colours (the owner's acceptance look): auburn ponytail, green coat,
   glasses, a pink flower in the hair. Files `pcpreset_enter`, `pcpreset_flourish`, `pcpreset_hold`,
   `pcpreset_blink`.

The integration builds a playable proof from these (Suzu's pairing in a real battle, with the flourish) and
sends evidence back before anything else is painted. That proof settles fidelity, size and timing early.
The preset player is also the model for the kit in §7.

## 6. Batch 2: Nao, Mio, Ren

Four frames each (`<name>_enter`, `_flourish`, `_hold`, `_blink`), matching the approved Suzu in style,
light, scale and head size.

## 7. Batch 3: the player kit (layers in key colours)

The player chooses:
- skin (7);
- hairstyle (12);
- hair colour (10);
- clothing colour (8);
- cut (5);
- accessories and keepsakes.

That is far too many combinations to paint whole, so the player is painted as **separate layers on the same
192 × 160 canvas**, using the preset from Batch 1 as the model.

Recolourable parts are painted in **key ramps** (`ref_palettes.png`): five shades, darkest to lightest. The
game replaces each key ramp with the chosen colour, shade for shade. Anything not in a key ramp keeps its
painted colour (eyes, the brush, metal, glass, leather).

| Key ramp | Shades (dark → light) | Used for |
|---|---|---|
| skin (reference) | #6e3e2a #9a5e40 #c28e64 #dcae84 #f2d0a8 | all skin: face, ears, neck, hands |
| hair | #2a0a3a #5a1470 #8a24a0 #b848c8 #e088ec | hair, brows, stubble |
| cloth main | #0c3a14 #1a6428 #2e8c3c #52b45a #8ad88a | the garment's body and sleeves |
| cloth trim | #0a3a44 #12687a #22a0b4 #5ccce0 #a8f0f8 | collar, cuffs, sash, piping; the head wrap hairstyle |
| accessory | #10164a #222e8a #3a4cc8 #6a80ec #a8b8ff | the recolourable accessories (§8) |

Painting rules:
- Paint strictly within these shades for those materials (blush and lip colour may stay a warm skin
  shade).
- Use #140c18 for outer outlines.
- Lay every layer on the same template, with the head in exactly the same place in every file.

| Files | Count | Layer contents |
|---|---|---|
| `pc_head_enter`, `pc_head_flourish`, `pc_head_hold`, `pc_head_blink` | 4 | head with ears, neck and face, **no hair**: a smooth scalp. The expression per frame from §4 |
| `pc_torso_tunic`, `_robe`, `_coat`, `_apron`, `_dress` | 5 | shoulders and chest of each cut, down to the bottom edge, including the arm that is not gesturing (`ref_player_wear.png`, first row) |
| `pc_arm_enter_fitted`, `pc_arm_flourish_fitted`, `pc_arm_hold_fitted`, and the same three with `_wide` | 6 | the brush arm per frame: sleeve, hand, brush. Fitted sleeves go with tunic, coat, apron and dress; wide sleeves with the robe |
| `pc_hair_<style>_back` and `pc_hair_<style>_front` for short, bob, long, ponytail, bun, curly, spiky, braid, shaved, twintails, wavy, wrap | up to 24 | **back:** every bit of hair behind the head and shoulders. **front:** the fringe, side locks, crown, and locks falling in front of the shoulders. Shaved is front only (stubble on the scalp); wrap is a cloth head wrap in the cloth-trim ramp |

The game stacks the layers in this order:
1. hair back
2. torso
3. head
4. glasses
5. hair front
6. head accessories
7. chest accessories
8. arm

## 8. Batch 4: accessories and keepsakes

Accessories are painted on the preset's head and body, each in its own file.

**Painted in the accessory ramp** (the game recolours them):
- `acc_scarf`: the creation scarf; recoloured for the persimmon-dyed cloth.
- `acc_hat`: also the terrace straw hat.
- `acc_headband`
- `acc_flower`: also the pressed road-flower.
- `acc_ribbon`: a bow tied in the hair.
- `acc_leaf`: the maple-leaf hairpin.
- `acc_earrings_near` and `acc_earrings_far`: the glass drop in the ramp, the hoop in gold.
- `acc_cape_back` and `acc_cape_front`: also the traveller's cape.

**Painted in final colours:**
- `acc_scarf_knit`: red with yellow stripes, hand-knitted.
- `acc_satchel`: the leather strap across the chest, from the near shoulder.
- `acc_glasses`: round wire frames.
- `acc_cap`: a navy ferry cap with a plain brass badge. No lettering.
- `acc_bell`: a tiny brass bell on a red cord at the throat.
- `acc_pin_compass`: a small brass compass-rose pin on the chest.
- `acc_quill`: a quill tucked in the hair.
- `acc_sash`: a map-paper sash across the chest. Lines only, no writing.

The Atlas's little lantern hangs at the hip, below the crop, so it is not painted.

The game positions head accessories for each hairstyle. It hides the hair above a hat or cap band, so paint
hats and caps on the bare scalp at a natural size.

## 9. Names, format, delivery

- **Format:** PNG with transparency. Name each file exactly as above (for example `suzu_flourish.png`,
  `pc_hair_braid_front.png`). Use one folder per batch.
- **Quality bar:** batches 2–4 must match the approved Batch 1 in head size, light and finish.
- **Rights:** a short note with the delivery confirming that:
  - the owner made the images with their tool and may use them in this project under that tool's terms;
  - they are original.

  The note is recorded in `assets/harmony/PROVENANCE.md`. The mockup and other reference images are never
  committed.

## 10. What the integration does with the files

1. **Import** (`tools/harmony_import.mjs`):
   - detect the grid and reduce each file to its native size;
   - snap the palette, so key-ramp pixels become exact key shades and stray in-between pixels go;
   - align each frame by its neck pit;
   - write native PNGs to `assets/harmony/`, with a manifest of anchors.
   - It also writes a report sheet (each file over the template) and lists any key-ramp coverage gaps to
     send back.
2. **Build:** `tools/build.mjs` embeds the native PNGs in `index.html`. The game stays one offline file;
   about 0.6 MB is expected for every file at native size.
3. **Draw:** `RB.harmonyArt.compose()` keeps its API:
   - the painted frames when present, and the code-drawn busts for anything missing;
   - recolouring builds each look's ramps from the game palettes, the same way the code busts do, and caches
     the result per look;
   - the frames gain a `flourish` phase, which the cut-in overlay plays as in §4.
4. **Tests:**
   - unit: manifest completeness, no key colour left in any output, and both faces always visible in the
     pair;
   - browser: every appearance fixture composes, and timing and memory stay in budget;
   - new evidence sheets at native and display scale.

## 11. Copy-paste prompts

Attach the files from §1 to every request.

**Batch 1, Suzu (one request per frame, or all four in one sheet if the tool keeps them consistent):**

> High-detail pixel-art character bust for a Japanese-inspired fantasy RPG, matching the attached mockup's
> fidelity and finish: painterly pixel art with crisp square pixels, rich shading, detailed expressive eyes,
> hair in shaded locks with a highlight band, cloth folds, warm light from the upper left and a cool rim light
> on the right edge, selective dark outline. Character: Suzu, a cheerful young travelling performer (she),
> warm brown skin, long wavy auburn hair, a dusty-pink bow, gold drop earrings, a small beauty mark, a plum
> dress with a gold trim line (identity and colours from ref_companion_suzu.png). Three-quarter view turned to
> screen right; head, shoulders and chest only. Place her exactly on the attached 768×640 template: face
> inside the yellow box, neck at the red cross, signature hand inside the pink box. Frame: [ENTER: her hand
> coming up to wave, hair and earrings swinging, arriving from the left | FLOURISH: a wink and a grin, open
> hand beside her face | HOLD: an open-handed wave beside her face, playful smile | BLINK: the HOLD image with
> both eyes closed, nothing else changed]. Transparent background, no backing, no shadow. No text, letters,
> numbers, kana, kanji, logos, signatures or watermarks anywhere.

**Batch 1, the preset player:** the same prompt, with this character description and the player's frames
from §4:

> a young traveller (any gender, androgynous build) with light skin, an auburn ponytail, round glasses, a pink
> flower in the hair and a green coat; holding a slim black-lacquered ink brush with a brass ferrule

**Batches 2–4:** the same prompt, with the character and frame from §4 or the layer from §7–§8. Add the
approved Batch 1 images as the style reference.

For key-colour layers, add:

> paint [the hair / the skin / the garment body / the trim / the accessory] using only these five shades from
> darkest to lightest: …; paint only this layer on a transparent background, aligned to the template, with
> nothing else visible.
