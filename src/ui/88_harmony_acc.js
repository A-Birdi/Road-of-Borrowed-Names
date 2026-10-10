/* Harmony portrait busts — worn things. Every accessory a look can carry
 * (the creation choices and every keepsake with a visible representation in
 * the battle figures and dialogue portraits), each on its own side of the
 * body and in its own layer of the layering contract:
 *
 *   capeBack  the cape behind the shoulders
 *   earF      the far earring, peeking under the jaw (behind the head)
 *   chest     satchel or sash strap, bell, pin, patches, the cape's front
 *   scarf     the wrap round the neck and its tail
 *   glasses   frames and lenses (under the fringe, over the face)
 *   headAcc   hat, cap, headband, ribbon, flower, leaf, quill, pencil
 *   earN      the near earring, under the near ear
 *
 * Sides follow the source: the ribbon, flower, leaf, quill and Nao's pencil
 * are worn on the character's left (the far side here), the pin on the right
 * chest (near), the satchel's strap from the right shoulder to the left hip,
 * the scarf's tail on the left breast. Nothing is mirrored. The Atlas's
 * little lantern hangs at the hip, below every bust's crop, so it is not
 * drawn (docs/harmony/ART.md lists it). */
var RB = (globalThis.RB = globalThis.RB || {});

RB.harmonyKit = RB.harmonyKit || {};
(function (HK) {
  'use strict';
  const put = (...a) => HK.put(...a);
  const GOLD = '#e0b850';
  const mat = (key, c, o) => HK.M(key, c, Object.assign({ n: 5, at: 3, step: 0.1, cool: 250, warm: 52, lineCol: '#140c18' }, o));

  // c: { S (stack), hx, hy, ax, ay, look, d (materials), arms, s (settle px), who }
  const A = {};
  // ---- chest -------------------------------------------------------------------------------------
  A.satchel = function (c) {
    const L = c.S.L('chest');
    const Ml = HK.leatherMat('#7a5630');
    const w = c.look.bigSatchel ? 2.6 : 2.1;
    const pts = [[-21, -4.6, w], [-6, 6, w], [8, 17, w], [24, 30, w]].map((p) => [c.ax + p[0], c.ay + p[1], p[2]]);
    HK.strand(L, pts, Ml, { base: 3, tipDark: 0, seam: false, only: (X, Y) => !!HK.get(c.S.L('torso'), X, Y) || Y < c.ay - 2 });
    // stitching along the strap and a brass buckle on the chest
    for (let t = 0.08; t < 0.96; t += 0.09) {
      const x = -21 + 45 * t, y = -4.6 + 34.6 * t;
      put(L, Math.round(c.ax + x - 0.8), Math.round(c.ay + y - 1.6), Ml, 4);
    }
    const Mb = HK.metalMat(GOLD);
    const bx = Math.round(c.ax - 3), by = Math.round(c.ay + 8);
    for (const [x, y, k] of [[0, 0, 4], [1, 0, 3], [2, 0, 3], [0, 1, 3], [2, 1, 1], [0, 2, 2], [1, 2, 1], [2, 2, 1]]) put(L, bx + x, by + y, Mb, k);
  };
  A.atlas_sash = function (c) {
    const L = c.S.L('chest');
    const Ms = mat('sash', c.look.sashCol || '#d8c89a', { step: 0.07, cool: 230 });
    const pts = [[-22, -5, 3.4], [-4, 8, 3.6], [12, 20, 3.6], [26, 31, 3.4]].map((p) => [c.ax + p[0], c.ay + p[1], p[2]]);
    HK.strand(L, pts, Ms, { base: 3, tipDark: 0, seam: true, only: (X, Y) => !!HK.get(c.S.L('torso'), X, Y) || Y < c.ay - 2 });
    // map lines printed on the paper
    const Mi = mat('sashInk', '#8a6a4a');
    for (const [x0, y0, x1, y1] of [[-14, 0, -9, 4], [-2, 9, 3, 13], [9, 18, 13, 21]]) HK.line(L, c.ax, c.ay, x0, y0, x1, y1, Mi, 2, true);
  };
  A.bell = function (c) {
    const L = c.S.L('chest');
    const Mc = mat('cord', c.look.cordCol || '#b8342a', { step: 0.08 });
    HK.line(L, c.ax, c.ay, -8.6, -8.6, -1, 1.4, Mc, 3); HK.line(L, c.ax, c.ay, -8, -9.4, -0.4, 0.6, Mc, 2);
    HK.line(L, c.ax, c.ay, 7.2, -8, 0.6, 1.4, Mc, 2);
    const Mb = HK.metalMat(c.look.bellCol || GOLD);
    const bx = c.ax - 0.5, by = c.ay + 5.5;
    for (let Y = Math.floor(by - 4); Y <= by + 4; Y++) for (let X = Math.floor(bx - 4); X <= bx + 4; X++) {
      const x = X + 0.5 - bx, y = Y + 0.5 - by;
      if (!HK.inEll(x, y, 0, 0, 3.6, 3.8)) continue;
      let k = 3;
      if (x + y < -2.4) k = 4;
      if (x - y > 2.6 || y > 2.2) k = 1;
      if (HK.inEll(x, y, -1.2, -1.4, 0.9, 0.9)) k = 4;
      put(L, X, Y, Mb, k);
    }
    for (let x = -3; x <= 3; x++) put(L, Math.round(bx + x - 0.5), Math.round(by + 1.6), Mb, x < 0 ? 2 : 1);
    put(L, Math.round(bx - 0.5), Math.round(by + 2.8), mat('bellslot', '#3a2410'), 1);
  };
  A.atlas_pin = function (c) {
    const L = c.S.L('chest');
    const Mg = HK.metalMat(GOLD), Mbl = mat('pinblue', '#3a5a8a');
    const x = Math.round(c.ax - 15), y = Math.round(c.ay + 7);
    const rows = ['...4...', '...3...', '..434..', '43bbb32', '..2b1..', '...2...', '...1...'];
    HK.tpl(L, x - 3, y - 3, rows, { 4: [Mg, 4], 3: [Mg, 3], 2: [Mg, 2], 1: [Mg, 1], b: [Mbl, 3] });
  };
  A.patches = function (c) {
    const L = c.S.L('chest');
    const Mp = mat('patch', '#8a7a5a', { step: 0.08 });
    const patch = (x0, y0, w, h) => {
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const X = Math.round(c.ax + x0 + x), Y = Math.round(c.ay + y0 + y);
        if (!HK.get(c.S.L('torso'), X, Y)) continue;
        const edge = x === 0 || y === 0 || x === w - 1 || y === h - 1;
        put(L, X, Y, Mp, edge ? ((x + y) % 2 ? 1 : 2) : y < 2 ? 4 : 3);
      }
    };
    if (c.arms.near !== 'up') patch(-33, 12, 6, 6); else patch(-24, 12, 6, 6);
    patch(12, 18, 7, 6);
  };
  // the cape's front: over both shoulders, falling straight, a gold clasp at the throat
  A.cape = function (c, part) {
    const R = mat('cape', c.look.capeCol || '#6a3a4a', { n: 6, at: 3, step: 0.075 });
    if (part === 'back') {
      const L = c.S.L('capeBack');
      HK.polyFill(L, c.ax, c.ay, [[-10, -10], [-26, -5], [-36, 2], [-40, 14], [-41, 44], [31, 44], [31, 14], [27, 2], [18, -6], [8, -10]], R, (x, y) => (x < -30 ? 4 : x > 24 ? 1 : 2));
      return;
    }
    const L = c.S.L('chest');
    const fold = [[-9.6, -9.6], [-20, -5], [-29, 0], [-33, 6], [-29, 9], [-20, 7], [-12, 7], [-6, 0]];
    HK.polyFill(L, c.ax, c.ay, fold, R, (x, y) => (y < -3 && x < -14 ? 5 : y < 2 ? 4 : 3));
    HK.polyFill(L, c.ax, c.ay, [[6, -9], [15, -4], [23, 1], [26, 6], [22, 9], [14, 7], [6, 1]], R, (x, y) => (y < -2 ? 3 : 2));
    HK.line(L, c.ax, c.ay, -29, 8.6, -14, 7, R, 1);
    const Mg = HK.metalMat(GOLD);
    for (const [x, y, k] of [[-1, -2, 4], [0, -2, 3], [-2, -1, 4], [-1, -1, 4], [0, -1, 3], [1, -1, 2], [-2, 0, 3], [-1, 0, 3], [0, 0, 2], [1, 0, 1], [-1, 1, 2], [0, 1, 1]]) put(L, c.ax + x, c.ay - 1 + y, Mg, k);
  };
  // ---- scarf --------------------------------------------------------------------------------------
  A.scarf = function (c) {
    const L = c.S.L('scarf');
    const R = mat('scarf', c.look.scarfCol || '#c8962e', { n: 6, at: 3, step: 0.075 });
    const St = c.look.scarfStripe ? mat('stripe', c.look.scarfStripe, { n: 6, at: 3, step: 0.075 }) : null;
    const s = c.s || 0;
    // the wrap: a thick roll round the neck's base, folds rising to the near side
    const wrap = [[-12.6, -12], [-4, -10.6], [5, -11], [11.6, -10.2], [13, -5.4], [9, -1.6], [0, 0.4], [-9.6, -0.6], [-15.6, -4.6]];
    HK.polyFill(L, c.ax, c.ay, wrap, R, (x, y) => {
      let k = x < -6 ? 4 : x > 7 ? 2 : 3;
      const u = (y + x * 0.22 + 20) % 4.2;
      if (u < 1) k -= 1; else if (u > 3.2 && k < 5) k += 1;
      if (y > -1.4) k = Math.min(k, 2);
      return k;
    });
    // the tail over the far breast, splitting into two ends
    const tail = [[5, -3, 3], [7 + s * 0.3, 6, 3.4], [8.6 + s * 0.6, 15, 3.2], [9 + s, 22, 2.6]].map((p) => [c.ax + p[0], c.ay + p[1], p[2]]);
    HK.strand(L, tail, R, { base: 3, tipDark: 0.14 });
    HK.strand(L, [[c.ax + 9 + s, c.ay + 20, 1.6], [c.ax + 7 + s, c.ay + 27, 1.4]], R, { base: 2, tipDark: 0 });
    HK.strand(L, [[c.ax + 10 + s, c.ay + 20, 1.6], [c.ax + 12.4 + s, c.ay + 26.6, 1.3]], R, { base: 3, tipDark: 0 });
    if (St) {
      for (let Y = c.ay - 13; Y < c.ay + 30; Y++) for (let X = c.ax - 17; X < c.ax + 16; X++) {
        if (!HK.get(L, X, Y)) continue;
        const y = Y - c.ay, x = X - c.ax;
        const band = y < 1 ? Math.floor((x + 20) / 5.2) % 2 === 0 && (x + 20) % 5.2 < 1.8 : Math.floor((y + 30) / 6) % 2 === 0 && (y + 30) % 6 < 2;
        if (!band) continue;
        const i = Y * L.w + X, k = R.c.indexOf(L.px[i]);
        put(L, X, Y, St, k < 0 ? 3 : k);
      }
    }
  };
  // ---- glasses ------------------------------------------------------------------------------------
  // Two lenses round the eyes (the far one foreshortened), a bridge over the nose, the near arm running
  // back to the ear; a faint tint and a glare streak on each lens's upper left.
  A.glasses = function (c) {
    const L = c.S.L('glasses');
    const H = HK.HEAD;
    const F = HK.M('frame', c.look.glassCol || '#2a2630', { n: 4, at: 2, step: 0.1, line: false });
    const tint = HK.flat('#e8f2ff22', { line: false });
    const glare = HK.flat('#ffffffd0', { line: false });
    const hx = c.hx, hy = c.hy;
    const lens = (x0, y0, w, h) => {
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const corner = (x === 0 || x === w - 1) && (y === 0 || y === h - 1);
        if (corner) continue;
        const edge = x === 0 || y === 0 || x === w - 1 || y === h - 1;
        put(L, hx + x0 + x, hy + y0 + y, edge ? F : tint, edge ? (y === 0 ? 3 : 1) : 0);
      }
      put(L, hx + x0 + 2, hy + y0 + 1, glare, 0); put(L, hx + x0 + 1, hy + y0 + 2, glare, 0); put(L, hx + x0 + 3, hy + y0 + 1, glare, 0);
    };
    lens(H.eyeN.x - 7, H.eyeN.y - 5, 14, 11);
    lens(H.eyeF.x - 4, H.eyeF.y - 5, 10, 11);
    HK.line(L, hx, hy, H.eyeN.x + 7, H.eyeN.y - 2, H.eyeF.x - 4, H.eyeF.y - 2, F, 2);
    HK.line(L, hx, hy, H.eyeN.x - 7, H.eyeN.y - 3, -15.4, H.eyeN.y - 1, F, 2);
    HK.line(L, hx, hy, H.eyeF.x + 5, H.eyeF.y - 3, H.eyeF.x + 7, H.eyeF.y - 3, F, 1);
  };
  // ---- head ---------------------------------------------------------------------------------------
  A.headband = function (c) {
    const L = c.S.L('headAcc');
    const R = mat('band', c.look.bandCol || c.d.cloth[2], { n: 6, at: 3, step: 0.08 });
    for (let x = -19; x <= 19; x++) {
      const t = (x + 19) / 38;
      const y = -15 - Math.sin(t * Math.PI) * 4.2 + t * 2;
      for (let k = 0; k < 3; k++) put(L, c.hx + x, Math.round(c.hy + y + k), R, k === 0 ? 4 : k === 2 ? 1 : x < 0 ? 3 : 2);
    }
    // the knot's tails at the back of the head
    HK.strand(L, [[c.hx - 19, c.hy - 14, 1.8], [c.hx - 24 - c.s, c.hy - 9, 1.6], [c.hx - 25 - c.s, c.hy - 3, 0.6]], R, { base: 3 });
    HK.strand(L, [[c.hx - 19, c.hy - 13, 1.6], [c.hx - 21 - c.s, c.hy - 5, 1.4], [c.hx - 20 - c.s, c.hy, 0.5]], R, { base: 2 });
  };
  // Hair under a hat or cap: everything above the band is the hat's (a spike or a bun does not poke through).
  function hideHairUnder(c, yHead) {
    const yb = c.hy + yHead;
    for (const name of ['cap', 'front', 'hairBack']) {
      const L = c.S.layers.get(name);
      if (!L) continue;
      for (let Y = 0; Y < Math.min(L.h, yb); Y++) for (let X = c.hx - 40; X <= c.hx + 40; X++) { if (X < 0 || X >= L.w) continue; const i = Y * L.w + X; L.px[i] = 0; L.mt[i] = 0; }
    }
  }
  A.hat = function (c) {
    const L = c.S.L('headAcc');
    const R = mat('hat', c.look.hatCol || '#8a6a44', { n: 6, at: 3, step: 0.075 });
    const hx = c.hx, hy = c.hy;
    hideHairUnder(c, -14);
    // the crown (woven rows), its band, then the brim seen a little from above
    HK.polyFill(L, hx, hy, [[-17, -15], [-16, -25], [-9, -31], [4, -32], [13, -28], [17.6, -21], [18.4, -14]], R, (x, y) => {
      let k = x < -7 ? 4 : x > 9 ? 2 : 3;
      if (x < -11 && y < -22) k = 5;
      if ((y + 40) % 4 < 1 && k > 1) k -= 1;
      return k;
    });
    HK.polyFill(L, hx, hy, [[-17.4, -18], [18.4, -17], [18.6, -13.6], [-17.6, -14.4]], R, (x) => (x < -8 ? 2 : 1));
    for (let Y = hy - 21; Y <= hy - 6; Y++) for (let X = hx - 33; X <= hx + 35; X++) {
      const x = X + 0.5 - hx, y = Y + 0.5 - hy;
      if (!HK.inEll(x, y, 1.6, -13.2, 32.6, 6)) continue;
      if (HK.inEll(x, y, 0.6, -15.2, 18.4, 3) && y < -14) continue; // behind the crown
      let k = y < -13.6 ? (x < -10 ? 5 : 4) : y < -11 ? 3 : 2;
      if (x > 20) k -= 1;
      if (y > -10.4) k = 1;
      put(L, X, Y, R, Math.max(0, k));
    }
  };
  A.cap = function (c) {
    const L = c.S.L('headAcc');
    const R = mat('cap', c.look.capCol || '#2c4468', { n: 6, at: 3, step: 0.075 });
    const hx = c.hx, hy = c.hy;
    hideHairUnder(c, -15);
    HK.polyFill(L, hx, hy, [[-19, -14], [-19, -24], [-12, -31], [0, -33], [12, -30], [19, -22], [19.6, -14]], R, (x, y) => (x < -9 ? 4 : x > 10 ? 2 : 3));
    HK.polyFill(L, hx, hy, [[-19.4, -17], [19.8, -16.6], [19.8, -12.6], [-19.4, -13]], R, (x, y) => (y < -15.6 ? 2 : 1));
    // the peak, pointing forward (to the right)
    HK.polyFill(L, hx, hy, [[-2, -13.4], [12, -14], [24, -11.6], [25, -9.4], [14, -9.6], [0, -11]], R, (x, y) => (y < -11.8 ? 1 : 0));
    const Mb = HK.metalMat(GOLD);
    for (const [x, y, k] of [[4, -24, 4], [5, -24, 3], [3, -23, 4], [4, -23, 3], [5, -23, 3], [6, -23, 2], [4, -22, 2], [5, -22, 1]]) put(L, hx + x, hy + y, Mb, k);
  };
  // a bow: two loops tipped up and out (the near one toward the light), folding into a knot, tails behind
  const BOW = [
    '...444...........33...',
    '..45554.........3443..',
    '.4555544.......344432.',
    '.45544444.....3443332.',
    '.454444443..23443332..',
    '.44444444322234433321.',
    '..4444443322333332221.',
    '...443333223333222211.',
    '.....3332..22222111...',
  ];
  A.ribbon = function (c) {
    const L = c.S.L('headAcc');
    const R = mat('ribbon', c.look.ribbonCol || '#c8687a', { n: 6, at: 3, step: 0.075 });
    const s = c.s || 0;
    const cx = c.hx + 6, cy = c.hy - 25;
    // tails behind the knot, falling to the far side (they trail a pixel or two as the bust arrives)
    HK.strand(L, [[cx + 1, cy + 2, 1.7], [cx + 4 + s * 0.4, cy + 8, 1.8], [cx + 5 + s, cy + 14, 1.2]], R, { base: 2 });
    HK.strand(L, [[cx + 3, cy + 2, 1.5], [cx + 9 + s * 0.4, cy + 6, 1.7], [cx + 12 + s, cy + 10, 1]], R, { base: 2 });
    HK.tpl(L, cx - 11, cy - 6, BOW, { 5: [R, 5], 4: [R, 4], 3: [R, 3], 2: [R, 2], 1: [R, 1] });
  };
  A.flower = function (c) {
    const L = c.S.L('headAcc');
    const R = mat('flower', c.look.flowerCol || '#f4a6a0', { n: 6, at: 3, step: 0.07 });
    const Mc = mat('flowerC', '#f0c860');
    const cx = c.hx + 15, cy = c.hy - 16;
    for (const [dx, dy, k] of [[0, -4, 5], [3.8, -1.4, 4], [2.4, 3.2, 2], [-2.4, 3.2, 3], [-3.8, -1.4, 4]]) {
      for (let Y = -2; Y <= 2; Y++) for (let X = -2; X <= 2; X++) if (X * X + Y * Y <= 4.4) put(L, Math.round(cx + dx + X), Math.round(cy + dy + Y), R, k - (X + Y > 1 ? 1 : 0));
    }
    for (const [x, y, k] of [[0, 0, 3], [-1, 0, 4], [0, -1, 4], [-1, -1, 4], [1, 0, 2], [0, 1, 2], [1, 1, 1]]) put(L, cx + x, cy + y, Mc, k);
    HK.strand(L, [[cx - 3, cy + 5, 0.9], [cx - 6, cy + 9, 0.8]], mat('stem', '#5a8a4a'), { base: 2 });
  };
  A.leaf = function (c) {
    const L = c.S.L('headAcc');
    const R = mat('leaf', c.look.leafCol || '#c8452a', { n: 6, at: 3, step: 0.075 });
    const cx = c.hx + 14, cy = c.hy - 19;
    const pts = [[0, -7], [2, -3], [6, -5], [5, -1], [9, -1], [5, 3], [6, 6], [1, 4], [0, 8], [-1, 4], [-6, 6], [-5, 3], [-9, -1], [-5, -1], [-6, -5], [-2, -3]];
    HK.polyFill(L, cx, cy, pts, R, (x, y) => (x + y < -3 ? 4 : x + y > 4 ? 2 : 3));
    HK.line(L, cx, cy, 0, -5, 0, 7, R, 1); HK.line(L, cx, cy, 0, 1, -5, -3, R, 1); HK.line(L, cx, cy, 0, 1, 5, -3, R, 1);
    HK.strand(L, [[cx, cy + 6, 0.8], [cx - 2, cy + 11, 0.7]], mat('pinstem', '#6a4a2a'), { base: 2 });
  };
  A.atlas_quill = function (c) {
    const L = c.S.L('headAcc');
    const R = mat('quill', '#f4f0e0', { n: 5, at: 3, step: 0.06, cool: 230 });
    const pts = [[c.hx + 15, c.hy - 4, 0.6], [c.hx + 19, c.hy - 13, 2.4], [c.hx + 23, c.hy - 22, 2.6], [c.hx + 27 + c.s * 0.3, c.hy - 30, 0.8]];
    HK.strand(L, pts, R, { base: 3, tipDark: 0.1 });
    HK.line(L, 0, 0, c.hx + 16, c.hy - 6, c.hx + 26, c.hy - 29, mat('rachis', '#c8b896'), 2);
  };
  A.pencil = function (c) {
    const L = c.S.L('headAcc');
    const My = mat('pencil', '#e0b040', { step: 0.09 });
    const pts = [[c.hx + 11, c.hy - 6, 1.6], [c.hx + 25, c.hy - 22, 1.6]];
    HK.strand(L, pts, My, { base: 3, tipDark: 0, seam: false });
    HK.strand(L, [[c.hx + 24, c.hy - 21, 1.7], [c.hx + 26.4, c.hy - 23.8, 1.7]], mat('eraser', '#e8a0a0'), { base: 3, tipDark: 0, seam: false });
    HK.strand(L, [[c.hx + 11.4, c.hy - 6.4, 1.2], [c.hx + 9.4, c.hy - 4, 0.4]], mat('wood', '#e8c890'), { base: 3, tipDark: 0.5, seam: false });
  };
  // ---- earrings ------------------------------------------------------------------------------------
  // a gold hoop at the lobe and a drop below it (the keepsake's glass in its own colour)
  function earring(L, x, y, look, s, small) {
    const Mg = HK.metalMat(GOLD);
    const Md = look.earCol ? mat('ear', look.earCol, { step: 0.1 }) : Mg;
    x = Math.round(x + (s || 0) * 0.5); y = Math.round(y);
    put(L, x, y, Mg, 3); put(L, x, y + 1, Mg, 2);
    const dy = 2;
    const rows = small ? ['.4.', '434', '.2.'] : ['.4.', '434', '332', '.1.'];
    HK.tpl(L, x - 1, y + dy, rows, { 4: [Md, 4], 3: [Md, 3], 2: [Md, 2], 1: [Md, 1] });
  }
  A.earrings = function (c, part) {
    const H = HK.HEAD;
    if (part === 'far') earring(c.S.L('earF'), c.hx + 13.5, c.hy + 13.6, c.look, c.s, true);
    else earring(c.S.L('earN'), c.hx + H.ear.x + 0.4, c.hy + H.ear.y + 5, c.look, c.s);
  };

  // Draw every accessory of the look into the stack. Returns the list drawn and the list left out.
  function drawAll(c) {
    const acc = c.look.acc || [];
    const drawn = [], skipped = [];
    const has = (a) => acc.includes(a);
    if (has('cape')) A.cape(c, 'back');
    if (has('earrings')) A.earrings(c, 'far');
    for (const a of ['satchel', 'atlas_sash', 'patches', 'bell', 'atlas_pin', 'cape']) if (has(a)) A[a](c);
    if (has('scarf')) A.scarf(c);
    if (has('glasses')) A.glasses(c);
    for (const a of ['hat', 'cap', 'headband', 'ribbon', 'flower', 'leaf', 'atlas_quill', 'pencil']) if (has(a)) A[a](c);
    if (has('earrings')) A.earrings(c, 'near');
    for (const a of acc) {
      if (A[a]) drawn.push(a);
      else skipped.push(a);
    }
    return { drawn, skipped };
  }
  HK.acc = A; HK.drawAcc = drawAll;
  // Accessories this module draws; the rest are deliberately not shown in a bust (with the reason).
  HK.ACC_NOT_SHOWN = { atlas_lamplet: 'hangs at the hip, below the crop', atlas_compass: 'hangs at the hip, below the crop', bottles: 'carried at the hip, below the crop (Mio holds one in her pose)', lamp: 'held in the hand by the pose (Ren)', beard: 'not a player option', cane: 'not carried by any party member', basket: 'not carried', book: 'not carried', hood: 'not a player option', toolbelt: 'not carried', apronstrap: 'part of the apron' };
})(RB.harmonyKit);
