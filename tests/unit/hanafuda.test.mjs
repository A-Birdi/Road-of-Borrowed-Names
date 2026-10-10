// Hanafuda: koi-koi (expansion P06, C12; src/engine/72d_hanafuda.js, src/content/pastimes/30_hanafuda.js): the real
// deck (48 cards, four a month, 5 brights, 9 animals, 10 ribbons, 24 plain); the deal (eight each, eight on the
// field, dealt again when one month's four lie face up); taking by month (one, a choice of two, all three); the turned
// card; the sets with the house rules (F-25); stop or koi-koi, doubling; no score when the cards run out; no card ever
// lost; the same seed deals the same game; the partner's levels differ; every card name, month, flower and set with
// its readings and every word in the dictionary.
import fs from 'node:fs';
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const H = RB.hanafuda;
  const ids = (f) => H.DECK.filter(f).map((c) => c.id);
  const tagged = (...tags) => ids((c) => tags.includes(c.tag));

  // ---- the deck -----------------------------------------------------------------------------------------------------
  const kinds = {};
  for (const c of H.DECK) kinds[c.kind] = (kinds[c.kind] || 0) + 1;
  t.eq([H.DECK.length, kinds.hikari, kinds.tane, kinds.tan, kinds.kasu], [48, 5, 9, 10, 24], '48 cards: 5 brights, 9 animals, 10 ribbons, 24 plain');
  t.ok([...Array(12)].every((x, i) => H.DECK.filter((c) => c.m === i + 1).length === 4), 'four for each month');
  t.eq(H.DECK.filter((c) => c.kind === 'hikari').map((c) => c.m), [1, 3, 8, 11, 12], 'the brights: pine, cherry, pampas, willow, paulownia');
  t.eq([tagged('poem').length, tagged('blue').length], [3, 3], 'three poem ribbons, three blue');

  // ---- the sets (F-25) ---------------------------------------------------------------------------------------------
  const y = (cs) => H.yaku(cs).list.map((x) => x.id + ':' + x.pts).join(' ');
  t.eq(y(ids((c) => c.kind === 'hikari')), 'goko:10', 'five brights: 10');
  t.eq(y(tagged('crane', 'curtain', 'moon', 'phoenix')), 'shiko:8', 'four, without the rain: 8');
  t.eq(y(tagged('crane', 'curtain', 'moon', 'rain')), 'ameshiko:7', 'four, with the rain: 7');
  t.eq(y(tagged('crane', 'curtain', 'moon')), 'sanko:5', 'three without the rain: 5');
  t.eq(y(tagged('crane', 'curtain', 'rain')), '', 'three with the rain: nothing');
  t.eq(y(tagged('boar', 'deer', 'butterflies')), 'inoshikacho:5', 'boar, deer, butterflies: 5');
  t.eq(y(tagged('curtain', 'cup')), 'hanami:5', 'the curtain and the cup: 5');
  t.eq(y(tagged('moon', 'cup')), 'tsukimi:5', 'the moon and the cup: 5');
  t.eq(y(tagged('poem')), 'akatan:5', 'the poem ribbons: 5');
  t.eq(y(tagged('poem', 'blue')), 'akaao:10 tan:2', 'both ribbon sets: 10, and six ribbons are a ribbon set worth 2');
  t.eq(y(ids((c) => c.kind === 'tane').slice(0, 6)), 'tane:2', 'six animals: 2');
  t.eq(H.yaku(ids((c) => c.kind === 'kasu').slice(0, 11)).total, 2, 'eleven plain cards: 2');
  t.ok(!H.yaku(tagged('cup')).list.length && H.card(tagged('cup')[0]).kind === 'tane', 'the sake cup is an animal only (F-25)');

  // ---- the deal and the turn --------------------------------------------------------------------------------------
  const g = H.newRound(12345, 0);
  t.eq([g.hands[0].length, g.hands[1].length, g.field.length, g.pile.length], [8, 8, 8, 24], 'eight each, eight on the field, 24 in the pile');
  t.eq(JSON.stringify(H.newRound(12345, 0)), JSON.stringify(g), 'the same seed deals the same game');
  let redeals = 0;
  for (let seed = 1; seed <= 3000; seed++) {
    const r = H.newRound(seed, 0), per = {};
    for (const id of r.field) per[H.card(id).m] = (per[H.card(id).m] || 0) + 1;
    if (Object.values(per).some((k) => k === 4)) redeals++;
  }
  t.eq(redeals, 0, 'never four of a month face up on the field (dealt again)');
  // a hand card against a field of known cards
  const at = (hand, field, pile) => { const r = H.newRound(7, 0); r.hands = [hand, ['c48']]; r.field = field; r.pile = pile || ['c47']; r.caught = [[], []]; return r; };
  const pine = ids((c) => c.m === 1), plum = ids((c) => c.m === 2);
  let a = H.play(at([pine[0]], [pine[1], plum[0]]), pine[0]);
  t.eq([a.caught[0].sort(), a.field], [[pine[0], pine[1]].sort(), [plum[0]]], 'one of its month on the field: taken');
  let threw = false; try { H.play(at([pine[0]], [pine[1], pine[2]]), pine[0]); } catch (e) { threw = true; }
  t.ok(threw, 'two of its month: a choice is required');
  a = H.play(at([pine[0]], [pine[1], pine[2]]), pine[0], pine[2]);
  t.eq([a.caught[0].sort(), a.field], [[pine[0], pine[2]].sort(), [pine[1]]], 'two: the chosen one taken');
  a = H.play(at([pine[0]], [pine[1], pine[2], pine[3]]), pine[0]);
  t.eq([a.caught[0].length, a.field.length], [4, 0], 'three: all taken');
  a = H.play(at([pine[0]], [plum[0]]), pine[0]);
  t.eq([a.caught[0].length, a.field.length, a.phase], [0, 2, 'draw'], 'none: laid down, then the draw');
  a = H.draw(a);
  t.eq([a.pile.length, a.phase, a.turn], [0, 'play', 1], 'the turned card, then the other player');

  // ---- stop, koi-koi, doubling ---------------------------------------------------------------------------------------
  {
    const r = H.newRound(99, 0);
    r.hands = [[ids((c) => c.m === 5)[0]], [ids((c) => c.m === 6)[0]]]; r.field = [ids((c) => c.m === 5)[1]]; r.pile = [ids((c) => c.m === 7)[2], ids((c) => c.m === 7)[3]];
    r.caught = [tagged('crane', 'curtain'), []];
    r.caught[0].push(tagged('moon')[0]);
    r.shown = [0, 0];
    let n = H.play(r, r.hands[0][0]);
    n = H.draw(n);
    t.eq(n.phase, 'decide', 'a set made: stop or koi-koi');
    t.eq(H.score(n, 0), 5, 'three brights: 5 points');
    const k = H.decide(n, 'koi');
    t.eq([k.koi[0], k.phase, k.turn], [1, 'play', 1], 'koi-koi: play on, the other player\'s turn');
    k.caught[1] = tagged('boar', 'deer', 'butterflies', 'poem').concat(tagged('blue')).slice(0, 6);
    t.eq(H.score(k, 1), 2 * 2 * (5 + 5), 'their stop after your koi-koi: doubled, and seven or more doubled again');
    const st = H.decide(n, 'stop');
    t.eq([st.phase, st.result.winner, st.result.points], ['over', 0, 5], 'stop: the round is over, 5 points');
  }
  // ---- whole rounds: nothing lost, every round ends, the levels differ ---------------------------------------------
  let lost = 0, unended = 0, exhausted = 0, strong = 0, weak = 0;
  for (let s = 1; s <= 300; s++) {
    for (const L of [[1, 1], [2, 2], [3, 3], [3, 1]]) {
      const r = H.auto(s * 13 + L[0] * 5 + L[1], L);
      const all = r.hands[0].concat(r.hands[1], r.field, r.pile, r.caught[0], r.caught[1]);
      if (all.length !== 48 || new Set(all).size !== 48) lost++;
      if (r.phase !== 'over') unended++;
      if (r.result && r.result.winner === null) exhausted++;
    }
    const r1 = H.auto(s, [3, 1]), r2 = H.auto(s + 50000, [1, 3]);
    if (r1.result.winner === 0) strong += r1.result.points; else if (r1.result.winner === 1) weak += r1.result.points;
    if (r2.result.winner === 1) strong += r2.result.points; else if (r2.result.winner === 0) weak += r2.result.points;
  }
  t.eq([lost, unended], [0, 0], 'twelve hundred rounds: no card lost, every round ended');
  t.ok(exhausted > 0, 'and sometimes the cards run out with nobody stopping (' + exhausted + ')');
  t.ok(strong > weak, 'Thoughtful scores more than Gentle over 600 rounds (' + strong + ' to ' + weak + ')');

  // ---- the pastime --------------------------------------------------------------------------------------------------
  {
    const s = RB.state.newCampaign({ edition: 2 }); s.id = 'hf-test'; s.comp = 'nao'; RB.game.s = s;
    t.ok(!RB.pastimes.met(s).some((d) => d.id === 'hanafuda'), 'not met until a chapter teaches it');
    s.flags.pt_hanafuda = true;
    t.ok(RB.pastimes.met(s).some((d) => d.id === 'hanafuda'), 'met once taught (the flag pt_hanafuda)');
    const before = JSON.stringify(s.practice);
    RB.pastimes.get('hanafuda').records(s);
    t.eq(JSON.stringify(s.practice), before, 'reading its page makes no record');
    RB.pastimes.result(s, 'hanafuda', 'koikoi', true, 14);
    t.ok(RB.pastimes.get('hanafuda').records(s).some((x) => x.en === 'Best game' && /14/.test(x.value)), 'a game, a win and a best');
  }

  // ---- the Japanese -----------------------------------------------------------------------------------------------
  {
    const errs = [], unknown = new Map();
    const jcheck = (line, where) => {
      if (!line) return;
      for (const p of RB.jp.validate(line)) errs.push(where + ': ' + (p.msg || JSON.stringify(p)));
      for (const tk of RB.jp.parse(line)) {
        if (tk.punct || tk.ph || !/[぀-ヿ一-鿿]/.test(tk.surface)) continue;
        let info; try { info = RB.jp.lookup(tk); } catch (e) { info = { unknown: true }; }
        if (info.unknown && !unknown.has(tk.surface)) unknown.set(tk.surface, where);
      }
    };
    const walk = (o, where, seen = new Set()) => {
      if (!o || typeof o !== 'object' || seen.has(o)) return;
      seen.add(o);
      if (Array.isArray(o)) { o.forEach((x, i) => walk(x, where + '[' + i + ']', seen)); return; }
      if (typeof o.jp === 'string') { jcheck(o.jp, where); if (typeof o.en !== 'string' || !o.en) errs.push(where + ': no English'); }
      for (const k in o) if (k !== 'jp' && o[k] && typeof o[k] === 'object') walk(o[k], where + '.' + k, seen);
    };
    walk(H.DECK, 'deck'); walk(H.MONTHS, 'months'); walk(H.KINDS, 'kinds'); walk(H.YAKU, 'yaku'); walk(RB.pastimes.get('hanafuda'), 'pastime');
    const ui = fs.readFileSync(new URL('../../src/ui/88b_hanafuda.js', import.meta.url), 'utf8');
    for (const m of ui.matchAll(/(?:jhtml\(|label\(|jp: )'((?:[^'\\]|\\.)*[぀-ヿ一-鿿](?:[^'\\]|\\.)*)'/g)) jcheck(m[1], 'screen');
    t.eq(errs, [], 'every line has furigana on its kanji and English beside it');
    t.eq([...unknown.entries()].map(([w, at]) => w + ' (' + at + ')'), [], 'every word is in the dictionary');
  }
};
