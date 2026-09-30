/* Where the cases and the refined sequences sit in the existing maps
 * (docs/addendum/cases.md). This file only adds to maps defined earlier: it
 * loads after every chapter (src/content/cases/ itself loads before ch1, so
 * the placement lives here). Tiles were chosen after reading each map; the
 * unit test tests/unit/cases.test.mjs checks that every added prop and person
 * stands on a free tile, blocks no path and that the deduction still holds. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const M = (id) => C.maps[id];
  const props = (map, list) => { const m = M(map); if (m) m.props = (m.props || []).concat(list); };
  const npcs = (map, list) => { const m = M(map); if (m) m.npcs = (m.npcs || []).concat(list); };
  const structs = (map, list) => { const m = M(map); if (m) m.structs = (m.structs || []).concat(list); };
  // give an existing, silent prop a scene (only if it has none)
  const sceneFor = (map, p, x, y, scene) => { const m = M(map); const pr = m && (m.props || []).find((q) => q.p === p && q.x === x && q.y === y); if (pr && !pr.scene) pr.scene = scene; return !!pr; };
  // wrap an existing prop's scene: the new scene !calls the old one first
  const wrap = (map, p, x, y, from, to) => { const m = M(map); const pr = m && (m.props || []).find((q) => q.p === p && q.x === x && q.y === y && q.scene === from); if (pr) pr.scene = to; return !!pr; };

  // ---- Case A: A Parcel for a Place That Moved ------------------------------------------------------------
  // Reedwake, River Warehouse: the shelf of unclaimed parcels
  props('rw.warehouse', [
    { p: 'cs_shelf', x: 6, y: 2, o: { parcel: true }, scene: 'cs.parcel_shelf', if: '!case.parcel' },
    { p: 'cs_shelf', x: 6, y: 2, scene: 'cs.parcel_shelf_empty', if: 'case.parcel' },
  ]);
  // Saltglass, Harbour Office: the pile of ledgers by the bench keeps the record of the landings
  sceneFor('sg.office', 'bookpile', 9, 6, 'cs.parcel_record');
  // Saltglass harbour: the old footing, Seto's house up the hill, Hama's bench by the ferry
  props('sg.harbor', [
    { p: 'cs_footing', x: 53, y: 31, scene: 'cs.parcel_oldsite' },
    { p: 'cs_workbench', x: 37, y: 27, across: true, scene: 'cs.hama_bench', if: '!case.parcel=done' },
    { p: 'cs_workbench', x: 37, y: 27, across: true, o: { label: true }, scene: 'cs.hama_bench', if: 'case.parcel=done' },
    { p: 'cs_bellpost', x: 40, y: 27, scene: 'cs.hama_bell', if: '!case.parcel=done' },
    { p: 'cs_bellpost', x: 40, y: 27, o: { bright: true }, scene: 'cs.hama_bell', if: 'case.parcel=done' },
  ]);
  structs('sg.harbor', [{ type: 'house', x: 50, y: 2, w: 4, h: 3, roof: 'tile', wall: 'wood', door: 1, windows: [3], to: 'sg.harbor', locked: 'cs.seto_door' }]);
  npcs('sg.harbor', [
    { id: 'cs_seto', x: 53, y: 5, dir: 'left', talk: [{ if: 'item.cs_parcel&!case.parcel.tried=family', scene: 'cs.seto_parcel' }, { scene: 'cs.seto_idle' }] },
    { id: 'cs_hama', x: 38, y: 26, dir: 'down', talk: [{ if: 'item.cs_parcel', scene: 'cs.hama_parcel' }, { if: 'case.parcel=done', scene: 'cs.hama_after' }, { scene: 'cs.hama_idle' }] },
  ]);
  // Cinder Orchard, Shino's Post House: the record of marks
  props('co.post', [{ p: 'bookpile', x: 3, y: 2, scene: 'cs.parcel_marks' }]);

  // ---- Case B: The View on the Other Side -------------------------------------------------------------------
  props('sg.lighthouse', [
    { p: 'cs_sketchwin', x: 6, y: 2, scene: 'cs.view_window', if: '!case.view' },
    { p: 'cs_sketchwin', x: 6, y: 2, o: { gone: true }, scene: 'cs.view_window', if: 'case.view' },
  ]);
  props('co.inn', [{ p: 'bookpile', x: 5, y: 2, scene: 'cs.view_note' }]);
  // the Star Stair: a little shrine and a bare tree near the stair's foot (the
  // lantern at 7,33 is the stair's own), two flat stones to look out from, and
  // the stone seat (its own scene first, then the chance to look out)
  const V = C.caseView;
  props('sb.obs_path', [
    { p: 'shrine', x: V.landmarks.shrine.x, y: V.landmarks.shrine.y, scene: 'cs.view_shrine' },
    { p: 'deadtree', x: V.landmarks.tree.x, y: V.landmarks.tree.y, scene: 'cs.view_tree' },
    { p: 'cs_viewstone', x: 3, y: 31, scene: 'cs.view_west' },
    { p: 'cs_viewstone', x: 14, y: 32, scene: 'cs.view_east' },
    { p: 'cs_frame', x: 11, y: 36, scene: 'cs.view_frame', if: 'cs_view_framed' },
  ]);
  wrap('sb.obs_path', 'bench', 9, 36, 'sb.path_bench', 'cs.view_seat');

  RB.script.add(`
@scene cs.view_shrine
narr: {道端|みちばた} の {小|ちい}さな {祠|ほこら} 。 {屋根|やね} の {雪|ゆき} を 、 {誰|だれ} か が {払|はら}って いる 。 || A little wayside shrine. Someone keeps the snow brushed off its roof.

@scene cs.view_tree
narr: {枝|えだ} だけ の {枯|か}れ{木|き} 。 {雪|ゆき} の {中|なか} で 、 {黒|くろ}い {線|せん} の よう に {立|た}って いる 。 || A bare tree, all branches. It stands against the snow like a line of ink.
`, 'zz_cases');
})(RB.content);
