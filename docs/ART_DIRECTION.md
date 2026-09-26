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
   and at 200 % text, nothing is wider than the screen. If the tab labels
   cannot fit, the rail scrolls and shows arrows instead of clipping them.
   (6)
5. **Contrast.** Ink and furigana on paper are at least 4.5:1. Focus rings,
   the ribbon, the "you are here" mark and control outlines are at least
   3:1 against what is next to them. High contrast is the same or stronger.
   (7)
6. **Viewport and touch.** Full-screen surfaces are sized in `svh`, with a
   `vh` fallback. The on-screen keyboard is handled with `visualViewport`
   (planned for the answer input, Phase B). Interface elements use
   `touch-action: manipulation`. Pages use `pan-y pinch-zoom`. `none` is
   reserved for the game canvas, the movement pad and the writing canvas
   (moving it off `#app` is planned in Phase B). (8, 9, 10)
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

## 7. Pixel art (Phase C, planned)

The world keeps its 16-px logical grid. Map IDs, collisions, triggers,
movement and saved coordinates are unchanged. Art is authored at twice the
logical resolution: 32×32 tiles and ~32×48 characters drawn into the same
logical footprint. They are generated procedurally at load time, cached as
canvases, and drawn at integer scale. The art is redrawn, not enlarged with
nearest-neighbour scaling. Details and progress are recorded in
`VALIDATION.md` and `HANDOFF.md` as the work lands.

## 8. Things deliberately not done

- No texture behind text, furigana or handwriting strokes.
- No furigana-off toggle.
- No remote fonts, images, libraries or CDNs. Everything is inline in the
  single file, under the existing content security policy.
- No save export/import or share codes.
