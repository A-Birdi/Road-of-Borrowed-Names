# Companionship (worker C1): bond, memories, Company, thoughts, invitations, reflections, rest

Addendum sections: 6 (except 6.3), 7, 8, 9, 19 (rituals), 21, 22, 23.3, Appendix B.
Built on the lead's foundation (aa825c3; `docs/ADDENDUM_CONTRACTS.md`), with the task branch merged in and tested against: cases (f9c3d99), endings and The Pages We Keep (f3fc4e6), field puzzles, keepsakes, bookmarks and creatures (c28d7b7).
The audit of the existing campaign's decisions is in `docs/addendum/companion_decisions.md`.

## What was built

### Files
| File | What |
|---|---|
| `src/engine/58_companion.js` | The rules. Extends `RB.company` (see APIs). |
| `src/ui/53_company_pages.js` | Company › Companion and Company › Shared memories (replacing the scaffold's defaults through `RB.ui.company.addPage`), the HUD topic button, four line icons (`talk`, `mind`, `rest`, `place`) added to `RB.ui.folio.ICONS`. |
| `src/styles/33_company.css` | Their styles (new file). |
| `src/content/company/00_lex.js` | 65 lexicon entries for the new text and labels. |
| `10_core.js` | What the player knows of each companion (progressive, canon only); story memories (setting out, Chapters 2–5, the two long roads, each companion's own quest) whose reply is the companion's actual line from that scene; What We Keep callbacks; words on meeting each of the four animals; the load migration; the entry scenes `co.place`, `co.mind`, `co.rest`. |
| `20_thoughts.js` | 62 thoughts (quest, rest, fallback) and 70 place entries ("Talk about this place"; the first line is the thought) for every region: Reedwake (before/after the ending), Saltglass, the Drowned Archive, Cinder Orchard, Snowbell, Lanternfall, the Archive road and hut, the Still Archive, Koharuno, the Atlas — before/after each region's resolution. |
| `30_invites.js` | Three story questions (Saltglass: labels changed by hand; Cinder Orchard: a painful memory; Lanternfall: the word you couldn't say), each with three replies + Not now for all four, and a result-aware follow-up. |
| `40_reflect.js` | How We Travel and What We Keep for all four (8 scenes). |
| `50_topics.js` | Six rest topics per companion (the two reflections in slots 1 and 5, 16 new conversations) and a ritual each; the `display` condition. |
| `60_decisions.js` | Forward recording of 23 reply branches in 9 scenes, 4 watched decisions and 31 thoughts that fill missing perspectives. |
| `tests/unit/company_bond.test.mjs` | 236 checks (below). |
| `tests/e2e/company.mjs` | The browser test (in `tests/e2e/run.mjs`). |

Totals: 37 scenes, 269 spoken lines, 88 reply options; 315 Japanese strings in data.
Every kanji has furigana (validator: no errors; the unit test scans the data the
validator does not see); every token is in the lexicon (validator `unknownTokens`
21 at aa825c3 + this work, down from 22; 20 on the merged branch). The recognizer data was regenerated for the 9 new
kanji (傾 共 凝 推 監 羨 謎 豊 象; `recog-coverage` passes).

### APIs (all on `RB.company`, beside the foundation's `award / score / stage / memory / addReactions / react`)
- `react(s, ev)` — **replaces** the foundation's (same contract, same stored choice per `ev.id`) and adds: `once` (an entry used at most once per campaign), `cooldown` (not again within the last n choices while another fits; default 3), `known` (a condition naming facts the companion must know), `tone` (preferred when `ev.tone` asks), `thought` ({jp,en}: the longer thought filed for Company). `company_core` still passes.
- `say(s, ev)` → async; the one short remark for a resolved event: chooses (once), says it at most once (`talk['said:'+id]`), files the thought; when it can't speak now (battle, folio) it waits in `talk._remark` for the next quiet moment. The cases system calls it from each case's `case_react` hook. The `discovery:resolved` listener never speaks: a field puzzle shows the first reaction line itself at completion (`src/ui/57_weave.js`, through `react` with the same id), a case through `say()`, so no remark is said twice.
- `sync(s, 'live'|'load')`, `milestones(s)`, `migrate(st)` (registered with `RB.save.addMigration` by `10_core.js`).
- `onResolved(s, ev)` (listens to `discovery:resolved`), `onPetMet(s, ev)` (listens to `pet:met`), `addDescriber(kind, fn(id, ev) → {title, text, ref})` so the puzzle and case systems can name their memories (the event may also carry `title`, `text`, `place`, `keepsake`, `minor`). The reaction is chosen under the event's `id2` when given (`case:<id>:done`, `puzzle:<id>:done`: the ids the owning systems pass to `say()` / `react()`), with `event` = `<kind>:<id>`; so the listener and the system share one stored choice, and the memory quotes the words the player saw. A case with no describer is named from `RB.cases.def(id)` (title, result, a link to the record).
- `thought(s)`, `placeTalk(s)`, `placeKey(s)`.
- `refresh(s)`, `pending(s)` → `{id, st, scene, reflect, quiet}`, `indicator(s)`, `openPending()`.
- `restHere(s)` → `{kind: 'inn'|'tea'|'room'|'hut'|'camp', map}`; `addRestOption(fn(s, setting) → {id, label:{jp,en}, run})` — the pet greeting joins the rest menu here; `restOptions`, `topics(s)`, `nextTopic(s)`.
- `safeHere()` → `{ok, why}`; `keepMoment(s)`, `keepLines(s, m)`; `recordAt(scene, label, id, value)`; `drawIndicator(c, view, t)`; `indicatorShown()` (tests).
- Scene hooks: `co_answer`, `co_defer`, `co_done`, `co_heard`, `co_bond` (only `reflect:travel` / `reflect:keep`), `co_note`, `co_keep_recall`, `co_remember`, `co_place`, `co_thought`, `co_rest`, `co_topic`.
- Conditions: `talk.<id>[=value]` (topic records, recorded replies as `talk.d.<decision>`), `rest[=kind]`, `display` (a keepsake is pinned).
- Bus: listens to `story:settled` (new, emitted by `90_game.js` afterScene), `companion:chat` (new, `companionTalk`), `map:enter`, `discovery:resolved`, `pet:met`; emits `company:changed`, `company:talk`.
- Content registries: `RB.content.company = { bios, mem, thoughts, places, invites, topics, rituals, decisions, pets, keep, recorded }`.

### State (all inside the foundation's `company` namespace)
`bond` (event ids), `memories` (+ fields `place`, `retro`, `lines` for reflections, `petName`, `method`, `ref`, `react`), `react`, and `talk`:
`_pending` (one id), `_recent` ({id, kind, pt, where}), `_filed` (≤ 6 ids), `_remark`, `_recent_r` (≤ 8), `said:<ev>`, `<topicId>: {st, choice, t}`, `t:<topic>: {t, n, choice}`, `d.<decision>: {v, t}`, `seen:<decision>`. Bounded by the content, not by play time.

## Rules as implemented
- **Bond** (§8.2, exact): `ch2`…`ch5` +1 when the flag is set with a committed companion; `pq` +3 for the committed companion's own quest (`co_suzu`, `lf_nao`, `lf_mio`, `ren_ushio`); `puzzle:<region>` +1 for a `discovery:resolved` together (one per region, three in all, `minor: true` never); `reflect:travel`, `reflect:keep` +1 in the scenes; `ending` +2 and `project:1..3` +1 are awarded by C2 through `award`. Recruitment and Chapter 1: 0. No deductions, decay, timers, gifts, petting, loops. The chapter/quest awards happen on `story:settled` after the scene that set the flag (and, for an older save, once on load).
- **Legacy** (§8.5): on load, only chapter flags and the current companion's quest; memories reconstructed from them are marked `retro` ("from the journey's record") and quote the companion's line from that scene. Nothing for pets, puzzles, conversations or other companions. Decisions already made are marked seen without becoming "recent".
- **What bond changes**: wording only — `bond>=rhythm|trusted` lines in the reflections and rituals, the portrait's expression, the highest stage's border. Unit test asserts battle, support actions, answers and learning never read it.
- **Thoughts**: recent result (a decision just made, a discovery's filed thought; 25 minutes of play or leaving the region ends "recent") > the current quest (own quest stages, Snowbell's lamp) > a rest setting > the place > a fallback. Deterministic per map and chapter (no flicker, not the game's random stream). None tells the player what to do.
- **Pinned keepsake**: Shared memories shows the keepsake catalogue's own display (`RB.ui.keepsakes.displayHtml`, with its art) once, and turns off the catalogue's Company decoration (`settings.companyDecor = false`); a See it button opens Journey › Keepsakes.
- **Invitations**: at most one pending (a story question takes the slot from a reflection that is only waiting; the reflection comes back afterwards); a note over the companion in the world and a labelled HUD button, never a pop-up; Not now → quiet (no note), still reachable from Company; solved first → the result-aware follow-up; expired unsolved → dropped quietly; answered → the reply is a narrative fact (`talk.<id>=<reply>`). After the story questions, How We Travel (from `ch2_done`) and What We Keep (from `ch4_done`) take the slot; late saves get retrospective openings.
- **Discuss a discovered case**: shown when `RB.cases.discussable(s)`; lists `RB.cases.topics(s)` (worked out / still open) with Talk it over (the case's own `talk` scene, played like any Company conversation) and Open the record (`topic.open()`, the Journey › Cases record). A Discoveries memory for a case links to the same record (`RB.cases.show(id)`).
- **Ask what's on their mind**: a conversation The Pages We Keep has waiting (`RB.pages.pending(s)`: the owed ending conversation, an unfinished one, a page offer in the Lantern Hall) is named on the action and plays first, as it would when talking to the companion in the world; then a waiting invitation or reflection; then a thought (`co.mind`).
- **Conversations from Company**: `safeHere()` (world mode under the folio, no scene running, the companion on this map — nobody is walked in — and no creature within 6 tiles); the folio closes, the scene plays through `RB.script.run`, and the folio reopens on the same tab, page and scroll if the world is quiet again; otherwise a notice says it can wait.
- **Rest**: the inns (`sg.inn`, `co.inn`, `sb.inn`, `sb.inn_room`, `lf.inn`), Hana's teahouse, the Last Lamp hut and camp, the tree-keeper's hut in Koharuno, and Atlas camp rooms. Talking to the companion there (or Company › Rest together) offers "Just chat" first where the companion has banter for that place (the ordinary talk, so confirming straight away does what it always did; §19.2 makes the ritual opt-in), then the ritual, the next unheard rest topic, options added by `addRestOption`, and Not now. Nothing is awarded; no timer.

## Coverage matrix (companionship rows)
| Item | Nao | Mio | Ren | Suzu | Evidence |
|---|---|---|---|---|---|
| Company › Companion: name, portrait, role, what you know (progressive), bond words, thought, own road, support actions | ✓ | ✓ | ✓ | ✓ | e2e (Nao, Mio, Ren shown; Suzu's page drawn in the scroll check), unit (bios) |
| Before commitment / no one | provisional Mio tested; all four share the code | | | | e2e |
| Story memories: recruit, ch2, ch3, ch4, ch5, lq1, lq2, own quest (quoting the scene) | ✓ | ✓ | ✓ | ✓ | unit (content coverage) |
| Pet meeting words (cat, dog, bird, tanuki, fallback) | ✓ | ✓ | ✓ | ✓ | unit; the pet system's `pet:met` is exercised only with a synthetic event (no pets on this branch) |
| Thoughts (own quest stages, lamp, rest ×2, fallback) + place entries for 10 regions | ✓ | ✓ | ✓ | ✓ | unit, e2e |
| Story invitations ×3 (question, 3 replies, Not now, follow-up) | ✓ | ✓ | ✓ | ✓ | unit (every scene speaks for every companion), e2e (Mio: defer → follow-up; Ren: expiry) |
| How We Travel / What We Keep (Not now + 3 replies, bond once, memory, retrospective wording) | ✓ | ✓ | ✓ | ✓ | unit (structure, one event), e2e (Ren, real clicks) |
| Six rest topics (slots 1–6: early, early, middle, middle, late, late) | ✓ | ✓ | ✓ | ✓ | unit; e2e plays Ren's slot 2 |
| Ritual (inn/room/tea/hut vs camp variant, keepsake glance, bond-stage lines) | ✓ | ✓ | ✓ | ✓ | unit (exists); e2e plays Ren's |
| Decision fill-ins (Saltglass, Cinder assembly, the heart of the Hush; Ren's folio left) | ✓ | ✓ | ✓ | ✓ (not Ren's folio) | unit (recent thought), audit doc |
| Forward recording (9 scenes, 23 branches) | — | — | — | — | unit (placement and unchanged story), story tests ch3/ch4/ch6 run over them |

Missing / not done:
- Cases and puzzles are tested with the real systems merged in: Case A (the parcel) resolved in a scene with Mio, and puzzle F1 (the slip screen) completed in a scene with Ren; each companion line is said once, with one memory and one bond event (unit + e2e). Case B and puzzles F2–F6 are covered only by their own workers' tests; they use the same events and ids.
- Pets: no pet system on this branch; `onPetMet` and the ritual's hook for the pet greeting (`addRestOption`) are tested only in isolation.
- The Japanese has not been reviewed by a native speaker. Natural-sounding is my judgement only.
- The HUD button label is English ("Talk") with an English aria-label; the rest of Company follows the interface language.

## Tests run (this worktree, on the branch with c28d7b7 merged)
Browser tests, unit tests and review are kept apart below. The machine was shared (load average 15–45 on 4 cores).
- Validator: `node tools/validate.mjs`: no errors (`unknownTokens` 20).
- Unit, full: `node tests/run-unit.mjs`: **6156 passed, 0 failed**. After the last engine change (rest menu order) `company`: 267 passed (company_bond 236, company_core 31).
- Browser, full: `node tests/e2e/run.mjs`: **41/43 scripts passed** (company.mjs included). The two failures:
  - `side_ch3.mjs`: "banter seen" failed (talking to the companion three times at the Cinder inn chose the ritual, the menu's first entry). Fixed by putting "Just chat" first. After the fix, `side_ch3` passes on this branch and on the c28d7b7 baseline, run side by side.
  - `pursue.mjs E mio`: stuck at `rw.warehouse` ("timeout waiting for idle (mode menu)"). It fails the same way on the c28d7b7 baseline, run side by side, so it is not from this work. The bot stops where Case A's shelf Inspect scene opens the folio.
- Browser, after the fix: `company.mjs --docs` **61/61**; `story_ch1 F mio`, `story_ch3 E nao`, `story_ch4 I ren go`, `story_ch5 A suzu`, `story_ch6 2`, `pages_ending`, `atlas.check`: 7/7 pass.
- Browser, earlier in this work, compared side by side with a baseline: `departures`, `learning_ui` and `battle_anim` failed under load on some runs. On the f3fc4e6 baseline run at the same time, `departures` failed the same two checks ("evening gathering", "one Tsuru"). On my run it also missed "Hana goes back into the tea house". A probe of that section in both builds showed the same timing: no departure is created on the first start after a page load, and Hana's is created on later starts. `learning_ui` and `battle_anim` then passed on both. In the final full run all three pass.
- `company.mjs` covers:
  - no companion, provisional, committed and the highest stage;
  - an invitation deferred, replaced after solving, and expired;
  - a conversation from Company returning to the same tab, page and scroll; the unsafe notice;
  - both reflections with real clicks, and replay awarding nothing;
  - the rest menu, ritual and topic awarding nothing;
  - the synthetic resolution event, the real Case A (one remark, memory, topics, Talk it over, Open the record, the memory link) and the real puzzle F1 (the line said once);
  - the pinned keepsake shown once; the waiting Pages conversation from "Ask what's on their mind";
  - memories filters and recollection with no state change; Tab order; accessible names; the Japanese interface;
  - 320×640 at 200 % and 390×844, including the case list page.

## Evidence
- Raw captures: `tests/e2e/out/company/*.png` (gitignored).
- Curated: `docs/screenshots/company/` (see its README).

## Merge notes (shared files touched)
- `src/engine/90_game.js`: two bus emits — `story:settled` at the top of `afterScene()` (the chapter-completion hook the brief allows) and `companion:chat` in `companionTalk()` (a handler may take the chat: a waiting topic, or the rest menu at a rest setting; otherwise banter runs as before).
- `src/engine/60_render.js`: one line after the quest markers and the weave's effects: `RB.company.drawIndicator(...)` (the c28d7b7 merge conflict here was resolved by keeping both lines, weave first).
- `tests/e2e/run.mjs`: one entry, `['company.mjs']`, after `pages_ending.mjs`.
- Task-branch merges already in this branch: f9c3d99 (cases), f3fc4e6 (endings, The Pages We Keep), c28d7b7 (field puzzles, keepsakes, bookmarks, creatures). Merging this branch into the task branch should need only the generated files regenerated.
- The Pages We Keep: its panel wraps this Companion page from `src/content/pages/15_ui.js` (content loads after `src/ui`), so it appears without changes here; its `RB.game.companionTalk` wrapper plays `RB.pages.pending` first and only then calls the original, which emits `companion:chat` (this system does not wrap `companionTalk`). In an Atlas camp room, talking to the companion gives this rest menu; the Pages camp topics come through the camp's own scene, so they are two separate ways in.
- Keepsakes: `53_company_pages.js` sets `RB.ui.keepsakes.settings.companyDecor = false` when it draws Shared memories, because it draws `displayHtml(s)` itself.
- `src/content/ch3/…`, `ch4/…`, `ch6/…` scene files are **not** edited: forward recording inserts `!hook co_note` commands into the parsed scenes at load time (`recordAt`), shifting later labels; the unit test proves every original command and label is intact.
- `RB.company.react` is replaced by a compatible version (the foundation test still passes).
- `RB.ui.folio.ICONS` gains four icons at load time from `53_company_pages.js`.
- Generated files regenerated: `src/recog/10_strokedata.js`, `src/lang/75_kanjiread.js`, `index.html` (rebuild after merging rather than resolving by hand).
- The foundation's stage labels in `06_company.js` (`{並|なら}んで{歩|ある}く` etc.) lack token spaces, so word help reads them as single unknown words; not changed here (lead's file).
- Found, not changed: in `src/content/ch4/32_scenes_quiet.js` the tone-1 morning lines never play (see the decisions doc).
