// RBN-QA-108 (Agnes 6351678399; Local CL-222; Cloud CC-127 §5, CC-128 §3): Jinpachi brings the valley's letter from his
// place on the road, off screen for every line. Now he walks up to you first (`!walkto cr_jinpachi pc`). In Chromium on
// the built game, with throwaway journeys:
//  1. chained straight after the Cloudroad's end at Sakashita (he was still walking to his place), each companion, at a
//     desktop and a phone size: for every line of his he is within 2 tiles of you and on screen, with no off-screen
//     mark; var._walked 1;
//  2. arriving at every station, the Pass and Lanternfall's street by each of its ways in: the same;
//     and in 1. and 2., once the letter is given his place there ends and he goes on down the road by his own way out,
//     that place's west exit (RBN-QA-108; Agnes 6372889134, Local CL-240, Cloud CC-149 §4): a departure recorded to its
//     road (not a fallback), at the west edge, and then he is gone; one Jinpachi throughout;
//  3. Skip seen: he is set within 2 at once, and goes the same way;
//  4. a journey loaded while he walks: nothing of the walk left (no one walking, nothing running), the loaded journey
//     untouched (no _walked written into it), and arriving again plays the letter with him walking up;
//  5. no free place within 2 (a crowd round you): nobody moves, _walked 0, recorded as a walk fallback; his lines say
//     he speaks from off screen (the plate's mark, which way he is), and the scene still gives the letter; then he is
//     gone, and never by some other way;
//  6. a walk that runs out (a test scene with the shortest bound, from far off): he stops on the tile he reached on his
//     way (never set further on), _walked 0; the mark exactly when he is off screen;
//  7. his road closed (the station's west exit leads nowhere): he fades where he stood, recorded as a fallback, without a
//     step towards any exit;
//  8. no page errors.
// Usage: node tools/build.mjs && node tests/e2e/jinpachi_letter.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const DONE = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_done: true, cr_called: true };
for (let n = 1; n <= 7; n++) Object.assign(DONE, { ['cr_st' + n]: true, ['cr_lamp' + n]: true, ['cr_given' + n]: true });
const errorsAll = [];

// every line of his: where he and you are, whether he is on screen, and the plate's off-screen mark
const hook = () => {
  window.__jin = []; window.__lineN = 0; window.__jinMost = 0;
  if (window.__jinWrap) return;
  window.__jinWrap = true;
  // (how many figures of him there are, every frame)
  (function count() {
    const W = RB.world.W;
    if (W && W.map) window.__jinMost = Math.max(window.__jinMost, W.npcs.concat(W.extras || [], W.leavers || []).filter((n) => n.id === 'cr_jinpachi' || (n.def && (n.def.char || n.def.id)) === 'cr_jinpachi').length);
    requestAnimationFrame(count);
  })();
  const say = RB.ui.dialogue.say;
  RB.ui.dialogue.say = function (l) {
    const r = say.apply(this, arguments);
    if (l && l.who === 'cr_jinpachi') {
      const W = RB.world.W, a = W.npcs.concat(W.extras || []).find((n) => n.id === 'cr_jinpachi' || (n.def && (n.def.char || n.def.id) === 'cr_jinpachi'));
      const css = a ? RB.render.tileToCss(a.fx + 0.5, a.fy + 0.5) : null;
      const mark = document.querySelector('#ui .dlg .who .offscr');
      window.__jin.push({ t: performance.now(), en: String(l.en || '').slice(0, 30), map: W.map.id, called: !!RB.game.s.flags.yn_called, pc: [W.player.x, W.player.y], jin: a ? [a.x, a.y] : null, mv: !!(a && (a.mv || a.route)),
        on: css ? css.x >= 0 && css.y >= 0 && css.x <= innerWidth && css.y <= innerHeight : false, mark: mark ? mark.dataset.way : null });
    }
    return r;
  };
};
async function drive(p, o) {
  o = o || {};
  for (let i = 0; i < 600; i++) {
    const st = await p.evaluate(() => ({ d: RB.ui.dialogue.isOpen(), run: RB.script.isRunning(), ch: [...document.querySelectorAll('.choices:not(.hidden) .choice')].length, card: !!document.querySelector('.banner-layer') }));
    if (st.ch) { await p.locator('.choices:not(.hidden) .choice').first().click(); await p.waitForTimeout(150); continue; }
    if (st.card) { await p.locator('.banner-layer').click().catch(() => {}); await p.waitForTimeout(500); continue; }
    if (st.d) { await p.waitForTimeout(60); await p.evaluate(() => RB.ui.dialogue.isOpen() && RB.ui.dialogue.advance()); await p.waitForTimeout(60); continue; }
    if (!st.run && i > 30) break;
    await p.waitForTimeout(100);
  }
}
const cheb = (l) => l.jin && Math.max(Math.abs(l.jin[0] - l.pc[0]), Math.abs(l.jin[1] - l.pc[1]));
const near = (lines) => lines.length >= 3 && lines.every((l) => l.jin && cheb(l) <= 2 && l.on && !l.mark && !l.mv);
const fmt = (lines) => JSON.stringify(lines.map((l) => [l.pc.join(','), l.jin && l.jin.join(','), l.on ? 'on' : 'OFF', l.mark || '-']));

