# P01 · The fidelity study: Suzu at the Mill

*Asked for by Robin with the gate's answer (C-80, 2026-10-10). Development only, like the world proof: it opens from
the proof's panel on a `?dev=world` page (or `?dev=world&study=mill`) and changes nothing in the game, its saves or
its tests.*

> **A test, not a standard (C-81, 2026-10-10).** Robin: "it's both an upgrade and a step away in some places,
> especially from the vision I have for the perspective. As a whole, disregard this as an authoritative process -
> keep it noted as a test". Nothing in the study is adopted as the art direction; the perspective is Robin's to set,
> and Robin's detailed feedback will come with the review at the end of the expansion. The study stays in the build
> as a development-only page.

## The brief, in Robin's words

- "Would you be able to redraw Suzu in as close detail as possible to the mockup, totally from scratch? Only use her
  existing sprite as reference here. The world around her too - place her in front of the Mill alone."
- "Reference Octopath Traveler … for another idea of the graphical fidelity asked for. They're made of crisp, defined
  pixels rather than shapes."
- "It should render as it would be in game, not just a pretty image. Animate a simple idle pose loop with that new
  fidelity and show me it here, including scenery animation."
- "If that requires changing the dimensions of sprites, that's fine, as long as it reads well and actually looks like
  extremely detailed pixel art. The animations would follow suit, keeping fluid style and looking elegant versus
  stiff."
- The end goal: "pixel depth, shading, lighting, blur (focus), scenery depth".

## What was built

**A mode of the game, not a picture.**
- The study draws into the game's own art-resolution buffer through the renderer's full-screen override, every frame,
  at the same whole-number pixel scale as the world.
- It builds the scene from the real map, `rw.millroad`: its terrain, the mill's footprint and door, the wheel and race,
  the river and reeds, the scattered trees, the forest edge, the ridge, the boulder.
- It opens from the world proof's panel ("Study: Suzu at the Mill") or with `?dev=world&study=mill`. Escape or Close
  returns to whatever was on screen.
- No journey, save slot or game state is involved. Without the development switch it does not exist for the player.

**Five modules, all new** (`src/engine/68a`–`68e`):

| Module | What it holds |
|---|---|
| `68a_studykit.js` | Hue-shifted ramps of 8–10 steps per material (shadows toward violet, highlights toward gold), an RGBA pixel buffer written pixel by pixel, coverage tests at 4×4 samples (every edge a deliberate stair), tapered curves for locks of hair, hashes and value noise (no random stream) |
| `68b_studymill.js` | The ground, the water, the trees and undergrowth, the shadows, the plants that sway, the clearing's small life |
| `68c_studyhouse.js` | The mill, the lean-to and the wheel |
| `68e_studysuzu.js` | Suzu, in layers, and her idle |
| `68d_study.js` | The mode, the cameras, and the lens (light shafts, grade, bloom, depth of field, vignette) |

### The world around her

- **Ground.**
  - Calm tonal patches of grass with ragged, not noisy, edges. The texture lives in a handful of designed tuft shapes
    (highlight, mid, the shadow beneath), placed sparsely, with clover sprigs and clustered wildflowers.
  - The first version varied every pixel and read as static; that was replaced.
  - The path is packed earth, sunken a little: shaded under its north edge, a lit lip on its south edge, grass leaning
    over both, pebbles.
  - The forest floor is ordinary grass darkened by the canopy's real shadows, with sun flecks through the leaves. An
    earlier version darkened it per tile and showed a grid.
- **Water.**
  - The river flowing south and the mill race flowing west into the wheel, each a seamless loop of 16 frames.
  - Short ripple arcs drift with the flow, foam runs along the banks, and a few glints twinkle.
- **Trees.** Each is built from leaf clusters on a dome, each cluster lit as a small sphere from the upper left and
  layered back to front. The edges are notched like leaves, and there's a dark crevice wherever a front cluster
  overlaps one behind. Undergrowth fills the gaps at the forest's edge. Trees at the edge sway a pixel in three bands.
  Every tree casts a dappled shadow to the lower right.
- **The mill**, raised so its door is about Suzu's height. In the first version she stood half as tall again as the
  door. It has:
  - a stone footing of fitted blocks;
  - a timber frame of posts, sill, top plate and braces, with lime plaster between (cracks, two patches where it has
    fallen to show stone);
  - two windows lit warm from inside, with curtains, a sky reflection, open shutters and flower boxes;
  - an arched door in a stone surround, with iron straps and a ring, a step, and a lantern;
  - the eave's shadow on the wall;
  - a deep thatch roof in wandering courses of straw: the left hip in the sun, the right in shade, moss tucked into
    the shaded lower courses, a bound ridge with grass growing on it;
  - flour sacks, a spare millstone and a barrel by the wall.
- **The wheel.**
  - A band of paddle boards between two rims, six spokes and an iron hub, turning in a loop of 30 frames.
  - The lower part sinks into the race under a foam line, with splashes and drips. An earlier version was see-through
    and read as a ship's helm.
- **Life.**
  - Tall grass and reeds sway as a gust travels across the clearing from the west.
  - Motes drift in the light, two butterflies wander over the flowers, and leaves come down from the forest.

### Suzu, from scratch

- **References.** Her bust reference sheet (`docs/future/playbook/mockups/09`) and her game sprite, used only as
  references.
