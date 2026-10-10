/* Manybridge, Chapter 4: A Ghostwriter's Debt (expansion P09; R1 side quest 3; plan E8, E17).
 *
 * mp.ghost: at Ryūsui's door. Shinobu wrote the stories that made Ryūsui's name: he paid off her family's debt once,
 * and the stories have gone out under his name ever since. Now the Hush is taking the authors' names from the printed
 * books, and hers was never on them to begin with. Two lasting ends (E17), each confirmed before it is said:
 *   expose  (at the board, in front of the street): the truth told publicly; Ryūsui leaves the city; Shinobu's name
 *           goes on the next printing alone;
 *   broker  (between the three of you): both names on the next printing, and the debt called paid.
 * Neither is a failure; the Journey records what happened (quest mp_ghost and the flags), nothing essential depends
 * on it. Ryūsui is vain, and frightened: his own words dried up years ago (said only into a silence). */
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

  C.encounters['mp.ghost'] = {
    id: 'mp.ghost', kind: 'social', name: { jp: '{代筆|だいひつ} の {貸|か}し', en: 'A Ghostwriter\'s Debt' },
    rules: { wait: true },
    // the automated runs' route: the manuscript, the press's word, Wait (his fear), then the shared name
    autoRoute: ['s:manuscript', 's:kanta', 'wait', 's:both_names'],
    social: {
      parties: [
        { aid: 'n:ryusui', name: { jp: 'リュウスイ', en: 'Ryūsui' }, stance: 'heated', wants: { en: 'To keep his name, and his readers.' } },
        { aid: 'n:shinobu', name: { jp: 'シノブ', en: 'Shinobu' }, stance: 'closed', wants: { en: 'Her name on her own stories, before it fades for good.' } },
      ],
      claims: {
        g1: { by: 'n:ryusui', jp: 'あの {話|はなし} は 、 {私|わたし} の {名前|なまえ} で {出|で}た 。 {私|わたし} の もの だ 。', en: 'Those stories came out under my name. They are mine.' },
        g2: { by: 'n:ryusui', jp: '{借金|しゃっきん} は {私|わたし} が {払|はら}った 。 {話|はなし} は 、 その {代|か}わり だ 。', en: 'I paid her debt. The stories were in return.' },
        g3: { by: 'manuscript', jp: '{原稿|げんこう} は {春|はる} 、 シノブ の {字|じ} 。 {本|ほん} は {夏|なつ} 。', en: 'The manuscript: spring, in Shinobu\'s hand. The book: summer.', hidden: true },
        g4: { by: 'n:kanta', jp: '{原稿|げんこう} を {刷|す}り{場|ば} に {持|も}って {来|き}た の は 、 いつ も シノブ さん でした 。', en: 'Kanta: "It was always Shinobu who brought the manuscripts to the press."', hidden: true },
        g5: { by: 'n:ryusui', jp: '…… {十年|じゅうねん} {前|まえ} から 、 {一行|いちぎょう} も {書|か}けない ん だ 。', en: '…For ten years I haven\'t been able to write a line.', hidden: true },
      },
      understanding: 3,
      gesture: { name: { jp: '{二人|ふたり} の {名前|なまえ} を {並|なら}べる', en: 'Set the two names side by side' }, desc: 'With your companion, show them how both names could stand on one page.', effect: { flag: 'both' }, says: { en: 'On the back of a proof you write both names, one under the other. Ryūsui looks at it for a long time. Shinobu doesn\'t look away.' } },
      unravelTip: { en: 'There is no knot here. What is tangled is a debt, a name and ten years of silence: who wrote what, and what each of them is afraid of.' },
      actions: [
        { id: 'manuscript', kind: 'evidence', label: say('この {原稿|げんこう} の {日付|ひづけ} を {見|み}て ください 。', 'Show the manuscript\'s date'), once: true,
          task: task('g:v_te_kudasai', 'Which asks him to look at the manuscript\'s date?', 'この {原稿|げんこう} の {日付|ひづけ} を {見|み}て ください 。', 'この {原稿|げんこう} の {名前|なまえ} を {消|け}して ください 。', 'That asks him to erase the name.', 'この {原稿|げんこう} の {日付|ひづけ} を {書|か}いて ください 。', 'That asks him to write a date on it.'),
          effect: { reveal: 'g3', understanding: 1 }, says: { en: 'Ryūsui takes the pages. Spring, in her hand. His book came out in summer. He sets them down very carefully.' } },
        { id: 'kanta', kind: 'evidence', label: say('{刷|す}り{場|ば} の カンタ さん も 、 {覚|おぼ}えて います 。', 'Say Kanta at the press remembers who brought them'), once: true,
          task: task('g:prt_mo', 'Which says Kanta at the press remembers too?', '{刷|す}り{場|ば} の カンタ さん も 、 {覚|おぼ}えて います 。', '{刷|す}り{場|ば} の カンタ さん は 、 {忘|わす}れて います 。', 'That says Kanta has forgotten.', '{刷|す}り{場|ば} の カンタ さん も 、 {書|か}いて います 。', 'That says Kanta writes too.'),
          effect: { reveal: 'g4', understanding: 1 }, says: { en: 'Shinobu looks up for the first time. "He remembers? He was so small then."' } },
        { id: 'ask_debt', kind: 'ask', label: say('{借金|しゃっきん} は 、 もう {返|かえ}し{終|お}わって います か 。', 'Ask whether the debt is paid off'), once: true,
          task: task('g:v_ta', 'Which asks whether the debt is already paid off?', '{借金|しゃっきん} は 、 もう {返|かえ}し{終|お}わって います か 。', '{借金|しゃっきん} は 、 まだ {借|か}りて います か 。', 'That asks whether she is still borrowing.', '{借金|しゃっきん} は 、 いくら でした か 。', 'That asks how much it was.'),
          effect: { reveal: 'g2', understanding: 1 }, says: { en: 'Ryūsui: "Paid? I paid it. The stories were in return." Shinobu, very quietly: "Twelve stories, for one debt."' } },
        { id: 'both_names', kind: 'propose', label: say('{次|つぎ} の {刷|す}り で は 、 {二人|ふたり} の {名前|なまえ} を {並|なら}べましょう 。', 'Propose both names on the next printing'), when: { claims: ['g3'] }, lasting: true,
          means: { en: 'You will propose a settlement between the three of you: both names on the next printing, and the debt called paid.' },
          task: task('g:v_mashou', 'Which proposes putting both names side by side on the next printing?', '{次|つぎ} の {刷|す}り で は 、 {二人|ふたり} の {名前|なまえ} を {並|なら}べましょう 。', '{次|つぎ} の {刷|す}り で は 、 {二人|ふたり} の {名前|なまえ} を {消|け}しましょう 。', 'That proposes erasing both names.', '{前|まえ} の {刷|す}り で は 、 {二人|ふたり} の {名前|なまえ} を {並|なら}べました 。', 'That says it was already done, in the past.'),
          effect: { flag: 'brokered' }, says: { en: 'Ryūsui is silent. Then: "Both names. …Hers first." Shinobu covers her mouth with her hand.' } },
        { id: 'expose', kind: 'propose', label: say('{本当|ほんとう} の こと を 、 {通|とお}り の {皆|みな} に {話|はな}します 。', 'Tell the whole street the truth, at the board'), when: { claims: ['g3'] }, lasting: true,
          means: { en: 'You will tell everyone on Playhouse Row, at the notice board, that Shinobu wrote Ryūsui\'s stories. It cannot be taken back.' },
          task: task('g:v_masu', 'Which says you will tell everyone on the street the truth?', '{本当|ほんとう} の こと を 、 {通|とお}り の {皆|みな} に {話|はな}します 。', '{本当|ほんとう} の こと を 、 {誰|だれ} に も {話|はな}しません 。', 'That promises to tell no one.', '{嘘|うそ} の こと を 、 {通|とお}り の {皆|みな} に {話|はな}します 。', 'That says you will tell them a lie.'),
          effect: { flag: 'exposed' }, says: { en: 'At the board, in front of the morning crowd, you read out the two dates. A murmur goes down the street. Ryūsui does not come out of his house.' } },
      ],
      responses: {
        hikari: { says: { en: 'In the light, the faded author\'s line on Ryūsui\'s printed book shows a ghost of a different name under his.' }, effect: { understanding: 1 } },
        water: { when: { stance: { 'n:ryusui': 'heated' } }, effect: { stance: { 'n:ryusui': 'listening' } }, says: { en: 'A cup of water. Ryūsui drinks it, and stops pacing.' } },
        unravel: { says: { en: 'Nothing is knotted. The tangle is in what each of them owes, and fears.' } },
      },
      // Wait: into a silence, Ryūsui says what he is afraid of
      wait: { when: { all: [{ claims: 'g3' }, { not: { claims: 'g5' } }] }, effect: { reveal: 'g5', stance: { 'n:ryusui': 'listening', 'n:shinobu': 'listening' } }, says: { en: 'Nobody speaks. At last Ryūsui sits down on his own doorstep. "For ten years I haven\'t been able to write a line. Her stories were the only thing that kept my name alive."' } },
      companion: {
        nao: [{ id: 'nao_deliver', name: say('{届|とど}け{先|さき} を {言|い}う', 'Say whose the words are'), desc: 'A courier knows who a letter belongs to.', when: { claims: 'g3' }, once: true, effect: { understanding: 1, stance: { 'n:shinobu': 'listening' } }, says: { en: 'Nao: "A letter belongs to whoever wrote it, whatever the envelope says." Shinobu looks at Nao, then nods.' } }],
        mio: [{ id: 'mio_calm', name: say('{落|お}ち{着|つ}かせる', 'Calm Ryūsui'), desc: 'Mio speaks to Ryūsui quietly.', when: { stance: { 'n:ryusui': 'heated' } }, effect: { stance: { 'n:ryusui': 'listening' }, understanding: 1 }, says: { en: 'Mio: "Nobody here wants you ruined. We want it put right." Ryūsui stops pacing.' } }],
        ren: [{ id: 'ren_record', name: say('{記録|きろく} の {話|はなし} を する', 'Speak of records'), desc: 'Ren explains what the Hush does to names nobody writes down.', once: true, effect: { understanding: 1, stance: { 'n:shinobu': 'listening' } }, says: { en: 'Ren: "A name that is never written down is the first to fade. Hers was never on the page at all." Shinobu\'s hands tighten on her pencil.' } }],
        suzu: [{ id: 'suzu_billing', name: say('{番付|ばんづけ} の {話|はなし} を する', 'Speak of billing'), desc: 'Suzu knows what it is to be left off a playbill.', once: true, effect: { understanding: 1, stance: { 'n:ryusui': 'listening', 'n:shinobu': 'listening' } }, says: { en: 'Suzu: "On a playbill there\'s always room for two names. The lead\'s doesn\'t get smaller." Ryūsui almost laughs.' } }],
      },
      drift: [
        { when: { all: [{ rounds: 2 }, { stance: { 'n:ryusui': 'heated' } }] }, once: true, effect: { stance: { 'n:shinobu': 'leaving' } }, says: { en: 'Ryūsui\'s voice rises. Shinobu edges toward the street, as if she might simply go.' } },
        { when: { all: [{ rounds: 3 }, { stance: { 'n:shinobu': 'leaving' } }] }, once: true, effect: { stance: { 'n:shinobu': 'listening' } }, says: { en: 'Shinobu stops at the corner, and comes back.' } },
      ],
    },
    conclusions: [
      { id: 'brokered', when: { flag: 'brokered' }, result: 'end', text: { en: 'Two names on the next printing, Shinobu\'s first. Ryūsui tears up the debt in front of you both.' }, flags: { mp_ghost_broker: true } },
      { id: 'exposed', when: { flag: 'exposed' }, result: 'end', text: { en: 'By evening, all of Playhouse Row knows. Ryūsui\'s door stays shut, and the next printing carries one name: Shinobu\'s.' }, flags: { mp_ghost_exposed: true } },
      { id: 'shared', when: { flag: 'both' }, result: 'end', text: { en: 'The two names on the back of a proof. "Have it printed like that," says Ryūsui, "before I change my mind."' }, flags: { mp_ghost_broker: true, mp_ghost_best: true } },
      { id: 'unresolved', when: { rounds: 7 }, result: 'end', text: { en: 'Ryūsui shuts his door. "Come back when you have something better than accusations." Shinobu goes home.' } },
    ],
  };
})(RB.content);

