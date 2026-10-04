# Animated dialogue portraits — plan

For the owner's paired addendum of 2026-10-03 (World Idle Life, Character Mannerisms, and Animated
Dialogue Portraits) §7, built on the same mannerism profiles as the overworld and the scenes
(GESTURES.md §3). Evidence for §3 below: `docs/screenshots/expressive/portraits_grid.png` (12 characters ×
10 expressions at 128 CSS px) and `portraits_sizes.png` (the dialogue's three CSS sizes at device-pixel-ratio
1), captured from the built `index.html` at `20277f1` with a one-off Playwright page that called
`RB.portraits.draw()` (headless Chromium; not a play session; not committed as a test).

## 1. The current portrait system

- **Renderer:** `src/engine/35_portraits.js` (`RB.portraits`): a procedural 96 × 96 art-px bust per character,
  parameters from `RB.content.chars[id].portrait` laid over what the overworld look implies (`fromLook`); 87 of
  89 characters have portrait parameters. Hair: 13 styles in `src/engine/36_portraithair.js`
  (`short bob long wavy ponytail bun braid twintails curly spiky shaved wrap bald`). Eye templates `EYE_T`:
  `round` (27 characters), `soft` (24), `narrow` (22), `sharp` (14). Draw order (`drawAll`): back accessories →
  back hair → bust and collar → face (lit as a rounded solid) → features (nose, eyes, blush, mouth, mole, scar)
  → beard → front accessories → **front hair** → **brows** → head accessories (**glasses**, goggles, hats …);
  then `threshold(110)` and a dark outline round the silhouette.
- **Expressions** (`EXPR`, 15): `neutral smile smile2 laugh sad sad2 angry surprise think think2 worry shy
  smirk closed tired`, plus aliases `surprised thinking happy`. Each sets eye modifiers (`closed`, `wide`,
  `look` offset, `heavy`, `droop`, `angry`, `cheek`, `tear`), a brow shape and a mouth.
- **In the dialogue** (`src/ui/20_dialogue.js` `say()`): `<canvas class="portrait">` is repainted **once per
  line** — `RB.portraits.draw(cv, who, expr)` or `drawPlayer(cv, RB.equip.look(s), expr)` for the player — and
  then stays still. CSS (`src/styles/50_play.css`): 116 × 116 px (desktop), 84 px (`max-height: 440px`), 64 px
  (`max-width: 599px`), `image-rendering: pixelated`.
- **Cache:** one `Map` of finished 96 × 96 canvases keyed `id|expr` (the player: `pc|<look JSON>|expr`), first-in
  first-out at 300 entries (≈36 KiB each, ≈10.5 MiB at the cap); backgrounds cached per colour.

## 2. Expression tags in the scripts

Counted from every `say` command of the 1,292 scenes (`speaker[tag]: …`), at `20277f1`:

| Tag | Lines | Speakers using it |
|---|---:|---:|
| smile | 450 | 60 |
| think | 209 | 40 |
| laugh | 209 | 32 |
| smirk | 143 | 12 |
| worry | 123 | 27 |
| sad | 110 | 30 |
| closed | 100 | 11 |
| surprise | 88 | 38 |
| angry | 51 | 18 |
| shy | 40 | 8 |
| tired | 21 | 11 |
| **tagged** | **1,544** of 4,712 spoken (non-narration) lines (33 %) | |

Never used in scenes: `smile2`, `sad2`, `think2` (defined, available to cues). Companion reactions
(`RB.company.reactions`, 108) add 97 tags (smile 51, neutral 13, smirk 12, laugh 10, think 6, shy 4,
surprise 1). The player's 150 `pc:` lines carry no tag.

**Per companion** (their own lines plus `comp:` lines under `?(comp=x)`; 593 further `comp:` lines are shared
by all four — smile 89, laugh 42, think 36, smirk 35, shy 21 …):

| Companion | Lines | Tagged | Top tags |
|---|---:|---:|---|
| Nao | 582 | 138 | smirk 59, think 25, smile 23, angry 13, closed 11 |
| Mio | 528 | 250 | smile 105, worry 65, think 22, laugh 22, sad 21 |
| Ren | 549 | 134 | think 45, smile 31, smirk 15, closed 15, surprise 9 |
| Suzu | 564 | 239 | laugh 87, smile 50, closed 42, smirk 19, think 16, sad 15 |

