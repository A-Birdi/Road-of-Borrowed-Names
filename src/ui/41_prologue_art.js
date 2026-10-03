/* The prologue's shots, drawn at art resolution on the title scene's grid
 * (2 art px per logical px; about 640 × 360 on a desktop, 390 × 844 on a
 * phone) and in its manner: banded skies with a narrow ordered-dither seam,
 * hue-shifted ramps (shadows cool, highlights warm), light from the upper
 * left, selective outlines in each material's own dark tone, glows as
 * stepped rings of falling alpha (never a blurred gradient).
 *
 * Each shot is a static layer built once per buffer size (and per height of
 * the view left above the caption slip) with RB.pxkit, plus a few live
 * things drawn per frame on top: steam, glints, a flickering lantern, the
 * name fading from it, motes leaving the broken bridge, the traveller.
 * Reduced motion holds one drawing per shot.
 *
 *   RB.prologueArt.draw(kind, c, w, h, t, k, o)  kind: road | tea | cup | lantern | bridge | walker
 *     c: the art-resolution buffer (w × h); t: ms; k: 0..1 through the shot's one-time action (then 1:
 *     the shot holds — the prologue moves on only when the reader asks, src/ui/43_sequence.js);
 *     o: { vb: the lowest buffer row not under the caption slip, still: reduced motion,
 *          hold: the action is over (the traveller stands), ms: the action's length }
 *   RB.prologueArt.release()                     drop the cached layers (the prologue is over)
 *   RB.prologueArt.walkerAt(w, h, k, vb, still)  where the traveller is (tests, evidence)
 *   RB.prologueArt.stats()                       cached layers and traveller frames */
var RB = (globalThis.RB = globalThis.RB || {});

