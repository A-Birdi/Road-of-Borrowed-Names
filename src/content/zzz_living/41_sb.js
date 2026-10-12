/* Snowbell's Living World (C-87; docs/future/work/LW1_AUTHORING.md, LW1_ROLLOUT.md). The hamlet's story phases (day,
 * evening, storm, morning) are left as they are: each routine's base is the placement that holds after the story,
 * and every new place carries that placement's own condition, so nobody moves on the evening of the lamp or in the
 * storm. From `ch4_done`:
 * W2 routines: Natsume (the inn; dozing by the kids in the goat shed; counting goats for her uncle), Kanta (the
 *   snow sculptures; Hoshino's telescope; waiting for fish beside Denji), Sachi (her washing; weaving at home;
 *   posting a letter to her husband at Sōsuke's).
 * W3 Yae (the innkeeper, who knows everyone) and Sōsuke (the postmaster) can be asked after people; Tetsuji, counting
 *   his goats, won't be interrupted.
 * W1 beats: registered — Kotonoha's leaf home to a letter at the post shelter (`ko_ret_sb`), the lamp rota and
 *   Akari's letter once the story is over (`ed>=2&postgame`); new — winter post over the ridge road once the
 *   Keepers' Road is lit (`kr_done`: a notice at the post shelter, Sōsuke not keeping anyone waiting), and Akari's
 *   letter at Hoshino's window (`lf_akari_letter`: the address stayed on the paper).
 * W5 the Snowbell Road (sb.road): Gohei the charcoal carrier at the avalanche slope the first time you come (the
 *   sign read: one at a time, without stopping), then now and then a stray goat with Tetsuji's tag, a traveller at
 *   the iced-up waymarker, or the shrine's shared snowshoes.
 * W6 return keys: the nameless stone lantern by the road shrine (lit the keepers' way, by its name: `kr_done`), the
 *   old postmaster's box of letters for which every means was tried (あらゆる), and the observatory dome's floor of
 *   star tiles (全体). */
