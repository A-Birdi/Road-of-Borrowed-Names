/* Inkweaving — presentation and exchange loop. Logic lives in
 * RB.combatLogic; this file draws the arena, the telegraphed intent,
 * response cards, and runs the language step for the chosen response. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.enemyArt = (function () {
  'use strict';
  // Each art draws a creature centred at (0,0) on a ~64px scale.
  const A = {};
  const circ = (c, x, y, r, col) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); };
  const eyes = (c, x, y, gap, col, h) => { c.fillStyle = col || '#1a1430'; c.fillRect(x - gap - 2, y, 3, h || 4); c.fillRect(x + gap - 1, y, 3, h || 4); };
  A.wisp = (c, t, o) => {
    const col = o.col || '#9fb8e8';
    const b = Math.sin(t / 400) * 3;
    for (let i = 5; i > 0; i--) circ(c, Math.sin(t / 300 + i) * 3, 20 + i * 6 + b, 10 - i, col + '50');
    circ(c, 0, b, 22, col + '40');
    circ(c, 0, b, 16, col);
    circ(c, -5, b - 5, 5, '#ffffffa0');
    eyes(c, 0, b - 2, 6, '#1a1430', 6);
  };
  A.moth = (c, t, o) => {
    const col = o.col || '#c8c0e0';
    const f = Math.sin(t / 160) * 0.25;
    for (const s of [-1, 1]) {
      c.save(); c.scale(s, 1); c.rotate(f);
      c.fillStyle = col; c.beginPath(); c.ellipse(18, -6, 20, 14, -0.3, 0, 7); c.fill();
      c.fillStyle = (o.col2 || '#9a8ab8'); c.beginPath(); c.ellipse(14, 14, 12, 9, 0.4, 0, 7); c.fill();
      c.fillStyle = '#ffffff70'; c.fillRect(12, -10, 8, 2); c.fillRect(16, -4, 6, 2); c.fillRect(10, 2, 5, 2);
      c.restore();
    }
    c.fillStyle = '#3a3050'; c.fillRect(-4, -14, 8, 34);
    c.fillRect(-7, -20, 2, 7); c.fillRect(5, -20, 2, 7);
    eyes(c, 0, -10, 3, '#f0e8ff', 3);
  };
  A.blot = (c, t, o) => {
    const col = o.col || '#241f3a';
    const w = Math.sin(t / 350) * 2;
    c.fillStyle = col;
    c.beginPath(); c.ellipse(0, 18, 30 + w, 10, 0, 0, 7); c.fill();
    c.beginPath(); c.ellipse(0, 0, 20, 22 - w, 0, 0, 7); c.fill();
    for (let i = 0; i < 5; i++) circ(c, -24 + i * 12, 22 + ((i * 5 + t / 90) % 10), 3, col);
    eyes(c, 0, -6, 7, '#f4f0ff', 5);
    c.fillStyle = '#f4f0ff80'; c.fillRect(-6, 6, 12, 2);
  };
  A.crane = (c, t, o) => {
    const col = o.col || '#f4efe0';
    const f = Math.sin(t / 220) * 8;
    c.fillStyle = col;
    c.beginPath(); c.moveTo(-34, -8 - f); c.lineTo(0, 6); c.lineTo(34, -8 - f); c.lineTo(0, 22); c.closePath(); c.fill();
    c.fillStyle = '#d8d0bc'; c.beginPath(); c.moveTo(0, 6); c.lineTo(24, -26); c.lineTo(28, -24); c.lineTo(6, 14); c.fill();
    c.fillStyle = '#c85a4a'; c.fillRect(24, -28, 6, 3);
    c.fillStyle = '#2a2430a0'; for (let i = 0; i < 4; i++) c.fillRect(-20 + i * 9, -2 + (i % 2) * 3, 5, 1);
  };
  A.golem = (c, t, o) => {
    const col = o.col || '#8fb8b0';
    const b = Math.sin(t / 500) * 2;
    c.fillStyle = col; c.fillRect(-18, -8 + b, 36, 34); c.fillRect(-12, -26 + b, 24, 18);
    c.fillRect(-28, -4 + b, 10, 24); c.fillRect(18, -4 + b, 10, 24);
    c.fillStyle = '#ffffff50'; c.fillRect(-16, -6 + b, 4, 30); c.fillRect(-10, -24 + b, 3, 14);
    c.fillStyle = o.core || '#f0a060'; c.fillRect(-5, 4 + b, 10, 10);
    eyes(c, 0, -18 + b, 5, '#123', 3);
  };
  A.lantern = (c, t, o) => {
    const b = Math.sin(t / 400) * 3;
    c.fillStyle = '#3a2e2a'; c.fillRect(-14, -24 + b, 28, 4); c.fillRect(-14, 18 + b, 28, 4);
    c.fillStyle = '#f4ead0'; c.fillRect(-12, -20 + b, 24, 38);
    c.fillStyle = (o.col || '#8aa8e8') + 'c0'; c.beginPath(); c.moveTo(-8, 10 + b); c.quadraticCurveTo(0, -20 + b + Math.sin(t / 150) * 4, 8, 10 + b); c.fill();
    eyes(c, 0, -6 + b, 5, '#2a2440', 4);
    c.fillStyle = '#8aa8e850'; c.beginPath(); c.moveTo(-10, 22 + b); c.lineTo(10, 22 + b); c.lineTo(0, 40 + b); c.fill();
  };
  A.echo = (c, t, o) => {
    const col = o.col || '#a8c8d8';
    c.strokeStyle = col; c.lineWidth = 3;
    for (let i = 0; i < 3; i++) {
      c.globalAlpha = 0.9 - i * 0.25;
      c.beginPath(); c.arc(0, 0, 14 + i * 9 + Math.sin(t / 300 + i) * 2, 0, Math.PI * 2); c.stroke();
    }
    c.globalAlpha = 1;
    const a = t / 1400;
    c.lineWidth = 2;
    for (let i = 0; i < 8; i++) { const an = a + i * Math.PI / 4; c.beginPath(); c.moveTo(Math.cos(an) * 10, Math.sin(an) * 10); c.lineTo(Math.cos(an) * 36, Math.sin(an) * 36); c.stroke(); }
    circ(c, 0, 0, 9, '#1c2a34');
    eyes(c, 0, -2, 3, col, 3);
  };
  A.clerk = (c, t, o) => {
    const col = o.col || '#4a6a8a';
    c.fillStyle = col; c.fillRect(-12, -10, 24, 40); c.fillRect(-9, -26, 18, 16);
    c.fillStyle = '#e8e0cc'; c.fillRect(-9, -26, 18, 3);
    const s = Math.sin(t / 350);
    c.fillStyle = '#6a4a3a'; c.fillRect(14, -14 + s * 6, 6, 16); c.fillStyle = '#c85a4a'; c.fillRect(10, 2 + s * 6, 14, 6);
    eyes(c, 0, -20, 4, '#f0f0ff', 2);
    c.fillStyle = '#e8e0cc'; for (let i = 0; i < 3; i++) c.fillRect(-22 - i * 2, 10 - i * 8, 10, 7);
  };
  A.warden = (c, t, o) => {
    const glow = 0.6 + Math.sin(t / 200) * 0.2;
    c.fillStyle = '#6a4a3a'; c.beginPath(); c.moveTo(-26, 30); c.lineTo(-20, -18); c.quadraticCurveTo(0, -38, 20, -18); c.lineTo(26, 30); c.fill();
    c.fillStyle = `rgba(255,150,60,${glow})`; c.fillRect(-10, 0, 20, 20);
    c.fillStyle = '#8fb8b0'; c.fillRect(-12, -2, 24, 3);
    eyes(c, 0, -14, 6, '#ffd070', 3);
  };
  A.bell = (c, t, o) => {
    const sw = Math.sin(t / 500) * 0.15;
    c.save(); c.rotate(sw);
    c.fillStyle = o.col || '#8a7a4a';
    c.beginPath(); c.moveTo(-14, -24); c.lineTo(14, -24); c.lineTo(22, 16); c.lineTo(-22, 16); c.closePath(); c.fill();
    c.fillStyle = '#b8a468'; c.fillRect(-10, -20, 3, 30);
    circ(c, 0, 20, 5, '#5a4a2a');
    c.restore();
    c.strokeStyle = '#c8a0a8a0'; c.lineWidth = 2;
    for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(-18 + i * 18, 18); c.quadraticCurveTo(-18 + i * 18 + Math.sin(t / 300 + i) * 8, 32, -14 + i * 18, 42); c.stroke(); }
  };
  A.fox = (c, t, o) => {
    const col = o.col || '#e8eef4';
    c.fillStyle = col;
    c.beginPath(); c.ellipse(0, 10, 20, 12, 0, 0, 7); c.fill();
    c.beginPath(); c.moveTo(-10, -2); c.lineTo(-16, -22); c.lineTo(-4, -8); c.fill();
    c.beginPath(); c.moveTo(10, -2); c.lineTo(16, -22); c.lineTo(4, -8); c.fill();
    c.beginPath(); c.ellipse(0, -4, 12, 10, 0, 0, 7); c.fill();
    c.beginPath(); c.ellipse(24 + Math.sin(t / 300) * 3, 4, 12, 6, -0.6, 0, 7); c.fill();
    eyes(c, 0, -6, 5, '#3a5a8a', 3);
  };
  A.crab = (c, t, o) => {
    const col = o.col || '#c86a4a';
    c.fillStyle = col; c.beginPath(); c.ellipse(0, 6, 26, 16, 0, 0, 7); c.fill();
    c.fillStyle = '#f0e8d8'; c.fillRect(-14, -2, 12, 8); c.fillRect(2, 0, 12, 8);
    c.fillStyle = '#2a2024'; c.fillRect(-12, 1, 8, 1); c.fillRect(4, 3, 8, 1);
    const s = Math.sin(t / 250) * 4;
    c.fillStyle = col; c.beginPath(); c.arc(-30, -10 + s, 8, 0, 7); c.fill(); c.beginPath(); c.arc(30, -10 - s, 8, 0, 7); c.fill();
    eyes(c, 0, -14, 6, '#1a1a1a', 4);
  };
  A.hush = (c, t, o) => {
    const b = Math.sin(t / 700) * 3;
    c.fillStyle = '#e8e6f0';
    c.beginPath(); c.moveTo(-26, 40); c.quadraticCurveTo(-30, -20 + b, 0, -34 + b); c.quadraticCurveTo(30, -20 + b, 26, 40); c.closePath(); c.fill();
    c.strokeStyle = '#1a1830'; c.lineWidth = 2; c.beginPath(); c.arc(0, -14 + b, 8, 0, Math.PI * 2); c.stroke();
    c.fillStyle = '#c8c4d8'; for (let i = 0; i < 6; i++) c.fillRect(-18 + i * 6, 6 + (i % 2) * 6 + b, 4, 14);
  };
  A.spirit = (c, t, o) => {
    const col = o.col || '#e8e4ff';
    const b = Math.sin(t / 450) * 3;
    c.fillStyle = col + 'c0';
    c.beginPath(); c.moveTo(-20, 34); c.quadraticCurveTo(-24, -20 + b, 0, -28 + b); c.quadraticCurveTo(24, -20 + b, 20, 34); c.lineTo(10, 26); c.lineTo(0, 34); c.lineTo(-10, 26); c.fill();
    eyes(c, 0, -10 + b, 6, '#2a2440', 5);
  };
  function draw(c, art, t, o) { (A[art] || A.wisp)(c, t, o || {}); }
  return { draw, A };
})();

RB.combat = (function () {
  'use strict';
  const esc = RB.util.esc;
  const L = () => RB.combatLogic;
  let st = null, enemy = null, ui = null, fxList = [], shake = 0;

  const BG = {
    reedwake: ['#6fa6c0', '#b8d8c0', '#5f9a4a', '#4b7f3c'], mill: ['#2a3a3a', '#3a4a44', '#4a3a2a', '#3a2c20'],
    saltglass: ['#6a9ac0', '#d8e8f0', '#d9c38e', '#c4ab74'], archive: ['#141a30', '#262c48', '#3a3f5c', '#2e3248'],
    cinder: ['#d8905a', '#f0c890', '#8a8480', '#6e6864'], kiln: ['#3a1a14', '#6a2a1a', '#4a3a34', '#3a2c28'],
    snowbell: ['#8aa0c0', '#dde6ee', '#eef3f7', '#c7d4de'], observatory: ['#101830', '#283050', '#5a6478', '#3a4458'],
    lanternfall: ['#6a6aa0', '#d8c8e8', '#b9b3c2', '#9892a4'], belltower: ['#1a2a44', '#2a4060', '#3c5c8a', '#2a3c5c'],
    still: ['#0a0c18', '#1a1c30', '#e4ddc8', '#aea68e'], atlas: ['#c8b890', '#f0e8d0', '#b8b08a', '#a09872'],
  };

  // ---- the scene, framed inside the stage: the free area the overlay leaves ----
  let stageCss = null, lastLay = null, measureAt = -1e9;
  function measure() {
    if (!ui || !ui.stage) { stageCss = null; return; }
    const r = ui.stage.getBoundingClientRect();
    stageCss = r.width > 60 && r.height > 60 ? { x: r.left, y: r.top, w: r.width, h: r.height } : null;
  }
  function stageBuf(w, h) {
    const k = RB.render.viewSize().scale || 1;
    if (!stageCss) return { x: 0, y: 0, w, h };
    const x = Math.max(0, stageCss.x / k), y = Math.max(0, stageCss.y / k);
    return { x, y, w: Math.min(w - x, stageCss.w / k), h: Math.min(h - y, stageCss.h / k) };
  }
  function draw(c, w, h, t) {
    if (t - measureAt > 400) { measureAt = t; measure(); }
    const S = stageBuf(w, h);
    const bg = BG[enemy.bg || enemy.region || 'reedwake'] || BG.reedwake;
    const reduce = RB.game.reducedMotion();
    const tt = reduce ? 0 : t;
    const sx = shake > 0 && !reduce ? Math.round(Math.sin(t / 20) * 2) : 0;
    if (shake > 0) shake -= 16;
    // integer scale only (pixel art), chosen so the whole scene fits the stage
    const scale = Math.max(1, Math.min(3, Math.floor(Math.min(S.h / 112, S.w / 150))));
    const ps = scale;
    const ex = Math.round(S.x + S.w * 0.62) + sx;
    const ey = Math.round(Math.min(S.y + S.h - 50 * scale, Math.max(S.y + 40 * scale, S.y + S.h * 0.44)));
    const px = Math.round(S.x + S.w * 0.1), py = Math.round(S.y + S.h - 26 * ps - 4);
    const hz = Math.max(0, Math.min(h - 1, Math.round(Math.min(ey + 18 * scale, py + 8 * ps))));
    const g = c.createLinearGradient(0, 0, 0, h);
    const f = Math.max(0.02, Math.min(0.98, hz / h));
    g.addColorStop(0, bg[0]); g.addColorStop(f - 0.005, bg[1]); g.addColorStop(f, bg[2]); g.addColorStop(1, bg[3]);
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);
    // ground detail
    for (let i = 0; i < 40; i++) {
      const x = (i * 97) % w, y = hz + 4 + ((i * 53) % Math.max(1, Math.floor(h - hz - 4)));
      c.fillStyle = 'rgba(0,0,0,0.08)';
      c.fillRect(x, y, 6, 1);
    }
    // enemy
    c.save();
    c.translate(ex, ey);
    c.scale(scale, scale);
    c.fillStyle = 'rgba(0,0,0,0.2)';
    c.beginPath(); c.ellipse(0, 42, 30, 6, 0, 0, 7); c.fill();
    if (st && st.over === 'win') c.globalAlpha = 0.5;
    RB.enemyArt.draw(c, enemy.art || 'wisp', tt, enemy.artOpts || {});
    c.restore();
    // knots as little loops around the enemy
    if (st) for (let i = 0; i < st.maxKnots; i++) {
      const a = -Math.PI / 2 + (i - (st.maxKnots - 1) / 2) * 0.5;
      const kx = ex + Math.cos(a) * 30 * scale, ky = ey + 44 * scale + 6 + Math.sin(a) * 4;
      c.strokeStyle = i < st.knots ? '#e8d8b0' : 'rgba(232,216,176,0.25)';
      c.lineWidth = 2;
      c.beginPath(); c.arc(kx, ky, 4, 0, Math.PI * 2); c.stroke();
      if (i < st.knots) { c.beginPath(); c.moveTo(kx - 5, ky + 5); c.lineTo(kx + 5, ky - 5); c.stroke(); }
    }
    // party (backs to us)
    const s = RB.game.s;
    const look = Object.assign({}, s.player.look);
    c.imageSmoothingEnabled = false;
    c.drawImage(RB.sprites.get(look, 'up', 0), px, py, 16 * ps, 24 * ps);
    if (s.comp) c.drawImage(RB.sprites.get(RB.content.chars[s.comp].look, 'up', 0), px + 20 * ps, py + 6, 16 * ps, 24 * ps);
    lastLay = { ex, ey, px, py, ps, scale };
    // wards
    if (st) {
      const wardAt = (x, y, n) => {
        if (!n) return;
        c.strokeStyle = `rgba(160,210,255,${0.35 + Math.min(n, 4) * 0.12})`;
        c.lineWidth = 2;
        c.beginPath(); c.arc(x, y, 12 * ps, Math.PI * 1.1, Math.PI * 1.9); c.stroke();
      };
      wardAt(px + 8 * ps, py + 8 * ps, st.ward.pc);
      if (s.comp) wardAt(px + 28 * ps, py + 14 * ps, st.ward.comp);
      if (st.heat) { c.fillStyle = `rgba(255,120,60,${0.08 * st.heat})`; c.fillRect(0, 0, w, h); }
      if (st.shroud) { c.fillStyle = 'rgba(220,225,235,0.45)'; c.fillRect(ex - 60 * scale / 2, ey - 50 * scale / 2, 120 * scale / 2, 100 * scale / 2); }
    }
    // effects
    fxList = fxList.filter((e) => t - e.t0 < e.d);
    for (const e of fxList) {
      const k = (t - e.t0) / e.d;
      if (e.kind === 'glyph') {
        c.strokeStyle = `rgba(255,236,170,${1 - k})`;
        c.lineWidth = 2;
        c.beginPath(); c.arc(e.x, e.y, 10 + k * 40, 0, Math.PI * 2); c.stroke();
      } else if (e.kind === 'water') {
        for (let i = 0; i < 16; i++) { c.fillStyle = `rgba(120,190,240,${1 - k})`; c.fillRect(ex - 30 + i * 4, ey - 30 + k * 60 + (i % 3) * 5, 2, 5); }
      } else if (e.kind === 'light') {
        const gl = c.createRadialGradient(ex, ey, 0, ex, ey, 80);
        gl.addColorStop(0, `rgba(255,248,200,${0.7 * (1 - k)})`); gl.addColorStop(1, 'rgba(255,248,200,0)');
        c.fillStyle = gl; c.fillRect(ex - 80, ey - 80, 160, 160);
      } else if (e.kind === 'untie') {
        c.strokeStyle = `rgba(232,216,176,${1 - k})`; c.lineWidth = 2;
        c.beginPath(); c.moveTo(ex - 20 - k * 30, ey - 20); c.quadraticCurveTo(ex, ey - 40 - k * 20, ex + 20 + k * 30, ey - 20); c.stroke();
      } else if (e.kind === 'hit') {
        c.fillStyle = `rgba(255,255,255,${0.25 * (1 - k)})`;
        c.fillRect(e.x - 12, e.y - 12, 24, 24);
      } else if (e.kind === 'heal') {
        for (let i = 0; i < 8; i++) { c.fillStyle = `rgba(160,240,160,${1 - k})`; c.fillRect(px + i * 6, py + 30 - k * 40 - (i % 3) * 6, 2, 2); }
      }
    }
  }
  function addFx(kind, extra) {
    fxList.push(Object.assign({ kind, t0: performance.now(), d: RB.game.reducedMotion() ? 300 : 700 }, extra));
  }
  // where the party stands (for effects), in scene pixels
  function partyAt(dx, dy) {
    const l = lastLay || { px: 20, py: 60, ps: 1 };
    return { x: l.px + (dx || 8) * l.ps, y: l.py + (dy || 12) * l.ps };
  }

  function tierOf(obj) {
    return RB.activities.tier(obj);
  }
  function intentLine(it) {
    const s = RB.game.s;
    const prof = s.learn.profile;
    const solo = !s.comp;
    let pool;
    if (it.text) pool = [].concat(tierOf(it.text) || []);
    else {
      const T = RB.content.intentText[it.kind];
      pool = T ? [].concat(T[prof] || T.F || []) : [];
    }
    if (!pool.length) return { jp: '', en: it.label };
    let cands = pool;
    if (solo || it.target === 'both') cands = pool.filter((x) => !x.neg);
    if (!cands.length) cands = pool;
    const pick = cands[(st.round + st.knots) % cands.length];
    const nm = { pc: s.player.nameJp || s.player.name, comp: s.comp ? RB.jp.plain(RB.content.chars[s.comp].name.jp) : '' };
    const nmEn = { pc: s.player.name, comp: s.comp ? RB.content.chars[s.comp].name.en : '' };
    const tgt = it.target === 'comp' ? 'comp' : 'pc';
    const other = tgt === 'pc' ? 'comp' : 'pc';
    return {
      jp: pick.jp, en: (pick.en || '').replace(/\$tgtEn/g, nmEn[tgt]).replace(/\$otherEn/g, nmEn[other]),
      vars: { tgt: nm[tgt], other: nm[other] }, neg: !!pick.neg,
    };
  }

  // ---- the overlay: foe slip, telegraph card, stage, party, response dock ----
  const I = (n, t) => RB.learnUi.icon(n, t);
  const INTENT_ICON = { strike: 'strike', sweep: 'sweep', heat: 'flame', shroud: 'cloud', charge: 'hourglass', gust: 'gust', mend: 'needle', lie: 'mask', plea: 'history', rest: 'rest', flood: 'waves', chill: 'snow', silence: 'mute', mirror: 'mirror' };
  const TAG_ICON = [['ward', 'shield'], ['water', 'drop'], ['light', 'sun'], ['heal', 'leaf'], ['wind', 'wind'], ['bind', 'rope'], ['anchor', 'stone'], ['stone', 'stone'], ['fire', 'flame'], ['warm', 'flame'], ['bell', 'bell'], ['voice', 'sound']];
  // plain attacks whose target the translated telegraph names outright
  const AIMED = { strike: 1, sweep: 1, gust: 1, flood: 1, chill: 1 };
  function cardIcon(c) {
    if (c.kind === 'unravel') return 'knot';
    if (c.kind === 'answer') return 'history';
    if (c.kind === 'truth') return 'lens';
    if (c.kind === 'tech') return 'join';
    const tags = (c.word && c.word.tags) || [];
    for (const [t, n] of TAG_ICON) if (tags.indexOf(t) >= 0) return n;
    return 'words';
  }
  function compName() {
    const s = RB.game.s;
    return s.comp && RB.content.chars[s.comp] ? RB.content.chars[s.comp].name.en : 'companion';
  }
  function buildUi() {
    const root = RB.ui.el('div', 'combat-ui');
    root.innerHTML =
      '<div class="cb-foe"></div>' +
      '<div class="cb-side">' +
        '<section class="intent paper" aria-live="polite" aria-label="What it is about to do"></section>' +
        '<section class="cb-dock" aria-label="Respond"><h2 class="cb-dock-h">Respond</h2>' +
          '<div class="responses" role="group" aria-label="Responses"></div>' +
          '<div class="clog paper hidden" aria-live="polite"></div></section>' +
      '</div>' +
      '<div class="cb-stage" aria-hidden="true"></div>' +
      '<section class="bars cb-party" aria-label="Your party"></section>';
    RB.ui.root.appendChild(root);
    const q = (x) => root.querySelector(x);
    const o = { root, foe: q('.cb-foe'), intent: q('.intent'), stage: q('.cb-stage'), bars: q('.bars'), dock: q('.cb-dock'), resp: q('.responses'), log: q('.clog') };
    RB.learnUi.guardTaps(o.resp);
    o.onResize = () => requestAnimationFrame(measure);
    window.addEventListener('resize', o.onResize);
    root.addEventListener('scroll', o.onResize, { passive: true });
    o.ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(o.onResize) : null;
    if (o.ro) o.ro.observe(o.stage);
    return o;
  }
  let showIntentEn = false;
  function enShown() { return RB.game.s.learn.profile === 'F' || showIntentEn; }
  function intentHtml(compact) {
    const it = st.intent;
    const line = intentLine(it);
    const states = [st.shroud ? 'shrouded' : '', st.heat ? 'heat ' + st.heat : '', st.charged ? 'charged' : ''].filter(Boolean);
    let h = '<div class="it-label">' + I(INTENT_ICON[it.kind] || 'strike') + '<span class="k">' + esc(it.label) + '</span>' + states.map((x) => '<span class="st">' + esc(x) + '</span>').join('') + '</div>';
    if (line.jp) h += '<div class="it-jp">' + RB.ui.jhtml(line.jp, { vars: line.vars }) + '</div>';
    if (line.en) h += enShown() ? '<div class="it-en">' + esc(line.en) + '</div>' : (compact ? '' : '<button class="pbtn quiet tr" data-tr title="Show the English (counts as assisted)">' + I('note') + '<span>Translate <span class="aside">(assisted)</span></span></button>');
    if (!compact && RB.game.s.comp === 'nao' && st.nextIntents.length) h += '<div class="it-next">' + I('companion') + '<span>Nao: “After that — ' + esc(st.nextIntents.map((x) => x.label).join(', then ')) + '.”</span></div>';
    return h;
  }
  function knotsHtml() {
    let h = '';
    for (let i = 0; i < st.maxKnots; i++) h += '<span class="kn' + (i < st.knots ? ' tied' : '') + '"></span>';
    return '<span class="knots" role="img" aria-label="Knots still tied: ' + st.knots + ' of ' + st.maxKnots + '">' + h + '</span><span class="kn-t">' + st.knots + ' / ' + st.maxKnots + ' knots</span>';
  }
  function renderUi() {
    const s = RB.game.s;
    const it = st.intent;
    ui.foe.innerHTML = '<span class="foe-n">' + RB.ui.jhtml(enemy.name.jp) + ' <span class="en">' + esc(enemy.name.en) + '</span></span>' + knotsHtml();
    ui.intent.innerHTML = intentHtml(false);
    const tr = ui.intent.querySelector('[data-tr]');
    if (tr) tr.onclick = () => { showIntentEn = true; st.assistedRound = true; renderUi(); };
    // the party: resolve (numbers and bar), wards, harmony; the telegraph's
    // target is marked once its meaning is on screen (never before)
    const aimed = enShown() && AIMED[it.kind] ? (it.target === 'both' ? ['pc', 'comp'] : [it.target]) : [];
    const member = (who, name, v, max, ward) => '<div class="pm' + (aimed.indexOf(who) >= 0 ? ' aimed' : '') + '">' +
      '<div class="pm-h"><span class="pm-n">' + esc(name) + '</span>' +
      (ward ? '<span class="pm-w" title="Wards">' + I('shield') + '<span class="sr">wards </span>' + ward + '</span>' : '') +
      (aimed.indexOf(who) >= 0 ? '<span class="aimtag">' + I('aim') + 'its aim</span>' : '') +
      '<span class="pm-v">' + v + ' / ' + max + '</span></div>' +
      '<div class="bar" role="meter" aria-label="' + esc(name) + ' resolve" aria-valuemin="0" aria-valuemax="' + max + '" aria-valuenow="' + v + '"><i style="width:' + Math.round((100 * v) / max) + '%"></i></div></div>';
    ui.bars.innerHTML = member('pc', s.player.name, st.pc, st.max, st.ward.pc) +
      (s.comp ? member('comp', compName(), st.comp, st.max, st.ward.comp) : '') +
      (s.comp ? '<div class="pm harmony"><div class="pm-h"><span class="pm-n">Harmony</span><span class="pm-v">' + st.harmony + ' / ' + st.harmonyMax + '</span></div><div class="bar h" role="meter" aria-label="Harmony" aria-valuemin="0" aria-valuemax="' + st.harmonyMax + '" aria-valuenow="' + st.harmony + '"><i style="width:' + Math.round((100 * st.harmony) / st.harmonyMax) + '%"></i></div></div>' : '') +
      '<div class="pm-note">' + (st.assist ? 'Assisted: mistakes cost nothing' : 'Mistakes cost at most 1') + '</div>';
    requestAnimationFrame(measure);
  }
  function words() {
    const s = RB.game.s;
    return s.words.map((id) => RB.content.words[id]).filter(Boolean);
  }
  function cardHtml(c, i, hi) {
    const tgt = c.target ? (c.target === 'comp' ? compName() : 'you') : '';
    const desc = c.disabled || RB.script.enVars(tgt ? String(c.desc).replace(/\s*\([^)]*\)\s*$/, '') : c.desc);
    return '<button class="resp rcard" data-i="' + i + '"' + (c.disabled ? ' disabled' : '') + '>' +
      '<span class="ic">' + I(cardIcon(c)) + '</span>' +
      '<span class="rc-w"><span class="rc-jp">' + RB.ui.jhtml(hi && c.word && c.word.jpK ? c.word.jpK : c.jp) + '</span><span class="rc-en">' + esc(c.en) + '</span></span>' +
      (tgt ? '<span class="rc-tgt">on ' + esc(tgt) + '</span>' : '') +
      '<span class="rc-d">' + (c.disabled ? I('warn') : '') + esc(desc) + '</span></button>';
  }
  function pickCard() {
    return new Promise((resolve) => {
      const s = RB.game.s;
      const cards = L().responses(st, words());
      const known = new Set(words().flatMap((w) => w.tags));
      // Keep every encounter solvable: only block Unravel if a counter is actually known.
      for (const c of cards) {
        if (c.kind === 'unravel' && st.shroud && !(known.has('light') || known.has('wind'))) c.disabled = null;
        if (c.kind === 'unravel' && st.silenced && (known.has('bell') || known.has('voice'))) c.disabled = 'The hush swallows words: ring a bell or raise a voice first.';
      }
      const hi = s.learn.profile === 'I' || s.learn.profile === 'A';
      ui.resp.innerHTML = '<div class="rcards">' + cards.map((c, i) => cardHtml(c, i, hi)).join('') + '</div>' +
        (st.noFlee ? '' : '<button class="cbtn flee" data-flee>' + I('back') + '<span>Step back from this encounter</span></button>');
      ui.log.classList.add('hidden');
      const layer = { el: ui.resp, name: 'cards', parent: ui.dock };
      const done = (v) => { RB.ui.popLayer(layer); ui.dock.insertBefore(ui.resp, ui.log); resolve(v); };
      ui.resp.onclick = (e) => {
        const b = e.target.closest('[data-i]');
        if (b && !b.disabled) { done(cards[+b.getAttribute('data-i')]); return; }
        if (e.target.closest('[data-flee]')) done({ kind: 'flee' });
      };
      layer.onCancel = () => {};
      RB.ui.pushLayer(layer);
      ui.dock.insertBefore(ui.resp, ui.log);
    });
  }
  function stepFor(card) {
    const s = RB.game.s;
    const it = st.intent;
    if (card.kind === 'unravel' || card.kind === 'tech') {
      const step = RB.tasks.next(enemy.pool || {}, {});
      step.title = card.kind === 'tech' ? 'Coordinated technique — weave it together' : 'Unravel: restore one of its tangled words';
      return step;
    }
    if (card.kind === 'answer' || card.kind === 'truth') {
      const src = card.kind === 'answer' ? it.answer : it.truth;
      const t = src ? RB.util.deepClone(tierOf(src) || src) : null;
      if (t) { t.title = card.kind === 'answer' ? 'Answer what it is really asking' : 'See through the false promise'; return RB.tasks.prepare(t); }
      return RB.tasks.next(enemy.pool || {});
    }
    const w = card.word;
    const hi = s.learn.profile === 'I' || s.learn.profile === 'A';
    return RB.tasks.prepare({
      kind: 'write', item: 'v:' + (w.lex || w.r), answer: w.r, accept: [w.r, RB.tasks.plain(w.jpK || w.jp)], mode: 'reading',
      title: 'Weave the inscription', prompt: { en: 'Write the word for “' + w.en + '”' + (hi ? ' (kana or kanji).' : '.') },
      explain: { jp: w.jpK || w.jp, en: w.en + ' — ' + w.effect },
    });
  }
  // The situation, carried onto the challenge's task slip: the foe, its
  // telegraph, and the response (and its target) the player chose.
  function situationHtml(card) {
    const tgt = card.target ? (card.target === 'comp' ? compName() : 'you') : '';
    return '<div class="cb-situ">' +
      '<div class="cs-foe">' + RB.ui.jhtml(enemy.name.jp) + ' <span class="en">' + esc(enemy.name.en) + '</span> ' + knotsHtml() + '</div>' +
      '<div class="cs-intent">' + intentHtml(true) + '</div>' +
      '<div class="cs-chose">' + I(cardIcon(card)) + '<span>You chose <b>' + esc(card.en) + '</b>' + (tgt ? ' — on <b>' + esc(tgt) + '</b>' : '') + '. The encounter waits while you write.</span></div></div>';
  }
  function say(line, who) {
    return RB.ui.dialogue.say({ who: who || 'narr', jp: line.jp, en: line.en });
  }
  function log(text) {
    ui.log.classList.remove('hidden');
    ui.log.innerHTML = text;
    return new Promise((r) => setTimeout(r, RB.game.reducedMotion() ? 500 : 900));
  }
  async function playFx(fx) {
    for (const f of fx) {
      let msg = '';
      const s = RB.game.s;
      const nm = (who) => (who === 'comp' ? RB.content.chars[s.comp].name.en : s.player.name);
      switch (f.t) {
        case 'unravel': addFx('untie'); RB.audio && RB.audio.sfx('knot_untie'); msg = f.n > 1 ? 'Two knots come loose.' : 'A knot comes loose.'; break;
        case 'ward': addFx('glyph', partyAt(f.target === 'comp' ? 28 : 8, 12)); RB.audio && RB.audio.sfx('ward'); msg = f.block ? 'The ward catches the blow meant for ' + nm(f.target) + '.' : 'A ward rises before ' + nm(f.target) + '.'; break;
        case 'water': addFx('water'); RB.audio && RB.audio.sfx('water'); msg = 'Water hisses over the heat.'; break;
        case 'light': addFx('light'); RB.audio && RB.audio.sfx('light'); msg = 'Light burns the mist away.'; break;
        case 'bind': RB.audio && RB.audio.sfx('ward'); msg = 'The rope holds it fast; the gathered force spills away.'; break;
        case 'heal': addFx('heal'); RB.audio && RB.audio.sfx('heal'); msg = 'You both breathe easier.'; break;
        case 'warm': RB.audio && RB.audio.sfx('light'); msg = 'Warmth spreads through your fingers.'; break;
        case 'bell': RB.audio && RB.audio.sfx('bell'); msg = 'A clear note breaks the hush.'; break;
        case 'hit': shake = 200; addFx('hit', partyAt(f.who === 'comp' ? 28 : 8, 16)); RB.audio && RB.audio.sfx('party_hit'); msg = nm(f.who) + ' is struck (−' + f.n + ').'; break;
        case 'block': RB.audio && RB.audio.sfx('ward'); msg = 'The ward absorbs ' + f.n + '.'; break;
        case 'heat': RB.audio && RB.audio.sfx('enemy_intent'); msg = 'The heat builds (' + f.n + ').'; break;
        case 'shroud': RB.audio && RB.audio.sfx('wind'); msg = 'Mist swallows its knots.'; break;
        case 'charge': RB.audio && RB.audio.sfx('enemy_intent'); msg = 'It gathers itself. The next blow will be heavy.'; break;
        case 'mend': RB.audio && RB.audio.sfx('enemy_intent'); msg = 'It ties one knot back up.'; break;
        case 'stripWard': RB.audio && RB.audio.sfx('wind'); msg = 'The gust tears your wards away.'; break;
        case 'silence': RB.audio && RB.audio.sfx('enemy_intent'); msg = 'Sound drains out of the air.'; break;
        case 'countered': RB.audio && RB.audio.sfx('reveal'); msg = 'You answered it — its move comes to nothing.'; break;
        case 'cost': msg = f.en; break;
        case 'comp': case 'tech': case 'settle': case 'reveal': msg = f.en; RB.audio && RB.audio.sfx(f.t === 'tech' ? 'technique' : 'reveal'); break;
        case 'plea': msg = 'It waits for an answer that doesn\'t come.'; break;
        default: msg = '';
      }
      if (msg) { renderUi(); await log(esc(msg)); }
    }
    ui.log.classList.add('hidden');
    renderUi();
  }

  async function start(enemyId, opts) {
    opts = opts || {};
    if (RB.test && RB.test.auto) return RB.test.battle(enemyId);
    const s = RB.game.s;
    enemy = Object.assign({ id: enemyId }, RB.content.enemies[enemyId] || {});
    if (!RB.content.enemies[enemyId]) console.warn('missing enemy', enemyId);
    RB.game.pushMode('combat');
    const prevSong = RB.audio && RB.audio.currentSong();
    RB.audio && RB.audio.playSong(enemy.music || (enemy.boss ? 'boss' : 'battle'));
    await RB.ui.fade(true, 200);
    RB.render.setOverride(draw);
    st = L().init(enemy, s, opts);
    st.noFlee = !!opts.noFlee || !!enemy.boss;
    showIntentEn = false;
    ui = buildUi();
    measure();
    await RB.ui.fade(false, 200);
    let outcome = null;
    try {
      if (enemy.intro) await say(tierOf(enemy.intro) || enemy.intro, enemy.introWho);
      RB.ui.dialogue.hide();
      while (!outcome) {
        if (st.phaseChanged) {
          const ph = st.phaseChanged;
          if (ph.line) { await say(tierOf(ph.line) || ph.line, ph.who); RB.ui.dialogue.hide(); }
          if (ph.teach) await RB.challenge.teachCard({ title: 'Something has changed', en: ph.teach.en, jp: ph.teach.jp });
          st.phaseChanged = null;
        }
        renderUi();
        RB.audio && RB.audio.sfx('enemy_intent', { vol: 0.5 });
        st.assistedRound = false;
        const card = await pickCard();
        if (card.kind === 'flee') {
          const r = await RB.ui.confirm('Step back from this encounter? Nothing is lost; you can return whenever you like.', ['Step back', 'Stay']);
          if (r === 0) { outcome = 'flee'; break; }
          continue;
        }
        ui.resp.innerHTML = '';
        const step = stepFor(card);
        const res = await RB.challenge.runStep(step, {
          header: situationHtml(card),
          allowCancel: true, cancelLabel: 'Choose a different response', ctxTag: 'battle:' + enemyId,
        });
        if (res.cancelled) continue;
        if (st.assistedRound) res.assisted = true;
        const { fx, countered } = L().playerAct(st, card, res, enemy);
        await playFx(fx);
        if (st.knots <= 0) { outcome = 'win'; break; }
        const efx = L().enemyAct(st, countered);
        await playFx(efx);
        L().endRound(st, enemy);
        if (st.log.length && st.log[st.log.length - 1].t === 'revive') {
          st.log.pop();
          const c = RB.content.chars[s.comp];
          await log(esc(c.name.en + ' hauls you back to your feet.'));
        }
        if (st.over) outcome = st.over;
      }
      if (outcome === 'win') {
        RB.audio && RB.audio.playSong('victory');
        if (enemy.settle) { await say(tierOf(enemy.settle) || enemy.settle, enemy.settleWho); RB.ui.dialogue.hide(); }
        if (enemy.reward) {
          for (const k in enemy.reward.items || {}) { RB.state.give(s, k, enemy.reward.items[k]); const it = RB.content.items[k]; if (it) await RB.ui.toast({ kind: 'item', jp: it.name.jp, en: it.name.en }); }
          for (const wd of enemy.reward.words || []) if (s.words.indexOf(wd) < 0) { s.words.push(wd); const W = RB.content.words[wd]; if (W) await RB.ui.toast({ kind: 'word', jp: W.jp, en: W.en }); }
        }
        s.vars.battlesWon = (s.vars.battlesWon || 0) + 1;
      }
    } finally {
      // Resolve recovers after every encounter: no attrition grinding.
      s.resolve.pc = s.resolve.max;
      s.resolve.comp = s.resolve.max;
      if (ui) { window.removeEventListener('resize', ui.onResize); if (ui.ro) ui.ro.disconnect(); ui.root.remove(); }
      ui = null; stageCss = null; lastLay = null;
      await RB.ui.fade(true, 200);
      RB.render.setOverride(null);
      RB.game.popMode('combat');
      await RB.ui.fade(false, 200);
      const m = RB.world.W.map;
      if (m && m.def.music) RB.audio && RB.audio.playSong(typeof m.def.music === 'string' ? m.def.music : (m.def.music.find((x) => !x.if || RB.state.test(s, x.if)) || {}).id);
      else if (prevSong) RB.audio && RB.audio.playSong(prevSong);
      st = null;
    }
    return outcome;
  }
  return { start, state: () => st };
})();
