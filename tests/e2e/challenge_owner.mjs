// A question sheet belongs to the journey it was opened in (CC-571; Agnes 6850477309; Local CL-796, CL-797), in the
// browser, on journeys made for the test and the stand-in save slots of a fresh context (never a real save):
//  1. positive controls, in one journey: the Hall's story question answered (recorded, chal:<id>, ok) and put off
//     (introduced only, as before); a two-step challenge answered through both steps (both recorded, ok); a forge
//     challenge answered (_forge written); a direct runStep answered (recorded, not stale);
//  2. a sheet opened in one journey and finished after another is loaded: the right choice, "I don't know", "Come back
//     later", into a journey inside an active Hall visit, a direct runStep, the first step of a two-step challenge
//     (the second never starts), a forge challenge, and the same slot loaded again. Each time the journey loaded is
//     snapshotted before the old sheet is finished (learn as a whole: items and their evidence log, stats, clock, kanji,
//     intro, exposure; the top-level meter; flags; vars; the Hall's visit and wings) and must be identical after; the
//     result is not usable ({ ok: false, cancelled: true, stale: true }); the old journey's saved record is unchanged;
//  3. no page errors.
// Usage: node tools/build.mjs && node tests/e2e/challenge_owner.mjs   (RB_PAGE=<file> for another page)
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const { p, ctx, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
const wait = (ms) => p.waitForTimeout(ms);
const Q = 'hall.w1.story_q', ITEM = 'v:聞く', TWO = 'sg.c_tidetable', FORGE = 'mb.noodle_masa';

await p.evaluate(async () => {
  RB.test.disable();
  const DONE = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_done: true, cr_done: true, yn_done: true, postgame: true, ch6_done: true, hall_ledger: true };
  const mk = (name) => { const s = RB.game.debugStart('hall.foyer', 7, 6, { edition: 2, comp: 'ren', flags: DONE, dir: 'up' }); s.learn.profile = 'E'; s.learn.kanaKnown = 'both'; s.player.name = name; return s; };
  await RB.save.writeSlot(1, mk('Owner A'), { force: true });
  await RB.save.writeSlot(2, mk('Owner B'), { force: true });
  mk('Owner C');
  await RB.ui.hall.goIn('w2');
  await new Promise((r) => setTimeout(r, 800));
  await RB.save.writeSlot(3, RB.game.s, { force: true });
  window.__load = async (slot) => { await RB.game.loadCampaign(slot, 'manual'); Object.assign(RB.game.settings, { textSpeed: 'instant', input: 'choice' }); RB.game.applySettings(); await new Promise((r) => setTimeout(r, 500)); };
  // what a journey holds that an answer could touch (playtime aside)
  window.__snap = () => { const s = RB.game.s; return JSON.stringify({ learn: s.learn, meter: s.meter, flags: s.flags, vars: s.vars, hall: s.hall || null }); };
  window.__saved = async (slot) => JSON.stringify((await RB.save.read(slot, 'manual')).state.learn) + JSON.stringify((await RB.save.read(slot, 'manual')).state.flags);
  window.__open = (how, id) => {
    window.__res = undefined;
    const then = (v) => { window.__res = v; };
    if (how === 'run') RB.challenge.run(id, { scene: 'test' }).then(then);
    else RB.challenge.runStep(RB.tasks.stepsOf(RB.content.challenges[id])[0], { ctxTag: 'test', cancelLabel: 'Come back later' }).then(then);
  };
  window.__sheet = () => !!document.querySelector('.chal');
  // finish the sheet on screen: 'right' | 'reveal' | 'leave'
  window.__finish = async (how) => {
    const chal = document.querySelector('.chal');
    if (!chal) return 'no sheet';
    if (how === 'leave') chal.querySelector('[data-a=leave]').click();
    else if (how === 'reveal') chal.querySelector('[data-a=reveal]').click();
    else {
      const st = RB.challenge.current(), right = st.options.find((o) => o.ok);
      const btn = [...chal.querySelectorAll('.mc .choice')].find((x) => ((x.querySelector('.enline') || x).textContent || '').trim() === right.en);
      if (!btn) return 'no right button';
      btn.click();
    }
    await new Promise((r) => setTimeout(r, 400));
    const c = [...document.querySelectorAll('.chal .fbwrap button')].find((x) => /Continue/.test(x.textContent));
    if (c) c.click();
    await new Promise((r) => setTimeout(r, 600));
    return 'done';
  };
});
const settle = async () => { for (let i = 0; i < 30 && (await p.evaluate(() => window.__res === undefined && !window.__sheet())); i++) await wait(100); };
const res = () => p.evaluate(() => window.__res === undefined ? 'pending' : window.__res);
const flat = (x) => JSON.stringify(x);
const stale = (r) => r && r !== 'pending' && r.ok === false && r.cancelled === true && r.stale === true;

