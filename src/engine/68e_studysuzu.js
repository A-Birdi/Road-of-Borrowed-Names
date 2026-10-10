/* The fidelity study's Suzu, redrawn from scratch (docs/future/work/P01_STUDY.md; development only).
 *
 * From her bust reference (docs/future/playbook/mockups/09) and her game sprite, only as reference: long copper
 * hair falling in heavy waves with violet in its shade, a pink bow on her left, deep warm skin, amber eyes, a plum
 * dress with gold at the neck, the sash and the wide sleeves, gold at her throat, ears and wrists. She stands facing
 * us, her weight easy, her left hand on her hip (as she stands in battle), her right arm loose.
 *
 * Built once in layers (back hair, body, face, front hair, bow, earrings), pixel by pixel at 48×72, lit from the
 * upper left like the rest of the scene, each part shaded in its own ramp with a selective outline (the darkest
 * step of what it bounds, lighter on the lit side). The idle loop moves whole pixels, never redraws shapes, so every
 * frame stays crisp:
 *  - breath (3.2 s): the shoulders and chest lift a pixel; the head follows a beat later;
 *  - the hair: a slow wave runs down it, the tips swinging a pixel or two in the breeze from the west;
 *  - the hem sways a pixel behind the hips; the bow's tails flutter; the earrings swing after the head;
 *  - a blink every few seconds (half, closed, half), and now and then a glance toward the wheel.
 * Reduced motion holds the first frame. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.studySuzu = (function () {
  'use strict';
  const K = RB.studyKit;
  const { RAMP, hash, Buf, clamp, covered, inEll, inPoly } = K;
  const FW = 48, FH = 72, FOOT = { x: 24, y: 69 };
  const L = (() => { const v = [-0.55, -0.62, 0.56], n = Math.hypot(...v); return v.map((a) => a / n); })();
  const Hr = RAMP.hair, Sk = RAMP.skin, Dr = RAMP.dress, Au = RAMP.gold, Bw = RAMP.bow, Bt = RAMP.boot, Ir = RAMP.iris;

  // a layer: colours plus, per pixel, which ramp it came from (for the outline)
  function Layer() { this.b = new Buf(FW, FH); this.m = new Uint8Array(FW * FH); }
  Layer.prototype.put = function (x, y, ramp, i, mat) {
    if (x < 0 || y < 0 || x >= FW || y >= FH) return;
    this.b.set(x, y, ramp[clamp(Math.round(i), 0, ramp.length - 1)]);
    this.m[y * FW + x] = mat;
  };
  const MATS = [null, Hr, Sk, Dr, Au, Bw, Bt];
  // lighting on an ellipsoid at (cx, cy) with radii (rx, ry): 0 (away) … 1 (facing the sun)
  function sphere(x, y, cx, cy, rx, ry) {
    const nx = (x + 0.5 - cx) / rx, ny = (y + 0.5 - cy) / ry, nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
    return Math.max(0, nx * L[0] + ny * L[1] + nz * L[2]);
  }
  const wave = (y, ph) => Math.sin(y * 0.42 + ph) * 1.3;

  // ---- the back hair: the long mass behind her shoulders, as heavy wavy locks ----------------------------------
  // Each lock is a tapered curve; locks are laid back to front (inner ones first) so each outer lock's edge
  // shades the one behind it. Light runs down the lit (outer-left) edge of each wave; the tips curl out.
  const BACK_LOCKS = [
    // inner locks, behind her shoulders, mostly in shade
    { p: [[19, 22], [17.5, 32], [17, 42], [18.6, 51], [17, 57]], w: [5, 1.4], d: -1.4 },
    { p: [[29, 22], [30.5, 32], [31, 42], [29.6, 51], [31.4, 57]], w: [5, 1.4], d: -1.4 },
    // the middle locks
    { p: [[16.5, 17], [13, 26], [13.4, 36], [11.4, 46], [13, 54], [16.4, 59]], w: [6.4, 1.6], d: -0.4 },
    { p: [[31.5, 17], [35, 26], [34.6, 36], [36.8, 46], [35, 54], [31.8, 59]], w: [6.4, 1.6], d: -0.5 },
    // the outer locks, catching the light
    { p: [[15, 12.5], [10.6, 20], [9.4, 30], [7.4, 40], [8.6, 49], [11.8, 55.5]], w: [6.6, 1.6], d: 0.5 },
    { p: [[33, 12.5], [37.6, 20], [38.8, 30], [41, 40], [39.6, 49], [36.4, 55.4]], w: [6.6, 1.6], d: 0 },
  ].map((o) => Object.assign(o, { f: K.inCurve(o.p, o.w[0], o.w[1]) }));
  function backHair() {
    const ly = new Layer();
    const crown = inEll(24, 17.5, 12.4, 11);
    // the mass beneath the locks: no gaps beside her neck, none between locks above their tips
    const mass = inPoly([[13, 14], [9.6, 24], [8.6, 36], [8.8, 46], [12, 53], [17, 55], [24, 52], [31, 55], [36, 53], [39.2, 46], [39.4, 36], [38.4, 24], [35, 14], [24, 9]]);
    for (let y = 8; y < 58; y++) for (let x = 6; x < 42; x++) if (covered(mass, x, y)) ly.put(x, y, Hr, 1.6 + sphere(x, y, 22, 20, 16, 24) * 1.6, 1);
    const own = new Int8Array(FW * FH).fill(-1);
    for (let y = 4; y < 62; y++) for (let x = 2; x < 46; x++) {
      for (let k = BACK_LOCKS.length - 1; k >= 0; k--) if (covered(BACK_LOCKS[k].f, x, y)) { own[y * FW + x] = k; break; }
      if (own[y * FW + x] < 0 && covered(crown, x, y)) own[y * FW + x] = 99;
    }
    for (let y = 4; y < 62; y++) for (let x = 2; x < 46; x++) {
      const k = own[y * FW + x];
      if (k < 0) continue;
      let v;
      if (k === 99) v = 2.6 + sphere(x, y, 22, 15, 13, 12) * 3.6;
      else {
        const lk = BACK_LOCKS[k], q = lk.f.at(x + 0.5, y + 0.5);
        v = 3.4 + lk.d + sphere(x, y, 23, 22, 17, 28) * 3.2;
        v += (1 - Math.abs(q.across)) * 1.5 - 0.5; // round across the lock
        // light runs along the lit side of each wave: where the lock leans out to the left, its left edge shines
        const lean = q.dx / (Math.hypot(q.dx, q.dy) || 1);
        if (q.across < -0.1 && q.across > -0.75 && lean < -0.12) v += 1.6;
        if (q.across > 0.55) v -= 1; // the shadowed side
        if (q.t > 0.82) v -= 0.6; // the tips, thinner and darker
        // a thin dark parting where this lock lies over another
        const up = own[(y - 1) * FW + x], lf = own[y * FW + x - 1], rt = own[y * FW + x + 1];
        if ((up >= 0 && up !== k && up !== 99) || (lf >= 0 && lf !== k && lf < k) || (rt >= 0 && rt !== k && rt < k)) v -= 1.4;
      }
      ly.put(x, y, Hr, v, 1);
    }
    return ly;
  }

  // ---- the body: boots, skirt, bodice, sash, sleeves, arms, hands -----------------------------------------------
  function body() {
    const ly = new Layer();
    // legs and boots
    for (let y = 60; y < 70; y++) for (const [x0, x1] of [[19, 23], [25, 29]]) for (let x = x0; x < x1; x++) {
      if (y < 65) ly.put(x, y, Sk, 3.4 + (x === x0 ? 1.4 : x === x1 - 1 ? -1 : 0), 2);
      else {
        const toe = y >= 67 ? (x0 === 19 ? -1 : 0) : 0;
        if (x + toe < x0 - 1) continue;
        ly.put(x + toe, y, Bt, 2.6 + (y === 65 ? 1.6 : 0) + (x === x0 ? 1 : x === x1 - 1 ? -1 : 0), 6);
      }
    }
    // the skirt: a flared bell, lit on the left, four soft folds, gold at the hem
    const skirt = (x, y) => {
      if (y < 43 || y > 63) return false;
      const t = (y - 43) / 20, half = 6.4 + t * 5.6 + Math.sin(t * Math.PI) * 0.8;
      const hem = 62 + Math.cos(((x - 24) / 12) * 1.4) * 1.2;
      return Math.abs(x - 23.8) < half && y < hem;
    };
    for (let y = 42; y < 65; y++) for (let x = 8; x < 40; x++) {
      if (!covered(skirt, x, y)) continue;
      const t = (y - 43) / 20, half = 6.4 + t * 5.6;
      const u = (x + 0.5 - 23.8) / half;
      let v = 4.6 - u * 1.8;
      const fold = Math.sin((x + 0.5 - 23.8) * (0.62 - t * 0.18) * 1.1 + 0.6);
      v += fold * (0.4 + t * 1.3);
      if (!covered(skirt, x, y + 1)) { ly.put(x, y, Au, 4.6 - u * 1.2, 4); continue; } // gold at the hem
      if (!covered(skirt, x, y + 2)) { ly.put(x, y, Au, 3.2 - u, 4); continue; }
      ly.put(x, y, Dr, v, 3);
    }
    // the bodice
    const bodice = inPoly([[15.5, 33], [32.5, 33], [30.5, 39], [29.6, 44], [18.4, 44], [17.5, 39]]);
    for (let y = 32; y < 45; y++) for (let x = 14; x < 34; x++) {
      if (!covered(bodice, x, y)) continue;
      let v = 2.6 + sphere(x, y, 23.4, 37, 9.5, 8) * 4.4;
      if (y >= 36 && y <= 38 && Math.abs(x - 23.5) > 1 && Math.abs(x - 23.5) < 5) v += x < 24 ? 0.9 : -0.4; // the curve of the chest
      ly.put(x, y, Dr, v, 3);
    }
    // the neckline: skin of the throat and chest, a gold trim around it
    for (let y = 31; y < 37; y++) for (let x = 18; x < 30; x++) {
      const d = ((x + 0.5 - 23.8) / 4.8) ** 2 + ((y + 0.5 - 31) / 4.6) ** 2;
      if (d > 1.18) continue;
      if (d > 0.82) ly.put(x, y, Au, 5.2 - (x - 18) * 0.22, 4);
      else ly.put(x, y, Sk, 3.6 + sphere(x, y, 22, 31, 6, 6) * 3.4, 2);
    }
    // the sash: deep plum with gold edges and a clasp
    for (let y = 42; y < 46; y++) for (let x = 17; x < 31; x++) {
      if (!covered(skirt, x, y) && !covered(bodice, x, y)) continue;
      if (y === 42 || y === 45) ly.put(x, y, Au, x < 24 ? 5 : 3.4, 4);
      else ly.put(x, y, Dr, 2 + (x < 22 ? 1 : 0), 3);
    }
    for (const [x, y, i] of [[23, 43, 6], [24, 43, 5], [23, 44, 4], [24, 44, 3]]) ly.put(x, y, Au, i, 4);

    // her right arm (on our left), loose: a bell sleeve falling from the shoulder, its dark mouth at the bottom
    // edged in gold, the hand hanging just out of it
    const sleeveL = inPoly([[15.5, 33], [13.2, 36], [11.6, 41], [10.4, 45.6], [11, 47.6], [13.6, 48.4], [16.8, 47.8], [18, 45.5], [18, 38], [17.8, 34]]);
    const mouthL = inEll(14, 47.3, 3.3, 1.15);
    for (let y = 32; y < 50; y++) for (let x = 8; x < 20; x++) {
      if (!covered(sleeveL, x, y)) continue;
      if (covered(mouthL, x, y)) { ly.put(x, y, Dr, 0.6, 3); continue; }
      if (!covered(sleeveL, x, y + 1) || (y >= 45 && !covered(sleeveL, x - 1, y + 1))) { ly.put(x, y, Au, x < 13 ? 5.4 : 3.6, 4); continue; }
      let v = 2.6 + sphere(x, y, 13, 38, 6, 12) * 4;
      if (x >= 16.5) v -= 1.2; // the inner side
      if (y > 40 && Math.abs(x + 0.5 - (12.8 + (y - 40) * -0.15)) < 0.6) v -= 1; // one fold down the sleeve
      ly.put(x, y, Dr, v, 3);
    }
    const handL = [
      [12, 48, 'a', 5.6], [13, 48, 'a', 6.4], [14, 48, 'a', 4.6], [15, 48, 'a', 3.2],
      [12, 49, 's', 5.6], [13, 49, 's', 5], [14, 49, 's', 4], [15, 49, 's', 2.8],
      [12, 50, 's', 5.4], [13, 50, 's', 4.8], [14, 50, 's', 3.8], [15, 50, 's', 2.6],
      [12, 51, 's', 4.6], [13, 51, 's', 4.2], [14, 51, 's', 3.2], [15, 51, 's', 2.2],
      [13, 52, 's', 3.6], [14, 52, 's', 2.6],
    ];
    for (const [x, y, r, i] of handL) ly.put(x, y, r === 'a' ? Au : Sk, i, r === 'a' ? 4 : 2);

    // her left arm (on our right): the elbow out, the hand on her hip; the wide sleeve hangs from the elbow
    const upperR = inPoly([[29.6, 33], [33, 33.4], [36.2, 37], [38.8, 41.2], [36.4, 43], [33.6, 40.4], [31, 37.4]]);
    const drapeR = inPoly([[35, 41], [38.8, 41.2], [40.4, 45], [40.8, 49.4], [38.6, 50.6], [36.4, 49.2], [35.4, 45.6]]);
    const mouthR = inEll(38.4, 49.4, 2.2, 1);
    for (let y = 32; y < 52; y++) for (let x = 28; x < 43; x++) {
      const up = covered(upperR, x, y), dr = covered(drapeR, x, y);
      if (!up && !dr) continue;
      if (dr && !up) {
        if (covered(mouthR, x, y)) { ly.put(x, y, Dr, 0.6, 3); continue; }
        if (!covered(drapeR, x, y + 1)) { ly.put(x, y, Au, 3.4, 4); continue; }
        ly.put(x, y, Dr, 2.2 + (x < 37.5 ? 1 : 0) + (y < 44 ? 0.6 : 0), 3);
        continue;
      }
      let v = 2.8 + sphere(x, y, 32.4, 35.4, 6.4, 7) * 3.6;
      if (y > 38 && x > 35) v -= 0.6;
      ly.put(x, y, Dr, v, 3);
    }
    // the forearm, back from the elbow to her hip, the bracelet, and the hand resting there
    const armR = [
      [35, 42, 's', 4.4], [34, 42, 's', 5], [34, 43, 's', 4.2], [33, 43, 's', 5.2], [35, 43, 's', 3],
      [33, 44, 'a', 5.4], [32, 44, 'a', 6.4], [32, 45, 'a', 3.4], [33, 45, 'a', 2.6],
      [31, 44, 's', 5.6], [30, 44, 's', 5.2], [29, 44, 's', 4.4],
      [31, 45, 's', 4.6], [30, 45, 's', 4.8], [29, 45, 's', 3.8], [28, 45, 's', 3.2],
      [30, 46, 's', 3.8], [29, 46, 's', 3.2], [31, 46, 's', 3],
    ];
    for (const [x, y, r, i] of armR) ly.put(x, y, r === 'a' ? Au : Sk, i, r === 'a' ? 4 : 2);
    // a pendant on her choker
    ly.put(24, 33, Au, 6, 4); ly.put(24, 34, Au, 4, 4);
    return ly;
  }

  // ---- the face and neck ---------------------------------------------------------------------------------------
  function head() {
    const ly = new Layer();
    const face = (x, y) => {
      if (y < 12 || y > 30) return false;
      const top = ((x - 23.9) / 7.3) ** 2 + ((y - 20.2) / 8) ** 2 <= 1 && y < 24;
      const jaw = y >= 22 && Math.abs(x - 23.9) < 7.1 - Math.pow((y - 22) / 7.4, 1.5) * 5.4 && y < 29.6;
      return top || jaw;
    };
    for (let y = 26; y < 34; y++) for (let x = 20; x < 28; x++) {
      if (Math.abs(x + 0.5 - 23.9) > 3.1 - (y > 31 ? 1 : 0) * -0.6) continue;
      ly.put(x, y, Sk, y < 30 ? 2.4 : 3.4 + (x < 23 ? 0.8 : 0), 2); // the neck, shaded under the jaw
    }
    for (let y = 12; y < 31; y++) for (let x = 14; x < 34; x++) {
      if (!covered(face, x, y)) continue;
      let v = 3.4 + sphere(x, y, 22.6, 19.5, 8.4, 10) * 4.2;
      if (y >= 28) v -= 0.6;
      ly.put(x, y, Sk, v, 2);
    }
    // the bangs' shadow across the forehead
    for (let x = 16; x < 32; x++) for (let y = 15; y < 19; y++) { const c = ly.b.get(x, y); if (c) ly.put(x, y, Sk, 3.2 + (x < 22 ? 0.8 : 0), 2); }
    return ly;
  }
  // the features, as small pixel maps (drawn onto the face layer; the eyes also as blink and glance variants)
  const EYE_OPEN = {
    // [x, y, ramp, index]: h hair (lashes), s skin, i iris, w white, x catchlight; the left eye (on our left), the right
    L: [[17, 19, 'h', 1], [18, 19, 'h', 0], [19, 19, 'h', 0], [20, 19, 'h', 0], [21, 19, 'h', 1], [16, 20, 'h', 1],
      [17, 20, 'w', 0], [18, 20, 'x', 0], [19, 20, 'i', 1], [20, 20, 'i', 2], [21, 20, 's', 4],
      [17, 21, 'w', 0], [18, 21, 'i', 2], [19, 21, 'i', 0], [20, 21, 'i', 3], [21, 21, 's', 5],
      [18, 22, 'i', 3], [19, 22, 'i', 5], [20, 22, 'i', 4], [17, 22, 's', 4], [21, 22, 's', 5]],
    R: [[26, 19, 'h', 1], [27, 19, 'h', 0], [28, 19, 'h', 0], [29, 19, 'h', 0], [30, 19, 'h', 1], [31, 20, 'h', 1],
      [26, 20, 's', 4], [27, 20, 'x', 0], [28, 20, 'i', 1], [29, 20, 'i', 2], [30, 20, 'w', 0],
      [26, 21, 's', 4], [27, 21, 'i', 2], [28, 21, 'i', 0], [29, 21, 'i', 3], [30, 21, 'w', 0],
      [27, 22, 'i', 3], [28, 22, 'i', 5], [29, 22, 'i', 4], [26, 22, 's', 3], [30, 22, 's', 4]],
  };
  function eyeMap(state, glance) {
    const out = [];
    for (const k of ['L', 'R']) for (const p of EYE_OPEN[k]) out.push(p.slice());
    // a glance to her left (our right, toward the wheel): irises and catchlights move a pixel; the whites swap side
    if (glance) for (const p of out) { if (p[2] === 'i' || p[2] === 'x') p[0] += 1; else if (p[2] === 'w') p[0] -= 3; }
    if (state === 'half') {
      // the lid comes down: the top row of iris becomes lid
      return out.map((p) => (p[1] === 20 && p[2] !== 's' ? [p[0], p[1], 'h', 1] : p));
    }
    if (state === 'closed') {
      const c = [];
      for (const [x0, x1] of [[17, 21], [26, 30]]) for (let x = x0; x <= x1; x++) { c.push([x, 21, 'h', 1]); c.push([x, 20, 's', 5]); c.push([x, 22, 's', 4]); c.push([x, 19, 's', 5]); }
      c.push([17, 22, 'h', 1]); c.push([30, 22, 'h', 1]);
      return c;
    }
    return out;
  }
  function paintFeatures(ly, eye, glance) {
    const R = { h: Hr, s: Sk, i: Ir };
    for (const [x, y, r, i] of eyeMap(eye, glance)) {
      if (r === 'w') ly.put(x, y, [[236, 226, 218]], 0, 2);
      else if (r === 'x') ly.put(x, y, [[255, 248, 236]], 0, 2); // the catchlight
      else ly.put(x, y, R[r], i, r === 'h' ? 1 : 2);
    }
    // brows (half hidden by the bangs), the nose, the mouth's small smile, a little warmth on the cheeks
    for (const [x, y, i] of [[18, 17, 2], [19, 17, 1], [20, 17, 2], [27, 17, 2], [28, 17, 1], [29, 17, 2]]) ly.put(x, y, Hr, i, 1);
    ly.put(24, 23, Sk, 7.6, 2); ly.put(25, 24, Sk, 3.4, 2); ly.put(24, 24, Sk, 5.2, 2);
    const lip = [[118, 46, 44]], lipL = [[150, 70, 64]];
    ly.put(22, 26, Sk, 3.2, 2); ly.put(23, 27, lip, 0, 2); ly.put(24, 27, lip, 0, 2); ly.put(25, 27, lip, 0, 2); ly.put(26, 26, Sk, 3, 2);
    ly.put(24, 28, lipL, 0, 2); ly.put(23, 28, Sk, 6.4, 2);
    for (const [x, y, k] of [[18, 24, 0.32], [19, 24, 0.4], [20, 25, 0.2], [28, 24, 0.4], [29, 24, 0.32], [27, 25, 0.2]]) { const c = ly.b.get(x, y); if (c) ly.b.set(x, y, K.mixc(c, [222, 112, 112], k)); }
  }

  // ---- the front hair: the crown over the skull, the bangs swept across, the locks framing her face ------------
  const BANGS = [
    { p: [[18.6, 9], [15.6, 13], [14.6, 17], [15, 20.5]], w: [4.8, 0.6] },
    { p: [[20.6, 9], [18.6, 13.4], [18.2, 17], [18.8, 19.6]], w: [4.4, 0.6] },
    { p: [[23, 9.4], [22.2, 13.6], [22, 18.6]], w: [4.6, 0.6] },
    { p: [[25.6, 9.6], [26, 13.8], [26.6, 18]], w: [4.2, 0.6] },
    { p: [[28, 10], [29.6, 13.8], [31, 18.8]], w: [4, 0.6] },
    { p: [[30.6, 10.6], [32.8, 15], [33.4, 20.4]], w: [3.6, 0.6] },
  ].map((o) => Object.assign(o, { f: K.inCurve(o.p, o.w[0], o.w[1]) }));
  const SIDE_LOCKS = [
    // on our left, a long lock over her shoulder, curling at the chest
    { p: [[15.4, 13], [13, 21], [12.8, 30], [14.6, 37], [13.6, 43]], w: [5.4, 1.2] },
    { p: [[17.4, 16], [16.4, 24], [16.6, 31]], w: [3.4, 0.8] },
    // on our right, shorter, behind the bow
    { p: [[32.8, 13.4], [35.2, 21], [35.4, 29], [34, 35.5]], w: [4.8, 1] },
  ].map((o) => Object.assign(o, { f: K.inCurve(o.p, o.w[0], o.w[1]) }));
  function frontHair() {
    const ly = new Layer();
    const cap = (x, y) => ((x - 24) / 11.4) ** 2 + ((y - 16.2) / 8.8) ** 2 <= 1 && y < 17.2 + (x < 24 ? (24 - x) * 0.1 : 0);
    const part = { x: 21, y: 8.6 }; // where the hair parts, a little to her right
    for (let y = 3; y < 46; y++) for (let x = 6; x < 42; x++) {
      const inCap = covered(cap, x, y);
      let lk = null, kind = 0;
      if (!inCap) {
        for (let i = BANGS.length - 1; i >= 0 && !lk; i--) if (covered(BANGS[i].f, x, y)) { lk = BANGS[i]; kind = 1; }
        for (let i = SIDE_LOCKS.length - 1; i >= 0 && !lk; i--) if (covered(SIDE_LOCKS[i].f, x, y)) { lk = SIDE_LOCKS[i]; kind = 2; }
        if (!lk) continue;
      }
      let v;
      if (inCap) {
        // strands radiate from the parting; the sheen is a broken arc of short bright strands
        const a = Math.atan2(y + 0.5 - part.y, x + 0.5 - part.x), strand = Math.floor(a * 9), fr = a * 9 - strand;
        v = 2.8 + sphere(x, y, 21.5, 13.4, 11.8, 9.6) * 5.2;
        v += (hash(strand, 0, 601) - 0.5) * 1.2;
        if (fr < 0.18) v -= 1.1;
        const ring = Math.abs(((x + 0.5 - 23.6) / 9.4) ** 2 + ((y + 0.5 - 13.8) / 5.2) ** 2 - 1);
        if (ring < 0.2 && x < 31 && hash(strand, 1, 602) > 0.25) v += 2.2;
      } else {
        const q = lk.f.at(x + 0.5, y + 0.5);
        v = 3.4 + sphere(x, y, 22, 15, 13, 15) * 3.8 + (1 - Math.abs(q.across)) * 1.4 - 0.4;
        if (q.across > 0.5) v -= 1.3; // each lock's shadowed right edge
        if (q.across < -0.45 && q.across > -0.85) v += 0.9;
        if (kind === 1 && q.t > 0.72) v -= 1; // the bangs' tips, darker where they touch the face
        if (kind === 2 && q.t > 0.4 && q.t < 0.58 && q.across < 0.1) v += 1.4; // light on the turn of a side lock
      }
      ly.put(x, y, Hr, v, 1);
    }
    return ly;
  }

  // ---- the bow, on her left (our right), and the earrings ------------------------------------------------------
  function bow() {
    const ly = new Layer();
    // two loops, fuller now: lit along their tops, shaded beneath, a fold inside each; the knot between
    const loops = [{ cx: 29.8, cy: 8.2, rx: 4, ry: 3 }, { cx: 36.8, cy: 9.6, rx: 3.8, ry: 3 }];
    for (let y = 3; y < 15; y++) for (let x = 24; x < 43; x++) {
      for (const lp of loops) {
        if (!covered(inEll(lp.cx, lp.cy, lp.rx, lp.ry), x, y)) continue;
        let v = 1.6 + sphere(x, y, lp.cx - 1.2, lp.cy - 1.4, lp.rx + 1, lp.ry + 1) * 4.6;
        const fx = x + 0.5 - lp.cx, fy = y + 0.5 - lp.cy;
        if (Math.abs(fy - fx * 0.3) < 0.6 && Math.abs(fx) < lp.rx - 1.2) v -= 1.5; // the fold
        ly.put(x, y, Bw, v, 5);
        break;
      }
    }
    for (const [x, y, i] of [[33, 8, 4], [34, 8, 3], [33, 9, 3], [34, 9, 2], [33, 10, 2], [34, 10, 1]]) ly.put(x, y, Bw, i, 5);
    ly.tails = [[33, 11, 3], [34, 11, 2], [32, 12, 3], [35, 12, 2], [32, 13, 2], [35, 13, 3], [31, 14, 3], [36, 14, 2], [31, 15, 2], [36, 15, 3], [37, 16, 2]];
    return ly;
  }

  // the pixel artist's cleanup: a lone pixel whose four neighbours all differ from it takes the colour most of
  // them share (so shading reads as clusters, never as speckle)
  function despeckle(ly) {
    const d = ly.b.d, src = new Uint8ClampedArray(d), key = (i) => (src[i] << 16) | (src[i + 1] << 8) | src[i + 2];
    for (let y = 1; y < FH - 1; y++) for (let x = 1; x < FW - 1; x++) {
      const i = (y * FW + x) * 4;
      if (!src[i + 3]) continue;
      const me = key(i), nb = [i - 4, i + 4, i - FW * 4, i + FW * 4].filter((j) => src[j + 3]);
      if (nb.length < 4 || nb.some((j) => key(j) === me)) continue;
      const count = new Map();
      for (const j of nb) count.set(key(j), (count.get(key(j)) || 0) + 1);
      let best = nb[0], bc = 0;
      for (const j of nb) if (count.get(key(j)) > bc) { bc = count.get(key(j)); best = j; }
      if (bc < 2) continue;
      d[i] = src[best]; d[i + 1] = src[best + 1]; d[i + 2] = src[best + 2];
    }
    return ly;
  }

  // the selective outline around a set of layers composited together: the darkest step of the material the edge
  // bounds, one step lighter where the edge faces the sun (up or left)
  function outline(buf, mat) {
    const out = new Buf(FW, FH);
    out.d.set(buf.d);
    const at = (x, y) => (x < 0 || y < 0 || x >= FW || y >= FH ? 0 : buf.alpha(x, y));
    for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) {
      if (!at(x, y)) continue;
      const o = { l: !at(x - 1, y), r: !at(x + 1, y), u: !at(x, y - 1), d: !at(x, y + 1) };
      if (!o.l && !o.r && !o.u && !o.d) continue;
      const ramp = MATS[mat[y * FW + x]] || Hr;
      const lit = (o.l || o.u) && !o.r && !o.d;
      out.set(x, y, ramp[lit ? 1 : 0]);
    }
    return out;
  }

  // ---- the parts, built once; frames composed from them with whole-pixel offsets --------------------------------
  let P = null;
  function build() {
    const t0 = typeof performance !== 'undefined' ? performance.now() : 0;
    P = { back: despeckle(backHair()), body: body(), head: head(), front: despeckle(frontHair()), bow: bow(), cache: new Map() };
    P.ms = (typeof performance !== 'undefined' ? performance.now() : 0) - t0;
    return P;
  }
  // the pose at time t (ms): integer offsets for each part and row, and the eyes
  function poseAt(t, still) {
    if (still) return { lift: 0, head: 0, sway: [0, 0, 0, 0], hem: 0, tail: 0, ear: 0, eye: 'open', glance: false };
    const br = (1 - Math.cos((t / 3200) * Math.PI * 2)) / 2, brH = (1 - Math.cos(((t - 260) / 3200) * Math.PI * 2)) / 2;
    const s = (ph) => Math.sin((t / 4600) * Math.PI * 2 - ph);
    const sway = [0, Math.round(s(0.5) * 0.7 + 0.2), Math.round(s(1.1) * 1.2 + 0.3), Math.round(s(1.7) * 1.7 + 0.4)];
    const blinkT = t % 4300, eye = blinkT < 70 ? 'half' : blinkT < 170 ? 'closed' : blinkT < 240 ? 'half' : 'open';
    const glance = (t % 11000) > 7600 && (t % 11000) < 9200;
    return { lift: br > 0.55 ? 1 : 0, head: brH > 0.62 ? 1 : 0, sway, hem: Math.round(Math.sin((t / 4600) * Math.PI * 2 - 2.2) * 0.8), tail: Math.sin(t / 260) > 0.2 ? 1 : 0, ear: brH > 0.62 && br < 0.62 ? 1 : 0, eye, glance };
  }
  function frameFor(p) {
    const key = [p.lift, p.head, p.sway.join(''), p.hem, p.tail, p.ear, p.eye, p.glance ? 1 : 0].join('|');
    let f = P.cache.get(key);
    if (f) return f;
    const comp = new Buf(FW, FH), mat = new Uint8Array(FW * FH);
    // copy a layer's rows with a vertical lift and a per-row horizontal shift
    const lay = (ly, dy, dxRow, rowMin, rowMax) => {
      for (let y = 0; y < FH; y++) {
        if (y < (rowMin || 0) || y > (rowMax == null ? FH : rowMax)) continue;
        const dx = dxRow ? dxRow(y) : 0, ty = y - dy;
        for (let x = 0; x < FW; x++) {
          const i = (y * FW + x) * 4;
          if (!ly.b.d[i + 3]) continue;
          const tx = x + dx;
          if (tx < 0 || tx >= FW || ty < 0 || ty >= FH) continue;
          comp.set(tx, ty, [ly.b.d[i], ly.b.d[i + 1], ly.b.d[i + 2]], ly.b.d[i + 3]);
          mat[ty * FW + tx] = ly.m[y * FW + x];
        }
      }
    };
    const hairShift = (y) => (y < 30 ? 0 : y < 40 ? p.sway[1] : y < 50 ? p.sway[2] : p.sway[3]);
    lay(P.back, p.head, hairShift);
    // the body: everything above the sash rises with the breath; the skirt sways at the hem
    lay(P.body, 0, (y) => (y >= 58 && y < 64 ? p.hem : 0), 34, FH);
    lay(P.body, p.lift, null, 0, 41);
    const face = new Layer();
    face.b.d.set(P.head.b.d); face.m.set(P.head.m);
    paintFeatures(face, p.eye, p.glance);
    if (p.head) lay(face, 0, null, 27, 33); // the neck stays; the head rises above it
    lay(face, p.head);
    lay(P.front, p.head, (y) => (y < 30 ? 0 : y < 38 ? p.sway[1] : p.sway[2]));
    lay(P.bow, p.head);
    // the bow's tails, fluttering a pixel
    for (const [x, y, i] of P.bow.tails) { comp.set(x + (y > 13 ? p.tail : 0), y - p.head, Bw[i]); mat[(y - p.head) * FW + x + (y > 13 ? p.tail : 0)] = 5; }
    // the earrings: a bead and a drop below each ear, swinging after the head
    for (const ex of [16, 31]) {
      const ey = 26 - p.head, sw = p.ear;
      comp.set(ex, ey, Au[6]); // the bead
      comp.set(ex + sw, ey + 1, Au[6]); comp.set(ex + sw, ey + 2, Au[3]); // the drop, swinging after the head
      for (const [dx, dy] of [[0, 0], [sw, 1], [sw, 2]]) mat[(ey + dy) * FW + ex + dx] = 4;
    }
    const out = outline(comp, mat);
    f = { cv: out.canvas(), buf: out };
    P.cache.set(key, f);
    return f;
  }
  // the silhouette, for her shadow on the ground
  const shadowCache = new Map();
  function silhouette(f) {
    let s = shadowCache.get(f);
    if (s) return s;
    const b = new Buf(FW, FH);
    for (let i = 0; i < FW * FH; i++) if (f.buf.d[i * 4 + 3]) b.set(i % FW, (i / FW) | 0, [70, 60, 120]);
    s = b.canvas();
    shadowCache.set(f, s);
    return s;
  }

  // draw her at world (wx, wy) = the point between her feet, into c with the camera at cam
  function draw(c, cam, wx, wy, t, o) {
    if (!P) build();
    const still = !!(o && o.motion === false) || !!(RB.game && RB.game.reducedMotion && RB.game.reducedMotion());
    const f = frameFor(poseAt(Math.max(0, t), still));
    const x = Math.round(wx - FOOT.x - cam.x), y = Math.round(wy - FOOT.y - cam.y);
    if (!o || o.light !== false) {
      // her shadow: the silhouette laid on the ground toward the lower right, and a darker contact under her feet
      const fy = y + FOOT.y, sk = 0.95;
      c.save();
      c.globalAlpha = 0.55;
      c.globalCompositeOperation = 'multiply';
      c.setTransform(1, 0, -0.8 * sk, -0.36 * sk, 0.8 * sk * fy, fy * (1 + 0.36 * sk));
      c.drawImage(silhouette(f), x, y);
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.fillStyle = 'rgb(60,50,96)';
      c.globalAlpha = 0.45;
      c.beginPath(); c.ellipse(x + FOOT.x + 1, fy, 8, 2.2, 0, 0, Math.PI * 2); c.fill();
      c.restore();
    }
    c.drawImage(f.cv, x, y);
  }

  return { build, draw, frameFor, poseAt, FW, FH, FOOT };
})();
