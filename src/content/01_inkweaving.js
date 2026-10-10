/* Inkweaving content shared by all chapters: inscription words and default
 * telegraph lines. The words are ordinary Japanese used with their ordinary
 * meanings; only their effect in the world is fiction. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const W = (id, d) => (C.words[id] = Object.assign({ id }, d));
  // `effect` is shown on the battle's response card: what the word does, and
  // which moves it answers (RB.combatLogic.answers lists the same from the tags).
  W('mamoru', { jp: 'まもる', jpK: '{守|まも}る', r: 'まもる', lex: '守る', en: 'protect', tags: ['ward'], icon: '🛡', effect: 'Raises a ward before one of you: it blocks a Strike aimed at them, or soaks up 2 damage later.',
    // the same intention said another way (expansion E13): taught in the twelve-chapter game (flag phr_mamoru)
    phrasings: [{ id: 'ataranai', jp: '{当|あ}たらない ように する', en: 'make sure it does not hit', item: ['g:you_ni_suru', 'v:当たる'], unlock: 'phr_mamoru' }] });
  W('mizu', { jp: 'みず', jpK: '{水|みず}', r: 'みず', lex: '水', en: 'water', tags: ['water'], icon: '💧', effect: 'Cools what is overheating: clears Heat.' });
  W('hikari', { jp: 'ひかり', jpK: '{光|ひかり}', r: 'ひかり', lex: '光', en: 'light', tags: ['light'], icon: '✺', effect: 'Shows what is hidden: clears mist, and stops a Re-tying or a Mirror.' });
  W('iyasu', { jp: 'いやす', jpK: '{癒|いや}す', r: 'いやす', lex: '癒す', en: 'heal, soothe', tags: ['heal'], icon: '✚', effect: 'Restores 3 resolve to each of you.' });
  W('kaze', { jp: 'かぜ', jpK: '{風|かぜ}', r: 'かぜ', lex: '風', en: 'wind', tags: ['wind'], icon: '🌬', effect: 'Blows away mist and smoke: clears mist.' });
  W('nawa', { jp: 'なわ', jpK: '{縄|なわ}', r: 'なわ', lex: '縄', en: 'rope', tags: ['bind'], icon: '➰', effect: 'Holds something in place: stops Gathering or a Re-tying.' });
  W('ishi', { jp: 'いし', jpK: '{石|いし}', r: 'いし', lex: '石', en: 'stone', tags: ['anchor', 'stone'], icon: '⬣', effect: 'Stands firm: cancels a Gust or a Flood.' });
  W('koori', { jp: 'こおり', jpK: '{氷|こおり}', r: 'こおり', lex: '氷', en: 'ice', tags: ['water'], family: 'ice', icon: '❄', effect: 'Cools heat (another way to answer it): clears Heat.' });
  W('tsuchi', { jp: 'つち', jpK: '{土|つち}', r: 'つち', lex: '土', en: 'earth, soil', tags: ['stone'], icon: '⛰', effect: 'Banks against rising water: cancels a Flood.' });
  W('honoo', { jp: 'ほのお', jpK: '{炎|ほのお}', r: 'ほのお', lex: '炎', en: 'flame', tags: ['fire', 'warm', 'light'], icon: '🔥', effect: 'Warms against cold: cancels a Chill. Also gives light: clears mist, stops a Re-tying or a Mirror.' });
  W('suzu', { jp: 'すず', jpK: '{鈴|すず}', r: 'すず', lex: '鈴', en: 'bell (small)', tags: ['bell'], icon: '🔔', effect: 'A clear sound that breaks a hush: ends the Hush.' });
  W('koe', { jp: 'こえ', jpK: '{声|こえ}', r: 'こえ', lex: '声', en: 'voice', tags: ['voice'], icon: '🗣', effect: 'Speaks up into silence: ends the Hush.' });

  // Default telegraph lines. $tgt = the one being targeted, $other = the one who isn't.
  // Variants marked neg:true name the one who is NOT targeted (reading the negation matters).
  C.intentText = {
    strike: {
      F: [{ jp: '$tgt に ぶつかって くる ！', en: 'It is about to slam into $tgtEn!' }],
      E: [{ jp: '$tgt を ねらって いる 。', en: 'It is aiming at $tgtEn.' }, { jp: '$other は ねらって いない 。', en: 'It is not aiming at $otherEn.', neg: true }],
      I: [{ jp: '{次|つぎ} は $tgt に {襲|おそ}いかかる つもり らしい 。', en: 'It seems to mean to fall on $tgtEn next.' }, { jp: '$other に は {目|め} も くれず 、 {身|み} を {低|ひく}く した 。', en: 'Without so much as a glance at $otherEn, it crouches low.', neg: true }],
      A: [{ jp: '{矛先|ほこさき} は どうやら $tgt に {向|む}いて いる 。', en: 'Its aim, it seems, is turned on $tgtEn.' }, { jp: '$other の こと など {眼中|がんちゅう} に ない らしい 。', en: '$otherEn doesn\'t seem to figure in its thinking at all.', neg: true }],
    },
    sweep: {
      F: [{ jp: 'ふたり に むかって くる ！', en: 'It is coming at both of you!' }],
      E: [{ jp: 'ふたり とも ねらって いる 。', en: 'It is aiming at both of you.' }],
      I: [{ jp: '{二人|ふたり} まとめて {払|はら}いのける {構|かま}え だ 。', en: 'It is poised to sweep you both aside at once.' }],
      A: [{ jp: '{二人|ふたり} を {一度|いちど} に {払|はら}いのける {腹|はら}づもり の よう だ 。', en: 'It looks set on brushing the two of you aside in one go.' }],
    },
    heat: {
      F: [{ jp: 'あつく なって いる ！', en: 'It is getting hot!' }],
      E: [{ jp: 'だんだん {熱|あつ}く なって いる 。', en: 'It is gradually getting hotter.' }],
      I: [{ jp: '{熱|ねつ} が こもる ほど 、 {次|つぎ} の {一撃|いちげき} は {重|おも}く なる 。', en: 'The more heat builds up, the heavier its next blow.' }],
      A: [{ jp: '{熱|ねつ} を {帯|お}びた {体|からだ} は 、 {触|ふ}れる もの を {焦|こ}がし かねない 。', en: 'Its heated body could scorch anything it touches.' }],
    },
    shroud: {
      F: [{ jp: 'くらく なって きた 。', en: 'It is getting dark.' }],
      E: [{ jp: '{霧|きり} で {姿|すがた} を かくそう と して いる 。', en: 'It is trying to hide itself in mist.' }],
      I: [{ jp: '{霧|きり} に まぎれて しまえば 、 {結|むす}び{目|め} が {見|み}えなく なる 。', en: 'If it disappears into the mist, you won\'t be able to see its knots.' }],
      A: [{ jp: '{霧|きり} に {紛|まぎ}れ 、 {結|むす}び{目|め} を {隠|かく}し{通|とお}す つもり らしい 。', en: 'It means to melt into the mist and keep its knots hidden.' }],
    },
    charge: {
      F: [{ jp: 'ちから を ためて いる ！', en: 'It is gathering strength!' }],
      E: [{ jp: '{大|おお}きな {力|ちから} を ためて いる 。 {次|つぎ} は {強|つよ}い 。', en: 'It is building up great strength. The next blow will be strong.' }],
      I: [{ jp: 'この まま {力|ちから} を ためさせたら 、 {次|つぎ} の {一撃|いちげき} は かなり {強|つよ}い だろう 。', en: 'If you let it keep gathering strength, its next blow will be very strong.' }],
      A: [{ jp: '{渾身|こんしん} の {一撃|いちげき} に {備|そな}え 、 {息|いき} を ひそめて いる 。', en: 'It holds its breath, readying an all-out blow.' }],
    },
    gust: {
      F: [{ jp: 'つよい かぜ が くる ！', en: 'A strong wind is coming!' }],
      E: [{ jp: '{強|つよ}い {風|かぜ} で まもり を {飛|と}ばそう と して いる 。', en: 'It is trying to blow your wards away with a strong wind.' }],
      I: [{ jp: '{風|かぜ} を {起|お}こして 、 {張|は}った まもり を {吹|ふ}き{飛|と}ばす つもり だ 。', en: 'It means to raise a wind and blow away the wards you have set.' }],
      A: [{ jp: '{突風|とっぷう} で 、 {張|は}り{巡|めぐ}らせた {守|まも}り を {根|ね}こそぎ {奪|うば}う {気|き} だ 。', en: 'It intends to strip away every ward you have raised with a single gust.' }],
    },
    mend: {
      F: [{ jp: 'むすびめ を なおして いる 。', en: 'It is re-tying a knot.' }],
      E: [{ jp: 'ほどけた {結|むす}び{目|め} を また {結|むす}ぼう と して いる 。', en: 'It is trying to tie a loosened knot again.' }],
      I: [{ jp: 'ほどいた ばかり の {結|むす}び{目|め} を 、 {結|むす}び{直|なお}そう と して いる 。', en: 'It is trying to re-tie a knot you only just undid.' }],
      A: [{ jp: 'せっかく ほどいた {結|むす}び{目|め} を 、 {元|もと} どおり に {結|むす}び{直|なお}す {気|き} らしい 。', en: 'It seems set on tying back up the knot you worked so hard to undo.' }],
    },
    rest: {
      F: [{ jp: 'うごかない 。', en: 'It is not moving.' }],
      E: [{ jp: 'じっと して いる 。', en: 'It is keeping still.' }],
      I: [{ jp: 'こちら の {様子|ようす} を うかがって いる 。', en: 'It is watching to see what you will do.' }],
      A: [{ jp: 'こちら の {出方|でかた} を {窺|うかが}って いる らしい 。', en: 'It seems to be waiting to see how you move.' }],
    },
    flood: {
      F: [{ jp: 'みず が くる ！', en: 'Water is coming!' }],
      E: [{ jp: '{水|みず} が あふれて くる 。 ふたり とも あぶない 。', en: 'Water is overflowing. You are both in danger.' }],
      I: [{ jp: '{水|みず} を {呼|よ}び{寄|よ}せて 、 ふたり まとめて {押|お}し{流|なが}す つもり だ 。', en: 'It means to call up the water and wash you both away together.' }],
      A: [{ jp: '{濁流|だくりゅう} を {呼|よ}び{込|こ}み 、 {足元|あしもと} から さらう {気|き} だ 。', en: 'It intends to draw in a muddy torrent and sweep you off your feet.' }],
    },
    chill: {
      F: [{ jp: '$tgt が さむく なる ！', en: '$tgtEn is going to freeze!' }],
      E: [{ jp: '{冷|つめ}たい {息|いき} を $tgt に かけよう と して いる 。', en: 'It is about to breathe cold air on $tgtEn.' }, { jp: '$other に は {息|いき} を かけない 。', en: 'It won\'t breathe on $otherEn.', neg: true }],
      I: [{ jp: '{凍|こお}える よう な {息|いき} が 、 $tgt を ねらって いる 。', en: 'A freezing breath is aimed at $tgtEn.' }],
      A: [{ jp: '{骨|ほね} まで {凍|い}てつく よう な {冷気|れいき} が 、 $tgt に {迫|せま}る 。', en: 'A chill that freezes to the bone closes in on $tgtEn.' }],
    },
    silence: {
      F: [{ jp: 'しずか に なって いく …… 。', en: 'Everything is going quiet…' }],
      E: [{ jp: 'まわり の {音|おと} が {消|き}えて いく 。', en: 'The sounds around you are fading away.' }],
      I: [{ jp: '{音|おと} が {消|き}える と 、 {言葉|ことば} も {届|とど}かなく なる 。', en: 'When sound disappears, words stop reaching anyone too.' }],
      A: [{ jp: '{静寂|せいじゃく} が {広|ひろ}がり 、 {言葉|ことば} そのもの が {意味|いみ} を {失|うしな}い かけて いる 。', en: 'Silence spreads; words themselves are starting to lose their meaning.' }],
    },
  };
})(RB.content);
