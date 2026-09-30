# Field Inkweaving, the Mill Road, puzzles F1–F6 and Roadside Keepsakes

Worker D1's record for the owner's addendum (§12, §13, §14.1–14.7, §17,
§18.1, §21, §22, §23.5, §23.6, Appendix B). It lists what exists, how it
connects, what was tested and how, and what is still open. "Browser test"
means Playwright + Chromium driving the built `index.html`. "Unit test"
means `node tests/run-unit.mjs`. "Visual inspection" means I looked at the
captured images myself. Nothing here was playtested by a person.

## 1. Files and APIs

| File | What it is |
|---|---|
| `src/engine/55_fieldweave.js` | `RB.fieldweave`: puzzles as data, and the rules engine. |
| `src/ui/57_weave.js` | `RB.weave`: the Weave control, the target sheet, the language step, presentation, support marks and scene hooks. Also exposes `RB.weaveFx.draw`. |
| `src/ui/58_keepsakes.js` | `RB.ui.keepsakes`: Journey › Keepsakes, the first-find notice, the settings row, and the display on Company › Shared memories. |
| `src/content/discovery/00_lex.js` | Lexicon (`discovery`) for every new word. |
| `src/content/discovery/05_millroad.js` | The Mill Road hook `mr_heading` and the condition term `mr_mouth`. |
| `src/content/discovery/10_puzzles.js` | F1–F6 definitions, and the save migration (`RB.save.addMigration(FW.repair)`). |
| `src/content/discovery/20_props.js`, `21_props_more.js` | The puzzle objects' pixel art (`RB.propArt.art`), drawn from the live puzzle state. |
| `src/content/discovery/30_scenes.js` | Inspection scenes, plus the one-off NPC lines that follow a completion. |
| `src/content/discovery/40_maps.js` | Placements in the existing maps, guarded talk lines, and the new NPC Fumi. |
| `src/content/discovery/50_reactions.js` | Companion reactions: 4 companions × every method, plus a fallback, for F1–F6. |
| `src/content/discovery/60_keepsakes.js` | The six keepsakes: name, description, how it is found, region, source, hints, and art. |
| `src/styles/70_discovery.css` | The sheet, the label, the keepsake page, and the filing sheet. |
| `tests/unit/fieldweave.test.mjs` | Engine, routes, repair, reactions, placements, the Mill Road matrix, and the text. |
| `tests/e2e/fieldweave.mjs`, `mill_road.mjs`, `keepsakes.mjs` | Browser tests, added to `tests/e2e/run.mjs`. |
| `tests/e2e/fieldweave_video.mjs` | The WebM recording. Not part of the suite. |

### `RB.fieldweave` (engine; no DOM)

- **`define(def)`, `get(id)`, `list()`.** A definition has these fields: `id`, `region`, `map`, `title`, `eligible` (a condition string or null), `init`, `values` (the allowed values per key), `solved`, `objects{key: {x, y, w, h, tall, name, look[], weave?}}`, `rules[]`, `complete` (an outcome predicate), `after`, `after_acts`, `methods[]`, `marks[]`, `reward{keepsake, say}`, `hints[3]`, `solvedSay`, `resetSay`, `noReset`, and for F6 `arrange`, `arrangeObj` and `check(state)`.
- **Rules.** Each rule is `{act | weave, obj, if, set, say, obs, fx}`.
  - `if` is a state match: an object, a list (any of them), or a function. An array value means "one of".
  - `set` and `say` may be functions of the state. F5 uses this for its channel model.
  - The first rule that matches the object and the current state wins. A weave rule is keyed by response family, never by word.
