/* Returns (expansion P15g; plan 10_STORY.md §10, sealed S8): what has changed in the older towns once the story is
 * over, in a twelve-chapter journey. Existing scenes are wrapped, never edited (the six-chapter game's are unchanged):
 *   Snowbell     the lamp-keeping rota on the hamlet's notice board (who is on it follows Hoshino's choice), and a
 *                letter from Akari, waiting at Sousuke's post shelter, to whoever keeps the lamp now (a reading task)
 *   Lanternfall  printed objections from Manybridge on a new board in the square (a reading task: what is objected to,
 *                and how politely), and the councillor on why the town has started importing them
 *   Manybridge   the broadsheet's last editions before Sanpei hands the press to the young ones: what the editions
 *                report follows what the player did (the Hall, the settlement, the guardians, the Archive)
 *   the Cloudroad the Mist Barrier become a teahouse, as its officer once laughed it might (ordering tea politely)
 *   Manybridge   the festival hall open again for the summer (the companions' beats there: 50_companions.js) */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  const ch = (o) => Object.assign({ kind: 'choose' }, o);
  const o = (jp, ok, why) => Object.assign({ jp, ok: !!ok }, why ? { why: { en: why } } : {});
  const e = (en, ok, why) => Object.assign({ en, ok: !!ok }, why ? { why: { en: why } } : {});
  const POST = 'ed>=2&postgame';
  const npc = (map, id) => (C.maps[map].npcs || []).find((n) => n.id === id && Array.isArray(n.talk));
  const wrapProp = (map, scene, to) => { for (const p of C.maps[map].props || []) if (p.scene === scene) p.scene = to; };

  // ---- Snowbell ---------------------------------------------------------------------------------------------------------
  wrapProp('sb.hamlet', 'sb.hamlet_board', 'rt.sb_board');
  const sous = npc('sb.post', 'sousuke');
  if (sous) sous.talk.unshift({ if: POST + '&!rt_akari_read', scene: 'rt.akari_letter' });
  C.challenges['rt.akari_letter'] = { title: T('A letter from Lanternfall', '{灯落|ひおち} から の {手紙|てがみ}'), tiers: {
    F: [ch({ item: 'g:v_te_kudasai', ctx: { jp: 'ゆきすず の ひ の ばん の みなさん へ 。 はる に 、 ひ を み に いきます 。 その よる は 、 ひ を つけて いて ください 。 あかり', en: '' }, prompt: T('What does Akari ask of the lamp-keepers?'),
      options: [e('To keep the lamp lit the night she comes, in spring.', 1), e('To put the lamp out.', 0, 'つけていてください: please keep it lit.')] })],
    E: [ch({ item: 'g:v_te_kudasai', ctx: { jp: '{雪鈴|ゆきすず} の {灯|ひ} の {番|ばん} の {皆|みな}さん へ 。 {春|はる} に 、 {灯|ひ} を {見|み} に {行|い}きます 。 その {夜|よる} は 、 {灯|ひ} を {点|つ}けて いて ください 。 アカリ', en: '' }, prompt: T('When is Akari coming, and what does she ask?'),
      options: [e('In spring; she asks them to keep the lamp lit that night.', 1), e('In winter; she asks them to meet her on the road.', 0, '{春|はる}に: in spring. She asks about the lamp.'), e('In spring; she asks them to send the lamp to Lanternfall.', 0, 'She is coming to see it: {見|み}に{行|い}きます.')] })],
    I: [ch({ item: 'g:te_oku', ctx: { jp: '{雪鈴|ゆきすず} の {灯|ひ} の {番|ばん} の {皆|みな}さん へ 。 {交代|こうたい} で {灯|ひ} を {守|まも}って いる と {聞|き}きました 。 {春|はる} に {道|みち} が {開|ひら}いたら 、 {見|み} に {行|い}きます 。 {迷|まよ}わない よう に 、 その {夜|よる} は {灯|ひ} を {点|つ}けて おいて ください 。 アカリ', en: '' }, prompt: T('Why does Akari ask them to leave the lamp lit?'),
      options: [e('So that she doesn\'t lose her way coming up at night.', 1), e('Because the lamp is hers.', 0, '{迷|まよ}わないように: so as not to get lost.'), e('So the hamlet can see her leave.', 0, 'She is arriving, not leaving.')] })],
    A: [ch({ item: 'g:you_ni_suru', ctx: { jp: '{雪鈴|ゆきすず} の {灯|ひ} の {番|ばん} の {皆|みな}さん へ 。 {交代|こうたい} で {灯|ひ} を {守|まも}って くださって いる と {伺|うかが}いました 。 {春|はる} に {道|みち} が {開|ひら}きましたら 、 {一度|いちど} {拝見|はいけん} に {参|まい}ります 。 {迷|まよ}わぬ よう 、 その {夜|よる} は {灯|ひ} を {点|つ}けて おいて いただけます でしょう か 。 アカリ', en: '' }, prompt: T('How does Akari speak of the keepers, and of herself?'),
      options: [e('She honours them (くださっている, いただけますでしょうか) and lowers herself (伺いました, 拝見に参ります).', 1), e('She honours herself and lowers them.', 0, '参ります and 伺いました are humble: her own doing.'), e('She writes plainly, with no honorifics.', 0, 'くださる, 伺う, 拝見 and 参る are all keigo.')] })],
  } };

  // ---- Lanternfall ------------------------------------------------------------------------------------------------------------
  C.maps['lf.town'].props.push({ p: 'noticeboard', x: 32, y: 17, if: POST, scene: 'rt.lf_objections' });
  const yae = npc('lf.council', 'lf_yae');
  if (yae) yae.talk.unshift({ if: POST + '&rt_lf_read&!seen.rt.yae_objections', scene: 'rt.yae_objections' });
  C.challenges['rt.lf_objections'] = { title: T('Printed objections', '{刷|す}られた {反対|はんたい} {意見|いけん}'), tiers: {
    F: [ch({ item: 'g:prt_ni', ctx: { jp: 'はし の ねだん に はんたい します 。 たかすぎます 。 やおばし の こめや', en: '' }, prompt: T('What does the rice-seller object to?'),
      options: [e('The price of the bridge toll: too high.', 1), e('The bridge itself.', 0, 'ねだんに はんたい: against the price.')] })],
    E: [ch({ item: 'g:prt_ni', ctx: { jp: '{橋|はし} の {通行料|つうこうりょう} に {反対|はんたい} します 。 {高|たか}すぎます 。 {八百橋|やおばし} の {米屋|こめや}', en: '' }, prompt: T('What does the rice-seller object to, and why?'),
      options: [e('The bridge toll, because it is too high.', 1), e('The rice price, because it is too low.', 0, '{通行料|つうこうりょう}に {反対|はんたい}: against the toll.'), e('Nothing: it is an advertisement.', 0, '{反対|はんたい}します: an objection.')] })],
    I: [ch({ item: 'g:indirectness', ctx: { jp: '{夜|よる} の {鐘|かね} の {数|かず} を {減|へ}らす {案|あん} に は 、 {少々|しょうしょう} {疑問|ぎもん} が あります 。 {八百橋|やおばし} の {船頭|せんどう} {一同|いちどう}', en: '' }, prompt: T('How strongly are the boatmen objecting?'),
      options: [e('Gently: they have "a few doubts" about ringing the night bell fewer times.', 1), e('Not at all: they agree.', 0, '{疑問|ぎもん}があります: they have doubts.'), e('Furiously.', 0, '{少々|しょうしょう}: "a little". It is softened on purpose.')] })],
    A: [ch({ item: 'g:lf_kaneru', ctx: { jp: '{夜|よる} の {鐘|かね} を {廃止|はいし} する {案|あん} に は 、 {賛成|さんせい} し かねます 。 {霧|きり} の {夜|よる} 、 {舟|ふね} は {鐘|かね} の {音|おと} で {岸|きし} を {知|し}る ため です 。 {八百橋|やおばし} の {船頭|せんどう} {一同|いちどう}', en: '' }, prompt: T('What are the boatmen saying, and on what grounds?'),
      options: [e('Politely that they cannot agree to stopping the night bell: in fog, boats find the bank by its sound.', 1), e('That they agree to stopping the bell.', 0, '{賛成|さんせい}しかねます is a polite "I cannot agree".'), e('That the bell is too loud for sleeping.', 0, 'Their reason is the fog: {舟|ふね}は{鐘|かね}の{音|おと}で{岸|きし}を{知|し}る.')] })],
  } };

  // ---- Manybridge's broadsheet --------------------------------------------------------------------------------------------------
  const sanpei = npc('mp.pressroom', 'mp_sanpei');
  if (sanpei) sanpei.talk.unshift({ if: POST, scene: 'rt.sanpei_last' });
  C.challenges['rt.headline'] = { title: T('The last edition', '{最後|さいご} の {瓦版|かわらばん}'), tiers: {
    F: [ch({ item: 'g:v_ta', ctx: { jp: 'やおばし の かわらばん 、 きょう で おわり 。 あした から は 、 わかい ひと が つくる 。', en: '' }, prompt: T('What is the news?'),
      options: [e('Today is the broadsheet\'s last edition; young people will make it from tomorrow.', 1), e('The broadsheet starts today.', 0, 'きょう で おわり: it ends today.')] })],
    E: [ch({ item: 'g:v_ta', ctx: { jp: '{八百橋|やおばし} の {瓦版|かわらばん} 、 {今日|きょう} で {最後|さいご} 。 {明日|あした} から は 、 {若|わか}い {者|もの} が {刷|す}る 。', en: '' }, prompt: T('What is the news?'),
      options: [e('Sanpei\'s last edition: from tomorrow the young ones print it.', 1), e('The press is closing for good.', 0, '{明日|あした}から は {若|わか}い {者|もの}が {刷|す}る: it carries on.'), e('The broadsheet will cost more.', 0, 'Nothing about price.')] })],
    I: [ch({ item: 'g:koto_ni_naru', ctx: { jp: '{瓦版|かわらばん} は 、 {明日|あした} から {若|わか}い {者|もの} が {刷|す}る こと に なった 。 {親方|おやかた} は 、 {字|じ} の {正|ただ}しさ だけ は {見|み}る と いう 。', en: '' }, prompt: T('What has been decided, and what will the old master still do?'),
      options: [e('The young ones will print it from tomorrow; the master will still check that the letters are right.', 1), e('The master will print it alone from tomorrow.', 0, '{若|わか}い{者|もの}が{刷|す}ることになった.'), e('The broadsheet will stop checking its letters.', 0, '{親方|おやかた}は {字|じ}の{正|ただ}しさ だけは {見|み}る.')] })],
    A: [ch({ item: 'g:adv_to_iu_yori', ctx: { jp: '{最後|さいご} の {瓦版|かわらばん} 、 と いう より 、 {最初|さいしょ} の {瓦版|かわらばん} の {続|つづ}き で ある 。 {字|じ} が {消|き}えなく なった {町|まち} で 、 {刷|す}る こと は もう {戦|たたか}い で は ない 。', en: '' }, prompt: T('What does the editorial say about this "last" edition?'),
      options: [e('It is less a last edition than a continuation: in a town where letters no longer fade, printing is no longer a fight.', 1), e('It is the true end of printing in Manybridge.', 0, 'というより: "rather than". It denies that this is an ending.'), e('Printing is still a fight against fading letters.', 0, '{戦|たたか}いではない: no longer a fight.')] })],
  } };

  // ---- the Cloudroad: the Mist Barrier become a teahouse ----------------------------------------------------------------------
  const B = C.maps['cr.barrier'];
  B.props.push({ p: 'teaset', x: 7, y: 17, if: POST, scene: 'rt.teahouse' }, { p: 'teaset', x: 11, y: 17, if: POST, scene: 'rt.teahouse' },
    { p: 'bench', x: 5, y: 18, if: POST }, { p: 'bench', x: 12, y: 18, if: POST }, { p: 'lantern', x: 9, y: 16, if: POST, o: { lit: true } });
  const gonza = B.npcs.find((n) => n.id === 'cr_gonza');
  if (gonza && !gonza.if) gonza.if = '!postgame';
  B.npcs.push({ id: 'cr_gonza_t', char: 'cr_gonza', x: 9, y: 18, dir: 'up', if: POST, talk: 'rt.teahouse' });
  const ujie = npc('cr.barrier_office', 'cr_ujie');
  if (ujie) ujie.talk.unshift({ if: POST, scene: 'rt.ujie_tea' });
  C.challenges['rt.tea_order'] = { title: T('Ordering tea', 'お{茶|ちゃ} を {頼|たの}む'), tiers: {
    F: [ch({ item: 'g:v_te_kudasai', prompt: T('Ask for a cup of tea and one dumpling.'),
      options: [o('おちゃ を ひとつ と 、 だんご を ひとつ ください 。', 1), o('おちゃ を ひとつ と 、 だんご を ふたつ ください 。', 0, 'One dumpling: ひとつ.')] })],
    E: [ch({ item: 'g:counters', prompt: T('Ask for two cups of tea (one for your companion) and three dumplings.'),
      options: [o('お{茶|ちゃ} を {二|ふた}つ と 、 {団子|だんご} を {三|みっ}つ お{願|ねが}いします 。', 1), o('お{茶|ちゃ} を {三|みっ}つ と 、 {団子|だんご} を {二|ふた}つ お{願|ねが}いします 。', 0, 'Two teas, three dumplings: the other way round.'), o('お{茶|ちゃ} を {二杯|にはい} {飲|の}みました 。', 0, 'That says you drank two cups.')] })],
    I: [ch({ item: 'g:v_temo_ii', prompt: T('Ask whether you may sit on the bench outside while you drink.'),
      options: [o('{外|そと} の {長椅子|ながいす} で {飲|の}んで も いい です か 。', 1), o('{外|そと} の {長椅子|ながいす} で {飲|の}んで は いけません 。', 0, 'That forbids it.'), o('{外|そと} の {長椅子|ながいす} を {買|か}って も いい です か 。', 0, 'That asks to buy the bench.')] })],
    A: [ch({ item: 'g:keigo_kenjo', prompt: T('Ask, very politely, for the tea the barrier was famous for, if it is still served.'),
      options: [o('{関所|せきしょ} の {頃|ころ} の お{茶|ちゃ} が まだ ございましたら 、 {一杯|いっぱい} いただけます でしょう か 。', 1), o('{関所|せきしょ} の {頃|ころ} の お{茶|ちゃ} を 、 {一杯|いっぱい} {召|め}し{上|あ}がります 。', 0, '召し上がる honours the eater; for yourself, いただく.'), o('{関所|せきしょ} の {頃|ころ} の お{茶|ちゃ} 、 {早|はや}く {出|だ}せ 。', 0, 'A bare command to a host.')] })],
  } };

  // ---- Manybridge's festival hall, open again ----------------------------------------------------------------------------------
  const hall = C.maps['mp.festhall'];
  const tomi = hall.npcs.find((n) => n.id === 'mp_tomi_h');
  if (tomi) tomi.talk = [{ if: POST, scene: 'rt.tomi_post' }, { scene: 'mp.tomi_hall' }];

  RB.script.add(`
@scene rt.sb_board
!call sb.hamlet_board
!if !ed>=2|!postgame -> end
narr: {真|ま}ん{中|なか} に 、 {新|あたら}しい {紙|かみ} 。 「 {天文台|てんもんだい} の {灯|ひ} の {当番|とうばん} 」 。 || In the middle, a new sheet: "Observatory lamp: whose night it is."
?(sb_hoshino_stays) narr: 「 ホシノ 、 カンタ 、 フキ 、 サチ 。 {順番|じゅんばん} に 」 。 {一番|いちばん} {上|うえ} の {名前|なまえ} だけ 、 {字|じ} が {震|ふる}えて いる 。 || "Hoshino, Kanta, Fuki, Sachi. In turn." Only the first name is written in a shaky hand.
?(sb_hoshino_goes) narr: 「 カンタ 、 フキ 、 サチ 、 ソウスケ 。 {順番|じゅんばん} に 」 。 {下|した} に 、 {灯落|ひおち} から の {字|じ} で 「 ホシノ 、 {遠|とお}く から {見|み}て いる 」 。 || "Kanta, Fuki, Sachi, Sousuke. In turn." Underneath, in a hand from Lanternfall: "Hoshino, watching from afar."
?(sb_hoshino_both) narr: 「 {春|はる} から {秋|あき} は ホシノ 。 {冬|ふゆ} は カンタ 、 フキ 、 サチ 。 {順番|じゅんばん} に 」 。 || "Spring to autumn: Hoshino. Winter: Kanta, Fuki, Sachi, in turn."
?(!sb_hoshino_stays&!sb_hoshino_goes&!sb_hoshino_both) narr: 「 カンタ 、 フキ 、 サチ 。 {順番|じゅんばん} に 」 。 || "Kanta, Fuki, Sachi. In turn."
?(comp&comp!=ren) comp: {一人|ひとり} で {待|ま}つ {灯|ひ} じゃ なく なった ん だ ね 。 || It isn't a lamp that waits alone any more.
?(comp=ren) comp: {一人|ひとり} で {待|ま}つ {灯|ひ} で は 、 なく なった ん です ね 。 || It isn't a lamp that waits alone any more.
:end

@scene rt.akari_letter
sousuke: {灯落|ひおち} から 、 {灯|ひ} の {番|ばん} {宛|あ}て の {手紙|てがみ} が {届|とど}いて います 。 {当番|とうばん} の {人|ひと} に {渡|わた}す の が {筋|すじ} です が 、 {一緒|いっしょ} に {読|よ}みます か 。 || A letter's come from Lanternfall, addressed to the lamp-keepers. It ought to go to whoever's on duty, but would you read it with me?
!challenge rt.akari_letter
!if var._res=0 -> later
!set rt_akari_read
sousuke: {春|はる} の {最初|さいしょ} の {夜|よる} は 、 {皆|みんな} で {番|ばん} を しましょう 。 {当番|とうばん} {表|ひょう} に 、 {一行|いちぎょう} {足|た}して おきます 。 || On the first night of spring, we'll all keep watch together. I'll add a line to the rota.
!end
:later
sousuke: {急|いそ}ぐ {手紙|てがみ} で は ありません 。 また {今度|こんど} 。 || It's not an urgent letter. Another time.

@scene rt.lf_objections
narr: {広場|ひろば} の {新|あたら}しい {掲示板|けいじばん} 。 {八百橋|やおばし} で {刷|す}られた {反対|はんたい} {意見|いけん} が 、 {何枚|なんまい} も {貼|は}って ある 。 || A new board in the square, covered in objections printed in Manybridge.
!challenge rt.lf_objections
!if var._res=0 -> later
!set rt_lf_read
narr: {誰|だれ} か が 、 {下|した} に {書|か}き{足|た}して いる 。 「 {印刷|いんさつ} の {反対|はんたい} {意見|いけん} に 、 {反対|はんたい} 」 。 || Someone has added underneath: "Against printed objections."
!end
:later
narr: {貼|は}り{紙|がみ} は 、 また {後|あと} で {読|よ}もう 。 || You can read the notices later.

@scene rt.yae_objections
lf_yae: {八百橋|やおばし} の {反対|はんたい} {意見|いけん} は 、 {字|じ} が きれい で 、 {読|よ}みやすい の よ 。 {手書|てが}き の {反対|はんたい} は 、 {半分|はんぶん} {読|よ}めない から 。 || Manybridge's objections are neatly printed and easy to read. Half the handwritten ones, you can't make out.
lf_yae: {議会|ぎかい} で は 、 {今|いま} 、 {反対|はんたい} {意見|いけん} を {輸入|ゆにゅう} する こと に {反対|はんたい} する {人|ひと} が いる わ 。 {健全|けんぜん} な {町|まち} です よ 。 || In the council, someone now objects to importing objections. A healthy town.
!call lf.yae_post

@scene rt.sanpei_last
!faceplayer
mp_sanpei: {最後|さいご} の {何枚|なんまい} か は 、 {自分|じぶん} で {刷|す}る こと に した ん です 。 {明日|あした} から は 、 カケル たち に {任|まか}せます 。 || I've decided to print the last few myself. From tomorrow, Kakeru and the others take over.
?(hall.w10) mp_sanpei: {一枚目|いちまいめ} は 「 {百物語|ひゃくものがたり} の {館|やかた} 、 {百|ひゃく} の {灯|ひ} が {戻|もど}る 」 。 || The first: "The Hall of a Hundred Tales: all hundred lights back."
?(as_fest_done) mp_sanpei: 「 {葦原|あしはら}{新田|しんでん} 、 {最初|さいしょ} の {祭|まつ}り 」 。 {名前|なまえ} だけ だった {村|むら} が 、 {村|むら} に なった そう です よ 。 || "Ashihara Shinden holds its first festival." A village that was only a name has become a village, they say.
?(gd.mb) mp_sanpei: 「 {最初|さいしょ} の {橋|はし} に 、 {名前|なまえ} 、 {刻|きざ}み{直|なお}される 」 。 {町|まち} {中|じゅう} で {一番|いちばん} {売|う}れました 。 || "A name recut on the first bridge." Our best seller in town.
?(end_archive_library) mp_sanpei: 「 {静寂|しじま} の {書庫|しょこ} 、 {今月|こんげつ} の {読者|どくしゃ} 、 {千人|せんにん} を {超|こ}える 」 。 || "The Still Archive: over a thousand readers this month."
?(end_archive_closed) mp_sanpei: 「 {静寂|しじま} の {書庫|しょこ} 、 {扉|とびら} は {閉|と}じた まま 。 {麓|ふもと} の {小屋|こや} で 、 {写|うつ}し を {読|よ}む {人|ひと} が {絶|た}えず 」 。 || "The Still Archive's doors stay shut. At the hut below, a steady stream of people reading the copies."
!challenge rt.headline
?(var._res=1) mp_sanpei: {字|じ} が {消|き}えない {町|まち} の {瓦版|かわらばん} 。 {最後|さいご} に それ を {刷|す}れて 、 よかった 。 || A broadsheet in a town where letters don't fade. I'm glad that's the last thing I printed.

@scene rt.teahouse
!faceplayer
cr_gonza: いらっしゃい 。 {関所|せきしょ} は やめた 。 {今|いま} は {茶屋|ちゃや} だ 。 {手形|てがた} は {要|い}らん 。 {注文|ちゅうもん} だけ {聞|き}く 。 || Welcome. No more barrier. It's a teahouse now. No papers needed. Just your order.
!challenge rt.tea_order
!if var._res=0 -> later
!set rt_tea_had
cr_gonza: {霧|きり} の {日|ひ} は 、 {関所|せきしょ} の {頃|ころ} より {客|きゃく} が {多|おお}い 。 {皆|みんな} 、 {急|いそ}がなく なった から な 。 || On misty days there are more customers than there ever were at the barrier. Nobody's in a hurry now.
?(comp=nao) comp: {昔|むかし} は ここ で {止|と}められて 、 {今|いま} は ここ で {休|やす}む 。 {変|へん} な {感|かん}じ だ な 。 || Once you got stopped here, now you stop to rest here. Strange feeling.
!end
:later
cr_gonza: {急|いそ}ぎ なら 、 {帰|かえ}り に また {寄|よ}れ 。 || In a hurry? Stop on your way back, then.

@scene rt.ujie_tea
!faceplayer
cr_ujie: {笑|わら}い{話|ばなし} の つもり でした が 、 {本当|ほんとう} に {茶屋|ちゃや} に なりました 。 ゴンザ の お{茶|ちゃ} は 、 {関所|せきしょ} の {頃|ころ} より うまい 。 || I meant it as a joke, but it really has become a teahouse. Gonza's tea is better than it ever was in the barrier days.
!call cr.ujie_after

@scene rt.tomi_post
!faceplayer
mp_tomi: {会所|かいしょ} を 、 {今年|ことし} も {開|あ}けました 。 {夏|なつ} の {間|あいだ} 、 {屋台|やたい} の {遊|あそ}び は ずっと ここ で 。 || We've opened the festival hall again this year. All summer long, the stall games are here.
?(rt_troupe_seen) mp_tomi: {旅|たび} の {一座|いちざ} が {寄|よ}って くれて 、 {会所|かいしょ} が {一番|いちばん} {賑|にぎ}やか な {夏|なつ} に なった わ 。 || A travelling troupe stopped by, and it's been the liveliest summer the hall has ever had.
`);
})(RB.content);
