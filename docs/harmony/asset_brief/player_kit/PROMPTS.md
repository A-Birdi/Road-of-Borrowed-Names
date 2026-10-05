# Player kit reference sheets: prompts for the image tool

The approach proposed on 2026-10-05, for which Robin asked for these prompts: the player's Harmony kit is drawn **in
code** from whole-character pictures of the player, the way the companions' seven-frame cut-ins were (Suzu, Nao, Mio,
Ren). The image tool paints whole pictures; the layers (heads, torsos, brush arms in both sleeves, hair back and front,
accessories) are measured from them and drawn in the key colour families, so every layer separates cleanly and fits
every other. This replaces asking the tool for separated layer files (ASSET_BRIEF.md §8.0 Track A, step A3).

**How to send them (revised after the first attempt).** Asking for all nine at once, in a conversation that still held
the companions' pose-guide pages, made the tool redraw those pages. So:
- Start a new, empty conversation in the image tool.
- One sheet per message, Sheet 1 first: the sheet's cover prompt, then the shared rules, then the sheet itself.
- Attach only the pictures that sheet lists. Attaching this document is optional; the cover prompt says to follow it,
  never draw it.
- Every later sheet attaches Sheet 1 as the lock for the face, the head angle and the scale.
- Attachments: the approved paired picture and the companions' four-tile sheets are Robin's (**never committed**);
  `ref_player_hairstyles.png` and `ref_player_wear.png` are in this folder's parent (shapes only).
- What comes back: PNG with real transparency or flat #FF00FF magenta (never black), tiles edge to edge, no text.

## Shared rules (every sheet, after its cover prompt)

```text
You are drawing pixel-art pictures of one game character, the player. These rules apply to every picture.

STYLE
- Match the style and finish of the attached approved pictures exactly: the Suzu four-tile sheet and the paired picture of Suzu with the player.
- Crisp square pixels at one consistent pixel size. Rich painted anime shading built from a few flat tones per shape: no gradients, no blur, no soft airbrushing.
- A selective dark outline that lightens inside shapes. Warm light from the upper left. A cool lavender rim light on the outer upper-left edges.
- The same pixel density as the Suzu sheet: the player's head is about the same size in its tile as Suzu's head in hers.

THE PLAYER
- One person in every tile of every sheet: the player character on the right of the approved paired picture, the one holding the large calligraphy brush. Copy their face exactly: face shape, eyes, nose, mouth, proportions and dark brown eyes. Only the hair, skin tone, clothing and accessories change, and only where a sheet asks for it.
- The brush, whenever it appears: a large calligraphy brush with a black lacquered shaft, a brass ferrule, a small tassel at the end of the shaft, and cream bristles with black ink at the tip. Always the same size.
- The brush is always in the player's LEFT hand, the hand on the screen-right side. In every grip the thumb wraps round the shaft and points inward, toward the player's body, and the fingers curl round the other side. Never a backwards, mirrored or twisted hand.
- The outfit is identical in every tile: the same collar, toggles, trim, sleeves and satchel strap. The strap always runs the same way across the chest, from the same shoulder, with the buckle in the same place.

FRAMING (the most important part: the sheets are cut into layers that must line up)
- Every tile is a bust on a 6:5 canvas (about 687 × 572 px), at the same scale and placement as the player in the approved paired picture.
- The player's head sits a little left of centre, turned three-quarter toward screen LEFT, toward where the companion stands. The shoulders run off the bottom edge. The brush arm and its gesture are on the RIGHT side of the tile.
- The head keeps exactly the same angle, size and position in every tile of every sheet. Do not tilt, turn, raise or lower it between tiles. Only the expression changes: eyes, lids, brows, mouth and cheeks.
- The neck stays in the same place. The body may move a few pixels with a breath or a gesture, and the near shoulder may rise with the brush arm.
- The brush, the hands and any ink never pass over the face.

BACKGROUND AND FORMAT
- Real transparency, or a flat solid #FF00FF magenta background. Never black, white, grey, a gradient or a painted checkerboard.
- The tiles touch edge to edge in a regular grid: no gaps, borders, frames, grid lines, labels, numbers, text, signatures or watermarks.
- Only the player in each tile: no other characters, no scenery, no ink band, no torn-paper frame, no vignette, no camera zoom.
- Effects such as ink trails and drops appear only where a sheet asks for them: small, hard-edged pixel shapes, never over the face or the brush hand.
```

## Sheet 1: The base player, look A (2 × 2)

