/* The Cloudroad, Chapter 10: creatures and encounters (expansion P12; plan R2, E3 wanderers, E6 objectives, E8 social
 * and folklore, E26 silencing; docs/future/work/P12_CLOUDROAD.md).
 *   cr.waystone     Waystone Imp (道標小僧): turns the signposts round and reads them wrong (a False promise, put right by
 *                   reading the sign yourself); a Strike.
 *   cr.echo         Runner's Echo (走り木霊): says the last message back with one thing changed, the way a message
 *                   garbles down a line of mouths (a Mirror); a Strike.
 *   cr.ox           Cloud Ox (雲牛): a cloud lying across the road in the shape of an ox; slow: a Sweep, then it gathers
 *                   itself again (Re-tying).
 *   cr.fogporter    Fog Porter (霧担ぎ): a porter made of fog that carries off whatever isn't tied down; in its own
 *                   encounter (cr.fog_papers) it goes for your travel papers (protect the document, E6).
 *   cr.packlantern  Pack-Lantern (背負い提灯): a paper lantern trudging under a porter's frame; Heat, a Strike, Re-tying.
 *   cr.moth         Blankpage Moth (白紙蛾): its dust blanks out writing: a Hush on the modifiers for two exchanges
 *                   (E26), and a Chill. Near the Barrier, where the names on travel papers have gone blank.
 *   cr.courier      The Courier Who Never Arrived (届かずの飛脚): the last courier's echo at the hut on the pass, still
 *                   telling himself the stations' versions of what became of him (social and folklore, no Unravel,
 *                   C-09): each version is answered with what the hut shows, until the true one is left and the run
 *                   can be finished.
 *   cr.wander_oshika  the pilgrim (E3): Oshika holds the shrine path against a Waystone Imp, and tells Kotonoha's
 *                     story in a pilgrim's version (F-75's fourth telling).
 *   cr.wander_ginji   the smuggler (E3): Ginji helps against the moths above the checkpoint (on the road he took round
 *                     it), then asks a favour at Kumoi (cr.ginji, 25_side.js).
 * Interim art on existing families with their own palettes (F-36's rule; their own families are P16 art under AC-1,
 * C-82). Every conclusion leads on: a lost encounter, a lost objective, never strands the road. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  const say = (jp, en) => ({ jp, en });
  const ch = (o) => Object.assign({ kind: 'choose' }, o);
  const o = (en, ok, why) => (why ? { en, ok, why: { en: why } } : { en, ok });
  const oj = (jp, ok, why) => (why ? { jp, ok, why: { en: why } } : { jp, ok });
  C.encounters = C.encounters || {};
  function task(item, en, ok, w1, why1, w2, why2) {
    const low = ch({ item, prompt: { en }, options: [{ jp: ok, ok: true }, { jp: w1, ok: false, why: { en: why1 } }] });
    const high = ch({ item, prompt: { en: en + ' (Read them closely: two are near.)' },
      options: [{ jp: ok, ok: true }, { jp: w1, ok: false, why: { en: why1 } }, { jp: w2, ok: false, why: { en: why2 } }] });
    return { F: low, E: low, I: high, A: high };
  }

  // ---- the creatures ----------------------------------------------------------------------------------------------
  const EN = (id, d) => (C.enemies[id] = Object.assign({ region: 'cloudroad', bg: 'cloudroad', music: 'battle_cr', boss: false, setting: 'outdoor', edition: 2 }, d));
  const POOL = {
    tags: ['cloudroad'],
    F: ['v:道', 'v:山', 'v:雪', 'v:手紙', 'g:prt_he', 'g:prt_kara_made'],
    E: ['g:cr_to_itte', 'g:v_ta', 'g:prt_ni', 'g:kamo', 'g:deshou'],
    I: ['g:sou_hear', 'g:rashii', 'g:you_mitai', 'g:hazu', 'g:te_aru'],
    A: ['g:cr_tono', 'g:adv_ni_suginai', 'g:adv_wake_dewa_nai'],
  };
  EN('cr.waystone', {
    name: T('Waystone Imp', '{道標|みちしるべ}{小僧|こぞう}'), art: 'golem', artOpts: { col: '#8a9094' }, look: { custom: 'golem', col: '#8a9094' }, knots: 2, pool: POOL,
    pattern: ['lie', 'strike', 'rest'],
    // its trick: turning the signpost round, and reading it out wrong
    intents: {
      lie: { power: 1, target: 'rand',
        text: {
          F: { jp: 'みちしるべ を くるっと まわした 。 「くもい は こっち 。 した へ 、 した へ 。」', en: 'It spins the signpost round. "Kumoi\'s this way. Down, down."' },
          E: { jp: '{道標|みちしるべ} の {矢印|やじるし} を {逆|ぎゃく} に {回|まわ}した 。 「{坂下|さかした} は {上|うえ} だ よ 。 {坂|さか} の {上|うえ} に ある から 、 {坂下|さかした} 。」', en: 'It turns the signpost\'s arrow backwards. "Sakashita\'s up. It\'s at the top of the slope, so: Sakashita."' },
          I: { jp: '「{崖道|がけみち} は {近|ちか}い らしい よ 。 {馬|うま} も {通|とお}れる そう だ 。」 {道標|みちしるべ} の {字|じ} を 、 {指|ゆび} で {隠|かく}して いる 。', en: '"The ledge is shorter, apparently. They say horses can use it too." It covers the stone\'s letters with a finger.' },
          A: { jp: '{道標|みちしるべ} の {古|ふる}い {字|じ} 「{雲居|くもい} へ {通|つう}ず 」 の {後|あと} に 、 {墨|すみ} で 「べからず 」 と {書|か}き{足|た}して ある 。', en: 'After the old carved letters 「雲居へ通ず」, someone has added べからず in ink.' },
        },
        truth: {
          F: ch({ item: 'c:cr_way_f', prompt: { en: 'It says Kumoi is down the hill. The ledger lists the stations from the bottom up, and Kumoi is the seventh.' }, options: [o('Kumoi is up (うえ): the last station, at the top.', true), o('It\'s right: down.', false, 'Kumoi is the seventh station counting from the bottom: up the road, not down.')] }),
          E: ch({ item: 'c:cr_way_e', prompt: { en: 'What is wrong with what it says?' }, options: [o('坂下 means the foot of the slope: Sakashita is at the bottom, not the top.', true), o('坂下 means "on the slope".', false, '下 is below: the foot of the slope.'), o('Nothing: 下 means up.', false, '下 is down, below; 上 is up.')] }),
          I: ch({ item: 'c:cr_way_i', prompt: { en: 'It passes on what it has heard (らしい, そうだ). What does the stone by the ledge itself say?' }, options: [o('「崖道、馬通るべからず」: no horses on the ledge. What it heard is wrong, and it is hiding the sign.', true), o('If it heard it, it must be true.', false, 'らしい and そうだ only say it was heard; the stone says otherwise.'), o('The ledge is closed to everyone.', false, 'Only to horses.')] }),
          A: ch({ item: 'c:cr_way_a', prompt: { en: 'What did the stone say before the ink was added?' }, options: [o('「雲居へ通ず」: this way leads to Kumoi. べからず (must not) is the imp\'s addition.', true), o('「雲居へ通ずべからず」: the way is closed.', false, 'The ink is fresh; the carving ends at 通ず.'), o('通ず means "closed".', false, '通ず is the classical 通じる: leads to, goes through.')] }),
        } },
    },
    intro: T('A little stone figure no taller than a signpost, with a signpost\'s arm for each hand. It turns the way-markers round when no one is looking, and reads them out wrong.', '{道標|みちしるべ} ほど の {小|ちい}さな {石|いし} の {子|こ} 。 {人|ひと} が {見|み}て いない {間|あいだ} に {道標|みちしるべ} を {回|まわ}して 、 {間違|まちが}えて {読|よ}む 。'),
    settle: T('The imp turns the signpost back the right way, sulking, and sits down beside it as a stone.', '{小僧|こぞう} は ふくれっ{面|つら} で {道標|みちしるべ} を {正|ただ}しい {向|む}き に {戻|もど}し 、 その {横|よこ} で {石|いし} に なった 。') });
  EN('cr.echo', {
    name: T('Runner\'s Echo', '{走|はし}り{木霊|こだま}'), art: 'echo', artOpts: { col: '#d8c8a8' }, look: { custom: 'spirit', col: '#d8c8a8' }, knots: 2, pool: POOL,
    pattern: ['mirror', 'strike', 'rest'],
    // what it says back: the last message, with one thing changed, as a message garbles down a line of mouths
    intents: {
      mirror: { power: 2, target: 'rand',
        text: {
          F: { jp: '「あした 、 あさ に つく 」 …… 「あした 、 あさ に つくる 」 。', en: '"Arriving tomorrow morning." … "Making tomorrow morning."' },
          E: { jp: '「{三日|みっか} に {着|つ}きます 」 …… 「{四日|よっか} に {着|つ}きます 」 。', en: '"Arriving on the 3rd." … "Arriving on the 4th."' },
          I: { jp: '「{橋|はし} が {流|なが}された そう だ 」 …… 「{橋|はし} が {流|なが}された 」 。', en: '"They say the bridge was washed away." … "The bridge was washed away."' },
          A: { jp: '「{峠|とうげ} {越|ご}え は {明朝|みょうちょう} と の {伝言|でんごん} です 」 …… 「{峠|とうげ} {越|ご}え は {明朝|みょうちょう} です 」 。', en: '"The message is: the pass tomorrow morning." … "The pass is tomorrow morning."' },
        },
        truth: {
          F: ch({ item: 'c:cr_echo_f', prompt: { en: 'The echo said it back. What changed?' }, options: [o('つく (arrive) became つくる (make): one sound was added.', true), o('Nothing changed.', false, 'Listen to the end: つく became つくる.')] }),
          E: ch({ item: 'c:cr_echo_e', prompt: { en: 'What changed in the message?' }, options: [o('The day: 三日 (the 3rd) became 四日 (the 4th).', true), o('The verb: 着きます became 来ます.', false, 'The verb is the same both times.'), o('Nothing: みっか and よっか are the same day.', false, 'みっか is the 3rd, よっか the 4th.')] }),
          I: ch({ item: 'c:cr_echo_i', prompt: { en: 'What did the echo drop, and what does that do?' }, options: [o('そうだ: a report of something heard became a plain fact.', true), o('It changed which bridge.', false, 'The same bridge; what\'s gone is how it was known.'), o('Nothing that matters.', false, 'Without そうだ, a rumour is passed on as something seen.')] }),
          A: ch({ item: 'c:cr_echo_a', prompt: { en: 'What did the echo drop?' }, options: [o('との伝言: it was marked as someone\'s message; the echo passes it on as a fact of its own.', true), o('It changed the time.', false, '明朝 both times.'), o('との is the same as と.', false, 'との伝言 names it a message; that is what went missing.')] }),
        } },
    },
    intro: T('A runner\'s shape in the mist, mid-stride, never arriving. It says the last thing it heard back to you, a little wrong.', '{霧|きり} の {中|なか} の 、 {走|はし}る {飛脚|ひきゃく} の {形|かたち} 。 {着|つ}く こと が ない 。 {最後|さいご} に {聞|き}いた {言葉|ことば} を 、 {少|すこ}し {違|ちが}えて {言|い}い{返|かえ}す 。'),
    settle: T('The echo says the message back right, once, and runs on up the road into the mist, lighter.', '{木霊|こだま} は {一度|いちど} だけ {伝言|でんごん} を {正|ただ}しく {言|い}い{返|かえ}し 、 {軽|かる}く なって {霧|きり} の {坂|さか} を {駆|か}け{上|あ}がって いった 。') });
  EN('cr.ox', {
    name: T('Cloud Ox', '{雲牛|くもうし}'), art: 'blot', artOpts: { col: '#dfe4e8' }, look: { custom: 'blot', col: '#dfe4e8' }, knots: 3, pool: POOL,
    pattern: ['rest', 'sweep', 'mend'],
    intro: T('A cloud in the shape of an ox, lying across the road and chewing on the fog. When it gets up, the road shakes.', '{牛|うし} の {形|かたち} を した {雲|くも} が 、 {道|みち} に {寝|ね}そべって {霧|きり} を {噛|か}んで いる 。 {立|た}ち{上|あ}がる と 、 {道|みち} が {揺|ゆ}れる 。'),
    settle: T('The ox heaves itself up, unhurried, and wanders off the road, becoming fog again over the gorge.', '{牛|うし} は のっそり と {立|た}ち{上|あ}がり 、 {道|みち} を {外|はず}れて 、 {谷|たに} の {上|うえ} で また {霧|きり} に {戻|もど}った 。') });
  EN('cr.fogporter', {
    name: T('Fog Porter', '{霧担|きりかつ}ぎ'), art: 'wisp', artOpts: { col: '#c4ccd0' }, look: { custom: 'wisp', col: '#c4ccd0' }, knots: 2, pool: POOL,
    pattern: ['shroud', 'strike', 'rest'],
    intro: T('A porter made of fog, a carrying pole across its shoulders with bundles that aren\'t there. It picks up whatever isn\'t tied down.', '{霧|きり} で できた {人足|にんそく} 。 {肩|かた} に {天秤棒|てんびんぼう} 、 その {先|さき} に {見|み}えない {荷物|にもつ} 。 {縛|しば}って ない {物|もの} は 、 {何|なん} でも {担|かつ}いで {行|い}く 。'),
    settle: T('The porter sets its pole down, empty-handed, and thins away into the slope.', '{霧担|きりかつ}ぎ は {手|て}ぶら で {天秤棒|てんびんぼう} を {下|お}ろし 、 {坂|さか} に {薄|うす}れて {消|き}えた 。') });
  EN('cr.packlantern', {
    name: T('Pack-Lantern', '{背負|しょ}い{提灯|ぢょうちん}'), art: 'lantern', artOpts: { col: '#e08a4a' }, look: { custom: 'lanternghost', col: '#e08a4a' }, knots: 3, pool: POOL,
    pattern: ['heat', 'strike', 'mend'],
    intro: T('A paper lantern trudging up the road under a porter\'s frame, its load lashed on with straw rope. It is very hot inside, and it swings its pack when it turns.', '{背負|しょ}い{子|こ} を {背負|せお}った {提灯|ちょうちん} が 、 {坂|さか} を {登|のぼ}って {来|く}る 。 {中|なか} は とても {熱|あつ}く 、 {振|ふ}り{向|む}く と {荷|に} が {振|ふ}り{回|まわ}される 。'),
    settle: T('The lantern sets its frame down by the road, cools to an ember glow, and stays there like a waymark.', '{提灯|ちょうちん} は {背負|しょ}い{子|こ} を {道端|みちばた} に {下|お}ろし 、 {熾火|おきび} ほど に {冷|さ}めて 、 {目印|めじるし} の よう に そこ に {残|のこ}った 。') });
  EN('cr.moth', {
    name: T('Blankpage Moth', '{白紙蛾|はくしが}'), art: 'blot', artOpts: { col: '#eeeae0' }, look: { custom: 'moth', col: '#eeeae0' }, knots: 2, pool: POOL, bg: 'cloudtop',
    pattern: ['silence:mods', 'chill', 'rest'],
    // its dust blanks out writing: for two exchanges your modifiers say nothing (E26); a bell or a voice ends it
    intents: { 'silence:mods': { family: 'modifiers', rounds: 2 } },
    intro: T('A moth with wings like two blank pages. Where its dust settles, writing goes pale and then is gone.', '{白紙|はくし} の よう な {羽|はね} の {蛾|が} 。 {鱗粉|りんぷん} が {落|お}ちた {所|ところ} の {字|じ} は 、 {薄|うす}く なって 、 {消|き}えて しまう 。'),
    settle: T('The moth folds its blank wings and settles on a stone; when it flies off, the stone\'s letters are still there.', '{蛾|が} は {白|しろ}い {羽|はね} を {畳|たた}んで {石|いし} に {止|と}まった 。 {飛|と}び{去|さ}った {後|あと} も 、 {石|いし} の {字|じ} は ちゃんと {残|のこ}って いた 。') });

  // the Courier Who Never Arrived (the chapter's boss: a social and folklore encounter; no Unravel, C-09)
  EN('cr.courier', {
    name: T('The Courier Who Never Arrived', '{届|とど}かず の {飛脚|ひきゃく}'), art: 'echo', artOpts: { col: '#c8b48a' }, look: { custom: 'spirit', col: '#c8b48a' }, knots: 6, pool: POOL, boss: true, bg: 'cloudtop', music: 'boss_cr',
    pattern: ['lie:ran', 'lie:fell', 'lie:fox', 'plea'],
    // the stations' versions of what became of him, told by himself; the hut shows otherwise: the seal on the bag
    // unbroken, his sandals set by the hearth, the note on the wall in his own hand
    intents: {
      'lie:ran': { power: 2, target: 'rand',
        text: {
          F: { jp: 'おれ は 、 おかね を もって にげた 。', en: 'I ran off with the money.' },
          E: { jp: '{俺|おれ} は 、 {郵便|ゆうびん} の {金|かね} を {持|も}って {逃|に}げた 。 {下|した} の {宿|しゅく} で は 、 そう {言|い}って いる だろう 。', en: 'I ran off with the post money. That\'s what they say at the stations below, isn\'t it.' },
          I: { jp: '{金|かね} を {持|も}って {逃|に}げた らしい 。 {坂下|さかした} の {年寄|としよ}り が 、 そう {言|い}って いた そう だ 。', en: 'Apparently I ran off with the money. They say Sakashita\'s old man said so.' },
          A: { jp: '{金|かね} を {持|も}ち{逃|に}げ した と の {噂|うわさ} 。 {否|いな} と {言|い}う {者|もの} も 、 {今|いま} は ない 。', en: 'The rumour is that I made off with the money. There is no one left to say otherwise.' },
        },
        truth: {
          F: ch({ item: 'c:cr_courier_ran', prompt: { en: 'It says it ran off with the money. You saw the bag on its peg.' }, options: [o('The bag is here, its seal unbroken: he never ran with it.', true), o('It\'s right: he ran.', false, 'The bag is on the peg in the hut, still sealed.')] }),
          E: ch({ item: 'c:cr_courier_ran', prompt: { en: 'What is wrong with what it says?' }, options: [o('The bag is still here in the hut, sealed: he didn\'t run off with it.', true), o('He ran, but without the money.', false, 'He never left the hut with the bag at all.'), o('Nothing: Heisuke said so.', false, 'Heisuke\'s father said so; the bag on the peg says otherwise.')] }),
          I: ch({ item: 'c:cr_courier_ran', prompt: { en: 'It passes on a story twice removed (らしい, そうだ). What do you know first-hand?' }, options: [o('The bag is on the peg with its seal unbroken: what was heard is wrong.', true), o('If an elder said it, it must be so.', false, 'He heard it from his father; the bag is something you saw.'), o('Nobody can know what happened.', false, 'The hut shows a good deal of it.')] }),
          A: ch({ item: 'c:cr_courier_ran', prompt: { en: 'It calls the story a rumour (との噂). How do you answer?' }, options: [o('A rumour it is: the seal on the bag was never broken.', true), o('A rumour that long-lived must be true.', false, 'Fifty years of telling make a story old, not true.'), o('No one can deny it now.', false, 'The bag on the peg denies it.')] }),
        } },
      'lie:fell': { power: 2, target: 'rand',
        text: {
          F: { jp: 'ちがう 。 おれ は 、 ゆき の なか で 、 たに へ おちた 。', en: 'No. I fell into the gorge, in the snow.' },
          E: { jp: '…… いや 、 {違|ちが}う 。 {雪|ゆき} の {中|なか} で 、 {谷|たに} へ {落|お}ちた ん だ 。', en: '…No, that\'s wrong. I fell into the gorge, in the snow.' },
          I: { jp: '…… {谷|たに} へ {落|お}ちた はず だ 。 {雪|ゆき} の {夜|よる} に {峠|とうげ} を {越|こ}える {飛脚|ひきゃく} は 、 みんな そう なる 。', en: '…I must have fallen into the gorge. Every courier who crosses the pass on a snowy night does.' },
          A: { jp: '{谷|たに} に {落|お}ちた に {違|ちが}いない 。 {雪|ゆき} {深|ふか}き {夜|よ} の {峠|とうげ} {越|ご}え 、 {無事|ぶじ} で {済|す}む はず も なし 。', en: 'I must have fallen into the gorge. A pass crossed on a deep-snow night could never end well.' },
        },
        truth: {
          F: ch({ item: 'c:cr_courier_fell', prompt: { en: 'It says it fell into the gorge. What did you see by the hearth?' }, options: [o('His straw sandals, set side by side by the hearth: he stayed inside.', true), o('Nothing: he fell.', false, 'His sandals are by the hearth, set out to dry.')] }),
          E: ch({ item: 'c:cr_courier_fell', prompt: { en: 'What is wrong with what it says?' }, options: [o('His sandals are by the hearth, set side by side: he took them off to dry and never went back out.', true), o('The gorge is too far.', false, 'The gorge is just below; the sandals are what tell you.'), o('Nothing: the snow was deep.', false, 'It was deep; he stayed in, and the sandals show it.')] }),
          I: ch({ item: 'c:cr_courier_fell', prompt: { en: 'It reasons that it "must have" fallen (はずだ). What does what you saw suggest (ようだ)?' }, options: [o('The sandals by the hearth: it seems he never went back out into the snow.', true), o('It must be right: couriers fall.', false, 'はずだ is reasoning from what usually happens; the sandals are what did.'), o('He fell, then came back for his sandals.', false, 'Nobody climbs out of the gorge for his sandals.')] }),
          A: ch({ item: 'c:cr_courier_fell', prompt: { en: 'It is certain it fell (に違いない). How do you answer?' }, options: [o('Certain, from what a night like that usually does; but the sandals set by the hearth say he stayed in.', true), o('When it is that certain, it must know.', false, 'Certainty is about the speaker, not the snow.'), o('The old saying proves it.', false, 'A saying about such nights is not this night.')] }),
        } },
      'lie:fox': { power: 2, target: 'rand',
        text: {
          F: { jp: 'ちがう 。 きつね が 、 おれ を みち から つれて いった 。', en: 'No. A fox led me off the road.' },
          E: { jp: '…… いや 。 {霧|きり} の {中|なか} で 、 {狐|きつね} に {化|ば}かされて 、 {道|みち} を {外|はず}れた ん だ 。', en: '…No. In the fog a fox bewitched me, and I left the road.' },
          I: { jp: '{霧|きり} の {日|ひ} に は 、 {狐|きつね} が {飛脚|ひきゃく} を {化|ば}かす らしい 。 {俺|おれ} も 、 そう だった に {違|ちが}いない 。', en: 'On foggy days, they say, foxes bewitch couriers. That must be what happened to me.' },
          A: { jp: '{狐|きつね} に {化|ば}かされた と の {言|い}い{伝|つた}え 。 {霧|きり} の {峠|とうげ} で は 、 {珍|めずら}しく も ない 。', en: 'The old tale is that a fox bewitched me. On the pass in fog, nothing unusual.' },
        },
        truth: {
          F: ch({ item: 'c:cr_courier_fox', prompt: { en: 'It blames a fox, in the fog. What does the note on the wall say?' }, options: [o('「ゆき ふかし」: snow, not fog. He wrote it himself, here.', true), o('Nothing: the wall is bare.', false, 'There is a note on the wall in his own hand.')] }),
          E: ch({ item: 'c:cr_courier_fox', prompt: { en: 'What is wrong with what it says?' }, options: [o('His own note says it was snow, and that he was waiting: he knew where he was.', true), o('There are no foxes in the mountains.', false, 'There are; the note is what tells you.'), o('Nothing: it was foggy.', false, 'The note says snow.')] }),
          I: ch({ item: 'c:cr_courier_fox', prompt: { en: 'It repeats a story about foxes (らしい). What does the note in its own hand say?' }, options: [o('「雪深し、晴れを待つ」: it was snow, and he waited. The fox is a story told about him.', true), o('A fox could have written the note.', false, 'It is in the courier\'s own hand, the same hand as the ledger\'s.'), o('The note proves the fox.', false, 'The note says snow, and waiting.')] }),
          A: ch({ item: 'c:cr_courier_fox', prompt: { en: 'It calls the fox an old tale (との言い伝え). How do you answer?' }, options: [o('A tale it is: the note in his own hand says the snow was deep and he waited for the clear.', true), o('Old tales outrank notes.', false, 'A note written that night outranks a tale told since.'), o('The fox and the snow are the same story.', false, 'One is told about him; the other he wrote.')] }),
        } },
      plea: { power: 1,
        text: {
          F: { jp: 'てがみ を 、 はこばなきゃ 。 はこばなきゃ 。', en: 'Got to carry the post. Got to carry it.' },
          E: { jp: '{便|びん} を {運|はこ}ばなければ ならない 。 {雲居|くもい} で 、 {誰|だれ} か が {待|ま}って いる 。', en: 'I have to carry the post. Someone is waiting at Kumoi.' },
          I: { jp: '{晴|は}れたら {出|で}る はず だった 。 {待|ま}って いる {人|ひと} が いる はず だ 。 …… まだ 、 {待|ま}って いる だろう か 。', en: 'I was supposed to go when it cleared. Someone ought to be waiting. …Are they still waiting?' },
          A: { jp: '{便|びん} を {届|とど}けず して 、 {飛脚|ひきゃく} と は {言|い}えまい 。 {誰|だれ} か 、 この {続|つづ}き を 。', en: 'A courier who does not deliver is no courier. Someone, the rest of this.' },
        },
        answer: {
          F: ch({ item: 'c:cr_courier_plea', prompt: { en: 'Answer it.' }, options: [{ jp: 'つぎ は 、 わたしたち が はこぶ 。', en: 'We\'ll carry it from here.', ok: true }, { jp: 'もう はこばなくて いい 。', en: 'You needn\'t carry it any more.', ok: false, why: { en: 'It wants the post to arrive, not to stop.' } }] }),
          E: ch({ item: 'c:cr_courier_plea', prompt: { en: 'Answer it so that the post goes on.' }, options: [oj('{続|つづ}き は 、 {私|わたし} たち が {運|はこ}びます 。', true), oj('{雲居|くもい} に は 、 もう {誰|だれ} も いません 。', false, 'Kumoi is there, and Shizu waited.'), oj('{手紙|てがみ} は 、 ここ に {置|お}いて {行|い}きましょう 。', false, 'That leaves the post where it has been for fifty years.')] }),
          I: ch({ item: 'c:cr_courier_plea', prompt: { en: 'It asks whether they are still waiting. Answer truthfully.' }, options: [oj('シズ さん が 、 {子供|こども} の {頃|ころ} に {一晩中|ひとばんじゅう} {待|ま}って いた そう です 。 {続|つづ}き は 、 {私|わたし} たち が {届|とど}けます 。', true), oj('もう {誰|だれ} も {待|ま}って いない はず です 。', false, 'Shizu remembers waiting; and the letter\'s family is still at Sakashita.'), oj('{待|ま}って いる か どう か 、 {関係|かんけい} ありません 。', false, 'It matters to it more than anything.')] }),
          A: ch({ item: 'c:cr_courier_plea', prompt: { en: 'Which answer takes on the rest of the run?' }, options: [oj('{確|たし}か に お{預|あず}かり します 。 {宛先|あてさき} まで 、 {必|かなら}ず お{届|とど}け します 。', true), oj('{届|とど}かぬ {便|びん} も 、 また {風情|ふぜい} が ある もの です 。', false, 'That would leave it running for ever.'), oj('{飛脚|ひきゃく} で ない {者|もの} に は 、 {運|はこ}べません 。', false, 'The relay was always passed on from hand to hand.')] }),
        } },
    },
    intro: T('In the doorway of the hut stands a courier: a straw hat, a bag on a pole, a runner\'s legs. You can see the snow through him. He is telling himself what became of him, and it is different each time.', '{小屋|こや} の {戸口|とぐち} に 、 {飛脚|ひきゃく} が {立|た}って いる 。 {笠|かさ} 、 {棒|ぼう} の {先|さき} の {状箱|じょうばこ} 、 {走|はし}る {人|ひと} の {脚|あし} 。 {体|からだ} の {向|む}こう に 、 {雪|ゆき} が {透|す}けて {見|み}える 。 {自分|じぶん} が どう なった か を 、 {自分|じぶん} に {話|はな}して いる 。 {話|はな}す たび に 、 {違|ちが}う 。'),
    settle: T('The courier lifts the bag from its peg and hands it on with both hands, the way the relay always did. Then he sits down by the cold hearth, and is gone.', '{飛脚|ひきゃく} は {状箱|じょうばこ} を {釘|くぎ} から {外|はず}し 、 {継|つ}ぎ{飛脚|びきゃく} が いつも そう した よう に 、 {両手|りょうて} で {渡|わた}した 。 そして {冷|つめ}たい {炉|ろ} の {横|よこ} に {座|すわ}り 、 {消|き}えた 。') });

  Object.assign(C.reviewEnemies = C.reviewEnemies || {}, { 'cr.waystone': 'cr', 'cr.echo': 'cr', 'cr.ox': 'cr', 'cr.fogporter': 'cr', 'cr.packlantern': 'cr', 'cr.moth': 'cr', 'cr.courier': 'cr' });
  if (RB.creaturesA && RB.creaturesA.auditEnemy) {
    const note = 'interim: a Cloudroad creature (P12) drawn on an existing family with its own palette; its own family is P16 art work (AC-1, C-82)';
    // the Blankpage Moth is drawn on the blot family for now (pale paper, like a blank page): the moth family has no Hush
    for (const [id, art] of [['cr.waystone', 'golem'], ['cr.echo', 'echo'], ['cr.ox', 'blot'], ['cr.fogporter', 'wisp'], ['cr.moth', 'blot'], ['cr.courier', 'echo']]) RB.creaturesA.auditEnemy(id, art, 'incomplete', note);
  }

  // ---- the Fog Porter and your travel papers (E6: keep the document) ------------------------------------------------
  C.encounters['cr.fog_papers'] = {
    id: 'cr.fog_papers', name: say('{手形|てがた} を {守|まも}る', 'Keep your papers'),
    lead: { enemy: 'cr.fogporter', pattern: ['shroud', 'strike:papers', 'rest', 'strike:papers'], intents: { 'strike:papers': { target: 'o:papers' } } },
    group: { normal: ['cr.echo'], hard: ['cr.echo', 'cr.echo'] },
    actors: [{ aid: 'o:papers', side: 'object', name: say('{通行手形|つうこうてがた}', 'your travel papers'), hp: 3, protectable: true }],
    objective: { kind: 'protect', aid: 'o:papers', text: say('{手形|てがた} を {守|まも}る', 'Keep your travel papers from the Fog Porter until it settles or gives up.') },
    settleWins: true,
    conclusions: [
      { id: 'taken', when: { down: 'o:papers' }, result: 'end', text: { en: 'The Fog Porter makes off with your papers, and drops them a little way up the slope, damp. You pick them up and dry them on your sleeve.' } },
      { id: 'kept', when: { settled: 'all' }, result: 'win', text: { en: 'Your papers are still in your hand, dry.' }, flags: { cr_papers_kept: true } },
      { id: 'held', when: { all: [{ rounds: 6 }, { standing: 'o:papers' }] }, result: 'win', text: { en: 'The Fog Porter gives up on your papers and goes looking for something lighter.' }, flags: { cr_papers_kept: true } },
    ],
  };

  // ---- the Courier Who Never Arrived (social and folklore; no Unravel, C-09) ------------------------------------------
  // The account changes as each version is answered: the run money (Heisuke's father's version) gives way to the
  // gorge, the gorge to the fox; what is left when those are answered is what the hut shows, and the run can be
  // finished. The sheet keeps every version said, so you can see which is still standing.
  C.encounters['cr.courier'] = {
    id: 'cr.courier', kind: 'social', name: say('{届|とど}かず の {飛脚|ひきゃく}', 'The Courier Who Never Arrived'),
    lead: { enemy: 'cr.courier' },
    rules: { wait: true },
    autoRoute: ['s:seal', 's:sandals', 's:note', 's:relay'],
    social: {
      parties: [{ aid: 'n:courier', name: say('{飛脚|ひきゃく}', 'the courier'), stance: 'closed', wants: { en: 'To finish the run: to hand the post on.' } }],
      claims: {
        ran: { by: 'n:courier', jp: '{俺|おれ} は 、 {郵便|ゆうびん} の {金|かね} を {持|も}って {逃|に}げた 。', en: 'I ran off with the post money.' },
        fell: { by: 'n:courier', jp: '…… いや 。 {雪|ゆき} の {中|なか} 、 {谷|たに} へ {落|お}ちた ん だ 。', en: '…No. I fell into the gorge, in the snow.', hidden: true },
        fox: { by: 'n:courier', jp: '…… いや 。 {霧|きり} の {中|なか} で 、 {狐|きつね} に {化|ば}かされた ん だ 。', en: '…No. In the fog, a fox bewitched me.', hidden: true },
        stayed: { by: 'n:courier', jp: '…… {雪|ゆき} が {深|ふか}すぎた 。 ここ で {止|と}まって 、 {便|びん} を {濡|ぬ}らさず に 、 {晴|は}れ を {待|ま}った 。', en: '…The snow was too deep. I stopped here, kept the post dry, and waited for the clear.', hidden: true },
      },
      understanding: 5,
      gesture: { name: say('{炉|ろ} に {火|ひ} を {入|い}れる', 'Light the hearth'), desc: 'The hut has been cold for fifty years.', effect: { understanding: 1, stance: { 'n:courier': 'listening' } }, once: true, says: { en: 'You get a small fire going in the cold hearth with the last of the shelter\'s wood. The courier turns towards it, the way anyone would after a long run in the snow.' } },
      unravelTip: { en: 'Nothing here is knotted. The courier is telling himself the wrong story; show him the right one.' },
      actions: [
        { id: 'seal', kind: 'evidence', label: say('{状箱|じょうばこ} の {封|ふう} を {見|み}せる', 'Show it the seal on the bag'), once: true, when: { claims: 'ran' },
          task: { F: ch({ item: 'v:手紙', prompt: { en: 'Tell it what you saw: the bag\'s seal is not broken.' }, options: [{ jp: 'ふくろ の ふう は 、 きれて いない よ 。', ok: true }, { jp: 'ふくろ は 、 からっぽ だった よ 。', ok: false, why: { en: 'You saw it on its peg, full, its cord still tied.' } }] }),
            E: ch({ item: 'g:cr_to_itte', prompt: { en: 'Tell it what was said below, and what you saw here.' }, options: [{ jp: 'ヘイスケ さん は 「{逃|に}げた 」 と {言|い}って いました 。 でも 、 {状箱|じょうばこ} は ここ に あります 。', ok: true }, { jp: 'ヘイスケ さん が {状箱|じょうばこ} を {見|み}た と {言|い}って いました 。', ok: false, why: { en: 'Heisuke never saw it; he only repeated his father.' } }] }),
            I: ch({ item: 'g:te_aru', prompt: { en: 'Tell it what state the bag is in (read closely: two are near).' }, options: [{ jp: '{状箱|じょうばこ} に は 、 まだ {封|ふう} が して あります 。 {誰|だれ} も {開|あ}けて いません 。', ok: true }, { jp: '{状箱|じょうばこ} は 、 {開|あ}けて あります 。', ok: false, why: { en: 'That says someone opened it on purpose; it is still sealed.' } }, { jp: '{状箱|じょうばこ} に {封|ふう} を して おきました 。', ok: false, why: { en: 'That says you sealed it; the seal is the relay\'s, fifty years old.' } }] }),
            A: ch({ item: 'g:adv_ni_suginai', prompt: { en: 'Answer the rumour with what you saw (read closely: two are near).' }, options: [{ jp: '{逃|に}げた と いう の は 、 {下|した} の {宿|しゅく} の {噂|うわさ} に すぎません 。 {封|ふう} は {切|き}られて いません 。', ok: true }, { jp: '{逃|に}げた と いう の は 、 {噂|うわさ} どころ か {本当|ほんとう} です 。', ok: false, why: { en: 'The seal says it is not true.' } }, { jp: '{封|ふう} が {切|き}られて いない の は 、 {噂|うわさ} に すぎません 。', ok: false, why: { en: 'The seal is something you saw; the rumour is what is merely said.' } }] }) },
          effect: { reveal: 'fell', understanding: 1, stance: { 'n:courier': 'listening' } }, says: { en: 'The courier looks at the bag on its peg. The seal is whole. "Then… I didn\'t run," he says slowly. "No. I fell. Into the gorge, in the snow."' } },
        { id: 'sandals', kind: 'evidence', label: say('{炉|ろ} の {横|よこ} の {草鞋|わらじ} を {指|さ}す', 'Point to the sandals by the hearth'), once: true, when: { claims: 'fell' },
          task: { F: ch({ item: 'v:雪', prompt: { en: 'Tell it what is by the hearth.' }, options: [{ jp: 'わらじ が ここ に ある 。 そと に は でなかった 。', ok: true }, { jp: 'わらじ は どこ に も ない 。', ok: false, why: { en: 'They are right there, side by side.' } }] }),
            E: ch({ item: 'g:v_te_iru', prompt: { en: 'Tell it what the sandals show.' }, options: [{ jp: '{草鞋|わらじ} が ここ に あります 。 {谷|たに} へ は {行|い}って いません 。', ok: true }, { jp: '{草鞋|わらじ} が ありません 。 {谷|たに} へ {行|い}きました 。', ok: false, why: { en: 'They are by the hearth, set side by side.' } }] }),
            I: ch({ item: 'g:you_mitai', prompt: { en: 'Say what the sandals suggest (read closely: two are near).' }, options: [{ jp: '{草鞋|わらじ} が {炉|ろ} の {横|よこ} に {並|なら}べて あります 。 {外|そと} へ は {出|で}なかった よう です 。', ok: true }, { jp: '{草鞋|わらじ} が ある から 、 {谷|たに} へ {落|お}ちた よう です 。', ok: false, why: { en: 'Sandals set out to dry say he stayed in.' } }, { jp: '{外|そと} へ は {出|で}なかった そう です 。', ok: false, why: { en: 'Nobody told you so; you are judging from the sandals, which is ようだ.' } }] }),
            A: ch({ item: 'g:adv_wake_dewa_nai', prompt: { en: 'Answer its certainty (read closely: two are near).' }, options: [{ jp: '{谷|たに} へ {落|お}ちた わけ で は ない でしょう 。 {草鞋|わらじ} が 、 {炉|ろ} の {横|よこ} に {揃|そろ}えて あります 。', ok: true }, { jp: '{谷|たに} へ {落|お}ちない わけ に は いかない でしょう 。', ok: false, why: { en: 'That says he had no choice but to fall: the opposite.' } }, { jp: '{草鞋|わらじ} が ある わけ で は ありません 。', ok: false, why: { en: 'The sandals are there.' } }] }) },
          effect: { reveal: 'fox', understanding: 1 }, says: { en: 'He looks at the sandals by the cold hearth, set side by side to dry. "Then… it was the fog," he says. "A fox. A fox led me off the road."' } },
        { id: 'note', kind: 'evidence', label: say('{壁|かべ} の {書|か}き{付|つ}け を {読|よ}む', 'Read it the note on the wall'), once: true, when: { claims: 'fox' },
          task: { F: ch({ item: 'v:雪', prompt: { en: 'Read it the note on the wall.' }, options: [{ jp: 'かべ に 「ゆき ふかし」 と かいて ある 。 きり じゃ ない 。', ok: true }, { jp: 'かべ に は 、 なにも かいて ない 。', ok: false, why: { en: 'There is a note there, in his own hand.' } }] }),
            E: ch({ item: 'g:cop_neg', prompt: { en: 'Tell it what the note says about the weather.' }, options: [{ jp: '{霧|きり} じゃ ありません 。 {雪|ゆき} です 。 {壁|かべ} の {字|じ} に 、 そう {書|か}いて あります 。', ok: true }, { jp: '{雪|ゆき} じゃ ありません 。 {霧|きり} です 。', ok: false, why: { en: 'The note says snow: 雪深し.' } }] }),
            I: ch({ item: 'g:rashii', prompt: { en: 'Set the fox story against the note (read closely: two are near).' }, options: [{ jp: '{狐|きつね} の {話|はなし} は 、 {下|した} の {宿|しゅく} の {噂|うわさ} らしい です 。 でも 、 {壁|かべ} の {字|じ} は 、 あなた が {書|か}いた もの です 。', ok: true }, { jp: '{壁|かべ} の {字|じ} は 、 {狐|きつね} が {書|か}いた らしい です 。', ok: false, why: { en: 'It is his own hand, the same as in Kanbe\'s ledger.' } }, { jp: '{狐|きつね} の {話|はなし} は 、 {本当|ほんとう} らしい です 。', ok: false, why: { en: 'The note says snow, and waiting: no fog, no fox.' } }] }),
            A: ch({ item: 'g:cr_tono', prompt: { en: 'Quote the note to it (read closely: two are near).' }, options: [{ jp: '「{雪|ゆき} {深|ふか}し 、 {晴|は}れ を {待|ま}つ 」 と の {書|か}き{付|つ}け が 、 {壁|かべ} に {残|のこ}って います 。', ok: true }, { jp: '「{狐|きつね} に {化|ば}かされた 」 と の {書|か}き{付|つ}け が 、 {壁|かべ} に {残|のこ}って います 。', ok: false, why: { en: 'That is the tale, not the note.' } }, { jp: '{書|か}き{付|つ}け に は 、 {何|なに} も {書|か}かれて いない と の こと です 。', ok: false, why: { en: 'You read it yourself; and it says a good deal.' } }] }) },
          effect: { reveal: 'stayed', understanding: 1 }, says: { en: 'The courier turns to the wall, to the note in his own hand. For a long time he says nothing. Then: "The snow was too deep. I stopped here. I kept the post dry, and waited for the clear."' } },
        { id: 'relay', kind: 'propose', label: say('{続|つづ}き を {継|つ}ぐ', 'Offer to carry the rest of the run'), once: true, when: { claims: 'stayed' },
          task: task('g:keigo_kenjo', 'Which offers, humbly, to take the post on to where it was going?', 'お{預|あず}かり します 。 {続|つづ}き は 、 {私|わたし} たち が お{届|とど}け します 。', 'お{預|あず}かり に なります 。 {続|つづ}き は 、 お{届|とど}け に なります 。', 'お〜になる is respect for someone else\'s doing; for your own, it is お〜する.', '{続|つづ}き は 、 {届|とど}けて いただきます 。', 'That has him deliver it after all.'),
          effect: { understanding: 2, flag: 'relayed' }, says: { en: '"The rest of the run," he repeats. He lifts the bag from its peg and holds it out the way couriers hand on the post: both hands, a bow. "Kumoi, then. And down."' } },
      ],
      responses: {
        hikari: { says: { en: 'Your light fills the little hut. The courier blinks at it, as if he had forgotten what a lamp was for.' } },
        unravel: { says: { en: 'There is nothing to untangle. It is a story, not a knot.' } },
      },
      wait: { when: { all: [{ stance: { 'n:courier': 'listening' } }, { not: { claims: 'stayed' } }] }, effect: { understanding: 1 }, says: { en: 'In the quiet the courier looks round the hut: the bag, the hearth, the wall. As if he were seeing them for the first time in fifty years.' } },
      companion: {
        nao: [{ id: 'nao_hands', name: say('{両手|りょうて} を {出|だ}す', 'Hold out both hands'), desc: 'Nao knows how the post is handed on.', once: true, effect: { understanding: 2, stance: { 'n:courier': 'listening' } }, says: { en: 'Nao steps forward and holds out both hands, palms up, the way a relay runner waits at a station for the post. They say nothing. The courier looks at their hands for a long time.' } }],
        mio: [{ id: 'mio_warm', name: say('{冷|ひ}えた {手|て} を {温|あたた}める', 'Warm his cold hands'), desc: 'Mio knows what cold does to a body, and to a mind.', once: true, effect: { understanding: 2, stance: { 'n:courier': 'listening' } }, says: { en: 'Mio kneels by him and cups her hands round his, which aren\'t there. "You must have been so cold," she says. "Cold makes everything muddled. Let\'s go slowly."' } }],
        ren: [{ id: 'ren_name', name: say('{名前|なまえ} を {呼|よ}ぶ', 'Call him by his name'), desc: 'A keeper calls a lamp by its name.', once: true, effect: { understanding: 2, stance: { 'n:courier': 'listening' } }, says: { en: 'Ren reads his name from the relay\'s ledger, the way keepers call a lamp: "Genta." The courier\'s outline steadies, as if someone had trimmed a wick.' } }],
        suzu: [{ id: 'suzu_prompt', name: say('{台詞|せりふ} を {付|つ}ける', 'Prompt him his line'), desc: 'A prompter gives an actor the line he has lost.', once: true, effect: { understanding: 2, stance: { 'n:courier': 'listening' } }, says: { en: 'Suzu leans in like a prompter in the wings and gives him his line, quietly: "You stopped here. You kept the post dry." He mouths it after her.' } }],
      },
      drift: [{ when: { all: [{ rounds: 2 }, { stance: { 'n:courier': 'closed' } }] }, once: true, effect: { stance: { 'n:courier': 'listening' } }, says: { en: 'Snow blows in at the door. The courier stops mid-sentence and looks at you, as if noticing for the first time that someone has come up the pass.' } }],
    },
    conclusions: [
      { id: 'relayed', when: { flag: 'relayed' }, result: 'win', text: { en: 'The courier hands on the post. The run fifty years unfinished goes on, in your hands.' }, flags: { cr_courier_relayed: true } },
      { id: 'heard', when: { all: [{ claims: 'stayed' }, { understanding: 5 }] }, result: 'win', text: { en: 'The courier has his own story back. He takes the bag from its peg and holds it out to you.' }, flags: { cr_courier_relayed: true } },
      { id: 'fades', when: { rounds: 10 }, result: 'end', text: { en: 'The snow thickens and the courier fades into it, still talking to himself. He will be at the hut again.' } },
    ],
  };

  // ---- the wanderers (E3) -------------------------------------------------------------------------------------------
  C.encounters['cr.wander_oshika'] = {
    id: 'cr.wander_oshika', name: say('{参道|さんどう} の {道標|みちしるべ}', 'The shrine path\'s signpost'),
    lead: { enemy: 'cr.waystone', knots: 2 },
    actors: [{
      aid: 'g:oshika', side: 'guest', name: say('オシカ', 'Oshika'), hp: 3,
      agenda: { wants: 'help', act: { kind: 'ward', on: 'pc', n: 1 }, leavesWhen: { rounds: 4 } },
      lines: {
        arrive: say('こら 、 {小僧|こぞう} ！ お{社|やしろ} の {道|みち} を {回|まわ}す で ない ！', '"You, imp! Don\'t you turn the shrine path round!" An old pilgrim in white plants her staff in front of the signpost.'),
        act: say('{杖|つえ} で {道標|みちしるべ} を {押|お}さえて 、 {小僧|こぞう} に {回|まわ}させない 。', 'Oshika holds the signpost still with her staff, so the imp can\'t turn it.'),
        leave: say('{南|みなみ} の {海|うみ} に は 、 {木|き} の {葉|は} に {願|ねが}い を {書|か}いて {納|おさ}める {島|しま} が ある そう な 。 {海|うみ} が 、 {願|ねが}い を {叶|かな}えて くれる と か 。 …… わし も 、 いつか {行|い}きたい もの じゃ 。', '"They say there\'s an island in the southern sea where pilgrims write their wishes on leaves and leave them at the shrine, and the sea grants them. …I\'d like to go one day." She goes on up the path, staff tapping.'),
      },
    }],
    conclusions: [{ id: 'won', when: { settled: 'all' }, result: 'win', text: { en: 'The imp turns the signpost back, and the shrine path points to the shrine again.' }, flags: { cr_oshika_met: true } }],
  };
  C.encounters['cr.wander_ginji'] = {
    id: 'cr.wander_ginji', name: say('{白紙|はくし} の {蛾|が}', 'Blank wings'),
    lead: { enemy: 'cr.moth', knots: 2 },
    actors: [{
      aid: 'g:ginji', side: 'guest', name: say('ギンジ', 'Ginji'), hp: 3,
      agenda: { wants: 'help', act: { kind: 'ward', on: 'pc', n: 1 }, leavesWhen: { rounds: 4 } },
      lines: {
        arrive: say('{白紙蛾|はくしが} か 。 {運|うん} が {悪|わる}い な 。 …… {手|て} を {貸|か}そう 。 {貸|か}し に して おく が な 。', '"Blankpage moths? Bad luck. …I\'ll lend a hand. On account, mind." A man in a dark coat steps out from behind the rocks, a bundle on his back.'),
        act: say('{手拭|てぬぐ}い を {振|ふ}って 、 {蛾|が} の {鱗粉|りんぷん} を {払|はら}う 。', 'Ginji flaps a hand towel and beats the moth\'s dust out of the air.'),
        leave: say('{借|か}り は {返|かえ}して もらう ぞ 。 …… {雲居|くもい} で 、 また な 。', '"I\'ll want that favour back. …See you at Kumoi." He shoulders his bundle and is gone among the rocks, off the road.'),
      },
    }],
    conclusions: [{ id: 'won', when: { settled: 'all' }, result: 'win', text: { en: 'The moth settles on a rock and folds its blank wings.' }, flags: { cr_ginji_met: true } }],
  };
})(RB.content);
