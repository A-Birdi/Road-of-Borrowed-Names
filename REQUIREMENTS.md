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
- [v] B11 Multiple enemies and Harmony were investigated first (docs/COMBAT_NOTES.md). Groups of creatures were then built (G1–G12 below); Harmony charges remain undecided.
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
- [v] B16 (Before G1–G12, 2026-09-29.) No battle had more than one enemy at once, confirmed from the code:
  - There are 7 scripted battles (the Hush appears twice only as the same boss's retry path).
  - There are 49 placed foes, each fought one at a time.
  - An Atlas room may hold a guard and a roaming foe, but each is its own one-on-one battle. Some single creatures are drawn as a group (moths circling a lamp, a doubled voice).
- [b] B12 Blocked on people or hardware; not verified: Firefox and Safari. Your report came from Firefox, and the Next-button fix was reproduced and verified in Chromium only. Also unverified: real phones, touch hardware, frame rate on phones, and a human judgement of the new art and motion.

## Groups of creatures, the companion's turn, the difficulty curve (lead's brief of 2026-09-29; docs/COMBAT_NOTES.md; VALIDATION.md "Groups of creatures")
- [v] G1 The setting decides how many creatures come: Relaxed 1, Standard up to 2, Demanding up to 3, at the group placements of the last chapter's final stretch (`sa.stacks`, `sa.conduits`) and in the Atlas (rooms and the guardian's attendants).
  - Evidence: battle_group.mjs §1 (the Stacks, the Conduits, a seeded Atlas room and the guardian at all three settings); unit combat_fairness and combat_curve (every placement at every setting); validate.mjs checks the group ids and sizes.
- [v] G2 Targeting: a click or tap on the creature or its slip, the arrow keys on the slips, `[` and `]`; one clear target (a bracket at its feet and a marked slip); a sensible default (the most threatening) that is remembered; screen-reader labels and announcements. Evidence: battle_group.mjs §2 (mouse, keyboard with visible focus, touch at 390×844).
- [v] G3 Previews on every creature and ally a response reaches (hover and keyboard focus), kept through its step, cleared on "Choose a different response"; group responses from existing words (water, wind) explained in the keyword help. Evidence: battle_group.mjs §3; unit combat_rules (reach).
- [v] G4 Each creature telegraphs and acts in turn, settles on its own, and the encounter is won after the last; every result applied once, and the screen ends equal to the rules; the placement's flag is set once. Evidence: battle_group.mjs §4 (a Demanding trio of moths played out by mouse); unit combat_rules.
- [v] G5 Techniques with group effects (Suzu's Curtain Call turns every creature's move back), single-creature numbers unchanged. Evidence: unit combat_rules.
- [v] G6 Small screens, 200 % text, reduced motion and the Next button after a group battle. Evidence: battle_group.mjs §5 (320×640, 320×640 at 200 %, 1280×800 reduced motion, 844×390): nothing runs off the side, slips ≥ 44 px and not stretched, still marks, Next on top. Limit: a 320×640 portrait stage keeps its 60 px minimum (as with one creature).
- [v] G7 The companion's turn: after the response's step succeeds it is queued; the companion's support menu (no language step); "Back to <you>" (click or Escape) with nothing lost; then response → companion → creatures. Evidence: companion_turn.mjs §1 (the rules' calls and state checked before and after); §4 plays the late-alliance actions on screen.
- [v] G8 Companion actions are data (`C.companionActions`) and follow the story: first at recruitment, then `ch2_done`, the personal quest, `lq_ally1`, `lq_ally2`; a new one is announced once; the late-alliance actions keep the scenes' promises. Evidence: companion_turn.mjs §2; unit combat_rules (effects, uses, the late-alliance actions).
- [v] G9 Companion actions preview whom they act on and can be aimed at another creature without changing yours. Evidence: companion_turn.mjs §3.
- [v] G10 Companions support; the technique stays their one strong act; old passives folded into actions without counting twice. Evidence: unit combat_rules (no passive draught/opening/lamp/laugh), combat_curve (rounds with a companion ≥ 70 % of rounds alone; the whole arsenal ≥ 85 % of the first action).
- [v] G11 The difficulty curve reviewed per chapter and setting and recorded (docs/COMBAT_NOTES.md): nothing lost or stalled; Relaxed single and gentle; groups a step up, never a spike; battle resolve 14/12/10. Evidence: unit combat_curve (bounds, and the table it prints).
- [v] G12 The auto solver (`RB.test.battle`, the whole-game driver) plays groups honestly with the real rules and companion actions (`RB.combatSim`). Evidence: unit combat_curve (the solver against every story group, every setting, every companion); pursue.mjs E nao (one Atlas group met and won) and matrix.mjs FA nao,suzu 2 (4/4) — see VALIDATION.md.

## Evidence index (see VALIDATION.md for commands and dates)
- R1.1/R1.2: CSP forbids network; all browser tests record zero external requests.
- R1.3/R14.x: tests/e2e/ui.mjs (IndexedDB probe, session-only banner under refusal, reload persistence, copy independence, delete, overwrite confirm, cross-tab read-only, pre-departure recovery, file:// mode).
- R4.1/R4.2: ui.mjs new-game test (prologue skip → creation → setup → world).
- R5.x: tests/e2e/story_ch1.mjs (all 4 companions; provisional switch; commitment only via "Set out with…"; lock after departure; no third member).
- R7.1–R7.3, R7.8: ui.mjs combat test; RB.combatLogic caps mistake cost; RB.test.battle verifies Unravel-only wins.
- R8.2/R8.3/R10.5: ui.mjs handwriting test (mode switch keeps step; IME Enter during composition does not submit; mastery tallies by mode).
- R9.x: tests/unit/recog*.test.mjs (396 checks) + ui.mjs (reference strokes, wrong kana recognised then explained, nonsense rejected, composition edits, real mouse stroke). Human handwriting NOT tested.
- R11.1: tools/validate.mjs rejects any kanji without ruby; R11.2/11.3: ui.mjs lightbulb test.
- R18.1: tools/validate.mjs (also warns on unreachable exits, NPCs and interactable props).
- R3.1/R3.7/R5.x: tests/e2e/matrix.mjs — for each of F/E/I/A × Nao/Mio/Ren/Suzu a new
  campaign recruits that companion through the story and reaches the end of all six
  chapters and the epilogue (goal-directed driver tests/e2e/drive.mjs through the real world).
- R3.x/R5.7: per-chapter story tests (tests/e2e/story_ch1/3/4/6.mjs, side_ch3.mjs) and the
  blind explorer (tests/e2e/explore.mjs) reaching each chapter's end flag.
- R15.x: tests/e2e/atlas.check.mjs, tests/unit/atlas.test.mjs (self-check sweep).
