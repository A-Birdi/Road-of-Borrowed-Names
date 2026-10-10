// A Licence for the Open Sea (expansion P11b; src/content/sea/05_licence.js), in Chromium on the built game, with
// throwaway sessions (no journey saved):
//  1. the yard and the name: the shut house by Manybridge's ferry pier opens onto Kajirō's yard in a twelve-chapter
//     journey; the naming sheet (kana tiles, a name the sign-writers refuse with the reason, take back a kana, the
//     painted preview with 丸 and the romaji, "Paint this name"); the line after names her; the sheet at phone width;
//  2. the trial round the mark: Tetsu sends you out, the buoy is on the sea map off the point, sailing through its
//     water rounds it, Saltglass's water brings her in, and Tetsu's verdict moves the quest to Ōmi's examination.
// Usage: node tests/e2e/licence.mjs [filter]
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
async function start(p, o) {
  await p.evaluate(async (o) => {
    const done = { departed: true, ch1_done: true, ch2_done: true, mb_arrived: true, mb1_done: true };
    const s = RB.game.debugStart(o.map, o.x, o.y, { comp: o.comp || 'mio', flags: Object.assign(done, o.flags || {}) });
    s.edition = 2; s.player.nameJp = 'ハル'; s.learn.kanaKnown = 'both'; s.learn.profile = o.profile || 'E';
    s.visited['mb.pier'] = true; s.visited['sg.harbor'] = true;
    s.quests.sea_licence = { stage: o.stage, done: false };
    Object.assign(s.vars, o.vars || {});
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.input = 'choice'; RB.game.settings.lightbulb = false;
    RB.game.applySettings();
    RB.world.refreshActors();
  }, o || {});
}
async function toChoice(p, ms = 6000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    if (await p.$('.choices:not(.hidden) .choice')) return p.$$eval('.choices:not(.hidden) .choice', (xs) => xs.map((x) => x.textContent));
    await p.evaluate(() => { if (RB.ui.dialogue.isOpen()) RB.ui.dialogue.advance(true); });
    await p.waitForTimeout(60);
  }
  return null;
}
const pick = (p, re) => p.locator('.choices:not(.hidden) .choice').filter({ hasText: re }).first().click();
async function until(p, fn, ms = 15000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    if (await p.evaluate(fn)) return true;
    await p.evaluate(() => { if (RB.ui.dialogue.isOpen()) RB.ui.dialogue.advance(true); });
    await p.waitForTimeout(60);
  }
  throw new Error('timed out waiting for ' + String(fn).slice(0, 120));
}
const step = async (p, key, n = 1) => { for (let i = 0; i < n; i++) { await p.keyboard.down(key); await p.waitForTimeout(170); await p.keyboard.up(key); await p.waitForTimeout(80); } };
const shots = process.env.LICENCE_SHOTS || '';

