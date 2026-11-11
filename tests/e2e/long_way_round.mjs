// The Long Way Round's middle roots, walked (Kotonoha; Agnes 6550658712 and 6550969828; Local CL-577, CL-578; Cloud
// CC-418, CC-419). The arch at (11,15) is two wide and one high, but the passage is three rows high: before this change
// you could walk past it on row 17, reach the second leaf (C) and the reunion, and never see the first (B). Now the
// passage is walled at (11..12, 16..17). In Chromium on the built game, with real key presses (the interact key, Z,
// for the leaves and the arch), a save loaded from the title's own Load ledger by its row's Load button, and the echo
// set aside as beaten so that a walk is not a battle (except in 7):
//  1. before B, from the entrance (28,18): the old way (under the arch along row 17, west of (13,17)) is closed, and so
//     are rows 15 and 16; the arch's own line, facing it; the guide names B's leaf (26,20);
//  2. B's leaf read and its word put back (the real challenge, answered): the roots draw back; walked west along row 15
//     under where the arch was; the guide names C's leaf (4,6);
//  3. C's leaf read and its word put back: the way north opens; walked out by it into the Tidal Hollow (2,4); the
//     reunion plays on the next step, the quest at 6;
//  4. a journey standing west of the roots with neither leaf done (where one that took the old way stands), written to
//     a slot and loaded from the Load ledger: where it was; the guide names B's leaf across the roots (the known limit,
//     Agnes 6550969828); walked east, the arch stops you and says where the key is; C's leaf read, out by the way
//     north, the reunion, the Tidal Hollow's west way back to the entrance, and B's leaf read: nobody is stranded;
//  5. the same save with C done: the guide never sends it back to B; out by the way north;
//  6. a save standing on each of the four new wall cells, loaded from the Load ledger: on a free tile beside them, and
//     from there that side's leaf reached on foot;
//  7. the echo's real patrol (not set aside), watched from (18,16): it moves near (5,10), never onto the four cells;
//  8. no page errors.
// Screenshots (the arch before B, the narrowed passage after) go to RB_SHOTS, or to the system's temporary folder.
// Usage: node tools/build.mjs && node tests/e2e/long_way_round.mjs   (RB_ONLY=1,4 runs only those parts; 1 runs 1-3)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const info = (m) => console.log('     ' + m);
const flat = (x) => JSON.stringify(x);
const SHOTS = process.env.RB_SHOTS || path.join(os.tmpdir(), 'rb_long_way_round');
fs.mkdirSync(SHOTS, { recursive: true });
const PRE = ['ch1_done', 'ch2_done', 'mb2_done', 'ch3_done', 'ch4_done', 'kr_done', 'ch5_done', 'departed'];
const KO = PRE.concat(['ko_ch9', 'ko_arrived', 'ko_otoha_met', 'ko_tell_otoha', 'ko_tell_nami', 'ko_tell_hamaji', 'ko_tell_shell', 'tell_ko.t_hall_ok', 'ko_hollow_open', 'ko_roots_seen', 'ko_root_a', 'ko_tide_in', 'ko_apart', 'ko_round_seen']);
const KEY = { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' };
const CELLS = [[11, 16], [12, 16], [11, 17], [12, 17]];
const ARCH = 'Roots knotted together block the way. Something in the wind nearby seems to be the key.';
const errorsAll = [];
const ONLY = (process.env.RB_ONLY || '').split(',').filter(Boolean);
const run = (n) => !ONLY.length || ONLY.includes(String(n));

async function start(p, { x = 28, y = 18, dir = 'left', map = 'ko.roots3', flags = [], echo = false } = {}) {
  await p.evaluate(([map, x, y, dir, flags, echo]) => {
    const f = {}; flags.forEach((k) => (f[k] = true));
    if (!echo) f['foe:ko.roots3:r3a'] = true;
    const s = RB.game.debugStart(map, x, y, { dir, edition: RB.edition.forNew(), comp: 'mio', flags: f });
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true;
    RB.state.setQuest(s, 'ko_main', 5);
    s.player.nameJp = 'ハル'; s.learn.kanaKnown = 'both'; s.learn.profile = 'E';
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.suzuSpeech = 'standard'; RB.game.settings.lightbulb = false;
    RB.game.applySettings();
    RB.world.enter(map, x, y, dir, { fresh: true });
  }, [map, x, y, dir, KO.concat(flags), echo]);
  await p.waitForTimeout(700);
}
const look = () => {
  const d = RB.ui.dialogue.isOpen() && RB.ui.dialogue.shown(), W = RB.world.W, s = RB.game.s;
  return { map: W.map.id, d: d ? String(d.en || '') : null, run: RB.script.isRunning(), pc: [W.player.x, W.player.y], mode: RB.game.mode(),
    b: !!s.flags.ko_root_b, c: !!s.flags.ko_root_c, apart: !!s.flags.ko_apart, stage: s.quests.ko_main && s.quests.ko_main.stage, chal: !!document.querySelector('.chal') };
};
const guide = (p) => p.evaluate(() => { const r = RB.questGuide.analyse('ko_main', RB.game.s); return [r.how, (r.targets || []).map((t) => [t.map, t.x, t.y])]; });
// the open language step, answered right (choice mode)
async function answer(p) {
  await p.evaluate(() => { const tab = document.querySelector('.chal-tabs .ptab[data-mode="choice"]'); if (tab) tab.click(); });
  await p.waitForSelector('.chal .mc .btn', { timeout: 8000 });
  const n = await p.evaluate(() => document.querySelectorAll('.chal .mc .btn').length);
  for (let k = 0; k < n; k++) {
    await p.evaluate((k) => { const bt = [...document.querySelectorAll('.chal .mc .btn')][k]; if (bt && !bt.disabled) bt.click(); }, k);
    await p.waitForTimeout(120);
    if (await p.evaluate(() => !!document.querySelector('.fbwrap[data-fb=ok] .fb-go'))) break;
    const again = await p.evaluate(() => { const g = document.querySelector('.fbwrap:not([data-fb=ok]) .fb-go, .fbwrap:not([data-fb=ok]) [data-a=retry]'); if (g) { g.click(); return true; } return false; });
    if (again) await p.waitForTimeout(150);
  }
  await p.waitForSelector('.fbwrap[data-fb=ok] .fb-go', { timeout: 8000 });
  await p.click('.fbwrap[data-fb=ok] .fb-go');
}
// play out whatever runs (lines advanced, a challenge answered right); the lines shown, or null
async function play(p) {
  const lines = [];
  for (let i = 0; i < 500; i++) {
    const st = await p.evaluate(look);
    if (st.chal) { await answer(p); await p.waitForTimeout(300); continue; }
    if (st.d) { if (lines[lines.length - 1] !== st.d) { lines.push(st.d); await p.waitForTimeout(100); await p.evaluate(() => RB.ui.dialogue.isOpen() && RB.ui.dialogue.advance()); } await p.waitForTimeout(80); continue; }
    if (!st.run && st.mode === 'world' && (lines.length || i > 6)) break;
    await p.waitForTimeout(80);
  }
  await p.waitForTimeout(400);
  return lines.length ? lines : null;
}
// one step with a real key press (facing that way first, as a held key turns you); let go once the step has begun
async function step(p, dir) {
  const from = await p.evaluate((dir) => { const P = RB.world.W.player; P.dir = dir; return [P.x, P.y]; }, dir);
  await p.keyboard.down(KEY[dir]);
  await p.waitForFunction(([x, y]) => { const P = RB.world.W.player; return !!P.mv || P.x !== x || P.y !== y || RB.game.mode() !== 'world'; },
    from, { polling: 'raf', timeout: 900 }).catch(() => {});
  await p.keyboard.up(KEY[dir]);
  await p.waitForTimeout(380);
  for (let i = 0; i < 40 && (await p.evaluate(() => RB.game.mode())) === 'transition'; i++) await p.waitForTimeout(100);
}
// press each key in turn; where you stood after each
async function press(p, dirs) {
  const at = [];
  for (const d of dirs) { await step(p, d); at.push((await p.evaluate(look)).pc.join(',')); }
  return at;
}
// walk to (tx,ty) (or beside it) on the current map by the shortest way the engine's own collision allows, a key press a
// step; anything that plays on the way is played out. { arrived, at, lines }
async function goTo(p, tx, ty, beside = false) {
  const lines = [];
  for (let tries = 0; tries < 6; tries++) {
    const route = await p.evaluate(([tx, ty, beside]) => {
      const W = RB.world.W, m = W.map, P = W.player, k = (x, y) => x + ',' + y;
      const goal = (x, y) => (beside ? Math.abs(x - tx) + Math.abs(y - ty) === 1 : x === tx && y === ty);
      if (goal(P.x, P.y)) return [];
      const prev = new Map([[k(P.x, P.y), null]]), q = [[P.x, P.y]];
      const D = [['up', 0, -1], ['down', 0, 1], ['left', -1, 0], ['right', 1, 0]];
      while (q.length) {
        const [x, y] = q.shift();
        for (const [d, dx, dy] of D) {
          const nx = x + dx, ny = y + dy;
          if (prev.has(k(nx, ny)) || RB.maps.blockedStatic(m, nx, ny) || RB.maps.exitAt(m, nx, ny)) continue;
          prev.set(k(nx, ny), [x, y, d]);
          if (goal(nx, ny)) { const out = []; let c = [nx, ny]; while (prev.get(k(c[0], c[1]))) { const [px, py, pd] = prev.get(k(c[0], c[1])); out.unshift(pd); c = [px, py]; } return out; }
          q.push([nx, ny]);
        }
      }
      return null;
    }, [tx, ty, beside]);
    if (route === null) return { arrived: false, at: (await p.evaluate(look)).pc, lines, noRoute: true };
    if (!route.length) return { arrived: true, at: (await p.evaluate(look)).pc, lines };
    let stuck = false;
    for (const d of route) {
      const before = (await p.evaluate(look)).pc.join(',');
      await step(p, d);
      const st = await p.evaluate(look);
      if (st.run || st.d || st.chal) { const L = await play(p); if (L) lines.push(...L); break; }
      if (st.pc.join(',') === before) { stuck = true; break; }
    }
    if (stuck) return { arrived: false, at: (await p.evaluate(look)).pc, lines };
  }
  const st = await p.evaluate(look);
  return { arrived: beside ? Math.abs(st.pc[0] - tx) + Math.abs(st.pc[1] - ty) === 1 : st.pc[0] === tx && st.pc[1] === ty, at: st.pc, lines };
}
// face (tx,ty) from beside it and use it (the real key); what played
async function use(p, tx, ty) {
  const dir = await p.evaluate(([tx, ty]) => { const P = RB.world.W.player; return tx > P.x ? 'right' : tx < P.x ? 'left' : ty > P.y ? 'down' : 'up'; }, [tx, ty]);
  await p.evaluate((dir) => { RB.world.W.player.dir = dir; }, dir);
  await p.waitForTimeout(120);
  const pre = await p.evaluate(() => { const P = RB.world.W.player; return { pc: [P.x, P.y], dir: P.dir, mode: RB.game.mode() }; });
  await p.keyboard.press('KeyZ');
  await p.waitForTimeout(300);
  const L = await play(p);
  if (!L) info('use(' + tx + ',' + ty + '): nothing played ' + flat(pre));
  return L;
}
// out of the Long Way Round by the way north (22,0), and the step after it in the Tidal Hollow
async function outNorth(p) {
  const w = await goTo(p, 22, 1);
  await step(p, 'up');
  await p.waitForTimeout(500);
  const there = await p.evaluate(look);
  const L0 = await play(p);
  await step(p, 'up');
  const L = await play(p);
  return { w, there, L0, L, after: await p.evaluate(look) };
}
// a journey written to a slot, the page reloaded, and the slot loaded from the title's own Load ledger (its row's Load
// button, as a player would: the title menu is closed by it, so the keys are the world's again)
async function saveLoad(p, slot, edit) {
  await p.evaluate(async ([slot, edit]) => {
    const s = RB.game.s;
    if (edit) { if (edit.x != null) { s.x = edit.x; s.y = edit.y; } Object.assign(s.flags, edit.flags || {}); }
    await RB.save.writeSlot(slot, s, { force: true });
    await RB.game.toTitle();
  }, [slot, edit || null]);
  await p.reload();
  await p.waitForSelector('.title [data-a=load]');
  await p.waitForTimeout(300);
  await p.click('.title [data-a=load]');
  await p.waitForSelector('.folio-ledger .rec');
  const tab = 'lp' + Math.floor((slot - 1) / 6);
  if (await p.getAttribute('.folio-ledger .ptab[data-id=' + tab + ']', 'aria-selected') !== 'true') await p.click('.folio-ledger .ptab[data-id=' + tab + ']');
  await p.waitForSelector('.folio-ledger .rec[data-slot="' + slot + '"] [data-a=load]');
  await p.click('.folio-ledger .rec[data-slot="' + slot + '"] [data-a=load]');
  await p.waitForFunction(() => RB.game.G.playing && RB.game.mode() === 'world' && !(RB.ui.topLayer && RB.ui.topLayer()), null, { timeout: 15000 }).catch(() => {});
  await p.evaluate(() => { RB.game.settings.textSpeed = 'instant'; RB.game.applySettings(); });
  await p.waitForTimeout(700);
  return Object.assign(await p.evaluate(look), { top: await p.evaluate(() => !!(RB.ui.topLayer && RB.ui.topLayer())) });
}
async function fresh(fn) {
  const { p, errors } = await page(b, url, { viewport: { width: 1180, height: 860 } });
  try { await fn(p); } finally { errorsAll.push(...errors); await p.context().close(); }
}

// ---- 1-3. a fresh journey: the old way closed; B, then C, then out and the reunion -------------------------------------
if (run(1)) await fresh(async (p) => {
  await start(p);
  const g0 = await guide(p);
  // the old way: to (14,17), then west along row 17, as Agnes's 1 -> 3 -> reunion went before this change
  const w17 = await goTo(p, 14, 17);
  const row17 = await press(p, ['left', 'left', 'left', 'left', 'left']);
  info('1 the old way, walked: (14,17) then left x5: ' + row17.join(' '));
  ok(w17.arrived && row17.every((c) => c === '13,17'), '1 before B: the old way under the arch along row 17 is closed at (13,17) ' + flat(row17));
  const w16 = await goTo(p, 14, 16);
  const row16 = await press(p, ['left', 'left']);
  const w15 = await goTo(p, 13, 15);
  const row15 = await press(p, ['left', 'left']);
  ok(w16.arrived && row16.every((c) => c === '14,16') && w15.arrived && row15.every((c) => c === '13,15'), '1 and rows 16 and 15: the rock at (13,16), the arch at (12,15) ' + flat({ row16, row15 }));
  const L1 = await use(p, 12, 15);
  ok(!!L1 && L1.length === 1 && L1[0] === ARCH, '1 facing the arch: its own line, the key in the wind nearby ' + flat(L1));
  ok(flat(g0) === flat(['authored', [['ko.roots3', 26, 20]]]), '1 the guide: B\'s leaf (26,20) ' + flat(g0));
  await p.screenshot({ path: path.join(SHOTS, 'lwr_1_before_b.png') });
  // ---- 2. B
  const wB = await goTo(p, 26, 20, true);
  const LB = await use(p, 26, 20);
  const afterB = await p.evaluate(look);
  ok(wB.arrived && afterB.b && !afterB.c && !!LB, '2 B\'s leaf read and its word put back: ko_root_b ' + flat({ at: wB.at, lines: LB && LB.length }));
  const gB = await guide(p);
  const wW = await goTo(p, 14, 15);
  const row15b = await press(p, ['left', 'left', 'left', 'left']);
  info('2 after B, row 15 walked from (14,15): ' + row15b.join(' '));
  ok(wW.arrived && flat(row15b) === flat(['13,15', '12,15', '11,15', '10,15']), '2 after B: walked west along row 15 under where the arch was ' + flat(row15b));
  ok(flat(gB) === flat(['needs', [['ko.roots3', 4, 6]]]), '2 the guide: C\'s leaf (4,6), as before ' + flat(gB));
  await press(p, ['right', 'right']);
  await p.screenshot({ path: path.join(SHOTS, 'lwr_2_after_b.png') });
  // ---- 3. C, the way north, the reunion
  const wC = await goTo(p, 4, 6, true);
  const LC = await use(p, 4, 6);
  const afterC = await p.evaluate(look);
  ok(wC.arrived && afterC.c && !!LC, '3 C\'s leaf read and its word put back: ko_root_c ' + flat({ at: wC.at }));
  const o = await outNorth(p);
  const re = [...(o.L0 || []), ...(o.L || [])].some((l) => /water at your feet is going down/.test(l));
  ok(o.w.arrived && o.there.map === 'ko.roots2' && flat(o.there.pc) === '[2,4]' && re && o.after.stage === 6 && !o.after.apart,
    '3 out by the way north into the Tidal Hollow (2,4); the reunion on the next step, the quest at 6 ' + flat({ there: o.there.map + ' ' + o.there.pc, stage: o.after.stage, apart: o.after.apart }));
});

// ---- 4. a west-side save from before the change, neither leaf done ---------------------------------------------------
if (run(4)) await fresh(async (p) => {
  await start(p, { x: 4, y: 8, dir: 'down' });
  const L0 = await saveLoad(p, 3);
  const g = await guide(p);
  ok(L0.map === 'ko.roots3' && flat(L0.pc) === '[4,8]' && !L0.b && !L0.c, '4 a west-side save with neither leaf, Loaded: where it was (4,8) ' + flat({ map: L0.map, pc: L0.pc }));
  ok(flat(g) === flat(['authored', [['ko.roots3', 26, 20]]]), '4 the guide names B\'s leaf across the roots: the known limit (its way out is C) ' + flat(g));
  const wE = await goTo(p, 10, 15);
  const east = await press(p, ['right', 'right']);
  const LA = await use(p, 11, 15);
  ok(wE.arrived && east.every((c) => c === '10,15') && !!LA && LA[0] === ARCH, '4 walked east: the arch stops you at (10,15) and says where the key is ' + flat({ east, LA }));
  const wC = await goTo(p, 4, 6, true);
  const LC = await use(p, 4, 6);
  const c = await p.evaluate(look);
  ok(wC.arrived && !!LC && c.c && !c.b, '4 C\'s leaf read: ko_root_c, B still not ' + flat({ at: wC.at }));
  const o = await outNorth(p);
  const re = [...(o.L0 || []), ...(o.L || [])].some((l) => /water at your feet is going down/.test(l));
  ok(o.there.map === 'ko.roots2' && re && o.after.stage === 6, '4 out by the way north; the reunion; the quest at 6 ' + flat({ there: o.there.map, stage: o.after.stage }));
  // back round by the Tidal Hollow's west way (0,18), to the Long Way Round's entrance, and B
  const wX = await goTo(p, 1, 18);
  await step(p, 'left');
  await p.waitForTimeout(500);
  const back = await p.evaluate(look);
  const L1 = await play(p);
  const wB = await goTo(p, 26, 20, true);
  const LB = await use(p, 26, 20);
  const fin = await p.evaluate(look);
  ok(wX.arrived && back.map === 'ko.roots3' && flat(back.pc) === '[28,18]' && wB.arrived && !!LB && fin.b, '4 back by the west way to the entrance (28,18), and B\'s leaf read: nobody stranded ' + flat({ back: back.map + ' ' + back.pc, L1: !!L1, b: fin.b }));
});

// ---- 5. the same save with C done ----------------------------------------------------------------------------------
if (run(5)) await fresh(async (p) => {
  await start(p, { x: 4, y: 8, dir: 'down', flags: ['ko_root_c'] });
  const L0 = await saveLoad(p, 3);
  const g = await guide(p);
  ok(flat(L0.pc) === '[4,8]' && L0.c && !L0.b && g[0] === 'direct' && g[1].length > 0 && g[1].every(([m]) => m === 'ko.roots2'), '5 the same save with C done, Loaded: the guide names the Tidal Hollow, never B ' + flat(g));
  const o = await outNorth(p);
  ok(o.there.map === 'ko.roots2', '5 out by the way north ' + flat({ there: o.there.map + ' ' + o.there.pc }));
});

// ---- 6. a save on each of the four new wall cells --------------------------------------------------------------------
for (const [x, y] of run(6) ? CELLS : []) {
  await fresh(async (p) => {
    await start(p, { x: 14, y: 15, dir: 'left' });
    const L = await saveLoad(p, 3, { x, y });
    const free = await p.evaluate(([x, y]) => { const W = RB.world.W; return { free: !RB.maps.blockedStatic(W.map, W.player.x, W.player.y), cell: W.player.x === x && W.player.y === y, saved: [x, y] }; }, [x, y]);
    const east = L.pc[0] >= 13;
    const w = east ? await goTo(p, 26, 20, true) : await goTo(p, 4, 6, true);
    ok(L.map === 'ko.roots3' && free.free && !free.cell && Math.abs(L.pc[0] - x) + Math.abs(L.pc[1] - y) <= 2 && w.arrived,
      '6 a save on (' + x + ',' + y + '), Loaded: on a free tile beside it ' + flat(L.pc) + ', the ' + (east ? 'east' : 'west') + ' side, and that side\'s leaf (' + (east ? 'B' : 'C') + ') reached on foot');
  });
}

// ---- 7. the echo's real patrol --------------------------------------------------------------------------------------
// (creatures keep still while you are within two tiles of a puzzle's prop, src/engine/50_world.js atMechanism: the
// entrance is two from B's leaf, so this watches from the middle of the way in, (18,16), near none)
if (run(7)) await fresh(async (p) => {
  await start(p, { x: 18, y: 16, echo: true });
  const seen = [];
  for (let i = 0; i < 50; i++) {
    const e = await p.evaluate(() => { const f = RB.world.W.foes.find((a) => a.id === 'r3a' || (a.def && a.def.id === 'r3a')); return f ? [f.x, f.y] : null; });
    if (e) seen.push(e.join(','));
    await p.waitForTimeout(200);
  }
  const at = [...new Set(seen)];
  info('7 the echo, every 200 ms for 10 s: ' + at.join(' '));
  ok(at.length >= 2 && at.every((c) => { const [x, y] = c.split(',').map(Number); return Math.abs(x - 5) <= 2 && Math.abs(y - 10) <= 2 && !CELLS.some(([a, bb]) => a === x && bb === y); }),
    '7 the echo patrols near (5,10), never onto the four cells ' + flat(at));
});

ok(!errorsAll.length, '8 no page errors ' + errorsAll.join('; '));
console.log('screenshots: ' + SHOTS);
await b.close();
srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
