/* The Hall of a Hundred Tales, wing 3, The Bell Before Dawn: the scenes (expansion P15; plan 04_DUNGEONS.md D9; maps in
 * 12_w3_maps.js, tasks and encounters in 17_w3_learning.js). Each trial sets its floor's own flag and tells the Hall;
 * what a trial shows follows the level its task is set at (the profile, or one up on the Grow route); the pattern
 * (hall.w3.pat) chooses the chores' order, the slate's hours, the almanac's hour and the sightings. Jinbei (he/him) is
 * the old bell-ringer, Shino (she/her) his granddaughter, the priest and Mataji the watchman and Sukezō the fisherman
 * he/him, Mame (she/her) the mother tanuki and Kobu (they/them) her cub. Suzu's lines have Kansai versions
 * (src/content/dialect/kansai_99_hall.js). */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const K = C.hallKit, W = 'w3', L = K.lv(W), both = L.both;
  const TALE = C.hallW3Tale, FT = C.hallW3TaleF;
  const cap = (x) => x[0].toUpperCase() + x.slice(1);
  let out = `
@scene hall.w3.f1_first
!set hall_w3_f1_seen
narr: {紙|かみ} の {戸|と} を {抜|ぬ}ける と 、 {夜|よる} の {村|むら} だった 。 {家々|いえいえ} は {眠|ねむ}って いて 、 {山|やま} の {上|うえ} に {鐘楼|しょうろう} の {影|かげ} が {黒|くろ}く {見|み}える 。 || Through the paper screen: a village at night. The houses sleep, and on the ridge the bell tower stands black.
?(comp=nao) comp: {夜明|よあ}け {前|まえ} の {村|むら} か 。 {配達|はいたつ} の {朝|あさ} は 、 いつも この {時間|じかん} に {出|で}た な 。 || A village before dawn. On delivery mornings I always set out about now.
?(comp=mio) comp: {静|しず}か ね 。 {鶏|にわとり} も 、 まだ {寝|ね}て いる 。 || So quiet. Even the roosters are still asleep.
?(comp=ren) comp: {灯守|ひもり} の {朝|あさ} と {同|おな}じ です 。 {皆|みな} が {起|お}きる {前|まえ} に 、 {起|お}きる {人|ひと} が いる 。 || Like a lamp-keeper's morning. Before everyone wakes, someone has to wake first.
?(comp=suzu) comp: {第|だい}{三幕|さんまく} は 、 {夜|よる} の {舞台|ぶたい} ね 。 {幕|まく} が {上|あ}がる の は 、 {夜明|よあ}け {前|まえ} 。 || Act three: a night stage. The curtain goes up before dawn.
?(!comp) narr: {遠|とお}く で 、 {犬|いぬ} が {一度|いちど} だけ {吠|ほ}えた 。 || Far off, a dog barks once.

@scene hall.w3.f2_first
!set hall_w3_f2_seen
narr: {坂道|さかみち} に {霧|きり} が {出|で}て いる 。 {坂|さか} の {下|した} で 、 シノ が {灯|ひ} を {持|も}って {待|ま}って いた 。 || Mist lies on the slope. At its foot, Shino is waiting with a light.
hall_shino: {祖父|そふ} の {代|か}わり に 、 {今夜|こんや} は {私|わたし} が {鐘|かね} を {撞|つ}きます 。 でも 、 {一人|ひとり} で は {暗|くら}くて …… 。 || Tonight I ring the bell in my grandfather's place. But alone, in the dark…
?(comp) comp: {一緒|いっしょ} に {登|のぼ}ろう 。 {順番|じゅんばん} に 、 {一|ひと}つ ずつ 。 || We'll climb with you. In order, one thing at a time.

@scene hall.w3.f3_first
!set hall_w3_f3_seen
narr: {尾根|おね} の {上|うえ} 、 {大|おお}きな {鐘|かね} が {静|しず}か に {下|さ}がって いる 。 {杉|すぎ} の {方|ほう} から 、 ぽん 、 ぽん 、 と {太鼓|たいこ} の よう な {音|おと} が {聞|き}こえる 。 || On the ridge the great bell hangs silent. From the cedars comes a sound like a drum: pon, pon.
?(comp=nao) comp: {狸|たぬき} の {腹鼓|はらつづみ} 、 って やつ か ？ {昔話|むかしばなし} だけ だ と {思|おも}って た 。 || A tanuki drumming on its belly? I thought that only happened in old stories.
?(comp=mio) comp: {誰|だれ} か が 、 {夜|よる} を {止|と}めよう と して いる みたい …… 。 || It sounds as if someone is trying to stop the night…
?(comp=ren) comp: {鐘|かね} は 、 {時|とき} を {告|つ}げる もの です 。 {告|つ}げられたく ない {誰|だれ} か が 、 いる の でしょう 。 || A bell tells the hour. Someone here doesn't want it told.
?(comp=suzu) comp: お{囃子|はやし} が {入|はい}った わ 。 {大詰|おおづ}め ね 。 || The drums have come in. This is the final scene.

@scene hall.w3.bench1
!hook hall_station w3_b1

@scene hall.w3.bench2
!hook hall_station w3_b2

@scene hall.w3.bench3
!hook hall_station w3_b3

@scene hall.w3.spring
narr: {坂|さか} の {途中|とちゅう} の {古|ふる}い {井戸|いど} 。 {水|みず} は {冷|つめ}たくて 、 {澄|す}んで いる 。 || An old well halfway up the slope, its water cold and clear.
!hook hall_station w3_sp

@scene hall.w3.jinbei
!faceplayer hall_jinbei
!if hall.w3.t2 -> after
hall_jinbei: {今夜|こんや} は 、 シノ が {鐘|かね} を {撞|つ}く 。 {支度|したく} の {書|か}き{置|お}き は 、 {道|みち} の {札|ふだ} に {貼|は}って ある 。 || Tonight Shino rings the bell. The note of what to do first is pinned to the board by the path.
hall_jinbei: {熱|ねつ} の せい で 、 {書|か}く {順番|じゅんばん} が {乱|みだ}れた 。 {書|か}いた {順|じゅん} で は なく 、 {言|い}って いる {順|じゅん} に やって くれ 。 || The fever muddled the order I wrote it in. Do it in the order it says, not the order it's written.
!end
:after
hall_jinbei: ああ 、 {水|みず} の {音|おと} が した 。 {灯籠|とうろう} も {点|つ}いた 。 …… {順番|じゅんばん} {通|どお}り だ 。 ありがとう 。 || Ah, I heard the water. And the lantern's lit. …All in order. Thank you.

@scene hall.w3.shino2
!faceplayer hall_shino
!if hall.w3.t4 -> after
hall_shino: {祖父|そふ} の {石板|せきばん} に 、 {何|なに} を いつ する か が {書|か}いて あります 。 {香時計|こうどけい} を {燃|も}やす と 、 {夜|よる} が {進|すす}みます 。 || Grandfather's slate says what to do and when. Burn the incense clock and the night moves on.
hall_shino: {過|す}ぎて しまったら 、 {新|あたら}しい {線香|せんこう} で {夜|よる} を {始|はじ}め{直|なお}せます 。 {祖父|そふ} も 、 よく そう して いました 。 || If you go past an hour, a new stick starts the night again. Grandfather often did that too.
!end
:after
hall_shino: {祖父|そふ} の {石板|せきばん} の {通|とお}り に できた 。 {次|つぎ} は 、 {上|うえ} へ 。 || All done as the slate says. Up we go.

@scene hall.w3.shino3
!faceplayer hall_shino3
!if hall.w3.t10 -> after
hall_shino: {鐘|かね} は 、 {暦|こよみ} の {時刻|じこく} に {撞|つ}きます 。 でも 、 あの {太鼓|たいこ} が {鳴|な}って いる うち は …… 。 || The bell is rung at the almanac's hour. But while that drumming goes on…
?(!hall.w3.t9) hall_shino: {杉|すぎ} の {木|き} の {下|した} に 、 {誰|だれ} か いる みたい です 。 || There's someone under the cedars, I think.
?(hall.w3.t9&!hall.w3.t8) hall_shino: {子供|こども} を {探|さが}す なら 、 {見|み}た {人|ひと} に {聞|き}いて みましょう 。 {一番|いちばん} {最後|さいご} に {見|み}た の は 、 {誰|だれ} か 。 || If we're looking for a child, let's ask the people who saw them. Who saw them last.
!end
:after
hall_shino: {鳴|な}った 。 …… {私|わたし} の {鐘|かね} が 、 {鳴|な}った 。 || It rang. …My bell rang.
`;

  // ---- t1: the story room ----------------------------------------------------------------------------------------------
  const E_PANELS = [TALE.P1, TALE.P2, TALE.P3, TALE.P4];
  const PANEL_EN = ['Long ago, the mountain temple\'s bell rang every morning before dawn.', 'One night Jinbei, who rang the bell, fell ill.', 'His granddaughter Shino took a light and climbed the dark slope.', 'When the bell rang, the village woke.'];
  out += '\n@scene hall.w3.t1' + K.taskTrial({ w: W, k: 0, t: 't1',
    intro: ['narr: ジンベエ の {枕元|まくらもと} に 、 {絵巻|えまき} が {掛|か}けて ある 。 || A picture scroll hangs at Jinbei\'s bedside.']
      .concat(...[0, 1, 2, 3].map((i) => ['?(' + L.EF + ') narr: 「 ' + FT[i] + ' 。 」 || "' + PANEL_EN[i] + '"', '?(' + L.NOTF + ') narr: 「 ' + E_PANELS[i] + ' 。 」 || "' + PANEL_EN[i] + '"']),
      ['narr: ジンベエ が {寝返|ねがえ}り を {打|う}つ と 、 {絵巻|えまき} が {揺|ゆ}れて 、 {絵|え} の {順番|じゅんばん} が {乱|みだ}れた 。 || Jinbei turns over in his sleep; the scroll sways, and the pictures slip out of order.']),
    task: 'hall.w3.story',
    after: ['narr: {絵巻|えまき} が 、 {元|もと} の {順番|じゅんばん} に {戻|もど}った 。 || The scroll is back in its order.', '!challenge hall.w3.story_q',
      '?(comp=nao) comp: {毎朝|まいあさ} {同|おな}じ {時間|じかん} に 、 {同|おな}じ こと を する 。 {一番|いちばん} {難|むずか}しい {仕事|しごと} だ よ 。 || The same thing at the same time, every morning. That\'s the hardest job there is.',
      '?(comp=mio) comp: {病気|びょうき} の {人|ひと} の {代|か}わり に 、 {孫|まご} が {行|い}く の ね 。 …… {怖|こわ}くて も 、 {行|い}く の よ ね 。 || The grandchild goes in the sick one\'s place. …Scared or not, you go.',
      '?(comp=ren) comp: {鐘|かね} が {鳴|な}る と 、 {村|むら} が {起|お}きる 。 {灯|ひ} を {点|つ}ける と 、 {道|みち} が {見|み}える 。 {同|おな}じ です ね 。 || The bell rings and the village wakes; the lamp is lit and the road shows. The same thing.',
      '?(comp=suzu) comp: {代役|だいやく} の {初舞台|はつぶたい} ね 。 {一番|いちばん} {緊張|きんちょう} する やつ よ 。 || An understudy\'s first night. The most nerve-racking kind.'],
    later: 'narr: {絵|え} は 、 {後|あと} で {並|なら}べ{直|なお}せる 。 || You can put the pictures in order later.',
    done: 'narr: {絵巻|えまき} は 、 {元|もと} の {順番|じゅんばん} で {掛|か}かって いる 。 || The scroll hangs in its proper order.' });

  // ---- t2: Jinbei's note, done in the order it means ---------------------------------------------------------------------
  const ORDER = { 0: ['water', 'lamp', 'wood', 'priest'], 1: ['lamp', 'water', 'priest', 'wood'] };
  const NOTE = {
    0: { F: 'まず 、 みず を くむ 。 つぎ に 、 とうろう に ひ を いれる 。 それから 、 まき を はこぶ 。 さいご に 、 おしょうさん を おこす 。',
      E: '{和尚|おしょう}さん を {起|お}こす {前|まえ} に 、 {薪|まき} を {運|はこ}ぶ 。 {水|みず} を {汲|く}んで から 、 {灯籠|とうろう} に {火|ひ} を {入|い}れる 。 {灯籠|とうろう} に {火|ひ} を {入|い}れた {後|あと} で 、 {薪|まき} を {運|はこ}ぶ 。',
      I: '{和尚|おしょう}さん を {起|お}こす の は 、 {薪|まき} を {運|はこ}び{終|お}えて から 。 {灯籠|とうろう} の {火|ひ} は 、 {水|みず} を {汲|く}んで から で ない と {入|い}れない 。 {薪|まき} は 、 {灯籠|とうろう} が {明|あか}るい うち に {運|はこ}ぶ 。',
      A: '{水|みず} を {汲|く}み{次第|しだい} 、 {灯籠|とうろう} に {火|ひ} を {入|い}れる こと 。 {薪|まき} は 、 {灯籠|とうろう} の {明|あ}かり を {頼|たよ}り に {運|はこ}ぶ 。 {和尚|おしょう}さん を {起|お}こす の は 、 {万事|ばんじ} {整|ととの}えて から 。',
      en: 'First draw water; then light the stone lantern; then carry the firewood; last, wake the priest.' },
    1: { F: 'まず 、 とうろう に ひ を いれる 。 つぎ に 、 みず を くむ 。 それから 、 おしょうさん を おこす 。 さいご に 、 まき を はこぶ 。',
      E: '{薪|まき} を {運|はこ}ぶ の は 、 {最後|さいご} 。 {灯籠|とうろう} に {火|ひ} を {入|い}れて から 、 {水|みず} を {汲|く}む 。 {水|みず} を {汲|く}んだ {後|あと} で 、 {和尚|おしょう}さん を {起|お}こす 。',
      I: '{薪|まき} を {運|はこ}ぶ の は 、 {他|ほか} の こと が {全部|ぜんぶ} {済|す}んで から 。 {水|みず} は 、 {灯籠|とうろう} に {火|ひ} が {入|はい}って から {汲|く}む 。 {和尚|おしょう}さん は 、 {水|みず} を {汲|く}み{終|お}わった ところ で {起|お}こす 。',
      A: '{灯籠|とうろう} に {火|ひ} を {入|い}れ{次第|しだい} 、 {水|みず} を {汲|く}む こと 。 {和尚|おしょう}さん は 、 {水|みず} の {支度|したく} が {済|す}み{次第|しだい} {起|お}こす 。 {薪|まき} は 、 {和尚|おしょう}さん が {起|お}きて から で よい 。',
      en: 'First light the stone lantern; then draw water; then wake the priest; last, carry the firewood.' },
  };
  out += `
@scene hall.w3.t2_note
narr: {道|みち} の {札|ふだ} に 、 ジンベエ の {書|か}き{置|お}き が {貼|は}って ある 。 {震|ふる}える {字|じ} だ 。 || Jinbei's note is pinned to the board by the path, in a shaking hand.
`;
  for (const p of [0, 1]) for (const tier of ['F', 'E', 'I', 'A']) out += `?(${both(L[tier], 'hall.w3.pat=' + p)}) narr: 「 ${NOTE[p][tier]} 」 || "${NOTE[p].en}"\n`;
  out += `?(comp&!hall.w3.t2) comp: {書|か}いて ある {順|じゅん} と 、 やる {順|じゅん} は 、 {違|ちが}う かも しれない 。 {前|まえ} と {後|あと} を よく {見|み}よう 。 || The order it's written in may not be the order to do it in. Watch for before and after.\n`;
  const CH = {
    water: ['{井戸|いど}', 'the well', '{水|みず} を {汲|く}んだ 。 {桶|おけ} が {冷|つめ}たい 。', 'You draw a bucket of water. The pail is cold.'],
    lamp: ['{石|いし} の {灯籠|とうろう}', 'the stone lantern', '{灯籠|とうろう} に {火|ひ} を {入|い}れた 。 {道|みち} が {明|あか}るく なった 。', 'You light the stone lantern. The path brightens.'],
    wood: ['{薪|まき} の {山|やま}', 'the woodpile', '{薪|まき} を {抱|かか}えて 、 {寺|てら} の {道|みち} へ {運|はこ}んだ 。', 'You carry an armful of firewood to the temple path.'],
    priest: ['{和尚|おしょう}さん の {戸|と}', 'the priest\'s door', '{戸|と} を {叩|たた}いた 。 「 {起|お}きて おる 、 {起|お}きて おる 」 と 、 {眠|ねむ}そう な {声|こえ} が した 。', 'You knock. "I\'m up, I\'m up," says a sleepy voice.'],
  };
  const DID = (c) => 'xp_hall_w3_f0_did_' + c, ST = (i) => 'xp_hall_w3_f0_s' + i;
  const reset2 = '!unset ' + Object.keys(CH).map(DID).concat([1, 2, 3, 4].map(ST)).join(' ');
  for (const c of Object.keys(CH)) {
    out += `
@scene hall.w3.c_${c}
!if hall.w3.t2 -> done
!if ${DID(c)} -> did
narr: ${CH[c][0]} 。 || ${cap(CH[c][1])}.
!if hall.w3.pat=1 -> p1
`;
    for (const p of [0, 1]) {
      const i = ORDER[p].indexOf(c) + 1;
      out += (p === 1 ? ':p1\n' : '') + (i > 1 ? `!if !${ST(i - 1)} -> wrong\n` : '') +
        `narr: ${CH[c][2]} || ${CH[c][3]}\n!set ${DID(c)} ${ST(i)}\n` + (i === 4 ? '!goto all\n' : '!refresh\n!end\n');
    }
    out += `:wrong
narr: ジンベエ の {家|いえ} から 、 {声|こえ} が した 。 「 それ は 、 まだ だ 。 {書|か}き{置|お}き を もう {一度|いちど} 。 」 {全部|ぜんぶ} 、 {初|はじ}め から やり{直|なお}そう 。 || A voice from Jinbei's house: "Not that yet. Read the note again." You'll start again from the beginning.
${reset2}
!refresh
!end
:all
narr: {支度|したく} が 、 {書|か}き{置|お}き の {言|い}う {順番|じゅんばん} で {全部|ぜんぶ} {済|す}んだ 。 || Everything is done, in the order the note means.
?(comp) comp: {書|か}いて ある {順|じゅん} じゃ なくて 、 {前|まえ} と {後|あと} で {決|き}まる {順|じゅん} 。 {上手|うま}く いった ね 。 || Not the order it was written in, but the order before and after make. Well done.
${K.mark(W, 0, 't2')}
!end
:did
narr: もう {済|す}んで いる 。 || That's done already.
!end
:done
narr: {支度|したく} は 、 {全部|ぜんぶ} {済|す}んで いる 。 || Everything is ready.
`;
  }

  // ---- t3: the bell-ringer's sayings and their stone ------------------------------------------------------------------------
  const CE = {
    0: { F: ['After drawing water, I lit the fire.', 'Before bed, I polished the bell.', 'Before lighting(-past) the lantern, I went out.', 'After the bell rang, the villagers got up.'],
      E: ['After drawing water, I lit the fire.', 'Before bed, I polished the bell.', 'Before striking(-past) the bell, I put my hands together.', 'After climbing the slope, I rested a little.'],
      I: ['I kept watch over the bell until dawn.', 'The bell must be rung by dawn.', 'I waited, all along, by dawn.', 'While it was still dark, I climbed the slope.'],
      A: ['As soon as the bell rings, the boats go out.', 'Just as I was about to strike the bell, a tanuki came.', 'Yesterday, "as soon as" the bell rang, I woke.', 'As I was leaving the village, I heard the bell.'] },
    1: { F: ['After washing my hands, I ate.', 'Before going out, I shut the door.', 'Before striking(-past) the bell, I put my hands together.', 'After the bell rang, the bird sang.'],
      E: ['After opening the gate, I went in.', 'Before striking the bell, I put my hands together.', 'After sweeping(-present) the steps, I sprinkled water.', 'After the bell rang, the cock crowed.'],
      I: ['While the moon is out, let\'s climb the slope.', 'I slept until the bell rang.', 'I got up, all along, until the bell rang.', 'By dawn, I had finished everything.'],
      A: ['As soon as I\'m ready, I\'ll go to the bell tower.', 'I have just finished striking the bell.', '"As soon as" dawn, I struck the bell.', 'While I was climbing the slope, the stars began to fade.'] },
  };
  out += '\n@scene hall.w3.t3' + K.taskTrial({ w: W, k: 0, t: 't3',
    intro: ['narr: {寺|てら} の {道|みち} の {石|いし} に 、 {字|じ} が {刻|きざ}んで ある 。 「 {四|よっ}つ の {言葉|ことば} の うち 、 {一|ひと}つ だけ が {間違|まちが}って いる 。 」 || Carved on a stone by the temple path: "Of the four sayings, one alone is wrong."'],
    task: { 0: 'hall.w3.counter0', 1: 'hall.w3.counter1' },
    after: ['narr: {間違|まちが}った {言葉|ことば} の {石|いし} が 、 {音|おと} も なく {苔|こけ} に {覆|おお}われた 。 || The stone with the wrong saying is covered over by moss without a sound.', '?(comp) comp: {鐘撞|かねつ}き は 、 {前|まえ} と {後|あと} を {間違|まちが}えたら {仕事|しごと} に ならない から ね 。 || A bell-ringer who mixes up before and after is out of a job.'],
    later: 'narr: {言葉|ことば} を {一|ひと}つ ずつ {読|よ}んで から 、 また {来|こ}よう 。 || Read the sayings one by one, then come back.',
    done: 'narr: {石|いし} の {字|じ} は 、 もう {何|なに} も {問|と}わない 。 || The carving asks nothing more.' });
  for (let i = 0; i < 4; i++) {
    out += `\n@scene hall.w3.card${i + 1}\nnarr: {鐘撞|かねつ}き の {言葉|ことば} を {刻|きざ}んだ {石|いし} 。 || A stone carved with one of the bell-ringer's sayings.\n`;
    for (const p of [0, 1]) for (const tier of ['F', 'E', 'I', 'A']) out += `?(${both(L[tier], 'hall.w3.pat=' + p)}) narr: 「 ${C.hallW3Cards[p][tier][i][0]} 」 || "${CE[p][tier][i]}"\n`;
  }

  // ---- t4: the incense clock and Jinbei's slate ------------------------------------------------------------------------------
  // The night's hours on the floor: none set = night (夜), then h1 late night (夜更け), h2 moonset (月の入り), h3 the
  // first cock-crow (明け方). The clock only burns forward; past the last mark a new stick starts the night again and
  // undoes the slate's work (never anything else).
  const H = (h) => 'xp_hall_w3_f1_h' + h;
  const HOUR = (h) => (h ? H(h) : '!' + H(1) + '&!' + H(2) + '&!' + H(3));
  const HNAME = ['{夜|よる}', '{夜更|よふ}け', '{月|つき} の {入|い}り', '{明|あ}け{方|がた}'];
  const HEN = ['night', 'late night', 'moonset', 'the hour before dawn'];
  out += `
@scene hall.w3.clock
!if hall.w3.t4 -> done
!if ${H(3)} -> relight
!if ${H(2)} -> to3
!if ${H(1)} -> to2
narr: {線香|せんこう} が {一|ひと}つ {目|め} の {印|しるし} まで {燃|も}えた 。 ${HNAME[1]} に なった 。 || The incense burns down to the first mark. It is ${HEN[1]}.
!set ${H(1)}
!refresh
!end
:to2
narr: {線香|せんこう} が {二|ふた}つ {目|め} の {印|しるし} まで {燃|も}えた 。 {月|つき} が {尾根|おね} の {向|む}こう に {沈|しず}んだ 。 || The incense burns down to the second mark. The moon goes down behind the ridge.
!unset ${H(1)}
!set ${H(2)}
!refresh
!end
:to3
narr: {線香|せんこう} が {三|みっ}つ {目|め} の {印|しるし} まで {燃|も}えた 。 {坂|さか} の {下|した} で 、 {一番鶏|いちばんどり} が {鳴|な}いた 。 || The incense burns down to the third mark. Below the slope, the first cock crows.
!unset ${H(2)}
!set ${H(3)}
!refresh
!end
:relight
narr: {線香|せんこう} が {燃|も}え{尽|つ}きた 。 {新|あたら}しい {線香|せんこう} に {火|ひ} を {点|つ}ける と 、 {夜|よる} は また {最初|さいしょ} から だ 。 {石板|せきばん} の こと も 、 やり{直|なお}し だ 。 || The incense has burned to its end. You light a new stick, and the night begins again from the start. The slate's work begins again too.
!unset ${H(3)} xp_hall_w3_f1_d_jizo xp_hall_w3_f1_d_bridge xp_hall_w3_f1_d_gate
!refresh
!end
:done
narr: {香時計|こうどけい} は 、 {夜|よる} を {燃|も}やし{終|お}えた 。 || The incense clock has burned through its night.
`;
  const SLATE = {
    0: { F: 'よふけ に 、 じぞう さま に だんご を そなえる 。 つき が しずんで から 、 はし の ひ を けす 。 にわとり が なく まえ に 、 もん を あける 。',
      E: '{夜更|よふ}け に 、 {地蔵|じぞう} さま に {団子|だんご} を {供|そな}える 。 {月|つき} が {沈|しず}んで から 、 {橋|はし} の {灯|ひ} を {消|け}す 。 {鶏|にわとり} が {鳴|な}く {前|まえ} に 、 {門|もん} を {開|あ}ける 。',
      I: 'お{地蔵|じぞう} さま へ の お{供|そな}え は 、 {夜更|よふ}け の うち に 。 {橋|はし} の {灯|ひ} は 、 {月|つき} が {沈|しず}む まで {消|け}さない こと 。 {門|もん} は 、 {鶏|にわとり} が {鳴|な}かない うち に {開|あ}けて おく 。',
      A: '{夜更|よふ}け を {迎|むか}え{次第|しだい} 、 お{地蔵|じぞう} さま に お{供|そな}え を 。 {橋|はし} の {灯|ひ} は 、 {月|つき} の {入|い}り を {待|ま}って {消|け}す 。 {門|もん} は 、 {一番鶏|いちばんどり} より {先|さき} に {開|ひら}く べし 。',
      en: 'In the late night, set dumplings before the Jizō. After the moon goes down, put out the bridge light. Before the cock crows, open the gate.' },
    1: { F: 'つき が しずむ まえ に 、 はし の ひ を つける 。 よふけ が すぎて から 、 じぞう さま に だんご を そなえる 。 もん を あける の は 、 にわとり が ないて から 。',
      E: '{月|つき} が {沈|しず}む {前|まえ} に 、 {橋|はし} の {灯|ひ} を {点|つ}ける 。 {夜更|よふ}け が {過|す}ぎて から 、 {地蔵|じぞう} さま に {団子|だんご} を {供|そな}える 。 {門|もん} を {開|あ}ける の は 、 {鶏|にわとり} が {鳴|な}いて から 。',
      I: '{橋|はし} の {灯|ひ} は 、 {月|つき} が {出|で}て いる うち に {点|つ}けて おく 。 お{供|そな}え は 、 {夜更|よふ}け が {過|す}ぎて から 。 {門|もん} は 、 {鶏|にわとり} が {鳴|な}く まで {開|あ}けない こと 。',
      A: '{月|つき} の ある うち に 、 {橋|はし} の {灯|ひ} を {灯|とも}す 。 お{供|そな}え は 、 {夜更|よふ}け を {過|す}ぎて のち 。 {門|もん} は 、 {一番鶏|いちばんどり} を {聞|き}いて から {開|ひら}く こと 。',
      en: 'Before the moon goes down, light the bridge light. After the late night has passed, set dumplings before the Jizō. Open the gate only after the cock crows.' },
  };
  out += `
@scene hall.w3.t4_slate
narr: ジンベエ の {石板|せきばん} 。 {夜|よる} の {仕事|しごと} が {書|か}いて ある 。 || Jinbei's slate, with the night's work on it.
`;
  for (const p of [0, 1]) for (const tier of ['F', 'E', 'I', 'A']) out += `?(${both(L[tier], 'hall.w3.pat=' + p)}) narr: 「 ${SLATE[p][tier]} 」 || "${SLATE[p].en}"\n`;
  out += `!if hall.w3.t4 -> done
!if ${H(1)} -> h1
!if ${H(2)} -> h2
!if ${H(3)} -> h3
narr: {香時計|こうどけい} を {見|み}る と 、 {今|いま} は ${HNAME[0]} 。 || By the incense clock, it is ${HEN[0]}.
!end
`;
  for (const h of [1, 2, 3]) out += `:h${h}\nnarr: {香時計|こうどけい} を {見|み}る と 、 {今|いま} は ${HNAME[h]} 。 || By the incense clock, it is ${HEN[h]}.\n!end\n`;
  out += `:done\nnarr: {石板|せきばん} の {仕事|しごと} は 、 {全部|ぜんぶ} {済|す}んで いる 。 || The slate's work is all done.\n`;
  // the slate's three things: which hours each is right at, by pattern
  const VALID = { 0: { jizo: [1, 1], bridge: [2, 3], gate: [0, 2] }, 1: { jizo: [2, 3], bridge: [0, 1], gate: [3, 3] } };
  const DD = (x) => 'xp_hall_w3_f1_d_' + x;
  const THING = {
    jizo: ['{赤|あか}い {前掛|まえか}け の お{地蔵|じぞう} さま 。', 'A small stone Jizō in a red bib.', '{団子|だんご} を {供|そな}えて 、 {手|て} を {合|あ}わせた 。', 'You set the dumplings before the Jizō and put your hands together.'],
    bridge: ['{小|ちい}さな {橋|はし} の {袂|たもと} の {灯籠|とうろう} 。', 'The lantern at the foot of the little bridge.', null, null],
    gate: ['{寺|てら} の {外|そと} の {門|もん} 。', 'The temple\'s outer gate.', '{門|もん} の {閂|かんぬき} を {外|はず}して 、 {門|もん} を {開|ひら}いた 。', 'You lift the bar and open the gate.'],
  };
  const BRIDGE_DO = { 0: ['{橋|はし} の {灯|ひ} を {消|け}した 。', 'You put out the bridge light.'], 1: ['{橋|はし} の {灯|ひ} を {点|つ}けた 。', 'You light the bridge lantern.'] };
  for (const x of Object.keys(THING)) {
    out += `
@scene hall.w3.h_${x}
!if hall.w3.t4 -> done
!if ${DD(x)} -> did
narr: ${THING[x][0]} || ${THING[x][1]}
!if hall.w3.pat=1 -> p1
`;
    for (const p of [0, 1]) {
      const [lo, hi] = VALID[p][x];
      out += (p === 1 ? ':p1\n' : '') + [0, 1, 2, 3].map((h) => `!if ${HOUR(h)} -> ${h < lo ? 'early' : h > hi ? 'late' : 'ok' + p}`).join('\n') + '\n!end\n';
      const act = x === 'bridge' ? BRIDGE_DO[p] : [THING[x][2], THING[x][3]];
      out += `:ok${p}\nnarr: ${act[0]} || ${act[1]}\n!set ${DD(x)}\n!goto check\n`;
    }
    out += `:early
narr: {石板|せきばん} に よる と 、 まだ {早|はや}い 。 {香時計|こうどけい} を {燃|も}やして 、 {時|とき} を {進|すす}めよう 。 || By the slate, it is too early. Burn the incense on to move the hour forward.
!end
:late
narr: {石板|せきばん} に よる と 、 もう {遅|おそ}い 。 その {時|とき} は {過|す}ぎて しまった 。 {新|あたら}しい {線香|せんこう} で 、 {夜|よる} を {始|はじ}め{直|なお}そう 。 || By the slate, it is too late: that hour has passed. Light a new stick and begin the night again.
?(comp) comp: {急|いそ}がなくて いい 。 {線香|せんこう} は 、 まだ ある 。 || No need to hurry. There's more incense.
!end
:check
!if ${Object.keys(THING).map(DD).join('&')} -> all
!refresh
!end
:all
narr: {石板|せきばん} の {仕事|しごと} が 、 {全部|ぜんぶ} {時間|じかん} {通|どお}り に {済|す}んだ 。 || Everything on the slate is done, each at its hour.
?(comp) comp: {前|まえ} に 、 {後|あと} で 、 {間|ま}に{合|あ}った 。 {時計|とけい} と {仲良|なかよ}く なった {気分|きぶん} だ ね 。 || Before, after, in time. I feel like the clock and I are friends now.
${K.mark(W, 1, 't4')}
!end
:did
narr: もう {済|す}んで いる 。 || That's done.
!end
:done
narr: {石板|せきばん} の {通|とお}り に 、 {済|す}んで いる 。 || Done, as the slate says.
`;
  }

  // ---- t5: the moths ---------------------------------------------------------------------------------------------------------
  out += `
@scene hall.w3.t5
narr: {蛾|が} が {霧|きり} の {中|なか} へ {散|ち}って 、 {灯籠|とうろう} の {灯|ひ} が {落|お}ち{着|つ}いた 。 || The moths scatter into the mist, and the lantern's flame steadies.
${K.mark(W, 1, 't5')}
`;

  // ---- t6: the almanac and the hour post (the almanac in your companion's hands; alone, Shino reads it) -----------------
  const TOLD = {
    0: { F: 'きょう は 、 いちばんどり の まえ に つく 。', E: '{今日|きょう} は 、 {一番鶏|いちばんどり} が {鳴|な}く {前|まえ} に {撞|つ}く 。', I: '{今日|きょう} は 、 {一番鶏|いちばんどり} が {鳴|な}かない うち に {撞|つ}く こと 。', A: '{本日|ほんじつ} 、 {一番鶏|いちばんどり} に {先立|さきだ}って {撞|つ}く べし 。', en: 'Today, ring before the first cock-crow.' },
    1: { F: 'きょう は 、 いちばんどり の あと 、 にばんどり の まえ に つく 。', E: '{今日|きょう} は 、 {一番鶏|いちばんどり} が {鳴|な}いて から 、 {二番鶏|にばんどり} が {鳴|な}く {前|まえ} に {撞|つ}く 。', I: '{今日|きょう} は 、 {一番鶏|いちばんどり} を {聞|き}いて から 、 {二番鶏|にばんどり} が {鳴|な}かない うち に {撞|つ}く こと 。', A: '{本日|ほんじつ} 、 {一番鶏|いちばんどり} の {後|のち} 、 {二番鶏|にばんどり} を {待|ま}たず に {撞|つ}く べし 。', en: 'Today, ring after the first cock-crow and before the second.' },
  };
  out += `
@scene hall.w3.t6
!if hall.w3.t6 -> done
!if xp_hall_w3_f1_asked -> told
narr: {石|いし} の {机|つくえ} の {上|うえ} に 、 ジンベエ の {暦|こよみ} 。 {一年|いちねん} の {毎日|まいにち} に 、 {細|こま}かい {字|じ} が {並|なら}んで いる 。 || On the stone table, Jinbei's almanac: small writing for every day of the year.
?(comp=nao) comp: {細|こま}かい {字|じ} は {任|まか}せて くれ 。 {宛名|あてな} で {慣|な}れてる 。 {何|なに} を {調|しら}べる ？ || Leave small writing to me. I'm used to addresses. What are we looking up?
?(comp=mio) comp: {私|わたし} が {読|よ}む わ 。 {薬|くすり} の {帳面|ちょうめん} より 、 ずっと {読|よ}み やすい もの 。 {何|なに} が {知|し}りたい の ？ || I'll read it. It's far easier than a medicine ledger. What do you want to know?
?(comp=ren) comp: {暦|こよみ} なら 、 {灯守|ひもり} も {使|つか}います 。 {私|わたし} が {読|よ}みましょう 。 {何|なに} を ？ || Lamp-keepers use almanacs too. I'll read it. What for?
?(comp=suzu) comp: {香盤表|こうばんひょう} みたい な もん ね 。 {任|まか}せて 。 {何|なに} を {見|み}る ？ || It's like a running order. Leave it to me. What am I looking for?
?(!comp) hall_shino: {祖父|そふ} の {暦|こよみ} なら 、 {私|わたし} が {読|よ}めます 。 {何|なに} を {調|しら}べましょう か 。 || I can read Grandfather's almanac. What shall I look up?
!hook hall_challenge hall.w3.ask
!if var._res=0 -> later
!set xp_hall_w3_f1_asked
:told
`;
  for (const p of [0, 1]) for (const tier of ['F', 'E', 'I', 'A']) out += `?(${both(L[tier], 'hall.w3.pat=' + p)}) narr: 「 ${TOLD[p][tier]} 」 || "${TOLD[p].en}"\n`;
  out += `!end
:later
narr: {暦|こよみ} は 、 {机|つくえ} の {上|うえ} に {戻|もど}した 。 || You put the almanac back on the table.
!end
:done
narr: {暦|こよみ} は 、 {今日|きょう} の {頁|ページ} で {開|ひら}いた まま だ 。 || The almanac lies open at today's page.
`;
  const HOOK = {
    h1: ['いちばんどり の まえ', '{一番鶏|いちばんどり} の {前|まえ}', 'Before the first cock-crow', 0],
    h2: ['いちばんどり と にばんどり の あいだ', '{一番鶏|いちばんどり} と {二番鶏|にばんどり} の {間|あいだ}', 'Between the first cock-crow and the second', 1],
    h3: ['にばんどり の あと', '{二番鶏|にばんどり} の {後|あと}', 'After the second cock-crow', -1],
  };
  for (const h of Object.keys(HOOK)) {
    out += `
@scene hall.w3.t6_${h}
!if hall.w3.t6 -> done
narr: {時|とき} の {柱|はしら} の {鉤|かぎ} 。 {札|ふだ} が {下|さ}がって いる 。 || A hook on the hour post, with a board hanging from it.
?(${L.EF}) narr: 「 ${HOOK[h][0]} 」 || "${HOOK[h][2]}"
?(${L.NOTF}) narr: 「 ${HOOK[h][1]} 」 || "${HOOK[h][2]}"
!if !xp_hall_w3_f1_asked -> empty
${HOOK[h][3] >= 0 ? '!if hall.w3.pat=' + HOOK[h][3] + ' -> right\n' : ''}narr: {暦|こよみ} の {時刻|じこく} と は 、 {違|ちが}う よう だ 。 || That isn't the hour the almanac gave, it seems.
?(comp) comp: {暦|こよみ} の {言葉|ことば} 、 もう {一度|いちど} {言|い}おう か ？ || Shall I say the almanac's words again?
!end
:right
narr: シノ の {提灯|ちょうちん} を 、 その {鉤|かぎ} に {掛|か}けた 。 {村|むら} の {夜回|よまわ}り が 、 これ を {見|み}て {時|とき} を {知|し}る 。 || You hang Shino's lantern on that hook. The village watchman will see it and know the hour.
!set xp_hall_w3_f1_hung_${h}
?(comp) comp: これ で 、 {村|むら} の {人|ひと} も {鐘|かね} の {時|とき} が {分|わ}かる 。 || Now the village will know the bell's hour too.
${K.mark(W, 1, 't6')}
!end
:empty
narr: {今日|きょう} の {鐘|かね} が どの {時|とき} か 、 まだ {分|わ}からない 。 || You don't know yet which hour today's bell is for.
!end
:done
narr: シノ の {提灯|ちょうちん} が 、 {柱|はしら} に {掛|か}かって いる 。 || Shino's lantern hangs on the post.
`;
  }

  // ---- t7: the riddle stone ----------------------------------------------------------------------------------------------------
  out += '\n@scene hall.w3.t7' + K.taskTrial({ w: W, k: 1, t: 't7',
    intro: ['narr: {苔|こけ} むした {石|いし} に 、 {字|じ} が {彫|ほ}って ある 。 「 {解|と}けた {者|もの} は 、 {一度|いちど} だけ 、 {帰|かえ}って また {来|く}る こと が できる 。 」 || Words cut into a mossy stone: "Whoever solves this may once go home and come back."'],
    task: 'hall.w3.riddle',
    after: ['narr: {石|いし} の {字|じ} が 、 {露|つゆ} に {濡|ぬ}れて {光|ひか}った 。 || The carving shines, wet with dew.'],
    later: 'narr: {答|こた}え は 、 {急|いそ}がなくて いい 。 || There\'s no hurry for the answer.',
    done: 'narr: {石|いし} は 、 {答|こた}え を {覚|おぼ}えて いる 。 || The stone remembers the answer.' });

  // ---- t8: the lost cub, by the sightings in time order -----------------------------------------------------------------------
  const HIDE_AT = { 0: 'wood', 1: 'well' };
  const SEEN = {
    osho: { 0: ['よる の はじめ に 、 こだぬき が しょうろう の いしだん に いた よ 。', '{夜|よる} の {初|はじ}め に 、 {子狸|こだぬき} が {鐘楼|しょうろう} の {石段|いしだん} に いた よ 。', '{宵|よい} の {口|くち} に 、 {子狸|こだぬき} が {鐘楼|しょうろう} の {石段|いしだん} で {遊|あそ}んで いる ところ を {見|み}た よ 。', 'At the start of the night, a tanuki cub was on the bell tower\'s steps.'],
      1: ['つき が しずんだ あと で 、 いど の ほう へ いく の を みた 。', '{月|つき} が {沈|しず}んだ {後|あと} で 、 {井戸|いど} の {方|ほう} へ {行|い}く の を {見|み}た 。', '{月|つき} が {沈|しず}んで {間|ま} も ない ころ 、 {井戸|いど} の {方|ほう} へ {歩|ある}いて いく ところ を {見|み}た 。', 'After the moon went down, I saw it going toward the well.'] },
    mataji: { 0: ['つき が しずむ まえ に 、 いど の そば で みた 。', '{月|つき} が {沈|しず}む {前|まえ} に 、 {井戸|いど} の {側|そば} で {見|み}た 。', '{月|つき} が {沈|しず}まない うち に 、 {井戸|いど} の {側|そば} で {見|み}かけた 。', 'Before the moon went down, I saw it by the well.'],
      1: ['よる の はじめ に 、 まき の やま に いた ぞ 。', '{夜|よる} の {初|はじ}め に 、 {薪|まき} の {山|やま} に いた ぞ 。', '{日|ひ} が {暮|く}れた ばかり の ころ 、 {薪|まき} の {山|やま} に いた ぞ 。', 'At the start of the night, it was at the woodpile.'] },
    sukezo: { 0: ['つき が しずんだ あと で 、 まき の やま の ほう へ はしって いった 。', '{月|つき} が {沈|しず}んだ {後|あと} で 、 {薪|まき} の {山|やま} の {方|ほう} へ {走|はし}って いった 。', '{月|つき} が {沈|しず}んで しばらく {経|た}った ところ で 、 {薪|まき} の {山|やま} へ {潜|もぐ}り{込|こ}む の を {見|み}た 。', 'After the moon went down, it ran off toward the woodpile.'],
      1: ['よふけ に 、 しょうろう の いしだん に すわって いた 。', '{夜更|よふ}け に 、 {鐘楼|しょうろう} の {石段|いしだん} に {座|すわ}って いた 。', '{夜更|よふ}け の うち は 、 {鐘楼|しょうろう} の {石段|いしだん} に {座|すわ}って いた なあ 。', 'In the late night, it was sitting on the bell tower\'s steps.'] },
  };
  const WIT = { osho: ['hall_osho', '{和尚|おしょう}さん', 'the priest'], mataji: ['hall_mataji', '{夜回|よまわ}り の マタジ', 'Mataji the watchman'], sukezo: ['hall_sukezo', '{漁師|りょうし} の スケゾウ', 'Sukezō the fisherman'] };
  const HELLO = { osho: '{子狸|こだぬき} を {見|み}た か 、 と ？ {見|み}た とも 。 || Did I see a tanuki cub? I did.', mataji: '{火|ひ} の {用心|ようじん} の {途中|とちゅう} で 、 {見|み}た よ 。 {小|ちい}さい の を 。 || I saw it on my fire-watch rounds. A little one.', sukezo: '{舟|ふね} に {行|い}く {途中|とちゅう} で 、 {見|み}た な 。 || I saw it on the way down to the boats.' };
  for (const w of Object.keys(SEEN)) {
    out += `
@scene hall.w3.w_${w}
!faceplayer ${WIT[w][0]}
${WIT[w][0]}: ${HELLO[w]}
`;
    for (const p of [0, 1]) out += `?(${both(L.EF, 'hall.w3.pat=' + p)}) ${WIT[w][0]}: 「 ${SEEN[w][p][0]} 」 || "${SEEN[w][p][3]}"
?(${both(L.E, 'hall.w3.pat=' + p)}) ${WIT[w][0]}: 「 ${SEEN[w][p][1]} 」 || "${SEEN[w][p][3]}"
?(${both(L.IA, 'hall.w3.pat=' + p)}) ${WIT[w][0]}: 「 ${SEEN[w][p][2]} 」 || "${SEEN[w][p][3]}"
`;
    out += `?(comp&!hall.w3.t8) comp: {見|み}た {順番|じゅんばん} に {並|なら}べたら 、 {最後|さいご} の {場所|ばしょ} に いる はず だ 。 || Put the sightings in order, and the cub should be where it was seen last.\n`;
  }
  const PLACE = { steps: ['{鐘楼|しょうろう} の {石段|いしだん}', 'the bell tower\'s stone steps', '{石段|いしだん} の {下|した} を {覗|のぞ}いた 。 {落|お}ち{葉|ば} しか ない 。', 'You look under the steps. Only fallen leaves.'],
    wood: ['{薪|まき} の {山|やま}', 'the woodpile', '{薪|まき} の {間|あいだ} を {覗|のぞ}いた 。 {虫|むし} が {一匹|いっぴき} 、 {逃|に}げて いった 。', 'You look between the logs. A beetle scuttles off.'],
    well: ['{古|ふる}い {井戸|いど}', 'the old well', '{井戸|いど} の {周|まわ}り を {探|さが}した 。 {濡|ぬ}れた {石|いし} だけ だ 。', 'You search round the well. Only wet stones.'] };
  for (const pl of Object.keys(PLACE)) {
    const right = [0, 1].filter((p) => HIDE_AT[p] === pl);
    out += `
@scene hall.w3.hide_${pl}
!if hall.w3.t8 -> done
narr: ${PLACE[pl][0]} 。 || ${cap(PLACE[pl][1])}.
${right.map((p) => '!if hall.w3.pat=' + p + ' -> found').join('\n')}
narr: ${PLACE[pl][2]} || ${PLACE[pl][3]}
?(comp) comp: {一番|いちばん} {最後|さいご} に {見|み}た の は 、 {誰|だれ} だった ？ || Who saw it last?
!end
:found
narr: {暗|くら}がり で 、 {丸|まる}い {目|め} が {二|ふた}つ {光|ひか}った 。 {小|ちい}さな {子|こ} が 、 {膝|ひざ} を {抱|かか}えて {震|ふる}えて いる 。 || In the dark, two round eyes shine. A small child is hugging their knees, shivering.
hall_kobu: …… {蛾|が} を {追|お}いかけて たら 、 {帰|かえ}り {道|みち} が {分|わ}からなく なった 。 || …I was chasing a moth, and then I couldn't find the way back.
?(comp) comp: {大丈夫|だいじょうぶ} 。 お{母|かあ}さん の ところ へ {帰|かえ}ろう 。 || It's all right. Let's get you back to your mother.
${K.mark(W, 2, 't8')}
!end
:done
narr: ${PLACE[pl][0]} 。 もう {誰|だれ} も {隠|かく}れて いない 。 || ${cap(PLACE[pl][1])}. Nobody is hiding here now.
`;
  }

  // ---- t9: Mame ------------------------------------------------------------------------------------------------------------------
  out += `
@scene hall.w3.t9
!faceplayer hall_mame
hall_mame: …… {来|こ}ない で 。 {夜|よる} は 、 まだ {終|お}わらない 。 {終|お}わらせない 。 || …Stay back. The night isn't over. I won't let it end.
!encounter hall.w3.mame
!if var._enc=promised -> promised
hall_mame: …… ぽん 、 ぽん 。 {太鼓|たいこ} の {音|おと} が 、 {杉|すぎ} の {奥|おく} で {続|つづ}いて いる 。 || …Pon, pon. The drumming goes on, deep in the cedars.
!end
:promised
hall_mame: {夜明|よあ}け までに 。 {約束|やくそく} だ よ 。 {鐘|かね} の {側|そば} で 、 {待|ま}って いる 。 || By dawn. That's a promise. I'll wait by the bell.
${K.mark(W, 2, 't9')}

@scene hall.w3.mame_after
!faceplayer hall_mame_after
!if hall.w3.t8 -> found
hall_mame: {鐘|かね} が {鳴|な}る {前|まえ} に 、 あの {子|こ} が {帰|かえ}って くれば …… 。 || If only my child comes back before the bell…
!end
:found
hall_mame: {見|み}つけて くれた 。 …… {約束|やくそく} {通|どお}り 、 {夜|よる} を {終|お}わらせて いい よ 。 || You found them. …As promised, you may let the night end now.

@scene hall.w3.kobu
!faceplayer hall_kobu
hall_kobu: お{母|かあ}さん の {太鼓|たいこ} 、 {止|と}まった ね 。 {鐘|かね} 、 もう すぐ ？ || Mum's drum has stopped. Is it nearly time for the bell?
`;

  // ---- t10: the dawn bell ------------------------------------------------------------------------------------------------------
  out += `
@scene hall.w3.t10
!if !hall.w3.t8 -> wait
!if !hall.w3.t9 -> wait
narr: シノ が {撞木|しゅもく} の {綱|つな} に {手|て} を かけた 。 マメ と コブ が 、 {石段|いしだん} の {下|した} で {見|み}て いる 。 || Shino lays her hands on the beam's rope. Mame and Kobu watch from the foot of the steps.
!if hall.w3.pat=1 -> p1
!encounter hall.w3.bell0
!goto rung
:p1
!encounter hall.w3.bell1
:rung
!if var._res=0 -> later
!set xp_hall_w3_f2_t10
!hook hall_trial w3 t10
!if var._res=1 -> finale
!refresh
!end
:finale
!call hall.w3.end
!end
:wait
narr: {大|おお}きな {鐘|かね} は 、 {黙|だま}って {下|さ}がって いる 。 || The great bell hangs in silence.
?(!hall.w3.t9) narr: {杉|すぎ} の {方|ほう} で 、 {太鼓|たいこ} が {鳴|な}り{続|つづ}けて いる 。 あれ が {止|や}まない うち は 、 {夜|よる} は {明|あ}けない 。 || In the cedars the drumming goes on. While it lasts, the night will not end.
?(!hall.w3.t8) narr: {暗|くら}がり の どこ か で 、 {小|ちい}さな {誰|だれ} か が {迷|まよ}って いる 。 || Somewhere in the dark, someone small is lost.
!end
:later
narr: シノ は 、 {綱|つな} を {握|にぎ}った まま {待|ま}って いる 。 || Shino waits, the rope still in her hands.

# ---- the tale's end ----------------------------------------------------------------------------------------------------
@scene hall.w3.end
!fade out
!sequence hall.w3 begin
!shot tale
narr: {鐘|かね} の {声|こえ} が 、 {谷|たに} を {下|くだ}って いく 。 {村|むら} の {戸|と} が 、 {一|ひと}つ 、 また {一|ひと}つ と {開|ひら}いた 。 || The bell's voice rolls down the valley. In the village, the doors open, one, then another.
hall_shino: おじいちゃん 、 {聞|き}こえた かな 。 || Grandpa, I wonder if you heard.
narr: {坂|さか} の {下|した} の {家|いえ} で 、 ジンベエ が {目|め} を {閉|と}じた まま 、 {笑|わら}った 。 || In the house below the slope, Jinbei smiles with his eyes still closed.
hall_mame: {夜|よる} は {終|お}わった 。 でも 、 また {来|く}る ね 。 …… ありがとう 。 || The night is over. But it'll come again, won't it. …Thank you.
?(comp=nao) comp: {時間|じかん} {通|どお}り に {届|とど}いた な 。 {鐘|かね} の {音|おと} も 、 {手紙|てがみ} と {同|おな}じ だ 。 || Delivered on time. A bell's sound is like a letter that way.
?(comp=mio) comp[happy]: {前|まえ} に 、 {後|あと} で 、 まで 、 までに 。 {全部|ぜんぶ} 、 {間|ま}に{合|あ}う ため の {言葉|ことば} だった のね 。 || Before, after, until, by. They were all words for being in time.
?(comp=ren) comp: {灯|ひ} が {三|みっ}つ 、 {戻|もど}りました 。 {夜|よる} を {終|お}わらせる の も 、 {灯守|ひもり} の {仕事|しごと} です ね 。 || Three lights back. Ending a night is lamp-keepers' work too.
?(comp=suzu) comp: {第|だい}{三幕|さんまく} 、 {幕|まく} ！ {出|で} の きっかけ を {一度|いちど} も {外|はず}さなかった わ 。 {拍手|はくしゅ} ！ || End of act three! Not one cue missed. Applause!
!sequence hall.w3 end
narr: {朝|あさ} の {光|ひかり} が {畳|たた}まれる よう に {小|ちい}さく なって 、 {気|き}が {付|つ}く と 、 {館|やかた} の {囲炉裏|いろり} の {前|まえ} に いた 。 || The morning light folds small, and when you look up you are by the hall's hearth.
!set hall_w3_done
!hook hall_finish
!fade in
`;
  RB.script.add(out);
})(RB.content);
