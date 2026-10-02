# Practice, Fishing and Shiritori — shared contracts (foundation)

The owner's brief is *Roadside Practice, A Quiet Cast, and Companion Shiritori*
(Practice addendum, version 1.0, 2 October 2026). Section numbers below (§) refer to it. This
file records what the foundation provides and the rules every activity follows. Each
area keeps its own record in `docs/practice/<area>.md`.

## Files and ownership

| Area | Owner | Files |
|---|---|---|
| Foundation | integrator | `src/engine/08_practice.js`, `09_activity.js`, `71_shiritori.js` (rules core), `src/ui/68_practice_index.js`, the section hook in `src/ui/53_company_pages.js`, `campaign:changing` in `src/engine/90_game.js`, `tests/unit/practice_core.test.mjs` |
| Fishing (untimed presentation, content, catalogue) | fishing worker | `src/engine/75_fishing*.js`, `src/ui/86_fishing*.js`, `src/content/fishing/`, `src/styles/74_fishing.css` |
| Fishing pace (clock, calibration, records) | pace worker | `src/ui/69_pace.js` (replaces the provisional stub), `src/engine/76_pace.js`, `src/styles/75_pace.css` |
| Shiritori engine (banks, audits, opponents, benchmark) | engine worker | `src/engine/71_shiritori.js` (extend, keep the API), `src/engine/72_shiritori_ai.js` (replaces the stub), `src/content/shiritori/`, `tools/shiritori_*.mjs` |
| Shiritori table, Wordplay, Company, Bond | wordplay worker | `src/engine/73_wordplay.js`, `src/ui/87_wordplay*.js`, `src/content/wordplay/`, `src/styles/76_wordplay.css` |
| Lantern tending, writing desk, Practice mementos page | suite worker A | `src/engine/77_lanterns.js`, `78_desk.js`, `src/ui/88_lanterns.js`, `89_desk.js`, `src/ui/67_practice_mementos.js`, `src/content/practice_a/` |
| Correspondence, Proofreader's Tray, One Word Two Moments | suite worker B | `src/engine/79_letters.js`, `src/ui/90_letters.js`, `91_proof.js`, `92_compare.js`, `src/content/practice_b/` |

A shared file outside an area (menu, settings, challenge runner, maps, companion module)
is edited only with a small, documented change. The change is listed in the area's merge notes.

## `s.practice` (src/engine/08_practice.js)

`RB.practice.fresh()` creates it; `RB.practice.of(s)` creates or fills it (older saves:
empty, pace Off, nothing inferred). `RB.save.migrate` calls `of`. Shape:

```
{ v: 1, nextSessionSeq, settings: {}, fishing: { observed, siteQueues, milestones, calibration,
  recentAttempts, lastCommittedCatchSeq, active }, shiritori: { byCompanion, active },
  deskPages: [], activityCompletion: {}, tally: {} , ...registered namespaces }
```

- An area adds its own sub-state with `RB.practice.addNamespace(key, defaults, normalise)`.
  This must happen at load time, so new campaigns and migrated saves both get it.
- Records are bounded (§21.3). Use validated plain data; never DOM, functions or event logs.
- Per-campaign setup (`RB.practice.settings(s)` / `set`): `fishingPace` (default `off`),
  `fishingCustomSec`, `shiritoriFormat` (`competitive`), `shiritoriBand` (`pocket`),
  `shiritoriLevel` (`casual`), `shiritoriSupport` (`open`), `shiritoriChain` (12), and `demoSeen`.
- Device preferences live in `RB.game.settings`: `activityChatter` (`normal`/`quiet`),
  `hideTotals`, `fishSeconds`, `fishWait`. They appear in Settings › Learning & Challenge ›
  Ways to practise.
- `RB.practice.seq(s)` returns a monotonic per-campaign session/cast number.
  `RB.practice.stream(s, name, extra)` returns a seeded generator. Use one stream per
  purpose: species queue, strategy, decorative motion. Never use `Math.random` for an
  outcome.

## Learning evidence (§4)

- Run an authored step with `RB.challenge.runStep(step, { noRecord: true, … })`.
- Then call `RB.practice.objectives(session).assess(objectiveId, item, result, o)`. It
  writes **at most one** mastery event per objective; a later corrected or assisted
  continuation is a tally only. `o.exposed` (traced, copied or shown answer) and `o.paced`
  (a timed fishing attempt) never touch mastery.
- `RB.practice.tally(s, kind, fields)` keeps bounded counts apart from mastery.
- `RB.practice.cooldown()` blocks the identical objective at once, and keeps a missed one
  out for the next four objectives. `RB.practice.pickItems(pool, n, cd)` asks the scheduler
  within the cooldown. A short pool gives a short session; it never repeats to fill.
