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
tile is 32×32 art pixels and a character 32×48, scaled to the screen by a
whole number of device pixels. The field of view is about 12 tiles across
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

### Battle backdrops: the place of the encounter (2026-09-28)

A battle's backdrop is a glimpse of where the encounter happens, composed
once at encounter entry by `RB.battlePlaces` (`src/ui/76_battle_places.js`)
and drawn by `RB.battlePlaceArt` (`src/ui/76_battle_placeart.js`). The
region painters in `79_battle_scene.js` remain as the fallback when there is
no place to read (a battle started without a map position).

- **The view looks north**, as the world's camera does: the back of the
  scene is what lies beyond the encounter on the map, left is west, and a
  building shows the front the map shows. A **small room** (at most 20×16
  cells inside) is one fixed glancing view of its back wall: the same
  structure wherever in the room the battle starts. A large hall or open
  country is read around the encounter (10 cells west, 6 east, 10 ahead,
  3 behind), so two places on one map look different.
- **Structure** (never random, never invented): indoors or out; the room's
  walls in the world's own wall styles (timber-framed plaster with a board
  dado where the floor is wood, stone or brick courses otherwise) and the
  building's articulation (the Drowned Archive's arched bays, the
  observatory's pilasters, braces in the bell tower, soot in the kilns);
  openings where the top wall row has a gap; and the landmarks really in
  view: ladder, stairs, the mill's gears and millstone, shelves, pillars,
  bells, kilns, conduits, a building's front with its windows and door where
  the map puts them, the water wheel, bridges, cliffs. Each piece records
  the map prop, building or tile run it comes from (`last().structure`).
  Relations are kept: pieces are placed in their west-to-east order; one
  that would stand behind the creature is either drawn in shadow (large,
  quiet things: the gear train, shelves, the millstone) or slid to its own
  side of the scene; a feature may be left out of view, never moved to
  another wall.
- **The ground** is the map's: the cells in view are projected onto the
  backdrop's ground plane (the encounter's row at the creature's feet, the
  row behind under the party), so water, paths, sand, grass, snow, stone
  and bridges lie where the map has them, with clustered wandering edges, a
  lit shore, and reeds on the banks of maps that grow reeds.
- **Nearby context**: the nearest few real props per kind (trees, reeds,
  rocks, barrels, crates, lanterns…) drawn with the world's own prop art at
  the world's size; far trees, bushes, reeds and rocks become lines on the
  horizon. Nothing is set down on water or over an actor.
- **Accessories**: a seeded, bounded choice of themed clusters per kind of
  place (the mill: sacks and spilled flour, a lantern on a crate, hanging
  scrolls, a peg board, a wall shelf, a broom, rope and a bucket, baskets,
  hay; the kilns: pots, firewood, buckets, ash; the archives: books, loose
  pages, candles, puddles; out of doors: tufts, flowers, pebbles,
  mushrooms by trees, reeds only by water, shells on sand, snow clumps…).
  Indoors two or three on the wall and two or three on the floor; out of
  doors three to five. They go only into free zones: the floor line by the
  wall at the sides the actors leave, the wall under the beam (hanging
  things hang from the beam or a nail on a rail), the near floor at the
  edges; up to half of one may run past the stage's outer edge. They never
  touch the creature's box (its drawing measured from its own frames, its
  shadow and its knots, with room to move) or the party's corner (the
  lower-left third, with room for taller battle sprites). Authored with the
  prop kit in the world's style: a selective outline in the object's own
  colour, never the ink line that marks interactable things.
- **Seeds and stability**: the seed is `opts.presentSeed`, else
  `RB.battlePlaces.forceSeed(n)`, else a hash of the map, the tile and an
  encounter counter kept in memory (not saved). Structure and context do not
  depend on it; only the accessories do. The static layer is built once per
  (composition, frame) and cached; turns, hits and statuses never rebuild
  it. A new frame (a resize, or the overlay's slips changing height) reframes
  the same selection. Cosmetic choices use their own `RB.util.rng`; nothing
  here calls `Math.random` or touches battle state.
- **Light and life**: rooms are dim in their own warm shadow with a pool of
  light where the party stands; windows on the building's front (behind the
  viewer) throw a pale shaft by day; lamps glow. Out of doors the sky and
  ground follow the map's current light (evening and night variants darken
  it, with a few stars). Ambient life is small and bounded: dust (and dust
  turning in a window shaft), a lamp's pool breathing now and then, glints
  on water; none of it with reduced motion.
- **Pixel grid**: everything is drawn at art resolution (2 art px per
  logical px); the static layer is built at scene resolution and blitted at
  the same whole-number scale as the creature and the party.

Limitations: the view always looks north (a scene south of the encounter is
only the near foreground); world props keep their top-down three-quarter
drawing; heights and depths are simplified (one horizon; the far tier is a
line on the horizon); a building's roof is drawn in elevation, not from the
map's art. A battle with no map position (tests, tools) falls back to the
region painter. Evidence: `tests/e2e/backdrops.mjs`; captures in
`docs/screenshots/backdrops/`.

## 9. Things deliberately not done

- No texture behind text, furigana or handwriting strokes.
- No furigana-off toggle.
- No remote fonts, images, libraries or CDNs. Everything is inline in the
  single file, under the existing content security policy.
- No save export/import or share codes.
