# Cosmetic pets (worker P) — record

Four original animals — a cat, a dog, a small bird and a tanuki — that can travel with you after you meet
them. They are company only: no stats, no statuses, no numbers, no turn, no effect on answers, rewards,
Harmony, difficulty or the story. Everything here is drawn in code (no image, font or sound files).

What was checked and how is in **Evidence** below; what is not done or not verified is in **Limitations**.
Nothing here claims natural Japanese, fun, or human playtesting.

## Files and APIs

| File | What it holds |
|---|---|
| `src/engine/37_pets_0family.js` | `RB.families`: `LIST` (unravel, protect, light, heal, water, wind, bind, stone, ice, fire, bell, interpret, technique, support); `ofResponse(id)`, `ofCard(card)`, `ofAction(id)`, `ofPassive(comp)`, `base('technique', comp)`. Every player response, word, technique and companion action maps to a family (unit test fails on an unmapped one). |
| `src/engine/37_pets_1data.js` | `RB.pets`: `ORDER`, `SPECIES`, `species(id) → { name, reading, label: {en, jp}, about }` (null if unknown), `looks(sp)`, `record(s, sp)`, `met(s)`, `active(s)`, `visible(s, 'world' \| 'battle')`, `lookOf`, `meet(s, sp, where)` (once: `RB.state.once(s, 'pet:met:<sp>')`, emits `pet:met`), `select(s, sp \| null)` (emits `pet:select`), `rename`, `resetName`, `nameAtMeet`, `setLook` (emits `pet:change`), `nameOf`, `cleanName`, `portrait(canvas, sp, look)`, `thumb`, `addVignette`, `vignetteAction(id, family)`, `vignettes`, `hide/show/sceneHidden`, `AFFECTION`, `howMet`, `sound(sp, kind)`, `defineSounds()`, `canGreet(s, {rest})`, `greet(s, {rest})`, `restOption(s)`, `fieldTargets(s, map, x, y)`, `fieldWeave(s, id, family)`; conditions `pet`, `pet=cat`, `pet.cat` (`RB.state.addTerm`). |
| `src/engine/37_pets_2art.js` | `RB.petArt` volume rasterizer: posed ellipsoids and tapered chains, depth buffer, 5-step hue-shifted ramps, part-local patterns, contours, selective outline; `camera`, `render`, `K.dir` (a body direction in world space). |
| `src/engine/37_pets_3rig.js` | The four rigs, three looks each, the views (road: 4 directions; battle: rear three-quarter; preview; portrait), `frame(sp, look, view, pose)`, the LRU frame cache (900 frames) and `cacheStats()` (entries, pixel bytes). |
| `src/engine/37_pets_5dev.js` | `RB.pets.dev` (development only; refuses unless the page has `?dev=pets`): `rows`, `layout`, `cellRect`, `cells`, `sheet` (the coverage matrix), `battle`, `play`, `panel`. |
| `src/engine/57_petworld.js` | `RB.petWorld`: following, settling, catch-up, the pre-acquisition animals (`addWild`, `wild`), staging (`act`, `come`, `face`, `nearTile`, `faceFrom`), `state()`. |
| `src/ui/85_battle_pets.js` | `RB.battlePets`: the battle observer (`REACT`, `IMPACT`, `VICTORY`, `CALM`, `READY`, `BASE`), `draw`, `stats`, `sample`, `sampleAny`, `centreOf`; the settings rows (Display › Pets: `petWorld`, `petBattle`; Audio: `petSounds`). |
| `src/ui/54_company_pet.js`, `src/styles/35_pets.css` | Company › Pet, and the naming sheet `RB.ui.petName(s, sp)`. |
| `src/content/pets/` | `00_lex.js` (lexicon), `01_hooks.js` (`pet_meet`, `pet_vig`, `pet_hide`, `pet_show`, `pet_come`, `pet_face`, `pet_do`; `RB.pets.WORLD_ANIM`), `10_cat.js`, `20_bird.js`, `30_dog.js`, `40_tanuki.js` (vignettes), `50_greet.js` (the sixteen greetings and the rest-point registration). |
| Tests | `tests/unit/pets.test.mjs`; `tests/e2e/pets.mjs`, `pets_greet.mjs`, `pets_gallery.mjs` (in `run.mjs`); `pets_sheets.mjs`, `pets_perf.mjs`, `pets_video.mjs`, `pets_docs.mjs` (evidence tools). |