Attach: the approved paired picture; Suzu's four-tile sheet.

Cover prompt:

```text
Make ONE new picture: Sheet 1 of the player kit, described in the text below. Make only this sheet, nothing else.

Draw: the player, the person on the RIGHT of the attached paired picture who holds the large calligraphy brush, four times, in four moments of one motion (focus, cue, peak, settle).

Do not draw: Suzu, Nao, Mio, Ren or anyone else; a reference page, pose guide, diagram or document page; captions, labels, titles, text, arrows, boxes, colour swatches or grid lines; a copy or redraw of any attached picture.

What the attachments are for:
- The paired picture of Suzu with the player: the player's face, hair, outfit and the art style. Copy the player exactly; leave Suzu out.
- The Suzu four-tile sheet: the finish and the 2 × 2 layout only. Do not draw Suzu.
- Any attached document is written instructions: follow it, never draw it.

The picture: a 2 × 2 grid of four tiles of pixel-art busts, the tiles edge to edge, on a transparent or flat #FF00FF magenta background. Nothing else in the picture.
```

The sheet:

```text
SHEET 1 OF 9: THE BASE PLAYER, LOOK A (2 × 2 grid, four tiles)

Attach: the approved paired picture of Suzu with the player; the Suzu four-tile sheet.

Look A, exactly as in the approved paired picture:
- light skin, dark brown eyes;
- auburn hair in a ponytail, tied at the back of the head with a gold tie;
- round, thin wire glasses with clear lenses, the eyes fully drawn behind them;
- a small pink sakura flower in the hair, placed as in the paired picture;
- a green coat with gold trim, gold toggles and gold cuff bands on fitted sleeves;
- a brown leather satchel strap from the near shoulder across the chest, with a brass buckle (the bag itself is below the bottom edge);
- the large calligraphy brush, in the hand on the right side of the tile.

The four tiles are one short, energetic motion: the player's half of the Suzu pairing, read left to right, top to bottom. The head stays identical in angle and position in all four; only the expression and the brush arm change.

1. Top left, "focus": composed and grounded, a held breath before the move. Eyes intent toward screen left, brows level, mouth closed and calm. The brush hand gathered at the chest, the brush held upright close to the body, bristles up. No ink, no effects.
2. Top right, "cue": catching the cue. The eyes brighten and open a little wider, the brows lift, the lips part in a beginning smile. The brush arm starts its arc: the elbow rises and the brush lifts out to the right and upward, bristles leading. A small bead of ink at the tip.
3. Bottom left, "peak": the player's pose from the approved paired picture. An open, excited smile with both eyes open (no wink). The brush swept out to the right at full extension in an ink sweep, with a short, hard-edged arc of ink trailing from the bristles, kept away from the face.
4. Bottom right, "settle": a warm, satisfied smile with relaxed lids. The brush drawn back and held across the chest at a calm diagonal, the ink sweep gone, the shoulders relaxed.
```

## Sheet 2: Look B, the customisation proof (2 × 2)

Attach: Sheet 1; the player hairstyles and player wear pages.

Cover prompt:

```text
Make ONE new picture: Sheet 2 of the player kit, described in the text below. Make only this sheet, nothing else.

Draw: the same player in look B (deep brown skin, black curly hair, a white headband, a rust-orange robe with wide sleeves, a teal scarf), in the same four moments and poses as Sheet 1.

Do not draw: Suzu, Nao, Mio, Ren or anyone else; a reference page, pose guide, diagram or document page; captions, labels, titles, text, arrows, boxes, colour swatches or grid lines; a copy or redraw of any attached picture.

What the attachments are for:
- Sheet 1 (your earlier picture of the player): the face, head angle, poses and scale to keep.
- The "Player hairstyles" page from the game: only which hairstyles exist, at low detail. Never copy its look, layout, frames or text.
- The "Player wear" page from the game: only which shapes exist, at low detail. Never copy its look, layout, frames or text.
- Any attached document is written instructions: follow it, never draw it.

The picture: a 2 × 2 grid of four tiles of pixel-art busts, the tiles edge to edge, on a transparent or flat #FF00FF magenta background. Nothing else in the picture.
```

The sheet:

