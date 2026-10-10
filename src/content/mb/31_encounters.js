/* Manybridge, Chapter 3: the two conversations that are encounters (expansion P08; plan E8, C-60).
 *
 * mb.dispute: the Tally Exchange. Fujiko sent the rice; Heiji never found it; Gonta the porter carried it. The game's
 *   first conflict with no creature in it: Unravel can do nothing, and the situation must be read (C-60). Three
 *   causes are tangled together: the notice's condition read two ways (the west storehouse was shut, not full); a
 *   crate Gonta dropped and hid by rerouting a barge; and the blank plaque on the Storehouse Bridge. Wait is taught
 *   here (c_wait): Gonta, closed, speaks only into a silence.
 * mb.passage: the lock-keeper Matsu will not open for strangers. Clarify, show what you carry (the forty-year-old
 *   letter addressed to the bridge-keeper, her husband), and make a workable offer.
 * Every conclusion moves the story on (21_scenes_main.js reads the flags); the better ones are warmer. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  C.encounters = C.encounters || {};
  const say = (jp, en) => ({ jp, en });
  const ch = (o) => Object.assign({ kind: 'choose' }, o);
  // a conversational choice's language step: F and E choose the line from its meaning (English given); I and A choose
  // between closer lines with the meaning unsaid
  function task(item, en, ok, w1, why1, w2, why2) {
    const low = ch({ item, prompt: { en }, options: [{ jp: ok, ok: true }, { jp: w1, ok: false, why: { en: why1 } }] });
    const high = ch({ item, prompt: { en: en + ' (Read them closely: two are near.)' },
      options: [{ jp: ok, ok: true }, { jp: w1, ok: false, why: { en: why1 } }, { jp: w2, ok: false, why: { en: why2 } }] });
    return { F: low, E: low, I: high, A: high };
  }

  // ---- the Tally Exchange dispute ---------------------------------------------------------------------------------
  C.encounters['mb.dispute'] = {
    id: 'mb.dispute', kind: 'social', name: { jp: '{札場|ふだば} の {揉|も}め{事|ごと}', en: 'The dispute at the Tally Exchange' },
    rules: { wait: true },
    social: {
      parties: [
        { aid: 'n:fujiko', name: { jp: 'フジコ', en: 'Fujiko' }, stance: 'heated', wants: { en: 'To be believed, and paid.' } },
        { aid: 'n:heiji', name: { jp: 'ヘイジ', en: 'Heiji' }, stance: 'heated', wants: { en: 'Not to pay for rice he never got.' } },
        { aid: 'n:gonta', name: { jp: 'ゴンタ', en: 'Gonta' }, stance: 'closed', wants: { en: 'Not to be found out.' } },
      ],
      claims: {
        c1: { by: 'n:heiji', jp: '{西|にし} の {蔵|くら} に 、 {米|こめ} は ありません でした 。', en: 'There was no rice in the west storehouse.' },
        c2: { by: 'n:fujiko', jp: '{三度|さんど} とも 、 {確|たし}か に {送|おく}りました 。', en: 'I sent it, all three times.' },
        c3: { by: 'tally', jp: '{西|にし} の {蔵|くら} が {一杯|いっぱい} なら 、 {東|ひがし} の {蔵|くら} へ 。', en: 'Heiji\'s tally: "If the west storehouse is full, to the east one."', hidden: true },
        c4: { by: 'n:gonta', jp: '{西|にし} の {蔵|くら} は {閉|し}まって いました 。 だから {東|ひがし} に {入|い}れました 。', en: 'Gonta: "The west storehouse was shut. So I put it in the east one."', hidden: true },
        c5: { by: 'n:gonta', jp: '…… {浮|う}き{玉|だま} の {箱|はこ} を 、 {運河|うんが} に {落|お}としました 。', en: 'Gonta: "…I dropped the crate of glass floats in the canal." He took one barge the long way so nobody would count.', hidden: true },
        c6: { by: 'plaque', jp: '{蔵橋|くらばし} の {札|ふだ} は {白|しろ}い 。', en: 'The Storehouse Bridge\'s plaque is blank: a barge could turn early there.', hidden: true },
      },
      understanding: 3,
      gesture: { name: { jp: '{三人|さんにん} を つなぐ', en: 'Bring the three together' }, desc: 'With your companion, help them hear each other.', effect: { flag: 'reconciled' }, says: { en: 'Fujiko laughs first — at herself. Heiji sits down. Gonta looks up.' } },
      unravelTip: { en: 'Nothing here is tangled with knots. What is tangled is what each of them believes: look at what was said, who is heated, and what each one wants.' },
      actions: [
        { id: 'calm', kind: 'restate', label: say('{皆|みな}さん 、 {一|ひと}つ ずつ {話|はな}しましょう 。', 'Ask them to take it one at a time'),
          task: task('g:v_te_kudasai', 'Which asks them to take it one at a time?', '{皆|みな}さん 、 {一|ひと}つ ずつ {話|はな}しましょう 。', '{皆|みな}さん 、 {一緒|いっしょ} に {話|はな}しましょう 。', 'That asks them to all talk together.', '{皆|みな}さん 、 {一|ひと}つ だけ {話|はな}しましょう 。', 'だけ is "only one thing"; ずつ is "one at a time".'),
          cases: [{ when: { stance: { 'n:fujiko': 'heated' } }, effect: { stance: { 'n:fujiko': 'listening' } }, says: { en: 'Fujiko takes a breath and folds her hands.' } },
            { when: { stance: { 'n:heiji': 'heated' } }, effect: { stance: { 'n:heiji': 'listening' } }, says: { en: 'Heiji grumbles, but sits down on the mat.' } }],
          says: { en: 'They are already taking turns.' } },
        { id: 'ask_where', kind: 'ask', label: say('ヘイジ さん 、 どの {蔵|くら} を {見|み}ました か 。', 'Ask Heiji which storehouse he looked in'), once: true,
          task: task('g:prt_wo', 'Which asks Heiji which storehouse he looked in?', 'ヘイジ さん 、 どの {蔵|くら} を {見|み}ました か 。', 'ヘイジ さん 、 いつ {蔵|くら} を {見|み}ました か 。', 'That asks when he looked, not which storehouse.', 'ヘイジ さん 、 どの {蔵|くら} を {閉|し}めました か 。', 'That asks which one he closed.'),
          effect: { understanding: 1 }, says: { en: 'Heiji: "The west one. That\'s where it always goes." He hesitates. "I didn\'t look in the east."' } },
        { id: 'show_tally', kind: 'evidence', label: say('{札|ふだ} を {読|よ}んで ください 。', 'Ask Sen to read out Heiji\'s tally'), once: true,
          task: task('g:v_te_kudasai', 'Which asks for the tally to be read out?', '{札|ふだ} を {読|よ}んで ください 。', '{札|ふだ} を {書|か}いて ください 。', 'That asks for a tally to be written.', '{札|ふだ} を {売|う}って ください 。', 'That asks someone to sell the tally.'),
          effect: { reveal: 'c3', understanding: 1 }, says: { en: 'Sen reads it aloud: "If the west storehouse is full, to the east one." Heiji frowns. "Full. Not shut."' } },
        { id: 'ask_gonta', kind: 'ask', label: say('ゴンタ さん 、 {米|こめ} を どこ に {入|い}れました か 。', 'Ask Gonta where he put the rice'), once: true,
          task: task('g:prt_ni', 'Which asks Gonta where he put the rice?', 'ゴンタ さん 、 {米|こめ} を どこ に {入|い}れました か 。', 'ゴンタ さん 、 {米|こめ} を どこ で {買|か}いました か 。', 'That asks where he bought it.', 'ゴンタ さん 、 {米|こめ} を いつ {入|い}れました か 。', 'That asks when, not where.'),
          cases: [{ when: { stance: { 'n:gonta': 'listening' } }, effect: { reveal: 'c4', understanding: 1 }, says: { en: 'Gonta mumbles: the west storehouse was shut, so he put it in the east.' } }],
          says: { en: 'Gonta stares at the floor and says nothing. Asking harder won\'t help.' } },
        { id: 'plaque', kind: 'evidence', label: say('{蔵橋|くらばし} の {札|ふだ} も 、 {白|しろ}く なって います 。', 'Point out the blank plaque on the Storehouse Bridge'), once: true,
          task: task('g:prt_mo', 'Which says the Storehouse Bridge\'s plaque has gone blank too?', '{蔵橋|くらばし} の {札|ふだ} も 、 {白|しろ}く なって います 。', '{蔵橋|くらばし} の {札|ふだ} は 、 {新|あたら}しく なって います 。', 'That says it has been renewed.', '{蔵橋|くらばし} の {札|ふだ} も 、 {高|たか}く なって います 。', 'That says it has got taller.'),
          effect: { reveal: 'c6' }, says: { en: 'Sen nods slowly. "One barge last week went into the Back Canal a bridge too early. The boatman said there was nothing to steer by."' } },
        { id: 'propose', kind: 'propose', label: say('{一緒|いっしょ} に {東|ひがし} の {蔵|くら} を {見|み}に {行|い}きましょう 。', 'Propose they all go and look in the east storehouse'), when: { claims: ['c3'] },
          task: task('g:v_mashou', 'Which suggests they all go and look in the east storehouse?', '{一緒|いっしょ} に {東|ひがし} の {蔵|くら} を {見|み}に {行|い}きましょう 。', '{一緒|いっしょ} に {西|にし} の {蔵|くら} を {見|み}に {行|い}きましょう 。', 'That is the west storehouse again.', '{一人|ひとり} で {東|ひがし} の {蔵|くら} を {見|み}に {行|い}きます 。', 'That says you\'ll go alone.'),
          effect: { flag: 'agreed' }, says: { en: 'Heiji gets up. "Fine. The east storehouse. All of us."' } },
        { id: 'blame', kind: 'propose', label: say('ゴンタ さん が {悪|わる}い です 。', 'Say it\'s Gonta\'s fault'), lasting: true, means: { en: 'You will tell them all that Gonta is to blame.' },
          task: task('g:prt_ga', 'Which says it is Gonta\'s fault?', 'ゴンタ さん が {悪|わる}い です 。', 'ゴンタ さん は {悪|わる}く ない です 。', 'That says he is not to blame.', 'ゴンタ さん が {悪|わる}かった です か 。', 'That asks whether he was to blame.'),
          effect: { stance: { 'n:gonta': 'leaving' } }, says: { en: 'Gonta goes white, gets up and walks out without a word.' } },
      ],
      responses: {
        hikari: { when: { not: { claims: 'c6' } }, effect: { reveal: 'c6' }, says: { en: 'In the light, you all remember the same thing: the plaque on the Storehouse Bridge is blank.' } },
        water: { when: { any: [{ stance: { 'n:fujiko': 'heated' } }, { stance: { 'n:heiji': 'heated' } }] }, effect: { stance: { 'n:fujiko': 'listening', 'n:heiji': 'listening' } }, says: { en: 'A cup of water each. The voices drop.' } },
        unravel: { says: { en: 'Nothing here is knotted. The trouble is in what each of them believes.' } },
      },
      // Wait (taught here): Gonta speaks only into a silence; first where the rice went, then what he has been hiding
      wait: { when: { stance: { 'n:gonta': 'closed' } }, effect: { reveal: 'c4', stance: { 'n:gonta': 'listening' } }, says: { en: 'In the quiet, Gonta speaks up at last: "The west storehouse was shut. So I took it to the east one."' } },
      companion: {
        nao: [{ id: 'nao_route', name: say('{道|みち} を {確|たし}かめる', 'Walk the route through'), desc: 'Nao goes over the barge\'s route out loud.', when: { claims: 'c4' }, once: true, effect: { reveal: 'c5', understanding: 1, stance: { 'n:gonta': 'listening' } }, says: { en: 'Nao: "Three barges, three trips. But the second one came back an hour late, didn\'t it, Gonta?" Gonta\'s shoulders drop. "…I dropped the crate of floats. I took the long way so nobody would count."' } }],
        mio: [{ id: 'mio_calm', name: say('{落|お}ち{着|つ}かせる', 'Calm Fujiko'), desc: 'Mio speaks to Fujiko quietly.', when: { stance: { 'n:fujiko': 'heated' } }, effect: { stance: { 'n:fujiko': 'listening' }, understanding: 1 }, says: { en: 'Mio: "Nobody here thinks you\'re lying." Fujiko sits back.' } }],
        ren: [{ id: 'ren_plaque', name: say('{札|ふだ} の こと を {話|はな}す', 'Speak of the plaques'), desc: 'Ren explains how names fade.', when: { not: { claims: 'c6' } }, once: true, effect: { reveal: 'c6', understanding: 1 }, says: { en: 'Ren: "Names don\'t just fade on lanterns. The Storehouse Bridge\'s plaque is blank — a boatman could turn too early there."' } }],
        suzu: [{ id: 'suzu_joke', name: say('{冗談|じょうだん} を {言|い}う', 'Break the tension'), desc: 'Suzu makes them laugh.', once: true, effect: { understanding: 1, stance: { 'n:gonta': 'listening' } }, says: { en: 'Suzu: "Rice that hides in the east storehouse? It\'s shyer than Gonta." Even Gonta almost smiles.' } }],
      },
      drift: [
        { when: { all: [{ rounds: 2 }, { stance: { 'n:fujiko': 'heated' } }] }, effect: { stance: { 'n:heiji': 'heated' } }, says: { en: 'Fujiko raises her voice; Heiji raises his to match.' } },
        { when: { all: [{ claims: 'c4' }, { rounds: 3 }, { not: { claims: 'c5' } }, { stance: { 'n:gonta': 'listening' } }] }, once: true, effect: { reveal: 'c5' }, says: { en: 'Gonta can\'t hold it in any longer: "…I dropped a crate of glass floats in the canal. I took one barge the long way round so nobody would count."' } },
        { when: { stance: { 'n:fujiko': 'listening', 'n:heiji': 'listening' } }, once: true, effect: { understanding: 1 }, says: { en: 'Fujiko and Heiji are both listening now.' } },
      ],
    },
    conclusions: [
      { id: 'walked_out', when: { left: 'n:gonta' }, result: 'end', text: { en: 'Gonta is gone. Sen sends someone to open the east storehouse anyway.' }, flags: { mb_gonta_left: true } },
      { id: 'reconciled', when: { flag: 'reconciled' }, result: 'end', text: { en: 'They go to the east storehouse together, and find the rice, and Gonta tells the rest on the way.' }, flags: { mb_rice_found: true, mb_gonta_confessed: true, mb_dispute_best: true } },
      { id: 'resolved', when: { all: [{ flag: 'agreed' }, { claims: 'c5' }] }, result: 'end', text: { en: 'The rice is in the east storehouse, all thirty bales. Gonta owns up to the floats.' }, flags: { mb_rice_found: true, mb_gonta_confessed: true } },
      { id: 'found', when: { flag: 'agreed' }, result: 'end', text: { en: 'The rice is in the east storehouse, all thirty bales. Gonta looks at his feet the whole way back.' }, flags: { mb_rice_found: true } },
      { id: 'unresolved', when: { rounds: 7 }, result: 'end', text: { en: 'Sen closes the session. "Tomorrow." But she sends a clerk to the east storehouse, just in case.' } },
    ],
  };

  // ---- passage through the lock ------------------------------------------------------------------------------------
  C.encounters['mb.passage'] = {
    id: 'mb.passage', kind: 'social', name: { jp: '{閘門番|こうもんばん} の {戸|と}', en: 'The lock-keeper\'s door' },
    rules: { wait: true },
    social: {
      parties: [{ aid: 'n:matsu', name: { jp: 'マツ', en: 'Matsu' }, stance: 'closed', wants: { en: 'That nobody else goes down there and is lost.' } }],
      claims: {
        p1: { by: 'n:matsu', jp: '{知|し}らない {人|ひと} に は 、 {開|あ}けない よ 。', en: 'I don\'t open for people I don\'t know.' },
        p2: { by: 'n:matsu', jp: '{下|した} は {危|あぶ}ない 。 {水|みず} の {高|たか}さ が {毎日|まいにち} {変|か}わる 。', en: 'It\'s dangerous below. The water stands at a different height every day.', hidden: true },
        p3: { by: 'n:matsu', jp: '{夫|おっと} は {橋守|はしもり} だった 。 {下|した} で {名前|なまえ} を {呼|よ}んで いた 。', en: 'My husband was the bridge-keeper. He used to call the bridge\'s name down there.', hidden: true },
      },
      understanding: 3,
      gesture: { name: { jp: '{手紙|てがみ} を {一緒|いっしょ} に {読|よ}む', en: 'Read the letter with her' }, desc: 'With your companion, sit with her while she reads.', effect: { flag: 'letter' }, says: { en: 'Matsu reads the letter twice. Then she takes down a lamp from the wall.' } },
      unravelTip: { en: 'There is no knot in a closed door. What is closed is Matsu: why, and what would let her trust you?' },
      actions: [
        { id: 'introduce', kind: 'restate', label: say('{藤屋|ふじや} と {札場|ふだば} の {頼|たの}み で {来|き}ました 。', 'Say Fujiya and the Exchange sent you'), once: true,
          task: task('g:prt_de', 'Which says you came at the request of Fujiya and the Exchange?', '{藤屋|ふじや} と {札場|ふだば} の {頼|たの}み で {来|き}ました 。', '{藤屋|ふじや} と {札場|ふだば} に {頼|たの}みに {来|き}ました 。', 'That says you came to ask them for something.', '{藤屋|ふじや} と {札場|ふだば} から {逃|に}げて {来|き}ました 。', 'That says you ran away from them.'),
          effect: { understanding: 1, stance: { 'n:matsu': 'listening' } }, says: { en: 'Matsu looks up. "Fujiko\'s lot. Hm."' } },
        { id: 'ask_why', kind: 'ask', label: say('どうして {閉|し}めて いる ん です か 。', 'Ask why she keeps it shut'), when: { not: { claims: 'p2' } },
          task: task('g:n_desu', 'Which asks why she keeps it shut?', 'どうして {閉|し}めて いる ん です か 。', 'いつ {閉|し}めた ん です か 。', 'That asks when she shut it.', 'どうして {開|あ}けて いる ん です か 。', 'That asks why it is open.'),
          cases: [{ when: { stance: { 'n:matsu': 'listening' } }, effect: { reveal: 'p2', understanding: 1 }, says: { en: 'Matsu: "The water down there changes every day. Strangers who don\'t read the tablets don\'t come back."' } }],
          says: { en: 'Matsu turns back to her lamps. "None of your business."' } },
        { id: 'offer', kind: 'propose', label: say('{石板|せきばん} を {読|よ}んで 、 {水|みず} の {高|たか}さ を {確|たし}かめて から {進|すす}みます 。', 'Promise to read the tablets and check the water before every step'), when: { claims: 'p2' },
          task: task('g:v_te_kara', 'Which promises to check the water heights before going on?', '{石板|せきばん} を {読|よ}んで 、 {水|みず} の {高|たか}さ を {確|たし}かめて から {進|すす}みます 。', '{石板|せきばん} を {読|よ}まないで 、 {水|みず} の {高|たか}さ を {確|たし}かめないで {進|すす}みます 。', 'That promises not to read or check anything.', '{水|みず} の {高|たか}さ を {確|たし}かめる {前|まえ} に {進|すす}みます 。', 'That says you\'ll go on before checking.'),
          effect: { flag: 'agreed' }, says: { en: 'Matsu studies you for a long moment. "…Read them properly, then." She takes down the key.' } },
        { id: 'letter', kind: 'evidence', label: say('この {手紙|てがみ} は 、 ご{主人|しゅじん} {宛|あて} です か 。', 'Show her the old letter for the bridge-keeper'), once: true, when: { claims: 'p3' },
          task: task('g:prt_ka', 'Which asks whether the letter is addressed to her husband?', 'この {手紙|てがみ} は 、 ご{主人|しゅじん} {宛|あて} です か 。', 'この {手紙|てがみ} は 、 ご{主人|しゅじん} が {書|か}きました か 。', 'That asks whether her husband wrote it.', 'この {手紙|てがみ} は 、 ご{主人|しゅじん} に {返|かえ}しました か 。', 'That asks whether she returned it to him.'),
          effect: { understanding: 2, stance: { 'n:matsu': 'listening' } }, says: { en: 'Matsu takes the letter in both hands. Forty years. The address is half gone, but she knows the hand.' } },
        { id: 'demand', kind: 'propose', label: say('{今|いま} すぐ {開|あ}けて ください 。', 'Demand she opens it now'), lasting: true, means: { en: 'You will demand that she opens the lock at once.' },
          task: task('g:v_te_kudasai', 'Which demands she opens it at once?', '{今|いま} すぐ {開|あ}けて ください 。', '{今|いま} すぐ {閉|し}めて ください 。', 'That asks her to shut it.', 'いつか {開|あ}けて ください 。', 'That asks her to open it some day.'),
          effect: { stance: { 'n:matsu': 'leaving' } }, says: { en: 'Matsu stands, opens her door — the front one — and waits for you to go through it.' } },
      ],
      responses: {
        hikari: { says: { en: 'Your light shows her lamps, all trimmed and full. Matsu keeps everything ready, as if someone might come back up.' }, effect: { understanding: 1 } },
        unravel: { says: { en: 'Nothing is knotted. Matsu has closed herself, not the lock.' } },
      },
      // Wait: in the silence she says why the lock matters to her
      wait: { when: { all: [{ stance: { 'n:matsu': 'listening' } }, { not: { claims: 'p3' } }] }, effect: { reveal: 'p3' }, says: { en: 'You say nothing. After a while, Matsu speaks, to the lamps more than to you: "My husband was the bridge-keeper. He used to call the bridge\'s name down there, every evening."' } },
      companion: {
        nao: [{ id: 'nao_letter', name: say('{手紙|てがみ} の こと を {話|はな}す', 'Speak for the letter'), desc: 'A courier knows what a late letter means.', when: { claims: 'p3' }, once: true, effect: { understanding: 1 }, says: { en: 'Nao: "A letter that took forty years is still a letter. It came to you in the end."' } }],
        mio: [{ id: 'mio_tea', name: say('お{茶|ちゃ} を {淹|い}れる', 'Make her tea'), desc: 'Mio puts the kettle on.', once: true, effect: { understanding: 1, stance: { 'n:matsu': 'listening' } }, says: { en: 'Mio fills the kettle without asking. Matsu lets her.' } }],
        ren: [{ id: 'ren_lamps', name: say('{灯|あか}り を {整|ととの}える', 'Trim her lamps'), desc: 'Ren sees to the lamps, keeper to keeper.', once: true, effect: { understanding: 1, stance: { 'n:matsu': 'listening' } }, says: { en: 'Ren trims a lamp without a word. Matsu watches the wick, then Ren. "You\'ve done that before."' } }],
        suzu: [{ id: 'suzu_listen', name: say('{黙|だま}って {聞|き}く', 'Simply listen'), desc: 'Suzu, for once, says nothing.', once: true, effect: { understanding: 1, stance: { 'n:matsu': 'listening' } }, says: { en: 'Suzu sits down on the step and says nothing at all. Matsu notices.' } }],
      },
      drift: [{ when: { all: [{ rounds: 3 }, { stance: { 'n:matsu': 'closed' } }] }, once: true, effect: { stance: { 'n:matsu': 'listening' } }, says: { en: 'Matsu sighs. "You\'re not leaving, are you."' } }],
    },
    conclusions: [
      { id: 'shown_out', when: { left: 'n:matsu' }, result: 'end', text: { en: 'Matsu shows you the door and shuts it behind you.' } },
      { id: 'letter', when: { flag: 'letter' }, result: 'end', text: { en: 'Matsu opens the hatch, and gives you her lamp for the way.' }, flags: { mb_passage: true, mb_matsu_letter: true } },
      { id: 'agreed', when: { flag: 'agreed' }, result: 'end', text: { en: 'Matsu unlocks the hatch. "Read the tablets."' }, flags: { mb_passage: true } },
      { id: 'unresolved', when: { rounds: 7 }, result: 'end', text: { en: 'Matsu goes back to her lamps. The conversation is over.' } },
    ],
  };
})(RB.content);
