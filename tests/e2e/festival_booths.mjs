// The festival's booths (Agnes 6446511174; Local CL-498, CL-499; Cloud CC-357): a booth's scene gave its description,
// then asked for its game while that scene was still running, which no activity starts on top of; so Next left you in
// the world with no game. In Chromium on the built game, a synthetic twelve-chapter journey (never a real save), the
// booths used as a player does (stand at the booth, OK, the description read through with real clicks on Next):
//  1. each of the five booths on Playhouse Row on the festival night, and the ring toss in the festival hall: that
//     game's corner opens once the description ends (the right game, in Practice), and Leave returns to the world;
//  2. a creature close by: the description, then the refusal said in words; no game opens;
//  3. never stale: a booth's ask whose scene ends on another map opens nothing; one left by a journey that was quit
//     before its scene ended opens nothing in the next journey, at its first settled moment or later; one whose scene
//     a load ended that then failed (the same journey and map kept: Agnes 6446894553) opens nothing either;
//  4. never twice: two asks in one scene open one game, the later one's;
//  5. the Distractions path as before: Ledger › Distractions › Festival games › a game with Nao, then Begin;
//  6. no page errors, no network.
// Usage: node tools/build.mjs && node tests/e2e/festival_booths.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };

// Manybridge, Chapter 4, the night of the Opening of the River (as tests/e2e/sequence_world_p16_mb.mjs's FEST)
const FEST = { departed: true, ch1_done: true, ch2_done: true, mb_arrived: true, mb1_done: true, mb_main_done: true, mp_arrived: true,
  mp_sobe_met: true, mp_press_open: true, press_printed: true, press_notice: true, mp_theatre_seen: true, mp_rehearsal_done: true,
  mp_fest_heard: true, mp_under_open: true, mp_prep_met: true, mp_lan_bank: true, mp_prep_lanterns: true, mp_st_bank: true,
  mp_prep_stalls: true, mp_proc_drums: true, mp_prep_procession: true, mp_under_seen: true, mp_book1: true, mp_book2: true, mp_book3: true,
  mp_bottom_seen: true, mp_under_done: true, mp_yukata: true, mp_fest_night: true, mp_fest_walked: true, pt_festival: true };
// after the festival: the chapter over, the stall games kept in the festival hall
const AFTER = Object.assign({}, FEST, { mp_fest_night: false, mb2_done: true, mp_main_done: true });
const BOOTHS = [['yoyo', 15, 19], ['wanage', 19, 19], ['katanuki', 31, 19], ['kuji', 35, 19], ['taiko', 44, 19]];

