# Cases and Known Details captures

Real captures of the built game in headless Chromium (installed Playwright),
taken with synthetic test campaigns in isolated browser contexts. No player
save was used. `tests/e2e/cases_shots.mjs` made the case captures and
`tests/e2e/known.mjs` made the Known Details captures. `node
tests/e2e/cases_to_docs.mjs` converted them to WebP (quality 0.82, same
size). A person looked at them for layout. That review does not check
whether the Japanese reads naturally or whether the cases are fun to play.
See `docs/addendum/cases.md` for what the cases are and how they were tested.

| File | What it shows |
|---|---|
| `world_quay_bench_1280x800.webp` | Saltglass quay. Hama stands behind the workbench, which has a notch in its edge. The call bell hangs on its post beside the barrels. |
| `world_seto_house_1280x800.webp` | The top of the Saltglass harbour map. The Seto house (top right) is new, and Seto stands beside it. |
| `world_old_footing_1280x800.webp` | The old stone footing and its post on the east beach. This is where the "East Landing" on the parcel's label used to be. The quay with Hama's workbench is on the left. |
| `world_lighthouse_sketch_1280x800.webp` | The lighthouse room. The thin sketch is pinned in the window, marked as something to look at. |
| `world_star_stair_1280x800.webp` | The foot of the Star Stair above Snowbell. The stair lantern, the little shrine and the bare tree stand in the positions the deduction uses. The stone seat is below the player, with a flat stone on each side (west and east). |
| `world_seat_framed_1280x800.webp` | The same place after Case B. The player chose to leave the sketch there, so it now stands in a small frame on a post beside the stone seat. |
| `world_tideboard_chalk_1280x800.webp` | The tide board outside the Saltglass tide hut after Shiori has read the table with you. Her chalk rings the high and low of the curve and adds figures beside each. The times themselves are in the board's text. |
| `record_parcel_1280x800.webp` | Journey › Cases with both cases open. It shows the parcel's record: the question, the "where you left off" recap (the places the observations came from and the current hypothesis), and the first observation (the address label: original Japanese with furigana, then the source). |
| `record_parcel_compare_1280x800.webp` | Two observations compared side by side. On the left is the wax seal (Seen, with its picture and caption). On the right is the post house's record of marks (Written, in Japanese with a translation). |
| `record_view_sheet_1280x800.webp` | Case B's sketch sheet, as it hung in the window. It is compared with the view from the stone seat, with the text for both. Below are the Turn over / Compare / Reset buttons and the "look closer" ways (Tilt it to the light is chosen). |
| `record_view_turned_1280x800.webp` | The sheet after pressing Turn over from the keyboard. The other face of the sheet is shown, and its order and pressed leaf are written out in words. |
| `record_view_help_1280x800.webp` | Reasoning help. Hints 1–3 are shown, each labelled with how much it gives away. The answer is behind a second press ("Show the answer" / "Not yet"). Reading it costs nothing. |
| `record_view_solved_1280x800.webp` | The solved view case: the remembered sketch shown the right way round beside the view it shows, then the personal note and the help, which stays readable. |
| `record_list_390x844.webp` | Phone, 390×844: the case list. |
| `record_view_390x844.webp` | Phone: the top of the view case's record. |
| `record_view_sheet_390x844.webp` | Phone: the sketch sheet. |
| `record_view_sheet_390x844_text200.webp` | Phone at the largest text size (200 %) with high contrast. The sheet still fits and nothing scrolls sideways. |
| `known_tower_solved_1280x800.webp` | Map › Known details for a map with a solved mechanism. It shows the ✓ shape and the number on the diagram and in the list, the ways out (blue outlines), where you are (red triangle), and the key to the shapes. |
| `known_pins_1280x800.webp` | A map with an opened shortcut and a solved detail, plus one player pin (View) whose note contains markup. The markup is shown as plain text and never rendered. The limit ("1 of 20 on this map") is shown before anything is lost. |
| `known_harbour_390x844.webp` | Phone: the whole Saltglass harbour fitted to the screen, with the old footing noted (◇). |
| `known_harbour_list_390x844.webp` | Phone: the same page scrolled to the list and the pin controls. |
