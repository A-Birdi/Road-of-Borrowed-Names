# Field weaving, the Mill Road, F1–F6 and Roadside Keepsakes

These are real captures of the built game, made with synthetic test states (no player saves) in headless Chromium by `tests/e2e/fieldweave.mjs`, `mill_road.mjs` and `keepsakes.mjs`. They were copied here as full-scale WebP, so the pixel art stays unsmoothed. The raw PNGs are in `tests/e2e/out/{fieldweave,mill_road,keepsakes}/`, which is gitignored. Design and test notes: `docs/addendum/fieldweave.md`.

## Field weaving

- `weave_sheet_1280x800.webp`: the Weave sheet beside the view on a wide screen. It shows the nearby things as a list, the chosen thing framed and labelled in the world, what can be seen of it, and only the words already learned.
- `weave_sheet_390x844.webp`: on a phone the sheet docks below, clear of the target and the player.
- `weave_writing_390x844.webp`: the language step is the game's own challenge (here with choices). It includes "Choose a different word".
- `f1_ward_sequence.webp`: F1, Protect woven on the slip screen, in four frames.
  - The screen swings in the draught; the brush is raised.
  - The ward forms, with its seal tag hung on the post.
  - The screen is held.
  - Afterwards, the ward still holds (there is no timer) until the clamp is closed.

## The puzzles, solved

- `f1_done_1280x800.webp`: F1, clamped. The keepsake notice appears once.
- `f2_filled_1280x800.webp`: F2, the float at the viewing slot after Water through the funnel.
- `f3_woven_1280x800.webp`: F3, Stone under the short foot and a woven glow; the maker's leaf is readable.
- `f4_cloth_1280x800.webp`: F4, the cover cleared with the warm cloth. The labels ○ △ ○ are visible and box ③ has been found.
- `f5_rung_1280x800.webp`: F5, the note sent by the right tube to the display niche. Fumi reads undisturbed in the nook.
- `f6_filing_check_1280x800.webp`: F6's filing sheet after "Check against the rule". A wrong placement is named by the visible rule it breaks (the notch).

## The Mill Road

- `millroad_ridge_600x900.webp`: the whole road on one screen. The ridge has two one-tile ways through: the narrows (x 6) and the reed-closed animal track (x 12). A click on the mill door walked into the narrows and was pushed back to the road.
- `millroad_reeds_look_600x900.webp`: looking at the reeds. The trodden line at their roots is the observation Nao can take up.

## Roadside Keepsakes

- `keepsakes_found_1280x800.webp`: the entry, which shows:
  - the art at ×4;
  - the name with its reading, and the description;
  - where it was found;
  - Mio's comment from the time;
  - "On display".
- `keepsakes_hints_1280x800.webp`: a keepsake not yet found, with a broad hint and then a specific one. No names are listed.
- `keepsakes_390x844.webp`: the page on a phone.
- `keepsakes_on_display_company_1280x800.webp`: the pinned keepsake on Company › Shared memories.

## Recording

- `f1_two_routes.webm`: two valid solutions of F1, with different companion feedback (addendum §23.7).
  - With Mio: the screen is inspected with a mouse click, "Weave a word on it…", Protect answered in the real challenge, the ward at the screen, and then the clamp. Mio reacts to the ward route.
  - With Nao: the screen is swung shut by hand, and then the clamp. Nao reacts to the ordinary route.
  - Movement is the game's click-to-walk. The script is `tests/e2e/fieldweave_video.mjs`.
  - It was re-encoded with the ffmpeg that ships with Playwright (VP8, 12 fps, about 250 kbit/s; 1 min 45 s, 3.3 MB), so it could be kept in the repository. The title-screen lead-in was trimmed.
  - It was recorded while the machine was heavily loaded by other test runs, so pauses are longer than in play.
