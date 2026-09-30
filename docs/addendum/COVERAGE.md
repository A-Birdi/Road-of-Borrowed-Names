# Living Company and Discovery addendum — integrated coverage matrix (Phase F)

This matrix maps the addendum's acceptance items (§23) and its evidence list (§23.7) to what was
built and what checked it on the **integrated** branch, where all six slices are merged. The area
records hold the detail: `pets.md`, `company.md` and `companion_decisions.md`, `endings_pages.md`,
`fieldweave.md`, `cases.md`, `words.md`. Each has its own finer matrix. `ADDENDUM_CONTRACTS.md` has
the shared foundation (save namespaces, bus events, page registries).

The build and the exact results are recorded in `VALIDATION.md` under "Addendum — integrated
validation".

**Evidence kinds**

- **U**: unit or content test (`node tests/run-unit.mjs <name>`).
- **B**: browser test of the built `index.html` in headless Chromium, with synthetic campaigns in
  fresh browser profiles (`node tests/e2e/<file>`).
- **V**: a person or the integrator looked at the capture.
- **S**: source inspection only.
- **H**: human play. **None was done.**

Every browser check ran in headless Chromium on Linux, with touch and phone sizes emulated. There
was no Firefox, no Safari, no real phone and no human play. No native speaker has reviewed any of
the new Japanese. Where a test answers the language steps through the solver, it shows that the
content can be completed. It does not show that it plays well.

## Integration work in Phase F (found by testing the merged tree)

