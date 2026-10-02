/* Handwriting pad + composition strip (spec §9), and small shared pieces of
 * the learning/combat interface (RB.learnUi).
 * - Captures ordered strokes with timestamps from mouse, touch or stylus,
 *   accounting for canvas scaling and devicePixelRatio. Drawing never
 *   scrolls the page or moves the character. The writing canvas is the only
 *   element with `touch-action: none`.
 * - The writing surface is plain paper: faint quarter guides only, no
 *   texture under the strokes. Strokes are kept in 0..1 box units, so a
 *   resize or orientation change redraws them unchanged.
 * - The recognizer never sees the expected answer. The pad shows what it
 *   read ("I read this as…"), alternatives and uncertainty; only an
 *   explicit Confirm puts a character into the answer strip.
 * - Choosing a non-top candidate or picking from the chart counts as an
 *   assisted character (not the other character of one shape, ロ/口).
 * - "Read as": Kanji or kana (the task's kana plus every kanji in the game),
 *   Either kana, ひらがな, カタカナ. The start follows the player's
 *   preference (by level: Foundations kana only), never the answer; kana
 *   practice reads kana only. A kanji drawn while kanji reading is off is said
 *   so plainly (no kana guesses); a kanji-like drawing nothing matches well is
 *   said to be possibly outside the game's kanji, with the closest readings.
 * - The Chart (RB.kanjiChart, src/ui/62_kanjichart.js): kana and every kanji,
 *   by theme and by use, with search, entries and practice. */
var RB = (globalThis.RB = globalThis.RB || {});

