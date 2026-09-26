// Browser check for the procedural audio engine (Playwright + Chromium).
//
//   node tools/build.mjs && node tests/e2e/audio.check.mjs [--standalone] [--quick]
//
// Default: opens the built index.html via file://. --standalone instead
// builds a throwaway page containing only src/core/00_ns.js + src/audio/*.js
// (useful when another module's in-progress code breaks the combined script).
// --quick renders 4 s per song instead of 8 s + a mid-song window.
//
// What it checks (and what it cannot):
//  * every song and effect renders through the real mix graph in an
//    OfflineAudioContext: RMS above a small floor, peak <= 1, no NaN;
//  * live playback after a real click: context running, scheduler produces
//    signal at the output (AnalyserNode), crossfade + stop, sfx, mute;
//  * visibility handling suspends/resumes the context;
//  * RB.voice reports status and only lists local voices.
// These are signal-level checks. They show the code makes sound without
// clipping; they do NOT show that the music is any good.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const args = process.argv.slice(2);
const standalone = args.includes('--standalone');
const quick = args.includes('--quick');
const SONG_SECONDS = quick ? 4 : 8;
const RMS_FLOOR = 0.003; // ~ -50 dBFS: "clearly not silent"

let failures = 0;
const fail = (msg) => { failures++; console.log('  FAIL:', msg); };
const ok = (cond, msg) => { if (!cond) fail(msg); };

function standalonePage() {
  const files = [path.join(root, 'src/core/00_ns.js')];
  const dir = path.join(root, 'src/audio');
  for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.js')).sort()) files.push(path.join(dir, f));
  const js = files.map((f) => `/* ${path.relative(root, f)} */\n${fs.readFileSync(f, 'utf8')}`).join('\n');
  const html = `<!doctype html><meta charset="utf-8"><title>audio check</title>
<body style="margin:0;height:100vh"><button id="go" style="width:100%;height:100%">start</button>
<script>${js}
document.getElementById('go').addEventListener('pointerdown', () => RB.audio.init());
</script>`;
  const out = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'rb-audio-')), 'audio.html');
  fs.writeFileSync(out, html);
  return out;
}

const target = standalone ? standalonePage() : path.join(root, 'index.html');
if (!fs.existsSync(target)) {
  console.log('index.html not found — run `node tools/build.mjs` first (or use --standalone).');
  process.exit(2);
}
console.log('# audio check —', standalone ? 'standalone audio page' : 'built index.html');

const browser = await chromium.launch();
const page = await browser.newPage();
const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push(String(e.message || e)));
page.on('console', (m) => { if (m.type() === 'error') pageErrors.push('console: ' + m.text()); });
await page.goto(pathToFileURL(target).href);
await page.waitForFunction(() => globalThis.RB && RB.audio && RB.audio.renderOffline, null, { timeout: 15000 });

// ---- API surface
const api = await page.evaluate(() => {
  const a = ['init', 'ready', 'setVolume', 'setMuted', 'playSong', 'stopSong', 'currentSong', 'sfx', 'duck', 'songList', 'renderOffline'];
  const v = ['supported', 'japaneseVoices', 'onChange', 'setVoice', 'setRate', 'speak', 'cancel', 'status'];
  return {
    missingAudio: a.filter((k) => typeof RB.audio[k] !== 'function'),
    missingVoice: v.filter((k) => !RB.voice || typeof RB.voice[k] !== 'function'),
    songs: RB.audio.songList(),
    required: RB.audio._.REQUIRED_SONGS,
    sfx: RB.audio.sfxList(),
    requiredSfx: RB.audio._.REQUIRED_SFX,
    readyBeforeGesture: RB.audio.ready(),
  };
});
console.log('## API');
ok(!api.missingAudio.length, 'RB.audio missing: ' + api.missingAudio.join(', '));
ok(!api.missingVoice.length, 'RB.voice missing: ' + api.missingVoice.join(', '));
const ids = api.songs.map((s) => s.id);
for (const r of api.required) ok(ids.includes(r), 'songList lacks ' + r);
for (const r of api.requiredSfx) ok(api.sfx.includes(r), 'sfx lacks ' + r);
ok(api.readyBeforeGesture === false, 'audio should not be running before a user gesture');
console.log(`  ${ids.length} songs, ${api.sfx.length} sfx, API complete: ${!api.missingAudio.length && !api.missingVoice.length}`);