**Recurring characters** (lines, share tagged, top tags): Kasane 100 (43 %: smile 9, sad 9, surprise 8,
closed 8); Hoshino 81 (28 %: smile 9, surprise 5, sad 5); Tsuru 61 (15 %: think 4, worry 2); Tokiwa 59 (20 %);
Ōmi 49 (18 %: think 4, angry 2); Wataru 43 (42 %: sad 6, smile 4, surprise 3, worry 3); Hiro 43 (14 %); Genzō
42 (33 %); Akari 38 (53 %); Tamae 34 (44 %: laugh 8); Yae 34 (41 %); Hana 21 (62 %). Untagged entirely:
Tamotsu (24 lines), Nobu (22), Daigo (12), the Tide Clerk (10) — their portraits stay neutral, so their idle
loop must carry them.

## 3. Eye-area readability: what the current renderer shows

Seen in the captures and traced to the code:

1. **Dark irises merge with the lash line.** The iris's top 30 % uses the darkest ramp tone (`I[0]`), the pupil
   is `I[0]` too, and the upper lash rows are `C.lash` (`#231a24`); with the iris filling the opening's full
   height (`ih = j1 − j0 + 2`), a dark iris and the lashes form one dark band. Gaze offsets (`look: [±1, ±1]`,
   used by `think`, `sad`, `shy`) move the iris one pixel inside that band, so *think* reads like *neutral*.
2. **Very little white.** A 13-px opening holds an 8-px iris (7 for `sharp`), leaving 2–3 px of white a side,
   and the opening's top row is the shaded white (`whiteS`); `cheek` (smile, shy) covers the bottom two rows
   with skin. The whites are what make gaze and surprise readable; only *surprise* (`wide`) shows enough.
3. **Darker skin tones lose the eye.** On Suzu (`skin: 4`) and Nao (`skin: 3`) the lash, iris and shadowed
   skin tones are close in value: neutral, think, worry and sad look alike; only the two white glints read.
4. **`narrow` eyes (22 characters) are three rows high** under two full lash rows (`EYE_T.narrow`): a thick
   dark bar. With glasses (Ren) it becomes a slit inside a box; *closed*, *smile* and *think* are nearly the
   same image.
5. **Glasses box the eye and cut the brow off it.** `accHead` draws a 15 × 15 frame (rows 38–52) after the
   brows; the top bar at row 38 runs between the brow (rows 34–36) and the crease (39–40), so the brow-to-eye
   distance that carries *worry*, *angry* and *think* is interrupted (Ren, Wataru, Tokiwa, Hoshino, Tadashi,
   Sōsuke, Shino, Kiku).
