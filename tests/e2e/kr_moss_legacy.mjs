// The Moss Lantern's legacy repair (Agnes 6581849812, 6584263954; Local CL-652; Cloud CC-489). In Chromium on the built
// game, with synthetic journeys saved and loaded through the game's own save (never a real save): a save holding the
// Moss's stored defeat with its name never called (foe:kr.steps:moss1 without kr_moss1_named), as the old knots-only win
// left it:
//  1. a manual save made on the Cedar Steps, loaded: the Moss at (14, 9) again and no lantern; spoken to, its last knot
//     freed by your Unravel brings no win, and its name does: kr_moss1_named and its defeat stored, the Moss gone and
//     the lit lantern there; after a save and load, the same;
//  2. an autosave, loaded: the Moss there and no lantern;
//  3. a save made on the ridge, loaded, then up to the Cedar Steps: the Moss there and no lantern;
//  4. a save made standing on the Moss's own tile (14, 9), loaded: the Moss placed there, and nothing starts by itself
//     (no battle, the steps still yours to walk); a step off and back to face it: spoken to, its name wins;
//  5. a save already named and beaten, loaded: as it was (the lit lantern, no Moss);
//  no page errors (console errors included).
// Usage: node tools/build.mjs && node tests/e2e/kr_moss_legacy.mjs
import { serve, launch, page, companionTurn } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const flat = (x) => JSON.stringify(x);
const KEY = 'foe:kr.steps:moss1';
const NAME = 'Call it by its name';

// a throwaway journey on the Keepers' Road, saved through the game's own save with the flags given, then loaded
async function saved(p, o) {
  return p.evaluate(async (o) => {
    const f = { departed: true, ch1_done: true, ch2_done: true };
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) f['enter:' + m + ':' + ev.scene] = true;
    Object.assign(f, o.flags);
    const s = RB.game.debugStart(o.map, o.x, o.y, { comp: 'mio', flags: f, dir: o.dir || 'up', edition: 2 });
    s.quests.lf_nao = { stage: 9, done: true, t: 1 };
    RB.game.settings.textSpeed = 'instant';
    RB.game.applySettings();
    RB.challenge.runStep = async () => ({ ok: true, firstTry: true, mistakes: 0, assisted: false, mode: 'choice' });
    await RB.save.manualSave(1);
    if (o.auto) await RB.save.autosave();
    await RB.game.loadCampaign(1, o.auto ? 'auto' : 'manual');
    return true;
  }, o);
}
const watch = (p) => p.evaluate(() => {
  // the Moss with only its last knot left, and the battle's sequences kept for the test
  const begin = RB.encounter.begin;
  RB.encounter.begin = function (def) { const st = begin.apply(this, arguments); const id = typeof def === 'string' ? def : def && def.id; if (id === 'kr.moss_steps') st.foes[0].knots = 1; return st; };
  window.__seq = []; const run = RB.battleSeq.run; RB.battleSeq.run = function (kind) { window.__seq.push(kind); return run.apply(this, arguments); };
});
const marks = (p) => p.evaluate(() => {
  const W = RB.world.W, st = RB.game.s;
  const lit = (W.map.props || []).some((q) => q.p === 'kr_toro' && q.x === 14 && q.y === 9 && (!q.if || RB.state.test(st, q.if)));
  const moss = (W.foes || []).find((f) => f.def && f.def.id === 'moss1');
  return { map: st.map, mode: RB.game.mode(), named: !!st.flags.kr_moss1_named, beaten: !!st.flags['foe:kr.steps:moss1'], moss: moss ? [moss.x, moss.y] : null, lit, at: [W.player.x, W.player.y], battle: !!RB.combat.state() };
});
// back to the response cards (dialogue advanced), or the battle over and the steps back
async function ready(p) {
  for (let i = 0; i < 900; i++) {
    const s = await p.evaluate(() => ({ over: RB.game.mode() === 'world' && window.__seq.includes('finish'), dlg: RB.ui.dialogue.isOpen(), cards: RB.game.mode() === 'combat' && !!document.querySelector('.rcard[data-i]') && !document.querySelector('.ccard') && !document.querySelector('.confirm-scrim') && !RB.battleSeq.busy() }));
    if (s.over) return 'over';
    if (s.cards) { await p.waitForTimeout(150); return 'cards'; }
    if (s.dlg) { await p.evaluate(() => RB.ui.dialogue.advance(true)); await p.waitForTimeout(40); continue; }
    await p.waitForTimeout(50);
  }
  throw new Error('the battle did not come back to its cards');
}
const cardsShown = (p) => p.evaluate(() => [...document.querySelectorAll('.rcard[data-i]')].map((x) => x.textContent.replace(/\s+/g, ' ')));
async function exchange(p, words) {
  const ok1 = await p.evaluate((w) => { const c = [...document.querySelectorAll('.rcard[data-i]')].find((x) => !x.disabled && x.textContent.replace(/\s+/g, ' ').includes(w)); if (c) c.click(); return !!c; }, words);
  if (!ok1) throw new Error('no card "' + words + '": ' + flat(await cardsShown(p)));
  for (let k = 0; k < 60; k++) {
    const s = await p.evaluate(() => ({ cf: !!document.querySelector('.confirm-scrim'), cc: !!document.querySelector('.ccard'), ph: RB.combat.phase() }));
    if (s.cf) { await p.evaluate(() => { const bs = [...document.querySelectorAll('.confirm-scrim .foot button')]; const bt = bs.find((x) => /Do it|^Wait$/.test(x.textContent.trim())); if (bt) bt.click(); }); await p.waitForTimeout(120); continue; }
    if (s.cc || s.ph !== 'challenge') break;
    await p.waitForTimeout(50);
  }
  await companionTurn(p, {});
}
// spoken to: its last knot freed by your Unravel (no win), then its name (the win)
async function nameIt(p, name) {
  await p.evaluate(() => RB.world.interact());
  // (no Moss to speak to: no battle starts, and the two checks below fail rather than stop the run)
  const fought = await p.waitForFunction(() => RB.game.mode() === 'combat', null, { timeout: 5000 }).then(() => true, () => false);
  if (!fought) {
    ok(false, name + ': spoken to, no battle started ' + flat(await marks(p)));
    ok(false, name + ': so nothing to name');
    return;
  }
  await ready(p);
  await exchange(p, 'Unravel');
  const at = await ready(p);
  const m0 = await marks(p);
  const shown = at === 'cards' ? await cardsShown(p) : [];
  ok(at === 'cards' && m0.mode === 'combat' && !m0.named && shown.some((x) => x.includes(NAME)),
    name + ': spoken to, its last knot freed brings no win; "Call it by its name" on screen ' + flat({ at, mode: m0.mode, named: m0.named }));
  if (at === 'cards') await exchange(p, NAME);
  await ready(p);
  await p.waitForTimeout(800);
  const m1 = await marks(p);
  ok(m1.mode === 'world' && m1.named && m1.beaten && !m1.moss && m1.lit,
    name + ': then its name: the win, kr_moss1_named and its defeat stored; the Moss gone and the lit lantern there ' + flat(m1));
}