RB.prologueArt = (function () {
  'use strict';
  const K = () => RB.pxkit;
  const R = (c, x, y, w, h, col) => { if (w <= 0 || h <= 0) return; if (col) c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
  const mk = (w, h) => RB.sprites.makeCanvas(Math.max(1, w), Math.max(1, h));
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

  // ---- the traveller ------------------------------------------------------------------------
  // The look the prologue has always used, now carrying the hand lantern the
  // character standard draws (it swings with the arm in every walk frame).
  const LOOK = { skin: 3, hair: 'short', hairColor: 1, outfit: 5, acc: ['scarf', 'lamp'], scarfCol: '#6a6a7a' };
  const FIG = 50;        // an adult's height in the character standard (art px)
  const NEAR = 0.75;     // a person against a roadside lantern post at the same depth
  const FAR = 0.36;      // the walk ends this far from the horizon, relative to where it starts
  const lit = (r, g, b) => r > 215 && g > 150 && b < 175 && r - b > 70; // the lantern's lit paper

  // Shrink a frame (anchor ax, ay) by sc onto the same pixel grid: each new
  // pixel takes one of the colours it covers (never a blend, so the palette
  // stays the drawing's own), the dark outline wins along the silhouette and
  // the lantern's light wins wherever it falls, so a small figure still
  // reads as the same person with the same lamp.
  function shrink(cv, ax, ay, sc) {
    const sw = cv.width, sh = cv.height;
    const d = cv.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, sw, sh).data;
    const dw = Math.ceil(sw * sc) + 2, dh = Math.ceil(sh * sc) + 2;
    const dax = Math.round(ax * sc) + 1, day = Math.round(ay * sc) + 1;
    const out = new Uint8ClampedArray(dw * dh * 4);
    const lum = (o) => d[o] * 0.3 + d[o + 1] * 0.59 + d[o + 2] * 0.11;
    for (let Y = 0; Y < dh; Y++) for (let X = 0; X < dw; X++) {
      const x0 = (X - dax) / sc + ax, x1 = (X + 1 - dax) / sc + ax, y0 = (Y - day) / sc + ay, y1 = (Y + 1 - day) / sc + ay;
      let cov = 0, area = 0, r = 0, g = 0, b = 0, glow = 0, dark = -1, lamp = -1;
      const cand = [];
      for (let y = Math.floor(y0); y < Math.ceil(y1); y++) {
        const wy = Math.min(y + 1, y1) - Math.max(y, y0);
        if (wy <= 0) continue;
        for (let x = Math.floor(x0); x < Math.ceil(x1); x++) {
          const wx = Math.min(x + 1, x1) - Math.max(x, x0);
          if (wx <= 0) continue;
          const wt = wx * wy;
          area += wt;
          if (x < 0 || y < 0 || x >= sw || y >= sh) continue;
          const o = (y * sw + x) * 4;
          if (d[o + 3] < 128) continue;
          cov += wt; r += d[o] * wt; g += d[o + 1] * wt; b += d[o + 2] * wt;
          cand.push(o);
          if (dark < 0 || lum(o) < lum(dark)) dark = o;
          if (lit(d[o], d[o + 1], d[o + 2])) { glow += wt; if (lamp < 0 || lum(o) > lum(lamp)) lamp = o; }
        }
      }
      if (!area || cov / area < 0.42) continue;
      let pick;
      if (lamp >= 0 && glow >= cov * 0.22) pick = lamp;
      else if (cov / area < 0.8) pick = dark;
      else {
        r /= cov; g /= cov; b /= cov;
        let bd = 1e9;
        for (const o of cand) { const e = (d[o] - r) ** 2 + (d[o + 1] - g) ** 2 + (d[o + 2] - b) ** 2; if (e < bd) { bd = e; pick = o; } }
      }
      const q = (Y * dw + X) * 4;
      out[q] = d[pick]; out[q + 1] = d[pick + 1]; out[q + 2] = d[pick + 2]; out[q + 3] = 255;
    }
    return { px: out, w: dw, h: dh, ax: dax, ay: day };
  }

  // Night grade for a shrunk figure: cooled and darkened like everything
  // under the moon, warmed in steps near its own lantern, a cool moonlit
  // line along the top of the head and shoulders. Returns the canvas and
  // where the lantern hangs (relative to the feet).
  function nightGrade(s, H) {
    const { px, w, h } = s;
    let lx = 0, ly = 0, n = 0;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const o = (y * w + x) * 4; if (px[o + 3] && lit(px[o], px[o + 1], px[o + 2])) { lx += x; ly += y; n++; } }
    if (n) { lx /= n; ly /= n; } else { lx = s.ax - H * 0.3; ly = s.ay - H * 0.42; }
    const out = new Uint8ClampedArray(px.length);
    const op = (x, y) => x >= 0 && y >= 0 && x < w && y < h && px[(y * w + x) * 4 + 3] > 0;
    const reach = Math.max(4, H * 0.62);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const o = (y * w + x) * 4;
      if (!px[o + 3]) continue;
      let r = px[o], g = px[o + 1], b = px[o + 2];
      if (!lit(r, g, b)) {
        const warm = clamp(1 - Math.hypot(x - lx, (y - ly) * 1.3) / reach, 0, 1);
        const step = warm > 0.62 ? 0.62 : warm > 0.3 ? 0.36 : warm > 0.08 ? 0.16 : 0;
        const nr = r * 0.66 + 16, ng = g * 0.68 + 18, nb = b * 0.84 + 36;
        const wr = r * 1.0 + 44, wg = g * 0.82 + 22, wb = b * 0.5 + 8;
        r = nr + (wr - nr) * step; g = ng + (wg - ng) * step; b = nb + (wb - nb) * step;
        // moonlight from the upper right: a cool line along the top and the right-hand edge
        const rim = !op(x, y - 1) ? 0.42 : !op(x + 1, y) && y < s.ay - H * 0.25 ? 0.3 : 0;
        if (rim && step < 0.3) { r += (170 - r) * rim; g += (178 - g) * rim; b += (228 - b) * rim; }
      }
      out[o] = r; out[o + 1] = g; out[o + 2] = b; out[o + 3] = 255;
    }
    const cv = mk(w, h);
    const g2 = cv.getContext('2d');
    const img = g2.createImageData(w, h);
    img.data.set(out);
    g2.putImageData(img, 0, 0);
    return { cv, w, h, ax: s.ax, ay: s.ay, lx: lx - s.ax, ly: ly - s.ay };
  }

  const figs = new Map();
  // The traveller at figure height H (art px), walk phase f (0..7; -1 stands).
  function figure(H, f) {
    const key = H + '|' + f;
    let s = figs.get(key);
    if (s) return s;
    const art = RB.sprites.getArt(LOOK, 'up', f < 0 ? 0 : 'w' + f);
    if (!art) return null;
    const A = RB.sprites.ANCHOR;
    s = nightGrade(shrink(art, A.x, A.y, Math.min(1, H / FIG)), H);
    figs.set(key, s);
    if (figs.size > 400) figs.delete(figs.keys().next().value);
    return s;
  }

  // Where the traveller is: the walk starts on the road just above the
  // caption slip and goes up it at a steady pace, so the figure slows on
  // screen and shrinks as it recedes (size ∝ distance below the horizon,
  // matched to the lantern posts beside it at the start).
  function walkerAt(w, h, k, vb, still) {
    const G = RB.ui.title.roadGuide(w, h);
    const yA = Math.min(h - 3, Math.round(vb) - 4);
    const dA = Math.max(8, yA - G.hz), dB = dA * FAR;
    const e = still ? 0.3 : clamp(k, 0, 1);
    const y = G.hz + 1 / ((1 - e) / dA + e / dB);
    const [x, hw] = G.at(y);
    const H0 = Math.min(FIG, G.post(yA) * NEAR);
    return { x: Math.round(x), y: Math.round(y), H: Math.max(5, Math.round((H0 * (y - G.hz)) / dA)), road: [Math.round(x - hw), Math.round(x + hw)], hz: G.hz };
  }

  function walker(c, w, h, t, k, o) {
    const W = walkerAt(w, h, k, o.vb, o.still);
    // at the end of the walk they stop and stand, lantern in hand, for as long as the shot holds
    const f = o.still || o.hold ? -1 : Math.floor(t / 105) % 8;
    const s = figure(W.H, f);
    if (!s) return W;
    const fl = o.still ? 0.85 : 0.8 + 0.1 * Math.sin(t / 290) + 0.05 * Math.sin(t / 83);
    const lx = W.x + Math.round(s.lx), ly = W.y + Math.round(s.ly);
    // the lantern's light pooled on the road round the feet, two flat steps
    const rx = Math.max(4, Math.round(W.H * 0.85)), ry = Math.max(2, Math.round(W.H * 0.2));
    c.fillStyle = 'rgba(255,190,110,' + (0.08 * fl).toFixed(3) + ')';
    K().disc(c, lx, W.y, rx, ry);
    K().disc(c, lx, W.y, Math.round(rx * 0.55), Math.max(1, Math.round(ry * 0.55)));
    // a short shadow cast away from the lamp
    c.fillStyle = 'rgba(8,8,20,0.42)';
    K().disc(c, W.x + Math.round(W.H * 0.12), W.y, Math.max(2, Math.round(W.H * 0.22)), Math.max(1, Math.round(W.H * 0.05)));
    c.drawImage(s.cv, W.x - s.ax, W.y - s.ay);
    K().halo(c, lx, ly, Math.round(3 + W.H * 0.5), '255,200,110', 0.26 * fl, 3);
    return W;
  }

  // ---- shared by the shots (41b–41d) -----------------------------------------------------------
  // Static layers: one per shot, buffer size and view height; a handful at most.
  const layers = new Map();
  function cached(key, build) {
    let s = layers.get(key);
    if (!s) { s = build(); layers.set(key, s); if (layers.size > 6) layers.delete(layers.keys().next().value); }
    return s;
  }
  // The focal props' scale: 1 wherever a 380 × 230 stage fits above the slip
  // (desktops, phones upright); smaller only on a short landscape phone.
  // Zx narrows horizontal spacing on narrow screens.
  function stage(w, h, vb) {
    const Z = clamp(Math.min(w / 380, vb / 230), 0.5, 1);
    return { cx: Math.round(w / 2), Z, Zx: Z * clamp((w - 16) / 440, 0.7, 1), s: (n) => Math.round(n * Z) };
  }
  // Flat bands with a narrow ordered-dither seam, into a region of a canvas.
  function bandsIn(g, x, y, w, h, cols, seam) {
    x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
    if (w <= 0 || h <= 0) return;
    const img = g.createImageData(w, h);
    K().bands(img, w, 0, h, cols, seam);
    g.putImageData(img, x, y);
  }
  // A chōchin: a ribbed paper barrel between two lacquered caps, lit from
  // inside (brightest a little left of centre, the paper deepening toward its
  // edges) or dark. R0: half-width at the belly; H0: the paper's height.
  // Returns the canvas and the paper's geometry (centre x, top, bottom, half-width at a row).
  const PAPER_LIT = ['#6e3418', '#a85a26', '#d8863a', '#eeaa56', '#f9cf86', '#fff0c8'];
  const PAPER_DARK = ['#2a2230', '#3a3040', '#4a3e4c', '#5a4e58', '#6a5e64', '#7a6e70'];
  function chochin(R0, H0, lit, rib) {
    const P = K(), cap = Math.max(2, Math.round(H0 * 0.09)), W = Math.ceil(R0 * 2) + 4, H = H0 + cap * 2 + 4;
    const L = P.layer(W, H), cx = W / 2, y0 = cap + 2, y1 = y0 + H0;
    const paper = P.mat(null, { cols: lit ? PAPER_LIT : PAPER_DARK, at: 3, lineCol: '#2a1410' });
    const hw = (y) => R0 * (0.74 + 0.26 * Math.sin(Math.PI * clamp((y - y0) / H0, 0, 1)));
    const lum = (x, y, dk) => { const n = (x - cx + R0 * 0.2) / hw(y); return clamp(0.98 - n * n * 0.72 - (n > 0 ? n * 0.14 : 0) - dk, 0, 0.999); };
    L.fill(cx - R0, y0, cx + R0, y1, (x, y) => Math.abs(x - cx) <= hw(y), paper, (x, y) => lum(x, y, 0));
    for (let y = y0 + 3; y < y1 - 1; y += rib || 4) L.recolor((x, yy) => yy >= y && yy < y + 1, paper, paper, (x, yy) => lum(x, yy, 0.2));
    const lac = P.mat('#2c1e26', { n: 4, at: 1 });
    L.rect(cx - R0 * 0.8, y0 - cap, R0 * 1.6, cap, lac, (x) => (x < cx - R0 * 0.3 ? 0.9 : 0.4));
    L.rect(cx - R0 * 0.8, y1, R0 * 1.6, cap, lac, (x) => (x < cx - R0 * 0.3 ? 0.65 : 0.25));
    L.outline();
    return { cv: L.canvas(), W, H, cx, y0, y1, hw };
  }
  // shots with caches of their own register them here, to be dropped with the rest
  const releasers = [];
  const kit = { R, mk, clamp, cached, stage, bandsIn, chochin, onRelease: (fn) => releasers.push(fn) };

  // ---- shots ---------------------------------------------------------------------------------
  function draw(kind, c, w, h, t, k, o) {
    o = o || {};
    const vb = clamp(o.vb == null ? h : o.vb, h * 0.3, h);
    const oo = { vb, still: !!o.still, hold: !!o.hold, ms: o.ms || 0 };
    c.imageSmoothingEnabled = false;
    if (kind === 'road' || kind === 'walker') {
      RB.ui.title.drawBackdrop(c, w, h, t);
      if (kind === 'walker') walker(c, w, h, t, k, oo);
      return;
    }
    const fn = SHOTS[kind];
    if (fn) fn(c, w, h, t, k, oo);
  }
  const SHOTS = {};

  function release() { figs.clear(); layers.clear(); releasers.forEach((fn) => fn()); }

  // cached static layers and traveller frames (tests: the prologue releases them when it ends)
  const stats = () => ({ layers: layers.size, figures: figs.size });

  return { draw, release, walkerAt, stats, SHOTS, kit, shrink, _figure: figure };
})();
