/* The writing desk on screen (Practice addendum §16; records and pages in
 * src/engine/78_desk.js).
 *
 * The four modes are tabs at the top and can be chosen directly; the word is
 * chosen after the mode, so "Write from a prompt" lists meanings only and
 * never shows the answer before it is asked for.
 *   Trace     one square per character with the numbered reference strokes
 *             underneath
 *   Copy      the model in its own square beside yours (numbered, with the
 *             stroke order on request)
 *   Prompt    the ordinary challenge runner (write, type or choose): meaning
 *             and a sentence with a gap first, the model through "How to write"
 *   Typeset   a readable layout of the word, labelled typeset
 * After each written character the desk says what the recognizer read —
 * without being told the character (all kana and kanji) — and gives a
 * stroke-order observation only when RB.recog.strokeOrderFeedback matched
 * the strokes with certainty. Nothing is graded for beauty.
 *
 * Pages: a preview, a label you choose, Keep this page (RB.practiceDesk.keepPage;
 * the replace/cancel sheet with previews is this file's chooser).
 * RB.ui.deskPage.draw(canvas, page) and typesetHtml(page) render a page anywhere
 * (Practice mementos, previews). "Your handwriting" only for saved strokes. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.ui.deskPage = (function () {
  'use strict';
  const esc = RB.util.esc;
  const PAPER = '#fbf6e6', GRID = 'rgba(150,120,70,0.28)', INK = '#1c160e';
  // A handwritten page: one square per character, the player's own strokes.
  function draw(cv, page, o) {
    o = o || {};
    if (!cv || !page) return cv;
    const D = RB.practiceDesk;
    const chars = page.strokes ? D.unpack(page.strokes) : null;
    const g = cv.getContext && cv.getContext('2d');
    if (!g) return cv;
    if (!chars || !chars.length) return drawType(cv, page, o);
    const cell = o.cell || 96, pad = Math.round(cell * 0.18);
    const n = chars.length;
    // drawn at the screen's pixel density, shown at its CSS size (never stretched)
    const k = Math.max(1, Math.min(3, (typeof devicePixelRatio !== 'undefined' && devicePixelRatio) || 1));
    const W = n * cell + pad * 2, H = cell + pad * 2;
    cv.width = Math.round(W * k); cv.height = Math.round(H * k);
    if (cv.style) cv.style.width = W + 'px';
    g.setTransform(k, 0, 0, k, 0, 0);
    g.fillStyle = PAPER; g.fillRect(0, 0, W, H);
    g.strokeStyle = 'rgba(120,90,50,0.45)'; g.lineWidth = 1; g.strokeRect(0.5, 0.5, W - 1, H - 1);
    chars.forEach((c, i) => {
      const x0 = pad + i * cell, y0 = pad;
      g.strokeStyle = GRID; g.lineWidth = 1; g.setLineDash([3, 4]);
      g.strokeRect(x0 + 0.5, y0 + 0.5, cell - 1, cell - 1);
      g.beginPath(); g.moveTo(x0 + cell / 2, y0); g.lineTo(x0 + cell / 2, y0 + cell); g.moveTo(x0, y0 + cell / 2); g.lineTo(x0 + cell, y0 + cell / 2); g.stroke();
      g.setLineDash([]);
      g.strokeStyle = INK; g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = Math.max(2, cell / 26);
      for (const st of c.strokes) {
        if (!st.length) continue;
        g.beginPath();
        st.forEach((p, j) => (j ? g.lineTo(x0 + p.x * cell, y0 + p.y * cell) : g.moveTo(x0 + p.x * cell, y0 + p.y * cell)));
        if (st.length === 1) g.lineTo(x0 + st[0].x * cell + 0.6, y0 + st[0].y * cell + 0.6);
        g.stroke();
      }
    });
    cv.setAttribute('role', 'img');
    cv.setAttribute('aria-label', 'Your handwriting: ' + (page.word || chars.map((c) => c.ch).join('')) + (page.reading && page.reading !== page.word ? ' (' + page.reading + ')' : ''));
    return cv;
  }
  // A typeset page on a canvas (thumbnails): the word in a Japanese text font with its reading above
  function drawType(cv, page, o) {
    const g = cv.getContext('2d');
    const spec = page.typeset || {};
    const text = String(spec.jp || page.word || '');
    const groups = [];
    text.replace(/\{([^|}]+)\|([^}]+)\}|([^{\s]+)/g, (m, k, r, plain) => { groups.push(k ? { t: k, r } : { t: plain, r: '' }); return m; });
    const size = (o && o.cell) || 64;
    const font = (px) => px + 'px "Hiragino Mincho ProN", "Yu Mincho", "Noto Serif CJK JP", "Noto Sans CJK JP", serif';
    g.font = font(size);
    const w = groups.reduce((a, x) => a + Math.max(g.measureText(x.t).width, x.r ? (g.font = font(size * 0.38), g.measureText(x.r).width) : 0, (g.font = font(size), 0)), 0);
    const k = Math.max(1, Math.min(3, (typeof devicePixelRatio !== 'undefined' && devicePixelRatio) || 1));
    const W = Math.max(size * 2, Math.ceil(w + size * 0.8)), H = Math.ceil(size * 1.9);
    cv.width = Math.round(W * k); cv.height = Math.round(H * k);
    if (cv.style) cv.style.width = W + 'px';
    g.setTransform(k, 0, 0, k, 0, 0);
    g.fillStyle = PAPER; g.fillRect(0, 0, W, H);
    g.strokeStyle = 'rgba(120,90,50,0.45)'; g.strokeRect(0.5, 0.5, W - 1, H - 1);
    let x = (W - w) / 2;
    g.fillStyle = INK; g.textBaseline = 'alphabetic';
    for (const p of groups) {
      g.font = font(size);
      const tw = g.measureText(p.t).width;
      let cw = tw;
      if (p.r) { g.font = font(size * 0.38); cw = Math.max(tw, g.measureText(p.r).width); g.fillText(p.r, x + (cw - g.measureText(p.r).width) / 2, size * 0.6); g.font = font(size); }
      g.fillText(p.t, x + (cw - tw) / 2, size * 1.5);
      x += cw;
    }
    cv.setAttribute('role', 'img');
    cv.setAttribute('aria-label', 'Typeset page: ' + (page.word || '') + (page.reading && page.reading !== page.word ? ' (' + page.reading + ')' : ''));
    return cv;
  }
  // A typeset page as HTML (real ruby in a Japanese text font)
  function typesetHtml(page) {
    const spec = (page && page.typeset) || {};
    const lines = Array.isArray(spec.lines) && spec.lines.length ? spec.lines.map((l) => (typeof l === 'string' ? { jp: l } : l)) : [{ jp: spec.jp || page.word || '' }];
    const layout = ['card', 'vertical', 'sentence'].indexOf(spec.layout) >= 0 ? spec.layout : 'card';
    const paper = ['plain', 'grid', 'lined'].indexOf(spec.paper) >= 0 ? spec.paper : 'plain';
    const title = spec.title && typeof spec.title === 'object' ? spec.title : null;
    return '<div class="dk-type lay-' + layout + ' paper-' + paper + (Array.isArray(spec.lines) && spec.lines.length ? ' lined-text' : '') + '" role="img" aria-label="' + esc((page.kind === 'proof' ? 'Proofreading page: ' : 'Typeset page: ') + (page.word || page.label || '') + (page.reading && page.reading !== page.word ? ' (' + page.reading + ')' : '')) + '">' +
      (title ? '<div class="dk-type-title">' + (title.jp ? RB.ui.jhtml(title.jp) + ' ' : '') + (title.en ? '<span class="en">' + esc(title.en) + '</span>' : '') + '</div>' : '') +
      lines.map((l) => '<div class="dk-type-jp">' + RB.ui.jhtml(l.jp || '') + '</div>' + (l.en ? '<div class="dk-type-en">' + esc(l.en) + '</div>' : '')).join('') +
      (spec.en ? '<div class="dk-type-en">' + esc(spec.en) + '</div>' : '') +
      (spec.sentence && layout === 'sentence' ? '<div class="dk-type-sent">' + RB.ui.jhtml(spec.sentence) + '</div>' : '') +
      '</div>';
  }
  // A preview element for any page record (the replace sheet, the desk's result)
  function preview(page, o) {
    const fig = RB.ui.el('figure', 'dk-prev');
    if (page.typeset && (!page.strokes || page.mode === 'typeset')) fig.innerHTML = typesetHtml(page);
    else { const cv = document.createElement('canvas'); cv.className = 'dk-pagecv'; draw(cv, page, o || {}); fig.appendChild(cv); }
    const hand = RB.practiceDesk.handwritten(page);
    fig.appendChild(RB.ui.el('figcaption', null, '<span class="t">' + esc(page.label || 'Practice page') + '</span>' + (o && o.noKind ? '' : '<span class="k">' + esc(page.kind === 'proof' ? 'Proofreading page' : hand ? 'Your handwriting' : 'Typeset — not handwriting') + '</span>') + (page.saved === false ? '<span class="uns">Not saved</span>' : '')));
    return fig;
  }
  return { draw, drawType, typesetHtml, preview };
})();

RB.ui.desk = (function () {
  'use strict';
  const esc = RB.util.esc;
  const I = (n) => RB.learnUi.icon(n);
  const J = (t) => (t ? RB.ui.jhtml(t) : '');
  const D = () => RB.practiceDesk;
  const TX = () => RB.content.practiceA.desk;
  const BOX = 300;
  const isKanji = (c) => !!c && RB.kana.isKanji(c);
  let open = null;
  let curStep = null; // the prompt's step on screen (browser tests)
  const MODE_ICON = { trace: 'practice', copy: 'copy', prompt: 'note', typeset: 'book' };
  const TAB = { trace: 'Trace', copy: 'Copy', prompt: 'From a prompt', typeset: 'Typeset' };
  const MODE_HELP = {
    trace: 'Numbered reference strokes sit under your pen, one square per character. This is guided practice of the movements; it never counts as remembering the word.',
    copy: 'The model stays in its own square beside yours. This is copying practice; it never counts as remembering the word.',
    prompt: 'You see the meaning and a sentence with a gap; the model is there only if you ask for it (How to write). Written without seeing the answer, it counts as an ordinary answer for your reviews; with the model or other help, as practice. Kana or kanji are both fine.',
    typeset: 'Choose a word and a readable layout for a decorated practice page. It is not handwriting, and it is labelled typeset.',
  };
  const DRAW_NOTE = 'Trace and Copy are done by drawing (mouse, finger or pen). If drawing is not comfortable, Write from a prompt also takes typing or choosing, and Typeset makes a page without drawing.';

  // ---- the sheet --------------------------------------------------------------------------
  function sheet() {
    const t = TX().title;
    const fr = RB.learnUi.sheet({ cls: 'activity pa-desk', title: J(t.jp) + ' ' + esc(t.en) });
    const lay = { el: fr.scrim, name: 'desk' };
    RB.learnUi.guardTaps(fr.leaf);
    let onCancel = null, stop = null;
    lay.onCancel = () => { if (onCancel) onCancel(); };
    RB.ui.pushLayer(lay);
    const api = {
      fr, lay, leaf: fr.leaf, foot: fr.foot,
      cancel(fn) { onCancel = fn; },
      meta(m) { fr.setTitle(J(t.jp) + ' ' + esc(t.en), m || ''); },
      teardown(fn) { if (stop) { try { stop(); } catch (e) { /* drawing only */ } } stop = fn || null; },
      close() { api.teardown(null); if (lay.el.isConnected) RB.ui.popLayer(lay); open = null; },
      focus(sel) { setTimeout(() => { const b = fr.el.querySelector(sel); if (b && lay.el.isConnected) b.focus({ preventScroll: true }); }, 0); },
    };
    open = api;
    return api;
  }

  // ---- 1 · mode and word ----------------------------------------------------------------------
  function choose(ui, s, st) {
    return new Promise((resolve) => {
      const tx = TX();
      function render() {
        ui.teardown(null);
        ui.meta('Choose how, then a word');
        const mode = st.mode;
        const cards = D().cards(s), notes = D().notebookCards(s);
        const kept = D().pages(s).length;
        const cardBtn = (c) => {
          const fresh = !c.introduced;
          const face = mode === 'prompt' ? '<span class="dk-c-en big">' + esc(c.en) + '</span>' : '<span class="dk-c-jp">' + J(c.mark) + '</span><span class="dk-c-en">' + esc(c.en) + '</span>';
          return '<button type="button" class="dk-card' + (fresh ? ' fresh' : '') + '" data-card="' + esc(c.id) + '">' + face + (fresh ? '<span class="dk-tag">' + (mode === 'prompt' ? 'new: its card comes first' : 'new to you') + '</span>' : '') + '</button>';
        };
        ui.leaf.innerHTML = '<div class="dk-modehelp" id="dk-modehelp"><p class="dk-mh-t">' + J(tx.modes[mode].jp) + ' <span class="en">' + esc(tx.modes[mode].en) + '</span></p><p>' + esc(MODE_HELP[mode]) + '</p>' +
            (mode === 'trace' || mode === 'copy' ? '<p class="muted small">' + esc(DRAW_NOTE) + '</p>' : '') + '</div>' +
          '<h3 class="dk-h">' + (mode === 'prompt' ? 'Choose a meaning' : 'Choose a word') + '</h3>' +
          '<div class="dk-cards" role="group" aria-label="Words">' + cards.map(cardBtn).join('') + '</div>' +
          (notes.length ? '<h3 class="dk-h">' + J(tx.notebook.jp) + ' <span class="en">' + esc(tx.notebook.en) + '</span></h3><div class="dk-cards" role="group" aria-label="Words from your notebook">' + notes.map(cardBtn).join('') + '</div>' : '') +
          '<p class="muted small dk-keptline">' + esc('Kept pages: ' + kept + ' of ' + D().MAX_PAGES + '.') + (kept ? ' See Journey › Practice mementos.' : '') + '</p>';
        // the modes are the sheet's own paper tabs (on the cloth above the page, outside the
        // page's scroll guard), with short names; the full name heads the page below
        const slot = ui.fr.tabslot;
        slot.classList.add('dk-tabs');
        const tabs = RB.ui.folio.tabs(slot, D().MODES.map((m) => ({ id: m, en: TAB[m], jp: tx.modes[m].jp, icon: MODE_ICON[m] })), mode, (id) => { st.mode = id; D().remember(s, { mode: id }); render(); ui.focus('.dk-tabs .ptab[data-id="' + id + '"]'); }, { label: 'How to practise', panelId: 'dk-modehelp' });
        tabs.el.classList.add('dk-tabrail');
        ui.teardown(() => { tabs.destroy(); slot.innerHTML = ''; slot.classList.remove('dk-tabs'); });
        ui.foot.innerHTML = '<button class="cbtn" data-dk="leave">' + I('back') + '<span>Leave the desk</span></button>';
      }
      ui.leaf.onclick = (e) => {
        const b = e.target.closest('[data-card]');
        if (!b) return;
        const c = D().find(s, b.dataset.card);
        if (c) resolve({ card: c, mode: st.mode });
      };
      ui.leaf.onchange = null;
      ui.foot.onclick = (e) => { if (e.target.closest('[data-dk=leave]')) resolve(null); };
      ui.cancel(() => resolve(null));
      render();
      ui.focus('.dk-tabs .ptab[aria-selected="true"]');
    });
  }

  // ---- the writing square (Trace and Copy) -----------------------------------------------------
  function surface(host, o) {
    const el = RB.ui.el('div', 'dk-work' + (o.mode === 'copy' ? ' copy' : ''));
    el.innerHTML =
      (o.mode === 'copy' ? '<figure class="dk-model"><canvas width="300" height="300" role="img" aria-label="' + esc('The model for ' + o.ch + ', ' + RB.recog.strokeCount(o.ch) + ' numbered strokes') + '"></canvas><figcaption><span class="muted small">The model</span><button type="button" class="pbtn quiet" data-dk="order">' + I('look') + '<span>Show the order</span></button></figcaption></figure>' : '') +
      '<div class="dk-sqcol"><div class="dk-sq"><canvas class="dk-bg" aria-hidden="true"></canvas><canvas class="dk-ink" role="img" aria-label="' + esc('Writing square: ' + (o.mode === 'trace' ? 'trace ' : 'write ') + o.ch + ' with the mouse, a finger or a pen') + '"></canvas></div></div>';
    host.appendChild(el);
    const bg = el.querySelector('.dk-bg'), ink = el.querySelector('.dk-ink'), box = el.querySelector('.dk-sq');
    const P = { strokes: [], cur: null, pid: null, dead: false };
    let C = { paper: '#fffaf0', ink: '#1c160e', guide: 'rgba(120,90,50,0.28)', model: 'rgba(168,62,39,0.30)', num: '#a83e27' };
    let dpr = 1;
    const ref = RB.recog.reference(o.ch);
    function colours() {
      const cs = getComputedStyle(el);
      const g = (k, d) => (cs.getPropertyValue(k) || '').trim() || d;
      C = { paper: g('--pad-paper', C.paper), ink: g('--pad-ink', C.ink), guide: g('--pad-guide', C.guide), model: g('--pad-model', C.model), num: g('--pad-num', C.num) };
    }
    function refDraw(c, w, col, nums) {
      if (!ref) return;
      const sc = w / ref.box;
      c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = col; c.lineWidth = Math.max(3, w / 24);
      ref.strokes.forEach((st) => { c.beginPath(); st.forEach((p, j) => (j ? c.lineTo(p.x * sc, p.y * sc) : c.moveTo(p.x * sc, p.y * sc))); c.stroke(); });
      if (nums) {
        const fs = Math.round(w / 14);
        c.fillStyle = C.num; c.font = '600 ' + fs + 'px sans-serif';
        const placed = [];
        ref.strokes.forEach((st, i) => {
          let x = st[0].x * sc + 4, y = st[0].y * sc - 4;
          // numbers that would sit on top of each other (strokes starting at one point) move apart
          while (placed.some((q) => Math.abs(q[0] - x) < fs * 0.9 && Math.abs(q[1] - y) < fs * 0.9)) x += fs * 0.8;
          placed.push([x, y]);
          c.fillText(String(i + 1), x, y);
        });
      }
    }
    function layout() {
      if (P.dead) return;
      const r = box.getBoundingClientRect();
      if (!r.width) return;
      dpr = window.devicePixelRatio || 1;
      const w = Math.round(r.width * dpr);
      colours();
      for (const c of [bg, ink]) if (c.width !== w || c.height !== w) { c.width = w; c.height = w; }
      drawBg(); redraw();
      const mc = el.querySelector('.dk-model canvas');
      if (mc && !P.demo) drawModel(mc);
    }
    function drawBg() {
      const c = bg.getContext('2d'), w = bg.width;
      c.clearRect(0, 0, w, w);
      c.fillStyle = C.paper; c.fillRect(0, 0, w, w);
      c.strokeStyle = C.guide; c.lineWidth = Math.max(1, dpr); c.setLineDash([5 * dpr, 7 * dpr]);
      c.beginPath(); c.moveTo(w / 2, 0); c.lineTo(w / 2, w); c.moveTo(0, w / 2); c.lineTo(w, w / 2); c.stroke(); c.setLineDash([]);
      if (o.mode === 'trace') refDraw(c, w, C.model, true); // the numbered reference strokes underneath
    }
    function drawModel(mc) {
      const c = mc.getContext('2d'), w = mc.width;
      c.fillStyle = C.paper; c.fillRect(0, 0, w, w);
      c.strokeStyle = C.guide; c.lineWidth = 1; c.setLineDash([5, 7]);
      c.beginPath(); c.moveTo(w / 2, 0); c.lineTo(w / 2, w); c.moveTo(0, w / 2); c.lineTo(w, w / 2); c.stroke(); c.setLineDash([]);
      refDraw(c, w, C.ink, true);
    }
    function redraw() {
      const c = ink.getContext('2d');
      c.clearRect(0, 0, ink.width, ink.height);
      c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = C.ink; c.lineWidth = Math.max(3, ink.width / 34);
      const all = P.cur ? P.strokes.concat([P.cur]) : P.strokes;
      for (const st of all) {
        c.beginPath();
        st.forEach((p, i) => (i ? c.lineTo(p.x * ink.width, p.y * ink.height) : c.moveTo(p.x * ink.width, p.y * ink.height)));
        if (st.length === 1) c.lineTo(st[0].x * ink.width + 0.5, st[0].y * ink.height + 0.5);
        c.stroke();
      }
      if (o.onChange) o.onChange(P.strokes.length);
    }
    const pos = (e) => { const r = ink.getBoundingClientRect(); return { x: Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), y: Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)), t: Math.round(e.timeStamp || 0) }; };
    ink.addEventListener('pointerdown', (e) => {
      if (P.pid != null || (e.pointerType === 'mouse' && e.button !== 0)) return;
      e.preventDefault(); e.stopPropagation();
      try { ink.setPointerCapture(e.pointerId); } catch (err) { /* synthetic pointers */ }
      P.pid = e.pointerId; P.cur = [pos(e)];
      RB.audio && RB.audio.sfx('pen_down', { vol: 0.4 });
      redraw();
    });
    ink.addEventListener('pointermove', (e) => {
      if (e.pointerId !== P.pid || !P.cur) return;
      e.preventDefault();
      const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
      for (const ev of evs.length ? evs : [e]) { const p = pos(ev), l = P.cur[P.cur.length - 1]; if (Math.abs(p.x - l.x) + Math.abs(p.y - l.y) > 0.004) P.cur.push(p); }
      redraw();
    });
    // a normal release ends the stroke; an unexpected cancellation drops only the unfinished one
    const end = (e, cancel) => {
      if (e.pointerId !== P.pid) return;
      P.pid = null;
      if (!P.cur) return;
      if (!cancel) P.strokes.push(P.cur);
      P.cur = null;
      redraw();
      if (!cancel) RB.audio && RB.audio.sfx('pen_up', { vol: 0.3 });
    };
    ink.addEventListener('pointerup', (e) => end(e, false));
    ink.addEventListener('pointercancel', (e) => end(e, true));
    ink.addEventListener('lostpointercapture', (e) => { if (P.pid === e.pointerId) end(e, false); });
    for (const tn of ['touchstart', 'touchmove']) ink.addEventListener(tn, (e) => e.preventDefault(), { passive: false });
    ink.addEventListener('contextmenu', (e) => e.preventDefault());
    let stopDemo = null;
    el.addEventListener('click', (e) => {
      const b = e.target.closest('[data-dk=order]');
      if (!b) return;
      const mc = el.querySelector('.dk-model canvas');
      if (stopDemo) stopDemo();
      P.demo = true;
      stopDemo = RB.lessons.demo(mc, o.ch);
    });
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => layout()) : null;
    if (ro) ro.observe(box);
    requestAnimationFrame(layout);
    return {
      el,
      strokes: () => P.strokes.map((st) => st.slice()),
      undo() { P.strokes.pop(); redraw(); },
      clear() { P.strokes = []; P.cur = null; redraw(); },
      set(strokes) { P.strokes = (strokes || []).map((st) => st.slice()); redraw(); },
      destroy() { P.dead = true; if (stopDemo) stopDemo(); if (ro) ro.disconnect(); el.remove(); },
      _inject(strokes) { P.strokes = strokes; redraw(); }, // tests: strokes in 0..1 units
    };
  }

  // What the pad read, and a stroke-order observation only when it is certain.
  // The recognizer is not told the character (all kana and every kanji in the game);
  // the character is used afterwards, to compare, and for the stroke-order matching.
  function observe(ch, strokes) {
    const pts = strokes.map((st) => st.map((p) => ({ x: p.x * BOX, y: p.y * BOX, t: p.t || 0 })));
    let r;
    try { r = RB.recog.recognize(pts, { box: { w: BOX, h: BOX }, script: 'any', kanji: true }); } catch (e) { r = { status: 'nonsense', candidates: [] }; }
    let so = null;
    try { so = RB.recog.strokeOrderFeedback(pts, ch, { box: { w: BOX, h: BOX } }); } catch (e) { so = null; }
    const cands = (r.candidates || []).map((c) => c.ch);
    const same = (c) => c === ch || (RB.recog.sameShape(ch) || []).indexOf(c) >= 0;
    const at = cands.findIndex(same);
    const G = (c) => '<span lang="ja">' + RB.kanjiChart.glyph(c) + '</span>';
    let kind, read;
    if (r.status === 'nonsense' || !cands.length) { kind = 'unsure'; read = 'The pad could not read this one clearly. That is a limit of the recognizer, not a mark against your writing.'; }
    else if (at === 0) { kind = r.status === 'confident' ? 'sure' : 'unsure'; read = r.status === 'confident' ? 'The pad read this as ' + G(cands[0]) + '.' : 'The pad read this as ' + G(cands[0]) + ', though not with certainty.'; }
    else if (at > 0) { kind = 'unsure'; read = 'The pad read this first as ' + G(cands[0]) + '; ' + G(ch) + ' was its reading ' + (at + 1) + '. Recognition is uncertain here.'; }
    else { kind = 'unsure'; read = 'The pad read this as ' + G(cands[0]) + ' rather than ' + G(ch) + '. Recognition can miss; compare with the model if you like.'; }
    const want = RB.recog.strokeCount(ch), got = strokes.length;
    const notes = [];
    if (want && got !== want) notes.push(G(ch) + ' has ' + want + ' stroke' + (want === 1 ? '' : 's') + '; you wrote ' + got + '.');
    if (so && so.confident) {
      for (const x of so.issues) notes.push(esc(x.en));
      if (!so.issues.length && got === want) notes.push('Stroke order and direction match the model.');
    } else if (got === want) notes.push('No stroke-order note: the strokes could not be matched one by one with certainty.');
    return { kind, read, notes, status: r.status, top: cands[0] || null, orderConfident: !!(so && so.confident), issues: so && so.confident ? so.issues.map((x) => x.kind) : [] };
  }

  // {漢字|かんじ} markup as plain <ruby> (no spans: for places styled per span, like radio labels)
  function rubyPlain(t) {
    return String(t || '').split(/(\{[^|}]+\|[^}]+\})/).map((part, i) => {
      if (!(i % 2)) return esc(part.replace(/ /g, ''));
      const m = /^\{([^|}]+)\|([^}]+)\}$/.exec(part);
      return '<ruby lang="ja">' + esc(m[1]) + '<rt>' + esc(m[2]) + '</rt></ruby>';
    }).join('');
  }

  // ---- 2a · Trace / Copy -------------------------------------------------------------------
  function writeByHand(ui, s, card, mode, st) {
    return new Promise((resolve) => {
      const tx = TX();
      const forms = D().forms(card);
      let form = forms.find((f) => f.id === st.form) || forms[0];
      let chars = D().graphemes(form.text);
      let idx = 0, done = [], obs = [], surf = null;
      function header() {
        return '<div class="dk-word"><span class="dk-w-jp">' + J(card.mark) + '</span><span class="dk-w-en">' + esc(card.m || card.en) + '</span>' +
          '<span class="dk-mode">' + J(tx.modes[mode].jp) + ' <span class="en">' + esc(tx.modes[mode].en) + '</span></span></div>' +
          (forms.length > 1 ? '<fieldset class="field dk-forms"><legend>Write it</legend><div class="opts">' + forms.map((f) => '<label class="opt"><input type="radio" name="dk-form" value="' + f.id + '"' + (f.id === form.id ? ' checked' : '') + '><span>' + rubyPlain(f.id === 'kanji' ? card.mark : f.text) + '&nbsp;' + esc(f.id === 'kanji' ? '(as usually written)' : '(in kana)') + '</span></label>').join('') + '</div></fieldset>' : '');
      }
      function render() {
        ui.teardown(null);
        ui.meta(TAB[mode] + ' · ' + (idx + 1) + ' of ' + chars.length);
        const strip = '<ol class="dk-strip" aria-label="Characters">' + chars.map((c, i) => '<li class="' + (i === idx ? 'cur' : done[i] ? 'done' : '') + '"' + (i === idx ? ' aria-current="true"' : '') + '><span lang="ja">' + RB.kanjiChart.glyph(c) + '</span>' + (done[i] ? '<span class="sr"> (written)</span>' : '') + '</li>').join('') + '</ol>';
        ui.leaf.innerHTML = header() + strip + '<div class="dk-writerow"><div class="dk-surf"></div>' +
          '<div class="dk-side"><div class="dk-tools" role="group" aria-label="Writing tools">' +
            '<button type="button" class="pbtn" data-dk="undo">' + I('undo') + '<span>Undo stroke</span></button>' +
            '<button type="button" class="pbtn" data-dk="clear">' + I('erase') + '<span>Clear</span></button>' +
            (idx > 0 ? '<button type="button" class="pbtn" data-dk="prev">' + I('back') + '<span>Previous character</span></button>' : '') +
            '<button type="button" class="pbtn primary" data-dk="donech" disabled>' + I('done') + '<span>' + (idx < chars.length - 1 ? 'Done with this character' : 'Done — see the page') + '</span></button>' +
          '</div>' +
          '<div class="dk-obs" aria-live="polite">' + (obs[idx - 1] && idx > 0 ? obsHtml(chars[idx - 1], obs[idx - 1]) : '<p class="muted small">' + esc(mode === 'trace' ? 'Follow the numbered strokes, in order, then press Done.' : 'Write it in your square, looking at the model beside it, then press Done.') + '</p>') + '</div></div></div>';
        surf = surface(ui.leaf.querySelector('.dk-surf'), { ch: chars[idx], mode, onChange: (n) => { const b = ui.leaf.querySelector('[data-dk=donech]'); if (b) b.disabled = !n; } });
        if (done[idx]) surf.set(done[idx]);
        ui.teardown(() => surf && surf.destroy());
        if (!ui.fr.el.contains(document.activeElement) || document.activeElement === document.body) ui.focus(forms.length > 1 ? 'input[name=dk-form]:checked' : '[data-dk=undo]');
        ui.foot.innerHTML = '<button class="cbtn" data-dk="back">' + I('back') + '<span>Back to the words</span></button>';
      }
      function obsHtml(ch, o) {
        return '<div class="dk-ob ' + o.kind + '"><div class="fb-h">' + I(o.kind === 'sure' ? 'right' : 'unsure') + '<span>' + o.read + '</span></div>' +
          (o.notes.length ? '<ul class="dk-notes">' + o.notes.map((n) => '<li>' + n + '</li>').join('') + '</ul>' : '') + '</div>';
      }
      ui.leaf.onchange = (e) => {
        if (e.target.name !== 'dk-form') return;
        form = forms.find((f) => f.id === e.target.value) || forms[0];
        st.form = form.id; D().remember(s, { form: form.id });
        chars = D().graphemes(form.text); idx = 0; done = []; obs = [];
        render();
        ui.focus('input[name=dk-form][value="' + form.id + '"]');
      };
      ui.leaf.onclick = (e) => {
        const b = e.target.closest('[data-dk]');
        if (!b || b.disabled) return;
        const a = b.dataset.dk;
        if (a === 'undo') surf.undo();
        if (a === 'clear') surf.clear();
        if (a === 'prev') { done[idx] = surf.strokes().length ? surf.strokes() : done[idx]; idx--; render(); ui.focus('[data-dk=donech]'); }
        if (a === 'donech') {
          const strokes = surf.strokes();
          if (!strokes.length) return;
          done[idx] = strokes;
          obs[idx] = observe(chars[idx], strokes);
          if (idx < chars.length - 1) { idx++; render(); ui.focus('[data-dk=undo]'); RB.audio && RB.audio.sfx('confirm', { vol: 0.4 }); }
          else resolve({ ink: chars.map((c, i) => ({ ch: c, strokes: done[i] })), obs, word: form.text, form: form.id });
        }
      };
      ui.foot.onclick = (e) => { if (e.target.closest('[data-dk=back]')) resolve(null); };
      ui.cancel(() => resolve(null));
      render();
    });
  }

  // ---- 2b · Write from a prompt -------------------------------------------------------------
  function promptStep(card) {
    const m = card.m || card.en;
    const step = { kind: 'write', item: card.item, title: 'Write from a prompt', titleJp: '{意味|いみ} から {書|か}く', answer: card.r, accept: card.accept, mode: 'reading', script: RB.kana.isKata(card.r[0]) ? 'kata' : 'hira' };
    if (card.full && card.mark && card.full.jp.indexOf(card.mark) >= 0) {
      const i = card.full.jp.indexOf(card.mark);
      step.template = { before: card.full.jp.slice(0, i), after: card.full.jp.slice(i + card.mark.length) };
      step.prompt = { en: 'Write the word for “' + card.en + '” (kana or kanji): ' + card.gap };
      step.explain = { jp: card.full.jp, en: card.w + (card.w !== card.r ? ' (' + card.r + ')' : '') + ' — ' + m + '. ' + card.full.en };
    } else {
      step.prompt = { en: 'Write the word for “' + m + '” (kana or kanji).' };
      step.explain = { jp: card.mark, en: card.w + (card.w !== card.r ? ' (' + card.r + ')' : '') + ' — ' + m + '.' };
    }
    return RB.tasks.prepare(step);
  }

  // ---- 2c · Typeset -----------------------------------------------------------------------------
  function typeset(ui, s, card, st) {
    return new Promise((resolve) => {
      const LAYOUTS = [['card', 'Card'], ['vertical', 'Vertical']].concat(card.full ? [['sentence', 'With its sentence']] : []);
      const PAPERS = [['plain', 'Plain'], ['grid', 'Squares'], ['lined', 'Lined']];
      const spec = { jp: card.mark, layout: st.layout || 'card', paper: st.paper || 'plain', en: card.m || card.en };
      if (card.full) spec.sentence = card.full.jp;
      if (!LAYOUTS.some((l) => l[0] === spec.layout)) spec.layout = 'card';
      function render() {
        ui.teardown(null);
        ui.meta('Typeset a practice page');
        const page = { word: card.w, reading: card.r, mode: 'typeset', typeset: Object.assign({}, spec) };
        const radios = (name, list, cur) => '<div class="opts">' + list.map(([v, l]) => '<label class="opt"><input type="radio" name="' + name + '" value="' + v + '"' + (cur === v ? ' checked' : '') + '><span>' + esc(l) + '</span></label>').join('') + '</div>';
        ui.leaf.innerHTML = '<p>' + esc(MODE_HELP.typeset) + '</p>' +
          '<fieldset class="field"><legend>Layout</legend>' + radios('dk-lay', LAYOUTS, spec.layout) + '</fieldset>' +
          '<fieldset class="field"><legend>Paper</legend>' + radios('dk-paper', PAPERS, spec.paper) + '</fieldset>' +
          '<div class="dk-typeprev">' + RB.ui.deskPage.typesetHtml(page) + '<p class="muted small">Typeset — not handwriting.</p></div>';
        ui.foot.innerHTML = '<button class="cbtn" data-dk="back">' + I('back') + '<span>Back to the words</span></button><span class="spacer"></span><button class="cbtn go" data-dk="make">' + I('book') + '<span>Use this layout</span></button>';
      }
      ui.leaf.onchange = (e) => {
        if (e.target.name === 'dk-lay') { spec.layout = e.target.value; st.layout = spec.layout; }
        else if (e.target.name === 'dk-paper') { spec.paper = e.target.value; st.paper = spec.paper; }
        else return;
        const nm = e.target.name, v = e.target.value;
        render();
        ui.focus('input[name=' + nm + '][value="' + v + '"]');
      };
      ui.leaf.onclick = null;
      ui.foot.onclick = (e) => {
        const b = e.target.closest('[data-dk]');
        if (!b) return;
        if (b.dataset.dk === 'back') resolve(null);
        if (b.dataset.dk === 'make') resolve({ typeset: Object.assign({}, spec) });
      };
      ui.cancel(() => resolve(null));
      render();
      ui.focus('[data-dk=make]');
    });
  }

  // ---- 3 · the page: preview, label, keep ---------------------------------------------------------
  const MODE_WORD = { trace: 'traced', copy: 'copied', prompt: 'from a prompt', typeset: 'typeset' };
  function pageView(ui, s, card, mode, made, info) {
    return new Promise((resolve) => {
      let page = null, kept = null, status = '', busy = false;
      const label0 = (card.en.charAt(0).toUpperCase() + card.en.slice(1)) + ', ' + MODE_WORD[mode];
      let label = label0;
      function build() {
        return D().makePage(s, { kind: 'desk', word: made.word || card.w, reading: card.r, item: card.item, mode, ink: made.ink || null, typeset: made.typeset || null, label, id: page ? page.id : undefined, created: page ? page.created : undefined });
      }
      try { page = build(); } catch (e) { page = null; }
      function render() {
        ui.teardown(null);
        ui.meta(kept && kept.ok ? 'Page kept' : 'Your page');
        const hand = page && D().handwritten(page);
        ui.leaf.innerHTML = (info || '') +
          '<div class="dk-pagebox"></div>' +
          '<p class="dk-pagekind">' + (hand ? J(TX().yours.jp) + ' <span class="en">' + esc(TX().yours.en + ' · ' + ({ trace: 'traced over the numbered strokes', copy: 'copied beside the model', prompt: 'written from a prompt' }[mode])) + '</span>' : J(TX().typeset.jp) + ' <span class="en">Typeset — not handwriting</span>') + '</p>' +
          (kept && kept.ok ? '' : '<div class="field"><label class="lab" for="dk-label">Label for this page</label><input id="dk-label" type="text" maxlength="' + D().MAX_LABEL + '" autocomplete="off" value="' + esc(label) + '"><div class="hint">Up to ' + D().MAX_LABEL + ' characters. ' + esc(D().pages(s).length + ' of ' + D().MAX_PAGES + ' pages kept.') + '</div></div>') +
          '<p class="dk-status" aria-live="polite">' + status + '</p>' +
          // the secondary ways on, on the page (the cloth foot keeps only the main action)
          '<div class="row-acts dk-next"><button type="button" class="pbtn" data-dk="words">' + I('back') + '<span>Another word</span></button>' +
          '<button type="button" class="pbtn" data-dk="again">' + I('undo') + '<span>' + (mode === 'typeset' ? 'Change the layout' : 'Write it again') + '</span></button></div>';
        const box = ui.leaf.querySelector('.dk-pagebox');
        if (page) box.appendChild(RB.ui.deskPage.preview(Object.assign({}, page, { saved: kept ? !!(kept.ok && kept.saved) : undefined }), { noKind: true, cell: 120 }));
        const canKeep = page && !(kept && kept.ok);
        ui.foot.innerHTML = '<span class="spacer"></span>' +
          (canKeep ? '<button class="cbtn go" data-dk="keep">' + I('save') + '<span>' + (kept && !kept.ok && kept.error === 'storage' ? 'Try keeping it again' : 'Keep this page') + '</span></button>' : '<button class="cbtn go" data-dk="leave">' + I('done') + '<span>Leave the desk</span></button>');
        const inp = ui.leaf.querySelector('#dk-label');
        if (inp) {
          inp.addEventListener('input', () => { label = inp.value; });
          inp.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.isComposing && e.keyCode !== 229) { e.preventDefault(); keep(); } });
        }
      }
      async function keep() {
        if (busy || !page) return;
        busy = true;
        try {
          page = build();
          const r = await D().keepPage(s, page);
          kept = r;
          if (r.page) page = r.page;
          status = statusText(r);
        } finally { busy = false; }
        render();
        ui.focus(kept && kept.ok ? '[data-dk=leave]' : '[data-dk=keep]');
      }
      ui.leaf.onchange = null;
      ui.leaf.onclick = ui.foot.onclick = (e) => {
        const b = e.target.closest('[data-dk]');
        if (!b || b.disabled) return;
        const a = b.dataset.dk;
        if (a === 'keep') keep();
        if (a === 'words') resolve('words');
        if (a === 'again') resolve('again');
        if (a === 'leave') resolve('leave');
      };
      ui.cancel(() => resolve('words'));
      if (!page) status = 'This page could not be made.';
      render();
      ui.focus('[data-dk=keep]');
    });
  }
  function statusText(r) {
    if (r.ok && r.saved) return esc(r.replaced ? 'Kept and saved, in place of the page you chose. ' : 'Kept and saved. ') + 'Find it in Journey › Practice mementos.';
    if (r.ok) return esc({ 'no-slot': 'Kept in this journey, but not saved yet: this journey has no save slot.', 'read-only': 'Kept in this journey, but not saved: this tab is read-only for this campaign.', session: 'Kept for now, but this browser is not keeping saves: it will be lost when the page closes.' }[r.why] || 'Kept in this journey, but not saved yet.');
    if (r.cancelled) return 'Not kept: your six pages are as they were. This page is still here, unsaved.';
    if (r.error === 'too-large') return 'This page is larger than 256 KiB even after compacting, so it cannot be kept. It stays here on screen, unsaved.';
    if (r.error === 'storage') return 'Not saved: storage refused it. The page is still here on screen, unsaved, and your other progress is unaffected. You can try again.';
    return 'Not kept. The page is still here on screen, unsaved.';
  }

  // ---- the replace / cancel sheet (RB.practiceDesk's chooser) -----------------------------------------
  function chooser(s, pages, page) {
    return new Promise((resolve) => {
      const fr = RB.learnUi.sheet({ cls: 'activity pa-replace', title: esc('Six pages are kept') });
      const lay = { el: fr.scrim, name: 'desk-replace' };
      const done = (v) => { if (lay.el.isConnected) RB.ui.popLayer(lay); resolve(v); };
      lay.onCancel = () => done(null);
      fr.leaf.innerHTML = '<p>You can keep up to six pages. To keep the new one, choose a page it replaces — or cancel, and the six stay as they are. Nothing is removed unless you choose it.</p>' +
        '<h3>The new page</h3><div class="dk-newprev"></div><h3>Your six pages</h3><ul class="dk-replist"></ul>';
      fr.leaf.querySelector('.dk-newprev').appendChild(RB.ui.deskPage.preview(page, { cell: 64 }));
      const ul = fr.leaf.querySelector('.dk-replist');
      pages.forEach((p) => {
        const li = RB.ui.el('li', 'dk-repitem');
        li.appendChild(RB.ui.deskPage.preview(p, { cell: 56 }));
        const b = RB.ui.el('button', 'pbtn', I('trash') + '<span>Replace it</span>');
        b.type = 'button';
        b.dataset.rep = p.id;
        b.setAttribute('aria-label', 'Replace “' + (p.label || 'Practice page') + '” with the new page');
        li.appendChild(b);
        ul.appendChild(li);
      });
      fr.foot.innerHTML = '<span class="spacer"></span><button class="cbtn go" data-x>' + I('back') + '<span>Cancel — keep the six</span></button>';
      fr.foot.onclick = (e) => { if (e.target.closest('[data-x]')) done(null); };
      fr.leaf.onclick = async (e) => {
        const b = e.target.closest('[data-rep]');
        if (!b) return;
        const old = pages.find((p) => p.id === b.dataset.rep);
        const ok = await RB.ui.confirm('Replace “' + (old ? old.label : 'this page') + '” with “' + (page.label || 'the new page') + '”? The old page will be gone from this journey.', ['Replace it', 'Back'], { danger: true });
        if (ok === 0) done({ replace: b.dataset.rep });
      };
      RB.learnUi.guardTaps(fr.leaf);
      RB.ui.pushLayer(lay);
      setTimeout(() => { const f = fr.foot.querySelector('[data-x]'); if (f) f.focus({ preventScroll: true }); }, 0);
    });
  }
  D().setChooser(chooser);

  // ---- the session -----------------------------------------------------------------------------
  async function run(session) {
    const s = RB.game.s;
    const ob = RB.practice.objectives(session);
    const ui = sheet();
    const last = (RB.practice.of(s).desk || {}).last || {};
    const st = { mode: D().MODES.indexOf(last.mode) >= 0 ? last.mode : 'trace', form: last.form || 'kanji' };
    const shown = new Set(); // words whose answer has been in view at this sitting
    let n = 0, tasks = 0;
    try {
      let pick = null;
      while (session.alive()) {
        session.set('preparing');
        if (!pick) pick = await choose(ui, s, st);
        if (!pick || !session.alive()) break;
        const { card, mode } = pick;
        D().remember(s, { card: card.id, mode });
        session.set('active');
        const objId = 'desk:' + session.id + ':' + (++n);
        let made = null, info = '';
        if (mode === 'trace' || mode === 'copy') {
          made = await writeByHand(ui, s, card, mode, st);
          if (!session.alive()) break;
          if (!made) { pick = null; continue; }
          D().record(s, ob, objId, card, mode, null);
          shown.add(card.id);
          tasks++;
          info = '<p class="dk-done">' + esc('Written: ' + made.word + '. ' + (mode === 'trace' ? 'Traced over the model: practice of the movements.' : 'Copied beside the model: copying practice.')) + '</p>' + obsList(made);
        } else if (mode === 'typeset') {
          made = await typeset(ui, s, card, st);
          if (!session.alive()) break;
          if (!made) { pick = null; continue; }
          D().record(s, ob, objId, card, mode, null);
          shown.add(card.id);
          tasks++;
        } else {
          // the word's card first when it has not been met (its answer is then in view)
          let taught = false;
          if (!card.introduced && !shown.has(card.id)) {
            const e = RB.lex.get(card.w, card.r);
            await RB.challenge.teachCard({ title: 'Something new', jp: card.mark, en: card.r + ' (' + RB.kana.romaji(card.r) + '): ' + ((e && e.m) || card.en) + '.', ex: card.full ? [{ jp: card.full.jp, en: card.full.en }] : [] });
            if (!session.alive()) break;
            RB.learn.markIntroduced(card.item);
            taught = true;
          }
          const step = promptStep(card);
          curStep = step;
          ui.teardown(null);
          ui.foot.innerHTML = '';
          ui.leaf.innerHTML = '<p class="muted">Writing from a prompt…</p>';
          const res = await RB.challenge.runStep(step, { noRecord: true, keepInk: true, mode: 'hand', ctxTag: 'copying', cancelLabel: 'Back' });
          curStep = null;
          if (!session.alive()) break;
          if (!res || res.cancelled) { pick = null; continue; }
          const rec = D().record(s, ob, objId, card, 'prompt', res, { exposed: taught || shown.has(card.id), step });
          shown.add(card.id);
          tasks++;
          info = '<p class="dk-done">' + esc(rec.counted ? 'Written from the prompt. This counts as an ordinary answer for your reviews.' : rec.exposed ? 'Written from the prompt. The answer had been in view (the model, the answer, help, or earlier at this desk), so this counts as practice.' : 'Written from the prompt.') + '</p>';
          const full = D().graphemes(card.w), fullR = D().graphemes(card.r);
          const ink = res.mode === 'hand' && Array.isArray(res.ink) ? res.ink : null;
          const word = ink ? ink.map((c) => c.ch).join('') : '';
          const complete = ink && ink.length && ink.every((c) => c.strokes && c.strokes.length && !c.manual) && (word === card.w || word === card.r || (card.accept || []).indexOf(word) >= 0) && (D().graphemes(word).length === full.length || D().graphemes(word).length === fullR.length);
          if (!complete) {
            const r = await notice(ui, info + '<p>' + esc(ink && ink.length ? 'Part of this answer was not handwritten in full (or only one kana was asked for), so there is no complete handwriting to keep as a page.' : 'This answer was typed or chosen, so there is no handwriting to keep as a page.') + ' Trace or Copy make a handwritten page; Typeset makes a decorated one.</p>');
            if (r === 'leave') break;
            pick = r === 'again' ? pick : null;
            continue;
          }
          made = { ink: ink.map((c) => ({ ch: c.ch, strokes: c.strokes })), word };
        }
        session.set('result');
        const next = await pageView(ui, s, card, mode, made, info);
        if (!session.alive() || next === 'leave') break;
        pick = next === 'again' ? pick : null;
      }
    } finally {
      ui.close();
    }
    return { tasks };
  }
  // what the pad read for each character, and the stroke-order notes that were certain
  function obsList(made) {
    if (!made || !made.obs || !made.obs.length) return '';
    return '<details class="dk-obslist" open><summary>What the pad noticed</summary><ul class="dk-obsul">' + made.obs.map((o, i) => {
      const ch = made.ink[i] ? made.ink[i].ch : '';
      return '<li><span class="dk-obch" lang="ja">' + RB.kanjiChart.glyph(ch) + '</span><div class="dk-ob ' + o.kind + '">' + o.read + (o.notes.length ? '<ul class="dk-notes">' + o.notes.map((x) => '<li>' + x + '</li>').join('') + '</ul>' : '') + '</div></li>';
    }).join('') + '</ul><p class="muted small">Reading and stroke order are noticed, never graded; nothing here judges how the writing looks.</p></details>';
  }
  function notice(ui, html) {
    return new Promise((resolve) => {
      ui.teardown(null);
      ui.meta('Write from a prompt');
      ui.leaf.innerHTML = html + '<div class="row-acts dk-next"><button type="button" class="pbtn" data-dk="words">' + I('back') + '<span>Another word</span></button><button type="button" class="pbtn" data-dk="again">' + I('undo') + '<span>Write it again</span></button></div>';
      ui.foot.innerHTML = '<span class="spacer"></span><button class="cbtn go" data-dk="leave">' + I('done') + '<span>Leave the desk</span></button>';
      ui.leaf.onclick = ui.foot.onclick = (e) => { const b = e.target.closest('[data-dk]'); if (b) resolve(b.dataset.dk); };
      ui.leaf.onchange = null;
      ui.cancel(() => resolve('words'));
      ui.focus('[data-dk=words]');
    });
  }
  function dispose() {
    // a campaign change while the desk is open: close a running step, card, question or the
    // replace sheet (as cancelled: nothing is replaced), then the desk
    if (typeof document !== 'undefined') {
      const leave = document.querySelector('.chal [data-a=leave]');
      if (leave) leave.click();
      const card = document.querySelector('.lsheet.teach [data-ok]');
      if (card) card.click();
      const q = document.querySelector('.csheet .pbtn:last-child');
      if (q && document.querySelector('.pa-replace')) q.click();
      const rep = document.querySelector('.pa-replace [data-x]');
      if (rep) rep.click();
    }
    if (open) open.close();
  }

  // ---- registration: the activity, the desk's scene hook, the rest menu, Words › Ways to practise ----
  function eligible(s) {
    if (!D().here(s)) return { ok: false, why: 'The writing desk is at the Gull in Saltglass.' };
    const w = RB.practiceA.worldSafe();
    return w.ok ? { ok: true } : { ok: false, why: RB.practiceA.whyText(w.why) };
  }
  RB.activity.register('copying', { title: { en: 'Writing desk', jp: '{書|か}き{物|もの} の {机|つくえ}' }, eligible, run, dispose });
  RB.hooks = RB.hooks || {};
  RB.hooks.pa_desk = async () => {
    if (RB.test && RB.test.auto) { RB.test.log.push({ t: 'activity', kind: 'copying', skipped: 'auto' }); return; }
    RB.practiceA.afterScene(() => RB.practiceA.launch('copying', { source: 'world-prop' }));
  };
  // at a rest setting where a desk is: "Writing desk", after the existing choices (Just chat stays first)
  if (RB.company && RB.company.addRestOption) {
    RB.company.addRestOption((s, setting) => {
      if (!setting || !D().PLACES.some((p) => p.map === setting.map)) return null;
      const t = RB.content.practiceA && RB.content.practiceA.desk && RB.content.practiceA.desk.rest;
      return { label: t || { jp: '{机|つくえ} で {書|か}く', en: 'Writing desk' }, run: () => { RB.practiceA.afterScene(() => RB.practiceA.launch('copying', { source: 'companion-talk' })); } };
    });
  }
  RB.practice.addActivity({
    id: 'desk', en: 'Writing desk', jp: '{書|か}き{物|もの} の {机|つくえ}', icon: 'practice', order: 40,
    where: { en: 'The small desk at the Gull, Saltglass', jp: '{潮硝子|しおがらす} の かもめ{亭|てい}' },
    available: (s) => D().unlocked(s),
    here: (s) => D().here(s),
    note: (s) => (!D().unlocked(s) ? 'Offered from Chapter 2, at an inn on the coast.' : D().here(s) ? '' : 'Offered at the small desk in the Gull, the inn in Saltglass (also from the rest menu there).'),
    begin: (ctx) => RB.practiceA.launch('copying', Object.assign({ source: 'words' }, ctx || {})),
  });

  return { run, choose, surface, observe, promptStep, chooser, eligible, _open: () => open, _step: () => curStep };
})();
