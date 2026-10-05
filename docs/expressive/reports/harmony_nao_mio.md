# Harmony stage performances v2 — Nao and Mio (the owner's review of 2026-10-03)

The owner: "Suzu and Ren's animations look great in battle — Nao and Mio's feel a tad lacking in comparison."
The lead's diagnosis (from the frame crops of the first build's recordings): Nao's `opening` barely differed
from their ordinary point and lunge from behind, their ink circle and threads read like a plain Unravel, and "two
knots at once" had no moment of its own (a short ochre line after contact); Mio's vial was tiny at play scale,
her eye-level and pouring keys hardly differed, the pour went only to you as a few 2-px drops, and the payoff
read only as a number on one of you.

This note is the worker's validation record for the change, in the style of VALIDATION.md. It does not tick
CONTRACT.md boxes; the lead integrates.

## What changed

Presentation only. No rule, no rules' fx event or its order, no save data and no setting changed; each result is
still one beat, placed once. Ren's and Suzu's performances are untouched (their `TECH` rows, gestures and effects
are as before; the only shared code touched is `pJoin`, whose new fine variant is used by Nao and Mio alone, and
`pSteam`'s `wash` branch, which only Mio's technique passes).

**Nao — Read the Opening** (`BY.nao.opening`, `TECH.nao`; Normal, presentation ms from the technique's start):
- 400–780: their right hand up to their ear and the courier pencil taken from behind it (their portrait keeps a pencil
  there; the battle rig now draws one in their hand, `prop.pencil`, in the prop layer — only while they hold it);
  brought out before their shoulder as they begin to turn, the weight dropped.
- 780–888: turned sharply side-on (`turn` 54°, the rig's own side view, read from behind), a step in with the right
  foot, the back foot kept where it stood through the turn, the pencil arm high, the other arm swung back.
- 888–1,320: the pencil sketches the route, ticking twice (1,032 — the cue — and 1,176); held at the route's end.
- 1,850–2,350: the pencil back behind their ear with a glance to you, a short nod, the ready stance.
- Effects: `pCourier` — a dashed gold route sketched at the pencil's pace from where the pencil started, out over
  the party, a waypoint pin landing on each knot that really comes loose (two; when only one is left, the one), then
  up to the creature, where a ring closes round the opening; `pThreadRoute` — your thread follows the route to
  those knots and reaches them just before they go; the two knots go together at 1,300 in one shared burst,
  `pKnotPair` (both `knotRelease` cues at the same moment), only when two really come loose (the existing truth
  check: the unravel fx's `n` and the knots shown ≥ 2); `pRead` at the technique's beat (1,450): the ring pulled
  tight round the opening. The plain Unravel's `pSpot`/`pThread` and the old `pRoute` are no longer used here
  (`pSpot` stays for their support action). Sounds from the existing set: `pen_down` 600, `pen_stroke` 890,
  `pen_up` 1,320.

**Mio — Clearwater Draught** (`BY.mio.draught`, `TECH.mio`):
- 350–750: a hand to the bottles at her hip; the vial — drawn larger in this technique (`prop.vialBig`: about
  1.5 art px wider and 3 longer) — raised to eye level and cupped as she turns.
- 750–1,350: uncorked (834); lifted high over her head, side-on, risen a little (978); tipped — the cue at 1,020
  as the stream leaves — and poured, her free hand spread over you both (1,110); held, still tipping.
- 1,920–2,360: the cork back before her chest, the vial to her hip with a small satisfied nod, her head up, the
  ready stance.
- Effects: `pCascade` (1,020–1,920) — the pour, to you both (also when both are full: the pour is the act): a
  clear stream arcs from the vial's lip high over the party, breaks into a shimmering fall of drops and streaks
  over each of you, with ripples at both pairs of feet; `pDrop` — your ink carries one drop of it to the knot,
  landing at the contact (1,250); the restoring at the technique's beat (1,400) — `motes`, `pRefill` (clear water
  rising round you) and the `soothed` pose — only on one of you who was below full, the numbers from the applied
  change (the `low` logic unchanged); the washing — `pWash`, a rinse over each creature that really had Heat, mist
  or Gathering, naming what it had, then the existing steam (Heat, now a fuller hiss), mist parting and scatter
  (Gathering). `pPour` into you alone is no longer used here (it stays for her support actions).

**Both:** the shared braid (`pJoin`) is drawn fine (`soft`) under these two techniques so their own carrier leads.
Totals: Nao 2,350 ms (Fast 1,643 ms of wall time), Mio 2,400 ms (Fast 1,678); Instant none. Reduced motion: three
held, distinct keys each (Nao: the pencil out before their shoulder / the route's end / the pencil back behind their ear
with a glance to you; Mio: the vial at eye level / high and tipped / the nod with the vial at her hip), the effects
as still marks (the whole route with its pins and ring; the arc, a few drops and a ripple at each of your feet; the
rinse as a few still drops). The paired portrait (0–780 ms) and the rule that the contact never comes before it is
gone are unchanged (first results at 1,300 and 1,250). (Since Robin's decision of 2026-10-05 the portrait lasts 1,400 ms
at Normal and the stage waits for it: these performances now start 220 ms (Nao) and 270 ms (Mio) later, their first
results at 1,520; docs/harmony/contract/CONTRACT.md §4.)

**Files:** src/engine/34m_battler_moves.js (NAO_EAR, NAO_A, NAO_K, NAO_SKETCH, `opening`; MIO_A, MIO_K,
`draught`), src/engine/34_battlers.js (the pencil prop and its release point; `vialBig`),
src/ui/84p_party_choreo.js (TECH.nao / TECH.mio, the technique's carriers, Nao's knots going together, Mio's
restoring and washing beats), src/ui/84p_party_fx.js (pCourier, pThreadRoute, pKnotPair, pRead, pCascade, pDrop,
pRefill, pWash; pJoin `soft`; pSteam's wash; pRoute removed), tests/unit/harmony_timing.test.mjs (updated, below),
tests/e2e/harmony_perf_sheets.mjs (new: before/after sheets, and `--check`), docs/expressive/HARMONY.md §7, §7.1,
§7.3; the evidence below.

## Runs

All on this worktree branch, headless Chromium (Playwright's preinstalled build) on the shared 4-core machine while
other workers ran their own browser tests — load averages between about 4 and 22 during these runs. Build: the
`index.html` committed at 6385e24 (byte-identical through the later commits, which change only a test tool and docs;
`node tools/build.mjs` reproduces it).

- **Unit / content:** `node tests/run-unit.mjs` 24,322 passed, 0 failed (final sources); `harmony_timing` 89 checks,
  updated (below). An earlier full run, before a fix, had 1 failure: battle_party's "planted on the anchor" — Nao's
  signature frame's lowest row was 103, two art px below the anchor once they turned side-on. The turned feet now sit
  along the line of the turn, the back foot kept where it stood; every frame of both gestures re-measured in node:
  lowest row 100–102, inside the frame. `node tools/validate.mjs`: no errors.
- **`node tests/e2e/battle_invariance.mjs --tech`:** 96 configurations (4 pairings × 1 / 3 creatures × Normal / Fast /
  Instant × motion × the portrait On / Off), 8 fixtures, **every fixture identical** — twice: on 9cf99b1 and on the
  final build 6385e24.
- **`node tests/e2e/harmony_cutin.mjs --docs`** (final build, load about 9–12): **11/11** (core: 24 configurations plus
  the portrait Off and a pet shown / hidden; never; geometry; plan; frozen; life; cycles; setting; dev viewer; painted
  sample; evidence). Measured: first results Nao 1,300–1,317 ms (Fast 1,311), Mio 1,250–1,267 (Fast 1,263); the
  portrait disposed at 783–800 ms (Normal; frame resolution) and 691 (Fast), before the first result in every
  configuration; sequence ends 2,350 (Nao) and 2,400 (Mio); wall times 2,354 / 2,403 ms Normal, 1,634 / 1,663 ms Fast,
  4 / 11 ms Instant.
  - Earlier runs of the same test on the same build, under heavier load, were not clean; as they were:
    - the plain run (load about 9): 8/10 — *geometry* failed ("390×844 200 %: the layout differs from the same scene
      with the portrait Off": 1 layout with it On, 2 with it Off; Mio's pairing; the portrait was not shown in either run —
      with it On it was placed, then withdrawn for the banner) and *painted sample* failed (Suzu's synthetic sample at 390×844 @3x: 1 frame
      within 12 px of the responses dock). Each re-run alone right after: geometry 1/1, painted sample 1/1.
    - a first `--docs` run (load 17–22): 10/11 — *geometry* failed again, differently: 768×1024 with Ren (unchanged by
      this work), 1 frame within 12 px of the responses dock; and 390×844 200 % Mio with 2 layouts On and 1 Off (the
      reverse of the first time). Its evidence was overwritten by the clean run above.
    - My reading: timing races between the dock's slide and the sampled frames under load — they flip direction
      between runs and involve a pairing I did not touch. Not proven: I did not run those sections on the base commit
      under the same load.
- **`node tests/e2e/battle_party.mjs`:** 14/14 (frame cache in its fixtures: nao 184 frames / 5.84 MiB, mio 197 /
  6.25 MiB, against the 48 MiB budget).
- **`battle_anim.mjs`:** 16/16. **`battle_presentation.mjs`:** 13/13. **`combat_ui.mjs`:** 7/7.
  **`playtest_repairs.mjs`:** 7/7. **`battle_overlap.mjs`:** all ok (96 checks). **`battle_cycle.mjs`:** stable — from
  battle 5 to 20 listeners 104 → 104, nodes 247 → 245.
- **`node tests/e2e/harmony_perf_sheets.mjs --check`** (new diagnostic; Normal, real time, the portrait On, a pet (the
  cat) in battle, a ward before each of you): Nao — 56 frames of their performance (anticipate / act / recover of
  `opening`), the ward marks of both of you drawn in all 56, their chest anchor between their head and feet and within
  40 px of their foot point in all 56, the pet's technique reaction recorded once; Mio — 67 frames, the same results.
  (Frame counts are what the loaded machine drew in 2.35–2.4 s.)

`tests/unit/harmony_timing.test.mjs`, what changed (nothing loosened; the old checks named the retired `pRoute` and
Nao's final `point`):
- Nao, two knots: the route's waypoints are those two knots; your thread follows the same route and reaches them at
  most 80 ms before they go; both `knotRelease` cues at the same moment; one `pKnotPair` on that pair at that moment.
  One knot left: one waypoint, one contact, no shared burst. The route's ticks land before the knots go; no `pSpot`
  in the technique.
- Nao's body: the pencil taken at their ear (the hand above 55 units, the pencil in hand; none in the stance); weight
  dropped, turned side-on (≥ 45°) with a step in, the pencil out high and forward at the route's end; the pencil ticks
  twice; the recovery puts it back behind their ear with a glance to you, then a nod. (Replaces "a precise point at the
  end".)
- Mio: the pour (`pCascade`) goes to you both also when both are full; your ink's drop (`pDrop`) lands on the knot at
  the contact; no `pPour`. `pRefill` joins `motes`/`soothed` in "only on one of you below full"; `pWash` joins the
  washing checks and names what each creature had (`0:heat`, `1:mist+gather` in the fixture), and nothing when both
  are full and the creature has nothing. Her body: the vial (drawn larger) lifted above 62 units, side-on, the free
  hand spread; the cork back, the vial at her hip and a nod.

## Evidence

- `docs/screenshots/harmony/cutin/perf_v2/` — before / after frame sheets, the portrait Off, the presentation clock at
  ×0.25 so each sampled moment is exact, the stage (party and creature) at native size, labelled with presentation
  ms: `nao_before_1280x720.webp`, `nao_after_1280x720.webp`, `nao_before_390x844.webp`, `nao_after_390x844.webp`, the
  same four for Mio, and `nao_after_reduced_1280x720.webp`, `mio_after_reduced_1280x720.webp` (reduced motion);
  about 250–300 KB each. "Before" is the build at c2a799d (the base of this work), "after" the final build, with the same
  synthetic fixture (the Mill's Flour Moth, 6 knots, Harmony full; for Mio, you at 7 of 12 and the moth with Heat, mist
  and Gathering, so each of her beats has something real to show). `sheets_before.json`, `sheets_after.json` and
  `sheets_after_reduced.json` record the sampled times and crops. Remake with
  `node tests/e2e/harmony_perf_sheets.mjs [--html <a build> --tag before] [--reduce]`.
- `docs/screenshots/harmony/cutin/` — re-recorded by the clean `--docs` run: `technique_{nao,mio,ren,suzu}_normal_1280x720.webm`
  (real time, recorded on the loaded machine), `stage_*_portrait_off.webp`, `compact_390x844_ren.webp`,
  `cutin_results.json`.
- docs/expressive/HARMONY.md §7 (files), §7.1 (the Nao and Mio rows re-measured), §7.3 (the new performances with
  times, the reduced-motion keys, and why v2).

## Ledger rows (CONTRACT.md §9–§10) advanced — the lead decides the ticks

- **HX20** (rules unchanged): preserved and re-checked — invariance `--tech` 96/96 identical on the final build; each
  result still one beat in the rules' order (harmony_timing). Status: still satisfied.
- **HX22** (Nao — Read the Opening): advanced — the pencil from behind their ear, a side-on turn with a step, the route
  sketched with a tick on each knot that really comes loose, your thread along it, the two knots together in one
  shared burst only when two do, a short confident recovery; targeted in groups (unit: every effect on the one
  creature). Status: built and machine-tested; **not judged by a person**.
- **HX23** (Mio — Clearwater Draught): advanced — a larger vial, three distinct silhouettes, the pour to both, a drop to
  the knot, the restoring only where it restores, a rinse only where it washes something off. Status: built and
  machine-tested; **not judged by a person**.
- **HX26** (≥ 3 purposeful silhouettes per companion, distinct by body mechanics): advanced for Nao and Mio (three keys
  each with in-betweens; the four signature silhouettes still differ pairwise by > 150 px in the unit test). Ren and
  Suzu unchanged. Status: partial until a person judges readability at play scale.
- **HX27** (party reactions, status marks, pets): advanced for these two techniques — the ward marks drawn through
  every frame of both performances and anchored on the figure, the pet's technique reaction recorded (`--check`); no
  new sounds, existing accents only. Status: partial (the row's other items were not re-examined here).
- Not touched: HX21 (your rally terminals unchanged), HX24, HX25.

## Not verified

- A person's judgement of the new performances — whether Nao and Mio now read as well as Suzu and Ren at play scale.
  Everything above is headless Chromium on a loaded shared machine; the sheets are self-reviewed.
- Firefox, Safari, a physical phone (390×844 and 844×390 are emulated viewports); frame rate on a real device. The
  real-time WebMs were recorded on a loaded machine and may show fewer drawn frames than a phone would.
- The geometry / painted-sample failures above were judged timing races from their pattern, not proven on the base
  commit.
- Groups: Nao's route in a group of three and Mio's washing over several creatures were checked in node (unit) and by
  the invariance runs (rules), not looked at in a capture.
- Sound: the added accents (`pen_down`, a second `pen_stroke`) were not listened to.
- Incident, for the lead: at about 18:03 UTC I stopped an aborted run of mine with
  `pkill -f "node tests/e2e/harmony_cutin.mjs"`. That pattern would also have matched another worker's run of the same
  test from its own worktree at that moment; if someone's harmony_cutin run died then, that was me.
