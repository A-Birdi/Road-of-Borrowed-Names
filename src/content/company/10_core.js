/* Companionship content, part 1: what the player knows of each companion, the
 * story memories (setting out, the chapters, the long roads, their own quest),
 * the callbacks What We Keep can use, and their words on meeting an animal.
 * Rules: src/engine/58_companion.js. Canon: docs/STORY.md and the scenes quoted.
 *
 * A memory's reply is what the companion actually said at that moment in the
 * existing scene (quoted), so a reconstructed memory never invents words. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (CC) {
  'use strict';
  const T = (jp, en) => ({ jp, en });

  // ---- what the player knows (only what the journey has shown) ------------------------------------------
  CC.bios.nao = {
    first: T('{道|みち} を {知|し}ってる 。 {逃|に}げ{道|みち} も 。 {相手|あいて} が {次|つぎ} に {何|なに} を する か 、 だいたい {読|よ}める 。', 'I know the roads. The escape routes too. And I can usually read what someone\'s going to do next.'),
    summary: [
      { en: 'A courier who knows the road west — the bridges, the shortcuts, where to shelter from rain.' },
      { en: 'Checks where the exits are, even while listening.' },
      { en: 'Set the terms on the first day: Nao picks the road, you pick the destination.' },
      { en: 'Carries a letter at the bottom of the satchel that Nao decided not to deliver.', when: '!quest.lf_nao=done' },
      { en: 'Keeps every address label ever rewritten, bundled in a flat tin. Sentimental about handwriting, and would rather you didn\'t laugh.', when: 'seen.sb.quiet_nao|seen.sa.end_comp' },
      { en: 'Delivered Isamu\'s letter a year late and let Umi decide. Her reply was one line: "I read it."', when: 'quest.lf_nao=done' },
      { en: 'Since the Snowbell pass, moves on an opening without waiting for your signal.', when: 'lq_ally1' },
      { en: 'Since Koharuno, counts whatever comes for you as coming for Nao too — and takes half.', when: 'lq_ally2' },
    ],
  };
  CC.bios.mio = {
    first: T('{私|わたし} に できる の は 、 {傷|きず} の {手当|てあ}て と 、 {薬|くすり} の {調合|ちょうごう} と …… {人|ひと} の {話|はなし} を {聞|き}く こと くらい です 。', 'What I can do is tend wounds, mix medicines, and… listen to people, I suppose.'),
    summary: [
      { en: 'Reedwake\'s apothecary: tends wounds, mixes medicines, and listens.' },
      { en: 'Straightens things while thinking — bottles, labels, sometimes a stranger\'s shelf.' },
      { en: 'Left the shop key with Tsuru to come with you, and asked you not to take her home if she wavered.' },
      { en: 'Finds it very hard to say no to anyone who asks.', when: '!quest.lf_mio=done' },
      { en: 'Has thirty-one numbered rules (or thirty-two, now) and exactly one jar with no label.', when: 'seen.sb.quiet_mio' },
      { en: 'Said "I refuse" out loud in Lanternfall, where no one could, and would not make the medicine that silences people.', when: 'quest.lf_mio=done' },
      { en: 'Since the Snowbell pass, moves in a fight before you have to ask.', when: 'lq_ally1' },
      { en: 'Since Koharuno, stays right beside you when things are hard.', when: 'lq_ally2' },
    ],
  };
  CC.bios.ren = {
    first: T('{灯守|ひもり} と して 、 {西|にし} の {灯|あか}り を {確|たし}かめたい 。 それ が {第一|だいいち} の {理由|りゆう} です 。', 'As a keeper, I want to check the western lanterns. That\'s my first reason.'),
    summary: [
      { en: 'Reedwake\'s lantern keeper. The lamp is polished far better than the boots.' },
      { en: 'Remembers every word Master Ushio taught, but not the teacher\'s face.' },
      { en: 'Earnest and precise, with a deadpan pun when comfortable — and, by Ren\'s own admission, a terrible sense of direction.' },
      { en: 'Recites one of the teacher\'s sayings each night: "A name to the lamp, the lamp to people, people to the name."', when: 'seen.sb.quiet_ren|sb_ren_ushio1' },
      { en: 'Took back the teacher\'s face at the Archive — smiling, eyebrows thicker than expected — and the last quarrel with it.', when: 'sa_ren_took' },
      { en: 'Left the teacher\'s face on the Archive shelf for now, keeping the lessons: choosing not to choose, which is not quite running away.', when: 'sa_ren_left' },
      { en: 'Since the Snowbell pass, raises the light before being asked.', when: 'lq_ally1' },
      { en: 'Since Koharuno, stands in front of you in a fight.', when: 'lq_ally2' },
    ],
  };
  CC.bios.suzu = {
    first: T('{私|わたし} を {選|えら}ぶ と 、 {道中|どうちゅう} ずっと {退屈|たいくつ} しない ！ {歌|うた} も {芝居|しばい} も {手品|てじな} も つく よ 。', 'Choose me and you\'ll never be bored on the road! Songs, plays and conjuring tricks included.'),
    summary: [
      { en: 'A travelling performer who answers a hard question with a joke first — and then, usually, the truth.' },
      { en: 'Says that being good at lying makes her good at seeing through lies.' },
      { en: 'Keeps meticulous accounts of every debt, down to a single borrowed needle.' },
      { en: 'Once told a little boy in Cinder Orchard a comforting lie, and has carried it as a debt for twenty years.', when: 'quest.co_suzu>=1&!quest.co_suzu=done' },
      { en: 'Told Hiro the truth. The account book now says "Paid in part" — twenty festivals, one at a time.', when: 'quest.co_suzu=done' },
      { en: 'Keeps a last page in the book for debts money can\'t repay. Your name is on it.', when: 'seen.sb.quiet_suzu' },
      { en: 'Since the Snowbell pass, steps out on her own cue.', when: 'lq_ally1' },
      { en: 'Since Koharuno, draws every eye when something takes aim at you.', when: 'lq_ally2' },
    ],
  };

  // ---- story memories -----------------------------------------------------------------------------------------
  const RW_HALL = T('{葦|あし}ノ{瀬|せ} の {灯|あか}り{堂|どう}', 'The Lantern Hall, Reedwake');
  CC.mem.recruit = {
    title: T('{灯|あか}り に {二|ふた}つ の {名前|なまえ}', 'Two names on the lantern'), place: RW_HALL,
    text: T('{旅|たび} の {灯|あか}り の {紙|かみ} に 、 {二|ふた}つ の {名前|なまえ} を {書|か}いた 。 $name 。 そして 、 $comp 。', 'You wrote two names on the travelling lantern\'s paper: yours, and $comp\'s.'),
    reply: {
      nao: T('よし 。 {道|みち} は {俺|おれ} に {任|まか}せろ 。 {行|い}き{先|さき} は 、 あんた が {決|き}めろ 。', 'Right. Leave the road to me. You decide where we\'re going.'),
      mio: T('{店|みせ} の {鍵|かぎ} 、 ツル さん に {渡|わた}して きます 。 …… {不思議|ふしぎ} です 。 {怖|こわ}い のに 、 {少|すこ}し {楽|たの}しい 。', 'I\'ll give the shop key to Tsuru. …How strange. I\'m scared, and yet a little excited.'),
      ren: T('{灯|あか}り の {持|も}ち{手|て} は 、 {私|わたし} が {磨|みが}いて おきます 。 {靴|くつ} より {先|さき} に 。 {当然|とうぜん} です 。', 'I\'ll polish the lantern\'s handle. Before my boots, naturally.'),
      suzu: T('{開幕|かいまく} ！ …… ふふ 、 {一度|いちど} {言|い}って みたかった の 。', 'Curtain up! …Heh. I always wanted to say that.'),
    },
    keep: {
      nao: T('{灯|あか}り{堂|どう} で あんた が {声|こえ} を かけた {日|ひ} 。 {道|みち} は {俺|おれ} 、 {行|い}き{先|さき} は あんた 。 {今|いま} でも 、 それ で いい と {思|おも}ってる 。', 'The day you asked me, in the Lantern Hall. Me the road, you the destination. I still think that\'s right.'),
      mio: T('{灯|あか}り{堂|どう} で 、 {一緒|いっしょ} に {来|き}て ほしい と {言|い}われた {時|とき} 。 {怖|こわ}い のに {楽|たの}しかった 。 {今|いま} は 、 {楽|たの}しい ほう が {多|おお}い です 。', 'When you asked me to come, in the Lantern Hall. I was scared and excited at once. These days it\'s mostly excited.'),
      ren: T('{灯|あか}り{堂|どう} で 、 {旅|たび} の {終|お}わり まで {隣|となり} に いる と {約束|やくそく} した こと 。 {道|みち} に {迷|まよ}う の も {隣|となり} で 。 {今|いま} の ところ 、 {両方|りょうほう} {守|まも}れて います 。', 'Promising, in the Lantern Hall, to be at your side to the end — getting lost included. So far I\'ve kept both halves.'),
      suzu: T('{開幕|かいまく} の {日|ひ} 。 {灯|あか}り{堂|どう} で 、 あなた が {私|わたし} を {配役|はいやく} して くれた {日|ひ} 。', 'Opening night. The day you cast me, in the Lantern Hall.'),
    },
  };
  CC.mem.ch2 = {
    title: T('{手紙|てがみ} の {雨|あめ}', 'The rain of letters'), place: T('{潮硝子|しおがらす}', 'Saltglass'),
    text: T('{沈|しず}んだ {書庫|しょこ} が 「 {返送|へんそう} 」 した {名前|なまえ} が 、 {手紙|てがみ} の {雨|あめ} に なって {港|みなと} に {戻|もど}った 。 {渡|わた}し{船|ぶね} が また {動|うご}く 。', 'The names the Drowned Archive had "returned" came back over the harbour as a rain of letters. The ferry runs again.'),
    reply: {
      nao: T('{宛名|あてな} の {読|よ}める {手紙|てがみ} を 、 {読|よ}めない {箱|はこ} に {入|い}れる 。 …… {同|おな}じ こと を した こと が ある 。 {一回|いっかい} だけ 。', 'Putting a letter with a readable address in the unreadable box. …I\'ve done the same thing. Once.'),
      mio: T('オウミ さん みたい に 、 {優|やさ}しくて {厳|きび}しい の って 、 {難|むずか}しい ね 。 …… {明日|あした} から 、 {練習|れんしゅう} して みる 。', 'Being kind and strict at once, like Ōmi — it\'s hard. …I\'ll start practising tomorrow.'),
      ren: T('…… ええ 。 だと すれば 、 {取|と}り{戻|もど}せる かも しれません 。 {返送|へんそう} は {取|と}り{消|け}せる と 、 {今日|きょう} {分|わ}かりました から 。', '…Yes. And if so, it might be retrieved. Today we learned that a return can be cancelled.'),
      suzu: T('{嘘|うそ} に は 、 {帳簿|ちょうぼ} に {書|か}けない {嘘|うそ} も ある の 。 {人|ひと} を {慰|なぐさ}める ため の やつ 。 {利子|りし} が {見|み}えない から 、 {返|かえ}す {日|ひ} が {分|わ}からない 。', 'Some lies can\'t go in a ledger. The ones you tell to comfort someone. You can\'t see the interest, so you never know when it falls due.'),
    },
    keep: {
      nao: T('{潮硝子|しおがらす} の {手紙|てがみ} の {雨|あめ} 。 {宛先|あてさき} に {帰|かえ}る {手紙|てがみ} を 、 あんな に {一度|いちど} に {見|み}た の は {初|はじ}めて だ 。', 'The rain of letters over Saltglass. I\'d never seen so many letters going home at once.'),
      mio: T('{潮硝子|しおがらす} の {夜|よる} 。 {優|やさ}しくて {厳|きび}しい の は {難|むずか}しい 、 って {話|はな}しました よね 。 {練習|れんしゅう} 、 {少|すこ}し は できて います か 。', 'That night in Saltglass, when I said being kind and strict at once is hard. Have I got any better at it, do you think?'),
      ren: T('{潮硝子|しおがらす} で 、 {返送|へんそう} は {取|と}り{消|け}せる と {知|し}った {日|ひ} 。 あの {日|ひ} から 、 {待|ま}つ だけ の {灯守|ひもり} を やめました 。', 'The day in Saltglass we learned a return can be cancelled. Since then I\'ve stopped being a keeper who only waits.'),
      suzu: T('{潮硝子|しおがらす} で 、 {帳簿|ちょうぼ} に {書|か}けない {嘘|うそ} の {話|はなし} を した {夜|よる} 。 {灯台|とうだい} の {光|ひかり} が 、 {一周|いっしゅう} して {戻|もど}って きた 。', 'The night in Saltglass I told you about lies that can\'t go in a ledger. The lighthouse beam went all the way round and came back.'),
    },
  };
  CC.mem.ch3 = {
    title: T('{火|ひ} を {思|おも}い{出|だ}した {里|さと}', 'The orchard remembers the fire'), place: T('{灰実|はいみ} の {里|さと}', 'Cinder Orchard'),
    text: T('{灰実|はいみ} の {里|さと} は 、 {火事|かじ} の {記憶|きおく} を {取|と}り{戻|もど}し 、 {防火帯|ぼうかたい} を {作|つく}り{直|なお}す こと を {選|えら}んだ 。', 'Cinder Orchard chose to take back the memory of the fire, and to rebuild its firebreaks.'),
    reply: {
      nao: T('{悲|かな}しみ を {預|あず}かる 、 か 。 {頼|たの}まれて も いない {荷物|にもつ} まで {運|はこ}んで いった ん だ 。 {配達人|はいたつにん} と して は 、 {許|ゆる}せない な 。', 'Keeping people\'s grief. And carrying off parcels nobody asked it to take. As a courier, I can\'t forgive that.'),
      mio: T('{最初|さいしょ} は 、 {優|やさ}しさ だった の かも しれません 。 …… {優|やさ}しさ も 、 {量|りょう} を {間違|まちが}えれば {毒|どく} です 。', 'Maybe it began as kindness. …But even kindness is poison in the wrong dose.'),
      ren: T('{北|きた} の {山|やま} の {上|うえ} です ね 。 {記録|きろく} に よれば 。 …… {道|みち} は 、 {私|わたし} が {案内|あんない} しない ほう が いい でしょう 。', 'Up in the northern mountains, according to the records. …It\'s probably best if I don\'t lead.'),
      suzu: T('{預|あず}かる って 、 {返|かえ}す {約束|やくそく} の {言葉|ことば} の はず な のに ね 。 {返|かえ}して もらい に {行|い}こう 。 {全部|ぜんぶ} 。', '"Keeping" something is supposed to mean you\'ll give it back. Let\'s go and get it all back.'),
    },
    keep: {
      nao: T('{灰実|はいみ} で 、 {里|さと} の {人|ひと} たち が {火事|かじ} を {思|おも}い{出|だ}す と {決|き}めた こと 。 {重|おも}い {荷物|にもつ} を 、 {自分|じぶん} で {受|う}け{取|と}り に {行|い}った ん だ 。 {頭|あたま} が {下|さ}がる よ 。', 'In Cinder Orchard, the village deciding to remember the fire. They went to collect a heavy parcel themselves. I take my hat off to that.'),
      mio: T('{灰実|はいみ} の {人|ひと} たち が 、 {痛|いた}い {記憶|きおく} を {取|と}り{戻|もど}す と {決|き}めた {日|ひ} 。 {痛|いた}み を {消|け}す だけ が {薬|くすり} じゃ ない と 、 あの {日|ひ} {思|おも}いました 。', 'The day the people of Cinder Orchard chose to take back a painful memory. That day I thought: taking pain away isn\'t all that medicine is for.'),
      ren: T('{灰実|はいみ} で 、 {記録|きろく} から {消|き}えた {火事|かじ} が {戻|もど}った こと 。 {記録|きろく} は {正確|せいかく} な だけ で は {足|た}りない と 、 あの {里|さと} で {知|し}りました 。', 'In Cinder Orchard, the fire that had vanished from the records coming back. That village taught me a record needs more than accuracy.'),
      suzu: T('{灰実|はいみ} の {秋祭|あきまつ}り 。 {二十年|にじゅうねん} {前|まえ} に {踊|おど}る はず だった {演目|えんもく} を 、 やっと {踊|おど}れた の 。', 'The autumn festival in Cinder Orchard. I finally danced the piece I was meant to dance twenty years ago.'),
    },
  };
  CC.mem.ch4 = {
    title: T('{雪鈴|ゆきすず} の {灯|あか}り', 'The Snowbell lamp'), place: T('{雪鈴|ゆきすず}', 'Snowbell'),
    text: T('{天文台|てんもんだい} の {灯|あか}り が また ともり 、 その {光|ひかり} が {灯落|ひおち} の {方|ほう} へ {届|とど}いた 。 {宛名|あてな} が {戻|もど}った 。', 'The observatory lamp burns again, and its light reaches toward Lanternfall. The addresses came back.'),
    reply: {
      nao: T('$name 。 {灯落|ひおち} に {着|つ}いたら 、 {話|はな}す こと が ある 。 {鞄|かばん} の {底|そこ} の {手紙|てがみ} の こと だ 。', '$name. When we get to Lanternfall, there\'s something I\'ll tell you. About the letter at the bottom of my bag.'),
      mio: T('みんな の {顔|かお} 、 {明|あか}るい です ね 。 {灯|あか}り の せい だけ じゃ なくて 。', 'Everyone looks so bright. And not only because of the lamp.'),
      ren: T('…… {南東|なんとう} の {光|ひかり} も 、 {見|み}えて います 。 {灯落|ひおち} の {上|うえ} 。 {師匠|ししょう} の {顔|かお} の {残|のこ}り が ある {場所|ばしょ} 。 {急|いそ}ぎません 。 でも 、 {行|い}きます 。', '…The light in the southeast is visible too. Above Lanternfall. Where the rest of my teacher\'s face is. I won\'t rush. But I will go.'),
      suzu: T('{満員|まんいん} の {客席|きゃくせき} が 、 {舞台|ぶたい} を {見上|みあ}げてる 。 {役者|やくしゃ} {冥利|みょうり} に {尽|つ}きる ね 。 {灯|あか}り の ほう が 。', 'A packed house, all looking up at the stage. What an honour for the performer. The lamp, I mean.'),
    },
    keep: {
      nao: [
        { when: 'seen.sb.quiet_nao', jp: '{雪鈴|ゆきすず} の {宿|やど} の {夜|よる} 。 {風|かぜ} が {戸|と} を {叩|たた}く {音|おと} で {眠|ねむ}れなくて 、 {誰|だれ} に も {見|み}せた こと の ない {缶|かん} を {開|あ}けた 。', en: 'That night at the Snowbell inn. The wind knocking at the door kept me awake, and I opened the tin I\'d never shown anyone.' },
        T('{雪鈴|ゆきすず} の {夜|よる} 。 {宛名|あてな} が {戻|もど}った {夜|よる} だ 。', 'That night in Snowbell. The night the addresses came back.'),
      ],
      mio: [
        { when: 'seen.sb.quiet_mio', jp: '{雪鈴|ゆきすず} の {宿|やど} で 、 {眠|ねむ}れなかった {夜|よる} 。 ラベル の ない {瓶|びん} の {話|はなし} を 、 {初|はじ}めて {人|ひと} に しました 。', en: 'The night I couldn\'t sleep at the Snowbell inn. It was the first time I told anyone about the jar with no label.' },
        T('{雪鈴|ゆきすず} で 、 {灯|あか}り が また ともった {夜|よる} 。 みんな の {顔|かお} が {明|あか}るかった 。', 'The night the lamp in Snowbell lit again. Everyone\'s faces were so bright.'),
      ],
      ren: [
        { when: 'sb_ren_ushio1', jp: '{雪鈴|ゆきすず} の {天文台|てんもんだい} で 、 {師匠|ししょう} の {似顔絵|にがおえ} を {見|み}た こと 。 {知|し}らない {人|ひと} の {顔|かお} に {見|み}えた の が 、 {正直|しょうじき} 、 {一番|いちばん} {怖|こわ}かった 。', en: 'Seeing my teacher\'s portrait in the Snowbell observatory. Honestly, what frightened me most was that it looked like a stranger.' },
        T('{雪鈴|ゆきすず} で 、 {石段|いしだん} の {灯|あか}り が {上|うえ} の {灯|あか}り を {呼|よ}んで いた {夜|よる} 。', 'The night in Snowbell when the stair lanterns called to the lamp above.'),
      ],
      suzu: [
        { when: 'seen.sb.quiet_suzu', jp: '{雪鈴|ゆきすず} の {宿|やど} で 、 {帳簿|ちょうぼ} の {最後|さいご} の {頁|ページ} を {見|み}せた {夜|よる} 。 {誰|だれ} に も {見|み}せた こと なかった の よ 。', en: 'The night at the Snowbell inn when I showed you the last page of my book. I\'d never shown it to anyone.' },
        T('{雪鈴|ゆきすず} の {満員|まんいん} の {客席|きゃくせき} 。 {主役|しゅやく} は {灯|あか}り だった けど 。', 'That packed house in Snowbell. The lamp had the lead, mind.'),
      ],
    },
  };
  CC.mem.ch5 = {
    title: T('{鐘|かね} が {鳴|な}った', 'The drowned bell rang'), place: T('{灯落|ひおち}', 'Lanternfall'),
    text: T('{灯落|ひおち} の {沈|しず}んだ {鐘|かね} が {鳴|な}り 、 {町|まち} に 「 いいえ 」 が {戻|もど}った 。', 'The bell under Lanternfall rang, and the town could say "no" again.'),
    reply: {
      nao: T('…… {伝言|でんごん} 、 {預|あず}かった 。 {今度|こんど} は 、 ちゃんと {届|とど}ける 。', '…Message received. This time, it gets delivered.'),
      mio: T('{町|まち} を {静|しず}か に する {薬|くすり} は 、 {私|わたし} は {作|つく}らない 。 …… カサネ さん に も 、 そう {言|い}おう と {思|おも}う 。', 'I won\'t make medicine that quiets a town. …I think I\'ll tell Kasane the same thing.'),
      ren: T('{道|みち} に {迷|まよ}ったら 、 {私|わたし} の {逆|ぎゃく} を {行|い}って ください 。 それ で {着|つ}きます 。', 'If we get lost, go the opposite way from me. That\'ll get us there.'),
      suzu: T('{貸|か}し{借|か}り は 、 きっちり {返|かえ}して もらいましょう 。 {町|まち} {一|ひと}つ {分|ぶん} の 「 いいえ 」 、 {利子|りし} を つけて ね 。', 'Let\'s make sure the debts get settled properly. One whole town\'s worth of "no"s — with interest.'),
    },
  };
  CC.mem.lq1 = {
    title: T('{頼|たの}まれる {前|まえ} に', 'Before being asked'), place: T('{雪鈴|ゆきすず} {街道|かいどう} の {茶屋|ちゃや}', 'Chigusa\'s stall on the Snowbell road'),
    text: T('{三十年|さんじゅうねん} {後|ご} 、 チグサ は {渡|わた}し{賃|ちん} を {払|はら}い に {山|やま} を {下|お}りる と {決|き}めた 。 $comp も 、 {一|ひと}つ {決|き}めた 。', 'After thirty years, Chigusa decided to go down and pay her fare. $comp decided something too.'),
    reply: {
      nao: T('…… {三十年|さんじゅうねん} {待|ま}って から {動|うご}く の も 、 {悪|わる}く は ない 。 でも 、 {俺|おれ} は {待|ま}たない こと に する 。 {次|つぎ} の {戦|たたか}い から 、 {隙|すき} が {見|み}えたら 、 {合図|あいず} を {待|ま}たず に {動|うご}く 。', '…Moving after thirty years isn\'t wrong. But I\'ve decided not to wait. From the next fight on, when I see an opening, I\'ll move without waiting for your signal.'),
      mio: T('…… わたし は いつも 、 {頼|たの}まれて から {動|うご}く の 。 {頼|たの}まれたら {断|ことわ}れない くせ に ね 。 でも 、 {戦|たたか}い の {中|なか} で は 、 あなた が {頼|たの}む {前|まえ} に {動|うご}く から 。', '…I always wait to be asked before I move — though once I\'m asked I can never say no. But in a fight, I\'ll move before you have to ask.'),
      ren: T('{灯守|ひもり} は 、 {灯|あか}り が {消|き}えて から {気|き}づく ので は {遅|おそ}い んです 。 …… {次|つぎ} から は 、 {言|い}われる {前|まえ} に {灯|あか}り を {掲|かか}げます 。 {戦|たたか}い の {中|なか} でも 。', 'A keeper who only notices once the light is out is too late. …From now on I\'ll raise the light before I\'m asked. In a fight, too.'),
      suzu: T('{舞台|ぶたい} の {袖|そで} で {出番|でばん} を {待|ま}つ の は 、 もう おしまい 。 {次|つぎ} の {戦|たたか}い から 、 {出|で}る べき {時|とき} は {自分|じぶん} で {出|で}る よ 。 {合図|あいず} は いらない 。', 'No more waiting in the wings for my cue. From the next fight, when it\'s time to step out, I\'ll step out on my own. No signal needed.'),
    },
    keep: {
      nao: T('{峠|とうげ} の チグサ さん 。 {三十年|さんじゅうねん} {待|ま}って 、 やっと {動|うご}いた 。 あれ を {見|み}て 、 {俺|おれ} も {待|ま}つ の を やめた 。', 'Chigusa at the pass. Thirty years waiting, and she finally moved. Seeing that, I stopped waiting too.'),
      mio: T('{峠|とうげ} の お{茶屋|ちゃや} さん 。 チグサ さん が {下|お}りて いく と {決|き}めた {時|とき} 、 わたし も 、 {頼|たの}まれる {前|まえ} に {動|うご}こう と {決|き}めた ん です 。', 'The tea stall at the pass. When Chigusa decided to go down, I decided something too: to move before I\'m asked.'),
      ren: T('{峠|とうげ} で 、 {言|い}われる {前|まえ} に {灯|あか}り を {掲|かか}げる と {決|き}めた こと 。 {師匠|ししょう} なら 、 {遅|おそ}い と {言|い}った でしょう が 。', 'Deciding at the pass to raise the light before I\'m asked. My teacher would have said it took me long enough.'),
      suzu: T('{峠|とうげ} の チグサ さん 。 {三十年|さんじゅうねん} {分|ぶん} の {借|か}り を {返|かえ}し に {下|お}りて いった 。 {返|かえ}す の が {遅|おそ}い {人|ひと} の {気持|きも}ち 、 {私|わたし} に は よく {分|わ}かる の 。', 'Chigusa at the pass, going down to pay thirty years\' debt. I know exactly how it feels to be late paying back.'),
    },
  };
  CC.mem.lq2 = {
    title: T('{並|なら}んだ {名前|なまえ}', 'Two names on one shade'), place: T('{小春野|こはるの} の {灯|あか}り', 'The Koharuno lantern'),
    text: T('{小春野|こはるの} の {習|なら}わし 。 {一緒|いっしょ} に {渡|わた}った {者|もの} は 、 {笠|かさ} に {二人|ふたり} の {名前|なまえ} を {書|か}く 。 $comp は 、 あなた の {名前|なまえ} の {隣|となり} に {自分|じぶん} の {名前|なまえ} を {書|か}いた 。', 'Koharuno\'s custom: those who crossed together write both names on the shade. $comp wrote theirs beside yours.'),
    reply: {
      nao: T('…… {二人|ふたり} {分|ぶん} の {宛名|あてな} か 。 {悪|わる}く ない 。 {戦|たたか}い でも 、 あんた に {来|く}る もの は 、 {俺|おれ} に も {来|く}る と {思|おも}え 。 {半分|はんぶん} {引|ひ}き{受|う}ける 。', '…An address for two. Not bad. In a fight, too — whatever comes for you, count it as coming for me. I\'ll take half.'),
      mio: T('{並|なら}んだ {名前|なまえ} って 、 {支|ささ}え{合|あ}って いる みたい です ね 。 …… {戦|たたか}い の {時|とき} も 、 {一人|ひとり} で {受|う}け{止|と}めない で 。 わたし が {隣|となり} に います 。', 'Names side by side look like they\'re holding each other up. …In battle too, don\'t take it all alone. I\'m right beside you.'),
      ren: T('{名前|なまえ} は 、 {書|か}き{手|て} が {信|しん}じて いれば {根|ね} を {張|は}る 。 …… {私|わたし} は 、 この {二|ふた}つ の {名前|なまえ} を {信|しん}じて います 。 {戦|たたか}い の {中|なか} でも 、 あなた の {前|まえ} に {立|た}ちます 。', 'A name takes root if the writer believes in it. …I believe in these two. In a fight, too, I\'ll stand in front of you.'),
      suzu: T('{二枚|にまい}{看板|かんばん} って やつ だ ね ！ …… {真面目|まじめ} に {言|い}う と 、 {戦|たたか}い で あんた が {狙|ねら}われたら 、 {客|きゃく} の {目|め} は {私|わたし} が {引|ひ}き{受|う}ける 。 {二人|ふたり} で {一組|ひとくみ} の {芸|げい} だ から ね 。', 'A double bill! …Seriously, though: if something takes aim at you in a fight, I\'ll draw the audience\'s eye. We\'re a two-person act.'),
    },
    keep: {
      nao: T('{小春野|こはるの} の {灯|あか}り 。 {二人|ふたり} {分|ぶん} の {宛名|あてな} 。 {鞄|かばん} に は {入|はい}らない けど 、 {一番|いちばん} {大事|だいじ} な ラベル かも な 。', 'The Koharuno lantern. An address for two. Won\'t fit in my satchel, but it might be the most important label I\'ve got.'),
      mio: T('{小春野|こはるの} で 、 {名前|なまえ} を {並|なら}べて {書|か}いた こと 。 {並|なら}んだ {名前|なまえ} は 、 {支|ささ}え{合|あ}って いる みたい でした 。 {今|いま} も そう {思|おも}います 。', 'Writing our names side by side at Koharuno. They looked as if they were holding each other up. I still think so.'),
      ren: T('{小春野|こはるの} の {笠|かさ} に 、 {二|ふた}つ の {名前|なまえ} を {書|か}いた こと 。 {灯守|ひもり} が {自分|じぶん} の {名前|なまえ} を {笠|かさ} に {書|か}く の は 、 {初|はじ}めて でした 。', 'Writing two names on the Koharuno shade. It was the first time I\'d ever written my own name on one.'),
      suzu: T('{小春野|こはるの} の {二枚|にまい}{看板|かんばん} 。 あの {笠|かさ} 、 {私|わたし} の {名前|なまえ} の ほう が {字|じ} が {大|おお}きかった の 、 {気|き}づいてた ？ …… {冗談|じょうだん} 。 {同|おな}じ {大|おお}きさ よ 。', 'Our double bill at Koharuno. Did you notice my name was written bigger on that shade? …Joking. Same size.'),
    },
  };
  // the companion's own story: resolved in their way (the text follows the recorded outcome)
  CC.mem.pq_suzu = {
    title: T('{一部|いちぶ} {返済|へんさい}', 'Paid in part'), place: T('{灰実|はいみ} の {里|さと} 、 ヒロ の {工房|こうぼう}', 'Hiro\'s workshop, Cinder Orchard'),
    text: T('スズ は ヒロ に 、 {母親|ははおや} と {火事|かじ} の {本当|ほんとう} の こと を {話|はな}した 。 ヒロ は 、 {席|せき} の {隣|となり} に {座|すわ}って くれ と {言|い}った 。 {二十回|にじゅっかい} の {祭|まつ}り で 、 {少|すこ}し ずつ {返|かえ}す 。', 'Suzu told Hiro the truth about his mother and the fire. He asked her to sit beside the seat — twenty festivals, repaid one at a time.'),
    reply: { suzu: T('…… $name 。 ありがとう 。 {客席|きゃくせき} に いて くれて 。', '…$name. Thank you. For staying in your seat.') },
    keep: { suzu: T('ヒロ の {工房|こうぼう} で の こと 。 {一部|いちぶ} {返済|へんさい} 。 あなた が {客席|きゃくせき} に いて くれた から 、 {最後|さいご} まで {言|い}えた の 。', 'That day in Hiro\'s workshop. Paid in part. You stayed in your seat, so I could say it all the way to the end.') },
  };
  CC.mem.pq_nao = {
    title: T('「 {読|よ}んだ 」', '"I read it."'), place: T('{灯落|ひおち} の {渡|わた}し{場|ば} {事務所|じむしょ}', 'The ferry office, Lanternfall'),
    text: T('ナオ は 、 {一年|いちねん} {遅|おく}れて イサム の {手紙|てがみ} を {届|とど}け 、 {決|き}める の を ウミ に {任|まか}せた 。 ウミ は {一行|いちぎょう} だけ {返事|へんじ} を {書|か}いた 。', 'Nao delivered Isamu\'s letter a year late, and let Umi decide. She wrote one line back.'),
    reply: { nao: T('{許|ゆる}す とも 、 {許|ゆる}さない とも {書|か}いて ない 。 …… それ で いい んだ 。 {決|き}めた の は 、 ウミ だ 。', 'Doesn\'t say she forgives him, doesn\'t say she doesn\'t. …And that\'s right. Umi\'s the one who decided.') },
    keep: { nao: T('「 {読|よ}んだ 」 。 {一行|いちぎょう} だけ の {返事|へんじ} 。 あれ を {届|とど}けた {日|ひ} の こと は 、 たぶん {一生|いっしょう} {忘|わす}れない 。', '"I read it." A one-line reply. I\'ll probably never forget the day we delivered that.') },
  };
  CC.mem.pq_mio = {
    title: T('「 お{断|ことわ}り します 」', '"I refuse."'), place: T('{灯落|ひおち} の {公文書館|こうぶんしょかん}', 'The Public Records Hall, Lanternfall'),
    text: T('「 かしこまりました 」 しか {言|い}えない {町|まち} で 、 ミオ は 、 {人|ひと} の 「 いいえ 」 を {消|け}す {薬|くすり} を {作|つく}らない と {言|い}った 。', 'In a town that could only say "certainly", Mio refused to make the medicine that would take everyone\'s "no" away.'),
    reply: { mio: T('…… {言|い}えた 。 {手|て} 、 {震|ふる}えてる 。', '…I said it. My hands are shaking.') },
    keep: { mio: T('「 お{断|ことわ}り します 」 って {言|い}えた {日|ひ} 。 {手|て} が {震|ふる}えて いた の 、 {覚|おぼ}えて います か 。 あなた が {隣|となり} に いて くれた の も 。', 'The day I managed to say "I refuse". Do you remember my hands shaking? And that you were right beside me.') },
  };
  CC.mem.pq_ren = {
    title: T('{師匠|ししょう} の {顔|かお}', 'The teacher\'s face'), place: T('{静寂|しじま} の {書庫|しょこ}', 'The Still Archive'),
    texts: {
      ren: [
        { when: 'sa_ren_took', jp: 'レン は 、 ウシオ が {残|のこ}した {紙挟|かみばさ}み を {開|ひら}いた 。 {顔|かお} が {戻|もど}った 。 {最後|さいご} に {見|み}た とき 、 {師匠|ししょう} は {笑|わら}って いた 。', en: 'Ren opened the folio Ushio had left. The face came back — smiling, the last time Ren saw it.' },
        { when: 'sa_ren_left', jp: 'レン は {紙挟|かみばさ}み を {棚|たな} に {残|のこ}し 、 {教|おし}え を {持|も}って {帰|かえ}る こと に した 。 {今|いま} は 、 {選|えら}ばない こと を {選|えら}んだ 。', en: 'Ren left the folio on the shelf and kept the lessons — choosing, for now, not to choose.' },
        { jp: 'レン の {師匠|ししょう} ウシオ の こと が 、 {少|すこ}し {分|わ}かった 。', en: 'Something of Ren\'s teacher, Ushio, came back.' },
      ],
    },
    reply: {
      ren: [
        { when: 'sa_ren_took', jp: '「 {分|わ}かった 」 は 、 「 {帰|かえ}らない 」 じゃ なかった 。 「 {灯|ひ} を {頼|たの}む 」 だった 。 {七年|ななねん} 、 {逆|ぎゃく} に {読|よ}んで いた 。', en: '"All right" didn\'t mean "I won\'t come back." It meant "look after the lamps." For seven years I read it the wrong way round.' },
        { when: 'sa_ren_left', jp: '{師匠|ししょう} の {札|ふだ} に も 、 「 {選|えら}ぶ まで 」 と あります 。 {今|いま} は 、 {選|えら}ばない こと を {選|えら}びます 。 {逃|に}げる の と は 、 {少|すこ}し {違|ちが}う と {思|おも}いたい 。', en: 'My teacher\'s label says "until the person chooses". For now, I choose not to choose. I\'d like to think that\'s a little different from running away.' },
      ],
    },
    keep: {
      ren: [
        { when: 'sa_ren_took', jp: '{師匠|ししょう} の {顔|かお} 。 {笑|わら}って いました 。 {眉|まゆ} が {思|おも}った より {太|ふと}かった こと も 、 ちゃんと {記録|きろく} して あります 。', en: 'My teacher\'s face. Smiling. I\'ve put it on record that the eyebrows were thicker than I thought, too.' },
        { when: 'sa_ren_left', jp: '{師匠|ししょう} の {棚|たな} の {前|まえ} で 、 あなた が {待|ま}って くれた こと 。 {選|えら}ばない こと を {選|えら}んだ {私|わたし} を 、 {急|せ}かさなかった 。', en: 'You waiting with me in front of my teacher\'s shelf. When I chose not to choose, you didn\'t hurry me.' },
      ],
    },
  };
  // the two journey reflections, kept as memories when they happen (lines recorded then)
  CC.mem.reflect_travel = { kind: 'reflections', title: T('{旅|たび} の {仕方|しかた}', 'How We Travel') };
  CC.mem.reflect_keep = { kind: 'reflections', title: T('{残|のこ}す もの', 'What We Keep') };

  // What We Keep: a moment recorded by another system (a puzzle, a case, an animal) — the companion
  // frames its recorded title; %T is replaced by the title. No moment at all: an honest answer.
  CC.keep = {
    frame: {
      nao: T('%T の こと 、 {時々|ときどき} {思|おも}い{出|だ}す 。 {宛先|あてさき} の ある {思|おも}い{出|で}って 、 いい もん だ な 。', 'I think about %T sometimes. A memory with an address on it. Not bad.'),
      mio: T('%T 。 {薬|くすり} の {記録|きろく} みたい に 、 ちゃんと {書|か}いて {残|のこ}して おきたい です 。', '%T. I want to write it down properly, like a dispensing record.'),
      ren: T('%T 。 {記録|きろく} して おきたい こと です 。 {間違|まちが}い の ない よう に 、 {私|わたし} {一人|ひとり} で は なく 、 あなた と {二人|ふたり} で 。', '%T. That\'s something I\'d like to put on record. Not by myself — with you, so we get it right.'),
      suzu: T('%T ！ …… あれ は いい {場面|ばめん} だった わ 。 {台本|だいほん} に は {書|か}けない けど 、 {帳簿|ちょうぼ} に は {書|か}いて ある の 。', '%T! …That was a good scene. You can\'t write it into a script, but it\'s in my account book.'),
    },
    none: {
      nao: T('{一|ひと}つ {選|えら}べ って {言|い}われて も な 。 …… {道|みち} {全部|ぜんぶ} 、 かな 。 {普通|ふつう} の {日|ひ} も {込|こ}み で 。', 'Pick just one? …The whole road, I guess. The ordinary days included.'),
      mio: T('{一|ひと}つ に は {決|き}められません 。 …… {毎日|まいにち} の {小|ちい}さな こと {全部|ぜんぶ} 、 じゃ だめ です か 。', 'I can\'t choose just one. …Could it be all the small everyday things?'),
      ren: T('{一|ひと}つ に {絞|しぼ}る の は 、 {記録係|きろくがかり} と して {苦手|にがて} です 。 …… 「 {全部|ぜんぶ} 」 と {書|か}いて おきましょう 。', 'Narrowing it to one is not my strength as a record-keeper. …Let\'s write down "all of it".'),
      suzu: T('{一|ひと}つ だけ ？ {難|むずか}しい {注文|ちゅうもん} ね 。 …… {幕間|まくあい} {全部|ぜんぶ} 。 {何|なに} も {起|お}きない {時間|じかん} も 、 {私|わたし} に は {大事|だいじ} だった の 。', 'Only one? That\'s a tall order. …All the intervals. Even the times when nothing happened mattered to me.'),
    },
  };

  // ---- meeting an animal (a Pets memory; the pet system records the meeting itself) ----------------------
  CC.pets.nao = {
    cat: T('{猫|ねこ} は {出口|でぐち} を よく {知|し}ってる 。 {気|き} が {合|あ}い そう だ 。', 'Cats always know where the exits are. We\'ll get on.'),
    dog: T('{足|あし} が {速|はや}い な 。 {配達|はいたつ} を {手伝|てつだ}って くれる か ？ …… {冗談|じょうだん} だ よ 。', 'Quick on its feet. Want to help with deliveries? …Joking.'),
    bird: T('{鳥|とり} は {地図|ちず} なし で {帰|かえ}り{道|みち} が {分|わ}かる 。 {羨|うらや}ましい な 。', 'Birds find their way home without a map. I envy them.'),
    tanuki: T('たぬき か 。 {化|ば}かされない よう に しろ よ 。 …… {荷物|にもつ} を {見|み}てる ぞ 。', 'A tanuki. Don\'t let it trick you. …It\'s eyeing the luggage.'),
    '*': T('{連|つ}れ が {増|ふ}えた な 。 {名前|なまえ} は ちゃんと {覚|おぼ}えて おく 。', 'One more in the party. I\'ll remember the name properly.'),
  };
  CC.pets.mio = {
    cat: T('お{日|ひ}さま の {匂|にお}い が します 。 {元気|げんき} そう で よかった 。', 'It smells of sunshine. I\'m glad it looks well.'),
    dog: T('{毛並|けな}み が いい です ね 。 {大事|だいじ} に されて きた {子|こ} です 。', 'Such a good coat. Someone has taken care of this one.'),
    bird: T('{羽|はね} が きれい 。 …… {驚|おどろ}かせない よう に 、 そっと ね 。', 'Lovely feathers. …Gently, so we don\'t startle it.'),
    tanuki: T('たぬき さん 。 {薬草|やくそう} の {籠|かご} は {閉|し}めて おきます ね 。 {念|ねん} の ため 。', 'Hello, tanuki. I\'ll keep the herb basket shut. Just in case.'),
    '*': T('{新|あたら}しい {連|つ}れ です ね 。 {無理|むり} を させない よう に しましょう 。', 'A new companion. Let\'s not ask too much of it.'),
  };
  CC.pets.ren = {
    cat: T('{猫|ねこ} は {迷|まよ}いません 。 {少|すこ}し {見習|みなら}いたい です 。', 'Cats never get lost. I could stand to learn from it.'),
    dog: T('{犬|いぬ} は {来|き}た {道|みち} を {覚|おぼ}えて いる そう です 。 {頼|たの}もしい 。 {私|わたし} より 。', 'They say dogs remember the way they came. Reassuring. More than I am.'),
    bird: T('{小鳥|ことり} の {声|こえ} は 、 {朝|あさ} の {灯|あか}り を {消|け}す {合図|あいず} に {似|に}て います 。', 'A small bird\'s song sounds like the signal to put out the morning lamps.'),
    tanuki: T('たぬき は {化|ば}ける と {言|い}われます が 、 {記録|きろく} に {残|のこ}って いる {例|れい} は ありません 。 …… たぶん 。', 'Tanuki are said to shapeshift, but there\'s no example on record. …Probably.'),
    '*': T('{新|あたら}しい {名前|なまえ} が {一|ひと}つ 。 {書|か}き{留|と}めて おきます 。', 'One new name. I\'ll write it down.'),
  };
  CC.pets.suzu = {
    cat: T('{猫|ねこ} ！ {舞台|ぶたい} の {真|ま}ん{中|なか} で {寝|ね}る {才能|さいのう} が ある わ 。', 'A cat! A born talent for sleeping centre stage.'),
    dog: T('{拍手|はくしゅ} の {代|か}わり に しっぽ を {振|ふ}って くれる {観客|かんきゃく} ね 。 {最高|さいこう} 。', 'An audience that wags its tail instead of clapping. Perfect.'),
    bird: T('{歌|うた} の {先生|せんせい} が {来|き}た わ 。 {月謝|げっしゃ} は {豆|まめ} で いい かしら 。', 'My singing teacher has arrived. Will it take its fees in beans?'),
    tanuki: T('たぬき ！ {化|ば}ける {芝居|しばい} なら {負|ま}けない わ よ 。 …… {少|すこ}し {負|ま}ける かも 。', 'A tanuki! I won\'t lose to it at playing a part. …I might lose a little.'),
    '*': T('{一座|いちざ} に {新顔|しんがお} ！ {帳簿|ちょうぼ} に {書|か}いて おく わ 。 {貸|か}し も {借|か}り も なし 。', 'A new face in the troupe! I\'ll put it in the book. No debts either way.'),
  };
})(RB.content.company);

// older journeys gain the verified milestones once, silently (src/engine/58_companion.js migrate)
RB.save.addMigration(RB.company.migrate);

// the folio's and the world's entry points into conversations (each is a short scene so that the
// normal dialogue runner owns input, Next and the history)
RB.script.add(`
@scene co.place
!hook co_place

@scene co.mind
!hook co_thought

@scene co.rest
!hook co_rest
`, 'company/10_core');