6. **Light brows vanish.** Old characters get `#d8d4d0` brows; light-haired characters' brows derive from the
   hair. On light skin (Tsuru, Kasane, Hoshino) the brow — the main carrier of *worry*/*angry* — is invisible.
7. **Fringes and brims cover the brow line.** Tsuru's bun fringe and Ōmi's grey fringe under the hat brim
   reach the brow rows (front hair is drawn before the brows, but the brows are light); Ōmi's eyes sit in the
   brim's shadow band.
8. **Non-integer display scale.** 116 px shows 96 art px at 1.21×, so at device-pixel-ratio 1 some art rows and
   columns are doubled and others not — the 1-px lash lines, glints and lid slants jitter; at 84 px (0.875×)
   and 64 px (0.667×, phones) rows and columns are dropped: at 64 px the eye is one or two dark pixels and the
   glasses frames alias into a dark block (`portraits_sizes.png`). On devices with a ratio of 2–3 the 116-px
   size is 2.4–3.6× and keeps every pixel (uneven, not lost) — the loss is at ratio 1 and on the small sizes.

**Fixes to make with the animation work** (render changes, no new art style): keep a 1-px white or lit-skin gap
between the lash line and the iris top; make the iris rim one step lighter than the lash colour and the iris
6 px wide in `round`/`soft` (more white); a warm rim light on the lower lid for skin tones 3–6; `narrow` eyes
open by one row with a single lash row; draw glasses frames before the brows with the top bar no higher than
row 39 (or thinner, tinted) so the brow stays readable; derive brows from the skin's shadow when hair is light
or the character is old; clip front hair 2 px above the eye opening; and display the portrait at integer
multiples of 96 (96 px on phones and short landscape, 96 or 192 on desktops by width), or author a smaller
phone set rather than downscaling.

## 4. Animation plan

**Model.** Split the finished portrait into cached layers (background · back hair and accessories · bust ·
face with features for the expression · front hair · brows · head accessories) and compose a frame from them
with 1-px offsets. A small player (`RB.portraitAnim`, in `src/ui/21_portrait_anim.js`) owns the dialogue canvas
while a line is shown; it changes the canvas only when the frame key changes (≤ 8 changes a second), never per
browser frame.

**Stable idle loop** (every speaking character; values from the mannerism profile, defaults below):

| Component | Default | Notes |
|---|---|---|
| blink | 120 ms closed (`closed: 'down'` eyes) every 3.5–6 s, occasionally a double blink | profile rate: slower for officials and elders, quicker for children |
| breath / settle | the bust and shoulders 1 px up for 1.2 s in a 3.2–4 s cycle; the head follows one frame later | never moves the eyes relative to the face |
| hair / accessory | long hair, ponytails, braids, ribbons, earrings: one 1-px sway frame every few seconds | Suzu's ribbon and earrings; Ren's ponytail; Kasane's hood edge |
| glasses | a glint crossing the lenses every 8–14 s; an adjustment only as a cue or a bespoke habit | Ren, Wataru, Tokiwa, Hoshino, Tadashi … |
| head tilt | ±1 px shift of the head layers every 10–20 s, held | Mio and Hana tilt more; officials hardly at all |
| mouth | none while idle (no lip flap; the game has no voice acting) | |

**Lead-in cues** (one-off, 250–700 ms, started when the line is shown; then the expression's stable loop):

| Tag (lines) | Cue | Settles to |
|---|---|---|
| surprise (88) | eyes widen over two frames, brows lift, a 1-px head pull back; hold | surprise loop (wide eyes blink less) |
| laugh (209) | eyes close up, shoulders bob twice | laugh loop with a slower breath |
| smile (450) | cheeks lift one frame | smile loop |
| smirk (143) | one lid lowers, the mouth corner lifts | smirk loop; Suzu: a single wink on her first smirk of a scene |
| think (209) | eyes glance aside and up, one brow lifts; glasses characters: a glint or one adjustment | think loop with a rare glance back |
| worry (123) | brows draw up, gaze drops a pixel | worry loop |
| sad (110) | slow blink, gaze down, shoulders settle | sad loop (tear pixel stays) |
| closed (100) | a slow lid close over two frames | closed loop (breath only) |
| angry (51) | a short exhale (shoulders drop), lids narrow | angry loop, firmer (no breath sway) |
| shy (40) | gaze averts, a small recoil, blush fades in | shy loop, softer |
| tired (21) | a heavy blink | tired loop |
| (none) | no cue | neutral loop |

**Rules.** The cue starts with the line and never delays it; text reveal, voice and Next do not change the
loop except to start the next line's cue. A line that repeats the previous line's tag gets no cue (the loop
continues). Fast-forward and Instant text skip cues. History, kept sentences and Company pages keep showing the
still image. Battle lines (`80_combat.js say`) use the same player.

**Character portrait mannerisms** (from GESTURES.md §6–§7; bespoke characters get their own cue variants):

| Character | Portrait idle | Signature cue |
|---|---|---|
| Nao | glances toward the frame edge (the exits), sparse blinks | smirk with the head turned a little away |
| Mio | soft tilt, steady blinks; a pin in the bun catches the light | worry: brows up and a small nod; laugh hidden (shoulders, closed eyes) |
| Ren | ponytail sway; a glint over the lenses | think: one glasses adjustment (≤ once per scene); a held "closed" before hard truths |
| Suzu | ribbon and earring sway; a light weight shift | laugh: shoulders bob and a wink; serious lines: no flourish, a straighter head |
| Ōmi | slow blinks under the brim, almost no tilt | angry: a narrowing and one exhale; no shake |
| Wataru | glasses slip a pixel and are pushed back | sad: gaze down, then (on a later line) up |
| Tsuru | very slow blinks, chin up | think: eyes narrow further |
| Kasane | long still holds, the hood edge stirs | closed: eyes close slowly before an admission |
| Hoshino | glint on the glasses, beard still | surprise: brows high over the frames |
| Hana | warm tilt | sad: gaze to the side (the cups) |
| children | quicker blinks and a bounce of 1 px | surprise and laugh bigger by a frame |

**Reduced motion.** No idle loop and no cue: the final expression is shown still, as today (optionally a blink
every 8–12 s if the owner wants a sign of life; default off).

**Performance and caching.** Layer canvases per (character or player look, expression): about 6 small
canvases instead of one; a byte-capped LRU (≈8 MiB) replaces the 300-entry FIFO; the player's portrait is keyed
by the resolved look and invalidated on `'equip:change'` and `'campaign:changing'`; the next speaker's layers are
prepared while the current line is shown (the runner knows the next `say`); nothing animates when the sheet is
hidden, the tab is hidden or reduced motion is on. Measure the cold build of a new character's layers (target
under one frame on desktop) and memory over a long scene (HX58–HX59, WI ledger in CONTRACT.md).

## 5. As built (package (b) of CONTRACT.md §5)

**Files.** `src/engine/35_portraits.js` (layers, frames, cache, eye fixes), `src/ui/21_portrait_anim.js`
(`RB.portraitAnim`: profiles, idle timeline, cues, the player of the dialogue canvas, integer display scale),
one call in `src/ui/20_dialogue.js` (`say()` → `RB.portraitAnim.play(cv, { who, look, expr, scene })`, and
`stop()` in `hide()` and on narrated lines), `--por-target` / `--por-size` in `src/styles/50_play.css`, and the
Archive clerk construct's ink-slit eyes blinking (`src/content/ch6/10_world.js`: its `extra2` is told the frame).
Battle lines reach the portrait through the same `say()`.

**Renderer.** A portrait is composed from cached layers — `cape` · `hairB` (back hair) · `bust` (with the neck) ·
`skin` (ears, lit face) · `feat` (eyes, nose, mouth, blush for this expression and frame) · `beard` · `front`
(scarf, satchel, lamp …) · `hairF` (the front hair, drawn once per person as `hairF0`, then cut for this brow) ·
`glasses` · `brows` · `headAcc` (hats, ribbon, earrings, hood …). Layers are stored cropped to their own pixels;
`body` layers take the body offset, head layers the head offset, `hairB` the head offset plus the sway (rows and
columns brought in from the frame's edge repeat the edge). The composite is thresholded and outlined as before, so
a frame with no motion is pixel-identical to the still (unit test). A frame is a small descriptor
`{ expr, lids: 'half'|'closed', look, wink, eyes, eyesR, brow, mouth, blush, head: [dx,dy], body: [dx,dy], sway,
glint: 0…3, glassDy }`, keyed by `RB.portraits.frameKey()`. Layers and finished frames share one LRU capped at
8 MiB (the old cache was a 300-entry FIFO of finished portraits, ≈10.5 MiB at its cap). Every other screen
(Company pages, the satchel preview, letters, word games, character creation) calls the same functions with no
frame and keeps the still image: they are reference views, and a moving face there would compete with the text
being studied. The history has no portraits.

**Idle loop** (every speaking portrait: the player, the 4 companions, 84 more characters with portrait art). A
pure function of time on the speaker's idle clock (seeded from the speaker and the scene; it keeps running while
the same speaker goes on, so blinks and breath do not restart every line); the canvas is repainted only when the
frame key changes.

| Motion | Default (class `base`) | Notes |
|---|---|---|
| blink | half-closed 50 ms → closed 100 ms → half-open 50 ms, every 3.6–6 s; 12 % a double blink (closes again from half-open) | none while the expression's eyes are closed (`closed`, `laugh`); ×1.6 slower in `surprise`, ×1.3 in `angry`; `tired` holds the lids 170 ms |
| breath | shoulders up 1 px for 1–1.2 s of a 3.6 s breath, the head 120 ms later | none in `angry` (firm); ×1.35 slower in `laugh`; after a cue it resumes only with a whole new breath |
| glance | the gaze a pixel aside for 0.7–1.2 s every 9–16 s | none with closed or wide eyes; in `think` the glance returns the gaze to centre; in `shy` it drops |
| sway | hair behind and hanging things (ribbon tails, earring drops, hood edge) a pixel for 240 ms every 7–12 s, and a beat behind any head tilt or weight shift | only long, wavy, ponytail and twin-tail hair, ribbons, earrings, hoods |
| glint | a band of light crossing the lenses in four 70 ms steps every 10–16 s | glasses wearers |
| tilt / habit | per class or person (below) | tilts and weight shifts held 2–5 s |

One small motion at a time: an event's moments of change keep 700 ms from every other event's (postponed in 350 ms
steps if needed); only the breath runs underneath. Measured over 20–60 s of every loop (unit and browser tests):
≥ 6 blinks a minute, never two within 2 s, at most 8 frame changes in any second; a blink changes only the eye
area; a breath is the still moved up one row.

**Class overlays** (GESTURES.md §5; each of the 71 profiled NPCs has its class, the others the nearest):
`official` slow blinks (4.8–7.6 s), slow breath (4.4 s), rare glances · `scholar` glances up-aside, glasses glint
· `clerk` glances down at the work · `host` a warm head tilt (2–3.4 s) and glances round the room · `craft`
glances down-aside at the work · `elder` blinks 5.2–8.2 s with longer-closed lids, breath 4.6 s · `child` blinks
2.6–4.2 s, quick glances, quicker breath, cues a frame bigger · `keeper` long holds, glances up · `traveller` looks
along the road · `performer` tilt and sway · `nonhuman` blink and breath only.

**Character portrait mannerisms** (bespoke rows of `PEOPLE` in `21_portrait_anim.js`):

| Who | Idle | Cue variants |
|---|---|---|
| Nao | sparse blinks (4.4–7.4 s); looks to the frame's edges (the exits) every 6–10 s | smirk: the head turned a pixel away, held through the loop |
| Mio | steady blinks, a soft tilt, a careful look down at you | worry: a small nod; laugh: quiet (closed-eye smile, one shoulder lift) |
| Ren | ponytail sway; a glint over the lenses every 8–14 s | think: one glasses adjustment a scene (then glints); closed: slower (×1.4) |
| Suzu | ribbon and earrings sway every 4–7 s; a weight shift (shoulders, then head, hair behind) every 10–16 s | laugh opens with a wink; her first smirk of a scene winks; sad, worry, closed: no tilt or weight shift |
| Ōmi | slow blinks (5.2–8 s), no double blinks, a rare look to the window | angry: one exhale and the narrowing, no shake |
| Wataru | the glasses slip a pixel for 2.6–4 s, then are pushed back (a glint) | sad: the gaze goes down and aside |
| Tsuru | very slow blinks (6–9 s); the chin lifted a pixel now and then | think: the lids lower further |
| Kasane | long still holds (glances every 18–28 s); the hood's edge stirs | closed: slow (×1.6) |
| Hoshino | a glint every 7–12 s; looks up (the hill) now and then | — |
| Hana | a warm tilt | sad: the gaze to the side (the cups) |
| Tokiwa, Tadashi | glasses pushed up now and then | Tokiwa: a glasses adjustment on think (once a scene) |
| Genzō | squints at the vane (lids half for about a second) | — |
| Councillor Tami, Old Yasu | a small nod now and then | — |
| Akari, Chigusa, Shiori, Hiro | glances to the window, down the road, to the sea, down at the glow | — |

A `portrait: {...}` block in the actor system's profiles (`RB.mannerisms.of(id)`, when that data lands) is merged
over these, so both systems can read one profile.

**Lead-in cues** (one-off, started with the line and never delaying it; the beats are frames over the line's own
expression; then 400 ms of stillness while the face settles, then the loop):

| Tag | Beats (ms) | Total |
|---|---|---|
| surprise | neutral 70 · brows up and mouth open, eyes not yet wide 70 · eyes wide, head and shoulders pulled back 1 px 110 · (children: 2 px 120) · hold, head back 330 | 580 ms (children 700) |
| laugh | smile 90 (Suzu: smile with a wink 170) · shoulders and head up 130 · down 110 · up 130 · down 110 (children: a third bob) | 570–650 ms |
| smile | the mouth first, eyes not yet lifted 110 · cheeks up with a 1-px lift 130 | 240 ms |
| smirk | neutral 90 · the mouth corner lifts 110 · (Suzu, first smirk of a scene: a wink 260) · the lid lowers 200 | 400–660 ms |
| think | neutral 100 · a glance aside 130 · up-aside with a brow raised 240 (glasses: a glint sweep; Ren and Tokiwa once a scene: a 1-px push of the glasses, then the glint) · (Tsuru: the lids lower 400) | 470–870 ms |
| worry | brows still flat 100 · the gaze drops 150 · (Mio: a 1-px nod 160) · brows up, gaze down 220 | 470–630 ms |
| sad | lids half 120 · closed 190 · half 120 · gaze down (Wataru down-aside, Hana aside), shoulders and head settle 1 px 340 | 770 ms |
| closed | lids open 150 · half 180 (Ren ×1.4, Kasane ×1.6) · closed | 330–528 ms |
| angry | an exhale: lids half, shoulders and head down 1 px 170 · shoulders still down 150 · the narrowed look | 320 ms |
| shy | the gaze averts with a 1-px recoil, no blush 130 · half the blush 130 · recoil held 240 | 500 ms |
| tired | 80 · a heavy blink 250 · half 130 | 460 ms |
| (none), neutral | no cue | — |

Rules: a line with the same speaker and tag as the previous line plays no cue (a cue still running continues; it
never restarts); another tag starts its own cue at once; the portrait disappearing (narration, the dialogue closing)
makes the next appearance fresh. Scene-once cues (Ren's adjustment, Suzu's wink) are remembered per scene id.
Fast-forward (skip seen) and the test harness's auto-advance show the still expression with no cue and no timer.
**Instant text keeps the cues** (a change from §4's plan: text speed is a reading preference, not a motion one, and
a cue never delays anything).

**Reduce motion** (decided): the held expression only — no idle loop, no cue and **no blink** — painted once per
line, identical to the still portrait; turned on mid-line, the portrait drops to the still at its next frame change
and stops. A slow blink was considered and left out: the setting promises that changes show immediately and
nothing else moves, and a still face loses nothing the text needs.

**Readability fixes** (§3; before/after in `docs/screenshots/portraits/eyes_zoom.png` and `eyes_real_size.png`):

| §3 item | Done |
|---|---|
| 1 iris and lash merge | the iris's upper band is its own mid tone (it was the darkest tone, the lash's value); the pupil is a 3-px dark core that never touches the lid |
| 2 little white | the iris is 7 px wide and centred in the 11-px opening: 2 px of white on each side (was 8 px with 1 and 2); gaze offsets now read |
| 3 darker skin | skin tones 3–6: a lit row under the lower lid (and on a closed lid) and a softer crease |
| 4 narrow eyes | one lash row instead of two over the same three-row opening (a four-row version made the narrow-eyed elders and Ren look younger and was dropped) |
| 5 glasses | the frames are drawn before the brows, the top rim a row lower and tinted toward the skin; no crease under the rim |
| 6 light brows | a brow close in value to the skin (white-haired elders, grey and gold hair) keeps its colour and gets a darker underside |
| 7 fringes | the front hair never covers the eyes (cut from the lash line down, inner columns only, so side locks keep their edge) and is cut from one row above each brow down to the eye, so a dark brow on a dark fringe and a light one on a light fringe both read; not for head wraps, shaved heads or bald ones |
| 8 display scale | the portrait's CSS size is a whole number of device pixels per art pixel where one lies within 15 % either side of the layout size, else the layout size: desktop keeps 116 px at ratio 1, 1.25 and 2 (the owner's call, 2026-10-04: the 96 px of an earlier version, whole pixels at ratio 1, read as too small), 128 at 1.5 and 3; short landscape 96 (was 84). In the phone layout the portrait has a row of its own above the sheet, so it **never grows there** (`--por-grow: 0`): 64 px as before at every ratio (2× at ratio 3, 1× at 1.5; uneven at 1, 2 and 2.625, as before) |

**The dialogue box is unchanged** (measured before/after with the same two lines, a short and a long one): 920×210 at
1440×900 and 1280×800; 390×233 / 390×295 at 390×844 (ratios 1, 2 and 3: 27.6 % / 34.9 % of the screen); 820×206 at
844×390; 360×233 / 360×329 at 360×640. Only the portrait inside it changed size: short landscape 84 → 96 (desktop went 116 → 96 and, at the owner's
request, back to 116). (An earlier version gave the phone layout 96 px at ratio 1 — a narrow desktop window or a phone
emulated at ratio 1 — which made the box 32 px taller there, 31.4 % of the screen instead of 27.6 %; the world review's
probe (WR-02) caught it and the phone layout no longer grows.)

**Performance** (headless Chromium in this container): a person's first frame (all layers) median 4.8 ms, max
14.6 ms over 20 people (the old renderer: 4.3 / 14.3 ms for its one drawing); a new expression of the same person
1.5 ms (old: 4.4 ms, a full redraw); a blink or breath frame 1.1–1.2 ms; a cached frame 0.03 ms. Browser test G,
50 lines from 14 speakers: 109 paints, 1.6 ms average (the slowest 19–31 ms, a new person's first frame); the cache
peaked at 4.6 MiB of its 8 MiB with nothing evicted; with a 1 MiB cap it stays under and still draws. A loop repaints
2–4 times a second on average and never changes its frame more than 8 times in a second; nothing runs while the
dialogue is hidden, the tab is hidden or the portrait is off-screen (IntersectionObserver) — browser test E. The
companion's and the player's portraits are drawn ahead in idle time (`requestIdleCallback`) once a conversation has
started.

**Tests and evidence.** `tests/unit/portrait_anim.test.mjs` (frame keys; rest frame = still; blink and breath
bounds; eye-fix invariants on 85 faces; every cue's shape; no replay; scene-once cues; Reduce motion; cadence and
density for all 89 portraits; cache cap; display scale) and `tests/e2e/portrait_anim.mjs` (sections A–I in its
header; I is a real scene, `sa.kasane_meet`, advanced only by real clicks on Next: one cue then a calm loop, the cue
ending never advances the line, furigana / word help / history keep working without restarting the cue, a lost
focus or tab and 15 s more of reading add nothing, a quick advance from Nao [angry] to Kasane [tired] leaves no
stale frame, a line shown again cues once per showing). `tests/e2e/portrait_shots.mjs` writes
`docs/screenshots/portraits/`: `eyes_zoom.png`, `eyes_real_size.png`, `sizes.png`, `stills_desktop.png` and
`stills_phone.png` (held still at actual size, 1440×900 and 390×844 at ratio 1 — the world review's WR-02 setup — six
characters × the 12 expressions in use, before / after), `cues_nao.png`, `cues_mio.png`, `cues_ren.png`,
`cues_suzu.png`, `idle_npcs.png`, `conversation.webm` (the first 12 spoken lines of `sa.kasane_meet` in real time,
640×360) and `conversation_still.png`.

**Open.** The eye fixes were compared by eye on the 12 characters of the sheets plus a few elders, and checked by
invariants on all 85 human faces — not reviewed one by one for all 87 (CONTRACT.md risk 10). The desktop portrait is
116 px at ratio 1, 1.21× the art, so some art rows are doubled: the owner preferred the size to whole pixels (96 px
was tried and read as too small; `--por-target` and `fitSize` are the knobs). On a phone at ratio 1 or 2 the 64-px portrait is still an uneven downscale (rows dropped at ratio 1):
the drawing fixes help there, the scale cannot without a larger box or a phone-sized art set. Portraits on
other screens stay still by choice. No mouth motion (there is no voice acting). The actor system's profile data is
not read yet (the hook is in `profileOf`).