var RB = (globalThis.RB = globalThis.RB || {});
(function (L, C) {
  'use strict';
  const T = L.T; // (en, jp)
  const TJ = (jp, en) => ({ jp, en }); // challenge titles, written Japanese first
  const ch = (o) => Object.assign({ kind: 'choose' }, o);
  const o = (jp, ok, why) => Object.assign({ jp, ok: !!ok }, why ? { why: { en: why } } : {});

  RB.lex.add(RB.lex.parseTable(`
ゴヘイ||name|F|Gohei (a name; a charcoal carrier on the Snowbell road)
炭|すみ|n|E|charcoal
斜面|しゃめん|n|I|a slope
緩む|ゆるむ|v5m|I|to loosen, to slacken (of snow: to soften in the sun)
十三|じゅうさん|n|E|thirteen
鼓|つづみ|n|A|a tsuzumi, a Japanese hand drum
居眠り|いねむり|n|I|dozing off (sitting up)
`));

  // ---- the town ------------------------------------------------------------------------------------------------------
  L.town('snowbell', {
    maps: ['sb.hamlet', 'sb.inn', 'sb.inn_room', 'sb.post', 'sb.hoshino', 'sb.goatshed', 'sb.sachi', 'sb.fuki'],
    care: ['kr_done', 'lf_akari_letter', 'ch5_done', 'ko_ret_sb'],
    after: 'ch4_done',
  });

  // ---- W2: routines ---------------------------------------------------------------------------------------------------
  // Natsume's place at the inn holds on the evening of the lamp too (the others' evening places are their own): her
  // routine waits that evening out, and she is at the inn as the story has her
  L.routine('snowbell', 'natsume', { base: 'sb.inn:natsume@5,4', when: '!sb_evening', pin: 'quest.sb_goats&!quest.sb_goats=done', slots: [
    { map: 'sb.goatshed', x: 7, y: 5, dir: 'up', line: ['{子|こ}ヤギ の {番|ばん} 。 …… {寝|ね}て ない よ 。 {目|め} を {閉|と}じて {数|かぞ}えて いる だけ 。', 'Minding the kids. …I\'m not asleep. Just counting with my eyes shut.'] },
    { map: 'sb.hamlet', x: 12, y: 25, dir: 'right', line: ['{伯父|おじ} さん の {代|か}わり に 、 ヤギ を {数|かぞ}えて いる の 。 {十二|じゅうに} …… {十三|じゅうさん} ？ あれ 、 {最初|さいしょ} から 。', 'I\'m counting the goats for my uncle. Twelve… thirteen? Oh — from the top.'] },
  ] });
  const nb = C.maps['sb.inn'].npcs.find((n) => n.id === 'natsume' && n.x === 5 && n.y === 4);
  if (nb) nb.if += '|sb_evening';
  L.routine('snowbell', 'kanta', { base: 'sb.hamlet:kanta', pin: 'quest.sb_snow&!quest.sb_snow=done', slots: [
    { map: 'sb.hamlet', x: 40, y: 5, dir: 'left', line: ['ここ から {天文台|てんもんだい} の {灯|あか}り が いちばん よく {見|み}える ん だ 。 ホシノ じいちゃん の {望遠鏡|ぼうえんきょう} 、 ちょっと だけ {借|か}りて いる 。', 'You can see the observatory lamp best from here. I\'m borrowing Grandpa Hoshino\'s telescope. Just a bit.'] },
    { map: 'sb.hamlet', x: 41, y: 25, dir: 'left', line: ['デンジ じいちゃん と 、 {魚|さかな} を {待|ま}って いる ん だ 。 {一匹|いっぴき} も {来|こ}ない けど 、 じいちゃん は 「それ で いい 」 って 。', 'I\'m waiting for fish with Grandpa Denji. Not one has come, but he says that\'s fine.'] },
  ] });
  L.routine('snowbell', 'sachi', { base: 'sb.hamlet:sachi', pin: 'quest.sb_snow&!quest.sb_snow=done', slots: [
    { map: 'sb.sachi', x: 1, y: 3, dir: 'up', line: ['{雪|ゆき} が ある うち に 、 {春|はる} の {着物|きもの} を {織|お}って おく の 。 {冬|ふゆ} の {仕事|しごと} よ 。', 'While the snow\'s down I weave the spring clothes. Winter work.'] },
    { map: 'sb.post', x: 6, y: 4, dir: 'up', line: ['{手紙|てがみ} を {出|だ}し に {来|き}た の 。 {夫|おっと} に 、 カンタ の こと を {書|か}いた わ 。 {長|なが}く なって しまった 。', 'I came to post a letter. I wrote my husband all about Kanta. It got rather long.'] },
  ] });

  // ---- W3: who can be asked after whom ------------------------------------------------------------------------------
  L.asks('yae', ['sb.inn']);
  L.knows('yae', { natsume: 'routine', kanta: 'routine', sachi: 'routine', tetsuji: 'routine', hoshino: 'routine', fuki: 'routine', denji: 'routine', sousuke: 'routine', chiyo: 'routine', rokuta: 'routine', hayate: 'loose', lq_chigusa: 'loose' });
  L.asks('sousuke', ['sb.post']);
  L.knows('sousuke', { hoshino: 'routine', sachi: 'routine', yae: 'routine', fuki: 'routine', kanta: 'loose', natsume: 'loose', tetsuji: 'loose', denji: 'loose', chiyo: 'loose', rokuta: 'loose', hayate: 'loose' });
  L.asks('tetsuji', ['sb.hamlet']);
  L.cold('tetsuji', ['{今|いま} {数|かぞ}えて いる ん だ 。 {話|はな}しかける な 。 …… ほら 、 {分|わ}からなく なった 。', 'I\'m counting. Don\'t talk to me. …There, now I\'ve lost count.']);
  L.usual('natsume', ['ナツメ ちゃん は {宿|やど} か 、 ヤギ{小屋|ごや} で {居眠|いねむ}り か 、 ヤギ の {囲|かこ}い です ね 。', 'Natsume? The inn, or dozing in the goat shed, or out at the goat pen.']);
  L.usual('kanta', ['カンタ は {雪像|せつぞう} の そば か 、 {望遠鏡|ぼうえんきょう} の ところ か 、 デンジ さん の {隣|となり} です よ 。', 'Kanta? By the snow sculptures, or at the telescope, or sitting next to Denji.']);
  L.usual('sachi', ['サチ さん は {洗濯物|せんたくもの} の ところ か 、 {家|いえ} で {機|はた} を {織|お}って いる か 、 {郵便|ゆうびん}{小屋|ごや} です ね 。', 'Sachi? At her washing, or weaving at home, or at the post shelter.']);
  L.usual('tetsuji', ['テツジ さん なら 、 ヤギ の そば です 。 {数|かず} を {数|かぞ}えて います よ 。 いつも 。', 'Tetsuji? With the goats, counting them. Always.']);
  L.usual('hoshino', ['ホシノ さん は 、 {北|きた} の {坂|さか} の {下|した} の {家|いえ} です よ 。 {夜|よる} は {天文台|てんもんだい} です 。', 'Hoshino? His house at the foot of the north slope. At night, the observatory.']);
  L.usual('fuki', ['フキ さん は {鐘|かね} の {柱|はしら} の そば に います 。', 'Fuki\'s by the bell-post.']);
  L.usual('denji', ['デンジ さん は {川|かわ} の {氷|こおり} の {穴|あな} の {前|まえ} です 。 {一日中|いちにちじゅう} です 。', 'Denji\'s at his hole in the river ice. All day.']);
  L.usual('sousuke', ['ソウスケ さん は {郵便|ゆうびん}{小屋|ごや} です 。 {待|ま}つ の が {仕事|しごと} です から 。', 'Sōsuke\'s at the post shelter. Waiting is his job.']);
  L.usual('yae', ['ヤエ さん は {宿|やど} の {帳場|ちょうば} に います よ 。', 'Yae\'s at the inn\'s counter.']);
  L.usual('chiyo', ['チヨ ちゃん は {雪像|せつぞう} の そば で {遊|あそ}んで います 。', 'Chiyo\'s playing by the snow sculptures.']);
  L.usual('rokuta', ['ロクタ は {井戸|いど} の そば です 。 まだ {雪像|せつぞう} の {尻尾|しっぽ} の {話|はなし} を して います よ 。', 'Rokuta\'s by the well, still going on about his sculpture\'s tail.']);

  // ---- W1: change beats ---------------------------------------------------------------------------------------------
  // already in the journey: Kotonoha's leaf goes home to a letter at the post shelter (zz_ko_mainland.js); once the
  // story is over, the lamp-keeping rota on the board and Akari's letter at Sōsuke's (returns/30_towns.js)
  L.beat('snowbell', { id: 'leaf', when: 'ko_ret_sb', en: 'A leaf home to a letter at the post shelter', jp: '{郵便|ゆうびん}{小屋|ごや} の {手紙|てがみ}' });
  L.beat('snowbell', { id: 'rota', when: 'ed>=2&postgame', en: 'The lamp rota on the board, and a letter from Lanternfall', jp: '{灯|ひ} の {番|ばん} の {当番表|とうばんひょう}' });
  // new: the Keepers' Road lit means letters can go over the ridge in winter
  L.beat('snowbell', { id: 'ridgepost', when: 'kr_done', en: 'Winter post over the ridge road', jp: '{尾根|おね} の {道|みち} の {郵便|ゆうびん}' });
  C.maps['sb.post'].props.push({ p: 'fw_postnote', x: 8, y: 3, if: 'beat.snowbell.ridgepost', scene: 'kr.lw_sb_ridgepost' });
  L.talk('sb.post:sousuke', [{ if: 'beat.snowbell.ridgepost&!seen.kr.lw_sb_ridgepost_sousuke', scene: 'kr.lw_sb_ridgepost_sousuke' }]);
  // new: the letter Akari addressed in Lanternfall, pinned by Hoshino's window
  L.beat('snowbell', { id: 'akari', when: 'lf_akari_letter', en: 'A letter from Lanternfall at Hoshino\'s window', jp: '{灯落|ひおち} から の {手紙|てがみ}' });
  C.maps['sb.hoshino'].props.push({ p: 'fw_postnote', x: 8, y: 2, if: 'beat.snowbell.akari', scene: 'lf.lw_sb_akari_letter' });
  L.talk('sb.hoshino:hoshino', [{ if: 'beat.snowbell.akari&!post&!seen.lf.lw_sb_akari_hoshino', scene: 'lf.lw_sb_akari_hoshino' }]);

  // ---- W5: the Snowbell Road ----------------------------------------------------------------------------------------
  // Gohei: carries charcoal up from the valley to Snowbell all winter
  C.chars.lw_gohei = { name: T('Gohei', 'ゴヘイ'), voice: { pitch: 0.8 },
    look: { skin: 4, hair: 'short', hairColor: 0, cloth: ['#4a4a46', '#363634', '#a89070'], shape: 'coat', acc: ['hat', 'scarf'], hatCol: '#6a5a4a', scarfCol: '#8a6a4a' },
    portrait: { eyes: 'narrow', style: 'short', acc: ['hat', 'scarf'], hatCol: '#6a5a4a', scarfCol: '#8a6a4a', bg: '#2a2a2e' } };
  C.maps['sb.road'].npcs.push({ id: 'lw_gohei', x: 16, y: 8, dir: 'up', if: '!lw_sb_slope_done', talk: 'sb.lw_road_slope' });
  C.maps['sb.road'].props.push({ p: 'crate', x: 15, y: 8, if: '!lw_sb_slope_done' });
  L.road('sb_road', { maps: ['sb.road'],
    unique: { id: 'slope', scene: 'sb.lw_road_slope' },
    variants: [{ id: 'goat', scene: 'sb.lw_road_goat' }, { id: 'sign', scene: 'sb.lw_road_sign' }, { id: 'snowshoes', scene: 'sb.lw_road_snowshoes' }],
    stamp: { title: ['{雪鈴|ゆきすず} の {坂道|さかみち}', 'the Snowbell Road'], motif: 'path', ink: '#4a6a8a' } });
  C.notes.lw_sb_avalanche = { title: T('Crossing an avalanche slope', '{雪崩|なだれ} の {斜面|しゃめん}'), fiction: false,
    jp: '{雪崩|なだれ} の {起|お}き そう な {斜面|しゃめん} は 、 {一人|ひとり} ずつ 、 {止|と}まらず に {渡|わた}る 。 {昼|ひる} に なる と {雪|ゆき} が {緩|ゆる}む ので 、 {朝|あさ} の うち に {渡|わた}る 。',
    en: 'A slope where an avalanche may come down is crossed one at a time, without stopping. The snow loosens once midday comes, so it is crossed in the morning. (Real mountain practice; the sign on the Snowbell road is the game\'s.)' };

  C.challenges['sb.lw_slope'] = { title: TJ('{雪崩|なだれ} の {立|た}て{札|ふだ}', 'The avalanche sign'), tiers: {
    F: [ch({ item: 'v:一人', ctx: { jp: 'たてふだ ： 「なだれ に ちゅうい 。 ひとり ずつ わたる こと 。」', en: '' }, prompt: { en: 'How do you cross?' }, options: [o('ひとり ずつ', 1), o('ふたり いっしょ に', 0, 'ひとり ずつ: one at a time.')] })],
    E: [ch({ item: 'g:v_naide_kudasai', ctx: { jp: '{立|た}て{札|ふだ} ： 「{雪崩|なだれ} に {注意|ちゅうい} 。 {一人|ひとり} ずつ 、 {止|と}まらないで {渡|わた}って ください 。」', en: '' }, prompt: { en: 'What does the sign ask?' }, options: [o('{一人|ひとり} ずつ 、 {止|と}まらないで {渡|わた}る', 1), o('{途中|とちゅう} で {休|やす}み ながら {渡|わた}る', 0, '{止|と}まらないで: don\'t stop.'), o('{二人|ふたり} で {手|て} を つないで {渡|わた}る', 0, '{一人|ひとり} ずつ: one at a time.')] })],
    I: [ch({ item: 'g:v_nagara', ctx: { jp: '{立|た}て{札|ふだ} の {下|した} ： 「{斜面|しゃめん} を {見上|みあ}げ ながら 、 {急|いそ}いで {渡|わた}る こと 。」', en: '' }, prompt: { en: 'What do you do as you cross?' }, options: [o('{斜面|しゃめん} を {見上|みあ}げる', 1), o('{足元|あしもと} だけ を {見|み}る', 0, '〜ながら: while looking up at the slope.'), o('{目|め} を {閉|と}じる', 0, 'You watch the slope as you go.')] })],
    A: [ch({ item: 'g:uchi_ni', ctx: { jp: '{立|た}て{札|ふだ} の {一番|いちばん} {下|した} ： 「{日|ひ} が {高|たか}く ならない うち に {渡|わた}る こと 。 {昼|ひる} の {雪|ゆき} は {緩|ゆる}む 。」', en: '' }, prompt: { en: 'When is it safest to cross, and why?' }, options: [o('{朝|あさ} の うち 。 {昼|ひる} に なる と {雪|ゆき} が {緩|ゆる}む から', 1), o('{昼|ひる} 。 {雪|ゆき} が {柔|やわ}らかい から', 0, '{緩|ゆる}む: the snow loosens at midday. That is the danger.'), o('{夜|よる} 。 {暗|くら}い から', 0, '〜ないうちに: before the sun is high.')] })],
  } };
  C.challenges['sb.lw_goat'] = { title: TJ('{迷|まよ}い ヤギ', 'A stray goat'), tiers: {
    F: [ch({ item: 'v:札', ctx: { jp: 'ふだ ： 「この ヤギ を みつけたら 、 ゆきすず の テツジ まで 。」', en: '' }, prompt: { en: 'Who should the goat go back to?' }, options: [o('テツジ', 1), o('ゆきすず の やど', 0, 'テツジ まで: to Tetsuji.')] })],
    E: [ch({ item: 'g:v_te_kudasai', ctx: { jp: '{札|ふだ} ： 「この ヤギ を {見|み}つけたら 、 {雪鈴|ゆきすず} の テツジ まで {連|つ}れて きて ください 。」', en: '' }, prompt: { en: 'What does the tag ask?' }, options: [o('テツジ の ところ へ {連|つ}れて {行|い}く', 1), o('{雪鈴|ゆきすず} の {宿|やど} に {預|あず}ける', 0, 'テツジ まで: to Tetsuji himself.'), o('そのまま に して おく', 0, 'The tag asks you to bring it back.')] })],
    I: [ch({ item: 'g:cond_to', ctx: { jp: '{札|ふだ} の {裏|うら} ： 「{逃|に}げたら 、 {干|ほ}し{草|くさ} を {見|み}せる と 、 {戻|もど}って くる 。」', en: '' }, prompt: { en: 'If it runs off, how do you get it back?' }, options: [o('{干|ほ}し{草|くさ} を {見|み}せる', 1), o('{大|おお}きな {声|こえ} で {呼|よ}ぶ', 0, '{見|み}せる と 、 {戻|もど}って くる: show it hay and back it comes.'), o('{走|はし}って {追|お}いかける', 0, 'The tag says hay works.')] })],
    A: [ch({ item: 'g:cond_ba', ctx: { jp: 'テツジ の {字|じ} ： 「{連|つ}れて きた {者|もの} に は 、 {礼|れい} を する 。 ただし 、 ヤギ が {札|ふだ} を {食|く}って いなければ 、 の {話|はなし} だ 。」', en: '' }, prompt: { en: 'When will Tetsuji thank you?' }, options: [o('ヤギ が {札|ふだ} を {食|た}べて いなければ', 1), o('いつ でも', 0, 'ただし: there is a condition.'), o('ヤギ が {札|ふだ} を {食|た}べたら', 0, '〜て いなければ: only if it has NOT eaten the tag.')] })],
  } };
  C.challenges['sb.lw_sign'] = { title: TJ('{凍|こお}った {道標|みちしるべ}', 'The iced-up waymarker'), tiers: {
    F: [ch({ item: 'v:左', ctx: { jp: 'みちしるべ ： 「↑ ゆきすず 」 「← はいみ の さと 」 （みぎ の うで は ゆき の した）', en: '' }, prompt: { en: 'A traveller wants Cinder Orchard. Which way?' }, options: [o('ひだり', 1), o('うえ', 0, '↑ is ゆきすず.')] })],
    E: [ch({ item: 'v:腕', ctx: { jp: '{道標|みちしるべ} ： 「↑ {雪鈴|ゆきすず} 」 「→ {灯落|ひおち} 」 「← {灰実|はいみ} の {里|さと} 」 。 {旅人|たびびと} ： 「{灰実|はいみ} の {里|さと} へ {行|い}きたい ん です が 。」', en: '' }, prompt: { en: 'Which arm do you show the traveller?' }, options: [o('{左|ひだり} の {腕|うで}', 1), o('{右|みぎ} の {腕|うで}', 0, '→ is {灯落|ひおち}.'), o('{上|うえ} の {腕|うで}', 0, '↑ is {雪鈴|ゆきすず}.')] })],
    I: [ch({ item: 'g:sou_hear', ctx: { jp: '{旅人|たびびと} ： 「{灰実|はいみ} の {里|さと} は 、 {柿|かき} が {有名|ゆうめい} だ そう です ね 。」', en: '' }, prompt: { en: 'What has the traveller heard?' }, options: [o('{灰実|はいみ} の {里|さと} は {柿|かき} が {有名|ゆうめい} だ', 1), o('{灰実|はいみ} の {里|さと} に は {柿|かき} が ない', 0, 'そう です here: I hear that it is famous for them.'), o('{柿|かき} を {売|う}り に {行|い}く', 0, 'They are only passing on what they heard.')] })],
    A: [ch({ item: 'g:omission', ctx: { jp: '{旅人|たびびと} ： 「{左|ひだり} 、 です か 。 …… {下|くだ}り{坂|ざか} 、 {長|なが}い です か 。」 あなた ： 「{半日|はんにち} くらい です 。」', en: '' }, prompt: { en: 'What did the traveller ask, leaving words out?' }, options: [o('{下|くだ}り{坂|ざか} は {長|なが}い か', 1), o('{左|ひだり} に {何|なに} が ある か', 0, '{左|ひだり} 、 です か only checks the way.'), o('{半日|はんにち} で {着|つ}く か', 0, '{半日|はんにち} was your answer.')] })],
  } };
  C.challenges['sb.lw_snowshoes'] = { title: TJ('{祠|ほこら} の かんじき', 'The shrine\'s snowshoes'), tiers: {
    F: [ch({ item: 'v:使う', ctx: { jp: 'ほこら の ふだ ： 「かんじき 、 どうぞ つかって ください 。 かえり に もどして ください 。」', en: '' }, prompt: { en: 'May the traveller borrow the snowshoes?' }, options: [o('はい 。 でも 、 かえり に もどす', 1), o('いいえ', 0, 'どうぞ つかって ください: please use them.')] })],
    E: [ch({ item: 'g:igai', ctx: { jp: '{祠|ほこら} の {札|ふだ} ： 「かんじき は 、 どなた でも お{使|つか}い ください 。 ただし 、 {帰|かえ}り に {必|かなら}ず {戻|もど}す こと 。」', en: '' }, prompt: { en: 'What is the one condition?' }, options: [o('{帰|かえ}り に {必|かなら}ず {戻|もど}す', 1), o('{雪鈴|ゆきすず} の {人|ひと} だけ が {使|つか}える', 0, 'どなた でも: anyone.'), o('{使|つか}う {前|まえ} に {名前|なまえ} を {書|か}く', 0, 'ただし names only one condition: bring them back.')] })],
    I: [ch({ item: 'g:v_temo_ii', ctx: { jp: '{旅人|たびびと} ： 「{二足|にそく} {借|か}りて も いい です か 。 {子|こ}ども の {分|ぶん} も …… 。」 {札|ふだ} ： 「{一人|ひとり} {一足|いっそく} まで 。」', en: '' }, prompt: { en: 'Can the traveller take a pair for their child too?' }, options: [o('{一人|ひとり} {一足|いっそく} だ から 、 {子|こ}ども の {分|ぶん} も いい', 1), o('だめ 。 {一足|いっそく} だけ', 0, 'The child is a person too: one pair each.'), o('{三足|さんぞく} {借|か}りて いい', 0, '{一人|ひとり} {一足|いっそく} まで: one pair per person.')] })],
    A: [ch({ item: 'g:sasete_itadaku', ctx: { jp: '{旅人|たびびと} ： 「では 、 {使|つか}わせて いただきます 。 {必|かなら}ず お{返|かえ}し します 。」', en: '' }, prompt: { en: 'How does the traveller put it?' }, options: [o('{許|ゆる}し を もらって {使|つか}う 、 と {丁寧|ていねい} に {言|い}って いる', 1), o('{誰|だれ} か に {使|つか}わせる', 0, '〜させて いただく is humble: "with your leave, I will use them".'), o('もう {使|つか}わない', 0, 'They are about to use them, politely.')] })],
  } };

  // ---- W6: return keys ----------------------------------------------------------------------------------------------
  L.seal('sb_bell_light', { map: 'sb.road', x: 23, y: 6, p: 'kr_toro', needs: 'kr_done', opens: 'lw_sb_bell_light', scene: 'kr.lw_sb_bell_light_open',
    hint: ['{祠|ほこら} の {横|よこ} に 、 {苔|こけ} むした {小|ちい}さな {灯籠|とうろう} 。 {名札|なふだ} は {苔|こけ} の {下|した} だ 。 {雪鈴|ゆきすず} の {人|ひと} も 、 {灯|ひ} が {入|はい}った の を {見|み}た こと が ない と いう 。', 'Beside the shrine, a small moss-grown stone lantern, its name plate lost under the moss. Nobody in Snowbell has ever seen it lit.'],
    openedLabel: ['{鈴|すず} の {灯|ひ}', 'The Bell Light'], after: { p: 'kr_toro', o: { lit: true }, scene: 'kr.lw_sb_bell_light_after' } });
  L.seal('sb_dead_letters', { map: 'sb.post', x: 2, y: 4, p: 'chest', needs: 'mod_arayuru', opens: 'lw_sb_dead_letters', scene: 'ko.lw_sb_dead_letters_open',
    hint: ['{棚|たな} の {下|した} に 、 {古|ふる}い {箱|はこ} 。 {蓋|ふた} の {札|ふだ} に 「あらゆる {手|て} を {尽|つ}くした {手紙|てがみ} 」 。 {最初|さいしょ} の {言葉|ことば} が 、 まだ {分|わ}からない 。', 'Under the shelves, an old box. On the lid: "Letters for which あらゆる means were tried." That first word means nothing to you yet.'],
    openedLabel: ['{先代|せんだい} の {郵便|ゆうびん}{屋|や} の {箱|はこ}', 'The old postmaster\'s box'], after: { p: 'chest', scene: 'ko.lw_sb_dead_letters_after' } });
  L.seal('sb_dome_floor', { map: 'sb.obs_dome', x: 9, y: 6, p: 'sb_starchart', needs: 'mod_zentai', opens: 'lw_sb_dome_floor', scene: 'yn.lw_sb_dome_floor_open',
    hint: ['{床|ゆか} に 、 {星|ほし} を {描|か}いた {小|ちい}さな {石|いし} の {板|いた} が {敷|し}き{詰|つ}めて ある 。 {一枚|いちまい} ずつ {見|み}て も 、 {点|てん} が {一|ひと}つ か {二|ふた}つ 。 {何|なん} の {絵|え} か {分|わ}からない 。', 'The floor is laid with small stone tiles, each with a star or two on it. Tile by tile, it makes no picture at all.'],
    openedLabel: ['{星|ほし} の {床|ゆか}', 'The star floor'], after: { p: 'sb_starchart', scene: 'yn.lw_sb_dome_floor_after' } });
  C.notes.lw_sb_bell_light = { title: T('The Bell Light', '{鈴|すず} の {灯|ひ}'), fiction: true,
    jp: '{雪鈴|ゆきすず} の {坂道|さかみち} の {祠|ほこら} の {横|よこ} の {小|ちい}さな {灯籠|とうろう} 。 {灯守|ひもり} の やり{方|かた} で 、 {名前|なまえ} を {呼|よ}んで {灯|とも}す 。 {雪|ゆき} の {日|ひ} 、 {耳|みみ} に は {鐘|かね} 、 {目|め} に は この {灯|ひ} 。',
    en: 'A small stone lantern by the shrine on the Snowbell road, lit the keepers\' way: by calling its name. On a snowy day the bell is for the ear; this light is for the eye.' };
  C.notes.lw_sb_dead_letters = { title: T('The old postmaster\'s box', '{先代|せんだい} の {箱|はこ}'), fiction: true,
    jp: '{届|とど}けよう と して 、 あらゆる {手|て} を {尽|つ}くして も {届|とど}かなかった {手紙|てがみ} 。 {雪鈴|ゆきすず} の {先代|せんだい} の {郵便|ゆうびん}{屋|や} は 、 それ を {捨|す}てず に {箱|はこ} に {取|と}って おいた 。',
    en: 'Letters that could not be delivered though every means was tried. Snowbell\'s old postmaster never threw them away, but kept them in a box.' };
  C.notes.lw_sb_dome_floor = { title: T('The star floor', '{星|ほし} の {床|ゆか}'), fiction: true,
    jp: '{天文台|てんもんだい} の {丸屋根|まるやね} の {床|ゆか} は 、 {全体|ぜんたい} で {一|ひと}つ の {星図|せいず} に なって いる 。 {鼓星|つづみぼし} の {形|かたち} 。 {真|ま}ん{中|なか} の {三|みっ}つ の {星|ほし} の {下|した} に 、 {建|た}てた {二人|ふたり} の {名前|なまえ} 。',
    en: 'The floor of the observatory dome is a single star map: seen whole, its tiles make 鼓星 (tsuzumiboshi, the hand-drum stars), an old Japanese name for Orion. Under the three stars of the belt, the two who built it cut their names. (The name is real; the floor is the game\'s.)' };

  L.scenes(`
@scene kr.lw_sb_ridgepost
narr: {新|あたら}しい {貼|は}り{紙|がみ} 。 「{冬|ふゆ} の {手紙|てがみ} も 、 {尾根|おね} の {道|みち} を {通|とお}って {出|だ}せます 。 {灯守|ひもり} の {道|みち} 、 {月|つき} に {一度|いちど} 。 ソウスケ 」 || A new notice: "Winter letters can now go out over the ridge road. The Keepers' Road, once a month. —Sōsuke"

@scene kr.lw_sb_ridgepost_sousuke
sousuke: {灯守|ひもり} の {道|みち} に {灯|あか}り が {戻|もど}った ので 、 {冬|ふゆ} でも {尾根|おね} を {越|こ}えて {手紙|てがみ} が {出|だ}せる よう に なりました 。 || With the lamps back on the Keepers' Road, letters can go over the ridge even in winter.
sousuke[smile]: {待|ま}つ の が {得意|とくい} な {郵便|ゆうびん}{屋|や} です が …… {待|ま}たせない の も 、 {悪|わる}く ない です ね 。 || I'm a postmaster who's good at waiting… but not keeping people waiting isn't bad either.

@scene lf.lw_sb_akari_letter
narr: {窓|まど} の そば に 、 {封筒|ふうとう} が {一枚|いちまい} {留|と}めて ある 。 「{雪鈴|ゆきすず} {天文台|てんもんだい} 、 ホシノ {様|さま} 」 。 {丁寧|ていねい} な {字|じ} だ 。 || By the window, an envelope pinned up: "Snowbell Observatory, Mr Hoshino." A careful hand.

@scene lf.lw_sb_akari_hoshino
hoshino[smile]: {灯落|ひおち} から {手紙|てがみ} が {届|とど}いた よ 。 {宛名|あてな} も 、 ちゃんと {紙|かみ} に {残|のこ}って いた 。 || A letter came from Lanternfall. The address stayed on the paper, too.
hoshino: {娘|むすめ} の {字|じ} だ 。 {昔|むかし} より ずっと {上手|じょうず} に なった 。 …… {星|ほし} の {名前|なまえ} は 、 {間違|まちが}い だらけ だった のに ね 。 || My daughter's hand. Far better than it was. …She used to get every star name wrong.
hoshino: {何|なに} が {書|か}いて あった か は 、 {内緒|ないしょ} だ よ 。 || What it says is a secret.

@scene sb.lw_road_slope
# Road event (W5): the Snowbell Road's own, the first time you walk it. A charcoal carrier waits below a slope heavy
# with snow; the sign on how to cross is half buried.
!look lw_gohei pc
lw_gohei: あ 、 {待|ま}って くれ ！ その {先|さき} は 、 {雪崩|なだれ} が {怖|こわ}い ん だ 。 || Ah, wait! Past there, it's avalanches you have to fear.
lw_gohei: {立|た}て{札|ふだ} に {渡|わた}り{方|かた} が {書|か}いて ある ん だ が 、 {雪|ゆき} で {半分|はんぶん} {隠|かく}れて いて な 。 {一緒|いっしょ} に {読|よ}んで くれない か 。 || The sign says how to cross, but it's half buried in snow. Will you read it with me?
!challenge sb.lw_slope
!if var._res=0 -> later
narr: {一人|ひとり} ずつ 、 {斜面|しゃめん} を {見上|みあ}げ ながら 、 {止|と}まらず に {渡|わた}る 。 {斜面|しゃめん} の {雪|ゆき} は 、 {静|しず}か な まま だった 。 || One at a time, eyes on the slope, without stopping. The snow above stays where it is.
lw_gohei[laugh]: ふう 。 …… {雪崩|なだれ} の {坂|さか} は 、 {一人|ひとり} ずつ 、 {止|と}まらず に 。 {山|やま} の {決|き}まり だ 。 {炭|すみ} を {運|はこ}んで {三十年|さんじゅうねん} 、 {一度|いちど} も {破|やぶ}った こと は ない 。 || Phew. …On an avalanche slope, one at a time and keep going. Mountain rules. Thirty years carrying charcoal and I've never broken them.
?(comp=mio) comp[smile]: {手|て} 、 {冷|つめ}たく なって いません か ？ {上|うえ} に {着|つ}いたら 、 {温|あたた}まりましょう 。 || Your hands aren't frozen? Let's warm up once we're at the top.
?(comp=ren) comp: {記録|きろく} の {決|き}まり より 、 {山|やま} の {決|き}まり の {方|ほう} が {短|みじか}くて {正確|せいかく} です 。 || Mountain rules are shorter than the records' rules, and more exact.
!note lw_sb_avalanche
!set lw_sb_slope_done
!hook road_done sb_road slope
!refresh
!end
:later
lw_gohei: …… {今日|きょう} は {無理|むり} を しない で おこう 。 {雪|ゆき} が {落|お}ち{着|つ}いたら 、 また {頼|たの}む 。 || …Let's not push it today. When the snow has settled, I'll ask you again.

@scene sb.lw_road_goat
narr: {道|みち} の {真|ま}ん{中|なか} で 、 ヤギ が {一頭|いっとう} 、 {雪|ゆき} の {下|した} の {草|くさ} を {掘|ほ}って いる 。 {首|くび} に {木|き} の {札|ふだ} 。 || In the middle of the road, a goat is digging for grass under the snow. A wooden tag hangs from its neck.
!challenge sb.lw_goat
!if var._res=0 -> later
narr: {道端|みちばた} の {枯|か}れ{草|くさ} を {見|み}せる と 、 ヤギ は おとなしく {付|つ}いて きた 。 {坂|さか} の {上|うえ} から 、 テツジ の {怒鳴|どな}り{声|ごえ} が {聞|き}こえる 。 {礼|れい} の {代|か}わり らしい 。 || Show it some dry grass from the roadside and the goat follows meekly. From the top of the slope comes Tetsuji's bellow: his way of saying thank you, apparently.
!hook road_done sb_road goat
!end
:later
narr: ヤギ は {一声|ひとこえ} {鳴|な}いて 、 {勝手|かって} に {坂|さか} を {上|のぼ}って いった 。 || The goat bleats once and wanders off up the slope by itself.

@scene sb.lw_road_sign
narr: {道標|みちしるべ} の {腕|うで} が 、 {氷|こおり} で {白|しろ}く なって いる 。 {雪鈴|ゆきすず} から {下|お}りて きた {旅人|たびびと} が 、 その {前|まえ} で {困|こま}って いる 。 || The waymarker's arms are white with ice. A traveller come down from Snowbell stands before it, at a loss.
!challenge sb.lw_sign
!if var._res=0 -> later
narr: {腕|うで} の {氷|こおり} を {払|はら}って 、 {灰実|はいみ} を {指|さ}す {方|ほう} を {見|み}せた 。 {旅人|たびびと} は {礼|れい} を {言|い}って 、 {坂|さか} を {下|くだ}って いった 。 || You knock the ice off the arms and show the one for Cinder Orchard. The traveller thanks you and heads off down the slope.
!hook road_done sb_road sign
!end
:later
narr: {旅人|たびびと} は {首|くび} を かしげ ながら 、 {来|き}た {道|みち} を {戻|もど}って いった 。 || The traveller goes back the way they came, still puzzling.

@scene sb.lw_road_snowshoes
narr: {祠|ほこら} の {前|まえ} に 、 かんじき が {何足|なんぞく} か {並|なら}べて ある 。 {子|こ}ども を {連|つ}れた {旅人|たびびと} が 、 {札|ふだ} を {見|み}て {迷|まよ}って いる 。 || Before the shrine, several pairs of snowshoes are set out. A traveller with a child is reading the board, unsure.
!challenge sb.lw_snowshoes
!if var._res=0 -> later
narr: {旅人|たびびと} は かんじき を {履|は}いて 、 {子|こ}ども と {坂|さか} を {上|のぼ}って いった 。 {大|おお}きい {足跡|あしあと} と {小|ちい}さい {足跡|あしあと} が 、 {並|なら}んで {続|つづ}いて いる 。 || The traveller ties on the snowshoes and climbs the slope with the child. Big tracks and small ones run side by side.
!hook road_done sb_road snowshoes
!end
:later
narr: {旅人|たびびと} は かんじき に {手|て} を {伸|の}ばし かけて 、 やめた 。 || The traveller reaches for the snowshoes, then thinks better of it.

@scene kr.lw_sb_bell_light_open
narr: {灯守|ひもり} の {道|みち} で {覚|おぼ}えた 。 {灯籠|とうろう} は 、 {名前|なまえ} で {灯|とも}す 。 || You learned it on the Keepers' Road: a lantern is lit by its name.
narr: {苔|こけ} を そっと {払|はら}う と 、 {名札|なふだ} に {字|じ} が {出|で}て きた 。 「{鈴|すず} の {灯|ひ} 」 。 || You brush the moss gently away, and letters come up on the plate: "the Bell Light".
narr: {名|な} を {呼|よ}ぶ と 、 {小|ちい}さな {灯|ひ} が {入|はい}った 。 {雪|ゆき} の {坂|さか} が 、 {少|すこ}し {明|あか}るく なる 。 || You call it by its name, and a small flame comes up. The snowy slope grows a little brighter.
?(comp=ren) comp: {鐘|かね} は {耳|みみ} に 、 {灯|ひ} は {目|め} に 。 {雪|ゆき} の {日|ひ} の {道|みち}しるべ が 、 {二|ふた}つ に なりました 。 || The bell for the ear, the lamp for the eye. Two waymarks for a snowy day now.
!note lw_sb_bell_light

@scene kr.lw_sb_bell_light_after
narr: {鈴|すず} の {灯|ひ} が 、 {雪|ゆき} の {坂|さか} を {照|て}らして いる 。 || The Bell Light shines on the snowy slope.

@scene ko.lw_sb_dead_letters_open
narr: 「あらゆる {手|て} を {尽|つ}くした {手紙|てがみ} 」 。 {届|とど}ける ため に 、 できる こと は {全部|ぜんぶ} やった {手紙|てがみ} 、 と いう {意味|いみ} だ 。 || "Letters for which every means was tried": letters someone did everything possible to deliver.
sousuke: {先代|せんだい} の {郵便|ゆうびん}{屋|や} の {箱|はこ} です 。 {届|とど}かなかった {手紙|てがみ} を 、 {捨|す}てず に {取|と}って おいた ん です ね 。 || The old postmaster's box. Letters that never arrived, kept and never thrown away.
sousuke[smile]: …… {尾根|おね} の {道|みち} も {開|あ}いた 。 もう {一度|いちど} 、 あらゆる {手|て} を {尽|つ}くして みましょう か 。 || …And the ridge road is open now. Shall I try every means once more?
!note lw_sb_dead_letters

@scene ko.lw_sb_dead_letters_after
narr: {古|ふる}い {箱|はこ} の {札|ふだ} の {横|よこ} に 、 ソウスケ の {字|じ} で {一行|いちぎょう} 。 「まだ {諦|あきら}めない 」 。 || Beside the old label, a line in Sōsuke's hand: "Not giving up yet."

@scene yn.lw_sb_dome_floor_open
narr: {一枚|いちまい} ずつ で は なく 、 {床|ゆか} {全体|ぜんたい} を {見|み}る 。 || Not tile by tile: you take in the whole floor.
narr: {星|ほし} が {繋|つな}がって 、 {鼓|つづみ} の {形|かたち} に なった 。 {鼓星|つづみぼし} だ 。 {真|ま}ん{中|なか} の {三|みっ}つ の {星|ほし} の {下|した} に 、 {小|ちい}さく {彫|ほ}って ある 。 「ホシノ ・ デンジ 」 。 || The stars join up into the shape of a hand drum: the Drum Stars. Under the three stars in the middle, two names cut small: "Hoshino, Denji".
narr: {四十年|よんじゅうねん} {前|まえ} の {二人|ふたり} が 、 {床|ゆか} の {星|ほし} の {中|なか} に {名前|なまえ} を {隠|かく}した の だ 。 || Forty years ago, the two of them hid their names among the stars of the floor.
?(comp=nao) comp[smirk]: {石|いし} に {彫|ほ}る だけ じゃ {足|た}りなかった わけ か 。 {愚|おろ}か な {二人|ふたり} だ 。 || Carving it on the stone outside wasn't enough, then. A foolish pair.
!note lw_sb_dome_floor

@scene yn.lw_sb_dome_floor_after
narr: {床|ゆか} の {星|ほし} が 、 {鼓星|つづみぼし} の {形|かたち} に {見|み}える 。 {真|ま}ん{中|なか} に 、 {二人|ふたり} の {名前|なまえ} 。 || The floor's stars make the Drum Stars, and in the middle, two names.
`);
})(RB.living, RB.content);
