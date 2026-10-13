/* Drawing kit for the illustrated sequences (src/ui/43_sequence.js; shots in 43a_seq_ch1.js, 43b_seq_ch2.js
 * and later files). Shots are drawn at art resolution in the prologue's manner (src/ui/41_prologue_art.js;
 * its RB.pxkit materials, banded skies, stepped glows, selective outlines): a static layer per buffer size
 * and view height, cached here, plus the live things of the moment drawn per frame on top.
 *
 * People come from the game's own drawings, so a person in a shot is the same person as on the road and in
 * the dialogue: the road sprite rig (RB.sprites, with the pose layer's poses and held props) for figures,
 * shrunk onto the same pixel grid with RB.prologueArt.shrink when they stand further off, and the dialogue
 * portraits (RB.portraits, with their expression and frame descriptors: head offset, gaze, lids) for faces
 * close to us. Both are graded into the shot's light (dimmer, cooler or warmer, a rim of light on the side
 * that faces the source). Hands and held things close to us are drawn here (hand()).
 *
 *   RB.seqKit.stage(w, h, vb)                  { lay: 'wide'|'narrow'|'land', Z, s(n), cx, top, vb, w, h }
 *   RB.seqKit.cached(key, build)               a static layer (bounded; released with the sequence)
 *   RB.seqKit.figure(look, dir, key, scale, grade)   a graded road figure { cv, ax, ay, w, h }
 *   RB.seqKit.bust(who|{look}, expr, fr, grade, flip, ext, o) a graded portrait (96 × 96, transparent), or the person
 *                                              standing, ext rows to their feet (RB.portraitBody)
 *   RB.seqKit.hand(o)                          a hand { cv, ax, ay } (o: skin, size, pose, side, angle, sleeve)
 *   RB.seqKit.release() / stats()
 * Nothing here writes game state; everything built is cached and dropped on release(). */
var RB = (globalThis.RB = globalThis.RB || {});

