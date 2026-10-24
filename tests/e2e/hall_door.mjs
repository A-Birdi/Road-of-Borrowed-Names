// RBN-QA-051 (Agnes; refined by Agnes and Local): the Shuttered Hall's door (kr.hall, kr_halldoor at 14,10, 2×1) was
// drawn behind the hall's front wall, so the facade read as plain boards. In Chromium on the built game:
//  1. shut (without the keepers' ledger, and with it but not yet opened): the door, its straw rope and paper streamers
//     and a plaque over it are on the wall; the plaque's writing is worn to marks (no legible kanji drawn);
//  2. opened (lw_kr_hall_open): the leaves stand parted on the dark inside, the rope untied; after a real save and
//     load it is still open;
//  3. the same place, 2×1 footprint, blocking and scene in every state: the door's line at the door as before, shut;
//     the hall's other collision and props unchanged; you, standing in front, are drawn over the door;
//  4. the village doors and other props keep their old drawing order (onWall only on kr_halldoor, the Great Kiln's
//     seal and doorway, RBN-QA-024, Sono's noren on the Courier's Inn's front wall, RBN-QA-111, and Ashihara's forge
//     hours tag beside the forge door, RBN-QA-176; the village `door` markers not among them); no page errors.
// Usage: node tools/build.mjs && node tests/e2e/hall_door.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const FL = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_arrived: true };

