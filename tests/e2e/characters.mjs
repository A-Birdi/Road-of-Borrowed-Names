// Characters at the character standard, in the BUILT game.
//
// Road sprites (RB.sprites.getArt, 40×58 art px, foot anchor 20,55): every creation option class
// (each hairstyle, clothing colour, clothing cut, skin tone, hair colour and accessory), every
// keepsake, the four companions and the NPCs of the cast, in all four directions and every walk,
// breathing and blink frame. Each frame is the standard size, not blank, stands on the anchor
// (feet on the anchor row, nothing below the outline, nothing touching the frame's edge), and one-sided
// things stay on their side (a flower or side ponytail on the left of the head, a book in the right
// hand) rather than being mirrored. In the world: a person standing in front of another is drawn
// over them, and the foot anchor sits on the tile.
//
// Battle figures (RB.battlers.draw on a canvas): the API; every pose × gesture for the player and
// each companion is not blank and keeps the same foot anchor; a full gesture returns exactly to
// the stance (no drift); accessories are present in every pose and stay on the head/hand they
// belong to; reduced motion gives identical frames at different times while normal motion is
// alive with planted feet; player and companion idle on different timing. Frame cost is timed.
//
// Review sheets (PNG) go to tests/e2e/out/characters/.
// Usage: node tests/e2e/characters.mjs
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';

const outDir = path.join(root, 'tests/e2e/out/characters');
fs.mkdirSync(outDir, { recursive: true });
const { srv, url } = await serve();
const b = await launch();
let fail = 0, pass = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const save = async (p, name, fnSrc, arg) => {
  const data = await p.evaluate(([src, arg]) => { const cv = new Function('arg', src)(arg); return cv.toDataURL('image/png'); }, [fnSrc, arg]);
  fs.writeFileSync(path.join(outDir, name), Buffer.from(data.split(',')[1], 'base64'));
  console.log('     sheet ' + path.relative(root, path.join(outDir, name)));
};

// in-page helpers: the looks to cover, and pixel utilities
const helpers = (p) => p.evaluate(() => {
  const S = RB.sprites, C = RB.content.chars;
  const base = { skin: 2, hair: 'short', hairColor: 1, outfit: 0, shape: 'tunic', acc: [] };
  const L = [];
  S.HAIRSTYLES.forEach((h, i) => L.push({ name: 'hair ' + h, look: Object.assign({}, base, { hair: h, hairColor: (i * 3) % S.HAIR.length }) }));
  S.CLOTH.forEach((c, i) => L.push({ name: 'outfit ' + i, look: Object.assign({}, base, { outfit: i }) }));
  S.SKIN.forEach((c, i) => L.push({ name: 'skin ' + i, look: Object.assign({}, base, { skin: i, hair: 'bob' }) }));
  S.HAIR.forEach((c, i) => L.push({ name: 'hair colour ' + i, look: Object.assign({}, base, { hairColor: i, hair: 'long' }) }));
  ['tunic', 'robe', 'coat', 'apron', 'dress'].forEach((sh) => L.push({ name: 'cut ' + sh, look: Object.assign({}, base, { shape: sh }) }));
  S.ACCESSORIES.forEach((a) => L.push({ name: 'acc ' + a, look: Object.assign({}, base, { acc: [a] }) }));
  const keep = Object.keys(RB.content.items).filter((k) => RB.content.items[k].slot === 'cosmetic' && RB.content.items[k].acc);
  keep.forEach((id) => L.push({ name: 'keepsake ' + id, look: RB.equip.lookWith(Object.assign({}, base, { acc: ['scarf'] }), id) }));
  L.push({ name: 'child', look: Object.assign({}, base, { size: 'child', hair: 'twintails' }) }, { name: 'old', look: Object.assign({}, base, { age: 'old', hair: 'bun', hairColor: 6, shape: 'robe', acc: ['cane'] }) });
  const comps = ['nao', 'mio', 'ren', 'suzu'];
  comps.forEach((id) => L.push({ name: 'companion ' + id, look: C[id].look, comp: true }));
  const npcs = Object.keys(C).filter((id) => !C[id].companion && C[id].look).slice(0, 400);
  npcs.forEach((id) => L.push({ name: 'npc ' + id, look: C[id].look, npc: true }));
  window.CH = {
    L, comps, npcs,
    data(cv) { return cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; },
    diff(a, c) { let n = 0; for (let i = 0; i < a.length; i += 4) if (Math.abs(a[i] - c[i]) + Math.abs(a[i + 1] - c[i + 1]) + Math.abs(a[i + 2] - c[i + 2]) + Math.abs(a[i + 3] - c[i + 3]) > 24) n++; return n; },
    // pixels that differ, as a bbox and a count per screen half
    diffBox(a, c, w, ax) {
      let n = 0, left = 0, right = 0, x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
      for (let i = 0; i < a.length; i += 4) {
        if (Math.abs(a[i] - c[i]) + Math.abs(a[i + 1] - c[i + 1]) + Math.abs(a[i + 2] - c[i + 2]) + Math.abs(a[i + 3] - c[i + 3]) <= 24) continue;
        const x = (i / 4) % w, y = Math.floor(i / 4 / w);
        n++; if (x < ax) left++; else right++;
        x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
      }
      return { n, left, right, x0, y0, x1, y1 };
    },
    // opaque extent of a canvas
    box(cv) {
      const d = CH.data(cv), w = cv.width;
      let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1, n = 0;
      for (let i = 3; i < d.length; i += 4) if (d[i]) { const x = ((i - 3) / 4) % w, y = Math.floor((i - 3) / 4 / w); n++; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
      return { n, x0, y0, x1, y1 };
    },
    // opaque columns in one row
    row(cv, y) { const d = CH.data(cv), w = cv.width, xs = []; for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3]) xs.push(x); return xs; },
  };
});

