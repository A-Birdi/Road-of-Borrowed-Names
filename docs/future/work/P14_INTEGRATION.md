# P14 · The twelve chapters joined up, with the four epilogues

*Playbook P14 ("Complete twelve-chapter story integration"); plan [10_STORY.md](../plan/10_STORY.md) §6a (the Hush as a
rising tragedy: the final approach made heavier), §7a (romance, C-63, C-67), §9a (New Game+ and the farewell),
[14_COMPANIONS.md](../plan/14_COMPANIONS.md) §2 step 7 (each companion's dream at the ending), sealed notes S1, S13,
S14, S15 (the lead's reading; the canon events of the last chapter stay as they are). Authorised by C-81; the colour
and sound of the final approach are art work under C-82 ([AC1_ART.md](../plan/AC1_ART.md) E: lighting and the final
grade kept separate; the UI and the writing pad are never tinted). **An internal milestone, not a release** (A04): the
twelve-chapter edition stays behind its development switch, and the six-chapter game is unchanged.*

## What P14 joins up

Chapters 3, 4, 7, 9, 10 and 11 were built and tested one at a time, each route starting from the previous chapter's
fixture. P14 makes them one story: the last chapter's road feels the Hush more heavily in a twelve-chapter journey,
each companion's second arc reaches its ending, and New Game+ says goodbye in a way true to where the ending leaves
the companion.

## Plan

| Item | Source | Where | Status |
|---|---|---|---|
| The final approach made heavier (twelve-chapter journeys only): the palette drains step by step along the Archive road and into the Archive; the music thins to a low drone with the score's main motif under it; the ambient sound drops out map by map; lanterns' names peel and drift uphill; a short sequence hushes the companion's voice for a few lines until the player restores it (never permanent; the companion never harmed). The canon events of the chapter unchanged | 10_STORY §6a, S15 | `src/content/sa2/10_approach.js`, `src/engine/60_render.js` (the grade, the drifting slips), `src/audio/38z_songs_sa2.js` | Done (F-108, F-109) |
| The four second arcs' endings, inside the companion's ending at the bridge: Nao leaves a forwarding address for the first time and lets the player choose where; Mio's own dispensary, an honest label on every shelf and one jar with none; Ren's answer to Hisae, a keeper who walks the road; Suzu's play and her troupe | 14_COMPANIONS §2, S14 | `src/content/sa2/20_scenes.js`, called from `src/content/pages/20_ending.js` | Done (F-110) |
| The ending's romance moment (C-63, C-67): the player's choice, answered as the romantic moment (holding hands, or a kiss) or as the closest of friends; the companion's consent in their own voice; Bond the same either way; nothing explicit | 10_STORY §7a | the ending | Done (F-111) |
| The New Game+ farewell, per §9a: the companion's unfinished work (S13: Nao's letters and addresses, Mio's refusals and care, Ren's lanterns and their teacher's sayings, Suzu's play and troupe), the lanterns brightening and the road folding back to the morning at Reedwake, goodbye for now; the memories said plainly to come along; a short solo version for a save from before a companion was chosen | 10_STORY §9a, S13 | `src/content/records/10_ngplus.js` | Done (F-112) |
| Return links: every region of the twelve chapters reachable again after its chapter (on foot, by travel or by ferry); no optional boat or task needed for the main story | playbook P14 evidence | the chart, travel | Done: after the story every place on the chart is connected to Reedwake by its roads (`sa2_ch12`) |
| The taught tools at the end: the modifier words taught across the chapters (いくつか, すべて, あらゆる, ごとに, 全体…) usable in the last chapter's encounters | playbook P14 | encounters | Done: ordinary battles in a twelve-chapter journey offer every taught modifier, the last chapter's included (`sa2_ch12`) |
| Chronology and reveal checks: nothing of the last chapter shown early (S1); each chapter's call and done flags in order; the chapter numbers the player sees | S1 | tests | Done: the road above Lanternfall opens only after Steamhollow in a twelve-chapter journey (as before in six); the last chapter opens from Steamhollow's north road as it always has; the chapters' own gates are each chapter's tests (`sa2_ch12`) |
| The music ladder re-tiered across twelve chapters (C-22) | C-22 | `src/audio`, `tests/unit/audio_zones.test.mjs` | Done (F-113) |
| Tests: unit (the approach's states, the epilogues per companion, romance answered both ways, the farewell per companion and solo, return links, the edition boundary); browser (the approach's grade and the hushed voice, the epilogue, the farewell); the route F/Ren through Chapter 12 from Chapter 11's fixture, and the chapters' routes chained from a new journey | playbook P14 | `tests/` | Done but one: `sa2_ch12` (unit), `tests/e2e/archive12.mjs` (browser, 4/0 on 81d41f7), the route from `F-ren-yn_done.json` to `ch6_done` (635 site visits; VALIDATION.md "The expansion, P14"). Not yet: the chained route from a new journey |

## Rules kept

- The canon events of the last chapter stay as they are; the new layers are presentation and the companions' own
  endings, in twelve-chapter journeys only.
- The companion is never harmed and the hush on their voice is never permanent; no separation is added.
- Romance is optional, the player's choice, never worth more (C-67); no jealousy or resentment wording.
- Lighting and grade never change outcomes, learning evidence or story time (AC-A19); the UI and the writing pad are
  never tinted; reduced motion keeps the drift still.
- Every line of new Japanese through the review ledger (self-review only).