- **`act(s, pz, name)`, `weave(s, pz, key, word, lang)`, `arrange(s, pz, patch)`, `reset(s, pz)`.** These are the only commits. They return a result `{pz, kind, before, after, changed, effective, completed, first, method, keepsake, say[], fx, family, id}`. The presentation shows that result afterwards and never writes state.
- **Results and events.**
  - `commit` records `done`, `method` and `via`, then applies `after` (a temporary support gives way to the lasting ordinary arrangement).
  - `RB.state.once(s, 'puzzle:<id>:done')` makes the keepsake award happen once, through `RB.discovery.keepsake`.
  - `discovery:resolved {kind:'puzzle', id, region, method, id2, map}` is emitted on completion.
  - `world:changed {map, prop:'<pz>.<key>', state, puzzle}` is emitted for every changed key.
- **Read-only helpers.** `peek` is a virtual read that writes nothing. Also `stateOf`, `view` and `setHold` (the display hold during an animation), `lookOf`, `observe`, `near(s, map, x, y, dir)` (authored objects within 2 tiles, the one in front first), `eligible`, `routine(s, pz, key, word)`, `hint` and `hintLevel`, `familyOf(word)`, `FAMILY` and `PLAIN`.
- **`repair(st)`.** This is the save migration. It fixes a puzzle record with invalid keys or values, and only that record: an unknown id is kept, and the state becomes `init` (or `solved` when the record is done). Observations, `done`, `method` and keepsakes are kept. Running it twice changes nothing.
- **Condition terms.** `puzzle.f1` (a record exists), `puzzle.f1=done` and `puzzle.f1.key=value`. From 57_weave: `weave` (any inscription word known). From 05_millroad: `mr_mouth`.

### `RB.weave` (UI)

- **Opening the sheet.** `open(o)` / `close()`. The action is `weave`, default key V. It is remappable in Settings › Keys and does not collide with movement, word help (H), IME, menu (C/Tab), map (M), log (L) or translation (T). There is also a HUD tag `.hud .weave-b` and a touch button `.touchpad .tp-weave`. Each is shown only when an authored, eligible object is within 2 tiles and a word is known.
- **The sheet.** It is a radiogroup of the nearby things; the arrow keys change the target, and clicking or tapping the thing in the world selects it too. The chosen thing is described from what can be seen (`look`). The known words are cards; nothing is highlighted, and a card says "Done here before" after a routine. There are three hint layers and a Reset (shown only when something moved and the puzzle allows it).
- **Docking.** The sheet sits beside the view on wide or short-landscape screens. Otherwise it sits above or below, whichever side the player and the target are not on.
- **The language step.** `choose(word)` runs the real `RB.challenge.runStep` with a write step: item `v:<word>`, answer the reading, kanji accepted. It has the challenge's own help policy. "Choose a different word" cancels, and changes nothing. A routine repeat (the same word worked on this object before) skips the step and earns no recall credit.
- **Presentation.** `present(res)` emits `present:action {scope:'field', actor:'pc', action, family, targets:['obj:<pz>.<key>'], at, result:'complete'|'effective'|'neutral', id}` and plays the beats: dip, raise the brush, send, hit at the target, the object's change on the beat, the effect, recovery (1.56 s for a weave, 0.56 s for an act; shorter with reduced motion; skipped in test auto mode). Then come the physical explanation, the reward line, and the companion's first brief reaction (`RB.company.react`, event `puzzle:<id>`, facts `{method}`).
- **Where the effects come from.** Effects reuse `RB.battleFx.fx` (sealForm, splash, flash, wind, rope, stone, frost, warm, rings, motes) through an anchor adapter. The hand and brush use the player's own sleeve and skin colours.
- **Support marks.** They are drawn from the committed state: `ward` (F1), `rope` (F2), `stone` and `glow` (F3).
- **Scene hooks.** `!hook fw_act pz name`, `fw_look pz key`, `fw_hint pz`, `fw_reset pz`, `fw_open pz key` (Weave from an inspection menu) and `fw_arrange pz` (the F6 filing sheet).
- **For props and tests.** `cue(pz)` (for prop animation), `busy()`, `isOpen()` and `state()`.

