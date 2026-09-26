# Common brief for content workers

You are one of several workers building "The Road of Borrowed Names" in parallel.
Read first: SPECIFICATION.txt (binding), docs/STORY.md (story bible), docs/CONTENT.md
(authoring formats — follow exactly), CLAUDE.md. Study src/content/00_world.js,
src/content/01_inkweaving.js and src/content/ch1/ (the coordinator's reference chapter,
still being written) and the engine files you rely on (src/engine/70_script.js,
src/engine/95_combat.js, src/ui/75_activities.js, src/learn/20_tasks.js).

Rules
- Only create/edit files inside your assigned directory. Never edit engine/ui/lang/
  recog/audio files or other chapters. If you truly need an engine change, use
  RB.hooks / RB.props.P / RB.enemyArt.A / RB.sprites.custom from your own files, or
  describe the change in your final report.
- Do NOT git commit or push. The coordinator integrates.
- All ids (scenes, flags, quests, items, maps, enemies, challenges, notes) start with
  your chapter prefix (e.g. `sg.` / `sg_`). Characters may use plain names but must be
  unique; check `grep -r "C.chars\." src/content` first.
- Japanese must be natural for the speaker; English faithful and idiomatic. Every
  kanji in ruby. Run `node tools/validate.mjs --filter <prefix> --unknown` and add
  lexicon entries until your files produce NO errors and no unknown tokens.
  Run the full `node tools/validate.mjs` too: any error mentioning your ids is yours.
- The party is exactly the player + ONE companion (nao | mio | ren | suzu), unknown at
  authoring time. Use `comp` as speaker for companion lines and give each companion
  its own variant with `?(comp=nao)` etc. whenever the companion reacts to something
  important. Voices: see STORY.md. Unchosen candidates may cameo (`if: 'comp!=nao'`).
- Every hub NPC also needs a post-story line (`if: 'post'`) showing what changed;
  vary by ending flags where it matters: end_mem_return | end_mem_choose,
  end_archive_library | end_archive_closed, end_kasane_trial | end_kasane_keeper.
- Learning moments: story challenges have all four tiers F/E/I/A. Foundations answers
  are short kana. Advanced tiers are genuinely advanced (nuance, register, implication,
  paraphrase, longer passages) — no kana quizzes labelled advanced. Accept every valid
  answer form. Add ≥40 drills tagged with your region across levels.
- Battles: visible foes placed on maps (avoidable), 4–8 regular foe types/placements,
  one boss with phases and at least one authored plea/lie/mirror intent. Every battle
  must be winnable with Unravel alone. Use only words the player can know by then.
- Quality over padding: no empty rooms, placeholder text, reskinned fetch quests or
  "coming soon". Let quiet places exist. Small human details, restrained humour.
- Test in a real browser: `node tools/build.mjs`, then
  `node tests/e2e/shot.mjs tests/e2e/out/<name>.png "RB.game.debugStart('<map>', x, y, {comp:'mio', flags:{…}}); 1" 800`
  and look at the PNG (walk layout, props, NPCs). Script a battle and a scene the same
  way (see tests/e2e/lib.mjs). Fix console errors you cause.
- Final report: files, counts (maps, NPCs, scenes, dialogue lines, quests incl. side,
  foes, drills), validator output summary, what you tested in the browser, known gaps.
