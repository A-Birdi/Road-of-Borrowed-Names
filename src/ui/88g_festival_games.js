/* The festival's other four games on screen (expansion P09; their words and prizes are in
 * src/content/pastimes/51_festival_games.js; the shell, its modes and its records are src/ui/88e_festival.js).
 * Each game draws itself into the shell's stage: start(el, api), stop() → { score, streak }.
 *   katanuki  read the shape's name, choose its sheet, trace it out on the sheet (pointer or touch); "Steady hand"
 *             traces it for you (a piece pressed out that way is not counted in a timed round)
 *   wanage    the prize is described (and spoken, if the voice is on); throw at the one described
 *   kuji      draw a word; forge a sentence with it (the forge, L7); the stall-keeper answers what you said
 *   taiko     ドン is the drum's face, カッ its rim; practice is call and response at your own pace, a timed round
 *             is played in time (each beat has its moment); keys F or J for ドン, D or K for カッ
 * Reduced motion: no flying ring, no sliding beat marker (it steps). Nothing here keeps anything: the shell keeps a
 * timed round's best, and that is all. */
var RB = (globalThis.RB = globalThis.RB || {});
RB.ui.festivalGames = RB.ui.festivalGames || {};

(function () {
  'use strict';
  const esc = RB.util.esc;
  const J = (s) => RB.ui.jhtml(s);
  const FC = () => RB.content.festival;
  const reduced = () => !!(RB.game.reducedMotion && RB.game.reducedMotion());
  const high = (s) => { const p = s && s.learn && s.learn.profile; return p === 'I' || p === 'A'; };
  function rng(seed) { let x = (seed >>> 0) || 1; return () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; }; }
  const seedOf = (api, id) => (RB.util.hashStr(String(api.s.id || 'fv') + '|' + id + '|' + Date.now()) >>> 0) || 1;
  const pick = (r, list) => list[Math.floor(r() * list.length)];
  const shuffle = (r, list) => { const a = list.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  // ===================================================================== 型抜き
  // outlines in a unit square (0..1), as closed polylines
  function outline(id) {
    const pts = [];
    const circ = (cx, cy, rx, ry, a0, a1, n) => { for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } };
    if (id === 'star') { for (let i = 0; i <= 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 0.17 : 0.4; pts.push([0.5 + Math.cos(a) * r, 0.52 + Math.sin(a) * r]); } }
    else if (id === 'umbrella') { circ(0.5, 0.48, 0.36, 0.3, Math.PI, 2 * Math.PI, 16); pts.push([0.52, 0.48], [0.52, 0.8], [0.44, 0.84], [0.42, 0.78], [0.48, 0.8], [0.48, 0.48], [0.14, 0.48]); }
    else if (id === 'fish') { circ(0.42, 0.5, 0.26, 0.16, 0.5, 2 * Math.PI - 0.5, 18); pts.push([0.86, 0.32], [0.86, 0.68], [0.42 + Math.cos(0.5) * 0.26, 0.5 + Math.sin(0.5) * 0.16]); }
    else if (id === 'gourd') { circ(0.5, 0.33, 0.14, 0.14, Math.PI * 0.7, Math.PI * 2.3, 14); circ(0.5, 0.64, 0.22, 0.22, -Math.PI * 0.35, Math.PI * 1.35, 18); pts.push(pts[0]); }
    else if (id === 'moon') { circ(0.5, 0.5, 0.34, 0.34, -Math.PI * 0.6, Math.PI * 0.6, 20); circ(0.64, 0.5, 0.3, 0.3, Math.PI * 0.62, -Math.PI * 0.62, 20); pts.push(pts[0]); }
    else { pts.push([0.2, 0.84], [0.2, 0.46], [0.5, 0.18], [0.8, 0.46], [0.8, 0.84], [0.2, 0.84]); }
    return pts;
  }
  // samples along a polyline every `step` (unit lengths)
  function sample(pts, step) {
    const out = [];
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
      const d = Math.hypot(x1 - x0, y1 - y0), n = Math.max(1, Math.ceil(d / step));
      for (let k = 0; k < n; k++) out.push([x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n]);
    }
    return out;
  }
  const near = (p, list, tol) => list.some((q) => Math.hypot(p[0] - q[0], p[1] - q[1]) <= tol);
  const TOL = 0.055;
  // the steady-hand judgement: how much of the groove the trace followed, and how much of the trace stayed in it
  function judge(groove, trace) {
    if (trace.length < 8) return { ok: false, why: 'Hardly started: trace all the way round.' };
    const g = sample(groove, 0.02);
    const cover = g.filter((p) => near(p, trace, TOL)).length / g.length;
    const inside = trace.filter((p) => near(p, g, TOL)).length / trace.length;
    if (cover >= 0.78 && inside >= 0.82) return { ok: true, cover, inside };
    return { ok: false, cover, inside, why: cover < 0.78 ? 'Part of the outline was never traced, and it snapped there.' : 'The needle wandered off the line, and the sheet cracked.' };
  }
  RB.ui.festivalGames.katanuki = (function () {
    let G = null;
    function start(el, api) {
      G = { el, api, r: rng(seedOf(api, 'katanuki')), score: 0, streak: 0, best: 0, done: 0, practiceOf: 4, phase: 'choose', target: null, sheets: [], trace: [], drawing: false, assisted: false };
      el.addEventListener('click', onClick);
      next();
    }
    function next() {
      const shapes = FC().katanuki.shapes;
      G.target = pick(G.r, shapes);
      G.sheets = shuffle(G.r, [G.target].concat(shuffle(G.r, shapes.filter((s) => s !== G.target)).slice(0, 3)));
      G.phase = 'choose'; G.trace = []; G.assisted = false;
      draw();
    }
    const ask = () => { const k = FC().katanuki; return k.ask.jp.replace('%S', high(G.api.s) ? G.target.name.jp : G.target.kana); };
    function sheetSvg(id, big) {
      const pts = outline(id).map(([x, y]) => (x * 100).toFixed(1) + ',' + (y * 100).toFixed(1)).join(' ');
      return '<svg viewBox="0 0 100 100" class="fv-sheet' + (big ? ' big' : '') + '" aria-hidden="true"><rect x="3" y="3" width="94" height="94" rx="6"/><polyline points="' + pts + '"/></svg>';
    }
    function draw() {
      if (!G) return;
      const timed = G.api.mode === 'timed';
      let h = '<p class="fv-ask">' + J(ask()) + '</p>';
      if (G.phase === 'choose') {
        h += '<div class="fv-sheets" role="group" aria-label="The candy sheets">' + G.sheets.map((s, i) => '<button type="button" class="fv-sheetbtn" data-k="' + i + '" aria-label="' + esc('Sheet ' + (i + 1)) + '">' + sheetSvg(s.id) + '</button>').join('') + '</div>' +
          '<p class="muted small">' + esc('Choose the sheet with that shape on it.') + '</p>';
      } else {
        h += '<div class="fv-trace"><canvas class="fv-pad" width="320" height="320" tabindex="0" aria-label="' + esc('The candy sheet: trace the outline with your finger, pen or mouse') + '"></canvas></div>' +
          '<div class="sg-acts"><button type="button" class="pbtn primary" data-k="press">' + esc('Press it out') + '</button><button type="button" class="pbtn small" data-k="clear">' + esc('Start the trace again') + '</button><button type="button" class="pbtn small" data-k="assist">' + esc('Steady hand') + '</button></div>';
      }
      h += '<div class="sg-acts">' + (timed ? '' : '<button type="button" class="pbtn small" data-k="finish">Finish</button>') + '<span class="muted small">' + esc(timed ? 'Pressed out: ' + G.score : 'Sheet ' + Math.min(G.done + 1, G.practiceOf) + ' of ' + G.practiceOf) + '</span></div>';
      G.el.innerHTML = h;
      if (G.phase === 'trace') pad();
    }
    function pad() {
      const cv = G.el.querySelector('.fv-pad');
      if (!cv) return;
      const c = cv.getContext('2d');
      const paint = () => {
        const W = cv.width;
        c.clearRect(0, 0, W, W);
        c.fillStyle = '#f2e6c4'; c.fillRect(0, 0, W, W);
        c.strokeStyle = '#d8c79c'; c.lineWidth = 2; c.strokeRect(6, 6, W - 12, W - 12);
        c.setLineDash([5, 5]); c.strokeStyle = '#a8895a'; c.lineWidth = 3; c.beginPath();
        outline(G.target.id).forEach(([x, y], i) => (i ? c.lineTo(x * W, y * W) : c.moveTo(x * W, y * W))); c.stroke(); c.setLineDash([]);
        c.strokeStyle = '#6a3a2a'; c.lineWidth = 4; c.lineCap = 'round'; c.lineJoin = 'round';
        let prev = null;
        for (const p of G.trace) { if (p === null) { prev = null; continue; } if (prev) { c.beginPath(); c.moveTo(prev[0] * W, prev[1] * W); c.lineTo(p[0] * W, p[1] * W); c.stroke(); } prev = p; }
      };
      const at = (e) => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]; };
      cv.addEventListener('pointerdown', (e) => { if (!G) return; G.drawing = true; cv.setPointerCapture(e.pointerId); G.trace.push(null, at(e)); paint(); });
      cv.addEventListener('pointermove', (e) => { if (!G || !G.drawing) return; G.trace.push(at(e)); paint(); });
      const up = () => { if (G) G.drawing = false; };
      cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
      G.paint = paint;
      paint();
    }
    function onClick(e) {
      if (!G) return;
      const b = e.target.closest('[data-k]');
      if (!b) return;
      const k = b.dataset.k;
      if (k === 'finish') return end();
      if (G.phase === 'choose' && /^\d$/.test(k)) {
        const s = G.sheets[+k];
        if (s === G.target) { G.phase = 'trace'; G.api.say(J(G.target.name.jp) + ' <span class="en">' + esc('That\'s the ' + G.target.name.en + '. Now trace it out.') + '</span>'); draw(); }
        else { G.streak = 0; G.api.say('<span class="en">' + esc('That sheet is ') + '</span>' + J(s.name.jp) + '<span class="en">' + esc(': the ' + s.name.en + '.') + '</span>'); }
        return;
      }
      if (k === 'clear') { G.trace = []; G.assisted = false; if (G.paint) G.paint(); return; }
      if (k === 'assist') { G.trace = [null].concat(sample(outline(G.target.id), 0.015)); G.assisted = true; if (G.paint) G.paint(); G.api.say('<span class="en">' + esc('A steady hand guides the needle round. (Not counted in a timed round.)') + '</span>'); return; }
      if (k === 'press') {
        const res = judge(outline(G.target.id), G.trace.filter(Boolean));
        G.done++;
        if (res.ok) {
          if (!(G.assisted && G.api.mode === 'timed')) { G.score++; G.streak++; G.best = Math.max(G.best, G.streak); }
          G.api.say('<span class="en">' + esc('It comes away clean: a whole ' + G.target.name.en + '!') + '</span>');
        } else { G.streak = 0; G.api.say('<span class="en">' + esc(res.why) + '</span>'); }
        if (G.api.mode !== 'timed' && G.done >= G.practiceOf) return end();
        next();
      }
    }
    function end() { if (!G) return null; const r = { score: G.score, streak: G.best }; const api = G.api; stop(); api.done(r); return r; }
    function stop() { if (!G) return null; const r = { score: G.score, streak: G.best }; G.el.removeEventListener('click', onClick); G = null; return r; }
    return { start, stop, judge, outline, state: () => (G ? { phase: G.phase, target: G.target && G.target.id, sheets: G.sheets.map((s) => s.id), score: G.score, assisted: G.assisted } : null) };
  })();

  // ===================================================================== 輪投げ
  // the prizes drawn small (interim art under AC-1: shapes, never letters)
  const PRIZE_SVG = {
    daruma: '<ellipse cx="50" cy="56" rx="30" ry="34" fill="#c8402e"/><ellipse cx="50" cy="48" rx="16" ry="14" fill="#f4e6d0"/><circle cx="44" cy="46" r="3" fill="#2a2024"/><circle cx="56" cy="46" r="3" fill="#2a2024"/>',
    furin: '<path d="M30 60 Q30 30 50 28 Q70 30 70 60 Z" fill="#9ccfe0" stroke="#4a7a8a" stroke-width="2"/><line x1="50" y1="60" x2="50" y2="82" stroke="#4a7a8a" stroke-width="2"/><rect x="42" y="82" width="16" height="12" fill="#f2c14e"/>',
    kendama: '<circle cx="50" cy="28" r="14" fill="#c8402e"/><rect x="46" y="44" width="8" height="40" fill="#b48c66"/><rect x="34" y="52" width="32" height="8" rx="3" fill="#966e4e"/><path d="M50 42 Q60 36 50 30" stroke="#ccc" fill="none"/>',
    uchiwa: '<circle cx="50" cy="40" r="26" fill="#f2f0e4" stroke="#4a6aa8" stroke-width="3"/><path d="M36 40 Q50 22 64 40" stroke="#4a6aa8" fill="none" stroke-width="2"/><rect x="47" y="64" width="6" height="26" fill="#b48c66"/>',
    omen: '<path d="M26 34 L36 14 L44 30 L56 30 L64 14 L74 34 Q76 70 50 82 Q24 70 26 34 Z" fill="#f4f0e6" stroke="#2a2024" stroke-width="2"/><path d="M38 46 l8 -3 M62 46 l-8 -3" stroke="#c8402e" stroke-width="3"/><circle cx="50" cy="62" r="3" fill="#2a2024"/>',
    kingyo: '<path d="M30 30 Q50 18 70 30 L74 80 Q50 92 26 80 Z" fill="#cfe8f2" stroke="#7aa8c0" stroke-width="2"/><ellipse cx="48" cy="58" rx="12" ry="7" fill="#e2574c"/><path d="M60 58 l10 -6 v12 z" fill="#e2574c"/>',
    tako: '<path d="M50 14 L78 44 L50 74 L22 44 Z" fill="#f2c14e" stroke="#8a3a3a" stroke-width="2"/><path d="M50 74 q-6 8 0 14 q6 6 0 12" stroke="#8a3a3a" fill="none" stroke-width="2"/>',
  };
  RB.ui.festivalGames.wanage = (function () {
    let G = null;
    function start(el, api) {
      G = { el, api, r: rng(seedOf(api, 'wanage')), score: 0, streak: 0, best: 0, throws: 0, practiceOf: 6, row: [], target: null, busy: false };
      el.addEventListener('click', onClick);
      next();
    }
    function next() {
      const all = FC().wanage.prizes;
      G.row = shuffle(G.r, all).slice(0, 5);
      G.target = pick(G.r, G.row);
      G.busy = false;
      draw();
      speak();
    }
    const desc = () => (high(G.api.s) ? G.target.full : G.target.easy);
    // spoken too when a Japanese voice is available and turned up (src/audio/50_voice.js); the text is always shown
    function speak() { if (RB.voice && RB.voice.speak) { try { RB.voice.speak(RB.jp.reading(desc().jp).replace(/\s/g, '')); } catch (e) { /* the voice is optional */ } } }
    function draw() {
      if (!G) return;
      const timed = G.api.mode === 'timed';
      G.el.innerHTML = '<p class="fv-ask">' + J(desc().jp) + '</p>' +
        '<div class="fv-pegs" role="group" aria-label="The prizes on their pegs">' + G.row.map((p, i) => '<button type="button" class="fv-peg" data-w="' + i + '" aria-label="' + esc('Prize ' + (i + 1)) + '"><svg viewBox="0 0 100 100" aria-hidden="true">' + PRIZE_SVG[p.id] + '</svg><span class="fv-ring" aria-hidden="true"></span></button>').join('') + '</div>' +
        '<div class="sg-acts"><button type="button" class="pbtn small" data-w="listen">' + esc('Hear it again') + '</button><button type="button" class="pbtn small" data-w="en">' + esc('What does it say?') + '</button>' + (timed ? '' : '<button type="button" class="pbtn small" data-w="finish">Finish</button>') +
        '<span class="muted small">' + esc(timed ? 'Rings on: ' + G.score : 'Ring ' + Math.min(G.throws + 1, G.practiceOf) + ' of ' + G.practiceOf) + '</span></div>';
    }
    function onClick(e) {
      if (!G) return;
      const b = e.target.closest('[data-w]');
      if (!b || G.busy) return;
      const w = b.dataset.w;
      if (w === 'finish') return end();
      if (w === 'listen') return speak();
      if (w === 'en') { G.api.pause(); G.api.say('<span class="en">' + esc(desc().en) + '</span>'); setTimeout(() => { if (G) G.api.resume(); }, 2500); return; }
      const p = G.row[+w];
      if (!p) return;
      G.throws++; G.busy = true;
      b.classList.add(reduced() ? 'hit-still' : 'hit');
      const hit = p === G.target;
      setTimeout(() => {
        if (!G) return;
        if (hit) { G.score++; G.streak++; G.best = Math.max(G.best, G.streak); G.api.say(J(p.name.jp) + ' <span class="en">' + esc('Ringed: ' + p.name.en + '!') + '</span>'); }
        else { G.streak = 0; G.api.say('<span class="en">' + esc('Your ring lands on ') + '</span>' + J(p.name.jp) + '<span class="en">' + esc(' (' + p.name.en + '). The description was ') + '</span>' + J(G.target.name.jp) + '<span class="en">' + esc(' (' + G.target.name.en + ').') + '</span>'); }
        if (G.api.mode !== 'timed' && G.throws >= G.practiceOf) return end();
        next();
      }, reduced() ? 150 : 650);
    }
    function end() { if (!G) return null; const r = { score: G.score, streak: G.best }; const api = G.api; stop(); api.done(r); return r; }
    function stop() { if (!G) return null; const r = { score: G.score, streak: G.best }; G.el.removeEventListener('click', onClick); if (RB.voice && RB.voice.cancel) RB.voice.cancel(); G = null; return r; }
    return { start, stop, state: () => (G ? { target: G.target.id, row: G.row.map((p) => p.id), score: G.score, throws: G.throws } : null) };
  })();

  // ===================================================================== 言葉くじ
  RB.ui.festivalGames.kuji = (function () {
    let G = null;
    function start(el, api) {
      G = { el, api, r: rng(seedOf(api, 'kuji')), score: 0, streak: 0, best: 0, drawn: 0, practiceOf: 4, word: null, busy: false, last: [] };
      el.addEventListener('click', onClick);
      draw();
    }
    function draw() {
      if (!G) return;
      const timed = G.api.mode === 'timed';
      G.el.innerHTML = '<div class="fv-kuji"><div class="fv-box" aria-hidden="true"></div>' +
        (G.word ? '<p class="fv-slip">' + J(G.word.word.jp) + ' <span class="en">' + esc(G.word.word.en) + '</span></p>' : '<p class="muted">' + esc('A box of folded slips, a word on each.') + '</p>') + '</div>' +
        '<div class="sg-acts"><button type="button" class="pbtn primary" data-q="draw"' + (G.busy ? ' disabled' : '') + '>' + esc('Draw a word') + '</button>' + (timed ? '' : '<button type="button" class="pbtn small" data-q="finish">Finish</button>') +
        '<span class="muted small">' + esc(timed ? 'Sentences: ' + G.score : 'Slip ' + Math.min(G.drawn + 1, G.practiceOf) + ' of ' + G.practiceOf) + '</span></div>';
    }
    async function drawOne() {
      const words = FC().kuji.words.filter((w) => G.last.indexOf(w.id) < 0);
      G.word = pick(G.r, words.length ? words : FC().kuji.words);
      G.last = G.last.concat(G.word.id).slice(-3);
      G.busy = true; draw();
      const ch = RB.content.challenges[G.word.challenge];
      const prof = (G.api.s.learn && G.api.s.learn.profile) || 'E';
      const step = ((ch.tiers[prof] || ch.tiers.E)[0]);
      const g = G;
      const res = await RB.challenge.runStep(step, { ctxTag: 'kuji', cancelLabel: 'Put the slip back' });
      if (!G || G !== g) return;
      G.busy = false; G.drawn++;
      if (res && res.cancelled) { G.api.say('<span class="en">' + esc('You fold the slip and put it back.') + '</span>'); draw(); return; }
      const o = RB.forge && RB.forge.outcome(step, res);
      if (res && res.ok) {
        G.score++;
        if (res.firstTry) { G.streak++; G.best = Math.max(G.best, G.streak); } else G.streak = 0;
        G.api.say('<span class="en">' + esc('The stall-keeper claps: "' + (o && o.en ? o.en : 'A fine sentence!') + '"') + '</span>');
      } else { G.streak = 0; G.api.say('<span class="en">' + esc('The stall-keeper laughs and lets you draw again.') + '</span>'); }
      if (G.api.mode !== 'timed' && G.drawn >= G.practiceOf) return end();
      draw();
    }
    function onClick(e) {
      if (!G) return;
      const b = e.target.closest('[data-q]');
      if (!b || b.disabled) return;
      if (b.dataset.q === 'finish') return end();
      if (b.dataset.q === 'draw' && !G.busy) drawOne();
    }
    function end() { if (!G) return null; const r = { score: G.score, streak: G.best }; const api = G.api; stop(); api.done(r); return r; }
    function stop() { if (!G) return null; const r = { score: G.score, streak: G.best }; G.el.removeEventListener('click', onClick); G = null; return r; }
    return { start, stop, state: () => (G ? { word: G.word && G.word.id, score: G.score, drawn: G.drawn, busy: G.busy } : null) };
  })();

  // ===================================================================== 太鼓
  RB.ui.festivalGames.taiko = (function () {
    let G = null;
    const BEAT = 600; // ms a beat in a timed round
    const word = (k) => FC().taiko.words[k].jp;
    function start(el, api) {
      G = { el, api, r: rng(seedOf(api, 'taiko')), score: 0, streak: 0, best: 0, rounds: 0, practiceOf: 6, pat: null, pos: 0, phase: 'call', timer: null, beatAt: 0, hit: [] };
      el.addEventListener('click', onClick);
      G.onKey = (e) => {
        if (!G || e.repeat) return;
        const k = e.key.toLowerCase();
        if (k === 'f' || k === 'j') { e.preventDefault(); strike('don'); } else if (k === 'd' || k === 'k') { e.preventDefault(); strike('ka'); }
      };
      document.addEventListener('keydown', G.onKey);
      next();
    }
    function next() {
      const P = FC().taiko.patterns;
      // the first rounds short, then longer
      const pool = P.filter((p) => p.length <= (G.rounds < 3 ? 4 : G.rounds < 6 ? 6 : 8));
      G.pat = pick(G.r, pool); G.pos = 0; G.hit = []; G.rounds++;
      if (G.api.mode === 'timed') { G.phase = 'play'; draw(); countIn(); }
      else { G.phase = 'call'; draw(); call(); }
    }
    function sound(k) { if (RB.audio && RB.audio.sfx) RB.audio.sfx(k === 'don' ? 'taiko_don' : 'taiko_ka'); }
    // practice: the stall-keeper plays the pattern (heard and shown), then you answer at your own pace
    function call() {
      let i = 0;
      clearInterval(G.timer);
      G.timer = setInterval(() => {
        if (!G) return;
        if (i < G.pat.length) { sound(G.pat[i]); G.callAt = i; draw(); i++; return; }
        clearInterval(G.timer); G.phase = 'answer'; G.callAt = -1; draw();
      }, 520);
    }
    // timed: a count-in of two beats, then each beat has its moment (a hit within a third of a beat of it counts)
    function countIn() {
      clearInterval(G.timer);
      G.beatAt = performance.now() + BEAT * 2;
      G.timer = setInterval(tick, 40);
    }
    function tick() {
      if (!G) return;
      const t = performance.now() - G.beatAt;
      const idx = Math.floor((t + BEAT / 3) / BEAT);
      // a beat whose window has passed without a hit is a miss
      while (G.hit.length < G.pat.length && G.hit.length < idx && t > (G.hit.length + 1 / 3) * BEAT) { G.hit.push(false); G.streak = 0; }
      if (G.hit.length >= G.pat.length) { clearInterval(G.timer); setTimeout(() => { if (G) next(); }, BEAT); }
      draw();
    }
    function strike(k) {
      if (!G) return;
      sound(k);
      if (G.api.mode === 'timed') {
        if (G.phase !== 'play') return;
        const t = performance.now() - G.beatAt, i = G.hit.length;
        if (i >= G.pat.length) return;
        if (Math.abs(t - i * BEAT) <= BEAT / 3) {
          const good = G.pat[i] === k;
          G.hit.push(good);
          if (good) { G.score++; G.streak++; G.best = Math.max(G.best, G.streak); } else G.streak = 0;
        }
        draw();
        return;
      }
      if (G.phase !== 'answer') return;
      if (G.pat[G.pos] === k) {
        G.hit.push(true); G.pos++;
        if (G.pos >= G.pat.length) {
          G.score++; G.streak++; G.best = Math.max(G.best, G.streak);
          G.api.say('<span class="en">' + esc('Every beat right. The stall-keeper grins.') + '</span>');
          if (G.rounds >= G.practiceOf) return end();
          setTimeout(() => { if (G) next(); }, 500);
        }
      } else {
        const want = G.pat[G.pos];
        G.streak = 0; G.pos = 0; G.hit = [];
        G.api.say('<span class="en">' + esc('That beat was ' + word(k) + '; the card says ') + '</span>' + J(word(want)) + '<span class="en">' + esc('. From the top.') + '</span>');
      }
      draw();
    }
    function draw() {
      if (!G) return;
      const timed = G.api.mode === 'timed';
      const now = timed && G.phase === 'play' ? Math.floor((performance.now() - G.beatAt + BEAT / 2) / BEAT) : -1;
      const card = G.pat.map((k, i) => {
        const st = G.hit[i] === true ? ' good' : G.hit[i] === false ? ' miss' : '';
        const cur = (timed ? i === now : (G.phase === 'call' ? i === G.callAt : i === G.pos)) ? ' cur' : '';
        return '<span class="fv-beat ' + k + st + cur + '">' + esc(word(k)) + '</span>';
      }).join('');
      G.el.innerHTML = '<p class="fv-ask">' + esc(timed ? (now < 0 ? 'Ready…' : 'Play it in time.') : G.phase === 'call' ? 'Listen: the stall-keeper drums the card.' : 'Your turn: drum the card.') + '</p>' +
        '<div class="fv-card' + (reduced() ? ' still' : '') + '" aria-label="' + esc('The drum card: ' + G.pat.map(word).join(' ')) + '">' + card + '</div>' +
        '<div class="fv-drum" role="group" aria-label="The drum"><button type="button" class="fv-don" data-t="don">' + esc('ドン') + '<span class="muted small">F / J</span></button><button type="button" class="fv-ka" data-t="ka">' + esc('カッ') + '<span class="muted small">D / K</span></button></div>' +
        '<div class="sg-acts">' + (timed ? '' : '<button type="button" class="pbtn small" data-t="again">Hear it again</button><button type="button" class="pbtn small" data-t="finish">Finish</button>') + '<span class="muted small">' + esc(timed ? 'Beats in time: ' + G.score : 'Card ' + Math.min(G.rounds, G.practiceOf) + ' of ' + G.practiceOf) + '</span></div>';
    }
    function onClick(e) {
      if (!G) return;
      const b = e.target.closest('[data-t]');
      if (!b) return;
      const t = b.dataset.t;
      if (t === 'finish') return end();
      if (t === 'again') { if (G.phase === 'answer') { G.phase = 'call'; G.pos = 0; G.hit = []; call(); } return; }
      strike(t);
    }
    function end() { if (!G) return null; const r = { score: G.score, streak: G.best }; const api = G.api; stop(); api.done(r); return r; }
    function stop() { if (!G) return null; clearInterval(G.timer); const r = { score: G.score, streak: G.best }; G.el.removeEventListener('click', onClick); document.removeEventListener('keydown', G.onKey); G = null; return r; }
    return { start, stop, strike, state: () => (G ? { phase: G.phase, pat: G.pat.slice(), pos: G.pos, hit: G.hit.slice(), score: G.score } : null) };
  })();
})();
