# Art direction — the Wayfarer's Folio

This is the visual system for *The Road of Borrowed Names*. It covers the
interface: menus, dialogue, the title screen, character creation, the save
ledger, settings, lessons and combat. It also covers the pixel-art upgrade of
the world. It records what was consulted, how reliable each source is, the
principles taken from them, and the decisions made. Where the text says
"planned", the work is not finished yet; `VALIDATION.md` says what has been
tested.

## 1. Idea in one paragraph

The interface is a traveller's folio that has seen some weather. An indigo
cloth cover forms the navigation surround, and warm, low-glare paper leaves
are the reading surfaces. The ink is dark. One amber ribbon marks where you
are. The four paper tabs (Journey, Words, Satchel, Map) overlap like index
dividers. The selected tab comes forward and becomes one sheet with the
page. Decoration never sits under text or handwriting strokes, and it never
carries meaning by itself. Richness belongs in the world scene, while
reading surfaces stay flat, evenly lit and calm.

## 2. Sources consulted, and how reliable each one is

Research was done on 2026-09-26 inside the build environment. That
environment's network proxy **blocked every requested website** (the
inspiration sites, www.w3.org, developer.mozilla.org, the National Diet
Library and university/museum sites). Only `raw.githubusercontent.com` could
be reached. As a result:

| # | Reference | What was actually read | Reliability |
|---|-----------|------------------------|-------------|
| 1 | TRAVELER'S notebook (travelers-company.com, product "about" page) | **Not loaded.** Search-result summaries only. | Unverified lead. Used only for a material idea: same-size refills held by one visible band, with one ribbon as the only "you are here" marker. |
| 2 | *Pentiment* (Obsidian) | **Not loaded.** Search-result summaries from third-party guides only. | Unverified lead. Used only for one principle: book-style ornament stays outside the text layer, and body text stays plain and resizable. |
| 3 | *Sea of Stars* (Sabotage Studio) | **Not loaded.** Summaries of reviews only. | Unverified lead. Used only for one principle: detail and light live in the scene, and UI surfaces stay flat. Nothing was copied. |
| 4 | WAI-ARIA APG, Tabs pattern and automatic-activation example | Read from the canonical source files in `w3c/aria-practices` (`content/patterns/tabs/…`, `examples/tabs-automatic.html`, `examples/css/tabs.css`). The rendered page was not loaded. | Primary source (source text). |
| 5 | WCAG 2.2 Understanding: Target Size (Minimum) 2.5.8 and (Enhanced) 2.5.5 | Read from `w3c/wcag` `understanding/…` source files. | Primary source (source text). |
| 6 | WCAG 2.2 Understanding: Reflow 1.4.10 | Read from `w3c/wcag` source. | Primary source (source text). |
| 7 | WCAG Understanding: Contrast (Minimum) 1.4.3 and Non-text Contrast 1.4.11 | Read from `w3c/wcag` source. | Primary source (source text). |
| 8 | MDN: VisualViewport API | Read from `mdn/content` source (`web/api/visualviewport`). | Primary source (source text). |
| 9 | MDN: `touch-action` | Read from `mdn/content` source. | Primary source (source text). |
| 10 | MDN: CSS length units (sv*/lv*/dv* viewport units) | Read from `mdn/content` source. | Primary source (source text). |
| 11 | Japanese book and travel-document construction: NDL "Japanese Four-Hole Book Binding" manual; University of Zurich "Ad fontes" tutorial on Edo-period travel maps | **Not loaded.** Primary sources were identified, but only search summaries were seen. | Unverified lead. Used only loosely: a title slip that names each section in the same place every time, and routes drawn as a diagram of stations. |

The concept sheet supplied with the brief was used for atmosphere only
(indigo cloth, paper, ribbon, stitching). Its layout was not copied, and
neither were its companion names, places, dates, sample Japanese or settings.
The user's phone screenshots were used only to find problems. They are not
committed to the repository.

No user research, formal accessibility audit or certification was done.
Colour contrast is checked by computation (`tests/unit/ui_contrast.test.mjs`).
Behaviour is checked by browser tests (`tests/e2e/folio.mjs` and others).

## 3. Principles (and the source each one comes from)