- A recognition repair, a reported misread, a timeout or an abandon is never a language error.

## One session at a time (src/engine/09_activity.js, §3)

```
RB.activity.register(kind, { title, eligible(s, ctx) -> { ok, why }, run(session) -> Promise<result>, dispose?(session) })
RB.activity.launch(kind, { source: 'company'|'companion-talk'|'world-prop'|'words', returnView? })
```

- `launch` closes the folio (remembering page and scroll), then checks eligibility again.
  It pushes mode `activity`, which pauses the world, runs the activity, then holds input
  for 220 ms (mode `activity-exit`). It reopens the original page only if the world is safe.
- `session.alive()` is false after the session ends or the campaign changes
  (`campaign:changing`). Check it before writing anything after an `await`.
- `session.set(state)` accepts: eligible, preparing, active, resolving, result, suspended,
  converted-to-untimed, abandoned, exiting.
- Events: `activity:session-start` and `activity:session-resolved`. Never emit
  `discovery:resolved`, because its listeners award regional bond.
- World safety is `RB.activity.safe(o)`, which uses `RB.company.safeHere()`. A solitary
  activity does not need the companion beside you; pass `{ companion: true }` (or set
  `companion: true` on the `addActivity` entry) for one that does, such as shiritori. Rest places
  come from `RB.company.restHere(s)`. Rest-menu choices are added with
  `RB.company.addRestOption(fn)`. *Just chat* stays first; activities come after the
  existing choices.

## Navigation hooks

- **Words › Ways to practise.** Call `RB.practice.addActivity({ id, en, jp, icon, order,
  where: {en, jp}, companion?, available(s), here(s), note(s), begin(ctx) })`. *Begin here* is shown only
  when `here(s)` is true and the world is safe; there is no remote launch.
- **Company › Companion sections.** Call `RB.ui.companyPages.addSection({ id, order,
  html(s, comp, view), click(button, s, api) })`. Buttons carry `data-co-sec="<id>"`.
- **Journey pages** use `RB.ui.menu.addPage('journey', …)`. **Words pages** use
  `addPage('words', …)`. The menu alias `practice` opens Words › Ways to practise.
- **Practice mementos.** Call `RB.practice.addMementoSource({ id, list(s) })`. Suite worker
  A renders them in Journey. They never become Roadside Keepsakes.

## Seams (provisional at the foundation, real since the merges)

- `RB.pace.attempt(step, o)` in `src/ui/69_pace.js` is the real pace module (`provisional: false`).
  Fishing calls it for **every** response entry, Off included (docs/practice/pace.md §1).
- `RB.shiritori.chooseMove` and `RB.shiritori.analyse` in `src/engine/72_shiritori_ai.js` are the real
  opponents (strategy `roadside-ai-1`, `provisional: false`). `RB.shiritori.removeBank(id)` exists for
  tests that build their own banks.
- `RB.practiceDesk.keepPage(s, page)` (suite A) owns the shared six-page budget. Suite B's pages go
  through it, and a page is marked saved only after a save-slot write succeeds.

## Shiritori rules core (src/engine/71_shiritori.js, §10)

- `RULES = 'roadside-1'`. `norm()` applies NFKC, trims, and maps katakana to hiragana.
- `boundary(reading)`: a final ー takes the vowel of the preceding mora, a final small
  kana becomes full size (for the boundary only), and a final ん is terminal. Dakuten stay
  distinct.
- `buildBank({ id, version, entries, starters })` unions repeat-groups by entry group and by
  identical canonical reading, so homophones share one group. It builds an edge per accepted
  reading, plus the forms index and a content hash.
- `resolve(bank, text)` returns matches with their edges and `needsReading`.
- Game functions: `newGame`, `check` (an invalid draft keeps the turn), `play`
  (`no-safe-reply` win, `terminal-n` loss), `concede`, `safeReplies`, `safeGroups`,
  `legalEdges`, `moves`, `casualMove`.
- The state holds only public data (`used`, `required`, `next`, `history`, `over`).

## Rules no area may break

- No clock anywhere except an explicitly started fishing response entry; Off is the default.
- No bond except `activity:shiritori:together` and `activity:shiritori:reflection`.
- No speed-only, handwriting-only or no-help-only reward.
- No network, CDN, account, AI runtime or uploaded handwriting.
- Furigana on every displayed kanji, checked by the validator, which walks content
  registries. Register new Japanese text where `tools/validate.mjs` can find it.
- Recognition stays separate from evaluation; never nudge it toward the expected answer.
- Player saves are never touched by tests. Use synthetic campaigns in fresh browser
  profiles.