async function begin(p, map, x, y, comp, flags, o) {
  await p.evaluate(async ([map, x, y, comp, flags, o]) => {
    const s = RB.game.debugStart(map, x, y, { comp: comp || undefined, dir: o.dir || 'up', edition: RB.edition.forNew(), flags });
    if (!comp) s.comp = null;
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) if (ev.scene !== 'yn.call') s.flags['enter:' + m + ':' + ev.scene] = true;
    if (o.quest) s.quests.cr_main = { stage: 8, done: false, t: 1 };
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.skipSeen = !!o.skip;
    RB.save.autosave = async () => {};
    await new Promise((r) => setTimeout(r, 800));
  }, [map, x, y, comp, flags, o || {}]);
  await p.evaluate(hook);
}
// his road from each place where the letter is given (its west exit's map)
const ROAD = { 'cr.oiwake': 'lf.road', 'cr.suginoki': 'cr.leg1', 'cr.sakashita': 'cr.leg2', 'cr.nakayama': 'cr.leg3', 'cr.umagaeshi': 'cr.leg4', 'cr.kirishita': 'cr.leg5', 'cr.kumoi': 'cr.above', 'cr.summit': 'cr.hut', 'lf.town': 'lf.road' };
// After the letter: until he is gone (at most 20 s), where he went; his going's record (not his walking in, nor taking up
// a new place here), the tiles he was seen on, and the most figures of him at once
const goes = (p) => p.evaluate(async () => {
  const W = RB.world.W, map = W.map.id, mine = (n) => n.id === 'cr_jinpachi' || (n.def && (n.def.char || n.def.id)) === 'cr_jinpachi';
  const figs = () => W.npcs.concat(W.extras || [], W.leavers || []).filter(mine), trail = [], t0 = performance.now();
  while (figs().length && performance.now() - t0 < 20000) {
    const k = figs().map((a) => a.x + ',' + a.y).join('|');
    if (k !== trail[trail.length - 1]) trail.push(k);
    await new Promise((r) => setTimeout(r, 40));
  }
  const recs = W.departures.filter((d) => d.id === 'cr_jinpachi' && d.map === map && !d.arriving && !/new place here/.test(d.reason));
  return { map, left: figs().length, ms: Math.round(performance.now() - t0), recs, trail, most: window.__jinMost };
});
// he went down his road: one record, to that place's road, at its west edge, not a fallback; gone; one figure throughout
const wentDown = (g) => g.left === 0 && g.most === 1 && g.recs.length === 1 && g.recs[0].to === ROAD[g.map] && g.recs[0].reason === 'authored' && !g.recs[0].fallback && /^0,\d+$/.test(g.recs[0].exit || '');
const fmtGo = (g) => JSON.stringify({ recs: g.recs.map((d) => ({ to: d.to, exit: d.exit, reason: d.reason, fallback: d.fallback })), trail: g.trail.slice(0, 1).concat(g.trail.slice(-2)), left: g.left, most: g.most, ms: g.ms });
const after = (p) => p.evaluate(() => ({ called: !!RB.game.s.flags.yn_called, letter: !!(RB.game.s.inv && RB.game.s.inv.yn_letter), walked: RB.game.s.vars._walked, run: RB.script.isRunning(), jin: window.__jin.slice(), fb: (RB.staging.stats().nearFallbacks || []).slice(-3) }));