## Data (save)

`s.company.pets[species] = { name, reading, look, met: { t, map }, nameAtMeet }`, `s.company.pet` (the one
travelling with you, or null). Defaults Koma (コマ), Mugi (ムギ), Sora (ソラ), Ponta (ポンタ). Names are plain
text in any language: NFC, line breaks collapsed to spaces, control and bidi characters removed, 1–24 grapheme
clusters (`Intl.Segmenter`), shown escaped everywhere (never markup — `{猫|ねこ}` or `<img …>` stay text). An
unknown species id in a save is kept, drawn nowhere and noted on the Pet page. The meeting memory is
`RB.company.memory({ id: 'pet:met:<sp>', kind: 'pets', … })` with the name at the time and the companion's reply.

## The animals

| | Looks | Character in motion |
|---|---|---|
| Cat | ginger tabby, gray tabby, calico | restrained: watches, sits tall, a paw reaches, a slow blink |
| Dog | cream, brown (urajiro), black and tan | attentive: ears up, leans in, braces, wags |
| Small bird | brown, gray, muted cream | quick: head tilts, hops, fluffs, one contained wing flourish; the beak opens when it calls |
| Tanuki | warm brown, gray-brown, dark brown | round and earnest: rises on its hind legs, folds its paws, copies gestures; dark mask, legs and tail tip, no ringed tail |

Views: road (32×32 art px; the bird 24×24) facing all four ways with walk, run (catch-up), sit, lie; battle
(48×52, seen from behind at three-quarters, beside you); a turning preview and a portrait bust for the
Company page.

## Battle: the observer

The combat loop emits semantic events from the presentation layer (`src/ui/80_combat.js`):
`present:action { actor, family, targets, result, exchange, t0, beat, won, victory }`,
`present:enemy { actor: 'foe:i', targets, outcome: hit | absorbed | blocked | status, at, t0 }`,
`present:scene { phase: enter | calm | ready | victory | defeat | exit }`, timed on the presentation clock
(`RB.battleSeq.now()`), so the pet adds no wait. It never acts, holds no status, shows no number, and its slot
(`lay.pet`, between your companion and you) is kept clear of the response area, the task, the slips and the
companion's cards. One dominant reaction per exchange; later actions in the same exchange get a short
acknowledgement. A calm or skip drops anything pending (nothing replays later). Reduced motion: each
reaction's key pose is held, no hops, no idle movement. Particles: none (the budget of 6 is unused).

Reaction matrix (every row exists for all four species; the coverage sheet shows every cell):

| Family | Cat | Dog | Bird | Tanuki |
|---|---|---|---|---|
| unravel | follows the thread, a paw reaches | ears up, tracks it | head up, a small hop | rises, paws reaching |
| protect | sits tall, braced | braces low, leans back | tucks, turns aside | rises, paws held in front |
| light | looks up, a blink | nose to the light | head tilted to it | shades its eyes, then leans in |
| heal | eases, sits tall, blinks | softens, a slow wag | unfluffs, blinks | a breath out, paws folded |
| water | a paw lifted, draws back | head tilt | fluffs and shakes | paws together, looks up |
| wind | flattens, tail blown aside | braces in the gust | wings half out | leans into it |
| bind | watches, tail up and aside | leans back, watches | head tilt | paws busy, as if tying |
| stone | crouches, steady | spreads its stance | crouches | crouches, eyes shut |
| ice | an ear flicks | a sniff, an ear | fluffs against the cold | leans in, then back |
| fire | turns away, half-closed eyes | looks aside, a wag | wings, looks aside | paws up, looks aside |
| bell | ears turn one way, then the other | head tilt, ears up | calls (beak opens), a hop | head tilts side to side |
| interpret | ears forward, a knowing blink | looks to you, then at it | head tilts left and right | scratches its head |
| technique | sits tall, tail straight up | a forward-ready gesture | a wing flourish | a confident imitation, paws folded |
| support | glances to your companion | looks to your companion, a wag | glances over | glances over, paws |

