// The runtime-only publishing folder (tools/publish/prepare_runtime.mjs; docs/hosting/RUNTIME_PUBLISHING.md), served
// on its own: the game must run from it with nothing else beside it.
//  - the page loads and is ready, with no page errors and no request to another origin;
//  - every recording the page's embedded catalog names is fetched by the page itself (its CSP, same origin) with the
//    catalog's size and SHA-256;
//  - Ensemble music sounds from the folder;
//  - development evidence is not there (screenshots, tests, tooling outside the GPL source, records, galleries).
// Usage: node tools/build.mjs && node tests/e2e/runtime_publish.mjs
import fs from 'node:fs';
import os from 'node:os';
import http from 'node:http';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { launch, page, root } from './lib.mjs';

let pass = 0, fail = 0;
async function test(name, fn) {
  const t0 = Date.now();
  try { await fn(); pass++; console.log('PASS', name, `(${((Date.now() - t0) / 1000).toFixed(0)} s)`); }
  catch (e) { fail++; console.log('FAIL', name + ':', e.message.split('\n')[0]); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rbn-runtime-'));
const out = path.join(dir, 'site');
const made = JSON.parse(execFileSync(process.execPath, [path.join(root, 'tools/publish/prepare_runtime.mjs'), '--out', out], { cwd: root, encoding: 'utf8' }));
const TYPES = { '.html': 'text/html; charset=utf-8', '.opus': 'audio/ogg', '.mp3': 'audio/mpeg', '.md': 'text/markdown; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.json': 'application/json' };
const srv = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  const f = path.join(out, p);
  if (!f.startsWith(out) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream', 'cache-control': 'no-store' });
  fs.createReadStream(f).pipe(res);
});
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const url = `http://127.0.0.1:${srv.address().port}/`;
const b = await launch();

await test('the folder holds the page, the recordings, their notices and source, and nothing else', async () => {
  const tsv = fs.readFileSync(path.join(out, 'RUNTIME_FILES.tsv'), 'utf8').split('\n').filter((l) => l && !l.startsWith('#')).map((l) => l.split('\t'));
  const cats = new Set(tsv.map((r) => r[3]));
  assert(tsv.length === made.files && [...cats].every((c) => ['page', 'music', 'licence', 'gpl-source'].includes(c)), 'categories: ' + [...cats].join(','));
  const bad = tsv.filter((r) => r[3] === 'gpl-source' && !/^(src\/audio\/|tools\/music\/ensemble\/|docs\/music\/ensemble\/qa\/|assets\/music\/ensemble\/manifest\.json$)/.test(r[0]));
  assert(!bad.length, 'only the recordings\' source: ' + bad.slice(0, 3).map((r) => r[0]).join(', '));
  for (const p of ['docs/screenshots', 'tests', 'HANDOFF.md', 'VALIDATION.md', 'REQUIREMENTS.md', 'SPECIFICATION.txt', 'docs/future', 'docs/review', 'voice-audition', 'tools/voice', 'tools/build.mjs']) assert(!fs.existsSync(path.join(out, p)), 'not published: ' + p);
});

await test('the game runs from the folder alone; every recording it names arrives with its size and hash', async () => {
  const pg = await page(b, url);
  const res = await pg.p.evaluate(async () => {
    const files = [];
    JSON.stringify(RB.audio.ensembleCatalog, (k, v) => { if (v && typeof v === 'object' && typeof v.url === 'string' && v.sha256) files.push(v); return v; });
    const bad = [];
    for (const f of files) {
      const r = await fetch(f.url, { cache: 'no-store' });
      const buf = r.ok ? await r.arrayBuffer() : new ArrayBuffer(0);
      const h = [...new Uint8Array(await crypto.subtle.digest('SHA-256', buf))].map((x) => x.toString(16).padStart(2, '0')).join('');
      if (!r.ok || buf.byteLength !== f.bytes || h !== f.sha256) bad.push(f.url + ' ' + r.status + ' ' + buf.byteLength);
    }
    return { n: files.length, bytes: files.reduce((s, f) => s + f.bytes, 0), bad };
  });
  assert(res.n >= 400 && !res.bad.length, res.n + ' recordings, failures: ' + res.bad.slice(0, 3).join(' | '));
  assert(!pg.errors.length && !pg.requests.length, 'errors ' + pg.errors.join(' | ') + '; other origins ' + pg.requests.join(' '));
  // (these answer 404 on purpose, so they come after the error check)
  const dev = await pg.p.evaluate(async () => {
    const out = [];
    for (const u of ['./docs/screenshots/', './tests/run-unit.mjs', './HANDOFF.md', './docs/future/voice/README.md', './tools/build.mjs']) { const r = await fetch(u, { cache: 'no-store' }); if (r.status !== 404) out.push(u + ' ' + r.status); }
    return out;
  });
  assert(!dev.length, 'development files answer: ' + dev.join(', '));
  console.log('  ' + res.n + ' recordings, ' + res.bytes + ' bytes, each checked');
  await pg.ctx.close();
});

await test('Ensemble music sounds from the folder', async () => {
  const pg = await page(b, url);
  const music = [];
  pg.p.on('response', (r) => { if (/\/assets\/music\/ensemble\//.test(r.url())) music.push(r.status()); });
  await pg.p.evaluate(async () => { RB.game.settings.musicPerformance = 'ensemble'; RB.game.applySettings(); await RB.audio.init(); RB.audio.playSong('snowbell', { fade: 0 }); });
  await pg.p.waitForFunction(() => { const c = RB.audio._.perf.cue; return c && c.id === 'snowbell' && c.active && c.state === 'sounding'; }, null, { timeout: 20000, polling: 100 });
  assert(music.length >= 1 && music.every((s) => s === 200), 'recordings fetched: ' + music.join(','));
  assert(!pg.errors.length, 'page errors: ' + pg.errors.join(' | '));
  await pg.ctx.close();
});

await b.close();
srv.close();
fs.rmSync(dir, { recursive: true, force: true });
console.log(`runtime_publish: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
