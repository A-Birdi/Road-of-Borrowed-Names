// The base chapters' title cards in the twelve-chapter edition (Agnes 6548127532; Local CL-568, CL-569; Cloud CC-410;
// Agnes 6548240195). Each card said its six-chapter number in every journey, so an edition-2 Lanternfall said "Chapter 5"
// while the save said Chapter 8, and Cinder Orchard and Snowbell repeated Manybridge's and Blockprint's numbers. Now each
// card is two: ?(ed<2) as it was, ?(ed>=2) the story-order number. On the real runner, the screen stood in for, each of
// the four arrivals (co.arrive, sb.arrive, lf.arrive, sa.arrive), in edition 2, in edition 1, and in a save with no
// edition (an old one):
//  1. exactly one card, its number in Japanese and English: edition 2 Chapter 5, 6, 8, 12; edition 1 and no edition the
//     card word for word as before;
//  2. RB.edition.number (what the save's metadata shows) agrees with the card; the internal chapter and its key are
//     unchanged (3 co, 4 sb, 5 lf, 6 sa);
//  3. the arrival's other lines are the same in every edition;
//  4. word help: 第八章 and 第十二章 are lexicon words now ("Chapter Eight", "Chapter Twelve"), one word each; 第五章 and
//     第六章 as before; the edition-2 cards validate;
//  5. the practice index has neither (their readings are longer than its words), so the noun pools do not move;
//  and no scene ended on an error from the runner.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const flat = (x) => JSON.stringify(x);

  // the runner, with the screen stood in for: each line said and each card shown, in order
  let log = [];
  RB.ui.dialogue.say = async (o) => { log.push({ say: o && o.en }); };
  RB.ui.dialogue.choose = async () => 0;
  RB.ui.dialogue.hide = () => {};
  RB.ui.card = async (jp, en) => { log.push({ card: { jp, en } }); };
  RB.ui.toast = async () => {};
  RB.ui.shake = () => {};
  RB.ui.fade = async () => {};
  if (RB.interlude) RB.interlude.show = async () => {};
  for (const k of ['dismissExtras', 'refreshActors']) RB.world[k] = () => {};
  RB.game.afterScene = () => {};
  RB.save.autosave = async () => {};
  RB.test.enable({});
  if (!RB.game.G.settings) RB.game.G.settings = {};

  const errors = [];
  const arrive = async (scene, ed) => {
    const s = RB.state.newCampaign(); s.comp = 'nao';
    if (ed) s.edition = ed; else delete s.edition;
    RB.game.G.s = s; RB.game.s = s;
    log = [];
    try { await RB.script.run(scene, {}); } catch (e) { errors.push(scene + ': ' + String((e && e.message) || e)); }
    return { s, cards: log.filter((x) => x.card).map((x) => x.card), lines: log.filter((x) => x.say).map((x) => x.say) };
  };

  const U = '　';
  const CASES = [
    { scene: 'co.arrive', ch: 3, key: 'co', two: 5,
      one: { jp: '{第三章|だいさんしょう} ・ {灰実|はいみ}の{里|さと}', en: 'Chapter Three — Cinder Orchard' },
      ed2: { jp: '{第五章|だいごしょう} ・ {灰実|はいみ}の{里|さと}', en: 'Chapter 5 — Cinder Orchard' } },
    { scene: 'sb.arrive', ch: 4, key: 'sb', two: 6,
      one: { jp: '{第四章|だいよんしょう} ・ {雪鈴|ゆきすず}', en: 'Chapter Four — Snowbell' },
      ed2: { jp: '{第六章|だいろくしょう} ・ {雪鈴|ゆきすず}', en: 'Chapter 6 — Snowbell' } },
    { scene: 'lf.arrive', ch: 5, key: 'lf', two: 8,
      one: { jp: '{第五章|だいごしょう} ' + U + '{灯落|ひおち}', en: 'Chapter 5 — Lanternfall' },
      ed2: { jp: '{第八章|だいはっしょう} ' + U + '{灯落|ひおち}', en: 'Chapter 8 — Lanternfall' } },
    { scene: 'sa.arrive', ch: 6, key: 'sa', two: 12,
      one: { jp: '{第六章|だいろくしょう} ' + U + ' {静寂|しじま} の {書庫|しょこ}', en: 'Chapter Six — The Still Archive' },
      ed2: { jp: '{第十二章|だいじゅうにしょう} ' + U + ' {静寂|しじま} の {書庫|しょこ}', en: 'Chapter 12 — The Still Archive' } },
  ];

  for (const c of CASES) {
    const r2 = await arrive(c.scene, 2), r1 = await arrive(c.scene, 1), r0 = await arrive(c.scene, null);
    t.ok(flat(r2.cards) === flat([c.ed2]) && flat(r1.cards) === flat([c.one]) && flat(r0.cards) === flat([c.one]),
      '1 ' + c.scene + ': one card each; edition 2 "' + c.ed2.en + '", edition 1 and no edition "' + c.one.en + '" as before ' + flat([r2.cards, r1.cards, r0.cards].map((x) => x.map((y) => y.en))));
    const n = (r) => [RB.edition.number(r.s), r.s.chapter, r.s.chapterKey];
    t.ok(flat(n(r2)) === flat([c.two, c.ch, c.key]) && flat(n(r1)) === flat([c.ch, c.ch, c.key]) && flat(n(r0)) === flat([c.ch, c.ch, c.key]),
      '2 ' + c.scene + ': the number shown (and in the save\'s metadata) agrees with the card; the internal chapter ' + c.ch + ' and key ' + c.key + ' unchanged ' + flat([n(r2), n(r1), n(r0)]));
    t.ok(r2.lines.length > 0 && flat(r2.lines) === flat(r1.lines) && flat(r1.lines) === flat(r0.lines),
      '3 ' + c.scene + ': the arrival\'s other lines are the same in every edition (' + r2.lines.length + ' lines)');
  }

  // 4: word help and validation
  const look = (w) => { const r = RB.jp.lookup(w); return { lemma: r.lemma, m: r.meaning, parts: !!r.parts, unknown: r.unknown }; };
  const L8 = look('{第八章|だいはっしょう}'), L12 = look('{第十二章|だいじゅうにしょう}');
  t.ok(flat(L8) === flat({ lemma: '第八章', m: 'Chapter Eight', parts: false, unknown: false }) && flat(L12) === flat({ lemma: '第十二章', m: 'Chapter Twelve', parts: false, unknown: false }) &&
    !!RB.lex.get('第八章', 'だいはっしょう') && !!RB.lex.get('第十二章', 'だいじゅうにしょう'),
    '4 word help: 第八章 "Chapter Eight" and 第十二章 "Chapter Twelve", lexicon words, one word each ' + flat([L8, L12]));
  t.ok(look('{第五章|だいごしょう}').m === 'Chapter Five' && look('{第六章|だいろくしょう}').m === 'chapter six', '4 第五章 and 第六章 as before');
  // (as tools/validate.mjs checks a line: its markup, then every word known to word help)
  const bad = CASES.flatMap((c) => RB.jp.validate(c.ed2.jp).map((e) => e.code)
    .concat(RB.jp.parse(c.ed2.jp).filter((x) => !x.punct && !x.ph && /[぀-ヿ一-鿿]/.test(x.surface) && RB.jp.lookup(x).unknown).map((x) => 'unknown ' + x.surface)));
  t.ok(!bad.length, '4 the edition-2 cards validate: their markup, and every word known to word help ' + flat(bad.slice(0, 3)));

  // the kanji chart's word lists gain them, as they hold every other chapter number: 第, 八, 十, 二 and 章, no others
  const holders = (w) => RB.kanjiInfo.all().filter((e) => (e.words || []).some((x) => x.w === w)).map((e) => e.ch).sort();
  const sizes = Object.fromEntries(['第', '八', '十', '二', '章'].map((ch) => [ch, (RB.kanjiInfo.get(ch).words || []).length]));
  t.ok(flat(holders('第八章')) === flat(['八', '章', '第'].sort()) && flat(holders('第十二章')) === flat(['二', '十', '章', '第'].sort()),
    '4 the kanji chart\'s word lists gain them: 第八章 under 第, 八, 章; 第十二章 under 第, 十, 二, 章; no other kanji ' + flat({ l8: holders('第八章'), l12: holders('第十二章'), sizes }));

  // 5: the practice index
  const idx = RB.tasks.kanaWordIndex();
  t.ok(!idx.some((x) => x.w === '第八章' || x.w === '第十二章'), '5 the practice index has neither new word (their readings are longer than its words), so the noun pools do not move');

  t.ok(!errors.length, 'no scene ended on an error from the runner ' + errors.slice(0, 3).join(' | '));
};
