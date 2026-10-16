// Steamhollow, Chapter 11 of the twelve-chapter edition (expansion P13), in Chromium on the built game, with
// throwaway sessions (no journey saved):
//  1. the front desk (a procedure): the rooms board shows each room's state, the guests' needs are heard as language
//     steps, a wrong room is put right on the spot (the step stays), the man without a booking is turned away
//     politely; done, the board shows every newcomer in a room; no bare kanji;
//  2. the baths: she/he go to their bath with no question; they/them are asked once (three curtains) and keep it; the
//     comfort setting (Settings, "Bathing scenes"): Shown describes the bath, Summarised tells it in a sentence, and
//     the conversation is the same either way;
//  3. the Steam Vents: one valve at a time, the steam moving to another passage as you watch (the walls drawn and
//     solid where the steam is), a hot pool restoring a little and running cool;
//  4. the mediation: the four at the table, the ledger and the float on the record, Aki speaking into a silence, the
//     whole proposal, the end that keeps the disagreement; at phone width the sheet never scrolls sideways.
// Usage: node tests/e2e/steamhollow.mjs [filter]
import { serve, launch, page } from './lib.mjs';

const only = process.argv[2] || '';
const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
async function test(name, fn) {
  if (only && !name.includes(only)) return;
  try { await Promise.race([fn(), new Promise((_, rej) => setTimeout(() => rej(new Error('timed out after 240 s')), 240000))]); pass++; console.log('PASS ' + name); }
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
// a twelve-chapter journey in Steamhollow, Chapter 11 under way
async function start(p, o) {
  await p.evaluate((o) => {
    const done = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_done: true, cr_done: true, yn_called: true, yn_arrived: true, yn_rokubei_met: true };
    const s = RB.game.debugStart(o.map || 'yn.upper', o.x || 20, o.y || 14, { comp: o.comp === undefined ? 'suzu' : o.comp, flags: Object.assign(done, o.flags || {}) });
    s.edition = 2; s.player.nameJp = 'ハル'; s.learn.kanaKnown = 'both'; s.learn.profile = o.profile || 'E';
    if (o.pron) s.player.pronouns = o.pron;
    s.words = ['mamoru', 'mizu', 'hikari', 'kaze', 'nawa', 'iyasu', 'ishi', 'tsuchi', 'koori', 'honoo', 'suzu', 'koe'];
    s.quests.yn_main = { stage: o.stage || 2, done: false };
    s.vars = Object.assign(s.vars || {}, o.vars || {});
    Object.assign(s.inv, o.inv || {});
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.input = 'choice'; RB.game.settings.lightbulb = false;
    RB.game.settings.battleAnim = 'instant'; RB.game.settings.compPlan = 'ask';
    if (o.bath) RB.game.settings.bathScenes = o.bath;
    RB.game.applySettings();
    // the lines the dialogue shows, kept for the test (the dialogue itself runs as usual)
    window.__lines = [];
    if (!RB.ui.dialogue.__kept) {
      const say = RB.ui.dialogue.say;
      RB.ui.dialogue.say = function (l) { window.__lines.push({ who: l.who || '', jp: l.jp || '', en: l.en || '' }); return say.apply(this, arguments); };
      RB.ui.dialogue.__kept = true;
    }
  }, o || {});
}
// run a scene through the game, answering its dialogue: choices by the English of the option wanted
async function scene(p, id, pick) {
  await p.evaluate((id) => { window.__done = false; window.__menus = []; RB.script.run(id).then(() => { window.__done = true; }); }, id);
  for (let i = 0; i < 400; i++) {
    const st = await p.evaluate(() => ({ done: window.__done, open: RB.ui.dialogue.isOpen(), choice: [...document.querySelectorAll('.choices:not(.hidden) button')].map((x) => x.textContent.replace(/\s+/g, ' ')) }));
    if (st.done) return;
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
const lines = (p) => p.evaluate(() => window.__lines);
// (the cards come in groups whose data-i numbers repeat: the matched card itself is clicked)
const clickCard = async (p, re) => {
  const ok = await p.evaluate((m) => { const c = [...document.querySelectorAll('.rcard')].find((x) => !x.disabled && new RegExp(m, 'i').test(x.textContent.replace(/\s+/g, ' '))); if (c) c.click(); return !!c; }, re);
  assert(ok, 'no card matching ' + re + ': ' + await p.evaluate(() => [...document.querySelectorAll('.rcard')].map((x) => x.textContent.replace(/\s+/g, ' ').slice(0, 60)).join(' | ')));
};
// a confirmation that may or may not come
const maybeConfirm = async (p, re) => {
  for (let k = 0; k < 30; k++) {
    if (await p.evaluate(() => !!document.querySelector('.csheet .pbtn'))) {
      if (process.env.SH_DEBUG) console.log('SHEET', await p.evaluate(() => [...document.querySelectorAll('.csheet .pbtn')].map((x) => x.textContent.replace(/\s+/g, ' ')).join(' | ')));
      await p.evaluate((m) => { const xs = [...document.querySelectorAll('.csheet .pbtn')]; (xs.find((x) => new RegExp(m, 'i').test(x.textContent)) || xs[0]).click(); }, re);
      return true;
    }
    if (await p.evaluate(() => !!document.querySelector('.enc-end') || (!!document.querySelector('.enc-card') && !document.querySelector('.chal')))) return false;
    await p.waitForTimeout(100);
  }
  return false;
};
// answer the open language step correctly in choice mode
async function answer(p) {
  await p.waitForSelector('.chal');
  await p.evaluate(() => { const tab = document.querySelector('.chal-tabs .ptab[data-mode="choice"]'); if (tab) tab.click(); });
  if (await p.evaluate(() => document.querySelector('.chal').getAttribute('data-kind') === 'order')) {
    const want = await p.evaluate(() => window.__step.answer.map((x) => RB.tasks.plain(x).replace(/\s/g, '')));
    for (const piece of want) {
      const i = await p.evaluate((piece) => { const t = (el) => { const c = el.cloneNode(true); c.querySelectorAll('rt').forEach((x) => x.remove()); return c.textContent.replace(/\s/g, ''); }; return [...document.querySelectorAll('.chal .tiles .tile')].findIndex((b) => t(b) === piece); }, piece);
      assert(i >= 0, 'no piece ' + piece);
      await p.click('.chal .tiles .tile >> nth=' + i);
    }
    await p.click('.chal [data-a=submit]');
  } else {
    await p.waitForSelector('.chal .mc .btn');
    const n = await p.evaluate(() => document.querySelectorAll('.chal .mc .btn').length);
    for (let k = 0; k < n; k++) {
      await p.evaluate((k) => { const x = [...document.querySelectorAll('.chal .mc .btn')][k]; if (x && !x.disabled) x.click(); }, k);
      await p.waitForTimeout(80);
      if (await p.evaluate(() => !!document.querySelector('.fbwrap[data-fb=ok] .fb-go'))) break;
    }
  }
  await p.waitForSelector('.fbwrap[data-fb=ok] .fb-go');
  await p.click('.fbwrap[data-fb=ok] .fb-go');
}
const watchSteps = (p) => p.evaluate(() => {
  if (RB.challenge.__watched) return;
  const run = RB.challenge.runStep;
  RB.challenge.runStep = function (step) { window.__step = step; return run.apply(this, arguments); };
  RB.challenge.__watched = true;
});
const encounter = (p, id) => p.evaluate((id) => { window.__res = null; RB.game.startEncounter(id, {}).then((r) => { window.__res = r; }); }, id);
const noSideways = (p) => p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1 && document.body.scrollWidth <= window.innerWidth + 1);
async function play(p, label, comp) {
  if (process.env.SH_DEBUG) console.log('PLAY', label);
  await p.waitForSelector('.enc-card');
  const before = await p.evaluate(() => (document.querySelector('.enc-log') || {}).textContent || '');
  await clickCard(p, label);
  if (await p.evaluate(() => new Promise((r) => setTimeout(() => r(!!document.querySelector('.chal')), 400)))) await answer(p);
  // (a Wait asks first, then the companion's own move may be offered: each sheet answered in turn)
  for (let k = 0; k < 3; k++) if (!(await maybeConfirm(p, comp || 'Yes, do it|Nothing this time|^\\s*Wait'))) break;
  // the exchange played out: the record has moved on (or the encounter is over)
  await p.waitForFunction((b) => !!document.querySelector('.enc-end') || (!!document.querySelector('.enc-card') && ((document.querySelector('.enc-log') || {}).textContent || '') !== b), before, { timeout: 20000 });
}

await test('the front desk: the rooms board, the guests heard, a wrong room put right, the stranger turned away politely', async () => {
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 860 } });
  await start(p, { map: 'yn.kami', x: 6, y: 8 });
  await watchSteps(p);
  await encounter(p, 'yn.rooms');
  await p.waitForSelector('.enc-card');
  const m0 = await p.evaluate(() => (document.querySelector('.enc-machine') || {}).textContent || '');
  assert(/Step 1 of 5/.test(m0) && /Pine/.test(m0) && /Plum/.test(m0) && /booked/.test(m0), 'the board: each room and its state, step 1 of 5: ' + m0.slice(0, 300));
  assert((await bareKanji(p, '.enc-sheet')).length === 0, 'no bare kanji: ' + (await bareKanji(p, '.enc-sheet')).join(' | '));
  // a wrong room first: Pine is upstairs, and Oshige's knees are bad
  await play(p, 'Give her Pine');
  const after = await p.evaluate(() => ({ m: document.querySelector('.enc-machine').textContent, log: document.querySelector('.enc-log').textContent }));
  assert(/Step 1 of 5/.test(after.m) && /staircase|upstairs/.test(after.log), 'the wrong room put right on the spot, still step 1: ' + JSON.stringify(after).slice(0, 400));
  const ok = await p.evaluate(() => RB.content.encounters['yn.rooms'].procedure.steps.map((st) => st.actions.find((a) => a.ok).label.en));
  for (const label of ok) await play(p, label.replace(/[()]/g, '.'));
  await p.waitForSelector('.enc-end');
  const end = await p.evaluate(() => document.querySelector('.enc-end').textContent);
  assert(/Every newcomer has a room/.test(end), 'done: ' + end.slice(0, 200));
  await p.click('.enc-sheet [data-ok]');
  await p.waitForFunction(() => window.__res, null, { timeout: 10000 });
  assert(await p.evaluate(() => window.__res.outcome === 'done'), 'the procedure is done');
  assert(errors.length === 0, 'no page errors: ' + errors.join(' | '));
  await p.close();
});

