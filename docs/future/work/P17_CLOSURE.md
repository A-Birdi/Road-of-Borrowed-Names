# P17 · Closing the quality registers

*Playbook P17 ("content, Japanese, accessibility and performance closure"; §15A's U07 and UI-A01–UI-A20); authorised by
C-81. P18 (the final matrix, a release candidate and any publication) still waits for Robin. Status words follow AC-1
for art ("implemented provisionally", "internally reviewed"); nothing here is described as accepted by Robin unless
Robin said so.*

## What P17 asks for, and what was done

The playbook: requirement-to-test coverage with honest limits; a reference-backed language ledger; usability and
visual review dispositions; cold and warm load, frame and cache traces; supported platform runs; all approved branch
outcomes; no untriaged severe issue; UI-A01–UI-A20 closed with captures, interaction results and the font policy's
status. Its exit: a candidate whose focused evidence is complete enough to justify the expensive final matrix.

| Check | How | Result |
|---|---|---|
| Japanese, reviewed against references | `node tools/review_ledger.mjs` (C-26: no native reviewer; every line `self-reviewed`) | **17,457 new-content lines, 0 without an entry** |
| Furigana on every kanji | the content validator (`tools/validate.mjs`) | no errors |
| Offline, no prohibited dependencies | the built file's content-security policy and a scan of every URL in it | `connect-src 'none'`, `default-src 'none'`; images, media and fonts only from `data:`/`blob:`; the only hostnames in the file are in the licence notices (KanjiVG, Creative Commons, SIL) and SVG's namespace; `ui.mjs` boots from `file://` with no request |
| Licences and provenance | `data/NOTICE.txt` (embedded in the file), `data/fonts/` (OFL texts, `fonts.json` hashes the build checks) | complete; two lines still called the book "the preview" (it is the Ledger for everyone since F-142) and now don't |
| Every functional browser suite | `node tests/e2e/run.mjs --part=k/3`, then `--extra` | see below |
| The whole unit and content suite | `node tests/run-unit.mjs` | **51,943 passed, 0 failed** (on 5a51943; the later commits change interface order and tests only, each with its own suites run) |
| Speed | `tests/e2e/load_budget.mjs`, `tests/e2e/perf.mjs` on a quiet machine | see below |
| The twelve chapters from a new journey | `PURSUE_EDITION=2 node tests/e2e/pursue.mjs F ren twelve` (XP79) | **one uninterrupted run: 17 of 17 legs, 2,433 site visits in 65 minutes, to the ending (post, postgame, ch6_done); 0 problems, 0 page errors** |
| The same on the shipped build's own default (C-84, C-85) | `PURSUE_EDITION=new node tests/e2e/pursue.mjs F ren twelve` (the edition the build gives a new journey) on a clean export of 75875c6 | **17 of 17 legs, 2,433 site visits in 64 minutes, to the ending; 0 problems, 0 page errors; 293 interactions met**; on the lit build (C-86, 38928f5): **17 of 17, 2,433 visits in 78 minutes, 0 problems, 0 page errors** |
| Light and shadow on every map (C-86) | `tests/e2e/world.mjs`, `tests/e2e/world_light.mjs`; captures `node tests/e2e/light_captures.mjs` → `docs/screenshots/light/` | world 13/0, world_light 4/0 (all 226 maps lit and drawn, no page error); Robin's review at completion |

## UI-A01–UI-A20 (§15A, U07)

Evidence named here ran in the complete browser run below unless marked otherwise. "Robin" marks what only Robin can
close; the lead does not mark those accepted.

| Item | Evidence | State |
|---|---|---|
| A01 one authored object | captures: `docs/screenshots/book/` (u01, u02, r2) and the final review set `book/final/` | method accepted by Robin (C-79); **the finished pass awaits Robin's review at completion** |
| A02 reading plane | `book.mjs` (no transform on leaves at rest; flat; reduced motion), largest-text captures | tested |
| A03 distinct families | `book.mjs` (tabs across the top at every width), the final set's pages | tested |
| A04 every action reachable | `book.mjs` (parity with the retired classic folio's recorded controls), `book_surfaces.mjs` (title) | tested |
| A05 not colour alone | `book_surfaces.mjs` (danger is a seal and its word), `book.mjs` (followed and selected marks), contrast captures | tested |
| A06 one destination once | `book.mjs`, `quest_guide.mjs` | tested |
| A07 Company preserves | `company.mjs`, `company_pets.mjs` (four companions, pets, pending story, unsafe places) | tested |
| A08 Distractions its own section | `distractions.mjs` (six-chapter journeys keep five tabs; venue and companion rules) | tested |
| A09 Inn Ledger, six saves | `ui.mjs` (slots, overwrite with cancel, delete, refused storage, `file://`) | tested |
| A10 Japanese and furigana | validator; `book_type` unit (glyph coverage of every subset); `equipment.mjs` and others (readings on Japanese labels); the Japanese-interface capture | tested; no native review (C-26) |
| A11 typography | U02 record (families, licences, coverage, fallback, offline); `book.mjs` (each role in its embedded face, nothing fetched) | tested; type accepted by Robin (TY6, C-79) |
| A12 motion can't alter results | `book.mjs` (browsing, restyling, closing change nothing; the closing book inert) | tested |
| A13 dialogue manual | `book.mjs`, `book_surfaces.mjs` (word help returns focus, nothing advances), `play_ui.mjs` | tested |
| A14 writing and typing | `book_surfaces.mjs` (no transform over the pad, strokes where drawn; IME text in, submit in view), `learning_ui.mjs` | tested |
| A15 compact reflow | `book.mjs`, `play_ui.mjs`, `create.mjs`, `equipment.mjs` at 320–390 px with 200 % text | tested; real phones and the foldable untested |
| A16 battle identity | `book_surfaces.mjs`, the battle suites | tested |
| A17 old and new share the treatment | `book_surfaces.mjs` (census of faces on every surface it opens), the final set | tested |
| A18 quick and usable | `load_budget.mjs`, `perf.mjs` (below) | measured in headless Chromium only |
| A19 no fabricated progress | `book.mjs` (state compared around browsing), `records.mjs` (veils; reveal never awards) | tested |
| A20 visually accepted | the final review set (`docs/screenshots/book/final/`, `tests/e2e/book_final.mjs`) | **Robin's disposition at completion** |

## Open items and their dispositions

Nothing is "deferred forever": each item says who closes it and when.

| Item | Disposition |
|---|---|
| Robin's review of the whole expansion (XP100; UI-A01, UI-A20; the AC-1 art pass, "implemented provisionally, internally reviewed") | **Robin, at completion** (C-81). Review sets: `docs/screenshots/book/final/`, `docs/screenshots/p16/`, the travel volume's pages in the game |
| A person playing the new chapters, the Hall, the guardians, Ashihara Shinden, the coast (XP11, XP18, XP23, XP27, XP41, XP50, XP59, XP67, XP72, XP76, XP80, XP84, XP87, XP90, XP93, XP96) | **A human playtest**; automation drove every one of them (story tests, the chained route), which is not the same thing. Open until a person plays them |
| Playtime (R3.9) | Not measurable by automation; open until a person plays through |
| A native speaker's review of the Japanese | None available (C-26); every new line is self-reviewed against references and recorded; nothing claims a native review |
| Real handwriting samples | The recogniser is tested on synthetic and font-derived strokes only; open until real samples exist |
| Firefox, Safari, real phones, Robin's foldable; speed and battery on them | Untested by automation here (Chromium only); P18's matrix and Robin's devices |
| The Kettle's Mother's hood on the painted Harmony bust | Drawn on the road sprite, the portrait, the battle figure and the code-drawn bust (`A.hood`, P16d). The painted kit has no file for it yet: the contract lists it among the worn things not shown in a painted bust, with that reason (`src/ui/88_harmony_contract.js`, `NOT_SHOWN`), so the painted bust is drawn without it. The painted file joins the next painted-asset batch (docs/harmony/ASSET_BRIEF.md) |
| The phone tab row at 320 px with the largest text | It scrolls behind its arrows, as designed for that width (UI-A15); every tab stays reachable by arrow, swipe and keyboard |
| VA-1, the voice audition (C-83) | **Queued after P17**; not started |
| Light and shadow on real devices (C-86) | Frame cost measured in headless software Chromium only (steady frames about 3 → 6–9 ms at 1440×900; a big town's first frame 0.45–0.85 s, inside the transition's dark screen); Settings → "Light and shadow" Off is the flat picture. Real phones and GPUs: P18's matrix and Robin's devices |
