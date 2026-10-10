/* The Cloudroad (雲路, Kumoji), the region (expansion P12; plan 07_REGIONS.md R2; docs/future/work/P12_CLOUDROAD.md):
 * the old high highway from Lanternfall over the northern mountains, Chapter 10 of a twelve-chapter journey. Seven post
 * stations climb into cloud; the Mist Barrier stands between the sixth and the seventh; the High Pass and the Courier's
 * Hut are at the top, and over the pass lies Steamhollow's valley (Chapter 11). Sealed S3, option 1: a different road
 * from the Archive's, which it meets at the Last Lamp Hut beyond Steamhollow; the north fork above the Lantern Road
 * stays in mist until then (F-69). Here: its palette (cedar green, slate grey, cloud white, the ember orange of station
 * lanterns), its place on the route chart, and the Lantern Road's new way up at its east end, open once Kotonoha is
 * behind the party. The maps, people and story are in the other files of this folder. Nothing here appears in a
 * six-chapter journey. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const TL = RB.tiles;
  // cedar forest and stone-paved switchbacks, thatch, the checkpoint's grey fences; cloud white above; ember lanterns
  TL.PAL.cloudroad = {
    grass: ['#5a7454', '#68825e', '#7c946e', '#475e44'], dirt: ['#8c8270', '#9e9482', '#746a5a', '#b2a894'],
    stone: ['#868c8e', '#a0a6a6', '#6a7072'], water: ['#486a74', '#567a82', '#7e9ea2', '#e2ecec'],
    sand: ['#c2baa4', '#d2cab4', '#a8a08a'], wood: ['#6a5040', '#80624e', '#4e3a2e', '#9c7e66'],
    leaf: ['#36533c', '#426446', '#557a56', '#28402e'], trunk: ['#4a3a30', '#342820'],
    flower: ['#ece8dc', '#e08a4a', '#c8ccd8', '#f0c070'], reed: ['#9a9c80', '#b4b49a', '#7c7e64'],
    wall: ['#dcd6c8', '#c6c0b0', '#a8a294'], floor: ['#8a7660', '#766450', '#625242'], roof: ['#5a5248', '#48423a', '#36322c', '#746a5e'],
    snow: ['#eef1f3', '#d8dee4', '#bec8d0'], sky: '#e6eaec', dark: '#16191c',
  };
  TL.addRamps(TL.PAL.cloudroad);
  // above the cloud (the road past the Barrier, Kumoi, the High Pass): snow underfoot, paler stone, and the cloud sea
  // below drawn as slow white water
  TL.PAL.cloudtop = Object.assign({}, TL.PAL.cloudroad, {
    grass: ['#8a9a8c', '#98a898', '#aab8a8', '#76867a'], stone: ['#9aa0a4', '#b2b8bc', '#80868a'],
    water: ['#c8d2da', '#dae2e8', '#eaf0f4', '#ffffff'], leaf: ['#3e5446', '#4a624e', '#5e7660', '#2e4034'],
    sky: '#eef2f4', dark: '#1a1e22',
  });
  TL.addRamps(TL.PAL.cloudtop);

  C.places.cloudroad = {
    name: { en: 'The Cloudroad', jp: '{雲路|くもじ}' }, map: 'cr.oiwake', x: 4, y: 13, dir: 'right', pos: [478, 136], region: 'cloudroad', hub: true,
    desc: 'The old high highway over the northern mountains: seven post stations climbing into cloud.', edition: 2,
  };
  C.roads.push(['lanternfall', 'cloudroad', { edition: 2, if: 'ko_done' }]);

  // ---- the seam: the Lantern Road's east end, above the town ----------------------------------------------------------
  // In a twelve-chapter journey, once Kotonoha is behind the party, a worn way leaves the Lantern Road's top corner and
  // climbs north-east: the old highway. A waystone marks it (before then it reads as an old stone by a dead end).
  const lf = C.maps['lf.road'];
  if (lf) {
    lf.exits.push({ x: 35, y: 3, w: 1, h: 2, to: 'cr.oiwake', sp: 'from_lanternfall', dir: 'right', if: 'ed>=2&ko_done' });
    lf.props.push({ p: 'stone_marker', x: 33, y: 2, scene: 'cr.lf_waystone', if: 'ed>=2' });
  }
})(RB.content);
