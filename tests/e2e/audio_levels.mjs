// Interface and feedback effects sit under the music (PT-1a: a new learner's report, 2026-10-15, "the UI volume was
// crazy loud"). Every level is measured offline through the game's own mix graph at the game's default volumes (a
// fresh settings record: master 0.8, music 0.55, effects 0.75), with an
// approximate K-weighting (a +4 dB high shelf at 1.5 kHz and a 38 Hz high-pass, after ITU-R BS.1770) and momentary
// loudness (400 ms windows, 100 ms hop):
//   - the interface clicks (confirm, cancel, menu, save, quest update, page) peak no louder than the title music's
//     integrated loudness (the quietest music a learner meets first);
//   - the feedback sounds (answers, recognition, discovery, items, reveal) peak at least 5 LU under the area music's
//     integrated loudness (Reedwake);
//   - level-up, the one big moment, peaks at least 3 LU under the area music's own loudest moment.
// Usage: node tests/e2e/audio_levels.mjs [other.html]   (needs index.html: node tools/build.mjs)
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const target = process.argv[2] ? path.resolve(process.argv[2]) : path.join(root, 'index.html');
if (!fs.existsSync(target)) {
  console.log('index.html not found — run `node tools/build.mjs` first.');
  process.exit(2);
}
let failures = 0;
const ok = (cond, msg) => { if (!cond) { failures++; console.log('  FAIL:', msg); } };

const INTERFACE = ['confirm', 'cancel', 'menu_open', 'menu_close', 'save', 'quest_update', 'page', 'cursor', 'text_blip'];
const FEEDBACK = ['answer_right', 'answer_wrong', 'recog_ok', 'recog_unsure', 'discover', 'item_get', 'reveal'];
// the volume each effect is called with in the game (text_blip is always played at 0.35)
const CALLED = { text_blip: 0.35 };

const browser = await chromium.launch();
const page = await browser.newPage();
const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push(String(e.message || e)));
await page.goto(pathToFileURL(target).href);
await page.waitForFunction(() => globalThis.RB && RB.audio && RB.audio._ && RB.audio._.buildGraph && RB.audio._.Player, null, { timeout: 30000 });

const ids = ['title', 'reedwake'].concat(INTERFACE.map((s) => 'sfx:' + s), FEEDBACK.map((s) => 'sfx:' + s), ['sfx:levelup']);
const res = await page.evaluate(async ({ ids, CALLED }) => {
  const _ = RB.audio._;
  async function render(id, seconds) {
    const sr = 48000;
    const ctx = new OfflineAudioContext({ numberOfChannels: 2, length: Math.ceil(sr * seconds), sampleRate: sr });
    const g = _.buildGraph(ctx, Object.assign({}, _.DEFAULT_VOL, RB.game.settings.vol), false);
    const sh = ctx.createBiquadFilter(); sh.type = 'highshelf'; sh.frequency.value = 1500; sh.gain.value = 4;
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 38; hp.Q.value = 0.5;
    g.out.connect(sh); sh.connect(hp); hp.connect(ctx.destination);
    if (id.startsWith('sfx:')) {
      const s = id.slice(4);
      if (!_.sfxPlay(g, s, 0.05, { vol: CALLED[s] == null ? 1 : CALLED[s] })) throw new Error('unknown ' + id);
    } else new _.Player(g, _.getSong(id), 0.05, false).pump(seconds);
    const buf = await ctx.startRendering();
    const L = buf.getChannelData(0), R = buf.getChannelData(1);
    const w = Math.floor(0.4 * sr), hop = Math.floor(0.1 * sr);
    const lufs = (m) => -0.691 + 10 * Math.log10(m || 1e-12);
    const ms = [];
    for (let i = 0; i + w <= L.length; i += hop) { let s = 0; for (let j = i; j < i + w; j++) s += L[j] * L[j] + R[j] * R[j]; ms.push(s / w); }
    const gated = ms.filter((m) => lufs(m) > -70);
    const mean = gated.reduce((a, b) => a + b, 0) / (gated.length || 1);
    const rel = gated.filter((m) => lufs(m) > lufs(mean) - 10);
    return { id, momMax: Math.max(...ms.map(lufs)), integ: lufs(rel.reduce((a, b) => a + b, 0) / (rel.length || 1)) };
  }
  const out = { vol: RB.game.settings.vol };
  for (const id of ids) out[id] = await render(id, id.startsWith('sfx:') ? 2.5 : 12);
  return out;
}, { ids, CALLED });

const f = (x) => x.toFixed(1);
const title = res.title, area = res.reedwake;
console.log(`# audio levels (approx. LUFS, the game's default volumes ${JSON.stringify(res.vol)})\n  title music: integrated ${f(title.integ)}, loudest ${f(title.momMax)}\n  area music (reedwake): integrated ${f(area.integ)}, loudest ${f(area.momMax)}`);
for (const s of INTERFACE) {
  const r = res['sfx:' + s];
  console.log(`  interface ${s.padEnd(14)} ${f(r.momMax)}`);
  ok(r.momMax <= title.integ, `${s} peaks at ${f(r.momMax)}, above the title music's integrated ${f(title.integ)}`);
}
for (const s of FEEDBACK) {
  const r = res['sfx:' + s];
  console.log(`  feedback  ${s.padEnd(14)} ${f(r.momMax)}`);
  ok(r.momMax <= area.integ - 5, `${s} peaks at ${f(r.momMax)}, within 5 LU of the area music's integrated ${f(area.integ)}`);
}
const lv = res['sfx:levelup'];
console.log(`  moment    levelup        ${f(lv.momMax)}`);
ok(lv.momMax <= area.momMax - 3, `levelup peaks at ${f(lv.momMax)}, within 3 LU of the area music's loudest ${f(area.momMax)}`);
ok(!pageErrors.length, 'page errors: ' + pageErrors.join(' | '));
await browser.close();
console.log(failures ? `${failures} failed` : 'all audio level checks passed');
process.exit(failures ? 1 : 0);