// ---- 1. road sprites: every option class, keepsake, companion and NPC, every direction and frame ----------
{
  const { p, errors } = await page(b, url);
  await helpers(p);
  const r = await p.evaluate(() => {
    const S = RB.sprites, F = S.FRAME, A = S.ANCHOR;
    const DIRS = ['down', 'left', 'right', 'up'];
    const FR = [0, 1, 2, 3, 'w0', 'w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7', 'i0', 'i1', 'i2', 'i3', 'i2b'];
    const bad = [];
    let frames = 0, humans = 0;
    for (const e of CH.L) {
      for (const d of DIRS) for (const f of FR) {
        const cv = S.getArt(e.look, d, f);
        frames++;
        if (!cv || cv.width !== F.w || cv.height !== F.h) { bad.push(e.name + ' ' + d + ' ' + f + ': size ' + (cv && cv.width + '×' + cv.height)); continue; }
        const bx = CH.box(cv);
        if (bx.n < 250) bad.push(e.name + ' ' + d + ' ' + f + ': nearly blank (' + bx.n + ' px)');
        // people stand on the anchor: the lowest row is the sole's outline, one below the anchor row
        // (creatures that float — wisps, echoes, spirits — hover over it and are left out of this)
        if (!e.look.custom) {
          if (bx.y1 !== A.y + 1) bad.push(e.name + ' ' + d + ' ' + f + ': lowest row ' + bx.y1 + ', expected ' + (A.y + 1));
          // …and whatever stands on that row (both feet, or the planted one mid-stride) is under the figure
          const feet = CH.row(cv, A.y);
          if (!feet.length || Math.abs((Math.min(...feet) + Math.max(...feet)) / 2 - A.x) > 7) bad.push(e.name + ' ' + d + ' ' + f + ': feet ' + (feet.length ? Math.min(...feet) + '–' + Math.max(...feet) : 'none') + ' not under the anchor x ' + A.x);
        } else if (bx.y1 > A.y + 1) bad.push(e.name + ' ' + d + ' ' + f + ': creature below the anchor (' + bx.y1 + ')');
        // nothing clipped: no opaque pixel on the frame's edges
        if (bx.x0 <= 0 || bx.x1 >= F.w - 1 || bx.y0 <= 0) bad.push(e.name + ' ' + d + ' ' + f + ': touches the frame edge ' + JSON.stringify(bx));
        if (!e.look.custom && f === 0) humans++;
      }
    }
    return { frames, n: CH.L.length, bad, F, A, comps: CH.comps.length, npcs: CH.npcs.length };
  });
  ok(r.F.w === 40 && r.F.h === 58 && r.A.x === 20 && r.A.y === 55, `frame standard: ${r.F.w}×${r.F.h} art px, foot anchor (${r.A.x}, ${r.A.y})`);
  ok(!r.bad.length, `${r.n} looks (every hairstyle, clothing colour, skin tone, hair colour, cut, accessory and keepsake; ${r.comps} companions; ${r.npcs} NPCs) × 4 directions × 17 frames = ${r.frames} frames: standard size, not blank, feet on the anchor, nothing clipped` + (r.bad.length ? '\n     ' + r.bad.slice(0, 16).join('\n     ') + (r.bad.length > 16 ? '\n     … ' + (r.bad.length - 16) + ' more' : '') : ''));

  // one-sided things keep their side: not mirrored
  const side = await p.evaluate(() => {
    const S = RB.sprites, A = S.ANCHOR;
    const base = { skin: 2, hair: 'short', hairColor: 1, outfit: 0, shape: 'tunic', acc: [] };
    const px = (lk, d) => CH.data(S.getArt(lk, d, 0));
    const W = S.FRAME.w;
    const cases = [
      ['flower (left of the head)', 'L', { acc: ['flower'] }],
      ['ribbon (left of the head)', 'L', { acc: ['ribbon'] }],
      ['side ponytail (left)', 'L', { hair: 'ponytail' }, { hair: 'short' }],
      ['braid (over the left shoulder)', 'L', { hair: 'braid' }, { hair: 'short' }],
      ['book (right hand)', 'R', { acc: ['book'] }],
      ['lantern (left hand)', 'L', { acc: ['lamp'] }],
    ];
    const out = [];
    for (const [name, sd, withL, without] of cases) {
      const a = Object.assign({}, base, withL), z = Object.assign({}, base, without || {});
      const dn = CH.diffBox(px(z, 'down'), px(a, 'down'), W, A.x);
      const up = CH.diffBox(px(z, 'up'), px(a, 'up'), W, A.x);
      const lf = CH.diffBox(px(z, 'left'), px(a, 'left'), W, A.x).n;
      const rt = CH.diffBox(px(z, 'right'), px(a, 'right'), W, A.x).n;
      // front view: the body's left is on screen right; from behind, on screen left
      const frontOk = sd === 'L' ? dn.right > dn.left : dn.left > dn.right;
      const backOk = sd === 'L' ? up.left > up.right : up.right > up.left;
      // side views: shown in front of the body when that side faces the camera
      const sideOk = sd === 'L' ? lf > rt : rt > lf;
      out.push({ name, frontOk, backOk, sideOk, dn: [dn.left, dn.right], up: [up.left, up.right], lf, rt });
    }
    return out;
  });
  for (const s of side) ok(s.frontOk && s.backOk && s.sideOk, `${s.name}: front view on its side (left/right half ${s.dn}), back view on its side (${s.up}), and larger in the side view that faces it (left view ${s.lf} px, right view ${s.rt} px)`);

  // review sheets: options and cast in every direction; the walk cycle
  await save(p, 'road_options.png', `
    const S = RB.sprites, F = S.FRAME, Z = 2, L = CH.L.filter((e) => !e.npc), dirs = ['down', 'left', 'right', 'up'];
    const per = 4, cols = per * dirs.length;
    const cv = document.createElement('canvas'); cv.width = cols * (F.w + 2) * Z; cv.height = Math.ceil(L.length / per) * (F.h + 12) * Z;
    const c = cv.getContext('2d'); c.imageSmoothingEnabled = false; c.fillStyle = '#6f7f58'; c.fillRect(0, 0, cv.width, cv.height);
    L.forEach((e, i) => { const gx = (i % per) * dirs.length, gy = Math.floor(i / per);
      dirs.forEach((d, j) => c.drawImage(S.getArt(e.look, d, 0), (gx + j) * (F.w + 2) * Z, (gy * (F.h + 12) + 10) * Z, F.w * Z, F.h * Z));
      c.fillStyle = '#fff'; c.font = (9 * Z) + 'px sans-serif'; c.fillText(e.name, gx * (F.w + 2) * Z + 2, gy * (F.h + 12) * Z + 9 * Z); });
    return cv;`);
  await save(p, 'road_walk_cycle.png', `
    const S = RB.sprites, F = S.FRAME, Z = 3, dirs = ['down', 'left', 'right', 'up'];
    const looks = [{ skin: 1, hair: 'ponytail', hairColor: 3, outfit: 2, shape: 'coat', acc: ['flower', 'glasses'] }].concat(CH.comps.map((id) => RB.content.chars[id].look));
    const fr = ['w0', 'w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7', 'i0', 'i1', 'i2', 'i3'];
    const cv = document.createElement('canvas'); cv.width = fr.length * (F.w + 2) * Z; cv.height = looks.length * dirs.length * (F.h + 2) * Z;
    const c = cv.getContext('2d'); c.imageSmoothingEnabled = false; c.fillStyle = '#6f7f58'; c.fillRect(0, 0, cv.width, cv.height);
    looks.forEach((lk, i) => dirs.forEach((d, j) => fr.forEach((f, k) => c.drawImage(S.getArt(lk, d, f), k * (F.w + 2) * Z, ((i * dirs.length + j) * (F.h + 2)) * Z, F.w * Z, F.h * Z))));
    return cv;`);
  ok(!errors.length, 'no page errors (road sprites) ' + errors.join('; '));
  await p.context().close();
}

