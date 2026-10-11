/* The old guardians' shrines (expansion P15e; plan E16; content in src/content/guardians/): one place in each region
 * where its guardian sleeps, there only after the story (edition 2, postgame). Placed here, after every region's maps
 * have loaded; each tile is free and reachable from the map's way in (tests/unit/guardians.test.mjs). */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const SHRINES = [
    ['rw', 'rw.mill0', 13, 7, 'kr_stele'], ['sg', 'sg.office', 2, 4, 'chest'], ['co', 'co.kiln_core', 7, 4, 'kr_stele'],
    ['sb', 'sb.obs_dome', 3, 6, 'kr_stele'], ['lf', 'lf.bellhall', 13, 11, 'kr_stele'], ['mb', 'mb.firstbridge', 20, 14, 'kr_stele'],
    ['cr', 'cr.summit', 28, 13, 'kr_stele'], ['yn', 'yn.kettle', 16, 12, 'kr_stele'], ['ko', 'ko.garden', 20, 16, 'kr_stele'],
  ];
  C.guardianShrines = SHRINES;
  for (const [key, map, x, y, p] of SHRINES) {
    const m = C.maps[map];
    if (!m) continue;
    m.props = (m.props || []).concat([{ p, x, y, if: 'ed>=2&postgame', scene: 'gd.' + key, guardian: key }]);
  }
})(RB.content);
