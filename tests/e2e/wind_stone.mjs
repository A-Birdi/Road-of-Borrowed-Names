// The Wind Stone in the Keepers' Village is drawn as what its scene calls it, a flat stone, not the generic roofed
// lantern-shrine it was (RBN-QA-075; Agnes 6318288260, Local CL-114). In Chromium on the built game, from a synthetic
// campaign of the shipped edition:
//  1. ko.village's place at 25,14 is a `ko_windstone`, with ko.windstone's scene; no shrine there; the generic
//     `shrine` is unchanged (two tiles, its lamp's light) and still placed elsewhere;
//  2. the same footprint: both its tiles blocked, the paving either side walkable;
//  3. the action key from below either of its tiles opens ko.windstone, whose first line names the flat stone, and
//     the scene ends back on the map;
//  4. it carries no light (no lamp): measured on screen, with Reduce motion, the area round it is as it is with no
//     emitter, while a light of 30 on it puts a warm glow there (the comparison done in the page, the stone's light
//     set and cleared between frames);
//  5. drawn by its own art, at the village's palette: low and broad (as wide as its two tiles, at most about one tile
//     high), its top lighter than its front, no roof, no lamp's glow; in motion its wind streaks move, held still
//     (Reduce motion) two frames are alike; its 16-px fallback sets only real colours, its top lighter than its front;
//  6. at 1280×800 and at 390×844 on a phone it is on screen, under the player's view, with no page errors.
// Usage: node tools/build.mjs && node tests/e2e/wind_stone.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };

const FLAGS = { departed: true, ko_arrived: true, ko_ch9: true, ch5_done: true };
async function start(p, x, y, dir, still) {
  await p.evaluate(async ({ x, y, dir, still, FLAGS }) => {
    RB.test.enable({ battle: 'unravel' });
    const s = RB.game.debugStart('ko.village', x, y, { comp: 'suzu', flags: FLAGS, dir, edition: RB.edition.forNew() });
    s.chapter = 9;
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.reducedMotion = !!still; RB.game.settings.questGuide = 'off';
    RB.game.applySettings();
    const W = RB.world.W, t0 = performance.now();
    while (W.time - W.enteredAt < 1100 && performance.now() - t0 < 30000) await new Promise((r) => setTimeout(r, 50));
    let last = '', same = 0;
    while (same < 3 && performance.now() - t0 < 30000) { await new Promise((r) => setTimeout(r, 100)); const k = RB.render.cam.x + ',' + RB.render.cam.y; same = k === last ? same + 1 : 0; last = k; }
  }, { x, y, dir, still, FLAGS });
}
async function drain(p) {
  const lines = [];
  for (let k = 0; k < 300; k++) {
    const s = await p.evaluate(() => ({ dlg: RB.ui.dialogue.isOpen(), mode: RB.game.mode(), l: RB.ui.dialogue.shown && RB.ui.dialogue.shown() }));
    if (s.dlg) { if (s.l && (!lines.length || lines[lines.length - 1] !== s.l.en)) lines.push(s.l.en); await p.evaluate(() => { const c = document.querySelector('.choices button, .choice button'); if (c) c.click(); else RB.ui.dialogue.advance(true); }); await p.waitForTimeout(30); continue; }
    if (s.mode === 'world') return { end: 'world', lines };
    await p.waitForTimeout(40);
  }
  return { end: 'timeout', lines };
}

