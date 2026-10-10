// Manybridge, Chapter 4 of the twelve-chapter edition (expansion P09), in Chromium on the built game, with throwaway
// sessions (no journey saved):
//  1. the press: a notice composed from the blocks offered, the proof, ink / press / peel, posted at the board; the
//     record kept (a version, its readers waiting), and a reader's reaction said when you meet them; no bare kanji;
//  2. the rehearsal: the stage above the task; a wrong answer puts everyone where it says (and says why), the right
//     one puts Sakutarō at the back on the audience's right and the screen on the left;
//  3. the fireworks: on the festival night the Opening's sky shows them; drawn twice a moment apart they move, and with
//     reduced motion they are a held glow (the same both times), soft (never brighter than a quarter);
//  4. festival dress: the yukata on the road sprite only on the night, on Manybridge's festival maps, and not after.
// Usage: node tests/e2e/manybridge2.mjs [filter]
import { serve, launch, page } from './lib.mjs';

const only = process.argv[2] || '';
const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
async function test(name, fn) {
  if (only && !name.includes(only)) return;
  try { await Promise.race([fn(), new Promise((_, rej) => setTimeout(() => rej(new Error('timed out after 180 s')), 180000))]); pass++; console.log('PASS ' + name); }
  catch (e) { fail++; console.log('FAIL ' + name + ': ' + String(e && e.stack || e).slice(0, 1400)); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };
async function bareKanji(p, scope) {
  return p.evaluate((scope) => {
    const out = [];
    for (const rootEl of document.querySelectorAll(scope)) {
      const w = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT);
      let n;
      while ((n = w.nextNode())) {
        if (!/[一-鿿々]/.test(n.nodeValue)) continue;
        const el = n.parentElement;
        if (!el || !el.getClientRects().length || el.closest('.sr, rt, input, textarea, [hidden], [aria-hidden="true"]')) continue;
        if (!el.closest('ruby')) out.push(n.nodeValue.trim().slice(0, 30));
      }
    }
    return out;
  }, scope);
}
// a twelve-chapter journey in Chapter 4
async function start(p, o) {
  await p.evaluate((o) => {
    const s = RB.game.debugStart(o.map || 'mp.pressroom', o.x || 5, o.y || 6, { comp: o.comp || 'ren', flags: Object.assign({ departed: true, ch1_done: true, ch2_done: true, mb_arrived: true, mb_ichi_found: true, mb1_done: true, mp_arrived: true, mp_sobe_met: true, mp_press_open: true }, o.flags || {}) });
    s.edition = 2; s.player.nameJp = 'ハル'; s.learn.kanaKnown = 'both'; s.learn.profile = o.profile || 'E';
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.input = 'choice'; RB.game.settings.lightbulb = false;
    RB.game.settings.reducedMotion = !!o.reduced;
    RB.game.applySettings();
  }, o || {});
}
const click = (p, sel) => p.evaluate((sel) => { const el = document.querySelector(sel); if (!el) throw new Error('missing ' + sel); el.click(); }, sel);

