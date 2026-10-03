/* Harmony portrait busts — the figure below the head: shoulders and chest in
 * each garment's construction (tunic, robe, coat, apron, dress, and the high
 * collar), sleeves on posed arms, and articulated hands.
 *
 * Anchor space: (0, 0) is the pit of the neck, x to the right, y down, art
 * px. The body is turned a little less than the head (about 20° to the
 * right): the near shoulder (the character's right) is broader, on the left.
 * Cloth is shaded as planes round a turned cylinder, lit from the upper
 * left: the near shoulder's top and the near chest take the light, the far
 * side falls into shadow, and folds are drawn as a lit ridge beside a dark
 * crease. Hands are built from a palm and jointed fingers (each a tapered
 * capsule on two segments) laid as one silhouette, with dark lines where
 * fingers touch; what a hand holds is drawn by the pose (88_harmony_cast.js). */
var RB = (globalThis.RB = globalThis.RB || {});

RB.harmonyKit = RB.harmonyKit || {};
(function (HK) {
  'use strict';
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const put = (...a) => HK.put(...a);
  const get = (...a) => HK.get(...a);

  // Fill a polygon (points offset by ox, oy) calling fn(x, y) → step (or < 0 to skip) in local coords.
  function polyFill(L, ox, oy, pts, Mt, fn) {
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const [x, y] of pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
    for (let Y = Math.floor(oy + y0); Y <= Math.ceil(oy + y1); Y++) for (let X = Math.floor(ox + x0); X <= Math.ceil(ox + x1); X++) {
      const x = X + 0.5 - ox, y = Y + 0.5 - oy;
      if (!HK.inPoly(pts, x, y)) continue;
      const k = fn ? fn(x, y) : Mt.base;
      if (k == null || k < 0) continue;
      put(L, X, Y, Mt, k);
    }
  }
  // A 1-px line (local coords from ox, oy) in one step of a material, optionally only over painted pixels.
  function line(L, ox, oy, xa, ya, xb, yb, Mt, k, onlyPainted) {
    let x0 = Math.round(ox + xa - 0.5), y0 = Math.round(oy + ya - 0.5);
    const x1 = Math.round(ox + xb - 0.5), y1 = Math.round(oy + yb - 0.5);
    const dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1, dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (let n = 0; n < 500; n++) {
      if (!onlyPainted || get(L, x0, y0)) put(L, x0, y0, Mt, k);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  }
  HK.polyFill = polyFill; HK.line = line;

  // ---- the torso -------------------------------------------------------------------------------------
  // The silhouette's sides (near side top → bottom, far side bottom → top) with the arm hanging ('down')
  // or lifted away ('up': the torso ends at the armpit and the arm is drawn by itself).
  const SIDES = {
    near: {
     down: [[-7.6, -9], [-14, -5.6], [-22, -2], [-28.6, 1.6], [-32.8, 6.6], [-34.8, 14], [-35.8, 26], [-36.4, 44]],
      up: [[-7.6, -9], [-14, -5.6], [-22, -2], [-27.6, 2.4], [-27.2, 10], [-25.8, 20], [-25.2, 44]],
    },
    far: {
      down: [[27.4, 44], [27.4, 26], [27, 14], [25.4, 6], [21.6, 0.8], [14.6, -3.4], [6.4, -8.4]],
      up: [[21.4, 44], [21.6, 24], [22, 12], [22.2, 4.4], [19.2, 0], [14.2, -3.4], [6.4, -8.4]],
    },
  };
  HK.SIDES = SIDES;
  function torsoPts(arms) {
    return SIDES.near[arms.near === 'up' ? 'up' : 'down'].concat(SIDES.far[arms.far === 'up' ? 'up' : 'down']);
  }
  // Cloth shading round the turned body. Returns a step for (x, y) in anchor space.
  function clothStep(x, y, o) {
    const nx = (x + 4) / 31;
    let k = 3;
    if (nx < -0.42) k = 4;
    if (nx > 0.52) k = 2;
    if (nx > 0.86) k = 1;
    // the tops of the shoulders face the sky
    const sl = y - (Math.abs(x) * 0.42 - 10.4);
    if (sl < 3.4 && x < -6) k = Math.max(k, 4);
    if (sl < 2.2 && x < -12) k = 5;
    if (sl < 3 && x > 8) k = Math.max(k, 3);
    // the near sleeve (arm down): its own cylinder, lit on the outside
    if (o && o.nearDown && x < -24.5 - (y > 12 ? 0.6 : 0) && y > 4) k = x < -31.5 ? 4 : x < -27.5 ? 3 : 2;
    if (o && o.farDown && x > 21.5 && y > 5) k = x > 25 ? 1 : 2;
    return k;
  }
  // The garment's torso. g: { shape, M (cloth), A (accent), Iv (ivory), arms: { near, far } }
  function torso(L, ax, ay, g) {
    const arms = g.arms || {};
    const pts = torsoPts(arms);
    const o = { nearDown: arms.near !== 'up', farDown: arms.far !== 'up' };
    polyFill(L, ax, ay, pts, g.M, (x, y) => clothStep(x, y, o));
    const Mt = g.M;
    // armhole seams and the folds that run from the near armpit toward the chest
    if (o.nearDown) { line(L, ax, ay, -26.4, 3, -25, 17, Mt, 1, true); line(L, ax, ay, -25, 17, -25.4, 44, Mt, 2, true); line(L, ax, ay, -27.4, 4, -26.4, 17, Mt, 4, true); }
    if (o.farDown) { line(L, ax, ay, 21.6, 3, 21, 18, Mt, 1, true); line(L, ax, ay, 21, 18, 21.2, 44, Mt, 1, true); }
    line(L, ax, ay, -22, 22, -15, 32, Mt, 2, true); line(L, ax, ay, -21, 21, -14, 31, Mt, 4, true);
    line(L, ax, ay, -21, 30, -16, 38, Mt, 2, true);
    line(L, ax, ay, 16, 18, 13, 30, Mt, 1, true);
    const sh = g.shape;
    if (sh === 'robe') robe(L, ax, ay, g);
    else if (sh === 'coat') coat(L, ax, ay, g);
    else if (sh === 'apron') apron(L, ax, ay, g);
    else if (sh === 'dress') dress(L, ax, ay, g);
    else if (sh === 'high') highCollar(L, ax, ay, g);
    else tunic(L, ax, ay, g);
  }
  HK.torso = torso; HK.clothStep = clothStep; HK.torsoPts = torsoPts;

  // the skin left open at a neckline (a V or a scoop), with the collarbone's shadow
  function neckOpen(L, ax, ay, pts, sk) {
    polyFill(L, ax, ay, pts, sk, (x, y) => (y < 1.4 ? 2 : x > 3 ? 2 : 3));
  }
  // Tunic: a V neck edged in the accent colour, shoulder seams, a short placket.
  function tunic(L, ax, ay, g) {
    const A = g.A;
    neckOpen(L, ax, ay, [[-7.2, -9], [6.4, -8.4], [1.6, 8]], g.sk);
    polyFill(L, ax, ay, [[-9.6, -9.6], [-7, -9.4], [1.6, 7.8], [2.4, 11]], A, (x, y) => (x < -4 ? 4 : 3));
    polyFill(L, ax, ay, [[6.2, -8.8], [8.8, -8.2], [2.6, 11], [1.4, 8]], A, () => 2);
    line(L, ax, ay, 2.4, 11.2, 2.6, 44, g.M, 1, true);
    line(L, ax, ay, 1.4, 11.6, 1.6, 44, g.M, 4, true);
    for (const y of [16, 24, 32]) { put(L, ax + 3, ay + y, A, 4); put(L, ax + 3, ay + y + 1, A, 1); }
    line(L, ax, ay, -9, -8.6, -26, 0, g.M, 2, true);
  }
  // Robe: crossed panels (the wearer's left over the right), an ivory under-collar, a broad collar band.
  function robe(L, ax, ay, g) {
    const A = g.A, Iv = g.Iv;
    neckOpen(L, ax, ay, [[-7, -9], [5.6, -8.4], [-1.6, 4.4]], g.sk);
    polyFill(L, ax, ay, [[-8.8, -9.4], [-6.6, -9.4], [-1.2, 4.8], [-2.8, 7]], Iv, () => 3);
    polyFill(L, ax, ay, [[5.4, -9], [9.6, -8.2], [-4.4, 16], [-11.6, 44], [-15.6, 44], [-6.4, 14]], A, (x, y) => (x + y * 0.6 < 0 ? 3 : 2));
    line(L, ax, ay, 6.4, -8, -9.6, 20, A, 4);
    line(L, ax, ay, -6.4, 14.4, -15.6, 44, A, 1, true);
  }
  // Coat: lapels faced in the accent, a shirt between them, buttons on the far panel.
  function coat(L, ax, ay, g) {
    const A = g.A, M = g.M;
    polyFill(L, ax, ay, [[-6.6, -9], [5.6, -8.4], [3.6, 14], [-1, 14]], A, (x, y) => (y < 0 ? 1 : 2));
    neckOpen(L, ax, ay, [[-4.6, -9], [4, -8.6], [0, 1.6]], g.sk);
    polyFill(L, ax, ay, [[-9.4, -9.6], [-6, -9.4], [0.4, 12], [-2, 20], [-9, 10]], M, (x, y) => (x < -6 ? 5 : 4));
    line(L, ax, ay, -6, -9.2, 0.4, 12, A, 4);
    polyFill(L, ax, ay, [[5.4, -9], [9.6, -8.2], [12, 4], [6, 16], [3.2, 13]], M, () => 2);
    line(L, ax, ay, 5.6, -8.6, 3.4, 13, M, 1);
    for (const y of [19, 28, 37]) { put(L, ax + 4, ay + y, A, 4); put(L, ax + 5, ay + y, A, 3); put(L, ax + 4, ay + y + 1, A, 1); }
    line(L, ax, ay, 3, 16, 3.4, 44, M, 1, true);
  }
  // Apron: a round-necked shirt, the ivory bib with its straps over the shoulders.
  function apron(L, ax, ay, g) {
    const A = g.A, Iv = g.Iv;
    neckOpen(L, ax, ay, [[-7, -9], [6, -8.6], [3.4, 0], [-3.6, 0.4]], g.sk);
    line(L, ax, ay, -7.6, -8.4, -3.8, 1, A, 3); line(L, ax, ay, -3.8, 1, 3.6, 0.4, A, 3); line(L, ax, ay, 3.6, 0.4, 6.6, -8, A, 2);
    polyFill(L, ax, ay, [[-14, 12], [13, 11], [14.6, 44], [-15.6, 44]], Iv, (x, y) => (x > 9 ? 2 : x < -10 ? 4 : 3));
    line(L, ax, ay, -14, 12, 13, 11, Iv, 4);
    for (const [x0, x1] of [[-14, -22], [12.4, 15]]) polyFill(L, ax, ay, [[x0, 12], [x0 + (x0 < 0 ? 4 : -3.6), 12], [x1 + (x0 < 0 ? 3.6 : -2.6), -2.4], [x1, -3.6]], Iv, () => (x0 < 0 ? 4 : 2));
    line(L, ax, ay, -6, 24, 6, 24, Iv, 2, true);
    put(L, ax - 11, ay + 13, Iv, 1); put(L, ax + 10, ay + 13, Iv, 1);
  }
  // Dress: a scooped neckline trimmed in the accent, soft gathers below it.
  function dress(L, ax, ay, g) {
    const A = g.A;
    const scoop = [];
    for (let i = 0; i <= 12; i++) { const t = i / 12, a = Math.PI * t; scoop.push([-11 + 21 * t, -8.6 + Math.sin(a) * 9.6]); }
    neckOpen(L, ax, ay, scoop.concat([[10, -9.4], [-11, -9.4]]), g.sk);
    for (let i = 0; i < 24; i++) {
      const t = i / 23, a = Math.PI * t;
      const x = -11.6 + 22.2 * t, y = -8.2 + Math.sin(a) * 10.2;
      put(L, Math.round(ax + x), Math.round(ay + y), A, x < 2 ? 4 : 3);
      put(L, Math.round(ax + x), Math.round(ay + y + 1), A, x < 2 ? 2 : 1);
    }
    for (const x of [-6, -1, 5]) { line(L, ax, ay, x, 4 + Math.abs(x) * 0.1, x - 1, 12, g.M, 2, true); line(L, ax, ay, x - 1, 4, x - 2, 11, g.M, 4, true); }
  }
  // High collar: a standing band round the neck, closed at the front, trimmed at its top edge.
  function highCollar(L, ax, ay, g) {
    const A = g.A, M = g.M;
    polyFill(L, ax, ay, [[-9.6, -15], [8.4, -13.6], [9.2, -5], [3, -1.6], [-4, -1.6], [-10.6, -6]], M, (x, y) => (x < -5 ? 4 : x > 5 ? 2 : 3));
    line(L, ax, ay, -9.6, -15, 8.4, -13.8, A, 4); line(L, ax, ay, -9.6, -14, 8.4, -12.8, A, 2);
    line(L, ax, ay, 2.4, -13, 2.8, 44, M, 1, true); line(L, ax, ay, 1.4, -13, 1.8, 44, A, 3, true);
    for (const y of [-9, 1, 11, 21, 31]) { put(L, ax + 4, ay + y, A, 4); put(L, ax + 4, ay + y + 1, A, 1); }
  }
  HK.garments = { tunic, robe, coat, apron, dress, highCollar };

  // ---- arms ---------------------------------------------------------------------------------------
  // A sleeve on two segments (shoulder → elbow → wrist), each a tapered capsule lit on its upper-left
  // flank; a cuff at the wrist. pts in anchor space.
  function arm(L, ax, ay, a, M, cuff) {
    const S = (p, w) => [ax + p[0], ay + p[1], w];
    HK.strand(L, [S(a.sh, a.w0 || 6), S(a.el, a.w1 || 5)], M, { base: 3, tipDark: 0, seam: false });
    HK.strand(L, [S(a.el, a.w1 || 5), S(a.wr, a.w2 || 4)], M, { base: 3, tipDark: 0, seam: false });
    if (cuff) {
      const dx = a.wr[0] - a.el[0], dy = a.wr[1] - a.el[1], l = Math.hypot(dx, dy) || 1;
      const ux = dx / l, uy = dy / l;
      const c0 = [a.wr[0] - ux * 3.2, a.wr[1] - uy * 3.2];
      HK.strand(L, [S(c0, (a.w2 || 4) + 0.6), S(a.wr, (a.w2 || 4) + 0.6)], cuff, { base: 3, tipDark: 0, seam: false });
    }
  }
  HK.arm = arm;

  // ---- hands ---------------------------------------------------------------------------------------
  // A hand: { wrist [x, y], palm: [[x, y], ...] polygon (anchor space), fingers: [{ pts: [[x, y, halfWidth],
  // ...] }, ...] (base → tip), thumb: same, back: true when we see the back of the hand }. Fingers listed
  // far to near: each later one is drawn over the earlier and a dark line marks where they touch.
  function hand(L, ax, ay, h, sk) {
    const T = (p) => [ax + p[0], ay + p[1], p[2]];
    const tmp = RB.pxkit.layer(L.w, L.h);
    const owner = new Int16Array(L.w * L.h).fill(-1);
    const parts = [];
    if (h.thumbBehind && h.thumb) parts.push({ pts: h.thumb, thumb: true });
    parts.push({ palm: h.palm });
    for (const f of h.fingers || []) parts.push(f);
    if (!h.thumbBehind && h.thumb) parts.push({ pts: h.thumb, thumb: true });
    parts.forEach((p, idx) => {
      const before = tmp.px.slice();
      if (p.palm) {
        polyFill(tmp, ax, ay, p.palm, sk, (x, y) => {
          const t = h.palmShade ? h.palmShade(x, y) : 4;
          return t;
        });
      } else {
        HK.strand(tmp, p.pts.map(T), sk, { base: p.base || 4, lit: 1, tipDark: 0, seam: false, shade: p.shade });
      }
      for (let i = 0; i < tmp.px.length; i++) if (tmp.px[i] !== before[i]) {
        // where this part covers another one, keep a dark line along the covered part's side
        owner[i] = idx;
      }
    });
    // contact lines: a pixel whose neighbour (right or below) belongs to an earlier, different part
    for (let Y = 1; Y < L.h - 1; Y++) for (let X = 1; X < L.w - 1; X++) {
      const i = Y * L.w + X, o = owner[i];
      if (o < 0) continue;
      for (const j of [i - 1, i + 1, i - L.w, i + L.w]) {
        const p = owner[j];
        if (p >= 0 && p < o && !parts[o].palm && !(parts[p].palm && !parts[o].thumb && h.flowFromPalm !== false)) { tmp.px[i] = sk.c[1]; tmp.mt[i] = sk.id; break; }
      }
    }
    let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
    for (let i = 0; i < tmp.px.length; i++) if (tmp.px[i]) {
      L.px[i] = tmp.px[i]; L.mt[i] = tmp.mt[i];
      const X = i % L.w, Y = (i / L.w) | 0;
      if (X < x0) x0 = X; if (X > x1) x1 = X; if (Y < y0) y0 = Y; if (Y > y1) y1 = Y;
    }
    // the outline the layer will get adds a pixel all round
    return x1 < 0 ? null : { x: x0 - 1, y: y0 - 1, w: x1 - x0 + 3, h: y1 - y0 + 3 };
  }
  HK.hand = hand;
})(RB.harmonyKit);