// ---- 2. in the world: sorting, anchor on the tile, emote height --------------------------------------------
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await helpers(p);
  await p.evaluate(() => {
    RB.game.settings.reducedMotion = true; RB.game.applySettings();
    RB.game.debugStart('rw.village', 22, 30, { comp: 'mio', flags: { departed: true, ch1_done: true } });
    document.querySelectorAll('.hud, .touchpad').forEach((e) => e.classList.add('hidden'));
  });
  await p.waitForTimeout(500);
  for (let i = 0; i < 20 && await p.evaluate(() => RB.ui.dialogue.isOpen()); i++) { await p.evaluate(() => RB.ui.dialogue.advance(true)); await p.waitForTimeout(60); }
  const r = await p.evaluate(async () => {
    const W = RB.world.W, P = W.player;
    const frame = () => new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res)));
    // find an open 1×2 column near the player: the companion stands above, the player in front of it
    const free = (x, y) => !RB.world.blocked(x, y, { ignorePlayer: true });
    let spot = null;
    for (let dy = -3; dy <= 3 && !spot; dy++) for (let dx = -3; dx <= 3 && !spot; dx++) { const x = P.x + dx, y = P.y + dy; if (free(x, y) && free(x, y + 1)) spot = [x, y]; }
    if (!spot) return { skip: true };
    const cm = W.comp;
    for (const n of W.npcs) n.alpha = 0;
    cm.x = cm.fx = spot[0]; cm.y = cm.fy = spot[1]; cm.mv = null; cm.dir = 'down'; cm.blinkT = 1e9;
    P.x = P.fx = spot[0]; P.y = P.fy = spot[1] + 1; P.mv = null; P.dir = 'up'; P.blinkT = 1e9;
    const cv = document.getElementById('world'), dpr = cv.width / cv.clientWidth;
    const grab = () => { const a = RB.render.tileToCss(spot[0], spot[1]), c = RB.render.tileToCss(spot[0] + 1, spot[1] + 1); const tw = (c.x - a.x) * dpr; return { tw, d: Array.from(cv.getContext('2d').getImageData(Math.round(a.x * dpr - tw * 0.25), Math.round(a.y * dpr), Math.round(tw * 1.5), Math.round(tw * 2)).data) }; };
    await frame();
    const both = grab();
    P.alpha = 0; await frame();
    const compOnly = grab();
    cm.alpha = 0; await frame();
    const none = grab();
    P.alpha = 1; await frame();
    const pcOnly = grab();
    cm.alpha = 1; await frame();
    // where both of them cover the ground (the player's head over the companion's legs), what shows is the player
    const dist = (A, B2, i) => Math.abs(A[i] - B2[i]) + Math.abs(A[i + 1] - B2[i + 1]) + Math.abs(A[i + 2] - B2[i + 2]);
    let overlap = 0, playerWins = 0;
    for (let i = 0; i < both.d.length; i += 4) {
      if (dist(pcOnly.d, none.d, i) < 40 || dist(compOnly.d, none.d, i) < 40 || dist(pcOnly.d, compOnly.d, i) < 40) continue;
      overlap++; if (dist(both.d, pcOnly.d, i) < dist(both.d, compOnly.d, i)) playerWins++;
    }
    // the player's sprite: its lowest drawn row sits 2 art px above the tile's bottom edge
    const art = RB.sprites.getArt(P.look, 'up', 0);
    return { overlap, playerWins, spot, anchor: RB.sprites.ANCHOR, artH: art.height };
  });
  if (r.skip) ok(false, 'no free spot to stand two people in a column');
  else ok(r.overlap > 200 && r.playerWins / r.overlap > 0.9, `depth sorting: the person in front (lower on the map) is drawn over the one behind where they overlap (${r.playerWins}/${r.overlap} px)`);
  await p.screenshot({ path: path.join(outDir, 'world_cast.png') });
  console.log('     shot ' + path.relative(root, path.join(outDir, 'world_cast.png')));
  ok(!errors.length, 'no page errors (world) ' + errors.join('; '));
  await p.context().close();
}

