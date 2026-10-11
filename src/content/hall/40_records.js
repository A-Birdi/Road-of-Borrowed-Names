/* The Hall of a Hundred Tales: its records (expansion P15; plan 04_DUNGEONS.md D9 Rewards; 09_RECORDS.md K1). A stamp
 * for each tale relit, pressed as soon as the wing is done (no stand: the Hall is its own place); hidden until then,
 * with spoiler-safe words. Nothing here asks for a route, a tactical setting, an input mode, going without help or a
 * time (C-13). The tales' illustrated pages for the travel volume come with the art pass's paintings (P16); the
 * optional note of each wing (route, tactics, help used by its L2 category) is kept by src/engine/98h_hall.js. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  C.stamps = C.stamps || {};
  const add = (id, d) => { C.stamps[id] = Object.assign({ id }, d); };
  C.hallStamp = function (n, title, ink) {
    add('hall.w' + n, { family: 'dungeon', title, criteria: T('The Hall of a Hundred Tales: a tale relit.', '{百物語|ひゃくものがたり} の {館|やかた}'), hidden: true,
      when: 'ed>=2&hall.w' + n, stand: null, design: { shape: 'hexagon', motif: 'lantern', ink: ink || '#8a5a1e' } });
  };
  C.hallStamp(1, T('The Lamp at the Crossroads', '{辻|つじ} の {灯籠|とうろう}'), '#2a4a5e');
  C.hallStamp(2, T('The Fox\'s Wedding', '{狐|きつね} の {嫁入|よめい}り'), '#b0402a');
  C.hallStamp(3, T('The Bell Before Dawn', '{夜明|よあ}け {前|まえ} の {鐘|かね}'), '#3a3a6a');
  C.hallStamp(4, T('The Borrowed Umbrella', '{借|か}りた {傘|かさ}'), '#4a6a8a');
  C.hallStamp(5, T('The Two Wells', '{二|ふた}つ の {井戸|いど}'), '#5a6a3a');
  C.hallStamp(6, T('The Toll That Changed', '{変|か}わった {通行料|つうこうりょう}'), '#9a3a22');
  C.hallStamp(7, T('The House That Remembers', '{覚|おぼ}えて いる {家|いえ}'), '#3a2e2a');
  C.hallStamp(8, T('Three Witnesses at the Inn', '{宿|やど} の {三人|さんにん} の {証人|しょうにん}'), '#3a4a6a');
  C.hallStamp(9, T('The Crane\'s Return', '{鶴|つる} の {恩返|おんがえ}し'), '#8a2a2a');
  C.hallStamp(10, T('The Hundredth Tale', '{百話目|ひゃくわめ} の {話|はなし}'), '#b8862a');

  // the travel volume's page of each tale (D9 Rewards, K2): witnessed when the tale is told, or revealed beforehand by
  // confirmation (then viewable, never witnessed or completed: H1); an interim plate until the art pass paints it (P16)
  const ORD = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'];
  const NUM = ['{一|いち}', '{二|に}', '{三|さん}', '{四|よん}', '{五|ご}', '{六|ろく}', '{七|なな}', '{八|はち}', '{九|きゅう}', '{十|じゅう}'];
  if (RB.volume) for (let n = 1; n <= 10; n++) {
    const st = C.stamps['hall.w' + n];
    RB.volume.add({ id: 'hall.w' + n, chapter: 'post', kind: 'hall', special: true, flag: 'hall_w' + n + '_done', title: st.title, plate: st.title.jp,
      criteria: { en: n === 10 ? 'The Hall of a Hundred Tales: the hundredth tale, your own, told.' : 'The Hall of a Hundred Tales: the ' + ORD[n - 1] + ' tale told.', jp: '{百物語|ひゃくものがたり} の {館|やかた} ・ {第|だい}' + NUM[n - 1] + ' の {話|はなし}' } });
  }

  // the keepsake Keeper Tsuru gives when the Hundred is told (D9 Rewards: a commemorative cosmetic)
  C.items = C.items || {};
  C.items.hall_lantern = { name: T('Lantern of the Hundred', '{百|ひゃく} の {灯|ひ} の {提灯|ちょうちん}'), desc: 'The Hall\'s last hand lantern, from Keeper Tsuru when the hundredth tale was told. A keepsake to carry; it changes only how you look.', slot: 'cosmetic', acc: 'lamp' };
})(RB.content);
