# U01 · The book on Journey and Company (preview)

*UI packet acceptance (playbook template v1.1). Packet U01 of P01's interface proof, authorised by Robin's C-78
(2026-10-09). The new look is a **preview behind a setting**; the classic folio stays the default, so Robin's game
looks and behaves exactly as before unless the preview is chosen.*

Packet: U01 / P01 | Source/build revision: the commit that adds this file (build SHA-256 `26aa9da9…3d445f33`,
13,123,831 bytes) | Authorised scope: P00, U00–U02 (C-78)

## Authority and prerequisites

- C-72 to C-74 approved as asked; C-78 authorises this packet. UI direction: playbook §15A, UI-01 to UI-08, UI-10.
- Font policy: UI-TYPE-01 approved in principle (readable and in tone). **No new font in U01**: the book uses today's
  stacks through five role tokens, which U02 fills.
- No outstanding decision blocks this packet.

## What changed

**The preview setting.** Settings › Display › "The Wayfarer's Ledger (preview)": Classic folio (default) · The book ·
The book, flat. Stored with the other display settings (`ledgerStyle`), not in the save; switching it while the
Ledger is open restyles it in place.

**The book** (Journey and Company; the other three sections take the same shell and keep their classic pages until
U04):

- a cloth cover with board edges, a page stack and a gutter;
- two leaves at 720 px and wider, one leaf on phones;
- bookmarks:
  - a column standing out of the right-hand fore-edge at 980 px and wider, with an amber ribbon on the open one;
  - a row above the page below that;
  - on the narrowest phones (under 360 px) the row is tightened so all five stay in one row;
- running heads: the section in Japanese with ruby, in English, and who and how long, in small capitals;
- Journey:
  - entries ruled like a ledger, the selected one marked with an ink chevron and the followed one with the amber edge;
  - the "Next" box set as a margin note;
  - the nudge on a slip with a folded corner;
- Company:
  - the portrait in a photo mount with four corners;
  - the companion's thought set as a quotation;
  - what you know as a list;
  - talk and actions as ink rows;
  - the speech choice as a margin note;
- motion: the book opens, turns a page and closes in under a third of a second. Reduced motion and the flat
  variant run no motion. Closing hands the world back at once; the closing image can't be used and is gone in
  0.23 s.

**The dialogue strip** in the same family (when the preview is on): a deckled paper sheet, the speaker's name on a
vermilion seal, the same single Next button.

**Old-to-new control map.** Every control and action of the classic folio is present in the book with the same
action and words. A test compares the two control by control on Journey and Company (U00's inventory is the
baseline). No action was added or removed.

**One fix found by U00 and made here** (it affects the classic folio too, deliberately). The Journey's "Next" box
named one destination twice when a step's guidance pointed at a person and at the doorway strip in front of them. It
now names it once, choosing the person. Different scenes or places stay separate lines. A unit test sweeps every quest
step: each destination is said once and none is dropped.

**Found and fixed while recording the evidence.** Closing the book re-attached it for its closing motion, which
replayed the leaves' fade-in, so the closing book showed a blank cover for 0.2 s. The leaves are now left as they are.
A browser check fails on the old CSS ("leaves: opacity 0") and passes now.

Semantic behaviour preserved: browsing never changes the journey. A test opens, turns, restyles and closes the book
across every section and sub-page, and checks that the progress fields are unchanged and that the book changes
nothing the classic folio doesn't.

## Evidence

| Check | Command | Result |
|---|---|---|
| The book's browser tests (13): classic is the default and keeps its keys; control and action parity; bookmark orientation and arrow keys; browsing never changes the journey; a flat reading plane at rest; reduced motion and flat; closing; restyling while open; phones at 375×667, 344×882 and 320×640 (one leaf, no sideways scrolling, five bookmarks in one row); one "Next" line; the dialogue strip's speaker and manual Next | `node tests/e2e/book.mjs` | **13 passed, 0 failed** |
| The Next line, unit | `node tests/run-unit.mjs next_line_once` | 123 passed (inside the full suite) |
| Full unit and content suite | `node tests/run-unit.mjs` | **27,390 passed, 0 failed** |
| Related browser suites (the folio, quest guidance, settings, UI, Company) | `node tests/e2e/{folio,quest_guide,settings,ui,company,company_pets}.mjs` | all pass: folio ok; quest guidance "all checks passed"; settings ok; ui 14/0; company "all passed"; company_pets ok |

