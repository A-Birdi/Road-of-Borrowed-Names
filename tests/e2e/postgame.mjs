// The postgame's old guardians and Ashihara Shinden in Chromium on the built game (expansion P15e–f), with throwaway
// sessions (a fresh browser context each; slot 4 of that context only, never a player's saves):
//  1. a guardian: its shrine on the map only after the story; waking it, "Not now" (nothing happens), facing it (the
//     encounter screen, the guardian named) and stepping back (the meeting counted, nothing given); the stamp book's
//     honest record of a win, under a heading with furigana;
//  2. the settlement: the way in off the Lantern Road after the story; arriving; the three ways named in the real
//     language-task screen (the name chosen goes on its signpost); the school that grows there, drawn and in the way
//     once it stands; no page errors.
// Usage: node tests/e2e/postgame.mjs [filter]   (screenshots: POSTGAME_SHOTS=<dir> to keep them)
import { serve, launch, page } from './lib.mjs';

const only = process.argv[2] || '';
const shots = process.env.POSTGAME_SHOTS || '';
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
// a twelve-chapter journey after the story, standing on `map`
async function start(p, map, x, y, o) {
  o = o || {};
  await p.evaluate(([map, x, y, o]) => {
    const done = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_done: true, cr_done: true, yn_done: true, ch6_done: true, postgame: true, ngp_offered: true, as_arrived: !!o.arrived };
    if (o.story) for (const k of ['ch6_done', 'postgame']) delete done[k];
    const s = RB.game.debugStart(map, x, y, { comp: o.comp === undefined ? 'mio' : o.comp, flags: done });
    s.edition = 2; s.player.nameJp = 'ハル'; s.learn.kanaKnown = 'both'; s.learn.profile = o.profile || 'E';
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.input = 'choice'; RB.game.settings.lightbulb = false;
    RB.game.applySettings();
    RB.save.setCurrent(4, 0);
  }, [map, x, y, o]);
}
// a scene through the game: dialogue advanced, replies chosen by their text, language tasks answered in choice mode,
// confirm sheets answered by their button text; onBattle is called once the encounter screen is up
async function scene(p, id, o) {
  o = o || {};
  await p.evaluate((id) => { window.__done = false; RB.script.run(id).then(() => { window.__done = true; }); }, id);
  let st = null;
  for (let i = 0; i < 700; i++) {
    st = await p.evaluate(() => ({
      done: window.__done, open: RB.ui.dialogue.isOpen(), chal: !!document.querySelector('.chal'), ok: !!document.querySelector('.fbwrap[data-fb=ok] .fb-go'),
      choices: [...document.querySelectorAll('button.choice')].filter((x) => x.getClientRects().length && !x.closest('.chal')).map((x) => x.textContent.trim()),
      sheet: [...document.querySelectorAll('.csheet .foot button')].map((x) => x.textContent.trim()),
      battle: !!document.querySelector('[data-flee]'), mode: RB.game.mode(), line: (RB.ui.dialogue.shown() || {}).en || '',
      btns: [...document.querySelectorAll('button')].filter((x) => x.getClientRects().length).map((x) => x.textContent.trim().slice(0, 30)).slice(0, 20),
    }));
    if (st.done) return;
    if (st.battle && o.onBattle) { const f = o.onBattle; o.onBattle = null; await f(); continue; }
    if (st.ok) { await p.click('.fbwrap[data-fb=ok] .fb-go'); continue; }
    if (st.sheet.length) {
      const k = o.sheet ? st.sheet.findIndex((t) => new RegExp(o.sheet, 'i').test(t)) : st.sheet.length - 1;
      await p.evaluate((k) => document.querySelectorAll('.csheet .foot button')[k].click(), k < 0 ? st.sheet.length - 1 : k);
      continue;
    }
    if (st.choices.length) {
      const k = o.choice ? st.choices.findIndex((t) => new RegExp(o.choice, 'i').test(t)) : 0;
      await p.evaluate((k) => [...document.querySelectorAll('button.choice')].filter((x) => x.getClientRects().length && !x.closest('.chal'))[k].click(), k < 0 ? 0 : k);
      await p.waitForTimeout(120);
      continue;
    }
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
    if (st.open) await p.evaluate(() => RB.ui.dialogue.advance(true));
    await p.waitForTimeout(40);
  }
  throw new Error('scene ' + id + ' did not finish: ' + JSON.stringify(st));
}
const propsAt = (p, kind) => p.evaluate((kind) => RB.world.W.map.props.filter((q) => q.p === kind && (!q.if || RB.state.test(RB.game.s, q.if))).map((q) => q.x + ',' + q.y).sort().join(' '), kind);