/* The wanderers (expansion P09, moved from P08; plan E3, R1 unique encounters): guests on the encounter platform, each
 * with an aim of their own. Gonta the porter fends off the creature fouling his barge on Playhouse Row's bank; Hayashi
 * the drummer joins a fight by the theatre, and goes when the crowd that gathered to watch drifts off. Each is met
 * once; neither needs anything of you, and the fight goes on without them if they go. */
(function (C) {
  'use strict';
  const T = (jp, en) => ({ jp, en });
  C.encounters = C.encounters || {};
  C.encounters['mp.wander_gonta'] = {
    id: 'mp.wander_gonta', name: T('{荷舟|にぶね} を {取|と}り{返|かえ}す', 'Gonta\'s barge'),
    lead: { enemy: 'mp.golem', knots: 4 },
    actors: [{
      aid: 'g:gonta', side: 'guest', name: T('ゴンタ', 'Gonta'), hp: 4,
      agenda: { wants: 'settle', target: 'f0', act: { kind: 'unravel', n: 1 }, reactsTo: { youSettle: 'satisfied', youHelp: 'thanks' } },
      lines: {
        arrive: T('{版木|はんぎ} の {化|ば}け{物|もの} が 、 {俺|おれ} の {舟|ふね} に {乗|の}って {動|うご}かない ！', '"A thing made of woodblocks has climbed onto my barge and won\'t budge!"'),
        act: T('どっこいしょ ！', 'Gonta puts his shoulder to it: a block comes loose.'),
        thanks: T('いい ぞ 、 その {調子|ちょうし} だ ！', '"That\'s it, keep at it!"'),
        satisfied: T('{助|たす}かった ！ この {借|か}り は 、 {荷|に} で {返|かえ}す よ 。', '"You saved my barge! I\'ll pay you back in freight." Gonta poles away down the canal.'),
        done: T('よし 、 {舟|ふね} が {空|あ}いた 。', '"Right, the barge is clear." Gonta poles away.'),
      },
    }],
  };
  C.encounters['mp.wander_hayashi'] = {
    id: 'mp.wander_hayashi', name: T('{芝居小屋|しばいごや} の {前|まえ} の {騒|さわ}ぎ', 'A crowd by the theatre'),
    lead: { enemy: 'mp.moth', knots: 2 },
    group: { normal: ['mp.moth'], hard: ['mp.moth', 'mp.imp'] },
    actors: [{
      aid: 'g:hayashi', side: 'guest', name: T('ハヤシ', 'Hayashi'), hp: 3,
      agenda: { wants: 'help', act: { kind: 'ward', on: 'pc', n: 1 }, leavesWhen: { rounds: 3 } },
      lines: {
        arrive: T('お{客|きゃく} が {集|あつ}まって きた ！ {太鼓|たいこ} で {応援|おうえん} する よ ！', '"A crowd\'s gathering! I\'ll drum you on!"'),
        act: T('ポン 、 ポン 、 ポン ！', 'Hayashi\'s drumbeat steadies you.'),
        leave: T('お{客|きゃく} が {帰|かえ}って いく 。 {俺|おれ} も {次|つぎ} の {場所|ばしょ} へ ！', '"The crowd\'s drifting off. On to the next spot!" Hayashi follows them, still drumming.'),
      },
    }],
  };
})(RB.content);
