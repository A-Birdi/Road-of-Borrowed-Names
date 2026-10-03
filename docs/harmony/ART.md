# Harmony portrait art — the paired busts

**Brief:** the owner's *Harmony Cut-Ins, Expressive Characters, and Illustrated Storytelling* addendum (revised),
§2, §4–§7, §9 (portrait paragraphs), §20.4, §21, §23.3–§23.4. **Scope of this record:** the art only — the
busts, the paired composition and its compact variant, caches and the QA harness. Placement, timing,
lifecycle (`inactive → entering → holding → fading → disposed`), settings and the stage performances belong
to the cut-in overlay and the battle choreography, which build on the API below. Nothing here changes a rule,
a save or a setting.

**Painted art (contract v2).** The owner's painted busts replace these drawings bust by bust through the same API:
docs/harmony/contract/CONTRACT.md (formats, import, runtime) and src/ui/88_harmony_raster.js. While a painted set is
installed, `NATIVE` is the painted pair (352 × 160 / 248 × 128), `PHASES` lists the six performance states and
`timeline(comp)` exists; a bust whose painted files are incomplete is drawn here, whole. With nothing installed,
everything below holds unchanged (`PHASES` is ['enter', 'hold'] and there is no `timeline`).

**Files**

| File | What |
|---|---|
| `src/ui/88_harmony_art.js` | `RB.harmonyArt`: the API, the composition, the ink backing, caches, `fitScale` |
| `src/ui/88_harmony_body.js` | materials, the three-quarter head, eye/brow/mouth drawings, face colours |
| `src/ui/88_harmony_hair.js` | the 12 hairstyles (back mass, cap, fringe and side locks), clumps, seams, the highlight band |
| `src/ui/88_harmony_figure.js` | torso and garments (tunic, robe, coat, apron, dress, high collar), sleeves |
| `src/ui/88_harmony_cast.js` | hand drawings, held props, the five poses (enter/hold, standard/compact), bust assembly |
| `src/ui/88_harmony_acc.js` | every worn accessory and keepsake, on its own side and layer |
| `src/ui/88_harmony_fixtures.js` | `RB.harmonyArtFixtures`: the appearance coverage set generated from the registries |
| `tests/unit/harmony_art.test.mjs` | node checks (no canvas) |
| `tests/e2e/harmony_art.mjs` | browser checks on the built `index.html`; writes `docs/harmony/art_test_results.json` |
| `tests/e2e/harmony_art_sheets.mjs` | the QA viewer: contact sheets in `docs/screenshots/harmony/art/` |

## The standard

* **View.** Both busts are three-quarter views turned toward the shared action (screen right). The near side
  of a face is the character's right (screen left). Head, neck, shoulders and chest down to a deliberate crop
  along the backing's lower edge, plus the gesture that makes each bust distinctive.
* **Rendering.** Everything is drawn by code with `RB.pxkit` at the native grid: hue-shifted material ramps
  (shadows toward violet/crimson, lights toward warm yellow), light from the upper left, flat clustered steps
  rather than gradients, a selective outline per layer in each material's own deep tone (lighter on lit
  upper-left edges), and the battle figures' cool rim light down the right-hand silhouette
  (docs/battle/party.md). Skin ramps are built from the game's own authored light/shadow pair per skin.
  No noise texture, no resampling, no rotation of bitmaps, no anti-aliasing; nothing is generated at runtime
  beyond these deterministic drawings (no `Math.random`, no clock in the drawing code — unit-tested).
