// The guide's diamond over a drift of written leaves on Kotonoha's shore sits on the drift, not a person's height above
// it (RBN-QA-074; Agnes 6318281495, Local CL-114): a prop that says where what is drawn of it starts (markTop) is
// marked just above that, over the middle of all its tiles. In Chromium on the built game, from a synthetic campaign of
// the shipped edition, at 1280×800 and at 390×844 on a phone (touch), with Otoha's leaves the step (two sent home,
// so the guide marks the two drifts on the Shore of Leaves that hold one; Agnes's case is the one at 9,14):
//  1. not faced, held still (reduced motion): the diamond is over the middle of the drift as its own art draws it (within
//     2 px), its tip above the drift's highest leaf by 1 to 6 art px, and no pixel of the drift's leaves under it;
//  2. faced, from the south (its first tile) and from the north (its second): the diamond where it was, and the ▾ (you
//     can act here) clear above it;
//  3. in motion, over six frames: the diamond's lowest pixel always above the drift's highest leaf;
//  4. what is not this item stays as it was, in Reedwake while the labels are half done: Suzu, marked at a standing
//     person's head; the dead lanterns (props without markTop), at the same height over their tile;
//  5. picked up (the action key on the drift, its scene to the end): that drift is marked no longer, and the leaf is
//     held;
//  6. no page errors.
// Usage: node tools/build.mjs && node tests/e2e/leaf_marker.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };

const FLAGS = { departed: true, ko_arrived: true, ko_ch9: true, ch5_done: true, ko_ret_mp: true, ko_ret_mb: true };
async function start(p, map, x, y, dir, o) {
  await p.evaluate(async ({ map, x, y, dir, o, FLAGS }) => {
    RB.test.enable({ battle: 'unravel' });
    const s = RB.game.debugStart(map, x, y, { comp: 'suzu', flags: Object.assign({}, FLAGS, o.flags || {}), dir, edition: RB.edition.forNew() });
    s.chapter = 9;
    s.quests.ko_main = { stage: 2, done: false, t: 1 };
    s.vars = s.vars || {}; s.vars.ko_ret = 2;
    for (const it of o.items || []) RB.state.give(s, it, 1);
    RB.questGuide.follow('ko_main');
    RB.game.settings.textSpeed = 'instant';
    RB.game.settings.reducedMotion = !!o.still;
    RB.game.applySettings();
    RB.world.refreshActors();
    RB.questMarks.refresh();
    const W = RB.world.W, t0 = performance.now();
    while (W.time - W.enteredAt < 1100 && performance.now() - t0 < 30000) await new Promise((r) => setTimeout(r, 50));
    // and the camera at rest (the marks are read from the last frame drawn, the tiles from the camera now)
    let last = '', same = 0;
    while (same < 3 && performance.now() - t0 < 30000) { await new Promise((r) => setTimeout(r, 100)); const k = RB.render.cam.x + ',' + RB.render.cam.y; same = k === last ? same + 1 : 0; last = k; }
  }, { map, x, y, dir, o: o || {}, FLAGS });
}
async function drain(p) {
  for (let k = 0; k < 300; k++) {
    const s = await p.evaluate(() => ({ dlg: RB.ui.dialogue.isOpen(), mode: RB.game.mode() }));
    if (s.dlg) { await p.evaluate(() => RB.ui.dialogue.advance(true)); await p.waitForTimeout(25); continue; }
    if (s.mode === 'world') return 'world';
    await p.waitForTimeout(40);
  }
  return 'timeout';
}
// the marks drawn; the drift's leaves as drawn, the ▾'s light pixels and the diamond's amber ones, in art px of the
// buffer (the world canvas is the buffer drawn at a whole scale)
const read = (p, tx, ty, w) => p.evaluate(({ tx, ty, w }) => {
  const R = RB.render, cv = document.getElementById('world'), g = cv.getContext('2d');
  const TS = R.TS, ART = R.ART, cam = R.cam;
  const ax = (lx) => Math.round((lx - cam.x) * ART), ay = (ly) => Math.round((ly - cam.y) * ART);
  const M = RB.questMarks.marks();
  const bw = Math.round(R.viewSize().w * ART), s = cv.width / bw;
  const px = (x, y) => { const d = g.getImageData(Math.floor(x * s + s / 2), Math.floor(y * s + s / 2), 1, 1).data; return [d[0], d[1], d[2]]; };
  const near = (c, h, tol) => { const n = parseInt(h.slice(1), 16); return Math.abs(c[0] - (n >> 16)) <= tol && Math.abs(c[1] - ((n >> 8) & 255)) <= tol && Math.abs(c[2] - (n & 255)) <= tol; };
  const X0 = ax(tx * TS), Y0 = ay(ty * TS), X1 = ax((tx + w) * TS), Y1 = ay((ty + 1) * TS);
  // the drift's leaves as its own art draws them (the renderer's own call, at the map's palette, into a canvas of
  // its own: what the island's light does to them on screen does not move them), placed at its tile
  const m = RB.world.W.map, pd = RB.props.P.ko_leaves, A = document.createElement('canvas');
  A.width = 96; A.height = 96;
  const ga = A.getContext('2d');
  pd.draw2(ga, 16, 32, RB.tiles.PAL[m.region], 0, { cx: tx, cy: ty, still: true });
  const ad = ga.getImageData(0, 0, 96, 96).data, leaves = [];
  for (let y = 0; y < 96; y++) for (let x = 0; x < 96; x++) if (ad[(y * 96 + x) * 4 + 3] > 0 && !(ad[(y * 96 + x) * 4] < 70 && ad[(y * 96 + x) * 4 + 1] < 60 && ad[(y * 96 + x) * 4 + 3] < 120)) leaves.push([X0 + x - 16, Y0 + y - 32]);
  const box = leaves.length ? [Math.min(...leaves.map((l) => l[0])), Math.min(...leaves.map((l) => l[1])), Math.max(...leaves.map((l) => l[0])), Math.max(...leaves.map((l) => l[1]))] : null;
  // the ▾'s light fill and the diamond's amber, in the column above the drift
  const chev = [], amber = [];
  for (let y = Y0 - 60; y < Y1; y++) for (let x = X0 - 10; x < X1 + 10; x++) {
    const c = px(x, y);
    if (near(c, '#fff4c8', 6)) chev.push([x, y]);
    if (near(c, '#f0b43c', 6) || near(c, '#c0761c', 6)) amber.push([x, y]);
  }
  const bb = (a) => (a.length ? [Math.min(...a.map((l) => l[0])), Math.min(...a.map((l) => l[1])), Math.max(...a.map((l) => l[0])), Math.max(...a.map((l) => l[1]))] : null);
  const mk = M.marks.find((m) => m.kind === 'target' && m.tx === tx && m.ty === ty) || null;
  const W = RB.world.W;
  return { reduced: RB.game.reducedMotion(), at: [W.player.x, W.player.y], front: RB.world.frontTile(), mk, marks: M.marks.map((m) => ({ kind: m.kind, target: m.target, id: m.id, tx: m.tx, ty: m.ty, x: m.x, y: m.y, edge: m.edge })), leaves, box, chev: bb(chev), amber: bb(amber), tile: [X0, Y0, X1, Y1], HEAD: 20, ATS: TS * ART,
    targets: RB.questGuide.targets('ko_main').targets.map((t) => [t.kind, t.map, t.p || t.id, t.x, t.y]), held: !!RB.game.s.inv.ko_leaf_rw };
}, { tx, ty, w });

