/* Chapter 6 encounters. Regular foes are visible on the maps and can be
 * walked around; every one of them can be settled with Unravel alone.
 * The Hush combines every intent the journey has taught, and its new
 * behaviour is announced with a teaching card at each phase. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  const pool = {
    tags: ['still'],
    F: ['v:名前', 'v:声', 'v:顔', 'v:火'],
    E: ['v:手紙', 'v:返事', 'v:約束', 'v:鐘', 'v:忘れる', 'v:返す', 'v:開ける', 'v:弟', 'v:棚'],
    I: ['v:記憶', 'v:預かる', 'v:写す', 'v:扉', 'v:反対', 'v:師匠', 'v:夜中'],
    A: ['v:書庫', 'v:曖昧', 'v:求める', 'v:鐘楼', 'v:覚悟'],
  };
  const choose = (prompt, ctx, options, explain, item) => ({ kind: 'choose', item: item || 'c:sa_intent', prompt: { en: prompt }, ctx, options, explain });

  C.enemies['sa.crane'] = {
    name: T('Paper Crane', '{折|お}り{鶴|づる}'), art: 'crane', artOpts: { col: '#f2eee2' }, look: { custom: 'crane', col: '#f2eee2' },
    region: 'still', bg: 'still', knots: 2, pool,
    pattern: ['gust', 'strike', 'rest'],
    intro: T('A crane of white paper takes off, though there is no wind.', '{白|しろ}い {紙|かみ} の {鶴|つる} が 、 {風|かぜ} も ない のに {舞|ま}い{上|あ}がった 。'),
    settle: T('The crane folds itself flat. Just paper again.', '{鶴|つる} は たたまれて 、 ただ の {紙|かみ} に {戻|もど}った 。'),
  };
  C.enemies['sa.wraith'] = {
    name: T('Hush Wraith', '{静寂|しじま} の {影|かげ}'), art: 'hush', look: { custom: 'sa_wraith' },
    region: 'still', bg: 'still', knots: 3, pool,
    pattern: ['silence', 'strike', 'mend', 'rest'],
    intro: T('A shade with no sound to it turns your way.', '{音|おと} の ない {影|かげ} が 、 こちら を {向|む}いた 。'),
    settle: T('The shade comes apart. Somewhere far off, someone coughs.', '{影|かげ} は ほどけて 、 {遠|とお}く で {誰|だれ}か が {咳|せき} を した 。'),
  };
  C.enemies['sa.ghost'] = {
    name: T('Nameless Lantern', '{名無|なな}し の {提灯|ちょうちん}'), art: 'lantern', artOpts: { col: '#9aa8d8' }, look: { custom: 'lanternghost' },
    region: 'still', bg: 'still', knots: 3, pool,
    pattern: ['shroud', 'heat', 'strike', 'rest'],
    intro: T('A lantern whose name has worn away glows dimly at you.', '{名前|なまえ} の {消|き}えた {提灯|ちょうちん} が 、 ぼんやり と {光|ひか}って いる 。'),
    settle: T('Faintly, a place name surfaces on the paper shade.', '{提灯|ちょうちん} の {紙|かみ} に 、 {薄|うす}く {地名|ちめい} が {浮|う}かんだ 。'),
  };
  C.enemies['sa.moth'] = {
    name: T('Catalogue Moth', '{目録|もくろく} の {蛾|が}'), art: 'moth', artOpts: { col: '#e4dcc8', col2: '#b8a890' }, look: { custom: 'moth', col: '#e4dcc8' },
    region: 'still', bg: 'still', knots: 2, pool,
    pattern: ['charge', 'strike', 'chill', 'rest'],
    intro: T('A moth that eats labels is nibbling at a catalogue card.', 'ラベル を {食|た}べる {蛾|が} が 、 {目録|もくろく} の {紙|かみ} を かじって いる 。'),
    settle: T('The moth crumbles to dust, and the letters come back onto the card.', '{蛾|が} は {粉|こな} に なって 、 {紙|かみ} に {文字|もじ} が {戻|もど}った 。'),
  };

  // The echo repeats a promise someone made, turned inside out. Seeing through
  // it means recovering what the promise really said (negation matters).
  C.enemies['sa.echo'] = {
    name: T('Shelved Echo', '{棚|たな} の {木霊|こだま}'), art: 'echo', artOpts: { col: '#b8c8e0' }, look: { custom: 'sa_echo' },
    region: 'still', bg: 'still', knots: 3, pool,
    pattern: ['mirror:1', 'strike', 'mend'],
    intents: {
      'mirror:1': {
        text: {
          F: T('"I will surely give it back… n-not."', 'かならず かえし …… ません 。'),
          E: T('"I\'ll be sure to give it back— n-not. Not give it back."', '{必|かなら}ず {返|かえ}し …… ません 。 {返|かえ}し …… ません 。'),
          I: T('"I\'ll make sure I don\'t forget to return it— I\'ll forget. I\'ll forget."', '{返|かえ}す の を {忘|わす}れない よう に …… {忘|わす}れる 。 {忘|わす}れる 。'),
          A: T('"I can\'t very well not return it— I can. I can. I can."', '{返|かえ}さない わけ に は …… いく 。 いく 。 いく 。'),
        },
        truth: {
          F: choose('The echo has turned someone\'s promise inside out. What did the promise really say?', null, [
            { jp: 'かならず かえします 。', en: 'I will surely give it back.', ok: true },
            { jp: 'かならず かえしません 。', en: 'I will surely not give it back.', ok: false, why: { en: 'That is the echo\'s version: ません makes it negative.' } },
          ], { en: 'かえします is "give back"; かえしません is its negative. The echo tacked ません on.' }, 'g:v_masu_forms'),
          E: choose('The echo has turned a promise inside out. Which was the original promise?', null, [
            { jp: '{必|かなら}ず {返|かえ}します 。', en: 'I\'ll be sure to give it back.', ok: true },
            { jp: '{返|かえ}しません 。', en: 'I won\'t give it back.', ok: false, why: { en: 'That is the echo talking — the negative ません.' } },
            { jp: '{返|かえ}して ください 。', en: 'Please give it back.', ok: false, why: { en: 'That is a request, not a promise.' } },
          ], { en: '{必|かなら}ず {返|かえ}します — a plain promise. The echo only added ません.' }, 'g:v_masu_forms'),
          I: choose('The echo twisted a promise. Which sentence was the original?', null, [
            { jp: '{返|かえ}す の を {忘|わす}れない よう に する 。', ok: true, why: { en: '' } },
            { jp: '{返|かえ}す の を {忘|わす}れる よう に なった 。', ok: false, why: { en: '"I\'ve started forgetting to return things" — a change that happened, not a promise.' } },
            { jp: '{返|かえ}さない こと に した 。', ok: false, why: { en: '"I decided not to return it" — the opposite of a promise to return.' } },
          ], { jp: '{返|かえ}す の を {忘|わす}れない よう に する 。', en: '"I\'ll make sure not to forget to give it back." 〜ないようにする = make a point of not …' }, 'g:you_ni_suru'),
          A: choose('The echo flipped a promise. Which was the original — the one that commits the speaker to returning it?', null, [
            { jp: '{返|かえ}さない わけ に は いかない 。', ok: true, why: { en: '' } },
            { jp: '{返|かえ}す わけ に は いかない 。', ok: false, why: { en: '"I can\'t very well give it back" — that refuses.' } },
            { jp: '{返|かえ}さない わけ で は ない 。', ok: false, why: { en: '"It\'s not that I won\'t return it" — a hedge, not a commitment.' } },
          ], { jp: '{返|かえ}さない わけ に は いかない 。', en: '"I can\'t very well not return it" — so I must. ない form + わけにはいかない = have to (for moral or social reasons).' }, 'g:adv_wake_ni_wa_ikanai'),
        },
      },
    },
    intro: T('A voice leaks from the shelf: someone\'s promise, turned inside out.', '{棚|たな} から {声|こえ} が {漏|も}れて くる 。 {誰|だれ}か の {約束|やくそく} が 、 {裏返|うらがえ}し に なって いる 。'),
    settle: T('The voice says the original promise once, properly, and falls quiet.', '{声|こえ} は {元|もと} の {約束|やくそく} を {一度|いちど} だけ {言|い}って 、 {静|しず}か に なった 。'),
  };

  // ---- the Hush -------------------------------------------------------------------------------
  C.enemies['sa.hush'] = {
    name: T('The Hush', '{静寂|しじま}'), art: 'sa_hush', look: { custom: 'sa_wraith' },
    region: 'still', bg: 'still', knots: 8, boss: true, music: 'boss', pool,
    pattern: ['silence', 'strike', 'shroud', 'mend'],
    phases: [
      {
        at: 6, pattern: ['heat', 'gust', 'charge', 'strike', 'lie:1'],
        line: T('The Hush starts to use what it has been given to keep — heat, wind, weight — one after another.', '{静寂|しじま} は 、 {預|あず}かって きた {力|ちから} を {次々|つぎつぎ} に {使|つか}い{始|はじ}めた 。'),
        teach: { en: 'It borrows what other guardians did. Heat: cool it with water or ice. A gust that strips wards: anchor with stone or earth. Gathering force: bind it with rope. And it makes promises — a false promise can be seen through. You already know every answer; read the intent line each time.' },
      },
      {
        at: 4, pattern: ['mirror:1', 'chill', 'plea:1', 'flood', 'mend'],
        line: T('Its voice changes. It is Kasane\'s voice.', '{声|こえ} が {変|か}わった 。 …… カサネ の {声|こえ} だ 。'),
        teach: { en: 'Now it speaks in Kasane\'s voice, and some of what it says is aimed at you. A mirror turns your own deeds against you: See Through it (light breaks it too). A plea asks something real: Answer it. Wards stop blows, not words.' },
      },
      {
        at: 2, pattern: ['silence', 'plea:2', 'lie:2', 'sweep'],
        line: T('Last of all, the Hush goes quiet and simply asks.', '{最後|さいご} に 、 {静寂|しじま} は {静|しず}か に なって 、 ただ {問|と}いかけて くる 。'),
        teach: { en: 'It will hush the air and then ask its last question. Break the silence with a bell or a voice so your answer can be heard — then answer what it is really asking.' },
      },
    ],
    intents: {
      'lie:1': {
        text: {
          F: T('"Forget, and it won\'t hurt any more."', 'わすれれば 、 もう いたく ない 。'),
          E: T('"Forget, and it won\'t hurt any more. It won\'t trouble anyone."', '{忘|わす}れれば 、 もう {痛|いた}く ない よ 。 {誰|だれ}も {困|こま}らない 。'),
          I: T('"Once you\'ve forgotten, no one gets hurt. There is no one it troubles."', '{忘|わす}れて しまえば 、 {誰|だれ}も {傷|きず}つかない 。 {困|こま}る {人|ひと} など いない 。'),
          A: T('"Forgetting is mercy. Nothing at all troubles those who have let go of their pain."', '{忘却|ぼうきゃく} は {慈悲|じひ} です 。 {痛|いた}み を {手放|てばな}した {者|もの} が {困|こま}る こと など 、 {一|ひと}つ も ありません 。'),
        },
        truth: {
          F: choose('The Hush makes a promise. What is false about it?', null, [
            { en: 'Forgetting hurt people too: Cinder Orchard forgot its fire and stopped keeping firebreaks.', ok: true },
            { en: 'Nothing. It is true.', ok: false, why: { en: 'Think of what forgetting cost the places you passed through.' } },
            { en: 'Forgetting is always fun.', ok: false, why: { en: 'That isn\'t what it claimed.' } },
          ], { en: 'A town that forgets its fire stops preparing for the next one. "It won\'t trouble anyone" is the lie.' }),
          E: choose('Which part of the promise is untrue?', null, [
            { jp: '{誰|だれ}も {困|こま}らない 。', en: 'It won\'t trouble anyone.', ok: true },
            { jp: 'もう {痛|いた}く ない 。', en: 'It won\'t hurt any more.', ok: false, why: { en: 'That part may even be true — that is what makes it tempting.' } },
          ], { en: 'Forgetting did trouble people: the orchard stopped keeping firebreaks, Snowbell lost its addresses.' }),
          I: choose('Which fact shows that the promise is false?', null, [
            { jp: '{灰実|はいみ}の{里|さと} は {火事|かじ} を {忘|わす}れて 、 {防火帯|ぼうかたい} を {作|つく}らなく なった 。', ok: true },
            { jp: '{忘|わす}れた {人|ひと} は 、 みんな {幸|しあわ}せ に なった 。', ok: false, why: { en: '"Everyone who forgot became happy" — that supports the Hush, and it isn\'t what you saw.' } },
            { jp: '{痛|いた}み は 、 {時間|じかん} が {経|た}てば {消|き}える 。', ok: false, why: { en: '"Pain fades with time" — that doesn\'t touch its claim that no one is troubled.' } },
          ], { jp: '{灰実|はいみ}の{里|さと} は {火事|かじ} を {忘|わす}れて 、 {防火帯|ぼうかたい} を {作|つく}らなく なった 。', en: 'Cinder Orchard forgot its fire and stopped cutting firebreaks — people were put in danger by forgetting.' }),
          A: choose('Two things are said. One is an opinion you might argue with; one is a claim that is simply false. Which is the false claim?', null, [
            { jp: '{痛|いた}み を {手放|てばな}した {者|もの} が {困|こま}る こと など 、 {一|ひと}つ も ありません 。', ok: true },
            { jp: '{忘却|ぼうきゃく} は {慈悲|じひ} です 。', ok: false, why: { en: '"Forgetting is mercy" is a judgement — sometimes it even was. It is not a checkable fact.' } },
          ], { en: '〜ことなど一つもありません ("not a single thing") is an absolute claim, and the orchard and Snowbell both disprove it.' }),
        },
      },
      'mirror:1': {
        text: {
          F: T('"You rewrote names too. You\'re the same as me."', 'あなた も なまえ を かきかえた 。 わたし と おなじ 。'),
          E: T('"You have been rewriting names too. You are the same as me."', 'あなた も {名前|なまえ} を {書|か}き{換|か}えて きた 。 わたし と {同|おな}じ です 。'),
          I: T('"You too have changed the world by rewriting names, haven\'t you? How are you any different from me?"', 'あなた だって 、 {名前|なまえ} を {書|か}き{換|か}えて {世界|せかい} を {変|か}えて きた でしょう 。 わたし と {何|なに} が {違|ちが}う の です か 。'),
          A: T('"You who have rewritten names and re-joined roads — have you any right to blame me?"', '{名|な} を {書|か}き{換|か}え 、 {道|みち} を {繋|つな}ぎ{直|なお}して きた あなた に 、 わたし を {責|せ}める {資格|しかく} が ある の でしょう か 。'),
        },
        truth: {
          F: choose('It holds your own work up like a mirror. What is the difference?', null, [
            { en: 'I wrote names back for the people who use them. The Hush takes them away without asking.', ok: true },
            { en: 'There is no difference.', ok: false, why: { en: 'Whose names were they, and did anyone ask?' } },
            { en: 'My handwriting is neater.', ok: false, why: { en: 'Neatness was never the point.' } },
          ], { en: 'Rewriting a name so it holds gives it back; the Hush lifts names away from the people who need them.' }),
          E: choose('What is the real difference between you and the Hush?', null, [
            { jp: 'わたし は {名前|なまえ} を {返|かえ}した 。 あなた は {取|と}った 。', en: 'I gave names back. You took them.', ok: true },
            { jp: 'わたし は {強|つよ}い 。', en: 'I am strong.', ok: false, why: { en: 'Strength isn\'t what the mirror is asking about.' } },
            { jp: '{同|おな}じ です 。', en: 'We\'re the same.', ok: false, why: { en: 'That is what the mirror wants you to believe.' } },
          ], { en: '返す (give back) and 取る (take) point in opposite directions.' }),
          I: choose('Which reply shows why the comparison is false?', null, [
            { jp: 'わたし は {名前|なまえ} を {持|も}ち{主|ぬし} に {戻|もど}した 。 あなた は {持|も}ち{主|ぬし} に {聞|き}かず に {取|と}り{上|あ}げた 。', ok: true },
            { jp: 'わたし は {名前|なまえ} を {書|か}く の が {好|す}き だ 。', ok: false, why: { en: '"I like writing names" — true, perhaps, but beside the point.' } },
            { jp: '{名前|なまえ} なんて 、 どうでも いい 。', ok: false, why: { en: '"Names don\'t matter" — that gives the Hush its whole argument.' } },
          ], { en: 'The owner (持ち主) is the difference: one returns names to them, the other takes without asking (聞かずに).' }),
          A: choose('Which reply answers the question of "right" (資格) head on?', null, [
            { jp: '{書|か}き{換|か}えた の は 、 {頼|たの}まれた から だ 。 {誰|だれ}にも {頼|たの}まれず に {取|と}り{上|あ}げる の と は 、 {話|はなし} が {違|ちが}う 。', ok: true },
            { jp: 'おっしゃる とおり です 。 {資格|しかく} は ありません 。', ok: false, why: { en: '"You\'re quite right; I have no right" — you would be conceding the mirror\'s point.' } },
            { jp: '{責|せ}める つもり は 、 {最初|さいしょ} から ありません 。', ok: false, why: { en: '"I never meant to blame you" — polite, but it dodges the question instead of answering it.' } },
          ], { en: 'The difference is consent: what you rewrote, you were asked to. 〜のとは話が違う = "that is a different matter from …".' }),
        },
      },
      'plea:1': {
        text: {
          F: T('"Why stop it? No one cries any more."', 'どうして とめるの ？ もう だれも なかない のに 。'),
          E: T('"Why do you stop me? No one is crying any more."', 'どうして {止|と}める の です か 。 もう {誰|だれ}も {泣|な}いて いない のに 。'),
          I: T('"No one cries any more. So why stop it?"', '{誰|だれ}も {泣|な}かなく なった のに 、 どうして {止|と}める の です か 。'),
          A: T('"Grief and quarrels have both gone. Why would you break this stillness?"', '{嘆|なげ}き も {諍|いさか}い も {消|き}えた この {静|しず}けさ を 、 なぜ {壊|こわ}そう と する の です か 。'),
        },
        answer: {
          F: choose('It asks why you would stop it. What is it really asking — and what is your answer?', null, [
            { en: 'Whether the quiet was worth it. It wasn\'t: people cry because they still remember who they love.', ok: true },
            { en: 'Whether I am tired. Yes.', ok: false, why: { en: 'Listen to the "no one cries" part.' } },
            { en: 'Nothing. It is just noise.', ok: false, why: { en: 'It is Kasane\'s own question. It deserves an answer.' } },
          ], { en: 'No tears can mean no sorrow — or nothing left to grieve. That is the answer it needs.' }),
          E: choose('Choose the answer to what it is really asking.', null, [
            { jp: '{泣|な}く の は 、 まだ {覚|おぼ}えて いる から です 。', en: 'People cry because they still remember.', ok: true },
            { jp: '{泣|な}く の は {体|からだ} に いい から です 。', en: 'Because crying is good for you.', ok: false, why: { en: 'True enough, maybe, but it misses the question.' } },
            { jp: '{分|わ}かりません 。', en: 'I don\'t know.', ok: false, why: { en: 'You do know. You have seen it all the way here.' } },
          ], { en: '〜のは〜から です: "the reason … is that …".' }),
          I: choose('Which reply answers the real question behind "why stop it"?', null, [
            { jp: '{泣|な}けない の は 、 {悲|かな}しみ が ない から じゃ ない 。 {悲|かな}しむ もの を {失|うしな}った から だ 。', ok: true },
            { jp: '{静|しず}か な の は {嫌|きら}い だ から 。', ok: false, why: { en: '"Because I don\'t like quiet" — a preference, not an answer.' } },
            { jp: '{誰|だれ}か に {頼|たの}まれた から 。', ok: false, why: { en: '"Because someone asked me to" — it wants your reason, not an errand.' } },
          ], { en: '"They can\'t cry not because there is no sorrow, but because they have lost the thing they would grieve for."' }),
          A: choose('Which reply meets the question as it was asked — seriously, and without contempt?', null, [
            { jp: '{静|しず}けさ と {引|ひ}き{換|か}え に 、 {人|ひと} は {悲|かな}しむ {相手|あいて} まで {失|うしな}った 。 それ を {平穏|へいおん} と は {呼|よ}べない 。', ok: true },
            { jp: 'そんな こと 、 {聞|き}く まで も ない でしょう 。', ok: false, why: { en: '"That hardly needs asking" — dismissive; it refuses the question.' } },
            { jp: '{壊|こわ}したい わけ では ない が 、 {仕事|しごと} だ から 。', ok: false, why: { en: '"It\'s not that I want to break it; it\'s my job" — hides behind duty.' } },
          ], { en: '引き換えに = "in exchange for"; 〜とは呼べない = "cannot be called …". Peace bought with the people you would grieve is not peace.' }),
        },
      },
      'plea:2': {
        text: {
          F: T('"It can stay quiet, can\'t it?"', 'しずか な まま で いい でしょう ？'),
          E: T('"May it not stay quiet?"', '{静|しず}か な まま で いて は いけません か 。'),
          I: T('"Won\'t you leave it quiet, just like this?"', 'このまま 、 {静|しず}か に して おいて は くれません か 。'),
          A: T('"Please. Don\'t take this stillness from me, at least."', 'どうか 、 この {静|しず}けさ だけ は {奪|うば}わないで ください 。'),
        },
        answer: {
          F: { kind: 'write', item: 'v:いいえ', prompt: { en: 'It wants you to agree. Answer it — kindly, but no: write いいえ ("no").' }, answer: 'いいえ', accept: ['いいえ'], mode: 'kana', explain: { en: 'いいえ — "no". Quiet can stay; the emptiness cannot.' } },
          E: choose('Answer it: quiet may stay, emptiness may not.', null, [
            { jp: 'いいえ 。 {静|しず}か でも いい 。 でも 、 {空|から}っぽ は だめ 。', en: 'No. Quiet is fine. Empty isn\'t.', ok: true },
            { jp: 'はい 、 {静|しず}か が いちばん です 。', en: 'Yes, quiet is best.', ok: false, why: { en: 'That hands it everything.' } },
            { jp: 'うるさい ！', en: 'Be quiet!', ok: false, why: { en: 'Shouting "shut up" at the Hush is… an answer, but not one that helps.' } },
          ], { en: '〜てもいい = "it\'s all right if…"; だめ = "not allowed, no good".' }),
          I: choose('Choose the reply that refuses without being cruel.', null, [
            { jp: '{静|しず}けさ は {残|のこ}して いい 。 でも 、 {言葉|ことば} まで {消|け}す の は {違|ちが}う 。', ok: true },
            { jp: 'はい 、 そう します 。', ok: false, why: { en: '"Yes, I will" — the easy agreement Lanternfall almost lost the power to refuse.' } },
            { jp: '{静|しず}けさ なんか 、 {全部|ぜんぶ} {壊|こわ}して やる 。', ok: false, why: { en: '"I\'ll smash every bit of your stillness" — a no, but a cruel one, and quiet was never the problem.' } },
          ], { en: '"The stillness can stay. Wiping out words along with it is something else."' }),
          A: choose('Choose the refusal that is courteous, clear, and true.', null, [
            { jp: 'お{気持|きも}ち は {分|わ}かります 。 ですが 、 {静|しず}けさ と {沈黙|ちんもく} は {別|べつ} の もの です 。', ok: true },
            { jp: '{承知|しょうち} しました 。 {仰|おお}せ の とおり に いたします 。', ok: false, why: { en: '"Understood. It shall be as you say." — the very "certainly" Lanternfall was trapped in.' } },
            { jp: '{静|しず}か に しろ 。', ok: false, why: { en: '"Be quiet." — a command, and a rude one; it answers nothing.' } },
          ], { en: 'ですが turns politely to disagreement. Stillness (静けさ) is a place to rest; silence imposed on others (沈黙) is what the Hush made.' }),
        },
      },
      'lie:2': {
        text: {
          F: T('"Vague words killed people."', 'あいまい な ことば が 、 ひと を ころした 。'),
          E: T('"Vague words let people die. So I fix each word to one meaning."', '{曖昧|あいまい}な {言葉|ことば} が 、 {人|ひと} を {死|し}なせた 。 だから {言葉|ことば} を {一|ひと}つ の {意味|いみ} に {決|き}めます 。'),
          I: T('"If a word has only one meaning, no one can misread it."', '{意味|いみ} が {一|ひと}つ しか なければ 、 {誰|だれ}も {読|よ}み{違|ちが}えない 。'),
          A: T('"Take the give out of words and misreading becomes impossible. That is the lesson of that night."', '{言葉|ことば} から {揺|ゆ}らぎ を {取|と}り{除|のぞ}けば 、 {読|よ}み{違|ちが}い は {起|お}こり{得|え}ない 。 それ が あの {夜|よる} の {教訓|きょうくん} です 。'),
        },
        truth: {
          F: choose('What is wrong with this?', null, [
            { en: 'Words mean things in context. Take away the context and even clear words get misread.', ok: true },
            { en: 'Nothing; every word should mean one thing.', ok: false, why: { en: 'Think of what you found on the shelves. Words can be clear to the one they were written for.' } },
          ], { en: 'Words don\'t mean things on their own; they mean things where they are said. Cut them loose and anything can be misread.' }),
          E: choose('What is wrong with this?', null, [
            { jp: '{言葉|ことば} の {意味|いみ} は 、 {前後|ぜんご} の {文|ぶん} で {決|き}まる 。', en: 'A word\'s meaning is settled by what comes around it.', ok: true },
            { jp: '{言葉|ことば} は {短|みじか}い ほう が いい 。', en: 'Shorter words are better.', ok: false, why: { en: 'Length has nothing to do with it.' } },
          ], { en: '前後の文 = the sentences before and after: context.' }),
          I: choose('Which sentence shows the flaw in its reasoning?', null, [
            { jp: '{言葉|ことば} は {文脈|ぶんみゃく} の {中|なか} で {意味|いみ} を {持|も}つ 。 {文脈|ぶんみゃく} を {失|うしな}えば 、 どんな {言葉|ことば} も {読|よ}み{違|ちが}えられる 。', ok: true },
            { jp: '{言葉|ことば} は {少|すく}なければ {少|すく}ない ほど いい 。', ok: false, why: { en: '"The fewer words the better" — that is the Hush\'s own logic.' } },
            { jp: '{誰|だれ}も {読|よ}み{違|ちが}えない {言葉|ことば} が 、 どこか に ある はず だ 。', ok: false, why: { en: '"Somewhere there must be words no one can misread" — the Hush\'s hope, restated.' } },
          ], { en: 'Meaning lives in context (文脈). Strip the context and any word can be misread — including four words you have been carrying all the way up this mountain.' }),
          A: choose('Which reply exposes what that night actually teaches?', null, [
            { jp: 'あの {夜|よる} {失|うしな}われた の は {言葉|ことば} の {明確|めいかく}さ で は なく 、 {言葉|ことば} が {置|お}かれて いた {文脈|ぶんみゃく} だ 。', ok: true },
            { jp: '{確|たし}か に 、 {曖昧|あいまい}な {言葉|ことば} は {避|さ}ける に {越|こ}した こと は ない 。', ok: false, why: { en: '"Admittedly, it\'s best to avoid vague words" — sensible advice, but it concedes the Hush\'s premise about that night.' } },
            { jp: '{教訓|きょうくん} など 、 {最初|さいしょ} から なかった 。', ok: false, why: { en: '"There was never any lesson" — dismisses the grief instead of answering it.' } },
          ], { en: 'What was lost that night was not the clarity of the words but the context they were set in (〜ではなく…だ, "not …, but …").' }),
        },
      },
    },
    intro: T('"It does not listen to me any more, either."', 'もう 、 わたし の {言|い}う こと も {聞|き}きません 。'),
    introWho: 'kasane',
    settle: T('The pages stop turning. For the first time in thirty years, the Archive is simply quiet — the ordinary kind.', 'ページ が {止|と}まった 。 {三十年|さんじゅうねん} ぶり に 、 {書庫|しょこ} は ただ {静|しず}か だった 。 ふつう の {静|しず}けさ で 。'),
  };
})(RB.content);
