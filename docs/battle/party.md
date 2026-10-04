# Party art in battle — the player, Nao, Mio, Ren and Suzu

**Area:** party worker (docs/BATTLE_ART_CONTRACTS.md). **Brief:** battle addendum §5–§8, §10 (party side),
§17, §18.3, §21.4–21.5, §22.4, §23.5 (party); round 2: the owner's restyle brief. **Base:** 982c8df (round 1),
6855ba1 (round 2). Everything here is presentation: no
damage, target, knot, learning, Harmony, Bond, reward or party-size rule was changed.

# Round 2 — the restyle against the owner's reference (2 October 2026)

**Why.** The owner played the addendum's build (Firefox, about 2000 × 1090) and asked for the battle art to be
"reshaped to fit more in line with the supplied style" (the armoured-knight reference: strong silhouette,
coloured outlines, hue-shifted ramps, a cool rim light, cast shadows, material-specific rendering, clean
clusters, dense authored detail). In battle the player "read more like a standard idle". **Base:** 6855ba1 (the
lead's fix that keeps the party in the ready stance while choosing). Poses, gestures, deliveries, contact beats,
timings and every rule are unchanged; this round changes the form and the rendering, and fills the idle's holds.

## Files (round 2)

| File | Change |
|---|---|
| `src/engine/34_battlers.js` | new colour system (`hramp`: six hue-shifted tones, outline, lit-edge and rim tones per material), per-material recipes, the craft passes in `render1` (cast shadows, form lines, seams, rim, clusters, coloured selective outline), hair locks / tufts / spikes, bows, scarf, cape folds, folio brass, cuff buttons, belt buckle; head ×0.9 and shoulders 9.1 (were 8.6) |
| `src/engine/34m_battler_moves.js` | the battle-ready pulse (`PULSE`, idle keys `i.4` dip and `i.5` breath); the player's stance gains a weight shift (pelvis roll 2.6°, shoulders −2°) |
| `tests/unit/battle_party.test.mjs` | idle frame bound 6 per key (was 4: the pulse adds two drawings per key); the cadence is asserted (6–12 changes a second, no still hold over 260 ms) |
| `tests/e2e/battle_party_restyle.mjs` | new: before/after sheets, cadence, in-battle captures, the Normal clip |
| `docs/battle/party.md`, `docs/screenshots/battle/party_restyle/`, `docs/screenshots/battle/README.md` (one row) | this record and its evidence |

No change to `src/ui/84p_party_fx.js`, `84p_party_word.js` or `84p_party_choreo.js` (the effects sit on the new
figures without a colour change; reviewed in `families_gallery` captures of the `battle_party` run), the overworld
sprites, portraits, pets, the stage's `layout()` or any rule.

## The frame standard, measured again: 80 × 104 stays

The 96 × 128 working frame (`GRIDS.w96`) was put on the stage (FRAME/ANCHOR overridden in the page, the rig
drawn on that grid) with Mio, a cat and three Flour Moths (the Mill, a diagnostic placement), and compared
with 80 × 104 (scratch probe, Chromium, CSS px = art px at these phone widths):

| Viewport, creatures | Frame | Figure height | Player's box inside the lead creature's frame box | Mio's box inside a creature's frame box |
|---|---|---|---|---|
| 390 × 844, three | 80 × 104 | 81 px | 13 % (lead), 14 % (back left) | 27 % |
| 390 × 844, three | 96 × 128 | 94 px | 45 % (lead), 27 % (back left) | 43 % |
| 844 × 390, three | 80 × 104 | 81 px | 0 %, 33 % | 33 % |
| 844 × 390, three | 96 × 128 | 94 px | 25 %, 44 % | 54 % |
| 1280 × 800 / 1920 × 1080, one | either | — | 3 % → 9 % / 0 % | 0 % |

(The creatures' boxes are their frame extents, larger than their drawn wings, so the shares overstate contact; the
captures show the larger party's heads entering the lead moth's lower wings at 390 × 844, which the shipped size
does not.) A larger frame would also move the companion and the pet apart (`layout()` spaces by frame width) and
change the pets' measured figure height (`src/ui/85_battle_pets.js` sizes the pet against the companions'
ready height). **Decision: 80 × 104 at 1.14 art px per body unit stays**; the gain goes into form and rendering.
The pets' measure after the reshape: companions' mean ready height 80 px (base 81.75 px) → the pet's density stays
1.0 (unchanged).

## The new standard

**Proportions.** Head radii × 0.9 (child × 0.94), shoulder half-width 9.1 units (was 8.6): the shoulder line reads
past the head from behind; the hair is drawn relative to the head. The player's stance carries a weight shift
(the left hip up, the free right hip dropped, the shoulders set against it, the near foot forward).

**Ramps (`hramp`).** Six tones per material, the material's own colour as tone 3 (the lit plane):

| Tone | Lightness | Hue | Saturation |
|---|---|---|---|
| 0 deep shadow | l × (1 − 0.6·lo) | 30° toward the cool target | + 0.16 |
| 1 shadow | l × (1 − 0.41·lo) | 19° toward cool | + 0.11 |
| 2 half-light | l × (1 − 0.2·lo) | 8° toward cool | + 0.05 |
| 3 lit plane | l | — | — |
| 4 highlight | l + (1 − l) × 0.36 | 13° toward the warm target | − 0.02 |
| 5 sheen / specular | l + (1 − l) × 0.66 | 24° toward warm | − 0.1 |
| outline (OL) | l × 0.26, clamped 0.07–0.19 | 42° toward cool | + 0.22 |

Cool target 250° (blue-violet; warm hues reach it through crimson, so orange hair and gold shade to red-brown),
warm target 52° (yellow-cream); blues (170–255°) brighten toward cyan instead of round through violet. `lo` is 1 for mid colours, 0.8 above l 0.62, 0.62 above l 0.78; dark colours lift
less toward their highlight. Pale colours (l > 0.74, s < 0.5: creams, whites, ivory) shade toward a cool grey
(hue shift × 0.4, shadow saturation × 0.4). A true grey (s < 0.035) takes a steel hue (222°). LIT (the lit-edge
line) is OL mixed 55 % toward tone 1; RIM is tone 3 mixed 50 % with `#8ec0ff` (skin: `#b8d0ff`).

**Light.** One key light, upper left and a little toward the viewer (unchanged vector). Terminators are sharper
(thresholds on n·L for tones 4 / 3 / 2 / 1: 0.74 / 0.3 / 0.1 / −0.5; cloth 0.72 / 0.3 / 0.1 / −0.5, so a garment's
upper-left planes take a broad lit tone against a clear shadow side; hair 0.9 / 0.32 / 0.12 / −0.45, its light is
in the locks and the arc): planes, not staircase gradients round the outline. Tone 5 only where a recipe puts it.

**The passes (`render1`), in order.**
1. *Cast shadows*: from each pixel's surface point, four samples toward the light (1.2–4.6 body units) through the
   depth buffer; when a nearer part of another form (0.5–7 units in front) lies on that path, a lit pixel drops to
   tone 1, a shaded one a step. Shapes: under the head and hair on the collar and nape, under an arm on the side,
   under a hat's brim, a strap, a bow.
