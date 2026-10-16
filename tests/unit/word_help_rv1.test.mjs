// Word help (RB.jp.lookup, RB.dialect.lookupIn) on the kana words the RV-1 register review found explained as another
// word (docs/review/register/REGISTER_REVIEW.md § D6): sentence-final かい was 回 "times", やめる was 止む, つく was
// 着く "arrive", な + んだ was 何, おかげ was 影, Kansai 〜て へん was 変 "strange", the pronoun おれ was the imperative of
// おる. Each is read in its place in a line (some entries fit one place only), and the same kana elsewhere keeps its
// own meaning. No line changes: only the lexicon and the lookup.
import { load } from '../lib/load.mjs';

globalThis.__RB_TEST__ = true;
const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
const desc = (r) => (r && r.entry ? r.entry.w + ':' + r.entry.pos : r && r.parts ? r.parts.map((p) => p.entry && p.entry.w).join('+') : '?');
// the word help for the token `surface` (its n-th occurrence) in a line of markup, as the dialogue shows it
const at = (line, surface, n) => {
  const toks = RB.jp.parse(line);
  const i = toks.map((t, k) => (t.surface === surface ? k : -1)).filter((k) => k >= 0)[n || 0];
  return i == null ? null : RB.jp.lookup(toks[i]);
};
const word = (line, surface, n) => desc(at(line, surface, n));
// a Kansai line: the Kansai lexicon first, then the standard lookup (as word help does)
const kansai = (line, surface) => {
  const toks = RB.jp.parse(line);
  const i = toks.findIndex((t) => t.surface === surface);
  return RB.dialect.lookupIn(toks, i) || RB.jp.lookup(toks[i]);
};

