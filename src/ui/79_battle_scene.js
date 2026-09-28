/* Battle scenery at art resolution: one calm, layered backdrop per region
 * key (sky or back wall, distant shapes, a horizon, ground texture in
 * clusters), built once per (key, size, horizon) and cached; a few slow
 * ambient particles drawn per frame (none with reduced motion); and the
 * small marks the arena needs — knots, wards, shadows and effects — as
 * pixel shapes. The area around the creature is kept quiet on purpose: the
 * detail sits low on the horizon and toward the edges. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.battleScene = (function () {
  'use strict';
  const K = RB.pxkit;
  const cache = new Map();

  // ---- drawing helpers (straight onto a 2D context, whole pixels) ------------------------
  const R = (c, x, y, w, h, col) => { if (col) c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.max(0, Math.round(w)), Math.max(0, Math.round(h))); };
  function skyBands(c, w, y0, y1, cols, seam) {
    if (y1 <= y0) return;
    const img = c.createImageData(w, y1 - y0);
    K.bands(img, w, 0, y1 - y0, cols, seam);
    c.putImageData(img, 0, y0);
  }
  // A ridge line from summed sines (deterministic per seed); the slopes that
  // face the light get a lit band, the others a shade band.
  function ridge(c, w, base, amp, seed, col, lit, shade, o) {
    o = o || {};
    const f1 = o.f1 || 0.011, f2 = o.f2 || 0.029, sharp = o.sharp || 1;
    const top = (x) => {
      const v = Math.sin(x * f1 + seed) * 0.6 + Math.sin(x * f2 + seed * 2.3) * 0.3 + Math.sin(x * f2 * 2.7 + seed * 0.7) * 0.1;
      return Math.round(base - amp * Math.pow(0.5 + v * 0.5, sharp));
    };
    for (let x = 0; x < w; x++) {
      const t = top(x), tl = top(x - 2), tr = top(x + 2);
      R(c, x, t, 1, base - t + 1, col);
      if (lit && tr < tl - 1) R(c, x, t, 1, Math.min(4, base - t), lit);        // rising to the right: faces the light
      else if (shade && tr > tl + 1) R(c, x, t + 1, 1, Math.min(6, base - t), shade);
    }
    return top;
  }
  // A rounded crown of trees / bushes along a line (clusters of bumps).
  function crowns(c, w, base, hgt, seed, col, lit, step) {
    step = step || 7;
    for (let x = -4; x < w + 8; x += step) {
      const k = K.hh(x, seed, 3);
      const hh = Math.round(hgt * (0.55 + (k % 45) / 100)), rw = Math.round(step * 0.9 + (k % 3));
      for (let j = 0; j < hh; j++) {
        const u = j / hh, half = Math.round(rw * Math.sqrt(Math.max(0, 1 - (1 - u) * (1 - u))));
        R(c, x - half, base - hh + j, half * 2 + 1, 1, col);
        if (lit && j < hh * 0.5) R(c, x - half, base - hh + j, Math.max(1, Math.round(half * 0.7)), 1, lit);
      }
    }
  }
  // Ground: horizontal distance bands, then clusters that grow toward the viewer.
  function ground(c, w, hz, h, cols, o) {
    o = o || {};
    const n = cols.length;
    for (let i = 0; i < n; i++) {
      const y0 = hz + Math.round((h - hz) * Math.pow(i / n, 1.6)), y1 = hz + Math.round((h - hz) * Math.pow((i + 1) / n, 1.6));
      R(c, 0, y0, w, y1 - y0, cols[i]);
      if (i && o.seam !== false) for (let x = (i * 5) % 8; x < w; x += 8) R(c, x, y0 - 1, 4, 1, cols[i]);
    }
  }
  function scatter(c, w, hz, h, count, seed, drawOne) {
    for (let i = 0; i < count; i++) {
      const u = (K.hh(i, seed, 1) % 1000) / 1000, v = (K.hh(i, seed, 2) % 1000) / 1000;
      const y = hz + 3 + Math.round(Math.pow(v, 0.75) * (h - hz - 4));
      const d = (y - hz) / Math.max(1, h - hz);
      drawOne(Math.round(u * w), y, d, K.hh(i, seed, 3));
    }
  }
  function cloud(c, x, y, wd, cols) {
    // flat-bottomed cloud: three stacked lobes, lit on top, a shade band below
    const lobes = [[0, 0, wd * 0.5], [wd * 0.28, -wd * 0.12, wd * 0.34], [-wd * 0.26, -wd * 0.05, wd * 0.28]];
    for (const [lx, ly, r] of lobes) {
      const ry = Math.round(r * 0.45);
      for (let j = -ry; j <= 0; j++) {
        const half = Math.round(r * Math.sqrt(1 - (j / (ry + 0.5)) ** 2));
        R(c, x + lx - half, y + ly + j, half * 2, 1, j < -ry * 0.5 ? cols[2] : cols[1]);
      }
    }
    R(c, x - wd * 0.5, y, wd, 2, cols[0]);
  }
  const disc = (c, x, y, r, ry, col) => { c.fillStyle = col; K.disc(c, x, y, r, ry); };

  // ---- per-region backdrops --------------------------------------------------------------
  const B = {};
  B.reedwake = (c, w, h, hz) => {
    skyBands(c, w, 0, hz, ['#5f98b8', '#6fa6c0', '#86b6c6', '#a2c8c6', '#b8d8c0']);
    cloud(c, w * 0.18, hz * 0.3, Math.max(40, w * 0.12), ['#a6c4d0', '#d8e8ea', '#f2f6f0']);
    cloud(c, w * 0.8, hz * 0.18, Math.max(30, w * 0.08), ['#a6c4d0', '#d8e8ea', '#f2f6f0']);
    ridge(c, w, hz, Math.min(40, hz * 0.3), 1.7, '#8fb4b4', '#a2c2bc', '#80a4ac');
    ridge(c, w, hz, Math.min(22, hz * 0.18), 4.2, '#6f9a86', '#82ac90', '#5f8a7c');
    crowns(c, w, hz, 12, 5, '#4e7e52', '#5f9058', 9);
    ground(c, w, hz, h, ['#6aa653', '#5f9a4a', '#578f45', '#4b7f3c']);
    // darker meadow patches, then tufts: a fan of blades over a shadowed base
    scatter(c, w, hz, h, Math.round(w * 0.06), 12, (x, y, d) => { const l = 14 + Math.round(d * 40); R(c, x, y, l, 2 + Math.round(d * 2), '#528a42'); R(c, x + 3, y - 1, l - 6, 1, '#528a42'); });
    scatter(c, w, hz, h, Math.round(w * 0.28), 11, (x, y, d, k) => {
      const s = 2 + Math.round(d * 4), bw = d > 0.5 ? 2 : 1;
      R(c, x - s, y, s * 2 + bw, 1, '#467a38');
      R(c, x - s + 1, y - s, bw, s, '#6aa653'); R(c, x, y - s * 2, bw, s * 2, '#87c064'); R(c, x + s - 1, y - s - 1, bw, s + 1, '#5f9a4a');
      R(c, x, y - s * 2, bw, 1, '#a2d07a');
      if (k % 19 === 0) { R(c, x + s + 2, y - s - 2, 2, 2, k % 2 ? '#f2e6a0' : '#fbfbf0'); R(c, x + s + 2, y - s, 2, 1, '#c8b870'); }
    });
    // reed clumps at the near edges
    for (const [x0, dir] of [[0, 1], [w, -1]]) for (let i = 0; i < 9; i++) {
      const x = x0 + dir * (4 + i * 5 + (K.hh(i, 7) % 4)), hh = 26 + (K.hh(i, 8) % 30);
      R(c, x, h - hh, 2, hh, i % 2 ? '#7a8c42' : '#9fb35a'); R(c, x, h - hh - 6, 2, 7, '#c2c577');
    }
  };
  B.mill = (c, w, h, hz) => {
    // inside the mill: plank wall, a beam, the millstone and its gear in shadow
    R(c, 0, 0, w, hz, '#2e3e3c');
    for (let x = 0; x < w; x += 14) {
      const k = K.hh(x, 2);
      R(c, x, 0, 13, hz, k % 3 ? '#2e3e3c' : '#34443f');
      R(c, x, 0, 1, hz, '#223030'); R(c, x + 1, 0, 1, hz, '#3e4e48');
      if (k % 5 === 0) R(c, x + 5, Math.round(hz * (0.2 + (k % 40) / 100)), 3, 2, '#223030');
    }
    R(c, 0, Math.round(hz * 0.16), w, 10, '#4a3a2a'); R(c, 0, Math.round(hz * 0.16), w, 2, '#6a5238'); R(c, 0, Math.round(hz * 0.16) + 9, w, 1, '#2a2018');
    const mx = Math.round(w * 0.16), my = hz - 18, mr = Math.min(46, Math.round(hz * 0.36));
    disc(c, mx, my, mr, mr, '#24302e'); disc(c, mx, my, mr - 4, mr - 4, '#2b3836'); disc(c, mx, my, 6, 6, '#1a2422');
    for (let a = 0; a < 12; a++) { const an = (a / 12) * Math.PI * 2; R(c, mx + Math.cos(an) * (mr + 2) - 3, my + Math.sin(an) * (mr + 2) - 3, 6, 6, '#24302e'); }
    // a shaft of light from a high window (stepped, not blurred)
    const wx = Math.round(w * 0.86);
    R(c, wx, Math.round(hz * 0.3), 18, 14, '#6e7e70'); R(c, wx + 8, Math.round(hz * 0.3), 2, 14, '#2e3e3c');
    c.fillStyle = 'rgba(220,210,170,0.07)';
    for (let y = Math.round(hz * 0.3) + 14; y < h; y++) { const off = Math.round((y - hz * 0.3) * 0.45); c.fillRect(wx - off, y, 18 + Math.round(off * 0.3), 1); }
    // floor boards in perspective
    ground(c, w, hz, h, ['#3e3024', '#4a3a2a', '#433426', '#3a2c20'], { seam: false });
    for (let i = 1; i < 9; i++) { const y = hz + Math.round((h - hz) * Math.pow(i / 9, 1.5)); R(c, 0, y, w, 1, '#2c2118'); }
    scatter(c, w, hz, h, Math.round(w * 0.12), 21, (x, y) => R(c, x, y, 5, 1, '#54422e'));
    R(c, 0, hz, w, 2, '#2a2018');
  };
  B.saltglass = (c, w, h, hz) => {
    skyBands(c, w, 0, hz - 10, ['#5e8fb8', '#6a9ac0', '#88b0cc', '#b0cadc', '#d8e8f0']);
    cloud(c, w * 0.72, hz * 0.3, Math.max(34, w * 0.1), ['#b8cedc', '#e2ecf2', '#f8fbfc']);
    // the sea, with a far lighthouse on a headland
    skyBands(c, w, hz - 10, hz + 1, ['#4f86a8', '#3a7fa6'], 0);
    for (let i = 0; i < w / 6; i++) { const x = K.hh(i, 31) % w, y = hz - 8 + (K.hh(i, 32) % 8); R(c, x, y, 3 + (i % 3), 1, '#8fc0da'); }
    const lx = Math.round(w * 0.9);
    for (let x = lx - 30; x < w; x++) { const t = Math.round(10 * Math.sin(Math.min(1, (x - lx + 30) / 30) * Math.PI / 2)); R(c, x, hz - 6 - t, 1, t + 7, '#7e8e7a'); if (x < lx - 18) R(c, x, hz - 6 - t, 1, 2, '#9aa894'); }
    R(c, lx - 3, hz - 34, 7, 20, '#eceae2'); R(c, lx + 2, hz - 34, 2, 20, '#c8c4bc'); R(c, lx - 3, hz - 28, 7, 3, '#b2573f'); R(c, lx - 3, hz - 20, 7, 3, '#b2573f');
    R(c, lx - 4, hz - 38, 9, 4, '#3a3a44'); R(c, lx - 1, hz - 37, 3, 2, '#f8e6a0');
    // wet sand line, then sand with ripple marks and shells
    ground(c, w, hz, h, ['#c4ab74', '#d0b782', '#d9c38e', '#e0cc98']);
    R(c, 0, hz, w, 3, '#b39a66'); R(c, 0, hz + 3, w, 1, '#e6f6fb');
    scatter(c, w, hz, h, Math.round(w * 0.35), 33, (x, y, d, k) => {
      const l = 4 + Math.round(d * 8);
      R(c, x, y, l, 1, '#c4ab74'); R(c, x + 1, y - 1, l - 2, 1, '#e6d3a2');
      if (k % 29 === 0) { R(c, x + l + 3, y - 2, 3, 2, '#f0e6d8'); R(c, x + l + 3, y, 3, 1, '#c8a88a'); }
    });
  };
  B.archive = (c, w, h, hz) => {
    // the drowned archive: shelves of ledgers under arches, water on the flags
    skyBands(c, w, 0, hz, ['#10162a', '#141a30', '#1c223c', '#262c48'], 0.25);
    const bay = 58;
    for (let x = -20; x < w + bay; x += bay) {
      const top = Math.round(hz * 0.22);
      for (let y = top + 8; y < hz - 4; y += 16) {
        R(c, x + 6, y + 12, bay - 12, 3, '#22263e');
        for (let bx = x + 8; bx < x + bay - 8; bx += 4) {
          const k = K.hh(bx, y, 4);
          const bh = 8 + (k % 4);
          R(c, bx, y + 12 - bh, 3, bh, ['#282e4a', '#2c2a48', '#263248', '#302c44'][k % 4]);
        }
      }
      R(c, x, top, 6, hz - top, '#1a1e34'); R(c, x + 1, top, 1, hz - top, '#2e3452');
      for (let a = 0; a <= 20; a++) { const an = Math.PI + (a / 20) * Math.PI; R(c, x + bay / 2 + Math.cos(an) * bay / 2 - 2, top + Math.sin(an) * 18 - 2, 5, 5, '#1a1e34'); }
    }
    ground(c, w, hz, h, ['#2e3248', '#343852', '#3a3f5c', '#34384f']);
    for (let i = 1; i < 7; i++) { const y = hz + Math.round((h - hz) * Math.pow(i / 7, 1.5)); R(c, 0, y, w, 1, '#262a3e'); }
    scatter(c, w, hz, h, Math.round(w * 0.05), 41, (x, y, d) => { const l = 16 + Math.round(d * 40); R(c, x, y, l, 1, '#4a5a86'); R(c, x + 4, y + 1, l - 8, 1, '#3a4c7a'); });
    R(c, 0, hz, w, 2, '#1c2034');
  };
  B.cinder = (c, w, h, hz) => {
    skyBands(c, w, 0, hz, ['#c8805a', '#d8905a', '#e4a86e', '#ecbc80', '#f0c890']);
    ridge(c, w, hz, Math.min(46, hz * 0.34), 2.4, '#b88468', '#c89478', '#a47462', { sharp: 1.4 });
    // kiln chimneys and their smoke on the far slope
    for (const fx of [0.12, 0.3, 0.84]) {
      const x = Math.round(w * fx), top = hz - 30 - (K.hh(Math.round(fx * 100), 5) % 10);
      R(c, x, top, 6, hz - top, '#7a5a4c'); R(c, x, top, 2, hz - top, '#8e6a58');
      for (let i = 0; i < 5; i++) disc(c, x + 3 + i * 5, top - 6 - i * 7, 4 + i, 3 + i, 'rgba(150,130,125,' + (0.5 - i * 0.08).toFixed(2) + ')');
    }
    ridge(c, w, hz, Math.min(20, hz * 0.15), 5.1, '#9a7a6c', '#aa887a', '#8a6c62');
    ground(c, w, hz, h, ['#948e8a', '#8a8480', '#7c7672', '#6e6864']);
    scatter(c, w, hz, h, Math.round(w * 0.3), 51, (x, y, d, k) => {
      const s = 2 + Math.round(d * 3);
      R(c, x, y, s + 1, Math.max(1, s - 1), '#5a5450'); R(c, x, y - 1, s, 1, '#a09a94');
      if (k % 17 === 0) R(c, x + s + 2, y, 2, 1, '#e0763a');
    });
  };
  B.kiln = (c, w, h, hz) => {
    // inside the kilns: brick walls with glowing arched mouths
    R(c, 0, 0, w, hz, '#3a1a14');
    for (let y = 0; y < hz; y += 7) {
      const off = (y / 7) % 2 ? 6 : 0;
      for (let x = -off; x < w; x += 12) {
        const k = K.hh(x, y, 6);
        const dark = y < hz * 0.45 ? 1 : 0;
        R(c, x + 1, y + 1, 11, 6, dark ? (k % 4 ? '#3e1c14' : '#442017') : (k % 4 ? '#4a2218' : '#50261b'));
        R(c, x + 1, y + 1, 11, 1, dark ? '#46221a' : '#56291d');
      }
    }
    for (const fx of [0.14, 0.86]) {
      const x = Math.round(w * fx);
      disc(c, x, hz - 22, 22, 18, '#241008');
      R(c, x - 22, hz - 22, 45, 22, '#241008');
      disc(c, x, hz - 12, 16, 10, '#8a3a18'); disc(c, x, hz - 8, 12, 7, '#d8602a'); disc(c, x, hz - 5, 7, 4, '#f0a040');
      c.fillStyle = 'rgba(240,120,50,0.10)'; K.disc(c, x, hz, 46, 20);
    }
    ground(c, w, hz, h, ['#4a3a34', '#443630', '#3e302a', '#3a2c28']);
    for (let i = 1; i < 6; i++) { const y = hz + Math.round((h - hz) * Math.pow(i / 6, 1.5)); R(c, 0, y, w, 1, '#2e2220'); }
    scatter(c, w, hz, h, Math.round(w * 0.12), 61, (x, y, d) => R(c, x, y, 3 + Math.round(d * 5), 1, '#56443c'));
    R(c, 0, hz, w, 2, '#2a1a14');
  };
  B.snowbell = (c, w, h, hz) => {
    skyBands(c, w, 0, hz, ['#7890b2', '#8aa0c0', '#a4b6cc', '#c4d0dc', '#dde6ee']);
    const top = ridge(c, w, hz, Math.min(64, hz * 0.46), 3.3, '#9aaac2', null, null, { sharp: 1.6, f1: 0.014 });
    // snowcaps: the upper part of each peak is white, shaded blue on the right slopes
    for (let x = 0; x < w; x++) {
      const t = top(x), tl = top(x - 2), tr = top(x + 2), cap = hz - Math.min(64, hz * 0.46) * 0.55;
      if (t < cap) R(c, x, t, 1, Math.round(cap - t), tr > tl ? '#c8d4e4' : '#f2f6fa');
    }
    ridge(c, w, hz, Math.min(24, hz * 0.18), 6.2, '#b8c6d6', '#d0dae6', '#a8b8cc');
    // a line of dark pines on the far snow
    for (let x = 6; x < w; x += 11 + (K.hh(x, 9) % 9)) {
      if (x > w * 0.42 && x < w * 0.8) continue; // keep the middle clear
      const hh = 14 + (K.hh(x, 10) % 12);
      for (let j = 0; j < hh; j++) { const half = Math.round((j / hh) * 5); R(c, x - half, hz - hh + j, half * 2 + 1, 1, j % 4 === 0 ? '#3c5f56' : '#2f4c46'); }
      R(c, x - 1, hz - hh, 2, 2, '#eef3f7');
    }
    ground(c, w, hz, h, ['#e2eaf1', '#eef3f7', '#e6edf3', '#d6e2ec']);
    scatter(c, w, hz, h, Math.round(w * 0.12), 71, (x, y, d) => {
      const l = 10 + Math.round(d * 26);
      R(c, x, y, l, 2, '#c7d4de'); R(c, x + 2, y - 1, l - 4, 1, '#ffffff');
    });
  };
  B.observatory = (c, w, h, hz) => {
    skyBands(c, w, 0, hz, ['#0c1228', '#101830', '#18203c', '#202a48', '#283050']);
    for (let i = 0; i < w * hz / 900; i++) {
      const x = K.hh(i, 81) % w, y = K.hh(i, 82) % Math.max(1, hz - 30);
      R(c, x, y, 1, 1, i % 5 ? '#8a98c0' : '#dde6ff');
    }
    // the dome, slit open, on the left; a low parapet
    const dx = Math.round(w * 0.14), dr = Math.min(52, Math.round(hz * 0.4));
    for (let j = 0; j <= dr; j++) { const half = Math.round(Math.sqrt(dr * dr - (dr - j) * (dr - j))); R(c, dx - half, hz - 20 - dr + j, half * 2, 1, j < dr * 0.4 ? '#46506a' : '#3a4458'); R(c, dx - half, hz - 20 - dr + j, Math.max(1, Math.round(half * 0.5)), 1, '#525c78'); }
    R(c, dx - 4, hz - 20 - dr, 8, dr, '#141a30');
    R(c, dx - dr, hz - 20, dr * 2, 20, '#3a4458'); R(c, dx - dr, hz - 20, dr * 2, 2, '#5a6478');
    R(c, 0, hz - 8, w, 8, '#3a4458'); R(c, 0, hz - 8, w, 1, '#5a6478');
    for (let x = 4; x < w; x += 24) R(c, x, hz - 12, 10, 4, '#3a4458');
    ground(c, w, hz, h, ['#4c566c', '#5a6478', '#505a6e', '#3a4458']);
    for (let i = 1; i < 7; i++) { const y = hz + Math.round((h - hz) * Math.pow(i / 7, 1.5)); R(c, 0, y, w, 1, '#343d52'); }
    for (let x = -w; x < w * 2; x += 36) for (let y = hz; y < h; y += 2) { const k = (y - hz) / (h - hz); R(c, Math.round(w / 2 + (x - w / 2) * (0.35 + k * 0.9)), y, 1, 2, '#343d52'); }
  };
  B.lanternfall = (c, w, h, hz) => {
    skyBands(c, w, 0, hz, ['#5a5a94', '#6a6aa0', '#8a82b4', '#b4a8d0', '#d8c8e8']);
    // town rooftops with a bell tower, lanterns strung between them
    const roofs = (base, col, lit, seed, lo, hi) => {
      for (let x = -10; x < w; ) {
        const k = K.hh(x + 40, seed), bw = 26 + (k % 22), rh = lo + (k % (hi - lo));
        if (!(x > w * 0.46 && x < w * 0.76)) {
          R(c, x, base - rh, bw, rh, col);
          for (let j = 0; j < 8; j++) R(c, x - 3 + j, base - rh - 8 + j, bw + 6 - j * 2, 1, j < 3 ? lit : col);
          if (k % 3 === 0) R(c, x + 6, base - rh + 6, 4, 5, '#f4d884');
        }
        x += bw + 4;
      }
    };
    const tx = Math.round(w * 0.9);
    R(c, tx - 8, hz - 70, 16, 70, '#4c4a78'); R(c, tx - 12, hz - 78, 24, 8, '#3a3860'); R(c, tx - 4, hz - 66, 8, 10, '#2a2848');
    roofs(hz, '#5c5a86', '#7270a0', 3, 16, 30);
    roofs(hz + 2, '#4c4a78', '#6e6ca0', 7, 8, 16);
    for (const [a, b] of [[0.04, 0.3], [0.8, 0.98]]) {
      const x0 = Math.round(w * a), x1 = Math.round(w * b), y0 = hz - 30;
      for (let x = x0; x < x1; x++) { const u = (x - x0) / (x1 - x0), y = y0 + Math.round(Math.sin(u * Math.PI) * 8); R(c, x, y, 1, 1, '#3a3860'); if ((x - x0) % 14 === 7) { R(c, x - 1, y + 1, 3, 4, '#f4b860'); R(c, x - 1, y + 1, 1, 4, '#fce0a0'); } }
    }
    ground(c, w, hz, h, ['#c4bece', '#b9b3c2', '#aca6b6', '#9892a4']);
    for (let i = 1; i < 8; i++) { const y = hz + Math.round((h - hz) * Math.pow(i / 8, 1.5)); R(c, 0, y, w, 1, '#8e889a'); for (let x = (i % 2) * 14; x < w; x += 28) R(c, x, y, 1, Math.round((h - hz) / 20) + 1, '#8e889a'); }
  };
  B.belltower = (c, w, h, hz) => {
    // inside the bell tower at night: rafters, the great bell hanging high, a moonlit opening
    skyBands(c, w, 0, hz, ['#162438', '#1a2a44', '#223452', '#2a4060'], 0.25);
    const ox = Math.round(w * 0.84);
    R(c, ox - 18, Math.round(hz * 0.3), 36, 44, '#3a5a8a'); disc(c, ox, Math.round(hz * 0.3), 18, 14, '#3a5a8a');
    R(c, ox - 1, Math.round(hz * 0.3) - 14, 2, 58, '#162438'); R(c, ox - 18, Math.round(hz * 0.3) + 14, 36, 2, '#162438');
    disc(c, ox + 7, Math.round(hz * 0.3) - 4, 4, 4, '#e8eef8');
    for (const y of [Math.round(hz * 0.12), Math.round(hz * 0.5)]) { R(c, 0, y, w, 8, '#2a2030'); R(c, 0, y, w, 2, '#3e3040'); }
    for (let x = 20; x < w; x += 90) { R(c, x, 0, 8, hz, '#24202c'); R(c, x, 0, 2, hz, '#342e3c'); }
    const bx = Math.round(w * 0.2), by = Math.round(hz * 0.14);
    R(c, bx - 1, 0, 3, by, '#2a2030');
    for (let j = 0; j < 40; j++) { const half = Math.round(12 + (j < 8 ? Math.sqrt(j / 8) * 4 : 4 + (j - 8) * 0.25)); R(c, bx - half, by + j, half * 2, 1, j < 36 ? '#2a3a56' : '#22304a'); R(c, bx - half, by + j, 3, 1, '#3a4e70'); }
    ground(c, w, hz, h, ['#2a3c5c', '#324868', '#2e4262', '#2a3c5c']);
    for (let i = 1; i < 8; i++) { const y = hz + Math.round((h - hz) * Math.pow(i / 8, 1.5)); R(c, 0, y, w, 1, '#22324e'); }
    R(c, 0, hz, w, 2, '#1c2a44');
  };
  B.still = (c, w, h, hz) => {
    // the Still Archive: a dark void over a ground of blank paper with faint rules
    skyBands(c, w, 0, hz, ['#08090f', '#0a0c18', '#10122a', '#1a1c30'], 0.25);
    for (let i = 0; i < 12; i++) {
      const x = K.hh(i, 91) % w, y = 10 + (K.hh(i, 92) % Math.max(1, hz - 50));
      if (x > w * 0.45 && x < w * 0.8) continue;
      R(c, x, y, 8, 6, '#3a3a4c'); R(c, x, y, 8, 1, '#4c4c60'); R(c, x + 6, y, 2, 2, '#2a2a3a');
    }
    // unwritten hills: outlines only, dotted
    const top = (x) => Math.round(hz - 16 - Math.sin(x * 0.012 + 1) * 12 - Math.sin(x * 0.031) * 5);
    for (let x = 0; x < w; x += 3) R(c, x, top(x), 2, 1, '#4a4a60');
    ground(c, w, hz, h, ['#d6ceb8', '#e4ddc8', '#dcd4be', '#c8c0a8']);
    for (let i = 1; i < 10; i++) { const y = hz + Math.round((h - hz) * Math.pow(i / 10, 1.4)); R(c, 0, y, w, 1, '#c8c0aa'); }
    R(c, Math.round(w * 0.07), hz, 1, h - hz, '#d4a8a0');
    R(c, 0, hz, w, 2, '#aea68e');
  };
  B.atlas = (c, w, h, hz) => {
    // the Unwritten Atlas: parchment sky with a faint grid, map-symbol
    // mountains on the horizon, contour lines and a dotted route underfoot
    skyBands(c, w, 0, hz, ['#c8b890', '#d4c6a0', '#e0d4b4', '#f0e8d0']);
    for (let x = 0; x < w; x += 32) R(c, x, 0, 1, hz, 'rgba(160,140,100,0.18)');
    for (let y = 0; y < hz; y += 32) R(c, 0, y, w, 1, 'rgba(160,140,100,0.18)');
    for (let x = 10; x < w; x += 22 + (K.hh(x, 5) % 14)) {
      if (x > w * 0.45 && x < w * 0.8) continue;
      const s = 7 + (K.hh(x, 6) % 7);
      for (let j = 0; j < s; j++) { R(c, x - j, hz - 4 - s + j, 1, 1, '#8a765a'); R(c, x + j, hz - 4 - s + j, 1, 1, '#8a765a'); if (j > 1 && j % 2) R(c, x + j - 1, hz - 4 - s + j, 1, 1, '#b09a7a'); }
    }
    ground(c, w, hz, h, ['#c0b892', '#b8b08a', '#aca47e', '#a09872']);
    for (let i = 0; i < 4; i++) {
      const cx = w * (0.2 + i * 0.22), cy = hz + (h - hz) * (0.35 + (i % 2) * 0.3);
      for (let r = 1; r <= 3; r++) for (let a = 0; a < 48; a += 2) { const an = (a / 48) * Math.PI * 2; R(c, cx + Math.cos(an) * r * 14, cy + Math.sin(an) * r * 5, 2, 1, '#968e6a'); }
    }
    for (let y = h - 4, x = w * 0.08; y > hz + 6; y -= 5) { x += 4 + Math.sin(y * 0.05) * 3; R(c, Math.round(x), y, 2, 2, '#8a5a3a'); }
    R(c, 0, hz, w, 1, '#8a8260');
  };

  // ---- ambient particles (per frame, cheap, deterministic by time) ------------------------
  const AMB = {
    reedwake: { n: 8, col: 'rgba(250,250,236,0.8)', size: 2, vx: 0.012, vy: -0.004, wob: 6 },
    mill: { n: 14, col: 'rgba(230,220,180,0.45)', size: 1, vx: 0.004, vy: 0.003, wob: 8 },
    saltglass: { n: 0 },
    archive: { n: 10, col: 'rgba(170,190,240,0.4)', size: 1, vx: 0, vy: -0.004, wob: 5 },
    cinder: { n: 12, col: 'rgba(210,200,196,0.7)', size: 2, vx: -0.008, vy: 0.01, wob: 8 },
    kiln: { n: 14, col: 'rgba(255,170,90,0.85)', size: 2, vx: 0.002, vy: -0.016, wob: 6 },
    snowbell: { n: 26, col: 'rgba(255,255,255,0.9)', size: 2, vx: -0.004, vy: 0.012, wob: 10 },
    observatory: { n: 0 },
    lanternfall: { n: 6, col: 'rgba(252,224,160,0.7)', size: 2, vx: 0.004, vy: -0.006, wob: 8 },
    belltower: { n: 10, col: 'rgba(200,216,255,0.35)', size: 1, vx: 0.003, vy: 0.004, wob: 8 },
    still: { n: 7, col: 'rgba(236,232,220,0.55)', size: 3, vx: 0.006, vy: -0.005, wob: 10 },
    atlas: { n: 5, col: 'rgba(250,244,226,0.8)', size: 3, vx: 0.01, vy: 0.002, wob: 8 },
  };
  function ambient(c, key, w, h, hz, t) {
    const a = AMB[key];
    if (!a || !a.n) return;
    c.fillStyle = a.col;
    for (let i = 0; i < a.n; i++) {
      const sx = K.hh(i, 5, 1) % 1000 / 1000, sy = K.hh(i, 5, 2) % 1000 / 1000, ph = (K.hh(i, 5, 3) % 628) / 100;
      const x = ((sx * w + t * a.vx * (0.6 + sx)) % w + w) % w + Math.sin(t / 1400 + ph) * a.wob;
      const y = ((sy * h + t * a.vy * (0.6 + sy)) % h + h) % h;
      c.fillRect(Math.round(x), Math.round(y), a.size, a.size);
    }
    if (key === 'saltglass') {
      c.fillStyle = 'rgba(236,248,255,0.8)';
      for (let i = 0; i < 6; i++) if (Math.sin(t / 700 + i * 2.3) > 0.6) c.fillRect(K.hh(i, 44) % w, hz - 8 + (K.hh(i, 45) % 7), 2, 1);
    }
    if (key === 'observatory') {
      for (let i = 0; i < 8; i++) {
        const k = (Math.sin(t / 900 + i * 1.7) + 1) / 2;
        c.fillStyle = 'rgba(230,236,255,' + (0.3 + k * 0.6).toFixed(2) + ')';
        const x = K.hh(i, 83) % w, y = K.hh(i, 84) % Math.max(1, hz - 40);
        c.fillRect(x, y, 1, 1);
        if (k > 0.8) { c.fillRect(x - 1, y, 3, 1); c.fillRect(x, y - 1, 1, 3); }
      }
    }
  }

  // frame (optional): the stage and the actors' places, for RB.battlePlaces,
  // which composes the backdrop from the encounter's real place; without a
  // composed place this region painter is the fallback.
  function backdrop(c, key, w, h, hz, t, still, frame) {
    if (frame && RB.battlePlaces && RB.battlePlaces.draw(c, key, w, h, hz, t, still, frame)) return;
    const k = (B[key] ? key : 'reedwake') + '|' + w + 'x' + h + '|' + hz;
    let cv = cache.get(k);
    if (!cv) {
      cv = RB.sprites.makeCanvas(w, h);
      const g = cv.getContext('2d');
      g.imageSmoothingEnabled = false;
      (B[key] || B.reedwake)(g, w, h, hz);
      cache.set(k, cv);
      while (cache.size > 3) cache.delete(cache.keys().next().value);
    }
    c.drawImage(cv, 0, 0);
    if (!still) ambient(c, B[key] ? key : 'reedwake', w, h, hz, t);
  }

  // ---- marks ------------------------------------------------------------------------------
  const icons = new Map();
  function icon(key, w, h, fn) {
    let cv = icons.get(key);
    if (cv) return cv;
    const L = K.layer(w, h, Math.floor(w / 2), Math.floor(h / 2));
    fn(L);
    cv = L.canvas();
    icons.set(key, cv);
    return cv;
  }
  // A knot: a closed loop of pale cord with a bound crossing and two short
  // ends — or, once undone, the same cord lying loose and faint.
  function knot(tied) {
    return icon('knot' + (tied ? 1 : 0), 21, 23, (L) => {
      const cord = K.mat('#e8d8b0', { n: 4, at: 2, step: 0.1, lineCol: '#2a2024' });
      if (tied) {
        // a closed loop of twisted cord, bound where it crosses at the bottom
        L.fill(-9, -9, 9, 9, (x, y) => { const d = Math.hypot(x, y); return d <= 7.6 && d >= 4.2; }, cord,
          (x, y) => K.clamp(0.5 - (x + y) / 18 + ((Math.floor((Math.atan2(y, x) + 4) * 2.5) % 2) ? 0.16 : -0.04), 0, 0.99));
        L.rect(-3, 4, 6, 5, cord, 1);
        L.rect(-3, 5, 6, 1, cord, 3); L.rect(-3, 7, 6, 1, cord, 3);
        L.outline();
      } else {
        const faint = K.mat('#e8d8b0', { n: 3, at: 1, step: 0.1, alpha: 110, line: false });
        const pts = [];
        for (let i = 0; i <= 8; i++) pts.push([-9 + i * 2.25, 2 + Math.round(Math.sin(i * 1.3) * 2.5)]);
        L.path(pts, 2, faint, 1);
      }
    });
  }
  function shadow(c, x, y, rx, ry, a) {
    c.fillStyle = 'rgba(12,10,20,' + (a * 0.55).toFixed(3) + ')';
    K.disc(c, x, y, rx, ry);
    c.fillStyle = 'rgba(12,10,20,' + (a * 0.5).toFixed(3) + ')';
    K.disc(c, x, y, Math.round(rx * 0.72), Math.max(1, Math.round(ry * 0.7)));
  }
  // A ward: a pale arc over a party member, one bead per ward point.
  function ward(c, x, y, r, n, s) {
    if (!n) return;
    const a0 = Math.PI * 1.1, a1 = Math.PI * 1.9, th = Math.max(2, s);
    const alpha = 0.45 + Math.min(n, 4) * 0.12;
    c.fillStyle = 'rgba(160,210,255,' + (alpha * 0.35).toFixed(2) + ')';
    for (let a = a0; a <= a1; a += 0.6 / r) c.fillRect(Math.round(x + Math.cos(a) * (r + th)), Math.round(y + Math.sin(a) * (r + th)), th, th);
    c.fillStyle = 'rgba(200,232,255,' + alpha.toFixed(2) + ')';
    for (let a = a0; a <= a1; a += 0.6 / r) c.fillRect(Math.round(x + Math.cos(a) * r), Math.round(y + Math.sin(a) * r), th, th);
    c.fillStyle = '#f4fbff';
    for (let i = 0; i < Math.min(n, 5); i++) {
      const a = a0 + ((i + 1) / (Math.min(n, 5) + 1)) * (a1 - a0);
      const bx = Math.round(x + Math.cos(a) * r), by = Math.round(y + Math.sin(a) * r);
      c.fillRect(bx - s, by - s, th + s, th + s);
    }
  }
  // Effects (k: 0 → 1 over the effect's life); positions in art px.
  function effect(c, e, k, at, s) {
    s = s || 1;
    const A = (v) => Math.max(0, Math.min(1, v)).toFixed(2);
    if (e.kind === 'glyph') {
      const r = Math.round((20 + k * 80) * s / 2) * 2;
      c.fillStyle = 'rgba(255,236,170,' + A(1 - k) + ')'; K.ring(c, e.x, e.y, r, 2 * s);
      c.fillStyle = 'rgba(255,236,170,' + A((1 - k) * 0.4) + ')'; K.ring(c, e.x, e.y, Math.max(2, r - 8 * s), s);
    } else if (e.kind === 'water') {
      c.fillStyle = 'rgba(140,200,245,' + A(1 - k) + ')';
      for (let i = 0; i < 16; i++) c.fillRect(Math.round(at.ex - 60 * s + i * 8 * s), Math.round(at.ey - 60 * s + k * 120 * s + (i % 3) * 10 * s), 2 * s, 8 * s);
      c.fillStyle = 'rgba(230,246,255,' + A(1 - k) + ')';
      for (let i = 0; i < 16; i += 3) c.fillRect(Math.round(at.ex - 60 * s + i * 8 * s), Math.round(at.ey - 60 * s + k * 120 * s + (i % 3) * 10 * s), 2 * s, 2 * s);
    } else if (e.kind === 'light') {
      K.halo(c, at.ex, at.ey, Math.round(160 * s * (0.6 + k * 0.4)), '255,248,200', 0.8 * (1 - k), 4);
    } else if (e.kind === 'untie') {
      c.fillStyle = 'rgba(232,216,176,' + A(1 - k) + ')';
      const x0 = at.ex - (40 + k * 60) * s, x1 = at.ex + (40 + k * 60) * s, y0 = at.ey - 40 * s, cy = at.ey - (80 + k * 40) * s;
      for (let i = 0; i <= 40; i++) {
        const u = i / 40, x = (1 - u) * (1 - u) * x0 + 2 * u * (1 - u) * at.ex + u * u * x1, y = (1 - u) * (1 - u) * y0 + 2 * u * (1 - u) * cy + u * u * y0;
        if (u > 0.45 && u < 0.55 && k > 0.2) continue;
        c.fillRect(Math.round(x), Math.round(y), 2 * s, 2 * s);
      }
    } else if (e.kind === 'hit') {
      const r = Math.round((6 + k * 14) * s);
      c.fillStyle = 'rgba(255,255,255,' + A(0.8 * (1 - k)) + ')';
      c.fillRect(e.x - 1 * s, e.y - r, 2 * s, r * 2); c.fillRect(e.x - r, e.y - 1 * s, r * 2, 2 * s);
      for (const [dx, dy] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) c.fillRect(Math.round(e.x + dx * r * 0.6), Math.round(e.y + dy * r * 0.6), 2 * s, 2 * s);
    } else if (e.kind === 'heal') {
      for (let i = 0; i < 8; i++) {
        const x = Math.round(at.px + i * 12 * s), y = Math.round(at.py + 60 * s - k * 80 * s - (i % 3) * 12 * s);
        c.fillStyle = 'rgba(160,240,160,' + A(1 - k) + ')';
        c.fillRect(x - s, y, 3 * s, s); c.fillRect(x, y - s, s, 3 * s);
      }
    }
  }
  // Mist over the creature when it is shrouded: stepped translucent puffs.
  function mist(c, x, y, s, t, still) {
    const drift = still ? 0 : Math.round(Math.sin(t / 1300) * 6);
    for (const [dx, dy, r, a] of [[-40, -10, 44, 0.3], [30, 6, 50, 0.3], [0, -50, 40, 0.26], [-10, 40, 56, 0.28], [0, 0, 30, 0.35]]) {
      c.fillStyle = 'rgba(222,228,238,' + a + ')';
      K.disc(c, x + (dx + drift) * s, y + dy * s, r * s, Math.round(r * 0.6) * s);
    }
  }

  return { backdrop, knot, shadow, ward, effect, mist, B };
})();
