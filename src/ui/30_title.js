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
  let layer = null;

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
  function glowSprite(r, rgb) {
    const k = r + rgb;
    if (glows[k]) return glows[k];
    const cv = canvas(r * 2 + 1, r * 2 + 1);
    const g = cv.getContext('2d');
    const gr = g.createRadialGradient(r + 0.5, r + 0.5, 0, r + 0.5, r + 0.5, r);
    gr.addColorStop(0, 'rgba(' + rgb + ',0.55)');
    gr.addColorStop(0.35, 'rgba(' + rgb + ',0.2)');
    gr.addColorStop(1, 'rgba(' + rgb + ',0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, r * 2 + 1, r * 2 + 1);
    return (glows[k] = cv);
  }

  function buildScene(w, h) {
    const P = h > w * 1.15 ? PLAN.tall : PLAN.wide;
    const L = { w, h, tall: P === PLAN.tall, lamps: [], reeds: [], stars: [], water: [] };
    const cv = canvas(w, h);
    const c = cv.getContext('2d');
    const R = (x, y, ww, hh, col) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.max(0, Math.round(ww)), Math.max(0, Math.round(hh))); };
    const rnd = RB.util.rng(1187);
    const hz = Math.round(h * P.hz);
    L.hz = hz;
    const river = (y) => { const [x, hw] = along(P.river, y / h); return [Math.round(x * w - hw * w), Math.round(x * w + hw * w)]; };
    const road = (y) => { const [x, hw] = along(P.road, y / h); return [Math.round(x * w - hw * w - 0.5), Math.round(x * w + hw * w + 0.5)]; };
    L.river = river;

    // sky: dusk colours with an ordered (Bayer) dither between steps, darkest
    // at the top where the title reads
    const bands = [[11, 15, 34], [15, 20, 41], [19, 26, 51], [24, 32, 63], [31, 39, 73], [41, 46, 85], [55, 51, 88], [74, 60, 92]];
    const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
    const sky = c.createImageData(w, hz);
    for (let y = 0; y < hz; y++) {
      const f = (y / Math.max(1, hz - 1)) * (bands.length - 1);
      const i = Math.min(bands.length - 2, Math.floor(f)), fr = f - i;
      for (let x = 0; x < w; x++) {
        const col = fr * 16 > BAYER[(y & 3) * 4 + (x & 3)] + 0.5 ? bands[i + 1] : bands[i];
        const o = (y * w + x) * 4;
        sky.data[o] = col[0]; sky.data[o + 1] = col[1]; sky.data[o + 2] = col[2]; sky.data[o + 3] = 255;
      }
    }
    c.putImageData(sky, 0, 0);
    for (let i = 0; i < 26; i++) L.stars.push([Math.round(rnd() * w), Math.round(rnd() * hz * 0.72), rnd() * 6.28, rnd() < 0.25]);
    // a pale crescent moon with a faint halo
    const mx = Math.round(P.moon[0] * w), my = Math.round(P.moon[1] * h), mr = Math.max(3, Math.round(Math.min(w, h) * 0.018));
    c.drawImage(glowSprite(mr * 5, '200,210,240'), mx - mr * 5, my - mr * 5);
    for (let y = -mr; y <= mr; y++) for (let x = -mr; x <= mr; x++) {
      if (x * x + y * y > mr * mr + mr * 0.6) continue;
      const cut = (x + mr * 0.55) * (x + mr * 0.55) + (y - mr * 0.3) * (y - mr * 0.3) <= mr * mr * 0.85;
      if (!cut) R(mx + x, my + y, 1, 1, x > mr * 0.2 ? '#d9d2b8' : '#efe6c8');
    }
    // mountains, far and near
    const ridge = (base, amp, f1, f2, ph, col) => {
      for (let x = 0; x < w; x++) {
        const v = Math.sin(x / (w * f1) + ph) * 0.6 + Math.sin(x / (w * f2) + ph * 2.3) * 0.4;
        const top = Math.round(base - amp * (0.55 + v * 0.45));
        R(x, top, 1, hz - top + 1, col);
      }
    };
    ridge(hz, h * (L.tall ? 0.1 : 0.17), 0.13, 0.05, 2.6, '#2a2c52');
    ridge(hz, h * (L.tall ? 0.075 : 0.13), 0.09, 0.035, 1.3, '#1a2044');
    ridge(hz, h * (L.tall ? 0.035 : 0.06), 0.06, 0.021, 4.1, '#141a36');
    R(0, hz - 1, w, 1, '#262c52');
    // ground below the horizon
    R(0, hz, w, h - hz, '#141b2c');
    for (let y = hz + 1; y < h; y++) {
      const d = (y - hz) / (h - hz);
      if (rnd() < 0.5) continue;
      for (let n = 0; n < 2 + d * 6; n++) R(rnd() * w, y, 1 + (d > 0.5 ? 1 : 0), 1, d > 0.4 ? '#19223a' : '#171f33');
    }
    // far villages with lit windows (a few houses, not a city)
    for (const [a, b] of P.far) {
      const x0 = Math.round(a * w), x1 = Math.round(b * w);
      for (let x = x0; x < x1 - 4; x += 5 + Math.floor(rnd() * 4)) {
        const hw = 3 + Math.floor(rnd() * 3), hh = 2 + Math.floor(rnd() * 2), y = hz + 1 + Math.floor(rnd() * 3);
        const [rl, rr] = river(y);
        if (x + hw >= rl - 1 && x <= rr + 1) continue;
        R(x, y - hh, hw, hh + 1, '#0e1322');
        R(x - 1, y - hh - 1, hw + 2, 1, '#0b0f1c');
        if (rnd() < 0.7) R(x + 1 + Math.floor(rnd() * (hw - 2)), y - hh + 1, 1, 1, rnd() < 0.6 ? '#e8b860' : '#9a7446');
      }
    }
    // the river: widening toward the viewer, sky-lit far away, deep near
    const by = Math.round(h * P.by);
    for (let y = hz; y < h; y++) {
      const [x0, x1] = river(y);
      const d = (y - hz) / (h - hz);
      const wob = (Math.sin(y * 1.7) > 0.6 ? 1 : 0);
      R(x0 + wob, y, x1 - x0 - wob, 1, d < 0.08 ? '#3a4470' : d < 0.25 ? '#26335c' : '#1a2748');
      R(x0 + wob - 1, y, 1, 1, '#0c1222');
      R(x1, y, 1, 1, '#2b3a62');
      if (y > hz + 2 && rnd() < 0.5) L.water.push([x0 + 2 + rnd() * Math.max(1, x1 - x0 - 6), y, 1 + Math.round(d * 4), rnd() * 6.28]);
    }
    // the road on the near bank, and the short path to the bridge
    const [bl0, br0] = river(by);
    const bpad = Math.max(3, Math.round((br0 - bl0) * 0.18));
    const bL = bl0 - bpad, bR = br0 + bpad;
    for (let y = hz + 1; y < h; y++) {
      const [x0, x1] = road(y);
      const d = (y - hz) / (h - hz);
      R(x0, y, x1 - x0, 1, d < 0.2 ? '#2c2a3a' : '#3a3342');
      R(x0, y, 1, 1, '#221e2c'); R(x1 - 1, y, 1, 1, '#221e2c');
      if (d > 0.3 && rnd() < 0.35) R(x0 + 1 + rnd() * Math.max(1, x1 - x0 - 3), y, 1, 1, '#4a4152');
      if (d > 0.12 && x1 - x0 > 8) { const cxr = (x0 + x1) / 2, off = (x1 - x0) * 0.22; R(cxr - off, y, 1, 1, '#302a38'); R(cxr + off, y, 1, 1, '#302a38'); }
    }
    // grass tufts on the banks, denser toward the viewer
    for (let n = 0; n < w * 0.9; n++) {
      const y = Math.round(hz + 3 + Math.pow(rnd(), 0.7) * (h - hz - 6)), x = Math.round(rnd() * w);
      const [ra, rb] = road(y), [wa, wb] = river(y);
      if ((x >= ra - 1 && x <= rb) || (x >= wa - 1 && x <= wb + 1)) continue;
      const d = (y - hz) / (h - hz);
      R(x, y, 1, 1, '#1d2740'); if (d > 0.35) { R(x - 1, y - 1, 1, 1, '#1a2238'); R(x + 1, y - 1, 1, 1, '#1a2238'); }
    }
    // a few black pines on the near bank, silhouetted against the fields
    const pine = (px, base, size) => {
      const tw = Math.max(1, Math.round(size / 11));
      const bend = (k) => Math.round(Math.sin(k * 2.4) * size * 0.09);
      for (let y = 0; y < size * 0.9; y++) R(px + bend(y / size), base - y, tw, 1, '#0d111e');
      // cloud pads, alternately to each side, smaller toward the top, moonlit on top
      for (const [hy, wf, side] of [[0.46, 0.95, -1], [0.7, 0.72, 1], [0.9, 0.48, -1], [1.02, 0.26, 0]]) {
        const hw = Math.max(2, Math.round(size * wf * 0.48)), th = Math.max(2, Math.round(size * 0.16));
        const cy = base - Math.round(size * hy), cx = px + bend(hy) + side * Math.round(hw * 0.35);
        for (let k = 0; k < th; k++) {
          const ww = Math.round(hw * (0.55 + 0.45 * Math.sqrt(k / Math.max(1, th - 1))));
          R(cx - ww + Math.round((rnd() - 0.5) * 2), cy - th + k, ww * 2 + 1, 1, '#0d111e');
        }
        R(cx - Math.round(hw * 0.5), cy - th, Math.max(1, hw), 1, '#1c2440');
      }
    };
    for (const [fx0, fy0, fs] of (L.tall ? [[0.09, 0.345, 0.05], [0.2, 0.33, 0.03]] : [[0.08, 0.6, 0.12], [0.2, 0.555, 0.07], [0.29, 0.52, 0.045]])) pine(Math.round(fx0 * w), Math.round(fy0 * h), Math.max(6, Math.round(fs * h)));
    const [, rr] = road(by);
    for (let y = by - 1; y <= by + 1; y++) R(rr - 1, y, bL - rr + 2, 1, '#322d3c');
    // the arched bridge, side on, with its reflection
    const ah = Math.max(4, Math.round((bR - bL) * 0.2));
    const top = (x) => by - Math.round(ah * Math.sin(Math.PI * (x - bL) / (bR - bL)));
    for (let x = bL; x <= bR; x++) {
      const t0 = top(x), refl = Math.round((by - t0) * 0.7) + 2;
      const [wl, wr] = river(by + 2);
      if (x > wl && x < wr) { c.fillStyle = 'rgba(6,9,20,0.45)'; c.fillRect(x, by + 2, 1, refl); }
      R(x, t0, 1, 3, '#4d3322');
      R(x, t0, 1, 1, '#8a5a36');
      R(x, t0 - 3, 1, 1, '#3a2619');
      if ((x - bL) % 4 === 0) R(x, t0 - 3, 1, 3, '#3a2619');
    }
    for (const u of [0.22, 0.5, 0.78]) { const x = Math.round(bL + (bR - bL) * u); R(x, top(x) + 3, 1, by + 2 - top(x) - 2, '#2e1f16'); }
    for (const x of [bL, bR]) { R(x, top(x) - 5, 1, 5, '#3a2619'); R(x - 1, top(x) - 6, 3, 1, '#7a5234'); }
    const cx = Math.round((bL + bR) / 2);
    L.lamps.push({ x: cx, y: top(cx) - 6, s: 1, bridge: true });
    R(cx, top(cx) - 5, 1, 3, '#2a1d15');
    // lantern posts along the road, alternating sides, growing with nearness
    P.lamps.forEach((f, i) => {
      const y = Math.round(hz + 2 + f * (h - hz));
      const [x0, x1] = road(y);
      const d = (y - hz) / (h - hz);
      const s = Math.max(1, Math.round(1 + d * (L.tall ? 5 : 4)));
      const x = i % 2 ? x1 + s + 1 : x0 - s - 2;
      const pole = Math.round(3 + s * 3.2);
      R(x, y - pole, Math.max(1, Math.round(s / 2)), pole, '#1a1418');
      R(x - s, y - pole - Math.round(s * 1.6) - 1, s * 2 + Math.max(1, Math.round(s / 2)), 1, '#241b20');
      L.lamps.push({ x: x + Math.floor(s / 4), y: y - pole - Math.round(s * 0.8), s, out: i === 2 });
      if (i !== 2) {
        const rx = Math.max(4, s * 7), ry = Math.max(2, Math.round(s * 2.2));
        const gr = c.createRadialGradient(x, y, 0, x, y, rx);
        gr.addColorStop(0, 'rgba(255,190,110,0.16)'); gr.addColorStop(1, 'rgba(255,190,110,0)');
        c.save(); c.fillStyle = gr; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.fill(); c.restore();
      }
    });
    // reeds on the near bank of the river (drawn live so they can sway)
    for (let y = by + 5; y < h - 2; y += 2 + Math.floor(rnd() * 3)) {
      const [x0] = river(y);
      const d = (y - hz) / (h - hz);
      if (rnd() < 0.5) L.reeds.push([x0 - 1 - Math.floor(rnd() * 3 * d), y, Math.round(2 + d * 8 * (0.6 + rnd() * 0.6)), rnd() * 6.28]);
    }
    // the inn: the floor boards inside, the sill, door posts and the lintel
    // (with a rolled bamboo blind when there is room above the title)
    const floorY = Math.round(h * (L.tall ? 0.935 : 0.9));
    L.floorY = floorY;
    R(0, floorY, w, h - floorY, '#24170f');
    for (let y = floorY + 3; y < h; y += 4) R(0, y, w, 1, '#1b110b');
    for (let y = floorY + 3, k = 0; y < h; y += 4, k++) for (let x = (k * 13) % 23; x < w; x += 23 + (k % 3) * 6) R(x, y - 3, 1, 3, '#1b110b');
    R(0, floorY, w, 2, '#3b2819'); R(0, floorY, w, 1, '#5a3f2a');
    const post = Math.max(4, Math.round(w * (L.tall ? 0.032 : 0.026)));
    const lint = Math.max(2, Math.round(h * (L.tall ? 0.012 : 0.032)));
    L.post = post;
    for (const x0 of [0, w - post]) {
      R(x0, 0, post, h, '#1c140f');
      for (let y = 6; y < h; y += 9) R(x0 + 1 + (y % 3), y, 1, 4, '#24190f');
    }
    R(post - 1, lint, 1, h - lint, '#3f2d1f'); R(w - post, lint, 1, h - lint, '#2c2017');
    R(0, 0, w, lint, '#1a120d'); R(0, lint - 1, w, 1, '#3a2a1e');
    if (!L.tall) {
      const bl = Math.max(3, Math.round(h * 0.022));
      R(post, lint, w - 2 * post, bl, '#5c4a2c');
      for (let x = post; x < w - post; x += 2) R(x, lint, 1, bl, '#4a3b22');
      R(post, lint + bl - 1, w - 2 * post, 1, '#3a2e1a'); R(post, lint, w - 2 * post, 1, '#76603a');
      for (const u of [0.18, 0.5, 0.82]) { const x = Math.round(post + (w - 2 * post) * u); R(x, lint, 1, bl + 2, '#c9b58a'); }
    }
    // the writing desk (low, on short legs) with the folio, inkstone, brush and lamp
    const dx1 = Math.round(P.desk[2] * w), dy = Math.round(P.desk[1] * h);
    const dt = Math.max(2, Math.round(h * 0.014));
    const ap = Math.max(2, Math.round(h * 0.012));
    R(0, dy + dt + ap, dx1, h - dy - dt - ap, 'rgba(8,5,3,0.45)');           // shadow under the desk
    R(0, dy, dx1, dt, '#6e4428'); R(0, dy, dx1, 1, '#a06c42'); R(dx1 - 1, dy, 1, dt, '#8a5a36');
    for (let x = 4; x < dx1 - 2; x += 7) R(x, dy + 1 + (x % 3 ? 1 : 0), 3, 1, '#7a4c2e');
    R(0, dy + dt, dx1, ap, '#3a2418'); R(0, dy + dt, dx1, 1, '#24160e');
    const leg = Math.max(2, Math.round(w * 0.008));
    for (const x of [post + 2, dx1 - leg - 3]) { R(x, dy + dt + ap, leg, h - dy - dt - ap - 1, '#3a2418'); R(x, dy + dt + ap, 1, h - dy - dt - ap - 1, '#4e321f'); }
    const fw = Math.max(18, Math.min(40, Math.round(Math.min(w, h * 1.4) * 0.085)));
    const fh = Math.max(11, Math.round(fw * 0.62));
    const fx = Math.max(post + 12, Math.round(dx1 * 0.42)), fy = dy - fh + Math.round(dt / 2) + 1;
    R(fx + 1, fy + fh, fw, 1, '#1a100a');                                // shadow
    R(fx + 2, fy + 1, fw - 1, fh, '#e7dbbd');                            // page edges
    R(fx + 2, fy + fh - 1, fw - 1, 1, '#c9b98f');
    R(fx, fy, fw, fh - 1, '#27305c');                                    // cloth cover
    for (let y = fy + 1; y < fy + fh - 1; y++) for (let x = fx + 3 + (y & 1); x < fx + fw - 1; x += 2) if (((x + y) % 4) === 0) R(x, y, 1, 1, '#2e386a');
    R(fx, fy, 2, fh - 1, '#1c2346');                                     // spine
    for (let y = fy + 2; y < fy + fh - 2; y += 3) R(fx + 1, y, 1, 1, '#b9a57a'); // binding thread
    const sw = Math.max(3, Math.round(fw * 0.16)), sh = Math.max(5, Math.round(fh * 0.55));
    R(fx + 4, fy + 2, sw, sh, '#f2e9d3');                                // title slip
    R(fx + 4 + Math.floor(sw / 2), fy + 3, 1, sh - 3, '#4c4030');
    const rbx = fx + Math.round(fw * 0.66), rbl = Math.max(3, Math.round(fh * 0.45));
    R(rbx, fy + fh - 1, 2, rbl, '#c18a2a');                              // ribbon
    R(rbx + 1, fy + fh - 1, 1, rbl, '#8a5d14');
    R(rbx, fy + fh - 1 + rbl, 1, 1, '#c18a2a');
    const ix = fx + fw + 4;
    if (ix + 12 < dx1) {
      R(ix, dy - 2, 7, 3, '#15131a'); R(ix + 1, dy - 2, 5, 1, '#2c2833');   // inkstone
      R(ix + 1, dy - 4, 9, 1, '#8a5a36'); R(ix + 9, dy - 4, 2, 1, '#1a1418'); // brush
    }
    const lx = post + 3, lh = Math.max(7, Math.round(fh * 0.9)), lw = Math.max(5, Math.round(lh * 0.6));
    R(lx - 1, dy - 1, lw + 2, 1, '#2a1a10');
    R(lx, dy - lh, lw, lh, '#3a2418');
    R(lx - 1, dy - lh - 1, lw + 2, 1, '#2a1a10');                          // cap
    R(lx, dy - 1, 1, 1, '#2a1a10'); R(lx + lw - 1, dy - 1, 1, 1, '#2a1a10'); // feet
    L.lamp = { x: lx, y: dy - lh, w: lw, h: lh };
    // moving details stay inside the door frame and above the floor
    L.water = L.water.filter(([x, y, len]) => x > post && x + len < w - post && y < floorY - 1);
    L.reeds = L.reeds.filter(([x, y]) => x > post && x < w - post && y < floorY - 1);
    const skyTop = lint + (L.tall ? 1 : Math.max(3, Math.round(h * 0.022)) + 2);
    const inMast = (x, y) => (L.tall ? x > w * 0.08 && x < w * 0.92 && y < h * 0.25 : x < w * 0.5 && y < h * 0.42);
    L.stars = L.stars.filter(([x, y]) => x > post + 1 && x < w - post - 2 && y > skyTop && !inMast(x, y));
    scene.key = w + 'x' + h;
    scene.cv = cv;
    scene.L = L;
  }

  function drawBackdrop(c, w, h, t) {
    if (scene.key !== w + 'x' + h) buildScene(w, h);
    const L = scene.L;
    const still = RB.game.reducedMotion();
    c.drawImage(scene.cv, 0, 0);
    // stars: a few, softly twinkling
    for (const [x, y, ph, big] of L.stars) {
      const a = still ? 0.55 : 0.35 + 0.35 * (Math.sin(t / 900 + ph) + 1) / 2;
      c.fillStyle = 'rgba(240,236,214,' + a.toFixed(2) + ')';
      c.fillRect(x, y, 1, 1);
      if (big) { c.fillStyle = 'rgba(240,236,214,' + (a * 0.35).toFixed(2) + ')'; c.fillRect(x - 1, y, 3, 1); c.fillRect(x, y - 1, 1, 3); }
    }
    // water: slow drifting glints and the bridge lantern's reflection
    for (const [x, y, len, ph] of L.water) {
      const k = still ? 0.5 : (Math.sin(t / 1400 + ph) + 1) / 2;
      if (k < 0.55) continue;
      const dx = still ? 0 : Math.round(Math.sin(t / 2600 + ph) * 2);
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
        const r = Math.round(4 + s * 4);
        c.globalAlpha = fl;
        c.drawImage(glowSprite(r, '255,200,110'), p.x - r, p.y - r);
        c.globalAlpha = 1;
        if (p.bridge) {
          const [wl, wr] = L.river(p.y + 12);
          if (p.x > wl && p.x < wr) for (let k = 0; k < 4; k++) { c.fillStyle = 'rgba(255,200,110,' + (0.35 - k * 0.07).toFixed(2) + ')'; c.fillRect(p.x - (k % 2), p.y + 14 + k * 3, 2, 1); }
        }
      }
      c.fillStyle = lit ? '#ffd27a' : '#4a4650';
      c.fillRect(p.x - Math.floor(s / 2), p.y - Math.floor(s * 0.7), Math.max(1, s), Math.max(1, Math.round(s * 1.3)));
    }
    // reeds by the water
    for (const [x, y, hh, ph] of L.reeds) {
      const sway = still ? 0 : Math.round(Math.sin(t / 1100 + ph) * 1.2);
      const lean = Math.round(hh / 3);
      c.fillStyle = '#0f1526';
      c.fillRect(x, y - hh + 2, 1, hh - 2);
      c.fillRect(x - 1, y - lean - 1, 1, lean);
      if (hh > 5) c.fillRect(x + 1, y - lean, 1, lean);
      c.fillStyle = '#1d2438';
      c.fillRect(x + sway, y - hh, 1, 2);
    }
    // the desk lamp: paper glowing warm, lighting the desk
    const lp = L.lamp;
    const fl = still ? 0.9 : 0.84 + 0.06 * Math.sin(t / 420) + 0.04 * Math.sin(t / 130);
    const r = Math.round(lp.h * 2.6);
    c.globalAlpha = fl;
    c.drawImage(glowSprite(r, '255,196,120'), Math.round(lp.x + lp.w / 2 - r), Math.round(lp.y + lp.h / 2 - r));
    c.globalAlpha = 1;
    c.fillStyle = '#f4dfa8';
    c.fillRect(lp.x + 1, lp.y + 1, lp.w - 2, lp.h - 2);
    c.fillStyle = '#c99a50';
    c.fillRect(lp.x + 1, lp.y + Math.round(lp.h / 2), lp.w - 2, 1);
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

  return { show, hide, slots, drawBackdrop };
})();
