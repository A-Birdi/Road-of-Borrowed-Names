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

## 9. Things deliberately not done

- No texture behind text, furigana or handwriting strokes.
- No furigana-off toggle.
- No remote fonts, images, libraries or CDNs. Everything is inline in the
  single file, under the existing content security policy.
- No save export/import or share codes.

## 10. Battle presentation: responses, enemy moves, reactions, states

(2026-09-28, brief sections 7–9.) The rules decide; the screen stages.
`RB.combatLogic` (src/engine/95_combat.js) still resolves a whole exchange
at once and returns its fx events. Nothing in the presentation recomputes,
rerolls or applies a rule.

The overlay and the scene show a **displayed state**: a copy of the state
from before the exchange. It steps forward by exactly one fx event at each
**beat**, so each bar, knot, ward and state mark changes once, when its
result is shown. Every sequence ends by reconciling the display with the
rules. With no sequence running, the screen shows the rules' state
directly.

### Files and interfaces

- `src/ui/82_battle_seq.js` — `RB.battleSeq`, the sequencer.
  - `choreo.player(card, fx, ctx)`, `choreo.enemy(intent, fx, ctx)`,
    `choreo.finish(end, ctx)` and `choreo.revive(ctx)` turn authoritative
    fx into timed cues: `pose`, `foe`, `fx`, `strip`, `num`, `beat`, `log`,
    `sfx` and `final`.
  - `run(kind, cues, meta)` returns a Promise. Only one sequence runs at a
    time.
  - `tick(t)` is driven by the frame loop, with dt clamped to 100 ms.
  - `hurry()` plays the rest ×4.
  - `settle(why)` applies every remaining beat in order, at once, and drops
    the transient visuals.
  - `attach(port)` / `detach()` wrap one encounter.
  - `stats()` and `trace()` report counters and the last 40 sequences.
  - `setTimeScale(k)` is for captures only. `T` holds the tuning.
- `src/ui/83_battle_stage.js` — `RB.battleStage`, the stage.
  - `layout(Sr, w, h)` works out the arrangement.
  - `draw(c, w, h, frame)` draws the creature, knots, states, party,
    effects, numbers and the paper strip.
  - `anchor(id, part)` resolves the ids `pc`, `comp`, `party`, `foe` and
    `knot:i` with the parts `hand`, `head`, `chest`, `feet`, `core`, `top`
    and `base`. Anchors are resolved every frame, so a resize keeps effects
    attached. A second creature would be `foe:1`; nothing in the
    choreography assumes one creature beyond this id.
  - `pose`, `foe`, `effect`, `number`, `strip`, `clearTransient`,
    `finalFoe` and `stats` complete it.
  - It holds a small **fallback** for `RB.battlers` (see below).
- `src/ui/84_battle_fx.js` — `RB.battleFx`. Pure pixel drawing:
  - `fx.*` holds about 40 transient effects and `status.*` the persistent
    marks.
  - `digits()` draws 3×5 pixel numbers and `sealMark()` a small seal.
  - Everything is deterministic (no `Math.random`) and bounded: at most 24
    effects and 8 numbers alive at once.
- `src/ui/78_enemy_art.js` — per-creature motion styles.
  - `STYLE`/`MOVES` define them; a definition may also carry `motion`.
  - `motion(id, pose, t, still)` returns offsets.
  - `drawPosed(c, id, t, o, x, y, s, still, pose)` moves, leans, squashes
    or ripples the cached frame in 4-row bands, with whole-pixel offsets
    and no smoothing.
  - `extent()` now also returns `left` and `right`.
- `src/ui/80_combat.js` wires it together.
  - Phases: `intro`, `choose`, `challenge`, `player`, `enemy`, `revive`,
    `finish`, `outro`, `idle`.
  - The displayed state is read with `RB.combat.shown()`; `applyBeat()`
    applies one fx event to it.
  - It keeps the exchange log and recap and the calm clock.
  - Debug and test hooks: `RB.combat.phase()`, `shown()`, `debug()`.

