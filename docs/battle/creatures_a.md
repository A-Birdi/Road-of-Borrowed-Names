# Creatures A — Chapter 1–3 creature families and the Flour Moth proof

**Area:** creature worker A (battle addendum §5, §6, §9, §10 creature side, §18.2, §18.4,
§18.5 creature parts, §21.4–21.5, §22.4, §23.5). Contracts: `docs/BATTLE_ART_CONTRACTS.md`.
Coverage list: `docs/battle/INVENTORY.md`.
**Branch:** `worktree-agent-a76a624d269835ac8`, from base `982c8df`.
**Families:** wisp, moth, blot, echo, crab, crane, golem, sg_letter, clerk, warden — all 36
enemy ids that use them, including the Atlas variants and the four bosses that use them (The Mill
Echo, The Tide Clerk, The Kiln Warden, The Half-road Gatekeeper).

Status: every family upgraded and validated by unit tests and in real battles; evidence below.
The §22.4 rubric scores in this file are the implementing agent's **self-review**, not a human
review.

## Files and APIs

| File | What it holds |
|---|---|
| `src/ui/78a_creatures_a.js` | `RB.creaturesA`: the rig and choreography framework (below); the audit register; fast polygon, stone and outline helpers |
| `src/ui/78b_moth.js` | the moth (the Flour Moth proof) |
| `src/ui/78c_wisp_echo.js` | the wisp and the echo |
| `src/ui/78d_blot_crab_golem.js` | the blot, the crab and the golem |
| `src/ui/78e_paper.js` | the crane, the letter (`sg_letter`, moved here from `src/content/ch2/01_art.js`) and the clerk |
| `src/ui/78f_warden.js` | the Kiln Warden |
| `src/ui/84a_creatures_a_fx.js` | delivery registration, creature effects, the Shroud veil lifecycle, the per-enemy audit, idle-time prewarm |
| `tests/unit/creatures_a.test.mjs` | every delivery × move × variant; poses; audit; budget |
| `tests/unit/creatures_a_timing.mjs` | generates the timing tables below from the deliveries (`--md`) |
| `tests/e2e/creatures_a.mjs`, `creatures_a_lib.mjs` | real battles (browser) |
| `tests/e2e/creatures_a_sheets.mjs` | native frame sheets (1×, 3×), `--roster` (every enemy), `--variants` |
| `tests/e2e/creatures_a_video.mjs` | the real-time Normal recording of the moth proof and its timing trace |

### The framework (`RB.creaturesA`, 78a)

- **Frame sets by move.** On top of the authored-pose seam, a foe cue's `family` chooses a frame
  set: act `exec` + family `strike` draws `spec.poses['exec.strike']` (else the plain act).
  `strike@3` holds frame 3 for the whole cue (a held key pose). `spec.alias` maps one set onto
  another's frames. The stage still sees the plain act (`prep`, `exec`, `cast`, `recover` …),
  so everything that reads the action keeps working. Implemented as a wrapper of
  `RB.enemyArt.drawPosed` that applies **only to definitions built with this rig** (`spec._qa`).
- **Reduced motion.** Nothing steps through frames and nothing travels. A creature's own delivery
  asks for held key poses (`@k`: aim, contact, recovery); the settled look shows at once; every
  other cue (shared reactions, an interrupted move, Rest) keeps the still idle drawing — the
  seam's documented policy, and what `battle_anim`'s stillness checks expect.
- **Rig.** `A.family(id, { spec, base, idle, poseTable, rig, recoil, alias, veil })`: one
  parametric `rig(L, q, o, H)` draws every frame from a pose `q`; idle drawings and authored
  action frames are tables of `q` over a neutral pose. Each family gets its own motion style
  `a_<id>` (zero prep/exec/cast/recover offsets — the authored frames and the cue's `travel`
  carry the movement, so body and shadow agree; recoil keeps a small directional push).
