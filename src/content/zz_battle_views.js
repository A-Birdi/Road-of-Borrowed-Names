/* Authored battle views (§19.2 of the battle-art addendum): what a map's
 * tiles and props cannot say about how a battle there should be composed.
 * Read by RB.battlePlaces (src/ui/76_battle_places.js) as the map
 * definition's optional `battleView`:
 *   note     — what the view must show truthfully (documentation; recorded)
 *   view     — a composition override for the whole map: { mode: 'room' |
 *              'hall' | 'land', yBack, yNear, x0, x1 }
 *   zones    — the same per part of a large map: [{ name, x0, y0, x1, y1, view }]
 *   stairs   — { 'x,y': 'up' | 'down' | 'east' | 'west' } where the tiles do
 *              not say which way the stairs lead
 *   ladders  — { 'x,y': { hatch: condition (open while it holds), rope } }
 * Nothing here moves, adds or removes anything on a map: the maps are not
 * redesigned; this only says how to read them. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const view = (id, v) => { if (C.maps[id]) C.maps[id].battleView = Object.assign({}, C.maps[id].battleView || {}, v); };

  // The mill's ground floor: the ladder on the west wall goes up to the loft
  // through a trapdoor that the jammed gear shaft holds shut until the gears
  // are mended (scene rw.m1_ladder); the stairs at the east front go down to
  // the wheel pit (rw.m1_stairs); the gear train is on the north wall.
  view('rw.mill1', {
    note: 'Ground floor: ladder up on the west wall (hatch shut until the gears are mended), gear train on the north wall, stairs down to the wheel pit at the east front.',
    stairs: { '12,9': 'down' },
    ladders: { '2,2': { hatch: 'rw_gears' } },
  });
  // The wheel pit under the mill: the stairs by the west wall come up from
  // the ground floor; the millrace runs north-south under a footbridge.
  view('rw.mill0', {
    note: 'Wheel pit: stairs up to the ground floor by the west wall, the millrace across the middle under its footbridge.',
    stairs: { '2,8': 'up' },
  });
  // The observatory gallery: the ladder in the middle goes up to the dome
  // through a hatch the crank opens (exit locked 'sb.hatch' until sb_crank).
  view('sb.obs_gallery', {
    note: 'Gallery: the ladder up to the dome, its hatch shut until the crank is turned.',
    ladders: { '10,4': { hatch: 'sb_crank' } },
  });
  // The chart room: the stairs at the east wall lead through its opening to
  // the gallery; the ice wall closes them until the log is solved.
  view('sb.obs_charts', {
    note: 'Chart room: stairs through the east wall to the gallery, closed by ice until the log is solved.',
    stairs: { '14,5': 'east' },
  });
  // The bell tower's middle floor: a rope ladder up to the loft (lf.ladder_mid).
  view('lf.tower_mid', {
    note: 'Middle floor: the rope ladder up to the loft on the west side; the flooded half drains with the lever.',
    ladders: { '3,3': { rope: true } },
  });
})(RB.content);
