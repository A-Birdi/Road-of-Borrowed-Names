# AC-1 · The art critique amendment (digest)

*Robin, 2026-10-10, recorded as **C-82**: "Addendum for art feedback - only consider it when we're working on more
art." The amendment ("Art critique and autonomous implementation amendment, revision AC-1", a 25-page PDF with
figures) reviewed the World Proof and the Suzu-at-the-Mill study. This file is a faithful digest so the work does not
depend on the upload; the PDF itself is not committed (13 MB of figures, and it names the implementation model). The
figures it cites are the proof and study captures in `docs/screenshots/world/` (w00–w05, `study/`), plus a
private Octopath Traveler screenshot used only for comparison.*

## When it applies

Only to art work (Robin's note limits it). That means:
- each new region's material kit, map staging and battle backdrops (P08 to P15);
- P16, the game-wide art closure;
- any change to rendering, the camera or projection, actors and their animation, lighting and focus, battle
  staging, or the book interface's look.

Language, content, encounter, expedition and record work go on under C-81 as before. Where AC-1 and a standing rule
of Robin's meet, the reconciliation is in C-82 ([11_CONTRADICTIONS.md](11_CONTRADICTIONS.md)).

## The verdict

The World Proof is a useful, coherent improvement; the Mill shows more material richness. Neither yet establishes
the spatial, pixel-art finish as a method that repeats across the game. The gap is **structural depth and selective
emphasis**, not too little grass, colour or effect: more tiles on screen do not make a miniature, and more coloured
pixels do not make better pixel art.

**Target:** a legible, Japanese-inspired journey through small, spatially convincing places, with deliberately
clustered pixel art, dimensional materials, expressive actors and atmospheric light; Harmony and the illustrated
scenes keep the richest character finish without making the overworld feel like a different game. Learn from the
reference's foreground framing, dimensional landmark, recessed surfaces, light separation and selective focus; do not
copy its architecture, characters or darkest contrast.

**Never imported from reference imagery:** levels, experience bars, currencies, random loot, unrelated monsters,
extra permanent party members. The two adventurers, companion and pet continuity, real language practice, honest
assistance records, every input mode, reading advanced by hand and no danger while reading all stay.

## What is already right (preserve, verify, do not redo)

- Battles keep the game's own framing, the crabs at full size (C-80's fix): a regression check, not a new task.
- Shadows with direction, warm light and cooler shade, window glow, regional tint; actors shaded by a fraction of the
  shade under them; the deep-skin over-darkening fix.
- Purposeful work: Yasu fishing, Tomo folding, Kiyo's sale (pickup, show, clean, wrap, set, rest) with its corrected
  prop ownership; the idle-interruption fixes.