// ---- 1. chained after the Cloudroad's end at Sakashita ---------------------------------------------------------------------
for (const [w, h] of [[1180, 756], [390, 844]]) {
  for (const comp of ['nao', 'mio', 'ren', 'suzu']) {
    const { p, ctx, errors } = await page(b, url, { viewport: { width: w, height: h } });
    await begin(p, 'cr.sakashita', 18, 12, comp, DONE, { quest: true });
    await p.evaluate(() => { RB.script.run('cr.end'); });
    await drive(p);
    const a = await after(p);
    // (his lines in yn.call only: it sets yn_called first. Chained after the Cloudroad's end, Mio's, Ren's and Suzu's
    // endings have him speak a message for them before it, from where he stands: cr.mio_kikue, cr.ren_lit, cr.suzu_reply)
    const L = a.jin.filter((l) => l.map === 'cr.sakashita' && l.called);
    ok(a.called && a.letter && a.walked === 1 && near(L), `${w}x${h} ${comp}: after the Cloudroad's end, every line of his within 2 of you and on screen, no mark; _walked 1 (${fmt(L)})`);
    const g = await goes(p);
    ok(wentDown(g), `${w}x${h} ${comp}: then he goes on down the road, by the west exit to the leg below, not a fallback, and is gone; one Jinpachi throughout (${fmtGo(g)})`);
    errorsAll.push(...errors);
    await ctx.close();
  }
}

// ---- 2. arriving at every station, the Pass and Lanternfall's street ------------------------------------------------------
{
  const maps = await (async () => { const { p, ctx } = await page(b, url); const r = await p.evaluate(() => RB.content.cloudroad.STATIONS.concat(['cr.summit', 'lf.town']).map((id) => [id, Object.keys(RB.content.maps[id].spawn || {})])); await ctx.close(); return r; })();
  const bad = [], badGo = [], waits = [];
  let n = 0;
  for (const [map, keys] of maps) {
    for (const key of keys.filter((k) => k !== 'default' || keys.length === 1)) {
      const { p, ctx, errors } = await page(b, url, { viewport: { width: 1180, height: 756 } });
      // (from a road between stations, where nothing plays on arriving)
      await begin(p, 'cr.leg1', 2, 2, 'nao', Object.assign({ cr_done: true, cr_delivered: true }, DONE), {});
      await p.evaluate(([map, key]) => { const d = RB.content.maps[map].spawn[key]; window.__tArr = performance.now(); RB.game.transition(map, d[0], d[1], d[2] || 'up'); }, [map, key]);
      await p.waitForTimeout(1200);
      await drive(p);
      const a = await after(p);
      const L = a.jin.filter((l) => l.map === map);
      const wait = await p.evaluate(() => window.__tArr);
      if (L.length) waits.push([map + ' ' + key, Math.round(L[0].t - wait)]);
      n++;
      if (!(a.called && a.walked === 1 && near(L))) bad.push(map + ' ' + key + ' ' + fmt(L) + ' walked ' + a.walked);
      const g = await goes(p);
      if (!wentDown(g)) badGo.push(map + ' ' + key + ' ' + fmtGo(g));
      errorsAll.push(...errors);
      await ctx.close();
    }
  }
  ok(n >= 17 && !bad.length, 'every station, the Pass and Lanternfall\'s street, by each way in (' + n + ' arrivals): every line of his within 2 and on screen' + (bad.length ? ': ' + bad.join(' | ') : ''));
  ok(n >= 17 && !badGo.length, 'and then, from each, he goes on down its road by its west exit (' + Object.entries(ROAD).map(([m, r]) => m + ' > ' + r).join(', ') + '), not a fallback, and is gone; one Jinpachi throughout' + (badGo.length ? ': ' + badGo.join(' | ') : ''));
  waits.sort((x, y) => y[1] - x[1]);
  console.log('     from arriving to his first line (ms, the longest first): ' + JSON.stringify(waits.slice(0, 6)));
}

// ---- 3. Skip seen ---------------------------------------------------------------------------------------------------------------
{
  const { p, ctx, errors } = await page(b, url, { viewport: { width: 1180, height: 756 } });
  await begin(p, 'cr.oiwake', 30, 12, 'mio', Object.assign({ cr_done: true, cr_delivered: true }, DONE), { skip: true, dir: 'left' });
  await p.evaluate(() => { RB.game.s.seen['yn.call'] = true; RB.game.setFastForward(true); RB.script.run('yn.call'); });
  await drive(p);
  const a = await after(p);
  const L = a.jin;
  ok(a.called && a.walked === 1 && L.length && L.every((l) => l.jin && cheb(l) <= 2 && !l.mark), 'Skip seen: he is set within 2 of you at once (' + fmt(L) + ')');
  const g = await goes(p);
  ok(wentDown(g), 'Skip seen: and he goes on down the road the same way (' + fmtGo(g) + ')');
  errorsAll.push(...errors);
  await ctx.close();
}