1. **Tabs follow the APG pattern.** Tabs are buttons in a `tablist`, with
   `aria-selected`, `aria-controls` pointing to one `tabpanel`, and a roving
   tabindex. Left/Right wrap and Home/End jump to the ends. Activation is
   automatic, because the panels render instantly. The tablist handles its
   own arrow keys, so the game never also acts on them. (4)
2. **Selection is shown by shape, not colour alone.** The selected tab is
   raised and in front, shares the page's paper with no seam, and carries the
   ribbon. Keyboard focus is drawn separately (a dashed inner ring on the
   selected tab, a solid outer ring elsewhere), so "focused" and "selected"
   never look the same. (4, 7)
3. **Overlap never steals input.** Each tab's clickable area is its own
   rectangle. The overlapping face is a decorative layer with
   `pointer-events: none`. Every tab keeps at least a 44×44 px target, and its
   label is never covered. A test probes points inside every tab's visible
   box. (5)
4. **Phones get their own composition.** Below 600 px the folio fills the
   screen as one page: four equal tabs with the icon above the label, and
   a sub-page with its own Back step. It is not a shrunken spread. At 320 px
   and at 200 % text, nothing is wider than the screen. English and
   Japanese labels fit as four tabs from 320 px up; if the labels cannot fit
   (200 % text), the rail scrolls and shows arrows instead of clipping them.
   Whether it overflows is measured from the tabs' natural widths, so the
   rail is settled from the first frame and never shifts under a finger.
   (6)
5. **Contrast.** Ink and furigana on paper are at least 4.5:1 (the
   `visual.mjs --check` audit measures every visible reading against the
   paint behind it, in both interface languages). Focus rings,
   the ribbon, the "you are here" mark and control outlines are at least
   3:1 against what is next to them. High contrast is the same or stronger.
   (7)
6. **Viewport and touch.** Full-screen surfaces are sized in `svh`, with a
   `vh` fallback. The on-screen keyboard is handled with `visualViewport`
   (a `--kb` inset for any screen, and in the answer field, the name field
   and creation; pinch zoom is ignored). Interface elements use
   `touch-action: manipulation`. Pages use `pan-y pinch-zoom`. `none` is
   used only on the game canvas, the movement pad, the Run/Action buttons
   and the writing canvas. (8, 9, 10)
7. **Ornament stays outside the text layer.** No paper grain or texture sits
   under text or strokes, and stitching and weave appear only on the cloth.
   Furigana is always on, with no setting to turn it off. (2, project
   rules)
8. **Scene rich, surfaces calm.** Animation in the interface is short
   (≈140–170 ms) and turns off with Reduce motion. There is no shimmer or
   moving light over text. (3)

## 4. Materials and tokens

Defined in `src/styles/00_tokens.css`:

- **Cloth** (`--cloth-950…600`): indigo. A faint two-direction weave is drawn
  with gradients (no image files). Repair stitching (`--thread`) runs as a
  dashed line inside the cover edge.
- **Paper** (`--paper`, `--paper-2` tucked, `--paper-3` deeper tuck,
  `--paper-edge`, `--rule`): warm and low-glare. Pages look stacked through a
  two-step bottom shadow, not through texture.
- **Ink** (`--ink`, `--ink-2`, `--ink-3`, `--rt-ink` for furigana).
- **Marks:** `--ribbon` (the one current-selection colour), `--vermilion`
  (rare: the "you are here" seal), `--danger-ink`/`--danger-bg` (destructive
  actions only), `--ok-ink`, `--warn-ink`, and `--river` (links and focus on
  paper). `--focus-cloth` is used for focus on cloth.
- **High contrast** swaps paper to white, ink to black, cloth to black and
  thread to yellow.

Type: no font files are added or fetched. Headings use a system serif stack
(`--serif`: Iowan Old Style, Palatino, Book Antiqua, Georgia). Body text and
controls use the existing UI stack. Japanese uses the existing `--jp-font`
stack. Body text never uses the decorative face.

Icons: small inline SVGs drawn for this project in `src/ui/12_folio.js`, with
stroke `currentColor` so they follow contrast modes. An icon never stands
alone without a text label, except inside a labelled button.

## 5. Components

- **Folio frame** (`RB.ui.folio.frame`): cloth cover, a header with the title
  slip and journey meta (names · playtime), Close/Back, the tab rail, the
  leaves and a footer. It is a modal `dialog`. A click outside the cover
  closes it, like Back; a click on the page never does.
- **Paper tabs** (`RB.ui.folio.tabs`): see principles 1–3. One ribbon element
  slides to the selected tab. Tabs never reorder.
