# World review: reconciliation with the current build

This ledger reconciles the external full-world presentation review that Robin forwarded on 2026-10-03, with
its findings WR-01 to WR-06, against the current source.

It contains later-story scene names; it does not spell out story events.

The packet itself is not committed: it is large and contains reference images. Its identities are listed
below so the evidence can be matched.

## Identities

| What | Identity |
|---|---|
| Reviewed build | `index(2)(1).html`, SHA-256 `fd863571…df289a0`, 9,087,691 bytes |
| Historical repository reconciliation in the review | `claude/stoic-sagan-n3jvgk` at `9aa71a8` |
| Current pushed build for this ledger | `claude/stoic-sagan-n3jvgk` at `243069a`; root index.html SHA-256 begins `7bb6322662bf3d3d` |
| Merged since | Animated dialogue portraits (`1be42bd`, pushed with `fe75862`) |
| Also merged | Harmony art contract v2 (`996d195`); landmarks, bakery, floorboard and headroom (`089ade7`, plus `7b4ae3c`) |
| Also merged | Overworld actor system (`4a9c357`) and Masaru's kneading |
| Unmerged worker branches this ledger refers to | Harmony cut-in overlay (`18cf5ea`; the worker is still running) |

**Status words** follow the packet:
- still observed;
- partly addressed;
- fixed and retested;
- reported fixed, retest pending;
- not reproduced / context differs.

"Retest" always means on a named build, in headless Chromium unless stated otherwise. Nothing here was
checked in Firefox or on a real phone.

## WR-01: shared idle life, little occupational or personal behaviour

The review classed this as an observed presentation gap.

- **Owner:** the overworld actor-system worker. Merged in `4a9c357`; Masaru's kneading added by the lead in the
  following commit.
- **Status:** **partly addressed, retested on the merged build.**
- **Five workplaces** were each watched for 45 s from the door, in real story states
  (`tests/e2e/actor_workplaces.mjs`, 30/30):
  - Ōmi writes at her desk.
  - Hiro works the blowpipe while Isao watches.
  - Yae stirs and counts in the storm-night inn.
  - Isamu sits by the camp fire.
  - Masaru kneads at his new bench.
  - In each, the person works at their station before anyone speaks; no routine moves anyone off their place or
    into a doorway; at most one thing happens at once.
- **Idle → conversation → return:** Ōmi keeps her brush, faces you, plays no habit while spoken to, and
  resumes writing 1.9–2.1 s after.
- **Mannerisms** come from role, station and tool; none are inferred from glasses, age, dress, gender or skin.
- **Shared random state:** world blink, glance and weather timers now use their own random streams, so idle
  life no longer draws from the random numbers that pick language tasks. Foes' patrol steps still do.
- **Evidence:**
  - `docs/screenshots/actors/workplace_*.png` and `workplaces.txt`.
  - `video/idle_life_co_eve.webm`.
  - actor_life 39/39.
- **Limitations:**
  - Only 7 of the scene manifest's "performed overworld" scenes are staged.
  - Legibility was judged by the worker from contact sheets, with no person's review on a real screen.
  - Counting on fingers, eyes-only glances and gestures in the back view are weak at play scale.

## WR-02: held dialogue portraits are static; eye-area readability

The review classed this as measured static behaviour, plus a readability judgment.

- **Owner:** the animated dialogue-portrait worker. Merged as `1be42bd` (squashed) and pushed with `fe75862`.
- **Before the merge, on 243069a: still observed.** `tests/e2e/review_held_portrait.mjs` uses the review's
  method: 11 samples over about 5 s of one held line by Wataru.
  - 1440×900: 1 distinct image, at 116 CSS px.
  - 390×844: 1 distinct image, at 64 CSS px.
- **After the merge, on fe75862: fixed and retested** (headless Chromium).
  - The same probe gives **5 distinct images at both sizes**: the idle loop.
  - The portrait is **96 CSS px** at 1440×900 (ratio 1) and **64** at 390×844.
  - Desktop moved from 116 to 96 deliberately, so each art pixel lands on whole device pixels. The box is
    unchanged.
  - The phone portrait never grows. The worker's first build had it at 96, which made the box 32 px taller;
    the probe caught that and it was fixed.
  - portrait_anim all passed. Section I runs a real scene by real clicks: one cue, the cue never advances the
    line, no replay, no stale frame after a quick advance.
- **Stills first:** `docs/screenshots/portraits/stills_desktop.png` and `stills_phone.png` show 6 characters ×
  12 expressions, held still at the review's sizes, before and after. Eye crops are in `eyes_zoom.png` and
  `eyes_real_size.png`.
