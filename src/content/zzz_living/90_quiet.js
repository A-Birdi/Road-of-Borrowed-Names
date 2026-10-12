/* Quiet puzzle spaces (docs/future/plan/06_WORLD.md W9–W17; C-87): the mechanisms of the puzzle dungeons — the
 * Undercroft's tablets and cranks, the Steam Vents' valves, shutters, handle and float, the Root Hollows' currents and
 * arches, the Understage's prompt books, cranks and stagehands — are marked `mech`, so that while you stand at one
 * (within two tiles) the map's creatures keep still and none walks into you (src/engine/50_world.js atMechanism).
 * The exploration actions' own props and marks count without marking. */
var RB = (globalThis.RB = globalThis.RB || {});
(function (C) {
  'use strict';
  const MECH = /tablet|_go$|gate\d|valve|shutter|handle|float|root_leaf|root_arch|book\d|vents_notice|kuroko/;
  for (const id of ['mb.under1', 'mb.under2', 'mb.under3', 'yn.vents1', 'yn.vents2', 'ko.roots1', 'ko.roots2', 'ko.roots3', 'mp.under1', 'mp.under2', 'mp.under3']) {
    for (const p of (C.maps[id] && C.maps[id].props) || []) if (p.scene && MECH.test(p.scene)) p.mech = true;
  }
})(RB.content);