async function scenario(name, o, fn) {
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 860 } });
  await saved(p, o);
  await p.waitForTimeout(900);
  await watch(p);
  await fn(p);
  ok(!errors.length, name + ': no page errors ' + errors.slice(0, 2).join(' | '));
  await p.context().close();
}

await scenario('1 a manual save on the Cedar Steps', { map: 'kr.steps', x: 14, y: 10, flags: { [KEY]: true } }, async (p) => {
  const m = await marks(p);
  ok(m.map === 'kr.steps' && flat(m.moss) === flat([14, 9]) && !m.lit && !m.named && !m.beaten,
    '1 loaded: the Moss at (14, 9) again, no lantern, not named, its defeat not stored ' + flat(m));
  await nameIt(p, '1');
  await p.evaluate(async () => { await RB.save.manualSave(1); await RB.game.loadCampaign(1, 'manual'); });
  await p.waitForTimeout(900);
  const m2 = await marks(p);
  ok(m2.mode === 'world' && m2.named && m2.beaten && !m2.moss && m2.lit, '1 after a save and load: the lit lantern there and no Moss ' + flat(m2));
});

await scenario('2 an autosave', { map: 'kr.steps', x: 14, y: 10, flags: { [KEY]: true }, auto: true }, async (p) => {
  const m = await marks(p);
  ok(m.map === 'kr.steps' && flat(m.moss) === flat([14, 9]) && !m.lit && !m.named && !m.beaten, '2 the autosave loaded: the Moss there, no lantern ' + flat(m));
});

await scenario('3 a save made on the ridge', { map: 'kr.ridge', x: 10, y: 10, flags: { [KEY]: true } }, async (p) => {
  const m0 = await marks(p);
  await p.evaluate(() => RB.game.transition('kr.steps', 14, 10, 'up'));
  await p.waitForTimeout(900);
  const m = await marks(p);
  ok(m0.map === 'kr.ridge' && !m0.beaten && m.map === 'kr.steps' && flat(m.moss) === flat([14, 9]) && !m.lit,
    '3 loaded on the ridge, then up to the Cedar Steps: the Moss there, no lantern ' + flat({ ridge: m0.map, m }));
});

await scenario('4 a save made on the Moss\'s own tile', { map: 'kr.steps', x: 14, y: 9, flags: { [KEY]: true } }, async (p) => {
  await p.waitForTimeout(1500);
  const m = await marks(p);
  ok(m.mode === 'world' && !m.battle && flat(m.at) === flat([14, 9]) && flat(m.moss) === flat([14, 9]) && !m.lit && !m.named && !(await p.evaluate(() => window.__seq.length)),
    '4 loaded: the Moss placed on its tile, and nothing starts by itself (no battle) ' + flat(m));
  // a step off, and back round to face it
  await p.evaluate(() => { const pl = RB.world.W.player; pl.dir = 'down'; RB.world._tryMove('down'); });
  await p.waitForFunction(() => !RB.world.W.player.mv && RB.world.W.player.y === 10, null, { timeout: 5000 });
  await p.evaluate(() => { RB.world.W.player.dir = 'up'; });
  const m1 = await marks(p);
  ok(flat(m1.at) === flat([14, 10]) && m1.mode === 'world' && !m1.battle && flat(m1.moss) === flat([14, 9]), '4 a step off: still no battle, the Moss where it stands ' + flat(m1));
  await nameIt(p, '4');
});

await scenario('5 a save already named', { map: 'kr.steps', x: 14, y: 10, flags: { [KEY]: true, kr_moss1_named: true } }, async (p) => {
  const m = await marks(p);
  ok(m.named && m.beaten && !m.moss && m.lit, '5 loaded: as it was, the lit lantern there and no Moss ' + flat(m));
});

console.log(`\nkr_moss_legacy: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
