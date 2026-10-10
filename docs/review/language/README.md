# The language review ledger

Robin decided (C-26) that no native reviewer is available. So every Japanese line in the expansion's new content is
reviewed by the lead against references and recorded here, one file per content prefix (`mb.json`, `kr.json`, …).

- **Status:** only `self-reviewed`. Nothing in this ledger, the game or its documents claims a native review that did
  not happen (spec line 178). If a native reader ever becomes available, start with the culturally framed lines, the
  dialect field guide and the classical phrases.
- **Key:** where the line lives and a hash of its text, so editing a line makes its old entry stale (dropped by the
  tool) and the new text needs reviewing again.
- **ref:** what the line was checked against: the game's own lexicon entries, standard textbook grammar, and for
  culture the source named in the line's note.
- **Tool:** `node tools/review_ledger.mjs` lists lines without an entry; `--add "<ref>"` records reviewed lines.
  `tests/unit/review_ledger.test.mjs` fails while any new-content line has no entry.

Writing conservatively (Phase 12): standard, textbook-attested forms; no slang or idiom that can't be checked;
dialect and classical forms few, well attested and labelled.
