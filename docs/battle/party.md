# Party art in battle — the player, Nao, Mio, Ren and Suzu

**Area:** party worker (docs/BATTLE_ART_CONTRACTS.md). **Brief:** battle addendum §5–§8, §10 (party side),
§17, §18.3, §21.4–21.5, §22.4, §23.5 (party). **Base:** 982c8df. Everything here is presentation: no
damage, target, knot, learning, Harmony, Bond, reward or party-size rule was changed.

## What was built

- **The rig, upgraded** (`src/engine/34_battlers.js`): articulated hands (palm, fingers, thumb; eight
  shapes: fist, relaxed, open, flat, point, pinch, cup, spread), drawn a size up like the head so a gesture
  reads from the hand; held objects that exist in each person's vocabulary (the player's folio, strip and
  brush; Mio's vial, taken from the bottles at her hip — the hip bottle is gone while it is in her hand —
  uncorked and tipped to pour; Ren's lamp, raised, thrust or swung when a gesture frees his left hand, its
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

## The native frame standard (§6.2): 80 × 104 stays

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
| nao | compact, forward, low; a hand on his satchel | 8 / 4 | 5630 | 2300 | point, spot, call, reach, lunge, shoulder, help |
| mio | upright, feet closer, hands ready before the apron, turned to you | 7 / 4 | 7180 | 1700 | pour, dab, waft, salts, tonic, help |
| ren | wide and grounded; lamp out at his left; right hand raised, flat | 7 / 4 | 7420 | 3100 | ward (lamp), shade, flare, vigil, lanterns, front, help |
| suzu | weight on the left leg, hand on hip, free foot turned out | 8 / 4 | 5740 | 900 | flourish, heckle, beckon, clap, feint, grand, help |

- **Idle (§7.3):** each key is held (300–1,800 ms) and reached through two in-betweens, then one
  settling frame where hair and cloth overshoot and come back (they keep the last key's values through the
  in-betweens: delayed secondary motion). Characteristic keys: the player settles the grip on the folio and
  glances at it; Nao's quick looks left and right and a tap on the satchel; Mio's look to you and a touch at
  the bottles on her hip; Ren's look down to the lamp and a precise finger; Suzu's double heel tap and a
  palm-up turn of the hand. The calm variant (reading, writing, choosing) has four quiet keys at 0.6×.
  Reduced motion: the first key, still. Unselected actors never anticipate.
- **Bracing:** while a creature prepares a move aimed at one of you (or at both), that adventurer braces a
  little (`guard:wary`), from the creature's own preparation cue.
- **Language (§7.4):** the player's response leaves their gesture (strip, brush, folio, open hand) and
  they recover through a real recovery pose; Nao points, shades his eyes, lunges, reaches — short and
  decisive; Mio measures, uncorks, pours, dabs, wafts — firm and controlled; Ren raises, thrusts, swings and
  holds up the lamp and traces with his free hand; Suzu flourishes, beckons, claps, feints, flings her arms
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
| `nao_opening` Spot the opening | nao | opening | spot | spot | foe | 620 / 1240 | A hand shading his eyes, a sweep of the look, a finger to the place — the opening marked on it only when there is one. |
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
| `ren_vigil` Keep watch | ren | ward | vigil | lamp | allies | 680 / 1300 | The lamp held high at his side over you both; a ward before each. |
| `ren_lanterns` Raise the lamps | ren | clear | lanterns | lamp | foes | 760 / 1420 | The lamp raised and swung across over every one of them. |
| `ren_chime` Stand in front | ren | ward | front | lamp | pc | 660 / 1300 | A step in front of you, the lamp held out, his free arm across you. |
| `suzu_heckle` Heckle | suzu | heckle | heckle | voice | foe | 540 / 1160 | A hand at her mouth, the other on her hip: the heckle carries to it. |
| `suzu_eye` Draw its eye | suzu | draw | beckon | attention | foe | 600 / 1240 | A step into the light, a wave: its attention turns to her (a line from it to her). |
| `suzu_encore` Encore | suzu | harmony | clap | clap | none | 520 / 1140 | A clap, then the hands flung open — and the thread between you brightens if Harmony rises. |
| `suzu_feint` On her own cue | suzu | stun | feint | headoff | foe | 560 / 1200 | A dip, a quick step and a mock lunge: it lunges at nothing. |
| `suzu_finale` Grand gesture | suzu | drawAll | grand | attention | foes | 740 / 1480 | Gathered low, then both arms flung wide and held: every eye turns to her. |

18 different gestures for the 20 actions (Nao's and Suzu's two "its move comes to nothing" actions share
the head-off mark but not the gesture). A support that finds nothing to do (no opening this time, the knot
holds, not in step) shows its gesture and a small grey puff — never its success mark. The companion's own
moves inside an exchange (fx `comp`): Suzu turning a blow aside (her flourish, the blow meets air), Nao
taking half (he braces at your shoulder, a cord), Mio's vial at the end of an Atlas exchange (motes), Nao's
second thread (his point); the existing revive: the companion's `help` (crouch, reach, haul up) and your
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
  (the old continuous idle needed 104–120 frames per loop pair).
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