```text
SHEET 2 OF 9: LOOK B, THE CUSTOMISATION PROOF (2 × 2 grid, four tiles)

Attach: Sheet 1 (the lock for identity, poses and scale); the "Player hairstyles" and "Player wear" reference pages (they show the shapes only; paint at Sheet 1's standard, not their low detail).

Exactly the same four tiles as Sheet 1: the same head angle and position, the same four expressions, the same brush arm and brush positions. Only the look changes, to look B:
- the same face, in deep brown skin (the darkest skin tone);
- black curly hair: a full, rounded mass of tight curls around the whole head, with a short fringe of curls;
- a plain white cloth headband across the hair;
- a rust-orange robe with cream trim along the crossed collar, the front edge and the cuffs. The robe has WIDE sleeves: a deep, open sleeve mouth that hangs from the brush arm;
- a teal cloth scarf wrapped once round the neck, one short end hanging in front;
- no glasses, no flower, no satchel. The same brush.

Show the wide sleeve clearly in every pose. In "focus" and "settle" it hangs open below the forearm. In "cue" and "peak" it falls back toward the elbow from the raised forearm and swings with it.
```

## Sheet 3: The other three pairings, look A (3 across × 2 down)

Attach: Sheet 1; the Nao, Mio and Ren four-tile sheets.

Cover prompt:

```text
Make ONE new picture: Sheet 3 of the player kit, described in the text below. Make only this sheet, nothing else.

Draw: the player in look A, six times: the peak and the settle brush gestures for the Nao, Mio and Ren pairings.

Do not draw: Suzu, Nao, Mio, Ren or anyone else; a reference page, pose guide, diagram or document page; captions, labels, titles, text, arrows, boxes, colour swatches or grid lines; a copy or redraw of any attached picture.

What the attachments are for:
- Sheet 1: the player, the head and the scale to keep.
- The Nao, Mio and Ren four-tile sheets: only to see what each companion does at that moment. Do not draw them.
- Any attached document is written instructions: follow it, never draw it.

The picture: a grid of six tiles, 3 across and 2 down of pixel-art busts, the tiles edge to edge, on a transparent or flat #FF00FF magenta background. Nothing else in the picture.
```

The sheet:

```text
SHEET 3 OF 9: THE OTHER THREE PAIRINGS, LOOK A (3 across × 2 down, six tiles)

Attach: Sheet 1; the Nao, Mio and Ren four-tile sheets (to see what each companion does at the same moment).

Look A, exactly as in Sheet 1. The head is copied from Sheet 1: in the top row it is Sheet 1's "peak" head (open, excited smile), in the bottom row Sheet 1's "settle" head (warm, satisfied smile). Only the brush arm and the brush change between tiles.

Top row, the peaks:
1. Top left, with Nao ("Read the Opening": following Nao's cue). The brush arm extended straight out to the right at shoulder height, the brush held like a pointer along one precise line, bristles leading, as if sending a thread along the route Nao drew. A thin, straight ink line trails behind the tip.
2. Top middle, with Mio ("Clearwater Draught": guiding the ink). The brush raised up and out to the right, above shoulder height, and tipped so the bristles point down, a single round drop of ink falling from the tip. The wrist soft and open: careful, not forceful.
3. Top right, with Ren ("Lantern Ward": a coordinated seal). The brush held level at chest height, the arm extended to the right, just finishing a firm, short vertical stroke: a short horizontal ink line with a short vertical tick at its right end, like a seal being closed.

Bottom row, the settles (each follows the peak above it):
4. Bottom left, after Nao: the brush drawn back toward the chest, held level and taut as if pulling a thread tight, the elbow tucked in.
5. Bottom middle, after Mio: the brush lowered and held upright in front of the chest, bristles up, the hand relaxed around the shaft.
6. Bottom right, after Ren: the brush held vertical in front of the near shoulder, steady, like a closed seal; the posture upright and still.
```

## Sheet 4: The same six poses in look B's robe (3 across × 2 down)

Attach: Sheets 2 and 3.

Cover prompt:

```text
Make ONE new picture: Sheet 4 of the player kit, described in the text below. Make only this sheet, nothing else.

Draw: the player in look B, six times, in exactly the six brush gestures of Sheet 3.

Do not draw: Suzu, Nao, Mio, Ren or anyone else; a reference page, pose guide, diagram or document page; captions, labels, titles, text, arrows, boxes, colour swatches or grid lines; a copy or redraw of any attached picture.

What the attachments are for:
- Sheet 2: look B to keep.
- Sheet 3: the six poses to copy.
- Any attached document is written instructions: follow it, never draw it.

The picture: a grid of six tiles, 3 across and 2 down of pixel-art busts, the tiles edge to edge, on a transparent or flat #FF00FF magenta background. Nothing else in the picture.
```

