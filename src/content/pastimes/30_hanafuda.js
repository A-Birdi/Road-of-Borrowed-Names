/* Hanafuda (expansion P06, C12; Robin C-33): koi-koi on a cloth, with your companion anywhere safe (the screen in
 * src/ui/88b_hanafuda.js, the rules in src/engine/72d_hanafuda.js). The places the plan names for it (the boat's
 * corner, the Manybridge festival hall, Steamhollow's inns) come with their chapters, which also introduce the game:
 * until then a journey meets it through the flag pt_hanafuda (set by the chapter that teaches it). */
var RB = (globalThis.RB = globalThis.RB || {});
(function () {
  'use strict';
  if (!RB.pastimes) return;
  const T = (en, jp) => ({ en, jp });
  RB.pastimes.define('hanafuda', {
    order: 30, title: T('Hanafuda', '{花札|はなふだ}'), kind: 'game', activity: 'hanafuda', companion: true, art: 'hanafuda',
    anywhere: T('On a cloth, anywhere safe with your companion.', '{道連|みちづ}れ と なら 、 {安全|あんぜん} な {場所|ばしょ} で どこ でも'),
    met: (s) => !!(RB.edition && RB.edition.of(s) >= 2) && !!((s.flags && s.flags.pt_hanafuda) || (s.practice && s.practice.hanafuda && s.practice.hanafuda.games)),
    blurb: T('Forty-eight flower cards, four for each month of the year. The game is koi-koi: match the months, collect sets, and decide when to stop.', '{十二|じゅうに}か{月|げつ} の {花|はな} の {札|ふだ} 。'),
    howto: [
      T('Play a card from your hand onto a card of the same month on the field, and take both. No match: lay it down.', '{同|おな}じ {月|つき} の {札|ふだ} を {取|と}る 。'),
      T('Then turn the top card of the pile: it takes a card of its month too, or stays on the field.', '{山|やま} から {一枚|いちまい} めくる 。'),
      T('Collect a set and choose: stop and score it, or call koi-koi and play on for more.', '{役|やく} が できたら 、 {勝負|しょうぶ} か こいこい か 。'),
      T('Points are only points: hanafuda is played here for the flowers and the fun of it.', '{点|てん} は {点|てん} だけ 。'),
    ],
    records: (s) => {
      // read only: looking at the page never makes a record
      const r = Object.assign(RB.pastimes.fresh('hanafuda'), (s.practice && s.practice.hanafuda) || {});
      const out = [];
      if (r.games) out.push({ en: 'Games', value: r.games + (r.wins ? ', ' + r.wins + ' won' : ''), total: true });
      if (r.best) out.push({ en: 'Best game', value: r.best + ' points' });
      const ys = Object.keys(r.yaku || {});
      if (ys.length) out.push({ en: 'Sets made', value: ys.length + ' of ' + Object.keys(RB.hanafuda.YAKU).length });
      return out;
    },
  });
})();