- **Leaves:** one scroll surface per page (`overscroll-behavior: contain`).
  At 860 px and wider, a section shows as a two-page spread (list and detail)
  with a binding shadow. The contents are ruled entries, not boxed cards.
- **Buttons:** cloth buttons (`.cbtn`) on the cover and paper buttons
  (`.pbtn`) on pages, with `primary`, `danger` and `quiet` variants. All are
  at least 44 px.
- **Real form controls:** radio groups (`.opt`), switches (`role=switch`),
  sliders with a live value, selects, and key-capture buttons. Each state is
  shown by shape (filled dot, knob position, underline) as well as colour.

## 6. Menu structure: old to new

| Before (eight tabs) | Now |
|---|---|
| Journal | **Journey** › Quests & notes (Now / Also on the way / Notes to self / Completed) |
| Log | **Journey** › Dialogue history |
| Notebook | **Words** (contents: inscriptions, noted words, kana chart, grammar, lore, progress) |
| Guide | **Words** › Guide: how things work |
| Items | **Satchel** (Equipped slots, then Carried, with key items marked) |
| Map | **Map** (route chart, then Travel) |
| Settings | **Settings** utility on the folio's foot (named groups) |
| Save | **Save & Load** utility on the folio's foot (Save…, Load…, Return to title) |

The old names still work as entry points (`RB.ui.menu.open('log')` opens
Journey › Dialogue history, and so on). Settings has six groups: Reading &
Language, Learning & Challenge, Controls, Audio, Display & Accessibility,
and Storage. Choices saved with the current campaign (Japanese level,
mistakes in battle, tactical challenge) are shown apart, in a marked box.
All other preferences apply to every campaign.

## 7. In play: dialogue, word help, HUD, touch, camera

- **Dialogue** is an inset paper sheet (correspondence) with a speaker tab
  on its top edge and the portrait framed beside it. The lead line is in
  ink, and the second language sits under a rule in secondary ink, not
  faint filler. There is one control row: Word help, Translation, Voice,
  History and Skip seen are separate labelled toggles, and there is a
  single Next in the same place. When a line is longer than the sheet, the
  button reads "More" and first scrolls the rest into view. Replies are
  numbered paper slips just above the sheet. A scroll gesture over them
  does not choose one.
- **Word help** is a bounded note card beside the word on wide screens,
  or a bottom sheet on narrow ones when opened by tap or keyboard. Close
  is always in its header. A card opened by a tap pauses what is under it:
  the next tap only closes the card. Escape closes it first. Opening any
  panel closes it. Touch has an explicit, labelled route (the Word help
  toggle, then tap a word); long-press on an answer button supplements it.
- **HUD:** one Menu entry and a labelled Word help switch showing its
  state, as cloth tags at the top edge. They are hidden whenever a panel,
  the folio or dialogue is up, because those carry their own controls.
- **Touch:** a sliding movement pad (the direction follows the thumb, with
  a centre dead zone), hold-to-Run, and an Action button labelled by what
  it will do (Talk, Read, Look, Face, Chat). The controls are hidden
  during dialogue, menus and writing. A handedness and size setting is
  available, and its defaults keep the previous layout.
- **Camera:** composed from the whole view and never moved by a panel
  opening or closing. (Until 2026-09-27 it recomposed the map above the
  dialogue sheet; on a map about the size of the window that pushed the
  whole map up and exposed an empty band. Reported by the player.) When the
  dialogue sheet at the bottom would cover the player or the speaker, the
  sheet docks at the top of the screen instead, the usual answer in this
  genre; replies, notices and the place banner then sit below it. On touch
  devices the band the touch controls use is a fixed reserve, so the view
  may run a little past a map's bottom edge to keep the player clear of the
  pad.
- **Past a map's edge:** outdoors, the edge carries on. The edge tiles
  continue with their own per-cell variation (the river keeps flowing, a
  road keeps going), and trees, reeds and rocks are scattered at the density
  found along that stretch of edge, never on water or a road. The ground
  darkens gently towards the region's night colour over three tiles, from
  nothing at the edge, so the boundary reads without a drawn line and
  nothing past it looks like part of the playable map. Walled maps (rooms,
  archives, towers) keep a quiet surround in the region's darkest colour
  (timber for rooms, a faint weave for larger places) with a soft edge
  shadow. The map is never stretched or cropped.