for (const [lay, opts] of [['desktop 1280×800', { viewport: { width: 1280, height: 800 } }], ['phone 390×844', { viewport: { width: 390, height: 844 }, touch: true, mobile: true, dpr: 2 }]]) {
  const { p, errors } = await page(b, url, opts);
  if (opts.touch) await p.evaluate(() => { RB.game.settings.touch = 'on'; RB.game.applySettings(); });
  const tag = `(${lay})`;

  // 1. not faced, held still
  await start(p, 'ko.shore', 9, 17, 'down', { still: true });
  let L = await read(p, 9, 14, 2);
  const marked = L.targets.some((t) => t[0] === 'prop' && t[1] === 'ko.shore' && t[3] === 9 && t[4] === 14);
  ok(marked && L.mk && !L.mk.edge, `${tag} the guide marks the drift at 9,14 on the Shore of Leaves (targets ${JSON.stringify(L.targets)}; mark ${JSON.stringify(L.mk)})`);
  if (L.mk && L.box) {
    const cx = (L.box[0] + L.box[2]) / 2, gap = L.box[1] - L.mk.y;
    const under = L.leaves.filter(([x, y]) => x >= L.mk.x - 7 && x <= L.mk.x + 7 && y >= L.mk.y - 17 && y <= L.mk.y);
    ok(L.reduced && Math.abs(L.mk.x - cx) <= 2 && gap >= 1 && gap <= 6 && !under.length,
      `${tag} not faced, held still (Reduce motion read by the game: ${L.reduced}): the diamond over the middle of the drift (tip at ${L.mk.x},${L.mk.y}; the drift's leaves ${L.box.join(',')}, middle ${cx}), its tip ${gap} art px above the highest leaf, no leaf under it (${under.length})`);
  } else ok(false, `${tag} not faced: the diamond and the drift measured (${JSON.stringify({ mk: L.mk, box: L.box })})`);
  const still = L;

  // 2. faced: from the south (its first tile; the tile below its second is a rock) and from the north (its second)
  for (const [fx, fy, dir] of [[9, 15, 'up'], [10, 13, 'down']]) {
    await start(p, 'ko.shore', fx, fy, dir, { still: true });
    const F = await read(p, 9, 14, 2);
    const clear = F.chev && F.mk ? (F.mk.y - 17) - F.chev[3] : null;
    ok(F.at && F.at[0] === fx && F.at[1] === fy && F.front && F.front[1] === 14 && F.mk && still.mk && F.mk.x - F.tile[0] === still.mk.x - still.tile[0] && F.mk.y - F.tile[1] === still.mk.y - still.tile[1] && F.chev && clear >= 6,
      `${tag} faced from ${fx},${fy} (${dir}; standing at ${F.at}, facing ${F.front}): the diamond where it was against the drift (${F.mk ? [F.mk.x - F.tile[0], F.mk.y - F.tile[1]] : null} vs ${still.mk ? [still.mk.x - still.tile[0], still.mk.y - still.tile[1]] : null}), the ▾ shown (${JSON.stringify(F.chev)}) and clear above it by ${clear} art px`);
  }

  // 3. in motion: six frames (the diamond's amber on screen)
  await start(p, 'ko.shore', 9, 17, 'down', { still: false });
  const lows = [];
  let moving = null;
  for (let i = 0; i < 6; i++) { const M = await read(p, 9, 14, 2); if (moving == null) moving = !M.reduced; lows.push(M.amber && M.box ? [M.amber[3], M.box[1]] : null); await p.waitForTimeout(130); }
  ok(moving && lows.every((l) => l && l[0] < l[1]), `${tag} in motion (Reduce motion off: ${moving}): the diamond's lowest pixel above the drift's highest leaf in every frame (${JSON.stringify(lows)})`);

  // 4. not this item: a person and a prop without markTop, at a standing person's head as before
  // a prop without markTop: Reedwake's dead lanterns, while the labels are half done (as quest_guide marks them)
  await p.evaluate(async () => {
    const s = RB.game.debugStart('rw.village', 21, 16, { dir: 'up', flags: { rw_arrived: true, rw_road_lit: true, rw_met_tsuru: true, rw_met_ren: true, rw_letters_done: true, rw_bottles_done: true } });
    for (const ev of RB.content.maps['rw.village'].onEnter || []) s.flags['enter:rw.village:' + ev.scene] = true;
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.reducedMotion = true; RB.game.applySettings();
    let t = Date.now() - 100000;
    for (const [q, v] of [['rw_tools', 0], ['rw_labels', 1]]) { RB.state.setQuest(s, q, v); s.quests[q].t = (t += 1000); }
    RB.questGuide.follow('rw_labels'); RB.questMarks.refresh();
    const W = RB.world.W, t0 = performance.now();
    while (W.time - W.enteredAt < 1100 && performance.now() - t0 < 30000) await new Promise((r) => setTimeout(r, 50));
    let last = '', same = 0;
    while (same < 3 && performance.now() - t0 < 30000) { await new Promise((r) => setTimeout(r, 100)); const k = RB.render.cam.x + ',' + RB.render.cam.y; same = k === last ? same + 1 : 0; last = k; }
  });
  let V = await p.evaluate(() => {
    const R = RB.render, cam = R.cam, ay = (ly) => Math.round((ly - cam.y) * R.ART), ax = (lx) => Math.round((lx - cam.x) * R.ART);
    const front = RB.world.frontTile(), all = RB.questMarks.marks().marks;
    const P = all.filter((k) => k.kind === 'target' && k.target === 'npc' && !k.edge).map((m) => {
      const n = RB.world.W.npcs.find((a) => a.id === m.id), faced = front[0] === Math.round(n.fx) && front[1] === Math.round(n.fy);
      return { got: [m.id, m.x, m.y], want: [m.id, ax(n.fx * R.TS) + R.TS * R.ART / 2, ay(n.fy * R.TS) - 20 - (faced ? 17 : 9)] };
    });
    const M = all.filter((k) => k.kind === 'target' && k.target === 'prop' && !k.edge);
    return { people: P, got: M.map((m) => [m.tx, m.ty, m.x, m.y]), want: M.map((m) => [m.tx, m.ty, ax(m.tx * R.TS) + R.TS * R.ART / 2, ay(m.ty * R.TS) - 20 - 9]), markTop: RB.props.P.deadlantern && RB.props.P.deadlantern.markTop };
  });
  ok(V.people.length >= 1 && V.people.every((q) => JSON.stringify(q.got) === JSON.stringify(q.want)), `${tag} a person (Reedwake, the labels half done): marked as before, at a standing person's head (${JSON.stringify(V.people)})`);
  ok(V.got.length >= 1 && JSON.stringify(V.got) === JSON.stringify(V.want) && V.markTop == null, `${tag} a prop without markTop (Reedwake's dead lanterns, the labels half done): marked as before, at a standing person's head over its first tile (${JSON.stringify(V.got)}; expected ${JSON.stringify(V.want)})`);

  // 5. picked up: the action key on the drift, its scene to the end
  await start(p, 'ko.shore', 9, 15, 'up', { still: true });
  await p.evaluate(() => RB.world.interact());
  await p.waitForTimeout(200);
  const end = await drain(p);
  await p.waitForTimeout(500);
  L = await read(p, 9, 14, 2);
  ok(end === 'world' && L.held && !L.mk && !L.targets.some((t) => t[3] === 9 && t[4] === 14), `${tag} picked up: the leaf held (${L.held}), that drift marked no longer (marks ${JSON.stringify(L.marks)}; targets ${JSON.stringify(L.targets)})`);

  ok(!errors.length, `${tag} no page errors ${errors.slice(0, 2).join(' | ')}`);
  await p.close();
}
console.log(`\nleaf_marker: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
