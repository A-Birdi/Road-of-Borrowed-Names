# Battle presentation captures

These are real captures of the built game in headless Chromium, made with
synthetic test campaigns (no player saves) by `tests/e2e/battle_anim.mjs`
and, for battles with several creatures, `tests/e2e/battle_group.mjs`.
Run either with `--docs` to copy its captures here as WebP. Add `gallery
--gallery` to battle_anim to capture the sheets as well. The three exchange
strips were refreshed on 2026-09-29 for the companion's turn (the companion
now chooses a support action after your response; it plays between frames 5
and 6).

To make the captures easy to follow, the presentation clock was slowed to
×0.2 (×0.25 for the sheets) with `RB.battleSeq.setTimeScale`. This slows the
frames down but does not change the choreography.

The adventurers are the character art's `RB.battlers` battle figures (rear
three-quarter, facing up-right). The backdrops are the location-aware
composer (`RB.battlePlaces`). Both were merged from
`claude/stoic-sagan-n3jvgk` at 0b47c13.

| File | What it shows |
|---|---|
| `exchange_unravel_strike.webp` | 1280×800, Flour Moth, Heat 1. Calm while choosing → anticipation → the gesture and ほどく on paper → the knot freed → recovery → Mio's turn: her warm draught (both of you already full) → its Strike on Mio: preparation → execution (a stroke in the moth's colour) → contact (−3, bar) → recovery → calm again. |
| `exchange_ward_sweep.webp` | 1280×800, Reedling, with Nao. 守る on paper travels to Nao and seal tags stand before him → Nao's turn (Spot the opening) → its Sweep: one stroke over you, then Nao. You take −1; Nao's ward absorbs 1 (seal mark) and he braces. |
| `exchange_phone_water.webp` | 390×844 phone, Runoff Blot, Heat 2. 水 on paper over the blot, a splash with steam, the flame pips go at the beat and the telegraph drops from 4 to 1 (the Heat's +2 gone, and Suzu's Heckle, chosen on her turn, takes 1 more) → its Strike on you (−1). |
| `gallery_responses.webp` | Every response at its beat: ほどく, 守る on an ally, 癒す, 水, 光, 風, 縄, 石, 炎, 鈴, 声, こたえる, みぬく, the four companion techniques, and a reduced-motion 守る. |
| `gallery_enemy_moves.webp` | Every enemy move family at its beat: Strike, Sweep, Flood, Gust, Chill, False promise, Mirror, Heat, Shroud, Gathering, Re-tying, Hush, Plea and Waiting. Also a move that fizzles, a Strike blocked by a raised 守る, a partly absorbed blow, and Suzu's flourish. |
| `group_pair_target_1280x800.webp` | 1280×800, the Stacks on Standard with Nao: a Catalogue Moth and a Hush Wraith. The moth (the most threatening) is the target: its slip is paper-coloured with a bracket at its edge, small ink corners mark its feet, and the telegraph paper shows its move in full; each card says whom it acts on ("on the Moth", "on you both"). |
| `group_trio_water_preview_1280x800.webp` | 1280×800, the Stacks on Demanding with Mio: moth, wraith and paper crane. The pointer rests on 水 (water), which reaches all three: a small mark over each creature and over each slip. |
| `group_trio_target_390x844.webp` | 390×844 phone, the Conduits on Demanding with Suzu: a crane, a lantern and a moth in one compact row of slips, the target's telegraph below it, the formation right of the party (the crane partly behind you on this narrow stage). |
| `group_pair_companion_turn_1280x800.webp` | 1280×800, the Conduits on Standard with Ren after chapter 2: Unravel is queued ("Back to Wayfarer"), Ren's turn with his two actions (every action is New the first time), his newly learned Flare the lamp announced once; the pointer rests on Lamp ward. |
| `play_moth_outside.webm` | A short recording (33 s, 960×540, VP8, no sound) of real play made by `tests/e2e/battle_video.mjs`, at normal speed. It uses only the mouse after walking up to the Flour Moth on the mill road. The intro line, advanced with Next, is followed by Unravel, a meaning question, ほどく on paper, and a knot loosened. Its Shroud clouds the knots, 光 answers it (written "light" → ひかり), and its Strike on you lands (−2, Mio's draught +1). After a pause, the last Unravel sends the moth away over the mill roof, and that line is advanced with Next. It was re-encoded at 500 kb/s to keep it small. It was recorded before the companion's turn existed (Mio's draught then came by itself); `battle_video.mjs` now takes her turn with the mouse, but the recording has not been remade. |
