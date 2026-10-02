# Creatures B — Chapters 4–6 and the Atlas (battle addendum §5, §6, §9, §10, §21.4–21.5, §22.4, §23.5)

**Area:** creature worker B (`docs/BATTLE_ART_CONTRACTS.md`). **Families:** `sb_snowfox`, `lantern`,
`sb_frostlamp`, `lf_conduit`, `bell`, `lf_keeper`, `hush`, `sa_hush`, `fox`, `atlas_cartographer`,
`spirit` — every enemy of `docs/battle/INVENTORY.md` that uses them (14 enemy ids, 5 of them guardians).
**Base:** `982c8df` (the seams commit). Every claim below says how it was checked: *unit test*,
*browser test* (the built `index.html` in Chromium via Playwright), or *review* (looking at captures).

## Summary

- **Built:** all eleven families as rigs (`RB.creaturesB.rig`) with authored poses — **829 authored
  action frames** across them (plus 6–10 idle poses each) — and **46 move deliveries** (every move
  kind any of the fourteen enemies uses, through patterns, phases and intents; a `'*'` catch-all per family), with
  **26 new effects** (`cb*`). Every enemy's disposition: **upgraded** (14/14). The unused `spirit` family is upgraded
  modestly and recorded as below target (no enemy uses it).
- **Motion by anatomy (§9.2):** hung things swing on one hinge with a lagging inner part (bells and their clappers,
  lanterns and their flames) and settle in damped swings; the standing lamp rocks on the edge of its foot and its door
  swings on its hinge; the Keeper rides on its tendrils, turns its wheel and drops its sluice gate; the conduit's
  pressure always climbs from its fixed base and leaves drips and a puddle; foxes are a skeleton with planted paws (crouch,
  leap, bite, land; weight on the haunch, never sliding); veils lead with the crown and the hem lags; the Hush and the
  Cartographer expand, separate and return (pages in formations; panels, chart and brush).
- **Strike ≠ Sweep ≠ unique moves (§9.3):** each has preparation, execution, contact on the actual recipients (the
  sequencer places the rules' results at the delivery's `contact`; a Sweep's front reaches each recipient at its own
  beat), and recovery. Buffs and debuffs are visible actions (Gathering, Heat, Shroud, Hush, Re-tying, plea, false
  promise, mirror). Routine moves last 1.2–1.5 s at Normal; guardian signatures (the Keeper's and the Hush's Flood, the
  Hush's Gust, the Lamp's Chill) 1.7–2.0 s.
- **Reactions to real outcomes (§10):** authored `recoil`, `release`, `balk` (also the ward path: the approach stops at
  the seal and the creature is thrown back), `settle`, `rest`, and the wind-up `prep` of a move that is answered.
