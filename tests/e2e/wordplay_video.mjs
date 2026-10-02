// A short screen recording of companion shiritori in the built game (not part of the default
// suite): at the Cinder Orchard inn with Nao (and the cat), the companion is spoken to, Play
// shiritori is chosen from the rest menu after Just chat, the preparation sheet keeps its
// defaults (Competitive / Pocket words / Casual / Open-book), the demonstration is skipped, and
// one real game is played against the real Casual opponent with the shipped Pocket bank — words
// chosen from the open book, typed, and handwritten with the mouse along the KanjiVG reference
// (synthetic strokes, not a person's handwriting). The test player takes a word that leaves no
// reply when the bank offers one (a real win); otherwise, after fourteen words, it concedes. Then the
// result, Look back over the chain, and Leave. Synthetic campaign; no save touched.
// Usage: node tests/e2e/wordplay_video.mjs [out.webm]
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, root } from './lib.mjs';

const out = path.resolve(process.argv[2] || path.join(root, 'docs/screenshots/wordplay/wordplay_match.webm'));
const { srv, url } = await serve();
const b = await launch();
const dir = path.join(root, 'tests/e2e/out/wordplay_video/raw');
fs.mkdirSync(dir, { recursive: true });
const ctx = await b.newContext({ viewport: { width: 1280, height: 720 }, recordVideo: { dir, size: { width: 960, height: 540 } } });
const p = await ctx.newPage();
const errors = [];
p.on('pageerror', (e) => errors.push(e.message));
const T0 = Date.now();
await p.goto(url);
await p.waitForFunction(() => window.__RB_READY__ === true);
const pause = (ms) => p.waitForTimeout(ms);
const until = async (fn, arg, ms) => { const t0 = Date.now(); for (;;) { if (await p.evaluate(fn, arg)) return true; if (Date.now() - t0 > (ms || 8000)) return false; await p.waitForTimeout(40); } };

// a synthetic campaign at the inn, arrival scenes already seen, Nao committed, the cat along
await p.evaluate(() => {
  const map = 'co.inn', d = RB.content.maps[map] || {}, seen = {};
  for (const ev of d.onEnter || []) seen['enter:' + map + ':' + ev.scene] = true;
  const s = RB.game.debugStart(map, 6, 8, { comp: 'nao', flags: Object.assign({ departed: true, ch1_done: true }, seen) });
  s.chapter = 2;
  if (RB.pets && RB.pets.meet) { try { RB.pets.meet(s, 'cat', 'co.inn'); RB.pets.select(s, 'cat'); } catch (e) { /* no pet */ } }
  RB.company.sync(s, 'live');
  RB.company.refresh(s);
});
await pause(900);

// talk to the companion: the rest menu (Just chat first), then Play shiritori
async function talk(picks) {
  picks = [].concat(picks || []);
  for (let i = 0; i < 40; i++) {
    const s = await p.evaluate(() => ({ choices: Array.from(document.querySelectorAll('.choices:not(.hidden) .choice')).map((c) => c.textContent.replace(/\s+/g, ' ').trim()), dlg: !!document.querySelector('.dlg:not(.hidden)'), running: RB.script.isRunning() }));
    if (s.choices.length) {
      if (!picks.length) return s.choices;
      const idx = s.choices.findIndex((c) => new RegExp(picks[0], 'i').test(c));
      if (idx < 0) throw new Error('no choice ' + picks[0] + ' in ' + JSON.stringify(s.choices));
      picks.shift();
      await pause(1100);
      await p.locator('.choices .choice').nth(idx).click();
      await pause(400);
      continue;
    }
    if (s.dlg) { await pause(900); await p.locator('.dlg .b-next').click(); await pause(200); continue; }
    if (!s.running) return [];
    await pause(80);
  }
  throw new Error('dialogue did not finish');
}
await p.evaluate(() => RB.game.companionTalk());
await pause(300);
await talk(['Play shiritori']);
await p.waitForSelector('.wp-prep');
await pause(2200); // the preparation sheet, defaults as they are
const clickWp = async (act) => { const el = p.locator('.wp-leaf [data-wp="' + act + '"]').first(); await el.scrollIntoViewIfNeeded(); await el.click(); };
await clickWp('start');
await until(() => !!document.querySelector('.wp-demo-offer') || !!document.querySelector('.wp-table'));
if (await p.evaluate(() => !!document.querySelector('.wp-demo-offer'))) { await pause(1200); await clickWp('skip'); }
await p.waitForSelector('.wp-table');
await pause(1800);

