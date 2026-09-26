/* Lookup extensions used when the core lookup finds nothing:
 *  - number + counter compounds written as one ruby group ({三回|さんかい})
 *  - character names registered from RB.content.chars (see registerNames)
 * Results are honest: they describe the parts, never invent a meaning. */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const base = RB.jp.lookup;
  const NUM = { 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10, 百: 100, 千: 1000, 万: 10000 };
  function parseNum(s) {
    if (s === '何') return { en: 'how many' };
    if (s === '数') return { en: 'several' };
    let total = 0, cur = 0;
    for (const ch of s) {
      const v = NUM[ch];
      if (v == null) return null;
      if (v >= 10) { total += (cur || 1) * v; cur = 0; } else cur = cur * 10 + v;
    }
    return { n: total + cur, en: String(total + cur) };
  }
  const COUNTERS = {
    回: 'times', 度: 'times (occasions)', 日: 'day(s)', 年: 'year(s)', 杯: 'cup(s)/glass(es)', 本: 'long thin things', 枚: 'flat things (sheets)',
    人: 'people', 冊: 'books/volumes', 通: 'letters', 番: 'number (in order)', 重: '-fold (layers)', 時間: 'hour(s)', 時: "o'clock", 分: 'minute(s)',
    個: 'small things', 匹: 'small animals', 頭: 'large animals', 羽: 'birds', 台: 'machines/vehicles', 軒: 'houses', 階: 'floor(s)', 歳: 'years old',
    週間: 'week(s)', か月: 'month(s)', ヶ月: 'month(s)', 箱: 'boxes', 袋: 'bags', 足: 'pairs of footwear', 着: 'garments', 隻: 'ships', 艘: 'small boats',
    里: 'ri (old distance unit, fictional use here)', 歩: 'steps', 行: 'lines (of text)', 文字: 'characters (letters)', 点: 'points', 件: 'matters/cases', 束: 'bundles',
  };
  function counterLookup(tok) {
    const s = tok.surface || '';
    const m = s.match(/^([一二三四五六七八九十百千万何数]+)(.+)$/);
    if (!m) return null;
    const num = parseNum(m[1]);
    if (!num) return null;
    let ctr = m[2];
    let meaning = COUNTERS[ctr];
    if (!meaning && RB.lex) {
      const e = (RB.lex.bySurface(ctr) || []).find((x) => x.pos === 'ctr' || x.pos === 'suf');
      if (e) meaning = e.m;
    }
    if (ctr === '月' && /がつ$/.test(tok.reading || '')) return { en: 'month number ' + num.en + (num.n ? ' (' + ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][num.n] + ')' : '') };
    if (!meaning) return null;
    return { en: num.en + ' × ' + meaning };
  }
  RB.jp.lookup = function (tok) {
    const r = base(tok);
    if (!r || !r.unknown) return r;
    const t = typeof tok === 'string' ? RB.jp.parse(tok)[0] || { surface: tok } : tok;
    const c = counterLookup(t);
    if (c) {
      return Object.assign({}, r, {
        unknown: false,
        entry: { w: t.surface, r: t.reading || r.reading, m: c.en, pos: 'ctr', lv: 'E', n: 'Number + counter. Japanese counts things with counters chosen by the kind of thing; readings of numbers can change before some counters.' },
        forms: ['number + counter'],
      });
    }
    return r;
  };
  // Register every character's name as a lexicon entry (pos 'name').
  RB.jp.registerNames = function () {
    if (!RB.lex || !RB.content || !RB.content.chars) return 0;
    const list = [];
    for (const id in RB.content.chars) {
      const c = RB.content.chars[id];
      if (!c.name || !c.name.jp) continue;
      const w = RB.jp.plain(c.name.jp);
      const r = RB.jp.reading(c.name.jp).replace(/\s/g, '');
      if (!w || !RB.kana.isKanaString(r)) continue;
      if (RB.lex.get(w, r)) continue;
      list.push({ w, r, pos: 'name', lv: 'F', m: c.name.en + ' (a name)' });
    }
    RB.lex.add(list, 'names');
    return list.length;
  };
})();
