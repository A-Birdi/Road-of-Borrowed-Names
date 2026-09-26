/* Procedural tiles and regional palettes. Tiles are 16×16 pixels, drawn with
 * pixel rectangles and deterministic per-cell variation. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.tiles = (function () {
  'use strict';
  const TS = 16;

  // Regional palettes. Each region varies composition as well as colour.
  const PAL = {
    reedwake: {
      grass: ['#5f9a4a', '#72ad55', '#87c064', '#4b7f3c'], dirt: ['#a8845a', '#bb9868', '#8d6c47', '#c9a87a'],
      stone: ['#9a9486', '#b3ad9e', '#7c776b'], water: ['#3f7fa0', '#4f93b3', '#6fb0c8', '#d8f0f0'],
      sand: ['#d9c38e', '#e6d3a2', '#c4ab74'], wood: ['#8a5a36', '#a06c42', '#6e4428', '#c08a58'],
      leaf: ['#3d6e35', '#4f8a40', '#6aa650', '#2d5228'], trunk: ['#6b4a2e', '#4e3420'],
      flower: ['#f2e6a0', '#f4a6a0', '#fbfbf0', '#b8a0e0'], reed: ['#9fb35a', '#c2c577', '#7a8c42'],
      wall: ['#d8c9a8', '#c2b28e', '#a39270'], floor: ['#b98b5a', '#a57a4c', '#8f6840'], roof: ['#b08a4a', '#8e6c38', '#6f5129', '#cfa962'],
      snow: ['#eef3f7', '#d6e2ec', '#bccbd8'], sky: '#dff1ff', dark: '#1c2a24',
    },
    saltglass: {
      grass: ['#7d9a5a', '#8fab68', '#a2bc7a', '#667f48'], dirt: ['#c7ad86', '#d6bf99', '#ae9470', '#e2d0b0'],
      stone: ['#a7aab0', '#c4c7cc', '#878a90'], water: ['#2e6b8f', '#3a7fa6', '#5d9fc2', '#e6f6fb'],
      sand: ['#e4d3a8', '#efe2bf', '#cdb98a'], wood: ['#7d6450', '#957a62', '#5f4a3a', '#b39a80'],
      leaf: ['#4d7a4a', '#5f8f58', '#78a86c', '#385c38'], trunk: ['#6b5040', '#4a382c'],
      flower: ['#f0f0f0', '#f2c48a', '#9cc4e8', '#e89a9a'], reed: ['#a9b77a', '#c9cf98', '#869556'],
      wall: ['#ece6da', '#d8d0c0', '#b8ae9a'], floor: ['#a88e70', '#94795c', '#7e664c'], roof: ['#b2573f', '#943f2e', '#6f2e22', '#cf7a5c'],
      snow: ['#eef3f7', '#d6e2ec', '#bccbd8'], sky: '#e8f4fb', dark: '#1a2630',
    },
    cinder: {
      grass: ['#8a8a4a', '#9c9a55', '#b0aa62', '#727238'], dirt: ['#8e7462', '#a18772', '#766050', '#b89e88'],
      stone: ['#8f8680', '#aaa19a', '#716a64'], water: ['#4f7c88', '#5f8f9a', '#7fa9b0', '#dbeee8'],
      sand: ['#cdb48c', '#dbc49e', '#b59d76'], wood: ['#7a4a30', '#935a3a', '#5c3622', '#b27a52'],
      leaf: ['#b4552e', '#cc7036', '#e09a48', '#8a3c22'], trunk: ['#5a3a2a', '#40281c'],
      flower: ['#f6d65a', '#f28a52', '#fff2d0', '#d85a4a'], reed: ['#b8a45a', '#d4bf72', '#94823e'],
      wall: ['#e0c8a8', '#caa884', '#a88a68'], floor: ['#a4744e', '#8e6240', '#784f32'], roof: ['#6e5a52', '#54443e', '#3c302c', '#8e7870'],
      snow: ['#eef3f7', '#d6e2ec', '#bccbd8'], sky: '#fbe8d0', dark: '#2a1c18',
    },
    snowbell: {
      grass: ['#dfe8ef', '#eef4f8', '#ffffff', '#c7d4de'], dirt: ['#9aa3ab', '#b0b8bf', '#838b93', '#c6ccd2'],
      stone: ['#7d8794', '#98a2ae', '#636c78'], water: ['#5a7ea0', '#6d93b4', '#9dc0da', '#f0f8ff'],
      sand: ['#cfd6dc', '#dfe5ea', '#b8c0c8'], wood: ['#5e4636', '#76584a', '#44322a', '#94786a'],
      leaf: ['#2f4c46', '#3c5f56', '#557d70', '#223832'], trunk: ['#4a382e', '#33261f'],
      flower: ['#b8d4f0', '#f0e0f0', '#ffffff', '#e8c0c8'], reed: ['#a8b4b8', '#c4ccd0', '#8a969a'],
      wall: ['#c8b8a4', '#b0a08a', '#8e7e6a'], floor: ['#8e6e52', '#7a5c44', '#664a36'], roof: ['#56606e', '#444c58', '#323842', '#eef3f7'],
      snow: ['#eef3f7', '#d6e2ec', '#bccbd8'], sky: '#dde6ee', dark: '#1a2230',
    },
    lanternfall: {
      grass: ['#5d8a6a', '#6c9a78', '#82ae8c', '#4a7056'], dirt: ['#b4a48c', '#c4b69e', '#9c8c74', '#d4c8b2'],
      stone: ['#b9b3c2', '#d0cad6', '#9892a4'], water: ['#3c5c8a', '#4a6c9c', '#6c8cbc', '#e0e8f8'],
      sand: ['#dcd2bc', '#e8e0cc', '#c4b89e'], wood: ['#6a4c56', '#80606a', '#503842', '#9c7c86'],
      leaf: ['#3e6a58', '#4c7e6a', '#66987f', '#2e5042'], trunk: ['#584044', '#3e2c30'],
      flower: ['#f4d884', '#e8b4d0', '#fcf8ec', '#a8b8f0'], reed: ['#8cae94', '#a8c4ae', '#6e9078'],
      wall: ['#ebe4ee', '#d6ccdc', '#b6aabe'], floor: ['#9c8494', '#86707e', '#705c68'], roof: ['#4c4a78', '#3a3860', '#2a2848', '#6e6ca0'],
      snow: ['#eef3f7', '#d6e2ec', '#bccbd8'], sky: '#e6e0f4', dark: '#1a1830',
    },
    archive: {
      grass: ['#3a3f5c', '#454b6a', '#525a7c', '#2e3248'], dirt: ['#5a5670', '#6a6682', '#4a465e', '#7c7896'],
      stone: ['#4e5270', '#62668a', '#3c3f58'], water: ['#1e2a4a', '#28365c', '#3a4c7a', '#8aa4d8'],
      sand: ['#8a8498', '#9c96aa', '#767086'], wood: ['#4a3c4e', '#5c4c60', '#382c3c', '#766478'],
      leaf: ['#3a5a6a', '#4a6e80', '#6a90a0', '#2a4250'], trunk: ['#3a2e3e', '#2a2030'],
      flower: ['#e8e4d0', '#a8d8e0', '#f4f0e0', '#c8b0e8'], reed: ['#6a7890', '#8490a8', '#566078'],
      wall: ['#e4ddc8', '#cfc6ae', '#aea68e'], floor: ['#5c5670', '#4c4660', '#3e3a50'], roof: ['#2c2c48', '#222238', '#18182a', '#404068'],
      snow: ['#eef3f7', '#d6e2ec', '#bccbd8'], sky: '#2a2c48', dark: '#0c0e1a',
    },
    atlas: {
      grass: ['#b8b08a', '#c8c09a', '#d8d0aa', '#a09872'], dirt: ['#a08a6a', '#b09a7a', '#8a765a', '#c4b090'],
      stone: ['#9a948a', '#b0aa9e', '#827c72'], water: ['#5a7a8a', '#6a8a9a', '#8aaab8', '#eef4f0'],
      sand: ['#e0d4b0', '#ece2c4', '#c8ba94'], wood: ['#7a5a42', '#8e6c52', '#5e4432', '#a88a6c'],
      leaf: ['#6a7a4a', '#7c8e58', '#98a86e', '#525e38'], trunk: ['#5a4432', '#403024'],
      flower: ['#e8d8a0', '#d8a090', '#f8f4e8', '#a8a0d0'], reed: ['#a8a46a', '#c0bc84', '#8a8650'],
      wall: ['#e8dcc0', '#d4c6a6', '#b4a684'], floor: ['#a88c6a', '#94785a', '#7e664a'], roof: ['#8a5a42', '#6e4634', '#523426', '#a87a5e'],
      snow: ['#eef3f7', '#d6e2ec', '#bccbd8'], sky: '#f0e8d0', dark: '#2a2418',
    },
  };
  PAL.interior = PAL.reedwake;

  // ---- hue-shifted material ramps ------------------------------------------------------
  // Five steps per material, darkest first, around one anchor colour of the
  // palette (index 2 is the anchor). Worked out in OKLab: shadows turn toward
  // blue-violet and keep their chroma, highlights turn toward warm yellow and
  // lose a little, so a ramp is never just a darker/lighter copy of one hue.
  // The step size follows the spread of the palette's own anchors. Added keys
  // (existing keys are never changed): grassR dirtR stoneR sandR snowR waterR
  // woodR floorR wallR roofR leafR reedR. Palettes defined later get them
  // through addRamps(pal).
  const hexRgb = (h) => { const n = parseInt(h.slice(1, 7), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
  const toLin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  const toGam = (v) => { v = v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(Math.max(0, v), 1 / 2.4) - 0.055; return Math.max(0, Math.min(255, Math.round(v * 255))); };
  function oklab(hex) {
    const [R, G, B] = hexRgb(hex).map(toLin);
    const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
    const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
    const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
    return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
  }
  function fromOklab(L, a, b) {
    const l = Math.pow(L + 0.3963377774 * a + 0.2158037573 * b, 3), m = Math.pow(L - 0.1055613458 * a - 0.0638541728 * b, 3), s = Math.pow(L - 0.0894841775 * a - 1.291485548 * b, 3);
    const r = toGam(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s), g = toGam(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s), bb = toGam(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s);
    return '#' + ((1 << 24) | (r << 16) | (g << 8) | bb).toString(16).slice(1);
  }
  const COOL = (275 * Math.PI) / 180, WARM = (88 * Math.PI) / 180;
  // One colour moved k steps (negative = darker) along a hue-shifted ramp.
  function shift(hex, k, dl, hs) {
    if (!k) return hex;
    let [L, a, b] = oklab(hex);
    const C = Math.hypot(a, b), tgt = k < 0 ? COOL : WARM, n = Math.abs(k);
    let h = Math.atan2(b, a), d = tgt - h;
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    h += d * Math.min(0.5, n * (hs == null ? 0.065 : hs));
    const C2 = C * (k < 0 ? 1 - 0.05 * n : 1 - 0.09 * n), tint = 0.006 * n;
    a = C2 * Math.cos(h) + Math.cos(tgt) * tint;
    b = C2 * Math.sin(h) + Math.sin(tgt) * tint;
    L = Math.max(0.06, Math.min(0.985, L + k * (dl || 0.06)));
    return fromOklab(L, a, b);
  }
  function ramp(hex, dl, hs) {
    return [-2, -1, 0, 1, 2].map((k) => shift(hex, k, dl, hs));
  }
  // source key, anchor index, anchors that set the step size
  const RAMPS = {
    grassR: ['grass', 0, [0, 2, 3]], dirtR: ['dirt', 0, [0, 2, 3]], stoneR: ['stone', 0, [0, 1, 2]], sandR: ['sand', 0, [0, 1, 2]],
    snowR: ['snow', 1, [0, 1, 2]], waterR: ['water', 0, [0, 1, 2]], woodR: ['wood', 0, [0, 2, 3]], floorR: ['floor', 0, [0, 1, 2]],
    wallR: ['wall', 1, [0, 1, 2]], roofR: ['roof', 1, [0, 1, 2]], leafR: ['leaf', 0, [0, 2, 3]], reedR: ['reed', 0, [0, 1, 2]],
  };
  function addRamps(p) {
    if (!p) return p;
    for (const k in RAMPS) {
      if (p[k]) continue;
      const [src, bi, an] = RAMPS[k], arr = p[src];
      if (!arr) continue;
      const Ls = an.map((i) => oklab(arr[i] || arr[0])[0]);
      const dl = Math.max(0.035, Math.min(0.085, (Math.max.apply(null, Ls) - Math.min.apply(null, Ls)) / 3));
      p[k] = ramp(arr[bi], dl);
    }
    return p;
  }
  for (const k in PAL) addRamps(PAL[k]);

  function px(c, x, y, w, h, col) {
    c.fillStyle = col;
    c.fillRect(x, y, w, h);
  }
  // Small deterministic hash for per-cell variation.
  function hh(x, y, k) {
    let h = (x * 374761393 + y * 668265263 + (k || 0) * 2246822519) >>> 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
    return (h ^ (h >>> 16)) >>> 0;
  }

  // Tile catalogue. walk: passable; water: for shore detection; anim: drawn per frame.
  const T = {};
  function def(id, props, draw) {
    T[id] = Object.assign({ id, walk: true, draw }, props);
  }

  function grassBase(c, x, y, p, h) {
    px(c, x, y, TS, TS, p.grass[0]);
    // mottled patches
    for (let i = 0; i < 6; i++) {
      const r = hh(h, i, 1);
      px(c, x + (r % 15), y + ((r >>> 5) % 15), 2, 1, p.grass[(r >>> 9) % 2 ? 1 : 3]);
    }
    if (h % 3 === 0) {
      // grass tuft
      const tx = x + 3 + (h % 9), ty = y + 4 + ((h >>> 4) % 8);
      px(c, tx, ty, 1, 2, p.grass[2]);
      px(c, tx + 2, ty - 1, 1, 3, p.grass[2]);
      px(c, tx + 1, ty + 1, 1, 1, p.grass[1]);
    }
  }
  def('grass', {}, (c, x, y, p, h) => grassBase(c, x, y, p, h));
  def('flowers', {}, (c, x, y, p, h) => {
    grassBase(c, x, y, p, h);
    for (let i = 0; i < 4; i++) {
      const r = hh(h, i, 7);
      const fx = x + 1 + (r % 13), fy = y + 1 + ((r >>> 6) % 13);
      px(c, fx, fy, 1, 1, p.flower[(r >>> 11) % 4]);
      px(c, fx, fy + 1, 1, 1, p.grass[3]);
    }
  });
  def('tallgrass', {}, (c, x, y, p, h) => {
    grassBase(c, x, y, p, h);
    for (let i = 0; i < 5; i++) {
      const bx = x + 1 + i * 3 + (hh(h, i) % 2);
      px(c, bx, y + 5, 1, 9, p.grass[3]);
      px(c, bx + 1, y + 3 + (i % 2), 1, 10, p.grass[2]);
    }
  });
  function pathLike(c, x, y, p, h, nb, cols, edgeCol, isSame) {
    px(c, x, y, TS, TS, cols[0]);
    for (let i = 0; i < 7; i++) {
      const r = hh(h, i, 3);
      px(c, x + (r % 15), y + ((r >>> 5) % 15), 1 + ((r >>> 10) % 2), 1, cols[(r >>> 12) % 2 ? 1 : 2]);
    }
    // ragged edges into grass
    const e = (dx, dy) => !isSame(nb(dx, dy));
    if (e(0, -1)) for (let i = 0; i < 16; i += 2) px(c, x + i, y, 2, 1 + (hh(h, i) % 2), edgeCol);
    if (e(0, 1)) for (let i = 0; i < 16; i += 2) px(c, x + i, y + 15 - (hh(h, i, 2) % 2), 2, 2, edgeCol);
    if (e(-1, 0)) for (let i = 0; i < 16; i += 2) px(c, x, y + i, 1 + (hh(h, i, 4) % 2), 2, edgeCol);
    if (e(1, 0)) for (let i = 0; i < 16; i += 2) px(c, x + 15 - (hh(h, i, 5) % 2), y + i, 2, 2, edgeCol);
  }
  def('path', {}, (c, x, y, p, h, nb) =>
    pathLike(c, x, y, p, h, nb, p.dirt, p.grass[0], (t) => t && (t.id === 'path' || t.id === 'bridgeH' || t.id === 'bridgeV' || !t.natural)));
  def('road', {}, (c, x, y, p, h) => {
    px(c, x, y, TS, TS, p.stone[2]);
    // cobbles in offset rows
    for (let row = 0; row < 4; row++) {
      const off = row % 2 ? 4 : 0;
      for (let col = -1; col < 3; col++) {
        const bx = x + col * 8 + off, by = y + row * 4;
        const cx = Math.max(bx, x), cw = Math.min(bx + 7, x + 16) - cx;
        if (cw > 0) {
          px(c, cx, by, cw, 3, p.stone[(hh(h, row * 4 + col) % 3 === 0) ? 1 : 0]);
          px(c, cx, by, cw, 1, p.stone[1]);
        }
      }
    }
  });
  def('sand', { natural: true }, (c, x, y, p, h) => {
    px(c, x, y, TS, TS, p.sand[0]);
    for (let i = 0; i < 6; i++) {
      const r = hh(h, i, 9);
      px(c, x + (r % 16), y + ((r >>> 5) % 16), 1, 1, p.sand[(r >>> 10) % 2 ? 1 : 2]);
    }
  });
  def('snow', { natural: true, step: 'step_snow' }, (c, x, y, p, h) => {
    px(c, x, y, TS, TS, p.snow[0]);
    for (let i = 0; i < 5; i++) {
      const r = hh(h, i, 11);
      px(c, x + (r % 15), y + ((r >>> 5) % 15), 2, 1, p.snow[(r >>> 10) % 2 ? 1 : 2]);
    }
  });
  function waterDraw(deep) {
    return (c, x, y, p, h, nb) => {
      px(c, x, y, TS, TS, deep ? p.water[0] : p.water[1]);
      for (let i = 0; i < 3; i++) {
        const r = hh(h, i, 13);
        px(c, x + (r % 12), y + 2 + ((r >>> 5) % 12), 3, 1, deep ? p.water[1] : p.water[2]);
      }
      // shore: light rim where land touches
      const land = (dx, dy) => {
        const t = nb(dx, dy);
        return t && !t.water && t.id !== 'bridgeH' && t.id !== 'bridgeV';
      };
      if (land(0, -1)) { px(c, x, y, TS, 2, p.water[3]); px(c, x, y + 2, TS, 1, p.water[2]); }
      if (land(-1, 0)) px(c, x, y, 1, TS, p.water[2]);
      if (land(1, 0)) px(c, x + 15, y, 1, TS, p.water[2]);
      if (land(0, 1)) px(c, x, y + 15, TS, 1, p.water[2]);
    };
  }
  def('water', { walk: false, water: true, anim: true }, waterDraw(true));
  def('shallow', { water: true, anim: true, step: 'splash' }, waterDraw(false));
  def('bridgeH', {}, (c, x, y, p) => {
    px(c, x, y, TS, TS, p.water[0]);
    px(c, x, y + 2, TS, 12, p.wood[1]);
    for (let i = 0; i < 16; i += 4) px(c, x + i, y + 2, 1, 12, p.wood[2]);
    px(c, x, y + 2, TS, 1, p.wood[3]);
    px(c, x, y + 13, TS, 1, p.wood[2]);
    px(c, x, y + 14, TS, 1, '#00000040');
  });
  def('bridgeV', {}, (c, x, y, p) => {
    px(c, x, y, TS, TS, p.water[0]);
    px(c, x + 2, y, 12, TS, p.wood[1]);
    for (let i = 0; i < 16; i += 4) px(c, x + 2, y + i, 12, 1, p.wood[2]);
    px(c, x + 2, y, 1, TS, p.wood[3]);
    px(c, x + 13, y, 1, TS, p.wood[2]);
  });
  def('wood', { natural: false, step: 'step_wood' }, (c, x, y, p, h) => {
    px(c, x, y, TS, TS, p.floor[0]);
    for (let r = 0; r < 4; r++) {
      px(c, x, y + r * 4 + 3, TS, 1, p.floor[2]);
      const seam = (hh(h, r) % 12) + 2;
      px(c, x + seam, y + r * 4, 1, 3, p.floor[1]);
    }
  });
  def('tatami', { natural: false }, (c, x, y, p, h) => {
    px(c, x, y, TS, TS, '#c9c28a');
    for (let r = 1; r < 16; r += 2) px(c, x, y + r, TS, 1, '#bab37c');
    px(c, x, y, TS, 1, '#6b5a3a');
    if (h % 2) px(c, x, y, 1, TS, '#6b5a3a');
  });
  def('stonefloor', { natural: false }, (c, x, y, p, h) => {
    px(c, x, y, TS, TS, p.stone[0]);
    px(c, x, y + 7, TS, 1, p.stone[2]);
    px(c, x + ((h % 2) ? 5 : 10), y, 1, 7, p.stone[2]);
    px(c, x + ((h % 2) ? 11 : 3), y + 8, 1, 8, p.stone[2]);
    px(c, x + 1, y + 1, 3, 1, p.stone[1]);
    px(c, x + 6, y + 9, 3, 1, p.stone[1]);
  });
  def('carpet', { natural: false }, (c, x, y, p, h, nb) => {
    px(c, x, y, TS, TS, '#8a3a3a');
    px(c, x, y + 7, TS, 2, '#a85a4a');
    const e = (dx, dy) => { const t = nb(dx, dy); return !t || t.id !== 'carpet'; };
    if (e(0, -1)) px(c, x, y, TS, 1, '#d8b060');
    if (e(0, 1)) px(c, x, y + 15, TS, 1, '#d8b060');
    if (e(-1, 0)) px(c, x, y, 1, TS, '#d8b060');
    if (e(1, 0)) px(c, x + 15, y, 1, TS, '#d8b060');
  });
  def('field', { natural: true }, (c, x, y, p, h) => {
    px(c, x, y, TS, TS, p.dirt[2]);
    for (let r = 0; r < 4; r++) {
      px(c, x, y + r * 4 + 1, TS, 2, p.dirt[0]);
      for (let i = 1; i < 16; i += 4) {
        px(c, x + i, y + r * 4, 2, 2, p.grass[(hh(h, r * 4 + i) % 3) ? 2 : 1]);
        px(c, x + i, y + r * 4 - 1, 1, 1, p.grass[2]);
      }
    }
  });
  def('ice', { natural: true }, (c, x, y, p, h) => {
    px(c, x, y, TS, TS, '#bcd8ea');
    px(c, x + 2 + (h % 6), y + 3, 6, 1, '#e8f4fc');
    px(c, x + 4, y + 10 + (h % 3), 5, 1, '#e8f4fc');
    px(c, x + 11, y + 6, 1, 4, '#9cc0d8');
  });
  def('glass', { natural: false }, (c, x, y, p, h) => {
    px(c, x, y, TS, TS, '#8fb8b0');
    px(c, x, y, TS, 1, '#c8e8e0');
    px(c, x, y, 1, TS, '#c8e8e0');
    px(c, x + 15, y, 1, TS, '#6a9088');
    px(c, x, y + 15, TS, 1, '#6a9088');
    if (h % 3 === 0) { px(c, x + 4, y + 4, 1, 3, '#f0fffa'); px(c, x + 5, y + 4, 2, 1, '#f0fffa'); }
  });
  def('ash', { natural: true }, (c, x, y, p, h) => {
    px(c, x, y, TS, TS, '#8a8480');
    for (let i = 0; i < 8; i++) {
      const r = hh(h, i, 21);
      px(c, x + (r % 16), y + ((r >>> 5) % 16), 1, 1, (r >>> 9) % 2 ? '#a09a94' : '#6e6864');
    }
  });
  def('paper', { natural: false }, (c, x, y, p, h) => {
    px(c, x, y, TS, TS, p.wall[0]);
    for (let r = 2; r < 16; r += 3) px(c, x + 1, y + r, 14, 1, p.wall[1]);
    if (h % 4 === 0) px(c, x + 3, y + 5, 6, 1, '#4a4660');
  });
  def('void', { walk: false, natural: false }, (c, x, y, p) => px(c, x, y, TS, TS, p.dark));
  def('darkwater', { walk: false, water: true, anim: true }, (c, x, y, p, h) => {
    px(c, x, y, TS, TS, p.dark);
    if (h % 5 === 0) px(c, x + (h % 12), y + 7, 3, 1, p.water[2]);
  });
  def('wall', { walk: false, natural: false }, (c, x, y, p, h, nb) => {
    // A wall seen from above if another wall is below, otherwise its face.
    const below = nb(0, 1);
    const face = !below || below.id !== 'wall';
    if (face) {
      px(c, x, y, TS, TS, p.wall[1]);
      px(c, x, y, TS, 2, p.wall[0]);
      px(c, x, y + 13, TS, 3, p.wall[2]);
      for (let i = 0; i < 16; i += 8) px(c, x + i + ((h % 2) * 4), y + 3, 1, 10, p.wall[2]);
    } else {
      px(c, x, y, TS, TS, p.roof[2]);
      px(c, x + 1, y + 1, 14, 14, p.roof[1]);
      if (h % 3 === 0) px(c, x + 3, y + 4, 4, 1, p.roof[0]);
    }
  });
  def('cliff', { walk: false, natural: true }, (c, x, y, p, h, nb) => {
    const below = nb(0, 1);
    const face = !below || below.id !== 'cliff';
    px(c, x, y, TS, TS, p.stone[face ? 2 : 0]);
    if (face) {
      px(c, x, y, TS, 3, p.grass[3]);
      for (let i = 0; i < 4; i++) px(c, x + i * 4 + (h % 3), y + 4 + (i % 2) * 4, 3, 1, p.stone[0]);
      px(c, x, y + 15, TS, 1, '#00000050');
    } else {
      px(c, x + 2, y + 3, 5, 2, p.stone[1]);
      px(c, x + 9, y + 9, 4, 2, p.stone[1]);
    }
  });

  // Map legend: terrain char -> {tile, prop}. Props with trees etc. sit on grass.
  const LEGEND = {
    '.': { tile: 'grass' }, ',': { tile: 'flowers' }, ';': { tile: 'tallgrass' },
    ':': { tile: 'path' }, '=': { tile: 'road' }, s: { tile: 'sand' }, '*': { tile: 'snow' },
    '~': { tile: 'water' }, w: { tile: 'shallow' }, b: { tile: 'bridgeH' }, B: { tile: 'bridgeV' },
    _: { tile: 'wood' }, '+': { tile: 'stonefloor' }, '#': { tile: 'wall' }, '^': { tile: 'cliff' },
    k: { tile: 'carpet' }, m: { tile: 'tatami' }, F: { tile: 'field' }, i: { tile: 'ice' },
    g: { tile: 'glass' }, a: { tile: 'ash' }, p: { tile: 'paper' }, x: { tile: 'void' }, d: { tile: 'darkwater' },
    ' ': { tile: 'void' },
    T: { tile: 'grass', prop: 'tree' }, P: { tile: 'snow', prop: 'pine' }, Q: { tile: 'grass', prop: 'pine' },
    o: { tile: 'grass', prop: 'bush' }, f: { tile: 'grass', prop: 'fence' }, '"': { tile: 'grass', prop: 'reeds' },
    r: { tile: 'grass', prop: 'rock' }, R: { tile: 'snow', prop: 'rock' }, l: { tile: 'wood', prop: 'shelf' },
    L: { tile: 'stonefloor', prop: 'shelf' }, O: { tile: 'grass', prop: 'orchard' }, t: { tile: 'path', prop: 'lamppost' },
    c: { tile: 'stonefloor', prop: 'crystal' }, h: { tile: 'sand', prop: 'rock' }, n: { tile: 'ash', prop: 'deadtree' },
  };

  return { TS, PAL, T, LEGEND, px, hh, ramp, shift, addRamps, oklab };
})();