- **Chapter banner** (2026-09-28, player request): chapter openings and
  endings and time passing ("The next morning") are a paper banner at the
  top, not a page over the screen. It slides in from the left as it fades
  in, an ink flourish draws outward from the title, it stays long enough to
  read (longer for longer lines), then slides away to the right. A click,
  tap or key moves it on; reduced motion fades without sliding. The place
  name waits until it has gone.
- **People move like people** (2026-09-28): someone who leaves walks to
  the nearest door or way out and fades; someone who arrives walks in. A
  character a scene gives a line to who is not on the map walks in from
  the nearest door, stands by you while they speak and walks off after
  (voices, memories and spirits are marked off-screen and stay unseen).
  Standing people breathe (head and body settle one art pixel every couple
  of seconds, each on their own beat) and now and then glance aside; the
  party breathes in battle too. Crowns of trees, pines and bushes lean one
  art pixel in a wind that travels across the map, with calm spells. All
  of it holds still with reduced motion.
- **Doors:** a building with no inside keeps its door shut (it is solid,
  and says so when you look). Going in lands on the entry mat.
- **Battle clarity** (2026-09-28): Harmony is its own band on the party
  slip — pips, a count, and the name of this companion's technique — and
  every move, status and ward is a keyword with a note card (hover, focus
  or tap; a bottom sheet on phones) saying what it does and what answers
  it. A response used for the first time says "New" and what it answers.
- **Satchel:** what is worn carries an "Equipped" tag and a framed row
  (never colour alone); every wearable item shows tags for what it does
  (Battle start: ward, harmony, resolve; Quicker stride; Appearance), with
  a key. Keepsakes show on the road, in battle and in portraits.

## 8. Pixel art

The world keeps its 16-px logical grid. Map IDs, collisions, triggers,
movement and saved coordinates are unchanged. The renderer
(`src/engine/60_render.js`) draws at 2 art pixels per logical pixel, so a
tile is 32×32 art pixels and a character frame 40×58 (§10), scaled to the
screen by a whole number of device pixels. The field of view is about 12 tiles across
on phones, 17 on tablets and 20–21 on desktops. Art authored at this
resolution plugs in through `draw2`/`anim2` (tiles), `draw2` (props),
`RB.props.STRUCT2` (buildings) and `RB.sprites.getArt` (characters).
Everything in the world has been redrawn at this resolution: all ground
tiles (`21_tileart.js`), all 139 props and the houses/towers
(`26`–`29_*.js`, the Atlas art file and the chapter prop blocks), every
character look and creature (`31`–`33_*.js`), 96-px portraits
(`35`/`36_*.js`), every battle creature and battle backdrop
(`77`–`79_*.js`), the title scene and the emote bubbles. The ×2 transform
remains only as a fallback for anything added later without art. Rules the
art follows:

- light from the upper left
- hue-shifted 3–5-step ramps per material
- shading in clusters, with no single-pixel noise used as texture
- selective dark outlines on characters only
- contact shadows under props and people
- deterministic variation from position hashes
- region identity through materials and palettes
- interactable objects kept distinct from decoration
- generated surfaces cached; a map's static layer is built once and kept
  only for the current and previous map

`tests/e2e/art_shots.mjs` captures a world scene per region and specimen
sheets of every tile, prop, sprite and portrait for review. Before/after
captures of the real builds are in `docs/screenshots/`. Signs and papers
suggest writing with brush dashes; no shapes that could pass for
characters are used as ornament.

## 9. Things deliberately not done

- No texture behind text, furigana or handwriting strokes.
- No furigana-off toggle.
- No remote fonts, images, libraries or CDNs. Everything is inline in the
  single file, under the existing content security policy.
- No save export/import or share codes.

## 10. The character standard (2026-09-28)

Characters are drawn in code, as before (no sprite sheets, nothing
fetched). This section fixes their size, anchors and pose library.

### Measured before choosing

| Thing (art px; 2 art px = 1 logical px, a tile is 32×32) | Size |
|---|---|
| Old road sprite frame | 32×48, sole on row 46, adult 45 px tall (hair crown to sole), face 16×16 |
| House door (`29_structart.js` `doorAt`) | 38 px frame, 33 px opening; the eave overlaps its top |
| Tower door (arched) | 36 px |
| Old battle party | the road back view (32×48) at the battle scale |
| Battle creatures (`78_enemy_art.js`) | frames 120–200 px; bodies about 100–150 px |