await test('the baths: she/he with no question, they/them asked once and kept; the comfort setting', async () => {
  const { p, errors } = await page(b, url, { viewport: { width: 1180, height: 860 } });
  // she/her: the women's bath, nothing asked
  await start(p, { map: 'yn.kami', x: 6, y: 8, pron: 'she', comp: 'mio', flags: { yn_rooms_done: true } });
  await scene(p, 'yn.bath_side');
  let st = await p.evaluate(() => ({ side: RB.game.s.vars.bath_side, menus: window.__menus.length }));
  assert(st.side === 2 && st.menus === 0, 'she/her: the women\'s bath, with no question: ' + JSON.stringify(st));
  // they/them: asked once, three curtains; kept
  await start(p, { map: 'yn.kami', x: 6, y: 8, pron: 'they', comp: 'ren', flags: { yn_rooms_done: true } });
  await scene(p, 'yn.bath_side', 'reserved');
  st = await p.evaluate(() => ({ side: RB.game.s.vars.bath_side, menus: window.__menus }));
  assert(st.side === 3 && st.menus.length === 1 && st.menus[0].length === 3, 'they/them: the three baths offered once: ' + JSON.stringify(st));
  await scene(p, 'yn.bath_side', 'men');
  st = await p.evaluate(() => ({ side: RB.game.s.vars.bath_side, menus: window.__menus.length }));
  assert(st.side === 3 && st.menus === 0, 'and kept: not asked again: ' + JSON.stringify(st));
  // the comfort setting, in the Settings sheet
  await p.evaluate(() => RB.ui.settings.open());
  // (Settings › Play › Stories since ST-1)
  await p.waitForSelector('button[data-grp="play"]');
  await p.click('button[data-grp="play"]');
  await p.waitForSelector('input[data-set="bathScenes"]', { state: 'attached' });
  const radios = await p.$$eval('input[data-set="bathScenes"]', (xs) => xs.map((x) => ({ v: x.value, on: x.checked })));
  assert(radios.map((r) => r.v).join() === 'shown,summarised' && radios[0].on, 'Bathing scenes: Shown (the default) and Summarised: ' + JSON.stringify(radios));
  await p.click('label.opt:has(input[data-set="bathScenes"][value="summarised"])');
  await p.waitForTimeout(150);
  assert(await p.evaluate(() => RB.game.settings.bathScenes === 'summarised'), 'Summarised chosen');
  await p.evaluate(() => RB.ui.settings.close && RB.ui.settings.close());
  await p.waitForTimeout(150);
  const both = {};
  for (const view of ['summarised', 'shown']) {
    await start(p, { map: 'yn.kami_bath', x: 6, y: 8, pron: 'she', comp: 'suzu', flags: { yn_rooms_done: true }, bath: view });
    await scene(p, 'yn.bath_scene');
    const ls = await lines(p);
    both[view] = ls;
    const long = ls.some((l) => /stool at the washing place/.test(l.en)), short = ls.some((l) => /You rinse off, then soak/.test(l.en));
    assert(view === 'shown' ? long && !short : short && !long, view + ': ' + (view === 'shown' ? 'the bath described' : 'the bath in a sentence'));
  }
  const talk = (ls) => ls.filter((l) => l.who && l.who !== 'narr').map((l) => l.en).join(' / ');
  assert(talk(both.shown) === talk(both.summarised) && /Ginnojō/.test(talk(both.shown)), 'the conversation is the same either way: ' + talk(both.shown).slice(0, 200));
  assert(errors.length === 0, 'no page errors: ' + errors.join(' | '));
  await p.close();
});

