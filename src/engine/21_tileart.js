/* Ground tiles at art resolution: draw2 (32×32 art px) for every tile in
 * 20_tiles.js, and anim2 for water.
 *
 * How it works. Each tile is rendered into a 32×32 pixel buffer, then blitted
 * into the map's static layer. Materials (grass, earth, sand, snow, paving,
 * boards, water …) are functions of WORLD art-pixel position, so a texture,
 * a stamp or a shore shape that crosses a tile border continues seamlessly in
 * the next tile. Where soft ground meets lower ground (grass over a path, a
 * snow drift over paving), the higher material spills a few pixels over the
 * edge with an irregular, deterministic profile; the spilled edge is lit on
 * its upper/left side and casts a short shadow down/right (light comes from
 * the upper left). Water tiles draw their own banks: the land's material, a
 * lit brink or a bank face, foam and a light shallow band. Everything stays
 * inside the tile grid, so collisions are unchanged.
 *
 * Art rules: hue-shifted ramps from RB.tiles.addRamps (index 0 = darkest),
 * shading in clusters, no single-pixel random noise, variation only from
 * RB.tiles.hh hashes. Region character comes from STYLE (by palette name). */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const TL = RB.tiles;
  if (!TL) return;
  const T = TL.T, hh = TL.hh;
  const A = 32, N = A * A;

  // ---- colour ----------------------------------------------------------------------
  const UC = new Map();
  function u(hex) {
    let v = UC.get(hex);
    if (v === undefined) {
      const n = parseInt(hex.slice(1, 7), 16);
      v = (0xff000000 | ((n & 255) << 16) | (n & 0xff00) | (n >>> 16)) >>> 0;
      UC.set(hex, v);
    }
    return v;
  }
  function mixU(p, q, a) {
    const r = p & 255, g = (p >>> 8) & 255, b = (p >>> 16) & 255;
    return (0xff000000 | ((b + (((q >>> 16) & 255) - b) * a) << 16) | ((g + (((q >>> 8) & 255) - g) * a) << 8) | (r + ((q & 255) - r) * a)) >>> 0;
  }
  function mixHex(h1, h2, a) {
    const p = parseInt(h1.slice(1, 7), 16), q = parseInt(h2.slice(1, 7), 16);
    const ch = (s) => Math.round(((p >> s) & 255) + (((q >> s) & 255) - ((p >> s) & 255)) * a);
    return '#' + ((1 << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).slice(1);
  }
  const rampU = (hex, dl) => TL.ramp(hex, dl || 0.06).map(u);

  // ---- region character ------------------------------------------------------------------
  const STYLE = {
    reedwake: { grass: 'lush', path: 'earth', road: 'cobble', sand: 'river', water: 'river', wall: 'timber', floor: 'flags', field: 'sprout', tall: 'reed', carpet: '#8a3a3a', trim: '#d8b060', heri: '#34303e' },
    saltglass: { grass: 'dune', path: 'shell', road: 'flags', sand: 'beach', water: 'sea', wall: 'timber', floor: 'flags', field: 'sprout', tall: 'marram', carpet: '#35557e', trim: '#e6dcc0', heri: '#26344e', glassy: ['#7fd2c2', '#b6eee2', '#4fa6b0'] },
    cinder: { grass: 'autumn', path: 'clay', road: 'brick', sand: 'river', water: 'river', wall: 'timber', floor: 'brick', field: 'stubble', tall: 'susuki', carpet: '#8a4a2a', trim: '#e0b060', heri: '#42261e' },
    snowbell: { grass: 'snow', path: 'frozen', road: 'setts', sand: 'river', water: 'cold', wall: 'timber', floor: 'flags', field: 'snow', tall: 'frost', carpet: '#5a3448', trim: '#d8c8a0', heri: '#262636' },
    lanternfall: { grass: 'lawn', path: 'gravel', road: 'slab', sand: 'river', water: 'canal', wall: 'timber', floor: 'slab', field: 'bed', tall: 'plume', carpet: '#56386a', trim: '#e8c070', heri: '#28223e', lantern: '#f2c46a' },
    archive: { grass: 'moss', path: 'silt', road: 'wet', sand: 'river', water: 'drowned', wall: 'stone', floor: 'wet', field: 'grey', tall: 'reed', carpet: '#2c3a6a', trim: '#c8b880', heri: '#181a2e' },
    atlas: { grass: 'paper', path: 'earth', road: 'ink', sand: 'river', water: 'still', wall: 'timber', floor: 'ink', field: 'stubble', tall: 'marram', carpet: '#8a4a3a', trim: '#e0c890', heri: '#3a3024', ink: '#5e4c3a' },
    sa_mount: { grass: 'alpine', path: 'scree', road: 'rough', sand: 'river', water: 'cold', wall: 'timber', floor: 'flags', field: 'grey', tall: 'frost', carpet: '#5a4050', trim: '#d0c090', heri: '#2a2a36' },
    sa_still: { grass: 'ashmoss', path: 'dust', road: 'ashlar', sand: 'river', water: 'still', wall: 'stone', floor: 'ashlar', field: 'grey', tall: 'reed', carpet: '#3a4462', trim: '#d8d0b0', heri: '#22243a' },
  };
  const BASE_STYLE = STYLE.reedwake;
  function nameOf(pal) {
    for (const k in TL.PAL) if (TL.PAL[k] === pal && k !== 'interior') return k;
    return '';
  }

  // Per-palette kit: ramps as packed pixels, hex ramps for the animation layer.
  const kits = new WeakMap();
  function kit(pal) {
    let K = kits.get(pal);
    if (K) return K;
    TL.addRamps(pal);
    const name = nameOf(pal);
    const st = Object.assign({}, BASE_STYLE, STYLE[name] || {});
    const R = (a) => a.map(u);
    const shade = mixHex(pal.dark, '#2a2050', 0.45);
    K = {
      pal, name, st,
      g: R(pal.grassR), d: R(pal.dirtR), s: R(pal.stoneR), sa: R(pal.sandR), sn: R(pal.snowR), w: R(pal.waterR),
      wd: R(pal.woodR), fl: R(pal.floorR), wl: R(pal.wallR), rf: R(pal.roofR), lf: R(pal.leafR), rd: R(pal.reedR),
      fw: pal.flower.map(u), foam: u(pal.water[3]), dark: u(pal.dark), shade: u(shade), light: u('#fff4d6'),
      sh: rampU(mixHex(pal.water[1], pal.sand[0], 0.22), 0.05),
      dw: rampU(mixHex(pal.dark, pal.water[0], 0.3), 0.035),
      ash: rampU(name === 'atlas' ? '#a09a90' : '#8a8480', 0.055), ice: rampU('#b4d2e6', 0.05), gl: rampU('#86b4ac', 0.06),
      ta: rampU(name === 'snowbell' || name === 'sa_still' ? '#c2c08e' : '#c9c28a', 0.045), heri: rampU(st.heri, 0.05),
      cp: rampU(st.carpet, 0.06), cinder: rampU('#4a4442', 0.05), trim: rampU(st.trim, 0.06), brick: rampU('#9c6450', 0.055),
      paper: rampU(pal.wall[0], 0.04), inkU: u(st.ink || '#4a4660'),
      acc: (st.glassy || ['#e8e0c8', '#f4ecd8', '#c8bca0']).map(u),
      lantern: u(st.lantern || '#f2d08a'), wet: u(mixHex(pal.water[1], pal.water[2], 0.5)),
      hex: { w: pal.waterR, dw: TL.ramp(mixHex(pal.dark, pal.water[0], 0.3), 0.035), foam: pal.water[3], lantern: st.lantern || null },
    };
    kits.set(pal, K);
    return K;
  }

  // ---- buffers ----------------------------------------------------------------------------
  let B = new Uint32Array(N); // pixels of the tile being drawn
  const S = new Uint8Array(N); // material slot per pixel (0 = the tile's own)
  const TI = new Uint8Array(N); // tone scratch
  const F = new Float32Array(40 * 40), G = new Float32Array(40 * 40); // noise scratch
  const D = new Float32Array(N); // distance scratch (shores)
  const SD = new Uint8Array(N);
  const PR = new Float32Array(A);
  const DEP = [new Float32Array(A), new Float32Array(A), new Float32Array(A), new Float32Array(A)];
  // Output. A static-layer build draws tiles row by row, so each tile is
  // written into a strip one tile tall and as wide as the target canvas, and
  // the strip is blitted when its row is done: one putImageData per row
  // instead of one per tile. The strip's untouched pixels are transparent, so
  // tiles drawn by other code in the same row stay as they are. A row is done
  // at the canvas edge, or when no later tile in it is drawn here, or when the
  // next tile goes to another row or canvas; a microtask flushes anything left.
  let one = null, oneC = null, oneImg = null;
  let strip = null, sc = null, simg = null, sv = null, sW = 0;
  let pend = null, pendY = 0, pendW = 0, queued = false;
  const mine = (t) => !!(t && t.draw2 && t.draw2.tileArt);
  function flush() {
    queued = false;
    if (!pend) return;
    sc.putImageData(simg, 0, 0, 0, 0, pendW, A);
    pend.drawImage(strip, 0, 0, pendW, A, 0, pendY, pendW, A);
    sv.fill(0);
    pend = null;
  }
  function out(c, x, y) {
    const cw = (c.canvas && c.canvas.width) | 0;
    if (!cw || x < 0 || x + A > cw || (x | 0) !== x || (y | 0) !== y) {
      if (pend) flush();
      if (!one) { one = RB.sprites.makeCanvas(A, A); oneC = one.getContext('2d'); oneImg = oneC.createImageData(A, A); oneImg.v = new Uint32Array(oneImg.data.buffer); }
      oneImg.v.set(B);
      oneC.putImageData(oneImg, 0, 0);
      c.drawImage(one, x, y);
      return;
    }
    if (pend && (pend !== c || pendY !== y)) flush();
    if (cw > sW) {
      sW = cw;
      strip = RB.sprites.makeCanvas(sW, A);
      sc = strip.getContext('2d');
      simg = sc.createImageData(sW, A);
      sv = new Uint32Array(simg.data.buffer);
    }
    for (let r = 0, k = 0; r < A; r++) for (let o = r * sW + x, e = o + A; o < e; ) sv[o++] = B[k++];
    pend = c; pendY = y; pendW = cw;
    let done = x + A >= cw;
    if (!done && NB && !mine(NB(1, 0))) {
      done = true;
      for (let k = 2; k < 400; k++) { const t = NB(k, 0); if (!t) break; if (mine(t)) { done = false; break; } }
    }
    if (done) flush();
    else if (!queued) { queued = true; Promise.resolve().then(flush); }
  }

  // ---- per-tile state -----------------------------------------------------------------------
  let K = null, OX = 0, OY = 0, TX = 0, TY = 0, NB = null, SELF = null;
  const N8 = new Array(8), K8 = new Array(8); // neighbour tiles (null -> self) and kinds
  const DX8 = [0, 1, 1, 1, 0, -1, -1, -1], DY8 = [-1, -1, 0, 1, 1, 1, 0, -1];
  // slots: kind per slot, level per slot
  const SK = [], SL = [];
  let NS = 1;

  const KIND = {
    grass: 'veg', flowers: 'veg', tallgrass: 'veg', path: 'dirt', road: 'road', sand: 'sand', snow: 'snow',
    water: 'water', shallow: 'shallow', darkwater: 'dark', bridgeH: 'bridge', bridgeV: 'bridge',
    wood: 'wood', tatami: 'tatami', stonefloor: 'stone', carpet: 'carpet', paper: 'paper', glass: 'glass',
    field: 'field', ice: 'ice', ash: 'ash', void: 'void', wall: 'wall', cliff: 'cliff',
  };
  const kindOf = (t) => (t ? KIND[t.id] || 'other' : 'other');
  const WET = { water: 1, shallow: 1, dark: 1, bridge: 1 };
  const FLOORISH = { wood: 1, tatami: 1, stone: 1, carpet: 1, paper: 1, glass: 1 };
  // soft ground that spills over the edge of lower ground (higher wins) …
  const SPILL = { sand: 1, dirt: 2, field: 2, ash: 3.5, veg: 4, snow: 5 };
  // … and what each kind lets spill over it
  const RECV = { sand: 1, dirt: 2, field: 2, ash: 3.5, veg: 4, snow: 5, road: 3, stone: 3, ice: 0, glass: 3, wood: 3 };
  // floors that only take some spills (ash drifts over a glass or board floor; grass does not)
  const ONLY = { glass: { ash: 1 }, wood: { ash: 1, snow: 1 } };
  // spill edge profiles: depth base/amplitude (px), lattice cell, blade spikes, rim ramp steps, cast shadow
  const SPR = {
    veg: { seed: 1, base: 3, amp: 2.2, cell: 5, spike: true, shade: 1, lit: 3, cast: 0.34 },
    snow: { seed: 2, base: 4, amp: 3, cell: 9, spike: false, shade: 2, lit: 4, cast: 0.26 },
    dirt: { seed: 3, base: 2.5, amp: 1.8, cell: 6, spike: false, shade: 1, lit: 3, cast: 0.14 },
    ash: { seed: 4, base: 3.5, amp: 2.5, cell: 7, spike: false, shade: 1, lit: 3, cast: 0.1 },
    field: { seed: 5, base: 2, amp: 1, cell: 8, spike: false, shade: 1, lit: 3, cast: 0.12 },
    sand: { seed: 6, base: 3, amp: 2, cell: 8, spike: false, shade: 1, lit: 4, cast: 0.1 },
    def: { seed: 7, base: 3, amp: 2, cell: 6, spike: false, shade: 1, lit: 3, cast: 0.2 },
  };

  function begin(tile, pal, h, nb, x, y, tx, ty) {
    K = kit(pal);
    TX = tx == null ? Math.round(x / A) : tx;
    TY = ty == null ? Math.round(y / A) : ty;
    OX = TX * A; OY = TY * A; NB = nb; SELF = tile;
    for (let d = 0; d < 8; d++) {
      const t = nb ? nb(DX8[d], DY8[d]) : null;
      N8[d] = t || tile;
      K8[d] = kindOf(N8[d]);
    }
    S.fill(0);
    fullRegion();
    EX0 = 32; EY0 = 32; EX1 = -1; EY1 = -1;
    SK.length = 0; SL.length = 0;
    SK.push(KIND[tile.id]); SL.push(RECV[KIND[tile.id]] == null ? 0 : RECV[KIND[tile.id]]);
    NS = 1;
  }
  // Pixels of the slot being filled and their bounding box, so a material
  // that covers only a fringe or a corner costs only that much.
  const IDX = new Int16Array(N);
  let NI = 0, RX0 = 0, RY0 = 0, RX1 = 31, RY1 = 31;
  const ALL = new Int16Array(N).map((v, i) => i);
  function select(slot) {
    if (NS === 1 && slot === 0) { IDX.set(ALL); NI = N; RX0 = 0; RY0 = 0; RX1 = 31; RY1 = 31; return true; }
    NI = 0;
    let x0 = 32, y0 = 32, x1 = -1, y1 = -1;
    for (let i = 0; i < N; i++) {
      if (S[i] !== slot) continue;
      IDX[NI++] = i;
      const x = i & 31, y = i >> 5;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      y1 = y;
    }
    RX0 = x0; RY0 = y0; RX1 = x1; RY1 = y1;
    return NI > 0;
  }
  function fullRegion() { RX0 = 0; RY0 = 0; RX1 = 31; RY1 = 31; }
  // box around pixels given to other slots (edge passes only look there)
  let EX0 = 32, EY0 = 32, EX1 = -1, EY1 = -1;
  function mark(i) {
    const x = i & 31, y = i >> 5;
    if (x < EX0) EX0 = x;
    if (x > EX1) EX1 = x;
    if (y < EY0) EY0 = y;
    if (y > EY1) EY1 = y;
  }
  function slotOf(kind) {
    for (let i = 1; i < NS; i++) if (SK[i] === kind) return i;
    SK.push(kind); SL.push(SPILL[kind] == null ? 1 : SPILL[kind]);
    return NS++;
  }
  // id of the tile that holds world art pixel (wx, wy), within the 3×3 neighbourhood
  function idAt(wx, wy) {
    const dx = Math.floor(wx / A) - TX, dy = Math.floor(wy / A) - TY;
    if (!dx && !dy) return SELF.id;
    for (let d = 0; d < 8; d++) if (DX8[d] === dx && DY8[d] === dy) return N8[d].id;
    return null;
  }

  // ---- value noise (world-anchored, bilinear with smoothstep) ---------------------------------
  const LAT = new Float32Array(48 * 48), CX = new Int32Array(40), CF = new Float32Array(40), COLV = new Float32Array(48);
  const LAT2 = new Float32Array(48 * 48), CX2 = new Int32Array(40), CF2 = new Float32Array(40), COLV2 = new Float32Array(48);
  const LY = { iy0: 0, nw: 0 }, LY2 = { iy0: 0, nw: 0 };
  // lattice values and per-column weights for one octave over the tile area
  function lattice(L, cx, cf, W, Hh, ox, oy, sx, sy, seed, wgt, meta) {
    const ix0 = Math.floor(ox / sx), ix1 = Math.floor((ox + W - 1) / sx) + 1;
    const iy0 = Math.floor(oy / sy), iy1 = Math.floor((oy + Hh - 1) / sy) + 1;
    const nw = ix1 - ix0 + 1;
    for (let j = iy0; j <= iy1; j++) for (let i = ix0; i <= ix1; i++) L[(j - iy0) * nw + (i - ix0)] = ((hh(i, j, seed) & 1023) / 1023) * wgt;
    for (let x = 0; x < W; x++) { const w = (ox + x) / sx, i = Math.floor(w), f = w - i; cx[x] = i - ix0; cf[x] = f * f * (3 - 2 * f); }
    meta.iy0 = iy0; meta.nw = nw;
  }
  function rowCols(L, colv, meta, oyr, sy) {
    const w = oyr / sy, j = Math.floor(w);
    let f = w - j; f = f * f * (3 - 2 * f);
    const r0 = (j - meta.iy0) * meta.nw, r1 = r0 + meta.nw;
    for (let c = 0; c < meta.nw; c++) colv[c] = L[r0 + c] + (L[r1 + c] - L[r0 + c]) * f;
  }
  function noise(out, W, Hh, x0, y0, sx, sy, seed, wgt, add) {
    const ox = OX + x0, oy = OY + y0;
    lattice(LAT, CX, CF, W, Hh, ox, oy, sx, sy, seed, wgt, LY);
    const r0 = RY0, r1 = Math.min(Hh - 1, RY1 + Hh - A), c0 = RX0, c1 = Math.min(W - 1, RX1 + W - A);
    for (let r = r0; r <= r1; r++) {
      rowCols(LAT, COLV, LY, oy + r, sy);
      const o = r * W;
      if (add) for (let x = c0; x <= c1; x++) { const c = CX[x], a = COLV[c]; out[o + x] += a + (COLV[c + 1] - a) * CF[x]; }
      else for (let x = c0; x <= c1; x++) { const c = CX[x], a = COLV[c]; out[o + x] = a + (COLV[c + 1] - a) * CF[x]; }
    }
  }
  // two octaves in one pass (W×Hh from the tile origin)
  function noise2(out, W, Hh, sx1, sy1, sx2, sy2, seed, w2) {
    const a1 = 1 / (1 + w2), a2 = w2 / (1 + w2);
    lattice(LAT, CX, CF, W, Hh, OX, OY, sx1, sy1, seed, a1, LY);
    lattice(LAT2, CX2, CF2, W, Hh, OX, OY, sx2, sy2, seed + 17, a2, LY2);
    const c0 = RX0, c1 = Math.min(W - 1, RX1 + W - A);
    for (let r = RY0, r1 = Math.min(Hh - 1, RY1 + Hh - A); r <= r1; r++) {
      rowCols(LAT, COLV, LY, OY + r, sy1);
      rowCols(LAT2, COLV2, LY2, OY + r, sy2);
      const o = r * W;
      for (let x = c0; x <= c1; x++) {
        const c = CX[x], a = COLV[c], d = CX2[x], b = COLV2[d];
        out[o + x] = a + (COLV[c + 1] - a) * CF[x] + b + (COLV2[d + 1] - b) * CF2[x];
      }
    }
  }
  // two-octave field over the tile, normalised to 0..1
  function field(out, s1, s2, seed, w2) {
    noise2(out, A, A, s1, s1, s2, s2, seed, w2);
  }
  // remove lone pixels from a tone map (keeps clusters ≥ 2 px)
  function despeckle(slot) {
    for (let y = RY0; y <= RY1; y++) for (let x = RX0; x <= RX1; x++) {
      const i = y * A + x;
      if (S[i] !== slot) continue;
      const t = TI[i];
      const l = x ? TI[i - 1] : t, r = x < 31 ? TI[i + 1] : t, up = y ? TI[i - A] : t, dn = y < 31 ? TI[i + A] : t;
      if (l !== t && r !== t && up !== t && dn !== t) TI[i] = x ? l : r;
    }
  }

  // ---- stamps ------------------------------------------------------------------------------------
  // Rows of chars: 0-4 ramp step, A-E second ramp, a-d accents, s shadow, h highlight, . empty.
  // The anchor is the bottom-centre unless given.
  const CODE = { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, a: 5, b: 6, c: 7, d: 8, s: 9, A: 10, B: 11, C: 12, D: 13, E: 14, h: 15 };
  function stp(rows, ax, ay) {
    const px = [], h = rows.length, w = rows[0].length;
    ax = ax == null ? w >> 1 : ax; ay = ay == null ? h - 1 : ay;
    rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) if (r[x] !== '.') px.push(x - ax, y - ay, CODE[r[x]]); });
    return px;
  }
  let R1 = null, R2 = null, AC = null;
  function put(i, code) {
    if (code < 5) B[i] = R1[code];
    else if (code < 9) B[i] = AC[code - 5];
    else if (code === 9) B[i] = mixU(B[i], K.shade, 0.3);
    else if (code === 15) B[i] = mixU(B[i], K.light, 0.3);
    else B[i] = R2[code - 10];
  }
  function stamp(px, x0, y0, slot) {
    for (let k = 0; k < px.length; k += 3) {
      const x = x0 + px[k], y = y0 + px[k + 1];
      if (x < 0 || y < 0 || x >= A || y >= A) continue;
      const i = y * A + x;
      if (slot >= 0 && S[i] !== slot) continue;
      put(i, px[k + 2]);
    }
  }
  // One candidate per world cell; anchors in neighbouring tiles still draw
  // their overlapping pixels, so stamps continue across borders.
  function scatter(slot, cell, seed, dens, list, ramp, ramp2, acc, accept) {
    R1 = ramp; R2 = ramp2 || ramp; AC = acc || K.fw;
    const cx0 = Math.floor((OX + RX0 - 10) / cell), cx1 = Math.floor((OX + RX1 + 10) / cell);
    const cy0 = Math.floor((OY + RY0 - 3) / cell), cy1 = Math.floor((OY + RY1 + 18) / cell);
    for (let cy = cy0; cy <= cy1; cy++) for (let cx = cx0; cx <= cx1; cx++) {
      const r = hh(cx, cy, seed);
      if ((r & 1023) >= dens) continue;
      const wx = cx * cell + ((r >>> 10) % cell), wy = cy * cell + ((r >>> 15) % cell);
      if (accept && !accept(wx, wy, r)) continue;
      stamp(list[(r >>> 21) % list.length], wx - OX, wy - OY, slot);
    }
  }
  // tiny deterministic generator for building stamp sets once
  function gen(seed) {
    let s = seed >>> 0;
    return () => { s = (Math.imul(s ^ (s >>> 15), 2246822507) + 0x9e3779b9) >>> 0; return s / 4294967296; };
  }
  // A tuft of blades: dark base, lit tips, outer blades lean out, soft shadow at the foot.
  function tuft(seed, n, hmin, hmax, spread, alt) {
    const r = gen(seed), px = [], o = alt ? 10 : 0;
    const mid = (n - 1) / 2;
    for (let b = 0; b < n; b++) {
      let x = Math.round((b - mid) * spread + (r() - 0.5) * 0.8);
      const h = hmin + Math.floor(r() * (hmax - hmin + 1)) - Math.round(Math.abs(b - mid) * 0.7);
      const lean = b < mid - 0.1 ? -1 : b > mid + 0.1 ? 1 : 0;
      const bend = Math.max(1, Math.floor(h * 0.55));
      for (let k = 0; k < Math.max(2, h); k++) {
        const t = k / Math.max(1, h - 1);
        const idx = t > 0.8 ? 4 : t > 0.5 ? 3 : t > 0.2 ? 2 : 1;
        px.push(x, -k, o + (lean > 0 && idx > 2 ? idx - 1 : idx));
        if (lean && k === bend) x += lean;
      }
    }
    // shadow at the foot, to the lower right
    const xs = px.filter((v, i) => i % 3 === 0 && px[i + 1] === 0);
    const lo = Math.min.apply(null, xs), hi = Math.max.apply(null, xs);
    for (let x = lo; x <= hi + 1; x++) px.push(x, 1, 9);
    return px;
  }
  // A clump of tall blades fanning out from a dark base; outer blades bend
  // further, shaded on the right; some kinds carry heads (cattails, plumes).
  function clump(seed, n, hmin, hmax, fan, alt, head) {
    const r = gen(seed), px = [], o = alt ? 10 : 0, mid = (n - 1) / 2;
    for (let b = 0; b < n; b++) {
      const a = mid ? (b - mid) / mid : 0, lean = a * fan + (r() - 0.5) * 0.25;
      const h = Math.max(4, Math.round(hmin + r() * (hmax - hmin) - Math.abs(a) * 2));
      const x0 = Math.round((b - mid) * 0.7);
      let x = x0;
      for (let k = 0; k < h; k++) {
        const t = k / (h - 1);
        x = x0 + Math.round((lean * k * k) / h);
        let idx = t < 0.22 ? 1 : t < 0.55 ? 2 : t < 0.82 ? 3 : 4;
        if (lean > 0.25 && idx > 1) idx--;
        px.push(x, -k, o + idx);
      }
      if (head && b % 2 === 0) {
        if (head === 'cattail') px.push(x, -h, 11, x, -h - 1, 11, x, -h - 2, 12, x, -h - 3, 12, x, -h - 4, 3);
        else px.push(x, -h, 14, x, -h - 1, 15, x - 1, -h + 1, 13, x + 1, -h + 1, 13, x + (lean > 0 ? 1 : -1), -h - 2, 14);
      }
    }
    for (let x = -2; x <= 2; x++) px.push(x, 0, x < 0 ? 1 : 0);
    for (let x = -1; x <= 3; x++) px.push(x, 1, 9);
    return px;
  }
  const TUFTS = {};
  function tufts(key) {
    if (TUFTS[key]) return TUFTS[key];
    const list = [];
    const tall = { tall: [6, 8, 12, 0.35, 0, ''], reed: [5, 10, 14, 0.25, 0, 'cattail'], susuki: [6, 9, 13, 0.45, 1, 'plume'], frost: [4, 6, 9, 0.4, 1, ''],
      plume: [6, 8, 11, 0.4, 0, 'plume'], marram: [5, 8, 12, 0.55, 1, ''] }[key];
    if (tall) {
      for (let i = 0; i < 6; i++) list.push(clump(hh(i, key.length, 97) ^ key.charCodeAt(1), tall[0] - (i % 3 === 2 ? 1 : 0), tall[1], tall[2], tall[3], tall[4], tall[5]));
      return (TUFTS[key] = list);
    }
    const spec = { lush: [4, 3, 5, 1.6], dry: [3, 4, 6, 1.7], short: [3, 2, 3, 1.4], dune: [3, 4, 7, 1.5], stalk: [2, 4, 6, 2], fern: [3, 2, 4, 1.3] }[key] || [3, 3, 5, 1.5];
    const alt = key === 'dry' || key === 'stalk';
    for (let i = 0; i < 6; i++) list.push(tuft(hh(i, key.length, 99) ^ key.charCodeAt(0), spec[0] - (i % 2), spec[1], spec[2], spec[3], alt));
    return (TUFTS[key] = list);
  }
  const ST = {
    clover: [stp(['.33.', '3443', '.23.'], 1, 2), stp(['.3.', '343', '.2.'], 1, 2)],
    pebble: [stp(['.DD.', 'DCCB', '.BBs'], 1, 2), stp(['DC.', 'CBs'], 1, 1), stp(['.DDC.', 'DCCCB', '.BBBs'], 2, 2)],
    stone2: [stp(['DC', 'Bs'], 0, 1), stp(['.D.', 'DCB', '.s.'], 1, 2)],
    leaf: [stp(['.DE', 'CDs'], 1, 1), stp(['CD.', 'sCD'], 1, 1), stp(['.E.', 'CDC', '.s.'], 1, 2)],
    crack: [stp(['11......', '..11....', '....111.', '.......1'], 0, 0), stp(['1.......', '.11.....', '...1111.', '....1..1'], 0, 0)],
    shell: [stp(['.ab', 'abb', 'ss.'], 1, 1), stp(['ab.', 'bbs'], 1, 1), stp(['.a.', 'aba', '.s.'], 1, 1)],
    glassy: [stp(['.ab', 'abc', '.cs'], 1, 1), stp(['ab.', 'bcc', '.s.'], 1, 1), stp(['.b', 'ac', 'cs'], 0, 1)],
    shard: [stp(['.DE', 'CCs'], 1, 1), stp(['DD', 'Cs'], 0, 1)],
    frost: [stp(['.334.', '34443', '.3443', '..33.'], 2, 1), stp(['.33..', '34443', '.333.'], 2, 1)],
    puddle: [stp(['.AAA.', 'ABBBA', '.AAA.'], 2, 1), stp(['.AA.', 'ABBA', '.AA.'], 1, 1)],
    gravel: [stp(['DC', 'BA'], 0, 0), stp(['C.', 'BA'], 0, 0), stp(['.C', 'CA'], 0, 0), stp(['CBA'], 0, 0)],
    sparkle: [stp(['.4.', '4h4', '.4.'], 1, 1), stp(['h4'], 0, 0)],
    twig: [stp(['AA....', '..AAAA'], 0, 0), stp(['AAA...', '...BBB'], 0, 0)],
    lump: [stp(['.CD.', 'BCCB', 'ABBA', '.ss.'], 1, 2), stp(['.CC.', 'BBCB', '.AAs'], 1, 1), stp(['CD.', 'BCB', 'sAs'], 1, 1)],
    flake: [stp(['.4.', '443', '.3.'], 1, 1), stp(['44.', '.43'], 0, 0)],
    ember: [stp(['.BC.', 'AaBA', '.AA.'], 1, 1)],
    scrap: [stp(['aaab', 'abbb', '.sss'], 1, 0), stp(['aab.', 'abbb', 'bbs.'], 1, 0)],
    moss: [stp(['.33.', '3443', '2332', '.22.'], 1, 2), stp(['.3.', '343', '.2.'], 1, 1)],
    flower: [stp(['.a.', 'abc', '.c.', '.1.'], 1, 3), stp(['a.', 'bc', '1.'], 0, 2), stp(['.a..', 'abc.', '.c1a', '..bc'], 1, 3)],
  };

  // ---- edge profiles -------------------------------------------------------------------------
  // Depth (px) of an irregular edge along one side of the tile. The value noise
  // is keyed by the world line the edge lies on, so neighbouring tiles agree.
  function profile(out, side, seed, base, amp, cell, spike) {
    const hor = (side & 1) === 0;
    const line = side === 0 ? TY : side === 2 ? TY + 1 : side === 3 ? TX : TX + 1;
    const o = hor ? OX : OY, key = (hor ? 7919 : 104729) + seed * 31;
    for (let a = 0; a < A; a++) {
      const w = o + a, k = Math.floor(w / cell), f = w / cell - k, s = f * f * (3 - 2 * f);
      const v0 = hh(k, line, key) & 255, v1 = hh(k + 1, line, key) & 255;
      let d = base + ((v0 + (v1 - v0) * s) / 255 - 0.5) * 2 * amp;
      if (spike) { const r = hh(w, line, key + 1) & 15; if (r === 0) d += 2; else if (r === 1) d += 1; }
      out[a] = Math.max(1, Math.round(d));
    }
  }
  // pixel index for (along, depth) measured from a side (0 N, 1 E, 2 S, 3 W)
  const sidePix = (s, a, d) => (s === 0 ? d * A + a : s === 2 ? (31 - d) * A + a : s === 3 ? a * A + d : a * A + 31 - d);

  // Soft ground from the sides and corners spills over this tile's edge.
  // Spill level of a neighbouring kind onto this tile (null: it does not
  // spill). Ice is lower than everything: floors and paving edge it too.
  function lvlOn(k) {
    if (SPILL[k] != null) return SPILL[k];
    return SK[0] === 'ice' && (k === 'road' || k === 'stone' || FLOORISH[k]) ? 1 : null;
  }
  const cornerRad = (cx, cy) => 7 + (hh(cx, cy, 79) % 4);
  // Does the tile across side s round its corner at this end (lo: toward the
  // lower along-coordinate)? It does when it spills onto us and the tiles on
  // both sides of that corner are our kind too (see roundCorners).
  function rounds(s, lo) {
    const own = SK[0];
    const perp = s === 0 || s === 2 ? (lo ? 6 : 2) : lo ? 0 : 4; // side toward that end
    const diag = s === 0 ? (lo ? 7 : 1) : s === 2 ? (lo ? 5 : 3) : s === 3 ? (lo ? 7 : 5) : lo ? 1 : 3;
    return K8[perp] === own && K8[diag] === own;
  }
  function spills() {
    const po = SL[0];
    if (RECV[SK[0]] == null) return;
    const only = ONLY[SK[0]];
    for (let s = 0; s < 4; s++) {
      const k = K8[s * 2], p = lvlOn(k);
      if (p == null || p <= po || (only && !only[k])) continue;
      const P = SPR[k] || SPR.def;
      profile(PR, s, P.seed, P.base, P.amp, P.cell, P.spike);
      // taper where the spilling tile rounds its corner away
      if (SPILL[k] != null) {
        const hor = (s & 1) === 0;
        const cLo = hor ? cornerRad(TX, s === 0 ? TY : TY + 1) : cornerRad(s === 3 ? TX : TX + 1, TY);
        const cHi = hor ? cornerRad(TX + 1, s === 0 ? TY : TY + 1) : cornerRad(s === 3 ? TX : TX + 1, TY + 1);
        const tLo = rounds(s, true), tHi = rounds(s, false);
        for (let a = 0; a < A; a++) {
          if (tLo) PR[a] = Math.min(PR[a], Math.max(0, Math.floor((a - cLo + Math.sqrt(cLo) + 0.5) * 0.9)));
          if (tHi) PR[a] = Math.min(PR[a], Math.max(0, Math.floor((31 - a - cHi + Math.sqrt(cHi) + 0.5) * 0.9)));
        }
      }
      const sl = slotOf(k);
      SL[sl] = Math.max(SL[sl], p);
      for (let a = 0; a < A; a++) for (let d = 0, n = PR[a]; d < n; d++) {
        const i = sidePix(s, a, d);
        if (SL[S[i]] < p) { S[i] = sl; mark(i); }
      }
    }
    for (let c = 0; c < 4; c++) {
      const k = K8[c * 2 + 1], p = lvlOn(k);
      if (p == null || p <= po || (only && !only[k]) || K8[c * 2] === k || K8[(c * 2 + 2) % 8] === k) continue;
      // no nub where that tile rounds its corner away from us
      if (SPILL[k] != null && K8[c * 2] === SK[0] && K8[(c * 2 + 2) % 8] === SK[0]) continue;
      const cxw = c === 0 || c === 1 ? TX + 1 : TX, cyw = c === 1 || c === 2 ? TY + 1 : TY;
      const rad = (SPR[k] || SPR.def).base + 1.5 + (hh(cxw, cyw, 77) % 3);
      const sl = slotOf(k), px0 = c === 0 || c === 1 ? 31 : 0, py0 = c === 1 || c === 2 ? 31 : 0;
      SL[sl] = Math.max(SL[sl], p);
      for (let y = 0; y < 9; y++) for (let x = 0; x < 9; x++) {
        if (x * x + y * y >= rad * rad) continue;
        const i = (py0 ? 31 - y : y) * A + (px0 ? 31 - x : x);
        if (SL[S[i]] < p) { S[i] = sl; mark(i); }
      }
    }
  }
  // A patch of soft ground rounds its outer corners where lower ground wraps
  // around it (both sides and the diagonal), so single tiles read as patches.
  function roundCorners() {
    const own = SK[0], p = SPILL[own];
    if (p == null) return;
    for (let c = 0; c < 4; c++) {
      const kA = K8[c * 2], kB = K8[(c * 2 + 2) % 8], kD = K8[c * 2 + 1];
      if (kA !== kB || kA !== kD || WET[kA] || kA === 'other' || kA === 'void' || kA === 'wall' || kA === 'cliff') continue;
      const q = SPILL[kA] != null ? SPILL[kA] : RECV[kA] != null ? RECV[kA] : FLOORISH[kA] ? 0 : null;
      if (q == null || q >= p || lvlSpillsBack(kA)) continue;
      const cxw = c === 0 || c === 1 ? TX + 1 : TX, cyw = c === 1 || c === 2 ? TY + 1 : TY, rad = cornerRad(cxw, cyw);
      const sl = slotOf(kA), px0 = c === 0 || c === 1 ? 31 : 0, py0 = c === 1 || c === 2 ? 31 : 0;
      SL[sl] = Math.min(SL[sl], q);
      for (let yy = 0; yy < rad; yy++) for (let xx = 0; xx < rad; xx++) {
        const dx = rad - xx - 0.5, dy = rad - yy - 0.5;
        if (dx * dx + dy * dy <= rad * rad) continue;
        const i = (py0 ? 31 - yy : yy) * A + (px0 ? 31 - xx : xx);
        if (S[i] === 0) { S[i] = sl; mark(i); }
      }
    }
  }
  // the lower kind would not receive our spill (then we must not round into it)
  function lvlSpillsBack(k) {
    const r = RECV[k];
    if (r == null) return true;
    const o = ONLY[k];
    return !!(o && !o[SK[0]]);
  }
  // Rims and cast shadows wherever a higher material meets lower ground.
  function spillEdges() {
    if (NS === 1) return;
    const y0 = EX1 < 0 ? 0 : Math.max(0, EY0 - 2), y1 = EX1 < 0 ? 31 : Math.min(31, EY1 + 2), x0 = EX1 < 0 ? 0 : Math.max(0, EX0 - 2), x1 = EX1 < 0 ? 31 : Math.min(31, EX1 + 2);
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const i = y * A + x, s = S[i], p = SL[s];
      const up = y ? S[i - A] : s, dn = y < 31 ? S[i + A] : s, lf = x ? S[i - 1] : s, rt = x < 31 ? S[i + 1] : s;
      const P = SPR[SK[s]];
      if (P) {
        const R = rampOf(SK[s]);
        if (SL[dn] < p) B[i] = R[P.shade];
        else if (SL[rt] < p) B[i] = R[Math.min(4, P.shade + 1)];
        else if (SL[up] < p || SL[lf] < p) B[i] = R[P.lit];
      }
      // shadow cast by a higher material above/left
      let a = 0;
      if (SL[up] > p) a = (SPR[SK[up]] || SPR.def).cast;
      else if (y > 1 && SL[S[i - 2 * A]] > p) a = (SPR[SK[S[i - 2 * A]]] || SPR.def).cast * 0.5;
      else if (SL[lf] > p) a = (SPR[SK[lf]] || SPR.def).cast * 0.7;
      if (a) B[i] = mixU(B[i], K.shade, a);
    }
    // frost where ice meets its edge
    if (SK[0] === 'ice') for (let i = 0; i < N; i++) {
      if (S[i] !== 0) continue;
      const x = i & 31, y = i >> 5;
      if ((y && S[i - A]) || (x && S[i - 1]) || (x < 31 && S[i + 1]) || (y < 31 && S[i + A])) B[i] = K.ice[4];
    }
  }
  function rampOf(kind) {
    switch (kind) {
      case 'veg': return K.st.grass === 'snow' ? K.g : K.g;
      case 'snow': return K.sn;
      case 'dirt': return K.d;
      case 'sand': return K.sa;
      case 'ash': return K.ash;
      case 'field': return K.d;
      default: return K.s;
    }
  }

  // Ambient occlusion from walls and cliff faces above/left.
  const tallKind = (k) => k === 'wall' || k === 'cliff';
  function occlusion() {
    const top = tallKind(K8[0]), left = tallKind(K8[6]), right = K8[2] === 'wall';
    const AT = [0.42, 0.3, 0.2, 0.12, 0.06], AL = [0.3, 0.2, 0.11, 0.05];
    if (!top && !left && !right && !tallKind(K8[7])) return;
    for (let y = 0; y < A; y++) for (let x = 0; x < A; x++) {
      let a = 0;
      if (top && y < 5) a = AT[y];
      if (left && x < 4) a = Math.max(a, AL[x] * (top ? 1 : 1));
      if (right && x > 29) a = Math.max(a, 0.1 * (x - 29));
      if (!top && !left && tallKind(K8[7]) && x + y < 5) a = Math.max(a, 0.3 - (x + y) * 0.06);
      if (a) { const i = y * A + x; B[i] = mixU(B[i], K.shade, a); }
    }
  }
  // lit brink where this ground ends above a drop into the void
  function voidRims() {
    if (K8[0] === 'void') for (let x = 0; x < A; x++) { B[x] = mixU(B[x], K.light, 0.35); B[A + x] = mixU(B[A + x], K.light, 0.12); }
    if (K8[6] === 'void') for (let y = 0; y < A; y++) B[y * A] = mixU(B[y * A], K.light, 0.25);
    if (K8[2] === 'void') for (let y = 0; y < A; y++) B[y * A + 31] = mixU(B[y * A + 31], K.shade, 0.3);
    if (K8[4] === 'void') for (let x = 0; x < A; x++) B[31 * A + x] = mixU(B[31 * A + x], K.shade, 0.35);
  }

  // ---- materials ---------------------------------------------------------------------------
  // Each fills the pixels of one slot from world position.
  // Broad patches use half steps between ramp colours (details keep the full
  // steps), so ground varies without looking blotchy.
  const softC = new WeakMap();
  function soft(R) {
    let v = softC.get(R);
    if (!v) { v = [R[0], mixU(R[1], R[2], 0.5), R[2], mixU(R[2], R[3], 0.5), R[4], R[1], R[3]]; softC.set(R, v); }
    return v;
  }
  const gentleC = new WeakMap();
  function gentle(R) {
    let v = gentleC.get(R);
    if (!v) { v = [R[0], mixU(R[2], R[1], 0.38), R[2], mixU(R[2], R[3], 0.4), R[4]]; gentleC.set(R, v); }
    return v;
  }
  function fillTone(slot, ramp, hard) {
    const R = hard ? ramp : soft(ramp);
    for (let k = 0, i = 0; k < NI; k++) if ((i = IDX[k]) >= 0) B[i] = R[TI[i]];
  }
  function toneField(slot, s1, s2, seed, w2, lo, hi, tl, tm, th) {
    field(F, s1, s2, seed, w2);
    for (let k = 0, i = 0; k < NI; k++) if ((i = IDX[k]) >= 0) { const v = F[i]; TI[i] = v < lo ? tl : v > hi ? th : tm; }
  }
  // relief shading of a height field: lit where it faces the upper left
  function relief(slot, sx, sy, seed, t1, t2, tl, tm, tsh, tdk) {
    noise(G, 34, 34, 0, 0, sx, sy, seed, 0.7, false);
    noise(G, 34, 34, 0, 0, sx * 0.45, sy * 0.45, seed + 3, 0.3, true);
    for (let y = RY0; y <= RY1; y++) for (let x = RX0; x <= RX1; x++) {
      const i = y * A + x;
      if (S[i] !== slot) continue;
      const e = G[y * 34 + x] - G[(y + 2) * 34 + x + 2];
      TI[i] = e > t1 ? tl : e < -t2 * 1.8 ? tdk : e < -t2 ? tsh : tm;
    }
    despeckle(slot);
  }

  function fillGrass(slot) {
    const st = K.st.grass, g = K.g;
    if (st === 'snow') return fillSnow(slot, g, true);
    if (st === 'moss' || st === 'ashmoss') {
      relief(slot, 11, 9, 31, 0.05, 0.05, 3, 2, 1, 1);
      fillTone(slot, g);
      scatter(slot, 11, 32, st === 'moss' ? 380 : 200, ST.moss, g);
      scatter(slot, 13, 33, 240, st === 'moss' ? tufts('fern') : tufts('stalk'), g, K.rd);
      return;
    }
    if (st === 'lawn') {
      // mown stripes plus a few soft patches
      field(F, 30, 12, 34, 0.4);
      for (let k = 0; k < NI; k++) {
        const i = IDX[k];
        const wx = OX + (i & 31), stripe = Math.floor(wx / 24) & 1;
        const v = F[i];
        TI[i] = v < 0.24 ? 1 : v > 0.72 || stripe ? 3 : 2;
      }
      despeckle(slot);
      const gl = gentle(g);
      for (let k = 0, i = 0; k < NI; k++) if ((i = IDX[k]) >= 0) B[i] = gl[TI[i]];
      scatter(slot, 12, 35, 260, tufts('short'), g);
      scatter(slot, 19, 36, 220, ST.clover, g);
      return;
    }
    toneField(slot, 24, 9, 37, 0.45, 0.36, 0.64, 1, 2, 3);
    if (st === 'dune') {
      // salt-bleached turf thinning to sand
      field(G, 21, 8, 38, 0.4);
      for (let k = 0, i = 0; k < NI; k++) if ((i = IDX[k]) >= 0 && G[i] < 0.3) TI[i] = G[i] < 0.26 ? 7 : 6;
    }
    const gs = gentle(g), ss = soft(K.sa);
    for (let k = 0; k < NI; k++) {
      const i = IDX[k];
      const t = TI[i];
      B[i] = t < 5 ? gs[t] : t === 7 ? ss[2] : ss[1];
    }
    const dens = { lush: 520, autumn: 400, dune: 320, alpine: 330, paper: 300 }[st] || 380;
    const key = { lush: 'lush', autumn: 'dry', dune: 'dune', alpine: 'short', paper: 'dry' }[st] || 'lush';
    scatter(slot, 10, 40, dens, tufts(key), g, st === 'autumn' || st === 'dune' || st === 'paper' ? K.rd : g);
    if (st === 'lush') scatter(slot, 17, 41, 260, ST.clover, g);
    if (st === 'autumn') scatter(slot, 13, 42, 330, ST.leaf, g, K.lf);
    if (st === 'alpine') scatter(slot, 15, 43, 260, ST.pebble, g, K.s);
  }
  function fillSnow(slot, ramp, meadow) {
    const s = ramp || K.sn;
    relief(slot, 30, 13, 51, 0.04, 0.045, 4, 3, 2, 1);
    fillTone(slot, s, true);
    scatter(slot, 16, 52, 170, ST.sparkle, s);
    if (meadow) scatter(slot, 12, 53, 300, tufts('frost'), K.s, K.rd);
    else scatter(slot, 23, 54, 90, ST.twig, s, K.wd);
  }
  function fillDirt(slot) {
    const st = K.st.path, d = K.d;
    toneField(slot, 18, 7, 61, 0.5, 0.34, 0.66, 1, 2, 3);
    if (st === 'silt') {
      field(G, 20, 9, 62, 0.4);
      for (let k = 0, i = 0; k < NI; k++) if ((i = IDX[k]) >= 0 && G[i] > 0.7) TI[i] = G[i] > 0.74 ? 6 : 5;
    }
    const ds = soft(d);
    for (let k = 0; k < NI; k++) {
      const i = IDX[k];
      const t = TI[i];
      B[i] = t < 5 ? ds[t] : t === 6 ? mixU(K.w[3], d[2], 0.3) : mixU(K.w[1], d[1], 0.3);
    }
    switch (st) {
      case 'shell': scatter(slot, 14, 64, 220, ST.pebble, d, K.s); scatter(slot, 20, 65, 150, ST.shell, d, d, [u('#f4ece0'), u('#e8c8b8'), 0]); break;
      case 'clay': scatter(slot, 12, 66, 260, ST.pebble, d, K.s); scatter(slot, 16, 67, 240, ST.shard, d, K.brick); scatter(slot, 20, 68, 200, ST.crack, d); break;
      case 'frozen': scatter(slot, 14, 69, 220, ST.pebble, d, K.s); scatter(slot, 17, 70, 300, ST.frost, K.sn); break;
      case 'gravel': scatter(slot, 6, 71, 400, ST.gravel, d, K.d); scatter(slot, 13, 78, 200, ST.pebble, d, K.s); break;
      case 'silt': scatter(slot, 14, 72, 200, ST.pebble, d, K.s); break;
      case 'scree': scatter(slot, 8, 73, 520, ST.pebble.concat(ST.stone2), d, K.s); break;
      case 'dust': scatter(slot, 16, 74, 160, ST.stone2, d, K.s); break;
      default: scatter(slot, 11, 75, 300, ST.pebble, d, K.s); scatter(slot, 19, 76, 200, ST.crack, d); scatter(slot, 23, 77, 150, tufts('short'), K.g);
    }
  }
  function fillSand(slot) {
    const sa = K.sa, st = K.st.sand;
    field(F, 26, 9, 81, 0.4);
    noise(G, A, A, 0, 0, 34, 34, 82, 1, false);
    for (let k = 0; k < NI; k++) {
      const i = IDX[k];
      const x = i & 31, y = i >> 5, wx = OX + x, wy = OY + y;
      let t = F[i] < 0.3 ? 1 : F[i] > 0.7 ? 3 : 2;
      if (G[i] > 0.45) {
        // wind ripples: wavy bands with a lit crest and a shadowed trough
        const ph = (wy + 2.2 * Math.sin(wx / 7 + G[i] * 5) + F[i] * 4) / 7;
        const f = ph - Math.floor(ph);
        if (f < 0.15) t = 3;
        else if (f < 0.3) t = 1;
      }
      TI[i] = t;
    }
    despeckle(slot);
    fillTone(slot, sa);
    scatter(slot, 24, 84, st === 'beach' ? 110 : 60, ST.shell, sa, sa, [u('#f6eee2'), u('#e6c4b4'), 0]);
    scatter(slot, 24, 85, 80, ST.pebble, sa, K.s);
    if (K.st.glassy) scatter(slot, 32, 86, 110, ST.glassy, sa, sa, K.acc);
  }
  function fillAsh(slot) {
    const a = K.ash;
    noise(F, A, A, 0, 0, 22, 5, 91, 0.7, false);
    noise(F, A, A, 0, 0, 9, 9, 92, 0.3, true);
    for (let k = 0, i = 0; k < NI; k++) if ((i = IDX[k]) >= 0) TI[i] = F[i] < 0.34 ? 1 : F[i] > 0.66 ? 3 : 2;
    despeckle(slot);
    fillTone(slot, a);
    scatter(slot, 17, 93, 170, ST.lump, a, K.cinder);
    scatter(slot, 19, 94, 120, ST.flake, a);
    scatter(slot, 53, 95, 70, ST.ember, a, K.dw, [u('#c8683a')]);
  }
  const CROPS = {
    sprout: [stp(['2.2', '.3.', '.1.'], 1, 2), stp(['3.3', '.2.'], 1, 1)],
    stubble: [stp(['D.D', 'C.C', 'B.B'], 1, 2), stp(['D', 'C'], 0, 1)],
    bed: [stp(['.33.', '3443', '2332', '.11.'], 1, 3), stp(['.3.', '343', '.1.'], 1, 2)],
    snow: [stp(['C.C'], 1, 0)], grey: [stp(['C.', 'B.'], 0, 1)],
  };
  function fillField(slot) {
    const d = K.d, st = K.st.field;
    for (let k = 0; k < NI; k++) {
      const i = IDX[k];
      const r = (OY + (i >> 5)) & 7;
      B[i] = r === 0 ? d[3] : r < 4 ? d[2] : r === 4 ? d[1] : d[0];
      if (st === 'snow' && r > 4) B[i] = K.sn[r === 5 ? 2 : 3];
    }
    // crops sit on the ridges, spaced along the row
    const crop = CROPS[st] || CROPS.sprout;
    const R = st === 'stubble' ? K.rd : st === 'bed' ? K.lf : K.g;
    R1 = R; R2 = st === 'stubble' ? K.rd : st === 'snow' || st === 'grey' ? K.d : R; AC = [K.inkU];
    for (let row = Math.floor((OY + RY0) / 8); row <= Math.floor((OY + RY1 + 4) / 8); row++) {
      const wy = row * 8 + 3;
      for (let k = Math.floor((OX + RX0 - 6) / 7); k <= Math.floor((OX + RX1 + 6) / 7); k++) {
        const r = hh(k, row, 97);
        if ((r & 7) === 0) continue;
        stamp(crop[(r >>> 3) % crop.length], k * 7 + ((r >>> 6) % 3) - OX, wy - OY, slot);
      }
    }
  }
  // Ground fill by kind (used for this tile and for spilled/bank material).
  function fillKind(kind, slot) {
    if (select(slot)) fillBody(kind, slot);
    fullRegion();
  }
  function fillBody(kind, slot) {
    switch (kind) {
      case 'veg': return fillGrass(slot);
      case 'snow': return fillSnow(slot);
      case 'dirt': return fillDirt(slot);
      case 'sand': return fillSand(slot);
      case 'ash': return fillAsh(slot);
      case 'field': return fillField(slot);
      case 'ice': return fillIce(slot);
      case 'road': return fillPave(slot, K.st.road);
      case 'stone': return fillPave(slot, K.st.floor, true);
      case 'wood': return fillWood(slot);
      case 'tatami': return fillTatami(slot);
      case 'paper': return fillPave(slot, K.st.floor, true);
      case 'glass': return fillGlass(slot);
      case 'carpet': return fillWood(slot);
      default: return fillDirt(slot);
    }
  }

  // ---- paving and floors --------------------------------------------------------------------------
  // Courses of stones in world position (running bond, some stones split in
  // two), each lit on its top/left edge and shaded on its bottom/right, with
  // a joint colour per style.
  const PAVE = {
    cobble: { rw: 10, rh: 8, st: 1, round: 2, ramp: 's', joint: 'd0', tones: [1, 2, 2, 3] },
    rough: { rw: 12, rh: 10, st: 1, round: 3, ramp: 's', joint: 'd0', tones: [1, 2, 3, 2] },
    flags: { rw: 26, rh: 16, st: 1, split: 1, round: 0, ramp: 's', joint: 's1m', tones: [2, 3, 3, 2], chips: 1, soft: 1, softEdge: 1 },
    brick: { rw: 16, rh: 8, st: 1, round: 0, ramp: 'brick', joint: 'ash', tones: [2, 2, 3, 1], soft: 1 },
    setts: { rw: 11, rh: 8, st: 1, round: 0, ramp: 's', joint: 'snow', tones: [1, 2, 2, 3], soft: 1 },
    slab: { rw: 24, rh: 16, st: 1, split: 1, round: 0, ramp: 's', joint: 's1m', tones: [2, 2, 3, 2], sheen: 1, warm: 1, soft: 1, softEdge: 1 },
    wet: { rw: 22, rh: 14, st: 1, split: 1, round: 0, ramp: 's', joint: 'moss', tones: [1, 2, 2, 1], wet: 1 },
    ashlar: { rw: 28, rh: 20, st: 1, split: 1, round: 0, ramp: 's', joint: 's1m', tones: [2, 3, 3, 2], soft: 1, softEdge: 1 },
    ink: { rw: 16, rh: 12, st: 1, round: 1, ramp: 's', joint: 'ink', tones: [3, 3, 4, 3] },
  };
  function fillPave(slot, style, floor) {
    const P = PAVE[style] || PAVE.cobble;
    const R = P.ramp === 'brick' ? K.brick : K.s, RS = soft(R);
    const joint = P.joint === 'd0' ? K.d[0] : P.joint === 's0' ? K.s[0] : P.joint === 's1' ? K.s[1] : P.joint === 's1m' ? mixU(K.s[1], K.s[2], 0.45) : P.joint === 'ash' ? K.ash[1]
      : P.joint === 'snow' ? mixU(K.s[1], K.sn[2], 0.55) : P.joint === 'moss' ? mixU(K.s[0], K.g[1], 0.5) : K.inkU;
    const warm = P.warm ? K.lantern : 0, rw = P.rw, rh = P.rh, round = P.round | 0, cut = round + (round > 1 ? 1 : 0);
    if (P.wet) field(G, 17, 7, 101, 0.5);
    for (let y = RY0; y <= RY1; y++) {
      const wy = OY + y, row = Math.floor(wy / rh), ly = wy - row * rh;
      const off = P.st ? (row & 1 ? rw >> 1 : 0) + (hh(row, -7, 105) % 3) : 0;
      let x = RX0;
      while (x <= RX1) {
        // one stone (or half stone) of this course at a time
        const wx = OX + x, col = Math.floor((wx + off) / rw), sx0 = col * rw - off;
        let id = hh(col, row, 105), s0 = sx0, w = rw;
        if (P.split && id % 3 === 0) { const hw = rw >> 1; if (wx - sx0 >= hw) { s0 = sx0 + hw; id = (id * 7 + 1) >>> 0; } w = hw; }
        const xe = Math.min(RX1 + 1, s0 + w - OX), t = P.tones[id & 3];
        const cBody = P.soft ? RS[t] : R[t], cLit = R[Math.min(4, t + 1)], cDark = P.softEdge ? RS[Math.max(0, t - 1)] : R[Math.max(0, t - 1)];
        const chip = (id >>> 8) % 11 === 0;
        for (; x < xe; x++) {
          const i = y * A + x;
          if (S[i] !== slot) continue;
          const lx = OX + x - s0;
          let j = lx === w - 1 || ly === rh - 1;
          if (!j && round) {
            const cx = lx < round ? round - lx : lx > w - 2 - round ? lx - (w - 2 - round) : 0, cy = ly < round ? round - ly : ly > rh - 2 - round ? ly - (rh - 2 - round) : 0;
            if (cx && cy && cx + cy > cut) j = true;
          }
          if (j) { B[i] = joint; continue; }
          let c = ly === 0 || lx === 0 ? cLit : ly === rh - 2 || lx === w - 2 ? cDark : cBody;
          if (warm && ly === 0) c = mixU(c, warm, 0.35);
          if (P.sheen && ((OX + x - wy + 400) % 44) < 3 && lx && ly && lx < w - 2 && ly < rh - 2) c = mixU(c, K.light, 0.22);
          if (P.wet && G[i] > 0.64) {
            // a shallow puddle: the stone darkens and reflects a little light
            c = mixU(c, K.wet, G[i] > 0.7 ? 0.42 : 0.28);
          }
          if (chip && lx > 2 && ly > 2 && lx < w - 3 && ly < rh - 3 && ((lx + ly * 3 + (id >>> 4)) % 7) === 0) c = cDark;
          B[i] = c;
        }
      }
    }
    if (P.chips && K.st.glassy) scatter(slot, 37, 107, 150, ST.glassy, R, R, K.acc);
    if (!floor) kerbs(slot, R);
  }
  // Road kerbs where paving meets soft ground (lower at the south/east face).
  function kerbs(slot, R) {
    for (let s = 0; s < 4; s++) {
      const k = K8[s * 2];
      if (!(k in SPILL) && k !== 'void') continue;
      const line = s === 0 ? TY : s === 2 ? TY + 1 : s === 3 ? TX : TX + 1;
      const o = (s & 1) === 0 ? OX : OY;
      for (let a = 0; a < A; a++) {
        const w = o + a, seg = Math.floor((w + (line * 5) % 13) / 14), sl = (w + (line * 5) % 13) - seg * 14;
        const tone = 2 + (hh(seg, line, 109) % 2);
        for (let d = 0; d < 4; d++) {
          const i = sidePix(s, a, d);
          if (S[i] !== slot) continue;
          let c = sl === 13 ? K.s[0] : R === K.brick ? K.s[tone] : R[tone];
          if (d === 3) c = K.s[0];
          else if (d === 0) c = s === 2 || s === 1 ? K.s[0] : K.s[4];
          else if (d === 1 && (s === 2 || s === 1)) c = K.s[1];
          B[i] = c;
        }
      }
    }
  }
  function fillWood(slot) {
    const R = K.fl;
    for (let k = 0; k < NI; k++) {
      const i = IDX[k];
      const x = i & 31, y = i >> 5, wx = OX + x, wy = OY + y;
      const row = Math.floor(wy / 8), ly = wy - row * 8;
      const off = hh(row, 0, 121) % 56, len = 56;
      const seg = Math.floor((wx + off) / len), lx = wx + off - seg * len;
      const id = hh(seg, row, 123);
      let t = 2 + ((id & 3) === 0 ? 1 : (id & 3) === 1 ? -1 : 0);
      if (ly === 7) { B[i] = R[0]; continue; }
      if (lx === 0) { B[i] = R[0]; continue; }
      if (ly === 0) t = Math.min(4, t + 1);
      else if (ly === 6) t = Math.max(0, t - 1);
      // grain: long thin streaks, a knot now and then
      const g1 = (id >>> 5) % 6;
      if (ly === 2 + (g1 % 3) && ((lx + (id >>> 9)) % 23) < 9 + g1) t = Math.max(0, t - 1);
      if (ly === 4 && ((lx + (id >>> 13)) % 31) < 5) t = Math.max(0, t - 1);
      let c = R[t];
      if (((id >>> 17) % 5 === 0) && lx >= 20 && lx <= 22 && ly >= 2 && ly <= 4) c = (lx === 21 && ly === 3) ? R[0] : R[Math.max(0, t - 1)];
      // nail heads beside each joint
      if ((lx === 2 || lx === len - 3) && ly === 3) c = R[1];
      B[i] = c;
    }
  }
  // Tatami are laid from the corner of their own area: rows of mats two tiles
  // long in running bond (half mats at the row ends), cloth edging (heri) on
  // the long sides, a seam at the short ends, the rush weave across the mat.
  function tatamiOrigin() {
    let ox = TX, oy = TY;
    if (NB) {
      for (let k = 1; k < 12; k++) { const t = NB(-k, 0); if (!t || t.id !== 'tatami') break; ox = TX - k; }
      for (let k = 1; k < 12; k++) { const t = NB(0, -k); if (!t || t.id !== 'tatami') break; oy = TY - k; }
    }
    return [ox, oy];
  }
  function fillTatami(slot) {
    const R = K.ta, E = K.heri;
    const [ox, oy] = SK[0] === 'tatami' ? tatamiOrigin() : [0, 0];
    const row = TY - oy, c = TX - ox + (row & 1), half = c & 1;
    const mat = hh((c >> 1) + (row & 1) * 97, row + oy * 13 + ox * 7, 131);
    const endR = !half && N8[2].id !== 'tatami', endL = half && N8[6].id !== 'tatami';
    for (let k = 0; k < NI; k++) {
      const i = IDX[k], x = i & 31, y = i >> 5, along = half * 32 + x;
      let col;
      if (y < 2 || y > 29) col = y === 0 || y === 31 ? E[1] : E[3];
      else if (along === 0 || along === 63 || (endR && x === 31) || (endL && x === 0)) col = R[0];
      else {
        let t = (mat & 1) ? 3 : 2;
        if (along % 3 === 0) t -= 1;
        if (y === 2 || y === 29) t = 1;
        col = R[Math.max(0, t)];
      }
      B[i] = col;
    }
  }
  function fillGlass(slot) {
    const R = K.gl, RS = soft(R);
    for (let k = 0; k < NI; k++) {
      const i = IDX[k];
      const wx = OX + (i & 31), wy = OY + (i >> 5);
      const lx = wx & 15, ly = wy & 15, id = hh(wx >> 4, wy >> 4, 141);
      let c;
      if (lx === 15 || ly === 15) c = R[1];
      else if (lx === 0 || ly === 0) c = R[3];
      else if (lx === 14 || ly === 14) c = RS[1];
      else {
        c = (id & 1) ? RS[2] : R[2];
        const dgn = lx - ly + ((id >>> 3) & 3);
        if ((id & 6) === 0 && dgn > 3 && dgn < 6 && lx > 2 && ly < 12) c = R[4];
        else if (ly > 10) c = RS[1];
      }
      B[i] = c;
    }
    scatter(slot, 17, 143, 160, [stp(['.3.', '3.1', '.1.'], 1, 1)], R);
  }
  function fillIce(slot) {
    const R = K.ice;
    noise(F, A, A, 0, 0, 19, 19, 151, 1, false);
    noise(G, A, A, 0, 0, 9, 9, 152, 1, false);
    for (let k = 0; k < NI; k++) {
      const i = IDX[k];
      const x = i & 31, y = i >> 5, wx = OX + x, wy = OY + y, v = F[i];
      let t = G[i] > 0.62 ? 3 : 2;
      if (Math.abs(v - 0.5) < 0.022) t = 1; // cracks
      else if (Math.abs(v - 0.5) < 0.045 && v > 0.5) t = 4;
      if (((wx + wy) % 37) < 3 && G[i] > 0.4) t = Math.min(4, t + 1);
      B[i] = R[t];
    }
    scatter(slot, 13, 153, 160, [stp(['.4.', '4.3', '.3.'], 1, 1), stp(['4', '3'], 0, 0)], R);
  }

  // ---- generic ground tile ------------------------------------------------------------------------
  // Clumps of tall grass belong to tallgrass tiles; the tiles around them draw
  // the parts that lean or reach over their border.
  function tallClumps(slot) {
    const key = K.st.tall, alt = key === 'susuki' || key === 'frost' || key === 'marram' || key === 'plume' || key === 'reed';
    scatter(slot, 8, 183, 960, tufts(key), K.g, alt ? (key === 'reed' ? K.wd : K.rd) : K.g, [K.inkU], (wx, wy) => idAt(wx, wy) === 'tallgrass');
  }
  function ground(kind, extra) {
    return (c, x, y, pal, h, nb, tx, ty) => {
      begin(CUR, pal, h, nb, x, y, tx, ty);
      spills();
      roundCorners();
      fillKind(SK[0], 0);
      if (extra) extra(0);
      else if (SELF.id !== 'tallgrass' && RECV[SK[0]] != null) for (let d = 0; d < 8; d++) if (N8[d].id === 'tallgrass') { tallClumps(0); break; }
      for (let s = 1; s < NS; s++) fillKind(SK[s], s);
      spillEdges();
      occlusion();
      voidRims();
      out(c, x, y);
    };
  }
  let CUR = null;
  function wrap(id, fn) {
    const t = T[id];
    if (!t) return;
    t.draw2 = function (c, x, y, pal, h, nb, tx, ty) { CUR = t; fn(c, x, y, pal, h, nb, tx, ty); };
    t.draw2.tileArt = true;
  }
  // a thin dark wet line on land along a bank (the water tile draws the rest)
  function waterLips() {
    for (let s = 0; s < 4; s++) {
      if (!WET[K8[s * 2]] || K8[s * 2] === 'bridge') continue;
      for (let a = 0; a < A; a++) {
        const i = sidePix(s, a, 0);
        if (S[i] === 0) B[i] = mixU(B[i], K.shade, s === 2 ? 0.22 : 0.12);
      }
    }
  }

  // ---- water -------------------------------------------------------------------------------------
  const DEEP_R = 12;
  const BUILT = { road: 1, stone: 1, wood: 1, tatami: 1, carpet: 1, paper: 1, glass: 1, wall: 1, void: 1 };
  const landKind = (k) => !(WET[k] || k === 'other');
  function water(mode) {
    return (c, x, y, pal, h, nb, tx, ty) => {
      begin(CUR, pal, h, nb, x, y, tx, ty);
      const deep = mode === 'deep', dark = mode === 'dark';
      const W = dark ? K.dw : deep ? K.w : K.sh;
      // distance of each pixel to land (negative = land), and which side is nearest
      D.fill(99); SD.fill(255);
      const land = [false, false, false, false], built = [false, false, false, false], dep = [];
      for (let s = 0; s < 4; s++) {
        const k = K8[s * 2];
        if (!landKind(k)) continue;
        land[s] = true; built[s] = !!BUILT[k] || k === 'cliff';
        const P = DEP[s];
        if (built[s]) P.fill(s === 0 ? (k === 'wall' || k === 'cliff' ? 2 : 5) : s === 2 ? 2 : s === 3 ? 3 : 2);
        else profile(P, s, 11 + (deep ? 0 : 1), s === 0 ? 6 : 4.5, 2.6, 7, false);
        dep[s] = P;
        for (let a = 0; a < A; a++) for (let d = 0; d < 16; d++) {
          const i = sidePix(s, a, d), v = d + 0.5 - P[a];
          if (v < D[i]) { D[i] = v; SD[i] = s; }
        }
      }
      // rounded corners where two land sides meet; nubs where only a diagonal is land
      for (let cn = 0; cn < 4; cn++) {
        const s1 = cn, s2 = (cn + 1) % 4; // N-E, E-S, S-W, W-N
        const px0 = s1 === 0 || s1 === 1 ? 31 : 0, py0 = s1 === 1 || s1 === 2 ? 31 : 0;
        const cx = s1 === 0 || s1 === 1 ? TX + 1 : TX, cy = s1 === 1 || s1 === 2 ? TY + 1 : TY;
        if (land[s1] && land[s2] && !built[s1] && !built[s2]) {
          const Rr = 15;
          for (let yy = 0; yy < 16; yy++) for (let xx = 0; xx < 16; xx++) {
            const i = (py0 ? 31 - yy : yy) * A + (px0 ? 31 - xx : xx);
            const d1 = (s1 === 0 || s1 === 2 ? yy : xx) + 0.5 - dep[s1][s1 === 0 || s1 === 2 ? (px0 ? 31 - xx : xx) : (py0 ? 31 - yy : yy)];
            const d2 = (s2 === 0 || s2 === 2 ? yy : xx) + 0.5 - dep[s2][s2 === 0 || s2 === 2 ? (px0 ? 31 - xx : xx) : (py0 ? 31 - yy : yy)];
            if (d1 < Rr && d2 < Rr) {
              const v = Rr - Math.hypot(Rr - d1, Rr - d2);
              if (v < D[i]) { D[i] = v; SD[i] = d1 < d2 ? s1 : s2; }
            }
          }
        } else if (!land[s1] && !land[s2] && landKind(K8[cn * 2 + 1]) && !BUILT[K8[cn * 2 + 1]]) {
          const r = 4 + (hh(cx, cy, 78) % 4);
          for (let yy = 0; yy < 14; yy++) for (let xx = 0; xx < 14; xx++) {
            const i = (py0 ? 31 - yy : yy) * A + (px0 ? 31 - xx : xx), v = Math.hypot(xx + 0.5, yy + 0.5) - r;
            if (v < D[i]) { D[i] = v; SD[i] = 4 + cn; }
          }
        }
      }
      // land pixels take the neighbour's own material
      const sideKind = (sd) => (sd < 4 ? K8[sd * 2] : K8[(sd - 4) * 2 + 1]);
      for (let i = 0; i < N; i++) if (D[i] < 0) S[i] = slotOf(sideKind(SD[i]));
      // water surface: long soft streaks in half steps, a few bright crests
      const ws = K.st.water, WS = soft(W);
      const sx = ws === 'sea' ? 19 : ws === 'river' ? 26 : ws === 'still' ? 34 : 21, sy = ws === 'sea' ? 5 : ws === 'river' ? 3 : 4;
      noise(F, A, A, 0, 0, sx, sy, 161, 0.72, false);
      noise(F, A, A, 0, 0, 7, 3, 162, 0.28, true);
      const calm = ws === 'canal' || ws === 'still' || ws === 'drowned' || dark;
      const hiT = calm ? 0.72 : 0.68, loT = calm ? 0.26 : 0.3, crest = calm ? 0.86 : 0.76;
      const base = dark ? 1 : 2;
      for (let i = 0; i < N; i++) {
        if (S[i] !== 0) continue;
        const d = D[i], v = F[i];
        let c = v > crest && ((OY + (i >> 5)) % 3) === 0 ? W[Math.min(4, base + 1)] : v > hiT ? WS[base + 1] : v < loT ? WS[base - 1] : W[base];
        if (d < 99) {
          const sd = SD[i], bl = sd < 4 && built[sd];
          if (bl) {
            if (d < 1) c = mixU(W[0], K.shade, 0.4); // dark waterline under a kerb
            else if (d < 4 && sd === 0) c = WS[Math.max(0, base - 1)];
          } else if (d < 1) c = dark ? W[3] : K.foam;
          else if (d < 2.5) c = W[Math.min(4, base + 2)];
          else if (d < 5) c = W[Math.min(4, base + 1)];
          else if (d < 7 && c === W[base]) c = WS[base + 1];
        }
        B[i] = c;
      }
      // shallow: sandy bottom and the drop-off toward deep water
      if (mode === 'shallow') {
        scatter(0, 12, 163, 280, ST.pebble, W, K.shPeb || (K.shPeb = W.map((q) => mixU(q, K.sa[2], 0.2))));
        for (let s = 0; s < 4; s++) {
          if (K8[s * 2] !== 'water') continue;
          profile(PR, s, 13, 7, 5, 12, false);
          // taper where the deep tile rounds its corner away (see below)
          const tLo = rounds(s, true), tHi = rounds(s, false), cut = DEEP_R - Math.sqrt(DEEP_R) - 0.5;
          if (tLo || tHi) for (let a = 0; a < A; a++) {
            if (tLo) PR[a] = Math.min(PR[a], Math.max(0, Math.floor((a - cut) * 0.9)));
            if (tHi) PR[a] = Math.min(PR[a], Math.max(0, Math.floor((31 - a - cut) * 0.9)));
          }
          for (let a = 0; a < A; a++) for (let d = 0; d < PR[a] + 3; d++) {
            const i = sidePix(s, a, d);
            if (S[i] !== 0 || D[i] <= 2) continue;
            const e = PR[a] - d;
            B[i] = e > 1 ? K.w[2] : e === 1 ? mixU(K.w[2], W[4], 0.45) : e > -2 ? mixU(B[i], K.w[2], 0.35) : B[i];
          }
        }
      }
      // deep water rounds its corners where shallows wrap around it
      if (deep) for (let cn = 0; cn < 4; cn++) {
        if (K8[cn * 2] !== 'shallow' || K8[(cn * 2 + 2) % 8] !== 'shallow' || K8[cn * 2 + 1] !== 'shallow') continue;
        const px0 = cn === 0 || cn === 1 ? 31 : 0, py0 = cn === 1 || cn === 2 ? 31 : 0, R = DEEP_R, SH = soft(K.sh);
        for (let yy = 0; yy < R; yy++) for (let xx = 0; xx < R; xx++) {
          const dx = R - xx - 0.5, dy = R - yy - 0.5, e = Math.hypot(dx, dy) - R;
          if (e <= -1) continue;
          const i = (py0 ? 31 - yy : yy) * A + (px0 ? 31 - xx : xx);
          if (S[i] !== 0) continue;
          B[i] = e < 0 ? mixU(K.w[2], K.sh[4], 0.45) : e < 2 ? mixU(SH[2], K.w[2], 0.35) : SH[2];
        }
      }
      // surface stamps by region
      if (!dark) {
        if (ws === 'sea') scatter(0, 23, 164, 130, [stp(['.aaaab', '..bb..'], 2, 1), stp(['baaa.', '.bb..'], 2, 1)], W, W, [mixU(K.foam, W[3], 0.3), W[3]], (wx, wy) => distOK(wx, wy));
        if (ws === 'drowned') scatter(0, 29, 165, 170, ST.scrap, W, W, [mixU(u('#e8e2cc'), W[2], 0.35), mixU(u('#c8c2ae'), W[2], 0.45)], (wx, wy) => distOK(wx, wy));
        if (ws === 'canal') scatter(0, 23, 166, 150, [stp(['aa', '.a'], 0, 0), stp(['a', 'a'], 0, 0)], W, W, [mixU(K.lantern, W[3], 0.3)], (wx, wy) => distOK(wx, wy));
      } else scatter(0, 21, 168, 120, [stp(['aaa'], 1, 0)], W, W, [W[3]], (wx, wy) => distOK(wx, wy));
      // banks
      for (let s = 1; s < NS; s++) fillKind(SK[s], s);
      bankEdges(built, dark ? W[3] : K.foam, W);
      out(c, x, y);
    };
  }
  function distOK(wx, wy) {
    const x = wx - OX, y = wy - OY;
    if (x < 0 || y < 0 || x >= A || y >= A) return false;
    return D[y * A + x] > 4;
  }
  // Brinks, bank faces and kerbs on the land side of a shore.
  function bankEdges(built, foam, W) {
    for (let i = 0; i < N; i++) {
      const d = D[i];
      if (d >= 0 || d < -4) continue;
      const sd = SD[i], k = SK[S[i]];
      const R = rampOf(k);
      const sideN = sd === 0 || sd === 4 || sd === 7, sideS = sd === 2 || sd === 5 || sd === 6;
      if (sd < 4 && built[sd]) {
        // kerb / pier / quay edge
        const kk = SK[S[i]];
        const Rk = kk === 'wood' || kk === 'tatami' || kk === 'carpet' ? K.fl : K.s;
        if (sd === 0) { // face seen from the front
          const x = i & 31, wx = OX + x;
          if (kk === 'wall' || kk === 'cliff') { B[i] = mixU(Rk[0], K.shade, 0.3); continue; }
          if (d >= -1) B[i] = Rk[0];
          else if (d >= -4) B[i] = Rk[1 + ((((wx + 3) % 16) === 0 || (kk === 'wood' && wx % 12 < 2)) ? -1 : 1)];
          if (d >= -4 && d < -3.5) B[i] = Rk[3];
        } else if (sd === 2) { if (d >= -1) B[i] = Rk[4]; }
        else if (sd === 3) { if (d >= -1) B[i] = Rk[0]; else if (d >= -2) B[i] = Rk[1]; }
        else if (d >= -1) B[i] = Rk[3];
        continue;
      }
      if (sideN) {
        // brink, then the bank face under it
        if (d >= -2.5) B[i] = d >= -1 ? K.d[0] : k === 'sand' ? K.sa[1] : K.d[1];
        else if (d >= -3.5) B[i] = R[4];
      } else if (sideS) {
        if (d >= -1) B[i] = R[4];
        else if (d >= -2) B[i] = R[1];
      } else if (sd === 3) {
        if (d >= -1) B[i] = K.d[1];
        else if (d >= -2) B[i] = R[3];
      } else if (d >= -1) B[i] = R[4];
    }
    // foam is broken into short dashes on the water side
    for (let i = 0; i < N; i++) if (S[i] === 0 && D[i] >= 0 && D[i] < 1 && !(SD[i] < 4 && built[SD[i]])) {
      const x = i & 31, y = i >> 5, w = OX + x + OY + y;
      B[i] = (hh(w >> 2, SD[i], 169) % 3) === 0 ? foam : mixU(foam, W[3], 0.45);
    }
  }

  // ---- water animation -------------------------------------------------------------------------
  // Gentle glints on open water: two short highlights per tile that grow and
  // fade on their own slow cycle, plus a ripple line swaying by a pixel. Only
  // where the tile is open water (away from its banks). Nothing when still.
  const openCache = new WeakMap();
  function openRect(tx, ty) {
    const m = RB.world && RB.world.W && RB.world.W.map;
    if (!m || !RB.maps) return 0x04041c1c;
    let arr = openCache.get(m);
    if (!arr) { arr = new Int32Array(m.w * m.h).fill(-1); openCache.set(m, arr); }
    const idx = ty * m.w + tx;
    if (idx < 0 || idx >= arr.length) return 0x04041c1c;
    if (arr[idx] >= 0) return arr[idx];
    const L = (dx, dy) => { const t = RB.maps.tileAt(m, tx + dx, ty + dy); return t ? landKind(kindOf(t)) : false; };
    const x0 = L(-1, 0) ? 10 : 3, x1 = L(1, 0) ? 22 : 29, y0 = L(0, -1) ? 12 : 3, y1 = L(0, 1) ? 22 : 29;
    return (arr[idx] = (x0 << 24) | (y0 << 16) | (x1 << 8) | y1);
  }
  function anim(mode) {
    return (c, sx, sy, pal, t, tx, ty, still) => {
      if (still) return;
      const Kk = kit(pal), hx = Kk.hex;
      const o = openRect(tx, ty), x0 = o >>> 24, y0 = (o >>> 16) & 255, x1 = (o >>> 8) & 255, y1 = o & 255;
      const w = Math.max(1, x1 - x0 - 6), h = Math.max(1, y1 - y0);
      const R = mode === 'dark' ? hx.dw : hx.w;
      for (let g = 0; g < (mode === 'shallow' ? 1 : 2); g++) {
        const r = hh(tx, ty, 40 + g), per = 2400 + (r % 1600), ph = ((t + ((r >>> 8) % per)) % per) / per;
        if (ph > 0.34) continue;
        const k = Math.floor((ph / 0.34) * 5), len = [2, 4, 6, 4, 2][k];
        const gx = x0 + ((r >>> 12) % w) + Math.floor(ph * 9), gy = y0 + ((r >>> 20) % h);
        c.fillStyle = mode === 'dark' ? R[3] : R[4];
        c.fillRect(sx + gx, sy + gy, len, 1);
        if (len >= 4 && mode !== 'dark') { c.fillStyle = hx.foam; c.fillRect(sx + gx + (len >> 1) - 1, sy + gy, 2, 1); }
      }
      if (mode !== 'dark') {
        const r = hh(tx, ty, 47);
        const lx = x0 + (r % w), ly = y0 + ((r >>> 10) % h), sway = Math.round(Math.sin(t / 1100 + (r & 63)) * 1.4);
        c.fillStyle = R[3];
        c.fillRect(sx + lx + sway, sy + ly, 5, 1);
        c.fillRect(sx + lx + sway + 6, sy + ly, 2, 1);
      }
    };
  }

  // ---- bridges ------------------------------------------------------------------------------------
  // Planks run across the direction of travel, with joist nail rows; rails
  // with posts line the sides that face water; the deck's side face and its
  // shadow fall on the water below/right of it.
  function bridge(horiz) {
    return (c, x, y, pal, h, nb, tx, ty) => {
      begin(CUR, pal, h, nb, x, y, tx, ty);
      const sA = horiz ? 0 : 3, sB = horiz ? 2 : 1, kA = K8[sA * 2], kB = K8[sB * 2];
      const openA = !!WET[kA] && kA !== 'bridge', openB = !!WET[kB] && kB !== 'bridge';
      const WA = kA === 'shallow' ? K.sh : kA === 'dark' ? K.dw : K.w, WB = kB === 'shallow' ? K.sh : kB === 'dark' ? K.dw : K.w;
      const R = K.wd, RS = soft(R), top = openA ? 5 : 0, bot = openB ? 26 : 32;
      noise(F, A, A, 0, 0, 22, 3, 161, 1, false);
      for (let i = 0; i < N; i++) {
        const lx = i & 31, ly = i >> 5, along = horiz ? lx : ly, across = horiz ? ly : lx;
        const wa = (horiz ? OX : OY) + along, wc = (horiz ? OY : OX) + across;
        let col;
        if (across < top || across >= bot) {
          const W = across < top ? WA : WB, WS = soft(W), v = F[i];
          col = v > 0.7 ? WS[3] : v < 0.3 ? WS[1] : W[2];
          if (across === top - 1) col = mixU(W[1], K.shade, 0.3);
          if (across >= bot) {
            const k = across - bot;
            if (horiz && k < 2) col = k === 0 ? R[1] : R[0];
            else if (k < (horiz ? 5 : 3)) col = mixU(col, K.shade, horiz ? 0.42 : 0.32);
          }
        } else if (openA && across < top + 3) {
          const k = across - top, post = (wa % 24) < 3;
          col = post ? [R[4], R[2], R[0]][k] : [R[3], R[2], R[1]][k];
        } else if (openB && across >= bot - 3) {
          const k = across - bot + 3, post = (wa % 24) < 3;
          col = post ? [R[4], R[2], R[0]][k] : [R[3], R[1], R[0]][k];
        } else {
          const p = Math.floor(wa / 6), pa = wa - p * 6, id = hh(p, 3, 191);
          if (pa === 5) col = R[0];
          else {
            const t = (id & 3) === 0 ? 3 : (id & 3) === 1 ? 1 : 2, jc = wc & 15;
            col = pa === 0 ? R[Math.min(4, t + 1)] : RS[t];
            // grain away from the joist line; one nail per plank on it
            if (pa === ((id >>> 3) & 1 ? 1 : 3) && (jc < 4 || jc > 10) && ((wc + (id >>> 4)) % 12) < 5) col = R[Math.max(0, t - 1)];
            if (jc === 7 && pa === 2) col = R[1];
          }
        }
        B[i] = col;
      }
      out(c, x, y);
    };
  }

  // ---- walls -------------------------------------------------------------------------------------
  // Timber-and-plaster or stone, chosen from the floor next to the wall (then
  // the region). A wall with wall below is seen from above (its thick top);
  // otherwise its face shows: head rail, plaster, posts, skirting — or
  // coursed stone over a plinth.
  const PROBE = [[0, 1], [0, 2], [1, 0], [-1, 0], [1, 1], [-1, 1], [1, 2], [-1, 2], [0, 3], [2, 2], [-2, 2], [2, 1], [-2, 1], [0, -1], [1, -1], [-1, -1],
    [2, 0], [-2, 0], [0, 4], [3, 3], [-3, 3], [2, 3], [-2, 3], [3, 2], [-3, 2], [3, 0], [-3, 0], [0, -2], [2, -2], [-2, -2], [4, 4], [-4, 4], [4, 2], [-4, 2], [0, 5]];
  // The map being built is the world's current map (the renderer only builds
  // that one); when the neighbours match it, one style serves the whole map,
  // picked by which floors it has more of.
  const mapStyles = new WeakMap();
  function mapStyle() {
    const m = RB.world && RB.world.W && RB.world.W.map;
    if (!m || !NB || !RB.maps || m.w <= TX || m.h <= TY) return null;
    for (const [dx, dy] of [[1, 0], [0, 1], [-1, -1], [2, 1]]) if ((NB(dx, dy) || null) !== RB.maps.tileAt(m, TX + dx, TY + dy)) return null;
    let st = mapStyles.get(m);
    if (!st) {
      let tim = 0, sto = 0;
      for (const t of m.tiles) { const k = kindOf(t); if (k === 'wood' || k === 'tatami' || k === 'carpet') tim++; else if (k === 'stone' || k === 'paper' || k === 'glass' || k === 'road') sto++; }
      st = tim + sto === 0 ? K.st.wall : sto > tim ? 'stone' : 'timber';
      mapStyles.set(m, st);
    }
    return st;
  }
  function wallStyle() {
    const ms = mapStyle();
    if (ms) return ms;
    if (NB) for (const [dx, dy] of PROBE) {
      const t = NB(dx, dy), k = t && kindOf(t);
      if (!k || k === 'wall' || k === 'other' || k === 'void' || WET[k]) continue;
      if (k === 'wood' || k === 'tatami' || k === 'carpet') return 'timber';
      if (k === 'stone' || k === 'paper' || k === 'glass' || k === 'ash' || k === 'road') return 'stone';
      break;
    }
    return K.st.wall;
  }
  function faceWall(d) {
    if (N8[d].id !== 'wall' || !NB) return false;
    const b = NB(DX8[d], DY8[d] + 1);
    return !b || b.id !== 'wall';
  }
  function wallTile(c, x, y, pal, h, nb, tx, ty) {
    begin(CUR, pal, h, nb, x, y, tx, ty);
    const below = nb ? nb(0, 1) : null, st = wallStyle();
    if (!below || below.id !== 'wall') wallFace(st); else wallTop(st);
    out(c, x, y);
  }
  function wallFace(st) {
    const endW = !faceWall(6), endE = !faceWall(2);
    if (st === 'timber') {
      const R = K.wd, P = K.wl, PS = soft(P);
      noise(F, A, A, 0, 0, 13, 9, 201, 1, false);
      for (let i = 0; i < N; i++) {
        const lx = i & 31, ly = i >> 5, wx = OX + lx;
        let c;
        if (ly < 3) c = ly === 0 ? R[3] : ly === 1 ? R[2] : R[0];
        else if (ly >= 25) c = ly === 25 ? R[3] : ly === 31 ? R[0] : (wx % 32) === 0 ? R[0] : R[1];
        else {
          c = ly < 5 ? mixU(PS[1], K.shade, 0.22) : F[i] > 0.7 ? mixU(PS[3], P[2], 0.4) : F[i] < 0.26 ? mixU(PS[1], P[2], 0.4) : P[2];
          if (ly > 21) c = mixU(c, K.shade, 0.05 * (ly - 21));
        }
        const pm = ((wx % 96) + 96) % 96;
        const post = pm < 4 ? pm : endW && lx < 4 ? lx : endE && lx > 27 ? lx - 28 : -1;
        if (post >= 0) c = post === 0 ? R[3] : post === 3 ? R[0] : ly >= 25 || ly < 3 ? R[1] : R[2];
        B[i] = c;
      }
      return;
    }
    const brick = K.st.floor === 'brick', R = brick ? K.brick : K.s, RS = soft(R), bw = brick ? 12 : 16, bh = brick ? 6 : 8;
    const wet = K.st.floor === 'wet';
    for (let i = 0; i < N; i++) {
      const lx = i & 31, ly = i >> 5, wx = OX + lx;
      let c;
      if (ly === 0) c = K.s[3];
      else if (ly === 1) c = mixU(K.s[0], K.shade, 0.3);
      else if (ly >= 26) c = ly === 26 ? K.s[3] : ly === 31 ? K.s[0] : (wx % 32) === 31 ? K.s[0] : K.s[1];
      else {
        const yy = ly - 2, course = Math.floor(yy / bh), cy = yy - course * bh;
        const off = course & 1 ? bw >> 1 : 0, bx = Math.floor((wx + off) / bw), cx = wx + off - bx * bw;
        const id = hh(bx, course + TY * 7, 203), t = [2, 2, 3, 1][id & 3];
        if (cy === bh - 1 || cx === bw - 1) c = brick ? K.ash[1] : R[0];
        else if (cy === 0 || cx === 0) c = R[Math.min(4, t + 1)];
        else if (cy === bh - 2) c = R[Math.max(0, t - 1)];
        else c = RS[t];
        if (wet && (hh(wx >> 1, TY, 205) % 9) === 0 && cy > 1) c = mixU(c, K.shade, 0.28);
        if (ly > 20) c = mixU(c, K.shade, 0.04 * (ly - 20));
      }
      if (endW && lx === 0) c = mixU(c, K.light, 0.3);
      else if (endE && lx === 31) c = mixU(c, K.shade, 0.35);
      B[i] = c;
    }
  }
  function wallTop(st) {
    const timber = st === 'timber', R = timber ? K.wd : K.s;
    const base = timber ? mixU(R[1], R[0], 0.45) : mixU(R[0], K.dark, 0.25);
    const horiz = N8[2].id === 'wall' && N8[6].id === 'wall';
    for (let i = 0; i < N; i++) {
      const wx = OX + (i & 31), wy = OY + (i >> 5);
      let c = base;
      if (timber) { const a = (horiz ? wy : wx) & 7; if (a === 0) c = R[0]; else if (a === 1) c = R[1]; }
      else if ((wy & 15) === 15 || (((wx + ((wy >> 4) & 1) * 16) & 31) === 31)) c = mixU(R[0], K.dark, 0.5);
      else if ((wy & 15) === 0) c = R[1];
      B[i] = c;
    }
    for (let s = 0; s < 4; s++) {
      const n = N8[s * 2];
      if (n.id === 'wall' || K8[s * 2] === 'other') continue;
      const lit = s === 0 || s === 3;
      for (let a = 0; a < A; a++) {
        B[sidePix(s, a, 0)] = lit ? R[3] : R[0];
        B[sidePix(s, a, 1)] = lit ? R[2] : mixU(base, R[0], 0.5);
      }
    }
  }

  // ---- cliffs ----------------------------------------------------------------------------------------
  // A cliff tile with cliff below is rock seen from above (rounded boulders,
  // crevices, snow caps in the snowy regions); the lowest row is the face:
  // vertical strata with ledges, darkening to its foot. The ground above
  // overhangs the brink; the ends show the ground beside them.
  function cliffTile(c, x, y, pal, h, nb, tx, ty) {
    begin(CUR, pal, h, nb, x, y, tx, ty);
    const isC = (d) => N8[d].id === 'cliff';
    const face = !isC(4), lipK = !isC(0) ? K8[0] : null;
    const groundy = (k) => k in SPILL || k === 'road' || k === 'stone';
    for (const s of [3, 1]) {
      if (isC(s * 2) || !groundy(K8[s * 2])) continue;
      profile(PR, s, 23, 3, 2, 6, false);
      const sl = slotOf(K8[s * 2]);
      for (let a = 0; a < A; a++) for (let d = 0; d < PR[a]; d++) S[sidePix(s, a, d)] = sl;
    }
    if (lipK && lipK in SPILL) {
      profile(PR, 0, 24, 4.5, 2, 5, lipK === 'veg');
      const sl = slotOf(lipK);
      for (let a = 0; a < A; a++) for (let d = 0; d < PR[a]; d++) { const i = sidePix(0, a, d); if (S[i] === 0) S[i] = sl; }
    }
    if (face) rockFace(!!lipK); else rockTop();
    for (let s = 1; s < NS; s++) fillKind(SK[s], s);
    const R = K.s;
    for (let i = 0; i < N; i++) {
      const lx = i & 31, ly = i >> 5, sl = S[i];
      if (sl === 0) {
        const up = ly ? S[i - A] : 0, lf = lx ? S[i - 1] : 0, rt = lx < 31 ? S[i + 1] : 0;
        if (up) B[i] = R[4];
        else if (ly > 1 && S[i - 2 * A]) B[i] = mixU(B[i], K.light, 0.25);
        else if (lf) B[i] = R[3];
        else if (rt) B[i] = R[0];
      } else {
        const dn = ly < 31 ? S[i + A] : sl, lf = lx ? S[i - 1] : sl;
        if (dn === 0) B[i] = rampOf(SK[sl])[1];
        else if (lf === 0) B[i] = mixU(B[i], K.shade, 0.32);
        else if (lx > 1 && S[i - 2] === 0) B[i] = mixU(B[i], K.shade, 0.16);
      }
    }
    out(c, x, y);
  }
  // Rock face: rounded vertical columns lit from the left (a lit edge, a mid
  // tone, a shaded right side), split by crevices that wobble, broken by a
  // ledge or two (snow or moss on it in some regions); darker at the foot.
  function rockFace(lip) {
    const R = K.s, RS = soft(R), snowy = K.st.grass === 'snow' || K.name === 'sa_mount', green = !snowy && K.st.grass !== 'ashmoss';
    const bnd = (k, y) => k * 12 + (hh(k, 0, 211) % 5) - 2 + ((hh(k, (OY + y) >> 2, 212) % 3) - 1);
    for (let y = 0; y < A; y++) for (let x = 0; x < A; x++) {
      const i = y * A + x;
      if (S[i] !== 0) continue;
      const wx = OX + x;
      let k = Math.floor(wx / 12);
      if (wx < bnd(k, y)) k--;
      else if (wx >= bnd(k + 1, y)) k++;
      const b = bnd(k, y), w = bnd(k + 1, y) - b, lx = wx - b;
      const id = hh(k, TY, 213), l1 = 6 + (id % 11), l2 = l1 + 9 + ((id >>> 6) % 8), t = y > l2 ? 1 : y > l1 ? ((id >>> 12) & 1 ? 2 : 1) : 2;
      let c;
      if (lx === 0) c = R[0];
      else if (y === l1 || y === l2) c = lx < w - 1 ? R[0] : R[1];
      else if (y === l1 + 1 || y === l2 + 1) c = snowy && lx > 1 && lx < w - 2 ? K.sn[4] : green && (id >>> 16) % 3 === 0 && lx > 1 && lx < w - 2 ? K.g[3] : R[4];
      else if (lx === 1) c = R[Math.min(4, t + 2)];
      else if (lx === 2) c = R[t + 1];
      else if (lx >= w - 3) c = R[Math.max(0, t - 1)];
      else c = RS[t + ((lx + (y >> 3)) % 5 === 0 ? 1 : 0)];
      if (snowy && (y === l1 + 2 || y === l2 + 2) && lx > 1 && lx < w - 2) c = K.sn[2];
      if (!lip && y < 3) c = mixU(c, K.shade, 0.36 - y * 0.12);
      if (y >= 25) c = mixU(c, K.shade, 0.08 * (y - 24));
      B[i] = c;
    }
  }
  // Rock seen from above: big rounded boulders (cellular layout) with a lit
  // upper-left rim, a shaded lower-right band and dark crevices between
  // them; snow caps in the snowy regions, tufts in the cracks elsewhere.
  const FPX = new Float32Array(64), FPY = new Float32Array(64), FID = new Uint32Array(64);
  function rockTop() {
    const R = K.s, RS = soft(R), snowy = K.st.grass === 'snow' || K.name === 'sa_mount';
    const cw = 19, chh = 15;
    const cx0 = Math.floor(OX / cw) - 1, cx1 = Math.floor((OX + 31) / cw) + 1, cy0 = Math.floor(OY / chh) - 1, cy1 = Math.floor((OY + 31) / chh) + 1;
    const nw = cx1 - cx0 + 1;
    for (let cy = cy0; cy <= cy1; cy++) for (let cx = cx0; cx <= cx1; cx++) {
      const r = hh(cx, cy, 221), j = (cy - cy0) * nw + (cx - cx0);
      FPX[j] = cx * cw + 3 + (r % (cw - 6)); FPY[j] = cy * chh + 3 + ((r >>> 8) % (chh - 6)); FID[j] = r;
    }
    for (let i = 0; i < N; i++) {
      if (S[i] !== 0) continue;
      const wx = OX + (i & 31), wy = OY + (i >> 5);
      const ccx = Math.floor(wx / cw) - cx0, ccy = Math.floor(wy / chh) - cy0;
      let d1 = 1e9, d2 = 1e9, fx = 0, fy = 0, fid = 0;
      for (let jy = ccy - 1; jy <= ccy + 1; jy++) for (let jx = ccx - 1; jx <= ccx + 1; jx++) {
        const j = jy * nw + jx, dx = wx - FPX[j], dy = (wy - FPY[j]) * 1.25, d = dx * dx + dy * dy;
        if (d < d1) { d2 = d1; d1 = d; fx = dx; fy = dy; fid = FID[j]; } else if (d < d2) d2 = d;
      }
      const r1 = Math.sqrt(d1), e = Math.sqrt(d2) - r1, lower = fx * 0.6 + fy > 0;
      const t = [2, 2, 3, 1][fid & 3];
      let c;
      if (e < 1.3) c = mixU(R[0], K.shade, 0.3);
      else if (lower && e < 3.6) c = e < 2.4 ? R[Math.max(0, t - 1)] : RS[Math.max(1, t - 1)];
      else if (!lower && e < 2.4) c = e < 1.9 ? R[Math.min(4, t + 2)] : R[t + 1];
      else c = -(fx * 0.6 + fy) / (r1 + 2) > 0.4 ? R[Math.min(4, t + 1)] : RS[t];
      if (snowy && fy < 0 && e > 1.3 && !(lower && e < 3.6)) c = e < 2.4 || fy < -4 ? K.sn[4] : K.sn[3];
      B[i] = c;
    }
    if (!snowy) scatter(0, 15, 217, 150, tufts('short'), K.g);
  }

  // ---- the void ------------------------------------------------------------------------------------
  // Nothing to walk on: flat dark. Where ground above ends, its edge drops
  // away as a face that fades into the dark in stepped bands; a deck shows its
  // beam and posts.
  function faceRamp(k) { return k === 'veg' || k === 'dirt' || k === 'field' ? K.d : k === 'sand' ? K.sa : k === 'ash' ? K.ash : k === 'wood' || k === 'bridge' ? K.wd : K.s; }
  function voidTile(c, x, y, pal, h, nb, tx, ty) {
    begin(CUR, pal, h, nb, x, y, tx, ty);
    B.fill(K.dark);
    const kN = K8[0], dark = K.dark;
    if (kN !== 'void' && kN !== 'other') {
      if (kN === 'wood' || kN === 'bridge') {
        const R = K.wd;
        for (let i = 0; i < N; i++) {
          const lx = i & 31, ly = i >> 5, pm = (OX + lx) % 40;
          if (ly < 5) B[i] = ly === 0 ? R[2] : ly === 4 ? R[0] : R[1];
          else if (pm >= 14 && pm < 18 && ly < 22) B[i] = mixU(pm === 14 ? R[2] : R[1], dark, (ly - 5) / 17);
        }
      } else {
        const R = faceRamp(kN), snowTop = kN === 'snow' || (kN === 'veg' && K.st.grass === 'snow');
        profile(PR, 0, 25, 11, 3, 6, false);
        for (let x2 = 0; x2 < A; x2++) {
          const wx = OX + x2, streak = ((wx + (hh(wx >> 2, 0, 219) & 3)) % 7) === 0;
          for (let y2 = 0; y2 < PR[x2]; y2++) {
            const band = Math.min(3, Math.floor((y2 / PR[x2]) * 4));
            let col = mixU(R[band === 0 ? 2 : 1], dark, [0.08, 0.3, 0.52, 0.74][band]);
            if (streak) col = mixU(col, dark, 0.3);
            if (snowTop && y2 < 2) col = K.sn[y2 ? 1 : 2];
            B[y2 * A + x2] = col;
          }
        }
      }
    }
    for (const s of [3, 1]) {
      const k = K8[s * 2];
      if (k === 'void' || k === 'other') continue;
      const R = faceRamp(k);
      for (let a = 0; a < A; a++) for (let d = 0; d < 3; d++) {
        const i = sidePix(s, a, d);
        B[i] = mixU(R[1], dark, [0.3, 0.55, 0.78][d] + (s === 1 ? 0.08 : 0));
      }
    }
    out(c, x, y);
  }

  // ---- carpets, paper, tatami sills -----------------------------------------------------------------
  // A rug: woven diamond field, a gold border band where the rug ends, and a
  // fringe of threads over the floor at its top and bottom ends.
  function carpetTile(c, x, y, pal, h, nb, tx, ty) {
    begin(CUR, pal, h, nb, x, y, tx, ty);
    const open = [K8[0] !== 'carpet', K8[2] !== 'carpet', K8[4] !== 'carpet', K8[6] !== 'carpet'];
    const frN = open[0] && FLOORISH[K8[0]], frS = open[2] && FLOORISH[K8[4]];
    if (frN) { const sl = slotOf(K8[0]); for (let i = 0; i < 3 * A; i++) S[i] = sl; }
    if (frS) { const sl = slotOf(K8[4]); for (let i = 29 * A; i < N; i++) S[i] = sl; }
    const C = K.cp, CS = soft(C), TR = K.trim, inN = frN ? 3 : 0, inS = frS ? 3 : 0;
    for (let i = 0; i < N; i++) {
      if (S[i] !== 0) continue;
      const lx = i & 31, ly = i >> 5, wx = OX + lx, wy = OY + ly;
      let bd = 99;
      if (open[0]) bd = Math.min(bd, ly - inN);
      if (open[2]) bd = Math.min(bd, 31 - inS - ly);
      if (open[3]) bd = Math.min(bd, lx);
      if (open[1]) bd = Math.min(bd, 31 - lx);
      let col;
      if (bd === 0) col = C[0];
      else if (bd === 1) col = TR[3];
      else if (bd === 2) col = TR[1];
      else if (bd === 3) col = C[0];
      else if (bd === 4) col = C[1];
      else {
        const p = (wx + wy) & 15, q = (wx - wy + 1024) & 15;
        col = p === 0 || q === 0 ? CS[3] : C[2];
        const dp = Math.abs(p - 8) + Math.abs(q - 8);
        if (dp === 0) col = TR[3];
        else if (dp === 2 && (p === 8 || q === 8)) col = TR[1];
        else if ((p === 8 || q === 8) && dp < 5) col = CS[1];
      }
      B[i] = col;
    }
    for (let s = 1; s < NS; s++) fillKind(SK[s], s);
    const thread = (y0, y1, tipY) => {
      for (let yy = y0; yy <= y1; yy++) for (let xx = 0; xx < A; xx++) {
        const i = yy * A + xx;
        if (((OX + xx) & 1) === 0) B[i] = yy === tipY ? TR[2] : TR[4];
        else if (yy !== tipY) B[i] = mixU(B[i], K.shade, 0.22);
      }
    };
    if (frN) thread(0, 2, 0);
    if (frS) thread(29, 31, 31);
    occlusion();
    out(c, x, y);
  }
  // Loose pages drifted over a stone floor: whole sheets only, each with a lit
  // top edge, a shadow, rows of brush dashes that suggest writing but are far
  // too small to read (or none, where names were wiped).
  function paperTile(c, x, y, pal, h, nb, tx, ty) {
    begin(CUR, pal, h, nb, x, y, tx, ty);
    fillKind('stone', 0);
    const P = K.paper, ink = K.inkU, cell = 17, still = K.name === 'sa_still';
    for (let cy = Math.floor((OY - 22) / cell); cy <= Math.floor((OY + 31) / cell); cy++)
      for (let cx = Math.floor((OX - 22) / cell); cx <= Math.floor((OX + 31) / cell); cx++) {
        const r = hh(cx, cy, 231);
        if ((r & 7) < 5) continue;
        const sw = 11 + (r % 6), sh = 13 + ((r >>> 3) % 6);
        const sx = cx * cell + ((r >>> 6) % 7) - 3, sy = cy * cell + ((r >>> 9) % 7) - 3;
        if (idAt(sx, sy) !== 'paper' || idAt(sx + sw, sy) !== 'paper' || idAt(sx, sy + sh) !== 'paper' || idAt(sx + sw, sy + sh) !== 'paper') continue;
        const tone = (r >>> 12) & 1 ? 2 : 1, blank = (r >>> 13) % (still ? 2 : 4) === 0, fold = (r >>> 16) % 4 === 0;
        for (let yy = 0; yy <= sh; yy++) for (let xx = 0; xx <= sw; xx++) {
          const X = sx + xx - OX, Y = sy + yy - OY;
          if (X < 0 || Y < 0 || X >= A || Y >= A) continue;
          const i = Y * A + X;
          if (xx === sw || yy === sh) { if (xx > 0 && yy > 0) B[i] = mixU(B[i], K.shade, 0.34); continue; }
          if (fold && xx + (2 - yy) >= sw - 1 && yy < 3) { B[i] = xx + (2 - yy) === sw - 1 ? P[1] : mixU(B[i], K.shade, 0.2); continue; }
          let col = P[tone];
          if (yy === 0) col = P[tone + 1];
          else if (xx === 0) col = mixU(P[tone], P[tone + 1], 0.5);
          else if (xx === sw - 1 || yy === sh - 1) col = P[1];
          else if (!blank && xx >= 2 && xx < sw - 2 && yy >= 3 && yy < sh - 2 && yy % 3 === 0) {
            const run = hh(sx + (xx >> 2), sy + yy, 233);
            if ((run & 3) !== 0 && (xx & 3) !== 3) col = mixU(ink, P[tone], 0.62);
          }
          B[i] = col;
        }
      }
    occlusion();
    out(c, x, y);
  }
  // wooden sill where a tatami area ends
  function tatamiSill() {
    for (let s = 0; s < 4; s++) {
      if (K8[s * 2] === 'tatami') continue;
      for (let a = 0; a < A; a++) {
        B[sidePix(s, a, 0)] = K.fl[1];
        B[sidePix(s, a, 1)] = K.fl[3];
        B[sidePix(s, a, 2)] = K.fl[2];
      }
    }
  }

  // ---- registration --------------------------------------------------------------------------------
  wrap('grass', ground('veg'));
  wrap('flowers', ground('veg', (slot) => {
    scatter(slot, 8, 181, 560, ST.flower, K.g, K.g, [0, 0, 0], (wx, wy, r) => {
      if (idAt(wx, wy) !== 'flowers') return false;
      const f = K.fw, k = (r >>> 5) & 3;
      AC = [f[k], k === 0 ? u('#fff8e0') : f[0], mixU(f[k], K.shade, 0.35)];
      return true;
    });
  }));
  wrap('tallgrass', ground('veg', tallClumps));
  wrap('path', ground('dirt'));
  wrap('road', ground('road'));
  wrap('sand', ground('sand'));
  wrap('snow', ground('snow'));
  wrap('ash', ground('ash'));
  wrap('field', ground('field'));
  wrap('ice', ground('ice'));
  wrap('stonefloor', ground('stone'));
  wrap('wood', ground('wood'));
  wrap('tatami', ground('tatami', tatamiSill));
  wrap('glass', ground('glass'));
  wrap('paper', paperTile);
  wrap('carpet', carpetTile);
  wrap('bridgeH', bridge(true));
  wrap('bridgeV', bridge(false));
  wrap('wall', wallTile);
  wrap('cliff', cliffTile);
  wrap('void', voidTile);
  wrap('water', water('deep'));
  wrap('shallow', water('shallow'));
  wrap('darkwater', water('dark'));
  if (T.water) T.water.anim2 = anim('deep');
  if (T.shallow) T.shallow.anim2 = anim('shallow');
  if (T.darkwater) T.darkwater.anim2 = anim('dark');

  // flush(): blit a pending row strip now (the renderer may call it at the end
  // of a static-layer build; otherwise a microtask does it).
  RB.tileArt = { kit, STYLE, flush };
})();
