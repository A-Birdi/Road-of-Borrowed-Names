// Lexical verification of the shiritori word banks against local reference copies.
//
//   node tools/shiritori_verify.mjs --jmdict <jamdict.db> [--kuromoji <dir containing node_modules/kuromoji>]
//
// Nothing here runs in the game, and the references are never committed or shipped.
// --jmdict: the SQLite JMdict database from the `jamdict-data` package (JMdict by the
// Electronic Dictionary Research and Development Group, CC BY-SA 4.0; this project
// used the 2021-04-17 build in jamdict-data 1.5). --kuromoji: a directory where
// `npm install kuromoji@0.1.2` was run (IPADIC 2.7.0). For every registered entry it
// checks, without copying any definitions:
//   - the entry's lookupRef (jmdict:<entry>) holds the verified reading and every
//     approved form (kanji spellings as written forms, katakana as readings), the
//     reading is not restricted away from a kanji form, and a sense is a common noun;
//   - JMdict priority tags and "usually written in kana" (reported, not required);
//   - kanji-form flags such as ateji or rarely used (reported);
//   - IPADIC's reading of the displayed form (agreement reported; single kanji often
//     get an on-reading there, so a difference is a note, not a failure).
// Writes docs/practice/shiritori_banks/verification.md; exits 1 if a JMdict check fails.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { load, root } from '../tests/lib/load.mjs';

const args = process.argv.slice(2);
const arg = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const dbPath = arg('--jmdict'), kuroDir = arg('--kuromoji');
if (!dbPath || !fs.existsSync(dbPath)) {
  console.log('Needs a local JMdict database: node tools/shiritori_verify.mjs --jmdict <jamdict.db> [--kuromoji <dir>] (see the header of this file).');
  process.exit(0);
}
const { DatabaseSync } = await import('node:sqlite');
const db = new DatabaseSync(dbPath, { readOnly: true });
globalThis.__RB_TEST__ = true;
const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
const SH = RB.shiritori;
const toHira = SH.toHira;
const isKata = (s) => /^[ァ-ヶー・]+$/.test(s);
const COMMON = new Set(['ichi1', 'news1', 'spec1', 'spec2', 'gai1']);
const col = (sql, id) => db.prepare(sql).all(id).map((r) => r.text);

let tok = null;
if (kuroDir) {
  const req = createRequire(path.join(path.resolve(kuroDir), 'x.js'));
  const kuromoji = req('kuromoji');
  const dic = path.join(path.dirname(req.resolve('kuromoji')), '..', 'dict');
  tok = await new Promise((res, rej) => kuromoji.builder({ dicPath: dic }).build((e, t) => (e ? rej(e) : res(t))));
}

