/* Art-resolution character sprites (32×48, drawn at 2 art px per logical px).
 * RB.sprites.getArt(look, dir, frame) redraws every look parameter of the
 * 16×24 sprites at double detail: faces with blinking eyes, hands, costume
 * folds and trims, hair in shaded locks with a highlight, a selective dark
 * outline and real walk poses (planted/lifted feet, arm swing, head bob,
 * trailing hair and cloth). Frames: 0 stand, 1 and 2 steps, 3 blink.
 * Left is the mirrored right view. Results are cached per variant. */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const P = RB.pix, SP = RB.sprites;
  const W = 32, H = 48;
  const shade = P.shade, mix = P.mix;

  // ---- palette for one look ---------------------------------------------------------------
  function hairRamp(h) {
    const [h0, h1, h2] = h;
    const l1 = h1 && P.lum(h1) > P.lum(h0) + 0.02 ? mix(h1, shade(h0, 1), 0.3) : shade(h0, 1);
    const l2 = h2 && P.lum(h2) > P.lum(l1) ? h2 : shade(h0, 2);
    return [shade(h0, -2), shade(h0, -1), h0, l1, l2];
  }
  const pcache = new Map();
  function palette(look) {
    const col = SP.colorsOf(look);
    const k = JSON.stringify([col, look.wrapCol, look.hoodCol, look.outlineCol]);
    let p = pcache.get(k);
    if (p) return p;
    const [sk, sd] = col.skin;
    const [cm, cs, ca] = col.cloth;
    const skin = { L: shade(sk, 1), S: sk, s: mix(sd, shade(sk, -1), 0.4), z: shade(sd, -1) };
    p = {
      skin, sk: [skin.z, skin.s, skin.S, skin.L],
      hair: hairRamp(col.hair),
      wrap: P.ramp(look.wrapCol || ca),
      stubble: hairRamp(col.hair).map((c) => mix(c, sk, 0.4)),
      cl: P.ramp(cm, cs), ac: [shade(ca, -1), ca, shade(ca, 1)],
      pa: [shade(col.pants, -1), col.pants, shade(col.pants, 1)],
      bo: [shade(col.boots, -1), col.boots, shade(col.boots, 1)],
      eye: '#2a1e26', iris: '#4a3440', white: '#fff8ee',
      mouth: mix(sd, '#8a3a3a', 0.45), blush: P.alpha('#e8807a', 0.4),
      ol: look.outlineCol || '#241c20',
    };
    pcache.set(k, p);
    if (pcache.size > 300) pcache.delete(pcache.keys().next().value);
    return p;
  }

  // ---- hair masks and shading ---------------------------------------------------------------
  // A mask is stamped from parts [x, y, rows]; '#' pixels are shaded automatically (locks radiating
  // from a parting point, a broken highlight band on the lit side, shadowed lower/right edges), digits
  // 1-5 force a ramp step, 'x' removes a pixel from the mask.
  function newMask() { return { px: new Map() }; }
  function stamp(m, parts, dx, dy) {
    for (const [x, y, rows] of parts) {
      for (let j = 0; j < rows.length; j++) {
        const r = rows[j];
        for (let i = 0; i < r.length; i++) {
          const ch = r[i];
          if (ch === '.' || ch === ' ') continue;
          const key = (x + i + (dx || 0)) + ',' + (y + j + (dy || 0));
          if (ch === 'x') m.px.delete(key); else m.px.set(key, ch);
        }
      }
    }
    return m;
  }
  // Locks: the mask is split into angular sectors around the parting point (o.ox, o.oy). Each lock is
  // lit on the side facing the upper-left light and dark on the other, so neighbouring locks meet in
  // a dark seam against a lit edge — clusters, not speckle. A highlight band crosses the locks at
  // radius h0..h1 on the lit side of the head; lower and right edges fall into shadow.
  function shadeMask(b, m, R, o) {
    const has = (x, y) => m.px.has(x + ',' + y);
    const st = o.step || 30, r0 = o.r0 == null ? 5 : o.r0;
    for (const [key, ch] of m.px) {
      const c = key.indexOf(',');
      const x = +key.slice(0, c), y = +key.slice(c + 1);
      let v;
      if (ch >= '1' && ch <= '5') v = +ch;
      else {
        v = 3;
        const dx = x + 0.5 - o.ox, dy = y + 0.5 - o.oy, r = Math.hypot(dx, dy);
        const th = Math.atan2(dy, dx);
        const u = ((th * 180) / Math.PI - (o.phase || 0)) / st, fr = u - Math.floor(u);
        const lit = Math.sin(th) - Math.cos(th) >= 0; // increasing angle moves towards the light
        const q = lit ? fr : 1 - fr;                  // 1 = lit edge of the lock, 0 = shadow edge
        const w = st * (Math.PI / 180) * r;           // lock width in pixels here
        if (r > r0 && w > 2.5) {
          if (q * w < 0.9) v = 2;
          else if ((1 - q) * w < (w > 5 ? 1.8 : 1.1)) v = 4;
        }
        if (o.h0 != null && r >= o.h0 && r < o.h1 && dx < (o.hx == null ? 2 : o.hx)) {
          v = q * w < 0.9 && r > r0 ? 3 : r >= o.h0 + 0.7 && r < o.h1 - 0.6 && dx < (o.hx == null ? 2 : o.hx) - 2 ? 5 : 4;
        }
        const eB = !has(x, y + 1) && !(o.blend && b.alphaAt(x, y + 1)), eR = !has(x + 1, y), eL = !has(x - 1, y), eT = !has(x, y - 1);
        if (eB) v = Math.min(v, eR || eL ? 1 : 2);
        else if (eR && dx > 1) v = Math.min(v, 2);
        else if ((eT || eL) && dx < -1 && dy < 8 && v === 3) v = 4;
      }
      b.put(x, y, P.rgba(R[v - 1]));
    }
  }

  // ---- shared shapes --------------------------------------------------------------------------
  // Faces: S skin, s shade, z deep shade, L light.
  const FACE_D = [
    '....SSSSSSSS....',
    '..SSSSSSSSSSSS..',
    '.SSSSSSSSSSSSSS.',
    '.SSSSSSSSSSSSSS.',
    'SSSSSSSSSSSSSSSs',
    'SSSSSSSSSSSSSSSs',
    'LSSSSSSSSSSSSSSs',
    'LSSSSSSSSSSSSSss',
    'LSSSSSSSSSSSSSss',
    'SSSSSSSSSSSSSSss',
    'SSSSSSSSSSSSSSss',
    '.SSSSSSSSSSSSSs.',
    '.SSSSSSSSSSSSss.',
    '..SSSSSSSSSSss..',
    '...sSSSSSSSss...',
    '.....ssssss.....',
  ];
  const FACE_S = [
    '.....SSSSSSSS...',
    '...SSSSSSSSSSS..',
    '..SSSSSSSSSSSSS.',
    '.SSSSSSSSSSSSSS.',
    '.SSSSSSSSSSSSSSS',
    'SSSSSSSSSSSSSSSS',
    'SSSSSSSSSSSSSSSS',
    'sSSSSSSSSSSSSSSSS',
    'sSSSSSSSSSSSSSSSL',
    'sSSSSSSSSSSSSSSS',
    'sSSSSSSSSSSSSSSs',
    '.sSSSSSSSSSSSSs.',
    '.sSSSSSSSSSSSSs.',
    '..sSSSSSSSSSSs..',
    '...zsSSSSSSss...',
    '.....zssssss....',
  ];

  // ---- the figure ---------------------------------------------------------------------------------
  // Geometry (adult): head/face rows 6-21, neck 22, shoulders 23, belt 30-31, tunic hem 34, legs to 41,
  // boots 42-46. Children keep the head, lower it by 7 and shorten the body; old people stoop a pixel.
  const SHAPES = ['tunic', 'apron', 'coat', 'robe', 'dress'];
  function geom(look, f) {
    const child = look.size === 'child';
    const g = child
      ? { hy: 7, top: 30, belt: 35, hem: 38, boot: 43 }
      : { hy: look.age === 'old' ? 1 : 0, top: 23, belt: 30, hem: 34, boot: 42 };
    g.child = child; g.f = f;
    g.bob = f === 1 || f === 2 ? 1 : 0; // step frames sit one pixel lower
    g.foot = 46;
    g.shape = SHAPES.includes(look.shape) ? look.shape : 'tunic';
    g.t = g.top + g.bob; g.bt = g.belt + g.bob;
    const hy = g.belt + 1 + g.bob; // top row of each 3×3 hand in the front/back views
    // f1: right arm (screen right) swings forward and drops, the left one rises; f2 the reverse
    g.hands = [hy + (f === 1 ? -1 : f === 2 ? 1 : 0), hy + (f === 1 ? 1 : f === 2 ? -1 : 0)];
    g.low = { tunic: g.hem, apron: g.hem, coat: g.hem + (child ? 3 : 6), robe: 44, dress: child ? 42 : 41 }[g.shape];
    g.apronLow = g.hem + (child ? 3 : 5);
    return g;
  }
  const IVORY = ['#b8ab94', '#d8ccb4', '#ece4d4', '#f8f2e6'];

  // ---- down / up (front and back views share the body) -------------------------------------------
  function legsDown(b, look, p, g, f) {
    const pa = p.pa, bo = p.bo;
    const lift = [f === 2 ? 2 : 0, f === 1 ? 2 : 0]; // f1: screen-left foot planted, right lifted
    const robe = g.shape === 'robe';
    const lt = g.shape === 'dress' ? g.low + 1 : g.hem + 1;
    for (let s = 0; s < 2; s++) {
      const x = s ? 17 : 11, L = lift[s];
      const by = robe ? g.foot - 1 - L : Math.max(lt, g.boot - L);
      if (robe) { // only the feet show beneath a robe; the lifted one hides under the hem
        if (!L) { b.rect(x, by, 4, 2, bo[1]); b.rect(x, by, 4, 1, bo[2]); b.rect(x, g.foot, 4, 1, bo[0]); }
        continue;
      }
      if (by > lt) {
        b.rect(x, lt, 4, by - lt, pa[1]);
        b.rect(x + (s ? 3 : 0), lt, 1, by - lt, s ? pa[0] : pa[2]);
        b.rect(x + 1, lt + 1, 1, Math.min(2, by - lt - 1), s ? pa[1] : pa[2]);
      }
      // boot: cuff, shaft, toe; a lifted foot shows its darker sole
      const bx = x - (s ? 0 : 1);
      b.rect(bx, by, 5, g.foot - by + 1 - L, bo[1]);
      b.rect(bx, by, 5, 1, bo[2]);
      b.rect(s ? x + 4 : x - 1, by + 1, 1, g.foot - by - L, bo[0]);
      b.px(s ? x : x - 1, by + 1, bo[2]);
      if (L) b.rect(bx, g.foot - L, 5, 1, bo[0]);
      else b.rect(bx, g.foot, 5, 1, bo[0]);
    }
    if (!robe && g.shape !== 'dress') b.rect(15, lt, 2, 2, pa[0]);
  }

  function garmentDown(b, look, p, g, up) {
    const C = p.cl, A = p.ac, sh = g.shape;
    const t = g.t, bt = g.bt, hm = g.hem, low = g.low;
    // chest: lit left flank and shoulder, shaded right flank
    b.rect(11, t, 10, 1, C[2]);
    b.rect(9, t + 1, 14, bt - t - 1, C[2]);
    b.rect(9, t + 1, 1, bt - t - 1, C[3]);
    b.rect(11, t, 3, 1, C[3]);
    b.rect(10, t + 1, 2, 2, C[4]);
    b.rect(21, t + 1, 2, bt - t - 1, C[1]);
    b.rect(22, t + 3, 1, bt - t - 3, C[0]);
    // below the waist
    const flare = (y) => (sh === 'dress' ? Math.floor((y - bt - 2) / 3) : sh === 'robe' ? (y > low - 3 ? 1 : 0) : sh === 'coat' ? (y > bt + 5 ? 1 : 0) : 0);
    for (let y = bt + 2; y <= low; y++) {
      const e = flare(y), x0 = 9 - e, x1 = 22 + e;
      const gap = sh === 'coat' && !up && y > bt + 2 ? (y > bt + 5 ? [14, 17] : [15, 16]) : null;
      if (gap) { b.rect(x0, y, gap[0] - x0, 1, C[2]); b.rect(gap[1] + 1, y, x1 - gap[1], 1, C[2]); }
      else b.rect(x0, y, x1 - x0 + 1, 1, C[2]);
      b.px(x0, y, C[3]);
      b.rect(x1 - 1, y, 2, 1, C[1]);
      b.px(x1, y, C[0]);
    }
    b.rect(9, bt + 2, 14, 1, C[1]); // shadow under the belt
    if (sh === 'tunic' || sh === 'apron') {
      b.rect(9, hm, 14, 1, C[1]);
      if (!up) b.rect(15, bt + 3, 1, hm - bt - 2, C[1]);
    }
    if (sh === 'coat') {
      // the coat parts below the waist, showing the legs; lit edges on the opening
      if (!up) { b.rect(13, bt + 3, 1, low - bt - 2, C[3]); b.rect(18, bt + 3, 1, low - bt - 2, C[1]); }
      else { for (let y = bt + 3; y <= low; y++) { b.px(15, y, C[0]); b.px(16, y, C[1]); } b.rect(14, bt + 3, 1, 1, C[1]); }
      if (up) b.rect(8, low, 16, 1, C[1]);
      else { b.rect(8, low, 6, 1, C[1]); b.rect(18, low, 6, 1, C[0]); }
      if (!up) { b.rect(10, bt + 4, 3, 1, C[1]); b.rect(19, bt + 4, 3, 1, C[0]); } // pocket flaps
    }
    if (sh === 'robe') {
      // long straight folds and a hem band
      b.rect(12, bt + 3, 1, low - bt - 4, C[1]);
      b.rect(19, bt + 3, 1, low - bt - 4, C[1]);
      b.rect(13, bt + 3, 1, low - bt - 4, C[3]);
      b.rect(8, low - 1, 16, 1, C[1]);
      b.rect(8, low, 16, 1, C[0]);
      if (!up) b.line(17, bt + 2, 18, low - 2, C[1]); // overlap of the front panels
      else b.rect(15, bt + 3, 1, low - bt - 4, C[1]);
      // the hem lifts over the stepping foot
      if (g.f === 1) { for (let x = 17; x <= 23; x++) b.clear(x, low); }
      if (g.f === 2) { for (let x = 8; x <= 14; x++) b.clear(x, low); }
    }
    if (sh === 'dress') {
      // pleats catch the light on their left side
      for (const px of [12, 16, 20]) {
        for (let y = bt + 4; y < low; y++) { const e = Math.floor((y - bt - 2) / 3); const xx = px + Math.round((px - 16) * e / 6); b.px(xx, y, C[1]); b.px(xx - 1, y, C[3]); }
      }
      const e = flare(low);
      b.rect(9 - e, low, 14 + 2 * e, 1, A[1]);
      b.rect(9 - e, low - 1, 14 + 2 * e, 1, C[1]);
    }
    // belt, sash or obi
    const obi = sh === 'robe';
    b.rect(9, bt - (obi ? 1 : 0), 14, obi ? 3 : 2, A[1]);
    b.rect(9, bt - (obi ? 1 : 0), 14, 1, A[2]);
    b.rect(21, bt - (obi ? 1 : 0), 2, obi ? 3 : 2, A[0]);
    if (obi && up) { b.rect(13, bt - 2, 6, 5, A[1]); b.rect(13, bt - 2, 6, 1, A[2]); b.rect(17, bt - 1, 2, 4, A[0]); b.rect(15, bt - 2, 2, 5, A[0]); }
    if (sh === 'dress') { const bx = up ? 14 : 19; b.rect(bx, bt - 1, 4, 3, A[1]); b.px(bx + 1, bt, A[0]); b.rect(bx + 1, bt + 2, 1, 3, A[1]); b.rect(bx + 3, bt + 2, 1, 2, A[0]); }
    // collars (front) and the back seam
    if (!up) {
      if (sh === 'coat') {
        b.rect(13, t - 1, 6, 1, C[3]); // standing collar
        b.line(12, t, 15, t + 4, C[3]); b.line(19, t, 16, t + 4, C[1]);
        b.rect(15, t, 2, 3, p.skin.s); b.rect(15, t + 1, 2, 2, A[1]);
        b.px(17, t + 5, A[2]); b.px(17, t + 8, A[2]);
      } else if (sh === 'robe') {
        b.line(18, t, 13, bt - 2, A[2]); b.line(19, t, 14, bt - 2, A[1]);
        b.line(13, t, 15, t + 2, IVORY[2]);
        b.rect(14, t, 4, 1, p.skin.s);
      } else if (sh === 'dress') {
        b.rect(13, t, 6, 1, p.skin.s); b.rect(14, t + 1, 4, 1, p.skin.s); b.rect(14, t + 1, 4, 1, p.skin.s);
        b.rect(13, t + 1, 1, 1, A[1]); b.rect(18, t + 1, 1, 1, A[0]); b.rect(14, t + 2, 4, 1, A[1]);
      } else {
        b.rect(14, t, 4, 1, p.skin.s);
        b.rect(15, t + 1, 2, 1, p.skin.s);
        b.rect(15, t + 2, 2, 1, p.skin.z);
        b.px(13, t, A[2]); b.px(14, t + 1, A[1]); b.px(18, t, A[1]); b.px(17, t + 1, A[0]);
        b.px(15, t + 3, A[1]); b.px(16, t + 3, A[0]);
      }
      if (sh === 'tunic' || sh === 'apron') { b.line(12, t + 3, 13, bt - 1, C[1]); b.line(19, t + 3, 18, bt - 1, C[1]); }
    } else {
      b.rect(12, t, 8, 1, C[3]);
      b.rect(13, t - 1, 6, 1, sh === 'coat' ? C[3] : p.skin.s);
      if (sh !== 'robe') { b.rect(15, t + 2, 2, bt - t - 2, C[1]); b.rect(15, t + 2, 1, bt - t - 2, C[0]); }
      b.line(11, t + 2, 12, bt - 1, C[1]); b.line(20, t + 2, 19, bt - 1, C[0]);
    }
    if (sh === 'apron') apronDown(b, p, g, up);
  }
  function apronDown(b, p, g, up) {
    const t = g.t, bt = g.bt, lo = g.apronLow;
    const I = IVORY;
    if (!up) {
      b.rect(12, t + 3, 8, bt - t - 3, I[2]);            // bib
      b.rect(12, t + 3, 8, 1, I[3]);
      b.rect(19, t + 3, 1, bt - t - 3, I[1]);
      b.px(12, t + 2, I[1]); b.px(19, t + 2, I[1]); b.px(12, t + 1, I[1]); b.px(19, t + 1, I[0]); // neck strap
      b.rect(10, bt, 12, 2, I[1]); b.rect(10, bt, 12, 1, I[2]); // waistband
      for (let y = bt + 2; y <= lo; y++) { const e = y > lo - 2 ? 1 : 0; b.rect(10 - e, y, 12 + 2 * e, 1, I[2]); b.px(10 - e, y, I[3]); b.rect(20 + e, y, 1, 1, I[1]); }
      b.rect(9, lo, 14, 1, I[1]);
      b.rect(13, bt + 3, 6, 3, I[1]); b.rect(13, bt + 3, 6, 1, I[0]); b.rect(14, bt + 4, 4, 1, I[2]); // pocket
      b.px(16, bt + 4, I[1]);
    } else {
      b.line(10, t + 1, 20, bt - 1, I[1]); b.line(21, t + 1, 11, bt - 1, I[2]); // crossed straps
      b.rect(9, bt, 14, 1, I[2]);
      b.rect(14, bt - 1, 4, 3, I[2]); b.rect(13, bt, 1, 2, I[1]); b.rect(18, bt, 1, 2, I[1]); // bow
      b.rect(14, bt + 2, 1, 4, I[1]); b.rect(17, bt + 2, 1, 3, I[1]);
    }
  }

  function armsDown(b, look, p, g, f, up) {
    const C = p.cl, sk = p.sk, t = g.t;
    const robe = g.shape === 'robe', puff = g.shape === 'dress';
    for (let s = 0; s < 2; s++) {
      const x = s ? 22 : 7, hy = g.hands[s];
      b.rect(x, t + 2, 3, hy - t - 2, C[2]);
      b.rect(x + (s ? 0 : 1), t + 1, 2, 1, s ? C[2] : C[3]);
      b.rect(x, t + 2, 1, hy - t - 2, s ? C[1] : C[3]);
      b.rect(x + 2, t + 2, 1, hy - t - 2, s ? C[0] : C[1]);
      if (puff) { b.rect(s ? 22 : 6, t + 1, 4, 3, C[2]); b.rect(s ? 22 : 6, t + 1, 2, 1, C[3]); b.rect(s ? 24 : 6, t + 3, 2, 1, C[1]); }
      if (robe) {
        // wide sleeve: the mouth flares outward and hangs past the wrist
        const ox = s ? x + 3 : x - 1;
        b.rect(ox, t + 5, 1, hy - t - 4, C[s ? 1 : 3]);
        b.rect(Math.min(x, ox), hy - 2, 4, 2, C[1]);
        b.rect(Math.min(x, ox), hy - 1, 4, 1, C[0]);
      } else b.rect(x, hy - 1, 3, 1, C[1]); // cuff
      b.rect(x, hy, 3, 3, sk[2]);
      b.rect(x, hy + 2, 3, 1, sk[1]);
      b.px(s ? x : x + 2, hy + 1, sk[1]);
      if (!s) b.px(x, hy, sk[3]);
    }
  }

  function headDown(b, look, p, g, blink) {
    const y0 = 6 + g.hy + g.bob;
    const sk = p.skin;
    b.rect(14, y0 + 16, 4, 2, sk.s); // neck
    b.rect(14, y0 + 16, 4, 1, sk.z);
    b.tpl(8, y0, FACE_D, sk);
    b.rect(7, y0 + 7, 1, 3, sk.S); b.px(7, y0 + 9, sk.s); // ears
    b.rect(24, y0 + 7, 1, 3, sk.s); b.px(24, y0 + 9, sk.z);
    const ey = y0 + 7;
    for (const x of [11, 19]) {
      if (blink) { b.rect(x, ey + 2, 2, 1, p.eye); continue; }
      b.rect(x, ey, 2, 3, p.iris);
      b.rect(x, ey, 2, 1, p.eye);
      b.px(x, ey + 1, p.white);
      b.px(x + 1, ey + 2, p.eye);
    }
    if (look.age === 'old') { b.px(10, ey + 3, sk.s); b.px(21, ey + 3, sk.s); }
    else { b.rect(9, ey + 3, 2, 1, p.blush); b.rect(21, ey + 3, 2, 1, p.blush); }
    b.rect(15, ey + 5, 2, 1, p.mouth);
    b.px(16, ey + 3, mix(sk.S, sk.s, 0.6));
  }
  function headUp(b, look, p, g) {
    const y0 = 6 + g.hy + g.bob;
    const sk = p.skin;
    b.rect(14, y0 + 15, 4, 3, sk.s);
    b.tpl(8, y0, FACE_D, { S: sk.S, s: sk.s, z: sk.z, L: sk.S });
    b.rect(7, y0 + 7, 1, 3, sk.S); b.rect(24, y0 + 7, 1, 3, sk.s);
  }

  // ---- side (facing right; left is mirrored) ------------------------------------------------------
  function sidePose(f) { return f === 1 ? [19, 9, 0, 1] : f === 2 ? [9, 19, 1, 0] : [15, 13, 0, 0]; }
  function legsSide(b, look, p, g, f) {
    const pa = p.pa, bo = p.bo, ft = g.foot;
    const robe = g.shape === 'robe';
    const lt = g.shape === 'dress' ? g.low + 1 : g.hem + 1;
    const pose = sidePose(f); // [near foot x, far foot x, near lifted, far lifted]
    const leg = (fx, lifted, near) => {
      const c = near ? pa : [shade(pa[0], -1), pa[0], pa[1]];
      const cb = near ? bo : [shade(bo[0], -1), bo[0], bo[1]];
      const hip = 14;
      const by = robe ? ft - 1 : Math.max(lt, g.boot - (lifted ? 1 : 0));
      if (robe && lifted) return;
      for (let y = lt; y < by && !robe; y++) {
        const k = (y - lt) / Math.max(1, by - lt);
        const x = Math.round(hip + (fx - hip) * k);
        b.rect(x, y, 4, 1, c[1]);
        b.px(x, y, near ? c[2] : c[1]);
        b.px(x + 3, y, c[0]);
      }
      b.rect(fx, by, 4, ft - by + 1 - (lifted ? 1 : 0), cb[1]);
      b.rect(fx, by, 4, 1, cb[2]);
      if (!lifted) { b.rect(fx + 4, ft - 1, 2, 2, cb[1]); b.rect(fx, ft, 6, 1, cb[0]); b.px(fx + 5, ft - 1, cb[2]); }
      else { b.rect(fx + 3, ft - 1, 2, 1, cb[1]); b.rect(fx, ft - 1, 3, 1, cb[0]); b.px(fx - 1, ft - 2, cb[0]); }
    };
    leg(pose[1], pose[3], false);
    leg(pose[0], pose[2], true);
  }
  function garmentSide(b, look, p, g) {
    const C = p.cl, A = p.ac, sh = g.shape;
    const t = g.t, bt = g.bt, hm = g.hem, low = g.low, f = g.f;
    b.rect(12, t, 8, 1, C[2]);
    b.rect(11, t + 1, 10, bt - t, C[2]);
    b.rect(11, t + 1, 1, bt - t, C[1]); // back
    b.rect(12, t + 1, 2, 3, C[3]);
    b.rect(19, t + 2, 2, bt - t - 2, C[3]); // chest catches the light
    b.px(20, t + 2, C[4]);
    // below the waist; long garments swing with the stride
    const sway = f === 1 ? 1 : f === 2 ? -1 : 0;
    for (let y = bt + 2; y <= low; y++) {
      let x0 = 11, x1 = 20;
      const k = y - bt - 2;
      if (sh === 'dress') { const e = Math.floor(k / 3); x0 -= e; x1 += e; }
      if (sh === 'robe' && y > low - 4) { x0 -= 1; x1 += 1; }
      if (sh === 'coat' && k > 3) { x0 -= 1 + (k > 6 ? 1 : 0); }
      if ((sh === 'robe' || sh === 'dress' || sh === 'coat') && k > 4) { x0 += sway * (k > 8 ? 1 : 0) - (sh === 'coat' && f ? 1 : 0); x1 += sway * (k > 6 ? 1 : 0); }
      b.rect(x0, y, x1 - x0 + 1, 1, C[2]);
      b.px(x0, y, C[1]);
      b.px(x1, y, C[1]);
      if (x1 - 1 > x0) b.px(x1 - 1, y, C[3]);
    }
    b.rect(11, bt + 2, 10, 1, C[1]);
    if (sh === 'tunic' || sh === 'apron') b.rect(11, hm, 10, 1, C[1]);
    if (sh === 'coat') { for (let y = bt + 2; y <= low; y++) b.px(19, y, C[1]); b.rect(9 - (f ? 1 : 0), low, 12, 1, C[1]); b.px(19, t + 5, A[2]); b.px(19, t + 8, A[2]); }
    if (sh === 'robe') { b.rect(10, low, 12, 1, C[0]); b.line(19, t + 1, 16, bt - 2, A[2]); b.rect(15, bt + 3, 1, low - bt - 4, C[1]); }
    if (sh === 'dress') { const e = Math.floor((low - bt - 2) / 3); b.rect(11 - e, low, 10 + 2 * e, 1, A[1]); for (let y = bt + 4; y < low; y++) b.px(15 + Math.floor((y - bt - 2) / 6), y, C[1]); }
    const obi = sh === 'robe';
    b.rect(11, bt - (obi ? 1 : 0), 10, obi ? 3 : 2, A[1]);
    b.rect(11, bt - (obi ? 1 : 0), 10, 1, A[2]);
    if (obi) { b.rect(8, bt - 2, 4, 5, A[1]); b.rect(8, bt - 2, 4, 1, A[2]); b.rect(8, bt + 1, 2, 2, A[0]); }
    if (sh === 'dress') { b.rect(8, bt - 1, 4, 3, A[1]); b.rect(8, bt + 2, 1, 3, A[1]); b.rect(10, bt + 2, 1, 2, A[0]); }
    if (sh === 'coat') { b.rect(18, t - 1, 3, 2, C[3]); } else { b.rect(17, t, 3, 1, p.skin.s); b.px(19, t + 1, A[1]); b.px(17, t + 1, A[1]); }
    if (sh === 'apron') {
      const I = IVORY, lo = g.apronLow;
      b.rect(18, t + 3, 3, bt - t - 3, I[2]); b.px(20, t + 3, I[3]); b.px(19, t + 2, I[1]); b.px(18, t + 1, I[1]);
      for (let y = bt; y <= lo; y++) { const e = y > bt + 3 ? 1 : 0; b.rect(18, y, 3 + e, 1, I[2]); b.px(18, y, I[1]); }
      b.rect(18, lo, 4, 1, I[1]);
      b.rect(11, bt, 7, 1, I[1]); b.rect(8, bt - 1, 3, 3, I[2]); b.px(8, bt + 2, I[1]); b.px(10, bt + 3, I[1]);
    }
  }
  function sideHand(g, near) {
    const f = g.f;
    const fw = near ? (f === 2 ? 1 : f === 1 ? -1 : 0) : f === 1 ? 1 : f === 2 ? -1 : 0;
    const t = g.t + 1, len = g.belt - g.top + 1;
    return { x: 15 + fw * 4, y: t + len - Math.abs(fw), fw, t };
  }
  function armSide(b, look, p, g, near) {
    const C = near ? p.cl : p.cl.map((c) => shade(c, -1));
    const sk = near ? p.sk : p.sk.map((c) => shade(c, -1));
    const { x: hx, y: hy, fw, t } = sideHand(g, near);
    const robe = g.shape === 'robe';
    for (let y = t; y < hy; y++) {
      const k = (y - t) / Math.max(1, hy - t);
      const x = Math.round(14 + (hx - 15) * k);
      b.rect(x, y, 4, 1, C[2]);
      b.px(x, y, C[1]);
      b.px(x + 3, y, near ? C[3] : C[2]);
      if (robe && y > t + 3) b.px(x - 1, y, C[1]);
    }
    if (g.shape === 'dress') { b.rect(13, t, 5, 2, C[2]); b.rect(14, t, 3, 1, C[3]); }
    const cx = hx - 1 + (fw > 0 ? 1 : 0);
    b.rect(cx - (robe ? 1 : 0), hy - 1, robe ? 5 : 4, robe ? 2 : 1, C[1]);
    b.rect(cx, hy + (robe ? 1 : 0), 3, 3, sk[2]);
    b.rect(cx, hy + 2 + (robe ? 1 : 0), 3, 1, sk[1]);
    b.px(cx + 2, hy + (robe ? 1 : 0), sk[3]);
  }
  function headSide(b, look, p, g, blink) {
    const y0 = 6 + g.hy + g.bob;
    const sk = p.skin;
    b.rect(15, y0 + 16, 4, 2, sk.s);
    b.rect(15, y0 + 16, 4, 1, sk.z);
    b.tpl(8, y0, FACE_S, sk);
    b.rect(13, y0 + 7, 2, 3, sk.s); b.px(13, y0 + 8, sk.z); // ear
    const ey = y0 + 7;
    if (blink) b.rect(20, ey + 2, 2, 1, p.eye);
    else { b.rect(20, ey, 2, 3, p.iris); b.rect(20, ey, 2, 1, p.eye); b.px(21, ey + 1, p.white); b.px(20, ey + 2, p.eye); }
    if (look.age !== 'old') b.rect(20, ey + 3, 2, 1, p.blush);
    b.px(23, ey + 5, p.mouth);
    b.px(24, ey + 2, sk.S);
  }

  // ---- hair styles --------------------------------------------------------------------------------
  // Masks in span notation: sp(y0, 'a-b,c-d|e-f|...') gives one row per '|' starting at y0; 'a-b:4'
  // forces ramp step 4 on that span; '*n' repeats a row n times.
  function sp(y0, str) {
    const parts = [];
    let y = y0;
    for (let row of str.split('|')) {
      let rep = 1;
      const star = row.indexOf('*');
      if (star >= 0) { rep = +row.slice(star + 1); row = row.slice(0, star); }
      for (let k = 0; k < rep; k++, y++) {
        if (!row) continue;
        for (const seg of row.split(',')) {
          const [rng, force] = seg.split(':');
          const [a, bb] = rng.split('-').map(Number);
          const x1 = bb == null || Number.isNaN(bb) ? a : bb;
          parts.push([a, y, [(force || '#').repeat(x1 - a + 1)]]);
        }
      }
    }
    return parts;
  }
  const BRAID_SEG = ['.43.', '4332', '3221'];
  const braid = (x, y, n, w3) => {
    const rows = [];
    for (let i = 0; i < n; i++) rows.push(...(w3 ? ['43.', '332', '221'] : BRAID_SEG));
    return [[x, y, rows]];
  };
  // down (facing the viewer): face x 8-23, rows 6-21
  const CAP_D = sp(2, '11-20|9-22|8-23|7-24|6-25*5');
  const CAP_TIGHT_D = sp(3, '11-20|9-22|8-23|7-24|6-25*4');
  const BANGS_D = sp(11, '6-14,16-25|6-10,12-14,16-19,21-25|6-8,13,17-18,23-25');
  const SIDES_D = sp(14, '6-8,23-25|7-8,23-24');
  const NAPE_U = sp(11, '6-25*2|7-24*2|8-23|9-22|10-21|12-19');
  const SIDE_CAP = sp(2, '11-19|9-21|8-22|7-23|7-24|6-24*3|6-23');
  const SIDE_BANGS = sp(11, '6-13,15-18,20-22|6-13,16-18,21|6-12,17-18|7-12|8-12|9-11');
  const TIE = (look, p) => look.tieCol || p.ac[1];
  const HAIR = {
    short: {
      down: { front: [{ parts: [...CAP_D, ...BANGS_D, ...SIDES_D] }] },
      up: { front: [{ parts: [...CAP_D, ...NAPE_U] }] },
      side: { front: [{ parts: [...SIDE_CAP, ...SIDE_BANGS] }] },
    },
    bob: {
      down: { front: [{ parts: [...CAP_D, ...sp(7, '5-26*4|5-25|5-13,15-18,20-26|5-8,23-26*6|5-9,22-26|6-9,22-25|7-8,23-24')] }] },
      up: { front: [{ parts: [...CAP_D, ...sp(7, '5-26*13|5-26|6-25')] }] },
      side: { front: [{ parts: [...SIDE_CAP, ...sp(6, '5*5'), ...sp(11, '5-13,15-18,20-22|5-14,16-18,21|5-14,16-18|5-14,17-18*3|5-14|6-14|6-13|7-12')] }] },
    },
    long: {
      down: {
        back: [{ parts: sp(8, '5-26*19|6-25*2|7-24|9-22'), o: [16, 4] }],
        front: [{ parts: [...CAP_D, ...BANGS_D, ...sp(14, '6-8,23-25*11|7-8,23-24|7,24')] }],
      },
      up: { front: [{ parts: [...CAP_D, ...sp(7, '5-26*4'), ...sp(11, '5-26*18|5-26|6-25|6-10,12-19,21-25|7-9,13-18,22-24|14-17')] }] },
      side: {
        back: [{ parts: sp(8, '5-12*16|5-11*5|6-11|6-10|7-10|8-9'), o: [10, 3] }],
        front: [{ parts: [...SIDE_CAP, ...sp(11, '6-13,15-18,20-22|6-14,16-18,21|6-14,17-18|6-14*2|6-13*2')], blend: true }],
      },
    },
    wavy: {
      down: {
        back: [{ parts: sp(8, '5-26*2|4-27*3|5-26*3|5-27|4-27*2|5-26*3|4-27*2|5-27|5-26*2|6-26|5-25|6-25|7-24|9-22'), o: [16, 4] }],
        front: [{ parts: [...CAP_D, ...BANGS_D, ...sp(14, '6-8,23-25*2|5-7,24-26*3|6-8,23-25*3|5-7,24-26*3|6-8,23-25*2|5-6,25-26|5,26')] }],
      },
      up: { front: [{ parts: [...CAP_D, ...sp(7, '5-26*4'), ...sp(11, '5-26*2|4-27*3|5-26*3|5-27|4-27*2|5-26*3|4-27*2|5-26*2|6-25|6-26|7-24|9-22')] }] },
      side: {
        back: [{ parts: sp(8, '5-12*3|4-11*3|5-12*3|4-11*3|5-12*3|4-11*3|5-11|6-11|6-10|7-9'), o: [10, 3] }],
        front: [{ parts: [...SIDE_CAP, ...sp(11, '6-13,15-18,20-22|6-14,16-18,21|6-14,17-18|5-14*2|6-13*2')], blend: true }],
      },
    },
    ponytail: {
      down: {
        back: [{ parts: sp(12, '24-26*4|24-27|25-27*4|25-26*2|26'), o: [24, 8], sway: 1 }],
        front: [{ parts: [...CAP_D, ...BANGS_D, ...SIDES_D] }],
      },
      up: {
        front: [
          { parts: [...CAP_D, ...NAPE_U] },
          { parts: sp(8, '14-17*2|13-18*12|14-17*4|15-16*2'), o: [16, 8], sway: 1, tie: [14, 9, 4, 2] },
        ],
      },
      side: {
        back: [{ parts: sp(5, '5-8|4-8|3-7*2|3-6*5|4-6*5|5-6*2|5'), o: [8, 5], sway: -1, tie: [6, 5, 3, 3] }],
        front: [{ parts: [...SIDE_CAP, ...SIDE_BANGS] }],
      },
    },
    bun: {
      down: { front: [{ parts: [...CAP_TIGHT_D, ...BANGS_D, ...SIDES_D] }, { parts: sp(0, '13-18|12-19*3|13-18'), o: [15, 0], h: [1, 3] }] },
      up: { front: [{ parts: [...CAP_TIGHT_D, ...NAPE_U] }, { parts: sp(2, '13-18|12-19*3|13-18'), o: [15, 2], h: [1, 3] }] },
      side: { front: [{ parts: [...SIDE_CAP, ...SIDE_BANGS] }, { parts: sp(1, '6-10|5-11*3|6-10'), o: [7, 1], h: [1, 3] }] },
    },
    braid: {
      down: { front: [{ parts: [...CAP_D, ...BANGS_D, ...SIDES_D] }, { parts: [...braid(23, 16, 4), [24, 28, ['23', '.2']]], raw: true, tie: [23, 28, 4, 1], sway: 1 }] },
      up: { front: [{ parts: [...CAP_D, ...NAPE_U] }, { parts: [...braid(14, 17, 4), [15, 29, ['23', '.2']]], raw: true, tie: [14, 29, 4, 1], sway: 1 }] },
      side: { back: [{ parts: [...braid(8, 15, 4, true), [8, 27, ['23', '2.']]], raw: true, tie: [8, 27, 3, 1], sway: -1 }], front: [{ parts: [...SIDE_CAP, ...SIDE_BANGS] }] },
    },
    twintails: {
      down: {
        back: [
          { parts: sp(9, '4-6|3-6*13|3-5*4|4-5'), o: [6, 8], sway: -1 },
          { parts: sp(9, '25-27|25-28*13|26-28*4|26-27'), o: [25, 8], sway: 1 },
        ],
        front: [{ parts: [...CAP_D, ...BANGS_D, ...SIDES_D], ties: [[5, 8, 3, 3], [24, 8, 3, 3]] }],
      },
      up: {
        front: [
          { parts: [...CAP_D, ...NAPE_U], ties: [[5, 8, 3, 3], [24, 8, 3, 3]] },
          { parts: sp(10, '3-6*13|3-5*4|4-5'), o: [6, 8], sway: -1 },
          { parts: sp(10, '25-28*13|26-28*4|26-27'), o: [25, 8], sway: 1 },
        ],
      },
      side: {
        back: [{ parts: sp(9, '8-10|7-10*12|7-9*4|8-9'), o: [9, 8], sway: -1 }],
        front: [{ parts: [...SIDE_CAP, ...SIDE_BANGS], ties: [[8, 8, 3, 2]] }],
      },
    },
    curly: {
      down: { front: [{ parts: sp(1, '12-14,17-19|9-22|7-24|6-25|5-26|4-27*6|4-9,11-14,17-20,22-27|4-8,12-13,18-19,23-27|4-7,24-27*4|5-7,24-26|5-6,25-26'), mode: 'curl' }] },
      up: { front: [{ parts: sp(1, '12-14,17-19|9-22|7-24|6-25|5-26|4-27*11|5-26|6-25|8-23|10-21'), mode: 'curl' }] },
      side: { front: [{ parts: sp(1, '11-13,16-18|8-21|6-23|5-24|5-25|4-25*6|4-14,16-19,21-23|4-14,17-18|4-14|5-14|5-13|6-13|7-12'), mode: 'curl' }] },
    },
    spiky: {
      down: { front: [{ parts: [...sp(0, '10,15,21|10-11,14-16,20-21|10-21'), ...sp(3, '9-22|8-23|7-24|6-25*5'), ...sp(7, '4-5,26-27|5,26'), ...sp(11, '6-10,12-15,17-20,22-25|6-8,10,13-15,18-20,23-25|6-7,13-14,18-19,24-25'), ...SIDES_D] }] },
      up: { front: [{ parts: [...sp(0, '10,15,21|10-11,14-16,20-21|10-21'), ...sp(3, '9-22|8-23|7-24|6-25*5'), ...sp(7, '4-5,26-27|5,26'), ...sp(11, '6-25*2|7-24*2|8-23|9-22|10-21|11-12,14-17,19-20')] }] },
      side: { front: [{ parts: [...sp(0, '9,14,19|9-10,13-15,18-20|9-21'), ...sp(3, '8-22|7-23|7-23'), ...sp(5, '3-6|4-6'), ...sp(6, '7-24*3|5-24|6-23'), ...sp(11, '4-13,15-18,20-22|6-13,16-18,21|6-12,17-18|5-12|8-12|9-11')] }] },
    },
    shaved: {
      down: { front: [{ parts: sp(3, '12-19|10-21|9-22|8-23*4|8-9,22-23|8,23'), ramp: 'stubble' }] },
      up: { front: [{ parts: sp(3, '12-19|10-21|9-22|8-23*10|9-22|10-21|12-19'), ramp: 'stubble' }] },
      side: { front: [{ parts: sp(3, '11-19|9-21|8-22|8-23*3|8-22|8-13|8-12*2|9-12|9-11|10-11'), ramp: 'stubble' }] },
    },
    wrap: {
      down: { front: [{ parts: [...sp(1, '11-20|9-22|8-23|7-24*6|6-25:4|6-25:2'), ...sp(12, '6-8,23-25*3|7-8,23-24*2')], ramp: 'wrap', mode: 'fold' }, { parts: sp(1, '20-22|19-23|20-22'), ramp: 'wrap', mode: 'knot' }] },
      up: { front: [{ parts: [...sp(1, '11-20|9-22|8-23|7-24*6|6-25*3|7-24|8-23|9-22|10-21')], ramp: 'wrap', mode: 'fold' }, { parts: sp(15, '13-18|14-17|13-18|14-15,17-18*2|14,18'), ramp: 'wrap', mode: 'knot' }] },
      side: { back: [{ parts: sp(8, '4-7*2|3-6*2|4-6*2|4-5*2|5'), ramp: 'wrap', mode: 'fold', sway: -1 }], front: [{ parts: [...sp(1, '11-19|9-21|8-22|7-23|7-24*5|6-24:4|6-23:2'), ...sp(12, '7-12*3|8-12')], ramp: 'wrap', mode: 'fold' }, { parts: sp(2, '7-9|6-10|7-9'), ramp: 'wrap', mode: 'knot' }] },
    },
  };
  HAIR.bald = { down: {}, up: {}, side: {} };
  const ORIGIN = { down: [16, 1], up: [16, 4], side: [19, 2] };
  const BAND = { down: [3.2, 5.4, 1], up: [4.6, 6.8, 1], side: [3.4, 5.6, 0] };

  // Curls: shaded discs on a jittered grid, laid from the bottom up so each curl overlaps the one
  // below with its shadowed rim; the lit top-left of every curl catches a highlight.
  function curlShade(b, m, R, g) {
    let x0 = 99, y0 = 99, x1 = -99, y1 = -99;
    for (const key of m.px.keys()) { const c = key.indexOf(','); const x = +key.slice(0, c), y = +key.slice(c + 1); x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    const val = new Map();
    const cells = [];
    for (let gy = y0, row = 0; gy <= y1 + 2; gy += 3, row++) {
      for (let gx = x0 - 1 + (row % 2) * 2; gx <= x1 + 2; gx += 4) cells.push([gx + (RB.tiles.hh(gx, gy, 5) % 2), gy + (RB.tiles.hh(gx, gy, 6) % 2)]);
    }
    cells.sort((a, bb) => bb[1] - a[1]);
    for (const [cx, cy] of cells) {
      for (let y = cy - 3; y <= cy + 3; y++) for (let x = cx - 3; x <= cx + 3; x++) {
        const key = x + ',' + y;
        if (!m.px.has(key)) continue;
        const dx = x - cx, dy = y - cy, d2 = dx * dx + dy * dy;
        if (d2 > 6.3) continue;
        const t = dx + dy;
        let v = t <= -2 ? 4 : t >= 2 ? 2 : 3;
        if (d2 > 4 && t > 0) v = 1;
        if (v === 4 && y < 9 + g && x < 17) v = 5;
        val.set(key, v);
      }
    }
    for (const [key, ch] of m.px) {
      const c = key.indexOf(',');
      let v = val.get(key) || 2;
      if (ch >= '1' && ch <= '5') v = +ch;
      b.put(+key.slice(0, c), +key.slice(c + 1), P.rgba(R[v - 1]));
    }
  }
  function foldShade(b, m, R, knot) {
    const has = (x, y) => m.px.has(x + ',' + y);
    for (const [key, ch] of m.px) {
      const c = key.indexOf(',');
      const x = +key.slice(0, c), y = +key.slice(c + 1);
      let v = 3;
      if (knot) v = !has(x, y + 1) || !has(x + 1, y) ? 2 : !has(x, y - 1) || !has(x - 1, y) ? 5 : 4;
      else {
        // broad wound bands rising gently to the right, each lit on its upper edge
        const u = (y + x * 0.3 + 40) / 4.2, fr = u - Math.floor(u);
        v = fr < 0.24 ? 2 : fr > 0.7 ? 4 : 3;
        if (!has(x, y + 1) || (!has(x + 1, y) && x > 16)) v = Math.min(v, 2);
        else if ((!has(x, y - 1) || !has(x - 1, y)) && x < 16 && v === 3) v = 4;
      }
      if (ch >= '1' && ch <= '5') v = +ch;
      b.put(x, y, P.rgba(R[v - 1]));
    }
  }
  function drawHair(b, look, p, g, d, layer, f) {
    const st = HAIR[look.hair] || HAIR.short;
    const groups = st[d] && st[d][layer];
    if (!groups) return;
    const dy = g.hy + g.bob;
    for (const G of groups) {
      const sw = G.sway && f ? G.sway * (d === 'side' ? 1 : f === 1 ? 1 : -1) : 0;
      const m = stamp(newMask(), G.parts, sw, dy);
      const R = G.ramp === 'wrap' ? p.wrap : G.ramp === 'stubble' ? p.stubble : p.hair;
      if (G.raw) {
        for (const [key, ch] of m.px) { const c = key.indexOf(','); b.put(+key.slice(0, c), +key.slice(c + 1), P.rgba(R[(ch >= '1' && ch <= '5' ? +ch : 3) - 1])); }
      } else if (G.mode === 'curl') curlShade(b, m, R, dy);
      else if (G.mode === 'fold' || G.mode === 'knot') foldShade(b, m, R, G.mode === 'knot');
      else {
        const o = G.o || ORIGIN[d];
        const band = G.h ? [G.h[0], G.h[1], 1] : G.o ? null : BAND[d];
        shadeMask(b, m, R, { blend: G.blend, ox: o[0] + sw, oy: o[1] + dy, h0: band ? band[0] : null, h1: band ? band[1] : null, hx: band ? band[2] : 1, r0: G.ramp === 'stubble' ? 99 : 5 });
      }
      const tie = (t) => { b.rect(t[0] + sw, t[1] + dy, t[2], t[3], TIE(look, p)); b.rect(t[0] + sw, t[1] + dy + t[3] - 1, t[2], 1, shade(TIE(look, p), -1)); };
      if (G.tie) tie(G.tie);
      if (G.ties) G.ties.forEach(tie);
    }
  }

  // ---- accessories --------------------------------------------------------------------------------
  // Each accessory draws itself for a view ('down', 'up', 'side') and a layer: 'back' (behind the
  // body), 'body' (over the clothes, under the head) or 'head' (over the hair).
  const r3 = (c) => [shade(c, -1), c, shade(c, 1)];
  const GOLD = ['#a8842c', '#e8c860', '#fff0a8'];
  const LEATHER = ['#5a3e22', '#8a6a3a', '#b08e58'];
  const STRAP = '#6a4a2a';
  function lantern(b, x, y, small) {
    // hanging lantern: bail, dark cap, glowing paper body with ribs, dark foot (x,y = top-left of the body)
    const w = small ? 3 : 4, h = small ? 3 : 4;
    b.px(x + (w >> 1), y - 2, '#3a3440');
    b.rect(x, y - 1, w, 1, '#3a3440');
    b.rect(x, y, w, h, '#ffd27a');
    b.rect(x, y, 1, h, '#fff0b8');
    b.rect(x + w - 1, y, 1, h, '#e8a040');
    if (!small) b.rect(x + 2, y, 1, h, '#f0b050');
    b.rect(x, y + h, w, 1, '#3a3440');
  }
  const ACC = {
    scarf(b, look, p, g, d, L) {
      // seen from behind (the battle party) the wrap and tail lie over long hair, so they still show
      if (L !== (d === 'up' ? 'head' : 'body')) return;
      const R = r3(look.scarfCol || '#c8962e'), t = g.t;
      const S = look.scarfStripe ? r3(look.scarfStripe) : null; // a knitted stripe (a keepsake scarf)
      if (d === 'side') {
        b.rect(14, t - 1, 7, 3, R[1]); b.rect(14, t - 1, 7, 1, R[2]); b.rect(14, t + 1, 7, 1, R[0]);
        const fl = g.f ? 1 : 0; // the tail streams behind and lifts with the stride
        b.rect(10, t, 4, 2, R[1]); b.rect(8, t + 1 - fl, 3, 2, R[1]); b.rect(7, t + 2 - fl, 2, 2, R[0]); b.px(10, t, R[2]);
        if (S) { for (const x of [16, 19]) { b.rect(x, t - 1, 1, 3, S[1]); b.px(x, t - 1, S[2]); } b.rect(11, t, 1, 2, S[1]); b.rect(8, t + 1 - fl, 1, 2, S[1]); }
      } else {
        b.rect(12, t - 1, 8, 1, R[1]); b.rect(11, t, 10, 2, R[1]); b.rect(11, t, 10, 1, R[2]); b.rect(11, t + 1, 10, 1, R[1]);
        b.rect(11, t + 2, 10, 1, R[0]); b.px(12, t, shade(R[2], 1));
        const tx = d === 'down' ? 17 : 12, sw = g.f === 1 ? 1 : g.f === 2 ? -1 : 0;
        b.rect(tx, t + 2, 3, 6, R[1]); b.rect(tx, t + 2, 1, 6, R[2]); b.rect(tx + 2, t + 2, 1, 6, R[0]);
        b.rect(tx + sw, t + 8, 3, 1, R[1]); b.px(tx + sw, t + 9, R[0]); b.px(tx + 2 + sw, t + 9, R[0]);
        if (S) {
          for (const x of [13, 16, 19]) { b.rect(x, t, 1, 3, S[1]); b.px(x, t, S[2]); }
          for (const y of [t + 4, t + 6]) { b.rect(tx, y, 3, 1, S[1]); b.px(tx, y, S[2]); }
        }
      }
    },
    satchel(b, look, p, g, d, L) {
      const t = g.t, bt = g.bt, big = look.bigSatchel;
      const bag = (x, y) => {
        const w = big ? 7 : 6, h = big ? 7 : 6;
        if (big) { b.rect(x + 1, y - 2, w - 3, 2, '#f0e8d4'); b.rect(x + 2, y - 3, 2, 1, '#f8f2e4'); b.px(x + 4, y - 2, '#c8b890'); }
        b.rect(x, y, w, h, LEATHER[1]);
        b.rect(x, y, w, 3, LEATHER[2]); // flap
        b.rect(x, y + 3, w, 1, LEATHER[0]);
        b.rect(x + w - 1, y, 1, h, LEATHER[0]);
        b.px(x + (w >> 1), y + 2, GOLD[1]);
      };
      if (d === 'down') {
        if (L !== 'body') return;
        b.line(11, t, 20, bt - 1, STRAP, 1); b.line(12, t, 21, bt - 1, LEATHER[0], 1);
        bag(big ? 19 : 20, bt - 2);
      } else if (d === 'up') {
        if (L !== 'body') return;
        b.line(20, t, 11, bt - 1, STRAP, 1); b.line(21, t, 12, bt - 1, LEATHER[0], 1);
        bag(big ? 5 : 6, bt - 2);
      } else {
        if (L === 'back') bag(big ? 6 : 7, bt - 2);
        if (L === 'body') { b.line(18, t, 13, bt, STRAP); }
      }
    },
    glasses(b, look, p, g, d, L) {
      if (L !== 'face') return;
      const y = 6 + g.hy + g.bob + 6, fc = look.glassCol || '#4a3e48', hi = P.alpha('#f4fbff', 0.5);
      // thin round rims a pixel clear of the eye, a bright glint on each lens, a bridge
      if (d === 'down') {
        for (const x of [10, 18]) {
          b.rect(x + 1, y, 2, 1, fc); b.px(x, y + 1, fc); b.px(x + 3, y + 1, fc); b.px(x, y + 2, fc); b.px(x + 3, y + 2, fc);
          b.rect(x + 1, y + 4, 2, 1, fc); b.px(x, y + 3, fc); b.px(x + 3, y + 3, fc);
          b.px(x + 2, y + 1, hi);
        }
        b.rect(14, y + 1, 4, 1, fc);
      } else if (d === 'side') {
        b.rect(20, y, 2, 1, fc); b.rect(19, y + 1, 1, 3, fc); b.rect(22, y + 1, 1, 3, fc); b.rect(20, y + 4, 2, 1, fc);
        b.rect(15, y + 1, 4, 1, fc); b.px(21, y + 1, hi);
      }
    },
    headband(b, look, p, g, d, L) {
      if (L !== 'head') return;
      const R = r3(look.bandCol || p.ac[1]), y = 10 + g.hy + g.bob;
      if (d === 'side') {
        b.rect(6, y, 19, 2, R[1]); b.rect(6, y, 19, 1, R[2]);
        const fl = g.f ? 1 : 0;
        b.rect(3, y + 1 - fl, 4, 1, R[1]); b.rect(2, y + 2 - fl, 3, 1, R[0]); b.rect(4, y + 2, 2, 2, R[1]);
      } else {
        b.rect(6, y, 20, 2, R[1]); b.rect(6, y, 20, 1, R[2]); b.rect(22, y, 4, 2, R[0]); b.px(8, y, shade(R[2], 1));
        if (d === 'up') { b.rect(14, y - 1, 4, 4, R[1]); b.px(14, y - 1, R[2]); b.rect(14, y + 3, 1, 3, R[1]); b.rect(17, y + 3, 1, 4, R[0]); }
      }
    },
    flower(b, look, p, g, d, L) {
      if (L !== 'head') return;
      // five petals round a small yellow heart, lit from the upper left, and a leaf
      const c = look.flowerCol || '#f4a6a0', R = r3(c), y = 5 + g.hy + g.bob;
      const x = d === 'side' ? 10 : 21;
      b.rect(x + 1, y, 3, 5, R[1]); b.rect(x, y + 1, 5, 3, R[1]);
      b.px(x + 1, y, R[2]); b.px(x + 2, y, R[2]); b.px(x, y + 1, R[2]); b.px(x, y + 2, R[2]);
      b.px(x + 4, y + 3, R[0]); b.px(x + 3, y + 4, R[0]); b.px(x + 2, y + 4, R[0]);
      b.px(x + 2, y + 1, '#fff4c0'); b.rect(x + 1, y + 2, 3, 1, '#fff4c0'); b.px(x + 2, y + 3, '#fff4c0'); b.px(x + 2, y + 2, '#e8b050');
      if (d !== 'up') { b.px(x - 1, y + 4, '#5a8a4a'); b.px(x, y + 5, '#4a7a3a'); }
    },
    hat(b, look, p, g, d, L) {
      if (L !== 'head') return;
      const c = look.hatCol || '#8a6a44', R = [shade(c, -2), shade(c, -1), c, shade(c, 1), shade(c, 2)];
      const y = g.hy + g.bob;
      if (d === 'side') {
        b.rect(10, y + 2, 12, 7, R[2]); b.rect(12, y + 1, 8, 1, R[2]); b.rect(10, y + 2, 12, 1, R[3]); b.rect(11, y + 1, 4, 1, R[3]);
        b.rect(10, y + 6, 12, 2, R[1]);
        b.rect(3, y + 8, 27, 2, R[2]); b.rect(3, y + 8, 27, 1, R[3]); b.rect(4, y + 10, 25, 1, R[0]);
      } else {
        b.rect(10, y + 1, 12, 7, R[2]); b.rect(12, y, 8, 1, R[2]);
        b.rect(10, y + 1, 4, 5, R[3]); b.rect(12, y, 3, 1, R[3]); b.px(11, y + 2, R[4]);
        b.rect(19, y + 1, 3, 6, R[1]);
        b.rect(10, y + 6, 12, 2, R[1]); b.rect(10, y + 6, 12, 1, shade(R[1], -1)); // band
        b.oval(2, y + 7, 29, y + 11, R[2]);
        b.rect(3, y + 8, 26, 1, R[3]);
        b.oval(4, y + 10, 27, y + 11, R[1]);
        b.rect(8, y + 12, 16, 1, P.alpha('#1a1020', 0.3));
      }
    },
    earrings(b, look, p, g, d, L) {
      // drops hanging below each ear, drawn over the hair so no hairstyle hides them (and from behind too)
      if (L !== 'head') return;
      const R = look.earCol ? r3(look.earCol) : GOLD, y = 6 + g.hy + g.bob + 10;
      const drop = (x) => { // a hook and a round drop, 3 wide
        b.px(x + 1, y, '#8a6a2a'); b.px(x + 1, y + 1, R[1]);
        b.rect(x, y + 2, 3, 3, R[1]); b.px(x, y + 2, R[2]); b.px(x + 1, y + 2, R[2]); b.px(x, y + 3, R[2]); b.px(x + 2, y + 4, R[0]);
        b.px(x + 1, y + 5, R[0]);
      };
      if (d === 'side') drop(12);
      else { drop(5); drop(24); }
    },
    cape(b, look, p, g, d, L) {
      const c = look.capeCol || '#6a3a4a', R = [shade(c, -2), shade(c, -1), c, shade(c, 1)];
      const t = g.t, lo = g.hem + 4;
      if (d === 'down') {
        if (L === 'back') { b.rect(5, t + 2, 3, lo - t - 2, R[1]); b.rect(24, t + 2, 3, lo - t - 2, R[0]); b.rect(5, t + 2, 1, lo - t - 2, R[2]); }
        if (L === 'body') { b.rect(10, t - 1, 12, 2, R[2]); b.rect(8, t, 3, 3, R[2]); b.rect(21, t, 3, 3, R[1]); b.rect(10, t - 1, 12, 1, R[3]); b.rect(15, t, 2, 2, GOLD[1]); b.px(15, t, GOLD[2]); }
      } else if (d === 'up') {
        if (L !== 'body') return;
        for (let y = t - 1; y <= lo; y++) { const e = Math.floor((y - t) / 5); const sw = g.f && y > lo - 4 ? (g.f === 1 ? 1 : -1) : 0; b.rect(8 - e + sw, y, 16 + 2 * e, 1, R[2]); b.px(8 - e + sw, y, R[3]); b.px(23 + e + sw, y, R[1]); }
        for (const x of [12, 16, 20]) b.rect(x, t + 3, 1, lo - t - 3, R[1]);
        b.rect(13, t + 3, 1, lo - t - 3, R[3]);
        b.rect(9, lo, 15, 1, R[1]);
        b.rect(10, t - 1, 12, 1, R[3]);
      } else {
        if (L !== 'back') return;
        const sw = g.f ? 1 : 0;
        for (let y = t; y <= lo; y++) { const e = Math.floor((y - t) / 4) + (y > lo - 5 ? sw : 0); b.rect(12 - e - 2, y, 4 + e, 1, R[2]); b.px(12 - e - 2, y, R[1]); }
        b.rect(16, t - 1, 4, 2, R[2]);
      }
    },
    lamp(b, look, p, g, d, L) {
      if (d === 'side') { if (L !== 'hand') return; const h = sideHand(g, true); lantern(b, h.x - 1 + (h.fw > 0 ? 1 : 0), h.y + 5); b.rect(h.x + (h.fw > 0 ? 1 : 0), h.y + 2, 1, 2, '#3a3440'); return; }
      if (L !== 'body') return;
      const hy = g.hands[1];
      b.rect(23, hy + 3, 1, 2, '#3a3440');
      lantern(b, 22, hy + 6);
    },
    ribbon(b, look, p, g, d, L) {
      if (L !== 'head') return;
      const R = r3(look.ribbonCol || '#c85a6a'), y = 2 + g.hy + g.bob;
      const x = d === 'down' ? 20 : d === 'up' ? 7 : 6;
      b.rect(x, y, 3, 3, R[1]); b.rect(x + 4, y, 3, 3, R[1]); b.rect(x + 3, y + 1, 1, 2, R[0]);
      b.px(x, y, R[2]); b.px(x + 4, y, R[2]); b.px(x + 2, y + 2, R[0]); b.px(x + 6, y + 2, R[0]);
      b.rect(x + 2, y + 3, 1, 4, R[1]); b.rect(x + 4, y + 3, 1, 3, R[0]);
    },
    // Keepsakes from the road (items worn in the keepsake slot)
    bell(b, look, p, g, d, L) {
      // a little bell on a red cord round the neck; from behind, the cord's bow at the nape
      const R = look.bellCol ? r3(look.bellCol) : GOLD, cord = look.cordCol || '#b8342a', t = g.t;
      const O = '#4a3418';
      const bell = (x, y) => { // loop, a dark-rimmed dome, flared lip, mouth and clapper (5 wide), clear on any cloth
        b.px(x + 2, y, cord);
        b.rect(x + 1, y + 1, 3, 1, O);
        b.px(x, y + 2, O); b.px(x + 4, y + 2, O); b.rect(x + 1, y + 2, 3, 1, R[1]); b.px(x + 1, y + 2, R[2]);
        b.px(x, y + 3, O); b.px(x + 4, y + 3, O); b.rect(x + 1, y + 3, 3, 1, R[1]); b.px(x + 3, y + 3, R[0]);
        b.rect(x, y + 4, 5, 1, R[1]); b.px(x, y + 4, R[2]); b.px(x + 4, y + 4, R[0]);
        b.rect(x + 1, y + 5, 3, 1, O); b.px(x + 2, y + 5, '#1e140a');
      };
      // (front: over the neck and any long hair, which would otherwise hide the cord and the bell's top)
      if (d === 'down') { if (L === 'head') { b.rect(13, t - 1, 6, 1, cord); b.px(12, t - 2, cord); b.px(19, t - 2, cord); b.px(15, t, cord); bell(13, t + 1); } }
      else if (d === 'side') { if (L === 'hand') { b.rect(15, t - 1, 5, 1, cord); bell(18, t); } }
      else if (L === 'head') {
        const k = shade(cord, -1);
        b.rect(12, t - 2, 8, 1, cord);
        b.rect(12, t - 4, 3, 2, cord); b.rect(17, t - 4, 3, 2, cord); b.px(12, t - 4, shade(cord, 1));
        b.rect(15, t - 3, 2, 2, k); b.px(14, t - 1, cord); b.px(17, t - 1, k); b.px(14, t, k); b.px(17, t, k);
      }
    },
    cap(b, look, p, g, d, L) {
      // a peaked cap (a ferry clerk's): round crown, dark band with a brass badge, a stiff peak
      if (L !== 'head') return;
      const c = look.capCol || '#2c4468', R = [shade(c, -2), shade(c, -1), c, shade(c, 1), shade(c, 2)];
      const y = g.hy + g.bob;
      if (d === 'side') {
        b.rect(11, y + 2, 9, 1, R[3]); b.rect(9, y + 3, 13, 5, R[2]); b.rect(9, y + 3, 13, 1, R[3]); b.rect(10, y + 4, 3, 2, R[4]);
        b.rect(9, y + 8, 13, 2, R[1]); b.rect(9, y + 9, 13, 1, R[0]);
        b.rect(18, y + 4, 3, 3, GOLD[1]); b.px(18, y + 4, GOLD[2]);
        b.rect(21, y + 9, 6, 2, R[0]); b.rect(21, y + 9, 6, 1, R[1]);
        return;
      }
      b.rect(11, y + 1, 10, 1, R[3]); b.rect(9, y + 2, 14, 6, R[2]);
      b.rect(9, y + 2, 5, 4, R[3]); b.px(10, y + 3, R[4]); b.px(11, y + 3, R[4]); b.rect(20, y + 2, 3, 6, R[1]);
      b.rect(8, y + 8, 16, 2, R[1]); b.rect(8, y + 9, 16, 1, R[0]);
      if (d === 'down') {
        b.rect(14, y + 4, 4, 3, GOLD[1]); b.px(14, y + 4, GOLD[2]); b.px(17, y + 6, GOLD[0]);
        b.rect(9, y + 10, 14, 2, R[0]); b.rect(10, y + 10, 12, 1, R[1]);
        b.rect(10, y + 12, 12, 1, P.alpha('#1a1020', 0.3));
      }
    },
    leaf(b, look, p, g, d, L) {
      // a maple leaf pinned in the hair: five points, lit from the upper left, a short stem
      if (L !== 'head') return;
      const R = r3(look.leafCol || '#c8452a'), y = 3 + g.hy + g.bob;
      const x = d === 'side' ? 8 : d === 'up' ? 5 : 20;
      b.px(x + 3, y, R[2]);
      b.px(x + 1, y + 1, R[2]); b.px(x + 3, y + 1, R[1]); b.px(x + 5, y + 1, R[1]);
      b.rect(x + 1, y + 2, 5, 1, R[1]); b.px(x + 1, y + 2, R[2]);
      b.rect(x, y + 3, 7, 1, R[1]); b.px(x, y + 3, R[2]); b.px(x + 6, y + 3, R[0]);
      b.rect(x + 1, y + 4, 5, 1, R[1]); b.px(x + 5, y + 4, R[0]);
      b.rect(x + 2, y + 5, 3, 1, R[0]);
      b.px(x + 3, y + 2, R[2]); b.px(x + 3, y + 3, R[2]); b.px(x + 3, y + 4, R[1]); // midrib
      b.px(x + 3, y + 6, '#6a4a2a'); // stem
    },
    bottles(b, look, p, g, d, L) {
      if (L !== 'body') return;
      const y = g.bt + 2;
      const bottle = (x, c, h) => { b.px(x, y, '#a88860'); b.rect(x, y + 1, 2, h, c); b.px(x, y + 1, shade(c, 2)); b.px(x + 1, y + h, shade(c, -1)); };
      if (d === 'down') { bottle(10, '#6ab0a0', 3); bottle(13, '#e0c070', 2); bottle(19, '#c8a0d0', 3); }
      else if (d === 'side') bottle(17, '#6ab0a0', 3);
      else bottle(12, '#6ab0a0', 3);
    },
    beard(b, look, p, g, d, L) {
      if (L !== 'face') return;
      const R = p.hair, y = 6 + g.hy + g.bob;
      if (d === 'down') {
        b.rect(10, y + 11, 12, 4, R[3]); b.rect(11, y + 15, 10, 1, R[3]); b.rect(13, y + 16, 6, 1, R[2]); b.rect(9, y + 9, 2, 3, R[3]); b.rect(21, y + 9, 2, 3, R[2]);
        b.rect(12, y + 13, 1, 3, R[2]); b.rect(16, y + 13, 1, 4, R[2]); b.rect(19, y + 12, 1, 3, R[2]); b.rect(10, y + 11, 2, 2, R[4]);
        b.rect(13, y + 11, 6, 1, R[2]); b.rect(15, y + 12, 2, 1, p.mouth); // moustache and mouth
      } else if (d === 'side') {
        b.rect(16, y + 10, 8, 5, R[3]); b.rect(17, y + 15, 6, 1, R[2]); b.rect(14, y + 9, 2, 4, R[3]);
        b.rect(19, y + 12, 1, 3, R[2]); b.rect(22, y + 11, 2, 1, R[2]); b.px(23, y + 12, p.mouth);
      }
    },
    cane(b, look, p, g, d, L) {
      if (d === 'side') { if (L !== 'hand') return; const h = sideHand(g, true); const x = h.x + 2 + (h.fw > 0 ? 1 : 0); b.rect(x, h.y - 1, 1, g.foot - h.y + 1, '#6a4a2a'); b.rect(x - 2, h.y - 1, 3, 1, '#8a6a44'); b.px(x, g.foot, '#3a2a1a'); return; }
      if (L !== 'body') return;
      const hy = g.hands[1];
      b.rect(25, hy - 1, 1, g.foot - hy + 1, '#6a4a2a'); b.rect(25, hy - 1, 1, g.foot - hy + 1, '#6a4a2a');
      b.rect(23, hy - 2, 3, 1, '#8a6a44'); b.px(22, hy - 1, '#8a6a44'); b.px(25, g.foot, '#3a2a1a');
    },
    basket(b, look, p, g, d, L) {
      const W1 = ['#7a5a2e', '#b08a4a', '#d0ac6a'];
      const bask = (x, y) => {
        b.rect(x, y, 7, 4, W1[1]); b.rect(x, y, 7, 1, W1[2]);
        for (let i = 0; i < 7; i += 2) b.px(x + i, y + 2, W1[0]);
        b.rect(x + 1, y + 4, 5, 1, W1[0]);
        b.line(x + 1, y - 1, x + 3, y - 3, W1[0]); b.line(x + 3, y - 3, x + 5, y - 1, W1[0]);
        b.px(x + 2, y - 1, '#e8a0a0'); b.px(x + 4, y - 1, '#a0c880');
      };
      if (d === 'down') { if (L === 'body') bask(2, g.hands[0] - 1); }
      else if (d === 'side') { if (L === 'hand') { const h = sideHand(g, true); bask(h.x - 3 + (h.fw > 0 ? 1 : 0), h.y + 2); } }
    },
    book(b, look, p, g, d, L) {
      if (d === 'down' && L === 'body') { const y = g.hands[0] - 3; b.rect(3, y, 5, 6, '#6a3a3a'); b.rect(3, y, 5, 1, '#8a4a44'); b.rect(7, y + 1, 1, 5, '#e8e0c8'); b.rect(3, y + 5, 5, 1, '#4a2828'); b.px(5, y + 2, GOLD[1]); }
      if (d === 'side' && L === 'hand') { const h = sideHand(g, true); b.rect(h.x - 1, h.y - 2, 5, 3, '#6a3a3a'); b.rect(h.x - 1, h.y - 2, 5, 1, '#e8e0c8'); }
    },
    hood(b0, look, p, g, d, L) {
      if (L !== 'head') return;
      const c = look.hoodCol || p.cl[1], R = [shade(c, -2), shade(c, -1), c, shade(c, 1)];
      const y = g.hy + g.bob;
      const b = new P.Buf(W, H);
      if (d === 'down') {
        b.oval(6, y + 1, 25, y + 17, R[2]);
        b.rect(5, y + 9, 3, 14, R[2]); b.rect(24, y + 9, 3, 14, R[1]); b.rect(5, y + 9, 1, 14, R[3]);
        b.rect(8, y + 21, 16, 3, R[2]); b.rect(8, y + 23, 16, 1, R[1]);
        for (let yy = y + 9; yy <= y + 21; yy++) for (let x = 9; x <= 22; x++) {
          const dx = (x + 0.5 - 16) / 7, dy = (yy + 0.5 - (y + 15.5)) / 7.5;
          if (dx * dx + dy * dy <= 1) b.clear(x, yy);
        }
        b.rect(8, y + 3, 6, 2, R[3]); b.px(9, y + 2, R[3]);
        for (let yy = y + 9; yy <= y + 20; yy++) { b.px(8, yy, R[3]); b.px(23, yy, R[0]); }
        b.rect(10, y + 8, 12, 1, R[3]);
      } else if (d === 'up') {
        b.oval(6, y + 1, 25, y + 21, R[2]);
        b.rect(7, y + 16, 18, 9, R[2]); b.rect(8, y + 25, 16, 1, R[1]);
        b.rect(8, y + 3, 5, 3, R[3]); b.rect(21, y + 6, 3, 16, R[1]); b.rect(15, y + 4, 1, 18, R[1]);
      } else {
        b.oval(6, y + 1, 23, y + 18, R[2]);
        b.rect(5, y + 10, 10, 15, R[2]); b.rect(5, y + 10, 1, 15, R[1]);
        b.rect(8, y + 3, 6, 2, R[3]);
        for (let yy = y + 5; yy <= y + 22; yy++) for (let x = 15; x <= 25; x++) { const dx = (x + 0.5 - 22) / 7, dy = (yy + 0.5 - (y + 14)) / 9; if (dx * dx + dy * dy <= 1) b.clear(x, yy); }
        for (let yy = y + 6; yy <= y + 21; yy++) { const dy = (yy + 0.5 - (y + 14)) / 9, xx = Math.ceil(22 - 7 * Math.sqrt(Math.max(0, 1 - dy * dy))) - 1; b.px(xx, yy, R[3]); }
      }
      b0.draw(b, 0, 0);
    },
    patches(b, look, p, g, d, L) {
      if (L !== 'body') return;
      const pc = ['#6a5c42', '#8a7a5a', '#a89a78'];
      const patch = (x, y) => { b.rect(x, y, 3, 3, pc[1]); b.rect(x, y, 3, 1, pc[2]); b.px(x + 2, y + 2, pc[0]); b.px(x + 1, y + 1, pc[0]); };
      if (d === 'down') { patch(11, g.t + 5); patch(18, g.hem + 3); }
      else if (d === 'up') patch(18, g.t + 4);
      else patch(15, g.t + 4);
    },
    toolbelt(b, look, p, g, d, L) {
      if (L !== 'body') return;
      const y = g.bt + 1;
      if (d === 'down') { b.rect(9, y, 14, 1, '#5a3a2a'); b.rect(10, y + 1, 3, 3, LEATHER[1]); b.rect(10, y + 1, 3, 1, LEATHER[2]); b.rect(20, y, 1, 5, '#8a6a44'); b.rect(19, y + 4, 3, 2, '#9a9aa0'); b.px(19, y + 4, '#c8c8d0'); }
      else if (d === 'side') { b.rect(11, y, 10, 1, '#5a3a2a'); b.rect(12, y + 1, 3, 3, LEATHER[1]); b.rect(18, y + 1, 1, 4, '#8a6a44'); b.rect(17, y + 4, 3, 2, '#9a9aa0'); }
      else { b.rect(9, y, 14, 1, '#5a3a2a'); b.rect(19, y + 1, 3, 3, LEATHER[1]); }
    },
    apronstrap() {},
    // Unwritten Atlas keepsakes (cosmetic reward items)
    atlas_sash(b, look, p, g, d, L) {
      const c = look.sashCol || '#d8c89a', ln = '#8a7a5a', dk = shade(c, -1);
      if (d === 'side') {
        // over the shoulder and down the chest, in front of the near arm (it hid the old strip)
        if (L !== 'hand') return;
        b.rect(14, g.t - 1, 6, 2, c); b.rect(14, g.t, 6, 1, dk);
        b.rect(19, g.t + 1, 2, g.bt - g.t + 1, c); b.rect(20, g.t + 1, 1, g.bt - g.t + 1, dk); b.px(19, g.t + 3, ln); b.px(19, g.t + 6, ln);
        return;
      }
      const [x0, x1] = d === 'down' ? [10, 21] : [21, 10];
      // the knot at the hip with its folded ends; from behind it lies over long hair, which covers the rest
      const knot = () => {
        const kx = x1 - 2, ky = g.bt + 1;
        b.rect(kx, ky, 4, 3, c); b.px(kx, ky, shade(c, 1)); b.rect(kx + 3, ky, 1, 3, dk);
        b.rect(kx, ky + 3, 2, 4, c); b.rect(kx + 2, ky + 3, 2, 3, dk); b.px(kx, ky + 5, ln);
      };
      if (d === 'up' && L === 'head') { knot(); return; }
      if (L !== 'body') return;
      b.line(x0, g.t, x1, g.bt + 1, c, 2);
      b.line(x0, g.t + 2, x1, g.bt + 3, dk);
      b.px(Math.round((x0 * 2 + x1) / 3), g.t + 3, ln); b.px(Math.round((x0 + x1 * 2) / 3), g.t + 6, ln);
      if (d === 'down') knot();
    },
    atlas_pin(b, look, p, g, d, L) {
      // a compass rose (four points round a blue heart) at the collar, over long hair; from behind, on the shoulder
      if (L !== (d === 'side' ? 'hand' : 'head')) return;
      const x = d === 'side' ? 16 : d === 'up' ? 17 : 9, y = g.t;
      b.rect(x + 3, y, 1, 7, GOLD[1]); b.rect(x, y + 3, 7, 1, GOLD[1]); b.rect(x + 2, y + 2, 3, 3, GOLD[1]);
      b.px(x + 3, y, GOLD[2]); b.px(x, y + 3, GOLD[2]); b.px(x + 2, y + 2, GOLD[2]);
      b.px(x + 6, y + 3, GOLD[0]); b.px(x + 3, y + 6, GOLD[0]); b.px(x + 4, y + 4, GOLD[0]);
      b.px(x + 3, y + 3, '#3a5a8a');
    },
    atlas_lamplet(b, look, p, g, d, L) {
      if (d === 'side') { if (L === 'body') lantern(b, 7, g.bt + 1, true); return; }
      if (L !== 'body') return;
      if (d === 'down') { b.rect(8, g.bt, 1, 2, '#3a3440'); lantern(b, 5, g.bt + 3, true); }
      else lantern(b, 24, g.bt + 3, true);
    },
    atlas_quill(b, look, p, g, d, L) {
      if (L !== 'head') return;
      const y = g.hy + g.bob;
      const x = d === 'side' ? 12 : d === 'up' ? 8 : 23;
      b.line(x, y + 12, x + 2, y + 2, '#f4f0e0', 1); b.line(x + 1, y + 11, x + 3, y + 3, '#d8d0bc', 1); b.px(x, y + 12, '#6a5a3a');
    },
  };
  // Accessories without art-resolution drawing (for example ones added by later content) fall back to
  // their 16-px drawing from the Atlas patch, placed at double size over the finished figure.
  function legacyAcc(b, fn, look, d, f) {
    const cv = SP.makeCanvas(16, 24);
    const c = cv.getContext('2d', { willReadFrequently: true });
    fn(c, look, d, f);
    const img = c.getImageData(0, 0, 16, 24).data;
    for (let y = 0; y < 24; y++) for (let x = 0; x < 16; x++) {
      const o = (y * 16 + x) * 4;
      if (img[o + 3] > 100) b.rect(x * 2, y * 2, 2, 2, [img[o], img[o + 1], img[o + 2], 255]);
    }
  }
  function accs(b, look, p, g, d, L) {
    for (const a of look.acc || []) {
      if (ACC[a]) ACC[a](b, look, p, g, d, L);
      else if (L === 'head' && RB.atlasArt && RB.atlasArt.ACC && RB.atlasArt.ACC[a]) legacyAcc(b, RB.atlasArt.ACC[a], look, d, g.f);
    }
  }

  // ---- composition -------------------------------------------------------------------------------
  function humanoid(b, look, d, f, blink) {
    const p = palette(look);
    const g = geom(look, f);
    if (d === 'down') {
      accs(b, look, p, g, d, 'back');
      drawHair(b, look, p, g, 'down', 'back', f);
      legsDown(b, look, p, g, f);
      garmentDown(b, look, p, g, false);
      armsDown(b, look, p, g, f, false);
      accs(b, look, p, g, d, 'body');
      headDown(b, look, p, g, blink);
      accs(b, look, p, g, d, 'face');
      drawHair(b, look, p, g, 'down', 'front', f);
      accs(b, look, p, g, d, 'head');
    } else if (d === 'up') {
      accs(b, look, p, g, d, 'back');
      legsDown(b, look, p, g, f);
      garmentDown(b, look, p, g, true);
      armsDown(b, look, p, g, f, true);
      headUp(b, look, p, g);
      accs(b, look, p, g, d, 'body');
      drawHair(b, look, p, g, 'up', 'back', f);
      drawHair(b, look, p, g, 'up', 'front', f);
      accs(b, look, p, g, d, 'head');
    } else {
      armSide(b, look, p, g, false);
      accs(b, look, p, g, d, 'back');
      drawHair(b, look, p, g, 'side', 'back', f);
      legsSide(b, look, p, g, f);
      garmentSide(b, look, p, g);
      accs(b, look, p, g, d, 'body');
      armSide(b, look, p, g, true);
      accs(b, look, p, g, d, 'hand');
      headSide(b, look, p, g, blink);
      accs(b, look, p, g, d, 'face');
      drawHair(b, look, p, g, 'side', 'front', f);
      accs(b, look, p, g, d, 'head');
    }
    return p;
  }

  // ---- entry point --------------------------------------------------------------------------------
  // Variants are keyed through RB.sprites.get: its cache already maps (look, dir, frame) to one small
  // canvas (including the Atlas accessory patch), so one key lookup per call serves both sizes.
  const art = new WeakMap();
  SP.customArt = SP.customArt || {};
  function build(look, dir, frame) {
    const side = dir === 'left' || dir === 'right';
    const d = side ? 'side' : dir === 'up' ? 'up' : 'down';
    const blink = frame === 3;
    const f = blink ? 0 : frame === 1 || frame === 2 ? frame : 0;
    let b = new P.Buf(W, H);
    let ol = look.outlineCol || '#241c20';
    if (look.custom) {
      const fn = SP.customArt[look.custom];
      if (fn) {
        const r = fn(b, look, d, f, blink);
        if (r && r.outline === false) ol = null;
        else if (r && r.outline) ol = r.outline;
      } else if (SP.custom[look.custom]) {
        // a creature without an art-resolution drawing (added by later content): its 16-px drawing,
        // doubled, then outlined at art resolution like everything else
        const cv = SP.makeCanvas(16, 24);
        const c = cv.getContext('2d', { willReadFrequently: true });
        SP.custom[look.custom](c, look, d, f, blink);
        const img = c.getImageData(0, 0, 16, 24).data;
        for (let y = 0; y < 24; y++) for (let x = 0; x < 16; x++) {
          const o = (y * 16 + x) * 4;
          if (img[o + 3] > 40) b.rect(x * 2, y * 2, 2, 2, [img[o], img[o + 1], img[o + 2], img[o + 3]]);
        }
      } else return null;
    } else humanoid(b, look, d, f, blink);
    if (ol) b.outline(ol);
    if (dir === 'left') b = b.mirror();
    return b.toCanvas();
  }
  SP.getArt = function (look, dir, frame) {
    if (!look) return null;
    const small = SP.get(look, dir, frame);
    let cv = art.get(small);
    if (cv === undefined) {
      cv = build(look, dir, frame);
      art.set(small, cv);
    }
    return cv;
  };
  SP.artW = W; SP.artH = H;
  SP._art = { palette, geom, hairRamp, HAIR };
})();
