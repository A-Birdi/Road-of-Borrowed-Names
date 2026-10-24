// VA-1: the listening gallery (tools/voice/gallery.mjs) in a browser, against takes from a mock VOICEVOX engine on
// localhost (sine tones, not voices; no provider, no network). Checks what §13 asks of review.html: it plays one
// recording at a time and nothing until asked; a role reel stops at the first case without audio and says why; later
// and sealed lines stay hidden until revealed; filters; blind labels hide which configuration is which; the score sheet
// totals only fully assessed takes, survives a reload and exports CSV; no page errors, no network requests, no
// sideways scrolling at 1100 or 400 px; a first take and its repair are scored and marked listened separately (keyed
// by attempt and audio hash), and the reel says which it plays. Usage: node tests/e2e/voice_gallery.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { root, launch } from './lib.mjs';

const corpus = JSON.parse(fs.readFileSync(path.join(root, 'docs/future/voice/corpus/audition_corpus.json'), 'utf8'));
const { moraeOf } = await import(pathToFileURL(path.join(root, 'tools/voice/audio_check.mjs')).href);
const { writeGallery } = await import(pathToFileURL(path.join(root, 'tools/voice/gallery.mjs')).href);
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else fail++; console.log((c ? 'ok   ' : 'FAIL ') + m); };

const wav = (sec, rate = 24000) => {
  const n = Math.round(sec * rate), b = Buffer.alloc(44 + n * 2);
  b.write('RIFF', 0); b.writeUInt32LE(36 + n * 2, 4); b.write('WAVE', 8); b.write('fmt ', 12); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22);
  b.writeUInt32LE(rate, 24); b.writeUInt32LE(rate * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(n * 2, 40);
  for (let i = 2400; i < n - 2400; i++) b.writeInt16LE(Math.round(6000 * Math.sin(2 * Math.PI * 330 * i / rate)), 44 + i * 2);
  return b;
};
const byText = new Map(corpus.cases.map((c) => [c.spokenText, c]));
let lastCase = null;
const srv = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x');
  req.on('data', () => {});
  req.on('end', () => {
    if (u.pathname === '/version') return res.end('"mock"');
    if (u.pathname === '/audio_query') { lastCase = byText.get(u.searchParams.get('text')); return res.end(JSON.stringify({ accent_phrases: [], speedScale: 1, intonationScale: 1, kana: '' })); }
    if (u.pathname === '/synthesis') return res.end(wav(lastCase ? moraeOf(lastCase).morae / 8 + 0.2 : 1));
    res.statusCode = 404; res.end();
  });
});
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rbn-va1-gallery-'));
const out = path.join(tmp, 'out');
const roles = [...new Set(corpus.cases.map((c) => c.castingProfile))];
const castF = path.join(tmp, 'voicevox.json');
fs.writeFileSync(castF, JSON.stringify({ configurationId: 'voicevox', pinned: { modelId: 'mock engine (sine tones)' }, roles: Object.fromEntries(roles.map((r) => [r, { candidates: [{ label: 'C01', voice: { styleId: 1 }, rights: { status: 'ok_mock' } }], selected: 'C01' }])) }));
const run = (args) => new Promise((r) => { const p = spawn(process.execPath, ['tools/voice/audition.mjs', ...args, '--config', 'voicevox', '--cast', castF, '--out', out, '--authorised', 'e2e mock engine', '--engine-url', 'http://127.0.0.1:' + srv.address().port], { cwd: root, stdio: 'ignore' }); p.on('close', r); });
await run(['run', '--kind', 'smoke']);
await run(['run', '--kind', 'matrix', '--cases', 'N01,N02,N03,N11,SUZU01,SUZU_K01,NAO03']);
await run(['repair', '--take', 'N01.d.C01', '--reason', 'e2e: a documented cause', '--cases', 'N01']);
srv.close();
const g = writeGallery({ out });
ok(g.withAudio === 13, 'gallery written with 13 mock takes, a repair among them (' + g.withAudio + ')');

