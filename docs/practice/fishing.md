# A Quiet Cast — fishing (Practice addendum §5–§8; fishing parts of §3, §4, §20–§23)

Worker record for the fishing slice of *Roadside Practice, A Quiet Cast, and Companion
Shiritori* (version 1.0, 2 October 2026). It builds on the foundation in
`docs/PRACTICE_CONTRACTS.md`. Untimed presentation and full content; the optional pace
(§7) belongs to the pace worker and plugs into one seam described below.

Evidence categories are kept apart throughout: **unit/content tests** (node),
**browser tests of the built `index.html`** (headless Chromium), **visual inspection of
captures** (by the author of this slice), and **human play — none**. No native-speaker
review, no real-device or real-handwriting test, no Firefox/Safari run happened.

## 1. Files and APIs

| File | What it is |
|---|---|
| `src/engine/75_fishing.js` | `RB.fishing`: registries (sites, fish, situations, remarks, UI texts), the record in `s.practice.fishing`, eligibility, species choice (queue / patch / bag / look), `beginCast`, `abandon`, `commitCatch` (idempotent), milestones, reflection, catalogue entries, the `fish.*` condition term. |
| `src/engine/75_fishing_art.js` | `RB.fishArt`: original code-drawn fish (side-view description → RGBA buffer; plate, side, silhouette, flexed landing pose; the shared non-spoiling blank). Works in node (tests compare silhouettes). |
| `src/ui/86_fishing.js` | `RB.ui.fishing`: the activity (registered with `RB.activity`), the panel phases, **the pace seam `respond()`**, remarks, the reflection, the scene hooks `fish_go` / `fish_intro`, the Words › Ways to practise entry. |
| `src/ui/86_fishing_stage.js` | `RB.fishStage`: the dedicated waterside stage (canvas, whole-number scaling): site dressing, water, float, rod and line, the player's 12 poses and the companions' 7 behaviours on the battle-figure rig, pet reactions on the pet rig, situations, fish, a visible caption = the canvas's text equivalent. |
| `src/ui/86_fishing_notes.js` | `RB.ui.fishingNotes`: Journey › Fishing notes; the framed illustration; the Practice mementos source. |
| `src/content/fishing/00_lex.js` | Lexicon (fish names, waterside words, Suzu's stage words, UI words). |
| `src/content/fishing/10_fish.js` | The nine fish (names, readings, common English names, survey lines, hints, drawing descriptions). |
| `src/content/fishing/20_sites.js` | The three sites, patches, map placement, the station prop and its art, Yasu's two talk options. |
| `src/content/fishing/30_situations.js` | The 18 situations × F/E/I/A = 72 task variants. |
| `src/content/fishing/40_remarks.js` | Companion remarks, the reflection, the two Shared Memory texts. |
| `src/content/fishing/50_scenes.js` | Station scenes (Cast / Fishing notes / Rules / Leave), the signed note, Rules, Yasu's favour and thanks. |
| `src/content/fishing/60_text.js` | Interface labels with Japanese (validated). |
| `src/styles/74_fishing.css` | Stage, panel, notes; phone/landscape layouts. |
| `tests/unit/fishing.test.mjs` | Unit/content tests (670 checks). |
| `tests/e2e/fishing.mjs` | Browser tests of the built game (in `tests/e2e/run.mjs`). |
| `tests/e2e/fishing_video.mjs` | WebM recording of real play (on demand). |

Public calls other areas may use: `RB.fishing.counts(s)`, `RB.fishing.entries(s)`,
`RB.fishing.st(s)` (read-only for others), `RB.fishing.eligible(s, ctx)`,
`RB.ui.fishing.respond(step, ctx)`, condition terms `fish.intro`, `fish.survey`,
`fish.frame`, `fish.spread`, `fish.reflection`, `fish.count>=n`, `fish.seen.<id>`, and the
bus event `fishing:catch { seq, fish, site, isNew, milestones }` (never `discovery:resolved`).

### The pace seam (for the pace worker)

Every response entry goes through exactly one function, `respond(step, ctx)` in
`src/ui/86_fishing.js`, which calls

```js
RB.pace.attempt(step, { pace, budgetSec, header, ctxTag: 'fishing', representation, session,
  runOpts: { mode, cancelLabel, continueLabel, misread: true, wrongNote } })
```

with `pace = RB.practice.settings(s).fishingPace` (Off for every campaign). The result's
`paced` record is passed into `RB.fishing.commitCatch` (stored in the attempt record:
`paceKind`, `budgetMs`, `activeMs`, `expired`) and into the learning adapter as
`{ paced: result.paced.kind !== 'off' }`, so a timed attempt never touches ordinary
mastery. The preparation panel's pace selector reads `RB.pace.available(s, ctx)` and
`RB.pace.budgets(s, ctx)`: today Off is selected and Gentle/Brisk/Custom are shown disabled
with the honest note "not available yet: the optional pace for fishing is still being
built. Every cast is untimed." When `available()` turns true, Custom enables; Gentle/Brisk
enable when `budgets()` returns numbers (otherwise the note says how many comparable
untimed answers are still needed). Choosing writes `fishingPace` with
`RB.practice.set`. Ready, the clock, soft expiry and calibration are the pace module's
work inside `attempt()`; fishing needs no further change. One thing the pace worker may
want: `ctx.representation` (Kana / mixed-kanji, §7.4) is passed through but fishing does
not yet ask the player for it — the pace module can ask before Ready.

## 2. The three sites (existing maps only)

Tiles were chosen from each map's compiled geometry (tool output below: `@` stand tile,
`F` station, `r` reed tuft (blocked), `#` blocked, `P` prop, `N` person, `~` water).
The unit test `tests/unit/fishing.test.mjs` proves for each map that the set of reachable
walkable tiles from the spawn is **identical** before and after the postgame station
appears, that no exit/trigger is on the stand tile, that no prop shares the station tile,
and that no person stands on either tile.

