# The Unwritten Atlas (post-story play)

Spec §15. Code: `src/atlas/` (loaded after `src/content`, see `src/manifest.json`).
Tests: `tests/unit/atlas.test.mjs`, `tests/e2e/atlas.check.mjs`. Everything is prefixed `atlas`.

The Atlas is a set of unstable roads left behind while the world recovers: roads
that were never finished, or finished only in someone's intention, with lost
names still wandering on them. The story stays resolved — nobody's problems are
reset. An expedition is a small adventure of roughly 8–9 rooms: a gate to open, a
fork to choose, a camp, a second fork, a guardian at the end, and a lantern that
takes you home.

```
threshold → path room → fork ─┬─ branch A (1–2 rooms) ─┐
                              └─ branch B (1–2 rooms) ─┴→ camp ─┬─ branch C ─┐   (camp: rest, talk,
                                                                └─ branch D ─┴→ guardian → road home   or head home early)
```

## Files

| file | contents |
|---|---|
| `00_lex.js` | lexicon for atlas text (only words no chapter defines, so no conflicts) |
| `05_art.js` | blank-page tiles (`atlas_blank`, `atlas_sketch`), props (veil, stone, lamp, signpost, cache, waystone, folded page, blank map), overworld sprites (unmoored names, crab, bell, cartographer, gatekeeper), cosmetic accessories via a contained `RB.sprites.get` patch, enemy art for the Cartographer |
| `10_data.js` | route modifiers, temporary relics, combinations, permanent rewards (items), restoration details, notebook entries, encounters |
| `15_lang.js` | unmoored names (stories + 4-tier steps), inscriptions, road signs, promises, guardian legends, knot drills, door clues, authored plea/lie/mirror intents (128 drills tagged `atlas`) |
| `20_rooms.js` | 14 hand-drawn room patterns (2–3 variants each) + regional dressings |
| `30_gen.js` | seeded plan → maps, `prepare` for saves, objective step selection, step validation |
| `40_combat.js` | modifier intents, relic/charm effects, battle-scoped patches, Unravel-only simulator |
| `50_run.js` | hooks, run lifecycle, rewards, defeat, run HUD chip + detail panel, `_debug` helpers |
| `60_scenes.js` | authored scenes (arrivals, camp banter, guardians, homecoming, companion banter) |
| `70_check.js` | `RB.atlas.selfCheck(n)` |

## Integration contract

- **Entry**: `RB.hooks.atlas_start` (the Reedwake scene `rw.atlas_go` calls `!hook atlas_start`).
  Accepted when `flags.postgame` (or `flags.post`, or `atlas.unlocked`) is set. It
  shows a short first-time talk with Keeper Tsuru (complementing `rw.atlas_intro`:
  practical advice rather than a second explanation), offers **3 of 8 modifiers** plus
  "a quiet road" and "not today", generates the run and walks you into the threshold.
- **Exit**: `RB.hooks.atlas_extract` (`!hook atlas_extract` from the road home, or
  `!hook atlas_extract early` from a camp).
- **Run state**: `RB.game.s.atlas.run` (plain JSON): `{v, id, seed, mods, comp, tier, climax,
  fresh, room, path, done, objs, relics, combos, names, keepsakes, lantern, promises,
  bonusKnots, lastWrong, stats, started}`. Other persistent fields in `s.atlas`:
  `started, completed, runs, camps, patternsSeen, relicsSeen, last, lastSummary`.
- **Maps**: `RB.content.maps['atlas.<runId>.<room>']`, built deterministically from the run
  (`RB.atlas.register(run)`); rooms are `t p1 f1 a1 a2 b1 b2 c d1 e1 x z`. All atlas maps
  are `noTravel` and `noCheckpoint`; the Map tab's Travel list says why (`travelKind: 'expedition'`
  with its `noTravelWhy`: the lantern at the end of the road, or home early from a camp; see
  docs/CONTENT.md "Quick travel"). They are dropped again after the run.
- **Saves**: `RB.atlas.prepare(state)` (called by `src/engine/80_save.js`) re-registers the
  maps from the stored seed, moves the player to the room entry if their tile is not
  walkable, and keeps the defeat checkpoint in the Lantern Hall. If a run cannot be
  restored (unknown generator version, room not in the run, atlas map without a run), the
  player is moved to `rw.hall` safely, the run is closed and its flags cleaned; a notice
  explains it on arrival.
- **Run flags**: `atlas_r_*` in `s.flags` (plus the engine's own `foe:/enter:/trig:/named:`
  flags for atlas maps) — all removed when the run ends.
