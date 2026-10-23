// RBN-QA-124 (Agnes 6347127013, 6351678399, 6350945110; Local CL-222, CL-226; Cloud CC-127 §8, CC-128 §3): Suzu's
// evening at the little theatre. The narration says the house is packed, with the ridge's people on the floor; until now
// Ginnojō sat there alone, and Koume "walked straight over" from wherever she stood. In Chromium on the built game, with
// throwaway journeys:
//  1. the evening as it comes (the valley's dusk, then Suzu's evening called from it), at a desktop and a phone size:
//     every line in the theatre with the seven of the audience in their places, seated (four on the benches, three on
//     the floor), at night; the theatre first seen at night (night already on when its fade-in begins), the place before
//     it not turned to night as it fades out (Agnes 6374739355); Koume walks up to you after the show (within 2, on screen, no off-screen mark) and the
//     narration says so; afterwards the audience goes (each by the way out, or where they are), nobody is left, the room
//     has its own light, Koume goes back to her place and nothing of the audience is in the journey;
//  2. Skip seen: the same, Koume set beside you at once;
//  3. a journey loaded during the show: nothing of it left (nothing running, no audience), the loaded journey untouched,
//     and the theatre entered afterwards in that journey has no audience;
//  4. no free place within 2 of you (a crowd round you): Koume stays on the stage, _walked 0, and the narration has her
//     call out to you; the house still full; afterwards nobody of the audience left;
//  5. the theatre visited outside the evening (before it, after it, after the valley's story, by its door): no audience;
//  6. no page errors.
// RB_CAPS=<dir> also saves stills of the full house and of Koume's first line (for the owner; never committed).
// Usage: node tools/build.mjs && node tests/e2e/playhouse_audience.mjs
import path from 'node:path';
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
const CAPS = process.env.RB_CAPS || null;
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const DONE = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_done: true, cr_called: true, cr_done: true, cr_delivered: true, yn_called: true };
const errorsAll = [];

