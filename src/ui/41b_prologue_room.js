/* The prologue's teahouse at dawn (shots 2 and 3): Hana behind her counter
 * with two cups of tea poured, the window's dawn and its light falling
 * across the counter; then the same room a little later, Hana unable to
 * remember who the second cup was for (it is ringed in light, its steam
 * thinning into motes). Hana is her own dialogue portrait, graded into the
 * room's light. Drawn with RB.pxkit at art resolution in the title scene's
 * manner (see 41_prologue_art.js). */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const A = RB.prologueArt, { R, mk, clamp, cached, stage, bandsIn } = A.kit;
  const K = () => RB.pxkit;
  const rampC = (base, n, o) => K().ramp(base, n, o).map((c) => K().css(c));

  // Where everything stands, from the buffer size and the height left above the slip.
  function geom(w, h, vb) {
    const S = stage(w, h, vb), { cx, Zx, s } = S;
    const x = (n) => Math.round(cx + n * Zx);
    const yC = Math.round(vb - s(24));               // the counter's front edge
    const top = s(14);                                // the counter top's depth
    const beamY = Math.max(s(34), Math.round(yC - Math.max(s(176), yC * 0.6)));
    const win = { x0: x(-222), x1: x(-78), y0: beamY + s(20), y1: yC - top - s(30) };
    return Object.assign(S, {
      x, yC, top, beamY, win, w, h, vb,
      hana: { x: x(66), y: yC - top + s(4) },         // the portrait's bottom centre; its lowest rows are behind the counter
      pot: { x: x(-116), y: yC - s(5) },
      cups: [{ x: x(-52), y: yC - s(6) }, { x: x(-14), y: yC - s(4) }],
      posts: [x(-252), x(146)],
    });
  }

  // ---- props (small pxkit sprites; anchor = the base's centre on the counter) ------------------
  const sprites = new Map();
  const sprite = (key, build) => { let s = sprites.get(key); if (!s) { s = build(); sprites.set(key, s); } return s; };
  A.kit.onRelease(() => sprites.clear());
  function scaled(sp, Z) {
    if (Z >= 0.999) return sp;
    const s = A.shrink(sp.cv, sp.ax, sp.ay, Z), cv = mk(s.w, s.h), g = cv.getContext('2d'), img = g.createImageData(s.w, s.h);
    img.data.set(s.px); g.putImageData(img, 0, 0);
    return { cv, ax: s.ax, ay: s.ay, w: s.w, h: s.h, top: Math.round(sp.top * Z) };
  }
  // A yunomi: tapered body in a cream glaze with an indigo line, an unglazed
  // foot, green tea at the mouth catching the window's light.
  function cupSprite() {
    return sprite('cup', () => {
      const P = K(), W = 26, H = 28, L = P.layer(W, H);
      const glaze = P.mat('#e2d8c2', { n: 6, at: 3, step: 0.09 }), foot = P.mat('#a07452', { n: 4 }), band = P.mat('#34467a', { n: 4, at: 2 });
      const tea = P.mat('#7c9a34', { n: 5, at: 2, step: 0.08 });
      const cx = 13, yt = 7, yb = 24, rt = 8.5, rb = 6.5;
      const inBody = (x, y) => { const t = (y - yt) / (yb - yt); return y >= yt && y <= yb && Math.abs(x - cx) <= rt + (rb - rt) * t; };
      L.fill(cx - rt, yt, cx + rt, yb, inBody, glaze, P.cyl(cx - 1, rt, { amb: 0.22, rim: 0.12 }));
      L.recolor((x, y) => y >= yt + 3 && y < yt + 4 && inBody(x, y), glaze, band, (x) => (x < cx - 3 ? 0.9 : x < cx + 3 ? 0.6 : 0.3));
      L.rect(cx - rb + 1, yb - 1, rb * 2 - 2, 3, foot, (x) => (x < cx - 2 ? 0.8 : x < cx + 2 ? 0.5 : 0.2));
      // the mouth: a lit rim round the tea, darker toward the far wall of the cup
      L.ell(cx, yt, rt, 3, glaze, (x, y) => (y < yt ? 0.7 : 0.95));
      L.ell(cx, yt + 0.5, rt - 1.6, 1.8, tea, (x, y) => (y < yt ? 0.25 : x < cx ? 0.85 : 0.55));
      L.dot(cx - 4, yt, tea, 4);
      L.outline();
      // a crisp glint on the glaze, upper left
      L.dot(cx - 6, yt + 5, P.solid('#fffaf0')); L.dot(cx - 6, yt + 6, P.solid('#f4ecd8'));
      return { cv: L.canvas(), ax: cx, ay: yb + 1, w: W, h: H, top: yb + 1 - yt };
    });
  }
  // a ring one pixel outside a sprite's silhouette (the second cup, remembered)
  function ringOf(sp, col) {
    const W = sp.cv.width + 2, H = sp.cv.height + 2, d = sp.cv.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, sp.cv.width, sp.cv.height).data;
    const on = (x, y) => x >= 0 && y >= 0 && x < sp.cv.width && y < sp.cv.height && d[(y * sp.cv.width + x) * 4 + 3] > 100;
    const cv = mk(W, H), g = cv.getContext('2d');
    g.fillStyle = col;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const X = x - 1, Y = y - 1;
      if (on(X, Y)) continue;
      if (on(X - 1, Y) || on(X + 1, Y) || on(X, Y - 1) || on(X, Y + 1)) g.fillRect(x, y, 1, 1);
    }
    return cv;
  }
  // A side-handled kyūsu in red-brown clay: squat body, low lid and knob, the
  // spout toward the cups, the handle out to the back left.
  function potSprite() {
    return sprite('pot', () => {
      const P = K(), W = 66, H = 46, L = P.layer(W, H);
      const clay = P.mat('#a85a38', { n: 6, at: 3, step: 0.095 });
      const bx = 32, by = 28;
      L.seg(bx - 10, by - 3, bx - 28, by - 11, 6, clay, P.lin(bx - 20, by - 14, bx - 20, by - 4, 0.8, 0.3));
      L.ell(bx - 28, by - 11, 3, 3, clay, 1);
      L.dot(bx - 28, by - 11, clay, 0);
      L.ell(bx, by, 17, 13, clay, P.sphere(bx - 2, by - 1, 17, 13, { amb: 0.1, rim: 0.14 }));
      L.rect(bx - 10, by + 11, 20, 3, clay, (x) => (x < bx - 4 ? 0.45 : 0.2));
      L.path([[bx + 13, by + 1, 7], [bx + 21, by - 3, 5], [bx + 27, by - 9, 3]], 4, clay, P.lin(bx + 14, by - 12, bx + 18, by + 2, 0.75, 0.3));
      L.dot(bx + 28, by - 10, clay, 0);
      L.ell(bx, by - 12, 10, 3.2, clay, P.sphere(bx - 2, by - 13, 10, 4, { amb: 0.2 }));
      L.ell(bx, by - 15.5, 2.6, 2, clay, (x) => (x < bx ? 0.8 : 0.45));
      L.line(bx - 10, by - 10, bx + 9, by - 10, clay, 0);
      L.outline();
      L.rect(bx - 10, by - 7, 3, 1, P.solid('#fff0d8')); L.dot(bx - 11, by - 6, P.solid('#ffe0b8')); L.dot(bx - 11, by - 5, P.solid('#f0b890'));
      L.dot(bx + 22, by - 5, P.solid('#f8c8a0'));
      return { cv: L.canvas(), ax: bx, ay: by + 14, w: W, h: H, top: 30 };
    });
  }
  // a lacquered tray under the cups: dark red, a lit far edge
  function traySprite() {
    return sprite('tray', () => {
      const P = K(), W = 74, H = 12, L = P.layer(W, H);
      const lac = P.mat('#6a1e1c', { n: 5, at: 2 });
      L.fill(1, 2, W - 1, 9, (x, y) => { const e = Math.min(x - 1, W - 1 - x); return e + (y - 2) * 1.6 > 2 || y > 4; }, lac, (x, y) => (y < 4 ? 0.95 : y < 6 ? 0.55 : 0.3));
      L.rect(3, 8, W - 6, 2, lac, 0);
      L.outline();
      return { cv: L.canvas(), ax: W >> 1, ay: 9, w: W, h: H, top: 7 };
    });
  }

  // Hana in the room's light: dimmer and cooler, the window's warm dawn
  // along the edges that face it (her left, our left).
  function hanaSprite(expr, Z) {
    return sprite('hana|' + expr + '|' + Z, () => {
      const src = RB.portraits && RB.portraits.image('hana', expr);
      if (!src) return null;
      const S = src.width, d = src.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, S, S);
      const px = d.data, op = (x, y) => x >= 0 && y >= 0 && x < S && y < S && px[(y * S + x) * 4 + 3] > 100;
      const out = new Uint8ClampedArray(px);
      for (let y = 0; y < S; y++) {
        let edge = -1;
        for (let x = 0; x < S; x++) {
          const o = (y * S + x) * 4;
          if (!px[o + 3]) continue;
          if (edge < 0 && op(x, y)) edge = x;
          let r = px[o] * 0.8 + 4, g = px[o + 1] * 0.74 + 4, b = px[o + 2] * 0.76 + 12;
          const e = x - edge;
          if (edge >= 0 && e >= 1 && e <= 2 && y < S * 0.8) { const k = e === 1 ? 0.42 : 0.2; r += (255 - r) * k; g += (206 - g) * k; b += (160 - b) * k; }
          out[o] = r; out[o + 1] = g; out[o + 2] = b;
        }
      }
      const cv = mk(S, S);
      d.data.set(out);
      cv.getContext('2d').putImageData(d, 0, 0);
      return scaled({ cv, ax: S >> 1, ay: S, w: S, h: S, top: S }, Z);
    });
  }

  // ---- the room (static) --------------------------------------------------------------------------
  function room(w, h, vb, later) {
    return cached('room|' + w + 'x' + h + '|' + Math.round(vb) + '|' + (later ? 1 : 0), () => {
      const G = geom(w, h, vb), { yC, top, beamY, win, s, Z } = G;
      const cv = mk(w, h), g = cv.getContext('2d');
      g.imageSmoothingEnabled = false;
      const P = K();
      const WOOD = rampC('#6a4028', 6, { at: 3, step: 0.1 });       // posts, beam, frames
      const PALE = rampC('#9a6a42', 6, { at: 3, step: 0.09 });      // the counter (hinoki, oiled)
      // back wall: plaster in the half-light, a little lighter toward the counter
      bandsIn(g, 0, 0, w, yC - top, ['#16111a', '#1b151e', '#211a23', '#281f28', '#2f242c', '#362a30'], 0.4);
      // ceiling planks above the transom
      const ceil = beamY - s(30);
      if (ceil > 0) {
        R(g, 0, 0, w, ceil, '#100c13');
        for (let y = ceil - 1; y > 0; y -= s(8)) { R(g, 0, y, w, 1, '#1a141c'); R(g, 0, y - 1, w, 1, '#0a080c'); }
      }
      // the transom: slats with the dawn showing faintly between them
      bandsIn(g, 0, ceil, w, beamY - ceil, later ? ['#3a2c3c', '#4e3844', '#5e4248'] : ['#2c2234', '#3a2a3a', '#4a3240'], 0.5);
      for (let x0 = 0; x0 < w; x0 += s(7)) { R(g, x0, ceil, s(4), beamY - ceil, WOOD[0]); R(g, x0, ceil, 1, beamY - ceil, WOOD[1]); }
      R(g, 0, ceil, w, 2, WOOD[1]); R(g, 0, ceil, w, 1, WOOD[2]);
      // the beam
      R(g, 0, beamY, w, s(10), WOOD[2]); R(g, 0, beamY, w, 1, WOOD[4]); R(g, 0, beamY + 1, w, 1, WOOD[3]); R(g, 0, beamY + s(10) - 1, w, 1, WOOD[0]);
      R(g, 0, beamY + s(10), w, 2, 'rgba(6,4,8,0.45)');
      // the window: the dawn over the reeds, behind a lattice; the right half a lit shōji
      const { x0, x1, y0, y1 } = win, ww = x1 - x0, wh = y1 - y0;
      const hz = y0 + Math.round(wh * 0.68);
      const SKY = later
        ? ['#3a3a68', '#4c4472', '#6a4e76', '#8e5c74', '#b86e72', '#da8a76', '#f0ac80', '#f8cc96']
        : ['#262648', '#30304f', '#463a5c', '#643f62', '#8a4a66', '#b45e6a', '#da7e70', '#f0a47e'];
      bandsIn(g, x0, y0, ww, hz - y0, SKY, 0.5);
      // far hills, then the river's far bank with reeds; the water holds the dawn
      for (let x = x0; x < x1; x++) {
        const v = Math.sin(x * 0.045 + 1.3) * 0.6 + Math.sin(x * 0.13 + 0.4) * 0.4;
        const t1 = hz - Math.round(s(7) + v * s(4)), t2 = hz - Math.round(s(3) + Math.sin(x * 0.09 + 2) * s(2));
        R(g, x, t1, 1, hz - t1, later ? '#5a4060' : '#44304e'); R(g, x, t1, 1, 1, later ? '#7a5470' : '#5a3c5a');
        R(g, x, t2, 1, hz - t2 + 1, later ? '#3c2c44' : '#2e2238');
      }
      bandsIn(g, x0, hz + 1, ww, y1 - hz - 1, later ? ['#6a5070', '#4a3a58', '#3a2e48'] : ['#563e5e', '#3e3050', '#2e2440'], 0.5);
      for (let i = 0; i < 9; i++) { const yy = hz + 2 + ((i * 5) % Math.max(2, y1 - hz - 4)), xx = x0 + ((i * 37) % Math.max(4, ww - 20)); R(g, xx, yy, s(8) + (i % 3) * 3, 1, later ? '#f8c896' : '#e8a07a'); }
      for (let x = x0 + 2; x < x1 - 1; x += 3 + ((x * 7) % 4)) { const rh = s(5) + ((x * 13) % 6); R(g, x, y1 - rh, 1, rh, '#1e1622'); if ((x * 5) % 3 === 0) R(g, x - 1, y1 - rh, 1, 2, '#1e1622'); }
      if (!later) { R(g, x0 + Math.round(ww * 0.22), y0 + s(10), 1, 1, '#fff6dc'); R(g, x0 + Math.round(ww * 0.22) - 1, y0 + s(10), 3, 1, 'rgba(255,246,220,0.45)'); }
      // shōji over the right half: paper glowing with the dawn behind it, kumiko grid
      const sx0 = x0 + Math.round(ww * 0.52);
      bandsIn(g, sx0, y0, x1 - sx0, wh, later ? ['#e8cdb0', '#eed4b4', '#f2dab8'] : ['#c8a690', '#d2ae94', '#dab698'], 0.5);
      for (let y = y0 + s(9); y < y1; y += s(10)) R(g, sx0, y, x1 - sx0, 1, '#8a6a58');
      for (let x = sx0 + s(8); x < x1; x += s(9)) R(g, x, y0, 1, wh, '#8a6a58');
      R(g, sx0, y0, s(3), wh, WOOD[2]); R(g, sx0, y0, 1, wh, WOOD[4]);
      // lattice over the open half
      for (let x = x0 + s(6); x < sx0; x += s(8)) { R(g, x, y0, s(2), wh, WOOD[0]); R(g, x, y0, 1, wh, WOOD[2]); }
      R(g, x0, y0 + Math.round(wh * 0.38), sx0 - x0, s(2), WOOD[0]); R(g, x0, y0 + Math.round(wh * 0.38), sx0 - x0, 1, WOOD[2]);
      // frame
      const fw = s(5);
      R(g, x0 - fw, y0 - fw, ww + fw * 2, fw, WOOD[2]); R(g, x0 - fw, y1, ww + fw * 2, fw + s(2), WOOD[2]);
      R(g, x0 - fw, y0 - fw, fw, wh + fw * 2, WOOD[2]); R(g, x1, y0 - fw, fw, wh + fw * 2, WOOD[1]);
      R(g, x0 - fw, y0 - fw, ww + fw * 2, 1, WOOD[4]); R(g, x0 - fw, y1, ww + fw * 2, 1, WOOD[5]); R(g, x0 - fw, y0 - fw, 1, wh + fw * 2, WOOD[3]);
      R(g, x0, y0, ww, 1, WOOD[0]); R(g, x1 - 1, y0, 1, wh, WOOD[0]);
      R(g, x0 - fw - 1, y1 + fw + s(2), ww + fw * 2 + 2, 2, 'rgba(6,4,8,0.5)');
      // posts
      for (const px of G.posts) {
        const pw = s(12);
        R(g, px, 0, pw, yC - top, WOOD[2]); R(g, px, 0, 1, yC - top, WOOD[4]); R(g, px + 1, 0, 1, yC - top, WOOD[3]); R(g, px + pw - 2, 0, 2, yC - top, WOOD[0]);
        for (let y = s(14); y < yC - top; y += s(23)) R(g, px + 3 + ((y * 3) % 4), y, 1, s(6), WOOD[1]);
      }
      // a shelf on the right wall: caddies, a stack of bowls, a folded cloth
      const shY = yC - top - s(84), shx0 = G.posts[1] + s(18), shx1 = Math.min(w + 4, shx0 + s(150));
      if (shx0 < w - 10) {
        const L = P.layer(w, h);
        const tin = P.mat('#7a7a84', { n: 5 }), red = P.mat('#8a2c22', { n: 5 }), grn = P.mat('#3e5e3a', { n: 5 }), bowl = P.mat('#c8bca2', { n: 5 }), cloth = P.mat('#4a5a8a', { n: 4 });
        const can = (cx, rw, hh, M) => { L.rect(cx - rw, shY - hh, rw * 2, hh, M, P.cyl(cx - 1, rw, { amb: 0.2 })); L.rect(cx - rw, shY - hh, rw * 2, 2, M, (x) => (x < cx ? 0.95 : 0.7)); L.line(cx - rw, shY - hh + 4, cx + rw - 1, shY - hh + 4, M, 1); };
        can(shx0 + s(12), s(6), s(15), red); can(shx0 + s(28), s(5), s(12), tin); can(shx0 + s(42), s(6), s(16), grn);
        for (let i = 0; i < 3; i++) L.ell(shx0 + s(66), shY - s(3) - i * s(4), s(9) - i, s(2.5), bowl, (x) => (x < shx0 + s(64) ? 0.85 : 0.5));
        L.rect(shx0 + s(84), shY - s(5), s(20), s(5), cloth, (x, y) => (y < shY - s(4) ? 0.9 : 0.5));
        L.rect(shx0 - s(4), shY, shx1 - shx0 + s(8), s(4), P.mat('#6a4028', { n: 6, at: 3 }), (x, y) => (y < shY + 1 ? 0.9 : 0.45));
        L.rect(shx0 + s(6), shY + s(4), s(3), s(8), P.mat('#6a4028', { n: 6, at: 3 }), 1);
        L.outline();
        g.drawImage(L.canvas(), 0, 0);
        R(g, shx0 - s(4), shY + s(4), shx1 - shx0 + s(8), 2, 'rgba(6,4,8,0.4)');
      }
      // the noren at the doorway (right): indigo, split, the title's lantern crest
      {
        const nx0 = Math.max(G.x(264), w - s(70)), ny0 = beamY + s(10), nh = s(66);
        if (nx0 < w - 6) {
          const IND = rampC('#2e3a6a', 5, { at: 2 });
          const panels = [[nx0, Math.round((w - nx0) / 2) - 1], [nx0 + Math.round((w - nx0) / 2) + 1, w - nx0]];
          for (const [px0, pw] of panels) {
            for (let x = px0; x < px0 + pw && x < w; x++) {
              const fold = ((x - px0) % s(7)) < 2 ? 1 : ((x - px0) % s(7)) > s(5) ? 3 : 2;
              const hh = nh - (x === px0 || x === px0 + pw - 1 ? 2 : 0) + ((x * 7) % 3 === 0 ? 1 : 0);
              R(g, x, ny0, 1, hh, IND[fold]);
            }
            R(g, px0, ny0 + nh - 1, pw, 1, IND[0]);
          }
          const crx = nx0 + Math.round((w - nx0) / 2), cry = ny0 + Math.round(nh * 0.48), cr = s(9);
          g.fillStyle = '#d8d0bc'; P.ring(g, crx, cry, cr, 1);
          g.fillStyle = '#d8d0bc'; P.disc(g, crx, cry, s(3), s(4));
          R(g, crx - s(2), cry - s(5), s(4) + 1, 1, '#d8d0bc'); R(g, crx - s(2), cry + s(5), s(4) + 1, 1, '#d8d0bc');
          R(g, crx - s(2), cry - 1, s(4) + 1, 1, IND[1]); R(g, crx - s(2), cry + s(2), s(4) + 1, 1, IND[1]);
          R(g, crx - 1, cry - Math.round(nh * 0.48), 2, Math.round(nh * 0.48) - cr, IND[1]);
          R(g, nx0, ny0, w - nx0, s(2), WOOD[1]);
        }
      }
      // dawn light from the window, down across the wall and the counter: two flat steps
      {
        const L = P.layer(w, h);
        const dx = Math.round((yC - win.y1) * 0.9);
        const a = P.solid(later ? '#ffd2a01e' : '#ffc89614'), b2 = P.solid(later ? '#ffdcb01a' : '#ffd0a012');
        L.poly([[win.x0 + s(4), win.y1], [win.x1, win.y1], [win.x1 + dx, yC], [win.x0 + s(4) + dx, yC]], a);
        g.drawImage(L.canvas(), 0, 0);
        const L2 = P.layer(w, h);
        L2.poly([[win.x0 + s(30), win.y1], [win.x1 - s(24), win.y1], [win.x1 - s(24) + dx, yC], [win.x0 + s(30) + dx, yC]], b2);
        g.drawImage(L2.canvas(), 0, 0);
      }
      // on a tall screen, a paper lantern hangs from the beam above the counter (still lit from the night)
      const hanaTop = G.hana.y - Math.round(96 * Z);
      if (hanaTop - beamY > s(120)) {
        const lan = A.kit.chochin(s(9), s(22), true), lx = G.x(-4), ly = beamY + s(10) + Math.round((hanaTop - beamY - s(10)) * 0.35);
        R(g, lx, beamY + s(10), 1, ly - beamY - s(10), '#0e0a0c');
        K().halo(g, lx, ly + lan.H / 2, s(44), '255,196,120', 0.2, 3);
        g.drawImage(lan.cv, Math.round(lx - lan.cx), ly);
      }
      // Hana, behind the counter
      const hs = hanaSprite(later ? 'think2' : 'smile', Z);
      if (hs) g.drawImage(hs.cv, G.hana.x - hs.ax, G.hana.y - hs.ay);
      // the counter: an oiled top with grain, a lit nosing, the front in shadow
      R(g, 0, yC - top, w, top, PALE[3]);
      const rnd = K().rnd(911);
      for (let i = 0; i < w * top * 0.05; i++) {
        const gx = Math.round(rnd() * w), gy = yC - top + 1 + Math.floor(rnd() * (top - 2)), gl = s(6) + Math.round(rnd() * s(26));
        R(g, gx, gy, gl, 1, rnd() < 0.6 ? PALE[2] : PALE[4]);
      }
      R(g, 0, yC - top, w, 1, PALE[1]); R(g, 0, yC - 2, w, 1, PALE[4]); R(g, 0, yC - 1, w, 1, PALE[5]);
      // the counter's front: a rail under the nosing, then upright boards in shadow
      const FRONT = rampC('#5a3622', 5, { at: 3, step: 0.08 });
      bandsIn(g, 0, yC, w, h - yC, [FRONT[3], FRONT[2], FRONT[1]], 0.4);
      R(g, 0, yC, w, s(4), FRONT[4]); R(g, 0, yC + s(4), w, 1, FRONT[0]); R(g, 0, yC + s(5), w, 2, 'rgba(10,4,4,0.45)');
      for (let x = (w % s(30)) >> 1; x < w; x += s(30)) { R(g, x, yC + s(5), 1, h - yC, FRONT[0]); R(g, x + 1, yC + s(5), 1, h - yC, FRONT[4]); }
      // the tray, the pot and the cups on the counter, each with a contact shadow away from the window
      const put = (sp, x, y) => {
        g.fillStyle = 'rgba(30,14,10,0.45)';
        K().disc(g, x + Math.round(sp.w * 0.12), y, Math.round(sp.w * 0.38), Math.max(1, Math.round(s(2))));
        g.drawImage(sp.cv, x - sp.ax, y - sp.ay);
      };
      const tray = scaled(traySprite(), Z), pot = scaled(potSprite(), Z), cup = scaled(cupSprite(), Z);
      put(tray, Math.round((G.cups[0].x + G.cups[1].x) / 2), yC - s(3));
      put(pot, G.pot.x, G.pot.y);
      G.cups.forEach((c, i) => { if (!(later && i === 1)) put(cup, c.x, c.y); });
      if (later) {
        // the second cup sits on its own sprite layer so the ring can show where it is
        g.fillStyle = 'rgba(30,14,10,0.45)';
        K().disc(g, G.cups[1].x + Math.round(cup.w * 0.12), G.cups[1].y, Math.round(cup.w * 0.38), Math.max(1, s(2)));
      }
      return { cv, G, cup, ring: later ? ringOf(cup, '#ffe2a0') : null };
    });
  }

  // ---- live ------------------------------------------------------------------------------------------
  function steam(c, x, yTop, t, i, n, a0, s) {
    for (let j = 0; j < n; j++) {
      const ph0 = (t / 1900 + j / n + i * 0.37) % 1;
      for (let q = 0; q < 3; q++) {
        const ph = ph0 - q * 0.045;
        if (ph < 0) continue;
        const y = Math.round(yTop - 2 - ph * s(30)), x2 = x + Math.round(Math.sin(ph * 6.2 + j * 2.1 + i) * (0.6 + ph * 3.4));
        const a = (ph < 0.3 ? 0.34 : ph < 0.62 ? 0.22 : 0.1) * a0 * (1 - q * 0.25);
        c.fillStyle = 'rgba(240,236,226,' + a.toFixed(3) + ')';
        c.fillRect(x2, y, ph < 0.25 ? 2 : 1, 1);
      }
    }
  }
  function motes(c, G, t, later) {
    const { win, yC } = G, dx = (yC - win.y1) * 0.9, rnd = K().rnd(77);
    for (let i = 0; i < 18; i++) {
      const u = rnd(), v0 = rnd(), sp = 0.5 + rnd();
      const v = (v0 + t / (30000 / sp)) % 1, uu = u + Math.sin(t / 2600 + i) * 0.04;
      const x = win.x0 + (win.x1 - win.x0) * uu + dx * v, y = win.y1 + (yC - win.y1) * v;
      const a = 0.25 + 0.3 * ((Math.sin(t / 700 + i * 1.7) + 1) / 2);
      c.fillStyle = 'rgba(255,232,196,' + (a * (later ? 1 : 0.8)).toFixed(3) + ')';
      c.fillRect(Math.round(x), Math.round(y), 1, 1);
    }
  }
  function shot(later) {
    return (c, w, h, t, k, o) => {
      const S = room(w, h, o.vb, later), G = S.G, s = G.s;
      c.drawImage(S.cv, 0, 0);
      const still = o.still;
      if (!still) motes(c, G, t, later);
      const top = S.cup.top;
      if (!later) {
        G.cups.forEach((cp, i) => { if (!still) steam(c, cp.x - s(1), cp.y - top, t, i, 4, 1, s); });
        if (!still) steam(c, G.pot.x + s(26), G.pot.y - s(22), t, 2, 2, 0.6, s);
        return;
      }
      // the first cup has gone cool; the second still steams, ringed in light, its steam rising as motes
      const c2 = G.cups[1], pulse = still ? 0.6 : 0.45 + 0.3 * Math.sin(t / 520);
      c.save(); c.beginPath(); c.rect(0, 0, w, G.yC); c.clip();
      K().halo(c, c2.x, c2.y - Math.round(top / 2), Math.round(top * 1.25), '255,214,140', 0.16 * (still ? 1 : 0.8 + 0.2 * Math.sin(t / 520)), 3);
      c.restore();
      c.drawImage(S.cup.cv, c2.x - S.cup.ax, c2.y - S.cup.ay);
      c.globalAlpha = clamp(pulse, 0, 1);
      c.drawImage(S.ring, c2.x - S.cup.ax - 1, c2.y - S.cup.ay - 1);
      c.globalAlpha = 1;
      if (still) return;
      steam(c, G.cups[0].x - s(1), G.cups[0].y - top, t, 0, 2, 0.45, s);
      steam(c, c2.x - s(1), c2.y - top, t, 1, 4, 1, s);
      for (let j = 0; j < 4; j++) {
        const ph = (t / 2300 + j / 4) % 1, y = c2.y - top - s(6) - ph * s(40), x = c2.x + Math.round(Math.sin(ph * 4 + j * 1.9) * s(7));
        const a = ph < 0.7 ? 0.7 : (1 - ph) * 2.3;
        c.fillStyle = 'rgba(250,232,176,' + a.toFixed(3) + ')';
        c.fillRect(x, Math.round(y), 1, 1);
        if (ph > 0.3 && ph < 0.5) { c.fillStyle = 'rgba(250,232,176,' + (a * 0.4).toFixed(3) + ')'; c.fillRect(x - 1, Math.round(y), 3, 1); c.fillRect(x, Math.round(y) - 1, 1, 3); }
      }
    };
  }
  A.SHOTS.tea = shot(false);
  A.SHOTS.cup = shot(true);
  A.room = { geom };
})();