### `RB.ui.keepsakes`

- The Journey page `keepsakes` (alias `RB.ui.menu.open('keepsakes')`).
- `counts(s)`, `artCanvas(id, scale, dim)`, `addRegion(def)` and `displayHtml(s)`.
- A settings row in Display: `keepsakeCounts`.
- A wrapper on `RB.ui.company.render` that shows the pinned keepsake on Shared memories.
- The first-find toast, queued until any field presentation is over.

## 2. The Mill Road (§14.1)

- **Terrain.** A rocky ridge (`^`, rows 13–16) crosses `rw.millroad` from the tree line to the river reeds. It has exactly two one-tile openings:
  - **The echoing narrows (x 6).** The trigger `rw.mr_narrows` sits at the only mouth (6,16). Echo props are drawn on (6,13–15) until Suzu's round (`rw_mr_suzu`) or the chapter's end (`rw_echo_done`).
  - **The animal track (x 12).** It is closed by four reed tufts at (12,14–17). Their collision is exactly the drawn tufts. Nao opens it (`rw_mr_nao`).
- **Direction of the push.** The narrows push back only whoever walks up into them. Walking down, the player passes: once with a line that says so, and afterwards without any scene (term `mr_mouth`). So a player on the mill side (by the other way, coming out of the mill, or from an older save) is never held there.
- **Observation first, help optional.**
  - Looking at the reeds sets `rw_mr_obs_reeds`. Being pushed by the voices sets `rw_mr_obs_echo`.
  - Nao and Suzu then offer an optional reading of what you saw. Both answers lead on, and asking stays a one-step choice.
  - No bond is awarded: these scenes come before any companion is chosen.
- **Verified by unit test.**
  - Every flag combination (none, nao, suzu, both, echo_done, observations only): the mill door (9,5) is reachable from the road only with nao, suzu or echo_done.
  - Every standable tile north of the ridge can walk home.
  - The ridge openings are exactly x 6 and x 12.
  - The reeds block exactly where they are drawn.
  - The trigger sits at the only mouth.
- **Verified by browser test.**
  - Click-to-walk (a real mouse click on the mill door) for all six flag combinations.
  - Held arrow keys up both ways for each relevant flag set, and down through the narrows twice.
  - Walking out of the mill and clicking the village exit, with four flag sets.
  - Ten older-save positions on the mill side (including inside the narrows, on the trigger, and on the reed tiles, which the world moves to the nearest free tile) walk home with a click.
  - Asking Nao or Suzu, with no bond.

## 3. The puzzles

The definitions are data in `10_puzzles.js`. For each puzzle: where it is (and why), what can be observed, every accepted route, the attempts that do not work, the persistent result, the reward and the hints. Every puzzle also has an ordinary route that uses no words, so each can be solved at first access. The words used by the woven routes are all learned before, or in, the region:

- mamoru, iyasu, hikari and mizu in chapter 1;
- kaze and nawa in chapter 2;
- ishi, tsuchi and koori in chapter 3;
- honoo in chapter 4;
- suzu and koe in chapter 5.

### F1 — A Dry Place for Names (Reedwake, `rw.village`)

- **Where.** The nook between the river warehouse and the river: the screen at (32,22) and the clamp post at (33,22). A crate and a barrel that stood there were moved aside. It is an existing work corner by a village structure, away from the mill-road choice sequence, so that sequence keeps its own place.
- **What can be observed.**
  - The screen swings in the draught. This is shown by animation and in the inspection text.
  - The paper itself is dry.
  - The clamp cannot close on a moving edge.
  - Nothing depends on hearing.
- **Accepted routes** (both end with `clamp: set`):
  - *screened* — swing the screen shut against its post, then close the clamp.
  - *warded* — weave Protect on the screen (the ward holds it, as a step; there is no timer), then close the clamp. Afterwards the ward lets go and the screen stays shut.
