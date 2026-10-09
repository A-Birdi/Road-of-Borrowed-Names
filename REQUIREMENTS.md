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
- [v] R14.1 Exactly six slots: new/save/load/copy/overwrite/delete; thumbnail + metadata
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
- [ ] WP5 Illumination and atmosphere layers, each switchable (W01).
- [ ] WP6 Reedwake's kit (W02).
- [ ] WP7 Two purposeful actions (W03).
- [ ] WP8 The Reedwake slice with a battle, and its evidence (W04).
- [ ] WP9 Saltglass reusing the method, and the reuse report (W05).
- [ ] WP10 Robin's visual acceptance of the method (the P01 gate). H.

## Evidence index (see VALIDATION.md for commands and dates)
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
