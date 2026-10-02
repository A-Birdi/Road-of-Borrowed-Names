# Creatures B — Chapters 4–6 and the Atlas (battle addendum §5, §6, §9, §10, §21.4–21.5, §22.4, §23.5)

**Area:** creature worker B (`docs/BATTLE_ART_CONTRACTS.md`). **Families:** `sb_snowfox`, `lantern`,
`sb_frostlamp`, `lf_conduit`, `bell`, `lf_keeper`, `hush`, `sa_hush`, `fox`, `atlas_cartographer`,
`spirit` — every enemy of `docs/battle/INVENTORY.md` that uses them (14 enemy ids, 5 of them guardians).
**Base:** `982c8df` (the seams commit). Every claim below says how it was checked: *unit test*,
*browser test* (the built `index.html` in Chromium via Playwright), or *review* (looking at captures).

<!--RESULTS-->

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

## Frame standard per family

<!--BUDGET-->

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

<!--AUDIT-->

## Delivery timings

<!--TIMINGS-->

## §22.4 art review rubric — SELF-REVIEW (not a human review)

<!--RUBRIC-->

## Cache budget and resources (§21.4, §21.5)

<!--RESOURCES-->

## Commands and results

<!--COMMANDS-->

## Evidence (docs/screenshots/battle/creatures_b/)

<!--EVIDENCE-->

## Limitations

<!--LIMITS-->

## Merge notes (shared files touched)

<!--MERGE-->
