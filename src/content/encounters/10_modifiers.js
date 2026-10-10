/* Modifier words (expansion E27; Robin's C-70, C-72 approved as asked, C-74). The eleven families, their honest
 * meanings, the battle role each takes as the Inkweavers' own convention (never a rule of Japanese), the natural
 * pairings with responses, and how each is learned. src/engine/95b_modifiers.js applies them.
 *
 * Learned as growth, in story scenes (C-74): いくつか (Unravel reaches two) in Chapter 4, すべて (Protect covers
 * both) in Chapter 7; それぞれ in Chapter 3, あらゆる in Chapter 9, ごとに in Chapter 10, 全体 in Chapter 11; found
 * off the beaten path (C-71): 全部, たくさん, 大半, and 永遠に and 無限に from the Trials. Nothing is missable: every
 * source waits until found. A scene teaches one by setting its flag (`mod_<id>`); the concept is declared below. */
var RB = (globalThis.RB = globalThis.RB || {});
(function (C) {
  'use strict';
  const F = (id, o) => Object.assign({ id }, o);
  const families = {
    subete: F('subete', { jp: 'すべて', kanji: '{全|すべ}て', en: 'すべて (all, every one)', role: 'Breadth', does: 'Every one on that side, each separately, each a little lighter.', grammar: 'mod_subete', ch: 'kr', source: 'story' }),
    zenbu: F('zenbu', { jp: '{全部|ぜんぶ}', en: '全部 (all of it)', role: 'Completeness on one', does: 'All of it, for one target only.', grammar: 'mod_zenbu', ch: null, source: 'found' }),
    arayuru: F('arayuru', { jp: 'あらゆる', en: 'あらゆる (every kind of)', role: 'Kinds', does: 'Answers a move of any kind, once.', grammar: 'mod_arayuru', ch: 'ko', source: 'story' }),
    zentai: F('zentai', { jp: '{全体|ぜんたい}', en: '全体 (the whole, as one)', role: 'The group as one body', does: 'One ward around the party; aimed at creatures, it answers what the group does together and nothing else.', grammar: 'mod_zentai', ch: 'yn', source: 'story' }),
    sorezore: F('sorezore', { jp: 'それぞれ', en: 'それぞれ (each, respectively)', role: 'Each its own', does: 'Fitted to each target, this exchange only.', grammar: 'mod_sorezore', ch: 'mb1', source: 'story' }),
    goto: F('goto', { jp: 'ごとに', en: 'ごとに (with each, per)', role: 'In turn', does: 'Renewed as each creature acts, in the numbered order.', grammar: 'mod_goto', ch: 'cr', source: 'story' }),
    ikutsuka: F('ikutsuka', { jp: 'いくつか', en: 'いくつか (some, a few)', role: 'Two of your choice', does: 'Two targets you choose.', grammar: 'mod_ikutsuka', ch: 'mb2', source: 'story' }),
    taihan: F('taihan', { jp: '{大半|たいはん}', en: '大半 (most, the greater part)', role: 'All but one', does: 'Every creature but the one you leave out, each at full strength.', grammar: 'mod_taihan', ch: null, source: 'found' }),
    takusan: F('takusan', { jp: 'たくさん', en: 'たくさん (a lot)', role: 'More, on one', does: 'More, on one target only.', grammar: 'mod_takusan', ch: null, source: 'found' }),
    eien: F('eien', { jp: '{永遠|えいえん}に', en: '永遠に (forever)', role: 'Time', does: 'One effect that lasts the rest of the encounter, until a named move breaks it.', grammar: 'mod_eien', ch: null, source: 'trials' }),
    mugen: F('mugen', { jp: '{無限|むげん}に', en: '無限に (without limit)', role: 'Count', does: 'No limit on how many, this exchange only.', grammar: 'mod_mugen', ch: null, source: 'trials' }),
  };
  // A pairing: the modifier, the response, the whole phrase (typed), the handwritten span (the modifier and its
  // particle, the rest shown), the learning items of each route, the option it asks for, its effect and its trade.
  const P = (mod, resp, respEn, jp, hand, items, o) => Object.assign({ mod, resp, respEn, jp, hand, items }, o);
  const pairs = [
    P('subete', 'mamoru', 'Protect', 'すべて を {守|まも}る', { write: 'すべて を', after: '{守|まも}る', items: ['v:全て', 'g:mod_subete'] }, ['v:全て', 'g:mod_subete', 'v:守る'],
      { en: 'protect everyone', effect: 'ward_each', does: 'A ward before each of you: each blocks a Strike aimed at that person, or soaks 1 later (not 2).', trade: 'Each ward is lighter: it soaks 1, not 2.', wrong: ['すべてにまもる', 'すべてがまもる'] }),
    P('subete', 'hikari', 'light', '{光|ひかり} が すべて を {照|て}らす', { before: '{光|ひかり} が', write: 'すべて を', after: '{照|て}らす', items: ['v:全て', 'g:mod_subete'] }, ['v:全て', 'g:mod_subete', 'v:光', 'v:照らす'],
      { en: 'the light shines on everything', effect: 'light_all', does: 'Clears the mist on every creature and answers every Shroud.', trade: 'Spread this thin, it stops no Re-tying and no Mirror.', wrong: ['ひかりをすべてがてらす', 'ひかりですべてにてらす'] }),
    P('subete', 'nawa', 'rope', '{縄|なわ} で すべて を {縛|しば}る', { before: '{縄|なわ} で', write: 'すべて を', after: '{縛|しば}る', items: ['v:全て', 'g:mod_subete'] }, ['v:全て', 'g:mod_subete', 'v:縄', 'v:縛る'],
      { en: 'bind them all with rope', effect: 'rope_all', does: 'Stops every creature\'s Gathering.', trade: 'Spread this thin, it holds no Re-tying.', wrong: ['なわにすべてをしばる', 'なわですべてがしばる'] }),
    P('zenbu', 'iyasu', 'heal', '{傷|きず} を {全部|ぜんぶ} {癒|いや}す', { before: '{傷|きず} を', write: '{全部|ぜんぶ}', after: '{癒|いや}す', items: ['v:全部', 'g:mod_zenbu'] }, ['v:全部', 'g:mod_zenbu', 'v:傷', 'v:癒す'],
      { en: 'heal every wound', effect: 'heal_full', option: 'who', does: 'Restores all of one person\'s resolve.', trade: 'One person only, instead of some to both.', wrong: ['きずがぜんぶいやす', 'きずにぜんぶいやす'] }),
    P('arayuru', 'mamoru', 'Protect', 'あらゆる {技|わざ} から {守|まも}る', { write: 'あらゆる', after: '{技|わざ} から {守|まも}る', items: ['v:あらゆる', 'g:mod_arayuru'] }, ['v:あらゆる', 'g:mod_arayuru', 'v:技', 'v:守る'],
      { en: 'protect from every kind of move', effect: 'ward_any', option: 'who', does: 'A ward before one of you that stops the next blow of any kind (Sweep, Gust, Flood, Chill…), not only a Strike.', trade: 'One person, one blow; it soaks nothing else.', wrong: ['あらゆるわざにまもる', 'あらゆるわざがまもる'] }),
    P('zentai', 'mamoru', 'Protect', '{全体|ぜんたい} を {守|まも}る', { write: '{全体|ぜんたい} を', after: '{守|まも}る', items: ['v:全体', 'g:mod_zentai'] }, ['v:全体', 'g:mod_zentai', 'v:守る'],
      { en: 'protect the whole', effect: 'ward_party', does: 'One ward around you both: it takes the first blow to land on either of you.', trade: 'One blow only, whoever it lands on.', wrong: ['ぜんたいにまもる', 'ぜんたいがまもる'] }),
    P('zentai', 'nawa', 'rope', '{縄|なわ} で {全体|ぜんたい} を {縛|しば}る', { before: '{縄|なわ} で', write: '{全体|ぜんたい} を', after: '{縛|しば}る', items: ['v:全体', 'g:mod_zentai'] }, ['v:全体', 'g:mod_zentai', 'v:縄', 'v:縛る'],
      { en: 'bind the whole group', effect: 'rope_group', does: 'Answers what the group does together: a signal and every move cued on it.', trade: 'Nothing else: no single creature\'s Gathering.', wrong: ['なわにぜんたいをしばる', 'なわでぜんたいがしばる'] }),
    P('sorezore', 'mamoru', 'Protect', 'それぞれ を {守|まも}る', { write: 'それぞれ を', after: '{守|まも}る', items: ['v:それぞれ', 'g:mod_sorezore'] }, ['v:それぞれ', 'g:mod_sorezore', 'v:守る'],
      { en: 'protect each one', effect: 'ward_fit', does: 'A ward before each of you, fitted to the blow aimed at that person (a Strike at one, a Chill at the other).', trade: 'This exchange only; it soaks nothing later.', wrong: ['それぞれにまもる', 'それぞれがまもる'] }),
    P('goto', 'mamoru', 'Protect', '{一回|いっかい} ごと に {守|まも}る', { before: '{一回|いっかい}', write: 'ごと に', after: '{守|まも}る', items: ['v:ごと', 'g:mod_goto'] }, ['v:ごと', 'g:mod_goto', 'v:一回', 'v:守る'],
      { en: 'protect every time', effect: 'ward_per_blow', does: 'A small ward renewed before every blow this exchange, whoever it is aimed at (each soaks 1).', trade: 'Each soaks only 1, and only this exchange.', wrong: ['いっかいごとをまもる', 'いっかいごとがまもる'] }),
    P('ikutsuka', 'unravel', 'Unravel', '{結|むす}び{目|め} を いくつか ほどく', { before: '{結|むす}び{目|め} を', write: 'いくつか', after: 'ほどく', items: ['v:いくつか', 'g:mod_ikutsuka'] }, ['v:いくつか', 'g:mod_ikutsuka', 'v:結び目'],
      { en: 'untie some of the knots', effect: 'unravel_two', option: 'two', does: 'Unravel on two creatures you choose, a knot each.', trade: 'A knot each, never two on one.', wrong: ['むすびめにいくつかほどく', 'むすびめがいくつかほどく'] }),
    P('taihan', 'nawa', 'rope', '{縄|なわ} で {大半|たいはん} を {縛|しば}る', { before: '{縄|なわ} で', write: '{大半|たいはん} を', after: '{縛|しば}る', items: ['v:大半', 'g:mod_taihan'] }, ['v:大半', 'g:mod_taihan', 'v:縄', 'v:縛る'],
      { en: 'bind most of them with rope', effect: 'rope_most', option: 'leaveOut', does: 'Stops every creature\'s Gathering or Re-tying but the one you leave out, each at full strength.', trade: 'One creature is always left out.', wrong: ['なわでたいはんがしばる', 'なわにたいはんをしばる'] }),
    P('takusan', 'mizu', 'water', '{水|みず} を たくさん かける', { before: '{水|みず} を', write: 'たくさん', after: 'かける', items: ['v:たくさん', 'g:mod_takusan'] }, ['v:たくさん', 'g:mod_takusan', 'v:水', 'v:掛ける'],
      { en: 'pour on a lot of water', effect: 'water_more', does: 'Puts out one creature\'s Heat and soaks it, so it cannot raise Heat next exchange.', trade: 'One creature only (water usually reaches all).', wrong: ['みずがたくさんかける', 'みずにたくさんかける'] }),
    P('eien', 'kaze', 'wind', '{風|かぜ} が {永遠|えいえん} に {吹|ふ}く', { before: '{風|かぜ} が', write: '{永遠|えいえん} に', after: '{吹|ふ}く', items: ['v:永遠', 'g:mod_eien'] }, ['v:永遠', 'g:mod_eien', 'v:風', 'v:吹く'],
      { en: 'the wind blows forever', effect: 'wind_forever', does: 'Clears the mist as wind does, and goes on blowing: no creature can raise a Shroud until a Gust breaks it.', trade: 'A Gust breaks it.', wrong: ['かぜをえいえんにふく', 'かぜがえいえんでふく'] }),
    P('mugen', 'mamoru', 'Protect', '{無限|むげん} に {守|まも}る', { write: '{無限|むげん} に', after: '{守|まも}る', items: ['v:無限', 'g:mod_mugen'] }, ['v:無限', 'g:mod_mugen', 'v:守る'],
      { en: 'protect without limit', effect: 'ward_unlimited', does: 'The ward blocks every Strike this exchange, at either of you, then it is gone.', trade: 'This exchange only, and only Strikes.', wrong: ['むげんをまもる', 'むげんがまもる'] }),
  ];
  C.modifiers = { families, pairs };

  // the concepts the phases know (RB.phase): taught by a scene setting the flag `mod_<id>`
  if (RB.phase && RB.phase.concept) for (const id in families) RB.phase.concept('mod_' + id, { kind: 'modifier', ch: families[id].ch, taught: 'mod_' + id });

  // the grammar each brings, taught in a short lesson when first learned (honest about everyday overlap; the battle
  // role is the Inkweavers' own convention)
  const G = (id, lv, title, en, ex, notes) => ({ id, lv, title, en, ex: ex.map(([jp, e]) => ({ jp, en: e })), notes });
  if (RB.grammar) RB.grammar.add([
    G('mod_subete', 'I', 'すべて (all)',
      `すべて ({全|すべ}て) means "all, every one". It works as a noun (すべてを {見|み}た "saw everything") and as an adverb (すべて {終|お}わった "it is all over"). In everyday Japanese すべて and {全部|ぜんぶ} often mean the same thing; すべて sounds a little more formal or written.`,
      [['すべてを {守|まも}る。', 'Protect everyone.'], ['{答|こた}えは すべて {正|ただ}しい。', 'The answers are all correct.']],
      'In battle, the Inkweavers use すべて for breadth: every one, each a little lighter. That is their convention, not a rule of Japanese.'),
    G('mod_zenbu', 'E', '{全部|ぜんぶ} (all of it)',
      `{全部|ぜんぶ} means "all of it, the whole lot". As an adverb it often comes straight before the verb with no particle: ぜんぶ {食|た}べた "ate it all". In everyday speech it overlaps with すべて, and is the more casual of the two.`,
      [['ぜんぶ {食|た}べました。', 'I ate it all.'], ['{傷|きず}を {全部|ぜんぶ} {癒|いや}す。', 'Heal every wound.']],
      'In battle, 全部 means completeness on one target: all of it, for one person only (the Inkweavers\' convention).'),
    G('mod_arayuru', 'I', 'あらゆる (every kind of)',
      `あらゆる means "every possible, every kind of". It only ever comes before a noun: あらゆる {方法|ほうほう} "every possible way". It cannot stand alone or take a particle.`,
      [['あらゆる {技|わざ}から {守|まも}る。', 'Protect from every kind of move.'], ['あらゆる {本|ほん}を {読|よ}んだ。', 'I read every kind of book.']]),
    G('mod_zentai', 'I', '{全体|ぜんたい} (the whole)',
      `{全体|ぜんたい} means "the whole" of something, taken as one: クラス{全体|ぜんたい} "the whole class", {町|まち}{全体|ぜんたい} "the whole town". It looks at the group as a single body rather than at each member.`,
      [['{全体|ぜんたい}を {守|まも}る。', 'Protect the whole (party, as one).'], ['{町|まち}{全体|ぜんたい}が {静|しず}かだ。', 'The whole town is quiet.']]),
    G('mod_sorezore', 'E', 'それぞれ (each)',
      `それぞれ means "each, respectively": each one separately, in its own way. それぞれの + noun: それぞれの {道|みち} "each one's own road".`,
      [['それぞれを {守|まも}る。', 'Protect each one.'], ['それぞれの {考|かんが}えが ある。', 'Each has their own view.']]),
    G('mod_goto', 'I', '～ごとに (every …, per …)',
      `After a noun, ごとに means "every …, with each …": {一回|いっかい}ごとに "every time", {駅|えき}ごとに "at every station", {一日|いちにち}ごとに "every day".`,
      [['{一回|いっかい}ごとに {守|まも}る。', 'Protect every time.'], ['{駅|えき}ごとに {止|と}まる。', 'It stops at every station.']]),
    G('mod_ikutsuka', 'E', 'いくつか (some, a few)',
      `いくつか means "some, a few" (things that can be counted). Like other words of amount, it usually comes after the object and its particle, before the verb: {結|むす}び{目|め}を いくつか ほどく "untie a few of the knots".`,
      [['{結|むす}び{目|め}を いくつか ほどく。', 'Untie some of the knots.'], ['{質問|しつもん}が いくつか あります。', 'I have a few questions.']]),
    G('mod_taihan', 'A', '{大半|たいはん} (most)',
      `{大半|たいはん} means "the greater part, most". It is a little formal; in conversation ほとんど is more common. {大半|たいはん}の + noun: {大半|たいはん}の {人|ひと} "most people".`,
      [['{縄|なわ}で {大半|たいはん}を {縛|しば}る。', 'Bind most of them with rope.'], ['{大半|たいはん}の {店|みせ}は {閉|し}まって いる。', 'Most of the shops are closed.']]),
    G('mod_takusan', 'F', 'たくさん (a lot)',
      `たくさん means "a lot, many, much", for amount or number. As an adverb it comes before the verb: たくさん {食|た}べる "eat a lot".`,
      [['{水|みず}を たくさん かける。', 'Pour on a lot of water.'], ['{人|ひと}が たくさん いる。', 'There are a lot of people.']]),
    G('mod_eien', 'I', '{永遠|えいえん}に (forever)',
      `{永遠|えいえん} is "eternity"; {永遠|えいえん}に is "forever". It is a grand word, at home in songs and vows; in everyday speech ずっと is usual.`,
      [['{風|かぜ}が {永遠|えいえん}に {吹|ふ}く。', 'The wind blows forever.'], ['{永遠|えいえん}に {忘|わす}れない。', 'I will never forget.']],
      'The Inkweavers use it with a flourish: in battle it means one effect that lasts until a named move breaks it.'),
    G('mod_mugen', 'A', '{無限|むげん}に (without limit)',
      `{無限|むげん} is "infinity, without limit"; {無限|むげん}に is "endlessly, without limit". Like {永遠|えいえん}に, it is a grand word, more at home in stories and science than in conversation.`,
      [['{無限|むげん}に {守|まも}る。', 'Protect without limit.'], ['{星|ほし}は {無限|むげん}に ある ように {見|み}える。', 'The stars look endless.']],
      'In battle it means no limit on how many, for this exchange only (the Inkweavers\' flourish).'),
  ], 'modifiers');
})(RB.content);