- **Defeat**: during a run the checkpoint is the Lantern Hall; a lost battle folds the road
  up (the engine's own defeat transition), then the run ends gently: learning progress is
  kept, names already sent home stay in the notebook, and a consolation is given (a name
  "caught on the way down" if any are left, otherwise a keepsake) plus the note
  `atlas_defeat`.
- **Companion**: the committed companion walks every expedition; nothing about the party
  changes.

### Runtime patches (all contained)
- `RB.combat.start` gets a thin bracket that installs wrappers around
  `RB.combatLogic.init / playerAct / enemyAct / endRound` **only for a battle that needs
  them** (an expedition battle, or any battle while an atlas charm is equipped) and restores
  the originals when the battle ends (tested).
- `RB.game.startBattle` gets a pass-through wrapper that, during a run only, ends the run
  gently on defeat and pours tea after wins when the Teapot relic is held.
- `RB.sprites.get` gets a wrapper that only acts on looks carrying an `atlas_*` accessory.
- Additions only: `RB.tiles.T.atlas_*`, `RB.props.P.atlas_*`, `RB.sprites.custom.atlas_*`,
  `RB.enemyArt.A.atlas_cartographer`, `RB.content.banter` entries for `atlas.*` maps.

### Notes for the coordinator
- `tools/validate.mjs` loads `['core','lang','recog','engine','learn','ui','content']`, so
  it reports `unknown hook atlas_start` for `rw.atlas_go` and never validates atlas
  content. Adding `'atlas'` to that list fixes the hook error; with it, the validator
  reports no atlas errors or warnings (checked with a patched copy).
- `RB.script.run` pops its `dialogue` mode only when the outermost scene ends, so calling
  it from inside a hook that runs within a scene leaves a stray `dialogue` mode (the world
  freezes). Fixed in the engine: every nested run now pops its own dialogue mode; other hook authors may
  hit the same thing.
- The first-time atlas intro has Keeper Tsuru speak (as `rw.tsuru_post` does).

## Room patterns (14, each with 2–3 hand-drawn variants)

Anchors in the ASCII templates are filled by the plan: gates (paper veils), objective
props, names, caches, foes, guardians, door lamps, low-tide shallows, promise alcoves.
Five dressings re-skin generic ground so a room can echo a region (meadow/Reedwake,
shore/Saltglass, snow/Snowbell, ash/Cinder Orchard, paper/the Archive); the Mirrored Road
flips every room.

| pattern | used as | objective | notes |
|---|---|---|---|
| The Half-written Gate | entry | inscription | the road behind folds shut |
| Row of Blank Lanterns | path/branch | lanterns (2–3) | first lantern revisits a weak item |
| The Unfinished Bridge | path/branch | road sign | the planks appear when the sign is right; low-tide nook |
| The Split Signpost | fork | — | signpost describes both roads; choose by walking |
| The Hall of Three Doors | path/branch | doors | read the tablet (and the lamps), walk through the right door |
| The Grove of Unmoored Names | path/branch | name | answer one name; others optional |
| Shelves Without Titles | path/branch/wild | inscription | ink foes in the aisles; guardian variant |
| The Wayfarers' Camp | camp | — | rest, banter, head home early, second fork |
| The Court of Unkept Promises | path/branch | promise | Promise-bound Ruin's first promise |
| The Tidal Stair | path/branch/wild | road sign | crabs; low-tide shallows |
| The Field of Margins | path/branch/wild | inscription | moths in the margins |
| The Still Pool | path/branch/wild | name | echoes |
| The Blank Map Room | climax | legend + guardian | promise alcove |
| The Road Home | extraction | — | the lantern that already says 葦ノ瀬 |

Branch types chosen at forks: **the lantern-lit road** (an objective and a find), **the
unwritten road** (a guardian bars the way and guards a relic or keepsake), **the road of
voices** (unmoored names), **the long way round** (two rooms, more finds).

## Local objectives (8 types)

| type | interaction | F | E | I | A |
|---|---|---|---|---|---|
| inscription | restore a word on a stone / shelf label / lantern | kana word (help-before-test blanking) | vocabulary in context | grammar/verb form in context | register & connective choice |
| lanterns | light 2–3 lanterns, one step each | taught kana / F words | atlas knot drills | 〃 | 〃 |
| road sign | put a half-written sign back in order | 3-tile kana phrase | particles & requests | multi-clause directions | formal notices |
| promise | what does this loose promise commit someone to? | kana promise → meaning | までに, ても, ておく | conditions, つもり, scope (incl. 「必要なら開ける」) | implication, bureaucratic register (善処, 持ち帰って検討) |
| name | answer an unmoored name (10 small stories) | kana word | comprehension | inference | implication |
| doors | read a tablet (+ which lamps are out), walk through the right door | 右/左/まっすぐ | negation | condition + environment | multi-clause elimination |
| legend | read the guardian before the fight; understanding removes a knot | | | | |
| settle | battle (guardians, optional foes, the climax) | | | | |

Every step can be answered by handwriting, choices or IME, and "I don't know — show me"
always lets you continue (recorded as assisted), so no objective can block progress.

## Language selection
- Items come from atlas drills at the player's profile (falling back a level if needed),
  ranked with `RB.learn.pick` (due, weak and new first; its cooldowns keep a just-missed
  item from coming straight back) and never the item missed in the previous objective.
- The first lantern of a lantern row revisits something from `RB.learn.weakest` once it is
  off cooldown; battle pools on the road add the player's weakest items alongside the foe's
  own material.
- Advanced material is reading and interpretation; the longest handwritten answer is 5 kana.
- Chosen steps are remembered per objective (so stepping away and back shows the same one).

## Route modifiers (3 of 8 offered; pairs after 3 completed expeditions)

| id | name | effect |
|---|---|---|
| mirror | The Mirrored Road | every room drawn left↔right; written directions still mean what they say |
| escort | The Escorted Lantern | a 5-point lantern bar (shown in battle under the party bars and on the run chip); hits taken and wrong doors gutter it, camps rekindle it; bring it home lit for the Little Lantern keepsake; if it goes out the run carries on |
| promises | The Promise-bound Ruin | two promise objectives; the first opens a side room at the camp, the second loosens the guardian and opens a side room at the end |
| fog | Heavy Fog | foes gain shroud intents; misted rooms |
| echo | Echoing Halls | foes gain an authored mirror intent (your words thrown back twisted; see through it) |
| lowtide | Low Tide | shallows uncover side nooks with extra finds; foes gain flood intents |
| crowd | Wandering Names | more unmoored names, fewer foes |
| gusts | Paper Squall | foes gain gust intents (strip wards) |

## Temporary relics (14) and combinations (4)

| relic | effect |
|---|---|
| Sturdy Thread 丈夫な糸 | first Unravel each battle frees two knots |
| Spare Wick 予備の芯 | the first shroud each battle burns off at once |
| Spiral Shell 巻き貝 | seeing through a lie/echo frees an extra knot |
| Pickling Weight 重し石 | floods and gusts hit for 1 less; gusts no longer strip wards |
| Bundle of Letters 手紙の束 | both start each battle behind a ward |
| Little Bell 小さな鈴 | battles start with one harmony (Suzu has an opinion about the name) |
| Compass 方位磁石 | after a wrong door the needle points to the right one; signposts describe each road |
| Teapot for Two 急須 | after each win, a shared cup (+1 lantern) and a companion line |
| Chipped Inkstone 欠けた硯 | every second clean Unravel frees an extra knot, but slips cost 2 (not in Assisted mode) |
| Scrap of Map 地図の切れ端 | the guardian starts with one knot fewer; signposts describe each road |
| Postmarked Parcel Tag (Nao) | Nao reads three moves ahead; once per battle a clean Unravel sets up her opening |
| Stoppered Vial (Mio) | Mio's draught restores 2 and cools heat |
| Wick Trimmers (Ren) | stronger starting wards (2); a clean inscription while shrouded lets Ren clear the mist |
| Understudy's Mask (Suzu) | two misdirects per battle; Curtain Call frees three knots |

Combinations: **Taut Line** (thread + inkstone: first Unravel frees three), **Lamplit
Echo** (wick + shell: seeing through also clears mist), **Harbour Wall** (weight +
letters: any ward stops a flood), **Duet** (bell + your companion's relic: harmony starts
again at one after a technique). Each writes a notebook entry when discovered. Companion
relics are only placed for the companion who travels with you; each has its own finding
line, and several general relics trigger companion-specific reactions.

## Encounters (15)
Regular: Stray Name (plea), Margin Moth (shroud), Blotted Line (mend), Unfolded Crane
(gust/sweep), Mossy Milestone (charge), Guttering Lantern (heat), Road Echo (mirror), False
Gatekeeper (lie), Rock-pool Crab (flood), Name-borrowing Fox (lie). Combinations (after
two completed expeditions): Moth and Lantern, Echoing Gatekeeper. Guardians: the Blank
Cartographer (plea; phases), the Borrowed Bell (after one completion; lie; charge phase),
the Half-road Gatekeeper (after two; plea; mend phase). All plea/lie/mirror intents have
authored text and answer/truth steps at all four profiles. No foe uses `silence` (it would
block Unravel for players who know bell/voice words).

## Rewards (no streaks, leaderboards, clocks or escalating numbers)
- **Choose one permanent reward** on completing an expedition (two offered; the chosen
  modifier's signature reward is offered first). Pool (10 items):
  - charm sidegrades (work in every battle while equipped): Reed Knot (+1 starting ward /
    techniques need 4 harmony), Tide-glass (floods & sweeps −1 / word wards hold 1), Blank
    Bookmark (clean Unravels build double harmony / answering and seeing through build
    none), Mirror Shard (seeing through frees a knot / first Unravel frees nothing);
  - cosmetics: Map-paper Sash, Compass-rose Pin, Quill, Little Lantern (new accessories drawn
    by the atlas), Pressed Road-flower, Traveller's Cape (existing accessories).
  - Unowned cosmetics can also be found in guardian-guarded caches ("keepsakes"), which you
    keep even if you head home early.
- **Notebook discoveries**: 10 unmoored-name stories, 4 combinations, "Walking the unwritten
  roads", "Unmoored names", "Things found on the road", "A walk cut short", and 6 "News from
  the road" entries.
- **New encounter combinations**: the Borrowed Bell after 1 completion, combination foes after
  2, the Half-road Gatekeeper after 2, paired modifiers after 3.
- **Settlement restoration details**: flag `atlas_restore_k` is set on the k-th completed
  expedition (k ≤ 6), with a homecoming line and a notebook entry. Suggested hub decorations:

| flag | place | suggested decoration (and interactable text) |
|---|---|---|
| `atlas_restore_1` | Reedwake (`rw.village`, by Kōji's ferry landing) | a freshly painted signboard: 「{渡|わた}し{場|ば}」 "The Ferry Landing — crossing at dawn" |
| `atlas_restore_2` | Saltglass harbour | a basket/crate of returned cargo tags with a note: "Found tags returned to their owners" |
| `atlas_restore_3` | Cinder Orchard firebreak | a row of saplings (bush props) with small name tags / stone markers |
| `atlas_restore_4` | Snowbell, path to the observatory | waymarker stones (`stone_marker`) at intervals: "Observatory — 300 steps" |
| `atlas_restore_5` | Lanternfall notice board | a second board or column: 「{反対|はんたい}{意見|いけん}」 "Objections welcome" |
| `atlas_restore_6` | the lantern road (`rw.road` or a crossroads) | a new lit lantern bearing the name of a new place |

Once every reward is owned, expeditions still give names (until all ten are home), relics,
combinations and the adventure itself — nothing escalates.

## Validation

- `RB.atlas.selfCheck(n)` — n runs across all four profiles, every modifier alone and in
  pairs, every companion and unlock tier. Checks: route graph reaches the road home; the same
  geometry checks as `tools/validate.mjs` (equal rows, walkable spawn, exits landing on
  walkable non-exit tiles, known props, NPCs/foes on walkable tiles, scene references);
  staged reachability (with nothing solved every interactable is reachable; once solved every
  exit is reachable with optional foes' whole patrol boxes still in the way; a gated exit is
  not reachable before its gate opens; caches reachable); every objective yields a valid step
  with an existing item at every profile (Foundations with and without taught kana); every
  battle's enemy exists, its intents are valid and authored, and it is winnable **with Unravel
  alone** for every companion at normal and hard tactics, with and without a light word, with
  no relics / all relics / each charm.
- `node tests/run-unit.mjs atlas` — 240-run self-check plus content counts, Japanese markup
  and lexicon coverage for every atlas string, determinism, save restoration cases, language
  selection (mistake cooldown, weak-item revisit, Advanced never asks for long handwriting),
  patch install/removal, relic and charm effects.
- `node tests/e2e/atlas.check.mjs [--scenario complete|early|defeat] [--reload] [--via-scene]`
  — drives a whole expedition in Chromium through the real UI (tap-to-move, dialogue,
  choices, the challenge UI's reveal + continue, the Unravel card), including a real
  IndexedDB save → page reload → load in the middle of a run.

### Timing (honest)
A scripted run with instant text and auto-answers takes 40–60 s of wall clock; that is not
a playtime measurement. A typical complete expedition contains ~70–80 dialogue lines, 9–12
language steps, 2–3 battles (4–8 exchanges) and 8–9 rooms. With assumed rates (4–6 s per
line, 20–60 s per step, ~30 s per exchange, 20–40 s of walking per room) that is an
**estimated 13–28 minutes**; it has not been measured with players.

## Known limitations
- Rewards are chosen through dialogue choices; there is no dedicated atlas screen besides
  the run chip/panel.
- The escort lantern bar is injected into the combat bars with a MutationObserver (no engine
  hook exists for extra bars).
- Door clues at Foundations use 右/左/まっすぐ only; lamp states matter from Intermediate up.
- The atlas intro assumes Keeper Tsuru is present when `rw.atlas_go` runs.
