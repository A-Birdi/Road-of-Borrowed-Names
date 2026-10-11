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
})(RB.content);