await test('the Steam Vents: one valve at a time, the steam moving; a hot pool restores a little and runs cool', async () => {
  const { p, errors } = await page(b, url, { viewport: { width: 1180, height: 860 } });
  await start(p, { map: 'yn.vents1', x: 3, y: 19, comp: 'nao', flags: { yn_rooms_done: true, yn_quarrel: true, yn_vents_open: true, yn_vents1_seen: true }, stage: 5 });
  await p.evaluate(() => { RB.world.enter('yn.vents1', 3, 19, 'up'); });
  await p.waitForTimeout(300);
  // where the steam is: a wall drawn (a prop) and solid
  const walls = () => p.evaluate(() => {
    const m = RB.maps.compile('yn.vents1');
    const ws = (RB.content.maps['yn.vents1'].props || []).filter((x) => x.p === 'yn_steamwall' && (!x.if || RB.state.test(RB.game.s, x.if)));
    return ws.map((w) => w.x + ',' + w.y + (RB.maps.blockedStatic(m, w.x, w.y) ? '' : ' (open!)')).sort().join(' ');
  });
  const w0 = await walls();
  assert(w0 === '15,7 21,14', 'at first: the stair down and the tool nook are steamed over: ' + w0);
  await scene(p, 'yn.valve1');
  const w1 = await walls();
  assert(w1 === '15,7 9,10', 'the near valve: the tool nook clears and the steam fills the way to the pool: ' + w1);
  await scene(p, 'yn.handle');
  await scene(p, 'yn.valve2');
  const w2 = await p.evaluate(() => ({ v1: !!RB.game.s.flags.yn_vent1, v2: !!RB.game.s.flags.yn_vent2 }));
  assert(!w2.v1 && w2.v2, 'one valve at a time: the near one closes as the far one opens: ' + JSON.stringify(w2));
  const w3 = await walls();
  assert(w3 === '21,14 9,10', 'the far valve: the stair down clears: ' + w3);
  // the walls are drawn on the map the player sees
  const drawn = await p.evaluate(() => ((RB.world.W.map && RB.world.W.map.props) || []).filter((x) => x.p === 'yn_steamwall' && (!x.if || RB.state.test(RB.game.s, x.if))).map((x) => x.x + ',' + x.y).sort().join(' '));
  assert(drawn === '21,14 9,10', 'the steam drawn where it is: ' + drawn);
  // back to no valve open, then a hot pool
  await scene(p, 'yn.valve2');
  const res = await p.evaluate(() => { const s = RB.game.s; s.resolve.pc = 1; s.resolve.comp = 1; return { max: RB.combatLogic && RB.combatLogic.maxResolve ? RB.combatLogic.maxResolve(s) : null }; });
  await scene(p, 'yn.pool1');
  const r1 = await p.evaluate(() => ({ pc: RB.game.s.resolve.pc, comp: RB.game.s.resolve.comp, used: !!RB.game.s.flags.yn_pool1_used }));
  assert(r1.pc > 1 && r1.comp > 1 && r1.used, 'the pool restores a little and runs cool: ' + JSON.stringify(r1) + ' ' + JSON.stringify(res));
  await scene(p, 'yn.pool_cool');
  const r2 = await p.evaluate(() => ({ pc: RB.game.s.resolve.pc }));
  assert(r2.pc === r1.pc, 'a cool pool restores nothing more');
  assert(errors.length === 0, 'no page errors: ' + errors.join(' | '));
  await p.close();
});

