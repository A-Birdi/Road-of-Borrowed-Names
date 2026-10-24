// RBN-QA-180 (Agnes 6382350571, 6382498068; Local CL-287, CL-288): on the Sun-Shower Meadow (the Hall's second wing,
// floor 1) the gift the tag calls 「白い箱」, "a white box", was the generic chest in the wing's red wood, and 「赤い包み」,
// "a red bundle", the generic crate. In Chromium on the built game, with throwaway journeys:
//  1. the three gifts on the path: the white box (hall_giftbox) and the red bundle (hall_bundle) where the chest and
//     crate stood, the chestnut basket as it was; each with the same tile, scene and gate (shown until its PUT);
//  2. how they are drawn, in both renderers: the box pale with no wood in it; the bundle red cloth, not the crate;
//  3. for both of the floor's patterns: a gift picked up stays where it is (and solid); a wrong tray keeps it held and
//     there; the right tray takes it, and only then is it gone from the path (and its tile free);
//  4. every chest and crate elsewhere in the game draws exactly as before (both renderers, every placed one's pixels
//     and fills folded into one digest: 130 of them, -1723413255 on the base build, int/cc022 3d90956);
//  5. no page errors.
// Usage: node tools/build.mjs && node tests/e2e/hall_gifts.mjs
import { serve, launch, page } from './lib.mjs';

const BASE = { digest: -1723413255, count: 130 }; // measured on the base build (int/cc022 3d90956), as 4. computes it
const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const J = JSON.stringify;
const { p, ctx, errors } = await page(b, url, { viewport: { width: 1188, height: 848 } });

// a journey on the meadow, with the floor's pattern set
const begin = (pat) => p.evaluate(async (pat) => {
  const s = RB.game.debugStart('hall.w2f1', 17, 13, { edition: RB.edition.forNew(), comp: null, flags: {}, dir: 'up' });
  RB.game.settings.textSpeed = 'instant'; RB.save.autosave = async () => {};
  RB.hall.wrec(s, 'w2').pat = pat;
  let quiet = 0;
  for (let i = 0; i < 200 && quiet < 10; i++) {
    if (RB.ui.dialogue.isOpen()) RB.ui.dialogue.advance(true);
    quiet = RB.ui.dialogue.isOpen() || RB.script.isRunning() ? 0 : quiet + 1;
    await new Promise((r) => setTimeout(r, 40));
  }
}, pat);
// a scene played to its end with Next
const play = (id) => p.evaluate(async (id) => {
  const run = RB.script.run(id);
  for (let i = 0; i < 300; i++) {
    if (RB.ui.dialogue.isOpen()) RB.ui.dialogue.advance(true);
    if (!RB.script.isRunning() && !RB.ui.dialogue.isOpen()) break;
    await new Promise((r) => setTimeout(r, 30));
  }
  await run;
}, id);
// the path's gifts now: what stands at each spot (only what is shown), whether it is solid, what is held
const now = () => p.evaluate(() => {
  const s = RB.game.s, m = RB.world.W.map, G = RB.content.hallW2.GIFTS;
  const at = (x, y) => m.props.filter((q) => q.x === x && q.y === y && (!q.if || RB.state.test(s, q.if))).map((q) => q.p);
  const solid = (x, y) => (RB.world.blocked ? !!RB.world.blocked(x, y, { ignorePlayer: true }) : null);
  const held = ['red', 'white', 'chestnut'].filter((g) => s.flags['xp_hall_w2_f0_hold_' + g]);
  return Object.assign({ held }, ...Object.keys(G).map((g) => ({ [g]: { shown: at(G[g][0], G[g][1]), solid: solid(G[g][0], G[g][1]) } })));
});

