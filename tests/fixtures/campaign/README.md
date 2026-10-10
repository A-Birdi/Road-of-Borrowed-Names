# Campaign fixtures (expansion S7)

Synthetic campaigns written by the browser campaign test (`PURSUE_FIXTURES=1 node tests/e2e/matrix.mjs F ren 1`):
a test traveller ("Wayfarer"), Female presentation, Ren as companion, played through the built game by the test
driver. They are not anyone's own save. Each is the campaign state as it stood at a milestone:

| File | Milestone |
|---|---|
| `F-ren-ch2_done.json` | Chapter 2 finished (Saltglass), six-chapter edition |
| `F-ren-ch6_done.json` | the story finished (postgame), six-chapter edition |
| `F-ren-atlas_restore_1.json` | after one Atlas expedition in the postgame |

`tests/unit/fixtures_campaign.test.mjs` loads them as an older save would be loaded (the expansion's fields
removed), and checks that nothing they hold changes. Regenerate them only when the save shape changes on purpose.