const browser = await launch();
try {
  for (const [w, h, name] of [[1100, 900, 'wide'], [400, 800, 'phone']]) {
    const errors = [], requests = [];
    const p = await browser.newPage({ viewport: { width: w, height: h } });
    p.on('pageerror', (e) => errors.push(e.message));
    p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    p.on('request', (r) => { if (!r.url().startsWith('file:')) requests.push(r.url()); });
    await p.goto('file://' + g.file);
    ok(await p.locator('.card[data-case]').count() === corpus.cases.length + 1, name + ': every case has a card (and the smoke case its own)');
    ok(await p.locator('.spoil').count() === corpus.cases.filter((c) => c.spoiler === 'later' || c.spoilerLevel === 'later' || c.spoilerLevel === 'sealed').length, name + ': later and sealed lines hidden');
    ok(await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), name + ': no sideways scrolling');
    ok(await p.locator('#now').textContent() === 'Nothing playing.', name + ': nothing plays until asked');
    if (name === 'wide') {
      await p.locator('button.play').first().click();
      await p.waitForTimeout(300);
      const first = await p.locator('#now').textContent();
      await p.locator('button.play').nth(1).click();
      await p.waitForTimeout(300);
      const second = await p.locator('#now').textContent();
      ok(/^Playing N02 .* directed/.test(first) && /^Playing N02 .* neutral control/.test(second), 'a second Play replaces the first (one recording at a time)');
      await p.keyboard.press('Escape');
      ok(await p.locator('#now').textContent() === 'Nothing playing.', 'Esc stops playback');
      await p.locator('.reelgo[data-role="narrator_female"][data-group="narrator"]').click();
      await p.waitForFunction(() => /Reel stopped|Reel finished/.test(document.querySelector('#now').textContent), null, { timeout: 30000 });
      ok(/^Reel stopped at N04: no audio for VOICEVOX/.test(await p.locator('#now').textContent()), 'the narrator reel plays N01–N03 and stops at N04, saying why');
      const sel = '[data-role="narrator_female"][data-group="narrator"]';
      await p.locator('.reelgo' + sel).click();
      await p.waitForFunction(() => /^Reel 1\//.test(document.querySelector('#now').textContent), null, { timeout: 10000 });
      const firstTake = await p.locator('#now').textContent();
      await p.keyboard.press('Escape');
      await p.selectOption('.reeltake' + sel, 'repair');
      await p.locator('.reelgo' + sel).click();
      await p.waitForFunction(() => /^Reel 1\//.test(document.querySelector('#now').textContent), null, { timeout: 10000 });
      const repairTake = await p.locator('#now').textContent();
      await p.keyboard.press('Escape');
      ok(/N01 · first take/.test(firstTake) && /N01 · repair/.test(repairTake), 'the reel names the attempt it plays: first takes, or repairs where made (' + firstTake + ' / ' + repairTake + ')');
      await p.locator('#case-N11 button.reveal').click();
      ok(await p.locator('#case-N11 .jp').count() === 1 && await p.locator('#case-N11 button.play').count() === 2, 'revealing the sealed N11 shows its text and takes');
      await p.selectOption('#filter', 'audio');
      ok(await p.locator('.cell').count() === 13, 'the "with audio" filter leaves the 13 takes');
      await p.selectOption('#filter', 'all');
      await p.locator('#blind').check();
      const blind = await p.locator('#configs').textContent() + await p.locator('#sections').textContent();
      const leak = /voicevox|gemini|google|azure|microsoft|elevenlabs|qwen|dashscope|aivis|hiroshiba|docker/i.exec(blind);
      ok(!leak, 'blind labels hide every configuration name, host and reason' + (leak ? ' (found "' + blind.slice(Math.max(0, leak.index - 40), leak.index + 40) + '")' : ''));
      await p.locator('#blind').uncheck();
      const d = p.locator('details.score').first();
      await d.locator('summary').click();
      for (const [i, v] of [[0, '4'], [1, '3'], [2, '5'], [3, '4']]) await d.locator('select').nth(i).selectOption(v);
      await d.locator('input[data-f="listened"]').check();
      await p.locator('#reviewer').fill('Test listener');
      await p.locator('#copy').click();
      const partial = (await p.locator('#csvOut').inputValue()).split('\n')[1].split(',');
      await d.locator('select').nth(4).selectOption('3');
      await p.locator('#copy').click();
      const full = (await p.locator('#csvOut').inputValue()).split('\n')[1].split(',');
      ok(partial[14] === '' && full[14] === '71.3' && full[6] === 'Test listener' && full[7] === 'yes' && full[4] === '1' && /^[0-9a-f]{64}$/.test(full[5]), 'no total until all five are scored; then 71.3; reviewer, listened, the attempt and its audio hash exported');
      // the repair of N01 is its own take: marking the first take listened leaves the repair unheard
      const n01 = p.locator('#case-N01 .cell');
      const states = await n01.evaluateAll((cells) => cells.map((c) => [c.querySelector('.who').textContent, (c.querySelector('[data-heard]') || {}).textContent || '']));
      await d.locator('summary').click();
      const n01d = p.locator('#case-N01 details.score').first();
      await n01d.locator('summary').click();
      await n01d.locator('input[data-f="listened"]').check();
      const after = await n01.evaluateAll((cells) => cells.map((c) => [c.querySelector('.who').textContent, (c.querySelector('[data-heard]') || {}).textContent || '']));
      const firstRow = after.find((x) => /directed$/.test(x[0])), repairRow = after.find((x) => /repair/.test(x[0]));
      ok(firstRow && repairRow && firstRow[1] === 'Listened' && repairRow[1] === 'Not listened' && states.length === after.length, 'marking N01\'s first take listened leaves its repair "Not listened"');
      await p.reload();
      ok(await p.locator('[data-heard].ok').count() === 2 && await p.locator('#reviewer').inputValue() === 'Test listener', 'the score sheet survives a reload');
    }
    ok(!errors.length, name + ': no page errors ' + errors.join(' | '));
    ok(!requests.length, name + ': no network requests ' + requests.join(' '));
    await p.close();
  }
} finally {
  await browser.close();
  fs.rmSync(tmp, { recursive: true, force: true });
}
console.log(pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
