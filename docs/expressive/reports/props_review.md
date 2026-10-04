## Props and environment balance, the review ledger, conversation continuity, portraits from the scripts — the World Idle Life addendum's remaining rows (WI18, WI19, WI25, WI26, WI27, WI28)

Worker branch `worktree-agent-a6a3aad841c9c47ab`, on the task branch at `c2a799d`. Presentation only: no rule, line, quest, condition, footprint,
blocking, position, NPC placement or scene script changed. Every browser run below was in headless Chromium on
Linux (Playwright) with synthetic campaigns started in fresh profiles; no player save was used; nothing was
checked in Firefox, Safari or on a phone. Other workers' browser runs shared the 4-core machine, so the motion
numbers are noisy. "Before" means the build at `c2a799d` (`node tools/build.mjs` there, kept outside the
repository); "after" means this branch.

### What changed, by file

- `src/engine/28_propwork.js` (the shared prop art):
  - **kiln**: a variant per placement's own text. `o.glass` with `o.litIf` is a glassworks furnace: cold and
    ashen until the condition holds, then lit, with the orange gather turning slowly (8 frames, 340 ms each).
    `o.embers` shows a low bed of embers ("still faintly warm"). `o.ash` shows the mouth choked with ash and no
    glass-seal mark.
  - **sparkle**: `o.faint` is a glint in the scenery. It is a dim point that brightens briefly once every
    2.8 s, with no cross of light until then.
  - **flick** (every lamp): steady, then one small and one larger dip per turn of 8 slots of 1.4 × the lamp's
    step. This is about two changes a second instead of 4–6.7. `flickLively` keeps the old cycle for the great
    lamp.
  - **campfire**: 125 ms a frame (was 90).
  - **table**, **smalltable**: `o.on` draws what the scene says lies there: paper, papers, letters, book, ink,
    cup, cups, cupdown, tray, board or plate.
  - **desk**: `o.on` 'heap' (stacked records) or 'heapcups' (the same with three cups).
- `src/engine/60_render.js` `drawLighting` only: each pool of light breathes on its own phase, from where it
  is, at `t/300` and ±1.2 art px. Before, every pool on the map shared `sin(t/180) × 1.5`.
- Other prop art:
  - `src/content/ch2/01_art.js`: `sg_lens` with `o.fullIf`. The flame is small and dim until the condition
    holds; either way the pulse is slower (240–300 ms a step, was 160).
  - `src/content/ch3/05_art.js`: `co_wheel` has a slip-grey head and darker damp clay with a wet sheen, and
    stays still. `co_furnace` steps every 230 ms (was 150).
  - `src/content/ch4/05_art.js`: `sb_greatlamp` uses `flickLively`, so the lamp keeps its flame.
- Decor options in the maps (`o` only; the geometry record has no `o`):
  - `src/content/ch1/10_maps.js`, `ch2/10_maps.js`, `ch3/20_maps.js`, `ch4/20_maps.js`, `ch5/10_maps.js`,
    `ch6/20_maps.js`, `lq/20_maps.js`.
  - Three kilns, the lighthouse lens, 12 decor sparkles (`o.faint`, `o.lit: false`), 22 tables and 5 desks.
- `index.html` rebuilt.
- New tests:
  - `tests/e2e/props_balance.mjs`: the balance test.
  - `tests/unit/conversation_continuity.test.mjs` (WI25).
  - `tests/unit/portrait_speakers.test.mjs` (WI26).
- New tool: `tests/e2e/props_balance_shots.mjs` (the captures).
- Docs: `docs/expressive/REVIEW.md` (the ledger brought up to date) and this record.

### Findings (props and environment, WI18 / WI27)

