# Cosmetic pets — captures

Real captures of the built game in headless Chromium (synthetic, session-only test campaigns in fresh browser
contexts; no player saves), made by `tests/e2e/pets.mjs`, `pets_greet.mjs`, `pets_gallery.mjs`,
`pets_sheets.mjs` and `pets_video.mjs`, copied here as WebP at full scale by `tests/e2e/pets_docs.mjs` (pixel
art is never smoothed). Most are cropped to the part of the screen that matters.

## Contact sheets and the coverage matrix

| File | What it shows |
|---|---|
| `gallery_look1.webp` | The coverage matrix (development page `?dev=pets`): the four species (first look) × every response family, the creature's move (hit / soft / status), the settled victory, every calm idle, the ready idle and the four stances; three moments along each timeline in full motion and the held pose with reduced motion (gold column). |
| `gallery_look2.webp`, `gallery_look3.webp` | The same matrix in the second and third looks. |
| `sheet_world.webp` | Every species with every companion on the road (a different look per companion): after a short walk the animal has followed and settled beside you. |
| `sheet_battle.webp` | The same sixteen pairs in battle, calm while you choose: the animal sits between your companion and you, seen from behind like the two of you. |
| `sheet_company.webp` | The same sixteen pairs on Company › Pet. |
| `greet_all.webp` | The sixteen "Greet together" moments, each caught mid-moment: the animal has come over to the companion. |

## One species at a time

| File | What it shows |
|---|---|
| `<species>_world_follow.webp` | Reedwake square after a walk with the keyboard: it followed the walked trail and settled on a free tile where it is seen. |
| `cat_world_bridge.webp` | Crossing the Reedwake bridge: on the planks behind your companion, never on the water. |
| `<species>_battle_calm.webp` | The Flour Moth on the mill road, calm while you choose: its place between your companion and you, clear of the cards, the slips and the resolve panel. |
| `<species>_battle_react.webp` | Mid-exchange (Unravel): its unravel reaction. |
| `<species>_company_wide.webp` | Company › Pet at 1280×800: the met animals as cards (Select / Selected, No pet), the detail with portrait, live preview, where you met, Rename, Appearance and the plain "Cosmetic companion — no battle or puzzle effects" note. |
| `cat_company_pat.webp` | The Pat preview: your hand (in your skin tone) and the cat leaning into it. Nothing is gained. |
| `cat_company_390.webp`, `cat_company_320_200.webp` | The phone page (390×844) and 320×640 at 200 % text: the detail as one page with Back, no sideways scrolling. |
| `tanuki_company_844.webp` | A phone held sideways (844×390): the two leaves fit, no sideways scrolling. |
| `<species>_vignette_cause.webp` | Each meeting's visible cause: the cat and the loose reed screen (Reedwake), the bird and the ribbon on the mooring post (Saltglass), the dog and the swinging gate (Cinder Orchard), the tanuki, its hollow under the root and the blowing notices (the Orchard Road). |
| `<species>_vignette_near.webp` | After the ordinary interaction: the animal has come to sit by you, during the lines before the invitation. |
| `cat_vignette_meet.webp` | The invitation, with **Not now**. |
| `cat_vignette_name.webp` | Naming at acquisition: plain text, any language, up to 24 characters, the default kept with one button. |
| `<species>_vignette_after.webp` | After "Travel together": the animal that was waiting there is now the one following you. |
| `dev_play_wide.webp`, `dev_play_phone.webp`, `dev_play_landscape.webp` | The development playback panel (only with `?dev=pets`) driving the real stage, at 1280×800 (open), 390×844 and 844×390 (folded to one button so the stage stays in view). |
| `tanuki_battle.webm` | A recording of real play (mouse and keyboard, 960×540, no sound): the walk up the mill road with the tanuki following, then exchanges with the Flour Moth — Unravel (its reaction), Suzu's move (a short acknowledgement), the moth's Strike (its safe nearby reaction), a 守る that blocks it, and the last knot (its settled-victory gesture) — and the last line clicked away. 70 s from the walk on (the page load cut), re-encoded at about 190 kb/s (1.7 MB). |