// every line: where everyone is, who of the audience is placed and seated, Koume on screen, the plate's mark, the light
const hook = () => {
  window.__L = []; window.__cap = null; window.__fades = [];
  if (window.__paWrap) return;
  window.__paWrap = true;
  // every fade, as it begins: in or out, on which map, and whether the scene's night is on
  const fade = RB.ui.fade;
  RB.ui.fade = function (on) { const W = RB.world.W, amb = RB.staging.ambienceNow(); window.__fades.push({ out: !!on, map: W.map && W.map.id, night: !!(amb && amb.night) }); return fade.apply(this, arguments); };
  const say = RB.ui.dialogue.say;
  RB.ui.dialogue.say = function (l) {
    const r = say.apply(this, arguments);
    const W = RB.world.W, AUD = RB.content.playhouseAudience || [];
    const st = RB.staging.state().actors, k = W.npcs.find((n) => n.id === 'yn_koume');
    const css = k ? RB.render.tileToCss(k.fx + 0.5, k.fy + 0.5) : null;
    const mark = document.querySelector('#ui .dlg .who .offscr');
    const amb = RB.staging.ambienceNow();
    window.__L.push({ who: l && l.who, en: String((l && l.en) || ''), map: W.map.id, pc: [W.player.x, W.player.y],
      aud: W.npcs.filter((n) => AUD.includes(n.id)).map((n) => n.id + '@' + n.x + ',' + n.y),
      rest: Object.fromEntries(st.filter((a) => AUD.includes(a.id)).map((a) => [a.id, a.rest])),
      koume: k ? [k.x, k.y] : null, kmv: !!(k && (k.mv || k.route)), on: css ? css.x >= 0 && css.y >= 0 && css.x <= innerWidth && css.y <= innerHeight : false,
      mark: mark ? mark.dataset.way : null, night: !!(amb && amb.night) });
    if (window.__L.length === 1 && W.map.id === 'yn.playhouse') window.__cap = 'house';
    if (l && l.who === 'yn_koume' && !window.__L.slice(0, -1).some((x) => x.who === 'yn_koume')) window.__cap = 'koume';
    return r;
  };
};
async function drive(p, tag) {
  for (let i = 0; i < 900; i++) {
    const st = await p.evaluate(() => ({ d: RB.ui.dialogue.isOpen(), run: RB.script.isRunning(), ch: [...document.querySelectorAll('.choices:not(.hidden) .choice')].length, card: !!document.querySelector('.banner-layer'), cap: window.__cap }));
    if (st.cap) { await p.evaluate(() => { window.__cap = null; }); await p.waitForTimeout(500); if (CAPS && tag) await p.screenshot({ path: path.join(CAPS, tag + '_' + st.cap + '.png') }); continue; }
    if (st.ch) { await p.locator('.choices:not(.hidden) .choice').first().click(); await p.waitForTimeout(150); continue; }
    if (st.card) { await p.locator('.banner-layer').click().catch(() => {}); await p.waitForTimeout(500); continue; }
    if (st.d) { await p.waitForTimeout(60); await p.evaluate(() => RB.ui.dialogue.isOpen() && RB.ui.dialogue.advance()); await p.waitForTimeout(60); continue; }
    if (!st.run && i > 30) break;
    await p.waitForTimeout(100);
  }
}
async function begin(p, map, x, y, flags, o) {
  await p.evaluate(async ([map, x, y, flags, o]) => {
    const s = RB.game.debugStart(map, x, y, { comp: o.comp === null ? undefined : o.comp || 'suzu', dir: o.dir || 'up', edition: RB.edition.forNew(), flags });
    if (o.comp === null) s.comp = null;
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.skipSeen = !!o.skip;
    RB.save.autosave = async () => {};
    await new Promise((r) => setTimeout(r, 800));
  }, [map, x, y, flags, o || {}]);
  await p.evaluate(hook);
}
const inTheatre = (L) => L.filter((l) => l.map === 'yn.playhouse');
const SEATS = { yn_aud_bench1: 'sit', yn_aud_bench2: 'sit', yn_aud_bench3: 'sit', yn_aud_bench4: 'sit', yn_aud_ridge1: 'sitlap', yn_aud_ridge2: 'sitlap', yn_aud_ridge3: 'sitlap' };
const full = (l) => l.aud.length === 7 && l.night;
const cheb = (a, b) => Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));
const fmtK = (L) => JSON.stringify(L.filter((l) => l.who === 'yn_koume').map((l) => [l.koume && l.koume.join(), l.pc.join(), l.on ? 'on' : 'OFF', l.mark || '-']));
// after the scene: wait until nobody of the audience is placed or still on their way out; how each went; Koume's way back
async function settle(p) {
  return p.evaluate(async () => {
    const AUD = RB.content.playhouseAudience || [], W = RB.world.W, t0 = performance.now();
    const left = () => W.npcs.concat(W.leavers || [], W.extras || []).filter((n) => AUD.includes(n.id) || AUD.includes(n.def && n.def.id));
    while (left().length && performance.now() - t0 < 20000) await new Promise((r) => setTimeout(r, 100));
    const gone = Math.round(performance.now() - t0);
    const t1 = performance.now();
    const k = () => W.npcs.find((n) => n.id === 'yn_koume');
    while (k() && (k().x !== 7 || k().y !== 3) && performance.now() - t1 < 15000) await new Promise((r) => setTimeout(r, 100));
    const deps = (W.departures || []).filter((d) => AUD.includes(d.id));
    return { left: left().map((n) => n.id), gone, deps: deps.map((d) => [d.id, d.exit, d.reason]), koume: k() ? [k().x, k().y] : null, night: !!(RB.staging.ambienceNow() || {}).night,
      run: RB.script.isRunning(), walked: RB.game.s.vars._walked, inJourney: /yn_aud_/.test(JSON.stringify(RB.game.s)), seenFirst: !!RB.game.s.seen['yn.playhouse_first'], playhouseSeen: !!RB.game.s.flags.yn_playhouse_seen };
  });
}