| # | Prop or place | Before | After | Why |
|---|---|---|---|---|
| N1 | Asahi's furnace, `sg.glass` (`kiln`) | glowing mouth in every state; static (188 warm px, 1 frame) | cold and ashen before `sg_boss_done` (0 warm px); lit after, the gather turning (215 warm px, 8 frames, 2.8 changes/s) | its scene: "The fire is out. Only the smell of ash remains." until the ash arrives; then "Orange glass turns slowly inside the furnace." |
| N2 | the lighthouse lens, `sg.lighthouse` (`sg_lens`) | full brightness in every state, 6.2 changes/s | small and dim until `sg_boss_done` (76 bright px), full after (273), 3.2–4 changes/s | its scene: "The flame is small. Oil is being rationed." until the oil arrives; a lens that glows, not blinks |
| N3 | Nobu's kiln, `co.village` / `co.eve` / `co.festival` | an open fire (188 warm px) | a low bed of embers (3 warm px), no halo | its text: "Still faintly warm from yesterday." |
| N4 | the bisque kiln, `co.oldworks` 11,3 | plastered, with the Great Kiln's teal glass-seal cross (174 seal px), nine tiles from the real `co_seal` | choked with grey ash, no seal mark (0 seal px) | its text: "its mouth choked with ash"; the seal mark is the puzzle's language, and a decor kiln wearing it is a false lead |
| N5 | decor `sparkle` at `co.lookout` (8), `sa.conduits` (3), `sg.da_vault` (1) | the "something to find" star (88 bright px at its peak, 7.2 changes/s), each with a light pool of radius 18 over the dark | a faint glint (4 bright px, 1.4 changes/s), no light pool; the 4 sea-glass pickups unchanged | the bright sparkle means a pickup (`sg.glass_pick1–4`); used as scenery it promised something that was not there, and its light pools lit the dark field below the lookout like spotlights |
| N6 | every lamp: `lantern` (96 placed), `lamppost` (31), `shrine` (4), `co_glasslantern` (10), `co_seat` named, `pa_lamprack`, `sa_lamp`, `sb_observatory`, `atlas_lamp`, `atlas_waystone` | 3.3–6.7 changes/s (lantern 6.6, lamppost 6.6, Atlas lamp 5.8) | 1.2–3 (lantern 2.9, lamppost 3, Atlas lamp 2.1, shrine 1.8) | a dip every 150 ms made a street of lanterns twinkle like a sign; Lanternfall's calm before its bell (WR-06) had a row of twinkling lampposts as its main motion |
| N7 | pools of light on dark maps (`drawLighting`) | every pool and the player's lamp on one shared `sin(t/180)` | each on its own phase, slower | a room or a square of lights pulsing as one read as a mechanism, not flames |
| N8 | `campfire` (`sb.road`, `sa.camp`); `co_furnace` (Hiro's workshop, the kiln's heart) | 11 and 6.6 changes/s; the campfire redrew its whole flame each time (5,036 changed px/s) | 7.9 and 4.3 (3,623 px/s) | at the Archive-road camp (a calm place, WR-06) the fire out-moved the three people round it |
| N9 | 27 usable tables and desks | bare tops; the desk drew one sheet | each shows what its scene describes (dashes for writing, never letters) | the scene reads an order slip, a letter, two cups (one upside down), a shogi game, a tray, envelopes or a register on it; a bare top on a wooden floor gave no sign that something was there |
| N10 | the potter's wheel, `co.pottery` (`co_wheel`) | brown clay on a brown wheel on a brown floor: 40 % of its pixels apart from the floor, mean 34 | slip-grey head, darker damp clay with a sheen: 49 %, mean 41; still | its text: "The clay on it is still damp." Nobody is at the wheel, so it does not turn (CONTRACT.md §3.10: never animate what the story treats as still) |
| N14 | Lanternfall before its bell (`lf.town`) | the lampposts' twinkle was the town's main motion | calm (N6) | the restraint is deliberate (WR-06); the after-bell change is R35 (open) |

