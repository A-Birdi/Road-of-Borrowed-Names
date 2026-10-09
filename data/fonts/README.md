# The book interface's type

The fonts the Wayfarer's Ledger preview (Settings › Display) draws its text in. Expansion packet U02; the record is
[docs/future/work/U02_TYPE.md](../../docs/future/work/U02_TYPE.md).

| Role | Face | Files |
|---|---|---|
| Latin display (section names, headings, small capitals) | Vollkorn, semibold and italic | `vollkorn-wght.woff2`, `vollkorn-italic-wght.woff2` (one variable file each, weights 400–900) |
| Latin reading (descriptions, thoughts, the English line of dialogue) | Vollkorn, regular and italic | the same files |
| Controls (buttons, bookmarks, labels) | BIZ UDPGothic, regular and bold | `biz-udpgothic-regular.woff2`, `biz-udpgothic-bold.woff2` (kana, punctuation and Latin; its kanji come from BIZ UDGothic, the same drawings) |
| Japanese headings | Shippori Mincho, semibold | `shippori-mincho-semibold.woff2` |
| Japanese learning text, body and furigana | BIZ UDGothic, regular and bold (fixed width) | `biz-udgothic-regular.woff2`, `biz-udgothic-bold.woff2` |

**Licence.** All four families are under the SIL Open Font License 1.1, with no Reserved Font Name. The licence files
are in this folder: `OFL-Vollkorn.txt`, `OFL-BIZUDGothic.txt` (for both BIZ UD Gothic families) and
`OFL-ShipporiMincho.txt`. The copyright lines and the licence text also travel inside the game, in `data/NOTICE.txt`,
which the build embeds and About & credits shows.

**Source.** Each subset is made from an unmodified file in the Google Fonts repository
(https://github.com/google/fonts, retrieved 2026-10-09). `sources.json` lists each file's URL, version and SHA-256.

**What was changed.** Each font was:
- subset to the characters the game uses, plus the kana, CJK punctuation and full-width forms;
- written as WOFF2.

Nothing else was changed: glyphs, OpenType features, names and copyright records are kept. In the style sheet they
are called "RB Vollkorn", "RB UD Gothic P", "RB UD Gothic" and "RB Shippori Mincho".

**How the game carries them.**
- `tools/build.mjs` puts the subsets into `index.html` as an inert JSON block (`<script type="application/json"
  id="rb-type">`). It refuses to build if a file's SHA-256 differs from `fonts.json`.
- `src/ui/13_booktype.js` turns them into fonts from those bytes, only when the preview is on. No URL is loaded and
  nothing is fetched.
- The classic look never makes them, and the block adds no measurable start-up time (U02 record).
- Every font list in `src/styles/90_book.css` keeps today's system fonts behind the embedded face. So a character
  missing from a subset still draws, in the system's own font.

**When new text needs a character the subsets lack**, `node tests/run-unit.mjs book_type` fails and names it. Make
the subsets again:

```
pip install fonttools brotli            # in a virtual environment; a development tool, not a game dependency
# download the files listed in sources.json into one folder, then:
python3 tools/fonts/subset.py --src <that folder>
node tools/build.mjs
```

`subset.py` checks each original's SHA-256 and rewrites the subsets and `fonts.json`. That file records each subset's
SHA-256, size and the exact characters it covers, read back from the subset itself.
