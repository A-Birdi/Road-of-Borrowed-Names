# Living Company and Discovery: shared contracts

This is the owner's addendum of 2026-09-30, *Living Company, Field Discovery,
and the Pages We Keep*. The shared foundation below was written first, so
the systems built on it (pets, companionship, the ending and the Atlas
project, field puzzles, cases, words) can be developed separately and still
fit together.

The addendum itself is the authority on scope and rules. This file covers
only how the parts connect. It does not claim that anything below the
foundation already exists.

## 0. Inventory (Phase A, taken from the code at 3ee0b3b)

### Figures and art
- **Road figures:** 40×58 art px, anchor (20,55), 2 art px per logical px, 32-px tiles (`src/engine/32_spriteart.js`).
- **Battle figures:** `RB.battlers`, 80×104 with anchor (36,100), rear three-quarter view, with poses and gestures (`src/engine/34_battlers.js`).
- **Portraits:** `RB.portraits.draw(canvas, id, expr)` and `drawPlayer(canvas, look, expr)`, S×S (`35_portraits.js`).

### Battle presentation
- `RB.combatLogic` (`src/engine/95_combat.js`) is the authority. `playerAct` and `compAct` return `{ fx }`, and `enemyAct` runs once per creature.
- `RB.battleSeq` (`src/ui/82_battle_seq.js`) stages those fx.
- `RB.battleStage` (`83_battle_stage.js`) provides the anchors `pc`, `comp`, `party`, `foe`, `foe:i` and `knot:i`.
- `RB.battleFx` (`84_battle_fx.js`) draws effects and status marks.
- Group battles: `st.foes[]`, with `st.cur` as the target.
- The companion's turn: `C.companionActions` (`src/content/02_companions.js`), read through `compOptions` and `compAct`.

