/* Manybridge, Chapter 4: the rehearsal's language (expansion P09; plan R1 "Rehearsal": A20, A41, A10; W17).
 *   mp.rehearse_block  staging from directions: 上手・下手・奥・前, then reference and omission (その, 二人, まだ);
 *                      the stage shows where each answer puts everyone (src/ui/89f_stage.js)
 *   mp.rehearse_line   a line for the children's matinée and for the evening (register, keeping the meaning)
 *   mp.rehearse_book   the scrambled prompt-book put back in order (sequence; reference at I and A)
 * Language by profile (R1, Chapter B): F kana on the programme and a name restored; E short directions
 * (〜てください) and order; I reference and omission across lines, register for an audience; A register shifts. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  const no = (en) => ({ en });
  C.stages = C.stages || {};
  C.stages['mp.stage_play'] = {
    cols: 5, rows: 3,
    tokens: { saku: T('Sakutarō', 'サクタロウ'), hina: T('the daughter', '{娘役|むすめやく}'), byobu: T('the screen', '{屏風|びょうぶ}'), boat: T('the boat', '{舟|ふね}') },
    start: {},
  };
  const O = (en, ok, place, means, why) => Object.assign({ en, ok, place, means: { en: means } }, ok ? {} : { why: no(why) });

  C.challenges['mp.rehearse_block'] = { title: T('Blocking the scene', '{立|た}ち{位置|いち}'),
    tiers: {
      F: [{ kind: 'choose', stage: 'mp.stage_play', item: 'v:まんなか', ctx: { jp: 'サクタロウ は 、 まんなか の まえ に たつ 。', en: 'The prompt-book: where Sakutarō stands.' },
        prompt: { en: 'Where does Sakutarō stand? Read the direction.' },
        options: [
          O('In the middle, at the front', true, { saku: [2, 2] }, 'Sakutarō in the middle, at the front: the whole house can see him.'),
          O('In the middle, at the back', false, { saku: [2, 0] }, 'Sakutarō in the middle, at the back.', 'まえ is the front, nearest the seats.'),
          O('At the far right, at the front', false, { saku: [4, 2] }, 'Sakutarō at the far right, at the front.', 'まんなか is the middle.'),
        ] }],
      E: [{ kind: 'choose', stage: 'mp.stage_play', item: 'g:v_te_kudasai', ctx: { jp: 'サクタロウ は {上手|かみて} の {奥|おく} に {立|た}って ください 。 {屏風|びょうぶ} は {下手|しもて} に {置|お}いて ください 。', en: '' },
        prompt: { en: 'Stage it: where do Sakutarō and the screen go? ({上手|かみて}, kamite, is the audience\'s right.)' },
        options: [
          O('Sakutarō at the back on the right; the screen on the left', true, { saku: [4, 0], byobu: [0, 1] }, 'Sakutarō at the back, the audience\'s right; the screen on the left.'),
          O('Sakutarō at the back on the left; the screen on the right', false, { saku: [0, 0], byobu: [4, 1] }, 'Sakutarō on the left, the screen on the right: swapped.', '{上手|かみて} is the audience\'s right and {下手|しもて} the audience\'s left.'),
          O('Sakutarō at the front on the right; the screen on the left', false, { saku: [4, 2], byobu: [0, 1] }, 'Sakutarō at the front.', '{奥|おく} is the back of the stage, away from the seats.'),
        ] }],
      I: [{ kind: 'choose', stage: 'mp.stage_play', item: 'v:その', ctx: { jp: '{娘役|むすめやく} は {下手|しもて} の {前|まえ} に {立|た}つ 。 サクタロウ は 、 その {隣|となり} 。 {屏風|びょうぶ} は 、 {二人|ふたり} の {後|うし}ろ 。', en: '' },
        prompt: { en: 'Who is その, who are the {二人|ふたり}? Stage it.' },
        options: [
          O('The daughter front left; Sakutarō beside her; the screen just behind them', true, { hina: [0, 2], saku: [1, 2], byobu: [1, 1] }, 'The daughter and Sakutarō side by side at the front left, the screen behind them.'),
          O('The daughter front left; Sakutarō across the stage; the screen behind her', false, { hina: [0, 2], saku: [4, 2], byobu: [0, 1] }, 'Sakutarō across the stage from her.', 'その{隣|となり}: next to her, the one just named.'),
          O('The daughter front left; Sakutarō beside her; the screen at the back right', false, { hina: [0, 2], saku: [1, 2], byobu: [4, 0] }, 'The screen far from them.', '{二人|ふたり} の {後|うし}ろ: behind the two of them.'),
        ] }],
      A: [{ kind: 'choose', stage: 'mp.stage_play', item: 'g:v_tokoro', ctx: { jp: '{幕|まく} が {開|あ}く と 、 {舟|ふね} は もう {上手|かみて} に {着|つ}いて いる 。 {主役|しゅやく} は {舟|ふね} から {降|お}りた ところ 。 {娘|むすめ} は まだ {見|み}えない 。', en: '' },
        prompt: { en: 'Stage the curtain rising.' },
        options: [
          O('The boat in on the right; Sakutarō just off it beside it; the daughter not yet on', true, { boat: [4, 1], saku: [3, 1] }, 'The boat moored on the right, Sakutarō just stepped off; the daughter still offstage.'),
          O('The boat in on the right; Sakutarō still aboard; the daughter not yet on', false, { boat: [4, 1], saku: [4, 1] }, 'Sakutarō still in the boat.', '{降|お}りた ところ: he has just got off.'),
          O('The boat in on the right; Sakutarō beside it; the daughter waiting front left', false, { boat: [4, 1], saku: [3, 1], hina: [0, 2] }, 'The daughter already on stage.', 'まだ {見|み}えない: she cannot be seen yet.'),
        ] }],
    } };

  C.challenges['mp.rehearse_line'] = { title: T('A line for the matinée', '{昼|ひる} の {部|ぶ} の {台詞|せりふ}'),
    tiers: {
      F: [{ kind: 'choose', item: 'k:hira', ctx: { jp: 'こわく ない よ 。 いっしょ に いこう 。', en: 'Sakutarō\'s line for the children\'s matinée.' },
        prompt: { en: 'Which line says the same thing to the children?' },
        options: [{ jp: 'こわく ない よ 。 いっしょ に いこう 。', ok: true }, { jp: 'こわい よ 。 ひとり で いく 。', ok: false, why: no('That says "I\'m scared. I\'ll go alone."') }] }],
      E: [{ kind: 'choose', item: 'g:v_volitional', ctx: { jp: '{恐|おそ}れる な 。 {共|とも}に {参|まい}ろう 。', en: 'Sakutarō\'s line in the evening show: "Fear not. Let us go together."' },
        prompt: { en: 'The same line for the children\'s matinée: which says it simply?' },
        options: [{ jp: '{怖|こわ}く ない よ 。 {一緒|いっしょ} に {行|い}こう 。', ok: true }, { jp: '{怖|こわ}い です か 。 {一人|ひとり} で {行|い}きます 。', ok: false, why: no('That changes what he means: he goes alone.') },
          { jp: '{怖|こわ}がって ください 。 {一緒|いっしょ} に {行|い}きます 。', ok: false, why: no('That tells them to be afraid.') }] }],
      I: [{ kind: 'choose', item: 'g:cond_ba', ctx: { jp: 'この {川|かわ} を {渡|わた}らねば 、 {明日|あす} は {来|こ}ぬ 。', en: '' },
        prompt: { en: 'The evening line, rewritten for the matinée with the same meaning:' },
        options: [{ jp: 'この {川|かわ} を {渡|わた}らない と 、 {明日|あした} が {来|こ}ない んだ 。', ok: true },
          { jp: 'この {川|かわ} を {渡|わた}ったら 、 {明日|あした} は {来|こ}ない 。', ok: false, why: no('That says crossing stops tomorrow from coming.') },
          { jp: 'この {川|かわ} を {渡|わた}らなくて も 、 {明日|あした} は {来|く}る 。', ok: false, why: no('That says it does not matter whether you cross.') }] }],
      A: [{ kind: 'choose', item: 'g:cond_ba', ctx: { jp: '{名前|なまえ} を {忘|わす}れて も 、 {君|きみ} は {君|きみ} だ よ 。', en: '' },
        prompt: { en: 'The matinée line, in the evening show\'s old style, keeping the meaning:' },
        options: [{ jp: '{名|な} を {忘|わす}れよう と も 、 {君|きみ} は {君|きみ} 。', ok: true },
          { jp: '{名|な} を {忘|わす}れた から 、 {君|きみ} は {君|きみ} で は ない 。', ok: false, why: no('That denies it: because you forgot the name, you are not yourself.') },
          { jp: '{名|な} を {覚|おぼ}えて いる なら 、 {君|きみ} は {君|きみ} 。', ok: false, why: no('That makes it a condition: only if you remember.') }] }],
    } };

  const L1 = '{幕|まく} が {開|あ}く 。', L2 = '{娘|むすめ} が {舟|ふね} を {待|ま}って いる 。', L3 = 'サクタロウ が {舟|ふね} で {来|く}る 。', L4 = '{二人|ふたり} で {花火|はなび} を {見|み}る 。', L5 = '{幕|まく} が {閉|し}まる 。';
  C.challenges['mp.rehearse_book'] = { title: T('The prompt-book, in order', '{台本|だいほん} の {順番|じゅんばん}'),
    tiers: {
      F: [{ kind: 'order', item: 'c:mp_book_f', prompt: { en: 'The prompt-book\'s pages came loose. Put the scene in order: the curtain opens, the boat comes, the curtain closes.' },
        tiles: ['まく が あく 。', 'ふね が くる 。', 'まく が しまる 。'], answer: ['まく が あく 。', 'ふね が くる 。', 'まく が しまる 。'] }],
      E: [{ kind: 'order', item: 'c:mp_book_e', prompt: { en: 'Put the scene back in order.' },
        tiles: [L1, L2, L3, L5], answer: [L1, L2, L3, L5] }],
      I: [{ kind: 'order', item: 'c:mp_book_i', prompt: { en: 'Put the scene back in order. {二人|ふたり} needs both of them on stage.' },
        tiles: [L1, L2, L3, L4, L5], answer: [L1, L2, L3, L4, L5] }],
      A: [{ kind: 'order', item: 'c:mp_book_a', prompt: { en: 'Put the scene back in order. それ and その{時|とき} point back to something said before.' },
        tiles: [L1, L2, L3, 'その {時|とき} 、 {最初|さいしょ} の {花火|はなび} が {上|あ}がる 。', 'それ を {見|み}て 、 {娘|むすめ} は {名前|なまえ} を {思|おも}い{出|だ}す 。', L5],
        answer: [L1, L2, L3, 'その {時|とき} 、 {最初|さいしょ} の {花火|はなび} が {上|あ}がる 。', 'それ を {見|み}て 、 {娘|むすめ} は {名前|なまえ} を {思|おも}い{出|だ}す 。', L5] }],
    } };
})(RB.content);
