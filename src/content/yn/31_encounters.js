/* Steamhollow, Chapter 11: the arrangements and the conversations that are encounters (expansion P13b–e; plan R3, E8,
 * A41–A46; C14 stepping into a quarrel; S4).
 *   yn.rooms      the Upper House's front desk (a procedure): rooms for the newcomers with conflicting needs, a change
 *                 of booking, and a guest told no, politely. A wrong room is put right on the spot (every step is a
 *                 stable point), never a restart.
 *   yn.cook       Tama's recipe card (a procedure): spring eggs, step by step, no timer (the eggs wait three songs).
 *   yn.complaint  Zenroku at the Lower House: everything he says is something else (〜んですけど…); what he means, and
 *                 what he cannot bring himself to say (the ridge folk next door weep at night).
 *   yn.salesman   Tokube's tonic: the polite-refusal training ground (〜はちょっと…); with Mio, her honest rejection of
 *                 a fraud, kind and clear (S4: she has refused out loud before; this is her growth in action).
 *   yn.mediation  the two houses, the guild and the spring at the long table: several authored ends, none a defeat; the
 *                 best keep the disagreement honest (S4). Every conclusion moves the story on. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  C.encounters = C.encounters || {};
  const say = (jp, en) => ({ jp, en });
  const ch = (o) => Object.assign({ kind: 'choose' }, o);
  const A = (id, jp, en, more) => Object.assign({ id, label: { jp, en } }, more);
  // a conversational choice's language step: F and E choose the line from its meaning (English given); I and A choose
  // between closer lines with the meaning unsaid
  function task(item, en, ok, w1, why1, w2, why2) {
    const low = ch({ item, prompt: { en }, options: [{ jp: ok, ok: true }, { jp: w1, ok: false, why: { en: why1 } }] });
    const high = ch({ item, prompt: { en: en + ' (Read them closely: two are near.)' },
      options: [{ jp: ok, ok: true }, { jp: w1, ok: false, why: { en: why1 } }, { jp: w2, ok: false, why: { en: why2 } }] });
    return { F: low, E: low, I: high, A: high };
  }
  // a reading step on what someone asks: the meaning chosen in English (F and E with a kana version of the line)
  function hear(item, fJp, jp, en, ok, w1, why1, w2, why2) {
    const opts = (two) => [{ en: ok, ok: true }, { en: w1, ok: false, why: { en: why1 } }].concat(two ? [{ en: w2, ok: false, why: { en: why2 } }] : []);
    return {
      F: ch({ item, ctx: { jp: fJp, en: '' }, prompt: { en }, options: opts(false) }),
      E: ch({ item, ctx: { jp, en: '' }, prompt: { en }, options: opts(false) }),
      I: ch({ item, ctx: { jp, en: '' }, prompt: { en }, options: opts(true) }),
      A: ch({ item, ctx: { jp, en: '' }, prompt: { en }, options: opts(true) }),
    };
  }
  const vals = (o) => { const out = {}; for (const k in o) out[k] = { jp: o[k][0], en: o[k][1] }; return out; };

  // ---- the front desk: rooms for the newcomers ----------------------------------------------------------------------
  const ROOM = vals({ free: ['{空|あ}き', 'free'], booked: ['{予約|よやく}{済|ず}み', 'booked'], oshige: ['オシゲ', 'Oshige'], village: ['{村|むら} の {四人|よにん}', 'the four villagers'], yasuke: ['ヤスケ', 'Yasuke'], tomorrow: ['{明日|あした} から {空|あ}き', 'free from tomorrow'] });
  C.encounters['yn.rooms'] = {
    id: 'yn.rooms', kind: 'procedure', name: say('{上|かみ}の{湯|ゆ} の {帳場|ちょうば}', 'The Upper House\'s front desk'),
    rules: { wait: true },
    procedure: {
      id: 'yn_rooms', version: 1, restart: 'stable',
      machine: { matsu: 'free', take: 'free', ume: 'booked', hanare: 'free' },
      show: [
        { key: 'matsu', label: say('{松|まつ} の {間|ま} （{二階|にかい} 、 {川|かわ} の {見|み}える {部屋|へや} 、 {二人|ふたり} ）', 'Pine (upstairs, river view, two)'), values: ROOM },
        { key: 'take', label: say('{竹|たけ} の {間|ま} （{一階|いっかい} 、 {風呂|ふろ} の {近|ちか}く 、 {三人|さんにん} ）', 'Bamboo (ground floor, by the bath, three)'), values: ROOM },
        { key: 'ume', label: say('{梅|うめ} の {間|ま} （{奥|おく} の {静|しず}か な {部屋|へや} 、 {一人|ひとり} ）', 'Plum (quiet, at the back, one)'), values: ROOM },
        { key: 'hanare', label: say('{離|はな}れ （{庭|にわ} の {奥|おく} 、 {四人|よにん} ）', 'The Annex (across the garden, four)'), values: ROOM },
      ],
      done: { en: 'Every newcomer has a room tonight, and the man without a booking has the Plum room from tomorrow.' },
      steps: [
        { id: 'oshige', stable: true, text: say('オシゲ ： 「{膝|ひざ} が {悪|わる}い ので 、 {階段|かいだん} の ない {部屋|へや} が いい です 。」', 'Oshige: "My knees are bad, so I\'d like a room with no stairs."'),
          task: hear('g:conj_node', 'オシゲ ： 「ひざ が わるい ので 、 かいだん の ない へや が いい です 。」', 'オシゲ ： 「{膝|ひざ} が {悪|わる}い ので 、 {階段|かいだん} の ない {部屋|へや} が いい です 。」', 'What does Oshige need?',
            'A room without stairs: her knees are bad.', 'A room upstairs, with a view.', 'かいだん の ない: with no stairs.', 'The quietest room.', 'She asks about stairs, not quiet.'),
          actions: [
            A('take', '{竹|たけ} の {間|ま} に する', 'Give her Bamboo', { ok: true, set: { take: 'oshige' }, means: { en: 'Oshige goes in Bamboo, on the ground floor.' }, result: { en: 'Oshige bows and shuffles off to Bamboo, by the bath, no stairs.' } }),
            A('matsu', '{松|まつ} の {間|ま} に する', 'Give her Pine', { means: { en: 'Oshige goes in Pine, upstairs.' }, wrong: { en: 'Oshige looks at the staircase and her face falls. Pine is upstairs.' } }),
            A('hanare', '{離|はな}れ に する', 'Give her the Annex', { means: { en: 'Oshige goes in the Annex.' }, wrong: { en: 'Tokuzō coughs. "The Annex sleeps four. There\'s a family of four from the same village waiting."' } }),
          ] },
        { id: 'village', stable: true, text: say('ツネジ ： 「{村|むら} の {者|もの} {四人|よにん} 、 {一緒|いっしょ} の {部屋|へや} を お{願|ねが}い します 。」', 'Tsuneji: "Four of us from the village, one room together, please."'),
          task: hear('v:部屋', 'ツネジ ： 「むら の もの よにん 、 いっしょ の へや を おねがい します 。」', 'ツネジ ： 「{村|むら} の {者|もの} {四人|よにん} 、 {一緒|いっしょ} の {部屋|へや} を お{願|ねが}い します 。」', 'What do they want?',
            'One room for the four of them together.', 'Four separate rooms.', 'いっしょ の へや: one room together.', 'A room for one.', 'よにん: four people.'),
          actions: [
            A('hanare', '{離|はな}れ に する', 'Give them the Annex', { ok: true, set: { hanare: 'village' }, means: { en: 'The four go in the Annex together.' }, result: { en: 'The four villagers carry their bundles across the garden to the Annex, together.' } }),
            A('matsu', '{松|まつ} の {間|ま} に する', 'Give them Pine', { means: { en: 'The four go in Pine.' }, wrong: { en: 'Pine sleeps two. Four people would be sleeping on top of each other.' } }),
          ] },
        { id: 'yasuke', stable: true, text: say('ヤスケ ： 「{静|しず}か すぎる と {眠|ねむ}れない ので 、 {川|かわ} の {音|おと} が {聞|き}こえる {部屋|へや} が いい です 。」', 'Yasuke: "I can\'t sleep when it\'s too quiet, so I\'d like a room where I can hear the river."'),
          task: hear('g:conj_node', 'ヤスケ ： 「しずか すぎる と ねむれない ので 、 かわ の おと が きこえる へや が いい です 。」', 'ヤスケ ： 「{静|しず}か すぎる と {眠|ねむ}れない ので 、 {川|かわ} の {音|おと} が {聞|き}こえる {部屋|へや} が いい です 。」', 'What does Yasuke want, and why?',
            'A room where he can hear the river: silence keeps him awake.', 'The quietest room there is.', 'しずか すぎる と ねむれない: too quiet and he can\'t sleep.', 'A room far from the river.', 'He wants to hear it.'),
          actions: [
            A('matsu', '{松|まつ} の {間|ま} に する', 'Give him Pine', { ok: true, set: { matsu: 'yasuke' }, means: { en: 'Yasuke goes in Pine, over the river.' }, result: { en: 'Yasuke opens Pine\'s window. The river\'s noise comes in. He sits down beside it and closes his eyes.' } }),
            A('ume', '{梅|うめ} の {間|ま} に する', 'Give him Plum', { means: { en: 'Yasuke goes in Plum, the quiet room.' }, wrong: { en: 'Plum is booked tonight, and it is the quietest room in the house: the very thing he can\'t bear.' } }),
          ] },
        { id: 'change', stable: true, text: say('トクゾウ ： 「{梅|うめ} の {間|ま} の お{客|きゃく}さま が 、 {明日|あした} の {朝|あさ} お{帰|かえ}り に なる こと に なりました 。」', 'Tokuzō: "The guest in Plum is leaving tomorrow morning; it has been settled."'),
          task: hear('g:koto_ni_naru', 'トクゾウ ： 「うめ の ま の おきゃくさま が 、 あした の あさ おかえり に なります 。」', 'トクゾウ ： 「{梅|うめ} の {間|ま} の お{客|きゃく}さま が 、 {明日|あした} の {朝|あさ} お{帰|かえ}り に なる こと に なりました 。」', 'What has changed?',
            'Plum will be free from tomorrow morning.', 'Plum is free tonight.', 'あした の あさ: tomorrow morning, not tonight.', 'The Plum guest is staying longer.', 'お帰りになる: he is leaving.'),
          actions: [
            A('tomorrow', '{梅|うめ} を 「{明日|あした} から {空|あ}き 」 に する', 'Mark Plum free from tomorrow', { ok: true, set: { ume: 'tomorrow' }, means: { en: 'Plum is marked free from tomorrow.' }, result: { en: 'Tokuzō writes "free from tomorrow" beside Plum.' } }),
            A('tonight', '{梅|うめ} を 「{空|あ}き 」 に する', 'Mark Plum free now', { means: { en: 'Plum is marked free tonight.' }, wrong: { en: 'The Plum guest is still in his room tonight. He leaves tomorrow morning.' } }),
          ] },
        { id: 'refuse', stable: true, text: say('{旅|たび} の {男|おとこ} ： 「{予約|よやく} は ない が 、 {一番|いちばん} いい {部屋|へや} を {今夜|こんや} {頼|たの}む 。」', 'A traveller: "No reservation, but I want your best room tonight."'),
          task: task('g:yn_omotenashi', 'Which declines him politely, as the house would?',
            '{申|もう}し{訳|わけ} ございません 。 {本日|ほんじつ} は {満室|まんしつ} で ございます 。 {明日|あした} の {朝|あさ} から 、 {梅|うめ} の {間|ま} でしたら お{取|と}り できます が 。',
            'ない です 。 {帰|かえ}って ください 。', 'True, but it slams the door on a guest.',
            '{松|まつ} の {間|ま} を どうぞ 。 {今|いま} の {人|ひと} に は 、 {出|で}て もらいます 。', 'A room once given isn\'t taken back.'),
          actions: [
            A('polite', '{丁寧|ていねい} に {断|ことわ}って 、 {明日|あした} の {梅|うめ} を {勧|すす}める', 'Decline politely and offer Plum from tomorrow', { ok: true, set: { ume: 'booked' }, means: { en: 'You will decline for tonight and offer the Plum room from tomorrow.' }, result: { en: 'The traveller grumbles, then nods. "Tomorrow, then. Plum." Tokuzō sighs with relief.' } }),
            A('blunt', '「ない です 」 と {言|い}う', 'Tell him there\'s nothing', { means: { en: 'You will tell him flatly that there is nothing.' }, wrong: { en: 'The traveller reddens. Tokuzō hurries round the desk, bowing, and takes over. "Allow me…"' } }),
            A('evict', '{松|まつ} の {間|ま} を {空|あ}けさせる', 'Move Yasuke out of Pine', { means: { en: 'You will move Yasuke out of Pine for him.' }, wrong: { en: 'Tokuzō goes pale. "A room once given…" Yasuke stays where he is.' } }),
          ] },
      ],
    },
    conclusions: [{ id: 'done', when: { proc: 'done' }, result: 'win', text: { en: 'Every newcomer has a room for the night.' }, flags: { yn_rooms_all: true } }],
  };

  // ---- Tama's recipe card: spring eggs, no timer --------------------------------------------------------------------
  const EGG = vals({ raw: ['{生|なま}', 'raw'], basket: ['{籠|かご} の {中|なか}', 'in the basket'], steeping: ['{湯|ゆ} の {中|なか}', 'in the spring'], cooled: ['{冷|ひ}えた', 'cooled'], served: ['お{椀|わん} の {中|なか}', 'in the bowl'] });
  const CARD = (fJp, jp, en, ok, w, why) => hear('g:v_te_kudasai', fJp, jp, en, ok, w, why, 'Nothing yet: wait for Tama.', 'The card says what to do now.');
  C.encounters['yn.cook'] = {
    id: 'yn.cook', kind: 'procedure', name: say('{温泉卵|おんせんたまご}', 'Spring eggs'),
    rules: { wait: true },
    procedure: {
      id: 'yn_cook', version: 1, restart: 'stable',
      machine: { egg: 'raw' },
      show: [{ key: 'egg', label: say('{卵|たまご}', 'The eggs'), values: EGG }],
      done: { en: 'Three spring eggs in three bowls, the whites barely set, the yolks soft, a little broth over each.' },
      steps: [
        { id: 's1', stable: true, text: say('{一|いち} 、 {卵|たまご} を {籠|かご} に {入|い}れて ください 。', '1. Put the eggs in the basket.'),
          task: CARD('いち 、 たまご を かご に いれて ください 。', '{一|いち} 、 {卵|たまご} を {籠|かご} に {入|い}れて ください 。', 'What does the card say to do first?', 'Put the eggs in the basket.', 'Crack the eggs into a bowl.', 'That comes last.'),
          actions: [
            A('basket', '{卵|たまご} を {籠|かご} に {入|い}れる', 'Put the eggs in the basket', { ok: true, set: { egg: 'basket' }, means: { en: 'You put the eggs in the bamboo basket.' }, result: { en: 'Three eggs in the basket, side by side.' } }),
            A('crack', '{卵|たまご} を {割|わ}る', 'Crack the eggs', { means: { en: 'You crack the eggs now.' }, wrong: { en: 'Tama catches your wrist, laughing. "Not yet! Raw egg in a bowl is breakfast, not a spring egg."' } }),
          ] },
        { id: 's2', stable: true, text: say('{二|に} 、 {籠|かご} を {湯|ゆ} に {沈|しず}めて から 、 {歌|うた} を {三|みっ}つ {歌|うた}う {間|あいだ} 、 {待|ま}ちます 。', '2. Lower the basket into the spring, then wait for as long as it takes to sing three songs.'),
          task: hear('g:v_te_kara', 'に 、 かご を ゆ に しずめて から 、 うた を みっつ うたう あいだ 、 まちます 。', '{二|に} 、 {籠|かご} を {湯|ゆ} に {沈|しず}めて から 、 {歌|うた} を {三|みっ}つ {歌|うた}う {間|あいだ} 、 {待|ま}ちます 。', 'How long do the eggs stay in?',
            'As long as three songs take, after the basket goes in.', 'Take them straight out again.', 'うた を みっつ うたう あいだ まちます: wait three songs.', 'Until the water boils away.', 'Three songs: Tama sings them.'),
          actions: [
            A('steep', '{籠|かご} を {沈|しず}めて 、 {三曲|さんきょく} {待|ま}つ', 'Lower the basket and wait three songs', { ok: true, set: { egg: 'steeping' }, means: { en: 'You lower the basket and wait while Tama sings three songs.' }, result: { en: 'Tama sings the egg-sellers\' counting song, three times through. Steam curls round the basket.' } }),
            A('quick', '{沈|しず}めて すぐ {出|だ}す', 'Dip it and take it straight out', { means: { en: 'You dip the basket and lift it out at once.' }, wrong: { en: 'The eggs are still cold. Tama shakes her head. "Three songs. The eggs don\'t mind waiting."' } }),
          ] },
        { id: 's3', stable: true, text: say('{三|さん} 、 {取|と}り{出|だ}したら 、 すぐ {水|みず} で {冷|ひ}やして ください 。', '3. When you take them out, cool them in water straight away.'),
          task: hear('g:cond_tara', 'さん 、 とりだしたら 、 すぐ みず で ひやして ください 。', '{三|さん} 、 {取|と}り{出|だ}したら 、 すぐ {水|みず} で {冷|ひ}やして ください 。', 'What comes straight after taking them out?',
            'Cool them in water.', 'Put them back in the spring.', 'みず で ひやして: cool them in water.', 'Leave them in the sun.', 'すぐ みず で: straight into water.'),
          actions: [
            A('cool', '{水|みず} で {冷|ひ}やす', 'Cool them in water', { ok: true, set: { egg: 'cooled' }, means: { en: 'You lift the basket out and plunge it into the cold-water tub.' }, result: { en: 'The eggs hiss faintly in the cold tub.' } }),
            A('sun', '{日向|ひなた} に {置|お}く', 'Set them in the sun', { means: { en: 'You leave the basket in the sun to cool.' }, wrong: { en: '"They\'ll go on cooking like that," Tama warns, and moves the basket to the cold tub herself. "Again, from here."' } }),
          ] },
        { id: 's4', stable: true, text: say('{四|よん} 、 {割|わ}って お{椀|わん} に {入|い}れ 、 だし を かけて ください 。', '4. Crack them into a bowl and pour broth over them.'),
          task: CARD('よん 、 わって おわん に いれ 、 だし を かけて ください 。', '{四|よん} 、 {割|わ}って お{椀|わん} に {入|い}れ 、 だし を かけて ください 。', 'What is the last step?', 'Crack each into a bowl and pour broth over.', 'Peel them like boiled eggs.', 'Spring eggs are cracked into a bowl: the white is barely set.'),
          actions: [
            A('serve', '{割|わ}って 、 だし を かける', 'Crack them into bowls and add broth', { ok: true, set: { egg: 'served' }, means: { en: 'You crack each egg into a bowl and pour broth over.' }, result: { en: 'Each egg slides out whole: the white like silk, the yolk soft. Tama claps.' } }),
            A('peel', '{殻|から} を {剥|む}く', 'Peel them', { means: { en: 'You try to peel the shells off.' }, wrong: { en: 'The white is barely set; it runs over your fingers. Tama hands you a fresh egg. "Crack it, don\'t peel it."' } }),
          ] },
      ],
    },
    conclusions: [{ id: 'done', when: { proc: 'done' }, result: 'win', text: { en: 'Three spring eggs, just right.' } }],
  };

  // ---- Zenroku's complaint ------------------------------------------------------------------------------------------
  C.encounters['yn.complaint'] = {
    id: 'yn.complaint', kind: 'social', name: say('お{客|きゃく} の {苦情|くじょう}', 'A guest\'s complaint'),
    rules: { wait: true },
    autoRoute: ['s:read_noise', 's:read_cold', 'wait', 's:move'],
    social: {
      parties: [{ aid: 'n:zenroku', name: say('ゼンロク', 'Zenroku'), stance: 'closed', wants: { en: 'To complain without having to say so.' } }],
      claims: {
        noise: { by: 'n:zenroku', jp: '{夜|よる} に なる と 、 ちょっと にぎやか な ん です けど …… 。', en: '"It does get a little lively at night…"' },
        cold: { by: 'n:zenroku', jp: 'お{湯|ゆ} も 、 ぬるめ が お{好|す}き な {方|かた} に は 、 いい でしょう けど …… 。', en: '"And the water: fine for anyone who likes it lukewarm…"' },
        weep: { by: 'n:zenroku', jp: '…… {隣|となり} の {部屋|へや} の {方|かた} たち が 、 {夜|よる} に {泣|な}く ん です 。 {尾根|おね} から {来|き}た {人|ひと} たち です 。 {何|なに} も かも {失|な}くした {人|ひと} の こと で 、 {文句|もんく} なんて {言|い}えない でしょう 。', en: '"…The people in the next room weep at night. They\'re from the ridge. How can I complain about people who\'ve lost everything?"', hidden: true },
      },
      understanding: 2,
      gesture: { name: say('お{茶|ちゃ} を {淹|い}れる', 'Pour him some tea'), desc: 'Sit with him a moment.', effect: { stance: { 'n:zenroku': 'listening' } }, once: true, says: { en: 'You pour two cups of tea and sit down. Zenroku takes his hand away from his ear.' } },
      unravelTip: { en: 'Nothing is knotted. Listen to what he says before the けど: the rest is in the silence after it.' },
      actions: [
        { id: 'read_noise', kind: 'restate', label: say('{夜|よる} が うるさくて 、 {眠|ねむ}れない ん です ね 。', 'Say what he means about the nights'), once: true,
          task: task('g:yn_kedo_hint', 'He said "It does get a little lively at night…". Which says back what he means?', '{夜|よる} が うるさくて 、 {眠|ねむ}れない ん です ね 。', '{夜|よる} が {楽|たの}しくて 、 いい です ね 。', '"Lively… but" means it\'s noisy, not that he\'s enjoying it.', '{夜|よる} は 、 {誰|だれ} も いない ん です ね 。', 'He says it\'s lively, not empty.'),
          effect: { understanding: 1, stance: { 'n:zenroku': 'listening' } }, says: { en: 'Zenroku blinks, then nods slowly. "…Well. Yes. That\'s about the size of it."' } },
        { id: 'read_cold', kind: 'restate', label: say('お{湯|ゆ} が {冷|つめ}たい ん です ね 。', 'Say what he means about the water'), once: true,
          task: task('g:yn_kedo_hint', 'He said the water is "fine for anyone who likes it lukewarm…". Which says what he means?', 'お{湯|ゆ} が {冷|つめ}たい ん です ね 。', 'ぬるい お{湯|ゆ} が お{好|す}き なん です ね 。', 'He means the opposite: it\'s too cold for him.', 'お{湯|ゆ} が {熱|あつ}すぎる ん です ね 。', 'ぬるめ: lukewarm, not too hot.'),
          effect: { understanding: 1 }, says: { en: 'Zenroku sighs. "I\'m told the spring itself has been running cold. Not the inn\'s fault, I know."' } },
        { id: 'ask_why', kind: 'ask', label: say('{何|なに} か 、 {言|い}いにくい こと が あります か 。', 'Ask if there\'s something hard to say'), once: true, when: { stance: { 'n:zenroku': 'listening' } },
          task: task('v:話す', 'Which gently asks whether there is something he finds hard to say?', '{何|なに} か 、 {言|い}いにくい こと が あります か 。', '{何|なに} か 、 {言|い}いたい こと が あったら 、 はっきり {言|い}って ください 。', 'Demanding it plainly is exactly what he can\'t do.', '{何|なに} も ない なら 、 {帰|かえ}ります 。', 'That walks away from him.'),
          effect: { reveal: 'weep' }, says: { en: 'Zenroku looks at the wall. "…The people in the next room weep at night. They\'re from the ridge. How can I complain about that?"' } },
        { id: 'move', kind: 'propose', label: say('{上|かみ}の{湯|ゆ} の {梅|うめ} の {間|ま} が 、 {明日|あした} から {空|あ}きます 。', 'Offer him the Upper House\'s Plum room from tomorrow'), when: { claims: ['weep'] },
          task: task('g:prt_kara_made', 'Which offers him the Upper House\'s Plum room from tomorrow?', '{上|かみ}の{湯|ゆ} の {梅|うめ} の {間|ま} が 、 {明日|あした} から {空|あ}きます 。', '{上|かみ}の{湯|ゆ} の {梅|うめ} の {間|ま} は 、 {明日|あした} まで {空|あ}きません 。', 'That says it won\'t be free until tomorrow, and offers nothing.', '{下|しも}の{湯|ゆ} の {土間|どま} が 、 {今夜|こんや} {空|あ}きます 。', 'The floor is no place for him, and not what you mean.'),
          effect: { flag: 'moved' }, says: { en: 'Zenroku brightens, then hesitates. "And the people next door?" Kane says she\'ll sit with them tonight.' } },
        { id: 'stay', kind: 'propose', label: say('{隣|となり} の {方|かた} たち に 、 キクエ さん の {薬|くすり} を {頼|たの}みましょう 。', 'Suggest asking Kikue for something to help the people next door sleep'), when: { claims: ['weep'] },
          task: task('v:薬', 'Which suggests asking Kikue for a remedy for the people next door?', '{隣|となり} の {方|かた} たち に 、 キクエ さん の {薬|くすり} を {頼|たの}みましょう 。', '{隣|となり} の {方|かた} たち に 、 {静|しず}か に する よう {言|い}いましょう 。', 'Telling grieving people to be quiet is what he couldn\'t bring himself to do.', '{隣|となり} の {方|かた} たち を 、 {外|そと} に {出|だ}しましょう 。', 'Turn them out? No.'),
          effect: { flag: 'stayed' }, says: { en: 'Zenroku nods. "Something to help them sleep. Yes. Then I\'ll sleep too."' } },
        { id: 'blunt', kind: 'propose', label: say('{文句|もんく} が ある なら 、 はっきり {言|い}って ください 。', 'Tell him to say plainly what his complaint is'), lasting: true, means: { en: 'You will demand that he says it outright.' },
          task: task('g:v_te_kudasai', 'Which demands that he says it outright?', '{文句|もんく} が ある なら 、 はっきり {言|い}って ください 。', '{文句|もんく} が なくて 、 よかった です 。', 'That pretends nothing is wrong.', '{文句|もんく} は 、 {後|あと} で {聞|き}きます 。', 'That puts it off.'),
          effect: { stance: { 'n:zenroku': 'leaving' } }, says: { en: 'Zenroku stiffens. "I said it was quite all right." He picks up his things and goes out to the bath.' } },
      ],
      responses: {
        water: { effect: { stance: { 'n:zenroku': 'listening' } }, says: { en: 'A cup of water. He drinks it and loosens his collar.' } },
        unravel: { says: { en: 'Nothing here is knotted; listen to what he isn\'t saying.' } },
      },
      wait: { when: { stance: { 'n:zenroku': 'listening' } }, effect: { reveal: 'weep' }, says: { en: 'In the quiet Zenroku speaks at last: "…The people next door weep at night. They\'re from the ridge."' } },
      companion: {
        nao: [{ id: 'nao_wall', name: say('{壁|かべ} を {見|み}る', 'Look at the wall'), desc: 'Nao notices where he keeps glancing.', once: true, effect: { understanding: 1, stance: { 'n:zenroku': 'listening' } }, says: { en: 'Nao: "You keep looking at that wall. Who\'s on the other side?" Zenroku starts, then sighs.' } }],
        mio: [{ id: 'mio_sleep', name: say('{眠|ねむ}り の {話|はなし}', 'Talk about sleep'), desc: 'Mio asks how he sleeps.', once: true, effect: { understanding: 1, stance: { 'n:zenroku': 'listening' } }, says: { en: 'Mio: "Are you sleeping at all?" Zenroku laughs weakly. "Hardly. Is it that obvious?"' } }],
        ren: [{ id: 'ren_lamp', name: say('{灯|ひ} を {置|お}く', 'Leave a lamp lit'), desc: 'Ren sets a small lamp by him.', once: true, effect: { stance: { 'n:zenroku': 'listening' } }, says: { en: 'Ren sets a small lamp on the table. "It\'s easier to talk with a light." Zenroku smiles despite himself.' } }],
        suzu: [{ id: 'suzu_mirror', name: say('{言|い}い{方|かた} を {真似|まね}る', 'Echo his way of speaking'), desc: 'Suzu answers in his own roundabout style.', once: true, effect: { understanding: 1, stance: { 'n:zenroku': 'listening' } }, says: { en: 'Suzu: "It\'s quite all right, isn\'t it? Quite, quite all right." Zenroku laughs out loud. "All right, all right. It isn\'t."' } }],
      },
      drift: [{ when: { all: [{ rounds: 3 }, { stance: { 'n:zenroku': 'closed' } }] }, once: true, effect: { stance: { 'n:zenroku': 'listening' } }, says: { en: 'Through the wall comes the sound of someone crying softly. Zenroku closes his eyes.' } }],
    },
    conclusions: [
      { id: 'walked', when: { left: 'n:zenroku' }, result: 'end', text: { en: 'Zenroku goes off to the bath. Later Kane hears the rest from him herself, and moves the ridge family to a quieter corner.' } },
      { id: 'moved', when: { flag: 'moved' }, result: 'win', text: { en: 'Zenroku will move to the Upper House\'s Plum room tomorrow. The two houses are passing guests between them.' }, flags: { yn_zenroku_moved: true } },
      { id: 'stayed', when: { flag: 'stayed' }, result: 'win', text: { en: 'Zenroku stays. Kikue sends something warm for the people next door, and that night the whole corridor sleeps.' }, flags: { yn_zenroku_stayed: true } },
      { id: 'heard', when: { all: [{ understanding: 2 }, { rounds: 6 }] }, result: 'win', text: { en: 'Zenroku feels heard, which, he admits, was most of what he wanted.' } },
    ],
  };

  // ---- Tokube's tonic: the polite-refusal training ground ----------------------------------------------------------
  C.encounters['yn.salesman'] = {
    id: 'yn.salesman', kind: 'social', name: say('{本場|ほんば} の {名薬|めいやく}', 'The wonder tonic'),
    rules: { wait: true },
    autoRoute: ['s:decline', 's:ask', 's:honest'],
    social: {
      parties: [{ aid: 'n:tokube', name: say('トクベエ', 'Tokube'), stance: 'heated', wants: { en: 'To make a sale.' } }],
      claims: {
        cures: { by: 'n:tokube', jp: '{何|なん} でも {治|なお}る ！ {腰|こし} に も {胸|むね} に も ！', en: '"It cures anything! Your back, your chest!"' },
        ginger: { by: 'n:tokube', jp: '…… {中身|なかみ} は 、 {湯|ゆ} と {生姜|しょうが} だ よ 。 {温|あたた}まる の は {本当|ほんとう} だ 。', en: '"…It\'s spring water and ginger. It does warm you up, that much is true."', hidden: true },
      },
      understanding: 2,
      unravelTip: { en: 'Nothing is knotted. He is pushing; decline, or ask what is really in the bottle.' },
      actions: [
        { id: 'decline', kind: 'restate', label: say('すみません 、 {薬|くすり} は ちょっと …… 。', 'Decline politely'),
          task: task('g:yn_wa_chotto', 'Which declines politely, without saying "no" outright?', 'すみません 、 {薬|くすり} は ちょっと …… 。', 'すみません 、 {薬|くすり} を {二本|にほん} ください 。', 'That buys two.', '{薬|くすり} なんか 、 {誰|だれ} が {買|か}う か ！', 'That is a refusal, but a rude one.'),
          effect: { understanding: 1 }, says: { en: 'Tokube: "Ah, come on, just one! For the road!" He holds out a bottle again, a little less sure of himself.' } },
        { id: 'ask', kind: 'ask', label: say('{中|なか} に {何|なに} が {入|はい}って います か 。', 'Ask what\'s in it'), once: true,
          task: task('v:薬', 'Which asks what is in the bottle?', '{中|なか} に {何|なに} が {入|はい}って います か 。', 'いくら です か 。', 'That asks the price.', 'どこ で {作|つく}りました か 。', 'That asks where it was made, not what\'s in it.'),
          effect: { reveal: 'ginger', understanding: 1, stance: { 'n:tokube': 'listening' } }, says: { en: 'Tokube scratches his head. "…Spring water and ginger. It does warm you up, mind. That much is true."' } },
        { id: 'honest', kind: 'propose', label: say('「{温|あたた}まる 」 と {書|か}けば 、 {売|う}れます よ 。', 'Suggest he sells it as what it is'), when: { claims: ['ginger'] },
          task: task('g:cond_ba', 'Which suggests he would sell it if he wrote "it warms you up"?', '「{温|あたた}まる 」 と {書|か}けば 、 {売|う}れます よ 。', '「{何|なん} でも {治|なお}る 」 と {書|か}けば 、 {売|う}れます よ 。', 'That is the lie he is already telling.', '「{温|あたた}まる 」 と {書|か}いて も 、 {売|う}れません よ 。', 'That says it won\'t sell.'),
          effect: { flag: 'honest' }, says: { en: 'Tokube looks at his banner for a long moment. "Warms you up. …Hm. People do like being warm."' } },
        { id: 'buy', kind: 'propose', label: say('{一本|いっぽん} ください 。', 'Buy a bottle'), lasting: true, means: { en: 'You will buy a bottle.' },
          task: task('v:薬', 'Which buys one bottle?', '{一本|いっぽん} ください 。', '{一本|いっぽん} も いりません 。', 'That refuses.', '{全部|ぜんぶ} ください 。', 'That buys the lot.'),
          effect: { flag: 'bought' }, says: { en: 'Tokube beams and presses a bottle into your hands.' } },
      ],
      responses: { unravel: { says: { en: 'There is nothing to untangle but a sales pitch.' } } },
      wait: { when: { stance: { 'n:tokube': 'heated' } }, effect: { stance: { 'n:tokube': 'listening' } }, says: { en: 'You say nothing. Tokube runs out of patter, and for a moment just looks tired.' } },
      companion: {
        // Mio's honest rejection of a fraud (S4): she has refused out loud before (Chapter 8); this is that, kindly
        mio: [{ id: 'mio_honest', name: say('{正直|しょうじき} に {断|ことわ}る', 'Refuse honestly'), desc: 'Mio, the apothecary of Reedwake, says what she can and can\'t stand behind.', once: true,
          effect: { reveal: 'ginger', flag: 'honest' }, says: { en: 'Mio: "I won\'t buy it, and I won\'t tell anyone it cures everything, because it doesn\'t. But if it\'s ginger and spring water, it warms you. Write that. That\'s true, and it\'s enough." Tokube stares at her. Then, slowly, he laughs.' } }],
        nao: [{ id: 'nao_walk', name: say('{歩|ある}き{出|だ}す', 'Start walking'), desc: 'Nao has heard this pitch in every town on the coast.', once: true, effect: { understanding: 1 }, says: { en: 'Nao: "Heard it in every port from here to Saltglass." Nao keeps walking; Tokube has to trot to keep up.' } }],
        ren: [{ id: 'ren_label', name: say('{札|ふだ} を {読|よ}む', 'Read the label'), desc: 'Ren reads the small print on the bottle.', once: true, effect: { reveal: 'ginger', understanding: 1 }, says: { en: 'Ren reads the bottle\'s tiny label aloud: "Spring water, ginger." Tokube coughs. "It\'s… the secret ingredients."' } }],
        suzu: [{ id: 'suzu_patter', name: say('{口上|こうじょう} を {返|かえ}す', 'Out-patter him'), desc: 'Suzu has done this act herself.', once: true, effect: { understanding: 1, stance: { 'n:tokube': 'listening' } }, says: { en: 'Suzu launches into a pitch of her own for "Suzu\'s miracle air: one breath cures everything!" Tokube laughs in spite of himself. "All right, all right."' } }],
      },
      drift: [{ when: { rounds: 2 }, once: true, effect: {}, says: { en: 'Tokube: "Bad back? Weak chest? Broken heart? One sip!"' } }],
    },
    conclusions: [
      { id: 'honest', when: { flag: 'honest' }, result: 'win', text: { en: 'Tokube takes down his banner and writes a new one: "Spring water and ginger. Warms you up."' }, flags: { yn_tokube_honest: true } },
      { id: 'bought', when: { flag: 'bought' }, result: 'win', text: { en: 'You have a bottle of Tokube\'s tonic. It tastes of ginger.' } },
      { id: 'declined', when: { understanding: 2 }, result: 'win', text: { en: 'Tokube shrugs and lets you go with a grin. "Can\'t blame a man for trying."' } },
      { id: 'tired', when: { rounds: 6 }, result: 'win', text: { en: 'Tokube gives up and turns to the next customer.' } },
    ],
  };
})(RB.content);
