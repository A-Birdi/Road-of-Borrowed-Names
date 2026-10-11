/* Steamhollow (湯ノ谷, Yunotani), the region (expansion P13; plan 07_REGIONS.md R3; docs/future/work/P13_STEAMHOLLOW.md):
 * a crowded hot-spring valley of inns below the Cloudroad Pass, Chapter 11 of a twelve-chapter journey, the last warm,
 * loud place before the end. Its palette (cedar and lacquer, steam white, sulphur yellow, persimmon dusk) and the
 * Steam Vents' (dark volcanic rock, sulphur crust, steam); its place on the route chart; the seams: the Cloudroad
 * Pass's way down to the north-east, open once the relay brings the valley's letter (yn_called), and the valley's north
 * road, which climbs to the foot of the Archive road where the Lantern Road's north fork joins it (open with yn_done:
 * the last chapter's opening plays there, as it always has, whichever way the party comes). The maps, people and story
 * are in the other files of this folder. Nothing here appears in a six-chapter journey. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const TL = RB.tiles;
  // wooden inns stacked up the valley (cedar, red lacquer on bridges and rails), steam white, sulphur on the rocks,
  // persimmon light in the paper windows at dusk
  TL.PAL.steamhollow = {
    grass: ['#6a7c52', '#7a8c5e', '#8e9e6c', '#566842'], dirt: ['#9a8a6e', '#ac9c80', '#80725a', '#c0b096'],
    stone: ['#8e8a82', '#a8a49a', '#6e6a62'], water: ['#5a8a8e', '#6c9c9e', '#9ac2c0', '#eef4f2'],
    sand: ['#d8c88e', '#e6d8a0', '#bcaa72'], wood: ['#6e4a36', '#865a42', '#52362a', '#a2765a'],
    leaf: ['#3e5a3c', '#4a6a46', '#5e8056', '#2e4430'], trunk: ['#4e3a2e', '#382a22'],
    flower: ['#e8763a', '#f0e6d2', '#c83a32', '#e8c84a'], reed: ['#a8a07a', '#c0b890', '#8a8462'],
    wall: ['#e6dcc6', '#d2c6ae', '#b2a690'], floor: ['#8e7258', '#7a604a', '#644e3c'], roof: ['#4e4a4e', '#3e3a3e', '#2e2a2e', '#686268'],
    snow: ['#f4f2ee', '#e2ded6', '#ccc6bc'], sky: '#efe6d8', dark: '#1c1814',
  };
  TL.addRamps(TL.PAL.steamhollow);
  // the Steam Vents under the town: black volcanic rock crusted yellow, hot water steaming green-blue
  TL.PAL.yn_vents = Object.assign({}, TL.PAL.steamhollow, {
    grass: ['#5a5a4a', '#6a6a54', '#4a4a3e', '#3e3e34'], dirt: ['#4a4038', '#5a4e44', '#3a322c', '#6a5e52'],
    stone: ['#4e4a46', '#66625c', '#363230'], water: ['#4a7e7a', '#5a908a', '#8cbab2', '#e6f0ec'],
    sand: ['#c8b45a', '#dcc86a', '#a8963e'], wall: ['#4e4844', '#3e3834', '#2e2a26'], floor: ['#5a4e44', '#4a4038', '#3a322c'],
    sky: '#2a2622', dark: '#0e0c0a',
  });
  TL.addRamps(TL.PAL.yn_vents);

  C.places.steamhollow = {
    name: { en: 'Steamhollow', jp: '{湯|ゆ}ノ{谷|たに}' }, map: 'yn.upper', x: 3, y: 15, dir: 'right', pos: [496, 66], region: 'steamhollow', hub: true,
    desc: 'A crowded valley of hot-spring inns below the Cloudroad Pass: steam, lanterns and wooden sandals on stone.', edition: 2,
  };
  // the Cloudroad Pass itself, a place to come back to once the chapter is done (the way down starts there)
  C.places.cr_summit = {
    name: { en: 'The Cloudroad Pass', jp: '{雲路峠|くもじとうげ}' }, map: 'cr.summit', x: 2, y: 10, dir: 'right', pos: [492, 110], region: 'cloudtop',
    desc: 'The top of the old highway: the cloud sea below on every side, and the way down to the valley of steam.', edition: 2,
  };
  C.roads.push(['cloudroad', 'cr_summit', { edition: 2, if: 'cr_done' }]);
  C.roads.push(['cr_summit', 'steamhollow', { edition: 2, if: 'yn_called' }]);
  C.roads.push(['steamhollow', 'sa_hut', { edition: 2, if: 'yn_done' }]);

  // ---- the seam at the top: the Cloudroad Pass's way down to the north-east ----------------------------------------
  // Until the relay brings the valley's letter the way is under snow (cr.summit_east says so); after it, the valley's
  // people have dug it out from below, and the trigger gives way to an exit.
  const top = C.maps['cr.summit'];
  if (top) {
    top.triggers = (top.triggers || []).map((t) => (t.scene === 'cr.summit_east' ? Object.assign({}, t, { if: '!yn_called' }) : t));
    top.exits.push({ x: 35, y: 10, w: 1, h: 2, to: 'yn.descent', sp: 'from_pass', dir: 'right', if: 'ed>=2&yn_called' });
    top.spawn = Object.assign({ from_steam: [34, 10, 'left'] }, top.spawn);
  }
})(RB.content);
