# Requirements checklist

Derived from `SPECIFICATION.txt` (section numbers in brackets).
Status: `[ ]` not started · `[~]` in progress · `[i]` implemented, unverified ·
`[v]` verified (evidence in VALIDATION.md) · `[b]` blocked.

## Delivery [1]
- [ ] R1.1 Single self-contained `index.html`, vanilla JS, no CDN/network/server
- [ ] R1.2 Works offline; no runtime network requests
- [ ] R1.3 Storage detected by real write/read; honest session-only messaging
- [ ] R1.4 Engine/content/learning/recognition/audio/persistence separated in source
- [ ] R1.5 All visuals/audio procedural; Japanese text readable (not pixel font)

## Story & world [2,3]
- [ ] R3.1 Six chapters: Reedwake, Saltglass, Cinder Orchard, Snowbell, Lanternfall, Still Archive
- [ ] R3.2 ≥5 inhabited settlements
- [ ] R3.3 ~6 dungeon/ruin sequences (mill, drowned archive, glass kiln, observatory, bell tower, Still Archive)
- [ ] R3.4 ~18 authored side quests (count: 0)
- [ ] R3.5 Antagonist (archive keeper / the Hush) with understandable motive
- [ ] R3.6 Final choices about promises/repair, not good/bad ending switch
- [ ] R3.7 Denouement, companion-specific resolution, changed world to revisit
- [ ] R3.8 Fast travel/shortcuts after routes explored
- [ ] R3.9 10–15h first playthrough target (NOT measured; report honestly)

## Intro & creation [4]
- [ ] R4.1 30–60s skippable cutscene; skip → same valid state; journal recovers context
- [ ] R4.2 Creation: name, pronouns, skin, hairstyle, hair colour, clothing palette, accessories, live sprite preview
- [ ] R4.3 Lightweight backgrounds with flavour lines
- [ ] R4.4 Interface language, learning assistance, skill profile, optional placement, skip kana tutorial

## Companions [5]
- [ ] R5.1 Party is exactly player + one companion; solo before recruitment
- [ ] R5.2 Nao, Mio, Ren, Suzu introduced via quests 1–2, each shows approach
- [ ] R5.3 Departure room: talk, provisional choose, switch freely; permanence via dialogue
- [ ] R5.4 Intentional "Set out with X" interaction; movement cannot commit
- [ ] R5.5 Pre-departure recovery point; locked after departure; room can't re-recruit
- [ ] R5.6 Unchosen candidates remain in world
- [ ] R5.7 Per companion: banter, personal quest, decision reactions, coordinated technique, ending variation

## Exploration [6]
- [ ] R6.1 Tile movement with interpolation, collision, facing, doors, interiors, transitions, camera
- [ ] R6.2 Keyboard, mouse, touch controls
- [ ] R6.3 Companion follows without blocking/stranding
- [ ] R6.4 NPC routines, contextual talk, environment changes
- [ ] R6.5 Side activities: inn orders, signposts/maps, letter delivery by context, oral histories/inscriptions

## Combat — Inkweaving [7]
- [ ] R7.1 Telegraphed enemy intent → response → written Japanese → visible effect
- [ ] R7.2 Not an Attack/Magic/Item menu
- [ ] R7.3 Untimed; enemy never acts while drawing/help/IME
- [ ] R7.4 One answer coordinates both adventurers; companion techniques
- [ ] R7.5 Multiple valid solutions in some encounters
- [ ] R7.6 Kana inscriptions for beginners without invented kana meanings
- [ ] R7.7 Bosses combine learned ideas, not HP sponges
- [ ] R7.8 Recognition uncertainty never damages; capped mistake cost; assist mode no penalty
- [ ] R7.9 Defeat → checkpoint, learning kept

## Input modes [8]
- [ ] R8.1 Handwriting, multiple choice, IME; whole game completable without handwriting
- [ ] R8.2 Switch mode mid-challenge without losing encounter
- [ ] R8.3 Track recognition/recall/handwriting/assisted separately
- [ ] R8.4 Plausible distractors; all valid answers accepted