- **Attempts that do not work, and why.**
  - The clamp while the screen swings: it can't close on a moving edge.
  - Water: the slips are dry and the water beads off.
  - Light: it shows the movement but doesn't stop it.
  - Wind: the screen swings harder.
  - Bind: nothing steady to tie to.
  - Protect on a screen already shut: nothing to hold.
  - Letting go of the screen is reversible.
- **Persistent result.** The screen stays clamped and the slips can be read (the inspection shows the shelf list). Tomo has a one-off line.
- **Reward.** The keepsake is the Folded Reed Boat.
- **Hints.** Three layers: watch the screen; keep the draught off or hold it; the whole route.

### F2 — The Signal Float (Saltglass, `sg.harbor`)

- **Where.** On the sand past the east end of the quay, at (44–46, 24–25): the diagram, the vane post, the winch/crank, the inlet, the tank and the vent pipe. It is away from the tide board on the west quay, so the harbour's own tide reading stays separate.
- **What can be observed.**
  - The diagram uses arrows, shapes and numbered text, not colour: ① the vent must be open to fill, the line needs the catch to hold, the crank lifts, ⑥ the vane on the pulley axle.
  - Filling with the vent shut gurgles back up (animated) and the level does not change.
- **Accepted routes** (each ends with `float: slot`):
  - *filled* — open the vent, drop the catch, weave Water into the inlet or tank.
  - *cranked* — drop the catch, then wind the crank.
  - *vane* — the catch (by hand, or woven Bind on the crank or post, which ties the line and drops the catch), then weave Wind on the vane.
  - Mixed orders are accepted.
- **Attempts that do not work, and why.**
  - Water with the vent shut: it bubbles back.
  - Water with no catch: the float rises and rests against the edge stop. It is not lost. The tank's "Drain it" and Reset return it to the cradle.
  - The crank with no catch: the float sinks back when you let go.
  - Wind anywhere but the vane.
  - Light on the tank only shows the float.
- **Persistent result.** The float is held at the viewing slot. After a Bind, the cord lets go and the catch holds. Tobi has a one-off line.
- **Reward.** The keepsake is the Painted Cork Float, a spare. The working float stays in the tank.
- **Reset.** Reset in the sheet or at the tank.

### F3 — The Maker's Mark (Cinder Orchard, `co.glass`)

- **Where.** The east side of Isao's glass workshop: the wedge rack at (9,5), the tray at (10,5), the arm lamp at (11,4) and the workshop note at (11,5). The unfinished globes on the table at (5,5) are the nearby work that must not be disturbed.
- **What can be observed.**
  - The tray rocks, because one foot is short.
  - Light from above shows nothing.
  - The note says: steady support and light from the side.
  - The mark key is on the note: leaf = Hiro, three dots = Isao, wave = the old master.
- **Two independent conditions.** The support must be `peg` or `stone`, and the light must be `side` or `woven`. All four combinations are accepted:
  - *ordinary* — wedge and the lamp swung low;
  - *woven* — Stone or Earth on the tray, and Light woven on the tray;
  - *mixed* — either of the other two combinations.
  - The unit test runs all 7 orderings of these steps.
- **Attempts that do not work, and why.**
  - Wind does not steady the tray.
  - Heat or fire is declined: the finished and unfinished work stay safe.
  - Water, Ice and Protect do nothing.
  - Bind has no hold on a rocking tray.
  - Light on the lamp itself does nothing.
- **Persistent result.** The tray stays supported; afterwards the workshop's own wedge holds it. The name card is back in its holder ("made by Hiro"), and Isao has a line.
- **Reward.** The keepsake is the Glass Leaf, from Hiro's dish, not a tool.

### F4 — The Frosted Compartments (Snowbell, `sb.hamlet`)

