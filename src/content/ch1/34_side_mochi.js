/* Chapter 1 side story: the cat called Mochi. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  C.chars.mochi = { name: { en: 'Mochi', jp: 'モチ' }, voice: { pitch: 1.4 }, look: { custom: 'cat', col: '#e8d8c0' },
    portrait: { kind: 'cat', skin: ['#e8d8c0', '#c8b8a0'], hair: ['#e8d8c0', '#d8c8b0', '#fff8ec'], cloth: ['#c86a5a', '#a85a4a', '#e8c060'], style: 'short', eyes: 'round', bg: '#2e3a2a' } };
  C.quests.rw_mochi = { chapter: 1, title: { jp: 'モチ と いう {猫|ねこ}', en: 'A Cat Called Mochi' },
    stages: [
      { jp: 'トモ の {猫|ねこ} が いない 。 {川|かわ} の {向|む}こう で {見|み}た {人|ひと} が いる らしい 。', en: 'Tomo\'s cat is missing. Someone saw a cat across the river.' },
      { jp: '{猫|ねこ} を トモ の ところ へ {連|つ}れて {帰|かえ}ろう 。', en: 'Bring the cat back to Tomo (near the laundry lines, west of the square).' },
    ] };
  C.items.rw_catbell = { name: { jp: '{小|ちい}さな {鈴|すず}', en: 'Tiny bell' }, desc: 'Mochi\'s old bell, still on its red cord. Worn at your neck as a keepsake, it changes only how you look.', slot: 'cosmetic', acc: 'bell' };
  C.challenges['rw.c_mochi'] = { title: { jp: '{首輪|くびわ} の {名札|なふだ}', en: 'The collar tag' },
    tiers: {
      F: [{ kind: 'write', item: 'v:モチ', prompt: { en: 'The cat\'s name tag is blank. Tomo says its name is Mochi — written in katakana: モチ. Write it on the tag.' }, answer: 'モチ', accept: ['モチ'], mode: 'kana', script: 'kata', explain: { jp: 'モチ', en: 'Pet names are often written in katakana.' } }],
      E: [{ kind: 'write', item: 'v:モチ', prompt: { en: 'Write the cat\'s name, Mochi, on the tag in katakana.' }, answer: 'モチ', accept: ['モチ'], mode: 'kana', script: 'kata', choices: ['モチ', 'モテ', 'ミチ'], explain: { jp: 'モチ', en: 'モ (mo) + チ (chi).' } }],
      I: [{ kind: 'choose', item: 'c:rw_mochi_i', ctx: { jp: '「 {名前|なまえ} は モチ 。 {白|しろ}くて 、 よく {伸|の}びる から 。 」', en: '' }, prompt: { en: 'Why is the cat called Mochi, according to Tomo?' },
        options: [{ en: 'Because it\'s white and stretches a lot — like mochi (rice cake).', ok: true }, { en: 'Because it loves eating mochi.', ok: false, why: { en: 'よく伸びる = stretches a lot; nothing about eating.' } }, { en: 'Because it was found on New Year\'s day.', ok: false }],
        explain: { en: '〜から gives the reason. 伸びる = to stretch.' } },
        { kind: 'write', item: 'v:モチ', prompt: { en: 'Write the name on the tag (katakana).' }, answer: 'モチ', accept: ['モチ'], mode: 'kana', script: 'kata' }],
      A: [{ kind: 'choose', item: 'c:rw_mochi_a', ctx: { jp: '「 {迷子|まいご} に なる の は 、 {帰|かえ}る {場所|ばしょ} が ある {猫|ねこ} だけ だ よ 。 」 ── ヤス', en: '' }, prompt: { en: 'What does Old Yasu mean?' },
        options: [{ en: 'Only a cat that has a home can be "lost" — so Mochi still belongs somewhere.', ok: true }, { en: 'Cats without homes never get lost because they are cleverer.', ok: false }, { en: 'Lost cats should stay where they are found.', ok: false }],
        explain: { en: 'The line turns 迷子 (lost child/pet) around: being lost implies somewhere to return to.' } },
        { kind: 'write', item: 'v:モチ', prompt: { en: 'Write the name on the tag (katakana).' }, answer: 'モチ', accept: ['モチ'], mode: 'kana', script: 'kata' }],
    } };
  C.maps['rw.village'].npcs.push(
    { id: 'mochi', x: 46, y: 20, dir: 'left', wander: 1, if: 'rw_echo_done&!rw_mochi_carried&!quest.rw_mochi=done', talk: [{ scene: 'rw.mochi_find' }] },
    { id: 'mochi_home', char: 'mochi', x: 8, y: 25, dir: 'down', wander: 1, if: 'quest.rw_mochi=done', talk: [{ scene: 'rw.mochi_home' }] }
  );
  // Tomo's lines: the cat thread starts once the bridge is back
  const tomo = C.maps['rw.village'].npcs.find((n) => n.id === 'tomo');
  tomo.talk.unshift({ if: 'rw_mochi_carried&!quest.rw_mochi=done', scene: 'rw.tomo_mochi' }, { if: 'rw_echo_done&!quest.rw_mochi', scene: 'rw.tomo_lost' });
  RB.lex.add(RB.lex.parseTable(`
猫|ねこ|n|F|cat
モチ||name|F|Mochi (a cat's name)
首輪|くびわ|n|I|collar
名札|なふだ|n|I|name tag
伸びる|のびる|v1|E|to stretch, extend
迷子|まいご|n|I|lost child (or pet)
ニャー||int|F|meow
鈴|すず|n|E|small bell
抱える|かかえる|v1|I|to hold in one's arms
嫌がる|いやがる|v5r|I|to dislike, resist
日向|ひなた|n|I|sunny spot
  `), 'ch1');
})(RB.content);

RB.script.add(`
@scene rw.tomo_lost
!faceplayer tomo
tomo[worry]: {掲示板|けいじばん} の {貼|は}り{紙|がみ} 、 {見|み}た ？ うち の モチ が 、 {嵐|あらし} の {夜|よる} から {帰|かえ}って こない の 。 || Did you see the notice on the board? Our Mochi hasn't come home since the storm.
tomo: {首輪|くびわ} の {名札|なふだ} も 、 きっと {白|しろ}く なってる 。 {誰|だれ} か に {拾|ひろ}われて も 、 {名前|なまえ} が わからない わ 。 || Her name tag's probably gone blank too. Even if someone found her, they wouldn't know her name.
tomo: {橋|はし} の {向|む}こう で {白|しろ}い {猫|ねこ} を {見|み}た って 、 コウジ さん が {言|い}ってた けど …… 。 || Kōji said he saw a white cat across the bridge, but…
!quest rw_mochi 0

@scene rw.mochi_find
narr: {白|しろ}い {猫|ねこ} が 、 {草|くさ} の {上|うえ} で {丸|まる}く なって いる 。 {首輪|くびわ} の {名札|なふだ} は {真|ま}っ{白|しろ} だ 。 || A white cat is curled up on the grass. The tag on her collar is blank.
mochi: ニャー 。 || Meow.
narr: {抱|かか}え{上|あ}げる と 、 {意外|いがい} と {重|おも}い 。 そして 、 よく {伸|の}びる 。 || When you lift her, she's heavier than expected. And she stretches a long way.
!set rw_mochi_carried
!quest rw_mochi 1
!refresh

@scene rw.tomo_mochi
!faceplayer tomo
tomo[surprise]: モチ ！ …… よかった 。 {本当|ほんとう} に よかった 。 || Mochi! …Oh, thank goodness. Thank goodness.
tomo: {名札|なふだ} 、 {書|か}き{直|なお}して もらえる ？ あなた の {字|じ} なら 、 {落|お}ちない って {聞|き}いた の 。 || Could you rewrite her tag? I heard your writing doesn't come off.
!challenge rw.c_mochi
!if var._res=0 -> later
tomo[smile]: モチ 。 …… {名前|なまえ} が ある って 、 いい ね 。 {呼|よ}べる から 。 || Mochi. …It's good to have a name. It means someone can call you.
tomo: これ 、 {昔|むかし} モチ が つけて いた {鈴|すず} 。 うるさい って {嫌|いや}がる から 、 もう {使|つか}わない の 。 よかったら どうぞ 。 || This is the bell Mochi used to wear. She hated the noise, so we don't use it anymore. Take it, if you like.
!give rw_catbell
!unset rw_mochi_carried
!quest rw_mochi done
!refresh
!end
:later
tomo: {急|いそ}がない で 。 モチ は もう {逃|に}げない から 。 …… たぶん 。 || No hurry. Mochi won't run off again. …Probably.

@scene rw.mochi_home
narr: モチ が {日向|ひなた} で {伸|の}びて いる 。 {名札|なふだ} に は 、 ちゃんと {名前|なまえ} が ある 。 || Mochi is stretched out in the sun. Her tag has her name on it again.
mochi: ニャー 。 || Meow.
`, 'ch1/34_mochi');