await test('the press: compose a notice, proof, ink / press / peel, post it; the record and a reader', async () => {
  const { p, errors } = await page(b, url, { viewport: { width: 1180, height: 860 } });
  await start(p, {});
  await p.evaluate(() => { window.__done = null; RB.activity.launch('press', { source: 'world-prop', kind: null }).then((r) => { window.__done = r || {}; }); });
  await p.waitForSelector('.pr-sheet [data-a=kind]');
  await click(p, '.pr-sheet [data-a=kind][data-v=notice]');
  // each line: open the slot, take the first block offered
  for (let i = 0; i < 8; i++) {
    const ready = await p.evaluate(() => { const b = document.querySelector('.pr-sheet [data-a=proof]'); return !!b && !b.disabled; });
    if (ready) break;
    const open = await p.$('.pr-sheet .pr-opt');
    if (!open) await click(p, '.pr-sheet [data-a=slot]');
    await click(p, '.pr-sheet .pr-opt');
  }
  assert((await bareKanji(p, '.pr-sheet')).length === 0, 'no bare kanji while composing');
  await click(p, '.pr-sheet [data-a=proof]');
  await p.waitForSelector('.pr-sheet .pr-paper');
  const proof = await p.$eval('.pr-sheet .pr-page', (e) => e.querySelectorAll('li').length);
  assert(proof >= 3, 'the proof shows every line (' + proof + ')');
  await click(p, '.pr-sheet [data-a=print]');
  for (const step of ['ink', 'press', 'peel']) { await p.waitForSelector('.pr-sheet [data-a=' + step + ']'); await click(p, '.pr-sheet [data-a=' + step + ']'); }
  await p.waitForSelector('.pr-sheet [data-a=where][data-v=board]');
  await click(p, '.pr-sheet [data-a=where][data-v=board]');
  await p.waitForSelector('.pr-sheet .pr-readers');
  const rec = await p.evaluate(() => ({ press: JSON.parse(JSON.stringify(RB.game.s.practice.press || null)), waiting: RB.press.waitingAll(RB.game.s).map((r) => r.id), flags: ['press_printed', 'press_notice'].filter((f) => RB.game.s.flags[f]) }));
  assert(rec.press && rec.waiting.length >= 3 && rec.waiting.length <= 5, 'printed, with 3–5 readers waiting: ' + JSON.stringify(rec.waiting));
  assert(rec.flags.length === 2, 'the press flags are set: ' + rec.flags.join(','));
  await click(p, '.pr-sheet [data-a=close]');
  await p.waitForFunction(() => window.__done);
  // meet a reader: their reaction is said (the hook the reader's talk injection runs)
  const who = rec.waiting[0];
  await p.evaluate(async (who) => { window.__said = []; const say = RB.ui.dialogue.say; RB.ui.dialogue.say = async (l) => { window.__said.push(l); }; try { await RB.hooks.press_react([who]); } finally { RB.ui.dialogue.say = say; } }, who);
  const said = await p.evaluate(() => window.__said.map((l) => l.en || l.jp));
  assert(said.length >= 1, 'the reader says what they made of it: ' + JSON.stringify(said));
  const after = await p.evaluate((who) => RB.press.waitingAll(RB.game.s).map((r) => r.id).includes(who), who);
  assert(!after, 'a reader who has spoken is no longer waiting');
  assert(errors.length === 0, 'page errors: ' + errors.join(' | '));
});

await test('the rehearsal: the stage above the task; a wrong answer shows where it puts them; then the right one', async () => {
  const { p, errors } = await page(b, url, { viewport: { width: 1180, height: 860 } });
  await start(p, { map: 'mp.theatre', x: 10, y: 9, profile: 'E' });
  await p.evaluate(() => { window.__res = null; RB.challenge.run('mp.rehearse_block', {}).then((r) => { window.__res = r || {}; }); });
  await p.waitForSelector('.chal .st');
  const empty = await p.$$eval('.chal .st .st-tok', (x) => x.length);
  assert(empty === 0, 'nobody is placed before an answer');
  const bk = await bareKanji(p, '.chal');
  assert(bk.length === 0, 'no bare kanji on the stage or the task: ' + bk.join(' | '));
  const pickOpt = (txt) => p.evaluate((txt) => { const btn = [...document.querySelectorAll('.chal .mc .btn')].find((x) => x.textContent.includes(txt)); if (!btn) throw new Error('no option ' + txt); btn.click(); }, txt);
  await pickOpt('Sakutarō at the back on the left');
  await p.waitForSelector('.chal .st[data-res=wrong]');
  const wrong = await p.evaluate(() => ({ saku: (() => { const t = document.querySelector('.chal .st-saku'); const c = t && t.closest('.st-cell'); return c ? [+c.dataset.c, +c.dataset.r] : null; })(), say: document.querySelector('.chal .st-say').textContent }));
  assert(wrong.saku && wrong.saku[0] === 0 && wrong.saku[1] === 0, 'the wrong answer puts Sakutarō where it says (far left, back): ' + JSON.stringify(wrong));
  // the right one (after the why is shown, the options are still there)
  await p.waitForTimeout(300);
  const retry = await p.$('.chal .mc .btn:not([disabled])');
  if (!retry) { const more = await p.$('.chal [data-a=retry], .chal .again'); if (more) await more.click(); }
  await pickOpt('Sakutarō at the back on the right');
  await p.waitForSelector('.chal .st[data-res=ok]');
  const right = await p.evaluate(() => { const at = (k) => { const t = document.querySelector('.chal .st-' + k); const c = t && t.closest('.st-cell'); return c ? [+c.dataset.c, +c.dataset.r] : null; }; return { saku: at('saku'), byobu: at('byobu') }; });
  assert(right.saku && right.saku[0] === 4 && right.saku[1] === 0 && right.byobu && right.byobu[0] === 0, 'the right answer: Sakutarō back right, the screen on the left: ' + JSON.stringify(right));
  assert(errors.length === 0, 'page errors: ' + errors.join(' | '));
});