// ---- 1. the evening as it comes ---------------------------------------------------------------------------------------------
for (const [w, h] of [[1180, 756], [390, 844]]) {
  const { p, ctx, errors } = await page(b, url, { viewport: { width: w, height: h } });
  await begin(p, 'yn.lower', 35, 11, Object.assign({ yn_kettle_settled: true }, DONE), {});
  await p.evaluate(() => { RB.script.run('yn.evening'); });
  await drive(p, w + 'x' + h);
  const L = await p.evaluate(() => window.__L.slice());
  const F = await p.evaluate(() => window.__fades.slice());
  const fi = F.findIndex((f) => !f.out && f.map === 'yn.playhouse'), fo = F[fi - 1];
  ok(fi > 0 && F[fi].night && fo && fo.out && fo.map !== 'yn.playhouse' && !fo.night,
    `${w}x${h}: the theatre is first seen at night (night on as its fade-in begins); the place before it was not turned to night as it faded out (${JSON.stringify(F)})`);
  const T = inTheatre(L), K = T.filter((l) => l.who === 'yn_koume');
  ok(T.length >= 8 && T.every(full) && T.every((l) => l.aud.every((a) => { const id = a.split('@')[0]; return T[T.length - 1].rest[id] === SEATS[id]; })),
    `${w}x${h}: every line in the theatre with the seven in their places, seated (four on the benches, three on the floor), at night (${T.length} lines; ${JSON.stringify(T[T.length - 1] && T[T.length - 1].rest)})`);
  ok(K.length === 2 && K.every((l) => l.koume && cheb(l.koume, l.pc) <= 2 && l.on && !l.mark && !l.kmv) && T.some((l) => /walks straight over/.test(l.en)) && !T.some((l) => /calls out to you/.test(l.en)),
    `${w}x${h}: Koume walks up to you after the show: within 2, on screen, no mark; the narration says she walked over (${fmtK(T)})`);
  const a = await settle(p);
  ok(!a.left.length && !a.run && !a.night && a.walked === 1 && !a.inJourney && a.playhouseSeen && !a.seenFirst && a.koume && a.koume.join() === '7,3',
    `${w}x${h}: afterwards the audience goes (all gone in ${a.gone} ms; ${JSON.stringify(a.deps)}), the room's own light, Koume back at her place, nothing of them in the journey`);
  errorsAll.push(...errors);
  await ctx.close();
}

// ---- 2. Skip seen -----------------------------------------------------------------------------------------------------------------
{
  const { p, ctx, errors } = await page(b, url, { viewport: { width: 1180, height: 756 } });
  await begin(p, 'yn.lower', 35, 11, Object.assign({ yn_kettle_settled: true }, DONE), { skip: true });
  await p.evaluate(() => { RB.game.s.seen['yn.suzu_evening'] = true; RB.game.setFastForward(true); RB.script.run('yn.suzu_evening'); });
  await drive(p);
  const T = inTheatre(await p.evaluate(() => window.__L.slice()));
  const K = T.filter((l) => l.who === 'yn_koume');
  ok(T.length >= 8 && T.every(full) && K.length === 2 && K.every((l) => l.koume && cheb(l.koume, l.pc) <= 2 && !l.mark), 'Skip seen: the house full for every line; Koume set beside you at once (' + fmtK(T) + ')');
  await p.evaluate(() => RB.game.setFastForward(false));
  const a = await settle(p);
  ok(!a.left.length && a.walked === 1 && !a.inJourney, 'and afterwards nobody of the audience left (' + a.gone + ' ms; ' + JSON.stringify(a.deps) + ')');
  errorsAll.push(...errors);
  await ctx.close();
}

