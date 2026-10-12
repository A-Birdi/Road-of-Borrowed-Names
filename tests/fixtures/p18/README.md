# P18 Plan B fixtures: each companion's pre-Archive state

Synthetic journeys written by the Plan B launcher's continuous campaigns (a test traveller, "Wayfarer", played
through the built game by the test driver); not anyone's own save. Each is the journey as it stood when the game set
`yn_done` (Steamhollow, Chapter 11 of the twelve-chapter edition, finished; the Archive road not yet reached), in
the campaign of that companion at that Japanese level. `tests/e2e/naming_combos.mjs` starts each of its sixteen
companion × level cases from a fresh copy of its companion's file here (the file itself is checked unchanged).

| File | Companion | Level the campaign was played at | sha256 |
|---|---|---|---|
| `F-ren-yn_done.json` | Ren | F | `d162a8c925160cea9ac6f1899ef07a87c4be472044ad1e15636d15fd683cd941` |
| `E-nao-yn_done.json` | Nao | E | `ecb313b7269676e115a1c242bc9e8572b9c9cd0467fb54984cac924f31e9ac77` |
| `I-mio-yn_done.json` | Mio | I | `0d0cc81921b22c67107b974962542de19fa517ff05eb4850818aa27234a5a7bb` |
| `A-suzu-yn_done.json` | Suzu | A | `286fa306318fdd71902ac80f867f55cd1e3c002820726fa6672496b7a6328816` |

**Provenance.** Build: a clean `git archive` of commit 2debb3c (its `index.html` rebuilt to the same sha256,
`0e12998a…`). Command, in that export, 2026-10-12: `MATRIX_LOG_DIR=… node tests/e2e/matrix.mjs --twelve --fixtures
--pairs E/nao,I/mio 2` and `--pairs A/suzu 1` (started 18:27 UTC, written 19:40–19:41), then `--pairs F/ren 1`
(started 19:42, written 20:51). Every one of the four campaigns passed: the shipped edition asserted, all 17
milestones in the order the game set them, to the ending, 0 problems, 0 page errors (VALIDATION.md "P18 — Plan B").
The campaigns start with the debug start on the road at the prologue's end, not the title screen; the files are the
state the game itself reached from there. Copied unchanged from the export's `tests/fixtures/campaign/`.

These are focused-test starting points at each companion's own history: a naming case at another level changes the
level in Settings before the scene; it does not show that the campaign before it was played at that level.