A 48×72 road frame (the starting proposal) at this resolution would make a
person about 66 px tall — 1.7 times a house door and two tiles high — so on
the road the increase is kept modest and the detail comes from redrawing.
Battle has no doors to respect; there the figure is about twice the road
height, still well under the creature it faces.

### Road (overworld) sprites — `src/engine/32_spriteart.js`, `32h_spritehair.js`, `32k_spriteacc.js`

- **Frame 40×58 art px** (`RB.sprites.FRAME`), **foot anchor (20, 55)**
  (`RB.sprites.ANCHOR`). The anchor stands on the middle of the actor's tile,
  2 art px above its bottom edge — exactly where the old sprite's feet were —
  so collision (one tile), interaction distance and depth sorting (by tile y)
  are unchanged. The art is authored on a 40×56 figure with the sole on row
  53; the frame keeps two clear rows above it for a hat, bun or feather and
  their outline.
- **Adult 50 px tall** (old 45: +11 %), child 42, a hat adds up to 4. Face
  18×17 with 3-px eyes (lid, lash tick, iris, glint, lower light), brows
  under the fringe; torso 16 px with sloped shoulders, crossed collars,
  belts with a knot, skirt folds and seams; arms with a darker inner edge
  and elbow crease; round fists; boots with cuff, toe cap and sole. About
  1.3 times a house door's frame (old: 1.2).
- **One rig, every look.** Rows for head, shoulders, belt, hem and boots,
  and per frame a pose: upper-body bob, each foot's stride and lift, each
  arm's swing, hair and hem follow-through. All 12 hairstyles, 5 cuts, the
  8 creation accessories, every keepsake and every NPC accessory are
  redrawn on it; creatures keep their 32×48 art, centred on the anchor.
- **Frames.** `getArt(look, dir, frame)`: 0 stand, 1/2 the contact steps,
  3 blink (as before); `'w0'…'w7'` an eight-phase walk (four frames per
  tile step, picked from the step's progress: contact, down, passing, up);
  `'i0'…'i3'` idle breathing (shoulders, head and arms settle a pixel onto
  the legs, hair follows a beat later — articulated, not a slice of the
  whole sprite); any key + `'b'` blinks. At every frame one foot is on the
  anchor row.
- **Sides are kept, not mirrored.** A side ponytail, single braid, flower,
  ribbon, leaf, quill and lantern are worn on the left; a book or basket in
  the right hand; a satchel's strap over the right shoulder with the bag on
  the left hip. The front view shows the left on screen right, the back
  view on screen left; each side view draws the side facing the camera in
  front of the body and the other behind it (only the light is mirrored in
  the left view).
- `drawActor` places the frame by the anchor, draws a contact shadow at the
  feet, picks walk/idle/blink frames, keeps alpha fades; emote bubbles and
  the interaction chevron sit above a 50-px head.

### Battle figures — `src/engine/34_battlers.js` (`RB.battlers`)

- **Frame 80×104 art px, foot anchor (36, 100)**; the adult figure is about
  86 px tall, drawn at the battle scene's whole-number scale — the same art
  pixel grid as everything else in the scene. Room is left to the right and
  above for an arm directed at the foe or raised.
- **Rear three-quarter view.** The body is turned 36° from straight away,
  facing up-right; the head turns a further 6–14° toward the foe; the camera
  looks down 20°; light from the upper left. We see the back, the right
  side, the right ear and cheek line.
- **How it is drawn.** A pose rig — pelvis, spine, head, and hands and feet
  placed by two-bone IK, so a gesture is written as "where the hand goes" —
  carries simple volumes (ellipsoids, tapered capsules, lofted sections for
  torso and skirts, boxes for books and bags). These are rasterized with a
  depth buffer; each pixel takes one step of its material's 5-step
  hue-shifted ramp from the light, plus the material's pattern (hair locks
  and a sheen band, cloth folds, a back seam, a yoke, side seams, a hem
  band, trims); a darker contour is drawn where a nearer part crosses a
  farther one; lone pixels join their neighbours; the selective outline goes
  round. Nothing is smoothed. The head is a little smaller relative to the
  body than on the road so arms and what they hold read past it.