// 1, 2, 5 (the prop, its footprint, its own art)
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, 25, 17, 'up', true);
  const r = await p.evaluate(() => {
    const m = RB.content.maps['ko.village'], here = (m.props || []).filter((q) => q.x === 25 && q.y === 14);
    const P = RB.props.P, others = Object.keys(RB.content.maps).filter((id) => (RB.content.maps[id].props || []).some((q) => q.p === 'shrine'));
    const blk = (x, y) => RB.maps.blockedStatic(RB.world.W.map, x, y);
    // its own art at the village's palette, into a canvas of its own
    const pd = P[here[0].p], A = document.createElement('canvas'); // (what stands there)
    A.width = 128; A.height = 96;
    const g = A.getContext('2d'), pal = RB.tiles.PAL[m.region];
    const draw = (t, still) => { g.clearRect(0, 0, 128, 96); pd.draw2(g, 24, 40, pal, t, { cx: 25, cy: 14, still }); return g.getImageData(0, 0, 128, 96).data; };
    const d = draw(0, true);
    let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
    for (let y = 0; y < 96; y++) for (let x = 0; x < 128; x++) { const i = (y * 128 + x) * 4; if (d[i + 3] > 200) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); } }
    const lum = (ya, yb) => { let s = 0, n = 0; for (let y = ya; y <= yb; y++) for (let x = 24 + 12; x < 24 + 52; x++) { const i = (y * 128 + x) * 4; if (d[i + 3] > 200) { s += d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11; n++; } } return n ? s / n : null; };
    const roof = pal.roof || [];
    const hex = (h) => [1, 3, 5].map((k) => parseInt(h.slice(k, k + 2), 16));
    let roofPx = 0;
    for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 200 && roof.some((h) => { const c = hex(h); return Math.abs(d[i] - c[0]) < 6 && Math.abs(d[i + 1] - c[1]) < 6 && Math.abs(d[i + 2] - c[2]) < 6; })) roofPx++;
    // (the motion frames with Reduce motion off for them, as the art reads the game's setting too)
    const rm = RB.game.settings.reducedMotion;
    RB.game.settings.reducedMotion = false;
    const m1 = draw(0, false), m2 = draw(400, false);
    RB.game.settings.reducedMotion = rm;
    const m3 = draw(400, true);
    const same = (u, v) => u.every((x, i) => x === v[i]);
    // the 16-px fallback (drawn when the art is not): every colour it sets is a real one, and its top is lighter than
    // its front (Agnes 6326169868: it had indexed tones the island's stone does not have)
    const F = document.createElement('canvas');
    F.width = 48; F.height = 32;
    const fg = F.getContext('2d'), set = [];
    const rec = new Proxy(fg, { set(t, k, v) { if (k === 'fillStyle') set.push(v); t[k] = v; return true; }, get(t, k) { const v = t[k]; return typeof v === 'function' ? v.bind(t) : v; } });
    pd.draw(rec, 8, 8, pal, 0, { cx: 25, cy: 14 });
    const fd = fg.getImageData(0, 0, 48, 32).data, fl = (y) => { let s = 0, n = 0; for (let x = 14; x < 34; x++) { const i = (y * 48 + x) * 4; if (fd[i + 3]) { s += fd[i] * 0.3 + fd[i + 1] * 0.59 + fd[i + 2] * 0.11; n++; } } return n ? s / n : null; };
    const fallback = { colours: set, valid: set.length > 0 && set.every((v) => typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v)), top: fl(8 + 3), front: fl(8 + 8) };
    return {
      here: here.map((q) => [q.p, q.scene || null, q.light || null]), shrine: { w: P.shrine.w, light: P.shrine.light, block: P.shrine.block }, wind: { id: pd.id, w: pd.w, h: pd.h, block: pd.block, light: pd.light || null }, others: others.length,
      blocked: [blk(25, 14), blk(26, 14)], open: [blk(24, 14), blk(27, 14)],
      box: [x0 - 24, y0 - 40, x1 - 24, y1 - 40], top: lum(40 + 0, 40 + 6), front: lum(40 + 14, 40 + 24), roofPx,
      moves: !same(m1, m2), still: same(d, m3), fallback,
    };
  });
  ok(r.here.length === 1 && r.here[0][0] === 'ko_windstone' && r.here[0][1] === 'ko.windstone' && !r.here[0][2], `ko.village 25,14 is the Wind Stone with its scene, nothing else there (${JSON.stringify(r.here)})`);
  ok(r.shrine.w === 2 && r.shrine.light === 30 && r.shrine.block !== false && r.others >= 1, `the generic shrine unchanged (${JSON.stringify(r.shrine)}) and still placed on ${r.others} other maps`);
  ok(r.wind.w === 2 && (r.wind.h || 1) === 1 && r.wind.block !== false && !r.wind.light, `the Wind Stone: the same two-tile blocking footprint, no light (${JSON.stringify(r.wind)})`);
  ok(r.blocked.every(Boolean) && !r.open.some(Boolean), `both its tiles blocked (${r.blocked}), the paving either side walkable (blocked: ${r.open})`);
  ok(r.box[2] - r.box[0] >= 60 && r.box[3] - r.box[1] <= 40 && r.box[1] >= -6, `its own art: low and broad, ${r.box[2] - r.box[0] + 1} art px wide and ${r.box[3] - r.box[1] + 1} high, from ${r.box[1]} above its tile's top (${r.box})`);
  ok(r.top != null && r.front != null && r.top > r.front + 12 && r.roofPx === 0, `its top lighter than its front (${r.top && r.top.toFixed(1)} against ${r.front && r.front.toFixed(1)}), no roof (${r.roofPx} roof-coloured px)`);
  ok(r.moves && r.still, `in motion its wind streaks move (${r.moves}); held still two frames are alike (${r.still})`);
  ok(r.fallback.valid && r.fallback.top > r.fallback.front, `its 16-px fallback: every colour a real one (${JSON.stringify(r.fallback.colours)}), its top lighter than its front (${r.fallback.top && r.fallback.top.toFixed(1)} against ${r.fallback.front && r.fallback.front.toFixed(1)})`);
  ok(!errors.length, `no page errors ${errors.slice(0, 2).join(' | ')}`);
  await p.close();
}

