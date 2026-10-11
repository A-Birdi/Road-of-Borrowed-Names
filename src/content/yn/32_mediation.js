/* Steamhollow, Chapter 11: the mediation (expansion P13e; plan R3 "the inns' feud, the chapter climax", E8, C14; sealed
 * S4). At the guild hall's long table: Oritsu for the Upper House, Tahei for the Lower House, Rokubei for the
 * bath-keepers, and Aki speaking for the spring. Each house believes the other takes the water; the truth is in three
 * places nobody has looked together: the guild's ledger (the switch drifting later every day), the water clock's float
 * jammed in silt (found in the vents: nobody stole anything), and the floors of both inns, where both have been quietly
 * housing the ridge folk free. The spring itself (Aki's reading) wants neither shouting nor silence: talk.
 *
 * Conclusions (every one moves the story on; none is a defeat):
 *   together   the clock mended, a bath for the newcomers paid by both houses, and the open-air bath left honestly
 *              unsettled, to be argued once a month at the hall: the disagreement kept, in writing (S4).
 *   measured   the clock mended and the half-days restored; the houses still cool to each other, the newcomers'
 *              bath left for the guild to arrange.
 *   open       nothing settled but that they differ, written down, with a monthly meeting: honest, if thin.
 *   adjourned  Rokubei closes the session ("next month"); the agreement records only that they will meet again.
 * The written agreement and 全体 follow in 24_scenes_mediation.js. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  C.encounters = C.encounters || {};
  const say = (jp, en) => ({ jp, en });
  const ch = (o) => Object.assign({ kind: 'choose' }, o);
  function task(item, en, ok, w1, why1, w2, why2) {
    const low = ch({ item, prompt: { en }, options: [{ jp: ok, ok: true }, { jp: w1, ok: false, why: { en: why1 } }] });
    const high = ch({ item, prompt: { en: en + ' (Read them closely: two are near.)' },
      options: [{ jp: ok, ok: true }, { jp: w1, ok: false, why: { en: why1 } }, { jp: w2, ok: false, why: { en: why2 } }] });
    return { F: low, E: low, I: high, A: high };
  }

  C.encounters['yn.mediation'] = {
    id: 'yn.mediation', kind: 'social', name: say('{湯|ゆ} の {寄合|よりあい}', 'The spring meeting'),
    rules: { wait: true },
    // the automated runs' route: calm them, the ledger, the float, the ridge folk, the spring, the whole proposal
    autoRoute: ['s:calm', 's:ledger', 's:float', 's:ridge', 'wait', 's:together'],
    social: {
      parties: [
        { aid: 'n:oritsu', name: say('オリツ', 'Oritsu'), stance: 'heated', wants: { en: 'Enough water for a full house, and the Upper House\'s name respected.' } },
        { aid: 'n:tahei', name: say('タヘエ', 'Tahei'), stance: 'heated', wants: { en: 'His fair share, and not to be looked down on.' } },
        { aid: 'n:rokubei', name: say('ロクベエ', 'Rokubei'), stance: 'listening', wants: { en: 'The channels kept, and nobody blaming the bath-keepers.' } },
        { aid: 'n:aki', name: say('アキ （{湯|ゆ} の {代|か}わり ）', 'Aki (for the spring)'), stance: 'closed', wants: { en: 'For the water: neither shouting nor silence.' } },
      ],
      claims: {
        bath: { by: 'n:oritsu', jp: '{下|しも}の{湯|ゆ} の {露天風呂|ろてんぶろ} が 、 {湯|ゆ} を {多|おお}く {使|つか}って いる の で ございます 。', en: 'Oritsu: "The Lower House\'s open-air bath uses more than its share."' },
        guests: { by: 'n:tahei', jp: '{上|かみ}の{湯|ゆ} は {客|きゃく} を {倍|ばい} に して 、 {湯|ゆ} を {多|おお}く {取|と}って いる ！', en: 'Tahei: "The Upper House doubled its guests and takes more water!"' },
        drift: { by: 'ledger', jp: '{切|き}り{替|か}え の {時刻|じこく} が 、 {毎日|まいにち} {少|すこ}し ずつ {遅|おく}れて いた 。', en: 'The guild\'s ledger: the switch between the houses has come a little later every day.', hidden: true },
        silt: { by: 'float', jp: '{水時計|みずどけい} の {浮|う}き が 、 {泥|どろ} で {止|と}まって いた 。 {誰|だれ} も {湯|ゆ} を {盗|ぬす}んで いない 。', en: 'The water clock\'s float was jammed in silt. Nobody stole any water.', hidden: true },
        ridge: { by: 'both', jp: '{上|かみ}の{湯|ゆ} も {下|しも}の{湯|ゆ} も 、 {尾根|おね} の {人|ひと} たち を 、 {黙|だま}って {無料|むりょう} で {泊|と}めて いた 。', en: 'Both houses have been quietly putting up the ridge folk for nothing, and neither said so.', hidden: true },
        spring: { by: 'n:aki', jp: '{湯|ゆ} は 、 {怒鳴|どな}れば {熱|あつ}く 、 {黙|だま}れば {冷|つめ}たく なる 。 {話|はな}し{合|あ}って いる {時|とき} が 、 {一番|いちばん} ちょうど いい 。', en: 'Aki: "The water goes hot when you shout and cold when you go quiet. It\'s just right when people are talking."', hidden: true },
      },
      understanding: 4,
      gesture: { name: say('{湯|ゆ} を {一杯|いっぱい} ずつ', 'A cup of spring water each'), desc: 'With your companion, set a cup of the spring\'s water before each of them.', effect: { stance: { 'n:oritsu': 'listening', 'n:tahei': 'listening' } }, once: true, says: { en: 'A cup of the spring\'s water before each of them: just warm. Oritsu holds hers in both hands. Tahei drinks his in one go.' } },
      unravelTip: { en: 'Nothing is knotted. What is tangled is what each house believes about the other: look at what was written, what was found, and what neither has said.' },
      actions: [
        { id: 'calm', kind: 'restate', label: say('お{一人|ひとり} ずつ 、 お{話|はな}し ください 。', 'Ask them to speak one at a time'),
          task: task('g:yn_omotenashi', 'Which asks them, politely, to speak one at a time?', 'お{一人|ひとり} ずつ 、 お{話|はな}し ください 。', 'お{二人|ふたり} で 、 {一緒|いっしょ} に お{話|はな}し ください 。', 'That invites them to talk over each other.', '{静|しず}か に して ください 。 {話|はな}さないで 。', 'Silence chills the water; and it stops the talking you came for.'),
          cases: [{ when: { stance: { 'n:oritsu': 'heated' } }, effect: { stance: { 'n:oritsu': 'listening' } }, says: { en: 'Oritsu folds her hands in her lap. "Very well."' } },
            { when: { stance: { 'n:tahei': 'heated' } }, effect: { stance: { 'n:tahei': 'listening' } }, says: { en: 'Tahei grunts and sits back.' } }],
          says: { en: 'They are already taking turns.' } },
        { id: 'ledger', kind: 'evidence', label: say('{湯守|ゆもり} の {帳面|ちょうめん} を {読|よ}んで ください 。', 'Ask Rokubei to read from the guild\'s ledger'), once: true, when: { state: 'item.yn_ledger' },
          task: task('g:v_te_kudasai', 'Which asks Rokubei to read out the ledger?', '{湯守|ゆもり} の {帳面|ちょうめん} を {読|よ}んで ください 。', '{湯守|ゆもり} の {帳面|ちょうめん} を {書|か}き{直|なお}して ください 。', 'That asks him to rewrite it.', '{湯守|ゆもり} の {帳面|ちょうめん} を {捨|す}てて ください 。', 'That asks him to throw it away.'),
          effect: { reveal: 'drift', understanding: 1 }, says: { en: 'Rokubei reads: the switch was at noon a month ago, and every day since a little later. Both houses frown at the same page.' } },
        { id: 'float', kind: 'evidence', label: say('{抜|ぬ}け{穴|あな} で {見|み}つけた {浮|う}き の こと を {話|はな}す', 'Tell them about the float you found in the vents'), once: true, when: { state: 'yn_float_found' },
          task: task('g:passive', 'Which says the float had been stopped by silt?', '{水時計|みずどけい} の {浮|う}き は 、 {泥|どろ} に {止|と}められて いました 。', '{水時計|みずどけい} の {浮|う}き は 、 {誰|だれ} か に {盗|ぬす}まれて いました 。', 'Nobody stole it: the silt stopped it.', '{水時計|みずどけい} の {浮|う}き は 、 {新|あたら}しく {作|つく}られました 。', 'It wasn\'t made new; it was stuck.'),
          effect: { reveal: 'silt', understanding: 1, stance: { 'n:oritsu': 'listening', 'n:tahei': 'listening' } }, says: { en: 'Silence round the table. "Silt," Tahei says at last. "So nobody…" Oritsu finishes it: "…took anything."' } },
        { id: 'ridge', kind: 'ask', label: say('{尾根|おね} の {人|ひと} たち は 、 どこ に {泊|と}まって います か 。', 'Ask where the ridge folk are sleeping'), once: true, when: { stance: { 'n:oritsu': 'listening', 'n:tahei': 'listening' } },
          task: task('g:prt_ni', 'Which asks where the ridge folk are staying?', '{尾根|おね} の {人|ひと} たち は 、 どこ に {泊|と}まって います か 。', '{尾根|おね} の {人|ひと} たち は 、 いつ {帰|かえ}ります か 。', 'That asks when they\'ll leave.', '{尾根|おね} の {人|ひと} たち は 、 {誰|だれ} です か 。', 'You know who they are; ask where they sleep.'),
          effect: { reveal: 'ridge', understanding: 1 }, says: { en: 'A pause. "…Six on our floor," Tahei mutters. "Free." Oritsu, very quietly: "The Bamboo room and the Annex. Free as well." They look at each other for the first time.' } },
        { id: 'spring', kind: 'ask', label: say('アキ さん 、 {湯|ゆ} は どう したい と {思|おも}います か 。', 'Ask Aki what the spring wants'), once: true,
          task: task('g:v_tai', 'Which asks Aki what she thinks the spring wants?', 'アキ さん 、 {湯|ゆ} は どう したい と {思|おも}います か 。', 'アキ さん 、 {湯|ゆ} を {止|と}めて ください 。', 'That asks her to stop the spring.', 'アキ さん は 、 どちら の {味方|みかた} です か 。', 'That asks her to take a side.'),
          effect: { reveal: 'spring', understanding: 1, stance: { 'n:aki': 'listening' } }, says: { en: 'Aki puts her hand flat on the table, as if on the water. "It goes hot when you shout and cold when you go silent. It\'s just right while people are talking."' } },
        { id: 'together', kind: 'propose', label: say('{時計|とけい} で {分|わ}け 、 {尾根|おね} の {人|ひと} の {湯|ゆ} を {一緒|いっしょ} に {作|つく}り 、 {露天風呂|ろてんぶろ} の こと は {月|つき} に {一度|いちど} {話|はな}し{合|あ}いましょう 。', 'Propose: share by the mended clock, build a bath for the ridge folk together, and argue the open-air bath once a month'), when: { claims: ['silt', 'ridge', 'spring'] },
          task: task('g:v_mashou', 'Which proposes all three: the clock, a shared bath for the ridge folk, and a monthly talk about the open-air bath?', '{時計|とけい} で {分|わ}け 、 {尾根|おね} の {人|ひと} の {湯|ゆ} を {一緒|いっしょ} に {作|つく}り 、 {露天風呂|ろてんぶろ} の こと は {月|つき} に {一度|いちど} {話|はな}し{合|あ}いましょう 。', '{時計|とけい} で {分|わ}け 、 {露天風呂|ろてんぶろ} は {壊|こわ}しましょう 。', 'Nobody has the right to decide that for Tahei.', '{露天風呂|ろてんぶろ} の こと は 、 もう {誰|だれ} も {話|はな}さない こと に しましょう 。', 'Burying it is the silence the spring can\'t bear.'),
          effect: { flag: 'together' }, says: { en: 'Oritsu: "I do not agree about the open-air bath." Tahei: "Nor me about anything she says." Rokubei: "Then write that down too." And slowly, they both nod.' } },
        { id: 'measured', kind: 'propose', label: say('{直|なお}した {時計|とけい} で 、 {半日|はんにち} ずつ に {戻|もど}しましょう 。', 'Propose going back to half a day each by the mended clock'), when: { claims: ['silt'] },
          task: task('g:v_mashou', 'Which proposes going back to half a day each by the mended clock?', '{直|なお}した {時計|とけい} で 、 {半日|はんにち} ずつ に {戻|もど}しましょう 。', '{時計|とけい} は {使|つか}わず に 、 {好|す}き な だけ {取|と}りましょう 。', 'That would start the quarrel again.', '{直|なお}した {時計|とけい} で 、 {上|かみ}の{湯|ゆ} だけ に {流|なが}しましょう 。', 'That gives it all to one house.'),
          effect: { flag: 'measured' }, says: { en: 'Tahei: "If the clock runs true, I\'ve no complaint." Oritsu inclines her head, a fraction.' } },
        { id: 'open', kind: 'propose', label: say('{意見|いけん} が {違|ちが}う まま で いい 。 {違|ちが}う と 、 {紙|かみ} に {書|か}きましょう 。', 'Propose writing down that they disagree, and meeting monthly'), when: { any: [{ claims: 'drift' }, { claims: 'spring' }] },
          task: task('g:v_mashou', 'Which proposes writing down that they disagree?', '{意見|いけん} が {違|ちが}う まま で いい 。 {違|ちが}う と 、 {紙|かみ} に {書|か}きましょう 。', '{意見|いけん} は {同|おな}じ だ と 、 {紙|かみ} に {書|か}きましょう 。', 'That writes down something untrue.', '{意見|いけん} が {違|ちが}う なら 、 {話|はな}す の を やめましょう 。', 'That is silence again.'),
          effect: { flag: 'open' }, says: { en: 'Rokubei: "Differing, and saying so on paper. …That\'s more than we\'ve had in years."' } },
        { id: 'side', kind: 'propose', label: say('{上|かみ}の{湯|ゆ} が {悪|わる}い と {思|おも}います 。', 'Say the Upper House is to blame'), lasting: true, means: { en: 'You will side with the Lower House against the Upper House.' },
          task: task('g:prt_ga', 'Which says the Upper House is to blame?', '{上|かみ}の{湯|ゆ} が {悪|わる}い と {思|おも}います 。', '{上|かみ}の{湯|ゆ} は {悪|わる}く ない と {思|おも}います 。', 'That defends them.', '{上|かみ}の{湯|ゆ} が {悪|わる}い か どうか 、 {分|わ}かりません 。', 'That says you don\'t know.'),
          effect: { stance: { 'n:oritsu': 'leaving' } }, says: { en: 'Oritsu rises, bows precisely, and leaves the hall. Under the floor, the water grumbles.' } },
      ],
      responses: {
        water: { when: { any: [{ stance: { 'n:oritsu': 'heated' } }, { stance: { 'n:tahei': 'heated' } }] }, effect: { stance: { 'n:oritsu': 'listening', 'n:tahei': 'listening' } }, says: { en: 'A cup of water each. The voices drop.' } },
        unravel: { says: { en: 'Nothing here is knotted. The trouble is in what each house believes about the other.' } },
      },
      // Wait: Aki speaks into a silence, for the spring
      wait: { when: { stance: { 'n:aki': 'closed' } }, effect: { reveal: 'spring', stance: { 'n:aki': 'listening' } }, says: { en: 'In the quiet, Aki speaks for the first time: "The water goes hot when you shout and cold when you go silent. It\'s just right while people are talking."' } },
      companion: {
        nao: [{ id: 'nao_sit', name: say('{座|すわ}って {待|ま}つ', 'Sit and wait'), desc: 'Nao, who is bad at sitting still, sits still.', once: true, effect: { understanding: 1, stance: { 'n:tahei': 'listening' } }, says: { en: 'Nao sits down at the end of the table, arms folded, and simply waits. After a while Tahei, embarrassed, lowers his voice.' } }],
        mio: [{ id: 'mio_guests', name: say('{客|きゃく} の {体|からだ} の {話|はなし}', 'Speak for the guests\' health'), desc: 'Mio says who is really hurt by water running hot and cold.', once: true, effect: { understanding: 1, stance: { 'n:oritsu': 'listening' } }, says: { en: 'Mio: "Last night a woman from the ridge collapsed when the water ran hot. Whoever is right, it\'s the guests who get hurt." Oritsu lowers her eyes.' } }],
        ren: [{ id: 'ren_oldest', name: say('{一番|いちばん} {古|ふる}い {言葉|ことば}', 'Read the oldest words'), desc: 'Ren reads the carving on the divider\'s model.', once: true, effect: { understanding: 1, stance: { 'n:oritsu': 'listening', 'n:tahei': 'listening' } }, says: { en: 'Ren reads the old carving aloud: "One spring, two houses." Then: "Not one house. Not two springs." Both of them look at the model.' } }],
        suzu: [{ id: 'suzu_school', name: say('{寺子屋|てらこや} の {話|はなし}', 'Bring up their old school'), desc: 'Suzu heard on the bridge that they were rivals at handwriting.', once: true, effect: { understanding: 1, stance: { 'n:oritsu': 'listening', 'n:tahei': 'listening' } }, says: { en: 'Suzu: "I hear you two were the best handwriting in the village school, and never agreed who was better." Oritsu, despite herself: "I was." Tahei: "Like fun you were." Someone at the door laughs.' } }],
      },
      drift: [
        { when: { all: [{ rounds: 2 }, { stance: { 'n:oritsu': 'heated', 'n:tahei': 'heated' } }] }, once: true, effect: {}, says: { en: 'Their voices rise together. Under the floor the water rumbles, and the cups on the table tremble.' } },
        { when: { stance: { 'n:oritsu': 'listening', 'n:tahei': 'listening' } }, once: true, effect: { understanding: 1 }, says: { en: 'Both of them are listening now. Under the floor, the rumble settles to a murmur.' } },
      ],
    },
    conclusions: [
      { id: 'walked_out', when: { left: 'n:oritsu' }, result: 'win', text: { en: 'Rokubei closes the session. "Next month, at this table." The agreement will say only that they will meet again; it is something.' }, flags: { yn_med_left: true } },
      { id: 'together', when: { flag: 'together' }, result: 'win', text: { en: 'The clock mended; a bath for the ridge folk, built and paid for by both houses; and the open-air bath left honestly unsettled, to be argued once a month at this table.' } },
      { id: 'measured', when: { flag: 'measured' }, result: 'win', text: { en: 'The mended clock will divide the water half a day each, as it always did. The houses are still cool to each other.' } },
      { id: 'open', when: { flag: 'open' }, result: 'win', text: { en: 'Nothing settled but that they differ, and that they will say so to each other once a month.' } },
      { id: 'adjourned', when: { rounds: 9 }, result: 'win', text: { en: 'Rokubei closes the session. "Next month, at this table." It is a beginning.' } },
    ],
  };
})(RB.content);
