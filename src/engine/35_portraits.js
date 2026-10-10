/* Procedural 96×96 portraits with expressions, drawn as pixel art into a
 * buffer (hard edges, hue-shifted ramps, locks of hair with a broken
 * highlight band, a selective outline). Parameters come from the character
 * definition (portrait: {...}) layered over what the overworld look implies,
 * so each named character keeps a distinct face, hair, collar and
 * accessories. Hair shapes live in 36_portraithair.js.
 *
 * A portrait is composed from layers (back accessories, back hair, bust,
 * face, front accessories, front hair, glasses, brows, head accessories) so
 * the dialogue's animated portraits (src/ui/21_portrait_anim.js) can move the
 * body and the head a pixel apart, sway hair a beat later and change the eyes
 * without redrawing everything: each layer and each finished frame is cached
 * (one byte-capped LRU), and a frame is described by a small object `fr`
 * (eyes, lids, gaze, brow, mouth, blush, head/body offsets, sway, glasses
 * glint and slip). With no `fr` the result is the still portrait every other
 * screen shows. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.portraits = (function () {
  'use strict';
  const S = 96;
  const P = RB.pix;
  const shade = P.shade, mix = P.mix, A = P.alpha;

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
      earCol: look.earCol, capCol: look.capCol, leafCol: look.leafCol, scarfStripe: look.scarfStripe, bellCol: look.bellCol, cordCol: look.cordCol,
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
      // darker skin tones (the sprites' 3–6): the lash, iris and shadowed skin are close in value, so
      // the eye gets a lit lower lid and a softer crease (PORTRAITS.md §3 item 3)
      dark: P.lum(sk) < 0.62,
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
  // the neck belongs to the body (it stays with the collar when the head moves a pixel)
  function neck(b, p, C) {
    const K = C.sk;
    b.rect(40, 60, 16, 20, K[1]);
    b.rect(40, 62, 3, 18, K[2]);
    b.rect(53, 60, 3, 20, K[0]);
    b.poly([40, 62, 56, 62, 56, 69, 48, 73, 40, 69], K[0]);
  }
  function drawFace(b, p, C, m) {
    const K = C.sk;
    // ears: rim, inner fold, shadowed on the far side
    for (const [x0, x1, lit] of [[22, 28, true], [68, 74, false]]) {
      b.oval(x0, 40, x1, 54, lit ? K[2] : K[1]);
      b.oval(x0 + 2, 43, x1 - 2, 51, lit ? K[1] : K[0]);
      b.rect(lit ? x0 + 1 : x1 - 2, 42, 1, 6, lit ? K[3] : K[1]);
    }
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
    // narrow eyes: one lash row over the same three-row opening (it was two lash rows: a dark bar that
    // read the same whether open, smiling or closed; PORTRAITS.md §3 item 4). The opening keeps its
    // height so the narrow-eyed elders and Ren keep their look.
    narrow: [
      '.............',
      '.............',
      '..kkkkkkkkkk.',
      '.kwwwwwwwwwkk',
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
  const EYE_CX = [37, 59], EYE_CY = 45;
  // the rows an eye occupies (with its crease), for clipping the fringe out of it
  const EYE_TOP = EYE_CY - 4;
  function eye(b, p, C, cx, cy, side, e) {
    const K = C.sk, st = EYE_T[p.eyes] ? p.eyes : 'round';
    const X = (i) => (side > 0 ? cx - 6 + i : cx + 5 - i);
    const put = (rows, y0, map) => rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) { const c = map[r[i]]; if (c) b.px(X(i), y0 + j, c); } });
    if (e.closed) {
      const rows = e.closed === 'up' ? CLOSED_UP : CLOSED_DOWN;
      put(rows, cy - 1, { k: C.lash });
      if (e.closed === 'down') { b.px(X(12), cy - 2, C.lash); b.px(X(12), cy - 3, C.lash); }
      if (C.dark) for (let i = 4; i <= 8; i++) b.px(X(i), cy + (e.closed === 'up' ? -2 : 3), K[3]); // the lid catches the light
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
    // iris: a tall oval, 7 px wide and centred in the opening so white shows on both sides (gaze and
    // surprise read from the white); its upper rim a step lighter than the lash line so the two do not
    // merge into one dark band, a dark pupil, a lighter lower half, glints (PORTRAITS.md §3 items 1–2)
    const lk = e.look || [0, 0];
    const iw = e.wide ? 5 : 7, ih = e.wide ? 6 : j1 - j0 + 2;
    const ic = (i0 + i1) / 2 + lk[0], jc = e.wide ? (j0 + j1) / 2 + 0.5 : j0 + ih / 2 - 1 + lk[1];
    const I = C.iris;
    for (let j = j0 - 1; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      if (!isOpen(i, j)) continue;
      const a = (i - ic) / (iw / 2), bb = (j + 0.5 - jc) / (ih / 2);
      if (a * a + bb * bb > 1) continue;
      const t = (j - (jc - ih / 2)) / ih;
      b.px(X(i), y0 + j, t < 0.3 ? I[1] : t > 0.68 ? I[3] : I[2]);
    }
    // the iris's top edge under the lid: one row of the iris's mid tone where it meets the lash
    const pi = Math.round(ic), pj = Math.round(jc - (e.wide ? 0 : 0.5));
    for (let j = pj - (e.wide ? 0 : 1); j <= pj + (e.wide ? 0 : 1); j++) for (let i = pi - (e.wide ? 0 : 1); i <= pi + (e.wide ? 0 : 1); i++) {
      if (!isOpen(i, j) || j < j0 + 1) continue;
      b.px(X(i), y0 + j, i === pi || e.wide ? I[0] : I[1]);
    }
    // glints: a big one to the upper left of the pupil, a small one low right
    const gi = Math.round(ic - iw / 2 + 1), gj = j0 + 1;
    for (const [i, j] of [[gi, gj], [gi + 1, gj], [gi, gj + 1], [gi + 1, gj + 1]]) if (isOpen(i, j)) b.px(X(i), y0 + j, '#ffffff');
    if (isOpen(Math.round(ic + iw / 2 - 1), j1 - 1)) b.px(X(Math.round(ic + iw / 2 - 1)), y0 + j1 - 1, A('#ffffff', 0.75));
    if (e.tear) { b.px(X(gi), y0 + j1, '#ffffff'); b.px(X(gi + 1), y0 + j1, A('#cfe8ff', 0.9)); }
    // lashes and lower lid over everything
    put(T, y0, { k: C.lash, l: mix(C.lash, K[1], 0.55) });
    // a lit rim under the lower lid on darker skin, so the eye's shape holds against the cheek
    if (C.dark && !e.cheek) T[T.length - 1].split('').forEach((ch, i) => { if (ch === 'l') b.px(X(i), y0 + T.length, K[3]); });
    // crease above the lid (softer on darker skin, where it joined the lash into one shadow)
    const crease = C.dark ? mix(K[1], K[2], 0.5) : K[1];
    if (!p.acc.includes('glasses')) for (let i = 2; i <= 10; i++) b.px(X(i), y0 - 2 + (i < 4 || i > 9 ? 1 : 0), crease);
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
  const exprName = (expr) => { const e = EXPR_ALIAS[expr] || expr; return EXPR[e] ? e : 'neutral'; };

  // The expression with a frame's overrides: fr.expr (another expression for a cue's first beat),
  // fr.lids 'half' | 'closed' (a blink), fr.look (gaze), fr.wink (the viewer's right eye closed in a
  // smile), fr.eyes / fr.eyesR (raw eye modifiers), fr.brow, fr.mouth, fr.blush (0 none … 1 full).
  function resolve(expr, fr) {
    const base = EXPR[exprName((fr && fr.expr) || expr)];
    let eyL = Object.assign({}, base.eyes), eyR = Object.assign({}, base.eyes, base.eyesR || {});
    const ex = { brow: base.brow, mouth: base.mouth, blush: base.blush ? 1 : 0, lines: !!base.lines };
    if (fr) {
      if (fr.eyes) { Object.assign(eyL, fr.eyes); Object.assign(eyR, fr.eyes); }
      if (fr.eyesR) Object.assign(eyR, fr.eyesR);
      if (fr.look) { eyL.look = fr.look; eyR.look = fr.look; }
      if (fr.lids === 'half') {
        const half = (e) => Object.assign({}, e, { closed: undefined, wide: false, angry: false, heavy: true });
        eyL = e0(eyL) ? half(eyL) : eyL; eyR = e0(eyR) ? half(eyR) : eyR;
      } else if (fr.lids === 'closed') {
        const shut = (e) => ({ closed: e.closed === 'up' ? 'up' : 'down' });
        eyL = shut(eyL); eyR = shut(eyR);
      }
      if (fr.wink) eyR = { closed: 'up' };
      if (fr.brow) ex.brow = fr.brow;
      if (fr.mouth) ex.mouth = fr.mouth;
      if (fr.blush != null) ex.blush = fr.blush;
      if (ex.blush < 1) ex.lines = false;
    }
    ex.eyL = eyL; ex.eyR = eyR;
    return ex;
  }
  const e0 = (e) => !e.closed; // an open eye (a half blink only lowers an open lid)

  // Brows: their pixels (for drawing, and for cutting the fringe away round them).
  function browPixels(p, C, kind0) {
    const y0 = 34 + (p.browY || 0) * 2;
    const thick = p.brows === 'thick' ? 3 : 2;
    const out = [];
    for (const side of [-1, 1]) {
      const cx = side < 0 ? 37 : 59;
      let kind = kind0;
      if (kind === 'raise') kind = side > 0 ? 'high' : 'flat';
      // points: inner, middle, outer (u grows outward)
      const pts = { flat: [[-4, 1], [1, 0], [6, 1]], up: [[-4, 0], [1, -1], [6, 0]], high: [[-4, -1], [1, -3], [6, -2]], worry: [[-4, -2], [1, 0], [6, 2]], angry: [[-4, 3], [1, 1], [6, -1]] }[kind] || [[-4, 1], [1, 0], [6, 1]];
      const X = (u) => cx + (side > 0 ? u : -u - 1);
      for (let i = 0; i < 2; i++) {
        const [u0, v0] = pts[i], [u1, v1] = pts[i + 1];
        for (let u = u0; u <= u1; u++) {
          const v = Math.round(v0 + ((v1 - v0) * (u - u0)) / (u1 - u0));
          const t = u >= 5 ? thick - 1 : thick;
          for (let k = 0; k < t; k++) out.push([X(u), y0 + v + k, k === t - 1 ? 1 : 0]);
        }
      }
    }
    return out;
  }
  function browColour(p, C) {
    const old = p.age === 'old';
    return p.browCol || (old ? '#d8d4d0' : shade(C.hair[1], -1));
  }
  function brows(b, p, C, ex) {
    const col = browColour(p, C);
    // a light brow on light skin (white-haired elders, grey or gold hair) vanished: keep its colour
    // and give it a darker underside from the skin's shadow (PORTRAITS.md §3 item 6)
    const low = Math.abs(P.lum(col) - P.lum(C.sk[2])) < 0.3;
    const under = low ? mix(C.lash, col, 0.3) : col;
    for (const [x, y, last] of browPixels(p, C, ex.brow)) b.px(x, y, last ? under : col);
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
    eye(b, p, C, EYE_CX[0], EYE_CY, -1, ex.eyL);
    eye(b, p, C, EYE_CX[1], EYE_CY, 1, ex.eyR);
    if (ex.blush > 0 || p.blush) {
      const bl = ex.blush > 0 && ex.blush < 1 && !p.blush ? A('#f08080', 0.38 * ex.blush) : C.blush;
      b.oval(29, 53, 39, 57, bl); b.oval(57, 53, 67, 57, bl);
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
  function accFront(b, p, C) {
    const a = p.acc;
    if (a.includes('scarf')) {
      const R = R4(p.scarfCol || '#c8962e');
      b.poly([18, 82, 26, 68, 40, 72, 48, 74, 56, 72, 70, 68, 78, 82, 64, 88, 48, 86, 32, 88], R[2]);
      b.poly([18, 82, 26, 68, 40, 72, 36, 80, 28, 86], R[3]);
      b.line(26, 70, 70, 70, R[3]); b.line(30, 80, 66, 80, R[1]); b.line(40, 74, 56, 74, R[1]);
      b.poly([60, 82, 72, 82, 74, 96, 60, 96], R[2]); b.rect(70, 82, 4, 14, R[1]); b.rect(60, 82, 2, 14, R[3]);
      for (let x = 61; x < 74; x += 3) b.rect(x, 94, 1, 2, R[0]);
      if (p.scarfStripe) { // a knitted keepsake scarf: bands across the wrap and the tail
        const S = R4(p.scarfStripe);
        for (let x = 21; x <= 75; x++) { // two bands following the wrap's curve
          const u = (x - 48) / 26, top = 73 - 5 * u * u, bot = 86 + 2 * u * u;
          for (const k of [0.3, 0.64]) { const y = Math.round(top + (bot - top) * k); b.rect(x, y, 1, 2, S[2]); b.px(x, y, S[3]); }
        }
        for (const y of [86, 91]) { b.rect(60, y, 14, 2, S[2]); b.rect(60, y, 14, 1, S[3]); }
      }
    }
    if (a.includes('bell')) { // a little bell on a red cord at the collar
      const cord = p.cordCol || '#b8342a', G = p.bellCol ? R4(p.bellCol).slice(1, 4) : GOLD;
      b.line(36, 72, 48, 80, cord, 2); b.line(60, 72, 48, 80, cord, 2);
      b.rect(47, 79, 2, 3, cord);
      b.oval(42, 81, 54, 91, G[1]); b.oval(43, 82, 47, 86, G[2]); b.rect(41, 89, 15, 3, G[1]); b.rect(41, 89, 15, 1, G[2]); b.rect(52, 84, 2, 5, G[0]);
      b.rect(47, 92, 3, 2, '#5a4020'); b.rect(44, 87, 9, 1, G[0]);
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
    if (a.includes('atlas_pin')) { // a compass rose: four points round a blue heart
      b.poly([33, 70, 36, 79, 33, 82, 30, 79], GOLD[2]); b.poly([33, 94, 30, 85, 33, 82, 36, 85], GOLD[0]);
      b.poly([21, 82, 30, 79, 33, 82, 30, 85], GOLD[1]); b.poly([45, 82, 36, 85, 33, 82, 36, 79], GOLD[1]);
      b.oval(29, 78, 37, 86, GOLD[1]); b.oval(31, 80, 35, 84, '#3a5a8a'); b.px(32, 81, '#8ab0e0');
    }
    if (a.includes('cape')) { const R = R4(p.capeCol || '#6a3a4a'); b.poly([10, 80, 24, 72, 34, 76, 22, 84], R[2]); b.poly([86, 80, 72, 72, 62, 76, 74, 84], R[1]); b.oval(44, 70, 51, 77, GOLD[1]); b.px(46, 72, GOLD[2]); }
    if (a.includes('atlas_lamplet')) lantern(b, 80, 80); // held, so it stays with the body
    if (a.includes('atlas_compass')) { // the brass case at the left hip, its needle pointing north
      b.oval(10, 84, 22, 96, GOLD[1]); b.oval(12, 86, 20, 94, '#e8e0c8'); b.line(16, 87, 16, 91, '#a83e27'); b.line(16, 91, 16, 93, '#3a3440'); b.px(13, 86, GOLD[2]);
    }
  }
  // Glasses, drawn before the brows (the brows stay readable above the frame) with a lighter top
  // rim one row lower than before (PORTRAITS.md §3 item 5). g: { dy: slipped (+1) or pushed up (−1),
  // glint: 0…3 a light crossing the lenses, or null for the resting highlight }.
  function glasses(b, p, C, g) {
    const fc = p.glassCol || '#2e2a30', dy = (g && g.dy) || 0;
    const top = mix(fc, C.sk[1], 0.45);
    for (const cx of [37, 59]) {
      const y = 39 + dy;
      b.rect(cx - 6, y, 12, 1, top); b.rect(cx - 6, 52 + dy, 12, 1, fc); b.rect(cx - 8, y + 2, 1, 11 - (y + 2 - 40), fc); b.rect(cx + 6, y + 2, 1, 11 - (y + 2 - 40), fc);
      b.px(cx - 7, y + 1, fc); b.px(cx + 5, y + 1, fc); b.px(cx - 7, 51 + dy, fc); b.px(cx + 5, 51 + dy, fc);
      b.rect(cx - 7, y + 1, 13, 52 + dy - (y + 1), A('#e8f4ff', 0.1));
      if (g && g.glint != null) { // a diagonal band of light sweeping across the lens, left to right
        const x0 = cx - 7 + g.glint * 4;
        for (let k = 0; k < 9; k++) { const x = x0 + Math.floor(k / 2), yy = y + 2 + 8 - k; if (x >= cx - 7 && x <= cx + 5) { b.px(x, yy, A('#ffffff', 0.75)); b.px(x + 1, yy, A('#ffffff', 0.4)); } }
      } else { b.px(cx + 3, 41 + dy, A('#ffffff', 0.7)); b.px(cx + 4, 42 + dy, A('#ffffff', 0.5)); b.px(cx + 2, 42 + dy, A('#ffffff', 0.4)); }
    }
    b.rect(44, 43 + dy, 8, 1, fc); b.rect(21, 42 + dy, 8, 1, fc); b.rect(67, 42 + dy, 8, 1, fc);
  }
  // Head accessories over the hair and the brows. sw: the secondary-motion offset (−1, 0, 1) of the
  // parts that hang (ribbon tails, earring drops), a beat behind the head.
  function accHead(b, p, C, sw) {
    const a = p.acc;
    sw = sw || 0;
    if (a.includes('goggles') || a.includes('atlas_goggles')) {
      b.rect(22, 21, 52, 5, '#5a4a3a'); b.rect(22, 21, 52, 1, '#7a6a5a');
      for (const cx of [38, 58]) { b.oval(cx - 8, 16, cx + 7, 30, '#3a3a3a'); b.oval(cx - 6, 18, cx + 5, 28, '#8fb8b0'); b.oval(cx - 5, 19, cx - 1, 23, '#d8f0e8'); }
    }
    if (a.includes('headband')) {
      const R = R4(p.bandCol || C.ac[1]);
      for (let x = 20; x <= 76; x++) { const y = 25 + Math.round(((x - 48) / 28) ** 2 * 5); b.rect(x, y, 1, 5, R[2]); b.px(x, y, R[3]); b.px(x, y + 4, R[1]); }
      b.poly([74, 28, 82, 26, 84, 34, 76, 34], R[1]); b.poly([76 + sw, 33, 82 + sw, 40, 78 + sw, 42, 74, 34], R[0]);
    }
    if (a.includes('hood')) {
      const R = R4(p.hoodCol || C.cl[1]);
      const m = new P.Buf(S, S);
      m.poly([14, 96, 16, 36, 24, 16, 48, 4, 72, 16, 80, 36, 82, 96, 72, 96, 72, 50, 68, 30, 48, 16, 28, 30, 24, 50, 24, 96], '#fff');
      m.each((x, y) => { let v = 2; if (x < 26 && y < 60) v = 3; if (x > 70) v = 1; if (y < 18 && x < 44) v = 3; b.px(x, y, R[v]); });
      b.line(28, 30, 48, 16, R[3]); b.line(48, 16, 68, 30, R[1]); b.line(24, 50, 28, 30, R[3]); b.line(72, 50, 68, 30, R[0]);
      b.line(34, 10, 30, 20, R[1]); b.line(62, 10, 66, 20, R[0]);
      if (sw) { b.line(24 + sw, 52, 24 + sw, 70, R[sw < 0 ? 3 : 1]); b.line(72 + sw, 52, 72 + sw, 70, R[sw < 0 ? 1 : 0]); } // the hood's edge stirs
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
      b.poly([68, 22, 74 + sw, 30, 73 + sw, 38, 67, 29], R[1]); b.poly([72, 22, 82 + sw, 31, 84 + sw, 40, 76 + sw, 30], R[0]);  // tails
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
    if (a.includes('cap')) { // a peaked cap: crown, dark band with a brass badge, a stiff peak over the brow
      const R = R4(p.capCol || '#2c4468');
      const crown = new P.Buf(S, S);
      crown.poly([22, 26, 24, 12, 34, 4, 48, 2, 62, 4, 72, 12, 74, 26], '#fff');
      crown.each((x, y) => { let v = x < 36 ? 3 : x > 62 ? 1 : 2; if (x < 32 && y < 12) v = 4; b.px(x, y, R[v]); });
      b.rect(22, 22, 53, 6, R[1]); b.rect(22, 27, 53, 1, R[0]); b.rect(24, 22, 10, 1, R[2]);
      b.oval(43, 10, 53, 20, GOLD[1]); b.oval(44, 11, 48, 15, GOLD[2]); b.px(52, 19, GOLD[0]);
      b.poly([20, 28, 76, 28, 72, 34, 24, 34], R[0]); b.rect(24, 28, 48, 1, R[1]);
      b.rect(26, 35, 44, 2, A('#1a1020', 0.28));
    }
    if (a.includes('leaf')) { // a maple-leaf pin in the hair
      const R = R4(p.leafCol || '#c8452a');
      b.poly([70, 4, 73, 12, 80, 8, 78, 16, 86, 16, 80, 22, 82, 28, 74, 25, 70, 30, 66, 25, 58, 28, 60, 22, 54, 16, 62, 16, 60, 8, 67, 12], R[2]);
      b.poly([70, 4, 73, 12, 70, 18, 67, 12], R[3]); b.poly([54, 16, 62, 16, 70, 18, 60, 22], R[3]);
      b.poly([86, 16, 80, 22, 82, 28, 70, 18], R[1]);
      b.line(70, 8, 70, 26, R[1]); b.line(70, 18, 58, 14, R[1]); b.line(70, 18, 82, 14, R[1]);
      b.line(70, 26, 66, 34, '#6a4a2a', 2);
    }
    if (a.includes('earrings')) {
      const G = p.earCol ? R4(p.earCol).slice(1, 4) : GOLD;
      for (const x of [24, 71]) { b.oval(x, 54, x + 2, 56, GOLD[1]); b.rect(x + 1, 57, 1, 3, GOLD[0]); b.oval(x - 1 + sw, 59, x + 3 + sw, 64, G[1]); b.px(x + sw, 60, G[2]); b.px(x + 2 + sw, 63, G[0]); }
    }
    if (a.includes('pencil')) { b.line(66, 30, 82, 12, '#e0b040', 3); b.line(67, 31, 83, 13, '#b88a20'); b.rect(81, 9, 4, 4, '#e8a0a0'); b.rect(64, 30, 3, 3, '#3a3040'); }
    if (a.includes('atlas_quill')) { b.line(68, 32, 80, 4, '#f4f0e0', 3); b.line(70, 32, 82, 6, '#d8d0bc'); b.px(68, 32, '#6a5a3a'); }
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
    for (const [cx, e] of [[36, ex.eyL || {}], [60, ex.eyR || {}]]) {
      const side = cx < 48 ? -1 : 1;
      if (e.closed) {
        const up = e.closed === 'up';
        for (let u = -6; u <= 6; u++) { const v = Math.round(((u * u) / 36) * 3) * (up ? 1 : -1); b.rect(cx + u, 48 + v, 1, 2, C.lash); }
        continue;
      }
      const oy = e.heavy ? 3 : 0;
      const lx = (e.look && e.look[0]) || 0;
      for (let y = 42 + oy; y <= 54; y++) for (let x = cx - 7; x <= cx + 7; x++) {
        const nx = (x + 0.5 - cx) / 7.5, ny = (y + 0.5 - 48) / 6.5;
        if (nx * nx + ny * ny > 1) continue;
        b.px(x, y, ny < -0.4 ? '#8a9a30' : ny > 0.4 ? '#d8e070' : '#b8c850');
      }
      const pw = e.wide ? 4 : 2;
      b.rect(cx - (pw >> 1) + lx, 43 + oy, pw, 11 - oy, '#1a1614');
      b.rect(cx - 4 + lx, 44 + oy, 2, 2, '#ffffff'); b.px(cx + 3 + lx, 51, A('#ffffff', 0.8));
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
    if (ex.blush > 0) { b.oval(24, 58, 32, 62, C.blush); b.oval(64, 58, 72, 62, C.blush); }
  }

  // ---- cache: one LRU of layers and finished frames, capped by bytes ------------------------------------
  // A finished frame is a 96×96 canvas (36 KiB); a layer is kept cropped to its own pixels (a pair of brows is
  // ≈1 KiB, a bust ≈11 KiB). The cap replaces the old 300-entry FIFO of finished portraits (which could reach
  // ≈10.5 MiB): layers are shared by all of a portrait's frames, so the same bytes hold far more frames.
  const ENTRY = S * S * 4;
  const sizeOf = (v) => (!v ? 0 : v.crop ? v.w * v.h * 4 : ENTRY);
  const lru = new Map();
  const stat = { cap: 8 * 1024 * 1024, bytes: 0, hits: 0, misses: 0, layers: 0, frames: 0, evicted: 0, ms: 0, maxMs: 0, layerMs: {} };
  function cget(k) {
    if (!lru.has(k)) { stat.misses++; return undefined; }
    const v = lru.get(k);
    lru.delete(k); lru.set(k, v); // most recent last
    stat.hits++;
    return v.v;
  }
  function cset(k, v) {
    const bytes = sizeOf(v);
    if (lru.has(k)) { stat.bytes -= lru.get(k).b; lru.delete(k); }
    lru.set(k, { v, b: bytes });
    stat.bytes += bytes;
    while (stat.bytes > stat.cap && lru.size > 1) {
      const [ok, ov] = lru.entries().next().value;
      lru.delete(ok); stat.bytes -= ov.b; stat.evicted++;
    }
  }
  function clearCache(prefix) {
    for (const [k, v] of Array.from(lru)) if (!prefix || k.startsWith(prefix)) { lru.delete(k); stat.bytes -= v.b; }
  }

  // ---- layers and composition ------------------------------------------------------------------------------
  // [id, group]: group 'body' moves with the shoulders (breath, weight shift), 'head' with the head (a
  // pixel later), 'hairB' with the head plus the sway (long hair and tails lag behind).
  const NO_HALO = { wrap: 1, bald: 1, shaved: 1 };
  function layerList(p) {
    if (p.kind === 'cat') return [['cat', 'head']];
    const L = [];
    if (p.acc.includes('cape')) L.push(['cape', 'body']);
    L.push(['hairB', 'hairB'], ['bust', 'body'], ['skin', 'head'], ['feat', 'head']);
    if (p.beard) L.push(['beard', 'head']);
    L.push(['front', 'body'], ['hairF', 'head']);
    if (p.acc.includes('glasses')) L.push(['glasses', 'head']);
    L.push(['brows', 'head'], ['headAcc', 'head']);
    return L;
  }
  // the parts of a layer's key that the frame changes
  function layerKey(id, p, ex, fr) {
    switch (id) {
      case 'feat': return JSON.stringify([ex.eyL, ex.eyR, ex.mouth, ex.blush, ex.lines]);
      case 'cat': return JSON.stringify([ex.eyL, ex.eyR, ex.mouth, ex.blush]);
      case 'hairF': case 'brows': return ex.brow;
      case 'glasses': return ((fr && fr.glassDy) || 0) + ',' + (fr && fr.glint != null ? fr.glint : '');
      case 'headAcc': return String((fr && fr.sway) || 0);
      default: return '';
    }
  }
  function drawLayer(id, p, C, ex, fr, hairF0) {
    const b = new P.Buf(S, S);
    const H = RB.portraits.hairStyles || {};
    const hs = H[p.style] || H.short;
    const ctx = { p, C, S, P, hairF0 };
    switch (id) {
      case 'cat': drawCat(b, p, C, ex); break;
      case 'cape': accBack(b, p, C); break;
      case 'hairB': if (hs && hs.back) hs.back(b, ctx); break;
      case 'bust': bust(b, p, C); neck(b, p, C); break;
      case 'skin': drawFace(b, p, C, faceMask(p.age === 'old')); break;
      case 'feat': features(b, p, C, ex); break;
      case 'beard': beard(b, p, C); break;
      case 'front': accFront(b, p, C); break;
      case 'hairF0': if (hs && hs.front) hs.front(b, ctx, faceMask(p.age === 'old')); break;
      case 'hairF': { // the front hair (drawn once per person) with the eyes and this brow cut out of it
        if (ctx.hairF0) b.d.set(uncrop(ctx.hairF0).d);
        clipFringe(b, p, C, ex);
        break;
      }
      case 'glasses': glasses(b, p, C, { dy: (fr && fr.glassDy) || 0, glint: fr && fr.glint != null ? fr.glint : null }); break;
      case 'brows': brows(b, p, C, ex); break;
      case 'headAcc': accHead(b, p, C, (fr && fr.sway) || 0); break;
    }
    return b;
  }
  // The fringe never covers the eyes (it stops two rows above the opening: tips used to reach into
  // the upper lid), and a one-pixel margin of skin is cut round the brows, so a dark brow on a dark
  // fringe (Nao, Mio, Ren, Wataru …) and a light one on a light fringe (Tsuru) still read
  // (PORTRAITS.md §3 item 7).
  function clipFringe(b, p, C, ex) {
    // the eye's inner columns only: side locks keep their edge at the outer corners
    for (const [x0, x1] of [[EYE_CX[0] - 4, EYE_CX[0] + 5], [EYE_CX[1] - 6, EYE_CX[1] + 3]]) {
      for (let y = EYE_TOP; y <= EYE_CY + 5; y++) for (let x = x0; x <= x1; x++) b.clear(x, y);
    }
    if (NO_HALO[p.style]) return;
    // under each brow column, the fringe is cut from the brow down to the eye (a strand of hair left
    // between brow and eye read as a second, thicker brow)
    for (const [x, y] of browPixels(p, C, ex.brow)) for (let yy = y - 1; yy < EYE_TOP; yy++) b.clear(x, yy);
  }
  // A layer cropped to the box of its opaque pixels: { crop, x0, y0, w, h, d } (null when empty).
  function crop(b) {
    let x0 = S, y0 = S, x1 = -1, y1 = -1;
    const d = b.d;
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) if (d[(y * S + x) * 4 + 3]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    if (x1 < 0) return null;
    const w = x1 - x0 + 1, h = y1 - y0 + 1, out = new Uint8ClampedArray(w * h * 4);
    for (let y = 0; y < h; y++) out.set(d.subarray(((y0 + y) * S + x0) * 4, ((y0 + y) * S + x0 + w) * 4), y * w * 4);
    return { crop: true, x0, y0, w, h, d: out };
  }
  function uncrop(L) {
    const b = new P.Buf(S, S);
    if (L) for (let y = 0; y < L.h; y++) b.d.set(L.d.subarray(y * L.w * 4, (y + 1) * L.w * 4), ((L.y0 + y) * S + L.x0) * 4);
    return b;
  }
  // dst ← layer L shifted by (dx, dy): rows and columns brought in from the frame's bottom and side edges
  // repeat the edge (the bust and long hair reach the bottom edge, the shoulders the sides)
  function blit(dst, L, dx, dy) {
    const s = L.d, d = dst.d, w = L.w, h = L.h;
    const bottom = L.y0 + h === S, left = L.x0 === 0, right = L.x0 + w === S;
    const ya = Math.max(0, L.y0 + dy), yb = Math.min(S - 1, bottom && dy < 0 ? S - 1 : L.y0 + h - 1 + dy);
    const xa = Math.max(0, left && dx > 0 ? 0 : L.x0 + dx), xb = Math.min(S - 1, right && dx < 0 ? S - 1 : L.x0 + w - 1 + dx);
    for (let y = ya; y <= yb; y++) {
      let sy = y - dy - L.y0;
      if (sy < 0) continue;
      if (sy > h - 1) sy = h - 1;
      for (let x = xa; x <= xb; x++) {
        let sx = x - dx - L.x0;
        if (sx < 0) sx = 0; else if (sx > w - 1) sx = w - 1;
        const o = (sy * w + sx) * 4, a = s[o + 3];
        if (!a) continue;
        const q = (y * S + x) * 4, da = d[q + 3];
        if (a === 255 || !da) { d[q] = s[o]; d[q + 1] = s[o + 1]; d[q + 2] = s[o + 2]; d[q + 3] = a; continue; }
        // source over destination (the same blend as RB.pix's put)
        const sa = a / 255, dA = da / 255, oa = sa + dA * (1 - sa);
        d[q] = (s[o] * sa + d[q] * dA * (1 - sa)) / oa;
        d[q + 1] = (s[o + 1] * sa + d[q + 1] * dA * (1 - sa)) / oa;
        d[q + 2] = (s[o + 2] * sa + d[q + 2] * dA * (1 - sa)) / oa;
        d[q + 3] = oa * 255;
      }
    }
  }
  const off = (v) => (v ? [v[0] || 0, v[1] || 0] : [0, 0]);

  // A finished frame as a buffer (no canvas: node tests use this). subj: a stable key for the caches.
  function renderBuf(p, expr, fr, subj) {
    const t0 = typeof performance !== 'undefined' ? performance.now() : 0;
    const C = palette(p);
    const ex = resolve(expr || 'neutral', fr);
    const head = off(fr && fr.head), body = off(fr && fr.body), sway = (fr && fr.sway) || 0;
    const out = new P.Buf(S, S);
    const layer = (id) => {
      const k = subj != null ? subj + '|L|' + id + '|' + layerKey(id, p, ex, fr) : null;
      let lb = k ? cget(k) : undefined;
      if (lb === undefined) {
        const t1 = typeof performance !== 'undefined' ? performance.now() : 0;
        lb = crop(drawLayer(id, p, C, ex, fr, id === 'hairF' ? layer('hairF0') : null));
        stat.layers++;
        if (t1) stat.layerMs[id] = (stat.layerMs[id] || 0) + (performance.now() - t1);
        if (k) cset(k, lb);
      }
      return lb;
    };
    for (const [id, group] of layerList(p)) {
      const lb = layer(id);
      if (!lb) continue;
      const o = group === 'body' ? body : group === 'hairB' ? [head[0] + sway, head[1]] : head;
      blit(out, lb, o[0], o[1]);
    }
    if (typeof performance !== 'undefined') { const ms = performance.now() - t0; stat.ms += ms; stat.maxMs = Math.max(stat.maxMs, ms); }
    return out;
  }
  function finish(b, p, expr, fr) {
    if (p.extra2 || p.extra) {
      // character-specific marks drawn by the content: extra2 at 96 px, older extra at 48 px (doubled);
      // they follow the head, and are told the frame (a construct can blink too)
      const cv = b.toCanvas();
      const c = cv.getContext('2d');
      c.save();
      const h = off(fr && fr.head);
      c.translate(h[0], h[1]);
      if (!p.extra2) c.scale(2, 2);
      (p.extra2 || p.extra)(c, exprName((fr && fr.expr) || expr || 'neutral'), fr || null);
      c.restore();
      b.d.set(c.getImageData(0, 0, S, S).data);
    }
    b.threshold(110);
    b.outline('#1a141c', { minA: 1 });
    return b;
  }
  // A stable string for a frame descriptor (the cache key and what the animation compares).
  function frameKey(fr) {
    if (!fr) return '';
    const j = (v) => (v == null ? '' : Array.isArray(v) ? v.join(',') : typeof v === 'object' ? JSON.stringify(v) : String(v));
    return [fr.expr, fr.lids, fr.look, fr.wink ? 1 : '', fr.eyes, fr.eyesR, fr.brow, fr.mouth, fr.blush, fr.head && (fr.head[0] || fr.head[1]) ? fr.head : '', fr.body && (fr.body[0] || fr.body[1]) ? fr.body : '', fr.sway || '', fr.glint, fr.glassDy || ''].map(j).join('|').replace(/\|+$/, '');
  }
  function build(p, expr, subj, fr) {
    const key = subj + '|F|' + exprName(expr || 'neutral') + '|' + frameKey(fr);
    const hit = cget(key);
    if (hit) return hit;
    const b = finish(renderBuf(p, expr, fr, subj), p, expr, fr);
    const cv = b.toCanvas();
    stat.frames++;
    cset(key, cv);
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
    if (bgCache.size > 64) bgCache.clear();
    bgCache.set(key, cv);
    return cv;
  }
  function paint(target, img, bg) {
    const c = target.getContext('2d');
    if (target.width !== S) target.width = S;
    if (target.height !== S) target.height = S;
    c.imageSmoothingEnabled = false;
    c.drawImage(background(bg), 0, 0);
    c.drawImage(img, 0, 0);
  }

  // ---- subjects: a character, or the player's portrait from the look they wear ----------------------------
  const PC_BG = '#2e3a34';
  function subject(who, look) {
    if (who === 'pc' || look) {
      const lk = look || (RB.equip ? RB.equip.look() : {});
      const p = fromLook(lk);
      p.bg = PC_BG;
      return { key: 'pc|' + JSON.stringify(lk), p, who: 'pc' };
    }
    const p = paramsFor(who);
    return p ? { key: who, p, who } : null;
  }
  // the frame of a subject (a canvas without background) and painted with its background
  function frame(sj, expr, fr) { return sj ? build(sj.p, expr, sj.key, fr) : null; }
  function paintFrame(target, sj, expr, fr) {
    if (!sj) return false;
    paint(target, frame(sj, expr, fr), sj.p.bg);
    return true;
  }

  // ---- the still portraits every screen uses --------------------------------------------------------------
  function draw(target, id, expr) { paintFrame(target, subject(id), expr, null); }
  function drawPlayer(target, look, expr) { paintFrame(target, subject('pc', look || {}), expr, null); }
  function image(id, expr) { const sj = subject(id); return sj ? frame(sj, expr, null) : null; }
  // The player's portrait without its background (transparent), S×S — for
  // previews that sit on paper (character creation).
  function playerImage(look, expr) { return frame(subject('pc', look || {}), expr, null); }
  // facts the animation needs: which expressions hold their eyes closed, which look aside or open wide
  function exprInfo(expr) {
    const e = EXPR[exprName(expr)];
    return { name: exprName(expr), closed: !!e.eyes.closed, wide: !!e.eyes.wide, look: e.eyes.look || null, heavy: !!e.eyes.heavy };
  }
  const EXPRESSIONS = Object.keys(EXPR);
  return {
    draw, drawPlayer, image, playerImage, fromLook, S, EXPRESSIONS, background,
    // animation (src/ui/21_portrait_anim.js) and tests
    subject, frame, paintFrame, frameKey, exprInfo, exprName, paramsFor, renderBuf: (p, expr, fr, subj) => finish(renderBuf(p, expr, fr, subj), p, expr, fr),
    cacheStats: () => Object.assign({ entries: lru.size }, stat), setCacheCap: (bytes) => { stat.cap = bytes; }, clearCache,
    debug: { EYE_T, EYE_CX, EYE_CY, EYE_TOP, browPixels: (p, kind) => browPixels(p, palette(p), kind), layerList },
  };
})();