/* ---- shared learning-interface helpers ------------------------------------------ */
RB.learnUi = (function () {
  'use strict';
  const esc = RB.util.esc;
  // Icons for the learning and combat screens (24×24, stroke currentColor),
  // added to the folio icon set so RB.ui.folio.icon() draws them.
  const ICONS = {
    undo: '<path d="M9 6L4 11l5 5"/><path d="M4 11h9.5a5.5 5.5 0 0 1 0 11H10"/>',
    erase: '<path d="M4 16l9-9 6 6-6 6H8z"/><path d="M9.5 10.5l6 6"/><path d="M14 21h6"/>',
    backspace: '<path d="M8.5 5H20v14H8.5L3 12z"/><path d="M11.5 9l5 6M16.5 9l-5 6"/>',
    grid: '<rect x="4" y="4" width="16" height="16" rx="1"/><path d="M4 9.3h16M4 14.6h16M9.3 4v16M14.6 4v16"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
    keyboard: '<rect x="2.5" y="6" width="19" height="12" rx="1.5"/><path d="M6 10h1M9.5 10h1M13 10h1M16.5 10h1M7 14h10"/>',
    list: '<path d="M9 7h11M9 12h11M9 17h11"/><circle cx="5" cy="7" r="1.2"/><circle cx="5" cy="12" r="1.2"/><circle cx="5" cy="17" r="1.2"/>',
    pieces: '<rect x="3" y="4" width="8" height="6" rx="1"/><rect x="13" y="4" width="8" height="6" rx="1"/><rect x="8" y="14" width="8" height="6" rx="1"/><path d="M7 10v2h10v-2M12 12v2"/>',
    unsure: '<circle cx="12" cy="12" r="9" stroke-dasharray="3.2 2.6"/><path d="M9.6 9.4a2.5 2.5 0 1 1 3.4 2.4c-.6.3-1 .8-1 1.5v.5"/><path d="M12 16.8v.4"/>',
    wrong: '<circle cx="12" cy="12" r="9"/><path d="M8.7 8.7l6.6 6.6M15.3 8.7l-6.6 6.6"/>',
    right: '<circle cx="12" cy="12" r="9"/><path d="M7.6 12.4l3 3 5.8-6.4"/>',
    seal: '<path d="M9.5 3h5v4.5l3 3V14h-11v-3.5l3-3z"/><path d="M5 17h14v4H5z"/>',
    shield: '<path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6z"/>',
    drop: '<path d="M12 3c3 4.5 6 7.8 6 11a6 6 0 0 1-12 0c0-3.2 3-6.5 6-11z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5V5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/>',
    leaf: '<path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14z"/><path d="M5 19l8-8"/>',
    wind: '<path d="M3 9h11a3 3 0 1 0-3-3"/><path d="M3 14h15a3 3 0 1 1-3 3"/><path d="M3 19h6"/>',
    rope: '<circle cx="12" cy="9.5" r="5"/><path d="M8.6 13.2L5 20.5M15.4 13.2l3.6 7.3"/>',
    flame: '<path d="M12 3c1 4 5 5.5 5 10a5 5 0 0 1-10 0c0-2.5 1.5-4 2.5-5 .3 2 1.2 3 2.2 3-.7-3 .3-5.5.3-8z"/>',
    knot: '<path d="M3 15c3 0 4-8 8-8a4 4 0 0 1 0 8c-3 0-3-4 0-4s4 4 10 4"/>',
    lens: '<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5.5 5.5"/>',
    join: '<circle cx="9" cy="12" r="5"/><circle cx="15" cy="12" r="5"/>',
    strike: '<path d="M20 4l-9.5 9.5M20 4h-4.5M20 4v4.5"/><path d="M8 12l4 4M6.5 14.5l3 3M4 20l3.8-3.8"/>',
    sweep: '<path d="M3 16c4-8 14-8 18 0"/><path d="M16.5 12.5L21 16l-5 1"/>',
    cloud: '<path d="M7 18h10a4 4 0 0 0 .5-8 5.5 5.5 0 0 0-10.5 1A3.5 3.5 0 0 0 7 18z"/>',
    hourglass: '<path d="M7 3h10M7 21h10"/><path d="M8 3c0 5 4 6 4 9s-4 4-4 9M16 3c0 5-4 6-4 9s4 4 4 9"/>',
    gust: '<path d="M4 12a8 8 0 1 1 8 8"/><path d="M8 12a4 4 0 1 1 4 4"/>',
    needle: '<path d="M5 19L18 6"/><path d="M17 4.5a1.5 1.5 0 1 1 2.5 2.5"/><path d="M5 19c3 1 5-1 6-3s3-3 6-2"/>',
    mask: '<path d="M4 7c3 1 13 1 16 0 0 6-2 11-8 11S4 13 4 7z"/><path d="M8 11h2M14 11h2M10 15c1 .7 3 .7 4 0"/>',
    rest: '<circle cx="6" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="18" cy="12" r="1"/>',
    waves: '<path d="M3 8c3-2 6 2 9 0s6 2 9 0M3 13c3-2 6 2 9 0s6 2 9 0M3 18c3-2 6 2 9 0s6 2 9 0"/>',
    snow: '<path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9"/><path d="M9.5 4.5L12 6.5l2.5-2M9.5 19.5L12 17.5l2.5 2"/>',
    mute: '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 9l5 6M21 9l-5 6"/>',
    mirror: '<ellipse cx="12" cy="10" rx="6" ry="7"/><path d="M12 17v4M9 21h6M9.5 7.5l2-2"/>',
    aim: '<circle cx="12" cy="12" r="7.5"/><circle cx="12" cy="12" r="2"/><path d="M12 1.5v4M12 18.5v4M1.5 12h4M18.5 12h4"/>',
    tray: '<path d="M3 15h18l-2 4H5z"/><path d="M7 15c0-3 2.2-5 5-5s5 2 5 5"/><path d="M12 7v3"/>',
    dots: '<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>',
  };
  if (RB.ui && RB.ui.folio && RB.ui.folio.ICONS) Object.assign(RB.ui.folio.ICONS, ICONS);
  const icon = (n, t) => (RB.ui.folio ? RB.ui.folio.icon(n, t) : '');

  /* A scroll gesture over a choice must not choose it on release. The
   * browser normally cancels the tap when it starts scrolling, but a drag
   * that ends on the same button, or a scroll container that moved under
   * the finger, still produces a click; swallow those. Keyboard clicks
   * (detail 0) always pass. */
  function guardTaps(root) {
    let down = null, last = null;
    const scrollers = (el) => {
      const out = [];
      for (let n = el; n && n !== document.body; n = n.parentElement) if (n.scrollHeight > n.clientHeight + 1 || n.scrollWidth > n.clientWidth + 1) out.push([n, n.scrollTop, n.scrollLeft]);
      return out;
    };
    root.addEventListener('pointerdown', (e) => {
      down = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: false, sc: scrollers(e.target), touch: e.pointerType !== 'mouse' };
      last = null;
    }, true);
    root.addEventListener('pointermove', (e) => {
      if (!down || e.pointerId !== down.id) return;
      if (Math.hypot(e.clientX - down.x, e.clientY - down.y) > (down.touch ? 10 : 16)) down.moved = true;
    }, true);
    const finish = (e, cancelled) => {
      if (!down || e.pointerId !== down.id) return;
      const moved = cancelled || (down.touch && down.moved) || down.sc.some(([n, t, l]) => Math.abs(n.scrollTop - t) > 2 || Math.abs(n.scrollLeft - l) > 2);
      last = { moved, t: performance.now() };
      down = null;
    };
    root.addEventListener('pointerup', (e) => finish(e, false), true);
    root.addEventListener('pointercancel', (e) => finish(e, true), true);
    root.addEventListener('click', (e) => {
      if (e.detail === 0) return; // keyboard / programmatic activation
      const l = last;
      last = null;
      if (l && l.moved && performance.now() - l.t < 1000) { e.stopPropagation(); e.preventDefault(); }
    }, true);
  }

  /* A learning sheet in folio materials: cloth frame, one paper leaf, cloth
   * foot. `panel`/`foot` class hooks are kept for older test drivers. */
  function sheet(opts) {
    opts = opts || {};
    const fr = RB.ui.folio.frame({ cls: 'lsheet panel' + (opts.cls ? ' ' + opts.cls : ''), onClose: opts.onClose, closeLabel: opts.closeLabel, closeIcon: opts.closeIcon });
    fr.setTitle(opts.title || '', opts.meta || '');
    fr.box.innerHTML = '<div class="leaf" tabindex="-1"></div>';
    fr.leaf = fr.box.firstChild;
    fr.foot.classList.add('foot');
    if (opts.headBtn) {
      const b = RB.ui.el('button', 'cbtn', opts.headBtn.html);
      for (const k in opts.headBtn.attrs || {}) b.setAttribute(k, opts.headBtn.attrs[k]);
      fr.head.appendChild(b);
    }
    return fr;
  }
  // Feedback heading with a shape mark (never colour alone).
  function fbHead(kind, text) {
    const n = { ok: 'right', no: 'wrong', unsure: 'unsure', reveal: 'eye', info: 'note' }[kind] || 'note';
    return '<div class="fb-h">' + icon(n) + '<span>' + esc(text) + '</span></div>';
  }
  // Mixed text (English with {漢字|かな} groups, as in grammar notes and answer
  // feedback): plain parts escaped, ruby groups rendered with furigana.
  function mixed(t) {
    const un = (x) => x.replace(/&(amp|lt|gt|quot|#39);/g, (m, k) => ({ amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'" })[k]);
    return String(t || '').split(/(\{[^|}]+\|[^}]+\})/).map((part, i) => (i % 2 ? RB.ui.jhtml(part) : esc(un(part)))).join('');
  }
  return { ICONS, icon, guardTaps, sheet, fbHead, mixed };
})();

