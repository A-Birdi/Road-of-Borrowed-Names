// The last chapter in a twelve-chapter journey (expansion P14), in Chromium on the built game, with throwaway sessions
// (no journey saved):
//  1. the drained approach: at the Archive's gate the world canvas is far greyer before the Hush is settled than after,
//     and a six-chapter journey's gate is as it was; the dialogue box keeps its colour (the grade is the world's only);
//  2. the hushed voice: the companion's line is silence, their name is chosen among look-alikes in the reading step,
//     and their own voice comes back;
//  3. the ending: the companion's arc ending and, with a close bond, the romance moment answered as the player chooses;
//  4. the New Game+ farewell: the companion's unfinished work, the road folding back, the memories said to come along.
// Usage: node tests/e2e/archive12.mjs [filter]
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
async function start(p, o) {
  await p.evaluate((o) => {
    const done = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_done: true, cr_done: true, yn_done: true, sa_arrived: true };
    const s = RB.game.debugStart(o.map || 'sa.gate', o.x || 14, o.y || 19, { comp: o.comp === undefined ? 'suzu' : o.comp, flags: Object.assign(done, o.flags || {}) });
    s.edition = o.edition || 2; s.player.nameJp = 'ハル'; s.learn.kanaKnown = 'both'; s.learn.profile = o.profile || 'E';
    if (o.seen) for (const k of o.seen) s.seen[k] = true;
    if (o.bond != null) s.company.bond = { test: o.bond };
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.input = 'choice'; RB.game.settings.lightbulb = false;
    RB.game.applySettings();
    window.__lines = [];
    if (!RB.ui.dialogue.__kept) {
      const say = RB.ui.dialogue.say;
      RB.ui.dialogue.say = function (l) { window.__lines.push({ who: l.who || '', jp: l.jp || '', en: l.en || '' }); return say.apply(this, arguments); };
      RB.ui.dialogue.__kept = true;
    }
  }, o || {});
}
// a scene through the game: dialogue advanced, a choice by its English, a reading step answered in choice mode
async function scene(p, id, pick) {
  await p.evaluate((id) => { window.__done = false; window.__menus = []; window.__lines = []; RB.script.run(id).then(() => { window.__done = true; }); }, id);
  for (let i = 0; i < 600; i++) {
    const st = await p.evaluate(() => ({ done: window.__done, open: RB.ui.dialogue.isOpen(), chal: !!document.querySelector('.chal'), ok: !!document.querySelector('.fbwrap[data-fb=ok] .fb-go'), choice: [...document.querySelectorAll('.choices:not(.hidden) button')].map((x) => x.textContent.replace(/\s+/g, ' ')) }));
    if (st.done) return;
    if (st.ok) { await p.click('.fbwrap[data-fb=ok] .fb-go'); continue; }
    if (st.chal) {
      await p.evaluate(() => { const tab = document.querySelector('.chal-tabs .ptab[data-mode="choice"]'); if (tab) tab.click(); });
      const n = await p.evaluate(() => document.querySelectorAll('.chal .mc .btn').length);
      for (let k = 0; k < n; k++) {
        await p.evaluate((k) => { const x = [...document.querySelectorAll('.chal .mc .btn')][k]; if (x && !x.disabled) x.click(); }, k);
        await p.waitForTimeout(80);
        if (await p.evaluate(() => !!document.querySelector('.fbwrap[data-fb=ok] .fb-go'))) break;
      }
      continue;
    }
    if (st.choice.length) {
      await p.evaluate((ch) => { window.__menus.push(ch); }, st.choice);
      let k = 0;
      if (pick) { k = st.choice.findIndex((t) => new RegExp(pick, 'i').test(t)); if (k < 0) k = 0; }
      await p.evaluate((k) => document.querySelectorAll('.choices:not(.hidden) button')[k].click(), k);
    } else if (st.open) await p.evaluate(() => RB.ui.dialogue.advance(true));
    await p.waitForTimeout(40);
  }
  throw new Error('scene ' + id + ' did not finish');
}
// mean saturation of the world canvas (HSL), sampled on a grid
const saturation = (p) => p.evaluate(() => {
  const cv = [...document.querySelectorAll('canvas')].sort((a, b) => b.width * b.height - a.width * a.height)[0];
  const g = cv.getContext('2d'), d = g.getImageData(0, 0, cv.width, cv.height).data;
  let sum = 0, n = 0;
  for (let y = 0; y < cv.height; y += 8) for (let x = 0; x < cv.width; x += 8) {
    const i = (y * cv.width + x) * 4, r = d[i] / 255, gg = d[i + 1] / 255, bb = d[i + 2] / 255;
    const mx = Math.max(r, gg, bb), mn = Math.min(r, gg, bb), l = (mx + mn) / 2;
    sum += mx === mn ? 0 : (l > 0.5 ? (mx - mn) / (2 - mx - mn) : (mx - mn) / (mx + mn)); n++;
  }
  return sum / n;
});