* **Faces** are authored pixel drawings placed on whole pixels: eye openings per style (`round`, `soft`,
  `narrow`, `sharp` — the dialogue portraits' styles) for the near and the foreshortened far eye, with the iris
  shaded by row, pupil and two glints; closed (smile/wink) curves; brows from point triples; small nose and
  mouth drawings. The hair casts a step of shadow on the forehead. Expressions are combinations (a lowered
  lid, the cheek pushing the lower lid up, a wink, a flush).
* **Hair** is mass first, locks second: a sphere-lit cap carved by a few seams from the crown (each a dark
  line with a lit edge), fringe and side locks as tapered curved clumps (lit flank, shaded flank, dark
  parting, darker tips), one broken highlight band where the crown turns to the light, back masses one step
  darker. Waves light the clumps' crests. Curls are ringlets with a lit crescent. Shaved hair is stubble
  painted on the scalp with an ordered, thinning hairline. A hat or cap hides the hair above its band.
* **Hands** are authored pixel drawings per gesture and phase (`open`, `openSoft`, `gripR`, `gripL`, `point`,
  `pointSoft`, `pointUp`, `bail`), each on its own outlined layer above its sleeve, with what it holds drawn
  between the sleeve and the fingers (the brush shaft, the vial) or hanging below (the lamp). Fingers are
  separated by the outline, never detached.
* **Effects** are sparse and still: Suzu's one glint beside the winking eye, the player's ink bead with four
  pale motes drawn in, Nao's gold route stroke, the glint on Mio's vial, the stepped glow of Ren's lamp.
  Nothing loops; `enter` and `hold` are two still drawings.

## Sizes chosen, and why

The addendum proposes evaluating a ~256 × 224 art-px working canvas per bust. At that density two busts side
by side need ~430–500 × 224 art px. The display targets (§5.2: ~35 % × 26 % of the view, at most 42 % / 30 % /
12 %) leave room for that only at **1 CSS px per art px** on every common desktop (1280 × 720 allows 538 × 216
CSS px in all; 1920 × 1080, 806 × 324): the art would then be a smooth illustration beside a battle stage
whose figures are drawn at about 3 CSS px per art px at 1920 × 1080 — exactly what §4.3 rules out. The native
size therefore follows the stage's pixel density instead, and the 256 × 224 study is reported as arithmetic,
not shipped.

| Variant | Native (art px) | Visible bounds | Faces (brows–chin) | Why this size |
|---|---|---|---|---|
| standard | **228 × 100** | 221 × 98 | 36 × 33 each | the largest pair that fits §5.2 at 2× on 1280 × 720 and at 3× on 1920 × 1080 — the same art-px density as the battle figures at those views |
| compact | **160 × 84** | 157 × 83 | 36 × 33 each | two heads and shoulders with the gestures brought in; 2× fits a 390- and a 320-px-wide phone with 66 CSS px of face height (≥ 64, §5.4) |

The headroom (72 px above the neck in both) is what Nao's spikes and Suzu's bow need; the compact pair is
shallower below the shoulders, not cropped through hair. `fitScale(w, h, variant)` returns the largest
integer scale inside the limits (standard: 42 % width, 30 % height, 12 % bounding-box area; compact: the view's
width and 27 % of its height — the addendum gives the compact pair no height figure beyond "shallow", so 27 %
is this record's choice, below the standard's 30 % ceiling).

| View (CSS px) | Standard | Footprint (visible) | Compact | Footprint |
|---|---|---|---|---|
| 1280 × 720 | 2× | 442 × 196 — 34.5 % × 27.2 %, box 9.4 % | 2× | 314 × 166 |
| 1280 × 800 | 2× | 34.5 % × 24.5 % | 2× | |
| 1440 × 900 | 2× | 30.7 % × 21.8 % | 2× | |
| 1648 × 840 | 2× | 442 × 196 — 26.8 % × 23.3 % (3× would be 35.7 % high) | 2× | |
| 1920 × 1080 | 3× | 663 × 294 — 34.5 % × 27.2 %, box 9.4 % | 3× | 471 × 249 |
| 768 × 1024 | 1× (faces 33 px) | 28.8 % × 9.6 % | **3×** (faces 99 px) | 61 % × 24 % — the overlay should prefer compact here |
| 844 × 390 | 1× | 26.2 % × 25.1 % | 1× | the overlay's fitting order decides |
| 390 × 844 | — | | **2×** | 314 × 166 — 80.5 % × 19.7 %, faces 66 px |
| 320 × 640 | — | | **2×** | 314 × 166 — 98 % × 25.9 %, faces 66 px |

Evidence: `docs/screenshots/harmony/art/size_study.webp` (the cluster beside the same look's 80 × 104 battle
figure and 96 × 96 dialogue portrait at 1×, 2×, 3×) and the placement mocks `scale_*.webp` (the art laid over
existing battle captures at the chosen scale; real placement is the overlay's). For reference the dialogue
portrait's face is 44 px wide; the busts' faces are 35 px wide: two busts, their gestures and the backing
have to share 26 % of the view's height.

## The composition

* Companion on the left, the player on the right and a little in front (the player's near shoulder and back
  hair may overlap the companion's far side, never a face). Anchors (the pit of the neck) — standard:
  companion (70, 72), Nao (62, 72) to leave room for his pointing hand, player (136, 74); compact: companion
  (45, 72), player (108, 73).
* The backing: a band of indigo ink laid in long horizontal brush strokes (five tones, tapered stroke ends),
  a slow brush-edge top with a few nicks, a straight lower edge rising gently to the right, and a right end
  of brush tails of different lengths that break into dry-brush hairs. Sparse gold runs along the top, paper
  flecks along the bottom and at the tails. Its left edge runs off the canvas (`bleed.left`): the cluster
  reads as having arrived from the left. No lettering, title, slogan, nameplate or "VS".
* The busts are cropped by the band's lower edge (a line across the chest), and the paper edging is redrawn
  over the cut. The heads rise above the band's top edge.
* Nao's route stroke is the one effect drawn over both busts (it joins the pair); the unit and browser tests
  check pixel by pixel that it, or anything of either bust, never changes the other's face rectangle.
  In the compact pair there is no room for it beside the player's face, so it is left out (§5.4: particles
  go before faces).

## The layering contract (§6.4)

Back to front, per bust:

`capeBack · hairBack · earF (far earring, under the jaw) · neck · torso (garment and its construction) ·
chest (satchel or sash strap, bell, pin, patches, the cape's front) · scarf · head (face, near ear) ·
cap (hair over the cranium, clipped to the hairline and around the near ear) · glasses · front (fringe and
side locks) · brows (over the fringe, the dialogue portraits' convention) · headAcc (hat, cap, headband,
ribbon, flower, leaf, quill, pencil) · earN (near earring) · farArm · farHeld · farHand · nearArm · nearHeld
· nearHand · glow · held · ink · fx`

Pose-aware cases: a raised far arm is drawn after the head, so Ren's far hand at the rim of his glasses (as
he arrives) covers part of the lens while the frame, drawn beneath, stays continuous and attached; the
brush shaft and the vial sit between the sleeve and the fingers; the lamp hangs in front; the satchel strap
and sash are clipped to the torso so they follow it; a hat or cap removes hair above its band (no spike or
bun pokes through) while side locks show below the brim; long hair covers the near ear, short and tied hair
leave it clear. Each layer is outlined on its own before compositing, so overlapping parts stay separated.

Sides follow the source, never mirrored: Suzu's ribbon (toward her left, behind the crown) and mole (left
cheek — the far cheek here), the flower, leaf and quill (the character's left, the far side), Nao's pencil
(left), the pin (right chest, near), the satchel strap (right shoulder to left hip), the scarf's tail (left
breast); both earrings (the far one peeking under the jaw). Ren's ponytail and the wrap's knot hang at the
back of the head, as in the road sprites' side view (a portrait's left-swept ponytail would be hidden behind
the head in this view). The braid falls over the far (left) shoulder, as in the portraits.

