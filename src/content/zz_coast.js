/* A Quiet Cast's coast in the maps (expansion P15g; F-82; the stations, fish and situations are in
 * src/content/fishing/70_coast.js): the station on Sazanami's rocks, and the boat's destination after the story, the
 * One-Pine Islet, with the boat's station at its jetty. Loaded after the maps it touches (Sazanami, the sea's ports,
 * Saltglass). Twelve-chapter journeys only: these maps are only reached in one. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C, K) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  // ---- the stations in the maps, and the islet --------------------------------------------------------------------------
  const sz = C.maps['sz.hamlet'];
  sz.props = (sz.props || []).concat([{ p: 'fish_station', x: 34, y: 20, o: { kind: 'quay' }, scene: 'coast.station_rocks', if: 'post' }]);
  // the One-Pine Islet (一本松の小島): the pine islet off the coast's south-east (the sea chart's islet with one pine),
  // a destination for the boat after the story; nothing but the pine, a stone where boats carve their names, the
  // jetty and the fishing. Reached by boat only; leaving it by quick travel leaves nothing behind (the boat waits at
  // whichever pier you sail from, as everywhere).
  C.maps['sea.islet'] = {
    name: T('The One-Pine Islet', '{一本松|いっぽんまつ} の {小島|こじま}'), region: 'sea', place: 'saltglass', music: 'sea', edition: 2,
    ambient: { weather: 'motes', tint: 'rgba(170,210,220,0.05)' },
    // a rounded islet: a sand rim, grass on top, the one pine leaning off its middle, the jetty south
    terrain: K.build(20, 14, '~', (k) => {
      k.rect(6, 2, 8, 1, 's'); k.rect(5, 3, 10, 1, 's'); k.rect(4, 4, 12, 4, 's'); k.rect(5, 8, 10, 1, 's'); k.rect(6, 9, 8, 1, 's');
      k.rect(7, 3, 6, 1, '.'); k.rect(5, 4, 10, 4, '.'); k.rect(7, 8, 6, 1, '.');
      k.rect(9, 10, 2, 3, '_');
    }),
    props: [
      { p: 'pine', x: 10, y: 4, o: { lean: true } },
      { p: 'stone_marker', x: 7, y: 5, scene: 'sea.islet_stone' },
      { p: 'pier', x: 9, y: 12 }, { p: 'pier', x: 10, y: 12 },
      { p: 'fish_station', x: 8, y: 12, o: { kind: 'quay' }, scene: 'coast.station_boat', if: 'post' },
    ],
    npcs: [], exits: [], triggers: [],
    spawn: { default: [10, 11, 'up'] },
  };
  C.ports.islet = { place: 'saltglass', pos: [372, 294], name: T('The One-Pine Islet', '{一本松|いっぽんまつ} の {小島|こじま}'), if: 'ed>=2&postgame', reach: 'ed>=2&postgame',
    dock: { map: 'sea.islet', x: 10, y: 12, dir: 'right' }, boat: { x: 11, y: 12 },
    sea: { x: 55, y: 26, dir: 'up' }, zone: { x: 51, y: 25, w: 9, h: 7 }, arrive: 'sea.islet_arrive' };
  C.seaBoatAt('islet');
  // Fuku, if the boat was the Chidori-maru, about the name on the stone
  const fuku = (C.maps['sg.harbor'].npcs || []).find((n) => n.id === 'fuku' && Array.isArray(n.talk));
  if (fuku) fuku.talk.unshift({ if: 'ed>=2&post&sea_islet_stone&var.sea_hull=chidori&!seen.sea.fuku_islet', scene: 'sea.fuku_islet' });

})(RB.content, RB.mapkit);