## Handwriting recognition [9]
- [ ] R9.1 Pointer capture (strokes, timestamps), DPR scaling, no scroll, cancel/resize safe
- [ ] R9.2 46 hiragana + 46 katakana + dakuten/handakuten/small/ー in curriculum
- [ ] R9.3 Real templates (KanjiVG, attributed) + multistroke matcher; no rotation/reflection invariance
- [ ] R9.4 Small kana size control; diacritics preserved
- [ ] R9.5 Composition strip: confirm, go back, replace, remove, insert
- [ ] R9.6 Recognition separate from evaluation; candidates, uncertainty, "I read this as…"
- [ ] R9.7 Undo stroke, clear, redraw, candidate pick, explicit confirm; reject empty/nonsense
- [ ] R9.8 Manual correction = assisted; uncertainty never called a language error
- [ ] R9.9 Stroke-order demos from real reference paths; shape vs order feedback separate
- [ ] R9.10 Lenient adventure mode; optional practice mode

## Japanese content [10]
- [ ] R10.1 Foundations/Elementary/Intermediate/Advanced profiles, independent of combat difficulty
- [ ] R10.2 Advanced content genuinely playable (nuance, register, implication, paraphrase)
- [ ] R10.3 Separate mastery: characters, vocab, grammar, comprehension; spaced revisit
- [ ] R10.4 Authored content records (display, reading, meaning, accepted answers, tags, explanation, spoken)
- [ ] R10.5 Orthography handled carefully; IME composition-safe Enter
- [ ] R10.6 Bounded intent system with honest out-of-scope handling

## Furigana & lightbulb [11]
- [ ] R11.1 Furigana on every displayed kanji (validator-enforced)
- [ ] R11.2 Lightbulb help: hover/focus/tap; reading, romaji, meaning, mora, notes, replay voice
- [ ] R11.3 Pin, add to notebook, never cover pad, assisted recording
- [ ] R11.4 English-led / Japanese-led / translation visibility; bilingual backlog

## Dialogue & quests [12]
- [ ] R12.1 Authored, distinct voices; register notes
- [ ] R12.2 Written language for orders/letters/directions/repairs/negotiations
- [ ] R12.3 No irreversible punishment for mistakes; journal next steps

## Progression & QoL [13]
- [ ] R13.1 Notebook, journal, inventory, equipment, map, settings, history
- [ ] R13.2 Few meaningful growth systems; no paid explanations
- [ ] R13.3 Retreat, tutorials revisit, no softlocks, key items protected
- [ ] R13.4 Fast/instant text, skip seen scenes, remap, volumes, reduced motion, text size, contrast

## Saves [14]
- [ ] R14.1 Exactly six slots: new/save/load/copy/overwrite/delete; thumbnail + metadata
- [ ] R14.2 IndexedDB; manual separate from autosave recovery; pre-departure snapshot
- [ ] R14.3 Copy independent; delete removes recovery data
- [ ] R14.4 Confirm destructive ops; never silently overwrite
- [ ] R14.5 Validation, schema version, atomic writes, errors handled, no clearing on read failure
- [ ] R14.6 Cross-tab conflict protection
- [ ] R14.7 persist() request with honest explanation
- [ ] R14.8 No export/import/cloud/share codes

## Endgame — Unwritten Atlas [15]
- [ ] R15.1 Repeatable 10–25 min expeditions with branches, climax, extraction
- [ ] R15.2 Route modifiers, relics; objectives solvable at every profile
- [ ] R15.3 Rewards: sidegrades, cosmetics, notebook, settlement details
- [ ] R15.4 Keep companion; NG+/fresh campaign with defined carryover

## Visual [16]
- [ ] R16.1 Regional palettes, architecture, portraits, walk animations, ambient motion
- [ ] R16.2 Unique NPC silhouettes
- [ ] R16.3 Writing pad generous while intent visible
- [ ] R16.4 Readable transcription of decorative inscriptions
- [ ] R16.5 Resize/orientation/touch; reduced motion; no flashing

## Audio [17]
- [ ] R17.1 Procedural music with motifs (road, settlements, mystery, combat, companions, ending)
- [ ] R17.2 SFX for movement, writing, recognition, spells, discoveries
- [ ] R17.3 Start after gesture; music/sfx/voice volume + mute; ducking
- [ ] R17.4 Optional local ja TTS with spoken-text field, cancel, no overlap, honest labelling

## Validation [18]
- [ ] R18.1 Content validator (exits, spawns, prereqs, dialogue refs, furigana, answers)
- [ ] R18.2 Browser tests of the built file for critical paths
- [ ] R18.3 Recognizer tests with held-out variants, confusables, nonsense
