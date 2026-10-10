/* The press's waiting reactions stay first (expansion P09b; src/content/mp/30_press.js adds them). Later chapters put
 * their own lines at the head of the same people's talk lists (a leaf come home, a sea errand), and a reaction waits
 * only until it is heard, so it goes back in front of them. This file sorts last, after every chapter's content. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  for (const r of (C.press && C.press.readers) || []) {
    const m = C.maps[r.map];
    for (const n of (m && m.npcs) || []) {
      if (n.id !== r.npc || !Array.isArray(n.talk)) continue;
      const i = n.talk.findIndex((x) => x && x.scene === 'mp.rx_' + r.id);
      if (i > 0) n.talk.unshift(n.talk.splice(i, 1)[0]);
    }
  }
})(RB.content);
