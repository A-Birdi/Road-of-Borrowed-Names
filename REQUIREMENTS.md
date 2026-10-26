# Requirements checklist

Derived from `SPECIFICATION.txt` (section numbers in brackets).
Status: `[ ]` not started · `[~]` in progress · `[i]` implemented, unverified ·
`[v]` verified (evidence in VALIDATION.md) · `[b]` blocked.

## Delivery [1]
- [v] R1.1 Single self-contained `index.html`, vanilla JS, no CDN/network/server
- [v] R1.2 Works offline; no runtime network requests
- [v] R1.3 Storage detected by real write/read; honest session-only messaging
- [i] R1.4 Engine/content/learning/recognition/audio/persistence separated in source
- [i] R1.5 All visuals/audio procedural; Japanese text readable (not pixel font)

## Story & world [2,3]
- [v] R3.1 Six chapters: Reedwake, Saltglass, Cinder Orchard, Snowbell, Lanternfall, Still Archive — a new campaign played through all six in the browser for every profile × companion (tests/e2e/matrix.mjs, 16/16)
- [i] R3.2 ≥5 inhabited settlements: Reedwake, Saltglass harbour, Cinder Orchard village, Snowbell hamlet, Lanternfall town (+ the Archive camp)
- [i] R3.3 6 dungeon/ruin sequences: the mill, the Drowned Archive, the sealed kiln, the frozen observatory, the drowned bell tower, the Still Archive
- [i] R3.4 21 authored side quests (rw 6, sg 3, co 3, sb 3, lf 4, sa 2) plus 4 companion personal quests; list via tools (see VALIDATION.md)
- [i] R3.5 Antagonist (Kasane and the Hush) with understandable motive (docs/STORY.md; ch6 scenes)
- [i] R3.6 Final choices about promises/repair (three ending choice pairs: memories return/choose, archive library/closed, Kasane trial/keeper), not a good/bad switch
- [v] R3.7 Denouement tour of the five towns, companion-specific epilogue lines, post-story NPC lines varying by ending flags; every matrix run ends back in Reedwake with post-game flags (story_ch6.mjs talks to every post-story NPC)
- [v] R3.8 Fast travel/shortcuts after routes explored (systems.mjs: map-tab travel to all five hubs; dungeon shortcuts used by story tests)
- [ ] R3.9 10–15h first playthrough target (NOT measured; cannot be measured by automation)

## Intro & creation [4]
- [v] R4.1 30–60s skippable cutscene; skip → same valid state; journal recovers context
- [v] R4.2 Creation: name, pronouns, skin, hairstyle, hair colour, clothing palette, accessories, live sprite preview
- [i] R4.3 Lightweight backgrounds with flavour lines
- [i] R4.4 Interface language, learning assistance, skill profile, optional placement, skip kana tutorial

## Companions [5]
- [v] R5.1 Party is exactly player + one companion; solo before recruitment
- [v] R5.2 Nao, Mio, Ren, Suzu introduced via quests 1–2, each shows approach
- [v] R5.3 Departure room: talk, provisional choose, switch freely; permanence via dialogue
- [v] R5.4 Intentional "Set out with X" interaction; movement cannot commit
- [v] R5.5 Pre-departure recovery point; locked after departure; room can't re-recruit
- [i] R5.6 Unchosen candidates remain in world (cameos in later chapters)
- [i] R5.7 Per companion: banter (4–5 per chapter), personal quest (Suzu co_suzu, Nao lf_nao, Mio lf_mio, Ren ren_ushio), decision reactions, coordinated technique, ending variation

## Exploration [6]
- [v] R6.1 Tile movement with interpolation, collision, facing, doors, interiors, transitions, camera
- [i] R6.2 Keyboard, mouse, touch controls — keyboard movement with both Shift keys (run), release orders, remapped Run, focus loss verified (shift_load_regression.mjs); touch layout (ui.mjs)
- [i] R6.3 Companion follows without blocking/stranding
- [i] R6.4 NPC routines, contextual talk, environment changes
- [i] R6.5 Side activities: inn orders, signposts/maps, letter delivery by context, oral histories/inscriptions

## Combat — Inkweaving [7]
- [v] R7.1 Telegraphed enemy intent → response → written Japanese → visible effect
- [v] R7.2 Not an Attack/Magic/Item menu
- [v] R7.3 Untimed; enemy never acts while drawing/help/IME
- [i] R7.4 One answer coordinates both adventurers; companion techniques
- [i] R7.5 Multiple valid solutions in some encounters
- [i] R7.6 Kana inscriptions for beginners without invented kana meanings
- [i] R7.7 Bosses combine learned ideas, not HP sponges
- [v] R7.8 Recognition uncertainty never damages; capped mistake cost; assist mode no penalty
- [v] R7.9 Defeat → checkpoint, learning kept (systems.mjs, combat result stubbed)

## Input modes [8]
- [i] R8.1 Handwriting, multiple choice, IME; whole game completable without handwriting
- [v] R8.2 Switch mode mid-challenge without losing encounter
- [v] R8.3 Track recognition/recall/handwriting/assisted separately
- [i] R8.4 Plausible distractors; all valid answers accepted

## Handwriting recognition [9]
- [v] R9.1 Pointer capture (strokes, timestamps), DPR scaling, no scroll, cancel/resize safe
- [v] R9.2 46 hiragana + 46 katakana + dakuten/handakuten/small/ー in curriculum
- [v] R9.3 Real templates (KanjiVG, attributed) + multistroke matcher; no rotation/reflection invariance
- [i] R9.4 Small kana size control; diacritics preserved
- [v] R9.5 Composition strip: confirm, go back, replace, remove, insert
- [v] R9.6 Recognition separate from evaluation; candidates, uncertainty, "I read this as…"
- [v] R9.7 Undo stroke, clear, redraw, candidate pick, explicit confirm; reject empty/nonsense
- [i] R9.8 Manual correction = assisted; uncertainty never called a language error
- [i] R9.9 Stroke-order demos from real reference paths; shape vs order feedback separate
- [i] R9.10 Lenient adventure mode; optional practice mode

## Japanese content [10]
- [i] R10.1 Foundations/Elementary/Intermediate/Advanced profiles, independent of combat difficulty
- [i] R10.2 Advanced content genuinely playable (A tiers in every story challenge: nuance, register, implication, paraphrase); not reviewed by a native speaker
- [i] R10.3 Separate mastery: characters, vocab, grammar, comprehension; spaced revisit
- [i] R10.4 Authored content records (display, reading, meaning, accepted answers, tags, explanation, spoken)
- [v] R10.5 Orthography handled carefully; IME composition-safe Enter
- [i] R10.6 Bounded intent system with honest out-of-scope handling

## Furigana & lightbulb [11]
- [v] R11.1 Furigana on every displayed kanji (validator-enforced)
- [v] R11.2 Lightbulb help: hover/focus/tap; reading, romaji, meaning, mora, notes, replay voice
- [v] R11.3 Pin, add to notebook, never cover pad, assisted recording
- [v] R11.5 Help never blocks answering: words inside buttons act on click; help via hover/focus/long press (ui.mjs test)
- [i] R11.4 English-led / Japanese-led / translation visibility; bilingual backlog — Japanese-led mode applied and persisted (settings.mjs)

## Dialogue & quests [12]
- [i] R12.1 Authored, distinct voices; register notes (≈4,900 dialogue lines; not native-reviewed)
- [i] R12.2 Written language for orders/letters/directions/repairs/negotiations
- [i] R12.3 No irreversible punishment for mistakes; journal next steps

## Progression & QoL [13]
- [i] R13.1 Notebook, journal, inventory, equipment, map, settings, history
- [i] R13.2 Few meaningful growth systems; no paid explanations
- [i] R13.3 Retreat (verified: systems.mjs step back; bosses excluded), tutorials revisit (guide tab), no softlocks found by 16 whole-game runs, key items protected
- [i] R13.4 Fast/instant text, skip seen scenes, remap, volumes, reduced motion, text size, contrast — instant text, reduced motion, text size and contrast applied and persisted across reload (settings.mjs); volume/mute (audio.check.mjs); remap and skip-seen not browser-tested

