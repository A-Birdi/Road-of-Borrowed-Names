/* Hanafuda: koi-koi (expansion P06, C12; Robin C-33 "Totally in."). The real, fixed deck of 48 cards, twelve months
 * of four, each month a flower; the real game of koi-koi: match by month, collect sets (yaku), then stop or call
 * "koi-koi" and play on. Points are points and personal records, never stakes (the plan's rule).
 *
 *   RB.hanafuda.DECK, MONTHS, KINDS, YAKU          the deck and the sets, with names and readings
 *   newRound(seed, dealer) → g                      deal: eight each, eight on the field (four of a month on the
 *                                                    field is dealt again, as the rules say)
 *   options(g, cardId) → field cards it could take  play(g, cardId, take?) → g     draw(g, take?) → g
 *   decide(g, 'stop' | 'koi') → g                   yaku(cards) → { list, total }  score(g, p) → points if stopped now
 *   choosePlay(g, level), chooseTake(g, level, card, opts), chooseDecide(g, level)   the partner (levels 1–3)
 * The house rules, said once (F-25): the sake cup is an animal only; 猪鹿蝶, 花見で一杯, 月見で一杯, 赤短 and 青短 are
 * five points each (赤短 and 青短 together ten), and the plain sets (タネ, タン, カス) add a point for each card past
 * their minimum; a hand of seven or more points is doubled, and doubled again if the other player had called koi-koi;
 * hands run out with no one stopping: nobody scores. Deterministic for a seed (no Math.random). */
var RB = (globalThis.RB = globalThis.RB || {});

