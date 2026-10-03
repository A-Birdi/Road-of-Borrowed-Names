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