## Saves [14]
- [v] R14.1 Twenty slots (Robin, 10-25, superseding SPECIFICATION §14's six for thorough testing; CC-025):
  new/save/load/copy/overwrite/delete; thumbnail + metadata (as tested: VALIDATION, CC-025)
- [v] R14.9 Load/Continue/autosave/pre-departure show the world (not the title backdrop) and accept input; reload keeps campaigns (shift_load_regression.mjs, http origin and file://)
- [v] R14.2 IndexedDB; manual separate from autosave recovery; pre-departure snapshot
- [v] R14.3 Copy independent; delete removes recovery data
- [v] R14.4 Confirm destructive ops; never silently overwrite
- [i] R14.5 Validation, schema version, atomic writes, errors handled, no clearing on read failure
- [v] R14.6 Cross-tab conflict protection
- [i] R14.7 persist() request with honest explanation
- [v] R14.8 No export/import/cloud/share codes

## Endgame — Unwritten Atlas [15]
- [v] R15.1 Repeatable expeditions with branches, camp (rest or extract early), climax, extraction (atlas.check.mjs; one expedition after the ending in every matrix run; human duration estimated 13–28 min, not measured)
- [v] R15.2 Route modifiers (8), relics (14), objectives solvable at every profile (atlas self-check, 1200 generated runs)
- [v] R15.3 Rewards: charm sidegrades, cosmetics, notebook entries, six settlement details (zz_atlas_decor.js, browser-checked)
- [i] R15.4 Keep companion; NG+/fresh campaign with defined carryover

## Visual [16]
- [i] R16.1 Regional palettes, architecture, portraits, walk animations, ambient motion
- [i] R16.2 Unique NPC silhouettes
- [v] R16.3 Writing pad generous while intent visible
- [i] R16.4 Readable transcription of decorative inscriptions
- [i] R16.5 Resize/orientation/touch; reduced motion; no flashing

## Audio [17]
- [i] R17.1 Procedural music with motifs (road, settlements, mystery, combat, companions, ending) — every song renders without clipping or silence (audio.check.mjs); musical quality not judged
- [v] R17.2 SFX for movement, writing, recognition, spells, discoveries (audio.check.mjs renders every effect; live sfx while running)
- [i] R17.3 Start after gesture; music/sfx/voice volume + mute; ducking — gesture start, volume, mute, crossfade and visibility suspend verified (audio.check.mjs); ducking not separately tested
- [v] R17.4 Optional local ja TTS with honest labelling: only local voices listed, speak() refuses without a local Japanese voice (audio.check.mjs; the test browser has no Japanese voice, so actual speech was not heard)

## Validation [18]
- [v] R18.1 Content validator (exits, spawns, prereqs, dialogue refs, furigana, answers)
- [v] R18.2 Browser tests of the built file for critical paths (ui.mjs 13, story_ch1/3/4/6, side_ch3, atlas.check, explorer per chapter)
- [v] R18.3 Recognizer tests with held-out variants, confusables, nonsense

## Visual overhaul — Wayfarer's Folio (brief of 2026-09-26; docs/ART_DIRECTION.md)
Status as above. `[v]` means a named browser/unit test passed on the stated
commit (VALIDATION.md); screenshots inspected by eye are noted as such.
- [v] V1 Hotfixes (Shift/run never a direction; Load/Continue clears the title override) present in source and build — shift_load_regression.mjs 18/18 in http-origin and file:// modes
- [v] V2 docs/ART_DIRECTION.md records sources actually consulted (blocked sites stated as unverified), principles and decisions
- [v] V3 Pause folio: four paper tabs Journey/Words/Satchel/Map in fixed order; Save & Load and Settings as labelled footer utilities; old section names still open the right place — folio.mjs
- [v] V4 Tab semantics: tablist/tab/tabpanel, roving tabindex, Left/Right/Home/End, automatic activation; focus distinct from selection; Back closes only the top layer; Tab moves focus inside panels — folio.mjs, play_ui.mjs
- [v] V5 Overlap never steals taps; labels never covered or clipped (probes in every tab's visible box) — folio.mjs
- [v] V6 Phone composition: one page, stacked equal tabs; no horizontal overflow and ≥44 px controls at 320/360/390 px and 200 % text; scrollable tab rail with arrows when labels cannot fit — folio.mjs
- [v] V7 Settings in named groups with real radios/switches/sliders; campaign choices shown apart; reading preview from real game text; furigana stays on (no toggle) — settings.mjs (persistence across reload)
- [v] V8 Dialogue: inset paper sheet, speaker tab, one Next ("More" for overflowing lines), separate labelled Word help/Translation/Voice/History/Skip — play_ui.mjs
- [v] V9 Word help: card (wide)/sheet (narrow) with visible Close; tapping a word never advances; a tap-opened card pauses what is underneath; Escape closes it first — play_ui.mjs, ui.mjs
- [v] V10 Replies: a touch scroll over them does not choose one; a tap does — play_ui.mjs
- [v] V11 HUD: exactly one Menu entry; hidden under panels/dialogue — play_ui.mjs
- [v] V12 Touch: sliding move pad, hold-to-Run, context-labelled Action; hidden during dialogue/menus; touch-action none only on canvas and pad — play_ui.mjs, ui.mjs
- [v] V13 Camera never moved by the dialogue (player report 2026-09-27: it pushed small maps up and exposed an empty band); the sheet docks at the top when it would cover the player or the speaker; outdoor maps continue past their edges (tiles, flowing water, scattered edge scenery, gentle fade), walled maps keep their surround — world_view.mjs (fails on the previous build), play_ui.mjs; edges of every small outdoor map inspected on contact sheets. On very short windows (landscape phones) the sheet can still overlap the player when both positions would
- [v] V14 Title screen: original dusk scene from a roadside inn (desk, folio, lantern road, bridge), inked menu with a prominent Continue naming what it continues, initial focus on Continue/New Game (no help card over the title), compact storage line with details (session-only stays prominent), touch or keyboard guidance by feature detection — title_ledger.mjs 13/13; screenshots inspected
- [v] V15 Six-slot travel ledger: numbered records with real thumbnails, player/companion, place (JP+EN), playtime, time; one primary action each; labelled Manage area (copy/delete/overwrite/recovery) with confirmations; empty, unreadable, list-error, full, session-only and read-only (other tab) states — title_ledger.mjs, ui.mjs, shift_load_regression.mjs; states captured and inspected
- [v] V16 Character creation in four steps (Identity, Appearance, Background, Learning setup) with a live traveller sheet (portrait + turnable sprite; compact slip with Inspect on phones), picture tiles for hairstyles/cuts, named swatches with tick/ring + 'Selected:' label, accessory count, all earlier choices kept, no prologue replay on Back, keyboard-aware on phones — create.mjs 382 checks (320–1280 px, 200 % text, resize mid-flow, emulated keyboard)
- [v] V17 Challenge (task slip, plain writing sheet under Write/Choose/Type paper tabs, answer slip), pad with distinct Undo stroke / Clear / candidates / composition / Submit, no texture under strokes, mode switch keeps the task, 'I could not read that clearly' distinct from 'Not quite.' by shape and words, IME field kept above the keyboard, taps that scroll never choose; lessons/orders/letters as folio sheets; combat overlay with foe slip, telegraph card, party slip with target mark and labelled response cards — learning_ui.mjs 13/13, ui.mjs, systems.mjs; screenshots inspected
- [v] V18 Atlas reading sheet, expedition panel and chip in folio materials (no emoji icons) — atlas.check.mjs
- [v] V19 Richer pixel art at 2x art resolution: renderer; ground tiles (24, all regions, real edges); props and buildings (139 props incl. chapter props, STRUCT2 houses/towers); characters (32x48 sprites for every look, 26 creatures, 96-px portraits); battle creatures, battle backdrops and the title scene — all merged. Behaviour covered by the browser suites (results per build in VALIDATION.md); art quality judged by eye from art_shots.mjs and visual.mjs captures of every region (no automated art-quality test)
- [v] V20 Viewport matrix 320x640, 360x800, 390x844, 412x915, 844x390, 768x1024, 1280x720, 1920x1080: layout audit (visual.mjs --check: overflow, clipped text, ≥44 px touch targets, furigana contrast) over 56 states is clean on the final build, 448/448 with English labels and 168/168 with Japanese labels at 320/390/1280; before/after screenshots committed in docs/screenshots/ (index in its README). Real phones not used (emulation)
- [v] V21 Performance measured on the same machine, pre-overhaul 2b79f3b vs final (tests/e2e/perf.mjs, 1280x800 @1x and 390x844 @2x): steady frame work within a few ms of before and far under a 16.7 ms frame; first static build per map about 4x larger (art resolution) and hidden behind the door transition; menu open/close unchanged; no DOM growth — see VALIDATION.md. Phone hardware performance and battery NOT validated (desktop headless only)

## Playtest fixes (player report of 2026-09-28; VALIDATION.md "Playtest fixes"; full suite 24/24 and whole-game matrix 16/16 on bbee0e2)
- [v] P1 Lit lanterns show lit: the opening road's Ashinose lantern and the two Cinder Orchard lanterns Ren promises to relight; validator rule (a dead lantern with a scene needs a lit twin or `staysDark`) — world_fixes.mjs, validate.mjs
- [v] P2 A house with no inside keeps its door shut (solid) and says so; 31 such doors across the game handled by one engine rule — world_fixes.mjs
- [v] P3 Entering a building lands on its entry mat, leaving lands in front of the door (6 spawns fixed; validator rule) — world_fixes.mjs, validate.mjs
- [v] P4 Nobody speaks without being there: the Lantern Hall four are present; any absent speaker walks in and off; voices/memories marked `!speakerless`, voice-only characters `bodiless`, a renamed figure stays put (`was`) — world_fixes.mjs; whole-game runs list every walk-in and bodiless line (reviewed: only the mill echo, kiln warden, Tomoe's memory and the observatory lamp stay bodiless)
- [v] P5 People leaving walk to a door or way out and fade; arriving people walk in — world_fixes.mjs
- [v] P6 Idle life: breathing and glances for people and animals on the road, breathing for the party in battle, wind sway for trees/pines/bushes; none with reduced motion — world_fixes.mjs (rendered moments differ; identical with reduced motion)
- [v] P7 Reedwake's evening: a dusk fade, and the roads out wait for morning with a reason (map hold rule); test runs flag leaving a night-only map during its night — world_fixes.mjs, pursue.mjs
- [v] P8 Route chart: Reedwake east of Saltglass, matching the story ("west, downriver"), signposts and road exits — world_fixes.mjs; all inter-region direction statements reviewed
- [v] P9 Chapter cards: a banner at the top, in from the left, out to the right, ink flourish, lingers, place name waits — world_fixes.mjs
- [v] P10 Play time counts the whole game (it counted walking only) with a five-minute idle stop — world_fixes.mjs; older saved totals unchanged
- [v] P11 Harmony shown apart from HP with what it offers and how it fills; keyword note cards for moves, statuses and wards (Strike one of you / Sweep both); "New" responses with what they answer; Heat +1 per level (cap 2); みず learned before the mill boss; no foe uses a move before its answer can be learned — combat_ui.mjs, unit combat_rules/combat_fairness, story_ch1.mjs
- [v] P12 Boss music faster and heavier (138 bpm, drums, driving bass) — audio.check.mjs (signal level only; nobody has listened to it)
- [v] P13 Handwriting reads kanji: "Kanji or kana" (default from Elementary; a Settings choice), kanji spellings accepted with a note, unknown kanji said plainly — pad_kanji.mjs, unit recog-kanji/lang_answers_kanji; measured accuracy in docs/RECOGNITION.md
- [v] P14 Keepsakes visible on the road, in battle and in portraits; Satchel marks what is worn and tags what each item does — equipment.mjs, unit equip.test.mjs
- [v] P15 Out-of-bounds and dialogue camera (report of 2026-09-27, V13) — world_view.mjs
- [v] P16 Multiple-choice questions never give the answer away by position: the options shown are shuffled (the right one had been written first in 657 of 667 authored questions and every generated meaning question, and was shown first 98.7% of the time); the order holds while a question is open and changes from one asking to the next — unit choice_order (every authored and generated question: right option first 32.4% vs chance 32.3%), combat_ui.mjs in battle (old build: first place 17 of 17; new: all four places)

## Sprite and battle polish (brief of 2026-09-28, amended; VALIDATION.md "Sprite and battle polish"; full default suite 29/29 on ecb584b; layout audit 448/448 + 168/168 and whole-game matrix 16/16 on c113f3a)
- [v] B1 Current implementation established before editing (code review, recorded in docs/ART_DIRECTION.md §8/§10/§11):
  - characters were code-drawn 32×48 art px at 2 art px per logical px, and the battle party was the road's straight-back frame;
  - backdrops were one painter per region key, and battles did not know their place;
  - the fx event list comes from RB.combatLogic.
- [v] B2 People leave for where the story puts them next, not the nearest door:
  - The destination is the map where the person now appears (or an authored npc.leaveTo). The route is the shortest usable chain of map links, with conditions and locks respected; distance only chooses among exits that serve it. Arrivals come from where the person was last seen, or from where the story keeps them.
  - They walk on open ground, set off one after another, and step round the player.
  - (2026-10-03) The world's own comings and goings step round **everyone** standing about, planned that way from the start:
    the player, the companion, villagers, anyone who walked in, anyone walking off, creatures. This covers walking in to
    speak, walking off, and the story moving someone to a new place on the same map. Previously the routes ignored people;
    only you and the companion were noticed, on bumping into them, and villagers were walked through. Someone who steps into
    the way is re-planned round every half second. With no way round, the walker waits up to 2.4 s, then goes on, so no scene
    stalls. Evidence: walk_round.mjs (fails 4 checks on the old code).
  - A map change or save/load duplicates or strands nobody.
  - Evidence: departures.mjs, 14 checks. It includes the real conversation with Tsuru: Nao, Ren and Suzu take the north road although doors were 5–11 steps nearer. Also the evening walk to the Lantern Hall, and Hana into her tea house.
  - Whole-game audit: the E/nao run records every coming and going with its reason (pursue.mjs).
- [v] B3 Encounters follow their place:
  - Every battle knows where it happens. The setting comes from the map.
  - A foe placement may carry its own backdrop and lines. The validator requires them whenever a creature's lines or backdrop don't fit its map.
  - The Flour Moth on the mill road drifts out of the mill, fights by it, and leaves over the roof. Inside the mill it keeps its window line.
  - Seven more placements were fixed: the wheel-pit Reedling, the observatory-path Frost Wisp, two crabs inside the Drowned Archive, the ember and golem on the Old Workshop Row, and the stamp in the Basement Stacks.
  - Evidence: encounters.mjs, backdrops.mjs (a), validate.mjs.
- [v] B4 The Next button after battle:
  - Root cause, reproduced in Chromium with the real DOM order: the battle overlay was appended after the dialogue sheet, which exists from the opening scenes, so its empty Respond dock covered Next. Clicks never arrived; Z did.
  - Fixed: the overlay now sits beneath every layer and takes no pointer input during a line. A press that began before a line or its replies appeared cannot dismiss it.
  - Evidence: encounters.mjs covers the intro and the last line, by mouse and by Z separately, one advance per press, and no click-through from the finishing Continue. battle_anim.mjs covers the finishing line.
- [v] B5 Character standard:
  - Road figures are 40×58 art px (anchor 20,55; an adult is 50 px, about 1.3× a door; one-tile collision), for every look, drawn from one rig: an 8-phase walk, idle and blinks. One-sided details stay on their real side.
  - Battle figures are 80×104 (anchor 36,100) in rear three-quarter view facing up-right, with a pose library.
  - Evidence: characters.mjs covers 10,132 road frames and 645 battle frames, plus depth sorting, and accessories present in every pose. Also equipment.mjs and create.mjs (382).
- [v] B6 A lively, grounded battle stance:
  - Articulated breathing and weight shift with planted feet. Player and companion idle on different loops (5.2 s and 6.0 s; motion correlation 0.32).
  - Calm while choosing and writing. Reduced motion gives a still stance.
  - Evidence: characters.mjs, battle_anim.mjs.
- [v] B7 Location-aware backdrops:
  - Structure comes from the map's real props, buildings and tiles around the encounter, never invented or moved. Nearby context differs by position.
  - Accessories are seeded and themed, placed in free zones, and never touch the creature or party.
  - The layout is stable through turns, hits, states and resizes. The decorative seed never changes battle state.
  - Evidence: backdrops.mjs 61, unit battle_places 555. All 49 placed foes, 5 scripted bosses and an Atlas room were composed.
- [v] B8 Response animations:
  - Each response goes anticipation → gesture → its real word with furigana on paper → effect on the actual target → recovery, from the rules' own events. It plays only after acceptance.
  - Choice, typing and handwriting share one pipeline.
  - Evidence: battle_anim.mjs 16/16, gallery of every response.
- [v] B9 Enemy turns, reactions and states:
  - Every enemy move family has preparation → execution → contact → recovery, in the creature's own motion.
  - Damage, partial absorb, full block, healing and down/revive each have their own reaction.
  - Heat, Shroud, Gathering, Hush, wards and full Harmony each have an application, persistent and removal cue.
  - The rules run once per exchange and the screen ends equal to them.
  - Evidence: battle_anim.mjs; the gallery of every move.
- [v] B10 Learning stays central:
  - No time pressure, focus stealing or auto-advance. Nothing is drawn over the prompt, pad or cards.
  - The screen shake and full-screen Heat tint were removed.
  - Reduced motion keeps word, target and outcome. Hurry, a hidden tab, resizing and consecutive encounters were tested.
  - Evidence: battle_anim.mjs, learning_ui.mjs, pad_kanji.mjs.
- [v] B11 Multiple enemies and Harmony were investigated first (docs/COMBAT_NOTES.md). Groups of creatures were then built (E1–E12 below); Harmony charges remain undecided.
- [v] B13 One person, one figure (player report of 2026-09-29):
  - The bug: after the Mill, Tsuru walked off while a second Tsuru walked in to continue the scene.
  - Speakers are now found by person, not placement id.
  - Someone walking away who is given a line turns back.
  - A person whose place on the map changes, or a walked-in speaker who gets a place, walks there as the same figure.
  - A scene's line waits up to 3 s for its speaker to arrive.
  - Tsuru stays in the square until evening falls, then walks to the Lantern Hall.
  - Evidence: departures.mjs sections 5–6 replay the real bridge scene (Tsuru present once for every line, then heading for the Hall door) and a same-person move. Whole-game runs fail if anyone is drawn twice (pursue.mjs, RB.test.twice).
- [v] B14 The side view no longer has a floating lip: the mouth sits on the face edge and the nose tip is joined. Evidence: characters.mjs, plus review sheets inspected by eye.
- [v] B15 The Satchel shows Front, Side, Back, In battle and Portrait. Evidence: equipment.mjs checks the five views in order; the Satchel was inspected at 1064×783 and 390×844.
- [v] B16 (Before E1–E12, 2026-09-29.) No battle had more than one enemy at once, confirmed from the code:
  - There are 7 scripted battles (the Hush appears twice only as the same boss's retry path).
  - There are 49 placed foes, each fought one at a time.
  - An Atlas room may hold a guard and a roaming foe, but each is its own one-on-one battle. Some single creatures are drawn as a group (moths circling a lamp, a doubled voice).
- [b] B12 Blocked on people or hardware; not verified: Firefox and Safari. Your report came from Firefox, and the Next-button fix was reproduced and verified in Chromium only. Also unverified: real phones, touch hardware, frame rate on phones, and a human judgement of the new art and motion.

## Title screen (player report of 2026-09-29; VALIDATION.md "Title screen")
- [v] T1 The view reads as the open doorway of a roadside inn at dusk, not a window:
  - sliding paper doors pushed open at each side (lit warm by the desk lamp on the left, cool by the moon on the right);
  - a short indigo noren under the lintel with a lantern crest (only where the title sits beside the folio, so it never crosses the title);
  - a threshold sill with the doors' grooves; the rolled blind that read as a window is gone.
- [v] T2 The folio lies closed and flat on the desk top, drawn in the desk's perspective: the top face of the desk is visible, and the book shows a foreshortened cover, a page block, the binding at the near edge, a blank title slip and a ribbon over the edge.
- [v] T3 Nothing moving crosses the bridge:
  - The water glints keep clear of the bridge and its arch, with margin for their drift.
  - The bridge lantern's reflection was drawn about 30 px too high, over the arch and the centre pier. It now sits in the water below the bridge's own reflection.
- [v] T4 The night sky is alive:
  - Each star twinkles on its own beat, the bright ones catch a four-point sparkle at their peak, and now and then one flares.
  - A shooting star crosses every 7–19 s; rarely (every 70–140 s) a slow comet drifts across.
  - Stars appear only in open sky: never behind the title's words, the moon or the ridges.
  - With reduced motion the stars hold still and nothing streaks.
- [v] T5 The scene follows the page layout. The moon and noren keep clear of the title and the folio in every layout (title beside the folio, the same on a short landscape screen, or centred), and the title clears the open door.
- Evidence:
  - `title_ledger.mjs` "title scene" at 1280×800, 900×1000, 390×844 and 844×390, and "title sky".
  - Captures inspected at 1280×800, 900×1000, 900×865, 390×844, 844×390 and 667×375, with bridge close-ups before and after.

- [v] T6 The credit "Project Development: Robin Amaral" (Robin's request, 2026-10-06): first on the title's About &
  credits page, and under the closing line of the story's end card (same card, same flow and timing). Evidence: U
  27,245/0; captures at 1920×1080 and 390×844 (VALIDATION.md "Checks on the approved art").

## Prologue (owner's report of 2026-10-03; VALIDATION.md "Prologue round"; docs/ART_DIRECTION.md §12)
- [v] PR1 The traveller walks the road, not into the river:
  - The walk starts on the road just above the caption slip and follows the road's centre line toward the horizon at a steady pace.
  - The figure shrinks with distance (31 → about 11 art px on a desktop and a phone), shrunk onto the same pixel grid from the real walk frames.
  - The title scene's pixel under the feet is road at every moment at 1920×1080, 1280×800, 390×844 and 844×390. The old path was off the road at 16–17 of 21 moments on the desktop and landscape screens, and hidden by the slip on the upright phone.
  - With reduced motion the traveller stands still.
  - Evidence: B prologue.
- [v] PR2 The teahouse (twice), the riverbank lantern and the bridge are redrawn at art resolution in the title scene's manner (banded skies, hue-shifted ramps, selective outlines, stepped glows). Hana is her own portrait. Each composition keeps what matters above the caption slip, from 320×568 to 2000×1090. Evidence: B prologue (every shot, moving and still, four screen shapes); docs/screenshots/prologue/ (before and after).
- [v] PR3 The lantern's name leaves it stroke by stroke and the lamp dims. The name is abstract cursive marks, not letters, so no kanji is drawn. Evidence: B prologue (ink pixels 139 → 70 → 0 at 1920×1080).
- [v] PR4 The flow is unchanged: Next, Skip, Escape, the captions and their timing. The shots' caches are released when the prologue ends. Evidence: B prologue, create (382), ui, layout audit of create_prologue and title.
- [b] PR5 Not verified: Firefox (the owner's browser), the foldable, a person's judgement of the art.

## Town animals (owner's reports of 2026-10-03; VALIDATION.md "Town animals"; docs/addendum/pets.md "World")
- [v] TA1 At rest, an animal keeps moving as the people do:
  - It breathes on their settle-and-rise beat, and its tail keeps going (the cat's swish, the dog's wag, the tanuki's sway, the bird's flick).
  - This applies to your pet in every species and posture, to the reed-screen cat before you meet it, and to Mochi.
  - The frames repeat from the cache (4–9 new frames in a further 4 s of one posture).
  - Nothing is added with reduced motion.
  - Evidence: B town_animals.
- [v] TA2 Mochi is drawn with the same cat rig as the other cats (white, a red collar) instead of her old hand-drawn sprite, curled up where the scenes find her. Evidence: B town_animals.
- [v] TA3 Picking Mochi up, she is gone where she was. Before, she walked off to the nearest door, Kōji's house, because she had no destination while carried. Given back, she appears beside Tomo rather than out of a door. The mechanism is the npc options `leave: 'here'` and `arrive: 'here'`. Evidence: B town_animals (a real key press; on the previous build the departure went to 45,15 and the arrival came out of 11,24), departures.
- [v] TA4 Her line at home follows the hour: stretched out in the sun by day, curled up at Tomo's feet at night (it said "in the sun" at night). Evidence: B town_animals.
- [b] TA5 Not verified: Firefox, the foldable, a person's look at the animals.
- [v] TA6 (owner's report, same day) Hama's workbench and the call bell on the Saltglass quay, and the five other case props from the first art pass, are redrawn at art resolution in the world's prop style (docs/addendum/cases.md "The props, at art resolution"). Evidence: docs/screenshots/cases_props/ (before and after), B cases, cases_shots, known (see VALIDATION.md "Town animals"). The look is a self-review.

## Lines in the dark and the tide-watcher's window (owner's reports of 2026-10-03; VALIDATION.md "Interludes"; docs/ART_DIRECTION.md §13)
- [v] IN1 A line said while a scene has the screen faded to black is shown above the black: the dialogue sheet is on top at its own centre, its Next button takes a real click, History opens on top, and nothing stays raised once the screen has cleared. It is done in the fade itself, so it applies to every scene that speaks in the dark (nine of them, found by code review; the browser test uses a synthetic scene). Before, the lines could be advanced with Z but not seen. Evidence: B interludes (1280×800, 390×844).
- [v] IN2 Choosing to wait with Shiori shows the wait as a picture drawn at art resolution: the view from her window, with the tide going out over the lines. The sand road comes up from both ends, then all of it when she says it is time, and the fog gathers on the road and only there. Then the room again, with the quest moving on as before. The island, the road and the lighthouse stay above the dialogue sheet at 2000×1090, 1280×800, 390×844 and 844×390. Each stage is one still picture with reduced motion. Evidence: B interludes; docs/screenshots/interludes/.
- [v] IN3 `!interlude <id> [stage]` / `!interlude -` (validated op): a picture in place of the map while a scene's lines go on. It is cleared when its scene ends, and its caches are dropped. A frame costs about 1 ms after the first. Evidence: B interludes.
- [b] IN4 Not verified: Firefox (the owner's browser), the foldable, a person's judgement of the picture. The other dark passages are readable but are not pictures.

## Suzu's Kansai-ben (owner's requests of 2026-10-03; VALIDATION.md "Suzu's Kansai-ben"; docs/dialect/suzu_kansai.md)
- [v] KS1 Every line of Suzu's has a Kansai version in Japanese and in re-voiced English: 896 lines (872 distinct) from scenes, Company, field and case reactions, shiritori, fishing, pet meetings, The Pages We Keep and the Atlas. An inventory built three ways (tracing scenes, her data tables, a source scan) is enforced by the validator and a unit test: a line without a version, a kanji without furigana, an unexplained word, mismatched placeholders or a caricature form (さかい, まんねん, でんがな, でっせ/まっせ, わて, おおきに) fails. Evidence: U dialect_kansai; validator.
- [v] KS2 The choice is offered when she joins, in Settings › Reading & Language, and on her Company page under "Talk with Suzu" (a radio group, plus an in-world ask with a reply). All three are the same setting and switch back at any time. A loaded save with Suzu and no choice is offered it once. Evidence: B dialect_kansai (pointer, keyboard, a phone at 390×844), settings, company.
- [v] KS3 Shown, not stored: `settings.suzuSpeech` is an optional key in the global settings record (absent means standard). There is no save-schema change; history, memories and kept sentences keep the standard line. Evidence: B dialect_kansai (the campaign and the saved slot unchanged).
- [v] KS4 Learning: word help reads her Kansai lines with a separate Kansai lexicon first and notes the standard form. Standard vocabulary practice never sees it; a noted Kansai word is marked and skipped by the writing desk, the shiritori pool and "kanji met". Challenges, answers, recognition and the story are unchanged. Evidence: B dialect_kansai, U dialect_kansai.
- [b] KS5 Not verified: a native Kansai speaker's review (priorities in docs/dialect/suzu_kansai.md); the device voice reads her lines with a standard accent; Firefox; the foldable.

## One battle at a time (owner's reports of 2026-10-03; VALIDATION.md "Battles one at a time")
- [v] BO1 A battle never starts while another is open or still closing. Before, a creature still touching you during the closing fade started a second battle. The first battle's teardown then broke it: a battle screen over a frozen map, the beaten crab "defeated again", and a black screen after a resize or a same-page load. Evidence: B battle_overlap (66 of 96 checks fail on 12a9757; 96/96 on 6fa0f72).
- [v] BO2 Creatures engage only in free exploration, never during a scene, menu, transition, battle or its closing, and not for 1 s after a battle. Contact is checked against the current mode, so a tap on a creature, a sign beside it or a way out beside it starts at most one thing. Evidence: B battle_overlap.
- [v] BO3 While the closing screen is dark, a beaten creature is gone. One you stepped back from (or lost to) backs off a tile and stays calm for 5 s and for as long as you touch it. Scenes ending no longer put creatures back on their starting tiles. Evidence: B battle_overlap, encounters, world_fixes, town_animals.
- [v] BO4 The frame loop survives an error in any part of a frame (logged, rate-limited), and a campaign change removes any orphaned battle overlay. Evidence: B battle_overlap (an injected draw error; a same-page save and load).
- [b] BO5 Not verified: Firefox (the owner's browser), where the black screen was seen; the whole-game drivers' timing with the new 1 s pause.

## Quick travel rules (owner's report of 2026-10-03; VALIDATION.md "Quick travel rules"; docs/CONTENT.md "Quick travel: where it works")
- [v] QT1 Quick travel works from anywhere out in the open when nothing is under way. Five open-air maps that wrongly blocked it are open, including the Fishers' Cove. Evidence: B travel_rules (0/10 before, 10/10 after), systems.
- [v] QT2 Where travel is unavailable, the Travel list says why in the place's own terms and where the way out leads: a building, a dungeon, a story-locked map or the Atlas. Every map is classified, and the validator rejects an unclassified one. Evidence: B travel_rules, U travel_rules.
- [v] QT3 No travel over a conversation: the folio opened from History during a scene showed Travel and could leave the scene running in another town. Evidence: B travel_rules.
- [b] QT4 Not verified: the Atlas message in a browser; Firefox; a real phone. The open-air dungeon approaches (Upper Terraces, Old Workshop Row, Star Stair) are open by the "out in the open" rule, pending the owner's view.

## Zone music (owner's requests of 2026-10-03; VALIDATION.md "Zone music"; docs/AUDIO.md)
- [v] ZM1 Every chapter after Reedwake has its own route, town and dungeon music, battle and boss themes, and cues for key scenes. All are synthesised in code with Japanese voices (shamisen, biwa, koto, shakuhachi, shinobue, shō, rin, taiko family). Reedwake's music is unchanged (identical events). No map outside Chapter 1 plays Chapter 1's road theme. Evidence: U audio_songs, audio_zones; B audio_instruments, audio_zones, audio.check.
- [v] ZM2 Intensity rises chapter by chapter without becoming epic: the battle themes' score, tempo, density and percussion weight rise strictly, and each chapter's battle theme sits below its boss theme. Loudness and peaks stay within Chapter 1's range. Evidence: U audio_zones (the intensity metric), B audio.check (loudness).
- [b] ZM3 Not verified: CPU on a phone; Firefox. Listening: the owner heard Saltglass, the coast road and the Saltglass battle theme (2026-10-04) and found a harsh "crashing wave" layer. The shakuhachi breath, the reverb's low tail, the ōdaiko rumble and the sawari's low smear were reduced (VALIDATION.md "The owner's notes of 2026-10-04"; A spectrograms, renderOffline before/after; B audio_suite --quick 3/3). A second listen the same day found the shakuhachi's breath still a hissing puff, the town's flute a little loud, and a harsh "droning drum" in the town. Round 2: the shakuhachi is played clean; the shinobue's breath is at the flute's level; the sawari clipper is per string; the town is rebalanced; the Archive's shakuhachi pass is an octave lower (VALIDATION.md "The owner's second listen"). The owner called round 2 "a marked improvement - 10/10" (2026-10-04); other zones' music is still to be heard by the owner.

## The top of the lighthouse and the view from height (owner's reports of 2026-10-03; VALIDATION.md "The top of the lighthouse, and the view from height")
- [v] LH1 Genzō's vane scene climbs to its own map, the top of the lighthouse (gallery, lamp room, vane, stairhead, railing). Genzō climbs with you and is never in two places, and the stairs lead up after the scene. Evidence: B lighthouse_top.
- [v] LH2 Elevated outdoor places show the height: the real ground map drawn small below (the town, its sea, the causeway fog until it lifts), the tower or timber legs dropping away, haze and a slight drift. This applies to the lighthouse top and the Chapter 3 lookout. Evidence: B lighthouse_top (landmark colours at projected positions, the shaft, the lanterns at night).
- [b] LH3 Not verified: Firefox, a real phone, a person's judgement of the art. The town below may want more haze to read as farther away.

## Settings in battle (owner's request of 2026-10-03; VALIDATION.md "Settings in battle"; docs/COMBAT_NOTES.md "Settings in battle")
- [v] BS1 A Settings button in battle (and the menu key) opens a battle sheet with speed and motion, audio, reading, display and battle display. Rule and learning settings are listed read-only. The encounter pauses while it is open and resumes where it stood. Opening and closing it ten times changes no rule state, card or Harmony. Evidence: B battle_settings.
- [v] BS2 No saving while a battle is live, by any route (folio, ledger, a scene's autosave, activities, timers). Evidence: B battle_settings ("saves"); the unfixed build wrote both manual saves and autosaves mid-battle.
- [v] BS3 No escape from a boss through the menu. Load from mid-boss restores the pre-fight save with the boss intact. Return to title then Continue leaves no battle behind. A cancelled or failed load returns you to the map with the creature still there. Evidence: B battle_settings ("boss", "saves").
- [b] BS4 Not verified: Firefox; the "slot open in another tab, then Cancel" path (only the unreadable-slot path ran); on a phone with Expanded intents the Settings button covers part of the creature (seen in a capture, not changed).

## Harmony busts, painted (owner's review of 2026-10-03; docs/harmony/ASSET_BRIEF.md)
- [v] HB1 Painted busts, approved by the owner on 2026-10-06 ("The new Harmony pass I would consider finished"), at **approved visual direction**: the four companions' seven-state cut-ins and the player's complete kit, drawn in code in this project from measurements of the owner's reference sheets (never their pixels), after the owner's review rounds (hands, timing, motion and in-betweens, neck and shoulder junction). Source: art/harmony/source/full_v1/ (with PROVENANCE.md); the game's copy: assets/harmony/. The code-drawn busts (docs/harmony/ART.md) stay as the fallback when a file is missing.
- [v] HB2 Imported (2026-10-06): `node tools/harmony_import.mjs art/harmony/source/full_v1 --replace` writes assets/harmony/ (245 files with masks, every required key 86/86, batches 1a and 1b complete, approval approved for the kit and each companion; regenerating it gives the same bytes); the build embeds it (446 PNGs, 1.8 MiB embedded; index.html 12.7 MiB). Recolour, the seven-state timeline and the in-betweens run on the shipped art. Evidence: U (whole suite) and B harmony_raster (the shipped game installs the approved art by itself and paints look A with every companion; no network) and harmony_cutin; VALIDATION.md "The approved Harmony art, imported".
- [v] HB3 Contract v2 (docs/harmony/contract/CONTRACT.md, `RB.harmonyContract` in src/ui/88_harmony_contract.js): 192 × 160 bust canvas, 352 × 160 pair, per-side anchors, six one-off states and their timeline, file names, layer slots with pose-dependent occlusion, accessories, masks, key ramps, thresholds, manifest schema. Evidence: unit harmony_raster (timeline, schema, registry coverage); code review.
- [v] HB4 Registry export `tools/harmony_registry.mjs` → docs/harmony/contract/registry.json (sorted keys; source identity; resolver; hairstyles; cuts; creation accessories and limit; 15 keepsakes with layer and side from a pixel diff; 15 statistical items as not drawn; palettes; material channels; companions with technique names; 86 required + 33 optional asset keys; unresolved items named). Evidence: unit harmony_raster ("every registry entry maps to asset keys or is declared not visible"; keys recomputed in node equal the export).
- [v] HB5 Importer `tools/harmony_import.mjs` (no dependencies; PNG codec on node:zlib): grid detection for whole and fractional enlargements, cell-centre majority, binary alpha, magenta keying, checkerboard and interlace refusals, derived or supplied masks with refusal on unresolved pixels, offset suggestions, manifest, JSON report and contact sheet; `--check`, `--verify`. Evidence: unit harmony_png 26/26, harmony_import 51/51.
- [v] HB6 Runtime raster path (src/ui/88_harmony_raster.js + hooks in 88_harmony_art.js): asynchronous decode of only what a pairing and look need, recolouring from the look's own material ramps, contract layer order with group and attachment offsets and hat bands, whole-bust code fallback recorded in `stats().raster`, LRU caches keyed by art and contract versions, look, companion, state and variant; `PHASES`/`timeline(comp)` only while painted art is installed; with nothing installed the code-drawn path is pixel-identical. Evidence: unit harmony_raster 63/63; B harmony_raster 21/21; B harmony_art 39/39 unchanged; section comparison of the asset-free build.
- [v] HB7 Build embedding: `tools/build.mjs` embeds assets/harmony/ (manifest and listed PNGs, base64) when present and prints the size; without it nothing is added. Evidence: B harmony_raster (embedded build installs itself, no network); the asset-free build is byte-identical with or without `--harmony`.
- [v] HB8 A working SYNTHETIC sample (tests/fixtures/harmony_sample/, from tools/harmony_sample.mjs; not art): Suzu in five states plus an effect file, a player kit for ponytail + coat + glasses + flower and curly + robe (wide sleeve) + scarf + satchel, 1×, 3× (magenta), 4× and 5.333× files, derived and supplied masks; budgets measured (CONTRACT.md §10); evidence in docs/screenshots/harmony/raster_sample/. Evidence: unit harmony_import, harmony_raster; B harmony_raster --sheets.
- [v] HB9 Contract v3 for the correction (merged 2026-10-03; docs/harmony/contract/CONTRACT.md v3, V3_REPORT.md):
  - value-preserving recolour: key colour families with free values; OKLab key curves; residual kept; a value floor so
    every target ramp keeps neighbouring values ≥ ΔE 0.022 apart. Exact v2 shades are bit-for-bit on 48 of 63 ramps; 15
    collapsed ramps are opened.
  - fitting on the visible footprint: 2048 × 1046 and 1680 × 1050 now 2× (were 1×), 2560 × 1440 3×.
  - reduced motion: `peak` held, a 100 ms cross-fade, then `settle_b` held.
  - approved source art under art/harmony/source/ with byte-for-byte regeneration.
  - Batches 1a and 1b in the registry; approval labels in the manifest and the dev viewer.
  - the checkerboard detector hardened.
  - Evidence: SYNTHETIC fixtures only. See VALIDATION.md "Harmony contract v3" for the runs; real art is not verified.
- [v] HB10 The portrait's timing, Robin's decision (2026-10-05; VALIDATION.md "Harmony portrait timing — Robin's decision
  (2026-10-05)"; docs/harmony/contract/CONTRACT.md §4):
  - Normal plays the proposed performance: in 220 / hold 820 / fade 360 ms (1,400), with a small motion (a 3 art px
    overshoot at the end of the slide, back by 140 ms; a 2.5 px lean 50 ms after the peak lands; a 1.5 px drift through
    the fade), in whole CSS px. Fast plays Normal's former timing, 180 / 380 / 220 ms of wall time (257 / 543 / 315
    presentation ms), no motion. Instant and the setting Off: no portrait, no cue. Hurry and Skip as before.
  - The stage waits for the portrait: when it can play, every other cue of the technique starts `max(0, portrait end +
    120 − contact)` later (Normal: Nao 220, Mio 270, Ren 320, Suzu 240 ms; Fast: Ren 35, the others 0); both performers
    stand in their ready stance through the wait; a slip still comes first. Totals: Normal 2.57–2.69 s, Fast 1.63–1.71 s
    of wall time.
  - Placement keeps the motion's reach 12 px clear (3 art px right, 4 left); a late start after the withdrawn menus
    shortens the hold so the portrait is still gone before the first result.
  - A seventh, optional state `cue_b` (between cue and peak): a timeline per playback mode; a six-state set holds cue
    through its span; the importer and the registry accept `<comp>_cue_b` (86 required + 37 optional asset keys).
  - Evidence: U harmony_timing, harmony_raster, harmony_import (and the full unit suite); B harmony_cutin 11/11,
    harmony_raster 26/0, battle_invariance (technique fixtures and the full matrix), harmony_perf_sheets --check (Nao,
    Mio). No painted art was imported: the seven-state path is checked on the synthetic sample and stubs only.
- [v] HB11 Hats and caps hide the hair above their own top edge, in the columns they cover; hair beside them is kept,
  and the edge hidden hair leaves over background closes with the outline ink (lead's change of 2026-10-05, after the
  full kit's proof showed the band-row rule cutting twintails and wide styles flat). `pc.hatBand` stays the
  scalp-cover line. Evidence: U harmony_raster (the stand-in hat block; whole suite 27,234/0), B harmony_raster 26/0, harmony_cutin 11/0; VALIDATION.md "Hats
  hide hair above their own top edge".
- [v] HB12 A front-only hairstyle (shaved) may bring an optional back file, drawn under the torso and head like any
  back (its nape behind the neck: the gap between neck and collar the head cannot close without changing look A).
  Registry 86 required + 38 optional. Evidence: U harmony_raster (plans with and without it), B harmony_raster
  26/0; VALIDATION.md "The shaved style may bring a back file".
- [v] HB13 The player's kit moves as the companions do (Robin's review, 2026-10-05: "missing frames, acting a little
  more stiff compared to Suzu"; settle_b was settle_a). Contract and runtime: optional in-between heads, arms per pairing
  and hair per moving state, each falling back to today's drawing — done (U harmony_raster, B harmony_raster 26/0;
  VALIDATION.md "The player's in-betweens"). The art is drawn and, since 2026-10-06, approved and imported (HB1, HB2): 3 in-between heads, 16
  in-between arms, 110 hair-motion files, a body arc; with Robin's neck review (neck and collarbone anatomy redone, nape
  patches removed, cape over the dress, hair rim in the hair ramp) and Ren's peak arm redrawn. The kit proof: 245 files,
  2,681 busts, 0 errors, 1 major flag (look A's own 3-px speck).
- [v] HB14 The game with the approved art in (2026-10-06), checked by Robin's clarified testing cadence:
  - B campaigns: Foundations with each companion, 4/4 through Chapters 1–6 and the Atlas.
  - B layout audit: 535/536 and 201/201. The one finding was the sequence buttons at 40 px on landscape phones,
    present from before the import; now 44 px.
  - B staging_chapters 13,850/0; B the first half of the default suite; B save loading 18/18 in both modes; B the art
    from a `file://` page.
  - B battle_party 14/0, battle_anim 16/0, harmony_cutin 11/0.
  - Ren's Lantern Ward now leads your brush by 100 ms (Robin's decision; it had started 20 ms after).
  - Evidence: VALIDATION.md "Checks on the approved art". Not run, with the reasons recorded there: the E, I and A
    campaigns and the rest of the default suite's second half.
- [v] HB15 The cut-in in groups, and its cost, on the approved art (2026-10-06; HX59, HX70):
  - **Placement:** where nothing fits against the left edge, the pair slides past it (faces kept ≥ 8 px in view).
    Then, if needed, up to 16 art px of its top rows pass the top edge (faces whole), the least of it cut off first.
    It shows again with groups at 2048×1046, 1920×1080, 1648×840 and 1536×864; smaller windows still leave it out
    with the fallback recorded.
  - **Cost:** the cut-in's start in a group fell from 360–820 ms to 12–21 ms (caches 24/32, the bare compact pair
    prepared, an interval search equal to the old one over 1,430,352 positions).
  - B: harmony_cutin 12/0, budget 1/0, F/Ren 1/1. Evidence: VALIDATION.md "HX59, HX66, HX67 and HX70 on the approved
    art"; HARMONY.md §7.2; CONTRACT.md §10.

## Quest guidance (owner's question of 2026-09-29: hints in the ledger, map markers; VALIDATION.md "Quest guidance")
- [v] G1 Where each quest's next step happens is derived from the content (src/engine/56_questguide.js): the scenes that move the quest on, walked the way the runner would against the current state, and the people, props, triggers, arrivals and foes that run them; a person who appears only later is not targeted; places you cannot reach yet are not preferred; what a blocked step waits for is followed two levels deep; more than six places marks none. Optional per-stage `hint` and `at` (validated). Evidence: tests/unit/quest_guide.test.mjs lists every stage of every quest — 116 derived, 1 authored (`rw_depart` 1), 4 set and passed within one scene, 0 missing — and checks live analysis on real states in every chapter; quest_guide.mjs checks it in the browser.
- [v] G2 Journey: the objective stays first; "Need a nudge?" reveals up to three nudges one at a time (where and who; the authored hint or what to do there and which way; "Show on the map"), bilingual with furigana, generated from names, using words in the lexicon (465 generated lines checked); asking records nothing. Follow one quest at a time (the main road by default); the followed quest is first and marked; the text equivalent of the markers ("Next: Suzu, in Reedwake — south-west of you"). Evidence: quest_guide.mjs, quest_guide.test.mjs.
- [v] G3 Markers (src/engine/62_questmarks.js): an amber diamond above the target person or thing on this map, distinct from the ▾; an edge pointer when it is off-screen; an arrow over the way out toward another map (none when there is no way); the route chart marks the place and keeps "you are here". Hidden in dialogue, scenes, menus and battles; gentle bob, still with reduced motion; edge pointers clear of the HUD and touch controls. Evidence: quest_guide.mjs (positions from the renderer, pixels for the bob), screenshots in docs/screenshots/quest_guide/.
- [v] G4 Settings › Quest guidance: Markers and hints (default) / Hints only / Off; defaults when absent. The followed quest is the optional `s.follow` (absent in old saves: the main road); the save schema and its validation are unchanged. Evidence: quest_guide.test.mjs (old save validates, loads and follows the main road), quest_guide.mjs (the three modes through Settings).
- [v] G5 Accessibility: keyboard focus kept on Follow and on the nudge button; nudges announced (aria-live); guidance buttons ≥ 44 px on a phone; no sideways overflow at 320×640 with 200 % text; Japanese interface labels with furigana. Evidence: quest_guide.mjs; layout audit (visual.mjs --check) of journey, journey_guide, map, settings, settings_guide at 320×640, 390×844, 1280×720, and with Japanese labels at 390×844.
- [b] G6 Not verified by people: whether the markers make the game too easy or help the right amount; real phones; Firefox and Safari.

## Long quest lines (owner's request of 2026-09-29; VALIDATION.md "Long quest lines"; docs/STORY.md "Long roads")
- [v] L1 Two quest lines that begin in Chapter 1 and advance over later chapters for players who pay attention:
  - "A Fare Thirty Years Owed" (`lq_fare`, 6 stages): Reedwake, Saltglass, Cinder Orchard, the Snowbell road, then back to Reedwake and Saltglass.
  - "The Name Nobody Calls" (`lq_road`, 8 stages): Reedwake, Saltglass, Cinder Orchard, back to Reedwake, the side area Koharuno, Lanternfall, then Koharuno again.
- [v] L2 Backtracking with old characters in new roles:
  - Kōji's late mother's fare book; Tamae recognising her mother's seal; Fusa and Grandma Ume; Tetsu's father's boat; Old Yasu remembering his hamlet.
  - New characters visit old places: Chigusa pays the fare in Hana's teahouse and returns the seal at the Gull; Kayo goes home to Koharuno.
- [v] L3 A side area that unlocks: once the hamlet's name is written on the blank lantern, the path past the ferry house leads to Koharuno (`lq.koharu`, `lq.koharu_hut`).
- [v] L4 The companion's battle upgrades come from story beats:
  - `lq_ally1` is set when Chigusa decides; the companion says they'll act without waiting.
  - `lq_ally2` is set when both names go on the Koharuno lantern; the companion says they'll stand with you.
  - Each has a line for every companion. Rewards: two charms and a cosmetic cloth.
- [v] L5 No one is locked out:
  - Neither line gates the story.
  - "Letters from home" start any line not yet begun in the first town after Chapter 2; Kōji, the lantern and Tetsu start them at any time, including after the ending.
  - Old saves load unchanged: only new flags, quests and items were added.
- [v] L6 The quest guidance covers both lines: every stage has an authored `hint` and `at`, and the persimmon tree and the Koharuno maps are named for the markers and the chart.
- [b] L7 Not verified by people: a native speaker's review of the new Japanese, and whether the pacing across chapters feels right.

## Groups of creatures, the companion's turn, the difficulty curve (lead's brief of 2026-09-29; docs/COMBAT_NOTES.md; VALIDATION.md "Groups of creatures")
- [v] E1 The setting decides how many creatures come: Relaxed 1, Standard up to 2, Demanding up to 3, at the group placements of the last chapter's final stretch (`sa.stacks`, `sa.conduits`) and in the Atlas (rooms and the guardian's attendants).
  - Evidence: battle_group.mjs §1 (the Stacks, the Conduits, a seeded Atlas room and the guardian at all three settings); unit combat_fairness and combat_curve (every placement at every setting); validate.mjs checks the group ids and sizes.
- [v] E2 Targeting: a click or tap on the creature or its slip, the arrow keys on the slips, `[` and `]`; one clear target (a bracket at its feet and a marked slip); a sensible default (the most threatening) that is remembered; screen-reader labels and announcements. Evidence: battle_group.mjs §2 (mouse, keyboard with visible focus, touch at 390×844).
- [v] E3 Previews on every creature and ally a response reaches (hover and keyboard focus), kept through its step, cleared on "Choose a different response"; group responses from existing words (water, wind) explained in the keyword help. Evidence: battle_group.mjs §3; unit combat_rules (reach).
- [v] E4 Each creature telegraphs and acts in turn, settles on its own, and the encounter is won after the last; every result applied once, and the screen ends equal to the rules; the placement's flag is set once. Evidence: battle_group.mjs §4 (a Demanding trio of moths played out by mouse); unit combat_rules.
- [v] E5 Techniques with group effects (Suzu's Curtain Call turns every creature's move back), single-creature numbers unchanged. Evidence: unit combat_rules.
- [v] E6 Small screens, 200 % text, reduced motion and the Next button after a group battle. Evidence: battle_group.mjs §5 (320×640, 320×640 at 200 %, 1280×800 reduced motion, 844×390): nothing runs off the side, slips ≥ 44 px and not stretched, still marks, Next on top. Limit: a 320×640 portrait stage keeps its 60 px minimum (as with one creature).
- [v] E7 The companion's turn: after the response's step succeeds it is queued; the companion's support menu (no language step); "Back to <you>" (click or Escape) with nothing lost; then response → companion → creatures. Evidence: companion_turn.mjs §1 (the rules' calls and state checked before and after); §4 plays the late-alliance actions on screen.
- [v] E8 Companion actions are data (`C.companionActions`) and follow the story: first at recruitment, then `ch2_done`, the personal quest, `lq_ally1`, `lq_ally2`; a new one is announced once; the late-alliance actions keep the scenes' promises. Evidence: companion_turn.mjs §2; unit combat_rules (effects, uses, the late-alliance actions).
- [v] E9 Companion actions preview whom they act on and can be aimed at another creature without changing yours. Evidence: companion_turn.mjs §3.
- [v] E10 Companions support; the technique stays their one strong act; old passives folded into actions without counting twice. Evidence: unit combat_rules (no passive draught/opening/lamp/laugh), combat_curve (rounds with a companion ≥ 70 % of rounds alone; the whole arsenal ≥ 85 % of the first action).
- [v] E11 The difficulty curve reviewed per chapter and setting and recorded (docs/COMBAT_NOTES.md): nothing lost or stalled; Relaxed single and gentle; groups a step up, never a spike; battle resolve 14/12/10. Evidence: unit combat_curve (bounds, and the table it prints).
- [v] E12 The auto solver (`RB.test.battle`, the whole-game driver) plays groups honestly with the real rules and companion actions (`RB.combatSim`). Evidence: unit combat_curve (the solver against every story group, every setting, every companion); pursue.mjs E nao (one Atlas group met and won) and matrix.mjs FA nao,suzu 2 (4/4) — see VALIDATION.md.

## Every kanji on the pad, and the chart (owner's brief of 2026-09-29; VALIDATION.md "Every kanji on the pad"; docs/RECOGNITION.md)
- [v] K1 Every kanji the game displays can be written on the pad: 1,547 derived from the source (tools/kanjivg/gamekanji.mjs) plus the first 33 = 1,548 kanji from KanjiVG; a unit test fails when new text brings one without data. Evidence: U recog-coverage (coverage, no stale data, every clean reference read as itself).
- [v] K2 守 (守る) on Elementary, from real pointer strokes, is read as 守 and 守る is accepted written with kanji — on a task pad and in a battle's pad. Evidence: B kanji_chart §1–§2; U recog-coverage (守 21/21 held-out).
- [v] K3 Kana results unchanged with kanji reading off. Evidence: T kanaparity 6,888/6,888 identical held-out results plus the independent kana and nonsense sets; B kanji_chart §6.
- [v] K4 Recognition at scale measured (top-1/top-5 on clean, held-out synthetic and Tomoe samples; speed). Evidence: T eval.mjs --kanji; U recog-accuracy, recog-kanji; B kanji_chart §8 (median 15–18 ms per reading in headless Chromium). Real handwriting of kanji: not tested (K10).
- [v] K5 The chart has pages to cycle: kana, kanji by theme (12 themes + a small Other, 4.5 %) and by use (nouns, verbs, describing words, counters and numbers, names), derived from the lexicon's meanings and parts of speech with KanjiVG radicals as corroboration; met kanji first, unmet dimmed, no spoilers in unmet entries; every kanji with furigana. Evidence: U kanji_chart; B kanji_chart §3.
- [v] K6 Search by kanji, kana reading, rōmaji, English meaning or game word, instant, in and out of battle; typing never reaches the game; ↓/Enter/Escape; Escape clears the search, then closes. Evidence: B kanji_chart §2, §5; U kanji_chart.
- [v] K7 Each entry: readings with furigana, meaning, words from the game, the numbered stroke-order demonstration, and practice with the pad's reading and stroke-order notes; 守 practisable at every level (Words › Kanji chart on Foundations). Evidence: B kanji_chart §4–§5.
- [v] K8 Layout at 320×640 and 200 % text, 44 px targets. Evidence: B kanji_chart §7, pad_kanji layout test.
- [v] K9 Licence and attribution: data/NOTICE.txt and the stroke data header updated (KanjiVG CC BY-SA 3.0, radicals kept); fixture sources updated. Evidence: U recog (NOTICE check).
- [b] K10 Not verified: learners' real handwriting of kanji; Firefox, Safari and real phones; the theme of each of the 1,548 kanji by a person.

## Living Company and Discovery (owner's addendum of 2026-09-30; docs/addendum/COVERAGE.md; VALIDATION.md "Addendum — integrated validation"; unit 6321/0, default suite 49/50 then battle_group fixed 6/6, layout audit 536/536 + 201/201 and whole-game matrix 16/16)
Evidence kinds as in COVERAGE.md: U unit, B browser (headless Chromium), V looked at, S source only.
- [v] D1 Foundation: save namespaces `company`, `discovery`, `bookmarks`, `creatures`, `awarded` with migration of every older save (nothing deleted, no New Game), bus events, page registries, Company tab. Evidence: U company_core; B addendum_integration (two real slots), folio, settings; docs/ADDENDUM_CONTRACTS.md.
- [v] D2 Four cosmetic pets (Koma, Mugi, Sora, Ponta): art and looks, world following, battle reactions by response family, four vignettes, naming rules, Company › Pet; no gameplay effect. Evidence: U pets 164; B pets, pets_gallery, pets_sheets (16 pairs × world/battle/Company, V), addendum_integration (ladder, stairs, turning back). docs/addendum/pets.md.
- [v] D3 Sixteen companion × animal greetings (Company and the rest menu); nothing gained. Evidence: B pets_greet 17/17, company_pets.
- [v] D4 Company › Companion and Shared memories; bond with the exact table, cap 12, four descriptors, no loss, no farming, no combat effect; legacy rebuild from verified milestones only. Evidence: U company_bond 237, company_core; B company, company_pets. docs/addendum/company.md.
- [v] D5 Companion thoughts, invitations, reflections, six rest topics and a ritual each, reactions to what happened; decisions audit. Evidence: U company_bond; B company, side_ch3. docs/addendum/companion_decisions.md.
- [v] D6 Ending extensions for all four companions and The Pages We Keep (three pages each, camp and homecoming, early return, defeat, save/load at each point), 48 post-project topics. Evidence: U pages_project 601 (real pets); B pages_ending. docs/addendum/endings_pages.md.
- [v] D7 Field Inkweaving (the Weave sheet, V key), the Mill Road repair, puzzles F1–F6 with several valid routes; language, applicability and success kept apart. Evidence: U fieldweave 390; B fieldweave 89, mill_road 36, pets_weave. docs/addendum/fieldweave.md.
- [v] D8 Two deduction cases with evidence pages, layered help, refined choice sequences, Known Details annotations and pins; shortcuts audited. Evidence: U cases 194; B cases, cases_shots, known. docs/addendum/cases.md.
- [v] D9 Twelve Roadside Keepsakes, the catalogue and display, Shared Journey. Evidence: B keepsakes 32, cases (REFINE/LEGACY). 
- [v] D10 Sentence bookmarks and Creatures Met. Evidence: U bookmarks; B bookmarks. docs/addendum/words.md.
- [v] D11 Every new Japanese text passes the validator (scenes and the registries: 634 texts), furigana on every kanji. Evidence: tools/validate.mjs.
- [v] D12 Integration of the six slices (one memory per meeting, the pets' rest option, the Pages panel on the Companion page, keepsake display once, case topics in Company). Evidence: B company_pets, addendum_integration, company, pages_ending; COVERAGE.md "Integration work".
- [b] D13 Not verified: human play (fairness and fun of puzzles and cases, whether companions feel like people), native-speaker review of the new Japanese, Firefox, Safari, real phones, audible Japanese voice.

## Roadside Practice, A Quiet Cast, Companion Shiritori (owner's addendum of 2026-10-02; docs/practice/COVERAGE.md; VALIDATION.md "Practice addendum — integrated validation")
- [v] PA1 One foreground activity at a time through `RB.activity`; every way out returns the game to a valid state; a campaign change disposes the session. Evidence: U practice core; B practice_b, practice_a_lamps, wordplay (campaign change mid-session).
- [v] PA2 Fishing at three sites with nine fish, untimed by default; the only clock in the game is fishing's optional response entry (off by default; Gentle keeps the fish on expiry). Evidence: U `pace_noclock`, `fishing`; B fishing, pace. docs/practice/fishing.md, pace.md.
- [v] PA3 Shiritori house rules, three certified banks, searching opponents; audits and the 3,600-game benchmark unchanged on the integrated build. Evidence: U wordplay, shiritori_ai; benchmark rerun (be4c98c). docs/practice/shiritori_engine.md, shiritori_bench.md.
- [v] PA4 The shiritori table, records, the Company card and the two Bond events (Bond values and cap unchanged). Evidence: U `wordplay_bond`; B wordplay, wordplay_layout; recording docs/screenshots/wordplay/wordplay_match.webm. docs/practice/wordplay.md.
- [v] PA5 Lantern tending, the copying desk and Practice mementos. Evidence: B practice_a_lamps, practice_a_desk, practice_a_layout. docs/practice/suite_a.md.
- [v] PA6 Villagers' letters, the Proofreader's Tray and comparisons, from the post box in Shino's Post House. Evidence: B practice_b. docs/practice/suite_b.md.
- [v] PA7 Integration: default suite 57/58 on 25fab16; the whole-game run, stopped by a gap in the test player (a practice activity opened from a scene), passes with the fix in src/engine/99_test.js. Evidence: VALIDATION.md.
- [b] PA8 Not verified: human play, native-speaker review, real handwriting, Firefox, Safari, real phones and the foldable, fish captions' sources.

## Battle art, adaptive combat UI and playtest repairs (owner's addendum of 2026-10-02; docs/BATTLE_ART_CONTRACTS.md; docs/battle/; VALIDATION.md "Battle addendum")
- [v] BA1 Playtest repairs RBN-01, -02, -04, -05, -07 and the reconciliation ledger for RBN-01 to RBN-08 (docs/battle/LEDGER.md); 6 of the 7 repair tests fail on the build before the repairs as the review describes. Evidence: B playtest_repairs 7/7; U script_prompts; validator.
- [v] BA2 Battle animations Normal / Fast / Instant, independent of Text speed; Instant plays nothing and leaves a recap; Skip settles the exchange once. Evidence: B battle_presentation.
- [v] BA3 The action banner: only during the performed action's own interval, blue for the party and red for a creature, actor and name; never while choosing, writing, choosing support, between actions, after, in Instant or with the tab hidden; token-owned. Evidence: B battle_presentation (truth-table tests).
- [v] BA4 Per-creature intent badges and the inspector (hover, focus, press, switch, Close, Escape; never targets; 44 px; instance marks; quiet while acting). Evidence: B battle_presentation at 1280×800, 390×844, 320×640.
- [v] BA5 Intent display Adaptive / Expanded; reading-critical moves (lie, mirror, plea) named neutrally with their wording kept in view. Evidence: B battle_presentation.
- [v] BA6 Menus withdraw on commitment and return once; inert while away (Tab and pointer cannot reach them); Keep visible leaves them disabled; fresh-press ownership (a held or repeating key, a press begun before the menu or a double click's second click chooses nothing); focus returns to the last response. Evidence: B battle_presentation.
- [v] BA7 Resolve and Harmony visible in every battle state: the party slip uncovered in every recorded frame, the status inset on the language sheet, help sheets above the party slip on phones. Evidence: B battle_presentation, combat_ui.
- [v] BA8 Geometry at the eight §22.2 viewports, with 200 % text, a Japanese-led long-name case, a simulated keyboard and Keep visible: action-safe height 488 at 390×844 (target 300) and 308 at 320×640 (target 240); with three creatures 444 and 256 (final build). Evidence: B battle_geometry → docs/battle/GEOMETRY.md; stills in docs/screenshots/battle/layout/.
- [v] BA9 Rules unchanged by presentation: 540 configurations (companions × creatures × playback × motion × controls × text speed) plus 4 pet variations, every fixture identical. Evidence: B battle_invariance.
- [v] BA10 Twenty battle entries and exits: no battle-only element left, listeners and DOM nodes stable. Evidence: B battle_cycle.
- [v] BA11 Seams for the art work (authored poses, creature travel, deliveries, effect registry), contracts and inventory. Evidence: U battle_seams; docs/BATTLE_ART_CONTRACTS.md, docs/battle/INVENTORY.md.
- [v] BA12 Party art, creatures (the Flour Moth proof first), contextual backdrops, pets in battle and overworld parity: built by five workers and merged by the integrator, each merge checked on its merged build. Evidence: B battle_party, battle_anim, characters, the creatures A test, battle_creatures_b, battle_backdrops, backdrops, encounters, battle_pets_overworld, pets; records in docs/battle/{party,creatures_a,creatures_b,backdrops,pets_overworld}.md (rubrics are self-reviews, see BA14).
- [v] BA13 Phase F: integrated validation on the merged build, recordings (Normal / Fast / Instant, reduced motion, a 390×844 phone), layout stills (narrow, landscape phone, 200 % text, Japanese-led), the §21.5 memory budget (37.12 MiB of 48), handoff. Evidence: VALIDATION.md "Battle addendum — Phase F"; docs/screenshots/battle/presentation/, layout/; B battle_budget.
- [v] BA15 Large text on a phone: the action banner stays in view when the overlay scrolls and takes the width its words need; the actors' stage keeps its place and size through an exchange (at 100, 140 and 200 % text). Evidence: B battle_presentation "large text on a phone" (fails on the build before the fix).
- [v] BA16 The full-game matrix with both addenda in (run after both were complete, as the owner asked): whole-game matrix 16/16 (every profile × companion, Chapters 1–6 and an Atlas restoration), layout audit 536/536 (English, 8 viewports) and 201/201 (Japanese, 3) on the final build. Evidence: B matrix.mjs, visual.mjs --check; VALIDATION.md "Full-game matrix — both addenda".
- [v] BA17 (the owner's playtest, 2026-10-02) One cadence: the scene's ambient clock runs at its authored rate in every phase (it ran at half speed while choosing, writing and choosing support); the party stands ready while choosing; the calm stance only during the language task. Evidence: B battle_presentation "one cadence"; battle_anim.
- [v] BA18 Adaptive intent display per §13.3: a routine move is its badge only (the card has the creature's words, what it does, Translate (assisted) and Nao's foresight); the telegraph panel only for passages whose reading is the task, named "To read"; Expanded unchanged. Evidence: B battle_presentation, combat_ui, battle_group.
- [v] BA19 Creature plates: name (Japanese with reading, English, mark), knots and conditions on a translucent plate above each creature beside its badge; pushed apart, compact, then a rail; a group's plates choose the target (44 px); a settled creature keeps its plate; a plate's keyword note opens beside the plate. Evidence: B battle_presentation (three viewports, one and three creatures), battle_group, combat_ui; geometry 640/600 at 390×844.
- [v] BA20 The opening lines: no empty surface (plates, badges, telegraph, dock away and inert; the party slip filled); they come in at the first decision. Evidence: B battle_presentation.
- [v] BA21 Battle art restyled toward the owner's reference (party: the player in every look option and the four companions; creatures A and B: every family), motion and timings kept, memory 38.58 MiB of 48. Evidence: B battle_party, characters, creatures_a, battle_creatures_b, battle_anim, battle_budget; U creatures_a_restyle and the party/creatures B unit tests; docs/screenshots/battle/*_restyle/. The art judgements are self-reviews (BA14).
- [b] BA14 Not verified: Firefox, Safari, real phones and the foldable, human judgement of the art, a native speaker's review.

## Audit defects (Robin's request of 2026-10-07: "Fix the bugs you've found"; docs/future/plan/11_CONTRADICTIONS.md part D; VALIDATION.md "Audit defects fixed (2026-10-07)")
Each fix has a check that fails on the previous source and passes now: U `tests/unit/audit_fixes.test.mjs` (22/0), B
`tests/e2e/audit_fixes.mjs` (4/0).
- [v] AD1 Words › Grammar met lists the grammar points met, in the order met, with furigana (it always showed its empty message: it read `RB.grammar.points`, which doesn't exist). B audit_fixes 1.
- [v] AD2 The lantern list labels a grammar lamp with its point's title (same cause). U audit_fixes; B practice_a_lamps 51/51.
- [v] AD3 Translate in story activities (orders, letters) marks only the customer or letter it was used on as assisted. B audit_fixes 2 and 3.
- [v] AD4 A Foundations copy step (the model shown) is recorded as guided practice, not unaided handwriting (spec line 188); the feedback says "Guided practice". B audit_fixes 4; B learning_ui 15/0.
- [v] AD5 Promotion past box 2 needs a clean typed or handwritten answer in the current run of clean answers (one attempt ever, even a wrong one, used to unlock choice-only promotion). Existing boxes are kept; assisted answers neither count nor break the run (C-35, the lead's judgement at Robin's request). U audit_fixes; U the full suite.
- [v] AD6 The route chart draws only roads that can be walked (the Cinder–Lanternfall line is gone); a test walks every chart road through the maps. U audit_fixes.
- [v] AD7 Creature patrols draw from the world's own seeded stream, so a wandering creature no longer changes which language task comes next; the world engine has no `Math.random` left. U audit_fixes.
- [v] AD8 The validator checks ordering `alts` (a list of orders, each buildable from the step's tiles, none repeating the answer). It found one unbuildable alternative (`sa.di8`, Intermediate), which became an explanation shown after the answer. `node tools/validate.mjs`: no errors.

## The book interface, U01 (Robin's C-78 of 2026-10-09; docs/future/work/U01_BOOK.md; VALIDATION.md "The book on Journey and Company, U01")
A preview behind a setting; the classic folio stays the default. B `tests/e2e/book.mjs` 13/0; U `next_line_once`.
- [v] BK1 The classic folio is the default and unchanged; the preview is a display setting (not in the save) and restyles an open Ledger. B book 1, 8.
- [v] BK2 The book offers exactly the classic folio's controls and actions on Journey and Company. B book 2.
- [v] BK3 The section tabs sit across the top at every width in the classic folio's look (Robin, review round 1: "the tabs at the top were fine"); Left/Right move along them; on phones at 375, 344 and 320 px all five fit in one row. B book 3, 9–11. (Round 1's fore-edge column was removed.)
- [v] BK4 Opening, turning, restyling and closing never change the journey. B book 4.
- [v] BK5 The reading plane is flat at rest; reduced motion runs no animation; flat draws no texture or depth. B book 5, 6.
- [v] BK6 Closing hands the world back at once; the closing image shows its pages, can't be used and is gone in 0.23 s; reopening works. B book 7.
- [v] BK7 The Journey's "Next" names each destination once (person and doorway strip to the same scene are one), in the classic folio too. U next_line_once (every quest step); B book 12.
- [v] BK8 The dialogue strip keeps its speaker and its manual Next. B book 13.
- [v] BK10 The inner pages are organised (Robin, review round 1): Journey's itinerary of titles with each step said once on a spread; the request page in groups (what to do now; the way there; a nudge; earlier steps); one label voice; Company leads with Suzu and her words, the speech choice and its asking together, who travels in the running head, records as a ruled table. B book 12 (organisation) and 2 (control parity).
- [v] BK9 Robin's visual acceptance (the U01/U02 review set, round 2): "I think it's an improvement - you may proceed." (2026-10-09; C-79). H.

## The book's type, U02 (Robin's C-78 and font permission of 2026-10-09; docs/future/work/U02_TYPE.md; data/fonts/README.md; VALIDATION.md "The type, U02")
Only the preview uses these fonts; the classic folio makes none of them. B `tests/e2e/book.mjs` 14/0; U `book_type` 60/0; B `tests/e2e/type_specimen.mjs`.
- [v] TY1 Five type roles as tokens, filled under the preview: Vollkorn (display, reading), BIZ UDPGothic (controls), Shippori Mincho (Japanese headings), BIZ UDGothic (Japanese learning text and furigana). B book 14 (each role's face on Journey, Company and dialogue elements).
- [v] TY2 The fonts are inside the game file and made from its own bytes; nothing is fetched; the classic look makes none of them; start-up time is unchanged within noise. B book 14; measurements in U02_TYPE.md.
- [v] TY3 Licence and provenance: OFL 1.1, no Reserved Font Name; source URLs and SHA-256 recorded; licence files beside the subsets and in NOTICE.txt (About & credits). U book_type.
- [v] TY4 Every kana, kanji and CJK punctuation mark the game uses draws in the learning face, every kana and kanji in the heading face, every Latin letter, digit and mark in Vollkorn; anything else falls back to the system's fonts. U book_type (coverage read from each subset's own cmap, tied by hash to the embedded file).
- [v] TY5 The specimen sets real strings (Chapter 1 and Robin's Ledger) at 100% and 140%: dakuten, handakuten, small kana, the small tsu, the long vowel mark, dense kanji, a long line, mixed lines, I/l/1 and O/0; no furigana overlaps. B type_specimen.
- [v] TY6 Robin's visual acceptance of the type (the U01/U02 review set, accepted with round 2; C-79). H.

## The world proof, P01 (Robin's C-79 of 2026-10-09; docs/future/work/P01_WORLD.md; VALIDATION.md "The world proof, W00")
Development only: drawn only with `?dev=world`, only on the slice's maps. B `tests/e2e/world.mjs`.
- [v] WP1 Without `?dev=world` the game is unchanged: the proof is not allowed, the view is the game's own, and a held frame is pixel-identical with the proof absent, present but switched off, and on with every layer off. B world 1.
- [v] WP2 The far view frames the village as the target plate does (45 tiles across at 1440×900, whole device pixels per art pixel); a room keeps the near view; the view returns outside. B world 2; captures docs/screenshots/world/w00/.
- [v] WP3 In the far view a tap or click lands on the tile under it and collisions are unchanged (1440×900 and a 375-px phone). B world 3, 4.
- [v] WP4 The art contract is written: grid and art resolution, camera, light, ramps, outlines and contrast, projection and scale, layers, motion, dressing. Code review (P01_WORLD.md).
- [v] WP5 Illumination and atmosphere layers, each switchable (W01): cast shadows cached per map (built once), people shaded in shade, a grade, glow on emissive things only, water glints, haze, optional soft edges; reduced motion holds still; no sun shadows at night. B world 5. The development panel: only with the flag; the session visit is withheld while a save slot is current. B world 6.
- [v] WP6 Reedwake's kit, first pass (W02): grass patches, tufts, clover and flowers; the square's edge; the deep river with lily pads, cattails, ducks; the broken span; bridge rails; lit houses with flower boxes; low growth in safe places only. Collisions unchanged, the dressing deterministic, tall pieces thin to reveal people behind them. B world 7; captures docs/screenshots/world/w02/. (Trees, hedges and fences among the houses wait for a real layout: they change where people walk.)
- [v] WP7 Two purposeful actions (W03): Yasu fishing (cast, wait, bite, strike, reel, catch or miss, rebait) and Tomo folding the washing (shake out, fold twice, lay on the stack; clear the stack). Nobody moves; they yield to conversation and staging and begin again; reduced motion holds one pose; outcomes from hashes. B world 8, 9; strips docs/screenshots/world/w03/. (Normal-speed recordings: W04.)
- [v] WP8 The Reedwake slice with a battle, and its evidence (W04): a real battle from the square (Suzu and the Reedling) through the language UI, the Harmony cut-in and the action banner, back to the far view; the backdrop takes the slice's grade (the combatants and UI don't); the doorway; the player in two looks; the structural overlay; four normal-speed recordings; start-up, first-frame, frame and memory measurements. B world_slice (battle, doorway, player, overlay, measure, record); docs/screenshots/world/w04/.
- [v] WP9 Saltglass reusing the method, and the reuse report (W05): the harbour added by one entry; reused, generalised and genuinely new pieces listed; the market awning, anchor banners, gulls, chain rails, warm paving; Kiyo's fish-selling action; three player looks at desktop and phone; a crowded battle (three creatures) at desktop and phone. B world 10, 11; B world_slice saltglass; docs/screenshots/world/w05/.
- [ ] WP10 Robin's visual acceptance of the method (the P01 gate). H. The gate's review page is published (2026-10-10). Robin's answer (C-80): the direction is solid; push the detail further; a fidelity study first.
- [v] WP11 The fidelity study (C-80): Suzu redrawn from scratch alone at the Mill, rendered by the game from the real map with an idle loop and the scenery animated (ground, water, trees, the mill, the wheel, plants, motes, butterflies, leaves), light shafts, bloom, depth of field, three cameras; development only. B study 4/0; B world 12/0; docs/screenshots/world/study/; P01_STUDY.md.

## The expansion, P02 foundations (Robin's C-81 of 2026-10-10; docs/future/work/P02_FOUNDATIONS.md; VALIDATION.md "The expansion, P02 and P03")
- [v] XP1 The edition field (absent = six chapters), the twelve-chapter display map and chapter keys, `ed`/`chap` conditions; new journeys six-chapter unless the development switch is on; no schema bump. U foundations 66/0.
- [v] XP2 Older saves load unchanged: three campaign fixtures loaded without the expansion's fields keep everything they held, stay six-chapter, and only once the edition ships begin New Game+ in it. U fixtures_campaign 142/0.
- [v] XP3 Records with each save, seeded streams drawn once and kept across loads, story phases as conditions, frozen result envelopes, the one New Game+ carryover (K9, C-66). U foundations 66/0; U practice_a 234/0.
- [v] XP4 Quick wins: the card's "effect here" line matches the move (E5; U combat_preview 597/0); Harmony's sound (E21); the one-guess pad (C-14; B pace 13/0, learning_ui 15/0); the two Ledgers' names (C-58); the interaction meter (L19).
- [v] XP5 Validator rules for expansion content with an empty exception list; the review ledger. U expansion_rules 10/0; U review_ledger 2/0; validate: no errors.
- [v] XP6 The campaign still plays through with fixtures written. C F/Ren PASS (14.9 min) on 0d18ff7.

## The expansion, P03 learning evidence and task families (C-81; docs/future/work/P03_LEARNING.md)
- [v] XP7 The evidence log (mode, place, help, first try, transfer; kanji in words with readings) and help by category. U evidence 24/0.
- [v] XP8 Sentence forging and the task families with worked examples at four levels, in the workshop. B workshop 6/0; validate: every accepted reply readable typed and buildable.
- [v] XP9 Mastery exams and stars (one input type, first committed answer, the 30% rule counting help and misses together, retakes of those slots; stars unlock nothing), item pages without percentages, What I can do. U exams 113/0; B workshop (a Choose exam and its star).
- [v] XP10 The Grow route (one level up, offered, never changes the level). U grow 6/0.
- [ ] XP11 A person using the workshop, an exam and the item pages. H.

## The expansion, P04 encounters (C-81; docs/future/work/P04_ENCOUNTERS.md; VALIDATION.md "The expansion, P04")
- [v] XP12 The actor model as a pure refactor: the battles recorded before it play the same (1,710; the 102 that differed were shown to differ only in the final round's bookkeeping and re-recorded with a note); presentation never changes a battle. U combat_golden 2/0; B battle_invariance 640 configurations identical.
- [v] XP13 One shared exchange in a fixed order (you, the companion, guests, the creatures, the close), conclusions after each step; Wait (F-09); conditions; guests and arrivals; objectives; procedures and Resolve this step; conversations and machines; two-move turns; Hushes by family (F-10); order numbers and aims (F-11). U encounters 184/0; B encounters 10/0.
- [v] XP14 Modifier words (E27): every pairing's preview equals its rule; the breath and the two-knot rule (F-12); a phrase counts as written only when written. U modifiers 127/0; B encounters (the modifier row and its phrase).
- [v] XP15 Companion plans and the six-action menu (E10, E25), actions that grow, story help offers (E19), outcome sets with grave outcomes shown or summarised (C-65), the Tactics Board and its bests (F-08). U encounters 184/0, encounter_rules 17/0; B encounters, settings.
- [v] XP16 Five creatures in two rows, every one on the stage, at desktop and phone (E12). B encounters (captures docs/screenshots/encounters/).
- [v] XP17 Six-chapter battles and the campaign unchanged. C F/Ren PASS (15.0 min) on 6f300ce; U unit 28,748/0; B combat_ui 7/0, battle_group 6/0, battle_party 14/0, battle_settings 10/0, companion_turn 4/0, battle_cycle stable.
- [ ] XP18 A person playing the encounter fixtures (`?dev=enc`). H.

## The expansion, P05 the living world and exploration actions (C-81; docs/future/work/P05_WORLD.md)
- [v] XP19 Routines that move only on coming back (three transitions away, a story flag, a rest), never within a town, never mid-conversation, never on a load; one person, one place; pins; change beats kept until seen; "Have you seen…?" with four kinds of answer and no omniscience; notes, not markers; last seen kept (twelve-chapter journeys only); road events deferred and offered once a visit; sealed places noticed and opened. U town 87/0; B world_living 4/0.
- [v] XP20 Exploration actions as templates over Field Inkweaving and the case engine (W9, W11–W17), each with a fixture: notices people follow, courier rounds, repairs, connected water across maps (every required way always reopenable), observation and instructions, creature routing without a fight, layered sites with several valid readings, stage-blocking. U verbs 116/0; B verbs 5/0 (captures docs/screenshots/verbs/).
- [v] XP21 The performance library (V5): sixteen complete actions on the pose layer (anticipation to return), interruption that restarts from the anticipation, lazy validation of anchors and props, profession suggestions; the proof kit's dressing safe on every map. U perform 85/0, worldkit 10/0; B perform 3/0 (captures docs/screenshots/perform/).
- [v] XP22 P05's phase end: the browser suites (world_living, verbs, perform, departures, known, fieldweave, cases, world, world_slice, settings, folio, play_ui, ui) all pass; C F/Ren PASS (15.3 min) on b5311b6; U the unit suite's three failures on that snapshot fixed (the map census, a fixture over a fishing stand, the handwriting reading table) and the suite re-run on the fixed code (VALIDATION.md "P06").
- [ ] XP23 A person walking the living world's fixtures and the performance gallery (`?dev=verbs`, `?dev=perform`). H.

## The expansion, P06 records, replay, New Game+ and pastimes (C-81; docs/future/work/P06_RECORDS.md)
- [v] XP24 The Road Stamp Book with its stands, the travel volume with veils, the traveller's seal, read-only replay, New Game+ with the ending companion's farewell, all only in twelve-chapter journeys (F-21). U records 102/0; B records 5/0 (captures docs/screenshots/records/).
- [v] XP25 Shogi (C12): real rules (perft matches the published counts), handicaps, a three-level partner, the ladder (eight lessons, hasami shogi, the small board, mini-shogi, shogi), mate-in-one puzzles; Show moves, Why?, Take back (a finished game taken back comes off the record, F-22); promotion always asked; every piece with its reading; a first-win stamp. U shogi 64/0; B shogi 5/0 (captures docs/screenshots/shogi/).
- [v] XP26 The Distractions tab (K7, K10; F-23): twelve-chapter journeys only; the games met, each with its page (art, how to play, where, records), Play with your companion, shiritori's card moved from Company, fishing's page once the survey has begun; Fuku's bench (F-24); reading never makes a record, and older saves load unchanged. U distractions 19/0, fixtures_campaign 148/0; B distractions 4/0 (captures docs/screenshots/distractions/).
- [ ] XP27 A newcomer to shogi playing the ladder (the plan names Robin as the right first player). H.
- [v] XP28 The pastimes beyond shogi, twelve-chapter journeys only: hanafuda (koi-koi with the house rules of F-25, a partner at three levels, the months and sets shown), karuta (35 proverb cards read word by word, お手つき, a speed mode), shiritori's themed sets (recorded apart, never a stage), the festival shell (practice keeps nothing; timed keeps a personal best only) with water-balloon fishing; the Satchel as the book's equipment folio. U hanafuda 40/0, karuta 22/0, wordplay_themes 13/0, festival 14/0; B hanafuda 3/0, karuta 3/0, festival 3/0, book 15/0.
- [v] XP29 P06's phase end on 6c58b74: every browser suite it touched or could disturb passes; F/Ren PASS (15.2 min); the unit suite 29,473 passed, 1 failed (the handwriting reading table not regenerated after 計る; regenerated, recog-coverage 15/0). B, U.

## The expansion, P07 expeditions and a pilot (C-81; docs/future/work/P07_EXPEDITIONS.md)
- [v] XP30 The expedition engine (P07; D1–D3, D10): one instance per visit, the reset matrix of a restart and of leaving (machines part-way through reset, solved steps kept), stations used up and kept at full resolve, shortcuts kept, defeat by the expedition's rule, coherence when a save resumes half in or out, the battle hooks with the two-pool accounting (mistakes always given back, never more than is missing), the Atlas lantern drawn through the bar registry instead of a page observer. U expedition 30/0; combat_golden 2/0 (1,710 battles), encounters 184/0, atlas 77/0; B combat_ui 7/0, battle_settings 10/0.
- [v] XP31 The pilot expedition, the Flood Cellars (P07; F-26–F-29): the entrance preview read from the run's own definition; a large looped first floor (either passage closed, the stairs still reached); a bench, a spring and a lamp mended into a rest; the drain sluice as a procedure; the lamp room as an optional route; every creature in sight, the blot at the door an encounter of its own; the grate opened from below as the shortcut, kept; climbing out and defeat (back to the ladder, the visit reset, the learning, the grate and the floors seen kept); 〜て ある taught and used at all four profiles through choosing, ordering, typing and handwriting; the Map page's plan with uses left; carried resolve on the map; the whole-expedition curve. U expedition.test 30/0, expedition_cellars 51/0, expedition_curve 6/0; B expedition 5/0 (captures docs/screenshots/expedition/), ui 14/0, encounters 10/0, combat_ui 7/0.
- [v] XP32 The Atlas's commissions (D7; F-30): a board in the Lantern Hall (twelve-chapter journeys after the story) with practice topics from the evidence, three errands and three surveys; a length chosen (short, standard, long) and a card with the run's exact rooms before anything is fixed; topic lanterns and revisits, items never met taught first; the route fixed after mistakes; resume rebuilding the same rooms; ordinary runs exactly as before; survey landmarks, the Cartographer's Atlas page, safe passage in later runs, the compass and the stamp. U atlas_commissions 38/0, atlas 77/0, overworld_geometry 3/0, combat_golden 2/0; B atlas_board 4/0 (captures docs/screenshots/atlas_board/).
- [v] XP33 Delvers (D8; F-31): six people met by a seeded chance in the cellars' side chambers or at the Atlas's camp, twelve-chapter journeys only; the aid always, a remembered moment adding to it, a wrong one taking nothing away; once per visit or run; nothing depends on them. Room variation never blocks an anchor or exit for the expansion's runs (the Atlas self-check over 96 runs dressed as commissions with safe passage and delvers). The ten dungeon families' templates (D6; docs/future/work/DUNGEON_FAMILIES.md). U delvers 39/0; B expedition 6/0.

## The expansion, P08 Manybridge, Chapter 3 (C-81; docs/future/work/P08_MANYBRIDGE.md; VALIDATION.md "The expansion, P08 and P09")
- [v] XP34 The way to Manybridge in twelve-chapter journeys only: Tetsu's ferry east after Chapter 2, both ways; the road north from Saltglass washed out until Chapter 4's end; the six-chapter journey unchanged (F-32). U mb_ch3 76/0; B manybridge 3/0 (the chart by edition).
- [v] XP35 Barge routing: a canal map, a package, a sentence of who sends what to whom by which way; the barge goes where the sentence sends it, right or wrong; several valid plans; jobs at F/E/I/A. U mb_ch3; B manybridge (a wrong sentence sends the barge where it says, then the right one).
- [v] XP36 The Tally Exchange dispute (no creature; Unravel finds nothing knotted; Wait taught) and the lock-keeper's negotiation, every conclusion leading on (F-34); the Exchange's offers with their conditions at every profile. U mb_ch3; B manybridge (the dispute: Wait lets Gonta speak, the rice found).
- [v] XP37 The Undercroft Locks (connected water levels, lock tablets as routing sentences, procedures with checkpoints, Matsu's lamp as the rest) and the Nameless Bridge, a machine-procedure boss ended by its name assembled from the chapter's evidence; five creatures with field-guide entries and help on interim art (F-36). U mb_ch3, creatures_a 110/0, combat_fairness 713/0.
- [v] XP38 Side content (the census's first stage, the rival noodle stalls, Kansuke's riddles as a Distraction, the Lost Contract), Nao's and Ren's seeds, Manybridge's four songs and zone (F-35), それぞれ (C-74), the chapter's stamps and notebook (F-38, F-39). U mb_ch3 (census, stalls, riddles, the Lost Contract, the seeds), records 119/0 (every stamp's definition), audio_songs and audio_zones; B audio_zones 78/0, records 7/0.
- [v] XP39 Every new Japanese line self-reviewed in the ledger (never claimed as native-reviewed). U review_ledger 2/0.
- [v] XP40 P08's phase end on 666ad80: the browser suites it touched or could disturb pass (manybridge, encounters, combat_ui, ui, records, book, battle_settings, expedition, audio_zones, audit_fixes); the route through Chapter 3 at F with Ren from the Chapter 2 fixture reaches mb1_done (340 visits); unit 31,271/0. F/Ren stopped at Chapter 6 on a story-driver gap (F-51), fixed in the driver; then F/Ren PASS (12.7 min) on fb9a604 with the Chapter 3 route again (361 visits). B, C, U.
- [ ] XP41 A person playing Chapter 3 in the twelve-chapter edition (`?edition=12`). H.

## The expansion, P09 Manybridge, Chapter 4 (C-81; docs/future/work/P09_MANYBRIDGE2.md; VALIDATION.md "The expansion, P08 and P09")
- [v] XP42 Blockprint Row and Playhouse Row with seven interiors (F-42) and the Understage's three levels and the boss's stage, twelve-chapter journeys only, opening after Chapter 3; every Chapter 4 quest belongs to mb2; the chapter ends with mb2_done. U mp_ch4 118/0.
- [v] XP43 The press (C15, W10; F-45): a story or a notice composed from blocks (never free text), a proof, ink / press / peel, posted; readers around the world react to the page's tags; the record kept; nothing scored. B manybridge2 4/0 (compose, proof, print, post, the record and a reader).
- [v] XP44 The rehearsal (actors and props placed from stage directions; a wrong answer shows where it puts them) and manzai (the player as the straight one, Suzu or Genta the funny one; two retorts at F and E, three at I and A; nothing scored). B manybridge2; U mp_ch4.
- [v] XP45 The Understage: three machine procedures (trap lifts, the revolve, the weights) whose gates open only when worked, restarts by F-47; four creatures on interim art; the Lord of the Understage as a boss with a procedure and a stage cue for each companion; いくつか (C-74) at the top of the weight well. U mp_ch4, creatures_a 110/0, combat_fairness 713/0.
- [v] XP46 The festival: the core three preparations become the night's arrangement and a plan that cannot work falls back (F-43); yukata on the night only, on the road sprite and portrait (F-44); fireworks moving, or a held soft glow with reduced motion; the fireworks a bond event and a kept memory for every companion; the four games (katanuki, ring toss, word lottery, taiko) in Practice by default and Timed opt-in keeping a best only; the festival hall after. B manybridge2 (fireworks, yukata), festival_games 5/0, festival 3/0; U mp_ch4.
- [v] XP47 Side content (the census's second stage, A Ghostwriter's Debt with both lasting ends, The Apprentice Printer, The Missing Lead Actor, the extras, Kansuke's riddles 7–10), the wanderers Gonta and Hayashi (F-52), the four companion seeds, the folklore seeds (the oldest block; the theatre's oldest play, F-53), the world after (the river road from Reedwake, F-40; the north road mended), five songs, the chapter's stamps (F-48). U mp_ch4, mb_ch3 76/0 (riddles), audio_songs 2,290/0, audio_zones 684/0; B audio_zones 82/0, records 7/0, company, dialect_kansai.
- [v] XP48 Every new Japanese line self-reviewed in the ledger (1,030 unique lines, corrections listed); no new person shares a name with an older one (F-54, F-55; a validator rule). U review_ledger 2/0, expansion_rules 11/0.
- [v] XP49 P09's phase end on 112496c: 20 browser suites (18 pass; audio_zones crashed on a boss-only zone, a test fix, then 82/0; the Chapter 3 route stuck on a story-driver gap, fixed: 166 visits); the route through Chapter 4 from the Chapter 3 fixture reaches mb2_done (237 visits; 215 with the fixed driver); F/Ren PASS (12.5 min); unit 33,136/0. B, C, U.
- [ ] XP50 A person playing Chapter 4 in the twelve-chapter edition, the festival games included. H.

## The expansion, P10 the Keepers' Road, Chapter 7, and Chapters 5–6 in twelve-chapter journeys (C-81; docs/future/work/P10_KEEPERS.md; VALIDATION.md "The expansion, P10")
- [v] XP51 The seams: Snowbell's east road and the Lantern Road's west end lead to the Keepers' Road in twelve-chapter journeys only (the avalanche on the lower road, Hayate's line, the chart); the six-chapter roads unchanged; every Chapter 7 map is the twelve-chapter edition's; the chapter ends with kr_done on the way down (F-56). U kr_ch7 122/0, overworld_geometry 3/0.
- [v] XP52 Weighing tellings (F-57): sources side by side at the learner's profile (each with its reading task at F/E/I/A; the classical line glossed and labelled at A), marks with reasons and never a gate, any supported reading succeeds and the best saves a detour; the cave's order has one supported reading; the cache and the Fox Bridge have a best reading, a detour and unsupported ones; the validator checks every telling. U kr_ch7; B keepers 4/0 (I and A profiles, marks, the song refused, the order kept, the cache, phone width).
- [v] XP53 Relighting by name (four lanterns and the Moss Lantern, four profiles); Hisae's questions (asking back opens her); the Scriptorium Cave: the inner door only on the supported order, a wrong telling's dead end that explains itself (F-58), the Copying Room's bench and the Teller's Shadow, the registers; the vigil and the Hundredth Tale with three reachable endings and no Unravel (C-09, F-59); the shuttered hall (F-64). U kr_ch7; B keepers (the rite in its scene).
- [v] XP54 Six creatures with their moves' text and steps at four profiles on interim art (F-36), the Wick Moths' protect fight, the wanderers Seiji and Kikyō, the road events (the fallen cedar, the Moss Lantern, the lost stamp book), すべて (C-74), the chapter's stamps and shrine seals, and six biwa-led songs whose battle and boss themes sit between Snowbell's and Lanternfall's on every measure (F-65). U kr_ch7, combat_fairness 763/0, combat_curve 368/0 (rows of their own), creatures_a 110/0, creatures_b 1,040/0, audio_zones 759/0, audio_songs, combat_golden 2/0 (180 new battles; the earlier 1,800 unchanged).
- [v] XP55 Side stories (the Pilgrim's Stamp Book, Three Tellings of the Fox Bridge, The Keeper Who Stayed with three lasting ends shown before they are chosen, The Rhyme of the Oil Cache, The Teacher's Inkstone answered at the teahouse: F-62, F-63) and the companions (Ren's crossroads and night apart beside Ren's untouched quest; the others' quarrel and making up; two bond events and the Ridge Light memory: F-60, F-61). U kr_ch7, quest_guide 70/0, conversation_continuity 1,658/0.
- [v] XP56 Chapters 5–6 in twelve-chapter journeys: three more kinds of creature each, met only there, each with a move or combination no other has, fair at the words known where they are met; a changed-world line in each (F-66). U kr_ch7, combat_fairness, combat_curve, creatures_a, creatures_b, combat_golden.
- [v] XP57 Every new Japanese line self-reviewed in the ledger (1,370 lines including the Manybridge encounters the ledger had missed, F-68; corrections listed in the ledger's reference); never claimed as native-reviewed. U review_ledger 2/0.
- [v] XP58 P10's phase end on a clean copy: the browser suites it touched or could disturb, the route through Chapters 5–7 at F with Ren from the Chapter 4 fixture, F/Ren through the six-chapter game, the unit suite. B 21 suites pass and `manybridge` 3/0 after a test fix (f7c2e8a); C Chapters 5 and 6 reached, Chapter 7 reached kr_done after a story-driver fix (349 visits); B F/Ren PASS; U 35,932/0 (VALIDATION.md "The expansion, P10").
- [ ] XP59 A person playing Chapter 7 in the twelve-chapter edition, the tellings included. H.

## The expansion, P11 Kotonoha and the sea, and Lanternfall as Chapter 8 (C-81; docs/future/work/P11_SEA.md; VALIDATION.md "The expansion, P11")
- [v] XP60 The chapter order in twelve-chapter journeys: Lanternfall's council hands over to the island (Yae's line, Ōmi's letter with a leaf), the road above the fork stays in mist until Steamhollow, Tetsu's board gains the island once Lanternfall is over; the six-chapter game unchanged (F-69, F-70). U ko_ch9 181/0, overworld_geometry 3/0, edition 87/0.
- [v] XP61 Lanternfall's three new kinds (Notice-Board Mimic, Queue Spirit, Ledger Weevil), twelve-chapter journeys only, fair at the words known there. U creatures_a 110/0, creatures_b 1,074/0, combat_fairness 799/0, combat_golden 2/0.
- [v] XP62 Kotonoha, Chapter 9: the shore, village, hall, terraces, crown, tide pools and sea cave in their phases (early, Chapter 9, after, postgame); eight leaves sent home from the Wind Stone at four profiles, a wrong place explained with the leaf kept, and a line back on the mainland once each is home; the hall's exhibition of four tellings (panels: no wrong version, each pick explained, F-72); the shells' who-said-what-to-whom with optional local voices; the Root Hollows (leaves restore passages, the tide's separation and the way round, each companion's reunion); the Gardener ended by sorting the leaves, never by Unravel; five songs on the twelve-chapter ladder; six creatures and two wanderers. U ko_ch9 181/0, audio_zones 821/0; B kotonoha (panels at E and A, shells, the Wind Stone at F, phone width); C the route through Chapter 9 at F with Ren from the Chapter 8 fixture by the public ferry: reached ko_done in 242 visits after F-73.
- [v] XP63 Kotonoha's side stories (F-74): Ao's lessons, Kihei's letter with three lasting ends each shown before it is chosen, the leaf with your name by background, the census, the tide calendar; the companions' moments (F-75), each once with one Bond event; the rumour told several ways on the mainland; the island's stamps and stand. U ko_side 108/0 (scenes played through the real runner), quest_guide 71/0, records 143/0, company 268/0, dialect 7,272/0; B kotonoha 7/0 (Kihei's choice in its scene, the moon stones drawn).
- [v] XP64 Every new Japanese line of Chapters 8–9 self-reviewed in the ledger (corrections listed in the ledger's references); never claimed as native-reviewed. U review_ledger 2/0.
- [v] XP65 A Licence for the Open Sea, sailing (sail yourself or let the crew sail; sea situations; repairs; the travel log; the cabin), and the ports Sazanami and East Landing. U sea_licence 64/0, sea_ports 53/0; B sailing 2/0, licence 2/0, ports 2/0; C self-reviewed (F-76–F-84). Fishing at the new stations moves to P15 (F-82).
- [v] XP66 P11's phase end on a clean copy. U 40,163/0 (190cb80, after fixing 15 failures found on 45442cb); B every suite run passes after two test fixes (encounters' ordering task F-87; pad_kanji's outside kanji), sailing 3/0 with touch; route F/Ren to `ko_done` by ferry (245 visits); the route with the boat covered by unit and browser suites, not driven; C あらゆる taught (F-86), F-85 (VALIDATION.md "The expansion, P11's phase end").
- [ ] XP67 A person playing Chapter 9, with and without the boat. H.

## The expansion, P12 the Cloudroad, Chapter 10 (C-81; docs/future/work/P12_CLOUDROAD.md; VALIDATION.md "The expansion, P12")
- [v] XP68 The Cloudroad in twelve-chapter journeys: the call, seven post stations and their lamps, route reports with source and certainty, the weather by explicit phases, route planning, the relay (say what you know as surely as you know it), travel papers and the Mist Barrier's interview, staying behind (surety; the solo stretch; no stand-in), Nao's crossroads and night apart, the High Pass, the Courier's Hut and the Courier Who Never Arrived, the delivery and the end; ごとに taught. U cr_ch10 146/0; B cloudroad 4/0.
- [v] XP69 The chapter's six creatures and two wanderers on existing art families (interim, F-36), five side stories (one with three lasting ends), the companions' beats on the restored relay, five songs, the records. U cr_ch10, creatures_b, audio; B audio_zones 91/0, records 7/0.
- [v] XP70 Every new Japanese line of Chapter 10 self-reviewed in the ledger (1,382; corrections in the ledger's reference); never claimed as native-reviewed. U review_ledger.
- [v] XP71 P12's phase end on a clean copy. U 43,709/0 (aa5fa0e, after fixing 31 failures on the working tree), 43,761/0 on 7917e94; B 12 suites pass; route F/Ren from the Kotonoha fixture to `cr_done` after two map fixes the route found (the High Pass's goat path, the Barrier's fence; U chapter_reach 4/0) (VALIDATION.md "The expansion, P12").
- [ ] XP72 A person playing Chapter 10. H.
- [v] XP73 Steamhollow, Chapter 11, in twelve-chapter journeys: the descent and the valley, the arrangements (rooms, house rules, the baths by pronouns with they/them asked once and kept, steam cooking), the salesman and the complaint, the Steam Vents, the Kettle Below, the mediation and 全体; its creatures, side stories, companions, records and music. U `yn_ch11`, `chapter_reach`; B `steamhollow` 5/0 (VALIDATION.md "The expansion, P13").
- [v] XP74 Every new Japanese line of Chapter 11 self-reviewed in the ledger (`docs/review/language/yn.json`); never claimed as native-reviewed. U review_ledger.
- [v] XP75 P13's phase end on a clean copy: U 46,074/0 (4ebac95); B ten suites pass there, `records` 7/0 after its fix (9d085b6, run on 81d41f7); route F/Ren from the Cloudroad fixture to `yn_done` (3339174), fixture `F-ren-yn_done.json` saved.
- [ ] XP76 A person playing Chapter 11. H.
- [v] XP77 The twelve chapters joined (P14): Chapter 12's drained approach in twelve-chapter journeys (six-chapter journeys unchanged), four arc endings, the epilogue per companion, romance answered both ways, the New Game+ farewell per companion and solo. U `sa2_ch12`; B `archive12` 4/0 and `records` 7/0 on 81d41f7.
- [v] XP78 The route F/Ren from Chapter 11's fixture through Chapter 12 to `ch6_done` (635 site visits, 281 interactions, all in the story); its two "bodiless" speakers are a scene marked speakerless on purpose (VALIDATION.md "The expansion, P14").
- [v] XP79 The chapters' routes chained from a new journey in one run. R. One uninterrupted run, profile F with Ren: all 17 legs, 2,433 site visits in 65 minutes, to post, postgame and ch6_done; 0 problems, 0 page errors (VALIDATION.md, P17).
- [ ] XP80 A person playing Chapter 12 and the endings. H.
- [v] XP81 The Hall of a Hundred Tales (P15a–d): ten wings of ten trials each (one hundred trial ids, none twice), each wing's trials end to end in both patterns, right and wrong, its Grow route, each companion and alone, and every floor reachable with its rope up and down; the tenth door sealed until nine are relit. U `hall_w1` … `hall_w10` 1,111/0; B `hall` 4/0 (VALIDATION.md "The expansion, P15").
- [v] XP82 The Hall's rewards: per wing a lantern, a stamp, the travel volume's page (witnessed when told; revealable by confirmation, then viewable, never witnessed; painted in P16 as the tale's ink-and-wash scroll, XP99), the companions' reflections and the optional truthful note on the card; for all ten, Keeper Tsuru's last conversation and the Lantern of the Hundred, given once. U `hall_w10`; B `hall`.
- [v] XP83 Every new Japanese line of the Hall self-reviewed in the ledger (`docs/review/language/hall.json`), every wing's card text with furigana; never claimed as native-reviewed. U review_ledger, `hall_w10`.
- [ ] XP84 A person playing the Hall. H.
- [v] XP85 The old guardians (P15e): nine, one per region, awake only after the story in a twelve-chapter journey, each built round one family (two of conditions, two of arrivals, two procedures under pressure, three arguments), five knots at most; every one won by the automated player at every tactical setting with two companions; a blunt word ends an argument another way and it can be met again; a procedure's wrong action shown and not taken, its steps kept after stepping back; help offered after a defeat; the shrines free and reachable. U `guardians` 66/0, `creatures_a`, `creatures_b`, `combat_fairness`.
- [v] XP86 The guardians' rewards: a stamp with the honest record (meetings, tactical setting) shown plainly in the stamp book, a cosmetic keepsake given once, a travel-volume page (revealable before winning: viewable, never witnessed); hidden criteria name no place; every new Japanese line self-reviewed in the ledger (`docs/review/language/gd.json`), never claimed as native-reviewed. U `guardians`, `records`, review_ledger.
- [ ] XP87 A person meeting the old guardians. H.
- [v] XP88 Ashihara Shinden (P15f): the way in only after the story in a twelve-chapter journey; the three ways named (either right name kept, on the signpost and in the people's talk), the post box and the teacher's school; the two notices changing where the washing is done and where the market stands; the two quarrels settled two ways each (and a blunt word that ends one, taken up again), the meeting house; the first festival with the lanterns where planned, the food and the order; the planting hat once, the stamp and the travel volume's page; two journeys making different choices get different villages. U `settle` 79/0.
- [v] XP89 The settlement's living world: seven residents with routines, each in exactly one place at every stage and slot, pinned while their quarrel waits and moving again after; every person and thing to use reachable from the way in at every stage; growing buildings block only once they stand; its own music; every new Japanese line self-reviewed (`docs/review/language/as.json`), never claimed as native-reviewed. U `settle`, `town`, `overworld_geometry`, `audio_songs`, review_ledger; B `postgame` 2/0 (the guardian shrine, waking, stepping back, the stamp book's record; the settlement's way in, naming in the real task screen, the school).
- [ ] XP90 A person helping Ashihara Shinden become a place. H.
- [v] XP91 The returns (P15g): every return only after the story in a twelve-chapter journey (each person's new words, each new thing; in a six-chapter journey and during the story they say what they said before, the Snowbell board read line for line); Kotonoha's deepest grove (what fills it by the Archive's ending, a leaf read, a leaf of your own to whom you choose, Otoha afterwards); the yearly festival (a map of its own with real ways out and three stalls, Hiro's count of Suzu's twenty festivals); the Snowbell rota by Hoshino's choice and Akari's letter; Lanternfall's printed objections; Sanpei's last editions reporting only what the player did; the teahouse with one Gonza at a time; every new person, thing and way out reachable; every task at four levels with every wrong answer explained. U `returns`.
- [v] XP92 The companions' postgame beats (S14), each only with its companion: the double act for the troupe (three bits, Koume laughs first, they go on ahead and Tomi remembers), Sakichi's letter opened at once and one of yours down the relay with the reply waiting when you come again (by addressee; Nao's own pigeonhole if the forwarding address is Kirishita), Kikue's labelled jar, Ren and Hisae's walk and the night's saying; every new line self-reviewed in the ledger (`docs/review/language/rt.json`). U `returns`, review_ledger.
- [ ] XP93 A person visiting the places after the story with each companion. H.
- [v] XP94 Shogi's two places (P15g, S9): Snowbell's abandoned game a mate-in-one puzzle at the inn, checked by the engine (a quiet position, the gold dropped before the king), the inn's table and the hill bench reading as before in a six-chapter journey and during the story; Isamu at the bench only after the story with his quest done and Fuku's nameplate home, a game with him or Fuku, or watching. U `shogi`, `pastimes_post`.
- [v] XP95 A Quiet Cast's coast (P15g, F-82): in a twelve-chapter journey two more stations (Sazanami's rocks; the boat at the One-Pine Islet), six fish, twelve situations at four levels (every variant's accepted forms, explanations and Foundations rules as the first eighteen's), the spreads keeping their meaning and the coast's own; a six-chapter journey keeping three stations and nine fish exactly; the stations from the world and every coast situation on the stage in a browser; the One-Pine Islet on the chart only after the story, the crew sailing there, the landing, the stone read and the boat's name carved, and the way home; every new line self-reviewed in the ledger (`coast`, `sea`). U `fishing`, `pastimes_post`, review_ledger; B `fishing_coast` (4/0), `fishing` (11/0).
- [ ] XP96 A person fishing on the coast and sailing to the islet. H.
- [v] XP97 The postgame's phase-end evidence (P15h; playbook P15): the hundred-trial manifest (ten wings of ten, no duplicate, every floor's map present); every wing through going in, defeat restarting only its floor, the emergency retreat, the reprieve holding a floor exactly, the suspend point and completion, each with nobody a delver could be; the guardians' policy (optional, after the story, a way to step back, help after a defeat); the settlement's progression; the pastimes' pages and activities, every shogi puzzle a legal mate in one, every fishing station placed; no postgame system gating anything outside its own content; no empty port, placeholder wing or "coming soon". U `postgame_phase`.

- [v] XP98 The art census (P16a): maps and their kits, creatures and their families, the travel volume, the wardrobe on road figure, portrait and Harmony bust, characters; a summary, a JSON register and contact sheets per region; `--check` fails on what it can measure. `tools/art_census.mjs` (run, VALIDATION.md "The expansion, P16").
- [v] XP99 The travel volume's paintings (P16c): the 33 pages that were missing (13 for the six new chapters, 9 old guardians, 10 Hall tales, the festival), each wired into its scene, each one-time action ≤ 1.6 s, its focal area above the sheet at desktop, phone and a phone on its side, the campaign untouched when watched, reduced motion holding at once, no letters drawn; none left as an interim plate. U `sequence_p16` 363/0, census `--check` (47/47 painted); B `sequence_p16` 41/0 + 62/0.
- [ ] XP100 Robin reviewing the art pass's pages (AC-1: implemented provisionally, internally reviewed only). H.
- [v] XP101 The book on every surface (U05/U06, P16e): dialogue, title, help, writing prompts, battle slips and confirmations in the book's type roles and materials; every other folio a sheet of the same book; the classic folio retired with nothing lost (parity against the classic folio's recorded controls); usable at 320 px and 200 % text, on phones the dialogue sheet never standing into the world above it, the typing field and its Submit above the software keyboard. B `book` 15/0, `book_surfaces` 7/0, `folio`, `settings`, `create` 382/0, `learning_ui` 15/0, `kanji_chart` 8/0, `quest_guide`, `keepsakes`, `sequence_manual`, `play_ui`, `equipment` (VALIDATION.md "The expansion, P16 — P16b, P16d…").
- [v] XP102 The interim creatures' own drawings (P16b): all 46 creatures drawn on a borrowed family in the interim have a family of their own (none shared), performing the same moves with the same timings, effects and results, inside the frame budget, with map figures drawn from the same drawings. U `creatures_c` 194/0, `creatures_a` (84 = the ten families' share + those moved); B `creatures_c`; census `--check` (0 borrowed).
- [v] XP103 The regional kits and the yukata (P16d): the nine kits' props reviewed at art resolution and the weak ones redrawn (none left marked interim); the yukata's print, obi and bow on the festival night only. Census `--check` (0 interim maps); prop sheets; the festival tests.
- [v] XP104 Answers never sit in a pattern (Robin's report on the letters): the letters (four activities) and every other sheet that listed answers as written (procedures, conversations, the relay, proofreading's find, the tellings, the actions page) show them dealt, per opening, each answer keeping its place in the rules. B letters_order 4/4 (0/4 before), answer_order 5/5.
- [v] XP105 The twelve-chapter edition ships in the build (Robin's C-84; C-54, C-66, S4): new journeys are twelve-chapter and Settings no longer offers the edition; a six-chapter save is marked in the Ledger, Continue or Load on it explains the fresh start first, "Not now" leaves it byte for byte, and accepting begins New Game+ (own slot after a confirmation, or another) with its companion's farewell or the solo one. B old_saves 4/4; U foundations, fixtures_campaign.
- [~] XP106 Light and shadow on every map (Robin's C-86): every outdoor map of the twelve chapters and the postgame under its region's own sun (cast shadows, grade, haze, glints, glows; weather and darkness soften it; at night the lamps cast), with the regional kit's ground dressing in each region's colours; rooms lit by what they hold (daylight through the windows their building has outside, shafts across the floor and short shadows into the room; warm pools and shadows from lamps, candles, hearths and stoves; never a shadow over a wall; by night only the lamps); the outdoor view a little wider only where a screen allows (30 tiles at 1920×1080; the game's own at 1440×900, 1280×800, phones, rooms and battles); Settings → "Light and shadow" Off is the flat picture pixel for pixel. Browser `world.mjs` 13/0 and `world_light.mjs` 4/0 (every one of the 226 maps lit and drawn without a page error) on the scratch build; captures `docs/screenshots/light/`. Open: Robin's review at completion (AC-1), real devices' frame rate.
- [~] XP107 The Living World across the journey (Robin's C-87; Astra's LW-1 audit): LW-01 the World Proof's three at work in an ordinary journey, light on or off, only at their own place and not on a story's evening — U perform, B `living_world` LW-01, `world` 13/0; LW-02 the journey's people at work (47 in 14 regions, a manifest and the people left still) — U perform 137/0 (the manifest against the real placements), B `living_world` LW-02; LW-08 a sighting only in view — B `living_world` LW-08; LW-09 a moved same-id placement walks to its new place — B `living_world` LW-09; LW-03…LW-06 every region (16 towns: 43 routines with 85 places, 44 askers over 113 people, 56 change beats, 19 roads with unique events and variants, 39 return keys) — U `living_world` 110/0, `town` 87/0, B `living_world` 7/0, `world_living` 4/0; LW-07 the exploration actions at every place the plan names (19 production instances, `src/content/zzz_verbs/`) — U `verbs` 159/0, `hall_w3` 123/0, B `verbs_journey` 5/0; language self-review of every new line by region (code review, recorded in the ledger once complete) and the word-help fixes it called for — U `word_help` 8/0. Register: docs/future/work/LW1_ROLLOUT.md. Since then (2026-10-12): the ledger entries for every new line (U `review_ledger` 2/0) and the font subsets (U `book_type` 60/0); the complete browser run's parts 1–6 run and traced (VALIDATION.md "The complete browser run"). The complete browser run is done: parts 1–8, `--extra` and `staging_chapters` by piece, every failure traced and the outgrown tests fixed (VALIDATION.md "The expansion, P17"). Those parts ran on builds up to cb8c497; later changes were tested by their own suites and the four Plan B campaigns. Then the same complete run on the final build (`index.html` e456645a…, a clean export of 0f7ce8d; 2026-10-13): 12 parts and `--extra`, 140 scripts; 136 passed at their first run, and the 4 failures (`learning_ui`, `pets`, `company`, `actor_life`) were test faults, traced, fixed in the tests and passed in full on that build (VALIDATION.md "P17 — the complete run on the final build"). Left: Robin's review at completion, which is Robin's.
- [~] XP108 The music performance, Original or Ensemble (Robin's MT-1; docs/MUSIC_PERFORMANCE.md; decision F-145): Settings › Audio › Music performance (Original by default; title, Ledger and battle) with a truthful status line — U `music_performance`, B `music_performance` MT-T01–T06/T45; two pilot recordings (`snowbell`, `battle_keepers`) made from the current score in the SC-1 treatment by `tools/music/ensemble/`, measured in Chromium (decoded frames, alignment, the scheduler at the join and ten boundaries, loudness through the game graph, onsets, handover levels) and admitted by the build only while their fingerprint matches — B `verify.mjs` (docs/music/ensemble/qa/), U `music_performance` (the manifest against the files and the scores; the built page's catalog and `connect-src 'self'`); switching both ways on the audio clock with the Original warm, loading that never holds play, failures falling back (404, wrong type, oversized, redirect, altered, timeout, stale score), one-shots, rapid changes, a suspended or replaced context, 44.1 kHz, the hosted sub-path, the standalone file fetching nothing — B `music_performance` (MT-T07–T44, the two pilots in ordinary play); the chain and the full matrix at Original only (Robin's C-88). **Listened to:** Robin heard the captures (docs/music/ensemble/listen.html) on 2026-10-12: "It sounds great, nice job". **Not done:** hearing it in the game on Robin's device (H), any device or browser but Chromium on Linux for the game itself, deployment (after the whole gate, C-87), and the rights review of distributing TimGM6mb-based recordings (Robin's).
- [~] XP109 P18 Plan B (Robin's C-89): four continuous twelve-chapter campaigns, F/Ren, E/Nao, I/Mio, A/Suzu, through `tests/e2e/matrix.mjs --twelve --pairs …` (the shipped edition and the route passed explicitly; the edition and the seventeen milestones in order asserted; negative controls for a wrong edition, a fixture start and a milestone out of order run). F/Ren on a clean export of 900efc5 (before the launcher's checks): 17/17 to the ending, 0 problems. **The four on one fixed build, a clean export of 2debb3c: E/Nao, I/Mio, A/Suzu and F/Ren all PASS** (17/17 milestones in the order the game set them, the shipped edition, to the ending, 0 problems, 0 page errors; 69–75 min each); the earlier batch on 28cb216 failed by the launcher's own too-coarse order check (recorded, not counted) and one on 13fd5d6 was cut off by a container restart (not counted). The campaigns start with the debug start on the road, not the title screen. P17's speed checks on a quiet machine after them: ready 1.34 s (desktop) / 1.48 s (phone), a world frame 4.3–6.2 ms, the Ledger's open and close 16–24 ms with no node left behind (headless Chromium; a trend, not a device). Not "sixteen full campaigns passed", not native-reviewed Japanese, not real-device validation. VALIDATION.md "P18 — Plan B".
- [v] XP110 Every tier of every task judged by the game's checkers with negative controls (U `answer_sweep`): the profile-keyed content enumerated (1,010 objects in 20 registries today) and classed; challenges, encounters, creatures' answer and truth moves, history questions, the Atlas's names, the relay and the drills at F/E/I/A; letters, the Proofreader's Tray, comparisons and fishing named as swept by their own suites; a self-test, and two broken checkers (accept everything) shown to fail it.
- [v] XP111 The sixteen companion × level naming combinations at the Archive's gate (`sa2.name_<companion>`) as focused tests (B `naming_combos`): each from that companion's own pre-Archive fixture, continued from the title, the level set with the Settings radio and checked, the gate entered with real keys, the sheet answered with real clicks (the level's tier shown; a look-alike refused on half), the voice back, the companion's reply, the journal, the learning record and no second asking checked. **16/16** on a clean export of b11056e (`index.html` e456645a…) from the four Plan B campaigns' own pre-Archive states (`tests/fixtures/p18/`, written on 2debb3c, hashes unchanged after): the eight E and A cases refused a look-alike first and recorded the miss, the eight F and I right first time. Focused tests at the selected level from each companion's own history, not proof that the campaign before was played at that level.
- [v] XP112 The narration that depends on the Japanese level: selection (U `profile_narration`: 1,150 lines in 155 scenes, 361 complete sets seen once at every level with Grow on and off, five one-end extras named, no overlap, a self-test) and rendering (B `profile_narration`: every line at 320×640 and 844×390 at 200 % text, the 24 longest at the eight §22.2 sizes, 100 % and 200 %, English- and Japanese-led: on screen, nothing cut off sideways, furigana on every group).
- [v] XP113 Found by P18's targeted tests and fixed: the New Game+ offer is made only while its journey is the one being played (B `play_ui`, failing before the fix; `verbs_journey` 5/5); a blank to fill (［　］) is never broken across two lines (B `profile_narration`; it left ［ and its space hanging past the box at 320 px and 200 % text).
- [v] XP114 LP-1, the Ledger in Firefox (Robin's report): **Robin's report resolved after a browser configuration change** (Robin, on their Windows Firefox: restoring the recommended performance settings, hardware acceleration, removed the lag; it had been off, software WebRender); not a general Firefox certification, not attributed to LP-1 alone; a troubleshooting note in README.md; software rendering kept as a separate compatibility consideration. The work: reproduced in Chromium as a proxy (Firefox cannot be fetched here: the network policy refuses Playwright's Firefox hosts; `RB_BROWSER` selects an engine where it is installed); the first open's half-second traced to the Quest Guide's state copies (now copy-on-write, answers identical on eight fixtures), the grain baked from its own SVG, the spread's filter replaced by its own shadow layer, the spread kept between pages, the tab rail's forced layouts consolidated, the world drawn on one frame in four under the book; the look unchanged (pixel comparison at four sizes); B `ledger` 30/30 functional, measurements recorded separately. Review checks (Robin): the guide's per-look copy was stale when asked, changed and asked again in one callback (and the cached targets kept it); now one copy per outside question, U `quest_guide_live` 56/0 (fails 22 on 2debb3c), answers identical to 13fd5d6's on twelve fixtures, B `ledger` 32/32, opening time as 2debb3c's; weather under the book moves at a quarter speed as well as a quarter rate, recorded with measurements, no correctness problem, not changed (its refresh-rate dependence, older, deferred apart in P17_CLOSURE); the guide audit's one miss (older than LP-1) traced to the audit's attribution around "Have you seen…?": B `quest_guide_wrapped` 15/15 with a negative control, whole-game audit 0 misses. Firefox automation here: not possible (hosts refused) and no longer needed for this report; the grain's effect in Firefox unmeasured. VALIDATION.md "LP-1".
- [~] XP115 VA-1, the voice audition (Robin's VA-1; C-83):
  - Done:
    - VS00, the intake (R; the Firefox item updated for C-90);
    - VS01, the frozen corpus of 83 cases and 14 neutral controls (U `voice_corpus`);
    - VS02's preparation that costs nothing:
      - adapters for all seven configurations, voicing only the spoken Japanese (U `voice_audition`: 1,328 requests);
      - a runner that refuses without an authorisation, a cumulative character cap and the credential;
      - the technical check (measurement only);
      - the gallery (B `voice_gallery`, mock takes);
      - the Qwen local job and the casting templates;
      - the consolidated setup request (docs/future/voice/VS02_SETUP_REQUEST.md).
  - Robin's corrections before the first paid request (2026-10-13; U `voice_audition` 42/0, U `voice_local_kit` 7/0,
    B `voice_gallery` 23/0):
    - proxy or env credential mode;
    - an append-only usage ledger with a US-dollar allowance at Gemini 3.8 Flash TTS's official prices;
    - per-attempt, per-audio listening identity;
    - markup kept apart from the canonical Japanese, with an ElevenLabs model and tag review gate;
    - separate evidence fields;
    - Gemini prepared as the first runnable configuration;
    - the Windows local-engine kit.
  - Robin's order (2026-10-13): free and local engines first, with the Windows kit; Gemini only as 9 representative
    samples if they fall short; whole-game generation approved separately after the complete estimate
    (`PRODUCTION_ESTIMATE.md`; the audition runner refuses any authorization not for the audition).
  - The unattended local run (Robin's directive, 2026-10-13): this cloud session has no access to Robin's PC, so it
    prepared a handoff in the kit (`LOCAL_RUN_HANDOFF.md`, review ZIP packer, provisional lead labels, resume by
    request identity). Robin then started a Remote Control session on the PC to run it; nothing from that session is
    recorded until its results come back.
  - Robin's direction (C-91, 2026-10-13): the curated review takes time and found no single winner, so the prepared
    set may mix models by role or kind of line. The game keeps the device voice (Windows voice packs, as today) and
    adds the vetted prepared voices once the review is done (C-83's None / Device / Prepared rule).
  - Open: every configuration is blocked here or awaits Robin's authorisation (untested, not inferior); no audio,
    listening, casting or whole-game synthesis yet. VALIDATION.md "VA-1".

- [~] XP116 AR-1, the illustrations' art pass (Robin, 2026-10-13: bodies "painted downwards", back figures "remarkably
  simple", "reconcile the art issues across all the illustrations"). Under AC-1: implemented provisionally, internally
  reviewed; not Robin-approved.
  - Done: a drawn body under every standing bust (`src/engine/35b_portraitbody.js`) with arms that hang, clasp or hold
    what the shot draws; back figures redrawn (`src/ui/43_sequence_back.js`: hair, collar, shoulders, arms apart from
    the back, the garment from behind, legs and feet, seiza, raised and forward arms); every held thing within reach;
    every shot paints its whole frame (eight places had gaps); the prologue counter's black front; smaller placements.
  - Evidence: unit `sequence` 499/0, `portrait` 70/0; browser `sequence_art_integrity.mjs` 13/0 (full; negative
    control fails as it should; `--quick` in the default run); the existing sequence suites on the final build
    (`sequence_p16` 101/0, `sequence_chapters` 121/0, `sequence_chapters_56` 196/0, `sequence_dev` 9/0,
    `sequence_manual --quick` 64/0, `sequence_world --quick` 892/0, `prologue` 100/0, `portrait_anim` 77/0);
    before/after pairs `docs/screenshots/ar1/` (14, lossless). VALIDATION.md "AR-1".
  - Round 2 (Robin: "Ren appears to be floating in a library"): floors under the people who stood on walls, the street
    under the Exchange crowd, the stage's edge over Tokiwa, shadows at every standing figure's feet, your own arm taking
    Hoshino's envelope. VALIDATION.md "AR-1", round 2.
  - Open: Robin's review of the illustrations.
- [~] XP117 AR-2, animation, framing and staging at the game's real picture sizes (Robin, 2026-10-13: "any other
  illustration oddities … animations, framing"). Under AC-1: implemented provisionally, internally reviewed; not
  Robin-approved.
  - Found first: AR-1 had been judged at 1280 × 720, which the game never draws; the game draws sequences at its art
    buffer's size (640 × 360 on a 16:9 desktop, 683 × 349 at 2048 × 1046, 390 × 844 upright phone, 563 × 260 or 507 × 234
    on its side) and the travel volume at 160 × 90.
  - Done: forearms for a dozen hands that floated in close-ups (`RB.seqKit.forearm`); six upside-down left hands
    corrected (the mirroring convention written at `hand()`); your arm for the folio handed to Kasane; Asahi's nameplate
    held from below; Sen, Sanpei and the companion at full length; the bell's green, the lamp's colours, the assembly's
    speakers and six end-of-action switches eased instead of jumping; the volume's pages at 320 × 180 with the sheet's
    line, whole heads; two unpainted places at the new sizes; Ren's folio and glasses within reach sideways.
  - Evidence: VALIDATION.md "AR-2"; pairs `docs/screenshots/ar2/` (16, lossless, at 640 × 360 and the volume's size);
    `tests/e2e/sequence_art_integrity.mjs` now at the real sizes and the volume's, with three more checks (hands held,
    faces in view, no jump between phases): full 32/0 on the final build, negative control fails as it should; the
    sequence, volume and book suites pass on the final build (sailing's touch tap hardened after one timing failure).
  - Open: Robin's review.

- [~] XP118 MT-2, the Ensemble for every song (Robin, 2026-10-13, C-92: "All 115 now", Ogg Opus and MP3, TimGM6mb
  while the rights are decided). docs/MUSIC_PERFORMANCE.md "MT-2"; VALIDATION.md "MT-2".
  - Done: the renderer for every instrument and stroke (voices chosen by the lead, listed), each part's balance
    measured against the Original's (±2.3 dB of SC-1's on the pilots), the game's echo, rooms by kind of cue, one-shot
    cues as one file; every song produced and measured in Chromium (`produce.sh`, `verify.mjs`): **114 of 117 ready**
    and in the build (B `verify.mjs`, reports in docs/music/ensemble/qa/; U `music_performance`; B `music_performance`).
  - Changed on the evidence: the handover crossfade is equal-power (the two performances measured uncorrelated); a
    one-shot's recording plays out its decay at the score's end (it was cut); a second onset detector, a negative
    control and a stricter onset rule (z ≥ 4); exact MP3 lengths (guard) and a higher Opus rate where a file fit
    better shifted; a cue under 32 s measured at its steadiest moments.
  - Follow-up (Robin, 2026-10-14, "Definitely include every track"; Astra's report): **all 117 songs ready, every one in
    Opus and MP3** (nine had been admitted with one encoding: fixed; U checks both for every track); `playhouse`,
    `sb_road`, `sa_kasane` admitted on Robin's waiver of the handover level (recorded in the manifest); a full-track
    player for every song on `docs/music/ensemble/listen_all.html`.
  - **Not done:** **not listened to by anyone** (the listening page is for Robin). Chromium on Linux only; no device.
    The hosted release (C-87). The recordings are GPL-2 (Robin, 2026-10-14; `assets/music/ensemble/NOTICE.md`).

- [~] XP119 KS-1, Roadside Keepsakes on the whole twelve-chapter road (Robin, 2026-10-14: "there are only 6
  Keepsakes still? … might have been forgotten when developing new areas"; "Yes, please do so"; C-94). VALIDATION.md "KS-1".
  - Done: the catalogue lists every item that calls itself a keepsake (22: the nine guardians' gifts, the iroha
    print, the tide-stone rubbing, the "Fish Street" slip, the Lantern of the Hundred, the planting hat, and eight from
    the six-chapter and Koharuno roads), each recorded when given (`RB.state.give` for the journey being played:
    scenes, quest and battle rewards) and counted as found while a journey from before holds or wears it (a save is
    never written into on load); the page knows the 14 regions of the twelve-chapter road (the Hall and Ashihara
    Shinden included) and shows a six-chapter journey only its own; twelve new Roadside Keepsakes, two for each new
    chapter (Manybridge, Blockprint and Playhouse Rows, the Keepers' Road, Kotonoha and the sea, the Cloudroad,
    Steamhollow), each with pixel art, a name with readings, where and how, two hints, companion lines for all four
    and Suzu's Kansai, findable by a journey already past its chapter; New Game+ carries the found record (C-66).
    46 road keepsakes in all (12 before). The language ledger, scene manifest, font subsets and handwriting data
    follow the new lines (枡, 蒔, 檜).
  - Checks: U `keepsakes_road` (every item called a keepsake catalogued; complete entries; art on the grid; ≥ 2 per
    chapter region; edition filter; recorded on give, never for a copy; held items found without writing to the
    save; each chapter keepsake's scene placed, offered until found, and recording it when played with each companion
    and alone); B `tests/e2e/keepsakes.mjs` on the new build. Not done: Robin's look at the new keepsakes in play.
- [~] XP120 VA-2, the casting samples Robin asked for (2026-10-14; C-93). docs/future/voice/va2/; VALIDATION.md "VA-2".
  - Done: Robin's voice decisions recorded verbatim (narrator AivisSpeech with a directed tone; player Voice A/B each
    High and Low; NPCs Qwen3-TTS with AivisSpeech for bubbly feminine voices and VOICEVOX Nemo for middle-aged men
    only; no trailing consonants or breathiness; supernatural treatments; a neutral word for the player's name in
    recordings); the plan (60 player, 240 companion (60 each, added at Robin's request), 14 narrator, 281 NPC takes,
    every text a line the game says), the NPC casting
    table with evidence per NPC, the renderer for the free local engines (clean-ending check, formant-kept High/Low,
    treatments, −20 LUFS), the one-file gallery, the handoff for Robin's PC.
  - Robin's later answers (C-93): no voice for the Hush; the supernatural treatments stand; Mochi's ニャー a sourced
    CC0 or public-domain meow, not a voice (sourced on the PC), or, if none can be confirmed, a playful female
    AivisSpeech voice saying it; no live generation; one loudness for every line.
  - Run on Robin's PC (2026-10-15): 595 of 595 samples made, records in `docs/future/voice/va2/run/` (checked here:
    the plan's 595 take ids, none mocked); the gallery is with Robin.
  - Not done: Robin's picks; anything in the game's speech (C-93: only after Robin's decisions).
- [x] XP121 RV-1, register and conversational naturalness reviewed in context before whole-game voice production
  (Robin, 2026-10-15; C-95). docs/review/register/REGISTER_REVIEW.md; VALIDATION.md "RV-1".
  - Done (R, review by reading; no game line changed): every spoken scene line (9,335, the player's choices and
    Suzu's Kansai lines included) read as whole exchanges by 14 readers against Robin's criteria; 304 findings
    (80 fix before recording, 169 consider, 55 support only), each matched to its line; automated checks of word help
    (33 wrong explanations, 250 tokens), Suzu's Kansai politeness (21 lines), lines several companions say (116 texts)
    and recording text that joins words (9); six decisions for Robin (D1–D6) and 112 lines to keep; tools in
    `tools/review/`. The VA-1 audition text, the VA-2 plan and samples and the VA-2 run are untouched.
  - C-95 decided (Robin, 2026-10-16, a bounded editorial authorization) and applied: docs/review/register/
    DISPOSITIONS.md. VALIDATION.md "C-95 corrections".
    - Every finding is disposed of: 222 accepted, 70 retained, 12 deferred. All 80 "fix before recording" are applied.
    - The script: 482 lines in 100 files, 19 of them Kansai.
    - D6 word help: lexicon only, no line changed.
    - Kept: the 112 preserved lines unchanged, and the frozen audition texts (their divergences recorded).
    - Records: the ledger has entries for every changed line.
    - Checks: R by reading; U suite 54,352 passed, plus the one regenerated data file; B Kansai, Hall, chapters 3 and 4,
      ui.
  - Not done: the 12 deferred findings, which are Robin's (listed in DISPOSITIONS.md).
- [~] XP122 PT-1, a new learner's first play (a coworker's notes, relayed by Robin, 2026-10-15). VALIDATION.md "PT-1".
  - Done: (a) "The UI volume was crazy loud": interface and feedback effects trimmed in the engine to sit under the
    music, measured at the game's default volumes (B `audio_levels`; sliders and saved settings untouched); (b)
    "Settings are not prominently displayed in the menu / hard to find": a Settings button on the map beside Word help
    and the Ledger (a gear on a phone), Settings beside Close at the top of the Ledger, the title's Settings as before
    (B `settings_access`); (c) "highlight the spoken word in Japanese and the English counterpart(s) in the sentence
    prominently": the word being said marked in the Japanese line and its English counterpart, following the device
    voice's positions or an estimate, ready to follow recordings; Settings › Audio switch, on by default (U
    `speech_align`, B `speech_mark`).
  - Not done: (d) "The start was confusing - needs voices (wip)": the voices, which wait on Robin's VA-2 picks (C-93).
    No look at the opening itself beyond that was asked for. A real device voice's own positions were not tried here
    (headless Chromium has no voice; the browser test uses a stand-in that reports positions as device voices do).
- [x] XP123 ST-1, Settings laid out like the Ledger, and the settings reviewed when a journey begins (Robin, 2026-10-15).
  VALIDATION.md "ST-1". Run: B `settings_review`, `settings`, `settings_access`, `book`, `folio`, and the regression
  batches (32 suites) pass, after three test updates for the new layout; `harmony_cutin` 13/0 run whole and alone.
  U: whole suite 54,226/0.
  - Done: (a) paper tabs across the top instead of the left page's list of groups, each tab across both pages (B
    `settings_review`, `settings`, `battle_settings`); (b) every setting named by a heading with a sentence under it (B
    `settings_review`); (c) the controls drawn on the page: a choice circled in ink, on/off a tick box, a level a ruled
    line with a seal; the same real controls, keys, values and saving (B `settings_review`, `settings`); (d) drawn
    option icons, Music performance's Original and Ensemble among them (B `settings_review`, `music_performance`); (e)
    "Before you set out" before a new journey's story, with every setting that shapes ordinary play; a change there is
    the journey's (B `settings_review`, `create`, `ui`, `records`, `old_saves`); (f) Sound › Voices says why no line is
    spoken yet (B `settings_review`); (g) the spoken-word highlight: it existed (Settings › Audio) but showed only when
    the device had a Japanese voice; now always shown, its own setting, on another tab from Word help (B
    `settings_review`).
  - Not done (by design, later): voices on by default with recordings / device voice / none, when the recordings ship.
    Not heard or seen by a person here; layouts seen in captures (docs/screenshots/settings/).
- [x] XP124 LI, the Ledger, items and their slips (Robin, 2026-10-16). VALIDATION.md "LI". B `ledger_li` (30 checks)
  passes, and so does the browser regression on this build (22 suites; four needed a fix first: VALIDATION.md "LI").
  - Done:
    - (LI-1) Change… on each slot, in the Equipped list and under the portrait: a short list of what fits, the worn one
      ticked, and Nothing (B `equipment`).
    - (LI-2) A drawn 16-px icon for each of the 131 items, unique and well formed (U `item_art`; R contact sheets).
    - (LI-3) One family of award slips for items (quest rewards too), keepsakes and recorded moments. Each has its
      icon and name, one sound, a 6–7 s hold that pauses while pointed at, a close button, the gold flare and the
      slide-in. A glowing "new" mark sits on the Ledger and the Satchel. A moment has its own sound (B `ledger_li`,
      `keepsakes`, `audio_levels`).
    - (LI-4) The dialogue strip rises into place (B `ledger_li`).
    - (LI-5) Coloured ribbons for Journey's, Map's and Company's pages, tags on a phone; no empty "Contents";
      "Practice" everywhere; Save & Load on the cover with a slip of its choices (B `ledger_li`, `folio`,
      `settings_access`, `title_ledger`).
    - (LI-6) The Route chart: taller, zooms, drags, names that fit or wait to be pointed at, a pulsing ring with the
      name of where you are (B `ledger_li`, `quest_guide`, `manybridge`).
    - (LI-7) Known details: the pin note in ink, People notes across the page saying where in the town, people marked
      on the diagram, a key in three groups (B `ledger_li`, `world_living`; U `known_spots`).
    - (LI-8) The narrator's reference readings counted and planned in PRODUCTION_ESTIMATE.md §1b (R; nothing
      recorded).
    - (LI-9) Pointing at a word marks its counterpart while Highlight is on (B `ledger_li`).
    - (LI-10) No dish behind a drawn icon on the Satchel's detail page (B `ledger_li`).
    - (LI-11) `index.html?dev=items`: every item's icon at four sizes. Only Reedwake's at first, the later places
      behind one button; descriptions on request (B `ledger_li`).
    - (LI-12) Hover pairs in two tiers:
      - words (nouns, verbs, keigo, pronouns) in amber;
      - grammar (particles, the copula, endings such as ～ない "won't" and ～ましょう "Shall", conjunctions) in blue
        with a dotted line.
      - Evidence: U `speech_align` 25/0; B `ledger_li`, `speech_mark`, `dialect_kansai`; coverage in VALIDATION.md "LI".
    - (LI-13) The Words section headers are headings: larger, ruled, with Japanese and English (B `ledger_li`).
  - The "My Learning", "Reference" line was not cut off by mistake: Robin meant LI-13. Nothing here has been seen or
    heard by a person; captures only. The grammar pairs are not checked by a native speaker.
  - Reduced motion is respected throughout (B `ledger_li`).
- [x] XP125 AG-1, the dialogue highlight's grammar (Robin's review packet, 2026-10-16).
  - Records: VALIDATION.md "AG-1"; docs/review/align/AG1_REVIEW.md.
  - Reconciled: the packet's candidate fixes are kept, and its six open requirements are implemented:
    - English word parts shared part by part (私+です → "I'm", 私+の → "my");
    - noun + verb as one English word (雨が降る → "rains");
    - several endings on one word (食べたくない → "want" + "not");
    - obligation, no obligation, しか…ない;
    - constructions recognised before their endings.
  - Every word is linked, explained (word help's "In this line"), or "Not worked out"; no blank is filled with an
    arbitrary English word.
  - Hover and the spoken mark read the same relations.
  - Reviewed alignments are keyed to the displayed pair, with the rules as fallback.
  - Evidence:
    - U: the packet's harness 34/34, `speech_align_ag1` 56/56, `speech_align`, `align_registry`;
    - B: `speech_relations`, `ledger_li`, `speech_mark`, `dialect_kansai`;
    - R: held-out real-line samples.
  - Open: there is no native-speaker review. Unresolved patterns are listed in AG1_REVIEW.md, and the reviewed
    alignments cover five lines.
- [x] XP126 ST-2: the new journey's learning step uses the Settings book's circled choices, drawn icons and on-page
  slip (Robin, 2026-10-16). VALIDATION.md "ST-2". B `create` 383/0, `settings_review`, `title_ledger`.

- [x] XP127 The voice batch's generation inputs, after C-95 (Robin, 2026-10-16: "publish the exact source commit,
  frozen production manifest and agreed recording-key/schema contract for Local"). Records:
  docs/future/voice/production/ (READINESS.md, PRODUCTION_SCOPE.md, VOICE_DELIVERY.md, GO.json); VALIDATION.md "C-95
  corrections".
  - Done:
    - the manifest is built from the corrected script: 14,721 recordings and 9,095 reference readings and phrases;
    - companions are attributed through their branches;
    - the player has Voice A/B, each High/Low;
    - Kansai is recorded where it differs;
    - names are given in kana, seams as the reading the line means, and particles as said;
    - frozen audition texts are kept;
    - the go signal names the commit (U `voice_production` 23/0; `production_manifest.mjs --check`).
  - Not in this batch: the 116 lines with the player's name (C-93), and the 12 deferred findings, which are Robin's.
- [~] XP128 VR-1/VR-2, the recorded voices in the game: "plays the selected cast without installing Japanese system
  voices, manually importing a voicebank, or downloading the entire corpus before play". The record is
  docs/future/voice/production/VOICE_RUNTIME.md; VALIDATION.md "VR".
  - Done (B `voice_runtime` 9/0 with synthetic recordings, no Japanese system voice):
    - per-scene indexes and content-named stable URLs;
    - a bounded lookahead;
    - a persistent cache of the game's own, bounded and cleared alone, whose failure never blocks;
    - None, Mute and a zero level fetch nothing;
    - the player's voice and pitch, and Kansai;
    - the text-hash check;
    - every speaking control plays recordings without a device voice;
    - the voiced offline package plays from `file:`;
    - AG-1's highlight follows a recording's clock (an estimate, documented; measured timings can come later without
      re-recording).
  - Not done: real recordings; `HOSTED_BASE` (Robin's host choice); browsers other than Chromium; phones.
  - VR-C1 (XP130) corrected the lookahead, the speculative queue, index recovery, the checks on kept copies, the
    bookkeeping and the cache writes.
- [~] XP129 Hosting: the runtime-only publishing set and the byte report (Robin, 2026-10-16). The record is
  docs/hosting/RUNTIME_PUBLISHING.md; VALIDATION.md "Hosting audit".
  - Done:
    - the unpacked Pages artifact was audited: Pages publishes the whole branch, 1,072,095,009 bytes, and the "not
      deployed" lines were corrected;
    - the runtime-only set (625 files, 523,674,397 bytes) is prepared and served on its own (B `runtime_publish` 3/0);
    - the voice estimate is about 665 MB;
    - the combined total is about 1,188 MB, so the voices need their own same-origin site;
    - development evidence is kept in the repository, nothing deleted.
  - Not done (Robin's): the Pages setting for the runtime-only set (draft workflow, inactive), and the voice repository.
- [~] XP130 VR-C1, Astra's voice runtime audit (relayed by Robin, 2026-10-16): "reproduce the important cases against the
  full current module before applying narrow corrections". The record is VALIDATION.md "VR-C1".
  - **Reproduced first:** on the module at 131918a (U), the harness's 30 cases gave 21 failures; all nine of the packet's
    adverse cases failed, its controls passed.
  - **Done** (U `voicebank_vrc1` 33/0, `voicebank_plan_content` 7/0, `publish_guard` 10/0; B `voice_runtime_vrc1` 7/0
    and `voice_runtime` 9/0, Chromium, synthetic tones):
    - lookahead plans only lines that will certainly come, from the runner's position. It follows a choice only once it
      is made and never goes past an end or a false condition. It reads conditions without side effects (`RB.state.peek`)
      and stops at battles, lessons, hooks and the like. Speaker, Kansai, A/B and High/Low are unchanged;
    - one speculative queue for the game: one transfer at a time, behind the line asked for, dropped and aborted when
      obsolete, never the line on screen's; an abort is no failure;
    - a failed index load is retried with a back-off on the same page;
    - kept copies are checked by size and SHA-256 (or the name's hash), and a bad one is replaced;
    - the bookkeeping is merged under a Web Lock across tabs, reconciled with what is kept once a session, includes
      indexes and overhead, and survives quota errors within its own cache;
    - cache writes are never waited for;
    - the reference index is deferred behind the dialogue (measured: 1,873,440 bytes, 660 KB gzipped);
    - stable recording URLs, and the stale `<build>` example corrected;
    - the size guard (`tools/publish/site_size.mjs`, 900,000,000 bytes), in `prepare_runtime.mjs`, `voice_site.mjs`
      (which measures the whole site, retention included) and the inactive draft workflow;
    - the voice site keeps the current build and the one before it; older files are pruned only on request.
  - **Not done:** real recordings heard; Firefox and Safari (not installed here); phones; `HOSTED_BASE` (Robin's host
    choice).
- [~] XP131 FR-1, the Foundations clarity pass (Robin, 2026-10-17): "Prioritize a clearer, more rewarding early learning
  path without holding up exploration. Preserve handwriting as a first-class way to play. Default new journeys to
  no-punishment assistance while preserving explicit choices, existing saves and separate tactical difficulty." The
  record is docs/review/fr1/FR1_REPORT.md (F01–F17 dispositions, screenshots) and VALIDATION.md "FR-1".
  - **Done** (B `fr1_opening` choices and pen to the end of the boss, `fr1_defaults` 15/0, `fr1_targets` 24/0,
    `fr1_group_sample`, `create` 384/0, `settings_review`, `learning_ui` 15/0, `combat_ui` 7/0, `encounters` 10/0,
    `story_ch1` 8/8, `quest_guide`, `settings`, `pace` 13/0; U `fr1_foundations` 25/0, the full unit run 54,430/0):
    - new journeys default to Assisted mistakes at every level; an explicit Standard is kept; tactics separate; a save's
      own setting kept, a missing one defaulted (F17);
    - a shorter Learning step and a summary-first "Before you set out" that names anything unusual (F05);
    - kana introduced just in time for the task that needs them (the gears: よ ん, not the h row; the loft lantern:
      nothing new), rows show only what is still new (F01, F02);
    - Foundations options made of met kana (F03); single-kana feedback at its own scale (F04);
    - the letter quest, the report stage in any order, the Journal turning to the followed quest (F06–F08);
    - "Add character" on the pad (F09); help lines that name the help (F10); letters with English recorded as
      supported context reading (F11);
    - a tap on a lantern's drawn lamp uses it (F12); battle cards lead with "Here:" (F14);
    - compound labels break at a soft hyphen, Back stays whole (F16);
    - the boss and a group battle finished on Foundations + Demanding + Assisted; no rebalance (F15);
    - 0 new spoken lines; the production manifest unchanged (65cd38053ad6); Local's batch untouched.
  - **Corrected (FR-1V, Astra's verification of 71d4a95):** a one-kana blank credited its parent word as independently
    answered (and a slip on it set the word back). Reproduced (U 23 failures, B 10, on the old source and build), fixed:
    the blank assesses the kana and records the word as supported exposure only; saves unchanged. U `fr1_partial_word`
    39/0, B `fr1_partial_word` passed; U full run 54,469/0; B `learning_ui`, `practice_a_lamps`, `fishing` passed.
    VALIDATION.md "FR-1V".
  - **Not done:** (F13 is done: AR-1 Mill, approved by Robin, docs/review/ar1_mill/); Firefox
    and Safari; phones (emulated only); a real beginner's play; the letters' "met before" note seen in a browser.
- [~] XP132 MW-1, the mill follows the gears (Robin, 2026-10-17): "any travel tile that acts as a door or elevation
  change should be walkable to traverse them … The grindstone should remain inanimate until the gears are fixed … The
  Mill echo should not be optionally avoidable … The wheel outside … should state why it isn't moving in a way to nudge
  players upstairs. The ladder could fall down with a thud … If the basement is blocked prior to the gears being fixed,
  it should be obvious why and how they're then made accessible by this action." VALIDATION.md "MW-1".
  - **Done** (U `mw1_mill_flow` 100/0; B `mw1_mill_flow` all passed; `ar1_mill_art` U 12/0, B 20/0; `story_ch1` 8/8):
    - the mill's stairs and ladder are walked onto. The stairs are shut until the gears are mended, and say why (the
      flooded pit, the stopped gears). The ladder drops with a thud in the gears scene, after the line that drains the
      pit;
    - the millstone is still until the gears are mended; the wheel's look after the gears points to the loft;
    - the Mill Echo meets you coming down from the loft, and its approach spans the room. After a defeat, every way to
      the door or the stairs meets it again (B);
    - 19 stairs, ladders and doors that played a scene when used are walk-on exits. The Steam Vents and stacks doors
      say why they are shut;
    - voice: a narrator-only, append-only supplement (6 lines, 1 reference, 3 retired); GO and the batch untouched.
  - **Not done / Robin's call:** the cases listed as discrepancies (threshold prompts, vehicles, the stage lift, bath
    curtains, stairs that lead nowhere, the stacks key door, the lockhouse hatch); checkpoints on scene exits; Firefox,
    Safari and phones; recording the supplement (after the batch).

- [~] XP133 Wataru's line and a listening page (Robin, 2026-10-18, relayed by the local worker): "instruct the Cloud
  chat to help you reconcile Wataru's line and then Cloud should provide me a listening page for anything needing
  review". VALIDATION.md "Wataru's line reconciled (SC1) and Robin's listening page".
  - **Done** (U `voice_review_page` 24/0; B 15/15 on a scratch folder of tone files):
    - SC1: `r1-6ab18b4d8dcef181` keeps its id and is sent as 「やめさせないんですか。」, aiming at about 1.67 s
      (`supplements/SEND_CORRECTIONS.json`, VOICE_DELIVERY.md §7 step 8);
    - `docs/future/voice/production/run/REVIEW_LISTENING.html` (`tools/voice/review_page.mjs`): all 151 recordings to
      review, played from the batch folder by relative path. Keep / Redo / an earlier take, with notes and "Copy my
      decisions". No audio in the repository.
  - **Not done / with others:** Robin's listening and decisions; the real audio in a real browser on Windows (not
    tested here). The new take is recorded (the worker, a541476: 1.24 s, flagged, three earlier takes kept), and the
    committed page is rebuilt from that list.
  - **Send corrections SC2 and SC3** (Robin's listening decisions, 2026-10-18; VALIDATION.md "Send corrections SC2 and
    SC3"): the narrator's 「「潮硝子」の札を拾った。」 sent with ふだ for 札, and Nao's 「……舟、か。……」 sent without the comma;
    the same ids, appended to `SEND_CORRECTIONS.json`. VOICE_DELIVERY.md §7 step 8 widened to one word as its reading or
    a comma left out. U `voice_review_page` 44/0; the listening page rebuilt. Recorded by the worker (ec82501: SC2
    1.815 s, SC3 3.62 s, both with `send` and `sendCorrection` in results.json.gz). **Not done / with the worker:**
    Robin's listening to the takes that may share the faults (listed in READINESS.md).
  - **SC4 and reference readings left to the device's voice** (the worker, after Robin's review round 3; VALIDATION.md
    "SC4, and reference readings left to the device's voice"): the narrator's 潮止まり sent as シオドマリ, appended to
    `SEND_CORRECTIONS.json`; §7 step 8 names katakana and references. A results file's top-level `withheld` names
    reference readings `voice_site.mjs` leaves out (counted apart; only manifest references, never also recorded); the
    game says them with the device's voice, or hides the control. U `audio_voice` 46/0, `voice_production` 27/0,
    `voice_review_page` 52/0. Since: SC4 recorded (be13b33); Robin kept the narrator's closest takes for 大石, 母港 and
    三里 and the cloned 分類名 (round 4), so nothing is withheld.
  - **SC5–SC9** (Robin's final listening round, 2026-10-19; VALIDATION.md "SC5–SC9"): 頁, 灯守, 台詞 ×2 and 釉 sent in
    the kana of their furigana. U `voice_review_page` 89/0. **Not done / with the worker:** recording them; restoring
    the kept cloned 分類名 (READINESS.md, 2026-10-19).
- [~] XP134 CW-1, the traveller's setup book (Robin, 2026-10-18): "Implement CW-1 from this package … The demo is a design
  and interaction reference, not a replacement for the game's real creation, Settings or save systems. Keep Local's
  voice production unchanged. Return the actual-game before/after and motion evidence, then wait for my approval before
  pushing or deploying the candidate." VALIDATION.md "CW-1".
  - **Approved by Robin and pushed** (2026-10-18: "Looks good … You can push the changes you prepared here"; the
    candidate `cw1-candidate` merged into the task branch, no deployment). B `cw1_setup_book` 86/0 (F01–F18, F20, M01–M18; F19 by `settings_review` §4b and `old_saves`);
    U `cw1_leafturn` 41/0; the creation-touching suites pass on the candidate build:
    - five steps (Identity, Appearance, Background, Learning, Summary); the Summary is the review, and nothing opens
      after Begin on a new journey (New Game+ keeps its review); Begin builds and starts one campaign;
    - Learning on two pages: Your Japanese (four starting points with their descriptions, placement, Kana so far for F);
      Your journey (Answering, Learning mistakes and Tactical challenge always shown; the Reading preferences fold);
    - the Summary: the traveller and how the journey will play, with Edit to the exact group (Return to summary;
      Identity four leaves back); Sound and More journey settings open Settings as a draft applied once at Begin, with
      previews rolled back on a teardown;
    - printed leaf turns to the motion contract (360 ms; 230/180/155 ms per leaf for 2/3/4; 12 ms gaps; 40 ms settle),
      direct with Reduce motion, the flat book, a narrow window or no animation support; Escape, resize, a hidden tab
      or Reduce motion settles at once; folded corners (pointer only) and restrained CSS-drawn ornaments;
    - every field kept with its backing key: docs/review/cw1/FIELD_INVENTORY.md;
    - voice production unchanged (the manifest from the candidate is byte-identical to the task branch's; narrator
      delta 0); no AR-1 or other art mixed in.
  - **Not done / Robin's call:** one leaf measures +13–19 % over its 400 ms from
    the first leaf frame to the live page in this software renderer (several leaves +6–7 %); Firefox, Safari, Windows,
    a GPU browser, phones and screen readers untested.
- [~] XP135 The repository cleaned and the voices gone live (Robin, 2026-10-19, relayed by the local
  worker): "get these redos sorted, then push the voices live"; "Ask Cloud to set up the Github properly. This includes
  removing screenshots, test builds, and other unnecessary files … See the size difference after that and, if it still
  exceeds the limit, have it set up the new Repo". VALIDATION.md "The repository clean-up, and going live prepared";
  docs/hosting/RUNTIME_PUBLISHING.md (2026-10-19).
  - **Done:** screenshots, listening media and review captures out of the branch (2,055 files, 479.8 MB; the history
    keeps them, 185ad9c); 1,085.8 MB → about 606 MB published. This replaces 2026-10-16's "keep all development
    evidence in GitHub" for the published branch. About & credits says where the voices come from and credits them
    (B `title_ledger` 18/0); U whole suite 54,725/0 on the cleaned tree. The voice base checked in a github.io-like layout (scratch, B). The voices' site layout,
    build id (`vb1-3c59018e3137`), README and the worker's commands are written down.
  - **Live:** the worker created A-Birdi/Road-of-Borrowed-Names-voices with Robin's GitHub CLI (creating it here was
    refused, 403) and published the voice site (build `2026-10-19.1`, 559,963,914 bytes); `HOSTED_BASE =
    '../Road-of-Borrowed-Names-voices/ja-JP/'` set and pushed here (B `voice_runtime` 9/9, `runtime_publish` 3/3).
  - **Since:** one "speak automatically" switch in Settings › Audio, the one in effect (Robin: there were two); B
    `voice_runtime` 10/10, `settings_review`, `speech_mark` pass.
  - **Not done / Robin's:** a play-through on the live URL (not reachable from this session; Robin's in-game test).
    No Pages setting needs changing; publishing only the runtime set stays Robin's choice.
  - **Stage 1 of the remaining recordings (voice build 2026-10-20.1, the worker's CL-041):** CC-007 and CC-006 pick up
    SL1 574, SL3 1,292 and the SC10–SC14 redos (U-style static check `tools/voice/site_pickup.mjs`, all resolved in both;
    B scratch harness: all 1,871 lines resolved by the game's own lookup, seven samples played). 2,654 recordings are
    stage 2 (SL4–SL9). VALIDATION.md "VB-1".

- [~] XP136 Every line spoken, with properly highlightable text, Records too (Robin, 2026-10-19): "every line in-game
  should have spoken lines with properly highlightable text as well. This goes the same for the Records section,
  especially because it already has lines usable"; "Other unvoiced lines may not be read without the voice IDE
  installed locally, like the closed door in Reedwake. The Narrator can effectively read that one; check for others
  similar"; "The swinging board between Old Yasu and Ren in Reedwake, along with its clamp - no Narrator speaking. Old
  Yasu's story, when listening, has not begun being spoken." VALIDATION.md "Every line spoken: the first batch".
  - **Done (code, tests):** the prologue's six captions, Records replays, shut doors and marked objects (the Old Mill's
    notice among them), every line of the six field puzzles (the swinging screen and its clamp among them), every
    oral-history fragment and every battle line (intro, the line once settled, phases) are shown under stable scene ids
    and listed for recording; the prologue and replays are spoken lines in their slip (marked word, pointing pairs,
    Voice). B `spoken_lines` 6/6 against a test voice site built from the script; U whole suite 54,725/0, `fieldweave`
    390/0, `voice_production` 27/0, `combat` 2,100/0, `battle` 19,927/0.
  - **Recordings: Local's.** 574 in supplements/SL1_SUPPLEMENT.json (narrator 515; Yasu, Tetsu, Kasane, Isao, Oyone).
    Until then these lines stay silent with prepared voices. SC10 (Nao's 葦 read "goku") is Local's too.
  - **Also from the playtest:** the writing pad keeps one size while a character is written in a desktop window (B
    probe; a phone still changes, recorded in VALIDATION.md); Voice A / Voice B labelled more feminine / more masculine
    (R); Pat brings the pet's picture into view and shows its line (B probe).
  - **Second batch, 2026-10-20 (VL-1; done in code and tests):** the lines the game's own code shows are shown under
    scene ids and listed. That covers the companion's remarks, thoughts, place talk and What We Keep, The Pages We
    Keep, the exploration actions' rules, expeditions, stamp stands, sealed spots, the New Game+ farewell, a press
    reader's reaction, the case's viewpoints, letters' acknowledgements and a speaker's simpler version. Company memory
    replays keep their scene ids. Fishing, word play, the verbs sheet and the Weave's look slip are spoken panel lines
    (Voice, the marked word, pointing pairs). Code-shown lines listed: 2,968 (1,381 before). U whole suite 56,144/0,
    `spoken_sites` 24/0; B `spoken_lines` 24/0. Recordings: SL4 (1,779) is Local's. The inventory of every surface,
    and why the rest is not spoken, is in docs/future/voice/SPOKEN_SURFACES.md.
  - **Not done:** SL5 (in progress): battle lines beyond intros, phases and settled lines; encounters; Shared
    memories' replies; the Log; hanafuda calls; the ask-back questions. Robin to decide: reading tasks (customers'
    orders, letters' text) and the player's reply choices.
- [x] XP137 The Stamp Book after Robin's Chapter 1 playtest (2026-10-19): the field-guide stamp's words say it counts a
  region's roaming kinds and not its bosses; a "Stamp pressed" award slip in the Item Get family; "The cellars drained"
  veiled until Chapter 2 (a different place from the Mill's basement); a "Field guide" section; Chapters, People helped
  and the Field guide in story order 1–12 without repeats. U `stampbook_sb1` 39/0 and the related suites, B `records`,
  `ledger_li` (VALIDATION.md "Playtest fixes: the Stamp Book, revisits, Sae"). Not done: a slip for stamps the book
  presses later; the road stamps' order.
- [x] XP138 Revisits say what fits the time (Robin, 2026-10-19): at a routine's place the routine's line replaces talk
  from before the routine began (Oto, Mame, Kiku after Chapter 1), quest steps, gifts, open quests' reminders, change
  beats and later lines still said; Sae asks for the gear pin only until the wheel turns. U `routine_talk` 318/0, B
  `living_world` 9/0 (RV-2, RV-3).

## Evidence index (see VALIDATION.md for commands and dates)
- [~] XP139 Road events stand on the road (Robin, 2026-10-19: "These random events on the paths should have actual NPCs
  where the event is meant to take place, along with any relevant props. It should not force you into the interaction as
  soon as you enter"): all 66 events placed, nothing run on arrival, met by going to their people or things; a named
  person never stands twice. Robin, 2026-10-20: live for Robin to judge in play; how often events come stays as it is,
  since meeting them is now the player's choice. U `road_events` 1,007/0, `overworld_geometry` 3/0, B `living_world` 9/0 (VALIDATION.md
  "Playtest fixes, second round"). Robin's look still to come.
- [x] XP140 The route chart's coastal places stand on land, Kotonoha on its island; ferries cross open sea. U
  `chart_coast` 16/0.
- [x] XP141 A map without music plays its surroundings' song on a load or from the title, never the title's. B
  `music_inherit` 8/0.
- [x] XP142 Heat's extra force goes through a ward word, a standing ward taking it first; one Demanding group rebalanced
  to keep the difficulty curve. U `combat_rules` 248/0, `combat` 2,107/0.
- [x] XP143 A "Stamp pressed" slip for stamps pressed at a stand or by the book itself. B `records` 7/0.
- [~] XP144 "Have you seen…?" spoken: question and answers under `code.wb`, 806 lines listed for recording, once for
  each speaker. B `spoken_lines` 7/0 (Tomo's answer heard from its recording). SL3 supplement: 1,292 recordings to
  make (docs/future/voice/production/supplements/SL3_SUPPLEMENT.json); the recordings themselves to come.
- [x] XP145 Battle icons drawn for moves and responses (IC-1; Robin, 2026-10-20: "The battle icons are perfect"): 31
  drawn 16×16 icons (14 moves, 17 responses) on the response cards, the Intent card, the badge by a creature's name and
  the "New move" note; ほのお shows the candle. B `combat_ui` 7/0, U `item_art` 6/0, `combat_rules` 248/0.
- [x] XP146 The bridge cutscene after the Mill's boss (AR-3; Robin, 2026-10-20: "The cutscene has improved
  substantially, push it"): blue water in both bridge shots; the river's moving lines only on the water; a spit of
  land under the hut and the bridge's far end; Kōji's cup on his own arm; hands along the forearm
  (`RB.portraitBody.elbow`); Kōji over the shoulder in the close shot. U `sequence` 499/0, `portrait_speakers` 6/0; B
  `sequence_chapters` 121/0 (VALIDATION.md "Approved art: the bridge cutscene and the battle icons").
- [x] XP147 QA (Agnes, independent tester, via the QA issue, A-Birdi/Road-of-Borrowed-Names#1): RBN-QA-001: the
  Voice button and Settings › Following along describe the recorded voices, with the device's voice as the fallback;
  RBN-QA-002 (a suggestion): an empty stamp stand points to the Stamp book's criteria. In source (`7797ba7`,
  `4e144ec`); U `stampbook_sb1` 39/0, `records` 272/0, `spoken_sites` 24/0. RBN-QA-003: travelling alone, a move
  aimed at both is told as aimed at you (`intentTextSolo`, `ec9746e`); U `telegraph_solo` 13/0. RBN-QA-004: Two Names'
  "Go to the Lantern Hall" step targets the hall (its stage names the map), so the guide marks it and says "Go to Lantern
  Hall." instead of the waiting nudge; U `quest_guide` 150/0, `quest_guide_live` 56/0. RBN-QA-005 (the owner's feedback,
  relayed): in the Lantern Hall the four companions walk in through the door after you, one after another, and settle
  round you before the gathering's first line (they had appeared in the room at once); Skip and reduced motion end in
  the same places, and coming back in plays nothing again (`!refresh arrive`, `e3444b9`, `8557bee`); B `hall_entry`
  16/0, `staging_chapters --ch=1 --only=rw.hall` 173/0. RBN-QA-007: before Genzō takes you up, the lighthouse stairs
  step you back and say why (a locked exit, the shut-door pattern; the gate is unchanged; one narrator line in SL6;
  `f47bbe2`); B `lighthouse_top` 106/0. RBN-QA-008: the Foundations tide exercise presents its 3:00 as Shiori's rounding
  of the table's 3:15, answers unchanged (`0942dd3`); U `foundations` 92/0, `answer_sweep` 22/0. RBN-QA-009: Tetsu's
  offer of his story opens "Back from the drowned archive, are you." once the archive is done (one Tetsu line in
  SL7); B `staging_chapters --ch=2 --only=sg.tetsu_history` 23/0. RBN-QA-010: Fuku says one of her two recorded
  weather lines, the one for the wind as it is (she said both once it was back); B `staging_chapters --ch=2
  --only=sg.fuku_idle` 17/0. RBN-QA-001 to 005, 007 and 008 are in CC-005's build (`507c11a4…`); 009 and 010 are in
  source, for the next build. RBN-QA-012 (its copy note): a keepsake's slip names the page as the Journey shows it,
  "Journey › Mementos › Keepsakes" in twelve-chapter journeys ("Journey › Keepsakes" in six-chapter ones); B
  `keepsakes` 33/33, `ledger_li` (all); its prop art (the crossroads signpost's three arms) is a queued art
  candidate. RBN-QA-011 (HIGH, a twelve-chapter journey after Chapter 2; every new journey in the shipped game is
  one): the way on is Tetsu's ferry east to Manybridge (the north road stays washed out until Manybridge's chapters are
  done, `mb2_done`; gate and order unchanged), but the Chapter 2 journal and Omi said "north to Cinder Orchard", and
  at the fork Suzu's "then east" read like the fork's east road (which walks back to Reedwake). Now, in a twelve-chapter
  journey until `mb2_done`: the journal says "A new line on the ferry board: east. Ask Tetsu at the harbour."; Omi
  names Tetsu's ferry and the night at the Gull (a new line; his recorded north-road line is kept for six-chapter
  journeys and after `mb2_done`); his later north-road line is not said; at the fork the narrator says Manybridge is
  the harbour ferry's, not a walk (a new line), and the journal is corrected once (`mb_east_noted`), which puts right a
  save from before the fix. Two new recordings, in SL8. B `route_after_ch2` 29/0 (twelve chapters through Tetsu's
  ferry; an old save at the fork; six chapters; after `mb2_done`; each through a save written and loaded again);
  B `staging_chapters --ch=2` 1678/0, then `--only=sg.omi_final` 25/0 and `--only=sg.ch2_end` 71/0 on the final source;
  U `mb_ch3` 76/0, `quest_guide` 150/0, `travel_rules` 699/0, `voice_production` 27/0, `spoken_sites` 33/0. In source,
  for the next build. RBN-QA-014: in the Tally Exchange mediation, Suzu's "Break the tension" could come before the
  tally (c3) or Gonta's word (c4) and named the east storehouse; her line now names no storehouse ("Rice that slips off
  without a word? It's even quieter than Gonta."), its effect unchanged; English only, in no recording list; U `mb_ch3`
  78/0 (a check that no companion line said before c3/c4 names the storehouse, and that the joke still opens Gonta),
  `encounters` 184/0; B `manybridge` 3/0. In source, for the next build. RBN-QA-018 (its flow defect, found while
  staging it): with Sōbē's referral (step 2) Manbē's talk went straight to the rehearsal, so his introduction
  (mp.manbe_first, recorded) never played and step 3 was skipped; his talk now gives his first scene at step 2 and the
  rehearsal again from step 3; U `mp_ch4` 124/0 (the talk at each step; the old condition fails it), `quest_guide`
  150/0; B `manybridge2` 4/0; browser: step 2 plays the introduction, then the rehearsal, step 2 to 3 to 4, Skip the
  same. In source, for the next build; the rehearsal's staging (on the stage) and the dress rehearsal's actors on the stage (Agnes 08:38Z) are gated candidates. RBN-QA-019: Tomi's
  lantern task (Foundations and Elementary) read only object-first (ちょうちん を → place → つるして ください); place-first,
  the same placement, was "outside what this can read". Each of its four families now also reads place-first, through
  the answer space's own `also` (task-local; no parser change, no new piece, the same family and result, the wrong
  river order now gets its why); the verb first stays outside; the I/A form is unchanged. U `mp_ch4` 138/0 (14 new; 8 of
  them fail without the fix), `settle` 79/0, `practice_b` 96/0, `answer_sweep` 22/0, `evidence` 24/0; in the browser's
  Pieces, place-first is now accepted. In source, for the next build. RBN-QA-021: a printed Notice was called a
  story: three press readers' rules a notice can reach spoke of a story (Hana's, Masa's soba line, Kansuke's), and the
  press's result note said "the story itself"; each of the three now carries `byKind.notice` (the same rule, worded for
  a notice; who reads the page is unchanged, a story keeps its SL4 words), and the note names the kind (`8132972`); U
  `press` 52/0 (every composable notice × 3 places: no reader calls it a story; the readers chosen equal those chosen
  without the wordings; 3 fail without the fix), B `manybridge2` 4/0 (the press's note and its readers; fails on the
  previous build); voice SL9 (3 recordings). In source, for the next build. RBN-QA-022: with the chronicle's desk the
  last clue, the synthesis played in the hall with the square's lines; now in the square at once, off the square on the
  next entry to the village, at the desk staged there and on into Tokiwa's chronicle; no line new (`d357e96`); B
  `cinder_clue_order` 40/0 (CC-005 fails 14). RBN-QA-025 (HIGH): once the glass seal was broken the Great Kiln's doorway
  stayed solid (the house had no way in; a separate exit on its tile could not be walked onto) and the guide named the
  festival's lookout; the house's door is now the way in, shut by the seal until broken, and the step names the seal,
  then the kiln (`374196e`); B `kiln_door` 15/0 (CC-005 fails 7). RBN-QA-009 to 011, 012's copy, 014, 018's flow, 019,
  021, 022 and 025 are BUILT_AND_DEPLOYED in CC-006 (`13d8af2`, `79e0ef32…`; VALIDATION.md "Candidate CC-006").
  RBN-QA-028: Shino's tray thanks and Nao's hint wait for the invitations to be sorted (`53770cf`, `76352e5`); B
  `shino_thanks` 28/0 (CC-005 fails 4). In source, for the next build. Language audit T01 and T02 (Robin's approval, revised per Agnes 13:33Z): the
  taught same-sound kana (じ/ぢ, ず/づ, ジ/ヂ, ズ/ヅ) asked by base kana and dakuten, real words only, a same-sound note,
  accept lists unchanged; the kanji exam names the target's place among a word's kanji, distractors outside the word;
  U `kana_homophones` 1463/0 (the unfixed source fails 893), B `kana_homophones` 174/0 (CC-006 fails 77); voice none.
  T01, T02 and RBN-QA-028 are in candidate CC-007 (`343f54b8…`, built from `026965b`), READY_FOR_QA.
  T02's counting is said in the question (Agnes 15:43Z/19:41Z): a word with 々 counts characters, each kanji and the
  repeat mark as one, the mark not shown when it is the answer; kana are not counted; U `kana_homophones` 1466/0,
  B 208/0 (CC-007 fails 4). In candidate CC-008 (`203e2bd3…`, built from `45fb382`), READY_FOR_QA.
  RBN-QA-033 (Robin approved 2026-10-20): between Cinder Orchard and Snowbell the Journey's "Now" names the way on
  ("The road on": west to the Orchard Road, then north, until `sb_arrived`; then the climb to the hamlet, until
  `sb_hamlet_seen`); a main quest's `next`, checked by `validate.mjs`; no marker, gate, line or voice key changed
  (`54339ee`); B `road_on` 11/0 (CC-008 fails 4), `route_after_ch2` 29/0, `quest_guide` all passed; U whole suite
  57,664/0. In candidate CC-009 (`f9e42742…`, built from `0f5c3be`), READY_FOR_QA.
  RBN-QA-032 (Robin approved 2026-10-20 from the frames, to review in play): the festival lookout's vista shown as
  pictures over the lines that describe it (src/ui/42c_interlude_lookout.js, new art, provisional under AC-1): the
  village and its firebreaks, the stage and Hiro's seat (Suzu dancing unless she is the companion), the road and the
  snowy peaks; every other line on the platform; no line, voice key, flag or gate changed (`8cfedf2`); B
  `lookout_vista` (new; CC-008 fails 7). In candidate CC-009 (`f9e42742…`, built from `0f5c3be`), READY_FOR_QA.
  RBN-QA-036 (three-party AGREE at `bf4c0ef`: Cloud CC-039, Agnes 6306739023, Local CL-061): a tap on someone behind a
  counter with no free place beside them (Yae at Yukimiya, Sousuke at the post shelter's desk) walks to the counter's
  front and talks across it; the walk remembers whom it is for, and only a person who moved is tried again (a counter
  swapped or removed, someone else in their place: nothing happens); cherry-picked as `17591c4`, `1ddd834`, `3b63a2c`;
  B `counter_tap` 30/0 on a build of the merged source (src/tests/tools identical to `bf4c0ef`). In candidate CC-009 (`f9e42742…`, built from `0f5c3be`), READY_FOR_QA; Agnes's authored Yae/Sousuke UI retest still to come.
  RBN-QA-020, 048, 049 (three-party AGREE: Cloud CC-040, Local CL-065, Agnes 6307800434 at source/contract level):
  the festival night's walk to the rail with your companion (`!walkto` `cross`/`party`/`max=`), the coast road's fog
  event shows fog (`fog` ambience, `drawHaze`), the geese on the Reedwake road; each candidate's commits cherry-picked
  onto the integrated source (`0e4c46e`, `3515144`, `86b9d02`, `cad556c`, `cf7c24a`; patch-identical); B
  `walkto_options` 23/0, `fog_event` 14/0, `geese_event` 15/0 on a build of `cf7c24a`. In candidate CC-009 (`f9e42742…`, built from `0f5c3be`), READY_FOR_QA;
  Agnes's post-integration visual retest still to come.
  RBN-QA-050 and RBN-QA-039/040/042 (three-party AGREE: Cloud CC-042, Agnes 6308146009 / 6308182771, Local CL-067):
  the fare repaid seated then side by side (Kōji facing her with the book), combined kana boxes, the activities'
  next page from the top, っ/ッ/ー named in words; cherry-picked as `774511e`, `4731de8`, `cdf37db`; B
  `fare_pay_staging` 36/0, `learning_qa039` 44/0 on a build of `cdf37db`. In candidate CC-009 (`f9e42742…`, built from `0f5c3be`), READY_FOR_QA.
  RBN-QA-047 and the qa-049 refine (three-party AGREE: Cloud CC-043, Agnes 6308872303 / 6308920894, Local CL-070): the goat shed's
  stall dividers stand on its boards (`sb.goatshed`'s own legend: wood under the fence), and the geese have no face
  portrait (a creature drawn only by its own sprite brings none; `portrait_anim` green again); with the fog event's
  Skip seen and real-load tests (test only); cherry-picked as `748d593`, `dcec221`, `0f5c3be` (patch-identical, verified
  by Agnes 6309061501 and Local CL-072); B `goatshed_fence` 10/0, `geese_event` 15/0 and U whole suite 57,696/0 on
  CC-009's own file. In candidate CC-009 (`f9e42742…`, built from `0f5c3be`), READY_FOR_QA.
  RBN-QA-056 and RBN-QA-057 (three-party AGREE: Cloud CC-046/047, Local CL-084, Agnes 6311456994): a conversation with a
  creature in it (the Teller's Shadow and eight more) takes its social actions and the companion's gesture on the
  battle screen (no more TypeError on `card.word.lex` and re-triggered introduction), and a companion plan's look-ahead
  never acts on the live conversation; a press on a response card's Japanese words chooses that card (word-help tokens
  carry their own index), and the keyboard focus comes back to its card over a new deal; cherry-picked as `1d73c51`,
  `1dc8923`, `5879c31` (patch-identical to `2e598b6`, `4479bdd`, `2c73f5a`); B `social_battle` 65/0, `card_press`
  13/0 on CC-010's own bytes. In candidate CC-010 (`61c5c819…`, built from `5879c31`), READY_FOR_QA.
  RBN-QA-053, 054, 045, 051, 052, qa-024i and the fog test refine (three-party AGREE each; their integration verified by
  Local CL-087 and Agnes 6311710604): a load or a return to the title in the middle of a line takes the old line down
  (`campaign:changing`; a failed or cancelled load also ends a scene that had ended); the ruin's lanterns start the
  lighting once Hisae is met (`!if kr_hisae_met`, then `kr.moths`); the guide names the step in front of you (Snowbell's
  ice before the dial; on the Maple Ridge the stone, Hinata and Kikyō before the desk; `kr_main` 5's `kr.cave2` (22,4)
  until it is open; `sb_lamp` 7's star chart until the log is solved; authored `atIf`, data only); the Shuttered Hall's
  door shows its boards, rope and plaque
  (and opens with `lw_kr_hall_open`); the walk into the Keepers' Lodge to (15,12) frames the lamp and Hisae; the Great
  Kiln's doorway glass seal; the fog event's test setup; cherry-picked as `89f116d`, `8e9f2db`, `ca6cc86`, `feb146c`,
  `c3b1ac2`, `304fd60`, `4e9670e`, `19b5cd3`, `58133c0` (patch-identical; QA-051's renderer hunk is qa-024's, applied
  once), with `hall_door`'s onWall check as an allowlist (`cffd4ad`); B `fog_event` 26/0, `lodge_arrival` 40/0,
  `hall_door` 15/0, `kiln_door` 15/0, `ruin_lanterns` 31/0, `load_mid_scene` 19/0, `guide_next_step` 24/0 on CC-011's
  own bytes. In candidate CC-011 (`4b108ae2…`, built from `cffd4ad`), READY_FOR_QA.
  RBN-QA-055, 058, 059, 060, 061, 062 and the QA-039 Guide follow-up (three-party AGREE each, and on each test-only
  successor; their integration verified by Local CL-100/CL-102 and Agnes 6313970214): in a conversation the cards carry
  no battle "Here:" line; what the battle screen evaluates without acting (a card's preview, a companion plan's
  look-ahead) works on its own copies, so the 全体 chip raises no ward, `kr.moss_steps` with a plan set no longer
  throws and its step is applied once, and the rope and the bell turn back what was coming, each once; Wait in a
  conversation reads "Say nothing this time, and let the others speak.", its confirmation keeps the cost in view, and
  "They seem to have more to say." shows while the conversation's own Wait would bring something out; at night before
  the vigil the guide names Hisae at her lamp, or Ren on the ridge once Hisae has told you; the Guide's kana chart
  shows a combination in two boxes as the lesson does and names っ/ッ/ー in words; after the registers Mokichi, Sora
  and (when she is there) Kikyō are placed round the lamp and you walk to it before the gathering line, for that
  visit; cherry-picked as `6f8218c`, `574da26`, `5ce29ec`, `73de5cc`, `c85b992`, `c3c190f`, `99638e8`, `acd685a`,
  `b12a0e1`, `a42cf49`, `4ff01b7` (patch-identical); B `look_purity` 9/0, `social_preview` 14/0, `social_wait` 12/0,
  `guide_vigil` 9/0, `guide_kana` 11/0, `learning_qa039` 44/0, `lodge_evening` 16/0 on CC-012's own bytes. In
  candidate CC-012 (`cecaeb33…`, built from `acd685a`), READY_FOR_QA.
  RBN-QA-063, 065, 066, 067, 068, 069, 070, the `look_purity` hardening and the `lodge_evening` guards (three-party
  AGREE each, on the exact commits listed in HANDOFF's CC-013 entry): a companion who goes off in the quarrel is away
  at the lodge until the apology and comes back beside you; Ren's walk-off shows at once, and at the Ridge Light the
  ridge's Ren becomes the follower where they stood, one Ren at every frame; with the stacks' stairs shut the guide
  names the stairs in the Public Records Hall, and before the archive's catalogue the Receiving Hall before the inner
  door; Rokusuke's leaking cask lies tipped until it is stood upright; choosing a kana far down the Guide's chart
  reveals its stroke order once, at once, in the Guide's own page, with "Back to ‹kana› in the chart"; a
  conversation's first line docks at the top when it would cover the player or the speaker, with motion on as with
  Reduce motion (`world_view`, red since LI-4's `40d79ae`, green again); B `ren_apart` 7/0, `lodge_quarrel` 31/0, `lodge_evening` 16/0, `guide_stacks` 8/0,
  `guide_archive` 14/0, `road_oil` 14/0, `guide_reveal` 37/0, `world_view` all ok (20) on CC-013's own bytes. In
  candidate CC-013 (`9506f218…`, built from `f133f36`), READY_FOR_QA. RETESTED_BY_AGNES on CC-013 (`9506f218…`,
  6318120853): RBN-QA-067 PASS on one sampled route (the lower-row きゃ in the Guide's chart reveals its preview in the
  pane, both component animations visible; Back to きゃ returns to the same chart position; not every combination,
  keyboard or phone).
  RBN-QA-064, 071, 077, 073 and the `keeper_reveal` plate check (three-party AGREE each, on the exact commits listed in
  HANDOFF's CC-014 entry): arriving at Lanternfall, the valley below the town is shown over the arrival's lines; a
  picture up when the campaign changes (a load that works or fails, a new journey, the title) is cleared with it and
  drawn again when shown again; the Drowned Bell's Keeper rises out of the water and comes apart in pictures over the
  Bell Chamber's lines, the battle unchanged; a load in a battle's opening fade leaves no battle state, screen, music or
  darkening behind and the old start never resolves (a preparation question or task left on screen is RBN-QA-078, not
  covered; ordinary reachability of the race unproven); on the first landing at Kotonoha the great tree is shown over
  the two lines that describe it, a few large written gold leaves coming down clear of the tree; B `lf_arrival_view`
  79/0, `interlude_lifecycle` 12/0, `keeper_reveal` 69/0, `battle_start_abandon` 28/0, `ko_first_sight` 84/0 on
  CC-014's own bytes. In candidate CC-014 (`5dc39d09…`, built from `5fbdc0b`), READY_FOR_QA; verified live by Local
  (CL-126) and Agnes (6322726687).
  RBN-QA-072 and the RBN-QA-073 follow-up (three-party AGREE each, on the exact commits listed in HANDOFF's CC-015
  entry): taking Tetsu's boat to Kotonoha, the crossing's lines play over pictures from the boat (the coast falling
  behind over the stern; the open sea with gold leaves on the swell; coming back, the island and its great tree, the
  first sight's own shape, drawing away against the low sun); a picture's layers built ahead do nothing once their
  showing has passed (a clear, a load that works or fails, a newer showing, a different picture shown or asked for
  first), and layers built only ahead are released once; on the first landing the gold leaves are where the still
  picture has them from the picture's first frame; B `ko_crossing` 94/0, `interlude_ahead` 30/0, `ko_first_sight`
  87/0 twice, `interlude_lifecycle` 14/0, `sequence_world` `ko.garden` and `ko.end` 220/0 on CC-015's own bytes. In
  candidate CC-015 (`dcf8eb7c…`, built from `16f8882`), READY_FOR_QA; verified live by Local (CL-136) and Agnes
  (6325781957).
  RBN-QA-074, RBN-QA-075 (with the ending's stone) and RBN-QA-076 (three-party AGREE each, on the exact commits listed
  in HANDOFF's CC-016 entry): on Kotonoha's shore the guide's diamond over a drift of written leaves sits on the drift,
  over the middle of its tiles, faced or not; the Wind Stone in the Keepers' Village is a broad, low, flat stone with
  the wind always blowing over it from the west (grass pressed east, leaves pinned at its western end, pale streaks
  over its top in motion, still with Reduce motion), no lamp or roof, its two tiles and its scene unchanged, and the
  chapter's ending picture draws the same low stone; when a leaf is sent home from it, one written leaf rises off the
  stone's top and is carried away on the wind the way its line names (east; north for Snowbell), fading, in about
  1.8 s, and with Reduce motion lies still on the stone while the line is read; the return itself (the leaf taken, its
  flag, the count, the wind, the toast) unchanged. B `leaf_marker` 18/0, `wind_stone` 19/0, `leaf_home` 42/0,
  `sequence_world --only ko.end` 156/0 on CC-016's own bytes. Their tests' Reduce motion is the setting the game reads
  (`reducedMotion`, read back): runs before `a904614` and `f6873a1` set an unread `reduceMotion` and are motion runs
  only (VALIDATION, CC-016). In candidate CC-016 (`fc7a7a56…`, built from `e70e9c3`), READY_FOR_QA; verified live by
  Local (CL-147) and Agnes (6328518996).
  RBN-QA-078 and RBN-QA-079 (three-party AGREE each, on the exact commits listed in HANDOFF's CC-017 entry): a
  preparation question or task asked while a battle is still starting belongs to that start; when the journey changes
  under it (a load that works, fails or is cancelled), it is taken down unanswered, with any word help opened from
  it, and a late click, Enter or Escape on it records, introduces and opens nothing, while an ordinary preparation is
  answered and recorded as before (latent: only the development fixture `fx.prep` has one; Agnes's AGREE is
  exact-source, not a DOM, IME or browser run); the chapter's ending picture draws Kotonoha's great tree as the first
  sight and the crossing draw it, one crown shape at every screen shape, clear of Otoha, its roots on a rise of the
  hill. B `prep_abandon` 52/0, `battle_start_abandon` 28/0, `sequence_world --only ko.end` 156/0,
  `sequence_art_integrity` 32/0 on CC-017's own bytes. In candidate CC-017 (`ceaffb81…`, built from `c69346d`),
  READY_FOR_QA; verified live by Local (CL-149) and Agnes (6329410623).
  RBN-QA-080 (three-party AGREE, on the exact commit listed in HANDOFF's CC-018 entry; hardening against a
  synthetically measured reflow, not a bug seen in play): with the software keyboard up, when a typing task's own
  boxes change size (the book's type arriving after the keyboard, a line wrapping), the field stays in view, and its
  Submit too as far as the field stays in view (on small layouts the field comes first); the overlay only scrolls and
  never moves focus; it stays quiet while feedback is shown (a wrong answer's feedback stays in view, on a small phone
  too) and once the answer is in, with the keyboard closed, pinch-zoomed or focus elsewhere, and leaves nothing behind
  when the task is finished or taken down (QA-078). `learning_ui`'s keyboard check now waits for the book's type to be
  installed first. B `kb_reflow` 4/0 and `learning_ui` 15/0 on CC-018's own bytes; CC-017's bytes fail `kb_reflow`
  3 of 4. Agnes's review is source/model, not a browser, device or real-IME run; the Reveal and Step away paths with
  the keyboard up were checked only in scratch probes, outside the committed suite (VALIDATION, CC-018). In candidate
  CC-018 (`aa07a8da…`, built from `d65a598`), READY_FOR_QA; verified live by Local (CL-153) and Agnes (6330526850).
  RBN-QA-081, 082, 086, 083, 085, 087, 090, 092 and 088 (three-party AGREE each, on the exact commits listed in
  HANDOFF's CC-019 entry; counts below are on CC-019's own bytes, VALIDATION, CC-019):
  RBN-QA-081: at Kotonoha's stage 3 the guide names the next place by what is still to do (the panels hung → Otoha;
  the first telling missing, in Otoha's order; each conch not yet heard; then the desk in the keepers' hall), never
  "Next: The Tidal Hollow — no way there from here just now"; data only. B `guide_tellings` 88/0
  (CC-018's bytes fail 83 of 88). As Agnes bounds it: the 72 flag combinations are endpoint coverage, not every
  interactive gathering order; cancelled states are injected, not real cancellations.
  RBN-QA-082: the success line of Ao's second lesson teaches the particle は read わ
  (「{助詞|じょし} の 「は」 は 、 「わ」 って {読|よ}む んだ 。 …」), with its review-ledger entry (`f72b28f`, added after
  `review_ledger` failed on `b66f422`). B `ao_lesson_line` 20/0 (CC-018's bytes fail 6 of 20). As Agnes
  bounds it: first-try success for all four profiles, wrong then right and cancel for F only; the wrong path asserts
  the final count; the string and furigana fixture is not an on-screen ruby-layout review; the scene is invoked with
  an initialized state, not reached by ordinary NPC traversal. The new line plays with the device voice (voice paused).
  RBN-QA-086: at stage 4, until the Whispering Hollow's drifting leaf has its word back (`ko_root_a`), the guide names
  the leaf (ko.roots1 4,10), then the tide as before; data only. B `guide_roots_leaf` 9/0 (CC-018's
  bytes fail 5 of 9). As Agnes bounds it: the leaf's challenge is an automated scene invocation, not ordinary walking;
  wrong and cancelled answers are not tested.
  RBN-QA-083: while Ao reads in the keepers' hall (`quest.ko_ao=1`), "Have you seen…?" about him answers with an
  ordered variant beside his unchanged usual line (「アオ なら 、 ヨシノ さん と {字|じ} を {読|よ}む って 、
  {館|やかた} へ {行|い}った わ 。」); a refusal, an unknown and a sighting nearby still come first; the variant has its
  ledger entry and no recording. B `ao_whereabouts` 18/0. As Agnes bounds it: injected quest states and
  the automated sheet; string-level furigana, not visual; the new voice key not independently verified.
  RBN-QA-085: Yoshino's word after the exhibition is choice-neutral and looks ahead
  (「これ で 、 {子供|こども} たち も {板|いた} の {話|はなし} を {比|くら}べられます 。 …」), with its ledger entry; its
  test fails a scene that errors. B `yoshino_exhibit_line` 14/0. As Agnes bounds it: an
  initialized state and the scene played directly, not ordinary routing or visual proof.
  RBN-QA-087: the quest guide reads an encounter's outcome (`_res`, `_enc`) as unknown and forks on it, never as what
  the save carried in; a path that took or skipped a single outcome test keeps that outcome; a compound condition
  still forks. No encounter, state or outcome changes. U `guide_encounter` 19/0 (12/7 on `0f8b9cc`, 7/12 on
  `b66f422`). The compound-condition, result-pairing and code-hook limits stand as stated.
  RBN-QA-090: at the Tidal Hollow your companion steps back onto the north bank, is gone for the spray and does not
  follow you while apart (Company shows its existing "isn't beside you here"), and is with you again at the reunion,
  following after; no line, flag or gate changes. B `tide_split` 49/0 (each companion, with Skip seen, and
  who your companion is, equipment, resolve, bonds, pet and satchel kept). Not covered, as its header says: a reload
  in the middle of either scene, a reload after the reunion, saves made before the fix, the blocked staged walk.
  Combat while apart is RBN-QA-091, separate.
  RBN-QA-092: a guest in an encounter from its start comes in with their own words, once, in the exchange log after
  the creature's intro (English only, as the guests' other battle lines); Kihei's victory says he has moved a little
  way off and waits at the water's edge. B `guest_arrivals` 17/0. As Agnes bounds it: an initialized
  state, not ordinary play; not every cancellation timing.
  RBN-QA-088: the sea cave's telling (`ko.suzu_stage`) brings Nana into the audience itself (`!enter`) and Suzu onto
  the rock, pacing, and down beside you at the end; lines, branches and flags unchanged. An entrance and its walk
  belong to their campaign, map, scene and figure: a load, another map or a fresh visit stops them, recorded as not
  made, and no same-named figure elsewhere is moved. B `suzu_stage` 47/0, `enter_ownership`
  12/0; U `enter_op` 11/0. As Agnes bounds it: 50 ms samples are not proof at every instant; a step
  already started may settle on a scene-only change of ownership, but no next step starts.
  In candidate CC-019 (`3baeeb9f…`, built from `8064756`), READY_FOR_QA; verified live by Local (CL-192) and Agnes
  (6340095981, 6340185178).
  RBN-QA-094, 089, 095, 099, 096, 104 (palette), 102, 101, 093, 104 (cloud material), 100 and 109 (three-party AGREE
  each, on the exact commits listed in HANDOFF's CC-020 entry; counts below are on CC-020's own bytes, VALIDATION,
  CC-020):
  RBN-QA-094: the boulder beside the Stone Steps (`cr.leg2` 9,13) is drawn as a natural rock, mossed on its cap, crack
  and shaded flank (its own cache variant), not a dressed, grooved marker; tile, scene, narration and one-tile block
  unchanged, as are the other sixteen Cloudroad marker stones and every plain rock. B `leg2_boulder` 12/0 on CC-020's
  bytes (candidate's build: 12/0; control on `32a6c78` 7/5). As Agnes bounds it: CPU-rendered prop
  pixels, not native map or caption acceptance; Local's in-context desktop and phone review is separate; producer full
  units not rerun by her.
  RBN-QA-089: the spring-tide night (`ko.tide_night`) has its own pictures, no longer the daytime tide pools: `point`,
  the point under the full moon with the tide drawn far out and Koyomi, you and your companion seen from behind; at
  the wind's line, `rise`, the written leaves lifting one by one (1.6 s) toward the moon, held while lines are read,
  lifted again by Replay, held at once with Reduce motion; lines, variants, flags, quest step and the world afterwards
  unchanged. B `tide_night` 45/0 on CC-020's bytes (candidate's build: 45/0; control on `421498e` 40/5; the first 38
  checks fail 11 on `32a6c78`); U `sequence_p16` in the full units on `05196f0` (57,960/0) (candidate: 374/0; failed
  on `77e792d`'s 2.4 s lift,
  fixed by `ff16922`). As Agnes bounds it: caption-free CPU renders, not native compositor proof (the wet flats'
  regular texture on a phone is a non-blocking polish note); Local's desktop and phone review separate; producer
  results not rerun by her; the language tasks are stubbed in the test, and the pet-labelled runs show no pet in the
  pictures.
  RBN-QA-095: the shelf in Sono's Courier's Inn (`cr.saka_inn` 1,2) shows what its scene says: a straw hat on top and,
  hung below, an indigo relay coat from the back with a pale ring crest (no letters), straw sandals, no books; tile,
  block, Look, scene and Sono's gated line unchanged, as are the other 88 shelves. B `courier_shelf` 9/0 on CC-020's
  bytes (candidate's build: 9/0; control on `5940b34` 5/4). As Agnes bounds it: isolated CPU-render art
  evidence, not a native map or interaction retest; Local's in-context review separate.
  RBN-QA-099: climbing the Cloudroad (`cr_main` stage 2), the Journey names the furthest station's own work instead of
  Kirishita: Kanbe while there's no ledger; then that station's person while the message from below is undelivered,
  its lamp, its person while they have no message for you, the way east (34,12) until the road on is planned, then the
  next station (Kirishita after Umagaeshi); the palanquin down doesn't move it, corrections aren't steps; data only
  (`atIf`), the stage's text, gates and stage 3 onward unchanged. B `guide_climb` 10/0 on CC-020's bytes (candidate's
  build: 10/0; control on `5940b34` 4/6); U `cr_guide_climb` in the full units on `05196f0` (57,960/0) (candidate:
  53/0; 12/41 on `5940b34`). As
  Agnes bounds it: her 480-combination truth table is source-model evidence, not ordinary traversal; "cancelled plan"
  and "fog waited out" are constructed flags, not the real flows, and the fog fixtures omit `cr_fog_waited` and phase
  5, so no end-to-end fog coverage; the step legitimately depends on `cr_plan`.
  RBN-QA-096: left apart in the Tidal Hollow, you can no longer leave the Root Hollows' north side without the
  reunion: the same scene (`ko_apart&ko_root_c`) is a step trigger on the landing (x2–3, rows 3–5, was 3–4) and before
  the ways up to the Whispering Hollow (x14–17, rows 1–2) and on to the garden (x29–30, rows 3–4); once only, nothing
  on the south bank, on arrival or on load; back from either way off on an older save, only the step straight back out
  plays nothing; the reunion itself unchanged. B `reunion_ways` 33/0 on CC-020's bytes (candidate's build: 33/0;
  control
  on `5940b34` 12/21); U `ko_reunion_reach` in the full units on `05196f0` (57,960/0) (candidate: 22/0; 16/6 on
  `5940b34`). Recorded:
  `reunion_ways` 32/1 on the combined head `52d2441` (a fixed 130 ms key hold outlasting a stalled step), fixed
  test-side by `2cb0e5e`. As Agnes bounds it: saves that already escaped are repaired only by a qualifying step on
  return; the bridge case is relocated to (15,13), not walked from the lower bank, the load case is landing to north
  only, Skip is one Mio landing; the test fix mitigates the measured race, not every driver stall.
  RBN-QA-104, palette: the cloud sea above the Barrier no longer uses the Cloudroad's slate-blue river ramp; only
  `cloudtop`'s water ramp is remade, from its own pale colours (its inherited grass, stone and leaf ramps left for
  review); terrain, collision, snow, progression and the rivers unchanged. U `cr_ch10` in the full units on `05196f0`
  (57,960/0) (candidate:
  154/0; without the fix 151/2 per Cloud, 152/2 on `8064756` per Local). As Agnes bounds it: the blue is gone, but
  ripples, sparkle and a sharp wet bank still read as pale water (isolated strips, not the native map), so colour
  alone doesn't close the complaint.
  RBN-QA-102: a load, new journey or Return to title while a scene reads over black no longer leaves you under a black
  screen, and the scene being left goes no further (no line, flag or warp) while the save is read or the "another tab"
  question is up; a door caught by a load mid-fade writes no map, name, checkpoint, autosave or arrival into the
  loaded or kept journey, and a door taken after it, even before the old one settles, keeps its own mode; no scene,
  line or timing changes. B `fade_load` 15/0 on CC-020's bytes (candidate's build: 15/0; control on `ad0b385` 9/6; its
  first 8 checks fail 6 on `8064756`); U `mode_holder` in the full units on `05196f0` (57,960/0) (candidate: 12/0; 4/5
  and an error with
  `2807cd2`'s `90_game.js`). Recorded: one `voicebank_vrc1` timing failure in the first candidate's full units
  (57,850/1; not reproduced, cause unproven). As Agnes bounds it: extracted source models, with a name-only removal
  failing as the negative control, not her browser or full rerun; the load during a door is programmatic, not a claim
  that ordinary UI can load mid-transition; integration is not publication or native replay.
  RBN-QA-101: on the ledge (`cr.leg4` 11,3), unloading the pack horse and walking it back (calming it comes to the
  same) is a cutaway: the unloading is read over black, the horse goes (`cr_horse_safe`) in the dark, and the light
  returns on the empty ledge for the reactions, where the loaded horse used to stand through the line and vanish under
  them; text, flag, both choices, reactions and the horse at Umagaeshi unchanged; no new art, walking or escort. On
  QA-102, so a load while dark leaves nothing black. B `ledge_horse` 14/0 on CC-020's bytes (candidate's build: 14/0;
  control on the task head 3/11). As Agnes bounds it: a cutaway, not a literal unloading; her source AGREE rested on
  QA-102's transition ownership (since accepted); producer and Local totals are not her reruns.
  RBN-QA-093: Kihei's leaf hangs framed in Mitsu's lodging house only once the handing-over has played
  (`ko_kihei_mitsu&seen.ko.mitsu_letter`), not from the choice, and by the door as she says ((3,7), the way out
  clear); in the Mitsu and wind endings Kihei goes where he stood after his last word, and the "gone" line waits for
  it (`!refresh gone`, at most 4 s, at once when skipping); the Mitsu ending adds a note to self, 「{宿|やど} の ミツ さん に 、
  キヘイ の {葉|は} を {届|とど}ける こと に した 。」, with its ledger entry; the kept ending, "Not now", the satchel and the quest's
  completion unchanged, no note on old saves. While skipping, every `leave: 'here'` departure (Genzō, Mochi, the
  delvers, Kihei) ends at once. B `mitsu_frame` 28/0 on CC-020's bytes (candidate's build: 28/0; control on `27cfddc`
  26/2; the first 20 checks fail 12 on `32a6c78`). Recorded: `lodge_quarrel`'s source check failed on `c9b0fbd`
  (57,820/1), fixed by `715c080`. As Agnes bounds it: his absence is actor state, not pixels, with no timing certainty
  under every load; a load mid-scene is safe only through QA-102's guard, hence integrated after it; the other
  `leave: 'here'` actors keep their regressions; a companion forced onto (3,7) is a disclosed limit.
  RBN-QA-104, cloud material: at Above the Cloud, Kumoi, the Rope Bridge and the summit the sea is drawn as cloud:
  soft banks lit from above, one faint slow wisp per tile (still under Reduce motion), shadow under a ledge, a rock
  lip at the drop; no ripples, foam, glints or wet shore; collision (824 tiles, all impassable), terrain, maps and
  palette unchanged, and the other palettes keep their water. B `cloud_sea` 6/0 on CC-020's bytes (candidate's build:
  6/0; control on `ffa6222` 3/3); U `cr_ch10` in the full units on `05196f0` (57,960/0) (candidate: 156/0). As Agnes
  bounds it: CPU material
  fixtures at full and half size (four snow edges, open cloud, a bridge over cloud), not native screenshots or full
  coverage of the four maps; no palette or depth refinement found mandatory; the native retest of the maps is pending.
  RBN-QA-100: Nakayama's two inns, which stand side by side, are spoken of that way: the lamp 「{並|なら}んだ {二軒|にけん} の
  {宿屋|やどや} を 、 {同|おな}じ {灯|ひ} が {照|て}らす 。」; Otaki and Seibe 「{隣|となり} の」 ("next door") for 「{向|む}かい の」; the seal 「……
  {竹屋|たけや} は 、 {宿|やど} が {二|ふた}つ {並|なら}ぶ {絵|え} に したい らしい けど 。」; four ledger entries re-keyed; layout, routes, gates and
  the inns' rivalry unchanged. The four lines play with the device voice (voice paused); the old recordings are kept.
  B `nakayama_inns` 9/0 on CC-020's bytes (candidate's build: 9/0; its first 8 checks fail 5 on `5940b34`; 8/1 with
  the
  Japanese box's selector broken on purpose). As Agnes bounds it: an initialized state and repositioning, the lamp's
  challenge stubbed to pass, not ordinary answering; the furigana check shows each kanji line's Japanese box and
  readings are present, not pixel visibility or full source-to-screen equality.
  RBN-QA-109: a reply's row is as tall as its words (`.choice { flex-shrink: 0 }`), so in a long bilingual menu (the
  palanquin's eight replies) a reply's second line no longer runs into the next row; where replies don't fit, the list
  scrolls, and the last can be scrolled to, clicked or tapped, reached by Tab and chosen with Enter; text and ruby
  keep their size, no row is fixed taller. B `choice_rows` 6/0 on CC-020's bytes (candidate's build: 6/0; control on
  `31206a0` 3/3). Recorded: `dialect_kansai` 58/1 in QA-109's integration lane (lane log; 43 px buttons measured mid
  book-opening, the same frames on `da9072c`), a test-only fix proposed after the cut. As Agnes bounds it: the test
  exempts an undersized list from pointer and keyboard reachability and measures the last row, not the tallest, so 6/0
  is not universal accessibility or every option visible; producer and Local totals are not her reruns. Excluded and
  open: RBN-QA-116, the reply list at 844×390, hidden with 140% text (8 px against a 103 px reply; 73 px at 100%).
  In candidate CC-020 (`6278005a…`, built from `05196f0`), READY_FOR_QA, with `keeper_reveal` 68/1 retained (the
  test's single sample of animated water; CC-019's bytes fail it the same way in the same harness; not an all-green
  claim; Agnes 6350299208, Local CL-219; VALIDATION, CC-020); RBN-QA-116 stays open, outside it.
  RBN-QA-103, 113, 114, 111, 117, 119, 112, 115, 121, 130, 131, 120, 129 and 128, the `dialect_kansai` and
  `keeper_reveal` test fixes, the language audit's Tier A with RBN-QA-132, the kanji exams' place rotation,
  RBN-QA-133, RV0047, 先々代, RV0115, 十分 じゅっぷん, the かい hints, the listening page's retired take, the `book`
  fixture, RBN-QA-161 and 162, the Reedwake return-discovery pilot, and RBN-QA-108, 124, 164 and 165 (each on the
  exact commits listed in HANDOFF's CC-021 entry, with its AGREEs as VALIDATION, CC-021 lists them and the ids the
  record lacks marked; counts below are on the candidates' and the integrated heads' own builds, as posted; the
  matrix on CC-021's own bytes is in VALIDATION, CC-021):
  RBN-QA-103: a companion who stays behind (`!hook comp_away`) left the party but their following figure stayed, so
  at the Mist Barrier two of them stood in the office; `!hook comp_back` put nobody beside you until the next map.
  Now the follower stops where it stands and becomes a figure of the scene (a placement for them here takes that same
  figure there; otherwise they leave when the scene ends), and the one who comes back is their figure here, or
  nobody: never a second. The four Steamhollow returns end with `!refresh comp`; Mio's night leaves by the
  dispensary's own door (`yn.lower` 8,25) before "the door closes quietly behind you". Refined: within a map's first
  900 ms a new place whose person has a figure here takes that figure, from where it stands. No line, flag, bond or
  journal change. B `companion_away` 31/0 on the refine's build (30 passed, 1 failed on `48d65dd`'s build: two of
  Suzu, on the bench and left standing at 6,5); 29/0 on `48d65dd`'s build with Mio's door check (`fec8666`); U full
  57,851/0 on the refine. Integrated with QA-113 and checked on `05196f0` as `a0f63a9` before the cut (units
  57,960/0); on batch 1's head `6a7afbc` B `companion_away` 31/0 among 20 regressions (VALIDATION, CC-021). Limits:
  not in the record drawn on.
  RBN-QA-113: `yn.bath_scene` narrates a familiar voice from beyond the bamboo partition, but each of the companion's
  lines brought a figure of them in beside you on your own, dry side. Now, with `yn_bath_apart`, the scene's first
  line makes the four companions off-screen speakers (`?(yn_bath_apart) !speakerless nao mio ren suzu`); `!call`
  shares the scene's context, so the bath beat and repeat baths are covered; together, nothing changes; no text, flag
  or bond change. B `bath_partition` 5/0 (first the Upper House, 32 baths apart and 8 together; with `97dd467` both
  houses, 40 apart and 16 together, counted and required; control on `7dd1517`'s build 4/1: a figure by you, the
  lines on screen); 5/0 on `6a7afbc`'s build. The scene manifest now classes `yn.bath_scene` as Quiet by design.
  RBN-QA-114: the Lower House's entrance is earthen-floored, as its arrival line says (土間): the strip inside the door
  (5..7, 7..8) and the doorway are packed earth (the game's own earth tile), and a floor-level prop, `yn_doma`, draws
  it as packed earth (三和土) with the raised floor's edge along its top and down its sides; the bench, counter,
  lantern, hearth, tatami, people, exit and walkability unchanged, the shared tiles untouched. U `lower_house_doma`
  10/0; full units 57,968/0 and `book_type` 60/0 on `2f9d69f`. Recorded: the run on `673c501` was 57,963/5 (框 in
  source comments is not in the font subset; `2f9d69f` says it in romaji); `673c501` checks the house's people as
  they were, not by count, so QA-120's later placement leaves it true. Captures went to the owner privately. Agnes's
  AGREE is qualified (6347499245); its terms are not in the record drawn on.
  RBN-QA-111: Sono's noren hangs in the Courier's Inn's doorway at Sakashita once she has named it for her grandfather:
  `cr_noren`, a prop you walk through, drawn on the inn's front wall (a pole under the lintel, two indigo panels split
  down the middle, pale brush strokes with no legible word), at `cr.sakashita` (7,10), the doorway into
  `cr.saka_inn`, only with `cr_family_inn`; nothing else on the map changes. U `sakashita_noren` 5/0 (the control
  fails); full units 57,963/0; B `courier_shelf` 9/0 on `6a7afbc`'s build. Captures went to the owner privately; art
  per AC1_ART.md. Agnes's AGREE is qualified (6347945501); its terms are not in the record drawn on.
  RBN-QA-117: Steamhollow's Journey and guide point where the quest can go on: at `yn_main` stage 3, once
  `yn_shimo_heard`, the Journey's "What to do now" says "You've heard both houses. Go to the red bridge in the lower
  town." (before Tahei, as it was); at stage 5, while `!yn_vents_open`, the guide points to Aki in the lower town with
  the hint "Aki has the key to the grille at the spring house.", and once the grille is open the way on is derived as
  before. Both stay read-only; the two new lines are in the language ledger, self-reviewed, not voiced. B `yn_guide`
  25/0 (control on `da9072c` 17/8); U `yn_guide_qa117` 10/0; `book_type` 60/0; full units 57,970/0; B `yn_guide` 25/0
  on the builds of `6a7afbc`, `5cd2cd3`, `730fb40`, `8001c3e`, `0fca3fa`, `0944868` and `bc1bf37`. As Agnes bounds it:
  constructed states; the reload is reconstructed, not an actual save and load; no Tahei or Aki interaction played;
  stage 6 is checked for absence only.
  RBN-QA-119: the river's own steam goes when the quarrel runs it cold, and comes back when the Kettle settles: the
  lower town's two plumes on the river, (29,6) and (28,22), show only while
  `!yn_river_cold&!yn_quarrel|!yn_river_cold&quest.yn_main<4|yn_kettle_settled`; `yn_river_cold` is set in
  `yn.bridge_quarrel` just before the line that the river's steam has gone (after the boil line, which keeps its
  steam); an older save past the quarrel's end (`yn_quarrel` and stage 4 or later) without the flag counts as cold;
  a save between the line and stage 4 stays as it was (ambiguous; nothing inferred, no quest state touched). Land
  vents, baths, the Vents and every other map's steam unchanged. U `river_cold` (which plumes, twelve states, the
  order in the scene; its count is not in the record drawn on); full units 57,967/0 on `40f4010`.
  RBN-QA-112: the room allocation (`yn_rooms`), Tama's recipe card and the buns are procedures too (`restart:
  'stable'`), but the footer said "A wrong step sends the machine back", Step away "The machine stays as you leave it"
  and the generic wrong step "the machine settles back". Now the footer "A wrong action may undo progress; a language
  mistake only means trying again."; Step away "It stays as you leave it…", or, for a procedure marked `keep: false`,
  "Next time, this starts again from the beginning."; the generic wrong step "That was not the way."; the panel's
  label "Where things stand". Each procedure's own wrong-step text and every reset rule unchanged; English UI strings
  only (no ledger entries, no voice keys). U `procedure_copy` 8/0 (the 27 procedures, 5 `start` and 22 `stable`, and
  `keep: false`); B `procedure_copy` 7/0 over the 22 procedures on the encounter sheet (control on `7dd1517`'s build
  2/5); on its build `encounters` 10/0, `steamhollow` 5/0, `answer_order` 5/0, `hall` 4/0; full units 57,966/0; B
  `procedure_copy` 7/0 on `5cd2cd3`'s build. Recorded: its earlier browser runs, stopped by its own `keep: false`
  case and then by a battle-led procedure leaving combat mode, kept as superseded. As Agnes bounds it: standalone
  sheets, not the five battle-led procedures; no direct retry coverage.
  RBN-QA-115: Zenroku's complaint ends in a genuine inquiry that Kane takes over, not a Plum-room booking nobody made:
  `yn.complaint`'s action 'move' (its id kept; its flag and end renamed 'asked') offers to ask the Upper House when a
  room will come free (the から lesson kept, with its near miss on いつまで and its feedback); Zenroku would be glad of
  a room and asks after the people next door, and Kane, listening from the hearth, takes the asking over and will sit
  with them tonight; the end 'asked' sets `yn_zenroku_asked` (an inquiry to make; no answer, room or date implied);
  Kane's line after it says she will ask the Upper House herself. The stay, blunt, walked and heard branches and the
  front desk's own Plum booking untouched; an old save's `yn_zenroku_moved` stays, read by nothing; no migration.
  Three new ledger lines, self-reviewed; voice keys `yn.complaint_start#d5fb278a76` → `#c8825a515b` and
  `code.enc#c55c5faccb` → `#0d0ff8ff4e`, no new recording. U `zenroku_inquiry` 14/0 (the other branches'
  fingerprints as on `05196f0`); `yn_ch11` 193/0, `book_type` 60/0; B `zenroku_inquiry` 4/0 (control on `05196f0`'s
  build 1/3); full units 57,974/0; B 4/0 on `5cd2cd3`'s build. A whole-tree search at `e2e4008` found no reader of
  `yn_zenroku_moved` or of `_enc=moved` in `src/` or `tools/`. As Agnes bounds it: the browser test stubs the
  encounter's result, and the units play it separately.
  RBN-QA-121: the wheel at either end of the Old Channel first says it is a small wheel piped to the big valve, then
  shared `yn.shutter`'s forward line, "You turn the big valve", while you stood at the small one. The line drops 大きな
  / "big"; the reverse line, the end wheels' own line, the calls, the flag and the refreshes unchanged; its ledger
  entry replaced, self-reviewed; voice key `yn.shutter#7e69685a7f` → `#7f0f3ac762`, no new recording until the full
  QA ends. U `valve_line` 6/0 (the control fails 2); B `valve_line` 7/0 at the middle valve and both end wheels, each
  way (control on `da9072c`'s build 4/3: the three forward lines say "the big valve"); full units 57,966/0; B 7/0 on
  `5cd2cd3`'s build.
  RBN-QA-130: Ginnojō's quest ends on "Tonight, I'll do my turn" with no performance scene, but his idle line looked
  back on a show ("…Forty years on, it's the same sound."). One line replaced (`yn.ginnojo_idle`): "The last line's
  come back. …Forty years on, my body still knows the beat where the laugh comes."; its ledger entry replaced; the
  talk order, the quest, rewards, flags and Suzu's exchange unchanged. Voice: the old key `yn.ginnojo_idle#287e4ce7ad`
  has a cast recording, kept on the site, unused; the new key `#42224fea3f` has none and is on the re-record list
  (device voice or silence). U `ginnojo_idle` 11/0 (on the old line 5/6); full units 57,971/0 on `3d5d02a`; on
  `730fb40`'s build B `steamhollow` 5/0, `cloudroad` 4/0, `yn_guide` 25/0 (not clean rows).
  RBN-QA-131: `cr.chika_after` said every label on the medicine chest could be read, on every journey, though only Mio
  relabels the chest (`cr_mio_labels`) and Ginji's parcel writes one dosage label. Now `!if cr_mio_labels -> labels`
  keeps the labels line (its key `cr.chika_after#0aebd1fc23` and its recording); every other journey hears one new
  line: "More people travel the Cloudroad now, and more of them come to me with headaches. If your head starts to
  ache, don't push on. Rest here a while." (new key `#c2a03806f5`, on the re-record list; device voice or silence).
  The talk order, the parcel's place first and every flag unchanged; one new ledger entry. U `chika_after` 10/0
  (control on the cut 7/3); full units 57,970/0 on `b4381a1`.
  RBN-QA-120: given his spring egg, Tsuneji said he would share it with the ridge folk and the narration said he
  carried it back to the Lower House, but he stood on by the river. Now the riverbank holds him only until the egg is
  his (`yn_egg_tsuneji`), and the Lower House from then until the valley's story is done, at (9,7) by the hearth; in
  `yn.egg_tsuneji`, after his line, `!refresh gone 9000` walks him round you to the house's door at (9,10), where he
  fades, and only then the narration. `!refresh gone <ms>` takes an optional bound (a positive number, rounded, at
  most 12000; otherwise 4 s); `npc.leave: 'way'` (his placement, with `leaveTo: 'yn.shimo'`) means his own way out or
  none: with no route he fades where he stands, recorded as a fallback, never through another exit; at the bound
  whoever is still walking stops and fades where they are, recorded (at most 400 ms more); a going the scene waits on
  (`!refresh gone`) is walked however soon after the map appeared. Your place is never touched. Kihei's `!refresh
  gone` (QA-093) now also fades him when he is spoken to at once. B `tsuneji_egg` 33/0 on `8e2e15b`'s build; on its
  build `mitsu_frame` 28/0, `departures` all ok, `fade_load` 15/0, `load_mid_scene` 19/0, `lodge_quarrel` 31/0; full
  units 57,972/0. On `a3883be`'s build `tsuneji_egg` 33/0, `companion_away` 31/0, `departures` all ok, `kotonoha` 7/0
  (not clean rows); full units 58,053/0. Recorded: the first browser run, 20/11 on `16dc2d0` with the test as it was
  before `64a6b26` (talked to within the street's first 900 ms, he simply vanished), a real finding that `8e2e15b`
  fixes; the delay-only attempt; the control on `da9072c`'s build, 2/29 and then the run threw (its fallback section
  edits a `!refresh` the old scene lacks), not a completed comparison; Local's bounded scratch probe completed. Agnes's
  AGREE 6352065812 is qualified; its terms are not in the record drawn on.
  RBN-QA-129: after the chapter's end Yasuke and Tsuneji were gone, Eggs for Everyone needs all three eggs, and the
  guide found no way on, even with Oshige still owed. Each now stays after the end only while the quest is under way
  and his own egg is owed (Yasuke `!yn_done|quest.yn_eggs=0&!yn_egg_yasuke`; Tsuneji's lower-town place
  `!yn_done&!yn_egg_tsuneji|quest.yn_eggs=0&!yn_egg_tsuneji`); given it, he goes as before (Tsuneji by the Lower
  House's door). Placement only: no `yn_done` rewind, nothing given or set, no new line; a quest never begun cannot be
  begun after the end (kept, noted beside Tama). U `egg_recovery` 19/0 (control on QA-120's source 17/2). Full units
  on `3ba19ee` 57,990/1: QA-120's `tsuneji_egg` case still expected the old rule, so `9e867a7` (test only) expects
  the riverbank (22,18) with the quest under way and keeps "neither" where it is finished or never begun (U
  `tsuneji_egg` 12/0); full units 57,991/0 on `c424b42`. B `tsuneji_egg` 34/0 (control on QA-120's build 33/1: the
  new rule's case); B `egg_recovery` 25/0 (control on QA-120's build 8/17); its first run was 21/4, all in case 1
  (the loading page kept the default text speed and `play()` pressed once per line), fixed by `c424b42` (test only);
  `b846c3b` (test only) asserts `yn_egg_yasuke` beside the other two. On the combined head `8001c3e`: `egg_recovery`
  26/0 with the 2/3 save written by the task head's build (QA-120 without QA-129) and 26/0 with the save written by
  the cut's build; `tsuneji_egg` 34/0. Recorded: after his egg Yasuke goes `{"to":null,"exit":null,"reason":"nearest
  (unknown)"}`, no fallback: how the world chose, not a named route, and not asserted; what is asserted is that he is
  gone, and still gone after a reload. The old saves are built inside the test by each build's own manual save;
  neither is Agnes's playthrough save.
  RBN-QA-128: `yn.suzu_books` (the morning after her night apart) played only on arriving in the lower town, while the
  mediation needs only `yn_eve_done`, so going from the Upper House to the hall reached the mediation, the walk and
  the chapter's end first. The same arrival scene is now also the upper town's first. Routing only: the scene, its
  flag, its bond event (`yn:settled`, once), both garden replies and other companions unchanged; a save past the
  mediation or the chapter with the books pending plays them on the next arrival in either town. Kept and documented:
  a save made inside the hall between the garden and the mediation on an earlier build can still start the mediation
  first; the books then follow on the next arrival outside. B `suzu_books_route` 13/0 on `cf155c3`'s build (control
  on CC-020's build 7/6: the four upper-town cases, the mediated save, loading while the books play; the lower-town
  cases pass on both); full units 57,975/0 (begun at `432dc4e`; `cf155c3` changes only the test); 13/0 on
  `8001c3e`'s build. Recorded: the runs before `cf155c3` measured nothing: the first awaited the garden scene, which
  waits on lines nobody advanced, until its 30-minute bound (fixed by `432dc4e`); its rerun and the 2/11 control
  placed you with `RB.world.enter`, which runs no enter events (fixed by `cf155c3`).
  The `dialect_kansai` test (CC-020's 58/1 in QA-109's integration): the Company page's two buttons are measured once
  no `bk-open` animation runs and the book has no transform of its own, bounded at 2 s (if the bound runs out it
  measures anyway); the 44 px requirement and the product's animation unchanged; `RB_ANIM_RATE` (test runs only)
  slows the page's animations. The new test passed in full on CC-020's bytes (twice) and CC-019's; the old test passed
  at normal speed and failed with the animation slowed to 0.25 (270×43, 173×43), as in the CC-020 matrix; the new one
  passed at 0.25 and 0.1. Shrink control (the buttons forced to 36 px): the first attempt was ineffective (a style
  injected by `addInitScript` after navigation; every check passed with 44 px buttons), kept on record; the second
  fails exactly the two 44 px checks (Company 274×36 and 175×36; phone 36 px), 57/2. Full units 57,960/0. On
  `0944868`'s build `dialect_kansai` all passed. Promised and not in this cut: the message saying so when the bound
  runs out.
  The `keeper_reveal` test (CC-020's 68/1, one 3×3 point of animated water read once): the swell is the median of 15
  pixels (5 columns at u −0.2…0.2 of its half-width × 3 rows, yR − 2, yR and yR + 2, yR = water − round(0.45·H)) and
  the open water the median of up to 36 pixels at the same rows, every 2 px from 2 px right of the swell's box and
  stopping before the picture's innermost vignette step (x 500–522 at 1280×800; x 312–324 at 390×844); fewer than 6
  water pixels fails; `RB_KEEPER_FLAT` copies 8 px strips of that water over the box, each clipped to it; the picture
  and the threshold (6) unchanged; each message still prints the old points. Its clean matrix (nothing else running
  at each start and end), the same on CC-020's and CC-019's bytes: normal 69/0; flattened 65/4 (each of the four
  swell checks, swell = water = 55,61,90); start +1,750 ms 69/0 and +2,100 ms 69/0; Ren's and Suzu's reduced-motion
  configurations in every run; load rows beside its own full unit run 69/0 on both; producer full units 57,960/0. On
  `8001c3e`'s build 69/0 (not a clean row). Recorded: the first revision, `4efc4e6` (30 pixels, 6 columns × 5 rows),
  is not a valid fix: with its own switch the flattened swell passed in three of four configurations (CC-138 gave
  the suite total, 68/1, as if it were the case's; corrected in CC-139), in two with Local's corrected switch (67/2),
  and the original switch overran; both commits are cherry-picked, so it stays in the history; a development run
  (65/4, with two unit runs alongside) is not evidence. Agnes's AGREE is qualified (6353897775); its terms are not in
  the record drawn on.
  The language audit's Tier A (display only): 48 furigana readings corrected in 35 files, each moving a reading or
  its ruby grouping, the words and so the spoken text unchanged: F01 教わった おし→おそ (2); F02 遅れる/遅れて おそ→おく
  (2); F03 明かり あかかり→あかり; F04 凍える こお→こご; F05 跳び出して は→と; F06 消える け→き; F07 霧を食べる く→た;
  F10 お願い, お back outside the ruby; F11 入っている/入った/入りました い→はい (6); F12 入れてくれる はい→い; F13
  開け閉め ひら→あ (`ch6/40_learn.js` only); F14 三分の一 さんぶ→さんぶん (Tamotsu's three, RBN-QA-132); F15 何百回
  なんびゃっかい; F16 何十杯 なんじゅっぱい; F17 百本 ひゃっぽん (with Suzu's Kansai line and its "=" key); 何 before
  の/と/とも/でも/です read なん (22 lines, with the four Kansai lines that key them). Tier B (開ける by meaning) and Tier
  C untouched. Two lexicon entries (何百回, 何十杯); the 34 expansion lines re-keyed in the language ledger, nothing
  else moved; the kanji table regenerated (杯 no longer ぱい on its own). Voice: 49 spoken keys change; 43 of the 49
  old keys have cast recordings and 6 none (`code.comp#3bc1edb85e`, the four F04 telegraphs, `code.town#5e60ef93e4`);
  what any recording says is unknown until someone listens; device voice or silence until a listening check after
  QA, re-keyed only on a confirmed reading. U `tier_a_readings` 5/0 (control on `5cd2cd3` 3/2: the places and
  Tamotsu's lines); `validate.mjs` no errors, `dialect_kansai` 9,528/0, `review_ledger` 2/0, `lang_lexicon` 43/0; full
  units 58,041/1 on `9d66813` (`recog-coverage`: the generated kanji table out of date), 58,042/0 on `8380d17`. On
  `0fca3fa`: full units 58,109/0; B `play_ui` all ok, `practice_b` 6/0, `choice_rows` 6/0, `yn_guide` 25/0, and `book`
  13/2, the same two failures as before Tier A (the `book` fixture, below). Recorded: CC-141's `tier_a_readings` 7/0
  with a control of 5/2 was wrong (the only control before the split was 11/4, on the combined test); "21 of 22
  AivisSpeech/Nemo recordings already say the corrected reading" is withdrawn (it matched engine predictions; nobody
  had listened to the served recordings).
  RBN-QA-132, Word Help: 三分 showed as "number + counter: 3 × minute(s)" whatever its reading (the counter lookup in
  `src/lang/70_lookup_ext.js` read 分 as minutes). Now a number + 分 read ぶん is a fraction's whole only in the whole
  N分のM, a number after の as well (the parser records the word after next, `next2`, in `src/lang/20_jp.js`), with a
  furigana note on how fractions are said; 十分 じゅうぶん, the minutes (ふん/ぷん), other counters and portions (〜人分)
  untouched; only Tamotsu's three 三分の一 qualify today. U `fraction_lookup` 17/0 (control 11/3: the fraction cases
  read "3 × minute(s)"); 14/0 at `74edc10`, before the rule needed the whole N分のM.
  The kanji exams' place rotation: for a target written twice the place was `at[n % at.length]` and the word
  `words[n % len]`, so whenever the list's length and the count of places shared a factor some places were never asked
  (an even list and a target twice: always the same place); found when QA-133's 一語 made 一's list even and
  `kana_homophones`' "一 in 一字一句: asked at the first and at the third place" got "first" twice. The place now turns
  once per round of the word list, `at[Math.floor(n / len) % at.length]`; words with the target once, the word
  chosen, the prompt's counting, the answer, the options and their ruby unchanged; deliberately, every word's first ask
  is now its first place (before, a word at an odd index with the target twice began on its second place). U
  `exam_place_rotation` 7/0 (control 5/2); `kana_homophones` 1,466/0 (control on `cec2871` 1,465/1, on that check),
  `exams` 113/0, `kanji` 637/0. Recorded: "the first ask of each word is its first place, as before" (CC-146) was
  wrong; corrected in CC-147.
  RBN-QA-133: Tōya's note 「必要なら開ける」 ("If needed, open.") was counted as "four words" (四語), though it has three
  English words and the Japanese count depends on how it is segmented. Every place now refers to it count-neutrally:
  six spoken lines (`sa.study_desk`, `sa.heart_kasane`, `sa.after_battle`, `sa.toya_read`), the notebook note
  `sa_toya`, the sequence `ch6.toya`'s title and memo ("Tōya's note"; a Company memory already in a save keeps the
  title it was saved with), the Hush's explanation and the challenge's intro, prompt and two explanations (English
  only), and source comments; the quote, the four-tile ordering task and its answer, every id and the art kept. 一語
  gets a lexicon entry (Word Help read it as "1 × language"). The six spoken lines get new keys (device voice or
  silence; recordings kept, none generated). U `toya_note` 7/0 (control on Tier A 2/5).
  RV0047: Nao's fourth orchard banter (`co.b_nao4`) played after the kiln whether or not the optional bell quest was
  done, and opened as hearsay: "Heard about the bell? Everyone ran to the channel when it rang." Its first line now
  branches on `co_bell_rung`, in Agnes's wording: rung, "Everyone ran to the channel when the bell rang. Their heads
  forgot; their feet remembered the way."; not rung, "Sometimes your feet remember the way even when you can't call it
  to mind."; when it plays, its flags, the quest and the two lines after it unchanged; both openers are new lines with
  new keys (device voice or silence). U `nao_bell_banter` 6/0 (control 1/5). The retired line's take is kept and
  marked retired on the listening page (below).
  先々代 at Fujiya (`mb.fujiya_tallybook`): the English said the tally book's rubbings were taken by "Fujiya's
  grandmother"; 先々代 is the head of the house two generations back (the game's own lexicon) and the source settles
  no relationship. English only: "…taken by the head of Fujiya two generations back."; the map's source comment says
  the same without a relative; its ledger entry's English follows; the Japanese, its voice key and its ledger key
  unchanged. U `fujiya_tallybook` 3/0.
  RV0115: in Suzu's Kansai line in `lf.b_suzu2`, 値切られても断られへんから ("She can't say no when folks haggle"),
  Word Help read 断られへん through 〜へん alone, as the passive (standard 断られない). One Kansai lexicon entry gives it
  "can't refuse; can't say no", standard 断れない, with a note that 〜られへん is also Kansai's "can't …" (行かれへん);
  her words and voice key unchanged. U `kansai_kotowararehen` 4/0 (it also checks that the real passive 値切られて is
  still a passive and the 12 other 〜られへん in her Kansai lines still read as 〜られない; control 3/1, failing on
  断られへん); `dialect_kansai` 9,530/0.
  十分 read じゅっぷん: Word Help glossed it "enough" (the lexicon had only 十分 じゅうぶん). One entry, 十分 じゅっぷん
  "ten minutes"; the lookup takes the entry whose reading matches, so じゅうぶん stays "enough"; no general
  reading-mismatch rule. Of every number + 分 written in `src/`, only the じゅっぷん row changes: 5 places, the atlas
  sign, Mio at the inn (`yn.bath_scene`) and the eggs task among them. The kanji table
  gains 十 じゅっ and 分 ぷん from the entry's note; the note first named 十 and 分 without readings, which
  `lang_lexicon` failed in the batch's full units, and now says "both kanji change sound together". U `jippun` 3/0
  (control 1/2). Open, outside this cut: 十分 written じっぷん still looks up as "enough" (no line writes it today; the
  follow-up entry `55db809` is not in this cut).
  The かい hints: Word Help read kana かい as 回 "times" in Mio's 怒ったかいがありました (`mp.boss_won`; 甲斐), the
  F-level tide-pool notice and its three answers (`sz.school_3`; 貝) and the letter to Natsume, ヤギをかいにいきます
  (`sb.a_letters`; 買う). Six word@lemma hints, the content's own mechanism for kana homophones, give each its word;
  no word, reading, spacing or English changes. Of the 86 kana かい, the 78 sentence-final particles are unchanged;
  the two left as 回 are 回(かい) itself and an English explanation of the particle (`sb.c_reply`), left as both
  reviewers said. Mio's key `mp.boss_won#4b56230210` → `#aaa8214dfd` (its cast recording `r1-da5c5a67c49f42b9` kept,
  unused; a listening check before any re-key); the notice and the letter are not voiced; five ledger entries take
  the new keys. U `kai_hints` 4/0 (control without the hints 2/2). Recorded: a parser rule first built for Mio's line
  (`446c241`) was dropped before the batch was pushed.
  The listening page's retired take: the page takes each take's English from the current script by key, and RV0047
  retires Nao's old first line, which has a take on Robin's review list (`r1-f25c42a39756bbfb`, group "edges"). A
  small data file, `docs/future/voice/production/run/RETIRED_TAKES.json`, keeps each retired take's English and the
  line before it, with the batch's revision (`ff8a0fa…`) and why; the page tool reads it only when no key of the take
  resolves, and the card says "Retired · unused". No audio changed, made or re-keyed; the take's group and decision
  untouched. U `voice_retired_takes` 6/0 (control with the old page 4/2); `voice_review_page` 124/0; the regenerated
  page's second generation is the same bytes (`1beee1cc1fa47233…`). Agnes's qualification: the test's comment
  promised more than it checked; the follow-up assertion (`55db809`) and the take's recorded key (`6f34bf0`) are not
  in this cut.
  The `book` test (RBN-QA-069's journey): on the task branch, and on CC-020's published cut, `book` failed "the
  Journey's Next says one destination once" (it read "Drowned Archive — Receiving Hall", not the Tide Clerk) and the
  Journey's word-help targets (164, not 160; the four are that Next line's words). RBN-QA-069 (`8f66b79`, before the
  cut) made `sg_main`'s stage 8 point at the Receiving Hall's door while the inner door is shut (`atIf
  !sg_da_catalog`), and the test's journey, at that stage without the flag, was never updated. The test now sets the
  flag; the product is unchanged. B `book` 15/0 on the task head's build (the same build with the old test 13/2);
  15/0 on `0944868`'s and `bc1bf37`'s builds. Recorded: the cut and `a3883be` also fail "opening, turning, restyling
  and closing never change the journey" (the book wrote `newItems`); the task head passes it; what cured it is not
  traced. Not in this cut: its parity check made device-independent (`d9fbc73`).
  RBN-QA-161: after Chapter 4 Fuki stands by the bell-post in the square, and her talk list there put her postgame
  news first, so after the story a Bell-Post rung at noon (stage 2) could never be reported: no cord, no signals note,
  no end to the quest. Her list in the square is now `quest.sb_bell=active` → `sb.fuki`, then `post` →
  `sb.fuki_post`, then `sb.fuki_after` (a stuck stage 2 reports at its next talk; no migration or reset); in
  `sb.fuki`, `quest.sb_bell>=1 -> go` becomes `quest.sb_bell=active -> go`, so at stage 0 she reminds you instead of
  meeting you again with her cold and the offer; the report's first line splits on `ch4_done`: in her house as before
  (the same key and recording), in the square 「{聞|き}こえた よ 。 {昼|ひる} の {鐘|かね} 。 {二|ふた}つ 、 きれい に 。
  {五十年|ごじゅうねん} {鳴|な}らして きて 、 {下|した} から {聞|き}く の は {初|はじ}めて だ よ 。」 / "I heard it. The
  noon bell. Two strokes, clean. Fifty years of ringing it, and the first time I've listened from down here." (a new
  key, unvoiced). The quest guide's next step for that stage 2 is now Fuki in the square (on the task head, none). U
  `fuki_bell_post` 12/0 (on the head's source 4/8); B `postgame_quests` 6/0 on its build `8fab8d12…` (control on the
  head's build `22e06af3…` 2/4: the four postgame checks); full units 58,131/0 on `cc1ce18`; on its build `story_ch4`
  (eight playthroughs, all checks ok), `goatshed_fence` 10/0, `guide_next_step` 24/0, `quest_guide` all passed; on
  `bc1bf37`'s build `postgame_quests` 6/0, `guide_next_step` 24/0. As Agnes bounds it (6374675900): part B, the
  never-started offer after the story, is not in it; the browser journeys are synthetic, the automated player
  answering; Kanta's routine places share the list but are not each traversed in the browser; a mid-scene
  interruption is not covered; the new outdoor line is unvoiced; neither stuck quest is closed on source agreement
  alone, and her native regression on `bc1bf37`'s build is not in the record.
  RBN-QA-162: the snow-sculpture contest is judged by talking to Kanta, whose list put his postgame news first, so
  after the story a contest left open could never be finished (his star-names line, no judging, no scarf, no next
  step). His list is now `quest.sb_snow=active` → `sb.kanta`, then `post` → `sb.kanta_post`, then `sb.kanta` (his two
  routine places share it); the contest's own scene unchanged; no line changes. U `kanta_snow_judge` 10/0 (on
  QA-161's commit without this change 3/7); in `postgame_quests`, Kanta judges, Chiyo's observatory wins, the scarf
  once, then his news. Not changed (an observation): after the story his judging opens with the late-lamp `:after`
  line, which rings a little stale.
  The Reedwake return-discovery pilot (Robin's approval, issue #1 6373239443: Reedwake only, passive and town-level;
  opportunities you have noticed that are reachable and unresolved, and stamps earned but not pressed; persisting
  until resolved, not cleared by a visit; no pop-ups, no spoilers, no new item or saved state): `returns(s)` in
  `src/engine/53_town.js` (pilot towns `['reedwake']`) reads a return key that was noticed, whose need is now known,
  whose spot still stands and whose map is within reach, and the town stand's earned, unpressed, known stamps, the
  stand within reach; within reach is the quest guide's `reachable()`; it only reads, so only opening the key or
  pressing the stamp clears it; twelve-chapter journeys only. Journey › Places gets one line per town, never what
  waits: 「{葦|あし}ノ{瀬|せ} で {気|き}づいた もの が 、 {今|いま} なら {開|あ}けられそう だ 。」 / "Something you
  noticed in Reedwake may open now." and 「{葦|あし}ノ{瀬|せ} に 、 {押|お}せる {判|はん} が {待|ま}って いる 。」 / "A
  stamp you have earned waits to be pressed in Reedwake.", one line when both hold; the Map's chart, a small paper tag
  by the town's dot with a title, its description, a legend sentence and the Travel row in words; "Town hints" (Shown
  / Off) turns all of it off; `docs/future/plan/06_WORLD.md` records the pilot. The key line first read 開けそう
  (ひらける, "open up", of a view or a way forward); `c6dfc35` makes it 開けられそう. U `return_hints` 26/0 (25/1 with
  the line as before; 25/0 at `4b105e1`, failing on the head, where `returns()` is not there); B `return_hints` 12/0
  (desktop and phone, a visit, save and load, opening and pressing, four absent cases, an older journey as one line
  with nothing popping up); nearby units `town` 87/0, `records` 272/0, `stampbook_sb1` 39/0, `living_world` 110/0,
  `chart_coast` 69/0; full units 58,134/0 on `4b105e1` (another unit run alongside); on `bc1bf37`'s build
  `return_hints` 12/0. Recorded: the browser test's first run was 7/5, all five its own legend check, which searched
  the page's whole text, the script included; the product was the same bytes in both runs. As Agnes bounds it
  (6374687480): "within reach" is the guide's map graph (exits and doors open now, places you can travel to), not
  tile-level access or leave to fast-travel from where you stand; the line can go before its resolution when what it
  depends on changes, and comes back when that holds again (no state of its own, by design); the "older journey" in
  the browser test is built by this build, not a historical save; the stone and the stamp were resolved through their
  own scene and the stand's hook, not by walking up and pressing. Before any wider acceptance: Local's independent
  review, the exact combined build and Agnes's native checks; their results are not in the record.
  RBN-QA-108: `yn.call` put Jinpachi at his place on the road, (5,14) on every station, off screen for every line when
  you stood further along; chained after the Cloudroad's end at Sakashita he was still walking there. Now
  `!walkto <who> pc [dir] [now|stay|run|max=N]` walks someone to a free tile within 2 of you (the one in front of you
  first, then the nearest; never an exit or a trigger, a reserved or occupied tile, the end of someone's way here, or
  your companion's tile), the first the walker can reach; already within 2, or no mark, nobody moves (no mark is
  recorded as a walk fallback); under Skip seen or behind a fade, set on the mark at once when it is free; a walk that
  runs out stops on the tile it reached; `var._walked` records 1 or 0, an outcome the quest guide does not guess; a
  speaker the scene's `pc` walk did not bring to you, speaking off screen, gets an arrow and "off screen" on the name
  plate. `yn.call`: `!walkto cr_jinpachi pc run max=8000` before his first line on every path; every line, flag and
  placement as it was; no new voice keys. After the letter he goes on down the road by his own way out: each placement
  carries `leave: 'way'` and `leaveTo`, the map of that place's west exit (`cr.oiwake` > `lf.road`, `cr.suginoki` >
  `cr.leg1`, `cr.sakashita` > `cr.leg2`, `cr.nakayama` > `cr.leg3`, `cr.umagaeshi` > `cr.leg4`, `cr.kirishita` >
  `cr.leg5`, `cr.kumoi` > `cr.above`, `cr.summit` > `cr.hut`, `lf.town` > `lf.road`); if that way cannot be walked he
  fades where he stands, recorded, never by another exit (before, the nearest way out, one tile, "nearest
  (unknown)"). B `jinpachi_letter` 15/0 with `1535c21`'s test fix (control on the base's build 2/13), then with the
  road 27/0 (control 16/11: exactly the 11 new departure checks); U `jinpachi_road` 4/0 (control without the road
  2/2); B `departures` all ok (the relay plays `yn.call` through: the approach `_walked` 1 and every line within 2;
  the departure one record to `cr.leg2` at 0,13, reason "authored", no fallback; control: exactly the departure check
  fails, "nearest (unknown)"); full units 58,131/0 on `fa32d23` (a browser test alongside); `b3a34ac` (test only)
  drives section 1 on until the letter is given and its scene is over, bounded at 20 rounds: `jinpachi_letter` 27/0
  on the road build; on `bc1bf37`'s build `jinpachi_letter` 27/0, `departures` all ok. Recorded: its first
  `jinpachi_letter` runs failed "every line of his within 2 of you" for Mio, Ren and Suzu at both sizes (the test took
  his lines in the companions' Cloudroad endings, before `yn.call`); one was stopped unfinished at a lane reorder and
  one, 9/6, began before the fix was committed; `departures` failed on its build ("one Jinpachi, from where he spoke
  (11,12) to his place at (5,14)": he settled at (18,11), beside you), its check sampling while `yn.call` still ran,
  which led to the decision on where he goes after the letter. As Agnes bounds it (6374238260): the roads come from
  each place's first west-edge exit, not a fixed table (`jinpachi_road` pins all nine against an explicit table and
  checks that no other way exists); the eight-second approach bounds the steps started, not the wall clock including
  the one under way; QA-124's failed control supplied nothing for QA-108. Out of scope, as Local agrees: his message
  in the three Cloudroad endings from 6 tiles away, on screen and unmarked.
  RBN-QA-124: Suzu's evening at the little theatre (`yn.suzu_evening`): the theatre is marked seen before the warp, so
  its daytime introduction never follows; the show is at night; Koume walks up to you after it (`!walkto yn_koume
  pc`, QA-108), the narration saying she walked over (the line as it was) or, with no free place near you, "When the
  show ends, Koume calls out to you." (a new key, `#b0ce1f1f0f`, on the re-record list; "walks straight over" keeps
  its key); a condition head `scene.<id>`, true while that scene runs for this journey, runtime only, places an
  audience of seven townsfolk without lines or names (`src/content/yn/28_playhouse_audience.js`): four on the
  benches' own tiles and three newcomers from the ridge on the floor in front of the stage, clear of the way down from
  the stage, your place, your companion's, the way out and every other placement; a mannerism profile may name such
  a person. `!warp <map> <x> <y> [dir] [ambience=<preset>]` sets the scene's ambience once the new map is entered and
  before its fade-in (an `entered` step in `RB.game.transition`), so the theatre is first seen at night and the place
  you leave is not tinted; `validate` checks the preset. U `playhouse_audience` 26/0 (on `3bfa708` 14/12; with
  `b006a78`, on `3b283cb`'s source 25/1, the warp's command check); `actors` 180/0; B `playhouse_audience` 15/0
  (control on the cut's build 4/11, and on QA-108's road build 4/11), then 17/0 with every fade recorded as it begins
  (control on `3b283cb`'s build 15/2: night off as the theatre's fade-in began); full units 58,157/0 on `3b283cb` and
  on `b006a78`; on its build (`5222612f…`) `steamhollow` 5/0, `companion_away` 31/0, `walkto_options` 23/0,
  `load_mid_scene` 19/0, `yn_guide` 25/0, `tsuneji_egg` 34/0, `departures` all ok. Recorded: its first full units
  58,035/1 (`actors.test`: the audience's mannerism profiles name people placed without a name), fixed test-side;
  its first browser run 13/2 ("Koume walks up to you after the show" at both sizes, with her beside you: the test's
  hook cut each line's English at 44 characters), and its control threw on the missing audience table; its control on
  QA-108's road build first did not run (the page outside the folder the test serves); the first full run on
  `e98cac6`, never pushed, had 4 failures, all in its unit test (58,153 passed). The seated poses are art: stills went
  to the owner privately, "implemented provisionally" until then. As noted with Agnes's REFINE (6374739355), and
  claimed no further: Suzu's journey only, not every companion or a six-chapter journey; a synthetic pre-show save,
  not a mid-show save; Skip's cleanup happens with the scene's end, not on toggling Skip.
  RBN-QA-164: each of the Hall's twenty floors with a way up has a one-tile exit, and its stairs stood on the tile
  beside it, so walking onto the stairs did nothing (natively, the first wing's first floor). Each stairs prop moves
  onto its exit's tile, on the same road and row: wing 1 (17,1)→(18,1) and (21,1)→(20,1); wings 2–10 floor 1
  (17,1)→(16,1), floor 2 (18,2)→(17,2); wing 4 floor 2 (31,3)→(30,3) (its stairs had no free tile beside them but the
  exit). Exits, destinations, arrival points, facing and the cleared-floor condition unchanged; the stairs stay
  non-blocking; the floor-3 lanterns and the foyer untouched; the art moved, not changed. U `hall_stairs` 4/0 (the
  source as before 3/1); B `hall_stairs` 4/0 on its build (on the task head's build 1/3: all twenty "no transition",
  wing 4 floor 2 unreachable); `hall` 4/0; full units 58,225/0 on `20e4121`. AGREEs on the exact candidate: Local
  CL-250, Agnes 6376447128. As Agnes bounds it: not native lighting inspection or whole-floor traversal, and the
  uncleared fixtures start beyond their gate. Not captured under Hall lighting; her native look is to come.
  RBN-QA-165: the kana completion took its example word from the whole lexicon, which also holds deliberate
  non-words (the wrong choices of the tasks that teach them: しほさい in `ko.toro_2`); only a homophone target left
  them out, so ほ could be asked, and accepted, in しほさい "(not a word: …)" (natively, the Hall's first tale); 46
  kana targets, hiragana and katakana, could draw one. Now every kana target leaves the non-words out; with only
  non-words to hand, the bare kana question, as before for a kana with no example. The task (item, answer, what it
  accepts, mode, script) and the mastery accounting unchanged; every other target asks exactly as before (59 pinned
  over 50 clocks by hash); `ko.toro_2` keeps its wrong choice and the lexicon its entry. U `kana_nonword` 7/0 (the
  source as before 4/3: the native case at its clock, the 46 targets at 200 clocks each, the fallback); the `kana`
  set 1,581/0, `homoph` 1,466/0; full units 58,228/0 on `42e7cd6`. Counts agreed with Local (CL-249, CL-251): 39
  deliberate non-words, 37 in the kana word index, the 25 at levels F and E holding the 46 targets. AGREEs on the
  exact candidate: Local CL-251, Agnes 6376447128 (who inspected but did not recompute the 59-target hash; the
  affected-target assertion is at least 40, not exactly 46; a repair of explicitly marked non-words, not a language
  audit). Open, a separate item outside this cut: the meaning-choice tasks draw their wrong options from the same
  index (candidate `a563040`, with its test refinement `7a3d6ee`).
  In candidate CC-021 (`6e3787fd…`, built from `26c08c7`), READY_FOR_QA, with `hall_door` 14/1 (a stale allowlist from
  before this cut, failing the same way on the task head's own build) and `fade_load`'s stopped run (15/0 on a quiet
  re-run on the same bytes) retained (VALIDATION, CC-021; not an all-green claim); RBN-QA-116 stays open, outside it.
  RBN-QA-163 A, B, B2 and C, QA-165's follow-up, RBN-QA-166 A and B, RBN-QA-167, RBN-QA-168, the `hall_door` and
  `jinpachi_letter` test fixes, RBN-QA-169 A and B and RBN-QA-170 (each on the exact commits listed in HANDOFF's CC-022
  entry, with its AGREEs as VALIDATION, CC-022 lists them; counts below are on the candidates' and the integrated
  heads' own builds, as posted; the matrix on CC-022's own bytes is in VALIDATION, CC-022):
  RBN-QA-163 A: the census's three new plaques (Chapter 4's, `mp/10_maps.js`) were drawn carved as soon as you had
  recorded a bridge's name, though the census says they are cut again once Sen has the names. They now carry
  `o.cut 'quest.mp_census=done'`, and the shared art's `named()` (`mb/02_art.js`: the flat and the drawn renderer and
  the drawn art's cache key) draws them carved only when that holds too; every older plaque, with no cut, as before.
  Their repeat text splits: before Sen, "The name is in your notebook. The plaque will be cut again once Sen has it."
  (self-reviewed in `docs/review/language/mp.json`); after, "The plaque reads: …" as before. Collection, count and
  reward unchanged. U `census_plaques` 4/0 (the source as before 1/3); B `census_plaques` 5/0 with a save and load
  mid-census (the task head's build 2/3). RBN-QA-163 B: at the Ink Bridge "Kakeru the courier runs up and says
  something" and at the Woodblock Bridge "Nearby, Sanpei goes over the bridge…", wherever they were (none of
  Kakeru's three places is at the bridge; Sanpei is on the street far from it, or in the press room). Each line now
  says what they once told you about the bridge, which the census's clue then gives in their words; nobody is brought
  in or walked (a staged arrival was tried and not kept: from these distances the walk-ins fell short of their
  bounds). U 5/0 (A's source 4/1); B 6/0, the scene at its own pace with Kakeru in each of his three places and Sanpei
  in both of his (A's build 5/1). RBN-QA-163 B2: Hayashi "calls out from the bank" at the Curtain Bridge, though none
  of his three places is on that bank; the line says what he once told you, as B does (U 5/0, B's source 4/1; B 6/0,
  B's build 5/1). AGREEs: A, B and B2 Local CL-253 and Agnes 6376933092 (source; her test limits: a mid-census save
  built for the test, Sen's handover simulated, one older plaque rendered though all are checked structurally).
  RBN-QA-163 C: the water under the Ink Bridge is said to be cloudy black, but the canal was drawn clear. A prop on
  Blockprint Row's first water row south of the bridge, `mp_inkwater` (18,24; 3 tiles), bakes a patch of ink into the
  ground under everyone: a pool in three flat tones of the canal's blue taken toward black where it comes out from
  under the bridge, two plumes trailing downstream, tendrils off them; only that row's water and the two after it,
  clear of the banks; the bridge's rows untouched; the water's glints still play over it; always there; nothing to
  look at, never in the way; a flat 16-px drawing for the fallback renderer. U `ink_water` 3/0 (the source as before
  2/1); B `ink_water` 3/0 (the ground there 50 against 69 further down; the bridge's rows 88 on both builds, reported,
  not asserted equal; the task head's build 1/2). AGREEs: Local CL-255; Agnes 6376933092 (bounded source scope, not
  pixel or art acceptance). Art: provisional under AC1_ART.md until Robin approves; captures to the owner privately.
  QA-165's follow-up: the three generated wrong-meaning pools (`vocabStep`'s recognition, the listening exam,
  bookmark practice) drew from the whole kana word index, which also holds the deliberate non-words, so a choice could
  read "(not a word: しほさゐ …)". Each pool now leaves out an entry the shared `RB.tasks.nonWord` marks (the kana
  completion's own test, `/^\(not a word\b/`). Targets, right answers, items, transcripts, explanations, seeds, the
  part-of-speech and inequality rules, bookmark practice's no-record steps and two-option floor unchanged; `ko.toro_2`'s
  hand-written wrong choice stays. U `meaning_pools` 13/0 after `7a3d6ee` (the source before 8/5): every unaffected
  target (5,895) hashed at one clock and one turn against the source before, bookmark practice sampled (said so), the
  whole journey unchanged by its steps, same-seed replay, and a sparse pool as a fixture (reported, not changed).
  AGREEs: Local CL-256, CL-261; Agnes 6377645693 (her limits: sampled bookmark checks, absent item ids rather than
  before/after learning state) and 6379369762 (the refinement: generation state through assertions, not the runner's
  noRecord path; sparse-pool behaviour documented, not a new guarantee).
  RBN-QA-166 A: the first wing's companion-map trial (`hall.w1f2` 26,22) says "On the stone table, an old map", but the
  station was a plain wooden table. That placement now uses `hall_maptable`: a grey stone slab on two squared feet, an
  old sheet with the floor's roads drawn faintly, an ink outline; no spring marked until the trial is completed
  (`hall.w1.t6`), then one small red mark where the floor's pattern puts it. Footprint, block, coordinates and scene
  the plain table's; no other table changes; a flat 16-px drawing too. U `hall_maptable` 4/0 (the source as before
  0/4); `12c0a6c` corrects three comments only. AGREEs: Local CL-255, CL-257; Agnes 6377645693 (qualified: the flat
  renderer's states do not establish the drawn art's readability or cache behaviour) and 6378506608 (the comments).
  Local's note for Robin: the red mark is only a couple of pixels at 1280×800. Art: provisional; captures to the owner.
  RBN-QA-166 B: each story room's task asked you to put "the four pictures" in order, but the cards are four written
  passages. The 43 English strings of CC-156 §5 change and nothing else (the narration, which is recorded, the tiles,
  answers, items, hints' substance and the Japanese as they were). U `hall_story_passages` 3/0 (the source as before
  2/1); B 4/0, each tier's first use, a wrong order and "Come back later" in the first wing (the task head's build
  3/1). AGREEs: Local CL-256; Agnes 6377645693 (all 43 changes checked; the ten wings covered structurally and the
  first wing's four tiers in the browser, kept distinct; the generic scroll art's limitation stays open).
  RBN-QA-167: with the Ledger open, a setting changed on its Settings sheet (Town hints, Finding the way) left the
  Journey's Places, the Map's tags and the followed quest's mark as they were until the Ledger was opened again. The
  menu's `refresh()` now redraws an open Ledger's page in place (its scroll remembered; no reopening, restyle or reset)
  when the ordinary Settings sheet closes over it; a battle's, a new journey's review or draft, and Settings opened on
  their own, open no Ledger. B `settings_ledger_refresh` 8/0 (CC-021's build 5/3). AGREEs: Local CL-262; Agnes
  6379369762 (her limits: Reedwake's eligibility synthetic; the first leaf's scroll measured, not both; focus "inside
  the Ledger", not the exact control; the exclusions read in source, not run). Her native retest follows publication.
  RBN-QA-168: in "Review a saved chain" each record's button sat in the 1.6em icon column of the generic `.entry`
  grid, about 44 px wide, its words spilling out. `.wp-trlist > .entry > .wp-tr` now spans the row; the generic
  `.entry` and `.pbtn`, the markup, labels, behaviour and focus ring unchanged. B `wordplay_records` 11/0 (CC-021's
  build 3/8), at 1188×848 and 390×844, 100 % and 140 % text, one record and four, with Tab and the list's navigation.
  AGREEs: Local CL-265; Agnes 6379877999 (scoped to the saved-chain list; synthetic copies, not native history).
  The `hall_door` test fix: its exact allowlist of wall-drawn props had not been updated when RBN-QA-111 gave Sono's
  noren `onWall`, so it had failed since (CC-021's matrix, 14/1). The list adds `cr_noren` only; the village doors stay
  outside it. No product change. AGREEs: Local CL-259; Agnes 6378879095.
  The `jinpachi_letter` test fix: its Skip-seen case raced the engine's 900 ms map-entry window (VALIDATION, CC-021).
  It now begins once the map time is past 900 (bounded; a wait that runs out fails), keeps the strict assertion, and
  a control inside the window asserts what the engine does there, unchanged (he comes up, the letter is given, `a.letter`
  checked since `3117524`, and he is simply gone, unrecorded). No product change. AGREEs: Local CL-261, CL-265; Agnes
  6379877999 (every earlier timing qualification and failure kept on record).
  RBN-QA-169 A: the festival corner's Timed label and the Pastimes how-to line said the clock stops "while a hint is
  open". Now the how-to line says that in a timed round of water-balloon fishing or ring toss, Hint or "What does it
  say?" stops the clock for up to 2.5 seconds, then it runs again, the clue able to stay shown (its Japanese says
  少し の 間 だけ, neither 秒 nor 最大 being in the lexicon; Agnes approved it, 6380181634); each game's definition can
  carry `helpPause`, and only those two say so; the other three say nothing of a pause. Copy only. RBN-QA-169 B: every
  press of ring toss's "What does it say?" added a pause and its own resume, so pressing again and again held a timed
  round's clock, and a timer from a round just left could resume the next round's own stop. Now one stop at a time
  (pressed again during it, the English shows again, the stop neither deepened nor lengthened); once over, another
  press stops it again for 2.5 s (successive stops are not prevented); the timer is the round's own, cleared when the
  game stops. Practice, scores and records unchanged. B `festival_help_pause` 13/0 (A's build 11/2; CC-021's build
  9/4). AGREEs: Local CL-265, CL-267; Agnes 6380186097 (her limits: synthetic and direct controls; the Japanese checked
  for the games' names, not meaning; dedicated wrong-answer, Practice-finish and visibility-overlap cases not in the
  suite; isolation for this help timer, not every animation timer).
  RBN-QA-170: a companion's action read `st.lastPlayer`, which only an ordinary response writes, so in a procedure
  under pressure (the Founder's Voice) Suzu's Encore spent its use on a step right first time and gave no Harmony, and
  an earlier response could qualify or disqualify a step for Encore, Lend a hand, Heckle and Spot the opening. Now
  `compAct` reads this exchange's response (`playerAct`'s, which now carries `ok`, or a step's), and `st.lastPlayer`
  only without one; a step answers no move, and is ok and perfect only when it is the right step written so (Resolve
  neither). Visible: Lend a hand loosens a knot on a step right first time. Ordinary battles read exactly as before.
  U `companion_response` 17/0 (on CC-021's engine 6/11, reconciled in VALIDATION, CC-022); the simulator's 96 battles'
  digest `7dda451b22994346` on both. AGREEs: Local CL-270; Agnes 6380556574 (the digest sampled, not exhaustive; direct
  absent-response and failed-language-response cases are coverage limits).
  In candidate CC-022 (`90cf14b3…`, built from `3d90956`), READY_FOR_QA (the matrix on these bytes: 116 of 116
  suites; VALIDATION, CC-022); RBN-QA-116 stays open, outside it.
  In candidate CC-022 (`90cf14b3…`, built from `3d90956`) as recorded above; CC-023 adds, each on the exact commits
  listed in HANDOFF's CC-023 entry, with its AGREEs as VALIDATION, CC-023 lists them (counts below are on the
  candidates' own builds or on the cut, as posted; the matrix on CC-023's own bytes is in VALIDATION, CC-023):
  RBN-QA-172: your pet could settle, rest or be placed on water (at Sazanami's jetty it curled up on the shallow
  waterline). Its resting place, step aside, placement at a map's entry or after a catch-up, and a scene's "come here"
  now exclude water-kind tiles; a pet standing in water stays on its feet until it can step onto dry ground or you move
  on; its trail still follows you through the shallows. Refined (Agnes 6381070442): nowhere dry and free within three
  steps no longer leaves it placed unseen for good (it looks again at each new tile you reach and fades in at the first
  dry spot); Greet together needs a free dry tile beside your companion and says why not ("Not here — there is no free
  spot on dry ground beside your companion. Try again somewhere with room."), a rest point's menu leaving the choice
  out; an authored movement on water keeps its feet. Narrowed as Agnes asks: a handoff (where a vignette's animal was)
  is taken as authored, even on water, and steps off once still; actor pets and vignettes' animals untouched. B
  `pet_dry_ground` 17/0 (the first commit's 7/0, CC-021's build 5/2).
  RBN-QA-173: Sazanami's fishing station "among the rocks" stood on the shallows with nothing under its stand. For this
  station only, a flat prop `coast_shelf` (never solid, drawn under whoever stands on it) lays a slab of wet rock at the
  stand, and the station's new 'rocks' look puts its stake among two wet rocks with a rod lashed to it, its line in the
  water; both appear with the station; tiles, walking, collision, interaction and boat routes unchanged; the flat (16 px)
  renderer draws the same rocks and rod (refined, Agnes 6381589930). B `rocky_station` 8/0 (CC-021's build 5/3; its depth
  check computes the renderer's order, and says so). Art: provisional under AC1_ART.md until Robin approves; captures to
  the owner privately.
  RBN-QA-174: a voyage the crew sails was not seen at sea, and the fog was not shown. From port the crew now puts the boat
  out on the sea map with the same one transition a voyage you sail makes (the town count and visits move as a solo
  voyage's do); before "The crew lowers the sail…", the boat is set at the destination's water in the dark of a fade (no
  transition, visit, autosave or entry event), then docks as before; `sea.sit_fog` turns the fog ambience on and lifts it
  at its end. Refined (Agnes 6381070442, 6382201500; Local CL-286): with the destination's water taken, or without
  staging, the arrival is told over the dark and the boat is seen next at the dock; a campaign change (a load, even one
  cancelled; a new journey; the title) ends the crossing where it is, also in the dark before the arrival and as the
  screen lightens on her; the comment says what happens without a placement (comment only, `f300a0e`). B
  `crew_voyage_sea` 18/0 (`147fbac`'s build 16/2; CC-021's 5/6 for the first commit's 11). Limits as Agnes states them:
  the empty parity compares against a direct solo arrival; the fog fixture stubs the challenge's success; eventful,
  battle and postponed parity are not run.
  RBN-QA-175: Ashihara's notice board was drawn with its usual papers whatever was posted, so "Nothing on it yet" stood
  under papers. The board now draws the notices `as.board` has (Mitsue's call for the roads' names, the washing's, the
  market's and the channel's turns; a child's festival picture after the festival), in both renderers; the empty line is
  said only with no washing notice up (text and voice key unchanged). Every other board draws as before. B
  `ashihara_board` 8/0 (CC-021's build 1/7). Art: provisional under AC1_ART.md; captures to the owner privately.
  RBN-QA-178: each shogi lesson says its task in both languages; the rook's lesson names both squares it accepts ("…up
  its file to the pawn's rank…, or along the bottom rank to beside your king") and starts with your partner's king one
  file over, out of check; the lesson's piece moved somewhere not asked: "The rook can go there, but that isn't the square
  asked for: start again."; the eight lines self-reviewed (pastime:shogi), not spoken. U shogi 84/0 (before: 74/10); B
  `shogi_lesson_goals` 28/0 (the base 12/16). The unit check matches the rook's Japanese by its exact ruby strings
  (`e56104c`, test only).
  RBN-QA-179: a lesson, puzzle or game opened from the shogi ladder kept the ladder's scroll, its heading above the page.
  Opened from the ladder, it starts at its top with its heading focused; Back to the ladder, Leave and Escape bring the
  ladder back where it was, the opening button focused; Start again, New game and in-game choices keep their place. B
  `shogi_ladder_place` 20/0 (the base 8/12); its test checks QA-178's words for the rook's wrong square exactly and
  measures the ladder once the game's faces are in (`b942949`: before, 19/1 in four runs; after, 20/0 in five of five).
  RBN-QA-177: Ashihara's first festival had no pupils during "Kotoe's pupils sing, holding up paper…", and the fire's ring
  kept walking through "everyone … round the fire". With Kotoe's school, a night phase shows Kotoe and four children with
  sheets of brush strokes (never letters); the fire's last phase stops the ring where it is, everyone facing the fire
  through the gift; the line's English becomes "Last of all, everyone gathers round the fire." (its Japanese and voice
  key unchanged). Refined: where the ring came to rest belongs to its playing (looking back to the dance and forward
  again finds it where it stopped); the shot's own Replay while looking back dances again and comes to rest exactly where
  the ring stood, with no jump. B `festival_phases` 20/0 (`919a359`'s build 19/1; `4d63e7d`'s 15/3; CC-021's 5/7 for the
  first 12). Art: provisional under AC1_ART.md; captures to the owner privately.
  RBN-QA-180: on the Hall's second wing, floor 1, "a white box" was the generic chest and "a red bundle" the generic
  crate. Two props, `hall_giftbox` (white paper tied with a red and white cord) and `hall_bundle` (red cloth knotted on
  top), each with a blank tag; only the two map entries change; tiles, solidity, scenes and gates as before. B
  `hall_gifts` 12/0 (the base 9/3; the other 130 chests and crates drawn as before, both renderers). Its card: passing
  the go-between's trial says "The wrong card blows away on the wind", and the card it had wrong is now gone (recorded at
  that moment by the floor's pattern and the tier asked, under the floor's prefix so its reset brings it back; put off,
  nothing recorded); no line or voice change. B `hall_card_gone` 24/0 (its parent 5/19). Not a migration of trials passed
  before it (Agnes 6384737918). Art: provisional under AC1_ART.md.
  RBN-QA-181: picking up a second gift put the first down without a word, and the trays stayed bare. Already held:
  "You're already carrying the X."; holding another: "You put the H back in its place and pick up the X."; the first time
  on the floor, "You can carry only one at a time."; the trays show the gift put on them (built from the tags), and a tray
  with its gift keeps the table's two-tile footprint (refined, Agnes 6383653732, Local CL-298). B `hall_trays` 27/0
  (`46b8694`'s build 24/3). 12 new lines ledgered, unvoiced.
  RBN-QA-176: Ashihara's quarrels were narrated "arguing at the sluice" and "Outside the forge" wherever the two stood;
  the forge's hours went up on a freestanding sign though the line says the tag hangs on the door; the gathering was told
  with nothing showing time pass; "Say back" said nothing of the other party. The hours' tag now hangs on the forge
  door's post (the sign at (16,8) gone; `hall_door`'s allowlist gains it); the other party walks up to you first (a walk,
  bounded at 8 s), the intro said only with both there ("Yoshizō and Taki are arguing over the sluice." / "Natsu stands
  facing Shō, the baby in her arms.", the two then facing each other); a walk that does not arrive gives no intro and
  marks the away party's lines as off screen (RBN-QA-108); the gathering is told over a fade; "Say back"'s first use with
  the other still heated adds "Taki is still waiting to be heard." / "Natsu is still waiting to be heard.". New lines
  self-reviewed and unvoiced; two retired takes kept. B `ashihara_quarrels` 24/0 (`2e216e9`'s build 23/1; the cut 3/16;
  the test also rejects the old "arguing at the sluice"). Art: provisional under AC1_ART.md. The first units' unnamed
  58,302/1 stays open (Agnes 6385106726).
  RBN-QA-182: a tap on someone who moved while you walked to them found nobody and did nothing, silently. Someone who
  walks, still there and moved away, is followed once more (one retry, for them only); moved again, gone, replaced or
  unreachable: nothing, no third walk; props, your companion and counters as before. Refined: a scene or a battle begun
  while a tap's walk is under way drops the walk before its step arrives (a menu or the folio only pauses it). B
  `tap_moving` 18/0 (`7f6fd0d`'s build 14/4; the cut 3/8 for the first 11); `counter_tap` 30/0. Its test plays each
  interruption through before claiming nothing after, leaves the battle by Step back, and holds the direction key until
  the walk is dropped (`190a275`).
  Manybridge's arrivals (`ffd82ce`): someone not yet seen walks in from the nearest place the story keeps them; RBN-QA-020's
  festival-night placements are marked `visiting` and skipped by that one search, so the lock's boatmen no longer walk in
  from the playhouse and stand blocked. B `arrival_origin` 5/0 (the cut 3/2); `sequence_world --only mb1.named` (full)
  210/0 (the cut 206/4).
  The writing pad (`93690f1`): a kanji it is not sure of offers up to four closest kanji and waits for a pick, but since
  FR-1 renamed Confirm "Add character" the longer button hid all four at 390 px (two even at 1280 px). With a pick
  required, every candidate stays in view and the button takes the next line. B `pad_kanji` 9/0 (CC-022 6/3).
  The kept prop line (`2ee20e0`, `12a5492`): a prop's own line, kept, lost its prop and tile (its source read as
  "removed"). Its source is now the prop read in front of you when its own line is the one shown (nothing guessed
  otherwise; old bookmarks left as they are), and the scene id it was shown under is kept beside it, so "Hear it" asks
  for its recording (`code.prop#790660feb5` for the miller's notice). U bookmarks 85/0; B `bookmark_prop` 16/0
  (CC-022 12/4), `bookmarks` all ok.
  The test driver's hold (`ac359cd`): `arrive()`'s hold test moved, as it was, into `RB.world.holdAt` (behaviour
  unchanged); the driver takes no exit a map's hold holds; `long_quests` takes the fare line in the order the game allows.
  U `map_hold` 17/0; B `drive_hold` 9/0; `long_quests --all-companions` all passed.
  Test fixtures only, the game unchanged: `pets_greet` (the synthetic start records its self-starting quests before the
  baseline: 5/0, without it 1/4); `manybridge` (the chart's places counted by their own dots: 3/0, without it 2/1);
  `play_ui` (the New Game+ offer timed in the page; the word-help tap made on the line outside the sheet, measured, and
  reported for product review when none is found, worded as measured); `bookmarks` (at the two phone layouts, Next measured with
  and without the tab in the same frame; the wide layout's check left measuring twice, which failed once in the
  matrix: entry 122, VALIDATION, CC-023); `pets_gallery` (each pet sound compared with the menu confirm as both are played: 7/0;
  waveform peaks, not listening); `audit_fixes` (FR-1 F10's "Practiced with the model to copy": 4/0, CC-022's own 3/1);
  `battle_anim` (the slip's −1 tested where mistakes cost, and Assisted, a new journey's default, costing nothing: 17/0 on
  Local's run, CC-022's own 15/1). Test and tool paths from `import.meta.url` via `fileURLToPath`/`pathToFileURL` and the
  Harmony hashes keyed with '/', so they hold on Windows (`9db07a5`, `f3fa22d`; Local's Windows 58,303/0).
  Known and open in CC-023, not fixed by it: the Lantern Hall's guidance after the companion choice (since `db05df2`,
  RBN-QA-004: "Next: here, in Lantern Hall." with no mark on the shrine; VALIDATION, CC-023, entry 151; repair for
  CC-024); the first mouse press on a Respond card, when the first card has focus-visible styling (given by keyboard
  focus: of the four ways into a battle tested, a mouse click on the foe, a focusable control clicked first, touch taps
  and the keyboard, only the keyboard reproduced it; the pointer ways may have included a click on Next, which the
  probe did not log, so a bare click on the foe's tile is not isolated; a card focused by script in a page where
  nothing focusable had been clicked, as in `card_fold_press`'s first start, also had that styling, so a keyboard-only
  limitation is not established in general; CC-213, Agnes 6394392695), at enlarged-text, scrolled layouts (VALIDATION,
  CC-023's known limitation; repair for CC-024); `harmony_cutin`'s two painted sections' timing checks, classed fixture
  faults, repairs for CC-024 (VALIDATION, CC-023).
  In candidate CC-023 (`4d84f291…`, built from `3022cea`), READY_FOR_QA (the matrix on these bytes: 167 run, 164 with no
  finding; `bookmarks` and `fishing` first-attempt failures and `quest_guide_audit`'s two findings, each classed in
  VALIDATION, CC-023); RBN-QA-116 stays open, outside it.
  In candidate CC-023 (`4d84f291…`, built from `3022cea`) as recorded above; CC-024 adds, each on the exact commits
  listed in HANDOFF's CC-024 entry, with its AGREEs as VALIDATION, CC-024 lists them: the Respond list's first press (B
  `card_fold_press` 23/0 on the candidate's build and on the integrated tip's page, 17/6 on CC-022's page, exactly its
  first-press checks; Local's Windows 23/0, control 17/6; the shared guard unchanged); Two Names' first step (U
  `quest_guide` five states, a saved state validated and loaded, the static derivation; B `two_names_guide` 13/0, on
  CC-023's page 10/3, the shrine cases; `quest_guide_audit`'s `rw_depart 0→1` a hit); the `bookmarks` wide layout's Next
  check (all ok (6) three times on CC-023's page, Linux and Windows); `harmony_cutin`'s painted sections' timing checks
  ("painted sample" and "painted geometry" 3/3 each on CC-023's page, Linux; Windows evidence apart, VALIDATION,
  CC-024). CC-023's known limitation, the first mouse press on a Respond card when the first card has focus-visible
  styling at affected enlarged-text, scrolled layouts: fixed as tested (`card_fold_press`'s layouts and starts, the
  guard's controls, CC-022's page failing exactly the first-press checks; not established beyond them). The Lantern
  Hall's guidance after the companion choice: fixed (RBN-QA-004's `at` superseded by `atIf`).
  Known and open in CC-024, not fixed by it: `co_main 6→7` (`quest_guide_audit`'s one miss; the kiln as designed; its
  authored-open audit change a separate REFINE); CC-212, `harmony_cutin` "painted geometry"'s 2048×1046 compact choice:
  a harness interaction with the art caches' one-set-per-page assumption (the suite's mid-page install of a same-version
  synthetic set reusing the approved set's cached `prep_a`; the stated prediction held in all 45 of v6's row-instances
  on Windows), not a shipped-player defect within the reviewed load-time install scope; its failures stay failures; no
  repair authorized (VALIDATION, CC-024); `fishing`'s unreproduced first-attempt failure (VALIDATION, CC-023); the unit
  run's memory near Node's default heap on Windows (VALIDATION, CC-024).
  In candidate CC-024 (records for review; the cut expected to give `f47eb113…`), READY_FOR_QA once its cut is agreed
  (Cloud's lane on the integrated tip's page: U 58,365/0 and every browser step exit 0, `quest_guide_audit`'s one
  finding `co_main`; Local's Windows lane: every browser step passed but `play_ui`'s known help-sheet report; units
  58,365/0 only with a changed 8,192 MB heap, two heap-limit failures at the default kept; no all-suite matrix);
  RBN-QA-116 stays open, outside it.
  In candidate CC-024 (`f47eb113…`, `0ab9c53`; published and verified live) as recorded above; CC-025 adds, on the exact
  commits listed in HANDOFF's CC-025 entry, with its AGREEs as VALIDATION, CC-025 lists them: twenty campaign slots
  (R14.1, by the owner's authorization superseding SPECIFICATION §14's six; B `save_slots20` 9/0 on the integrated tip's
  page: CC-023's own page's 25 stored records byte-equal after this page opens and lists them, pages and tabs, the 720
  px breakpoint five times, New Game's dispatch to slot 7, a save into 15 reloaded and loaded, Copy by touch and
  keyboard with its replace question, Delete and overwrite asked first, New Game+'s twenty, slot 12 read-only in a
  second tab, a full localStorage failing a save visibly; `title_ledger` 21/0; U 58,365/0); the 720 px breakpoint fault,
  live in CC-023 and CC-024, fixed as tested (`save_slots20`'s 800 → 700 → 800 cycles; the controls on the earlier
  commits failing exactly there). Not established: every one of the twenty slots exercised through every operation;
  native play on these bytes.
  In candidate CC-025 (records for review; the cut expected to give `d15e2854…`), READY_FOR_QA once its cut is agreed
  (Cloud's lane on the integrated tip's page: U 58,365/0 and every browser step exit 0; Local's Windows outcomes on
  `7bffab6` carried over as same-byte evidence: `settings_review`'s environment failure and the launcher's first
  failures kept, units 58,365/0 only with a changed 8,192 MB heap; no all-suite matrix); RBN-QA-116 stays open, outside
  it.
  In candidate CC-025 (`d15e2854…`, `0062b37`; published and verified live) as recorded above; CC-026 adds, on the exact
  commit in HANDOFF's CC-026 entry, with its AGREEs as VALIDATION, CC-026 lists them: RBN-QA-183, Nao's warehouse
  narration (`rw.nao_first` index 4) without the hat its Japanese had and its English and art never had (B
  `nao_first_words` 7/0 on the integrated tip's page, its control on CC-025's page 5/2, exactly the 帽子 checks; the first
  outcomes of a selector fault kept; U 58,365/0); its voice is open: the new text's key has no recording, so the
  device's Japanese voice or silence until voice work resumes. Not established: audio; native play on these bytes.
  In candidate CC-026 (records for review; the cut expected to give `b072a8b9…`), READY_FOR_QA once its cut is agreed
  (Cloud's lane on the integrated tip's page: the build equal to `b072a8b9…`; `validate` no errors; `nao_first_words`
  7/0; staging 28/0; `practice_b` 6/0; `landmarks` 54/0; `voice_runtime` 9 passed, 1 failed: its offline-package step,
  the tool's own message not captured; insufficient space the supported explanation, not a proven error (a 524 MB copy
  into about 170 MB free; Local CL-405, Agnes 6403904805); it packages the tree's committed page, not this one; Local's
  Windows run (Local CL-401, on bytes normalizing to `b072a8b9…`: `nao_first_words` 7/0, control 5/2, staging 28/0,
  `review_ledger` 2/0); no all-suite matrix); RBN-QA-116 stays open, outside it.
  In candidate CC-026 (`b072a8b9…`, `2abfc60`; published 10-26 02:57:27Z and verified live) as recorded above; CC-027
  adds, on the exact commits in HANDOFF's CC-027 entry, with its AGREEs as VALIDATION, CC-027 lists them: Chapter 1's
  bridge sequence keeps the shoji panels' picture and the eave lantern while they are unchanged, instead of building
  canvases on every held frame (two per frame in the cup and door shots, one in hana and close) (B `bridge_alloc` 11/0;
  byte for byte against CC-026's page at 8 moments and 28 uninterrupted draws, 14/0; its control on CC-026's page 8/2,
  exactly the slot and no-allocation checks; U 58,365/0). Not established: any effect on the native renderer exits;
  native play on these bytes.
  In candidate CC-027 (records for review; the cut expected to give `2998a88c…`), READY_FOR_QA once its cut is agreed
  (Cloud's lane on the integrated tip's page: `validate` no errors; `bridge_alloc` 11/0, against CC-026's page 14/0,
  control 8/2; `sequence_art_integrity` 32/0 and `--quick` 32/0; `sequence_manual --quick` 64/0; `sequence_world
  --quick` 911/0; `sequence_shots` (`ch1.bridge`) exit 0; `records` 7/0; `departures` all ok; `festival_phases` 20/0;
  `tide_night` 45/0; `spoken_lines` 30/0; Local's Windows run (CL-421, on bytes normalizing to `2998a88c…`:
  `bridge_alloc` 11/0, against CC-026's page 14/0, control 8/2; `sequence_shots` (`ch1.bridge`) exit 0; `records` 7/0;
  `departures` all ok; `sequence_art_integrity --quick` 32/0; a matched probe: per held frame 2.000 `makeCanvas` calls
  in cup and door on CC-026's page, 0 on the candidate; not a crash finding); no all-suite matrix); READY_FOR_QA here is
  not a native playthrough and says nothing of the crash investigation, which stays open (Agnes 6408626132); RBN-QA-116
  stays open, outside it.
  In candidate CC-027 (`2998a88c…`, `cebe50f`; published 10-26 14:48:56Z and verified live: Local CL-424, Agnes
  6419303064) as recorded above. Native play on these bytes: Agnes's one bounded replay passed the bridge's reach → cup
  crossfade, then met a fourth native renderer exit at the close shot (its time unknown within the interval before it
  was seen; cause unclassified; HANDOFF and VALIDATION, CC-027); not a native acceptance.
  Later (HANDOFF and VALIDATION, after `e646363`): a fifth native exit with automatic recorded dialogue playback Off,
  after the waterwheel Next and before the h-row and the bridge, the setting then restored (Agnes 6421646528); Cloud's
  headless, synthetic runs (D-27a a partial harness failure; D-27b complete, a coarse characterization) and a read-only
  review established no leak and no exit cause; native play stays paused at Slot 7 (Agnes 6425757246); not a native
  acceptance.
  RETESTED_BY_AGNES on CC-006 (`79e0ef32…`):
  RBN-QA-025 PASS (her original post-seal save enters the kiln; before entry the guide says "Go to The Great Kiln").
  RETESTED_BY_AGNES:
  RBN-QA-002 (the stand
  where every stamp is earned), RBN-QA-004 (the nudge "Go to Lantern Hall." and "… Head north-west first."; the
  false message is gone; Agnes does not claim the marker's drawing).

- R1.1/R1.2: CSP forbids network; all browser tests record zero external requests.
- R1.3/R14.x: tests/e2e/ui.mjs (IndexedDB probe, session-only banner under refusal, reload persistence, copy independence, delete, overwrite confirm, cross-tab read-only, pre-departure recovery, file:// mode).
- R4.1/R4.2: ui.mjs new-game test (prologue skip → creation → setup → world).
- R5.x: tests/e2e/story_ch1.mjs (all 4 companions; provisional switch; commitment only via "Set out with…"; lock after departure; no third member).
- R7.1–R7.3, R7.8: ui.mjs combat test; RB.combatLogic caps mistake cost; RB.test.battle verifies Unravel-only wins.
- R8.2/R8.3/R10.5: ui.mjs handwriting test (mode switch keeps step; IME Enter during composition does not submit; mastery tallies by mode).
- D1–D12: docs/addendum/COVERAGE.md maps every addendum acceptance item (§23) to its tests and captures.
- K1–K10: tests/unit/recog-coverage.test.mjs, kanji_chart.test.mjs, recog-kanji.test.mjs; tests/e2e/kanji_chart.mjs, pad_kanji.mjs; tools/kanjivg/kanaparity.mjs and eval.mjs --kanji.
- R9.x: tests/unit/recog*.test.mjs (396 checks) + ui.mjs (reference strokes, wrong kana recognised then explained, nonsense rejected, composition edits, real mouse stroke). Human handwriting NOT tested.
- R11.1: tools/validate.mjs rejects any kanji without ruby; R11.2/11.3: ui.mjs lightbulb test.
- R18.1: tools/validate.mjs (also warns on unreachable exits, NPCs and interactable props).
- R3.1/R3.7/R5.x: tests/e2e/matrix.mjs — for each of F/E/I/A × Nao/Mio/Ren/Suzu a new
  campaign recruits that companion through the story and reaches the end of all six
  chapters and the epilogue (goal-directed driver tests/e2e/drive.mjs through the real world).
- R3.x/R5.7: per-chapter story tests (tests/e2e/story_ch1/3/4/6.mjs, side_ch3.mjs) and the
  blind explorer (tests/e2e/explore.mjs) reaching each chapter's end flag.
- R15.x: tests/e2e/atlas.check.mjs, tests/unit/atlas.test.mjs (self-check sweep).
