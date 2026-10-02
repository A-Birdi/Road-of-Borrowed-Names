# Companion shiritori — captures

Real captures of the built `index.html` in headless Chromium, made by
`node tests/e2e/wordplay_layout.mjs --docs` with synthetic campaigns at the Cinder Orchard inn
and the **test-only** fixture bank (`tests/e2e/wordplay_fixture.mjs`; the game ships no
fixture). Device pixel ratio 1, WebP. The full set (every viewport and screen) is written to
`tests/e2e/out/wordplay/` (not committed); `tests/e2e/wordplay.mjs` adds the ん warning, the
stage result and the Company card before and after a game there.

These show the implementation as it is; they are not evidence of how it feels to play (no human
play has happened) and the opponent is the foundation's provisional Casual policy.

| File | What |
|---|---|
| `at_table_nao_1280x800.webp` | Nao at the table after one exchange: portrait, slips on the board, the gesture line, the chain |
| `at_table_mio_1280x800.webp` | Mio, with a pet (a cat) resting beside the table — cosmetic only |
| `at_table_ren_1280x800.webp` | Ren |
| `at_table_suzu_1280x800.webp` | Suzu |
| `prep_mio_1280x800.webp` | The preparation sheet (defaults, provisional-opponent note) |
| `table_suzu_390x844.webp` | The table on a phone (portrait) |
| `table_nao_844x390.webp` | Short landscape: scenery compressed, input kept |
| `table_ren_320x640_text200.webp` | 320×640 at 200 % text |
| `table_mio_320x640.webp` | 320×640 |
| `choose_suzu_390x844.webp` | Open-book: the whole bank, filtered by the required kana |
| `result_mio_1280x800.webp` | A result (concession, with the words still unused named) |
| `review_suzu_390x844.webp` | Look back at the chain |
| `company_mio_1280x800.webp` | Company › Companion › Wordplay (3×3 grid, records) |
| `company_ren_320x640_text200.webp` | The same card at 320×640, 200 % text |
| `table_ren_ja_390x844.webp` | Interface language Japanese (labels with furigana), reduced motion |

## Recording

`wordplay_match.webm` (46 s, 960×540) is from `node tests/e2e/wordplay_video.mjs`, run on the
integrated build at the Cinder Orchard inn with Nao and the cat, using the shipped Pocket bank and
the real Casual opponent (no fixture, no scripted opponent). It shows:
- Play shiritori in the rest menu after Just chat, and the preparation sheet with its defaults;
- the demonstration skipped;
- words chosen from the open book (かさ, どんぐり), typed (ラジオ, ゴリラ) and handwritten (やま);
- the pad first reading や as small ゃ and the written one chosen from its other readings;
- a real win: Nao had no ら word left after ゴリラ, "Stage won for the first time: Pocket words ·
  Casual", the first-game memory, and "Recorded in this journey; it has no save slot, so nothing was
  written to storage".

Each run picks its own starter, so a rerun records a different game. The strokes follow KanjiVG and
are synthetic, not a person's handwriting.
