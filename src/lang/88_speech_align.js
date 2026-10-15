/* RB.jp.speech — which word a spoken line is on, and its English counterpart (PT-1c: a new learner asked that "when
 * the voiced lines are spoken, highlight the spoken word in Japanese and the English counterpart(s) in the sentence").
 *
 *   offsets(tokens, spoken)   where each token's reading sits in the text a voice speaks (RB.jp.reading of the line:
 *                             the tokens' readings in order, which every line in the game satisfies)
 *   tokenAt(offs, charIndex)  the token a voice's position (a speech "boundary" event) falls in
 *   timeline(tokens, rate)    an estimate of when each token starts, in seconds, from its beats (morae) and the pauses
 *                             of its punctuation: used when a voice gives no positions (and scalable to a recording's
 *                             length)
 *   enWords(en)               the words of an English line, with their places in the text
 *   align(tokens, en, opts)   for each token, the English words that render it, or none: a content word whose
 *                             dictionary meaning names a word of the English line (stems compared), one English word per
 *                             token, the nearer in the sentence where two could match. Particles, endings and words
 *                             whose meaning the English does not name get none: an honest blank, never a guess.
 * Pure functions (no DOM): src/ui/22_speech_mark.js shows them; tests/unit/speech_align.test.mjs holds them. */
var RB = (globalThis.RB = globalThis.RB || {});
RB.jp = RB.jp || {};

RB.jp.speech = (function () {
  'use strict';
  function offsets(tokens, spoken) {
    const out = [];
    let cur = 0;
    tokens.forEach((t, i) => {
      if (!t || t.punct) return;
      const rd = String(t.reading || t.surface || '');
      if (!rd.trim()) return;
      const at = spoken.indexOf(rd, cur);
      if (at < 0) return;
      out.push({ i, start: at, end: at + rd.length });
      cur = at + rd.length;
    });
    return out;
  }
  function tokenAt(offs, ci) {
    let best = null;
    for (const o of offs) { if (o.start <= ci) best = o; else break; }
    return best ? best.i : null;
  }
  const SMALL = 'ゃゅょぁぃぅぇぉゎャュョァィゥェォヮ';
  const beats = (rd) => [...String(rd || '')].filter((c) => /[\u3041-\u30FC]/.test(c) && SMALL.indexOf(c) < 0).length;
  // about 7.5 beats a second at rate 1 (a measured average of Japanese device voices); a comma, a full stop and an
  // ellipsis add a pause (a slower voice pauses longer too)
  function timeline(tokens, rate) {
    const per = 1 / (7.5 * (rate || 1));
    let t = 0;
    const out = [];
    tokens.forEach((tk, i) => {
      if (!tk) return;
      if (tk.punct) {
        const s = String(tk.surface || '');
        t += (/…|‥/.test(s) ? 0.4 : /[。！？!?]/.test(s) ? 0.35 : /[、，,]/.test(s) ? 0.2 : 0) / (rate || 1);
        return;
      }
      const n = beats(tk.reading || tk.surface);
      if (!n) return;
      out.push({ i, at: t, dur: n * per });
      t += n * per;
    });
    return { items: out, total: t };
  }

  // ---- English ----------------------------------------------------------------------------------------------------
  const WORD = /[A-Za-z0-9\u00C0-\u024F'\u2019]+(?:-[A-Za-z0-9\u00C0-\u024F'\u2019]+)*/g;
  const fold = (w) => w.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  function stem(w) {
    let s = fold(String(w)).toLowerCase().replace(/[’']s$/, '').replace(/[^a-z0-9]/g, '');
    if (s.length > 4) s = s.replace(/ies$/, 'y').replace(/ied$/, 'y');
    if (s.length > 4) s = s.replace(/(ing|ed|es|ly)$/, '');
    if (s.length > 6) s = s.replace(/(er|or)$/, ''); // a doer: traveller, performer, teacher (not letter, corner)
    if (s.length > 3) s = s.replace(/s$/, '');
    return s.replace(/(.)\1$/, '$1');
  }
  function enWords(en) {
    const out = [];
    const text = String(en || '');
    let m;
    WORD.lastIndex = 0;
    while ((m = WORD.exec(text))) out.push({ text: m[0], start: m.index, end: m.index + m[0].length, stems: m[0].split('-').map(stem).filter(Boolean) });
    return out;
  }
  // words a meaning shares with too many sentences to point at anything
  const STOP = new Set(('the a an to of be is it in on at for and or one do that this with as by up out so not no i you me my we he she ' +
    'they them his her its your our their there here have has get go come some something someone thing way time what who how just ' +
    'very more most into from about all any eg etc oneself somebody sth sb make take give put').split(' '));
  function meaningStems(m) {
    return String(m || '').replace(/\([^)]*\)/g, ' ').replace(/\[[^\]]*\]/g, ' ').split(/[;,/]|\bor\b/)
      .flatMap((p) => p.trim().split(/[\s-]+/)).map(stem).filter((w) => w && w.length > 1 && !STOP.has(w));
  }
  const FUNCTION_POS = /^(prt|aux|cop|conj|suf|pref)/;
  function align(tokens, en, opts) {
    opts = opts || {};
    const words = enWords(en);
    const map = tokens.map(() => []);
    if (!words.length) return { words, map };
    const look = opts.lookup || ((t) => (RB.jp.lookup ? RB.jp.lookup(t) : null));
    const nameStems = opts.name ? String(opts.name).split(/[\s-]+/).map(stem).filter(Boolean) : [];
    const total = tokens.reduce((n, t) => n + String((t && t.surface) || '').length, 0) || 1;
    const cands = [];
    let pos = 0;
    tokens.forEach((t, i) => {
      const here = pos / total;
      pos += String((t && t.surface) || '').length;
      if (!t || t.punct) return;
      let want = [];
      if (t.ph) want = nameStems; // the player's name, in the English as it is shown
      else {
        let r = null;
        try { r = look(t, i); } catch (e) { r = null; }
        const e = r && r.entry;
        if (!e || r.unknown || FUNCTION_POS.test(e.pos || '')) return;
        want = meaningStems(e.m).concat(r.gloss ? meaningStems(r.gloss) : []);
      }
      if (!want.length) return;
      const set = new Set(want);
      const hits = [];
      words.forEach((w, k) => { if (w.stems.some((s) => s.length > 1 && set.has(s))) hits.push(k); });
      if (hits.length) cands.push({ i, here, hits });
    });
    // the most certain first (fewest candidates), each English word used once, the nearer in the sentence preferred
    const used = new Set();
    cands.sort((a, b) => a.hits.length - b.hits.length || a.i - b.i);
    for (const c of cands) {
      const free = c.hits.filter((k) => !used.has(k));
      if (!free.length) continue;
      const rel = (k) => (words.length > 1 ? k / (words.length - 1) : 0);
      free.sort((a, b) => Math.abs(rel(a) - c.here) - Math.abs(rel(b) - c.here));
      used.add(free[0]);
      map[c.i] = [free[0]];
    }
    return { words, map };
  }
  return { offsets, tokenAt, timeline, enWords, align, stem, beats };
})();
