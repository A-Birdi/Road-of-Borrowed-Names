/* Lanternfall in twelve-chapter journeys (Chapter 8 there; expansion P11; plan 03_ENCOUNTERS.md E23): three more
 * kinds of creature, met only in a twelve-chapter journey (`ed>=2` on their placements).
 *   lf.mimic    Notice-Board Mimic, in the stacks: a False promise ("everyone agreed") and a Plea (to be read).
 *   lf.queue    Queue Spirit, in the stacks: Waiting, and Waiting, and then the whole queue surges (a Sweep).
 *   lf.weevil   Ledger Weevil, in the tower: Re-tying from the records, Gathering, then a Strike.
 * Interim art on existing families with their own palettes (F-36's rule; their own families are P16 art under AC-1,
 * C-82). The six-chapter game's Lanternfall is unchanged. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const EN = C.enemies;
  const o = (en, ok, why) => (why ? { en, ok, why: { en: why } } : { en, ok });
  const oj = (jp, ok, why) => (why ? { jp, ok, why: { en: why } } : { jp, ok });
  const ch = (x) => Object.assign({ kind: 'choose' }, x);
  const pool = EN['lf.stamp'] && EN['lf.stamp'].pool;

  EN['lf.mimic'] = { setting: 'indoor', name: { en: 'Notice-Board Mimic', jp: '{掲示板|けいじばん} の {化|ば}け{物|もの}' }, art: 'clerk', artOpts: { col: '#c8b48a' }, look: { custom: 'spirit', col: '#c8b48a' },
    region: 'lanternfall', bg: 'belltower', knots: 2, pool, pattern: ['lie', 'plea', 'rest'],
    intents: {
      lie: { power: 1, target: 'rand',
        text: {
          F: { jp: 'みんな さんせい 。 はんたい は ない 。', en: 'Everyone agrees. Nobody is against.' },
          E: { jp: '{全員|ぜんいん} {賛成|さんせい} です 。 {反対|はんたい} は ありません 。', en: 'Everyone is in favour. There are no objections.' },
          I: { jp: '{本日|ほんじつ} の {会議|かいぎ} は 、 {全員|ぜんいん} {賛成|さんせい} で {決|き}まりました 。 {反対|はんたい} の {意見|いけん} は 、 {一|ひと}つ も ありません でした 。', en: 'Today\'s meeting was decided unanimously. There was not a single objection.' },
          A: { jp: '{全員|ぜんいん} が 「かしこまりました」 と {答|こた}えた 。 よって 、 {反対|はんたい} は なかった もの と する 。', en: 'Everyone answered "Certainly". It is therefore taken that there was no objection.' },
        },
        truth: {
          F: ch({ item: 'c:lf_mimic_f', prompt: { en: 'The notice says everyone agrees. What do you know about this town?' }, options: [o('Nobody here can say はんたい (against): saying nothing isn\'t agreeing.', true), o('It\'s true: everyone agreed.', false, 'In Lanternfall, nobody can say "no" at all.')] }),
          E: ch({ item: 'c:lf_mimic_e', prompt: { en: 'What is false in the notice?' }, options: [o('"No objections": people can\'t say 反対 here, so silence isn\'t agreement.', true), o('"Everyone": only half the town was there.', false, 'The notice\'s trouble is not who came, but what nobody could say.'), o('Nothing; the notice is right.', false, 'You have heard how this town answers everything.')] }),
          I: ch({ item: 'c:lf_mimic_i', prompt: { en: 'It says the meeting was decided unanimously (全員賛成で). What is wrong with that?' }, options: [o('A vote where no one can object is not unanimous; it only looks that way.', true), o('Nothing: everyone voted in favour.', false, 'They could not have voted against.'), o('The meeting never happened.', false, 'It happened; the result is the lie.')] }),
          A: ch({ item: 'c:lf_mimic_a', prompt: { en: 'It reasons: everyone said "certainly", therefore there was no objection (よって…ものとする). Where does it go wrong?' }, options: [o('"Certainly" was the only word anyone had; treating it as consent counts silence as agreement.', true), o('Nowhere: "certainly" means yes.', false, 'Here it means "I cannot say no".'), o('もの と する means "it is forbidden".', false, 'It means "it shall be taken that".')] }),
        } },
      plea: { power: 1,
        text: {
          F: { jp: 'わたし を はがさないで 。 まだ だれ も よんで いない 。', en: 'Don\'t tear me down. Nobody has read me yet.' },
          E: { jp: '{私|わたし} を はがさないで ください 。 まだ {誰|だれ} も {読|よ}んで いない ん です 。', en: 'Please don\'t take me down. Nobody has read me yet.' },
          I: { jp: '{貼|は}られて から 、 {誰|だれ} も {足|あし} を {止|と}めて くれなかった 。 {一度|いちど} で いい から 、 {読|よ}んで ほしい 。', en: 'Since I was posted, nobody has stopped to look. Just once, I want to be read.' },
          A: { jp: '{誰|だれ} に も {読|よ}まれない {掲示|けいじ} は 、 {掲示|けいじ} と {言|い}える だろう か 。 せめて 、 {一度|いちど} は {読|よ}んで くれ 。', en: 'Is a notice nobody reads still a notice? At least read me once.' },
        },
        answer: {
          F: ch({ item: 'c:lf_mimic_plea', prompt: { en: 'Answer it: what do you say?' }, options: [{ jp: 'よみました 。 でも 、 これ は ふるい です 。', en: 'I read it. But this is out of date.', ok: true }, { jp: 'よみません 。', en: 'I won\'t read it.', ok: false, why: { en: 'It asked to be read; refusing to read it leaves it pleading.' } }] }),
          E: ch({ item: 'c:lf_mimic_plea', prompt: { en: 'Answer it kindly and honestly.' }, options: [oj('{読|よ}みました 。 でも 、 この お{知|し}らせ は もう {古|ふる}い です 。', true), oj('{読|よ}みました 。 {全部|ぜんぶ} {本当|ほんとう} です ね 。', false, 'That agrees with the lie.'), oj('{読|よ}んで いません 。', false, 'It asked to be read.')] }),
          I: ch({ item: 'c:lf_mimic_plea', prompt: { en: 'Which reply reads it and still declines what it says?' }, options: [oj('{読|よ}ませて もらいました 。 ただ 、 {賛成|さんせい} した と は {言|い}えません 。', true), oj('{読|よ}ませて もらいました 。 {賛成|さんせい} します 。', false, 'That is the town\'s old "certainly".'), oj('{読|よ}む {必要|ひつよう} は ありません 。', false, 'It only asked to be read.')] }),
          A: ch({ item: 'c:lf_mimic_plea', prompt: { en: 'Which reply honours the notice and refuses its conclusion, in Lanternfall\'s polite register?' }, options: [oj('{拝見|はいけん} しました 。 です が 、 {全員|ぜんいん} {賛成|さんせい} と は {申|もう}し{上|あ}げかねます 。', true), oj('{拝見|はいけん} しました 。 かしこまりました 。', false, '"Certainly" is the very word that cost the town its "no".'), oj('{拝見|はいけん} いたしかねます 。', false, 'That refuses to read it at all.')] }),
        } },
    },
    intro: { jp: '{古|ふる}い {掲示板|けいじばん} が 、 {棚|たな} の {間|あいだ} を {這|は}って いる 。 {貼|は}られた {紙|かみ} の {字|じ} が 、 {勝手|かって} に {書|か}き{換|か}わる 。', en: 'An old notice board creeps between the shelves. The words on its papers rewrite themselves.' },
    settle: { jp: '{掲示板|けいじばん} は {壁|かべ} に {戻|もど}って 、 {古|ふる}い {紙|かみ} を {一枚|いちまい} 、 {床|ゆか} に {落|お}とした 。', en: 'The board goes back to the wall, and lets one old paper fall to the floor.' } };

  EN['lf.queue'] = { setting: 'indoor', name: { en: 'Queue Spirit', jp: '{列|れつ} の {霊|れい}' }, art: 'wisp', artOpts: { col: '#a8b8c8' }, look: { custom: 'wisp', col: '#a8b8c8' },
    region: 'lanternfall', bg: 'belltower', knots: 2, pool, pattern: ['rest', 'rest', 'sweep:surge'],
    intents: {
      rest: { text: {
        F: { jp: 'ならんで 、 まって いる 。', en: 'It stands in line, waiting.' },
        E: { jp: '{列|れつ} に {並|なら}んで 、 {静|しず}か に {待|ま}って いる 。', en: 'It waits quietly in line.' },
        I: { jp: '{順番|じゅんばん} を {待|ま}つ {列|れつ} が 、 {少|すこ}し ずつ {長|なが}く なって いく 。', en: 'The line waiting its turn grows a little longer.' },
        A: { jp: '{待|ま}つ こと に {慣|な}れすぎた {者|もの} たち の {列|れつ} 。 {苛立|いらだ}ち が 、 {静|しず}か に {溜|た}まって いく 。', en: 'A line of those too used to waiting. Their impatience quietly builds.' },
      } },
      'sweep:surge': { power: 2,
        text: {
          F: { jp: 'れつ が いっせい に おしよせる ！', en: 'The whole line surges forward!' },
          E: { jp: '{待|ま}ちくたびれた {列|れつ} が 、 {一度|いちど} に {押|お}し{寄|よ}せて くる ！', en: 'Tired of waiting, the line surges forward all at once!' },
          I: { jp: '{待|ま}たされ{続|つづ}けた {列|れつ} が 、 ついに {崩|くず}れて 、 ふたり に {押|お}し{寄|よ}せる ！', en: 'Kept waiting too long, the line finally breaks and surges over you both!' },
          A: { jp: '{堪忍袋|かんにんぶくろ} の {緒|お} が {切|き}れた か 、 {列|れつ} が {一斉|いっせい} に なだれ{込|こ}んで くる ！', en: 'Their patience snaps, and the line comes pouring in all at once!' },
        } },
    },
    intro: { jp: '{窓口|まどぐち} の {前|まえ} に 、 {薄|うす}い {影|かげ} が {一列|いちれつ} に {並|なら}んで いる 。 {誰|だれ} も {呼|よ}ばれない まま 、 {待|ま}ち{続|つづ}けて いる 。', en: 'Before a counter, faint shapes stand in a single line, waiting on and on to be called.' },
    settle: { jp: '{一人|ひとり} ずつ {名前|なまえ} が {呼|よ}ばれる と 、 {影|かげ} は {順番|じゅんばん} に {消|き}えて いった 。', en: 'Called one by one by name, the shapes leave in turn.' } };

  EN['lf.weevil'] = { setting: 'indoor', name: { en: 'Ledger Weevil', jp: '{帳簿|ちょうぼ} {虫|むし}' }, art: 'moth', artOpts: { col: '#6a5a3a', col2: '#d8c8a0' }, look: { custom: 'moth', col: '#8a7a5a' },
    region: 'lanternfall', bg: 'belltower', knots: 3, pool, pattern: ['mend', 'charge', 'strike'],
    intents: {
      mend: { text: {
        F: { jp: 'ふるい きろく から 、 また つながる 。', en: 'It ties itself back together from the old records.' },
        E: { jp: '{古|ふる}い {記録|きろく} を かじって 、 {結|むす}び{目|め} を {結|むす}び{直|なお}して いる 。', en: 'It gnaws the old records and re-ties its knots.' },
        I: { jp: '{記録|きろく} の {頁|ページ} を {食|た}べる たび に 、 ほどけた {所|ところ} が {元|もと} に {戻|もど}って いく 。', en: 'With every page of the records it eats, what was loosened goes back as it was.' },
        A: { jp: '{書|か}かれた とおり に {戻|もど}る 。 {帳簿|ちょうぼ} に {従|したが}う こと しか 、 {知|し}らない らしい 。', en: 'It goes back to exactly what was written. Following the ledger seems all it knows.' },
      } },
    },
    intro: { jp: '{帳簿|ちょうぼ} の {間|あいだ} から 、 {硬|かた}い {殻|から} の {虫|むし} が {這|は}い{出|だ}した 。 {食|た}べた {字|じ} の {形|かたち} が 、 {背中|せなか} に {浮|う}かんで いる 。', en: 'A hard-shelled insect crawls out from between the ledgers, the shapes of the characters it has eaten showing on its back.' },
    settle: { jp: '{虫|むし} は {背中|せなか} の {字|じ} を {一|ひと}つ ずつ {落|お}として 、 {棚|たな} の {隙間|すきま} に {消|き}えた 。', en: 'The insect sheds the characters from its back one by one, and vanishes into a gap in the shelves.' } };

  Object.assign(C.reviewEnemies = C.reviewEnemies || {}, { 'lf.mimic': 'lf2', 'lf.queue': 'lf2', 'lf.weevil': 'lf2' });
  if (RB.creaturesA && RB.creaturesA.auditEnemy) {
    const note = 'interim: a twelve-chapter Lanternfall creature (P11, E23) drawn on an existing family with its own palette; its own family is P16 art work (AC-1, C-82)';
    RB.creaturesA.auditEnemy('lf.mimic', 'clerk', 'incomplete', note);
    RB.creaturesA.auditEnemy('lf.queue', 'wisp', 'incomplete', note);
    RB.creaturesA.auditEnemy('lf.weevil', 'moth', 'incomplete', note);
  }

  // ---- placements: twelve-chapter journeys only --------------------------------------------------------------------
  const place = (mapId, f) => { const m = C.maps[mapId]; if (m) (m.foes = m.foes || []).push(Object.assign({ if: 'ed>=2' }, f)); };
  place('lf.stacks', { id: 'x1', enemy: 'lf.mimic', x: 6, y: 10, patrol: 1 });
  place('lf.stacks', { id: 'x2', enemy: 'lf.queue', x: 14, y: 12, patrol: 1 });
  place('lf.tower_mid', { id: 'x3', enemy: 'lf.weevil', x: 10, y: 11, patrol: 1 });
})(RB.content);