RB.hanafuda = (function () {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  const MONTHS = [
    null,
    { flower: T('Pine', '{松|まつ}'), month: T('January', '{一月|いちがつ}') },
    { flower: T('Plum blossom', '{梅|うめ}'), month: T('February', '{二月|にがつ}') },
    { flower: T('Cherry blossom', '{桜|さくら}'), month: T('March', '{三月|さんがつ}') },
    { flower: T('Wisteria', '{藤|ふじ}'), month: T('April', '{四月|しがつ}') },
    { flower: T('Iris', '{菖蒲|あやめ}'), month: T('May', '{五月|ごがつ}') },
    { flower: T('Peony', '{牡丹|ぼたん}'), month: T('June', '{六月|ろくがつ}') },
    { flower: T('Bush clover', '{萩|はぎ}'), month: T('July', '{七月|しちがつ}') },
    { flower: T('Pampas grass', '{芒|すすき}'), month: T('August', '{八月|はちがつ}') },
    { flower: T('Chrysanthemum', '{菊|きく}'), month: T('September', '{九月|くがつ}') },
    { flower: T('Maple', '{紅葉|もみじ}'), month: T('October', '{十月|じゅうがつ}') },
    { flower: T('Willow', '{柳|やなぎ}'), month: T('November', '{十一月|じゅういちがつ}') },
    { flower: T('Paulownia', '{桐|きり}'), month: T('December', '{十二月|じゅうにがつ}') },
  ];
  const KINDS = {
    hikari: T('Bright', '{光|ひかり}'), tane: T('Animal', 'タネ'), tan: T('Ribbon', '{短冊|たんざく}'), kasu: T('Plain', 'カス'),
  };
  // the forty-eight: [month, kind, tag, English, Japanese]
  const RAW = [
    [1, 'hikari', 'crane', 'Pine with crane', '{松|まつ} に {鶴|つる}'], [1, 'tan', 'poem', 'Pine with poem ribbon', '{松|まつ} に {赤短|あかたん}'], [1, 'kasu', null, 'Pine', '{松|まつ} の カス'], [1, 'kasu', null, 'Pine', '{松|まつ} の カス'],
    [2, 'tane', 'warbler', 'Plum with bush warbler', '{梅|うめ} に {鶯|うぐいす}'], [2, 'tan', 'poem', 'Plum with poem ribbon', '{梅|うめ} に {赤短|あかたん}'], [2, 'kasu', null, 'Plum', '{梅|うめ} の カス'], [2, 'kasu', null, 'Plum', '{梅|うめ} の カス'],
    [3, 'hikari', 'curtain', 'Cherry with curtain', '{桜|さくら} に {幕|まく}'], [3, 'tan', 'poem', 'Cherry with poem ribbon', '{桜|さくら} に {赤短|あかたん}'], [3, 'kasu', null, 'Cherry', '{桜|さくら} の カス'], [3, 'kasu', null, 'Cherry', '{桜|さくら} の カス'],
    [4, 'tane', 'cuckoo', 'Wisteria with cuckoo', '{藤|ふじ} に ほととぎす'], [4, 'tan', 'red', 'Wisteria with ribbon', '{藤|ふじ} に {短冊|たんざく}'], [4, 'kasu', null, 'Wisteria', '{藤|ふじ} の カス'], [4, 'kasu', null, 'Wisteria', '{藤|ふじ} の カス'],
    [5, 'tane', 'bridge', 'Iris with plank bridge', '{菖蒲|あやめ} に {八橋|やつはし}'], [5, 'tan', 'red', 'Iris with ribbon', '{菖蒲|あやめ} に {短冊|たんざく}'], [5, 'kasu', null, 'Iris', '{菖蒲|あやめ} の カス'], [5, 'kasu', null, 'Iris', '{菖蒲|あやめ} の カス'],
    [6, 'tane', 'butterflies', 'Peony with butterflies', '{牡丹|ぼたん} に {蝶|ちょう}'], [6, 'tan', 'blue', 'Peony with blue ribbon', '{牡丹|ぼたん} に {青短|あおたん}'], [6, 'kasu', null, 'Peony', '{牡丹|ぼたん} の カス'], [6, 'kasu', null, 'Peony', '{牡丹|ぼたん} の カス'],
    [7, 'tane', 'boar', 'Bush clover with boar', '{萩|はぎ} に {猪|いのしし}'], [7, 'tan', 'red', 'Bush clover with ribbon', '{萩|はぎ} に {短冊|たんざく}'], [7, 'kasu', null, 'Bush clover', '{萩|はぎ} の カス'], [7, 'kasu', null, 'Bush clover', '{萩|はぎ} の カス'],
    [8, 'hikari', 'moon', 'Pampas grass with the moon', '{芒|すすき} に {月|つき}'], [8, 'tane', 'geese', 'Pampas grass with geese', '{芒|すすき} に {雁|かり}'], [8, 'kasu', null, 'Pampas grass', '{芒|すすき} の カス'], [8, 'kasu', null, 'Pampas grass', '{芒|すすき} の カス'],
    [9, 'tane', 'cup', 'Chrysanthemum with sake cup', '{菊|きく} に {盃|さかずき}'], [9, 'tan', 'blue', 'Chrysanthemum with blue ribbon', '{菊|きく} に {青短|あおたん}'], [9, 'kasu', null, 'Chrysanthemum', '{菊|きく} の カス'], [9, 'kasu', null, 'Chrysanthemum', '{菊|きく} の カス'],
    [10, 'tane', 'deer', 'Maple with deer', '{紅葉|もみじ} に {鹿|しか}'], [10, 'tan', 'blue', 'Maple with blue ribbon', '{紅葉|もみじ} に {青短|あおたん}'], [10, 'kasu', null, 'Maple', '{紅葉|もみじ} の カス'], [10, 'kasu', null, 'Maple', '{紅葉|もみじ} の カス'],
    [11, 'hikari', 'rain', 'Willow with the poet in the rain', '{柳|やなぎ} に {小野道風|おののみちかぜ}'], [11, 'tane', 'swallow', 'Willow with swallow', '{柳|やなぎ} に {燕|つばめ}'], [11, 'tan', 'red', 'Willow with ribbon', '{柳|やなぎ} に {短冊|たんざく}'], [11, 'kasu', 'lightning', 'Willow with lightning', '{柳|やなぎ} の カス'],
    [12, 'hikari', 'phoenix', 'Paulownia with phoenix', '{桐|きり} に {鳳凰|ほうおう}'], [12, 'kasu', null, 'Paulownia', '{桐|きり} の カス'], [12, 'kasu', null, 'Paulownia', '{桐|きり} の カス'], [12, 'kasu', null, 'Paulownia', '{桐|きり} の カス'],
  ];
  const DECK = RAW.map(([m, kind, tag, en, jp], i) => ({ id: 'c' + (i < 9 ? '0' : '') + (i + 1), m, kind, tag, name: T(en, jp) }));
  const BY = {};
  for (const c of DECK) BY[c.id] = c;
  const card = (id) => BY[id];

  // ---- the sets ---------------------------------------------------------------------------------------------------
  const YAKU = {
    goko: { name: T('Five brights', '{五光|ごこう}'), pts: 10, needs: 'All five brights.' },
    shiko: { name: T('Four brights', '{四光|しこう}'), pts: 8, needs: 'Four brights, not the poet in the rain.' },
    ameshiko: { name: T('Rainy four brights', '{雨四光|あめしこう}'), pts: 7, needs: 'Four brights, the poet in the rain among them.' },
    sanko: { name: T('Three brights', '{三光|さんこう}'), pts: 5, needs: 'Three brights, not the poet in the rain.' },
    inoshikacho: { name: T('Boar, deer and butterflies', '{猪鹿蝶|いのしかちょう}'), pts: 5, needs: 'The boar, the deer and the butterflies.' },
    hanami: { name: T('Sake under the blossoms', '{花見|はなみ} で {一杯|いっぱい}'), pts: 5, needs: 'The cherry curtain and the sake cup.' },
    tsukimi: { name: T('Sake under the moon', '{月見|つきみ} で {一杯|いっぱい}'), pts: 5, needs: 'The moon and the sake cup.' },
    akaao: { name: T('Poem and blue ribbons', '{赤短|あかたん} ・ {青短|あおたん}'), pts: 10, needs: 'All three poem ribbons and all three blue ribbons.' },
    akatan: { name: T('Poem ribbons', '{赤短|あかたん}'), pts: 5, needs: 'The three red ribbons with poems: pine, plum and cherry.' },
    aotan: { name: T('Blue ribbons', '{青短|あおたん}'), pts: 5, needs: 'The three blue ribbons: peony, chrysanthemum and maple.' },
    tane: { name: T('Animals', 'タネ'), pts: 1, needs: 'Five animals; a point more for each one after.' },
    tan: { name: T('Ribbons', 'タン'), pts: 1, needs: 'Five ribbons; a point more for each one after.' },
    kasu: { name: T('Plain cards', 'カス'), pts: 1, needs: 'Ten plain cards; a point more for each one after.' },
  };
  function yaku(ids) {
    const cs = ids.map(card);
    const has = (tag) => cs.some((c) => c.tag === tag);
    const n = (kind) => cs.filter((c) => c.kind === kind).length;
    const out = [];
    const add = (id, pts) => out.push({ id, name: YAKU[id].name, pts: pts == null ? YAKU[id].pts : pts });
    const lights = n('hikari'), rain = has('rain');
    if (lights === 5) add('goko');
    else if (lights === 4) add(rain ? 'ameshiko' : 'shiko');
    else if (lights === 3 && !rain) add('sanko');
    if (has('boar') && has('deer') && has('butterflies')) add('inoshikacho');
    if (has('curtain') && has('cup')) add('hanami');
    if (has('moon') && has('cup')) add('tsukimi');
    const poem = cs.filter((c) => c.tag === 'poem').length, blue = cs.filter((c) => c.tag === 'blue').length;
    if (poem === 3 && blue === 3) add('akaao');
    else { if (poem === 3) add('akatan'); if (blue === 3) add('aotan'); }
    if (n('tane') >= 5) add('tane', 1 + n('tane') - 5);
    if (n('tan') >= 5) add('tan', 1 + n('tan') - 5);
    if (n('kasu') >= 10) add('kasu', 1 + n('kasu') - 10);
    return { list: out, total: out.reduce((a, y) => a + y.pts, 0) };
  }

  // ---- a seeded shuffle and the deal -----------------------------------------------------------------------------
  function rng(seed) { let x = (seed >>> 0) || 1; return () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; }; }
  function shuffle(a, r) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  // a round: the dealer (親) plays first
  function newRound(seed, dealer) {
    const r = rng(seed);
    for (let tries = 0; tries < 50; tries++) {
      const d = shuffle(DECK.map((c) => c.id), r);
      const g = { seed, dealer: dealer | 0, turn: dealer | 0, hands: [d.slice(0, 8), d.slice(8, 16)], field: d.slice(16, 24), pile: d.slice(24), caught: [[], []], koi: [0, 0], shown: [0, 0], phase: 'play', pending: null, result: null, log: [] };
      // four of one month face up on the field: dealt again
      const per = {};
      for (const id of g.field) per[card(id).m] = (per[card(id).m] || 0) + 1;
      if (!Object.values(per).some((k) => k === 4)) return g;
    }
    throw new Error('hanafuda: no deal');
  }
  const clone = (g) => JSON.parse(JSON.stringify(g));
  const sameMonth = (g, id) => g.field.filter((f) => card(f).m === card(id).m);
  // what a card could take from the field: none (it is laid down), one, a choice of two, or all three
  function options(g, id) { return sameMonth(g, id); }
  function capture(g, p, id, take) {
    const ms = sameMonth(g, id);
    let got = [];
    if (ms.length === 0) { g.field.push(id); g.log.push({ p, card: id, took: [] }); return []; }
    if (ms.length === 2) {
      if (!take || ms.indexOf(take) < 0) throw new Error('hanafuda: choose which card to take');
      got = [take];
    } else got = ms;
    g.field = g.field.filter((f) => got.indexOf(f) < 0);
    g.caught[p].push(id, ...got);
    g.log.push({ p, card: id, took: got });
    return got;
  }
  // play a card from the hand; then the draw follows (draw(g) — the screen shows the turned card first)
  function play(g, id, take) {
    if (g.phase !== 'play') throw new Error('hanafuda: not the time to play');
    const n = clone(g), p = n.turn;
    const i = n.hands[p].indexOf(id);
    if (i < 0) throw new Error('hanafuda: not in hand');
    n.hands[p].splice(i, 1);
    capture(n, p, id, take);
    n.phase = 'draw';
    n.pending = n.pile.length ? n.pile[0] : null;
    return n;
  }
  // turn the top of the pile; if it could take either of two, say which (take)
  function draw(g, take) {
    if (g.phase !== 'draw') throw new Error('hanafuda: not the time to draw');
    const n = clone(g), p = n.turn;
    const id = n.pile.shift();
    if (id) capture(n, p, id, take);
    n.pending = null;
    return afterTurn(n);
  }
  function score(g, p) {
    const y = yaku(g.caught[p]).total;
    let s = y;
    if (s >= 7) s *= 2;
    if (g.koi[1 - p] > 0) s *= 2;
    return s;
  }
  function afterTurn(n) {
    const p = n.turn;
    const y = yaku(n.caught[p]).total;
    // a new set, or a set grown since the last decision: stop or koi-koi
    if (y > n.shown[p]) { n.phase = 'decide'; return n; }
    return nextTurn(n);
  }
  function nextTurn(n) {
    if (!n.hands[0].length && !n.hands[1].length) { n.phase = 'over'; n.result = { winner: null, points: 0, why: 'exhausted' }; return n; }
    n.turn = 1 - n.turn;
    n.phase = 'play';
    return n;
  }
  function decide(g, choice) {
    if (g.phase !== 'decide') throw new Error('hanafuda: nothing to decide');
    const n = clone(g), p = n.turn;
    n.shown[p] = yaku(n.caught[p]).total;
    if (choice === 'stop' || (!n.hands[0].length && !n.hands[1].length)) {
      n.phase = 'over';
      n.result = { winner: p, points: score(n, p), why: 'stop', yaku: yaku(n.caught[p]).list };
      return n;
    }
    n.koi[p]++;
    n.log.push({ p, koi: true });
    return nextTurn(n);
  }

  // ---- the partner ----------------------------------------------------------------------------------------------
  const TAG_VALUE = { crane: 22, curtain: 24, moon: 24, rain: 14, phoenix: 22, boar: 14, deer: 14, butterflies: 14, cup: 18, poem: 11, blue: 11 };
  const KIND_VALUE = { hikari: 20, tane: 8, tan: 5, kasu: 1 };
  const valueOf = (id) => { const c = card(id); return TAG_VALUE[c.tag] || KIND_VALUE[c.kind]; };
  // how much nearer a set some cards bring a player (their present catch)
  function progress(have, add) {
    const before = yaku(have).total, after = yaku(have.concat(add)).total;
    return (after - before) * 12;
  }
  function choosePlay(g, level) {
    const p = g.turn, r = rng((g.seed ^ (g.log.length * 2654435761)) >>> 0);
    const moves = [];
    for (const id of g.hands[p]) {
      const ms = sameMonth(g, id);
      if (ms.length === 2) for (const t of ms) moves.push({ card: id, take: t, got: [id, t] });
      else moves.push({ card: id, take: null, got: ms.length ? [id].concat(ms) : [] });
    }
    const scoreOf = (m) => {
      if (!m.got.length) {
        // laying a card down: give away as little as possible (a card that pairs with nothing on the field and is cheap)
        return -valueOf(m.card) * (level >= 3 ? 1.5 : 1) - (level >= 3 && g.caught[1 - p].length ? progress(g.caught[1 - p], [m.card]) : 0);
      }
      let v = m.got.reduce((a, id) => a + valueOf(id), 0) + progress(g.caught[p], m.got);
      if (level >= 3) v += m.got.reduce((a, id) => a + progress(g.caught[1 - p], [id]) * 0.5, 0); // taking what they need
      return v;
    };
    if (level <= 1) {
      const caps = moves.filter((m) => m.got.length);
      const pool = caps.length ? caps : moves;
      return pool[Math.floor(r() * pool.length)];
    }
    let best = null, bv = -Infinity;
    for (const m of moves) { const v = scoreOf(m); if (v > bv) { bv = v; best = m; } }
    return best;
  }
  function chooseTake(g, level, id, opts) {
    if (level <= 1) return opts[0];
    const p = g.turn;
    return opts.slice().sort((a, b) => valueOf(b) + progress(g.caught[p], [b]) - (valueOf(a) + progress(g.caught[p], [a])))[0];
  }
  function chooseDecide(g, level) {
    const p = g.turn, y = yaku(g.caught[p]).total, left = g.hands[p].length;
    if (level <= 1) return 'stop';
    if (level === 2) return y < 3 && left >= 4 ? 'koi' : 'stop';
    // the other side close to a set: stop while ahead
    const threat = yaku(g.caught[1 - p].concat(g.field)).total > yaku(g.caught[1 - p]).total;
    return y < 5 && left >= 3 && !threat ? 'koi' : 'stop';
  }
  // a round played to its end by two partners (for tests): returns the finished round
  function auto(seed, levels) {
    let g = newRound(seed, 0);
    for (let i = 0; i < 200 && g.phase !== 'over'; i++) {
      const L = levels[g.turn];
      if (g.phase === 'play') { const m = choosePlay(g, L); g = play(g, m.card, m.take); }
      else if (g.phase === 'draw') { const ms = g.pending ? sameMonth(g, g.pending) : []; g = draw(g, ms.length === 2 ? chooseTake(g, L, g.pending, ms) : null); }
      else if (g.phase === 'decide') g = decide(g, chooseDecide(g, L));
    }
    return g;
  }

  return { MONTHS, KINDS, DECK, YAKU, card, yaku, newRound, options, play, draw, decide, score, choosePlay, chooseTake, chooseDecide, auto, valueOf, clone };
})();
