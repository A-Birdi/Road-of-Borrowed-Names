/* Creatures A — the wisp (Reedling, Ember Wisp, Hush Mote, Harbour Fog, Frost Wisp, Stray Name)
 * and the echo (The Mill Echo, Shelved Echo, Road Echo). Spirit / abstract anatomy (§9.2):
 * coherent expansion, separation, distortion and return of recognizable forms — a wisp's head
 * squashes and leads, its tail streams and coils; an echo's rings, shards and core gather,
 * fling and come back — never arbitrary scaling noise.
 *
 * Wisp: native 176 × 200, origin (88, 70) (was 132 × 200 → 132 × 180): room for the tail to
 * stream sideways in a dart and for the heat crown. Pose q: hx, hy head offset; rx, ry head
 * radii; point (0 … 1, the head leads toward the party as a comet); tlen, tw, tamp, tcurl,
 * tlean tail; ph tail phase; glow (aura), core (inner light), eye, look, mouth, crown (flames
 * on its head), droop (a pleading tilt of the eyes).
 * Echo: native 208 × 208, origin (104, 104) (was 184 × 184): shards can gather to one side and
 * fling outward. Pose q: rph ring phase, rint ring strength, rsp ring spacing, shR shard orbit,
 * rot, aim (shards gathered toward the party), out (flung along the aim), pane (assembled into a
 * pane), coreS, mouth, eye, look, warm (ember tint for Heat), dim. */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const A = RB.creaturesA, K = RB.pxkit;
  const mixh = (a, b, k) => K.hex(K.mix(a, b, k));
  const cl = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const AIM = [-0.74, 0.67];
  const TAU = Math.PI * 2;
  const hs = (i, j) => { const x = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return x - Math.floor(x); };

  // =============================================================================================
  // WISP
  // =============================================================================================
  // The wisp (the restyle): a lantern-spirit seen three-quarter — the head an egg of its own light
  // with a flame tuft curling back from its crown (a tapered extremity that sways), the face turned
  // toward the party (the far eye narrow at the left edge, the near eye full), lit from inside (a
  // warm core cluster up left) and by the key light in crisp bands, a cool rim on its right edge,
  // a coloured outline; its tail a flat ribbon lit along one edge that splits into two strands at
  // its end and thins into translucent tones; sparks of its light hang round it.
  const wispMatCache = new Map();
  function wispMats(col) {
    if (wispMatCache.has(col)) return wispMatCache.get(col);
    const o = { n: 6, at: 3, lo: 0.15, hi: 0.95, sat: 1.18, hd: 36, hl: 26 };
    const M = {
      body: A.hmat(col, Object.assign({ rim: mixh(col, '#f4fbff', 0.7) }, o)),
      tail: A.hmat(col, Object.assign({ alpha: 215 }, o)),
      fade: A.hmat(col, Object.assign({ alpha: 135, line: false }, o)),
      hot: K.mat(null, { cols: [mixh(col, '#fff6dc', 0.55), mixh(col, '#fffbee', 0.85)], at: 1, line: false }),
      spark: [K.solid(mixh(col, '#fffbee', 0.7), { line: false }), K.solid(mixh(col, '#ffffff', 0.35), { line: false })],
      eye: K.mat(null, { cols: ['#0c0a18', '#1c1830', '#302a48'], at: 0, line: false }),
      shine: K.solid('#ffffff', { line: false }),
      fire: A.hmat(mixh(col, '#ff9a3a', 0.6), { n: 5, at: 2, lo: 0.3, hi: 0.95, sat: 1.4, hd: 30, hl: 30 }),
      fireHot: K.mat(null, { cols: ['#ffd27a', '#fff3c4'], at: 1, line: false }),
    };
    wispMatCache.set(col, M);
    if (wispMatCache.size > 12) wispMatCache.delete(wispMatCache.keys().next().value);
    return M;
  }
  // a streaming ribbon from (x, y0) down `len`, w0 wide at the top, swaying with phase ph; flat,
  // lit along its left edge; splits into two strands over its last third
  function streamer(Lb, M, x, y0, len, w0, ph, q) {
    const amp = q.tamp, curl = q.tcurl, lean = q.tlean;
    const cx = (y, k) => x + lean * y + Math.sin(ph + y / curl + (k || 0)) * amp * Math.min(1, y / (len * 0.45));
    const hw = (y) => w0 * Math.pow(Math.max(0, 1 - y / len), 0.8) + 1;
    const split = len * 0.66;
    const band = (n) => (n < -0.45 ? 4.5 : n < 0.25 ? 3.5 : n < 0.7 ? 2.5 : 1.5);
    const mat = (y) => (y < len * 0.55 ? M.tail : M.fade);
    for (const Mx of [M.tail, M.fade]) {
      const lx = Math.abs(lean) * len + w0 + amp + 3;
      Lb.fill(x - lx, y0, x + lx, y0 + len + 2, (px, py) => {
        const y = py - y0;
        if (y < 0 || y > len || mat(y) !== Mx) return false;
        if (y < split) return Math.abs(px - cx(y)) <= hw(y);
        // two strands: the near one longer, the far one turning away
        const t = (y - split) / (len - split), sw = hw(y) * 0.55;
        const a = cx(y) - hw(split) * 0.45 * t * 1.6, b = cx(y, 0.6) + hw(split) * 0.5 * t * 1.8;
        return (Math.abs(px - a) <= sw && t < 1) || (Math.abs(px - b) <= sw * 0.9 && t < 0.82);
      }, Mx, (px, py) => { const y = py - y0, n = (px - cx(y)) / hw(y); return band(n) / 6; });
    }
  }
  function wispRig(L, q, o, H) {
    const col = o.col || '#9fb8e8';
    const M = wispMats(col);
    const aura = L.like(), tail = L.like(), body = L.like();
    const hx = q.hx, hy = q.hy, rx = q.rx, ry = q.ry;
    // its light: a faint two-step glow and sparks hanging in it
    H.glow(aura, hx, hy + 4, 40 * q.glow, 38 * q.glow, col, Math.min(0.32, 0.2 * q.glow), 2);
    for (let k = 0; k < 6; k++) {
      const a = k * 1.05 + q.ph * 0.5, r = (34 + (k % 3) * 7) * Math.min(1.3, q.glow);
      aura.rect(Math.round(hx + Math.cos(a) * r), Math.round(hy + 2 + Math.sin(a) * r * 0.9), k % 2 ? 1 : 2, k % 2 ? 2 : 1, M.spark[k % 2], 0);
    }
    streamer(tail, M, hx + q.tlean * 4, hy + 12, q.tlen, q.tw, q.ph, q);
    // the head: an egg of light (drawn out along its flight when it darts), and a flame tuft from
    // its crown curling back up-right
    const p = q.point, ax = AIM[0], ay = AIM[1];
    const fr = Math.max(rx, ry) * (1 + 0.12 * p), br = Math.max(rx, ry) * (1 + 0.55 * p), side = Math.min(rx, ry) * (1 - 0.1 * p);
    const shade = A.ball(hx - 3 + ax * 3 * p, hy - 3 + ay * 3 * p, rx + 3, ry + 3, { lift: -0.06, refl: 0.14 });
    body.fill(hx - rx - 30, hy - ry - 30, hx + rx + 30, hy + ry + 30, (x, y) => {
      if (p <= 0) { const a = (x - hx) / rx, b = (y - hy) / ry; return a * a + b * b <= 1; }
      const u = (x - hx) * ax + (y - hy) * ay, v = -(x - hx) * ay + (y - hy) * ax;
      const a = u / (u >= 0 ? fr : br), b = v / side;
      return a * a + b * b <= 1;
    }, M.body, shade);
    const sway = Math.sin(q.ph) * 3, tl = (1 - p * 0.6);
    const tx = hx + 12 + sway + 6 * (1 - tl), ty = hy - ry - 13 * tl;
    body.poly([[hx - 4, hy - ry + 6], [hx + 6, hy - ry - 4 * tl], [tx, ty], [hx + rx * 0.7 + sway * 0.3, hy - ry * 0.45]], M.body, (x, y) => (y < hy - ry + 1 ? (x < hx + 8 ? 4.5 : 3.5) : 3.5) / 6);
    body.poly([[hx + 4, hy - ry - 1], [tx - 1, ty + 2], [hx + rx * 0.55, hy - ry * 0.55]], M.body, 4);
    if (q.crown > 0) {
      // the Ember Wisp's flare: flame tongues standing up from the head
      for (let i = 0; i < 5; i++) {
        const x = hx - 18 + i * 9, h = (10 + ((i * 7) % 5) * 3 + (i === 2 ? 6 : 0)) * q.crown, sw = Math.sin(q.ph + i * 1.3) * 3 * q.crown;
        body.poly([[x - 6, hy - ry + 7], [x + sw, hy - ry - h], [x + 6, hy - ry + 7]], M.fire, (xx) => (xx < x + sw * 0.5 ? 3.5 : 2.5) / 5);
        body.poly([[x - 3, hy - ry + 7], [x + sw * 1.2, hy - ry - h * 0.6], [x + 3, hy - ry + 7]], M.fireHot, 1);
      }
    }
    A.despeckle(body);
    // inner light: a warm core cluster up-left of centre, its hottest point inside it
    body.onto((b) => {
      const k = 0.8 + 0.3 * q.core;
      b.ell(hx - 9, hy - 9, 8 * k, 6 * k, M.body, 4);
      b.ell(hx - 10, hy - 10, 5 * k, 3.6 * k, M.body, 5);
      b.ell(hx - 11, hy - 11, 2.5 + q.core * 1.5, 1.8 + q.core, M.hot, 1);
      b.rect(Math.round(hx - 13), Math.round(hy - 13), 2, 1, M.shine, 0);
    });
    A.rim(body, [M.body.id]);
    // the three-quarter face: the far eye narrow at the left, the near eye full; a mouth to breathe
    const lx = q.look > 0.5 ? -2 : 0, ly = q.look > 0.5 ? 1 : 0;
    const EY = [[-12, 2.8], [2, 3.8]];
    if (q.eye < 0.25) for (const [ex, er] of EY) { body.line(hx + ex - er, hy + 3, hx + ex + er, hy + 3, M.eye, 1); body.dot(hx + ex + er, hy + 2, M.eye, 1); }
    else for (const [ex, er] of EY) {
      const ery = 6 * Math.max(0.35, q.eye), x = hx + ex + lx, y = hy + 2 + ly;
      body.ell(x, y, er, ery, M.eye, (px, py) => (py > y + ery * 0.3 ? 1.5 : 0.5) / 3);
      if (er > 3) body.rect(Math.round(x - er * 0.5), Math.round(y - ery * 0.6), 2, 2, M.shine, 0);
      else body.dot(x - 1, y - ery * 0.5, M.shine, 0);
      if (q.droop > 0) body.line(x - er - 1, y - ery - 1 + (ex < 0 ? 2 : 0) * q.droop, x + er + 1, y - ery - 1 + (ex < 0 ? 0 : 2) * q.droop, M.body, 1);
    }
    if (q.mouth > 0) body.ell(hx - 5 + lx, hy + 13 + ly, 2 + q.mouth * 3, 1.5 + q.mouth * 3, M.eye, 0);
    A.cast(tail, body, 2, 3, 1);
    A.outline(tail); A.outline(body);
    return tail.over(body).under(aura);
  }
  const wBase = { hx: 0, hy: 0, rx: 30, ry: 29, point: 0, tlen: 70, tw: 25, tamp: 11, tcurl: 11, tlean: 0, ph: 0, glow: 1, core: 0.5, eye: 1, look: 0, mouth: 0, crown: 0, droop: 0 };
  const PH = (f, n) => (f / n) * Math.PI * 2;
  const wIdle = [0, 1, 2, 3, 4, 5, 6, 7].map((f) => ({ ph: PH(f, 8), rx: 30 + [0, 0.5, 1, 0.5, 0, -0.5, -1, -0.5][f], ry: 29 - [0, 0.5, 1, 0.5, 0, -0.5, -1, -0.5][f], core: 0.4 + 0.25 * Math.sin(PH(f, 8)), glow: 1 + 0.06 * Math.sin(PH(f, 8) + 1), tlean: 0.04 * Math.sin(PH(f, 8)) }));
  const wTable = {
    'prep.strike': [
      { rx: 32, ry: 27, tamp: 14, tcurl: 9, tlean: -0.15, glow: 1.15, core: 0.8, look: 1, hx: 2, hy: -1, ph: 1 },
      { rx: 34, ry: 25, tamp: 16, tcurl: 8, tlean: -0.25, glow: 1.25, core: 1, look: 1, hx: 4, hy: -2, eye: 0.8, ph: 2 },
      { rx: 35, ry: 24, tamp: 17, tcurl: 8, tlean: -0.3, glow: 1.3, core: 1, look: 1, hx: 5, hy: -3, eye: 0.7, ph: 2.6 },
    ],
    'exec.strike': [
      { rx: 27, ry: 30, point: 0.5, tlen: 78, tamp: 6, tlean: 0.5, glow: 1.3, core: 1, look: 1, eye: 0.7, ph: 3.4 },
      { rx: 25, ry: 31, point: 1, tlen: 84, tamp: 4, tlean: 0.75, glow: 1.35, core: 1, look: 1, eye: 0.7, ph: 4.2 },
      { rx: 26, ry: 30, point: 0.8, tlen: 82, tamp: 5, tlean: 0.7, glow: 1.4, core: 1, look: 1, eye: 0.6, ph: 5 },
    ],
    'exec.impact': [
      { rx: 35, ry: 24, tlen: 72, tamp: 10, tlean: 0.55, glow: 1.6, core: 1, look: 1, eye: 0.5, hx: -2, hy: 2, ph: 5.6 },
      { rx: 29, ry: 30, tlen: 70, tamp: 12, tlean: 0.3, glow: 1.3, core: 0.8, look: 1, eye: 0.8, ph: 6.2 },
    ],
    'exec.push': [
      { rx: 36, ry: 23, tamp: 12, tlean: 0.4, glow: 1.4, eye: 0.4, look: 1, hx: 3, ph: 5.4 },
      { rx: 26, ry: 30, point: 0.6, tlen: 80, tamp: 6, tlean: 0.6, glow: 1.4, eye: 0.6, look: 1, ph: 6 },
    ],
    'exec.miss': [{ rx: 24, ry: 32, point: 0.9, tlen: 88, tamp: 3, tlean: 0.9, glow: 1.1, eye: 0.6, hx: -4, hy: 3, ph: 5.2 }],
    'recover.strike': [
      { rx: 28, ry: 31, tamp: 15, tlean: -0.35, glow: 1.2, core: 0.8, ph: 0.4 },
      { rx: 31, ry: 28, tamp: 13, tlean: -0.2, glow: 1.1, core: 0.6, ph: 1.2 },
      { rx: 30, ry: 29, tamp: 11, tlean: -0.05, glow: 1, core: 0.5, ph: 2 },
    ],
    'recover.hover': [{ rx: 30.5, ry: 28.5, tamp: 11, ph: 2.6 }],
    'recover.deflect': [
      { rx: 37, ry: 22, tamp: 16, tlean: -0.5, glow: 1.5, eye: 0.3, hx: 5, hy: -3, ph: 0.2 },
      { rx: 27, ry: 31, tamp: 14, tlean: -0.3, glow: 1.2, eye: 0.7, hx: 2, ph: 1 },
      { rx: 30, ry: 29, tamp: 12, tlean: -0.1, glow: 1, ph: 1.8 },
    ],
    // Sweep (the Reedling): it rises, coils, and whirls round over both of you, tail flung wide
    'prep.sweep': [
      { rx: 31, ry: 28, tamp: 15, tcurl: 8, tlean: -0.4, hy: -3, glow: 1.15, look: 1, ph: 1 },
      { rx: 32, ry: 27, tamp: 18, tcurl: 7, tlean: -0.55, hy: -5, glow: 1.25, look: 1, ph: 2 },
    ],
    'exec.sweep': [
      { rx: 34, ry: 26, tamp: 14, tlean: 0.85, tlen: 80, glow: 1.3, look: 1, ph: 3 },
      { rx: 32, ry: 27, tamp: 16, tlean: 0.5, tlen: 84, glow: 1.35, look: 1, ph: 4 },
      { rx: 30, ry: 29, tamp: 18, tlean: -0.2, tlen: 84, glow: 1.35, look: 1, ph: 5 },
      { rx: 29, ry: 30, tamp: 16, tlean: -0.6, tlen: 80, glow: 1.25, look: 1, ph: 6 },
    ],
    'recover.sweep': [
      { rx: 31, ry: 28, tamp: 14, tlean: -0.4, glow: 1.15, ph: 0.6 },
      { rx: 30, ry: 29, tamp: 12, tlean: -0.1, glow: 1.05, ph: 1.6 },
    ],
    // Heat (the Ember Wisp): it draws in, then flares — a crown of flame, the aura swelling
    'prep.heat': [
      { rx: 28, ry: 28, glow: 0.9, core: 0.9, crown: 0.2, tamp: 8, eye: 0.8, ph: 1 },
      { rx: 27, ry: 27, glow: 0.85, core: 1, crown: 0.35, tamp: 6, eye: 0.6, ph: 1.6 },
    ],
    'cast.heat': [
      { rx: 32, ry: 31, glow: 1.5, core: 1, crown: 0.8, tamp: 12, mouth: 0.4, look: 1, ph: 2.4 },
      { rx: 33, ry: 32, glow: 1.75, core: 1, crown: 1, tamp: 13, mouth: 0.6, look: 1, ph: 3.2 },
      { rx: 32, ry: 32, glow: 1.7, core: 1, crown: 0.9, tamp: 12, mouth: 0.5, look: 1, ph: 4 },
      { rx: 33, ry: 31, glow: 1.6, core: 0.9, crown: 1, tamp: 12, mouth: 0.4, look: 1, ph: 4.8 },
    ],
    'recover.heat': [
      { rx: 31, ry: 30, glow: 1.3, core: 0.8, crown: 0.5, tamp: 11, ph: 5.6 },
      { rx: 30, ry: 29, glow: 1.1, core: 0.6, crown: 0.15, tamp: 11, ph: 0.2 },
    ],
    // Shroud (the Hush Mote, the Harbour Fog): it breathes in, swelling, then breathes its fog out
    'prep.shroud': [
      { rx: 32, ry: 31, glow: 1.05, eye: 0.6, tamp: 9, tcurl: 9, ph: 1 },
      { rx: 34, ry: 33, glow: 1.1, eye: 0.2, tamp: 8, tcurl: 8, tlean: -0.2, ph: 1.6 },
    ],
    'cast.shroud': [
      { rx: 33, ry: 32, mouth: 1, eye: 0.5, glow: 1.1, tamp: 12, ph: 2.4 },
      { rx: 31, ry: 31, mouth: 1, eye: 0.5, glow: 1, tamp: 14, tlean: 0.2, ph: 3.2 },
      { rx: 29, ry: 30, mouth: 0.8, eye: 0.6, glow: 0.95, tamp: 15, tlean: 0.1, ph: 4 },
      { rx: 28, ry: 29, mouth: 0.6, eye: 0.7, glow: 0.9, tamp: 14, tlean: -0.1, ph: 4.8 },
      { rx: 29, ry: 29, mouth: 0.3, eye: 0.8, glow: 0.9, tamp: 12, ph: 5.6 },
    ],
    'recover.shroud': [
      { rx: 29.5, ry: 29, eye: 0.9, glow: 0.95, tamp: 11, ph: 0.2 },
      { rx: 30, ry: 29, glow: 1, tamp: 11, ph: 1 },
    ],
    // Chill (the Frost Wisp): it breathes in, then breathes cold at the one it aims at
    'prep.chill': [
      { rx: 32, ry: 31, glow: 1.05, eye: 0.6, hx: 2, look: 1, ph: 1 },
      { rx: 34, ry: 32, glow: 1.1, eye: 0.4, hx: 3, look: 1, ph: 1.6 },
    ],
    'exec.chill': [
      { rx: 29, ry: 30, point: 0.3, mouth: 1, eye: 0.6, look: 1, tlean: 0.4, glow: 1.2, ph: 2.4 },
      { rx: 28, ry: 30, point: 0.35, mouth: 1, eye: 0.6, look: 1, tlean: 0.5, glow: 1.25, ph: 3.2 },
      { rx: 29, ry: 29, point: 0.2, mouth: 0.6, eye: 0.7, look: 1, tlean: 0.3, glow: 1.1, ph: 4 },
    ],
    'recover.chill': [
      { rx: 30, ry: 29, tlean: 0.1, glow: 1.05, ph: 4.8 },
      { rx: 30, ry: 29, ph: 5.6 },
    ],
    // Re-tying (the Frost Wisp): its head bows and the tail-tip curls down to the loose knot
    'cast.mend': [
      { hy: 3, eye: 0.5, tlean: -0.4, tlen: 82, tamp: 8, tcurl: 9, glow: 0.95, ph: 1 },
      { hy: 4, eye: 0.3, tlean: -0.55, tlen: 88, tamp: 6, tcurl: 8, glow: 1, core: 0.8, ph: 2 },
      { hy: 4, eye: 0.3, tlean: -0.6, tlen: 90, tamp: 7, tcurl: 7, glow: 1.05, core: 1, ph: 3 },
      { hy: 3, eye: 0.5, tlean: -0.45, tlen: 84, tamp: 9, tcurl: 9, glow: 1, ph: 4 },
    ],
    // Plea (the Stray Name): it dims and drifts nearer, eyes pleading
    'prep.plea': [
      { glow: 0.8, core: 0.3, droop: 1, eye: 0.8, hy: 1, tamp: 8, ph: 1 },
      { glow: 0.7, core: 0.25, droop: 1.5, eye: 0.8, hy: 2, tamp: 7, ph: 1.6 },
    ],
    'cast.plea': [
      { glow: 0.75, core: 0.35, droop: 1.5, eye: 0.9, look: 1, hy: 2, tamp: 9, tlean: 0.2, ph: 2.4 },
      { glow: 0.8, core: 0.45, droop: 1.5, eye: 0.9, look: 1, hy: 1, tamp: 10, tlean: 0.3, ph: 3.2 },
      { glow: 0.78, core: 0.4, droop: 1.5, eye: 0.85, look: 1, hy: 2, tamp: 9, tlean: 0.25, ph: 4 },
      { glow: 0.8, core: 0.5, droop: 1, eye: 0.9, look: 1, hy: 1, tamp: 10, tlean: 0.2, ph: 4.8 },
    ],
    'recover.plea': [
      { glow: 0.9, core: 0.45, droop: 0.5, tamp: 10, ph: 5.6 },
      { glow: 1, core: 0.5, tamp: 11, ph: 0.2 },
    ],
    rest: [
      { glow: 0.85, core: 0.35, eye: 0.5, hy: 3, tamp: 8, tlean: -0.2, ph: 0.6 },
      { glow: 0.75, core: 0.3, eye: 0.25, hy: 5, tamp: 6, tlean: -0.35, tcurl: 8, ph: 1.2 },
      { glow: 0.75, core: 0.35, eye: 0.2, hy: 6, tamp: 6, tlean: -0.4, tcurl: 8, ph: 1.8 },
      { glow: 0.85, core: 0.4, eye: 0.5, hy: 4, tamp: 8, tlean: -0.2, ph: 2.4 },
    ],
    recoil: [
      { rx: 26, ry: 32, hx: 4, hy: -2, tamp: 16, tlean: -0.6, glow: 1.4, eye: 0.35, ph: 3 },
      { rx: 29, ry: 30, hx: 2, tamp: 13, tlean: -0.3, glow: 1.15, eye: 0.7, ph: 3.8 },
    ],
    // a knot loosens: the light flickers bright and a thread of it lifts free
    release: [
      { glow: 1.5, core: 1, eye: 1.1, rx: 31, ry: 30, ph: 1 },
      { glow: 0.85, core: 0.3, eye: 0.6, rx: 29.5, ry: 29, tamp: 13, ph: 1.8 },
      { glow: 1.2, core: 0.7, eye: 0.9, ph: 2.6 },
    ],
    // interrupted: it sputters — the light gutters, the head shrinks, the tail droops
    balk: [
      { glow: 0.6, core: 0.15, rx: 27, ry: 26, tamp: 4, tlean: -0.2, eye: 0.5, ph: 0.4 },
      { glow: 0.75, core: 0.3, rx: 28, ry: 27, tamp: 6, eye: 0.6, ph: 1 },
      { glow: 0.95, core: 0.45, rx: 29.5, ry: 28.5, tamp: 9, eye: 0.85, ph: 1.6 },
    ],
    settle: [
      { glow: 1.2, core: 0.7, eye: 0.6, tamp: 9, ph: 1 },
      { glow: 1.1, core: 0.6, eye: 0.3, tamp: 8, tlean: -0.15, ph: 2 },
      { glow: 1.05, core: 0.6, eye: 0, tamp: 7, tlean: -0.2, ph: 3 },
    ],
  };
  A.family('wisp', {
    spec: { w: 176, h: 200, ox: 88, oy: 70, ms: 140, bob: (t) => Math.sin(t / 420) * 5 },
    base: wBase, idle: wIdle, poseTable: wTable, rig: wispRig, recoil: { push: 7 },
    alias: { 'prep.mend': 'prep.plea', 'recover.mend': 'recover.plea' },
    veil: (o) => ({ kind: 'fog', cols: [mixh(o.col || '#9fb8e8', '#ffffff', 0.55), mixh(o.col || '#9fb8e8', '#ffffff', 0.3), mixh(o.col || '#9fb8e8', '#8a94a8', 0.3)] }),
  });

  // ---- wisp deliveries ----------------------------------------------------------------------------
  // Strike: it draws in, darts at its target as a comet (the head leading, the tail streaming), bumps
  // and rebounds, then drifts back — ~1,060 ms, contact 520
  A.deliver('wisp', 'strike', (a) => {
    const c = A.kit(a), oc = A.outcome(a), to = a.aimed;
    if (c.rd) { c.F(0, 'prep', 260, 'strike@2').F(260, 'exec', 260, 'strike@1').F(520, 'recover', 480, oc === 'ward' || oc === 'block' ? 'deflect@0' : 'strike@0'); return c.done(520, 1000); }
    const peak = oc === 'ward' || oc === 'block' ? 0.5 : 0.58;
    c.F(0, 'prep', 240, 'strike');
    c.F(240, 'exec', 280, 'strike', { to, peak, arc: 12, shape: 'out' });
    c.X(250, 'wispTrail', 300, { to });
    if (oc === 'ward' || oc === 'block') { c.F(520, 'recover', 420, 'deflect', { to, peak, shape: 'back' }); c.F(940, 'recover', 120, 'hover'); return c.done(520, 1060); }
    c.F(520, 'exec', 100, oc === 'soft' ? 'push' : oc === 'miss' ? 'miss' : 'impact', { to, peak, shape: 'hold' });
    c.F(620, 'recover', 360, 'strike', { to, peak, arc: -6, shape: 'back' });
    c.F(980, 'recover', 80, 'hover');
    return c.done(520, 1060);
  });
  // Sweep (the Reedling): coils, then whirls over both of you; first contact at 580, the next 120 later
  A.deliver('wisp', 'sweep', (a) => {
    const c = A.kit(a), who = a.comp ? ['pc', 'comp'] : ['pc'];
    if (c.rd) { c.F(0, 'prep', 280, 'sweep@1').F(280, 'exec', 480, 'sweep@1').F(760, 'recover', 400, 'sweep@1'); c.X(300, 'arc', 560, { who, col: a.ctx.foeCol }); return c.done(580, 1200); }
    c.F(0, 'prep', 280, 'sweep');
    c.F(280, 'exec', 360, 'sweep', { to: 'party', peak: 0.42, arc: 22, shape: 'out' });
    c.X(300, 'arc', 560, { who, col: a.ctx.foeCol });
    c.X(300, 'wispTrail', 460, { to: 'party' });
    c.F(640, 'exec', 120, 'sweep@3', { to: 'party', peak: 0.42, shape: 'hold' });
    c.F(760, 'recover', 380, 'sweep', { to: 'party', peak: 0.42, shape: 'back' });
    c.F(1140, 'recover', 60, 'hover');
    return c.done(580, 1200);
  });
  // Heat (the Ember Wisp): draws in, flares a crown of flame; Heat applies at 640 (embers shown then)
  A.deliver('wisp', 'heat', (a) => {
    const c = A.kit(a);
    if (c.rd) { c.F(0, 'prep', 260, 'heat@1').F(260, 'cast', 640, 'heat@1').F(900, 'recover', 200, 'heat@1'); return c.done(640, 1100); }
    c.F(0, 'prep', 260, 'heat').F(260, 'cast', 640, 'heat').F(900, 'recover', 200, 'heat');
    c.X(280, 'gather', 380, {});
    return c.done(640, 1100);
  });
  // Shroud (the Hush Mote, the Harbour Fog): breathes in, then breathes its fog out; applies at 760
  A.deliver('wisp', 'shroud', (a) => {
    const c = A.kit(a);
    if (c.rd) { c.F(0, 'prep', 300, 'shroud@1').F(300, 'cast', 600, 'shroud@0').F(900, 'recover', 450, 'shroud@1'); c.X(340, 'veilRelease', 700, {}).X(700, 'mistRoll', 560, {}); return c.done(760, 1350); }
    c.F(0, 'prep', 300, 'shroud').F(300, 'cast', 600, 'shroud').F(900, 'recover', 450, 'shroud');
    c.X(340, 'veilRelease', 760, {});
    c.X(700, 'mistRoll', 560, {});
    return c.done(760, 1350);
  });
  // Chill (the Frost Wisp): breathes cold at one target; contact 580
  A.deliver('wisp', 'chill', (a) => {
    const c = A.kit(a), to = a.aimed;
    if (c.rd) { c.F(0, 'prep', 260, 'chill@1').F(260, 'exec', 340, 'chill@1').F(600, 'recover', 440, 'chill@1'); c.X(280, 'frostDust', 320, { to }); return c.done(580, 1050); }
    c.F(0, 'prep', 260, 'chill');
    c.F(260, 'exec', 340, 'chill', { to, peak: 0.1, shape: 'out' });
    c.X(280, 'frostDust', 320, { to, seal: A.outcome(a) === 'ward' || A.outcome(a) === 'block' });
    c.F(600, 'recover', 400, 'chill', { to, peak: 0.1, shape: 'back' });
    return c.done(580, 1050);
  });
  // Re-tying (the Frost Wisp): its tail-tip curls down and draws the knot tight; applies at 760
  A.deliver('wisp', 'mend', (a) => {
    const c = A.kit(a), fv = a.fv || {}, i = Math.min((fv.maxKnots || 1) - 1, fv.knots || 0);
    if (c.rd) { c.F(0, 'cast', 900, 'mend@2').F(900, 'recover', 300, 'plea@1'); c.X(220, 'mendThread', 600, { i }); return c.done(760, 1200); }
    c.F(0, 'prep', 220, 'plea').F(220, 'cast', 680, 'mend').F(900, 'recover', 300, 'plea');
    c.X(220, 'mendThread', 620, { i });
    return c.done(760, 1200);
  });
  // Plea (the Stray Name): dims and drifts nearer; an unanswered note reaches you at 640
  A.deliver('wisp', 'plea', (a) => {
    const c = A.kit(a);
    if (c.rd) { c.F(0, 'prep', 260, 'plea@1').F(260, 'cast', 640, 'plea@1').F(900, 'recover', 300, 'plea@0'); c.X(300, 'note', 760, { from: 'foe', to: 'party', fade: true }); return c.done(640, 1250); }
    c.F(0, 'prep', 260, 'plea');
    c.F(260, 'cast', 640, 'plea', { to: 'party', peak: 0.14, arc: 4, shape: 'out' });
    c.X(300, 'note', 760, { from: 'foe', to: 'party', fade: true });
    c.F(900, 'recover', 350, 'plea', { to: 'party', peak: 0.14, shape: 'back' });
    return c.done(640, 1250);
  });
  A.auditFamily('wisp', {
    anatomy: 'spirit / hovering', frame: [176, 200], anchor: [88, 70], was: [132, 180],
    idle: '8 drawings × 140 ms (tail wave, a breathing squash, inner light pulse) + the float bob',
    materials: 'glowing body with a lit inner core, translucent tapering tail, stepped aura; flame crown (Heat)',
    moves: { strike: 'draw in, comet dart (head leads, tail streams), bump, rebound', sweep: 'coil, whirl over both', heat: 'flare: crown of flame', shroud: 'inhale, breathe fog', chill: 'breath of frost at one', mend: 'tail-tip draws the knot', plea: 'dims, drifts nearer, a note' },
    reactions: 'recoil (squashed back, tail flung), release (flicker, light lifts), balk (gutters), settle (eyes closed, soft glow)',
    overlays: 'Shroud veil as fog in its own colour; Heat pips; Gathering motes',
  });

  // =============================================================================================
  // ECHO
  // =============================================================================================
  // The echo (the restyle): a swirl of lost voices — a dark glass core with a three-quarter face,
  // its rings of sound spreading on a tilted plane seen at a three-quarter angle (the far half
  // behind the core, the near half in front, broken into arcs that taper at their gaps), mirror
  // shards orbiting on that plane (rendered like the reference's metal: hard facets, a white
  // specular edge, a dark reflected band, navy outline; the far ones smaller and a step darker),
  // and two ribbons of voice and mill dust wrapped round it — one behind, rising to the upper
  // right, one in front, trailing toward the party — that taper into ragged motes.
  const TILT = -0.24, RY = 0.58, PY = 14;
  const plane = (u, v) => { const y = v * RY; return [u * Math.cos(TILT) - y * Math.sin(TILT), u * Math.sin(TILT) + y * Math.cos(TILT) + PY]; };
  const unplane = (x, y) => { const X = x, Y = y - PY; const u = X * Math.cos(TILT) + Y * Math.sin(TILT), w = -X * Math.sin(TILT) + Y * Math.cos(TILT); return [u, w / RY]; };
  const echoMatCache = new Map();
  function echoMats(o, warm) {
    const col0 = o.col || '#a8c8d8', wk = Math.round(cl(warm) * 4) / 4, key = col0 + '|' + wk;
    if (echoMatCache.has(key)) return echoMatCache.get(key);
    const col = wk > 0 ? mixh(col0, '#f0a060', 0.55 * wk) : col0;
    const ringO = { n: 6, at: 3, lo: 0.16, hi: 0.97, sat: 1.35, hd: 30, hl: 20 };
    const M = {
      ring: [255, 200, 140].map((a) => A.hmat(col, Object.assign({ alpha: a }, ringO))),
      shard: A.hmat(mixh(col, '#d8e4ee', 0.25), { n: 6, at: 3, lo: 0.12, hi: 0.98, sat: 0.95, hd: 40, hl: 26 }),
      shardF: A.hmat(mixh(col, '#5a6a80', 0.3), { n: 6, at: 3, lo: 0.1, hi: 0.86, sat: 0.95, hd: 40, hl: 26 }),
      swirl: A.hmat(mixh(col, '#f2ead8', 0.45), { n: 6, at: 4, lo: 0.2, hi: 0.98, sat: 1.05, hd: 55, hl: 14, rim: mixh(col, '#e8fbff', 0.6) }),
      core: A.hmat(wk > 0 ? mixh('#1c2a34', '#4a1e10', wk) : mixh('#1c2a34', col0, 0.12), { n: 6, at: 1, lo: 0.05, hi: 0.62, sat: 1.4, hd: 20, hl: 40, rim: mixh(col, '#e8fbff', 0.45) }),
      eye: A.hmat(mixh(col, '#ffffff', 0.5), { n: 4, at: 2, lo: 0.5, hi: 0.99, line: false }),
      hollow: K.mat(null, { cols: ['#04070a', '#0b131b', '#14202c'], at: 0, line: false }),
      shine: K.solid('#ffffff', { line: false }),
      mote: [K.solid(mixh(col, '#fff8ec', 0.65), { line: false }), K.solid(mixh(col, '#f2ead8', 0.35), { line: false })],
    };
    echoMatCache.set(key, M);
    if (echoMatCache.size > 16) echoMatCache.delete(echoMatCache.keys().next().value);
    return M;
  }
  // one glass shard: two facets split along its length (the one facing the key light lit), a white
  // specular edge on the lit facet, a dark reflected band along the shadowed edge
  const SHARDS = [[[-8, -2], [6, -5], [16, -1], [7, 4], [-7, 3]], [[-6, -4], [11, -2], [4, 6], [-5, 3]]];
  function shard(Ls, M, cx, cy, ang, sc, kind) {
    const pts = SHARDS[kind % 2].map(([x, y]) => [x * sc, y * sc]);
    // world-space facing of the two facets (local normals (0, −1) and (0, 1) turned by ang)
    const nUx = Math.sin(ang), nUy = -Math.cos(ang);
    const fU = -(nUx * 0.6 + nUy * 0.8), fD = -fU;
    const tone = (f) => (f > 0.35 ? 4 : f > -0.2 ? 3 : 2);
    Ls.save().translate(cx, cy).rotate(ang);
    Ls.poly(pts, M, (x, y) => ((y < 0.3 ? tone(fU) : tone(fD)) + 0.5) / M.n);
    // the specular edge along the lit facet's outer edge, the reflected band along the other
    const lit = fU > fD ? -1 : 1;
    Ls.line(pts[0][0] + 1, pts[0][1] * 0.6 + lit * 0.4, pts[2][0] - 2, pts[2][1] * 0.6 + lit * 0.4, M, lit < 0 ? 5 : 1);
    Ls.line(-3 * sc, lit * -2 * sc, 5 * sc, lit * -2.5 * sc, M, lit < 0 ? 1 : 5);
    Ls.restore();
  }
  // a ribbon of voice and dust along a spiral round the core (angles in screen space, y-down),
  // tapering to a ragged end of motes
  function ribbon(Lr, M, th0, dth, r0, r1, w0, rise, sq, seed) {
    const pts = [], N = 12;
    for (let i = 0; i <= N; i++) {
      const t = i / N, th = th0 + dth * t, r = r0 + (r1 - r0) * t;
      pts.push([Math.cos(th) * r, Math.sin(th) * r * sq - rise * t, Math.max(1.2, w0 * Math.pow(1 - t, 0.9) + 1)]);
    }
    const body = pts.slice(0, N - 1);
    // a flat ribbon: lit along the edge facing the key light, a core shadow along the other
    for (let i = 1; i < body.length; i++) {
      const [xa, ya] = body[i - 1], [xb, yb, w] = body[i];
      const dx = xb - xa, dy = yb - ya, len = Math.hypot(dx, dy) || 1;
      let nx = -dy / len, ny = dx / len;
      if (-(nx * 0.6 + ny * 0.8) < 0) { nx = -nx; ny = -ny; }
      Lr.seg(xa, ya, xb, yb, w, M, (x, y) => { const d = ((x - xa) * nx + (y - ya) * ny) / (w / 2); return d > 0.45 ? 5.5 / 6 : d > -0.2 ? 4.5 / 6 : d > -0.65 ? 3.5 / 6 : 2.5 / 6; });
    }
    // the ragged end: the last stretch breaks into motes
    for (let k = 0; k < 4; k++) {
      const t = (N - 1.6 + k * 0.7) / N, th = th0 + dth * t, r = r0 + (r1 - r0) * t + (hs(seed, k) - 0.5) * 6;
      const x = Math.cos(th) * r + k * 1.5, y = Math.sin(th) * r * sq - rise * t + (hs(k, seed) - 0.5) * 5;
      const sz = 2.4 - k * 0.45;
      if (sz > 0.9) Lr.ell(x, y, sz, sz * 0.8, M, k % 2 ? 4 : 5);
    }
  }
  function echoRig(L, q, o, H) {
    const M = echoMats(o, q.warm);
    const back = L.like(), swA = L.like(), core = L.like(), swB = L.like(), front = L.like();
    const cs = q.coreS;
    // rings of sound on the tilted plane, spreading out (spacing, phase, strength); broken into
    // three arcs each whose gaps turn with the phase; the far half behind the core
    const ra = cl(q.rint);
    for (let i = 0; i < 3; i++) {
      const r = (30 + ((i * 18 + q.rph * 54) % 54)) * q.rsp * cs;
      const Mr = M.ring[r < 46 ? 0 : r < 66 ? 1 : 2];
      if (ra < 0.35 && r > 60) continue;
      const th = (r < 46 ? 3.6 : r < 66 ? 2.8 : 2.1) * (0.6 + 0.4 * ra);
      const g0 = i * 2.1 + q.rph * 2.4;
      const inside = (x, y) => {
        const [u, v] = unplane(x, y), d = Math.hypot(u, v);
        if (Math.abs(d - r) > th) return false;
        const a = Math.atan2(v, u), gp = ((a - g0) % (TAU / 2) + TAU) % (TAU / 2);
        const gap = Math.min(gp, TAU / 2 - gp);
        return gap > 0.16 && Math.abs(d - r) <= th * Math.min(1, (gap - 0.16) / 0.35 + 0.3);
      };
      const tone = (x, y) => {
        const [u, v] = unplane(x, y), d = Math.hypot(u, v), e = (d - r) / th;
        let k = e > 0.3 ? 5 : e > -0.3 ? 4 : 2;
        if (v < 0) k -= 2;                         // the far half recedes (in shadow)
        return (Math.max(1, k) + 0.5) / Mr.n;
      };
      const ext = r + th + 2;
      back.fill(-ext, PY - ext, ext, PY + ext, (x, y) => inside(x, y) && unplane(x, y)[1] < 0, Mr, tone);
      front.fill(-ext, PY - ext, ext, PY + ext, (x, y) => inside(x, y) && unplane(x, y)[1] >= 0, Mr, tone);
    }
    // mill dust caught in the rings: a few motes on the plane, turning with the phase
    for (let k = 0; k < 7; k++) {
      const a = k * 0.9 + q.rph * 1.6 + hs(k, 3) * 0.6, r = (34 + hs(k, 9) * 30) * q.rsp;
      const [x, y] = plane(Math.cos(a) * r, Math.sin(a) * r);
      (Math.sin(a) < 0 ? back : front).rect(Math.round(x), Math.round(y), 2, k % 3 ? 1 : 2, M.mote[k % 2], 0);
    }
    // shards: orbiting on the plane, gathered toward the party, flung along the aim, or a pane
    const aimA = Math.atan2(AIM[1], AIM[0]);
    for (let i = 0; i < 8; i++) {
      const a0 = (i * Math.PI) / 4 + q.rot + (i % 2 ? 0.2 : 0);
      const r0 = (i % 2 ? 52 : 42) * q.shR;
      let [cx, cy] = plane(Math.cos(a0) * r0, Math.sin(a0) * r0);
      const depth = Math.sin(a0);
      let ang = Math.atan2(cy - PY, cx), sc = 0.82 + 0.22 * depth;
      if (q.aim > 0) {
        const ta = aimA + (i - 3.5) * 0.17, tr = r0 * 0.78;
        cx += (Math.cos(ta) * tr - cx) * q.aim; cy += (Math.sin(ta) * tr + 6 - cy) * q.aim;
        ang += (((ta - ang + 3 * Math.PI) % TAU) - Math.PI) * q.aim; sc += (1 - sc) * q.aim;
      }
      if (q.out > 0) { const fl = q.out * (22 + (i % 3) * 14); cx += AIM[0] * fl; cy += AIM[1] * fl; }
      if (q.pane > 0) {
        const px = -46 + (i % 3) * 9 - Math.floor(i / 3) * 3, py = 14 + Math.floor(i / 3) * 10 - (i % 3) * 2;
        cx += (px - cx) * q.pane; cy += (py - cy) * q.pane;
        ang += (((-0.4 - ang + 3 * Math.PI) % TAU) - Math.PI) * q.pane; sc += (1 - sc) * q.pane;
      }
      const far = depth < -0.2 && q.aim < 0.5 && q.pane < 0.5 && q.out < 0.3;
      shard(far ? back : front, far ? M.shardF : M.shard, cx, cy, ang, sc, i);
    }
    if (q.pane > 0.6) front.line(-50, 4, -30, 30, M.shine, 0); // the pane's glint
    // the ribbons of voice and dust: one behind (rising to the upper right), one in front
    // (trailing toward the party), swaying with the rings' phase
    const sw = Math.sin(q.rph * TAU) * 0.12, open = 1 + (q.coreS - 1) * 2 + (q.mouth || 0) * 0.08;
    ribbon(swA, M.swirl, 2.75 + sw, 2.75, 25 * cs, 58 * open, 10, 26, 0.8, 3);
    ribbon(swB, M.swirl, 0.15 + sw, 1.75, 24 * cs, 40 * open, 7, -10, 0.86, 7);
    // the core: dark glass in hard bands, a crisp specular highlight up left, a reflected band low
    // right, a cool rim on the right edge
    const R = 23 * cs;
    core.ell(0, 0, R, R, M.core, (x, y) => { const nx = x / R, ny = y / R, f = -(nx * 0.6 + ny * 0.8), d = nx * nx + ny * ny; return ((f > 0.45 ? 3 : f > 0.05 ? 2 : f > -0.5 ? 1 : 0) + (d > 0.8 && f < -0.3 ? 1 : 0) + 0.5) / M.core.n; });
    core.save().translate(-8 * cs, -10 * cs).rotate(-0.6);
    core.ell(0, 0, 7 * cs, 3.4 * cs, M.core, 4);
    core.ell(-0.5, -0.5, 4.6 * cs, 1.8 * cs, M.core, 5);
    core.restore();
    core.dot(-14 * cs, -2 * cs, M.core, 4); core.dot(-14 * cs, -1 * cs, M.core, 3);
    // the three-quarter face: turned toward the party, the far eye narrower at the left
    const lx = q.look > 0.5 ? -2 : 0, ly = q.look > 0.5 ? 1 : 0;
    const eyes = [[-12, -4, 2.4], [-1, -5, 3.6]];
    for (const [ex, ey, rx] of eyes) {
      const x = ex * cs + lx, y = ey * cs + ly;
      if (q.eye < 0.25) { core.line(x - rx - 1, y + 1, x + rx + 1, y + 1, M.eye, 2); continue; }
      const ry = 3.8 * Math.max(0.4, q.eye) * cs;
      core.ell(x, y, rx, ry, M.eye, (px, py) => (py < y - ry * 0.2 ? 3.5 : 2.5) / 4);
      if (rx > 3) core.dot(x - 1, y - 2, M.shine, 0);
    }
    // the mouth: a hollow that opens as it calls, lit along its lower lip
    const mo = q.mouth, mx = -5 * cs + lx, my = 9 * cs + ly, mrx = 3 + mo * 3, mry = 2.4 + mo * 4;
    core.ell(mx, my, mrx + 1.2, mry + 1.2, M.core, 3);
    core.ell(mx, my, mrx, mry, M.hollow, (x, y) => (y > my + mry * 0.4 ? 1.5 : 0.5) / 3);
    A.rim(core, [M.core.id], { w: 2 });
    A.rim(swA, [M.swirl.id]); A.rim(swB, [M.swirl.id]);
    A.cast(swA, core, 2, 3, 1); A.cast(core, swB, 2, 3, 1); A.cast(core, front, 2, 2, 1); A.cast(back, swA, 2, 2, 1);
    for (const Lr of [back, swA, core, swB, front]) A.outline(Lr);
    const out = back.over(swA).over(core).over(swB).over(front);
    if (q.dim < 1) out.fade(q.dim);
    return out;
  }
  const eBase = { rph: 0, rint: 1, rsp: 1, shR: 1, rot: 0, aim: 0, out: 0, pane: 0, coreS: 1, mouth: 0, eye: 1, look: 0, warm: 0, dim: 1 };
  const eIdle = [0, 1, 2, 3, 4, 5, 6, 7].map((f) => ({ rph: f / 8, rot: (f * Math.PI) / 32, mouth: f % 4 === 0 ? 0.25 : 0, coreS: 1 + 0.02 * Math.sin(PH(f, 8)) }));
  const eTable = {
    // Strike: the shards gather on the side facing its target, the core draws in — then it shouts
    // them out in a burst of rings
    'prep.strike': [
      { aim: 0.5, coreS: 0.94, rph: 0.1, rot: 0.2, mouth: 0, look: 1 },
      { aim: 0.9, coreS: 0.88, rph: 0.15, rot: 0.3, rint: 0.8, rsp: 0.9, eye: 0.7, look: 1 },
      { aim: 1, coreS: 0.86, rph: 0.18, rot: 0.35, rint: 0.7, rsp: 0.85, eye: 0.6, look: 1 },
    ],
    'exec.strike': [
      { aim: 1, out: 0.4, coreS: 1.08, rph: 0.3, rsp: 1.1, rint: 1.2, mouth: 1, look: 1 },
      { aim: 1, out: 0.9, coreS: 1.12, rph: 0.45, rsp: 1.2, rint: 1.25, mouth: 1, look: 1 },
      { aim: 0.9, out: 1, coreS: 1.06, rph: 0.6, rsp: 1.15, rint: 1.1, mouth: 0.7, look: 1, eye: 0.8 },
    ],
    'exec.impact': [{ aim: 0.7, out: 0.8, coreS: 1.02, rph: 0.7, rsp: 1.1, mouth: 0.4, look: 1 }],
    'exec.push': [{ aim: 1, out: 0.6, coreS: 0.96, rph: 0.68, rsp: 0.9, rint: 0.9, mouth: 0.5, eye: 0.5, look: 1 }],
    'exec.miss': [{ aim: 0.6, out: 1, coreS: 1, rph: 0.7, mouth: 0.3, eye: 0.6 }],
    'recover.strike': [
      { aim: 0.5, out: 0.4, coreS: 1, rph: 0.8, rot: 0.4, mouth: 0.2 },
      { aim: 0.2, out: 0.1, rph: 0.9, rot: 0.45 },
      { rph: 0, rot: 0.5 },
    ],
    'recover.hover': [{ rph: 0.1, rot: 0.55 }],
    'recover.deflect': [
      { aim: 0.6, out: 0.2, coreS: 0.9, rint: 0.6, rsp: 0.8, rph: 0.7, eye: 0.3, mouth: 0.2 },
      { aim: 0.3, coreS: 0.96, rint: 0.8, rph: 0.85, eye: 0.7 },
      { rph: 0, rot: 0.3 },
    ],
    // Mirror (and Lie): the shards drift forward and lock into a pane that turns its words back
    'prep.mirror': [
      { aim: 0.5, pane: 0.3, rph: 0.2, coreS: 0.96, look: 1 },
      { aim: 0.6, pane: 0.7, rph: 0.3, coreS: 0.94, look: 1, eye: 0.8 },
    ],
    'exec.mirror': [
      { pane: 1, rph: 0.4, coreS: 0.96, rint: 1.1, look: 1, mouth: 0.4 },
      { pane: 1, rph: 0.5, coreS: 1, rint: 1.2, look: 1, mouth: 0.6 },
      { pane: 0.8, aim: 0.5, rph: 0.6, coreS: 1, rint: 1.1, look: 1, mouth: 0.3 },
    ],
    'recover.mirror': [
      { pane: 0.4, aim: 0.4, rph: 0.75, rot: 0.3 },
      { rph: 0.9, rot: 0.4 },
    ],
    // Heat (the Mill Echo): its rings warm and quicken, the core swells with the noise
    'prep.heat': [
      { warm: 0.3, coreS: 0.95, rsp: 0.9, rph: 0.1, eye: 0.7 },
      { warm: 0.5, coreS: 0.92, rsp: 0.85, rph: 0.2, eye: 0.6 },
    ],
    'cast.heat': [
      { warm: 0.8, coreS: 1.06, rsp: 1.1, rint: 1.25, rph: 0.35, mouth: 0.8, rot: 0.3 },
      { warm: 1, coreS: 1.1, rsp: 1.15, rint: 1.3, rph: 0.55, mouth: 1, rot: 0.6 },
      { warm: 1, coreS: 1.08, rsp: 1.15, rint: 1.3, rph: 0.75, mouth: 0.8, rot: 0.9 },
      { warm: 0.9, coreS: 1.05, rsp: 1.1, rint: 1.2, rph: 0.95, mouth: 0.6, rot: 1.2 },
    ],
    'recover.heat': [
      { warm: 0.5, coreS: 1.02, rph: 0.1, rot: 1.3 },
      { warm: 0.15, rph: 0.25, rot: 1.35 },
    ],
    // Plea: the rings slow and soften, the shards draw close, the voice small
    'prep.plea': [
      { shR: 0.85, rint: 0.75, rsp: 0.9, coreS: 0.96, eye: 0.8, rph: 0.05 },
      { shR: 0.75, rint: 0.6, rsp: 0.85, coreS: 0.92, eye: 0.7, rph: 0.1 },
    ],
    'cast.plea': [
      { shR: 0.72, rint: 0.6, rsp: 0.85, coreS: 0.92, mouth: 0.3, eye: 0.8, look: 1, rph: 0.15 },
      { shR: 0.7, rint: 0.65, rsp: 0.88, coreS: 0.92, mouth: 0.5, eye: 0.8, look: 1, rph: 0.22 },
      { shR: 0.72, rint: 0.6, rsp: 0.86, coreS: 0.92, mouth: 0.3, eye: 0.75, look: 1, rph: 0.3 },
      { shR: 0.74, rint: 0.62, rsp: 0.88, coreS: 0.93, mouth: 0.2, eye: 0.8, look: 1, rph: 0.38 },
    ],
    'recover.plea': [
      { shR: 0.86, rint: 0.8, rph: 0.5 },
      { rph: 0.6 },
    ],
    // Re-tying (the Shelved Echo): its shards come back and lock into their ring
    'cast.mend': [
      { shR: 1.3, rot: 0.6, rint: 0.8, eye: 0.6, rph: 0.1 },
      { shR: 1.15, rot: 0.4, rint: 0.9, eye: 0.5, rph: 0.2 },
      { shR: 1.0, rot: 0.2, rint: 1.1, eye: 0.6, rph: 0.3, coreS: 1.03 },
      { shR: 0.92, rot: 0.05, rint: 1.2, eye: 0.8, rph: 0.4, coreS: 1.05 },
    ],
    rest: [
      { rint: 0.7, rsp: 0.9, rph: 0.05, eye: 0.5, shR: 0.95 },
      { rint: 0.55, rsp: 0.85, rph: 0.1, eye: 0.2, shR: 0.9 },
      { rint: 0.5, rsp: 0.85, rph: 0.15, eye: 0.2, shR: 0.9 },
      { rint: 0.65, rsp: 0.9, rph: 0.2, eye: 0.5, shR: 0.95 },
    ],
    recoil: [
      { coreS: 0.86, rsp: 1.3, rint: 0.6, shR: 1.25, rot: -0.3, eye: 0.3, mouth: 0.6 },
      { coreS: 0.94, rsp: 1.1, rint: 0.85, shR: 1.1, rot: -0.15, eye: 0.7, mouth: 0.2 },
    ],
    // a knot loosens: one ring breaks wide, the shards loosen and turn
    release: [
      { rsp: 1.25, rint: 1.2, shR: 1.15, rot: 0.3, eye: 1, mouth: 0.4 },
      { rsp: 1.1, rint: 0.9, shR: 1.08, rot: 0.6, eye: 0.7 },
      { rsp: 1.0, rint: 1, shR: 1, rot: 0.8 },
    ],
    // interrupted: the rings collapse in on the core and the shards scatter loosely
    balk: [
      { rsp: 0.7, rint: 0.5, shR: 1.2, rot: 0.6, coreS: 0.9, eye: 0.5, mouth: 0.2 },
      { rsp: 0.85, rint: 0.7, shR: 1.1, rot: 0.4, coreS: 0.95, eye: 0.7 },
      { rsp: 0.95, rint: 0.9, shR: 1.02, rot: 0.2 },
    ],
    settle: [
      { rint: 0.9, rsp: 1.05, rph: 0.2, eye: 0.7 },
      { rint: 0.7, rsp: 1.1, rph: 0.4, eye: 0.3, shR: 1.05 },
      { rint: 0.5, rsp: 1.15, rph: 0.6, eye: 0, shR: 1.1 },
    ],
  };
  A.family('echo', {
    spec: { w: 208, h: 208, ox: 104, oy: 104, ms: 125, bob: (t) => Math.sin(t / 650) * 3 },
    base: eBase, idle: eIdle, poseTable: eTable, rig: echoRig, recoil: { push: 4 },
    alias: { 'prep.lie': 'prep.mirror', 'exec.lie': 'exec.mirror', 'recover.lie': 'recover.mirror', 'prep.mend': 'prep.plea', 'recover.mend': 'recover.plea' },
  });

  // ---- echo deliveries ----------------------------------------------------------------------------
  // Strike: shards gathered to its target's side, then shouted out (a volley) — contact 600, ~1,150
  A.deliver('echo', 'strike', (a) => {
    const c = A.kit(a), oc = A.outcome(a), to = a.aimed;
    if (c.rd) { c.F(0, 'prep', 300, 'strike@2').F(300, 'exec', 320, 'strike@2').F(620, 'recover', 480, 'strike@0'); c.X(320, 'shardVolley', 300, { to, col: a.ctx.foeCol }); return c.done(600, 1150); }
    c.F(0, 'prep', 300, 'strike');
    c.F(300, 'exec', 320, 'strike', { to, peak: 0.16, shape: 'out' });
    c.X(330, 'shardVolley', 300, { to, col: a.ctx.foeCol, seal: oc === 'ward' || oc === 'block' });
    c.F(620, 'exec', 100, oc === 'ward' || oc === 'block' ? 'push' : oc === 'soft' ? 'push' : oc === 'miss' ? 'miss' : 'impact', { to, peak: 0.16, shape: 'hold' });
    c.F(720, 'recover', 360, oc === 'ward' || oc === 'block' ? 'deflect' : 'strike', { to, peak: 0.16, shape: 'back' });
    c.F(1080, 'recover', 70, 'hover');
    return c.done(600, 1150);
  });
  // Mirror and Lie: a pane assembles from its shards and slides to its target — contact 620
  for (const kind of ['mirror', 'lie']) A.deliver('echo', kind, (a) => {
    const c = A.kit(a), to = a.aimed;
    if (c.rd) { c.F(0, 'prep', 300, 'mirror@1').F(300, 'exec', 340, 'mirror@1').F(640, 'recover', 460, 'mirror@0'); c.X(340, 'pane', 300, { to }); return c.done(620, 1150); }
    c.F(0, 'prep', 300, 'mirror');
    c.F(300, 'exec', 340, 'mirror', { to, peak: 0.08, shape: 'out' });
    c.X(340, 'pane', 300, { to });
    c.F(640, 'recover', 460, 'mirror', { to, peak: 0.08, shape: 'back' });
    return c.done(620, 1150);
  });
  // Heat (the Mill Echo): its rings warm and quicken; Heat applies at 680
  A.deliver('echo', 'heat', (a) => {
    const c = A.kit(a);
    if (c.rd) { c.F(0, 'prep', 280, 'heat@1').F(280, 'cast', 620, 'heat@1').F(900, 'recover', 250, 'heat@0'); return c.done(680, 1150); }
    c.F(0, 'prep', 280, 'heat').F(280, 'cast', 620, 'heat').F(900, 'recover', 250, 'heat');
    c.X(300, 'echoRings', 600, { warm: true });
    return c.done(680, 1150);
  });
  // Plea: soft rings and a small voice; the note reaches you at 640
  A.deliver('echo', 'plea', (a) => {
    const c = A.kit(a);
    if (c.rd) { c.F(0, 'prep', 260, 'plea@1').F(260, 'cast', 640, 'plea@1').F(900, 'recover', 300, 'plea@0'); c.X(300, 'note', 760, { from: 'foe', to: 'party', fade: true }); return c.done(640, 1200); }
    c.F(0, 'prep', 260, 'plea').F(260, 'cast', 640, 'plea').F(900, 'recover', 300, 'plea');
    c.X(280, 'echoRings', 700, {});
    c.X(300, 'note', 760, { from: 'foe', to: 'party', fade: true });
    return c.done(640, 1200);
  });
  // Re-tying (the Shelved Echo): shards return and lock; the knot is tied at 760
  A.deliver('echo', 'mend', (a) => {
    const c = A.kit(a), fv = a.fv || {}, i = Math.min((fv.maxKnots || 1) - 1, fv.knots || 0);
    if (c.rd) { c.F(0, 'cast', 900, 'mend@3').F(900, 'recover', 300, 'plea@1'); c.X(220, 'mendThread', 600, { i }); return c.done(760, 1200); }
    c.F(0, 'prep', 220, 'plea').F(220, 'cast', 680, 'mend').F(900, 'recover', 300, 'plea');
    c.X(220, 'mendThread', 620, { i });
    return c.done(760, 1200);
  });
  A.auditFamily('echo', {
    anatomy: 'echo / abstract', frame: [208, 208], anchor: [104, 104], was: [184, 184],
    idle: '8 drawings × 125 ms (rings spreading, shards turning, the mouth catching a breath) + bob',
    materials: 'translucent rings lit on the light side, bevelled stone shards, a dark glassy core with a rim',
    moves: { strike: 'shards gathered to the target\'s side, shouted out as a volley', mirror: 'shards lock into a pane that slides to its target (also Lie)', heat: 'rings warm and quicken', plea: 'rings soften, shards draw close, a note', mend: 'shards return and lock' },
    reactions: 'recoil (rings blown wide), release (a ring breaks wide), balk (rings collapse), settle (rings fade, eyes closed)',
    overlays: 'Heat pips; Gathering motes',
  });
})();