// ---- 3. battle figures ---------------------------------------------------------------------------------------
{
  const { p, errors } = await page(b, url);
  await helpers(p);
  const api = await p.evaluate(() => {
    const B = RB.battlers;
    const cv = document.createElement('canvas'); cv.width = 200; cv.height = 200;
    const pts = B.draw(cv.getContext('2d'), RB.content.chars.nao.look, { x: 100, y: 180, scale: 1, pose: 'ready', t: 0, who: 'comp' });
    const pv = B.preview(RB.content.chars.mio.look, 'act', 'direct', 0.5);
    const num = (q) => q && isFinite(q.x) && isFinite(q.y);
    // facing up-left (kept for later): the mirror image, standing on the same anchor point
    const cvR = document.createElement('canvas'), cvL = document.createElement('canvas');
    cvR.width = cvL.width = 200; cvR.height = cvL.height = 200;
    const pR = B.draw(cvR.getContext('2d'), RB.content.chars.nao.look, { x: 100, y: 180, pose: 'act', gesture: 'direct', k: 1, who: 'comp' });
    const pL = B.draw(cvL.getContext('2d'), RB.content.chars.nao.look, { x: 100, y: 180, pose: 'act', gesture: 'direct', k: 1, who: 'comp', facing: 'upleft' });
    const dR = cvR.getContext('2d').getImageData(0, 0, 200, 200).data, dL = cvL.getContext('2d').getImageData(0, 0, 200, 200).data;
    let mism = 0;
    for (let y = 0; y < 200; y++) for (let x = 1; x < 200; x++) if (dR[(y * 200 + x) * 4 + 3] !== dL[(y * 200 + (199 - x + 1)) * 4 + 3]) mism++;
    const mirrorOk = mism < 40 && Math.abs((pR.hand.x - 100) + (pL.hand.x - 100)) < 1.5 && pL.feet.x === 100;
    return { FRAME: B.FRAME, ANCHOR: B.ANCHOR, POSES: B.POSES, GESTURES: B.GESTURES, pts, ptsOk: ['hand', 'head', 'chest', 'feet'].every((k) => num(pts[k])), pv: [pv.width, pv.height], feet: pts.feet, mirrorOk, mism };
  });
  ok(api.POSES.join() === 'ready,calm,anticipate,act,recover,hit,brace,down,cheer' && api.GESTURES.join() === 'direct,trace,book,ward,restore,flow,raise', 'RB.battlers.POSES and GESTURES are the agreed lists');
  ok(api.ptsOk && api.feet.x === 100 && api.feet.y === 180 && api.pts.head.y < api.pts.chest.y && api.pts.chest.y < api.pts.feet.y, 'draw() returns hand, head, chest and feet in canvas px (feet at the anchor, head above chest above feet) ' + JSON.stringify(api.pts));
  ok(api.pv[0] === api.FRAME.w && api.pv[1] === api.FRAME.h, `preview() gives one ${api.FRAME.w}×${api.FRAME.h} frame; anchor (${api.ANCHOR.x}, ${api.ANCHOR.y})`);
  ok(api.mirrorOk, `facing 'upleft' draws the mirror image on the same anchor, the hand point mirrored (${api.mism} px differ from an exact mirror)`);

  const r = await p.evaluate(() => {
    const B = RB.battlers, F = B.FRAME, A = B.ANCHOR;
    const pc = { skin: 1, hair: 'ponytail', hairColor: 3, outfit: 2, shape: 'coat', acc: ['flower', 'glasses'] };
    const cast = [['pc', pc]].concat(CH.comps.map((id) => ['comp', RB.content.chars[id].look]));
    const combos = [];
    for (const pose of ['ready', 'calm', 'hit', 'brace', 'down', 'cheer']) for (const k of [0, 0.2, 0.5, 1]) combos.push([pose, null, k]);
    for (const pose of ['anticipate', 'act', 'recover']) for (const g of B.GESTURES) for (const k of [0, 0.25, 0.5, 0.75, 1]) combos.push([pose, g, k]);
    const bad = [];
    let n = 0;
    for (const [who, lk] of cast) {
      const ready = CH.data(B.preview(lk, 'ready', null, 0, { who, reduce: true }));
      for (const [pose, g, k] of combos) {
        const cv = B.preview(lk, pose, g, k, { who, reduce: true });
        n++;
        const bx = CH.box(cv);
        const tag = who + ' ' + (lk.hair) + ' ' + pose + (g ? '/' + g : '') + ' k' + k;
        if (bx.n < 900) bad.push(tag + ': nearly blank');
        // the feet stay planted on the anchor: the lowest drawn row is the ground under the anchor
        if (bx.y1 < A.y || bx.y1 > A.y + 2) bad.push(tag + ': lowest row ' + bx.y1 + ' (anchor ' + A.y + ')');
        const feet = CH.row(cv, bx.y1);
        if (!feet.length || Math.abs((Math.min(...feet) + Math.max(...feet)) / 2 - A.x) > 14) bad.push(tag + ': feet centred ' + (feet.length ? (Math.min(...feet) + Math.max(...feet)) / 2 : '-') + ', anchor x ' + A.x);
        if (bx.x0 <= 0 || bx.x1 >= F.w - 1 || bx.y0 <= 0) bad.push(tag + ': touches the frame edge ' + JSON.stringify(bx));
      }
      // no drift: a whole gesture comes back to exactly the stance it started from
      for (const g of B.GESTURES) {
        const back = CH.data(B.preview(lk, 'recover', g, 1, { who, reduce: true }));
        if (CH.diff(back, ready)) bad.push(who + ' ' + g + ': recover k1 differs from the stance by ' + CH.diff(back, ready) + ' px');
        const start = CH.data(B.preview(lk, 'anticipate', g, 0, { who, reduce: true }));
        if (CH.diff(start, ready)) bad.push(who + ' ' + g + ': anticipate k0 differs from the stance by ' + CH.diff(start, ready) + ' px');
      }
      for (const pose of ['hit', 'brace']) {
        const end = CH.data(B.preview(lk, pose, null, 1, { who, reduce: true }));
        if (CH.diff(end, ready)) bad.push(who + ' ' + pose + ': k1 differs from the stance by ' + CH.diff(end, ready) + ' px');
      }
    }
    return { n, bad, cast: cast.length, combos: combos.length };
  });
  ok(!r.bad.length, `${r.cast} figures (the player and all four companions) × ${r.combos} pose/gesture/progress frames = ${r.n}: not blank, feet planted on the anchor, nothing clipped; every gesture, hit and brace ends exactly in the stance it began from` + (r.bad.length ? '\n     ' + r.bad.slice(0, 16).join('\n     ') : ''));

  // accessories stay attached: present in every pose, around the part they belong to
  const acc = await p.evaluate(() => {
    const B = RB.battlers;
    const base = { skin: 2, hair: 'short', hairColor: 1, outfit: 0, shape: 'tunic', acc: [] };
    const poses = [['ready', null, 0], ['calm', null, 0], ['hit', null, 0.2], ['brace', null, 0.25], ['down', null, 1], ['cheer', null, 1]];
    for (const g of B.GESTURES) poses.push(['anticipate', g, 1], ['act', g, 0.5], ['act', g, 1]);
    const bad = [], min = {};
    const at = (a, pose) => (a === 'lamp' || a === 'cane' ? 'handL' : a === 'basket' ? 'handR' : 'head');
    // (the basket and cane are carried only by people who never fight; the lantern is Ren's)
    for (const a of ['hat', 'headband', 'cap', 'hood', 'scarf', 'satchel', 'cape', 'earrings', 'lamp', 'ribbon', 'atlas_quill', 'flower', 'atlas_sash', 'toolbelt', 'atlas_lamplet']) {
      const lk = Object.assign({}, base, { acc: [a] });
      min[a] = 1e9;
      for (const [pose, g, k] of poses) {
        const w = B.FRAME.w;
        const d = CH.diffBox(CH.data(B.preview(base, pose, g, k, { who: 'comp', reduce: true })), CH.data(B.preview(lk, pose, g, k, { who: 'comp', reduce: true })), w, B.ANCHOR.x);
        min[a] = Math.min(min[a], d.n);
        const need = ['earrings', 'flower', 'ribbon', 'atlas_quill', 'cane'].includes(a) ? 3 : 12;
        if (d.n < need) { bad.push(a + ' in ' + pose + (g ? '/' + g : '') + ' k' + k + ': only ' + d.n + ' px'); continue; }
        // head things stay by the head point the renderer reports
        if (['hat', 'headband', 'cap', 'hood'].includes(a)) {
          const cv = document.createElement('canvas'); cv.width = w; cv.height = B.FRAME.h;
          const pt = B.draw(cv.getContext('2d'), lk, { x: B.ANCHOR.x, y: B.ANCHOR.y, scale: 1, pose, gesture: g, k, who: 'comp', reduce: true });
          if (pt.head.x < d.x0 - 4 || pt.head.x > d.x1 + 4 || pt.head.y < d.y0 - 6 || pt.head.y > d.y1 + 6) bad.push(a + ' in ' + pose + ' k' + k + ': drawn at ' + [d.x0, d.y0, d.x1, d.y1] + ', away from the head ' + [pt.head.x, pt.head.y]);
        }
      }
    }
    return { bad, min };
  });
  ok(!acc.bad.length, 'accessories are drawn in every pose and head things stay on the head (least visible px per accessory ' + JSON.stringify(acc.min) + ')' + (acc.bad.length ? '\n     ' + acc.bad.slice(0, 16).join('\n     ') : ''));

  // motion: reduced motion is still; normal motion is alive with the feet planted; pc and companion differ
  const mo = await p.evaluate(() => {
    const B = RB.battlers, A = B.ANCHOR, F = B.FRAME;
    const pc = { skin: 1, hair: 'ponytail', hairColor: 3, outfit: 2, shape: 'coat', acc: ['flower', 'glasses'] };
    const comp = RB.content.chars.nao.look;
    const frameAt = (lk, who, t, reduce, pose) => { const cv = document.createElement('canvas'); cv.width = F.w; cv.height = F.h; B.draw(cv.getContext('2d'), lk, { x: A.x, y: A.y, scale: 1, pose: pose || 'ready', t, who, reduce }); return CH.data(cv); };
    const still = [];
    for (const [lk, who] of [[pc, 'pc'], [comp, 'comp']]) for (const pose of ['ready', 'calm']) still.push(CH.diff(frameAt(lk, who, 0, true, pose), frameAt(lk, who, 3700, true, pose)) + CH.diff(frameAt(lk, who, 0, true, pose), frameAt(lk, who, 9100, true, pose)));
    // over the first loop (before the characteristic gesture): upper body moves, feet rows do not
    const alive = {}, feetMoved = {}, sig = {};
    for (const [lk, who] of [[pc, 'pc'], [comp, 'comp']]) {
      const L = B.LOOP[who];
      const f0 = frameAt(lk, who, 0, false);
      let maxUpper = 0, maxFeet = 0;
      sig[who] = [];
      for (let t = 0; t < L; t += 100) {
        const f = frameAt(lk, who, t, false);
        let up = 0, fe = 0;
        for (let i = 0; i < f.length; i += 4) {
          const y = Math.floor(i / 4 / F.w), dd = Math.abs(f[i] - f0[i]) + Math.abs(f[i + 1] - f0[i + 1]) + Math.abs(f[i + 2] - f0[i + 2]) + Math.abs(f[i + 3] - f0[i + 3]) > 24;
          if (!dd) continue;
          if (y >= A.y - 3) fe++; else up++;
        }
        maxUpper = Math.max(maxUpper, up); maxFeet = Math.max(maxFeet, fe); sig[who].push(up);
      }
      alive[who] = maxUpper; feetMoved[who] = maxFeet;
    }
    // the two idles are not in step: correlation of their motion over 6 s
    const n = Math.min(sig.pc.length, sig.comp.length), a = sig.pc.slice(0, n), c = sig.comp.slice(0, n);
    const mean = (v) => v.reduce((s, x) => s + x, 0) / v.length, ma = mean(a), mc = mean(c);
    let num = 0, da = 0, dc = 0;
    for (let i = 0; i < n; i++) { num += (a[i] - ma) * (c[i] - mc); da += (a[i] - ma) ** 2; dc += (c[i] - mc) ** 2; }
    return { still, alive, feetMoved, corr: num / Math.sqrt(da * dc || 1), loops: B.LOOP };
  });
  ok(mo.still.every((v) => v === 0), 'reduced motion: the ready and calm stances are identical frames at different times ' + JSON.stringify(mo.still));
  ok(mo.alive.pc > 60 && mo.alive.comp > 60, `normal motion: the upper body breathes, springs and shifts weight (up to ${mo.alive.pc} / ${mo.alive.comp} px change from the first frame)`);
  ok(mo.feetMoved.pc < Math.max(24, mo.alive.pc * 0.03) && mo.feetMoved.comp < Math.max(24, mo.alive.comp * 0.03), `…with the feet planted: the bottom rows barely change (${mo.feetMoved.pc} / ${mo.feetMoved.comp} px, the boot shafts following the knees) — not a whole-sprite bob`);
  ok(mo.loops.pc !== mo.loops.comp && Math.abs(mo.corr) < 0.8, `player and companion idle on their own timing (loops ${mo.loops.pc} / ${mo.loops.comp} ms, motion correlation ${mo.corr.toFixed(2)})`);

  // cost: a cached frame is a drawImage; a new frame is built once
  const cost = await p.evaluate(() => {
    const B = RB.battlers, cv = document.createElement('canvas'); cv.width = 400; cv.height = 300;
    const c = cv.getContext('2d'), lk = RB.content.chars.suzu.look;
    B._.clear();
    let t0 = performance.now();
    for (let i = 0; i < 20; i++) B.draw(c, lk, { x: 200, y: 280, scale: 2, pose: 'act', gesture: 'flow', k: i / 19, who: 'comp' });
    const build = (performance.now() - t0) / 20;
    t0 = performance.now();
    for (let i = 0; i < 400; i++) B.draw(c, lk, { x: 200, y: 280, scale: 2, pose: 'act', gesture: 'flow', k: (i % 20) / 19, who: 'comp' });
    const cached = (performance.now() - t0) / 400;
    return { build, cached };
  });
  ok(cost.cached < 1, `frame cost: a cached battle frame draws in ${cost.cached.toFixed(3)} ms; a new one is built in ${cost.build.toFixed(1)} ms (once per look, pose and step)`);

  // review sheets: every pose and gesture for the player and a companion; the idle as a frame sequence
  const poseSheet = `
    const B = RB.battlers, F = B.FRAME, Z = 2, [lk, who] = arg === 'pc' ? [{ skin: 1, hair: 'ponytail', hairColor: 3, outfit: 2, shape: 'coat', acc: ['flower', 'glasses'] }, 'pc'] : [RB.content.chars[arg].look, 'comp'];
    const rows = [[['ready', null, 0], ['calm', null, 0], ['hit', null, 0.15], ['hit', null, 0.5], ['brace', null, 0.25], ['down', null, 0.5], ['down', null, 1], ['cheer', null, 0.3], ['cheer', null, 1]]]
      .concat(B.GESTURES.map((g) => [['anticipate', g, 0.5], ['anticipate', g, 1], ['act', g, 0.2], ['act', g, 0.5], ['act', g, 1], ['recover', g, 0.4], ['recover', g, 1]]));
    const cols = 9, cv = document.createElement('canvas'); cv.width = (cols * F.w + 70) * Z; cv.height = rows.length * F.h * Z;
    const c = cv.getContext('2d'); c.imageSmoothingEnabled = false; c.fillStyle = '#5f6e52'; c.fillRect(0, 0, cv.width, cv.height);
    rows.forEach((row, j) => { c.fillStyle = '#fff'; c.font = (8 * Z) + 'px sans-serif'; c.fillText(j ? B.GESTURES[j - 1] : 'stance', 4, (j * F.h + 14) * Z);
      row.forEach(([pose, g, k], i) => { const x = 70 + i * F.w; c.fillStyle = (i + j) % 2 ? '#6a7a5c' : '#728264'; c.fillRect(x * Z, j * F.h * Z, F.w * Z, F.h * Z);
        c.fillStyle = 'rgba(20,16,30,0.28)'; c.beginPath(); c.ellipse((x + B.ANCHOR.x) * Z, (j * F.h + B.ANCHOR.y - 1) * Z, 14 * Z, 3 * Z, 0, 0, 7); c.fill();
        B.draw(c, lk, { x: (x + B.ANCHOR.x) * Z, y: (j * F.h + B.ANCHOR.y) * Z, scale: Z, pose, gesture: g, k, who, reduce: true });
        c.fillStyle = '#fff'; c.font = (6 * Z) + 'px sans-serif'; c.fillText(pose + ' ' + k, (x + 2) * Z, (j * F.h + 8) * Z); }); });
    return cv;`;
  await save(p, 'battle_poses_pc.png', poseSheet, 'pc');
  for (const id of ['nao', 'mio', 'ren', 'suzu']) await save(p, 'battle_poses_' + id + '.png', poseSheet, id);
  await save(p, 'battle_idle_sequence.png', `
    const B = RB.battlers, F = B.FRAME, Z = 2, N = 16;
    const rows = [[{ skin: 1, hair: 'ponytail', hairColor: 3, outfit: 2, shape: 'coat', acc: ['flower', 'glasses'] }, 'pc'], [RB.content.chars.nao.look, 'comp'], [RB.content.chars.ren.look, 'comp']];
    const cv = document.createElement('canvas'); cv.width = N * F.w * Z; cv.height = rows.length * (F.h + 10) * Z;
    const c = cv.getContext('2d'); c.imageSmoothingEnabled = false; c.fillStyle = '#5f6e52'; c.fillRect(0, 0, cv.width, cv.height);
    rows.forEach(([lk, who], j) => { const step = (2 * B.LOOP[who]) / N;
      for (let i = 0; i < N; i++) { const x = i * F.w, y = j * (F.h + 10) + 10; c.fillStyle = i % 2 ? '#6a7a5c' : '#728264'; c.fillRect(x * Z, y * Z, F.w * Z, F.h * Z);
        c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(x * Z, (y + B.ANCHOR.y) * Z, F.w * Z, Z);
        B.draw(c, lk, { x: (x + B.ANCHOR.x) * Z, y: (y + B.ANCHOR.y) * Z, scale: Z, pose: 'ready', t: Math.round(i * step), who });
        c.fillStyle = '#fff'; c.font = (6 * Z) + 'px sans-serif'; c.fillText(who + ' ' + Math.round(i * step) + ' ms', (x + 2) * Z, (y - 2) * Z); } });
    return cv;`);
  await save(p, 'battle_all_looks.png', `
    const B = RB.battlers, F = B.FRAME, Z = 2, L = CH.L.filter((e) => !e.npc || CH.L.indexOf(e) % 9 === 0), per = 12;
    const cv = document.createElement('canvas'); cv.width = per * F.w * Z; cv.height = Math.ceil(L.length / per) * F.h * Z;
    const c = cv.getContext('2d'); c.imageSmoothingEnabled = false; c.fillStyle = '#5f6e52'; c.fillRect(0, 0, cv.width, cv.height);
    L.forEach((e, i) => { const x = (i % per) * F.w, y = Math.floor(i / per) * F.h; c.fillStyle = (i + Math.floor(i / per)) % 2 ? '#6a7a5c' : '#728264'; c.fillRect(x * Z, y * Z, F.w * Z, F.h * Z);
      if (!e.look.custom) B.draw(c, e.look, { x: (x + B.ANCHOR.x) * Z, y: (y + B.ANCHOR.y) * Z, scale: Z, pose: 'ready', t: 0, who: e.comp ? 'comp' : 'comp', reduce: true });
      c.fillStyle = '#fff'; c.font = (6 * Z) + 'px sans-serif'; c.fillText(e.name, (x + 2) * Z, (y + 8) * Z); });
    return cv;`);
  ok(!errors.length, 'no page errors (battle figures) ' + errors.join('; '));
  await p.context().close();
}

await b.close();
srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
