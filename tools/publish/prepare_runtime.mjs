// A runtime-only publishing folder for the game (Robin, 2026-10-16: "audit the actual unpacked Pages output and prepare a
// runtime-only publishing directory. Keep all development evidence in GitHub, but do not publish screenshots, test
// fixtures, tooling or audition galleries unless they are deliberately required public pages").
// The set is read from the built page itself: index.html, every recording its embedded Ensemble catalog names (both
// formats: the game plays the one the browser decodes), and the recordings' licence notices. Nothing else is needed at
// run time (the page's CSP fetches only same-origin files, and only ./assets/music/ensemble/; there are no links to
// other pages). The GPL-2 recordings' corresponding source goes with them, as their NOTICE.md says ("When the recordings
// are published with the hosted game (C-87), these are published with them"): src/audio/, tools/music/ensemble/,
// docs/music/ensemble/qa/ and the music manifest.json, about 5 MB. Optionally a voice build (its runtime manifest and the
// files it names) is added under ./voices/.
// Local copies only: no git, no network, no push, no deploy. Nothing here changes how or where the site is published.
// Usage: node tools/publish/prepare_runtime.mjs --out <empty dir> [--without-gpl-source] [--keep <previous RUNTIME_FILES.tsv>]
//          [--voices <a voice site folder: <dir>/ja-JP/index.json>] [--max-bytes <n>] [--list-only]
//   --without-gpl-source: leave the recordings' source out (only if Robin decides a link to the repository is enough);
//   --keep: also copy the recordings an earlier build named, when they are still in the checkout (a page opened before
//           the update can still ask for them); --list-only: print the set and its bytes, copy nothing.
//   --max-bytes: the size guard's ceiling (default 900,000,000 bytes, 10 % under the Pages limit; tools/publish/
//           site_size.mjs). The whole set, kept files included, is checked before anything is copied, and the finished
//           folder (with its file list) again after; over the ceiling the tool stops with exit 1, so a workflow does not
//           upload it.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { root } from '../../tests/lib/load.mjs';
import { measure, DEFAULT_CEILING, PAGES_LIMIT } from './site_size.mjs';

const a = process.argv.slice(2);
const opt = (k) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : null; };
const OUT = opt('--out');
if (!OUT && !a.includes('--list-only')) { console.error('usage: --out <empty dir> [--without-gpl-source] [--keep <tsv>] [--voices <dir>] [--list-only]'); process.exit(2); }
const sha = (f) => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const die = (m) => { console.error('prepare_runtime: ' + m); process.exit(1); };

const page = path.join(root, 'index.html');
if (!fs.existsSync(page)) die('no index.html (build first: node tools/build.mjs)');
const html = fs.readFileSync(page, 'utf8');
const set = new Map(); // relative path -> category
set.set('index.html', 'page');
for (const m of html.matchAll(/"url":"\.\/(assets\/music\/ensemble\/[A-Za-z0-9_./-]+\.(?:opus|mp3))"/g)) set.set(m[1], 'music');
for (const n of ['assets/music/ensemble/NOTICE.md', 'assets/music/ensemble/notes/GPL-2.txt', 'assets/music/ensemble/notes/TimGM6mb_Copyright_and_Licence.txt']) set.set(n, 'licence');
if (!a.includes('--without-gpl-source')) {
  const walk = (d) => (fs.existsSync(path.join(root, d)) ? fs.readdirSync(path.join(root, d), { withFileTypes: true }).flatMap((e) => (e.name.startsWith('.') || e.name === '__pycache__' ? [] : e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)])) : []);
  for (const f of [...walk('src/audio'), ...walk('tools/music/ensemble'), ...walk('docs/music/ensemble/qa'), 'assets/music/ensemble/manifest.json']) if (fs.existsSync(path.join(root, f))) set.set(f.split(path.sep).join('/'), 'gpl-source');
}
if (opt('--keep')) {
  for (const line of fs.readFileSync(opt('--keep'), 'utf8').split('\n')) {
    const p = line.split('\t')[0];
    if (!p || p.startsWith('#') || set.has(p) || !/^assets\/music\/ensemble\/.*\.(opus|mp3)$/.test(p)) continue;
    if (fs.existsSync(path.join(root, p))) set.set(p, 'music (kept from an earlier build)');
    else console.warn('not in the checkout, so not kept: ' + p);
  }
}
// voices: a voice site (tools/voice/voice_site.mjs) copied whole under ./voices/: its index, every index it names and
// every recording those name (anything else in the folder is left out)
const voice = [];
if (opt('--voices')) {
  const vdir = path.resolve(opt('--voices'));
  for (const lang of fs.readdirSync(vdir)) {
    const ix = path.join(vdir, lang, 'index.json');
    if (!fs.existsSync(ix)) continue;
    const m = JSON.parse(fs.readFileSync(ix, 'utf8'));
    if (m.schema !== 'rbn.voice.site/1') die('not a voice site index: ' + ix);
    const add = (rel) => voice.push({ rel: ['voices', lang, rel].join('/'), src: path.join(vdir, lang, rel) });
    add('index.json');
    const shards = Object.values(m.scenes || {}).concat(m.refs ? [m.refs] : []);
    const recs = new Set();
    for (const s of shards) {
      add(s);
      const j = JSON.parse(fs.readFileSync(path.join(vdir, lang, s), 'utf8'));
      if (j.lines) for (const vs of Object.values(j.lines)) for (const v of vs) recs.add(v.f);
      else for (const v of Object.values(j)) recs.add(v.f);
    }
    for (const f of recs) add(f);
  }
}

