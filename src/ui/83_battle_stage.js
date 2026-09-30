/* The battle stage: where everyone stands and how they are drawn, at art
 * resolution, from the DISPLAYED battle state (src/ui/80_combat.js keeps it
 * one beat behind the rules until each result is shown). It owns:
 * - the arrangement: the two adventurers at the lower left, a little apart
 *   and staggered in depth, facing up-right toward the creature; an integer
 *   scale chosen from the stage size and the battle frame (RB.battlers.FRAME);
 * - the actors' current poses (RB.battlers.draw; a small fallback below
 *   stands in when that module is absent) and the creature's action pose
 *   (RB.enemyArt.drawPosed);
 * - persistent status marks, transient effects (RB.battleFx), small pixel
 *   numbers, and the paper strip that carries a resolved word (DOM, so the
 *   Japanese is crisp and keeps its furigana);
 * - anchors: every effect names its target by id ('pc', 'comp', 'party',
 *   'foe', 'foe:i', 'foes', 'knot:j', 'knot:i:j') and a part ('hand', 'head',
 *   'chest', 'feet', 'core', 'top', 'base'), resolved each frame, so a resize
 *   mid-effect keeps it on its actor. An effect with p.foe = i is drawn on
 *   creature i ('foe' means that creature to it);
 * - a group of creatures: a small formation right of the party, each with
 *   its own knots, states, action pose and settled look; the current target's
 *   ink bracket at its feet, preview chevrons over everyone a response would
 *   reach, and the boxes where each creature can be pressed (foeAt).
 * Presentation only: nothing here reads or changes the battle rules. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.battleStage = (function () {
  'use strict';
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const cl = (v) => clamp(v, 0, 1);
  const bell = (k) => Math.sin(Math.PI * cl(k));

  // ---- fallback battlers ---------------------------------------------------------------------
  // Used only while RB.battlers (the character art's battle frames) is not
  // loaded: the straight-back walking sprite with simple offsets per pose and
  // a tiny prop per gesture, behind the same interface, so the choreography
  // runs and can be tested. The real module replaces it without changes here.
  const FALLBACK = (function () {
    // the road sprite's own frame (40×58 today; 32×48 before the character standard)
    const RF = () => (RB.sprites && RB.sprites.FRAME) || { w: 32, h: 48 };
    const RA = () => (RB.sprites && RB.sprites.ANCHOR) || { x: 16, y: 47 };
    const POSES = ['ready', 'calm', 'anticipate', 'act', 'recover', 'hit', 'brace', 'down', 'cheer'];
    const GESTURES = ['direct', 'trace', 'book', 'ward', 'restore', 'flow', 'raise'];
    const cache = new Map();
    function sprite(look) {
      const S = RB.sprites;
      const key = JSON.stringify(look);
      let spr = cache.get(key);
      if (!spr) {
        spr = (typeof S.getArt === 'function' && S.getArt(look, 'up', 0)) || S.get(look, 'up', 0);
        cache.set(key, spr);
        while (cache.size > 6) cache.delete(cache.keys().next().value);
      }
      return spr;
    }
    const R = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); };
    function prop(c, g, hx, hy, q, k) {
      if (!g) return;
      if (g === 'book') { R(c, hx - 5 * q, hy - 2 * q, 10 * q, 5 * q, '#b8a47a'); R(c, hx - 4 * q, hy - 2 * q, 8 * q, 4 * q, '#efe4c8'); R(c, hx, hy - 2 * q, q, 4 * q, '#6e5a48'); }
      else if (g === 'direct') { for (let i = 0; i < 3; i++) R(c, hx + i * 2 * q, hy - i * 2 * q, 2 * q, q, '#efe4c8'); }
      else if (g === 'ward') { R(c, hx - q, hy - 2 * q, 3 * q, 4 * q, '#fff4c8'); R(c, hx, hy - q, q, 2 * q, '#c8503a'); }
      else if (g === 'restore') { R(c, hx - 2 * q, hy - 3 * q - Math.round(2 * k) * q, q, q, '#b4e0a0'); R(c, hx + q, hy - 4 * q - Math.round(3 * k) * q, q, q, '#e8f8d8'); }
      else if (g === 'flow') { for (let i = 0; i < 4; i++) R(c, hx + i * q, hy - (i % 2) * q, q, q, '#8cc8f0'); }
      else if (g === 'raise') { R(c, hx - q, hy - q, 3 * q, 3 * q, '#fff4c8'); R(c, hx, hy - 3 * q, q, 7 * q, '#fff4c8'); R(c, hx - 3 * q, hy, 7 * q, q, '#fff4c8'); }
      else if (g === 'trace') { R(c, hx, hy - 5 * q, q, 6 * q, '#3a2c28'); R(c, hx, hy + q, q, q, '#2a2024'); }
    }
    // o: { x, y (the foot point), scale, t, who, pose, gesture, k, reduce, facing }
    // Offsets below are in 32×48 sprite units, mapped onto the road frame.
    function draw(c, look, o) {
      const spr = sprite(look), F = RF(), AN = RA();
      const s = o.scale || 1, q = s * (F.w / spr.width); // canvas px per source px
      const fx = F.w / 32, fy = F.h / 48;             // road frame px per 32×48 unit
      const k = cl(o.k == null ? 1 : o.k), pose = o.pose || 'ready', rd = !!o.reduce;
      const per = o.who === 'comp' ? 3100 : 2600, ph = o.who === 'comp' ? 1100 : 0;
      const breathe = (P) => { const u = (((o.t || 0) + ph) % P) / P; return u > 0.5 && u < 0.92 ? 1 : 0; };
      let dx = 0, dy = 0, lean = 0, sink = 0, hx = 26, hy = 30, g = null;
      if (pose === 'ready') sink = rd ? 0 : breathe(per);
      else if (pose === 'calm') sink = rd ? 0 : breathe(per * 1.5);
      else if (pose === 'anticipate') { sink = k > 0.25 ? 1 : 0; lean = -1; hy = 29; g = o.gesture; }
      else if (pose === 'act') { lean = k < 0.12 ? 1 : 2; dy = rd ? 0 : -Math.round(bell(k)); hx = 28; hy = o.gesture === 'raise' ? 13 : o.gesture === 'book' ? 26 : 19; g = o.gesture; }
      else if (pose === 'recover') { lean = k < 0.5 ? 1 : 0; hy = k < 0.5 ? 24 : 29; g = k < 0.4 ? o.gesture : null; }
      else if (pose === 'hit') { lean = rd ? -1 : k < 0.6 ? -2 : -1; dx = rd ? 0 : -Math.round(2 * (1 - k)); }
      else if (pose === 'brace') { sink = 1; lean = 1; }
      else if (pose === 'down') { sink = 6; lean = -1; hy = 34; }
      else if (pose === 'cheer') { dy = rd ? 0 : -Math.round(3 * bell(k)); hx = 27; hy = 16; }
      const sp = s;                                   // canvas px per road-frame px
      const x0 = Math.round(o.x - AN.x * sp) + dx * sp, y0 = Math.round(o.y - AN.y * sp) + dy * sp;
      const sh = spr.height, sw = spr.width, H = F.h;
      const cut = Math.round(H * 0.625);              // the upper body leans; the legs stay planted
      c.imageSmoothingEnabled = false;
      c.drawImage(spr, 0, ((cut + sink) * sh) / H, sw, ((H - cut - sink) * sh) / H, x0, y0 + (cut + sink) * sp, F.w * sp, (H - cut - sink) * sp);
      for (let r = 0; r < cut; r += 6) {
        const bh = Math.min(6, cut - r), off = Math.round(lean * (1 - (r + bh / 2) / cut));
        c.drawImage(spr, 0, (r * sh) / H, sw, (bh * sh) / H, x0 + off * sp, y0 + (r + sink) * sp, F.w * sp, bh * sp);
      }
      const P = (ux, uy) => ({ x: x0 + Math.round(ux * fx) * sp, y: y0 + Math.round(uy * fy) * sp });
      const hand = P(hx + lean, hy + sink);
      if (g) prop(c, g, hand.x, hand.y, sp, k);
      void q;
      return { hand, head: P(16 + lean, 6 + sink), chest: P(16, 22 + sink), feet: { x: Math.round(o.x), y: Math.round(o.y) } };
    }
    return { get FRAME() { return RF(); }, get ANCHOR() { return RA(); }, POSES, GESTURES, draw, fallback: true };
  })();
  const battlers = () => (RB.battlers && typeof RB.battlers.draw === 'function' && RB.battlers.FRAME ? RB.battlers : FALLBACK);

  // ---- one encounter's stage -------------------------------------------------------------------
  let S = null;
  // env: { enemy, foes() → [{ art, artOpts, id }] (the encounter's creatures, the
  // rules' order; the lead first), overlay, view(), hasComp(), looks(), marks() →
  // { target (index or null), preview: { foes: [i], allies: ['pc'|'comp'] } } }
  function begin(env) {
    end();
    S = {
      env, lay: null, anchors: { pc: null, comp: null }, foeOffs: [], act: 0,
      actors: { pc: null, comp: null }, foes: [], settledAt: [], final: false,
      effects: [], nums: [], strip: null, fxLayer: null, drawn: 0, cost: [], hits: [],
    };
    if (env.overlay) {
      const L = document.createElement('div');
      L.className = 'cb-fx';
      L.setAttribute('aria-hidden', 'true');
      env.overlay.appendChild(L);
      S.fxLayer = L;
    }
  }
  function end() {
    if (!S) return;
    if (S.fxLayer && S.fxLayer.parentNode) S.fxLayer.parentNode.removeChild(S.fxLayer);
    S = null;
  }
  const foeDefs = () => (S.env.foes ? S.env.foes() : [{ art: S.env.enemy.art, artOpts: S.env.enemy.artOpts, id: S.env.enemy.id }]);

  // ---- arrangement -------------------------------------------------------------------------------
  // Stage rect Sr in art px. The creature keeps the scene's scale rule; the
  // party gets an integer scale that makes a figure about 44 % of the stage
  // height (never taller than the creature), so a larger battle frame simply
  // means scale 1 instead of 2 at the same size.
  // Several creatures stand in a small formation right of the party: two as a
  // pair (one a step back on the left, the lead in front on the right), three
  // with the lead in front in the middle and one a step back on either side.
  // Everyone keeps the whole-pixel scale; a group on a stage that would draw a
  // lone creature at 2× draws at the largest scale at which it fits.
  function layout(Sr, w, h) {
    const env = S.env, defs = foeDefs(), n = defs.length;
    let scale = Math.max(1, Math.min(3, Math.floor(Math.min(Sr.h / 224, Sr.w / 300))));
    const exts = defs.map((d) => RB.enemyArt.extent(d.art || 'wisp', d.artOpts || {}));
    if (n > 1) {
      // the formation spans about the widest creature plus 70 % of each other one
      const span = exts.reduce((m, e) => m + (e.right - e.left) * 0.7, 0) + Math.max(...exts.map((e) => e.right - e.left)) * 0.3;
      while (scale > 1 && span * scale > Sr.w * 0.72) scale--;
    }
    const ext = exts[0];
    const foeH = Math.max(...exts.map((e) => e.bottom - e.top)) * scale;
    const B = battlers(), F = B.FRAME, AN = B.ANCHOR;
    const want = Math.max(40, Math.min(Sr.h * 0.44, foeH * 0.9, 170));
    const ps = Math.max(1, Math.round(want / F.h));
    const pw = F.w * ps, ph = F.h * ps;
    const hasComp = !!env.hasComp();
    const foot = Math.round(Sr.y + Sr.h - Math.max(4, ph * 0.05));
    // the companion a step back on the left; you in front on the right, nearest
    // the creature, so your gestures reach it without crossing anyone
    const x0 = Math.round(Sr.x + Math.max(8, Sr.w * 0.06) + AN.x * ps);
    const comp = hasComp ? { x: x0, y: Math.round(foot - Math.max(4, ph * 0.09)) } : null;
    const pc = { x: hasComp ? Math.round(x0 + pw * 0.8 + Math.max(6, pw * 0.22)) : Math.round(x0 + pw * 0.3), y: foot };
    // the cosmetic pet's place (src/ui/85_battle_pets.js): on the ground between the two of you, a little
    // in front of your companion and behind you (travelling alone: at your left); never a party slot
    const pet = RB.battlePets && RB.battlePets.wants() ? (hasComp ? { x: Math.round((comp.x + pc.x) / 2 + pw * 0.03), y: Math.round((comp.y + foot) / 2 + 1) } : { x: Math.round(pc.x - pw * 0.52), y: Math.round(foot - Math.max(2, ph * 0.04)) }) : null;
    const right = pc.x + (F.w - AN.x) * ps;
    // one creature: right of centre, clear of the party where the stage allows
    const place1 = (e, fx) => {
      let ex = Sr.x + Sr.w * fx;
      ex = Math.max(ex, right - e.left * scale * 0.55);
      ex = Math.round(Math.min(ex, Sr.x + Sr.w - e.right * scale * 0.85));
      let ey = Math.round(Math.min(Sr.y + Sr.h - 100 * scale, Math.max(Sr.y + 80 * scale, Sr.y + Sr.h * 0.44)));
      ey = Math.min(Math.max(ey, Math.round(Sr.y - e.top * scale + 2)), Math.round(Sr.y + Sr.h - 64 * scale));
      return { ex, ey };
    };
    const foes = [];
    if (n === 1) {
      const { ex, ey } = place1(ext, 0.62);
      foes.push({ ex, ey, ext, row: 'front' });
    } else {
      // A formation right of the party (left → right), the lead in front: a pair
      // is one a step back on the left and the lead on the right; three are one
      // back on either side and the lead in front between them. They stay clear
      // of the party where the stage allows and overlap one another (the one in
      // front drawn last) where it does not.
      const slots = n === 2 ? ['back', 'front'] : ['back', 'front', 'back'];
      const leadSlot = 1;
      const order = [leadSlot].concat(slots.map((_, k) => k).filter((k) => k !== leadSlot)); // rules index → slot
      const bySlot = []; order.forEach((sl, i) => { bySlot[sl] = i; });
      const xb = Sr.x + Sr.w - 2 * scale;
      const front = place1(exts.reduce((a, e) => (e.bottom - e.top > a.bottom - a.top ? e : a), ext), 0.62);
      // the party's heads: a creature a step back on the left floats above them
      // when the stage is tall enough; otherwise it keeps right of the party
      const partyTop = Math.min(pc.y, comp ? comp.y : pc.y) - ph * 0.95;
      const eyOf = (e, row) => {
        const lo = Math.round(Sr.y - e.top * scale + 2), hi = Math.round(Sr.y + Sr.h - 64 * scale);
        if (row === 'front') return Math.min(Math.max(front.ey + Math.round(8 * scale), lo), hi);
        const want = Math.min(front.ey - Math.round(44 * scale), Math.round(partyTop - e.bottom * scale * 0.9));
        return Math.min(Math.max(want, lo), hi);
      };
      const eL = exts[bySlot[0]], eyL = eyOf(eL, 'back');
      const above = eyL + eL.bottom * scale * 0.9 <= partyTop + 6 * scale;
      const eR = exts[bySlot[n - 1]], eF = exts[bySlot[1]];
      let cL, cR, cF;
      if (above) {
        // room above the party: the one on the left floats over it
        cL = Sr.x + Sr.w * 0.2 - eL.left * scale * 0.92;
        cR = xb - eR.right * scale * 0.95;
        cF = n === 2 ? cR : Math.max(right - eF.left * scale * 0.6, (cL + cR) / 2);
        if (n === 3) cF = Math.min(cF, cR - (eF.right - eR.left) * scale * 0.45);
      } else {
        // a short stage: spread evenly across its right two thirds; they overlap,
        // and the target (or the one acting) is drawn in front of the others
        const f = n === 2 ? [0.5, 0.86] : [0.36, 0.64, 0.92];
        cL = Sr.x + Sr.w * f[0]; cR = Sr.x + Sr.w * f[n - 1]; cF = n === 2 ? cR : Sr.x + Sr.w * f[1];
      }
      for (let i = 0; i < n; i++) {
        const sl = order[i], e = exts[i];
        let ex = sl === 0 ? cL : sl === n - 1 && n === 3 ? cR : cF;
        // whole creature on the stage
        ex = Math.round(Math.min(Math.max(ex, Sr.x - e.left * scale * 0.7), Sr.x + Sr.w - e.right * scale * 0.9));
        const row = slots[sl];
        foes.push({ ex, ey: eyOf(e, row), ext: e, row, slot: sl });
      }
    }
    const gs = n > 1;
    for (let i = 0; i < n; i++) {
      const f = foes[i], e = f.ext;
      f.ky = Math.round(Math.min(f.ey + (gs ? 62 : 88) * scale + 12, Sr.y + Sr.h - 10 * scale));
      f.foeR = Math.round(Math.min(e.right - e.left, e.bottom - e.top) * 0.42 * scale);
      f.shadowY = f.ey + (gs ? 64 : 84) * scale;
      f.shadowR = Math.round((gs ? Math.min(58, (e.right - e.left) * 0.36) : 58) * scale);
      f.knotSpan = (gs ? 22 : 60) * scale;
    }
    // drawn back row first, then front, each row left to right
    const drawOrder = foes.map((f, i) => i).sort((a, b) => (foes[a].row === foes[b].row ? foes[a].ex - foes[b].ex : foes[a].row === 'back' ? -1 : 1));
    // left to right, as the keyboard steps through them
    const visual = foes.map((f, i) => i).sort((a, b) => foes[a].ex - foes[b].ex || a - b);
    const L0 = foes[0];
    const hz = Math.max(0, Math.min(h - 1, Math.round(Math.min(Math.min(...foes.map((f) => f.ey)) + 36 * scale, foot - ph * 0.66))));
    const u = scale;
    // the party's box in canvas px (both frames, with room for gestures and seals), for the
    // backdrop composer to keep clear; px/py/ps as the backdrop expects (top-left, scale)
    const fr = (f) => ({ x0: f.x - AN.x * ps, y0: f.y - AN.y * ps, x1: f.x + (F.w - AN.x) * ps, y1: f.y + (F.h - AN.y) * ps });
    const boxes = [fr(pc)].concat(comp ? [fr(comp)] : []).concat(pet ? [{ x0: pet.x - 24 * ps, y0: pet.y - 46 * ps, x1: pet.x + 26 * ps, y1: pet.y + 3 * ps }] : []);
    const mx = Math.round(pw * 0.2), my = Math.round(ph * 0.12);
    const party = { x: Math.min(...boxes.map((q) => q.x0)) - mx, y: Math.min(...boxes.map((q) => q.y0)) - my };
    party.w = Math.max(...boxes.map((q) => q.x1)) + mx - party.x; party.h = Math.max(...boxes.map((q) => q.y1)) - party.y;
    // px/py: the backdrop's "old corner" convention (your feet at px + 16·ps, py + 48·ps);
    // its party box runs from the stage's left edge to px + 140·ps and up to 112·ps above
    // your feet, which covers you and your companion (a step back, on your left)
    S.lay = {
      Sr, scale, ps, pw, ph, pc, comp, ex: L0.ex, ey: L0.ey, ky: L0.ky, hz, ext, u, foeR: L0.foeR, wardR: Math.round(ph * 0.34), F, AN, party,
      px: pc.x - 16 * ps, py: pc.y - 48 * ps, fallback: !!B.fallback, foes, drawOrder, visual, group: gs, pet,
    };
    return S.lay;
  }
  // knot j of creature i (a fan under a lone creature; a short row under one of a group)
  function knotAt(i, j, n) {
    const L = S.lay, f = L.foes[i] || L.foes[0];
    if (L.group) {
      const gap = 16 * L.scale;
      return { x: Math.round(f.ex + (j - (n - 1) / 2) * gap), y: f.ky };
    }
    const a = -Math.PI / 2 + (j - (n - 1) / 2) * 0.5;
    return { x: Math.round(f.ex + Math.cos(a) * 60 * L.scale), y: Math.round(f.ky + Math.sin(a) * 8) };
  }
  function viewFoe(i) {
    const v = S.env.view();
    return v && v.foes ? v.foes[i] : v;
  }

  // ---- anchors ---------------------------------------------------------------------------------
  // ids: 'pc', 'comp', 'party', 'foe' (the lead, or the creature an effect names),
  // 'foe:i', 'foes' (the middle of the standing creatures), 'knot:j' (the lead's),
  // 'knot:i:j'
  function anchor(id, part) {
    const L = S && S.lay;
    if (!L) return { x: 0, y: 0 };
    part = part || 'core';
    if (id === 'pc' || id === 'comp') {
      const a = S.anchors[id] || S.anchors.pc;
      if (a) return a[part === 'core' ? 'chest' : part] || a.chest;
      const f = id === 'comp' && L.comp ? L.comp : L.pc;
      return { x: f.x, y: part === 'feet' ? f.y : f.y - L.ph * (part === 'head' ? 0.85 : 0.55) };
    }
    if (id === 'party') {
      const a = anchor('pc', part), b = S.lay.comp ? anchor('comp', part) : a;
      return { x: Math.round((a.x + b.x) / 2), y: Math.round(Math.min(a.y, b.y)) };
    }
    if (id.startsWith('knot:')) {
      const p = id.split(':');
      const i = p.length > 2 ? +p[1] : 0, j = +p[p.length - 1];
      const v = viewFoe(i);
      return knotAt(i, j, v ? v.maxKnots : 1);
    }
    if (id === 'foes') {
      const up = standingIdx();
      const ps = (up.length ? up : [0]).map((i) => anchor('foe:' + i, part));
      return { x: Math.round(ps.reduce((m, q) => m + q.x, 0) / ps.length), y: Math.round(Math.min(...ps.map((q) => q.y))) };
    }
    // 'foe' / 'foe:i'
    const i = id.indexOf(':') > 0 ? +id.split(':')[1] : 0;
    const f = L.foes[i] || L.foes[0];
    const off = S.foeOffs[i] || { dx: 0, dy: 0 };
    const x = f.ex + off.dx, y = f.ey + off.dy;
    if (part === 'top') return { x, y: Math.round(y + f.ext.top * L.scale * 0.8) };
    if (part === 'base') return { x: f.ex, y: f.ky };
    if (part === 'feet') return { x: f.ex, y: f.shadowY };
    return { x, y };
  }
  function standingIdx() {
    const v = S.env.view();
    const out = [];
    if (!v || !v.foes) return [0];
    for (let i = 0; i < v.foes.length; i++) if (v.foes[i].knots > 0 && !S.settledAt[i]) out.push(i);
    return out;
  }
  function cssPerArt() { return (RB.render.viewSize().scale || 1) / RB.render.ART; }
  const A = { pt: anchor, get u() { return S.lay.u; }, get foeR() { return S.lay.foeR; }, get wardR() { return S.lay.wardR; }, get partyW() { return S.lay.comp ? Math.abs(S.lay.comp.x - S.lay.pc.x) + S.lay.pw : S.lay.pw; }, get knotSpan() { return S.lay.foes[0].knotSpan; } };
  // the same helper, with 'foe' and 'knot:j' meaning creature i (effects and marks drawn on one creature)
  const Acache = new Map();
  function Afor(i) {
    if (!i) return A;
    let a = Acache.get(i);
    if (!a) {
      a = {
        pt: (id, part) => anchor(id === 'foe' ? 'foe:' + i : id.startsWith('knot:') && id.split(':').length === 2 ? 'knot:' + i + ':' + id.slice(5) : id, part),
        get u() { return S.lay.u; }, get foeR() { return (S.lay.foes[i] || S.lay.foes[0]).foeR; }, get wardR() { return S.lay.wardR; }, get partyW() { return A.partyW; }, get knotSpan() { return (S.lay.foes[i] || S.lay.foes[0]).knotSpan; },
      };
      Acache.set(i, a);
    }
    return a;
  }

  // ---- actions (set by the sequencer; times on the presentation clock) --------------------------
  function pose(who, p, gesture, d, now) {
    if (!S) return;
    S.actors[who] = p ? { pose: p, gesture: gesture || null, t0: now, d: Math.max(1, d) } : null;
  }
  // o: { family, dir, hold, foe (which creature; the lead by default) }
  function foe(act, d, now, o) {
    if (!S) return;
    const i = (o && o.foe) || 0;
    S.foes[i] = act ? Object.assign({ act, t0: now, d: Math.max(1, d) }, o || {}) : null;
    if (act === 'settle' && o && o.hold) S.settledAt[i] = true;
  }
  const EFFECT_CAP = 24;
  function effect(name, d, now, p) {
    if (!S || !RB.battleFx.fx[name]) return;
    S.effects.push({ name, t0: now, d: Math.max(1, d), p: p || {} });
    while (S.effects.length > EFFECT_CAP) S.effects.shift();
  }
  const NUM_COL = { hit: '#ffffff', block: '#cfe6ff', heal: '#c8f0b0', cost: '#e8d0c8' };
  function number(to, text, kind, now, d) {
    if (!S) return;
    S.nums.push({ to, text: String(text), kind, col: NUM_COL[kind] || '#ffffff', t0: now, d: d || 900 });
    while (S.nums.length > 8) S.nums.shift();
  }
  // the last knot of the encounter: every creature still up settles and stays settled
  function finalFoe(on) { if (S) { S.final = !!on; if (on) for (let i = 0; i < foeDefs().length; i++) S.settledAt[i] = true; } }
  // one creature of a group has settled (it stays drawn settled from now on)
  function settleFoe(i) { if (S) S.settledAt[i] = true; }
  // the paper strip: word = { html (ruby), en }; from/to = anchor ids; timing on the presentation clock
  function strip(word, from, to, now, tm) {
    if (!S || !S.fxLayer) return;
    dropStrip();
    const el = document.createElement('div');
    el.className = 'cb-strip';
    el.innerHTML = '<span class="cs-w">' + word.html + '</span>' + (word.en ? '<span class="cs-en">' + RB.util.esc(word.en) + '</span>' : '');
    S.fxLayer.appendChild(el);
    S.strip = { el, from, to, t0: now, tm, w: el.offsetWidth, h: el.offsetHeight };
  }
  function dropStrip() {
    if (S && S.strip) { if (S.strip.el.parentNode) S.strip.el.parentNode.removeChild(S.strip.el); S.strip = null; }
  }
  // everything transient goes at once (settle, skip, scene exit): poses back to rest
  function clearTransient() {
    if (!S) return;
    S.effects = []; S.nums = []; S.actors = { pc: null, comp: null }; S.foes = S.foes.map((f) => (f && f.hold ? f : null));
    dropStrip();
  }

  // ---- drawing -------------------------------------------------------------------------------------
  // fr: { t (real ms), pt (presentation ms), amb (ambient clock, slowed while you
  // read and write), view (displayed state), reduce, calm, Sr (stage rect, art px), stageCss }
  function draw(c, w, h, fr) {
    if (!S) return;
    const L = fr.lay || layout(fr.Sr, w, h);
    const v = fr.view, reduce = fr.reduce, env = S.env, Sc = RB.battleScene;
    const u = L.u;
    const defs = foeDefs();
    const info = { poses: {}, marks: [], foe: null, foeOff: null, foes: [], effects: [], nums: [], target: null, preview: null };
    const vf = (i) => (v.foes ? v.foes[i] : v);
    // the creatures (back row first), each in its current action pose, or settled
    // who is drawn in front: the creature acting right now, else the target while you choose
    const mk = env.marks ? env.marks() : null;
    let top = null, t0 = -1;
    for (let i = 0; i < S.foes.length; i++) { const a = S.foes[i]; if (a && !a.hold && a.act !== 'settle' && fr.pt - a.t0 < a.d && a.t0 > t0) { t0 = a.t0; top = i; } }
    if (top == null && mk && mk.target != null) top = mk.target;
    const order = top == null || !L.group ? L.drawOrder : L.drawOrder.filter((i) => i !== top).concat([top]);
    S.z = order;
    for (const i of order) {
      const d = defs[i], f = L.foes[i], fv = vf(i);
      let fp = null;
      const act = S.foes[i];
      if (S.final || (S.settledAt[i] && !(act && act.act === 'settle'))) fp = { act: 'settle', k: 1 };
      else if (act) {
        const k = cl((fr.pt - act.t0) / act.d);
        if (k >= 1 && !act.hold) S.foes[i] = null;
        else fp = { act: act.act, k, family: act.family, dir: dirTo(act.dir, i) };
      }
      const art = d.art || 'wisp', opts = d.artOpts || {};
      // its ground shadow stays on the ground (it follows a lunge sideways only)
      const mo = fp ? RB.enemyArt.motion(art, fp, fr.amb, reduce) : null;
      Sc.shadow(c, f.ex + Math.round((mo ? mo.dx : 0)) * L.scale, f.shadowY, f.shadowR, 11 * L.scale, 0.5 * (mo ? mo.alpha : 1));
      const off = RB.enemyArt.drawPosed(c, art, fr.amb + i * 977, opts, f.ex, f.ey, L.scale, reduce, fp) || { dx: 0, dy: 0 };
      S.foeOffs[i] = off;
      if (i === 0) { info.foe = fp ? fp.act : null; info.foeOff = { dx: off.dx, dy: off.dy }; }
      info.foes.push({ i, act: fp ? fp.act : null, settled: !!(S.final || S.settledAt[i]), ex: f.ex, ey: f.ey });
      if (!fv) continue;
      const Ai = Afor(i), tag = L.group ? i + ':' : '';
      const up = !(S.final || S.settledAt[i]);
      // its states: Heat (shimmer, embers), Gathering (circling motes)
      if (up && fv.heat) { RB.battleFx.status.heat(c, Ai, Math.min(2, fv.heat), fr.t, reduce); info.marks.push(tag + 'heat:' + Math.min(2, fv.heat)); }
      if (up && fv.charged) { RB.battleFx.status.charge(c, Ai, fr.t, reduce); info.marks.push(tag + 'charge'); }
      // knots: a row of cord loops under it, tied or undone; mist over them while Shrouded
      if (!S.settledAt[i] || S.final) {
        for (let j = 0; j < fv.maxKnots; j++) {
          const q = knotAt(i, j, fv.maxKnots);
          const icon = Sc.knot(j < fv.knots);
          c.drawImage(icon, q.x - 10 * L.scale, q.y - 10 * L.scale, icon.width * L.scale, icon.height * L.scale);
        }
      }
      if (up && fv.shroud) { RB.battleFx.status.shroud(c, Ai, fr.t, reduce); info.marks.push(tag + 'shroud'); }
      // a companion's support this round: softened, eye drawn, move headed off
      if (up && (fv.soften || fv.drawn || fv.stunned)) { RB.battleFx.status.support(c, Ai, { soften: fv.soften, drawn: fv.drawn, stunned: fv.stunned }, fr.t, reduce); info.marks.push(tag + 'support'); }
    }
    // who the next response acts on, and what a response under the pointer would reach
    if (mk && L.group && mk.target != null && L.foes[mk.target] && !S.settledAt[mk.target]) {
      RB.battleFx.status.target(c, Afor(mk.target), L.foes[mk.target].shadowR, reduce);
      info.target = mk.target;
    }
    // the party: the one further back first; each on a contact shadow, wards in front
    const B = battlers();
    const party = L.comp ? ['comp', 'pc'] : ['pc'];
    for (const who of party) {
      // the cosmetic pet stands between your companion and you (drawn in that depth order; it only observes)
      if (who === 'pc' && L.pet && RB.battlePets) { try { RB.battlePets.draw(c, L, fr); } catch (err) { console.warn('battle pet', err); } }
      const f = who === 'comp' ? L.comp : L.pc;
      const look = who === 'pc' ? env.looks().pc : env.looks().comp;
      if (!look) continue;
      Sc.shadow(c, f.x, f.y - Math.round(L.ps), Math.round(L.pw * 0.38), Math.max(3, Math.round(L.ph * 0.085)), 0.55);
      const a = S.actors[who];
      let p = null, g = null, k = 1;
      if (a) {
        k = cl((fr.pt - a.t0) / a.d);
        if (k >= 1 && !a.hold) S.actors[who] = null; else { p = a.pose; g = a.gesture; }
      }
      const down = (who === 'pc' ? v.pc : v.comp) <= 0;
      if (!p) p = down ? 'down' : fr.calm ? 'calm' : 'ready';
      const anc = B.draw(c, look, { x: f.x, y: f.y, scale: L.ps, t: fr.t, who, pose: p, gesture: g, k, reduce, facing: 'upright' });
      S.anchors[who] = anc || null;
      info.poses[who] = p + (g ? ':' + g : '');
      const wn = ((v.ward && v.ward[who]) || 0) + (fr.sealHeld === who ? 1 : 0);
      if (wn) info.marks.push('ward:' + who + ':' + wn);
      // its ward points as seal tags (a seal raised to block the telegraphed blow shows as one until it lands)
      RB.battleFx.status.wards(c, A, who, ((v.ward && v.ward[who]) || 0) + (fr.sealHeld === who ? 1 : 0), fr.t, reduce);
    }
    if (v.silenced) { RB.battleFx.status.hush(c, A, fr.t, reduce); info.marks.push('hush'); }
    if (L.comp && v.compId && v.harmony >= v.harmonyMax && !S.final) { RB.battleFx.status.harmony(c, A, fr.t, reduce); info.marks.push('harmony'); }
    // preview marks: a small chevron over everyone the response (or action) under the pointer would reach
    if (mk && mk.preview) {
      const pv = { foes: [], allies: [] };
      for (const i of mk.preview.foes || []) if (L.foes[i] && !S.settledAt[i]) { RB.battleFx.status.preview(c, anchor('foe:' + i, 'top'), u, reduce); pv.foes.push(i); }
      for (const a of mk.preview.allies || []) if (a === 'pc' || (a === 'comp' && L.comp)) { const q = anchor(a, 'head'); RB.battleFx.status.preview(c, { x: q.x, y: q.y - 10 * u }, u, reduce); pv.allies.push(a); }
      info.preview = pv;
    }
    // transient effects
    S.effects = S.effects.filter((e) => fr.pt - e.t0 < e.d);
    for (const e of S.effects) {
      const k = cl((fr.pt - e.t0) / e.d);
      if (k >= 0) info.effects.push(e.name + (e.p && e.p.to ? '>' + e.p.to : '') + (e.p && e.p.foe ? '@' + e.p.foe : ''));
      try { RB.battleFx.fx[e.name](c, e, k, e.p && e.p.foe != null ? Afor(e.p.foe) : A, fr.t, reduce); } catch (err) { console.warn('battle effect', e.name, err); e.d = 0; }
    }
    c.globalAlpha = 1;
    // numbers: rise a little and fade (a still mark with reduced motion)
    S.nums = S.nums.filter((n) => fr.pt - n.t0 < n.d);
    const du = Math.max(2, u);
    for (const n of S.nums) {
      const k = cl((fr.pt - n.t0) / n.d), q = anchor(n.to, 'head');
      info.nums.push(n.to + ':' + n.text);
      const rise = reduce ? 0 : Math.round(RB.battleFx.ease(Math.min(1, k * 2)) * 8) * u;
      const na = reduce || k < 0.75 ? 1 : 1 - (k - 0.75) / 0.25;
      RB.battleFx.digits(c, q.x + 10 * u, q.y - 16 * u - rise, n.text, du, n.col, na);
      // what a ward absorbed carries a seal mark, so it never reads as damage taken
      if (n.kind === 'block') RB.battleFx.sealMark(c, q.x + 10 * u - (n.text.length * 2 + 5) * du, q.y - 13 * u - rise, u, na);
    }
    placeStrip(fr);
    // where each standing creature can be pressed (canvas → page px), front row first
    const cp = cssPerArt();
    S.hits = L.foes.map((f, i) => {
      const e = f.ext, sc = L.scale;
      return { i, row: f.row, z: S.z ? S.z.indexOf(i) : i, settled: !!(S.final || S.settledAt[i]), x: Math.round((f.ex + e.left * sc * 0.8) * cp), y: Math.round((f.ey + e.top * sc * 0.85) * cp), w: Math.round((e.right - e.left) * sc * 0.8 * cp), h: Math.round((f.shadowY - (f.ey + e.top * sc * 0.85) + 6 * sc) * cp) };
    });
    S.drawn++;
    S.frame = info;
  }
  function dirTo(id, i) {
    if (!id) return { x: -0.8, y: 0.6 };
    const f = S.lay.foes[i || 0] || S.lay.foes[0];
    const a = { x: f.ex, y: f.ey }, b = anchor(id, 'chest');
    const dx = b.x - a.x, dy = b.y - a.y, n = Math.hypot(dx, dy) || 1;
    return { x: dx / n, y: dy / n };
  }
  // The strip travels from the actor's hand to above its target while it
  // unfurls, the ink writes the word across it, it hangs there, then lifts
  // and fades. Kept inside the stage (never over the telegraph or the dock).
  function placeStrip(fr) {
    const sp = S.strip;
    if (!sp) return;
    const tm = sp.tm, k = fr.pt - sp.t0;
    if (k >= tm.end) { dropStrip(); return; }
    const kk = (a, b) => cl((k - a) / Math.max(1, b - a));
    const reduce = fr.reduce;
    const tr = reduce ? 1 : RB.battleFx.ease(kk(0, tm.travel));
    const unf = reduce ? 1 : Math.round(kk(0, tm.unfurl) * 10) / 10, ink = reduce ? 1 : kk(tm.inkAt, tm.inkEnd);
    const fade = kk(tm.fadeAt, tm.end);
    const cp = cssPerArt();
    // over an ally: above the head; on a creature: beside its upper body, on
    // the side facing you (so the word and the creature are both seen);
    // on several creatures: above the middle of them
    const a = anchor(sp.from, 'hand');
    const onFoe = sp.to === 'foe' || /^foe:\d+$/.test(sp.to);
    let b;
    if (onFoe) {
      const i = sp.to === 'foe' ? 0 : +sp.to.split(':')[1];
      const f = S.lay.foes[i] || S.lay.foes[0], off = S.foeOffs[i] || { dx: 0, dy: 0 };
      b = { x: f.ex + off.dx + f.ext.left * S.lay.scale * 0.95, y: f.ey + off.dy + f.ext.top * S.lay.scale * 0.3 };
    } else if (sp.to === 'foes') { const q = anchor('foes', 'top'); b = { x: q.x, y: q.y + 6 * S.lay.u }; }
    else b = anchor(sp.to, 'head');
    const lift = onFoe || sp.to === 'foes' ? 0 : 14;
    const x = (a.x + (b.x - a.x) * tr) * cp, y = (a.y + (b.y - a.y) * tr - lift * S.lay.u) * cp - (reduce ? 0 : fade * 10);
    const r = fr.stageCss;
    let left = x - sp.w / 2, top = y - sp.h;
    if (r) {
      left = clamp(left, r.x + 4, Math.max(r.x + 4, r.x + r.w - sp.w - 4));
      top = clamp(top, r.y + 2, Math.max(r.y + 2, r.y + r.h - sp.h - 2));
    }
    const el = sp.el;
    el.style.transform = 'translate(' + Math.round(left) + 'px,' + Math.round(top) + 'px)';
    el.style.setProperty('--u', unf.toFixed(3));
    el.style.setProperty('--w', ink.toFixed(3));
    el.style.opacity = (reduce ? (k < tm.fadeAt ? 1 : 1 - fade) : Math.min(1, unf * 3) * (1 - fade)).toFixed(3);
  }
  // which creature is under a page point (the front row wins where they overlap); -1 for none
  function foeAt(x, y) {
    if (!S || !S.hits) return -1;
    const hs = S.hits.filter((q) => !q.settled && x >= q.x && x <= q.x + q.w && y >= q.y && y <= q.y + q.h);
    if (!hs.length) return -1;
    // the one drawn in front wins where they overlap — where its drawing is, not
    // just its box: a press on the visible part of one behind reaches that one
    hs.sort((a, b) => b.z - a.z);
    const cp = cssPerArt();
    const hit = hs.find((q) => opaqueAt(q.i, x / cp, y / cp));
    return (hit || hs[0]).i;
  }
  // is creature i's drawing (its resting frame) within a few pixels of art point (ax, ay)?
  const alphas = new Map();
  function opaqueAt(i, ax, ay) {
    try {
      const E = RB.enemyArt, d = foeDefs()[i], f = S.lay.foes[i];
      if (!d || !f || !E.P) return false;
      const id = E.P[d.art] ? d.art : 'wisp', spec = E.P[id];
      const key = id + JSON.stringify(d.artOpts || {});
      let a = alphas.get(key);
      if (!a) {
        const cv = E.frame(id, E.frameAt(spec, 0, true), d.artOpts || {});
        a = { w: cv.width, h: cv.height, d: cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data };
        alphas.set(key, a);
      }
      const sc = S.lay.scale, off = S.foeOffs[i] || { dx: 0, dy: 0 };
      const lx = Math.round((ax - f.ex - off.dx) / sc + spec.ox), ly = Math.round((ay - f.ey - off.dy) / sc + spec.oy - (spec.dy || 0));
      for (let yy = ly - 3; yy <= ly + 3; yy++) for (let xx = lx - 3; xx <= lx + 3; xx++) {
        if (xx < 0 || yy < 0 || xx >= a.w || yy >= a.h) continue;
        if (a.d[(yy * a.w + xx) * 4 + 3] > 24) return true;
      }
    } catch (e) { /* a creature without a frame: its box decides */ }
    return false;
  }

  function stats() {
    if (!S) return { active: false, effects: 0, nums: 0, strips: document.querySelectorAll('.cb-strip').length, layers: document.querySelectorAll('.cb-fx').length };
    return {
      active: true, effects: S.effects.length, nums: S.nums.length, strips: document.querySelectorAll('.cb-strip').length, layers: document.querySelectorAll('.cb-fx').length,
      actors: { pc: S.actors.pc && S.actors.pc.pose, comp: S.actors.comp && S.actors.comp.pose }, foe: S.foes[0] && S.foes[0].act, foesAct: S.foes.map((f) => (f ? f.act : null)), final: S.final, settled: S.settledAt.slice(), drawn: S.drawn,
      lay: S.lay && { scale: S.lay.scale, ps: S.lay.ps, pc: S.lay.pc, comp: S.lay.comp, ex: S.lay.ex, ey: S.lay.ey, frame: S.lay.F, party: S.lay.party, px: S.lay.px, py: S.lay.py, fallback: S.lay.fallback, group: S.lay.group, visual: S.lay.visual, foes: S.lay.foes.map((f) => ({ ex: f.ex, ey: f.ey, row: f.row, ky: f.ky, w: (f.ext.right - f.ext.left) * S.lay.scale, h: (f.ext.bottom - f.ext.top) * S.lay.scale, top: f.ey + f.ext.top * S.lay.scale, bottom: f.ey + f.ext.bottom * S.lay.scale, left: f.ex + f.ext.left * S.lay.scale, right: f.ex + f.ext.right * S.lay.scale })) },
      anchors: S.anchors, frame: S.frame || null, cssPerArt: cssPerArt(), hits: S.hits,
      strip: S.strip && { from: S.strip.from, to: S.strip.to, text: S.strip.el.textContent, rect: rectOf(S.strip.el), opacity: +S.strip.el.style.opacity || 0 },
    };
  }
  function rectOf(el) { const r = el.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }; }

  return { begin, end, layout, draw, anchor, pose, foe, effect, number, strip, clearTransient, finalFoe, settleFoe, foeAt, stats, battlers, FALLBACK, cssPerArt, active: () => !!S, lay: () => (S ? S.lay : null) };
})();