// ---- 3. a journey loaded during the show ------------------------------------------------------------------------------------------
{
  const { p, ctx, errors } = await page(b, url, { viewport: { width: 1180, height: 756 } });
  await begin(p, 'yn.lower', 35, 11, Object.assign({ yn_kettle_settled: true }, DONE), {});
  await p.evaluate(async () => { await RB.save.manualSave(3); });
  await p.evaluate(() => { RB.game.settings.textSpeed = 'normal'; RB.script.run('yn.suzu_evening'); });
  await p.waitForFunction(() => RB.world.W.map.id === 'yn.playhouse' && RB.ui.dialogue.isOpen(), null, { timeout: 8000 }).catch(() => {});
  const mid = await p.evaluate(() => RB.world.W.npcs.filter((n) => (RB.content.playhouseAudience || []).includes(n.id)).length);
  const ld = await p.evaluate(async () => { try { await RB.game.loadCampaign(3, 'manual'); return 'loaded'; } catch (e) { return 'failed: ' + e.message; } });
  await p.waitForTimeout(1500);
  const g = await p.evaluate(() => { const W = RB.world.W, AUD = RB.content.playhouseAudience || []; return { map: W.map.id, run: RB.script.isRunning(), dlg: RB.ui.dialogue.isOpen(), aud: W.npcs.concat(W.leavers || [], W.extras || []).filter((n) => AUD.includes(n.id)).length, term: RB.state.test(RB.game.s, 'scene.yn.suzu_evening'), walked: RB.game.s.vars._walked === undefined ? null : RB.game.s.vars._walked, seen: !!RB.game.s.flags.yn_playhouse_seen, night: !!RB.staging.ambienceNow() }; });
  ok(ld === 'loaded' && mid === 7 && g.map === 'yn.lower' && !g.run && !g.dlg && !g.aud && !g.term && g.walked === null && !g.seen && !g.night,
    'a journey loaded during the show: nothing of it left, the loaded journey untouched (' + JSON.stringify({ ld, mid, g }) + ')');
  // that journey walks into the theatre by its door: no audience (its own first visit plays)
  await p.evaluate(() => { RB.game.settings.textSpeed = 'instant'; RB.save.autosave = async () => {}; const d = RB.content.maps['yn.playhouse'].spawn.default; RB.game.transition('yn.playhouse', d[0], d[1], d[2] || 'up'); });
  await p.waitForTimeout(1200);
  await drive(p);
  const e = await p.evaluate(() => { const W = RB.world.W; return { map: W.map.id, aud: W.npcs.filter((n) => (RB.content.playhouseAudience || []).includes(n.id)).length }; });
  ok(e.map === 'yn.playhouse' && !e.aud, 'then that journey walks into the theatre: no audience (' + JSON.stringify(e) + ')');
  errorsAll.push(...errors);
  await ctx.close();
}