**UI acceptance items touched by U01:**

| Item | State |
|---|---|
| UI-A01 one authored object | captures made; **Robin's visual review pending** |
| UI-A02 reading plane | tested: no transform on the leaves at rest; normal and large text captured |
| UI-A04 every action reachable | tested: parity with the classic folio, mouse and keyboard; touch checked at phone sizes |
| UI-A05 states without colour alone | the followed entry has an edge and a label, the selected one a chevron; high-contrast captured; not separately tested beyond that |
| UI-A06 one destination once | tested |
| UI-A12 motion can't alter results | tested: browsing, restyling and closing never change progress; the closing book is inert |
| UI-A13 dialogue manual Next | tested: click and Enter; the line never advances by itself |
| UI-A15 compact reflow | tested at 375, 344 and 320 px wide |
| UI-A19 no fabricated progress | tested: state compared around browsing |
| A03, A07–A11, A14, A16–A18, A20 | not in U01, or untested here |

**Captures** (`node tests/e2e/book_captures.mjs` → `docs/screenshots/book/u01/`, 26 WebP files, 1.9 MB). Chromium
headless 1194 (Playwright 1.56.1), DPR 1, today's system fonts, a synthetic fixture shaped like Robin's game (end of
Chapter 2, Suzu, a cat named Samson):

- **Sizes:**
  - desktop 1440×900 (Journey, Company, dialogue);
  - tablet 1024×768;
  - phone 375×667 (Journey, the quest opened, Company top and end, dialogue);
  - phone 320×640.
- **Variants at 1440×900:** flat, reduced motion, high contrast, the largest text (1.4×), and the classic folio for
  comparison.
- **Filmstrips** (opening, page turn, closing). Each strip is five frames sampled from the animations themselves:
  every running animation paused and stepped to the same instants, with the page clock held for the close.
- On a phone the opened quest appears below its entry, as in the classic folio. The capture scrolls it into view;
  the game doesn't (noted for U03).

**Performance**, measured here, headless with software rendering (pessimistic for paint). Median of 15 opens of
Journey:

| Size | Look | Building the page | To the second painted frame | Turning to Company |
|---|---|---|---|---|
| 1440×900 | classic | 10.7 ms | 33.1 ms | 6.6 ms |
| 1440×900 | book | 10.4 ms | 44.6 ms (about one frame more: the textures and shadows) | 8.0 ms |
| 1440×900 | flat | 10.5 ms | 33.3 ms | 7.2 ms |
| 375×667 | classic | 7.6 ms | 33.1 ms | 6.8 ms |
| 375×667 | book | 7.8 ms | 33.4 ms | 7.7 ms |

Firefox and the foldable are **not measured** (not available here).

**Not tested:**

- Firefox;
- a real Android foldable;
- touch beyond Chromium's emulation;
- a screen reader beyond the roles and labels the tests read;
- short landscape;
- Robin's eye.

## Disposition

- **Implemented and tested** as above. **Visually accepted: not yet.** That is Robin's call on the U01/U02 review set
  (one question: does it feel like a book that belongs to this journey, and is it easy to use?).
- **Remaining issues, scoped:**
  - (U03) bring an opened quest into view on a phone;
  - (U02) the type roles still use today's stacks;
  - (U04) Words, Satchel and Map keep their classic pages inside the book.
- **Noticed, not changed** (existing behaviour, unrelated to the book): a press within the last reveal step of a
  dialogue line (at most 0.18 s after its last word appears) completes the line instead of advancing it.
- **Next:** U02 (the type roles and the specimen), then the review set.
