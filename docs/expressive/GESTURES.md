# Gestures and mannerisms — one actor language for idle, conversation, scenes and portraits

For the owner's addendum of 2026-10-03 (Harmony Cut-Ins, Expressive Characters, and Illustrated
Storytelling) §11, §12, §15, and its paired addendum of the same date (World Idle Life, Character
Mannerisms, and Animated Dialogue Portraits) §4–§8, §11. Both are built on one actor system (CONTRACT.md
§3.4, §3.8). This file is the vocabulary: what each primitive needs from the sprite rig, whether the current
rig can draw it, the mannerism framework and idle categories, the reuse policy, and a mannerism profile for
the player, the four companions and every recurring NPC.

## 1. The rig today (what can and cannot be posed)

Overworld characters are drawn by one procedural rig, `src/engine/32_spriteart.js` (`RB.sprites.getArt(look,
dir, frame)`; hair `32h_spritehair.js`, accessories `32k_spriteacc.js`), on a 40 × 58 art-px frame with the
foot anchor at (20, 55); an adult is 50 px tall, a child 42, an old person stoops a row. Each of the four
directions is drawn, not mirrored, except `left` (the mirrored side view); side views keep a side ponytail,
flower, strap or braid on the side it is worn. `60_render.js drawActor()` (line 382) picks the frame
(`actorFrame()`: `w0–w7` walk, `i0–i3` breathing, `…b` blink, `3` blink at rest), lets `RB.sprites.view()`
draw a turn through a pivot, adds `a.dy` (a knee dip) and calls `a.overlay(c, fx, fy, t)` (the field action's
raised hand and brush, `src/ui/57_weave.js`). Emote bubbles (`60_render.js EMOTE`): `!`, `?`, `...`, `note`,
`heart`, `sweat`, `anger`, shown by `!emote` for 1.4 s.

| Part | Pose parameters today (`poseOf`, `geom`) | Missing for the primitives |
|---|---|---|
| facing | 4 drawn directions; turn pivot (half turn through a side/front view for 90 ms; quarter turn settles 70 ms); world idle glances turn the whole body for ≈1 s every 5–12 s (`50_world.js` line 624) | a gaze or head turn that is not a body turn |
| head | `bob` 0/1 (breathing, walk), `lag` (hair/hem follow a frame late), blink; `age: 'old'` lowers the face a row | nod, lowered head (1–2 rows), tilt, eyes-only glance (iris ±1 px), head shake |
| torso | rows `t` (shoulders 26), `bt` (belt 34), `hem` shift with `bob`; garments sway with the stride | lean (±1–2 px), bow (head and shoulders forward/down 2–3 px in side view), shoulders raised/dropped |
| arms and hands | `arms.R/L` swing −1/0/+1 with the walk; hands at `handsFB()` / `sideHand()` beside the hips | bent arms with the hand at chest, chin, mouth, temple, forehead; arm extended (point, handover); both arms forward (presentation, size); arms folded; hand shapes at 2–3 px (open, point, fist) |
| legs | stand; eight-phase walk (`WALK_FWD`, `WALK_LIFT`) | half-step (a sub-tile offset forward and back), kneel/bend |
| held objects | accessory layers: `lamp`, `cane`, `basket`, `book`, `bottles`, `satchel`, `toolbelt`, `glasses`, `hat`, `scarf` …; the lamp swings with the arm when walking | a held object following the gesturing hand; a prop handed from one actor to another (`RB.staging.prop`) |
| bespoke | `a.overlay` (drawn over the sprite), `a.dy` | per-character authored frames for poses the shared rig cannot express (§11.1) |

**Summary: the rig can change facing, breathe, walk, blink and show bubbles. None of the 32 primitives
is fully drawable today; eight are partly possible with facing, bubbles, breathing or the knee dip.** The pose
layer proposed in CONTRACT.md §3.4 (pose keys `p:<pose>:<k>` parsed by `poseOf`, new arm/head/torso/leg
draw paths, tables in `src/engine/32g_spritepose.js`) supplies the rest.

Pose-layer shorthand used below: **F** facing/turn · **E** eyes-only glance · **H** head (nod, lower, tilt,
shake) · **T** torso (lean, bow, shoulders) · **A** arm target per side (`chest`, `chin`, `mouth`,
`temple`, `forehead`, `forward`, `point`, `palm`, `out`, `folded`, `hip`, `half`) · **L** legs
(`halfstep`, `kneel`, `bend`) · **P** held prop · **B** bespoke frames.

## 2. The 32 primitives (§11.2)

Timing: entry → readable peak → recovery or hold (§11.3). Defaults are §12.3's (short gestures 250–700 ms,
handoffs 600–1,200 ms); a held pose breathes with the idle until the dialogue moves on and never loops a
bow, apology, forehead press or startle. "Today" = what the current rig does without the pose layer.