- Regional reuse (Saltglass from Reedwake's method, no lily pads in salt water).
- The Mill study stays an experiment: adopt its techniques selectively, never wholesale by file name.

## The findings and their directions

**A · Camera: coverage changed more than viewpoint.** The far view (about 45 tiles across instead of 22) reads as an
enhanced overhead map: broad roof tops, a road grid, shallow fronts under big roofs. *Direction:* separate camera
distance from projection, building geometry and composition; choose a useful local field of view first, not "fit
the whole village". Author height-bearing faces, visible eaves, side planes, ground footprints and occlusion parts;
a roof covers a volume. One projection for feet, ground, props, shadows and picking; never squash the finished
canvas. Layered 2D or a shallow 3D scene are both acceptable. *Check:* the same doorway, fence, actor and terrain at
the old and new views; walk toward, behind and around them, enter the door, touch an interaction, resize. A roof
cutaway keeps the route readable. Camera choices are presets with explicit units. *When:* choose and document the
projection contract the next time work touches rendering or new map staging; it must not lose scene anchors or
invalidate saved positions.

**B · Density is growing faster than hierarchy.** Small grass marks, shrubs and repeated houses everywhere; broad,
evenly tiled open areas; many similar round crowns. *Direction:* compose from large masses to small marks: path,
hero landmark, foreground frame and quiet backdrop first, microdetail last; quiet space behind faces and hands; not
every empty patch gets an object. Regions differ by function (Reedwake: wet banks, gardens, shade, traffic;
Saltglass: quay edge, retaining faces, working stalls, ropes, worn paving, coastal planting). Layouts may change
(reshape a verge, open a sightline, add a terrace) when it helps the scene, with connectivity, quest-marker and
interaction checks; never longer empty walks, unreadable exits or hidden requirements. *Check:* normal size, a small
thumbnail, effects off, the actor highlighted only in a diagnostic: landmark, actor and path identifiable without it.
The production manifest names the areas meant to stay quiet.

**C · Materials need larger, intentional clusters.**

| Material | Next improvement | Avoid |
|---|---|---|
| Thatch | overlapped bundles, a thick eave, darker underlayers, a few irregular ends; courses varied by wear, ties, damp | a uniform checker of short strokes |
| Timber | a face, a side, joints and shadow; grain sparse, along the timber | grain noise without joints or thickness |
| Plaster, stone | separate wall planes, recessed openings, footing, selective damage | equally sharp speckle everywhere |
| Trees | varied crowns around branches, leaf masses, dark inner pockets, a few lit clusters | repeated spheres, broccoli at every scale |
| Ground | quiet base masses, wear on travel lines, growth at edges, flowers tied to place | uniform marks competing with actors |
| Water, wheel | flow direction, wet and dry parts, rim and spoke thickness, a real hub and axle, foam where it touches | sparkles and spray unrelated to the structure |

Material ramps with deliberate hue and value; shade count is not a measure. *Check:* source-resolution assets and
integer nearest-neighbour enlargements, then real captures; judge pixels on lossless exports, not WebP previews.

**D · Suzu: better form and expression, not just a bigger canvas.** The study's 48 × 72 frame kept her identity
(copper hair, pink bow, warm brown skin, plum dress, gold accents), but dark masses sit in the fringe, cheek and
neck, hands merge with cuffs and hair, the expression reads less clearly than Harmony's, and the stance is frontal
and stiff. *Direction:* design the fringe break, brows or lash accents, eye openings, cheek, chin and neck toward one
expression; keep skin colour in shade (do not brighten the whole face to rescue a lost eye); a few overlapping locks,
near and far locks separate from arms; a shoulder line and neckline over the neck; readable elbow, forearm and hand,
cuffs that wrap. She is a grounded travelling performer with confidence and warmth, not a posing celebrity; canon
unchanged. *Resolution:* compare a redrawn current-size sprite with one modestly larger candidate at the same
gameplay footprint; the larger only wins if it reads and moves better at display size, fits the scenery and keeps
the wardrobe manageable. Frame size, occupied bounds, foot pivot, material ids and accessory anchors explicit. A new
actor standard ships with every direction and action the game uses, wardrobe, conversation turns, walking contacts,
hit responses and gestures; the roster grows into it progressively.

**E · Lighting exists; tie it to form.** Some walls, roofs and actors read as flat images with a shadow and grade
added. *Direction:* keep base colour, authored form shading, ambient light, cast and contact shadow, emissive
sources and the final grade separate; a few receiver masks or face-facing responses do most of the work. A lantern
lights the ground and the facing side of a figure, not just a halo; roof undersides, doorway recesses and sills keep
their shadows; damp stone, glass, metal, cloth and plaster take different highlights; no cool outline on every edge.
Harmony's illustration keeps its own stage light; the UI and the writing pad are never tinted or bloomed. *Check:*
daylight, directional shade, evening, one local light, with light and deep skin; feet grounded as shadows move;
nothing glows through walls; lighting never changes combat, learning evidence or story time.

**F · Focus follows the screen row, not depth.** The study's depth of field follows screen height. *Direction:*
keep blur as a restrained tool (Robin wants depth and focus), but use at least foreground, play-plane and background
layers or a depth representation; a tall actor's face never blurs because it shares a row with distant foliage;
foreground blur masked so it never smears over a sharp actor or door; a scene on one plane needs no blur bands. Keep
some framed foreground occlusion. *Check:* a tall object, a low foreground reed, a bridge, a raised landing, an
actor near the top edge, portrait and landscape; depth holds while panning; a reduced-effects view keeps routes and
targets.

**G · Keep the work actions; animate beyond layer offsets.** *Direction:* purposeful activity, not universal
bobbing; real pose changes (weight shift, shoulder and hip opposition, elbow bend, reach, grip, cloth overlap and
recovery); redraw clusters or use replacement poses where deformation looks hinged. A continuous timebase, a
consistent rasterisation policy. Props stay in contact (a parcel is on the counter or in the hand, never both; a
vial turns through a possible grip); a conversation interrupts promptly and parks the prop. Background motion has
hierarchy and rest; nothing synchronised across residents; environmental randomness separate from gameplay streams.
Mio's finished grip work is not reopened without a reproduced defect. *Check:* a full action at normal speed and
slowed, entering, leaving, interrupted, turning, at the loop seam. The proof's recordings were 25 fps files and its
idle strip sampled every 400 ms: neither measures the engine.

**H · Battles: closeness and dimensional staging, never a global zoom-out.** *Direction:* fit groups by composition
first (modest depth stagger, controlled overlap of non-essential parts, deliberate centres); never compress
proportions or shrink back rows past readability; no camera pumping on every nameplate or target change; never hide
a required actor or target behind a prop. Backdrops use the region's materials and keep the encounter's origin (a
doorway, ladder, bank, wheel) meaningful; quiet space where the player reads or draws. Harmony: the two of you stay
the party; Suzu's cut-in is a shared rally (she winks, the player does not; the player's brush and look correct);
overlap during it is allowed but resolve, Harmony and the current action stay visible; the action banner only
during the action; controls may withdraw during a committed animation and return with focus and state; intent icons
inspectable by tap and keyboard, not hover. *Check:* one, three and the largest formation at wide and narrow sizes,
long names with furigana, the banner, the cut-in, response entry, reduced motion; the current roster; target ids kept
while sorting; Normal, Fast and Instant resolve the same action exactly once.

