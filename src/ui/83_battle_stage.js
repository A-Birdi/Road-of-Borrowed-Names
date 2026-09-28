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
 *   'foe', 'knot:i') and a part ('hand', 'head', 'chest', 'feet', 'core',
 *   'top', 'base'), resolved each frame, so a resize mid-effect keeps it on
 *   its actor. More than one foe would add 'foe:1'… here (see anchor()).
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
    const FRAME = { w: 32, h: 48 }, ANCHOR = { x: 16, y: 47 };
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
    function draw(c, look, o) {
      const spr = sprite(look);
      const s = o.scale || 1, q = s * (32 / spr.width); // canvas px per sprite px (32×48 frame)
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
      const x0 = Math.round(o.x - ANCHOR.x * q) + dx * q, y0 = Math.round(o.y - ANCHOR.y * q) + dy * q;
      const cut = 30;
      c.imageSmoothingEnabled = false;
      // legs (a kneel drops their top rows), then the upper body in bands leaning toward up-right
      const sq = spr.width / 32; // source px per sprite px (legacy 16×24 art is half size)
      c.drawImage(spr, 0, (cut + sink) * sq, spr.width, (48 - cut - sink) * sq, x0, y0 + (cut + sink) * q, 32 * q, (48 - cut - sink) * q);
      for (let r = 0; r < cut; r += 6) {
        const bh = Math.min(6, cut - r), off = Math.round(lean * (1 - (r + bh / 2) / cut));
        c.drawImage(spr, 0, r * sq, spr.width, bh * sq, x0 + off * q, y0 + (r + sink) * q, 32 * q, bh * q);
      }
      const hand = { x: x0 + (hx + lean) * q, y: y0 + (hy + sink) * q };
      if (g) prop(c, g, hand.x, hand.y, q, k);
      return {
        hand, head: { x: x0 + (16 + lean) * q, y: y0 + (6 + sink) * q }, chest: { x: x0 + 16 * q, y: y0 + (22 + sink) * q }, feet: { x: Math.round(o.x), y: Math.round(o.y) },
      };
    }
    return { FRAME, ANCHOR, POSES, GESTURES, draw, fallback: true };
  })();
  const battlers = () => (RB.battlers && typeof RB.battlers.draw === 'function' && RB.battlers.FRAME ? RB.battlers : FALLBACK);

  // ---- one encounter's stage -------------------------------------------------------------------
  let S = null;
  function begin(env) {
    end();
    S = {
      env, lay: null, anchors: { pc: null, comp: null }, foeOff: { dx: 0, dy: 0 },
      actors: { pc: null, comp: null }, foe: null, final: false,
      effects: [], nums: [], strip: null, fxLayer: null, drawn: 0, cost: [],
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

  // ---- arrangement -------------------------------------------------------------------------------
  // Stage rect Sr in art px. The creature keeps the scene's scale rule; the
  // party gets an integer scale that makes a figure about 44 % of the stage
  // height (never taller than the creature), so a larger battle frame simply
  // means scale 1 instead of 2 at the same size.
  function layout(Sr, w, h) {
    const env = S.env, art = env.enemy.art || 'wisp', opts = env.enemy.artOpts || {};
    const scale = Math.max(1, Math.min(3, Math.floor(Math.min(Sr.h / 224, Sr.w / 300))));
    const ext = RB.enemyArt.extent(art, opts);
    const foeH = (ext.bottom - ext.top) * scale;
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
    const right = pc.x + (F.w - AN.x) * ps;
    // the creature: right of centre, clear of the party where the stage allows
    let ex = Sr.x + Sr.w * 0.62;
    ex = Math.max(ex, right - ext.left * scale * 0.55);
    ex = Math.round(Math.min(ex, Sr.x + Sr.w - ext.right * scale * 0.85));
    let ey = Math.round(Math.min(Sr.y + Sr.h - 100 * scale, Math.max(Sr.y + 80 * scale, Sr.y + Sr.h * 0.44)));
    ey = Math.min(Math.max(ey, Math.round(Sr.y - ext.top * scale + 2)), Math.round(Sr.y + Sr.h - 64 * scale));
    const ky = Math.round(Math.min(ey + 88 * scale + 12, Sr.y + Sr.h - 10 * scale));
    const hz = Math.max(0, Math.min(h - 1, Math.round(Math.min(ey + 36 * scale, foot - ph * 0.66))));
    const u = scale;
    const foeR = Math.round(Math.min(ext.right - ext.left, ext.bottom - ext.top) * 0.42 * scale);
    // the party's box in canvas px (both frames, with room for gestures and seals), for the
    // backdrop composer to keep clear; px/py/ps as the backdrop expects (top-left, scale)
    const fr = (f) => ({ x0: f.x - AN.x * ps, y0: f.y - AN.y * ps, x1: f.x + (F.w - AN.x) * ps, y1: f.y + (F.h - AN.y) * ps });
    const boxes = [fr(pc)].concat(comp ? [fr(comp)] : []);
    const mx = Math.round(pw * 0.2), my = Math.round(ph * 0.12);
    const party = { x: Math.min(...boxes.map((q) => q.x0)) - mx, y: Math.min(...boxes.map((q) => q.y0)) - my };
    party.w = Math.max(...boxes.map((q) => q.x1)) + mx - party.x; party.h = Math.max(...boxes.map((q) => q.y1)) - party.y;
    S.lay = { Sr, scale, ps, pw, ph, pc, comp, ex, ey, ky, hz, ext, u, foeR, wardR: Math.round(ph * 0.34), F, AN, party, px: party.x + mx, py: party.y + my, fallback: !!B.fallback };
    return S.lay;
  }
  function knotAt(i, n) {
    const L = S.lay, a = -Math.PI / 2 + (i - (n - 1) / 2) * 0.5;
    return { x: Math.round(L.ex + Math.cos(a) * 60 * L.scale), y: Math.round(L.ky + Math.sin(a) * 8) };
  }

  // ---- anchors ---------------------------------------------------------------------------------
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
      const v = S.env.view();
      return knotAt(+id.slice(5), v ? v.maxKnots : 1);
    }
    // 'foe' (one creature today; 'foe:i' would index a list)
    const x = L.ex + S.foeOff.dx, y = L.ey + S.foeOff.dy;
    if (part === 'top') return { x, y: Math.round(y + L.ext.top * L.scale * 0.8) };
    if (part === 'base') return { x: L.ex, y: L.ky };
    return { x, y };
  }
  function cssPerArt() { return (RB.render.viewSize().scale || 1) / RB.render.ART; }
  const A = { pt: anchor, get u() { return S.lay.u; }, get foeR() { return S.lay.foeR; }, get wardR() { return S.lay.wardR; }, get partyW() { return S.lay.comp ? Math.abs(S.lay.comp.x - S.lay.pc.x) + S.lay.pw : S.lay.pw; }, get knotSpan() { return 60 * S.lay.scale; } };

  // ---- actions (set by the sequencer; times on the presentation clock) --------------------------
  function pose(who, p, gesture, d, now) {
    if (!S) return;
    S.actors[who] = p ? { pose: p, gesture: gesture || null, t0: now, d: Math.max(1, d) } : null;
  }
  function foe(act, d, now, o) {
    if (!S) return;
    S.foe = act ? Object.assign({ act, t0: now, d: Math.max(1, d) }, o || {}) : null;
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
  function finalFoe(on) { if (S) S.final = !!on; }
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
    S.effects = []; S.nums = []; S.actors = { pc: null, comp: null }; S.foe = null;
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
    const info = { poses: {}, marks: [], foe: null, foeOff: null, effects: [], nums: [] };
    // the creature, in its current action pose (or its settled look after the win)
    let fp = null;
    if (S.final) fp = { act: 'settle', k: 1 };
    else if (S.foe) {
      const k = cl((fr.pt - S.foe.t0) / S.foe.d);
      if (k >= 1 && !S.foe.hold) S.foe = null;
      else fp = { act: S.foe.act, k, family: S.foe.family, dir: dirTo(S.foe.dir) };
    }
    const art = env.enemy.art || 'wisp', opts = env.enemy.artOpts || {};
    // its ground shadow stays on the ground (it follows a lunge sideways only)
    const mo = fp ? RB.enemyArt.motion(art, fp, fr.amb, reduce) : null;
    Sc.shadow(c, L.ex + Math.round((mo ? mo.dx : 0)) * L.scale, L.ey + 84 * L.scale, 58 * L.scale, 11 * L.scale, 0.5 * (mo ? mo.alpha : 1));
    const off = RB.enemyArt.drawPosed(c, art, fr.amb, opts, L.ex, L.ey, L.scale, reduce, fp) || { dx: 0, dy: 0 };
    S.foeOff = off;
    info.foe = fp ? fp.act : null; info.foeOff = { dx: off.dx, dy: off.dy };
    // its states: Heat (shimmer, embers), Gathering (circling motes)
    if (v.heat) { RB.battleFx.status.heat(c, A, Math.min(2, v.heat), fr.t, reduce); info.marks.push('heat:' + Math.min(2, v.heat)); }
    if (v.charged) { RB.battleFx.status.charge(c, A, fr.t, reduce); info.marks.push('charge'); }
    // knots: a row of cord loops under it, tied or undone; mist over them while Shrouded
    for (let i = 0; i < v.maxKnots; i++) {
      const q = knotAt(i, v.maxKnots);
      const icon = Sc.knot(i < v.knots);
      c.drawImage(icon, q.x - 10 * L.scale, q.y - 10 * L.scale, icon.width * L.scale, icon.height * L.scale);
    }
    if (v.shroud) { RB.battleFx.status.shroud(c, A, fr.t, reduce); info.marks.push('shroud'); }
    // the party: the one further back first; each on a contact shadow, wards in front
    const B = battlers();
    const s = RB.game.s;
    const order = L.comp ? ['comp', 'pc'] : ['pc'];
    for (const who of order) {
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
    // transient effects
    S.effects = S.effects.filter((e) => fr.pt - e.t0 < e.d);
    for (const e of S.effects) {
      const k = cl((fr.pt - e.t0) / e.d);
      if (k >= 0) info.effects.push(e.name + (e.p && e.p.to ? '>' + e.p.to : ''));
      try { RB.battleFx.fx[e.name](c, e, k, A, fr.t, reduce); } catch (err) { console.warn('battle effect', e.name, err); e.d = 0; }
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
    S.drawn++;
    S.frame = info;
  }
  function dirTo(id) {
    if (!id) return { x: -0.8, y: 0.6 };
    const a = { x: S.lay.ex, y: S.lay.ey }, b = anchor(id, 'chest');
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
    // over an ally: above the head; on the creature: beside its upper body, on
    // the side facing you (so the word and the creature are both seen)
    const a = anchor(sp.from, 'hand');
    const b = sp.to === 'foe' ? { x: S.lay.ex + S.foeOff.dx + S.lay.ext.left * S.lay.scale * 0.95, y: S.lay.ey + S.foeOff.dy + S.lay.ext.top * S.lay.scale * 0.3 } : anchor(sp.to, 'head');
    const lift = sp.to === 'foe' ? 0 : 14;
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

  function stats() {
    if (!S) return { active: false, effects: 0, nums: 0, strips: document.querySelectorAll('.cb-strip').length, layers: document.querySelectorAll('.cb-fx').length };
    return {
      active: true, effects: S.effects.length, nums: S.nums.length, strips: document.querySelectorAll('.cb-strip').length, layers: document.querySelectorAll('.cb-fx').length,
      actors: { pc: S.actors.pc && S.actors.pc.pose, comp: S.actors.comp && S.actors.comp.pose }, foe: S.foe && S.foe.act, final: S.final, drawn: S.drawn,
      lay: S.lay && { scale: S.lay.scale, ps: S.lay.ps, pc: S.lay.pc, comp: S.lay.comp, ex: S.lay.ex, ey: S.lay.ey, frame: S.lay.F, party: S.lay.party, px: S.lay.px, py: S.lay.py, fallback: S.lay.fallback },
      anchors: S.anchors, frame: S.frame || null, cssPerArt: cssPerArt(),
      strip: S.strip && { from: S.strip.from, to: S.strip.to, text: S.strip.el.textContent, rect: rectOf(S.strip.el), opacity: +S.strip.el.style.opacity || 0 },
    };
  }
  function rectOf(el) { const r = el.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }; }

  return { begin, end, layout, draw, anchor, pose, foe, effect, number, strip, clearTransient, finalFoe, stats, battlers, FALLBACK, cssPerArt, active: () => !!S };
})();