- **Deliveries.** `A.deliver(art, kinds, fn)` queues; 84a registers them with
  `RB.battleSeq.addDelivery` (78x loads before the sequencer). `A.kit(a)` builds cues
  (`F` foe cue with optional `travel`, `X` effect on its own creature, `S` sound) and returns
  `{ cues, contact, end }`; with reduced motion `F` drops travel. `A.outcome(a)` reads the rules'
  `fx` (read-only) to pick the contact variant: `hit`, `ward` (countered by a raised seal),
  `block`, `soft` (block then hit), `miss` (a companion's flourish), `none`.
- **Audit.** `A.auditFamily(id, rec)`, `A.auditEnemy(id, art, disposition, note)`;
  `A.audit` is read by the unit test and the roster sheet.
- **Performance helpers.** `A.poly(pts)` (precompiled point-in-polygon), `A.stone(L, pts, M, o)`
  (pxkit's dressed-stone shading on it) and `A.outline(L)` (pxkit's selective outline limited to
  the drawn bounding box) give the same pixels several times faster: the moth's frame generation
  went from ≈37 ms to ≈9 ms, the golem's from ≈27 ms to ≈7 ms (isolated profile, below).

### Effects (84a; new names unless noted)

`wingWake`, `scaleShed` (moth swoop and contact), `ashDrift` (Ash Moth gust), `frostDust`
(moth / wisp chill), `wispTrail`, `shardVolley`, `echoRings`, `inkLash`, `inkWave`, `clawSnap`,
`tideWash` (water, ink-wash or paper-strewn), `stoneDust`, `iceShard`, `paperCut`,
`paperFlurry`, `stampSeal`, `kilnBolt`, `kilnBreath`, `kilnStoke`, `veilRelease`.
Blows that a ward meets land on the seal in front of the target (`seal: true`), not the chest.

### The Shroud veil (owned by this area, for every creature that shrouds)

A definition may give `veil(o)` → `{ kind: 'flour' | 'fog' | 'pulp' | 'scrap', cols }`; others
keep the plain mist colours. **Application:** the creature's own action, then `veilRelease` (the
material leaves it) and `mistRoll` (it settles over the knots). **Persistence:**
`RB.battleFx.status.shroud` — a quiet veil over the knots and lower body in that material, slow
drift, never over the face, target marks or writing. **Clearing:** `mistPart` (cued by the
rules' `light` result) disperses the same material. `status.shroud`, `mistRoll` and `mistPart`
keep their names and signatures; the creature is found from the mark's live anchor. Moth: flour
in its own colour; wisp: fog in its light; crane: damp pulp; clerk: fog with paper scraps.

## Native frames (§6.2) — the standard per family

The §6.2 comparison for the proof: the reviewed moth was **188 × 160**; the working frame
**224 × 192** was adopted. The idle wingspan grew only from 165 to 179 art px (a hooked forewing
apex); the extra canvas holds what the actions add beyond the idle silhouette — wings thrown up to
brake, legs reaching out, powder shaken from the margins — and visible new detail (costal
highlight, veins from the discal cell, ante/postmedial lines, pale subterminal marks, eye-spots,
scalloped hind wings, feathered antennae, jointed legs, banded abdomen). Other families were sized
the same way: by what their poses need, not a blanket enlargement. Idle extents (what the layout
reads) are unchanged except where noted.

| Family | Was | Now (w × h, origin, feet) | Idle | Why the canvas |
|---|---|---|---|---|
| moth | 188 × 160 | 224 × 192, (112, 100) | 10 drawings, 20-entry loop × 105 ms (+ float bob) | raised wings, reaching legs, powder; extent 179 × 128 (was 165 × 125) |
| wisp | 132 × 180 | 176 × 200, (88, 70) | 8 × 140 ms | the tail streams sideways in a dart; the heat crown |
| echo | 184 × 184 | 208 × 208, (104, 104) | 8 × 125 ms | shards gathered to one side and flung |
| blot | 168 × 136 | 220 × 152, (128, 62), +30 | 8 × 160 ms | the tendril and the surge on the party's side |
| crab | 196 × 140 | 228 × 156, (124, 66), +26 | 6 × 170 ms | the near claw thrust |
| crane | 188 × 168 | 236 × 196, (128, 104) | 8 × 130 ms | the neck's dart, raised wings (now faces the party) |
| golem | 164 × 180 | 256 × 216, (136, 112) | 6 × 230 ms (a held, heavy creature: few drawings) | arms overhead and reaching forward |
| sg_letter | 152 × 176 | 196 × 200, (100, 76) | 6 × 150 ms | strips lashing; the note sliding out; the flap opening on settle |
| clerk | 168 × 188 | 224 × 212, (116, 102), +14 | 6 × 150 ms | stamp raised high, sheets spreading (now faces the party) |
| warden | 172 × 196 | 220 × 262, (110, 150), +12 | 8 × 140 ms | the chimney smoke the old frame cut off (extent 121 × 206, was 121 × 186), flames licking out |

Frame sheets (every idle drawing and every authored action frame at 1× and key poses at 3×):
`docs/screenshots/battle/creatures_a/sheet_<family>_1x.webp`, `…_3x.webp`.
All 36 enemies with each move's key pose in their own palette:
`docs/screenshots/battle/creatures_a/roster_all_enemies.webp`.

## The Flour Moth proof (§18)

`rw.dustmoth` has two placements: the mill road (`rw.millroad` f3, exterior, its own lines and
the open-air backdrop) and inside the mill (`rw.mill1` m1a, interior, the window line). Encounter
placement decides the backdrop and lines, not the species; both verified in
`tests/e2e/creatures_a.mjs` and `tests/e2e/encounters.mjs`.

**Strike — the swoop (§18.2), Normal, presentation ms:**

| Time | Creature (cue · frame set · travel) | Result |
|---|---|---|
| 0–260 | `prep.strike` (3 drawings): wings draw back and up, belly and legs turn to the actual target, pupils on it | — |
| 260–640 | `exec.strike` (4): swept glide → dive → legs reaching → wings flare to brake; `travel` out to 0.6 of the way to the target's chest, arc 18 (never a stretched sprite); `wingWake` | — |
| 640 | contact | the rules' result, placed by the sequencer |
| 640–760 | `exec.impact` (2, hit) · `exec.push` (2, softened) · `exec.miss` (met air), travel held; `scaleShed` at the target (or at the seal) | block → hit 110 ms later when softened |
| 760–1150 | `recover.strike` (4): full braking flare, beats home (`travel` back) | — |
| 1150–1250 | `recover.hover` (2): two shallow beats into the idle loop | — |
| ward | at 640 the seal stops it: `recover.deflect` (4) 640–1060, thrown back (head tipped away, antennae flung), travel back from 0.54; `recover.hover` to 1250 | `countered`, `sealBlock` at 640 |

Measured in the real-time recording (presentation clock): hit at 650, ward at 650, softened block
650 / hit 767 (beats land on the first animation frame at or after their time; the contact is at
640); performance end 1,310 (the sequencer adds its 60 ms tail); wall 1,308 / 1,310 / 1,313 ms.

**Shroud (§18.4), 1,450 ms:** 0–300 `prep.shroud` (wings rise and meet high over the body);
300–760 `cast.shroud` (clap down, shake the flour off the margins — drawn into the frames),
`veilRelease` from 330, `mistRoll` from 700; the condition applies at 760 (the rules' beat);
760–1450 `recover.shroud` (beats with less and less powder). The veil then stays quiet over its
knots (flour, slow drift). Light clears it: the same flour disperses (`mistPart`). Measured: the
beat at 767, end 1,510 (with the tail), wall 1,504 ms. The banner (integrator's) covers only the action interval (`end`).

**Reduced motion:** held key poses (aim, strike, recovery) without travel; the hit at its
contact; no particles that move.

## Motion by anatomy (§9.2) and action identity (§9.3)

| Family | Anatomy | Strike | Sweep / area | Unique moves |
|---|---|---|---|---|
| moth | winged / hovering | the swoop | Chart Moth: low wide pass (`arc`) | Shroud (flour clap), Gust (Ash Moth: rear and fan, ash), Gathering (wings folded, trembling), Chill (fanning beat, frost dust), Re-tying (forelegs) |
| wisp | spirit | draw in, comet dart (head leads, tail streams), bump, rebound | Reedling: coil and whirl over both | Heat (crown of flame), Shroud (fog breath), Chill (frost breath), Re-tying (tail-tip), Plea (dims, drifts nearer) |
| echo | abstract | shards gathered to the target's side, shouted out (`shardVolley`) | — | Mirror (shards lock into a pane), Heat (rings warm and quicken), Plea, Re-tying (shards relock) |
| blot | fluid | rears, lashes a tendril that bursts at its tip | surge along the ground (`inkWave`) | Re-tying strand, Silence (presses shut, flattens) |
| crab | grounded organic | crouch; sidles in (legs stepping, feet planted), near claw thrusts and snaps | — | Flood (claws high, slammed down; `tideWash`), Re-tying (snip and tuck) |
| crane | paper | neck drawn into an S, short swoop, beak darts | slicing pass on an open wing | Gust (three strokes, paper flurry), Shroud (damp pulp) |
| golem | large / constructed | wound up overhead, a planted step, hammer blow (`stoneDust`) | — | Gathering (arms drawn in, core brightening), Chill (rimed fist, `iceShard`), Flood (cracks open), Re-tying (a stone set back), Plea (kneels, open hand) |
| sg_letter | paper | — | edge-on spin, strips lashing | Plea (a note slides out of its side to you) |
| clerk | cloth | stamp raised, glide in, seal brought down (`stampSeal`) | — | Lie (false document), Mirror (glossy sheet), Gathering (stamp overhead, seal glowing), Flood (tide of water and paper), Shroud (paper-strewn fog), Plea (bows, offers a letter), Re-tying (a small exact stamp) |
| warden | large / constructed boss | breathes in, belches fire (`kilnBolt`); a kiln does not travel | flame breath across both (`kilnBreath`) | Heat (stoking: fire roars, smoke pours), Gathering (mortar glows), Mirror (glaze shimmer), Plea (fire sinks, eyes soften) |

Every executed move has preparation, execution, contact and recovery; buffs and debuffs are
visible gestures (a cast pose with the shared effect: `gather`, `mendThread`, `hushWave`,
`embers` from the sequencer). Rest has its own pose (wings spread flat, a wisp dimming, a crab
tucking in …). Idle: 6–10 drawings at 105–230 ms (≈4–10 pose changes per second, slowest for
the heavy golem); the stage offsets each creature's phase and the ambient clock is continuous, so
idles never restart in sync. Reactions to real outcomes: `recoil` (struck by water, bind,
reveal, soften), `release` (a knot loosening), `balk` (interrupted), `settle` (its name back:
calm, eyes closed); a ward deflects a Strike-family move at its contact.

## Audit (§9.1) — every enemy id

Family-level record (frame, anchor, idle, materials, anatomy, actions, overlays, reactions,
settle) is in the table above and in `A.audit.families`; per enemy:

| Enemy | Name | Family | Palette | Moves (each delivered by the creature) | Disposition |
|---|---|---|---|---|---|
| `atlas.stray` | Stray Name | wisp | col=#e8dcb0 | plea, rest, strike | upgraded — Stray Name (Atlas): comet-dart Strike; Plea (dims, drifts nearer, a note) |
| `co.ember` | Ember Wisp | wisp | col=#f0a060 | heat, rest, strike | upgraded — Ember Wisp: comet-dart Strike; Heat (a crown of flame, the aura swelling) |
| `lf.mote` | Hush Mote | wisp | col=#c8c4e8 | rest, shroud, strike | upgraded — Hush Mote: comet-dart Strike; Shroud (breathes its fog out, in its lilac light) |
| `rw.reedling` | Reedling | wisp | col=#b8d88a | rest, strike, sweep | upgraded — Reedling: comet-dart Strike; Sweep (coil and whirl over both) |
| `sb.wisp` | Frost Wisp | wisp | col=#cfe8ff | chill, mend, rest | upgraded — Frost Wisp: Chill (frost breath at one); Re-tying with its tail-tip |
| `sg.fogwisp` | Harbour Fog | wisp | col=#c8d4e0 | rest, shroud, strike | upgraded — Harbour Fog: comet-dart Strike; Shroud (harbour fog) |
| `atlas.moth` | Margin Moth | moth | col=#e6dcc4 col2=#b8ac90 | rest, shroud, strike | upgraded — Margin Moth (Atlas palette): swoop Strike, Shroud in its paper-dust |
| `co.moth` | Ash Moth | moth | col=#b8b0a8 col2=#8a827a | gust, rest, strike | upgraded — Ash Moth: swoop Strike; Gust as a rearing, fanning downstroke shaking ash |
| `rw.dustmoth` | Flour Moth | moth | col=#e8e0d0 col2=#b8a888 | rest, shroud, strike | upgraded — Flour Moth (the proof): swoop Strike (hit / ward / softened / met air), Shroud in flour; interior (mill) and exterior (mill road) placements keep their own lines and backdrops |
| `sa.moth` | Catalogue Moth | moth | col=#e4dcc8 col2=#b8a890 | charge, chill, rest, strike | upgraded — Catalogue Moth: swoop Strike; Gathering (wings folded, trembling); Chill (a fanning beat of frost dust) |
| `sb.moth` | Chart Moth | moth | col=#2a3458 col2=#c8d8f0 | mend, rest, strike, sweep | upgraded — Chart Moth (dark wings, pale marks): swoop Strike; Sweep (low wide pass); Re-tying with its forelegs |
| `sg.moth` | Postmark Moth | moth | col=#b0b8d0 col2=#6a7090 | charge, rest, strike | upgraded — Postmark Moth: swoop Strike; Gathering |
| `atlas.blot` | Blotted Line | blot | col=#3a3050 | mend, rest, strike | upgraded — Blotted Line (Atlas): Strike, Re-tying |
| `co.soot` | Smoke Blot | blot | col=#4a4440 | mend, rest, strike, sweep | upgraded — Smoke Blot: Strike, Sweep, Re-tying |
| `lf.blot` | Silence Blot | blot | col=#2a2848 | rest, silence, strike | upgraded — Silence Blot: Strike; Silence (presses shut and flattens; a hush spreads) |
| `rw.inkblot` | Runoff Blot | blot | col=#2a2a44 | mend, rest, strike, sweep | upgraded — Runoff Blot: tendril-lash Strike, ground-surge Sweep, Re-tying strand |
| `sg.blot` | Runaway Ink | blot | col=#1e2440 | mend, rest, sweep | upgraded — Runaway Ink: Sweep, Re-tying |
| `atlas.echo` | Road Echo | echo | col=#c8c0a8 | mirror, rest, strike | upgraded — Road Echo (Atlas): shard-volley Strike, Mirror |
| `rw.mill_echo` | The Mill Echo | echo | col=#a8c8d8 | heat, mirror, plea, rest, strike | upgraded — The Mill Echo (Chapter 1 boss): shard-volley Strike, Mirror pane, Heat (rings warm and quicken), Plea; drawn at the family's scale (no phase-specific art) |
| `sa.echo` | Shelved Echo | echo | col=#b8c8e0 | mend, mirror, strike | upgraded — Shelved Echo: shard-volley Strike, Mirror, Re-tying (shards relock) |
| `atlas.crab` | Rock-pool Crab | crab | col=#b89070 | flood, rest, strike | upgraded — Rock-pool Crab (Atlas): Strike; Flood (claws raised and slammed down; a wash over both) |
| `sg.crab` | Label Crab | crab | col=#c86a4a | mend, rest, strike | upgraded — Label Crab: sidle, thrust-and-snap Strike; snip-and-tuck Re-tying |
| `atlas.crane` | Unfolded Crane | crane | col=#f2ead6 | gust, rest, sweep | upgraded — Unfolded Crane (Atlas): Gust; Sweep (a low slicing pass) |
| `sa.crane` | Paper Crane | crane | col=#f2eee2 | gust, rest, strike | upgraded — Paper Crane: beak-dart Strike, Gust (three strokes, a paper flurry); now faces the party |
| `sg.crane` | Soggy Paper Crane | crane | col=#e4e0cc | rest, shroud, strike | upgraded — Soggy Paper Crane: Strike; Shroud (damp pulp shaken into a mist) |
| `atlas.gate` | The Half-road Gatekeeper | golem | col=#8a8a78 core=#e8c070 | charge, mend, plea, rest, strike | upgraded — The Half-road Gatekeeper (Atlas boss): Strike, Gathering, Re-tying, Plea (kneels, holds out its hand); family scale |
| `atlas.milestone` | Mossy Milestone | golem | col=#9a9a7a core=#c8b070 | charge, rest, strike | upgraded — Mossy Milestone (Atlas): Strike, Gathering |
| `co.golem` | Glass Golem | golem | col=#8fb8b0 core=#f0a060 | charge, mend, rest, strike | upgraded — Glass Golem: overhead hammer Strike, Gathering, Re-tying (a stone set back) |
| `sb.golem` | Icicle Warden | golem | col=#a8d4f0 core=#e8f4ff | charge, chill, rest, strike | upgraded — Icicle Warden: Strike, Gathering, Chill (rimed fist, ice shards) |
| `sg.golem` | Ledger Heap | golem | col=#8a8aa0 core=#e8e0cc | charge, flood, rest, strike | upgraded — Ledger Heap: Strike, Gathering, Flood (cracks open, arms wide) |
| `sg.letter` | Undelivered Letter | sg_letter | (family default) | plea, rest, sweep | upgraded — Undelivered Letter: Plea (a note slides out to you), Sweep (edge-on spin, strips lashing); definition moved from content/ch2/01_art.js |
| `atlas.echotoll` | Echoing Gatekeeper | clerk | col=#5a6a7a | lie, mirror, rest, strike | upgraded — Echoing Gatekeeper (Atlas): stamp Strike, Lie, Mirror |
| `atlas.toll` | False Gatekeeper | clerk | col=#6a5a4a | charge, lie, rest, strike | upgraded — False Gatekeeper (Atlas): stamp Strike, Lie, Gathering |
| `lf.stamp` | Consent Stamp | clerk | col=#4c4a78 | lie, mend, strike | upgraded — Consent Stamp: stamp Strike, Lie, Re-tying (a small exact stamp) |
| `sg.tideclerk` | The Tide Clerk | clerk | col=#3a5a7a | charge, flood, lie, mirror, plea, rest, shroud, strike | upgraded — The Tide Clerk (Chapter 2 boss): stamp Strike, Lie, Mirror, Gathering, Flood (tide of water and paper), Shroud (paper-strewn fog), Plea; now faces the party |
| `co.warden` | The Kiln Warden | warden | (family default) | charge, heat, mirror, plea, rest, strike, sweep | upgraded — The Kiln Warden (Chapter 3 boss): fire-belch Strike, flame-breath Sweep, Heat (stoking), Gathering (mortar glow), Mirror (glaze shimmer), Plea |

"Upgraded" means: the family's revised rig, its own palette, every move the enemy uses delivered
by the creature (unit-tested for every variant), authored rest and reactions, frames reviewed on
the sheets and roster, and one battle per family in the browser. Not every enemy was played in a
browser battle; per family the browser test uses `rw.dustmoth`, `rw.reedling`, `rw.inkblot`,
`sa.echo`, `sg.crab`, `sa.crane`, `co.golem`, `sg.letter`, `lf.stamp`, `co.warden`.

## Timing (generated: `node tests/unit/creatures_a_timing.mjs --md`)

Normal speed, presentation ms; contact = when the rules' first result shows. Ward / softened rows
for single-target moves use the rules' `countered` (ward) and `block`+`hit` (softened) results.

| Family | Move | Contact | End | Creature cues (ms, act.frame-set, travel) | Effects (name@ms) |
|---|---|---:|---:|---|---|
| wisp | chill (hit) | 580 | 1050 | 0–260 prep.chill; 260–600 exec.chill (out → pc 0.1); 600–1000 recover.chill (back → pc 0.1) | frostDust@280 |
| wisp | chill (ward) | 580 | 1050 | 0–260 prep.chill; 260–600 exec.chill (out → pc 0.1); 600–1000 recover.chill (back → pc 0.1) | frostDust@280 |
| wisp | chill (softened) | 580 | 1050 | 0–260 prep.chill; 260–600 exec.chill (out → pc 0.1); 600–1000 recover.chill (back → pc 0.1) | frostDust@280 |
| wisp | heat | 640 | 1100 | 0–260 prep.heat; 260–900 cast.heat; 900–1100 recover.heat | gather@280 |
| wisp | mend | 760 | 1200 | 0–220 prep.plea; 220–900 cast.mend; 900–1200 recover.plea | mendThread@220 |
| wisp | plea | 640 | 1250 | 0–260 prep.plea; 260–900 cast.plea (out → party 0.14, arc 4); 900–1250 recover.plea (back → party 0.14) | note@300 |
| wisp | shroud | 760 | 1350 | 0–300 prep.shroud; 300–900 cast.shroud; 900–1350 recover.shroud | veilRelease@340, mistRoll@700 |
| wisp | strike (hit) | 520 | 1060 | 0–240 prep.strike; 240–520 exec.strike (out → pc 0.58, arc 12); 520–620 exec.impact (hold → pc 0.58); 620–980 recover.strike (back → pc 0.58, arc -6); 980–1060 recover.hover | wispTrail@250 |
| wisp | strike (ward) | 520 | 1060 | 0–240 prep.strike; 240–520 exec.strike (out → pc 0.5, arc 12); 520–940 recover.deflect (back → pc 0.5); 940–1060 recover.hover | wispTrail@250 |
| wisp | strike (softened) | 520 | 1060 | 0–240 prep.strike; 240–520 exec.strike (out → pc 0.58, arc 12); 520–620 exec.push (hold → pc 0.58); 620–980 recover.strike (back → pc 0.58, arc -6); 980–1060 recover.hover | wispTrail@250 |
| wisp | sweep | 580 | 1200 | 0–280 prep.sweep; 280–640 exec.sweep (out → party 0.42, arc 22); 640–760 exec.sweep@3 (hold → party 0.42); 760–1140 recover.sweep (back → party 0.42); 1140–1200 recover.hover | arc@300, wispTrail@300 |
| moth | charge | 760 | 1200 | 0–260 prep.charge; 260–900 cast.charge; 900–1200 recover.charge | gather@240 |
| moth | chill (hit) | 600 | 1150 | 0–280 prep.chill; 280–620 exec.chill (out → pc 0.12); 620–1060 recover.chill (back → pc 0.12); 1060–1150 recover.hover | frostDust@320 |
| moth | chill (ward) | 600 | 1150 | 0–280 prep.chill; 280–620 exec.chill (out → pc 0.12); 620–1060 recover.chill (back → pc 0.12); 1060–1150 recover.hover | frostDust@320 |
| moth | chill (softened) | 600 | 1150 | 0–280 prep.chill; 280–620 exec.chill (out → pc 0.12); 620–1060 recover.chill (back → pc 0.12); 1060–1150 recover.hover | frostDust@320 |
| moth | gust | 600 | 1300 | 0–320 prep.gust; 320–760 exec.gust (out → party -0.04); 760–1200 recover.gust (back → party -0.04) | gust@380, ashDrift@400 |
| moth | mend | 760 | 1200 | 0–240 prep.charge; 240–900 cast.mend (out → party -0.03); 900–1200 recover.hover (back → party -0.03) | mendThread@260 |
| moth | shroud | 760 | 1450 | 0–300 prep.shroud; 300–760 cast.shroud; 760–1450 recover.shroud | veilRelease@330, mistRoll@700 |
| moth | strike (hit) | 640 | 1250 | 0–260 prep.strike; 260–640 exec.strike (out → pc 0.6, arc 18); 640–760 exec.impact (hold → pc 0.6); 760–1150 recover.strike (back → pc 0.6, arc -6); 1150–1250 recover.hover | wingWake@300, scaleShed@640 |
| moth | strike (ward) | 640 | 1250 | 0–260 prep.strike; 260–640 exec.strike (out → pc 0.54, arc 18); 640–1060 recover.deflect (back → pc 0.54); 1060–1250 recover.hover | wingWake@300, scaleShed@640 |
| moth | strike (softened) | 640 | 1250 | 0–260 prep.strike; 260–640 exec.strike (out → pc 0.6, arc 18); 640–760 exec.push (hold → pc 0.6); 760–1150 recover.strike (back → pc 0.6, arc -6); 1150–1250 recover.hover | wingWake@300, scaleShed@640 |
| moth | sweep | 620 | 1300 | 0–280 prep.sweep; 280–760 exec.sweep (out → party 0.48, arc 10); 760–1200 recover.sweep (back → party 0.48); 1200–1300 recover.hover | arc@330 |
| blot | mend | 760 | 1200 | 0–220 prep.mend; 220–900 cast.mend; 900–1200 recover.mend | mendThread@220 |
| blot | silence | 700 | 1150 | 0–300 prep.silence; 300–900 cast.silence; 900–1150 recover.silence | hushWave@360, inkWave@320 |
| blot | strike (hit) | 560 | 1050 | 0–280 prep.strike; 280–560 exec.strike (out → pc 0.2); 560–680 exec.impact (hold → pc 0.2); 680–980 recover.strike (back → pc 0.2); 980–1050 recover.hover | inkLash@400 |
| blot | strike (ward) | 560 | 1050 | 0–280 prep.strike; 280–560 exec.strike (out → pc 0.2); 560–980 recover.deflect (back → pc 0.2); 980–1050 recover.hover | inkLash@400 |
| blot | strike (softened) | 560 | 1050 | 0–280 prep.strike; 280–560 exec.strike (out → pc 0.2); 560–680 exec.push (hold → pc 0.2); 680–980 recover.strike (back → pc 0.2); 980–1050 recover.hover | inkLash@400 |
| blot | sweep | 600 | 1150 | 0–300 prep.sweep; 300–760 exec.sweep (out → party 0.22); 760–1150 recover.sweep (back → party 0.22) | inkWave@330 |
| echo | heat | 680 | 1150 | 0–280 prep.heat; 280–900 cast.heat; 900–1150 recover.heat | echoRings@300 |
| echo | mend | 760 | 1200 | 0–220 prep.plea; 220–900 cast.mend; 900–1200 recover.plea | mendThread@220 |
| echo | mirror (hit) | 620 | 1150 | 0–300 prep.mirror; 300–640 exec.mirror (out → pc 0.08); 640–1100 recover.mirror (back → pc 0.08) | pane@340 |
| echo | mirror (ward) | 620 | 1150 | 0–300 prep.mirror; 300–640 exec.mirror (out → pc 0.08); 640–1100 recover.mirror (back → pc 0.08) | pane@340 |
| echo | mirror (softened) | 620 | 1150 | 0–300 prep.mirror; 300–640 exec.mirror (out → pc 0.08); 640–1100 recover.mirror (back → pc 0.08) | pane@340 |
| echo | plea | 640 | 1200 | 0–260 prep.plea; 260–900 cast.plea; 900–1200 recover.plea | echoRings@280, note@300 |
| echo | strike (hit) | 600 | 1150 | 0–300 prep.strike; 300–620 exec.strike (out → pc 0.16); 620–720 exec.impact (hold → pc 0.16); 720–1080 recover.strike (back → pc 0.16); 1080–1150 recover.hover | shardVolley@330 |
| echo | strike (ward) | 600 | 1150 | 0–300 prep.strike; 300–620 exec.strike (out → pc 0.16); 620–720 exec.push (hold → pc 0.16); 720–1080 recover.deflect (back → pc 0.16); 1080–1150 recover.hover | shardVolley@330 |
| echo | strike (softened) | 600 | 1150 | 0–300 prep.strike; 300–620 exec.strike (out → pc 0.16); 620–720 exec.push (hold → pc 0.16); 720–1080 recover.strike (back → pc 0.16); 1080–1150 recover.hover | shardVolley@330 |
| crab | flood | 620 | 1150 | 0–320 prep.flood; 320–720 exec.flood; 720–1150 recover.flood | tideWash@420 |
| crab | mend | 760 | 1200 | 0–220 prep.mend; 220–900 cast.mend; 900–1200 recover.mend | mendThread@220 |
| crab | strike (hit) | 600 | 1150 | 0–300 prep.strike; 300–600 exec.strike (out → pc 0.36); 600–720 exec.impact (hold → pc 0.36); 720–1080 recover.strike (back → pc 0.36); 1080–1150 recover.hover | clawSnap@585 |
| crab | strike (ward) | 600 | 1150 | 0–300 prep.strike; 300–600 exec.strike (out → pc 0.3); 600–1080 recover.deflect (back → pc 0.3); 1080–1150 recover.hover | clawSnap@585 |
| crab | strike (softened) | 600 | 1150 | 0–300 prep.strike; 300–600 exec.strike (out → pc 0.36); 600–720 exec.push (hold → pc 0.36); 720–1080 recover.strike (back → pc 0.36); 1080–1150 recover.hover | clawSnap@585 |
| crane | gust | 600 | 1200 | 0–320 prep.gust; 320–760 exec.gust; 760–1200 recover.gust | gust@360, paperFlurry@380 |
| crane | shroud | 760 | 1350 | 0–300 prep.shroud; 300–900 cast.shroud; 900–1350 recover.shroud | veilRelease@340, mistRoll@700 |
| crane | strike (hit) | 600 | 1150 | 0–300 prep.strike; 300–600 exec.strike (out → pc 0.46, arc 14); 600–710 exec.impact (hold → pc 0.46); 710–1080 recover.strike (back → pc 0.46, arc -4); 1080–1150 recover.hover | paperCut@570 |
| crane | strike (ward) | 600 | 1150 | 0–300 prep.strike; 300–600 exec.strike (out → pc 0.4, arc 14); 600–1080 recover.deflect (back → pc 0.4); 1080–1150 recover.hover | paperCut@570 |
| crane | strike (softened) | 600 | 1150 | 0–300 prep.strike; 300–600 exec.strike (out → pc 0.46, arc 14); 600–710 exec.push (hold → pc 0.46); 710–1080 recover.strike (back → pc 0.46, arc -4); 1080–1150 recover.hover | paperCut@570 |
| crane | sweep | 600 | 1200 | 0–300 prep.sweep; 300–660 exec.sweep (out → party 0.44, arc 8); 660–760 exec.sweep@2 (hold → party 0.44); 760–1200 recover.sweep (back → party 0.44) | arc@320, paperCut@560 |
| golem | charge | 760 | 1220 | 0–280 prep.charge; 280–920 cast.charge; 920–1220 recover.charge | gather@260 |
| golem | chill (hit) | 600 | 1100 | 0–300 prep.chill; 300–620 exec.chill (out → pc 0.06); 620–1100 recover.chill (back → pc 0.06) | iceShard@340 |
| golem | chill (ward) | 600 | 1100 | 0–300 prep.chill; 300–620 exec.chill (out → pc 0.06); 620–1100 recover.chill (back → pc 0.06) | iceShard@340 |
| golem | chill (softened) | 600 | 1100 | 0–300 prep.chill; 300–620 exec.chill (out → pc 0.06); 620–1100 recover.chill (back → pc 0.06) | iceShard@340 |
| golem | flood | 620 | 1200 | 0–320 prep.flood; 320–740 exec.flood; 740–1200 recover.flood | tideWash@400 |
| golem | mend | 760 | 1200 | 0–240 prep.mend; 240–900 cast.mend; 900–1200 recover.mend | mendThread@240 |
| golem | plea | 700 | 1300 | 0–320 prep.plea; 320–960 cast.plea; 960–1300 recover.plea | note@380 |
| golem | strike (hit) | 640 | 1250 | 0–360 prep.strike; 360–640 exec.strike (out → pc 0.24); 640–780 exec.impact (hold → pc 0.24); 780–1160 recover.strike (back → pc 0.24); 1160–1250 recover.hover | stoneDust@640 |
| golem | strike (ward) | 640 | 1250 | 0–360 prep.strike; 360–640 exec.strike (out → pc 0.18); 640–1160 recover.deflect (back → pc 0.18); 1160–1250 recover.hover | stoneDust@640 |
| golem | strike (softened) | 640 | 1250 | 0–360 prep.strike; 360–640 exec.strike (out → pc 0.24); 640–780 exec.push (hold → pc 0.24); 780–1160 recover.strike (back → pc 0.24); 1160–1250 recover.hover | stoneDust@640 |
| sg_letter | plea | 640 | 1240 | 0–280 prep.plea; 280–920 cast.plea; 920–1240 recover.plea | note@480 |
| sg_letter | sweep | 600 | 1150 | 0–300 prep.sweep; 300–740 exec.sweep (out → party 0.34, arc 12); 740–1150 recover.sweep (back → party 0.34) | arc@320, paperCut@560 |
| clerk | charge | 760 | 1220 | 0–280 prep.charge; 280–920 cast.charge; 920–1220 recover.charge | gather@260 |
| clerk | flood | 620 | 1200 | 0–320 prep.flood; 320–740 exec.flood; 740–1200 recover.flood | tideWash@380 |
| clerk | lie (hit) | 620 | 1150 | 0–300 prep.lie; 300–640 exec.lie (out → pc 0.12); 640–1100 recover.lie (back → pc 0.12) | pane@340 |
| clerk | lie (ward) | 620 | 1150 | 0–300 prep.lie; 300–640 exec.lie (out → pc 0.12); 640–1100 recover.lie (back → pc 0.12) | pane@340 |
| clerk | lie (softened) | 620 | 1150 | 0–300 prep.lie; 300–640 exec.lie (out → pc 0.12); 640–1100 recover.lie (back → pc 0.12) | pane@340 |
| clerk | mend | 760 | 1200 | 0–240 prep.charge; 240–900 cast.mend; 900–1200 recover.hover | mendThread@240, stampSeal@760 |
| clerk | mirror (hit) | 620 | 1150 | 0–300 prep.mirror; 300–640 exec.mirror (out → pc 0.12); 640–1100 recover.mirror (back → pc 0.12) | pane@340 |
| clerk | mirror (ward) | 620 | 1150 | 0–300 prep.mirror; 300–640 exec.mirror (out → pc 0.12); 640–1100 recover.mirror (back → pc 0.12) | pane@340 |
| clerk | mirror (softened) | 620 | 1150 | 0–300 prep.mirror; 300–640 exec.mirror (out → pc 0.12); 640–1100 recover.mirror (back → pc 0.12) | pane@340 |
| clerk | plea | 680 | 1260 | 0–300 prep.plea; 300–940 cast.plea; 940–1260 recover.plea | note@380 |
| clerk | shroud | 760 | 1350 | 0–300 prep.shroud; 300–900 cast.shroud; 900–1350 recover.shroud | veilRelease@340, mistRoll@700 |
| clerk | strike (hit) | 600 | 1150 | 0–300 prep.strike; 300–600 exec.strike (out → pc 0.46, arc 6); 600–720 exec.impact (hold → pc 0.46); 720–1080 recover.strike (back → pc 0.46); 1080–1150 recover.hover | stampSeal@600 |
| clerk | strike (ward) | 600 | 1150 | 0–300 prep.strike; 300–600 exec.strike (out → pc 0.4, arc 6); 600–1080 recover.deflect (back → pc 0.4); 1080–1150 recover.hover | stampSeal@600 |
| clerk | strike (softened) | 600 | 1150 | 0–300 prep.strike; 300–600 exec.strike (out → pc 0.46, arc 6); 600–720 exec.push (hold → pc 0.46); 720–1080 recover.strike (back → pc 0.46); 1080–1150 recover.hover | stampSeal@600 |
| warden | charge | 760 | 1240 | 0–300 prep.charge; 300–940 cast.charge; 940–1240 recover.charge | gather@280 |
| warden | heat | 700 | 1260 | 0–300 prep.heat; 300–960 cast.heat; 960–1260 recover.heat | kilnStoke@320 |
| warden | mirror (hit) | 640 | 1180 | 0–300 prep.mirror; 300–640 exec.mirror; 640–1140 recover.mirror | pane@360 |
| warden | mirror (ward) | 640 | 1180 | 0–300 prep.mirror; 300–640 exec.mirror; 640–1140 recover.mirror | pane@360 |
| warden | mirror (softened) | 640 | 1180 | 0–300 prep.mirror; 300–640 exec.mirror; 640–1140 recover.mirror | pane@360 |
| warden | plea | 700 | 1300 | 0–320 prep.plea; 320–960 cast.plea; 960–1300 recover.plea | note@380 |
| warden | strike (hit) | 620 | 1200 | 0–340 prep.strike; 340–620 exec.strike; 620–740 exec.impact; 740–1140 recover.strike; 1140–1200 recover.hover | kilnBolt@380 |
| warden | strike (ward) | 620 | 1200 | 0–340 prep.strike; 340–620 exec.strike; 620–1140 recover.deflect; 1140–1200 recover.hover | kilnBolt@380 |
| warden | strike (softened) | 620 | 1200 | 0–340 prep.strike; 340–620 exec.strike; 620–740 exec.push; 740–1140 recover.strike; 1140–1200 recover.hover | kilnBolt@380 |
| warden | sweep | 640 | 1250 | 0–320 prep.sweep; 320–800 exec.sweep; 800–1250 recover.sweep | kilnBreath@380 |

## §22.4 rubric — self-review

**Self-review by the implementing agent**, not a human review. Viewed at native 1× and 3× on the
frame sheets, and in battle at 1280 × 800 (stills) and in the 960 × 540 Normal recording of the
moth. Scale: 0 missing/broken, 1 inconsistent, 2 coherent, 3 notably polished.

| Family | Silhouette | Form / materials | Weight / anchors | Action identity | Secondary motion | Outcome truthfulness | Language visibility | Scene integration |
|---|---|---|---|---|---|---|---|---|
| moth | 3 | 2 | 2 | 3 | 2 | 3 | 2 | 2 |
| wisp | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 |
| echo | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 |
| blot | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 |
| crab | 2 | 2 | 2 | 2 | 1 | 2 | 2 | 2 |
| crane | 2 | 2 | 2 | 2 | 1 | 2 | 2 | 2 |
| golem | 2 | 2 | 2 | 2 | 1 | 2 | 2 | 2 |
| sg_letter | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 |
| clerk | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 |
| warden | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 |

Notes: outcome truthfulness rests on the sequencer placing the rules' results; the creature adds
only variant poses chosen from those results (hit / ward / softened / met air). Language
visibility: creature art never covers the word strip or the task; the veil stays over the knots
and lower body. Below target (1): secondary motion of the crab (tags and eye stalks only), the
crane (rigid paper, the neck's S-fold reads stiffly) and the golem (deliberately heavy; little
follow-through). Unreviewed: Fast and Instant playback of these deliveries (the integrator's
speed setting was not in the base); phone layouts with the larger frames (battle_group's
320 × 640 case passes); boss phase changes (no phase-specific art).

## Resources (§21.4–21.5)

- **Cache:** frames are cached by the enemy-art module (id | options | act:i/n | side), an LRU of
  140 frames shared by every creature on screen. Keys hold appearance, variant, pose and step
  only. Worst case if the cache filled with the largest frame of these families (the Kiln
  Warden, 220 × 262): 140 × 230,560 B = **30.8 MiB** (< 48 MiB).
- **Measured (raw RGBA, w × h × 4 per distinct frame drawn, from `tests/e2e/creatures_a.mjs`):**
  the exterior moth battle with every Strike variant, Shroud and prewarm: **56 frames, 9.19 MiB**;
  the diagnostic trio (moth, reedling, blot) with prewarm: **125 frames, 17.86 MiB** (inside the
  LRU). These are pixel arithmetic, not measured process memory.
- **Per-family totals if every frame were cached** (from the sheet tool): moth 96 frames 15.75 MiB;
  wisp 85 / 11.41; echo 66 / 10.89; blot 65 / 8.29; crab 55 / 7.46; golem 76 / 16.03; crane 67 /
  11.82; letter 36 / 5.38; clerk 85 / 15.40; warden 79 / 17.37.
- **Prewarm:** when a creature's first frame is built in a battle, its moves' frame sets and
  reactions are built in idle slices (at least one per `requestIdleCallback`, timeout 120 ms), at
  most 44 frames per creature and a share of 96 when different creatures meet, so the first
  action does not stall on generation in normal play.
- **Generation time per frame:** isolated profile (headless Chromium, software canvas): moth
  ≈ 8.7 ms, golem ≈ 7.2 ms (was ≈ 37 and ≈ 27 before the fast helpers). The sheet tool's final
  run (load average ≈ 4–6) measured per family medians 2.4–8.3 ms, p95 7–28 ms, max 73 ms (the
  golem); under heavy load (15–35) earlier, medians up to 20.7 ms and p95 up to 107 ms. A shared
  machine, not a benchmark.
- **Draw cost:** `battle_anim`'s frame-cost scenario, final full run (load ≈ 5): during
  sequences avg 1.73 ms, max 23.7 ms over 942 frames; all frames avg 1.97 ms (threshold 8 ms).
  In isolation earlier: 3.56 ms (base 2.75 ms). Under heavy load (15–35) a full run measured
  8.08 and 12.6 ms and failed; the base was not re-measured under that load.

## Tests — commands and results

Build: `node tools/build.mjs`. All on this branch's HEAD; browser tests run one at a time in
headless Chromium (Playwright) on a shared machine.

Final runs, one script at a time, load average ≈ 2–6 (earlier runs during the day were at 15–35):

| Command | Kind | Result |
|---|---|---|
| `node tools/build.mjs` | build | built `index.html` — 281 source files, 8167.8 KiB |
| `node tests/run-unit.mjs` | unit (node) | **8060 passed, 0 failed** (whole suite) |
| `node tests/run-unit.mjs creatures_a` | unit (node) | **61 passed, 0 failed** — every enemy's every kind × normal / reduced motion / ward / softened: valid cues, contact inside the duration, swoop timings, frame-set resolution, reduced-motion policy, idle 6–12 per family, reactions, all 36 dispositions, cache budget |
| `node tests/e2e/creatures_a.mjs --docs` | browser | **14 passed, 0 failed** — moth exterior (unblocked, warded, softened, met air; Shroud applied / persisting / cleared), moth interior, reduced motion, **diagnostic** Mio party, one battle per family (9), **diagnostic** trio; rules called once per exchange, display equal to the rules, no page errors |
| `node tests/e2e/battle_anim.mjs` | browser | **16 passed, 0 failed** (frame cost: during sequences avg 1.73 ms, max 23.7 ms over 942 frames) |
| `node tests/e2e/battle_group.mjs` | browser | **6 passed, 0 failed** |
| `node tests/e2e/combat_ui.mjs` | browser | **7 passed, 0 failed** |
| `node tests/e2e/encounters.mjs` | browser | **all ok** (19 checks, no page errors) |
| `node tests/e2e/battle_video.mjs` | browser recording | wrote `tests/e2e/out/battle_video/battle.webm`; no page errors |
| `node tests/e2e/creatures_a_video.mjs --docs` | browser recording (real time, Normal) | the moth proof; no page errors; trace below |
| `node tests/e2e/creatures_a_sheets.mjs --docs --variants --roster` | browser capture | 10 family sheets (1×, 3×) and the roster of 36; no page errors |
| `node tests/unit/creatures_a_timing.mjs --md` | generator | the timing table above |

Recording trace (`moth_proof_trace.json`, presentation ms; the sequencer's own end includes its
60 ms tail): unblocked Strike hit@650, end 1310, wall 1308 ms; warded Strike countered@650, wall
1310 ms; softened block@650 + hit@767, wall 1313 ms; Shroud shroud@767, end 1510, wall 1504 ms;
rest (light clears the veil) rest@200, wall 748 ms.

Earlier, under heavy load, `battle_anim` failed its frame-cost threshold (8.08 and 12.6 ms) and its
"rapid input" test (which also failed at the base commit `982c8df` under that load); both pass in
the final run above. Not run: the other e2e scripts outside this area's brief.

`tests/e2e/creatures_a.mjs` also holds a **playback speeds** test (the moth's Strike at Normal,
Fast and Instant, and a warded Strike at Fast: the same results, Fast shorter, no creature
movement at Instant). It runs only where the build has the integrator's Battle animations setting;
on this branch it prints `SKIP` and is not counted.

**Trial merge with the integrator branch** (`claude/stoic-sagan-n3jvgk` at `03cb94a`: the
presentation contract — playback, banner, intent badges — plus pets, backdrops and Creatures B).
No merge was made: `git merge-tree --write-tree HEAD claude/stoic-sagan-n3jvgk` reports **no
conflicts**, and that tree was exported to a scratch folder, built and tested there, one script
at a time:

| Command (in the merged tree) | Result |
|---|---|
| `node tools/build.mjs` | 294 source files, 8518.8 KiB |
| `node tests/run-unit.mjs` | **15266 passed, 0 failed** |
| `node tests/e2e/creatures_a.mjs` | **14 passed, 0 failed** |
| `node tests/e2e/creatures_a.mjs playback` | **1 passed, 0 failed** — trace durations: Normal 1309 ms, Fast 902 ms, Instant 1 ms; the same `hit` at every speed; `countered` when warded at Fast |
| `node tests/e2e/battle_anim.mjs` | **16 passed, 0 failed** |
| `node tests/e2e/battle_presentation.mjs` | **9 passed, 0 failed** (banner, Instant, Fast, intent badges at each creature's slot, menus) |
| `node tests/e2e/battle_creatures_b.mjs` | **25 passed, 0 failed** (this area's `drawPosed` wrapper and veil leave Creatures B's families unchanged) |

## Evidence (`docs/screenshots/battle/creatures_a/`)

- `moth_proof_normal.webm` — real-time Normal recording (960 × 540, viewport 1280 × 720) on the
  mill road, solo, responses answered with the real mouse: quiet idle → unblocked swoop Strike →
  fully warded Strike → softened hit → Shroud applied → the veil persisting → light clears it.
  `moth_proof_trace.json` — the sequencer's trace of each move (results with presentation ms,
  the cues fired, wall time).
- Stills at the contact (presentation clock slowed only while capturing):
  `moth_ext_strike_contact`, `moth_ext_ward_contact`, `moth_ext_softened`,
  `moth_ext_shroud_release`, `moth_ext_shroud_persisting`, `moth_int_strike_contact` (interior),
  `moth_diag_party_strike_comp` (**diagnostic fixture**: Mio on the mill road),
  `group_trio_diagnostic` (**diagnostic fixture**: three creatures), `family_<family>_<move>` for
  every other family.
- `sheet_<family>_1x.webp` / `_3x.webp`, `roster_all_enemies.webp`.
- Scratch captures: `tests/e2e/out/battle_creatures_a/`.

## Limitations

- **Travel shape.** The seam's travel is ease-out from home to a fraction of the way to the target
  (`out`), held, or back. A swoop therefore decelerates into its contact rather than accelerating;
  the authored frames carry the dive. A path across two targets is not possible (one anchor per
  cue): sweeps travel toward the party's midpoint and the breadth is shown by the effect.
- **Drawn behind the party.** The stage draws creatures before the party, so at contact a moth's
  near wing passes behind the adventurer it strikes.
- **Bosses** use their family's art at the family's scale; no phase-specific art or signature
  lead-ins beyond their moves.
- **Fast / Instant** playback: this branch's base has no Battle animations setting, so it was
  exercised only on the trial merge below, for the moth's Strike (Normal / Fast / Instant, and a
  warded Strike at Fast). Other families' deliveries at Fast rely on the sequencer scaling the
  presentation clock (they use no wall-clock timers); not checked one by one.
- **Secondary motion** below target for the crab, crane and golem (rubric above).
- **Generation stalls** are possible on the very first use of a frame set before prewarm finishes
  (seen as longer wall times under heavy load); there is no hard first-action latency measurement
  on named hardware.
- **Fast / reduced-motion recordings, phone layouts, real devices:** not recorded for this area.
- `index.html` is generated and not committed on this branch; rebuild after merging.

## Merge notes (shared files touched)

1. **`src/ui/82_battle_seq.js`** (integrator) — two small changes:
   - `fire1` passes the foe cue's `travel` to the stage
     (`S.foe(…, { …, travel: c.travel })` — now written exactly as the integrator branch has it,
     so the two branches make the same change and merge without a conflict). Without it the travel seam never reached
     `83_battle_stage.js` (`travelOf` read `act.travel`, always undefined); the seam test only
     checked that the cue carried it.
   - The delivery's argument object gains `fx` (the rules' results, read-only) at both call sites,
     and the comment documents it; creatures use it to choose their contact variant.
2. **`src/content/ch2/01_art.js`** (this area's `sg_letter`) — its battle-art block is removed and
   replaced by a pointer to `src/ui/78e_paper.js`. Content loads after `ui/`, so a definition
   re-added there would silently override the authored letter.
3. **`tests/e2e/battle_anim.mjs`** — the enemy-turns test asserted the Flour Moth's generic
   `dart`; it now accepts the moth's own swoop (`wingWake` / `scaleShed`) as well.
4. **Runtime extensions from this area's own files** (no edits to the owners' files):
   - `RB.enemyArt.drawPosed` is wrapped (78a) for frame sets by move, held poses and the
     reduced-motion policy — only for definitions built with this rig.
   - `RB.enemyArt.MOVES` gains `a_<family>` styles.
   - `RB.battleFx.status.shroud`, `fx.mistRoll` and `fx.mistPart` are replaced (84a) by the
     material-aware veil (same names and signatures; every creature benefits; another family can
     opt in with `veil(o)` on its definition). If the party worker changes `mistPart` for Light,
     84a's version wins (it loads later): coordinate there.
5. `index.html` is not committed (generated).
6. **The integrator's presentation contract** (banner and word strip inert; intent badges from
   `src/ui/82c_battle_intents.js` at each creature's resting place): nothing here reads or
   draws them. Creature travel moves only the creature and its shadow; the badges stay at the
   slot (checked by `battle_presentation.mjs` on the trial merge). The sequencer on that branch
   already passes `p: { foe }` to `mistRoll` / `mistPart`, which this area's veil reads.
7. **Tests that set the speed:** `creatures_a_lib.mjs`'s `battle()` sets `battleAnim` (`o.anim`,
   default Normal) where the setting exists, so these tests keep Normal timing after the merge.