// a journey on `map` (Nao along), the notices and the festival's launches recorded, test-only scenes added
async function start(p, map, x, y, flags) {
  await p.evaluate(async ([map, x, y, flags]) => {
    const f = Object.assign({}, flags); for (const k in flags) if (!flags[k]) delete f[k];
    const s = RB.game.debugStart(map, x, y, { edition: 2, comp: 'nao', dir: 'down', flags: f });
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true;
    RB.game.settings.textSpeed = 'instant';
    RB.save.autosave = async () => {};
    window.__notes = window.__notes || [];
    if (!RB.ui.notice.__rec) { const n = RB.ui.notice; RB.ui.notice = (t, k) => { window.__notes.push(String(t)); return n(t, k); }; RB.ui.notice.__rec = true; }
    window.__launches = window.__launches || [];
    if (!RB.activity.launch.__rec) { const l = RB.activity.launch; RB.activity.launch = function (kind, ctx) { if (kind === 'festival') window.__launches.push((ctx && ctx.source) + ':' + (ctx && ctx.game)); return l.apply(this, arguments); }; RB.activity.launch.__rec = true; }
    if (!RB.content.scenes['test.booth_warp']) {
      RB.script.add([
        '@scene test.booth_warp', '!hook fest_booth wanage', 'narr: まだ 。 || Not yet.', '!warp mp.blockprint 22 21 down', '',
        '@scene test.booth_hold', '!hook fest_booth wanage', 'narr: まだ 。 || Not yet.', '',
        '@scene test.plain', 'narr: よし 。 || Right.', '',
        '@scene test.booth_twice', '!hook fest_booth yoyo', '!hook fest_booth kuji', 'narr: ふたつ 。 || Two.', '',
      ].join('\n'), 'test');
    }
    const W = RB.world.W, t0 = performance.now();
    while (W.time - W.enteredAt < 1100 && performance.now() - t0 < 30000) await new Promise((r) => setTimeout(r, 50));
  }, [map, x, y, flags]);
  await p.waitForTimeout(150);
}
const reset = (p) => p.evaluate(() => { window.__notes.length = 0; window.__launches.length = 0; });
// stand beside the prop at (x, y), facing it, as RB.test.use does (but with the automated player off: it would skip
// the booth's game), then press OK
async function useProp(p, x, y) {
  const at = await p.evaluate(([x, y]) => {
    const W = RB.world.W, pr = W.map.props.find((q) => q.x === x && q.y === y), pd = (pr && RB.props.P[pr.p]) || {};
    const pw = (pr && pr.w) || pd.w || 1, ph = (pr && pr.h) || pd.h || 1;
    for (let yy = y; yy < y + ph; yy++) for (let xx = x; xx < x + pw; xx++) {
      for (const [dx, dy, dir] of [[0, 1, 'up'], [-1, 0, 'right'], [1, 0, 'left'], [0, -1, 'down']]) {
        const nx = xx + dx, ny = yy + dy;
        if (nx >= x && nx < x + pw && ny >= y && ny < y + ph) continue;
        if (RB.maps.blockedStatic(W.map, nx, ny) || RB.maps.exitAt(W.map, nx, ny) || W.npcs.some((n) => n.x === nx && n.y === ny)) continue;
        const P = W.player; P.x = P.fx = nx; P.y = P.fy = ny; P.mv = null; P.dir = dir;
        RB.game.s.x = nx; RB.game.s.y = ny; RB.game.s.dir = dir;
        if (W.comp) { W.comp.x = W.comp.fx = nx; W.comp.y = W.comp.fy = ny; W.comp.mv = null; }
        return { x: nx, y: ny, dir };
      }
    }
    return null;
  }, [x, y]);
  if (!at) return null;
  await p.waitForTimeout(120);
  await p.keyboard.press('Enter');
  return at;
}
// read a scene through with real clicks on Next; the lines it showed
async function readThrough(p) {
  const lines = [];
  for (let i = 0; i < 150; i++) {
    const st = await p.evaluate(() => ({ dlg: !!document.querySelector('.dlg:not(.hidden)'), run: RB.script.isRunning(), line: (document.querySelector('.dlg:not(.hidden) .main') || {}).textContent || '' }));
    // (Next only while it is really there: a scene's fade or warp can leave the box up but hidden)
    if (st.dlg && st.run && await p.locator('.dlg .b-next').isVisible()) {
      // (a click the box's fade took away first is simply tried again on the next pass)
      if (await p.locator('.dlg .b-next').click({ timeout: 2000 }).then(() => true, () => false)) lines.push(st.line);
      await p.waitForTimeout(120); continue;
    }
    if (!st.run) break;
    await p.waitForTimeout(80);
  }
  return lines;
}
// the festival game now open (if any), a moment after the scene
async function openGame(p, ms) {
  await p.waitForFunction(() => RB.activity.active() || false, null, { timeout: ms || 2500 }).catch(() => {});
  return p.evaluate(() => {
    const a = RB.activity.active();
    const mode = document.querySelector('.fv-folio input[name=fv-mode]:checked');
    return a ? { kind: a.kind, game: a.ctx && a.ctx.game, source: a.ctx && a.ctx.source, folio: !!document.querySelector('.fv-folio'), mode: mode ? mode.value : null } : null;
  });
}
async function leave(p) {
  await p.locator('.fv-folio [data-folio-close]').click();
  await p.waitForFunction(() => !RB.activity.active() && RB.game.mode() === 'world', null, { timeout: 5000 }).catch(() => {});
  return p.evaluate(() => RB.game.mode());
}