await test('the yard and the name: the door by the pier, the naming sheet, a refused name, the painted name', async () => {
  const { p, errors } = await page(b, url, { viewport: { width: 1180, height: 820 } });
  await start(p, { map: 'mb.pier', x: 33, y: 8, stage: 2, flags: { sea_f_timber: true, sea_f_sail: true }, vars: { sea_hull: 'chidori' } });
  // the door: up into the yard (the first press may only turn the traveller to face it)
  await step(p, 'ArrowUp', 2);
  await p.waitForFunction(() => RB.world.W.map && RB.world.W.map.id === 'mb.yard', null, { timeout: 15000 });
  await until(p, () => RB.game.mode() === 'world' && !RB.script.isRunning());
  const inside = await p.evaluate(() => ({ kajiro: RB.world.W.npcs.some((n) => n.id === 'sea_kajiro'), nui: RB.world.W.npcs.some((n) => n.id === 'sea_nui') }));
  assert(inside.kajiro && inside.nui, 'the yard: Kajirō and Nui: ' + JSON.stringify(inside));
  // Kajirō: the name
  await p.evaluate(() => { window.__done = false; RB.script.run('sea.kajiro_name').then(() => { window.__done = true; }); });
  await until(p, () => !!document.querySelector('.sea-namefolio .sea-k'));
  const keep = await p.$eval('[data-a=keep]', (e) => e.textContent);
  assert(/ちどり/.test(keep), 'the Chidori-maru\'s old name can be kept: ' + keep);
  assert(await p.$eval('[data-a=paint]', (e) => e.disabled), 'nothing to paint yet');
  // a name the sign-writers refuse: か then a small ゃ
  await p.click('.sea-k[data-k="か"]');
  await p.click('.sea-k[data-k="ゃ"]');
  const err = await p.$eval('.sea-name-err', (e) => e.textContent);
  assert(/small ゃ only follows/.test(err) && await p.$eval('[data-a=paint]', (e) => e.disabled), 'refused, with the reason: ' + err);
  await p.click('[data-a=back]');
  await p.click('.sea-k[data-k="も"]');
  await p.click('.sea-k[data-k="め"]');
  const bow = await p.$eval('.sea-bow', (e) => e.textContent);
  assert(/かもめ丸/.test(bow) && /Kamome-maru/.test(bow) && !(await p.$('.sea-name-err')), 'the bow shows it painted: ' + bow);
  if (shots) await p.screenshot({ path: shots + '/name_desktop.png' });
  await p.click('[data-a=paint]');
  await until(p, () => window.__done);
  const st = await p.evaluate(() => ({ named: !!RB.game.s.flags.sea_named, name: RB.game.s.sea.boat.name, q: RB.game.s.quests.sea_licence.stage, kept: RB.game.s.vars.sea_kept }));
  assert(st.named && st.name === 'かもめ' && st.q === 3 && st.kept === 0, 'named かもめ: ' + JSON.stringify(st));
  assert(!errors.length, 'no page errors: ' + errors.join(' | '));
  await p.close();
  // at phone width
  const ph = await page(b, url, { viewport: { width: 400, height: 820 } });
  await start(ph.p, { map: 'mb.yard', x: 6, y: 7, stage: 2, flags: { sea_f_timber: true, sea_f_sail: true }, vars: { sea_hull: 'pilot' } });
  await ph.p.evaluate(() => { RB.script.run('sea.kajiro_name'); });
  await until(ph.p, () => !!document.querySelector('.sea-namefolio .sea-k'));
  const fit = await ph.p.evaluate(() => ({ wide: document.documentElement.scrollWidth <= window.innerWidth + 1, keep: !!document.querySelector('[data-a=keep]'), tiles: document.querySelectorAll('.sea-k').length }));
  assert(fit.wide && !fit.keep && fit.tiles >= 70, 'the sheet fits a phone; the pilot boat has no old name to keep: ' + JSON.stringify(fit));
  if (shots) await ph.p.screenshot({ path: shots + '/name_phone.png' });
  assert(!ph.errors.length, 'no page errors: ' + ph.errors.join(' | '));
  await ph.p.close();
});

await test('the trial round the mark: out past the point, the buoy rounded, brought in, Tetsu\'s verdict', async () => {
  const { p, errors } = await page(b, url, { viewport: { width: 1180, height: 820 } });
  await start(p, { map: 'sg.harbor', x: 34, y: 30, stage: 4, flags: { mb2_done: true, sea_words: true, sea_tide: true, sea_named: true, sea_sign_ok: true } });
  await p.evaluate(() => { RB.game.s.sea = { boat: { name: 'かもめ', hull: 'pilot' } }; RB.script.run('sea.tetsu_trial'); });
  const c = await toChoice(p);
  assert(c && c.some((t) => /It's high/.test(t)), 'Tetsu asks about the tide: ' + c);
  await pick(p, /It's high/);
  await until(p, () => RB.world.W.map && RB.world.W.map.id === 'sea.coast' && RB.game.mode() === 'world' && !RB.script.isRunning());
  const buoy = await p.evaluate(() => RB.world.W.map.props.some((q) => q.p === 'sea_buoy'));
  assert(buoy, 'the buoy lies off the point');
  // out of the cove and round the mark: south, then east into its water
  await step(p, 'ArrowDown', 2);
  await step(p, 'ArrowRight', 6);
  await until(p, () => RB.game.s.vars.sea_trial === 2, 20000);
  if (shots) await p.screenshot({ path: shots + '/trial_buoy.png' });
  await until(p, () => RB.game.mode() === 'world' && !RB.script.isRunning());
  // back up into Saltglass's water
  await p.evaluate(() => { const P = RB.world.W.player; P.x = P.fx = 30; P.y = P.fy = 11; });
  await step(p, 'ArrowUp', 2);
  const dock = await toChoice(p, 10000);
  assert(dock && dock.some((t) => /Bring her in/.test(t)), 'Saltglass\'s water brings her in: ' + dock);
  await pick(p, /Bring her in/);
  await until(p, () => RB.game.s.quests.sea_licence.stage === 5, 20000);
  const w = await p.evaluate(() => ({ map: RB.world.W.map.id, done: !!RB.game.s.flags.sea_trial_done, log: RB.game.s.sea.log.length, sights: RB.game.s.sea.log[0].sights }));
  assert(w.map === 'sg.harbor' && w.done && w.log === 1 && w.sights.includes('the mark off the point'), 'ashore, the trial done and logged: ' + JSON.stringify(w));
  assert(!errors.length, 'no page errors: ' + errors.join(' | '));
  await p.close();
});

console.log('\n' + pass + ' passed, ' + fail + ' failed');
await b.close();
srv.close();
process.exit(fail ? 1 : 0);