// ---- 4. a journey loaded while he walks ----------------------------------------------------------------------------------------
{
  const { p, ctx, errors } = await page(b, url, { viewport: { width: 1180, height: 756 } });
  const F = Object.assign({ cr_done: true, cr_delivered: true }, DONE);
  await begin(p, 'cr.oiwake', 30, 12, 'ren', F, { dir: 'left' });
  await p.evaluate(async () => { await RB.save.manualSave(3); });
  await p.evaluate(() => { RB.script.run('yn.call'); });
  // (as soon as he is on his way)
  await p.waitForFunction(() => { const a = RB.world.W.npcs.concat(RB.world.W.extras || []).find((n) => n.id === 'cr_jinpachi'); return !!(a && a.mv); }, null, { timeout: 5000 }).catch(() => {});
  const mid = await p.evaluate(() => { const a = RB.world.W.npcs.concat(RB.world.W.extras || []).find((n) => n.id === 'cr_jinpachi'); return a ? [a.x, a.y] : null; });
  const ld = await p.evaluate(async () => { try { await RB.game.loadCampaign(3, 'manual'); return 'loaded'; } catch (e) { return 'failed: ' + e.message; } });
  await p.waitForTimeout(1500);
  const g = await p.evaluate(() => { const W = RB.world.W; const js = W.npcs.concat(W.extras || []).filter((n) => n.id === 'cr_jinpachi'); return { run: RB.script.isRunning(), dlg: RB.ui.dialogue.isOpen(), walking: js.some((j) => j.mv || j.route), n: js.length, at: js.map((j) => j.x + ',' + j.y), called: !!RB.game.s.flags.yn_called, walked: RB.game.s.vars._walked === undefined ? null : RB.game.s.vars._walked }; });
  ok(ld === 'loaded' && mid && !g.run && !g.dlg && !g.walking && g.n === 1 && !g.called && g.walked === null, 'a journey loaded while he walks: nothing of the walk left, the loaded journey untouched (' + JSON.stringify({ ld, mid, g }) + ')');
  await p.evaluate(() => { window.__jin = []; RB.game.settings.textSpeed = 'instant'; RB.save.autosave = async () => {}; RB.script.run('yn.call'); });
  await drive(p);
  const a = await after(p);
  ok(a.called && a.walked === 1 && near(a.jin), 'then the letter plays again with him walking up to you (' + fmt(a.jin) + ')');
  errorsAll.push(...errors);
  await ctx.close();
}

// ---- 5. no free place within 2 ---------------------------------------------------------------------------------------------------
{
  const { p, ctx, errors } = await page(b, url, { viewport: { width: 1180, height: 756 } });
  await begin(p, 'cr.oiwake', 28, 12, 'nao', Object.assign({ cr_done: true, cr_delivered: true }, DONE), { dir: 'left' });
  // a crowd on every free tile within 2 of you (copies of the station's keeper), your companion among them
  const crowd = await p.evaluate(() => {
    const W = RB.world.W, p = W.player, tpl = W.npcs.find((n) => n.id !== 'cr_jinpachi') || W.npcs[0];
    let k = 0;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
      const x = p.x + dx, y = p.y + dy;
      if ((!dx && !dy) || RB.maps.blockedStatic(W.map, x, y) || RB.maps.exitAt(W.map, x, y)) continue;
      if ((W.comp && W.comp.x === x && W.comp.y === y) || W.npcs.concat(W.extras).some((n) => n.x === x && n.y === y)) continue;
      const a = Object.assign(Object.create(Object.getPrototypeOf(tpl)), tpl, { id: 'crowd' + k++, x, y, fx: x, fy: y, mv: null, route: null, stg: null, def: { id: 'crowd' }, extra: true });
      W.extras.push(a);
    }
    return k;
  });
  const before = await p.evaluate(() => { const a = RB.world.W.npcs.find((n) => n.id === 'cr_jinpachi'); return a ? [a.x, a.y] : null; });
  await p.evaluate(() => { RB.script.run('yn.call'); });
  await drive(p);
  const a = await after(p);
  const L = a.jin;
  ok(crowd > 0 && a.called && a.letter && a.walked === 0 && L.length >= 3 && L.every((l) => l.jin && l.jin.join() === String(before) && !l.on && l.mark === 'left') && a.fb.some((f) => f.id === 'cr_jinpachi' && f.why === 'no free place within 2'),
    'no free place within 2: nobody moves, _walked 0, recorded; every line of his says he speaks from off screen, to your left; the letter is given (' + JSON.stringify({ crowd, before, fb: a.fb, lines: fmt(L) }) + ')');
  // (off screen where he stands, so nobody sees him go: the world records only a going that is seen)
  const g = await goes(p);
  ok(g.left === 0 && g.most === 1 && g.recs.every((d) => d.to === 'lf.road'), 'then he is gone, and never by some other way (' + fmtGo(g) + ')');
  errorsAll.push(...errors);
  await ctx.close();
}