### Timing (presentation ms at normal speed; `RB.battleSeq.T`)

| Your response | ms |
|---|---|
| anticipation pose | 0–170 |
| gesture (`act`) | 170–570 |
| paper strip appears | 120 |
| …travels from the hand to the target and unrolls | 320 / 200 |
| …the ink writes the word (fully written at ≈540) | 120–420 after it appears |
| …fades, gone before the response ends | 850–1000 after it appears |
| first result beat (effect on the target) | 560 |
| further result beats | every 150 |
| Harmony beat | ≥ 780 |
| recovery pose | 900–1140 |
| **response ends** | **1140** (a slip of the brush adds 280 at the start) |

| Its move | ms |
|---|---|
| preparation | 0–320 |
| execution | 320–700 (sweep 320–780) |
| contact / result beat | 560 (+110 after a ward's intercept, +120 for the second target) |
| creature's recovery | from ≈700 |
| **ends** | **≈ contact + 440 ≈ 1000** |
| Waiting | 700 |
| a move that fizzles | ≈840 |
| Mio's draught afterwards | +520 |

The finishing response adds about 1 s. The creature settles (it rises and
fades to 45 %), light motes rise, and you both ease; then the last line
opens. A revive takes about 840 ms.

Measured wall time (trace durations, 1280×800, headless Chromium):
- a response: 1138 ms;
- a Shroud: 1063 ms;
- a Strike followed by Mio's draught: 1582 ms;
- Waiting followed by the draught: 932 ms.

Speed and hurrying:
- Text speed Fast runs everything ×1.4, and Instant ×2.
- Z, Enter or Escape (by the player's bindings), or a fresh click on the
  battle, hurries the current sequence ×4.
- That press is used up, so it never also advances the line that follows.

### Responses (from the real card list)

| Response | Who acts, gesture | The word on paper goes to | Effect / reactions at the beat |
|---|---|---|---|
| ほどく Unravel | you, *direct* | the creature | a paper thread arcs to the knot being freed; the knot opens (ring, flecks); strands peel off; it shivers (*release*) |
| 守る on you / on your companion | you, *ward* | that ally | a brush arc sweeps in front of them and seal tags stand up (one tag per ward point); a ward that blocks the telegraphed Strike stays as one raised seal until the blow meets it |
| 癒す heal | you, *restore* | the party | paper motes rise round both, a soft ring pulses, +n shows the real amount |
| 水 / 氷 water | you, *flow* | the creature | a compact wave lands in a splash, steam rises where there was Heat, the flame pips go, it recoils a little |
| 光 light | you, *raise* | the creature | warm light gathers in the hand, then a revealing flash and rays (no impact); the mist parts |
| 風 wind | you, *flow* | the creature | wind strokes through the mist; the mist parts |
| 縄 rope | you, *trace* | the creature | a loop is thrown round it and cinched; held force scatters |
| 石 / 土 stone | you, *ward* | the party | a stone seal settles at your feet (a Gust or Flood then fizzles) |
| 炎 flame | you, *raise* | the creature if it cleared mist, else the party | flash as light; warmth round the party |
| 鈴 / 声 bell, voice | you, *raise* | the party | clear rings spread; the Hush mark breaks |
| こたえる Answer | you, *book* | the creature | a folded note drifts to it; it eases (*release*) |
| みぬく See through | you, *trace* | the creature | a pale lens forms and cracks across; it recoils |
| あわせ technique | **both**: you *direct* + Nao *direct* / Mio *restore* / Ren *ward* / Suzu *flow* | the creature | a thread of light joins your hands, threads run to the freed knots. Mio: motes and full resolve, states washed away. Ren: seals before both (3 points). Suzu: its move fizzles |

A word that changes nothing (water with no Heat) still plays its gesture
and word. It lands with no state change, and the log says what was woven.

Companions act only when the rules say so:
- a technique;
- Nao's opening (a second thread);
- Ren's lamp interrupting a Gathering;
- Suzu's flourish against a promise, or her misdirect;
- Mio's draught at the end of the exchange.

### Enemy moves (families; the creature's own anatomy)

| Intent | Family | Execution | On the actual target(s) |
|---|---|---|---|
| Strike, False promise, Mirror, Chill | strike | lunges and leans toward its **one** target. A tapered stroke in its own colour leaves its edge; False promise and Mirror send a glinting pane, Chill a frost-blue stroke with frost sparks | impact star, recoil, −n; the bar changes at the same beat |
| Sweep, Flood | sweep | a wider swing; **one** stroke passes over each affected ally in turn (Flood in water blue with foam) | you, then your companion 120 ms later |
| Gust | sweep | wind strokes rake across the party | every seal tag is torn off and blown away, then the blow on you |
| Heat | cast | a glow gathers; embers burst | flame pips appear (one per level) |
| Gathering | cast | motes spiral into its core | motes circle it on an orbit |
| Shroud | cast | mist rolls down off it | a mist bank lies over its knots |
| Re-tying | cast | a thread runs to a loose knot | that knot pulls tight (vermilion ring) |
| Hush | cast | a pale wave rolls onto you | the mute mark settles over the party |
| Plea | cast | a paper note drifts to you | it fades, unanswered |
| Waiting | rest | a slow breath | "It hangs back, waiting." |
| answered (countered) | balk | it winds up, then the move falls apart | puffs of its ink break up. Against a raised 守る the blow is thrown and meets the seal (you brace) |

The motion styles live in `78_enemy_art.js`:
- *flutter* — moths, the crane, the letter: wings raised, a fast beat, a
  darting reach;
- *drift* — wisps, veils: pulls in, then darts out;
- *sway* — lanterns: tilts back and swings;
- *pulse* — echoes, the Hush: contracts and swells;
- *ripple* — blots: shrinks, surges, splashes;
- *lurch* — golems, the kiln, the keeper: rocks back and slams;
- *stamp* — clerks: rises and brings the seal down;
- *swing* — bells;
- *pounce* — foxes: crouches and leaps;
- *scuttle* — crabs: a sideways shuffle and a snap.

Each style has distinct *prep*, *exec*, *cast*, *recoil*, *release*,
*balk*, *settle* and *rest* poses. The ground shadow follows a lunge
sideways only. Positions return exactly, with no drift.

### Reactions (what the rules can produce)

| Outcome | On screen |
|---|---|
| **damage** (`hit`) | impact star, *hit* pose (420 ms), −n above the head, bar at the beat |
| **partly absorbed** (`block` then `hit`) | the seal tag in front flashes and a spent tag flutters off, *brace*, the absorbed amount with a seal mark; 110 ms later a smaller impact and a short flinch |
| **fully absorbed** (`block` only) | seal flash and *brace*; no injury pose |
| **blocked outright** (raised 守る, `countered`) | the blow meets the raised seal; *brace* |
| **no effect** (`countered`) | the move balks and fizzles at the creature |
| **meets air** (Suzu's misdirect) | Suzu's flourish; paper confetti where it would have landed |
| **healing** | motes, +n (the real amount) |
| **knot freed / re-tied** | knot release / re-tie at that knot |
| **down / revived** | kneeling while at 0; your companion's *restore*, a column of light, you *recover* |

The rules have no other result types (no miss roll, no resistance or
immunity), so none are drawn.

### Conditions and wards

| State (holder) | Applied | While active | Removed | Reduced motion |
|---|---|---|---|---|
| Heat 1–2 (creature) | embers burst | one flame pip per level beside its head; rising outlined embers | the splash with steam; the pips go at the beat | pips only, still |
| Shroud (creature) | mist rolls down | a mist bank over its knots | flash or wind; the mist parts | still mist |
| Gathering (creature) | motes spiral in | outlined motes circling it, a held glow | rope cinch, motes scatter (or spent in its Strike/Sweep) | still motes |
| Hush (party) | a pale wave | an arc and an outlined mute mark over you both | rings spread, the mark breaks | still mark |
| Ward points (each ally) | brush arc, tags stand | one paper tag per point in front of that ally | a tag flutters off per absorbed hit; Gust blows all off | still tags |
| Harmony (party) | a thread of light between your hands as it rises | the band's pips; a faint thread between your hands when full | spent by the technique | still thread |

Several states at once each keep one compact mark. The keyword pills on
the slips are unchanged, so nothing depends on colour or particles alone.
Chill has no lasting state in the rules (it is a cold single blow), so it
shows only frost at contact.

### Arrangement

- Your companion stands a step back on the left. You stand in front on the
  right, nearest the creature, so your gestures reach it without crossing
  anyone.
- Both face up-right (that depends on `RB.battlers`; see below).
- The party's integer scale makes a figure about 44 % of the stage height,
  never taller than the creature. A 96-px battle frame therefore draws at
  scale 1 where the 48-px fallback draws at 2, the same size on screen.
- The creature keeps its scale rule. It moves right, clear of the party,
  where the stage allows.
- The backdrop receives `{ S, ex, ey, ext, px, py, ps, scale, art, party }`.
  `party` is the party's box in canvas px, so a composer can keep it clear.
- The whole-screen shake and Heat tint are gone. All feedback is local to
  the actor it concerns, and nothing moves the DOM overlay.

### Learning stays central

- While you choose or write, both adventurers take the *calm* stance. The
  ambient clock (the backdrop's drifting motes, the creature's idle) eases
  to half speed.
- No effect, strip or number is created outside a committed sequence.
  Nothing is drawn over the response cards, the task or the writing pad,
  and no focus is taken. There are no countdowns and no auto-advance.
- The word also goes into the exchange log with its reading, followed by
  what it did. The log stays under the responses as a **Last exchange**
  recap until the next choice, so nothing depends on catching the
  animation.
- The telegraph line chosen for a move stays the same for the whole
  exchange.

### Reduced motion, hidden tabs, cleanup

- **Reduced motion** keeps every beat, word, target, number and state
  mark.
  - The gesture becomes one held pose, with no anticipation or recovery
    flips.
  - The strip appears in place (no travel or unrolling) for about 0.9 s.
  - The creature does not move or change posture; only its settled look
    after the win shows.
  - There are no particles, flashes or fades on the canvas (tested still to
    under 50 changed pixels).
- **Hidden tab:** a sequence settles at once, and any sequence started
  while hidden settles immediately. On return, nothing replays.
- **Watchdog:** if frames stop arriving, a sequence settles after about
  twice its length plus 2.5 s.
- **Failures:** a failing cue or stage draw is logged and skipped. It never
  stops the frame loop, and the display is reconciled from the rules at the
  end of the sequence.
- **Scene exit:** the sequencer settles, its layer and pointer hook are
  removed, its timers are cleared, and the stage's DOM layer is removed.
  This was tested over three consecutive encounters.

### `RB.battlers` and the fallback

The stage calls the character art's battle frames, `RB.battlers`:
- `FRAME` and `ANCHOR`;
- the poses `ready`, `calm`, `anticipate`, `act`, `recover`, `hit`,
  `brace`, `down` and `cheer`;
- the gestures `direct`, `trace`, `book`, `ward`, `restore`, `flow` and
  `raise`;
- `draw(ctx, look, {x, y, scale, t, who, pose, gesture, k, reduce, facing})`,
  which returns the `hand`, `head`, `chest` and `feet` anchors.

Until that module is present, a fallback in `83_battle_stage.js` stands in.
It draws the straight-back walking sprite (32×48) with simple band offsets
per pose and a tiny prop per gesture. Captures made before the merge show
that stand-in, not the rear-three-quarter art.

### Evidence

- `tests/e2e/battle_anim.mjs` holds 16 checks and is in `run.mjs`.
- `--gallery` adds a sheet of every response and every enemy-move family,
  each captured at its beat.
- `--docs` copies the WebP strips to `docs/screenshots/battle/`.
- Frames and strips go to `tests/e2e/out/battle_anim/`.
