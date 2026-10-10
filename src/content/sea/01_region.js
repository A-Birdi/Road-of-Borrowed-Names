/* The sea (expansion P11c; plan 06_WORLD.md W7–W8; docs/future/work/P11_SEA.md; the rules in src/engine/72v_sail.js):
 * the ports the boat can reach, the coastal sea it sails, the cabin below deck, and the boat at each port's pier once
 * she is yours. Twelve-chapter journeys only.
 *
 * The sea map lies the way the chart does: the coast along the north (Sazanami's bay to the west, Saltglass harbour,
 * the East Landing's cove just east of it, the river mouth below Manybridge far to the east), open water to the south
 * with a few rocks and islets, and Kotonoha far out to the south-west, its jetty on the island's east side. Sazanami's
 * and the East Landing's ports are added with their towns (src/content/sz/, src/content/el/). Reedwake's river landing
 * is not a port of the boat's: the river is the barges' (F-76). */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C, K) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  const TL = RB.tiles;
  // the open sea: deep blue-green water, pale shoals, grey-green headlands
  TL.PAL.sea = Object.assign({}, TL.PAL.saltglass || {}, {
    water: ['#2c6e8a', '#357e9a', '#58a0b8', '#e2f2f2'], sand: ['#d8ceb0', '#e6dec4', '#bcb090'],
    grass: ['#6e9a74', '#7eaa82', '#94bc94', '#567e5e'], leaf: ['#3e6a4e', '#4e7e5c', '#689a72', '#2e543c'],
    stone: ['#8e989a', '#a8b0b2', '#727a7e'], sky: '#d6e8ec', dark: '#101a20',
  });
  TL.addRamps(TL.PAL.sea);

  // ---- the ports -------------------------------------------------------------------------------------------------
  C.ports = C.ports || {};
  C.ports.saltglass = { place: 'saltglass', name: T('Saltglass', '{潮硝子|しおがらす}'),
    dock: { map: 'sg.harbor', x: 35, y: 33, dir: 'right' }, boat: { x: 36, y: 33 },
    sea: { x: 26, y: 10, dir: 'down' }, zone: { x: 22, y: 2, w: 10, h: 8 } };
  C.ports.manybridge = { place: 'manybridge', name: T('Manybridge', '{八百橋|やおばし}'), if: 'mb_arrived',
    dock: { map: 'mb.pier', x: 16, y: 17, dir: 'right' }, boat: { x: 17, y: 17 },
    sea: { x: 63, y: 10, dir: 'down' }, zone: { x: 59, y: 0, w: 10, h: 9 } };
  C.ports.kotonoha = { place: 'kotonoha', name: T('Kotonoha', '{言|こと}の{葉|は}{島|じま}'), if: 'ko_arrived|sea_ko_hint', reach: 'sea_ko_hint',
    dock: { map: 'ko.shore', x: 19, y: 22, dir: 'left' }, boat: { x: 18, y: 22 },
    sea: { x: 16, y: 35, dir: 'right' }, zone: { x: 14, y: 31, w: 6, h: 9 } };
  C.seaMap = 'sea.coast';

  // ---- the coastal sea (the route chart files it, and the cabin, under Saltglass, the boat's home harbour) -------
  C.maps['sea.coast'] = {
    name: T('The Coastal Sea', '{沖|おき}'), region: 'sea', place: 'saltglass', music: 'sea', edition: 2,
    sea: true, legend: RB.sail.LEGEND,
    noTravel: true, noTravelWhy: { en: 'You are at sea: bring the boat into a port, or let the crew sail her in.' },
    ambient: { weather: 'motes', tint: 'rgba(170,210,220,0.05)' },
    terrain: K.build(72, 44, '~', (k) => {
      k.rect(0, 0, 72, 4, '.');                          // the coast, to the north
      k.ragged('top', '.', 7, 9011);                     // its headlands and inlets
      for (let x = 0; x < 72; x++) { let y = 0; while (y < 44 && k.get(x, y) === '.') y++; if (y < 44) k.set(x, y, 's'); }
      k.scatter('T', 26, 9012, [0, 0, 72, 3], '.');      // pines on the headlands
      k.rect(8, 2, 5, 7, '~');                           // Sazanami's bay
      k.rect(24, 1, 6, 9, '~');                          // Saltglass harbour mouth
      k.rect(33, 3, 4, 7, '~');                          // the East Landing's cove
      k.rect(62, 0, 4, 9, '~');                          // the river mouth below Manybridge
      k.scatter('h', 12, 9014, [20, 14, 50, 26], '~');   // rocks out at sea
      k.rect(40, 18, 3, 2, 's'); k.set(41, 18, 'r');     // an islet with a rock
      k.rect(53, 27, 5, 3, 's'); k.rect(54, 27, 3, 2, '.'); k.set(55, 27, 'T');
      k.rect(28, 30, 2, 2, 's');
      k.rect(2, 31, 11, 10, 's'); k.rect(3, 32, 9, 8, '.'); k.rect(6, 34, 3, 3, 'T'); // Kotonoha
      k.rect(13, 33, 3, 5, '~');                         // the water off its jetty
    }),
    props: [
      { p: 'lantern', x: 21, y: 4, o: { lit: true }, light: 40 },  // Saltglass point's light
      { p: 'lantern', x: 60, y: 3, o: { lit: true }, light: 30 },
    ],
    npcs: [], foes: [], triggers: [], exits: [],
    spawn: { default: [26, 10, 'down'] },
  };

  // ---- the cabin: a shelf of keepsakes, the travel volume, the Distractions corner, a bunk ------------------------
  C.maps['sea.cabin'] = {
    name: T('The Cabin', '{船室|せんしつ}'), region: 'interior', place: 'saltglass', music: null, edition: 2,
    noTravel: true, travelKind: 'interior', travelPlace: { en: 'the cabin' },
    terrain: K.room(10, 8, '_', 5),
    props: [
      { p: 'shelf', x: 1, y: 2, scene: 'sea.cabin_shelf' },
      { p: 'desk', x: 4, y: 2, scene: 'sea.cabin_volume' },
      { p: 'table', x: 7, y: 3, scene: 'sea.cabin_corner' },
      { p: 'bed', x: 8, y: 5, scene: 'sea.cabin_bunk' },
      { p: 'lantern', x: 2, y: 5, o: { lit: true } },
    ],
    npcs: [], exits: [],
    triggers: [{ x: 4, y: 6, w: 3, h: 2, scene: 'sea.cabin_up' }],
    spawn: { default: [5, 5, 'up'] },
  };

  // ---- the boat at each port's pier, once she is yours ------------------------------------------------------------
  // (conditions have no brackets: & binds tighter than |, so the port's own condition is distributed)
  const both = (a, b) => (b ? b.split('|').map((x) => a + '&' + x).join('|') : a);
  C.seaBoatAt = (id) => {
    const P = C.ports[id], m = P && C.maps[P.dock.map];
    if (!m || (m.props || []).some((p) => p.scene === 'sea.boat' && p.o && p.o.port === id)) return;
    m.props = (m.props || []).concat([{ p: 'boat', x: P.boat.x, y: P.boat.y, if: both('ed>=2&sea_boat', P.if), scene: 'sea.boat', o: { port: id } }]);
  };
  for (const id in C.ports) C.seaBoatAt(id);
})(RB.content, RB.mapkit);