// 1. the five booths on the festival night, then the ring toss in the festival hall
{
  const { p, errors, requests, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, 'mp.playhouse', 26, 24, FEST);
  for (const [id, x, y] of BOOTHS) {
    await reset(p);
    const at = await useProp(p, x, y);
    const said = await readThrough(p);
    const g = await openGame(p);
    ok(at && said.length >= 1 && g && g.kind === 'festival' && g.game === id && g.source === 'booth' && g.folio && g.mode === 'practice',
      '1 the ' + id + ' booth: its description (' + (said[0] || '').slice(0, 40) + '…), then its game, in Practice (' + JSON.stringify(g) + ')');
    const m = g ? await leave(p) : null;
    ok(m === 'world', '1 the ' + id + ' booth: Leave returns to the world (' + m + ')');
  }
  await start(p, 'mp.festhall', 7, 6, AFTER);
  await reset(p);
  const at = await useProp(p, 6, 3);
  const said = await readThrough(p);
  const g = await openGame(p);
  ok(at && said.length >= 1 && g && g.game === 'wanage' && g.source === 'booth' && g.mode === 'practice', '1 the festival hall: the ring toss opens after its description (' + JSON.stringify(g) + ')');
  if (g) await leave(p);
  ok(!errors.length && !requests.length, '1: no page errors, no network' + (errors.length ? ': ' + errors.slice(0, 2).join(' | ') : ''));
  await ctx.close();
}

// 2. a creature close by
{
  const { p, errors, requests, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, 'mp.playhouse', 26, 24, FEST);
  await reset(p);
  // a creature two tiles off as the scene ends: added when the story settles, after the scene's end has placed the
  // map's own creatures again (src/engine/50_world.js refreshActors) and before the booth's game is asked for
  await p.evaluate(() => {
    const off = RB.bus.on('story:settled', () => {
      off();
      const W = RB.world.W;
      // (drawn as an actor is: a copy of the companion's own actor, marked a creature, with no patrol)
      const x = W.player.x + 2, y = W.player.y;
      window.__probe = Object.assign({}, W.comp || W.player, { id: 'probe', foe: true, def: {}, map: W.map.id, x, y, fx: x, fy: y, dir: 'down', mv: null, route: null, home: [x, y] });
      W.foes.push(window.__probe);
    });
  });
  const at = await useProp(p, 19, 19);
  const said = await readThrough(p);
  const g = await openGame(p, 1200);
  const notes = await p.evaluate(() => { const W = RB.world.W, i = W.foes.indexOf(window.__probe); if (i >= 0) W.foes.splice(i, 1); return window.__notes.slice(); });
  ok(at && said.length >= 1 && !g && notes.some((n) => /creature this close/.test(n)), '2 a creature close by: the description, then "' + notes.join(' | ') + '", and no game (' + JSON.stringify(g) + ')');
  ok(!errors.length && !requests.length, '2: no page errors, no network' + (errors.length ? ': ' + errors.slice(0, 2).join(' | ') : ''));
  await ctx.close();
}

