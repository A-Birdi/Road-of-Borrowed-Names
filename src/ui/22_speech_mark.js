/* Spoken-word highlighting (PT-1c: a new learner asked that "when the voiced lines are spoken, highlight the spoken
 * word in Japanese and the English counterpart(s) in the sentence prominently").
 *
 * While a dialogue line is spoken, the word being said is marked in the Japanese line, and the English words that
 * render it (RB.jp.speech.align) are marked in the translation when it shows. The position comes from the voice
 * itself when it reports one (a speech "boundary" event: a character offset into what it speaks); a voice that
 * reports none is followed by an estimate from each word's beats (RB.jp.speech.timeline), and a recording can be
 * followed the same way, scaled to its length (follow()). Settings › Sound › "Highlight each word as it is spoken"
 * (settings.voice.highlight; older records lack it: On). Only classes change: no motion, nothing announced, nothing
 * saved.
 *
 *   RB.ui.speechMark.begin(box, line, spoken) → { start(), at(charIndex), follow(getTime, duration), end() } | null
 *   RB.ui.speechMark.stop()  clears any mark (a new line, the box hidden)
 *   RB.ui.speechMark.explain(wordEl, i)  what a word does in its line, for word help (AG-1)
 * Pointing at a word marks its counterpart in the other language (LI-9; the same setting, the same pairs).
 * AG-1: the pairs are relations (RB.jp.speech.align rels): a relation may join several Japanese words (行かなければ
 * ならない "must") and an English word may belong to more than one, part by part (私 and です share "I'm"). Pointing
 * at either side marks every relation it belongs to, all its words, in its colour (amber for a word's meaning, blue for
 * grammar). While a voice speaks, the spoken word's relations are marked the same way (.spk, .spk2): one set of
 * relations for both, decided once (the spoken mark keeps the line; pointing waits until it ends, as before). */
var RB = (globalThis.RB = globalThis.RB || {});
RB.ui = RB.ui || {};