// ---- 1. positive controls, in one journey ----------------------------------------------------------------------------
await p.evaluate(() => window.__load(1));
await p.evaluate((Q) => window.__open('run', Q), Q); await wait(700);
await p.evaluate(() => window.__finish('right')); await settle();
let r = await res(), got = await p.evaluate(([Q, ITEM]) => ({ item: !!RB.game.s.learn.items[ITEM], flag: !!RB.game.s.flags['chal:' + Q] }), [Q, ITEM]);
ok(r && r.ok === true && !r.stale && got.item && got.flag, '1 one journey, the right choice: recorded, chal:' + Q + ', ok ' + flat({ r, got }));

await p.evaluate(() => window.__load(1));
await p.evaluate((Q) => window.__open('run', Q), Q); await wait(700);
await p.evaluate(() => window.__finish('leave')); await settle();
r = await res(); got = await p.evaluate((ITEM) => ({ item: !!RB.game.s.learn.items[ITEM], intro: JSON.stringify(RB.game.s.learn.intro || {}).includes(ITEM) }), ITEM);
ok(r && r.ok === false && r.cancelled === true && !r.stale && !got.item && got.intro, '1 one journey, "Come back later": not recorded, introduced, as before ' + flat({ r, got }));

await p.evaluate(() => window.__load(1));
await p.evaluate((TWO) => window.__open('run', TWO), TWO); await wait(700);
await p.evaluate(() => window.__finish('reveal')); await wait(700);
const second = await p.evaluate(() => window.__sheet());
await p.evaluate(() => window.__finish('reveal')); await settle();
r = await res(); got = await p.evaluate((TWO) => ({ items: RB.tasks.stepsOf(RB.content.challenges[TWO]).map((st) => !!RB.game.s.learn.items[[].concat(st.item)[0]]), flag: !!RB.game.s.flags['chal:' + TWO] }), TWO);
ok(second && r && r.ok === true && r.results && r.results.length === 2 && got.items.every(Boolean) && got.flag, '1 one journey, a two-step challenge: the second step follows; both recorded; ok ' + flat({ second, ok: r && r.ok, got }));

await p.evaluate(() => window.__load(1));
await p.evaluate((FORGE) => { RB.game.s.vars._forge = 'unset'; window.__open('run', FORGE); }, FORGE); await wait(700);
await p.evaluate(() => window.__finish('reveal')); await settle();
r = await res(); got = await p.evaluate(() => RB.game.s.vars._forge);
ok(r && r.ok === true && got !== 'unset', '1 one journey, a forge challenge: _forge written (' + flat(got) + '), ok');

await p.evaluate(() => window.__load(1));
await p.evaluate((Q) => window.__open('step', Q), Q); await wait(700);
await p.evaluate(() => window.__finish('reveal')); await settle();
r = await res(); got = await p.evaluate((ITEM) => !!RB.game.s.learn.items[ITEM], ITEM);
ok(r && r !== 'pending' && !r.cancelled && !r.stale && got, '1 one journey, a direct runStep, "I don\'t know": recorded, not stale ' + flat({ cancelled: r && r.cancelled, stale: r && r.stale, got }));

