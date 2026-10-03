/* Title screen and the six-slot travel ledger.
 *
 * The title is a lantern road at dusk seen from a roadside inn's threshold:
 * the door frame, a writing desk with the folio and a lamp, and beyond it the
 * road running up the valley beside a river with an arched bridge. It is
 * drawn in pixels on the game canvas (drawBackdrop, also used behind the
 * prologue and character creation). The menu is an inked list on a paper
 * leaf held in the folio's cloth cover.
 *
 * The ledger (slots) serves New Game, Load and Save: one numbered record per
 * slot with its real thumbnail, names, place, playtime and time saved; one
 * primary action per record, and a plainly labelled Manage area for copy,
 * delete, overwrite and recovery points. Destructive actions are confirmed. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.ui.title = (function () {
  'use strict';
  const esc = RB.util.esc;
  const I = (n, t) => RB.ui.folio.icon(n, t);
  Object.assign(RB.ui.folio.ICONS, {
    newpage: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><path d="M12 10.5v6M9 13.5h6"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><circle cx="12" cy="7.7" r=".7"/>',
    chevdown: '<path d="M6 9l6 6 6-6"/>',
    torn: '<path d="M6 3h12v9l-2 1.5 1 2-2 1 1 2.5-2 1H6z"/><path d="M9 8h6M9 11h4"/>',
    blank: '<path d="M6 3h12v18H6z" stroke-dasharray="2.5 2.5"/>',
  });
  let layer = null, mastObs = null;

  // ---- storage status ---------------------------------------------------------------
  // level: 'ok' (works) | 'note' (works with a caveat) | 'bad' (nothing persists)
  function storageInfo() {
    const st = RB.save.status();
    const file = st.fileMode ? ' You opened the file directly (file://). This browser allowed a storage test here, but some browsers treat each file location differently; for dependable saves serve the folder from a local web address.' : '';
    if (st.mode === 'idb') {
      return {
        level: st.fileMode ? 'note' : 'ok', mode: st.mode,
        short: st.fileMode ? 'Saving works, but this page was opened as a file' : 'Saving works in this browser',
        detail: 'Saves are kept in this browser (IndexedDB). They belong to this browser profile and this page\'s address; clearing site data or private browsing can remove them.' + file + (st.persisted ? ' Persistent storage is granted.' : ''),
      };
    }
    if (st.mode === 'local') {
      return {
        level: 'note', mode: st.mode,
        short: 'Saving in this browser’s smaller backup storage',
        detail: 'IndexedDB was unavailable, so saves use this browser\'s smaller localStorage instead. They still belong to this browser profile and address.' + file,
      };
    }
    return {
      level: 'bad', mode: st.mode,
      short: 'Session only — nothing is being saved',
      detail: 'This browser context refused storage, so the game is session-only: progress will be lost when the page closes. Nothing is being saved.',
    };
  }

  // ---- the title scene (pixels on the game canvas) -----------------------------------------
  // Drawn at art resolution (drawBackdrop.art): 2 art px per logical px. The
  // static scene is built once per buffer size; stars, water glints,
  // lanterns, reeds and the desk lamp are drawn live on top. Glows are
  // stepped rings of falling alpha (pixel glows), never blurred gradients.
  // Key points [y, x, half-width] as fractions of the buffer; smooth between them.
  const PLAN = {
    tall: {
      hz: 0.29, by: 0.405, moon: [0.17, 0.245],
      river: [[0.29, 0.57, 0.003], [0.315, 0.63, 0.012], [0.345, 0.61, 0.035], [0.42, 0.72, 0.11], [0.52, 0.84, 0.22], [1, 1.12, 0.5]],
      road: [[0.29, 0.46, 0.003], [0.35, 0.44, 0.02], [0.43, 0.40, 0.045], [0.55, 0.36, 0.085], [1, 0.46, 0.26]],
      lamps: [0.012, 0.045, 0.09, 0.15, 0.24, 0.4],
      desk: [0, 0.87, 0.46], far: [[0.74, 0.97], [0.05, 0.3]],
    },
    wide: {
      hz: 0.47, by: 0.6, moon: [0.56, 0.17],
      river: [[0.47, 0.465, 0.003], [0.505, 0.52, 0.01], [0.55, 0.495, 0.03], [0.64, 0.535, 0.075], [0.8, 0.66, 0.17], [1, 0.9, 0.34]],
      road: [[0.47, 0.41, 0.003], [0.55, 0.395, 0.016], [0.66, 0.375, 0.04], [0.82, 0.38, 0.07], [1, 0.43, 0.12]],
      lamps: [0.03, 0.09, 0.17, 0.3, 0.48, 0.72],
      desk: [0, 0.8, 0.27], far: [[0.55, 0.72], [0.1, 0.34]],
    },
  };
  function along(pts, yf) {
    if (yf <= pts[0][0]) return [pts[0][1], pts[0][2]];
    for (let i = 1; i < pts.length; i++) {
      if (yf <= pts[i][0]) {
        const a = pts[i - 1], b = pts[i], k = (yf - a[0]) / (b[0] - a[0]), s = k * k * (3 - 2 * k);
        return [a[1] + (b[1] - a[1]) * s, a[2] + (b[2] - a[2]) * k];
      }
    }
    const z = pts[pts.length - 1];
    return [z[1], z[2]];
  }
  const scene = { key: '', cv: null, L: null };
  const glows = {};
  function canvas(w, h) {
    if (RB.sprites && RB.sprites.makeCanvas) return RB.sprites.makeCanvas(w, h);
    const cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    return cv;
  }
  // A pixel glow: flat rings whose alpha rises gently toward the centre (cached).
  function glowSprite(r, rgb) {
    const k = r + rgb;
    if (glows[k]) return glows[k];
    const cv = canvas(r * 2 + 1, r * 2 + 1);
    const g = cv.getContext('2d');
    const steps = [[1, 0.03], [0.82, 0.035], [0.65, 0.04], [0.49, 0.05], [0.34, 0.06], [0.2, 0.08]];
    for (const [f, a] of steps) {
      g.fillStyle = 'rgba(' + rgb + ',' + a + ')';
      RB.pxkit.disc(g, r, r, Math.max(1, Math.round(r * f)));
    }
    return (glows[k] = cv);
  }

  // The page's title layout (40_title.css): '' centred across the top, 's'
  // top left beside the folio, 'sl' the same on a short landscape screen
  // (where the folio reaches nearly to the lintel)
  const ASIDE = '(min-width: 700px) and (min-aspect-ratio: 1/1)', LOW = '(max-height: 520px)';
  let asideQ = null, lowQ = null;
  function mastAside() {
    if (!asideQ && window.matchMedia) { asideQ = window.matchMedia(ASIDE); lowQ = window.matchMedia(LOW); }
    return asideQ && asideQ.matches ? (lowQ.matches ? 'sl' : 's') : '';
  }
  // The title's words where they sit over the canvas, in art px with a small
  // margin (the stars keep out from behind them); [] when the title is not up.
  function mastRects(w, h, el) {
    const mast = document.querySelector('.title .mast');
    if (!mast || !el || !el.getBoundingClientRect) return [];
    const cv = el.getBoundingClientRect();
    if (!cv.width || !cv.height) return [];
    const sx = w / cv.width, sy = h / cv.height, out = [];
    const walk = document.createTreeWalker(mast, NodeFilter.SHOW_TEXT), rg = document.createRange();
    for (let n = walk.nextNode(); n; n = walk.nextNode()) {
      if (!n.nodeValue.trim()) continue;
      rg.selectNodeContents(n);
      for (const q of rg.getClientRects()) out.push([(q.left - cv.left - 6) * sx, (q.top - cv.top - 6) * sy, (q.right - cv.left + 6) * sx, (q.bottom - cv.top + 6) * sy]);
    }
    return out;
  }
  function buildScene(w, h, el) {
    const K = RB.pxkit;
    const P = h > w * 1.15 ? PLAN.tall : PLAN.wide;
    // where the page puts the title: top left beside the folio (40_title.css),
    // or centred across the top; the noren and the moon keep clear of it
    const side = mastAside();
    const L = { w, h, tall: P === PLAN.tall, side, lamps: [], reeds: [], stars: [], water: [] };
    const cv = canvas(w, h);
    const c = cv.getContext('2d');
    c.imageSmoothingEnabled = false;
    const R = (x, y, ww, hh, col) => { if (col) c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.max(0, Math.round(ww)), Math.max(0, Math.round(hh))); };
    const rnd = RB.util.rng(1187);
    const hz = Math.round(h * P.hz);
    L.hz = hz;
    const river = (y) => { const [x, hw] = along(P.river, y / h); return [Math.round(x * w - hw * w), Math.round(x * w + hw * w)]; };
    const road = (y) => { const [x, hw] = along(P.road, y / h); return [Math.round(x * w - hw * w - 0.5), Math.round(x * w + hw * w + 0.5)]; };
    L.river = river;

    // sky: dusk bands with a narrow ordered-dither seam between steps, darkest at the top where the title reads
    const img = c.createImageData(w, hz);
    K.bands(img, w, 0, hz, ['#0b0f22', '#0f1429', '#131a33', '#18203f', '#1f2749', '#292e55', '#373358', '#4a3c5c'], 0.45);
    c.putImageData(img, 0, 0);
    // stars: [x, y, phase, bright, beat ms] — each twinkles on its own beat
    for (let i = 0; i < 56; i++) L.stars.push([Math.round(rnd() * w), Math.round(rnd() * hz * 0.72), rnd() * 6.28, rnd() < 0.22, 700 + Math.round(rnd() * 2300)]);
    // with the title centred across the top, much of the sky is behind it:
    // sow more, all the way down to the ridges (the rest are filtered below)
    if (L.tall || !side) { const r2 = RB.util.rng(4211); for (let i = 0; i < 80; i++) L.stars.push([Math.round(r2() * w), Math.round(r2() * hz), r2() * 6.28, r2() < 0.2, 700 + Math.round(r2() * 2300)]); }
    // thin moonlit cloud streaks low over the far ridge (away from the title)
    for (let i = 0; i < 4; i++) {
      const cy = Math.round(hz * (0.56 + i * 0.07)), cx = Math.round(w * (L.tall ? 0.2 + i * 0.2 : 0.56 + (i % 2) * 0.16 + i * 0.05)), len = Math.round(w * (0.12 + (i % 3) * 0.05));
      R(cx - len / 2, cy, len, 2, '#2c2d52'); R(cx - len / 2 + 6, cy - 1, len - 16, 1, '#3e3c62'); R(cx - len / 2 + 10, cy + 2, len - 30, 1, '#232548');
    }
    // the moon: a stepped halo and a crescent with a shaded limb and two faint maria
    const moon = L.tall || side === 's' ? P.moon : side ? [0.72, 0.115] : [0.85, 0.27];
    const mx = Math.round(moon[0] * w), my = Math.round(moon[1] * h), mr = Math.max(6, Math.round(Math.min(w, h) * 0.018));
    c.drawImage(glowSprite(mr * 5, '200,210,240'), mx - mr * 5, my - mr * 5);
    for (let y = -mr; y <= mr; y++) for (let x = -mr; x <= mr; x++) {
      if (x * x + y * y > mr * mr + mr * 0.6) continue;
      const cut = (x + mr * 0.55) * (x + mr * 0.55) + (y - mr * 0.3) * (y - mr * 0.3) <= mr * mr * 0.85;
      if (cut) continue;
      const edge = x * x + y * y > (mr - 1.5) * (mr - 1.5);
      R(mx + x, my + y, 1, 1, edge && x > 0 ? '#c9c0a2' : x > mr * 0.35 ? '#dcd4b8' : '#f1e9cc');
    }
    L.moon = [mx, my, mr];
    R(mx + Math.round(mr * 0.45), my - Math.round(mr * 0.3), 2, 2, '#d2c9ac'); R(mx + Math.round(mr * 0.6), my + Math.round(mr * 0.25), 2, 1, '#d2c9ac');
    // mountains, far to near; the far ridges catch moonlight on their crests
    const skyline = L.skyline = new Int16Array(w).fill(hz); // the highest ridge in each column
    const ridge = (base, amp, f1, f2, ph, col, rim, crest) => {
      let prev = null;
      for (let x = 0; x < w; x++) {
        const v = Math.sin(x / (w * f1) + ph) * 0.6 + Math.sin(x / (w * f2) + ph * 2.3) * 0.4;
        const top = Math.round(base - amp * (0.55 + v * 0.45));
        if (top < skyline[x]) skyline[x] = top;
        R(x, top, 1, hz - top + 1, col);
        if (rim && prev != null && top < prev + 1) R(x, top, 1, top < prev ? 2 : 1, rim);
        if (crest) R(x, top + 2 + ((x * 7) % 5 === 0 ? 1 : 0), 1, 1, crest);
        prev = top;
      }
    };
    ridge(hz, h * (L.tall ? 0.1 : 0.17), 0.13, 0.05, 2.6, '#2a2c52', '#3b3a66');
    ridge(hz, h * (L.tall ? 0.075 : 0.13), 0.09, 0.035, 1.3, '#1a2044', '#262c56');
    // the near ridge is wooded: a fringe of tree crowns along its crest
    for (let x = 0; x < w; x += 3) {
      const v = Math.sin(x / (w * 0.06) + 4.1) * 0.6 + Math.sin(x / (w * 0.021) + 4.1 * 2.3) * 0.4;
      const top = Math.round(hz - h * (L.tall ? 0.035 : 0.06) * (0.55 + v * 0.45));
      const bump = 2 + ((x * 13) % 7 === 0 ? 2 : (x * 5) % 3);
      R(x - 1, top - bump, 4, hz - top + bump + 1, '#141a36');
    }
    R(0, hz - 1, w, 1, '#262c52');
    // fields below the horizon: paddies in strips that widen toward the viewer, a
    // thin moonlit water line along some of them; then a darker near ground
    R(0, hz, w, h - hz, '#141b2c');
    for (let i = 0, y = hz + 1; y < h * 0.98 && i < 40; i++) {
      const d = (y - hz) / (h - hz), sh = Math.max(2, Math.round(2 + d * d * 30));
      R(0, y, w, sh, i % 2 ? '#151c2e' : '#131a2a');
      if (i % 4 === 1 && d < 0.5) {
        for (let x = (i * 37) % 23; x < w; x += 70 + (i * 11) % 40) R(x, y, 16 + ((x + i) % 18), 1, d < 0.2 ? '#252e56' : '#1c2440');
      }
      y += sh;
    }
    // far villages: a few pitched-roof houses with lit windows
    for (const [a, b] of P.far) {
      const x0 = Math.round(a * w), x1 = Math.round(b * w);
      for (let x = x0; x < x1 - 8; x += 10 + Math.floor(rnd() * 8)) {
        const hw = 6 + Math.floor(rnd() * 5), hh = 4 + Math.floor(rnd() * 3), y = hz + 2 + Math.floor(rnd() * 5);
        const [rl, rr] = river(y);
        if (x + hw >= rl - 2 && x <= rr + 2) continue;
        R(x, y - hh, hw, hh + 1, '#0e1322');
        for (let j = 0; j < 3; j++) R(x - 2 + j, y - hh - 1 - j, hw + 4 - j * 2, 1, j === 2 ? '#1a2038' : '#0b0f1c');
        if (rnd() < 0.75) { const wx = x + 2 + Math.floor(rnd() * (hw - 4)); R(wx, y - hh + 2, 2, 2, rnd() < 0.6 ? '#e8b860' : '#9a7446'); }
      }
    }
    // the river: widening toward the viewer; sky-lit far away, deep near; a
    // dark lip on the far bank and a pale one on the near bank
    const by = Math.round(h * P.by);
    for (let y = hz; y < h; y++) {
      const [x0, x1] = river(y);
      const d = (y - hz) / (h - hz);
      const wob = Math.sin(y * 0.85) > 0.6 ? 1 : 0;
      R(x0 + wob, y, x1 - x0 - wob, 1, d < 0.06 ? '#3e4876' : d < 0.14 ? '#34406c' : d < 0.3 ? '#26335c' : '#1a2748');
      if (d > 0.3 && ((y * 7) % 11) < 3) R(x0 + (x1 - x0) * 0.2, y, (x1 - x0) * 0.25, 1, '#1e2c50');
      R(x0 + wob - 2, y, 2, 1, '#0c1222');
      R(x1, y, 2, 1, '#2b3a62');
      if (y > hz + 4 && rnd() < 0.3) L.water.push([x0 + 4 + rnd() * Math.max(1, x1 - x0 - 12), y, 2 + Math.round(d * 8), rnd() * 6.28]);
    }
    // the road on the near bank: a worn centre, two ruts, pebbles in small
    // clusters, grass edges; then the short path to the bridge
    const [bl0, br0] = river(by);
    const bpad = Math.max(6, Math.round((br0 - bl0) * 0.18));
    const bL = bl0 - bpad, bR = br0 + bpad;
    for (let y = hz + 1; y < h; y++) {
      const [x0, x1] = road(y);
      const d = (y - hz) / (h - hz), rw = x1 - x0;
      R(x0, y, rw, 1, d < 0.2 ? '#2c2a3a' : '#3a3342');
      if (rw > 10) R(x0 + rw * 0.35, y, rw * 0.3, 1, d < 0.2 ? '#302d3e' : '#40384a');
      R(x0, y, 2, 1, '#221e2c'); R(x1 - 2, y, 2, 1, '#221e2c');
      if (d > 0.12 && rw > 16) { const cxr = (x0 + x1) / 2, off = rw * 0.22; R(cxr - off, y, 2, 1, '#2a2634'); R(cxr + off - 1, y, 2, 1, '#2a2634'); }
      if (d > 0.3 && rnd() < 0.18) { const px = x0 + 3 + rnd() * Math.max(1, rw - 8); R(px, y, 3, 2, '#4a4152'); R(px, y + 2, 3, 1, '#28222e'); }
      if (d > 0.25 && rnd() < 0.35) { R(x0 - 2, y - 2, 1, 3, '#1d2740'); R(x1 + 1, y - 3, 1, 4, '#1d2740'); }
    }
    // grass tufts on the banks: small fans, denser and larger toward the viewer
    for (let n = 0; n < w * 0.7; n++) {
      const y = Math.round(hz + 6 + Math.pow(rnd(), 0.7) * (h - hz - 12)), x = Math.round(rnd() * w);
      const [ra, rb] = road(y), [wa, wb] = river(y);
      if ((x >= ra - 3 && x <= rb + 2) || (x >= wa - 3 && x <= wb + 3)) continue;
      const d = (y - hz) / (h - hz), s = 1 + Math.round(d * 4);
      R(x, y - s * 2, 1, s * 2, '#1f2a44'); R(x - s, y - s, 1, s, '#1a2238'); R(x + s, y - s - 1, 1, s + 1, '#1a2238');
    }
    // black pines on the near bank, pads alternating, moonlit on top
    const pine = (px, base, size) => {
      const tw = Math.max(2, Math.round(size / 11));
      const bend = (k) => Math.round(Math.sin(k * 2.4) * size * 0.09);
      for (let y = 0; y < size * 0.9; y++) R(px + bend(y / size), base - y, tw, 1, '#0d111e');
      for (const [hy, wf, side] of [[0.46, 0.95, -1], [0.7, 0.72, 1], [0.9, 0.48, -1], [1.02, 0.26, 0]]) {
        const hw = Math.max(3, Math.round(size * wf * 0.48)), th = Math.max(3, Math.round(size * 0.16));
        const cy = base - Math.round(size * hy), cx = px + bend(hy) + side * Math.round(hw * 0.35);
        for (let k = 0; k < th; k++) {
          const ww = Math.round(hw * (0.55 + 0.45 * Math.sqrt(k / Math.max(1, th - 1))));
          R(cx - ww + Math.round((rnd() - 0.5) * 3), cy - th + k, ww * 2 + 1, 1, '#0d111e');
        }
        R(cx - Math.round(hw * 0.55), cy - th, Math.max(2, Math.round(hw * 0.9)), 1, '#1c2440');
        R(cx - Math.round(hw * 0.3), cy - th + 1, Math.max(1, Math.round(hw * 0.4)), 1, '#161d36');
      }
    };
    for (const [fx0, fy0, fs] of (L.tall ? [[0.09, 0.345, 0.05], [0.2, 0.33, 0.03]] : [[0.08, 0.6, 0.12], [0.2, 0.555, 0.07], [0.29, 0.52, 0.045]])) pine(Math.round(fx0 * w), Math.round(fy0 * h), Math.max(12, Math.round(fs * h)));
    const [, rr] = road(by);
    for (let y = by - 2; y <= by + 2; y++) R(rr - 2, y, bL - rr + 4, 1, y === by - 2 ? '#3a3444' : '#322d3c');
    // the arched bridge, side on: deck with plank joints, railing posts and
    // top rail, piers into the water, and its reflection
    const ah = Math.max(8, Math.round((bR - bL) * 0.2));
    const top = (x) => by - Math.round(ah * Math.sin(Math.PI * (x - bL) / (bR - bL)));
    for (let x = bL; x <= bR; x++) {
      const t0 = top(x), refl = Math.round((by - t0) * 0.7) + 4;
      const [wl, wr] = river(by + 4);
      if (x > wl && x < wr) { c.fillStyle = 'rgba(6,9,20,0.45)'; c.fillRect(x, by + 4, 1, refl); if ((x - bL) % 3 === 0) { c.fillStyle = 'rgba(138,90,54,0.18)'; c.fillRect(x, by + 4 + refl - 3, 1, 2); } }
      R(x, t0, 1, 5, '#4d3322');
      R(x, t0, 1, 1, '#9a6a40'); R(x, t0 + 1, 1, 1, '#7a5234');
      if ((x - bL) % 5 === 0) R(x, t0 + 1, 1, 4, '#3a2619');
      R(x, t0 - 6, 1, 1, '#5a3c28');
      if ((x - bL) % 8 === 0) { R(x, t0 - 6, 2, 6, '#3a2619'); R(x, t0 - 7, 2, 1, '#8a5a36'); }
    }
    for (const uu of [0.22, 0.5, 0.78]) { const x = Math.round(bL + (bR - bL) * uu); R(x, top(x) + 5, 2, by + 4 - top(x) - 4, '#2e1f16'); R(x, top(x) + 5, 1, by + 4 - top(x) - 4, '#3e2a1c'); }
    for (const x of [bL, bR - 1]) { R(x, top(x) - 10, 2, 10, '#3a2619'); R(x - 1, top(x) - 12, 4, 2, '#7a5234'); }
    const cx = Math.round((bL + bR) / 2);
    L.bridge = { x0: bL - 6, x1: bR + 6, y0: by - ah - 24, y1: by + 6 };
    // its lantern, and where the lantern shows in the water: mirrored about
    // the water line and squashed like the bridge's own reflection
    L.lamps.push({ x: cx, y: top(cx) - 12, s: 2, bridge: true, ry: by + 4 + Math.round((by + 4 - (top(cx) - 12)) * 0.7) });
    R(cx, top(cx) - 10, 2, 5, '#2a1d15');
    // lantern posts along the road, alternating sides, growing with nearness
    P.lamps.forEach((f, i) => {
      const y = Math.round(hz + 3 + f * (h - hz));
      const [x0, x1] = road(y);
      const d = (y - hz) / (h - hz);
      const s = Math.max(2, Math.round(2 + d * (L.tall ? 10 : 8)));
      const x = i % 2 ? x1 + s + 2 : x0 - s - 3;
      const pole = Math.round(6 + s * 3.2), pw = Math.max(1, Math.round(s / 3));
      R(x, y - pole, pw, pole, '#1a1418'); R(x, y - pole, 1, pole, '#2a2026');
      R(x - s, y - pole - Math.round(s * 1.6) - 2, s * 2 + pw, Math.max(1, Math.round(s / 4)), '#241b20');
      R(x - Math.round(s * 0.7), y - 1, Math.round(s * 1.4) + pw, 1, '#0c0f1a');
      L.lamps.push({ x: x + Math.floor(pw / 2), y: y - pole - Math.round(s * 0.8), s, out: i === 2 });
      if (i !== 2) {
        // warm light pooled on the road under the lamp, in two flat steps
        const rx = Math.max(8, s * 7), ry = Math.max(3, Math.round(s * 2.2));
        c.fillStyle = 'rgba(255,190,110,0.07)'; K.disc(c, x, y, rx, ry);
        c.fillStyle = 'rgba(255,190,110,0.07)'; K.disc(c, x, y, Math.round(rx * 0.55), Math.max(1, Math.round(ry * 0.55)));
      }
    });
    // reeds on the near bank of the river (drawn live so they can sway)
    for (let y = by + 10; y < h - 4; y += 3 + Math.floor(rnd() * 5)) {
      const [x0] = river(y);
      const d = (y - hz) / (h - hz);
      if (rnd() < 0.55) L.reeds.push([x0 - 2 - Math.floor(rnd() * 6 * d), y, Math.round(4 + d * 16 * (0.6 + rnd() * 0.6)), rnd() * 6.28]);
    }
    // the inn: floor boards inside (seams, staggered joints, grain), the sill,
    // door posts with grain and a lit inner edge, the lintel (and a rolled
    // bamboo blind when there is room above the title)
    const floorY = Math.round(h * (L.tall ? 0.935 : 0.9));
    L.floorY = floorY;
    R(0, floorY, w, h - floorY, '#24170f');
    for (let y = floorY + 6, k = 0; y < h; y += 8, k++) {
      R(0, y, w, 1, '#1a100a');
      for (let x = (k * 29) % 47; x < w; x += 47 + (k % 3) * 12) R(x, y - 7, 1, 7, '#1a100a');
      for (let x = (k * 13) % 31; x < w; x += 31 + (k % 4) * 9) R(x, y - 4 - (k % 2) * 2, 6 + (x % 5), 1, '#2a1b12');
    }
    R(0, floorY, w, 4, '#3b2819'); R(0, floorY, w, 1, '#5a3f2a'); R(0, floorY + 3, w, 1, '#1e140c');
    const post = Math.max(8, Math.round(w * (L.tall ? 0.032 : 0.026)));
    const lint = Math.max(4, Math.round(h * (L.tall ? 0.012 : 0.032)));
    L.post = post;
    for (const x0 of [0, w - post]) {
      R(x0, 0, post, h, '#1c140f');
      for (let y = 10; y < h; y += 17) R(x0 + 2 + ((y * 3) % 5), y, 1, 7 + (y % 5), '#24190f');
      for (let y = 4; y < h; y += 23) R(x0 + 3 + ((y * 7) % 4), y, 2, 3, '#170f0b');
    }
    R(post - 2, lint, 2, h - lint, '#3f2d1f'); R(post - 1, lint, 1, h - lint, '#4c3726'); R(w - post, lint, 2, h - lint, '#2c2017');
    R(0, 0, w, lint, '#1a120d'); R(0, lint - 2, w, 2, '#3a2a1e'); R(0, lint - 1, w, 1, '#46331f');
    // the sliding doors of the inn's entrance, pushed open to either side:
    // pale paper in a lattice, lit warm from the lamp on the left and cool by
    // the moon on the right (so the frame reads as a doorway, not a window)
    const sdw = Math.max(12, Math.round(w * (L.tall ? 0.05 : 0.045)));
    L.shoji = sdw;
    for (const [x0, warm] of [[post, true], [w - post - sdw, false]]) {
      const paper = warm ? '#d6c292' : '#7c8098', paper2 = warm ? '#c4ab78' : '#6e7290', wood = '#2a1c13';
      const pane = Math.max(12, Math.round(h * 0.035));
      R(x0, lint, sdw, floorY - lint, paper);
      // paper panes, tall and even; each a touch darker under its rail
      for (let y = lint + pane; y < floorY; y += pane) { R(x0, y, sdw, 1, wood); R(x0 + 2, y + 1, sdw - 4, 1, paper2); }
      for (const f of [1 / 3, 2 / 3]) R(x0 + Math.round(sdw * f), lint, 1, floorY - lint, wood);  // kumiko bars
      R(x0, lint, 2, floorY - lint, wood); R(x0 + sdw - 2, lint, 2, floorY - lint, wood);        // stiles
      R(x0, floorY - Math.max(6, Math.round(h * 0.03)), sdw, Math.max(6, Math.round(h * 0.03)), '#3a2618'); // kick panel
      R(x0 + (warm ? sdw - 1 : 0), lint, 1, floorY - lint, 'rgba(0,0,0,0.35)');                 // the edge toward the doorway in shade
    }
    // a short indigo noren under the lintel, split in four, with a lantern
    // crest on the middle panels (only where the title sits at the side, below it)
    if (!L.tall && side) {
      const nh = Math.max(10, Math.round(h * 0.034)), x0 = post + sdw, nw = w - 2 * (post + sdw);
      const panes = 4, gap = 2, pw = Math.floor((nw - gap * (panes - 1)) / panes);
      for (let i = 0; i < panes; i++) {
        const px0 = x0 + i * (pw + gap);
        R(px0, lint, pw, nh, '#26325e');
        for (let y = lint + 2; y < lint + nh; y += 3) R(px0 + 1, y, pw - 2, 1, '#2a3870');          // the weave
        for (let x = px0 + 9; x < px0 + pw - 4; x += 23) R(x, lint + 2, 2, nh - 3, '#1f2a52');    // soft folds
        R(px0, lint, pw, 2, '#1a2244'); R(px0, lint + nh - 1, pw, 1, '#1a2244');                   // pole sleeve, hem
        R(px0 + pw - 1, lint, 1, nh, '#1c2548');
      }
      // the crest (a paper lantern in a ring) over the split between the middle two panels
      const cx0 = x0 + 2 * (pw + gap) - gap / 2, cy0 = lint + Math.round(nh / 2) + 1, cr = Math.max(5, Math.round(nh * 0.4));
      c.fillStyle = '#d8d0b8'; K.disc(c, cx0, cy0, cr, cr);
      c.fillStyle = '#24305a'; K.disc(c, cx0, cy0, cr - 1, cr - 1);
      R(cx0 - 2, cy0 - Math.round(cr * 0.55), 4, Math.max(3, Math.round(cr * 1.1)), '#d8d0b8');
      R(cx0 - 1, cy0 - Math.round(cr * 0.55) - 1, 2, 1, '#d8d0b8'); R(cx0 - gap / 2, lint, gap, nh, '#131a33');
      L.norenBottom = lint + nh;
    }
    // the threshold sill across the doorway, with the two grooves the doors run in
    R(post, floorY - 3, w - 2 * post, 3, '#4a3322'); R(post, floorY - 3, w - 2 * post, 1, '#6a4a30');
    R(post, floorY - 2, w - 2 * post, 1, '#2a1c13'); R(post + 1, floorY - 1, w - 2 * post - 2, 1, '#2a1c13');
    // the writing desk (low, on short legs): a lit front edge, grain, a
    // shadow beneath; the folio, inkstone and brush, a teacup, the lamp
    const dx1 = Math.round(P.desk[2] * w), dy = Math.round(P.desk[1] * h);
    const dt = Math.max(4, Math.round(h * 0.014));
    const ap = Math.max(4, Math.round(h * 0.012));
    R(0, dy + dt + ap, dx1, h - dy - dt - ap, 'rgba(8,5,3,0.45)');
    // the desk top, seen a little from above (its far edge back toward the doorway)
    const td = Math.max(6, Math.round(h * (L.tall ? 0.02 : 0.03)));
    R(0, dy - td, dx1, td, '#7a4c2e'); R(0, dy - td, dx1, 1, '#5a3822');
    for (let y = dy - td + 2; y < dy; y += 2) for (let x = (y * 7) % 11; x < dx1 - 4; x += 17 + (y % 5)) R(x, y, 7 + (x % 5), 1, '#84543a');
    R(dx1 - 2, dy - td, 2, td, '#6a4028');
    R(0, dy, dx1, dt, '#6e4428'); R(0, dy, dx1, 1, '#b07a4c'); R(0, dy + 1, dx1, 1, '#8a5a36'); R(dx1 - 2, dy, 2, dt, '#8a5a36');
    for (let x = 8; x < dx1 - 6; x += 13) R(x, dy + 2 + (x % 3 ? 1 : 0), 6 + (x % 4), 1, '#7a4c2e');
    R(0, dy + dt, dx1, ap, '#3a2418'); R(0, dy + dt, dx1, 1, '#24160e'); R(0, dy + dt + ap - 1, dx1, 1, '#2a1a10');
    const leg = Math.max(4, Math.round(w * 0.008));
    for (const x of [post + 4, dx1 - leg - 6]) { R(x, dy + dt + ap, leg, h - dy - dt - ap - 2, '#3a2418'); R(x, dy + dt + ap, 1, h - dy - dt - ap - 2, '#4e321f'); R(x + leg - 1, dy + dt + ap, 1, h - dy - dt - ap - 2, '#2a1a10'); }
    // the folio, lying closed on the desk top: its cloth cover seen from above,
    // the page block and binding along its near side, a ribbon over the edge
    const fw = Math.max(36, Math.min(80, Math.round(Math.min(w, h * 1.4) * 0.085)));
    const fdp = Math.max(5, td - 1), fth = Math.max(3, Math.round(fw * 0.06));
    const fx = Math.max(post + 24, Math.round(dx1 * 0.42)), fy = dy - fdp - 1;       // top of the cover
    R(fx + 2, dy - 1, fw + 2, 1, '#3a2418');                                          // contact shadow
    R(fx, fy, fw, fdp, '#27305c');                                                    // the cover, foreshortened
    for (let y = fy + 1; y < fy + fdp; y += 2) for (let x = fx + 4 + ((y >> 1) & 1) * 2; x < fx + fw - 2; x += 4) R(x, y, 2, 1, '#2d3768');
    R(fx, fy, fw, 1, '#36407a'); R(fx, fy, 3, fdp, '#1c2346');                        // far edge lit; spine
    const sw = Math.max(6, Math.round(fw * 0.22)), sh = Math.max(2, Math.round(fdp * 0.5));
    R(fx + 7, fy + 1, sw, sh, '#f2e9d3'); R(fx + 7, fy + sh, sw, 1, '#cfc3a4');      // the blank title slip, foreshortened
    R(fx, fy + fdp, fw, fth, '#e7dbbd');                                              // the page block, toward us
    for (let x = fx + 3; x < fx + fw; x += 3) R(x, fy + fdp + 1, 1, fth - 1, '#d6c9a4');
    R(fx, fy + fdp + fth - 1, fw, 1, '#b9a87c'); R(fx, fy + fdp, 3, fth, '#1c2346');
    for (let x = fx + 1; x < fx + 3; x++) for (let y = fy + 1; y < fy + fdp + fth - 1; y += 3) R(x, y, 1, 1, '#b9a57a'); // binding thread
    const rbx = fx + Math.round(fw * 0.66), rbl = Math.max(6, Math.round(fdp * 1.4));
    R(rbx, fy + fdp + fth - 1, 3, dy - (fy + fdp + fth - 1) + rbl, '#c18a2a'); R(rbx + 2, fy + fdp + fth - 1, 1, dy - (fy + fdp + fth - 1) + rbl, '#8a5d14'); // ribbon over the desk edge
    R(rbx, dy + rbl, 2, 2, '#c18a2a');
    const ix = fx + fw + 8;
    if (ix + 24 < dx1) {
      R(ix, dy - 4, 14, 5, '#15131a'); R(ix + 1, dy - 4, 12, 1, '#2c2833'); R(ix + 8, dy - 3, 4, 2, '#0a0a10'); // inkstone and its well
      R(ix + 2, dy - 7, 18, 2, '#8a5a36'); R(ix + 2, dy - 7, 18, 1, '#a8744a'); R(ix + 18, dy - 7, 4, 2, '#1a1418'); // brush
      if (ix + 36 < dx1) { R(ix + 26, dy - 7, 8, 7, '#b8b0a0'); R(ix + 26, dy - 7, 8, 1, '#d8d0c0'); R(ix + 27, dy - 6, 6, 1, '#4a6a4a'); R(ix + 33, dy - 7, 1, 7, '#8e867a'); } // teacup
    }
    const lx = post + 6, lh = Math.max(14, Math.round(fw * 0.56)), lw = Math.max(10, Math.round(lh * 0.6));
    R(lx - 2, dy - 2, lw + 4, 2, '#2a1a10');                                  // base
    R(lx, dy - lh, lw, lh, '#3a2418');                                        // frame
    R(lx - 2, dy - lh - 2, lw + 4, 2, '#2a1a10'); R(lx - 2, dy - lh - 2, lw + 4, 1, '#4a3020'); // cap
    R(lx, dy - 2, 2, 2, '#2a1a10'); R(lx + lw - 2, dy - 2, 2, 2, '#2a1a10');  // feet
    L.lamp = { x: lx, y: dy - lh, w: lw, h: lh };
    // moving details stay inside the doorway (between the open doors, above
    // the sill) and never over the bridge (glints drift a few px either way)
    const inX0 = post + sdw, inX1 = w - post - sdw, B = L.bridge;
    const onBridge = (x, y, len) => B && x + len + 4 > B.x0 && x - 4 < B.x1 && y > B.y0 && y < B.y1;
    L.water = L.water.filter(([x, y, len]) => x > inX0 + 4 && x + len < inX1 - 4 && y < floorY - 4 && !onBridge(x, y, len));
    L.reeds = L.reeds.filter(([x, y]) => x > inX0 + 2 && x < inX1 - 2 && y < floorY - 4);
    const skyTop = L.norenBottom ? L.norenBottom + 3 : lint + 2;
    const nearMoon = (x, y) => Math.hypot(x - L.moon[0], y - L.moon[1]) < L.moon[2] * 2.2;
    const words = mastRects(w, h, el);
    const inMast = words.length ? (x, y) => words.some((q) => x >= q[0] && x <= q[2] && y >= q[1] && y <= q[3])
      : (x, y) => (L.tall ? x > w * 0.08 && x < w * 0.92 && y < h * 0.2 : side ? x < w * 0.5 && y < h * 0.42 : x > w * 0.12 && x < w * 0.88 && y < h * 0.3);
    L.stars = L.stars.filter(([x, y]) => x > inX0 + 2 && x < inX1 - 4 && y > skyTop && y < skyline[x] - 4 && !inMast(x, y) && !nearMoon(x, y));
    L.sky = { x0: inX0 + 4, x1: inX1 - 4, y0: skyTop + 2, y1: Math.round(hz * 0.8), mast: inMast };
    scene.key = w + 'x' + h + side;
    scene.cv = cv;
    scene.L = L;
  }

  // The night sky: stars twinkling each on its own beat, the bright ones
  // catching a four-point sparkle at their peak and, now and then, a small one
  // flaring; a shooting star every so often and, rarely, a slow comet. With
  // reduced motion the stars hold still and nothing streaks across.
  const STAR = '240,236,214';
  function px(c, x, y, a, s) { if (a <= 0.02) return; c.fillStyle = 'rgba(' + STAR + ',' + Math.min(1, a).toFixed(2) + ')'; c.fillRect(Math.round(x), Math.round(y), s || 1, s || 1); }
  function sparkle(c, x, y, arm, a) {
    for (let i = 1; i <= arm; i++) { const f = a * (1 - (i - 1) / (arm + 1)); px(c, x - i, y, f); px(c, x + i, y, f); px(c, x, y - i, f); px(c, x, y + i, f); }
  }
  function drawSky(c, L, t, still) {
    const n = L.stars.length;
    const flare = n ? Math.floor(t / 1700) : 0, fi = n ? (flare * 2654435761 >>> 0) % n : -1, fk = (t % 1700) / 1700;
    for (let i = 0; i < n; i++) {
      const [x, y, ph, big, per] = L.stars[i];
      if (still) { px(c, x, y, big ? 0.75 : 0.5, big ? 2 : 1); continue; }
      const u = Math.pow((Math.sin(t / per + ph) + 1) / 2, 2.2);
      px(c, x, y, 0.28 + 0.62 * u, big ? 2 : 1);
      const cx = big ? x + 0.5 : x, cy = big ? y + 0.5 : y;
      if (big && u > 0.7) sparkle(c, Math.round(cx), Math.round(cy), 1 + Math.round((u - 0.7) / 0.3 * 2), 0.55 * (u - 0.55));
      if (i === fi && fk < 0.3) { const k = Math.sin(fk / 0.3 * Math.PI); sparkle(c, x, y, 1 + Math.round(k * 2), 0.6 * k); px(c, x, y, 0.4 + 0.6 * k); }
    }
    const S = L.sky;
    if (still || !S) { scene.fx = null; return; }
    const F = scene.fx || (scene.fx = { next: t + 3000 + Math.random() * 5000, nextComet: t + 40000 + Math.random() * 50000, m: null, cm: null });
    if (t < F.next - 60000) { F.next = t + 3000; F.nextComet = t + 40000; } // the clock went back (a new page): start over
    const inSky = (x, y) => x >= S.x0 && x < S.x1 && y >= S.y0 && y < S.y1;
    // a shooting star: in from the upper right, down to the left, a fading tail
    if (!F.m && t > F.next) {
      const sp = 0.3 + Math.random() * 0.14;
      F.m = { x: S.x0 + (S.x1 - S.x0) * (0.35 + Math.random() * 0.6), y: S.y0 + (S.y1 - S.y0) * Math.random() * 0.45, vx: -sp, vy: sp * (0.32 + Math.random() * 0.22), t0: t, d: 620 + Math.random() * 380, tail: 16 + Math.round(Math.random() * 18) };
    }
    if (F.m) {
      const m = F.m, e = t - m.t0;
      if (e > m.d) { F.m = null; F.next = t + 7000 + Math.random() * 12000; }
      else {
        const fade = Math.min(1, e / 110, (m.d - e) / 220), hx = m.x + m.vx * e, hy = m.y + m.vy * e, v = Math.hypot(m.vx, m.vy);
        for (let i = m.tail; i >= 0; i--) {
          const x = hx - (m.vx / v) * i, y = hy - (m.vy / v) * i;
          if (inSky(x, y)) px(c, x, y, fade * Math.pow(1 - i / (m.tail + 1), 1.6) * 0.9);
        }
        if (inSky(hx, hy)) { px(c, hx - 0.5, hy - 0.5, fade, 2); sparkle(c, Math.round(hx), Math.round(hy), 1, 0.35 * fade); }
      }
    }
    // rarely, a comet: slow, its soft tail streaming away from where it is going
    if (!F.cm && t > F.nextComet) {
      const left = Math.random() < 0.5;
      F.cm = { x: left ? S.x0 + 6 : S.x1 - 6, y: S.y0 + (S.y1 - S.y0) * (0.1 + Math.random() * 0.3), vx: (left ? 1 : -1) * (0.012 + Math.random() * 0.006), vy: 0.0025, t0: t, d: 9000 + Math.random() * 3000, tail: 34 + Math.round(Math.random() * 14) };
    }
    if (F.cm) {
      const m = F.cm, e = t - m.t0;
      if (e > m.d) { F.cm = null; F.nextComet = t + 70000 + Math.random() * 70000; }
      else {
        const fade = Math.min(1, e / 1500, (m.d - e) / 1500), hx = m.x + m.vx * e, hy = m.y + m.vy * e, dir = Math.sign(m.vx);
        for (let i = m.tail; i >= 1; i--) {
          const k = 1 - i / (m.tail + 1), x = hx - dir * i, spread = Math.floor(i / 14);
          for (let j = -spread; j <= spread; j++) if (inSky(x, hy - i * 0.08 + j)) px(c, x, hy - i * 0.08 + j, fade * k * k * (j ? 0.25 : 0.5));
        }
        if (inSky(hx, hy)) { px(c, hx - 1, hy - 1, 0.25 * fade, 3); px(c, hx, hy, 0.95 * fade); }
      }
    }
  }
  function drawScene(c, w, h, t) {
    if (scene.key !== w + 'x' + h + mastAside()) buildScene(w, h, c.canvas);
    const L = scene.L;
    const still = RB.game.reducedMotion();
    c.imageSmoothingEnabled = false;
    c.drawImage(scene.cv, 0, 0);
    drawSky(c, L, t, still);
    // water: slow drifting glints and the bridge lantern's reflection
    for (const [x, y, len, ph] of L.water) {
      const k = still ? 0.5 : (Math.sin(t / 1400 + ph) + 1) / 2;
      if (k < 0.55) continue;
      const dx = still ? 0 : Math.round(Math.sin(t / 2600 + ph) * 3);
      c.fillStyle = 'rgba(120,150,200,' + (0.25 + (k - 0.55) * 0.9).toFixed(2) + ')';
      c.fillRect(Math.round(x + dx), y, len, 1);
    }
    // lanterns (one keeps going out, as names do on these roads)
    for (let i = 0; i < L.lamps.length; i++) {
      const p = L.lamps[i];
      const lit = !p.out || (!still && Math.floor(t / 2600) % 2 === 0);
      const s = p.s;
      if (lit) {
        const fl = still ? 0.85 : 0.78 + 0.12 * Math.sin(t / 310 + i * 1.9) + 0.05 * Math.sin(t / 97 + i);
        const r = Math.round(6 + s * 3.5);
        c.globalAlpha = fl;
        c.drawImage(glowSprite(r, '255,200,110'), p.x - r, p.y - r);
        c.globalAlpha = 1;
        if (p.bridge) {
          const [wl, wr] = L.river(p.ry);
          if (p.x > wl && p.x < wr) for (let k = 0; k < 4; k++) { c.fillStyle = 'rgba(255,200,110,' + (0.35 - k * 0.07).toFixed(2) + ')'; c.fillRect(p.x - 1 - (k % 2) * 2, p.ry - 4 + k * 5, 4 + (k % 2), 1); }
        }
      }
      // the lantern box: paper lit (or dark), a darker lower half, a cap
      const bw = Math.max(2, s), bh = Math.max(3, Math.round(s * 1.4));
      const bx = p.x - Math.floor(bw / 2), byy = p.y - Math.floor(bh / 2);
      c.fillStyle = lit ? '#ffd27a' : '#4a4650'; c.fillRect(bx, byy, bw, bh);
      if (bw > 2) { c.fillStyle = lit ? '#e8a850' : '#3a3640'; c.fillRect(bx + bw - Math.max(1, Math.floor(bw / 3)), byy, Math.max(1, Math.floor(bw / 3)), bh); c.fillStyle = lit ? '#fff0c0' : '#5a5660'; c.fillRect(bx, byy, Math.max(1, Math.floor(bw / 3)), Math.max(1, Math.floor(bh / 2))); }
      c.fillStyle = '#241b20'; c.fillRect(bx - 1, byy - 1, bw + 2, 1);
    }
    // reeds by the water
    for (const [x, y, hh, ph] of L.reeds) {
      const sway = still ? 0 : Math.round(Math.sin(t / 1100 + ph) * 2);
      const lean = Math.round(hh / 3);
      c.fillStyle = '#0f1526';
      c.fillRect(x, y - hh + 3, 1, hh - 3);
      c.fillRect(x - 2, y - lean - 1, 1, lean);
      if (hh > 8) c.fillRect(x + 2, y - lean, 1, lean);
      c.fillStyle = '#1d2438';
      c.fillRect(x + sway, y - hh, 1, 4);
      c.fillStyle = '#2a3048';
      c.fillRect(x + sway, y - hh, 1, 1);
    }
    // the desk lamp: paper panels glowing warm behind the frame, lighting the desk
    const lp = L.lamp;
    const fl = still ? 0.9 : 0.84 + 0.06 * Math.sin(t / 420) + 0.04 * Math.sin(t / 130);
    const r = Math.round(lp.h * 2.2);
    c.globalAlpha = fl;
    c.drawImage(glowSprite(r, '255,196,120'), Math.round(lp.x + lp.w / 2 - r), Math.round(lp.y + lp.h / 2 - r));
    c.globalAlpha = 1;
    const ix = lp.x + 2, iy = lp.y + 2, iw = lp.w - 4, ih = lp.h - 4;
    c.fillStyle = '#f4dfa8'; c.fillRect(ix, iy, iw, ih);
    c.fillStyle = '#fff2c8'; c.fillRect(ix, iy, Math.max(1, Math.round(iw * 0.45)), ih);
    c.fillStyle = '#d8b878'; c.fillRect(ix + iw - 1, iy, 1, ih);
    c.fillStyle = '#c99a50'; c.fillRect(ix, lp.y + Math.round(lp.h / 2), iw, 1); c.fillRect(ix + Math.round(iw / 2), iy, 1, ih);
  }

  // The backdrop draws at art resolution. When a caller that draws in
  // logical px (the prologue's shots) calls it through the ×2 transform, it
  // still draws the art-resolution scene into the whole buffer.
  function drawBackdrop(c, w, h, t) {
    const T = c.getTransform ? c.getTransform() : null;
    if (T && (T.a !== 1 || T.d !== 1 || T.e || T.f) && c.canvas) {
      c.save();
      c.setTransform(1, 0, 0, 1, 0, 0);
      drawScene(c, c.canvas.width, c.canvas.height, t);
      c.restore();
      return;
    }
    drawScene(c, w, h, t);
  }
  drawBackdrop.art = true;
  // The road as buildScene lays it out for a buffer of w × h art px, for a
  // figure walking it (the prologue's traveller): the horizon row, the road's
  // centre and half-width at a row, and how tall a lantern post standing at
  // that row is drawn (ground to cap), so a figure can be scaled against it.
  function roadGuide(w, h) {
    const P = h > w * 1.15 ? PLAN.tall : PLAN.wide, hz = Math.round(h * P.hz);
    return {
      hz, tall: P === PLAN.tall,
      at: (y) => { const [x, hw] = along(P.road, y / h); return [x * w, hw * w]; },
      post: (y) => { const d = (y - hz) / (h - hz), s = Math.max(2, Math.round(2 + d * (P === PLAN.tall ? 10 : 8))); return Math.round(6 + s * 3.2) + Math.round(s * 1.6) + 2; },
    };
  }

  // ---- title --------------------------------------------------------------------------
  function keysGuide() {
    const B = RB.input.getBinds();
    const k = (a, n) => (B[a] || []).slice(0, n || 1).map((c) => '<kbd>' + esc(RB.input.keyName(c)) + '</kbd>').join(' ');
    return k('up') + ' ' + k('down') + ' choose · ' + k('ok', 2) + ' confirm · ' + k('cancel') + ' back';
  }
  function storageBlock(info, id) {
    if (info.level === 'bad') {
      return '<div class="storage-banner st-bad" role="status">' + I('warn') + '<div><b>' + esc(info.short) + '</b><div>' + esc(info.detail) + '</div></div></div>';
    }
    return '<div class="storage-banner st-' + info.level + '"><div class="st-row"><span class="st-mark">' + I(info.level === 'ok' ? 'done' : 'warn') + '</span><span class="st-short">' + esc(info.short) + '</span>' +
      '<button class="st-more" data-a="storage" aria-expanded="false" aria-controls="' + id + '">Details' + I('chevdown') + '</button></div>' +
      '<div class="st-det" id="' + id + '" hidden>' + esc(info.detail) + '</div></div>';
  }
  function whenText(m) {
    return [m.name + (m.comp ? ' & ' + m.comp : ''), m.place, played(m.playtime)].filter(Boolean).join(' · ');
  }
  function newest(list) {
    const used = list.filter((s) => !s.empty && !s.corrupt);
    used.sort((x, y) => Math.max(y.meta.savedAt, y.auto ? y.auto.savedAt : 0) - Math.max(x.meta.savedAt, x.auto ? x.auto.savedAt : 0));
    return used[0] || null;
  }

  function show() {
    RB.render.setOverride(drawBackdrop);
    RB.audio && RB.audio.playSong('title');
    if (layer) RB.ui.popLayer(layer);
    const info = storageInfo();
    const box = RB.ui.el('div', 'title');
    box.setAttribute('aria-labelledby', 'title-h1');
    box.innerHTML =
      '<div class="title-in">' +
      '<header class="mast"><h1 id="title-h1"><span>The Road of</span> <span>Borrowed Names</span></h1>' +
      '<p class="mast-jp">' + RB.ui.jhtml('{借|か}りた {名|な} の {道|みち}') + '</p></header>' +
      '<div class="deck">' +
      (info.level === 'bad' ? storageBlock(info) : '') +
      '<div class="tmenu" role="group" aria-label="Title menu">' +
      '<button class="tm go hidden" data-a="continue">' + I('main') + '<span class="tl"><span class="lbl">Continue</span><span class="sub" data-cont></span></span></button>' +
      '<button class="tm" data-a="new">' + I('newpage') + '<span class="lbl">New Game</span></button>' +
      '<button class="tm" data-a="load">' + I('ledger') + '<span class="lbl">Load</span></button>' +
      '<button class="tm" data-a="settings">' + I('settings') + '<span class="lbl">Settings</span></button>' +
      '<button class="tm" data-a="about">' + I('info') + '<span class="lbl">About &amp; credits</span></button>' +
      '</div>' +
      '<div class="deck-foot">' + (info.level === 'bad' ? '' : storageBlock(info, 'st-det')) +
      '<p class="guide g-touch">Tap a choice. Tap Japanese words for their reading and meaning.</p>' +
      '<p class="guide g-keys">' + keysGuide() + '</p></div>' +
      '</div></div>';
    // The subtitle's words keep furigana and pointer/touch help, but are not
    // focus stops: when a layer above closes, focus returns to the first
    // focusable of the title, which must be an action, not a word whose help
    // card would open over the title. (Tab is bound to Menu and arrow keys
    // skip words, so the keyboard never reached them anyway.)
    box.querySelectorAll('.mast-jp .jt').forEach((t) => { t.tabIndex = -1; });
    const lay = { el: box, name: 'title', noAutofocus: true };
    layer = lay;
    let chosen = null;
    box.onclick = async (e) => {
      const b = e.target.closest('[data-a]');
      if (!b || !box.contains(b)) return;
      const a = b.getAttribute('data-a');
      if (a === 'storage') {
        const d = box.querySelector('#' + b.getAttribute('aria-controls'));
        const open = b.getAttribute('aria-expanded') !== 'true';
        b.setAttribute('aria-expanded', String(open));
        d.hidden = !open;
        RB.audio && RB.audio.sfx('cursor');
        return;
      }
      RB.audio && RB.audio.sfx('confirm');
      if (a === 'new') slots('new');
      if (a === 'load') slots('load');
      if (a === 'settings') RB.ui.settings.open();
      if (a === 'about') about();
      if (a === 'continue') {
        const list = await RB.save.list();
        const s = newest(list);
        if (!s) { RB.ui.notice('No saved campaign yet — start a New Game.', 'info'); return; }
        hide();
        const ok = await RB.game.loadCampaign(s.slot, s.autoNewer ? 'auto' : 'manual').catch((err) => { RB.ui.notice(err.message, 'bad'); return false; });
        if (!ok && !RB.game.G.playing) show();
      }
    };
    RB.ui.pushLayer(lay);
    // the stars keep out from behind the title's words: measured afresh now
    // and whenever the words change size (fonts settling, text size)
    scene.key = '';
    if (mastObs) mastObs.disconnect();
    mastObs = window.ResizeObserver ? new ResizeObserver(() => { scene.key = ''; }) : null;
    if (mastObs) mastObs.observe(box.querySelector('.mast'));
    // Initial focus goes to Continue (or New Game), never to the Japanese
    // subtitle, whose word help would open over the title.
    const settle = () => {
      if (layer !== lay) return;
      const cont = box.querySelector('[data-a=continue]');
      cont.classList.toggle('hidden', !chosen);
      if (chosen) {
        box.querySelector('[data-cont]').textContent = whenText(chosen.meta);
      }
      const act = document.activeElement;
      if (act && act !== document.body && box.contains(act)) return; // the player already moved
      if (RB.ui.topLayer() !== lay) return;
      (chosen ? cont : box.querySelector('[data-a=new]')).focus({ preventScroll: true });
    };
    RB.save.list().then((list) => { chosen = newest(list); settle(); }, () => settle());
  }
  function hide() {
    if (mastObs) { mastObs.disconnect(); mastObs = null; }
    if (layer) { RB.ui.popLayer(layer); layer = null; }
  }

  // ---- the travel ledger ------------------------------------------------------------------
  function fmtDate(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ', ' + d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  }
  function played(sec) {
    sec = Math.floor(sec || 0);
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60);
    return (h ? h + ' h ' : '') + m + ' min played';
  }
  const TITLES = { new: 'Start a new journey', load: 'Load a journey', save: 'Save this journey' };

  function record(s, ctx, cur, fromGame, latest) {
    const m = s.meta;
    const n = s.slot;
    const mg = [];
    const acts = [];
    const notes = [];
    const current = fromGame && cur.slot === n && !s.empty;
    let cls = 'slot rec' + (s.empty ? ' empty' : '') + (s.corrupt ? ' corrupt' : '') + (current ? ' current' : '');
    let thumb, head, body = '';
    if (s.empty) {
      thumb = '<div class="rec-ph">' + I('blank') + '</div>';
      head = '<h3><span class="sr">Slot ' + n + ': </span>Empty</h3>';
      body = '<p class="rec-meta">A blank page in the ledger.</p>';
    } else if (s.corrupt) {
      thumb = '<div class="rec-ph bad">' + I('torn') + '</div>';
      head = '<h3 class="bad"><span class="sr">Slot ' + n + ': </span>Unreadable save</h3>';
      body = '<p class="rec-meta">Left untouched' + (m && m.name ? ' (last known as ' + esc(m.name) + '’s campaign)' : '') + '.</p>' +
        (s.corruptWhy ? '<p class="rec-why">' + esc(s.corruptWhy) + '</p>' : '');
    } else {
      thumb = s.thumb ? '<img alt="" src="' + esc(s.thumb) + '">' : '<div class="rec-ph">' + I('map') + '</div>';
      head = '<h3><span class="sr">Slot ' + n + ': </span>' + esc(m.name) + (m.comp ? ' <span class="amp">&amp;</span> ' + esc(m.comp) : '') + '</h3>';
      body = '<p class="rec-place">' + (m.placeJp ? RB.ui.jhtml(m.placeJp) + ' ' : '') + '<span class="en">' + esc(m.place) + '</span></p>' +
        '<p class="rec-meta">' + esc(played(m.playtime)) + ' · ' + (s.manual ? 'saved ' + esc(fmtDate(m.savedAt)) : 'autosave only, ' + esc(fmtDate(s.auto && s.auto.savedAt))) + '</p>';
      if (s.autoNewer && s.manual) notes.push('<p class="rec-note">' + I('side') + ' Newer autosave: ' + esc(fmtDate(s.auto.savedAt)) + '</p>');
      if (current && cur.readOnly) notes.push('<p class="rec-note warn">' + I('warn') + ' Read-only in this tab: another tab owns this journey. Save to another slot instead.</p>');
    }
    const kind = '<p class="kind">Slot ' + n + (m && m.chapter && !s.empty && !s.corrupt ? ' · Chapter ' + m.chapter : '') + (m && m.post && !s.corrupt ? ' · after the story' : '') +
      (current ? ' <span class="here">' + I('here') + 'this journey</span>' : latest ? ' <span class="latest">\u00b7 most recent</span>' : '') + '</p>';

    if (ctx === 'new') {
      if (s.empty) acts.push('<button class="pbtn primary" data-a="start">' + I('travel') + 'Start here</button>');
      else mg.push('<button class="pbtn danger" data-a="start">Overwrite with a new game…</button>');
    } else if (ctx === 'save') {
      if (s.empty) acts.push('<button class="pbtn primary" data-a="save">' + I('save') + 'Save here</button>');
      else if (current && cur.readOnly) acts.push('<button class="pbtn" data-a="save" disabled>' + I('save') + 'Save (read-only in this tab)</button>');
      else if (current) acts.push('<button class="pbtn primary" data-a="save">' + I('save') + 'Save</button>');
      else mg.push('<button class="pbtn danger" data-a="save">Overwrite with this journey…</button>');
    } else if (ctx === 'load' && !s.empty && !s.corrupt) {
      if (s.manual) acts.push('<button class="pbtn primary" data-a="load">' + I('load') + 'Load</button>');
      if (s.auto && (!s.manual || s.autoNewer)) acts.push('<button class="pbtn' + (s.manual ? '' : ' primary') + '" data-a="loadauto">' + (s.manual ? 'Load newer autosave' : I('load') + 'Continue (autosave)') + '</button>');
      else if (s.auto) mg.push('<button class="pbtn" data-a="loadauto">' + I('side') + '<span>Load autosave <span class="when">' + esc(fmtDate(s.auto.savedAt)) + '</span></span></button>');
      if (s.pre) mg.push('<button class="pbtn" data-a="loadpre" title="Return to the room before choosing your companion">' + I('companion') + '<span>Before departure <span class="when">' + esc(fmtDate(s.pre.savedAt)) + '</span></span></button>');
    } else if (ctx === 'load' && s.corrupt) {
      // the manual record is unreadable, but its recovery points may still load
      if (s.auto) mg.push('<button class="pbtn" data-a="loadauto">' + I('side') + '<span>Try the latest autosave <span class="when">' + esc(fmtDate(s.auto.savedAt)) + '</span></span></button>');
      if (s.pre) mg.push('<button class="pbtn" data-a="loadpre">' + I('companion') + '<span>Try the pre-departure point <span class="when">' + esc(fmtDate(s.pre.savedAt)) + '</span></span></button>');
    }
    if (!s.empty && ctx !== 'new') {
      mg.push('<button class="pbtn" data-a="copy">' + I('copy') + 'Copy to another slot…</button>');
      mg.push('<button class="pbtn danger" data-a="delete">' + I('trash') + 'Delete…</button>');
    }
    const mid = 'mg-' + ctx + '-' + n;
    if (mg.length) acts.push('<button class="pbtn mg-t" data-a="manage" aria-expanded="false" aria-controls="' + mid + '">Manage' + I('chevdown') + '</button>');
    return '<li class="' + cls + '" data-slot="' + n + '">' +
      '<div class="rec-thumb"><span class="rec-no" aria-hidden="true">' + n + '</span>' + thumb + '</div>' +
      '<div class="rec-main">' + kind + head + body + notes.join('') + '</div>' +
      (acts.length ? '<div class="rec-acts">' + acts.join('') + '</div>' : '') +
      (mg.length ? '<div class="manage" id="' + mid + '" role="group" aria-label="Manage slot ' + n + '" hidden><p class="mg-h">Manage slot ' + n + '</p><div class="mg-b">' + mg.join('') + '</div>' +
        (ctx !== 'new' ? '<p class="mg-hint">Copy makes an independent duplicate. Delete also removes this slot’s autosaves.</p>' : '<p class="mg-hint">The journey saved here and its autosaves will be erased. You will be asked first.</p>') + '</div>' : '') +
      '</li>';
  }

  // ctx: 'new' | 'load' | 'save'; fromGame: opened from the pause folio
  async function slots(ctx, fromGame) {
    const ttl = TITLES[ctx] || TITLES.load;
    let lay = null;
    const opener = document.activeElement;
    const close = () => {
      if (!lay) return;
      if (mq) mq.onchange = null;
      // hand focus back to what opened the ledger before the layer goes
      if (opener && opener.focus && opener !== document.body && document.contains(opener)) opener.focus({ preventScroll: true });
      RB.ui.popLayer(lay);
      lay = null;
    };
    const fr = RB.ui.folio.frame({ onClose: close, closeLabel: 'Back', closeIcon: 'back', cls: 'folio-ledger' });
    fr.setTitle(esc(ttl), '');
    lay = { el: fr.scrim, name: 'slots', noAutofocus: true };
    lay.onCancel = close;
    let list = null, err = null, failed = false, first = true, focusAfter = null;
    const mq = typeof matchMedia !== 'undefined' ? matchMedia('(min-width: 860px)') : null;

    function render() {
      if (!lay) return;
      const two = RB.ui.folio.wide();
      const keep = Array.from(fr.box.querySelectorAll('.leaf')).map((l) => l.scrollTop);
      const act = document.activeElement;
      const fk = act && fr.box.contains(act) && act.closest('[data-slot]') ? { slot: act.closest('[data-slot]').getAttribute('data-slot'), a: act.getAttribute('data-a') } : null;
      const openMg = Array.from(fr.box.querySelectorAll('.mg-t[aria-expanded=true]')).map((b) => b.getAttribute('aria-controls'));
      const cur = RB.save.current();
      const info = storageInfo();
      const used = list ? list.filter((s) => !s.empty).length : 0;
      fr.setTitle(esc(ttl), list && !failed ? used + ' of 6 in use' : '');
      let top = '';
      if (info.level === 'bad') top += '<p class="note-slip bad">' + I('warn') + ' Storage is unavailable here, so saves only last until this page closes.</p>';
      if (cur.readOnly && ctx === 'save') top += '<p class="note-slip warn">' + I('warn') + ' This tab is read-only for this campaign because another tab owns it. Saving to other slots is still possible.</p>';
      if (err) top += '<div class="note-slip bad" role="alert">' + I('warn') + ' The ledger could not be read (' + esc(err) + ').' + (failed ? '' : ' Slots may show as empty.') + ' Nothing was changed. <button class="pbtn" data-a="retry">Try again</button></div>';
      if (ctx === 'new' && list && !failed && used === 6) top += '<p class="note-slip">All six slots hold journeys. To start a new one, open Manage on a slot and overwrite it.</p>';
      if (ctx === 'load' && list && !err && !list.some((s) => !s.empty && !s.corrupt)) top += '<p class="note-slip">No saved journeys yet. Choose New Game on the title to begin one.</p>';
      const last = ctx === 'load' && list ? newest(list) : null;
      const recs = (list || []).map((s) => record(s, ctx, cur, fromGame, last && last.slot === s.slot));
      const foot = '<p class="ledger-foot muted small">Six local slots in ' + (info.mode === 'session' ? 'this session only' : 'this browser') + '. Copy makes an independent duplicate in another slot; deleting a slot also removes its autosaves. There is no export or cloud copy.</p>';
      const ol = (a, b) => '<ol class="ledger" start="' + (a + 1) + '">' + recs.slice(a, b).join('') + '</ol>';
      if (!list) {
        fr.box.innerHTML = '<div class="spread"><div class="leaf" tabindex="-1">' + top + '<p class="muted">Opening the ledger…</p></div></div>';
        return;
      }
      fr.box.innerHTML = two
        ? '<div class="spread two"><div class="leaf" tabindex="-1" aria-label="Slots 1 to 3">' + top + ol(0, 3) + '</div><div class="leaf" tabindex="-1" aria-label="Slots 4 to 6">' + ol(3, 6) + foot + '</div></div>'
        : '<div class="spread"><div class="leaf" tabindex="-1">' + top + ol(0, 6) + foot + '</div></div>';
      for (const id of openMg) {
        const b = fr.box.querySelector('[aria-controls="' + id + '"]');
        if (b) toggle(b, true);
      }
      const leaves = fr.box.querySelectorAll('.leaf');
      if (leaves.length === keep.length) leaves.forEach((l, i) => { l.scrollTop = keep[i]; });
      if (fk) { const t = fr.box.querySelector('.rec[data-slot="' + fk.slot + '"] [data-a="' + fk.a + '"]'); if (t) t.focus({ preventScroll: true }); }
    }
    function toggle(b, open) {
      const d = fr.box.querySelector('#' + b.getAttribute('aria-controls'));
      if (!d) return;
      b.setAttribute('aria-expanded', String(open));
      d.hidden = !open;
      b.closest('.rec').classList.toggle('managing', open);
    }
    function initialFocus() {
      const q = (sel) => fr.box.querySelector(sel);
      let t = null;
      if (focusAfter) {
        const r = q('.rec[data-slot="' + focusAfter.slot + '"]');
        t = r && (r.querySelector('[data-a="' + focusAfter.a + '"]') || r.querySelector('.rec-acts button'));
        focusAfter = null;
      } else if (ctx === 'load') {
        t = q('.rec-acts .primary');
      } else if (ctx === 'save') {
        const cur = RB.save.current();
        t = (fromGame && cur.slot && q('.rec[data-slot="' + cur.slot + '"] [data-a=save].primary')) || q('.rec.empty [data-a=save]');
      } else t = q('.rec.empty [data-a=start]');
      t = t || q('.rec-acts button:not([disabled])') || q('[data-a=retry]') || fr.el.querySelector('[data-folio-close]');
      // a warning at the top of the page stays in view; otherwise bring the target into view
      if (t) t.focus({ preventScroll: !!q('.leaf > .note-slip.bad, .leaf > .note-slip.warn') });
    }
    async function refresh() {
      const before = RB.save.status().lastError;
      try {
        list = await RB.save.list();
        const after = RB.save.status().lastError;
        // list() reports a failed read by setting lastError (and, if the save
        // module provides it, list.readError) while returning empty slots
        err = list.readError || (after && after !== before ? after : null);
        failed = false;
      } catch (e) {
        list = list || [];
        err = String((e && e.message) || e);
        failed = true;
      }
      render();
      if (first || focusAfter) { first = false; initialFocus(); }
    }

    fr.box.onclick = async (e) => {
      const b = e.target.closest('[data-a]');
      if (!b || !lay) return;
      const a = b.getAttribute('data-a');
      if (a === 'retry') { await refresh(); return; }
      if (a === 'manage') { toggle(b, b.getAttribute('aria-expanded') !== 'true'); RB.audio && RB.audio.sfx('cursor'); return; }
      const slot = +b.closest('[data-slot]').getAttribute('data-slot');
      const s = list[slot - 1];
      try {
        if (a === 'start') {
          if (!s.empty) {
            const r = await RB.ui.confirm('Slot ' + slot + ' holds ' + (s.meta ? s.meta.name + "'s campaign" : 'a campaign') + '. Starting a new game here will erase it and its autosaves.', ['Erase and start', 'Cancel'], { danger: true });
            if (r !== 0) return;
            await RB.save.del(slot);
          }
          close();
          hide();
          RB.ui.create.begin(slot);
        } else if (a === 'save') {
          const cur = RB.save.current().slot;
          if (!s.empty && slot !== cur) {
            const r = await RB.ui.confirm('Overwrite slot ' + slot + ' (' + (s.meta ? s.meta.name : '') + ')? That campaign will be replaced by this one.', ['Overwrite', 'Cancel'], { danger: true });
            if (r !== 0) return;
          }
          try {
            await RB.save.manualSave(slot);
          } catch (err2) {
            if (err2 instanceof RB.save.ConflictError) {
              const r = await RB.ui.confirm('This slot was saved from another tab since you loaded it. Overwrite that newer save with this game?', ['Overwrite anyway', 'Cancel'], { danger: true });
              if (r !== 0) return;
              await RB.save.writeSlot(slot, RB.game.s, { force: true, thumb: RB.render.thumbnail() });
            } else throw err2;
          }
          RB.audio && RB.audio.sfx('save');
          const session = RB.save.status().mode === 'session';
          RB.ui.notice(session ? 'Saved for this session only — storage is unavailable, so it will be lost when the page closes.' : 'Saved to slot ' + slot + '.', session ? 'warn' : 'info');
          focusAfter = { slot, a: 'save' };
          await refresh();
        } else if (a === 'load' || a === 'loadauto' || a === 'loadpre') {
          if (fromGame) {
            const r = await RB.ui.confirm('Load slot ' + slot + '? Unsaved progress in the current game will be lost (your latest autosave remains).', ['Load', 'Cancel']);
            if (r !== 0) return;
          }
          close();
          if (fromGame) {
            RB.ui.menu.closeAll && RB.ui.menu.closeAll();
            // the pause folio's Save & Load sheet belongs to the game being left
            for (let top = RB.ui.topLayer(); top && top.name === 'savesheet'; top = RB.ui.topLayer()) RB.ui.popLayer(top);
          }
          hide();
          const ok = await RB.game.loadCampaign(slot, a === 'loadauto' ? 'auto' : a === 'loadpre' ? 'predeparture' : 'manual');
          if (!ok && !RB.game.G.playing && !layer) show();
        } else if (a === 'copy') {
          const target = await pickSlot(list, slot);
          if (!target) return;
          if (!list[target - 1].empty) {
            const r = await RB.ui.confirm('Slot ' + target + ' is in use. Replace it with a copy of slot ' + slot + '?', ['Replace', 'Cancel'], { danger: true });
            if (r !== 0) return;
          }
          await RB.save.copy(slot, target);
          RB.ui.notice('Copied slot ' + slot + ' to slot ' + target + '. The two campaigns are now independent.', 'info');
          focusAfter = { slot: target, a: 'manage' };
          await refresh();
        } else if (a === 'delete') {
          const r = await RB.ui.confirm('Delete slot ' + slot + '? Its manual save and autosaves will be removed. This cannot be undone.', ['Delete', 'Cancel'], { danger: true });
          if (r !== 0) return;
          await RB.save.del(slot);
          RB.ui.notice('Slot ' + slot + ' deleted.', 'info');
          focusAfter = { slot, a: 'start' };
          await refresh();
        }
      } catch (e2) {
        RB.ui.notice(e2.message || String(e2), 'bad');
        if (!RB.game.G.playing && !layer) show();
      }
    };
    RB.ui.pushLayer(lay);
    if (mq) mq.onchange = () => render();
    render();
    await refresh();
  }
  async function pickSlot(list, except) {
    const btns = list.filter((s) => s.slot !== except).map((s) => 'Slot ' + s.slot + (s.empty ? ' (empty)' : ' (' + (s.meta ? s.meta.name : 'used') + ')'));
    btns.push('Cancel');
    const r = await RB.ui.confirm('Copy slot ' + except + ' to which slot?', btns);
    if (r === btns.length - 1) return null;
    return list.filter((s) => s.slot !== except)[r].slot;
  }

  // ---- about & credits ------------------------------------------------------------------
  function about() {
    let lay = null;
    const opener = document.activeElement;
    const close = () => {
      if (!lay) return;
      if (opener && opener.focus && opener !== document.body && document.contains(opener)) opener.focus({ preventScroll: true });
      RB.ui.popLayer(lay);
      lay = null;
    };
    const fr = RB.ui.folio.frame({ onClose: close, closeLabel: 'Back', closeIcon: 'back', cls: 'folio-sheet folio-about' });
    fr.setTitle('About &amp; credits', '');
    fr.box.innerHTML = '<div class="spread"><div class="leaf" tabindex="0" aria-label="About">' +
      '<p>An original Japanese-learning adventure. Story, art, music and code are procedural and self-contained in this one file; nothing is downloaded while you play.</p>' +
      '<p>The world, its lantern roads and its magic are fiction. The Japanese is ordinary Japanese; where the story invents a term it is labelled as fictional in the notebook.</p>' +
      '<p>Voices, when present, come from speech synthesis already installed on your device. They are not recorded performances, and they are not a pronunciation reference.</p>' +
      '<h3>' + I('book') + ' Third-party data</h3><pre class="notice-text">' + esc(RB.NOTICE || 'See the notice comment at the top of this file.') + '</pre></div></div>';
    lay = { el: fr.scrim, name: 'about' };
    lay.onCancel = close;
    // arrow keys (or W/S) scroll the page: they are game actions, not native scrolling
    const leaf = fr.box.querySelector('.leaf');
    lay.onAction = (a) => {
      if (a !== 'up' && a !== 'down') return false;
      leaf.scrollBy({ top: (a === 'down' ? 1 : -1) * leaf.clientHeight * 0.4, behavior: RB.game.reducedMotion() ? 'auto' : 'smooth' });
      return true;
    };
    RB.ui.pushLayer(lay);
  }

  // for the browser tests: what the sky is doing, and a way to hurry it along
  const sky = () => ({ layout: scene.L ? (scene.L.tall ? 'tall' : 'wide') + (scene.L.side ? '/' + scene.L.side : '/centred') : null, noren: !!(scene.L && scene.L.norenBottom), door: scene.L ? (scene.L.post + scene.L.shoji) / scene.L.w : 0, moon: scene.L && scene.L.moon ? [scene.L.moon[0] / scene.L.w, scene.L.moon[1] / scene.L.h, scene.L.moon[2] / scene.L.w] : null, stars: scene.L ? scene.L.stars.length : 0, meteor: !!(scene.fx && scene.fx.m), comet: !!(scene.fx && scene.fx.cm), live: !!scene.fx });
  sky.soon = () => { if (scene.fx) { scene.fx.next = 0; scene.fx.nextComet = 0; } };
  return { show, hide, slots, drawBackdrop, roadGuide, sky };
})();