const rows = [], fails = [];
for (const e of SH.words()) {
  const idseq = +String(e.lookupRef || '').replace('jmdict:', '');
  const kanji = db.prepare('select ID id, text from Kanji where idseq=?').all(idseq);
  const kana = db.prepare('select ID id, text from Kana where idseq=?').all(idseq);
  const senses = db.prepare('select ID id from Sense where idseq=?').all(idseq);
  const r = { id: e.id, reading: e.reading, forms: e.forms.join('・'), idseq, ok: true, notes: [] };
  const kEl = kana.find((k) => toHira(k.text) === e.reading);
  if (!kEl) { r.ok = false; r.notes.push('reading not in the entry'); }
  for (const f of e.forms) {
    if (f === e.reading) continue;
    if (isKata(f)) { if (!kana.some((k) => k.text === f)) { r.ok = false; r.notes.push('katakana form ' + f + ' not in the entry'); } continue; }
    const kf = kanji.find((k) => k.text === f);
    if (!kf) { r.ok = false; r.notes.push('form ' + f + ' not in the entry'); continue; }
    const restr = kEl ? col('select text from KNR where kid=?', kEl.id) : [];
    if (restr.length && restr.indexOf(f) < 0) { r.ok = false; r.notes.push('reading restricted away from ' + f); }
    const info = col('select text from KJI where kid=?', kf.id).filter((x) => /rarely|irregular|out-dated|search-only|ateji/i.test(x));
    if (info.length) r.notes.push(f + ': ' + info.join('; '));
  }
  const nounSense = senses.find((s) => col('select text from pos where sid=?', s.id).some((p) => p.startsWith('noun (common)')));
  if (!nounSense) { r.ok = false; r.notes.push('no common-noun sense'); }
  const pri = new Set();
  for (const k of kana) col('select text from KNP where kid=?', k.id).forEach((p) => pri.add(p));
  for (const k of kanji) col('select text from KJP where kid=?', k.id).forEach((p) => pri.add(p));
  r.priority = [...pri].filter((p) => COMMON.has(p)).join(' ') || '—';
  r.uk = nounSense ? col('select text from misc where sid=?', nounSense.id).some((m) => /usually written using kana/.test(m)) : false;
  if (tok) {
    const surf = e.forms.find((f) => !isKata(f) && f !== e.reading) || e.forms[0];
    const ts = tok.tokenize(surf);
    const rd = ts.map((x) => (x.reading ? toHira(x.reading) : '?')).join('');
    r.ipadic = rd === e.reading ? 'agrees' : 'reads ' + surf + ' as ' + rd;
  }
  if (!r.ok) fails.push(r);
  rows.push(r);
}
const n = rows.length;
const L = [];
L.push('# Shiritori word verification', '');
L.push('Generated by `node tools/shiritori_verify.mjs` against a local JMdict database' + (tok ? ' and IPADIC 2.7.0 (kuromoji 0.1.2)' : '') + '. The references are not part of the game or the repository; no definitions are copied (the English meanings are written for this game).', '');
L.push('| Check | Result |', '|---|---:|');
L.push('| Entries checked | ' + n + ' |');
L.push('| JMdict entry holds the reading and every approved form, with a common-noun sense | ' + (n - fails.length) + ' / ' + n + ' |');
L.push('| JMdict common-priority tag (ichi1, news1, spec1, spec2 or gai1) | ' + rows.filter((r) => r.priority !== '—').length + ' / ' + n + ' |');
L.push('| JMdict: usually written in kana | ' + rows.filter((r) => r.uk).length + ' |');
if (tok) L.push('| IPADIC reads the displayed form the same way | ' + rows.filter((r) => r.ipadic === 'agrees').length + ' / ' + n + ' |');
L.push('');
L.push('**Not verified here:** whether each word is natural for a learner of the given band, the English meanings, and the companion themes are authoring judgements; no native-speaker review has taken place. JMdict priority tags measure newspaper/frequency-list presence, so everyday animal or toy words can lack them.', '');
if (fails.length) { L.push('## Failures', ''); for (const r of fails) L.push('- `' + r.id + '` ' + r.reading + ': ' + r.notes.join('; ')); L.push(''); }
const diff = rows.filter((r) => r.ipadic && r.ipadic !== 'agrees');
if (diff.length) { L.push('## IPADIC differences (JMdict reading kept)', ''); for (const r of diff) L.push('- `' + r.id + '` ' + r.reading + ': IPADIC ' + r.ipadic); L.push(''); }
const noted = rows.filter((r) => r.ok && r.notes.length);
if (noted.length) { L.push('## Kanji-form notes', ''); for (const r of noted) L.push('- `' + r.id + '` ' + r.notes.join('; ')); L.push(''); }
L.push('## Without a common-priority tag', '');
L.push(rows.filter((r) => r.priority === '—').map((r) => r.reading).join('、') || 'none', '');
fs.writeFileSync(path.join(root, 'docs', 'practice', 'shiritori_banks', 'verification.md'), L.join('\n') + '\n');
console.log('checked', n, 'failures', fails.length, tok ? 'ipadic differences ' + diff.length : '');
process.exit(fails.length ? 1 : 0);
