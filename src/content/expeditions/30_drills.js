/* Drills for two grammar points no chapter drilled yet: 〜て ある (the Flood Cellars teach it) and 〜て みる. They
 * let the Atlas's commissions (the "family of endings", practice topics built from the grammar families) and the
 * Exams ask about them at every profile. Tagged 'expedition': they never join a region's battle pools. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const no = (en) => ({ en });
  const c = (id, lv, item, ctx, prompt, options, extra) => Object.assign({ id, lv, tags: ['expedition'], kind: 'choose', item, ctx, prompt: { en: prompt }, options }, extra || {});
  const o = (id, lv, item, prompt, tiles, extra) => Object.assign({ id, lv, tags: ['expedition'], kind: 'order', item, prompt: { en: prompt }, tiles, answer: tiles.slice() }, extra || {});
  C.addDrills([
    // ---- 〜て ある: a state someone brought about and left so ----
    c('xp.d_aru_f', 'F', 'g:te_aru', { jp: '{窓|まど} が {開|あ}けて あります 。', en: '' }, 'What does this tell you?', [
      { en: 'Someone has opened the window, and it is open now.', ok: true },
      { en: 'Please open the window.', ok: false, why: no('That would be {開|あ}けて ください.') },
      { en: 'The window is broken.', ok: false, why: no('Nothing is broken: {開|あ}けて あります says someone opened it.') },
    ], { explain: { en: '〜て あります: someone did it, and it stays done.' } }),
    c('xp.d_aru_e', 'E', 'g:te_aru', { jp: '{机|つくえ} の {上|うえ} に {地図|ちず} が {置|お}いて あります 。', en: '' }, 'Where is the map?', [
      { en: 'On the desk: someone put it there.', ok: true },
      { en: 'In someone\'s bag.', ok: false, why: no('{机|つくえ} の {上|うえ}: on the desk.') },
      { en: 'Nobody knows; someone is looking for it.', ok: false, why: no('{置|お}いて あります: it has been put there, so it is there.') },
    ]),
    c('xp.d_aru_i', 'I', 'g:te_aru', { jp: 'Ａ ： {電気|でんき} が ついて いる 。　Ｂ ： {電気|でんき} が つけて ある 。', en: '' }, 'Which one tells you that someone switched the light on and left it on, on purpose?', [
      { en: 'B: つけて ある', ok: true },
      { en: 'A: ついて いる', ok: false, why: no('ついて いる only says the light is on (つく, nobody acting).') },
      { en: 'Both say the same thing.', ok: false, why: no('Both say the light is on; only つけて ある says someone did it.') },
    ]),
    o('xp.d_aru_a', 'A', 'g:te_aru', 'Put it in order: "The names have been written on the back."', ['{裏|うら} に', '{名前|なまえ} が', '{書|か}いて', 'あります']),
    // ---- 〜て みる: try doing (and see) ----
    c('xp.d_miru_f', 'F', 'g:te_miru', { jp: 'この お{茶|ちゃ} を {飲|の}んで みて ください 。', en: '' }, 'What is being suggested?', [
      { en: 'Try this tea and see how it is.', ok: true },
      { en: 'Drink all of this tea.', ok: false, why: no('Nothing says "all": {飲|の}んで みる is "try drinking".') },
      { en: 'Look at this tea.', ok: false, why: no('みる here means "try", not "look at".') },
    ], { explain: { en: 'て form + みる: try doing something and see.' } }),
    c('xp.d_miru_e', 'E', 'g:te_miru', { jp: '{新|あたら}しい {道|みち} を {歩|ある}いて みました 。', en: '' }, 'What did the speaker do?', [
      { en: 'Walked the new road to see what it was like.', ok: true },
      { en: 'Looked at the new road from far away.', ok: false, why: no('{歩|ある}いて みました: tried walking it.') },
      { en: 'Wanted to walk the new road.', ok: false, why: no('That would be {歩|ある}きたい.') },
    ]),
    o('xp.d_miru_i', 'I', 'g:te_miru', 'Put it in order: "Try writing your name here."', ['ここ に', '{名前|なまえ} を', '{書|か}いて', 'みて', 'ください']),
    c('xp.d_miru_a', 'A', 'g:te_miru', { jp: '{一度|いちど} {食|た}べて みたら 、 {思|おも}った より {甘|あま}かった 。', en: '' }, 'What does the sentence say happened?', [
      { en: 'Having tried it once, the speaker found it sweeter than expected.', ok: true },
      { en: 'The speaker looked at it and guessed it would be sweet.', ok: false, why: no('{食|た}べて みたら: on trying it, by eating it.') },
      { en: 'The speaker has never eaten it.', ok: false, why: no('{一度|いちど} {食|た}べて みた: they did try it, once.') },
    ]),
  ]);
})(RB.content);
