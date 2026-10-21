/* Tetsu's boat between Saltglass and Kotonoha (Chapter 9, ko.ferry_out and ko.ferry_back; RBN-QA-072). The crossing
 * was told over a black screen; its lines are now shown over pictures of it, from the boat:
 *   out     looking back over the stern as the boat heads west: the point and Saltglass's lighthouse falling behind
 *           (drawn as the tide-watcher's window shows them, 42b_interlude_tide.js, for a farther view), the coast low
 *           behind it, the wake running back past the tip; the morning sea in the tide's own rows of blue
 *   leaves  past noon, over the bow: the open western sea, the sea-glass teal of Kotonoha's water, and the first gold
 *           leaves riding the waves (the nearer ones the island's written leaves as its first sight draws them,
 *           42g_interlude_firstsight.js; the far ones the falling-leaf weather's own, 60_render.js)
 *   back    the run home, looking back over the stern: the island low on the sea and the great tree on its crown (its
 *           wide umbrella and low limbs as its first sight draws it, 42g_interlude_firstsight.js) drawing away into
 *           the evening sun, the sun's path on the water and the wake leading back to it
 * The scene is already dark when its lines begin: the picture brings itself up from that dark, and passes from one
 * moment to the next, by itself (in stepped alpha, while the line is read), so nothing in the scene waits on it; the
 * scene goes dark again before its warp and ends it there, so the place you arrive at appears as it always has. The
 * boat is Tetsu's, in Saltglass's wood (RB.tiles.PAL.saltglass); the skies and the land far off are the regions' own
 * (RB.battlePlaceArt.LAND), the island's water and grass Kotonoha's (PAL.kotonoha). What the lines name stays above
 * the dialogue sheet (vb). Still layers per size; live: the waves, the wake's foam, the gulls, the leaves bobbing and
 * drifting, the sun's glitter. Reduced motion holds each picture still. Drawn with RB.pxkit at art resolution in the
 * prologue's manner (41_prologue_art.js); implemented provisionally under AC-1. */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const A = RB.prologueArt, { R, mk, clamp, stage, bandsIn } = A.kit;
  // the moment shown, the one before it (for the dissolve) and when the picture came up (for the reveal)
  const live = { stage: null, prev: null, shown: 0, swap: 0 };
  // its own layers per size, kept apart from the prologue's small cache
  const mine = new Map();
  const cached = (key, build) => {
    let v = mine.get(key);
    if (!v) { v = build(); mine.set(key, v); if (mine.size > 14) mine.delete(mine.keys().next().value); }
    return v;
  };
  A.kit.onRelease(() => { mine.clear(); live.stage = null; live.prev = null; aheadKey = null; });
  const K = () => RB.pxkit;
  const SP = () => RB.seqPaint;
  const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
  const key = (n, G) => n + '|' + G.w + 'x' + G.h + '|' + G.vb;
  const hex3 = (h) => (Array.isArray(h) ? h : (() => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; })());
  const mix3 = (a, b, t) => { a = hex3(a); b = hex3(b); return [0, 1, 2].map((i) => Math.round(a[i] + (b[i] - a[i]) * t)); };
  const hexOf = (c) => '#' + hex3(c).map((v) => v.toString(16).padStart(2, '0')).join('');
  const hashf = (x, y, k) => (K().hh(x | 0, y | 0, k || 0) % 1000) / 1000;
  function vnoise(x, y, seed) {
    const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    const a = hashf(xi, yi, seed), b = hashf(xi + 1, yi, seed), c = hashf(xi, yi + 1, seed), d = hashf(xi + 1, yi + 1, seed);
    return (a + (b - a) * sx) * (1 - sy) + (c + (d - c) * sx) * sy;
  }
  const steps = (k, n) => Math.floor(clamp(k, 0, 1) * n) / n; // stepped alpha (n flat steps, no smooth ramp)

  // ---- the regions' colours -------------------------------------------------------------------------------------
  const PAL = (r) => (RB.tiles && RB.tiles.PAL && RB.tiles.PAL[r]) || {};
  const LANDOF = (r) => (RB.battlePlaceArt && RB.battlePlaceArt.LAND && RB.battlePlaceArt.LAND[r]) || {};
  // Tetsu's boat: Saltglass's wood ramp, dark → light (PAL.saltglass.wood holds base, mid, dark, light), a deeper
  // shade under it; in the evening the same wood in the dusk's shade, its top edges warm from the low sun ahead
  function woodCols(evening) {
    const wd = PAL('saltglass').wood || ['#7d6450', '#957a62', '#5f4a3a', '#b39a80'];
    const cols = [hexOf(mix3(wd[2], '#1e1612', 0.4)), wd[2], wd[0], wd[1], wd[3]];
    return evening ? cols.map((c, i) => hexOf(i === 4 ? mix3(c, '#f0b878', 0.45) : mix3(c, '#2a2438', 0.3))) : cols;
  }
  // the sea, horizon → toward us: the tide's own rows at Saltglass (42b); Kotonoha's sea-glass water under its haze
  // (PAL.kotonoha.water, LAND.kotonoha.haze); the same water at evening under a gold sky
  const KO_SEA = () => { const wt = PAL('kotonoha').water || ['#3e8a8e', '#4a9a9c', '#6cb4b0', '#e0f2ee'], hz = LANDOF('kotonoha').haze || '#c8e0d8';
    return [hz, hexOf(mix3(hz, wt[2], 0.3)), hexOf(mix3(hz, wt[2], 0.6)), hexOf(mix3(hz, wt[2], 0.85)), wt[2], hexOf(mix3(wt[2], wt[1], 0.5)), wt[1], wt[0]]; };
  const EVE_SEA = ['#f0d0a0', '#d8bc98', '#b0a494', '#8a9090', '#6c8088', '#58707c', '#4a6270', '#3e5664'];
  const EVE_SKY = ['#4c6e84', '#5c7c8e', '#728a94', '#8e9894', '#b0a48c', '#d2ae84', '#eabc84', '#f6d094', '#fae0b0'];

  // ---- where everything is --------------------------------------------------------------------------------------
  // The horizon a little under the middle of what is above the sheet (lower on a phone held upright, where there is
  // more sky than sea to fill); the boat's rail across the bottom, just above the sheet. Laid out for the sheet where
  // it rests with a line of two (its top at 0.72 of the screen; 0.64 on a phone held upright) or higher: a shorter
  // line's sheet (Tetsu's question, the jetty's prompt) leaves the same layout, so what was built ahead is what shows.
  function geom(w, h, vb0) {
    const narrow = w < h * 0.8, vb = Math.min(vb0, Math.round(h * (narrow ? 0.64 : 0.72)));
    const S = stage(w, h, vb), { s } = S;
    const yH = Math.round(vb * (narrow ? 0.52 : 0.42));           // the horizon
    const yT = Math.round(vb - s(14));                             // the top of the boat's rail (transom, or the stem)
    const cx = Math.round(w / 2);
    const tw = Math.round(clamp(w * (narrow ? 0.24 : 0.2), s(60), s(128))); // the transom's half-width
    return Object.assign(S, { w, h, vb, narrow, yH, yT, cx, tw });
  }

  // ---- the sea --------------------------------------------------------------------------------------------------
  // The wake's track at a depth p (0 at the stern … 1 at the horizon): its middle and half-width.
  const track = (G, W, p) => ({ mid: G.cx + (W.vpx - G.cx) * p, hw: W.hw0 * Math.pow(1 - p, 1.45) });
  // Rows of colour from the horizon toward us in the tide-watcher's manner (42b seaLayer: a flat band per step, a
  // dithered seam into the next), closer together toward the horizon. o.wake: the track a rowed boat leaves, back to
  // where it came from (vpx): smoother water a shade paler (it holds the sky), stirred white only just behind the
  // stern, and the two arms of its wake spreading from it and dying away, in the tide's shallow-water colours;
  // o.path: the sun's path on the water below sx, in gold.
  function seaOn(g, G, cols, o) {
    const { w, h, yH, yT, cx, s } = G, P = K(), C3 = cols.map(hex3), FOAM = (RB.tideArt.SHALLOW || ['#e8f2ee', '#a8d8cc', '#86c2bc', '#6ea8ae']).map(hex3);
    const y0 = yH + 1, H = h - y0, img = g.createImageData(w, H), d = img.data;
    const W = o.wake, PATH = o.path, GOLD = PATH ? [hex3('#f8dca0'), hex3('#fff0cc')] : null;
    for (let y = y0; y < h; y++) {
      const rf = Math.pow((y - y0) / Math.max(1, (yT - y0) * 1.15), 0.62) * (C3.length - 1);
      const ri = Math.min(C3.length - 2, Math.floor(rf)), rr = Math.min(1, rf - ri);
      const p = (yT - y) / Math.max(1, yT - yH);                   // 0 at the stern … 1 at the horizon
      let mid = 0, hw = 0, arms = null;
      if (W && p > 0) {
        ({ mid, hw } = track(G, W, p));
        arms = [-1, 1].map((sd) => { const xa = cx + sd * W.hw0 * 0.9, xb = W.vpx + sd * W.spread; return xa + (xb - xa) * Math.pow(p, 0.8); });
      }
      for (let x = 0; x < w; x++) {
        const b = P.bayer(x, y);
        let c = C3[rr > 0.6 && rr - 0.6 > b * 0.4 ? ri + 1 : ri];
        if (W && p > 0) {
          const a = Math.abs(x - mid) / Math.max(0.5, hw);
          if (a < 1 && !(a > 0.75 && b < (a - 0.75) * 4)) {
            c = C3[Math.max(0, (rr > 0.6 && rr - 0.6 > b * 0.4 ? ri + 1 : ri) - 1)];
            if (p < 0.28) {
              const n = vnoise(x * 0.5 / G.Z, y * 1.2 / G.Z, 5), th = (1 - a) * (1 - p / 0.28);
              if (n < th * 0.8 - 0.12) c = FOAM[n < th * 0.4 ? 0 : 1];
              else if (n < th * 1.1) c = FOAM[2];
            }
          }
          for (const ax of arms) {
            if (p > 0.55) break;
            const dd = Math.abs(x - ax), wd = Math.max(0.5, s(1.6) * (1 - p));
            if (dd < wd && hashf(x >> 1, y >> 1, 9) > 0.42 + p * 0.95) c = FOAM[p < 0.2 ? 1 : 2];
          }
        }
        if (PATH) {
          const hwp = s(4) + (y - yH) * PATH.spread, dx = Math.abs(x - PATH.sx);
          if (dx < hwp) {
            const run = hashf(Math.floor((x + (y % 5) * 7) / Math.max(2, Math.round(s(2) + (y - yH) * 0.08))), y, 13);
            if (run > 0.42 + (dx / hwp) * 0.5) c = GOLD[run > 0.86 ? 1 : 0];
          }
        }
        const i = ((y - y0) * w + x) * 4;
        d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255;
      }
    }
    g.putImageData(img, 0, y0);
  }

  // ---- Tetsu's boat ---------------------------------------------------------------------------------------------
  // Looking back over the stern: the transom's rail across the middle, lit along its top, the sides' rails dropping
  // away toward us on either hand, the transom's inner face in shade and the stern sheets between the sides (their
  // planks running fore and aft), a bitt at the middle where the line is made fast at the jetty.
  function stern(G, evening) {
    return cached(key('stern' + (evening ? 'E' : 'D'), G), () => {
      const { w, h, cx, tw, yT, vb, s } = G, P = K(), y0 = yT - Math.max(4, s(9)) - s(4), L = P.layer(w, h - y0, 0, -y0); // (only the rows it covers)
      const wood = P.mat(null, { cols: woodCols(evening), at: 2, lineCol: '#1a1210' });
      const rt = Math.max(3, s(5)), kk = 0.5;                       // the rail's depth; how fast the sides drop
      const outer = (y, sd) => cx + sd * (tw + (y - yT) / kk);     // a side rail's outer edge at a row
      const rw = (y) => rt + (y - yT) * 0.22;                        // its width there (wider toward us)
      // the stern sheets: planks running fore and aft, their seams toward the middle of the transom
      L.fill(0, yT + rt, w, h, (x, y) => x > outer(y, -1) + rw(y) && x < outer(y, 1) - rw(y), wood, (x, y) => {
        const u = (x - cx) / Math.max(1, (y - yT) * 1.8 + tw), seam = Math.abs((u * 7 + 20) % 1) < 0.08;
        return seam ? 0.1 : y < yT + rt + s(8) ? 0.3 : 0.5;
      });
      // the transom's inner face, in shade, its boards upright
      L.rect(cx - tw, yT + rt, tw * 2, s(8), wood, (x, y) => (((x - cx + tw) % Math.max(4, s(16))) < 1 ? 0.05 : y > yT + rt + s(6) ? 0.12 : 0.3));
      // the sides' rails, a lit top on each and the inner face under it
      for (const sd of [-1, 1]) {
        L.fill(0, yT, w, h, (x, y) => { const o = outer(y, sd), wv = rw(y); return sd < 0 ? x >= o && x < o + wv : x <= o && x > o - wv; }, wood, (x, y) => {
          const o = outer(y, sd), f = Math.abs(x - o) / rw(y);
          return f < 0.35 ? (sd < 0 ? 0.92 : 0.74) : f < 0.7 ? 0.52 : 0.32;
        });
      }
      // the transom's rail, lit along its top, its ends capping the sides
      L.rect(cx - tw - s(2), yT, tw * 2 + s(4), rt, wood, (x, y) => (y < yT + 1 ? 0.97 : y < yT + Math.max(2, s(2)) ? 0.72 : 0.5));
      // the bitt: a short post with a cap, the line round it
      const bx = cx + Math.round(tw * 0.38), bw = Math.max(3, s(5)), bh = Math.max(4, s(9));
      L.rect(bx - (bw >> 1), yT - bh, bw, bh + 1, wood, (x) => (x < bx ? 0.8 : 0.45));
      L.rect(bx - (bw >> 1) - 1, yT - bh - 1, bw + 2, Math.max(2, s(2)), wood, (x) => (x < bx ? 0.97 : 0.6));
      const rope = P.mat('#c8b48a', { n: 4, at: 2 });
      L.rect(bx - (bw >> 1) - 1, yT - Math.round(bh * 0.5), bw + 2, Math.max(1, s(2)), rope, (x) => (x < bx ? 3 : 1));
      L.outline();
      return { cv: L.canvas(), y: y0, top: yT - bh - 1, rail: yT, bottom: Math.min(vb, h) };
    });
  }
  // Over the bow: the two rails meeting at the stem head in the middle, dropping away toward us on either hand, the
  // foredeck between them with its planks running toward the stem, and the stem post standing up out of it.
  function bow(G) {
    return cached(key('bow', G), () => {
      const { w, h, cx, yT, vb, s } = G, P = K(), yS = yT - s(2), y0 = yS - Math.max(8, s(16)) - s(6), L = P.layer(w, h - y0, 0, -y0);
      const wood = P.mat(null, { cols: woodCols(false), at: 2, lineCol: '#1a1210' });
      const kk = 0.42, rt = Math.max(3, s(5));
      const outer = (y, sd) => cx + sd * (y - yS) / kk;
      const rw = (y) => rt + (y - yS) * 0.2;
      L.fill(0, yS + 2, w, h, (x, y) => Math.abs(x - cx) < Math.abs(outer(y, 1) - cx) - rw(y) * 0.6, wood, (x, y) => {
        const u = (x - cx) / Math.max(1, (y - yS)), seam = Math.abs((u * 5 + 20) % 1) < 0.1;
        return seam ? 0.1 : 0.55 - Math.min(0.25, (y - yS) / Math.max(1, h - yS) * 0.5);
      });
      for (const sd of [-1, 1]) {
        L.fill(0, yS, w, h, (x, y) => { const o = outer(y, sd), wv = rw(y); return sd < 0 ? x <= o + wv * 0.5 && x > o - wv * 0.5 : x >= o - wv * 0.5 && x < o + wv * 0.5; }, wood, (x, y) => {
          const o = outer(y, sd), f = (x - o) / rw(y) * -sd + 0.5;
          return f < 0.35 ? (sd < 0 ? 0.95 : 0.78) : f < 0.7 ? 0.55 : 0.3;
        });
      }
      // the stem post, rising a little forward, lit on its left
      const sw = Math.max(3, s(5)), sh = Math.max(8, s(16));
      L.fill(cx - sw - s(4), yS - sh - 2, cx + sw + s(4), yS + s(3), (x, y) => { const lean = (yS - y) * 0.12, xm = cx + lean; return y >= yS - sh && Math.abs(x - xm) <= sw / 2 + (y > yS - s(3) ? 1 : 0); }, wood, (x, y) => (x < cx + (yS - y) * 0.12 - 0.5 ? 0.92 : 0.5));
      L.outline();
      return { cv: L.canvas(), y: y0, top: yS - sh, rail: yS, bottom: Math.min(vb, h) };
    });
  }

  // ---- out: the point falling behind ----------------------------------------------------------------------------
  // The tide's point and lighthouse (RB.tideArt.point) are laid out by the fields of its geometry: here the tip stands
  // a little left of the middle just under the horizon, the headland's ridge climbing to our left and its waterline
  // running back from the tip, close under it (it is far off now); vy0 sets the lighthouse's height (the tide's own
  // rule, 0.62 of the height above it).
  function pointGeom(G) {
    const { w, h, s, yH, narrow } = G;
    const tip = { x: Math.round(w * (narrow ? 0.4 : 0.36)), y: yH + s(9) };
    const x0 = 0, hill = yH - s(narrow ? 30 : 26), yF = tip.y + s(12), xN = x0 + s(4);
    const th = Math.round(Math.min(G.vb * 0.17, w * (narrow ? 0.16 : 0.075)));
    const lb = tip.y - s(6), vy0 = Math.round(lb - th / 0.62);
    const ridgeAt = (x) => Math.round(tip.y - s(10) - (tip.x - x) * (tip.y - s(10) - hill) / Math.max(1, tip.x - x0));
    const shoreAt = (y) => tip.x + s(4) + (xN - tip.x - s(4)) * clamp((y - tip.y) / Math.max(1, yF - tip.y), 0, 1);
    return { w, h, s, x0, ow: w, tip, yF, vy0, ridgeAt, shoreAt };
  }
  // the opaque bounds of a layer canvas (tests, and where the gulls may fly)
  function bounds(cv) {
    const g = cv.getContext('2d'), d = g.getImageData(0, 0, cv.width, cv.height).data;
    let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
    for (let y = 0; y < cv.height; y++) for (let x = 0; x < cv.width; x++) if (d[(y * cv.width + x) * 4 + 3]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    return { x0, y0, x1, y1 };
  }
  function outView(G) {
    return cached(key('out', G), () => {
      const { w, h, s, yH, narrow } = G, P = K(), T = RB.tideArt;
      const cv = mk(w, h), g = cv.getContext('2d');
      g.imageSmoothingEnabled = false;
      // the tide's afternoon sky (the morning's here), over the whole width
      T.sky(g, { w, h, s, x0: 0, x1: w, ow: w, y0: 0, vy0: 0, yH, ox: (u) => Math.round(u * w) });
      const PG = pointGeom(G), tip = PG.tip;
      // the coast behind the point, far off and low: Saltglass's ridge in its haze (LAND.saltglass), fading out past the tip
      const LS = LANDOF('saltglass'), rg = (LS.ridges && LS.ridges[0]) || [0, 0, '#9aa8b0', '#b0bcc2', '#8a98a2'];
      const hz = hex3(LS.haze || '#c8dae4');
      for (let x = 0; x < Math.min(w, tip.x + s(60)); x++) {
        const k = clamp(1 - x / (tip.x + s(60)), 0, 1), top = Math.round(yH - (s(narrow ? 40 : 34) * Math.pow(k, 0.8) + s(3) * Math.sin(x * 0.05 / G.Z) * k + s(1.5) * Math.sin(x * 0.17 / G.Z)));
        if (top >= yH) continue;
        R(g, x, top, 1, 1, rg[3]);
        const lit = hexOf(mix3(rg[2], hz, 0.35)), low = hexOf(mix3(rg[4], hz, 0.45)), mid = Math.round((top + yH) / 2);
        for (let y = top + 1; y < yH; y++) R(g, x, y, 1, 1, y < mid || K().bayer(x, y) > (y - mid) / Math.max(1, yH - mid) ? lit : low); // (its foot in the haze)
      }
      // the sea in the tide's rows, the wake running back past the tip
      const wake = { vpx: Math.round(tip.x + (G.cx - tip.x) * 0.55 + s(10)), hw0: G.tw * 0.5, spread: w * (narrow ? 0.42 : 0.3) };
      seaOn(g, G, T.SEA, { wake });
      // the point and the lighthouse at its tip, as the tide-watcher's window shows them
      const pt = T.point(Object.assign({}, PG, { w: Math.min(w, PG.tip.x + s(24)), h: Math.min(h, PG.yF + s(12)) })); // (its layer only as big as it reaches)
      g.drawImage(pt, 0, 0);
      // a broken line of light where the point meets the water
      for (let x = tip.x + s(4); x > 0; x -= s(3)) { const y = Math.round(PG.yF + s(4) - (PG.yF + s(4) - tip.y) * clamp((x - PG.shoreAt(PG.yF)) / Math.max(1, tip.x - PG.shoreAt(PG.yF)), 0, 1)); if (hashf(x, y, 21) > 0.4) R(g, x, y + 1, Math.max(1, s(2)), 1, 'rgba(240,246,248,0.55)'); }
      return { cv, wake, point: Object.assign(bounds(pt), { tip, lighthouse: { x: tip.x - s(10) } }) };
    });
  }

  // ---- leaves: the open sea past noon ---------------------------------------------------------------------------
  function leavesView(G) {
    return cached(key('leaves', G), () => {
      const { w, h, s, yH } = G, P = K(), KL = LANDOF('kotonoha');
      const cv = mk(w, h), g = cv.getContext('2d');
      g.imageSmoothingEnabled = false;
      const sky = KL.sky || ['#5e9aa4', '#72aab0', '#92c0bc', '#bcd8c8', '#e2e8c8'], cl = KL.cloud || ['#b8d4d0', '#e0ece4', '#f6f8ee'];
      bandsIn(g, 0, 0, w, yH, sky, 0.45);
      // the sun past noon, high on the left, behind stepped rings (the island's warm light, 65_worldlook.js)
      const sx = Math.round(w * 0.2), sy = s(20), sr = Math.max(3, s(6));
      P.halo(g, sx, sy, sr * 6, '255,232,176', 0.3, 5);
      g.fillStyle = '#fff6e0'; P.disc(g, sx, sy, sr); g.fillStyle = '#fffcf4'; P.disc(g, sx - 1, sy - 1, Math.max(1, sr - 2));
      SP().clouds(g, w, { n: 4, seed: 83, y0: s(16), y1: Math.round(yH * 0.62), scale: G.Z * 0.8, light: cl[2], mid: cl[1], shade: cl[0] });
      // haze on the horizon, and the horizon itself: open sea all round
      for (let y = yH - s(4); y < yH; y++) for (let x = (y & 1) * 2; x < w; x += 4) R(g, x, y, 2, 1, 'rgba(232,240,232,0.4)');
      R(g, 0, yH, w, 1, KL.haze || '#c8e0d8');
      seaOn(g, G, KO_SEA(), {});
      return { cv };
    });
  }
  // The leaves on the water, seeded: where each rides (u across, v toward us), its size (the weather's own leaf, or
  // twice it nearer), its phase. Most lie along a drift line that comes in from far ahead and passes the bow on the
  // left (the first of them, carried out from the island), a few stray; they bob on the swell and drift slowly with it.
  function leavesOf(G, n, seed, band) {
    return cached(key('lv' + seed, G), () => {
      const rn = K().rnd(seed), out = [], line = Math.round(n * 0.7);
      for (let i = 0; i < n; i++) {
        let u, v;
        if (i < line) { v = band[0] + (band[1] - band[0]) * Math.pow((i + 0.5 + (rn() - 0.5) * 0.6) / line, 1.15); u = 0.56 - 0.34 * v + 0.05 * Math.sin(v * 9 + 1) + (rn() - 0.5) * 0.05 * (0.4 + v); }
        else { v = band[0] + (band[1] - band[0]) * (0.2 + rn() * 0.7); u = 0.62 + rn() * 0.34; }
        out.push({ u, v, ph: rn() * 6.28, warm: rn() > 0.45, sp: 0.3 + rn() * 0.5 });
      }
      return out;
    });
  }
  // (len: a nearer leaf's length, as the island's written leaf is drawn: larger the nearer it rides, a fifth larger on
  // a phone, whose picture is drawn nearer 1:1)
  function leafAt(G, L, t, still) {
    const { w, yH, yT, s } = G, y = Math.round(yH + 2 + (yT - yH - 4) * Math.pow(L.v, 1.35)), k = L.v > (G.narrow ? 0.3 : 0.45) ? 2 : 1; // (art px are smaller on a phone)
    const drift = still ? 0 : (t / 1000) * L.sp * (0.4 + L.v * 2.2) * G.Z;
    const x = Math.round((((L.u * w + drift) % (w + s(8))) + w + s(8)) % (w + s(8))) - s(4);
    const bob = still ? 0 : Math.round(Math.sin(t / 700 + L.ph) * k * 0.9);
    return { x, y: y + bob, k, len: k > 1 ? Math.round(s(10 + 10 * L.v) * (G.narrow ? 1.2 : 1)) : 3 };
  }
  // The nearer leaves are the island's written leaves as its first sight draws them (RB.firstSightArt.goldLeaf,
  // src/ui/42g_interlude_firstsight.js: gold, rimmed, rows of short ink strokes, never a character), lying on the water
  // so seen flattened, rocking a little on the swell; the far ones are the weather's own leaf. near: the nearer ones'
  // boxes in the frame last drawn (tests).
  let near = [];
  function leaves(c, G, list, t, still) {
    const mark = RB.render.leafMark, gold = RB.firstSightArt && RB.firstSightArt.goldLeaf, out = [];
    list.forEach((L, i) => {
      const p = leafAt(G, L, t, still);
      // a wet glint on the swell beside it, then the leaf
      c.fillStyle = 'rgba(240,250,246,0.35)'; c.fillRect(p.x - p.k, p.y + 2 * p.k, 5 * p.k, 1);
      if (p.k > 1 && gold) {
        const rock = still ? 0 : Math.sin(t / 900 + L.ph), open = still ? 0.64 : 0.62 + 0.06 * Math.sin(t / 700 + L.ph);
        const box = gold(c, p.x + Math.round(p.len * 0.2), p.y + p.k, p.len, (L.warm ? 0.12 : -0.18) + rock * 0.12, open, i * 13 + 7, G.vb);
        if (box) out.push({ box, len: p.len });
      } else { c.save(); c.translate(p.x, p.y); c.scale(p.k, p.k); mark(c, 0, 0, L.warm); c.restore(); }
    });
    near = out;
  }

  // ---- back: the island drawing away into the evening sun -------------------------------------------------------
  // A sun low behind the crown on its left: what the shot's own shading lights (its upper left) keeps the light only
  // along the crown's edge toward the sun, a rim of gold; inside the edge the crown stays in its shade, its masses
  // still shaded among themselves (every step above cap is brought down to cap). M: the crown's material, its last two
  // steps the rim's; x1: the rim goes no further right than this (in the layer's own pixels).
  function backlit(L, M, cap, x1) {
    const { w, h, px, mt } = L, step = new Map(M.c.map((c, i) => [c, i])), out = px.slice();
    const open = (x, y) => x < 0 || y < 0 || mt[y * w + x] !== M.id;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (mt[i] !== M.id) continue;
      const k = step.get(px[i]);
      if (k == null || k <= cap - 2) continue;
      let nk = Math.min(k, cap);
      if (x < x1 && k >= cap) {
        if (open(x - 1, y) || open(x - 1, y - 1) || open(x, y - 1)) nk = M.n - 1;
        else if (open(x - 2, y) || open(x - 2, y - 2) || open(x, y - 2)) nk = M.n - 2;
      }
      out[i] = M.c[nk];
    }
    L.px = out;
  }
  function backView(G) {
    return cached(key('back', G), () => {
      const { w, h, s, yH, narrow } = G, P = K(), KP = PAL('kotonoha');
      const cv = mk(w, h), g = cv.getContext('2d');
      g.imageSmoothingEnabled = false;
      bandsIn(g, 0, 0, w, yH, EVE_SKY, 0.45);
      // the island: a long low rise to its crown, the beach at its foot; the great tree on the crown
      const ix = Math.round(w * (narrow ? 0.48 : 0.46)), iw = Math.round(clamp(w * (narrow ? 0.4 : 0.24), s(80), s(170)));
      const base = yH + s(3), crownX = ix + Math.round(iw * 0.16), hillH = s(narrow ? 16 : 18);
      const prof = (x) => {
        const u = (x - (ix - iw)) / (2 * iw);
        if (u < 0 || u > 1) return 1e9;
        const rise = Math.pow(Math.sin(Math.PI * u), 0.6) * s(6) + Math.exp(-Math.pow((x - crownX) / (iw * 0.34), 2)) * hillH;
        return Math.round(base - rise - s(1) * Math.sin(x * 0.21 / G.Z));
      };
      // the great tree's crown, as wide as its first sight has it (half-width rw, half-height rh, its middle cy): an umbrella
      // over the island, low and flat, its far ends hanging lower than its middle
      const rw = Math.round(iw * 0.73), rh = Math.max(4, Math.round(rw / 4.6));
      const tx = crownX, ty = prof(tx) + Math.max(1, Math.round(s(3) * 0.4));
      const cy = ty - Math.round(rh * 1.05);
      // the sun, low, just behind the crown's left side, among its long limbs
      const sun = { x: Math.round(tx - rw * 0.62), y: Math.round(cy + rh * 0.35), r: Math.max(5, s(narrow ? 12 : 13)) };
      P.halo(g, sun.x, sun.y, sun.r * 5, '255,214,150', 0.42, 6);
      g.fillStyle = '#ffe2a8'; P.disc(g, sun.x, sun.y, sun.r); g.fillStyle = '#fff2d2'; P.disc(g, sun.x - 1, sun.y - 1, Math.max(1, sun.r - s(3)));
      // a few low banks of cloud, their tops in the dusk's shade and their undersides lit by the sun below them
      SP().clouds(g, w, { n: narrow ? 3 : 4, seed: 619, y0: Math.round(yH * 0.18), y1: Math.round(yH * 0.5), scale: G.Z * 0.7, light: '#8c8a9a', mid: '#b49ea0', shade: '#f2c690' });
      for (let y = yH - s(4); y < yH; y++) for (let x = (y & 1) * 2; x < w; x += 4) R(g, x, y, 2, 1, 'rgba(250,224,176,0.45)');
      R(g, 0, yH, w, 1, '#f4d8a8');
      // the sea at evening, the sun's path on it, the wake leading back to the island
      const wake = { vpx: ix, hw0: G.tw * 0.5, spread: w * (narrow ? 0.42 : 0.3) };
      seaOn(g, G, EVE_SEA, { wake, path: { sx: sun.x, spread: 0.32 } });
      // the island against the light: Kotonoha's green in the dusk's shade, its tops lit gold by the low sun
      const lx0 = Math.max(0, Math.min(ix - iw, tx - Math.round(rw * 1.15)) - s(4)), lx1 = Math.min(w, Math.max(ix + iw, tx + Math.round(rw * 1.15)) + s(4));
      const ly0 = Math.max(0, cy - Math.round(rh * 1.9) - s(6)), L = SP().layer(lx1 - lx0, base + s(3) - ly0, -lx0, -ly0); // (only where the island and the tree are)
      const gr = KP.grass || ['#7aa88a', '#8ab896', '#a0c8a6', '#5e8e70'], sand = KP.sand || ['#e2dac2', '#eee8d4', '#cac0a2'];
      const land = P.mat(null, { cols: [hexOf(mix3(gr[3], '#141a24', 0.72)), hexOf(mix3(gr[3], '#1e2430', 0.62)), hexOf(mix3(gr[0], '#2a2c3a', 0.55)), hexOf(mix3(gr[2], '#e8b070', 0.62))], at: 1, lineCol: '#10141c' });
      L.fill(ix - iw - 1, base - hillH - s(10), ix + iw + 1, base + 1, (x, y) => y >= prof(x) && y <= base, land, (x, y) => {
        const d = y - prof(x);
        if (d < 1 && x < crownX + iw * 0.25) return 0.95;            // the edge toward the sun
        return d < 3 && hashf(x >> 1, y, 3) > 0.6 ? 0.6 : (vnoise(x * 0.3 / G.Z, y * 0.6 / G.Z, 8) > 0.6 ? 0.1 : 0.35);
      });
      L.rect(ix - iw + s(10), base, 2 * iw - s(22), 1, P.mat(null, { cols: [hexOf(mix3(sand[2], '#6a6070', 0.4)), hexOf(mix3(sand[1], '#f0c890', 0.3))], at: 1, line: false }), (x) => (hashf(x, base, 4) > 0.3 ? 0.9 : 0.2));
      // a few roofs of the keepers' village low on the slope toward the shore
      const thatch = P.mat(null, { cols: ['#3a3438', '#5a4a40', '#8a7050'], at: 1, lineCol: '#141a22' });
      for (const f of [-0.55, -0.4, -0.22]) {
        const hx = Math.round(ix + iw * f), hy = prof(hx) + s(3), hwid = Math.max(3, s(5));
        L.poly([[hx - hwid, hy + 1], [hx - hwid + s(2), hy - s(3)], [hx + hwid - s(2), hy - s(3)], [hx + hwid, hy + 1]], thatch, (x, y) => (y < hy - s(2) ? 0.9 : x < hx ? 0.6 : 0.2));
      }
      // the great tree as the island's first sight draws it (RB.firstSightArt.paintTree, 42g_interlude_firstsight.js;
      // RBN-QA-072 refine, Agnes 6322775156): its long limbs reaching out low under a wide umbrella of separate leaf masses,
      // its trunk flaring into the crown of the hill, all at the distance (its own scale), so it is the same tree as when
      // you landed (the Wind Stone's trunk and leaf, #6a5038 and #4a7a3a, here in the shade of the dusk with the low sun
      // on their left)
      const trunk = P.mat(null, { cols: ['#1a161c', '#241e22', '#2e2626', '#3a302c', '#5a4434', '#8a6440', '#c08a50'], at: 3, lineCol: '#0e0c12' });
      const lf = (k) => hexOf(mix3('#4a7a3a', '#141c26', k));
      const leafM = P.mat(null, { cols: [lf(0.86), lf(0.8), lf(0.74), lf(0.68), lf(0.62), lf(0.55), lf(0.47), lf(0.38), hexOf(mix3('#5a6a34', '#d09050', 0.55)), '#f2c070'], at: 4, lineCol: '#0c1014' });
      const kt = rw / 217, Gt = { s: (n) => Math.max(1, Math.round(n * kt)), narrow: false, tx, crest: ty - Math.max(1, Math.round(3 * kt)), cr: { x: tx, y: cy, rx: rw, ry: rh } };
      RB.firstSightArt.paintTree(L, Gt, trunk, leafM);
      backlit(L, leafM, 7, tx + Math.round(rw * 0.2) - lx0);
      L.outline();
      const lc = L.canvas();
      g.drawImage(lc, lx0, ly0);
      // its broken reflection on the water under it, and the gold rim the low sun puts on the crown's left edge
      for (let i = 1; i < s(8); i++) {
        if (i % 3 === 2) continue;
        g.globalAlpha = 0.22 * (1 - i / s(8));
        g.drawImage(lc, 0, base - i - ly0, lc.width, 1, lx0 + (i % 4 === 1 ? 1 : 0), base + Math.round(i * 0.8), lc.width, 1);
      }
      g.globalAlpha = 1;
      const B0 = bounds(lc), B = { x0: B0.x0 + lx0, x1: B0.x1 + lx0, y0: B0.y0 + ly0, y1: B0.y1 + ly0 };
      return { cv, sun, wake, island: { x: ix, w: iw, base }, tree: { x: tx, top: B.y0, base: ty, left: tx - rw, right: tx + rw }, bounds: B };
    });
  }

  // ---- live ------------------------------------------------------------------------------------------------------
  // The swell: short crests catching the light, longer and wider apart toward us, moving slowly across; near ones
  // with a darker trough under them. Seeded per size; still under reduced motion.
  function waveSet(G) {
    return cached(key('waves', G), () => {
      const rn = K().rnd(4471), out = [], n = Math.round(G.w * (G.yT - G.yH) / 520);
      for (let i = 0; i < n; i++) out.push({ u: rn(), v: Math.pow(rn(), 1.25), ph: rn() * 6.28, beat: 900 + rn() * 1400 });
      return out;
    });
  }
  function waves(c, G, t, still, rgb, wake) {
    const { w, yH, yT, s } = G;
    for (const W of waveSet(G)) {
      const y = Math.round(yH + 2 + (yT - yH - 2) * Math.pow(W.v, 1.5)), len = 1 + Math.round(W.v * W.v * s(9));
      const x = Math.round(((W.u * w + (still ? 0 : (t / 1000) * (1 + W.v * 7) * G.Z)) % w + w) % w);
      if (wake) { const T = track(G, wake, (yT - y) / Math.max(1, yT - yH)); if (x + len > T.mid - T.hw && x < T.mid + T.hw) continue; } // (the track is smooth)
      const k = still ? (W.ph > 3.6 ? 0.8 : 0) : (Math.sin(t / W.beat + W.ph) + 1) / 2;
      if (k < 0.45) continue;
      c.fillStyle = 'rgba(' + rgb + ',' + (0.2 + (k - 0.45) * 1.1).toFixed(2) + ')';
      c.fillRect(x, y, len, 1);
      if (W.v > 0.45) { c.fillStyle = 'rgba(16,34,52,0.16)'; c.fillRect(x + 1, y + 1, len, 1); }
    }
  }
  // Foam in the wake: flecks that leave the stern and travel back along the track, slowing as they go.
  function foam(c, G, wake, t, still) {
    const { yT, yH, s } = G, rn = K().rnd(5303);
    for (let i = 0; i < 24; i++) {
      const u0 = rn(), side = rn() * 2 - 1, sp = 3600 + rn() * 2400;
      const u = still ? u0 : (u0 + t / sp) % 1, p = 0.42 * (1 - Math.pow(1 - u, 2));
      const T = track(G, wake, p), y = Math.round(yT - (yT - yH) * p), x = Math.round(T.mid + side * T.hw * 0.8), sz = Math.max(1, Math.round((1 - p * 2) * s(2.5)));
      c.fillStyle = 'rgba(248,252,250,' + (0.8 * (1 - p * 2)).toFixed(2) + ')';
      c.fillRect(x, y, sz + 1, 1);
    }
  }
  // the sun's glitter on its path: points of light that come and go
  function glitter(c, G, sun, t, still) {
    const { yH, yT, s } = G, rn = K().rnd(7717);
    for (let i = 0; i < 40; i++) {
      const v = Math.pow(rn(), 1.3), y = Math.round(yH + 2 + (yT - yH - 3) * v), hw = s(4) + (y - yH) * 0.32, x = Math.round(sun.x + (rn() * 2 - 1) * hw);
      const ph = rn() * 6.28, k = still ? (ph > 3.2 ? 1 : 0) : Math.max(0, Math.sin(t / (500 + rn() * 600) + ph));
      if (k < 0.6) continue;
      c.fillStyle = 'rgba(255,244,214,' + (0.4 + (k - 0.6) * 1.4).toFixed(2) + ')';
      c.fillRect(x, y, 1 + Math.round(v * s(4)), 1);
    }
  }
  // a little foam where the bow parts the water, either side of the stem
  function bowWave(c, G, t, still) {
    const { cx, yT, s } = G;
    for (const sd of [-1, 1]) for (let i = 0; i < 6; i++) {
      const ph = still ? i : t / 160 + i * 1.7 + (sd > 0 ? 2 : 0), dx = s(10) + i * s(9) + Math.round(Math.sin(ph) * s(2));
      c.fillStyle = 'rgba(244,250,248,' + (0.75 - i * 0.1).toFixed(2) + ')';
      c.fillRect(cx + sd * dx - (sd < 0 ? s(6) : 0), yT - s(1) - Math.round(i * 0.5), s(6) - i % 2, 1);
    }
  }

  // ---- the moments ------------------------------------------------------------------------------------------------
  const GULL_AT = (G) => ({ s: G.s, ow: G.w, vy0: G.s(6), yH: G.yH, ox: (u) => Math.round(u * G.w) });
  function drawStage(c, G, stg, t, still) {
    if (stg === 'leaves') {
      c.drawImage(leavesView(G).cv, 0, 0);
      waves(c, G, t, still, '236,250,246');
      leaves(c, G, leavesOf(G, 14, 9091, [0.06, 0.92]), t, still);
      bowWave(c, G, t, still);
      const Bw = bow(G); c.drawImage(Bw.cv, 0, Bw.y);
    } else if (stg === 'back') {
      const V = backView(G);
      c.drawImage(V.cv, 0, 0);
      waves(c, G, t, still, '255,232,200', V.wake);
      glitter(c, G, V.sun, t, still);
      foam(c, G, V.wake, t, still);
      leaves(c, G, leavesOf(G, 4, 9133, [0.25, 0.8]), t, still);
      const S = stern(G, true); c.drawImage(S.cv, 0, S.y);
    } else {
      const V = outView(G);
      c.drawImage(V.cv, 0, 0);
      waves(c, G, t, still, '248,250,250', V.wake);
      foam(c, G, V.wake, t, still);
      RB.tideArt.gulls(c, GULL_AT(G), t, still);
      const S = stern(G, false); c.drawImage(S.cv, 0, S.y);
    }
  }
  // The still layers of a moment (built on first use, or ahead); the moment after this one is built while this one is
  // read, in idle time, so that moving on to it costs no frame.
  function prepare(G, stg) {
    waveSet(G);
    if (stg === 'leaves') { leavesView(G); bow(G); leavesOf(G, 14, 9091, [0.06, 0.92]); }
    else if (stg === 'back') { backView(G); stern(G, true); leavesOf(G, 4, 9133, [0.25, 0.8]); }
    else { outView(G); stern(G, false); }
  }
  // (only for the showing it was asked in, RB.interlude.generation(): after a clear, a load or another showing of the
  // same moment it does nothing; aheadAsked, aheadRan: how often it was asked, and the generations it built for, for the
  // tests)
  const NEXT = { out: 'leaves' };
  let aheadKey = null, aheadAsked = 0;
  const aheadRan = [];
  const genNow = () => (RB.interlude.generation ? RB.interlude.generation() : 0);
  function ahead(G, stg) {
    const k = key('ahead|' + stg, G);
    if (!NEXT[stg] || aheadKey === k) return;
    aheadKey = k;
    aheadAsked++;
    const g = genNow();
    const run = () => { if (g !== genNow() || live.stage !== stg) return; aheadRan.push(g); if (aheadRan.length > 8) aheadRan.shift(); prepare(G, NEXT[stg]); };
    if (typeof requestIdleCallback === 'function') requestIdleCallback(run, { timeout: 1500 }); else setTimeout(run, 300);
  }
  // the moment before, kept to dissolve from (one canvas per size)
  const scratch = (G) => cached(key('scratch', G), () => mk(G.w, G.h));
  const REVEAL = 520, SWAP = 760, REVEAL_STILL = 120, SWAP_STILL = 160, STEPS = 6;

  let last = null; // the size and moment last drawn at (tests)
  RB.interlude.ART.ko_crossing = {
    stages: ['out', 'leaves', 'back'],
    draw(c, w, h, t, st) {
      const G = geom(w, h, st.vb), at = now();
      last = { w, h, vb: st.vb, stage: st.stage };
      if (live.stage == null) { live.shown = at - st.since; live.prev = null; live.swap = 0; }
      else if (st.stage !== live.stage) { live.prev = live.stage; live.swap = at - st.since; }
      live.stage = st.stage;
      drawStage(c, G, st.stage, t, st.still);
      // from the moment before: a stepped dissolve
      const ks = live.prev ? (at - live.swap) / (st.still ? SWAP_STILL : SWAP) : 1;
      if (ks < 1) {
        const sc = scratch(G), g = sc.getContext('2d');
        g.imageSmoothingEnabled = false;
        drawStage(g, G, live.prev, t, st.still);
        c.globalAlpha = 1 - steps(ks, STEPS);
        c.drawImage(sc, 0, 0);
        c.globalAlpha = 1;
      } else live.prev = null;
      // up from the dark the scene was in: a stepped reveal (the fade's own black)
      const kr = (at - live.shown) / (st.still ? REVEAL_STILL : REVEAL);
      if (kr < 1) { c.fillStyle = 'rgba(7,8,13,' + (1 - steps(kr, STEPS)).toFixed(3) + ')'; c.fillRect(0, 0, w, h); }
      else ahead(G, st.stage);
    },
    // its still layers for a moment at a size, built ahead of it (RB.interlude.ahead)
    prepare(w, h, vb, stage) { prepare(geom(w, h, vb), stage); },
    // tests: where the things the lines name are, against the dialogue sheet's top (vb), and whether the picture is
    // still coming up or changing; by default at the size last drawn
    probe(w, h, vb) {
      if (w == null) { if (!last) return null; ({ w, h, vb } = last); }
      const held = mine.size; // (before the probe's own measuring builds any)
      const G = geom(w, h, vb), O = outView(G), B = backView(G), S = stern(G, false), Bw = bow(G);
      const lv = leavesOf(G, 14, 9091, [0.06, 0.92]).map((L) => leafAt(G, L, 0, true));
      const at = now();
      return {
        w, h, vb, yH: G.yH, stage: last && last.stage, settling: !!live.prev || (at - live.shown) < REVEAL,
        point: { top: O.point.y0, bottom: O.point.y1, left: O.point.x0, right: O.point.x1, tip: O.point.tip, lighthouseX: O.point.lighthouse.x },
        stern: { top: S.top, rail: S.rail }, bow: { top: Bw.top, rail: Bw.rail },
        leaves: { n: lv.length, top: Math.min(...lv.map((p) => p.y - (p.k > 1 ? Math.ceil(p.len * 0.3) : 0))), bottom: Math.max(...lv.map((p) => p.y + (p.k > 1 ? Math.ceil(p.len * 0.3) + p.k : 3 * p.k))), inView: lv.filter((p) => p.x >= 0 && p.x + (p.k > 1 ? p.len : 3 * p.k) <= w).length,
          near: near.map((d) => ({ box: d.box.slice(), len: d.len })) },
        tree: B.tree, sun: B.sun, island: B.island,
        // its own layers held when asked (before this probe built any), and its look ahead: the generation now, how often
        // it was asked, and the generations it built for
        cached: held, ahead: { gen: genNow(), asked: aheadAsked, ran: aheadRan.slice() },
      };
    },
  };
})();