export default async (t) => {
  // かい: the sentence-final question particle, with a register note; かい elsewhere is not the particle
  t.eq([word('そう かい 。 {道|みち} は 、 {逃|に}げない よ 。', 'かい'), word('{灯|ひ} の {道|みち} から {来|き}た の かい 。', 'かい'),
    word('{一緒|いっしょ} に {歩|ある}く かい 、 レン 。', 'かい'), word('げんき に して いる かい', 'かい')],
  ['かい:prt', 'かい:prt', 'かい:prt', 'かい:prt'], 'sentence-final かい is the question particle (before 。, 、 or the line\'s end)');
  t.ok(/older speakers/.test(at('そう かい 。', 'かい').entry.n) && /ですか/.test(at('そう かい 。', 'かい').entry.n), 'かい carries a register note (familiar, older speakers; say 〜の？ / 〜ですか)');
  t.ok(!/かい:prt/.test(word('かい を とったら だめ 。', 'かい')) && !/かい:prt/.test(word('はる に ヤギ を かい に いきます 。', 'かい')), 'かい before を / に is not the particle');
  t.eq(word('かい', 'かい'), '回:ctr', 'a bare かい, with no line around it, is unchanged');
  t.eq([word('{眠|ねむ}れた かね 。', 'かね'), word('かね が なる と 、 むら の ひと が おきた', 'かね'), word('かね', 'かね')], ['かね:prt', '鐘:n', '鐘:n'], 'sentence-final かね is the particle; かね が is the bell');
  t.eq([word('{見|み}た とも 。', 'とも'), word('{立派|りっぱ} です とも ！', 'とも'), word('{三|みっ}つ とも ！', 'とも'), word('{許|ゆる}す とも 、 {許|ゆる}さない とも {書|か}いて ない 。', 'とも')],
    ['とも:prt', 'とも:prt', '友:n', '友:n'], 'とも "certainly" ends a sentence after a verb or です; 三つ とも and 許す とも 、 are not it');

  // やめる (to quit, to stop doing), not 止む (rain stopping)
  t.eq([word('やめて', 'やめて'), word('やめて おく', 'やめて'), word('やめておく', 'やめておく'), word('{寄|よ}り{道|みち} は やめない よ', 'やめない')],
    ['やめる:v1', 'やめる:v1', 'やめる:v1', 'やめる:v1'], 'やめる in kana is "to stop doing, to quit"');
  t.eq(at('{九十九|きゅうじゅうきゅう} で {止|や}める なんて', '止める').entry.r, 'やめる', '止める read やめる is やめる, not とめる');

  // つく: in kana, the つく of 嘘をつく, 気がつく, 名前がつく, ついて来る; not 着く "arrive"
  t.eq([word('{嘘|うそ} を ついた 。', 'ついた'), word('{気|き} が ついたら あった 。', 'ついたら'), word('{名前|なまえ} が ついた とたん に', 'ついた'),
    word('{黙|だま}って ついて {来|き}た 。', 'ついて'), word('{数字|すうじ} は {嘘|うそ} を つかない 。', 'つかない')],
  ['つく:v5k', 'つく:v5k', 'つく:v5k', 'つく:v5k', 'つく:v5k'], 'kana つく is つく (attached, follow, tell a lie, notice), not 着く');
  t.ok(/{嘘\|うそ}を つく/.test(at('{嘘|うそ} を ついた 。', 'ついた').entry.n), 'つく\'s note names the words kana つく can be');
  t.eq(word('{記録|きろく} の {付|つ}け{方|かた} に ついて {話|はな}した', 'ついて'), 'ついて:exp', '〜に ついて is "about"');
  t.eq([word('{気|き} を つけて 。', 'つけて'), word('{名前|なまえ} を つける の は {大事|だいじ}', 'つける'), word('{疲|つか}れた 。 つかれて {動|うご}けない', 'つかれて')],
    ['つける:v1', 'つける:v1', 'つかれる:v1'], 'つける and つかれる stay themselves (not a form of つく)');
  t.eq(at('{気|き} を つけな 。', 'つけな').parts.map((p) => p.entry.w + ':' + (p.forms.join() || '-')), ['つける:stem form (used in compounds and polite patterns)', 'な:-'],
    '気を つけな: the stem of つける + な (a soft command), not an imperative of つく');

  // な + んだ / んです after a word; なんだ opening a sentence is still "what"
  t.eq([word('{子|こ}ども は {一杯|いっぱい} まで なんだ よ 。', 'なんだ'), word('{苦手|にがて} なんだ よ な 。', 'なんだ'), word('{父|ちち} を ご{存知|ぞんじ} なんです か 。', 'なんです'),
    word('「 {八百|はっぴゃく} 」 なんだ 。', 'なんだ'), word('{仲|なか} が いい {証拠|しょうこ} なんだって 。', 'なんだって')],
  ['なんだ:exp', 'なんだ:exp', 'なんです:exp', 'なんだ:exp', 'なんだって:exp'], 'な + explanatory んだ / んです after a word');
  t.eq(at('なんだ 、 お{前|まえ} か 。', 'なんだ').parts.map((p) => p.entry.w), ['何', 'だ'], 'なんだ opening a sentence is 何 + だ ("what")');

  // おかげ, おれ, お前
  t.eq([word('{北|きた} の {道|みち} が {通|とお}った おかげ さ 。', 'おかげ'), word('あなた の おかげ で 、 {下|した} は {助|たす}かった 。', 'おかげ')], ['おかげ:n', 'おかげ:n'], 'おかげ "thanks to", not お + 影');
  t.eq([word('おれ の ヤギ は {十頭|じゅっとう} だ 。', 'おれ'), word('いいなあ 。 おれ 、 {見|み}た こと ない っすよ 。', 'おれ'), word('おれ', 'おれ')], ['おれ:pn', 'おれ:pn', 'おれ:pn'], 'the pronoun おれ, not the imperative of おる');
  t.eq([word('おまえ が {帰|かえ}る まで', 'おまえ'), word('{書|か}ける の か 。 お{前|まえ}さん 。', 'お前さん')], ['お前:pn', 'お前さん:pn'], 'おまえ / お前さん are "you", not お + 前');

  // Kansai 〜て へん (= 〜て いない); この へん is "around here"
  const hen = kansai('{誰|だれ} も {数|かぞ}えて へん って こと や 。', 'へん');
  t.ok(hen && hen.entry && hen.entry.w === 'へん' && hen.dia && /ていない/.test(hen.dia.std), 'Kansai 〜て へん is the negative (= 〜て いない), not 変 "strange": ' + desc(hen));
  t.ok(desc(kansai('この へん に きつね が でる 。', 'へん')) !== 'へん:aux', 'この へん is not the Kansai negative');
  t.eq(desc(kansai('…… おおきに 。 {相方|あいかた} が あんた で よかった わ 。', 'おおきに')), 'おおきに:int', 'Kansai おおきに "thank you", not お + 沖');
  t.eq(desc(kansai('{誰|だれ} に も {見|み}せへん かった 。', 'かった')), 'かった:aux', 'Kansai 〜へん かった: the past ending, not 買う');
  t.eq(word('{大|おお}きな {石|いし} で {通|とお}れん かった 。', 'かった'), 'かった:aux', '〜ん かった (= 〜なかった), not 買う "buy"');

  // marked forms that word help now explains, with a register note
  for (const [line, s, w] of [['{手|て} を {貸|か}して おくれ 。', 'おくれ', 'おくれ'], ['さあさあ 、 お{立|た}ち{会|あ}い ！', 'お立ち会い', 'お立ち会い'],
    ['{竹屋|たけや} で ござる 。', 'ござる', 'ござる'], ['{全部|ぜんぶ} {解|と}かれて しもうた 。', 'しもうた', 'しもうた'], ['{力|ちから} が ある じゃろう に 。', 'じゃろう', 'じゃろう'],
    ['{湯|ゆ} に は {入|い}れないで くださいまし 。', 'くださいまし', 'くださいまし'], ['{持|も}って おいき 。', 'おいき', 'お行き'], ['ヒロ 、 おいで 。', 'おいで', 'おいで']]) {
    const r = at(line, s);
    t.ok(r && r.entry && r.entry.w === w && !!r.entry.n, s + ' is ' + w + ', with a register note: ' + desc(r));
  }
  t.eq([word('{宛名|あてな} なし で あんた に {預|あず}けて おく 。', 'なし'), word('{利子|りし} も なし 。', 'なし')], ['なし:n', 'なし:n'], 'kana なし is "none, without", not 梨 "pear"');
  t.ok(at('{宛名|あてな} なし で', 'なし').entry.w === 'なし' && /without/.test(at('{宛名|あてな} なし で', 'なし').entry.m), 'なし means "without"');
  t.eq(at('{誰|だれ} に も {届|とど}けんな よ 。', '届けんな').parts.map((p) => p.entry.w), ['届ける', 'んな'], '届けんな: 届け + んな (= るな, "don\'t"), not the negative ん + な');
  t.ok(/= だ/.test(at('{狐|きつね} じゃ 。', 'じゃ').entry.m), 'じゃ ending a sentence is explained as the copula (= だ) too');
  t.ok(/= ない/.test(RB.lex.get('ん', 'ん').m), 'ん is also explained as the negative (〜ん = 〜ない)');
  t.eq(RB.lex.conflicts().filter((c) => /^(かい|かね|とも|なんだ|なんです|なんだって|かった|ちゃ|おくれ|おれ|つく|つける|つかれる|やめる|おかげ)$/.test(c.w)), [], 'the new entries conflict with nothing');
};