A creature's move near you: hit (a crouch and a look at whoever it was aimed at; no injury cue), soft
(absorbed or blocked: a small lean), status (ears or head). The settled victory with your cheer: the cat sits
tall, the dog wags, the bird flourishes, the tanuki rises and folds its paws. Idle: 4 calm idles for the cat
and dog, 3 for the bird and tanuki, on their own irregular clock (never the gameplay random streams), and a
ready idle.

## World

A field weave nearby (`present:action` with `scope: 'field'`, which the Weave presentation emits as the word
goes out): it turns toward where the word lands and gives a small reaction by family (braces for protect and
stone, draws back from wind, water, fire and ice, sniffs at a binding or an unravelling, looks up at light and
a voice; a small happy hop when the result is complete), on its own time — the emitter never waits for it.

It follows the tiles you walked, one step behind your companion (or you), runs when three steps behind,
catches up discreetly (a fade) after a door, a warp, a cutscene move or a broken trail, steps aside when
someone walks onto it, never stands on anything solid, never changes the collision grid, and settles on a free
tile where it can be seen (not on you, not on your companion, not just above either of you, not on a door, a
trigger, a way out or the tile you are facing). Hidden before you meet it, with "Show pet in exploration"
off, and in a scene that asks (`!hook pet_hide` / `!hook pet_show`).

**At rest it is never quite still (2026-10-03, the owner's report).** Your pet, the animals not yet met
(between the moments their scenes author) and the animals among the people (Mochi) all keep moving at rest:
- They breathe with the people's shape: settle, a beat, rise, a beat.
- The tail keeps moving: the cat swishes (the tip a beat behind; sitting, it lifts as it sweeps), the dog
  wags gently, the tanuki sways, and the bird flicks now and then.
- Breath and tail step through one short cycle per species (`LIFE` in `57_petworld.js`: cat 2.8 s in 8
  phases, tanuki 3 s in 6, dog 1.2 s in 6, bird 2.2 s in 8; lying, 1.4× slower). Each posture therefore has
  only a handful of frames, and they repeat from the art's cache (a further 4 s of one posture builds 4–9
  new frames).
- It never covers a tail movement a scene authored (a flick, a wag), and adds nothing with reduced motion.

**Animals among the people.** An npc whose look is `{ pet: species, look, rest: [sit ms, lie ms] }` is
drawn by `RB.petWorld.actorFrame` with this rig rather than a creature sprite: walking when it moves, then
standing, sitting and lying at rest (it is found lying when you arrive), with the life above. Mochi, Tomo's
cat in Reedwake, is one: the look `cat/mochi` (white, a red collar), which is not one of the pet looks you
can choose.

## Vignettes (src/content/pets/)

Each has a visible cause you can inspect, one or two ordinary interactions, a meeting, an invitation with
**Not now** (it stays and waits), naming and selection as separate steps, the memory once, and stays open for
good (no missable window; still there in the postgame). The field route is `RB.pets.vignetteAction(id,
family)` and ends in the same state as the ordinary one.