// ---- 4. no free place within 2 of you ---------------------------------------------------------------------------------------------
{
  const { p, ctx, errors } = await page(b, url, { viewport: { width: 1180, height: 756 } });
  await begin(p, 'yn.lower', 35, 11, Object.assign({ yn_kettle_settled: true }, DONE), {});
  // (a crowd on every free tile within 2 of you as the theatre is entered: copies of the world's people, for this test only)
  await p.evaluate(() => {
    const enter = RB.world.enter;
    RB.world.enter = function (id) {
      const r = enter.apply(this, arguments);
      if (id !== 'yn.playhouse') return r;
      const W = RB.world.W, pl = W.player, tpl = W.npcs.find((n) => n.id === 'yn_shinza');
      let k = 0;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
        const x = pl.x + dx, y = pl.y + dy;
        if ((!dx && !dy) || RB.maps.blockedStatic(W.map, x, y) || RB.maps.exitAt(W.map, x, y)) continue;
        if ((W.comp && W.comp.x === x && W.comp.y === y) || W.npcs.concat(W.extras).some((n) => n.x === x && n.y === y)) continue;
        W.extras.push(Object.assign(Object.create(Object.getPrototypeOf(tpl)), tpl, { id: 'crowd' + k++, x, y, fx: x, fy: y, mv: null, route: null, stg: null, def: { id: 'crowd' }, extra: true }));
      }
      window.__crowd = k;
      RB.world.enter = enter;
      return r;
    };
    RB.script.run('yn.suzu_evening');
  });
  await drive(p);
  const T = inTheatre(await p.evaluate(() => window.__L.slice()));
  const r = await p.evaluate(() => ({ crowd: window.__crowd, walked: RB.game.s.vars._walked, fb: (RB.staging.stats().nearFallbacks || []).slice(-2) }));
  const K = T.filter((l) => l.who === 'yn_koume');
  ok(r.crowd > 0 && r.walked === 0 && K.length === 2 && K.every((l) => l.koume && l.koume.join() === '7,3') && T.some((l) => l.en === 'When the show ends, Koume calls out to you.') && !T.some((l) => /walks straight over/.test(l.en)) && r.fb.some((f) => f.id === 'yn_koume' && f.why === 'no free place within 2'),
    'no free place within 2 of you: Koume stays on the stage, _walked 0, recorded; the narration has her call out to you (' + JSON.stringify({ crowd: r.crowd, fb: r.fb, k: fmtK(T) }) + ')');
  ok(T.length >= 8 && T.every(full), 'and the house is full for every line');
  await p.evaluate(() => { const W = RB.world.W; W.extras = W.extras.filter((n) => !/^crowd/.test(n.id)); });
  const a = await settle(p);
  ok(!a.left.length && !a.inJourney, 'afterwards nobody of the audience left (' + a.gone + ' ms)');
  errorsAll.push(...errors);
  await ctx.close();
}

// ---- 5. the theatre outside the evening -------------------------------------------------------------------------------------------
{
  const bad = [];
  for (const [label, flags, how] of [
    ['before the evening, standing in it', {}, 'here'],
    ['before the evening, by its door', { yn_playhouse_seen: true }, 'door'],
    ['the evening over', { yn_playhouse_seen: true, yn_eve_done: true, yn_suzu_crossroads: true, yn_suzu_night: true, yn_apart: true }, 'door'],
    ['the valley\'s story done', { yn_playhouse_seen: true, yn_eve_done: true, yn_done: true }, 'door'],
  ]) {
    const { p, ctx, errors } = await page(b, url, { viewport: { width: 1180, height: 756 } });
    if (how === 'here') await begin(p, 'yn.playhouse', 8, 7, Object.assign({ yn_kettle_settled: true }, DONE, flags), {});
    else {
      await begin(p, 'yn.lower', 35, 11, Object.assign({ yn_kettle_settled: true }, DONE, flags), {});
      await p.evaluate(() => { const d = RB.content.maps['yn.playhouse'].spawn.default; RB.game.transition('yn.playhouse', d[0], d[1], d[2] || 'up'); });
      await p.waitForTimeout(1200);
    }
    await drive(p);
    await p.waitForTimeout(1500);
    const e = await p.evaluate(() => { const W = RB.world.W; return { map: W.map.id, aud: W.npcs.concat(W.leavers || []).filter((n) => (RB.content.playhouseAudience || []).includes(n.id)).length }; });
    if (e.map !== 'yn.playhouse' || e.aud) bad.push(label + ' ' + JSON.stringify(e));
    errorsAll.push(...errors);
    await ctx.close();
  }
  ok(!bad.length, 'the theatre outside the evening (before it, by its door, after it, after the valley\'s story): no audience' + (bad.length ? ': ' + bad.join(' | ') : ''));
}

ok(!errorsAll.length, 'no page errors' + (errorsAll.length ? ': ' + errorsAll.slice(0, 3).join(' | ') : ''));
await b.close(); srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
