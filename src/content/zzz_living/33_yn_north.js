/* The North Road's events (C-87, W5; docs/future/work/LW1_ROLLOUT.md). The road out of Steamhollow climbs into the
 * mountain's silence (yn.north, open once the valley has agreed: yn_done). Its own event: Genpachi, a guest of the Upper
 * House who walked up too far in his yukata and cannot remember which inn is his (his key tag says). Then now and then:
 * the rockfall sign under the cliff, Kikue's list for the child gathering herbs, a note left under the waystone. The
 * first walk up has the road's own scene (yn.north_first), so the event waits for the next walk; Genpachi stands on the
 * road meanwhile and can be talked to. Scene ids are `yn.`: they name nothing beyond the valley. */
var RB = (globalThis.RB = globalThis.RB || {});
(function (L, C) {
  'use strict';
  const T = L.T;
  RB.lex.add(RB.lex.parseTable(`
ゲンパチ|ゲンパチ|name|F|Genpachi, a guest at the Upper House (fictional)
チエ|チエ|name|F|Chie, a traveller who left a note on the North Road (fictional)
梅の間|うめのま|n|I|the Plum Room (an inn room's name)
門限|もんげん|n|A|curfew, the hour the doors close
裏口|うらぐち|n|I|the back door, the back entrance
帳場|ちょうば|n|A|an inn's front desk, the counting room
預ける|あずける|v1|I|to leave (something) in someone's keeping
落石|らくせき|n|A|falling rocks, a rockfall
崩れる|くずれる|v1|I|to crumble, to collapse
翌日|よくじつ|n|I|the next day, the day after
ドクダミ|ドクダミ|n|A|dokudami, fish mint (Houttuynia cordata), a folk-medicine herb
センブリ|センブリ|n|A|senburi (Swertia japonica), a very bitter folk-medicine herb
束|たば|n|I|also a counter for bunches, bundles (一束 ひとたば, 二束 ふたたば, 三束 みたば)
一束|ひとたば|n|I|one bunch, one bundle
二束|ふたたば|n|I|two bunches
三束|みたば|n|I|three bunches
五束|いつたば|n|A|five bunches
夕食|ゆうしょく|n|E|dinner, the evening meal
摘む|つむ|v5m|I|to pick (flowers, herbs, leaves)
干す|ほす|v5s|I|to dry, to hang out to dry
書き置き|かきおき|n|I|a note left for someone
書き付け|かきつけ|n|A|a written note, a memo
立ち止まる|たちどまる|v5r|I|to stop (walking), to stand still
見つめる|みつめる|v1|I|to gaze at, to stare at
`));
  // a guest of the Upper House, in its yukata (a road's own face)
  C.chars.lw_genpachi = { name: T('Genpachi', 'ゲンパチ'), voice: { pitch: 0.9 },
    look: { skin: 2, hair: 'short', hairColor: 5, cloth: ['#e8e4d8', '#3a4a6a', '#3a4a6a'], shape: 'robe', acc: [], age: 'old' },
    portrait: { eyes: 'round', style: 'short', acc: [], bg: '#2a2e36' } };
  C.maps['yn.north'].npcs.push({ id: 'lw_genpachi', x: 17, y: 21, dir: 'up', if: '!lw_yn_north_guest_done', talk: 'yn.lw_road_north_guest' });
  L.road('yn_north', { maps: ['yn.north'],
    unique: { id: 'guest', scene: 'yn.lw_road_north_guest' },
    variants: [{ id: 'rocks', scene: 'yn.lw_road_north_rocks' }, { id: 'herbs', scene: 'yn.lw_road_north_herbs' }, { id: 'note', scene: 'yn.lw_road_north_note' }],
    stamp: { title: ['{北|きた} の {道|みち}', 'the North Road'], motif: 'path', ink: '#5a6070' } });
  C.notes.lw_inn_yukata = { title: T('The inn\'s yukata', '{宿|やど} の {浴衣|ゆかた}'), fiction: false,
    jp: '{温泉|おんせん} の {宿|やど} で は 、 {客|きゃく} に {浴衣|ゆかた} を {貸|か}す 。 {宿|やど} の {名前|なまえ} や {印|しるし} が {染|そ}めて ある こと も {多|おお}い 。 {客|きゃく} は {浴衣|ゆかた} の まま 、 {町|まち} の {湯|ゆ} を {巡|めぐ}って {歩|ある}く 。',
    en: 'Japanese hot-spring inns lend their guests yukata, often dyed with the inn\'s name or crest; guests stroll the town from bath to bath in them.' };

  const ch = (o) => Object.assign({ kind: 'choose' }, o);
  const o = (jp, ok, why) => Object.assign({ jp, ok: !!ok }, why ? { why: { en: why } } : {});
  C.challenges['yn.lw_guest'] = { title: T('The key tag', '{鍵|かぎ} の {札|ふだ}'), tiers: {
    F: [ch({ item: 'v:宿', ctx: { jp: 'かぎ の ふだ ： 「かみのゆ ・ うめのま」', en: '' }, prompt: { en: 'Which inn is he staying at?' }, options: [o('かみのゆ', 1), o('しものゆ', 0, 'かみ is the upper one: the Upper House.')] })],
    E: [ch({ item: 'g:prt_kara_made', ctx: { jp: '{鍵|かぎ} の {札|ふだ} ： 「{上|かみ}の{湯|ゆ} ・ {梅|うめ}の{間|ま} 。 {夕食|ゆうしょく} は {六時|ろくじ} から です 。」', en: '' }, prompt: { en: 'Where is he staying, and when does dinner start?' }, options: [o('{上|かみ}の{湯|ゆ} 。 {六時|ろくじ} から', 1), o('{上|かみ}の{湯|ゆ} 。 {六時|ろくじ} まで', 0, 'から: dinner starts at six.'), o('{下|しも}の{湯|ゆ} 。 {六時|ろくじ} から', 0, '上の湯 is the Upper House.')] })],
    I: [ch({ item: 'g:cond_tara', ctx: { jp: '{鍵|かぎ} の {札|ふだ} の {裏|うら} ： 「{上|かみ}の{湯|ゆ} 。 {門限|もんげん} は {十時|じゅうじ} です 。 {過|す}ぎたら 、 {裏口|うらぐち} の {鈴|すず} を {鳴|な}らして ください 。」 （もう {十時|じゅうじ} を {過|す}ぎて いる 。）', en: '' }, prompt: { en: 'It is past ten. How does he get back into the Upper House?' }, options: [o('{裏口|うらぐち} の {鈴|すず} を {鳴|な}らす', 1), o('{表|おもて} の {戸|と} を {叩|たた}く', 0, '過ぎたら: after ten, ring the bell at the back door.'), o('{朝|あさ} まで {待|ま}つ', 0, 'The tag says how to get in after ten.')] })],
    A: [ch({ item: 'g:keigo_sonkei', ctx: { jp: '{鍵|かぎ} の {札|ふだ} ： 「{上|かみ}の{湯|ゆ} ・ {梅|うめ}の{間|ま} 。 お{出|で}かけ の {際|さい} は 、 {鍵|かぎ} を {帳場|ちょうば} に お{預|あず}け ください 。」', en: '' }, prompt: { en: 'Where is his inn, and what does the tag ask of guests going out?' }, options: [o('{上|かみ}の{湯|ゆ} 。 {鍵|かぎ} を {帳場|ちょうば} に {預|あず}ける', 1), o('{上|かみ}の{湯|ゆ} 。 {鍵|かぎ} を {持|も}って {出|で}かける', 0, 'お預けください: leave it at the front desk.'), o('{梅|うめ}の{湯|ゆ} 。 {鍵|かぎ} を {帳場|ちょうば} に {預|あず}ける', 0, '梅の間 is his room; 上の湯 is the inn.')] })],
  } };
  C.challenges['yn.lw_rocks'] = { title: T('Under the cliff', '{崖|がけ} の {下|した}'), tiers: {
    F: [ch({ item: 'v:止まる', ctx: { jp: 'たてふだ ： 「この さき 、 いし が おちて きます 。 とまらないで ください 。」', en: '' }, prompt: { en: 'What does the sign ask?' }, options: [o('とまらないで あるく', 1), o('ここ で やすむ', 0, 'とまらないで: don\'t stop.')] })],
    E: [ch({ item: 'g:v_naide_kudasai', ctx: { jp: '{立|た}て{札|ふだ} ： 「この {先|さき} 、 {落石|らくせき} に {注意|ちゅうい} 。 {崖|がけ} の {下|した} で は 、 {立|た}ち{止|ど}まらないで ください 。」', en: '' }, prompt: { en: 'Where should you not stop?' }, options: [o('{崖|がけ} の {下|した}', 1), o('{道|みち} の {入|い}り{口|ぐち}', 0, 'The sign is about the foot of the cliff.')] })],
    I: [ch({ item: 'g:v_yasui_nikui', ctx: { jp: '{立|た}て{札|ふだ} ： 「{雨|あめ} の {翌日|よくじつ} は 、 {特|とく}に {石|いし} が {落|お}ちやすい 。」 （{昨日|きのう} は {一日中|いちにちじゅう} {雨|あめ} だった 。）', en: '' }, prompt: { en: 'It rained all day yesterday. What does that mean for today?' }, options: [o('{今日|きょう} は {特|とく}に {石|いし} が {落|お}ちやすい', 1), o('{今日|きょう} は {安全|あんぜん} だ', 0, '雨の翌日: the day after rain is the worst.')] })],
    A: [ch({ item: 'g:temo', ctx: { jp: '{湯守|ゆもり} の {書|か}き{付|つ}け ： 「{石|いし} の {落|お}ちる {音|おと} が {聞|き}こえない から と いって@言う 、 {安心|あんしん} して は いけない 。 この {山|やま} は 、 {音|おと} を {立|た}てず に {崩|くず}れる 。」', en: '' }, prompt: { en: 'What is the warning?' }, options: [o('{音|おと} が しなくて も 、 {石|いし} は {落|お}ちて くる', 1), o('{音|おと} が したら 、 {逃|に}げれば いい', 0, 'The mountain falls without a sound: you may hear nothing.'), o('この {山|やま} は {崩|くず}れない', 0, '音を立てずに崩れる: it does crumble, silently.')] })],
  } };
  C.challenges['yn.lw_herbs'] = { title: T('Kikue\'s list', 'キクエ の {書|か}き{付|つ}け'), tiers: {
    F: [ch({ item: 'g:counters', ctx: { jp: 'メモ ： 「ドクダミ ふたたば 。 センブリ みたば 。」 こども ： 「ドクダミ は ふたたば とった よ 。 センブリ は まだ ひとたば だけ 。」', en: '' }, prompt: { en: 'How many more bunches of senburi does the child need?' }, options: [o('ふたたば', 1), o('ひとたば', 0, 'They need three (みたば) and have one.'), o('みたば', 0, 'Three is the whole list; they have one already.')] })],
    E: [ch({ item: 'g:counters', ctx: { jp: 'メモ ： 「ドクダミ を {二束|ふたたば} 、 センブリ を {三束|みたば} 、 {摘|つ}んで きて ください 。 キクエ」', en: '' }, prompt: { en: 'What does Kikue want gathered?' }, options: [o('ドクダミ {二束|ふたたば} と センブリ {三束|みたば}', 1), o('ドクダミ {三束|みたば} と センブリ {二束|ふたたば}', 0, 'Read which number goes with which herb.'), o('センブリ だけ {五束|いつたば}', 0, 'Two herbs are on the list.')] })],
    I: [ch({ item: 'g:uchi_ni', ctx: { jp: 'メモ ： 「センブリ は 、 {花|はな} が {咲|さ}いて いる うち@内 に {摘|つ}む こと 。 {干|ほ}して から {使|つか}う 。」', en: '' }, prompt: { en: 'When should the senburi be picked?' }, options: [o('{花|はな} が {咲|さ}いて いる うち@内 に', 1), o('{花|はな} が {散|ち}って から', 0, '咲いているうちに: while it is still in flower.'), o('{干|ほ}して から {摘|つ}む', 0, 'It is dried after picking, before it is used.')] })],
    A: [ch({ item: 'g:v_nakereba', ctx: { jp: 'キクエ の {書|か}き{付|つ}け ： 「{無理|むり} に {全部|ぜんぶ} {集|あつ}めなくて も いい から 、 {暗|くら}く なる {前|まえ} に {帰|かえ}って くる こと 。」', en: '' }, prompt: { en: 'What matters most to Kikue?' }, options: [o('{暗|くら}く なる {前|まえ} に {帰|かえ}る こと', 1), o('{全部|ぜんぶ} {集|あつ}める こと', 0, '集めなくてもいい: they don\'t have to gather it all.')] })],
  } };
  C.challenges['yn.lw_note'] = { title: T('A note under the waystone', '{道標|みちしるべ} の {書|か}き{置|お}き'), tiers: {
    F: [ch({ item: 'v:待つ', ctx: { jp: 'かみ ： 「さき に いきます 。 かみのゆ で まって います 。 チエ」', en: '' }, prompt: { en: 'Where is Chie waiting?' }, options: [o('かみのゆ', 1), o('ここ', 0, 'さき に いきます: Chie has gone on ahead.')] })],
    E: [ch({ item: 'g:v_te_iru', ctx: { jp: '{紙|かみ} ： 「{先|さき} に {谷|たに} へ {下|お}ります 。 {上|かみ}の{湯|ゆ} で {待|ま}って います 。 チエ」', en: '' }, prompt: { en: 'Where will Chie be?' }, options: [o('{上|かみ}の{湯|ゆ}', 1), o('{道標|みちしるべ} の {所|ところ}', 0, '先に下ります: Chie has gone down to the valley.'), o('{下|しも}の{湯|ゆ}', 0, '上の湯 is the Upper House.')] })],
    I: [ch({ item: 'g:cond_tara', ctx: { jp: '{紙|かみ} ： 「{待|ま}って いた けれど 、 {来|こ}なかった ので 、 {先|さき} に {下|お}ります 。 {夕方|ゆうがた} まで に {来|こ}なかったら 、 {迎|むか}え に {来|き}ます 。 チエ」', en: '' }, prompt: { en: 'What will Chie do if their friend has not come down by evening?' }, options: [o('{迎|むか}え に {来|く}る', 1), o('{一人|ひとり} で {帰|かえ}る', 0, '来なかったら、迎えに来ます: Chie will come back for them.'), o('ここ で {待|ま}ち{続|つづ}ける', 0, '先に下ります: Chie has already gone down.')] })],
    A: [ch({ item: 'g:rashii', ctx: { jp: '{紙|かみ} ： 「この {道|みち} は {声|こえ} が {届|とど}かない らしい ので 、 {書|か}き{置|お}き に します 。 {上|かみ}の{湯|ゆ} に いる はず です 。 チエ」', en: '' }, prompt: { en: 'Why did Chie leave a note?' }, options: [o('この {道|みち} は {声|こえ} が {届|とど}かない らしい から', 1), o('{字|じ} を {書|か}く の が {好|す}き だ から', 0, 'The note gives its reason: ので.'), o('{上|かみ}の{湯|ゆ} が {見|み}えない から', 0, 'It is voices that do not carry here.')] })],
  } };

  L.scenes(`
@scene yn.lw_road_north_guest
# Road event (W5): the North Road's own, a lost guest of the Upper House
!look lw_genpachi pc
lw_genpachi: やあ 、 {人|ひと} が いて よかった 。 {静|しず}か な {道|みち} で 、 つい {歩|ある}きすぎて しまって ね 。 || Ah, thank goodness, a person. Such a quiet road, I walked on further than I meant.
lw_genpachi: {宿|やど} に {帰|かえ}りたい ん だ が 、 どこ の {宿|やど} だった か …… {鍵|かぎ} の {札|ふだ} を {読|よ}んで くれない か 。 {眼鏡|めがね} を {部屋|へや} に {置|お}いて きて しまって 。 || I'd like to get back to my inn, but which one was it… Would you read my key tag? I left my glasses in my room.
!challenge yn.lw_guest
!if var._res=0 -> later
narr: {札|ふだ} を {読|よ}んで 、 {谷|たに} へ {下|くだ}る {道|みち} を {指|さ}した 。 || You read him the tag and point down the road to the valley.
lw_genpachi[laugh]: そう そう 、 {上|かみ}の{湯|ゆ} だ ！ {湯|ゆ} に {浸|つ}かって いる と 、 {何|なん} でも {忘|わす}れて しまう ね 。 || That's it, the Upper House! Soak in those waters long enough and you forget everything.
!note lw_inn_yukata
!set lw_yn_north_guest_done
!hook road_done yn_north guest
!refresh
!end
:later
lw_genpachi: まあ 、 {急|いそ}ぐ {旅|たび} でも ない 。 もう {少|すこ}し 、 ここ で {思|おも}い{出|だ}して みる よ 。 || Well, I'm in no hurry. I'll stand here a while and try to remember.

@scene yn.lw_road_north_rocks
narr: {崖|がけ} の {下|した} に 、 {小|ちい}さな {石|いし} が {散|ち}らばって いる 。 {古|ふる}い {立|た}て{札|ふだ} が {傾|かたむ}いて いる 。 || Small stones lie scattered under the cliff. An old sign leans to one side.
!challenge yn.lw_rocks
!if var._res=0 -> later
narr: {立|た}ち{止|ど}まらず に 、 {崖|がけ} の {下|した} を {抜|ぬ}けた 。 {後|うし}ろ で 、 {小石|こいし} が {音|おと} も なく {転|ころ}がった 。 || You pass under the cliff without stopping. Behind you a pebble rolls down without a sound.
!hook road_done yn_north rocks
!end
:later
narr: {崖|がけ} を {見上|みあ}げる と 、 {首|くび} の {後|うし}ろ が {寒|さむ}く なった 。 {今日|きょう} は {引|ひ}き{返|かえ}そう 。 || You look up at the cliff and the back of your neck goes cold. Better turn back for today.

@scene yn.lw_road_north_herbs
narr: {道|みち} の {脇|わき} で 、 {子|こ}ども が {籠|かご} を {抱|かか}えて {草|くさ} を {摘|つ}んで いる 。 {紙|かみ} を {見|み}せて くる 。 || By the road a child with a basket is picking herbs, and holds out a sheet of paper.
!challenge yn.lw_herbs
!if var._res=0 -> later
narr: {一緒|いっしょ} に {数|かぞ}える と 、 {子|こ}ども は {籠|かご} を {抱|かか}え{直|なお}して 、 {谷|たに} の {方|ほう} へ {下|くだ}って いった 。 || You count it through together, and the child hugs the basket closer and sets off down to the valley.
!hook road_done yn_north herbs
!end
:later
narr: {子|こ}ども は {紙|かみ} を {見|み}つめた まま 、 {首|くび} を かしげて いる 。 || The child stares at the paper, head on one side.

@scene yn.lw_road_north_note
narr: {道標|みちしるべ} の {根元|ねもと} に {小石|こいし} が {積|つ}んで あり 、 {紙|かみ} が {挟|はさ}んで ある 。 {息|いき} を {切|き}らした {旅人|たびびと} が 、 それ を {覗|のぞ}き{込|こ}んで いる 。 || Pebbles are stacked at the foot of the waystone, a slip of paper tucked between them. A breathless traveller is peering at it.
!challenge yn.lw_note
!if var._res=0 -> later
narr: {紙|かみ} を {読|よ}んで {聞|き}かせる と 、 {旅人|たびびと} は ほっと した {顔|かお} で 、 {谷|たに} へ {下|くだ}って いった 。 || You read the note aloud, and with a look of relief the traveller heads down to the valley.
!hook road_done yn_north note
!end
:later
narr: {旅人|たびびと} は {紙|かみ} を {握|にぎ}った まま 、 {道|みち} の {上|うえ} と {下|した} を {見比|みくら}べて いる 。 || The traveller stands holding the note, looking up the road and down.
`);
})(RB.living, RB.content);
