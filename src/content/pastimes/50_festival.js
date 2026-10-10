/* The festival's games (expansion P06 builds the shell; P09 brings the festival and the rest of its games). The first
 * is ヨーヨー釣り, water-balloon fishing (real): hook the balloon whose label you are asked for. The words are on the
 * balloons with their readings; you are asked in English, so the label has to be read. Twelve-chapter journeys meet the
 * festival's games through the flag pt_festival, set by the festival. */
var RB = (globalThis.RB = globalThis.RB || {});
(function (C) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  C.festival = C.festival || {};
  C.festival.yoyo = {
    words: [
      T('water', '{水|みず}'), T('fire', '{火|ひ}'), T('tree', '{木|き}'), T('flower', '{花|はな}'), T('fish', '{魚|さかな}'), T('bird', '{鳥|とり}'),
      T('dog', '{犬|いぬ}'), T('cat', '{猫|ねこ}'), T('mountain', '{山|やま}'), T('river', '{川|かわ}'), T('moon', '{月|つき}'), T('star', '{星|ほし}'),
      T('rain', '{雨|あめ}'), T('sky', '{空|そら}'), T('sea', '{海|うみ}'), T('boat', '{船|ふね}'), T('watermelon', 'すいか'), T('fireworks', '{花火|はなび}'),
      T('paper lantern', 'ちょうちん'), T('festival', 'おまつり'), T('yukata', '{浴衣|ゆかた}'), T('goldfish', '{金魚|きんぎょ}'), T('hand fan', 'うちわ'), T('drum', 'たいこ'),
    ],
  };
  if (RB.festival) RB.festival.define('yoyo', {
    title: T('Water-balloon fishing', 'ヨーヨー{釣|つ}り'), seconds: 60, better: 'more', streaks: true, ui: 'yoyo',
    about: T('Balloons bob in the tub, each with a word on it. Hook the one you are asked for: read the labels.', '{言葉|ことば} の ヨーヨー を {釣|つ}る 。'),
  });
  if (RB.pastimes) RB.pastimes.define('festival', {
    order: 50, title: T('Festival games', '{祭|まつ}り の {遊|あそ}び'), kind: 'festival', companion: true, art: 'festival',
    venue: T('The festival hall in Manybridge, and the boat\'s corner, once the festival has been.', '{祭|まつ}り の あと も {遊|あそ}べる'),
    anywhere: T('Or with your companion anywhere safe.', '{道連|みちづ}れ と なら 、 {安全|あんぜん} な {場所|ばしょ} で どこ でも'),
    met: (s) => !!(RB.edition && RB.edition.of(s) >= 2) && !!((s.flags && s.flags.pt_festival) || (s.practice && s.practice.festival)),
    blurb: T('The stall games of the festival, kept after it. Practice is untimed and keeps nothing; a timed round keeps only your own best. Just for fun.', '{屋台|やたい} の {遊|あそ}び 。'),
    howto: [
      T('Choose Practice (untimed) or Timed each time you play.', '{練習|れんしゅう} か 、 {時間|じかん} を {計|はか}る か 。'),
      T('In a timed round the clock stops while a hint is open.', 'ヒント の {間|あいだ} 、 {時計|とけい} は {止|と}まる 。'),
    ],
    records: (s) => (RB.festival ? RB.festival.list().map((d) => ({ d, p: RB.festival.peek(s, d.id) })).filter((x) => x.p.timed).map((x) => ({ en: x.d.title.en + ', best', value: String(x.p.best) })) : []),
  });
})(RB.content);