The sheet:

```text
SHEET 4 OF 9: THE SAME SIX POSES IN LOOK B'S ROBE (3 across × 2 down, six tiles)

Attach: Sheet 2 and Sheet 3.

Exactly the six tiles of Sheet 3, in the same order, with the same brush arm and brush positions, but in look B from Sheet 2: deep brown skin, black curly hair, the white headband, the rust-orange robe with WIDE sleeves, the teal scarf. The heads are Sheet 2's "peak" head in the top row and Sheet 2's "settle" head in the bottom row.

Show how the wide sleeve hangs in each pose: it falls back toward the elbow when the forearm is raised, and hangs open below the forearm when the arm is level or lowered.
```

## Sheet 5: Hairstyles 1–6 (3 across × 2 down)

Attach: Sheet 1; the player hairstyles page.

Cover prompt:

```text
Make ONE new picture: Sheet 5 of the player kit, described in the text below. Make only this sheet, nothing else.

Draw: the player's head and shoulders six times, each with a different hairstyle: short, bob, long, ponytail, bun, curly.

Do not draw: Suzu, Nao, Mio, Ren or anyone else; a reference page, pose guide, diagram or document page; captions, labels, titles, text, arrows, boxes, colour swatches or grid lines; a copy or redraw of any attached picture.

What the attachments are for:
- Sheet 1: the head to keep (angle, size, position, face).
- The "Player hairstyles" page from the game: only which hairstyles exist, at low detail. Never copy its look, layout, frames or text.
- Any attached document is written instructions: follow it, never draw it.

The picture: a grid of six tiles, 3 across and 2 down of pixel-art busts, the tiles edge to edge, on a transparent or flat #FF00FF magenta background. Nothing else in the picture.
```

The sheet:

```text
SHEET 5 OF 9: HAIRSTYLES 1–6 (3 across × 2 down, six tiles)

Attach: Sheet 1; the "Player hairstyles" reference page (shapes only; paint at Sheet 1's standard).

Every tile shows the same head as Sheet 1's "focus" tile, at exactly the same angle, size and position, with the same calm "focus" expression, light skin and dark brown eyes. Only the hairstyle changes.
- All six in the same medium chestnut-brown hair, with gold ties where a style has them, so only the shapes differ.
- No glasses, no flower, no accessories, no satchel strap.
- The green coat's collar and shoulders as in Sheet 1. The brush arm is lowered out of the frame, so nothing covers the hair.
- Show every part of the hair clearly: what lies behind the head, neck and shoulders, as well as the fringe and the locks in front.

1. Top left, short: a short layered cut with a side-swept fringe; the tops of the ears show.
2. Top middle, bob: a chin-length bob with a full, straight fringe; the ends curve in at the jaw.
3. Top right, long: straight hair falling well past the shoulders, with a fringe; some locks fall in front of the shoulders, the rest hangs behind.
4. Bottom left, ponytail: Sheet 1's ponytail exactly, with its gold tie in the same place.
5. Bottom middle, bun: the hair gathered into a round bun high at the back of the crown, a short fringe, a few loose strands at the temples.
6. Bottom right, curly: a full, rounded mass of tight curls around the whole head with a short fringe of curls (the same style as look B).
```

## Sheet 6: Hairstyles 7–12 (3 across × 2 down)

Attach: Sheets 1 and 5; the player hairstyles page.

Cover prompt:

```text
Make ONE new picture: Sheet 6 of the player kit, described in the text below. Make only this sheet, nothing else.

Draw: the player's head and shoulders six times, each with a different hairstyle: spiky, braid, shaved, twintails, wavy, wrap.

Do not draw: Suzu, Nao, Mio, Ren or anyone else; a reference page, pose guide, diagram or document page; captions, labels, titles, text, arrows, boxes, colour swatches or grid lines; a copy or redraw of any attached picture.

What the attachments are for:
- Sheet 1 and Sheet 5: the head and the hair colour to keep.
- The "Player hairstyles" page from the game: only which hairstyles exist, at low detail. Never copy its look, layout, frames or text.
- Any attached document is written instructions: follow it, never draw it.

The picture: a grid of six tiles, 3 across and 2 down of pixel-art busts, the tiles edge to edge, on a transparent or flat #FF00FF magenta background. Nothing else in the picture.
```

The sheet:

