// A kanji question names the target's place in its word when the word has more than one kanji (RBN audit T02); a target
// written twice or more is asked at one place per ask. The place turns once per round of the kanji's word list,
// at[Math.floor(n / len) % at.length], so every place is asked whatever the list's length (Agnes 6355139781; Local CL-237;
// Cloud CC-146 §3). The old at[n % at.length] missed places whenever the list's length and the count of places share a
// factor (an even list and a word with the target twice: always the same place). The first ask of every word is now its
// first place; before, a word at an odd index could begin on its second. In node, with synthetic word lists (a stub of
// RB.kanjiInfo.get for one kanji) and the real data:
//  1. lists of length 1 to 6, the repeated word at every index, the target twice and three times: over successive rounds
//     the places come first, second (, third), then wrap round; the first ask is the first place;
//  2. Write and Choose name the same place, the answer is the target, the correct option is the target with its own
//     reading as ruby, and the scoring fields are those of any write question;
//  3. a word with the target once is asked the same way on every round; a single-word list works; an empty list asks
//     nothing;
//  4. the real data: every kanji's words with the target more than once have all their places asked within as many
//     rounds as places; 時々, 々 and kana counting as before.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const X = RB.exams;
  const s = RB.state.newCampaign({ profile: 'E' });
  s.learn.kanaKnown = 'both';
  RB.game.s = s;
  const real = RB.kanjiInfo.get;
  const ORD = ['first', 'second', 'third', 'fourth', 'fifth'];
  const placeOf = (q) => { const m = q && /the (first|second|third|fourth|fifth) (?:kanji|character) of/.exec(q.prompt.en); return m ? m[1] : null; };
  const one = real('一');
  const fill = [{ w: '一人', r: 'ひとり', m: 'one person' }, { w: '一月', r: 'いちがつ', m: 'January' }, { w: '一日', r: 'いちにち', m: 'one day' }, { w: '一回', r: 'いっかい', m: 'once' }, { w: '一本', r: 'いっぽん', m: 'one long thing' }];
  const TWO = { w: '一字一句', r: 'いちじいっく', m: 'every single word' }, THREE = { w: '一石一鳥一', r: 'いっせきいっちょういち', m: '(fixture: the target three times)' };
  const stub = (words) => { RB.kanjiInfo.get = (ch) => (ch === '一' ? Object.assign({}, one, { words }) : real(ch)); };
  // ---- 1. and 2.
  const bad1 = [], bad2 = [];
  for (const [word, places] of [[TWO, ['first', 'third']], [THREE, ['first', 'third', 'fifth']]]) {
    for (let len = 1; len <= 6; len++) for (let i = 0; i < len; i++) {
      const words = fill.slice(0, len - 1); words.splice(i, 0, word); stub(words);
      const got = [];
      for (let q = 0; q < places.length * 2; q++) {
        const n = i + q * len, w = X.question(s, 'j:一', 'hand', n), c = X.question(s, 'j:一', 'choice', n);
        got.push(placeOf(w));
        const ok = c && c.options.find((o) => o.ok);
        if (!(w && w.answer === '一' && w.accept.join() === '一' && w.mode === 'exact' && w.single === true && placeOf(c) === placeOf(w) && ok && /^\{一\|/.test(ok.jp))) bad2.push(word.w + ' len ' + len + ' at ' + i + ' n ' + n + ': ' + JSON.stringify({ w: w && w.prompt.en, c: c && c.prompt.en, ok: ok && ok.jp }));
      }
      const want = Array.from({ length: places.length * 2 }, (_, q) => places[q % places.length]);
      if (got.join() !== want.join()) bad1.push(word.w + ' len ' + len + ' at ' + i + ': ' + got.join(','));
    }
  }
  t.eq(bad1, [], 'lists of length 1 to 6, the repeated word at every index, twice and three times: every place in turn, the first first, then round again');
  t.eq(bad2, [], 'Write and Choose name the same place; the answer is the target; the correct option is the target with its own reading; the write fields as for any write question');
  // ---- 3.
  stub([fill[0], fill[1], fill[2], fill[3]]);
  const single = [0, 1, 4, 5, 8, 9].map((n) => X.question(s, 'j:一', 'hand', n).prompt.en);
  t.ok(single.every((p) => p === single[0] || p === single[1]) && single[0] === X.question(s, 'j:一', 'hand', 4).prompt.en, 'a word with the target once is asked the same way on every round');
  stub([TWO]);
  t.eq([0, 1, 2, 3].map((n) => placeOf(X.question(s, 'j:一', 'hand', n))), ['first', 'third', 'first', 'third'], 'a list of one word: its places in turn');
  stub([]);
  t.ok(X.question(s, 'j:一', 'hand', 0) === null && X.question(s, 'j:一', 'choice', 3) === null, 'an empty list asks nothing');
  RB.kanjiInfo.get = real;
  // ---- 4.
  const miss = [];
  for (const e of RB.kanjiInfo.all()) {
    const words = e.words || [], len = words.length;
    words.forEach((w, i) => {
      const kj = Array.from(w.w).filter((c) => RB.kana.isKanji(c));
      const at = kj.map((c, k) => (c === e.ch ? k : -1)).filter((k) => k >= 0);
      if (kj.length < 2 || at.length < 2) return;
      const seen = new Set();
      for (let q = 0; q < at.length; q++) seen.add(placeOf(X.question(s, 'j:' + e.ch, 'hand', i + q * len)));
      const want = new Set(at.map((k) => ORD[k]));
      if ([...want].some((x) => !seen.has(x))) miss.push(e.ch + ' ' + w.w + ' (' + len + ' words, at ' + i + '): ' + [...seen].join(','));
    });
  }
  t.eq(miss, [], 'the real data: every word with its target more than once has every place asked within as many rounds as places');
  const P = (ch, word) => { const ws = RB.kanjiInfo.get(ch).words, i = ws.findIndex((w) => w.w === word); return X.question(s, 'j:' + ch, 'hand', i).prompt.en; };
  t.ok(/^Write the second character of ときどき .*Each kanji and the repeat mark count as one\.$/.test(P('々', '時々')) && /^Write the second kanji of たべもの .*Kana are not counted\.$/.test(P('物', '食べ物')), '々 and kana are counted as before (時々, 食べ物)');
};