// 3. never stale
{
  const { p, errors, requests, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, 'mp.playhouse', 26, 24, FEST);
  await reset(p);
  // the scene that asked ends on another map
  await p.evaluate(() => { RB.script.run('test.booth_warp'); });
  await readThrough(p);
  let g = await openGame(p, 1500);
  const where = await p.evaluate(() => RB.game.s.map);
  ok(where === 'mp.blockprint' && !g, '3 an ask whose scene ends on another map (' + where + ') opens nothing (' + JSON.stringify(g) + ')');
  // a journey quit before the asking scene ended: nothing opens in the next one
  await start(p, 'mp.playhouse', 26, 24, FEST);
  await reset(p);
  await p.evaluate(() => { RB.script.run('test.booth_hold'); });
  await p.waitForFunction(() => !!document.querySelector('.dlg:not(.hidden)'), null, { timeout: 5000 }).catch(() => {});
  const asked = await p.evaluate(() => RB.script.isRunning());
  await start(p, 'mp.playhouse', 26, 24, FEST);
  await p.evaluate(() => { RB.script.run('test.plain'); });
  await readThrough(p);
  g = await openGame(p, 1500);
  await p.evaluate(() => { RB.script.run('test.plain'); });
  await readThrough(p);
  const g2 = await openGame(p, 1500);
  const launches = await p.evaluate(() => window.__launches.slice());
  ok(asked && !g && !g2 && launches.length === 0, '3 an ask left by a quit journey opens nothing in the next, at its first settled moment or later (launches: ' + JSON.stringify(launches) + ')');
  // a load begun while the asking scene was showing, which then fails (an empty slot of this throwaway profile: nothing
  // saved there), keeping the same journey on the same map; the stories that settle after it open nothing
  await start(p, 'mp.playhouse', 26, 24, FEST);
  await reset(p);
  await p.evaluate(() => { RB.script.run('test.booth_hold'); });
  await p.waitForFunction(() => !!document.querySelector('.dlg:not(.hidden)'), null, { timeout: 5000 }).catch(() => {});
  const kept = await p.evaluate(async () => {
    const s0 = RB.game.s, map0 = s0.map, held = RB.script.isRunning();
    let err = null;
    try { await RB.game.loadCampaign(9); } catch (e) { err = String(e && e.message || e); }
    return { held, err, same: RB.game.s === s0, map: RB.game.s.map === map0, running: RB.script.isRunning(), mode: RB.game.mode() };
  });
  await p.evaluate(() => { RB.script.run('test.plain'); });
  await readThrough(p);
  g = await openGame(p, 1500);
  await p.evaluate(() => { RB.script.run('test.plain'); });
  await readThrough(p);
  const g3 = await openGame(p, 1500);
  const l3 = await p.evaluate(() => window.__launches.slice());
  ok(kept.held && kept.err && kept.same && kept.map && !kept.running && !g && !g3 && l3.length === 0,
    '3 an ask whose scene a failed load ended (the journey and map kept) opens nothing when later stories settle (' + JSON.stringify({ kept, launches: l3 }) + ')');
  ok(!errors.length && !requests.length, '3: no page errors, no network' + (errors.length ? ': ' + errors.slice(0, 2).join(' | ') : ''));
  await ctx.close();
}

// 4. never twice
{
  const { p, errors, requests, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, 'mp.playhouse', 26, 24, FEST);
  await reset(p);
  await p.evaluate(() => { RB.script.run('test.booth_twice'); });
  await readThrough(p);
  const g = await openGame(p);
  await p.waitForTimeout(600);
  const launches = await p.evaluate(() => window.__launches.slice());
  ok(g && g.game === 'kuji' && JSON.stringify(launches) === JSON.stringify(['booth:kuji']), '4 two asks in one scene open one game, the later one\'s (' + JSON.stringify({ g, launches }) + ')');
  if (g) await leave(p);
  ok(!errors.length && !requests.length, '4: no page errors, no network' + (errors.length ? ': ' + errors.slice(0, 2).join(' | ') : ''));
  await ctx.close();
}

// 5. the Distractions path
{
  const { p, errors, requests, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, 'mp.playhouse', 26, 24, AFTER);
  await reset(p);
  await p.evaluate(() => RB.ui.menu.open('distractions'));
  await p.waitForSelector('[data-ds="festival"]', { timeout: 5000 }).catch(() => {});
  await p.locator('[data-ds="festival"]').first().click();
  await p.waitForSelector('[data-ds-act="festival"][data-g="wanage"]', { timeout: 5000 }).catch(() => {});
  const label = await p.evaluate(() => (document.querySelector('[data-ds-act="festival"][data-g="wanage"]') || {}).textContent || '');
  await p.locator('[data-ds-act="festival"][data-g="wanage"]').click();
  const g = await openGame(p);
  await p.locator('.fv-folio [data-a=begin]').click().catch(() => {});
  await p.waitForTimeout(400);
  const st = await p.evaluate(() => RB.ui.festival.state());
  ok(/with Nao/.test(label) && g && g.game === 'wanage' && g.source === 'distractions' && st && st.view !== 'corner', '5 Distractions › Festival games › "' + label.trim() + '", then Begin: the game is played as before (' + JSON.stringify({ g, st }) + ')');
  if (g) await leave(p);
  ok(!errors.length && !requests.length, '5: no page errors, no network' + (errors.length ? ': ' + errors.slice(0, 2).join(' | ') : ''));
  await ctx.close();
}

console.log(`\nfestival_booths: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