- **Tests:** unit 941 passed, 0 failed (creatures_b), full unit suite 8939 passed, 1 failed (the recognizer's timing check under load; run alone afterwards: recog-accuracy 64 passed, 0 failed, p95 52.98 ms); browser
  `battle_creatures_b.mjs` 25 passed, 0 failed; existing `battle_group.mjs` 6/6, `combat_ui.mjs` 7/7; story smoke runs
  `story_ch4` (F/mio), `story_ch5` (F/mio), `story_ch6` (run 0) pass.


## Files and APIs

| File | What it holds |
|---|---|
| `src/ui/78m_creatures_b.js` | The kit, `RB.creaturesB`: `rig(id, spec)` (a family as one drawing function of pose parameters; idle frames and authored action frames are parameter sets; `keys` = one held pose per move for reduced motion; `alias` = an act drawn with another act's frames), `tween` / `keys` (in-betweens between authored key poses), `play(a, plan)` (a delivery plan → `{ cues, contact, end }`; reduced motion → one held key pose, no travel), `deliver(art, kinds, fn)` / `flush()` (registration with `RB.battleSeq.addDelivery`, which loads later), `damp` (mechanical settling), prewarm while you choose (`warmFor`, `warmStats`), `family` / `audit` records, `budget(id)`. |
| `src/ui/78n_lanterns.js` | `lantern` (four variants) and `sb_frostlamp`, with their deliveries. |
| `src/ui/78o_bells.js` | `bell` (the Bell Wraith and the Borrowed Bell) and `lf_keeper`. |
| `src/ui/78p_conduit.js` | `lf_conduit`. |
| `src/ui/78q_foxes.js` | `fox` and `sb_snowfox` (one skeleton rig). |
| `src/ui/78r_veils.js` | `hush` and `spirit`. |
| `src/ui/78s_hush.js` | `sa_hush` (thirteen borrowed moves). |
| `src/ui/78t_cartographer.js` | `atlas_cartographer`. |
| `src/ui/78z_creatures_b_audit.js` | `RB.creaturesB.auditRows()`: the audit row of every enemy, built from the registries plus the reviewed disposition. |
| `src/ui/84m_creatures_b_fx.js` | The families' effects (`RB.battleFx.fx.cb*`): `cbToll` (strike / dull / sweep / mute / lie), `cbTag`, `cbGather`, `cbLash`, `cbFlood`, `cbPane`, `cbNote`, `cbFlameLick`, `cbHeatWave`, `cbSmoke`, `cbFalseLight`, `cbMend`, `cbFrostBreath`, `cbSnowBurst`, `cbWrap`, `cbJet`, `cbPageLance`, `cbPageFling`, `cbPageFog`, `cbPageGust`, `cbMirror`, `cbChartLash`, `cbErase`, `cbBite`, `cbFoxfire`, `cbDouble`. Also calls `RB.creaturesB.flush()`. |
| `tests/unit/creatures_b.test.mjs` | Unit tests (below). |
| `tests/e2e/battle_creatures_b.mjs` | Browser test: real battles in synthetic campaigns (below). |
| `tests/e2e/creatures_b_sheets.mjs` | Native frame sheets and key poses at 3×; frame build times; clipping check. |
| `tests/e2e/creatures_b_video.mjs` | Real-time Normal recording of guardian exchanges (WebM). |
| `tools/creatures_b_audit.mjs` | Prints the audit, timing and budget tables of this record from the registries. |

**How a family is built.** `draw(L, o, q, H, at)` paints the creature from pose parameters `q` with
`RB.pxkit` (material ramps, clustered shading, selective outlines). The idle loop and every authored
action frame are parameter sets — key poses written by hand, with in-betweens tweened between them —
so the silhouette, palette, anchor and materials hold in every pose and a pose is a real re-drawing
(a hinge turned, a door opened, a paw planted), not the idle frame bent or squashed.

**Act names.** The sequencer's own reactions use the seam's names (`recoil`, `release`, `balk`,
`settle`, `rest`, and `prep` for a move that is answered before it lands); deliveries use
`<act>:<move>` names (`prep:strike`, `exec:sweep`, `cast:silence`, `recover:flood` …) so each move
has its own drawings; reduced motion uses `key:<move>` (one frame). `RB.enemyArt.drawPosed` draws any
act a definition lists in `poses`; `motion()` treats an unknown act as stationary, so the cue's
`travel` alone moves the creature bodily (`poseMotion: 'travel'`).

**Deliveries.** One function per move kind each family's enemies use (`RB.battleSeq.addDelivery`), plus
a `'*'` catch-all. A delivery returns visual cues only (foe acts with durations and travel, effects with
the actual recipients), `contact` and `end`; the sequencer places every rules result at `contact`, in
the rules' order. A Strike met by a ward (`a.wardBlock`) travels a shorter way, meets the seal at the
same contact and plays its `balk`. A Re-tying with nothing to re-tie shows the gesture but no knot
being tied (`a.fv.knots >= a.fv.maxKnots`).

**Reduced motion.** A delivery plays as one held key pose (`key:<move>`) for the length of the move, with no
travel; its effects keep their cues and draw their still forms (a mark where the move lands, at the same moment); the
results arrive at the same contact. The sequencer's own reactions (`recoil`, `release`, `balk`, `prep`, `rest`,
`settle`) hold one drawing each instead of stepping through their poses (unit and browser tests).

## Frame standard per family

| Family | Before (canvas · idle) | After (canvas · idle) | Why the canvas changed |
|---|---|---|---|
| `bell` | 136×204 · 8 @ 140 ms | 212×232 · 10 @ 150 ms | a 0.56 rad swing about the loop, the clapper and strands trailing it |
| `lf_keeper` | 208×228 · 8 @ 150 ms | 236×244 · 8 @ 150 ms | the tendril lash, the rear and the crouch, the wheel above |
| `lantern` | 128×200 · 6 @ 130 ms | 188×224 · 10 @ 140 ms | a 0.34 rad swing about the loop with the tail trailing; the moths of Moth and Lantern |
| `sb_frostlamp` | 184×232 · 8 @ 130 ms | 212×244 · 8 @ 150 ms | rocking onto its toe and heel; the door leaf swung open |
| `lf_conduit` | 144×200 · 8 @ 120 ms | 196×240 · 8 @ 120 ms | the bend from the base, the aimed spout and the hinged valve lid |
| `fox`, `sb_snowfox` | 168×156 · 8 entries of 4 drawings @ 170 ms | 272×204 · 8 @ 160 ms | the leap stretched toward its target, the tail streaming or swung round |
| `hush` | 150×200 · 6 @ 170 ms | 232×236 · 8 @ 160 ms | spreading to 1.4× its width; the sleeve that whips out |
| `sa_hush` | 228×228 · 8 @ 140 ms | 252×252 · 10 @ 140 ms | pages flung into a fan, scattered, pulled into a lance or a pane |
| `atlas_cartographer` | 176×200 · 6 @ 160 ms | 220×236 · 8 @ 160 ms | the chart snapped out over its shoulder; the brush raised |
| `spirit` | 120×160 · 6 @ 160 ms | 140×176 · 6 @ 160 ms | stretch and swell |

Before this work every one of these families had **no authored action frames**: an action bent, slid or squashed the
idle frame through a shared motion style (`sway`, `swing`, `lurch`, `pounce`, `drift`, `pulse`). Idle cadence now sits
at 6.25–8.3 pose changes a second (§9.4); the old idle loops are kept in the record as `before_<family>.webp`.


The creatures already filled most of the stage at scale 1 (one art pixel = 2 CSS px at 1280 × 800),
so the drawing scale was **not** increased: a sitting fox, a hanging lantern or the Keeper is the same
size on screen as before. The canvases grew only to give the authored poses room — a bell swung 0.5 rad
on its loop, a fox stretched in a leap with its tail streaming, the Hush's pages flung out in a fan, the
Conduit's valve lid standing open — and the stage keeps measuring each creature by the pixels of its
first idle frame (`RB.enemyArt.extent`), so the extra room does not move the layout. Every authored frame
is checked to stay inside its canvas (unit test, and the sheet tool's clipping check). The detail added is
at the same density: material-specific shading (cast metal with a lit stripe and verdigris by hue,
paper with strips and ribs lit from the flame inside, fur with a ruff and tufts, iron pipe with collars,
rust and wet streaks, folded map paper with creases, a veil's folds and translucent hem), and the
moving parts that carry the action (hinges, a clapper, a door leaf, a valve lid, a gate wheel, a
sliding sluice plate, tendrils, a skeleton, a chart, a brush, eighteen pages).

## Audit — every enemy id

### Audit

| Enemy | Family · options | Native frame · anchor | Idle | Moves → authored acts (frames) | Condition overlays | Reaction poses | Settle | Disposition |
|---|---|---|---|---|---|---|---|---|
| `atlas.bell` The Borrowed Bell (guardian) | bell · col=#7a8a6a | 212×232 · origin 106,92; ground +84 | 10 poses × 150 ms (1500 ms loop) | **lie** prep:lie×4 exec:lie×5 recover:lie×4<br>**strike** prep:strike×4 exec:strike×4 recover:strike×6<br>**rest** rest×4 (answered: prep → balk)<br>**sweep** prep:sweep×4 exec:sweep×4 recover:sweep×7<br>**charge** cast:charge×8 recover:charge×4 | Gathering orbit + core glow; support tags (softened / eye drawn / headed off) | recoil×4 release×4 balk×4 settle×4 rest×4 prep×4 | authored settle (4 poses), held; the stage fades it to its settled look | **upgraded** — Atlas guardian on the bell rig in verdigris (heavier patina by hue); false promise = sly eyes and a ringing name tag that is not its own; Gathering (its phase-3 tell) held at the top of the arc; phase line unchanged |
| `atlas.cartographer` The Blank Cartographer (guardian) | atlas_cartographer · — | 220×236 · origin 110,128; ground +84 | 8 poses × 160 ms (1280 ms loop) | **rest** rest×4 (answered: prep → balk)<br>**strike** prep:strike×4 exec:strike×3 recover:strike×4<br>**plea** cast:plea×6 recover:plea×4<br>**sweep** prep:sweep×4 exec:sweep×3 recover:sweep×4<br>**shroud** cast:shroud×6 recover:shroud×4 | Shroud mist over its knots; support tags (softened / eye drawn / headed off) | recoil×4 release×4 balk×4 settle×4 rest×4 prep×4 | authored settle (4 poses), held; the stage fades it to its settled look | **upgraded** — Atlas guardian: Strike = chart drawn back and snapped out like a lash; Sweep = one long erasing brush stroke across the party; Shroud = blank sheets fold over it and drift onto its knots; plea = the chart held out flat with one thin road; settle lays the brush down |
| `atlas.fox` Name-borrowing Fox | fox · col=#e8d0a0 | 272×204 · origin 136,104; ground +84 | 8 poses × 160 ms (1280 ms loop) | **lie** prep:lie×4 exec:lie×4 recover:lie×4<br>**rest** rest×4 (answered: prep → balk)<br>**sweep** prep:sweep×4 exec:sweep×4 recover:sweep×5 | support tags (softened / eye drawn / headed off) | recoil×4 release×4 balk×4 settle×4 rest×4 prep×4 | authored settle (4 poses), held; the stage fades it to its settled look | **upgraded** — warm fox wearing the borrowed name as a paper scarf (ends trail behind); Sweep = tail whirl trailing foxfire across the party; false promise = sits up with a leaf on its head and sends a pale double of itself |
| `atlas.lamp` Guttering Lantern | lantern · col=#e8a060 | 188×224 · origin 94,92; ground +84 | 10 poses × 140 ms (1400 ms loop) | **heat** cast:heat×8 recover:heat×4<br>**strike** prep:strike×4 exec:strike×3 recover:strike×6<br>**rest** rest×4 (answered: prep → balk) | Heat pips + rising embers; support tags (softened / eye drawn / headed off) | recoil×4 release×4 balk×4 settle×4 rest×4 prep×4 | authored settle (4 poses), held; the stage fades it to its settled look | **upgraded** — guttering orange lantern; Heat and Strike as the lantern family (the idle flame dips through a guttering shape) |
| `atlas.mothlamp` Moth and Lantern | lantern · col=#d8c0a0 | 188×224 · origin 94,92; ground +84 | 10 poses × 140 ms (1400 ms loop) | **shroud** cast:shroud×8 recover:shroud×4<br>**heat** cast:heat×8 recover:heat×4<br>**strike** prep:strike×4 exec:strike×3 recover:strike×6<br>**rest** rest×4 (answered: prep → balk) | Shroud mist over its knots; Heat pips + rising embers; support tags (softened / eye drawn / headed off) | recoil×4 release×4 balk×4 settle×4 rest×4 prep×4 | authored settle (4 poses), held; the stage fades it to its settled look | **upgraded** — pale lantern with its white moths circling (part of the creature: drawn by flame colour #d8c0a0); Shroud = smoke with the moths whirling out |
| `lf.conduit` Conduit Spirit | lf_conduit · col=#8a90c8 | 196×240 · origin 98,132 dy -6; ground +84 | 8 poses × 120 ms (960 ms loop) | **mend** cast:mend×8 recover:mend×4<br>**silence** cast:silence×7 recover:silence×4<br>**sweep** prep:sweep×4 exec:sweep×4 recover:sweep×6<br>**rest** rest×4 (answered: prep → balk) | knot re-tied (knot icon); Hush mark over the party; support tags (softened / eye drawn / headed off) | recoil×4 release×4 balk×4 settle×4 rest×4 prep×4 | authored settle (4 poses), held; the stage fades it to its settled look | **upgraded** — pipe: Sweep = pressure climbs joint by joint from the base, the spout swings across, a jet arcs over each recipient, drips and a puddle remain; Hush = valve lid shuts, rising light sinks; Re-tying = bends low and pours a thread of light |
| `lf.keeper` The Drowned Bell's Keeper (guardian) | lf_keeper · col=#4a5a52 | 236×244 · origin 118,116; ground +84 | 8 poses × 150 ms (1200 ms loop) | **silence** cast:silence×7 recover:silence×4<br>**strike** prep:strike×4 exec:strike×3 recover:strike×5<br>**lie** prep:lie×4 exec:lie×4 recover:lie×4<br>**rest** rest×4 (answered: prep → balk)<br>**flood** prep:flood×6 exec:flood×4 recover:flood×6<br>**plea** cast:plea×7 recover:plea×4<br>**charge** cast:charge×8 recover:charge×4 | Hush mark over the party; Gathering orbit + core glow; support tags (softened / eye drawn / headed off) | recoil×4 release×4 balk×4 settle×4 rest×4 prep×4 | authored settle (4 poses), held; the stage fades it to its settled look | **upgraded** — guardian: bronze on four pipe tendrils; Strike = one tendril lashes out; Flood (signature) = wheel spins, plate drops, water rolls across both; Hush = wheel winds the plate shut; false yes = bows while a tendril winds the rope away; plea = sinks on curled tendrils; Gathering = wheel wound, seams glow; phase lines unchanged |
| `lf.wraith` Bell Wraith | bell · col=#3c5c8a | 212×232 · origin 106,92; ground +84 | 10 poses × 150 ms (1500 ms loop) | **charge** cast:charge×8 recover:charge×4<br>**sweep** prep:sweep×4 exec:sweep×4 recover:sweep×7<br>**silence** cast:silence×8 recover:silence×4<br>**strike** prep:strike×4 exec:strike×4 recover:strike×6 | Gathering orbit + core glow; Hush mark over the party; support tags (softened / eye drawn / headed off) | recoil×4 release×4 balk×4 settle×4 rest×4 prep×4 | authored settle (4 poses), held; the stage fades it to its settled look | **upgraded** — blue bell: Strike = a ram, lip leading, toll at contact, damped swing home; Sweep = full swing, the toll front passes each recipient; Gathering = held at the top of its arc, bands lit; Hush = strands bind its own mouth |
| `sa.ghost` Nameless Lantern | lantern · col=#9aa8d8 | 188×224 · origin 94,92; ground +84 | 10 poses × 140 ms (1400 ms loop) | **shroud** cast:shroud×8 recover:shroud×4<br>**heat** cast:heat×8 recover:heat×4<br>**strike** prep:strike×4 exec:strike×3 recover:strike×6<br>**rest** rest×4 (answered: prep → balk) | Shroud mist over its knots; Heat pips + rising embers; support tags (softened / eye drawn / headed off) | recoil×4 release×4 balk×4 settle×4 rest×4 prep×4 | authored settle (4 poses), held; the stage fades it to its settled look | **upgraded** — lavender lantern; Shroud = flame gutters, smoke pours over its knots; Heat = rises, paper bellies out, white-hot flame and shimmer; Strike as the lantern family |
| `sa.hush` The Hush (guardian) | sa_hush · — | 252×252 · origin 126,120; ground +84 | 10 poses × 140 ms (1400 ms loop) | **silence** cast:silence×6 recover:silence×4<br>**strike** prep:strike×4 exec:strike×3 recover:strike×4<br>**shroud** cast:shroud×6 recover:shroud×4<br>**mend** cast:mend×6 recover:mend×4<br>**heat** cast:heat×6 recover:heat×4<br>**gust** prep:gust×4 exec:gust×4 recover:gust×4<br>**charge** cast:charge×6 recover:charge×4<br>**lie** prep:lie×4 exec:lie×4 recover:lie×4<br>**mirror** prep:mirror×4 exec:mirror×4 recover:mirror×4<br>**chill** cast:chill×6 recover:chill×4<br>**plea** cast:plea×6 recover:plea×4<br>**flood** prep:flood×6 exec:flood×4 recover:flood×4<br>**sweep** prep:sweep×4 exec:sweep×3 recover:sweep×4 | Hush mark over the party; Shroud mist over its knots; knot re-tied (knot icon); Heat pips + rising embers; Gathering orbit + core glow; support tags (softened / eye drawn / headed off) | recoil×4 release×4 balk×4 settle×4 rest×4 prep×4 | authored settle (4 poses), held; the stage fades it to its settled look | **upgraded** — guardian: thirteen borrowed moves, each a formation of its own pages (lance, fan, pane, vortex, knot-stitch, scatter, tight ring) or a change of the hollow (eye shut, ink welling, embers, rime); dither edge replaced by stepped opacity rings; phase lines unchanged |
| `sa.wraith` Hush Wraith | hush · — | 232×236 · origin 130,112; ground +84 | 8 poses × 160 ms (1280 ms loop) | **silence** cast:silence×7 recover:silence×4<br>**strike** prep:strike×4 exec:strike×3 recover:strike×5<br>**mend** cast:mend×8 recover:mend×4<br>**rest** rest×4 (answered: prep → balk) | Hush mark over the party; knot re-tied (knot icon); support tags (softened / eye drawn / headed off) | recoil×4 release×4 balk×4 settle×4 rest×4 prep×4 | authored settle (4 poses), held; the stage fades it to its settled look | **upgraded** — veil: Strike = gathers tall, lunges, the sleeve wraps the target; Hush = spreads wide, the ring opens to a void, a soundless wave; Re-tying = one hem strip reaches a loose knot |
| `sb.boss` The Lamp That Waited (guardian) | sb_frostlamp · — | 212×244 · origin 106,114; ground +84 | 8 poses × 150 ms (1200 ms loop) | **chill** prep:chill×6 exec:chill×4 recover:chill×5<br>**strike** prep:strike×4 exec:strike×3 recover:strike×6<br>**rest** rest×4 (answered: prep → balk)<br>**plea** cast:plea×7 recover:plea×4 | support tags (softened / eye drawn / headed off) | recoil×4 release×4 balk×4 settle×4 rest×4 prep×6 | authored settle (4 poses), held; the stage fades it to its settled look | **upgraded** — guardian: standing lamp rocking on its stone foot; Chill (signature) = door opens, flame shrinks white, frost breath, door clacks shut; Strike = rock back, tip onto the toe, roof snow flung; plea = ember and a letter at the door; release and settle warm the flame |
| `sb.fox` Snow Fox | sb_snowfox · — | 272×204 · origin 136,104; ground +84 | 8 poses × 160 ms (1280 ms loop) | **strike** prep:strike×4 exec:strike×4 recover:strike×6<br>**rest** rest×4 (answered: prep → balk)<br>**chill** prep:chill×4 exec:chill×4 recover:chill×4 | support tags (softened / eye drawn / headed off) | recoil×4 release×4 balk×4 settle×4 rest×4 prep×4 | authored settle (4 poses), held; the stage fades it to its settled look | **upgraded** — white snow fox on the fox skeleton; breath smokes in the idle; Strike = crouch, spring (travel arc), bite, land on the forepaws; Chill = rear, draw breath, frost breath at the target |
| `sb.ghost` Lantern Ghost | lantern · col=#8ab8f0 | 188×224 · origin 94,92; ground +84 | 10 poses × 140 ms (1400 ms loop) | **strike** prep:strike×4 exec:strike×3 recover:strike×6<br>**lie** prep:lie×4 exec:lie×4 recover:lie×4<br>**mend** cast:mend×8 recover:mend×4<br>**rest** rest×4 (answered: prep → balk) | knot re-tied (knot icon); support tags (softened / eye drawn / headed off) | recoil×4 release×4 balk×4 settle×4 rest×4 prep×4 | authored settle (4 poses), held; the stage fades it to its settled look | **upgraded** — blue-flame lantern; Strike = drawn back, swing through, lick of flame; false promise = a kind painted face and a warm light that turns cold at its target; Re-tying = bows, tail reaches a loose knot (no knot shown when none is loose) |

### Families: anatomy and palette

| Family | Anatomy | Material palette |
|---|---|---|
| sb_snowfox | grounded animal (the fox skeleton): sits, crouches, springs, bites, lands on its forepaws; breath that smokes in the cold | white fur #eef4fa (6 steps, blue-grey shadows), frost tips #dff0ff, blue marks #7a9ac8, eyes #4a7ab0, breath #e2f0ff |
| lantern | hung lantern (constructed): one hinge at the loop, a lagging internal flame seen through the paper, a torn grin, a trailing ghost-flame tail | flame from artOpts.col (blue #8ab8f0 / lavender #9aa8d8 / guttering orange #e8a060 / pale #d8c0a0 with its moths), paper #f4ead0 tinted by the flame (6 steps), dark wood #4a3630, bamboo #8a7048 |
| sb_frostlamp | standing lamp, large boss (constructed): rocks on the edge of its stone foot, a hinged door leaf, roof snow that shakes loose, icicles, an internal cold flame | wood #2e2c3e, paper #d8e8f4 (warms to #f8ecc8), cold flame #8ab8f0 (white when gathering, #f8a040 when released), snow #eef4fa, ice #bcd8ee, stone #6a6878 |
| lf_conduit | pipe (fluid): a fixed base plate, a body that bends from the base, collars at the joints, an aiming spout with a hinged valve lid; pressure climbs from the base; spray, drips and a puddle as residue | iron #3a3850 (6 steps) with #5a5878 lights, rust #8a5a40, spirit light from artOpts.col #8a90c8, water mixed toward #cfe0ff |
| bell | bell (constructed): one hinge at the loop, a lagging clapper on its own hinge, trailing ghost strands | metal ramp from artOpts.col (6 steps, warm lights / cool shadows), verdigris by hue, pale eyes, bone-pink strands |
| lf_keeper | large constructed boss (bell-bronze on four pipe tendrils): body hinge at the crown, turning gate wheel, sliding sluice plate, clapper on a chain, dripping water | bronze #4a5a52 (6 steps), brass #b8984a, verdigris #7fae9a, iron pipe #3a3850, water #a0bee6 |
| hush | cloth / spirit veil: the crown leads, the folds bend and the hem lags; coherent gathering, spreading and return; a sleeve fold that reaches; one hem strip that lengthens | veil #e8e6f0 (6 steps, translucent hem ramps at alpha 170 / 90), ring #1a1830, void #0e0c1a, blank scraps #f0eee6 with a grey line |
| sa_hush | abstract boss: a hollow that swells and contracts, a ring eye that narrows and shuts, eighteen pages on two orbits that leave to form a lance, a fan, a pane, a vortex, a knot-stitch, a scatter, and return | core #0a0a14, indigo #282846, edge #44466a in three stepped opacities (no dither), eye #f0ecff, pages #eeeae0 / #cfcadf (blank, amber, frost and ink tints for the borrowed moves) |
| fox | grounded animal (skeleton): haunch, chest, two-bone forelegs with planted paws, hind foot, head with ears and mouth, a segmented tail; the borrowed name worn as a scarf with trailing ends | fur from artOpts.col #e8d0a0 (6 steps), ruff and tail tip mixed to white, inner ear #b86a70 mix, blue eyes #3a5a8a, vermilion marks #c85a4a, paper scarf #efe4c8 with a #c8503a seal |
| atlas_cartographer | paper / cloth boss: flat creased facets that lean from the hem, panels that swing out and settle, a hood that bows, a chart that bends along its length from the right hand, a brush in the left | paper #e8dcc0 (6 steps; pale #f0e8d4 with o.pale), grid #b4a684, route #8a5a3a, hood #2a2a3a, eyes #9ec4f0, chart #f8f2e2, brush wood #6a4a3a and ink #2a2030, blank sheets #fbf8f0 |
| spirit | spirit (generic veil; unused by the current bestiary): a round head that swells and stretches, a streaming tail | veil from artOpts.col (default #e8e4ff), translucent tail |


## Delivery timings

Foe cues are `act start–end`; *contact* is when the sequencer places the first rules result (a second recipient follows 120 ms later); *end* is the end of the creature's own performance (the action interval).

| Family | Move | Foe cues | Effects (start–end) | Contact | End |
|---|---|---|---|---|---|
| sb_snowfox | chill | prep:chill 0–360<br>exec:chill 360–760 (travel outback 0.08)<br>recover:chill 760–1300 | cbFrostBreath 400–1020 | 700 | 1360 |
| sb_snowfox | strike | prep:strike 0–300<br>exec:strike 300–640 (travel out 0.62)<br>recover:strike 640–1260 (travel back 0.62) | cbBite 600–960 | 620 | 1320 |
| lantern | heat | cast:heat 0–820<br>recover:heat 820–1300 | cbHeatWave 420–1120 | 760 | 1360 |
| lantern | lie | prep:lie 0–300<br>exec:lie 300–720 (travel out 0.16)<br>recover:lie 720–1260 (travel back 0.16) | cbFalseLight 300–860 | 700 | 1320 |
| lantern | mend | cast:mend 0–820<br>recover:mend 820–1300 | cbMend 360–1000 | 760 | 1360 |
| lantern | shroud | cast:shroud 0–860<br>recover:shroud 860–1400 | cbSmoke 300–1200 | 800 | 1460 |
| lantern | strike | prep:strike 0–300<br>exec:strike 300–660 (travel out 0.42)<br>recover:strike 660–1250 (travel back 0.42) | cbFlameLick 440–860 | 620 | 1310 |
| sb_frostlamp | chill | prep:chill 0–560<br>exec:chill 560–980<br>recover:chill 980–1700 | cbFrostBreath 600–1220 | 900 | 1760 |
| sb_frostlamp | plea | cast:plea 0–860<br>recover:plea 860–1500 | cbNote 420–1320 | 780 | 1560 |
| sb_frostlamp | strike | prep:strike 0–360<br>exec:strike 360–700 (travel out 0.18)<br>recover:strike 700–1400 (travel back 0.18) | cbSnowBurst 500–1200 | 680 | 1460 |
| lf_conduit | mend | cast:mend 0–840<br>recover:mend 840–1340 | cbMend 380–1020 | 780 | 1400 |
| lf_conduit | silence | cast:silence 0–840<br>recover:silence 840–1380 | cbToll 480–1100 | 800 | 1440 |
| lf_conduit | sweep | prep:sweep 0–420<br>exec:sweep 420–820<br>recover:sweep 820–1500 | cbJet 460–1280 | 740 | 1560 |
| bell | charge | cast:charge 0–900<br>recover:charge 900–1360 | cbGather 260–960 | 820 | 1420 |
| bell | lie | prep:lie 0–300<br>exec:lie 300–720 (travel outback 0.12)<br>recover:lie 720–1300 | cbToll 380–740<br>cbTag 420–840 | 700 | 1360 |
| bell | silence | cast:silence 0–860<br>recover:silence 860–1380 | cbToll 520–1140 | 800 | 1440 |
| bell | strike | prep:strike 0–300<br>exec:strike 300–700 (travel out 0.48)<br>recover:strike 700–1300 (travel back 0.48) | cbToll 620–1140 | 640 | 1360 |
| bell | sweep | prep:sweep 0–380<br>exec:sweep 380–800 (travel outback 0.14)<br>recover:sweep 800–1560 | cbToll 560–1460 | 760 | 1620 |
| lf_keeper | charge | cast:charge 0–900<br>recover:charge 900–1400 | cbGather 300–1000 | 840 | 1460 |
| lf_keeper | flood | prep:flood 0–600<br>exec:flood 600–1120<br>recover:flood 1120–1900 | cbFlood 640–1640 | 1000 | 1960 |
| lf_keeper | lie | prep:lie 0–320<br>exec:lie 320–780<br>recover:lie 780–1360 | cbPane 420–800 | 760 | 1420 |
| lf_keeper | plea | cast:plea 0–820<br>recover:plea 820–1500 | cbNote 380–1280 | 760 | 1560 |
| lf_keeper | silence | cast:silence 0–860<br>recover:silence 860–1400 | cbToll 480–1120 | 820 | 1460 |
| lf_keeper | strike | prep:strike 0–380<br>exec:strike 380–740 (travel out 0.12)<br>recover:strike 740–1360 (travel back 0.12) | cbLash 470–1030 | 700 | 1420 |
| hush | mend | cast:mend 0–840<br>recover:mend 840–1320 | cbMend 380–1020 | 780 | 1380 |
| hush | silence | cast:silence 0–840<br>recover:silence 840–1380 | cbToll 420–1060 | 780 | 1440 |
| hush | strike | prep:strike 0–340<br>exec:strike 340–680 (travel out 0.46)<br>recover:strike 680–1300 (travel back 0.46) | cbWrap 620–1140 | 660 | 1360 |
| sa_hush | charge | cast:charge 0–860<br>recover:charge 860–1360 | cbGather 260–980 | 800 | 1420 |
| sa_hush | chill | cast:chill 0–820<br>recover:chill 820–1320 | cbFrostBreath 460–1080 | 760 | 1380 |
| sa_hush | flood | prep:flood 0–600<br>exec:flood 600–1120<br>recover:flood 1120–1960 | cbFlood 660–1720 | 1040 | 2020 |
| sa_hush | gust | prep:gust 0–480<br>exec:gust 480–1000<br>recover:gust 1000–1640 | cbPageGust 560–1420 | 900 | 1700 |
| sa_hush | heat | cast:heat 0–840<br>recover:heat 840–1340 | cbHeatWave 420–1140 | 780 | 1400 |
| sa_hush | lie | prep:lie 0–420<br>exec:lie 420–800<br>recover:lie 800–1340 | cbPane 460–800 | 760 | 1400 |
| sa_hush | mend | cast:mend 0–860<br>recover:mend 860–1400 | cbMend 420–1040 | 800 | 1460 |
| sa_hush | mirror | prep:mirror 0–420<br>exec:mirror 420–820<br>recover:mirror 820–1380 | cbMirror 460–980 | 780 | 1440 |
| sa_hush | plea | cast:plea 0–860<br>recover:plea 860–1480 | cbNote 480–1380 | 800 | 1540 |
| sa_hush | shroud | cast:shroud 0–880<br>recover:shroud 880–1440 | cbPageFog 380–1280 | 820 | 1500 |
| sa_hush | silence | cast:silence 0–880<br>recover:silence 880–1440 | cbToll 460–1140 | 820 | 1500 |
| sa_hush | strike | prep:strike 0–480<br>exec:strike 480–800 (travel outback 0.1)<br>recover:strike 800–1360 | cbPageLance 520–1080 | 760 | 1420 |
| sa_hush | sweep | prep:sweep 0–480<br>exec:sweep 480–860<br>recover:sweep 860–1520 | cbPageFling 560–1380 | 800 | 1580 |
| fox | lie | prep:lie 0–320<br>exec:lie 320–780<br>recover:lie 780–1340 | cbDouble 360–980 | 760 | 1400 |
| fox | sweep | prep:sweep 0–340<br>exec:sweep 340–780 (travel outback 0.16)<br>recover:sweep 780–1420 | cbFoxfire 480–1280 | 720 | 1480 |
| atlas_cartographer | plea | cast:plea 0–860<br>recover:plea 860–1500 | cbNote 460–1360 | 800 | 1560 |
| atlas_cartographer | shroud | cast:shroud 0–860<br>recover:shroud 860–1420 | cbPageFog 360–1260 | 800 | 1480 |
| atlas_cartographer | strike | prep:strike 0–380<br>exec:strike 380–680 (travel out 0.12)<br>recover:strike 680–1320 (travel back 0.12) | cbChartLash 470–1030 | 660 | 1380 |
| atlas_cartographer | sweep | prep:sweep 0–420<br>exec:sweep 420–800 (travel outback 0.1)<br>recover:sweep 800–1480 | cbErase 520–1380 | 760 | 1540 |
| spirit | heat | cast:any 0–760 | cbGather 200–800 | 640 | 1160 |
| spirit | strike | prep:strike 0–300<br>exec:strike 300–620 (travel out 0.45)<br>recover:strike 620–1200 (travel back 0.45) | cbWrap 580–1040 | 600 | 1260 |
| spirit | sweep | prep:strike 0–320<br>exec:strike 320–740 (travel outback 0.3)<br>recover:strike 740–1300 | cbToll 500–1300 | 700 | 1360 |

Reactions placed by the sequencer use the family's authored poses: `rest` 700 ms (4 poses), an answered move `prep` 320 ms → `balk` 380 ms, `recoil` 260–360 ms, `release` 420–500 ms, `settle` 760 ms (held).


## §22.4 art review rubric — SELF-REVIEW (not a human review)

**Self-review by the implementing agent, not a human review.** Reviewed at native size and 3× (`keys_*.webp`,
`sheet_*.webp`), in battle at 1280 × 800 on a slowed presentation clock (`strip_*.webp`), and once in real time
(`keeper_flood_exchange.webm`); one family in a narrow portrait window, 390 × 844 (the Snow Fox's Strike,
`strip_sb.fox_strike_narrow.webp`: the leap scales with the real distance, but the drawing does not shrink, so the fox
covers most of the small stage and overlaps you at the bite). **Not reviewed:** the other families at phone sizes (the
layouts are exercised by `battle_group.mjs`, which passes), real devices, other browsers. Scores 0 missing ·
1 inconsistent · 2 coherent · 3 notably polished; the target is 2 everywhere.

| Family | Silhouette & identity | Form & materials | Weight & anchors | Action identity | Secondary motion | Outcome truthfulness | Language visibility | Scene integration |
|---|---|---|---|---|---|---|---|---|
| bell | 3 | 2 | 3 | 3 | 2 | 3 | 2 | 2 |
| lf_keeper | 3 | 2 | 2 | 3 | 2 | 3 | 2 | 2 |
| lantern | 3 | 2 | 3 | 3 | 2 | 3 | 2 | 2 |
| sb_frostlamp | 2 | 2 | 3 | 3 | 2 | 3 | 2 | 2 |
| lf_conduit | 3 | 2 | 3 | 3 | 2 | 3 | 2 | 2 |
| fox / sb_snowfox | 2 | 2 | 3 | 3 | 2 | 3 | 2 | 2 |
| hush | 2 | 2 | 2 | 3 | 2 | 3 | 2 | 2 |
| sa_hush | 3 | 2 | 2 | 3 | 3 | 3 | 2 | 2 |
| atlas_cartographer | 2 | 2 | 2 | 3 | 2 | 3 | 2 | 2 |
| spirit (unused) | 2 | **1** | 2 | **1** | 2 | 3 | 2 | 2 |

Notes behind the scores:
- *Outcome truthfulness* is 3 where it is tested, not judged: results arrive only at the delivery's contact on the
  actual recipients; a ward stops a Strike at the seal (no impact); a Re-tying with nothing loose shows no knot tied;
  effects never name anyone the move does not reach (unit test). The generic reaction marks (impact, sealBlock,
  frost, numbers) are the sequencer's.
- *Form & materials* is 2 throughout: shading is grouped light/mid/shadow per material (metal with a lit stripe and
  verdigris, paper lit from the flame inside, fur with a ruff and tufts, iron with collars and rust, creased map paper,
  a translucent hem), but some large planes stay flat (the bell's body, the lamp's frame, the Keeper's skirt), the
  fox's leaping body reads as a tube, and the veil's sleeve joins its shoulder bluntly.
- *Language visibility* is 2: no creature effect covers the response cards or the intent text, and they play in
  the creature's own interval, not during your written response; the plea and false-promise notes carry no glyphs.
- *Scene integration* is 2: on the light Atlas and still-archive backdrops the Cartographer's erasing stroke needed an
  ink edge to read; the snow fox is large on the stage when it leaps (its travel is 0.62 of the way).
- *spirit* is below target and recorded as such: no enemy uses it, so it got a modest rig and generic deliveries.


## Cache budget and resources (§21.4, §21.5)

| Family | Frame | Idle frames | Authored action frames | One frame | Idle set | Every frame |
|---|---|---|---|---|---|---|
| sb_snowfox | 272×204 | 8 | 79 | 217 KiB | 1.69 MiB | 18.42 MiB |
| lantern | 188×224 | 10 | 90 | 165 KiB | 1.61 MiB | 16.06 MiB |
| sb_frostlamp | 212×244 | 8 | 68 | 202 KiB | 1.58 MiB | 15.00 MiB |
| lf_conduit | 196×240 | 8 | 64 | 184 KiB | 1.44 MiB | 12.92 MiB |
| bell | 212×232 | 10 | 95 | 192 KiB | 1.88 MiB | 19.70 MiB |
| lf_keeper | 236×244 | 8 | 104 | 225 KiB | 1.76 MiB | 24.60 MiB |
| hush | 232×236 | 8 | 62 | 214 KiB | 1.67 MiB | 14.62 MiB |
| sa_hush | 252×252 | 10 | 179 | 248 KiB | 2.42 MiB | 45.78 MiB |
| fox | 272×204 | 8 | 79 | 217 KiB | 1.69 MiB | 18.42 MiB |
| atlas_cartographer | 220×236 | 8 | 70 | 203 KiB | 1.58 MiB | 15.45 MiB |
| spirit | 140×176 | 6 | 36 | 96 KiB | 0.56 MiB | 3.95 MiB |

Every frame of every family at once would be 204.9 MiB, but RB.enemyArt keeps at most 140 canvases (least recently used first out): at the largest frame that is 33.9 MiB, inside the 48 MiB budget, and an encounter uses only its own creatures' idle sets plus the moves they perform.


**Cache.** All frames go into `RB.enemyArt`'s shared cache (140 canvases, least recently used out first; keys are
creature, options, act, frame and side — never time or particle positions). Its worst case at this area's largest frame
(252 × 252) is **33.9 MiB**, inside the 48 MiB budget; an encounter needs its creatures' idle sets (1.4–2.4 MiB each)
plus the moves they actually perform (a move is 10–25 frames, 2–6 MiB). Backdrops are not counted here.

**Prewarm.** While you choose (the scene's `calm` / `enter` presentation events), the frames of each creature's
telegraphed move and of its reactions are built in ≤ 6 ms slices 24 ms apart, and the queue is cleared at the scene's
exit. Frame build time in Chromium on this (heavily loaded) machine: median 3–50 ms per frame by family (worst the
foxes and the Lamp), so without prewarm a move's first frames could each cost a dropped frame.

**Measured (browser test `resources`, 8 battles in one page, Normal speed, Mio):**


| Guardian / creature | Move | Frames drawn during its move | Frames of the move built during it | Any family frame built during it | Longest gap between frames (ms) | Longest frame of the exchange (ms) |
|---|---|---|---|---|---|---|
| lf.keeper | flood | 95 | 0 | 0 | 121 | 77.2 |
| sa.hush | gust | 95 | 0 | 0 | 76 | 36.8 |
| atlas.cartographer | sweep | 86 | 0 | 0 | 65 | 12.3 |
| sb.boss | chill | 101 | 0 | 0 | 78 | 7.1 |
| atlas.bell | sweep | 78 | 0 | 0 | 94 | 52.3 |
| lf.keeper | strike | 71 | 0 | 0 | 133 | 83.6 |
| atlas.mothlamp | heat | 75 | 0 | 0 | 64 | 17.3 |
| sb.fox | strike | 64 | 0 | 0 | 90 | 56.6 |


- *Frames of the move built during it* = 0 in every run: everything the move needed was prewarmed while choosing
  (asserted).
- *Longest gap between frames* is reported, not asserted: the machine's load average was 20–35 during these runs
  (five workers testing at once), and the gaps came and went between identical runs; an instrumented run attributed
  the long frames to the stage as a whole and to the party's battler drawing, never to a creature frame build.
- After the 8 entries and exits: no sequencer timers, input layer, pointer hook, effect layers, word strips or
  prewarm queue remain (asserted).
- No `performance.memory` figure is reported: the arithmetic above is the estimate the brief asks for, not a
  measurement of process memory.


## Commands and results

| Command | Result |
|---|---|
| `node tools/build.mjs` | builds `index.html` (not committed here; generated) |
| `node tests/run-unit.mjs creatures_b` | 941 passed, 0 failed |
| `node tests/run-unit.mjs` | 8939 passed, 1 failed (the recognizer's timing check under load; run alone afterwards: recog-accuracy 64 passed, 0 failed, p95 52.98 ms) — the one failure is the handwriting recognizer's timing check (`p95 recognize() time < 60 ms`, measured 84.65 ms) on a machine with load average ~20–35; nothing in this area touches recognition |
| `node tests/run-unit.mjs battle_seams` | 12 passed, 0 failed |
| `node tests/e2e/battle_creatures_b.mjs` | 25 passed, 0 failed |
| `node tests/e2e/battle_creatures_b.mjs <enemy> --shots` | strips of one move per enemy (tests/e2e/out/battle_creatures_b/) |
| `node tests/e2e/battle_creatures_b.mjs "sb.fox (" --shots --narrow` | 1 passed, 0 failed (390 × 844 window) |
| `node tests/e2e/battle_group.mjs` | 6 passed, 0 failed |
| `node tests/e2e/combat_ui.mjs` | 7 passed, 0 failed |
| `node tests/e2e/story_ch4.mjs F mio`, `story_ch5.mjs F mio`, `story_ch6.mjs 0` | pass (auto-resolved battles: they check the content edits, not the art) |
| `node tests/e2e/creatures_b_sheets.mjs --docs` | every family's sheets; no clipped frame, no page errors |
| `node tests/e2e/creatures_b_video.mjs <out.webm> lf.keeper:flood` | real-time recording, no page errors |
| `node tools/creatures_b_audit.mjs` | the audit, timing and budget tables in this record |

The browser test (`battle_creatures_b.mjs`) — **diagnostic fixtures, labelled in the file**: each battle is started
directly in a synthetic campaign (`RB.game.debugStart` + `RB.game.startBattle`) with Mio, the move under test is set as
the creature's intent before the round, and between rounds both of you are topped up, the Hush on the party is lifted
and knots are kept from running out. Responses are chosen and answered with the real mouse (Unravel; water for an
unanswered rest; light when the mist hides the knots), and Mio's turn is taken with the real mouse. It covers:
every enemy × every move it uses (55 enemy–move pairs; each of the 12 rests both unanswered and answered), the ward path for every Strike (8 families),
reduced motion (one held key pose, no travel, the same results), an Atlas trio on Demanding (Moth and Lantern, the
Name-borrowing Fox, the Guttering Lantern) and the resources check. Every check reads the rules' results (the
`enemyAct` fx) against the sequence's beats, and the display against the rules at the end.


## Evidence (docs/screenshots/battle/creatures_b/)

| File | What it shows |
|---|---|
| `keys_<family>.webp` | key poses at 3× (idle, then the held pose of each move) |
| `keys1x_<family>.webp` | the same key poses at native size, one row per variant (e.g. the four lanterns, the two bells) |
| `sheet_<family>.webp` | every idle and authored action frame at native size, one row per act (lossy WebP, q 0.85) |
| `before_<family>.webp` | the old idle frames (at 2×), for comparison |
| `strip_<enemy>_<move>.webp` | one move per enemy in battle at 1280 × 800, captured at fixed presentation times (clock slowed to 0.1× for the capture) |
| `atlas_group.webp` | the Atlas trio fixture (diagnostic) |
| `strip_sb.fox_strike_narrow.webp` | the Snow Fox's Strike in a narrow portrait window (390 × 844), same fixture |
| `keeper_flood_exchange.webm` | real time, Normal speed: the Keeper's telegraphed Flood, Unravel answered with the mouse, Mio's turn, your response, her draught, the Flood (diagnostic fixture) |

Scratch captures, timing traces (`timings.json`), the resources figures (`perf.json`) and logs are in
`tests/e2e/out/battle_creatures_b/` (not committed).


## Limitations

- **No human review.** The rubric above is a self-review; no one else has looked at these creatures, at any size.
  Of the phone sizes only the Snow Fox's Strike in a 390 × 844 window was looked at: on that small stage the larger
  creatures (the foxes, the Keeper, the Hush) take most of it, because the stage keeps whole-pixel scale 1 there and
  the drawings were not made smaller.
- **Machine load.** All browser runs were on a 4-core machine shared by five workers (load average 20–35): frame-gap
  figures are not meaningful performance measurements; per-frame build times are pessimistic.
- **First use outside the prewarm.** Idle frames are built when the battle opens, and a reaction the prewarm did not
  queue (e.g. `settle`) is built when first shown; at 3–50 ms a frame that can cost a dropped frame once.
- **Moth and Lantern** is recognised by its flame colour (`#d8c0a0`) because its `artOpts` (src/atlas/10_data.js,
  outside this area) carry no variant flag; adding `moths: true` there is the clean hook (the rig already reads it).
- **Act names** beyond the seam's nine (`<act>:<move>`, `key:<move>`): `drawPosed` draws any act a definition lists;
  `motion()` treats them as stationary, so only `travel` moves the creature. Recorded here in case the seam changes.
- **Reduced motion and the cache:** the sequencer's reactions hold one drawing when reduced motion is on; the frame
  cache does not key on the setting, so the families' caches are cleared when it changes (checked as a battle enters
  and each round becomes calm). A change made in the middle of a round shows the previous variant until the next round.
- **An answered rest** (Unravel answers a rest in the rules) plays as the sequencer's answered move — the family's
  wind-up and balk with a fizzle — not as a rest; the authored rest shows when the rest goes unanswered.
- **Phase changes** keep their authored lines and teaching cards; no extra visual transition was added between phases.
- **`spirit`** is unused and below the rubric target (recorded above).
- **index.html** is not committed (generated).


## Merge notes (shared files touched)

- `src/ui/82_battle_seq.js` (integrator): **one line** in `fire1` — a `foe` cue's `travel` is now passed to
  `RB.battleStage.foe(…)` (`travel: c.travel`). The seam documented `travel` on foe cues and `83_battle_stage.js`
  reads it, but `fire1` dropped it, so no delivery could move a creature bodily. Creature worker A needs the same line;
  identical edits merge cleanly.
- `src/content/ch4/05_art.js`, `src/content/ch5/12_tower.js`, `src/content/ch6/10_world.js` (this area's): the old
  battle definitions of `sb_frostlamp`, `sb_snowfox`, `lf_conduit`, `lf_keeper` and `sa_hush` are removed and replaced
  by a pointer comment — `content` loads after `ui`, so a re-`def` in a `78*` file would have been overridden. The
  overworld prop painters and sprites in those files are untouched.
- Everything else is new files: `src/ui/78m_*`–`78t_*`, `78z_*`, `84m_*`, `tests/unit/creatures_b.test.mjs`,
  `tests/e2e/battle_creatures_b.mjs`, `creatures_b_sheets.mjs`, `creatures_b_video.mjs`, `tools/creatures_b_audit.mjs`,
  this record and `docs/screenshots/battle/creatures_b/`.
- New global: `RB.creaturesB`. Effects use the `cb` prefix. The kit listens (read only) to `RB.bus`
  `present:scene` for the prewarm and the reduced-motion cache check; it never emits.
- With the integrator's newer work (inert banner and word strip, per-creature intent badges at each creature's resting
  place that never follow its travel): no interaction expected; the travel here moves only the creature's drawing and
  its shadow, from live anchors.