2. *Form lines*: a pixel beside a nearer part of another form (> 2.4 units) takes its own tone 0 — a line on the
   farther form, lighter than the silhouette's outline. *Seams*: where two different colours meet at nearly one depth
   (a belt on a coat, a cuff, a boot's top, a trim), the one underneath (toward the light) takes −1 and the raised
   one's top edge +1.
3. *Rim*: on the outer right silhouette (three empty pixels to the right), where the surface faces right and is not
   in the key light, the material's RIM tone — a 1 px cool strip down the figure's right side.
4. *Clusters*: a lone pixel whose four neighbours agree on another tone of its ramp takes theirs.
5. *Outline*: every pixel round the silhouette takes the OL of the material it borders (the one below first);
   on upper-left edges of lit forms it breaks into LIT. A look's `outlineCol` still overrides it.

**Per-material recipes.**

| Material | Base colour | Recipe |
|---|---|---|
| Skin, face, hands | the look's skin | shadows toward crimson (352°), desaturated × 0.6, lo 0.55; outline dark red-brown; the cheek in rear view: a jaw shadow, a lit cheekbone; hands never below tone 2 |
| Hair cap | between the hair's mid and light colour (sat × 1.12; × 0.98 for light hair; very dark hair a cool sheen, warm target 225°) | seven locks hanging from the crown, each lit on its left flank (the normal bent across the lock), a dark parting low between locks, a light only in a lock's middle; a highlight arc of one ≤ 2 px dash per lock where the head turns to the light; the nape edge is the locks' tips |
| Hair tufts | same | short, ponytail, braid and twintails: four clumps at the back and sides ending in points (the outline is locks, not a ball); none on bun, spiky, long styles |
| Tails, braids, long falls | same | strands along the form, lit flank, one highlight dash high on a tail |
| Spikes | same | nine spikes aimed up, out and back so they read on the outline in profile (not end-on), their undersides shaded; the cap under them plain |
| Curls | same | sharp terminator; one glint only on the lit curls |
| Cloth: skirts, coats, robes, capes | the outfit's main colour (sat × 1.22) | folds round the form (7; robes 9; capes 6), each a lit ridge and a shadow valley, deeper toward the hem; a crease line low in each valley; gathers under the belt; the hem turned up; a coat's back vent |
| Cloth: sleeves, trousers | same | creases ringing the elbow and knee, lit on top |
| Cloth: back | same | a centre-back seam below the shoulder blades |
| Belt, cuffs, trims, collar | the outfit's accent | the belt's lit top edge and dark lower edge; a gold buckle at the near hip (tunic, coat, apron); a button glint on each cuff |
| Bows (dress, robe, apron) | accent / ivory | loops tipped up and out, folding into the knot (inner end shaded, outer end lit), the knot a step darker, two short tails in an inverted V |
| Scarf | the scarf's colour | a wrap with folds round the neck, a knot at the back-left, a folded tail streaming over the shoulder blade that splits into two ends; a striped keepsake carries its stripes on the tail |
| Leather: boots, satchel, folio | boot colour (near-black lifted toward brown), `#8a6a3a`, `#9a4a3c` | boots: a dark sole, a toe-cap glint, a lit turned-down top; the folio: brass corners and a clasp on the fore-edge |
| Metal: brass, gold, iron | `#e0b850`, `#4a4450` | hard bands only (tones 0/2/4/5 by the light), a near-white streak where it faces the light |
| Glass: Mio's vial | `#5aa898` | a dark rim, the body, one glint |
| Paper, ivory | `#f0e6cc`, `#ece4d4` | pale ramps (cool-grey shadows) |
| Glow (the lamp) | fixed warm ramp | no rim; flares a step lighter |

## The idle: a battle-ready pulse

Measured on the base build (one loop, drawn frames compared): the ready idle changed pose **3.2–5.2 times a second
with still holds up to 0.78–1.08 s** — the keys (300–1,800 ms holds) read as standing still between moves. Now,
while a ready key is held (after its settling frame), each person keeps a small rhythm, one drawing per step:
dip (knees give, the hair settles) → the key → breath in (the chest lifts) → the key. The keys, their order, holds
and transitions are unchanged; the calm stance (language task open) and reduced motion are unchanged (calm keeps
its quiet keys; reduced motion holds one drawing).

| Actor | Pulse step | Character | Ready idle, base → now (drawn changes a second) | Longest still, base → now | Distinct frames, base → now |
|---|---|---|---|---|---|
| player | 130 ms | knees and breath | 4.42 → 8.40 | 776 → 128 ms | 32 → 47 |
| Nao | 112 ms | quick, springy | 4.44 → 9.77 | 696 → 296 ms | 26 → 40 |
| Mio | 150 ms | a composed breath, the head tilting | 3.20 → 7.52 | 896 → 148 ms | 22 → 34 |
| Ren | 160 ms | grounded, slow | 3.77 → 7.14 | 1,076 → 156 ms | 28 → 42 |
| Suzu | 124 ms | her rhythm, a sway of the hip | 5.23 → 9.23 | 776 → 156 ms | 29 → 38 |

(`node tests/e2e/battle_party_restyle.mjs cadence`; the unit test asserts 6–12 key changes a second.)

## Gap list per item, before → after

Measured on sheets at 1× and 3× beside the reference (scratch sheets; the reference is not committed) and in
battle at 1920 × 1080, 1280 × 800 and 390 × 844. Numbers refer to the reference points: 1 silhouette and pose,
2 outlines, 3 ramps, 4 light, 5 materials, 6 clusters, 7 detail density.

| Item | Before (round 1) | After (round 2) |
|---|---|---|
| **The player in the owner's look** (auburn ponytail, green coat, pink flower; proof 1) | 1: a ball of a head as wide as the shoulders, the shoulders hidden, upright and symmetric. 2: one near-black outline everywhere, thin interior lines. 3: pale, low-contrast green; orange hair with little range. 4: no rim, no cast shadows; the cheek a flat skin plane. 5: hair as even stripes, cloth as stripes, boots dark blobs, the folio a flat block. 6: single-pixel stripes and staircase bands. 7: a belt and cuffs only. Idle: 4.4 changes a second, holds to 0.78 s | 1: head × 0.9, shoulders wider, a weight shift (hip up on the standing leg, shoulders against it); the hair's outline locks with pointed tips. 2: coloured outlines (plum on hair, deep green on the coat, red-brown on skin), lighter on lit edges; form lines on the far form. 3: six-tone ramps (green shadows toward teal, lights toward yellow-green; hair shadows crimson, highlights gold). 4: a cool rim down the right; shadows under the hair on the nape, under the arms. 5: locks with a highlight arc; folds with lit ridges and creases, a back vent; leather boots with sole and toe cap; the folio's brass corners and clasp. 6: clusters (lone pixels folded in; lock and fold shapes). 7: cuff buttons, a buckle and the belt's hanging end, the vent, the clasp. The coat's lit plane is a light green against a dark-green shadow side. Idle 8.4 changes a second |
| **Unravel's thread** (proof 1) | the strip a pale sliver | the strip in the pale-paper ramp with its own outline; the hand's skin and cuff read against the coat |
| **Mio** (proof 2) | soft teal, a grey-black bun, a white apron bow that read as a blob, a pale vial | deep teal with cool shadows; black hair with a cool sheen and a lit bun; the bow's loops fold into a darker knot (ivory shading toward cool grey, no orange); the vial's glass rim and glint; idle 7.5 changes a second |
| **Nao** | spiky hair seen end-on (dark spots), a scarf as a ring of beads | spikes in profile on the outline; the scarf a folded wrap with a knot and a tail splitting into two ends; the big satchel's leather and strap; 9.8 changes a second |
| **Ren** | a violet-leaning, low-contrast navy coat, blue-black hair flat | a navy ramp: lights toward cyan, shadows toward violet, deep blue outline; a cyan sheen on the hair; the lamp's warm glow unchanged; patches, glasses and the coat's belt end; 7.1 changes a second |
| **Suzu** | wavy hair flat, dress hem soft | strands in the long fall with one highlight band, the hem trim lit, the ribbon on its own ramp and outline; 9.2 changes a second |
| **Every hairstyle** (13 incl. bald) | locks as stripes, ball silhouettes | caps with locks and arcs; tufts on short/tied styles; bob, long and wavy falls in strands; spikes in profile; curls with single glints; shaved stubble and the wrap's bands on the new ramps |
| **Cuts and palettes** (5 cuts, 8 palettes) | pale fills | each palette on its ramp (gold outfit deeper ochre, white outfit cream with cool-grey shadows); folds per cut |
| **Skins and hair colours** (7, 10) | — | every skin on the crimson-leaning skin ramp; light hair desaturated so gold stays gold; dark hair a cool sheen |
| **Accessories and keepsakes** (8 + 15) | flat colour fills | every one on its own ramp and outline; scarf and keepsake scarves folded with split ends; capes folded; hats, caps, bells, ribbons, leaf, quill, sash, pin, lamplet drawn by the same passes (sheet `looks_accessories`) |

## Self-review against the reference points (self-review by the implementing agent; no human review)

Scores per point: 0 missing, 1 present but weak, 2 clearly there, 3 matches the reference's craft at this size.

| Item | 1 silhouette | 2 outline | 3 ramps | 4 light | 5 materials | 6 clusters | 7 density | Notes |
|---|---|---|---|---|---|---|---|---|
| Player (owner's look) | 2 | 3 | 3 | 2 | 2 | 2 | 2 | The weight shift and lock tips help; the coat is still a bell from behind, with no overlapping cloth forms like the reference's plates. |
| Mio | 2 | 3 | 3 | 2 | 2 | 2 | 2 | The apron bow is clean but small; at 1× it reads as a pale accent at the waist. |
| Nao | 2 | 3 | 3 | 2 | 2 | 2 | 2 | Spikes read; spike highlights are a little busy at 3×. |
| Ren | 2 | 3 | 3 | 2 | 2 | 2 | 2 | Bluer navy than round 1 (which leaned violet); the lamp carries their light. |
| Suzu | 2 | 3 | 3 | 2 | 2 | 2 | 2 | The long fall is one mass; its strands are quiet by design. |
| Player looks (all options) | 2 | 3 | 3 | 2 | 2 | 2 | 2 | No option keeps the old rendering (one renderer); a few combinations (white hair on cream cloth) have lower separation. |

What does not reach the reference: its detail per square pixel (an 81-px figure cannot carry plate seams and rivets
at that density), its hand-placed cluster shapes, and its dynamic three-quarter contrapposto (our poses
are the round-1 poses, which keep the rear view required by the stage).

## Budget and build times (round 2)

- Frame size unchanged (80 × 104 × 4 = 33,280 bytes); cache cap unchanged (720 frames = 22.85 MiB); keys still name
  the idle key frame (now `i.0`–`i.5`), never elapsed time (unit-tested).
- Idle frames per actor (ready): ≤ 48 (measured 34–47 distinct drawings; round 1: ≤ 32). Prewarm covers them
  (`idleTimes` includes the dip and breath of every held key), built in 6 ms slices in idle time as before.
- Resident party frames after real encounters (`battle_party` resources test, Chromium): 57–166 frames, 1.81–5.27 MiB per encounter (round 1: 42–111 frames, 1.33–3.52 MiB); the round-1 diagnostic
  fixtures that perform every action of a companion in one battle stay under the 720-frame cap.
- Whole battle-art budget (`battle_budget`: every creature family alone and in threes, a companion and a pet):
  the largest estimated residency is 37.41 MiB of 48 (party 5.08, creatures 28.92, pets 3.42 MiB; round 1's final
  build: 37.12 MiB); the party's own largest was 5.27 MiB (166 frames).
- Build time per frame: in Chromium, mean 7.4–10.4 ms, worst 69.8 ms (`battle_party` resources test) (round 1: mean 13–17 ms, worst 239 ms under
  load); in node (unwarmed, load ≈ 6), mean 18–27 ms per frame, worst 137 ms (the first frame, JIT).
  The craft passes cost about four depth-buffer samples per drawn pixel (cast shadows) plus three neighbour passes.

## Tests (round 2), on this branch's final build

Chromium headless (software canvas), browser suites one at a time on a shared 4-core machine (load average in
brackets). Unit tests and the validator in node.

| Command | Result |
|---|---|
| `node tests/run-unit.mjs` | **15,339 passed, 0 failed** (`battle_party`: 73 passed, with the changed idle bound and the new cadence check) |
| `node tools/validate.mjs` | no errors |
| `node tests/e2e/battle_party.mjs` | 14 passed, 0 failed (load 6.7): solo, the four diagnostic fixtures, Protect at Normal (word fully readable 700 ms, ward at 633 ms), Heal truthfulness, every family, the customization registry (1,250 frames drawn, planted, unclipped), frame sheets, resources, the Mio exchange, the Satchel preview, the recording |
| `node tests/e2e/characters.mjs` | 23 passed, 0 failed (load 5.9): 2,970 battle frames planted and unclipped, every gesture/hit/brace back to the stance pixel for pixel, accessories attached in every pose, reduced motion still, normal motion alive with the feet planted |
| `node tests/e2e/battle_anim.mjs` | 15 passed, 1 failed in the full run (load 8.8: "learning stays central" — `page.click` timed out after 30 s); re-run alone: passed. It passed in the full run on the previous checkpoint build (16 of 16). Recorded as timing under load |
| `node tests/e2e/battle_pets_overworld.mjs --battles-only` | 3 passed, 0 failed (load 10.2): the pet stays in its place, clear of the adventurers' feet and the badges, in every sampled frame |
| `node tests/e2e/battle_budget.mjs` | completed (load 16.3): largest estimated residency **37.41 MiB of 48** (after sb.fox ×3: party 5.08, creatures 28.92, pets 3.42); the party's largest 5.27 MiB (166 frames) |
| `node tests/e2e/battle_cycle.mjs` | completed (load 10.8): 20 entries and exits, every battle-only element gone, listeners 101 → 101 |
| `node tests/e2e/battle_presentation.mjs` | 11 passed, 0 failed (load 6.8), including "one cadence" and Normal / Fast / Instant |
| `node tests/e2e/battle_group.mjs` | 6 passed, 0 failed (load 7.3) |
| `node tests/e2e/combat_ui.mjs` | 7 passed, 0 failed (load 4.7) |
| `node tests/e2e/fishing.mjs every companion` | 1 passed, 0 failed (the fishing stage draws its figures through this rig) |
| `node tests/e2e/battle_party_restyle.mjs --docs` | 4 passed, 0 failed: the sheets, the cadence (asserts 6–12 changes a second per actor), the in-battle captures, the recording |

Changed tests: `tests/unit/battle_party.test.mjs` — the idle's frame bound is 6 per key instead of 4, because the
pulse deliberately adds a dip and a breath to each held key; a new assertion checks the ready idle's cadence (6–12
key changes a second, no still hold longer than 260 ms). No browser test was changed.

## Evidence (`docs/screenshots/battle/party_restyle/`)

All made by `node tests/e2e/battle_party_restyle.mjs --docs` from the built `index.html` ("after") and the base build
6855ba1 ("before", `git show 6855ba1:index.html`), Chromium headless. The owner's reference is not in any committed
image (it may not enter the repository); the side-by-side sheets with the reference used for the review are scratch
files, not committed.

| File | What it shows |
|---|---|
| `proof_robin.webp` | Proof 1: the player in the owner's look (auburn ponytail, green coat, pink flower) — ready, a pulse dip, calm, Unravel's thread (anticipation, lift, draw, drawn, recovery), a hit and its catch, the cheer and its settle; before / after at 1× and 3× |
| `proof_mio.webp` | Proof 2: Mio — ready, a pulse dip, calm, her warm draught (anticipation, uncork, tip, pour, recovery), dab, waft, salts, tonic, help |
| `pc_gestures.webp`, `pc_reactions.webp` | The player: all 15 own gestures (anticipation and release); every reaction (hit, softened hit, brace, wary, guard, soothed, hush, gust, chill, slip, down, cheer) and the rise |
| `mio_all.webp`, `nao_all.webp`, `ren_all.webp`, `suzu_all.webp` | Each companion: stance, a pulse dip, calm, every own gesture (anticipation and release), the technique, every reaction |
| `looks_hair.webp` | All 12 hairstyles and bald |
| `looks_cut_palette.webp` | All 5 cuts on one palette, then all 8 clothing palettes |
| `looks_skin_haircolour.webp` | All 7 skin tones, all 10 hair colours |
| `looks_accessories.webp` | The 8 creation accessories and the 15 keepsakes as worn |
| `battle_1920x1080.webp`, `battle_1280x800.webp`, `battle_390x844_three_cat.webp` | The Mill's Flour Moth with the player (owner's look) and Mio while choosing; at 390 × 844 three moths and a cat (diagnostic placement) |
| `battle_*_party_before_after.webp` | The party region of each, before and after, enlarged (whole pixels) |
| `unravel_and_draught_normal.webm` | Playwright's real-time recording at Normal (1280 × 720): 2.6 s of the ready idle, the player's Unravel, Mio's warm draught (DIAGNOSTIC FIXTURE: every support action unlocked in a Chapter 1 room). 1,992,393 bytes; the response took 1,568 ms and the draught 1,377 ms on the presentation clock. Not machine-reviewed frame by frame (headless Chromium here does not decode video). |

