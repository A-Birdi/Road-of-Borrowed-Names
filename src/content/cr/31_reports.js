/* The Cloudroad, Chapter 10: the reports and the relay (expansion P12; rules src/engine/72k_tellings.js and
 * src/engine/72r_relay.js; plan 07_REGIONS.md R2, A8, A14, A52).
 *
 * The plans (cr.plan1–5, the tellings sheet): before each leg the station's reports, each with how its teller knows
 * (saw it, was told, a rumour, the signs, a notice, a map), and a choice of road. Only claims a report can vouch for
 * bind the plan: any plan that rests on them gets through, the best one without a detour; a plan that rests on
 * something nobody could vouch for is taken anyway, and the road shows what was true.
 *   1 Oiwake → Suginoki     clear: the runner ran the cedar avenue this morning; a rumour of bears on the old road
 *   2 Suginoki → Sakashita  a rumoured landslide on the stone road; the porter walked it this morning
 *   3 Sakashita → Nakayama  rain: the woodcutter saw the bridge washed out; yesterday's notice says all is well
 *   4 Nakayama → Umagaeshi  the mapmaker's new map shows the ledge as the short way (drawn from hearsay); a guest
 *                           climbed over a rockfall there; the innkeeper walked the main road yesterday
 *   5 Umagaeshi → Kirishita fog: the driver reads the wind (by morning it will lift); a rumour of a great ox; waiting
 *                           a night needs no certainty at all
 * The relay (cr.r1–5): the message the station hands you, and what you saw or heard on the way, passed on at the next
 * station with the certainty you have. Overstating sends help the wrong way (a flag the story reads and lets you put
 * right): a work crew to a landslide that isn't there (r2), a rescue down the stream for a courier who is safe at the
 * ford (r3), a horse driver up the ledge on the map's word (r4), a runner held back for snow that was only a forecast
 * (r5). Texts by profile: F kana and と いって いました, E 〜と言っていました and 〜そうです, I そうだ・らしい・ようだ
 * and 〜によると, A 〜との伝言 / 〜とのこと and faithful paraphrase. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const T = (jp, en) => ({ jp, en });
  const no = (en) => ({ en });
  C.tellings = C.tellings || {};
  C.relay = C.relay || {};

  // ---- the grammar this chapter teaches ------------------------------------------------------------------------------
  if (RB.grammar && RB.grammar.add) RB.grammar.add([
    { id: 'cr_to_itte', lv: 'E', title: '～と{言|い}っていました (… said that)', pat: '「{言葉|ことば}」 ／ {普通形|ふつうけい} ＋ と {言|い}って いました',
      en: 'Passing on what someone said: put their words (or the plain form) before と言っていました, "… was saying that". It keeps the words theirs: you vouch only that they said it. Said plainly instead, the sentence becomes your own claim.',
      ex: [{ jp: 'カンベエ さん が 「{明日|あした} {塩|しお} を {送|おく}る」 と {言|い}って いました 。', en: 'Kanbe said he will send salt tomorrow.' }, { jp: 'サダ さん は {道|みち} が {通|とお}れる と {言|い}って いました 。', en: 'Sada was saying the road is passable.' }] },
    { id: 'cr_tono', lv: 'A', title: '～との{伝言|でんごん} ／ ～との こと (a message that)', pat: '{普通形|ふつうけい} ＋ との {伝言|でんごん} です ／ との こと です',
      en: 'In careful, formal reporting, との (と + の) turns what was said into a noun: 〜との伝言です "the message is that …", 〜とのことです "I am told that …". It reports faithfully and keeps a polite distance: neither more certain nor less than what was said.',
      ex: [{ jp: '{明朝|みょうちょう} {塩|しお} を {二俵|にひょう} お{送|おく}り する と の {伝言|でんごん} です 。', en: 'The message is that two bales of salt will be sent tomorrow morning.' }, { jp: '{峠|とうげ} は {明日|あした} から {雪|ゆき} に なる だろう と の こと です 。', en: 'I am told the pass will likely have snow from tomorrow.' }] },
  ], 'cr');

  // ---- the plans --------------------------------------------------------------------------------------------------
  const PLAN = { intro: no('Read the reports about the road ahead. Mark what each one can really vouch for, then choose the way.'), actTitle: no('Choose the way'), go: no('Set off this way') };
  C.tellings['cr.plan1'] = Object.assign({ id: 'cr.plan1', title: T('{杉|すぎ}ノ{木|き} へ の {道|みち}', 'The road to Suginoki'),
    question: T('どちら の {道|みち} で {杉|すぎ}ノ{木|き} へ {行|い}く ？', 'Which way to Suginoki?'),
    sources: [
      { id: 'board', kind: 'board', who: T('{追分|おいわけ} の {掲示板|けいじばん}', 'Oiwake\'s notice board'),
        text: { F: T('「ほんどう ： すぎなみき 。 きゅうどう ： とおまわり 。」', '"Main road: the cedar avenue. Old road: the long way round."'),
          E: T('「{本道|ほんどう} は {杉並木|すぎなみき} 。 {旧道|きゅうどう} は {遠回|とおまわ}り 。」 と {書|か}いて ある 。', 'It says: "The main road: the cedar avenue. The old road: the long way round."'),
          I: T('{掲示|けいじ} に よると 、 {本道|ほんどう} は {杉並木|すぎなみき} を {通|とお}り 、 {旧道|きゅうどう} は {山|やま} を {回|まわ}る {遠回|とおまわ}り だ 。', 'According to the notice, the main road goes through the cedar avenue; the old road is the long way round the hill.') },
        claims: [{ id: 'c1a', jp: '{旧道|きゅうどう} は {遠回|とおまわ}り だ', en: 'The old road is the long way', vouch: true, why: no('How the roads run doesn\'t change: a notice can vouch for that.') }] },
      { id: 'jin', kind: 'saw', who: T('ジンパチ （{飛脚|ひきゃく}）', 'Jinpachi, a relay runner'),
        text: { F: T('ジンパチ ： 「けさ 、 すぎなみき を はしって きた よ 。 みち に は なにも なかった 。」', 'Jinpachi: "I ran down the cedar avenue this morning. Nothing on the road."'),
          E: T('ジンパチ ： 「{今朝|けさ} 、 {杉並木|すぎなみき} を {走|はし}って {来|き}ました 。 {道|みち} に は {何|なに} も ありません でした 。」', 'Jinpachi: "I ran down the cedar avenue this morning. There was nothing on the road."'),
          I: T('ジンパチ に よると 、 {今朝|けさ} {杉並木|すぎなみき} を {走|はし}って {来|き}た が 、 {道|みち} に は {何|なに} も なかった そう だ 。', 'According to Jinpachi, he ran down the cedar avenue this morning and there was nothing on the road.') },
        claims: [{ id: 'c1b', jp: '{本道|ほんどう} は {今朝|けさ} {通|とお}れた', en: 'The main road was clear this morning', vouch: true, why: no('He ran it himself this morning.') }] },
      { id: 'tome', kind: 'heard', who: T('トメ （{宿屋|やどや}）', 'Tome, the innkeeper'),
        text: { F: T('トメ ： 「きゅうどう に は くま が でる そう よ 。 だれ か が いって た わ 。」', 'Tome: "They say bears come out on the old road. Somebody told me."'),
          E: T('トメ さん は 「{旧道|きゅうどう} に は {熊|くま} が {出|で}る そう よ 。」 と {言|い}いました 。 {誰|だれ} に {聞|き}いた か は {覚|おぼ}えて いない 。', 'Tome said, "They say bears come out on the old road." She doesn\'t remember who told her.'),
          I: T('トメ さん は 、 {旧道|きゅうどう} に {熊|くま} が {出|で}る と いう {話|はなし} を どこ か で {聞|き}いた らしい 。 {自分|じぶん} で {見|み}た わけ で は ない 。', 'Tome seems to have heard somewhere that bears come out on the old road. She didn\'t see one herself.') },
        claims: [{ id: 'c1c', jp: '{旧道|きゅうどう} に は {熊|くま} が {出|で}る', en: 'There are bears on the old road', vouch: false, why: no('Tome only heard it, and can\'t say from whom. That can\'t decide the way, one way or the other.') }] },
    ],
    answer: { kind: 'choice', options: [
      { id: 'main', jp: '{本道|ほんどう} （{杉並木|すぎなみき}） を {行|い}く', en: 'Take the main road, through the cedar avenue', needs: ['c1b'], best: true },
      { id: 'old', jp: '{旧道|きゅうどう} を {回|まわ}る', en: 'Go round by the old road', needs: ['c1a'], detour: no('The old road gets there too: the long way round, as the notice says.') },
    ] } }, PLAN);

  C.tellings['cr.plan2'] = Object.assign({ id: 'cr.plan2', title: T('{坂下|さかした} へ の {道|みち}', 'The road to Sakashita'),
    question: T('どちら の {道|みち} で {坂下|さかした} へ {行|い}く ？', 'Which way to Sakashita?'),
    sources: [
      { id: 'kosuke', kind: 'rumour', who: T('コウスケ （{商人|しょうにん}）', 'Kōsuke, a merchant'),
        text: { F: T('コウスケ ： 「いしだたみ で がけくずれ が あった らしい よ 。 した の しゅく で きいた ん だ 。」', 'Kōsuke: "Seems there was a landslide on the stone steps. I heard it at the station below."'),
          E: T('コウスケ さん は 「{石畳|いしだたみ} で {崖崩|がけくず}れ が あった らしい よ 。 {下|した} の {宿|しゅく} で {聞|き}いた ん だ 。」 と {言|い}いました 。', 'Kōsuke said, "Seems there was a landslide on the stone steps. I heard it at the station below."'),
          I: T('コウスケ さん は 、 {石畳|いしだたみ} で {崖崩|がけくず}れ が あった と いう {噂|うわさ} を {下|した} の {宿|しゅく} で {聞|き}いた らしい 。 {誰|だれ} が {見|み}た の か は {知|し}らない 。', 'Kōsuke apparently heard a rumour of a landslide on the stone steps at the station below. Who saw it, he doesn\'t know.') },
        claims: [{ id: 'c2a', jp: '{石畳|いしだたみ} は {崖崩|がけくず}れ で ふさがって いる', en: 'The stone steps are blocked by a landslide', vouch: false, why: no('A rumour from another station; nobody says who saw it.') }] },
      { id: 'sada', kind: 'saw', who: T('サダ （{荷運|にはこ}び）', 'Sada, a porter'),
        text: { F: T('サダ ： 「けさ 、 いしだたみ を おりて きた 。 みち の よこ に ふるい いし が ある が 、 みち は とおれる 。」', 'Sada: "Came down the stone steps this morning. Some old stones by the road, but the road\'s clear."'),
          E: T('サダ さん は 「{今朝|けさ} 、 {石畳|いしだたみ} を {下|お}りて {来|き}た 。 {道|みち} の {横|よこ} に {古|ふる}い {石|いし} が ある が 、 {道|みち} は {通|とお}れる 。」 と {言|い}いました 。', 'Sada said, "I came down the stone steps this morning. There are old stones beside the road, but the road is clear."'),
          I: T('サダ さん に よると 、 {今朝|けさ} {石畳|いしだたみ} を {下|お}りて {来|き}た が 、 {道|みち} は {通|とお}れた そう だ 。 {横|よこ} の {石|いし} は 、 {昔|むかし} の {崖崩|がけくず}れ の もの らしい 。', 'According to Sada, he came down the stone steps this morning and the road was clear. The stones beside it seem to be from an old slide.') },
        claims: [
          { id: 'c2b', jp: '{石畳|いしだたみ} は {今朝|けさ} {通|とお}れた', en: 'The stone steps were clear this morning', vouch: true, why: no('Sada walked them this morning.') },
          { id: 'c2c', jp: '{道|みち} の {横|よこ} の {石|いし} は {古|ふる}い', en: 'The stones beside the road are old', vouch: true, why: no('He saw them, and they were there before.') }] },
      { id: 'board', kind: 'board', who: T('{杉|すぎ}ノ{木|き} の {掲示板|けいじばん}', 'Suginoki\'s notice board'),
        text: { F: T('「いしだたみ 、 らくせき ちゅうい 。」', '"Stone steps: beware of falling rocks."'),
          E: T('「{石畳|いしだたみ} 、 {落石|らくせき} {注意|ちゅうい} 。」 と {書|か}いて ある 。 {紙|かみ} は {古|ふる}い 。', 'It says: "Stone steps: beware of falling rocks." The paper is old.'),
          I: T('「{石畳|いしだたみ} 、 {落石|らくせき} {注意|ちゅうい} 。」 {紙|かみ} は {黄色|きいろ}く なって いて 、 いつ {書|か}かれた か {分|わ}からない 。', '"Stone steps: beware of falling rocks." The paper has yellowed; there\'s no telling when it was written.') },
        claims: [{ id: 'c2d', jp: '{今|いま} も {石|いし} が {落|お}ちて {来|く}る', en: 'Rocks are still falling now', vouch: false, why: no('A notice says what its writer knew when they wrote it, and this one doesn\'t say when that was.') }] },
    ],
    answer: { kind: 'choice', options: [
      { id: 'main', jp: '{本道|ほんどう} （{石畳|いしだたみ}） を {行|い}く', en: 'Take the main road, the stone steps', needs: ['c2b'], best: true },
      { id: 'old', jp: '{旧道|きゅうどう} を {回|まわ}る', en: 'Go round by the old road', needs: [], detour: no('The old road gets there too, the long way round. The landslide was only a rumour.') },
    ] } }, PLAN);

  C.tellings['cr.plan3'] = Object.assign({ id: 'cr.plan3', title: T('{中山|なかやま} へ の {道|みち}', 'The road to Nakayama'),
    question: T('{雨|あめ} の {中|なか} 、 どちら の {道|みち} で {中山|なかやま} へ {行|い}く ？', 'In the rain, which way to Nakayama?'),
    sources: [
      { id: 'yahei', kind: 'saw', who: T('ヤヘイ （{木|き}こり）', 'Yahei, a woodcutter'),
        text: { F: T('ヤヘイ ： 「さわ の はし が ながされて いた 。 ほんどう は わたれない 。 うえ の あさせ なら 、 いし を ふんで わたれる 。」', 'Yahei: "The bridge over the stream was washed away. You can\'t cross on the main road. Up at the shallows you can step across on the stones."'),
          E: T('ヤヘイ さん は 「{今朝|けさ} 、 {沢|さわ} の {橋|はし} が {流|なが}されて いた 。 {本道|ほんどう} は {渡|わた}れない 。 {上|うえ} の {浅瀬|あさせ} なら 、 {石|いし} を {踏|ふ}んで {渡|わた}れる 。」 と {言|い}いました 。', 'Yahei said, "This morning the bridge over the stream had been washed away. You can\'t cross on the main road. At the shallows higher up you can step across on the stones."'),
          I: T('ヤヘイ さん に よると 、 {今朝|けさ} {沢|さわ} の {橋|はし} が {流|なが}されて いた そう だ 。 {上|うえ} の {浅瀬|あさせ} は 、 {石|いし} を {踏|ふ}んで {渡|わた}れる らしい 。', 'According to Yahei, the bridge over the stream had been washed away this morning. The shallows higher up can apparently be crossed on the stones.') },
        claims: [
          { id: 'c3a', jp: '{本道|ほんどう} の {橋|はし} は {流|なが}された', en: 'The main road\'s bridge is washed away', vouch: true, why: no('Yahei saw it this morning.') },
          { id: 'c3b', jp: '{旧道|きゅうどう} の {浅瀬|あさせ} は {渡|わた}れる', en: 'The old road\'s shallows can be crossed', vouch: true, why: no('He crossed there himself.') }] },
      { id: 'board', kind: 'board', who: T('{坂下|さかした} の {掲示板|けいじばん}', 'Sakashita\'s notice board'),
        text: { F: T('「きのう ： ほんどう 、 いじょう なし 。」', '"Yesterday: main road, all clear."'),
          E: T('「{昨日|きのう} 。 {本道|ほんどう} 、 {異常|いじょう} なし 。」 と {書|か}いて ある 。', 'It says: "Yesterday. Main road: all clear."'),
          I: T('「{本道|ほんどう} 、 {異常|いじょう} なし 。」 {日付|ひづけ} は {昨日|きのう} 、 {雨|あめ} が {降|ふ}る {前|まえ} だ 。', '"Main road: all clear." It is dated yesterday, before the rain.') },
        claims: [{ id: 'c3c', jp: '{本道|ほんどう} は {今日|きょう} も {通|とお}れる', en: 'The main road is passable today', vouch: false, why: no('Written yesterday, before the rain: it can\'t vouch for today.') }] },
      { id: 'heisuke', kind: 'signs', who: T('ヘイスケ （{宿|しゅく} の {年寄|としよ}り）', 'Heisuke, the station\'s elder'),
        text: { F: T('ヘイスケ ： 「あの はし は じょうぶ だ 。 ながされる わけ が ない 。」', 'Heisuke: "That bridge is solid. No way it got washed away."'),
          E: T('ヘイスケ さん は 「あの {橋|はし} は {丈夫|じょうぶ} だ 。 {流|なが}される わけ が ない 。」 と {言|い}いました 。 {今日|きょう} は {見|み}て いない 。', 'Heisuke said, "That bridge is solid. It can\'t have been washed away." He hasn\'t seen it today.'),
          I: T('ヘイスケ さん は 、 {橋|はし} が {丈夫|じょうぶ} だ から {大丈夫|だいじょうぶ} な はず だ と {考|かんが}えて いる 。 {今日|きょう} の {橋|はし} を {見|み}た わけ で は ない 。', 'Heisuke reckons the bridge should be fine, since it is solid. He hasn\'t seen it today.') },
        claims: [{ id: 'c3d', jp: '{橋|はし} は {丈夫|じょうぶ} だ から {大丈夫|だいじょうぶ}', en: 'The bridge is solid, so it\'s fine', vouch: false, why: no('Heisuke is reasoning from how strong the bridge was. Yahei saw it this morning.') }] },
    ],
    answer: { kind: 'choice', options: [
      { id: 'main', jp: '{本道|ほんどう} を {行|い}く', en: 'Take the main road', needs: ['c3c'] },
      { id: 'old', jp: '{旧道|きゅうどう} の {浅瀬|あさせ} を {渡|わた}る', en: 'Cross at the old road\'s shallows', needs: ['c3b'], best: true },
    ] } }, PLAN);

  C.tellings['cr.plan4'] = Object.assign({ id: 'cr.plan4', title: T('{馬返|うまがえ}し へ の {道|みち}', 'The road to Umagaeshi'),
    question: T('どちら の {道|みち} で {馬返|うまがえ}し へ {行|い}く ？', 'Which way to Umagaeshi?'),
    sources: [
      { id: 'map', kind: 'map', who: T('リン の {新|あたら}しい {地図|ちず}', 'Rin\'s new map'),
        text: { F: T('ちず ： がけみち （きゅうどう） が いちばん ちかい 。', 'The map: the ledge (the old road) is the shortest.'),
          E: T('{地図|ちず} で は 、 {崖道|がけみち} （{旧道|きゅうどう}） が {一番|いちばん} {近|ちか}い 。 リン さん は 「その {辺|あた}り は 、 {昔|むかし} の {旅人|たびびと} の {絵|え} を {写|うつ}した 。」 と {言|い}いました 。', 'On the map the ledge (the old road) is the shortest. Rin said, "I copied that part from an old traveller\'s sketch."'),
          I: T('{地図|ちず} に よると 、 {崖道|がけみち} が {一番|いちばん} {近|ちか}い 。 ただし 、 その {部分|ぶぶん} は リン さん が {自分|じぶん} で {測|はか}った の で は なく 、 {古|ふる}い {絵図|えず} を {写|うつ}した もの らしい 。', 'According to the map, the ledge is the shortest. But that part seems to have been copied from an old sketch-map, not surveyed by Rin herself.') },
        claims: [{ id: 'c4a', jp: '{崖道|がけみち} が {近道|ちかみち} だ', en: 'The ledge is the short way', vouch: false, why: no('Rin copied that stretch from an old sketch, as she says herself. A map vouches for what its maker surveyed.') }] },
      { id: 'tatsu', kind: 'saw', who: T('タツ （{旅人|たびびと}）', 'Tatsu, a traveller'),
        text: { F: T('タツ ： 「おととい がけみち を とおった 。 おおきな いし が みち を ふさいで いた 。 うま は むり だ 。」', 'Tatsu: "I came along the ledge the day before yesterday. A big rock blocks the way. No horse could pass."'),
          E: T('タツ さん は 「おととい 、 {崖道|がけみち} を {通|とお}った 。 {大|おお}きな {石|いし} が {道|みち} を ふさいで いて 、 よじ{登|のぼ}って {越|こ}えた 。 {馬|うま} は {無理|むり} だ 。」 と {言|い}いました 。', 'Tatsu said, "I came along the ledge the day before yesterday. A big rock blocks the way; I had to climb over it. No horse could do it."'),
          I: T('タツ さん に よると 、 おととい {崖道|がけみち} を {通|とお}った とき 、 {大|おお}きな {石|いし} が {道|みち} を ふさいで いた そう だ 。', 'According to Tatsu, when he came along the ledge the day before yesterday, a big rock was blocking the way.') },
        claims: [{ id: 'c4b', jp: '{崖道|がけみち} は {石|いし} で ふさがって いる', en: 'The ledge is blocked by a rock', vouch: true, why: no('Tatsu climbed over it himself.') }] },
      { id: 'otaki', kind: 'saw', who: T('オタキ （{松葉屋|まつばや}）', 'Otaki, of the Matsuba inn'),
        text: { F: T('オタキ ： 「きのう 、 ほんどう を うまがえし まで あるいた わ 。 なにも なかった わ よ 。」', 'Otaki: "I walked the main road to Umagaeshi yesterday. Nothing in the way."'),
          E: T('オタキ さん は 「{昨日|きのう} 、 {本道|ほんどう} を {馬返|うまがえ}し まで {歩|ある}いた わ 。 {何|なに} も なかった わ よ 。」 と {言|い}いました 。', 'Otaki said, "I walked the main road to Umagaeshi yesterday. There was nothing in the way."'),
          I: T('オタキ さん に よると 、 {昨日|きのう} {本道|ほんどう} を {歩|ある}いた が 、 {何|なに} も なかった そう だ 。 {雨|あめ} は もう {上|あ}がって いた 。', 'According to Otaki, she walked the main road yesterday and there was nothing in the way. The rain had already stopped.') },
        claims: [{ id: 'c4c', jp: '{本道|ほんどう} は {昨日|きのう} {通|とお}れた', en: 'The main road was clear yesterday', vouch: true, why: no('She walked it herself, after the rain had stopped.') }] },
    ],
    answer: { kind: 'choice', options: [
      { id: 'main', jp: '{本道|ほんどう} を {行|い}く', en: 'Take the main road', needs: ['c4c'], best: true },
      { id: 'old', jp: '{崖道|がけみち} （{旧道|きゅうどう}） を {行|い}く', en: 'Take the ledge, the old road', needs: ['c4a'] },
    ] } }, PLAN);

  C.tellings['cr.plan5'] = Object.assign({ id: 'cr.plan5', title: T('{霧下|きりした} へ の {道|みち}', 'The road to Kirishita'),
    question: T('{霧|きり} が {出|で}て いる 。 どう する ？', 'The fog is in. What will you do?'),
    sources: [
      { id: 'genji', kind: 'signs', who: T('ゲンジ （{馬子|まご}） の {見立|みた}て', 'Genji the driver, reading the weather'),
        text: { F: T('ゲンジ ： 「かぜ が にし に かわった 。 あさ まで に は きり は はれる だろう 。」', 'Genji: "The wind\'s gone round to the west. The fog should lift by morning."'),
          E: T('ゲンジ さん は {空|そら} を {見|み}て 、 「{風|かぜ} が {西|にし} に {変|か}わった 。 {朝|あさ} まで に は {霧|きり} は {晴|は}れる だろう 。」 と {言|い}いました 。', 'Genji looked at the sky and said, "The wind has gone round to the west. The fog should lift by morning."'),
          I: T('ゲンジ さん は {風|かぜ} の {向|む}き から 、 {朝|あさ} まで に {霧|きり} が {晴|は}れる と {見|み}て いる 。 {四十年|よんじゅうねん} の {勘|かん} だ が 、 {確|たし}か な こと で は ない 。', 'From the wind, Genji judges the fog will lift by morning. Forty years\' instinct, but not a certainty.') },
        claims: [{ id: 'c5a', jp: '{朝|あさ} に は {霧|きり} が {晴|は}れる', en: 'The fog will lift by morning', vouch: false, why: no('Genji reads the wind well, and it\'s likely. But it is his reading of the signs, not something anyone has seen yet.') }] },
      { id: 'genji2', kind: 'saw', who: T('ゲンジ の {話|はなし} （{四十年|よんじゅうねん} {通|かよ}った {道|みち}）', 'Genji, on a road he has driven forty years'),
        text: { F: T('ゲンジ ： 「きり の ひ は 、 きゅうどう の がけ の ふち が みえない 。 わし は とおらん 。」', 'Genji: "In fog you can\'t see the edge of the drop on the old road. I won\'t go that way."'),
          E: T('ゲンジ さん は 「{霧|きり} の {日|ひ} は 、 {旧道|きゅうどう} の {崖|がけ} の {縁|ふち} が {見|み}えない 。 わし は {通|とお}らん 。」 と {言|い}いました 。', 'Genji said, "In fog you can\'t see the edge of the drop on the old road. I won\'t take it."'),
          I: T('ゲンジ さん に よると 、 {霧|きり} の {日|ひ} は {旧道|きゅうどう} の {崖|がけ} の {縁|ふち} が {見|み}えない そう だ 。 {本人|ほんにん} も {通|とお}らない と いう 。', 'According to Genji, in fog you can\'t see the edge of the drop on the old road. He won\'t take it himself.') },
        claims: [{ id: 'c5c', jp: '{霧|きり} の {日|ひ} の {旧道|きゅうどう} は {縁|ふち} が {見|み}えない', en: 'In fog, the old road\'s edge can\'t be seen', vouch: true, why: no('Forty years on that road: he has seen it, many times.') }] },
      { id: 'fusa', kind: 'rumour', who: T('チカ が {聞|き}いた {噂|うわさ}', 'A rumour Chika heard'),
        text: { F: T('チカ ： 「きり の よる に 、 きり の さか に おおきな うし が でる って うわさ よ 。」', 'Chika: "There\'s a rumour a huge ox comes out on the fog slope on foggy nights."'),
          E: T('チカ さん は 「{霧|きり} の {夜|よる} に 、 {霧|きり} の {坂|さか} に {大|おお}きな {牛|うし} が {出|で}る って {噂|うわさ} よ 。」 と {言|い}いました 。', 'Chika said, "There\'s a rumour that a huge ox comes out on the fog slope on foggy nights."'),
          I: T('{霧|きり} の {夜|よる} に {大|おお}きな {牛|うし} が {出|で}る と いう {噂|うわさ} が ある らしい 。 チカ さん も {見|み}た こと は ない 。', 'There is apparently a rumour of a huge ox on foggy nights. Chika has never seen it herself.') },
        claims: [{ id: 'c5b', jp: '{霧|きり} の {坂|さか} に {大|おお}きな {牛|うし} が {出|で}る', en: 'A huge ox comes out on the fog slope', vouch: false, why: no('A rumour: nobody Chika knows has seen it.') }] },
    ],
    answer: { kind: 'choice', options: [
      { id: 'main', jp: '{今|いま} 、 {本道|ほんどう} を {行|い}く （{霧|きり} は すぐ {晴|は}れる だろう）', en: 'Go now by the main road (the fog will lift soon enough)', needs: ['c5a'] },
      { id: 'old', jp: '{今|いま} 、 {旧道|きゅうどう} を {行|い}く', en: 'Go now by the old road', needs: ['c5d'] },
      { id: 'wait', jp: '{宿|やど} で {一晩|ひとばん} {待|ま}つ', en: 'Wait the night at the inn', needs: [], best: true },
    ] } }, PLAN);
  // the old road in fog rests on something nobody here says: that its edge can be seen
  C.tellings['cr.plan5'].sources[1].claims.push({ id: 'c5d', jp: '{霧|きり} でも {旧道|きゅうどう} は {大丈夫|だいじょうぶ}', en: 'The old road is fine even in fog', vouch: false, why: no('Nobody says so; Genji, who knows that road, says the opposite.') });

  // each report's reading task (the tellings sheet's "Read it closely"; evidence like any task): F and E ask how the
  // teller knows (saw it, was told, a rumour, the signs, a notice, a map); I and A whether it can vouch for its claim
  const HOW = {
    saw: T('{自分|じぶん} で {見|み}た', 'they saw it themselves'), heard: T('{人|ひと} から {聞|き}いた', 'someone told them'),
    rumour: T('{噂|うわさ} で {聞|き}いた', 'it is a rumour'), signs: T('{様子|ようす} から {考|かんが}えた', 'they worked it out from the signs'),
    board: T('{掲示|けいじ} に {書|か}いて ある', 'it is written on a notice'), map: T('{地図|ちず} に {描|か}いて ある', 'it is drawn on a map'),
  };
  const HOWF = { saw: 'じぶん で みた', heard: 'ひと から きいた', rumour: 'うわさ で きいた', signs: 'ようす から かんがえた', board: 'けいじ に かいて ある', map: 'ちず に かいて ある' };
  const KINDS = Object.keys(HOW);
  const pick2 = (k) => { const i = KINDS.indexOf(k); return [KINDS[(i + 1) % KINDS.length], KINDS[(i + 3) % KINDS.length]]; };
  const at = (t, p) => t[p] || t.I || t.E || t.F;
  for (const pid of ['cr.plan1', 'cr.plan2', 'cr.plan3', 'cr.plan4', 'cr.plan5']) {
    for (const src of C.tellings[pid].sources) {
      const id = 'cr.read_' + pid.slice(3) + '_' + src.id, c0 = src.claims[0];
      const how = (p, lab) => ({ kind: 'choose', item: p === 'F' ? 'g:cr_to_itte' : 'g:cr_to_itte', ctx: { jp: at(src.text, p).jp, en: '' }, prompt: { en: 'How does this report know? (' + src.who.en + ')' },
        options: [{ jp: lab(src.kind), ok: true }].concat(pick2(src.kind).map((k) => ({ jp: lab(k), ok: false, why: no('Look at how it is told: ' + HOW[src.kind].en + '.') }))) });
      const vouch = (p) => ({ kind: 'choose', item: p === 'A' ? 'g:rashii' : 'g:sou_hear', ctx: { jp: at(src.text, p).jp, en: '' }, prompt: { en: 'Can this report vouch for this: "' + c0.en + '"?' },
        options: [{ jp: 'はい 、 {確|たし}か だ と {言|い}える 。', ok: !!c0.vouch, why: c0.vouch ? undefined : c0.why }, { jp: 'いいえ 、 {確|たし}か と は {言|い}えない 。', ok: !c0.vouch, why: c0.vouch ? c0.why : undefined }].map((o) => (o.why ? o : { jp: o.jp, ok: o.ok })) });
      C.challenges[id] = { title: T(src.who.jp, src.who.en), tiers: { F: [how('F', (k) => HOWF[k])], E: [how('E', (k) => HOW[k].jp)], I: [vouch('I')], A: [vouch('A')] } };
      src.read = id;
    }
  }

  // ---- the relay: one message a leg ------------------------------------------------------------------------------
  const opt = (id, jp, en, k, why) => Object.assign({ id, jp, en }, k === 'ok' ? { ok: true } : k === 'over' ? { over: true } : { under: true }, why ? { why: no(why) } : {});
  C.relay['cr.r1'] = { id: 'cr.r1', title: T('{追分|おいわけ} から の {伝言|でんごん}', 'A message from Oiwake'), to: T('{杉|すぎ}ノ{木|き} の イネ さん', 'Ine, at Suginoki'),
    items: ['g:cr_to_itte', 'g:sou_hear'],
    parts: [
      { id: 'salt', have: T('カンベエ さん が 、 あなた に {直接|ちょくせつ} {言|い}った 。 「{明日|あした} の {朝|あさ} 、 {塩|しお} を {二俵|にひょう} {送|おく}る 。」', 'Kanbe told you himself: "Two bales of salt go up tomorrow morning."'),
        say: {
          F: [opt('quote', 'カンベエ さん が 「あした の あさ 、 しお を にひょう おくる 」 と いって いました 。', 'Kanbe said, "Two bales of salt go up tomorrow morning."', 'ok', null),
            opt('plain', 'あした の あさ 、 しお を にひょう おくります 。', 'I\'ll send two bales of salt tomorrow morning.', 'over', 'Said plainly, it sounds as if you are the one sending the salt. Kanbe is: と いって いました keeps it his.')],
          E: [opt('quote', 'カンベエ さん が 「{明日|あした} の {朝|あさ} 、 {塩|しお} を {二俵|にひょう} {送|おく}る 」 と {言|い}って いました 。', 'Kanbe said, "Two bales of salt go up tomorrow morning."', 'ok', null),
            opt('plain', '{明日|あした} の {朝|あさ} 、 {塩|しお} を {二俵|にひょう} {送|おく}ります 。', 'I\'ll send two bales of salt tomorrow morning.', 'over', 'Said plainly, it sounds as if you are sending the salt yourself. Kanbe is: と言っていました keeps it his.'),
            opt('rashii', '{明日|あした} 、 {塩|しお} が {来|く}る らしい です 。', 'Salt is coming tomorrow, apparently.', 'under', 'らしい makes it sound like something you picked up somewhere. Kanbe told you himself, and said how much: two bales.')],
          I: [opt('sou', 'カンベエ さん に よると 、 {明日|あした} の {朝|あさ} {塩|しお} を {二俵|にひょう} {送|おく}る そう です 。', 'According to Kanbe, two bales of salt go up tomorrow morning.', 'ok', null),
            opt('plain', '{明日|あした} の {朝|あさ} 、 {塩|しお} を {二俵|にひょう} {送|おく}ります 。', 'I\'ll send two bales of salt tomorrow morning.', 'over', 'Said plainly it becomes your own promise. Kanbe made it: によると … そうです passes it on as his.'),
            opt('you', '{明日|あした} 、 {塩|しお} を {送|おく}る よう です 。', 'It seems salt will be sent tomorrow.', 'under', 'ようだ is a judgement from what you can see. Kanbe told you outright: そうだ (I hear) is the form for that.')],
          A: [opt('tono', 'カンベエ さん から 、 {明朝|みょうちょう} {塩|しお} を {二俵|にひょう} お{送|おく}り する と の {伝言|でんごん} です 。', 'A message from Kanbe: two bales of salt will be sent tomorrow morning.', 'ok', null),
            opt('maybe', 'カンベエ さん から 、 {塩|しお} を {送|おく}る かも しれない と の こと です 。', 'Kanbe says he may send salt.', 'under', 'かもしれない adds a doubt Kanbe never had.'),
            opt('three', 'カンベエ さん から 、 {明朝|みょうちょう} {塩|しお} を {三俵|さんびょう} お{送|おく}り する と の {伝言|でんごん} です 。', 'A message from Kanbe: three bales of salt tomorrow morning.', 'over', 'Kanbe said two bales. Passing on another number is saying something he didn\'t.')],
        } },
      { id: 'road', if: 'var.tell_cr.plan1=main', have: T('{杉並木|すぎなみき} を {自分|じぶん} で {歩|ある}いて {来|き}た 。 {道|みち} に は {何|なに} も なかった 。', 'You walked the cedar avenue yourself. Nothing on the road.'),
        say: {
          F: [opt('plain', 'すぎなみき の みち は 、 なにも ありません でした 。', 'There was nothing on the cedar avenue.', 'ok', null),
            opt('quote', 'すぎなみき の みち は 、 なにも なかった と いって いました 。', 'Someone said there was nothing on the cedar avenue.', 'under', 'You walked it yourself. You can say it plainly: it is yours to say.')],
          E: [opt('plain', '{杉並木|すぎなみき} の {道|みち} は 、 {何|なに} も ありません でした 。', 'There was nothing on the cedar avenue.', 'ok', null),
            opt('rashii', '{杉並木|すぎなみき} の {道|みち} は 、 {大丈夫|だいじょうぶ} らしい です 。', 'The cedar avenue is fine, apparently.', 'under', 'You walked it yourself. You can say it plainly.')],
        } },
      { id: 'road_old', if: '!var.tell_cr.plan1=main', have: T('{旧道|きゅうどう} を {自分|じぶん} で {歩|ある}いて {来|き}た 。 {遠回|とおまわ}り だった が 、 {熊|くま} は いなかった 。', 'You walked the old road yourself. The long way round, and no bears.'),
        say: {
          F: [opt('plain', 'きゅうどう に は 、 くま は いません でした 。', 'There were no bears on the old road.', 'ok', null),
            opt('sou', 'きゅうどう に は 、 くま が でる そう です 。', 'They say bears come out on the old road.', 'over', 'You walked it and saw none. Passing the rumour on as if it held would say more than you know.')],
          E: [opt('plain', '{旧道|きゅうどう} に は 、 {熊|くま} は いません でした 。', 'There were no bears on the old road.', 'ok', null),
            opt('sou', '{旧道|きゅうどう} に は {熊|くま} が {出|で}る そう です 。', 'They say bears come out on the old road.', 'over', 'You walked it and saw none. Passing the rumour on would say more than you know.')],
        } },
    ] };

  C.relay['cr.r2'] = { id: 'cr.r2', title: T('{杉|すぎ}ノ{木|き} から の {伝言|でんごん}', 'A message from Suginoki'), to: T('{坂下|さかした} の ヘイスケ さん', 'Heisuke, at Sakashita'),
    items: ['g:cr_to_itte', 'g:sou_hear', 'g:rashii'], acts: { over: { slide: 'cr_r2_crew' } },
    parts: [
      { id: 'ine', have: T('イネ さん に {頼|たの}まれた 。 「{杉|すぎ}ノ{木|き} の {茶屋|ちゃや} は 、 {来月|らいげつ} から また {開|あ}けます 。」', 'Ine asked you to pass on: "Suginoki\'s teahouse opens again next month."'),
        say: {
          F: [opt('quote', 'イネ さん が 「らいげつ から また ちゃや を あけます 」 と いって いました 。', 'Ine said, "The teahouse opens again next month."', 'ok', null),
            opt('plain', 'らいげつ から また ちゃや を あけます 。', 'I\'m opening the teahouse again next month.', 'over', 'Said plainly, it sounds like your own teahouse. と いって いました keeps it Ine\'s.')],
          E: [opt('quote', 'イネ さん が 「{来月|らいげつ} から また {茶屋|ちゃや} を {開|あ}けます 」 と {言|い}って いました 。', 'Ine said, "The teahouse opens again next month."', 'ok', null),
            opt('plain', '{来月|らいげつ} から また {茶屋|ちゃや} を {開|あ}けます 。', 'I\'m opening the teahouse again next month.', 'over', 'Said plainly, it becomes your teahouse. と言っていました keeps it Ine\'s.')],
          I: [opt('sou', '{杉|すぎ}ノ{木|き} の {茶屋|ちゃや} は 、 {来月|らいげつ} から また {開|ひら}く そう です 。', 'I hear Suginoki\'s teahouse opens again next month.', 'ok', null),
            opt('you', '{杉|すぎ}ノ{木|き} の {茶屋|ちゃや} は 、 {来月|らいげつ} から {開|ひら}く よう です 。', 'It looks as if the teahouse will open next month.', 'under', 'ようだ is what you judge from what you see. Ine told you: そうです.')],
          A: [opt('tono', 'イネ さん から 、 {茶屋|ちゃや} を {来月|らいげつ} より {再開|さいかい} する と の こと です 。', 'From Ine: the teahouse reopens from next month.', 'ok', null),
            opt('maybe', 'イネ さん の {茶屋|ちゃや} は 、 {来月|らいげつ} あたり {開|ひら}く かも しれません 。', 'Ine\'s teahouse may open around next month.', 'under', 'Ine gave a time and meant it: かもしれません and あたり blur what she said.')],
        } },
      { id: 'slide', have: T('コウスケ さん が 「{石畳|いしだたみ} で {崖崩|がけくず}れ が あった らしい 。 {下|した} の {宿|しゅく} で {聞|き}いた 。」 と {言|い}って いた 。 {誰|だれ} が {見|み}た か は {分|わ}からない 。', 'Kōsuke said, "Seems there was a landslide on the stone steps. Heard it at the station below." Nobody knows who saw it.'),
        say: {
          F: [opt('rumour', 'いしだたみ で がけくずれ が あった と いう うわさ を ききました 。 だれ が みた か は わかりません 。', 'I heard a rumour of a landslide on the stone steps. Nobody knows who saw it.', 'ok', null),
            opt('plain', 'いしだたみ で がけくずれ が ありました 。', 'There was a landslide on the stone steps.', 'over', 'You only heard a rumour. Said as fact, Sakashita will act on it.')],
          E: [opt('rumour', '{石畳|いしだたみ} で {崖崩|がけくず}れ が あった と いう {噂|うわさ} を {聞|き}きました 。 {誰|だれ} が {見|み}た か は {分|わ}かりません 。', 'I heard a rumour of a landslide on the stone steps. Nobody knows who saw it.', 'ok', null),
            opt('plain', '{石畳|いしだたみ} で {崖崩|がけくず}れ が ありました 。', 'There was a landslide on the stone steps.', 'over', 'You only heard a rumour. Said as fact, Sakashita will act on it.')],
          I: [opt('rumour', '{石畳|いしだたみ} で {崖崩|がけくず}れ が あった と いう {噂|うわさ} が あります 。 ただ 、 {見|み}た {人|ひと} は いない よう です 。', 'There is a rumour of a landslide on the stone steps. But nobody seems to have seen it.', 'ok', null),
            opt('plain', '{石畳|いしだたみ} で {崖崩|がけくず}れ が ありました 。', 'There was a landslide on the stone steps.', 'over', 'A rumour passed on as fact: Sakashita will act on it.'),
            opt('you', '{石畳|いしだたみ} で {崖崩|がけくず}れ が あった よう です 。', 'It seems there was a landslide on the stone steps.', 'over', 'ようだ says you judged it from what you saw. You saw nothing: it was a rumour.')],
          A: [opt('rumour', '{石畳|いしだたみ} で {崖崩|がけくず}れ が あった と の {噂|うわさ} を {耳|みみ} に しました が 、 {出所|でどころ} は {分|わ}かりません 。', 'I heard a rumour of a landslide on the stone steps, though its source is unknown.', 'ok', null),
            opt('plain', '{石畳|いしだたみ} は {崖崩|がけくず}れ で {通行止|つうこうど}め です 。', 'The stone steps are closed by a landslide.', 'over', 'A rumour of unknown source, passed on as an official closure.')],
        } },
      { id: 'road', if: 'var.tell_cr.plan2=main', have: T('{石畳|いしだたみ} を {自分|じぶん} で {歩|ある}いた 。 {道|みち} の {横|よこ} に {古|ふる}い {石|いし} が あった が 、 {道|みち} は {通|とお}れた 。', 'You walked the stone steps yourself. There were old stones beside the road, but the road was clear.'),
        say: {
          F: [opt('plain', 'いしだたみ は とおれます 。 よこ の いし は ふるい もの でした 。', 'The stone steps are passable. The stones beside them were old ones.', 'ok', null),
            opt('rashii', 'いしだたみ は とおれる らしい です 。', 'The stone steps are passable, apparently.', 'under', 'You walked them yourself: say it plainly.')],
          E: [opt('plain', '{石畳|いしだたみ} は {通|とお}れます 。 {横|よこ} の {石|いし} は {古|ふる}い もの でした 。', 'The stone steps are passable. The stones beside them were old ones.', 'ok', null),
            opt('you', '{石畳|いしだたみ} は {通|とお}れる よう です 。', 'The stone steps seem to be passable.', 'under', 'You walked them yourself. No need to hedge.')],
        } },
      { id: 'road_old', if: '!var.tell_cr.plan2=main', have: T('サダ さん が 「{今朝|けさ} {石畳|いしだたみ} を {下|お}りて {来|き}た 。 {道|みち} は {通|とお}れる 。」 と {言|い}って いた 。 {自分|じぶん} は {旧道|きゅうどう} を {来|き}た 。', 'Sada said, "Came down the stone steps this morning. The road\'s clear." You yourself came by the old road.'),
        say: {
          F: [opt('quote', 'サダ さん が 「いしだたみ は とおれる 」 と いって いました 。', 'Sada said the stone steps are passable.', 'ok', null),
            opt('plain', 'いしだたみ は とおれます 。', 'The stone steps are passable.', 'over', 'You came by the old road: it was Sada who walked the steps. Say it as his.')],
          E: [opt('quote', 'サダ さん が 「{石畳|いしだたみ} は {通|とお}れる 」 と {言|い}って いました 。', 'Sada said the stone steps are passable.', 'ok', null),
            opt('plain', '{石畳|いしだたみ} は {通|とお}れます 。', 'The stone steps are passable.', 'over', 'You came by the old road: Sada walked the steps, not you.')],
        } },
    ] };

  C.relay['cr.r3'] = { id: 'cr.r3', title: T('{坂下|さかした} から の {伝言|でんごん}', 'A message from Sakashita'), to: T('{中山|なかやま} の オタキ さん', 'Otaki, at Nakayama'),
    items: ['g:cr_to_itte', 'g:sou_hear', 'g:you_mitai'], acts: { over: { matazo_rumour: 'cr_r3_rescue' } },
    parts: [
      { id: 'carp', have: T('ヘイスケ さん に {頼|たの}まれた 。 「{雨|あめ} が やんだら 、 {大工|だいく} を {寄越|よこ}して ほしい 。 {橋|はし} を {直|なお}す 。」', 'Heisuke asked: "Once the rain stops, send us carpenters. We\'ll fix the bridge."'),
        say: {
          F: [opt('quote', 'ヘイスケ さん が 「あめ が やんだら 、 だいく を よこして ほしい 」 と いって いました 。', 'Heisuke said, "Once the rain stops, send carpenters."', 'ok', null),
            opt('now', 'いま すぐ だいく を おくって ください 。', 'Send carpenters right away, please.', 'over', 'Heisuke asked for them once the rain stops, not now.')],
          E: [opt('quote', 'ヘイスケ さん が 「{雨|あめ} が やんだら 、 {大工|だいく} を {寄越|よこ}して ほしい 」 と {言|い}って いました 。', 'Heisuke said, "Once the rain stops, send carpenters."', 'ok', null),
            opt('now', '{今|いま} すぐ {大工|だいく} を {送|おく}って ください 。', 'Send carpenters right away, please.', 'over', 'Heisuke asked for them once the rain stops, not now.')],
          I: [opt('sou', 'ヘイスケ さん に よると 、 {雨|あめ} が やんだら {大工|だいく} を {寄越|よこ}して ほしい そう です 。 {橋|はし} を {直|なお}す ため です 。', 'According to Heisuke, they\'d like carpenters once the rain stops, to fix the bridge.', 'ok', null),
            opt('now', '{坂下|さかした} で は 、 {今|いま} すぐ {大工|だいく} が {必要|ひつよう} な よう です 。', 'Sakashita seems to need carpenters right away.', 'over', 'He said once the rain stops. ようだ dresses your own guess as what you saw.')],
          A: [opt('tono', 'ヘイスケ さん から 、 {雨|あめ} が {上|あ}がり {次第|しだい} 、 {橋|はし} の {修理|しゅうり} の ため {大工|だいく} を お{願|ねが}い したい と の こと です 。', 'From Heisuke: as soon as the rain stops, they would like carpenters to repair the bridge.', 'ok', null),
            opt('now', 'ヘイスケ さん から 、 {至急|しきゅう} {大工|だいく} を {寄越|よこ}す よう に と の こと です 。', 'From Heisuke: send carpenters urgently.', 'over', '至急 (urgently) is not what he said: he said once the rain stops.')],
        } },
      { id: 'matazo_met', if: 'cr_matazo_met', have: T('{旧道|きゅうどう} の {浅瀬|あさせ} で 、 {飛脚|ひきゃく} の マタゾウ さん に {会|あ}った 。 {足|あし} を {痛|いた}めて いた が 、 {無事|ぶじ} だった 。', 'At the old road\'s shallows you met Matazō, a courier. He had hurt his foot, but he was safe.'),
        say: {
          F: [opt('plain', 'ひきゃく の マタゾウ さん は 、 あさせ に います 。 あし を いためて います が 、 ぶじ です 。', 'Matazō the courier is at the shallows. He\'s hurt his foot, but he\'s safe.', 'ok', null),
            opt('rashii', 'マタゾウ さん は 、 ぶじ らしい です 。', 'Matazō is safe, apparently.', 'under', 'You met him yourself: say what you saw, and where he is.')],
          E: [opt('plain', '{飛脚|ひきゃく} の マタゾウ さん は 、 {旧道|きゅうどう} の {浅瀬|あさせ} に います 。 {足|あし} を {痛|いた}めて います が 、 {無事|ぶじ} です 。', 'Matazō the courier is at the old road\'s shallows. He\'s hurt his foot, but he\'s safe.', 'ok', null),
            opt('sou', 'マタゾウ さん は {無事|ぶじ} だ そう です 。', 'I hear Matazō is safe.', 'under', 'You met him yourself: no need for そうです. And say where he is.')],
        } },
      { id: 'matazo_rumour', if: '!cr_matazo_met', have: T('ヤヘイ さん が 「{飛脚|ひきゃく} が {一人|ひとり} 、 まだ {着|つ}かない 。 {沢|さわ} に {落|お}ちた の かも しれない 。」 と {言|い}って いた 。', 'Yahei said, "One of the couriers still hasn\'t come in. Maybe he fell in the stream."'),
        say: {
          F: [opt('maybe', 'ひきゃく が ひとり 、 まだ ついて いない そう です 。 さわ に おちた か どう か は 、 わかりません 。', 'I hear a courier hasn\'t arrived yet. Whether he fell in the stream, nobody knows.', 'ok', null),
            opt('plain', 'ひきゃく が さわ に おちました 。', 'A courier fell in the stream.', 'over', 'Yahei only wondered. Said as fact, Nakayama will send a rescue down the stream.')],
          E: [opt('maybe', '{飛脚|ひきゃく} が {一人|ひとり} まだ {着|つ}いて いない そう です 。 {沢|さわ} に {落|お}ちた か どう か は {分|わ}かりません 。', 'I hear a courier hasn\'t arrived yet. Whether he fell in the stream, nobody knows.', 'ok', null),
            opt('plain', '{飛脚|ひきゃく} が {沢|さわ} に {落|お}ちました 。', 'A courier fell in the stream.', 'over', 'Yahei only wondered. Said as fact, Nakayama will send a rescue down the stream.')],
          I: [opt('maybe', '{飛脚|ひきゃく} が {一人|ひとり} まだ {着|つ}かない そう です 。 {沢|さわ} に {落|お}ちた の かも しれない と ヤヘイ さん は {心配|しんぱい} して いました 。', 'I hear a courier hasn\'t arrived. Yahei was worried he might have fallen in the stream.', 'ok', null),
            opt('you', '{飛脚|ひきゃく} が {沢|さわ} に {落|お}ちた よう です 。', 'It seems a courier fell in the stream.', 'over', 'ようだ claims a judgement from what you saw. You saw nothing; Yahei only worried.')],
        } },
      { id: 'bridge', if: 'var.tell_cr.plan3=main', have: T('{本道|ほんどう} の {橋|はし} が {流|なが}されて いる の を 、 {自分|じぶん} で {見|み}た 。', 'You saw for yourself that the main road\'s bridge is washed away.'),
        say: {
          F: [opt('plain', 'ほんどう の はし は ながされて います 。', 'The main road\'s bridge is washed away.', 'ok', null),
            opt('sou', 'ほんどう の はし は ながされた そう です 。', 'I hear the main road\'s bridge is washed away.', 'under', 'You saw it yourself: say it plainly.')],
          E: [opt('plain', '{本道|ほんどう} の {橋|はし} は {流|なが}されて います 。 {自分|じぶん} で {見|み}ました 。', 'The main road\'s bridge is washed away. I saw it myself.', 'ok', null),
            opt('sou', '{本道|ほんどう} の {橋|はし} は {流|なが}された そう です 。', 'I hear the main road\'s bridge is washed away.', 'under', 'You saw it yourself: no need for そうです.')],
        } },
      { id: 'bridge_old', if: '!var.tell_cr.plan3=main', have: T('ヤヘイ さん が 、 {本道|ほんどう} の {橋|はし} が {流|なが}された と {言|い}って いた 。 {旧道|きゅうどう} の {浅瀬|あさせ} は 、 {自分|じぶん} で {渡|わた}った 。', 'Yahei said the main road\'s bridge is washed away. You crossed the old road\'s shallows yourself.'),
        say: {
          F: [opt('mixed', 'ほんどう の はし は ながされた そう です 。 きゅうどう の あさせ は わたれました 。', 'I hear the main bridge is washed away. The old road\'s shallows could be crossed.', 'ok', null),
            opt('plain', 'ほんどう の はし は ながされて います 。', 'The main road\'s bridge is washed away.', 'over', 'You didn\'t see the bridge; Yahei did. そうです keeps it his.')],
          E: [opt('mixed', '{本道|ほんどう} の {橋|はし} は {流|なが}された そう です 。 {旧道|きゅうどう} の {浅瀬|あさせ} は {渡|わた}れました 。', 'I hear the main bridge is washed away. The old road\'s shallows could be crossed.', 'ok', null),
            opt('plain', '{本道|ほんどう} の {橋|はし} は {流|なが}されて います 。', 'The main road\'s bridge is washed away.', 'over', 'You didn\'t see the bridge; Yahei did. そうです keeps it his.')],
        } },
    ] };

  C.relay['cr.r4'] = { id: 'cr.r4', title: T('{中山|なかやま} から の {伝言|でんごん}', 'A message from Nakayama'), to: T('{馬返|うまがえ}し の ゲンジ さん', 'Genji, at Umagaeshi'),
    items: ['g:cr_to_itte', 'g:sou_hear', 'g:rashii'], acts: { over: { ledge: 'cr_r4_ledge' } },
    parts: [
      { id: 'saddle', have: T('オタキ さん に {頼|たの}まれた 。 「ゲンジ さん の {馬|うま} の {鞍|くら} 、 {直|なお}って います よ 。 {取|と}り に {来|き}て ください 。」', 'Otaki asked: "Genji\'s saddle is mended. Please come and fetch it."'),
        say: {
          F: [opt('quote', 'オタキ さん が 「くら が なおった から 、 とり に きて 」 と いって いました 。', 'Otaki said, "The saddle\'s mended; come and get it."', 'ok', null),
            opt('plain', 'くら が なおりました 。 とり に きて ください 。', 'Your saddle is mended. Please come and get it.', 'over', 'Said plainly, it sounds as if you mended it and have it. It\'s Otaki\'s message.')],
          E: [opt('quote', 'オタキ さん が 「{鞍|くら} が {直|なお}った から 、 {取|と}り に {来|き}て 」 と {言|い}って いました 。', 'Otaki said, "The saddle\'s mended; come and fetch it."', 'ok', null),
            opt('plain', '{鞍|くら} が {直|なお}りました 。 {取|と}り に {来|き}て ください 。', 'Your saddle is mended. Please come and fetch it.', 'over', 'Said plainly, it sounds as if you have it. It\'s Otaki\'s message.')],
        } },
      { id: 'ledge', have: T('リン さん の {地図|ちず} で は 、 {崖道|がけみち} が {近道|ちかみち} に なって いる 。 でも 、 タツ さん は 「{崖道|がけみち} は {石|いし} で ふさがって いた 。」 と {言|い}って いた 。', 'Rin\'s map shows the ledge as the short way. But Tatsu said, "The ledge was blocked by a rock."'),
        say: {
          F: [opt('both', 'ちず では がけみち が ちかい です が 、 タツ さん は 「いし で ふさがって いた 」 と いって いました 。', 'On the map the ledge is shortest, but Tatsu said it was blocked by a rock.', 'ok', null),
            opt('map', 'がけみち が ちかみち です 。', 'The ledge is the short way.', 'over', 'That is only what the map says, and Tatsu saw it blocked. Genji will act on it.')],
          E: [opt('both', '{地図|ちず} で は {崖道|がけみち} が {近|ちか}い です が 、 タツ さん が 「{石|いし} で ふさがって いた 」 と {言|い}って いました 。', 'On the map the ledge is shortest, but Tatsu said it was blocked by a rock.', 'ok', null),
            opt('map', '{崖道|がけみち} が {近道|ちかみち} です 。', 'The ledge is the short way.', 'over', 'That is only what the map says, and Tatsu saw it blocked. Genji will act on it.'),
            opt('maybe', '{崖道|がけみち} は {通|とお}れない かも しれません 。', 'The ledge might not be passable.', 'under', 'Tatsu climbed over the rock himself: say what he saw, not a maybe.')],
          I: [opt('both', '{地図|ちず} で は {崖道|がけみち} が {近|ちか}い です が 、 タツ さん に よると 、 {石|いし} で ふさがって いる そう です 。', 'On the map the ledge is shortest, but according to Tatsu it\'s blocked by a rock.', 'ok', null),
            opt('map', '{地図|ちず} に よると 、 {崖道|がけみち} が {一番|いちばん} {近|ちか}い です 。', 'According to the map, the ledge is the shortest.', 'over', 'True of the map, but it leaves out what Tatsu saw. Genji will take the ledge on the map\'s word.')],
        } },
    ] };

  C.relay['cr.r5'] = { id: 'cr.r5', title: T('{馬返|うまがえ}し から の {伝言|でんごん}', 'A message from Umagaeshi'), to: T('{霧下|きりした} の サキチ さん', 'Sakichi, at Kirishita'),
    items: ['g:rashii', 'g:you_mitai', 'g:cr_to_itte'], acts: { over: { snow: 'cr_r5_snow' } },
    parts: [
      { id: 'snow', have: T('ゲンジ さん は {山|やま} の {雲|くも} を {見|み}て 、 「{峠|とうげ} は {明日|あした} から {雪|ゆき} に なる だろう 。」 と {言|い}って いた 。', 'Genji looked at the clouds on the peaks and said, "The pass will likely have snow from tomorrow."'),
        say: {
          F: [opt('quote', 'ゲンジ さん が 「とうげ は あした から ゆき に なる だろう 」 と いって いました 。', 'Genji said, "The pass will likely have snow from tomorrow."', 'ok', null),
            opt('plain', 'とうげ は あした から ゆき です 。', 'The pass has snow from tomorrow.', 'over', 'Genji said だろう: likely. Said as certain, Kirishita will act on it.')],
          E: [opt('quote', 'ゲンジ さん が 「{峠|とうげ} は {明日|あした} から {雪|ゆき} に なる だろう 」 と {言|い}って いました 。', 'Genji said, "The pass will likely have snow from tomorrow."', 'ok', null),
            opt('plain', '{峠|とうげ} は {明日|あした} から {雪|ゆき} です 。', 'The pass has snow from tomorrow.', 'over', 'Genji said だろう, "likely". Said as certain, Kirishita will act on it.')],
          I: [opt('rashii', 'ゲンジ さん の {見立|みた}て で は 、 {峠|とうげ} は {明日|あした} から {雪|ゆき} に なる らしい です 。', 'By Genji\'s reading, the pass will apparently have snow from tomorrow.', 'ok', null),
            opt('plain', '{峠|とうげ} は {明日|あした} から {雪|ゆき} に なります 。', 'The pass will have snow from tomorrow.', 'over', 'A forecast passed on as certain. らしい, with whose reading it is, keeps it a forecast.'),
            opt('you', '{峠|とうげ} は {明日|あした} から {雪|ゆき} に なる よう です 。', 'It seems the pass will have snow from tomorrow.', 'over', 'ようだ claims you judged it from what you saw. It was Genji\'s reading of the clouds, not yours.')],
          A: [opt('tono', 'ゲンジ さん の {見立|みた}て で は 、 {峠|とうげ} は {明日|あした} から {雪|ゆき} に なる だろう と の こと です 。', 'By Genji\'s reckoning, I am told, the pass is likely to have snow from tomorrow.', 'ok', null),
            opt('plain', '{峠|とうげ} は {明日|あした} より {降雪|こうせつ} と の こと です 。', 'I am told the pass will have snowfall from tomorrow.', 'over', 'Formal, but it drops だろう: a forecast turned into a fact.')],
        } },
      { id: 'fusa', have: T('チカ さん に {頼|たの}まれた 。 「スエ さん に 、 {頭痛|ずつう} の {薬|くすり} を {届|とど}けて ほしい 。 {次|つぎ} の {便|びん} で {送|おく}る 。」', 'Chika asked: "Tell Sue I\'ll send the headache medicine with the next post."'),
        say: {
          F: [opt('quote', 'チカ さん が 「つぎ の びん で くすり を おくる 」 と いって いました 。', 'Chika said she\'ll send the medicine with the next post.', 'ok', null),
            opt('plain', 'くすり を もって きました 。', 'I\'ve brought the medicine.', 'over', 'You haven\'t: Chika is sending it with the next post.')],
          E: [opt('quote', 'チカ さん が 「{次|つぎ} の {便|びん} で {薬|くすり} を {送|おく}る 」 と {言|い}って いました 。', 'Chika said she\'ll send the medicine with the next post.', 'ok', null),
            opt('plain', '{薬|くすり} を {持|も}って {来|き}ました 。', 'I\'ve brought the medicine.', 'over', 'You haven\'t: Chika is sending it with the next post.')],
        } },
    ] };
})(RB.content);
