# AR-1 Mill: the Old Mill's art (FR-1 F13), approved by Robin and pushed

Robin's handoff (2026-10-17, "AR-1 — Old Mill art review and approval gate") asked for three things. It called the
pass AR-1; that id already names the 2026-10-13 illustrations pass, so these records call this one **AR-1 Mill**.

1. The descending stair-well.
2. The waterwheel's hub-and-axle connection to the mill.
3. A review of the millstone, keeping it if the concern was not reproduced.

The handoff asks for the candidate to be prepared and tested, unpublished, and for Robin's explicit approval before
any push, merge, Pages deployment or release.

## Status (each kept separate)

| | |
|---|---|
| Implemented locally | yes: first as the unpushed candidate `2dcd9d4` on the local branch `ar1-mill-candidate` (on 2a0faed) |
| Technical checks | passed (below); the untested environments are listed below |
| Before/after ready | yes: `RBN_AR1_Mill_Review.zip` and `RBN_AR1_Mill_Clips.zip`, given to Robin in the Cloud conversation; a selection is in `shots/` |
| Awaiting Robin's visual approval | no longer |
| Approved | **yes, both changes** (Robin, 2026-10-17: "Both art changes are excellent, push them both.") |
| Pushed | yes: the identified candidate, unchanged, pushed to `claude/stoic-sagan-n3jvgk` with this report; the build is the approved one (`f4477b81…`) |
| Deployed | no: Pages and releases are separate decisions |

Robin's follow-up (the same message) asked for the mill's flow to change too: walk-on stairs, the millstone still
until the gears are mended, the Mill Echo unavoidable, and new lines for the wheel, the ladder and the stairs. That
is MW-1, recorded in VALIDATION.md "MW-1"; it is not part of this approved art.

## Identity

- **Baseline:**
  - commit `2a0faed78ff7e233ddc176e21ff414e8fd73c9f5`;
  - built `index.html` SHA-256 `7bffe0fca777d691d6572a3cd45ea4438214b5122e3664101a6960dbe14e721e`;
  - rebuilding 2a0faed gives the same bytes.
- **Candidate:**
  - built `index.html` SHA-256 `f4477b8140a5c0ee5f3674e9280f5ec45cc57dab1baec865235b56d542c389bc`;
  - the commit on `ar1-mill-candidate`;
  - its patch, `0001-*.patch`, is in the review package.
- **The baseline was captured before any edit.** The first set was taken from the frozen baseline build. The
  comparison set (`before`) was then captured again from the same frozen build once the recipe was fully
  deterministic (below). The earlier sets are superseded and not presented.

## A · The stair-well (rw.mill1, the stairs at 12,9)

**Found (baseline):**
- The stairs sat in a 2×2 patch of the room's plain stone floor (`+`, tiles 11–12 × 8–9).
- They were drawn with the shared "stone steps up" picture: lit treads over dark risers, read as steps going up.
- There was no rim, no depth and no contact with the planks.
- At normal scale the whole patch read as a flat grey block beside the planking. Concern reproduced.

**Changed:**
- **Scope:** a per-instance variant of the shared stairs (`o: { well: 'down' }`, this instance only), drawn into the
  floor layer with the tiles (baked once). It lies under everyone and under the room's light, as floor does.
- **The landing:** the three stone tiles north and west of it are a stone apron a finger proud of the planks.
  - Its top and left edges are lit; its right and lower edges are shaded.
  - There is a contact shadow on the planks beyond those edges.
  - The landing is a shade darker (damp stone), and damper for a few pixels round the opening.
- **The opening:**
  - stone coping where it meets the landing (north, west);
  - the floor's timber trimmers, nailed like the boards, where it meets the planks (south, east).
- **The stair:** four stone treads going down toward the viewer, each lower one darker and damper.
  - The nosings are worn pale in the middle.
  - The shaft's walls close in as the treads go down: the west wall shaded, the east wall dimly lit.
  - Two small wet glints.
  - The darkest strip is only the gap under the near trimmer, where the stair runs on under the floor.
- **Why toward the viewer:** it puts the stair-head at the landing where you arrive from the pit (12,8). It also
  matches the room's own battle backdrop, which shows the first step lit and the rest falling toward the viewer.

**Kept:**
- the projection;
- the stairs' interaction: non-blocking, used from any side, closed until the gears are mended, leading to the pit
  and back to the landing;
- the stone floor tiles themselves;
- no rail (one would suggest the sides are closed, which they are not);
- no arrow and no glow.

**The Wheel Pit:** its stairs (rw.mill0 2,8) use the shared drawing, which this pass did not change. The pit
captures are pixel-identical before and after (desktop and the narrow emulation).

## B · The waterwheel (rw.millroad, the wheel at 14,2)

**Found (baseline):**
- A face-on wheel standing over the race, a tile clear of the mill's east end.
- No axle, no bearing, nothing joining it to the mill: an ornament beside the building. Concern reproduced.
- Its lower paddles were drawn over the water rather than in it, with no contact.

