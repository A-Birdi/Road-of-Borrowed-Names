/* Spoken-word highlighting (PT-1c: a new learner asked that "when the voiced lines are spoken, highlight the spoken
 * word in Japanese and the English counterpart(s) in the sentence prominently").
 *
 * While a dialogue line is spoken, the word being said is marked in the Japanese line, and the English words that
 * render it (RB.jp.speech.align) are marked in the translation when it shows. The position comes from the voice
 * itself when it reports one (a speech "boundary" event: a character offset into what it speaks); a voice that
 * reports none is followed by an estimate from each word's beats (RB.jp.speech.timeline), and a recording can be
 * followed the same way, scaled to its length (follow()). Settings › Audio › "Highlight each word as it is spoken"
 * (settings.voice.highlight; older records lack it: On). Only classes change: no motion, nothing announced, nothing
 * saved.
 *
 *   RB.ui.speechMark.begin(box, line, spoken) → { start(), at(charIndex), follow(getTime, duration), end() } | null
 *   RB.ui.speechMark.stop()  clears any mark (a new line, the box hidden) */
var RB = (globalThis.RB = globalThis.RB || {});
RB.ui = RB.ui || {};

RB.ui.speechMark = (function () {
  'use strict';
  let cur = null;
  const S = () => RB.jp && RB.jp.speech;
  const on = () => !(RB.game.settings && RB.game.settings.voice && RB.game.settings.voice.highlight === false);

  function clear(root) {
    (root || document).querySelectorAll('.spk').forEach((e) => e.classList.remove('spk'));
  }
  // the English line's words as spans, numbered like RB.jp.speech.enWords (the same pattern over the same text)
  function wrapEnglish(el) {
    if (!el || el.querySelector('.ew')) return;
    const re = /[A-Za-z0-9\u00C0-\u024F'\u2019]+(?:-[A-Za-z0-9\u00C0-\u024F'\u2019]+)*/g;
    let n = 0;
    const walk = (node) => {
      for (const c of Array.from(node.childNodes)) {
        if (c.nodeType === 3) {
          const t = c.nodeValue;
          let m, last = 0;
          const frag = document.createDocumentFragment();
          re.lastIndex = 0;
          while ((m = re.exec(t))) {
            if (m.index > last) frag.appendChild(document.createTextNode(t.slice(last, m.index)));
            const s = document.createElement('span');
            s.className = 'ew';
            s.dataset.w = String(n++);
            s.textContent = m[0];
            frag.appendChild(s);
            last = m.index + m[0].length;
          }
          if (last < t.length) frag.appendChild(document.createTextNode(t.slice(last)));
          c.replaceWith(frag);
        } else if (c.nodeType === 1) walk(c);
      }
    };
    walk(el);
  }

  function begin(box, line, spoken) {
    stop();
    if (!on() || !box || !line || !line.jp || !S()) return null;
    // the spoken line, in the main text or the second line (not the speaker's name above it)
    const LINE = '.main .jline[data-src], .sub .jline[data-src]';
    const jl = box.querySelector(LINE);
    const tokens = jl && RB.ui.help.tokensOf ? RB.ui.help.tokensOf(+jl.dataset.src) : null;
    if (!tokens) return null;
    const ctx = RB.ui.help.ctxOf ? RB.ui.help.ctxOf(+jl.dataset.src) : null;
    const en = RB.game.s && RB.script.enVars ? RB.script.enVars(line.en || '') : line.en || '';
    const look = ctx && ctx.dia && RB.dialect ? (t, i) => RB.dialect.lookupIn(tokens, i) || RB.jp.lookup(t) : null;
    const name = RB.game.s && RB.game.s.player ? RB.game.s.player.name : null;
    const st = {
      box, tokens,
      offs: S().offsets(tokens, String(spoken || '')),
      tl: S().timeline(tokens, (RB.game.settings.voice && RB.game.settings.voice.rate) || 1),
      al: S().align(tokens, en, { lookup: look, name }),
      shown: null, events: false, t0: 0, raf: 0, timer: 0, follow: null,
    };
    cur = st;
    const show = (i) => {
      if (cur !== st || i === st.shown) return;
      st.shown = i;
      clear(box);
      if (i == null) return;
      const line = box.querySelector(LINE);
      if (line) line.querySelectorAll('.jt[data-i="' + i + '"]').forEach((e) => e.classList.add('spk'));
      const ws = st.al.map[i] || [];
      if (ws.length) {
        const enEl = box.querySelector('.main .enline, .sub .enline');
        if (enEl) {
          wrapEnglish(enEl);
          for (const k of ws) { const w = enEl.querySelector('.ew[data-w="' + k + '"]'); if (w) w.classList.add('spk'); }
        }
      }
    };
    const byTime = (t, scale) => {
      let i = null;
      for (const it of st.tl.items) { if (it.at * scale <= t) i = it.i; else break; }
      return i;
    };
    const loop = () => {
      if (cur !== st || st.events) return;
      if (st.follow) {
        const t = st.follow.get();
        show(byTime(t, st.follow.duration && st.tl.total ? st.follow.duration / st.tl.total : 1));
      } else show(byTime((performance.now() - st.t0) / 1000, 1));
      st.raf = requestAnimationFrame(loop);
    };
    return {
      start() {
        if (cur !== st) return;
        st.t0 = performance.now();
        show(st.tl.items.length ? st.tl.items[0].i : null);
        // a voice that reports its position does so at once; one that does not is followed by the estimate
        st.timer = setTimeout(() => { if (cur === st && !st.events) loop(); }, 300);
      },
      at(ci) {
        if (cur !== st) return;
        st.events = true;
        cancelAnimationFrame(st.raf);
        show(S().tokenAt(st.offs, ci));
      },
      // a recording: follow its clock, the estimate stretched to its length
      follow(getTime, duration) {
        if (cur !== st) return;
        st.follow = { get: getTime, duration };
        st.events = false;
        loop();
      },
      end() { if (cur === st) stop(); },
    };
  }
  function stop() {
    if (!cur) return;
    cancelAnimationFrame(cur.raf);
    clearTimeout(cur.timer);
    clear(cur.box);
    cur = null;
  }
  return { begin, stop, active: () => !!cur, wrapEnglish };
})();
