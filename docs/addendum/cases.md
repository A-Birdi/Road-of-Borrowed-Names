# Cases, evidence pages, layered help, refined sequences, Known Details, shortcuts

Worker D2's record for the owner's addendum (*Living Company, Field Discovery,
and the Pages We Keep*): §12.2–12.3, §14.8, §15, §16, §17 (six keepsakes),
§18.2, §18.3. Base: `aa825c3` (the lead's foundation). Everything below was
built on this worktree's branch; "tested" means an automated check that was
run, named in *Tests* below. Nothing here was played by a person.

## 1. What was built

| Part | Files | API / data |
|---|---|---|
| Case records (engine) | `src/engine/59_cases.js` | `RB.cases`: `observe`, `open`, `bookmark`, `evidence`, `loose`, `sufficient`, `hyps`, `choose`, `setSupport`, `setNote`, `rule`, `askHint`, `hintLevel`, `langHelp`, `markAt`, `methodOf`, `resolve`, `reaction`, `recap`, `discussable`, `topics`, `show`, `clean`, `graphemes`, `migrate`. Conditions `case.<id>`, `case.<id>=open\|done`, `case.<id>.hyp=<h>`, `case.<id>.tried=<h>`, `case.<id>.hint>=N`, `clue.<id>`. Scene hooks `case_clue`, `case_open`, `case_page`, `case_rule`, `case_resolve`, `case_react`, `case_ack`, `case_bookmark`. |
| Journey › Cases (UI) | `src/ui/59_casebook.js`, `src/styles/35_cases.css` | `RB.ui.menu.addPage('journey', { id: 'cases' })`; `RB.ui.casebook.select(id)`. Registers `RB.cases.migrate` with `RB.save.addMigration`. |
| Guidance boundaries | `src/engine/56_questguide.js` (small edit) | per-stage `mark: 'now' \| 'afterHypothesis' \| 'onRequest'` and `markAt(st)`; `how: 'concealed'` and its nudge; the cache signature includes case records and hints. |
| Case A, Case B | `src/content/cases/` (`00_lex`, `05_art`, `10_data`, `20_parcel`, `30_view`, `50_react`) | `RB.content.cases`, `RB.content.clues`, `RB.content.caseView` (the Star Stair geometry), `RB.content.caseArt` (evidence pictures), quests `cs_parcel`, `cs_view`, people `cs_hama`, `cs_seto`, items `cs_parcel`, `cs_sketch`, 24 companion reactions + 16 for Case B. |
| Placement on existing maps | `src/content/zz_cases.js` | adds props/people/one cottage façade; wraps two existing prop scenes (the stone seat, the tide board); gives one silent prop a scene; prepends three guarded talk options. Everything added carries `cs: 1`. |
| Refined sequences + 4 keepsakes | `src/content/cases/40_refine.js`, one line each in four chapter scenes | hook `cs_keepsake`; prop `cs_tidechalk`. |
| Keepsakes (6) | `src/content/cases/10_data.js`, art in `05_art.js` | `RB.content.keepsakes[id] = { id, name, desc, region, source:{kind,id}, art(ctx), artSize: 32, hint:{broad,specific} }`; awarded with `RB.discovery.keepsake`. |
| Known Details | `src/ui/61_known.js`, `src/content/cases/60_known.js` | `RB.known.note(s, map, id, {label,state,x,y})`, `entries`, `pins`, `addPin`, `editPin`, `removePin`; listens to `world:changed`; `RB.ui.menu.addPage('map', { id: 'known' })`; authored `RB.content.knownDetails`. |
| Tests | `tests/unit/cases.test.mjs`, `tests/e2e/cases.mjs`, `tests/e2e/cases_shots.mjs`, `tests/e2e/known.mjs` | added to `tests/e2e/run.mjs`. |

State (contract §1): `s.discovery.cases[id] = { stage, hypothesis, support, note, tried, done, method, evidence, sheet? }`,
`s.discovery.clues[cid] = { t, map, case, early?, bm?, legacy? }`, `s.discovery.hints['case:<id>']` (reasoning level),
`s.discovery.hints['clue:<cid>']` (language help opened), `s.discovery.known[map][id]`, `s.discovery.pins[map]`.
Once-only ids: `case:<id>:done` (via `RB.state.once`), `keepsake:<id>` (foundation). Event:
`discovery:resolved { kind:'case', id, region, method, id2:'case:<id>:done' }`, emitted once, after the commit.

## 2. Case A — A Parcel for a Place That Moved (`parcel`, quest `cs_parcel`)

**Objective.** A sealed parcel addressed "Saltglass, the East Landing. To the keeper of the bell workshop" (no name; the harbour stamped it
"there is no East Landing"). Who is it for? Answer: the workshop's *current keeper*, Hama, at the repair bench by the ferry on the stone quay.
Not the old landing, not the former family's home. The bell is a small ferry call bell (not the Cinder Orchard bell or the Lanternfall bell).
It retells neither long quest line (no fare, no Gull seal, no persons lost).

| Clue | Where (map, tile) | Kind / certainty |
|---|---|---|
| `parcel.address`, `parcel.seal` | Reedwake, River Warehouse, shelf of unclaimed parcels (rw.warehouse 6,2) | document / object |
| `parcel.record` | Saltglass Harbour Office, ledgers (sg.office 9,6): "the fittings — the call bell, the notched workbench — go with the workshop" (no destination) | document |
| `parcel.oldsite` | east beach footing (sg.harbor 53–54,31) | place |
| `parcel.crest`, `parcel.seto_memory` | Seto's house up the hill (façade 50–53,2–4, door 51,4; Seto at 53,5) | object; speaker **unsure** |
| `parcel.bench`, `parcel.bell` | Hama's bench (37–39,27, talk across it), bell post (40,27), Hama (38,26) | object |
| `parcel.makernote` | Shino's Post House, record of marks (co.post 5,2): caster's stamp vs the Seto crest | document |

- **Hypotheses (bounded):** `oldsite` (offered once the address is read), `family` (once the crest or Seto's memory is heard), `keeper`
  (once the record, the bench or the bell is seen). A hypothesis nothing has suggested is not offered (no spoiler by entry name).
- **Sufficient evidence:** `[address, record, fixture]` or `[address, makernote, fixture]`; `fixture` = bench or bell (an equivalence group).
  The maker note is a corroborating route, not a required checkbox.
- **Resolution:** offering the parcel to Hama always works (an ordinary conversation). Hama asks how you knew; an optional explanation lists only
  observed evidence (`acknowledge`), or "I only came to deliver it". Methods: `reasoned` (a sufficient set), `early` (correct without one),
  `helped` (after the answer hint). All give the same result and keepsake.
- **Wrong hypotheses, safe:** leaving it at the footing is refused (no one to take it); Seto keeps it sealed and names the mismatch (no notch, a
  wave; no workshop for years). Each is recorded as *tried* with its reason; nothing is lost, no one is insulted, the parcel stays sealed.
- **Payoff / world change:** the old address label pinned above the bench and a bright new part in the bell (prop variants on
  `case.parcel=done`), Hama's after-lines, the **Parcel Seal** keepsake, one companion reaction chosen for the actual method.
- **Availability:** the shelf offers the parcel from the start of Chapter 1 free exploration until taken (so any later chapter and the
  postgame can start it); Saltglass from Chapter 2; the maker note from Chapter 3 (optional). All profiles; any companion or none.
- **Hints:** 1 nudge (the label names a job and a place), 2 compare (the seal against every crest/stamp: the notch), 3 next step (the Harbour
  Office record), 4 the answer (discloses Hama to navigation).

## 3. Case B — The View on the Other Side (`view`, quest `cs_view`)

**Objective.** A translucent travel sketch pinned in the Saltglass lighthouse window matches no view. It hung back to front: turned over it is the
view up the Star Stair above Snowbell from the stone seat at its foot (the bench with Akari's height notches). A reflection, not a rotation.

- **Clues:** `view.sketch` (lighthouse window, sg.lighthouse 6,2), `view.genzo` (Genzō, **unsure**: "somewhere you sit and rest"),
  `view.note` (Fusa's Inn guestbook, co.inn 5,2: the artist's leaf mark, stem left on the front, sunken with stem right from the back),
  `view.impression` (the pressed leaf, seen by any reveal route), `view.seat`, `view.west`, `view.east` (looking out on the Star Stair).
- **Reveal routes (all show the same facts):** tilt it to the light (ordinary), Genzō's white chart paper (given with the sketch), or weave ひかり
  behind it (offered when the word is known; a direct action with no language step and no recall credit, §13.2).
- **Interaction:** in the case record, buttons **Turn over**, **Compare** (the chosen view beside the sketch) and **Reset** (back as it hung;
  observations kept); a view chosen from the bounded set (only views already looked at); **This is the view, held this way** checks the
  arrangement predicate. At any of the three places the sketch can also be held up either way round. Nothing needs drawing, dragging, colour or
  hearing; every control is a button or a radio (keyboard tested).
- **Geometry (validated from the map, `RB.content.caseView`):** landmarks = the stair's own lantern (7,33), a small wayside shrine (9–10,30) and a
  bare tree (11,32), the last two added. Viewpoints and what each sees, left to right (bearing order = left/right order on the map, gaps ≥ 9°
  and ≥ 1 tile):

  | Viewpoint | stands at, facing | order |
  |---|---|---|
  | `seat` (the stone seat, sb.obs_path 9–10,36) | 10.0,36.5, north | lantern, shrine, bare tree |
  | `west` (a flat stone, 3,31) | 4.5,31.5, east | shrine, bare tree, lantern |
  | `east` (a flat stone, 14,32) | 14.5,33.5, west | lantern, bare tree, shrine |

  The sketch's front = the seat's order; as it hung (mirrored) = bare tree, shrine, lantern, which matches no viewpoint. The pictures and the
  words of every view are generated from these positions, and the unit test recomputes them.
- **Resolution / methods:** `noticed` (the impression seen, no note), `note` (the guestbook read), `compared` (neither: matched by landmarks),
  `helped`. **Payoff:** the **Turning Picture** keepsake (your traced card), the remembered-view page in the record, an optional framed sketch
  left by the stone seat (`cs_view_framed`), Genzō's after-line, four companions' reactions per method.
- **Availability:** from Chapter 4 (the Star Stair needs `sb_stair_open`); postgame tested. **Hints:** paper thin → the pressed mark and the
  kept views → turn it and compare with a place to sit on the Star Stair → the answer (discloses the seat).

## 4. Evidence pages and layered help (§16)

- **Record:** the question; a factual *Where you left off* (count of observations and the places they came from, tried guesses, the current
  hypothesis; the answer only once found); **Observed** cards (kind, provenance, the speaker's certainty, original Japanese with furigana and
  its translation, *What you saw*, pictures with a written equivalent, "noticed before you knew it mattered"); **Concluded** (bounded
  hypotheses as radios, supporting observations, tried guesses with the reason, or, when solved, the result and the evidence it rested on);
  **Your note** (plain text, 200 grapheme clusters, the count and the cut shown before saving); **Reasoning help**.
- **Comparison:** two or three observations side by side (`Compare` on each card); nothing is auto-connected or auto-concluded.
- **Help kept apart:** *Language help* per observation (word notes; never the answer); *Navigation help* ("Mark the way there") only to a
  hypothesis whose place has been found, or to a place a requested hint disclosed; *Reasoning help* one level at a time, each labelled (a nudge
  — gives nothing away; something to compare — a small spoiler; a concrete next step — a clear pointer; the answer — a full spoiler), the answer
  behind a second press. Levels persist in the save. No penalty anywhere: same keepsake, same reactions, same bond (C1 listens to
  `discovery:resolved` regardless of method).
- **Reachable from:** an object's Inspect view (each clue scene ends with "Look at the case record", hook `case_page`), and Company (C1:
  `RB.cases.discussable(s)`, `RB.cases.topics(s)` → `{ id, case, title, state, scene: 'cs.talk_<id>', recap, open() }`; the talk scenes have
  lines for all four companions, open and solved).
- **Kept beyond history:** records are separate state (the 120-line history is irrelevant; tested) and survive save/load (tested).
- **Older saves:** `RB.cases.migrate` normalises records, keeps unknown ids, reconstructs a clue only from a durable `seen` scene named by the
  clue's `fromSeen` (none needed yet: no earlier version had these scenes), closes a case quest left open by an interrupted resolution.

## 5. Guidance boundaries (§16.4)

`56_questguide.js`: a stage with `mark: 'afterHypothesis'` or `'onRequest'` is never derived in live play. `markAt(st)` returns the place the
player chose (only once found) or one a requested hint disclosed; the markers, the chart and "Next:" then point there, **right or wrong**
(markers, words and evidence agree). Nothing chosen → `how: 'concealed'`, no marker, and the first nudge says the step is theirs to work out. The
static listing still derives the true target (so `quest_guide.test` sees every stage has a place). Both case quests use it; delivery after a
choice marks normally. Existing quests are untouched (`mark` absent = `'now'`).

## 6. Refined choice/interpretation sequences (§14.8) and their keepsakes

Every original challenge definition, answer, accepted form and profile tier is unchanged (the unit test re-accepts all 7 challenges' forms,
every tier). What changed:

| Region | Sequence (audited) | Refinement | Keepsake (giver, guard) |
|---|---|---|---|
| Reedwake | Mill Road candidates (`rw.mr_*`, `rw.c_mr_lantern`) | **Audit only** — D1 owns the Mill Road repair and edits `31_scenes_mill.js`; editing it here would collide. Findings for D1/the lead: Ren's lantern reading is the only candidate step with a language task; Nao's and Suzu's are dialogue choices; none records evidence. | — |
| Saltglass | Shiori's tide table (`sg.c_tidetable`, `sg.shiori_tide`) | Stepping away now points to word help (one line, `ch2/22_scenes_tide.js`); **physical consequence**: the blank tide board outside gets its times chalked in once read (scene wrap `cs.tidepost` + drawn chalk `cs_tidechalk`); Known Details: blank → chalked. | **Shell Button** — Shiori, `sg_tide_low & !keepsake & !quest.sg_main=5 & !quest.sg_main=6` (never in front of the tide or fog conversations) |
| Cinder Orchard | the Great Kiln's firing order (`co.c_kiln`, `co.kiln_wall`) | Stepping away: "the tiles' own words carry their order" (one line, `ch3/41_scenes_kiln.js`); Known Details: slots and vents → tiles in place, vent open. | **Clay Swallow** — Nobu, `co_kiln_open & ch3_done & !keepsake` |
| Snowbell | Hoshino's observing log (`sb.c_log`, `sb.charts_log`) | Stepping away used to say nothing: now the log stays open and the directions are pointed out (`ch4/33_scenes_dungeon.js`: `-> later` + a 2-line `:later`); Known Details: frozen drawers → the south-east one opened. | **Star Rosette** — a box of Akari's paper stars Hoshino leaves out in his house for whoever read the log (`sb_log_solved`), so it works whether or not he stayed in Snowbell |
| Lanternfall | the three linked gate plates (`lf.ch_gate1–3`, `24_tower.js`) | Already clear, with in-world consequences and stuck feedback: no scene edit. Known Details now keeps the linked state readable (wheels, door, plugs) and loses its "?" when each gate is solved. | **Thread Spool** — Tokuji, `lf_gate_c & lf_bell_rung & !keepsake` (his own story first) |
| Still Archive | the charter at the water gate (`sa.charter`, promise interpretation) | Stepping away: the plaque, Kasane's note and the charter stay to compare (one line, `ch6/51_scenes_archive.js`); Known Details: barred → opened. | — (none prescribed) |

No keepsake needs a perfect first answer (challenges retry freely; the award follows the resolved milestone). Older saves past a milestone claim
once from the same person or place (tested with a save stripped of every addendum field).

## 7. Known Details (§18.2)

Map › Known details: a map selector (the current map and visited maps only), a diagram drawn from that map's own tiles (walls, water, open
ground, ways out; the player's position; nothing of other maps), numbered marks and a list saying the same in words. Shapes: ? unexplained,
barred, ◇ noted, ✓ solved, dashed arrow opened, eye a view; pins: house (return here), ? in a square (question), triangle (view), arrows
(passage). Authored entries appear when their `show` condition (usually `seen.<scene>` or `clue.<id>`) holds and take their state from flags
(first match), so they cannot go stale. `RB.known.note` records a detail for other systems; `world:changed { map, prop, state, label? }`
updates or creates it. Pins: 4 kinds, plain-text note ≤ 200 grapheme clusters, ≤ 20 per map (the 21st refused, nothing evicted), move by tapping
the diagram or with the arrow buttons, Edit, Remove (asks first), the count and the limit always visible.

## 8. Shortcuts audit (§18.3)

Existing shortcuts, each now labelled from the side where it is found ("barred …") and "opened" once it is: the Drowned Archive's bolted door and
stair (`sg_da_shortcut`), the Terraces ↔ Old Workshop Row gate (`co_shortcut`), the Star Stair ↔ Upper Gallery service stair (`sb_shortcut`),
the bell tower's rope ladder (`lf_shortcut`), the Reading Room ↔ Keeper's Study door (`sa_shortcut`); Nao's tall-grass path on the Mill Road is
D1's. **No new link was added**: the cases create no repeated detour. Measured walking distances (tiles, BFS on the compiled maps): Saltglass
arrival → Harbour Office door 18, Seto 29, Hama 32, old footing 52, lighthouse 53 (one map, one fast-travel point); Snowbell arrival → the stair
39; on the stair, from its foot: seat 5, east stone 3, west stone 15. Reachability before/after every addition is tested (below).

## 9. Coverage matrix

| Requirement | State | Evidence |
|---|---|---|
| Case A route, deduction, candidates, evidence, sufficiency, early solution, safe wrong answers, payoff, reactions | done | e2e A1–A4, unit §4 |
| Case B reflection, reveal routes, Turn over/Compare/Reset (keyboard), unique target, safe mismatches, payoff, framed sketch | done | e2e B1–B3, cases_shots, unit §2 |
| Different clue orders, early inference, wrong-hypothesis recovery, late and postgame starts, evidence beyond history, no softlock | done | e2e A1, A2, A4, POST |
| Markers never expose a hidden answer; strongest help completes | done | e2e A1, A3, B3; unit §4 |
| Deductions checked against rendered geometry | done (map data; the renderer draws the same props) | unit §2; captures `world_star_stair`, `world_*` |
| Evidence pages: provenance, certainty, JP + reading + translation, diagrams with text, Observed vs Concluded, note, compare, resume recap, bookmarks | done | cases_shots, unit §4 |
| Layered help (language / navigation / reasoning), persisted levels, spoiler labels, no penalty | done | e2e A3, B3, cases_shots |
| Company hooks for C1 | done (API + talk scenes); C1's UI not in this worktree | unit §5 |
| Six refined sequences | 5 refined + Mill Road audited only (D1) | e2e REFINE; unit §6 |
| Four sequence keepsakes, once, legacy claim | done | e2e REFINE, LEGACY |
| Six keepsake definitions (schema, art, hints) | done; D1's catalogue shows them | unit §5 |
| Known Details: discovered-only, states follow the world, pins, limits, safe text, visited maps | done | known.mjs, unit §7 |
| Shortcuts audited and labelled; reachability before/after | done; no new link needed | unit §3, §8 above |
| Human play, native-speaker review of the new Japanese, fun/pacing | **not done** (needs people) | — |
| Other browsers than headless Chromium; a real phone | **not done** | — |

## 10. Tests run (exact results, this worktree)

Where: all browser tests ran in headless Chromium (installed Playwright), in isolated contexts, against synthetic states. No real
save was touched. Other workers ran their own suites on the same 4-core machine at the same time (load average 30–40), so checks
that depend on timing are marked below and compared against the base build `aa825c3` under the same load.

**Own tests (final build):**
- `node tools/validate.mjs`: no errors. The one warning (lexicon conflict 納得, ch2/ch5) predates this work.
- `node tests/run-unit.mjs cases`: 194 passed, 0 failed. This covers words, the Star Stair geometry against the compiled map,
  placement (free tiles, reachability with and without the additions), rules, reactions, keepsakes, every original correct form of
  the refined sequences, talk guards, and Known Details.
- `node tests/run-unit.mjs quest_guide`: 68 passed, 0 failed. `recog-coverage`: 15/15 after regenerating the stroke data for 共 燕 紋 謎.
- `node tests/e2e/cases.mjs`: 11 flows, 118 checks, 0 failed:
  - Case A: thorough order; clue first with an early delivery; strongest help; evidence kept beyond the 120-line history.
  - Case B: the full route through the record; held up in the world; strongest help.
  - Both cases after the story.
  - The refined sequences and their four keepsakes.
  - An older save claims each keepsake once.
  - From an Inspect view to the record, and from a Company topic.
- `node tests/e2e/cases_shots.mjs`: 11 checks, all passed:
  - A note containing markup is shown as plain text.
  - Two observations can be compared side by side.
  - Keyboard: Enter, Space and Tab work on the sheet.
  - The answer needs a second press.
  - The sketch can be left framed at the seat.
  - The solved record keeps the view.
  - On a 390×844 phone nothing overflows sideways, also at 200 % text with high contrast.
  - No page errors.
- `node tests/e2e/known.mjs`: 22 checks, all passed.

**Existing suites (final or near-final build):**
- Full unit suite (`node tests/run-unit.mjs`), final tree: 4861 passed, 3 failed. All three are timing checks under load:
  - kanji-chart search under 25 ms;
  - median recognize() under 30 ms (it was 56.9 ms);
  - p95 recognize() under 60 ms (it was 243 ms).

  The first run, made before two content fixes, had 4860 passed and 4 failed. The two `quest_guide` failures in it (the unknown
  word 旅路, and nouns for the two new target props) are fixed; `quest_guide` now shows 68/68.
- Browser suites that passed: `ui`, `systems`, `folio`, `play_ui`, `world_fixes`, `combat_ui`, `battle_group`, `companion_turn`,
  `long_quests --fixtures-only`, `story_ch4 I ren go` and `settings`.
- `departures.mjs` FAIL. The Tsuru walk failed in the suite run. Run straight after on both builds, it failed in the same 3 checks
  with the same messages on base `aa825c3` and on this build (the evening walk to the Hall door, Hana's door, Tsuru's walk). So this
  is not caused by this work, and it is load-dependent: the earlier run under less load failed only one of them.
- `battle_anim.mjs` FAIL: 12 passed, 4 failed. All four are timing or animation-order checks: the companion's turn still open after
  rapid input, a ward block at 617 ms then a hit at 683 ms, the Gathering mark spent at 717 ms after contact at 617 ms, and a
  20-second frame wait timing out. The same run on base `aa825c3` gave 15 passed and 1 failed (frame cost). A second run on this
  build, under heavier load, gave 9 passed and 7 failed (timeouts included). The rapid-input test was then run on its own six times,
  alternating the builds: base failed 3 of 3 with the same message, and this build passed 3 of 3. These checks depend on load, not on
  this work. No battle file was changed.
- `quest_guide.mjs` FAIL, 1–2 checks: "near it: the arrow over the exit to the village" and, once, "after stepping back, the markers
  return". Run back to back, base passed and this build failed the first check. A probe of that exact step (enter the road at
  24,9, wait 1300 ms, read the markers) gave the opposite: base `edge:true` (a failure) and this build `edge:false`. The arrow sat at
  x = 624–626 buffer px, right on the on-screen threshold, while the camera was still easing. That makes it a timing check. The
  quest-guide change here only affects stages that carry `mark`, which only the two case quests do.
- `learning_ui.mjs` FAIL, 13 passed and 1 failed, twice. The one failure was a timeout ("no horizontal overflow at 320/360/390 and at
  200% text ...: test timed out after 180s"), not an overflow. That test was run on its own four times, alternating the builds: base timed out 2 of 2 and this build 2 of 2. It is
  load-bound, and the base build behaves the same way.
- While checking these, a real side effect of this work was found and fixed: the new stylesheet had given every pressed `.pbtn`
  (Follow, Keep open, Small kana, Show the model) the case pages' pressed look. The rule is now scoped to the new pages (commit
  "scope the small and pressed button styles").
- The unit timing check "a kanji-chart search takes well under 25 ms" failed under load, 3 times of 3 on this tree and once of 2 on
  base. Timed side by side in one process, the two trees were indistinguishable: 5–98 ms per search on both. The 4 kanji added here
  are 1556 → 1560 entries. The unit check "p95 recognize() < 60 ms" (p95 86.5 ms under load) is the same kind of check.

## 11. Evidence

- Raw captures: `tests/e2e/out/cases/` and `tests/e2e/out/known/`.
- Curated WebP: `docs/screenshots/cases/`, with one README line per image. `node tests/e2e/cases_to_docs.mjs` produces them.
- The author looked at every curated capture for layout (visual inspection only):
  - the quay bench and bell, Seto's house, the old footing, the lighthouse window;
  - the Star Stair landmarks, before and after the sketch is framed, and the chalked tide board;
  - the case records wide and narrow, the sketch comparison, the help ladder;
  - Known Details with pins, on a wide screen and on a phone.
- Two fixes came out of looking at the captures:
  - The tide-board chalk had been drawn under the board.
  - Known Details marks were too small on a large map on a phone.
- This review does not show whether the Japanese reads naturally or whether the cases are fun to play.

## 12. Limitations and remainder

- Japanese: the model wrote it. It was checked for furigana and lexicon coverage only. **No native speaker has reviewed it.** No
  person has played the cases.
- The keepsake catalogue, its "found" notice and the Company "Discuss a case" UI belong to D1 and C1. In this worktree:
  - a keepsake is recorded, `keepsake:found` is emitted and there is a line in the dialogue, but no catalogue notice is shown;
  - C1's Company page is not here. `RB.cases.topics(s)[i].open()` opens the record, and the browser test checks this.
- The Mill Road candidate sequence was audited but not changed, because those are D1's files.
- The views are computed on the map grid. The in-world pictures are schematic (icons placed by bearing), not a rendered perspective.
- Known Details draws the chosen map only. It has no fog of war for parts of a visited map that were never walked. Marks scale up on
  large maps. On a crowded map a number can still sit close to the "you are here" triangle, and the numbered list below carries it.
- High contrast and 200 % text were checked for fit on the case record only (by the browser test), not for Known Details.
- Nobody checked how the new pages look with `settings.uiLang = 'ja'`.
- An existing behaviour was seen but left alone because it is not in these files: the arrival place-name label ("灯台 Lighthouse")
  stays above the folio if the menu is opened within a few seconds of arriving.

## 13. Merge notes

- **Shared files touched:** `src/engine/56_questguide.js` (the `mark`/`markAt` branch in `analyse`, the concealed nudge, the cache signature;
  comment updated); `src/content/ch2/22_scenes_tide.js`, `src/content/ch3/41_scenes_kiln.js`, `src/content/ch6/51_scenes_archive.js` (one
  line each in a step-away branch); `src/content/ch4/33_scenes_dungeon.js` (`sb.charts_log`: `-> end` → `-> later` and a 2-line `:later`);
  `tests/e2e/run.mjs` (three suites added: `cases.mjs`, `cases_shots.mjs`, `known.mjs`; `cases_to_docs.mjs` is a helper, not a suite); generated `src/recog/10_strokedata.js`, `src/lang/75_kanjiread.js`, `index.html` (regenerate at
  merge rather than merge by hand).
- **New files outside `src/content/cases/`:** `tests/e2e/cases_to_docs.mjs` (WebP helper), `docs/screenshots/cases/` (21 WebP + README); `src/content/zz_cases.js` — `src/content/cases/` sorts before `ch1` in the build order, so map
  placement must live in a file that loads after the chapters; `src/styles/35_cases.css` (new, name chosen not to collide; every rule is under `.cs-*`/`.kd-*` or scoped to `.cs-record`, `.kd-list`, `.kd-pinform`).
- **Contract use / extensions:** no contract changed. Added condition heads `case`, `clue` (contract §3 names them). `RB.hooks` entries named
  above. The foundation's `RB.company.react` is used through `case_react`; if C1 adds `RB.company.say`, `case_react` uses it instead.
- **For D1:** keepsake `art(ctx)` draws in a 32×32 grid (`artSize: 32`); `source.kind` is `'case'` or `'sequence'`. `RB.known.note` and the
  `world:changed` listener are ready for puzzles. Tiles used (check against F1–F6 placements): sg.harbor 37–40,27 / 38,26 (Hama), 53–54,31,
  50–53,2–4 (+ door 51,4), 53,5, 10,25 (overlay, non-blocking); sg.office 9,6 (existing pile); sg.lighthouse 6,2; rw.warehouse 6,2;
  co.post 5,2; co.inn 5,2; sb.obs_path 9–10,30, 11,32, 3,31, 14,32, 11,36; sb.hoshino 5,2. `tests/unit/cases.test.mjs` §3 re-checks
  free tiles and reachability after the merge.
- **For C1:** `RB.cases.discussable(s)`, `RB.cases.topics(s)`; reactions for `case:parcel` and `case:view` are registered with
  `RB.company.addReactions` (facts.method ∈ reasoned/early/helped and noticed/note/compared/helped).
