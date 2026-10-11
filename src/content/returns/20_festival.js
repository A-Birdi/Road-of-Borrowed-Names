/* Returns (expansion P15g; sealed S8): Cinder Orchard's yearly festival. The story's festival is a one-time night
 * (co.festival, entered once); after the story, in a twelve-chapter journey, Hiro asks whether you're coming to this
 * year's, and the square fills again: a repeatable night map of its own, the story's square with three of the
 * festival games' stalls (the shell every booth game uses: src/engine/72f_festival.js), and real ways out. Suzu
 * promised Hiro twenty festivals (Chapter 3: 「祭り二十回分、貸してある。一回ずつ返してもらう。」); each night
 * you come with her is one more paid back, and Hiro keeps count (rt_fest_suzu). Every night counts in rt_fest_n. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  const base = C.maps['co.festival'];
  const clone = (x) => JSON.parse(JSON.stringify(x));
  C.maps['co.festival_yearly'] = Object.assign({}, base, {
    name: T('This Year\'s Festival', '{今年|ことし} の {秋祭|あきまつ}り'), edition: 2, noTravel: true,
    noTravelWhy: { en: 'It\'s festival night. Walk out of the square when you\'re ready to go.' },
    terrain: clone(base.terrain), structs: clone(base.structs),
    props: base.props.filter((p) => p.p !== 'co_lookout' && p.p !== 'co_seat').map((p) => Object.assign({}, p)).concat([
      { p: 'mp_booth', x: 4, y: 26, scene: 'mp.booth_yoyo', o: { game: 'yoyo' } },
      { p: 'mp_booth', x: 9, y: 26, scene: 'mp.booth_kuji', o: { game: 'kuji' } },
      { p: 'mp_booth', x: 14, y: 26, scene: 'mp.booth_taiko', o: { game: 'taiko' } },
      { p: 'co_seat', x: 26, y: 18, o: { named: true }, scene: 'rt.fest_seat' },
    ]),
    npcs: [
      { id: 'hiro', x: 25, y: 19, dir: 'up', talk: 'rt.fest_hiro' },
      { id: 'co_ume', x: 18, y: 16, dir: 'down', talk: 'rt.fest_ume' },
      { id: 'co_goro', x: 12, y: 13, dir: 'down', talk: 'rt.fest_goro' },
      { id: 'co_asa', x: 29, y: 14, dir: 'down', talk: 'rt.fest_asa' },
      { id: 'co_kotaro', x: 20, y: 22, dir: 'up', wander: 2, talk: 'rt.fest_kotaro' },
      { id: 'suzu', x: 24, y: 13, dir: 'down', if: 'comp!=suzu', talk: 'rt.fest_suzu' },
    ],
    exits: [{ x: 0, y: 18, w: 1, h: 2, to: 'co.village', tx: 1, ty: 18, dir: 'left' }, { x: 24, y: 0, w: 2, h: 1, to: 'co.village', tx: 24, ty: 1, dir: 'up' }],
    triggers: [],
    onEnter: [{ scene: 'rt.fest_enter' }],
    spawn: { default: [23, 17, 'down'] },
  });
  // Hiro asks, from the village, once the story is over
  const hiro = C.maps['co.village'].npcs.find((n) => n.id === 'hiro' && Array.isArray(n.talk));
  if (hiro) hiro.talk.unshift({ if: 'ed>=2&postgame', scene: 'rt.hiro_ask' });

  RB.script.add(`
@scene rt.hiro_ask
!call co.hiro_post
hiro: {今夜|こんや} は 、 {今年|ことし} の {祭|まつ}り だ 。 {来|く}る か ？ || Tonight's this year's festival. Coming?
!choice
* {行|い}く || Go -> go
* {今|いま} は いい || Not now -> no
:go
!warp co.festival_yearly 23 17 down
!end
:no
hiro: {灯|ひ} は {毎年|まいとし} {点|つ}く 。 {急|いそ}が なくて いい 。 || The lanterns are lit every year. No hurry.

@scene rt.fest_enter
!var rt_fest_n + 1
?(comp=suzu) !var rt_fest_suzu + 1
narr: {広場|ひろば} に 、 {今年|ことし} も ガラス の {灯籠|とうろう} が {並|なら}んだ 。 {屋台|やたい} の {声|こえ} 、 {太鼓|たいこ} の {音|おと} 。 || Once again the glass lanterns stand around the square. Stall-keepers calling, the beat of a drum.
?(var.rt_fest_n=1) narr: {物語|ものがたり} の {夜|よる} の {祭|まつ}り と は 、 {少|すこ}し {違|ちが}う 。 {今年|ことし} は 、 {誰|だれ} も {急|いそ}いで いない 。 || It isn't quite like the festival on the night of the story. This year, nobody is in a hurry.

@scene rt.fest_hiro
?(comp=suzu&var.rt_fest_suzu=1) hiro: {来|き}た な 。 これ で {一回|いっかい} {分|ぶん} 、 {返|かえ}して もらった 。 {残|のこ}り は 、 {十九回|じゅうきゅうかい} だ 。 || You came. That's one paid back. Nineteen to go.
?(comp=suzu&var.rt_fest_suzu>=2&var.rt_fest_suzu<5) hiro: また {一回|いっかい} {分|ぶん} 。 {帳面|ちょうめん} に {付|つ}けて おく 。 || Another one paid back. I'm writing it down.
?(comp=suzu&var.rt_fest_suzu>=5) hiro: もう {数|かぞ}えて いない 。 …… {嘘|うそ} だ 。 {全部|ぜんぶ} {数|かぞ}えて いる 。 || I've stopped counting. …That's a lie. I'm counting every one.
?(!comp=suzu) hiro: スズ は {来|こ}ない の か 。 {帳面|ちょうめん} の {貸|か}し が 、 また {一回|いっかい} {残|のこ}った な 。 || Suzu isn't with you? That's one more still owing in my book.
hiro: {窯|かま} の {火|ひ} は 、 {今年|ことし} も {無事|ぶじ} だ 。 {風|かぜ} の {強|つよ}い {夜|よる} は 、 {上|うえ} の {窓|まど} を {開|あ}けない 。 {皆|みんな} 、 {覚|おぼ}えた 。 || The kiln fire's safe again this year. On windy nights, nobody opens the upper vent. Everyone remembers now.

@scene rt.fest_seat
narr: {名前|なまえ} の ついた {席|せき} 。 {今年|ことし} も 、 {空|あ}けて ある 。 || The seat with a name on it. It's been kept free this year as well.
?(comp=suzu) comp: …… {毎年|まいとし} 、 {一番|いちばん} いい {席|せき} ね 。 || …The best seat in the house, every year.

@scene rt.fest_ume
co_ume: {今年|ことし} の {柿|かき} は 、 よく {熟|う}れた よ 。 {祭|まつ}り の {日|ひ} に {間|ま}に{合|あ}う と は ね 。 || The persimmons ripened well this year. Just in time for the festival.

@scene rt.fest_goro
co_goro: {火|ひ} の {番|ばん} は 、 {若|わか}い {者|もの} に {任|まか}せた 。 {今夜|こんや} は 、 {見|み}る だけ だ 。 || I've handed the fire watch to the young ones. Tonight I only watch.

@scene rt.fest_asa
co_asa: {屋台|やたい} で 、 {言葉|ことば} の {遊|あそ}び が できる の よ 。 {八百橋|やおばし} から {来|き}た {人|ひと} が 、 {教|おし}えて くれた の 。 || There are word games at the stalls. Someone from Manybridge showed us how.

@scene rt.fest_kotaro
co_kotaro: ねえ ねえ 、 {来年|らいねん} も {来|く}る ？ || Hey, hey, will you come next year too?

@scene rt.fest_suzu
suzu: {今夜|こんや} は 、 {客|きゃく} の {側|がわ} よ 。 {一年|いちねん} に {一度|いちど} くらい 、 いい でしょう ？ || Tonight I'm in the audience. Once a year, that's allowed, isn't it?
`);
})(RB.content);
