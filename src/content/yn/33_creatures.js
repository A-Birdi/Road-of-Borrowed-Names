/* Steamhollow, Chapter 11: creatures and encounters (expansion P13d, P13f; plan R3 "Unique encounters", E3 wanderers,
 * E6 objectives, E8; sealed S4; docs/future/work/P13_STEAMHOLLOW.md).
 *   yn.steamwisp   Steam Wisp (湯気坊): a puff of steam with a temper; Heat, then it hides in itself (Shroud).
 *   yn.pebbles     Pebble Stack (積み石): stones somebody stacked by a path, which topple onto whoever disturbs them
 *                  (a Charge), and stack themselves again.
 *   yn.toad        Sulphur Toad (硫黄蛙): a yellow toad that sits in the channels and muddies the water (a Sweep); the
 *                  bath-keeper Aki has no patience with it.
 *   yn.lostguest   Lost Guest (迷い客): a traveller-shaped echo in a yukata that has forgotten its room; it asks, and you
 *                  read it its room tag (a Plea answered).
 *   yn.towelthief  Towel Thief (手拭い泥棒): a hand towel that has come alive and wants yours; in its own encounter
 *                  (yn.towel) it goes for the towel you were lent (protect the towel, E6). Comic.
 *   yn.chochin     Stray Lantern (迷い提灯): a festival lantern drifted off its street, telling house rules wrong (a False
 *                  promise, put right by the rules you read: towels, hours, rinsing).
 *   yn.kettle      the Kettle Below (釜の主): the spring's old spirit, frightened rather than angry, pressed from above by
 *                  the town's shouting and from the ridge by its silence (S4: a mirror image of the Hush, which quiets
 *                  argument; kept subtle). Settled by listening, never defeated (social; no Unravel, C-09).
 *   yn.wander_aki  the bath-keeper (E3): Aki joins against a Sulphur Toad muddying the deep channel.
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
  const EN = (id, d) => (C.enemies[id] = Object.assign({ region: 'steamhollow', bg: 'steamhollow', music: 'battle_yn', boss: false, setting: 'outdoor', edition: 2 }, d));
  const POOL = {
    tags: ['steamhollow'],
    F: ['v:湯', 'v:部屋', 'v:卵', 'g:v_te_kudasai', 'g:prt_dake_shika'],
    E: ['g:v_temo_ii', 'g:yn_wa_chotto', 'g:v_naide_kudasai', 'g:yn_owabi', 'g:v_te_kara'],
    I: ['g:koto_ni_suru', 'g:koto_ni_naru', 'g:conj_node', 'g:noni', 'g:cond_tara'],
    A: ['g:yn_omotenashi', 'g:yn_kedo_hint', 'g:keigo_kenjo'],
  };
  const VENTS = { region: 'yn_vents', bg: 'yn_vents', setting: 'indoor' };
  EN('yn.steamwisp', Object.assign({}, { setting: null }, {
    name: T('Steam Wisp', '{湯気坊|ゆげぼう}'), art: 'wisp', artOpts: { col: '#eeece4' }, look: { custom: 'wisp', col: '#eeece4' }, knots: 2, pool: POOL,
    pattern: ['heat', 'shroud', 'rest'],
    intro: T('A puff of steam with a scowl in it, hissing at anyone who comes too close to its crack in the rock.', '{岩|いわ} の {割|わ}れ{目|め} に {近|ちか}づく {者|もの} に 、 シュー と {怒|おこ}る 、 {顔|かお} の ある {湯気|ゆげ} 。'),
    settle: T('The wisp sighs itself thin and drifts back into its crack, warm and quiet.', '{湯気坊|ゆげぼう} は {細|ほそ}く {息|いき} を ついて 、 {割|わ}れ{目|め} へ {戻|もど}って いった 。 {温|あたた}かく 、 {静|しず}か に 。') }));
  EN('yn.pebbles', {
    setting: null, name: T('Pebble Stack', '{積|つ}み{石|いし}'), art: 'golem', artOpts: { col: '#8e887c' }, look: { custom: 'golem', col: '#8e887c' }, knots: 3, pool: POOL,
    pattern: ['charge', 'strike', 'rest'],
    intro: T('A little tower of flat stones somebody stacked by the path for luck. Disturb it and it topples onto you, then stacks itself up again, offended.', '{誰|だれ} か が {道|みち} の {脇|わき} に {願掛|がんか}け で {積|つ}んだ {平|ひら}たい {石|いし} の {塔|とう} 。 {触|さわ}る と {崩|くず}れて {倒|たお}れ{込|こ}み 、 {怒|おこ}った よう に また {積|つ}み{上|あ}がる 。'),
    settle: T('The stones settle into a neat stack again, a little lower than before, and stay put.', '{石|いし} は 、 {前|まえ} より {少|すこ}し {低|ひく}く 、 きちんと {積|つ}み{直|なお}って 、 {動|うご}かなく なった 。') });
  EN('yn.toad', Object.assign({}, VENTS, {
    name: T('Sulphur Toad', '{硫黄|いおう}{蛙|がえる}'), art: 'blot', artOpts: { col: '#c8b44e' }, look: { custom: 'blot', col: '#c8b44e' }, knots: 2, pool: POOL,
    pattern: ['sweep', 'strike', 'rest'],
    intro: T('A fat yellow toad squatting in the channel, stirring up the silt with its back feet. The water downstream runs cloudy.', '{湯樋|ゆどい} に {座|すわ}り{込|こ}み 、 {後|うし}ろ{足|あし} で {泥|どろ} を {掻|か}き{回|まわ}す 、 {太|ふと}った {黄色|きいろ} い {蛙|かえる} 。 {下|しも} の {湯|ゆ} が {濁|にご}って いる 。'),
    settle: T('The toad hops out of the channel onto a warm stone and goes to sleep. The water clears.', '{蛙|かえる} は {湯樋|ゆどい} から {温|あたた}かい {石|いし} へ {跳|は}び{出|だ}して 、 {眠|ねむ}って しまった 。 {湯|ゆ} が {澄|す}んで いく 。') }));
  EN('yn.lostguest', {
    setting: null, name: T('Lost Guest', '{迷|まよ}い{客|きゃく}'), art: 'echo', artOpts: { col: '#bcb4cc' }, look: { custom: 'spirit', col: '#bcb4cc' }, knots: 2, pool: POOL,
    pattern: ['plea', 'strike', 'rest'],
    // its plea: which room was mine? Answered by reading its own room tag to it
    intents: {
      plea: { power: 1,
        text: {
          F: { jp: 'へや …… わたし の へや は 、 どこ ？ ふだ に 「たけ 」 って かいて ある けど 。', en: 'My room… where is my room? The tag says "take", but…' },
          E: { jp: '{部屋|へや} が {分|わ}からない ん です 。 {札|ふだ} に 「{竹|たけ} の {間|ま} 」 と {書|か}いて ある ん です が …… 。', en: 'I can\'t find my room. The tag says "Bamboo room", but…' },
          I: { jp: '{部屋|へや} を {忘|わす}れて しまった ん です 。 {札|ふだ} は ある のに 、 {読|よ}めない ん です 。 {何|なん} と {書|か}いて あります か 。', en: 'I\'ve forgotten my room. I have the tag, even though I can\'t read it. What does it say?' },
          A: { jp: '{恐|おそ}れ{入|い}ります が 、 わたくし の {部屋|へや} は 、 どちら で ございましょう 。 {札|ふだ} を お{読|よ}み いただけます か 。', en: 'I beg your pardon, but which might my room be? Would you be so kind as to read my tag?' },
        },
        answer: {
          F: ch({ item: 'v:部屋', prompt: { en: 'Its tag says たけ. Tell it its room.' }, options: [oj('たけ の へや だ よ 。 いっかい の 、 おふろ の ちかく 。', true), oj('まつ の へや だ よ 。', false, 'The tag says たけ, not まつ.')] }),
          E: ch({ item: 'v:部屋', prompt: { en: 'Tell it which room is its own.' }, options: [oj('{竹|たけ} の {間|ま} です 。 {一階|いっかい} の 、 お{風呂|ふろ} の {近|ちか}く です よ 。', true), oj('{梅|うめ} の {間|ま} です 。', false, 'The tag says 竹.'), oj('{部屋|へや} は ありません 。', false, 'It has a room; read it the tag.')] }),
          I: ch({ item: 'g:noni', prompt: { en: 'It holds out the tag: 竹の間. Answer it kindly.' }, options: [oj('{竹|たけ} の {間|ま} と {書|か}いて あります 。 {一緒|いっしょ} に {行|い}きましょう か 。', true), oj('{読|よ}めない のに 、 {札|ふだ} を {持|も}って いる ん です か 。', false, 'True, but unkind.'), oj('{松|まつ} の {間|ま} と {書|か}いて あります 。', false, 'The tag says 竹.')] }),
          A: ch({ item: 'g:yn_omotenashi', prompt: { en: 'Answer it as the inn would.' }, options: [oj('「{竹|たけ} の {間|ま} 」 で ございます 。 ご{案内|あんない} いたします 。', true), oj('「{竹|たけ} の {間|ま} 」 で いらっしゃいます 。', false, 'いらっしゃる honours a person, not a room.'), oj('ご{自分|じぶん} で お{探|さが}し ください 。', false, 'Polite in form, but it sends the guest away.')] }),
        } },
    },
    intro: T('A guest in a yukata, holding a room tag, walking slowly up and down. You can see the steam through it.', '{部屋|へや} の {札|ふだ} を {持|も}って 、 ゆっくり と {行|い}ったり{来|き}たり して いる {浴衣|ゆかた} の {客|きゃく} 。 {体|からだ} の {向|む}こう に {湯気|ゆげ} が {見|み}える 。'),
    settle: T('The guest bows, tucks the tag into its sleeve, and walks off towards the inns, more surely now.', '{客|きゃく} は {頭|あたま} を {下|さ}げ 、 {札|ふだ} を {袖|そで} に しまって 、 {今度|こんど} は しっかり と {宿|やど} の {方|ほう} へ {歩|ある}いて いった 。') });
  EN('yn.towelthief', {
    name: T('Towel Thief', '{手拭|てぬぐ}い{泥棒|どろぼう}'), art: 'moth', artOpts: { col: '#e8e2d0' }, look: { custom: 'moth', col: '#e8e2d0' }, knots: 2, pool: POOL,
    pattern: ['gust', 'strike', 'rest'],
    intro: T('A hand towel that has come alive, flapping like a bird. It wants yours. It wants everyone\'s.', '{生|い}き{物|もの} に なった {手拭|てぬぐ}い 。 {鳥|とり} の よう に バタバタ と {羽|は}ばたく 。 あなた の {手拭|てぬぐ}い が {欲|ほ}しい 。 {皆|みんな} の {手拭|てぬぐ}い が {欲|ほ}しい 。'),
    settle: T('The towel folds itself neatly over a rail and goes still, damp and content.', '{手拭|てぬぐ}い は {物干|ものほ}し に きちんと {掛|か}かって 、 {湿|しめ}った まま {満足|まんぞく} そう に {動|うご}かなく なった 。') });
  EN('yn.chochin', {
    name: T('Stray Lantern', '{迷|まよ}い{提灯|ぢょうちん}'), art: 'lantern', artOpts: { col: '#e8763a' }, look: { custom: 'lanternghost', col: '#e8763a' }, knots: 2, pool: POOL,
    pattern: ['lie', 'heat', 'rest'],
    // what it says: the house rules, wrong; put right by the rules as you read them
    intents: {
      lie: { power: 1, target: 'rand',
        text: {
          F: { jp: 'てぬぐい は 、 ゆぶね に いれて いい よ ！', en: 'Towels can go in the bath!' },
          E: { jp: '{手拭|てぬぐ}い を {湯船|ゆぶね} に {入|い}れて も いい です よ 。', en: 'You may put your towel in the bath, you know.' },
          I: { jp: '{下|しも}の{湯|ゆ} の {露天風呂|ろてんぶろ} は 、 {十二時|じゅうにじ} で {閉|し}まる らしい よ 。', en: 'They say the Lower House\'s open-air bath closes at midnight.' },
          A: { jp: 'ご{入浴|にゅうよく} の {前|まえ} の かけ{湯|ゆ} は 、 ご{遠慮|えんりょ} ください 。', en: 'Please refrain from rinsing before your bath.' },
        },
        truth: {
          F: ch({ item: 'v:手拭い', prompt: { en: 'It says towels can go in the bath. What do the rules say?' }, options: [o('Towels stay out of the water.', true), o('It\'s right.', false, 'Both inns\' rules say the towel stays out.')] }),
          E: ch({ item: 'g:v_temo_ii', prompt: { en: 'What is wrong with what it says?' }, options: [o('The rule is 入れては いけません: towels must not go in.', true), o('Nothing: towels may go in.', false, 'Both notices forbid it.'), o('Only at the Upper House.', false, 'It is the rule at both.')] }),
          I: ch({ item: 'g:rashii', prompt: { en: 'It passes on something heard (らしい). What did the Lower House\'s board say?' }, options: [o('The open-air bath is open all night.', true), o('It closes at midnight.', false, 'Midnight is the Upper House\'s rule.'), o('It closes at ten.', false, 'Ten is when the Upper House swaps sides.')] }),
          A: ch({ item: 'g:yn_omotenashi', prompt: { en: 'It asks you to refrain from rinsing. What did Okiyo actually ask?' }, options: [o('かけ湯をお願いいたします: to rinse before the bath.', true), o('To refrain from bathing.', false, 'She asked you to rinse first, not to stay out.'), o('To rinse after the bath only.', false, 'Before: ご入浴の前に.')] }),
        } },
    },
    intro: T('A paper festival lantern that has drifted off its street, still lit, bobbing from eave to eave and telling everyone the house rules, wrong.', '{通|とお}り を {離|はな}れて {漂|ただよ}う 、 {火|ひ} の {点|つ}いた {祭|まつ}り の {提灯|ちょうちん} 。 {軒|のき} から {軒|のき} へ ふわふわ と {飛|と}び 、 {宿|やど} の {決|き}まり を {間違|まちが}えて {触|ふ}れ{回|まわ}る 。'),
    settle: T('The lantern drifts back to its street and hangs itself on an empty hook, glowing steadily.', '{提灯|ちょうちん} は {自分|じぶん} の {通|とお}り へ {戻|もど}り 、 {空|あ}いた {鉤|かぎ} に {掛|か}かって 、 {静|しず}か に {灯|とも}った 。') });

  // the Kettle Below (the chapter's boss: a social encounter; settled, never defeated)
  EN('yn.kettle', Object.assign({}, VENTS, {
    name: T('The Kettle Below', '{釜|かま}の{主|ぬし}'), art: 'golem', artOpts: { col: '#3e3c42' }, look: { custom: 'golem', col: '#3e3c42' }, knots: 6, pool: POOL, boss: true, music: 'yn_kettle',
    pattern: ['charge', 'chill', 'rest'],
    intro: T('A great black shape like an iron kettle the size of a house, sunk in the boiling pool and shaking. It rattles its lid at you, the way a frightened animal shows its teeth.', '{家|いえ} ほど も ある {鉄|てつ} の {釜|かま} の よう な {黒|くろ}い {影|かげ} が 、 {煮|に}え{立|た}つ {湯|ゆ} に {沈|しず}んで {震|ふる}えて いる 。 {怯|おび}えた {獣|けもの} が {牙|きば} を {見|み}せる よう に 、 {蓋|ふた} を {鳴|な}らす 。'),
    settle: T('The Kettle sinks to the bottom of its pool and breathes out warm steam, just right.', '{釜|かま}の{主|ぬし} は {湯|ゆ} の {底|そこ} に {沈|しず}み 、 ちょうど いい {温|あたた}かい {湯気|ゆげ} を {吐|は}いた 。') }));

  Object.assign(C.reviewEnemies = C.reviewEnemies || {}, { 'yn.steamwisp': 'yn', 'yn.pebbles': 'yn', 'yn.toad': 'yn', 'yn.lostguest': 'yn', 'yn.towelthief': 'yn', 'yn.chochin': 'yn', 'yn.kettle': 'yn' });
  if (RB.creaturesA && RB.creaturesA.auditEnemy) {
    const note = 'interim: a Steamhollow creature (P13) drawn on an existing family with its own palette; its own family is P16 art work (AC-1, C-82)';
    for (const [id, art] of [['yn.steamwisp', 'wisp'], ['yn.pebbles', 'golem'], ['yn.toad', 'blot'], ['yn.lostguest', 'echo'], ['yn.towelthief', 'moth'], ['yn.chochin', 'lantern'], ['yn.kettle', 'golem']]) RB.creaturesA.auditEnemy(id, art, 'incomplete', note);
  }

  // ---- the Towel Thief and the towel you were lent (E6: protect it) ----------------------------------------------
  C.encounters['yn.towel'] = {
    id: 'yn.towel', name: say('{手拭|てぬぐ}い を {守|まも}る', 'Keep your towel'),
    lead: { enemy: 'yn.towelthief', pattern: ['gust', 'strike:towel', 'rest', 'strike:towel'], intents: { 'strike:towel': { target: 'o:towel' } } },
    group: { normal: ['yn.steamwisp'], hard: ['yn.steamwisp', 'yn.pebbles'] },
    actors: [{ aid: 'o:towel', side: 'object', name: say('{手拭|てぬぐ}い', 'your towel'), hp: 3, protectable: true }],
    objective: { kind: 'protect', aid: 'o:towel', text: say('{手拭|てぬぐ}い を {守|まも}る', 'Keep the Upper House\'s towel from the Towel Thief until it settles or gives up.') },
    settleWins: true,
    conclusions: [
      { id: 'taken', when: { down: 'o:towel' }, result: 'end', text: { en: 'The Towel Thief makes off with your towel and drapes it over a paddy\'s scarecrow. You fetch it back, muddy, and rinse it in the footbath.' } },
      { id: 'kept', when: { settled: 'all' }, result: 'win', text: { en: 'Your towel is still round your neck.' }, flags: { yn_towel_kept: true } },
      { id: 'held', when: { all: [{ rounds: 6 }, { standing: 'o:towel' }] }, result: 'win', text: { en: 'The Towel Thief gives up and flaps off after someone else\'s.' }, flags: { yn_towel_kept: true } },
    ],
  };

  // ---- the Kettle Below (social; no Unravel, C-09) -----------------------------------------------------------------
  // What frightens it, revealed by listening: the shouting above, the silence from the ridge, its own choked throat
  // (the silt; cleared if you found the float); what it wants (said only into a silence): talk.
  C.encounters['yn.kettle'] = {
    id: 'yn.kettle', kind: 'social', name: say('{釜|かま}の{主|ぬし}', 'The Kettle Below'),
    lead: { enemy: 'yn.kettle' },
    rules: { wait: true },
    autoRoute: ['s:hush', 's:cleared', 's:ridge', 'wait', 's:promise'],
    social: {
      parties: [{ aid: 'n:kettle', name: say('{釜|かま}の{主|ぬし}', 'the Kettle Below'), stance: 'heated', wants: { en: 'Neither shouting nor silence.' } }],
      claims: {
        above: { by: 'n:kettle', jp: '{上|うえ} から 、 {怒鳴|どな}り{声|ごえ} が {降|ふ}って くる 。 {降|ふ}って くる 。 {降|ふ}って くる 。', en: 'Shouting pours down from above. Pours down. Pours down.' },
        ridge: { by: 'n:kettle', jp: '{尾根|おね} から は 、 {何|なに} の {音|おと} も {来|こ}ない 。 {冷|つめ}たい 。 {冷|つめ}たい の が 、 {近|ちか}づいて くる 。', en: 'From the ridge, no sound at all. Cold. The cold is coming closer.', hidden: true },
        throat: { by: 'n:kettle', jp: '{喉|のど} が 、 {詰|つ}まって いた 。 {息|いき} が 、 できなかった 。', en: 'My throat was choked. I couldn\'t breathe.', hidden: true },
        wish: { by: 'n:kettle', jp: '…… {話|はな}す {声|こえ} が {好|す}き だ 。 {怒鳴|どな}る の で も 、 {黙|だま}る の で も ない 。 {話|はな}す {声|こえ} が 、 {一番|いちばん} {温|あたた}かい 。', en: '…I like the sound of talking. Not shouting, not silence. Talking is the warmest sound.', hidden: true },
      },
      understanding: 4,
      gesture: { name: say('{湯|ゆ} に {手|て} を {入|い}れる', 'Put your hands in the water'), desc: 'With your companion, kneel and rest your hands in the water, as Aki does.', effect: { understanding: 1, stance: { 'n:kettle': 'listening' } }, once: true, says: { en: 'You kneel at the edge and rest your hands in the water, the way Aki reads it. Hot, then less hot. Under your palms the rattling slows.' } },
      unravelTip: { en: 'Nothing here is knotted. It is frightened; find out of what.' },
      actions: [
        { id: 'hush', kind: 'restate', label: say('{大丈夫|だいじょうぶ} 。 ゆっくり 、 {息|いき} を して 。', 'Speak to it softly'),
          task: task('g:v_te_kudasai', 'Which speaks to it softly and calmly?', '{大丈夫|だいじょうぶ} 。 ゆっくり 、 {息|いき} を して 。', '{静|しず}か に しろ ！ {震|ふる}える な ！', 'Shouting at it is what frightened it.', '…………', 'Silence chills it; say something.'),
          cases: [{ when: { stance: { 'n:kettle': 'heated' } }, effect: { stance: { 'n:kettle': 'listening' }, understanding: 1 }, says: { en: 'The rattling slows. The bubbles in the pool grow smaller.' } }],
          says: { en: 'It is already listening, its lid barely moving.' } },
        { id: 'cleared', kind: 'evidence', label: say('{湯樋|ゆどい} の {泥|どろ} は 、 {取|と}りました 。', 'Tell it the channel\'s silt is cleared'), once: true, when: { state: 'yn_float_found' },
          task: task('v:泥', 'Which tells it the silt in the channel has been cleared?', '{湯樋|ゆどい} の {泥|どろ} は 、 {取|と}りました 。', '{湯樋|ゆどい} に 、 {泥|どろ} を {入|い}れました 。', 'That says you put silt in.', '{湯樋|ゆどい} の {泥|どろ} は 、 まだ あります 。', 'You did clear it.'),
          effect: { reveal: 'throat', understanding: 1 }, says: { en: 'The Kettle draws a long, rattling breath, then another, easier. "My throat was choked," it says. "I couldn\'t breathe."' } },
        { id: 'ridge', kind: 'ask', label: say('{尾根|おね} の {方|ほう} から は 、 {何|なに} が {聞|き}こえます か 。', 'Ask what it hears from the ridge'), once: true, when: { stance: { 'n:kettle': 'listening' } },
          task: task('v:聞く', 'Which asks what it hears from the direction of the ridge?', '{尾根|おね} の {方|ほう} から は 、 {何|なに} が {聞|き}こえます か 。', '{尾根|おね} の {方|ほう} へ 、 {行|い}きます か 。', 'That asks if it will go there.', '{尾根|おね} の {方|ほう} は 、 {何|なに} {色|いろ} です か 。', 'Ask what it hears, not what colour.'),
          effect: { reveal: 'ridge', understanding: 1 }, says: { en: 'The Kettle turns, slowly, towards the north wall. "Nothing. No sound at all. Cold. And the cold is coming closer."' } },
        { id: 'promise', kind: 'propose', label: say('{明日|あした} 、 {町|まち} の {人|ひと} たち は 、 {怒鳴|どな}らず に {話|はな}し{合|あ}います 。', 'Promise it the town will talk tomorrow, without shouting'), when: { claims: ['above', 'ridge'] },
          task: task('g:v_masu', 'Which promises that the town will talk it out tomorrow without shouting?', '{明日|あした} 、 {町|まち} の {人|ひと} たち は 、 {怒鳴|どな}らず に {話|はな}し{合|あ}います 。', '{明日|あした} から 、 {町|まち} の {人|ひと} たち は 、 もう {何|なに} も {話|はな}しません 。', 'Silence would chill it: the very cold it fears.', '{明日|あした} 、 {町|まち} の {人|ひと} たち は 、 もっと {大|おお}きな {声|こえ} で {話|はな}します 。', 'Louder is what frightened it.'),
          effect: { flag: 'promised', understanding: 1 }, says: { en: '"Talking," the Kettle repeats, as if tasting the word. "Not shouting. Not silence." Its lid settles with a soft clink.' } },
        { id: 'shout', kind: 'propose', label: say('{静|しず}か に しろ ！', 'Shout at it to be quiet'), lasting: true, means: { en: 'You will shout at it.' },
          task: task('g:register_polite_plain', 'Which shouts at it to be quiet?', '{静|しず}か に しろ ！', '{静|しず}か に して ください 。', 'That is a polite request, not a shout.', '{静|しず}か です ね 。', 'That remarks that it is quiet.'),
          effect: { stance: { 'n:kettle': 'heated' } }, says: { en: 'The pool roars up in a column of steam. The Kettle rattles harder than ever.' } },
      ],
      responses: {
        water: { effect: { stance: { 'n:kettle': 'listening' } }, says: { en: 'You pour cool water from your flask into the pool\'s edge. The steam hisses, then settles.' } },
        unravel: { says: { en: 'There is nothing to untangle. It is not a knot; it is afraid.' } },
      },
      wait: { when: { stance: { 'n:kettle': 'listening' } }, effect: { reveal: 'wish', understanding: 1 }, says: { en: 'In the quiet, the Kettle speaks: "…I like the sound of talking. Not shouting, not silence. Talking is the warmest sound."' } },
      companion: {
        nao: [{ id: 'nao_steady', name: say('{馬|うま} を {落|お}ち{着|つ}かせる よう に', 'Stand steady, as with a horse'), desc: 'Nao has calmed frightened pack horses on narrow roads.', once: true, effect: { understanding: 1, stance: { 'n:kettle': 'listening' } }, says: { en: 'Nao steps up to the edge, slow, unhurried, the way you stand by a horse about to bolt. "Easy. Easy." The rattling slows.' } }],
        mio: [{ id: 'mio_cool', name: say('{熱|ねつ} を {冷|さ}ます', 'Cool the fever'), desc: 'Mio treats it like a fever.', once: true, effect: { understanding: 1, stance: { 'n:kettle': 'listening' } }, says: { en: 'Mio wets a cloth in the cooler water at the edge and lays it on the Kettle\'s rim, as on a fevered forehead. The steam thins.' } }],
        ren: [{ id: 'ren_name', name: say('{古|ふる}い {名前|なまえ} で {呼|よ}ぶ', 'Call it by its old name'), desc: 'Ren read the name carved in the deep vents.', once: true, effect: { understanding: 2, stance: { 'n:kettle': 'listening' } }, says: { en: 'Ren kneels and calls it by the name in the old carving: "Master of the Kettle." The Kettle stops shaking for a moment, as if no one had called it anything in a very long time.' } }],
        suzu: [{ id: 'suzu_lullaby', name: say('{子守唄|こもりうた} を {歌|うた}う', 'Sing it a lullaby'), desc: 'Suzu knows the troupe\'s lullaby for frightened children backstage.', once: true, effect: { understanding: 1, stance: { 'n:kettle': 'listening' } }, says: { en: 'Suzu sings, very softly, the lullaby the troupe sang to frightened children backstage. The bubbles keep time, slower and slower.' } }],
      },
      drift: [{ when: { all: [{ rounds: 2 }, { stance: { 'n:kettle': 'heated' } }] }, once: true, effect: {}, says: { en: 'Far above, through the rock, shouting. The Kettle flinches and the pool boils over the edge.' } }],
    },
    conclusions: [
      { id: 'settled', when: { all: [{ flag: 'promised' }, { understanding: 3 }] }, result: 'win', text: { en: 'The Kettle Below settles to the bottom of its pool, breathing warm steam, just right.' }, flags: { yn_kettle_promised: true } },
      { id: 'heard', when: { understanding: 4 }, result: 'win', text: { en: 'The Kettle has been heard, and that is most of what it needed. It sinks, and the water stills.' } },
      { id: 'dozes', when: { rounds: 9 }, result: 'win', text: { en: 'Worn out with shaking, the Kettle sinks and dozes, uneasy but quiet. It will listen for the town tomorrow.' } },
    ],
  };

  // ---- the wanderer (E3): Aki, the bath-keeper ---------------------------------------------------------------------
  C.encounters['yn.wander_aki'] = {
    id: 'yn.wander_aki', name: say('{濁|にご}った {湯樋|ゆどい}', 'The muddied channel'),
    lead: { enemy: 'yn.toad', knots: 2 },
    actors: [{
      aid: 'g:aki', side: 'guest', name: say('アキ', 'Aki'), hp: 3,
      agenda: { wants: 'help', act: { kind: 'ward', on: 'pc', n: 1 }, leavesWhen: { rounds: 4 } },
      lines: {
        arrive: say('{湯|ゆ} を {濁|にご}す {奴|やつ} は 、 {許|ゆる}さない ！', '"Nobody muddies my water!" Aki comes splashing down the channel, a long wooden paddle in her hands.'),
        act: say('アキ は {櫂|かい} で {泥|どろ} を {押|お}し{戻|もど}し 、 {湯|ゆ} の {流|なが}れ を {守|まも}る 。', 'Aki shoves the silt back with her paddle and keeps the water running clear.'),
        leave: say('{湯|ゆ} の {顔色|かおいろ} が 、 {少|すこ}し {戻|もど}った 。 …… {奥|おく} の {釜|かま} の {所|ところ} で 、 {待|ま}って いる 。', '"The water\'s colour is coming back a little. …I\'ll be waiting by the Kettle." She wades off upstream.'),
      },
    }],
    conclusions: [{ id: 'won', when: { settled: 'all' }, result: 'win', text: { en: 'The toad hops off onto a warm stone, and the channel runs clear again.' }, flags: { yn_aki_met: true } }],
  };
})(RB.content);