RB.pad = (function () {
  'use strict';
  const esc = RB.util.esc;
  const I = (n) => RB.learnUi.icon(n);
  const BOX = 300; // recognizer coordinate space
  const SMALL = 'ぁぃぅぇぉっゃゅょゎァィゥェォッャュョヮヵヶ';
  const MODES = ['kanji', 'any', 'hira', 'kata']; // "Read as": Kanji or kana / Either kana / ひらがな / カタカナ
  const isKanji = (c) => !!c && RB.kana.isKanji(c);

  /* Kanji reading on the pad is the player's preference (Settings › Learning:
   * padKanji 'auto' | 'on' | 'off'; older settings records have none and mean
   * 'auto'). 'auto' follows the Japanese level: kana only in Foundations,
   * kanji or kana from Elementary on. It never depends on the task's answer. */
  function kanjiPreferred() {
    const st = RB.game && RB.game.settings;
    const v = (st && st.padKanji) || 'auto';
    if (v === 'on' || v === 'off') return v === 'on';
    const s = RB.game && RB.game.s;
    return !!(s && s.learn && s.learn.profile && s.learn.profile !== 'F');
  }
  // Choosing "Kanji or kana" or "Either kana" on a pad is remembered.
  function rememberKanji(on) {
    const st = RB.game && RB.game.settings;
    if (!st || kanjiPreferred() === on) return;
    st.padKanji = on ? 'on' : 'off';
    if (RB.game.saveSettings) RB.game.saveSettings();
  }
  // A character as shown on the pad: a kanji carries its reading on its own
  // as furigana (there is no word context yet; the feedback gives the word's).
  function glyph(ch) {
    const r = isKanji(ch) && RB.answers && RB.answers.kanjiReading ? RB.answers.kanjiReading(ch) : null;
    return r ? '<ruby>' + esc(ch) + '<rt>' + esc(r) + '</rt></ruby>' : esc(ch);
  }
  const spoken = (ch) => {
    if (ch === '々') return 'the repeat mark 々';
    const r = isKanji(ch) && RB.answers && RB.answers.kanjiReading ? RB.answers.kanjiReading(ch) : null;
    return r ? 'the kanji ' + ch + ' (' + r + ')' : ch;
  };
  /* One shape, two characters (ロ/口, ニ/二, カ/力, ー/一): the recognizer
   * returns both at one distance, kana first. The pad offers first the one
   * that fits the character written just before it — never the task's answer:
   * after a kanji, the kanji; after katakana, the kana; after hiragana, the
   * kanji (but ー, which lengthens a vowel); at the start, the kana (but 一,
   * since no word starts with ー). Choosing the other one is not "assisted". */
  function twinFirst(group, prev) {
    const kana = group.find((c) => !isKanji(c)), kan = group.find(isKanji);
    if (!kana || !kan) return null;
    if (!prev) return kana === 'ー' ? kan : kana;
    if (isKanji(prev)) return kan;
    if (RB.kana.isHira(prev)) return kana === 'ー' ? kana : kan;
    return kana;
  }

  function create(host, opts) {
    opts = opts || {};
    // fishing pace hooks (src/ui/69_pace.js), passed only by RB.pace.attempt; null for every other pad
    const PH = opts.pace || null;
    const el = RB.ui.el('div', 'pad-area');
    el.innerHTML =
      '<div class="pad-hold"><div class="pad-box"><canvas class="pad-bg" aria-hidden="true"></canvas><canvas class="pad-ink" role="img" aria-label="Writing pad: draw one character"></canvas></div></div>' +
      '<div class="pad-inspect">' +
        '<div class="readas" data-state="empty"></div>' +
        '<div class="cands" role="group" aria-label="Other readings"></div>' +
        '<button class="pbtn primary pad-confirm" data-a="confirm" disabled>' + I('done') + '<span>Confirm</span></button>' +
        '<div class="sr" aria-live="polite"></div>' +
      '</div>' +
      '<div class="pad-tools" role="group" aria-label="Writing tools">' +
        '<button class="pbtn" data-a="undo" title="Undo the last stroke">' + I('undo') + '<span>Undo stroke</span></button>' +
        '<button class="pbtn" data-a="clear" title="Clear the character being written">' + I('erase') + '<span>Clear</span></button>' +
        '<button class="pbtn pad-more-b" data-a="more" aria-expanded="false" aria-controls="pad-extra" title="More writing tools: small kana, chart, how to write, kana type">' + I('dots') + '<span>More</span><span class="more-on" lang="ja" hidden>小</span></button>' +
        '<div class="pad-extra" id="pad-extra">' +
          '<button class="pbtn" data-a="small" aria-pressed="false" title="Mark as small kana (ゃ, っ…)"><span class="glyph" lang="ja" aria-hidden="true"><ruby>小<rt>ちい</rt></ruby></span><span>Small kana</span></button>' +
          '<button class="pbtn" data-a="chart" title="The chart: every kana and kanji, by theme and by use, with search and practice (picking from it counts as assisted)">' + I('grid') + '<span>Chart</span></button>' +
          '<button class="pbtn" data-a="model" title="Show how to write it (counts as assisted)">' + I('eye') + '<span>How to write</span></button>' +
          '<label class="pad-script" title="What the pad reads. Kanji or kana adds every kanji in the game; choosing it or Either kana is remembered for the next questions."><span>Read as</span><select data-script-sel>' +
            '<option value="kanji">Kanji or kana</option><option value="any">Either kana</option><option value="hira">ひらがな</option><option value="kata">カタカナ</option></select></label>' +
        '</div>' +
      '</div>';
    // The composition ("your answer") line can live elsewhere, e.g. next to Submit.
    const comp = RB.ui.el('div', 'pad-compose');
    comp.innerHTML = '<div class="pad-lab" id="pad-line-lab">Your answer</div>' +
      '<div class="strip" role="group" aria-labelledby="pad-line-lab"></div>' +
      '<button class="pbtn pad-del" data-a="del" title="Remove the selected character">' + I('backspace') + '<span>Remove</span></button>';
    (opts.composeHost || el).appendChild(comp);
    host.appendChild(el);
    if (!opts.composeHost) el.insertBefore(comp, el.firstChild);
    const bg = el.querySelector('.pad-bg'), ink = el.querySelector('.pad-ink');
    const box = el.querySelector('.pad-box');
    const strip = comp.querySelector('.strip');
    const candsEl = el.querySelector('.cands');
    const readas = el.querySelector('.readas');
    const live = el.querySelector('.pad-inspect [aria-live]');
    // Practice addendum §4.2: "That is not what I wrote", even after a confident reading.
    // Its own row, present for the whole pace attempt, so the canvas never resizes.
    const misread = PH ? RB.ui.el('div', 'pad-repair', '<button class="pbtn" data-a="notwrote" disabled>' + I('unsure') + '<span>That is not what I wrote</span></button>') : null;
    if (misread) el.querySelector('.pad-inspect').appendChild(misread);
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
      // "Read as": the task's kana script (opts.script 'any' | 'hira' | 'kata'),
      // with kanji added in mode 'kanji'. opts.kanji: false for kana tasks,
      // true to start with kanji, otherwise the player's preference.
      kanaScript: ['hira', 'kata'].indexOf(opts.script) >= 0 ? opts.script : 'any',
      mode: 'any',
      list: [],         // the candidates in the order offered
      maxLen: opts.maxLen || 12,
      guide: opts.guide || null, // character to show faintly (copy mode)
      model: null,      // character whose numbered model is shown
      onChange: opts.onChange || (() => {}),
      onAssist: opts.onAssist || (() => {}),
      destroyed: false,
    };
    P.mode = opts.kanji !== false && (opts.kanji === true || kanjiPreferred()) ? 'kanji' : P.kanaScript;
    let dpr = 1;
    // Colours come from CSS so high contrast can change them.
    let C = { paper: '#fffaf0', ink: '#1c160e', guide: 'rgba(120,90,50,0.28)', edge: 'rgba(120,90,50,0.45)', model: 'rgba(168,62,39,0.38)', num: '#a83e27', hint: 'rgba(31,90,146,0.08)', ghost: 'rgba(76,64,48,0.2)' };
    function readColours() {
      const cs = getComputedStyle(el);
      const g = (k, d) => (cs.getPropertyValue(k) || '').trim() || d;
      C = { paper: g('--pad-paper', C.paper), ink: g('--pad-ink', C.ink), guide: g('--pad-guide', C.guide), edge: g('--pad-edge', C.edge), model: g('--pad-model', C.model), num: g('--pad-num', C.num), hint: g('--pad-hint', C.hint), ghost: g('--pad-ghost', C.ghost) };
    }

    function layout() {
      if (P.destroyed) return;
      const r = box.getBoundingClientRect();
      if (!r.width || !r.height) return;
      dpr = window.devicePixelRatio || 1;
      const w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
      readColours();
      if (bg.width !== w || bg.height !== h) {
        for (const c of [bg, ink]) { c.width = w; c.height = h; }
      }
      drawBg();
      redraw();
    }
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => layout()) : null;
    if (ro) ro.observe(box);
    window.addEventListener('resize', layout);
    const refit = () => requestAnimationFrame(() => fitAlts());
    window.addEventListener('resize', refit);

    function drawBg() {
      const c = bg.getContext('2d');
      const w = bg.width, h = bg.height;
      c.clearRect(0, 0, w, h);
      c.fillStyle = C.paper;
      c.fillRect(0, 0, w, h);
      // small-kana zone hint (lower-left quarter)
      if (P.small) {
        c.fillStyle = C.hint;
        c.fillRect(0, h / 2, w / 2, h / 2);
      }
      // faint quarter guides — the only marks on the writing surface
      c.strokeStyle = C.guide;
      c.lineWidth = Math.max(1, dpr);
      c.setLineDash([5 * dpr, 7 * dpr]);
      c.beginPath();
      c.moveTo(w / 2, 0); c.lineTo(w / 2, h);
      c.moveTo(0, h / 2); c.lineTo(w, h / 2);
      c.stroke();
      c.setLineDash([]);
      if (P.guide && RB.recog && RB.recog.reference(P.guide)) drawRef(c, RB.recog.reference(P.guide), w, C.ghost, false);
      if (P.model && RB.recog && RB.recog.reference(P.model)) drawRef(c, RB.recog.reference(P.model), w, C.model, true);
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
          c.fillStyle = C.num;
          c.font = '600 ' + Math.round(w / 15) + 'px sans-serif';
          c.fillText(String(i + 1), st[0].x * s + 4, st[0].y * s - 4);
        }
      });
    }
    function redraw() {
      const c = ink.getContext('2d');
      c.clearRect(0, 0, ink.width, ink.height);
      c.lineCap = 'round';
      c.lineJoin = 'round';
      c.strokeStyle = C.ink;
      c.lineWidth = Math.max(3, (ink.width / 36));
      const all = P.cur ? P.strokes.concat([P.cur]) : P.strokes;
      for (const st of all) {
        c.beginPath();
        st.forEach((p, i) => (i ? c.lineTo(p.x * ink.width, p.y * ink.height) : c.moveTo(p.x * ink.width, p.y * ink.height)));
        if (st.length === 1) c.lineTo(st[0].x * ink.width + 0.5, st[0].y * ink.height + 0.5);
        c.stroke();
      }
      el.classList.toggle('inked', P.strokes.length > 0);
    }
    function pos(e) {
      const r = ink.getBoundingClientRect();
      return { x: Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), y: Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)), t: Math.round(e.timeStamp || performance.now()) };
    }
    ink.addEventListener('pointerdown', (e) => {
      if (P.pointerId != null) return; // one stroke at a time
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      try { ink.setPointerCapture(e.pointerId); } catch (err) { /* synthetic pointers */ }
      P.pointerId = e.pointerId;
      P.cur = [pos(e)];
      if (PH) PH.stroke('down', e);
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
    const end = (e, cancelled, lost) => {
      if (e.pointerId !== P.pointerId) return;
      // a cancelled pointer or capture lost mid-stroke is unexpected; a normal release is not
      if (PH) PH.stroke(lost ? 'lost' : cancelled ? 'cancel' : 'up', e);
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
    ink.addEventListener('lostpointercapture', (e) => { if (P.pointerId === e.pointerId) end(e, false, true); });
    // Block page scroll/zoom gestures over the writing canvas only.
    for (const t of ['touchstart', 'touchmove']) ink.addEventListener(t, (e) => e.preventDefault(), { passive: false });
    ink.addEventListener('contextmenu', (e) => e.preventDefault());

    let recTimer = null;
    function schedule() {
      clearTimeout(recTimer);
      recTimer = setTimeout(recognize, 180);
    }
    function recognize() {
      if (P.destroyed) return;
      P.pick = null;
      if (!P.strokes.length) { P.result = null; renderRead(); return; }
      const strokes = P.strokes.map((s) => s.map((p) => ({ x: p.x * BOX, y: p.y * BOX, t: p.t })));
      try {
        const kanji = P.mode === 'kanji';
        if (PH) PH.busy(true); // input-blocked processing is left out of a pace, once
        P.result = RB.recog.recognize(strokes, { box: { w: BOX, h: BOX }, script: kanji ? P.kanaScript : P.mode, kanji, smallToggle: P.small });
      } catch (err) {
        P.result = { status: 'nonsense', candidates: [], notes: ['error'] };
        console.error(err);
      } finally {
        if (PH) PH.busy(false);
      }
      renderRead();
    }
    // What the recognizer read. The area keeps one height whatever it shows
    // (caption line + one row), so the canvas never resizes mid-character.
    function setRead(state, cap, big, small) {
      readas.setAttribute('data-state', state);
      el.setAttribute('data-read', state);
      const mark = state === 'unsure' || state === 'unread' || state === 'outside' ? I('unsure') : '';
      readas.innerHTML = '<span class="rd-cap">' + mark + '<span>' + cap + '</span></span>' +
        '<span class="big' + (big ? '' : ' none') + (small ? ' sm' : '') + '" lang="ja">' + (big ? glyph(big) + (small ? '<span class="cap" aria-hidden="true">small</span>' : '') : '<span class="sr">nothing yet</span>') + '</span>';
      live.textContent = readas.textContent.replace(/\s+/g, ' ').trim();
    }
    // the character written just before the one being written (for ロ/口 order)
    function prevChar() {
      const c = P.chars[(P.replace >= 0 ? P.replace : P.cursor) - 1];
      return c ? c.ch : '';
    }
    // the recognizer's candidates in the order offered (see twinFirst)
    function offered(r) {
      const list = r.candidates.slice();
      const g = list.length && P.mode === 'kanji' && RB.recog.sameShape ? RB.recog.sameShape(list[0].ch) : null;
      if (!g || list.filter((c) => g.indexOf(c.ch) >= 0).length < 2) return list;
      const i = list.findIndex((c) => c.ch === twinFirst(g, prevChar()));
      if (i > 0) list.unshift(list.splice(i, 1)[0]);
      return list;
    }
    const twinOf = (a, b) => !!(a && b && a !== b && RB.recog.sameShape && (RB.recog.sameShape(a) || []).indexOf(b) >= 0);
    const button = (a, icon, label) => { const b = RB.ui.el('button', 'pbtn rd-act', I(icon) + '<span>' + label + '</span>'); b.setAttribute('data-a', a); return b; };
    function renderRead() {
      const r = P.result;
      const conf = el.querySelector('[data-a=confirm]');
      candsEl.innerHTML = '';
      P.list = [];
      if (PH) {
        // while a pace is stopped for review, one press inserts the character and continues
        conf.lastChild.textContent = PH.reviewing() ? 'Confirm character & continue' : 'Confirm';
        misread.firstChild.disabled = !(r && r.status !== 'empty' && P.strokes.length);
      }
      if (!r || r.status === 'empty') {
        setRead(P.strokes.length ? 'wait' : 'empty', P.strokes.length ? 'Reading…' : emptyCaption(), '');
        conf.disabled = true;
        return;
      }
      // Outside what the pad reads: a kanji while kanji reading is off, or a
      // kanji-like drawing nothing matches well. Say so; no unrelated kana
      // guesses. With kanji reading on, every kanji in the game is known, so
      // the closest kanji are offered to choose from (the drawing may still
      // be a kanji outside the game, or a hard one to read).
      if ((r.kanjiHint || r.kanjiLike) && !P.pick) {
        const off = P.mode !== 'kanji';
        const near = !off && r.kanjiLike && r.candidates.length ? r.candidates.filter((cd) => isKanji(cd.ch)).slice(0, 4) : [];
        if (r.kanjiHint) {
          setRead('outside', 'Looks like the kanji <span lang="ja">' + glyph(r.kanjiHint.ch) + '</span>, but kanji reading is off.', '');
        } else if (near.length) {
          setRead('outside', '<b>Not sure</b> — pick the kanji you meant, if it is here, or look it up in the chart.', '');
        } else {
          setRead('outside', off ? '<b>Looks like a kanji</b>, and kanji reading is off. Try it, or write the word in kana.' : '<b>Looks like a kanji the pad doesn\'t know.</b> Write the word in kana.', '');
        }
        if (off) candsEl.appendChild(button('kanji', 'pieces', 'Read kanji too'));
        if (r.kanjiHint && r.candidates.length) {
          // the kana it could also be, if a kana was meant
          candsEl.appendChild(RB.ui.el('span', 'or', 'or'));
          r.candidates.slice(0, 4).forEach((cd) => candsEl.appendChild(candButton(cd)));
        }
        near.forEach((cd) => candsEl.appendChild(candButton(cd)));
        if (!r.kanjiHint) candsEl.appendChild(button('chart', 'grid', 'Chart'));
        conf.disabled = true;
        fitAlts();
        RB.audio && RB.audio.sfx('recog_unsure', { vol: 0.5 });
        return;
      }
      if (r.status === 'nonsense' || !r.candidates.length) {
        setRead('unread', '<b>I can\'t read that clearly yet</b> — try again.', '');
        candsEl.appendChild(button('chart', 'grid', 'Chart'));
        conf.disabled = true;
        RB.audio && RB.audio.sfx('recog_unsure', { vol: 0.5 });
        return;
      }
      P.list = offered(r);
      const first = P.list[0].ch;
      const top = P.pick || first;
      const uncertain = r.status === 'uncertain' && !P.pick;
      const topSmall = SMALL.indexOf(top) >= 0;
      const chose = P.pick && P.pick !== first && !twinOf(first, P.pick);
      // a small drawing only matters when a small kana is among the readings
      const smallAlt = P.list.some((cd) => cd.ch !== top && SMALL.indexOf(cd.ch) >= 0);
      const small = r.sizeHint === 'small' && !P.small && !topSmall && smallAlt && !isKanji(top) ? ' <span class="rd-hint">(drawn small: the small kana is in the list)</span>' : '';
      const twin = P.list.some((cd) => twinOf(top, cd.ch));
      const kind = twin ? (isKanji(top) ? ' the kanji' : top === 'ー' ? ' the long-vowel mark' : RB.kana.isKata(top) ? ' katakana' : ' hiragana') : topSmall ? ' a small kana' : '';
      setRead(uncertain ? 'unsure' : 'sure',
        (uncertain ? '<b>Not sure</b> — pick the one you meant' : chose ? 'You chose' : 'I read this as' + kind) + small, top, topSmall);
      // the other readings, so a different one can be chosen (counts as
      // assisted, except the other character of the same shape)
      const seen = new Set([top]);
      const alts = P.list.slice(0, 6).filter((cd) => !seen.has(cd.ch) && seen.add(cd.ch));
      if (alts.length) candsEl.appendChild(RB.ui.el('span', 'or', 'or'));
      alts.forEach((cd) => candsEl.appendChild(candButton(cd, twinOf(top, cd.ch))));
      conf.disabled = false;
      fitAlts();
      RB.audio && RB.audio.sfx(uncertain ? 'recog_unsure' : 'recog_ok', { vol: 0.4 });
    }
    function candButton(cd, twin) {
      const small = SMALL.indexOf(cd.ch) >= 0; // small kana look like their full-size twins: say so
      const cap = small ? 'small' : !twin ? '' : isKanji(cd.ch) ? 'kanji' : cd.ch === 'ー' ? 'long' : RB.kana.isKata(cd.ch) ? 'katakana' : 'hiragana';
      const b = RB.ui.el('button', 'cand' + (cap ? ' sm' : ''), glyph(cd.ch) + (cap ? '<span class="cap" aria-hidden="true">' + cap + '</span>' : ''));
      b.setAttribute('lang', 'ja');
      b.setAttribute('aria-label', 'I meant ' + (small ? 'small ' : '') + spoken(cd.ch) + (twin ? ', the same shape' : ''));
      b.title = twin ? 'The same shape as a different character: choose the one you meant' : 'Similarity ' + Math.round(cd.score * 100) + '% (a match score, not a probability)';
      b.onclick = () => { P.pick = cd.ch; if (PH) PH.review('candidate'); renderRead(); };
      return b;
    }
    // Show as many other readings as fit on the row beside Confirm (the rest
    // stay reachable through the chart), so the row never wraps.
    function fitAlts() {
      const bs = Array.from(candsEl.querySelectorAll('.cand'));
      bs.forEach((b) => (b.hidden = false));
      const conf = el.querySelector('[data-a=confirm]');
      const big = readas.querySelector('.big');
      if (!big || !conf.offsetParent) return;
      for (let i = bs.length - 1; i >= 0 && conf.offsetTop > big.offsetTop + 4; i--) bs[i].hidden = true;
      const or = candsEl.querySelector('.or');
      if (or) or.hidden = !bs.some((b) => !b.hidden);
    }
    function emptyCaption() {
      const orderNotes = P.chars.map((c) => c.order).filter((o) => o && o.confident && o.issues && o.issues.length);
      if (P.replace >= 0) return 'Write the replacement for <span lang="ja">' + glyph(P.chars[P.replace].ch) + '</span>, then Confirm.';
      if (orderNotes.length && P.chars.length) return esc('Stroke order: ' + orderNotes[orderNotes.length - 1].issues.map((i) => i.en).join(' '));
      if (P.chars.length && P.maxLen > 1) return 'Write the next one, or tap a character in your answer to fix it.';
      return 'Write one character in the box.';
    }

    function confirm() {
      const r = P.result;
      if (!r || !r.candidates.length || ((r.kanjiHint || r.kanjiLike) && !P.pick)) return;
      const top = (P.list.length ? P.list : offered(r))[0].ch;
      const ch = P.pick || top;
      const assisted = !!(P.pick && P.pick !== top && !twinOf(top, P.pick));
      const entry = { ch, assisted, uncertain: r.status === 'uncertain', strokes: P.strokes.slice() };
      if (RB.game.settings.strokePractice && RB.recog.strokeOrderFeedback && !assisted) {
        const strokes = P.strokes.map((s) => s.map((p) => ({ x: p.x * BOX, y: p.y * BOX, t: p.t })));
        try { entry.order = RB.recog.strokeOrderFeedback(strokes, ch, { box: { w: BOX, h: BOX } }); } catch (e) { entry.order = null; }
      }
      put(entry);
      if (assisted) P.onAssist('correction');
      if (PH) PH.confirmed();
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
      if (P.model) { P.model = null; drawBg(); }
      redraw();
      renderRead();
    }
    function renderStrip() {
      strip.innerHTML = '';
      const gap = (i) => {
        const g = RB.ui.el('button', 'cell ins' + (P.cursor === i && P.replace < 0 ? ' cur' : ''), '');
        g.setAttribute('aria-label', 'Insert here' + (i === P.chars.length ? ' (end)' : ' before ' + P.chars[i].ch));
        g.onclick = () => { P.cursor = i; P.replace = -1; renderStrip(); };
        return g;
      };
      if (opts.before) strip.appendChild(RB.ui.el('span', 'fixed', esc(opts.before)));
      for (let i = 0; i <= P.chars.length; i++) {
        if (P.maxLen > 1) strip.appendChild(gap(i));
        if (i < P.chars.length) {
          const c = P.chars[i];
          const b = RB.ui.el('button', 'cell' + (P.replace === i ? ' cur' : '') + (c.assisted ? ' asst' : '') + (c.uncertain && !c.assisted ? ' unsure' : ''), glyph(c.ch));
          b.setAttribute('lang', 'ja');
          b.setAttribute('aria-pressed', String(P.replace === i));
          b.title = (c.assisted ? 'Chosen by hand (assisted). ' : c.uncertain ? 'The recognizer was not sure about this one. ' : '') + 'Tap to rewrite this character';
          b.onclick = () => { P.replace = P.replace === i ? -1 : i; renderStrip(); };
          strip.appendChild(b);
        }
      }
      if (P.maxLen === 1 && !P.chars.length) strip.appendChild(RB.ui.el('span', 'cell slot cur', '<span class="sr">empty</span>'));
      if (!P.chars.length) strip.appendChild(RB.ui.el('span', 'ph', 'Your answer'));
      if (opts.after) strip.appendChild(RB.ui.el('span', 'fixed', esc(opts.after)));
      comp.classList.toggle('has-chars', P.chars.length > 0);
      comp.querySelector('[data-a=del]').disabled = !P.chars.length;
      if (!P.strokes.length && !P.result) renderRead();
    }
    // The chart (RB.kanjiChart): every kana and kanji, by theme and by use,
    // with search. Picking a character puts it in the answer (assisted);
    // opening a kanji's entry or practising it counts as help, like How to
    // write. Kanji go into the answer only while the pad reads kanji.
    function chart() {
      const kana = P.mode === 'kanji' ? P.kanaScript : P.mode;
      RB.kanjiChart.open({
        mode: 'pick', kana, kanjiOn: P.mode === 'kanji',
        onPick: (ch) => { put({ ch, assisted: true, manual: true }); P.onAssist('chart'); clearInk(); },
        onLook: () => P.onAssist('chart'),
      });
    }
    function showModel(ch) {
      if (!ch || !RB.recog.reference(ch)) { RB.ui.notice('No stroke reference is available for that character.', 'info'); return; }
      P.model = ch;
      drawBg();
      P.onAssist('model');
    }
    function remove() {
      const i = P.replace >= 0 ? P.replace : P.cursor - 1;
      if (i >= 0 && i < P.chars.length) { P.chars.splice(i, 1); P.cursor = i; P.replace = -1; renderStrip(); P.onChange(); }
    }

    const onClick = (e) => {
      const b = e.target.closest('[data-a]');
      if (!b || b.disabled) return;
      const a = b.getAttribute('data-a');
      if (a === 'undo') { P.strokes.pop(); redraw(); schedule(); }
      if (a === 'clear') clearInk();
      if (a === 'small') { P.small = !P.small; b.classList.toggle('on', P.small); b.setAttribute('aria-pressed', String(P.small)); el.querySelector('.more-on').hidden = !P.small; drawBg(); if (P.strokes.length) recognize(); }
      if (a === 'more') { const open = b.getAttribute('aria-expanded') !== 'true'; b.setAttribute('aria-expanded', String(open)); el.classList.toggle('more-open', open); }
      if (a === 'confirm') confirm();
      if (a === 'del') remove();
      if (a === 'chart') chart();
      if (a === 'kanji') setMode('kanji', true);
      if (a === 'model') opts.modelFor && showModel(opts.modelFor());
      if (a === 'notwrote' && PH) {
        // recognition repair: stops a pace, costs nothing, never a Japanese mistake
        PH.review('repair');
        renderRead();
        live.textContent = 'Choose the character you meant, write it again, or pick it from the chart. This does not count against you.';
      }
    };
    el.addEventListener('click', onClick);
    if (opts.composeHost) comp.addEventListener('click', onClick);
    const sel = el.querySelector('[data-script-sel]');
    function setMode(m, remember) {
      if (MODES.indexOf(m) < 0) return;
      P.mode = m;
      sel.value = m;
      if (remember && (m === 'kanji' || m === 'any')) rememberKanji(m === 'kanji');
      if (m === 'kanji' && RB.recog.warm) RB.recog.warm();
      if (P.strokes.length) recognize();
    }
    sel.value = P.mode;
    sel.onchange = () => setMode(sel.value, true);
    // prepare the kanji templates in idle moments, before the first kanji is written
    if (P.mode === 'kanji' && RB.recog.warm) RB.recog.warm();
    renderStrip();
    renderRead();
    requestAnimationFrame(layout);

    return {
      el, compose: comp,
      text() { return P.chars.map((c) => c.ch).join(''); },
      meta() {
        return {
          assisted: P.chars.some((c) => c.assisted),
          uncertain: P.chars.some((c) => c.uncertain),
          count: P.chars.length,
        };
      },
      hasPending() { return P.strokes.length > 0; },
      strokeActive() { return P.pointerId != null; },
      confirmPending() { if (P.result && P.result.candidates && P.result.candidates.length) confirm(); },
      reset() { P.chars = []; P.cursor = 0; P.replace = -1; clearInk(); renderStrip(); },
      remove,
      setGuide(ch) { P.guide = ch; drawBg(); },
      layout,
      destroy() { P.destroyed = true; clearTimeout(recTimer); if (ro) ro.disconnect(); window.removeEventListener('resize', layout); window.removeEventListener('resize', refit); el.remove(); comp.remove(); },
      mode() { return P.mode; },
      setMode(m) { setMode(m, false); },
      _state: P,
      _inject(strokes) { P.strokes = strokes; redraw(); recognize(); }, // tests: inject strokes in 0..1 units
    };
  }
  const api = { create(host, opts) { const p = create(host, opts); api.__last = p; return p; }, BOX, kanjiPreferred, twinFirst };
  return api;
})();