- **Size.** 48×72 art pixels, about 62 tall including her hair (today's frame is 40×58). At the game's camera on a
  1440×900 screen she is about 124 screen pixels tall.
- **Built in layers**, each lit from the upper left in its own ramp:
  - the back hair as heavy S-curved locks, laid inner to outer over a dark base mass, with light along the lit side of
    each wave;
  - the body: boots, a flared plum skirt with soft folds and a gold hem, the bodice, a gold-edged sash and clasp;
  - a bell sleeve with its dark mouth and the hand just out of it, and on the other arm the elbow out and the hand on
    her hip (as she stands in battle), its sleeve hanging from the elbow;
  - the face and neck: amber eyes with lashes, whites at the outer corners and catchlights at the upper left, brows
    half under the bangs, a small smile, warmth on the cheeks;
  - the front hair: a crown of strands radiating from her parting with a broken sheen, pointed bangs swept across,
    locks framing her face;
  - the bow, two lit loops with folds and a knot, its tails loose; gold at her throat, ears and wrists.
- **Finishing passes.** A selective outline: the darkest step of what it bounds, a step lighter where it faces the
  sun. Then the pixel artist's cleanup: a lone pixel whose neighbours all disagree takes their colour, so shading
  reads in clusters.
- **The idle moves whole pixels only**, so every frame stays crisp:
  - breath (3.2 s): shoulders and chest lift a pixel, and the head follows a beat later;
  - a slow wave runs down her hair, the tips swinging a pixel or two in the breeze;
  - the hem sways behind the hips, the bow's tails flutter, the earrings swing after the head;
  - a blink every 4.3 s, and now and then a glance toward the wheel.
  - Reduced motion holds one frame.

### The lens

Everything is applied at the buffer's own resolution, so it scales with the game's pixels:
- **Sun shafts:** slanting through gaps in the canopy, breathing slowly.
- **A warm grade**, with a breath of haze over the far forest.
- **Bloom:** only what is already bright (the frame multiplied by itself), spread and laid back on top.
- **Depth of field:** the far forest and the near foreground soften, while the mill and Suzu stay sharp, as in Octopath
  Traveler's tilt-shift look.
- **A soft vignette.**

Each layer has a switch (Light, Focus, Bloom, Motion, Life) in the study's corner panel.

### Three cameras

| Camera | Size at 1440×900 | What it's for |
|---|---|---|
| **The game's own** | 22.5 tiles across, 2 screen px per art px | Today's near view, which Robin called "fine" |
| **Close** | About 15 tiles, 3 px per art px | Octopath-like distance |
| **Portrait** | About 7 tiles, 6 px per art px | Seeing Suzu's pixels and idle |

The far view (45 tiles at 1 px per art px) is not used: the pixels become too small to read as pixel art, which is
part of why the proof read as "distant".

## What the study shows (the lead's notes)

- **Detail comes from craft, not resolution.** The study keeps 32 art pixels per tile. What changed the look:
  - ramps of 8–10 hue-shifted steps;
  - calm areas with designed clusters, instead of noise;
  - organic edges;
  - consistent light from one side, with real cast shadows;
  - the lens.
- **Scale relations matter as much as detail.** A door shorter than a person reads as a dollhouse. The mill's wall and
  door were raised.
- **Whole-pixel animation keeps things crisp.** Rasterising shapes anew each frame makes edges shimmer.
- **What remains short of the mockup and Octopath:**
  - Suzu's face and hands are a few pixels across. A pixel artist placing every pixel by hand would get more
    expression than these generated forms.
  - The thatch is still a little regular.
  - Depth of field follows screen height, not true distance.
  - There is only one view of her (front), no walk.

## Measurements

Headless Chromium drawing without a graphics card, so these are pessimistic.

| Situation | Each frame |
|---|---|
| Game camera, 1280×720 (recording) | 9.7 ms |
| Game camera, 1440×900 | 11.6 ms |
| Game camera, 2048×1046 at 1.25 | 14.0 ms |
| Game camera, 375×667 phone at 3 | 10.0 ms |
| Close camera, 1440×900 | 5.6 ms |
| Portrait camera | 1.8 ms |

- **Building the scene:** about 0.8–1.3 s when the study opens. All its pixels are generated then.
- **Frame rate:** the recordings held 60 frames a second at 1280×720.

## Evidence

`docs/screenshots/world/study/`, written by `node tests/e2e/study_captures.mjs`:

| What | Files |
|---|---|
| The three cameras at 1440×900 | `study_game_1440`, `study_close_1440`, `study_portrait_1440` |
| Other sizes | `study_wide_2048`, `study_phone_375` |
| The lens off (close camera) | `study_lens_off_1440` |
| Close-ups at 2× | `closeup_wall`, `closeup_wheel`, `closeup_thatch` |
| The game as it is at the mill, for comparison | `game_today_mill_1440` |
| Suzu alone | `suzu_still_8x`, `suzu_idle_strip_5x` (every 400 ms, then a blink and a glance) |
| Recordings at normal speed, 1280×720, 12 s each | `rec_game`, `rec_close`, `rec_portrait` |

## Checks

| Check | Command | Result |
|---|---|---|
| The study's browser tests (4): absent without the switch; the panel opens it, it draws, Escape returns, no save slot; the same picture on every page load when held still; reduced motion holds Suzu still; each layer and the close camera change the picture; she moves between two instants | `node tests/e2e/study.mjs` | **4 passed, 0 failed** |
| The world proof's browser tests, with the study in the build | `node tests/e2e/world.mjs` | **12 passed, 0 failed** |

Unit and campaign checks are in VALIDATION.md.

## What would help (for Robin)

- **Reference sheets of Suzu at the target pixel scale.** The front, the side, the back and a few idle frames, made the
  way the Harmony sheets were. That would let her be drawn to an artist's eye rather than built from forms, and it's
  the biggest single lever on the character art.
- **Which camera feels right in play**, of the three.
- **What still reads "shapes"** to you, and what reads as the pixel art you want. Point at any part.
- **Trying it on your own screens**, Firefox and the foldable, for the look and the smoothness.
