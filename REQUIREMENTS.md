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
