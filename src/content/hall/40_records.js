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
})(RB.content);
