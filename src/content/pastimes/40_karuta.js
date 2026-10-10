/* Karuta (expansion P06, C12): iroha karuta, the real children's card game of proverbs. The reader reads a proverb
 * (読み札); the players look for its picture card (取り札), marked with the proverb's first sound. Thirty-five cards of
 * the Edo set (江戸いろはかるた), in iroha order; two from other traditional sets stand in for a crude Edo card (へ)
 * and one that mocks illness (か), and cards whose sound is muddled by old spelling (を, れ, ゐ, ゑ) or whose saying
 * is obscure today are left out. Each card: kana (its sound), jp (the proverb, word by word), en (as it is said),
 * means (what it means), art (its picture), set (where it comes from when not the Edo set). */
var RB = (globalThis.RB = globalThis.RB || {});
(function (C) {
  'use strict';
  const K = (kana, jp, en, means, art, set) => ({ kana, jp, en, means, art, set: set || 'edo' });
  C.karuta = C.karuta || {};
  C.karuta.deck = [
    K('い', '{犬|いぬ} も {歩|ある}けば {棒|ぼう} に {当|あ}たる', 'Even a dog that goes walking bumps into a stick.', 'Go out and do things, and something will happen to you, good or bad.', 'dog'),
    K('ろ', '{論|ろん} より {証拠|しょうこ}', 'Proof rather than argument.', 'Evidence settles a question better than debate.', 'scroll'),
    K('は', '{花|はな} より {団子|だんご}', 'Dumplings rather than flowers.', 'What fills you matters more than what looks pretty.', 'dango'),
    K('に', '{憎|にく}まれっ{子|こ} {世|よ} に はばかる', 'The child nobody likes gets on in the world.', 'People who are disliked often do well for themselves.', 'child'),
    K('ほ', '{骨折|ほねお}り{損|ぞん} の くたびれ{儲|もう}け', 'Broken bones for a loss, and a profit of weariness.', 'All that work, and nothing to show for it but tiredness.', 'bundle'),
    K('へ', '{下手|へた} の {長談義|ながだんぎ}', 'The poor speaker\'s long speech.', 'Those with least to say often talk the longest.', 'talk', 'kyoto'),
    K('と', '{年寄|としよ}り の {冷|ひ}や{水|みず}', 'An old person\'s cold water.', 'Doing something risky that no longer suits your age.', 'water'),
    K('ち', '{塵|ちり} も {積|つ}もれば {山|やま} と なる', 'Even dust, piled up, becomes a mountain.', 'Small things add up.', 'mountain'),
    K('り', '{律儀者|りちぎもの} の {子沢山|こだくさん}', 'The honest man has a house full of children.', 'Steady, faithful people lead full lives.', 'family'),
    K('ぬ', '{盗人|ぬすびと} の {昼寝|ひるね}', 'The thief\'s afternoon nap.', 'Even what looks idle has its purpose: he rests for the night\'s work.', 'sleep'),
    K('る', '{瑠璃|るり} も {玻璃|はり} も {照|て}らせば {光|ひか}る', 'Lapis and crystal both shine when light falls on them.', 'Real worth shows once it is given a chance.', 'jewel'),
    K('わ', '{破|わ}れ{鍋|なべ} に {綴|と}じ{蓋|ぶた}', 'A mended lid for a cracked pot.', 'There is a right partner for everyone.', 'pot'),
    K('か', '{蛙|かえる} の {子|こ} は {蛙|かえる}', 'A frog\'s child is a frog.', 'Children take after their parents.', 'frog', 'modern'),
    K('よ', '{葦|よし} の {髄|ずい} から {天井|てんじょう} {覗|のぞ}く', 'Looking at the ceiling through a reed stem.', 'Judging something large from a narrow view.', 'reed'),
    K('た', '{旅|たび} は {道連|みちづ}れ {世|よ} は {情|なさ}け', 'On a journey, a companion; in the world, kindness.', 'Travel goes better together, and life goes better with kindness.', 'travellers'),
    K('つ', '{月夜|つきよ} に {釜|かま} を {抜|ぬ}かれる', 'Having your pot stolen on a moonlit night.', 'Being caught out through carelessness.', 'moon'),
    K('ね', '{念|ねん} には {念|ねん} を {入|い}れよ', 'Add care to care.', 'Check, and check again.', 'check'),
    K('な', '{泣|な}きっ{面|つら} に {蜂|はち}', 'A bee on a crying face.', 'One trouble on top of another.', 'bee'),
    K('ら', '{楽|らく} あれば {苦|く} あり', 'Where there is ease, there is hardship.', 'Good times and hard times come in turn.', 'scales'),
    K('む', '{無理|むり} が {通|とお}れば {道理|どうり} {引|ひ}っ{込|こ}む', 'When the unreasonable gets through, reason steps back.', 'Where force wins, what is right is pushed aside.', 'push'),
    K('う', '{嘘|うそ} から {出|で}た {実|まこと}', 'Truth that came out of a lie.', 'Something said untruly or in jest turns out to be true.', 'mask'),
    K('の', '{喉元|のどもと} {過|す}ぎれば {熱|あつ}さ を {忘|わす}れる', 'Once past the throat, the heat is forgotten.', 'Hardship is soon forgotten once it is over.', 'tea'),
    K('お', '{鬼|おに} に {金棒|かなぼう}', 'An iron club for an ogre.', 'Strength added to strength.', 'club'),
    K('く', '{臭|くさ}い {物|もの} に {蓋|ふた} を する', 'Putting a lid on what smells.', 'Covering a problem up instead of dealing with it.', 'lid'),
    K('や', '{安物買|やすものが}い の {銭失|ぜにうしな}い', 'Buying cheap, losing money.', 'Cheap things cost more in the end.', 'coins'),
    K('ま', '{負|ま}ける が {勝|か}ち', 'Losing is winning.', 'Giving way can be the wiser victory.', 'bow'),
    K('え', '{得手|えて} に {帆|ほ} を {揚|あ}げる', 'Raising the sail for what you do well.', 'Seizing a fair wind to do what you are good at.', 'boat'),
    K('あ', '{頭|あたま} {隠|かく}して {尻|しり} {隠|かく}さず', 'Hiding the head but not the bottom.', 'Hiding part of a fault and thinking it is all hidden.', 'hide'),
    K('き', '{聞|き}いて {極楽|ごくらく} {見|み}て {地獄|じごく}', 'Paradise to hear of, hell to see.', 'Things are often worse than they sound.', 'ear'),
    K('ゆ', '{油断|ゆだん} {大敵|たいてき}', 'Carelessness is the great enemy.', 'Never let your guard down.', 'lamp'),
    K('め', '{目|め} の {上|うえ} の こぶ', 'A lump above the eye.', 'Someone, often above you, who is always in your way.', 'eye'),
    K('み', '{身|み} から {出|で}た {錆|さび}', 'Rust that came from the blade itself.', 'Trouble you brought on yourself.', 'blade'),
    K('し', '{知|し}らぬ が {仏|ほとけ}', 'Not knowing, one is at peace as a Buddha.', 'What you do not know cannot trouble you.', 'buddha'),
    K('も', '{門前|もんぜん} の {小僧|こぞう} {習|なら}わぬ {経|きょう} を {読|よ}む', 'The boy by the temple gate reads sutras he was never taught.', 'We learn from what is around us.', 'temple'),
    K('せ', '{急|せ}いて は {事|こと} を {仕損|しそん}じる', 'Hurrying, you spoil the thing.', 'Haste makes mistakes.', 'run'),
  ];
  C.karuta.sets = {
    edo: { en: 'the Edo set', jp: '{江戸|えど} いろはかるた' },
    kyoto: { en: 'the Kyoto set', jp: '{京|きょう} いろはかるた' },
    modern: { en: 'later children\'s sets', jp: '{今|いま} の かるた' },
  };

  // the pastime: with your companion anywhere safe; the plan's places for it come with their chapters
  if (RB.pastimes) RB.pastimes.define('karuta', {
    order: 40, title: { en: 'Karuta', jp: 'かるた' }, kind: 'game', activity: 'karuta', companion: true, art: 'karuta',
    anywhere: { en: 'Anywhere safe with your companion, cards spread on the ground.', jp: '{道連|みちづ}れ と なら 、 {安全|あんぜん} な {場所|ばしょ} で どこ でも' },
    met: (s) => !!(RB.edition && RB.edition.of(s) >= 2) && !!((s.flags && s.flags.pt_karuta) || (s.practice && s.practice.karuta && s.practice.karuta.games)),
    blurb: { en: 'Iroha karuta: a proverb for each sound of the old iroha poem. Listen, read, and find its card.', jp: 'いろはかるた 。 {読|よ}み{札|ふだ} を {聞|き}いて 、 {取|と}り{札|ふだ} を {取|と}る 。' },
    howto: [
      { en: 'The reader reads a proverb, its first sound first.', jp: '{読|よ}み{手|て} が {札|ふだ} を {読|よ}む 。' },
      { en: 'Find the picture card with that first sound in its red circle, and touch it.', jp: '{最初|さいしょ} の {音|おと} の {札|ふだ} を {取|と}る 。' },
      { en: 'Touch the wrong card and your partner takes the right one. Then the proverb is shown whole, with what it means.', jp: '{間違|まちが}えたら 「お{手|て}つき」 。' },
    ],
    records: (s) => {
      // read only: looking at the page never makes a record
      const r = Object.assign(RB.pastimes.fresh('karuta'), (s.practice && s.practice.karuta) || {});
      const out = [];
      if (r.games) out.push({ en: 'Games', value: String(r.games), total: true });
      if (r.best) out.push({ en: 'Most cards in one game', value: String(r.best) });
      const n = Object.keys(r.cards || {}).length;
      if (n) out.push({ en: 'Proverbs taken', value: n + ' of ' + C.karuta.deck.length });
      return out;
    },
  });
})(RB.content);
