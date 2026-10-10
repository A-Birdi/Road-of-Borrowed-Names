/* The Language Workshop (expansion L7–L17b; docs/future/plan/05_LANGUAGE.md): one fully worked example of each new
 * language-task family, at all four levels. They are the templates the new chapters' tasks follow, and a place to try
 * each family on its own (Words › Ways to practise › The workshop). Situations are small and everyday; the devices of
 * L10 are labelled as the game's own magic, not as how Japanese works. */
var RB = (globalThis.RB = globalThis.RB || {});
(function (C) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  const ok = (parts, en, o) => Object.assign({ parts, ok: true, en }, o || {});
  const no = (parts, en, why, o) => Object.assign({ parts, ok: false, en, why: { en: why } }, o || {});
  const F = (o) => Object.assign({ kind: 'forge' }, o);
  // a small before/after picture for "scene to sentence" (L8): text in boxes, nothing that needs colour alone
  const scene = (before, after) => '<div class="ws-scene"><div class="ws-pane"><b>Before</b>' + before + '</div><div class="ws-pane"><b>After</b>' + after + '</div></div>';

  C.workshop = { families: [] };
  const fam = (id, en, jp, what, ch) => { C.workshop.families.push({ id, en, jp, what }); C.challenges['ws.' + id] = ch; };

  // ---- L7 · sentence forging: say what you need -------------------------------------------------------
  fam('L7', 'Say what you need', '{言|い}いたい こと を {言|い}う', 'An intention in English; build, type or write the Japanese that does it.', {
    title: T('Leave the side gate open', '{横|よこ} の {門|もん}'),
    tiers: {
      F: [F({ id: 'ws.L7.F', item: 'g:v_te_kudasai', prompt: T('Ask the keeper to open the gate.'),
        families: [ok(['もん を', 'あけて ください 。'], 'Please open the gate.', { result: 'open' }), no(['もん を', 'しめて ください 。'], 'Please close the gate.', 'That asks to close it.')],
        explain: T('〜て ください asks someone to do something.') })],
      E: [F({ id: 'ws.L7.E', item: 'g:te_oku', prompt: T('Ask the keeper to leave the side gate open until evening.'),
        families: [
          ok(['{横|よこ} の {門|もん} を', '{夕方|ゆうがた} まで', '{開|あ}けて おいて ください 。'], 'Please leave the side gate open until evening.', { result: 'open', tone: 'plain-polite' }),
          ok(['{横|よこ} の {門|もん} を', '{夕方|ゆうがた} まで', '{開|あ}けて おいて もらえません か 。'], 'Could you leave the side gate open until evening?', { result: 'open', tone: 'softer' }),
          no(['{横|よこ} の {門|もん} を', '{夕方|ゆうがた} まで', '{閉|し}めて おいて ください 。'], 'Please keep the side gate shut until evening.', 'That asks to keep it shut.'),
        ], extra: ['{朝|あさ} まで'],
        explain: T('〜て おく: do something and leave it that way. まで: until.') })],
      I: [F({ id: 'ws.L7.I', item: 'g:conj_node', prompt: T('Ask the keeper to leave the side gate open until evening, because a delivery comes then.'),
        families: [
          ok(['{夕方|ゆうがた} に {荷物|にもつ} が {届|とど}く ので 、', '{横|よこ} の {門|もん} を', '{開|あ}けて おいて もらえません か 。'], 'A delivery comes in the evening, so could you leave the side gate open?', { result: 'open' }),
          ok(['{夕方|ゆうがた} に {荷物|にもつ} が {届|とど}く ので 、', '{横|よこ} の {門|もん} を', '{開|あ}けて おいて ください 。'], 'A delivery comes in the evening, so please leave the side gate open.', { result: 'open' }),
          no(['{夕方|ゆうがた} に {荷物|にもつ} が {届|とど}く のに 、', '{横|よこ} の {門|もん} を', '{開|あ}けて おいて ください 。'], 'Even though a delivery comes in the evening, please leave the gate open.', 'のに means "even though": it doesn\'t give your reason.'),
        ], extra: ['{朝|あさ} に'],
        explain: T('〜ので gives a reason gently; 〜て もらえません か is a soft request.') })],
      A: [F({ id: 'ws.L7.A', item: 'g:keigo_kenjo', prompt: T('Ask the keeper, very politely, whether the side gate could be left open until evening, since a delivery is due then.'),
        families: [
          ok(['{恐|おそ}れ{入|い}ります が 、', '{夕方|ゆうがた} に {荷物|にもつ} が {届|とど}く {予定|よてい} です ので 、', '{横|よこ} の {門|もん} を {開|あ}けて おいて いただけない でしょう か 。'], 'I\'m sorry to trouble you, but a delivery is due this evening; might the side gate be left open?', { result: 'open' }),
          ok(['{夕方|ゆうがた} に {荷物|にもつ} が {届|とど}く {予定|よてい} です ので 、', '{横|よこ} の {門|もん} を {開|あ}けて おいて いただけない でしょう か 。'], 'A delivery is due this evening; might the side gate be left open?', { result: 'open' }),
          no(['{恐|おそ}れ{入|い}ります が 、', '{夕方|ゆうがた} に {荷物|にもつ} が {届|とど}く {予定|よてい} です ので 、', '{横|よこ} の {門|もん} を {開|あ}けて おけ 。'], 'Sorry, but a delivery is due: leave the gate open!', 'おけ is a blunt command: it clashes with the polite opening.'),
        ],
        explain: T('〜て いただけない でしょう か is a very polite request; 恐れ入ります が opens it gently.') })],
    },
  });

  // ---- L8 · scene to sentence --------------------------------------------------------------------------
  const parcels = scene('<span class="ws-thing">blue parcel · on the bench</span><span class="ws-thing">red parcel · on the cart</span>', '<span class="ws-thing">blue parcel · on the cart</span><span class="ws-thing">red parcel · on the cart</span>');
  fam('L8', 'Scene to sentence', '{様子|ようす} を {言|い}う', 'Look at what changed and say the change that matters.', {
    title: T('What moved?', '{何|なに} が {動|うご}いた ？'),
    tiers: {
      F: [F({ id: 'ws.L8.F', item: 'v:あお', header: parcels, prompt: T('Say which parcel moved: "the blue one".'),
        families: [ok(['あお い', 'の です 。'], 'The blue one.'), no(['あか い', 'の です 。'], 'The red one.', 'The red parcel was on the cart all along.')] })],
      E: [F({ id: 'ws.L8.E', item: 'v:台車', header: parcels, prompt: T('Say what happened: the blue parcel is now on the cart.'),
        families: [
          ok(['{青|あお}い {荷物|にもつ} が', '{台車|だいしゃ} に', '{乗|の}りました 。'], 'The blue parcel went onto the cart.'),
          ok(['{青|あお}い {荷物|にもつ} は', '{台車|だいしゃ} に', 'あります 。'], 'The blue parcel is on the cart.'),
          no(['{赤|あか}い {荷物|にもつ} が', '{台車|だいしゃ} に', '{乗|の}りました 。'], 'The red parcel went onto the cart.', 'The red one didn\'t move.'),
        ], extra: ['ベンチ に'] })],
      I: [F({ id: 'ws.L8.I', item: 'v:載せる', header: parcels, prompt: T('Say what someone did: they moved the blue parcel from the bench to the cart.'),
        families: [
          ok(['{誰|だれ}か が', '{青|あお}い {荷物|にもつ} を', 'ベンチ から {台車|だいしゃ} に', '{載|の}せました 。'], 'Someone put the blue parcel from the bench onto the cart.'),
          ok(['{青|あお}い {荷物|にもつ} が', 'ベンチ から {台車|だいしゃ} に', '{移|うつ}されました 。'], 'The blue parcel was moved from the bench to the cart.'),
          no(['{誰|だれ}か が', '{青|あお}い {荷物|にもつ} を', '{台車|だいしゃ} から ベンチ に', '{載|の}せました 。'], 'Someone moved it from the cart to the bench.', 'から marks where it came from: that sends it the other way.'),
        ] })],
      A: [F({ id: 'ws.L8.A', item: 'g:te_aru', header: parcels, prompt: T('Say it as a state someone left on purpose: the blue parcel has been put on the cart (ready to go).'),
        families: [
          ok(['{青|あお}い {荷物|にもつ} は', 'もう {台車|だいしゃ} に', '{載|の}せて あります 。'], 'The blue parcel has already been put on the cart.'),
          no(['{青|あお}い {荷物|にもつ} は', 'もう {台車|だいしゃ} に', '{載|の}って います 。'], 'The blue parcel is on the cart (no one\'s intention said).', 'Not wrong as a fact, but 〜て ある is what says someone left it so on purpose.'),
        ] })],
    },
  });

  // ---- L9 · particle routing ---------------------------------------------------------------------------
  fam('L9', 'Who gives what to whom', '{誰|だれ} が {誰|だれ} に', 'Send letters, goods or gifts by saying who gives what to whom.', {
    title: T('A letter for Hana', 'ハナ への {手紙|てがみ}'),
    tiers: {
      F: [F({ id: 'ws.L9.F', item: 'g:prt_ni', prompt: T('Send the letter to Hana: "to Hana, the letter".'),
        families: [ok(['ハナ に', 'てがみ を', 'おくります 。'], 'I\'ll send a letter to Hana.', { result: 'hana' }), no(['ハナ が', 'てがみ を', 'おくります 。'], 'Hana sends a letter.', 'が says who does the sending; に says who receives it.')] })],
      E: [F({ id: 'ws.L9.E', item: 'g:prt_ni', prompt: T('Kōji sends Hana a letter. Say it so the courier takes it the right way.'),
        families: [
          ok(['コウジ が', 'ハナ に', '{手紙|てがみ} を', '{送|おく}ります 。'], 'Kōji sends Hana a letter.', { result: 'k2h' }),
          ok(['ハナ に', 'コウジ が', '{手紙|てがみ} を', '{送|おく}ります 。'], 'To Hana, Kōji sends a letter.', { result: 'k2h' }),
          no(['ハナ が', 'コウジ に', '{手紙|てがみ} を', '{送|おく}ります 。'], 'Hana sends Kōji a letter.', 'That sends it the other way: が is the sender, に the one it goes to.'),
        ] })],
      I: [F({ id: 'ws.L9.I', item: 'g:giving', prompt: T('Say that Hana received a letter from Kōji (from Hana\'s side).'),
        families: [
          ok(['ハナ は', 'コウジ に', '{手紙|てがみ} を', 'もらいました 。'], 'Hana got a letter from Kōji.', { result: 'k2h' }),
          ok(['ハナ は', 'コウジ から', '{手紙|てがみ} を', 'もらいました 。'], 'Hana got a letter from Kōji.', { result: 'k2h' }),
          no(['ハナ は', 'コウジ に', '{手紙|てがみ} を', 'あげました 。'], 'Hana gave Kōji a letter.', 'あげる gives away from the subject; もらう receives.'),
        ] })],
      A: [F({ id: 'ws.L9.A', item: 'g:te_giving', prompt: T('Say, from your own side, that Kōji kindly wrote a letter to you on Hana\'s behalf.'),
        families: [
          ok(['コウジ さん が', 'ハナ さん の {代|か}わり に', '{手紙|てがみ} を {書|か}いて くれました 。'], 'Kōji kindly wrote me a letter on Hana\'s behalf.', { result: 'k2me' }),
          no(['コウジ さん が', 'ハナ さん の {代|か}わり に', '{手紙|てがみ} を {書|か}いて あげました 。'], 'Kōji wrote a letter (as a favour to someone else).', '〜て あげる is a favour done for someone else; for a favour to you, 〜て くれる.'),
        ] })],
    },
  });

  // ---- L10 · verb-transforming devices (the game's own magic) -----------------------------------------
  const device = '<p class="ws-device"><b>A word-lock</b> (a device of this world, not a rule of Japanese): it answers only to the form it is asked for.</p>';
  fam('L10', 'Verb-transforming devices', '{言葉|ことば} の {錠|じょう}', 'A device of this world needs an instruction in a particular form: change a known verb to fit.', {
    title: T('The word-lock', '{言葉|ことば} の {錠|じょう}'),
    tiers: {
      F: [F({ id: 'ws.L10.F', item: 'v:あける', header: device, prompt: T('The lock wants a request: turn あける (open) into "please open".'),
        families: [ok(['あけて', 'ください 。'], 'Please open.', { result: 'open' }), no(['あける', 'ください 。'], '(not a request form)', 'Requests use the て-form: あけて ください.')] })],
      E: [F({ id: 'ws.L10.E', item: 'v:開ける', header: device, prompt: T('The lock wants a polite request to open (開ける).'),
        families: [ok(['{開|あ}けて', 'ください 。'], 'Please open.', { result: 'open' }), no(['{開|あ}けます', 'ください 。'], '(not a request form)', 'ください follows the て-form: 開けて ください.')] })],
      I: [F({ id: 'ws.L10.I', item: 'g:v_naide_kudasai', header: device, prompt: T('Now it wants a prohibition: "please don\'t touch" (触る).'),
        families: [ok(['{触|さわ}らないで', 'ください 。'], 'Please don\'t touch.', { result: 'still' }), no(['{触|さわ}って', 'ください 。'], 'Please touch.', 'That asks the opposite: 〜ないで ください is "please don\'t".')] })],
      A: [F({ id: 'ws.L10.A', item: 'g:te_oku', header: device, prompt: T('It wants preparation: "shut it ahead of time (and leave it so)" (閉める).'),
        families: [ok(['{前|まえ} もって', '{閉|し}めて おいて', 'ください 。'], 'Please shut it in advance.', { result: 'prepared' }), no(['{前|まえ} もって', '{閉|し}めて しまって', 'ください 。'], 'Please shut it (completely, regrettably).', '〜て しまう is completion (often with regret); preparation is 〜て おく.')] })],
    },
  });

  // ---- L11 · reference detective ----------------------------------------------------------------------
  const ch = (jp, en, okv, why) => ({ jp, en, ok: okv, why: why ? { en: why } : undefined });
  fam('L11', 'Reference detective', '{誰|だれ} の こと ？', 'Work out what "that one", a left-out subject or an earlier mention refers to.', {
    title: T('Who was it?', '{誰|だれ} の こと ？'),
    tiers: {
      F: [{ kind: 'choose', item: 'v:これ', ctx: T('Hana holds up a cup. "これ は ナオ の です。"', 'これ は ナオ の です 。'), prompt: T('What is これ?'), options: [ch(null, 'The cup Hana is holding', true), ch(null, 'A cup over there', false, 'それ / あれ would point further away; これ is right here with the speaker.')] }],
      E: [{ kind: 'choose', item: 'c:ws_reference', ctx: T('Mio: "Did you meet Kōji?" You: "Yes. (He) looked well."', 'ミオ : 「 コウジ さん に {会|あ}った ？ 」 あなた : 「 うん 、 {元気|げんき} そう だった よ 。 」'), prompt: T('Who looked well?'), options: [ch(null, 'Kōji', true), ch(null, 'Mio', false, 'The subject left out is the one just talked about: Kōji.'), ch(null, 'You', false, 'You are describing someone you met.')] }],
      I: [{ kind: 'choose', item: 'v:その', ctx: T('Notice: "Two bags were left at the gate. The keeper is holding one. That one is Nao\'s."', '{門|もん} に {鞄|かばん} が {二|ふた}つ {置|お}いて あった 。 ひとつ は {門番|もんばん} が {預|あず}かって いる 。 その {鞄|かばん} は ナオ の だ 。'), prompt: T('Which bag is Nao\'s?'), options: [ch(null, 'The one the keeper is holding', true), ch(null, 'The one still at the gate', false, 'その points back to the bag just mentioned: the one the keeper holds.'), ch(null, 'Both bags', false, 'その 鞄 is one bag, the last one mentioned.')] }],
      A: [{ kind: 'choose', item: 'c:ws_reference', ctx: T('Letter: "I asked the ferryman about the parcel. He said he had handed it to the innkeeper, but when I went, (she) said she had never received it."', '{渡|わた}し{守|もり} に {荷物|にもつ} の こと を {聞|き}いた 。 {宿|やど} の {女将|おかみ} に {渡|わた}した と {言|い}う が 、 {行|い}って みる と 、 {受|う}け{取|と}って いない と {言|い}われた 。'), prompt: T('Who said they had never received it?'), options: [ch(null, 'The innkeeper', true), ch(null, 'The ferryman', false, 'The ferryman says he handed it over; the one who says she never received it is where you went: the innkeeper.'), ch(null, 'The writer', false, '言われた: the writer was told this by someone else.')] }],
    },
  });

  // ---- L13 · paraphrase bridges --------------------------------------------------------------------------
  const notice = { jp: '{本日|ほんじつ} {午後|ごご} {三時|さんじ} {以降|いこう} 、 {正面|しょうめん} {入口|いりぐち} は {閉鎖|へいさ} いたします 。 {裏口|うらぐち} を ご{利用|りよう} ください 。', en: 'From 3 p.m. today the front entrance will be closed. Please use the back entrance.' };
  fam('L13', 'Paraphrase bridges', 'やさしく {言|い}い{換|か}える', 'Explain a complicated notice in simpler Japanese, keeping its condition.', {
    title: T('The notice by the door', '{戸口|とぐち} の {張|は}り{紙|がみ}'),
    tiers: {
      F: [F({ id: 'ws.L13.F', item: 'v:うしろ', ctx: notice, prompt: T('Tell a child, simply: "go round the back".'),
        families: [ok(['うしろ から', 'はいって ね 。'], 'Go in from the back, OK?'), no(['まえ から', 'はいって ね 。'], 'Go in from the front.', 'The notice closes the front.')] })],
      E: [F({ id: 'ws.L13.E', item: 'v:入口', ctx: notice, prompt: T('Say it simply, keeping the time: from three, use the back.'),
        families: [
          ok(['{三時|さんじ} から', '{後|うし}ろ の {入|い}り{口|ぐち} を', '{使|つか}って ください 。'], 'From three, please use the back door.'),
          no(['{後|うし}ろ の {入|い}り{口|ぐち} を', '{使|つか}って ください 。'], 'Please use the back door.', 'Simpler, but it loses the condition: only from three o\'clock.'),
        ] })],
      I: [F({ id: 'ws.L13.I', item: 'g:prt_kara_made', ctx: notice, prompt: T('Explain it to a traveller in plain Japanese: what changes, and when.'),
        families: [
          ok(['{今日|きょう} は {三時|さんじ} から', '{前|まえ} の {入|い}り{口|ぐち} が {使|つか}えない ので 、', '{後|うし}ろ から {入|はい}って ください 。'], 'From three today the front door can\'t be used, so please go in at the back.'),
          ok(['{三時|さんじ} を {過|す}ぎたら', '{前|まえ} の {入|い}り{口|ぐち} は {閉|し}まる ので 、', '{後|うし}ろ から {入|はい}って ください 。'], 'After three the front closes, so please go in at the back.'),
          no(['{今日|きょう} は', '{前|まえ} の {入|い}り{口|ぐち} が {使|つか}えない ので 、', '{後|うし}ろ から {入|はい}って ください 。'], 'Today the front can\'t be used, so use the back.', 'It drops "from three": the front is open until then.'),
        ] })],
      A: [F({ id: 'ws.L13.A', item: 'c:ws_paraphrase', ctx: notice, prompt: T('Rephrase the notice in everyday polite Japanese, keeping both the time and the alternative, without the formal words (閉鎖, 以降, ご利用).'),
        families: [
          ok(['{今日|きょう} の {午後|ごご} {三時|さんじ} から 、', '{表|おもて} の {入|い}り{口|ぐち} は {閉|し}まります 。', '{裏|うら} から {入|はい}って ください 。'], 'From three this afternoon the front door closes. Please go in at the back.'),
          no(['{本日|ほんじつ} {午後|ごご} {三時|さんじ} {以降|いこう} 、', '{表|おもて} の {入|い}り{口|ぐち} は {閉|し}まります 。', '{裏|うら} から {入|はい}って ください 。'], 'From 3 p.m. today (formal), the front closes; use the back.', 'It keeps the formal 本日 / 以降 the task asks you to put plainly.'),
        ] })],
    },
  });

  // ---- L14 · evidence reporting --------------------------------------------------------------------------
  fam('L14', 'Report what you know, and how', '{伝|つた}える', 'Report what you saw, heard or suspect, with the right certainty (そうだ, らしい, ようだ).', {
    title: T('Is the bridge closed?', '{橋|はし} は {閉|し}まって いる ？'),
    tiers: {
      F: [F({ id: 'ws.L14.F', item: 'g:sou_hear', prompt: T('Hana told you the bridge is closed. Pass it on: "(I hear) it\'s closed".'),
        families: [ok(['はし が', 'しまって いる', 'そう です 。'], 'I hear the bridge is closed.'), no(['はし が', 'しまって', 'います 。'], 'The bridge is closed.', 'You only heard it: そう です says so.')] })],
      E: [F({ id: 'ws.L14.E', item: 'g:sou_hear', prompt: T('Hana told you the bridge is closed. Tell Nao, and say you heard it.'),
        families: [
          ok(['ハナ さん に よる と 、', '{橋|はし} が {閉|し}まって いる', 'そう です 。'], 'According to Hana, the bridge is closed.'),
          ok(['{橋|はし} が {閉|し}まって いる', 'そう です 。'], 'I hear the bridge is closed.'),
          no(['{橋|はし} が {閉|し}まって いる', 'よう です 。'], 'It looks as if the bridge is closed.', 'よう です is what you judge from what you saw yourself; you only heard it.'),
        ] })],
      I: [F({ id: 'ws.L14.I', item: 'g:you_mitai', prompt: T('You saw a crowd turning back at the bridge. Say what you infer from that.'),
        families: [
          ok(['{人|ひと} が {引|ひ}き{返|かえ}して いた ので 、', '{橋|はし} が {閉|し}まって いる', 'よう です 。'], 'People were turning back, so the bridge seems to be closed.'),
          no(['{人|ひと} が {引|ひ}き{返|かえ}して いた ので 、', '{橋|はし} が {閉|し}まって いる', 'そう です 。'], 'People were turning back, so I hear the bridge is closed.', 'そう です (hearsay) is for what you were told; this is your own inference: よう です.'),
        ] })],
      A: [F({ id: 'ws.L14.A', item: 'g:rashii', prompt: T('It is going round the market that the bridge is closed; nobody you trust has said so. Pass it on as a rumour.'),
        families: [
          ok(['{市場|いちば} で は 、', '{橋|はし} が {閉|し}まって いる', 'らしい です よ 。'], 'At the market they\'re saying the bridge is closed, apparently.'),
          no(['{市場|いちば} で は 、', '{橋|はし} が {閉|し}まって いる', 'に {違|ちが}いない です 。'], 'At the market — the bridge must be closed.', 'に 違いない is near-certainty; a rumour is らしい.'),
        ] })],
    },
  });

  // ---- L15 · comic and dialogue reconstruction ---------------------------------------------------------
  const B = (who, jp) => '「' + jp + '」';
  fam('L15', 'Put the exchange back together', '{会話|かいわ} を {並|なら}べる', 'Rebuild an illustrated exchange from its speech bubbles.', {
    title: T('At the stall', '{屋台|やたい} で'),
    tiers: {
      F: [{ kind: 'order', item: 'v:ください', bubbles: true, prompt: T('Put the exchange at the stall in order.'), tiles: ['いらっしゃい ませ 。', 'りんご を ください 。', 'はい 、 どうぞ 。'], answer: ['いらっしゃい ませ 。', 'りんご を ください 。', 'はい 、 どうぞ 。'], orderHint: T('The stallholder greets first; the customer asks; then it is handed over.') }],
      E: [{ kind: 'order', item: 'v:いくら', bubbles: true, prompt: T('Put the exchange in order.'), tiles: ['この りんご は いくら です か 。', '{一|ひと}つ {百|ひゃく} {円|えん} です 。', 'じゃあ 、 {二|ふた}つ ください 。', 'ありがとう ございます 。'], answer: ['この りんご は いくら です か 。', '{一|ひと}つ {百|ひゃく} {円|えん} です 。', 'じゃあ 、 {二|ふた}つ ください 。', 'ありがとう ございます 。'], orderHint: T('A question, its answer, the decision, the thanks.') }],
      I: [{ kind: 'order', item: 'g:cond_nara', bubbles: true, prompt: T('Put the exchange in order.'), tiles: ['{柿|かき} は もう ない ん です か 。', '{今日|きょう} は {売|う}り{切|き}れ です 。', '{明日|あした} なら ありますか 。', 'ええ 、 {朝|あさ} {入|はい}ります よ 。'], answer: ['{柿|かき} は もう ない ん です か 。', '{今日|きょう} は {売|う}り{切|き}れ です 。', '{明日|あした} なら ありますか 。', 'ええ 、 {朝|あさ} {入|はい}ります よ 。'], orderHint: T('なら ("if it\'s tomorrow") picks up what was just said.') }],
      A: [{ kind: 'order', item: 'c:ws_reference', bubbles: true, prompt: T('Put the exchange in order (a misunderstanding put right).'), tiles: ['すみません 、 さっき の お{釣|つ}り なんです が …', 'あ 、 {足|た}りません でした か 。', 'いえ 、 {逆|ぎゃく} に {多|おお}すぎた みたい で 。', 'それ は ご{丁寧|ていねい} に 、 ありがとう ございます 。'], answer: ['すみません 、 さっき の お{釣|つ}り なんです が …', 'あ 、 {足|た}りません でした か 。', 'いえ 、 {逆|ぎゃく} に {多|おお}すぎた みたい で 。', 'それ は ご{丁寧|ていねい} に 、 ありがとう ございます 。'], orderHint: T('The customer raises it; the stallholder guesses wrong; the customer corrects it; thanks.') }],
    },
  });

  // ---- L16 · sound and meaning (optional; the device's own voice; always a text route) ------------------
  const L = (o) => Object.assign({ kind: 'listen' }, o);
  fam('L16', 'Sound and meaning', '{音|おと} と {意味|いみ}', 'Compare short spoken pairs and use the difference. Optional: your device\'s voice, always a text route.', {
    title: T('Two words that sound alike', '{似|に}た {音|おと}'),
    tiers: {
      F: [L({ item: 'v:おばあさん', transcript: T('Grandmother', 'おばあさん'), prompt: T('Who is it: an aunt (おばさん) or a grandmother (おばあさん)?'), options: [{ en: 'A grandmother', ok: true }, { en: 'An aunt', ok: false, why: { en: 'The long あー makes it おばあさん.' } }] })],
      E: [L({ item: 'v:来て', transcript: T('Come here.', 'きて'), prompt: T('Is it きて (come) or きって (stamp)?'), options: [{ en: 'きて · come', ok: true }, { en: 'きって · a stamp', ok: false, why: { en: 'No small っ: no pause before て.' } }] })],
      I: [L({ item: 'v:病院', transcript: T('Hospital', 'びょういん'), prompt: T('Is it びょういん (hospital) or びよういん (hair salon)?'), options: [{ en: 'びょういん · hospital', ok: true }, { en: 'びよういん · hair salon', ok: false, why: { en: 'びょ is one sound; び・よ is two.' } }] })],
      A: [L({ item: 'v:主人', transcript: T('Husband / master', 'しゅじん'), prompt: T('Is it しゅじん (husband, master) or しゅうじん (prisoner)?'), options: [{ en: 'しゅじん · husband, master', ok: true }, { en: 'しゅうじん · prisoner', ok: false, why: { en: 'No long う: しゅ, not しゅう.' } }] })],
    },
  });

  // ---- L17 · explain it to a partner ---------------------------------------------------------------------
  fam('L17', 'Explain it to your companion', '{相棒|あいぼう} に {説明|せつめい}', 'Justify a plan to your companion with what you know.', {
    title: T('Which way?', 'どっち の {道|みち} ？'),
    tiers: {
      F: [F({ id: 'ws.L17.F', item: 'v:ひだり', prompt: T('The right-hand bridge is closed. Tell $comp: "let\'s go left".'),
        families: [ok(['ひだり に', 'いこう 。'], 'Let\'s go left.'), no(['みぎ に', 'いこう 。'], 'Let\'s go right.', 'The right-hand bridge is closed.')] })],
      E: [F({ id: 'ws.L17.E', item: 'g:conj_kara', prompt: T('Tell $comp why: the right-hand bridge is closed, so let\'s take the left path.'),
        families: [
          ok(['{右|みぎ} の {橋|はし} は {閉|し}まって いる から 、', '{左|ひだり} の {道|みち} を {行|い}こう 。'], 'The right bridge is closed, so let\'s take the left path.'),
          ok(['{左|ひだり} の {道|みち} を {行|い}こう 。', '{右|みぎ} の {橋|はし} は {閉|し}まって いる から 。'], 'Let\'s take the left path. The right bridge is closed, you see.'),
          no(['{右|みぎ} の {橋|はし} は {閉|し}まって いる から 、', '{右|みぎ} の {道|みち} を {行|い}こう 。'], 'The right bridge is closed, so let\'s go right.', 'Your reason points the other way.'),
        ] })],
      I: [F({ id: 'ws.L17.I', item: 'g:prt_shi', prompt: T('Give two reasons for the left path: the bridge is closed, and it is shorter anyway.'),
        families: [
          ok(['{右|みぎ} の {橋|はし} は {閉|し}まって いる し 、', '{左|ひだり} の ほう が {近|ちか}い し 、', '{左|ひだり} から {行|い}こう よ 。'], 'The right bridge is closed, and the left is nearer anyway: let\'s go left.'),
          no(['{右|みぎ} の {橋|はし} は {閉|し}まって いる けど 、', '{左|ひだり} の ほう が {近|ちか}い し 、', '{左|ひだり} から {行|い}こう よ 。'], 'The right bridge is closed, but the left is nearer: let\'s go left.', 'けど sets up a contrast; for reasons that add up, 〜し.'),
        ] })],
      A: [F({ id: 'ws.L17.A', item: 'g:hazu', prompt: T('Persuade $comp, who wants the river path: the notice said the right bridge is closed, so the river path should be flooded too, since it runs under it.'),
        families: [
          ok(['{張|は}り{紙|がみ} に {右|みぎ} の {橋|はし} が {閉|し}まって いる と あった から 、', 'その {下|した} を {通|とお}る {川沿|かわぞ}い の {道|みち} も', '{水|みず} が {出|で}て いる はず だ よ 。'], 'The notice said the right bridge is closed, so the river path under it should be flooded too.'),
          no(['{張|は}り{紙|がみ} に {右|みぎ} の {橋|はし} が {閉|し}まって いる と あった から 、', 'その {下|した} を {通|とお}る {川沿|かわぞ}い の {道|みち} も', '{水|みず} が {出|で}て いる わけ が ない よ 。'], '…so the river path can\'t possibly be flooded.', 'わけ が ない denies it outright; your evidence points the other way: はず だ.'),
        ] })],
    },
  });

  // ---- L17b · modifier phrases (Robin's C-70, C-72) ----------------------------------------------------
  fam('L17b', 'Modifier phrases', '{範囲|はんい} の {言葉|ことば}', 'Extend a response with a word of how far it reaches, and write the short sentence it makes.', {
    title: T('How far does it reach?', 'どこ まで {届|とど}く ？'),
    tiers: {
      F: [F({ id: 'ws.L17b.F', item: 'v:みんな', prompt: T('Protect everyone: "everyone, protect".'),
        families: [ok(['みんな を', 'まもる 。'], 'Protect everyone.'), no(['ひとり を', 'まもる 。'], 'Protect one person.', 'ひとり is just one.')] })],
      E: [F({ id: 'ws.L17b.E', item: 'v:すべて', prompt: T('Make the light reach everything: "the light lights up everything".'),
        families: [ok(['{光|ひかり} が', 'すべて を', '{照|て}らす 。'], 'The light lights up everything.'), ok(['{光|ひかり} が', '{全部|ぜんぶ} を', '{照|て}らす 。'], 'The light lights up all of it.'), no(['{光|ひかり} が', 'ひとつ を', '{照|て}らす 。'], 'The light lights up one thing.', 'ひとつ is a single one.')] })],
      I: [F({ id: 'ws.L17b.I', item: 'v:それぞれ', prompt: T('Give water to each of them separately: "to each, water".'),
        families: [ok(['それぞれ に', '{水|みず} を', 'あげる 。'], 'Give each of them water.'), no(['{全体|ぜんたい} に', '{水|みず} を', 'あげる 。'], 'Give water to the whole (as one).', '全体 treats them as one whole; それぞれ is each one separately.')] })],
      A: [F({ id: 'ws.L17b.A', item: 'v:あらゆる', prompt: T('Ward against every kind of attack: "against every attack, protect".'),
        families: [ok(['あらゆる {攻撃|こうげき} から', '{守|まも}る 。'], 'Protect against every kind of attack.'), no(['いくつか の {攻撃|こうげき} から', '{守|まも}る 。'], 'Protect against some attacks.', 'いくつか is "a few"; あらゆる is every kind.')] })],
    },
  });

  // ---- L12 · asking back: a short scene with simpler lines (the dialogue box's "Ask back") ------------
  C.workshop.families.push({ id: 'L12', en: 'Ask back', jp: '{聞|き}き{返|かえ}す', what: 'Ask someone to repeat, slow down or say it more simply; they rephrase. Asking well is a success.', scene: 'ws.ask' });
  RB.script.add(`
@scene ws.ask
narr: {渡|わた}し{守|もり} が {早口|はやくち} で {説明|せつめい} する 。 「 Ask back 」 で {聞|き}き{返|かえ}せます 。 || The ferryman explains, quickly. "Ask back" lets you ask him again.
koji: {本日|ほんじつ} は {増水|ぞうすい} の {恐|おそ}れ が ある ため 、 {最終便|さいしゅうびん} の {出航|しゅっこう} を {見合|みあ}わせる {可能性|かのうせい} が ございます 。 || With the river likely to rise today, the last boat may not sail.
~ {今日|きょう} は {水|みず} が {増|ふ}える かも しれない から 、 {最後|さいご} の {船|ふね} は {出|で}ない かも 。 || The water might rise today, so the last boat might not go.
koji: お{急|いそ}ぎ なら 、 {一|ひと}つ {前|まえ} の {便|びん} を お{勧|すす}め します 。 || If you're in a hurry, I'd suggest the boat before it.
~ {急|いそ}いで いる なら 、 その {前|まえ} の {船|ふね} に {乗|の}って ね 。 || If you're in a hurry, take the boat before that one.
narr: {聞|き}き{返|かえ}す の は {失敗|しっぱい} で は ありません 。 {話|はなし} を {分|わ}かる ため の 、 {立派|りっぱ} な {日本語|にほんご} です 。 || Asking back is not failing. It is good Japanese, used to understand.
`, 'workshop/ask');
})(RB.content);