**Changed (the wheel's own drawing; it is used only here):**
- **The connection:**
  - A squared timber axle runs from the hub to the mill's east wall. Its end goes under the eave: the house is drawn
    after the wheel, so the thatch covers it.
  - The axle is carried by a timber lean-to standing in the race: two posts and a head beam, an iron-strapped
    bearing on each post. This is the Mill study's lean-to (docs/future/work/P01_STUDY.md), adopted as one
    technique (AC-1 AC-A02).
  - The lean-to is a shade darker than the wheel, which stands in front of it.
  - The axle passes behind the wheel's rim and paddles and shows through the open spokes into the hub.
- **The hub:** an iron boss on the axle's end, lit on its upper left, with four bolts that turn with the wheel.
- **The water:**
  - Below a waterline, the wheel and the posts' feet take the water's colour.
  - The posts are darker and wet near the race.
- **Turning** (`rw_echo_done`, as before):
  - white water where the paddles go in (east) and come out (west);
  - drips from the rising paddles;
  - the race running on west under the lean-to.
- **Jammed** (`!rw_echo_done`, as before; the instance now also says `jammed: true`):
  - calm water piling against the upstream paddles;
  - a twig caught there;
  - no white water.
- **Reduced motion:** each state keeps its look in a still frame, so turning and jammed still differ.

**Kept:**
- the wheel's footprint and collision;
- its eight-frame turn, clockwise (the lower paddles move west with the race);
- its rims, paddles and spokes;
- the state authority: the map's `if` on each instance, unchanged;
- the mill;
- the race tiles;
- the battle backdrops.

The lean-to stands on the race and on the tile between the mill and the wheel (13,2), which no one can reach
(checked: no path to 13,2, 13,1, 14,1, 15,1 or 16,2). The player can only pass in front of it.

**Renderer and dialogue, as they stand (not changed here):**
- Once the gears are mended (`rw_gears`), the stairs open. Their closed line said it was too dangerous "while the
  wheel is jammed".
- Yet outside, the wheel stays jammed until the Echo is put to rest (`rw_echo_done`). Its look line still says it
  does not turn.
- The script says only that "the creak of the waterwheel changes" at the gears, and that it "makes one great turn"
  at the Echo.
- The candidate follows the existing state authority.

## C · The millstone (rw.mill1, 6,4): reviewed and retained

**What holds at normal scale:**
- the silhouette, the elliptical top and side planes, and the projection;
- the bed stone and runner stone;
- the contact and cast shadows;
- the handle peg.

**What the 3× view shows:** the side planes are smooth bands, plainer than the boards beside them. At native scale
they read as dressed stone. The millstone is also the focal object of the Mill Echo encounter.

**Decision:** changing it would bundle an unrequested revision, so it is unchanged. Reference crop:
`shots/millstone_after_3x.png`; the full scenes differ only at the stair-well.

**Found while reviewing (not changed):**
- The runner stone turns in every state: the prop has no still option.
- Before the Echo, its look line says it is "faintly warm to the touch, though no one is turning it".
- Before the gears are mended, the wheel and gears that would drive it are jammed.
- If Robin wants it to stand still until then, it is a one-line per-instance option: this is Robin's decision.
- **Decided in MW-1 (Robin, 2026-10-17):** it stands still until the gears are mended, then turns. The drawing honours
  `o.still` (the art's frame 0); the mill's instance had not set it, so "no still option" above means the instance, not
  the prop. MW-1 gives the room two instances of this same drawing: `still` while `!rw_gears`, turning after. The
  picture is unchanged. Its look after the gears says it turns, heavily, almost hot.

## Capture recipe (tools/review/ar1_mill_capture.mjs)

**What is fixed in every shot:**
- **Clock:** Playwright's fake clock, installed before load and paused at 2026-10-17T09:00:01Z. It moves only by
  explicit steps.
- **Random numbers:** Math.random is a fixed-seed generator. Each shot starts at a whole minute of the page's
  performance clock, after reseeding.
- **Placement:** `RB.game.debugStart(map, x, y, {flags, dir})`, then 4 s of game time.
- **Camera:** the game's own; it follows the player.
- **Settings:** world light on, reduced motion off (except where a shot is named otherwise), sound muted.
- **Story:** the arrival scenes marked seen, and the road's and pit's creatures settled so none wanders in.

**Views:**
- desktop 1280 × 800 at DPR 1;
- narrow 390 × 844 at DPR 2, Chromium's mobile and touch emulation (an emulation, not a phone).

**Story states:**

| State | Flags |
|---|---|
| inside, jammed | `rw_mill_open` |
| inside, open | + `rw_gears` |
| road, jammed | `rw_mill_open` |
| road, working | + `rw_gears`, `rw_loft_done`, `rw_echo_done` |

**Shots (map, tile, facing):**

| Shot | Where | Notes |
|---|---|---|
| `stair_landing` | rw.mill1, 12,8, down | |
| `stair_front` | rw.mill1, 12,10, up | |
| `stair_west` | rw.mill1, 10,9, right | |
| `stair_east` | rw.mill1, 13,9, left | |
| `stone_beside` | rw.mill1, 8,5, left | |
| `pit_stairs` | rw.mill0, 2,7, up | |
| `wheel_jammed` | rw.millroad, 13,4, up | |
| `wheel_working` | rw.millroad, 13,4, up | `_reduced` adds reduced motion; `_nolight` adds world light off as well |
| `wheel_door` | rw.millroad, 9,6, up | |

**Clips:** the engine is stepped 1000/30 ms per frame and each frame captured. Speed and duration are exact and
equal before and after; 30 fps is the sampling rate, not the engine's.

| Clip | What | Length |
|---|---|---|
| `wheel_walk_working` | from the door, past the wheel and back | 270 frames, 9 s |
| `wheel_walk_jammed` | the same walk, jammed | 270 frames, 9 s |
| `stair_walk` | round the stair-well on three sides | 300 frames, 10 s |

**Determinism:** two runs of one build gave identical pixels (checked on a repeated shot), and every before/after pair
is identical outside the changed areas.

**Comparison** (tools/review/ar1_mill_compare.mjs, every pair):

| Shots | Where they differ |
|---|---|
| Stair shots | only the stair-well block, 132 × 132 px (864–995 × 528–659) |
| Wheel shots | only the wheel and lean-to box (614–797 × 100–283) |
| Pit (desktop and narrow) | identical |
| Clip frames | only the moving region of those boxes; the player's path is identical frame for frame |

## Checks

**Unit (U):**
- `ar1_mill_art` 12/0: the variant's only use; the pit, exits, scenes, wheel instances, millstone and trigger as
  before.
- The full unit run: see VALIDATION.md "AR-1 Mill".

**Browser, Chromium (B):**
- **`ar1_mill_art` 20/0.** Covered:
  - the mill door in and out;
  - the stairs refusing while jammed, from front, west and landing;
  - the stairs leading to the pit once mended, from all three;
  - back up onto the landing;
  - the millstone's two looks;
  - the Mill Echo still met at the millstone;
  - the jammed wheel's look;
  - the stair-well dark below a lighter landing and planks;
  - the jammed wheel never turning;
  - the working wheel turning;
  - reduced motion holding it still;
  - the axle and lean-to never moving;
  - the jammed and turning wheels differing in a still frame;
  - no page errors.
- `mill_road` 36/36, `backdrops` 61/0, `battle_backdrops` 38/0.
- **Shared reach:** five other maps drawing the shared stairs (sg.inn, co.terraces, hall.w1f1, mb.inn, rw.cellar2),
  and the battle backdrops in the mill and by the wheel. They draw their own stairs and wheel and are not
  applicable to the changed sprites. Before and after are pixel-identical.

**Render cost** (headless Chromium in this container, real clock; three alternating runs; medians, baseline →
candidate; indicative only):

| Scene | Steady frame p50 / p95 | First frame | Sprite cache |
|---|---|---|---|
| Mill interior | 3.3 / 5.9 → 3.5 / 6.0 ms | 72.7 → 77.1 ms | 18 → 18 entries |
| Road, working | 4.4 / 7.7 → 4.7 / 8.7 ms | 362.9 → 353.1 ms | 89 → 89 |
| Road, jammed | 4.3 / 8.5 → 5.9 / 9.0 ms | 287.8 → 311.2 ms | 90 → 91 |

- The run-to-run spread overlaps in every case: road jammed first frames ranged 234–348 ms.
- The art is cached (one baked floor sprite; the wheel's eight frames, as before).
- No per-frame drawing was added.

**Voice and validation:**
- `node tools/validate.mjs`: no errors.
- **Voice-production inputs changed: no.**
  - `GO.json` SHA-256 c6fd3f10…b543 and the manifest 513ec3ff…ba66 are the same as at 2a0faed.
  - `production_manifest.mjs --check`: "content 65cd38053ad6".
- **New spoken lines: 0.**

**Not tested:**
- Firefox, Safari and real phones: the narrow view is an emulation.
- Real GPU hardware.
- The live frame rate.
- The campaign matrix (not requested).

## Files

**The art:**
- `src/engine/28_propwork.js`: the stair-well (`stairWell`, the `stairs` variant) and the wheel.
- `src/engine/27_propart.js`: `spec.bake`, a variant's floor-level part.
- `src/engine/60_render.js`: the static layer bakes such parts for props that are always there. Only the mill's
  stair-well has one.
- `src/content/ch1/11_maps_mill.js`: `o.well` and `o.jammed`, visual parameters only.

**The build:** `index.html`.

**Tests:**
- `tests/unit/ar1_mill_art.test.mjs`;
- `tests/e2e/ar1_mill_art.mjs`.

**Tools:**
- `tools/review/ar1_mill_capture.mjs`;
- `ar1_mill_compare.mjs`;
- `ar1_mill_reach_perf.mjs`.

**Records:** this report, `shots/`, HANDOFF.md, VALIDATION.md, REQUIREMENTS.md, and FR1_REPORT.md (the F13 row).