// ---- 2. a sheet finished after another journey is loaded ------------------------------------------------------------
async function staleCase(name, o) {
  await p.evaluate(() => window.__load(1));
  await p.evaluate(([how, id]) => window.__open(how, id), [o.how, o.id]); await wait(700);
  const open = await p.evaluate(() => window.__sheet());
  await p.evaluate((slot) => window.__load(slot), o.into);
  const savedA = await p.evaluate(() => window.__saved(1));
  const before = await p.evaluate(() => window.__snap());
  const into = await p.evaluate(() => ({ name: RB.game.s.player.name, visit: !!(RB.game.s.hall && RB.game.s.hall.visit), help: RB.game.s.hall && RB.game.s.hall.visit ? RB.game.s.hall.visit.help : null }));
  await p.evaluate((f) => window.__finish(f), o.finish);
  await wait(900);
  const after = await p.evaluate(() => window.__snap());
  const r = await res();
  const left = await p.evaluate(() => window.__sheet());
  const savedA2 = await p.evaluate(() => window.__saved(1));
  const help2 = await p.evaluate(() => (RB.game.s.hall && RB.game.s.hall.visit ? RB.game.s.hall.visit.help : null));
  ok(open && before === after && stale(r) && !left && savedA === savedA2 && (!o.visit || (into.visit && flat(into.help) === flat(help2))),
    '2 ' + name + ': the journey loaded (' + into.name + (into.visit ? ', in a Hall visit' : '') + ') exactly as before; the result not usable; no sheet left; the old journey\'s saved record unchanged '
      + flat({ open, same: before === after, r, left, savedSame: savedA === savedA2, help: o.visit ? [into.help, help2] : undefined }) + (before === after ? '' : ' DIFF ' + diff(before, after)));
}
function diff(a, b) {
  const x = JSON.parse(a), y = JSON.parse(b), out = [];
  const walk = (u, v, path) => {
    if (JSON.stringify(u) === JSON.stringify(v)) return;
    if (u && v && typeof u === 'object' && typeof v === 'object') { for (const k of new Set([...Object.keys(u), ...Object.keys(v)])) walk(u[k], v[k], path + '.' + k); return; }
    out.push(path + ': ' + JSON.stringify(u) + ' -> ' + JSON.stringify(v));
  };
  walk(x, y, '');
  return out.slice(0, 8).join(' | ');
}
await staleCase('the Hall\'s question, the right choice', { how: 'run', id: Q, finish: 'right', into: 2 });
await staleCase('the Hall\'s question, "I don\'t know"', { how: 'run', id: Q, finish: 'reveal', into: 2 });
await staleCase('the Hall\'s question, "Come back later"', { how: 'run', id: Q, finish: 'leave', into: 2 });
await staleCase('the Hall\'s question, "I don\'t know", into a journey inside a Hall visit (its help and answer counts)', { how: 'run', id: Q, finish: 'reveal', into: 3, visit: true });
await staleCase('a direct runStep, "I don\'t know"', { how: 'step', id: Q, finish: 'reveal', into: 2 });
await staleCase('a direct runStep, the right choice', { how: 'step', id: Q, finish: 'right', into: 2 });
await staleCase('a two-step challenge, its first step answered: the second never starts', { how: 'run', id: TWO, finish: 'reveal', into: 2 });
await staleCase('a forge challenge, answered: no _forge', { how: 'run', id: FORGE, finish: 'reveal', into: 2 });
await staleCase('the same slot loaded again (a new journey object)', { how: 'run', id: Q, finish: 'reveal', into: 1 });

ok(!errors.length, '3 no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
await ctx.close(); await b.close(); srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