async function at(flags, o = {}) {
  const { p, errors } = await page(b, url, { viewport: o.vp || { width: 1180, height: 757 } });
  await p.evaluate(([flags, o]) => {
    RB.game.debugStart('kr.hall', 14, 12, Object.assign(o.edition ? { edition: RB.edition.forNew() } : {}, { comp: 'suzu', dir: 'up', flags }));
    if (flags.hall_ledger) RB.game.s.inv = Object.assign(RB.game.s.inv || {}, { hall_ledger: 1 });
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.reducedMotion = true; RB.game.applySettings();
  }, [Object.assign({}, FL, flags), o]);
  await p.waitForTimeout(1100);
  return { p, errors };
}
// the door's drawing on the wall: pale paper (streamers), the plaque's tan, the dark of an open doorway
const look = (p) => p.evaluate(() => {
  const cv = document.querySelector('canvas'), g = cv.getContext('2d'), cam = RB.render.cam, v = RB.render.viewSize(), sx = cv.width / v.w, sy = cv.height / v.h;
  const box = (x0, y0, w, h) => { const d = g.getImageData(Math.round((x0 - cam.x) * sx), Math.round((y0 - cam.y) * sy), Math.round(w * sx), Math.round(h * sy)).data; return d; };
  const count = (d, f) => { let n = 0; for (let i = 0; i < d.length; i += 4) if (f(d[i], d[i + 1], d[i + 2])) n++; return n; };
  // the door's own area: two tiles wide, from a tile above its row to its row
  const d = box(14 * 16, 9 * 16 - 6, 32, 22), mid = box(14 * 16 + 10, 9 * 16, 12, 16);
  const M = RB.world.W.map, doors = M.props.filter((q) => q.p === 'kr_halldoor' && (!q.if || RB.state.test(RB.game.s, q.if)));
  return {
    paper: count(d, (r, gg, bb) => r > 215 && gg > 205 && bb > 185),
    // the plaque's own face over the doors (pale weathered wood), as a share of its rectangle
    tan: (() => { const q = box(14 * 16 + 12, 10 * 16 - 18, 8, 5); return Math.round(100 * count(q, (r, gg, bb) => r > 165 && gg > 145 && bb > 100 && r - bb > 25) / (q.length / 4)); })(),
    dark: count(mid, (r, gg, bb) => r < 40 && gg < 32 && bb < 28),
    doors: doors.map((q) => ({ x: q.x, y: q.y, open: !!(q.o && q.o.open), scene: q.scene })),
    block: [M.block[10 * M.w + 14], M.block[10 * M.w + 15]],
  };
});
// 1. shut, without the ledger
{
  const { p, errors } = await at({});
  const r = await look(p);
  ok(r.doors.length === 1 && !r.doors[0].open && r.doors[0].x === 14 && r.doors[0].y === 10 && r.block.join() === '1,1', 'shut: one door at (14,10), 2×1, blocking (' + JSON.stringify(r.doors) + ')');
  ok(r.paper > 25 && r.tan > 50, 'shut: the rope\'s paper streamers and the plaque are drawn on the wall (' + JSON.stringify({ paper: r.paper, plaquePct: r.tan }) + ')');
  await p.evaluate(() => { RB.world.W.player.dir = 'up'; RB.world.W.player.x = 14; RB.world.W.player.y = 11; RB.world.interact(); });
  let line = null;
  for (let i = 0; i < 30 && !line; i++) { await p.waitForTimeout(150); line = await p.evaluate(() => { const d = RB.ui.dialogue.isOpen() && RB.ui.dialogue.shown(); return d ? String(d.en || '') : null; }); }
  ok(/heavy door with a sacred rope/.test(line || ''), 'shut: the door\'s own line at the door, as before (' + (line || '').slice(0, 60) + ')');
  ok(!errors.length, 'shut: no page errors ' + errors.slice(0, 2).join(' | '));
  await p.close();
}
// 1b. the ledger held, the door not yet opened: still shut
{
  const { p, errors } = await at({ hall_ledger: true });
  const r = await look(p);
  ok(r.doors.length === 1 && !r.doors[0].open && r.paper > 25 && r.tan > 50, 'the ledger held, not yet opened: still shut (' + JSON.stringify({ doors: r.doors.length, open: r.doors[0] && r.doors[0].open, paper: r.paper }) + ')');
  ok(!errors.length, 'ledger held: no page errors');
  await p.close();
}
// 2. opened, and after a real save and load
{
  const { p, errors } = await at({ hall_ledger: true, lw_kr_hall_open: true }, { edition: true });
  const r = await look(p);
  ok(r.doors.length === 1 && r.doors[0].open && r.doors[0].x === 14 && r.block.join() === '1,1', 'opened: one door, standing open, the same place and blocking (' + JSON.stringify(r.doors) + ')');
  ok(r.dark > 60 && r.paper < 10 && r.tan > 50, 'opened: the dark inside between the parted leaves, no streamers, the plaque kept (' + JSON.stringify({ dark: r.dark, paper: r.paper, tan: r.tan }) + ')');
  await p.evaluate(async () => { await RB.save.manualSave(1); });
  const loaded = await p.evaluate(async () => { try { return await RB.game.loadCampaign(1, 'manual'); } catch (e) { return 'refused: ' + e.message; } });
  await p.waitForTimeout(1200);
  const q = await look(p);
  ok(loaded === true && q.doors.length === 1 && q.doors[0].open && q.dark > 60, 'opened: still open after a real save and load (' + JSON.stringify({ loaded, open: q.doors[0] && q.doors[0].open, dark: q.dark }) + ')');
  ok(!errors.length, 'opened: no page errors ' + errors.slice(0, 2).join(' | '));
  await p.close();
}
// 3. the hall's geometry the same in both states; you in front of the door are drawn over it
{
  const { p, errors } = await at({});
  const geo = await p.evaluate(() => {
    const one = () => { RB.maps.invalidate(); const M = RB.maps.compile('kr.hall'); return { block: Array.from(M.block).join(''), props: M.props.filter((q) => !q.if || RB.state.test(RB.game.s, q.if)).map((q) => q.p + '@' + q.x + ',' + q.y).sort().join(' ') }; };
    const a = one(); RB.game.s.flags.lw_kr_hall_open = true; const z = one(); delete RB.game.s.flags.lw_kr_hall_open;
    const pd = RB.props.P;
    const onWall = Object.keys(pd).filter((k) => pd[k].onWall);
    return { same: a.block === z.block && a.props === z.props, onWall };
  });
  ok(geo.same, 'the hall\'s collision and placements are the same shut and open');
  // (an allowlist: kr_halldoor here, the Great Kiln's seal and doorway from RBN-QA-024; Local CL-075; Sono's noren,
  // which hangs on the Courier's Inn's front wall at Sakashita, from RBN-QA-111, src/content/cr/02_art.js; and the forge's
  // hours tag on the forge's wall beside its door at Ashihara, from RBN-QA-176, src/content/settle/02_art.js)
  ok(geo.onWall.slice().sort().join() === 'as_forgetag,co_kilnmouth,co_seal,cr_noren,kr_halldoor' && geo.onWall.indexOf('door') < 0, 'only kr_halldoor, the Great Kiln\'s seal and doorway, Sono\'s noren and the forge\'s hours tag draw on the wall (the village doors and every other prop as before) (' + JSON.stringify(geo.onWall) + ')');
  await p.evaluate(() => { const P = RB.world.W.player; P.x = 14; P.y = 11; P.fx = 14; P.fy = 11; P.dir = 'up'; });
  await p.waitForTimeout(500);
  // your head overlaps the door's lower edge: drawn over it, the door's colours do not cover you
  const head = await p.evaluate(() => {
    const cv = document.querySelector('canvas'), g = cv.getContext('2d'), cam = RB.render.cam, v = RB.render.viewSize(), sx = cv.width / v.w, sy = cv.height / v.h;
    const d = g.getImageData(Math.round((14 * 16 + 3 - cam.x) * sx), Math.round((11 * 16 - 10 - cam.y) * sy), Math.round(10 * sx), Math.round(8 * sy)).data;
    let paper = 0; for (let i = 0; i < d.length; i += 4) if (d[i] > 215 && d[i + 1] > 205 && d[i + 2] > 185) paper++;
    return paper;
  });
  ok(head < 6, 'you, standing in front of the door, are drawn over it (door paper over your head: ' + head + ' px)');
  ok(!errors.length, 'geometry: no page errors ' + errors.slice(0, 2).join(' | '));
  await p.close();
}
// a phone: the plaque and rope read there too
{
  const { p, errors } = await at({}, { vp: { width: 390, height: 844 } });
  const r = await look(p);
  ok(r.paper > 25 && r.tan > 50 && !errors.length, 'a phone: the rope and plaque drawn, no page errors (' + JSON.stringify({ paper: r.paper, tan: r.tan }) + ')');
  await p.close();
}
console.log(`\nhall_door: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
