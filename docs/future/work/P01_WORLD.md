# P01 · The world proof: Reedwake, then Saltglass

*Milestone record (playbook P01, V1–V6). Authorised by Robin's C-79 (2026-10-09): "I think it's an improvement -
you may proceed." The proof is **development only**: it draws only when the page is opened with `?dev=world`, and
then only on the slice's maps. Robin's game, saves, story and every test of the game are unaffected.*

Source: `src/engine/65_worldlook.js` (the proof), hooks in `src/engine/60_render.js`. Tests: `tests/e2e/world.mjs`.
Captures: `tests/e2e/world_captures.mjs` → `docs/screenshots/world/`.

## The goal, from the target plate

The Reedwake plate (`docs/future/playbook/mockups/01_reedwake_target.webp`) is the target for material depth, light,
composition and density. What it is, measured (W00):

- **It is the real village.** At a view of about 45 tiles across, the game frames exactly the plate's composition:
  the Lantern Hall at the top, the square with its well, bench and noticeboard, the teahouse and apothecary, the
  cart and hay, the laundry line, the river with its bridge, the pier with Yasu fishing and the boat. The plate is
  that view, repainted. Compare `docs/screenshots/world/w00/camera_d1440_far.webp` with the plate.
- **Its pixels are coarser than ours.** A tile in the plate is about 37 px at 1440 wide and its pixel clusters are
  about 2 px: some 16–18 art pixels per tile. The game draws 32 art pixels per tile (characters 40×58). The gap is
  not resolution.
- **The gap is camera distance, density, light and atmosphere:**
  - the camera: the game shows 22.5 tiles across at 1440×900, the plate about 44;
  - density: the plate's ground is covered (bushes, hedges, flower beds, fences, crates, trees among the houses);
    the game's is wide flat grass;
  - buildings: thatch on stone or board walls, deep eaves, lit windows with flower boxes, chimneys with smoke;
  - water: deep blue with glints, lily pads, cattails at the banks, a bridge with posts and rope rails;
  - light: a warm low sun from the upper left, long soft shadows to the lower right, contact shadows, warm
    windows; cool, violet shade;
  - atmosphere: a sunlit haze in the upper left, softness at the plate's corners.
- **Not requirements** (playbook §16): the plate's incidental people, their placement, and anything it shows that
  the village doesn't have. The village's layout, paths and collisions stay the game's own.

## Packets

| Packet | Content | State |
|---|---|---|
| W00 | Study of the renderer and the plate; the art contract; the camera candidates; the proof's switch (`?dev=world`); its test | **Done** |
| W01 | Illumination and atmosphere: authored ambient light, the sun's cast shadows (cached per map), local lights, glow on emissive things only, haze, water glints, optional edge softness; each layer switchable | **Done** (below) |
| W02 | Reedwake's kit: ground and its transitions, foliage masses, cattails, lily pads, water, fences, flower boxes, thatch-on-stone and board houses with lit windows, smoke; footprints, contact points, occlusion; deterministic dressing in safe zones only | **Done, first pass** (below) |
| W03 | Two purposeful actions by village people (complete actions: anticipation, motion, contact, follow-through, return), stopping cleanly for conversation, staging and reduced motion | **Done** (below) |
| W04 | The Reedwake slice assembled: a doorway, water, vegetation, a light, conversation, the customizable player; a battle with Suzu and an existing creature (language UI, action banner, Harmony cut-in) from the slice; evidence (paired captures, recordings, layers on/off, overlays, start-up, frame and memory measurements) | |
| W05 | Saltglass reusing the method (stone paving, an awning, water, a profession action), the reuse report (every new regional asset listed), skin, sleeve and accessory variants, desktop and narrow, a crowded battle; the visual gate for Robin | |

## The art contract (V1, V2, V3)

**Scope.** This contract is what the proof is built to and judged by. It applies to the slice first; regions adopt
it as their kits are built.

