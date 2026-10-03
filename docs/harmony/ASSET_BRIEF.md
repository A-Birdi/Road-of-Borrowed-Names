# Harmony busts: brief for painted art (v3)

**Why.** Robin judged the code-drawn busts far below the fidelity of his mockup. Two later directives make the
target precise:
- the world-review packet's documents 02 and 03 (`docs/review/WORLD_REVIEW_RECONCILIATION.md`);
- Robin's **Art Direction Correction** (`docs/harmony/ART_DIRECTION_CORRECTION.md`), which wins wherever the
  directives conflict (`docs/harmony/DIRECTIVE_RECONCILIATION.md`).

> **The goal is an authored Harmony illustration system, not the best ordinary pixel portrait a generator
> can produce.** It must preserve customisation and land very close to the chosen mockup's style, detail and
> impact.

**What that means:**
- The mockup is the **fidelity target as well as the composition target**. It is not placement-only
  inspiration.
- This is **a special illustrated battle cut-in**, with the mockup's expressive, richly shaded finish and a
  pixel-compatible presentation. It is **not a normal dialogue portrait made larger**.
  - Do not flatten its shading, remove its pose energy, or enlarge its pixel blocks to match the ordinary
    portraits.
  - Avoid photorealism, glossy vector styling, or a different character-design language.
- **Both** participants play a short, internally animated, one-off performance. Sliding and fading a still
  picture does not count.
- The player keeps their **actual** customised appearance, at **the same fidelity** as the companion.

The busts are painted with an image tool. The game imports, assembles, recolours and animates them.

**This brief is for the person producing the art.** The authority on formats is the machine contract,
`docs/harmony/contract/CONTRACT.md`, backed by `src/ui/88_harmony_contract.js`. Where the two differ, the
contract wins, and this brief is a bug.
- **Contract v3 is being built.** It adds free-valued key colours, fitting on the visible footprint,
  held-pose reduced motion and committed source art. Painted checkerboards are already refused by the v2 importer.
- Until it lands, v2 is what the importer enforces.

**Status:**
- Every bust in the game today is **provisional artwork**: code-drawn, and not visually approved.
- No external art is being produced until Robin relays this brief.
- The importer, the raster path and a synthetic sample are built and tested
  (`docs/screenshots/harmony/raster_sample/`, labelled SYNTHETIC SAMPLE — not art).

**Source basis:** branch `claude/stoic-sagan-n3jvgk`.
- The registry export `docs/harmony/contract/registry.json` records the exact commit it was generated from.
- Appearance resolver: `RB.equip.look(s)` (src/engine/07_equip.js).

**Approval labels:**
- **provisional artwork:** the code busts, or anything unapproved that is not a candidate.
- **visual candidate awaiting approval:** a delivered batch, imported and shown in battle.
- **approved visual direction:** Robin has accepted it.
- **integrated and verified:** approved art, assembled in the game and tested.

**Changes from v2:**
- Recolourable parts may use **as many values as the drawing needs** inside each key colour family (§6),
  instead of exactly five shades.
