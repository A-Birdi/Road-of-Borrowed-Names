/* The Cloudroad, Chapter 10: the High Pass's language task (expansion P12; plan R2, D2). The rope bridge's notice,
 * read before crossing: F one at a time (ずつ), E the rule written with 〜こと (do; do not), I what the notice asks on a
 * windy day, A the old notice in classical style (〜べからず, 〜べし: labelled classical, as on the Keepers' Road).
 * Rope bridges woven from vine (kazurabashi) are real mountain history; this bridge and its notice are the game's own. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const T = (jp, en) => ({ jp, en });
  const ch = (o) => Object.assign({ kind: 'choose' }, o);
  const o = (jp, ok, why) => Object.assign({ jp, ok: !!ok }, why ? { why: { en: why } } : {});
  const e = (en, ok, why) => Object.assign({ en, ok: !!ok }, why ? { why: { en: why } } : {});
  C.challenges['cr.bridge_sign'] = { title: T('{吊|つ}り{橋|ばし} の {札|ふだ}', 'The rope bridge\'s notice'), tiers: {
    F: [ch({ item: 'v:一人', ctx: { jp: 'ふだ ： 「ひとり ずつ わたる こと 。」', en: '' }, prompt: { en: 'The notice at the bridge. How do you cross?' },
      options: [o('ひとり ずつ', 1), o('ふたり いっしょ に', 0, 'ずつ means one at a time: one, then the next.')] })],
    E: [ch({ item: 'g:v_nai', ctx: { jp: '{札|ふだ} ： 「{一度|いちど} に {一人|ひとり} ずつ {渡|わた}る こと 。 {走|はし}らない こと 。」', en: '' }, prompt: { en: 'What does the notice tell you to do?' },
      options: [e('Cross one at a time, and don\'t run.', 1), e('Cross one at a time, running.', 0, '走らないこと: do not run.'), e('Cross together, and don\'t stop.', 0, '一人ずつ: one at a time.')] })],
    I: [ch({ item: 'g:nominalizer', ctx: { jp: '{札|ふだ} ： 「{風|かぜ} の {強|つよ}い {日|ひ} は 、 {綱|つな} を {持|も}って {渡|わた}る こと 。 {荷物|にもつ} は {背負|せお}う こと 。 {手|て} に {持|も}たない こと 。」', en: '' }, prompt: { en: 'It is windy today. How do you cross, as the notice asks?' },
      options: [e('Holding the rope, with my pack on my back.', 1), e('Holding my bag in one hand and the rope in the other.', 0, '手に持たないこと: don\'t carry it in your hand.'), e('Waiting until the wind drops.', 0, 'The notice says how to cross on a windy day, not to wait.')] })],
    A: [ch({ item: 'g:kr_classical', ctx: { jp: '{札|ふだ} ： 「{此|こ}の{橋|はし} 、 {一度|いちど} に {二人|ふたり} {以上|いじょう} {渡|わた}る べからず 。 {荷|に} は {背|せ} に {負|お}う べし 。」 （{古|ふる}い {書|か}き{方|かた}）', en: '' }, prompt: { en: 'What does the old notice require?' },
      options: [e('No more than one at a time (二人以上…べからず), and loads carried on the back (べし).', 1), e('Two at a time at most.', 0, '二人以上 is "two or more": two is already too many.'), e('Loads are not allowed on the bridge.', 0, '荷は背に負うべし: carry them on your back.')] })],
  } };
})(RB.content);