**I · The galleries were not the interface.** Continue the authored-ledger book: a believable bound object, readable
pages, material hierarchy, distinct section layouts, not nested panels or torn-paper cards. Perspective and opening
motion belong to the book's decorative layers; text, selectable Japanese, furigana, controls and the writing pad
stay crisp and need not follow the scenery's pixel grid. Fonts embedded and offline with their licences (never a
remote font). Review the action inventory so nothing is lost: companion talks, pet actions, help, saves, learning
records.

## Production method

Four separate decisions: how source is organised, how art is authored, how it is rendered, how the game is
delivered. One offline HTML constrains only delivery: it does not forbid stored images or demand that every pixel be
recomputed from generic shapes. Author per asset with whatever gives the best validated result: indexed or raster
art, named material regions, deterministic generators, hand-authored masks, cluster corrections, complete pose
frames; bake at build time or cache at runtime; keep source layers and the instructions to rebuild them. A small
authored pixel table for an eye beats an ellipse generator; grass or roof layout may suit generation. Version actor
pivots, shadow anchors, accessory occlusion, material ids, animation states and sampling rules behind a thin
presentation interface. Changes must work in the normal game path, not only in `study=mill`.

Rendering may change (layered Canvas, a project-authored GPU layer) when evidence shows it is the better fit; prefer
the smaller, lower-risk change. On bundled libraries, see C-82. If a method fails, change the experiment, keep the
best working revision and carry on; never declare the browser incapable.

## Performance claims

Measure whole frame intervals and main-thread stalls, not one draw call. Record the renderer, build, CSS viewport,
device pixel ratio, backing-buffer size, effect settings, and headless or real hardware; separate cold and warm entry,
first asset generation, steady motion and transitions; give p50 and p95 intervals, long stalls and cache growth. A
lower JS heap is not lower memory (decoded images, canvas buffers, textures count). Bound caches; never precompute
every wardrobe permutation; doubling both dimensions quadruples pixels. Do not hide repeated stalls in longer fades.
A headless phone-sized viewport is not Robin's phone: say what was not tested on hardware, never invent it.