The round-1 sheets in `docs/screenshots/battle/party/` show the art before this round.

## Limitations (round 2)

- Every art judgement here is a self-review by the implementing agent; no human review, no playtest.
- Chromium only; the owner plays in Firefox. The art is canvas pixels at whole-number scales, so no browser-specific
  rendering is expected, but it was not checked.
- The frame stays 80 × 104: the reference's density of authored detail cannot be reached on an 81-px figure; detail
  was added where it reads (lock tips, folds, brass, buttons, buckle, the belt's end).
- The poses are round 1's (the rear view the stage needs); only the player's stance gained a weight shift. A
  stronger three-quarter contrapposto for every person would need re-authoring the gestures that start from it.
- The fishing stage draws its figures through this rig, so it shows the new rendering too (its poses and test are
  unchanged; `fishing.mjs` "every companion" re-run below).
- The pets size themselves against the companions' ready height (now 80 px, base 81.75 px); their density rounds
  to the same 1.0, but a further change of the figures' height could change it.
- The ready pulse runs at a fixed step per person; it is not re-timed by the playback speed (the idle never was).
- Observed, not changed: in the Protect-at-Normal trace the player's poses run anticipate:ward → act:ward → ready →
  recover:ward, i.e. at least one sampled frame shows the stance between the act and the recovery. The base build
  6855ba1 shows the same trace (run on it for comparison), so it predates this round; it is choreography timing
  (`84p_party_choreo.js`), which this round does not touch.

## Merge notes (round 2)

- Own area only: `src/engine/34_battlers.js`, `src/engine/34m_battler_moves.js`, `tests/unit/battle_party.test.mjs`,
  the new `tests/e2e/battle_party_restyle.mjs`, this file and `docs/screenshots/battle/party_restyle/`.
- Shared, one line: `docs/screenshots/battle/README.md` gains the `party_restyle/` row (and the `party/` row says it
  is round 1).
- No stage change: the frame stays 80 × 104, so `layout()`, the pets' placement and the fishing stage's anchors are
  untouched. `RB.battlers` keeps its API (`draw`, `preview`, `anchors`, `prewarm`, `retain`, `budget`, `_.render`,
  `_.poseAt`, `_.measure`); `RB.battlerMoves` adds `PULSE` and idle keys `i.4`/`i.5`.
- `index.html` is generated and not committed on this branch: rebuild after merging.


# Round 1 — the articulated rig (the battle addendum)

## What was built

- **The rig, upgraded** (`src/engine/34_battlers.js`): articulated hands (palm, fingers, thumb; eight
  shapes: fist, relaxed, open, flat, point, pinch, cup, spread), drawn a size up like the head so a gesture
  reads from the hand; held objects that exist in each person's vocabulary (the player's folio, strip and
  brush; Mio's vial, taken from the bottles at her hip — the hip bottle is gone while it is in her hand —
  uncorked and tipped to pour; Ren's lamp, raised, thrust or swung when a gesture frees their left hand, its
  glass flaring); a layered cuff; separate anchors; hair under a hat or cap tucked under it (no spikes or
  bun through the crown; curls round the sides) and head things sized to curly hair.
