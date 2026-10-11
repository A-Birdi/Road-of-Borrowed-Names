/* Steamhollow, Chapter 11: the side stories (expansion P13f; plan R3 "Side quests (5)"). The quests and the map
 * wiring are here; the scenes are in 26_scenes_side.js, the tasks in 35_side_learning.js.
 *   yn_masseur  The Masseur's Lost Words: Bunkichi works by touch and by the old patter-song his teacher sang over
 *               every back, and he has lost the words. Three people remember a verse each (Okiyo, Kihachi, Oshige from
 *               the ridge, whose village sang it at harvest); put back in order, the song is his again.
 *   yn_wedding  A Wedding Party's Booking: the go-between Kume booked the Upper House for the groom's family and the
 *               Lower House for the bride's, both for the feast, the same night. Neither house will give way. The
 *               feast goes to neutral ground, the guild hall, with each house cooking half (〜ことにする).
 *   yn_actor    The Retired Actor: Ginnojō, the old comic of Manybridge's Playhouse Row, taking the waters, has been
 *               asked by the troupe for one last bit and cannot remember the last line of his famous one. Onatsu
 *               quotes it wrong; an old Playhouse Row playbill in the troupe's trunks has it right. With Suzu, he is
 *               her old idol, and he knows her timing.
 *   yn_eggs     Eggs for Everyone: after Tama's recipe card, three spring eggs for three newcomers from the ridge.
 *   yn_poet     The Footbath Poet: Kanae writes the valley one short story at a time; her newest, about a spring that
 *               went cold when two brothers stopped speaking, is a story room to step into (A38): read it panel by
 *               panel, put it back in order, and answer a question or two if you like.
 * Twelve-chapter journeys only (Steamhollow is). Nothing here gates the main story. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const T = (jp, en) => ({ jp, en });
  const Q = (id, title, stages) => (C.quests[id] = { chapter: 'yn', title, stages, reward: { flags: [id + '_done'] } });
  Q('yn_masseur', T('{按摩|あんま} の {忘|わす}れた {歌|うた}', 'The Masseur\'s Lost Words'), [
    T('{按摩|あんま} の ブンキチ は 、 {師匠|ししょう} の {揉|も}み{歌|うた} の {言葉|ことば} を {忘|わす}れた 。 {覚|おぼ}えて いる {人|ひと} を {探|さが}そう 。', 'Bunkichi the masseur has lost the words of his teacher\'s massage song. Find people who remember it.'),
    T('{三|みっ}つ の {歌詞|かし} が {集|あつ}まった 。 ブンキチ に {届|とど}けよう 。', 'Three verses gathered. Take them to Bunkichi.'),
  ]);
  Q('yn_wedding', T('{婚礼|こんれい} の {予約|よやく}', 'A Wedding Party\'s Booking'), [
    T('{仲人|なこうど} の クメ が 、 {上|かみ}の{湯|ゆ} と {下|しも}の{湯|ゆ} に {同|おな}じ {夜|よる} の {宴|うたげ} を {頼|たの}んで しまった 。 {花婿|はなむこ} の ヨシマツ の {話|はなし} を {聞|き}こう 。', 'Kume the go-between booked the feast at both the Upper and Lower Houses for the same night. Hear Yoshimatsu the groom.'),
    T('ヨシマツ は 、 どこ でも いい と {言|い}う 。 クメ に 、 {両方|りょうほう} の {顔|かお} が {立|た}つ {案|あん} を {出|だ}そう 。', 'Yoshimatsu says anywhere will do. Offer Kume a plan that saves face for both.'),
  ]);
  Q('yn_actor', T('{引退|いんたい} した {役者|やくしゃ}', 'The Retired Actor'), [
    T('ギンノジョウ は 、 {昔|むかし} の {当|あ}たり{芸|げい} の {最後|さいご} の {台詞|せりふ} を {思|おも}い{出|だ}せない 。 {町|まち} の {噂好|うわさず}き に {聞|き}いて みよう 。', 'Ginnojō can\'t remember the last line of his famous old bit. Ask the town gossip.'),
    T('オナツ の {覚|おぼ}え{方|かた} は {違|ちが}う らしい 。 {一座|いちざ} の {葛籠|つづら} に 、 {古|ふる}い {番付|ばんづけ} が ある かも しれない 。', 'Onatsu seems to have it wrong. There might be an old playbill in the troupe\'s trunks.'),
    T('{古|ふる}い {番付|ばんづけ} に 、 {台詞|せりふ} が {刷|す}って あった 。 ギンノジョウ に {見|み}せよう 。', 'The old playbill has the line printed on it. Show Ginnojō.'),
  ]);
  Q('yn_eggs', T('{皆|みんな} に {卵|たまご} を', 'Eggs for Everyone'), [
    T('タマ の {温泉卵|おんせんたまご} を 、 {尾根|おね} から {来|き}た {三人|さんにん} に {配|くば}ろう 。 ヤスケ 、 ツネジ 、 オシゲ 。', 'Hand out Tama\'s spring eggs to three people from the ridge: Yasuke, Tsuneji and Oshige.'),
  ]);
  Q('yn_poet', T('{足湯|あしゆ} の {詩人|しじん}', 'The Footbath Poet'), [
    T('{棚田|たなだ} の {足湯|あしゆ} の カナエ が 、 {新|あたら}しい {短|みじか}い {話|はなし} を {読|よ}んで ほしい と {言|い}う 。', 'Kanae at the terrace footbath would like you to read her newest short story.'),
  ]);

  // ---- people placed for these stories ------------------------------------------------------------------------------
  const add = (mapId, n) => { const m = C.maps[mapId]; if (m) m.npcs.push(n); };
  add('yn.upper', { id: 'yn_bunkichi', x: 9, y: 18, dir: 'right', talk: [{ if: 'yn_masseur_done', scene: 'yn.bunkichi_idle' }, { scene: 'yn.bunkichi' }] });
  add('yn.upper', { id: 'yn_kume', x: 28, y: 13, dir: 'down', if: '!yn_wedding_done|yn_done', talk: [{ if: 'yn_wedding_done', scene: 'yn.kume_after' }, { if: 'quest.yn_wedding>=1', scene: 'yn.kume_plan' }, { scene: 'yn.kume' }] });
  add('yn.lower', { id: 'yn_yoshimatsu', x: 33, y: 17, dir: 'left', talk: [{ if: 'yn_wedding_done', scene: 'yn.yoshimatsu_after' }, { scene: 'yn.yoshimatsu' }] });
  // Oshige, in the Upper House's lobby once the rooms are settled (away at the dispensary during Mio's night apart)
  add('yn.kami', { id: 'yn_oshige', x: 11, y: 6, dir: 'left', if: 'yn_rooms_done&!yn_mio_night|yn_mio_back', talk: [{ if: 'quest.yn_eggs=0&item.yn_eggs&!yn_egg_oshige', scene: 'yn.egg_oshige' }, { if: 'quest.yn_masseur=0&!yn_verse3', scene: 'yn.verse_oshige' }, { scene: 'yn.oshige' }] });
  // the egg and verse talk options go first on the people who already stand in the valley
  const first = (mapId, id, opts) => { const n = ((C.maps[mapId] || {}).npcs || []).find((x) => x.id === id); if (n) n.talk = opts.concat(Array.isArray(n.talk) ? n.talk : [{ scene: n.talk }]); };
  first('yn.descent', 'yn_yasuke', [{ if: 'quest.yn_eggs=0&item.yn_eggs&!yn_egg_yasuke', scene: 'yn.egg_yasuke' }]);
  first('yn.lower', 'yn_tsuneji', [{ if: 'quest.yn_eggs=0&item.yn_eggs&!yn_egg_tsuneji', scene: 'yn.egg_tsuneji' }]);
  first('yn.kami', 'yn_okiyo', [{ if: 'quest.yn_masseur=0&!yn_verse1', scene: 'yn.verse_okiyo' }]);
  first('yn.upper', 'yn_kihachi', [{ if: 'quest.yn_masseur=0&!yn_verse2', scene: 'yn.verse_kihachi' }]);
  first('yn.lower', 'yn_onatsu', [{ if: 'quest.yn_actor=0', scene: 'yn.onatsu_line' }]);
})(RB.content);
