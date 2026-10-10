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
  // "Have you seen…?" runs as a conversation of its own (src/ui/53w_whereabouts.js); an exploration action's prop
  // opens its sheet, and a layered site's marked place compares it with the old plan (src/engine/55b_verbs.js)
  RB.script.add(`
@scene wb.ask
!hook wb_ask

@scene vb.open
!hook vb_open

@scene vb.mark
!hook vb_mark
`, 'world/00_system.js');
})(RB.content);