- **The pose library** (`src/engine/34m_battler_moves.js`, new): a stance, 7–8 idle key poses, a quieter
  calm, own gestures and the §7.5 reactions for each of the player, Nao, Mio, Ren and Suzu (and a plain
  stance for any other figure).
- **The choreography** (`src/ui/84p_party_choreo.js`, new): every response family, every one of the 20
  companion support actions and each coordinated technique has its own entry — gesture, the written
  word's motion, the effects that carry it to its actual targets, timing — and the party's reactions to
  what the rules did. `RB.battleSeq.choreo.player/companion/finish/revive`, `planOf` and the party-side
  cases of `reactions` in `src/ui/82_battle_seq.js` delegate to it.
- **The written word's own motion** (`src/ui/84p_party_word.js` + `src/styles/61_battle_party.css`, new):
  15 motifs; a ward's seal unfolds over the protected one and folds shut, a thread is paid out from the
  strip, light rises from the raised hand, water arcs, wind drifts, a binding wraps, stone drops to the
  ground and sets, a bell's word swells with each ring, an answer folds into a note, a falsehood's word
  cracks. The word is the resolved Japanese with its reading (§8.2): a word card's own word; for Unravel,
  a technique, an answer or a seeing-through, the word or phrase the answered task restored.
- **Party effects** (`src/ui/84p_party_fx.js`, new): 28 effects added beside the shared ones.
- **Stage hooks** (`src/ui/83_battle_stage.js`, not `layout()`): the actor id passed to the rig; a
  creature's preparation aimed at an adventurer makes them brace a little (`guard:wary`); reaction
  variants kept apart from gesture labels; the strip asks `RB.partyWord` for its motif's placement.

## Files and APIs

| File | What | Status |
|---|---|---|
| `src/engine/34_battlers.js` | the rig: grid, raster, hands, garments, hair, accessories, props, anchors, cache, budget | rewritten in part |
| `src/engine/34m_battler_moves.js` | `RB.battlerMoves`: stances, idle keys, gestures, reactions, coverage | new |
| `src/ui/84p_party_choreo.js` | `RB.partyChoreo`: families, techniques, support actions, reactions, finish, revive, `resolvedOf`, `coverage()` | new |
| `src/ui/84p_party_word.js` | `RB.partyWord.place(o)`: the word's motion per motif | new |
| `src/ui/84p_party_fx.js` | 28 party effects in `RB.battleFx.fx`; `RB.partyFx.NAMES` | new |
| `src/styles/61_battle_party.css` | the strip's look per motif | new |
| `src/ui/82_battle_seq.js` | party functions delegate (choreo.player/companion/finish/revive, planOf, party reactions) | edited (my functions) |
| `src/ui/83_battle_stage.js` | actor id, wary brace, variant labels, strip motif hook | edited (party drawing, strip) |
| `src/ui/80_combat.js` | passes the answered task to `playPlayer` (3 lines) | shared, small |
| `tests/unit/battle_party.test.mjs` | unit coverage | new |
| `tests/e2e/battle_party.mjs` | browser fixtures, captures, recording | new |
| `tests/e2e/characters.mjs` | POSES/GESTURES checked as *including* the agreed lists | shared, one assertion |

`RB.battlers` (contract kept; additions in bold):

```
FRAME {w: 80, h: 104}, ANCHOR {x: 36, y: 100}, POSES (+ guard, soothed, afflict), GESTURES (38), VARIANTS
draw(ctx, look, { x, y, scale, t, who, id, pose, gesture, k, reduce, facing })
  -> { hand, head, chest, feet, torso, handR, handL, held, release, waist, lamp }   // canvas px
     hand = release: where an effect leaves (brush tip, strip end, open folio, vial lip, lamp, fingertip, palm)
     id: 'pc' | 'nao' | 'mio' | 'ren' | 'suzu' (without it a companion is recognised by their look)
     gesture: a gesture for anticipate/act/recover; a reaction's variant for hit (soft, held),
              guard (wary), afflict (hush, gust, chill, slip)
preview(look, pose, gesture, k, o) -> canvas;  anchors(look, o)
prewarm(look, who, id)  -> the actor's idle and calm key frames only
retain(looks)           -> drops every other look's frames (called on 'present:scene' enter)
budget()                -> { frames, bytes, mib, perActor, cap, capMib, budgetMib: 48, build times, … }
_.measure(look, o)      -> anchors, drawn box, pixel count without a canvas (node tests)
```