// check and total
const rows = [];
const total = {};
for (const [p, cat] of set) {
  const f = path.join(root, p);
  if (!fs.existsSync(f)) die('the page names a file that is not in the checkout: ' + p);
  const st = fs.statSync(f);
  rows.push({ p, src: f, cat, bytes: st.size });
  total[cat] = (total[cat] || 0) + st.size;
}
for (const v of voice) {
  if (!fs.existsSync(v.src)) die('the voice manifest names a missing file: ' + v.rel);
  const st = fs.statSync(v.src);
  rows.push({ p: v.rel, src: v.src, cat: 'voice', bytes: st.size });
  total.voice = (total.voice || 0) + st.size;
}
const all = rows.reduce((n, r) => n + r.bytes, 0);
const ceiling = +opt('--max-bytes') > 0 ? +opt('--max-bytes') : DEFAULT_CEILING;
const report = { files: rows.length, bytes: all, byCategory: total, ceiling, pagesLimit: PAGES_LIMIT, withinCeiling: all <= ceiling };
if (a.includes('--list-only')) { console.log(JSON.stringify(report, null, 1)); process.exit(all <= ceiling ? 0 : 1); }
if (all > ceiling) die('the set is ' + all + ' bytes, over the ceiling of ' + ceiling + ' (--max-bytes); nothing was copied');
if (fs.existsSync(OUT) && fs.readdirSync(OUT).length) die('the output folder exists and is not empty: ' + OUT);
fs.mkdirSync(OUT, { recursive: true });
if (path.resolve(OUT) === root) die('the output must not be the checkout');
const tsv = ['# Runtime-only publishing set (tools/publish/prepare_runtime.mjs). Columns: path, bytes, sha256, category.'];
for (const r of rows) {
  const dst = path.join(OUT, r.p);
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(r.src, dst);
  const h = sha(dst);
  if (h !== sha(r.src) || fs.statSync(dst).size !== r.bytes) die('copy differs: ' + r.p);
  tsv.push([r.p, r.bytes, h, r.cat].join('\t'));
}
// GitHub Pages: serve the files as they are (no Jekyll processing of the folder)
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');
fs.writeFileSync(path.join(OUT, 'RUNTIME_FILES.tsv'), tsv.join('\n') + '\n');
// the guard again on the finished folder, everything in it counted
const m = measure(OUT, { maxBytes: ceiling });
report.folder = { files: m.files, bytes: m.bytes, headroom: m.headroom };
console.log(JSON.stringify(Object.assign({ out: OUT }, report)));
if (!m.ok) die('the folder is ' + m.bytes + ' bytes, over the ceiling of ' + ceiling + '; not to be deployed');