| Finding | Fix | Checked by |
|---|---|---|
| Meeting an animal wrote **two** Shared-memories entries: the pets' authored meeting, and the companionship module's generic one with the default name | The companionship listener stands down when a species has an authored meeting. The pets hook's memory now carries `place` and `petName` | U `company_bond`; B `pets.mjs`, `company_pets.mjs` (one entry, chosen name, place, shown once) |
| The pet walked onto the player's tile when the player turned back over its trail, then shuffled between two tiles | It never steps onto a tile someone stands on or is walking onto. Settling off a tile no longer queues that tile again | B `addendum_integration.mjs` (fails on the old code: pet on the player's tile, 6 moves while standing; passes now); `pets.mjs`, `pets.test` |
| A notice over the open folio took clicks meant for the tabs under it, for up to 4.8 s (keepsake notices made this common) | Notices let clicks through while a panel is open | B `company_pets.mjs`: a real click on a covered tab (fails without the fix) |
| The battle recap covered Step back at 320×640 | The recap shrinks and scrolls; the responses keep room for Step back | B `combat_small.mjs` at three sizes; `bookmarks.mjs` now presses Step back for real |
| The whole-game driver stalled on the Weave sheet (chapter 3) and on F6's filing sheet (chapter 6) | The test player cancels an opened Weave sheet and closes the filing sheet (test harness only) | B `pursue.mjs` (see VALIDATION.md) |
| The pages tests replaced `RB.pets` with a stand-in | They use the real pets system (`meet`/`select`) | U `pages_project` 601; B `pages_ending.mjs` |
| `pets_greet` compared against an unsettled synthetic campaign, and leaked the page of a failed test | The fixture syncs the companion's milestones first, as in play. Failed tests close their page | B `pets_greet.mjs` 17/17 |
| The content validator did not read text kept outside scenes | It walks the addendum registries (keepsakes, cases, clues, puzzles, reactions, pets' meetings, the Pages We Keep, Known Details, companion conversations): 634 texts, no errors. 7 dictionary entries added; the bond-stage labels are token-spaced | `node tools/validate.mjs` |
| `RB.pix.hex` could produce a three-digit channel (15.7 gave `010`) | Round and clamp first | B `characters.mjs`, `backdrops.mjs` |

## §23.1 Baseline and regression

| Item | Evidence |
|---|---|
| Exact source/build recorded | VALIDATION.md, "Addendum — integrated validation" (commit and command per result) |
| Validator, unit suite, browser tests, whole-game progression on the integrated build | VALIDATION.md: `tools/validate.mjs`, `tests/run-unit.mjs`, `tests/e2e/run.mjs`, `pursue.mjs`, `matrix.mjs` |
| Earlier regression tests kept (dialogue, routing, handwriting, group battles, backdrops) | All are still in `tests/e2e/run.mjs` and the unit suite; none was removed or loosened |
| Isolated storage and synthetic saves only | Every browser test opens a fresh profile; `addendum_integration.mjs` writes real IndexedDB slots only inside its own profile |
| No claim of a human playthrough | None is made; the whole-game runs answer through the solver |

## §23.2 Pets and animation

| Item | Evidence | Status |
|---|---|---|
| Acquire, name, rename, recolour, select, deselect, hide, reload each species. Japanese and long names, unsafe markup, empty input, control characters | U `pets.test` (names: empty, blank and control-only refused, control characters dropped, markup and furigana markup kept as plain text, empty rename refused); B `pets.mjs` (each vignette end to end: naming, selection asked separately, reload) | done |
| All four species with all four companions in world, battle and Company, each looked at | B `pets_sheets.mjs` on the integrated build: three 16-pair contact sheets (`tests/e2e/out/pets/sheet_{world,battle,company}.png`), no problems; **V** by the integrator | done |
| Every response/technique mapping and every family row; player, companion, multi-target, warded hit, damaging hit, status on/off, final blow | U `pets.test` (every response, word, technique and companion action mapped; fails on an unmapped one); B `pets_gallery.mjs` (the coverage matrix drawn), `pets.mjs` battle section; recording `docs/screenshots/pets/tanuki_battle.webm` | done |
| A pet changes no result, target count, enemy choice, reward, Harmony, answer layout or puzzle state | U `pets.test` (identical rules results, enemy choices and option order with no pet, a cat, a grey bird, a hidden dog); B `company_pets.mjs` (greeting awards nothing) | done |
| Narrow paths, buildings, **ladders, stairs**, bridges, warps, cutscenes, defeat, interrupted return; never blocks or triggers | B `pets.mjs` (one-tile lane, doors, bridge, warps, cutscene hide, defeat and return); `addendum_integration.mjs` (the mill's real ladder and stairs; blocking equals the map's own; no trigger; turning back) | done |
| Full and reduced motion, sound off, high text scale, portrait and landscape, post-battle Next; real animated output | B `pets.mjs`, `pets_gallery.mjs`, `pets_greet.mjs` (reduced motion, sound setting, Next clicked with the mouse, Company at 1280×800, 390×844, 320×640 at 200 %, 844×390; see each file's header); `pets_video.mjs` recording | done |
| 16 rest interactions and non-pet alternatives; no affection from repeated petting | B `pets_greet.mjs` (the 16 moments, refusals, nothing gained, replayable); `company_pets.mjs` (the rest menu offers "Greet the cat together" beside the ordinary choices; nothing awarded; not offered with no pet or a hidden pet) | done |

## §23.3 Company and bond

| Item | Evidence | Status |
|---|---|---|
| No companion, provisional, committed; no pet, all pets, hidden pet | B `company.mjs` (no one, provisional Mio, committed); `pets.mjs` Company (each species, no pet); `company_pets.mjs` (hidden) | done |
| Canonical names/portraits, the real unlocked actions, thoughts, quest status, spoiler-safe topics | B `company.mjs` (support actions equal the combat data under their real conditions; thoughts; spoiler-safe quest line) | done |
| Exact unique-event scoring, stage thresholds, cap, +3 personal quest, no loss, no farming, no combat effect | U `company_bond` (237), `company_core` (31) | done |
| Replays, repeated conversations, resets and reloads grant nothing more | U `company_bond`, `pages_project`; B `company.mjs` (reflections replayed), `pets_greet.mjs` | done |
| Different approaches, disagreement, help, early returns, defeat, recognition uncertainty: no resentment, no reduced reward | U `company_bond` (no romance/jealousy/sulking guard; tone lines); B `company.mjs` (a solved puzzle: memory, one bond event, no second award for the same resolution); recording `f1_two_routes.webm` (the ward route with Mio, the ordinary route with Nao, each with its own reaction) | done; tone judged only by its authors |
| Legacy reconstruction, **slot isolation**, no invented history | U `company_bond` (rebuild from verified milestones only; unknown choices not invented); B `addendum_integration.mjs` (two real slots loaded in turn: each shows only its own companion, animal, keepsakes, kept sentences and creatures) | done |

## §23.4 Endings and postgame

| Item | Evidence | Status |
|---|---|---|
| Each companion × personal quest done/undone (where legitimate) × bond low/high × pet absent/present; original ending flags | U `pages_project` (601; now with the real pets system); B `pages_ending.mjs` | done |
| No duplicated gifts/flags, no false completion, no contradiction | U `pages_project`; B `pages_ending.mjs` | done |
| Fresh ending, existing postgame save, late personal quest, deferred reflection, non-mutating replay | U `pages_project`; B `pages_ending.mjs` (legacy slot save → reload) | done |
| The Pages We Keep for all four: single outing + early return, full return, deferred talk, defeat after an event; defeat before any event | U `pages_project`; B `pages_ending.mjs` | done |
| Save/load at each point of an Atlas run; no loss or duplicate reward | U (JSON + migrate at each point, all four); B (real IndexedDB slot + reload: camp, before the homecoming, after the reward) | done |
| 12 topic slots per companion have content and fallbacks; no endless bond | U (12 × 16 states × 4) | done |

## §23.5 Puzzles and evidence

| Item | Evidence | Status |
|---|---|---|
| Mill Road: no bypass before, both approaches after; return travel, both movement methods, legacy positions | U `fieldweave` matrix; B `mill_road.mjs` (36) | done |
| Every field puzzle: all solution families, mixed, ineffective, cancel, reset, reload, assisted, re-entry | U `fieldweave` (390); B `fieldweave.mjs` (89) | done |
| Language correctness, applicability and success kept apart | B `fieldweave.mjs`, `pets_weave.mjs` (right word on the wrong thing: no language mistake) | done |
| All profiles and input methods, completion without handwriting; help keeps eligibility | B `fieldweave.mjs` (F/E/I/A; handwriting, IME, choice, assisted) | done |
| Cases: clue orders, early inference, wrong hypothesis, late/postgame start, evidence beyond history, no softlock | B `cases.mjs` A1–A4, B1–B3, POST; U `cases` (194) | done |
| Guidance never exposes a hidden answer; the strongest help completes | B `cases.mjs` A1, A3, B3 | done |
| Geometry matches the deduction | U `cases` §2 (map data); captures `world_star_stair`, `world_*` (**V**) | done on map data; the renderer draws the same props |

## §23.6 Collections, map tools, learning records

| Item | Evidence | Status |
|---|---|---|
| All 12 keepsakes once, migrated sequence rewards, no quest item removed | B `keepsakes.mjs` (32), `cases.mjs` REFINE/LEGACY; U `fieldweave`, `cases` | done |
| Shared Journey's one-companion denominator, Atlas cross-references, no-pet states, spoiler protection, hints, display | B `keepsakes.mjs` (denominator read from the registry), `pages_ending.mjs` (mementos) | done |
| Notes/pins, limits, safe text, solved-state updates, changed prop IDs, visited maps | B `known.mjs`; U `cases` §7 | done |
| World changes and shortcuts before/after; no main-quest bypass | B `fieldweave.mjs` (state after completion and reload); U `cases` §3, §8 (shortcuts audited; no new link needed) | done |
| Bookmarks with branch-specific and mutable-name lines; no unseen lines, no fabricated mastery | U `bookmarks`; B `bookmarks.mjs` | done |
| Creatures only when met, observations only when seen; no farming or advantage | U; B `bookmarks.mjs` (Creatures section, a real battle) | done |

## §23.7 Human-facing evidence

| Required | Where | Made on |
|---|---|---|
| All four pets | `docs/screenshots/pets/` (world, battle, Company, vignettes for each); the 16-pair sheets from `pets_sheets.mjs` | pets branch; sheets re-made on the integrated build |
| A full player–companion–enemy exchange with pet reactions | `docs/screenshots/pets/tanuki_battle.webm` (Unravel, Suzu's move, the moth's strike, a 守る block, the last knot, Next) | pets branch |
| Company on wide and narrow layouts | `docs/screenshots/company/` (1280×800, 390×844, 320×640 at 200 %, Japanese labels) | refreshed on the integrated build (see VALIDATION.md) |
| Two valid solutions with different companion feedback | `docs/screenshots/fieldweave/f1_two_routes.webm` | field-weaving branch |
| A full case evidence comparison | `docs/screenshots/cases/record_parcel_compare_1280x800.webp` | cases branch |
| A relationship ending extension | `docs/screenshots/pages/ending_reply_nao_1280x800.webp`, `ending_suzu_offstage_1280x800.webp` | refreshed on the integrated build |
| An Atlas project homecoming | `docs/screenshots/pages/page3_caption_nao_1280x800.webp`, `wall_card_*` | refreshed on the integrated build |

## Layout audit of the new pages

`tests/e2e/visual.mjs --check` now includes company, company_pet, company_mem, keepsakes, cases,
known, bookmarks, creatures and weave. The audit looks for overflow outside scrollers, text
clipped by its own box, touch targets under 44 px, faint furigana, and page errors. The results
are in VALIDATION.md.

## Remainder (not done or not verifiable here)

- **People:** no human play, and no native-speaker review of any new Japanese. Nobody has judged
  whether puzzles and cases are fair or fun, or whether companions feel like people. Those are
  claims only a person can check.
- **Browsers and devices:** only headless Chromium, with touch emulated. No Firefox (the owner's
  browser), no Safari, no real phone, no measured frame rate on a phone.
- **Voice:** there is no Japanese voice here, so "Hear it" on kept sentences has never been heard.
- **Optional links not made:** Words › "Words you noted" does not link to a word's kept uses, and
  evidence and memories do not link to kept sentences. §20.1 marks both as optional
  ("may", "optional"). The kept-sentences page shows noted-word chips.
- **Known before the addendum, not changed:**
  - In Snowbell's snowed-in night (`src/content/ch4/32_scenes_quiet.js`), the morning lines for
    `sb_tone=1` never play, because each conversation's last reply sets 2 or 3 (see
    `companion_decisions.md`).
  - The arrival place-name label can sit over a folio opened within a few seconds of arriving.
  - Notices still draw over an open folio for their 4.8 s. They no longer take clicks.
- **Small presentation limits the workers recorded:**
  - The difference between some pet reaction families is subtle at phone size.
  - The dog vignette's choice box can cover the dog.
  - The HUD "Talk" label is English only.
  - F5 is set outdoors, with a new minor NPC.
  - Known Details has no fog for unwalked parts of a visited map.