Kept on purpose (measured, not changed):
- the mill wheel (9.5 changes/s) and the gears (23/s, a continuous turn);
- the great lamp (7.1/s, the chapter's flame);
- the harbour fog;
- the ferry;
- puzzle props while they work, such as the clamp post's wind (25/s while that puzzle is live);
- the trees' and bushes' one-pixel lean in a travelling wave (0.3–0.4 changes/s each).

### Measured

**Every placed prop kind** (`props_balance.mjs` part 1). 269–271 kind × option sets from the authored maps and
three Atlas seeds (11, 4242, 90001) were each drawn alone over 12 s at 40 ms steps; 64 animate. (The Atlas rooms
built from the same seeds differ by a few props between pages; not investigated, outside this pass.) All of them hold one
frame with reduced motion, before and after. The per-kind table is printed by the test. The changes:

| kind (options) | placed | changes/s before → after | changed px/s before → after |
|---|---:|---|---|
| lantern | 96 | 6.58 → 2.92 | 770 → 271 |
| lamppost | 31 | 6.58 → 3.00 | 457 → 169 |
| co_glasslantern | 10 | 3.83 → 1.33 | 627 → 218 |
| atlas_lamp | 11 | 5.83 → 2.08 | 531 → 194 |
| atlas_waystone | 3 | 5.00 → 1.75 | 875 → 316 |
| shrine | 4 | 5.00 → 1.83 | 413 → 161 |
| sa_lamp | 1 | 4.17 → 1.42 | 640 → 202 |
| pa_lamprack | 1 | 4.33 → 2.00 | 293 → 139 |
| co_seat (named) | 2 | 3.33 → 1.17 | 70 → 24 |
| sb_observatory (lit) | 1 | 6.25 → 2.83 | 1,574 → 573 |
| campfire | 5 | 11.00 → 7.92 | 5,036 → 3,623 |
| co_furnace | 3 | 6.58 → 4.33 | 1,633 → 1,075 |
| sg_lens | 1 | 6.17 → 3.25 (rationed) / 4.0 (full) | — |
| sparkle (faint, new) | 12 | 7.17 (as the pickup star) → 1.42 | 458 → 31 |
| sb_greatlamp (lit) | 1 | 7.08 → 7.08 (kept) | — |

**Readability** (part 3). At 29 places, each prop you can use on screen was drawn with and without itself at the
same instant, with nobody in the picture and no weather. The measure is how far its pixels stand from the ground
behind them: the share of its pixels more than a quarter of the ground's brightness apart, and the mean channel
difference. 83 props were measured. Changed by this pass:

| prop | before | after |
|---|---|---|
| the potter's wheel (`co.pottery`) | 40 %, 34 | 49 %, 41 |
| the order-slip table (`co.pottery`) | 30 %, 30 | 39 %, 37 |
| the harbourmaster's desk (`sg.office`) | 35 %, 40 | 42 %, 45 |
| the Gull's writing desk (`sg.inn`; paper and ink) | 29 %, 36 | 41 %, 44 |
| Sayo's seating chart (`co.village`) | 34 %, 34 | 44 %, 41 |
| the lantern records' desk (`rw.hall`; stacked) | 40 %, 36 | 45 %, 39 |
| the shogi table (`sb.inn`) | 38 %, 30 | 40 %, 34 |

The lowest after this pass, judged by eye from the captures:
- the stone of names in Koharuno (22 %) reads by its outline and shape on the grass (WR-04's art, kept);
- the millstone and stairs in the dark mill (25–27 %) read by shape in the player's light;
- the lookout's bell (34 %) is bronze over the dark;
- one crate in Cinder Orchard (31 %).

None was judged lost, so none was changed.

**Place balance** (part 4, `--places`). The motion on screen is split between people (and animals) and the
environment (props, animated tiles, lights), with the weather counted apart. Pixels changed per 100 ms sample,
averaged over 6 s, at 1280×800. The player and companion stand still, idling, and count as people:

| place | kind | NPCs on screen | people px (NPCs, player, companion, animals) | environment px before → after | weather px | people's share before → after |
|---|---|---:|---:|---|---:|---|
| rw_village (`rw.village`) | town square | 6 | 1962 | 1469 → 1226 | 0 | 57 % → 62 % |
| rw_tea (`rw.tea`) | shop | 1 | 577 | 74 → 72 | 2 | 88 % → 89 % |
| rw_hall (`rw.hall`) | interior | 1 | 429 | 765 → 268 | 0 | 37 % → 62 % |
| rw_road (`rw.road`) | roadside | 0 | 367 | 4766 → 4270 | 51 | 11 % → 8 % |
| rw_millroad (`rw.millroad`) | mill | 0 | 294 | 7381 → 7416 | 1630 | 4 % → 4 % |
| rw_mill1 (`rw.mill1`) | mill | 0 | 297 | 386 → 403 | 1614 | 46 % → 42 % |
| sg_harbor (`sg.harbor`) | harbour | 4 | 1935 | 774 → 511 | 33 | 74 % → 79 % |
| sg_glass (`sg.glass`) | workshop | 1 | 589 | 0 → 0 | 0 | 100 % → 100 % |
| sg_inn (`sg.inn`) | inn | 2 | 726 | 0 → 0 | 0 | 100 % → 100 % |
| sg_office (`sg.office`) | interior | 1 | 535 | 0 → 0 | 0 | 100 % → 100 % |
| sg_lighthouse (`sg.lighthouse`) | interior | 1 | 505 | 416 → 50 | 1 | 55 % → 91 % |
| sg_da_entry (`sg.da_entry`) | archive | 0 | 291 | 132 → 123 | 13276 | 74 % → 70 % |
| co_village (`co.village`) | town square | 3 | 2021 | 1012 → 680 | 3689 | 68 % → 75 % |
| co_glass (`co.glass`) | workshop | 2 | 600 | 1139 → 793 | 19 | 37 % → 43 % |
| co_pottery (`co.pottery`) | workshop | 1 | 597 | 0 → 0 | 0 | 100 % → 100 % |
| co_lookout (`co.lookout`) | view from height | 0 | 475 | 2208 → 536 | 2386 | 17 % → 47 % |
| co_oldworks (`co.oldworks`) | dungeon | 0 | 388 | 0 → 0 | 1415 | 100 % → 100 % |
| sb_road (`sb.road`) | roadside | 1 | 644 | 922 → 737 | 2273 | 41 % → 47 % |
| sb_hamlet (`sb.hamlet`) | town square | 3 | 2053 | 886 → 330 | 2812 | 70 % → 86 % |
| sb_inn (`sb.inn`) | inn | 3 | 967 | 515 → 299 | 23 | 68 % → 76 % |
| lf_town (`lf.town`) | town square | 0 | 600 | 2289 → 1282 | 41 | 25 % → 32 % |
| lf_bakery (`lf.bakery`) | shop | 1 | 521 | 26 → 26 | 1 | 96 % → 95 % |
| lf_gardens (`lf.gardens`) | quest | 2 | 828 | 2447 → 2216 | 4453 | 25 % → 27 % |
| lf_records (`lf.records`) | interior | 2 | 793 | 571 → 211 | 0 | 59 % → 79 % |
| sa_camp (`sa.camp`) | camp | 3 | 781 | 1528 → 1252 | 2471 | 39 % → 38 % |
| sa_reading (`sa.reading`) | archive | 1 | 498 | 0 → 0 | 11281 | 100 % → 100 % |
| sa_conduits (`sa.conduits`) | archive | 0 | 406 | 845 → 118 | 0 | 35 % → 78 % |
| lq_koharu (`lq.koharu`) | quest | 0 | 409 | 1806 → 1569 | 4160 | 18 % → 21 % |
| atlas (`atlas.39u.t`) | atlas | 0 | 243 | 177 → 179 | 7689 | 60 % → 58 % |

Two full rounds (before and after each) gave the same picture within a few points. The first round's figures
for the same places: Reedwake square 58 → 61 %, the hall 37 → 63 %, the quay 74 → 79 %, the lookout 16 → 46 %,
the Snowbell square 71 → 86 %.

Reading the table:
- **Where people gather, they now own most of the motion.** The squares of Reedwake (62 %), Cinder Orchard
  (75 %), Snowbell (86 %) and the Saltglass quay (79 %) qualify, as do the teahouse, the inns, the bakery and
  the records hall (76–100 %).
- **The biggest shifts are the lamps and the light pools:**
  - Reedwake's hall 37 → 62 %;
  - the lighthouse 55 → 91 % (the lens);
  - the lookout 17 → 47 % (the glints);
  - the Snowbell square 70 → 86 %;
  - Lanternfall 2,289 → 1,282 px of lamp twinkle with nobody in view;
  - the conduits 845 → 118 (the glints' light pools).
- **Places without people stay environment-led by design:** the roads, the mill (the wheel is its subject), the
  gardens' trees and pond, and Koharuno.
- **Weather dominates where it is the mood:** pages in the Archive, snow, leaves, fireflies. It is counted
  apart and was not changed.
- **The Archive-road camp stays about 40 %.** The fire is slower, but the camp's snow-laden pines lean in the
  wind across the bottom of the view, and three people sitting or standing still by a fire move little. That
  is a calm place reading as calm.

### WI25: conversation continuity (`tests/unit/conversation_continuity.test.mjs`)

Data-driven over every scene with staging cues, so scenes staged later are checked when they arrive. Each
`!gesture` cue (and its `then=` chain) is resolved to the person:
- companions are resolved from where the scene can start (talk entries, props, triggers, arrivals, `!call`), its
  `comp` guards and the cue's own condition;
- `pc` is the player.

The cue is then classed against that person's mannerism profile:
- own (`talk`, idle and route habits, workplace and story overrides, Suzu's `serious` register);
- occupation (their working habit held or stopped: Hiro's gather held to cool);
- tell; strong;
- class overlay;
- common attention (primitives 1–4);
- object (13–16, with a prop or target);
- outside.

It fails on:
- a gesture outside the vocabulary;
- a stronger reaction written for a staged scene and not shown there;
- Ren adjusting their glasses more than once a scene;
- Suzu's hand-on-hip stance in a scene;
- a tense opener (recoil, folded arms, hand to forehead, the emphatic hand) that is not the person's tell;
- a laugh or celebration before that person's line tagged sad, cry, angry or worry, or a lowered head, bow or
  recoil before one tagged happy or laugh.

Cases found when it was written are listed in the test with a reason; an entry that stops occurring fails too.

- **Result:** 7 staged scenes, 116 gesture cues:
  - own 50; tell 24; common 17; class 7; object 6; strong 2; occupation 1;
  - outside 9, all documented.

  People staged in two or more scenes: Mio, Nao, the player, Ren, Suzu. Each keeps to their vocabulary in
  every scene, apart from the documented cases.
- **Documented escalations (accepted):**
  - Ren's bow in `co.hiro_first` ("As a lantern keeper, I'm in your debt": their thanks, 30, made formal);
  - Mio's half-raised hand in `lf.mio_refuse` (narrated: her mouth starts to shape a yes and stops);
  - the player's hand on her back (narrated).
- **Open findings (for the profiles' or the scenes' owner):**
  - Suzu's head shake in `co.suzu_night` (20 is in neither her talk nor her serious register).
  - `lf.mio_refuse`: Tadashi's profile gives halfraise as his surprise tell and as his stronger reaction in
    this scene, but the scene gives him a startled look up (flinch) and gives the halfraise to Mio. This is two
    entries, one from each side.
  - Hana's point in `rw.hana_first` (10 is not in her talk or the host overlay).
  - Yae's aside and half-raise in `sb.yae` (her worry tell is countidle).
  - Wataru's two-handed size gesture in `sg.omi_wataru` (11 is Ōmi's stronger reaction in that scene, not his).
- **The check catches what it should:** a throwaway scene added and removed again (not committed) gave Ōmi a
  celebration before a sad line, Ren two glasses adjustments, Suzu the hip stance and every companion a folded-
  arms opener. All 11 issues were reported, and recurring people were flagged per scene.
- **Note for the lead:** a newly staged scene whose gesture is outside a person's profile fails this test until
  either the profile gains it or the case is documented in the test's `KNOWN` table with its reason. That is the
  intended use (the Chapter 1–2 staging worker's scenes are picked up at merge).

### WI26: portraits, from the scripts' side (`tests/unit/portrait_speakers.test.mjs`)

The portrait tests (portrait_anim) check every portrait the renderer knows. This check starts from who speaks:

- 4,626 spoken lines from 88 speakers, all of whom have a portrait.
- The 45 speakers with 20 or more lines all have a living loop: 48–88 frame changes in 30 s of a neutral line,
  at most 8 in any second, and 9–27 distinct frames that return to the still between motions. The rows are in
  the test's output.
- 1,535 lines (33 %) carry an expression tag. Every tag each speaker uses has a lead-in cue for that speaker, at
  most 900 ms. After it the face is still for 400 ms and then shows only its calm loop. So all 1,535 tagged
  lines open with a cue and settle.
- That a repeated speaker and tag replays no cue is `play()`'s rule. portrait_anim checks it with real clicks
  (section I) and its unit test; it is not re-checked here.
- **The sheet** `docs/screenshots/props_balance/after_portraits_major_speakers.webp` shows the 24 speakers with
  the most lines at 96 px: still, blink, their most used tag and that cue's peak.
  - By eye: the style is one family. Eyes read through glasses (Ren, Hoshino, Wataru, Tokiwa, Tadashi) and under
    brims (Ōmi, Umi, Genzō, Tokuji). Blinks close fully. Cues are visible but small.
  - Finding N11 (open, not changed): two pairs read alike. Tamae and Yae share skin 2, a red head-wrap
    (`#c8503a` / `#b8483a`), round eyes and an apron. Ōmi and Umi share skin 3, a dark hat, sharp eyes and a
    high collar. Their overworld looks match their portraits, so a fix is a character-design choice for the
    owner, not a portrait-data tweak.
- **No portrait data or code was changed.** The animator merges the actor system's `portrait` blocks over its
  own profile (`profileOf`). The 12 blocks now in `src/content/mannerisms/10_cast.js` hold descriptive text
  (`idle`, `cues`), which the animator does not read, so they change nothing. Checked: no key collides.
- **Still open:**
  - phones at device-pixel ratio 1, 2 and 2.625 scale the 64-px portrait unevenly;
  - NPC cues outside the bespoke set share the generic variants;
  - a person's judgement of all 85 faces.

### Tests run (this branch, final build)

The runs below are on the sources at `fc91ef8` (`index.html` rebuilt and unchanged since `d8bdfe0`, the last
source change). They ran one browser file at a time, while other workers' runs shared the machine.

**Unit, validator and geometry:**
- Unit, full suite: **24,351/0**. That includes:
  - the new `conversation_continuity` (30 checks, the 10 documented cases printed);
  - the new `portrait_speakers` (6 checks);
  - `overworld_geometry` 3/3. The record was not re-recorded: only `o` options changed, and the record has no
    `o`.
- Validator: **no errors**.

**New browser test, `props_balance.mjs --places`:**
- this branch: **48/48**;
- the build at `c2a799d`: **35 passed, 13 failed**, as expected. Each failure is one of the changes: the lamps;
  the campfire; the furnace; the faint glint; the decor sparkles; the glassworks furnace before and after; the
  lens; Nobu's kiln; the bisque kiln's seal; the wheel; the order-slip table; the harbourmaster's desk.
- The default run without `--places` takes about 2 minutes.

**Existing browser tests on this branch:**
- landmarks 54/54;
- portrait_anim all passed;
- world_view all ok;
- town_animals 41/41;
- practice_a_desk 45/45 (the Gull's writing desk now shows paper and ink);
- lighthouse_top 106/106;
- staging_wataru 112/112;
- staging_chapters 66/66;
- actor_workplaces 30/30 (run alone; Ōmi's desk, the glassworks and the camp fire are all in it).
- actor_life:
  - In the sequence it gave **37/39**. The failures were the frame budget on the Cinder eve (p95 16.6 ms, with a
    139 ms spike) and "a wanderer pauses on their round" (none within 30 s). Both are timing checks, and the
    sequence shared the machine with other workers.
  - Rerun alone twice: **39/39 and 39/39**. Frame time with the actor system on and off: p95 9.2 / 10.0 ms and
    12.7 / 10.7 ms; the scheduler 0.16–0.2 ms a tick.
  - No assertion was changed.

The test runs wrote captures into other owners' evidence folders (`docs/screenshots/actors/`,
`docs/screenshots/practice_a/`). Those were restored and not committed.

### Evidence

`docs/screenshots/props_balance/` holds `before_*.webp` (the build at `c2a799d`) and `after_*.webp` (this
branch). Each is a crop from the real renderer at 1280×800, written by `node tests/e2e/props_balance_shots.mjs
--tag before|after [--html …]`. Animated props are frame strips taken from the running game at a fixed step,
left to right:
- `glassworks_furnace_before_ash`, `glassworks_furnace_after_ash` (a 6-frame strip at 340 ms);
- `lighthouse_lens_rationed`, `lighthouse_lens_full` (strips);
- `nobu_kiln`, `oldworks_kiln_and_seal`;
- `lookout_glints` (the whole view), `conduits_basin`;
- `potters_wheel`, `pottery_order_slip_table`, `harbour_office_desk`, `yukimiya_shogi_table`, `tokuji_cups`;
- `lanternfall_lampposts`, `reedwake_lantern` (10 frames at 150 ms: the twinkle before, the steady light
  after);
- `camp_fire` (8 at 90 ms), `cinder_furnace` (8 at 150 ms);
- `after_portraits_major_speakers` (WI26).

### WI rows advanced (proposed; boxes left for the lead)

- **WI18** (props and environment reviewed and balanced): **done in this pass**. It covered quest, shop,
  harbour, inn, mill and workshop, roadside, domestic, Archive and Atlas places.
- **WI27** (prop/environment validation): **done in Chromium**: `props_balance.mjs` (balance, readability,
  story states, reduced motion). A person's look on a real screen is still owed.
- **WI19 / WI28** (the review ledger): REVIEW.md is brought up to date across every chapter, with statuses,
  what fixed what, the open items and strengths. It is still a worker's reading of captures, not a person's
  by-eye pass in a running build.
- **WI25** (conversation continuity): **verified by a unit check** over all staged scenes; 7 open findings
  reported.
- **WI26** (portraits): **advanced**. The script-side coverage, the loops, the cues and the settle are verified
  by a unit check; the sheet was reviewed by the worker. N11 and the phone scaling remain open, and a person's
  review is owed.

### Not verified

- Firefox, Safari, a real phone or the foldable.
- A person's judgement of any of the art. Every "reads" above is the worker's reading of captures; the contrast
  measure is a proxy.
- The motion split is timing-sensitive on a shared machine (reported, not asserted).
- The Chapter 1–2 scenes being staged by another worker were not available to the continuity check.
- Whether Kōhei and Kinu turn to each other at the fence (R36).
- Hiro in `co.glass` showed little motion in one probe state before his first scene. That is the actor system's
  area, and actor_workplaces covers his working state.
