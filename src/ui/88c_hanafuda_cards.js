/* Hanafuda's forty-eight cards, drawn in code (expansion P06, C12): each month's flower, and on the special cards
 * their bird, animal, ribbon, curtain, moon or cup, in the cards' traditional colours. No kanji is drawn on a card
 * (the screen names each card beside it, with its reading); the two poem ribbons carry their kana, as real cards do.
 *   RB.ui.hanafudaCards.svg(id, o) → '<svg…>'   back() → the card's back */
var RB = (globalThis.RB = globalThis.RB || {});
RB.ui = RB.ui || {};

RB.ui.hanafudaCards = (function () {
  'use strict';
  const W = 60, H = 98;
  const cache = {};
  const C = {
    ink: '#1b1410', paper: '#f4ead2', red: '#c8281e', red2: '#9c1b14', pink: '#f2a6b4', green: '#2f6b3a', green2: '#5b8f3e',
    purple: '#6a4a9c', blue: '#2f4fa0', gold: '#d9a521', brown: '#6b3f1d', sky: '#d9473a', white: '#fbf7ee', black: '#22201e',
  };
  const circle = (x, y, r, f, extra) => '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + f + '"' + (extra || '') + '/>';
  const path = (d, f, s, sw) => '<path d="' + d + '" fill="' + (f || 'none') + '"' + (s ? ' stroke="' + s + '" stroke-width="' + (sw || 1.2) + '" stroke-linecap="round" stroke-linejoin="round"' : '') + '/>';
  const blossom = (x, y, r, f) => { let h = ''; for (let k = 0; k < 5; k++) { const a = (k / 5) * Math.PI * 2 - Math.PI / 2; h += circle((x + Math.cos(a) * r * 0.6).toFixed(1), (y + Math.sin(a) * r * 0.6).toFixed(1), (r * 0.5).toFixed(1), f); } return h + circle(x, y, (r * 0.28).toFixed(1), C.gold); };

  // ---- each month's flower, filling the card behind its special figure -------------------------------------------
  const FLOWER = {
    1: () => path('M30 98 L30 58', null, C.brown, 4) + [[16, 62], [42, 56], [24, 44], [40, 76], [18, 80]].map(([x, y]) => path('M' + (x - 13) + ' ' + y + ' q13 -12 26 0 q-13 -5 -26 0z', C.green, C.ink, 0.8)).join(''),
    2: () => path('M6 92 Q24 70 22 50 Q22 36 44 22', null, C.black, 3.2) + path('M22 60 L40 64', null, C.black, 2.2) + [[44, 22], [22, 50], [40, 64], [14, 76], [30, 36]].map(([x, y]) => blossom(x, y, 7, C.red)).join(''),
    3: () => [[12, 18], [30, 12], [48, 20], [20, 34], [42, 36], [12, 52], [48, 52]].map(([x, y]) => blossom(x, y, 8, C.pink)).join('') + path('M0 70 Q30 62 60 72 L60 98 L0 98z', '#f6d7dc'),
    4: () => [10, 24, 38, 52].map((x, i) => [0, 1, 2, 3, 4].map((k) => circle(x + (k % 2 ? 3 : -3), 8 + i * 4 + k * 8, 4 - k * 0.4, C.purple)).join('') + path('M' + x + ' 0 v6', null, C.green, 2)).join('') + path('M0 2 Q30 8 60 2', null, C.green2, 3),
    5: () => [12, 30, 48].map((x) => path('M' + x + ' 98 L' + (x - 4) + ' 40', null, C.green, 2.4) + path('M' + (x - 4) + ' 40 q-8 -6 -6 -14 q6 2 6 8 q0 -10 6 -14 q4 8 -2 14 q8 -4 12 2 q-6 6 -16 4z', C.purple)).join(''),
    6: () => circle(30, 46, 17, C.red) + circle(30, 46, 11, '#e85b6a') + circle(30, 46, 5, C.gold) + path('M6 78 q14 -20 24 -12 q10 -8 24 12 q-12 6 -24 0 q-12 6 -24 0z', C.green),
    7: () => [0, 1, 2].map((k) => path('M' + (4 + k * 18) + ' 96 Q' + (10 + k * 18) + ' 50 ' + (40 + k * 6) + ' ' + (18 + k * 10), null, C.green2, 1.6)).join('') + [[16, 40], [24, 30], [36, 24], [30, 50], [44, 40], [20, 60], [48, 30]].map(([x, y]) => circle(x, y, 2.6, '#b2306a')).join(''),
    8: () => path('M-10 98 Q30 52 70 98z', C.black) + [8, 18, 28, 38, 48].map((x) => path('M' + x + ' 92 Q' + (x + 4) + ' 70 ' + (x + 10) + ' 60', null, C.white, 1)).join(''),
    9: () => [[16, 30], [42, 44], [22, 66]].map(([x, y]) => { let h = ''; for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2; h += path('M' + x + ' ' + y + ' L' + (x + Math.cos(a) * 10).toFixed(1) + ' ' + (y + Math.sin(a) * 10).toFixed(1), null, k % 2 ? C.gold : '#e08a1e', 3); } return h + circle(x, y, 3.5, '#e08a1e'); }).join(''),
    10: () => [[14, 20], [40, 16], [28, 38], [12, 58], [46, 50], [32, 74]].map(([x, y]) => { let h = ''; for (let k = 0; k < 5; k++) { const a = (k / 5) * Math.PI * 2 - Math.PI / 2; h += path('M' + x + ' ' + y + ' L' + (x + Math.cos(a) * 9).toFixed(1) + ' ' + (y + Math.sin(a) * 9).toFixed(1), null, C.red, 3.2); } return h; }).join(''),
    11: () => [8, 20, 32, 44, 54].map((x) => path('M' + x + ' 0 Q' + (x + 6) + ' 40 ' + (x - 2) + ' 80', null, C.green2, 1.8)).join(''),
    12: () => path('M8 98 q8 -26 22 -24 q14 -2 22 24z', C.green) + path('M10 86 q-6 -18 8 -22 M50 86 q6 -18 -8 -22', null, C.green, 4) + [20, 30, 40].map((x, i) => [0, 1, 2, 3].map((k) => circle(x, 46 - i * 6 - k * 7, 3.2, k % 2 ? C.purple : '#9a7ac8')).join('')).join(''),
  };
  // ---- the special figures ------------------------------------------------------------------------------------------
  const ribbon = (fill, kana) => {
    let h = path('M18 10 L30 10 L36 62 L24 62z', fill, C.ink, 0.6) + path('M24 62 L36 62 L32 70 L22 70z', fill, C.ink, 0.6);
    if (kana) h += '<text x="0" y="0" transform="translate(27.5 16) rotate(6)" font-size="6" fill="' + C.ink + '" writing-mode="vertical-rl" font-family="serif">' + kana + '</text>';
    return h;
  };
  const bird = (x, y, s, fill) => path('M' + x + ' ' + y + ' q' + 6 * s + ' ' + -6 * s + ' ' + 12 * s + ' ' + -2 * s + ' q' + 4 * s + ' 0 ' + 8 * s + ' ' + -4 * s + ' q' + -2 * s + ' ' + 6 * s + ' ' + -8 * s + ' ' + 8 * s + ' q' + -6 * s + ' ' + 4 * s + ' ' + -12 * s + ' ' + -2 * s + 'z', fill, C.ink, 0.6);
  const FIG = {
    crane: () => circle(42, 24, 12, C.red) + path('M14 70 q6 -26 18 -30 q6 -2 4 -10 q-2 -6 4 -6 q2 6 -2 10 q8 4 6 18 q-6 14 -30 18z', C.white, C.ink, 0.8) + path('M30 76 v14 M36 74 v16', null, C.ink, 1.2),
    curtain: () => path('M2 50 L58 50 L58 74 Q44 82 30 74 Q16 82 2 74z', '#e9e1f2', C.ink, 0.8) + [10, 22, 34, 46].map((x) => path('M' + x + ' 50 v24', null, C.red, 3)).join('') + [10, 30, 50].map((x) => circle(x, 62, 3, C.purple)).join(''),
    moon: () => path('M0 0 H60 V60 Q30 40 0 60z', C.sky) + circle(30, 30, 16, C.white),
    rain: () => path('M10 62 q12 -18 26 0z', '#c9a24a', C.ink, 0.8) + path('M23 56 v24', null, C.ink, 1.4) + circle(23, 74, 4, '#e0d8c8') + path('M44 86 q4 -6 8 0', '#4d8a3a') + [6, 50].map((x) => path('M' + x + ' 30 l4 10', null, C.blue, 1)).join(''),
    phoenix: () => path('M10 54 q14 -30 30 -16 q10 -10 16 -2 q-8 2 -8 8 q-4 18 -22 18 q12 10 22 24 q-20 -4 -30 -18z', C.gold, C.ink, 0.8) + path('M30 46 q6 6 4 14', null, C.red, 2) + path('M36 42 q4 8 2 16', null, C.green, 2),
    warbler: () => bird(20, 30, 1.3, '#7f9a3a'),
    cuckoo: () => path('M38 10 a10 10 0 1 0 8 16 a8 8 0 1 1 -8 -16z', '#e9c84a') + bird(10, 30, 1.1, C.black),
    bridge: () => path('M2 60 L30 50 L58 62', null, C.brown, 6) + path('M2 60 L30 50 L58 62', null, '#a8743a', 3),
    butterflies: () => [[18, 18], [42, 26]].map(([x, y]) => path('M' + x + ' ' + y + ' l-8 -6 l0 12z M' + x + ' ' + y + ' l8 -6 l0 12z', '#2c7fb8', C.ink, 0.6)).join(''),
    boar: () => path('M10 70 q4 -18 22 -18 q16 0 18 10 l4 2 l-4 2 q-2 10 -18 10 q-14 0 -22 -6z', '#4a3020', C.ink, 0.6) + path('M18 78 v8 M40 78 v8', null, C.ink, 2),
    geese: () => [[12, 22], [26, 30], [40, 20]].map(([x, y]) => path('M' + x + ' ' + y + ' l5 4 l5 -4', null, C.black, 2)).join(''),
    cup: () => path('M12 54 L48 54 Q46 72 30 72 Q14 72 12 54z', C.red, C.ink, 0.8) + path('M24 72 L36 72 L34 78 L26 78z', C.red2) + circle(30, 62, 4, C.gold),
    deer: () => path('M14 74 q2 -14 16 -14 q10 0 12 -8 l4 -10 M44 42 l-4 -8 M44 42 l6 -6 M30 74 v12 M18 74 v12 M38 72 v14', '#a8642a', '#5a3214', 1.6) + path('M14 74 q2 -14 16 -14 q10 0 10 6 q-2 10 -12 10z', '#a8642a'),
    swallow: () => path('M14 26 l14 8 l16 -10 l-10 12 l12 10 l-16 -6 l-16 4z', C.black),
    lightning: () => path('M0 0 H60 V34 H0z', C.black) + path('M40 2 L30 16 L38 16 L26 32', null, C.red, 2.4),
  };
  function svg(id, o) {
    o = o || {};
    if (cache[id] && !o.fresh) return cache[id];
    const c = RB.hanafuda.card(id);
    let body = '<rect x="0" y="0" width="' + W + '" height="' + H + '" rx="4" fill="' + C.paper + '"/>';
    if (c.tag === 'moon') body += FIG.moon();
    body += FLOWER[c.m]();
    if (c.kind === 'tan') body += ribbon(c.tag === 'blue' ? C.blue : C.red, c.tag === 'poem' ? (c.m === 3 ? 'みよしの' : 'あかよろし') : '');
    else if (c.tag && c.tag !== 'moon' && FIG[c.tag]) body += FIG[c.tag]();
    // the brights carry a small gold disc in a corner, as learners' decks mark them (no writing)
    if (c.kind === 'hikari') body += circle(52, 8, 4.5, C.gold, ' stroke="' + C.ink + '" stroke-width="0.6"');
    const out = '<svg class="hf-svg" viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true" focusable="false"><g clip-path="url(#hf-clip)">' + body + '</g><rect x="0.5" y="0.5" width="' + (W - 1) + '" height="' + (H - 1) + '" rx="4" fill="none" stroke="#7a2a18" stroke-width="1.6"/></svg>';
    cache[id] = out;
    return out;
  }
  const back = () => '<svg class="hf-svg" viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true" focusable="false"><rect width="' + W + '" height="' + H + '" rx="4" fill="#2a1a12"/><rect x="5" y="5" width="' + (W - 10) + '" height="' + (H - 10) + '" rx="2" fill="none" stroke="#7a2a18" stroke-width="1.4"/></svg>';
  // the clip path for rounded corners, once per page
  const defs = () => '<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs><clipPath id="hf-clip"><rect width="' + W + '" height="' + H + '" rx="4"/></clipPath></defs></svg>';
  return { svg, back, defs, W, H };
})();
