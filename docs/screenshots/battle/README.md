# Battle presentation captures

These are real captures of the built game in headless Chromium, made with
synthetic test campaigns (no player saves) by `tests/e2e/battle_anim.mjs`.
Run it with `--docs` to copy the strips here as WebP. Add `gallery --gallery`
to capture the sheets as well.

To make the captures easy to follow, the presentation clock was slowed to
×0.2 (×0.25 for the sheets) with `RB.battleSeq.setTimeScale`. This slows the
frames down but does not change the choreography.

The adventurers here are the **fallback** stand-in: the straight-back
walking sprite with simple pose offsets. It is used until the character
art's `RB.battlers` battle frames (rear three-quarter, facing up-right) are
merged. Re-capture after that merge.

| File | What it shows |
|---|---|
| `exchange_unravel_strike.webp` | 1280×800, Flour Moth, Heat 1. Calm while choosing → anticipation → the gesture and ほどく on paper → the knot freed → recovery → its Strike on Mio: preparation → execution (a stroke in the moth's colour) → contact (−3, bar) → recovery → calm again, Mio's draught (+1). |
| `exchange_ward_sweep.webp` | 1280×800, Reedling, with Nao. 守る on paper travels to Nao and seal tags stand before him → its Sweep: one stroke over you, then Nao. You take −1; Nao's ward absorbs 1 (seal mark) and he braces. |
| `exchange_phone_water.webp` | 390×844 phone, Runoff Blot, Heat 2. 水 on paper over the blot, a splash with steam, the flame pips go at the beat and the telegraph drops from 4 to 2 → its Strike on you. |
| `gallery_responses.webp` | Every response at its beat: ほどく, 守る on an ally, 癒す, 水, 光, 風, 縄, 石, 炎, 鈴, 声, こたえる, みぬく, the four companion techniques, and a reduced-motion 守る. |
| `gallery_enemy_moves.webp` | Every enemy move family at its beat: Strike, Sweep, Flood, Gust, Chill, False promise, Mirror, Heat, Shroud, Gathering, Re-tying, Hush, Plea and Waiting. Also a move that fizzles, a Strike blocked by a raised 守る, a partly absorbed blow, and Suzu's flourish. |
