/* Harmony portrait busts — the body kit: palettes and materials, the head in
 * a three-quarter view turned toward the shared action (screen right), eyes,
 * brows, mouths, the neck, garments, hands and the worn accessories.
 *
 * Everything is drawn at the bust's native art resolution with RB.pxkit
 * (hue-shifted material ramps, light from the upper left, clustered steps,
 * selective outlines in each material's own deep tone). Faces are never
 * rotated or resampled: features are authored pixel templates placed on
 * whole pixels, so an eye is the same drawing in every composition.
 *
 * Head space: the origin is the centre of the cranium, x to the right, y down,
 * in art px. The near side of the face (the character's right) is on the
 * left of the screen; the far side (the character's left) on the right. An
 * accessory worn on one side of the body keeps that side here: nothing is
 * mirrored. RB.harmonyArt (88_harmony_art.js) owns the API and the caches;
 * the hair styles are in 88_harmony_hair.js and the cast's poses in
 * 88_harmony_cast.js. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.harmonyKit = RB.harmonyKit || {};
(function (HK) {
  'use strict';
  const K = () => RB.pxkit;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

  // ---- materials ---------------------------------------------------------------------------------
  // n tones dark → light; `at` is the base colour's step. Outline tones come from the darkest step
  // (lineCol pulls them toward a near-black of the material's own hue family).
  const mats = new Map(), byName = new Map();
  function M(key, base, o) {
    const k = key + '|' + base + '|' + JSON.stringify(o || {});
    let m = mats.get(k);
    if (!m) {
      m = K().mat(base, o); mats.set(k, m);
      if (!byName.has(key)) byName.set(key, new Set());
      byName.get(key).add(m.id);
      if (mats.size > 4000) { mats.clear(); byName.clear(); }
    }
    return m;
  }
  // material ids made under a name (tests: which side of the bust a worn thing is drawn on)
  HK._matIds = (key) => [...(byName.get(key) || [])];
  const flat = (c, o) => K().solid(c, o);

  // Skin: six tones, shadows toward crimson and a little desaturated; a dark red-brown outline.
  // The ramp is built from the game's own authored pair for each skin (its light and its shadow tone, as the
  // road sprites and portraits use them): highlight, light, a step between, the shadow, then two deeper rose-
  // brown tones for creases and the outline — warm, never a saturated red.
  function skinMat(sk) {
    const P = K();
    const lt = P.parse(sk[0]), dk = P.parse(sk[1]);
    const mixh = (a, b, k) => P.hex(P.mix(a, P.parse(b), k));
    const cols = [mixh(dk, '#2a1018', 0.5), mixh(dk, '#4a1c26', 0.26), P.hex(dk), mixh(lt, dk, 0.52), P.hex(lt), mixh(lt, '#fff4e6', 0.32)];
    return M('skin', sk[0], { cols, at: 4, line: mixh(dk, '#24080e', 0.72), lineLit: mixh(dk, '#3a1418', 0.45) });
  }
  // Hair: six tones round the look's middle colour; dark hair keeps a cool sheen.
  function hairMat(h) {
    const P = K();
    const mid = h[1];
    const l = P.rgb2hsl(...P.parse(mid).slice(0, 3))[2];
    const dark = l < 0.22;
    return M('hair', mid, { n: 6, at: 3, step: dark ? 0.075 : 0.085, dk: 1.0, lt: dark ? 1.2 : 0.85, cool: 255, warm: dark ? 215 : 48, shift: 1.1, lineCol: dark ? '#0c0a14' : '#1c0c14' });
  }
  function clothMat(c, o) { return M('cloth', c, Object.assign({ n: 6, at: 3, step: 0.075, cool: 250, warm: 52, lineCol: '#120c1c' }, o)); }
  function metalMat(c) { return M('metal', c || '#e0b850', { n: 5, at: 3, step: 0.13, cool: 20, warm: 56, lineCol: '#2a1408' }); }
  function leatherMat(c) { return M('leather', c || '#8a6a3a', { n: 5, at: 3, step: 0.08, cool: 350, warm: 45, lineCol: '#1c0e08' }); }
  HK.M = M; HK.flat = flat; HK.skinMat = skinMat; HK.hairMat = hairMat; HK.clothMat = clothMat; HK.metalMat = metalMat; HK.leatherMat = leatherMat;

  // ---- raw pixel helpers (buffer space, no transform) --------------------------------------------
  function put(L, X, Y, Mt, k) {
    X |= 0; Y |= 0;
    if (X < 0 || Y < 0 || X >= L.w || Y >= L.h) return;
    const i = Y * L.w + X;
    L.px[i] = Mt.c[clamp(k == null ? Mt.base : k, 0, Mt.n - 1)]; L.mt[i] = Mt.id;
  }
  function get(L, X, Y) { return X < 0 || Y < 0 || X >= L.w || Y >= L.h ? 0 : L.px[Y * L.w + X]; }
  function matAt(L, X, Y) { return X < 0 || Y < 0 || X >= L.w || Y >= L.h ? 0 : L.mt[Y * L.w + X]; }
  // A template: rows of characters; map: char → [material, step] (or a function(i, j) → that).
  function tpl(L, X0, Y0, rows, map, flipX) {
    const w = rows.reduce((a, r) => Math.max(a, r.length), 0);
    for (let j = 0; j < rows.length; j++) for (let i = 0; i < rows[j].length; i++) {
      const e = map[rows[j][i]];
      if (!e) continue;
      const v = typeof e === 'function' ? e(i, j) : e;
      if (!v) continue;
      put(L, X0 + (flipX ? w - 1 - i : i), Y0 + j, v[0], v[1]);
    }
  }
  HK.put = put; HK.get = get; HK.matAt = matAt; HK.tpl = tpl;

  // ---- geometry helpers -------------------------------------------------------------------------
  function inEll(x, y, cx, cy, rx, ry) { const a = (x - cx) / rx, b = (y - cy) / (ry == null ? rx : ry); return a * a + b * b <= 1; }
  function inPoly(pts, x, y) {
    let c = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, yi] = pts[i], [xj, yj] = pts[j];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
    }
    return c;
  }
  HK.inEll = inEll; HK.inPoly = inPoly;

  // ---- the head ------------------------------------------------------------------------------------
  // The three-quarter head (head space). The cranium is an ellipse; the face below it a polygon whose
  // chin sits right of the centre line, since the face is turned to the right.
  const HEAD = {
    cr: { cx: 0, cy: -5, rx: 17.5, ry: 18.6 },
    jaw: [[-17.2, -6], [-17, 2], [-15.8, 7.5], [-13.4, 11.8], [-9.6, 15.6], [-5, 18.4], [-0.4, 20.2], [3.2, 21], [5.8, 20.4], [8.6, 18.2], [11.8, 14.2], [14.6, 9.4], [16.6, 4.4], [17.6, -0.6], [17.6, -6]],
    eyeN: { x: -6, y: 3 },   // near eye centre
    eyeF: { x: 9, y: 3 },    // far eye centre
    nose: { x: 4, y: 10 },
    mouth: { x: 6, y: 15 },
    ear: { x: -15.5, y: 4.5 },
  };
  HK.HEAD = HEAD;
  const inHead = (x, y) => inEll(x, y, HEAD.cr.cx, HEAD.cr.cy, HEAD.cr.rx, HEAD.cr.ry) || inPoly(HEAD.jaw, x, y);
  HK.inHead = inHead;

  // The face's skin as flat cel planes lit from the upper left: one broad lit plane, a highlight
  // cluster on the near cheekbone, a crisp shadow band down the far cheek that widens toward the chin.
  function head(L, hx, hy, sk) {
    for (let Y = hy - 26; Y <= hy + 23; Y++) for (let X = hx - 20; X <= hx + 20; X++) {
      const x = X + 0.5 - hx, y = Y + 0.5 - hy;
      if (!inHead(x, y)) continue;
      let k = 4;
      // the far cheek's shadow: two pixels in from the contour on the cheek, three at the jaw
      const band = y < 8 ? 2.2 : y < 14 ? 2.8 : 3.4;
      if (x > 3 && !inHead(x + band, y) && y > -10) k = 3;
      if (x > 6 && !inHead(x + 1.1, y) && y > 9) k = 2;
      // the chin's underside, toward the far side
      if (y > 15 && x > -2 && !inHead(x - 1, y + 1.6)) k = Math.min(k, 3);
      // a highlight cluster on the near cheekbone, and the lit side of the temple
      if (inEll(x, y, -8.6, 9.2, 3.4, 1.6)) k = 5;
      if (x < -12 && y < 4 && inHead(x - 1.4, y)) k = 5;
      put(L, X, Y, sk, k);
    }
  }
  // the near ear: rim, inner fold, the lobe
  function ear(L, hx, hy, sk) {
    const ex = hx + HEAD.ear.x, ey = hy + HEAD.ear.y;
    for (let Y = Math.floor(ey - 6); Y <= ey + 6; Y++) for (let X = Math.floor(ex - 4); X <= ex + 3; X++) {
      const x = X + 0.5 - ex, y = Y + 0.5 - ey;
      if (!inEll(x, y, 0, 0, 3, 5.2)) continue;
      let k = 4;
      if (inEll(x, y, 0.7, -0.6, 1.5, 3.1)) k = 2;
      if (inEll(x, y, 1.1, 0.4, 0.8, 1.8)) k = 3;
      if (x < -1.4 && y < 1.5) k = 5;
      if (y > 3.2) k = 3;
      put(L, X, Y, sk, k);
    }
  }
  // The neck under the jaw, in the head's shadow at the top. (Drawn on its own layer, behind the head.)
  function neck(L, hx, hy, sk, o) {
    o = o || {};
    const w0 = o.w || 13, x0 = hx - 8, top = hy + 8, bot = hy + (o.len || 36);
    for (let Y = top; Y <= bot; Y++) for (let X = x0 - 2; X <= x0 + w0 + 3; X++) {
      const y = Y - top, t = y / (bot - top);
      const l = x0 + 0.4 * y * 0.1 - t * 1.5, r = x0 + w0 + t * 1.8;
      if (X < l || X > r) continue;
      let k = 3;
      if (y < 9 + Math.round((X - x0) * 0.25)) k = 2;      // the jaw's shadow, sloping down to the far side
      if (X <= l + 1 && y > 6) k = 4;                       // the lit near edge
      if (X >= r - 1) k = Math.min(k, 2);
      put(L, X, Y, sk, k);
    }
  }
  HK.headFill = head; HK.ear = ear; HK.neck = neck;

  // ---- eyes ---------------------------------------------------------------------------------------
  // Authored eyes, near (outer corner on the left, looking right toward the action) and far (narrower,
  // outer corner on the right). k lash, K the lash's lighter end, w white, i iris (shaded by row:
  // the lash's shadow at the top, a light crescent below; the pupil and two glints are placed on it),
  // l the lower lid, c a crease line (skin shadow).
  const EYES = {
    round: {
      near: [
        '..kkkkkk..',
        '.kkkkkkkkk',
        'kkwiiiiikk',
        'k.wiiiiiwK',
        '..wiiiiiw.',
        '..wiiiiiw.',
        '...iiiiiw.',
        '....iiii..',
        '..lll.....',
      ],
      far: [
        '.kkkkk..',
        'kkkkkkkk',
        'Kwiiiikk',
        '.wiiiiwk',
        '.wiiiiw.',
        '.wiiiiw.',
        '..iiii..',
        '..iii...',
        '....ll..',
      ],
    },
    soft: {
      near: [
        '...kkkkk..',
        '.kkkkkkkkk',
        'kkkiiiiikK',
        '.wwiiiiiw.',
        '..wiiiiiw.',
        '..wiiiiiw.',
        '...iiiii..',
        '...lllll..',
      ],
      far: [
        '..kkkk..',
        '.kkkkkkk',
        'Kkiiiikk',
        '.wiiiiw.',
        '.wiiiiw.',
        '.wiiiiw.',
        '..iiii..',
        '..llll..',
      ],
    },
    narrow: {
      near: [
        '.kkkkkkkk.',
        'kkkkkkkkkk',
        'k.wiiiiiwK',
        '..wiiiiiw.',
        '..wiiiiiw.',
        '...iiiii..',
        '..lll.....',
      ],
      far: [
        'kkkkkkk.',
        'Kkkkkkkk',
        '.wiiiiwk',
        '.wiiiiw.',
        '.wiiiiw.',
        '..iiii..',
        '....ll..',
      ],
    },
    sharp: {
      near: [
        'k.........',
        'kkkkkkk...',
        '.kkkkkkkkk',
        '..kiiiiikK',
        '..wiiiiiw.',
        '..wiiiiiw.',
        '...iiiiw..',
        '....iii...',
        '...ll.....',
      ],
      far: [
        '.......k',
        '..kkkkkk',
        '.kkkkkkk',
        'Kwiiiik.',
        '.wiiiiw.',
        '.wiiiiw.',
        '..iiii..',
        '...ii...',
        '....l...',
      ],
    },
  };
  // A closed eye: 'up' (a smile or a wink, ∩) or 'down' (calm, ∪).
  const CLOSED = {
    up: {
      near: ['...kkkk...', '.kkkkkkkk.', 'kkk....kkK', 'k.........'],
      far: ['..kkkk..', '.kkkkkkk', 'Kk....kk', '.......k'],
    },
    down: {
      near: ['k.........', 'kkk....kkK', '.kkkkkkkk.', '...kkkk...'],
      far: ['.......k', 'Kk....kk', '.kkkkkkk', '..kkkk..'],
    },
  };
  HK.EYES = EYES; HK.CLOSED = CLOSED;

  // Draw one eye centred near (cx, cy). side: 'near' | 'far'. e: { style, closed: 'up'|'down',
  // smile (the cheek pushes the lower lid up two rows), lid (rows of the opening the upper lid covers) }.
  // C: face colours (lash, lashLt, lid, white, glint, iris, skin).
  function eye(L, cx, cy, side, e, C) {
    const st = EYES[e.style] ? e.style : 'round';
    if (e.closed) {
      const rows = CLOSED[e.closed][side];
      const w = rows[0].length;
      tpl(L, Math.round(cx - w / 2), Math.round(cy - 1), rows, { k: [C.lash, 0], K: [C.lashLt, 0] });
      return { closed: true };
    }
    const T = EYES[st][side];
    const w = T[0].length, h = T.length;
    const x0 = Math.round(cx - w / 2), y0 = Math.round(cy - h / 2);
    const ch = (i, j) => (T[j] && T[j][i]) || '.';
    const isOpen = (c) => c === 'w' || c === 'i';
    let j0 = 99, j1 = -1;
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if (isOpen(ch(i, j))) { j0 = Math.min(j0, j); j1 = Math.max(j1, j); }
    const lid = e.lid || 0, cut = e.smile ? 2 : 0;
    const top = j0 + lid, bot = j1 - cut;
    // the iris region and its rows
    let ii0 = 99, ii1 = -1, ij0 = 99, ij1 = -1;
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if (ch(i, j) === 'i') { ii0 = Math.min(ii0, i); ii1 = Math.max(ii1, i); ij0 = Math.min(ij0, j); ij1 = Math.max(ij1, j); }
    const pc = Math.round((ii0 + ii1) / 2); // the pupil's left column
    const n = ij1 - ij0 + 1;
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const c = ch(i, j);
      if (j < top || j > bot) continue;
      if (c === 'w') put(L, x0 + i, y0 + j, C.white, j === top ? 1 : 0);
      else if (c === 'i') {
        const r = j - ij0;
        let k = r <= 0 ? 0 : r >= n - 1 ? 3 : r >= n - 2 ? 2 : 1;
        if (j === top && r > 0) k = 0; // a lowered lid shades the iris top
        if ((i === pc || i === pc - 1 + (side === 'far' ? 1 : 0)) && r >= 1 && r <= Math.min(3, n - 3)) k = 0; // pupil
        put(L, x0 + i, y0 + j, C.iris, k);
      }
    }
    // glints: 2 × 2 at the iris's upper left (one row under a lowered lid), one pixel low right
    const gi = ii0 + (side === 'near' ? 0 : 0), gj = Math.max(ij0, top);
    for (const [i, j] of [[gi, gj], [gi + 1, gj], [gi, gj + 1], [gi + 1, gj + 1]]) if (j <= bot && ch(i, j) === 'i') put(L, x0 + i, y0 + j, C.glint, 0);
    const si = ii1 - 1, sj = Math.min(bot, ij1 - 1);
    if (sj > gj + 1 && ch(si, sj) === 'i') put(L, x0 + si, y0 + sj, C.glint, 0);
    // lashes and lids over everything
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const c = ch(i, j);
      if (c === 'k') put(L, x0 + i, y0 + j + (lid && j >= j0 - 1 ? 0 : 0), C.lash, 0);
      else if (c === 'K') put(L, x0 + i, y0 + j, C.lashLt, 0);
      else if (c === 'l' && !cut) put(L, x0 + i, y0 + j, C.lid, 0);
    }
    if (lid) { // a lowered upper lid: skin above the new lash line
      for (let j = j0; j < top; j++) for (let i = 0; i < w; i++) if (isOpen(ch(i, j))) put(L, x0 + i, y0 + j, C.lash, 0);
      for (let i = 0; i < w; i++) if (isOpen(ch(i, j0)) && j0 - 1 >= 0 && ch(i, j0 - 1) === 'k' && ch(i, j0 - 2) === 'k') put(L, x0 + i, y0 + j0 - 2, C.skin, 3);
    }
    if (cut) { // the cheek pushes the lower lid up
      for (let j = bot + 1; j < h; j++) for (let i = 0; i < w; i++) if (ch(i, j) !== '.' && ch(i, j) !== 'k' && ch(i, j) !== 'K') put(L, x0 + i, y0 + j, C.skin, 4);
      for (let i = 0; i < w; i++) if (isOpen(ch(i, bot + 1)) && isOpen(ch(i, bot))) put(L, x0 + i, y0 + bot + 1, C.lid, 0);
    }
    return { x0, y0, w, h };
  }
  HK.eye = eye;

  // ---- brows ---------------------------------------------------------------------------------------
  // Each brow: points (inner, middle, outer) relative to the eye centre. The near brow's inner end is
  // on the right (toward the nose); the far brow's on the left.
  const BROW = {
    flat: { near: [[4, -8], [0, -9], [-5, -8]], far: [[-3, -8], [0, -9], [3, -8]] },
    up: { near: [[4, -9], [0, -10], [-5, -9]], far: [[-3, -9], [0, -10], [3, -9]] },
    high: { near: [[4, -10], [0, -11], [-5, -10]], far: [[-3, -10], [0, -11], [3, -10]] },
    firm: { near: [[4, -7], [0, -9], [-5, -9]], far: [[-3, -7], [0, -9], [3, -9]] },
    knit: { near: [[4, -7], [0, -8], [-5, -9]], far: [[-3, -7], [0, -8], [3, -9]] },
    soft: { near: [[4, -9], [0, -9], [-5, -8]], far: [[-3, -9], [0, -9], [3, -8]] },
    arch: { near: [[4, -8], [0, -10], [-5, -9]], far: [[-3, -8], [0, -10], [3, -9]] },
    lift: { near: [[4, -8], [0, -10], [-5, -10]], far: [[-3, -9], [0, -11], [3, -10]] }, // one raised, knowing
  };
  function brow(L, ex, ey, side, kind, Mt, thick) {
    const pts = (BROW[kind] || BROW.flat)[side];
    const th = thick == null ? 2 : thick;
    for (let s = 0; s < 2; s++) {
      const [ax, ay] = pts[s], [bx, by] = pts[s + 1];
      const n = Math.max(Math.abs(bx - ax), 1);
      for (let t = 0; t <= n; t++) {
        const x = Math.round(ex + ax + ((bx - ax) * t) / n), y = Math.round(ey + ay + ((by - ay) * t) / n);
        put(L, x, y, Mt, 1);
        // thicker toward the inner end
        const fromInner = s === 0 ? t / n * 0.5 : 0.5 + (t / n) * 0.5;
        if (th > 1 && fromInner < 0.6) put(L, x, y + 1, Mt, 0);
      }
    }
  }
  HK.brow = brow; HK.BROW = BROW;

  // ---- nose and mouth (three-quarter, turned right) ---------------------------------------------
  function nose(L, hx, hy, sk) {
    const x = hx + HEAD.nose.x, y = hy + HEAD.nose.y;
    put(L, x, y - 2, sk, 5);
    put(L, x + 1, y, sk, 2);
    put(L, x, y + 1, sk, 3);
    put(L, x + 1, y + 1, sk, 2);
  }
  // Mouths as small templates on the mouth point. m lip line, d inside, t teeth, g tongue, s the lower
  // lip's shadow, h a lit lip pixel, r the lip's colour.
  const MOUTHS = {
    firm: ['.mmmm', 'm....', '..ss.'],
    calm: ['m...m', '.mmm.'],
    smile: ['m....m', '.mmmm.', '..ss..'],
    smirk: ['.....m', '.mmmm.', 'm..s..'],
    soft: ['m...mm', '.mmm..', '..s...'],
    open: ['mmmmmm', 'dttttd', 'ddgggd', '.dddd.', '..ss..'],
    grin: ['mmmmmmm', 'dtttttd', '.dgggd.', '..ddd..', '...s...'],
    breath: ['.mmmm', 'mddd.', '.ss..'],
    o: ['.mm.', 'mddm', '.mm.'],
  };
  function mouth(L, hx, hy, kind, C, dx) {
    const rows = MOUTHS[kind] || MOUTHS.firm;
    const w = rows[0].length;
    tpl(L, hx + HEAD.mouth.x - Math.floor(w / 2) + (dx || 0), hy + HEAD.mouth.y - 1, rows, {
      m: [C.mouth, 0], d: [C.mouthIn, 0], t: [C.teeth, 0], g: [C.tongue, 0], s: [C.skin, 3], h: [C.skin, 5],
    });
  }
  HK.nose = nose; HK.mouth = mouth; HK.MOUTHS = MOUTHS;

  // ---- face colours ------------------------------------------------------------------------------
  function faceColours(skinCols, irisBase) {
    const sk = skinMat(skinCols);
    const P = K();
    const ib = irisBase || '#7a4630';
    return {
      skin: sk,
      lash: flat(P.hex(P.mix(sk.rgba[0], [24, 12, 22], 0.82))),
      lashLt: flat(P.hex(P.mix(sk.rgba[0], [40, 18, 30], 0.42))),
      lid: flat(P.hex(P.mix(sk.rgba[2], [120, 40, 52], 0.45))),
      white: M('white', '#f6f2ee', { cols: ['#f6f2ee', '#d4c6d2'], at: 0 }),
      glint: flat('#ffffff'),
      iris: M('iris', ib, { cols: [P.hex(P.mix(P.parse(ib), [22, 10, 20], 0.7)), ib, P.tone(ib, 2), P.tone(ib, 3.6)], at: 1 }),
      mouth: flat(P.hex(P.mix(sk.rgba[1], [96, 24, 36], 0.5))),
      mouthIn: flat('#4a1a24'),
      teeth: flat('#f6eeea'),
      tongue: flat('#cc6670'),
      blush: flat(P.hex(P.mix(sk.rgba[4], [238, 112, 122], 0.3))),
    };
  }
  HK.faceColours = faceColours;
})(RB.harmonyKit);