**1. Grid and art resolution (V2).**
- The logical grid is unchanged: 16-px tiles for movement, collision, triggers and saves.
- The art grid is unchanged: 2 art pixels per logical pixel, 32 per tile; character frames 40×58 on their foot
  anchor. Candidates considered:
  - *Fewer art pixels* (16–24 per tile, as the plate): would throw away the approved hands, faces, garments and
    Harmony detail, and every asset would need redrawing. Rejected.
  - *More* (48 per tile): 2.25× the drawing for nothing the plate asks for. Rejected.
  - *32 per tile* (today's): the smallest that supports the characters already approved. **Chosen.**
- Every image is shown at a whole number of device pixels per art pixel. No fractional scaling: it would make
  pixels uneven and shimmer when the view moves.

**2. The camera (V2).**
- **The far view** frames a town as the plate does. Target tiles across: the near view's 12 (phones), 17
  (tablets) and 21 (desktops), ×1.71; the renderer then rounds to whole device pixels per art pixel.
- Measured (W00):

  | Window | Near view (today) | Far view |
  |---|---|---|
  | 1440×900, 1× | 22.5 tiles, 64 css px per tile | **45 tiles, 32 css px** (one device pixel per art pixel) |
  | 2048×1046, 1.25× | 26.7 tiles, 76.8 css px | **40 tiles, 51.2 css px** |
  | 375×667, 3× | 11.7 tiles, 32 css px | **17.6 tiles, 21.3 css px** |

- **Rooms keep the near view.** A room is small; the far view would leave it a speck in a dark surround. The
  change happens behind the doorway's fade.
- **Collision and input are unchanged.** A tap or click maps through the same function at any scale; tested at
  1440×900 and on a 375-px phone (B world 3, 4).
- **Open question for the gate:** on phones the far view makes a person about 37 css px tall (today 55). Readable
  in the captures; Robin decides on the foldable.

**3. Light (V3).**
- **One key light, the sun, from the upper left**, as the tiles and props already assume. Cast shadows fall to the
  lower right. Their length follows each thing's height; the sun's direction, colour and strength are data per
  map and story state (morning, day, evening, night), never a real clock (C-38).
- **Shade is cool, light is warm.** Shadows lean blue-violet and keep their chroma; lit faces lean warm yellow,
  as the existing ramps do. Shadows are colour, not black.
- **Local lights** (lanterns, windows, Ren's lantern): colour, radius, intensity and flicker as data. Flicker is
  cosmetic and never touches the event or task random streams.
- **Characters respond to the scene:** in shade or at night they are not evenly bright.

**4. Materials and ramps (V1).**
- Five-step, hue-shifted ramps per material (RB.tiles.addRamps), index 0 darkest.
- Shade in clusters, never single-pixel noise.
- Variation only from deterministic hashes of position.
- Each region has a short palette and material brief:
  - Reedwake: straw thatch, field stone, weathered board, river water, reeds, lush grass, warm earth.
  - Saltglass: pale stone paving, plaster, terracotta and slate, sea water, nets, awnings.

**5. Outlines and contrast (V1).**
- **Outlines:**
  - characters keep their inked outline;
  - interactable things keep an ink outline and a warm accent (as today);
  - scenery gets a selective outline in its own darker colour, on the silhouette's shaded side;
  - the ground has none.
- **Contrast hierarchy:** people and interactables highest; buildings and props next; ground lowest. Foreground
  foliage is darker and less saturated than the play space.
- **Without the atmosphere layer the base must still read:** a roof reads as straw with glow and haze off.

**6. Projection, scale and depth (V2).**
- The existing top-down three-quarter view. A thing's footprint is its tiles. It is drawn up from its ground
  contact, and it sorts by that contact.
- Heights in art pixels:
  - a person about 50 (1.6 tiles);
  - a door about 44;
  - a house wall 36 under its roof;
  - a lantern post about 46;
  - a tree 60–70.
- **Occlusion:** a person behind a tree's crown or a roof stays findable. A consistent fade or outline policy
  where critical, never revealing a hidden answer.

**7. Layers (V3).**
- Three layers, drawn in this order and each switchable:
  - **base:** the materials and forms;
  - **illumination:** ambient grade, cast shadows, local lights;
  - **atmosphere:** glow, haze, glints, edge softness.
- **Canvas-first.** Static shadow regions and material masks are cached per map; overlays change only when a
  light or an actor moves.
- **Glow applies only to authored emissive regions**, such as windows and lanterns, never to every bright pixel.
- **Edge softness** stays off the play space and is optional.

**8. Motion (V5).**
- Secondary motion (water, smoke, cloth, reeds, small creatures) runs on its own deterministic clocks, never in
  step with each other.
- Reduced motion holds a still, readable state.

**9. Dressing (V6).**
- Deterministic per map and position.
- Only in safe decorative zones. It never blocks a path, hides a clue or an interactable, or changes collision.
- Under the proof it is drawn, never added to the map's props, so nothing about play can change.

## W00 evidence

| Check | Command | Result |
|---|---|---|
| The proof's browser test (4): without `?dev=world` nothing changes (not allowed; the near view; a held frame pixel-identical with the proof absent, present but switched off, and on with every layer off); the far view in the village, the near view in a room, far again outside; a tap lands on its tile and the well and a house still block, at 1440×900 and on a 375-px phone | `node tests/e2e/world.mjs` | **4 passed, 0 failed** |
| Camera captures, near and far, at 1440×900, 2048×1046 (1.25×), 375×667 (3×) | `node tests/e2e/world_captures.mjs camera` | 6 WebP in `docs/screenshots/world/w00/` |

The only change outside the proof's own file is the renderer's `setView` hook. With nothing set, it uses exactly the
previous view rule (tested above).

## W01: illumination and atmosphere

**What it draws** (`src/engine/65_worldlook.js`; the slice's sun is data in `SLICE`):

**Cast shadows** (illumination):
- **Standing things** (trees, lanterns, the well, signs, carts, people) cast their own silhouette onto the ground,
  sheared away from the sun by their height. Flat things (water, the pier, the boat, mats) cast none.
- **Buildings** cast a box: the footprint swept by the building's height, its far corners trimmed by the hips.
  (Sheared like a billboard, a house's shadow could only fall in front of it, never beside it. Found in the first
  captures; the test caught it.)
- **One mask per map.** All the map's shadows are gathered into a single mask, built once with the static layer,
  softened once and stepped into a core and a penumbra. That keeps the shadows crisp pixel clusters, and
  overlapping shadows never darken twice.
- **How it is laid:** by multiplication with a cool violet, so the ground keeps its hue.
- **People:**
  - Each person's shadow is made the same way, once per frame of art (cached).
  - It is laid only where the map's shade isn't already; a person in shade casts no second shadow.
  - A person whose feet are in shade is shaded too.
- **Not at night:** the sun casts nothing then.

**The grade** (illumination):
- the sun's colour by overlay;
- a plain warm wash toward the sun's side and a cool one away from it;
- at night, a cool overlay over the game's own darkness and lights.

**Atmosphere:**
- glow only on lit windows and lanterns, dim by day and strong at night, each light flickering on its own phase
  (from its position, no random stream);
- glints on open water;
- a sunlit haze in the upper left;
- optional **soft edges**: the view's top and bottom bands softened, never on portrait screens. It is off by
  default because it is the costliest part (below).

**Reduced motion:** no glints, no flicker; two instants draw the same frame (tested).

**The development panel** (on a `?dev=world` page only) switches the proof, the far view, the kit, light,
atmosphere and soft edges. It offers a visit to the village in a session that is never saved, and only while no
journey is loaded, so no save slot is current and nothing can be autosaved.

**Cost**, `RB.render.frame` at 1440×900, median of three runs of 40 frames. Headless Chromium with software raster,
so pessimistic. A GPU-backed canvas (Robin's Firefox) is expected to be far cheaper; not measured here.

| Configuration | ms per frame |
|---|---|
| The game today (near view) | 2.2 |
| Far view, no layers | 6.0 (four times the pixels) |
| + light | 14.8 |
| + atmosphere only | 9.6 |
| + light and atmosphere (the default) | 17.6 |
| + soft edges | 23.6 |

- The grade was soft-light first. Measured at about 7 ms on its own, it was replaced by overlay and a wash
  (same intent, cheaper).
- The shadow pass costs about 0.6 ms: one multiply of the cached mask and a small patch per person.
- Building the mask happens once per map entry (it is counted in the test).

| Check | Command | Result |
|---|---|---|
| The proof's browser tests (6), adding to W00's four:<br>• W01's layers: each changes the frame on its own and switching them off restores the bare frame; the mask is built once across 30 frames; the ground right of the teahouse is in shade and the open square is not; reduced motion holds still; night builds no sun shadows<br>• the panel: absent without the flag; its switches work and show their state; the visit is withdrawn while a save slot is current | `node tests/e2e/world.mjs` | **6 passed, 0 failed** |
| Captures: day with every layer, without light, without atmosphere, bare, with soft edges; night with and without; the phone with and without (the kit off, W01 alone) | `node tests/e2e/world_captures.mjs light` | 9 WebP in `docs/screenshots/world/w01/` |

**Seen in the captures:**
- Light and shade read; the houses stand up from the ground.
- The village still looks sparse and flat-green, as expected: the plate's density and materials are W02's work.
- The light balance will be retuned against the kit.

## W02: Reedwake's kit (first pass)

**What it draws** (`src/engine/66_worldkit.js`; three small hooks in the renderer, all behind the proof):

| Piece | Where | How |
|---|---|---|
| Grass in sunlit and shaded patches | the open grass | the tone field: smooth noise on a 2-px grid, three steps, so the patches are clusters, not speckle; baked once into the static layer |
| Tufts, clover, flower clusters | the open grass, never under a prop or a building | flowers gather by houses' fronts (most), along paths (some), elsewhere rarely |
| The square's edge | the cobbles beside grass | grass creeps over the outer stones in a ragged, clumped line, carrying the grass's own texture across, with a dark rim where it overhangs |
| The river | water tiles, and the water drawn inside bridge tiles | deepened toward the brief's deep blue (darker pixels more; the banks' foam stays light) |
| Lily pads | still water, mostly near the banks, never by the bridge | each with its own shade on the water, a notch, a few in flower |
| Cattails | the game's reed tiles (already solid) | irregular clumps in twelve variants by position, taller toward the water, leaning, brown heads, broad blades, a slow sway (held with reduced motion) |
| The broken span | the bridge's missing planks (a water prop until the mill is settled) | the river's deep blue, with splintered plank ends where the boards remain |
| Bridge rails | along the outer edges of the intact bridge tiles | posts every two tiles, a sagging rope between; behind or in front of people by y-sort |
| Ducks | three, on the river | slow loops up and down the channel, each on its own clock; still with reduced motion |
| Houses | the game's own house | lit within by day, with a flower box under each window and a planter by the door, on the wall's own footprint |
| Low growth (ferns, flowering shrubs) | open grass in safe places only | knee-high, walked through like the game's tall grass; most against the sides of houses; casts a small shadow |

**Safety rules, each tested:**
- **Collisions unchanged:** every tile's collision is the same with the kit on and off (B world 7).
- **Low growth only in safe places:** never on a path, a prop, a building, an exit or a trigger; never within a
  tile of anything you can use; never in a door's approach (3×2 in front); never at or beside anyone's place.
  The village has over 20 pieces and none breaks a rule (B world 7).
- **The reveal rule for tall pieces:** someone standing just behind a clump of cattails (up to two tiles above,
  within a tile either side) thins it to half, so people stay findable. Yasu on the pier was half hidden before
  this rule (seen in a capture).
- **Deterministic:** two builds of the static layer give the same pixels (B world 7).

**Cost** (headless software raster, 1440×900):
- **A map's first frame** (static layer, shadow mask and the frame), median of five:
  - proof off: 68 ms;
  - far view without the kit: 296 ms;
  - with the kit: 488 ms.

  This is once per map entry, while the doorway's fade is dark: the renderer draws a frame in advance
  (`prewarm`).
- **Steady frame**, kit, light and atmosphere on: 17.5 ms.
- **Memory:** the static layer 7.7 MB and the shadow mask 7.7 MB (decoded RGBA, the village at the far view's
  margin), and 199 cached sprites.
- **To improve before a real region adopts the kit** (noted, not done):
  - make the mask's per-object silhouettes cheaper (one pixel read per object today);
  - keep the mask at alpha only, or at half resolution.

**Seen in the captures** (`docs/screenshots/world/w02/`):
- **Closer to the plate:**
  - the river reads as a river (deep blue, cattails, pads, ducks);
  - the square sits in the grass;
  - the houses look lived in;
  - the open grass has life.
- **Still short of it:**
  - big trees among the houses, and hedges and fences around gardens. These would change where people can walk;
    the proof doesn't touch collision, so they wait for a region's real layout (and Robin's view on density);
  - the houses keep the game's plaster-and-timber and board walls (the plate shows stone); materials are a
    question for the gate.

| Check | Command | Result |
|---|---|---|
| The proof's browser tests (7), adding W02's: collisions unchanged with the kit on and off; low growth only in safe places; the static layer the same in two builds; the reveal rule; the kit changes the frame | `node tests/e2e/world.mjs` | **7 passed, 0 failed** |
| Captures: the game and the proof at the same moment (desktop and phone), the kit off, the camera only, night, 2048×1046; close-ups at 3× of the square, the river and bridge, a house front | `node tests/e2e/world_captures.mjs kit` | 14 WebP in `docs/screenshots/world/w02/` |

## W03: two purposeful actions

`src/engine/67_worldacts.js`. Two people who already stand where the work is:

**Yasu fishes from the pier.** Each round has eleven steps:
1. ready, the rod drawn back;
2. the cast;
3. the line flying out;
4. the float landing past the jetty with a ring;
5. the wait, the float bobbing;
6. a nibble (the float dips twice);
7. the bite;
8. the strike, the rod bending;
9. the reel, the float coming in;
10. either a catch (the fish lifted out, held in his hands to unhook, dropped into the basket at his feet) or a
    miss (an empty hook, a small shake of the head);
11. baiting again.

About two rounds in three end in a catch, from a hash of the round. The rod, line, float, rings and fish are
drawn in the world beside him, from his hands in each pose.

**Tomo folds the dry washing beside the line.** Each round:
- bending to the basket in front of her for a cloth;
- the anticipation (a lift) and two snaps to shake it out;
- folding it in half, then again;
- laying it on the stack, which grows at the touch;
- stepping back.

Every fifth round she lifts the folded stack into the basket.

**Rejected on the way:** pegging cloths on the line. From where she stands, her raised hands fall well short of the
line, so the line gained a cloth with no hand there. That fails "contact" (V5), and sliding her a tile to reach it
would fail V4 (no sliding). It was replaced by an action she can do where she stands.

**The rules each keeps:**
- **Nobody moves:** no tile, position or facing changes. The drawn facing is presentation, as with every staged
  pose.
- **They yield to the game:** while anyone talks, a scene stages the person, they walk, or the world isn't in play,
  the person is the game's own (Yasu's rod rests against the post). Afterwards the round begins again from its
  start.
- **Reduced motion** holds one still, readable pose: the float resting on the water, a cloth folded at the chest.
- **No random stream:** timing comes from the frame's time and each person's own offset; outcomes come from hashes.
- **The poses are new keys in the pose layer**, added only when the proof first draws an action:
  `rodready castback castfwd rodhold strike reel1 reel2 unhook stoop shakeout1 shakeout2 fold1 fold2 placeit
  lookback`. They use the existing arm targets.

| Check | Command | Result |
|---|---|---|
| The proof's browser tests (9), adding W03's:<br>• over a full round each, the expected poses all appear and nobody's tile, position or facing changes<br>• a round's outcome is the same every time, and 30 to 50 of 60 rounds end in a catch<br>• the stack counts<br>• opening a conversation makes the action yield, and it restarts from 'ready' afterwards<br>• reduced motion holds one pose, and a frame with the kit and its actions is the same at two instants<br>• talking to Yasu mid-cast opens the game's own conversation | `node tests/e2e/world.mjs` | **9 passed, 0 failed** |
| Key-frame strips at 3×, one frame from the middle of each step: Yasu's catch and miss, Tomo's folding and clearing | `node tests/e2e/world_captures.mjs acts` | 4 WebP in `docs/screenshots/world/w03/` |

**Not yet:**
- recordings at normal speed (W04's evidence);
- a person's look at play speed: whether the actions read as purposeful without the labels (Robin's eye).