### World following
- `50_world.js` keeps `W.trail` (the player's path).
- The companion walks it with `followRoute`.
- Departures and arrivals are described in HANDOFF.md.
- The collision grid belongs to the map; nothing cosmetic may write to it.

### Folio
- Journey, Words, Satchel and Map, now joined by **Company** (`src/ui/50_menu.js` and `52_company.js`).
- Old aliases still work.
- Save & Load and Settings are utilities on the folio's foot.

### Saves
- `RB.save.validate` checks shape. `migrate` fills missing top-level keys (and, since this foundation, the missing keys inside `company` and `discovery`), then runs registered migrations.
- Six slots are kept per browser, with a cross-tab lock.

### Dialogue priority
- The script runner (`70_script.js`) owns the dialogue.
- `body.in-dialogue` disables overlay pointer events.
- Scene commands can call `RB.hooks[name](args, ctx)` through `!hook name args`.

### Companion flags
- **Personal quests:** `co_suzu`, `lf_nao`, `lf_mio`, `ren_ushio` (`quest.<id>=done`).
- **Chapters:** `ch1_done` … `ch5_done`. `postgame` is set after the ending.
- **Long quest lines:** `lq_ally1` and `lq_ally2`.
- **The ending:** `sa.end_comp` in `src/content/ch6/53_scenes_ending.js`.

### Atlas
- `s.atlas.run` is the live run, created by `RB.hooks.atlas_start` and cleared at return (`src/atlas/50_run.js`).
- Its lifecycle hooks are `atlas_enter`, `atlas_obj`, `atlas_camp`, `atlas_climax`, `atlas_foe` and `atlas_extract`.
- The scenes are `atlas.camp`, `atlas.intro.*` and `atlas.room.*` (`src/atlas/60_scenes.js`).

## 1. Save namespaces (`src/engine/05_state.js` newCampaign)

All of these are optional in older saves; `migrate` fills them empty.

| Key | Owner | Content |
|---|---|---|
| `company.pets`, `company.pet` | pets | species → `{ name, reading, look, met:{t,map}, nameAtMeet }`; the active species or `null` |
| `company.bond`, `.memories`, `.talk`, `.react`, `.project` | companionship / ending | unique bond events → points; memories; topic records (`talk._pending` for one pending invitation); chosen reaction per resolved event; The Pages We Keep |
| `discovery.puzzles`, `.keepsakes`, `.display` | field puzzles | puzzle state `{ state, done, method, t, seen }`; keepsake discoveries; the pinned keepsake |
| `discovery.cases`, `.clues`, `.hints`, `.known`, `.pins` | cases | case records; observed clues; requested hint levels; authored annotations; player pins |
| `bookmarks`, `creatures` | words | kept sentences; creatures met |
| `awarded` | everyone, via `RB.state.once` | award-bearing event ids → time |

- Never store pets in the party, in `equip`, or in a flag.
- Never reuse an existing flag with a new meaning.
- Unknown ids from a later content change are kept and then ignored (the renderer falls back to no pet or no art); they are never deleted.

## 2. Once-only commits
`RB.state.once(s, id)` returns true the first time an id is committed and false afterwards. Every reward-bearing step goes through it or through a wrapper:
- `RB.company.award(s, id, pts)`: bond. Only with a committed companion; the event is recorded under `company.bond[id]`.
- `RB.company.memory(s, m)`: a memory, at most once per `m.id`.
- `RB.discovery.keepsake(s, id, how)`: a keepsake discovery.
- Pet acquisition uses `once(s, 'pet:met:<species>')`.

Id conventions:
- `bond`: `ch2` … `ch5`, `pq`, `puzzle:<region>`, `reflect:travel`, `reflect:keep`, `ending`, `project:1` … `3`.
- Puzzles: `puzzle:<id>:done`.
- Cases: `case:<id>:done`.

Commit the authoritative state first. Presentation (animation, sound, toasts, pet reactions) comes afterwards and never writes state.

## 3. Conditions
`RB.state.addTerm(head, fn)` adds condition heads. The foundation adds:
- `keepsake.<id>`;
- `memory.<id>`;
- `bond>=rhythm|trusted|lasting` (a stage id, or a number for internal checks).

Later systems add their own, for example:
- pets: `pet` (any active pet), `pet=cat`, `pet.cat` (met);
- puzzles: `puzzle.<id>=done`;
- cases: `case.<id>=done`, `clue.<id>`.

## 4. Scene commands
Use `!hook <name> <args…>` with `RB.hooks[name] = async (args, ctx) => {}`, the same pattern as the Atlas hooks. Don't add new ops to `70_script.js` unless a hook can't do the job.

## 5. Menus and settings
- `RB.ui.menu.addPage('journey' | 'words' | 'map', def)`:
  - journey and map pages: `{ id, en, icon, available?(s), render(holder, B, two, api) }`;
  - words pages: `{ id, en, jp, count?(s), available?(s), html(s, api), wire?(el, s, api) }`.
  - On a phone `two` is false: draw everything in `holder`.
  - `api`: `{ s, view, render(), close(), go(section, sub), remember(), two }`.
- Aliases already route these section/page pairs: `company`, `pet`, `memories`, `cases`, `keepsakes`, `bookmarks`, `creatures` and `known` (Map).
- `RB.ui.company.addPage({ id: 'companion'|'pet'|'memories', en, jp, icon, render(A, B, two, api) })` replaces a Company page. The folio's Back leaves a phone detail first when the page sets `api.view.detail`.
- `RB.ui.settings.addRows(group, ({ radios, sw, slider, esc }) => html)` adds rows. Radios and switches bound to `RB.game.settings` keys save themselves.
- The defaults already present: `petWorld`, `petBattle`, `petSounds` and `keepsakeCounts` (all true).
- `RB.save.addMigration(fn(st))` registers an idempotent load-time normaliser (for example, deriving verified bond milestones for older saves). It must never invent history.

## 6. Semantic events on `RB.bus`
Emitted after the authoritative result is committed. Listeners that write state must be idempotent.

| Event | Payload | Emitted by | Heard by |
|---|---|---|---|
| `present:action` | `{ scope:'battle'\|'field', actor:'pc'\|'comp', action, family, targets:[anchor…], result, id }` | battle presentation, field weaving | pets (reactions), companion (field reactions) |
| `present:enemy` | `{ actor:'foe:i', kind, targets, outcome:'hit'\|'absorbed'\|'blocked'\|'status', id }` | battle presentation | pets |
| `present:scene` | `{ phase:'enter'\|'exit'\|'victory'\|'defeat'\|'calm'\|'ready', scope }` | battle and world | pets |
| `discovery:resolved` | `{ kind:'puzzle'\|'case', id, region, method, preserved?, id2 }` | puzzles, cases | companionship (bond, memory, reaction) |
| `pet:met` | `{ species }` | pets | companionship (a Pets memory) |
| `keepsake:found` | `{ id }` | `RB.discovery.keepsake` | catalogue, notices |
| `company:bond`, `company:memory` | `{ id, … }` | `RB.company` | Company UI |

Response families (`family`), each a stable id and never localised text: `unravel`, `protect`, `light`, `heal`, `water`, `wind`, `bind`, `stone`, `ice`, `fire`, `bell`, `interpret`, `technique`, and `support` for a companion action that fits none of those. Every existing response and technique maps to one of them explicitly.

## 7. Companion reactions
- Authored as data with `RB.company.addReactions([{ id, comp, event, when?, facts?, tone?, priority?, lines:[{ jp, en }] }])`.
- `RB.company.react(s, { id, event, facts })` chooses once for the resolution id and stores the choice in `company.react`, so reloading shows the same line.
- Puzzle and case authors write their own reactions (all four companions, plus a variant for each materially different method) with `event: 'puzzle:<id>'` or `'case:<id>'` and `facts: { method }`.
- The companionship system owns the selection rules, invitations, thoughts and Company display.

## 8. Content placement
- Add content in your own directory: `src/content/pets/`, `src/content/company/`, `src/content/discovery/`, `src/content/cases/` or `src/content/words/`.
- Hook into existing maps from there (the pattern in `src/content/lq/20_maps.js`).
- Edit an existing map file only where the addendum requires it (the Mill Road repair edits `ch1/11_maps_mill.js`).
- Every kanji carries furigana. New words go in your own lexicon file. The validator must stay at no errors.
