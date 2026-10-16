// LI-12 (Robin, 2026-10-16: "dialogue highlighting seems to, mostly, focus exclusively on nouns"): how much of every
// spoken line pairs with its English, by kind of word, as RB.jp.speech.align pairs them. Word pairs (content words) and
// grammar pairs (particles, the copula, endings and what an inflection adds), counted over every line with English.
// Usage: node tools/review/align_coverage.mjs [--samples N] [--grep <regex on jp or en>]
import { load } from '../../tests/lib/load.mjs';

globalThis.__RB_TEST__ = true;
const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
const S = RB.jp.speech;
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const samples = +(arg('--samples') || 0), grep = arg('--grep') ? new RegExp(arg('--grep')) : null;
const vars = { name: 'ロビン' };
const render = (jp) => RB.jp.render(jp, { vars, spacing: true, furigana: true }).tokens;
const kindOf = (pos) => !pos ? 'unknown' : /^v/.test(pos) ? 'verb' : /^adj/.test(pos) ? 'adjective' : pos === 'n' || pos === 'name' || pos === 'ctr' ? 'noun' :
  pos === 'pn' ? 'pronoun' : pos === 'adv' ? 'adverb' : pos === 'prt' ? 'particle' : pos === 'aux' ? 'auxiliary' : pos === 'exp' ? 'expression' : pos === 'conj' ? 'conjunction' : pos === 'int' ? 'interjection' : 'other';
const tally = {};
let lines = 0, anyPair = 0;
const shown = [];
for (const id in RB.content.scenes) {
  for (const c of RB.content.scenes[id].cmds || []) {
    if (c.op !== 'say' || !c.jp || !c.en) continue;
    const en = c.en.replace(/\$name/g, 'Robin');
    lines++;
    const toks = render(c.jp);
    const a = S.align(toks, en, { name: 'Robin' });
    let pairedLine = false;
    toks.forEach((t, i) => {
      if (!t || t.punct) return;
      let r = null;
      try { r = RB.jp.lookup(t); } catch (e) { r = null; }
      const k = t.ph ? 'name' : kindOf(r && r.entry && r.entry.pos);
      const T = tally[k] || (tally[k] = { n: 0, word: 0, grammar: 0, either: 0 });
      T.n++;
      const w = (a.map[i] || []).length > 0, g = ((a.gmap || [])[i] || []).length > 0;
      if (w) T.word++;
      if (g) T.grammar++;
      if (w || g) { T.either++; pairedLine = true; }
    });
    if (pairedLine) anyPair++;
    if (samples && shown.length < samples && (!grep || grep.test(c.jp) || grep.test(en)) && Math.random() < (grep ? 1 : 0.004)) {
      const out = toks.map((t, i) => { if (!t || t.punct) return null; const w = (a.map[i] || []).map((k) => a.words[k].text), g = ((a.gmap || [])[i] || []).map((k) => a.words[k].text); return t.surface + (w.length ? '=' + w.join('+') : '') + (g.length ? '~' + g.join('+') : ''); }).filter(Boolean).join(' ');
      shown.push(out + '\n      ' + en);
    }
  }
}
const pct = (a, b) => (b ? (100 * a / b).toFixed(1) + '%' : '-');
console.log('lines with English: ' + lines + '; with at least one pair: ' + anyPair + ' (' + pct(anyPair, lines) + ')');
console.log('| kind | tokens | word pair | grammar pair | either |\n| --- | ---: | ---: | ---: | ---: |');
for (const k of Object.keys(tally).sort((x, y) => tally[y].n - tally[x].n)) {
  const T = tally[k];
  console.log('| ' + k + ' | ' + T.n + ' | ' + pct(T.word, T.n) + ' | ' + pct(T.grammar, T.n) + ' | ' + pct(T.either, T.n) + ' |');
}
if (shown.length) console.log('\n' + shown.join('\n'));
