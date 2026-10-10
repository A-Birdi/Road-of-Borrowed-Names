/* The Keepers' Road, Chapter 7: creatures and encounters (expansion P10; plan R8, E6–E8, C-09).
 *   kr.hisae         Hisae's questions at the lodge (social, A6): asking back opens her; plain answers alone do little.
 *   kr.wick_ridge    the Wick Moths come for the flame (E6): keep the two waystation lanterns lit.
 *   kr.moss_steps    the Moss Lantern won't let anyone pass until its name is read (a one-step machine).
 *   kr.shadow_gate   the Teller's Shadow retells what you did, wrongly; put the account right (social).
 *   kr.ghost_lectern the Lantern Ghost tells the apprentice's tale with a wrong ending; spot the change (social).
 *   kr.hyakuwa       the vigil's end: the Hundredth Tale, the story that wants to be told. No Unravel (C-09): the
 *                    ninety-ninth is finished so that nothing is left for a hundredth.
 *   kr.wander_seiji, kr.wander_kikyo  the wanderers (E3): a pilgrim who advises (never fights); the etoki teller, who
 *                    stands between a creature and her scroll.
 * Five creatures on interim art (F-36's rule; their own families are P16 art under AC-1). The real folklore is
 * labelled in the notebook (tsukumogami, the chōchin-obake); the keepers' lore is the game's own. Every conclusion
 * leads on. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  const say = (jp, en) => ({ jp, en });
  const ch = (o) => Object.assign({ kind: 'choose' }, o);
  const o = (en, ok, why) => (why ? { en, ok, why: { en: why } } : { en, ok });
  const oj = (jp, ok, why) => (why ? { jp, ok, why: { en: why } } : { jp, ok });
  C.encounters = C.encounters || {};
  function task(item, en, ok, w1, why1, w2, why2) {
    const low = ch({ item, prompt: { en }, options: [{ jp: ok, ok: true }, { jp: w1, ok: false, why: { en: why1 } }] });
    const high = ch({ item, prompt: { en: en + ' (Read them closely: two are near.)' },
      options: [{ jp: ok, ok: true }, { jp: w1, ok: false, why: { en: why1 } }, { jp: w2, ok: false, why: { en: why2 } }] });
    return { F: low, E: low, I: high, A: high };
  }

  // ---- the creatures ----------------------------------------------------------------------------------------------
  const EN = (id, d) => (C.enemies[id] = Object.assign({ region: 'keepers', bg: 'keepers', music: 'battle', boss: false, setting: 'outdoor' }, d));
  const POOL = {
    tags: ['keepers'],
    F: ['v:灯', 'v:名前', 'v:石', 'v:道', 'g:prt_no', 'counters'],
    E: ['v:最初', 'v:最後', 'g:v_ta', 'g:v_te_kara', 'g:mae_ato'],
    I: ['g:kr_ni_yoruto', 'g:kr_to_iu', 'g:sou_hear', 'g:koto_ni_naru'],
    A: ['g:kr_classical', 'g:kr_tsutaerareru', 'g:rashii'],
  };
  EN('kr.wick', {
    name: T('Wick Moth', '{灯食|ひく}い{蛾|が}'), art: 'moth', artOpts: { col: '#d8a848', col2: '#3a2a18' }, look: { custom: 'moth', col: '#d8a848' }, knots: 2, pool: POOL,
    pattern: ['strike', 'rest', 'strike'],
    intro: T('A moth with wings like scorched paper. It comes for the flame, not for you, and drinks it down to the wick.', '{焦|こ}げた {紙|かみ} の よう な {羽|はね} の {蛾|が} 。 {人|ひと} で は なく {灯|ひ} を {狙|ねら}い 、 {芯|しん} まで {吸|す}う 。'),
    settle: T('The moth circles the lantern once, as if warming itself, and flies off into the dark.', '{蛾|が} は {灯籠|とうろう} の まわり を {一度|いちど} {回|まわ}って 、 {闇|やみ} へ {飛|と}んで いった 。') });
  EN('kr.sandal', {
    name: T('Hundred-Year Sandal', '{百年|ひゃくねん}{草履|ぞうり}'), art: 'blot', artOpts: { col: '#a8885a' }, look: { custom: 'blot', col: '#a8885a' }, knots: 2, pool: POOL,
    pattern: ['sweep', 'strike', 'rest'],
    intro: T('A straw sandal a hundred years old that has, as old things will, woken up (a tsukumogami). It hops about kicking dust over the waystones.', '{百年|ひゃくねん} {履|は}かれた {草履|ぞうり} が 、 {付喪神|つくもがみ} に なった 。 {道標|みちしるべ} に {砂|すな} を かけて {回|まわ}る 。'),
    settle: T('The sandal flops down on the path, the right way up, as if waiting for a foot.', '{草履|ぞうり} は {道|みち} に {正|ただ}しく {並|なら}んで 、 {足|あし} を {待|ま}つ よう に {動|うご}かなく なった 。') });
  EN('kr.chochin', {
    name: T('Lantern Ghost', '{提灯|ちょうちん}お{化|ば}け'), art: 'lantern', artOpts: { col: '#e8c860' }, look: { custom: 'lanternghost', col: '#e8c860' }, knots: 3, pool: POOL,
    pattern: ['shroud', 'strike', 'rest'],
    intro: T('A paper lantern split along one rib into a grinning mouth (a chōchin-obake). It tells a story you know, and changes the ending.', '{骨|ほね} が {一本|いっぽん} {裂|さ}けて 、 {口|くち} の よう に {笑|わら}う {提灯|ちょうちん} 。 {知|し}って いる {話|はなし} を 、 {終|お}わり だけ {変|か}えて {語|かた}る 。'),
    settle: T('The lantern\'s mouth closes along its rib. It hangs quietly, just a lantern.', '{提灯|ちょうちん} の {口|くち} が {閉|と}じて 、 ただ の {提灯|ちょうちん} に {戻|もど}った 。') });
  EN('kr.moss', {
    name: T('Moss Lantern', '{苔|こけ}{灯籠|どうろう}'), art: 'golem', artOpts: { col: '#6a7a5a', core: '#c8b070' }, look: { custom: 'golem', col: '#6a7a5a' }, knots: 3, pool: POOL,
    pattern: ['chill', 'strike', 'rest'],
    intro: T('A stone lantern grown over with moss so thick it has stood up. It plants itself across the steps and will let no one by.', '{苔|こけ} に {覆|おお}われた {石|いし} の {灯籠|とうろう} が 、 {立|た}ち{上|あ}がった 。 {石段|いしだん} に {立|た}ち ふさがって 、 {誰|だれ} も {通|とお}さない 。'),
    settle: T('Named, the lantern settles back onto its base, and a little light shows in its fire box.', '{名前|なまえ} を {呼|よ}ばれた {灯籠|とうろう} は 、 {台|だい} の {上|うえ} に {戻|もど}り 、 {火袋|ひぶくろ} に {小|ちい}さな {灯|ひ} が ともった 。') });
  EN('kr.shadow', {
    name: T('Teller\'s Shadow', '{語|かた}り{部|べ} の {影|かげ}'), art: 'echo', artOpts: { col: '#3a3440' }, look: { custom: 'spirit', col: '#3a3440' }, knots: 2, pool: POOL, setting: 'indoor', bg: 'keepers_cave',
    pattern: ['lie', 'strike', 'rest'],
    // its retelling: you relit the ridge's lanterns by calling each one's name; it tells it without the names
    intents: {
      lie: { power: 1, target: 'rand',
        text: {
          F: { jp: 'あなた は 、 なまえ を よばない で ひ を つけた 。', en: 'You lit the lamps without calling their names.' },
          E: { jp: 'あなた は {名前|なまえ} を {呼|よ}ばない で 、 {灯|ひ} を つけた 。 {名前|なまえ} なんて 、 いらなかった 。', en: 'You lit the lamps without calling their names. Names weren\'t needed at all.' },
          I: { jp: '{聞|き}いた {話|はなし} に よる と 、 あなた は {尾根|おね} の {灯|ひ} を 、 {名前|なまえ} も {呼|よ}ばない で {点|とも}した そう だ 。', en: 'According to what I heard, you lit the ridge lamps without so much as calling their names.' },
          A: { jp: '{此|こ}の {道|みち} の {灯|ひ} は 、 {名|な} を {呼|よ}ばれる こと なく {点|とも}された 、 と {伝|つた}えられて いる 。', en: 'It is handed down that the lamps of this road were lit without their names ever being called.' },
        },
        truth: {
          F: ch({ item: 'c:kr_shadow_f', prompt: { en: 'The shadow says you lit the lamps without calling their names. What really happened?' }, options: [o('You called each lantern by its name, and then it lit.', true), o('It\'s true: the names didn\'t matter.', false, 'A lantern on this road lights only when it is called by its name.')] }),
          E: ch({ item: 'c:kr_shadow_e', prompt: { en: 'What is false in its telling?' }, options: [o('"Without calling their names": you read each name and called it.', true), o('"You lit the lamps": you never lit any.', false, 'You did light them; the false part is how.'), o('Nothing; that is what happened.', false, 'The lanterns stayed dark until their names were called.')] }),
          I: ch({ item: 'c:kr_shadow_i', prompt: { en: 'It says it heard this (によると … そうだ). What do you answer?' }, options: [o('Its source is wrong: you were there, and you called every name yourself.', true), o('It heard it from someone, so it must be true.', false, 'Hearsay (〜そうだ) is only as good as its source, and you were there.'), o('It is half true: you called only the first name.', false, 'You called each lamp by its own name.')] }),
          A: ch({ item: 'c:kr_shadow_a', prompt: { en: 'It says the tale "is handed down" (伝えられている). How do you answer an old telling that is wrong?' }, options: [o('A telling can be handed down and still be wrong: the lamps lit only when their names were called, and you saw it.', true), o('What is handed down is always true.', false, 'That is how the keepers came to trust the third telling.'), o('Old words cannot be judged.', false, 'You can weigh them against what you saw yourself.')] }),
        } },
    },
    intro: T('A shadow on the cave wall with a teller\'s fan. It tells what you have just done, a little wrong.', '{扇|おうぎ} を {持|も}った {語|かた}り{部|べ} の {影|かげ} 。 あなた が {今|いま} した こと を 、 {少|すこ}し {違|ちが}えて {語|かた}る 。'),
    settle: T('The shadow folds its fan and bows, and goes back to being the shape of a shelf.', '{影|かげ} は {扇|おうぎ} を たたんで {頭|あたま} を {下|さ}げ 、 {棚|たな} の {影|かげ} に {戻|もど}った 。') });
  EN('kr.hyakuwa', {
    name: T('The Hundredth Tale', '{百話目|ひゃくわめ}'), art: 'echo', artOpts: { col: '#1e1c26' }, look: { custom: 'spirit', col: '#1e1c26' }, knots: 6, pool: POOL, boss: true, setting: 'indoor', bg: 'keepers_cave', music: 'boss_keepers',
    pattern: ['lie', 'plea', 'heat', 'rest'],
    // its lie: that telling a hundredth tale brings the lamps back (the real custom, hyakumonogatari, stops at
    // ninety-nine, and so do the keepers); its plea: to be told. The answer is to give the ninety-ninth its ending.
    intents: {
      lie: { power: 2, target: 'rand',
        text: {
          F: { jp: 'ひゃく ばんめ の はなし を して 。 そう すれば 、 ひ が もどる よ 。', en: 'Tell the hundredth story. Then the lamps will come back.' },
          E: { jp: '{百|ひゃく} {番目|ばんめ} の {話|はなし} を して 。 そう すれば 、 {道|みち} の {灯|ひ} が {全部|ぜんぶ} {戻|もど}る よ 。', en: 'Tell the hundredth story. Then every lamp on the road will come back.' },
          I: { jp: '{灯守|ひもり} の {記録|きろく} に よる と 、 {百話目|ひゃくわめ} を {語|かた}れば {灯|ひ} が {戻|もど}る と いう 。 さあ 、 {語|かた}って 。', en: 'According to the keepers\' registers, if the hundredth is told, the lamps return. Go on, tell it.' },
          A: { jp: '{百話|ひゃくわ} {語|かた}り{終|お}えて こそ 、 {夜|よ} は {明|あ}ける 。 そう {伝|つた}えられて きた の だ 。', en: 'Only when a hundred tales are told does the night end. So it has always been handed down.' },
        },
        truth: {
          F: ch({ item: 'c:kr_tale_f', prompt: { en: 'It says telling a hundredth story brings the lamps back. What do you know?' }, options: [o('The keepers stop at ninety-nine: the hundredth is never told.', true), o('It\'s right: tell it.', false, 'Hisae and Kikyō both keep the vigil to ninety-nine.')] }),
          E: ch({ item: 'c:kr_tale_e', prompt: { en: 'What is false in what it said?' }, options: [o('"Then the lamps come back": the vigil is kept by stopping at ninety-nine, not by telling a hundredth.', true), o('"The hundredth story": there is no such custom.', false, 'The custom is real (hyakumonogatari); the false part is what telling it would do.'), o('Nothing; that is the custom.', false, 'The custom is to stop at ninety-nine.')] }),
          I: ch({ item: 'c:kr_tale_i', prompt: { en: 'It cites the keepers\' registers (によると). Do you believe its source?' }, options: [o('No: you read the registers yourself, and the keepers you met keep the vigil to ninety-nine.', true), o('Yes: it named a source, so it must be right.', false, 'Naming a source is not the same as the source saying it.'), o('The registers are lost, so no one can say.', false, 'You read them in the Deepest Shelves.')] }),
          A: ch({ item: 'c:kr_tale_a', prompt: { en: 'It says this "has been handed down" (伝えられてきた). What do you say?' }, options: [o('Handed down or not, the custom you saw kept stops at ninety-nine, so no hundredth is called.', true), o('Handed down means proven.', false, 'The keepers\' third telling was handed down too, and it was wrong.'), o('The night never ends anyway.', false, 'Dawn comes when the vigil is kept.')] }),
        } },
      plea: { power: 1,
        text: {
          F: { jp: 'わたし を かたって 。 だれ も わたし を かたって くれない 。', en: 'Tell me. Nobody will tell me.' },
          E: { jp: '{誰|だれ} も {私|わたし} を {語|かた}って くれない 。 ずっと {待|ま}って いる のに 。', en: 'Nobody will tell me. And I have waited so long.' },
          I: { jp: '{語|かた}られない {話|はなし} は 、 {話|はなし} と {言|い}える の か 。 {私|わたし} に も 、 {終|お}わり を くれ 。', en: 'Is a tale never told even a tale? Give me an ending too.' },
          A: { jp: '「{始|はじ}まりぬ」 と {語|かた}られた {話|はなし} に は 、 「{終|お}はりぬ」 が いる 。 …… {私|わたし} に も 、 {終|お}わり を 。', en: 'A tale told as "it began" needs its "it ended". …An ending for me too.' },
        },
        answer: {
          F: ch({ item: 'c:kr_tale_plea', prompt: { en: 'Answer it: what do you give it?' }, options: [{ jp: 'きゅうじゅうきゅう ばんめ の おわり', en: 'The ninety-ninth tale\'s ending', ok: true }, { jp: 'ひゃく ばんめ の はなし', en: 'A hundredth tale', ok: false, why: { en: 'Telling a hundredth is what the custom forbids.' } }] }),
          E: ch({ item: 'c:kr_tale_plea', prompt: { en: 'Answer it: how do you end the night?' }, options: [oj('{九十九|きゅうじゅうきゅう} {番目|ばんめ} の {話|はなし} を 、 {最後|さいご} まで {語|かた}る 。', true), oj('{百|ひゃく} {番目|ばんめ} の {話|はなし} を {始|はじ}める 。', false, 'That would call the very thing the vigil keeps away.'), oj('{何|なに} も {言|い}わない 。', false, 'Silence is the shijima\'s answer, not the keepers\'.')] }),
          I: ch({ item: 'c:kr_tale_plea', prompt: { en: 'Answer it in a way that gives the ninety-ninth its ending.' }, options: [oj('{見習|みなら}い は {東|ひがし} の {灯|ひ} を {点|とも}し 、 {名前|なまえ} を {呼|よ}んで 、 {朝|あさ} まで {番|ばん} を した 。 これ で {終|お}わり です 。', true), oj('では 、 {百話目|ひゃくわめ} を {始|はじ}めましょう 。', false, 'It asked for an ending, not a beginning.'), oj('{終|お}わり なんて 、 いらない でしょう 。', false, 'Refusing it an ending leaves it waiting in the corner.')] }),
          A: ch({ item: 'c:kr_tale_plea', prompt: { en: 'Which reply ends the tale without beginning another?' }, options: [oj('{九十九話目|きゅうじゅうきゅうわめ} 、 これ にて {終|お}はりぬ 。 {残|のこ}る {話|はなし} は 、 ありません 。', true), oj('{百話目|ひゃくわめ} 、 ここ に {始|はじ}まりぬ 。', false, '始まりぬ begins the hundredth: the one tale the vigil never tells.'), oj('{話|はなし} と いう もの に 、 {終|お}わり は ない 。', false, 'It asked for an ending; this tells it there is none.')] }),
        } },
    },
    intro: T('As the ninety-ninth wick burns low, the dark in the corner of the room gathers itself into a shape with no face, only a mouth that wants to speak. It is the story that wants to be told.', '{九十九|きゅうじゅうきゅう} {本目|ほんめ} の {芯|しん} が {短|みじか}く なる と 、 {部屋|へや} の {隅|すみ} の {闇|やみ} が {集|あつ}まって 、 {顔|かお} の ない {形|かたち} に なった 。 {語|かた}られたい {話|はなし} だ 。'),
    settle: T('There is nothing left for it to be. The shape thins like smoke from a snuffed wick, and the room is only a room.', 'もう 、 {語|かた}る {話|はなし} が {残|のこ}って いない 。 {形|かたち} は {消|け}した {芯|しん} の {煙|けむり} の よう に {薄|うす}れて 、 {部屋|へや} は ただ の {部屋|へや} に {戻|もど}った 。') });
  if (RB.creaturesA && RB.creaturesA.auditEnemy) {
    const note = 'interim: Keepers\' Road creature (P10) drawn on an existing family with its own palette; its own family is P16 art work (AC-1, C-82)';
    RB.creaturesA.auditEnemy('kr.wick', 'moth', 'meets', 'the moth family in scorched-paper amber: it fits the creature (a moth that drinks flame)');
    RB.creaturesA.auditEnemy('kr.chochin', 'lantern', 'meets', 'the lantern family: it fits the creature (a paper lantern ghost)');
    for (const [id, art] of [['kr.sandal', 'blot'], ['kr.moss', 'golem'], ['kr.shadow', 'echo'], ['kr.hyakuwa', 'echo']]) RB.creaturesA.auditEnemy(id, art, 'incomplete', note);
  }

  // ---- Hisae's questions (social, A6) -------------------------------------------------------------------------------
  C.encounters['kr.hisae'] = {
    id: 'kr.hisae', kind: 'social', name: say('ヒサエ の {問|と}い', 'Hisae\'s questions'),
    rules: { wait: true },
    autoRoute: ['s:ask_mean', 's:names', 's:ask_alone', 'wait', 's:why', 'gesture'],
    social: {
      parties: [{ aid: 'n:hisae', name: say('ヒサエ', 'Hisae'), stance: 'closed', wants: { en: 'To know whether you are the kind of people who look after a road, or only use it.' } }],
      claims: {
        q1: { by: 'n:hisae', jp: '{灯|ひ} の {名前|なまえ} を 、 {呼|よ}べる かい 。', en: 'Can you call a lamp by its name?' },
        q2: { by: 'n:hisae', jp: '{何|なん} の ため に 、 この {道|みち} を {登|のぼ}って きた ん だい 。', en: 'What did you climb this road for?' },
        p1: { by: 'n:hisae', jp: '{名前|なまえ} を {呼|よ}ぶ と いう の は 、 その {灯|ひ} が {誰|だれ} の ため に ある か を {覚|おぼ}えて いる と いう こと さ 。', en: 'Calling a lamp by its name means remembering who it is lit for.', hidden: true },
        p2: { by: 'n:hisae', jp: '{三十年|さんじゅうねん} 、 {一人|ひとり} で {守|まも}って きた 。 {仲間|なかま} は 、 {他|ほか} の {道|みち} を {歩|ある}いて いる はず さ 。', en: 'Thirty years I\'ve kept it alone. The others will be walking other roads.', hidden: true },
        p3: { by: 'n:hisae', jp: '{葦|あし}ノ{瀬|せ} の ツル の {師匠|ししょう} かい 。 あの {子|こ} は 、 ここ で {見習|みなら}い を して いた よ 。 よく {泣|な}く {子|こ} だった 。', en: 'Tsuru of Reedwake\'s teacher? That one apprenticed here. Cried a lot, as a child.', hidden: true },
      },
      understanding: 4,
      gesture: { name: say('{灯|ひ} を {一緒|いっしょ} に {見守|みまも}る', 'Keep the lamp with her'), desc: 'Sit with her by the one lamp, and say nothing for a while.', effect: { flag: 'trust' }, says: { en: 'You sit with Hisae by her lamp. After a while she moves over to make room.' } },
      unravelTip: { en: 'Nothing here is knotted. Hisae is testing you: listen to what she is really asking.' },
      actions: [
        { id: 'ask_mean', kind: 'ask', label: say('「{呼|よ}べる 」 と いう の は 、 どう いう {意味|いみ} です か 。', 'Ask back what she means by "call"'), once: true,
          task: task('g:kr_to_iu', 'Which asks what she means by "call"?', '「{呼|よ}べる 」 と いう の は 、 どう いう {意味|いみ} です か 。', '「{呼|よ}べる 」 は 、 {大|おお}きな {声|こえ} です か 。', 'That asks whether it means loudly: it guesses instead of asking.', 'はい 、 {呼|よ}べます 。', 'That answers without knowing what she asked.'),
          effect: { reveal: 'p1', understanding: 1, stance: { 'n:hisae': 'listening' } }, says: { en: 'Hisae\'s eyebrows go up. "You ask. Good. Most people just say yes."' } },
        { id: 'names', kind: 'restate', label: say('{迎|むか}え の {灯|ひ} 、 {杉|すぎ} の {灯|ひ} 、 {狐|きつね} の {灯|ひ} を {点|つ}けました 。', 'Tell her the lamps you have relit, by name'), once: true,
          task: task('v:灯', 'Which names the lamps you have relit?', '{迎|むか}え の {灯|ひ} 、 {杉|すぎ} の {灯|ひ} 、 {狐|きつね} の {灯|ひ} を {点|つ}けました 。', '{三|みっ}つ の {灯籠|とうろう} を {消|け}しました 。', 'That says you put them out.', '{迎|むか}え の {灯|ひ} を {探|さが}して います 。', 'That says you are still looking for it.'),
          cases: [{ when: { stance: { 'n:hisae': 'listening' } }, effect: { understanding: 1 }, says: { en: 'Hisae nods slowly at each name, as if greeting it.' } }],
          says: { en: '"Names are easy to say," says Hisae. She doesn\'t look up.' } },
        { id: 'ask_alone', kind: 'ask', label: say('ずっと {一人|ひとり} で 、 {灯|ひ} を {守|まも}って きた ん です か 。', 'Ask whether she has kept the lamps alone all this time'), once: true,
          task: task('g:n_desu', 'Which asks whether she has kept the lamps alone?', 'ずっと {一人|ひとり} で 、 {灯|ひ} を {守|まも}って きた ん です か 。', 'ずっと {一人|ひとり} で 、 {灯|ひ} を {消|け}して きた ん です か 。', 'That asks whether she has been putting them out.', 'これから {一人|ひとり} で {守|まも}る ん です か 。', 'That asks about from now on, not until now.'),
          cases: [{ when: { stance: { 'n:hisae': 'listening' } }, effect: { reveal: 'p2', understanding: 1 }, says: { en: 'Hisae looks at her lamp. "Thirty years. The others will be walking other roads, I expect."' } }],
          says: { en: '"Who\'s asking?" says Hisae.' } },
        { id: 'why', kind: 'propose', label: say('{消|き}えた {名前|なまえ} の こと を 、 {知|し}りたい ん です 。', 'Say you have come to understand the vanishing names'), once: true,
          task: task('g:v_tai', 'Which says you want to understand the vanishing names?', '{消|き}えた {名前|なまえ} の こと を 、 {知|し}りたい ん です 。', '{消|き}えた {名前|なまえ} を 、 {忘|わす}れたい ん です 。', 'That says you want to forget them.', '{灯落|ひおち} へ {行|い}く {近道|ちかみち} を {知|し}りたい ん です 。', 'That says you only want a shortcut.'),
          cases: [{ when: { claims: 'p1' }, effect: { understanding: 1 }, says: { en: '"Hm," says Hisae. "Then you\'ve come to the right road. It has been losing them longer than anywhere."' } }],
          says: { en: '"Everyone wants to know things," says Hisae.' } },
        { id: 'tsuru', kind: 'evidence', label: say('{葦|あし}ノ{瀬|せ} の ツル さん を {知|し}って います か 。', 'Ask whether she knows Tsuru of Reedwake'), once: true, when: { claims: 'p2' },
          task: task('g:prt_ka', 'Which asks whether she knows Tsuru?', '{葦|あし}ノ{瀬|せ} の ツル さん を {知|し}って います か 。', '{葦|あし}ノ{瀬|せ} の ツル さん に {会|あ}いました か 。', 'That asks whether she met Tsuru (recently).', '{葦|あし}ノ{瀬|せ} の ツル さん は {知|し}りません 。', 'That says you don\'t know her.'),
          effect: { reveal: 'p3', understanding: 1, flag: 'tsuru' }, says: { en: 'Hisae laughs, a short dry laugh. "Tsuru! Not her: her teacher. That one apprenticed here."' } },
      ],
      responses: {
        hikari: { says: { en: 'Your light falls on Hisae\'s hands: wax on the fingers, a burn scar on one thumb. A keeper\'s hands.' }, effect: { understanding: 1 } },
        unravel: { says: { en: 'Nothing is knotted. Hisae is only testing you.' } },
      },
      wait: { when: { all: [{ stance: { 'n:hisae': 'listening' } }, { not: { claims: 'p2' } }] }, effect: { reveal: 'p2' }, says: { en: 'You say nothing. Hisae trims the wick. "Thirty years," she says at last, to the lamp. "The others will be walking other roads."' } },
      companion: {
        nao: [{ id: 'nao_road', name: say('{道|みち} の {話|はなし} を する', 'Talk about roads'), desc: 'Nao has walked more roads than most.', once: true, effect: { understanding: 1, stance: { 'n:hisae': 'listening' } }, says: { en: 'Nao names the roads they have carried letters on. Hisae knows half of them, and how the lanterns stood on each.' } }],
        mio: [{ id: 'mio_hands', name: say('{手|て} の {火傷|やけど} を {診|み}る', 'See to the burn on her thumb'), desc: 'Mio has salve in her bag.', once: true, effect: { understanding: 1, stance: { 'n:hisae': 'listening' } }, says: { en: 'Mio takes Hisae\'s hand without asking and puts salve on the old burn. Hisae lets her.' } }],
        ren: [{ id: 'ren_wick', name: say('{芯|しん} を {整|ととの}える', 'Trim the wick'), desc: 'Keeper to keeper.', once: true, effect: { understanding: 1, stance: { 'n:hisae': 'listening' } }, says: { en: 'Ren trims the wick, a keeper\'s small exact movement. Hisae watches their hands, and says nothing, and that says a great deal.' } }],
        suzu: [{ id: 'suzu_story', name: say('{昔話|むかしばなし} を ねだる', 'Ask her for an old story'), desc: 'Suzu knows how to ask.', once: true, effect: { understanding: 1, stance: { 'n:hisae': 'listening' } }, says: { en: 'Suzu asks for a story from the old days. Hisae pretends to be annoyed for exactly as long as it takes to start one.' } }],
      },
      drift: [{ when: { all: [{ rounds: 3 }, { stance: { 'n:hisae': 'closed' } }] }, once: true, effect: { stance: { 'n:hisae': 'listening' } }, says: { en: 'Hisae sighs. "You\'re stubborn. Keepers are stubborn."' } }],
    },
    conclusions: [
      { id: 'trust', when: { flag: 'trust' }, result: 'end', text: { en: 'Hisae makes room for you by her lamp.' }, flags: { kr_hisae_trust: true } },
      { id: 'tsuru', when: { all: [{ flag: 'tsuru' }, { understanding: 4 }] }, result: 'end', text: { en: 'Hisae talks of the old days until the wick needs trimming again.' }, flags: { kr_hisae_trust: true } },
      { id: 'heard', when: { understanding: 3 }, result: 'end', text: { en: 'Hisae seems satisfied, in her way.' } },
      { id: 'unresolved', when: { rounds: 8 }, result: 'end', text: { en: 'Hisae goes back to her lamp. She has heard enough, for now.' } },
    ],
  };

  // ---- the Wick Moths (E6: keep the lanterns lit) --------------------------------------------------------------------
  C.encounters['kr.wick_ridge'] = {
    id: 'kr.wick_ridge', name: say('{灯|ひ} を {守|まも}る', 'Keep the lamps lit'),
    lead: { enemy: 'kr.wick', pattern: ['strike:east', 'rest', 'strike:west'], intents: { 'strike:east': { target: 'o:east' }, 'strike:west': { target: 'o:west' } } },
    group: { normal: ['kr.wick'], hard: ['kr.wick', 'kr.wick'] },
    actors: [
      { aid: 'o:east', side: 'object', name: say('{東|ひがし} の {灯籠|とうろう}', 'the east lantern'), hp: 3, protectable: true },
      { aid: 'o:west', side: 'object', name: say('{西|にし} の {灯籠|とうろう}', 'the west lantern'), hp: 3, protectable: true },
    ],
    objective: { kind: 'protect', aid: 'o:east', text: say('{二|ふた}つ の {灯|ひ} を {守|まも}る', 'Keep both lanterns lit until the moths settle or give up.') },
    settleWins: true,
    conclusions: [
      { id: 'out', when: { any: [{ down: 'o:east' }, { down: 'o:west' }] }, result: 'end', text: { en: 'A lantern goes out, and the moths drift away sated. It can be lit again.' } },
      { id: 'kept', when: { settled: 'all' }, result: 'win', text: { en: 'Both lanterns are still burning.' }, flags: { kr_moths_kept: true } },
      { id: 'held', when: { all: [{ rounds: 6 }, { standing: 'o:east' }, { standing: 'o:west' }] }, result: 'win', text: { en: 'The moths give up on the lamps and flutter off.' }, flags: { kr_moths_kept: true } },
    ],
  };

  // ---- the Moss Lantern (read its name) -----------------------------------------------------------------------------
  const nameTask = {
    F: ch({ item: 'v:名前', prompt: { en: 'The Moss Lantern\'s plate, under the moss: "□の□". The lamp above it on the steps is the Cedar Light. What is this one called? (It stands among the ferns at the top.)' }, options: [{ jp: 'しだ の ひ', ok: true }, { jp: 'すぎ の ひ', ok: false, why: { en: 'That is the lamp further down: the Cedar Light.' } }] }),
    E: ch({ item: 'v:名前', prompt: { en: 'Moss covers its plate; only 「の灯」 shows. It stands among the ferns at the top of the steps. Read its name.' }, options: [{ jp: '{羊歯|しだ} の {灯|ひ}', ok: true }, { jp: '{杉|すぎ} の {灯|ひ}', ok: false, why: { en: 'That is the lamp further down.' } }] }),
    I: ch({ item: 'g:kr_to_iu', prompt: { en: 'Kumazō said the lamp at the top "is called after what grows round it". Which is its name?' }, options: [{ jp: '{羊歯|しだ} の {灯|ひ} と いう {名前|なまえ}', ok: true }, { jp: '{杉|すぎ} の {灯|ひ} と いう {名前|なまえ}', ok: false, why: { en: 'Cedars grow everywhere on the steps; the ferns grow only round this one.' } }, { jp: '{苔|こけ} の {灯|ひ} と いう {名前|なまえ}', ok: false, why: { en: 'The moss came later; it is what hides the name.' } }] }),
    A: ch({ item: 'g:kr_classical', prompt: { en: 'Under the moss, an old inscription: 「此の灯、羊歯の灯なり」. What is its name?' }, options: [{ jp: '{羊歯|しだ} の {灯|ひ}', ok: true }, { jp: '{此|こ}の {灯|ひ}', ok: false, why: { en: '此の is "this": the name follows it.' } }, { jp: '{灯|ひ} なり', ok: false, why: { en: 'なり is the classical "is": the name comes before it.' } }] }),
  };
  C.encounters['kr.moss_steps'] = {
    id: 'kr.moss_steps', kind: 'procedure', name: say('{苔|こけ}{灯籠|どうろう}', 'The Moss Lantern'),
    lead: { enemy: 'kr.moss' },
    rules: { wait: true },
    procedure: {
      id: 'kr_moss', version: 1, restart: 'start',
      machine: { named: 'no' },
      show: [{ key: 'named', label: say('{名前|なまえ}', 'Its name'), values: { no: say('{呼|よ}ばれて いない', 'not yet called'), yes: say('{呼|よ}ばれた', 'called') } }],
      done: { en: 'Called by its name, the Moss Lantern settles back onto its base and lets you by.' },
      steps: [
        { id: 'name', text: say('{苔|こけ} の {下|した} の {名札|なふだ} を {読|よ}んで 、 {名前|なまえ} を {呼|よ}ぶ 。', 'Read the plate under the moss, and call it by its name.'),
          task: nameTask,
          actions: [
            { id: 'call', label: say('{名前|なまえ} を {呼|よ}ぶ', 'Call it by its name'), ok: true, set: { named: 'yes' }, means: { en: 'You will call the lantern by its name.' }, result: { en: 'The moss stirs. The lantern stops, listening.' } },
            { id: 'push', label: say('{押|お}して {通|とお}る', 'Push past it'), means: { en: 'You will try to shove past it.' }, wrong: { en: 'The lantern doesn\'t budge an inch; it only plants itself more firmly.' } },
          ] },
      ],
    },
    conclusions: [{ id: 'named', when: { proc: 'done' }, result: 'win', text: { en: 'The Moss Lantern, named, steps back onto its base. A small light shows in it.' }, flags: { kr_moss1_named: true } }],
  };

  // ---- the Teller's Shadow (put the account right) -----------------------------------------------------------------
  C.encounters['kr.shadow_gate'] = {
    id: 'kr.shadow_gate', kind: 'social', name: say('{語|かた}り{部|べ} の {影|かげ}', 'The Teller\'s Shadow'),
    lead: { enemy: 'kr.shadow' },
    rules: { wait: true },
    autoRoute: ['s:east', 's:bell', 's:who'],
    social: {
      parties: [{ aid: 'n:shadow', name: say('{影|かげ}', 'the Shadow'), stance: 'closed', wants: { en: 'To have the last word on what happened.' } }],
      claims: {
        w1: { by: 'n:shadow', jp: '{旅人|たびびと} は 、 {西|にし} の {灯|ひ} を {最初|さいしょ} に {点|つ}けた 。', en: 'The travellers lit the west lamp first.' },
        w2: { by: 'n:shadow', jp: '{旅人|たびびと} は 、 {鐘|かね} を {最初|さいしょ} に {鳴|な}らした 。', en: 'The travellers rang the bell first.' },
        w3: { by: 'n:shadow', jp: '{旅人|たびびと} は 、 {一人|ひとり} で {洞|ほら} に {入|はい}った 。', en: 'The traveller came into the cave alone.', hidden: true },
      },
      understanding: 3,
      unravelTip: { en: 'There is nothing to untangle but the account. Put it right.' },
      actions: [
        { id: 'east', kind: 'restate', label: say('{最初|さいしょ} に {点|つ}けた の は 、 {東|ひがし} の {灯|ひ} です 。', 'Correct it: the east lamp was first'), once: true,
          task: task('v:最初', 'Which corrects the account of the first lamp?', '{最初|さいしょ} に {点|つ}けた の は 、 {東|ひがし} の {灯|ひ} です 。', '{最初|さいしょ} に {点|つ}けた の は 、 {西|にし} の {灯|ひ} です 。', 'That agrees with the Shadow\'s wrong account.', '{最後|さいご} に {点|つ}けた の は 、 {東|ひがし} の {灯|ひ} です 。', 'The east lamp was first, not last.'),
          effect: { understanding: 1, stance: { 'n:shadow': 'listening' } }, says: { en: 'The Shadow\'s fan pauses. "…The east. Yes. The east."' } },
        { id: 'bell', kind: 'restate', label: say('{鐘|かね} を {鳴|な}らした の は 、 {最後|さいご} です 。', 'Correct it: the bell was last'), once: true,
          task: task('v:最後', 'Which corrects the account of the bell?', '{鐘|かね} を {鳴|な}らした の は 、 {最後|さいご} です 。', '{鐘|かね} を {鳴|な}らした の は 、 {最初|さいしょ} です 。', 'That agrees with the Shadow.', '{鐘|かね} は {鳴|な}らして いません 。', 'You did ring it, last.'),
          effect: { understanding: 1 }, says: { en: '"Last," says the Shadow, and its edges grow fainter.' } },
        { id: 'who', kind: 'restate', label: say('{一人|ひとり} じゃ ありません 。 {二人|ふたり} で {来|き}ました 。', 'Correct it: you came in together'), once: true, when: { claims: 'w3' },
          task: task('counters', 'Which corrects the account of who came in?', '{一人|ひとり} じゃ ありません 。 {二人|ふたり} で {来|き}ました 。', '{一人|ひとり} で {来|き}ました 。', 'That agrees with the Shadow.', '{三人|さんにん} で {来|き}ました 。', 'There are two of you.'),
          effect: { understanding: 1 }, says: { en: 'The Shadow looks from you to your companion, and seems, for a shadow, embarrassed.' } },
      ],
      responses: { hikari: { says: { en: 'Light thins the Shadow, but it keeps talking. Only the right account will quiet it.' } }, unravel: { says: { en: 'Nothing is knotted but the story.' } } },
      wait: { when: { not: { claims: 'w3' } }, effect: { reveal: 'w3' }, says: { en: 'In the silence the Shadow goes on: "And the traveller came into the cave alone…"' } },
      drift: [{ when: { all: [{ rounds: 2 }, { understanding: 0 }] }, once: true, effect: { stance: { 'n:shadow': 'listening' } }, says: { en: 'The Shadow\'s fan slows. It seems to be waiting to be corrected.' } }],
      companion: {
        nao: [{ id: 'nao_record', name: say('{記録|きろく} を {正|ただ}す', 'Set the record straight'), desc: 'A courier knows how a report goes wrong.', once: true, effect: { understanding: 1 }, says: { en: 'Nao recites, like a delivery log, exactly what you did and in what order.' } }],
        mio: [{ id: 'mio_calm', name: say('{落|お}ち{着|つ}いて {話|はな}す', 'Speak calmly'), desc: 'Mio does not raise her voice.', once: true, effect: { understanding: 1 }, says: { en: 'Mio tells it plainly, gently, as she would to a patient who has the story muddled.' } }],
        ren: [{ id: 'ren_order', name: say('{順番|じゅんばん} を {唱|とな}える', 'Recite the order'), desc: 'Ren remembers every word.', once: true, effect: { understanding: 1 }, says: { en: 'Ren recites the order of the lamps as a keeper would, the names one after another.' } }],
        suzu: [{ id: 'suzu_retort', name: say('ツッコミ を {入|い}れる', 'Put it right, with a retort'), desc: 'A straight man\'s job.', once: true, effect: { understanding: 1 }, says: { en: '"West? We\'d have walked into the wall!" Suzu says, and the Shadow\'s fan droops.' } }],
      },
    },
    conclusions: [
      { id: 'right', when: { understanding: 3 }, result: 'win', text: { en: 'The account is right. The Shadow folds its fan, bows, and the stairs down are clear.' }, flags: { kr_cave2_open: true } },
      { id: 'tired', when: { rounds: 8 }, result: 'end', text: { en: 'The Shadow tires of talking and slips back among the shelves. The stairs are clear.' }, flags: { kr_cave2_open: true } },
    ],
  };

  // ---- the Lantern Ghost at the lectern (spot the changed ending) ------------------------------------------------
  C.encounters['kr.ghost_lectern'] = {
    id: 'kr.ghost_lectern', kind: 'social', name: say('{提灯|ちょうちん}お{化|ば}け の {話|はなし}', 'The Lantern Ghost\'s tale'),
    lead: { enemy: 'kr.chochin' },
    rules: { wait: true },
    autoRoute: ['s:spot'],
    social: {
      parties: [{ aid: 'n:ghost', name: say('{提灯|ちょうちん}お{化|ば}け', 'the Lantern Ghost'), stance: 'closed', wants: { en: 'Someone to notice the story is wrong.' } }],
      claims: {
        g1: { by: 'n:ghost', jp: '{見習|みなら}い は {東|ひがし} 、 {泉|いずみ} 、 {名|な} の {灯|ひ} を {点|つ}けた 。 そして {鐘|かね} を {鳴|な}らす と …… {戸|と} は {閉|し}まった まま だった ！', en: 'The apprentice lit the east, the spring and the name lamps. And when the bell was rung… the door stayed shut!' },
        g2: { by: 'n:ghost', jp: '…… {誰|だれ} も {気|き}づかない 。 {百年|ひゃくねん} 、 {違|ちが}う {終|お}わり を {語|かた}って きた のに 。', en: '…Nobody ever notices. A hundred years I\'ve told it with the wrong ending.', hidden: true },
      },
      understanding: 2,
      unravelTip: { en: 'Nothing is tangled. The ghost has changed the end of a tale you know.' },
      actions: [
        { id: 'spot', kind: 'restate', label: say('{違|ちが}います 。 {鐘|かね} が {鳴|な}る と 、 {戸|と} は {開|ひら}いた ん です 。', 'Point out the changed ending: the door opened'), once: true,
          task: task('g:v_ta', 'Which puts the ending right?', '{違|ちが}います 。 {鐘|かね} が {鳴|な}る と 、 {戸|と} は {開|ひら}いた ん です 。', 'そう です 。 {戸|と} は {閉|し}まった まま でした 。', 'That agrees with the changed ending.', '{違|ちが}います 。 {鐘|かね} は {鳴|な}らなかった ん です 。', 'The bell did ring; what changed is what happened after.'),
          effect: { understanding: 2 }, says: { en: 'The lantern\'s mouth stops grinning. It seems almost relieved.' } },
      ],
      responses: { hikari: { says: { en: 'The ghost glows brighter; it likes light. The story is what is wrong, not the lantern.' } }, unravel: { says: { en: 'Nothing is knotted but the story\'s ending.' } } },
      drift: [{ when: { rounds: 2 }, once: true, effect: { stance: { 'n:ghost': 'listening' } }, says: { en: 'The ghost starts the tale over, and leaves a little pause before the ending.' } }],
      wait: { when: { not: { claims: 'g2' } }, effect: { reveal: 'g2', understanding: 1, stance: { 'n:ghost': 'listening' } }, says: { en: 'You listen to the end without interrupting. The ghost tells it again, slower, as if hoping you\'ll catch it. "Nobody ever notices," it mutters.' } },
      companion: {
        nao: [{ id: 'nao_misdelivered', name: say('{宛先|あてさき} を {正|ただ}す', 'Correct the address'), desc: 'A wrong ending is a misdelivered letter.', once: true, effect: { understanding: 1 }, says: { en: '"Wrong door," says Nao. "In the real one, it opens."' } }],
        mio: [{ id: 'mio_gentle', name: say('{優|やさ}しく {指摘|してき} する', 'Point it out gently'), desc: 'Mio is gentle with the muddled.', once: true, effect: { understanding: 1, stance: { 'n:ghost': 'listening' } }, says: { en: 'Mio tells the ghost, kindly, that it has the ending wrong, the way she would tell a child their bandage is on the wrong knee.' } }],
        ren: [{ id: 'ren_recite', name: say('{本当|ほんとう} の {結末|けつまつ} を {唱|とな}える', 'Recite the true ending'), desc: 'Ren remembers every word.', once: true, effect: { understanding: 1 }, says: { en: 'Ren recites the ending as the stele has it: "the bell is the last". The ghost\'s grin falters.' } }],
        suzu: [{ id: 'suzu_ending', name: say('{結末|けつまつ} を {直|なお}す', 'Fix the ending'), desc: 'Suzu knows how a story should end.', once: true, effect: { understanding: 1 }, says: { en: '"No, no, no," says Suzu. "The door opens. That\'s the whole point of the bell."' } }],
      },
    },
    conclusions: [{ id: 'calm', when: { understanding: 2 }, result: 'win', text: { en: 'The Lantern Ghost hangs quiet by the lectern, just a lantern.' }, flags: { kr_ghost_calmed: true } },
      { id: 'tired', when: { rounds: 6 }, result: 'end', text: { en: 'The ghost runs out of ways to tell it wrong, and goes quiet.' }, flags: { kr_ghost_calmed: true } }],
  };

  // ---- the Hundredth Tale (the vigil's end; no Unravel, C-09) ------------------------------------------------------
  C.encounters['kr.hyakuwa'] = {
    id: 'kr.hyakuwa', kind: 'social', name: say('{百話目|ひゃくわめ}', 'The Hundredth Tale'),
    lead: { enemy: 'kr.hyakuwa' },
    rules: { wait: true },
    autoRoute: ['s:listen', 's:ask', 'wait', 's:end', 'gesture'],
    social: {
      parties: [{ aid: 'n:tale', name: say('{百話目|ひゃくわめ}', 'the Hundredth Tale'), stance: 'closed', wants: { en: 'To be told. A hundredth story, after ninety-nine.' } }],
      claims: {
        t1: { by: 'n:tale', jp: '{九十九|きゅうじゅうきゅう} の {話|はなし} が {終|お}わった 。 {次|つぎ} は 、 {百|ひゃく} {番目|ばんめ} だ 。', en: 'Ninety-nine tales are over. Next is the hundredth.' },
        t2: { by: 'n:tale', jp: '{終|お}わらない {話|はなし} が ある なら 、 {続|つづ}き を {語|かた}れば いい 。', en: 'If a story isn\'t finished, its sequel can be told.', hidden: true },
        t3: { by: 'n:tale', jp: '{九十九|きゅうじゅうきゅう} {番目|ばんめ} は 、 まだ {終|お}わって いない 。', en: 'The ninety-ninth isn\'t finished yet.', hidden: true },
      },
      understanding: 4,
      gesture: { name: say('{最後|さいご} の {芯|しん} を {消|け}す', 'Put out the last wick'), desc: 'Together, close the ninety-ninth tale for good.', effect: { flag: 'closed' }, says: { en: 'You put out the ninety-ninth wick together. The room is dark, and for the first time, it is only dark.' } },
      unravelTip: { en: 'A story is not a knot. The tale wants to be told; give it nothing left to tell.' },
      actions: [
        { id: 'listen', kind: 'ask', label: say('{何|なに} が {語|かた}りたい の です か 。', 'Ask what it wants to tell'), once: true,
          task: task('g:prt_ka', 'Which asks what it wants to tell?', '{何|なに} が {語|かた}りたい の です か 。', '{何|なに} も {語|かた}らないで ください 。', 'That forbids it; it asks nothing.', '{誰|だれ} が {語|かた}った の です か 。', 'That asks who told it, not what it wants.'),
          effect: { reveal: 't2', understanding: 1, stance: { 'n:tale': 'listening' } }, says: { en: 'The shape leans in. "A sequel," it breathes. "Every story that isn\'t finished has one."' } },
        { id: 'ask', kind: 'ask', label: say('どの {話|はなし} が 、 まだ {終|お}わって いない の です か 。', 'Ask which story is unfinished'), once: true, when: { claims: 't2' },
          task: task('g:n_desu', 'Which asks which story is unfinished?', 'どの {話|はなし} が 、 まだ {終|お}わって いない の です か 。', 'どの {話|はなし} が 、 もう {終|お}わった の です か 。', 'That asks which are finished.', 'いつ {話|はなし} が {終|お}わる の です か 。', 'That asks when, not which.'),
          effect: { reveal: 't3', understanding: 1 }, says: { en: '"The ninety-ninth," it says. "The apprentice lit the lamps… and then? And then?"' } },
        { id: 'end', kind: 'propose', label: say('{見習|みなら}い は {鐘|かね} を {鳴|な}らした 。 それで 、 {話|はなし} は おしまい 。', 'Finish the ninety-ninth: the bell rang, and that is the end'), once: true, when: { claims: 't3' },
          task: { F: ch({ item: 'v:最後', prompt: { en: 'Finish the tale so that nothing is left over.' }, options: [{ jp: 'かね が なった 。 おしまい 。', ok: true }, { jp: 'かね が なった 。 そして 、 なにか が きた 。', ok: false, why: { en: 'That leaves something for a hundredth tale.' } }] }),
            E: ch({ item: 'g:v_ta', prompt: { en: 'Finish the tale so that nothing is left over.' }, options: [{ jp: '{見習|みなら}い は {最後|さいご} に {鐘|かね} を {鳴|な}らした 。 それで 、 おしまい です 。', ok: true }, { jp: '{見習|みなら}い は {鐘|かね} を {鳴|な}らした 。 それから 、 {何|なに} か が {来|き}ました 。', ok: false, why: { en: 'それから opens a sequel: just what the tale wants.' } }] }),
            I: ch({ item: 'g:kr_tsutaerareru', prompt: { en: 'Finish the tale so that nothing is left over (read closely: two are near).' }, options: [{ jp: '{鐘|かね} が {鳴|な}り 、 {儀式|ぎしき} は {終|お}わった と {伝|つた}えられて いる 。 {話|はなし} は ここ まで 。', ok: true }, { jp: '{鐘|かね} が {鳴|な}った {後|あと} 、 {何|なに} か が {来|き}た と {伝|つた}えられて いる 。', ok: false, why: { en: 'That hands down a sequel.' } }, { jp: '{鐘|かね} が {鳴|な}った か どう か は 、 {伝|つた}えられて いない 。', ok: false, why: { en: 'That leaves the ending open.' } }] }),
            A: ch({ item: 'g:kr_classical', prompt: { en: 'Close the tale the old way (read closely: two are near).' }, options: [{ jp: '{鐘|かね} {鳴|な}りて 、 {物語|ものがたり} {終|お}はりぬ 。', ok: true }, { jp: '{鐘|かね} {鳴|な}りて 、 {物語|ものがたり} {始|はじ}まりぬ 。', ok: false, why: { en: '始まりぬ: "began". That opens a new story.' } }, { jp: '{鐘|かね} {鳴|な}る べし 。', ok: false, why: { en: 'べし is "must ring": it does not finish anything.' } }] }) },
          effect: { understanding: 2 }, says: { en: '"…And that is the end," you say. The shape waits for more. There is no more.' } },
      ],
      responses: {
        hikari: { says: { en: 'Light only makes the shadows in the corners sharper. A story isn\'t afraid of the light.' } },
        unravel: { says: { en: 'There is nothing to untangle. A story wants an ending, not a knife.' } },
      },
      wait: { when: { all: [{ stance: { 'n:tale': 'listening' } }, { not: { claims: 't3' } }] }, effect: { reveal: 't3' }, says: { en: 'In the silence the shape speaks again: "The ninety-ninth… you never finished it."' } },
      companion: {
        nao: [{ id: 'nao_seal', name: say('{封|ふう} を する', 'Seal it like a letter'), desc: 'A delivered letter is finished.', once: true, effect: { understanding: 1 }, says: { en: 'Nao folds the last page of the tale and presses their thumb on it, like a seal on a delivered letter. "Done."' } }],
        mio: [{ id: 'mio_lullaby', name: say('{静|しず}か に {締|し}める', 'Close it gently'), desc: 'As at a bedside.', once: true, effect: { understanding: 1 }, says: { en: 'Mio closes the tale the way you end a bedtime story: quietly, so no one asks for another.' } }],
        ren: [{ id: 'ren_wick', name: say('{最後|さいご} の {芯|しん} を {守|まも}る', 'Keep the last wick'), desc: 'Ren keeps it from guttering into a sequel.', once: true, effect: { understanding: 1 }, says: { en: 'Ren cups the last wick so it burns down clean, all the way, with nothing left smouldering.' } }],
        suzu: [{ id: 'suzu_tell', name: say('{一緒|いっしょ} に {語|かた}る', 'Tell it together'), desc: 'Suzu helps tell the ninety-ninth, to its end.', once: true, effect: { understanding: 2 }, says: { en: 'Suzu takes up the tale with Kikyō, the two of them trading lines like a double act, and lands the ending so neatly there is nowhere left to go.' } }],
      },
      drift: [{ when: { all: [{ rounds: 2 }, { stance: { 'n:tale': 'closed' } }] }, once: true, effect: { stance: { 'n:tale': 'listening' } }, says: { en: 'Another wick goes out. The shape turns its faceless head towards you, waiting.' } }],
    },
    conclusions: [
      { id: 'closed', when: { flag: 'closed' }, result: 'win', text: { en: 'The ninety-ninth tale is finished, and there is nothing left for a hundredth.' }, flags: { kr_tale_closed: true } },
      { id: 'ended', when: { understanding: 4 }, result: 'win', text: { en: 'With nothing left to tell, the Hundredth Tale thins away.' }, flags: { kr_tale_closed: true } },
      { id: 'hisae', when: { rounds: 9 }, result: 'end', text: { en: 'Hisae finishes the tale herself, in a few dry words. The shape has nothing left, and goes.' } },
    ],
  };

  // ---- the wanderers (E3) -------------------------------------------------------------------------------------------
  C.encounters['kr.wander_seiji'] = {
    id: 'kr.wander_seiji', name: say('{巡礼|じゅんれい} と {一緒|いっしょ} に', 'With the pilgrim'),
    lead: { enemy: 'kr.sandal', knots: 2 },
    actors: [{
      aid: 'g:seiji', side: 'guest', name: say('セイジ', 'Seiji'), hp: 3,
      agenda: { wants: 'pass', act: { kind: 'say' }, leavesWhen: { rounds: 3 } },
      lines: {
        arrive: say('{草履|ぞうり} の {付喪神|つくもがみ} です ！ {戦|たたか}え ません が 、 {知|し}って いる こと は {言|い}えます 。', '"A sandal tsukumogami! I can\'t fight, but I can tell you what I know."'),
        act: say('{古|ふる}い {物|もの} は 、 {大事|だいじ} に {扱|あつか}えば {静|しず}か に なる と {言|い}います 。', '"Old things settle down if you treat them with care, they say."'),
        leave: say('{僕|ぼく} は {社|やしろ} へ {急|いそ}ぎます 。 お{気|き}を つけて ！', '"I\'ll hurry on to the shrine. Take care!" Seiji goes up the north path.'),
      },
    }],
    conclusions: [{ id: 'won', when: { settled: 'all' }, result: 'win', text: { en: 'The sandal settles, and the path is clear.' }, flags: { kr_seiji_gone: true } }],
  };
  C.encounters['kr.wander_kikyo'] = {
    id: 'kr.wander_kikyo', name: say('{絵巻|えまき} を {守|まも}る', 'Guard the scroll'),
    lead: { enemy: 'kr.chochin', knots: 3 },
    actors: [{
      aid: 'g:kikyo', side: 'guest', name: say('キキョウ', 'Kikyō'), hp: 3,
      agenda: { wants: 'help', act: { kind: 'ward', on: 'pc', n: 1 }, leavesWhen: { rounds: 4 } },
      lines: {
        arrive: say('{絵巻|えまき} に {近|ちか}づかないで ！ {提灯|ちょうちん}お{化|ば}け は 、 {話|はなし} を {食|た}べる の よ ！', '"Keep away from my scroll! Lantern ghosts eat stories!"'),
        act: say('{絵巻|えまき} の {箱|はこ} を {盾|たて} に して 、 {前|まえ} に {出|で}る 。', 'Kikyō steps in front of you with the scroll box held up like a shield.'),
        leave: say('{宿坊|しゅくぼう} で {待|ま}って いる わ 。', '"I\'ll be waiting at the lodge." Kikyō hurries off with her scroll.'),
      },
    }],
    conclusions: [{ id: 'won', when: { settled: 'all' }, result: 'win', text: { en: 'The lantern ghost goes quiet, and the scroll is safe.' }, flags: { kr_ridge_ghost_done: true } }],
  };
})(RB.content);
