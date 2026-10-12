/* The journey's people at their work (C-87, LW-02; docs/future/work/LW1_ROLLOUT.md). The performance library
 * (src/engine/67a_perform.js) gives these placements a complete action of their trade, and the World Proof's three
 * (Yasu fishing, Tomo folding, Kiyo selling: src/engine/67_worldacts.js) are the journey's own too. Curated, never
 * everyone: each person below does work that is theirs in the story, on their own placement, with what the work
 * touches in front of them (RB.perform.check). A placement of the same person somewhere else carries no work unless
 * it is named here, so a story that moves someone ends it; so does a story's evening, unless the work belongs to the
 * night. A few are moved one tile, or given the bench or post their work needs, where their old tile had nothing in
 * front of them. The people left still on purpose are listed at the end with the reason (C.stillOnPurpose). */
var RB = (globalThis.RB = globalThis.RB || {});
(function (C) {
  'use strict';
  C.work = C.work || [];
  C.stillOnPurpose = C.stillOnPurpose || [];
  const T = (en, jp) => ({ en, jp });
  // the placement of `id` on `map` (the one standing at `at` when there are several); null if it is not there
  function placement(map, id, at) {
    const m = C.maps[map];
    if (!m) return null;
    return (m.npcs || []).find((n) => n.id === id && (!at || (n.x === at[0] && n.y === at[1]))) || null;
  }
  // give a placement its work: o.at picks one of several; o.move = [x, y, dir] stands them where the work is;
  // o.props: what the work needs, added to the map with the placement's own condition
  function work(map, id, act, why, o) {
    o = o || {};
    const n = placement(map, id, o.at);
    if (!n) return;
    if (o.move) { n.x = o.move[0]; n.y = o.move[1]; if (o.move[2]) n.dir = o.move[2]; }
    n.perform = o.traits || o.night != null ? Object.assign({ act }, o.traits ? { traits: o.traits } : {}, o.night != null ? { night: o.night } : {}) : act;
    for (const p of o.props || []) C.maps[map].props.push(Object.assign({}, p, n.if && !p.if ? { if: n.if } : {}));
    C.work.push({ map, id, char: n.char || n.id, act, why });
  }
  // the World Proof's three (their own art and timing: 67_worldacts.js), listed with the rest
  C.work.push({ map: 'rw.village', id: 'yasu', char: 'yasu', act: 'fish', why: 'the old fisherman, at the end of his pier' });
  C.work.push({ map: 'rw.village', id: 'tomo', char: 'tomo', act: 'fold', why: 'folding the dry washing by her basket' });
  C.work.push({ map: 'sg.harbor', id: 'kiyo', char: 'kiyo', act: 'sell', why: 'the fishwife at her stall on the square' });

  // ---- Reedwake ----------------------------------------------------------------------------------------------------
  work('rw.carpenter', 'bunta', 'plane', 'the carpenter, planing a board on his block', { move: [5, 5, 'right'] });
  work('rw.tea', 'hana', 'serve', 'the teahouse: cups out, tea poured, the counter wiped');
  // ---- Saltglass ---------------------------------------------------------------------------------------------------
  work('sg.inn', 'tamae', 'serve', 'the inn\'s cook, serving at the counter');
  work('sg.glass', 'asahi', 'polish', 'the glassworker, polishing the day\'s glass at the table', { move: [6, 4, 'down'] });
  work('sg.warehouse', 'wataru', 'tally', 'the warehouse clerk, counting stock into his book');
  work('sg.harbor', 'sota', 'mend', 'a fisher worried for his nets: mending them', { at: [18, 28] });
  work('sg.harbor', 'sota2', 'mend', 'after the cove: mending by his boat');
  work('sg.harbor', 'daigo', 'carry', 'the dock porter, shifting crates', { traits: ['brisk'] });
  // ---- Manybridge and Blockprint Row --------------------------------------------------------------------------------
  work('mb.pier', 'mb_take', 'carry', 'a porter on the pier', { traits: ['brisk'] });
  work('mb.exchange', 'mb_gonta', 'carry', 'after the dispute: back at work, crates by the canal', { at: [48, 10] });
  work('mb.exchange', 'mb_masa', 'stir', 'one noodle stall: the pot');
  work('mb.exchange', 'mb_masu', 'hawk', 'the other noodle stall: calling customers across from Masa');
  work('mb.kura', 'mb_kansuke', 'mend', 'the boatman, mending a net by his boat');
  work('mp.blockprint', 'mp_miyo', 'sweep', 'the printer\'s apprentice, sweeping the shop front');
  work('mp.blockprint', 'mp_tokube', 'grind', 'the tonic seller, grinding his remedies', { at: [26, 12], props: [{ p: 'smalltable', x: 25, y: 12 }] });
  // ---- Cinder Orchard ----------------------------------------------------------------------------------------------
  work('co.pottery', 'co_nobu', 'knead', 'the potter, wedging clay at the wheel', { move: [4, 4, 'left'] });
  work('co.village', 'co_heita', 'tie', 'after the firebreak: binding the cut scrub into sheaves', { at: [16, 9], move: [15, 9, 'left'] });
  // ---- Snowbell ----------------------------------------------------------------------------------------------------
  work('sb.hamlet', 'tetsuji', 'tally', 'counting the goats', { at: [9, 27] });
  work('sb.post', 'sousuke', 'sort', 'the postmaster, sorting letters at his desk');
  work('sb.inn', 'yae', 'serve', 'the innkeeper, at her counter', { at: [13, 2] });
  // ---- Keepers' Road -----------------------------------------------------------------------------------------------
  work('kr.lodge', 'kr_mokichi', 'plane', 'the lodge\'s handyman, shaping a shingle for the leaks', { props: [{ p: 'stump', x: 6, y: 14 }] });
  work('kr.foot_inn', 'kr_aya', 'sweep', 'the teahouse at the road\'s foot, swept');
  work('kr.steps', 'kr_kumazo', 'sweep', 'sweeping the steps');
  // ---- Lanternfall -------------------------------------------------------------------------------------------------
  work('lf.bakery', 'lf_masaru', 'knead', 'the baker at his kneading bench');
  work('lf.town', 'lf_nagi', 'tend', 'the lamplighter, trimming a lamp (evenings too)', { move: [14, 18, 'down'], props: [{ p: 'lamppost', x: 14, y: 19 }] });
  work('lf.gardens', 'lf_shu', 'prune', 'the gardener, pruning', { move: [8, 19, 'right'], props: [{ p: 'bush', x: 9, y: 19 }] });
  work('lf.sluice', 'lf_tokuji', 'tally', 'the sluice keeper, noting the water');
  // ---- Kotonoha and Sazanami ---------------------------------------------------------------------------------------
  work('ko.village', 'ko_hamaji', 'mend', 'the net-mender by the drying racks');
  work('ko.village', 'ko_tokio', 'tally', 'the census keeper, counting heads into his book');
  work('sz.hamlet', 'sz_yone', 'mend', 'mending a net at the racks');
  work('sz.hamlet', 'sz_uki', 'hawk', 'calling the catch from behind the counter', { move: [28, 12, 'down'] });
  // ---- The Cloudroad -----------------------------------------------------------------------------------------------
  work('cr.suginoki', 'cr_sada', 'carry', 'the porter at the post town', { traits: ['brisk'] });
  work('cr.nakayama', 'cr_otaki', 'sweep', 'one innkeeper, sweeping her front');
  work('cr.nakayama', 'cr_seibe', 'hawk', 'the rival innkeeper, calling travellers in', { props: [{ p: 'smalltable', x: 18, y: 12 }] });
  work('cr.nakayama', 'cr_rin', 'polish', 'the mapmaker\'s ink and lens at the table');
  // ---- Steamhollow -------------------------------------------------------------------------------------------------
  work('yn.upper', 'yn_tama', 'hawk', 'selling eggs boiled in the steam box', { move: [14, 18, 'down'] });
  work('yn.lower', 'yn_onatsu', 'hawk', 'the souvenir stall');
  work('yn.lower', 'mp_tokube', 'grind', 'the tonic seller again, at his new stall', { at: [11, 18] });
  // ---- East Landing ------------------------------------------------------------------------------------------------
  work('el.landing', 'el_daigo', 'carry', 'answering the notice: shifting the crates for the new pier', { traits: ['brisk'] });
  // ---- Ashihara Shinden (the routines change what they do as well as where: 01_region.js) ---------------------------
  work('as.village', 'as_sho', 'hammer', 'the smith at his forge, once it has moved by the paddies', { at: [33, 9] });
  work('as.village', 'as_mohei', 'hawk', 'market day at the board', { at: [11, 13] });
  work('as.village', 'as_mohei', 'hawk', 'market day at the bridge', { at: [26, 13] });
  work('as.village', 'as_kotoe', 'read', 'reading under the lone pine', { at: [9, 3] });
  work('as.village', 'as_mitsue', 'tally', 'the headwoman by the notice board, keeping the village\'s list', { at: [10, 9] });

  // ---- left still on purpose ---------------------------------------------------------------------------------------
  const still = (map, id, why) => C.stillOnPurpose.push({ map, id, why });
  still('sb.hamlet', 'denji', 'waits by his ice hole: a still line is the work');
  still('co.village', 'co_tamotsu', 'the channel watch: watching is the work');
  still('co.terraces', 'co_asa', 'stands by the terrace signs she put up; the trees are the terraces\' own tiles');
  still('el.landing', 'el_sota', 'waits for the planks the notice asked for');
  still('rw.hall', 'tsuru', 'the keeper of the Lantern Hall: her stillness is the scene\'s');
  void T;
})(RB.content);
