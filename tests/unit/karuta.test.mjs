// Karuta (expansion P06, C12; src/engine/72e_karuta.js, src/content/pastimes/40_karuta.js, src/ui/88d_karuta.js):
// the deck (35 iroha proverbs, one per sound, in iroha order, each with a picture, its meaning and where it comes
// from); the game (a seeded mat and reading order; the right card is yours; a wrong one is お手つき and the partner
// takes the right one; the speed mode's reach; every card read once); the pastime's gate and read-only page; the
// first-finished-game stamp; every proverb with readings and every word in the dictionary.
import fs from 'node:fs';
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const K = RB.karuta, D = RB.content.karuta.deck;
  const IROHA = 'いろはにほへとちりぬるをわかよたれそつねならむうゐのおくやまけふこえてあさきゆめみしゑひもせす';

  // ---- the deck -----------------------------------------------------------------------------------------------------
  t.eq(D.length, 35, 'thirty-five cards');
  t.eq(new Set(D.map((c) => c.kana)).size, 35, 'one for each sound');
  t.ok(D.every((c, i) => i === 0 || IROHA.indexOf(c.kana) > IROHA.indexOf(D[i - 1].kana)), 'in iroha order');
  t.ok(D.every((c) => RB.jp.reading(c.jp).replace(/\s/g, '').charAt(0) === c.kana), 'each proverb begins with its card\'s sound');
  t.ok(D.every((c) => RB.ui.karuta.ART[c.art]), 'each card has its picture');
  t.ok(D.every((c) => c.en && c.means && RB.content.karuta.sets[c.set]), 'each with how it is said, what it means and where it comes from');
  t.eq(D.filter((c) => c.set !== 'edo').map((c) => c.kana + ':' + c.set), ['へ:kyoto', 'か:modern'], 'two cards from other traditional sets, named as such');

  // ---- the game -----------------------------------------------------------------------------------------------------
  const kanas = D.slice(0, 8).map((c) => c.kana);
  let g = K.newGame(42, kanas);
  t.eq(JSON.stringify(K.newGame(42, kanas)), JSON.stringify(g), 'the same seed lays out the same game');
  t.eq([g.mat.slice().sort().join(''), g.order.slice().sort().join('')], [kanas.slice().sort().join(''), kanas.slice().sort().join('')], 'every card on the mat, every card read');
  const first = K.current(g);
  g = K.pick(g, first);
  t.eq([g.taken[0], g.last.ok, g.i], [[first], true, 1], 'the right card: yours');
  const second = K.current(g), wrong = K.onMat(g).find((k) => k !== second);
  g = K.pick(g, wrong);
  t.eq([g.taken[1], g.otetsuki, g.last.touched, K.onMat(g).includes(wrong)], [[second], 1, wrong, true], 'お手つき: the partner takes the right card; the touched one stays');
  g = K.pick(g, first);
  t.eq(g.i, 2, 'a card already taken cannot be touched');
  g = K.partnerTakes(g);
  t.ok(g.last.quicker && g.taken[1].length === 2, 'speed mode: the partner was quicker');
  while (!K.over(g)) g = K.pick(g, K.current(g));
  t.eq([g.taken[0].length + g.taken[1].length, K.onMat(g).length, K.current(g)], [8, 0, null], 'every card taken; the game is over');

  // ---- the pastime and its stamp -------------------------------------------------------------------------------------
  {
    const s = RB.state.newCampaign({ edition: 2 }); s.id = 'kt-test'; s.comp = 'ren'; RB.game.s = s;
    t.ok(!RB.pastimes.met(s).some((d) => d.id === 'karuta'), 'not met until a chapter teaches it');
    s.flags.pt_karuta = true;
    t.ok(RB.pastimes.met(s).some((d) => d.id === 'karuta'), 'met once taught (the flag pt_karuta)');
    const before = JSON.stringify(s.practice);
    RB.pastimes.get('karuta').records(s);
    t.eq(JSON.stringify(s.practice), before, 'reading its page makes no record');
    t.ok(!RB.stampBook.earned(s, 'pt.karuta'), 'the stamp: not before a game');
    RB.pastimes.result(s, 'karuta', 'game', true, 6);
    t.ok(RB.stampBook.earned(s, 'pt.karuta'), 'a game finished: the stamp is earned');
    const s1 = RB.state.newCampaign({ edition: 1 }); s1.practice = s.practice;
    t.ok(!RB.stampBook.earned(s1, 'pt.karuta'), 'never in a six-chapter journey');
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
    walk(RB.content.karuta, 'karuta'); walk(RB.pastimes.get('karuta'), 'pastime'); walk(RB.content.stamps['pt.karuta'], 'stamp');
    const ui = fs.readFileSync(new URL('../../src/ui/88d_karuta.js', import.meta.url), 'utf8');
    for (const m of ui.matchAll(/(?:jhtml\(|label\(|jp: )'((?:[^'\\]|\\.)*[一-鿿](?:[^'\\]|\\.)*)'/g)) jcheck(m[1], 'screen');
    t.eq(errs, [], 'every line has furigana on its kanji and English beside it');
    t.eq([...unknown.entries()].map(([w, at]) => w + ' (' + at + ')'), [], 'every word is in the dictionary');
  }
};
