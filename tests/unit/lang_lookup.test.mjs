// RB.jp.deinflect and RB.jp.lookup (lightbulb help).
import { load } from '../lib/load.mjs';

const RB = load(['core', 'lang']);
const J = RB.jp;

export default async (t) => {
  // ---- deinflection: base forms reachable
  const has = (w, base) => J.deinflect(w).some((d) => d.base === base);
  const D = [
    ['食べました', '食べる'], ['行って', '行く'], ['行った', '行く'], ['いって', 'いく'], ['読んでいた', '読む'],
    ['高くなかった', '高い'], ['見られる', '見る'], ['来ない', '来る'], ['こない', 'くる'], ['した', 'する'],
    ['きた', 'くる'], ['食べません', '食べる'], ['食べませんでした', '食べる'], ['食べましょう', '食べる'],
    ['書かない', '書く'], ['書かなかった', '書く'], ['書かなくて', '書く'], ['書かなければ', '書く'],
    ['泳いだ', '泳ぐ'], ['話して', '話す'], ['待っている', '待つ'], ['待ってた', '待つ'], ['待ってる', '待つ'],
    ['読んでいます', '読む'], ['読んでいました', '読む'], ['忘れてしまった', '忘れる'], ['忘れちゃった', '忘れる'],
    ['飲んじゃう', '飲む'], ['行きたい', '行く'], ['行きたかった', '行く'], ['行きたくない', '行く'],
    ['読まれる', '読む'], ['読める', '読む'], ['食べさせる', '食べる'], ['書かせる', '書く'], ['させる', 'する'],
    ['食べよう', '食べる'], ['行こう', '行く'], ['しよう', 'する'], ['読めば', '読む'], ['食べれば', '食べる'],
    ['すれば', 'する'], ['来れば', '来る'], ['読んだら', '読む'], ['高ければ', '高い'], ['食べろ', '食べる'],
    ['書け', '書く'], ['しろ', 'する'], ['来い', '来る'], ['高く', '高い'], ['高くて', '高い'], ['高さ', '高い'],
    ['よかった', 'いい'], ['よくない', 'いい'], ['書いてください', '書く'], ['書かないでください', '書く'],
    ['静かでした', '静か'], ['先生です', '先生'], ['学生だった', '学生'], ['静かな', '静か'],
    ['いらっしゃいます', 'いらっしゃる'], ['考えておく', '考える'], ['買っておいた', '買う'], ['書いてある', '書く'],
    ['死んだ', '死ぬ'], ['遊んで', '遊ぶ'], ['行かなきゃ', '行く'], ['食べなければならない', '食べる'],
  ];
  for (const [w, b] of D) t.ok(has(w, b), `deinflect ${w} → ${b}`);
  const f = J.deinflect('食べました').find((d) => d.base === '食べる');
  t.eq(f.rules, ['polite past (～ました)'], 'form description in plain English');
  const g = J.deinflect('読んでいた').find((d) => d.base === '読む');
  t.eq(g.rules, ['～ている: ongoing action or resulting state', 'past (～た)'], 'steps base-outward; bare て step folded');
  t.ok(J.deinflect('行った', { known: true }).every((d) => d.base !== '行う' || RB.lex.bySurface('行う').length), 'known:true filters to lexicon');
  t.eq(J.deinflect('書った').filter((d) => d.base === '書く').map((d) => d.type), ['v5k-s'], '書った → 書く only via the 行く-type rule');
  t.eq(J.lookup('書った').entry, null, 'POS check: 書く is not v5k-s, so 書った is not accepted');

  // ---- lookup order and results
  const L = (x) => J.lookup(x);
  let r = L('{食|た}べました');
  t.eq([r.entry && r.entry.w, r.lemma, r.forms, r.reading, r.romaji], ['食べる', '食べる', ['polite past (～ました)'], 'たべました', 'tabemashita'], 'inflected verb');
  t.eq(r.mora, ['た', 'べ', 'ま', 'し', 'た'], 'mora');
  r = L('{行|い}って');
  t.eq(r.entry && r.entry.w, '行く', '行って → 行く');
  r = L('{高|たか}くなかった');
  t.eq(r.entry && r.entry.w, '高い', '高くなかった → 高い');
  r = L('{来|こ}ない');
  t.eq(r.entry && r.entry.pos, 'vk', '来ない → 来る (vk, POS checked)');
  r = L('した@する');
  t.eq(r.entry && r.entry.w, 'する', 'lemma hint forces する');
  r = L('した');
  t.ok(r.entry.w === 'する' && r.others.some((e) => e.w === '下'), 'kana した → する, with 下 (した) as an alternative');
  r = L('{下|した}');
  t.eq(r.entry && r.entry.w, '下', 'kanji token 下 is unambiguous');
  // context: auxiliary after a て-form
  let toks = J.parse('{買|か}って おきます');
  t.eq(L(toks[1]).entry.w, '置く', 'おきます after a て-form → 置く (～ておく)');
  toks = J.parse('{毎朝|まいあさ} おきます');
  t.eq(L(toks[1]).entry.w, '起きる', 'おきます elsewhere → 起きる');
  t.eq((L('{雪|ゆき}だそうです').parts || []).map((p) => p.surface), ['雪', 'だ', 'そう', 'です'], 'hearsay そう split, not 出す');
  t.eq(L('しまいました').entry.w, 'しまう', 'しまう');
  t.eq(L('いけません').entry.w, 'いける', 'いけません → いける, not 行く');
  r = L('はし@箸=(chopsticks)');
  t.eq([r.entry && r.entry.w, r.gloss, r.meaning], ['箸', 'chopsticks', 'chopsticks'], 'lemma + context gloss');
  r = L('{今日|きょう}');
  t.eq(r.entry && r.entry.r, 'きょう', 'exact surface + reading');

  // multi-morpheme tokens
  const parts = (x) => (L(x).parts || []).map((p) => p.surface + ':' + (p.entry ? p.entry.w : '?'));
  t.eq(parts('わたしは'), ['わたし:私', 'は:は'], 'わたしは → わたし + は');
  t.eq(parts('ここで'), ['ここ:ここ', 'で:で'], 'ここで');
  t.eq(parts('みずを'), ['みず:水', 'を:を'], 'みずを');
  t.eq(parts('{先生|せんせい}です'), ['先生:先生', 'です:です'], '先生です → 先生 + です');
  t.eq(parts('{雨|あめ}ですね'), ['雨:雨', 'です:です', 'ね:ね'], 'noun + copula + particle');
  t.eq(parts('{行|い}かざるを{得|え}ない'), ['行かざる:行く', 'を:を', '得ない:得る'], 'general segmentation');
  r = L('わたしは');
  t.eq([r.entry && r.entry.w, r.romaji], ['私', 'watashi wa'], 'head entry and particle romaji (wa)');
  r = L('{水|みず}を');
  t.eq(r.romaji, 'mizu o', 'を romanised o as a particle');
  r = L('こんにちは');
  t.eq(r.romaji, 'konnichiwa', 'romaji override');
  r = L('$nameさん');
  t.eq(r.name, 'name', 'placeholder head recognised as a name');
  t.eq(L('$name').name, 'name', 'placeholder-only token');

  // unknown still gives reading / romaji / mora
  r = L('ぽにょぽにょ');
  t.ok(r.unknown && r.entry === null, 'unknown word');
  t.eq([r.reading, r.romaji, r.mora.length], ['ぽにょぽにょ', 'ponyoponyo', 4], 'unknown still has reading/romaji/mora');
  r = L('。');
  t.ok(r.punct, 'punctuation lookup');

  // lookup works on tokens from render()
  const out = J.render('{私|わたし}は {港|みなと}へ {行|い}きました。');
  const words = out.tokens.filter((x) => !x.punct).map((x) => L(x));
  t.eq(words.map((w) => w.entry && w.entry.w), ['私', '港', '行く'], 'render tokens → lookup');
};
