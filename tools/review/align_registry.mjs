// AG-1: reviewed alignments for authored dialogue (src/content/align/), used by RB.jp.speech.align before its rules.
//   --propose <sceneId> <n>   the rules' relations for the n-th spoken line of a scene (0-based), as an entry to review,
//                             correct and paste into src/content/align/ (with its key, its words and its English)
//   --check                   every entry still matches its line: the key (displayed Japanese with $name, dialect,
//                             English with $name), and every word and English anchor; reports any that went stale
// An entry is data, not code: { key, scene, line, jp, en, dia, rels: [{ tier, fn, label, jp: [[i, surface]],
// en: [{ t, n, p } | { ph: 'name' }] }], notes: [[i, surface, text]], reviewed }. Nothing here runs in the game.
import { load } from '../../tests/lib/load.mjs';

globalThis.__RB_TEST__ = true;
const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
const S = RB.jp.speech;
const NAME = 'Robin', NAME_JP = 'ロビン';
const lineOf = (scene, n) => ((RB.content.scenes[scene] || {}).cmds || []).filter((c) => c.op === 'say' && c.jp && c.en)[n] || null;
const isKansai = (c) => !!(RB.dialect && RB.dialect.isKansai && RB.dialect.isKansai(c.jp));
function shown(c) {
  const tokens = RB.jp.render(c.jp, { vars: { name: NAME_JP }, spacing: true, furigana: true }).tokens;
  const en = String(c.en).replace(/\$name/g, NAME);
  const dia = isKansai(c) ? 'kansai' : null;
  const look = dia ? (t, i) => RB.dialect.lookupIn(tokens, i) || RB.jp.lookup(t) : null;
  return { tokens, en, dia, look };
}
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv.slice(i + 1, i + 3) : null; };

if (arg('--propose')) {
  const [scene, n] = arg('--propose');
  const c = lineOf(scene, +n);
  if (!c) { console.error('no spoken line ' + n + ' in ' + scene); process.exit(2); }
  const { tokens, en, dia, look } = shown(c);
  const a = S.align(tokens, en, { name: NAME, dia, lookup: look, authored: false });
  const occ = (k) => a.words.slice(0, k).filter((w) => w.text === a.words[k].text).length;
  const anchor = (k, p) => (a.words[k].text === NAME ? { ph: 'name' } : Object.assign({ t: a.words[k].text }, occ(k) ? { n: occ(k) } : {}, p ? { p } : {}));
  const sym = (i) => (tokens[i].ph ? '$' + tokens[i].ph : tokens[i].surface);
  const entry = {
    key: S.key(tokens, en, { name: NAME, dia }), scene, line: +n, jp: c.jp, en: c.en, dia,
    rels: a.rels.map((r) => ({ tier: r.tier, fn: r.fn, label: r.label || undefined, jp: r.jp.map((i) => [i, sym(i)]), en: r.claims.map(([k, p]) => anchor(k, p)) })),
    notes: [],
    reviewed: 'PROPOSED BY THE RULES: review every relation before use',
  };
  console.log('// words: ' + tokens.map((t, i) => (t.punct ? '' : i + ':' + sym(i))).filter(Boolean).join(' '));
  console.log('// English: ' + a.words.map((w, k) => k + ':' + w.text).join(' '));
  console.log(JSON.stringify(entry, null, 2));
} else if (process.argv.includes('--check')) {
  const entries = S.authoredEntries ? S.authoredEntries() : [];
  let bad = 0;
  for (const e of entries) {
    const c = lineOf(e.scene, e.line);
    const why = [];
    if (!c) why.push('no such line');
    else {
      if (c.jp !== e.jp) why.push('Japanese changed');
      if (c.en !== e.en) why.push('English changed');
      const { tokens, en, dia, look } = shown(c);
      if (S.key(tokens, en, { name: NAME, dia }) !== e.key) why.push('key differs');
      const a = S.align(tokens, en, { name: NAME, dia, lookup: look });
      if (a.src !== 'authored') why.push('not used (an anchor no longer matches)');
    }
    if (why.length) { bad++; console.log('STALE ' + e.scene + '#' + e.line + ': ' + why.join('; ')); }
  }
  console.log(entries.length + ' reviewed alignments; ' + bad + ' stale');
  process.exit(bad ? 1 : 0);
} else {
  console.log('usage: node tools/review/align_registry.mjs --propose <sceneId> <n> | --check');
}
