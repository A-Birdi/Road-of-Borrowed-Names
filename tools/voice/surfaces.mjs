// Where the game's data holds Japanese sentences, and whether the recording list (tools/voice/lines.mjs) already carries
// the same words (in any scene, by any speaker): the counts behind docs/future/voice/SPOKEN_SURFACES.md.
//   node tools/voice/surfaces.mjs [--depth 2] [--prefix content.activities] [--code]
// Data: RB.content and the namespaces that keep content of their own (the Atlas, fishing, pets, word play), walked for
// objects with a Japanese `jp`; a sentence ends in 。！？ or a closing quote, or is 14 characters or more (shorter
// Japanese is a word or a phrase: names, labels, choices). --code: Japanese sentences written as string literals in the
// code itself (src/ui, src/engine, src/learn, src/atlas, src/lang), per file. Columns: sentences, of them voiced
// somewhere, phrases, lines with a run-time name ($name), an example of an unvoiced one.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { RB, allLines, spoken } from './lines.mjs';

const a = process.argv.slice(2), opt = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const voiced = new Set(allLines().map((l) => l.plain));
const SENT = /[。！？]\s*$|[。！？]|」\s*$/;
const isJa = (t) => /[ぁ-ゖァ-ヺ一-鿿々]/.test(t);
const plainOf = (jp) => { try { return spoken(jp); } catch (e) { return jp; } };

export function dataSurfaces(depth = 2) {
  const groups = {}, seen = new Set();
  function walk(o, at, d) {
    if (!o || typeof o !== 'object' || seen.has(o) || d > 12) return;
    seen.add(o);
    if (typeof o.jp === 'string' && isJa(o.jp)) {
      const p = plainOf(o.jp), g = at.filter((x) => x !== '[]').slice(0, depth).join('.');
      const G = (groups[g] = groups[g] || { sentences: new Set(), voiced: new Set(), phrases: new Set(), dollar: 0, example: null });
      if (/\$\w/.test(o.jp)) G.dollar++;
      if (SENT.test(RB.jp.plain(o.jp)) || p.length >= 14) {
        G.sentences.add(p);
        if (voiced.has(p)) G.voiced.add(p); else if (!G.example) G.example = o.jp.slice(0, 50) + ' | ' + String(o.en || '').slice(0, 50);
      } else G.phrases.add(p);
    }
    for (const k of Object.keys(o)) {
      if (k === 'scenes' && d === 0) continue; // (the scenes' lines: the recording list itself)
      let v;
      try { v = o[k]; } catch (e) { continue; }
      if (v && typeof v === 'object') walk(v, at.concat([Array.isArray(o) ? '[]' : k]), d + 1);
    }
  }
  walk(RB.content, ['content'], 0);
  for (const k of ['atlas', 'fishing', 'pets', 'wordplay', 'verbs', 'press', 'cases', 'letters']) if (RB[k]) walk(RB[k], [k], 0);
  return Object.entries(groups).map(([g, G]) => ({ where: g, sentences: G.sentences.size, voiced: G.voiced.size, phrases: G.phrases.size, dollar: G.dollar, example: G.example }));
}
export function codeSurfaces() {
  const src = path.join(path.dirname(new URL(import.meta.url).pathname), '..', '..', 'src');
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : e.name.endsWith('.js') ? [path.join(d, e.name)] : []));
  const out = [];
  for (const dir of ['ui', 'engine', 'learn', 'atlas', 'lang']) for (const f of walk(path.join(src, dir))) {
    const s = fs.readFileSync(f, 'utf8'), seen = new Set();
    let n = 0, v = 0, example = null;
    for (const m of s.matchAll(/'((?:[^'\\\n]|\\.)*[ぁ-ゖァ-ヺ一-鿿々](?:[^'\\\n]|\\.)*)'/g)) {
      const l = m[1];
      if (!/[。！？]\s*$/.test(l) || seen.has(l)) continue;
      seen.add(l); n++;
      if (voiced.has(plainOf(l))) v++; else if (!example) example = l.slice(0, 50);
    }
    if (n) out.push({ where: path.relative(src, f).split(path.sep).join('/'), sentences: n, voiced: v, example });
  }
  return out;
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const rows = (a.includes('--code') ? codeSurfaces() : dataSurfaces(+opt('--depth', 2))).filter((r) => !opt('--prefix') || r.where.startsWith(opt('--prefix')))
    .filter((r) => r.sentences || r.phrases).sort((x, y) => (y.sentences - y.voiced) - (x.sentences - x.voiced));
  for (const r of rows) console.log([r.where.padEnd(40), String(r.sentences).padStart(5), String(r.voiced).padStart(5), String(r.phrases == null ? '' : r.phrases).padStart(5), String(r.dollar || '').padStart(3), r.example || ''].join(' '));
}