// ---- 6. a walk that runs out ---------------------------------------------------------------------------------------------------------
{
  const { p, ctx, errors } = await page(b, url, { viewport: { width: 1180, height: 756 } });
  await begin(p, 'cr.oiwake', 33, 13, 'nao', Object.assign({ cr_done: true, cr_delivered: true, yn_called: true }, DONE), { dir: 'left' });
  await p.evaluate(() => {
    RB.script.add('@scene t.far\n!walkto cr_jinpachi pc max=4000\ncr_jinpachi: テスト です 。 || A test line.\ncr_jinpachi: もう 一度 。 || Once more.\n', 't');
    // (his place on the road, for this test only: the letter's already been given, so the world has him gone)
    const W = RB.world.W, tpl = W.npcs[0];
    const j = Object.assign(Object.create(Object.getPrototypeOf(tpl)), tpl, { id: 'cr_jinpachi', x: 3, y: 13, fx: 3, fy: 13, mv: null, route: null, stg: null, def: { id: 'cr_jinpachi' }, extra: true, look: (RB.content.chars.cr_jinpachi || {}).look || tpl.look });
    W.extras.push(j);
    window.__path = [];
    const t0 = performance.now();
    (function track() { if (performance.now() - t0 < 9000) { window.__path.push([j.x, j.y]); requestAnimationFrame(track); } })();
    RB.script.run('t.far');
  });
  await drive(p);
  const r = await p.evaluate(() => ({ walked: RB.game.s.vars._walked, path: window.__path.filter((q, i, A) => !i || q.join() !== A[i - 1].join()).map((q) => q.join(',')), fb: (RB.staging.stats().nearFallbacks || []).slice(-1), jin: window.__jin.slice() }));
  const L = r.jin, last = r.path[r.path.length - 1];
  ok(r.walked === 0 && L.length === 2 && L.every((l) => l.jin && l.jin.join() === last && cheb(l) > 2 && (l.mark === 'left') === !l.on) && r.path.length > 3 && r.fb.some((f) => f.why === 'the walk ran out or was stopped'),
    'a walk that runs out: he stops on the tile he reached on his way, _walked 0; the mark exactly when he is off screen (' + JSON.stringify({ path: r.path.slice(-3), lines: fmt(L), fb: r.fb }) + ')');
  errorsAll.push(...errors);
  await ctx.close();
}

// ---- 7. his road closed ----------------------------------------------------------------------------------------------------------
{
  const { p, ctx, errors } = await page(b, url, { viewport: { width: 1180, height: 756 } });
  await begin(p, 'cr.oiwake', 30, 12, 'mio', Object.assign({ cr_done: true, cr_delivered: true }, DONE), { dir: 'left' });
  // (the station's west exit leads nowhere, for this journey only: as if the road below were shut)
  const shut = await p.evaluate(() => { const e = RB.content.maps['cr.oiwake'].exits.find((x) => x.to === 'lf.road'); if (!e) return null; e.to = null; return e.x + ',' + e.y; });
  await p.evaluate(() => { RB.script.run('yn.call'); });
  await drive(p);
  const a = await after(p);
  const last = a.jin.length ? a.jin[a.jin.length - 1].jin.join(',') : null;
  const g = await goes(p);
  const d = g.recs[0] || {};
  ok(shut && a.called && a.letter && a.walked === 1 && g.recs.length === 1 && /^faded where they stood: no way to lf\.road/.test(d.fallback || '') && d.from === last && g.trail.every((t) => t === last) && g.left === 0 && g.most === 1,
    'his road closed: he fades where he stood beside you, recorded as a fallback, without a step towards any exit (' + JSON.stringify({ shut, last, fallback: d.fallback, from: d.from, trail: g.trail, left: g.left }) + ')');
  errorsAll.push(...errors);
  await ctx.close();
}

ok(!errorsAll.length, 'no page errors' + (errorsAll.length ? ': ' + errorsAll.slice(0, 3).join(' | ') : ''));
await b.close(); srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
