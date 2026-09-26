/* Handwriting pad + composition strip (spec §9).
 * - Captures ordered strokes with timestamps from mouse, touch or stylus,
 *   accounting for canvas scaling and devicePixelRatio. Drawing never
 *   scrolls the page or moves the character.
 * - The recognizer never sees the expected answer. The pad shows what it
 *   read ("I read this as…"), alternatives and uncertainty; only an
 *   explicit Confirm puts a character into the answer strip.
 * - Choosing a non-top candidate or picking from the chart counts as an
 *   assisted character. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.pad = (function () {
  'use strict';
  const esc = RB.util.esc;
  const BOX = 300; // recognizer coordinate space

  function create(host, opts) {
    opts = opts || {};
    const el = RB.ui.el('div', 'pad-area');
    el.innerHTML =
      '<div class="strip" aria-label="Your answer"></div>' +
      '<div class="row small"><span class="readas" aria-live="polite"></span><span class="grow"></span>' +
      '<div class="modes seg"><button class="btn small" data-script="any" title="Hiragana or katakana">あ/ア</button><button class="btn small" data-script="hira">ひらがな</button><button class="btn small" data-script="kata">カタカナ</button></div></div>' +
      '<div class="pad-box"><canvas class="pad-bg"></canvas><canvas class="pad-ink" aria-label="Writing pad: draw one character"></canvas></div>' +
      '<div class="cands"></div>' +
      '<div class="row">' +
      '<button class="btn small" data-a="undo" title="Undo last stroke">↶ Stroke</button>' +
      '<button class="btn small" data-a="clear">Clear</button>' +
      '<button class="btn small" data-a="small" aria-pressed="false" title="Mark as small kana (ゃ, っ…)">小 small</button>' +
      '<button class="btn small" data-a="chart" title="Pick the character from a chart (counts as assisted)">Chart…</button>' +
      '<span class="grow"></span>' +
      '<button class="btn primary" data-a="confirm" disabled>Confirm ✓</button></div>' +
      '<div class="row"><button class="btn small" data-a="del" title="Remove the selected character">⌫ Remove</button>' +
      '<span class="small dim grow">Tap a character in the strip to replace it, or a gap to insert.</span>' +
      '<button class="btn small" data-a="model" title="Show how to write it (counts as assisted)">Show me ✎</button></div>';
    host.appendChild(el);
    const bg = el.querySelector('.pad-bg'), ink = el.querySelector('.pad-ink');
    const box = el.querySelector('.pad-box');
    const strip = el.querySelector('.strip');
    const candsEl = el.querySelector('.cands');
    const readas = el.querySelector('.readas');
    const P = {
      strokes: [],      // [[{x,y,t}]] in 0..1 box units
      cur: null,        // stroke in progress
      pointerId: null,
      chars: [],        // [{ch, assisted, uncertain, strokes}]
      cursor: 0,        // insertion index
      replace: -1,      // index being replaced
      result: null,     // last recognizer result
      pick: null,       // candidate chosen by the player
      small: false,
      script: opts.script || 'any',
      maxLen: opts.maxLen || 12,
      guide: opts.guide || null, // character to show faintly (copy mode)
      onChange: opts.onChange || (() => {}),
      onAssist: opts.onAssist || (() => {}),
      destroyed: false,
    };
    let dpr = 1, cssW = 0;

    function layout() {
      const r = box.getBoundingClientRect();
      if (!r.width) return;
      dpr = window.devicePixelRatio || 1;
      cssW = r.width;
      for (const c of [bg, ink]) {
        c.width = Math.round(r.width * dpr);
        c.height = Math.round(r.height * dpr);
      }
      drawBg();
      redraw();
    }
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => layout()) : null;
    if (ro) ro.observe(box);
    window.addEventListener('resize', layout);

    function drawBg() {
      const c = bg.getContext('2d');
      const w = bg.width, h = bg.height;
      c.clearRect(0, 0, w, h);
      c.fillStyle = '#fbf7ea';
      c.fillRect(0, 0, w, h);
      c.strokeStyle = 'rgba(160,120,80,0.35)';
      c.lineWidth = Math.max(1, dpr);
      c.setLineDash([6 * dpr, 6 * dpr]);
      c.beginPath();
      c.moveTo(w / 2, 0); c.lineTo(w / 2, h);
      c.moveTo(0, h / 2); c.lineTo(w, h / 2);
      c.stroke();
      c.setLineDash([]);
      c.strokeStyle = 'rgba(160,120,80,0.5)';
      c.strokeRect(dpr, dpr, w - 2 * dpr, h - 2 * dpr);
      // small-kana zone hint (lower-left quarter)
      if (P.small) {
        c.fillStyle = 'rgba(106,138,216,0.08)';
        c.fillRect(0, h / 2, w / 2, h / 2);
      }
      if (P.guide && RB.recog && RB.recog.reference(P.guide)) drawRef(c, RB.recog.reference(P.guide), w, 'rgba(90,70,60,0.18)', false);
    }
    function drawRef(c, ref, w, col, numbers) {
      const s = w / ref.box;
      c.lineCap = 'round'; c.lineJoin = 'round';
      c.strokeStyle = col;
      c.lineWidth = Math.max(3, w / 28);
      ref.strokes.forEach((st, i) => {
        c.beginPath();
        st.forEach((p, j) => (j ? c.lineTo(p.x * s, p.y * s) : c.moveTo(p.x * s, p.y * s)));
        c.stroke();
        if (numbers) {
          c.fillStyle = '#c0392b';
          c.font = Math.round(w / 16) + 'px sans-serif';
          c.fillText(String(i + 1), st[0].x * s + 4, st[0].y * s - 4);
        }
      });
    }
    function redraw() {
      const c = ink.getContext('2d');
      c.clearRect(0, 0, ink.width, ink.height);
      c.lineCap = 'round';
      c.lineJoin = 'round';
      c.strokeStyle = '#1e1a22';
      c.lineWidth = Math.max(3, (ink.width / 38));
      const all = P.cur ? P.strokes.concat([P.cur]) : P.strokes;
      for (const st of all) {
        c.beginPath();
        st.forEach((p, i) => (i ? c.lineTo(p.x * ink.width, p.y * ink.height) : c.moveTo(p.x * ink.width, p.y * ink.height)));
        if (st.length === 1) c.lineTo(st[0].x * ink.width + 0.5, st[0].y * ink.height + 0.5);
        c.stroke();
      }
    }
    function pos(e) {
      const r = ink.getBoundingClientRect();
      return { x: Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), y: Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)), t: Math.round(e.timeStamp || performance.now()) };
    }
    ink.addEventListener('pointerdown', (e) => {
      if (P.pointerId != null) return; // one stroke at a time
      e.preventDefault();
      e.stopPropagation();
      ink.setPointerCapture(e.pointerId);
      P.pointerId = e.pointerId;
      P.cur = [pos(e)];
      RB.audio && RB.audio.sfx('pen_down', { vol: 0.4 });
      redraw();
    });
    ink.addEventListener('pointermove', (e) => {
      if (e.pointerId !== P.pointerId || !P.cur) return;
      e.preventDefault();
      const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
      for (const ev of evs.length ? evs : [e]) {
        const p = pos(ev);
        const last = P.cur[P.cur.length - 1];
        if (Math.abs(p.x - last.x) + Math.abs(p.y - last.y) > 0.004) P.cur.push(p);
      }
      redraw();
    });
    const end = (e, cancelled) => {
      if (e.pointerId !== P.pointerId) return;
      P.pointerId = null;
      if (!P.cur) return;
      if (!cancelled) P.strokes.push(P.cur);
      P.cur = null;
      redraw();
      if (!cancelled) {
        RB.audio && RB.audio.sfx('pen_up', { vol: 0.3 });
        schedule();
      }
    };
    ink.addEventListener('pointerup', (e) => end(e, false));
    ink.addEventListener('pointercancel', (e) => end(e, true));
    ink.addEventListener('lostpointercapture', (e) => { if (P.pointerId === e.pointerId) end(e, false); });
    // Block page scroll/zoom gestures over the pad.
    for (const t of ['touchstart', 'touchmove']) ink.addEventListener(t, (e) => e.preventDefault(), { passive: false });
    ink.addEventListener('contextmenu', (e) => e.preventDefault());

    let recTimer = null;
    function schedule() {
      clearTimeout(recTimer);
      recTimer = setTimeout(recognize, 180);
    }
    function recognize() {
      P.pick = null;
      if (!P.strokes.length) { P.result = null; renderRead(); return; }
      const strokes = P.strokes.map((s) => s.map((p) => ({ x: p.x * BOX, y: p.y * BOX, t: p.t })));
      try {
        P.result = RB.recog.recognize(strokes, { box: { w: BOX, h: BOX }, script: P.script, smallToggle: P.small });
      } catch (err) {
        P.result = { status: 'nonsense', candidates: [], notes: ['error'] };
        console.error(err);
      }
      renderRead();
    }
    function renderRead() {
      const r = P.result;
      const conf = el.querySelector('[data-a=confirm]');
      candsEl.innerHTML = '';
      if (!r || r.status === 'empty') {
        readas.innerHTML = P.strokes.length ? '' : '<span class="dim">Draw one character in the box.</span>';
        conf.disabled = true;
        return;
      }
      if (r.status === 'nonsense' || !r.candidates.length) {
        readas.innerHTML = '<span>I can\'t read that as a character yet. Try again, or pick it from the chart.</span>';
        conf.disabled = true;
        RB.audio && RB.audio.sfx('recog_unsure', { vol: 0.5 });
        return;
      }
      const top = P.pick || r.candidates[0].ch;
      const uncertain = r.status === 'uncertain' && !P.pick;
      readas.innerHTML = (uncertain ? 'I\'m not sure — it might be' : 'I read this as') + '<span class="big">' + esc(top) + '</span>' + (uncertain ? '<span class="dim">(pick the one you meant)</span>' : '') +
        (r.sizeHint === 'small' && !P.small ? ' <span class="dim small">— it looks small; press 小 if you meant a small kana</span>' : '');
      r.candidates.slice(0, 6).forEach((cd, i) => {
        const b = RB.ui.el('button', 'btn' + (cd.ch === top ? ' top' : ''), esc(cd.ch));
        b.title = 'Similarity ' + Math.round(cd.score * 100) + '% (a match score, not a probability)';
        b.onclick = () => { P.pick = cd.ch; renderRead(); };
        candsEl.appendChild(b);
        void i;
      });
      conf.disabled = false;
      RB.audio && RB.audio.sfx(uncertain ? 'recog_unsure' : 'recog_ok', { vol: 0.4 });
    }

    function confirm() {
      const r = P.result;
      if (!r || !r.candidates.length) return;
      const top = r.candidates[0].ch;
      const ch = P.pick || top;
      const assisted = !!(P.pick && P.pick !== top);
      const entry = { ch, assisted, uncertain: r.status === 'uncertain', strokes: P.strokes.slice() };
      if (RB.game.settings.strokePractice && RB.recog.strokeOrderFeedback && !assisted) {
        const strokes = P.strokes.map((s) => s.map((p) => ({ x: p.x * BOX, y: p.y * BOX, t: p.t })));
        try { entry.order = RB.recog.strokeOrderFeedback(strokes, ch, { box: { w: BOX, h: BOX } }); } catch (e) { entry.order = null; }
      }
      put(entry);
      if (assisted) P.onAssist('correction');
      clearInk();
      RB.audio && RB.audio.sfx('confirm', { vol: 0.5 });
    }
    function put(entry) {
      if (P.replace >= 0) { P.chars[P.replace] = entry; P.cursor = P.replace + 1; P.replace = -1; }
      else {
        if (P.chars.length >= P.maxLen) return;
        P.chars.splice(P.cursor, 0, entry);
        P.cursor++;
      }
      renderStrip();
      P.onChange();
    }
    function clearInk() {
      P.strokes = [];
      P.cur = null;
      P.result = null;
      P.pick = null;
      redraw();
      renderRead();
    }
    function renderStrip() {
      strip.innerHTML = '';
      const gap = (i) => {
        const g = RB.ui.el('button', 'cell ins' + (P.cursor === i && P.replace < 0 ? ' cur' : ''), '');
        g.setAttribute('aria-label', 'Insert here');
        g.onclick = () => { P.cursor = i; P.replace = -1; renderStrip(); };
        return g;
      };
      if (opts.before) strip.appendChild(RB.ui.el('span', 'jp dim', esc(opts.before)));
      for (let i = 0; i <= P.chars.length; i++) {
        if (P.maxLen > 1) strip.appendChild(gap(i));
        if (i < P.chars.length) {
          const c = P.chars[i];
          const b = RB.ui.el('button', 'cell' + (P.replace === i ? ' cur' : '') + (c.assisted ? ' asst' : ''), esc(c.ch));
          b.title = c.assisted ? 'Chosen by hand (assisted)' : 'Tap to replace';
          b.onclick = () => { P.replace = P.replace === i ? -1 : i; renderStrip(); };
          strip.appendChild(b);
        }
      }
      if (P.maxLen === 1 && !P.chars.length) strip.appendChild(RB.ui.el('span', 'cell cur', '＿'));
      if (opts.after) strip.appendChild(RB.ui.el('span', 'jp dim', esc(opts.after)));
      const orderNotes = P.chars.map((c) => c.order).filter((o) => o && o.confident && o.issues && o.issues.length);
      if (orderNotes.length) strip.appendChild(RB.ui.el('span', 'small dim', ' ✎ ' + esc(orderNotes[orderNotes.length - 1].issues.map((i) => i.en).join(' '))));
    }
    function chart() {
      const script = P.script === 'kata' ? 'kata' : 'hira';
      const H = 'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんがぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽぁぃぅぇぉっゃゅょゎ';
      const set = Array.from(script === 'kata' ? RB.kana.toKata(H) + 'ー' : H);
      const scrim = RB.ui.el('div', 'scrim');
      const pn = RB.ui.el('div', 'panel');
      pn.style.width = 'min(560px, calc(100vw - 16px))';
      pn.innerHTML = '<header><h2>Pick a character</h2><button class="btn small" data-x>Cancel</button></header><div class="body"><p class="small dim">Characters picked here count as assisted — handy when the recognizer can\'t read your writing.</p><div class="tiles">' + set.map((c) => '<button class="btn" data-c="' + c + '">' + c + '</button>').join('') + '</div></div>';
      scrim.appendChild(pn);
      const lay = { el: scrim, name: 'chart' };
      lay.onCancel = () => RB.ui.popLayer(lay);
      pn.onclick = (e) => {
        if (e.target.closest('[data-x]')) { RB.ui.popLayer(lay); return; }
        const b = e.target.closest('[data-c]');
        if (!b) return;
        RB.ui.popLayer(lay);
        put({ ch: b.getAttribute('data-c'), assisted: true, manual: true });
        P.onAssist('chart');
        clearInk();
      };
      RB.ui.pushLayer(lay);
    }
    function showModel(ch) {
      if (!ch || !RB.recog.reference(ch)) { RB.ui.notice('No stroke reference is available for that character.', 'info'); return; }
      const ref = RB.recog.reference(ch);
      const c = bg.getContext('2d');
      drawBg();
      drawRef(c, ref, bg.width, 'rgba(192,57,43,0.35)', true);
      P.onAssist('model');
    }

    el.onclick = (e) => {
      const b = e.target.closest('[data-a],[data-script]');
      if (!b) return;
      if (b.hasAttribute('data-script')) {
        P.script = b.getAttribute('data-script');
        el.querySelectorAll('[data-script]').forEach((x) => x.classList.toggle('on', x === b));
        if (P.strokes.length) recognize();
        return;
      }
      const a = b.getAttribute('data-a');
      if (a === 'undo') { P.strokes.pop(); redraw(); schedule(); }
      if (a === 'clear') clearInk();
      if (a === 'small') { P.small = !P.small; b.classList.toggle('on', P.small); b.setAttribute('aria-pressed', String(P.small)); drawBg(); if (P.strokes.length) recognize(); }
      if (a === 'confirm') confirm();
      if (a === 'del') {
        const i = P.replace >= 0 ? P.replace : P.cursor - 1;
        if (i >= 0 && i < P.chars.length) { P.chars.splice(i, 1); P.cursor = i; P.replace = -1; renderStrip(); P.onChange(); }
      }
      if (a === 'chart') chart();
      if (a === 'model') opts.modelFor && showModel(opts.modelFor());
    };
    el.querySelectorAll('[data-script]').forEach((x) => x.classList.toggle('on', x.getAttribute('data-script') === P.script));
    renderStrip();
    renderRead();
    requestAnimationFrame(layout);

    return {
      el,
      text() { return P.chars.map((c) => c.ch).join(''); },
      meta() {
        return {
          assisted: P.chars.some((c) => c.assisted),
          uncertain: P.chars.some((c) => c.uncertain),
          count: P.chars.length,
        };
      },
      hasPending() { return P.strokes.length > 0; },
      confirmPending() { if (P.result && P.result.candidates && P.result.candidates.length) confirm(); },
      reset() { P.chars = []; P.cursor = 0; P.replace = -1; clearInk(); renderStrip(); },
      setGuide(ch) { P.guide = ch; drawBg(); },
      destroy() { P.destroyed = true; if (ro) ro.disconnect(); window.removeEventListener('resize', layout); el.remove(); },
      _state: P,
      _inject(strokes) { P.strokes = strokes; redraw(); recognize(); }, // tests: inject strokes in 0..1 units
    };
  }
  const api = { create(host, opts) { const p = create(host, opts); api.__last = p; return p; }, BOX };
  return api;
})();
