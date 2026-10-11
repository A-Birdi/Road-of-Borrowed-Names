// The Cloudroad, Chapter 10 of the twelve-chapter edition (expansion P12), in Chromium on the built game, with
// throwaway sessions (no journey saved):
//  1. the relay sheet: who the message is for and each part of what you have of it, at the learner's profile, no bare
//     kanji, the English a tap away; "Pass it on" waits for every part; a part said with more certainty than you had
//     is marked so with the reason (and the station acts on it: the side consequence's flag), a faithful part is
//     marked faithful; nothing is marked before it is said;
//  2. the route plan (the tellings sheet as a plan): the reports side by side, each claim's vouching explained when
//     marked, the roads offered; the road the vouched report supports is the best, the long way round is accepted;
//  3. staying behind: with the companion away (the surety at the Barrier) no one follows on the road above the cloud
//     and the companion waits in the Barrier office; back, they follow again;
//  4. at phone width the relay sheet stacks and the page never scrolls sideways.
// Usage: node tests/e2e/cloudroad.mjs [filter]
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
// a twelve-chapter journey on the Cloudroad, Chapter 10 under way
async function start(p, o) {
  await p.evaluate((o) => {
    const done = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_done: true, cr_called: true, cr_st1: true, cr_st2: true, cr_st3: true };
    const s = RB.game.debugStart(o.map || 'cr.sakashita', o.x || 10, o.y || 12, { comp: o.comp === undefined ? 'ren' : o.comp, flags: Object.assign(done, o.flags || {}) });
    s.edition = 2; s.player.nameJp = 'ハル'; s.learn.kanaKnown = 'both'; s.learn.profile = o.profile || 'E';
    s.quests.cr_main = { stage: o.stage || 2, done: false };
    s.vars = Object.assign(s.vars || {}, o.vars || {});
    Object.assign(s.inv, o.inv || {});
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.input = 'choice'; RB.game.settings.lightbulb = false;
    RB.game.applySettings();
  }, o || {});
}
const click = (p, sel) => p.evaluate((sel) => { const el = document.querySelector(sel); if (!el) throw new Error('missing ' + sel); el.click(); }, sel);
const relay = (p, id) => p.evaluate((id) => { window.__relay = null; RB.hooks.relay([id]).then(() => { window.__relay = RB.game.s.vars._relay; }); }, id);
const tell = (p, id) => p.evaluate((id) => { window.__tell = null; RB.hooks.tellings([id]).then(() => { window.__tell = RB.game.s.vars._tell; }); }, id);
const got = async (p, k) => { await p.waitForFunction((k) => window[k], k); return p.evaluate((k) => window[k], k); };
const noSideways = (p) => p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);

await test('the relay sheet: each part said with the certainty you have; an overstated part is marked and acted on', async () => {
  const { p, errors } = await page(b, url, { viewport: { width: 1180, height: 860 } });
  await start(p, { profile: 'E' });
  await relay(p, 'cr.r2');
  await p.waitForSelector('.rl-sheet .rl-part');
  const parts = await p.$$eval('.rl-part', (xs) => xs.map((x) => x.dataset.p));
  assert(parts.length >= 2, 'the message comes in parts: ' + parts.join(','));
  assert((await bareKanji(p, '.rl-sheet')).length === 0, 'no bare kanji: ' + (await bareKanji(p, '.rl-sheet')).join(' | '));
  assert(await p.$eval('.rl-go', (e) => e.disabled), 'nothing to pass on until every part is said');
  assert(!(await p.$('.rl-verdict')), 'nothing is marked before it is said');
  await click(p, '.rl-showen[data-p="' + parts[0] + '"]');
  assert(await p.$('.rl-part[data-p="' + parts[0] + '"] .rl-en'), 'the English a tap away');
  // say every part faithfully but one, which is said as a fact although it was only a rumour
  const plan = await p.evaluate(() => {
    const R = RB.relay, d = R.def('cr.r2'), s = RB.game.s, out = {};
    let over = null;
    for (const pt of R.parts(d, s)) {
      const os = R.optsAt(pt, 'E');
      const o = !over && d.acts && d.acts.over && d.acts.over[pt.id] && os.find((x) => x.over);
      if (o) { over = { part: pt.id, flag: d.acts.over[pt.id] }; out[pt.id] = o.id; } else out[pt.id] = (os.find((x) => x.ok) || os[0]).id;
    }
    return { out, over };
  });
  assert(plan.over, 'the message has a part that can be overstated');
  for (const [pt, o] of Object.entries(plan.out)) await click(p, '.rl-opt[data-p="' + pt + '"][data-o="' + o + '"]');
  assert(!(await p.$eval('.rl-go', (e) => e.disabled)), 'every part said: it can be passed on');
  await click(p, '.rl-go');
  await p.waitForSelector('.rl-verdict');
  const v = await p.$$eval('.rl-part', (xs) => xs.map((x) => ({ p: x.dataset.p, tag: (x.querySelector('.rl-verdict .rl-tag') || {}).textContent || '', why: (x.querySelector('.rl-verdict') || {}).textContent || '' })));
  const ov = v.find((x) => x.p === plan.over.part);
  assert(/More than you know/.test(ov.tag) && ov.why.length > 30, 'the overstated part is marked, with the reason: ' + JSON.stringify(ov));
  assert(v.filter((x) => x.p !== plan.over.part).every((x) => /Faithful/.test(x.tag)), 'the others are faithful: ' + JSON.stringify(v));
  await click(p, '.rl-done');
  assert((await got(p, '__relay')) === 'over', 'the scene hears it was overstated');
  const st = await p.evaluate((f) => ({ flag: !!RB.game.s.flags[f], done: !!RB.game.s.flags.relay_cr_r2_done }), plan.over.flag);
  assert(st.flag && st.done, 'the station acts on it (' + plan.over.flag + '), and the message is kept as carried');
  assert(errors.length === 0, 'no page errors: ' + errors.join(' | '));
  await p.close();
});