## Poses (both phases; `enter` arrives, `hold` resolves one gesture)

| Who | Enter | Hold | Expression (hold) |
|---|---|---|---|
| Player (rally) | the writing hand gathered across the chest, the brush up beside the near jaw (the crossing drawing) | swept out toward the action, the brush raised, an ink bead and four motes gathering on the tip | grounded and determined: firm brows, a set, calm mouth |
| Nao (route) | far hand rising past the shoulder, the finger half out | pointing, precisely, toward the action; a short gold route-like stroke runs on from the fingertip | focused three-quarter gaze, a slight sure smile |
| Mio (draught) | the vial low, tilted | the vial raised beside her face, upright, catching the light | composed and reassuring: eyes softened, a quiet smile, a flush |
| Ren (ward) | the lamp low; the far hand settles his glasses at the far rim (crossing the face) | the lamp raised beside his face, its glow framed | intent: lowered lids behind the glasses, level brows |
| Suzu (curtain) | the hand opening, eyes wide, an open smile | the hand opened to the viewer in welcome; a single wink with one glint beside it | animated: the wink, a grin, a raised brow, a flush |

Loose ends settle between the drawings: in `enter` tails, long locks, the ribbon's tails, the headband's
tails, the scarf's tail and the earrings trail 1–2 px; in `hold` they rest. Reduced motion (`still: true`)
always returns the hold drawing.

## Appearance support (§6.1)

The player's look is the **effective** look (`RB.equip.look(s)` — the base look with the worn keepsake, the
resolver's same-place rule included); the cache key is built from every art-relevant field of it, not from
the creation look. Supported: the 7 skins, 10 hair colours, 12 hairstyles, 8 cloth palettes, the garment
shapes (the four creation cuts plus the dress the battle figures support), the 8 creation accessories and
every wearable keepsake: tenugui and knitted scarf (with its stripes), straw hat, ferry cap (replacing a hat),
maple-leaf pin, glass and sea-glass earrings (in their colours), faded ribbon, tiny bell, map-paper sash,
compass-rose pin, pressed road-flower, traveller's cape and the quill. **Not shown:** the Atlas's little
lantern — it hangs at the hip, below every bust's crop (`HK.ACC_NOT_SHOWN` lists it with the reason); its key
still changes, so a stale bust is never reused. No gendered body, makeup or default flower is added; a flush
appears only with a smiling expression.

