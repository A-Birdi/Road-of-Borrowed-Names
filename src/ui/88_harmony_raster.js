/* Harmony painted busts — the raster path (docs/harmony/contract/CONTRACT.md §5–§7).
 *
 * Holds an installed set of painted art (the build embeds assets/harmony/ as RB.harmonyAssets; tests install
 * a set themselves), decodes only the files a pairing and a look need, and assembles a bust from them: a
 * companion's frame as delivered (never recoloured), or the player's kit — head, torso, brush arm, hair and
 * every worn accessory — in the contract's layer order, with whole-pixel group and attachment offsets, the hair
 * hidden above a hat's band, and each recolourable pixel replaced by its shade of the look's own ramp (built as
 * the code-drawn busts build their materials, so painted and code art share colour logic). Outline ink, near-white
 * highlights and fixed pixels are never recoloured, whatever a mask says.
 *
 * A bust is painted only when every file it needs exists and is decoded; otherwise the caller draws the WHOLE
 * bust in code (88_harmony_art.js). Nothing here fetches, waits on a learning task or times itself (the API
 * module measures); decoding is asynchronous (createImageBitmap, else an Image from a data URL).
 *
 * API (RB.harmonyRaster)
 *   install({ manifest, files: { 'name.png': base64 | data URL } }, { decode }) → { ok, errors }
 *   uninstall(), active(), manifest(), artVersion()
 *   plan(who, look, state, comp) → { ok, files, missing, state, ... }  (who: 'pc' or a companion)
 *   ready(plan) → every file decoded;  load(names) → Promise (decodes what is missing)
 *   paint(plan, look, fx) → { w, h, px, mt, face, hands, anchor } | null
 *   timeline(comp) → [{ phase, seg, from, to }]
 *   stats(), note(fallback) */
var RB = (globalThis.RB = globalThis.RB || {});