await test('the relay sheet at phone width: stacked, never sideways', async () => {
  const { p, errors } = await page(b, url, { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await start(p, { profile: 'F' });
  await relay(p, 'cr.r1');
  await p.waitForSelector('.rl-sheet .rl-part');
  assert(await noSideways(p), 'no sideways scroll on a phone');
  const os = await p.$$eval('.rl-opt', (xs) => xs.map((x) => { const r = x.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.right)]; }));
  assert(os.every(([l, r]) => l >= 0 && r <= 391), 'every option inside the screen: ' + JSON.stringify(os));
  await click(p, '.rl-cancel');
  assert((await got(p, '__relay')) === 'cancel', '"Not yet" leaves it for later');
  assert(errors.length === 0, 'no page errors: ' + errors.join(' | '));
  await p.close();
});

await test('the route plan: the reports weighed, the vouched road is best, the long way round accepted', async () => {
  const { p, errors } = await page(b, url, { viewport: { width: 1180, height: 860 } });
  await start(p, { map: 'cr.suginoki', profile: 'E' });
  await tell(p, 'cr.plan2');
  await p.waitForSelector('.tl-sheet .tl-src');
  const srcs = await p.$$eval('.tl-sheet .tl-src', (xs) => xs.map((x) => x.dataset.s));
  assert(srcs.join(',') === 'kosuke,sada,board', 'three reports side by side: ' + srcs.join(','));
  assert((await bareKanji(p, '.tl-sheet')).length === 0, 'no bare kanji: ' + (await bareKanji(p, '.tl-sheet')).join(' | '));
  // marking the rumour as vouched for is explained, calmly
  await click(p, '.tl-claim[data-c="c2a"] .tl-mark[data-m="1"]');
  await p.waitForSelector('.tl-claim[data-c="c2a"] .tl-why');
  const why = await p.$eval('.tl-claim[data-c="c2a"] .tl-why', (e) => e.textContent);
  assert(/rumour|nobody/i.test(why), 'the rumour can\'t be vouched for, and why: ' + why);
  await click(p, '.tl-claim[data-c="c2b"] .tl-mark[data-m="1"]');
  await click(p, '.tl-opt[data-o=main]');
  await click(p, '.tl-go');
  assert((await got(p, '__tell')) === 'best', 'the stone steps, on Sada\'s word: the best road');
  await tell(p, 'cr.plan2');
  await p.waitForSelector('.tl-sheet .tl-opt');
  await click(p, '.tl-opt[data-o=old]');
  await click(p, '.tl-go');
  const t2 = await got(p, '__tell');
  assert(t2 === 'ok' || t2 === 'best', 'the old road is accepted too (the long way round): ' + t2);
  assert(errors.length === 0, 'no page errors: ' + errors.join(' | '));
  await p.close();
});

await test('staying behind: nobody follows above the cloud while the companion waits at the Barrier', async () => {
  const { p, errors } = await page(b, url, { viewport: { width: 1180, height: 860 } });
  await start(p, { map: 'cr.barrier', x: 8, y: 12, comp: 'mio', flags: { cr_st4: true, cr_st5: true, cr_st6: true }, stage: 5 });
  await p.evaluate(() => { RB.world.enter('cr.barrier', 8, 12, 'down'); });
  await p.waitForTimeout(300);
  assert(await p.evaluate(() => !!(RB.world.W.comp && RB.world.W.comp.id === 'mio')), 'Mio follows at the Barrier');
  await p.evaluate(() => { const s = RB.game.s; s.flags.cr_fetching = true; s.flags.cr_apart = true; RB.hooks.comp_away(['surety']); });
  await p.evaluate(() => { RB.world.enter('cr.above', 2, 12, 'right'); });
  await p.waitForTimeout(300);
  const above = await p.evaluate(() => ({ comp: RB.game.s.comp, follower: !!RB.world.W.comp, away: RB.state.test(RB.game.s, 'away=mio') }));
  assert(above.comp === null && !above.follower && above.away, 'above the cloud, alone: ' + JSON.stringify(above));
  await p.evaluate(() => { RB.world.enter('cr.barrier_office', 6, 6, 'up'); });
  await p.waitForTimeout(300);
  const office = await p.evaluate(() => (RB.world.W.npcs || []).map((n) => n.id));
  assert(office.includes('mio'), 'Mio waits in the Barrier office: ' + office.join(','));
  await p.evaluate(() => { const s = RB.game.s; delete s.flags.cr_fetching; delete s.flags.cr_apart; RB.hooks.comp_back(); RB.world.enter('cr.above', 2, 12, 'right'); });
  await p.waitForTimeout(300);
  assert(await p.evaluate(() => RB.game.s.comp === 'mio' && !!(RB.world.W.comp && RB.world.W.comp.id === 'mio')), 'back together, Mio follows again');
  assert(errors.length === 0, 'no page errors: ' + errors.join(' | '));
  await p.close();
});

console.log(pass + ' passed, ' + fail + ' failed');
await b.close();
srv.close();
process.exit(fail ? 1 : 0);
