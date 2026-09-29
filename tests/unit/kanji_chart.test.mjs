// RB.kanjiInfo (the data behind the pad's kanji chart): every kanji the pad
// reads has an entry with readings, words, a theme and its uses; the themes
// come from the words' meanings (and never guess: a small "Other" page);
// search by kanji, word, kana reading, rōmaji and English meaning; "met"
// from the player's state. See docs/RECOGNITION.md "The chart".
import { load } from '../lib/load.mjs';

globalThis.__RB_TEST__ = true;
const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
const KI = RB.kanjiInfo;

export default async (t) => {
  const sup = RB.recog.supported({ kanji: true }).filter((c) => RB.kana.isKanji(c));
  const all = KI.all();
  t.eq(all.length, sup.length, `an entry for every kanji the pad reads (${sup.length})`);
  const themeIds = KI.themes().map((x) => x.id);
  const useIds = KI.uses().map((x) => x.id);
  t.ok(all.every((e) => themeIds.includes(e.theme)), 'every kanji has one theme');
  t.ok(all.every((e) => e.uses.every((u) => useIds.includes(u))), 'uses are known pages');
  t.ok(all.every((e) => e.ch === '々' || e.readings.length > 0), 'every kanji but 々 has a reading');
  t.ok(all.every((e) => e.words.length > 0 || e.textWord || e.ch === '王'), 'every kanji has a word from the game (a lexicon word, or a word from the text)');
  t.ok(all.every((e) => e.strokes > 0), 'every kanji has a stroke count');

  // themes: a small Other page; every theme page has kanji
  const count = {};
  for (const e of all) count[e.theme] = (count[e.theme] || 0) + 1;
  t.log('kanji per theme: ' + KI.themes().map((x) => x.id + ' ' + (count[x.id] || 0)).join(', '));
  t.ok((count.other || 0) / all.length <= 0.08, `"Other" is small (${count.other} of ${all.length}, <= 8%)`);
  for (const id of themeIds) t.ok(count[id] > 0, `theme ${id} has kanji`);
  const uses = {};
  for (const e of all) for (const u of e.uses) uses[u] = (uses[u] || 0) + 1;
  t.log('kanji per use: ' + useIds.map((u) => u + ' ' + (uses[u] || 0)).join(', '));

  // spot checks (kanji whose words leave no doubt)
  const expectTheme = {
    水: 'water', 海: 'water', 川: 'water', 酒: 'water', 雨: 'nature', 山: 'nature', 雪: 'nature', 火: 'nature', 木: 'living', 花: 'living', 鳥: 'living', 魚: 'living',
    手: 'body', 口: 'body', 目: 'body', 母: 'body', 道: 'places', 家: 'places', 門: 'places', 町: 'places', 日: 'time', 年: 'time', 一: 'time', 百: 'time',
    心: 'mind', 怒: 'mind', 夢: 'mind', 言: 'speech', 話: 'speech', 読: 'speech', 歩: 'actions', 走: 'actions', 守: 'actions', 刀: 'things', 鍵: 'things',
    王: 'other', 青: 'qualities', 赤: 'qualities', 大: 'qualities', 祭: 'society',
  };
  const wrong = Object.entries(expectTheme).filter(([ch, th]) => !KI.get(ch) || KI.get(ch).theme !== th).map(([ch, th]) => `${ch}: ${KI.get(ch) && KI.get(ch).theme} (want ${th}; ${KI.get(ch) && KI.get(ch).why})`);
  t.eq(wrong, [], 'themes of clear cases');
  const expectUse = { 守: ['noun', 'verb'], 走: ['verb'], 大: ['desc'], 青: ['desc'], 一: ['count'], 百: ['count'], 匹: ['count'], 水: ['noun'] };
  for (const [ch, us] of Object.entries(expectUse)) t.ok(us.every((u) => KI.get(ch).uses.includes(u)), `${ch} is on ${us.join(', ')} (${KI.get(ch).uses.join(', ')})`);
  t.ok(!KI.get('水').uses.includes('verb'), '水 is not on Verbs');

  // 守: readings, words, meaning through its words
  const m = KI.get('守');
  t.ok(m.readings.includes('まも') && m.readings.includes('もり'), '守 readings まも, もり: ' + m.readings.join(','));
  t.ok(m.words.some((w) => w.w === '守る' && /protect/.test(w.m)), '守 words include 守る (to protect)');
  t.eq(KI.get('水').meaning, 'water', '水: its own word gives the meaning');

  // search
  const first = (q) => (KI.search(q)[0] || {}).e;
  const has = (q, ch, n) => KI.search(q).slice(0, n || 5).some((x) => x.e.ch === ch);
  for (const [q, ch] of [['守', '守'], ['守る', '守'], ['まもる', '守'], ['マモル', '守'], ['mamoru', '守'], ['Mamoru', '守'], ['水', '水'], ['みず', '水'], ['mizu', '水'], ['water', '水'], ['sea', '海']]) {
    t.ok(first(q) && first(q).ch === ch, `search "${q}": ${ch} first (${KI.search(q).slice(0, 5).map((x) => x.e.ch).join('')})`);
  }
  t.ok(has('protect', '守', 3), 'search "protect": 守 in the first three');
  t.ok(has('to protect', '守', 3), 'search "to protect": 守 in the first three');
  t.ok(has('shi', '死', 60) || has('shi', '四', 60), 'search by a short rōmaji reading finds kanji read so');
  t.eq(KI.search('').length, 0, 'empty query: no results');
  t.eq(KI.search('zzqx').length, 0, 'nonsense query: no results');
  const t0 = performance.now();
  for (const q of ['water', 'みず', 'mizu', '守る', 'kyou', 'protect', 'a']) KI.search(q);
  t.ok((performance.now() - t0) / 7 < 25, 'a search takes well under 25 ms here');

  // met: from seen scenes, inscriptions and practised words
  const met = KI.met({ seen: { 'rw.village_first': true }, words: ['mamoru'], learn: { items: { 'v:雨': {} } }, notebook: [] });
  t.ok(met.has('川') && met.has('守') && met.has('雨'), 'met: a seen scene (川), an inscription (守 in 守る), a practised word (雨)');
  t.ok(!met.has('鍵'), 'met: a kanji not yet seen is not met');
  t.eq(KI.met(null).size, 0, 'met(null) is empty');
};