- **Remaining limitations:**
  - On phones at device-pixel-ratio 1, 2 and 2.625 the 64-px portrait is still an uneven downscale, so some
    rows drop.
  - Expression readability has been judged only by the worker and the lead from captures.
  - Firefox and a real phone are not tested.
  - Owner's choice: the desktop portrait can go back to 116 px; it is one CSS setting.

## WR-03: narrated physical and emotional acting is not shown

The review classed this as a specific staging mismatch.

- **`co.hiro_first` (Hiro's glassworking): fixed and retested** (`4a9c357`).
  - The blowpipe and gather keep turning on "can't let go".
  - When he says he will listen he holds the gather still to cool, and goes back to the pipe about 3.9 s
    later.
  - Evidence: actor_workplaces (`workplace_glass.png`, `workplace_glass_after.png`).
- **`sg.omi_wataru` (Wataru and the Harbourmaster): fixed and retested.**
  - Ōmi writes, stops, listens, is firm without anger, and separates the two faults with a palm, a size
    gesture and a point.
  - Wataru flinches, exhales, takes the notice and reads it.
  - Each companion responds in their own way.
  - Both routes × 4 companions; speaker order and conditions exact; staged and unstaged runs end in the same
    state.
  - Evidence: `staging_wataru.mjs` 112/112; `docs/screenshots/actors/wataru_*.png`; two route clips.
- **One staged interaction per chapter** (`staging_chapters.mjs` 66/66): `rw.hana_first`, `co.suzu_night`,
  `sb.yae`, `lf.mio_refuse`, `sa.isamu_return`.
- **Remaining:**
  - The other replayed scenes (`co.festival_begin`, `sb.eve_start`, `sb.path_enter`, `lf.town_intro`,
    `sa.study_enter`, `lq.kh_arrive`) are not yet staged.
  - Approach from another side, absent actors and revisits are not covered.
  - At 960×600 the dialogue sheet hides Ōmi while she speaks (noted by the worker).

## WR-04: four long-quest landmarks in an older style

The review classed this as an observed asset gap.

- **Owner:** the landmarks and bakery worker. Merged in `089ade7`.
- **Status:** fixed; retested on the merged build. The lead's runs on this build are recorded in VALIDATION.md.
- **Before the merge, on 243069a:** still observed. All four were drawn with the old flat path in
  `src/content/lq/10_data.js`: tile-resolution circles and rectangles.
- **After:** art-resolution drawings in `src/content/lq/15_art.js`. The old drawings stay as the fallback.

| Prop | After | Kept |
|---|---|---|
| `lq_kaki` | a gnarled, buttressed trunk, a low red-russet crown built like the world's other trees, about 24 fruit | size, blocking, placement, scene, the four height marks on a clear lit strip |
| `lq_kaki_young` | a slender staked young trunk, an open crown of large glossy leaves, three fruit; a different drawing, not a scaled copy | placement in `lf.gardens`, scene |
| `lq_namestone` | a thick slab on a plinth, with lichen, moss, a chip and a crack; carving as columns of cut dashes, with no letter shapes and nothing that reads as a clue | footprint, scene |
| `lq_teastall` | a planked counter, a striped awning with a snowy top, braced posts, a brazier, an iron kettle with steam, a tea caddy, celadon cups | proportions, working surface, **the first cup upside down** |

- **Continuity added by the lead (`7b4ae3c`):**
  - After `lq_fare` is done, every cup faces up: the scene says "They all face up now."
  - After `lq_road` is done, the tree shows its new, pale fifth mark, as `lq.kh_tree` describes.
  - Both come from the same placement, as an art variant read from the campaign state.
- **Evidence:**
  - `docs/screenshots/landmarks/`: before and after at 1280×800 and 390×844, and a close-up sheet at 3×.
  - `tests/e2e/landmarks.mjs` (54/54) checks size, blocking, placements, map blocking and the use tiles against
    a record made on 243069a.
- **Limitation:** the art has been judged by the worker and the lead only.
  - The tree still shows four marks before the quest, while the scene speaks of twelve. This predates the
    redraw.

## WR-05: Masaru's bakery reads as a generic workroom

The review classed this as a design judgment.

- **Owner:** the props side was done by the landmarks and bakery worker, merged in `089ade7`. Masaru's working
  action belongs to the actor-system worker, after its merge.
- **Before:** still observed on 243069a: generic stoves, a table, storage.
- **After:** partly addressed.
  - A domed bread oven with loaves, embers and a peel replaces the two stoves.
  - A bread rack replaces the bookcase.
  - Flour sacks stand where a crate was.
  - A floured kneading bench holds a tray of dough rolls, a bowl and a rolling pin.
  - The order table, its scene, the door, the spawn point and Masaru are unchanged.
  - Masaru's tile (3,4) faces the dough end of the bench, ready for a working action. He can no longer be
    spoken to from (3,3); (3,5), (2,4) and (4,4) still work.
- **Evidence:** `docs/screenshots/bakery/` (before and after at 1280×800 and 390×844, with Masaru); landmarks
  test (door-to-table path, scene, Masaru reachable).
- **Masaru's working action: done.** He kneads at the bench end (4,3), side-on so the work reads, and is talked to from (4,4). actor_workplaces asserts it (30/30).
- **Status:** fixed and retested, apart from a person's judgment of the look.

## WR-06: intentional restraint must survive the animation work

This is a safeguard, not a defect.

- **Status:** applied and partly retested.
- **What was done:**
  - Calmer moods for Lanternfall before its bell, for the Archive road, and for the storm-night inn.
  - A cap on how many people act at once.
  - No habits during scenes; Suzu's hand-on-hip stance never shows in conversation.
- **Evidence:** actor_life, actor_workplaces ("not continuous spectacle"), staging_wataru.
- **Not yet retested by eye:** Lanternfall before and after its story change, a quiet Archive room, the
  occupied Snowbell inn.

## Known or reported items from the review's historical reconciliation

| Item | Current status | Evidence |
|---|---|---|
| Town animals and Mochi; case workbench and call-bell art | fixed and retested on later builds | VALIDATION.md "Town animals" and "Case props" |
| Dialogue over fades; the tide-wait interlude | fixed and retested: interludes 76/76 on 34ec977 | VALIDATION.md "Interludes" |
| Lighthouse top | fixed and retested: lighthouse_top 106/106 on 34ec977 | VALIDATION.md "The top of the lighthouse…" |
| Overlapping battles and frozen canvas | fixed and retested: battle_overlap all ok on 34ec977 and on b4a598e | VALIDATION.md "Battles one at a time" |
| Open-air quick travel | fixed and retested: travel_rules 10/10 on 34ec977 | VALIDATION.md "Quick travel rules" |
| Nao's missing third floorboard in `rw.warehouse` | **fixed and retested** (`089ade7`). The gap is drawn as a blocking prop `rw_floorgap` at (5,5); no text changed (the line and comparison item C07 stay). Nao is spoken to from (4,4), (6,4) or (5,3) | landmarks test; docs/screenshots/landmarks/*_warehouse_floorboard_* |
| Observatory dome headroom, `sb.obs_path` | **fixed and retested** (`089ade7`). A per-map camera `headroom` (2 rows) shows the dome, and the tree line continues above row 0. The HUD buttons clear the tip by 74, 82, 15 and 8 CSS px at 2000×1090, 1440×900, 390×844 and 844×390. Maps without the option take the old code path. Near the top, the camera scrolls about 1.4× walking speed | landmarks test; docs/screenshots/landmarks/*_observatory_* |
| Full idle-life and animated-portrait coverage | in progress on worker branches; not complete | WR-01, WR-02 above |

## Harmony cut-in: two separate gates

| Gate | Status |
|---|---|
| **Technical integration** | **Contract v2 merged in `996d195`:** `RB.harmonyContract`, a registry export (`docs/harmony/contract/registry.json`: 86 required and 33 optional asset keys), a dependency-free importer with explicit material masks, the raster path with whole-bust fallback to the code busts, build embedding, and a synthetic sample that assembles two materially different player looks with Suzu across six states (`docs/screenshots/harmony/raster_sample/`, labelled SYNTHETIC SAMPLE — not art). The cut-in overlay, with its art-timeline support, is still on its worker branch. |
| **Robin's visual approval** | **Not approved.** The code busts are a provisional fallback. The artist brief is rewritten to contract v2 (`docs/harmony/ASSET_BRIEF.md`; the published page is updated). Batch 1 (26 files) is the proof: Suzu and two player looks. |

## How this ledger is updated

After each merge:
1. Rerun the named checks on the merged build.
2. Update the status words and evidence paths here.
3. Keep the review's distinctions between observed defect, presentation gap, design judgment and safeguard.

The combined full-game matrix runs once the authorized presentation work is integrated, in Robin's
established order, not because this packet arrived.