```text
SHEET 6 OF 9: HAIRSTYLES 7–12 (3 across × 2 down, six tiles)

Attach: Sheet 1; Sheet 5; the "Player hairstyles" reference page.

The same rules as Sheet 5: the same head, angle, size, position and calm expression as Sheet 1's "focus" tile; the same medium chestnut-brown hair with gold ties; no glasses, flower, accessories or satchel strap; the brush arm out of the frame.

1. Top left, spiky: short, strong spikes standing up and out all over, with a spiky fringe.
2. Top middle, braid: one thick braid that starts behind the near ear (screen right) and falls forward over the near shoulder, tied with a gold band near its end; a fringe.
3. Top right, shaved: a close buzz cut. The whole head shape and both ears are fully visible, with only a soft shadow of stubble over the scalp.
4. Bottom left, twintails: two tails tied high on either side of the head with gold ties, falling past the shoulders; a fringe.
5. Bottom middle, wavy: long, loose waves past the shoulders, with volume at the sides and a soft fringe.
6. Bottom right, wrap: a cloth head wrap covering all the hair, wound round the head with a knot and a short flap at the back; a little fringe shows at the forehead. The wrap is plain cream cloth with a light woven texture, not patterned.
```

## Sheet 7: Garments (3 across × 2 down)

Attach: Sheet 1; the player wear page.

Cover prompt:

```text
Make ONE new picture: Sheet 7 of the player kit, described in the text below. Make only this sheet, nothing else.

Draw: the player six times, each in a different garment: tunic, robe, coat, apron, dress, and the dress again in the peak pose.

Do not draw: Suzu, Nao, Mio, Ren or anyone else; a reference page, pose guide, diagram or document page; captions, labels, titles, text, arrows, boxes, colour swatches or grid lines; a copy or redraw of any attached picture.

What the attachments are for:
- Sheet 1: the player and the pose to keep.
- The "Player wear" page from the game: only which shapes exist, at low detail. Never copy its look, layout, frames or text.
- Any attached document is written instructions: follow it, never draw it.

The picture: a grid of six tiles, 3 across and 2 down of pixel-art busts, the tiles edge to edge, on a transparent or flat #FF00FF magenta background. Nothing else in the picture.
```

The sheet:

```text
SHEET 7 OF 9: GARMENTS (3 across × 2 down, six tiles)

Attach: Sheet 1; the "Player wear" reference page (shapes only).

Every tile is Sheet 1's "focus" tile: the same head, angle, position and calm expression, the same auburn ponytail, the brush hand gathered at the chest with the brush upright. But there are no glasses, no flower and no satchel strap. Every garment is in the same green with gold trim as Sheet 1's coat, so only the cut differs.

The fitted sleeve: the tunic, the coat, the apron and the dress all use one identical fitted sleeve with the same narrow gold cuff band. One set of brush arms has to fit all four.

1. Top left, tunic: a simple tunic with a wrap-front V neckline edged in a narrow trim; fitted sleeves.
2. Top middle, robe: a long robe with a crossed collar edged in trim, and WIDE, deep, open sleeves hanging from the arms.
3. Top right, coat: Sheet 1's coat exactly.
4. Bottom left, apron: a cream apron bib over the tunic, its straight top edge across the chest and its straps over the shoulders. The bib is cream, not green.
5. Bottom middle, dress: a dress with a rounded neckline and small puffed sleeve heads at the shoulders, above the fitted sleeves.
6. Bottom right: the dress again, in Sheet 1's "peak" pose (Sheet 1's "peak" head and the same extended brush arm), to show the puffed shoulder and the fitted sleeve with the arm raised.
```

## Sheet 8: Head and ear accessories (3 across × 2 down)

Attach: Sheets 1 and 5; the player wear page.

Cover prompt:

```text
Make ONE new picture: Sheet 8 of the player kit, described in the text below. Make only this sheet, nothing else.

Draw: the player's head six times, each wearing one accessory: a straw hat, a ferry cap, a ribbon, a maple-leaf pin, a quill, earrings.

Do not draw: Suzu, Nao, Mio, Ren or anyone else; a reference page, pose guide, diagram or document page; captions, labels, titles, text, arrows, boxes, colour swatches or grid lines; a copy or redraw of any attached picture.

What the attachments are for:
- Sheet 1: the head to keep. Sheet 5: the short hairstyle to use.
- The "Player wear" page from the game: only which shapes exist, at low detail. Never copy its look, layout, frames or text.
- Any attached document is written instructions: follow it, never draw it.

The picture: a grid of six tiles, 3 across and 2 down of pixel-art busts, the tiles edge to edge, on a transparent or flat #FF00FF magenta background. Nothing else in the picture.
```

