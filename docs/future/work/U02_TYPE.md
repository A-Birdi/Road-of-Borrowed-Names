# U02 · The type roles and the specimen

*UI packet acceptance (playbook template v1.1). Packet U02 of P01's interface proof, authorised by Robin's C-78
(2026-10-09). The new type belongs to the book preview: the classic folio, still the default, never makes these
fonts.*

Packet: U02 / P01 | Source/build revision: the commit that adds this file | Authorised scope: P00, U00–U02 (C-78)

## Authority and prerequisites

- **Font policy:** UI-TYPE-01, approved in principle. Robin, 2026-10-09: "The new font can work as long as it's
  readable and stylized for the tone of the game."
- **Kept:** offline, embedded, licence recorded; no remote fonts; no handwriting, brush or distressed face on kana,
  kanji, furigana or long text (addendum UI-09).
- **Outstanding:** Robin's visual acceptance (the review set).

## What changed

**The five roles** (tokens `--type-*` in `src/styles/90_book.css`, filled only under the preview):

| Role | Face | Why |
|---|---|---|
| Latin display | Vollkorn semibold, italic, true small caps | a sturdy, warm book face: a well-used ledger, not a software window |
| Latin reading | Vollkorn regular and italic | dark enough to read on paper tones; lining figures, a little more word space |
| Controls | BIZ UDPGothic regular and bold | Morisawa's universal-design face: clear at small sizes; Latin and Japanese labels in one family |
| Japanese headings | Shippori Mincho semibold | a printed, literary Mincho for titles and names |
| Japanese learning text, body, furigana | BIZ UDGothic regular and bold | fixed width (each character one square), wide word gaps, distinct dakuten and small kana at furigana size |

**Comparisons made in the game** (Journey, Company and dialogue at 1440×900 and 375×667, real strings):

- **Latin:**
  - Alegreya with Alegreya Sans: the sans has a 0.165 em space and words ran together at control sizes;
  - Literata with Source Sans 3: good, but Source Sans carries a Reserved Font Name, which a subset would have to drop;
  - Vollkorn: chosen.
- **Japanese headings:** Shippori Mincho B1, Zen Old Mincho, Shippori Mincho. Zen Old Mincho lacks `～` and `－`,
  which the game uses.
- **Japanese learning text:**
  - BIZ UDPGothic (proportional): denser kana;
  - Zen Kaku Gothic New: lacks `～` and `－`;
  - BIZ UDGothic (fixed): chosen;
  - against the coherent Mincho option, BIZ UDMincho, shown in the specimen: more literary, but its hairlines thin
    out in furigana.
- **Not considered:** Klee One and other handwriting faces, per UI-09.

**Two type fixes found in the specimen:**
- Vollkorn's default old-style figures made "1" read as a small "I", so the book uses lining figures.
- Its 0.2 em space ran words together on screen, so the book adds 0.06 em between Latin words. Japanese lines keep
  their own spacing.

**Embedding** (`data/fonts/README.md`):

- **Subsets.** `tools/fonts/subset.py` checks each original's SHA-256 and subsets it. A subset holds the characters
  the game uses plus the kana blocks, CJK punctuation and full-width forms; the UI face has no kanji, since its kanji
  are UD Gothic's drawings. It writes WOFF2 and records each subset's hash, size and exact coverage in
  `data/fonts/fonts.json`.
  - 7 files, 1,848 KiB in all: Vollkorn ×2 (157 KiB), BIZ UDPGothic ×2 (222 KiB), BIZ UDGothic ×2 (1,084 KiB),
    Shippori Mincho (388 KiB).
- **In the page.** The build puts them in `index.html` as an inert JSON block (`<script type="application/json"
  id="rb-type">`, 2,465 KiB as base64), and refuses to build if a file's hash differs from the manifest.
- **At runtime.** `src/ui/13_booktype.js` makes FontFaces from those bytes, only when the preview is on: when the
  browser is idle after start-up, or at the latest when the Ledger opens. No URL is loaded; the page's CSP
  (`font-src data:`) is unchanged.
- **Fallback.** Every role's list keeps today's system fonts behind the embedded face, so a missing character still
  draws.
