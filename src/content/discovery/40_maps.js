/* The field puzzles placed in existing maps (addendum §14.2-14.7, §18.1):
 * props added from here (the pattern of src/content/lq/20_maps.js), with the
 * few decorative props that stood on the chosen tiles moved aside, and the
 * small, guarded changes to people whose place changes use. Every spot was
 * chosen from the map's actual geometry (docs/addendum/fieldweave.md lists
 * each spot, why, and what it replaced). */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const drop = (map, pred) => { const m = C.maps[map]; m.props = (m.props || []).filter((p) => !pred(p)); };
  const at = (p, id, x, y) => p.p === id && p.x === x && p.y === y;
  const talkFirst = (map, id, opt) => { const n = (C.maps[map].npcs || []).find((q) => q.id === id); if (n) n.talk = [opt].concat(Array.isArray(n.talk) ? n.talk : [{ scene: n.talk }]); };

  // ---- F1, Reedwake: the nook between the river warehouse and the river ------------------------------
  // (32,22)-(33,22): the crate that stood at (33,22) and the barrel at (32,23)
  // make room for the screen, its clamp post and a place to stand.
  drop('rw.village', (p) => at(p, 'crate', 33, 22) || at(p, 'barrel', 32, 23));
  C.maps['rw.village'].props.push(
    { p: 'fw_slipscreen', x: 32, y: 22, o: { pz: 'f1', part: 'screen' }, scene: 'fw.f1.screen' },
    { p: 'fw_clamppost', x: 33, y: 22, o: { pz: 'f1', part: 'clamp' }, scene: 'fw.f1.clamp' },
  );
  // Tomo, who does the washing by the river, once the screen stops flapping
  talkFirst('rw.village', 'tomo', { if: 'puzzle.f1=done&!seen.fw.f1_tomo', scene: 'fw.f1_tomo' });
})(RB.content);