Companions use their canonical looks and portrait traits from `src/content/00_world.js` (`ch('nao'|'mio'|
'ren'|'suzu')`): eye styles, Mio's pins, Ren's parted fringe and high collar, Suzu's mole, the scarf and
ribbon colours. No future cosmetics are applied.

## API

```
RB.harmonyArt.compose({ comp, look, variant, phase, still, backing, fx, omit, view })
  → { cv, w, h, faces: [{ who, x, y, w, h }], hands: [{ who, x, y, w, h }], anchor: { x, y },
      scale, bleed: { left: true }, bounds, key, phase, variant }
RB.harmonyArt.bust(who, look, pose, phase[, variant]) → { cv, w, h, face, hands, anchor, key }
RB.harmonyArt.prepare(spec | [spec], { async }) → count | Promise<count>
RB.harmonyArt.fitScale(viewW, viewH, variant) → integer CSS px per art px (0: does not fit)
RB.harmonyArt.stats(), clear(), invalidate(look), keyOf(spec)
RB.harmonyArt.ART_VERSION, NATIVE, COMPANIONS, POSE_OF
RB.harmonyArtFixtures.fixtures(), coverage(list)        (QA only)
```

* `comp` is required (`nao|mio|ren|suzu`); with no committed companion there is no composition (§7.1).
* `look` defaults to `RB.equip.look(RB.game.s)`; pass the snapshot taken at the action's start (§6.4).
* `phase` `'enter'` (0–180 ms) or `'hold'`; `still: true` (reduced motion) → the hold drawing; the overlay
  fades the hold drawing out — the art does not change during the fade.
* `faces`, `hands`, `bounds` and `anchor` are in `cv`'s art px; multiply by the chosen scale. `anchor` is
  the point on the band's left edge, half way down, where the cluster enters (place it at the view's left).
* `backing: false`, `fx: false` give the art alone (§23.4 review); `omit` leaves one bust out (tests).
* `cv` is an `OffscreenCanvas` where available (a `<canvas>` otherwise), shared with the cache: draw it
  (image smoothing off), never draw onto it.
* `prepare(spec)`: `spec.comp` one companion or `'all'`; `phase` defaults to both; `variant` to `'standard'`
  (pass `'compact'` too on a narrow view); `look` as for `compose`. It returns the number of compositions built.

## Cache policy (§21)

* Two least-recently-used maps: busts (cap 24) and compositions (cap 16); the backings (two) are kept.
  Keys: `v<ART_VERSION>|who|pose|phase|variant|fx|<resolved look>` for busts (companions' busts are shared by
  every player look), and `v<ART_VERSION>|comp|variant|phase|backing|fx|omit|<resolved look>` for compositions.
* Memory: a bust layer is 160 × 100 × 4 = 64,000 B (twice with its canvas), a composition 228 × 100 × 4 =
  91,200 B (twice with its canvas). At the caps that is at most 24 × 128,000 + 16 × 182,400 B ≈ 5.8 MiB (the
  residency measured in the 20-repeat test is in `docs/harmony/art_test_results.json`).
* `equip:change` drops the player's busts and compositions that are not the running game's worn look;
  `campaign:changing` clears everything (no portrait from another campaign leaks into the next action).