- Batch 1 is split into **1a** (Suzu + look A, Robin's approval) and **1b** (look B, the customisation proof).
- The satchel strap moves into look A, as in the mockup.
- The player's head is drawn at **one expressive, tilted three-quarter angle**, with every state changing the
  eyes, lids, brows, mouth and cheeks.
- Reduced motion holds `peak`, then `settle_b`.
- The brief now states that painted checkerboards are rejected (the importer already refused them).
- Approved source files are kept in the repository.
- Robin's screen gets 2×: faces about 100 CSS px, comparable to the mockup.

---

## 1. What to attach to the image tool

| Attach | Where | Purpose |
|---|---|---|
| Robin's Harmony mockup (the compact pairing) | Robin's copy; **never committed** | style, fidelity and composition target |
| `ref_companion_<name>.png` (nao, mio, ren, suzu) | `docs/harmony/asset_brief/` | identity: portraits, battle figure, world sprite, colours |
| `ref_player_hairstyles.png`, `ref_player_wear.png` | same | the player's real options |
| `ref_palettes.png` | same | the game's palettes and the **key colour families** for the player kit (§6) |
| `template_bust_comp_4x.png`, `template_bust_pc_4x.png` | same | transparent 768 × 640 guides; use as the base image when the tool accepts one |
| `template_bust_labelled.png`, `template_pair_labelled.png` | same | the guides explained |
| *Optional:* a frame of today's cut-in (`docs/screenshots/harmony/cutin/`) | same repo | **for comparison, not imitation**: it shows what is being replaced |
| From Batch 1b on: the approved Batch 1a images | — | the style lock |

The reference sheets show **who** each character is. Their low detail is exactly what is being replaced.

## 2. The look

**Faces: performed, not neutral.**
- Deliberate eye openings, eyelids, brows, highlights, mouth shape, cheek structure and head angle.
- Confident, attentive, playful, reassuring or precise, according to the character.
- The expression must read at the **actual battle size**: the face about 100 CSS px wide on a desktop, about
  50 on a phone.
- Keep glasses, complexion and identity, and draw them better rather than removing them.

**Hair: volume.**
- Coherent overlapping locks and masses, with finer strand accents only where they clarify the shape.
- Highlights and shadows describe direction and depth.
- Never a uniform striped highlight band, random texture or isolated bright pixels.

**Clothing:**
- Meaningful folds, seams or construction where visible, overlap, and material separation.
- Shading follows the torso and the pose.
- Glasses, head accessories, collars, scarves and the satchel strap are drawn **into** the illustration, not
  pasted on as icons.
- Paint only what is actually worn. No invented armour, weapons or jewellery.

**Light and finish:**
- Warm light from the upper left, a cool rim light down the right-hand silhouette.
- Material-aware highlights. Skin, hands, hair, cloth, glass and metal each treated differently.
- Rich colour transitions and selective local contrast: form, not noise.
- A selective dark outline (#140c18) that lightens inside the shape.
- Crisp square pixels: no blur, airbrush or anti-aliased edges against the background.

**Composition:**
- One cooperative moment, not two frontal busts side by side.
- Complementary head angles, shoulder lines and gesture directions, controlled overlap, and energy leading
  into the shared action. In the mockup, Suzu reaches out of the frame and the player answers with a raised
  hand.
- Both faces and the important hands stay readable. Neither person's hand or accessory covers the other's
  expression.
- No face-off, no "VS", no slogan or extra title. It is a party rally.

**It must still look good with every particle and glint switched off.** Sparkles and the game's backing
reinforce good art; they must not hide an unresolved pose.

**Never:**
- Text, letters, numbers, kana or kanji, even on a badge or a sash.
- Signatures, watermarks, logos, frames, UI or the battlefield.
- A backing band: the game draws the indigo ink band.
- Copying the mockup's player features (complexion, flower, glasses, wink, outfit) onto every possible
  player.

**Originality:** everything must be original, with no resemblance to existing franchise characters.

## 3. Canvas and geometry (art px; see contract §3)

| | Companion | Player |
|---|---|---|
| Canvas (every file) | 192 × 160 | 192 × 160 |
| Facing | three-quarter, turned to screen **right** (toward the player) | three-quarter, turned to screen **left** (toward the companion), looking out; the head **tilted** with energy, like the mockup |
| Neck pit (alignment point) | (94, 118) | (98, 118) |
| Face, brow to chin | box 74–124 × 52–104 (≈ 52 px tall) | box 68–118 × 52–104 |
| Head, crown to chin | 62–130 × 18–104; hair, bows and spikes may spill out but stay on the canvas | same |
| Signature hand | near side x 8–76, or forward up to x 190 | near side (screen right) x 124–188 |
| Ink band crop (paint past it to the bottom) | (0, 156) → (192, 150) | (0, 151) → (192, 145) |
| Phone-safe region (face and hand) | x 8–184, y 0–128 | same |

**Seating.** The game seats the pair at 352 × 160: the companion at x 0, the player at x 160, with the player
in front.

**Authoring pixels vs display pixels:**
- **One art pixel is one painted square.**
- **Desktop:** the game shows each art pixel as 2 × 2 CSS px. That includes Robin's ~2048 × 1046 view once
  contract v3 fits the pair on its visible footprint: about 704 × 280–300, faces about 100 px. This matches
  the mockup's footprint (35 % × 25 %) and face size (about 110 px).
- **Smaller views:** 1×.
- **Phones:** a tighter 248 × 128 crop at a device-pixel-exact scale.

**Format:**
- Deliver PNG with **real transparency**. Any whole-number enlargement of the grid works (4× is 768 × 640), or a
  1024 square with the bust centred on the template. The importer finds the grid.
- A checkerboard painted into the picture is **not** transparency, and the importer rejects it.

**Alpha is binary.** Nothing is semi-transparent: glasses lenses are left transparent, with glints painted as
opaque pixels.

**Spend the effort on the drawing.** The import snaps the grid and cleans strays, and every frame is aligned
by its neck pit.

## 4. The performance (contract §4)

Each character has **one short, one-off performance**, played once per real technique. Nothing loops and
nothing blinks on a timer. A finished still is an approval frame, not the finished cut-in.

| State | Normal timing | What it shows |
|---|---|---|
| `prep_a` | 0–90 ms (the quick entrance from the left edge) | anticipation: arriving, gathering, hair and cloth trailing |
| `prep_b` *(optional in-between)* | 90–180 ms | anticipation continuing |
| `cue` | 180–260 ms | the identifying gesture begins |
| `peak` | 260–400 ms | the gesture or expression at its height: **the principal held pose**, the hero moment |
| `settle_a` *(optional in-between)* | 400–480 ms | follow-through: hair, ribbon, earrings and cloth catch up |
| `settle_b` | 480–780 ms, fading from 560 ms | the settled finish: attractive when paused |

**Other modes:**
- Fast compresses the same sequence (100 / 220 / 160 ms segments), keeping the identifying gesture.
- Instant shows nothing.
- Reduced motion holds `peak`, then `settle_b`, with a short cross-fade and no travel.

**Required states:** `prep_a`, `cue`, `peak` and `settle_b`. The optional in-betweens make the motion read
smoothly. A missing state holds the one before.

**Expression changes:**
- Every state changes the **eyes, lids, brows, mouth and cheeks**, not only the mouth.
- The player keeps one head angle across states, so that the hair and accessory layers fit. The game may nudge
  the head group and the torso group by whole pixels per state.
- Companion frames are whole pictures and may change angle freely, but keep the head within a pixel or two of
  place unless the motion calls for it.

**Per pairing** (the correction's wording; it ties to the stage technique):

| Pairing | Companion's one-off | Technique |
|---|---|---|
| **Nao** (he; courier) | practical, focused, assured: a focused glance, then a **precise indicating gesture** and a small confident shift; purposeful, never showy | **Read the Opening**: he reads the route to the opening |
| **Mio** (she; apothecary) | composed care and competence: a **deliberate gesture with the small vial** at a controlled angle, a reassuring expression; **not a timid pose**, no staff, no prayer pose | **Clearwater Draught** |
| **Ren** (he; lantern keeper) | thoughtful, exact, protective: a **measured lamp-and-hand gesture**, the lamp's light framing an intent face; a glasses push may be secondary, **never the whole performance** | **Lantern Ward**: lamp and glasses stay attached and correctly occluded |
| **Suzu** (she; travelling performer) | theatrical, confident, welcoming to the shared spotlight: a lively head, shoulder and hand flourish, a knowing smile or a **single wink**, one quick glint by the face at the peak; hair, ribbon **and earrings** follow through | **Curtain Call**: sharing the spotlight |

A recolour, a different prop or a different speed on the same poses is **not** a companion-specific performance.

**The player's performance:**
- `prep_a` and `cue`: a shared base. A grounded breath, gathering the brush hand, beginning a coordinated arc.
- `peak` and `settle`: the terminal gesture adapted per technique:
  - Nao: following his cue with the brush.
  - Mio: guiding the ink.
  - Ren: a coordinated seal.
  - Suzu: sharing the spotlight.
- The player is a participant, never a spectator.
- The player's expressions are shared by all four pairings, so the shared head does not wink. The wink is
  Suzu's (open point 2).

## 5. Companions: fixed identity, still animated

Deliver each state as a flattened frame, `<comp>_<state>.png`: four required and two optional per companion.
- **Layered frames** are also accepted, as `<comp>_<state>_<layer>.png` with the layer order in `import.json`.
- An optional `<comp>_<state>_fx.png` holds a glint or glow the game can switch off.
- Companions are never recoloured and need no masks. Their colours are free.

Identity follows `ref_companion_<name>.png`:
- **Nao:** spiky dark-brown hair, a pencil behind his ear, a mustard scarf with a tail, an olive tunic, the
  big satchel's strap.
- **Mio:** black hair in a bun with pins, a cream apron over a sage-green dress, small glass vials.
- **Ren:** blue-black ponytail with a side parting, round glasses, a navy high-collared coat with brass buttons
  and patches, a small brass lamp.
- **Suzu:** warm brown skin, long wavy auburn hair, a dusty-pink bow on her left, gold drop earrings, a beauty
  mark below her left eye, a plum dress with a gold trim line.

## 6. The player kit: layers in key colour families (contract §1, §5, §6)

The player has:
- 7 skins, 12 hairstyles, 10 hair colours and 8 clothing colours;
- the cuts (tunic, robe, coat; the apron and dress where worn);
- accessories and keepsakes.

Painting every combination whole is impossible, so the player is painted as **layers on the same canvas**,
**at the same finish as the companion**:

| Files | What | Notes |
|---|---|---|
| `pc_head_focus`, `_cue`, `_peak`, `_settle` | head with ears, neck and face, **bald smooth scalp**, one expressive tilted three-quarter angle, an expression per state | one iris colour (dark brown, final colour), since the game has no eye-colour option; the eyes are fully drawn under where glasses would sit |
| `pc_torso_tunic`, `_robe`, `_coat`, `_apron`, `_dress` | shoulders and chest to the bottom edge, including the arm that isn't gesturing | folds that follow the pose; the apron bib in its final cream |
| `pc_arm_<pose>_<sleeve>` | the brush arm: sleeve, hand and brush in one file | poses `prep_a`, `prep_b` (optional), `cue`, `peak_<comp>`, `settle_<comp>` for nao, mio, ren and suzu. Sleeve `wide` for the robe only, `fitted` for every other cut. The brush is a slim black lacquer shaft, a brass ferrule, and cream bristles with an ink-dark tip, in final colours |
| `pc_hair_<style>_back`, `pc_hair_<style>_front` | **back:** all hair behind the head and shoulders. **front:** crown, fringe, side locks and locks falling in front of the shoulders | every hairstyle (short, bob, long, ponytail, bun, curly, spiky, braid, shaved, twintails, wavy, wrap). `shaved` is front only (stubble). `wrap` is a cloth head wrap in the **cloth-trim** family. Optional `_swing` variants serve prep_b and settle_a. Each hairstyle must fit the bald head exactly; two styles differ in silhouette, not just colour |
| `acc_<id>[_<part>]` | §7 | |

### Key colour families (v3)

Paint each recolourable part **inside its key colour family**:
- Use **as many values as the drawing needs** (6–12 is typical), darkest to lightest along the family.
- The five anchor shades below mark the family. Use them as the shadow, mid and light references.
- Keep each part's hue inside its family. The game re-creates warm and cool shifts in the target palette.
- Use #140c18 outlines.
- Everything else (eyes, brush, metal, glass, leather) is painted in its final colour and never recoloured.

| Material | s0 | s1 | s2 | s3 | s4 | Used for |
|---|---|---|---|---|---|---|
| skin | #601c00 | #943c08 | #d06018 | #f48c40 | #ffc0a0 | face, ears, neck, hands; blush and lips in this family too |
| hair | #3c0a5c | #5a1470 | #8a24a0 | #b848c8 | #e088ec | hair, brows, stubble |
| cloth main | #0c3a14 | #1a6428 | #2e8c3c | #52b45a | #8ad88a | garment body and sleeves |
| cloth trim | #004e60 | #12687a | #22a0b4 | #5ccce0 | #a8f0f8 | collar, cuffs, piping, ties, the head wrap |
| accessory | #10164a | #222e8a | #3a4cc8 | #6a80ec | #a8b8ff | each recolourable accessory's own colour |

**Why the colours are unnatural.** The skin key is deliberately an unnatural orange and the hair a purple, so
that neither can be confused with a real skin tone, a painted mouth or a final-colour part.

**How the game recolours.**
- It projects each pixel onto its family and maps it to the chosen skin, hair or cloth palette, **keeping the
  number of values and the small hue shifts you painted**.
- Changing the hair colour never touches the skin, glasses or clothing.
- The game proves every supported colour, dark and light, keeps readable form.

**Masks are the authority.**
- The importer derives a mask per file from the families. Any pixel it cannot place is reported, never
  guessed.
- You may supply your own `<name>.mask.png` in flat material colours (contract §5) to settle an ambiguous edge.

**Suggested route for the image tool:**
1. Paint **style masters** of look A in real colours first (§8).
2. Then repaint each layer in the key families.
3. The importer's recolour of the layers back into look A's colours is compared with the style masters. They
   must match in finish.

## 7. Accessories and keepsakes (registry ids; contract §3.4)

Paint each accessory on the bald preset head and body, as its own file.

**Hair-mounted pieces** sit on the bald scalp at a natural size. The game sets an offset per hairstyle, and
hides the hair above a hat or cap band, so a hat must cover the scalp above its band.

**Recolourable (accessory family):**
- `acc_scarf`: also the persimmon-dyed cloth.
- `acc_hat`: also the terrace straw hat.
- `acc_headband`.
- `acc_flower`: also the pressed road-flower.
- `acc_ribbon`, `acc_leaf`: on the character's **left**, which is the player's **near** side, screen right.
- `acc_earrings_near` and `acc_earrings_far`: the drop in the family, the hoop in gold.
- `acc_cape_back` and `acc_cape_front`: the clasp in brass.
- `acc_bell`: the cord in the family, the bell in brass.
- `acc_cap`: the ferry cap; a plain round brass badge, no lettering.
- `acc_atlas_sash`: map paper; lines only, no writing.

**Final colours:**
- `acc_scarf_knit`: red with yellow stripes, hand-knitted.
- `acc_satchel`: a leather strap from the near shoulder across the chest, with a brass buckle. It follows the
  torso.
- `acc_glasses`: round wire frames, transparent lenses.
- `acc_atlas_pin`: a small brass compass-rose pin.
- `acc_atlas_quill`: a white quill in the hair, on the left.

**Not painted:** the Atlas lamplet, which hangs below the crop. Charms and tools are never drawn.

## 8. Batch 1: the quality bar, then the customisation proof

### Batch 1a: Phase 1, player + Suzu at the mockup's standard (do this first, then stop for Robin's approval)

| Group | Files (18 required, plus optional) |
|---|---|
| Suzu | `suzu_prep_a`, `suzu_cue`, `suzu_peak`, `suzu_settle_b`; optional `suzu_prep_b`, `suzu_settle_a`, `suzu_peak_fx` |
| Heads | `pc_head_focus`, `pc_head_cue`, `pc_head_peak`, `pc_head_settle` |
| Torso | `pc_torso_coat` |
| Arms | `pc_arm_prep_a_fitted`, `pc_arm_cue_fitted`, `pc_arm_peak_suzu_fitted`, `pc_arm_settle_suzu_fitted`; optional `pc_arm_prep_b_fitted` |
| Hair | look A's hairstyle, back and front (`pc_hair_ponytail_*` unless Robin names another: open point 1) |
| Accessories | `acc_glasses`, `acc_flower`, `acc_satchel` |

- **Look A** is Robin's acceptance look: auburn hair, a green coat, glasses, a flower and the satchel strap,
  as in the mockup.
- **Style masters (recommended):** first paint look A + Suzu complete, in real colours, at `peak` and
  `settle_b`. Then derive the layers from them. Keep style masters in a separate `refs/` folder: the importer
  accepts only contract names.

**What I return for 1a** (labelled *visual candidate awaiting approval*):
1. The principal held pose (`peak`) at **in-battle size** and at **native authoring size**, beside the
   mockup at the same footprint. The mockup comparison is shown privately, never committed.
2. Every state as a still, and the short animation as a real-time recording.
3. The cut-in in a real battle at Normal, Fast and reduced motion, with particles on and off.
4. The importer's report: each file over the template, its mask, and any unresolved pixels.

Robin **approves the direction**, or asks for changes, before anything else is painted.

### Batch 1b: Phase 2, a materially different player through the same kit

| Group | Files (9 required, plus optional) |
|---|---|
| Torso | `pc_torso_robe` |
| Arms | `pc_arm_prep_a_wide`, `pc_arm_cue_wide`, `pc_arm_peak_suzu_wide`, `pc_arm_settle_suzu_wide`; optional `pc_arm_prep_b_wide` |
| Hair | `pc_hair_curly_back`, `pc_hair_curly_front` |
| Accessories | `acc_scarf`, `acc_headband` |

**Look B** is the contrast: curly hair, a robe with wide sleeves, a scarf and a headband. It is shown with
Batch 1a's heads in a dark skin and a contrasting palette.

**What I return for 1b:** the still and the animation of look B with Suzu, assembled in battle, with the same
face quality, shading, layer alignment and energy as look A. It proves the approach; it does not limit
support to two looks.

## 9. Batches 2–4 (only after 1a and 1b are approved)

| Batch | Files | Gate |
|---|---|---|
| 2: Nao, Mio, Ren | four required states each, plus optional in-betweens, matching approved Suzu in light, head size and finish | all four pairings distinct with backing and particles off; each companion's own performance (§4) |
| 3: the full player kit | the remaining torsos, the arms for every technique in both sleeves, all 12 hairstyles back and front, any `_swing` | every supported geometry assembles without seams, detached hair or skin mismatches |
| 4: accessories and keepsakes | the rest of §7 | visible equipment correct in every assembled look |

The complete list of keys (86 required, 33 optional) is `assetKeys` in `docs/harmony/contract/registry.json`.
The published brief page has a checklist.

## 10. Delivering

- **Format:** one folder per batch, files named exactly as above, PNG with real transparency (or one flat
  #ff00ff). An optional `import.json` holds per-file hints (contract §8).
- **Editable sources welcome:** layered originals and the style masters, in a `refs/` folder beside the
  batch.
- **Rights note:** a line or two with each delivery confirming that Robin made the images with his image tool,
  may use them in this project under that tool's terms, and that they are original. It is recorded in
  `assets/harmony/PROVENANCE.md`.
- **Never committed:** Robin's mockup and other reference images.
- **Kept:** once a batch is approved, its delivered files are committed under `art/harmony/source/<batch>/`, so
  the game's exports can always be regenerated from them.
- **Import:** I run `node tools/harmony_import.mjs <folder> --suggest`, fix alignment in `import.json`, and send
  back a concrete list of anything that must be repainted.
- **Don't expect production-ready layers or temporally consistent frames from one prompt.**
  - A flattened picture is not a separated kit.
  - Expect a cleanup round per batch.
  - The importer's report is the check.

## 11. Open points for Robin

1. **Look A's hairstyle.** v2 chose the ponytail. In the mockup the hair reads as shorter, layered and wavy.
   Which of the 12 is your character's: short, bob, long, ponytail, bun, curly, spiky, braid, shaved,
   twintails, wavy or wrap?
2. **The wink.** The player's four head states are shared by all four pairings. The proposal: no wink on the
   shared head, so the wink stays Suzu's. Alternatively, one extra Suzu-only player peak head.
3. **A second head angle at `peak`.** It would need every hairstyle and hair-mounted accessory in that angle
   too (about 24 more hair files). The proposal: decide after Batch 1a.
4. **Small phones** (not your devices). At 375 × 667 and 320 × 640, faces are 52 CSS px, short of the
   addendum's ≥ 64. The compact crop can't grow further without covering the battle.
5. **Memory.** About 8 MiB at peak per cut-in (bounded to about 17 MiB by the caches), measured on the sample.
   Re-measured on Batch 1a.