The sheet:

```text
SHEET 8 OF 9: HEAD AND EAR ACCESSORIES (3 across × 2 down, six tiles)

Attach: Sheet 1; Sheet 5; the "Player wear" reference page (identity only).

Every tile: Sheet 1's "focus" head at exactly the same angle, size and position, with the SHORT hairstyle from Sheet 5 (tile 1) in chestnut brown, so each piece sits close to the head; the plain green coat; no glasses, flower or satchel strap; the brush arm out of the frame. One accessory per tile, at a natural size.

1. Top left, the terrace straw hat: a wide-brimmed woven straw hat with a darker band, sitting level on the head and covering it down to the band.
2. Top middle, the ferry cap: a soft, round navy cap with a short peak and a plain round brass badge at the front (no lettering).
3. Top right, the faded ribbon: a pink ribbon bow in the hair on the near side (screen right), above the ear.
4. Bottom left, the maple-leaf hairpin: a red maple-leaf pin in the hair on the near side, above the ear.
5. Bottom middle, the quill: a long white quill feather tucked into the hair on the near side, pointing up and back.
6. Bottom right, the earrings: a small gold hoop in each ear with a hanging pale-teal glass bead. The far earring shows partly, behind the jaw.
```

## Sheet 9: Neck, chest and back accessories (3 across × 2 down)

Attach: Sheets 1 and 8; the player wear page.

Cover prompt:

```text
Make ONE new picture: Sheet 9 of the player kit, described in the text below. Make only this sheet, nothing else.

Draw: the player six times, each wearing one neck, chest or back accessory: a cape, a map-paper sash, a bell, a compass pin, a knitted scarf, then all the chest pieces together.

Do not draw: Suzu, Nao, Mio, Ren or anyone else; a reference page, pose guide, diagram or document page; captions, labels, titles, text, arrows, boxes, colour swatches or grid lines; a copy or redraw of any attached picture.

What the attachments are for:
- Sheet 1: the head to keep. Sheet 8: the short hair and plain coat to keep.
- The "Player wear" page from the game: only which shapes exist, at low detail. Never copy its look, layout, frames or text.
- Any attached document is written instructions: follow it, never draw it.

The picture: a grid of six tiles, 3 across and 2 down of pixel-art busts, the tiles edge to edge, on a transparent or flat #FF00FF magenta background. Nothing else in the picture.
```

The sheet:

```text
SHEET 9 OF 9: NECK, CHEST AND BACK ACCESSORIES (3 across × 2 down, six tiles)

Attach: Sheet 1; Sheet 8; the "Player wear" reference page (identity only).

The same base as Sheet 8: Sheet 1's "focus" head with the short chestnut hair, the plain green coat, no glasses, flower or satchel strap, and the brush arm out of the frame so the chest is clear. One accessory per tile, except the last.

1. Top left, the traveller's cape: a short shoulder cape in deep plum-red, falling over both shoulders and fastened at the front of the neck with a round brass clasp. Show the part behind the shoulders too.
2. Top middle, the map-paper sash: a sash of pale map paper with fine drawn lines (no writing), worn diagonally from the near shoulder across the chest.
3. Top right, the tiny bell: a small brass bell on a red cord around the neck, resting on the chest.
4. Bottom left, the compass-rose pin: a small brass compass-rose pin on the near side of the chest.
5. Bottom middle, the hand-knitted scarf: a red scarf with yellow stripes and a visible knit texture, wrapped round the neck with a short end hanging in front.
6. Bottom right, all the chest pieces worn together, to show how they stack: the satchel strap from Sheet 1 underneath, then the map-paper sash, the bell, the compass-rose pin, and the cape over the shoulders on top.
```

## What each sheet gives

| Sheet | Layers drawn from it |
|---|---|
| 1 | the four head expressions; the coat; the brush arm for focus, cue, peak and settle with Suzu (fitted); the ponytail; glasses, flower, satchel |
| 2 | the robe; the same arms in the wide sleeve; curly hair; scarf; headband; dark skin keeping its shading |
| 3, 4 | the peak and settle arms with Nao, Mio and Ren, in both sleeves |
| 5, 6 | all twelve hairstyles, back and front |
| 7 | tunic, apron and dress, and the one fitted sleeve shared by every fitted cut |
| 8, 9 | the remaining eleven accessories and their stacking order |

The in-between states (prep_b, cue_b, settle_a) are drawn in code, as for the companions.
