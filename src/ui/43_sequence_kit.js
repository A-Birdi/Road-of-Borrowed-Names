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
 *   RB.seqKit.bust(who|{look}, expr, fr, grade, flip) a graded portrait (96 × 96, transparent)
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
  // ext: rows to continue the bust below its frame (its bottom row repeated, so a torso cut by a shorter
  // sheet never shows a hard edge); the anchor stays at the portrait's own bottom.
  function bust(who, expr, fr, g, flip, ext) {
    const id = typeof who === 'string' ? who : 'pc|' + JSON.stringify(who.look);
    ext = Math.max(0, Math.round(ext || 0));
    return small('bust|' + id + '|' + (expr || 'neutral') + '|' + (fr ? JSON.stringify(fr) : '') + '|' + gkey(g) + '|' + (flip ? 1 : 0) + '|' + ext, () => {
      const sj = typeof who === 'string' ? RB.portraits.subject(who) : RB.portraits.subject('pc', who.look);
      const f = sj && RB.portraits.frame(sj, expr || 'neutral', fr || null);
      if (!f) return null;
      let cv = mk(f.width, f.height);
      cv.getContext('2d').drawImage(f, 0, 0);
      cv = grade(cv, g);
      if (flip) cv = flipX(cv);
      const H0 = cv.height;
      if (ext) {
        const tall = mk(cv.width, H0 + ext), tg = tall.getContext('2d');
        tg.drawImage(cv, 0, 0);
        // each column's lowest opaque pixel, repeated down (the outline row is skipped so no line runs down)
        const d = cv.getContext('2d', { willReadFrequently: true }).getImageData(0, H0 - 3, cv.width, 1).data;
        for (let x = 0; x < cv.width; x++) { const o = x * 4; if (d[o + 3] < 200) continue; tg.fillStyle = 'rgb(' + d[o] + ',' + d[o + 1] + ',' + d[o + 2] + ')'; tg.fillRect(x, H0 - 2, 1, ext + 2); }
        cv = tall;
      }
      return { cv, ax: cv.width >> 1, ay: H0, w: cv.width, h: cv.height };
    });
  }
  const skinOf = (look) => RB.sprites.colorsOf(look || {}).skin;
  const clothOf = (look) => RB.sprites.colorsOf(look || {}).cloth;

  // A hand close to us, drawn with the pixel kit. Local frame: the wrist at (0, 0), the hand reaching
  // along +x; side 'R' (the person's right hand seen from the back) or 'L' (mirrored); angle in radians.
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

  // A person seen from behind and close to us (an over-the-shoulder shot): shoulders and back, the nape, the
  // back of the head in their hair (short, bun, braid or long), a hat if they wear one, the arm of their
  // glasses at the temple. From their look; W is the shoulders' width in art px. Anchor: bottom centre.
  function back(lk, W, o) {
    o = o || {};
    return small('back|' + JSON.stringify(lk) + '|' + W + '|' + JSON.stringify(o), () => {
      const p = K(), col = RB.sprites.colorsOf(lk || {}), acc = (lk && lk.acc) || [];
      const H = Math.round(W * 1.05), L = p.layer(W, H), cx = W / 2;
      const coat = p.mat(col.cloth[0], { n: 6, at: 3, step: 0.08 }), hair = p.mat(col.hair[0], { n: 6, at: 3, step: 0.08 }), skin = p.mat(col.skin[1] || col.skin[0], { n: 5, at: 2 });
      const lit = o.light === 'r' ? -1 : 1;
      const sh = H * 0.56, half = (y) => (y < sh ? 0 : W * (0.18 + 0.3 * Math.sqrt(clamp((y - sh) / (H * 0.14), 0, 1))));
      L.fill(0, sh, W, H, (x, y) => Math.abs(x - cx) <= half(y), coat, (x, y) => clamp(0.66 - lit * (x - cx) / W * 0.6 - (y - sh) / H * 0.3, 0.02, 0.999));
      L.line(cx, sh + H * 0.08, cx, H, coat, 1);
      if (lk && (lk.shape === 'coat' || lk.shape === 'robe')) L.ell(cx, sh + 1, W * 0.2, H * 0.04, coat, 4); // a high collar
      // the nape and the head
      L.rect(cx - W * 0.08, sh - H * 0.08, W * 0.16, H * 0.1, skin, (x) => clamp(0.5 - lit * (x - cx) / W, 0, 0.999));
      const hy = sh - H * 0.2, hr = W * 0.16;
      L.ell(cx, hy, hr, hr * 1.1, hair, (x, y) => clamp(0.62 - lit * (x - cx) / hr * 0.3 - (y - hy) / hr * 0.15 + (((Math.round(x * 2 + y)) % 5) === 0 ? 0.12 : 0), 0, 0.999));
      const style = (lk && lk.hair) || 'short';
      if (style === 'bun') L.ell(cx, hy - hr * 0.9, hr * 0.55, hr * 0.5, hair, (x, y) => clamp(0.7 - lit * (x - cx) / hr * 0.4, 0, 0.999));
      if (style === 'long' || style === 'braid' || style === 'ponytail') L.rect(cx - hr * 0.5, hy, hr, H * 0.24, hair, (x) => clamp(0.6 - lit * (x - cx) / hr * 0.3, 0, 0.999));
      // ears' edges at the sides of the head
      if (acc.includes('glasses')) { const g2 = p.solid('#2a2430'); L.line(cx - hr - 1, hy - hr * 0.1, cx - hr * 0.6, hy - hr * 0.15, g2); L.line(cx + hr * 0.6, hy - hr * 0.15, cx + hr + 1, hy - hr * 0.1, g2); }
      if (acc.includes('hat')) {
        const hm = p.mat(lk.hatCol || '#3a3a44', { n: 6, at: 3, step: 0.08 }), by = hy - hr * 0.35;
        L.ell(cx, by, W * 0.4, H * 0.06, hm, (x, y) => clamp((y < by ? 0.8 : 0.45) - lit * (x - cx) / W * 0.4, 0, 0.999));
        L.ell(cx, by - hr * 0.55, hr * 1.05, hr * 0.7, hm, (x, y) => clamp(0.82 - lit * (x - cx) / W * 0.9 - (y - by) / hr * 0.1, 0, 0.999));
      }
      L.outline();
      return { cv: L.canvas(), ax: Math.round(cx), ay: H, w: W, h: H, head: { x: Math.round(cx), y: Math.round(hy), r: Math.round(hr) } };
    });
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

  return {
    R, mk, clamp, ease, lerp, hex3, rampC, cached, small, release, stats, stage, grade, flipX,
    figure, bust, back, hand, skinOf, clothOf, gull, dust, steam, shoji,
    bandsIn: (...a) => RB.prologueArt.kit.bandsIn(...a),
    chochin: (...a) => RB.prologueArt.kit.chochin(...a),
  };
})();