await test('the drained approach: the gate far greyer before the Hush is settled; six-chapter journeys unchanged', async () => {
  const { p, errors } = await page(b, url, { viewport: { width: 1180, height: 820 } });
  const at = async (o) => { await start(p, Object.assign({ seen: ['sa.gate_first'], flags: { sa2_voice_back: true } }, o)); await p.evaluate(() => { RB.world.enter('sa.gate', 14, 19, 'up'); }); await p.waitForTimeout(700); return saturation(p); };
  const drained = await at({});
  const settled = await at({ flags: { sa2_voice_back: true, sa_hush_down: true } });
  const six = await at({ edition: 1 });
  assert(drained < six * 0.75, 'the gate, twelve-chapter journey before the Hush is settled: greyer than a six-chapter journey\'s (' + drained.toFixed(3) + ' vs ' + six.toFixed(3) + ')');
  assert(settled > drained * 1.2, 'once settled, the colour is back (' + settled.toFixed(3) + ' vs ' + drained.toFixed(3) + ')');
  const ambient = await p.evaluate(() => { const s = RB.game.s; s.edition = 2; delete s.flags.sa_hush_down; return RB.content.maps['sa.gate'].ambient.drain; });
  assert(ambient > 0.3, 'the gate\'s drain level is set: ' + ambient);
  assert(errors.length === 0, 'no page errors: ' + errors.join(' | '));
  await p.close();
});

await test('the hushed voice: silence, the name chosen among look-alikes, the voice back', async () => {
  const { p, errors } = await page(b, url, { viewport: { width: 1180, height: 820 } });
  await start(p, { comp: 'mio', seen: ['sa.gate_first'] });
  await p.evaluate(() => { RB.world.enter('sa.gate', 14, 19, 'up'); });
  await p.waitForTimeout(300);
  await scene(p, 'sa2.hushed');
  const ls = await p.evaluate(() => window.__lines);
  assert(ls.some((l) => l.who === 'mio' && l.jp === '……') && ls.some((l) => /No voice comes/.test(l.en)), 'her line is silence: ' + JSON.stringify(ls.slice(0, 4)));
  assert(ls.some((l) => l.who === 'mio' && /voice comes back/.test(l.en)) && await p.evaluate(() => !!RB.game.s.flags.sa2_voice_back), 'her own voice again, and it is remembered');
  assert(errors.length === 0, 'no page errors: ' + errors.join(' | '));
  await p.close();
});

await test('the ending: the arc\'s ending, then the romance moment answered as chosen', async () => {
  const { p, errors } = await page(b, url, { viewport: { width: 1180, height: 820 } });
  await start(p, { map: 'rw.village', x: 22, y: 30, comp: 'suzu', bond: 8, flags: { yn_suzu_books: true } });
  await scene(p, 'end.suzu.c', 'Hold hands');
  const r = await p.evaluate(() => ({ lines: window.__lines.map((l) => l.en), menus: window.__menus }));
  assert(r.lines.some((x) => /letter from Koume/.test(x)) && r.lines.some((x) => /my partner/.test(x)), 'Suzu\'s arc ending: Koume\'s letter, the opening night, her partner');
  assert(r.menus.some((m) => m.length === 3 && m.some((x) => /A kiss/.test(x))) && r.lines.some((x) => /hold hands until the sun/.test(x)), 'the moment offered three ways, and the hands held: ' + JSON.stringify(r.menus));
  assert(errors.length === 0, 'no page errors: ' + errors.join(' | '));
  await p.close();
});

await test('the New Game+ farewell: unfinished work, the road folding back, the memories', async () => {
  const { p, errors } = await page(b, url, { viewport: { width: 1180, height: 820 } });
  await start(p, { map: 'rw.village', x: 22, y: 30, comp: 'ren' });
  await p.evaluate(() => { window.__fw = false; const from = JSON.parse(JSON.stringify(RB.game.s)); window.__lines = []; RB.ui.ngplus.farewell(from).then(() => { window.__fw = true; }); });
  for (let i = 0; i < 200 && !(await p.evaluate(() => window.__fw)); i++) { await p.evaluate(() => RB.ui.dialogue.isOpen() && RB.ui.dialogue.advance(true)); await p.waitForTimeout(40); }
  const ls = await p.evaluate(() => window.__lines);
  assert(ls.filter((l) => l.who === 'ren').length === 4 && ls.some((l) => /lamps whose names/.test(l.en)), 'Ren\'s four lines, their unfinished work named');
  assert(ls.some((l) => /folds back on itself/.test(l.en)) && ls.some((l) => /come with you/.test(l.en)), 'the road folds back; the memories come along');
  assert(errors.length === 0, 'no page errors: ' + errors.join(' | '));
  await p.close();
});

console.log(pass + ' passed, ' + fail + ' failed');
await b.close();
srv.close();
process.exit(fail ? 1 : 0);