// 3. the action key from below either tile opens ko.windstone
for (const fx of [25, 26]) {
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, fx, 15, 'up', true);
  const at = await p.evaluate(() => ({ at: [RB.world.W.player.x, RB.world.W.player.y], front: RB.world.frontTile() }));
  await p.evaluate(() => {
    window.__sc = []; window.__lines = [];
    const run = RB.script.run; RB.script.run = function (id, ...a) { window.__sc.push(id); return run.call(this, id, ...a); };
    const say = RB.ui.dialogue.say; RB.ui.dialogue.say = function (line, ...a) { window.__lines.push(line && line.en); return say.call(this, line, ...a); };
    RB.world.interact();
  });
  await p.waitForTimeout(300);
  const d = await drain(p);
  const { sc, lines } = await p.evaluate(() => ({ sc: window.__sc, lines: window.__lines }));
  ok(at.front[0] === fx && at.front[1] === 14 && sc.includes('ko.windstone') && d.end === 'world' && /flat stone/.test(lines[0] || ''), `from ${fx},15 facing it (standing at ${at.at}): the action key opens ko.windstone (${JSON.stringify(sc)}), its first line "${lines[0]}", back on the map (${d.end})`);
  ok(!errors.length, `from ${fx},15: no page errors ${errors.slice(0, 2).join(' | ')}`);
  await p.close();
}

// 4 and 6: no lamp's glow round it; on screen at both sizes
for (const [lay, opts] of [['desktop 1280×800', { viewport: { width: 1280, height: 800 } }], ['phone 390×844', { viewport: { width: 390, height: 844 }, touch: true, mobile: true, dpr: 2 }]]) {
  const { p, errors } = await page(b, url, opts);
  if (opts.touch) await p.evaluate(() => { RB.game.settings.touch = 'on'; RB.game.applySettings(); });
  await start(p, 25, 18, 'up', true);
  const r = await p.evaluate(async () => {
    const cv = document.getElementById('world'), g = cv.getContext('2d'), cr = cv.getBoundingClientRect(), sx = cv.width / cr.width;
    const c = RB.render.tileToCss(25, 14), k = RB.render.viewSize().scale;
    const X = Math.max(0, Math.round((c.x - 16 * k) * sx)), Y = Math.max(0, Math.round((c.y - 24 * k) * sx)), W = Math.round(64 * k * sx), H = Math.round(48 * k * sx);
    const grab = () => g.getImageData(X, Y, W, H).data;
    const frame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const d = (u, v) => { let n = 0, warm = 0; for (let i = 0; i < u.length; i += 4) { const dd = Math.max(Math.abs(u[i] - v[i]), Math.abs(u[i + 1] - v[i + 1]), Math.abs(u[i + 2] - v[i + 2])); if (dd > 2) { n++; if (v[i] - u[i] > v[i + 2] - u[i + 2]) warm++; } } return { n, warm }; };
    const pd = RB.props.P[RB.content.maps['ko.village'].props.find((q) => q.x === 25 && q.y === 14).p]; // (what stands there)
    await frame(); const a = grab(); await frame(); const a2 = grab();
    pd.light = 30; await frame(); await frame(); const lit = grab(); delete pd.light;
    await frame(); await frame(); const back = grab();
    const on = c.x >= 0 && c.y >= 0 && c.x + 32 * k <= cr.width && c.y + 16 * k <= cr.height;
    return { reduced: RB.game.reducedMotion(), on, noise: d(a, a2), lit: d(a, lit), back: d(a, back), px: W * H };
  });
  ok(r.on, `${lay}: the Wind Stone on screen below the player's view`);
  ok(r.reduced && r.lit.warm > 4 * Math.max(r.noise.n, r.back.n, 50), `${lay}: no lamp's glow round it, held still (Reduce motion read by the game: ${r.reduced}): a light of 30 set on it for two frames warms ${r.lit.warm} px there (${r.lit.n} change), where frames without it differ by ${r.noise.n} and ${r.back.n} px`);
  ok(!errors.length, `${lay}: no page errors ${errors.slice(0, 2).join(' | ')}`);
  await p.close();
}

console.log(`\nwind_stone: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
