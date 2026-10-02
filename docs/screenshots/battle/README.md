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

## Battle addendum (2026-10-02): newer captures by folder

The captures above predate the battle addendum. The party art, the creatures and the backdrops have
been redrawn since. The folders below were made from the addendum's builds, with synthetic campaigns
in fresh profiles. Where a scene is a diagnostic placement (for example, a party placed in the Mill
with three Flour Moths), the folder's record says so. None of these scenes was reached by playing
through the campaign.

| Folder | What it holds | Made by | Record |
|---|---|---|---|
| `presentation/` | Real-time recordings of one exchange (Unravel answered, Mio's Warm draught, the Flour Moth's move) at Normal, Fast, Instant, Normal with reduced motion, and on a 390×844 phone driven by taps with three moths (a badge card opened and closed). Stills: the badge card, your response's blue banner, the creature's red banner. | `tests/e2e/battle_presentation_video.mjs` | `docs/battle/PRESENTATION.md` |
| `layout/` | The decision, language and action views at 320×640, 390×844 and 844×390 with three creatures, at 200 % text (390×844, 1366×768), and with a Japanese-led profile and a long name. These are the same scenes `docs/battle/GEOMETRY.md` measures. | `tests/e2e/battle_geometry.mjs --shots` | `docs/battle/GEOMETRY.md` |
| `party/` | The player and companions (round 1, before the restyle): pose sheets, key poses, exchanges. | the party art area | `docs/battle/party.md` |
| `party_restyle/` | The party restyled against the owner's reference (round 2): before / after sheets at 1× and 3× for the proof items (the player in the owner's look, Mio's support), every companion's poses and every look option; in-battle views at 1920×1080, 1280×800 and 390×844 (three creatures and a cat) with a before/after close-up; a Normal recording of the idle, Unravel and Mio's draught. | `tests/e2e/battle_party_restyle.mjs --docs` | `docs/battle/party.md` (round 2) |
| `creatures_a/` | Chapter 1–3 families and the Flour Moth proof (indoor and outdoor; Strike, ward, softened hit, Shroud persisting and released; a timing trace). | the creatures A area | `docs/battle/creatures_a.md` |
| `creatures_b/` | Chapter 4–6 and Atlas families: before/after, key poses at native size and 3×, sheets, the Atlas trio, a Keeper exchange. | the creatures B area | `docs/battle/creatures_b.md` |
| `backdrops/` | Location-aware backdrops by family, phone views, state-dependent props, a motion clip. | the backdrops area | `docs/battle/backdrops.md` |
| `pets_overworld/` | Pets in battle and the road, an overworld walk. | the pets / overworld area | `docs/battle/pets_overworld.md` |
