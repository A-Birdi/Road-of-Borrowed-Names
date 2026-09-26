/* Procedural 96×96 portraits with expressions, drawn as pixel art into a
 * buffer (hard edges, hue-shifted ramps, locks of hair with a broken
 * highlight band, a selective outline). Parameters come from the character
 * definition (portrait: {...}) layered over what the overworld look implies,
 * so each named character keeps a distinct face, hair, collar and
 * accessories. Hair shapes live in 36_portraithair.js. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.portraits = (function () {
  'use strict';
  const S = 96;
  const P = RB.pix;
  const shade = P.shade, mix = P.mix, A = P.alpha;
  const cache = new Map();

  // ---- parameters ----------------------------------------------------------------------------
  function paramsFor(id) {
    const ch = RB.content.chars[id];
    if (!ch) return null;
    if (ch.portrait) return Object.assign({}, fromLook(ch.look || {}), ch.portrait);
    return fromLook(ch.look || RB.sprites.randomLook(RB.util.hashStr(id)));
  }
  const COLLAR_OF_SHAPE = { apron: 'apron', robe: 'robe', coat: 'coat', dress: 'dress' };
  function fromLook(look) {
    const col = RB.sprites.colorsOf(look);
    const acc = (look.acc || []).slice();
    return {
      skin: col.skin, hair: col.hair, cloth: col.cloth, style: look.hair || 'short',
      acc, eyes: 'round', bg: '#2a3048', age: look.age || 'adult', collar: COLLAR_OF_SHAPE[look.shape],
      beard: acc.includes('beard') || undefined,
      scarfCol: look.scarfCol, ribbonCol: look.ribbonCol, hatCol: look.hatCol, wrapCol: look.wrapCol, hoodCol: look.hoodCol,
      bandCol: look.bandCol, flowerCol: look.flowerCol, capeCol: look.capeCol, sashCol: look.sashCol,
    };
  }
  const EXPR_ALIAS = { surprised: 'surprise', thinking: 'think', happy: 'smile', neutral: 'neutral' };

  // ---- palette ----------------------------------------------------------------------------------
  function palette(p) {
    const [sk, sd] = p.skin;
    const [cm, cs, ca] = p.cloth;
    const h = p.hair;
    const hl1 = h[1] && P.lum(h[1]) > P.lum(h[0]) + 0.02 ? mix(h[1], shade(h[0], 1), 0.3) : shade(h[0], 1);
    const hl2 = h[2] && P.lum(h[2]) > P.lum(hl1) ? h[2] : shade(h[0], 2);
    return {
      sk: [shade(sd, -1), mix(sd, shade(sk, -1), 0.4), sk, shade(sk, 1), shade(sk, 2)],
      hair: [shade(h[0], -2), shade(h[0], -1), h[0], hl1, hl2],
      cl: P.ramp(cm, cs), ac: [shade(ca, -1), ca, shade(ca, 1)],
      lash: '#231a24', iris: P.ramp(p.iris || '#4a3038'),
      white: '#f8f4f2', whiteS: '#d8cfd8',
      mouth: mix(sd, '#7a2e34', 0.55), mouthIn: '#5a2026', tongue: '#c86a6a',
      blush: A('#f08080', 0.38), blushLine: A('#d85a64', 0.7),
    };
  }

  // ---- face ---------------------------------------------------------------------------------------
  // Head: a cranium oval over a rounded jaw; the light comes from the upper left.
  const JAW = [26, 40, 27, 50, 31, 58, 37, 64, 43, 68, 48, 69, 53, 68, 59, 64, 65, 58, 69, 50, 70, 40];
  function faceMask(old) {
    const m = new P.Buf(S, S);
    m.oval(26, 14, 69, 62, '#fff');
    m.poly(old ? JAW.map((v, i) => (i % 2 && v > 60 ? v + 1 : v)) : JAW, '#fff');
    return m;
  }
  function drawFace(b, p, C, m) {
    const K = C.sk;
    // ears: rim, inner fold, shadowed on the far side
    for (const [x0, x1, lit] of [[22, 28, true], [68, 74, false]]) {
      b.oval(x0, 40, x1, 54, lit ? K[2] : K[1]);
      b.oval(x0 + 2, 43, x1 - 2, 51, lit ? K[1] : K[0]);
      b.rect(lit ? x0 + 1 : x1 - 2, 42, 1, 6, lit ? K[3] : K[1]);
    }
    // neck, with the jaw's shadow falling across it
    b.rect(40, 60, 16, 20, K[1]);
    b.rect(40, 62, 3, 18, K[2]);
    b.rect(53, 60, 3, 20, K[0]);
    b.poly([40, 62, 56, 62, 56, 69, 48, 73, 40, 69], K[0]);
    // the face as a rounded solid lit from the upper left: mostly flat tone, a lit temple and
    // cheek, the terminator on the right, and shadow under the chin
    const L = [-0.36, -0.42, 0.83];
    m.each((x, y) => {
      const nx = (x + 0.5 - 48) / 24, ny = (y + 0.5 - 40) / 30;
      const nz = Math.sqrt(Math.max(0.02, 1 - nx * nx - ny * ny));
      const d = nx * L[0] + ny * L[1] + nz * L[2];
      let v = d > 0.93 ? 3 : d > 0.34 ? 2 : d > 0.08 ? 1 : 0;
      if (y > 62 && v > 1) v = 1;
      b.px(x, y, K[v]);
    });
    b.rect(31, 52, 4, 1, K[3]); b.rect(30, 53, 5, 1, K[3]);
  }

  // Eye lids as authored templates for the viewer's right eye (outer corner on the right; the left
  // eye mirrors): k lash, w the opening, l lower lid. The iris is placed inside the opening.
  const EYE_T = {
    round: [
      '...kkkkkk....',
      '.kkkkkkkkkkk.',
      'kkwwwwwwwwwkk',
      '.wwwwwwwwwww.',
      '.wwwwwwwwwww.',
      '.wwwwwwwwwww.',
      '..wwwwwwwww..',
      '...wwwwwww...',
      '....lllll....',
    ],
    soft: [
      '...kkkkkk....',
      '..kkkkkkkkk..',
      '.kkwwwwwwwkk.',
      '.wwwwwwwwwwkk',
      '.wwwwwwwwwww.',
      '.wwwwwwwwwww.',
      '..wwwwwwwww..',
      '...wwwwwwwl..',
      '....lllll....',
    ],
    narrow: [
      '.............',
      '.kkkkkkkkkk..',
      'kkkkkkkkkkkkk',
      '.wwwwwwwwwww.',
      '.wwwwwwwwwww.',
      '..wwwwwwwww..',
      '...lllllll...',
    ],
    sharp: [
      '...........kk',
      '....kkkkkkkk.',
      '..kkkkkkkkkk.',
      'kkkwwwwwwwwk.',
      '.wwwwwwwwwww.',
      '.wwwwwwwwww..',
      '..wwwwwwww...',
      '...llllll....',
    ],
  };
  const CLOSED_DOWN = ['k...........k', '.kk.......kk.', '...kkkkkkk...', '....kkkkk....'];
  const CLOSED_UP = ['....kkkkk....', '..kkkkkkkkk..', '.kk.......kk.', 'k...........k'];
  function eye(b, p, C, cx, cy, side, e) {
    const K = C.sk, st = EYE_T[p.eyes] ? p.eyes : 'round';
    const X = (i) => (side > 0 ? cx - 6 + i : cx + 5 - i);
    const put = (rows, y0, map) => rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) { const c = map[r[i]]; if (c) b.px(X(i), y0 + j, c); } });
    if (e.closed) {
      const rows = e.closed === 'up' ? CLOSED_UP : CLOSED_DOWN;
      put(rows, cy - 1, { k: C.lash });
      if (e.closed === 'down') { b.px(X(12), cy - 2, C.lash); b.px(X(12), cy - 3, C.lash); }
      return;
    }
    const T = EYE_T[st].slice();
    if (e.wide) { const last = T[T.length - 1]; T[T.length - 1] = last.replace(/l/g, 'w'); T.push(last); }
    const y0 = cy - 4;
    // opening: whites, shaded under the upper lid
    const open = [];
    T.forEach((r, j) => { for (let i = 0; i < r.length; i++) if (r[i] === 'w') open.push([i, j]); });
    let i0 = 99, i1 = -1, j0 = 99, j1 = -1;
    for (const [i, j] of open) { i0 = Math.min(i0, i); i1 = Math.max(i1, i); j0 = Math.min(j0, j); j1 = Math.max(j1, j); }
    const isOpen = (i, j) => T[j] && T[j][i] === 'w';
    for (const [i, j] of open) b.px(X(i), y0 + j, j <= j0 ? C.whiteS : C.white);
    // iris: a tall oval with a dark upper rim, a lighter lower half, pupil and glints
    const lk = e.look || [0, 0];
    const iw = e.wide ? 5 : st === 'sharp' ? 7 : 8, ih = e.wide ? 6 : j1 - j0 + 2;
    const ic = (i0 + i1) / 2 - 0.5 + lk[0], jc = e.wide ? (j0 + j1) / 2 + 0.5 : j0 + ih / 2 - 1 + lk[1];
    const I = C.iris;
    for (let j = j0 - 1; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      if (!isOpen(i, j)) continue;
      const a = (i + 0.5 - ic - 0.5) / (iw / 2), bb = (j + 0.5 - jc) / (ih / 2);
      if (a * a + bb * bb > 1) continue;
      const t = (j - (jc - ih / 2)) / ih;
      b.px(X(i), y0 + j, t < 0.3 ? I[0] : t > 0.7 ? I[3] : I[2]);
    }
    const pi = Math.round(ic), pj = Math.round(jc - (e.wide ? 0 : 0.5));
    for (let j = pj - (e.wide ? 0 : 1); j <= pj + (e.wide ? 0 : 1); j++) for (let i = pi; i <= pi + (e.wide ? 0 : 1); i++) if (isOpen(i, j)) b.px(X(i), y0 + j, I[0]);
    // glints: a big one to the upper left of the pupil, a small one low right
    const gi = Math.round(ic - iw / 2 + 1.5), gj = j0 + (e.wide ? 1 : 1);
    for (const [i, j] of [[gi, gj], [gi + 1, gj], [gi, gj + 1], [gi + 1, gj + 1]]) if (isOpen(i, j)) b.px(X(i), y0 + j, '#ffffff');
    if (isOpen(Math.round(ic + iw / 2 - 1.5), j1 - 1)) b.px(X(Math.round(ic + iw / 2 - 1.5)), y0 + j1 - 1, A('#ffffff', 0.75));
    if (e.tear) { b.px(X(gi), y0 + j1, '#ffffff'); b.px(X(gi + 1), y0 + j1, A('#cfe8ff', 0.9)); }
    // lashes and lower lid over everything
    put(T, y0, { k: C.lash, l: mix(C.lash, K[1], 0.55) });
    // crease above the lid
    for (let i = 2; i <= 10; i++) b.px(X(i), y0 - 2 + (i < 4 || i > 9 ? 1 : 0), K[1]);
    // lid modifiers
    const lidLine = (fn) => { for (let i = 0; i <= 12; i++) { const j = fn(i); if (j == null) continue; b.px(X(i), y0 + j, C.lash); b.px(X(i), y0 + j + 1, C.lash); } };
    const cover = (fn) => { for (let j = 0; j < T.length; j++) for (let i = 0; i <= 12; i++) if (fn(i, j) && (T[j][i] === 'w' || T[j][i] === 'k')) b.px(X(i), y0 + j, K[2]); };
    if (e.heavy) { const lv = j0 + Math.ceil((j1 - j0) * 0.5); cover((i, j) => j < lv); lidLine((i) => (i >= 1 && i <= 12 ? lv - 1 : null)); b.rect(Math.min(X(2), X(10)), y0 + lv - 3, 9, 1, K[1]); }
    if (e.angry) { cover((i, j) => j < j0 + Math.round(((12 - i) / 12) * 4)); lidLine((i) => Math.max(0, j0 - 1 + Math.round(((12 - i) / 12) * 4))); }
    if (e.droop) { cover((i, j) => j < j0 + Math.round((i / 12) * 3)); lidLine((i) => Math.max(0, j0 - 1 + Math.round((i / 12) * 3))); }
    if (e.cheek) { cover((i, j) => j > j1 - 2 && j <= j1 + 1); for (let i = 2; i <= 10; i++) b.px(X(i), y0 + j1 - 1 - (i > 3 && i < 9 ? 1 : 0), mix(C.lash, K[1], 0.4)); }
  }

  const EXPR = {
    neutral: { eyes: {}, brow: 'flat', mouth: 'flat' },
    smile: { eyes: { cheek: true }, brow: 'flat', mouth: 'smile' },
    smile2: { eyes: { closed: 'up' }, brow: 'flat', mouth: 'smile' },
    laugh: { eyes: { closed: 'up' }, brow: 'up', mouth: 'laugh', blush: true },
    sad: { eyes: { droop: true, tear: true, look: [0, 1] }, brow: 'worry', mouth: 'sad' },
    sad2: { eyes: { closed: 'down' }, brow: 'worry', mouth: 'sad' },
    angry: { eyes: { angry: true }, brow: 'angry', mouth: 'angry' },
    surprise: { eyes: { wide: true }, brow: 'high', mouth: 'o' },
    think: { eyes: { look: [1, -1] }, brow: 'raise', mouth: 'think' },
    think2: { eyes: { heavy: true }, brow: 'flat', mouth: 'think' },
    worry: { eyes: { droop: true }, brow: 'worry', mouth: 'worry' },
    shy: { eyes: { look: [1, 1], heavy: false, cheek: true }, brow: 'worry', mouth: 'shy', blush: true, lines: true },
    smirk: { eyes: {}, eyesR: { heavy: true }, brow: 'raise', mouth: 'smirk' },
    closed: { eyes: { closed: 'down' }, brow: 'flat', mouth: 'calm' },
    tired: { eyes: { heavy: true }, brow: 'worry', mouth: 'tired' },
  };

  function brows(b, p, C, ex) {
    const old = p.age === 'old';
    const col = p.browCol || (old ? '#d8d4d0' : shade(C.hair[1], -1));
    const y0 = 34 + (p.browY || 0) * 2;
    const thick = p.brows === 'thick' ? 3 : 2;
    for (const side of [-1, 1]) {
      const cx = side < 0 ? 37 : 59;
      let kind = ex.brow;
      if (kind === 'raise') kind = side > 0 ? 'high' : 'flat';
      // points: inner, middle, outer (u grows outward)
      const pts = { flat: [[-4, 1], [1, 0], [6, 1]], up: [[-4, 0], [1, -1], [6, 0]], high: [[-4, -1], [1, -3], [6, -2]], worry: [[-4, -2], [1, 0], [6, 2]], angry: [[-4, 3], [1, 1], [6, -1]] }[kind] || [[-4, 1], [1, 0], [6, 1]];
      const X = (u) => cx + (side > 0 ? u : -u - 1);
      for (let i = 0; i < 2; i++) {
        const [u0, v0] = pts[i], [u1, v1] = pts[i + 1];
        for (let u = u0; u <= u1; u++) {
          const v = Math.round(v0 + ((v1 - v0) * (u - u0)) / (u1 - u0));
          const t = u >= 5 ? thick - 1 : thick;
          b.rect(X(u), y0 + v, 1, t, col);
        }
      }
    }
  }
  function mouth(b, p, C, kind) {
    const m = C.mouth, y = 61;
    const R = (x, yy, w, h, c) => b.rect(x, yy, w, h, c);
    switch (kind) {
      case 'smile': R(44, y, 1, 1, m); R(45, y + 1, 6, 1, m); R(51, y, 1, 1, m); R(46, y + 2, 4, 1, A(C.sk[1], 0.8)); break;
      case 'laugh': R(43, y - 1, 10, 1, m); b.poly([43, y, 53, y, 51, y + 5, 45, y + 5], C.mouthIn); R(45, y + 3, 6, 2, C.tongue); R(44, y, 8, 1, '#f4ece8'); break;
      case 'sad': R(45, y, 6, 1, m); R(44, y + 1, 1, 1, m); R(51, y + 1, 1, 1, m); break;
      case 'angry': R(44, y + 1, 8, 1, m); R(43, y + 2, 1, 1, m); R(52, y + 2, 1, 1, m); R(45, y, 6, 1, A(C.sk[1], 0.9)); break;
      case 'o': b.oval(46, y - 1, 50, y + 4, C.mouthIn); R(47, y + 2, 3, 1, C.tongue); b.oval(46, y - 1, 50, y - 1, m); break;
      case 'worry': R(44, y + 1, 2, 1, m); R(46, y, 2, 1, m); R(48, y + 1, 2, 1, m); R(50, y, 2, 1, m); break;
      case 'think': R(49, y, 4, 1, m); R(48, y + 1, 1, 1, A(m, 0.5)); break;
      case 'tired': R(45, y + 1, 6, 1, m); R(46, y + 2, 4, 1, A(C.mouthIn, 0.6)); break;
      case 'smirk': R(45, y + 1, 4, 1, m); R(49, y, 2, 1, m); R(51, y - 1, 1, 1, m); break;
      case 'shy': R(45, y, 2, 1, m); R(47, y + 1, 2, 1, m); R(49, y, 2, 1, m); break;
      case 'calm': R(45, y, 6, 1, m); R(44, y - 1, 1, 1, A(m, 0.6)); R(51, y - 1, 1, 1, A(m, 0.6)); break;
      default: R(45, y, 6, 1, m); R(46, y + 1, 4, 1, A(C.sk[1], 0.7));
    }
  }
  function features(b, p, C, ex) {
    const K = C.sk;
    // nose: a shadow under the tip on the right, a lit bridge
    b.rect(49, 53, 2, 2, K[1]); b.px(48, 55, K[1]); b.rect(46, 51, 1, 2, K[3]);
    // old age: laugh lines, crow's feet, a softer jaw
    if (p.age === 'old') {
      const soft = A(K[0], 0.45);
      b.line(42, 57, 41, 61, K[1]); b.line(55, 57, 56, 61, soft);
      b.px(28, 45, K[1]); b.px(27, 46, K[1]); b.px(68, 45, soft); b.px(69, 46, soft);
      b.rect(34, 53, 5, 1, soft); b.rect(57, 53, 5, 1, soft);
      b.rect(40, 30, 16, 1, soft); b.rect(42, 33, 12, 1, soft);
    }
    const eyL = Object.assign({}, ex.eyes), eyR = Object.assign({}, ex.eyes, ex.eyesR || {});
    eye(b, p, C, 37, 45, -1, eyL);
    eye(b, p, C, 59, 45, 1, eyR);
    if (ex.blush || p.blush) {
      b.oval(29, 53, 39, 57, C.blush); b.oval(57, 53, 67, 57, C.blush);
      if (ex.lines) for (const x of [31, 34, 37, 59, 62, 65]) { b.px(x + 1, 54, C.blushLine); b.px(x, 55, C.blushLine); }
    }
    mouth(b, p, C, ex.mouth);
    if (p.mole) b.rect(60, 57, 2, 2, '#4a2a2a');
    if (p.scar) { b.line(60, 34, 63, 47, '#c89080'); b.line(61, 34, 64, 47, A('#f0c0b0', 0.6)); }
    if (p.smudge) b.oval(31, 55, 37, 58, p.smudge === true ? '#2a2436' : p.smudge);
  }
  function beard(b, p, C) {
    const col = p.beard === true ? C.hair[2] : p.beard;
    const R = [shade(col, -2), shade(col, -1), col, shade(col, 1), shade(col, 2)];
    const m = new P.Buf(S, S);
    m.poly([27, 46, 29, 56, 33, 63, 38, 69, 42, 73, 45, 71, 48, 75, 51, 71, 54, 73, 58, 69, 63, 63, 67, 56, 69, 46, 66, 54, 60, 58, 54, 58, 48, 57, 42, 58, 36, 58, 30, 54], '#fff');
    m.poly([39, 57, 44, 55, 48, 56, 52, 55, 57, 57, 56, 60, 48, 59, 40, 60], '#fff');
    // a solid mass lit on the upper left and shadowed to the right and at the tips, then a few
    // authored strands following the jaw
    m.each((x, y) => {
      let v = 2;
      if (x < 40 && y < 66) v = 3;
      if (x > 60 || y > 70) v = 1;
      if (!m.alphaAt(x, y + 1) || !m.alphaAt(x, y + 2)) v = Math.min(v, 1);
      b.px(x, y, R[v]);
    });
    for (const [x0, y0, x1, y1] of [[31, 55, 34, 62], [37, 60, 40, 68], [44, 63, 45, 71], [52, 63, 51, 70], [58, 61, 56, 67], [64, 55, 62, 61]]) {
      b.line(x0, y0, x1, y1, R[1]);
      if (x0 < 50) b.line(x0 - 1, y0 + 1, x1 - 1, y1, R[x0 < 40 ? 4 : 3]);
    }
    b.rect(41, 57, 14, 1, R[3]); b.rect(44, 56, 8, 1, R[3]);
    b.rect(45, 61, 6, 1, C.mouthIn);
    b.rect(44, 60, 8, 1, R[1]);
  }

  // ---- bust and collars ---------------------------------------------------------------------------
  const IVORY = ['#b8ab94', '#d8ccb4', '#ece4d4', '#f8f2e6'];
  function bust(b, p, C) {
    const L = C.cl, ac = C.ac;
    const m = new P.Buf(S, S);
    m.poly([0, 96, 3, 86, 12, 79, 26, 74, 40, 72, 56, 72, 70, 74, 84, 79, 93, 86, 96, 96], '#fff');
    m.each((x, y) => {
      let v = 2;
      if (x < 22 && y < 86 - (x >> 2)) v = 3;
      if (x < 14 && y < 84) v = 4;
      if (x > 70) v = 1;
      if (x > 84 && y > 84) v = 0;
      b.px(x, y, L[v]);
    });
    // seams where the sleeves meet the shoulders, and folds towards the collar
    b.line(16, 80, 20, 96, L[1]); b.line(80, 80, 76, 96, L[0]);
    b.line(30, 84, 34, 96, L[1]); b.line(64, 86, 62, 96, L[1]);
    const col = p.collar;
    if (col === 'high') {
      b.poly([36, 76, 39, 64, 57, 64, 60, 76, 48, 79], L[1]);
      b.poly([37, 75, 40, 65, 47, 65, 46, 78], L[2]);
      b.rect(39, 64, 18, 2, ac[1]); b.rect(39, 64, 18, 1, ac[2]);
      b.line(36, 76, 48, 79, ac[1]); b.line(48, 79, 60, 76, ac[0]);
      b.rect(47, 66, 2, 12, L[0]);
    } else if (col === 'apron') {
      b.poly([42, 72, 48, 82, 54, 72], C.sk[1]);
      b.line(42, 72, 48, 82, ac[1]); b.line(54, 72, 48, 82, ac[0]);
      b.poly([33, 82, 63, 82, 66, 96, 30, 96], IVORY[2]);
      b.rect(33, 82, 30, 2, IVORY[3]); b.rect(60, 84, 5, 12, IVORY[1]);
      b.line(35, 82, 38, 72, IVORY[2], 2); b.line(60, 82, 57, 72, IVORY[1], 2);
      b.rect(40, 88, 16, 1, IVORY[1]);
    } else if (col === 'robe') {
      b.poly([38, 72, 58, 72, 48, 86], C.sk[1]);
      b.line(37, 72, 48, 88, IVORY[2], 2);
      b.poly([57, 71, 61, 72, 42, 96, 37, 96], ac[1]);
      b.line(58, 71, 39, 96, ac[2]);
    } else if (col === 'coat') {
      b.poly([42, 72, 48, 84, 54, 72], ac[1]);
      b.rect(46, 74, 4, 10, ac[0]);
      b.poly([36, 72, 42, 72, 48, 86, 44, 90, 34, 80], L[3]);
      b.poly([54, 72, 60, 72, 62, 80, 52, 90, 48, 86], L[1]);
      b.rect(46, 90, 3, 3, ac[2]);
    } else if (col === 'dress') {
      b.oval(38, 66, 58, 80, C.sk[1]);
      b.oval(38, 66, 58, 70, C.sk[0]);
      for (let x = 38; x <= 58; x++) { const dy = Math.round(7 * Math.sqrt(Math.max(0, 1 - ((x - 48) / 10.5) ** 2))); b.px(x, 73 + dy, ac[1]); b.px(x, 74 + dy, ac[0]); }
    } else {
      b.poly([41, 71, 48, 84, 55, 71], C.sk[1]);
      b.poly([43, 71, 48, 76, 53, 71], C.sk[0]);
      b.line(40, 71, 48, 85, ac[1]); b.line(41, 71, 48, 84, ac[2]);
      b.line(56, 71, 48, 85, ac[0]);
      b.rect(34, 71, 6, 2, ac[1]); b.rect(56, 71, 6, 2, ac[0]);
    }
  }

  // ---- accessories ------------------------------------------------------------------------------------
  const GOLD = ['#a8842c', '#e8c860', '#fff0a8'];
  const R4 = (c) => [shade(c, -2), shade(c, -1), c, shade(c, 1), shade(c, 2)];
  function lantern(b, x, y) {
    b.oval(x - 6, y - 4, x + 18, y + 22, A('#ffd27a', 0.18));
    b.rect(x + 4, y - 4, 4, 2, '#3a3440'); b.rect(x, y - 2, 12, 2, '#3a3440');
    b.rect(x, y, 12, 14, '#ffd27a'); b.rect(x, y, 3, 14, '#fff0b8'); b.rect(x + 9, y, 3, 14, '#e8a040');
    b.rect(x + 5, y, 1, 14, '#f0b050'); b.rect(x, y + 5, 12, 1, '#f0b050');
    b.rect(x, y + 14, 12, 2, '#3a3440');
  }
  function accBack(b, p, C) {
    if (p.acc.includes('cape')) { const R = R4(p.capeCol || '#6a3a4a'); b.poly([0, 96, 2, 80, 14, 72, 24, 74, 16, 96], R[1]); b.poly([96, 96, 94, 80, 82, 72, 72, 74, 80, 96], R[0]); }
  }
  function accFront(b, p, C, ex) {
    const a = p.acc;
    if (a.includes('scarf')) {
      const R = R4(p.scarfCol || '#c8962e');
      b.poly([18, 82, 26, 68, 40, 72, 48, 74, 56, 72, 70, 68, 78, 82, 64, 88, 48, 86, 32, 88], R[2]);
      b.poly([18, 82, 26, 68, 40, 72, 36, 80, 28, 86], R[3]);
      b.line(26, 70, 70, 70, R[3]); b.line(30, 80, 66, 80, R[1]); b.line(40, 74, 56, 74, R[1]);
      b.poly([60, 82, 72, 82, 74, 96, 60, 96], R[2]); b.rect(70, 82, 4, 14, R[1]); b.rect(60, 82, 2, 14, R[3]);
      for (let x = 61; x < 74; x += 3) b.rect(x, 94, 1, 2, R[0]);
    }
    if (a.includes('satchel')) { b.line(18, 76, 62, 96, '#6a4a2a', 5); b.line(18, 76, 62, 96, '#8a6a3a', 3); for (let k = 0; k < 7; k++) b.px(24 + k * 6, 80 + k * 2.6, '#c8a870'); }
    if (a.includes('pin')) { b.oval(30, 78, 36, 84, GOLD[1]); b.px(32, 80, GOLD[2]); b.px(35, 83, GOLD[0]); }
    if (a.includes('patches')) { const pc = ['#6a5c42', '#8a7a5a', '#a89a78']; for (const [x, y] of [[14, 84], [74, 88]]) { b.rect(x, y, 9, 8, pc[1]); b.rect(x, y, 9, 2, pc[2]); for (let i = 0; i < 9; i += 2) { b.px(x + i, y - 1, pc[0]); b.px(x + i, y + 8, pc[0]); } } }
    if (a.includes('bottles')) {
      const bottle = (x, y, c) => { b.rect(x + 1, y - 3, 3, 3, '#a88860'); b.rect(x, y, 6, 10, c); b.rect(x, y, 2, 10, shade(c, 2)); b.rect(x + 4, y, 2, 10, shade(c, -1)); b.rect(x, y + 3, 6, 2, '#e8e0cc'); };
      bottle(78, 84, '#6ab0a0'); bottle(12, 86, '#c8a0d0');
    }
    if (a.includes('lamp')) lantern(b, 80, 78);
    if (a.includes('book')) { b.rect(4, 82, 16, 14, '#6a3a3a'); b.rect(4, 82, 16, 2, '#8a4a44'); b.rect(18, 84, 2, 12, '#e8e0c8'); b.rect(8, 88, 6, 1, GOLD[1]); }
    if (a.includes('basket')) { b.rect(76, 86, 20, 10, '#b08a4a'); b.rect(76, 86, 20, 2, '#d0ac6a'); for (let x = 77; x < 96; x += 3) b.rect(x, 89, 1, 7, '#7a5a2e'); }
    if (a.includes('atlas_sash')) { const c = p.sashCol || '#d8c89a'; b.line(20, 76, 64, 96, c, 5); b.line(22, 80, 64, 99, shade(c, -1)); }
    if (a.includes('atlas_pin')) { b.oval(30, 78, 37, 85, GOLD[1]); b.rect(33, 81, 2, 2, '#3a5a8a'); }
    if (a.includes('cape')) { const R = R4(p.capeCol || '#6a3a4a'); b.poly([10, 80, 24, 72, 34, 76, 22, 84], R[2]); b.poly([86, 80, 72, 72, 62, 76, 74, 84], R[1]); b.oval(44, 70, 51, 77, GOLD[1]); b.px(46, 72, GOLD[2]); }
  }
  function accHead(b, p, C) {
    const a = p.acc;
    if (a.includes('glasses')) {
      const fc = p.glassCol || '#2e2a30';
      for (const cx of [37, 59]) {
        b.rect(cx - 6, 38, 12, 1, fc); b.rect(cx - 6, 52, 12, 1, fc); b.rect(cx - 8, 40, 1, 11, fc); b.rect(cx + 6, 40, 1, 11, fc);
        b.px(cx - 7, 39, fc); b.px(cx + 5, 39, fc); b.px(cx - 7, 51, fc); b.px(cx + 5, 51, fc);
        b.rect(cx - 7, 39, 13, 13, A('#e8f4ff', 0.1));
        b.px(cx + 3, 40, A('#ffffff', 0.7)); b.px(cx + 4, 41, A('#ffffff', 0.5)); b.px(cx + 2, 41, A('#ffffff', 0.4));
      }
      b.rect(44, 43, 8, 1, fc); b.rect(21, 42, 8, 1, fc); b.rect(67, 42, 8, 1, fc);
    }
    if (a.includes('goggles') || a.includes('atlas_goggles')) {
      b.rect(22, 21, 52, 5, '#5a4a3a'); b.rect(22, 21, 52, 1, '#7a6a5a');
      for (const cx of [38, 58]) { b.oval(cx - 8, 16, cx + 7, 30, '#3a3a3a'); b.oval(cx - 6, 18, cx + 5, 28, '#8fb8b0'); b.oval(cx - 5, 19, cx - 1, 23, '#d8f0e8'); }
    }
    if (a.includes('headband')) {
      const R = R4(p.bandCol || C.ac[1]);
      for (let x = 20; x <= 76; x++) { const y = 25 + Math.round(((x - 48) / 28) ** 2 * 5); b.rect(x, y, 1, 5, R[2]); b.px(x, y, R[3]); b.px(x, y + 4, R[1]); }
      b.poly([74, 28, 82, 26, 84, 34, 76, 34], R[1]); b.poly([76, 33, 82, 40, 78, 42, 74, 34], R[0]);
    }
    if (a.includes('hood')) {
      const R = R4(p.hoodCol || C.cl[1]);
      const m = new P.Buf(S, S);
      m.poly([14, 96, 16, 36, 24, 16, 48, 4, 72, 16, 80, 36, 82, 96, 72, 96, 72, 50, 68, 30, 48, 16, 28, 30, 24, 50, 24, 96], '#fff');
      m.each((x, y) => { let v = 2; if (x < 26 && y < 60) v = 3; if (x > 70) v = 1; if (y < 18 && x < 44) v = 3; b.px(x, y, R[v]); });
      b.line(28, 30, 48, 16, R[3]); b.line(48, 16, 68, 30, R[1]); b.line(24, 50, 28, 30, R[3]); b.line(72, 50, 68, 30, R[0]);
      b.line(34, 10, 30, 20, R[1]); b.line(62, 10, 66, 20, R[0]);
    }
    if (a.includes('hat')) {
      const R = R4(p.hatCol || '#8a6a44');
      const crown = new P.Buf(S, S);
      crown.poly([28, 20, 31, 6, 38, 1, 58, 1, 65, 6, 68, 20], '#fff');
      crown.each((x, y) => { let v = x < 38 ? 3 : x > 60 ? 1 : 2; if (y % 4 === 3) v -= 1; if (x < 34 && y < 10 && y % 4 !== 3) v = 4; b.px(x, y, R[Math.max(0, v)]); });
      b.rect(28, 15, 41, 5, R[1]); b.rect(28, 15, 41, 1, R[0]); b.rect(28, 19, 41, 1, R[0]); b.rect(30, 16, 8, 1, R[2]);
      const brim = new P.Buf(S, S);
      brim.oval(4, 16, 91, 32, '#fff');
      brim.each((x, y) => {
        const ang = Math.atan2((y - 24) * 3, x - 48);
        let v = y < 25 ? (x < 40 ? 4 : x > 70 ? 2 : 3) : y < 28 ? 2 : 1;
        if (Math.round(ang * 9) % 3 === 0 && y < 27 && v > 2) v -= 1;
        b.px(x, y, R[v]);
      });
      b.rect(26, 33, 44, 3, A('#1a1020', 0.28));
    }
    if (a.includes('ribbon')) {
      const R = R4(p.ribbonCol || '#c8687a');
      b.poly([68, 22, 74, 30, 73, 38, 67, 29], R[1]); b.poly([72, 22, 82, 31, 84, 40, 76, 30], R[0]);  // tails
      b.poly([66, 18, 52, 8, 50, 14, 54, 24], R[2]); b.poly([66, 18, 54, 10, 53, 14], R[3]);         // left loop
      b.poly([66, 18, 80, 6, 84, 14, 78, 24], R[1]); b.poly([66, 18, 80, 8, 81, 12], R[2]);          // right loop
      b.line(52, 9, 54, 23, R[0]); b.line(83, 8, 78, 23, R[0]);
      b.oval(62, 14, 70, 22, R[2]); b.oval(63, 15, 66, 17, R[3]); b.px(69, 21, R[0]);                 // knot
    }
    if (a.includes('flower')) {
      const R = R4(p.flowerCol || '#f4a6a0');
      for (const [dx, dy] of [[0, -5], [5, -1], [3, 5], [-3, 5], [-5, -1]]) b.oval(66 + dx, 18 + dy, 70 + dx, 22 + dy, R[dy < 0 ? 3 : 2]);
      b.oval(65, 17, 71, 23, '#fff4c0'); b.oval(67, 19, 69, 21, '#e8b050');
      b.line(62, 26, 58, 30, '#5a8a4a', 2);
    }
    if (a.includes('earrings')) for (const x of [24, 71]) { b.oval(x, 54, x + 2, 56, GOLD[1]); b.rect(x + 1, 57, 1, 3, GOLD[0]); b.oval(x, 59, x + 2, 62, GOLD[1]); b.px(x, 59, GOLD[2]); }
    if (a.includes('pencil')) { b.line(66, 30, 82, 12, '#e0b040', 3); b.line(67, 31, 83, 13, '#b88a20'); b.rect(81, 9, 4, 4, '#e8a0a0'); b.rect(64, 30, 3, 3, '#3a3040'); }
    if (a.includes('atlas_quill')) { b.line(68, 32, 80, 4, '#f4f0e0', 3); b.line(70, 32, 82, 6, '#d8d0bc'); b.px(68, 32, '#6a5a3a'); }
    if (a.includes('atlas_lamplet')) lantern(b, 80, 80);
  }

  // Animal speakers (portrait kind: 'cat'): a cat's head and chest in the same light and palette rules.
  function drawCat(b, p, C, ex) {
    const f = p.skin[0], R = [shade(f, -2), shade(f, -1), f, shade(f, 1), shade(f, 2)];
    const shaded = (m, top) => m.each((x, y) => {
      const nx = (x - 48) / 30, ny = (y - (top || 48)) / 30;
      let v = 2;
      if (nx + ny * 0.6 < -0.32 && ny < 0.4) v = 3;
      if (nx > 0.55 || ny > 0.72) v = 1;
      b.px(x, y, R[v]);
    });
    const body = new P.Buf(S, S); body.oval(12, 66, 83, 124, '#fff'); shaded(body, 90);
    b.oval(34, 74, 61, 100, R[3]); b.oval(38, 78, 57, 100, R[4]);
    for (const [x0, x1] of [[20, 26], [36, 42], [52, 58]]) for (let x = x0; x <= x1; x += 3) b.line(x, 70, x - 2, 76, R[1]);
    // collar and bell
    b.rect(24, 76, 48, 5, C.cl[2]); b.rect(24, 76, 48, 1, C.cl[3]); b.rect(24, 80, 48, 1, C.cl[0]);
    b.oval(44, 79, 52, 87, GOLD[1]); b.oval(45, 80, 47, 82, GOLD[2]); b.rect(47, 85, 2, 1, GOLD[0]);
    // ears, head with fluffed cheeks
    for (const pts of [[18, 38, 24, 4, 44, 24], [52, 24, 72, 4, 78, 38]]) b.poly(pts, pts[0] < 40 ? R[2] : R[1]);
    b.poly([24, 32, 26, 12, 38, 25], '#e8a0a0'); b.poly([58, 25, 70, 12, 72, 32], '#c88888');
    const head = new P.Buf(S, S);
    head.oval(18, 20, 77, 76, '#fff');
    head.poly([18, 52, 10, 64, 20, 62, 16, 72, 26, 70, 30, 76, 66, 76, 70, 70, 80, 72, 76, 62, 86, 64, 78, 52], '#fff');
    shaded(head, 44);
    for (const x of [42, 47, 52]) b.line(x, 24, x + Math.round((x - 47) / 5), 33, R[1]); // forehead markings
    b.oval(36, 56, 60, 72, R[3]);
    // eyes: almond openings, green-gold irises, slit pupils that round out in surprise
    const e = ex.eyes || {};
    for (const [cx, side] of [[36, -1], [60, 1]]) {
      if (e.closed) {
        const up = e.closed === 'up';
        for (let u = -6; u <= 6; u++) { const v = Math.round(((u * u) / 36) * 3) * (up ? 1 : -1); b.rect(cx + u, 48 + v, 1, 2, C.lash); }
        continue;
      }
      const oy = e.heavy ? 3 : 0;
      for (let y = 42 + oy; y <= 54; y++) for (let x = cx - 7; x <= cx + 7; x++) {
        const nx = (x + 0.5 - cx) / 7.5, ny = (y + 0.5 - 48) / 6.5;
        if (nx * nx + ny * ny > 1) continue;
        b.px(x, y, ny < -0.4 ? '#8a9a30' : ny > 0.4 ? '#d8e070' : '#b8c850');
      }
      const pw = e.wide ? 4 : 2;
      b.rect(cx - (pw >> 1), 43 + oy, pw, 11 - oy, '#1a1614');
      b.rect(cx - 4, 44 + oy, 2, 2, '#ffffff'); b.px(cx + 3, 51, A('#ffffff', 0.8));
      for (let x = cx - 7; x <= cx + 7; x++) { const nx = (x + 0.5 - cx) / 7.5; const y = Math.round(48 - 6.5 * Math.sqrt(Math.max(0, 1 - nx * nx))) + oy; b.px(x, y, C.lash); b.px(x, y - 1, C.lash); }
      if (e.angry) b.line(cx - 7 * side, 43, cx + 7 * side, 40, C.lash, 2);
      if (e.droop) b.line(cx - 7 * side, 40, cx + 7 * side, 44, C.lash, 2);
    }
    // nose, the little mouth, whiskers
    b.poly([45, 58, 51, 58, 48, 62], '#d88a8a'); b.px(46, 58, '#f0b0b0');
    const open = ex.mouth === 'laugh' || ex.mouth === 'o';
    if (open) { b.oval(44, 63, 52, 70, C.mouthIn); b.rect(46, 67, 4, 2, C.tongue); }
    b.rect(48, 62, 1, 2, R[0]); b.line(48, 64, 45, 66, R[0]); b.line(48, 64, 51, 66, R[0]);
    for (const k of [-1, 1]) for (let i = 0; i < 3; i++) b.line(48 + k * 12, 62 + i * 3, 48 + k * 30, 58 + i * 5, A('#f8f4ec', 0.85));
    if (ex.blush) { b.oval(24, 58, 32, 62, C.blush); b.oval(64, 58, 72, 62, C.blush); }
  }

  // ---- composition ----------------------------------------------------------------------------------
  function drawAll(b, p, expr) {
    const C = palette(p);
    const ex = EXPR[EXPR_ALIAS[expr] || expr] || EXPR.neutral;
    const H = RB.portraits.hairStyles || {};
    const hs = H[p.style] || H.short;
    const ctx = { p, C, S, P };
    if (p.kind === 'cat') { drawCat(b, p, C, ex); return C; }
    accBack(b, p, C);
    if (hs && hs.back) hs.back(b, ctx);
    bust(b, p, C);
    const fm = faceMask(p.age === 'old');
    drawFace(b, p, C, fm);
    features(b, p, C, ex);
    if (p.beard) beard(b, p, C);
    accFront(b, p, C, ex);
    if (hs && hs.front) hs.front(b, ctx, fm);
    brows(b, p, C, ex);
    accHead(b, p, C);
    return C;
  }

  function build(p, expr, keyStr) {
    if (cache.has(keyStr)) return cache.get(keyStr);
    const b = new P.Buf(S, S);
    drawAll(b, p, expr || 'neutral');
    let cv = b.toCanvas();
    if (p.extra2 || p.extra) {
      // character-specific marks drawn by the content: extra2 at 96 px, older extra at 48 px (doubled)
      const c = cv.getContext('2d');
      c.save();
      if (!p.extra2) c.scale(2, 2);
      (p.extra2 || p.extra)(c, EXPR_ALIAS[expr] || expr || 'neutral');
      c.restore();
      const img = c.getImageData(0, 0, S, S);
      b.d.set(img.data);
    }
    b.threshold(110);
    b.outline('#1a141c', { minA: 1 });
    cv = b.toCanvas();
    cache.set(keyStr, cv);
    if (cache.size > 300) cache.delete(cache.keys().next().value);
    return cv;
  }
  // Background: flat bands stepping from the character's colour down to night, with a lighter disc
  // behind the head and a sparse dither where bands meet.
  const bgCache = new Map();
  function background(bg) {
    const key = bg || '#2a3048';
    let cv = bgCache.get(key);
    if (cv) return cv;
    const b = new P.Buf(S, S);
    const bands = 6;
    for (let i = 0; i < bands; i++) {
      const col = mix(key, '#0c0e16', i / (bands - 0.5));
      const y0 = Math.round((i * S) / bands), y1 = Math.round(((i + 1) * S) / bands);
      b.rect(0, y0, S, y1 - y0, col);
      if (i) { const prev = mix(key, '#0c0e16', (i - 1) / (bands - 0.5)); for (let x = (i % 2); x < S; x += 2) b.px(x, y0, prev); }
    }
    b.oval(8, 4, 87, 83, A(mix(key, '#fff4dc', 0.5), 0.07));
    cv = b.toCanvas();
    bgCache.set(key, cv);
    return cv;
  }
  function paint(target, img, bg) {
    const c = target.getContext('2d');
    target.width = S; target.height = S;
    c.imageSmoothingEnabled = false;
    c.drawImage(background(bg), 0, 0);
    c.drawImage(img, 0, 0);
  }
  function draw(target, id, expr) {
    const p = paramsFor(id);
    if (!p) return;
    paint(target, build(p, expr, id + '|' + expr), p.bg);
  }
  function drawPlayer(target, look, expr) {
    const p = fromLook(look);
    p.bg = '#2e3a34';
    paint(target, build(p, expr, 'pc|' + JSON.stringify(look) + '|' + expr), p.bg);
  }
  function image(id, expr) {
    const p = paramsFor(id);
    return p ? build(p, expr, id + '|' + expr) : null;
  }
  const EXPRESSIONS = Object.keys(EXPR);
  return { draw, drawPlayer, image, fromLook, S, EXPRESSIONS, background };
})();