`RB.battlerMoves`: `poseAt(look, pose, g, k, t, who, reduce, id, idleKey)`, `idleKey`, `idleTimes`,
`gestureOf(id, g)`, `release(id, g)`, `actHand(id, g)`, `coverage(id)`, `OWN`, `IDLE`, `STANCE`, `TECH_PARTNER`.
`RB.partyChoreo`: `player`, `companion`, `react`, `finish`, `revive`, `planOf`, `wordOf`, `resolvedOf`,
`familyOf`, `coverage()`, tables `FAM`, `TECH`, `SUPPORT`, `WORD_FAMILY`.

## The native frame standard (§6.2): 80 × 104 stays (round 1; measured again in round 2, above)

**Measured** (battle at eight CSS viewports, Chromium, `RB.battleStage.stats().lay`):

| Viewport | CSS px per art px | Party scale `ps` | Figure frame on screen (CSS px tall) |
|---|---|---|---|
| 1440×900, 1280×800, 1366×768 | 2 | 1 | 208 |
| 1920×1080 | 3 | 1 | 312 |
| 390×844, 320×640, 844×390, 768×1024 | 1 | 1 | 104 |

So the frame *is* the on-screen size everywhere: the scene's whole-number scale is 1 at every measured
viewport. The rig is resolution-independent (volumes rasterized at art resolution), so the 96 × 128
working frame was rendered from the same poses for comparison (grid `w96`, 1.368 px per body unit;
`docs/screenshots/battle/party/frame_standard_80x104_vs_96x128.webp`):

| | 80 × 104 (shipped) | 96 × 128 (working frame) |
|---|---|---|
| figure height (ready … pour) | 80–85 px | 95–100 px |
| drawn pixels per frame | 1,979–2,281 | 2,720–3,179 (×1.39) |
| raw bytes per frame | 33,280 | 49,152 (×1.48) |
| build time per frame (node, unwarmed) | ≈43 ms | ≈99 ms |

**Decision: keep 80 × 104 at 1.14 px/unit**, and put the gain into authored content:
1. The 96 × 128 frame is sampled from the same geometry: it shows finer steps of the same shapes, not
   different drawings. The visible gains the addendum asks for — hands that read (fist, point, open palm,
   pinch, cup), held objects, stance and silhouette per person, layered cuffs, hair tucked under hats —
   are authored and read at 80 × 104 (the comparison sheet shows the same hand shapes at both sizes).
2. At `ps = 1` a 128-row frame would enlarge the party 1.23× on every screen and widen the formation by
   16 px per figure, pushing it 16–32 px into the creature's space at 320–390 CSS px widths — in
   `layout()`, which the integrator owns and is rebuilding.
3. Two merged areas are sized against the party's 1.14 px/unit: the fishing stage draws its figures
   through this rig and a test (`tests/e2e/fishing.mjs`) pins its rod hand to the rig's projection; the
   pets set their own battle scale in absolute art px (`BZS` in `src/engine/37_pets_3rig.js`) beside the
   party. A party rescale would silently change the proportions in both.
4. Phone: at 1 CSS px per art px a 104-px frame (figure ≈82 px) on a 300-px action area (the integrator's
   §22.2 target at 390 × 844) is ≈27–35 % of the height; desktop 208 px at 2×.