// ---- offline renders
async function render(id, secs, opts) {
  return page.evaluate(([i, s, o]) => {
    const t0 = performance.now();
    return RB.audio.renderOffline(i, s, o).then((r) => Object.assign(r, { ms: Math.round(performance.now() - t0) }));
  }, [id, secs, opts || {}]);
}
const db = (x) => (x > 0 ? (20 * Math.log10(x)).toFixed(1) : '-inf');
const row = (cols, w) => cols.map((c, i) => String(c).padEnd(w[i])).join(' ');
const W = [18, 8, 9, 8, 8, 9, 7, 7];

console.log(`\n## Songs (offline render, ${SONG_SECONDS}s from start${quick ? '' : ' + 6s from mid-song'})`);
console.log(row(['id', 'length', 'window', 'rms', 'rms dB', 'peak', 'raw pk', 'ms'], W));
const rmsList = [];
for (const s of api.songs) {
  const windows = [[0, SONG_SECONDS]];
  if (!quick && s.seconds > 20) windows.push([Math.floor(s.seconds / 2), 6]);
  for (const [off, secs] of windows) {
    let r;
    try {
      r = await render(s.id, secs, { offset: off });
    } catch (e) {
      fail(`${s.id}: render threw ${e.message}`);
      continue;
    }
    console.log(row([s.id, s.seconds + 's', `${off}-${off + secs}s`, r.rms.toFixed(4), db(r.rms), r.peak.toFixed(3), r.rawPeak.toFixed(3), r.ms], W));
    ok(!r.nan, `${s.id}@${off}: NaN in output`);
    ok(r.rms > RMS_FLOOR, `${s.id}@${off}: too quiet (rms ${r.rms.toFixed(5)})`);
    ok(r.peak <= 1.0, `${s.id}@${off}: peak ${r.peak} > 1`);
    ok(r.clipped === 0, `${s.id}@${off}: ${r.clipped} samples at full scale`);
    if (off === 0) rmsList.push([s.id, r.rms]);
  }
}
const sorted = rmsList.map((x) => x[1]).sort((a, b) => a - b);
const median = sorted[Math.floor(sorted.length / 2)];
console.log(`  loudness spread: min ${db(sorted[0])} dB, median ${db(median)} dB, max ${db(sorted[sorted.length - 1])} dB`);
for (const [id, r] of rmsList) {
  if (r > median * 2.5 || r < median / 4) console.log(`  note: ${id} is ${db(r / median)} dB from the median`);
}

console.log('\n## Effects (offline render)');
console.log(row(['id', '', 'secs', 'rms', 'rms dB', 'peak', 'raw pk', 'ms'], W));
for (const id of api.sfx) {
  let r;
  try {
    r = await render('sfx:' + id, 2.5);
  } catch (e) {
    fail(`sfx ${id}: render threw ${e.message}`);
    continue;
  }
  console.log(row([id, '', '2.5', r.rms.toFixed(4), db(r.rms), r.peak.toFixed(3), r.rawPeak.toFixed(3), r.ms], W));
  ok(!r.nan, `sfx ${id}: NaN`);
  ok(r.peak > 0.005, `sfx ${id}: silent (peak ${r.peak})`);
  ok(r.peak <= 1.0, `sfx ${id}: peak > 1`);
}

