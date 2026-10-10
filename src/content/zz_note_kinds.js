/* Whether each lore note written before the expansion is invented or real (spec line 32: invented lore must not pass
 * as real culture). New notes say so where they are defined; tools/validate.mjs requires it. Notes about real
 * language, customs and crafts are `fiction: false`; the game's own places, people and history are `fiction: true`. */
var RB = (globalThis.RB = globalThis.RB || {});
(function (C) {
  'use strict';
  const REAL = ['sg_tide_words', 'sg_gojuon', 'sg_nakute', 'sg_passive', 'co_firebreak', 'co_kiln', 'sb_tsuzumi', 'sb_letters', 'sb_counters', 'sb_honoo', 'lf_refusal', 'lf_promise', 'lq_koharubiyori', 'lq_kakishibu'];
  const INVENTED = ['rw_founding', 'sg_three_kinds', 'co_orchard', 'co_fire', 'co_hist_ume', 'co_hist_goro', 'co_hist_isao', 'co_suzu_ledger', 'sb_snowbell', 'sb_bell_signals', 'lf_flood', 'lf_toya', 'lf_bell', 'lq_farebook', 'pa_lamps'];
  for (const id of REAL) if (C.notes[id] && typeof C.notes[id].fiction !== 'boolean') C.notes[id].fiction = false;
  for (const id of INVENTED) if (C.notes[id] && typeof C.notes[id].fiction !== 'boolean') C.notes[id].fiction = true;
})(RB.content);
