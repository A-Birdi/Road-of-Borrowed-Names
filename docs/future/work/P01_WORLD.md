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
| W00 | Study of the renderer and the plate; the art contract; the camera candidates; the proof's switch (`?dev=world`); its test | **Done** (this record) |
| W01 | Illumination and atmosphere: authored ambient light, the sun's cast shadows (cached per map), local lights, glow on emissive things only, haze, water glints, optional edge softness; each layer switchable | Next |
| W02 | Reedwake's kit: ground and its transitions, foliage masses, cattails, lily pads, water, fences, flower boxes, thatch-on-stone and board houses with lit windows, smoke; footprints, contact points, occlusion; deterministic dressing in safe zones only | |
| W03 | Two purposeful actions by village people (complete actions: anticipation, motion, contact, follow-through, return), stopping cleanly for conversation, staging and reduced motion | |
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
