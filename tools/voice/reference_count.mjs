// LI-8 planning (not production): what the narrator would record so that "Listen" / "Say it" / "Hear it" on a kana,
// a kanji or a word in the Ledger and in word help plays a recorded voice instead of the device's (Robin, 2026-10-16:
// "When you choose to Listen to a specific Kana or Kanji, like 省略 in the Ledger, the narrator should have a voiced
// line for that"). Counted from the game's own data; nothing is generated.
//  - Kana: every character the kana chart and the lessons teach (hiragana, katakana, the combined sounds), once each.
//  - Kanji: one recording per kanji that has readings, its readings in the chart's order (on, then kun), read as a
//    short list; a kanji with no reading of its own (々) has none.
//  - Words: every distinct word (written form + reading) in the game's lexicon: the words word help, the notebook, the
//    kanji chart's word lists and the bookmarks can show. Two words with the same reading but different kanji are two
//    recordings (their accent can differ: 橋 / 箸).
//  - Characters are counted as they would be sent to a voice (the reading in kana), morae from the reading.
// Usage: node tools/voice/reference_count.mjs [--json]
import { RB } from './lines.mjs';

const SMALL = 'ゃゅょぁぃぅぇぉゎャュョァィゥェォヮ';
const morae = (kana) => [...String(kana)].filter((ch) => /[ぁ-ー]/.test(ch) && !SMALL.includes(ch)).length;
const chars = (t) => [...String(t)].length;
const row = () => ({ recordings: 0, characters: 0, morae: 0 });
const out = { kana: row(), kanji: row(), words: row() };

const kana = new Set();
for (const g of RB.lessons.groups()) for (const c of RB.lessons.groupChars(g)) kana.add(c.ch);
for (const ch of kana) { out.kana.recordings++; out.kana.characters += chars(ch); out.kana.morae += Math.max(1, morae(ch)); }

for (const k of RB.kanjiInfo.all()) {
  const rs = (k.readings || []).map((r) => (typeof r === 'string' ? r : r.r || r.reading || '')).filter(Boolean);
  if (!rs.length) continue;
  const text = rs.join('、');
  out.kanji.recordings++; out.kanji.characters += chars(text); out.kanji.morae += morae(text);
}

const seen = new Set();
for (const e of RB.lex.all()) {
  const w = e.w || e.surface, r = e.r || e.reading;
  if (!w || !r) continue;
  const key = w + '|' + r;
  if (seen.has(key)) continue;
  seen.add(key);
  out.words.recordings++; out.words.characters += chars(r); out.words.morae += morae(r);
}
const total = row();
for (const k of ['kana', 'kanji', 'words']) for (const f of Object.keys(total)) total[f] += out[k][f];
out.all = total;

if (process.argv.includes('--json')) console.log(JSON.stringify(out, null, 2));
else {
  const n = (x) => x.toLocaleString('en-GB');
  console.log('| | Recordings | Characters | Morae |\n| --- | ---: | ---: | ---: |');
  for (const [k, label] of [['kana', 'Kana'], ['kanji', 'Kanji (their readings)'], ['words', 'Words (written form + reading)'], ['all', '**All**']]) {
    const r = out[k];
    console.log('| ' + label + ' | ' + n(r.recordings) + ' | ' + n(r.characters) + ' | ' + n(r.morae) + ' |');
  }
}