**`fish.reedwake.current` — `rw.village`, stand (33,20) facing east, station (34,20).**
The west bank's reed line (blocked tufts) runs along x=34. One tuft becomes the station's
plank step after the postgame (it stays a reed tuft before: a conditional `reeds` prop with
`if: '!post'` replaces the terrain tuft, so the tile is blocked either way). Below the
bridge (rows 17–18), five tiles up the bank from Yasu's pier (34,25). Ren's postgame spot
(31,19) and the bridge lantern (32,18) are untouched.

```
before the postgame          postgame
    78901234567890               78901234567890
 19 ....N..r~~~~~~            19 ....N..r~~~~~~
 20 ......@r~~~~~~            20 ......@F~~~~~~
 21 .......r~~~~~~            21 .......r~~~~~~
 22 #####PPr~~~~~~            22 #####PPr~~~~~~   (F1 puzzle screen/clamp at 32–33,22)
```

**`fish.reedwake.quiet` — `rw.road` (the Lantern Road, Reedwake region), stand (15,7)
facing north, station (15,6).** The small reed-ended pond north of the road (water 12–17 ×
4–6, reeds at x=11 and x=18). The station is a stake in the shallows (a water tile:
nothing walkable changes). The lantern (14,8) and the road (rows 9–10) are untouched.
This is "a visibly sheltered … edge in the existing Reedwake area" — the addendum allows,
but does not require, a pond; it is the only still water in Reedwake's maps reachable
without a long quest (Koharuno's stream needs `lq_road_open`; the Mill Road has patrols).

```
    90123456789012
  4 ...~~~~~~r....
  5 ..r~~~~~~r....
  6 ..r~~~F~~r....
  7 ......@.......
  8 .....P........   (the Lantern Road's lantern)
```

**`fish.saltglass.harbor` — `sg.harbor`, stand (27,28) facing south, station (27,29).**
The quay's water edge between the two piers (x=18–19 and x=34–35); the station is a stake
at the foot of the quay wall (a water tile). Nets (21,27), (27,27), Daigo (25,26), Tetsu
(34,29) and the F2 puzzle (44–46, 24–25) are untouched.

```
    12345678901234
 27 P#....P#......   (nets)
 28 ......@.......
 29 ~~~~~~F~~~~~~N   (Tetsu on the east pier)
```

Each site's three casting patches (readable buttons in the panel and labels on the stage):

| Site | Patch | Fish (fixed data) |
|---|---|---|
| current | 流れの真ん中 Open current · 流れの縁 Current edge · 木陰の岸 Shaded bank | oikawa+ugui · kawamutsu+oikawa · kawamutsu |
| quiet | 広い水面 Open quiet water · 葦のきわ Reed edge · 日陰の浅いところ Shaded shallows | koi+ginbuna · motsugo+ginbuna · motsugo |
| harbor | 港の内側 Inner harbour · 底の見える浅瀬 Near-bottom shallows · 沖のほう Outer water | bora+mahaze · mahaze · maaji+bora |

All three patches together expose the site's three fish; the river site alone provides the
three species of the introductory favour.

## 3. Access, Yasu, entry routes (§5.1, §3, §20.1)

* Available after the real postgame (`post` = `flags.postgame`). The station props have
  `if: 'post'`; eligibility re-checks postgame, a registered site, the player standing at
  it, the plain world (no scene, no transition) and no creature within six tiles — without
  requiring the companion (fishing can be played alone).
* **Yasu**: two talk options are inserted just *before* his ordinary postgame line
  (`rw.yasu_post`), so his long-quest options (added later by `src/content/lq`, which
  prepend) keep priority. The favour (`fish.yasu_intro`) plays his usual postgame line
  first (`!call rw.yasu_post`), then asks for three kinds, once. After the survey,
  `fish.yasu_thanks` plays once; then his ordinary line again. While he waits by the far
  bank's lantern (`lq_road` stage 4), the station's **signed note** introduces the survey
  (no invisible speaker, no teleport). Completion is deposited at the station.
* **World prop**: the station's scene offers Cast / Fishing notes / Rules / Leave. `Cast`
  runs `!hook fish_go <site>`, which starts the activity once the scene has ended
  (`story:settled`; an activity never opens over a running scene).
* **Words › Ways to practise**: `RB.practice.addActivity({ id: 'fishing', … })` —
  *Begin here* only at a station in a safe world (no remote launch). Begun from the folio,
  it returns to that page afterwards (the foundation's `returnView`).
* Everything runs through `RB.activity.register('fishing', …)` / `RB.activity.launch`
  (one foreground session; eligibility re-checked at launch; `session.alive()` checked
  after every await; `dispose` closes the overlay, the stage and any answer sheet left open).

## 4. Discovery and the frozen fish (§5.4)

* Per site, a seeded queue of its three species (`RB.practice.stream(s, 'fish.queue', site)`,
  stored in `fishing.siteQueues`). **Discover the waters** takes the first unseen fish of the
  queue and a patch that has it: the first three successful discovery catches reveal the
  three entries, no duplicates.
* **Manual patch** choice: that patch's unseen fish first (queue order), then a shuffled
  bag per patch (seeded stream `fish.bag`, refilled when empty). Clearly labelled apart from
  the guided choice in the panel.
* **Look for this fish** (known fish only): guided to its patch, guaranteed on the next
  resolved catch there.
* The fish, the situation, the profile and who attended are frozen into `fishing.active`
  when **Cast** is pressed. Correctness, help, mistakes, pace, companion, pet and animation
  cannot change them (unit-tested). **Abandoning** (Leave, Escape, Back to the water, a
  campaign change) observes nothing and consumes nothing; a bag only gives up a fish at a
  committed catch.

## 5. A catch (§6.1) and the 72 task variants (§6.2–§6.4)

Prep (site/patch, Discover/Look, input method, pace selector, casts 1/3/5 default 3) →
Cast (prepare/cast poses, the float flies to the patch) → a cosmetic 2–4 s wait (decorative
stream; no Skip on the very first cast = the tutorial; **Skip waiting** afterwards; with
Settings › `fishWait` off it goes straight to the bite) → **the bite waits indefinitely** →
the situation (what the stage shows, in words; Yasu's note; untimed) → **one** authored
task through the existing challenge UI (`respond()`) → `commitCatch` (catch + one learning
outcome, once) → autosave, persistence result known → the matching line/rod/water action →
landing → the observation page (stays until Release) → release → Cast again / Review /
Leave. "Three casts" is only a suggested stop; Leave works at every step and keeps every
earlier record.

**Situations** (all 18, six per site, exactly the table's intents): C01 wait (drift ≠
signal), C02 right (reeds left), C03 left (branch right), C04 lift (stays under), C05 give
slack (twig snag), C06 slow lane; Q01 wait (ripple ≠ signal), Q02 two dips then bring in
slowly, Q03 sideways under a branch, Q04 not the reed side, Q05 to the tub not the dry
ground, Q06 ease in slowly; H01 wait then wind in (tug then slack), H02 right (post left),
H03 left (neighbour's line right), H04 the calm marker (same colour, read the tag), H05 lift
when the line is straight, H06 bring near before lifting. Each has: the scene's text
equivalent, the rule on screen (Japanese and English), the misinterpretation it explains,
what the stage draws, and four profile tasks:

| Profile | Shape | Examples |
|---|---|---|
| F | the expression taught first (teach card), then 1–3 taught kana (`RB.tasks.prepare` blanks one taught kana, or shows a model to copy — recorded as exposed) or one Japanese-only choice | C02 `みぎ`, C05 choose `いと を ゆるめる`, C06 read the sign `おそい` |
| E | a familiar word, 1–6 kana, written/chosen/typed; or a short choice/arrangement | C01 `まつ`, C04 `あげる`, Q05 `おけ`, H06 arrange `まず 寄せて から 上げる` |
| I | a condition/sequence/contrast in a Japanese note (〜まで, 〜たら, 〜と, 〜ないで, 〜とき, 〜てから, 〜にくい, より…) answered by a short choice | C04 (〜たら met), Q02 (count and sequence), H03 (〜ないでください) |
| A | implication/scope/nuance (〜わけではない, 〜ば〜ほど, 〜とはいえ, 〜かねない, 以外なら〜てもかまわない, 竿一本分以上…) by a supported choice or construction | Q04 accepts **both** sensible answers (left / toward you); H03 distance vs number of rods |

Totals: 72 variants — 24 write (every accepted form — kana, kanji, polite, with direction
particles, 180 forms — checked by `RB.challenge.check` both as typed and as handwritten
input, in the unit test), 46 choose
(every wrong option says why), 2 order. Every variant has a reading, a meaning, an
explanation and a learning item (`v:` words or `g:` grammar points that already exist).

**§6.4 handling**
* Uncertain recognition: the existing pad/runner path (strokes kept, "doesn't count against you").
* A confident misread reported by the player: new opt-in **"That is not what I wrote"**
  button on a wrong handwritten answer (`opts.misread`): the mistake is withdrawn, the
  strokes stay, the character can be rewritten; recorded as recognition repair (`misreads`),
  never as a Japanese error. A non-top candidate chosen on the pad is counted as
  `recogRepairs`.
* A genuine content error: the specific explanation; the same catch continues untimed; the
  fish never changes.
* Correct alternate forms: the accepted-form lists (and both options in Q04 A).
* Correct Japanese for another fishing action (e.g. `まつ` where a direction is needed):
  `opts.wrongNote` explains "good Japanese, but this activity only supports what Yasu's note
  asks for here" — never an invented grammar error.
* Help: "I don't know" (reveal), Translate, word help — immediate, no catch penalty;
  recorded honestly (`res.revealed` → `exposed`, assisted flag).
* An assisted resolved catch counts normally; leaving before observing counts nothing.

**Learning evidence (§4.3)**: the catch's commit calls
`RB.practice.objectives(session).assess('fish:<seq>:<variant>', item, result, { kind: 'fishing', exposed, paced })`
exactly once (a repeated commit is refused before assessing). A first confirmed mistake can
be that one event; a revealed answer with no prior mistake, a copy-mode Foundations step or
a paced attempt never touch mastery.

## 6. Records (§21.1a, §21.2, §21.3)

`s.practice.fishing` (created by the foundation; fields added and bounded by `RB.fishing.st`):

| Field | Content |
|---|---|
| `observed[fish]` | `{ first: { cast, site, patch, t, comp, pet: {species, name}, situation }, count }` — no length/weight |
| `siteQueues[site]` | `{ order: [3 ids], bags: { patch|'*': [...] }, refills, look }` |
| `milestones` | `intro {t, via}`, `first`, `survey {ribbon}`, `frame`, `spread`, `reflection {shared, solo}`, `met:<comp>` |
| `recentAttempts` | ≤ 50: `seq, site, patch, fish, situation, profile, inputMode, ok, firstTry, mistakes, assisted, exposed, recognitionRepair, paceKind, budgetMs, activeMs, expired, learned, comp, t` |
| `recentSituations` | ≤ 12, for the caller-side cooldown |
| `castSeq`, `lastCommittedCatchSeq` | monotonic cast sequence and the commit watermark |
| `catches`, `outings[comp]` | aggregate counts (continue past the bounded details) |
| `active` | the one cast in the water: `seq, campaign, site, patch, fish, how, from, bag, situation, profile, variant, inputMode, representation, phase, pace {kind, budgetMs, activeMs}, pauseReasons, expired, assistance, recognitionRepair, committed, draft, comp, pet, t` |
| `calibration` | reserved for the pace worker |

Idempotency: `commitCatch(s, seq)` refuses any `seq <= lastCommittedCatchSeq` (reloads,
repeated callbacks); finite milestones also use `RB.state.once('fish:first|survey|frame|spread')`.
A saved cast in the water is offered on the next visit to its station ("Pick it up again —
the same fish"); one at another station is let go safely. Old saves start empty with pace
Off; unknown future fish ids are kept and shown as unavailable; a new campaign (New Game+
included) carries nothing.

## 7. Catalogue, mementos, memories (§8.1)

* **Journey › Fishing notes** (`RB.ui.menu.addPage('journey', { id: 'fishing' })`, alias
  `fishing`): nine cells by site; a known fish shows its plate, name and reading, common
  English name, survey line, where it was first seen and who was there (companion and pet
  as they were), and the count; unseen = the same plain outline for all + a broad hint on
  request. Counts follow `settings.keepsakeCounts` (toggle on the page too).
* Milestones exactly per §8.1: first catch opens the notes (first drawing); **3 different**
  completes Yasu's survey + the **rod ribbon** (cosmetic, on/off in the notes, drawn on the
  rod only in fishing); **6** → the **framed waterside illustration** (the first six fish you
  saw, drawn into a frame); **9** → the **catalogue spread** (all nine plates) and the offer
  of a short reflection (shared only if the companion is actually there; otherwise a solo
  look back; the shared version stays available for a later visit with the companion).
* **Practice mementos**: `RB.practice.addMementoSource({ id: 'fishing', list })` lists
  `fish:ribbon` and `fish:frame` with `draw(canvas)`. Never Roadside Keepsakes.
* **Shared memories** (`RB.company.memory`, no bond): `fish:outing` at the first catch with
  the companion actually present; `fish:reflection` when the shared reflection is
  completed (with the actual exchange as its lines).

## 8. Stage, actors, company (§8.2, §8.3)

* **Player** (actual look and worn equipment via `RB.equip.look`): prepare, cast (back-swing
  and forward), watch, attentive shift, guide left, guide right, give slack, gentle lift,
  draw close, observe (holding the fish), release (crouched to the water), rest — 12 poses
  as pose data on the battle-figure rig (`RB.battlers._.render`), rear three-quarter toward
  the water. The rod hangs from the rig's own right-hand point (the projection constant is
  checked against the rig in the browser test); laid on the bank while the hands hold the
  fish.
* **Companions** (their own looks): settle, read/prepare notes, watch the float, react to a
  splash, lean toward the observation, respond briefly, resume rest — distinct gestures and
  timing: Nao arms crossed, checks the knot, hands-on-knees lean (300 ms); Mio kneels, hands
  clasped, hand to mouth at a splash (620 ms); Ren keeps the lamp, writes on a slip, hand to
  the glasses (460 ms); Suzu hands on hips, chin on hand, both arms up at a splash, a bow
  (250 ms).
* **Pets** (pet rig, battle view, visibility = the world setting): cat follows the float
  from dry ground (head yaw tracks the float), dog leans toward a splash, bird turns (and
  hops) toward ripples, tanuki copies your attentive posture a moment late; hidden pet / no
  pet: nothing drawn. Reactions overlap the action and never add a phase.
* **Remarks** (≥ 6 kinds × each companion, variants for the repeatable ones): first outing,
  patient wait, ordinary catch, new discovery, voluntary stop, completed survey (+ the
  reflection). Rules: one per catch (survey > discovery > every other ordinary catch), at
  most `round(2 × casts / 3)` ambient wait remarks per session (two in three casts), never
  while the answer sheet is open, none with Settings › Activity chatter = Quiet. Shown as a
  short bubble over the stage and in the observation page.
* **Reduced motion**: still key poses, a 260 ms dissolve between them; no continuous
  redraw while nothing changes; the result and every text unchanged.
* **Decorative randomness** has its own seeded stream (site + cast sequence); the wait
  length uses its own seed; nothing decorative can affect an outcome.
* **Site dressing** is fixed per site (it never changes between casts): the river's
  current flowing downstream (left to right), the bridge upstream on the left, Kōji's ferry
  house and trees on the far bank, reed tufts along your bank; the pond's dense trees,
  shaded far margin and reeds closing both ends; the harbour's stone quay, the two piers in
  perspective with posts, open water, a moored boat. Situation props (a reed clump, a
  trailing branch, a post, a twig, a neighbour's line, red markers, lane signs, a tub) are
  drawn relative to the float; readable signs and tags are DOM text with furigana over the
  canvas (no fake glyphs in pixels).

## 9. Natural-history captions: pending source check

The references [F1]–[F9] (knsk-osaka.jp, pref.gunma.jp, biwahaku.jp, tokyo-zoo.net,
aquarium.co.jp) were **blocked by the build environment's network proxy**; nothing could
be verified. So the game makes **no biological claim**: each entry shows its name, reading,
a common English name and a *survey line* stating where in the game it was recorded
(e.g. 「オイカワ。川の流れで見た。」), which is a fact of the game, not of biology.
**Pending source check** (to do with access to [F1]–[F9]): one short verified sentence of
distinguishing appearance and broad water setting per fish, and confirmation of the
common English names (pale chub, dark chub, Japanese dace, silver crucian carp, common
carp, stone moroko, yellowfin goby, flathead grey mullet, Japanese jack mackerel). The
drawings follow general, widely known features of the species (a long anal fin, a dark
lateral band, three orange stripes, a deep body, barbels, an upturned mouth, a goby's two
dorsal fins and sucker disc, a mullet's separated dorsals, a jack's line of scutes); they
are art, not captions, and should also be looked at by someone who knows the fish.

## 10. Bounded decisions taken (§22.2)

* Station tiles as in §2 (reasons there); the pond for quiet water.
* Survey without a Journey quest entry (no quest-guide markers): the favour is told by Yasu
  or his note; progress shows in the panel and in Fishing notes.
* The fishing record lives only in `s.practice.fishing`; conditions via the `fish` term,
  not story flags.
* Situation art is drawn relative to the float, so the same rule reads at every patch.
* Readable stage labels are DOM text; the stage's text equivalent is also a visible
  caption under the picture on wide screens.
* Foundations tasks show a teach card the first time (and on request), as the challenge
  runner does for authored challenges.
* Two kanji (堤, 暴) were avoided (あばれる in kana; 桟橋 for "breakwater") rather than
  regenerating the recognizer's stroke data — see merge notes.

## 11. Coverage matrix (§5–§8, §23.3)

| Requirement | Where | Evidence |
|---|---|---|
| §5.1 postgame access; Yasu preserved; signed note; three species at the first site | 20_sites, 50_scenes, 75_fishing | unit (access, Yasu order, roster); browser "Yasu", "one complete catch" (note) |
| §5.2 three sites in existing maps, safe tiles, three readable patches | 20_sites | unit (identical reachability, no exit/trigger/prop/person); browser captures |
| §5.3 nine fish, original art, distinct silhouettes | 10_fish, 75_fishing_art | unit (36 silhouette pairs IoU < 0.9); captures; captions **pending source check** |
| §5.4 queue, Discover, manual patch, bag, Look, frozen, abandon | 75_fishing | unit (all sites); browser survey run |
| §6.1 complete catch, wait/Skip/fishWait, indefinite bite, one task, commit once, observation until dismissed, Cast again/Review/Leave | 86_fishing | browser (real clicks, keyboard, touch) |
| §6.2/§6.3 18 situations × 4 profiles | 30_situations | unit (72 variants, all forms) |
| §6.4 uncertain/misread/content error/alternate/unsupported/help | 65_challenge (opt-in), 86_fishing | browser repair test; unit (other-action words) |
| §7 pace | seam only (`respond`) | Off shown; Gentle/Brisk/Custom disabled honestly — **pace module pending (pace worker)** |
| §8.1 catalogue, counts setting, milestones 1/3/6/9, mementos, two memories, no bond | 86_fishing_notes, 75_fishing | unit; browser notes page, survey, reload |
| §8.2 stage, 12 poses, 7 behaviours × 4, fish presentation, reduced motion, dressing | 86_fishing_stage | browser stats + captures (visual inspection by the author) |
| §8.3 remarks ≥ 6 × 4, limits, Quiet; pets × 4 + none | 40_remarks, 86_fishing, stage | unit; browser (ambient ≤ 2/3 casts, Quiet, 16 pairs + no pet) |
| §3 one session, re-check, alive(), dispose, no remote launch, return view | 86_fishing via RB.activity | browser (Words → back to the page; Escape; mid-cast leave) |
| §4.3 one mastery event; paced/exposed never | 75_fishing + adapter | unit |
| §20.2 44 px targets, 5 layouts + 200 % text, keyboard/mouse/touch, no sideways scroll | 74_fishing.css | browser layout test (with captures) |
| §21 records, bounds, idempotency, migration, NG+ | 75_fishing | unit; browser reload |
| §23.3 timed variants (Gentle/Brisk/Custom, fake clock, calibration) | — | **not here: pace worker** |

## 12. Commands and results

(see §13 for the final run, filled in at hand-off)

## 13. Evidence list

Captures are in `docs/screenshots/fishing/` (index in its README) and the recording
`docs/screenshots/fishing/fishing_catch.webm` (made by `tests/e2e/fishing_video.mjs`).

## 14. Limitations and what remains

* No human play, no native-speaker review of the new Japanese, no real handwriting (the
  repair test uses synthetic reference strokes), no real phone/stylus, no Firefox/Safari.
* Natural-history captions pending a source check (§9).
* The optional pace (§7, the timed parts of §23.3) is the pace worker's; fishing calls it
  for every response and shows it unavailable until then.
* The stage is original pixel art judged only by its author from captures.
* The menu's Fishing notes page opens from the station's scene with the alias `fishing`.

## 15. Merge notes — every shared file touched

| File | Change | Why |
|---|---|---|
| `src/ui/65_challenge.js` | +~22 lines, opt-in: `opts.wrongNote(text)` replaces the generic feedback for real Japanese of another action; `opts.misread` adds "That is not what I wrote" to a wrong handwritten answer (withdraws the mistake, keeps the strokes, `res.misreads`); `res.recogRepairs` counted when a pad candidate is chosen; `res.revealed` set by "I don't know". Without the options nothing changes for other callers (the two new result fields are additive). | §4.2, §6.4 |
| `src/ui/68_practice_index.js` | 1 line: an activity may give its own `safe(s)` world check (fishing does not need the companion beside you). | §3.2 |
| `src/ui/50_menu.js` | 1 line: alias `fishing: ['journey', 'fishing']`. | station scene's "Fishing notes" |
| `tools/validate.mjs` | 1 line in the registry roots (`fishing: RB.fishing.content()`), 1 line checking every fishing task with `checkStep`. | furigana/lexicon/step validation |
| `src/lang/75_kanjiread.js` | regenerated by `node tools/kanjiread.mjs` (two readings added: 増 ま, 辺 へん). Resolve conflicts by regenerating. | new words |
| `index.html` | rebuilt (`node tools/build.mjs`); resolve by rebuilding. | deliverable |
| Maps (no map file edited) | `src/content/fishing/20_sites.js` adds props to `rw.village`, `rw.road`, `sg.harbor` and turns `rw.village` (34,20)'s terrain tuft into a conditional `reeds` prop (`!post`); inserts two options into Yasu's talk list before `rw.yasu_post`. | §5.1, §5.2 |
| `tests/e2e/run.mjs` | 1 line: `['fishing.mjs']`. | suite |

Not touched: `src/ui/69_pace.js`, shiritori files, other workers' areas, HANDOFF.md,
REQUIREMENTS.md, VALIDATION.md (the integrator records the merged results).