| # | Group | Primitive | Poses needed (keys) | Directions | Today | Authoring note |
|---:|---|---|---|---|---|---|
| 1 | Attention | turn-and-listen | F toward the speaker (pivot), T lean 1 px toward, E on the speaker; hold | all | **partial**: `!face` / `faceTo` + pivot turn the body | the listener's default; the turn must happen on the line that addresses them, not before |
| 2 | Attention | small acknowledgement nod | H down 1 → 0, once or twice (2–3 keys, 300–450 ms) | down, side (up: shoulders only) | no | the smallest "yes"; not agreement on every line |
| 3 | Attention | look-between-two-subjects | E/H to subject A, hold 300, to B, hold 300, back (body facing unchanged) | down, side | partial: body turns only | for a choice between people or between a person and an object |
| 4 | Attention | lean-in-to-observe | T lean 1–2 px toward the target, H down 1, hands behind or at the sides | side best; down (head lower) | no | pair with **look** at a prop; return when the observation is spoken |
| 5 | Thought | hand-to-chin | A(near) `chin` (upper arm down, forearm up), H tilt, E aside; hold | down, side | no | free hand only for cane/lamp/basket holders |
| 6 | Thought | glance-aside-and-return | E/H aside 1 px, hold 300–400, return | down, side | partial: idle glances turn the whole body at random | authored, not random; used before an answer |
| 7 | Thought | glasses/temple adjustment | A(near) `temple`, 2 keys (touch, settle) | down, side | no | only for characters wearing `glasses` (Ren, Hoshino, Tokiwa, Wataru, Tadashi, Sōsuke, Shino, Kiku …); at most once per scene for Ren (§15) |
| 8 | Thought | pause-with-hand-half-raised | A `half` (forearm forward at chest height), freeze 400–800 | all | no | an interrupted thought; Wataru's "I had debts…" (§14.2) |
| 9 | Explanation | open-palm explanation | A `palm` forward at the waist, small outward motion, 2 keys | down, side | no | the default speaking gesture; vary with #10–12 so adjacent lines differ (§11.3) |
| 10 | Explanation | precise directional point | F toward the target, A `point` (arm extended, 1 px finger) | all (up view: arm visible past the body) | no (precedent: the field action's raised-hand overlay) | aim at a real tile, actor or exit; Nao's signature |
| 11 | Explanation | two-handed size/relationship | both A `out` apart, then closer (2 keys) | down, side | no | "this much", "this and that"; Omi separating the two faults |
| 12 | Explanation | count or sequence on fingers | A(near) raised before the chest, finger pixels 1→3 | down | no | **weak at play scale** (a 2-px hand): use for named counts (Yae's days, Tetsuji's goats) and accept that it reads as "listing"; never the only carrier of a number |
| 13 | Object | two-handed presentation | both A `forward` at the chest holding P; H down toward it | down, side | no | the object stays visible above or beside the dialogue sheet (§13) |
| 14 | Object | one-handed handover/receive | A(near) `forward` to the receiver's side of the shared tile edge; P moves hand → hand at the peak | side best | no | needs `RB.staging.prop`; the inventory change stays with `!give`/`!take` (never doubled) |
| 15 | Object | kneel or bend to inspect | L `kneel` (hem and boots redrawn, −6 px) or `bend` (T bow + H down); hold; rise | all | partial: `a.dy` dips 1 px | the cane holders bend, never kneel; children squat |
| 16 | Object | read/trace a document or inscription | P document in both hands at the chest (or F to the inscribed prop), H down, A(near) finger moving along (2–3 keys) | down, up (a wall), side | no | the reading line appears when the text is read, not before (§12.1) |
| 17 | Uncertainty | small shrug | T shoulders up 1 px, A `palm` slightly out, H tilt; 3 keys | down, side | no | not for refusal (#20) or guilt (#26) |
| 18 | Uncertainty | hesitant half-step | L `halfstep` 4–6 art px forward, pause, back; T lean back | all | no (moves are whole tiles) | needs a sub-tile offset `a.ox`/`a.oy` beside the existing `a.dy` |
| 19 | Uncertainty | guarded hand near chest | A(near) `chest` (fist or open), T back 1 px; hold | down, side | no | Lanternfall's "certainly" characters (Akari, Ritsu, Setsu) before the bell |
| 20 | Uncertainty | quiet head shake/refusal | H/E left-right 1 px, 2–3 small keys | down, side | no | Mio's refusal is #24 + #20, not a bow |
| 21 | Tension | interrupted/startled recoil | T back 1 px, L small step back, A up slightly; return | all | partial: the `!` bubble | scale to the scene; Wataru's "not dismissing me?" is small |
| 22 | Tension | tense arms-folded stance | both A `folded` across the chest; hold | down, side | no | Tokuji, Tamotsu, Hayate, Bunta; never for a companion's default |
| 23 | Tension | hand-to-forehead frustration | A(near) `forehead`, H down 1 | down, side | no | not for a serious admission (§11.2: no slapstick) |
| 24 | Tension | restrained emphatic downward gesture | A(near) up to the chest, then flat hand down once | all | no | Omi's "Make them."; Umi's "does NOT run!"; no desk slam |
| 25 | Vulnerability | lowered head/shoulders | H down 1–2 (eyes `closed`-down style), T shoulders down; hold | all | no (the old stoop is static) | sadness as a quieter hold (§11.3) |
| 26 | Vulnerability | self-conscious hand/arm fidget | A(near) rubs the far forearm or hands together at the waist, 2–3 keys then still | down, side | no | resolves into #25 or a direct look, never loops |
| 27 | Vulnerability | avert gaze then face someone | E/H aside and down, hold, then F/H to the person | all | partial: facing turn only | courage after guilt (Wataru, Kasane, Suzu at the workshop) |
| 28 | Vulnerability | careful apologetic bow | T bow (side: head and shoulders forward/down 2–3 px; down view: head lowered, shoulders), A at the sides or front; 200 entry, 400 peak, 300 rise | all | no | once per apology; companions and adults only (children: a quick duck of the head) |
| 29 | Release | exhale/shoulder release | T shoulders down 1 px with one slower breathing key | all | partial: the idle breathing | relief after a revelation; Wataru's "careful exhale" (§14.2) |
| 30 | Release | open appreciative acknowledgement | both A `palm` slightly out + #2 nod | down, side | no | gratitude; distinct from #31 |
| 31 | Release | small contained celebration | A(near) fist at the chest, small pump; hop 1 px (`a.dy`) | all | partial: `a.dy` | pride; never during someone else's loss |
| 32 | Release | gentle laugh/hand-near-mouth | A(near) `mouth`, T shoulders bob 2 small keys | down, side | no (the `note` bubble is a different sign) | humour; Suzu's laugh is bigger, Mio's hidden behind the hand |

**Counts.** Partly drawable today: 1, 3, 6, 15, 21, 27, 29, 31 (8 by facing, the `!` bubble, breathing or the
1-px dip); none fully. All 32 need the pose layer for a readable version; 12 is low-readability at play scale.
The up view (back to the camera) shows arm and shoulder primitives but not faces: author scenes so that the
person whose face matters faces down or sideways (§13), or move that beat into an illustrated shot.

## 3. The mannerism framework (one profile, every context)

The owner's paired addendum of 2026-10-03 (World Idle Life, Character Mannerisms, and Animated Dialogue
Portraits, §1, §5, §11) asks that a person feel like **the same person everywhere**: idle in town, in
conversation, in a staged scene, in an illustrated shot, in battle and in the dialogue portrait. Both addenda
are built on **one** actor system (CONTRACT.md §3.4, §3.8): a mannerism profile per character is the single
source the overworld idle scheduler, the scene cues, the dialogue portraits (PORTRAITS.md) and the illustrated
shots read, and the companions' and the player's profiles are written to agree with the battle pose library
that already exists (`src/engine/34m_battler_moves.js` "Actors and their language").

**Profile (proposed data, `src/content/mannerisms/*.js`, registered with `RB.mannerisms.add(id, profile)`):**

```
{ class: 'official' | 'scholar' | 'clerk' | 'host' | 'craft' | 'elder' | 'child' | 'keeper' | 'traveller' | 'performer' | 'non-human',
  tier: 'bespoke' | 'overlay',
  rest:   the default resting pose (a pose-layer key, GESTURES §1: e.g. 'p:hands_behind', 'p:arms_folded', 'cane')
  idle:   [{ habit, every: [minS, maxS], at?: prop type or station, weight }]   recurring small habits (§6.1–6.2)
  route:  [{ habit, weight }]                                                   pauses for wanderers (§6.3)
  tells:  { surprise, worry, sad, angry, shy, happy, think: primitive or bespoke key }   emotional tells
  props:  [prop types or held accessories the habits use]
  talk:   [primitive numbers in order of preference]                            conversation gestures
  strong: [{ beat: scene id, gesture }]                                          the stronger reactions already written
  portrait: { idle: [...], cues: { tag: cue } }                                 PORTRAITS.md §4
  avoid:  [what this person never does] }
```

**Escalation from one baseline (paired addendum §5.3).** Each context reuses the same parts at a higher
intensity; nothing jumps from a wooden idle to a stranger's gestures.

| Context | What plays | Intensity | Example: Ren | Example: Omi | Example: Wataru |
|---|---|---|---|---|---|
| **Idle** (no one talking) | `rest` + `idle` habits on the scheduler, rarely, yielding at once | lowest: 1–2 px, one habit per 6–20 s | lamp held at the side, trims the wick, a glance along the road, glasses pushed up once in a long while | writing at the desk, a look at the harbour window | counts tags, loses count, glasses pushed up |
| **Conversation** | `talk` primitives on authored lines; listener `tells` small | the same habits made deliberate | the glasses adjustment before an explanation (7), precise turn to the speaker (1), considered open palm (9) | stops writing to listen (1), flat downward hand to make a point (24) | the hand half-raised then lowered (8), fidget (26) |
| **Emotional scene** | `tells` at full size, `strong` reactions, holds | the habit is disrupted or intensified | stillness instead of the glasses; the deadpan pun said without a gesture | her working gesture stops (§14.2) | lowered head held, then facing her (25 → 27) |
| **Cutscene / illustrated shot** | authored poses and close-ups built from the same habits | strongest, still in character | cleaning the glasses for a long time after the folio (sa.shelf_ren) | her hand moving from the ledger to the tags (SHOTS.md §2 shot 1) | the careful exhale (shot 2) |
| **Portrait** | the portrait's idle loop and lead-in cue (PORTRAITS.md) | subtle loop, one cue per line | a glint passing over the lenses; one adjustment cue on `[think]` | a slow blink under the brim; a narrowing on `[angry]` | glasses slipping a pixel; an averted glance on `[sad]` |
| **Battle** (companions, player) | the existing pose library | as authored for battle | `BY.ren` (lamp raised, the free hand tracing) | — | — |

## 4. Idle behaviour categories (paired addendum §6) and what the rig needs

What runs today for every overworld person (`src/engine/50_world.js`, `60_render.js`): four breathing keys
(`i0–i3`) on a 2.6 s cycle with a per-person phase, blinking, a random body glance to one side for ≈1 s every
5–12 s (line 624), and for the 33 of 199 NPC placements that have `wander`, random tile steps around home
(`n.def.wander` radius) with no pause behaviour. Town animals breathe and move their tails (`57_petworld.js`
`life`). Nothing is chosen by who the person is.

| Category | Behaviours (§6) | Today | Rig / system needs | Scheduling rules |
|---|---|---|---|---|
| **Station idles** (§6.1) | weight shift, glance, breath/settle, hand movement, clothing/hair adjustment, prop check, posture reset, attention shift | breathing, blink, random body glance | pose layer: hip shift (torso ±1 px with a foot), sleeve/hair touch (A `temple`/`chest`), E glance, H settle; per-person rates from the profile | one habit at a time; 6–20 s between habits (class-dependent: elders and officials slower, children faster); never two neighbours in step (phase from the person's id, as breathing already does) |
| **Occupation idles** (§6.2) | sweeping, sorting, reading, checking goods, writing, polishing, mixing, hanging/folding, carrying/resting, repairing, watching a route or gate, tending a fire/light | none (only the field-puzzle hand overlay for the player) | short loops (2–4 keys) anchored to a station prop next to the person (the stations listed in §7: counter, desk, stove, irori, kiln, potter's wheel, bench, laundry, nets, lamp); the prop may react (a pot steams more when stirred) — props stay owned by their art, the person's hand overlaps them | loops run in bursts (2–3 cycles), then rest; reading/writing loops stop for 1–2 s to look up |
| **Route/patrol pauses** (§6.3) | look around, check a sign/object, stretch, wait in a habitual pose, react to an NPC, a between-tasks reset | none: wanderers step, stop, step | after a wander step, a pause habit from the profile's `route` (look along the path, check the nearest sign or prop, a stretch) before the next step | a pause after 1 in 3 steps; never block a path the player is on (yield) |
| **Social ambient** (§6.4) | face each other briefly, light gestures, nods, reactions, turn back to tasks, indicate something nearby | none | pair rules: two NPCs within 2 tiles on the same map and both idle may turn to each other (F), one 9/10 gesture, the other a nod (2), then back; data: optional `pairs` per map (`co.festival`, `sb.inn`, `sg.harbor`, `lf.gardens` …) | rare (every 30–60 s per pair), never during dialogue, never with an NPC who is about to speak in a scene |
| **Contextual reactions** (§6.5) | weather, wind, noise, an object examined, a quest prop changing, someone arriving/leaving | animals react; people none | bus events: `prop:changed` (field puzzles already change props: `RB.fieldweave`), map `ambient.weather` (snow, leaves, pages, embers), arrivals (`50_world.js` walk-ins) → nearby idle people glance (E/F) or brace (snow: hands in sleeves) | only people who could see it (same map, within 6 tiles, not behind a wall); one reaction per event |

**Player ambient life (paired §8.1).** At rest in the world the player's sprite (from `RB.equip.look(s)`)
gets a small idle set: settle the satchel strap (only when the look has `satchel`), look at the nearest
interactable in front (E), a thinking hold when a learning page is open; never a gesture that implies a
feeling. Layering follows the look (an accessory stays in its layer).

**Companion presence (paired §8.2–8.3).** The following companion (`W.comp`) idles with its own profile
when the player stops (≥1.2 s): Nao checks the exits (looks both ways, hand on the strap), Mio straightens
something (a bottle at the hip), Ren tends the lamp, Suzu shifts her weight onto one leg and hums (no
sound). Shared stillness: both turn toward a prop the player is facing, the companion a beat later; both
settle back. At most one shared moment per minute; none during dialogue or puzzles; a companion never
reacts to something they did not witness (§15 of the first addendum).

## 5. Reuse policy (paired addendum §11)

- **Core library** (shared by everyone): the 32 primitives (§2), plus 14 idle habits — weight shift, look
  along the road, glance at a neighbour, sleeve/hair touch, settle the strap, stretch, rub hands (cold), shade
  the eyes, yawn, check a held object, tidy a surface, read, write, wipe the brow.
- **Class overlays** (rates, rest pose, preferred habits; 11 classes): *official* (still rest, few firm
  gestures, 24/11; slow habits), *scholar* (reading, glasses, 5/7/16), *clerk* (sorting, stamping, 13/19),
  *host* (tidying the counter, pouring, 9/13/31), *craft* (occupation loop at the station, wiping the brow,
  stretching; 11/22), *elder* (slow, small, cane rules), *child* (fast habits, bounce, crouch, peek; 10/31),
  *keeper* (tending a light or bell; 4/10), *traveller* (strap, looking along the road; 3/10/14), *performer*
  (weight on one leg, hand on the hip; 9/11/31/32), *non-human* (stiff fixed-angle moves only).
- **Bespoke treatment** (authored habits, tells and portrait cues beyond the overlay): the player, the four
  companions, and 21 recurring characters — Kasane, Hoshino, Tsuru, Tokiwa, Ōmi, Wataru, Hiro, Genzō, Akari,
  Councillor Tami, Chigusa, Umi, Tamae, Yae, Registrar Tadashi, Shiori, Old Yasu, Tokuji, Kayo, Kōji and Hana
  (26 in all). The other 50 recurring NPCs below use their class overlay plus the individual habits listed.

## 6. Companions and the player

Profiles derived from `src/content/00_world.js` (lines 10–38: look, portrait, role, support), the story bible
(docs/STORY.md "Companions"), the battle pose library's language (`34m_battler_moves.js` header) and the
expression tags of every line each speaks (direct and `comp:` lines under `?(comp=x)`).

| | Nao — courier | Mio — apothecary | Ren — lantern keeper | Suzu — travelling performer |
|---|---|---|---|---|
| expression tags (582 / 528 / 549 / 564 lines) | smirk 59, think 25, smile 23, angry 13, closed 11 | smile 105, worry 65, think 22, laugh 22, sad 21 | think 45, smile 31, smirk 15, closed 15, surprise 9 | laugh 87, smile 50, closed 42, smirk 19, think 16, sad 15 |
| resting pose | weight on the back foot, a hand on the satchel strap, head turned a little toward the nearest exit | hands together before the apron, shoulders level | feet set, the lamp hanging from the left hand, the right hand loose and precise | weight on one leg, a hand on the hip, the head tilted |
| idle habits | checks both ends of the street; re-tucks a letter in the satchel; drums two fingers on the strap | straightens a bottle at the hip; looks over the player (a quick check); tucks a pin into the bun | trims or polishes the lamp; pushes the glasses up (rarely); studies a sign a moment too long | a heel tap; adjusts the ribbon; flips the account book open and shut |
| emotional tells | a smirk and a look away; when moved, the hand leaves the strap | worry shows in the hands (they stop); a firm boundary is a flat hand and a steady look | stillness; a held "closed" before a hard truth; the glasses come off only at the folio | the joke first, then sincerity: the hand comes off the hip, the head straightens |
| prop habits | satchel, letters and labels | vials and bottles | the lamp, the glasses | the ribbon, the account book |
| conversation | 10, 3, 2, 14, 4 | 4, 15, 13, 30, 24 + 20, 32 | 1, 9, 11, 7 (≤1 per scene), 30 | 9, 11, 31, 32; serious: 25, 27, 28 |
| stronger reactions | peeling the old label into the satchel (lf.nao_deliver) | "I refuse" (lf.mio_refuse): 24 + 20, then 26 | cleaning the glasses for a long time (sa.shelf_ren) | untying the ribbon (co.suzu_truth); tying it round your wrist (sa.end_comp) |
| world presence when you stop | looks along the road, then at you | checks on you, then a bottle | tends the lamp | a weight shift and a hum (silent) |
| avoid | impatience on every line; sprinting | perpetual shyness or bowing | the glasses as the answer to every feeling | a twirl or wink in any apology, loss or confession |

**The player** (`RB.equip.look(s)`): rest = the rear-three-quarter-equivalent ready stance of the overworld
(feet even, arms down); idle = settle the strap (with a satchel), look at what is in front, breathe; tells and
conversation only as the chosen line establishes (§12.2 of the first addendum); stronger reactions are the
handovers and readings the story already performs. No dialogue portrait expression tags exist for the player
(150 `pc:` lines, none tagged): the player's portrait keeps a neutral idle loop (PORTRAITS.md).

## 7. Recurring NPCs: mannerism profiles

Every registered character who speaks in at least three scenes (71; bodiless voices and the companions
excluded). Facts are generated from the content (registration line, where they stand on which maps with the
props within a tile and a half, scene and line counts, the expression tags of their lines); the role and the
profile are authored from those facts and their own lines. *bespoke* = §5's list; *overlay* = class overlay
plus the habits named. Primitive numbers refer to §2. Held-object rule: cane, lamp, basket, book and blowpipe
holders gesture with the free hand; a prop is set down before a two-handed gesture.

**Kasane** (`kasane`) — Keeper of the Still Archive. *keeper, bespoke* · adult, robe, long, hood · 15 scenes / 100 lines · tags: smile 9, sad 9, surprise 8
- rest: very upright, hands folded inside the sleeves, hood shading the eyes · idle: long still holds; a slow glance over the shelves; straightens a page that does not need it
- tells: eyes close before an admission (closed ×8); a small recoil at being contradicted · props: the folio held flat against the chest · talk: 9 measured, 16, 27 · stronger: 28 only after the reading; 25 when asking to be judged
- from: `src/content/00_world.js:55`; stands at sa.camp@16,15 [bench]; sa.gate@15,12; sa.reading@14,8; most lines in `sa.kasane_meet`

**Hoshino** (`hoshino`) — astronomer of the Snowbell observatory. *scholar, bespoke* · old, coat, short, glasses+beard+scarf · 12 scenes / 81 lines · tags: smile 9, surprise 5, sad 5
- rest: slight stoop, one hand at the scarf, head tilted up toward the hill · idle: looks up the hill to the dark lamp; rubs his knees; pushes the glasses up
- tells: surprise reads through the glasses (surprise ×5); a long exhale when moved · props: letters held in both hands; the flint · talk: 3, 5, 7, 13 · stronger: 29 when the lamp is lit; 21 small at the road being clear
- from: `src/content/ch4/10_data.js:14`; stands at sb.hamlet@22,17; sb.hamlet@36,9 [sb_woodpile]; sb.inn@6,8; most lines in `sb.hoshino`

**Keeper Tsuru** (`tsuru`) — Keeper Tsuru of the Lantern Hall. *elder, bespoke* · old, robe, bun, cane · 19 scenes / 61 lines · tags: think 4, worry 2, surprise 1
- rest: planted on the cane, chin up, watching the road · idle: checks the lanterns along the square; taps the cane once before speaking
- tells: brows draw in rather than move (think ×4); quiet head shake · props: the cane hand stays planted; points with the free hand · talk: 2, 4, 10 · stronger: 30 to the player at the bridge; 25 at the departure
- from: `src/content/00_world.js:40`; stands at rw.village@21,15; rw.village@27,17; rw.hall@5,4; most lines in `rw.tsuru_first`

**Tokiwa** (`co_tokiwa`) — keeper of the chronicle, Cinder Orchard. *scholar, bespoke* · adult, robe, short, glasses+book · 11 scenes / 59 lines · tags: think 3, sad 3, smile 2
- rest: formal, the chronicle under the arm, glasses straight · idle: squares the chronicle on the desk; turns a page with care; adjusts glasses before a ruling
- tells: evasive glance aside while the lie holds; lowered head once it breaks · props: the chronicle and the brush · talk: 7, 16, 24 · stronger: 25 at the confession; 16 with a trembling brush at the assembly
- from: `src/content/ch3/10_data.js:20`; stands at co.eve@23,13 [co_stage,lantern]; co.festival@16,21 [bench]; co.hall@7,5; most lines in `co.assembly`

**Harbourmaster Ōmi** (`omi`) — Harbourmaster Ōmi, Saltglass. *official, bespoke* · adult, coat, bun, hat · 10 scenes / 49 lines · tags: think 4, angry 2, surprise 1
- rest: square behind the desk, weight even, hat level · idle: writes at the desk; looks out of the window at the harbour; sorts tags into piles
- tells: stillness first: the working hand stops (think ×4); anger is a flat downward hand, not a shout · props: pen, the company ledger, the tag piles · talk: 1, 11, 24, 14 · stronger: 24 then 10 (§14.2); a restrained softening only when Wataru came himself
- from: `src/content/ch2/05_data.js:11`; stands at sg.office@5,3 [desk]; most lines in `sg.omi_intro`

**Hiro** (`hiro`) — glassblower, Cinder Orchard. *craft, bespoke* · adult, apron, short, headband · 9 scenes / 43 lines · tags: smirk 2, sad 2, think 1
- rest: at the bench, one hand on the blowpipe, turning · idle: turns the pipe; checks the glow; wipes the brow under the head cloth
- tells: keeps working while hurt; a pause of the hands is the tell · props: blowpipe (one hand always on it); the forehead cloth · talk: 1, 20, 2 · stronger: the hand on the forehead cloth (co.suzu_truth); setting the globe down in the ash
- from: `src/content/ch3/10_data.js:17`; stands at co.village@25,19 [co_seat]; co.eve@27,16 [chair]; co.festival@25,19 [co_seat]; most lines in `co.suzu_truth`

**Wataru** (`wataru`) — warehouse clerk, Saltglass. *clerk, bespoke* · adult, tunic, short, glasses+book · 9 scenes / 43 lines · tags: sad 6, smile 4, surprise 3
- rest: shoulders a little high, notebook clutched, glasses slipping · idle: counts tags and loses count; pushes the glasses up; glances at the door
- tells: fidget → lowered head (sad ×6); a startled look up · props: the notebook pressed to the chest; the tags · talk: 8, 26, 27, 9 · stronger: 21 small at "not dismissing me?", then 29
- from: `src/content/ch2/05_data.js:17`; stands at sg.office@7,5; sg.warehouse@5,5; most lines in `sg.wataru_confront`

**Genzō** (`genzo`) — lighthouse keeper, Saltglass point. *elder, bespoke* · old, coat, short, beard+hat · 12 scenes / 42 lines · tags: smile 4, sad 3, surprise 3
- rest: feet apart as on a deck, hands behind the back · idle: squints at the vane; slaps a knee on the stairs; sniffs the wind
- tells: grumbles, then softens (smile ×4); turns away to hide feeling · props: the vane rail and the stair rope · talk: 4, 10, 2 · stronger: 31 small when the wind returns; 25 at his daughter's letter
- from: `src/content/ch2/05_data.js:41`; stands at sg.harbor@34,26; sg.lighthouse@5,4; sg.lighthouse_top@9,5 [sg_vane]; most lines in `sg.genzo_wind`

**Akari** (`akari`) — clerk at the Lanternfall Records (Hoshino's daughter). *clerk, bespoke* · adult, tunic, braid, scarf · 9 scenes / 38 lines · tags: smile 7, worry 3, laugh 3
- rest: neat and contained, hands clasped at the waist · idle: stamps forms; tidies the desk; glances at the window toward the mountains
- tells: a guarded hand at the chest before "certainly"; tired smile (smile ×7) · props: the forms and the stamp; letters · talk: 19, 13, 27 · stronger: 27 then 30 when the letters arrive
- from: `src/content/ch5/05_cast.js:90`; stands at lf.clerks@5,4 [desk]; most lines in `lf.akari_letter`

**Councillor Tami** (`lf_yae`) — Councillor Tami, Lanternfall. *official, bespoke* · old, robe, bun, cane · 6 scenes / 37 lines · tags: think 2, sad 2, closed 1
- rest: seated or leaning on the cane, pleasant and settled · idle: nods through the "unanimous" agreement; smooths the minutes
- tells: a slow think before recalling the old arguments (think ×2) · props: the cane; the minutes book · talk: 2, 9, 32 · stronger: 31 small at the first real disagreement after the bell
- from: `src/content/ch5/05_cast.js:23`; stands at lf.council@6,3 [table,chair]; most lines in `lf.yae_minutes`

**Chigusa** (`lq_chigusa`) — tea seller at the pass ("Sister Dove"). *host, bespoke* · adult, apron, wrap, scarf · 7 scenes / 37 lines · tags: laugh 3, surprise 2, sad 2
- rest: by the kettle, sleeves tied back, one hand on the handle · idle: feeds the fire; pours for carters; looks down the road
- tells: the kettle left whistling is her tell (lq.fare_chigusa); laughs past a hard moment (laugh ×3) · props: kettle, cups, the borrowed seal, the coins · talk: 13, 14, 28 · stronger: 28 at the fare; 31 contained at the Gull
- from: `src/content/lq/10_data.js:21`; stands at rw.tea@6,4 [smalltable,chair]; sg.inn@6,4; sb.road@11,11 [campfire,bench]; most lines in `lq.fare_chigusa`

**Grandma Ume** (`co_ume`) — Grandma Ume, Cinder Orchard. *elder, overlay* · old, tunic, bun, basket · 8 scenes / 36 lines · tags: smile 2, sad 1, surprise 1
- rest: small and settled on a bench, basket in her lap · idle: sniffs the air (the smell of smoke); sorts persimmons
- tells: a quiet head shake; eyes down · props: basket · talk: 5, 20, 25 · stronger: 25, then looking up at Tokiwa (co.assembly :ume)
- from: `src/content/ch3/10_data.js:23`; stands at co.eve@18,16 [bench]; co.festival@18,16 [bench]; co.terraces@14,23 w1; most lines in `co.ume`

**Old Gorō** (`co_goro`) — Old Gorō, the bell-ringer. *elder, overlay* · old, coat, shaved, beard · 7 scenes / 36 lines · tags: sad 2, smile 1
- rest: stiff-backed, arms at the sides like a bell-ringer at rest · idle: polishes the bell; flexes his hands
- tells: speaks little; lowered head at Mitsu · props: bell rope · talk: 2, 25 · stronger: his arms miming the rope (co.assembly)
- from: `src/content/ch3/10_data.js:26`; stands at co.village@12,13; co.eve@16,18 [bench]; co.festival@12,13; most lines in `co.goro`

**Umi** (`umi`) — timetable clerk, Lanternfall ferry office. *clerk, bespoke* · adult, coat, ponytail, hat · 7 scenes / 36 lines · tags: angry 3, smile 3, sad 2
- rest: brisk at the counter, pen ready · idle: corrects the timetable board; taps the counter
- tells: flashes of anger (angry ×3) and of laughter (smile ×3) · props: pen, the board, the envelope once taken · talk: 24, 3, 16 · stronger: 16 reading her father's letter, then writing one line
- from: `src/content/ch5/05_cast.js:85`; stands at lf.ferry@4,2 [counter]; most lines in `lf.nao_deliver`

**Tamae** (`tamae`) — landlady of the Gull, Saltglass. *host, bespoke* · adult, apron, wrap · 9 scenes / 34 lines · tags: laugh 8, think 2, surprise 2
- rest: always half-turned toward the kitchen · idle: carries trays; wipes the counter; calls orders
- tells: laughs big (laugh ×8); a sudden stillness when her mother is mentioned · props: trays, the stove pot, the seal · talk: 9, 31, 32 · stronger: 31 at the seal's return (lq.fare_gull)
- from: `src/content/ch2/05_data.js:23`; stands at sg.inn@9,3 [counter,stove,pot]; most lines in `sg.tamae_first`

**Yae** (`yae`) — innkeeper of Yukimiya, Snowbell. *host, bespoke* · adult, apron, wrap · 9 scenes / 34 lines · tags: smile 5, laugh 5, surprise 2
- rest: apron, hands busy at the hearth · idle: tends the irori; counts the days on her fingers; brushes snow off guests
- tells: laughs (laugh ×5), counts when anxious · props: the irori, the pot, amazake cups · talk: 12, 9, 31 · stronger: 31 at "eleven days!" (sb.eve_start)
- from: `src/content/ch4/10_data.js:17`; stands at sb.hamlet@18,17; sb.inn@13,2 [counter,bottles,pot]; most lines in `sb.yae`

**Oyone** (`sa_oyone`) — keeper of the camp ledger on the Archive road. *keeper, overlay* · old, coat, bun, scarf · 8 scenes / 31 lines · tags: smile 3, think 1, sad 1
- rest: wrapped against the cold at the hut door · idle: writes names in the ledger; tends the lamp
- tells: small smiles; little else · props: the ledger, the lamp · talk: 16, 2 · stronger: 13 when returning things to their owners
- from: `src/content/ch6/10_world.js:12`; stands at sa.camp@11,14 [lantern]; sa.hut@3,2 [pot]; most lines in `sa.oyone_first`

**Registrar Tadashi** (`lf_tadashi`) — Registrar, Lanternfall Records Hall. *official, bespoke* · adult, coat, short, glasses+book · 5 scenes / 31 lines · tags: think 3, smile 2, surprise 1
- rest: upright at the counter, the stamp poised · idle: stamps; straightens forms; adjusts glasses
- tells: think ×3; the stamp freezing mid-air is his big tell · props: the approval stamp, forms · talk: 13, 7, 8 · stronger: 8 (the stamp stopped) at Mio's refusal; 29 "a little relieved"
- from: `src/content/ch5/05_cast.js:13`; stands at lf.records@7,3 [counter]; most lines in `lf.tadashi`

**Shiori** (`shiori`) — tide-watcher, Saltglass. *scholar, bespoke* · adult, robe, braid, book · 10 scenes / 30 lines · tags: think 3, surprise 2, smile 2
- rest: at the window desk, notebook open · idle: reads the tide table aloud; looks out of the window; writes the times
- tells: think ×3; worry shows as stillness at the window · props: tide notebooks, the chalk table, shell buttons · talk: 10, 16, 3 · stronger: 10 to the window ("Look out of the window")
- from: `src/content/ch2/05_data.js:35`; stands at sg.harbor@10,32; sg.tidehut@4,3 [desk]; most lines in `sg.shiori_tide`

**Tokuji** (`lf_tokuji`) — old man at the sluice, Lanternfall. *elder, bespoke* · old, tunic, shaved, beard+hat · 7 scenes / 29 lines · tags: angry 2, closed 1, smile 1
- rest: arms folded, looking at the lake · idle: winds thread; spits in the lake; stares
- tells: anger as a cover (angry ×2); a sniff · props: thread, the bell he kept · talk: 22, 14 · stronger: 25 with a sniff after the bell ("you damn fool")
- from: `src/content/ch5/05_cast.js:28`; stands at lf.sluice@17,11; most lines in `lf.tokuji_story`

**Old Yasu** (`yasu`) — Old Yasu, retired ferryman and storyteller. *elder, bespoke* · old, tunic, shaved, hat+beard+cane · 9 scenes / 29 lines · tags: smile 3, think 2, sad 2
- rest: sitting by the boat or the lantern post, cane across the knees · idle: watches the river; mends a rope
- tells: smiles in the telling (smile ×3); sad when Mitsu is named · props: cane, rope · talk: 12, 3, 32 · stronger: 16 at the lantern shade (lq.road_write)
- from: `src/content/ch1/20_data.js:18`; stands at rw.village@34,25 [boat]; rw.village@47,18 [deadlantern,lantern,sign]; most lines in `lq.road_write`

**Asahi** (`asahi`) — glassworks, Saltglass. *craft, overlay* · adult, apron, short, headband · 10 scenes / 29 lines · tags: think 4, smile 2, worry 1
- rest: arms folded over the apron, then working · idle: checks the kiln; turns a glass on the table
- tells: think ×4; an eye roll at excuses · props: glassware, barrel seals · talk: 11, 5 · stronger: 24 at "it can't get wet"
- from: `src/content/ch2/05_data.js:47`; stands at sg.glass@4,4; most lines in `sg.asahi_order`

**Tetsu** (`tetsu`) — ferryman, Saltglass. *elder, overlay* · old, coat, shaved, beard+hat · 6 scenes / 27 lines · tags: think 2
- rest: by the tide board, arms folded · idle: checks the board; looks out to the ferry
- tells: think ×2; dry · props: the tide board · talk: 10, 22 · stronger: —
- from: `src/content/ch2/05_data.js:29`; stands at sg.harbor@34,29; most lines in `sg.tetsu_first`

**Sayo** (`co_sayo`) — festival organiser, Cinder Orchard. *host, overlay* · adult, dress, ponytail, book · 8 scenes / 26 lines · tags: smile 3, surprise 3, laugh 2
- rest: bright and busy, a list in hand · idle: checks the list; directs helpers; adjusts bunting
- tells: surprise ×3; quick laughs · props: the festival list, seats · talk: 9, 10, 31 · stronger: 21 at "A fire?" (co.assembly)
- from: `src/content/ch3/10_data.js:35`; stands at co.village@22,15 w2; co.village@28,22 w1 [smalltable]; co.eve@21,16 [bench]; most lines in `co.sayo`

**Hayato** (`lf_hayato`) — counter clerk, Lanternfall Records Hall. *official, overlay* · adult, tunic, short, book · 6 scenes / 25 lines · tags: smile 5, think 2, laugh 2
- rest: helpful lean over the counter · idle: hands out passes; tidies
- tells: smiles (smile ×5) · props: passes, forms · talk: 9, 13 · stronger: —
- from: `src/content/ch5/05_cast.js:18`; stands at lf.town@3,17; lf.records@10,5; most lines in `lf.hayato`

**Fuki** (`fuki`) — bell keeper, Snowbell. *elder, overlay* · old, robe, bun, scarf+cane · 6 scenes / 25 lines · tags: smile 5, tired 2, worry 1
- rest: bundled by the bell post, cane in hand · idle: coughs; rings the hours; warms her hands
- tells: tired ×2 smiles · props: cane, bell rope · talk: 2, 32 · stronger: —
- from: `src/content/ch4/10_data.js:29`; stands at sb.hamlet@24,18; sb.hamlet@23,16 [sb_bellpost]; sb.inn@10,7; most lines in `sb.fuki`

**Tamotsu** (`co_tamotsu`) — water-gate keeper, Cinder Orchard. *craft, overlay* · adult, tunic, short, toolbelt+hat · 8 scenes / 24 lines · tags: none
- rest: arms folded, feet planted, toolbelt on · idle: checks the channel level; looks at the sky for rain
- tells: no expression tags at all (0 of 24 lines): carried by stance · props: toolbelt, gate wheel · talk: 22, 24 · stronger: 24 "Tomorrow morning, we cut the grass"
- from: `src/content/ch3/10_data.js:29`; stands at co.village@33,22 w1; co.eve@30,16; co.festival@33,20; most lines in `co.tamotsu`

**Kayo** (`lq_kayo`) — Kayo, who grew the Lanternfall persimmon. *traveller, bespoke* · adult, dress, bob, hat+basket · 7 scenes / 24 lines · tags: smile 6, surprise 4, think 1
- rest: basket on the arm, looking up at the tree · idle: touches the bark; picks a fruit
- tells: smile ×6, surprise ×4 · props: basket, the seed bag · talk: 13, 4, 31 · stronger: calling the tree's name (lq.road_home)
- from: `src/content/lq/10_data.js:26`; stands at lf.gardens@30,12 [lq_kaki_young]; lq.koharu@21,9; most lines in `lq.road_home`

**Kanta** (`kanta`) — child of Snowbell. *child, overlay* · child, tunic, short, scarf · 7 scenes / 24 lines · tags: smile 4, surprise 3, worry 3
- rest: bouncing on the toes, scarf flapping · idle: builds the snow goat; peeks at visitors; runs a loop
- tells: surprise ×3, worry ×3 — big and quick · props: snowballs, the snow goat · talk: 10, 31 · stronger: 31 at the lamp lit
- from: `src/content/ch4/10_data.js:32`; stands at sb.hamlet@19,19 w1 [sb_snowgoat]; sb.hamlet@20,18; sb.inn@5,9 [chair]; most lines in `sb.kanta`

**Fusa** (`co_fusa`) — innkeeper, Cinder Orchard. *host, overlay* · adult, apron, bob, flower · 7 scenes / 23 lines · tags: worry 3, smile 3, laugh 2
- rest: at the counter, flower in her hair · idle: wipes cups; stirs the pot
- tells: worry ×3; guarded hand at the chest · props: cups, the pot · talk: 19, 9 · stronger: 25 "my sister's name was Yoshino"
- from: `src/content/ch3/10_data.js:41`; stands at co.eve@18,19 [bench]; co.festival@16,18 [bench]; co.inn@2,3 [counter,stove,shelf]; most lines in `co.fusa`

**Kōji** (`koji`) — Hana's brother, the ferry and the far bank. *craft, bespoke* · adult, tunic, short, hat+beard · 9 scenes / 23 lines · tags: think 3, smirk 2, smile 1
- rest: easy, hat tipped back, cup in hand · idle: sips from his own cup; checks the ferry rope
- tells: smirk ×2; think ×3 when he lost his way · props: his own cup, the fare book · talk: 14, 1 · stronger: the wave before the door closes (rw.bridge_scene)
- from: `src/content/00_world.js:50`; stands at rw.village@44,17; rw.tea@5,6 [exitmat,smalltable]; most lines in `lq.fare_koji`

**Sousuke** (`sousuke`) — postman, Snowbell. *traveller, overlay* · adult, coat, short, hat+glasses+satchel · 5 scenes / 23 lines · tags: smile 5, think 3, worry 1
- rest: satchel on, sorting · idle: sorts envelopes; reads addresses
- tells: smile ×5; thinks over addresses · props: the post sack, envelopes · talk: 13, 12, 16 · stronger: 31 at the addresses returning
- from: `src/content/ch4/10_data.js:20`; stands at sb.hamlet@27,19 [well]; sb.inn@14,9 [smalltable,chair]; sb.post@7,2 [desk,stove]; most lines in `sb.sousuke`

**Nobu** (`co_nobu`) — kiln tile-reader, Cinder Orchard. *craft, overlay* · adult, apron, wrap, beard · 6 scenes / 22 lines · tags: none
- rest: arms folded at the wheel · idle: throws a pot; wipes clay
- tells: no expression tags (0 of 22): stance carries him · props: the potter's wheel · talk: 22, 24 · stronger: 24 at the assembly
- from: `src/content/ch3/10_data.js:32`; stands at co.eve@29,19; co.festival@30,20 [smalltable]; co.pottery@4,5 [co_wheel]; most lines in `co.nobu`

**Master Isao** (`co_isao`) — master glassblower, Cinder Orchard. *craft, overlay* · old, apron, shaved, beard · 6 scenes / 22 lines · tags: surprise 1
- rest: seated near the furnace, squinting · idle: peers at a flame; rubs his eyes
- tells: surprise once; otherwise still · props: glass rack · talk: 4, 20 · stronger: —
- from: `src/content/ch3/10_data.js:47`; stands at co.eve@28,16 [chair]; co.festival@28,16 [chair]; co.glass@9,4 [fw_wedgerack,fw_tray]; most lines in `co.isao`

**Kinu** (`lf_kinu`) — neighbour in the fence quarrel, Lanternfall. *host, overlay* · adult, apron, bob, flower · 5 scenes / 22 lines · tags: smile 4, angry 2, tired 1
- rest: hands on hips by the fence · idle: points at the persimmon; waters pots
- tells: angry ×2 then smiles · props: the flowerpots by the fence · talk: 24, 10 · stronger: —
- from: `src/content/ch5/05_cast.js:43`; stands at lf.gardens@17,7 [hole,flowerpot]; most lines in `lf.fence_talk`

**Hana** (`hana`) — teahouse keeper, Reedwake. *host, bespoke* · adult, apron, bob · 9 scenes / 21 lines · tags: smile 6, think 2, worry 2
- rest: behind the counter, two cups set out · idle: pours two cups; wipes the counter; looks at the door
- tells: the hand that pours stops (the cups); sad ×2 at the apology · props: teapot and the two cups · talk: 13, 9 · stronger: surprise at the door, the apology, the smile (rw.bridge_scene)
- from: `src/content/00_world.js:45`; stands at rw.village@30,16; rw.tea@2,2 [counter]; most lines in `rw.hana_first`

**Catalogue Clerk** (`sa_clerk`) — Catalogue Clerk of the Archive. *non-human, overlay* · adult, custom figure · 7 scenes / 21 lines · tags: surprise 1, smile 1
- rest: rigid, hands at the sides · idle: stamps call slips; tilts its head on a fixed angle
- tells: surprise once · props: call slips · talk: 2 (stiff), 13 · stronger: —
- from: `src/content/ch6/10_world.js:41`; stands at sa.camp@16,6; sa.reading@6,4; most lines in `sa.clerk_first`

**Fuku** (`fuku`) — old woman of Saltglass. *elder, overlay* · old, robe, bun, cane · 5 scenes / 21 lines · tags: worry 2, sad 2, surprise 1
- rest: by the washing, cane in hand · idle: checks the sky; feels the wind
- tells: worry ×2, sad ×2 · props: cane, laundry · talk: 2, 3 · stronger: —
- from: `src/content/ch2/05_data.js:65`; stands at sg.harbor@47,9; most lines in `sg.fuku_plate`

**Kōhei** (`lf_kohei`) — neighbour in the fence quarrel, Lanternfall. *craft, overlay* · adult, tunic, short, toolbelt · 4 scenes / 20 lines · tags: smile 3, laugh 3, angry 2
- rest: leaning on the fence, toolbelt · idle: digs a post hole; measures
- tells: laughs ×3, angry ×2 · props: spade · talk: 11, 17 · stronger: —
- from: `src/content/ch5/05_cast.js:38`; stands at lf.gardens@10,7 [hole,flowerpot]; most lines in `lf.fence_talk`

**Isamu** (`sa_isamu`) — Isamu, Umi's father, on the Archive road. *traveller, overlay* · adult, tunic, short, hat · 6 scenes / 20 lines · tags: smile 4, sad 2
- rest: sitting by the campfire · idle: warms hands; listens to something no one else hears
- tells: a hand near the ear; smile ×4 · props: — · talk: 1, 29 · stronger: 29 at the laugh coming back
- from: `src/content/ch6/10_world.js:17`; stands at sa.camp@16,11 [campfire]; most lines in `sa.isamu_first`

**Tetsuji** (`tetsuji`) — goat keeper, Snowbell. *craft, overlay* · adult, tunic, shaved, beard+hat · 4 scenes / 18 lines · tags: angry 3, think 1, surprise 1
- rest: arms folded at the shed · idle: counts the goats; scratches his beard
- tells: angry ×3 (frustration at the count) · props: goat feed · talk: 12, 23 · stronger: —
- from: `src/content/ch4/10_data.js:23`; stands at sb.hamlet@9,27; sb.hamlet@26,17; sb.inn@11,5; most lines in `sb.tetsuji`

**Denji** (`denji`) — retired carpenter, ice fishing, Snowbell. *elder, overlay* · old, tunic, shaved, beard+toolbelt · 7 scenes / 17 lines · tags: smirk 2, think 1
- rest: seated by the ice hole · idle: jiggles the line; looks up at the dome he built
- tells: smirk ×2 · props: fishing line · talk: 11, 2 · stronger: —
- from: `src/content/ch4/10_data.js:44`; stands at sb.hamlet@39,25 [hole,stump]; sb.inn@14,6; most lines in `sb.denji`

**Kotarō** (`co_kotaro`) — child of Cinder Orchard. *child, overlay* · child, tunic, spiky · 5 scenes / 16 lines · tags: worry 2
- rest: restless, rocking · idle: runs around the seats; points at the empty chair
- tells: worry ×2 · props: — · talk: 10, 18 · stronger: —
- from: `src/content/ch3/10_data.js:38`; stands at co.village@27,20 w3; co.village@13,15 w1 [flowerpot]; co.eve@20,19 [bench]; most lines in `co.kotaro`

**Asa** (`co_asa`) — keeper of the terrace signposts. *craft, overlay* · adult, tunic, short, hat+basket · 4 scenes / 15 lines · tags: smile 1
- rest: by the signpost, basket · idle: wipes a blank sign; looks up the terraces
- tells: one smile · props: basket, signs · talk: 10, 17 · stronger: —
- from: `src/content/ch3/10_data.js:50`; stands at co.eve@29,18; co.festival@29,14 [co_bunting]; co.terraces@22,31 w1 [signblank,sign]; most lines in `co.asa`

**Sōta** (`sota`) — fisherman, Saltglass cove. *craft, overlay* · adult, tunic, spiky, headband · 6 scenes / 15 lines · tags: worry 1, laugh 1
- rest: by the nets, muttering · idle: pulls at nets; scratches his head
- tells: worry, laugh · props: nets · talk: 10, 23 · stronger: —
- from: `src/content/ch2/05_data.js:59`; stands at sg.harbor@18,28; sg.harbor@19,33; most lines in `sg.sota_start`

**Tsuya** (`lf_tsuya`) — old woman waiting for the boat, Lanternfall. *elder, overlay* · old, robe, bun, basket · 3 scenes / 14 lines · tags: smile 3, laugh 2, think 1
- rest: on the pier, basket held · idle: looks along the canal; checks the time
- tells: smile ×3, laugh ×2 · props: basket of amazake · talk: 1, 32 · stronger: —
- from: `src/content/ch5/05_cast.js:33`; stands at lf.town@40,33 [pier]; most lines in `lf.tsuya`

**Shino** (`co_shino`) — messenger and post, Cinder Orchard. *traveller, overlay* · adult, coat, braid, satchel+glasses · 6 scenes / 13 lines · tags: worry 1, smile 1
- rest: brisk, satchel forward · idle: sorts letters; trots to the door
- tells: worry, smile · props: satchel, letters · talk: 14, 2 · stronger: —
- from: `src/content/ch3/10_data.js:44`; stands at co.eve@16,16 [bench,well]; co.festival@27,23; co.post@4,4; most lines in `co.shino`

**Tomo** (`tomo`) — Reedwake (washing; Mochi's person). *host, overlay* · adult, dress, long, basket · 6 scenes / 13 lines · tags: smile 2, worry 1, surprise 1
- rest: by the washing line · idle: shakes out muddy washing; calls the cat
- tells: smile ×2 · props: laundry, Mochi · talk: 13, 32 · stronger: holding Mochi again (TA records)
- from: `src/content/ch1/20_data.js:27`; stands at rw.village@7,24 w1; most lines in `rw.tomo_mochi`

**Masaru** (`lf_masaru`) — baker, Lanternfall. *host, overlay* · adult, apron, wrap · 6 scenes / 13 lines · tags: laugh 3, smile 1, angry 1
- rest: floury hands on the counter · idle: kneads; counts orders on fingers
- tells: laugh ×3 · props: dough, the order list · talk: 12, 31 · stronger: —
- from: `src/content/ch5/05_cast.js:48`; stands at lf.bakery@3,4; most lines in `lf.masaru`

**Heita** (`co_heita`) — villager on grass duty, Cinder Orchard. *craft, overlay* · adult, tunic, spiky, headband · 5 scenes / 12 lines · tags: sad 1
- rest: leaning on a hay pile, eyes half shut · idle: dozes; stretches; looks at the grass
- tells: sad once · props: the sickle · talk: 17 · stronger: half-raising the sickle (co.assembly :living)
- from: `src/content/ch3/10_data.js:53`; stands at co.village@20,10 [hay]; co.village@16,9 w2; co.eve@22,19; most lines in `co.heita`

**Ritsu** (`lf_ritsu`) — café owner, Lanternfall. *host, overlay* · adult, apron, bob, earrings · 3 scenes / 12 lines · tags: smile 3, tired 1, sad 1
- rest: behind the counter, hands twisting the cloth · idle: polishes cups; reads impossible orders
- tells: tired, smiles · props: teaset · talk: 19, 26 · stronger: —
- from: `src/content/ch5/05_cast.js:53`; stands at lf.cafe@2,2 [counter,teaset,shelf]; most lines in `lf.ritsu`

**Daigo** (`daigo`) — dock worker, Saltglass. *craft, overlay* · adult, tunic, shaved, headband · 6 scenes / 12 lines · tags: none
- rest: paces the quay · idle: lifts crates; reads blank tags
- tells: no expression tags (0 of 12) · props: crates, tags · talk: 13, 24 · stronger: —
- from: `src/content/ch2/05_data.js:71`; stands at sg.harbor@25,26 w2; most lines in `sg.harbor_first`

**Kiyo** (`kiyo`) — fish market seller, Saltglass. *host, overlay* · adult, apron, wrap · 5 scenes / 12 lines · tags: worry 2, sad 1, smile 1
- rest: behind the stall · idle: salts fish; looks at the barrels
- tells: worry ×2, sad · props: salt barrels · talk: 19, 25 · stronger: 25 "I'm to blame too"
- from: `src/content/ch2/05_data.js:53`; stands at sg.harbor@31,17 [sg_stall]; most lines in `sg.kiyo_clue`

**Hama** (`cs_hama`) — ferry-gear workshop, Saltglass. *craft, overlay* · adult, apron, wrap · 3 scenes / 11 lines · tags: surprise 1, smile 1
- rest: at the bench, measuring rope · idle: measures rope on the bench notches; coils
- tells: surprise once · props: rope, the workbench · talk: 16, 14 · stronger: —
- from: `src/content/cases/10_data.js:14`; stands at sg.harbor@38,26 [bench,cs_workbench]; most lines in `cs.hama_parcel`

**Nagi** (`lf_nagi`) — lamp tender, Lanternfall. *keeper, overlay* · adult, coat, curly, lamp+headband · 4 scenes / 11 lines · tags: think 1, smile 1, laugh 1
- rest: carrying the lamp on a round · idle: trims wicks; frowns at the shades
- tells: think, laugh · props: the lamp · talk: 10, 4 · stronger: —
- from: `src/content/ch5/05_cast.js:63`; stands at lf.town@13,18 w3; most lines in `lf.nagi`

**Tsuzuri** (`sa_tsuzuri`) — Tsuzuri, binder of the Archive. *non-human, overlay* · adult, custom figure · 4 scenes / 11 lines · tags: smile 3
- rest: rigid, hands at the sides · idle: binds pages
- tells: smile ×3 (it classifies its feelings) · props: pages · talk: 2 (stiff), 13 · stronger: —
- from: `src/content/ch6/10_world.js:42`; stands at sa.camp@16,6; sa.reading@6,4; most lines in `sa.clerk_name`

**Setsu** (`lf_setsu`) — innkeeper, Lamplit Inn, Lanternfall. *host, overlay* · adult, robe, long · 5 scenes / 10 lines · tags: smile 1, tired 1, laugh 1
- rest: at the counter, smiling too much · idle: checks the full register; fans herself
- tells: tired, laugh · props: register · talk: 19, 9 · stronger: —
- from: `src/content/ch5/05_cast.js:58`; stands at lf.inn@2,3 [counter,shelf]; most lines in `lf.setsu`

**Mame** (`mame`) — child of Reedwake. *child, overlay* · child, tunic, twintails · 6 scenes / 10 lines · tags: smile 1, think 1
- rest: bouncing, twin tails · idle: runs between houses; listens to Suzu's story
- tells: smile, think · props: — · talk: 10, 31 · stronger: —
- from: `src/content/ch1/20_data.js:21`; stands at rw.village@17,18 w2; most lines in `rw.mame_first`

**Oto** (`oto`) — bootmaker, Reedwake. *craft, overlay* · adult, apron, wrap, toolbelt · 5 scenes / 10 lines · tags: smirk 1, surprise 1, laugh 1
- rest: bent over a boot · idle: stitches; looks at the blank sign
- tells: smirk, laugh · props: boots, awl · talk: 14 · stronger: —
- from: `src/content/ch1/20_data.js:9`; stands at rw.house1@3,4; most lines in `rw.oto_first`

**Hayate** (`hayate`) — snow clearer, Snowbell. *craft, overlay* · adult, coat, ponytail, cape · 4 scenes / 10 lines · tags: surprise 1
- rest: shovel on the shoulder, terse · idle: clears snow; looks down the road
- tells: surprise once · props: empty-handed (the content gives him no tool; cape only) · talk: 10, 22 · stronger: —
- from: `src/content/ch4/10_data.js:47`; stands at sb.road@28,12; sb.hamlet@27,7 w1; sb.inn@2,4 [sb_woodpile]; most lines in `sb.hayate`

**Natsume** (`natsume`) — Tetsuji's niece (night watch), Snowbell. *craft, overlay* · adult, tunic, braid, scarf · 3 scenes / 10 lines · tags: smile 3, tired 2, laugh 2
- rest: drowsy, swaying · idle: yawns; rubs eyes
- tells: tired ×2, smile ×3 · props: — · talk: 32 (yawn), 2 · stronger: —
- from: `src/content/ch4/10_data.js:26`; stands at sb.inn@5,4; sb.inn@11,4 [counter]; most lines in `sb.natsume`

**Tobi** (`tobi`) — child of Saltglass. *child, overlay* · child, tunic, curly · 5 scenes / 9 lines · tags: none
- rest: hopping from foot to foot · idle: points the way (wrongly sure); runs off
- tells: no tags · props: — · talk: 10, 31 · stronger: —
- from: `src/content/ch2/05_data.js:77`; stands at sg.harbor@50,24 w2; most lines in `fw.f2_tobi`

**Kei** (`lf_kei`) — child of Lanternfall. *child, overlay* · child, dress, twintails · 3 scenes / 9 lines · tags: smirk 2, laugh 2, angry 1
- rest: skeptical, hands behind the back · idle: listens at the grates; kicks a stone
- tells: smirk ×2, laugh ×2 · props: — · talk: 17, 10 · stronger: —
- from: `src/content/ch5/05_cast.js:68`; stands at lf.town@16,25 w2; lf.town@27,18 w3 [noticeboard]; most lines in `lf.kei`

**Bunta** (`bunta`) — carpenter, Reedwake. *craft, overlay* · adult, tunic, shaved, beard+toolbelt · 5 scenes / 9 lines · tags: shy 1
- rest: arms folded at the anvil · idle: planes wood; looks for the lost plane
- tells: shy once · props: tools · talk: 22, 23 · stronger: —
- from: `src/content/ch1/20_data.js:12`; stands at rw.carpenter@5,4 [anvil,stump]; most lines in `rw.bunta_tally`

**Kiku** (`kiku`) — weaver, Reedwake. *elder, overlay* · old, robe, bun, glasses · 5 scenes / 9 lines · tags: smile 1
- rest: at the loom · idle: weaves; untangles thread
- tells: one smile · props: thread · talk: 20, 9 · stronger: —
- from: `src/content/ch1/20_data.js:15`; stands at rw.house2@3,5 [exitmat]; most lines in `rw.kiku_tally`

**Sachi** (`sachi`) — Snowbell (washing; Kanta's mother). *host, overlay* · adult, dress, long, basket · 4 scenes / 9 lines · tags: smile 5, laugh 1, worry 1
- rest: by the frozen laundry · idle: hangs frozen washing; watches Kanta
- tells: smile ×5 · props: laundry · talk: 13, 32 · stronger: —
- from: `src/content/ch4/10_data.js:41`; stands at sb.hamlet@35,20 w1 [laundry]; sb.inn@3,9 [table,chair]; sb.sachi@5,3 [stove]; most lines in `sb.sachi`

**Shū** (`lf_shu`) — gardener, Lanternfall. *craft, overlay* · adult, tunic, short, hat · 3 scenes / 8 lines · tags: smile 2, think 1
- rest: shears in hand, frowning at the trees · idle: clips round, then square
- tells: smile ×2 · props: shears · talk: 11, 17 · stronger: —
- from: `src/content/ch5/05_cast.js:73`; stands at lf.gardens@8,19 w3; most lines in `lf.shu`

**Nagisa** (`nagisa`) — Genzō's daughter, Saltglass. *traveller, overlay* · adult, dress, long, satchel · 3 scenes / 8 lines · tags: smile 2, laugh 1
- rest: with a satchel, looking at the lighthouse · idle: rereads her letter
- tells: smile ×2 · props: satchel, letter · talk: 16, 27 · stronger: —
- from: `src/content/ch2/05_data.js:83`; stands at sg.harbor@35,27; sg.lighthouse@3,4; most lines in `sg.ferry_arrives`

**Chiyo** (`chiyo`) — child of Snowbell (snow sculptures). *child, overlay* · child, dress, bob, headband · 4 scenes / 7 lines · tags: laugh 2, smile 2, angry 2
- rest: kneeling by the snow observatory · idle: pats snow into shape
- tells: smile ×2, angry ×2 · props: snow · talk: 10, 31 · stronger: —
- from: `src/content/ch4/10_data.js:35`; stands at sb.hamlet@21,20 [sb_snowobs]; sb.inn@9,9 [exitmat]; most lines in `sb.chiyo`

**Rokuta** (`rokuta`) — child of Snowbell (snow fox). *child, overlay* · child, tunic, spiky, hat · 4 scenes / 7 lines · tags: smirk 3, angry 2
- rest: arms crossed by the fox · idle: fixes the fox's tail
- tells: smirk ×3, angry ×2 · props: snow · talk: 11, 23 (small, comic is fine) · stronger: —
- from: `src/content/ch4/10_data.js:38`; stands at sb.hamlet@25,20 w1 [sb_snowfox]; sb.inn@10,9; most lines in `sb.rokuta`

**Sae** (`sae`) — miller's daughter, Reedwake. *craft, overlay* · adult, apron, ponytail, headband · 3 scenes / 6 lines · tags: worry 1, smile 1, think 1
- rest: wary by the mill road · idle: listens toward the mill; hugs herself
- tells: worry · props: apron · talk: 19, 21 · stronger: 21 at voices
- from: `src/content/ch1/20_data.js:24`; stands at rw.millroad@15,23; most lines in `rw.mr_mio`

## 8. The §14 showcase in the world: `sg.omi_wataru` (overworld part)

`src/content/ch2/21_scenes_main.js`; line numbers are the file's. Arrival: `sg.wataru_confront` ends with
`!warp sg.office 5 6 up` and `!call sg.omi_wataru`; Omi is the npc `omi` at (5, 3) facing down, the desk prop
at (4, 4) (`across`), and Wataru's office npc `wataru_office` appears at (7, 5) facing left once
`sg_wataru_confessed` is set. The tiles below are proposals: verify them against the office's props and
reserve them with `!walkto` (§13: no stacking, no walking through the desk). The pivotal exchange from line
321 to line 335 is the Chapter 2 illustrated close-up (SHOTS.md §2); the world resumes at line 338. Nothing
below changes a line, a condition or a consequence.

| Line(s) | Beat (§14.2) | Wataru | Omi | Player | Companion |
|---|---|---|---|---|---|
| before 313 | arrival | `?(sg_wataru_self) !walkto wataru 5 4 up` — he takes the forward position | at the desk, writing (bespoke working idle) | `?(sg_wataru_self)` stays at (5, 6), supportive, behind his lead | behind the player |
| 313 `?(sg_wataru_self)` | Wataru identifies his responsibility | 26 fidget → 25 lowered but 27 facing Omi (not the floor) | the working hand stops (start of 316's beat) | 1 attention on Wataru | 1, small |
| 314–315 `?(!sg_wataru_self)` | the party speaks first, Wataru steps into his admission | at (6, 5): 18 hesitant half-step toward the desk on 315, then 27 face Omi | as above | `!walkto pc 5 4 up` before 314, 9 small on 314, then 1 toward Wataru on 315 | behind |
| 316 `omi: ……` | Omi's pause | holds 25 | working gesture stops; measured gaze on Wataru (1), held — no cartoon surprise | still | still |
| 317 | she partly knew | holds | 29 a slight release of posture | still | 1 toward Omi |
| 318 | debt → no excuses | 8 hand half-raised on "I had debts…", closes (26 short) on "No." | 1 | still | still |
| 319 `omi[angry]` | listening is her job | stops; 21 very small | 24 restrained downward gesture, then 10 (small) toward him: his attention redirected; authority kept | still | still |
| 320 `narr` | he explains the boat, the interest, the late wages | three different short poses over the one line: 9 → 11 → 9 (no new facts) | 1, listening, still | still | still |
| 321–335 | the judgement, "not dismissing me?", Omi's acknowledgement (only `?(sg_wataru_self)`, line 326), the companion's aside (327–330), the letter to Kurobe, the notice handed back (`!take sg_notice`, 332) and opened (335) | **illustrated close-up** — SHOTS.md §2 | | | |
| 338 `?(comp=suzu)` | Suzu's aside | — | — | — | Suzu: 25 small, then 1 toward Wataru |
| 339 | he goes to write a reply | 2 nod to Omi, then walks out by the door (5, 8) (`!walkto`), and the office npc stays hidden after `sg_wataru_resolved` | 2, back to work | 1, following him out | 1 |

Test: both routes × four companions = eight runs (HX37, HX68); the acknowledgement (line 326) appears
only on `sg_wataru_self`; `sg_wataru_resolved`, `sg_passive` (note) and the notice's removal happen once,
exactly as now.

## 9. Implementation (work packages D and (a), the overworld actor system)

What §1–§8 planned now exists in the source. One actor model and one renderer path serve idle life,
conversation and staged scenes; the dialogue portraits can read the same profiles (`RB.mannerisms.of(id).portrait`).

| Part | Where | What it does |
|---|---|---|
| Pose layer | `src/engine/32g_spritepose.js` (hooks in `32_spriteart.js`: `poseOf`, `geom`, eyes and mouth, `handsFB`/`sideHand`, `humanoid`, `getArt`) | Named key poses (`POSES`, 118) drawn from the same parts as the walking figure: arm targets per view (`DN` front/back, `SD` side: chest, heart, chin, mouth, forehead, temple, hair, shade, raise, half, palm, palmout, point(up/down), out, in, forward, folded, hip, behind, up, fist, count1–3, sleeve, clasp, reach, stretch, rub, low, flatdown, strap, forearm); head offset (bow, tilt, shake), eyes (l/r/u/d/c, side view b), mouth (o/w/f); lean and bow (side views), weight shift (front views); kneel, sit and a seated variant of any gesture (`+sit`); held objects (`PROPS`, 25: paper, letter, notice, ledger, book, folio, account book, cup, teapot, tags, brush, stamp, broom, lantern, bottle, cloth, envelopes, blowpipe ×4, ribbon, flint, seeds). Frame key `p:<pose>[+<seat>][.<R\|L>][/<prop>][~<gaze>][:1][*]`. Frames cached per look × direction × key in an LRU (cap 900; `RB.sprites._pose.stats()`). |
| Gesture library | `src/engine/51_gestures.js` (`RB.gestures`) | The 32 primitives as entry → peak → recovery (hold where meaningful), variants (`receive`, `bend`, `duck`, `flinch`, `resolve`), 44 idle habits and occupation loops (write, sort, stamp, pour, stir, polish, hang/fold, hammer, tend a lamp, tend a light, feed a fire, jiggle a line, knead, sip, glasswork, cool …), `can`/`fit` (a cane user bends and gestures one-handed, a child ducks, glasses only on glasses), `validate()`. |
| Profiles | `src/engine/51_mannerisms.js` (`RB.mannerisms`), data `src/content/mannerisms/10_cast.js` | 12 class overlays (§5's 11 and `town`); 76 authored profiles (the player, the 4 companions, 21 bespoke recurring characters, 50 on overlays); everyone else derived from **station and tool**, never from glasses, age, dress, gender or skin tone (the world review, WR-01). `maps:` per-workplace stance and work (Hiro at his bench), `states:` by story flag, `restScene: false` (a flourish stance that gives way in conversation: Suzu). |
| Staging | `src/engine/52_staging.js` (`RB.staging`) | Scene cues (`begin`/`end` token, `cue`, `look`, `pose`, `walkTo`, `prop`, `beat`, `ambience`, `settle`), the idle scheduler (`tick`), the renderer's hook (`frameOf`, asked by `60_render.js drawActor`). |
| Script ops | `src/engine/70_script.js`; validator `tools/validate.mjs`; quest guide `56_questguide.js` | `!gesture <actor> <gesture\|-> [target] [hold] [wait] [then=g,g] [and=<target2>] [prop=<kind>] [hand=R\|L]` · `!look <actor> <target\|->` · `!pose <actor> <pose\|->` · `!walkto <actor> <x> <y> [dir] [now] [stay]` · `!prop <actor> <kind\|-> [R\|L]` · `!beat <id>` · `!ambience <night\|night_in\|dusk\|->`. Actors: `pc`, `comp`, `npc`, a character or npc id. Targets: an actor, `x,y`, `prop:<kind>`, a direction. A cue binds to the line that follows it; the reader's advance settles every cue (hold or end); nothing waits on elapsed reading time (`wait` blocks at most 1.2 s to a peak). The validator checks actors, gestures, poses, props, targets, coordinates, and warns on a person repeating the same gesture on adjacent lines. |
| Dev viewer | `src/ui/44_actor_dev.js` (`?dev=actors`) | Contact sheets of the primitives (entry · peak · recovery), the habits, and per-person profiles, labelled as a synthetic fixture. |

**Legibility at play scale (40 × 58, a hand is 3 art px; judged on the contact sheets in
`docs/screenshots/actors/gestures_*` at 2 CSS px per art px and by the unit test's pixel-change floor).**
Read on their own (`full`, 25): 1 turn-and-listen (carried by the drawn facing), 2 nod, 4 lean-in, 5 hand-to-chin,
7 glasses, 8 hand half-raised, 9 open palm, 10 point, 11 two-handed size, 13 presentation, 14 handover (the object
moves hand to hand), 15 kneel/bend, 16 read, 17 shrug, 18 half-step (carried by a sub-tile offset), 19 guarded
hand, 21 recoil, 22 arms folded, 23 hand to forehead, 24 restrained downward hand, 25 lowered head, 28 bow,
30 appreciative palms, 31 contained celebration, 32 hand to mouth. Read with their context (`aided`, 6): 3 look
between two subjects and 6 glance aside (eyes-only: the iris moves a pixel, the head a pixel; a turn of the drawn
facing carries the bigger change), 20 head shake (1-px alternation, eyes down), 26 fidget (hands busy at the
waist), 27 avert-then-face (the second half is a turn), 29 exhale (shoulders drop a pixel, eyes close). Weak
(`weak`, 1): 12 counting on fingers — 1–3 finger pixels read as "listing", never as a number; the line says it.
Workarounds that make the rest legible: every arm that crosses the body or the face gets its own dark contour
(skin on skin otherwise vanishes); elbows are pushed out for forehead, temple and shade; pointing arms are long
and level and aim up or down by the target; held objects are a pixel larger than life; the back view hides what
the hands do in front of the body (celebrate, folded, guard, half-raised, size), so staged beats face the person
whose gesture matters down or sideways.

**Idle scheduler rules** (`RB.staging.tick`, once per world update). Only people on screen; one habit at a time per
person at their profile's pace; things happening at once (an event: a habit, a word between two people, a shared
glance at an arrival) capped at ⌈people on screen ÷ 4⌉, never more than 4; a new habit no sooner than 650 ms after
the last and not beside a neighbour who started one in the last 2.5 s; two idle neighbours within two tiles turn
to each other at most every 30–60 s per pair (one talks with a gesture from their profile, the other nods a beat
later); a wanderer pauses after a step or a turn one time in three; arrivals, people leaving and an examined object
draw a glance from those near enough to see; snow adds rubbing hands. Moods (restraint, WR-06): Lanternfall before
its bell (slower, fewer and politer exchanges), the Archive road (quiet), the Snowbell inn on the storm night
(nobody bouncing). The companion idles by their profile after you stand still 1.2 s; at most once a minute,
standing still facing something, the companion turns to look at it a beat later; your own idles (the strap, a
look, a weight shift) start after 3 s and stop on any key. Everything yields at once to a scene, a battle, a menu,
a map change; a tool in hand stays in hand through a conversation and the task resumes after it. Choices are seeded
per person (`RB.staging.seed`); world blink timers and weather no longer draw from `Math.random`.

**Staged so far.** The §14 showcase `sg.omi_wataru` (both routes × 4 companions), and one performed interaction per
other chapter: Ch1 `rw.hana_first`, Ch3 `co.suzu_night` (the faded passage of SHOTS.md §7b: the night line is now
said over the room), Ch4 `sb.yae`, Ch5 `lf.mio_refuse` (both branches), Ch6 `sa.isamu_return`; and from the world
review WR-03, Hiro's working introduction `co.hiro_first`. Evidence: `tests/e2e/staging_wataru.mjs`,
`staging_chapters.mjs`, `actor_workplaces.mjs`; `docs/screenshots/actors/`. The rest of the manifest's
"Performed overworld" scenes are the later game-wide staging package.