- **Where.** East of the post shelter: the note at (32,28), three boxes under one glass cover at (33–35,28), and the warming box at (36,28). Players stand on row 29, and row 27 stays free.
- **What can be observed.**
  - The note describes a relation: "the box with no name that has the same stamp as Hayate's".
  - Frost hides the labels. Once exposed, their full text is in words: ① "Hayate" with a round stamp, ② no name with a triangle, ③ no name with a round stamp.
  - The solution depends on the note, not on colour.
- **Accepted routes.**
  - *cloth* — the warm cloth from the warming box.
  - *flame* — Fire woven on the cover's marked warming point.
  - Then open ③ with the ordinary action. There is no second quiz.
- **Attempts that do not work, and why.**
  - A frozen door will not open.
  - Ice, Light, Water and Wind on the frost change nothing.
  - Box ① says "Collected", box ② says "Please leave", and each closes again.
  - Nothing is taken or broken.
  - There is no time limit, and the frost never comes back (`noReset`).
- **Persistent result.** The cover stays clear. Denji (who carved the toggles) has a line.
- **Reward.** The keepsake is the Snowflake Toggle, one of a publicly offered heap.

### F5 — A Room That Answers Twice (Lanternfall, `lf.gardens`)

- **Where.** A listening corner of the Garden Quarter, along row 13 (x 15–21): the reading nook where Fumi sits, the flap B, curtain mouth L, the alcove with its chime, curtain mouth R, the display niche and the tube diagram. It is far from the fence dispute on the north side.
- **Why here and not an indoor alcove.** There is no existing small interior. This is an outdoor substitute, and Fumi is a new, one-place NPC whose reading gives the nook its "occupied" fact.
- **The channel model** (`route(st)`), which the diagram shows:
  - The alcove feeds curtain L and curtain R.
  - L leads to flap B, which sends the sound to the nook or up to the cross tube and over to the display.
  - R leads to the display.
  - A test note says, in text, which way it went. Nothing needs hearing.
- **Accepted arrangements.**
  - L down (drawn) and R up (open).
  - The flap over to the cross tube (L open), with R open or drawn.
- **Accepted signals.**
  - *struck* — the ordinary chime.
  - *rung* — Bell or Voice woven in the alcove.
- **Attempts that do not work, and why.**
  - As found, the note reaches the nook. A quiet explanation follows and the state stays editable.
  - Wind is not a signal.
  - A bell word on a tube or curtain goes nowhere.
  - Repeating or "louder" never replaces the routing.
- **Persistent result.** The diagram shows the player's confirmed arrangement. The chime can still be struck afterwards (`after_acts`). Fumi has a line.
- **Reward.** The keepsake is the Miniature Bell Clapper, a spare.

### F6 — The Unbound Index (the Archive road, `sa.hut`)

- **Where.** Oyone's index box on the wall of the Last Lamp Hut at (7,2), and the tray of loose slips at (9,4).
- **When it is offered.** It is eligible `!sa_descent|sa_done|post`: never during the descent, and always after the ending. The hut stays open after the ending, so no exterior move was needed.
- **What can be observed.**
  - The rule inside the lid: notched slips go to Held for collection; the others go by the pressed stamp, ▲ to Going up and ▼ to Coming down.
  - The notch can be seen.
  - The stamps are too faint until raised.
  - Nothing is an invented kanji meaning or a cipher.
- **Accepted routes.**
  - *lit* — Light woven on the slips or the box.
  - *rubbed* — a charcoal rubbing.
  - Then file the slips in the filing sheet. It is keyboard and touch friendly (one radio group per slip, including "Not filed"), and any order works.
  - The outcome predicate is `marks: shown`, ① down, ② held, ③ up.
- **Attempts that do not work, and why.**
  - Wind, Fire and Water change nothing.
  - Wrong placements stay editable. "Check against the rule" names the visible rule each one breaks, only when asked.
- **Persistent result.** The index stays ordered. Oyone has a line (guarded until after you have met her, and not during the descent).
- **Reward.** The keepsake is the Pocket Paperweight.