// the test player's choice from the public state: a word that leaves no reply if the bank has
// one; otherwise the word that keeps the most replies open (plain kana when it is handwritten)
const pick = (o) => p.evaluate((o) => {
  const L = RB.wordplay.live(RB.game.s), a = L.active, bk = L.bank;
  const safe = RB.shiritori.safeReplies(a.st, bk).filter((e) => !o.plain || (/^[ぁ-ゖ]+$/.test(e.reading) && !/[ぁぃぅぇぉっゃゅょゎ]/.test(e.reading) && e.reading.length <= 3));
  const left = (e) => { const u = Object.assign({}, a.st.used); u[e.group] = true; return (bk.byHead[e.tail] || []).filter((x) => !u[x.group] && !x.terminal).length; };
  const sorted = safe.slice().sort((x, y) => (x.reading < y.reading ? -1 : 1));
  const e = (o.win && sorted.find((x) => left(x) === 0)) || sorted.sort((x, y) => left(y) - left(x))[0];
  return e ? { id: e.entry, reading: e.reading, form: bk.entryById[e.entry].forms[0] } : null;
}, o);
const state = () => p.evaluate(() => { const s = RB.game.s, a = s.practice.shiritori.active; return a ? { n: a.st.history.length, next: a.st.next, over: a.st.over } : null; });
async function waitTurn() { return until(() => { const a = RB.game.s.practice.shiritori.active; return !a || !!document.querySelector('.wp-result') || (a.st.next === 'pc' && !!document.querySelector('.wp-leaf [data-wp="play"]')); }, null, 12000); }
async function choose(w) {
  await p.locator('[data-wp-tab="select"]').click(); await pause(700);
  const btn = p.locator('[data-wp-pick="' + w.id + '"]'); await btn.scrollIntoViewIfNeeded(); await pause(500); await btn.click(); await pause(600);
  await p.locator('.wp-leaf [data-wp="play"]').click();
}
async function type(w) {
  await p.locator('[data-wp-tab="ime"]').click(); await pause(500);
  const inp = p.locator('#wp-ime');
  await inp.click();
  for (const ch of Array.from(w.form)) { await inp.type(ch); await pause(160); }
  await pause(700);
  if (await p.locator('.wp-dpick [data-wp-reading]').count()) { await p.locator('.wp-dpick [data-wp-reading="' + w.reading + '"]').click(); await pause(400); }
  await inp.press('Enter');
}
async function write(w) {
  await p.locator('[data-wp-tab="hand"]').click(); await pause(500);
  for (const ch of Array.from(w.reading)) {
    const ink = p.locator('.wp-pane .pad-ink'); await ink.scrollIntoViewIfNeeded();
    const box = await ink.boundingBox();
    const strokes = await p.evaluate((c) => { const r = RB.recog.reference(c); return r.strokes.map((st) => st.map((q) => [q.x / r.box, q.y / r.box])); }, ch);
    for (const st0 of strokes) {
      const pts = st0.map(([x, y]) => [box.x + (0.1 + 0.8 * x) * box.width, box.y + (0.1 + 0.8 * y) * box.height]);
      await p.mouse.move(pts[0][0], pts[0][1]); await p.mouse.down();
      for (const q of pts.slice(1)) await p.mouse.move(q[0], q[1], { steps: 3 });
      await p.mouse.up(); await pause(90);
    }
    await pause(500);
    const read = await p.evaluate(() => { const big = document.querySelector('.wp-pane .readas .big'); return big ? big.textContent.trim().charAt(0) : ''; });
    if (read !== ch) {
      // the reader saw something else: say so, then choose what was written from its other readings
      await p.locator('[data-wp="notwrote"]').click(); await pause(500);
      const cand = p.locator('.wp-pane .cands .cand', { hasText: ch }).first();
      if (await cand.count()) await cand.click(); else return false;
      await pause(300);
    }
    await p.locator('.wp-pane [data-a="confirm"]').click(); await pause(300);
  }
  await pause(500);
  await p.locator('.wp-leaf [data-wp="play"]').click();
  return true;
}
const plan = ['select', 'ime', 'hand', 'select', 'ime', 'select', 'ime', 'select'];
let moves = 0;
const played = [];
for (let k = 0; k < 30; k++) {
  await waitTurn();
  if (await p.evaluate(() => !!document.querySelector('.wp-result'))) break;
  const a = await state();
  if (!a) break;
  if (moves >= 14) { // a long game: end it as a player would
    await p.locator('[data-wp="stuck"]').click(); await pause(900);
    await clickWp('concede'); await p.waitForSelector('.csheet'); await pause(900);
    await p.locator('.csheet .pbtn', { hasText: 'Concede' }).click();
    break;
  }
  const how = plan[moves % plan.length];
  const w = await pick({ win: moves >= 3, plain: how === 'hand' });
  if (!w) break;
  await pause(900); // reading the required kana
  const before = a.n;
  if (how === 'select') await choose(w);
  else if (how === 'ime') await type(w);
  else if (!(await write(w))) await type(w);
  played.push(how + ':' + w.reading);
  moves++;
  await until((n) => { const x = RB.game.s.practice.shiritori.active; return !x || x.st.history.length > n; }, before, 6000);
  await pause(1600); // the companion's reply
}
await p.waitForSelector('.wp-result', { timeout: 15000 });
await pause(2600);
const result = await p.evaluate(() => (document.querySelector('.wp-result') || {}).textContent.replace(/\s+/g, ' ').slice(0, 160));
if (await p.locator('.wp-leaf [data-wp="look"]').count()) { await clickWp('look'); await pause(2600); await clickWp('back'); await pause(1000); }
await clickWp('leave');
await pause(1400);
const video = p.video();
await ctx.close();
const raw = await video.path();
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.copyFileSync(raw, out);
console.log('wrote ' + path.relative(root, out) + ' (' + Math.round(fs.statSync(out).size / 1024) + ' KiB, ' + Math.round((Date.now() - T0) / 1000) + ' s); played ' + played.join(', ') + '; result: ' + result + (errors.length ? '; page errors: ' + errors.join(' | ') : '; no page errors'));
await b.close();
srv.close();
process.exit(errors.length ? 1 : 0);
