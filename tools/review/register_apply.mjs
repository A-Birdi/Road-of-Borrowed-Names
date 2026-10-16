// C-95: apply reviewed register corrections to the script, refusing anything that does not match the file as it is.
// Input: one or more proposal files ({ edits: [{ ids, file, line, old, new: [...], kansai: [{ file, line, old, new }] }] }).
//  - each `old` must be a whole line of its file, byte for byte; it is found by content (the line number is a hint for
//    a line written twice); a line no edit can find, or two edits on one line, stops everything (nothing is written);
//  - a line becomes one or more lines (a companion branch splits one shared line into variants);
//  - Kansai edits are applied the same way to src/content/dialect/*.js.
// Usage: node tools/review/register_apply.mjs [--dry] [--log <file.json>] <proposals.json> […]
import fs from 'node:fs';
import path from 'node:path';
import { root } from '../../tests/lib/load.mjs';

const a = process.argv.slice(2);
const dry = a.includes('--dry');
const logPath = a.includes('--log') ? a[a.indexOf('--log') + 1] : null;
const files = a.filter((x, i) => !x.startsWith('--') && a[i - 1] !== '--log');
if (!files.length) { console.error('usage: [--dry] [--log <file>] <proposals.json> …'); process.exit(2); }

const ops = []; // { src, file, line, old, new, ids, kind }
for (const f of files) {
  const p = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const e of p.edits || []) {
    ops.push({ src: path.basename(f), file: e.file, line: e.line, old: e.old, new: e.new, ids: e.ids, kind: 'line' });
    for (const k of e.kansai || []) ops.push({ src: path.basename(f), file: k.file, line: k.line, old: k.old, new: k.new, ids: e.ids, kind: 'kansai' });
  }
}
const problems = [];
const byFile = {};
for (const o of ops) (byFile[o.file] = byFile[o.file] || []).push(o);
const out = {};
const log = [];
for (const [file, list] of Object.entries(byFile)) {
  const abs = path.join(root, file);
  if (!abs.startsWith(path.join(root, 'src') + path.sep) || !abs.endsWith('.js')) { problems.push(file + ': not a script file under src/'); continue; }
  if (!fs.existsSync(abs)) { problems.push(file + ': no such file'); continue; }
  const text = fs.readFileSync(abs, 'utf8');
  const lines = text.split('\n');
  const at = new Map(); // index -> op
  for (const o of list) {
    if (!Array.isArray(o.new) || !o.new.length || o.new.some((n) => typeof n !== 'string' || n.includes('\n'))) { problems.push(file + ':' + o.line + ' ' + o.ids + ': `new` must be one or more single lines'); continue; }
    const hits = [];
    lines.forEach((l, i) => { if (l === o.old) hits.push(i); });
    let idx = -1;
    if (hits.length === 1) idx = hits[0];
    else if (hits.length > 1 && hits.includes(o.line - 1)) idx = o.line - 1;
    if (idx < 0) { problems.push(file + ':' + o.line + ' ' + o.ids + ' (' + o.src + '): `old` ' + (hits.length ? 'occurs ' + hits.length + ' times and not at the given line' : 'not found')); continue; }
    if (at.has(idx)) {
      const p = at.get(idx);
      if (JSON.stringify(p.new) === JSON.stringify(o.new)) { p.ids = [...new Set(p.ids.concat(o.ids))]; continue; } // the same change from two proposals
      problems.push(file + ':' + (idx + 1) + ': two different edits (' + p.ids + ' from ' + p.src + '; ' + o.ids + ' from ' + o.src + ')');
      continue;
    }
    at.set(idx, o);
  }
  const res = [];
  lines.forEach((l, i) => {
    const o = at.get(i);
    if (!o) { res.push(l); return; }
    res.push(...o.new);
    log.push({ file, line: i + 1, ids: o.ids, kind: o.kind, from: o.src, old: l, new: o.new });
  });
  out[abs] = res.join('\n');
}
if (problems.length) { console.error(problems.join('\n')); console.error(problems.length + ' problem(s); nothing written'); process.exit(1); }
if (!dry) for (const [abs, t] of Object.entries(out)) fs.writeFileSync(abs, t);
if (logPath) fs.writeFileSync(logPath, JSON.stringify(log, null, 1) + '\n');
console.log((dry ? 'would change ' : 'changed ') + log.length + ' lines in ' + Object.keys(out).length + ' files (' + log.filter((x) => x.kind === 'kansai').length + ' Kansai)');
