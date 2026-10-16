// The fully voiced offline package (Robin, 2026-10-16: "Keep the fully voiced offline package as a separate, tested
// delivery option using the same accepted recordings"). A folder that plays the game, its Ensemble music and its
// recorded voices from the player's own disk, opened as a file, with nothing fetched and nothing to install or import:
//   index.html             the game, with the voice site's indexes embedded (a page opened as a file cannot fetch
//                          them) and one more source in its Content-Security-Policy, media-src 'self', so it may play
//                          the recordings beside it (measured: Chromium refuses fetch() from file:, and plays same-folder
//                          media once 'self' is allowed)
//   assets/music/ensemble/ the runtime set, as tools/publish/prepare_runtime.mjs copies it (with the GPL-2 source)
//   voices/ja-JP/          the same voice site the hosted game reads (tools/voice/voice_site.mjs), the same files
// The hosted game's own index.html is not changed by this: the package's page is a copy.
// Usage: node tools/publish/offline_package.mjs --site <voice site folder containing ja-JP/> --out <empty dir>
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { root } from '../../tests/lib/load.mjs';

const a = process.argv.slice(2), opt = (k) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : null; };
const SITE = opt('--site'), OUT = opt('--out');
if (!SITE || !OUT) { console.error('usage: --site <folder with ja-JP/index.json> --out <empty dir>'); process.exit(2); }
const die = (m) => { console.error('offline_package: ' + m); process.exit(1); };
const ixPath = path.join(SITE, 'ja-JP', 'index.json');
if (!fs.existsSync(ixPath)) die('no voice site at ' + ixPath);

// the runtime set and the voice site, copied and checked by prepare_runtime
execFileSync(process.execPath, [path.join(root, 'tools/publish/prepare_runtime.mjs'), '--out', OUT, '--voices', SITE], { cwd: root, stdio: ['ignore', 'ignore', 'inherit'] });

// the indexes, embedded: { schema, base, index, scenes: { sceneId: shard }, refs }
const lang = path.join(SITE, 'ja-JP');
const index = JSON.parse(fs.readFileSync(ixPath, 'utf8'));
const read = (rel) => JSON.parse(fs.readFileSync(path.join(lang, rel), 'utf8'));
const scenes = {};
for (const [id, rel] of Object.entries(index.scenes || {})) scenes[id] = read(rel);
const embed = { schema: 'rbn.voice.site/1', base: './voices/ja-JP/', index, scenes, refs: index.refs ? read(index.refs) : {} };

const page = path.join(OUT, 'index.html');
let html = fs.readFileSync(page, 'utf8');
const csp = /(<meta http-equiv="Content-Security-Policy" content="[^"]*media-src data: blob:)(;[^"]*">)/;
if (!csp.test(html)) die('the page has no media-src data: blob: to extend');
html = html.replace(csp, "$1 'self'$2");
const tag = '<script>window.__RBN_VOICE_EMBED__ = ' + JSON.stringify(embed).replace(/</g, '\\u003c') + ';</script>\n';
const at = html.indexOf('<script');
if (at < 0) die('no script in the page');
html = html.slice(0, at) + tag + html.slice(at);
fs.writeFileSync(page, html);

// the file list follows the page's new size and hash
const tsvPath = path.join(OUT, 'RUNTIME_FILES.tsv');
const b = fs.readFileSync(page);
const tsv = fs.readFileSync(tsvPath, 'utf8').split('\n').map((l) => (l.startsWith('index.html\t') ? ['index.html', b.length, crypto.createHash('sha256').update(b).digest('hex'), 'page (voiced offline package)'].join('\t') : l));
tsv[0] = '# The voiced offline package (tools/publish/offline_package.mjs). Columns: path, bytes, sha256, category. Open index.html.';
fs.writeFileSync(tsvPath, tsv.join('\n'));
fs.rmSync(path.join(OUT, '.nojekyll'), { force: true });
const rows = tsv.filter((l) => l && !l.startsWith('#')).map((l) => l.split('\t'));
console.log(JSON.stringify({ out: OUT, files: rows.length, bytes: rows.reduce((n, r) => n + Number(r[1]), 0), voice: rows.filter((r) => r[3] === 'voice').length, embeddedIndexBytes: tag.length }));