### Common to all six

- **Availability by chapter and profile.** Every learner profile gets the same puzzles and the same evidence; only the language step adapts (kana, or kana or kanji). The browser test checks profiles F, E, I and A.

  | Puzzle | First reachable | Eligible | Woven words available then | Methods recorded |
  |---|---|---|---|---|
  | F1 | ch1, Reedwake village | always | mamoru (ch1) | screened, warded |
  | F2 | ch2, Saltglass harbour | always | mizu (ch1); kaze and nawa (ch2) | filled, cranked, vane |
  | F3 | ch3, Cinder Orchard | always | hikari (ch1); ishi and tsuchi (ch3) | ordinary, woven, mixed |
  | F4 | ch4, Snowbell | always | honoo (ch4) | cloth, flame |
  | F5 | ch5, Lanternfall | always | suzu and koe (ch5) | struck, rung |
  | F6 | ch6, the Last Lamp Hut | not during the descent; always after it and after the ending | hikari (ch1) | lit, rubbed |

- **Companion reactions.** Every companion has a reaction for every method, plus a fallback: `50_reactions.js`, 1 line each. None explains the route not taken. The reaction chosen is kept in `s.company.react['puzzle:<id>:done']`, so it is the same after a reload and in the catalogue.
- **Late saves.** A save made before this work has no records, and each puzzle starts fresh when first touched. No puzzle blocks a main route. If an older save stands on a tile that is now a puzzle object (or a Mill Road reed), the world's own `unstick` moves the player to the nearest free tile on load. The browser test checks this for the reed tiles. An invalid record is repaired by the migration. Completed puzzles are never re-awarded, because both `once` and the keepsake check guard the award.
- **World changes (§18.1).**
  - The art of every object is drawn from the committed state: the screen clamped, the float in the slot, the tray level with its card, the cover clear, the flower turned, the folders filled.
  - Collision is the props' own and does not change, except the Mill Road reeds.
  - Inspection text follows the state, and each place has one guarded NPC line.
  - None of the objects is a battle-backdrop landmark or context prop: `RB.battlePlaces.ROLE` has no `fw_*`, so a backdrop cannot show a stale state.
  - The Mill Road reeds are backdrop context and are read in their current state.

## 4. Roadside Keepsakes (§17)

- **The registry.** One registry, `RB.content.keepsakes`. D1 defines 6 entries; D2 defines 6 more; C2 adds mementos with `category: 'shared'`, naming the companion as `comp` or `companion`.
- **Counts.** The page counts found / total and known regions / 6. Counts can be hidden from the page or from Settings › Display.
- **Spoiler safety.** No name appears before a keepsake is found. Visited regions show their unfound entries as silhouettes. Unvisited places are grouped under "Places not yet visited", by number only.
- **Hints.** A broad hint, then a specific one, on request and at no cost. They are kept in `s.discovery.hints['keepsake:<id>']`.
- **The entry.**
  - Pixel art at 32×32, zoomed ×2, ×4 or ×8 with `image-rendering: pixelated`.
  - The name with its reading, the description, and where and how it was found.
  - The companion's comment from the time.
  - A link to the memory or case when one exists.
  - "Put on display" (`s.discovery.display`), which is also shown on Company › Shared memories.
- **The other sections.** Shared Journey counts only the current companion's mementos. Atlas Finds lists the owned Atlas reward items, with their effects unchanged.
- **The first-find notice.** A toast, once.
- **Only one award.** `RB.discovery.keepsake` refuses a second award of the same keepsake. A keepsake cannot be missed, because every puzzle stays solvable.

## 5. Coverage matrix

The Evidence column uses these tags:

- **U** — unit test, `tests/unit/fieldweave.test.mjs`
- **B-fw**, **B-mr**, **B-ks** — browser tests `tests/e2e/fieldweave.mjs`, `mill_road.mjs` and `keepsakes.mjs`
- **V** — visual inspection of captures
- **S** — source inspection only

