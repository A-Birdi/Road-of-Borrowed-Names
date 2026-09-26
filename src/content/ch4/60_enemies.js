/* Chapter 4 enemies: Hush-touched creatures of the frozen observatory and
 * the lamp that waited. Chill intents are answered by ほのお (taught at the
 * inn before the observatory); every fight can also be won by Unravel. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const EN = C.enemies;
  const pool = {
    tags: ['snowbell'],
    F: ['v:雪', 'v:星', 'v:火', 'v:冬', 'v:夜'],
    E: ['v:雪', 'v:星', 'v:手紙', 'v:鐘', 'v:吹雪', 'v:約束', 'g:counters'],
    I: ['v:約束', 'v:宛名', 'v:吹雪', 'g:cond_tara', 'g:temo', 'g:hazu'],
    A: ['g:adv_kanenai', 'g:adv_wake_dewa_nai', 'g:adv_monono', 'g:adv_kara_koso'],
  };
  const o = (en, ok, why) => (why ? { en, ok, why: { en: why } } : { en, ok });
  const oj = (jp, ok, why, en) => Object.assign({ jp, ok }, en ? { en } : {}, why ? { why: { en: why } } : {});

  EN['sb.fox'] = { name: { en: 'Snow Fox', jp: '{雪|ゆき}ギツネ' }, art: 'sb_snowfox', look: { custom: 'snowfox' }, region: 'snowbell', bg: 'snowbell', knots: 2, pool,
    pattern: ['strike', 'rest', 'chill', 'strike'],
    intro: { jp: '{青|あお}く {光|ひか}る {目|め} の キツネ が 、 {雪|ゆき} を {蹴|け}って {跳|と}びかかって きた 。', en: 'A fox with glowing blue eyes kicks up the snow and springs at you.' },
    settle: { jp: 'キツネ の {目|め} から 、 {青|あお}い {光|ひかり} が {抜|ぬ}けた 。 {一声|ひとこえ} {鳴|な}いて 、 {雪|ゆき} の {中|なか} へ {走|はし}り{去|さ}る 。', en: 'The blue light drains from the fox\'s eyes. It gives one cry and runs off into the snow.' } };

  EN['sb.wisp'] = { name: { en: 'Frost Wisp', jp: '{霜|しも} の {精|せい}' }, art: 'wisp', artOpts: { col: '#cfe8ff' }, look: { custom: 'wisp', col: '#cfe8ff' }, region: 'snowbell', bg: 'observatory', knots: 2, pool,
    pattern: ['chill', 'mend', 'rest', 'chill'],
    intro: { jp: '{白|しろ}い {息|いき} の よう な もの が 、 {氷|こおり} の {床|ゆか} から {立|た}ち{上|のぼ}った 。', en: 'Something like a white breath rises from the icy floor.' },
    settle: { jp: '{霜|しも} は {静|しず}か に とけて 、 {床|ゆか} の {上|うえ} の {小|ちい}さな {水|みず}たまり に なった 。', en: 'The frost melts quietly into a small puddle on the floor.' } };

  EN['sb.ghost'] = { name: { en: 'Lantern Ghost', jp: '{名無|なな}し の {灯|ひ}' }, art: 'lantern', artOpts: { col: '#8ab8f0' }, look: { custom: 'lanternghost' }, region: 'snowbell', bg: 'observatory', knots: 3, pool,
    pattern: ['strike', 'lie:1', 'mend', 'rest'],
    intents: {
      'lie:1': { power: 1, target: 'rand',
        text: {
          F: { jp: 'だれ も かえって こない 。 てがみ も こなかった 。', en: 'Nobody comes back. No letters came either.' },
          E: { jp: '{誰|だれ} も {帰|かえ}って こない 。 {手紙|てがみ} なんて 、 {一通|いっつう} も {来|こ}なかった 。', en: 'Nobody comes back. Not a single letter ever came.' },
          I: { jp: '{待|ま}つ だけ {無駄|むだ} だ 。 {娘|むすめ} は {父親|ちちおや} の こと など 、 とっくに {忘|わす}れて いる 。', en: 'Waiting is pointless. The daughter forgot her father long ago.' },
          A: { jp: '{便|たよ}り の ない の は 、 {忘|わす}れられた {証|あかし} 。 {灯|ひ} を ともす {理由|りゆう} など 、 もう どこ に も ない 。', en: 'No news is proof of being forgotten. There is no longer any reason to light a lamp.' },
        },
        truth: {
          F: { kind: 'choose', item: 'c:sb_ghost_f', prompt: { en: 'The ghost says no letters came. What do you know?' }, options: [o('Akari\'s letters were waiting in the post shelter.', true), o('It\'s true: no letters ever came.', false, 'You carried four of them to Hoshino yourself.')] },
          E: { kind: 'choose', item: 'c:sb_ghost_e', prompt: { en: 'What is false in what it said?' }, options: [o('"Not a single letter came" — Akari wrote every month; only the addresses were erased.', true), o('"Nobody comes back" — that part is a lie, the rest is true.', false, 'The clearest falsehood is 一通も来なかった: you have seen the letters.'), o('Nothing; it\'s telling the truth.', false, 'The letters were in the post shelter.')], explain: { en: '一通も〜ない = not even one (letter).' } },
          I: { kind: 'choose', item: 'c:sb_ghost_i', prompt: { en: 'See through it. What is false?' }, options: [o('Akari hasn\'t forgotten — her letters say she looks for the lamp every night.', true), o('Waiting really is pointless.', false, 'That is the Hush talking.'), o('Hoshino has no daughter.', false, 'It doesn\'t claim that.')] },
          A: { kind: 'choose', item: 'c:sb_ghost_a', prompt: { en: 'It twists the saying 「便りのないのはよい便り」 (no news is good news). What is wrong with its reasoning?' }, options: [o('The silence came from erased addresses, not from being forgotten.', true), o('Nothing: silence always means being forgotten.', false, 'You know why the letters stopped.'), o('The saying is fake.', false, '便りのないのはよい便り is a real saying; the ghost inverts it.')], explain: { en: '証 (あかし) = proof. The ghost turns a comforting proverb into its opposite.' } },
        } },
    },
    intro: { jp: '{笠|かさ} の {白|しろ}い {提灯|ちょうちん} が 、 {冷|つめ}たい {光|ひかり} を {揺|ゆ}らして {近|ちか}づいて くる 。', en: 'A lantern with a blank shade drifts closer, swaying its cold light.' },
    settle: { jp: '{提灯|ちょうちん} は {床|ゆか} に {落|お}ち 、 {笠|かさ} に うっすら と {字|じ} が {浮|う}かんだ 。 {石段|いしだん} の {名前|なまえ} だ 。', en: 'The lantern drops to the floor, and faint letters surface on its shade: the name of the stair.' } };

  EN['sb.moth'] = { name: { en: 'Chart Moth', jp: '{星図|せいず}{蛾|が}' }, art: 'moth', artOpts: { col: '#2a3458', col2: '#c8d8f0' }, look: { custom: 'moth', col: '#8a9ac8' }, region: 'snowbell', bg: 'observatory', knots: 2, pool,
    pattern: ['strike', 'mend', 'rest', 'sweep'],
    intro: { jp: '{星図|せいず} の {切|き}れ{端|はし} を {羽|はね} に した {蛾|が} が 、 {星|ほし} の {名前|なまえ} を {粉|こな} に して {撒|ま}いて いる 。', en: 'A moth with wings made of torn star charts is scattering star names as dust.' },
    settle: { jp: '{羽|はね} の {星|ほし} に 、 {名前|なまえ} が {戻|もど}った 。 {蛾|が} は {棚|たな} の {隙間|すきま} へ {帰|かえ}って いく 。', en: 'The stars on its wings have their names back. The moth returns to a gap in the shelves.' } };

  EN['sb.golem'] = { name: { en: 'Icicle Warden', jp: '{氷|こおり} の {番人|ばんにん}' }, art: 'golem', artOpts: { col: '#a8d4f0', core: '#e8f4ff' }, look: { custom: 'golem', col: '#a8d4f0' }, region: 'snowbell', bg: 'observatory', knots: 3, pool,
    pattern: ['charge', 'strike', 'chill', 'rest'],
    intro: { jp: 'つらら が {寄|よ}り{集|あつ}まって 、 {人|ひと} の {形|かたち} に なった 。 {回廊|かいろう} を {塞|ふさ}いで いる 。', en: 'Icicles have gathered into the shape of a person. It is blocking the gallery.' },
    settle: { jp: 'つらら は {一本|いっぽん} ずつ {外|はず}れ 、 {床|ゆか} の {上|うえ} で {鈴|すず} の よう な {音|おと} を {立|た}てた 。', en: 'One by one the icicles come loose and ring like little bells on the floor.' } };

  EN['sb.boss'] = { name: { en: 'The Lamp That Waited', jp: '{待|ま}ちくたびれた {灯|ひ}' }, art: 'sb_frostlamp', region: 'snowbell', bg: 'observatory', knots: 5, boss: true, music: 'boss', pool,
    pattern: ['chill:1', 'strike', 'rest', 'chill:1'],
    intents: {
      'chill:1': { power: 1, target: 'rand',
        text: {
          F: { jp: '$tgt が つめたく なる …… 。', en: '$tgtEn is going cold…' },
          E: { jp: '{待|ま}つ {寒|さむ}さ を 、 $tgt に {分|わ}けよう と して いる 。', en: 'It is trying to share the cold of waiting with $tgtEn.' },
          I: { jp: '「 {寒|さむ}い でしょう 。 わたし も {寒|さむ}い 」 ── {冷気|れいき} が $tgt に {向|む}かう 。', en: '"Cold, isn\'t it? I\'m cold too." The chill turns toward $tgtEn.' },
          A: { jp: '{誰|だれ} に も {顧|かえり}みられない {夜|よる} の {冷|つめ}たさ が 、 $tgt の {指先|ゆびさき} を {蝕|むしば}む 。', en: 'The cold of nights no one heeded gnaws at $tgtEn\'s fingertips.' },
        } },
      'chill:2': { power: 2, target: 'rand',
        text: {
          F: { jp: 'とても つめたい いき が $tgt に くる ！', en: 'A freezing breath is coming at $tgtEn!' },
          E: { jp: '{十日|とおか}{分|ぶん} の {寒|さむ}さ を 、 {一度|いちど} に $tgt へ {吐|は}き{出|だ}そう と して いる 。', en: 'It means to breathe out ten nights\' worth of cold at $tgtEn all at once.' },
          I: { jp: '{誰|だれ} も {来|こ}なかった {夜|よる} の {数|かず} だけ 、 {冷気|れいき} が {重|おも}く なって いく 。 {次|つぎ} は $tgt だ 。', en: 'The chill grows heavier with every night no one came. Next it falls on $tgtEn.' },
          A: { jp: '{積|つ}もり{積|つ}もった {待|ま}ち{時間|じかん} が 、 {凍|い}てつく {息|いき} と なって $tgt に {襲|おそ}いかかる 。', en: 'All the piled-up hours of waiting become a freezing breath and fall on $tgtEn.' },
        } },
      'plea:1': {
        text: {
          F: { jp: 'だれ も みて いない よる でも 、 やくそく は やくそく ？', en: 'Even on nights no one is watching — is a promise still a promise?' },
          E: { jp: '{誰|だれ} も {見|み}て いない {夜|よる} でも 、 {約束|やくそく} は {約束|やくそく} な の ？', en: 'Even on nights no one is watching, is a promise still a promise?' },
          I: { jp: '{見|み}て いる {人|ひと} が いなく なって も 、 {約束|やくそく} を {守|まも}る {意味|いみ} は ある の ？', en: 'If there\'s no one left watching, is there any point keeping the promise?' },
          A: { jp: '{見届|みとど}ける {者|もの} の ない {約束|やくそく} に 、 {果|は}たして {価値|かち} は ある の だろう か 。', en: 'Does a promise that no one witnesses truly have any worth?' },
        },
        answer: {
          F: { kind: 'choose', item: 'c:sb_plea1', prompt: { en: 'Answer what it is really asking.' }, options: [oj('うん 。 やくそく は やくそく だ よ 。', true, null, 'Yes. A promise is a promise.'), oj('ううん 。 だれ も みて いない なら 、 いい よ 。', false, 'That would let the promise go out — the Hush\'s answer.', 'No. If no one\'s watching, it doesn\'t matter.'), oj('わからない 。', false, 'It needs an answer, not a shrug.', 'I don\'t know.')] },
          E: { kind: 'choose', item: 'c:sb_plea1', prompt: { en: 'Answer what it is really asking.' }, options: [oj('{見|み}て いなくて も 、 {約束|やくそく} は {約束|やくそく} だ よ 。', true, null, 'Even if no one is watching, a promise is a promise.'), oj('{誰|だれ} も {見|み}て いない なら 、 {守|まも}らなくて いい 。', false, 'That is exactly what the cold wants to hear.', 'If no one is watching, you don\'t have to keep it.'), oj('{約束|やくそく} は {明日|あした} {考|かんが}えよう 。', false, 'It\'s asking now, after ten cold nights.', 'Let\'s think about promises tomorrow.')], explain: { en: '〜なくても = even if not; 〜なくていい = don\'t have to.' } },
          I: { kind: 'choose', item: 'c:sb_plea1', prompt: { en: 'Answer what it is really asking.' }, options: [oj('{約束|やくそく} は 、 {見|み}せる ため じゃ なくて 、 {待|ま}つ {人|ひと} の ため に ある 。', true, null, 'A promise isn\'t for show — it\'s for the one who waits.'), oj('{見|み}られない {約束|やくそく} は 、 もう {終|お}わって いい 。', false, 'That comforts it by ending the promise — the Hush\'s way.', 'An unseen promise may as well end.'), oj('{誰|だれ} か が {見|み}て いる ふり を すれば いい 。', false, 'A pretence doesn\'t answer the question.', 'Just pretend someone\'s watching.')] },
          A: { kind: 'choose', item: 'c:sb_plea1', prompt: { en: 'Answer what it is really asking.' }, options: [oj('{約束|やくそく} の {価値|かち} は 、 {見届|みとど}ける {者|もの} で は なく 、 {果|は}たす {者|もの} の {内|うち} に ある 。', true, null, 'A promise\'s worth lies not in who witnesses it, but in the one who keeps it.'), oj('{見届|みとど}ける {者|もの} が いなければ 、 {約束|やくそく} は {成|な}り{立|た}たない 。', false, 'That agrees with the cold: the promise would simply stop.', 'Without a witness, a promise can\'t stand.'), oj('{価値|かち} など なくて も 、 {習慣|しゅうかん} だ から {続|つづ}ける べき だ 。', false, 'It reduces the promise to habit — true, perhaps, but not what it needs to hear.', 'Worth or not, keep it up out of habit.')], explain: { en: '見届ける = to see (something) through to the end as a witness; 果たす = to carry out, fulfil.' } },
        } },
      'plea:2': {
        text: {
          F: { jp: 'あの こ は 、 かえって くる ？', en: 'Will she come home?' },
          E: { jp: 'あの {子|こ} は 、 {本当|ほんとう} に {帰|かえ}って くる の ？', en: 'Will she really come home?' },
          I: { jp: 'もし あの {子|こ} が {帰|かえ}って こなかったら 、 わたし は {何|なん} の ため に ともって いた の ？', en: 'If she never comes home, what was I burning for?' },
          A: { jp: '{帰|かえ}らぬ {人|ひと} を {照|て}らし{続|つづ}ける {灯|ひ} は 、 {愚|おろ}か なのだろう か 。', en: 'Is a lamp that keeps lighting the way for someone who does not return merely foolish?' },
        },
        answer: {
          F: { kind: 'choose', item: 'c:sb_plea2', prompt: { en: 'Answer what it is really asking.' }, options: [oj('てがみ が きた よ 。 あの こ も 、 まいばん みて いる 。', true, null, 'Letters came. She looks for you every night.'), oj('もう こない よ 。', false, 'You\'ve read her letters — that isn\'t true.', 'She won\'t come any more.')] },
          E: { kind: 'choose', item: 'c:sb_plea2', prompt: { en: 'Answer what it is really asking.' }, options: [oj('{手紙|てがみ} が {来|き}た よ 。 {毎晩|まいばん} 、 {橋|はし} の {上|うえ} から {見|み}て いる って 。', true, null, 'Letters came. She says she looks from the bridge every night.'), oj('{帰|かえ}って こない から 、 {消|き}えて いい よ 。', false, 'That answers with the Hush\'s silence.', 'She won\'t come back, so you can go out.'), oj('わたし は {知|し}らない 。', false, 'You do know: you read the letters.', 'I don\'t know.')] },
          I: { kind: 'choose', item: 'c:sb_plea2', prompt: { en: 'Answer what it is really asking.' }, options: [oj('{帰|かえ}り{道|みち} を {照|て}らす ため だ よ 。 {帰|かえ}って くる {日|ひ} まで も 、 その {後|あと} も 。', true, null, 'To light the way home — until the day she comes, and after.'), oj('{帰|かえ}って こない なら 、 {意味|いみ} は なかった 。', false, 'That makes every night of waiting worthless.', 'If she doesn\'t come, it meant nothing.'), oj('{誰|だれ} か {別|べつ} の {人|ひと} を {待|ま}てば いい 。', false, 'It lost her name, not its purpose; swapping her out is no answer.', 'Just wait for someone else.')] },
          A: { kind: 'choose', item: 'c:sb_plea2', prompt: { en: 'Answer what it is really asking.' }, options: [oj('{照|て}らされて いる と {知|し}る だけ で 、 {人|ひと} は {道|みち} に {迷|まよ}わず に いられる 。 {愚|おろ}か で は ない 。', true, null, 'Just knowing the way is lit keeps a person from losing it. That isn\'t foolish.'), oj('{報|むく}われない {光|ひかり} は 、 {早|はや}く {消|き}える べき だ 。', false, 'The Hush\'s logic: end what isn\'t repaid.', 'Light that goes unrewarded should go out.'), oj('{愚|おろ}か だ が 、 {美|うつく}しい から {許|ゆる}される 。', false, 'Half-right in tone, but it concedes the lamp is foolish.', 'Foolish, but forgiven for being beautiful.')] },
        } },
    },
    phases: [
      { at: 3, pattern: ['chill:2', 'rest', 'plea:1', 'chill:1'],
        line: { jp: '{灯|ひ} が {震|ふる}える 。 {冷|つめ}たさ の {奥|おく} から 、 {問|と}い が {聞|き}こえて くる 。', en: 'The lamp trembles. From deep in the cold, a question comes.' },
        teach: { en: 'The lamp is asking something (Plea). It isn\'t an attack: choose "Answer" and reply to what it really means — that loosens a knot. Its cold (Chill) is still answered by ほのお.' } },
      { at: 1, pattern: ['plea:2', 'rest', 'plea:2'],
        line: { jp: '{青|あお}い {炎|ほのお} が {小|ちい}さく なり 、 {最後|さいご} の {問|と}い を {口|くち} に した 。', en: 'The blue flame shrinks, and asks one last question.' } },
    ],
    intro: { jp: '{氷|こおり} の {笠|かさ} の {中|なか} で 、 {青|あお}い {炎|ほのお} が {立|た}ち{上|あ}がる 。 {部屋|へや} じゅう の {霜|しも} が 、 {一斉|いっせい} に こちら を {向|む}いた 。', en: 'Inside the icy shade a blue flame rises. All the frost in the room turns toward you at once.' },
    settle: { jp: '{冷気|れいき} が {引|ひ}いて いく 。 {灯|ひ} は {小|ちい}さく {揺|ゆ}れ 、 {何|なに} か を {思|おも}い{出|だ}そう と して いた 。', en: 'The cold withdraws. The lamp sways, small, as if trying to remember something.' } };
})(RB.content);
