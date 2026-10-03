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
| Unmerged worker branches this ledger refers to | Overworld actor system at `77a3eee` plus uncommitted work; Harmony cut-in at `18cf5ea`; landmarks and bakery props, and the Harmony art contract (both just started) |

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

- **Owner:** the overworld actor-system worker. It has a pose layer, gesture library, mannerism profiles for
  the player, the four companions and 71 recurring characters, occupation loops, and RB.staging for idle
  life outside dialogue.
- **On 243069a:** still observed. No actor system has been merged.
- **On the worker branch:** partly addressed, retest pending after the merge.
- **Next check:** the review's five places in their real story states: the Harbourmaster's office, the Cinder
  glass workshop, the occupied Snowbell inn, the Lanternfall bakery, and the Archive camp. Observe each long
  enough to see the routine's cadence, and record the duration. Then check idle → conversation → story cue →
  return to task.
- **Messages sent:** the worker has the review's acceptance list. That includes not assigning mannerisms from
  appearance, and not drawing on the shared random state used to pick language tasks. The second already
  exists as a known issue in HANDOFF.md.
- **Limitation:** none of the review's five places has been retested yet.

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

- **`sg.omi_wataru` in `sg.office` (Wataru and the Harbourmaster):** covered by the actor worker's showcase on
  both routes. Partly addressed on the worker branch; retest pending after the merge.
- **`co.hiro_first` in `co.glass` (Hiro's glassworking):** **still observed** on 243069a. This scene was not in
  the actor worker's original list. It has now been asked to stage the blowpipe work: hands, tool, gather and
  workstation, with a safe pause where the text lets the glass cool.
- **Other replayed scenes:** `co.festival_begin`, `sb.eve_start`, `sb.path_enter`, `lf.town_intro`,
  `sa.study_enter`, `lq.kh_arrive`. These are samples for after the merge, not a certificate.

## WR-04: four long-quest landmarks in an older style

The review classed this as an observed asset gap.

- **Owner:** the landmarks and bakery worker, just started.
- **On 243069a: still observed.** All four are still drawn with the old flat path in
  `src/content/lq/10_data.js`: tile-resolution circles and rectangles, no `draw2`.

| Prop | Current (243069a) | Must keep | Status |
|---|---|---|---|
| `lq_kaki` | flat blob canopy, regular trunk | scale, fruit, height marks, position, footprint | still observed, redraw in progress |
| `lq_kaki_young` | three blobs | younger identity, garden placement; not a scaled copy of the big tree | still observed, redraw in progress |
| `lq_namestone` | flat slab, regular lines | significance, inscription interaction, footprint; no legible marks, no new clue | still observed, redraw in progress |
| `lq_teastall` | flat posts, awning, counter | proportions, working surface, kettle, the upside-down cup | still observed, redraw in progress |

- **Required evidence:** before and after at normal game scale, and an unchanged footprint and interaction
  (a new `tests/e2e/landmarks.mjs`).
- **`cs_tidechalk`:** left alone, as the review advises.

## WR-05: Masaru's bakery reads as a generic workroom

The review classed this as a design judgment.

- **Owner:** the props side goes to the landmarks and bakery worker: a preparation surface, a bread display,
  a few purposeful forms, no crowding. Masaru's working action belongs to the actor worker, after both merge.
- **On 243069a:** still observed. The room has stoves, a table, storage and furniture, and no bakery-specific
  forms.

## WR-06: intentional restraint must survive the animation work

This is a safeguard, not a defect.

- **Applies to:** all ongoing presentation work. Both world-life workers have the safeguard.
- **Retest after the merges:** Lanternfall before and after its story change, a quiet Archive room, and the
  occupied Snowbell inn, for varied rhythms rather than a universal busy loop.

## Known or reported items from the review's historical reconciliation

| Item | Current status | Evidence |
|---|---|---|
| Town animals and Mochi; case workbench and call-bell art | fixed and retested on later builds | VALIDATION.md "Town animals" and "Case props" |
| Dialogue over fades; the tide-wait interlude | fixed and retested: interludes 76/76 on 34ec977 | VALIDATION.md "Interludes" |
| Lighthouse top | fixed and retested: lighthouse_top 106/106 on 34ec977 | VALIDATION.md "The top of the lighthouse…" |
| Overlapping battles and frozen canvas | fixed and retested: battle_overlap all ok on 34ec977 and on b4a598e | VALIDATION.md "Battles one at a time" |
| Open-air quick travel | fixed and retested: travel_rules 10/10 on 34ec977 | VALIDATION.md "Quick travel rules" |
| Nao's missing third floorboard in `rw.warehouse` | **still observed** on 243069a: the line exists and the room draws no gap. The fix in progress is to draw it, keeping both the line and comparison item C07 | src/content/ch1/30_scenes_arrival.js:176, practice_b/30_compare.js:182 |
| Observatory dome headroom, `sb.obs_path` | **still observed** on 243069a. 2000×1090: the dome apex is cut by the map's top edge. 1440×900: it just touches. 390×844: the apex sits under the Word help and Menu buttons. A fix without moving any map coordinate has been requested | captures of `debugStart('sb.obs_path', 13, 6)`; to be committed with the fix |
| Full idle-life and animated-portrait coverage | in progress on worker branches; not complete | WR-01, WR-02 above |

## Harmony cut-in: two separate gates

| Gate | Status |
|---|---|
| **Technical integration** | The cut-in overlay is in progress at `18cf5ea`: lifecycle, Normal/Fast/Instant, reduced motion, placement, and an optional art timeline of states. The art contract v2 is in progress: registry export, importer, material masks, raster path, a synthetic sample. |
| **Robin's visual approval** | **Not approved.** The code-drawn busts are provisional, and only a fallback. The painted art follows `docs/harmony/ASSET_BRIEF.md`, which is being rewritten to contract v2. Batch 1 is the proof: Suzu plus the configured player, plus a materially different player look. |

## How this ledger is updated

After each merge:
1. Rerun the named checks on the merged build.
2. Update the status words and evidence paths here.
3. Keep the review's distinctions between observed defect, presentation gap, design judgment and safeguard.

The combined full-game matrix runs once the authorized presentation work is integrated, in Robin's
established order, not because this packet arrived.