| Requirement | Status | Evidence |
|---|---|---|
| §13.1 Weave beside Inspect, only at authored objects; remappable; mouse/touch/keyboard | done | B-fw "the Weave control", "phone" |
| §13.2 only learned words; the real validation and help; routine repeats direct; no costs | done | B-fw (cards, handwriting through the recogniser, IME, choice, "I don't know"); U (routine) |
| §13.3 target frame and label; list alternative; no hint of the right target | done | B-fw; V `sheet_wide`, `sheet_phone` |
| §13.4 language, applicability and completion separate | done | B-fw (Water on dry slips counted correct, world neutral; wrong-then-right typing; assisted completion); U |
| §13.5 data definitions, multiple routes, method recorded | done | U (all routes incl. F3's 7 combinations); B-fw (every method through the UI) |
| §13.6 reasons for ineffective attempts; reset keeps evidence | done | U; B-fw |
| §13.7 animation at the target; the world follows the state; no countdown | done | B-fw (frames, present:action, 3 s wait); V (F1 frames). Battle backdrops: S |
| §13.8 durable state, reload, repair, no double award | done | U (repair, once); B-fw (reload mid-puzzle and after completion; double commits) |
| §14.1 Mill Road | done | U matrix; B-mr (36 checks) |
| §14.2–14.7 F1–F6 as specified | done | U; B-fw; V |
| §17 keepsakes catalogue | done (6 of 12 here; D2 adds 6) | B-ks (32 checks); V |
| §18.1 persistent, inspectable consequence per puzzle | done | B-fw (state after completion and reload); V |
| §23.5 every family, mixed, ineffective, cancel, reset, reload, assisted, re-entry; all profiles and inputs; completion without handwriting | done | B-fw (profiles F/E/I/A; handwriting, IME, choice, assisted); F1 screened and F6 rubbed need no words at all |
| §23.6 catalogue checks | done for D1's six | B-ks |
| §23.7 two solutions with different companion feedback, recorded | done | `docs/screenshots/fieldweave/f1_two_routes.webm` |

## 6. Evidence and measured numbers

All runs were on this worktree's build, in headless Chromium, on a 4-CPU machine shared with other workers' test runs (load average 16–41). Wall-clock times reflect that load; they are not play times.

**Unit tests** (`node tests/run-unit.mjs fieldweave`): 390 checks, all passing.

**Browser tests:**

| Test | Checks | Result | Time |
|---|---|---|---|
| `tests/e2e/fieldweave.mjs` | 89 | all pass | 198 s on the final build; 270–460 s under heavier load |
| `tests/e2e/mill_road.mjs` | 36 | all pass | 145 s on the final build; up to 284 s under load |
| `tests/e2e/keepsakes.mjs` | 32 | all pass | 14 s on the final build; up to 53 s under load |

Sections of `fieldweave.mjs` can be run on their own, for example `node tests/e2e/fieldweave.mjs F2`.

**Content checks:**

- `node tools/validate.mjs`: no errors.
- `recog-coverage`: 15 of 15 pass after regenerating the data for 14 new kanji. The recogniser now reads 1570 kanji, and every clean reference is confident.

**Build size.** `index.html` grew from 5,589,429 bytes (aa825c3) to 5,865,139 bytes, or +4.9%. That includes the stroke data for the new kanji.

**Captures:**

- Raw: `tests/e2e/out/fieldweave/`, `out/mill_road/`, `out/keepsakes/` (gitignored).
- Curated, which I looked at myself: `docs/screenshots/fieldweave/` (see its README).
- Recording: `docs/screenshots/fieldweave/f1_two_routes.webm`, made by `tests/e2e/fieldweave_video.mjs`.

## 7. Limitations and open points

- **Nothing was playtested by a person.** Whether the puzzles are clear or fun, and whether the Japanese reads naturally, is not established by these tests.
- **F5's setting.** F5 is an outdoor substitute for "a listening alcove", with a new minor NPC (Fumi). There is no suitable small interior on that map.
- **No markers.** Quest guidance does not mark optional puzzles; they are not quests. The keepsake hints are the guidance layer. The Mill Road stage text ("Take the north path…") is unchanged.
- **Validator coverage.** `tools/validate.mjs` does not scan custom registries (`RB.content.keepsakes`, the puzzle definitions, the reactions). The unit test checks their Japanese instead (furigana, dictionary coverage). A future validator pass could include them.
- **Failures shared with the foundation build.**
  - `tests/e2e/departures.mjs` fails 3 checks (the evening gathering routes, Hana, Tsuru). The unmodified foundation build (aa825c3) fails the same 3.
  - `tests/e2e/learning_ui.mjs` fails its overflow test by timeout (180 s) under this machine's load. The foundation build fails it the same way.
- **Timing checks under load.**
  - Two unit timing checks failed once in the full suite (5058 passed, 2 failed) and passed on a rerun: kanji chart search (53/53) and recogniser p95 (37/37).
  - `battle_anim.mjs` failed its frame-cost and blow-timing checks under load (2 of 16 failed). The foundation build, run under the same load, failed 3 of 16, including the frame-cost check.
  - None of these touch field weaving: battles draw nothing of mine.
- **Test side effect.** Running `tests/e2e/quest_guide.mjs` rewrites `docs/screenshots/quest_guide/*.webp`. I restored them after my runs.

## 8. Merge notes (shared files touched)

- **`src/engine/10_input.js`** (+3 lines):
  - `weave: ['KeyV']` added to DEFAULT_BINDS, with a label.
  - In onKeyDown, before the default handler: `if (a === 'weave' && RB.weave && RB.weave.onKey(a)) return;`.
- **`src/engine/60_render.js`** (+3/−1):
  - drawActor adds `a.dy` to the sprite's y (the hand's dip) and calls `a.overlay(c, fx, fy + dy, t)` when present.
  - drawWorld's end calls `RB.weaveFx.draw(c, {ax, ay, bw, bh, TS, ART, HEAD}, t)`.