RB.harmonyRaster = (function () {
  'use strict';
  const C = () => RB.harmonyContract;
  const HK = () => RB.harmonyKit;
  const CAP = 48;
  let man = null, src = null, decodeFn = null, err = null;
  const dec = new Map(), pend = new Map();
  const S = { installs: 0, decodes: 0, decodeErrors: [], evictions: 0, paints: 0, fallbacks: 0, log: [], decomposed: 0, recoloured: 0, clipped: 0 };
  const ramps = new Map();

  // ---- install ---------------------------------------------------------------------------------------------------
  function install(assets, opt) {
    opt = opt || {};
    const m = assets && assets.manifest, files = (assets && assets.files) || {};
    const errors = C().validateManifest(m, Object.keys(files));
    uninstall();
    if (errors.length) { err = errors; return { ok: false, errors }; }
    man = m; src = files; decodeFn = opt.decode || null; err = null; S.installs++;
    return { ok: true, errors: [] };
  }
  function uninstall() { man = null; src = null; dec.clear(); pend.clear(); ramps.clear(); err = null; }
  const active = () => !!man;
  const artVersion = () => (man ? man.artVersion : 0);

  // ---- decoding --------------------------------------------------------------------------------------------------------
  const b64of = (s) => (s.indexOf('base64,') >= 0 ? s.slice(s.indexOf('base64,') + 7) : s);
  function canvasOf(w, h) {
    if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(w, h);
    const c = document.createElement('canvas'); c.width = w; c.height = h; return c;
  }
  async function browserDecode(s) {
    const b64 = b64of(s);
    let img;
    if (typeof createImageBitmap === 'function' && typeof Blob !== 'undefined' && typeof atob === 'function') {
      const bin = atob(b64), u8 = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
      img = await createImageBitmap(new Blob([u8], { type: 'image/png' }), { premultiplyAlpha: 'none', colorSpaceConversion: 'none' });
    } else {
      img = new Image();
      img.src = 'data:image/png;base64,' + b64;
      await img.decode();
    }
    const w = img.width, h = img.height, cv = canvasOf(w, h), g = cv.getContext('2d', { willReadFrequently: true });
    g.drawImage(img, 0, 0);
    const data = g.getImageData(0, 0, w, h).data;
    if (img.close) img.close();
    return { w, h, data };
  }
  // pixel codes from a mask: 0 transparent, 1 fixed, 2 + material × 5 + shade (the exact key shade, else the pixel's
  // value on its material's key curve, rounded — for the mask views; recolouring reads the pixel's own colour);
  // outline ink and near-white pixels are fixed whatever the mask says
  let keyIdx = null;
  function keys() {
    if (keyIdx) return keyIdx;
    const P = RB.pxkit, H = C(), exact = new Map();
    H.MATERIALS.forEach((m, mi) => { H.KEY_RAMPS[m].forEach((hx, s) => { const c = P.parse(hx); exact.set((c[0] << 16) | (c[1] << 8) | c[2], mi * 5 + s); }); });
    const mask = H.MATERIALS.map((m) => { const c = P.parse(H.MASK[m]); return (c[0] << 16) | (c[1] << 8) | c[2]; });
    const prot = H.IMPORT.protect.map((hx) => P.parse(hx));
    keyIdx = { exact, mask, prot };
    return keyIdx;
  }
  function protectedPx(r, g, b) {
    const K = keys(), I = C().IMPORT;
    for (let i = 0; i < K.prot.length; i++) {
      const p = K.prot[i], d = Math.hypot(r - p[0], g - p[1], b - p[2]);
      if (d <= (i === 0 ? I.outline : I.white)) return true;
    }
    return false;
  }
  // A material pixel's place on its key curve (look-independent, memoised by colour and material):
  // { t, rho, theta } — RB.harmonyContract.colour.decompose. Exact key shades are never looked up here.
  const dcMemo = new Map();
  const DC_CAP = 1 << 15;
  function dcOf(rgb24, mi) {
    const k = rgb24 * 8 + mi;
    let v = dcMemo.get(k);
    if (v) return v;
    const CC = C().colour, lab = CC.oklab((rgb24 >> 16) & 255, (rgb24 >> 8) & 255, rgb24 & 255);
    v = CC.decompose(lab, C().MATERIALS[mi]);
    if (dcMemo.size >= DC_CAP) dcMemo.clear();
    dcMemo.set(k, v); S.decomposed++;
    return v;
  }
  function codesOf(art, mask) {
    const n = art.w * art.h, code = new Uint8Array(n), K = keys(), a = art.data, m = mask.data;
    for (let i = 0; i < n; i++) {
      const o = 4 * i;
      if (!a[o + 3]) continue;
      code[i] = 1;
      if (!m[o + 3]) continue;
      const mi = K.mask.indexOf((m[o] << 16) | (m[o + 1] << 8) | m[o + 2]);
      if (mi < 0 || protectedPx(a[o], a[o + 1], a[o + 2])) continue;
      const rgb24 = (a[o] << 16) | (a[o + 1] << 8) | a[o + 2], ex = K.exact.get(rgb24);
      let s;
      if (ex != null && Math.floor(ex / 5) === mi) s = ex % 5;
      else { const t = dcOf(rgb24, mi).t; s = t <= 0 ? 0 : t >= 4 ? 4 : Math.round(t); }
      code[i] = 2 + mi * 5 + s;
    }
    return code;
  }
  function decodeOne(name) {
    if (dec.has(name)) { const v = dec.get(name); dec.delete(name); dec.set(name, v); return Promise.resolve(v); }
    if (pend.has(name)) return pend.get(name);
    const f = man && man.files[name];
    if (!f || !src[f.png]) return Promise.reject(new Error('no file ' + name));
    const fn = decodeFn || browserDecode, mine = man;
    const p = Promise.all([fn(src[f.png]), f.mask ? fn(src[f.mask]) : null]).then(([art, mk]) => {
      if (man !== mine) return null; // uninstalled or replaced meanwhile
      if (art.w !== C().BUST.w || art.h !== C().BUST.h) throw new Error(name + ': decoded ' + art.w + ' × ' + art.h);
      const px = new Uint32Array(art.data.buffer.slice(art.data.byteOffset, art.data.byteOffset + art.data.byteLength));
      const v = { w: art.w, h: art.h, px, code: mk ? codesOf(art, mk) : null };
      dec.set(name, v); S.decodes++;
      while (dec.size > CAP) { dec.delete(dec.keys().next().value); S.evictions++; }
      return v;
    }).catch((e) => { S.decodeErrors.push(name + ': ' + (e && e.message)); if (S.decodeErrors.length > 24) S.decodeErrors.shift(); return null; })
      .finally(() => pend.delete(name));
    pend.set(name, p);
    return p;
  }
  function load(names) { return Promise.all([...new Set(names || [])].map(decodeOne)).then((r) => r.filter(Boolean).length); }

  // ---- what a bust needs ----------------------------------------------------------------------------------------------
  const has = (n) => !!(man && man.files[n]);
  function plan(who, look, state, comp) {
    const H = C();
    if (!man) return { ok: false, files: [], missing: [], reason: 'no painted art installed' };
    if (H.STATES.indexOf(state) < 0) return { ok: false, files: [], missing: [], reason: 'not a state: ' + state };
    if (who !== 'pc') {
      const set = man.companions && man.companions[who];
      if (!set) return { ok: false, files: [], missing: [who + '_*'], reason: 'no painted ' + who };
      const lack = H.REQUIRED.filter((s) => set.states.indexOf(s) < 0);
      if (lack.length) return { ok: false, files: [], missing: lack.map((s) => who + '_' + s), reason: who + ': required states missing' };
      const st = H.stateFor(state, set.states);
      const files = [], layers = [];
      if (set.mode === 'layered') { for (const l of set.layers) if (has(who + '_' + st + '_' + l)) { files.push(who + '_' + st + '_' + l); layers.push(l); } }
      else files.push(who + '_' + st);
      const fx = set.mode !== 'layered' && has(who + '_' + st + '_fx') ? who + '_' + st + '_fx' : null;
      return { ok: true, who, state: st, asked: state, files: fx ? files.concat([fx]) : files, fx, layers, missing: [], face: (set.face && set.face[st]) || H.ANCHORS.comp.face };
    }
    // the player's kit
    look = look || {};
    const SP = RB.sprites, P = man.pc || {};
    const style = SP.HAIRSTYLES.indexOf(look.hair) >= 0 ? look.hair : 'short';
    const shape = look.shape || 'tunic', sleeve = H.sleeveOf(shape), expr = H.EXPR_OF[state];
    let pose = H.armOf(state, comp), arm = 'pc_arm_' + pose + '_' + sleeve;
    if (pose === 'prep_b' && !has(arm)) { pose = 'prep_a'; arm = 'pc_arm_prep_a_' + sleeve; }
    const swing = H.SWING_STATES.indexOf(state) >= 0;
    const hairOf = (part) => { const n = 'pc_hair_' + style + '_' + part; return swing && has(n + '_swing') ? n + '_swing' : n; };
    const parts = [{ slot: 'head', file: 'pc_head_' + expr }, { slot: 'torso', file: 'pc_torso_' + shape }, { slot: 'arm', file: arm }, { slot: 'hair_front', file: hairOf('front') }];
    if (H.FRONT_ONLY.indexOf(style) < 0) parts.push({ slot: 'hair_back', file: hairOf('back') });
    const af = H.accFiles(look);
    for (const f of af.files) parts.push({ slot: f.slot, file: f.file, acc: f.acc });
    const missing = parts.filter((q) => !has(q.file)).map((q) => q.file).concat(af.unknown.map((a) => 'acc ' + a + ' (unknown)'));
    const g = (P.groups && P.groups[state]) || {};
    const face = ((P.face && P.face[expr]) || H.ANCHORS.pc.face).slice();
    const hd = g.head || [0, 0];
    return { ok: !missing.length, who: 'pc', state, comp, style, shape, sleeve, expr, pose, parts, files: parts.map((q) => q.file), missing, groups: { head: hd, torso: g.torso || [0, 0] }, face: [face[0] + hd[0], face[1] + hd[1], face[2] + hd[0], face[3] + hd[1]] };
  }
  const ready = (pl) => !!(pl && pl.ok && pl.files.every((n) => dec.has(n)));

  // ---- the look's ramps (as the code busts build their materials) ---------------------------------------------------------
  // Each recolourable material of a look gets a ROW: ramp (the five tones the exact key shades take — PICK of the code
  // material's tones, exactly as in contract v2), curve (the target curve through ALL of that material's tones, the
  // key shades at their PICKed tones: RB.harmonyContract.colour.targetCurve) and a memo (painted colour → output).
  function pick(M, idx) { return idx.map((i) => M.c[Math.min(i, M.c.length - 1)]); }
  const pickOf = (M) => (M.n >= 6 ? C().PICK.n6 : M.n === 5 ? C().PICK.n5 : C().PICK.n4);
  const rgbOfPacked = (p) => [p & 255, (p >>> 8) & 255, (p >>> 16) & 255];
  // `exact`: the colours the five exact key shades take — the ramp's tones, unless the value floor opened this ramp
  // (then the opened curve's colour at that shade: listed in docs/screenshots/harmony/recolour_v3/proof.json)
  function rowOf(M, idx) {
    const at = idx.map((i) => Math.min(i, M.c.length - 1)), ramp = pick(M, at), CC = C().colour;
    const curve = CC.targetCurve(Array.from(M.c, rgbOfPacked), at);
    const exact = ramp.map((p, s) => {
      const nd = curve.find((n) => n.t === s);
      if (!nd || nd.L === nd.L0) return p;
      const c = CC.srgbOf(nd.L, nd.a, nd.b);
      return (0xff000000 | (c[2] << 16) | (c[1] << 8) | c[0]) >>> 0;
    });
    return { ramp, exact, opened: exact.some((p, s) => p !== ramp[s]), curve, memo: new Map() };
  }
  function rampsOf(look) {
    const k = HK().lookKey(look);
    let r = ramps.get(k);
    if (r) return r;
    const col = RB.sprites.colorsOf(look), H = HK(), PK = C().PICK;
    const rows = {
      skin: rowOf(H.skinMat(col.skin), PK.skin), hair: rowOf(H.hairMat(col.hair), PK.n6),
      clothMain: rowOf(H.clothMat(col.cloth[0]), PK.n6), clothTrim: rowOf(H.clothMat(col.cloth[2], { step: 0.09 }), PK.n6),
      wrap: rowOf(H.clothMat(look.wrapCol || col.cloth[2]), PK.n6),
    };
    r = { skin: rows.skin.ramp, hair: rows.hair.ramp, clothMain: rows.clothMain.ramp, clothTrim: rows.clothTrim.ramp, wrap: rows.wrap.ramp, rows, acc: {}, accRows: {}, cloth: col.cloth };
    ramps.set(k, r);
    while (ramps.size > 16) ramps.delete(ramps.keys().next().value);
    return r;
  }
  function accRow(r, look, a) {
    if (r.accRows[a] !== undefined) return r.accRows[a];
    const ch = C().ACC[a] && C().ACC[a].channel;
    if (!ch) { r.accRows[a] = null; return null; }
    let M;
    const v = look[ch.field];
    if (v) M = HK().M('acc_' + a, v, ch.opts);
    else if (ch.def === 'metal') M = HK().metalMat('#e0b850');
    else M = HK().M('acc_' + a, ch.def === 'cloth.2' ? r.cloth[2] : ch.def, ch.opts);
    r.accRows[a] = rowOf(M, pickOf(M));
    r.acc[a] = r.accRows[a].ramp;
    return r.accRows[a];
  }
  const accRamp = (r, look, a) => { const row = accRow(r, look, a); return row ? row.ramp : null; };
  // One material pixel (packed RGBA) of material mi → its colour in the look (packed): an exact key shade takes its
  // ramp tone (contract v2's colours, exactly, unless the value floor opened the ramp); any other painted value is
  // decomposed against its key curve and rebuilt on the row's target curve (value, then chroma and hue deviation ×
  // RECOLOUR.residual, into the gamut).
  function recolourPx(row, mi, p) {
    const rgb24 = ((p & 255) << 16) | (p & 0xff00) | ((p >>> 16) & 255);
    let q = row.memo.get(rgb24);
    if (q !== undefined) return q;
    const ex = keys().exact.get(rgb24);
    if (ex != null && Math.floor(ex / 5) === mi) q = row.exact[ex % 5];
    else { const c = C().colour.recolour(dcOf(rgb24, mi), row.curve); q = (0xff000000 | (c[2] << 16) | (c[1] << 8) | c[0]) >>> 0; S.recoloured++; if (c[3]) S.clipped++; }
    if (row.memo.size > 8192) row.memo.clear();
    row.memo.set(rgb24, q);
    return q;
  }

  // ---- assembling ------------------------------------------------------------------------------------------------------
  // draw a decoded file into out at (dx, dy); recolour with `tab` (material → 5 packed colours); skip(x, y) hides
  function draw(out, f, dx, dy, tab, skip) {
    const W = f.w, H = f.h, px = f.px, code = f.code;
    for (let y = 0; y < H; y++) {
      const Y = y + dy;
      if (Y < 0 || Y >= H) continue;
      for (let x = 0; x < W; x++) {
        const i = y * W + x, p = px[i];
        if (!(p >>> 24)) continue;
        const X = x + dx;
        if (X < 0 || X >= W) continue;
        if (skip && skip(X, Y)) continue;
        let q = p;
        // (a row is a look's material: its own colour per painted value; a plain list of five tones is the v2 lookup)
        if (code && code[i] >= 2 && tab) { const c = code[i] - 2, mi = (c / 5) | 0, row = tab[mi]; if (row) q = Array.isArray(row) ? row[c % 5] : recolourPx(row, mi, p); }
        out[Y * W + X] = q;
      }
    }
  }
  function paint(pl, look, fx) {
    if (!ready(pl)) return null;
    const H = C(), W = H.BUST.w, Hh = H.BUST.h, out = new Uint32Array(W * Hh);
    const res = { w: W, h: Hh, px: out, mt: new Uint16Array(W * Hh), anchor: null, face: null, hands: [] };
    const box = (b) => ({ x: b[0], y: b[1], w: b[2] - b[0], h: b[3] - b[1] });
    if (pl.who !== 'pc') {
      for (const n of pl.files) if (n !== pl.fx) draw(out, dec.get(n), 0, 0, null);
      if (pl.fx && fx !== false) draw(out, dec.get(pl.fx), 0, 0, null);
      const nk = H.ANCHORS.comp.neck;
      res.anchor = { x: nk[0], y: nk[1] }; res.face = box(pl.face);
      S.paints++;
      return res;
    }
    const r = rampsOf(look), P = man.pc || {};
    const base = [r.rows.skin, r.rows.hair, r.rows.clothMain, r.rows.clothTrim, null];
    // slot order, with the pose's arm slot and glasses over a listed fringe
    let order = H.PC_SLOTS.slice();
    const armAt = P.armSlot && P.armSlot[pl.pose];
    if (armAt && H.ARM_SLOT[armAt]) { order = order.filter((s) => s !== 'arm'); order.splice(order.indexOf(H.ARM_SLOT[armAt]), 0, 'arm'); }
    if ((P.glassesOver || []).indexOf(pl.style) >= 0) { order = order.filter((s) => s !== 'glasses'); order.splice(order.indexOf('hair_front') + 1, 0, 'glasses'); }
    // a hat or cap hides the hair above its band (its row plus the style's attachment offset and the head group's)
    let band = null;
    for (const q of pl.parts) if (q.acc && H.ACC[q.acc].hides && P.hatBand && P.hatBand[q.acc] != null) {
      const at = (P.attach && P.attach[pl.style] && P.attach[pl.style][q.acc]) || [0, 0];
      const y = P.hatBand[q.acc] + at[1] + pl.groups.head[1];
      band = band == null ? y : Math.max(band, y);
    }
    const hide = band == null ? null : (x, y) => y < band;
    const rank = (q) => { const L = H.SLOT_ORDER[q.slot]; return L ? L.indexOf(q.acc) : 0; };
    let armBox = null;
    for (const slot of order) {
      const qs = pl.parts.filter((q) => q.slot === slot).sort((a, b) => rank(a) - rank(b));
      for (const q of qs) {
        const f = dec.get(q.file), g = pl.groups[H.GROUP_OF[slot]] || [0, 0];
        let dx = g[0], dy = g[1];
        if (q.acc && H.ACC[q.acc].hair && P.attach && P.attach[pl.style] && P.attach[pl.style][q.acc]) { dx += P.attach[pl.style][q.acc][0]; dy += P.attach[pl.style][q.acc][1]; }
        let tab = base;
        if (q.acc) { tab = base.slice(); tab[4] = accRow(r, look, q.acc); }
        else if (/^pc_hair_wrap_/.test(q.file)) { tab = base.slice(); tab[3] = r.rows.wrap; }
        draw(out, f, dx, dy, tab, slot === 'hair_back' || slot === 'hair_front' ? hide : null);
        if (slot === 'arm') armBox = bbox(f.px, f.w, f.h, dx, dy);
      }
    }
    const nk = H.ANCHORS.pc.neck;
    res.anchor = { x: nk[0], y: nk[1] }; res.face = box(pl.face);
    if (armBox) res.hands.push(Object.assign({ side: 'near' }, armBox));
    S.paints++;
    return res;
  }
  function bbox(px, w, h, dx, dy) {
    let x0 = w, y0 = h, x1 = -1, y1 = -1;
    for (let i = 0; i < px.length; i++) if (px[i] >>> 24) { const x = i % w, y = (i / w) | 0; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    if (x1 < 0) return null;
    const X0 = Math.max(0, x0 + dx), Y0 = Math.max(0, y0 + dy), X1 = Math.min(w - 1, x1 + dx), Y1 = Math.min(h - 1, y1 + dy);
    return { x: X0, y: Y0, w: X1 - X0 + 1, h: Y1 - Y0 + 1 };
  }

  // ---- timing ------------------------------------------------------------------------------------------------------------
  // a companion with a complete painted set: its states (and the manifest's overrides); otherwise the default
  // timeline (its code bust maps each state to enter or hold)
  function timeline(comp) {
    if (!man) return null;
    const set = man.companions && man.companions[comp];
    const done = set && C().REQUIRED.every((s) => set.states.indexOf(s) >= 0);
    return done ? C().timeline(set.states, set.timeline) : C().timeline();
  }

  // ---- diagnostics -------------------------------------------------------------------------------------------------------
  function note(f) { S.fallbacks++; S.log.push(f); while (S.log.length > 24) S.log.shift(); }
  function stats() {
    let bytes = 0;
    for (const v of dec.values()) bytes += v.px.byteLength + (v.code ? v.code.byteLength : 0);
    return {
      active: !!man, error: err, set: man ? man.set : null, synthetic: man ? !!man.synthetic : null, artVersion: artVersion(), contractVersion: C().VERSION,
      files: man ? Object.keys(man.files).length : 0, decoded: dec.size, pending: pend.size, decodedBytes: bytes, cap: CAP,
      decodes: S.decodes, evictions: S.evictions, decodeErrors: S.decodeErrors.slice(), paints: S.paints, fallbacks: S.fallbacks, fallbackLog: S.log.slice(), looksCached: ramps.size,
      // contract v3: painted colours decomposed against their key curve (once per colour and material), colours
      // rebuilt on a look's target curve (once per colour and look ramp), of which had to be pulled into the gamut
      decomposed: S.decomposed, recoloured: S.recoloured, gamutClipped: S.clipped, approval: man ? C().approvalOf(man) : null,
    };
  }

  // the build's embedded set (assets/harmony/), when there is one
  if (RB.harmonyAssets && RB.harmonyAssets.manifest) { try { install(RB.harmonyAssets); } catch (e) { err = [String(e && e.message)]; } }

  return { install, uninstall, active, manifest: () => man, artVersion, plan, ready, load, paint, timeline, stats, note, _: { codesOf, rampsOf, accRamp, accRow, recolourPx, rowOf, draw, decoded: dec } };
})();
