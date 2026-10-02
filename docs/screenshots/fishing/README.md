# A Quiet Cast — captures

All images here are written by the browser test `node tests/e2e/fishing.mjs`
(headless Chromium, the built `index.html`, synthetic postgame campaigns in fresh
browser contexts; no player save). The recording `fishing_catch.webm` is made by
`node tests/e2e/fishing_video.mjs`. They were looked at by the author only (visual
inspection); no human play, no device testing. See `docs/practice/fishing.md`.

The stage shots (`*_cast`, `*_bite`, `*_act`, `*_release`, `ribbon_on_rod`) are of the
stage box alone; the others are of the whole window.

## One complete catch from the world (Reedwake riverbank, Nao and the cat, 1280×800)

| File | What it shows |
|---|---|
| `world_station_river.webp` | the fishing station on the Reedwake bank (postgame), the player facing it |
| `station_menu.webp` | the station's scene after the signed note: Cast / Fishing notes / Rules / Leave |
| `catch_river_nao_cat_prep.webp` | preparation: survey line, Discover the waters, three patches; input, the Pace control (Off by default) and casts 1/3/5 are further down the panel |
| `catch_river_nao_cat_cast.webp` | the cast (stage) |
| `catch_river_nao_cat_bite.webp` | the bite: the float dips, the fish's shadow below; waits indefinitely |
| `catch_river_nao_cat_situation.webp` | the situation in words, Yasu's note, the rule on screen |
| `catch_river_nao_cat_act.webp` | the line/rod/water action that matches the answer |
| `catch_river_nao_cat_observe.webp` | the observation page (drawing, name, reading, survey line, milestone, remark); stays until Release |
| `catch_river_nao_cat_release.webp` | the release (crouched at the water) |
| `after_release.webp` | Cast again / Review / Leave |
| `notes_first.webp` | Journey › Fishing notes after the first catch (one plate, eight plain outlines) |

## Recognition repair (handwriting, Mio)

| File | What it shows |
|---|---|
| `repair_wrong_read.webp` | a handwritten answer whose last character the pad read wrongly; the opt-in "That is not what I wrote" button |
| `repair_misread_report.webp` | after the report: "The pad misread it" (it does not count against you), the strokes kept, the character rewritten by tapping it |

## Three-catch survey from Words › Ways to practise (Ren and the bird)

| File | What it shows |
|---|---|
| `words_ways_to_practise.webp` | Words › Ways to practise with the fishing entry (Begin here) |
| `survey_ren_bird_prep.webp` … `survey_ren_bird_release.webp` | the third discovery catch, which completes Yasu's survey (prep, cast, bite, situation, act, observe, release) |
| `ribbon_on_rod.webp` | the rod ribbon tied on after the survey (stage) |

## Reload

| File | What it shows |
|---|---|
| `resume_prompt.webp` | after a reload with a cast saved in the water: "Pick it up again (the same fish is on the line), or let it go" |

## Every companion and every pet species (1280×800)

`stage_<companion>_<pet>_{prep,cast,bite,situation,act,observe,release}.webp` for
Nao + cat (river), Mio + dog (pond), Ren + bird (harbour), Suzu + tanuki (river).
`coverage_pairs.json` lists, for all 16 companion × pet pairs and the four no-pet runs,
the companion behaviours and pet reactions the stage drew through every phase.

## Layouts

`layout_<w>x<h>[_text200].webp` (the preparation panel on arrival) and `..._after.webp`
(after one whole catch at that size) for 320×640, 390×844, 844×390, 1280×800, and 200 %
text at 390×844 and 1280×800.

## Pace

The browser test "pace Off" has no capture of its own (it checks the one
`RB.pace.attempt` call and the untimed record). No capture of a timed cast exists: the
pace module is not merged in this branch.

## Touch and reduced motion

| File | What it shows |
|---|---|
| `touch_task_390.webp`, `touch_observe_390.webp` | a catch by touch taps on a 390×844 phone viewport: the task sheet and the observation page |
| `reduced_motion_*.webp` | the same catch with Reduce motion on and Activity chatter Quiet (still key poses; no remarks) |

## Recording

`fishing_catch.webm` (about 75 s) — two whole catches with the mouse: the river
station's signed note and Cast with Nao and the cat, then the harbour with Suzu and the
tanuki. Recorded by Playwright's recorder in headless Chromium.

The committed captures were converted to WebP at merge (quality 0.9, same size) and were
retaken on the merged build, with the real pace module.