## Working shape and status words

Each art change: observed problem → hypothesis → implementation → in-game comparison → regression check → decision →
continue, in the existing records. Bounded experiments; stop repeating a method that does not change the failing
property. No unlimited showcase polishing while the expansion waits, and no "art complete" because code is.

Status words, never conflated: *observed in the supplied proof*, *reported by the author*, *verified in the current
build*, *implemented provisionally*, *internally accepted final*, *superseded (with the reason)*. Never "Robin-
approved" for the lead's own judgement; "internally reviewed", "integrated", "matches the reference in these
respects", and the remaining differences.

## The internal acceptance checklist

Quality checkpoints the lead owns, not requests to Robin. A failed one blocks calling its own work final, nothing
else.

| Id | Required result | Evidence |
|---|---|---|
| AC-A01 | The expansion continues from its actual state; no old human gate reinstated | the continuation note and next task |
| AC-A02 | The Mill stays an experiment until techniques are adopted on purpose | an adoption record per technique |
| AC-A03 | Camera scale serves play, not whole-map imitation | matched local views; actor readability; doorway and picking checks |
| AC-A04 | Ground, faces, roofs and occlusion agree in space | effects-off captures; moving around tall and low objects |
| AC-A05 | Detail hierarchy survives at normal size | landmark, actor and path review; material crops; quiet-space comparison |
| AC-A06 | Suzu keeps her identity with a readable face and body | lossless source-size proof and the actual-size game view |
| AC-A07 | The actor method works beyond a front idle | directions, walking, turning, interaction, wardrobe, shadow fixtures |
| AC-A08 | Light clarifies materials and keeps every skin tone | day, shade, evening and local-light comparisons |
| AC-A09 | Focus follows depth, not the screen row | raised, foreground, actor, pan and resize cases |
| AC-A10 | Work actions stay purposeful and connected | full action and interruption recordings; prop ownership checks |
| AC-A11 | New animation is stable and expressive, not just more frequent | normal-speed loops; fine-frame inspection; pose and contact evidence |
| AC-A12 | Battle actors stay present at every supported group size | one, three and the largest formation, wide and narrow; no zoom regression |
| AC-A13 | Harmony, response entry and action information coexist | cut-in, action and reading captures with resolve and Harmony shown |
| AC-A14 | World and battle share regional materials and origin cues | same-place world and encounter comparisons |
| AC-A15 | The book keeps every useful action and learning text | screen and action census; keyboard and touch; ruby; long text; reduced motion |
| AC-A16 | One offline deliverable, reproducible | build identity; embedded asset and licence manifest; a blocked-network smoke test |
| AC-A17 | Performance claims name the measured environment | raw timing scope; frame intervals; buffer and cache accounting; tested and untested list |
| AC-A18 | Art completion covers the game, not a highlight reel | a map, state, actor, action, wardrobe and illustration census with captures |
| AC-A19 | Visual speeds and effects never change outcomes | identical committed results; no duplicate learning or rewards on skip or resize |
| AC-A20 | Final verification proceeds under the existing authorisation | final test and visual dispositions; a release-candidate report; no invented sign-off |

## Routing into the packets

| Packet | AC-1's part |
|---|---|
| P01 work (wherever it now lives) | carry the world and reuse work forward; projection, readability and actor sampling are the lead's decisions |
| P02–P04 | state, outcomes and evidence stay independent of rendering; keep the corrected battle camera; design formation and UI bounds before any global scale change |
| P05 | keep the purposeful loops and interruption fixes; improve contacts, continuity and reusable anchors with the routines |
| P06, U-series | the book and type with real content, no remote fonts, accessible reading, genuine records |
| P08–P15 | each new region gets a coherent spatial and material kit and real interaction staging; interim assets where the story is still moving |
| P16 | old and new places, actor directions, wardrobe, enemy states, actions, UI and illustrations: never leave the only finished view in the Mill study |
| P17–P18 | close the issue census; final verification including the matrix near completion (C-82 on the release) |