RB.seqKit = (function () {
  'use strict';
  const K = () => RB.pxkit;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const ease = (k) => (k <= 0 ? 0 : k >= 1 ? 1 : k * k * (3 - 2 * k));
  const lerp = (a, b, k) => a + (b - a) * k;
  const R = (c, x, y, w, h, col) => { if (w <= 0 || h <= 0) return; if (col) c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
  const mk = (w, h) => RB.sprites.makeCanvas(Math.max(1, Math.round(w)), Math.max(1, Math.round(h)));
  const hex3 = (h) => { const n = parseInt(String(h).slice(1, 7), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const rampC = (base, n, o) => K().ramp(base, n, o).map((c) => K().css(c));

  // ---- caches -------------------------------------------------------------------------------------------
  // static layers (whole-picture canvases: a few at most) and small sprites (figures, busts, hands)
  const layers = new Map(), sprites = new Map();
  const stat = { built: 0, hits: 0 };
  function cached(key, build) {
    let v = layers.get(key);
    if (v) { stat.hits++; layers.delete(key); layers.set(key, v); return v; }
    v = build(); stat.built++;
    layers.set(key, v);
    while (layers.size > 10) layers.delete(layers.keys().next().value);
    return v;
  }
  function small(key, build) {
    let v = sprites.get(key);
    if (v !== undefined) return v;
    v = build() || null;
    sprites.set(key, v);
    while (sprites.size > 160) sprites.delete(sprites.keys().next().value);
    return v;
  }
  function release() { layers.clear(); sprites.clear(); }
  const stats = () => ({ layers: layers.size, sprites: sprites.size, built: stat.built, hits: stat.hits });

  // ---- layout ---------------------------------------------------------------------------------------------
  // A shot keeps what matters above the dialogue sheet: vb is the sheet's top (a buffer row). The layout
  // class follows SHOTS.md §0: 'wide' (desktops), 'narrow' (an upright phone: an authored vertical layout),
  // 'land' (a phone on its side: the sheet covers most of the height, so a tight crop in the top band).
  function stage(w, h, vb) {
    vb = clamp(vb == null ? h : vb, h * 0.3, h);
    const lay = w / h < 0.8 ? 'narrow' : vb / h < 0.56 && w / h > 1.45 ? 'land' : 'wide';
    const Z = clamp(Math.min(w / 380, vb / 230), 0.5, 1.4);
    return { lay, Z, s: (n) => Math.round(n * Z), cx: Math.round(w / 2), vb: Math.round(vb), w, h, top: Math.round(Math.max(4, h * 0.03)) };
  }

  // ---- grading ----------------------------------------------------------------------------------------------
  // g: { mul: [r, g, b] (0..1.2), add: [r, g, b], rim: { side: 'l' | 'r' | 't', col: '#rrggbb', k: [0.42, 0.2] },
  //      dim: 0..1 (toward a night tone), warm: 0..1 (toward lamplight) } — per pixel, never a blend between
  // pixels, so the drawing's own clusters stay.
  function grade(src, g) {
    if (!g) return src;
    const w = src.width, h = src.height;
    const d = src.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, w, h);
    const px = d.data, out = new Uint8ClampedArray(px);
    const op = (x, y) => x >= 0 && y >= 0 && x < w && y < h && px[(y * w + x) * 4 + 3] > 100;
    const mul = g.mul || [1, 1, 1], add = g.add || [0, 0, 0];
    const rim = g.rim, rc = rim ? hex3(rim.col || '#ffd8a0') : null, rk = rim ? rim.k || [0.42, 0.2] : null;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const o = (y * w + x) * 4;
      if (!px[o + 3]) continue;
      let r = px[o] * mul[0] + add[0], gg = px[o + 1] * mul[1] + add[1], b = px[o + 2] * mul[2] + add[2];
      if (rim) {
        // distance (1 or 2 px) from the silhouette's edge on the lit side
        let e = 0;
        if (rim.side === 'l') e = !op(x - 1, y) ? 1 : !op(x - 2, y) ? 2 : 0;
        else if (rim.side === 'r') e = !op(x + 1, y) ? 1 : !op(x + 2, y) ? 2 : 0;
        else e = !op(x, y - 1) ? 1 : !op(x, y - 2) ? 2 : 0;
        if (e && (rim.below == null || y < h * rim.below)) { const k = rk[e - 1] || 0; r += (rc[0] - r) * k; gg += (rc[1] - gg) * k; b += (rc[2] - b) * k; }
      }
      out[o] = r; out[o + 1] = gg; out[o + 2] = b;
    }
    const cv = mk(w, h);
    d.data.set(out);
    cv.getContext('2d').putImageData(d, 0, 0);
    return cv;
  }
  function flipX(src) {
    const cv = mk(src.width, src.height), g = cv.getContext('2d');
    g.translate(src.width, 0); g.scale(-1, 1); g.drawImage(src, 0, 0);
    return cv;
  }
  const gkey = (g) => (g ? JSON.stringify(g) : '');

  // ---- people ------------------------------------------------------------------------------------------------
  // A road figure (40 × 58 art px, feet at RB.sprites.ANCHOR) at a scale ≤ 1, graded. key: a frame key of
  // the sprite rig ('i0', 'w3', 'p:cuphold/cup', …).
  function figure(look, dir, key, scale, g) {
    if (!look) return null;
    scale = scale == null ? 1 : clamp(scale, 0.2, 1);
    return small('fig|' + JSON.stringify(look) + '|' + dir + '|' + key + '|' + scale.toFixed(3) + '|' + gkey(g), () => {
      const art = RB.sprites.getArt(look, dir, key) || RB.sprites.getArt(look, dir, 'i0');
      if (!art) return null;
      const A = RB.sprites.ANCHOR;
      let cv = art, ax = A.x, ay = A.y;
      if (scale < 0.999) {
        const s = RB.prologueArt.shrink(art, A.x, A.y, scale);
        cv = mk(s.w, s.h);
        const c = cv.getContext('2d'), img = c.createImageData(s.w, s.h);
        img.data.set(s.px); c.putImageData(img, 0, 0);
        ax = s.ax; ay = s.ay;
      }
      cv = grade(cv, g);
      return { cv, ax, ay, w: cv.width, h: cv.height };
    });
  }
  // A portrait (96 × 96, transparent) of a character id or { look } (the player), with an expression and
  // a frame descriptor (fr: { head: [dx, dy], body: [dx, dy], look: [gx, gy], lids, mouth, … }), graded,
  // optionally mirrored (only for people whose drawing is symmetric enough: the caller decides).
  // ext: the person standing, their feet ext rows below the frame: the rest of them drawn below the portrait in its
  // own manner (RB.portraitBody: arms, hands, the garment, the feet; AR-1 replaced repeating the bust's bottom row,
  // which painted every seam down as a stripe). o.arms: { l, r } ('side', 'clasp', { hold: [x, y] } to a hand the
  // shot draws, 'none'), in the portrait's frame coordinates. The anchor stays at the portrait's own bottom centre.
  // (who may also be { id, fest: true }: that person in the festival night's yukata, whenever the picture is shown;
  // fest: 'yn', in Steamhollow's evening yukata)
  function lookOf(who) {
    if (typeof who === 'string') return (RB.content.chars[who] || {}).look || {};
    if (who.id) {
      const lk = (RB.content.chars[who.id] || {}).look || {};
      return who.fest && RB.festDress ? RB.festDress.look(lk, who.id, who.fest === 'yn' ? 'yn' : 'mp') : lk;
    }
    return who.look || {};
  }
  // A portrait frame f (of parameters p) standing: the body below it, the frame, then the forearms that come in front
  // of it, all moved with the frame's body offset. Ungraded; the frame's bottom centre is (w / 2, 96).
  function standing(p, f, look, ext, o, fr) {
    if (!RB.portraitBody) return null;
    const bd = RB.portraitBody.below(p, look, ext, o);
    const off = (fr && fr.body) || [0, 0];
    // (a few rows below the feet for their shadow on the ground: without it a figure looked stood on nothing; AR-1)
    const cv = mk(bd.w, bd.h + 5), c = cv.getContext('2d');
    const fx = bd.w / 2 + off[0], fy = bd.h - 1 + off[1];
    for (const [rx, ry, a] of [[24, 4, 0.16], [17, 3, 0.2]]) {
      c.fillStyle = 'rgba(14,8,20,' + a + ')';
      for (let y = -ry; y <= ry; y++) { const hw = Math.round(rx * Math.sqrt(1 - (y / (ry + 0.5)) ** 2)); c.fillRect(Math.round(fx - hw), fy + y, hw * 2, 1); }
    }
    c.drawImage(bd.back.toCanvas(), off[0], off[1]);
    c.drawImage(f, bd.pad, 0);
    if (bd.front) c.drawImage(bd.front.toCanvas(), off[0], off[1]);
    return cv;
  }
  function bust(who, expr, fr, g, flip, ext, o) {
    const id = typeof who === 'string' ? who : who.id ? who.id + (who.fest ? '|fest' + (who.fest === 'yn' ? '|yn' : '') : '') : 'pc|' + JSON.stringify(who.look);
    ext = Math.max(0, Math.round(ext || 0));
    return small('bust|' + id + '|' + (expr || 'neutral') + '|' + (fr ? JSON.stringify(fr) : '') + '|' + gkey(g) + '|' + (flip ? 1 : 0) + '|' + ext + '|' + (o ? JSON.stringify(o) : ''), () => {
      let sj = typeof who === 'string' ? RB.portraits.subject(who) : who.id ? RB.portraits.subject(who.id) : RB.portraits.subject('pc', who.look);
      if (sj && who && who.id && who.fest && RB.festDress && !/\|yukata/.test(sj.key)) { const k = who.fest === 'yn' ? 'yn' : 'mp'; sj = Object.assign({}, sj, { key: sj.key + '|yukata' + (k === 'yn' ? '|yn' : ''), p: RB.festDress.portrait(sj.p, who.id, k) }); }
      const f = sj && RB.portraits.frame(sj, expr || 'neutral', fr || null);
      if (!f) return null;
      const H0 = f.height;
      let cv = ext ? standing(sj.p, f, lookOf(who), ext, o, fr) : null;
      if (!cv) { cv = mk(f.width, f.height); cv.getContext('2d').drawImage(f, 0, 0); }
      cv = grade(cv, g);
      if (flip) cv = flipX(cv);
      return { cv, ax: cv.width >> 1, ay: H0, w: cv.width, h: cv.height };
    });
  }
  // A standing person's arms for bust(…, ext, o): l and r are the screen points of the wrists of hands the shot draws
  // ([x, y], or null for an arm that hangs: rest, 'side' unless given), (bx, by) the bust's anchor; flip: the bust is
  // mirrored. Returns o with arms in the portrait's own frame (its bottom centre at 48, 96).
  function holdArms(bx, by, l, r, flip, rest) {
    const arms = { l: rest || 'side', r: rest || 'side' };
    // (to the nearest 2 px: a hand that moves a pixel does not rebuild the figure every frame)
    const q2 = (v) => 2 * Math.round(v / 2);
    const to = (pt) => { let x = 48 + q2(pt[0] - bx); if (flip) x = 96 - x; return { hold: [x, 96 + q2(pt[1] - by)] }; };
    if (l) arms[flip ? 'r' : 'l'] = to(l);
    if (r) arms[flip ? 'l' : 'r'] = to(r);
    return { arms };
  }
  const skinOf = (look) => RB.sprites.colorsOf(look || {}).skin;
  const clothOf = (look) => RB.sprites.colorsOf(look || {}).cloth;

  // A hand close to us, drawn with the pixel kit. Local frame: the wrist at (0, 0), the hand reaching
  // along +x; side 'R' (the person's right hand seen from the back) or 'L' (mirrored); angle in radians. An 'L' hand is
  // mirrored in its own frame before it turns, so it points along (cos a, −sin a): the left-for-right mirror of an 'R'
  // hand at angle a is an 'L' hand at a + π (−a or π − a turns it upside down: six such hands were; AR-2).
  //   pose  'rest'  lying flat, back of the hand up, fingers together
  //         'grip'  closed round something upright (a cup, a scroll, a chisel's handle)
  //         'offer' palm up and open, holding something out flat (an envelope, a card)
  //         'pinch' thumb and fingers together on an edge (taking a letter, holding a cloth)
  //         'point' the index finger out, the rest curled
  //   size  the palm's length in art px (≈ 9 for a person in a two-shot, 30–40 for an insert)
  //   skin  [base, shade] (RB.sprites.colorsOf(look).skin); sleeve / cuff: garment colours (optional)
  function hand(o) {
    o = o || {};
    const S = Math.max(5, Math.round(o.size || 10)), pose = o.pose || 'rest';
    const key = 'hand|' + [S, pose, o.side || 'R', (o.angle || 0).toFixed(2), (o.skin || []).join(','), o.sleeve || '', o.cuff || '', o.light || ''].join('|');
    return small(key, () => {
      const P = K(), pad = Math.ceil(S * 0.9) + 4, W = Math.ceil(S * 2.4 + pad * 2), H = W;
      const L = P.layer(W, H);
      const sk = o.skin || ['#dcae84', '#c28e64'];
      const skin = P.mat(sk[0], { n: 6, at: 3, step: 0.075, lineCol: '#2a1410' });
      L.translate(W / 2, H / 2);
      if (o.side === 'L') L.scale(1, -1);
      L.rotate(o.angle || 0);
      // shading: light from the upper left in buffer space, approximated in the hand's own frame
      const lit = (x, y) => clamp(0.78 - y / (S * 1.6) * 0.5 - (x > S ? 0.06 : 0), 0.05, 0.999);
      const sleeveL = o.sleeve ? Math.round(S * 0.9) : 0;
      if (o.sleeve) {
        const cl = P.mat(o.sleeve, { n: 5, at: 3, step: 0.09 });
        L.rect(-sleeveL - Math.round(S * 0.15), -Math.round(S * 0.48), sleeveL, Math.round(S * 0.96), cl, (x, y) => clamp(0.8 - (y + S * 0.48) / (S * 0.96) * 0.6, 0, 0.999));
        if (o.cuff) L.rect(-Math.round(S * 0.3), -Math.round(S * 0.46), Math.max(1, Math.round(S * 0.14)), Math.round(S * 0.92), P.mat(o.cuff, { n: 4, at: 2 }), (x, y) => (y < 0 ? 0.85 : 0.4));
      }
      const fw = Math.max(1.6, S * 0.2);               // a finger's width
      const fy = [-0.3, -0.1, 0.1, 0.29].map((v) => v * S); // the four fingers across the hand
      if (pose === 'rest' || pose === 'offer') {
        // palm, then four straight fingers, the thumb along the near side
        L.fill(-S * 0.1, -S * 0.42, S * 0.95, S * 0.42, (x, y) => { const a = x / (S * 0.95), b = y / (S * 0.42); return a >= -0.1 && Math.abs(b) <= 1 - Math.max(0, a - 0.75) * 0.6 && (a > 0.05 || Math.abs(b) < 0.85); }, skin, lit);
        const len = [0.6, 0.68, 0.64, 0.5];
        fy.forEach((y, i) => L.seg(S * 0.85, y, S * (0.85 + len[i]), y * 1.08, fw, skin, lit));
        L.seg(S * 0.2, -S * 0.36, S * 0.62, -S * 0.7, fw * 1.1, skin, lit);
      } else if (pose === 'grip') {
        // the back of the hand, then the fingers curled under (only their knuckles show), the thumb over
        L.fill(-S * 0.1, -S * 0.44, S * 0.92, S * 0.44, (x, y) => Math.abs(y) <= S * 0.44 - Math.max(0, x - S * 0.7) * 0.5, skin, lit);
        fy.forEach((y, i) => L.ell(S * 0.92, y, fw * 0.75, fw * 0.62, skin, (x, yy) => lit(x, yy) - 0.08 - i * 0.03));
        L.seg(S * 0.25, -S * 0.42, S * 0.8, -S * 0.56, fw * 1.1, skin, lit);
      } else if (pose === 'pinch') {
        L.fill(-S * 0.1, -S * 0.4, S * 0.85, S * 0.4, (x, y) => Math.abs(y) <= S * 0.4 - Math.max(0, x - S * 0.6) * 0.45, skin, lit);
        // fingers bent toward the thumb tip
        fy.forEach((y, i) => L.seg(S * 0.78, y, S * (1.18 - i * 0.04), y * 0.45 - S * 0.12, fw, skin, lit));
        L.seg(S * 0.2, -S * 0.36, S * 1.12, -S * 0.3, fw * 1.1, skin, lit);
      } else if (pose === 'point') {
        L.fill(-S * 0.1, -S * 0.42, S * 0.9, S * 0.42, (x, y) => Math.abs(y) <= S * 0.42 - Math.max(0, x - S * 0.7) * 0.5, skin, lit);
        L.seg(S * 0.85, fy[0], S * 1.75, fy[0] * 0.9, fw, skin, lit);
        fy.slice(1).forEach((y) => L.ell(S * 0.92, y, fw * 0.75, fw * 0.62, skin, (x, yy) => lit(x, yy) - 0.1));
        L.seg(S * 0.25, -S * 0.42, S * 0.75, -S * 0.5, fw * 1.1, skin, lit);
      }
      // the gaps between the fingers: one dark pixel line where two fingers meet
      L.outline();
      const cv = L.canvas();
      return { cv, ax: Math.round(W / 2), ay: Math.round(H / 2), w: W, h: H };
    });
  }

  // A person seen from behind and close to us (an over-the-shoulder shot), from their look: RB.seqBack (AR-1: the back
  // of the head in its hair, the collar, the shoulders and arms, the garment's back, continuing down past the old
  // drawing's bottom, or kneeling). W is the shoulders' width in art px; o: { light: 'l' | 'r', pose: 'kneel' }. Anchor:
  // the old drawing's bottom centre; w, h its size; head and shoulders are points on the canvas.
  function back(lk, W, o) {
    return small('back|' + JSON.stringify(lk) + '|' + W + '|' + JSON.stringify(o || {}), () => RB.seqBack.draw(lk, W, o));
  }

  // ---- small live things -----------------------------------------------------------------------------------
  // a gull far off: three dark pixels and a flap (scale 1 = 7 px across)
  function gull(c, x, y, t, sc, still, col) {
    const flap = still ? 1 : Math.floor(t / 230) % 4 === 0 ? 0 : 1, k = Math.max(1, Math.round(sc || 1));
    c.fillStyle = col || '#3e4652';
    c.fillRect(Math.round(x) - 3 * k, Math.round(y) - flap * k, 2 * k, k); c.fillRect(Math.round(x) - k, Math.round(y), k, k); c.fillRect(Math.round(x) + k, Math.round(y) - flap * k, 2 * k, k);
    if (k > 1 || sc > 1.5) { c.fillRect(Math.round(x) - 4 * k, Math.round(y) - flap * k - k, k, k); c.fillRect(Math.round(x) + 3 * k, Math.round(y) - flap * k - k, k, k); }
  }
  // dust in a shaft of light: pixels drifting slowly inside a quad (x0, y0)-(x1, y1) sheared by dx
  function dust(c, x0, y0, x1, y1, dx, t, n, rgb, still, seed) {
    const rnd = K().rnd(seed || 77);
    for (let i = 0; i < n; i++) {
      const u = rnd(), v0 = rnd(), sp = 0.4 + rnd();
      const v = still ? v0 : (v0 + t / (40000 / sp)) % 1;
      const x = x0 + (x1 - x0) * (u + (still ? 0 : Math.sin(t / 2700 + i) * 0.03)) + dx * v, y = y0 + (y1 - y0) * v;
      const a = still ? 0.4 : 0.22 + 0.3 * ((Math.sin(t / 800 + i * 1.7) + 1) / 2);
      c.fillStyle = 'rgba(' + (rgb || '255,236,200') + ',' + a.toFixed(3) + ')';
      c.fillRect(Math.round(x), Math.round(y), 1, 1);
    }
  }
  // steam over a cup (the prologue's), and its tea things
  const steam = (...a) => RB.prologueArt.kit.steam(...a);

  // a paper shōji panel: kumiko grid over paper, lit from behind when glow > 0 (0..1)
  function shoji(L, x, y, w, h, s, paperM, woodM, glow) {
    L.rect(x, y, w, h, paperM, (xx, yy) => clamp(0.55 + (glow || 0) * 0.4 - (yy - y) / h * 0.12, 0, 0.999));
    const gx = Math.max(4, s(9)), gy = Math.max(4, s(11));
    for (let xx = x + gx; xx < x + w - 1; xx += gx) L.rect(xx, y, 1, h, woodM, 1);
    for (let yy = y + gy; yy < y + h - 1; yy += gy) L.rect(x, yy, w, 1, woodM, 1);
    L.rect(x, y, w, Math.max(1, s(2)), woodM, 2); L.rect(x, y + h - Math.max(1, s(2)), w, Math.max(1, s(2)), woodM, 1);
    L.rect(x, y, Math.max(1, s(2)), h, woodM, 2); L.rect(x + w - Math.max(1, s(2)), y, Math.max(1, s(2)), h, woodM, 1);
  }

  // A floor from a wall's foot (y0) to the frame's bottom, in perspective: boards (or flags) running toward us,
  // their joints converging on (vx, the eye's height above), cross joints spaced wider as they come nearer, a shadow
  // along the wall's foot. For pictures whose people stand in front of a wall that used to run to the frame's bottom
  // (they stood on nothing once their bodies were drawn; AR-1). o: { col, vx, eye, n (joints across), cross (rows),
  // kind: 'boards' | 'flags', s }
  // A sleeved forearm from off the frame (x0, y0) to a wrist at (x1, y1) (where a hand() is drawn), wd wide at the wrist,
  // wider toward the elbow, the cuff at the wrist: for a hand reaching into a shot that had none (AR-1). grow: the far
  // end's width over the wrist's (3.4: an arm close to us, from the frame's edge; about 1.3: one reaching in from across)
  function sleeveTo(c, x0, y0, x1, y1, wd, col, grow, bare) {
    grow = grow == null ? 3.4 : grow;
    const p = RB.pxkit, m = Math.ceil(wd * (grow / 2 + 0.5)) + 2, ox = Math.floor(Math.min(x0, x1)) - m, oy = Math.floor(Math.min(y0, y1)) - m;
    const L = p.layer(Math.ceil(Math.abs(x1 - x0)) + 2 * m + 2, Math.ceil(Math.abs(y1 - y0)) + 2 * m + 2), M = p.mat(col || '#4a5a7a', { n: 6, at: 3, step: 0.08 });
    const dx = x1 - x0, dy = y1 - y0, d = Math.hypot(dx, dy) || 1, ex = x1 - dx / d * wd * 0.6, ey = y1 - dy / d * wd * 0.6;
    const pts = [];
    for (let i = 0; i <= 8; i++) { const u = i / 8; pts.push([lerp(x0, ex, u) - ox, lerp(y0, ey, u) - oy, Math.round(wd * lerp(grow, 1, Math.pow(u, 0.7)))]); }
    L.path(pts, wd, M, 3);
    for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], q = pts[i]; L.seg(a[0] - dy / d * a[2] * 0.3, a[1] + dx / d * a[2] * 0.3, q[0] - dy / d * q[2] * 0.3, q[1] + dx / d * q[2] * 0.3, Math.max(1, q[2] * 0.22), M, 5); }
    if (!bare) L.seg(x1 - ox - dx / d * wd * 0.7, y1 - oy - dy / d * wd * 0.7, x1 - ox - dx / d * wd * 0.35, y1 - oy - dy / d * wd * 0.35, wd * 1.05, M, 1);
    L.outline();
    c.drawImage(L.canvas(), ox, oy);
  }
  // The forearm of a hand drawn on its own (an insert: a hand and what it holds, close), from under the hand's cuff back
  // along the hand's own line to past the frame's edge: without it the cuff ended in mid-air and the hand floated (AR-2,
  // at the game's real picture sizes). Drawn before the hand. (wx, wy): the wrist, where the hand is drawn;
  // o: the hand's { angle, side, size, sleeve }, grow (as sleeveTo; default 1.4), to: [x, y] (the arm's far end, when it
  // comes from elsewhere than straight back). Returns the far end.
  function forearm(c, wx, wy, o) {
    const S = Math.max(5, Math.round(o.size || 10)), a = o.angle || 0;
    const dx = -Math.cos(a), dy = o.side === 'L' ? Math.sin(a) : -Math.sin(a);
    let to = o.to;
    if (!to) {
      const W = c.canvas.width, H = c.canvas.height, pad = S * 3;
      let t = 1e9;
      if (dx > 1e-3) t = Math.min(t, (W + pad - wx) / dx); else if (dx < -1e-3) t = Math.min(t, (-pad - wx) / dx);
      if (dy > 1e-3) t = Math.min(t, (H + pad - wy) / dy); else if (dy < -1e-3) t = Math.min(t, (-pad - wy) / dy);
      to = [wx + dx * t, wy + dy * t];
    }
    // (it ends under the cuff: the hand's own sleeve is the cuff and covers the join)
    sleeveTo(c, to[0], to[1], wx + dx * S * 0.55, wy + dy * S * 0.55, Math.max(3, Math.round(S * 0.86)), o.sleeve, o.grow == null ? 1.4 : o.grow, true);
    return to;
  }
  const hash2 =(i, k) => { const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return v - Math.floor(v); };
  function floor(g, w, h, y0, o) {
    o = o || {};
    y0 = Math.round(y0);
    if (y0 >= h) return;
    const s = o.s || ((n) => n), base = hex3(o.col || '#5a4434'), kind = o.kind || 'boards';
    const tone = (k) => 'rgb(' + base.map((v) => clamp(Math.round(v * k), 0, 255)).join(',') + ')';
    const vx = o.vx == null ? w / 2 : o.vx, eye = o.eye == null ? y0 - (h - y0) * 1.4 : o.eye;
    const depth = (y) => (y - eye) / (h - eye);            // 0 at the eye's height, 1 at the frame's bottom
    // the floor: a little lighter toward us, in two flat steps
    R(g, 0, y0, w, h - y0, tone(0.92));
    R(g, 0, Math.round(y0 + (h - y0) * 0.35), w, h, tone(1));
    R(g, 0, Math.round(y0 + (h - y0) * 0.72), w, h, tone(1.06));
    if (kind === 'earth') {
      // packed earth: pebbles and dark grit, larger toward us
      for (let i = 0; i < w * (h - y0) * 0.004; i++) {
        const x = Math.floor(hash2(i, 3) * w), y = y0 + Math.floor(hash2(i, 7) * (h - y0)), z = Math.max(1, Math.round(depth(y) * 2.2));
        R(g, x, y, z, Math.max(1, z - 1), tone(hash2(i, 11) < 0.5 ? 0.78 : 1.18));
      }
      R(g, 0, y0, w, Math.max(1, s(2)), tone(0.6));
      return;
    }
    // the joints toward us (each board's edge), converging on the eye's point
    const n = o.n || 14, span = w * 1.6;
    for (let i = 0; i <= n; i++) {
      const xb = vx - span / 2 + (span * i) / n;
      for (let y = y0; y < h; y++) { const x = Math.round(vx + (xb - vx) * depth(y)); if (x >= 0 && x < w) R(g, x, y, 1, 1, tone(0.72)); }
    }
    // the cross joints: board ends staggered (boards), or a grid of flags
    const rows = o.cross || 7;
    for (let r = 1; r <= rows; r++) {
      const y = Math.round(eye + (h - eye) * Math.pow((y0 - eye) / (h - eye), 1 - r / (rows + 1)));
      if (y <= y0 || y >= h) continue;
      if (kind === 'flags') { R(g, 0, y, w, 1, tone(0.7)); continue; }
      for (let i = 0; i < n; i++) {
        if ((i + r) % 3) continue;
        const xa = vx + (vx - span / 2 + (span * i) / n - vx) * depth(y), xb2 = vx + (vx - span / 2 + (span * (i + 1)) / n - vx) * depth(y);
        R(g, Math.round(xa), y, Math.round(xb2 - xa), 1, tone(0.74));
      }
    }
    // the wall's foot: a skirting edge and its shadow on the floor
    R(g, 0, y0, w, Math.max(1, s(2)), tone(0.55));
    g.fillStyle = 'rgba(10,6,14,0.22)'; g.fillRect(0, y0 + Math.max(1, s(2)), w, Math.max(2, s(5)));
  }

  return {
    R, mk, clamp, ease, lerp, hex3, rampC, cached, small, release, stats, stage, grade, flipX, floor, sleeveTo, forearm,
    figure, bust, standing, lookOf, holdArms, back, hand, skinOf, clothOf, gull, dust, steam, shoji,
    bandsIn: (...a) => RB.prologueArt.kit.bandsIn(...a),
    chochin: (...a) => RB.prologueArt.kit.chochin(...a),
  };
})();