// ---- live playback after a real gesture
console.log('\n## Live playback (real click -> init)');
await page.mouse.click(40, 40);
await page.evaluate(() => RB.audio.init());
const live = await page.evaluate(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const out = { steps: [] };
  const A = RB.audio;
  const st = A._.st;
  await sleep(200);
  out.ready = A.ready();
  out.state = st.ctx && st.ctx.state;
  if (!out.ready) return out;
  const an = st.ctx.createAnalyser();
  an.fftSize = 2048;
  st.g.out.connect(an);
  const buf = new Float32Array(an.fftSize);
  const measure = async (ms) => {
    let peak = 0;
    let sum = 0;
    let n = 0;
    const end = performance.now() + ms;
    while (performance.now() < end) {
      an.getFloatTimeDomainData(buf);
      for (const x of buf) { sum += x * x; n++; if (Math.abs(x) > peak) peak = Math.abs(x); }
      await sleep(50);
    }
    return { rms: Math.sqrt(sum / Math.max(1, n)), peak };
  };
  out.playRoad = A.playSong('road');
  out.cur1 = A.currentSong();
  out.m1 = await measure(2500);
  out.sameNoop = A.playSong('road'); // same id: no restart
  out.playBattle = A.playSong('battle', { fade: 500 });
  out.cur2 = A.currentSong();
  out.m2 = await measure(1500);
  out.sfx = ['confirm', 'cursor', 'pen_stroke', 'answer_right'].map((id) => A.sfx(id));
  out.rateLimited = A.sfx('text_blip') && !A.sfx('text_blip'); // second call inside min gap is dropped
  A.setVolume('music', 0.5);
  out.vol = A.getVolume('music');
  A.setMuted(true);
  await sleep(300);
  out.mMuted = await measure(600);
  A.setMuted(false);
  A.duck(true);
  await sleep(300);
  A.duck(false);
  // visibility: suspend while hidden, resume when visible again
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
  document.dispatchEvent(new Event('visibilitychange'));
  await sleep(300);
  out.hiddenState = st.ctx.state;
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
  document.dispatchEvent(new Event('visibilitychange'));
  await sleep(400);
  out.visibleState = st.ctx.state;
  A.stopSong({ fade: 300 });
  await sleep(600);
  out.cur3 = A.currentSong();
  // non-looping song ends by itself
  A.playSong('victory', { fade: 0 });
  await sleep(7500);
  out.afterVictory = A.currentSong();
  out.lastError = st.lastError;
  return out;
});
console.log('  ', JSON.stringify(live));
ok(live.ready, 'context not running after click + init (state ' + live.state + ')');
if (live.ready) {
  ok(live.playRoad && live.cur1 === 'road', 'playSong(road) failed');
  ok(live.m1.rms > 0.003, 'live output silent while road plays (rms ' + (live.m1 && live.m1.rms) + ')');
  ok(live.m1.peak <= 1, 'live peak > 1');
  ok(live.cur2 === 'battle' && live.m2.rms > 0.003, 'crossfade to battle failed');
  ok(live.sfx.every(Boolean), 'sfx() returned false while running');
  ok(live.rateLimited, 'text_blip rate limit not applied');
  ok(live.vol === 0.5, 'setVolume not stored');
  ok(live.mMuted.peak < 0.01, 'mute did not silence output (peak ' + live.mMuted.peak + ')');
  ok(live.hiddenState === 'suspended', 'context not suspended when hidden');
  ok(live.visibleState === 'running', 'context not resumed when visible');
  ok(live.cur3 === null, 'stopSong did not clear currentSong');
  ok(live.afterVictory === null, 'non-looping victory sting did not end');
  ok(!live.lastError, 'engine recorded an error: ' + live.lastError);
}

// ---- voice
console.log('\n## Voice');
const voice = await page.evaluate(() => {
  const s = RB.voice.status();
  const list = RB.voice.japaneseVoices();
  const raw = (globalThis.speechSynthesis && speechSynthesis.getVoices()) || [];
  return { status: s, list, rawCount: raw.length, speakResult: list.length ? 'skipped (voice present)' : RB.voice.speak('こんにちは') };
});
console.log('  ', JSON.stringify(voice));
ok(typeof voice.status.note === 'string' && voice.status.note.length > 20, 'voice status note missing');
ok(voice.list.every((v) => v.local === true), 'non-local voice listed');
if (!voice.list.length) ok(voice.speakResult === false, 'speak() should refuse without a local Japanese voice');

const audioErrors = pageErrors.filter((e) => /audio|voice|RB\.audio/i.test(e));
if (pageErrors.length) console.log('\n  page errors (all modules):', pageErrors.slice(0, 8));
ok(!audioErrors.length, 'audio-related page errors: ' + audioErrors.join(' | '));

await browser.close();
console.log(`\n${failures ? failures + ' FAILED' : 'all audio checks passed'}`);
process.exit(failures ? 1 : 0);