- **Licences.** The three OFL files are in `data/fonts/`. The copyright lines and the licence text are added to
  `data/NOTICE.txt`, which the build embeds and About & credits shows. None of the fonts has a Reserved Font Name;
  the style sheet calls them "RB Vollkorn", "RB UD Gothic P", "RB UD Gothic" and "RB Shippori Mincho".

**A first attempt that was measured and replaced.** Embedding the fonts as CSS `@font-face` data URLs cost every
player start-up time, the classic look included:

| Build | Start-up, normal CPU | Start-up, 4× CPU throttle |
|---|---|---|
| CSS data URLs, with the JIS level 1 kanji | +150 ms | +675 ms |
| The inert block, same size | +180 ms | +460 ms |
| The inert block at today's size (without JIS level 1 and without kanji in the UI face), interleaved runs | see below | see below |

Interleaved runs of the final build, 4× CPU throttle (medians of 8):

| Build | Ready at |
|---|---|
| U01 build (no fonts) | 3,994 ms |
| This build with the font block removed | 4,072 ms |
| This build | 4,080 ms |

The block itself costs about 8 ms there, inside the noise. At normal CPU the difference to U01 was +35 ms (medians
of 9, separate run).

## Evidence

| Check | Command | Result |
|---|---|---|
| Book tests, now 14 | `node tests/e2e/book.mjs` | **14 passed, 0 failed**. The new test checks each role's face on the Journey, Company and dialogue elements, that all 7 faces load from the page's own bytes with nothing fetched, and that the classic look makes none of them |
| Coverage and provenance | `node tests/run-unit.mjs book_type` | **60 passed, 0 failed**. Covers: each subset's hash and size as recorded; source and licence files; NOTICE.txt; every kana, kanji and CJK punctuation mark in the game's source in the learning face; every kana and kanji in the heading face; every Latin letter, digit and mark in Vollkorn; the UI list draws everything |
| The specimen | `node tests/e2e/type_specimen.mjs --compare <BIZ UDMincho subset>` | normal and 140%: 7 faces loaded, **100 furigana, 0 overlapping**, 0 requests, 0 errors |
| Full unit suite | `node tests/run-unit.mjs` | **27,450 passed, 0 failed** |
| Related browser suites | `folio`, `quest_guide`, `settings`, `ui`, `company`, `company_pets` | all pass (ui 14/0; quest guidance and Company "all passed") |

**The specimen** (`docs/screenshots/book/u02/specimen_normal.webp`, `specimen_large.webp`) uses real strings only:

- **Ledger strings** (Journey and Company at the end of Chapter 2): the section names, quest titles, the step,
  Suzu's thought, the bond line and the "Next" margin note.
- **Chapter 1 lines** for the hard cases:
  - handakuten: `rw.ren_first`;
  - dakuten, small kana and the small tsu: `rw.arrive`;
  - the long vowel mark: `rw.mochi_find`;
  - dense kanji: `rw.mr_marker`;
  - a long line: `rw.hall_gather`.
- **Checks shown:** I/l/1 and O/0 (with Vollkorn's unused old-style figures, to show why they're off), a fallback
  kanji outside the subsets (drawn by the system font), and BIZ UDMincho beside the chosen Gothic, labelled as a
  comparison.

**The book with its type:** 26 captures in `docs/screenshots/book/u02/` (`node tests/e2e/book_captures.mjs
docs/screenshots/book/u02`). They cover the same views as U01: desktop, tablet, 375 and 320 phones, flat, reduced
motion, high contrast, 140% text, the filmstrips and the classic comparison.

**UI acceptance items:**

| Item | State |
|---|---|
| UI-A10: Japanese, furigana and mixed text correct and legible | coverage tested; the specimen shows no furigana overlap at either size; Robin's eye pending |
| UI-A11: typography readable, in tone, offline | family, licence, coverage, offline and fallback recorded and tested; **visual acceptance pending** |
| UI-A18: still quick | start-up measured as above; installing the seven faces (preview only, idle after start-up): median 98 ms, 316 ms at 4× throttle. Firefox and the foldable not measured |

## Disposition

- **Done:** implemented and tested. **Visually accepted: not yet** (the U01/U02 review set).
- **Remaining:**
  - other pages adopt the roles as the shell reaches them (U03–U06);
  - text inputs (search, typing answers) are not on Journey or Company and are untested with the new type (U04/U05);
  - Firefox and the foldable are not measured.
- **Next:** the review set for Robin.
