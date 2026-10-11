/* The old guardians (expansion P15e; plan 03_ENCOUNTERS.md E16, sealed S7): one per region, awake only after the
 * story (their shrines: src/content/zz_guardians.js). Each is built round one family of the encounter platform, never
 * round padded health: conditions (the First Fire, the Kettle's Mother), arrivals (the Sister Star, the Cloud Ox
 * Elder), a procedure under pressure (the Founder's Voice, the First Keeper: 20_procedures.js) or an argument (the
 * Head Office, the Bell's Maker, the Bridge Founder: 30_arguments.js). They can defeat you; a defeat sends you back
 * with everything learned kept, and your companion offers help after it (E19). Kasane is never one of them (S7).
 *   gd.founder       the Founder's Voice (初代の声): the Mill Echo's founder, Reedwake's mill
 *   gd.headoffice    the Head Office (本局): the office the Tide Clerk answered to, Saltglass
 *   gd.firstfire     the First Fire (最初の火): the first fire lit in the Kiln Warden's kiln, Cinder Orchard
 *   gd.sisterstar    the Sister Star (姉星): the star the Lamp That Waited was lit to answer, Snowbell
 *   gd.maker         the Bell's Maker (鐘の鋳物師): who cast the Drowned Bell, Lanternfall
 *   gd.bridgefounder the Bridge Founder (橋の開祖): who built Manybridge's first bridge
 *   gd.oxelder       the Cloud Ox Elder (雲牛の長老): the eldest of the herd, the Cloudroad's summit
 *   gd.kettlemother  the Kettle's Mother (釜の母): who sleeps under Steamhollow
 *   gd.firstkeeper   the First Keeper (最初の葉守): who kept Kotonoha's first shelves of leaves
 * Interim art on existing families with their own palettes (F-36's rule); their own drawings are P16 art work under
 * AC-1 (C-82). */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  const say = (jp, en) => ({ jp, en });
  const ch = (o) => Object.assign({ kind: 'choose' }, o);
  const o = (en, ok, why) => (why ? { en, ok, why: { en: why } } : { en, ok });
  const oj = (jp, ok, why) => (why ? { jp, ok, why: { en: why } } : { jp, ok });
  C.enemies = C.enemies || {};
  C.encounters = C.encounters || {};
  const EN = (id, d) => (C.enemies[id] = Object.assign({ boss: true, guardian: true, edition: 2 }, d));

  // each guardian's pool is its region's (the questions an Unravel asks), so a guardian tests what its region taught
  const POOL = {
    rw: { tags: ['reedwake'], F: ['v:川', 'v:水', 'v:名前'], E: ['v:川', 'v:橋', 'v:水', 'v:雨', 'v:名前'], I: ['g:v_te_kara', 'g:mae_ato', 'g:cond_tara'], A: ['g:v_nakereba', 'g:indirectness'] },
    sg: { tags: ['saltglass'], F: ['v:海', 'v:船', 'v:風', 'v:名前'], E: ['v:港', 'v:手紙', 'v:郵便', 'g:prt_ni', 'g:mae_ato'], I: ['v:届ける', 'v:宛先', 'g:passive', 'g:hazu'], A: ['v:差出人', 'v:宛名', 'g:adv_wake_dewa_nai', 'g:adv_ni_suginai'] },
    co: { tags: ['cinder'], F: ['v:火', 'v:石', 'v:土', 'v:氷'], E: ['v:灰', 'v:窯', 'v:煙', 'v:火事'], I: ['v:覚える', 'v:燃える', 'g:tame', 'g:tsumori'], A: ['g:you_ni_suru', 'g:adv_kara_koso'] },
    sb: { tags: ['snowbell'], F: ['v:雪', 'v:星', 'v:冬', 'v:夜'], E: ['v:星', 'v:鐘', 'v:約束', 'g:counters'], I: ['v:約束', 'g:cond_tara', 'g:temo', 'g:hazu'], A: ['g:adv_kanenai', 'g:adv_wake_dewa_nai', 'g:adv_monono'] },
    lf: { tags: ['lanternfall'], F: ['v:鈴', 'v:声', 'v:鐘', 'v:水'], E: ['v:反対', 'g:v_masu_forms', 'g:register_polite_plain'], I: ['g:cond_to', 'g:indirectness', 'g:keigo_kenjo'], A: ['g:lf_kaneru', 'g:indirectness', 'g:adv_kanenai'] },
    mb: { tags: ['manybridge'], F: ['v:橋', 'v:水', 'v:舟', 'v:名前'], E: ['v:送る', 'g:prt_kara_made', 'g:prt_he'], I: ['v:条件', 'g:cond_tara', 'g:cond_ba', 'g:cond_nara'], A: ['v:約定', 'g:indirectness', 'g:v_nakereba'] },
    cr: { tags: ['cloudroad'], F: ['v:道', 'v:山', 'v:雪', 'g:prt_he'], E: ['g:cr_to_itte', 'g:v_ta', 'g:kamo', 'g:deshou'], I: ['g:sou_hear', 'g:rashii', 'g:you_mitai', 'g:hazu'], A: ['g:cr_tono', 'g:adv_ni_suginai', 'g:adv_wake_dewa_nai'] },
    yn: { tags: ['steamhollow'], F: ['v:湯', 'v:部屋', 'g:v_te_kudasai'], E: ['g:v_temo_ii', 'g:v_naide_kudasai', 'g:v_te_kara'], I: ['g:koto_ni_suru', 'g:conj_node', 'g:noni'], A: ['g:yn_omotenashi', 'g:keigo_kenjo', 'g:keigo_sonkei'] },
    ko: { tags: ['kotonoha'], F: ['v:葉', 'v:言葉', 'v:手紙', 'g:prt_no'], E: ['g:ko_to_iimashita', 'g:v_ta', 'g:v_te_iru'], I: ['g:ko_to_iu_hanashi', 'g:te_giving', 'g:passive'], A: ['g:ko_literary', 'g:indirectness', 'g:adv_to_iu_yori'] },
  };
  C.guardianPools = POOL;

  // ---- the guardians ----------------------------------------------------------------------------------------------
  EN('gd.founder', {
    region: 'reedwake', bg: 'mill', music: 'boss', name: T('The Founder\'s Voice', '{初代|しょだい} の {声|こえ}'), art: 'echo', artOpts: { col: '#d8cfa8' }, look: { custom: 'spirit', col: '#d8cfa8' }, knots: 5, pool: POOL.rw,
    pattern: ['strike', 'rest', 'mend'],
    intro: T('The wheel creaks a quarter turn on its own, and the echo in the rafters speaks: not in your words this time but in its own. An old miller\'s voice, the founder\'s, giving orders to a crew that left a hundred years ago.', '{水車|すいしゃ} が ひとりでに {少|すこ}し {回|まわ}り 、 {梁|はり} の こだま が {話|はな}し{始|はじ}めた 。 {今度|こんど} は あなた の {言葉|ことば} で は なく 、 {自分|じぶん} の {言葉|ことば} で 。 {百年|ひゃくねん} {前|まえ} に いなく なった {職人|しょくにん} たち に {指図|さしず} を する 、 {初代|しょだい} の {粉屋|こなや} の {声|こえ} だ 。'),
    settle: T('The founder\'s voice says one last thing, "Good," and the mill is only a mill again, turning.', '{初代|しょだい} の {声|こえ} は 、 {最後|さいご} に 「 よし 」 と だけ {言|い}った 。 {水車|すいしゃ} は 、 ただ の {水車|すいしゃ} に {戻|もど}って 、 {回|まわ}って いる 。') });
  EN('gd.headoffice', {
    region: 'saltglass', bg: 'archive', music: 'boss', name: T('The Head Office', '{本局|ほんきょく}'), art: 'clerk', artOpts: { col: '#2a3a4c' }, look: { custom: 'spirit', col: '#2a3a4c' }, knots: 5, pool: POOL.sg,
    pattern: ['rest'],
    intro: T('The office\'s back wall of pigeonholes leans out over you and becomes a shape: ledgers for a body, rubber stamps for hands, a voice like a drawer being shut. It is the office the Tide Clerk answered to, and it has a complaint.', '{事務所|じむしょ} の {奥|おく} の {棚|たな} が 、 {覆|おお}いかぶさる よう に {傾|かたむ}いて 、 {形|かたち} に なった 。 {帳面|ちょうめん} の {体|からだ} 、 {判子|はんこ} の {手|て} 、 {引|ひ}き{出|だ}し を {閉|し}める よう な {声|こえ} 。 {潮|しお} の {書記|しょき} が {仕|つか}えて いた {本局|ほんきょく} だ 。 {苦情|くじょう} が ある らしい 。'),
    settle: T('The Head Office folds itself back into pigeonholes. In the top one, a single letter, stamped "received".', '{本局|ほんきょく} は 、 {元|もと} の {棚|たな} に {戻|もど}った 。 {一番|いちばん} {上|うえ} の {段|だん} に 、 「 {受領|じゅりょう} 」 と {判|はん} の {押|お}された {手紙|てがみ} が {一通|いっつう} 。') });
  EN('gd.firstfire', {
    region: 'cinder', bg: 'kiln', music: 'boss', name: T('The First Fire', '{最初|さいしょ} の {火|ひ}'), art: 'warden', artOpts: { col: '#c4502a' }, look: { custom: 'golem', col: '#7a3a22' }, knots: 5, pool: POOL.co,
    pattern: ['heat', 'strike', 'plea', 'sweep', 'heat', 'rest'],
    intents: {
      plea: { power: 1,
        text: {
          F: { jp: 'わたし は 、 なん の ため に ついた の ？', en: 'What was I lit for?' },
          E: { jp: '{私|わたし} は 、 {何|なん} の ため に {点|つ}けられた の か 。', en: 'What was I lit for?' },
          I: { jp: '{私|わたし} を {点|つ}けた {者|もの} は 、 {何|なに} を {焼|や}く つもり だった の か 。', en: 'The one who lit me: what did they mean to fire?' },
          A: { jp: '{我|われ} を {点|とも}した {者|もの} の {願|ねが}い は 、 {何|なん} で あった か 。', en: 'What did the one who lit me wish for?' },
        },
        answer: {
          F: ch({ item: 'v:火', prompt: { en: 'Tell it what it was lit for.' }, options: [oj('みんな の さら を やく ため だ よ 。', true), oj('ぜんぶ を もやす ため だ よ 。', false, 'It was lit to fire pots, never to burn everything.')] }),
          E: ch({ item: 'g:tame', prompt: { en: 'Tell it what it was lit for.' }, options: [oj('{皆|みんな} の {器|うつわ} を {焼|や}く ため です 。', true), oj('{里|さと} を {燃|も}やす ため です 。', false, 'The kiln fires pots; it never burned the village.'), oj('{何|なん} の ため でも ありません 。', false, 'Every fire here was lit for something.')] }),
          I: ch({ item: 'g:tsumori', prompt: { en: 'Tell it what its first keeper meant to do. (Read them closely: two are near.)' }, options: [oj('{里|さと} の {人|ひと} が {毎日|まいにち} {使|つか}う {器|うつわ} を {焼|や}く つもり でした 。', true), oj('{一度|いちど} だけ {焼|や}いて 、 {消|け}す つもり でした 。', false, 'It has been carried on to every firing since.'), oj('{窯|かま} を {壊|こわ}す つもり でした 。', false, 'Nobody lights a kiln to break it.')] }),
          A: ch({ item: 'g:you_ni_suru', prompt: { en: 'Tell it what its first keeper wished. (Read them closely: two are near.)' }, options: [oj('{器|うつわ} が {絶|た}えない よう に 、 {代々|だいだい} {火|ひ} を {継|つ}いで ほしい 、 と いう {願|ねが}い でした 。', true), oj('{火|ひ} を {絶|た}やして ほしい 、 と いう {願|ねが}い でした 。', false, '{絶|た}やす is to let it die out: the opposite.'), oj('{番人|ばんにん} に {勝|か}って ほしい 、 と いう {願|ねが}い でした 。', false, 'There was no contest in it.')] }),
        } },
    },
    intro: T('Deep in the kiln, under the ash of every firing since, the first fire ever lit here wakes and stands up: a shape of flame taller than the Warden ever was.', '{窯|かま} の {奥|おく} 、 {長|なが}い {年月|としつき} の {灰|はい} の {下|した} から 、 ここ で {最初|さいしょ} に {点|とも}された {火|ひ} が {目|め} を {覚|さ}まし 、 {立|た}ち{上|あ}がった 。 {番人|ばんにん} より も {大|おお}きな 、 {炎|ほのお} の {形|かたち} 。'),
    settle: T('The First Fire sinks back to a bed of embers: warm, low, enough to light tomorrow\'s firing.', '{最初|さいしょ} の {火|ひ} は 、 {低|ひく}い {熾火|おきび} に {戻|もど}った 。 {明日|あした} の {火|ひ} に {十分|じゅうぶん} な 、 {温|あたた}かい {火|ひ} 。') });
  EN('gd.sisterstar', {
    region: 'snowbell', bg: 'observatory', music: 'boss', name: T('The Sister Star', '{姉星|あねぼし}'), art: 'wisp', artOpts: { col: '#e8eaff' }, look: { custom: 'wisp', col: '#e8eaff' }, knots: 4, pool: POOL.sb,
    pattern: ['shroud', 'strike', 'plea', 'chill', 'rest'],
    intents: {
      plea: { power: 1,
        text: {
          F: { jp: 'いもうと は 、 もう まって いない 。 どうして ？', en: 'My sister waits no more. Why?' },
          E: { jp: '{妹|いもうと} は 、 もう {待|ま}って いない 。 どうして です か 。', en: 'My sister waits no more. Why?' },
          I: { jp: '{妹|いもうと} は 、 なぜ {待|ま}つ の を やめた の か 。', en: 'Why did my sister stop waiting?' },
          A: { jp: '{妹|いもうと} が {待|ま}つ の を やめた の は 、 {諦|あきら}めた から か 。', en: 'Did my sister stop waiting because she gave up?' },
        },
        answer: {
          F: ch({ item: 'v:星', prompt: { en: 'Tell the star why its sister stopped waiting.' }, options: [oj('まいばん 、 だれか が ひ を みて いる から だ よ 。', true), oj('だれ も こない から だ よ 。', false, 'Someone comes every night now: the village keeps a rota.')] }),
          E: ch({ item: 'g:conj_kara', prompt: { en: 'Tell the star why its sister stopped waiting.' }, options: [oj('{毎晩|まいばん} 、 {村|むら} の {人|ひと} が {交代|こうたい} で {灯|ひ} の {番|ばん} を して いる から です 。', true), oj('{誰|だれ} も {来|こ}ない から です 。', false, 'Someone comes every night now.'), oj('{灯|ひ} が {消|き}えた から です 。', false, 'The lamp still burns on its hook.')] }),
          I: ch({ item: 'g:koto_ni_naru', prompt: { en: 'Tell the star why its sister stopped waiting. (Read them closely: two are near.)' }, options: [oj('{村|むら} で {交代|こうたい} で {番|ばん} を する こと に なった ので 、 もう {一人|ひとり} で {待|ま}つ {必要|ひつよう} が ない ん です 。', true), oj('{誰|だれ} も {来|こ}なかった ので 、 {諦|あきら}めた ん です 。', false, 'Nobody gave up on her; she was given company.'), oj('あなた が {降|お}りて きた ので 、 {待|ま}つ {必要|ひつよう} が なくなった ん です 。', false, 'She stopped waiting before you came down.')] }),
          A: ch({ item: 'g:adv_wake_dewa_nai', prompt: { en: 'Answer the star. (Read them closely: two are near.)' }, options: [oj('{諦|あきら}めた わけ で は ありません 。 {待|ま}つ {人|ひと} が {一人|ひとり} で は なく なった の です 。', true), oj('{諦|あきら}めた わけ です 。', false, 'わけです would agree that she gave up.'), oj('もう {灯|ひ} は {要|い}らない わけ です 。', false, 'The lamp is still wanted; that is why they tend it.')] }),
        } },
    },
    intro: T('Through the dome\'s open slit a star comes down, slowly, the way snow does, and stands in the middle of the floor. The Lamp That Waited was lit to answer it. Now the lamp waits for no one, and the star has come to ask why.', '{屋根|やね} の {隙間|すきま} から 、 {雪|ゆき} の よう に ゆっくり と 、 {星|ほし} が {一|ひと}つ {降|お}りて きて 、 {床|ゆか} の {真|ま}ん{中|なか} に {立|た}った 。 {待|ま}ちくたびれた {灯|ひ} は 、 この {星|ほし} に {応|こた}える ため に {灯|とも}されて いた 。 もう {灯|ひ} は {誰|だれ} も {待|ま}って いない 。 {星|ほし} は 、 その {訳|わけ} を {聞|き}き に {来|き}た の だ 。'),
    settle: T('The Sister Star rises back through the slit, and for a moment the old lamp on its hook flickers, as if waving.', '{姉星|あねぼし} は {隙間|すきま} から {空|そら} へ {戻|もど}って いった 。 {古|ふる}い {灯|ひ} が 、 {手|て} を {振|ふ}る よう に 、 {一度|いちど} だけ {揺|ゆ}れた 。') });
  EN('gd.maker', {
    region: 'lanternfall', bg: 'belltower', music: 'boss', name: T('The Bell\'s Maker', '{鐘|かね} の {鋳物師|いもじ}'), art: 'lf_keeper', artOpts: { col: '#6a5a3a' }, look: { custom: 'spirit', col: '#6a5a3a' }, knots: 5, pool: POOL.lf,
    pattern: ['rest'],
    intro: T('The air in the bell hall smells of hot bronze. A figure in a scorched leather apron is walking round the Drowned Bell, tapping it with a hammer, listening, frowning: the one who cast it, long ago.', '{鐘|かね} の {間|ま} に 、 {熱|あつ}い {青銅|せいどう} の {匂|にお}い が する 。 {焦|こ}げた {革|かわ} の {前掛|まえか}け の {人影|ひとかげ} が 、 {沈鐘|ちんしょう} の {周|まわ}り を {歩|ある}き 、 {金槌|かなづち} で {叩|たた}いて は {耳|みみ} を {澄|す}まし 、 {顔|かお} を しかめて いる 。 {昔|むかし} 、 この {鐘|かね} を {鋳|い}た {人|ひと} だ 。'),
    settle: T('The Bell\'s Maker puts down the hammer, lays a palm on the bronze, and is gone. The bell hums a little, flat, as it always has.', '{鋳物師|いもじ} は {金槌|かなづち} を {置|お}き 、 {青銅|せいどう} に {手|て} を {当|あ}てて 、 {消|き}えた 。 {鐘|かね} は 、 いつも の {低|ひく}い {音|おと} で 、 {小|ちい}さく {鳴|な}った 。') });
  EN('gd.bridgefounder', {
    region: 'manybridge', bg: 'undercroft', music: 'boss', name: T('The Bridge Founder', '{橋|はし} の {開祖|かいそ}'), art: 'golem', artOpts: { col: '#7a6a50', core: '#e0c890' }, look: { custom: 'golem', col: '#7a6a50' }, knots: 5, pool: POOL.mb,
    pattern: ['rest'],
    intro: T('Under the first bridge, where its oldest piles go into the water, a builder made of timber and river-stone unfolds itself, holding a plan. The plan shows one bridge. Manybridge has eight hundred.', '{最初|さいしょ} の {橋|はし} の {下|した} 、 {一番|いちばん} {古|ふる}い {杭|くい} が {水|みず} に {入|はい}る {所|ところ} で 、 {材木|ざいもく} と {川石|かわいし} で できた {大工|だいく} が {立|た}ち{上|あ}がった 。 {手|て} に は {図面|ずめん} 。 {図面|ずめん} に は {橋|はし} が {一本|いっぽん} 。 {八百橋|やおばし} に は {八百|はっぴゃく} ある 。'),
    settle: T('The Bridge Founder rolls up the plan, tucks it under the first bridge\'s oldest beam, and is only timber and stone again.', '{開祖|かいそ} は {図面|ずめん} を {巻|ま}き 、 {最初|さいしょ} の {橋|はし} の {一番|いちばん} {古|ふる}い {梁|はり} の {下|した} に しまって 、 ただ の {材木|ざいもく} と {石|いし} に {戻|もど}った 。') });
  EN('gd.oxelder', {
    region: 'cloudroad', bg: 'cloudtop', music: 'boss_cr', setting: 'outdoor', name: T('The Cloud Ox Elder', '{雲牛|くもうし} の {長老|ちょうろう}'), art: 'blot', artOpts: { col: '#f0f2f4' }, look: { custom: 'blot', col: '#f0f2f4' }, knots: 5, pool: POOL.cr,
    pattern: ['strike', 'lie', 'sweep', 'rest'],
    intents: {
      lie: { power: 1, target: 'rand',
        text: {
          F: { jp: 'くもじとうげ は 、 もう とおれない よ 。', en: 'The High Pass can\'t be crossed any more.' },
          E: { jp: '{雲路峠|くもじとうげ} は 、 もう {通|とお}れない そう だ 。', en: 'They say the High Pass can\'t be crossed any more.' },
          I: { jp: '{雲路峠|くもじとうげ} は 、 {雪崩|なだれ} で {埋|う}まった らしい 。 {誰|だれ} も {越|こ}えられない はず だ 。', en: 'The High Pass was buried by an avalanche, it seems. Nobody can be getting over it.' },
          A: { jp: '{雲路峠|くもじとうげ} は {閉|と}ざされた と {聞|き}く 。 {越|こ}えた {者|もの} など 、 いる はず も ない 。', en: 'I hear the High Pass is shut. There cannot possibly be anyone who crossed it.' },
        },
        truth: {
          F: ch({ item: 'v:道', prompt: { en: 'It says the High Pass can\'t be crossed. What do you know?' }, options: [o('You crossed it yourself.', true), o('It\'s right.', false, 'You walked over it on your way here.')] }),
          E: ch({ item: 'g:sou_hear', prompt: { en: 'It passes on hearsay (そうだ). What do you know at first hand?' }, options: [o('You crossed the pass yourself: it is open.', true), o('Nothing: hearsay is always true.', false, 'そうだ only passes on what was heard; you know better at first hand.'), o('The pass is closed in summer.', false, 'Nothing you saw says so.')] }),
          I: ch({ item: 'g:hazu', prompt: { en: 'らしい, then はず. What is wrong with its reasoning?' }, options: [o('It reasons from a rumour; you crossed the pass, so "nobody can" is simply false.', true), o('Nothing: はず makes it certain.', false, 'はず is an expectation, and your own crossing beats it.'), o('It is right about the avalanche.', false, 'You crossed it yourself; whatever it heard, the pass is open.')] }),
          A: ch({ item: 'g:hazu', prompt: { en: 'はずもない: how sure is it, and on what grounds?' }, options: [o('Very sure, on no grounds but hearsay (と {聞|き}く); you are the one who crossed it.', true), o('Sure, because it saw the pass shut.', false, 'と {聞|き}く: it only heard.'), o('Not sure at all.', false, 'はずもない is strong: "there cannot possibly be".')] }),
        } },
    },
    intro: T('At the summit cairn the cloud parts round something huge and white and slow: the eldest of the cloud oxen, older than the road, with travellers\' prayer strips on its horns. It lowers its head at you and calls down the slope to its herd.', '{頂上|ちょうじょう} の {石積|いしづ}み で 、 {雲|くも} が {大|おお}きくて {白|しろ}い {何|なに} か を {避|よ}けて {流|なが}れる 。 {道|みち} より も {古|ふる}い 、 {雲牛|くもうし} の {長老|ちょうろう} だ 。 {角|つの} に は 、 {昔|むかし} の {旅人|たびびと} の {願|ねが}い{札|ふだ} 。 {長老|ちょうろう} は {頭|あたま} を {下|さ}げ 、 {坂|さか} の {下|した} の {群|む}れ を {呼|よ}んだ 。'),
    settle: T('The Elder lies down beside the path like a bank of cloud and lets you pass. Its herd settles round it.', '{長老|ちょうろう} は {雲|くも} の よう に {道|みち} の {脇|わき} に {横|よこ}たわり 、 あなた を {通|とお}して くれた 。 {群|む}れ も その {周|まわ}り に {座|すわ}った 。') });
  EN('gd.kettlemother', {
    region: 'yn_vents', bg: 'yn_vents', music: 'yn_kettle', setting: 'indoor', name: T('The Kettle\'s Mother', '{釜|かま} の {母|はは}'), art: 'golem', artOpts: { col: '#5a5258', core: '#e8e0d0' }, look: { custom: 'golem', col: '#5a5258' }, knots: 5, pool: POOL.yn,
    pattern: ['flood', 'charge', 'plea', 'strike', 'rest'],
    intents: {
      plea: { power: 1,
        text: {
          F: { jp: 'わたし の こ に 、 だれか はなしかけて いる ？', en: 'Does anyone talk to my child?' },
          E: { jp: '{私|わたし} の {子|こ} に 、 {誰|だれ} か {話|はな}しかけて います か 。', en: 'Does anyone talk to my child?' },
          I: { jp: '{私|わたし} の {子|こ} は 、 {怒鳴|どな}られて ばかり いた そう だ ね 。 {今|いま} は どう なの 。', en: 'They tell me my child was shouted at, over and over. How is it now?' },
          A: { jp: '{私|わたし} の {子|こ} は 、 {今|いま} も {上|うえ} の {騒|さわ}ぎ に {怯|おび}えて いる の かい 。', en: 'Is my child still frightened by the noise up above?' },
        },
        answer: {
          F: ch({ item: 'g:v_te_iru', prompt: { en: 'Answer the Kettle\'s Mother.' }, options: [oj('うん 、 まいにち 、 まち の ひと が はなしかけて いる よ 。', true), oj('ううん 、 だれ も いない よ 。', false, 'The town talks to it every day now.')] }),
          E: ch({ item: 'g:v_te_iru', prompt: { en: 'Answer the Kettle\'s Mother.' }, options: [oj('はい 。 {町|まち} の {人|ひと} たち が 、 {毎日|まいにち} {話|はな}しかけて います 。', true), oj('いいえ 、 {誰|だれ} も {近|ちか}づきません 。', false, 'People come and talk to it now.'), oj('はい 、 {毎日|まいにち} {怒鳴|どな}って います 。', false, 'Shouting was what frightened it.')] }),
          I: ch({ item: 'g:koto_ni_suru', prompt: { en: 'Answer the Kettle\'s Mother. (Read them closely: two are near.)' }, options: [oj('{町|まち} の {人|ひと} たち は 、 {怒鳴|どな}らず に {話|はな}し{合|あ}う こと に しました 。 お{子|こ}さん は 、 よく {眠|ねむ}って います 。', true), oj('{町|まち} の {人|ひと} たち は 、 もう {話|はな}さない こと に しました 。', false, 'Silence frightened it as much as shouting.'), oj('お{子|こ}さん は 、 {町|まち} を {出|で}る こと に しました 。', false, 'It is still in its pool.')] }),
          A: ch({ item: 'g:keigo_sonkei', prompt: { en: 'Answer the Kettle\'s Mother. (Read them closely: two are near.)' }, options: [oj('いいえ 。 {町|まち} の {方々|かたがた} は 、 {今|いま} は {怒鳴|どな}らず に {話|はな}し{合|あ}って いらっしゃいます 。 お{子|こ}さん は 、 その {声|こえ} を {聞|き}きながら {眠|ねむ}って います 。', true), oj('はい 。 {町|まち} の {方々|かたがた} は 、 {今|いま} も {怒鳴|どな}って いらっしゃいます 。', false, 'The town promised to talk, not shout, and kept it.'), oj('いいえ 。 お{子|こ}さん は 、 {誰|だれ} の {声|こえ} も {聞|き}かず に {眠|ねむ}って います 。', false, 'It listens to the talking; that is what calms it.')] }),
        } },
    },
    intro: T('The Kettle Below\'s pool boils up white, and out of the steam rises a second shape, larger and older: the Kettle\'s Mother, who sleeps under the whole valley. She is wet through with her own steam, and she wants to know who has been talking to her child.', '{釜|かま}の{主|ぬし} の {湯|ゆ} が {白|しろ}く {沸|わ}き{立|た}ち 、 {湯気|ゆげ} の {中|なか} から 、 もっと {大|おお}きく {古|ふる}い {影|かげ} が {現|あらわ}れた 。 {谷|たに} の {下|した} で {眠|ねむ}る 、 {釜|かま} の {母|はは} だ 。 {自分|じぶん} の {湯気|ゆげ} で 、 ずぶ{濡|ぬ}れ に なって いる 。'),
    settle: T('The Mother sinks back below the valley. That night every bath in Steamhollow is exactly the right heat.', '{母|はは} は {谷|たに} の {下|した} へ {沈|しず}んで いった 。 その {夜|よる} 、 {湯|ゆ}ノ{谷|たに} の どの {風呂|ふろ} も 、 ちょうど いい {熱|あつ}さ だった 。') });
  EN('gd.firstkeeper', {
    region: 'kotonoha', bg: 'kotonoha_cave', music: 'boss_ko', setting: 'indoor', name: T('The First Keeper', '{最初|さいしょ} の {葉守|はもり}'), art: 'echo', artOpts: { col: '#4a7a4a' }, look: { custom: 'spirit', col: '#4a7a4a' }, knots: 5, pool: POOL.ko,
    pattern: ['mend', 'strike', 'rest'],
    intro: T('Among the roots, an old woman made of bark and leaf-litter is sorting leaves into shelves that are no longer there. She was the island\'s first keeper. Her ledger lies open on a root, and the wind keeps turning its pages.', '{根|ね} の {間|あいだ} で 、 {木|き} の {皮|かわ} と {落|お}ち{葉|ば} で できた {老婆|ろうば} が 、 もう ない {棚|たな} に {葉|は} を {仕分|しわ}けて いる 。 {島|しま} の {最初|さいしょ} の {葉守|はもり} だ 。 {根|ね} の {上|うえ} に {帳面|ちょうめん} が {開|ひら}いて いて 、 {風|かぜ} が {頁|ページ} を めくり{続|つづ}けて いる 。'),
    settle: T('The First Keeper closes her ledger, sets it on the newest shelf, and settles into the roots like leaf-litter in autumn.', '{最初|さいしょ} の {葉守|はもり} は {帳面|ちょうめん} を {閉|と}じ 、 {一番|いちばん} {新|あたら}しい {棚|たな} に {置|お}いて 、 {秋|あき} の {落|お}ち{葉|ば} の よう に {根|ね} の {間|あいだ} へ {沈|しず}んで いった 。') });

  Object.assign(C.reviewEnemies = C.reviewEnemies || {}, { 'gd.founder': 'gd', 'gd.headoffice': 'gd', 'gd.firstfire': 'gd', 'gd.sisterstar': 'gd', 'gd.maker': 'gd', 'gd.bridgefounder': 'gd', 'gd.oxelder': 'gd', 'gd.kettlemother': 'gd', 'gd.firstkeeper': 'gd' });
  if (RB.creaturesA && RB.creaturesA.auditEnemy) {
    const note = 'interim: an old guardian (P15e) drawn on an existing family with its own palette; its own drawing is P16 art work (AC-1, C-82)';
    for (const [id, art] of [['gd.founder', 'echo'], ['gd.headoffice', 'clerk'], ['gd.firstfire', 'warden'], ['gd.sisterstar', 'wisp'], ['gd.maker', 'lf_keeper'], ['gd.bridgefounder', 'golem'], ['gd.oxelder', 'blot'], ['gd.kettlemother', 'golem'], ['gd.firstkeeper', 'echo']]) RB.creaturesA.auditEnemy(id, art, 'incomplete', note);
  }

  // ---- conditions: the First Fire (made of flame: water weakens it, earth buries it, wind and flame feed it) -------
  const EMBER = { enemy: 'co.ember', conditions: ['flame'] };
  C.encounters['gd.co'] = {
    id: 'gd.co', kind: 'battle', name: say('{最初|さいしょ} の {火|ひ}', 'The First Fire'), story: true, guardian: 'co',
    lead: { enemy: 'gd.firstfire', conditions: ['flame'] },
    group: { normal: [EMBER], hard: [EMBER, EMBER] },
    rules: { wait: true, conditions: true },
    help: { explain: { en: 'Everything here is made of flame. Water weakens a creature of flame, so the next Unravel frees more; earth buries it for a moment. Wind and fire only feed it.' },
      suggest: { en: 'Answer its Heat with water before it builds; untie it while it pleads, and answer the plea: what was it lit for?' } },
  };

  // ---- arrivals: the Sister Star (as her knots loosen her little lights come down; a bell calls them home) ---------
  const LIGHT = { enemy: 'sb.starling', knots: 1 };
  const DOWN = say('{小|ちい}さな {星|ほし} が 、 {後|あと} から {降|お}りて くる 。', 'A little light is coming down after her.');
  C.encounters['gd.sb'] = {
    id: 'gd.sb', kind: 'battle', name: say('{姉星|あねぼし}', 'The Sister Star'), story: true, guardian: 'sb', setPiece: true, capacity: 4,
    lead: { enemy: 'gd.sisterstar' },
    rules: { wait: true, conditions: true },
    arrivals: [{ enemy: LIGHT, leadBelow: 3, prevent: ['bell'], say: DOWN }, { enemy: LIGHT, leadBelow: 2, prevent: ['bell'], say: DOWN }, { enemy: LIGHT, leadBelow: 1, prevent: ['bell'], say: DOWN }],
    conclusions: [{ id: 'home', when: { settled: 'f0' }, result: 'win', text: { en: 'The Sister Star goes home, and every little light that came down goes with her.' } }],
    help: { explain: { en: 'Each time one of her knots comes loose, a little light comes down to help her; you can see each one coming. A bell rung in time calls it home before it arrives.' },
      suggest: { en: 'Ring a bell when one is coming; clear her Shroud with light; answer her plea: why does her sister wait no more?' } },
  };

  // ---- arrivals: the Cloud Ox Elder (the herd comes up the path behind it; a rope across the path holds it back) ----
  const CALF = { enemy: 'cr.ox', pattern: ['strike', 'rest'] };
  C.encounters['gd.cr'] = {
    id: 'gd.cr', kind: 'battle', name: say('{雲牛|くもうし} の {長老|ちょうろう}', 'The Cloud Ox Elder'), story: true, guardian: 'cr', setPiece: true, capacity: 4,
    lead: { enemy: 'gd.oxelder' },
    rules: { wait: true, conditions: true },
    arrivals: [2, 4, 6].map((after) => ({ enemy: CALF, after, prevent: ['bind', 'anchor'], say: say('{坂|さか} を {登|のぼ}って くる {蹄|ひづめ} の {音|おと} 。', 'Hooves on the slope: more of the herd is coming up the path.') })),
    conclusions: [{ id: 'rests', when: { settled: 'f0' }, result: 'win', text: { en: 'The Elder lies down beside the path, and the herd with it.' } }],
    help: { explain: { en: 'The herd comes up the path behind the Elder every two exchanges, and you can hear each one coming. A rope across the path (or a stone to anchor it) holds them back before they arrive.' },
      suggest: { en: 'Hold the path when hooves are coming; then show its old rumour about the pass for what it is: you crossed it.' } },
  };

  // ---- conditions: the Kettle's Mother (wet through: ice freezes her still, and a stone cracks the ice) ------------
  const WISP = { enemy: 'yn.steamwisp', conditions: ['airborne'] };
  C.encounters['gd.yn'] = {
    id: 'gd.yn', kind: 'battle', name: say('{釜|かま} の {母|はは}', 'The Kettle\'s Mother'), story: true, guardian: 'yn',
    lead: { enemy: 'gd.kettlemother', conditions: ['wet'] },
    group: { normal: [WISP], hard: [WISP, WISP] },
    rules: { wait: true, conditions: true },
    help: { explain: { en: 'She is wet through: ice freezes something wet solid, so it cannot move, and a stone then cracks the ice and frees a knot. Wind or flame would only dry her. Her wisps fly: a gust blows them off course.' },
      suggest: { en: 'Water if she has dried, then ice, then a stone; answer her plea about her child.' } },
  };
})(RB.content);