await test('the fireworks: in the Opening\'s sky; moving, or a held soft glow with reduced motion', async () => {
  for (const reduced of [false, true]) {
    const { p, errors } = await page(b, url, { viewport: { width: 1180, height: 860 } });
    await start(p, { map: 'mp.playhouse', x: 24, y: 24, comp: 'mio', reduced, flags: { mp_fest_night: true, mp_yukata: true, mp_fireworks: true, mp_fest_walked: true } });
    const amb = await p.evaluate(() => { const a = RB.render.ambientNow(); return a && a.ambient && a.ambient.weather; });
    assert(amb === 'fireworks', 'the festival night\'s sky has fireworks (got ' + amb + ')');
    const r = await p.evaluate((reduced) => {
      const v = RB.render.viewSize(), W = Math.ceil(v.w * RB.render.ART), H = Math.ceil(v.h * RB.render.ART);
      const shot = (t) => { const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'); RB.render.fireworksOn(g, t, reduced); return g.getImageData(0, 0, W, H).data; };
      const a = shot(1000), b = shot(1700);
      let diff = 0, maxA = 0;
      for (let i = 3; i < a.length; i += 4) { if (a[i] !== b[i] || a[i - 1] !== b[i - 1]) diff++; maxA = Math.max(maxA, a[i], b[i]); }
      return { diff, maxA };
    }, reduced);
    if (reduced) assert(r.diff === 0, 'reduced motion: the same glow a moment later (' + r.diff + ' pixels differ)');
    else assert(r.diff > 0, 'the blooms move');
    assert(r.maxA > 0 && r.maxA <= 160, (reduced ? 'the glow' : 'the blooms') + ' are soft (alpha at most 160 of 255; got ' + r.maxA + ')');
    assert(errors.length === 0, 'page errors: ' + errors.join(' | '));
    await p.context().close();
  }
});

await test('festival dress: the yukata on the night only, on the festival maps', async () => {
  const { p, errors } = await page(b, url, { viewport: { width: 1180, height: 860 } });
  await start(p, { map: 'mp.playhouse', x: 24, y: 20, flags: { mp_fest_night: true, mp_yukata: true } });
  const night = await p.evaluate(() => ({ on: RB.festDress.on(RB.game.s), look: RB.festDress.look({ shape: 'tunic', acc: ['bag', 'glasses'] }, 'ren') }));
  assert(night.on && night.look.shape === 'robe' && night.look.yukata && night.look.acc.join() === 'glasses', 'on the night: the robe cut, the satchel left behind, the glasses kept: ' + JSON.stringify(night));
  const after = await p.evaluate(() => { RB.game.s.flags.mb2_done = true; return RB.festDress.on(RB.game.s); });
  assert(!after, 'the next morning (the chapter over): no yukata');
  const elsewhere = await p.evaluate(async () => { delete RB.game.s.flags.mb2_done; await RB.game.transition('mb.exchange', 24, 30, 'up', { inScript: true }); return RB.festDress.on(RB.game.s); });
  assert(!elsewhere, 'away from the festival\'s maps: no yukata');
  assert(errors.length === 0, 'page errors: ' + errors.join(' | '));
});

await b.close(); srv.close();
console.log(pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