- **Every look.** All hairstyles (a side ponytail and braid on the left,
  showing past the head), cuts (tunic, apron with its bow, coat with a back
  vent, robe with obi bow and hem trim, dress with bow and trim), and
  accessories/keepsakes attached to their joints: hat, cap, hood and
  headband on the head; flower, ribbon, leaf and quill on the upper left of
  the head; earrings under the ears; scarf round the neck with its tail over
  the left shoulder blade; satchel strap across the back to the bag on the
  left hip; bell cord's bow at the nape; compass pin on the right shoulder;
  lantern (Ren) and cane in the left hand, kept out at the side; basket in
  the right; cape from the shoulders.
- **Poses.** `ready` (lively but grounded: breathing, a spring in the
  knees, a slow weight shift, the head searching the foe, hair and cloth
  following; feet planted), `calm` (quieter; the player reads the folio,
  head bowed), `anticipate` → `act` → `recover` for seven gestures —
  `direct` (a paper strip drawn back, then sent up-right with the whole
  arm), `trace` (a brush raised; a stroke with hook and flick), `book` (the
  folio lifted and opened toward the foe), `ward` (forearm across, then the
  open palm pushed out), `restore` (hands low at the sides rising and
  opening), `flow` (arm swept back low, round in an arc up to the foe),
  `raise` (arm lowered, then raised high) — and `hit` (knocked back at the
  waist, then back to the stance), `brace` (a small flinch behind a raised
  forearm), `down` (on the left knee, a hand on the ground), `cheer` (a fist
  raised, restrained). Every gesture, hit and brace ends exactly in the
  stance it began from; the anchor never moves.
- **Two characters, two rhythms.** The player's idle loops every 5.2 s
  (breath 2.6 s) and on every second loop settles the grip on the folio and
  glances at it; the companion's loops every 6.0 s (breath 3.0 s), stands
  wider and lower, and on every second loop shifts footing. The player holds
  the folio at the left hip.
- **Reduced motion.** `o.reduce` gives a still, readable stance (no idle
  motion at any time) and poses as key frames (progress snapped to 0, ½, 1).
- **Cost.** Frames are cached per look, pose, gesture, progress (12 steps)
  and idle time (100-ms steps; 104 frames per player loop pair, 120 for the
  companion), least-recently-used, up to 720 frames. A new frame takes a
  few ms to build (`RB.battlers.prewarm(look, who)` builds the idle ahead of
  time); a cached one is one `drawImage`.

API (the contract with the battle presentation):

```
RB.battlers.FRAME    // { w: 80, h: 104 }
RB.battlers.ANCHOR   // { x: 36, y: 100 }
RB.battlers.POSES    // ['ready','calm','anticipate','act','recover','hit','brace','down','cheer']
RB.battlers.GESTURES // ['direct','trace','book','ward','restore','flow','raise']
RB.battlers.draw(ctx, look, { x, y, scale, t, who, pose, gesture, k, reduce, facing })
  -> { hand, head, chest, feet }   // canvas px
RB.battlers.preview(look, pose, gesture, k[, o]) -> canvas (one frame at scale 1)
RB.battlers.prewarm(look, who)
```

`facing: 'upleft'` mirrors the frame (the anchor mirrors with it) — kept for
later; only `'upright'` is authored.

### Where the standard shows outside the world

- Character creation: the figure (40×58) at 3× or 4× in the traveller
  column and when inspected (2× and 1.5× on short landscape screens); the
  compact phone slip keeps a ¾-size thumbnail beside the portrait so its
  text column is no narrower than before; the clothing-cut tiles at 1×; the
  prologue walker walks the eight-phase cycle.
- Satchel, "How you look wearing it": Front and Side (road sprites) and In
  battle (the battle figure, trimmed to the figure), all at 2 CSS px per art
  px, then the portrait.

### Tests

`tests/e2e/characters.mjs` (in `run.mjs`): every option class, keepsake,
companion and NPC × 4 directions × 17 frames on the road standard (size,
not blank, feet on the anchor, nothing clipped), one-sided things on their
side in every view, depth sorting in the world, and for the battle figures
the API, every pose × gesture × progress for the player and all four
companions (not blank, anchor stable, no drift), accessories present in
every pose and head things on the head, reduced-motion stillness, lively
upper body with planted feet, different idle timing, and frame cost.
Review sheets go to `tests/e2e/out/characters/`; a selection is in
`docs/screenshots/after/characters/`.
