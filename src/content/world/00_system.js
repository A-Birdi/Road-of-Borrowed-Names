/* The living world's tables (expansion P05; src/engine/53_town.js explains each). They start empty: the new
 * chapters fill them (towns, residents' routines and change beats, who knows whom, road events, sealed places), so a
 * six-chapter journey meets none of it. The tests put synthetic towns on real maps in a throwaway session. */
var RB = (globalThis.RB = globalThis.RB || {});
(function (C) {
  'use strict';
  C.towns = C.towns || {};
  C.relations = C.relations || {};
  C.roadEvents = C.roadEvents || {};
  C.sealed = C.sealed || {};
  // "Have you seen…?" runs as a conversation of its own (src/ui/53w_whereabouts.js)
  RB.script.add(`
@scene wb.ask
!hook wb_ask
`, 'world/00_system.js');
})(RB.content);