await test('the mediation: the four at the table, the record, Aki in the silence, the end that keeps the disagreement', async () => {
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 860 } });
  await start(p, { map: 'yn.guild', x: 7, y: 6, comp: 'suzu', inv: { yn_ledger: 1 }, flags: { yn_rooms_done: true, yn_quarrel: true, yn_vents_open: true, yn_float_found: true, yn_kettle_settled: true, yn_eve_done: true }, stage: 6 });
  await watchSteps(p);
  await encounter(p, 'yn.mediation');
  await p.waitForSelector('.enc-card');
  const people = await p.evaluate(() => [...document.querySelectorAll('.enc-person')].map((x) => x.textContent.replace(/\s+/g, ' ')));
  assert(people.length === 4 && /Oritsu/.test(people[0]) && /Heated/.test(people[0]) && /Aki/.test(people[3]) && /Closed off/.test(people[3]), 'the four at the table: ' + JSON.stringify(people));
  assert((await bareKanji(p, '.enc-sheet')).length === 0, 'no bare kanji: ' + (await bareKanji(p, '.enc-sheet')).join(' | '));
  await play(p, 'speak one at a time');
  await play(p, 'read from the guild');
  await play(p, 'float you found');
  const rec = await p.evaluate(() => [...document.querySelectorAll('.enc-claim')].map((x) => x.textContent));
  assert(rec.some((x) => /later every day/.test(x)) && rec.some((x) => /silt/.test(x)), 'the ledger and the float on the record: ' + JSON.stringify(rec).slice(0, 400));
  await play(p, 'where the ridge folk');
  await play(p, '^\\s*Wait|Wait');
  const log = await p.evaluate(() => document.querySelector('.enc-log').textContent);
  assert(/just right/.test(log), 'Aki speaks into the silence, for the spring: ' + log.slice(-300));
  await play(p, 'share by the mended clock');
  await p.waitForSelector('.enc-end');
  const end = await p.evaluate(() => document.querySelector('.enc-end').textContent);
  assert(/argued once a month/.test(end), 'the best end keeps the disagreement: ' + end.slice(0, 300));
  await p.click('.enc-sheet [data-ok]');
  await p.waitForFunction(() => window.__res, null, { timeout: 10000 });
  const r = await p.evaluate(() => ({ res: window.__res.result, out: window.__res.outcome }));
  assert(r.res === 'win' && r.out === 'together', 'not a defeat: ' + JSON.stringify(r));
  assert(errors.length === 0, 'no page errors: ' + errors.join(' | '));
  await p.close();
});

await test('the mediation at phone width: never sideways', async () => {
  const { p, errors } = await page(b, url, { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await start(p, { map: 'yn.guild', x: 7, y: 6, comp: 'mio', inv: { yn_ledger: 1 }, flags: { yn_float_found: true }, stage: 6 });
  await encounter(p, 'yn.mediation');
  await p.waitForSelector('.enc-card');
  assert(await noSideways(p), 'no sideways scroll on a phone');
  assert(errors.length === 0, 'no page errors: ' + errors.join(' | '));
  await p.close();
});

console.log(pass + ' passed, ' + fail + ' failed');
await b.close();
srv.close();
process.exit(fail ? 1 : 0);