- **`src/content/ch1/11_maps_mill.js`:**
  - the ridge;
  - the reeds and echo props with conditions;
  - the rock made permanent;
  - the trigger `if` extended with `mr_mouth`.
- **`src/content/ch1/31_scenes_mill.js`:**
  - `rw.mr_narrows` (heading, one-time line, observation flag);
  - new `rw.mr_reeds`;
  - optional readings in `rw.mr_nao` and `rw.mr_suzu_talk`.
- **`tests/e2e/run.mjs`:** `fieldweave.mjs`, `mill_road.mjs` and `keepsakes.mjs` added after `quest_guide.mjs`.
- **Regenerated files** (`tools/kanjivg/fetch.mjs`, `convert.mjs`, `tools/kanjiread.mjs`): `src/recog/10_strokedata.js` and `src/lang/75_kanjiread.js`. These added 14 kanji (堅 展 己 据 斗 楔 槽 泡 爪 索 胴 茎 蘭 衝). If another worker also regenerated them, run the three tools again after merging rather than resolving them by hand.
- **Wrappers, not edits.**
  - `RB.ui.tick` (the Weave button's state).
  - `RB.ui.company.render` (the pinned keepsake on Shared memories; off with `RB.ui.keepsakes.settings.companyDecor = false` if C2 draws it with `displayHtml(s)`).
  - A settings row via `RB.ui.settings.addRows('display', …)`.
- **Reactions and bond.**
  - I show the first reaction line myself at completion, through `RB.company.react`. A listener on `discovery:resolved` should not show a second one.
  - I award no bond. Companionship can award it from `discovery:resolved`, which carries nothing about assistance.