// ---- 1. and 2. ------------------------------------------------------------------------------------------------------------
await begin(0);
const R = await p.evaluate(() => {
  const m = RB.world.W.map, G = RB.content.hallW2.GIFTS, P = RB.props.P, pal = RB.tiles.PAL.hall_w2;
  // a context that records the flat renderer's filled rectangles (anything else it draws, a shadow's path, is ignored)
  const rec = (on) => new Proxy({ fillStyle: '' }, { get: (o, k) => (k === 'fillRect' ? (x, y, w, h) => on(o.fillStyle, x, y, w, h) : k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  const props = Object.keys(G).map((g) => { const q = m.props.find((x) => x.scene === 'hall.w2.g_' + g); return q && [g, q.p, q.x, q.y, q.if]; });
  const W5 = pal.wood.map((c) => c.toLowerCase());
  const hex = (r, g, b) => '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
  // the drawn art (draw2) and the flat drawing (draw) of a prop, on a clear canvas
  const look = (id) => {
    const cv = document.createElement('canvas'); cv.width = 64; cv.height = 80; const c = cv.getContext('2d');
    P[id].draw2(c, 16, 24, pal, 0, {});
    const d = c.getImageData(0, 0, 64, 80).data;
    let n = 0, pale = 0, red = 0, wood = 0;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] < 250) continue;
      n++;
      const [r, g, bl] = [d[i], d[i + 1], d[i + 2]];
      if (r > 200 && g > 200 && bl > 190) pale++;
      if (r > g + 50 && r > bl + 50) red++;
      if (W5.includes(hex(r, g, bl))) wood++;
    }
    const fills = [];
    P[id].draw(rec((f, x, y, w, h) => fills.push([String(f).toLowerCase(), w * h])), 0, 0, pal, 0, {});
    const area = fills.reduce((a, f) => a + f[1], 0), at = (pred) => fills.filter((f) => pred(f[0])).reduce((a, f) => a + f[1], 0);
    const flat = { area, wood: at((f) => W5.includes(f)), pale: at((f) => /^#[ef][0-9a-f][ef]/.test(f) && parseInt(f.slice(1, 3), 16) > 0xd0 && parseInt(f.slice(5, 7), 16) > 0xc8) };
    return { n, pale, red, wood, flat, sig: Array.from(d).reduce((h, v, i) => (h * 31 + v * (i % 7 + 1)) | 0, 7) };
  };
  return { props, box: look(P.hall_giftbox ? 'hall_giftbox' : 'chest'), bundle: look(P.hall_bundle ? 'hall_bundle' : 'crate'), crate: look('crate'), chest: look('chest'),
    block: { box: !!(P.hall_giftbox || P.chest).block, bundle: !!(P.hall_bundle || P.crate).block, chest: !!P.chest.block, crate: !!P.crate.block } };
});
ok(J(R.props) === J([['red', 'hall_bundle', 11, 13, '!xp_hall_w2_f0_put_red'], ['white', 'hall_giftbox', 21, 13, '!xp_hall_w2_f0_put_white'], ['chestnut', 'ko_basket', 24, 8, '!xp_hall_w2_f0_put_chestnut']]),
  'the gifts on the path: the red bundle and the white box where the crate and chest stood, the basket as it was; the same tiles, scenes and gates (' + J(R.props) + ')');
ok(R.block.box === R.block.chest && R.block.bundle === R.block.crate && R.block.box, 'each as solid as the prop it replaces (' + J(R.block) + ')');
ok(R.box.n > 200 && R.box.pale / R.box.n > 0.4 && R.box.wood === 0 && R.box.flat.wood === 0 && R.box.flat.pale / R.box.flat.area > 0.4,
  'the white box: pale, with no wood in it, drawn and flat (' + J({ drawn: [R.box.n, R.box.pale, R.box.wood], flat: R.box.flat }) + ')');
ok(R.bundle.n > 200 && R.bundle.red / R.bundle.n > 0.5 && R.bundle.sig !== R.crate.sig && R.bundle.flat.area !== R.crate.flat.area,
  'the red bundle: red cloth, and not the crate, drawn and flat (' + J({ drawn: [R.bundle.n, R.bundle.red], flat: R.bundle.flat, crate: R.crate.flat }) + ')');

// ---- 3. picked up, a wrong tray, the right tray: both patterns -------------------------------------------------------------
for (const pat of [0, 1]) {
  await begin(pat);
  // the tray each gift goes to in this pattern, as its tag says (hall/22_w2_scenes.js, TAG)
  const right = [{ red: 'groom', white: 'mother', chestnut: 'toku' }, { red: 'toku', white: 'groom', chestnut: 'mother' }][pat];
  const trays = ['groom', 'mother', 'toku'];
  const seen = [];
  for (const g of ['white', 'red', 'chestnut']) {
    const wrong = trays.find((t) => t !== right[g]);
    await play('hall.w2.g_' + g);
    const a = await now();
    await play('hall.w2.tray_' + wrong);
    const w = await now();
    await play('hall.w2.tray_' + right[g]);
    const r = await now();
    seen.push({ g, right: right[g], a: [a.held, a[g]], w: [w.held, w[g]], r: [r.held, r[g]] });
    ok(right[g] && J(a.held) === J([g]) && a[g].shown.length === 1 && a[g].solid !== false && J(w.held) === J([g]) && w[g].shown.length === 1 && J(r.held) === '[]' && r[g].shown.length === 0 && r[g].solid !== true,
      'pattern ' + pat + ', the ' + g + ' gift: picked up, still on the path; a wrong tray (' + wrong + ') keeps it held and there; the right tray (' + right[g] + ') takes it, and only then is it gone (' + J(seen[seen.length - 1]) + ')');
  }
}

// ---- 4. every other chest and crate as before -------------------------------------------------------------------------------
{
  const D = await p.evaluate(() => {
    const P = RB.props.P, maps = RB.content.maps, cv = document.createElement('canvas'); cv.width = 64; cv.height = 96;
    const rec = (on) => new Proxy({ fillStyle: '' }, { get: (o, k) => (k === 'fillRect' ? (x, y, w, h) => on(o.fillStyle, x, y, w, h) : k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
    const g = cv.getContext('2d');
    let h = 17, count = 0;
    for (const id of Object.keys(maps).sort()) {
      const m = maps[id], pal = RB.tiles.PAL[m.region] || RB.tiles.PAL.reedwake;
      for (const q of m.props || []) {
        // (every other one: the two this change replaces, the meadow's gifts, are left out on both builds)
        if ((q.p !== 'chest' && q.p !== 'crate') || /^hall\.w2\.g_/.test(q.scene || '')) continue;
        count++;
        const o = Object.assign({ cx: q.x, cy: q.y }, q.o || {});
        g.clearRect(0, 0, 64, 96); P[q.p].draw2(g, 16, 40, pal, 0, o);
        const d = g.getImageData(0, 0, 64, 96).data;
        for (let i = 0; i < d.length; i += 4) h = (h * 31 + d[i] + d[i + 1] * 3 + d[i + 2] * 7 + d[i + 3] * 11) | 0;
        P[q.p].draw(rec((f, x, y, w, hh) => { for (const ch of String(f) + x + ',' + y + ',' + w + ',' + hh) h = (h * 31 + ch.charCodeAt(0)) | 0; }), 0, 0, pal, 0, o);
      }
    }
    return { digest: h, count };
  });
  console.log('     (chests and crates elsewhere: ' + J(D) + ')');
  ok(BASE.count ? D.count === BASE.count && D.digest === BASE.digest : D.count > 0,
    'every other chest and crate in the game draws as on the base build, both renderers (' + J({ now: D, base: BASE }) + ')');
}
ok(!errors.length, 'no page errors (' + J(errors).slice(0, 300) + ')');
await ctx.close(); await b.close(); srv.close();
console.log(pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
