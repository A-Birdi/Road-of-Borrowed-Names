/* The fidelity study: Suzu at the Mill (expansion P01, C-80; docs/future/work/P01_STUDY.md). Development only.
 *
 * Robin asked to see how far the world's pixel art can go: Suzu redrawn from scratch, alone in front of the Mill,
 * rendered as the game renders (not a painting), with an idle loop and the scenery moving. The study is a mode of
 * the game: it draws into the game's own art-resolution buffer through the renderer's full-screen override, at the
 * same whole-number pixel scale as the world, every frame, from the real map's layout (rw.millroad).
 *
 * It opens only on a development page (the world proof's switch: ?dev=world, or window.__RB_DEV_WORLD__ set before
 * start), from the proof's panel or with ?study=mill in the address. It reads no save, writes none and changes no
 * state of a journey: closing it returns to whatever was on screen.
 *
 *   RB.study.open()  RB.study.close()  RB.study.isOpen()  RB.study.opts (layers)  RB.study.set({...})
 *   RB.study.stats() (build and frame timings, for the measurements) */
var RB = (globalThis.RB = globalThis.RB || {});

RB.study = (function () {
  'use strict';
  const allowed = () => !!(RB.worldLook && RB.worldLook.allowed && RB.worldLook.allowed());
  const opts = { light: true, focus: true, bloom: true, motion: true, life: true, close: false };
  // the game's own camera, or a closer one (about two thirds as many tiles across) for looking at the detail
  const closeView = (cw, ch) => ({ w: (cw < 700 ? 12 : cw < 1100 ? 17 : 21) * 0.68, h: (ch < 520 ? 8 : 12) * 0.68 });
  function applyView() { if (RB.render && RB.render.setView) RB.render.setView(on && opts.close ? closeView : null); }
  const stat = { buildMs: 0, frames: 0, frameMs: 0, lastMs: 0 };
  let S = null, on = false, prev = null, ui = null, t0 = 0;
  // the camera: the door of the mill a little above the middle, Suzu below it (world art px)
  const FOCUS = { x: 316, y: 170 };
  const SUZU = { x: 334, y: 215 }; // on the path a step east of the door (tile 10, 6), between her feet

  function draw(c, bw, bh, t) {
    const a = typeof performance !== 'undefined' ? performance.now() : 0;
    const cam = { x: Math.round(FOCUS.x - bw / 2), y: Math.round(FOCUS.y - bh / 2) };
    c.fillStyle = '#10161c';
    c.fillRect(0, 0, bw, bh);
    const tt = t - t0;
    const suzu = { z: SUZU.y, draw: () => RB.studySuzu.draw(c, cam, SUZU.x, SUZU.y, tt, opts) };
    RB.studyMill.draw(S, c, cam, bw, bh, tt, Object.assign({ extra: [suzu] }, opts));
    if (opts.life) RB.studyMill.life(S, c, cam, bw, bh, opts.motion ? tt : 0);
    post(c, cam, bw, bh, opts.motion ? tt : 0);
    const ms = (typeof performance !== 'undefined' ? performance.now() : 0) - a;
    stat.frames++; stat.frameMs += ms; stat.lastMs = ms;
  }
  draw.art = true;

  // ---- the lens: light shafts, bloom, focus, grade, vignette (all at the buffer's resolution) ----------------
  const cvs = {};
  function scratch(k, w, h) {
    let c = cvs[k];
    if (!c || c.width !== w || c.height !== h) { c = cvs[k] = RB.sprites.makeCanvas(w, h); }
    const g = c.getContext('2d');
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    g.clearRect(0, 0, w, h);
    return { c, g };
  }
  // a soft copy of the frame: down to a quarter and back, smoothed (a cheap, even blur)
  function soften(src, w, h, k) {
    const a = scratch('sa' + k, Math.max(1, Math.round(w / k)), Math.max(1, Math.round(h / k)));
    a.g.imageSmoothingEnabled = true;
    a.g.drawImage(src, 0, 0, w, h, 0, 0, a.c.width, a.c.height);
    return a.c;
  }
  function post(c, cam, bw, bh, t) {
    const frame = c.canvas;
    if (opts.light) {
      // sun shafts slanting from the upper left through the gaps in the canopy, breathing slowly
      c.save();
      c.globalCompositeOperation = 'screen';
      for (const sh of SHAFTS) {
        const x0 = sh.x - cam.x, y0 = -60 - cam.y, len = 520, a = sh.a * (0.75 + 0.25 * Math.sin(t / 2600 + sh.x));
        const g = c.createLinearGradient(x0, y0, x0 + len * 0.62, y0 + len * 0.78);
        g.addColorStop(0, 'rgba(255,226,160,' + a + ')');
        g.addColorStop(0.55, 'rgba(255,214,150,' + a * 0.5 + ')');
        g.addColorStop(1, 'rgba(255,210,150,0)');
        c.fillStyle = g;
        c.beginPath();
        c.moveTo(x0, y0); c.lineTo(x0 + sh.w, y0); c.lineTo(x0 + sh.w + len * 0.62, y0 + len * 0.78); c.lineTo(x0 + len * 0.62, y0 + len * 0.78);
        c.closePath(); c.fill();
      }
      c.restore();
      // the grade: warm in the light, a breath of haze over the far forest
      c.save();
      c.globalCompositeOperation = 'overlay';
      c.fillStyle = 'rgba(255,196,120,0.16)';
      c.fillRect(0, 0, bw, bh);
      c.globalCompositeOperation = 'screen';
      const hz = c.createLinearGradient(0, -40 - cam.y, 0, 60 - cam.y);
      hz.addColorStop(0, 'rgba(190,200,190,0.22)'); hz.addColorStop(1, 'rgba(190,200,190,0)');
      c.fillStyle = hz; c.fillRect(0, 0, bw, bh);
      c.restore();
    }
    if (opts.bloom) {
      // bloom: only what is already bright (the frame multiplied by itself twice), spread and laid back on top
      const q = scratch('bloom', Math.ceil(bw / 4), Math.ceil(bh / 4));
      q.g.imageSmoothingEnabled = true;
      q.g.drawImage(frame, 0, 0, bw, bh, 0, 0, q.c.width, q.c.height);
      q.g.globalCompositeOperation = 'multiply';
      q.g.drawImage(q.c, 0, 0); q.g.drawImage(q.c, 0, 0); q.g.drawImage(q.c, 0, 0);
      const r = soften(q.c, q.c.width, q.c.height, 2);
      c.save();
      c.imageSmoothingEnabled = true;
      c.globalCompositeOperation = 'screen';
      c.globalAlpha = 0.5;
      c.drawImage(r, 0, 0, r.width, r.height, 0, 0, bw, bh);
      c.globalAlpha = 0.35;
      c.drawImage(q.c, 0, 0, q.c.width, q.c.height, 0, 0, bw, bh);
      c.restore();
    }
    if (opts.focus) {
      // depth of field: the far forest and the near foreground soften; the mill and Suzu stay sharp
      const blur = soften(soften(frame, bw, bh, 2), Math.ceil(bw / 2), Math.ceil(bh / 2), 2);
      const m = scratch('dof', bw, bh);
      m.g.imageSmoothingEnabled = true;
      m.g.drawImage(blur, 0, 0, blur.width, blur.height, 0, 0, bw, bh);
      m.g.globalCompositeOperation = 'destination-in';
      const yFar0 = -70 - cam.y, yFar1 = -16 - cam.y, yNear0 = 280 - cam.y, yNear1 = 380 - cam.y;
      const g = m.g.createLinearGradient(0, Math.min(yFar0, 0), 0, Math.max(yNear1, bh));
      const span = Math.max(yNear1, bh) - Math.min(yFar0, 0), at = (y) => Math.max(0, Math.min(1, (y - Math.min(yFar0, 0)) / span));
      g.addColorStop(at(yFar0), 'rgba(0,0,0,1)'); g.addColorStop(at(yFar1), 'rgba(0,0,0,0)');
      g.addColorStop(at(yNear0), 'rgba(0,0,0,0)'); g.addColorStop(at(yNear1), 'rgba(0,0,0,1)');
      m.g.fillStyle = g; m.g.fillRect(0, 0, bw, bh);
      c.drawImage(m.c, 0, 0);
    }
    if (opts.light) {
      // a soft vignette
      c.save();
      c.globalCompositeOperation = 'multiply';
      const v = c.createRadialGradient(bw / 2, bh * 0.46, Math.min(bw, bh) * 0.35, bw / 2, bh * 0.46, Math.hypot(bw, bh) * 0.62);
      v.addColorStop(0, 'rgba(255,255,255,1)'); v.addColorStop(1, 'rgba(150,140,175,1)');
      c.fillStyle = v; c.fillRect(0, 0, bw, bh);
      c.restore();
    }
  }
  // where the sun comes through the trees (world x at the top of the shafts), their widths and strengths
  const SHAFTS = [{ x: -80, w: 40, a: 0.22 }, { x: 30, w: 20, a: 0.17 }, { x: 140, w: 30, a: 0.2 }, { x: 410, w: 24, a: 0.14 }];

  function open() {
    if (!allowed() || on) return false;
    const a = typeof performance !== 'undefined' ? performance.now() : 0;
    if (!S) { S = RB.studyMill.build(); RB.studySuzu.build(); }
    stat.buildMs = (typeof performance !== 'undefined' ? performance.now() : 0) - a;
    on = true;
    t0 = typeof performance !== 'undefined' ? performance.now() : 0;
    prev = RB.render.getOverride ? RB.render.getOverride() : null;
    RB.game.pushMode('study');
    RB.render.setOverride(draw);
    applyView();
    if (typeof document !== 'undefined' && !document.getElementById('study-css')) {
      const css = document.createElement('style');
      css.id = 'study-css';
      css.textContent = 'body[data-mode="study"] #ui, body[data-mode="study"] #overlay { visibility: hidden; }';
      document.head.appendChild(css);
    }
    showUi();
    return true;
  }
  function close() {
    if (!on) return;
    on = false;
    RB.render.setOverride(prev || null);
    prev = null;
    RB.game.popMode('study');
    RB.render.setView(null);
    if (RB.worldLook && RB.worldLook.set) RB.worldLook.set({});
    if (ui) { ui.remove(); ui = null; }
    if (RB.world && RB.world.W && RB.world.W.map) RB.render.invalidate();
  }
  function set(o) { Object.assign(opts, o || {}); applyView(); syncUi(); }

  // a small caption with the layer switches and a way out (Escape closes it too)
  function showUi() {
    if (typeof document === 'undefined') return;
    ui = document.createElement('div');
    ui.id = 'study-ui';
    ui.setAttribute('role', 'region');
    ui.setAttribute('aria-label', 'Fidelity study (development)');
    ui.style.cssText = 'position:fixed;right:8px;bottom:8px;z-index:99999;background:rgba(20,26,34,0.86);color:#eee;font:12px sans-serif;padding:6px 8px;border:1px solid #567;border-radius:6px;display:flex;flex-wrap:wrap;gap:4px;align-items:center;max-width:94vw';
    const B = (k, label) => '<button type="button" data-k="' + k + '" aria-pressed="true" style="font:12px sans-serif;color:#f4f0e6;background:#34485c;border:1px solid #7a90a6;border-radius:4px;min-height:26px;padding:1px 7px">' + label + '</button>';
    ui.innerHTML = '<span style="margin-right:4px">Study: Suzu at the Mill</span>' + B('light', 'Light') + B('focus', 'Focus') + B('bloom', 'Bloom') + B('motion', 'Motion') + B('life', 'Life') + B('close', 'Close') +
      '<button type="button" id="study-close" style="font:12px sans-serif;color:#fff;background:#7a3a3a;border:1px solid #c88;border-radius:4px;min-height:26px;padding:1px 7px">Close</button>';
    document.body.appendChild(ui);
    ui.addEventListener('click', (e) => {
      const b = e.target.closest('[data-k]');
      if (b) { set({ [b.dataset.k]: !opts[b.dataset.k] }); return; }
      if (e.target.closest('#study-close')) close();
    });
    syncUi();
  }
  function syncUi() {
    if (!ui) return;
    for (const b of ui.querySelectorAll('[data-k]')) b.setAttribute('aria-pressed', String(!!opts[b.dataset.k]));
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', (e) => { if (on && e.key === 'Escape') { e.preventDefault(); close(); } });
    // ?study=mill on a development page opens it once the game is ready
    if (/[?&]study=mill\b/.test((window.location && window.location.search) || '')) {
      let tries = 0;
      const go = () => { if (window.__RB_READY__ === true && document.body && allowed()) open(); else if (++tries < 300) setTimeout(go, 100); };
      setTimeout(go, 0);
    }
  }

  return { open, close, set, opts, isOpen: () => on, stats: () => Object.assign({}, stat, { avgMs: stat.frames ? stat.frameMs / stat.frames : 0 }), scene: () => S, FOCUS };
})();
