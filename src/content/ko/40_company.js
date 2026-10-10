/* Kotonoha, Chapter 9: the companion (expansion P11f; 14_COMPANIONS's Chapter 9 pressure). One bond event within the
 * existing Bond table (RB.company.award through !hook co_bond, once a journey): ko:beat, when the companion meets
 * something of their own among the island's lost words (25_scenes_comp.js): Nao's letter in a hand they know, Mio's
 * labels without bottles, Ren's lanterns in the sand read and relit, Suzu's unsent reply. Twelve-chapter journeys
 * only. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const CC = C.company;
  CC.bondEvents = Object.assign(CC.bondEvents || {}, { 'ko:beat': 1 });
})(RB.content);