For the Weave sheet (`src/ui/57_weave.js`, from the field-puzzle work) there is a small adapter, so wiring it
is a few lines at merge: `RB.pets.fieldTargets(s, mapId, x, y, radius = 2)` lists the vignette causes within
reach that a weave can still settle (`{ id, x, y, families, label: {jp, en} }`; none once settled or once the
animal has joined you), and `RB.pets.fieldWeave(s, id, family)` applies one and returns
`{ id, family, effective, say: [{jp, en}] }` — the physical result line, or for a family that does not fit, a
neutral line saying why nothing happened (the Japanese has already been accepted before this is asked). It
also emits `present:action { scope: 'field', targets: ['pet:<id>'], at, result }` like any other field action.
The vignettes are not registered as `RB.fieldweave` puzzles (that module's own tests fix its puzzle set).

| Species | Where / when | Cause | Ordinary interactions | Accepted families |
|---|---|---|---|---|
| Cat — *A Dry Corner* | Reedwake, by the carpenter's eaves; after Chapter 1 (`rw_echo_done`) | a loose reed screen keeps knocking it out of its dry corner | set the screen's foot back on its stone or tie its cord to the nail; offer a hand or sit nearby and wait | bind, stone |
| Bird — *The Ribbon by the Perch* | Saltglass, the old mooring post at the east end of the quay (43,26), the bird's sand a row below (44,27), clear of the tide window's machinery and the tiles you stand on to use it; once the harbour is yours (`quest.sg_main>=1`) | a faded ribbon on the post flicks it off its perch | untie the knot or wind and tuck the ribbon; stand still or hold out an open palm | unravel, wind |
| Dog — *The Gate That Will Not Stay* | Cinder Orchard, the channel keeper's yard; once the village is yours to walk about (`co_met_sayo`) | a gate swings into the corner he sleeps in | drop the latch loop or push the stop peg in; crouch or sit by the barrel; Tamotsu, the keeper, says he may go with you before the invitation | bind, stone |
| Tanuki — *Paper in the Clearing* | the Orchard Road under the trees; from your arrival there (`co_arrived`) | old festival notices blow across its hollow under a root | weigh them with a stone or tuck them into the rock's lee; sit and wait quietly | wind, stone |

## Greeting together

Sixteen short moments, `pets.greet.<nao|mio|ren|suzu>.<cat|dog|bird|tanuki>`: the animal walks over to your
companion and they share something only they would (Nao and the letters, Mio's check-up, Ren's slow blink,
Suzu's duet…). Each companion's four use different movement sequences (unit test). Opt-in only: Company › Pet
› "Greet together with …" (the folio closes, it plays in the world), and a rest point's menu through
`RB.company.addRestOption(RB.pets.restOption)` — registered automatically when the companionship module
provides `addRestOption` (it is not in this worktree; see merge notes). Refused with a reason (nothing played)
with no pet, with the pet hidden, and during a scene, a puzzle or a battle. Nothing is gained or lost.
Lines never speak the player-chosen name.

## Sounds

Four quiet synthesized effects (`pet_cat`, `pet_dog`, `pet_bird`, `pet_tanuki`), registered with the game's
effects: on a pat, at a meeting, and at the affectionate or calling moment of a greeting. Never needed (what
the animal does is always shown), softer than a menu confirm, and silent with "Quiet pet sounds" off.

## Development playback and the coverage gallery

`index.html?dev=pets` shows a small panel: species, look, family (every family, the creature's move, victory,
calm, ready, defeat), actor, result, target count, motion, viewport (opens the page in a wide, phone or small
window), "Start a dev encounter", "Play" (emits the same semantic events the battle does, so the real observer
reacts on the real stage) and "Open the coverage sheet". Without `?dev=pets` nothing appears and every entry
point refuses (browser test).

## Evidence

What was run, on this worktree after merging the task branch at c28d7b7 (commit b381207), headless Chromium
with synthetic session-only campaigns (never a player's save):

- Unit (`node tests/run-unit.mjs`): 6084 passed, 0 failed. `tests/unit/pets.test.mjs` (164 checks): names and
  their rules, records, unknown ids kept, never party/equipment/flags, every response, word, technique and
  companion action mapped to a family (fails on an unmapped one), every family used, the observer's matrix
  complete, reduced motion held, distinct key poses, identical rules results, enemy choices and answer-option
  order with no pet, a cat, a gray bird or a hidden dog; the four vignettes (closed before, open after and in
  the postgame, the field route equal to the ordinary one, neutral for a family that does not fit, the
  lasting change, nothing after the animal has joined you, the dog's permission before the invitation); the
  Weave adapter; the sixteen greetings (exist, distinct words and movement sequences per companion, no give,
  take, set or learn); furigana on every kanji in the pets' Japanese.
- Content (`node tools/validate.mjs`): no errors; `--filter pets --unknown`: no token without a dictionary entry.
- Browser, pets (`node tests/e2e/pets.mjs`: 20 passed; `pets_greet.mjs`: 17 passed; `pets_gallery.mjs`: 7
  passed) — see the headers of those files for exactly what each checks (world following, a one-tile lane,
  cutscene, defeat and return, doors, bridge, warps, scene hide, setting off; battle place, reactions, Next
  clicked with the mouse, reduced motion, no pet; Company at 1280×800, 390×844, 320×640 at 200 %, 844×390;
  every vignette end to end with keys and mouse, naming, memory once, reload; sixteen greetings and the
  refusals; the dev page and its absence in normal play; the coverage matrix; sounds; playback at three
  sizes with a resize and a hidden tab mid-reaction).
- Browser, the rest of the game touched by the hooks (`node tests/e2e/<script>`, same tree): combat_ui,
  battle_anim, battle_group, companion_turn, world_fixes, world_view, encounters, departures, quest_guide,
  fieldweave, mill_road, keepsakes, bookmarks, folio, settings, play_ui, systems, ui, `story_ch1.mjs F mio`,
  `story_ch3.mjs E nao`, side_ch3, `long_quests.mjs --fixtures-only` — all passed.
- `node tests/e2e/pets_sheets.mjs` (all sixteen species × companion pairs in the world, battle and Company, a
  different look per pair): no problems (run before the merge).
- `node tests/e2e/pursue.mjs E mio` (the whole game) stops in Chapter 1 in rw.warehouse ("timeout waiting for
  idle (mode menu)", with the cases' `cs_parcel` at 0) — and stops at the same place, in the same way, on
  c28d7b7 itself (checked from a plain copy of that commit), so it is not from this work; not investigated
  further here.
- Earlier, under heavy machine load (load average about 30 on 4 cores), two checks failed once on timing and
  passed when rerun: battle_anim's "rapid input" (a 120 ms wait) and the pets world test's scene restore
  (now polled). Recorded here so they are not mistaken for passes that never failed.

Captures: `docs/screenshots/pets/README.md` (made before the merge, except the bird's vignette, re-taken after
its spot moved). The recording is `docs/screenshots/pets/tanuki_battle.webm`.

## Performance

Measured with `node tests/e2e/pets_perf.mjs` (headless Chromium, 1280×800, dpr 1; Reedwake square before the
cat's vignette opens, so no other animal is there) on a shared 4-core container whose load average was about
19–20 during the run, so whole-frame times are noisy; the time spent inside the pet's own code is the useful
number. The run recorded here (before the merge; `tests/e2e/out/pets/perf.json`):

| | no pet | cat | dog | bird | tanuki |
|---|---|---|---|---|---|
| World, inside the pet's code per frame, warm cache (ms; walking, 5 × 240 frames, median) | 0.03 | 0.10 | 0.06 | 0.07 | 0.12 |
| World, the same with the cache just cleared (ms; 240 frames) | — | 2.58 | 1.31 | 0.10 | 0.62 |
| Whole world frame, update + render, warm (ms) | 7.0 | 5.8 | 4.3 | 5.6 | 5.7 |
| Battle, `RB.battlePets.draw` per frame over a reaction, warm (ms; 150 frames) | — | 0.05 | 0.02 | 0.06 | 0.04 |
| Battle, the same with the cache just cleared (ms; 150 frames) | — | 0.69 | 0.38 | 0.62 | 0.42 |
| Battle, calm, warm (ms per frame) | — | 0.06 | 0.02 | 0.02 | 0.03 |
| Decorative particles | 0 | 0 | 0 | 0 | 0 |

The whole-frame differences are within the machine's noise (the run with no pet was the slowest), consistent
with a warm cost of about a tenth of a millisecond. An earlier run under heavier load gave the same picture
(warm 0.04–0.18 ms in the world, 0.03–0.09 ms in battle). The cold-cache cost is each pose's first appearance
(a few milliseconds for a new frame, spread over the first moments of a new animation); after that, drawing is
a cached `drawImage`. The bird walks with one pose and a drawn hop, so it builds very few frames.

Memory: frames are cached by species, look, view and quantized pose (LRU, 900 frames at most; a battle frame is
48×52 px ≈ 10 KB, a road frame 32×32 px = 4 KB, so at most about 9 MB). After the four walks the cache held 54
frames (216 KB); an earlier run, after four battles without clearing, held 277 frames (1.9 MB). JS heap after GC:
11.2 MB before any pet, 13.8 MB after the four walks, 15.8 MB after the four battles — these heap figures
include everything the page did in between (maps, battles), not only the pets.

## Limitations

- Battle reactions are poses on a small figure; at phone size the differences between some families are subtle
  (they are distinct in the coverage sheet at art scale).
- A loss goes straight from the last exchange to the last safe place, so the defeat stance is set (tested)
  but on screen only for the moment before the transition.
- The vignette meeting's choice box can cover an animal that sits below you on screen (the dog's corner lies
  south of the only tile you can stand on); it is visible during the lines before the choice.
- The rest-point route is registered but only reachable once the companionship module (with
  `RB.company.addRestOption`) is merged; until then greetings are played from Company › Pet.
- The Japanese was written for this and validated for furigana and dictionary coverage; it has not been
  reviewed by a native speaker. No human playtesting.

## Shared files touched (merge notes)

- `src/engine/50_world.js` — one line at the end of `update`: `if (RB.petWorld) RB.petWorld.update(dt);`.
- `src/engine/60_render.js` — one line in `drawWorld`: `if (RB.petWorld) RB.petWorld.push(list, c, ax, ay, t);`.
- `src/ui/80_combat.js` — a small `present()` helper (errors caught) and its calls in `start`, the choose loop,
  `playPlayer`, `playCompanion`, `playEnemy`, after the loop (victory/defeat) and in `finally` (exit). No rules
  change; identical results with and without a pet (unit test).
- `src/ui/83_battle_stage.js` — `layout()` reserves `lay.pet` and includes it in the party box; `draw()` calls
  `RB.battlePets.draw` before your figure (in a try/catch).
- `tests/e2e/run.mjs` — `pets.mjs`, `pets_greet.mjs`, `pets_gallery.mjs` added to the default list.
- Generated: `src/recog/10_strokedata.js`, `src/lang/75_kanjiread.js` (regenerated for new kanji; regenerate
  at merge), `index.html` (built).
- `RB.company.addRestOption` is consumed if present (companionship worker); the memory id is
  `pet:met:<species>`, kind `pets`.
- Merged the task branch at c28d7b7 into this worktree (generated files regenerated). `RB.pets.visible(s,
  'world')` keeps its name and signature (the endings use it). The field-weave hook-up for the vignettes is the
  adapter above; `src/ui/57_weave.js` was not changed.
- The bird's resting spot was moved from (44,26) to (44,27) after the merge, because the tide window puzzle
  (F2) now stands at 44–46, 24–25 and (44,26) is where you stand to use its inlet.
- Reported, not changed: `RB.pix.hex` (src/engine/31_pixel.js) pads before rounding, so a channel can come out
  as three digits and give an invalid colour; the pet art uses its own `hex6`.