* Cold cost: 52–116 ms per composition (both busts and the composition) across the last two browser runs,
  headless Chromium on the shared, loaded test machine (the spread is the machine's load); before the clump
  rasteriser was optimised, 56–136 ms. Warm (cached): ≤ 0.1 ms. Both phases of one pairing prepared together:
  37–116 ms. The last run's figures are in `docs/harmony/art_test_results.json`. **Call `prepare({ comp, look })` at a safe interval** — at the encounter's start with
  the committed companion, and after an equipment change — never at the moment the technique fires.
  `prepare(..., { async: true })` builds in idle callbacks, stopping after 8 ms of work in each (a single
  composition is never split, so one callback can take one cold build).

## Coverage (§23.3) — the synthetic fixture set

`RB.harmonyArtFixtures.fixtures()` generates **41 fixtures** from the registries (all labelled synthetic): 12
hairstyle fixtures (skins, hair colours, cloth palettes, cuts and accessory categories cycling so each value
appears), the creation default and the owner's acceptance look (green coat, auburn ponytail, flower, glasses),
12 stress combinations, and 15 keepsake fixtures (one per wearable cosmetic, worn through `RB.equip.lookWith`).

| Category | Registry | Covered |
|---|---|---|
| Hairstyles | `RB.sprites.HAIRSTYLES` | 12 / 12 |
| Garment shapes | creation cuts + dress | 5 / 5 |
| Cloth palettes | `RB.sprites.CLOTH` | 8 / 8 |
| Skins | `RB.sprites.SKIN` | 7 / 7 |
| Hair colours | `RB.sprites.HAIR` | 10 / 10 |
| Accessory categories | `RB.sprites.ACCESSORIES` | 8 / 8 |
| Wearable keepsakes | `RB.content.items`, slot `cosmetic` | 15 / 15 (the lamplet is not drawn: below the crop) |
| Stress | glasses + blunt fringe, glasses + long fringe, glasses + wrap, hat + curls, hat + waves, hat + spikes, scarf + strap, cape + strap, headband + twintails, braid + scarf, shaved + glasses + cape, bun + headband | 12 |
| Crossing pose | every fixture's `enter` drawing (the hand across the body); Ren's far hand across his face | all |

Every fixture × 4 pairings × 2 phases × 2 variants is composed in the browser test (656 compositions).

**Not covered (stated plainly):** the full mixed space (7 skins × 10 hair colours × 12 styles × 8 palettes × 5 cuts
× 37 accessory choices (none, one or two of eight) × 16 keepsake states ≈ 20 million looks) is sampled, not enumerated — the fixtures pair each category with others in rotation, not pairwise;
NPC-only accessories (beard, hood, cane, book, basket, toolbelt) are not player options and are not drawn;
the child size (`size: 'child'`) and old age are not distinguished in the busts (no party member uses them);
save/load and campaign-slot switching are exercised only through the cache's event handlers (unit/browser
calls), not through a real save — the overlay integration should cover those paths.

## Tests (this branch, this machine)

| Command | Result |
|---|---|
| `node tests/run-unit.mjs harmony_art` | 52 passed, 0 failed |
| `node tests/run-unit.mjs` (whole suite) | 21,784 passed, 0 failed |
| `node tools/validate.mjs` | no errors |
| `node tests/e2e/harmony_art.mjs` | 39 passed, 0 failed (9–12 s): 41 fixtures, 656 compositions, 1,312 pixel face checks, equipment keys, bounds, phases/variants, reduced motion, scales, timings |
| `node tests/e2e/harmony_art_sheets.mjs` | 11 sheets written, no page errors |

The environment of the timings: Playwright, headless Chromium 141 with a software canvas, 1280 × 720 view,
device pixel ratio 1, a shared 4-core Linux machine under load from other jobs — not a physical device, and
not a phone. No claim is made about phone performance.

## Evidence (`docs/screenshots/harmony/art/`)

| Sheet | Shows |
|---|---|
| `pairings_standard_3x.webp` | the four pairings, enter and hold, standard, 3× |
| `pairings_compact_2x.webp` | the same, compact, 2× |
| `pairings_art_only_3x.webp` | the hold drawings with backing and effects off (§23.4) |
| `appearance_hold_2x.webp` | every fixture's player bust, hold |
| `appearance_crossing_2x.webp` | every fixture's player bust, the crossing arrival drawing |
| `appearance_compact_2x.webp` | every fixture in the compact pairing |
| `size_study.webp` | the cluster beside the battle figure and dialogue portrait at 1×/2×/3× |
| `scale_*.webp` | placement mocks over existing battle captures at 1280 × 720, 1648 × 840, 1920 × 1080 (standard) and 390 × 844 (compact) |

## Limitations and an honest critique (self-review by the implementing agent; no human review)

* **Strong:** distinct, readable silhouettes for all five characters at 2–3× (spikes, bun with pins, the
  ponytail, the waves and bow); eyes with clear irises and glints; the gestures differ in body mechanics
  (point, raised vial, raised lamp, open palm, brush); materials read (glass, lamp glow, leather strap,
  gold trim, ivory apron); every appearance option draws, nothing mirrors, faces stay clear.
* **Weaker:** the torsos are simpler than the heads (planes and a few folds; the garments' construction is
  legible but not rich); hands are small (11–19 px) and mostly fists — the open palm is the most expressive;
  the player's crossing drawing hides most of the brush behind the hand; the faces share one head shape and
  differ by eyes, hair and expression rather than bone structure; curls in very dark hair read as beads;
  wrap and twintail ties are simple; the backing is plainer than the reference's painterly ink.
* **Not done here (other owners):** the overlay's placement against measured protected rectangles, the slide
  /hold/fade timing, settings, skip and cleanup, and the stage performances.