await test('a guardian: the shrine after the story; waking, not now, facing it and stepping back; the stamp book\'s honest record', async () => {
  const { p, errors } = await page(b, url, { viewport: { width: 1180, height: 820 } });
  await start(p, 'rw.mill0', 12, 8, { story: true });
  assert(!(await propsAt(p, 'kr_stele')).includes('13,7'), 'during the story there is no shrine in the mill');
  await start(p, 'rw.mill0', 12, 8);
  assert((await propsAt(p, 'kr_stele')).includes('13,7'), 'after the story the founder\'s shrine stands by the mill\'s old post');
  if (shots) await p.screenshot({ path: shots + '/guardian_shrine.png' });
  await scene(p, 'gd.rw', { choice: 'Not now' });
  const a = await p.evaluate(() => ({ met: !!RB.game.s.flags.gd_rw_met, n: RB.game.s.vars.gd_rw_n || 0, won: !!RB.game.s.flags['gd.rw'] }));
  assert(a.met && a.n === 0 && !a.won, 'woken, and "Not now" costs nothing: ' + JSON.stringify(a));
  let named = null;
  await scene(p, 'gd.rw', { choice: 'Face it', sheet: 'Step back', onBattle: async () => {
    named = await p.evaluate(() => document.body.textContent.includes('Founder') || document.body.textContent.includes('初代'));
    if (shots) await p.screenshot({ path: shots + '/guardian_battle.png' });
    await p.evaluate(() => document.querySelector('[data-flee]').click());
  } });
  await p.waitForTimeout(600);
  const c = await p.evaluate(() => ({ n: RB.game.s.vars.gd_rw_n || 0, won: !!RB.game.s.flags['gd.rw'], keep: RB.game.s.inv.gd_rw_keepsake || 0, mode: RB.game.mode() }));
  assert(named, 'the encounter screen names the Founder\'s Voice');
  assert(c.n === 1 && !c.won && !c.keep && c.mode === 'world', 'stepping back: the meeting counted, nothing given, back on the map: ' + JSON.stringify(c));
  // a later win (as the scene's hook records it), and the stamp book
  await p.evaluate(() => { RB.game.s.vars.gd_rw_n = 2; RB.hooks.guardian_won(['rw']); RB.ui.menu.open('stamps'); });
  await p.waitForSelector('.rb-stamps', { timeout: 8000 });
  const book = await p.evaluate(() => {
    const h = [...document.querySelectorAll('h4.rb-fam')].find((x) => /Old guardians/.test(x.textContent));
    const li = document.querySelector('.rb-st[data-stamp="gd.rw"]');
    return { heading: !!h, rt: h ? h.querySelectorAll('rt').length : 0, note: li ? li.textContent.replace(/\s+/g, ' ') : '' };
  });
  assert(book.heading && book.rt > 0, 'the stamp book has an "Old guardians" heading, with furigana: ' + JSON.stringify(book));
  assert(/Settled on your second meeting, on Standard\./.test(book.note), 'the founder\'s stamp carries the honest record: ' + book.note.slice(0, 200));
  const bare = await bareKanji(p, '.rb-stamps');
  assert(bare.length === 0, 'no bare kanji in the stamp book: ' + JSON.stringify(bare.slice(0, 5)));
  await p.evaluate(() => document.querySelector('.rb-st[data-stamp="gd.rw"]').scrollIntoView({ block: 'center' }));
  if (shots) await p.screenshot({ path: shots + '/guardian_stamp.png' });
  assert(errors.length === 0, 'no page errors: ' + errors.join(' | '));
  await p.close();
});

await test('the settlement: the way in after the story; arriving; the three ways named; the school that grows', async () => {
  const { p, errors } = await page(b, url, { viewport: { width: 1180, height: 820 } });
  await start(p, 'rw.road', 28, 4, { story: true });
  assert(await p.evaluate(() => !RB.maps.exitAt(RB.world.W.map, 31, 3) || !RB.state.test(RB.game.s, RB.maps.exitAt(RB.world.W.map, 31, 3).if)), 'during the story the Lantern Road has no path to the settlement');
  await start(p, 'rw.road', 28, 4);
  assert(await p.evaluate(() => { const e = RB.maps.exitAt(RB.world.W.map, 31, 3); return !!e && e.to === 'as.village' && RB.state.test(RB.game.s, e.if); }), 'after the story a path leads off the Lantern Road\'s north-east corner to Ashihara Shinden');
  await start(p, 'as.village', 2, 10);
  await scene(p, 'as.first');
  const q = await p.evaluate(() => ({ arrived: !!RB.game.s.flags.as_arrived, q: RB.game.s.quests.as_main }));
  assert(q.arrived && q.q && q.q.stage === 0, 'arriving: the village asks for names: ' + JSON.stringify(q));
  if (shots) await p.screenshot({ path: shots + '/settle_arrival.png' });
  for (const k of ['main', 'canal', 'hill']) await scene(p, 'as.way_' + k);
  const n = await p.evaluate(() => ({ v: ['main', 'canal', 'hill'].map((k) => RB.game.s.vars['as_way_' + k]), streets: !!RB.game.s.flags.as_streets, kotoe: !!RB.game.s.flags.as_kotoe }));
  assert(n.v.every((x) => typeof x === 'string' && x) && n.streets && n.kotoe, 'all three named in the language-task screen, and the teacher is coming: ' + JSON.stringify(n));
  assert((await propsAt(p, 'sign')).split(' ').length >= 3 && (await propsAt(p, 'mailbox')) === '6,9', 'their signposts, and a post box');
  const school = await p.evaluate(() => ({ blocked: RB.maps.blockedStatic(RB.world.W.map, 4, 14), drawn: RB.world.W.map.structs.some((x) => x.grow && x.if === 'as_kotoe' && RB.state.test(RB.game.s, x.if)) }));
  assert(school.blocked && school.drawn, 'the school stands, and is in the way where it stands: ' + JSON.stringify(school));
  await p.waitForTimeout(400);
  if (shots) await p.screenshot({ path: shots + '/settle_named.png' });
  assert(errors.length === 0, 'no page errors: ' + errors.join(' | '));
  await p.close();
});

console.log(pass + ' passed, ' + fail + ' failed');
await b.close();
srv.close();
process.exit(fail ? 1 : 0);
