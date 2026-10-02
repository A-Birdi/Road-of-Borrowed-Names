/* Villagers' correspondence (Practice addendum §17.2): twelve short practice letters,
 * L01–L12, each with Foundations / Elementary / Intermediate / Advanced adaptations
 * (48 variants). Engine: src/engine/79_letters.js; interface: src/ui/90_letters.js.
 *
 * Each adaptation:
 *   msg      the villager's letter (markup)
 *   task     what the reply has to do, in English and Japanese (the same task)
 *   replies  the accepted-response families this letter can read. A family is the
 *            reply built from approved parts (markup); a part starting with '?' may
 *            be left out; `also` lists other natural orders. ok families of different
 *            tones complete the letter equally; a not-ok family carries `why` (what the
 *            reply would actually say), never a grammar diagnosis.
 *   extra    further pieces on the table (none of them completes the letter alone)
 *   ack      the villager's short, truthful closing acknowledgement
 *   explain  one explanation (mixed text: English with {漢字|かな} groups)
 *   item     the ordinary learning item the first assessment may record
 * Correspondents are villagers the main road introduces; `met` is the scene in which
 * the player meets them. */
var RB = (globalThis.RB = globalThis.RB || {});
(function (C) {
  'use strict';
  C.practiceB = C.practiceB || {};
  const ok = (tone, parts, en, o) => Object.assign({ ok: true, tone, parts, en }, o || {});
  const no = (parts, en, why, o) => Object.assign({ ok: false, parts, en, why: { en: why } }, o || {});
  const T = (en, jp) => ({ en, jp });

  C.practiceB.letters = [
    // ---- L01 · acknowledge that a parcel arrived ---------------------------------------------------
    {
      id: 'L01', from: 'hana', met: 'seen.rw.hana_first', fn: 'ack-parcel',
      title: T('A parcel from the teahouse', '{茶屋|ちゃや} から の {小包|こづつみ}'),
      gist: 'Hana sent tea. Let her know it arrived.',
      tiers: {
        F: {
          msg: T('I\'ve sent you some tea leaves. — Hana', 'お{茶|ちゃ} の {葉|は} を {送|おく}りました 。 ハナ'),
          task: T('Let Hana know the tea arrived.', 'お{茶|ちゃ} が {届|とど}いた と 、 ハナ さん に {伝|つた}えましょう 。'),
          replies: [
            ok('polite', ['{届|とど}きました 。', '?ありがとう ございます 。'], 'It arrived. (Thank you.)'),
            ok('friendly', ['{届|とど}いた よ 。', '?ありがとう 。'], 'It came! (Thanks.)'),
            no(['まだ {届|とど}いて いません 。'], 'It hasn\'t come yet.', 'The tea is here with you. This tells Hana it never came.'),
            no(['{少|すこ}し {足|た}りません 。'], 'A little is missing.', 'Nothing is missing. This would worry Hana for no reason.'),
          ],
          ack: T('Oh good, it got there! Enjoy it slowly.', 'よかった ！ {届|とど}いた の ね 。 ゆっくり {飲|の}んで ね 。'),
          explain: { en: '{届|とど}きました (todokimashita) says that something sent has reached you. Thanking her is a kind extra.' },
          item: 'g:v_masu_forms',
        },
        E: {
          msg: T('I\'ve sent you some new tea in a parcel. Let me know when it arrives. — Hana', '{新|あたら}しい お{茶|ちゃ} を {小包|こづつみ} で {送|おく}りました 。 {届|とど}いたら 、 {教|おし}えて ください ね 。 ハナ より'),
          task: T('Tell Hana the parcel arrived safely.', '{小包|こづつみ} が {無事|ぶじ} に {届|とど}いた と {伝|つた}えましょう 。'),
          replies: [
            ok('polite', ['?{小包|こづつみ} が', '?{無事|ぶじ} に', '{届|とど}きました 。', '?ありがとう ございます 。'], 'The parcel arrived safely. (Thank you.)'),
            ok('friendly', ['?{小包|こづつみ} 、', '{届|とど}いた よ 。', '?ありがとう 。'], 'The parcel came! (Thanks.)'),
            no(['{小包|こづつみ} が', '{届|とど}きません でした 。'], 'The parcel didn\'t arrive.', 'It did arrive. This tells Hana it was lost.'),
            no(['{小包|こづつみ} が', '{届|とど}きました 。', 'でも {中身|なかみ} が {足|た}りません 。'], 'The parcel came, but some of it is missing.', 'Nothing was missing. The second half invents a problem.'),
          ],
          ack: T('Good — I\'m relieved it got there safely.', 'よかった 。 {無事|ぶじ} に {届|とど}いて 、 {安心|あんしん} しました 。'),
          explain: { en: '{無事|ぶじ}に (buji ni, "safely") with {届|とど}きました tells her plainly that the parcel reached you in good order. Polite ～ました and friendly ～たよ both do it.' },
          item: 'g:v_masu_forms',
        },
        I: {
          msg: T('I sent two bags of autumn tea, addressed to Shino\'s post house. When you get them, just a word will do.', '{秋|あき} の お{茶|ちゃ} を {二袋|ふたふくろ} 、 シノ さん の {郵便所|ゆうびんじょ} {宛|あて} に {送|おく}りました 。 {受|う}け{取|と}ったら 、 {一言|ひとこと} で いい ので {知|し}らせて ね 。'),
          task: T('Confirm that both bags reached you.', '{二袋|ふたふくろ} とも {受|う}け{取|と}った と {知|し}らせましょう 。'),
          replies: [
            ok('polite', ['{二袋|ふたふくろ} とも', '{受|う}け{取|と}りました 。', '?ありがとう ございます 。'], 'I received both bags. (Thank you.)'),
            ok('friendly', ['{二袋|ふたふくろ} とも', '{届|とど}いた よ 。', '?ありがとう 。'], 'Both bags came! (Thanks.)'),
            ok('brief', ['{確|たし}か に', '{受|う}け{取|と}りました 。'], 'Received, without fail.'),
            no(['{一袋|ひとふくろ} しか', '{届|とど}きません でした 。'], 'Only one bag came.', 'Both bags came. This says one went missing.'),
            no(['シノ さん に', '{聞|き}いて みます 。'], 'I\'ll ask Shino.', 'You already have both bags. This leaves Hana not knowing whether they arrived.'),
          ],
          ack: T('Both bags made it, then. Thanks for letting me know.', '{二袋|ふたふくろ} とも {着|つ}いた の ね 。 {知|し}らせて くれて ありがとう 。'),
          explain: { en: '～とも ("both", "all of them") after {二袋|ふたふくろ} confirms the whole parcel. {確|たし}かに{受|う}け{取|と}りました is the brief, businesslike way to say it.' },
          item: 'g:v_masu_forms',
        },
        A: {
          msg: T('I put in rather a lot of this year\'s first tea. It must have been heavy. I hope it was no trouble for the people at the post house.', '{今年|ことし} の {新茶|しんちゃ} を {少|すこ}し {多|おお}め に {入|い}れました 。 {重|おも}かった でしょう 。 {郵便所|ゆうびんじょ} の {方|かた} の ご{迷惑|めいわく} に ならなければ いい の だ けれど 。'),
          task: T('Confirm it arrived, without suggesting anything was wrong with it.', '{何|なに} も {問題|もんだい} が なかった と {伝|つた}わる よう に 、 {届|とど}いた と {返事|へんじ} を しましょう 。'),
          replies: [
            ok('polite', ['{無事|ぶじ} に', '{届|とど}きました 。', '?{大切|たいせつ} に いただきます 。'], 'It arrived safely. (I\'ll enjoy it with care.)'),
            ok('friendly', ['ちゃんと', '{届|とど}いた よ 。', '?{大事|だいじ} に {飲|の}む ね 。'], 'It got here fine. (I\'ll drink it with care.)'),
            ok('formal', ['{確|たし}か に', '{拝受|はいじゅ} しました 。'], 'Duly received.'),
            no(['{一応|いちおう}', '{届|とど}きました 。'], 'It arrived, more or less.', '{一応|いちおう} ("for what it\'s worth", "technically") hints that something was not quite right. Nothing was.'),
            no(['{少|すこ}し', '{重|おも}かった です 。'], 'It was a bit heavy.', 'This answers her worry with a complaint, and never says the tea arrived.'),
          ],
          ack: T('I\'m relieved it arrived safely. Please give my regards to everyone at the post house too.', '{無事|ぶじ} に {着|つ}いて 、 ほっと しました 。 {郵便所|ゆうびんじょ} の {皆|みな} さん に も 、 よろしく {伝|つた}えて ください 。'),
          explain: { en: 'A plain {無事|ぶじ}に{届|とど}きました reassures; {一応|いちおう} would quietly suggest a "but". {拝受|はいじゅ} is a very formal word for receiving, at home in business letters.' },
          item: 'g:indirectness',
        },
      },
    },

    // ---- L02 · accept an invitation -------------------------------------------------------------------
    {
      id: 'L02', from: 'co_ume', met: 'seen.co.ume_first', fn: 'accept',
      title: T('Persimmons on the terraces', '{段々畑|だんだんばたけ} の {柿|かき}'),
      gist: 'Grandma Ume invites you to dry persimmons. Say yes.',
      tiers: {
        F: {
          msg: T('We\'re drying persimmons. Won\'t you come? — Ume', '{柿|かき} を {干|ほ}します 。 {来|き}ません か 。 ウメ'),
          task: T('Accept Ume\'s invitation.', 'ウメ さん の {誘|さそ}い を {受|う}けましょう 。'),
          replies: [
            ok('polite', ['はい 、', '{行|い}きます 。'], 'Yes, I\'ll come.'),
            ok('friendly', ['{行|い}く よ 。', '?ありがとう 。'], 'I\'ll come! (Thanks.)'),
            ok('warm', ['ぜひ', '{行|い}きたい です 。'], 'I\'d love to come.'),
            no(['{行|い}きません 。'], 'I won\'t come.', 'This says no. The task is to accept.'),
          ],
          ack: T('Good. I\'ll be waiting.', 'よかった 。 {待|ま}ってる よ 。'),
          explain: { en: '{行|い}きます ("I\'ll go") accepts. ～ませんか ("won\'t you…?") is a polite invitation, not a negative question to answer with "no".' },
          item: 'g:v_mashou',
        },
        E: {
          msg: T('This Sunday we\'re drying persimmons on the upper terrace. Would you like to come and help?', '{今度|こんど} の {日曜日|にちようび} 、 {上|うえ} の {段|だん} で {柿|かき} を {干|ほ}します 。 よかったら 、 {手伝|てつだ}い に {来|き}ません か 。'),
          task: T('Accept the invitation.', '{誘|さそ}い を {受|う}けましょう 。'),
          replies: [
            ok('polite', ['はい 、', '?ぜひ', '{手伝|てつだ}い に {行|い}きます 。'], 'Yes, I\'ll (gladly) come and help.'),
            ok('friendly', ['いい よ 。', '{手伝|てつだ}い に {行|い}く ね 。'], 'Sure. I\'ll come and help.'),
            ok('warm', ['{喜|よろこ}んで 。'], 'Gladly.'),
            no(['{日曜日|にちようび} は', '{行|い}けません 。'], 'I can\'t come on Sunday.', 'This declines. The task is to accept.'),
            no(['{土曜日|どようび} に', '{行|い}きます 。'], 'I\'ll come on Saturday.', 'Ume said Sunday. This accepts a different day.'),
          ],
          ack: T('Thank you. See you on Sunday. I\'ll keep a sweet one aside for you.', 'ありがとう ね 。 {日曜日|にちようび} 、 {待|ま}ってる よ 。 {甘|あま}い の を {一|ひと}つ {取|と}って おく から 。'),
          explain: { en: '{手伝|てつだ}いに{行|い}きます: "I\'ll go to help". The friendly ～ね and the one-word {喜|よろこ}んで ("gladly") accept just as clearly.' },
          item: 'g:v_mashou',
        },
        I: {
          msg: T('The upper-terrace persimmons came out sweet this year. We\'re all drying them from Sunday morning, so if you have time, do look in.', '{上|うえ} の {段|だん} の {柿|かき} が 、 {今年|ことし} は {甘|あま}く なりました 。 {日曜日|にちようび} の {朝|あさ} から {皆|みな} で {干|ほ}す ので 、 {時間|じかん} が あれば {顔|かお} を {出|だ}して ください な 。'),
          task: T('Accept: say you\'ll come on Sunday morning.', '{日曜日|にちようび} の {朝|あさ} に {行|い}く と 、 {誘|さそ}い を {受|う}けましょう 。'),
          replies: [
            ok('polite', ['?ありがとう ございます 。', '{日曜日|にちようび} の {朝|あさ} 、', '{伺|うかが}います 。'], '(Thank you.) I\'ll come by on Sunday morning.'),
            ok('friendly', ['{日曜日|にちようび} の {朝|あさ} 、', '{行|い}く ね 。'], 'I\'ll come Sunday morning!'),
            ok('warm', ['{喜|よろこ}んで', '{伺|うかが}います 。'], 'I\'ll be glad to come.'),
            no(['{日曜日|にちようび} の {夜|よる} 、', '{伺|うかが}います 。'], 'I\'ll come by on Sunday evening.', 'They start in the morning. The evening is a different time.'),
            no(['{時間|じかん} が あれば', '{行|い}きます 。'], 'I\'ll come if I have time.', 'This hands her own "if you have time" back to her: it doesn\'t say whether you are coming.'),
          ],
          ack: T('How lovely. I\'ll have the drying strings ready on Sunday morning.', '{嬉|うれ}しい ね 。 {日曜日|にちようび} の {朝|あさ} 、 {干|ほ}し{柿|がき} の {縄|なわ} を {用意|ようい} して {待|ま}ってる よ 。'),
          explain: { en: '{伺|うかが}います is the humble "I\'ll come (to you)". {時間|じかん}があれば repeats a condition instead of answering it, so it leaves the invitation open.' },
          item: 'g:keigo_kenjo',
        },
        A: {
          msg: T('Thank you for the other day. Next month we\'re holding a small gathering to celebrate the persimmons being dried. It isn\'t a formal affair, so do come if you feel like it.', '{先日|せんじつ} は お{世話|せわ} に なりました 。 {来月|らいげつ} 、 {柿|かき} の {干|ほ}し{上|あ}がり を {祝|いわ}って 、 {小|ちい}さな {集|あつ}まり を {開|ひら}きます 。 {堅苦|かたくる}しい {会|かい} では ありません から 、 {気|き} が {向|む}いたら お{越|こ}し ください 。'),
          task: T('Accept clearly, in a register that suits the letter.', 'この {手紙|てがみ} に {合|あ}う {言葉|ことば} で 、 はっきり {受|う}けましょう 。'),
          replies: [
            ok('humble', ['{喜|よろこ}んで', '{伺|うかが}います 。'], 'I will be delighted to come.'),
            ok('polite', ['ぜひ', '{参加|さんか} させて ください 。'], 'Please do let me join.'),
            ok('warm', ['{楽|たの}しみ に して います 。', 'ぜひ {行|い}きます 。'], 'I\'m looking forward to it. I\'ll certainly come.'),
            no(['{気|き} が {向|む}いたら', '{行|い}きます 。'], 'I\'ll come if I feel like it.', 'Echoing "if you feel like it" sounds non-committal, even a little cool. It isn\'t a clear yes.'),
            no(['{考|かんが}えて おきます 。'], 'I\'ll think about it.', '"I\'ll think about it" often works as a gentle no. It doesn\'t accept.'),
          ],
          ack: T('That makes me happy. I\'ll keep a seat for you.', 'それ は {嬉|うれ}しい 。 {席|せき} を {一|ひと}つ {用意|ようい} して おきます よ 。'),
          explain: { en: '{喜|よろこ}んで{伺|うかが}います and {参加|さんか}させてください accept warmly and clearly. {考|かんが}えておきます and {気|き}が{向|む}いたら leave the answer hanging, which Japanese often uses to soften a refusal.' },
          item: 'g:indirectness',
        },
      },
    },

    // ---- L03 · decline an invitation courteously ---------------------------------------------------
    {
      id: 'L03', from: 'co_goro', met: 'seen.co.goro_first', fn: 'decline',
      title: T('An evening at the lookout', '{櫓|やぐら} の {夕方|ゆうがた}'),
      gist: 'Old Gorō invites you up to the bell. You can\'t go: say so.',
      tiers: {
        F: {
          msg: T('Want to come and see the bell tonight? — Gorō', '{今夜|こんや} 、 {鐘|かね} を {見|み}に {来|こ}ない か 。 ゴロウ'),
          task: T('You can\'t go tonight. Say no, kindly.', '{今夜|こんや} は {行|い}けません 。 やさしく {断|ことわ}りましょう 。'),
          replies: [
            ok('polite', ['ごめんなさい 。', '{今夜|こんや} は {行|い}けません 。'], 'I\'m sorry. I can\'t come tonight.'),
            ok('friendly', ['ごめん ね 。', '{今夜|こんや} は {行|い}けない 。'], 'Sorry! I can\'t make it tonight.'),
            ok('brief', ['{今夜|こんや} は', '{無理|むり} です 。'], 'Tonight\'s not possible.'),
            no(['はい 、', '{行|い}きます 。'], 'Yes, I\'ll come.', 'This says yes. You can\'t go tonight.'),
          ],
          ack: T('I see. The bell isn\'t going anywhere. Another time, then.', 'そう か 。 {鐘|かね} は {逃|に}げん 。 また {今度|こんど} な 。'),
          explain: { en: '{行|い}けません ("I can\'t go") is an honest no; ごめんなさい or ごめんね softens it. A short refusal is not an unkind one.' },
          item: 'g:v_potential',
        },
        E: {
          msg: T('Tomorrow at dusk we ring the bell at the lookout. Want to listen together?', '{明日|あした} の {夕方|ゆうがた} 、 {櫓|やぐら} で {鐘|かね} を {鳴|な}らす 。 {一緒|いっしょ} に {聞|き}かない か 。'),
          task: T('You can\'t come tomorrow. Decline honestly.', '{明日|あした} は {行|い}けません 。 {正直|しょうじき} に {断|ことわ}りましょう 。'),
          replies: [
            ok('polite', ['すみません 。', '{明日|あした} は', '{行|い}けません 。'], 'I\'m sorry. I can\'t come tomorrow.'),
            ok('friendly', ['ごめん 、', '{明日|あした} は', '{行|い}けない んだ 。'], 'Sorry, I can\'t make it tomorrow.'),
            ok('warm', ['ありがとう ございます 。', 'でも 、', '{明日|あした} は', '{行|い}けません 。'], 'Thank you. But I can\'t come tomorrow.', { fixed: true }),
            no(['{明日|あした} は', '{行|い}きます 。'], 'I\'ll come tomorrow.', 'This accepts. You can\'t come.'),
            no(['いつ です か 。'], 'When is it?', 'Gorō already said when: tomorrow at dusk. This doesn\'t answer him.'),
          ],
          ack: T('A shame, but the bell rings every day. Don\'t give it a thought.', '{残念|ざんねん} だ が 、 {鐘|かね} は {毎日|まいにち} {鳴|な}る 。 {気|き} に する な 。'),
          explain: { en: '{行|い}けません / {行|い}けないんだ: "I can\'t go". Thanking him first (ありがとうございます。でも…) is a warm way in, but the plain apology works just as well.' },
          item: 'g:v_potential',
        },
        I: {
          msg: T('I\'ve polished the lookout bell again. This week at dusk, Kotarō rings it on his own for the first time. Come along if it suits you.', '{櫓|やぐら} の {鐘|かね} を {磨|みが}き{直|なお}した 。 {今週|こんしゅう} の {夕方|ゆうがた} 、 コタロウ が {初|はじ}めて {一人|ひとり} で {鳴|な}らす 。 よければ {来|き}て やって くれ 。'),
          task: T('Decline honestly: you\'ll be away on the road this week.', '{今週|こんしゅう} は {旅|たび} に {出|で}る ので {行|い}けない と 、 {正直|しょうじき} に {断|ことわ}りましょう 。'),
          replies: [
            ok('polite', ['せっかく です が 、', '{今週|こんしゅう} は {旅|たび} に {出|で}る ので 、', '{行|い}けません 。'], 'It\'s kind of you, but I\'m on the road this week, so I can\'t come.'),
            ok('friendly', ['ごめん 、', '{今週|こんしゅう} は {旅|たび} に {出|で}る から 、', '{行|い}けない 。'], 'Sorry, I\'m travelling this week, so I can\'t come.'),
            ok('brief', ['{今週|こんしゅう} は', '{伺|うかが}えません 。', '?コタロウ さん に よろしく 。'], 'I can\'t come this week. (Give my best to Kotarō.)'),
            no(['{今週|こんしゅう} は', '{伺|うかが}います 。'], 'I\'ll come this week.', 'This accepts. You\'ll be away.'),
            no(['{行|い}ける かも しれません 。'], 'I might be able to come.', 'You know you\'ll be away. A maybe keeps them waiting for you.'),
          ],
          ack: T('Understood. Safe travels. You can hear the bell another time.', '{分|わ}かった 。 {旅|たび} の {無事|ぶじ} を {祈|いの}って おる 。 {鐘|かね} は また {今度|こんど} {聞|き}けば いい 。'),
          explain: { en: 'せっかくですが ("it\'s kind of you, but…") opens a courteous refusal, and ～ので / ～から gives the reason. {行|い}けるかもしれません would be an honest answer only if you really might come.' },
          item: 'g:conj_node',
        },
        A: {
          msg: T('I\'d like to thank you properly for that business. How about a drink at the lookout at the end of the month? I won\'t insist.', '{先|さき} の {件|けん} 、 {改|あらた}めて {礼|れい} が したい 。 {今月末|こんげつまつ} 、 {櫓|やぐら} で {一杯|いっぱい} どう だ 。 {無理|むり} に と は {言|い}わん 。'),
          task: T('Decline courteously — a clear no, not a vague one.', 'はっきり 、 でも {丁寧|ていねい} に {断|ことわ}りましょう 。'),
          replies: [
            ok('humble', ['ありがたい お{誘|さそ}い です が 、', '{今回|こんかい} は', 'ご{遠慮|えんりょ} させて ください 。'], 'It\'s a kind invitation, but please allow me to decline this time.'),
            ok('polite', ['お{気持|きも}ち は {嬉|うれ}しい です が 、', '{月末|げつまつ} は', '{伺|うかが}えません 。'], 'I\'m touched, but I can\'t come at the end of the month.'),
            ok('plain', ['{悪|わる}い けど 、', '{月末|げつまつ} は', '{行|い}けない 。'], 'Sorry, but I can\'t make the end of the month.'),
            no(['{前向|まえむ}き に', '{検討|けんとう} します 。'], 'I\'ll give it positive consideration.', '"I\'ll consider it positively" sounds like a maybe and hides the no you mean.'),
            no(['{行|い}けたら', '{行|い}きます 。'], 'I\'ll come if I can.', 'This leaves him expecting a guest who isn\'t coming.'),
          ],
          ack: T('Thanks for saying it plainly. I\'ll find another way to thank you.', 'はっきり {言|い}って くれて {助|たす}かる 。 {礼|れい} は また {別|べつ} の {形|かたち} で する 。'),
          explain: { en: 'ご{遠慮|えんりょ}させてください and {伺|うかが}えません refuse clearly while honouring the invitation. {前向|まえむ}きに{検討|けんとう}します and {行|い}けたら{行|い}きます are polite on the surface but leave him unsure.' },
          item: 'g:keigo_kenjo',
        },
      },
    },

    // ---- L04 · clarify which day the sender meant ------------------------------------------------------
    {
      id: 'L04', from: 'sousuke', met: 'seen.sb.sousuke', fn: 'which-day',
      title: T('A day at the post shelter', '{郵便|ゆうびん}{小屋|ごや} の {日|ひ}'),
      gist: 'Sousuke asks you to come by, but which day?',
      tiers: {
        F: {
          msg: T('Please come to the post shelter next week. There\'s a letter for you. — Sousuke', '{来週|らいしゅう} 、 {郵便|ゆうびん}{小屋|ごや} に {来|き}て ください 。 {手紙|てがみ} が あります 。 ソウスケ'),
          task: T('He didn\'t say which day. Ask him.', '{何曜日|なんようび} か {書|か}いて ありません 。 {聞|き}きましょう 。'),
          replies: [
            ok('polite', ['{何曜日|なんようび} です か 。'], 'Which day of the week?'),
            ok('open', ['いつ が いい です か 。'], 'When would be good?'),
            ok('friendly', ['{何曜日|なんようび} ？'], 'Which day?'),
            no(['{月曜日|げつようび} に', '{行|い}きます 。'], 'I\'ll come on Monday.', 'He never said Monday. This picks a day for him.'),
          ],
          ack: T('Sorry, I forgot to write it. Wednesday.', 'すみません 、 {書|か}き{忘|わす}れました 。 {水曜日|すいようび} です 。'),
          explain: { en: '{何曜日|なんようび} ("which day of the week") asks for exactly what is missing. Guessing a day could send you on the wrong one.' },
          item: 'g:qword_ka_mo',
        },
        E: {
          msg: T('Three letters have come for you. Please collect them on a market day. This month\'s markets are on the 3rd and the 10th.', '$name さん に {手紙|てがみ} が {三通|さんつう} {届|とど}いて います 。 {市|いち} の {日|ひ} に {取|と}りに {来|き}て ください 。 {今月|こんげつ} の {市|いち} は {三日|みっか} と {十日|とおか} です 。'),
          task: T('He gave two days. Ask which one he means.', '{日|ひ} が {二|ふた}つ あります 。 どちら か {聞|き}きましょう 。'),
          replies: [
            ok('polite', ['{三日|みっか} と {十日|とおか} 、', 'どちら です か 。'], 'The 3rd or the 10th — which is it?'),
            ok('open', ['どちら の {日|ひ} が', 'いい です か 。'], 'Which day would be better?'),
            ok('friendly', ['どっち の {日|ひ} ？'], 'Which day?'),
            no(['{三日|みっか} に', '{行|い}きます 。'], 'I\'ll come on the 3rd.', 'He gave two days and didn\'t choose. Picking one may be the wrong one: ask.'),
            no(['{手紙|てがみ} は', '{三通|さんつう} です か 。'], 'Is it three letters?', 'He already said three letters. What is missing is the day.'),
          ],
          ack: T('Either is fine, but the 10th is quieter.', 'どちら でも {大丈夫|だいじょうぶ} です が 、 {十日|とおか} の {方|ほう} が {空|す}いて います よ 。'),
          explain: { en: 'どちら / どっち ("which of the two") fits a choice between two days. A question is the honest reply when a letter leaves something open.' },
          item: 'g:kosoado',
        },
        I: {
          msg: T('A parcel for you came with the first post of spring. I can hand it over on the day of the next delivery.', '{春|はる} の {最初|さいしょ} の {郵便|ゆうびん} で 、 あなた {宛|あて} の {小包|こづつみ} が {来|き}ました 。 {次|つぎ} の {便|びん} の {日|ひ} に お{渡|わた}し できます 。'),
          task: T('He didn\'t say when the next delivery is. Ask.', '{次|つぎ} の {便|びん} が いつ か 、 {書|か}いて ありません 。 {聞|き}きましょう 。'),
          replies: [
            ok('polite', ['{次|つぎ} の {便|びん} は', '{何日|なんにち} です か 。'], 'What date is the next delivery?'),
            ok('open', ['{次|つぎ} の {便|びん} は', 'いつ です か 。'], 'When is the next delivery?'),
            ok('request', ['{次|つぎ} の {便|びん} の {日|ひ} を', '{教|おし}えて ください 。'], 'Please tell me the day of the next delivery.'),
            no(['{明日|あした}', '{取|と}りに {行|い}きます 。'], 'I\'ll come for it tomorrow.', 'He said "the next delivery day", not tomorrow. This guesses.'),
            no(['{小包|こづつみ} を', '{送|おく}って ください 。'], 'Please send the parcel.', 'He offered to hand it over. The open question is when.'),
          ],
          ack: T('My apologies. The next delivery is on Thursday.', '{失礼|しつれい} しました 。 {次|つぎ} の {便|びん} は {木曜日|もくようび} です 。'),
          explain: { en: '{便|びん} here is a delivery run. Asking いつ / {何日|なんにち}, or ～を{教|おし}えてください, gets the missing day instead of inventing it.' },
          item: 'g:v_te_kudasai',
        },
        A: {
          msg: T('About that matter: I was hoping we could talk it over again, early next week perhaps.', '{例|れい} の {件|けん} 、 {週明|しゅうあ}け に でも {改|あらた}めて ご{相談|そうだん} できれば と {思|おも}います 。'),
          task: T('"Early next week, perhaps" names no day. Ask for one without deciding for him.', '「 {週明|しゅうあ}け に でも 」 で は {日|ひ} が {決|き}まりません 。 {勝手|かって} に {決|き}めず に {聞|き}きましょう 。'),
          replies: [
            ok('formal', ['{週明|しゅうあ}け の', '{何曜日|なんようび} が', 'よろしい でしょう か 。'], 'Which day early in the week would suit you?'),
            ok('polite', ['{何曜日|なんようび} に', '{伺|うかが}えば', 'よろしい です か 。'], 'On which day should I come?'),
            ok('plain', ['{週明|しゅうあ}け の', 'いつ が いい です か 。'], 'When early in the week is good?'),
            no(['では 、', '{月曜日|げつようび} に {伺|うかが}います 。'], 'Then I\'ll come on Monday.', '～にでも only means "early in the week, say". Naming Monday decides for him.'),
            no(['{承知|しょうち} しました 。'], 'Understood.', '"Understood" agrees to a plan that has no day in it yet.'),
          ],
          ack: T('Thank you for your consideration. Would Tuesday afternoon suit you?', 'お{気遣|きづか}い ありがとう ございます 。 {火曜日|かようび} の {午後|ごご} で いかが でしょう 。'),
          explain: { en: '～にでも softens a suggestion ("say, early next week"), so the day is still open. ～がよろしいでしょうか asks for his preference politely.' },
          item: 'g:indirectness',
        },
      },
    },

    // ---- L05 · correct a delivery location ---------------------------------------------------------------
    {
      id: 'L05', from: 'tamae', met: 'seen.sg.tamae_first', fn: 'where',
      title: T('A box at the Gull', 'かもめ{亭|てい} の {箱|はこ}'),
      gist: 'Your box went to Tamae\'s inn. Say where it should go, kindly.',
      tiers: {
        F: {
          msg: T('Your box came to our inn. — Tamae', 'あなた の {箱|はこ} が 、 うち の {宿|やど} に {来|き}た よ 。 タマエ'),
          task: T('It should go to Shino\'s post house. Tell her where.', 'シノ さん の {郵便所|ゆうびんじょ} に {送|おく}って ほしい と {伝|つた}えましょう 。'),
          replies: [
            ok('polite', ['{郵便所|ゆうびんじょ} に', '{送|おく}って ください 。'], 'Please send it to the post house.'),
            ok('request', ['シノ さん の {郵便所|ゆうびんじょ} へ', 'お{願|ねが}い します 。'], 'To Shino\'s post house, please.'),
            no(['{宿|やど} に', '{送|おく}って ください 。'], 'Please send it to the inn.', 'It\'s already at the inn: that is the wrong place.'),
            no(['タマエ さん の', 'まちがい です 。'], 'It\'s your mistake, Tamae.', 'This blames Tamae. She only wants to know where it should go.'),
          ],
          ack: T('Got it. I\'ll send it on to the post house.', 'わかった 。 {郵便所|ゆうびんじょ} に {送|おく}って おく よ 。'),
          explain: { en: '～に{送|おく}ってください: "please send it to…". Naming the right place is all she needs.' },
          item: 'g:prt_ni',
        },
        E: {
          msg: T('A box addressed to you came to the Gull by mistake. What shall I do with it?', '$name さん {宛|あて} の {箱|はこ} が 、 {間違|まちが}って かもめ{亭|てい} に {届|とど}きました 。 どう します か 。'),
          task: T('Ask her to send it on to Shino\'s post house in Cinder Orchard, without blaming anyone.', '{誰|だれ} も {責|せ}めず に 、 {灰実|はいみ} の {郵便所|ゆうびんじょ} へ {送|おく}って ほしい と {伝|つた}えましょう 。'),
          replies: [
            ok('polite', ['{灰実|はいみ} の {郵便所|ゆうびんじょ} へ', '{送|おく}って ください 。', '?お{願|ねが}い します 。'], 'Please send it to the post house in Cinder Orchard.'),
            ok('thanks', ['{知|し}らせて くれて', 'ありがとう ございます 。', '{灰実|はいみ} の {郵便所|ゆうびんじょ} へ', '{送|おく}って ください 。'], 'Thanks for letting me know. Please send it to the post house in Cinder Orchard.', { fixed: true }),
            ok('friendly', ['{灰実|はいみ} の {郵便所|ゆうびんじょ} に', '{送|おく}って くれる ？'], 'Could you send it to the post house in Cinder Orchard?'),
            no(['そのまま', '{宿|やど} に {置|お}いて ください 。'], 'Please just keep it at the inn.', 'The box should go to the post house. Leaving it at the inn keeps it in the wrong place.'),
            no(['どうして', '{間違|まちが}えた ん です か 。'], 'Why did you get it wrong?', 'This looks for someone to blame. It doesn\'t say where the box should go.'),
          ],
          ack: T('Of course. It goes out with tomorrow\'s boat.', 'もちろん 。 {明日|あした} の {船|ふね} で {送|おく}る よ 。'),
          explain: { en: 'へ and に both mark where it should go. Thanking her for telling you keeps it friendly; no one needs to be at fault.' },
          item: 'g:prt_he',
        },
        I: {
          msg: T('Your parcel has come to the Gull — I think whoever wrote the address mixed up the inn and the post house. Shall I keep it here?', 'お{前|まえ} さん の {小包|こづつみ} が 、 かもめ{亭|てい} に {来|き}てる よ 。 {宛名|あてな} を {書|か}いた {人|ひと} が 、 {宿|やど} と {郵便所|ゆうびんじょ} を {取|と}り{違|ちが}えた ん だろう ね 。 うち で {預|あず}かって おこう か 。'),
          task: T('It was meant for Shino\'s post house. Say so, without blaming whoever wrote the address.', '{本当|ほんとう} は シノ さん の {郵便所|ゆうびんじょ} {宛|あて} です 。 {書|か}いた {人|ひと} を {責|せ}めず に {伝|つた}えましょう 。'),
          replies: [
            ok('polite', ['{本当|ほんとう} は', 'シノ さん の {郵便所|ゆうびんじょ} {宛|あて} です 。', 'そちら へ {回|まわ}して いただけます か 。'], 'It was meant for Shino\'s post house. Could you pass it on there?'),
            ok('friendly', ['シノ さん の {郵便所|ゆうびんじょ} {宛|あて} なんだ 。', 'そっち に {回|まわ}して くれる ？'], 'It\'s for Shino\'s post house. Could you pass it on?'),
            ok('brief', ['{郵便所|ゆうびんじょ} へ', '{回|まわ}して ください 。'], 'Please pass it on to the post house.'),
            no(['はい 、', '{預|あず}かって ください 。'], 'Yes, please keep it.', 'It belongs at the post house. Keeping it at the inn leaves it in the wrong place.'),
            no(['{宛名|あてな} を {書|か}いた {人|ひと} が', '{悪|わる}い です 。'], 'The person who wrote the address is to blame.', 'This assigns blame and still doesn\'t say where the parcel should go.'),
          ],
          ack: T('Right you are. I\'ll take it round to the post house myself.', 'あいよ 。 {郵便所|ゆうびんじょ} に は 、 あたし が {持|も}って {行|い}く よ 。'),
          explain: { en: '～{宛|あて} ("addressed to") names the intended place. {回|まわ}していただけますか ("could you pass it on?") corrects the route without a word of blame.' },
          item: 'g:te_giving',
        },
        A: {
          msg: T('I\'m terribly sorry. It seems we misread the address and took in your parcel here. Where should it go?', '{大変|たいへん} {申|もう}し{訳|わけ} ありません 。 こちら で {宛名|あてな} を {読|よ}み{違|ちが}えて 、 お{荷物|にもつ} を {預|あず}かって しまった よう です 。 どちら へ お{届|とど}け すれば よろしい でしょう か 。'),
          task: T('Name the right destination (Shino\'s post house) and ease her apology — don\'t accept it as her fault.', '{正|ただ}しい {届|とど}け{先|さき} を {伝|つた}え 、 {相手|あいて} の お{詫|わ}び を やわらげましょう 。'),
          replies: [
            ok('gracious', ['お{気|き} に なさらないで ください 。', 'シノ さん の {郵便所|ゆうびんじょ} へ', 'お{願|ねが}い できます か 。'], 'Please don\'t worry about it. Could I ask you to send it to Shino\'s post house?'),
            ok('own-share', ['{私|わたし} の {書|か}き{方|かた} も', '{分|わ}かりにくかった と {思|おも}います 。', 'シノ さん の {郵便所|ゆうびんじょ} へ', 'お{願|ねが}い します 。'], 'My handwriting was probably hard to read too. To Shino\'s post house, please.', { fixed: true }),
            ok('plain', ['{気|き} に しないで 。', 'シノ さん の {郵便所|ゆうびんじょ} へ', 'お{願|ねが}い ね 。'], 'Don\'t worry about it. To Shino\'s post house, please.', { fixed: true }),
            no(['{確|たし}か に', '{困|こま}りました 。', 'シノ さん の {郵便所|ゆうびんじょ} へ', 'お{願|ねが}い します 。'], 'It was certainly a nuisance. To Shino\'s post house, please.', 'The destination is right, but this confirms her fault and makes her apology heavier.', { fixed: true }),
            no(['お{気|き} に なさらないで ください 。', 'そちら で {保管|ほかん} して ください 。'], 'Please don\'t worry. Please keep it there.', 'Kind, but the parcel stays in the wrong place.', { fixed: true }),
          ],
          ack: T('You\'re very kind. I\'ll send it to the post house without fail.', 'ご{丁寧|ていねい} に ありがとう ございます 。 {必|かなら}ず {郵便所|ゆうびんじょ} へ お{届|とど}け します 。'),
          explain: { en: 'お{気|き}になさらないでください eases an apology; sharing a little of the cause ({私|わたし}の{書|か}き{方|かた}も…) is a gracious option. {確|たし}かに{困|こま}りました agrees that she was at fault.' },
          item: 'g:keigo_sonkei',
        },
      },
    },

    // ---- L06 · thank someone for returning a tool --------------------------------------------------------
    {
      id: 'L06', from: 'akari', met: 'seen.lf.akari', fn: 'thanks',
      title: T('The brush comes home', '{戻|もど}って きた {筆|ふで}'),
      gist: 'Akari returns the brush you lent her. Thank her.',
      tiers: {
        F: {
          msg: T('I\'m giving your brush back. Thank you. — Akari', '{筆|ふで} を {返|かえ}します 。 ありがとう 。 アカリ'),
          task: T('Thank Akari for bringing it back.', '{返|かえ}して くれた アカリ さん に お{礼|れい} を {言|い}いましょう 。'),
          replies: [
            ok('polite', ['ありがとう ございます 。'], 'Thank you.'),
            ok('friendly', ['?{返|かえ}して くれて', 'ありがとう 。'], '(Thanks for giving it back.) Thanks!'),
            no(['{筆|ふで} は', 'まだ {来|き}て いません 。'], 'The brush hasn\'t come yet.', 'The brush is back with you. This says it isn\'t.'),
          ],
          ack: T('It wrote beautifully. Thank you for lending it.', 'とても {書|か}きやすかった です 。 {貸|か}して くれて 、 ありがとう 。'),
          explain: { en: 'ありがとう(ございます) thanks her. ～てくれて ("for doing it for me") says what you are thanking her for.' },
          item: 'g:te_giving',
        },
        E: {
          msg: T('I\'ve left the brush I borrowed with the post house. It was very easy to write with.', 'お{借|か}り した {筆|ふで} 、 {郵便所|ゆうびんじょ} に {預|あず}けて おきました 。 とても {書|か}きやすかった です 。'),
          task: T('Say you have it back and thank her.', '{受|う}け{取|と}った と {伝|つた}えて 、 お{礼|れい} を {言|い}いましょう 。'),
          replies: [
            ok('polite', ['{筆|ふで} 、', '{受|う}け{取|と}りました 。', '{返|かえ}して くれて ありがとう ございます 。'], 'I\'ve got the brush. Thank you for returning it.'),
            ok('friendly', ['{筆|ふで} 、', '{受|う}け{取|と}った よ 。', 'ありがとう 。'], 'Got the brush. Thanks!'),
            ok('glad', ['{役|やく} に {立|た}って', 'よかった です 。', '?ありがとう ございます 。'], 'I\'m glad it was useful. (Thank you.)'),
            no(['{筆|ふで} は', 'あげます 。'], 'You can keep the brush.', 'Kind, but she has already returned it. This doesn\'t thank her.'),
            no(['{早|はや}く', '{返|かえ}して ください 。'], 'Please give it back soon.', 'She has already returned it.'),
          ],
          ack: T('I\'m glad it reached you. I\'ll buy a brush of my own next.', '{届|とど}いて よかった です 。 {今度|こんど} は {自分|じぶん} の {筆|ふで} を {買|か}います 。'),
          explain: { en: '{返|かえ}してくれてありがとう thanks her for the returning. {役|やく}に{立|た}ってよかった ("glad it helped") answers her compliment warmly.' },
          item: 'g:te_giving',
        },
        I: {
          msg: T('I\'ve returned the brush to the post house. I used it for the minutes at the records hall every day, and the tip wore down a little. I\'m sorry.', '{筆|ふで} を {郵便所|ゆうびんじょ} に {返|かえ}して おきました 。 {毎日|まいにち} {記録館|きろくかん} の {記録|きろく} に {使|つか}って いたら 、 {筆|ふで} の {先|さき} が {少|すこ}し {減|へ}って しまいました 。 すみません 。'),
          task: T('Thank her for returning it; the worn tip doesn\'t matter.', '{筆|ふで} の {先|さき} の こと は {気|き} に せず 、 {返|かえ}して くれた お{礼|れい} を {言|い}いましょう 。'),
          replies: [
            ok('polite', ['{返|かえ}して くださって', 'ありがとう ございます 。', '?{筆|ふで} の {先|さき} は {気|き} に しないで ください 。'], 'Thank you for returning it. (Don\'t worry about the tip.)'),
            ok('friendly', ['{返|かえ}して くれて', 'ありがとう 。', '?{使|つか}って もらえて {嬉|うれ}しい よ 。'], 'Thanks for bringing it back. (I\'m happy it got used.)'),
            ok('glad', ['たくさん {使|つか}って もらえて', '{筆|ふで} も {喜|よろこ}んで います 。', '?ありがとう ございます 。'], 'The brush is glad to have been used so much. (Thank you.)'),
            no(['{筆|ふで} の {先|さき} が {減|へ}った の は', '{困|こま}ります 。'], 'A worn tip is a problem for me.', 'This turns her apology into a complaint and doesn\'t thank her.'),
            no(['{新|あたら}しい {筆|ふで} を', '{買|か}って ください 。'], 'Please buy me a new brush.', 'This asks for compensation. The task is to thank her.'),
          ],
          ack: T('That\'s a relief to hear. I\'ll take good care of my own brushes from now on.', 'そう {言|い}って もらえて {安心|あんしん} しました 。 これ から は {自分|じぶん} の {筆|ふで} を {大事|だいじ} に します 。'),
          explain: { en: '～てくださって is the respectful "for doing it (for me)". Saying the worn tip doesn\'t matter ({気|き}にしないでください) is a kindness, not a requirement.' },
          item: 'g:te_giving',
        },
        A: {
          msg: T('I return your brush with thanks. I fear I have used it longer than I promised; I humbly ask your forgiveness for the delay.', 'お{借|か}り して いた {筆|ふで} を 、 お{礼|れい} と ともに お{返|かえ}し いたします 。 お{約束|やくそく} より {長|なが}く お{借|か}り して しまい 、 {遅|おそ}く なりました こと 、 お{詫|わ}び {申|もう}し{上|あ}げます 。'),
          task: T('Thank her for returning it, and answer her formality without making the delay a fault.', '{遅|おく}れ を {責|せ}めず 、 {丁寧|ていねい} な {手紙|てがみ} に {合|あ}わせて お{礼|れい} を {述|の}べましょう 。'),
          replies: [
            ok('formal', ['ご{丁寧|ていねい} に', 'お{返|かえ}し いただき 、', 'ありがとう ございました 。'], 'Thank you for so courteously returning it.'),
            ok('gracious', ['どうぞ お{気|き} に なさらず 。', 'わざわざ {届|とど}けて くださって 、', 'ありがとう ございました 。'], 'Please don\'t give it a thought. Thank you for taking the trouble to return it.', { fixed: true }),
            ok('warm', ['{長|なが}く {使|つか}って いただけて', '{嬉|うれ}しい です 。', 'ありがとう ございました 。'], 'I\'m glad it was used for so long. Thank you.'),
            no(['{遅|おそ}かった です ね 。'], 'You were late, weren\'t you.', 'True, perhaps, but it makes the delay her fault and thanks her for nothing.'),
            no(['{確|たし}か に', '{受|う}け{取|と}りました 。'], 'Duly received.', 'This confirms receipt but leaves out the thanks the task asks for.'),
          ],
          ack: T('Your kind words put my mind at ease. Thank you, truly.', '{温|あたた}かい お{言葉|ことば} に {救|すく}われました 。 {本当|ほんとう} に ありがとう ございます 。'),
          explain: { en: '～いただき / ～くださって thank respectfully for what she did. A receipt alone ({確|たし}かに{受|う}け{取|と}りました) is correct but not a thank-you.' },
          item: 'g:keigo_sonkei',
        },
      },
    },

    // ---- L07 · ask someone to repeat or explain a detail -----------------------------------------------
    {
      id: 'L07', from: 'shiori', met: 'seen.sg.shiori_early', fn: 'clarify',
      title: T('Smudged tide times', 'にじんだ {潮|しお} の {時刻|じこく}'),
      gist: 'Shiori\'s tide note has a detail you can\'t read. Ask, don\'t guess.',
      tiers: {
        F: {
          msg: T('Tomorrow\'s low tide is at ■■ o\'clock. — Shiori (the number is smudged)', '{明日|あした} の {引|ひ}き{潮|しお} は ■■ {時|じ} です 。 シオリ'),
          task: T('The number is smudged. Ask her the time.', '{数字|すうじ} が {読|よ}めません 。 {時間|じかん} を {聞|き}きましょう 。'),
          replies: [
            ok('polite', ['{何時|なんじ} です か 。'], 'What time is it?'),
            ok('request', ['もう {一度|いちど}', '{書|か}いて ください 。'], 'Please write it again.'),
            no(['{三時|さんじ} です ね 。'], 'Three o\'clock, right?', 'The number is smudged. This guesses.'),
          ],
          ack: T('Sorry, the ink ran. It\'s four o\'clock.', 'ごめんなさい 、 にじみました ね 。 {四時|よじ} です 。'),
          explain: { en: '{何時|なんじ}ですか asks the time; もう{一度|いちど}{書|か}いてください asks her to write it again. A guessed tide time could strand you on the causeway.' },
          item: 'g:qword_ka_mo',
        },
        E: {
          msg: T('The causeway opens tomorrow from ■■ until sunset. Please don\'t be late.', '{明日|あした} 、 {岬|みさき} の {道|みち} は ■■ から {日暮|ひぐ}れ まで {通|とお}れます 。 {遅|おく}れない で ください ね 。'),
          task: T('The opening time is smudged. Ask her to tell you again.', '{何時|なんじ} から か {読|よ}めません 。 もう {一度|いちど} {聞|き}きましょう 。'),
          replies: [
            ok('polite', ['{何時|なんじ} から', '{通|とお}れます か 。'], 'From what time can we cross?'),
            ok('request', ['{時間|じかん} が {読|よ}めません 。', 'もう {一度|いちど} {教|おし}えて ください 。'], 'I can\'t read the time. Please tell me again.'),
            ok('friendly', ['{何時|なんじ} から ？'], 'From what time?'),
            no(['{日暮|ひぐ}れ から', '{渡|わた}ります 。'], 'We\'ll cross from sunset.', 'Sunset is when the way closes. This misreads the note instead of asking.'),
            no(['{朝|あさ} から', '{行|い}きます 。'], 'We\'ll go from the morning.', 'The start time is smudged. This guesses it.'),
          ],
          ack: T('My apologies. From two in the afternoon.', '{失礼|しつれい} しました 。 {午後|ごご} {二時|にじ} から です 。'),
          explain: { en: '～から ("from") asks for the start. {読|よ}めません ("I can\'t read it") says plainly why you are asking.' },
          item: 'g:prt_kara_made',
        },
        I: {
          msg: T('Cross after the slack water. The causeway is safe for about two hours after that.', '{潮止|しおど}まり の {後|あと} に {渡|わた}って ください 。 それ から {二時間|にじかん} ほど は {大丈夫|だいじょうぶ} です 。'),
          task: T('You don\'t know what {潮止|しおど}まり means. Ask her to explain it.', '「 {潮止|しおど}まり 」 の {意味|いみ} が {分|わ}かりません 。 {説明|せつめい} して もらいましょう 。'),
          replies: [
            ok('polite', ['{潮止|しおど}まり と は', '{何|なん} です か 。'], 'What is "slack water"?'),
            ok('request', ['{潮止|しおど}まり の {意味|いみ} を', '{教|おし}えて ください 。'], 'Please tell me what "slack water" means.'),
            ok('friendly', ['{潮止|しおど}まり って', '{何|なに} ？'], 'What\'s "slack water"?'),
            no(['{分|わ}かりました 。', '{二時間|にじかん} {後|あと} に {渡|わた}ります 。'], 'Understood. We\'ll cross two hours later.', 'You didn\'t understand, and this also changes "safe for two hours" into "cross in two hours".', { fixed: true }),
            no(['{潮止|しおど}まり は', '{朝|あさ} です ね 。'], 'Slack water is in the morning, right?', 'This guesses a meaning instead of asking for it.'),
          ],
          ack: T('It\'s the moment the tide stops moving, before it turns. Tomorrow that\'s at about one.', '{潮|しお} が {止|と}まって 、 {向|む}き が {変|か}わる {前|まえ} の {時|とき} です 。 {明日|あした} は {一時|いちじ} ごろ です よ 。'),
          explain: { en: '～とは{何|なん}ですか and ～って{何|なに}? ask what a word means. Pretending to understand ({分|わ}かりました) would build on a guess.' },
          item: 'g:prt_tte',
        },
        A: {
          msg: T('As I said before, mind the tide on the day of the full moon. If anything is unclear, please don\'t hesitate to ask.', '{先日|せんじつ} {申|もう}し{上|あ}げた とおり 、 {満月|まんげつ} の {日|ひ} は {潮|しお} に お{気|き} を つけ ください 。 ご{不明|ふめい} な {点|てん} が あれば 、 {遠慮|えんりょ} なく お{尋|たず}ね ください 。'),
          task: T('You never heard what she said "before". Ask her, politely, to repeat it.', '「 {先日|せんじつ} {申|もう}し{上|あ}げた こと 」 を {聞|き}いて いません 。 {丁寧|ていねい} に もう {一度|いちど} {頼|たの}みましょう 。'),
          replies: [
            ok('formal', ['{恐|おそ}れ{入|い}ります が 、', '{先日|せんじつ} の お{話|はなし} を', 'もう {一度|いちど} {伺|うかが}えます でしょう か 。'], 'I\'m sorry to trouble you, but could I hear what you said the other day once more?'),
            ok('polite', ['すみません 、', '{先日|せんじつ} の お{話|はなし} を', '{聞|き}きそびれて しまいました 。', 'もう {一度|いちど} {教|おし}えて ください 。'], 'Sorry, I missed what you said the other day. Please tell me again.', { fixed: true }),
            ok('plain', ['{前|まえ} に {言|い}って いた こと 、', 'もう {一度|いちど} {教|おし}えて もらえます か 。'], 'Could you tell me again what you said before?'),
            no(['{承知|しょうち} して おります 。'], 'I am aware of it.', 'You never heard it. Saying you know it invents an understanding you don\'t have.'),
            no(['{満月|まんげつ} の {日|ひ} は', '{渡|わた}りません 。'], 'I won\'t cross on the day of the full moon.', 'A cautious guess, but it isn\'t what she said; you still don\'t know.'),
          ],
          ack: T('Of course. On full-moon days the tide comes back an hour early. Please plan for that.', 'もちろん です 。 {満月|まんげつ} の {日|ひ} は 、 {潮|しお} が {一時間|いちじかん} {早|はや}く {戻|もど}ります 。 その {分|ぶん} を {見込|みこ}んで ください 。'),
          explain: { en: '{恐|おそ}れ{入|い}りますが and ～{伺|うかが}えますでしょうか make a polite request to repeat; {聞|き}きそびれる means "to miss hearing". {承知|しょうち}しております would claim knowledge you lack.' },
          item: 'g:keigo_kenjo',
        },
      },
    },

    // ---- L08 · explain that a reply can wait -------------------------------------------------------------
    {
      id: 'L08', from: 'hoshino', met: 'seen.sb.hoshino', fn: 'no-hurry',
      title: T('A question about the stars', '{星|ほし} の {問|と}い'),
      gist: 'Hoshino will answer your question later. Tell him there\'s no hurry.',
      tiers: {
        F: {
          msg: T('I\'m looking into your question about the stars. Please wait a little for my answer. — Hoshino', '{星|ほし} の こと 、 {今|いま} {調|しら}べて います 。 {返事|へんじ} は {少|すこ}し {待|ま}って ください 。 ホシノ'),
          task: T('Tell him there\'s no hurry.', '{急|いそ}がなくて いい と {伝|つた}えましょう 。'),
          replies: [
            ok('polite', ['ゆっくり で', 'いい です 。'], 'Take your time.'),
            ok('friendly', ['{急|いそ}がなくて', 'いい よ 。'], 'No need to hurry.'),
            no(['{明日|あした} まで に', 'ください 。'], 'Please give it to me by tomorrow.', 'This sets a deadline. The task is to say there is no hurry.'),
          ],
          ack: T('Thank you. Then I\'ll look into it properly.', 'ありがとう 。 では 、 しっかり {調|しら}べる よ 。'),
          explain: { en: 'ゆっくりでいい ("slowly is fine") and {急|いそ}がなくていい ("you needn\'t hurry") take the pressure off.' },
          item: 'g:v_temo_ii',
        },
        E: {
          msg: T('The sky has been cloudy, so I can\'t check the star yet. Sorry to keep you waiting for an answer.', '{曇|くも}り が {続|つづ}いて 、 まだ {星|ほし} を {確|たし}かめられません 。 お{返事|へんじ} を お{待|ま}たせ して 、 すみません 。'),
          task: T('Tell him the answer can wait until the sky clears.', '{晴|は}れる まで {待|ま}てる と {伝|つた}えましょう 。'),
          replies: [
            ok('polite', ['{晴|は}れて から で', '{大丈夫|だいじょうぶ} です 。'], 'After it clears is fine.'),
            ok('friendly', ['{急|いそ}がなくて いい よ 。', '{晴|は}れる まで {待|ま}つ ね 。'], 'No hurry. I\'ll wait until it clears.'),
            ok('brief', ['お{返事|へんじ} は', 'いつ でも いい です 。'], 'Your answer can come any time.'),
            no(['{早|はや}く', '{教|おし}えて ください 。'], 'Please tell me soon.', 'This hurries him. The task is the opposite.'),
            no(['{曇|くも}り でも', '{見|み}て ください 。'], 'Please look even if it\'s cloudy.', 'He can\'t see the star through cloud. This asks the impossible instead of letting the answer wait.'),
          ],
          ack: T('That\'s kind. I\'ll write as soon as the sky clears.', '{助|たす}かる よ 。 {晴|は}れたら すぐ {書|か}く から 。'),
          explain: { en: '～てからで{大丈夫|だいじょうぶ}です: "after (it clears) is fine". いつでもいい ("any time is fine") also says the reply can wait.' },
          item: 'g:v_te_kara',
        },
        I: {
          msg: T('About the moving light you asked about: I want to compare it with my old charts before I answer. It may take a while.', 'お{尋|たず}ね の {動|うご}く {光|ひかり} に ついて は 、 {古|ふる}い {星図|せいず} と {比|くら}べて から お{答|こた}え したい 。 {少|すこ}し {時間|じかん} が かかる かも しれない 。'),
          task: T('Tell him to take as long as he needs; you aren\'t waiting on it.', '{必要|ひつよう} な だけ {時間|じかん} を かけて いい と {伝|つた}えましょう 。'),
          replies: [
            ok('polite', ['どうぞ', 'ご{自分|じぶん} の ペース で', 'お{調|しら}べ ください 。'], 'Please investigate at your own pace.'),
            ok('friendly', ['{急|いそ}ぎ じゃ ない から 、', 'ゆっくり {比|くら}べて ね 。'], 'It\'s not urgent, so compare them slowly.'),
            ok('brief', ['お{返事|へんじ} は', 'お{急|いそ}ぎ に ならなくて {結構|けっこう} です 。'], 'There\'s no need to hurry your answer.'),
            no(['{星図|せいず} と', '{比|くら}べなくて いい です 。'], 'You don\'t need to compare with the charts.', 'This waves away his method instead of letting the answer wait.'),
            no(['{来週|らいしゅう} まで に', 'お{願|ねが}い します 。'], 'By next week, please.', 'A deadline, however polite, is the opposite of "it can wait".'),
          ],
          ack: T('Then I\'ll take my time and do it properly. I\'ll write when I\'m sure.', 'では 、 じっくり やらせて もらう よ 。 {確|たし}か に なったら {書|か}く 。'),
          explain: { en: 'ご{自分|じぶん}のペースで and {急|いそ}ぎじゃない say the timing is his. ～なくて{結構|けっこう}です is a polite "there is no need to…".' },
          item: 'g:v_nakereba',
        },
        A: {
          msg: T('Forgive me for not yet replying to your letter of last month. With the spring post there has been much to do, and I have been remiss.', '{先月|せんげつ} いただいた お{手紙|てがみ} に 、 まだ お{返事|へんじ} も せず に {失礼|しつれい} して おります 。 {春|はる} の {便|びん} で {何|なに} かと {慌|あわ}ただしく 、 {申|もう}し{訳|わけ} ない 。'),
          task: T('Reassure him that the reply can wait, without making him feel he must hurry or apologise again.', '{返事|へんじ} は {急|いそ}がない と {伝|つた}え 、 {相手|あいて} が また {謝|あやま}らなくて すむ よう に しましょう 。'),
          replies: [
            ok('formal', ['どうぞ お{気遣|きづか}い なく 。', 'お{手|て} すき の {折|おり} に', 'いただければ {十分|じゅうぶん} です 。'], 'Please don\'t trouble yourself. Whenever you have a free moment will be more than enough.', { fixed: true }),
            ok('polite', ['お{忙|いそが}しい {時|とき} です から 、', 'お{返事|へんじ} は', 'いつ でも {構|かま}いません 。'], 'You\'re busy, so your reply can come whenever you like.'),
            ok('plain', ['{返事|へんじ} は', 'いつ でも いい です よ 。', '{春|はる} の {便|びん} 、 お{疲|つか}れ さま です 。'], 'Reply whenever. Thank you for all the work on the spring post.', { fixed: true }),
            no(['{確|たし}か に', 'お{待|ま}ち して おりました 。'], 'I have indeed been waiting.', 'Honest, perhaps, but it agrees that he has kept you waiting and invites another apology.'),
            no(['なるべく {早|はや}く', 'お{願|ねが}い します 。'], 'As soon as possible, please.', 'This adds the urgency the task asks you to take away.'),
          ],
          ack: T('Your kindness is a comfort. I shall write at leisure, but write I will.', 'お{心遣|こころづか}い 、 {痛|いた}み{入|い}ります 。 ゆっくり と 、 でも {必|かなら}ず {書|か}きます 。'),
          explain: { en: 'お{気遣|きづか}いなく ("no need to worry about me") and お{手|て}すきの{折|おり}に ("when you have a free moment") take the pressure off politely. {確|たし}かにお{待|ま}ちしておりました confirms the delay instead.' },
          item: 'g:keigo_kenjo',
        },
      },
    },

    // ---- L09 · distinguish a request from a promise ------------------------------------------------------
    {
      id: 'L09', from: 'lf_tokuji', met: 'seen.lf.tokuji_story', fn: 'request-vs-promise',
      title: T('The boat at the sluice', '{水門|すいもん} の {舟|ふね}'),
      gist: 'Tokuji promises one thing and asks another. Answer what he asks.',
      tiers: {
        F: {
          msg: T('I\'ll lend you the boat. Please bring one rope. — Tokuji', '{舟|ふね} を {貸|か}します 。 {縄|なわ} を {一本|いっぽん} {持|も}って {来|き}て ください 。 トクジ'),
          task: T('He asks you for something. Reply that you\'ll do it.', 'トクジ さん は {何|なに} か を {頼|たの}んで います 。 「 します 」 と {答|こた}えましょう 。'),
          replies: [
            ok('polite', ['{縄|なわ} を', '{持|も}って {行|い}きます 。'], 'I\'ll bring the rope.'),
            ok('friendly', ['{縄|なわ} 、', '{持|も}って {行|い}く ね 。'], 'I\'ll bring a rope!'),
            no(['{舟|ふね} を', '{貸|か}します 。'], 'I\'ll lend you the boat.', 'Lending the boat is his promise, not what he asks of you.'),
          ],
          ack: T('Right. I\'ll have the boat ready.', 'よし 。 {舟|ふね} は {用意|ようい} して おく 。'),
          explain: { en: '～てください ("please do…") is the request: the rope. {貸|か}します ("I will lend") is what he promises.' },
          item: 'g:v_te_kudasai',
        },
        E: {
          msg: T('I\'ll take you out to the bell tower in my boat. In return, could you bring some oil for the lamp on your way back?', '{鐘|かね} の {塔|とう} まで {舟|ふね} で {送|おく}ります 。 その {代|か}わり 、 {帰|かえ}り に ランプ の {油|あぶら} を {買|か}って {来|き}て もらえません か 。'),
          task: T('Say you\'ll do what he asks.', 'トクジ さん が {頼|たの}んで いる こと を 、 する と {答|こた}えましょう 。'),
          replies: [
            ok('polite', ['{帰|かえ}り に', '{油|あぶら} を {買|か}って {行|い}きます 。'], 'I\'ll buy the oil on my way back.'),
            ok('friendly', ['いい よ 。', '{油|あぶら} 、 {買|か}って くる ね 。'], 'Sure. I\'ll get the oil.'),
            ok('brief', ['{油|あぶら} の {件|けん} 、', '{引|ひ}き{受|う}けました 。'], 'I\'ll take care of the oil.'),
            no(['{塔|とう} まで', '{送|おく}ります 。'], 'I\'ll take you to the tower.', 'Taking you to the tower is his promise. You don\'t have the boat.'),
            no(['{油|あぶら} を', '{送|おく}って ください 。'], 'Please send me oil.', 'This turns his request around and asks him for the oil.'),
          ],
          ack: T('Much obliged. The lamp\'s been burning low.', '{助|たす}かる 。 ランプ が {暗|くら}く なって {困|こま}って いた ん だ 。'),
          explain: { en: '～てもらえませんか ("could you…?") is the request; {送|おく}ります ("I\'ll take you") is his promise. Answering the request shows you read which is which.' },
          item: 'g:te_giving',
        },
        I: {
          msg: T('I\'ll keep the sluice gate open until noon. But I can\'t promise the water will be low enough. Could you check the gate plate before you set out?', '{昼|ひる} まで は {水門|すいもん} を {開|あ}けて おく 。 ただ 、 {水|みず} が {十分|じゅうぶん} {引|ひ}く か は {約束|やくそく} できない 。 {出|で}る {前|まえ} に 、 {門|もん} の {札|ふだ} を {確|たし}かめて くれない か 。'),
          task: T('Reply to his request, and show you know what he did not promise.', '{頼|たの}まれた こと に {答|こた}え 、 {約束|やくそく} されて いない こと も {分|わ}かって いる と {示|しめ}しましょう 。'),
          replies: [
            ok('polite', ['{出|で}る {前|まえ} に', '{札|ふだ} を {確|たし}かめます 。', '?{水|みず} が {引|ひ}かなければ 、 {待|ま}ちます 。'], 'I\'ll check the plate before setting out. (If the water hasn\'t gone down, I\'ll wait.)'),
            ok('friendly', ['{分|わ}かった 。', '{札|ふだ} 、 {見|み}て から {出|で}る ね 。'], 'Got it. I\'ll look at the plate before I go.'),
            ok('brief', ['{札|ふだ} の {確認|かくにん} 、', '{承知|しょうち} しました 。'], 'Checking the plate — understood.'),
            no(['{昼|ひる} まで に', '{水|みず} が {引|ひ}く ん です ね 。'], 'So the water will be down by noon.', 'He promised the gate stays open until noon — not that the water will be low.'),
            no(['{水門|すいもん} を', '{開|あ}けて おきます 。'], 'I\'ll keep the sluice gate open.', 'Keeping the gate open is his promise; checking the plate is his request.'),
          ],
          ack: T('Good. Read the plate and you\'ll know whether the boat can go.', 'それ で いい 。 {札|ふだ} を {読|よ}めば 、 {舟|ふね} が {出|だ}せる か {分|わ}かる 。'),
          explain: { en: 'His promise: the gate stays open until {昼|ひる} (noon). Not promised: the water level ({約束|やくそく}できない). His request: ～てくれないか — check the plate.' },
          item: 'g:te_giving',
        },
        A: {
          msg: T('As promised, I\'ll take you to the tower. That I will do. Whether the bell can be rung, though, I can\'t say. If it can\'t, would you at least read the inscription on it for me?', '{約束|やくそく} どおり 、 {塔|とう} まで は {送|おく}る 。 それ は {請|う}け{合|あ}う 。 ただ 、 {鐘|かね} が {鳴|な}らせる か どう か まで は {分|わ}からん 。 {鳴|な}らせなかったら 、 せめて {鐘|かね} の {銘|めい} を {読|よ}んで きて は くれない か 。'),
          task: T('Accept his request without treating his uncertainty as a promise.', '{分|わ}からない と {言|い}われた こと を {約束|やくそく} と {取|と}らず に 、 {頼|たの}み を {引|ひ}き{受|う}けましょう 。'),
          replies: [
            ok('polite', ['{鳴|な}らせなかった {時|とき} は 、', '{銘|めい} を {読|よ}んで {来|き}ます 。'], 'If it can\'t be rung, I\'ll read the inscription.'),
            ok('formal', ['{銘|めい} の {件|けん} 、', '{確|たし}か に {承|うけたまわ}りました 。'], 'The matter of the inscription — I have duly taken it on.'),
            ok('friendly', ['{分|わ}かった 。', 'だめ だったら 、 {銘|めい} を {読|よ}んで くる よ 。'], 'Got it. If it doesn\'t work, I\'ll read the inscription.'),
            no(['{鐘|かね} を {鳴|な}らせる よう に して ください 。'], 'Please make sure the bell can be rung.', 'He said he can\'t promise that. This asks him for the one thing he declined to guarantee.'),
            no(['{鐘|かね} は {必|かなら}ず', '{鳴|な}らして きます 。'], 'I\'ll ring the bell without fail.', 'Nobody knows if the bell can be rung. This promises something no one can.'),
          ],
          ack: T('That\'s all I ask. Whether it rings or not, the inscription will tell us something.', 'それ で {十分|じゅうぶん} だ 。 {鳴|な}って も {鳴|な}らなくて も 、 {銘|めい} は {何|なに} か を {教|おし}えて くれる 。'),
          explain: { en: '{請|う}け{合|あ}う ("guarantee") marks his promise; ～まではわからん marks what he won\'t promise; ～てはくれないか is his request. {承|うけたまわ}りました is a formal "I accept the task".' },
          item: 'g:te_giving',
        },
      },
    },

    // ---- L10 · offer help with a stated boundary ---------------------------------------------------------
    {
      id: 'L10', from: 'co_isao', met: 'seen.co.isao_first', fn: 'bounded-offer',
      title: T('Glass to carry', '{運|はこ}ぶ ガラス'),
      gist: 'Master Isao needs help carrying glass. Offer what you can — and say its limit.',
      tiers: {
        F: {
          msg: T('I\'m carrying glass. Can you lend a hand? — Isao', 'ガラス を {運|はこ}ぶ 。 {手|て} を {貸|か}せる か 。 イサオ'),
          task: T('You can help in the morning only. Offer that.', '{朝|あさ} だけ なら {手伝|てつだ}えます 。 そう {伝|つた}えましょう 。'),
          replies: [
            ok('polite', ['{朝|あさ} だけ なら', '{手伝|てつだ}えます 。'], 'I can help, but only in the morning.'),
            ok('friendly', ['{朝|あさ} だけ', '{手伝|てつだ}う よ 。'], 'I\'ll help in the morning only.'),
            no(['いつ でも', '{手伝|てつだ}います 。'], 'I\'ll help any time.', 'You can only come in the morning. This promises more than you can give.'),
          ],
          ack: T('The morning\'s plenty. The heavy ones go first.', '{朝|あさ} で {十分|じゅうぶん} だ 。 {重|おも}い の から {運|はこ}ぶ 。'),
          explain: { en: '～だけなら ("if it\'s only…") sets the limit. いつでも ("any time") would offer unlimited help.' },
          item: 'g:prt_dake_shika',
        },
        E: {
          msg: T('The new kiln\'s windows came. I need to carry thirty panes to the workshop row. Could you help?', '{新|あたら}しい {窯|かま} の {窓|まど} が {届|とど}いた 。 {工房|こうぼう} {通|どお}り まで {三十枚|さんじゅうまい} {運|はこ}ぶ 。 {手伝|てつだ}って くれる か 。'),
          task: T('Offer to help for an hour — say the limit.', '{一時間|いちじかん} だけ {手伝|てつだ}える と 、 {限|かぎ}り を {伝|つた}えましょう 。'),
          replies: [
            ok('polite', ['{一時間|いちじかん} だけ なら', '{手伝|てつだ}えます 。'], 'I can help, for an hour.'),
            ok('friendly', ['{一時間|いちじかん} くらい なら', '{手伝|てつだ}える よ 。'], 'I can help for an hour or so.'),
            ok('brief', ['{一時間|いちじかん}', 'お{手伝|てつだ}い します 。'], 'I\'ll help for an hour.'),
            no(['{全部|ぜんぶ}', '{私|わたし} が {運|はこ}びます 。'], 'I\'ll carry all of them myself.', 'Generous, but it offers far more than an hour, and no limit at all.'),
            no(['{手伝|てつだ}えません 。'], 'I can\'t help.', 'You can help for an hour. This turns the offer into a refusal.'),
          ],
          ack: T('Even an hour is a great help. I\'ll give you the heavy ones first.', '{一時間|いちじかん} でも {大助|おおだす}かり だ 。 {重|おも}い {物|もの} から {頼|たの}む 。'),
          explain: { en: '{一時間|いちじかん}だけ ("just one hour") or くらいなら ("about…, if that") marks a bounded offer. It is kind to say the limit up front.' },
          item: 'g:prt_dake_shika',
        },
        I: {
          msg: T('We\'re cutting the firebreak on the slope tomorrow. It\'ll take all day. If you can spare any time at all, I\'d be grateful.', '{明日|あした} 、 {斜面|しゃめん} の {火除|ひよ}け{道|みち} を {刈|か}る 。 {一日|いちにち} かかる 。 {少|すこ}し でも {時間|じかん} が あれば 、 {助|たす}かる 。'),
          task: T('Offer help until noon, then say you must leave.', '{昼|ひる} まで は {手伝|てつだ}える が 、 その {後|あと} は {出|で}かける と {伝|つた}えましょう 。'),
          replies: [
            ok('polite', ['{昼|ひる} まで なら', '{手伝|てつだ}えます 。', '{午後|ごご} は {出|で}かけます 。'], 'I can help until noon. In the afternoon I\'ll be out.'),
            ok('friendly', ['{昼|ひる} まで なら', '{手伝|てつだ}える よ 。', 'その {後|あと} は {用事|ようじ} が ある んだ 。'], 'I can help until noon. After that I have something on.'),
            ok('brief', ['{午前中|ごぜんちゅう} だけ', 'お{手伝|てつだ}い します 。'], 'I\'ll help in the morning only.'),
            no(['{一日中|いちにちじゅう}', '{手伝|てつだ}います 。'], 'I\'ll help all day.', 'You have to leave at noon. This offers the whole day.'),
            no(['{昼|ひる} から', '{手伝|てつだ}います 。'], 'I\'ll help from noon.', 'Noon is when you leave, not when you start.'),
          ],
          ack: T('Until noon, then. We\'ll do the steep part while you\'re here.', '{昼|ひる} まで か 。 なら 、 {急|きゅう} な ところ を {先|さき} に やろう 。'),
          explain: { en: '～までなら ("if it\'s until…") bounds the offer; {昼|ひる}まで ("until noon") and {昼|ひる}から ("from noon") point in opposite directions.' },
          item: 'g:prt_kara_made',
        },
        A: {
          msg: T('I\'ve been asked to make lamp glass for the archive\'s new reading room. There\'s no end to the work, frankly. I won\'t ask for much — but if you could lend a hand now and then, I\'d be thankful.', '{書庫|しょこ} の {新|あたら}しい {閲覧室|えつらんしつ} の ランプ の ガラス を {頼|たの}まれた 。 {正直|しょうじき} 、 きり が ない 。 {無理|むり} は {言|い}わん が 、 {時々|ときどき} {手|て} を {貸|か}して もらえる と ありがたい 。'),
          task: T('Offer help, but bound it clearly: once a week, while you are in Cinder Orchard.', '{週|しゅう} に {一度|いちど} 、 {灰実|はいみ} に いる {間|あいだ} だけ 、 と {限|かぎ}り を はっきり させて {申|もう}し{出|で}ましょう 。'),
          replies: [
            ok('polite', ['{灰実|はいみ} に いる {間|あいだ} は 、', '{週|しゅう} に {一度|いちど} なら', 'お{手伝|てつだ}い できます 。'], 'While I\'m in Cinder Orchard, I can help once a week.'),
            ok('formal', ['こちら に いる {間|あいだ} に {限|かぎ}り 、', '{週|しゅう} {一回|いっかい} {伺|うかが}います 。'], 'For the length of my stay only, I\'ll come once a week.'),
            ok('plain', ['ここ に いる うち は 、', '{週一|しゅういち} で {手伝|てつだ}います よ 。'], 'While I\'m here, I\'ll help once a week.'),
            no(['{何|なん} でも {言|い}って ください 。', 'いつ でも {来|き}ます 。'], 'Ask me anything. I\'ll come any time.', 'Warm, but "any time" for work with "no end" promises unlimited availability.', { fixed: true }),
            no(['{時々|ときどき} なら', '{手伝|てつだ}います 。'], 'I\'ll help now and then.', 'This repeats his "now and then" without the limit the task asks you to state.'),
          ],
          ack: T('Once a week while you\'re here — that\'s clear, and that\'s plenty. I\'ll plan around it.', 'いる {間|あいだ} 、 {週|しゅう} に {一度|いちど} か 。 はっきり して いて {助|たす}かる 。 それ に {合|あ}わせて {段取|だんど}り を する 。'),
          explain: { en: '～{間|あいだ}は ("while…") and ～に{限|かぎ}り ("limited to…") bound an open-ended request. {時々|ときどき} matches his wording but leaves the limit unsaid.' },
          item: 'g:toki',
        },
      },
    },

    // ---- L11 · confirm a proposed sequence --------------------------------------------------------------
    {
      id: 'L11', from: 'tsuru', met: 'seen.rw.tsuru_first', fn: 'sequence',
      title: T('First the hall, then the bridge', '{先|さき} に {堂|どう} 、 それ から {橋|はし}'),
      gist: 'Keeper Tsuru proposes an order of things. Confirm it — in that order.',
      tiers: {
        F: {
          msg: T('First come to the Lantern Hall. Then we\'ll go to the bridge. — Tsuru', 'まず {灯|あか}り{堂|どう} に {来|き}て おくれ 。 それ から {橋|はし} へ {行|い}こう 。 ツル'),
          task: T('Confirm the order: the hall first, then the bridge.', '{順番|じゅんばん} を {確|たし}かめましょう 。 {先|さき} に {灯|あか}り{堂|どう} 、 {次|つぎ} に {橋|はし} です 。'),
          replies: [
            ok('polite', ['{先|さき} に {灯|あか}り{堂|どう} 、', 'それ から {橋|はし} です ね 。'], 'The hall first, and then the bridge.'),
            ok('friendly', ['{灯|あか}り{堂|どう} が {先|さき} で 、', '{次|つぎ} が {橋|はし} だ ね 。'], 'The hall first, the bridge next.'),
            no(['{先|さき} に {橋|はし} 、', 'それ から {灯|あか}り{堂|どう} です ね 。'], 'The bridge first, then the hall.', 'That reverses her order.'),
          ],
          ack: T('That\'s right. Don\'t hurry.', 'そう だ よ 。 {急|いそ}がなくて いい 。'),
          explain: { en: 'まず / {先|さき}に ("first") and それから / {次|つぎ} ("then", "next") keep the order she asked for.' },
          item: 'g:v_te_kara',
        },
        E: {
          msg: T('Bring the boots to Oto\'s shop before lunch. After lunch, take them to the bridge.', 'お{昼|ひる} の {前|まえ} に 、 {靴|くつ} を オト の {店|みせ} へ {持|も}って {行|い}って おくれ 。 お{昼|ひる} の {後|あと} で 、 {橋|はし} へ {届|とど}けて おくれ 。'),
          task: T('Confirm the order: Oto\'s shop before lunch, the bridge after.', '{順番|じゅんばん} を {確|たし}かめましょう 。'),
          replies: [
            ok('polite', ['お{昼|ひる} の {前|まえ} に オト さん の {店|みせ} 、', 'お{昼|ひる} の {後|あと} で {橋|はし} です ね 。'], 'Oto\'s shop before lunch, the bridge after lunch.'),
            ok('friendly', ['{先|さき} に {店|みせ} で 、', '{次|つぎ} に {橋|はし} だ ね 。'], 'The shop first, then the bridge.'),
            ok('brief', ['{店|みせ} 、', 'それ から {橋|はし} 。', '{分|わ}かりました 。'], 'The shop, then the bridge. Understood.', { fixed: true }),
            no(['お{昼|ひる} の {前|まえ} に {橋|はし} 、', 'お{昼|ひる} の {後|あと} で {店|みせ} です ね 。'], 'The bridge before lunch, the shop after.', 'That swaps her order.'),
            no(['お{昼|ひる} に', '{両方|りょうほう} {行|い}きます 。'], 'I\'ll go to both at lunchtime.', 'She gave one before lunch and one after. This drops the order.'),
          ],
          ack: T('That\'s it. The bridge keeper\'s feet will thank you.', 'それ で いい 。 {橋|はし} の {灯守|ひもり} の {足|あし} も {喜|よろこ}ぶ よ 。'),
          explain: { en: '～の{前|まえ}に ("before…") and ～の{後|あと}で ("after…") fix the order. Confirming it back is how you show you have it the right way round.' },
          item: 'g:mae_ato',
        },
        I: {
          msg: T('When you\'ve rewritten the lanterns\' names, take the old papers to the hall. Burn them only after I\'ve read them.', '{灯|あか}り の {名前|なまえ} を {書|か}き{直|なお}したら 、 {古|ふる}い {紙|かみ} を {堂|どう} に {持|も}って {来|き}て おくれ 。 {燃|も}やす の は 、 あたし が {読|よ}んで から だ よ 。'),
          task: T('Confirm the sequence: rewrite, bring the old papers, she reads them, then burn.', '{書|か}き{直|なお}す → {持|も}って {行|い}く → {読|よ}んで もらう → {燃|も}やす 、 の {順|じゅん} を {確|たし}かめましょう 。'),
          replies: [
            ok('polite', ['{書|か}き{直|なお}して から {紙|かみ} を {持|も}って {行|い}きます 。', '{燃|も}やす の は 、 ツル さん が {読|よ}んだ {後|あと} です ね 。'], 'I\'ll bring the papers after rewriting. The burning comes after you\'ve read them.', { fixed: true }),
            ok('friendly', ['{書|か}き{直|なお}したら {持|も}って {行|い}く ね 。', '{読|よ}んで もらって から {燃|も}やす 。'], 'Once I\'ve rewritten them I\'ll bring them. Burn them after you read them.', { fixed: true }),
            ok('brief', ['{読|よ}んで いただく まで は', '{燃|も}やしません 。'], 'I won\'t burn them until you\'ve read them.'),
            no(['{古|ふる}い {紙|かみ} は 、', '{先|さき} に {燃|も}やして おきます 。'], 'I\'ll burn the old papers first.', 'She wants to read them before anything is burned. This reverses that.'),
            no(['{書|か}き{直|なお}す {前|まえ} に', '{紙|かみ} を {持|も}って {行|い}きます 。'], 'I\'ll bring the papers before rewriting.', 'The papers come to the hall after the rewriting.'),
          ],
          ack: T('That\'s the order. I want to know what they said before they go.', 'その {順番|じゅんばん} だ 。 {消|き}える {前|まえ} に 、 {何|なん} と {書|か}いて あった か {知|し}って おきたい の さ 。'),
          explain: { en: '～たら ("once…") and ～てから ("after…") chain the steps; ～まで(は){燃|も}やしません ("I won\'t burn until…") confirms the last condition.' },
          item: 'g:v_te_kara',
        },
        A: {
          msg: T('The order matters. Light the north lantern before the bridge one; and don\'t light either until the ferry has crossed. A light lit too early draws the boat to the wrong bank.', '{順序|じゅんじょ} を {違|たが}えない で おくれ 。 {北|きた} の {灯|あか}り は {橋|はし} の {灯|あか}り より {先|さき} 。 ただし 、 どちら も {渡|わた}し{舟|ぶね} が {渡|わた}り{切|き}る まで は ともさない こと 。 {早|はや}く ともす と 、 {舟|ふね} が {違|ちが}う {岸|きし} に {寄|よ}って しまう 。'),
          task: T('Confirm the full sequence, including the condition that comes before both.', '{両方|りょうほう} の {前|まえ} に {来|く}る {条件|じょうけん} も {含|ふく}めて 、 {順序|じゅんじょ} を {確|たし}かめましょう 。'),
          replies: [
            ok('polite', ['{舟|ふね} が {渡|わた}り{切|き}って から 、', '{北|きた} 、 {橋|はし} の {順|じゅん} で ともします 。'], 'Once the ferry has crossed, I\'ll light the north lantern, then the bridge one.'),
            ok('formal', ['{渡|わた}し{舟|ぶね} の {渡河|とか} を {待|ま}って 、', 'まず {北|きた} 、 {次|つぎ} に {橋|はし} を ともします 。'], 'Waiting for the ferry to cross, I\'ll light the north first and the bridge next.'),
            ok('plain', ['{舟|ふね} が {渡|わた}ったら 、', '{北|きた} が {先|さき} 、 {橋|はし} が {後|あと} 。', '{分|わ}かった 。'], 'After the ferry crosses: north first, bridge after. Got it.', { fixed: true }),
            no(['{北|きた} を ともして から 、', '{舟|ふね} を {待|ま}って {橋|はし} を ともします 。'], 'I\'ll light the north lantern, then wait for the ferry and light the bridge.', 'The north lantern would be lit before the ferry has crossed — the very thing she warns against.', { fixed: true }),
            no(['{橋|はし} が {先|さき} 、', '{北|きた} が {後|あと} です ね 。'], 'The bridge first, then the north.', 'That reverses her order.'),
          ],
          ack: T('Exactly. The boat first, then the north, then the bridge. You\'ve read it right.', 'その とおり 。 {舟|ふね} 、 {北|きた} 、 {橋|はし} 。 よく {読|よ}めて いる 。'),
          explain: { en: '～まではともさない ("don\'t light until…") governs both lanterns; ～より{先|さき} ("before…") orders them. ～てから / ～たら placed first keeps the condition in front of the whole sequence.' },
          item: 'g:v_te_kara',
        },
      },
    },

    // ---- L12 · respond when the message is genuinely ambiguous --------------------------------------
    {
      id: 'L12', from: 'genzo', met: 'seen.sg.genzo_wind', fn: 'ambiguous',
      title: T('"Bring that"', '「 あれ を {持|も}って {来|こ}い 」'),
      gist: 'Genzō\'s note could mean more than one thing. Ask a useful question.',
      tiers: {
        F: {
          msg: T('Bring that. — Genzō', 'あれ を {持|も}って {来|こ}い 。 ゲンゾウ'),
          task: T('You don\'t know what "that" is. Ask.', '「 あれ 」 が {何|なに} か {分|わ}かりません 。 {聞|き}きましょう 。'),
          replies: [
            ok('polite', ['「 あれ 」 は', '{何|なん} です か 。'], 'What is "that"?'),
            ok('which', ['どれ を', '{持|も}って {行|い}きます か 。'], 'Which one should I bring?'),
            no(['{油|あぶら} を', '{持|も}って {行|い}きます 。'], 'I\'ll bring oil.', 'He never said oil. This guesses.'),
          ],
          ack: T('Hmph. The rope, of course. …Fair enough, I didn\'t write it.', 'ふん 。 {縄|なわ} に {決|き}まって おる 。 …… まあ 、 {書|か}かなかった の は {俺|おれ} だ 。'),
          explain: { en: 'あれ points to something both people already know. When you don\'t, {何|なん}ですか or どれ ("which one") is the useful question.' },
          item: 'g:kosoado',
        },
        E: {
          msg: T('Bring the old lighthouse map. — Genzō', '{古|ふる}い {灯台|とうだい} の {地図|ちず} を {持|も}って {来|こ}い 。 ゲンゾウ'),
          task: T('"{古|ふる}い{灯台|とうだい}の{地図|ちず}" can mean an old map of the lighthouse, or a map of the old lighthouse. Ask which.', '「 {古|ふる}い {灯台|とうだい} の {地図|ちず} 」 は 、 {古|ふる}い の が {地図|ちず} か {灯台|とうだい} か 、 {分|わ}かりません 。 {聞|き}きましょう 。'),
          replies: [
            ok('polite', ['{古|ふる}い の は', '{地図|ちず} です か 、 {灯台|とうだい} です か 。'], 'Is it the map that\'s old, or the lighthouse?'),
            ok('which', ['どの {地図|ちず} を', '{持|も}って {行|い}けば いい です か 。'], 'Which map should I bring?'),
            ok('friendly', ['{古|ふる}い の って 、', '{地図|ちず} ？ {灯台|とうだい} ？'], 'The old one — the map, or the lighthouse?'),
            no(['{古|ふる}い {地図|ちず} を', '{持|も}って {行|い}きます 。'], 'I\'ll bring an old map.', 'That is one reading. He may mean a map of the old lighthouse, which needn\'t be old at all.'),
            no(['{分|わ}かりました 。'], 'Understood.', 'You can\'t tell which map yet. Saying you understand hides the question.'),
          ],
          ack: T('The map of the old lighthouse — the one on the point before this one. The map itself is new. Good thing you asked.', '{古|ふる}い {灯台|とうだい} の 、 {地図|ちず} だ 。 {今|いま} の {灯台|とうだい} の {前|まえ} に {岬|みさき} に あった やつ だ 。 {地図|ちず} は {新|あたら}しい 。 {聞|き}いて {正解|せいかい} だ 。'),
          explain: { en: 'In {古|ふる}い{灯台|とうだい}の{地図|ちず}, {古|ふる}い can describe the map or the lighthouse. Naming both readings in a question ({地図|ちず}ですか、{灯台|とうだい}ですか) lets him pick.' },
          item: 'g:prt_no',
        },
        I: {
          msg: T('Come up with Nagisa\'s letter or without. Either\'s fine.', 'ナギサ の {手紙|てがみ} を {持|も}って {来|く}る か 、 {持|も}って {来|こ}ない か 。 どっち でも いい 。'),
          task: T('"Either\'s fine" could be real indifference or a request he won\'t make. Ask what he would like.', '「 どっち でも いい 」 は {本当|ほんとう} に どちら でも いい の か 、 {頼|たの}み に くい の か 、 {分|わ}かりません 。 {希望|きぼう} を {聞|き}きましょう 。'),
          replies: [
            ok('polite', ['{手紙|てがみ} を {持|も}って {行|い}った {方|ほう} が', 'いい です か 。'], 'Would it be better if I brought the letter?'),
            ok('gentle', ['ゲンゾウ さん は 、', 'どちら が いい です か 。'], 'Which would you prefer, Genzō?'),
            ok('friendly', ['{手紙|てがみ} 、', '{持|も}って {行|い}こう か ？'], 'Shall I bring the letter?'),
            no(['では 、', '{持|も}って {行|い}きません 。'], 'Then I won\'t bring it.', 'This takes "either is fine" at face value and guesses the answer.'),
            no(['{手紙|てがみ} は', '{必要|ひつよう} ない です ね 。'], 'So you don\'t need the letter.', 'He didn\'t say that. This decides his meaning for him.'),
          ],
          ack: T('…Bring it. I\'d read it again.', '…… {持|も}って {来|こ}い 。 もう {一度|いちど} {読|よ}みたい 。'),
          explain: { en: 'どっちでもいい can mean real indifference, or be cover for a wish someone finds hard to say. ～た{方|ほう}がいいですか ("would it be better if…?") invites the true answer.' },
          item: 'g:comp_yori_hou',
        },
        A: {
          msg: T('About the lamp. Do as you see fit. …Though if it were me, I wouldn\'t touch it until spring.', '{灯|ひ} の こと だ が 、 {好|す}き に しろ 。 …… もっとも 、 {俺|おれ} なら {春|はる} まで {触|さわ}らん が な 。'),
          task: T('"Do as you see fit" and "I wouldn\'t touch it" pull in two directions. Ask what he actually wants, without guessing.', '「 {好|す}き に しろ 」 と 「 {俺|おれ} なら {触|さわ}らん 」 は {逆|ぎゃく} の {方|ほう} を {向|む}いて います 。 {推測|すいそく} せず に 、 {本当|ほんとう} の {希望|きぼう} を {尋|たず}ねましょう 。'),
          replies: [
            ok('polite', ['{春|はる} まで は', '{触|さわ}らない {方|ほう} が いい と いう こと です か 。'], 'Do you mean it\'s better not to touch it until spring?'),
            ok('direct', ['{本当|ほんとう} は 、', 'どう して ほしい です か 。'], 'What would you really like me to do?'),
            ok('formal', ['ゲンゾウ さん の お{考|かんが}え を 、', 'もう {少|すこ}し {詳|くわ}しく {伺|うかが}えます か 。'], 'Could you tell me a little more about what you think?'),
            no(['では 、', '{好|す}き に させて もらいます 。'], 'Then I\'ll do as I like.', 'This takes the first half and ignores the second, which may be what he really meant.'),
            no(['{春|はる} まで {触|さわ}りません 。'], 'I won\'t touch it until spring.', 'This settles on one reading without asking him which he meant.'),
          ],
          ack: T('…Hmph. Leave it till spring. I said "as you like" because I didn\'t want to give orders.', '…… ふん 。 {春|はる} まで {待|ま}て 。 「 {好|す}き に しろ 」 と {言|い}った の は 、 {命令|めいれい} したく なかった から だ 。'),
          explain: { en: '{好|す}きにしろ ("do as you like") can be generous or grudging; もっとも、{俺|おれ}なら… adds his own preference. A question that names the tension (～ということですか) lets him choose.' },
          item: 'g:sentence_final',
        },
      },
    },
  ];
})(RB.content);
