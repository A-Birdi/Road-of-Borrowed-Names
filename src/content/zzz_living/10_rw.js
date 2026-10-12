/* Reedwake's Living World (C-87; docs/future/work/LW1_ROLLOUT.md). After you have set out (`departed`), three of
 * its people keep routines of their own (W2): Oto leaves his shoes for the well and Hana's tea, Kiku dries her
 * thread on the green or reads the old pattern book in the Lantern Hall, Mame watches Yasu fish or haunts Bunta's
 * shavings. Hana and Tomo can be asked after people (W3); Bunta, busy, won't say. */
var RB = (globalThis.RB = globalThis.RB || {});
(function (L) {
  'use strict';
  L.town('reedwake', {
    maps: ['rw.village', 'rw.hall', 'rw.tea', 'rw.apoth', 'rw.warehouse', 'rw.carpenter', 'rw.house1', 'rw.house2', 'rw.ferry'],
    care: ['ch2_done', 'mb2_done', 'ko_done'],
    after: 'departed',
  });
  L.routine('reedwake', 'oto', { base: 'rw.house1:oto', slots: [
    { map: 'rw.village', x: 22, y: 18, dir: 'left', line: ['{井戸|いど} の {水|みず} は {冷|つめ}たくて いい な 。 {靴|くつ} は ちょっと {休憩|きゅうけい} だ 。', 'Nice cold water in this well. The shoes can wait a bit.'] },
    { map: 'rw.tea', x: 4, y: 4, dir: 'left', line: ['ハナ さん の お{茶|ちゃ} を {飲|の}まない と 、 {一日|いちにち} が {始|はじ}まらない ん だ よ 。', 'The day doesn\'t start till I\'ve had Hana\'s tea.'] },
  ] });
  L.routine('reedwake', 'kiku', { base: 'rw.house2:kiku', slots: [
    { map: 'rw.village', x: 13, y: 26, dir: 'up', line: ['{糸|いと} を お{日様|ひさま} に {当|あ}てて いる の 。 {色|いろ} が {落|お}ち{着|つ}く の よ 。', 'I\'m giving the thread some sun. It settles the colour.'] },
    { map: 'rw.hall', x: 7, y: 3, dir: 'up', perform: 'read', line: ['ここ に {古|ふる}い {織|お}り{方|かた} の {本|ほん} が ある の 。 {目|め} が {疲|つか}れる けれど ね 。', 'There\'s a book of old weaving patterns here. Hard on the eyes, though.'] },
  ] });
  L.away('reedwake', 'kiku', { map: 'rw.house2', x: 6, y: 2, p: 'fw_note', line: ['{書|か}き{置|お}き 。 「{広場|ひろば} か {灯|あか}り{堂|どう} に います 。 キク」', 'A note: "On the green, or at the Lantern Hall. —Kiku"'] });
  L.routine('reedwake', 'mame', { base: 'rw.village:mame', slots: [
    { map: 'rw.village', x: 32, y: 24, dir: 'down', line: ['ヤス さん が {魚|さかな} を {釣|つ}る の 、 {見|み}てる の 。 しー っ 、 {静|しず}か に ！', 'I\'m watching Yasu fish. Shh, be quiet!'] },
    { map: 'rw.carpenter', x: 3, y: 4, dir: 'right', line: ['ブンタ さん が ね 、 {木|き} の くず 、 もらって いい って 。', 'Bunta says I can keep the wood shavings.'] },
  ] });

  // ---- who can be asked after whom (W3) -----------------------------------------------------------------------------
  L.asks('hana');
  L.knows('hana', { oto: 'routine', kiku: 'routine', mame: 'routine', bunta: 'routine', yasu: 'routine', tomo: 'routine', koji: 'routine', tsuru: 'routine', sae: 'loose' });
  L.asks('tomo');
  L.knows('tomo', { mame: 'routine', kiku: 'routine', hana: 'routine', oto: 'loose', yasu: 'loose', bunta: 'loose', koji: 'loose', sae: 'loose' });
  L.asks('bunta');
  L.cold('bunta', ['{人|ひと} の {居場所|いばしょ} なんぞ {知|し}らん 。 {仕事|しごと} {中|ちゅう} だ 。', 'Where people are is none of my business. I\'m working.']);
  L.usual('yasu', ['ヤス さん なら 、 いつも {桟橋|さんばし} の {先|さき} で {釣|つ}り を して います よ 。', 'Yasu? Always fishing off the end of the pier.']);
  L.usual('tsuru', ['ツル さん は 、 たいてい {灯|あか}り{堂|どう} に います 。', 'Tsuru\'s usually at the Lantern Hall.']);
  L.usual('bunta', ['ブンタ さん は {工房|こうぼう} から {出|で}て きません よ 。', 'Bunta never leaves his workshop.']);
  L.usual('tomo', ['トモ さん は {洗濯物|せんたくもの} の ところ に いる でしょう 。', 'Tomo will be by her washing.']);
  L.usual('hana', ['ハナ さん は {茶屋|ちゃや} です よ 。 いつも です 。', 'Hana\'s at the teahouse. Always.']);
  L.usual('koji', ['コウジ さん は {渡|わた}し{場|ば} か 、 {茶屋|ちゃや} です ね 。', 'Kōji\'s at the ferry, or the teahouse.']);
})(RB.living);