If the creature frames grow (the moth's 224 × 192 working frame) and the owner wants the party/creature
ratio kept, `RB.battlers.GRIDS` holds both grids: switching is one constant plus a check of `layout()`,
the fishing stage and the pets.

## Actors: stances, idle and movement language (§7.2–§7.4)

Rear three-quarter view facing screen-up-right (body yawed 36°, camera pitched 20°), unchanged; the
companion a step back on the left (`layout()`, unchanged). Feet are planted in every pose (tested: the
lowest drawn row on the anchor row); a foot that moves between two keys is lifted on the way, one foot at
a time; one-sided things keep their side.

| Actor | Stance | Idle keys (ready / calm) | Loop (ms) | Phase offset (ms) | Own gestures |
|---|---|---|---|---|---|
| pc | attentive, balanced; folio at the left hip, right hand half open | 8 / 4 | 7020 | 0 | thread, direct, trace, crystal, book, lens, ward, restore, flow, sweep, plant, open, raise, ring, call |
| nao | compact, forward, low; a hand on their satchel | 8 / 4 | 5630 | 2300 | point, spot, call, reach, lunge, shoulder, help |
| mio | upright, feet closer, hands ready before the apron, turned to you | 7 / 4 | 7180 | 1700 | pour, dab, waft, salts, tonic, help |
| ren | wide and grounded; lamp out at their left; right hand raised, flat | 7 / 4 | 7420 | 3100 | ward (lamp), shade, flare, vigil, lanterns, front, help |
| suzu | weight on the left leg, hand on hip, free foot turned out | 8 / 4 | 5740 | 900 | flourish, heckle, beckon, clap, feint, grand, help |

- **Idle (§7.3):** each key is held (300–1,800 ms; round 2: the hold carries the battle-ready pulse) and reached through two in-betweens, then one
  settling frame where hair and cloth overshoot and come back (they keep the last key's values through the
  in-betweens: delayed secondary motion). Characteristic keys: the player settles the grip on the folio and
  glances at it; Nao's quick looks left and right and a tap on the satchel; Mio's look to you and a touch at
  the bottles on her hip; Ren's look down to the lamp and a precise finger; Suzu's double heel tap and a
  palm-up turn of the hand. The calm variant (reading, writing, choosing) has four quiet keys at 0.6×.
  Reduced motion: the first key, still. Unselected actors never anticipate.
- **Bracing:** while a creature prepares a move aimed at one of you (or at both), that adventurer braces a
  little (`guard:wary`), from the creature's own preparation cue.
- **Language (§7.4):** the player's response leaves their gesture (strip, brush, folio, open hand) and
  they recover through a real recovery pose; Nao points, shades their eyes, lunges, reaches — short and
  decisive; Mio measures, uncorks, pours, dabs, wafts — firm and controlled; Ren raises, thrusts, swings and
  holds up the lamp and traces with their free hand; Suzu flourishes, beckons, claps, feints, flings her arms
  wide, bows. No object was invented: the folio, strip and brush are the player's; the vial is from Mio's
  bottles; the lamp is Ren's; Nao and Suzu use only their hands and bodies.

### Pose coverage per actor (§7.5)

Every row is drawn for every actor in `tests/unit/battle_party.test.mjs` (feet, torso, head, acting hand,
held object and release anchors present; planted; inside the frame).

| §7.5 state | pc | nao | mio | ren | suzu |
|---|---|---|---|---|---|
| quiet ready | calm | calm | calm | calm | calm |
| anticipate | anticipate:thread | anticipate:point | anticipate:pour | anticipate:ward | anticipate:flourish |
| express / direct | act:thread k0.2 | act:point k0.2 | act:pour k0.2 | act:ward k0.2 | act:flourish k0.2 |
| release / commit | act:thread k1 | act:point k1 | act:pour k1 | act:ward k1 | act:flourish k1 |
| protect / brace | guard (wary while a blow is prepared) | guard | guard | guard | guard |
| receive healing | soothed | soothed | soothed | soothed | soothed |
| receive direct hit | hit | hit | hit | hit | hit |
| blocked / softened hit | brace / hit:soft | brace / hit:soft | brace / hit:soft | brace / hit:soft | brace / hit:soft |
| receive a condition | afflict:hush, :gust (wards torn), :chill, :slip (a −1) | same | same | same | same |
| recover | recover:<gesture> | recover | recover | recover | recover |
| incapacitated / revive | down / recover:rise | down / act:help | down / act:help | down / act:help | down / act:help |
| coordinated technique | act:thread (Nao, Suzu), restore (Mio), ward (Ren) | act:point | act:pour | act:ward (the lamp) | act:flourish |
| settle / victory | cheer: folio lowered, an exhale | a nod, a small fist | hands together, head bowed to you | lamp lowered, a bow | a performer's bow, arm out |
| idle | 8 keys | 8 keys | 7 keys | 7 keys | 8 keys |

Every gesture starts from and returns exactly to the stance, every reaction except `down` and `cheer`
ends exactly in it (unit-tested on the pose numbers; `tests/e2e/characters.mjs` checks the frames).

## Responses, support actions and techniques: every ID

### Player responses (§8.3)

| Response | Japanese | Family | Your gesture | Word motif | Arrival on the actual target(s) | Normal: contact / end (ms) |
|---|---|---|---|---|---|---|
| `w:mamoru` protect | 守（まも）る | protect | ward | seal | pSealClose round the protected one; sealForm; the ward tags at the beat (a seal raised against a Strike waits for it) | 620 / 1500 |
| `w:hikari` light | 光（ひかり） | light | raise | radiance | flashReveal from the raised hand; pShroudClear + mistPart only when the rules cleared a Shroud | 700 / 1500 |
| `w:iyasu` heal, soothe | 癒（いや）す | heal | restore | gather | pGather at the hand; pHealTo to each recipient the rules list (none at full resolve); soothed poses; +n from the applied change | 760 / 1540 |
| `w:mizu` water | 水（みず） | water | flow | flow | splashArc onto each creature reached; steam only where Heat was cooled | 760 / 1500 |
| `w:koori` ice | 氷（こおり） | ice | crystal | crystal | pFrost crystals on the target; cooling vapour only where Heat was cooled | 640 / 1400 |
| `w:kaze` wind | 風（かぜ） | wind | sweep | drift | pWind trails past each creature reached; pShroudClear (swept) when it cleared a Shroud | 760 / 1540 |
| `w:nawa` rope | 縄（なわ） | bind | trace | wrap | ropeBind thrown and cinched; scatter when a Gathering was really broken | 840 / 1560 |
| `w:ishi` stone | 石（いし） | stone | plant | settle | pGround circles and settling stones at both of your feet | 760 / 1560 |
| `w:tsuchi` earth, soil | 土（つち） | stone | plant | settle | pGround circles and settling stones at both of your feet | 760 / 1560 |
| `w:honoo` flame | 炎（ほのお） | fire | open | ember | pEmber warmth round you both (no fireball); warm at the beat; Shroud cleared when it was | 700 / 1500 |
| `w:suzu` bell (small) | 鈴（すず） | bell | ring | pulse | ringsPulse from the raised hand over the party; the Hush mark goes at the beat | 700 / 1460 |
| `w:koe` voice | 声（こえ） | voice | call | voice | ringsVoice arcs from you over the party; the Hush mark goes at the beat | 700 / 1460 |
| `unravel` | ほどく (or the restored word) | unravel | thread | thread | pThread from the strip's release to the top knot; knotRelease of that knot at the beat | 760 / 1540 |
| `answer` (plea) | こたえる (or the answer) | answer | book | note | pNote folded and carried to it; it releases a knot (settle) at the beat | 840 / 1560 |
| `truth` (lie, mirror) | みぬく (or what was seen through) | truth | lens | split | lens on it; pSplit — the false layer parts — at the reveal | 760 / 1500 |

Families are keyed by word id, never by a translated label (`RB.partyChoreo.WORD_FAMILY`); a word added
later falls back to its tags and is reported `mapped: false` (the unit test fails on one). Each family's
word moves in its own way (15 motifs; the unit test asserts no two families share one).

### Coordinated techniques (§8.5): two real participants, complementary phases, one culmination

| Technique | Partner (starts) | You (start) | Motif | Culmination | Normal end |
|---|---|---|---|---|---|
| `tech:nao` Read the Opening | point (0 ms) | thread (260 ms) | join | Nao points out where it will move; you send the thread exactly there: two knots (980 ms) | 1820 |
| `tech:mio` Clearwater Draught | pour (220 ms) | restore (0 ms) | join | You write; Mio pours the draught into the ink as it is released: both restored, lingering effects washed off (980 ms) | 1820 |
| `tech:ren` Lantern Ward | ward — the lamp (0 ms) | ward (200 ms) | join | Ren raises the lamp; your seal forms in its light before you both (920 ms) | 1800 |
| `tech:suzu` Curtain Call | flourish (0 ms) | thread (300 ms) | join | Suzu turns its move back on it with a flourish; your thread lands in the opening she makes (1000 ms) | 1840 |

One word (with both ribbons), one braided thread (`pJoin`) from both release points, each result once.

### Companion support actions (§8.5): all 20

| Support action | Companion | Effect kind | Gesture | Carried by | To | Normal: contact / end (ms) | What it looks like |
|---|---|---|---|---|---|---|---|
| `nao_opening` Spot the opening | nao | opening | spot | spot | foe | 620 / 1240 | A hand shading their eyes, a sweep of the look, a finger to the place — the opening marked on it only when there is one. |
| `nao_warn` Call out its aim | nao | soften | call | voice | foe | 560 / 1160 | A shout with a cupped hand: the call carries to it, its blow marked softer. |
| `nao_hand` Lend a hand | nao | knot | reach | thread | foe | 700 / 1300 | A step in, a low reach, the fingers closing on the knot and pulling — a thread to the very knot when it gives. |
| `nao_route` Seize the opening | nao | stun | lunge | headoff | foe | 520 / 1180 | A crouch and a lunge on the opening: its move is crossed out before it starts. |
| `nao_mark` Take half | nao | share | shoulder | share | allies | 560 / 1180 | A step to your side, braced, a hand out to you: a cord binds the two of you for the round. |
| `mio_draught` Warm draught | mio | heal | pour | pour | allies | 760 / 1380 | The vial from her hip, uncorked, poured: drops reach only those it restores, with their real amounts. |
| `mio_salve` Salve | mio | heal | dab | pour | lower | 680 / 1300 | Two careful dabs toward the one with less resolve. |
| `mio_vapour` Clearing vapour | mio | clear | waft | vapour | foe | 680 / 1320 | The open vial held up, the vapour fanned on: it washes off only what is actually there. |
| `mio_salts` Smelling salts | mio | salts | salts | salts | allies | 540 / 1160 | The salts out before you ask, held to you both: a sharp sparkle, no recovery number. |
| `mio_tonic` Right beside you | mio | heal | tonic | pour | allies | 760 / 1400 | A step to your side, the tonic held out, a hand to your shoulder. |
| `ren_shade` Lamp ward | ren | ward | shade | lamp | aimed | 600 / 1220 | The lamp lifted toward the one it aims at; the ward forms in its light. |
| `ren_flare` Flare the lamp | ren | clear | flare | lamp | foe | 580 / 1240 | Drawn back low, thrust up at it: the lamp flares and burns off what it holds. |
| `ren_vigil` Keep watch | ren | ward | vigil | lamp | allies | 680 / 1300 | The lamp held high at their side over you both; a ward before each. |
| `ren_lanterns` Raise the lamps | ren | clear | lanterns | lamp | foes | 760 / 1420 | The lamp raised and swung across over every one of them. |
| `ren_chime` Stand in front | ren | ward | front | lamp | pc | 660 / 1300 | A step in front of you, the lamp held out, their free arm across you. |
| `suzu_heckle` Heckle | suzu | heckle | heckle | voice | foe | 540 / 1160 | A hand at her mouth, the other on her hip: the heckle carries to it. |
| `suzu_eye` Draw its eye | suzu | draw | beckon | attention | foe | 600 / 1240 | A step into the light, a wave: its attention turns to her (a line from it to her). |
| `suzu_encore` Encore | suzu | harmony | clap | clap | none | 520 / 1140 | A clap, then the hands flung open — and the thread between you brightens if Harmony rises. |
| `suzu_feint` On her own cue | suzu | stun | feint | headoff | foe | 560 / 1200 | A dip, a quick step and a mock lunge: it lunges at nothing. |
| `suzu_finale` Grand gesture | suzu | drawAll | grand | attention | foes | 740 / 1480 | Gathered low, then both arms flung wide and held: every eye turns to her. |

18 different gestures for the 20 actions (Nao's and Suzu's two "its move comes to nothing" actions share
the head-off mark but not the gesture). A support that finds nothing to do (no opening this time, the knot
holds, not in step) shows its gesture and a small grey puff — never its success mark. The companion's own
moves inside an exchange (fx `comp`): Suzu turning a blow aside (her flourish, the blow meets air), Nao
taking half (they brace at your shoulder, a cord), Mio's vial at the end of an Atlas exchange (motes), Nao's
second thread (their point); the existing revive: the companion's `help` (crouch, reach, haul up) and your
`recover:rise`.

### Reactions to what the rules did (party side, §10)

| Result | Party presentation |
|---|---|
| `hit` | directional recoil (knocked back at the waist, a foot catches the weight), impact, −n; `soft` when a ward took part of it; `held` (Mio's salts: the knees go, then catch); chill: then a shiver |
| `block` | the seal takes it: sealBlock, `brace`, the absorbed n with a seal mark (never read as damage) |
| `heal` | motes and `soothed` on the recipients the rules list (`who`), +n from the applied change (`d`); nobody at zero gain |
| `ward` | sealForm round the protected one at the beat (a seal raised to catch a blow waits for it) |
| `silence` | `afflict:hush` on each of you standing (the Hush mark stays over the party) |
| `stripWard` | `afflict:gust` on both, the tags torn away |
| `cost` | an ink drop, `afflict:slip`, −1, before the response |
| `light` / `water` / `bind` | the Shroud's own mist disperses / steam / the gathered force scatters, on that creature only |
| `stun`, `soften`, `draw` | the creature balks / recoils; its eye-line to Suzu is her own cue |

## Truthfulness (§8.4, §10.3, RBN-04)

- Results are the rules' fx events, one `beat` each, in the rules' order; nothing here applies or rerolls.
- Heal: `pHealTo`/`motes`/`soothed` only for `heal.who`; numbers from the displayed change; at full resolve
  the gathered motes settle back and no one is reached (browser- and unit-tested).
- Light: `pShroudClear` (the same puffs as the Shroud mark, pushed off) only when the rules' `light`
  result exists; no impact.
- Unravel: the thread goes to the top knot (`knot:<knots−1>`), which is the one `knotRelease` frees.
- A softened hit is a smaller reaction; a block is a brace; a wary brace is not a ward.
- A failed support shows no success mark; a downed actor does not cheer or act.
- The word: never the attempt — a word card's own word, or what the answered task accepted
  (`RB.partyChoreo.resolvedOf`: the lexicon word with its reading, the kana it restored, the accepted
  choice); the recap keeps the action's own word and the restored one.
- Cosmetic variation is fixed by index (no `Math.random` in the party files — unit-tested).

## Resources (§21.4–21.5)

- Cache keys: look, actor, pose, gesture or variant, progress (12 steps; ½ steps with reduced motion),
  the idle key frame, facing, grid — never elapsed time (unit- and browser-tested).
- Idle: at most 4 frames per key (2 in-betweens, settling, hold): ≤ 32 frames per actor for `ready`
  (the old continuous idle needed 104–120 frames per loop pair). *Round 2: the pulse adds a dip and a breath per
  held key: ≤ 6 per key, ≤ 48 frames per actor for `ready` (measured 34–47 distinct drawings).*
- Prewarm: only the encounter's actors (the player and the committed companion), idle and calm keys.
- Retain: on `present:scene` enter, every other look's frames are released.
- Estimated resident party frames (80 × 104 × 4 = 33,280 bytes each), measured after real encounters in
  Chromium: see the results below; the hard cap is 720 frames = 22.85 MiB, under the 48 MiB budget even
  full. These are pixel estimates, not measured process memory (no trustworthy memory API in headless
  Chromium was used).

## Tests, commands and results

Run on this branch's HEAD source (`index.html` rebuilt with `node tools/build.mjs`), Chromium headless with a
software canvas, browser suites **one at a time** (shared 4-core machine, load average 5–25 during the
runs). Dates: 2026-10-02.

**Unit tests (node):**

| Command | Result |
|---|---|
| `node tests/run-unit.mjs` | **8067 passed, 0 failed** (45 files; exit 0). The base 982c8df had 7,999; the difference is the 68 below. |
| `node tests/run-unit.mjs battle_party` | 68 passed, 0 failed: pose and anchor coverage for all five actors (feet, torso, head, acting hand, held object, release), planted feet, return to stance, idle bounds and keys, every mapping (12 words, 13 response families, 20 support actions, 4 techniques), Protect / Heal / Light / Unravel truthfulness, beats in the rules' order, reduced motion, no `Math.random`, the 28 effects registered |
| `node tests/run-unit.mjs battle` | 635 passed, 0 failed (every battle unit file) |

**Browser tests (Playwright, the built `index.html`):**

| Command | Result |
|---|---|
| `node tests/e2e/battle_party.mjs --docs` | **14 passed, 0 failed** (no page errors in any): solo; four LABELLED DIAGNOSTIC FIXTURES (Mio, Nao, Ren, Suzu: every support action picked and performed with its own gesture and effect, then the technique); Protect timing; Heal truthfulness; every family; the customization registry; frame sheets; resources; the Mio exchange frame by frame; the Satchel preview; the recording |
| `node tests/e2e/battle_anim.mjs` | 16 passed, 0 failed (on a re-run; see below) |
| `node tests/e2e/characters.mjs` | 23 passed, 0 failed |
| `node tests/e2e/battle_group.mjs` | 6 passed, 0 failed |
| `node tests/e2e/combat_ui.mjs` | 7 passed, 0 failed |
| `node tests/e2e/learning_ui.mjs` | 15 passed, 0 failed |
| `node tests/e2e/companion_turn.mjs` | 4 passed, 0 failed |
| `node tests/e2e/pets.mjs` | 20 passed, 0 failed |
| `node tests/e2e/equipment.mjs` | all ok |
| `node tests/e2e/fishing.mjs "every companion"` | 1 passed, 0 failed (the fishing stage draws its figures through this rig) |

*battle_anim:* the first full run (load average ≈19) failed one test, "rapid input" (`{"menu":0,
"phase":"player","calls":1}` 120 ms after the Continue presses). It then passed 4 of 4 times on this
build, and 3 of 3 times on the base 982c8df build, alternated (`ab_rapid.sh`, scratch). A full re-run
passed 16 of 16. The test clicks at the Continue button's position while the companion menu opens there;
nothing in this branch touches input or the turn order. It is recorded as timing under load, not as
fixed.

**Measured figures (from `tests/e2e/out/battle_party/report.json`, the final `--docs` run):**

- **Protect at Normal** (presentation clock, the solo battle; sampled every frame). The word is fully
  readable — full ink, opacity > 0.97, seal fold < 0.2 — from 550 to 1,217 ms, so for **667 ms**. An
  earlier run of the same test measured 700 ms. The ward forms at 633 ms. The last presentation frame is at
  1,467 ms (wall 1,491 ms). Poses: `anticipate:ward → act:ward → recover:ward → ready`.
- **Heal:** with one of two hurt, motes and +n reach that one only. At full resolve, nothing reaches
  anyone and no number appears (asserted).
- **Customization registry:** 250 pairwise looks × 5 poses = 1,250 frames. Every value of every factor
  is seen (hair 12, cut 4, skin 7, hair colour 10, outfit 8, accessory slots 9 + 9, keepsakes 16), and
  every pair of values too. 0 frames fail the drawn / planted / unclipped checks. The look sheet adds 10
  deliberate looks.
- **Resources:**
  - Six encounters with changing looks and companions (Mio, Nao, Ren, Suzu, solo, Mio). After each,
    only that encounter's actors are resident:
    - 111 frames / 3.52 MiB (Mio)
    - 60 / 1.90 (Nao)
    - 70 / 2.22 (Ren)
    - 75 / 2.38 (Suzu)
    - 42 / 1.33 (solo)
    - 72 / 2.29 (Mio)
  - No cache key holds elapsed time. Mean build time per frame was 13–17 ms; the worst single frame was
    239 ms under load.
  - The diagnostic fixtures, which perform every action of a companion in one battle, reach
    271–321 frames (8.6–10.2 MiB).
  - The hard cap is 720 frames = 22.85 MiB, against the 48 MiB budget. These are estimated resident
    pixels (frames × 33,280 bytes), not measured process memory.
- **Frame standard:** drawn pixels for the same five poses are 1,979–2,281 at 80 × 104 and 2,720–3,179
  at 96 × 128.
- **Recording:** `mio_exchange_normal.webm` is 2,618,200 bytes. The player's response took 1,866 ms of
  wall time and Mio's warm draught 1,979 ms, at Normal.

## Evidence (`docs/screenshots/battle/party/`)

All generated by `node tests/e2e/battle_party.mjs --docs` from the built `index.html` (Chromium, headless,
software canvas); scratch PNG originals and `report.json` are in `tests/e2e/out/battle_party/` (ignored).

| File | What it shows |
|---|---|
| `frames_pc_native_3x.webp` | The player (drawn in the auburn / glasses / flower / green test look): the eight idle keys; the reactions (calm, wary and full guard, hit, soft hit, brace, soothed, hush and gust afflictions, down, cheer); every own gesture from anticipation through release to recovery — at 1× beside 3×. |
| `frames_mio_native_3x.webp`, `frames_nao_native_3x.webp`, `frames_ren_native_3x.webp`, `frames_suzu_native_3x.webp` | The same rows for each companion in their own look (Mio's gestures with the vial, Ren's with the lamp, Nao's and Suzu's empty-handed; `help` included), at 1× and 3×. |
| `player_looks_native_3x.webp` | Ten deliberate player looks (skins, hairstyles, outfits, accessories and five keepsakes) × eight poses at 1× and 3×; the auburn / glasses / flower / green look is one labelled test row, not a default. |
| `frame_standard_80x104_vs_96x128.webp` | The same five poses on the 80 × 104 standard and the 96 × 128 working frame, at 3× (the measured decision above). |
| `families_gallery.webp` | Every response family in a real battle at 1280 × 800, captured at full ink: its gesture, word motif and arrival on the real target. |
| `mio_exchange_frames.webp` | One Mio exchange frame by frame: your Protect, her warm draught reaching the one it restores, the Strike caught by the seal. |
| `mio_exchange_normal.webm` | Playwright's real-time `recordVideo` of one Mio exchange at Normal (your response, then her support action; 2,618,200 bytes). Not machine-reviewed: headless Chromium here does not decode video. |
| `satchel_in_battle_preview.webp` | The Satchel's "In battle" preview beside the battle frame of the same worn look (§7.1). |

## Art review against §22.4 — self-review

**Self-review by the implementing agent (no human review).** Reviewed at native size (1×), at 3× and in
the battle scene at 1280 × 800, from the frame sheets and frame-by-frame captures listed above. Scores:
0 missing/broken, 1 inconsistent, 2 coherent, 3 notably polished.

| Dimension | Score | Notes |
|---|---|---|
| Silhouette and identity | 2 | Five different stances; each companion recognisable by stance, hair and object; ten deliberate player looks and 250 pairwise looks read. Seen from behind, a big head hides gestures made close to the face (the call, the bell and the lens read alike at 1×). |
| Form and materials | 2 | Grouped five-step ramps per material (hair locks and sheen, cloth folds and seams, green glass, lamp glass, leather); no dither. The cheek in rear view is still a flat skin plane. |
| Weight and anchors | 2 | Feet planted in every pose (tested); steps lift one foot; recoil carries the weight back; anchors stable. Rising from the knee slides the kneeling foot. |
| Action identity | 2 | Every family and every support action has its own gesture and effect; Mio's vial and Ren's lamp do the work. Some gestures read only with their effect at 1× on a phone. |
| Secondary motion | 2 | Hair and cloth arrive a beat late in the idle and swing in gestures; ribbons, scarf tails and sash follow. Less than the reference's scarf and ribbons. |
| Outcome truthfulness | 3 | Recipients, amounts, zero gain, real Shroud, specific knot, softened vs blocked vs direct, failed supports: all distinct and test-backed. |
| Language visibility | 2 | The resolved word with its reading, fully readable ≈700 ms (Protect at Normal measured 667 ms and 700 ms in two runs), in its motif's look; reduced motion holds it still. The tilted motifs (drift, crystal) lean the text a few degrees. |
| Scene integration | 2 | One pixel grid; effects on live anchors; the strip stays inside the stage. Depends on the integrator's new layout for room on phones. |

Unreviewed: every frame at every phone viewport; Fast playback; the full roster of NPC looks in battle
style; the recording's frames (headless Chromium here does not decode video, so the WebM was not
machine-reviewed — it is Playwright's recording of a passing run).

## Limitations

- No human review; no readability pilot (§22.5). The rubric above is a self-review.
- Chromium only (headless, software canvas); no real phones, no Firefox/Safari.
- The 80 × 104 standard is a measured choice, not the 96 × 128 working frame (see above).
- The resolved word for Unravel/technique/answer/truth needs `src/ui/80_combat.js` to pass the answered
  task (done here in three lines; the integrator may move it into the semantic action record).
- Fast and Instant playback are the integrator's (`speed()`); the timings here are Normal presentation ms.
  At Fast the word's full visibility scales with the integrator's factor.
- The fishing stage keeps its own figure poses on the shared rig (unchanged behaviour); its companions use
  the plain companion stance there.
- Diagnostic fixtures (each companion in a Chapter 1 room with every support action unlocked by flags and
  quests set in the test) are labelled as such; they are not proof of reaching those states in play.

## Merge notes (every shared file touched)

- `src/ui/82_battle_seq.js` — only the party functions: `choreo.player`, `choreo.companion`,
  `choreo.finish`, `choreo.revive` now delegate to `RB.partyChoreo`; `planOf` export delegates;
  `travelCue`, `wordOf`, `TECH_GESTURE` removed (moved); `reactions()` asks `RB.partyChoreo.react` first and
  keeps only the creature-side cases (heat, shroud, charge, mend, countered); `H` (helpers object) added
  after `stillNums`. `run`, `settle`, `hurry`, `speed`, `T`, deliveries, `choreo.enemy` and `settleFoe`
  untouched.
- `src/ui/83_battle_stage.js` — not `layout()`: in `draw()`'s party loop the actor id is passed to the rig,
  `guard:wary` while a creature prepares a move aimed at that actor (`waryOf`, new helper), gesture labels
  only for gesture poses (`info.variants` for reaction variants); `strip()` sets `data-motif`/`data-family`;
  `placeStrip()` asks `RB.partyWord.place` for a motif's position, transform and custom properties (the
  clamp to the stage is kept).
- `src/ui/80_combat.js` — `playPlayer(…, step)` and its one call pass the answered task; `seqCtx` gets
  `resolved: RB.partyChoreo.resolvedOf(card, step)`. Three lines.
- `tests/e2e/characters.mjs` — the POSES/GESTURES assertion checks the agreed lists are included (the
  lists grew); everything else in it passes unchanged.
- New files only this branch adds: `src/engine/34m_battler_moves.js`, `src/ui/84p_party_choreo.js`,
  `src/ui/84p_party_word.js`, `src/ui/84p_party_fx.js`, `src/styles/61_battle_party.css`,
  `tests/unit/battle_party.test.mjs`, `tests/e2e/battle_party.mjs`, this file and
  `docs/screenshots/battle/party/`. `src/engine/34_battlers.js` is the party area's own file.
- Integrator's later changes (not on this branch's base 982c8df, told to this worker by the coordinator):
  the battle banner (`src/ui/82b_battle_banner.js`) and the word strip `.cb-strip` were made inert, and
  `src/ui/82c_battle_intents.js` adds intent badges. The party work only adds `data-motif`/`data-family`,
  a transform, an opacity and custom properties to the strip element (`placeStrip()`), and
  `61_battle_party.css` styles `.cb-strip[data-motif=…]`; after merging, check that the inert rule does not
  override `transform`/`opacity` and that the badges do not sit over the party's effect anchors.
- `index.html` is generated and not committed on this branch: rebuild after merging.
- No change to `src/ui/84_battle_fx.js`, `78_enemy_art.js`, the backdrops, the pets, the rules, the
  settings or `src/styles/60_learning.css`.
