/* Karuta on screen (expansion P06, C12; the rules in src/engine/72e_karuta.js, the deck in
 * src/content/pastimes/40_karuta.js). An activity (RB.activity 'karuta'), with your companion anywhere safe, from the
 * Ledger's Distractions. The proverb is read a word at a time (its first sound first, as a reader says it), with
 * the device's own Japanese voice if you choose and one is installed; the picture cards carry each proverb's first
 * sound and a drawing. Untimed unless you turn on the speed mode. After each card, the proverb whole, as said and as
 * meant. The cards you take are kept in your record, with their meanings. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.ui.karuta = (function () {
  'use strict';
  const esc = RB.util.esc;
  const I = (n) => (RB.ui.folio ? RB.ui.folio.icon(n) : '');
  const KR = () => RB.karuta, DECK = () => RB.content.karuta.deck;
  const S = () => RB.game.s;
  const byKana = (k) => DECK().find((c) => c.kana === k);
  const SIZES = [[8, 'Eight cards'], [12, 'Twelve'], [20, 'Twenty'], [0, 'All of them']];
  const SPEED = [[0, 'Off: take your time'], [1, 'Gentle'], [2, 'Steady'], [3, 'Quick']];
  const REACH = { 1: 11000, 2: 7000, 3: 4500 }; // when the partner reaches, in speed mode (ms after the reading starts)
  let V = null;
  const partner = () => { const w = V && V.with; return w && RB.content.chars[w] ? RB.content.chars[w].name.en : 'your partner'; };
  const reduced = () => !!(RB.game.reducedMotion && RB.game.reducedMotion());
  const voiceOk = () => !!(RB.voice && RB.voice.supported && RB.voice.supported() && RB.voice.japaneseVoices && RB.voice.japaneseVoices().length);

  RB.activity.register('karuta', {
    title: { en: 'Karuta', jp: 'かるた' },
    eligible: (s, ctx) => {
      if (!(ctx && ctx.with) && !s.comp) return { ok: false, why: 'There is nobody to play with here.' };
      return RB.activity.safe ? RB.activity.safe(ctx && ctx.with ? {} : { companion: true }) : { ok: true };
    },
    run: (session) => run(session),
    dispose: (session) => { if (V && V.session === session) close(); },
  });

  // ---- the picture cards: the first sound in its red circle, and a drawing of the saying ------------------------------
  const ART = {
    dog: '<ellipse cx="30" cy="44" rx="13" ry="7" fill="#b07a3e"/><circle cx="44" cy="36" r="6" fill="#b07a3e"/><path d="M41 31 l2 -5 l3 5 M20 50 v8 M26 50 v8 M34 50 v8 M40 50 v8 M17 42 q-6 -4 -4 -10" stroke="#5a3a1a" stroke-width="2" fill="none"/><path d="M48 52 L58 40" stroke="#7a5a2a" stroke-width="3"/>',
    scroll: '<rect x="14" y="26" width="34" height="30" fill="#f1e2bc" stroke="#7a5a2a"/><rect x="11" y="24" width="4" height="34" rx="2" fill="#8a2a1a"/><rect x="47" y="24" width="4" height="34" rx="2" fill="#8a2a1a"/><path d="M20 34 h22 M20 40 h22 M20 46 h16" stroke="#3a2a1a" stroke-width="1.6"/>',
    dango: '<path d="M14 58 L48 22" stroke="#9a7a4a" stroke-width="2"/><circle cx="22" cy="49" r="6" fill="#e9a3b0"/><circle cx="30" cy="40" r="6" fill="#f6f1e4" stroke="#c9bfa8"/><circle cx="38" cy="31" r="6" fill="#8fbf7a"/><path d="M40 52 q4 -8 0 -12 q6 2 6 8" fill="#e9a3b0" opacity="0.6"/>',
    child: '<circle cx="31" cy="30" r="7" fill="#f2d2b0" stroke="#5a3a1a"/><path d="M22 58 L31 38 L40 58z" fill="#c8402e"/><path d="M27 31 q4 3 8 0" stroke="#5a3a1a" fill="none"/><path d="M40 44 l8 -6" stroke="#5a3a1a" stroke-width="2"/>',
    bundle: '<path d="M18 56 q-4 -18 12 -20 q16 2 12 20z" fill="#a8743a" stroke="#5a3a1a"/><path d="M24 38 q6 -6 12 0" stroke="#5a3a1a" stroke-width="2" fill="none"/><path d="M44 30 q4 -2 6 2 M46 26 q4 -2 6 2" stroke="#3a6a9a" fill="none"/>',
    talk: '<circle cx="24" cy="38" r="9" fill="#f2d2b0" stroke="#5a3a1a"/><ellipse cx="27" cy="41" rx="3" ry="2" fill="#8a2a1a"/><path d="M36 30 q6 2 0 6 q8 2 0 6 q8 2 0 6 q6 2 0 6" stroke="#3a2a1a" fill="none" stroke-width="1.4"/><path d="M44 28 h10 M44 36 h12 M44 44 h10 M44 52 h12" stroke="#7a6a5a" stroke-width="1.2"/>',
    water: '<path d="M20 36 h22 l-3 22 h-16z" fill="#a8743a" stroke="#5a3a1a"/><ellipse cx="31" cy="36" rx="11" ry="3" fill="#7fb6d6"/><path d="M45 24 q3 5 0 7 q-3 -2 0 -7 M50 30 q3 5 0 7 q-3 -2 0 -7" fill="#7fb6d6"/>',
    mountain: '<path d="M8 58 L30 24 L52 58z" fill="#7a8a6a" stroke="#4a5a3a"/><path d="M24 34 L30 24 L36 34 q-6 3 -12 0z" fill="#f4f4f4"/><circle cx="14" cy="60" r="1.2" fill="#5a4a3a"/><circle cx="18" cy="61" r="1" fill="#5a4a3a"/><circle cx="46" cy="61" r="1.2" fill="#5a4a3a"/>',
    family: '<circle cx="22" cy="30" r="6" fill="#f2d2b0" stroke="#5a3a1a"/><path d="M14 58 L22 38 L30 58z" fill="#3a5a8a"/>' + [34, 40, 46, 52].map((x, i) => '<circle cx="' + x + '" cy="' + (44 + (i % 2) * 3) + '" r="3.5" fill="#f2d2b0" stroke="#5a3a1a"/><path d="M' + (x - 3) + ' ' + (58) + ' L' + x + ' ' + (48 + (i % 2) * 3) + ' L' + (x + 3) + ' 58z" fill="#c8402e"/>').join(''),
    sleep: '<rect x="10" y="48" width="42" height="6" rx="2" fill="#a8743a"/><circle cx="18" cy="44" r="5" fill="#f2d2b0" stroke="#5a3a1a"/><path d="M22 46 q14 -6 26 0 v2 h-26z" fill="#4a4a5a"/><text x="38" y="34" font-size="9" fill="#3a2a1a" font-family="serif">z z</text>',
    jewel: '<path d="M22 32 l8 -8 l8 8 l-8 16z" fill="#3a5ab0" stroke="#1a2a5a"/><path d="M36 40 l6 -6 l6 6 l-6 12z" fill="#cfe6f2" stroke="#5a7a8a"/><path d="M14 22 l4 4 M50 22 l-4 4 M30 14 v6" stroke="#d9a521" stroke-width="2"/>',
    pot: '<path d="M16 38 q0 20 15 20 q15 0 15 -20z" fill="#3a3a3a"/><path d="M24 44 l4 4 l-2 4" stroke="#d9c6a0" fill="none"/><ellipse cx="31" cy="36" rx="17" ry="4" fill="#a8743a" stroke="#5a3a1a"/><path d="M22 34 l18 4" stroke="#d9c6a0" stroke-dasharray="2 2"/>',
    frog: '<ellipse cx="22" cy="48" rx="10" ry="7" fill="#5a9a3a"/><circle cx="18" cy="41" r="3" fill="#5a9a3a"/><circle cx="26" cy="41" r="3" fill="#5a9a3a"/><circle cx="18" cy="41" r="1.2" fill="#1a1a1a"/><circle cx="26" cy="41" r="1.2" fill="#1a1a1a"/><ellipse cx="42" cy="52" rx="6" ry="4" fill="#7aba4a"/><circle cx="40" cy="48" r="1.8" fill="#7aba4a"/><circle cx="44" cy="48" r="1.8" fill="#7aba4a"/>',
    reed: '<path d="M18 60 L40 20" stroke="#8a9a4a" stroke-width="4"/><circle cx="42" cy="17" r="6" fill="none" stroke="#3a2a1a"/><path d="M8 14 h46" stroke="#7a5a2a" stroke-width="3"/><circle cx="14" cy="58" r="3" fill="#f2d2b0"/>',
    travellers: '<path d="M6 60 q24 -10 50 -2" stroke="#b09a6a" stroke-width="5" fill="none"/>' + [[22, 0], [36, 1]].map(([x, k]) => '<path d="M' + (x - 6) + ' 32 h12 l-6 -5z" fill="#c9a24a"/><circle cx="' + x + '" cy="35" r="3.5" fill="#f2d2b0"/><path d="M' + (x - 5) + ' 54 L' + x + ' 39 L' + (x + 5) + ' 54z" fill="' + (k ? '#3a5a8a' : '#8a3a2a') + '"/><path d="M' + (x + 6) + ' 40 v16" stroke="#7a5a2a"/>').join(''),
    moon: '<path d="M44 14 a10 10 0 1 0 8 18 a8 8 0 1 1 -8 -18z" fill="#e9c84a"/><path d="M14 46 q0 12 12 12 q12 0 12 -12z" fill="#3a3a3a"/><path d="M38 44 l10 -4" stroke="#5a3a1a" stroke-width="2" stroke-dasharray="2 2"/>',
    check: '<path d="M14 36 l6 6 l12 -14" stroke="#2d5f28" stroke-width="4" fill="none"/><path d="M28 50 l6 6 l12 -14" stroke="#2d5f28" stroke-width="4" fill="none"/>',
    bee: '<circle cx="22" cy="38" r="9" fill="#f2d2b0" stroke="#5a3a1a"/><path d="M18 36 q2 2 4 0 M24 36 q2 2 4 0" stroke="#3a6a9a"/><path d="M19 42 q3 -2 6 0" stroke="#5a3a1a" fill="none"/><ellipse cx="42" cy="30" rx="6" ry="4" fill="#e9b42a"/><path d="M40 27 v6 M44 27 v6" stroke="#1a1a1a" stroke-width="1.6"/><ellipse cx="41" cy="24" rx="3" ry="2" fill="#dfeef6"/><circle cx="18" cy="30" r="3" fill="#e46a5a" opacity="0.7"/>',
    scales: '<path d="M30 20 v34 M20 58 h20 M12 28 h36" stroke="#5a4a3a" stroke-width="2"/><path d="M8 28 l4 10 l4 -10 M44 28 l4 10 l4 -10" stroke="#5a4a3a" fill="none"/><path d="M6 38 h12 q-6 6 -12 0z M42 38 h12 q-6 6 -12 0z" fill="#d9a521"/>',
    push: '<circle cx="18" cy="32" r="5" fill="#f2d2b0" stroke="#5a3a1a"/><path d="M12 58 L18 38 L26 58z" fill="#6a3a8a"/><path d="M26 44 L44 44" stroke="#c8281e" stroke-width="4"/><path d="M40 38 l8 6 l-8 6" fill="#c8281e"/><circle cx="50" cy="40" r="4" fill="#f2d2b0" stroke="#5a3a1a" opacity="0.6"/>',
    mask: '<path d="M20 22 l4 10 q6 -4 12 0 l4 -10 q4 12 0 22 q-10 12 -20 0 q-4 -10 0 -22z" fill="#f6f1e4" stroke="#5a3a1a"/><path d="M24 36 l4 2 M36 36 l-4 2" stroke="#c8281e" stroke-width="2"/><path d="M28 46 q2 2 4 0" stroke="#c8281e" fill="none"/>',
    tea: '<path d="M18 38 h26 q-2 18 -13 18 q-11 0 -13 -18z" fill="#6a8a5a" stroke="#3a4a2a"/><path d="M24 30 q-3 -5 0 -9 M31 30 q-3 -5 0 -9 M38 30 q-3 -5 0 -9" stroke="#9a9a9a" fill="none"/>',
    club: '<path d="M18 58 L42 22" stroke="#4a4a4a" stroke-width="7"/><path d="M36 26 l4 2 M38 32 l4 2 M33 32 l-2 -4 M30 38 l-3 -3" stroke="#d9d9d9" stroke-width="2"/><path d="M12 24 l4 8 l4 -8 M24 22 l4 8 l4 -8" fill="#c8281e"/>',
    lid: '<path d="M16 40 q0 18 15 18 q15 0 15 -18z" fill="#7a5a3a"/><ellipse cx="31" cy="38" rx="16" ry="4" fill="#a8743a" stroke="#5a3a1a"/><path d="M16 28 q2 -6 0 -10 M30 26 q2 -6 0 -10 M44 28 q2 -6 0 -10" stroke="#8a9a4a" fill="none" stroke-width="1.6"/>',
    coins: [0, 1, 2, 3].map((k) => '<ellipse cx="' + (24 + (k % 2) * 14) + '" cy="' + (52 - k * 6) + '" rx="8" ry="3.5" fill="#c9a24a" stroke="#6a4a1a"/><rect x="' + (22 + (k % 2) * 14) + '" y="' + (51 - k * 6) + '" width="4" height="2" fill="#6a4a1a"/>').join('') + '<path d="M44 24 l6 6 M50 24 l-6 6" stroke="#c8281e" stroke-width="2"/>',
    bow: '<circle cx="34" cy="34" r="5" fill="#f2d2b0" stroke="#5a3a1a"/><path d="M14 58 L22 36 L34 38 L30 58z" fill="#3a5a8a"/><path d="M44 44 q4 -10 10 -4" stroke="#d9a521" stroke-width="2" fill="none"/>',
    boat: '<path d="M10 50 h40 l-6 8 h-28z" fill="#8a5a2a"/><path d="M30 50 V16" stroke="#5a3a1a" stroke-width="2"/><path d="M31 18 q16 12 0 28z" fill="#f6f1e4" stroke="#7a6a5a"/><path d="M6 60 q6 -3 12 0 t12 0 t12 0 t12 0" stroke="#5a8ab0" fill="none"/>',
    hide: '<ellipse cx="22" cy="42" rx="14" ry="12" fill="#5a8a3a"/><ellipse cx="42" cy="50" rx="9" ry="7" fill="#e9b48a" stroke="#5a3a1a"/><path d="M42 44 v12" stroke="#5a3a1a"/>',
    ear: '<path d="M26 18 q18 -2 18 16 q0 10 -8 14 q-4 2 -4 8 q0 6 -6 6" stroke="#5a3a1a" stroke-width="2" fill="#f2d2b0"/><path d="M30 28 q8 -2 8 8 q0 6 -6 6" stroke="#5a3a1a" fill="none"/><path d="M10 26 q3 3 0 6 M8 34 q3 3 0 6" stroke="#3a6a9a" fill="none"/>',
    lamp: '<rect x="22" y="22" width="18" height="26" fill="#f6ecc8" stroke="#5a3a1a"/><path d="M31 32 q4 4 0 8 q-4 -4 0 -8z" fill="#e9a42a"/><path d="M20 48 h22 M24 48 v10 M38 48 v10" stroke="#5a3a1a" stroke-width="2"/>',
    eye: '<path d="M14 42 q16 -14 32 0 q-16 14 -32 0z" fill="#f6f1e4" stroke="#3a2a1a"/><circle cx="30" cy="42" r="5" fill="#3a2a1a"/><ellipse cx="30" cy="26" rx="7" ry="5" fill="#e9b48a" stroke="#5a3a1a"/>',
    blade: '<path d="M12 54 L46 20 L50 24 L16 58z" fill="#c9cdd2" stroke="#4a4a4a"/><path d="M10 52 l8 8" stroke="#5a3a1a" stroke-width="4"/>' + [[30, 36], [36, 31], [24, 43]].map(([x, y]) => '<circle cx="' + x + '" cy="' + y + '" r="2" fill="#a8541e"/>').join(''),
    buddha: '<circle cx="30" cy="30" r="12" fill="none" stroke="#d9a521" stroke-width="2"/><circle cx="30" cy="30" r="5" fill="#d9b06a"/><path d="M18 56 q12 -22 24 0z" fill="#d9b06a"/><path d="M27 31 q3 2 6 0" stroke="#5a3a1a" fill="none"/>',
    temple: '<path d="M10 26 h40 l-4 -6 h-32z" fill="#3a3a3a"/><path d="M16 26 v32 M44 26 v32" stroke="#a83a2a" stroke-width="4"/><path d="M14 34 h32" stroke="#3a3a3a" stroke-width="3"/><circle cx="30" cy="50" r="4" fill="#f2d2b0" stroke="#5a3a1a"/><path d="M26 58 L30 52 L34 58z" fill="#5a4a3a"/>',
    run: '<circle cx="34" cy="24" r="5" fill="#f2d2b0" stroke="#5a3a1a"/><path d="M33 30 L28 44 L20 56 M28 44 L36 56 M31 34 L22 36 M31 34 L40 30" stroke="#3a5a8a" stroke-width="3" fill="none"/><path d="M8 30 h8 M6 38 h10 M8 46 h8" stroke="#9a8a7a"/><path d="M42 52 l6 4 l-4 4" stroke="#c8281e" fill="none"/>',
  };
  function cardSvg(c) {
    return '<svg class="kt-svg" viewBox="0 0 62 74" aria-hidden="true" focusable="false"><rect x="1" y="1" width="60" height="72" rx="3" fill="#f7efd9" stroke="#7a5a2a" stroke-width="1.4"/>' +
      '<g transform="translate(0 8)">' + (ART[c.art] || '') + '</g><circle cx="13" cy="13" r="10" fill="#fff8ea" stroke="#c8281e" stroke-width="2"/>' +
      '<text x="13" y="17.5" text-anchor="middle" font-size="13" font-weight="700" fill="#1b1410" font-family="sans-serif">' + c.kana + '</text></svg>';
  }
  function cardHtml(c, o) {
    o = o || {};
    return '<button type="button" class="kt-card' + (o.cls ? ' ' + o.cls : '') + '" data-k="' + c.kana + '"' + (o.disabled ? ' disabled' : '') + ' aria-label="' + esc('The card for ' + c.kana + (o.label ? ': ' + o.label : '')) + '">' + cardSvg(c) + '</button>';
  }

  // ---- the activity ----------------------------------------------------------------------------------------------
  function run(session) {
    return new Promise((resolve) => {
      const s = S();
      const ctx = (session && session.ctx) || {};
      const who = ctx.with || s.comp || null;
      const fr = RB.ui.folio.frame({ cls: 'kt-folio', onClose: () => leave(), closeLabel: 'Leave', closeIcon: 'back' });
      fr.setTitle(RB.ui.label('かるた', 'Karuta') + ' <span class="sg-with">' + esc('with ' + (who && RB.content.chars[who] ? RB.content.chars[who].name.en : 'a partner')) + '</span>', '');
      fr.box.innerHTML = '<div class="leaf kt-leaf" tabindex="-1"></div>';
      V = { session, s, with: who, fr, leaf: fr.box.firstChild, view: 'menu', resolve, size: 12, speed: 0, voice: false, words: 0, seq: 0 };
      V.layer = { el: fr.scrim, name: 'karuta', noAutofocus: true, onCancel: () => leave() };
      V.leaf.addEventListener('click', onClick);
      V.leaf.addEventListener('change', onChange);
      RB.ui.pushLayer(V.layer);
      render();
    });
  }
  function stopTimers() { if (!V) return; clearTimeout(V.wordTimer); clearTimeout(V.reach); if (RB.voice && RB.voice.cancel) RB.voice.cancel(); }
  function close() { if (!V) return; stopTimers(); RB.ui.popLayer(V.layer); const r = V.resolve; V = null; r({ ok: true }); }
  function leave() { if (!V) return; if (V.view === 'menu') close(); else { stopTimers(); V.view = 'menu'; V.g = null; render(); } }
  const rec = () => RB.pastimes.rec(S(), 'karuta');

  function menuHtml() {
    const r = rec();
    const mine = Object.keys(r.cards || {}).map(byKana).filter(Boolean);
    let h = '<p class="sg-intro">The reader reads a proverb; find its picture card on the mat. Each card shows the first sound of its proverb. Take your time: nothing is timed unless you ask for it.</p>';
    h += '<div class="hf-menu"><section><h3>' + RB.ui.label('{遊|あそ}ぶ', 'Play') + '</h3>' +
      '<fieldset class="sg-level"><legend>How many cards on the mat</legend>' + SIZES.map(([n, l]) => '<label class="opt"><input type="radio" name="kt-size" value="' + n + '"' + (V.size === n ? ' checked' : '') + '><span>' + l + '</span></label>').join('') + '</fieldset>' +
      '<fieldset class="sg-level"><legend>Speed (' + esc(partner()) + ' reaches for the card after a while)</legend>' + SPEED.map(([n, l]) => '<label class="opt"><input type="radio" name="kt-speed" value="' + n + '"' + (V.speed === n ? ' checked' : '') + '><span>' + l + '</span></label>').join('') + '</fieldset>' +
      (voiceOk() ? '<label class="opt"><input type="checkbox" data-a="voice"' + (V.voice ? ' checked' : '') + '><span>Read aloud (your device\'s Japanese voice)</span></label>' : '<p class="muted small">Reading aloud needs a Japanese voice installed on this device; the proverbs are read in text.</p>') +
      '<div class="sg-acts"><button type="button" class="pbtn primary" data-a="start">' + I('next') + '<span>Lay out the cards</span></button></div>' +
      '<p class="muted small">' + esc(r.games ? 'Games: ' + r.games + (r.best ? '. Most cards in one game: ' + r.best + '.' : '.') : 'Not played yet.') + '</p></section>' +
      '<section><h3>' + RB.ui.label('{集|あつ}めた {札|ふだ}', 'Proverbs you have taken') + '</h3>' +
      (mine.length ? '<ul class="kt-known">' + mine.map((c) => '<li><span class="kt-k">' + c.kana + '</span><span>' + RB.ui.jhtml(c.jp) + '<span class="en">' + esc(c.means) + '</span></span></li>').join('') + '</ul>' : '<p class="muted small">None yet. Every card you take is kept here with its meaning.</p>') + '</section></div>';
    return h;
  }
  function start() {
    V.seq++;
    const all = DECK().map((c) => c.kana);
    const seed = (RB.util.hashStr(String(S().id || 'kt') + '|karuta|' + (rec().games || 0) + '|' + V.seq) >>> 0) || 1;
    // the mat: a seeded choice of the deck, or all of it
    let pickFrom = all.slice();
    const n = V.size && V.size < all.length ? V.size : all.length;
    const g0 = KR().newGame(seed, pickFrom);
    V.g = KR().newGame(seed ^ 0x5bd1e995, g0.mat.slice(0, n));
    V.view = 'table'; V.counted = false; V.shown = null;
    beginReading();
  }
  // the proverb read a word at a time, the first sound first (as a reader draws it out)
  function beginReading() {
    stopTimers();
    V.words = 0; V.shown = null;
    const c = byKana(KR().current(V.g));
    if (!c) { finish(); render(); return; }
    V.tokens = c.jp.split(' ').filter(Boolean).length;
    render();
    if (V.voice && voiceOk()) RB.voice.speak(RB.jp.reading(c.jp), { rate: 0.9 });
    const step = () => { if (!V || V.view !== 'table' || V.shown) return; V.words++; render(); if (V.words < V.tokens) V.wordTimer = setTimeout(step, reduced() ? 0 : 650); };
    V.wordTimer = setTimeout(step, reduced() ? 0 : 500);
    if (V.speed) V.reach = setTimeout(() => { if (!V || V.view !== 'table' || V.shown) return; V.g = KR().partnerTakes(V.g); afterTake(); }, REACH[V.speed]);
  }
  function readerHtml() {
    const c = byKana(KR().current(V.g));
    if (!c) return '';
    // the line so far: whole words, each with its reading
    const parts = c.jp.split(' ').filter(Boolean);
    const visible = parts.slice(0, Math.max(0, V.words)).join(' ');
    return '<div class="kt-reader" role="status" aria-live="polite"><span class="kt-first">' + c.kana + '</span><span class="kt-line">' + (visible ? RB.ui.jhtml(visible) : '…') + '</span>' +
      (V.words < parts.length ? '<button type="button" class="pbtn small" data-a="all">Read it all</button>' : '') + '</div>';
  }
  function shownHtml() {
    const L = V.g.last, c = byKana(L.kana);
    const head = L.who === 0 ? '<b>Yours.</b>' : L.quicker ? '<b>' + esc(partner()) + ' was quicker.</b>' : '<b>' + RB.ui.jhtml('お{手|て}つき') + '</b> That card was for 「' + esc(L.touched) + '」; ' + esc(partner()) + ' takes the right one.';
    return '<div class="kt-shown"><p>' + head + '</p><p class="kt-prov">' + RB.ui.jhtml(c.jp) + '</p><p class="en">“' + esc(c.en) + '” ' + esc(c.means) + '</p>' +
      (c.set !== 'edo' ? '<p class="muted small">This card comes from ' + esc(RB.content.karuta.sets[c.set].en) + '.</p>' : '') +
      '<div class="sg-acts"><button type="button" class="pbtn primary" data-a="next">' + (KR().over(V.g) ? 'See how it went' : 'Next card') + '</button></div></div>';
  }
  function tableHtml() {
    const g = V.g;
    if (KR().over(g) && !V.shown) return overHtml();
    const left = KR().onMat(g);
    let h = '<div class="hf-top"><span>' + esc('Cards left: ' + left.length) + '</span><span>' + esc('You ' + g.taken[0].length + ' · ' + partner().charAt(0).toUpperCase() + partner().slice(1) + ' ' + g.taken[1].length) + '</span></div>';
    h += V.shown ? shownHtml() : readerHtml();
    h += '<div class="kt-mat" role="group" aria-label="The mat">' + g.mat.map((k) => {
      const taken = g.taken[0].indexOf(k) >= 0 ? 'mine' : g.taken[1].indexOf(k) >= 0 ? 'theirs' : '';
      return taken ? '<span class="kt-gap ' + taken + '" aria-hidden="true"></span>' : cardHtml(byKana(k), { disabled: !!V.shown });
    }).join('') + '</div>';
    return h;
  }
  function overHtml() {
    const g = V.g, a = g.taken[0].length, b = g.taken[1].length;
    return '<div class="hf-over"><p><b>' + esc(a > b ? 'You took ' + a + ' cards to ' + partner() + '\'s ' + b + '.' : a < b ? partner().charAt(0).toUpperCase() + partner().slice(1) + ' took ' + b + ' to your ' + a + '.' : 'Even: ' + a + ' each.') + '</b></p>' +
      '<div class="kt-row">' + g.taken[0].map((k) => cardHtml(byKana(k), { cls: 'small', disabled: true })).join('') + '</div>' +
      '<div class="sg-acts"><button type="button" class="pbtn primary" data-a="start">Again</button><button type="button" class="pbtn" data-a="menu">Back</button></div></div>';
  }
  function afterTake() {
    stopTimers();
    V.shown = true;
    const L = V.g.last;
    if (L.who === 0) { const r = rec(); r.cards = r.cards || {}; r.cards[L.kana] = (r.cards[L.kana] || 0) + 1; }
    if (KR().over(V.g)) finish();
    render();
  }
  function finish() {
    if (V.counted) return;
    V.counted = true;
    const a = V.g.taken[0].length, b = V.g.taken[1].length;
    RB.pastimes.result(S(), 'karuta', 'game', a > b, a);
    if (RB.stampBook) RB.stampBook.settle(S());
  }
  function render() {
    if (!V) return;
    V.leaf.innerHTML = V.view === 'menu' ? menuHtml() : tableHtml();
  }
  function onChange(e) {
    if (!V) return;
    const t = e.target;
    if (t.name === 'kt-size') V.size = +t.value;
    if (t.name === 'kt-speed') V.speed = +t.value;
    if (t.dataset && t.dataset.a === 'voice') V.voice = t.checked;
  }
  function onClick(e) {
    if (!V) return;
    const t = e.target;
    const k = t.closest('[data-k]');
    if (k && !k.disabled && V.view === 'table' && !V.shown) { V.g = KR().pick(V.g, k.dataset.k); afterTake(); return; }
    const b = t.closest('[data-a]');
    if (!b || b.disabled || b.tagName === 'INPUT') return;
    const a = b.dataset.a;
    if (a === 'start') return start();
    if (a === 'menu') { stopTimers(); V.view = 'menu'; render(); return; }
    if (a === 'all') { clearTimeout(V.wordTimer); V.words = V.tokens; render(); return; }
    if (a === 'next') { V.shown = null; if (KR().over(V.g)) { render(); return; } beginReading(); }
  }
  return { run, close, ART, state: () => (V ? { view: V.view, g: V.g, words: V.words, shown: !!V.shown, speed: V.speed } : null) };
})();