RB.ui.speechMark = (function () {
  'use strict';
  let cur = null;
  const S = () => RB.jp && RB.jp.speech;
  const on = () => !(RB.game.settings && RB.game.settings.voice && RB.game.settings.voice.highlight === false);

  function clear(root) {
    (root || document).querySelectorAll('.spk, .spk2').forEach((e) => e.classList.remove('spk', 'spk2'));
  }
  // the relations of a shown line: its displayed words, its English as shown (the player's name in it), its dialect
  function alignFor(tokens, line, ctx) {
    const en = RB.game.s && RB.script.enVars ? RB.script.enVars(line.en || '') : line.en || '';
    const look = ctx && ctx.dia && RB.dialect ? (t, i) => RB.dialect.lookupIn(tokens, i) || RB.jp.lookup(t) : null;
    const name = RB.game.s && RB.game.s.player ? RB.game.s.player.name : null;
    return S().align(tokens, en, { lookup: look, name, dia: ctx && ctx.dia ? ctx.dia : null });
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
    const st = {
      box, tokens,
      offs: S().offsets(tokens, String(spoken || '')),
      tl: S().timeline(tokens, (RB.game.settings.voice && RB.game.settings.voice.rate) || 1),
      al: alignFor(tokens, line, ctx),
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
      // the spoken word's relations: its meaning's English strongly (.spk), what its grammar says lighter (.spk2)
      const rs = (st.al.rels || []).filter((r) => r.jp.includes(i));
      if (rs.length) {
        const enEl = box.querySelector('.main .enline, .sub .enline');
        if (enEl) {
          wrapEnglish(enEl);
          for (const r of rs) for (const k of r.en) { const w = enEl.querySelector('.ew[data-w="' + k + '"]'); if (w) w.classList.add(r.tier === 'word' ? 'spk' : 'spk2'); }
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
      // (an estimate: each word's beats from its reading, stretched to the recording's length; a recording's own word
      // timings, if they are ever measured from the audio, would replace it without recording anything again)
      follow(getTime, duration) {
        if (cur !== st) return;
        clearTimeout(st.timer);
        cancelAnimationFrame(st.raf);
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
  // ---- pointing at a word (LI-9, Robin 2026-10-16: "hovering over a word in a sentence should highlight its translated
  // counterpart where applicable if the Highlight setting is On"): a Japanese word under the pointer (or focused) marks
  // the English words that render it, and an English word marks its Japanese word; nothing where there is no pair
  // (particles, endings, words the English does not name). The same pairs as the spoken mark; only classes change.
  let hov = null; // { src, box, al, byTok: { tokenIndex: [relation] }, byWord: { englishIndex: [relation] } }
  function pairsFor(box) {
    const jl = box.querySelector(LINE_SEL);
    if (!jl || !S() || !RB.ui.help || !RB.ui.help.tokensOf) return null;
    const src = +jl.dataset.src;
    if (hov && hov.src === src && hov.box === box) return hov;
    const tokens = RB.ui.help.tokensOf(src);
    const line = RB.ui.dialogue && RB.ui.dialogue.shown ? RB.ui.dialogue.shown() : null;
    if (!tokens || !line) return null;
    const al = alignFor(tokens, line, RB.ui.help.ctxOf ? RB.ui.help.ctxOf(src) : null);
    // every relation each word belongs to, on both sides (an English word may be in two: "I'm" for 私 and です)
    const byTok = {}, byWord = {};
    for (const r of al.rels || []) {
      for (const i of r.jp) (byTok[i] || (byTok[i] = [])).push(r);
      for (const k of r.en) (byWord[k] || (byWord[k] = [])).push(r);
    }
    hov = { src, box, al, byTok, byWord, tokens };
    return hov;
  }
  const LINE_SEL = '.main .jline[data-src], .sub .jline[data-src]';
  // (.hov a word's counterpart, amber; .hov2 a grammar counterpart, blue and dotted: LI-12)
  function hovClear(box) { (box || document).querySelectorAll('.hov, .hov2').forEach((e) => e.classList.remove('hov', 'hov2')); }
  function hovAt(target) {
    if (!on() || cur) return; // (the spoken mark has the line while a voice speaks)
    const box = target.closest && target.closest('.dlg');
    if (!box) return;
    const p = pairsFor(box);
    if (!p) return;
    hovClear(box);
    const enEl = box.querySelector('.main .enline, .sub .enline');
    const jl = box.querySelector(LINE_SEL);
    if (!enEl || !jl) return;
    // mark relations: every Japanese and English word in each, in its colour (a word in both kinds shows its meaning's)
    const markAll = (rs) => {
      wrapEnglish(enEl);
      const cls = (r) => (r.tier === 'word' ? 'hov' : 'hov2');
      const put = (el, c) => { if (el && !(c === 'hov2' && el.classList.contains('hov'))) { if (c === 'hov') el.classList.remove('hov2'); el.classList.add(c); } };
      for (const r of rs.filter((x) => x.tier !== 'word').concat(rs.filter((x) => x.tier === 'word'))) {
        for (const k of r.en) put(enEl.querySelector('.ew[data-w="' + k + '"]'), cls(r));
        for (const i of r.jp) jl.querySelectorAll('.jt[data-i="' + i + '"]').forEach((e) => put(e, cls(r)));
      }
    };
    const jt = target.closest('.jline[data-src] .jt[data-i]');
    if (jt && jt.closest(LINE_SEL)) {
      const rs = p.byTok[+jt.dataset.i] || [];
      if (rs.length) markAll(rs);
      return;
    }
    const ew = target.closest('.ew[data-w]');
    if (ew && enEl.contains(ew)) {
      const rs = p.byWord[+ew.dataset.w] || [];
      if (rs.length) markAll(rs);
    }
  }
  // what a word does in its line, for word help (AG-1): the construction or relation it is part of, what its grammar
  // does when the English has no word for it, or that its role was not worked out. Null outside a dialogue line.
  function explain(el, i) {
    const box = el && el.closest && el.closest('.dlg');
    if (!box || !el.closest(LINE_SEL)) return null;
    const p = pairsFor(box);
    if (!p) return null;
    const out = [];
    const words = (r) => r.en.map((k) => p.al.words[k].text).join(' ');
    for (const r of p.byTok[i] || []) {
      if (!r.label) continue;
      const others = r.jp.filter((x) => x !== i).map((x) => (p.tokens[x] ? p.tokens[x].surface : '')).filter(Boolean);
      out.push({ kind: 'relation', text: r.label + (others.length ? ', with ' + others.join(' ') : '') + '. Here: "' + words(r) + '".' });
    }
    for (const n of (p.al.notes || [])[i] || []) out.push({ kind: n.kind, text: n.text });
    return out.length ? out : null;
  }
  if (typeof document !== 'undefined') {
    document.addEventListener('pointerover', (e) => { if (e.target && e.target.closest && e.target.closest('.dlg')) hovAt(e.target); });
    document.addEventListener('pointerout', (e) => { const box = e.target && e.target.closest && e.target.closest('.dlg'); if (box && !(e.relatedTarget && box.contains(e.relatedTarget) && (e.relatedTarget.closest('.jt[data-i], .ew[data-w]')))) hovClear(box); });
    document.addEventListener('focusin', (e) => { if (e.target && e.target.closest && e.target.closest('.dlg .jt[data-i]')) hovAt(e.target); });
    document.addEventListener('focusout', (e) => { const box = e.target && e.target.closest && e.target.closest('.dlg'); if (box) hovClear(box); });
    // the English words become pointable as soon as a line shows (wrapped in spans the same way the spoken mark does)
    document.addEventListener('pointerenter', (e) => { const en = e.target && e.target.closest && e.target.closest('.dlg .main .enline, .dlg .sub .enline'); if (en && on()) wrapEnglish(en); }, true);
  }
  return { begin, stop, active: () => !!cur, wrapEnglish, pairsFor, explain };
})();
