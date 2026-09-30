/* Known Details (addendum §18.2): authored annotations on the local map
 * page (Map › Known details, src/ui/61_known.js). Each appears only once
 * the player has discovered the fact it records (`show`), describes what is
 * known rather than what to do, and takes its state from the game's own
 * flags (`states`, first match), so a solved mechanism never keeps its
 * question mark. Kinds draw as shapes; every state also has words.
 * The shortcut entries are the audit of the existing shortcuts (§18.3):
 * each is labelled from the side it is found, and "opened" once it is. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const T = (en, jp) => ({ en, jp: jp || null });
  const K = (C.knownDetails = C.knownDetails || []);
  const add = (d) => K.push(d);

  // ---- Case A ------------------------------------------------------------------------------------------------
  add({ map: 'sg.harbor', id: 'cs_footing', x: 53, y: 31, kind: 'case', show: 'clue.parcel.oldsite',
    states: [{ state: 'seen', label: T('Old stone footing, "East Landing": no one works here now', '{東|ひがし} の {渡|わた}し{場|ば} の {跡|あと}') }] });
  add({ map: 'sg.harbor', id: 'cs_seto', x: 51, y: 4, kind: 'case', show: 'clue.parcel.crest|clue.parcel.seto_memory',
    states: [{ state: 'seen', label: T('Seto\'s house: a bell crest with a wave beneath', 'セト の {家|いえ}') }] });
  add({ map: 'sg.harbor', id: 'cs_bench', x: 38, y: 27, kind: 'case', show: 'clue.parcel.bench|clue.parcel.bell',
    states: [{ if: 'case.parcel=done', state: 'solved', label: T('Hama\'s repair bench: the parcel delivered; its label pinned up', 'ハマ の {作業台|さぎょうだい}') },
      { state: 'seen', label: T('Repair bench by the ferry: a notched edge and a call bell', '{渡|わた}し の そば の {作業台|さぎょうだい}') }] });
  add({ map: 'sg.office', id: 'cs_record', x: 9, y: 6, kind: 'inscription', show: 'clue.parcel.record',
    states: [{ state: 'seen', label: T('Ledgers: "The Landings, and How They Changed"', '{渡|わた}し{場|ば} の {記録|きろく}') }] });
  // ---- Case B ------------------------------------------------------------------------------------------------
  add({ map: 'sg.lighthouse', id: 'cs_window', x: 6, y: 2, kind: 'case', show: 'clue.view.sketch',
    states: [{ if: 'case.view=done', state: 'solved', label: T('The window where the sketch hung, back to front', '{絵|え} が {貼|は}って あった {窓|まど}') },
      { state: 'seen', label: T('A sketch that matches no view, pinned in the window', '{窓|まど} の {絵|え}') }] });
  const V = C.caseView;
  for (const pid in V.points) {
    const P = V.points[pid], name = P.name.en[0].toUpperCase() + P.name.en.slice(1);
    add({ map: V.map, id: 'cs_view_' + pid, x: Math.floor(P.x), y: Math.floor(P.y), kind: 'view', show: 'clue.view.' + pid,
      states: (pid === V.target ? [{ if: 'case.view=done', state: 'solved', label: T(name + ': where the sketch was drawn, ' + P.facing.en) }] : [])
        .concat([{ state: 'view', label: T(name + ': a view, ' + P.facing.en) }]) });
  }
  // ---- the refined sequences ------------------------------------------------------------------------------------
  add({ map: 'sg.harbor', id: 'sg_tideboard', x: 10, y: 25, kind: 'inscription', show: 'seen.sg.tidepost|seen.cs.tidepost|sg_tide_read',
    states: [{ if: 'sg_tide_read', state: 'solved', label: T('Tide board: the times are chalked in') }, { state: 'question', label: T('Tide board: the times are blank; "ask inside"') }] });
  add({ map: 'co.kiln', id: 'co_kilnwall', x: 11, y: 3, kind: 'mechanism', show: 'seen.co.kiln_wall|co_kiln_open',
    states: [{ if: 'co_kiln_open', state: 'solved', label: T('Kiln wall: the three tiles in place, the upper vent open') }, { state: 'question', label: T('Kiln wall: slots for three instruction tiles, and two vents') }] });
  add({ map: 'sb.obs_charts', id: 'sb_drawers', x: 7, y: 2, kind: 'mechanism', show: 'seen.sb.charts_cabinet|seen.sb.charts_log|sb_log_solved',
    states: [{ if: 'sb_log_solved', state: 'solved', label: T('Direction drawers: the south-east one opened') }, { state: 'question', label: T('A wall of drawers labelled by direction, frozen shut') }] });
  add({ map: 'lf.tower_upper', id: 'lf_gates_a', x: 17, y: 9, kind: 'mechanism', show: 'seen.lf.plate_a|seen.lf.wheel_lower|seen.lf.wheel_upper',
    states: [{ if: 'lf_gate_a', state: 'solved', label: T('Lower gate open: the water drained to the next level') },
      { if: 'lf_up_closed', state: 'question', label: T('Upper gate (west wheel) closed; lower gate (east wheel) still shut') },
      { state: 'question', label: T('Two gate wheels, upper (west) and lower (east), linked by the bronze plate') }] });
  add({ map: 'lf.tower_mid', id: 'lf_gates_b', x: 20, y: 8, kind: 'mechanism', show: 'seen.lf.plate_b|seen.lf.east_door|seen.lf.west_plug',
    states: [{ if: 'lf_gate_b', state: 'solved', label: T('Gate works drained, and the east door shut again') },
      { if: 'lf_mid_drained', state: 'question', label: T('Gate works drained; the east door still open') },
      { state: 'question', label: T('East door and west plug, linked by the second plate') }] });
  add({ map: 'lf.tower_low', id: 'lf_gates_c', x: 16, y: 3, kind: 'mechanism', show: 'seen.lf.plate_c|seen.lf.south_plug|seen.lf.north_plug',
    states: [{ if: 'lf_gate_c', state: 'solved', label: T('Both plugs out: the walkway is clear') },
      { if: 'lf_south_pulled', state: 'question', label: T('South plug out; the north plug still holds the water') },
      { state: 'question', label: T('South and north plugs; the third plate gives their order') }] });
  add({ map: 'sa.conduits', id: 'sa_charter', x: 4, y: 13, kind: 'mechanism', show: 'seen.sa.charter_gate|sa_promise_done',
    states: [{ if: 'sa_promise_done', state: 'opened', label: T('Water gate open; Kasane\'s note has peeled away') }, { state: 'barred', label: T('Water gate: opens for whoever reads the charter rightly') }] });
  // ---- existing shortcuts, labelled (the audit) --------------------------------------------------------------------
  const shortcut = (map, id, x, y, show, flag, barred, opened) => add({ map, id, x, y, kind: 'passage', show: show + '|' + flag,
    states: [{ if: flag, state: 'opened', label: T(opened) }, { state: 'barred', label: T(barred) }] });
  shortcut('sg.da_entry', 'sg_da_door', 0, 9, 'seen.sg.da_bolted', 'sg_da_shortcut', 'A door bolted from the other side', 'Shortcut: this door to the Reading Room is unbolted');
  shortcut('sg.da_reading', 'sg_da_stair', 8, 13, 'seen.sg.da_unbolt', 'sg_da_shortcut', 'A bolted stair door', 'Shortcut: this stair back to the Receiving Hall is unbolted');
  shortcut('co.terraces', 'co_fence', 4, 0, 'seen.co.shortcut_locked', 'co_shortcut', 'A fence gate, barred from the far side', 'Shortcut: the gate up to the Old Workshop Row is open');
  shortcut('co.oldworks', 'co_barred', 2, 25, 'seen.co.shortcut_open', 'co_shortcut', 'A barred gate down to the Terraces', 'Shortcut: the gate down to the Terraces is open');
  shortcut('sb.obs_path', 'sb_hut', 20, 4, 'seen.sb.service_door_out', 'sb_shortcut', 'A stone hut door, barred from inside', 'Shortcut: the service stair to the Upper Gallery');
  shortcut('sb.obs_gallery', 'sb_service', 19, 11, 'seen.sb.service_bolt', 'sb_shortcut', 'A bolted service door', 'Shortcut: the service stair down to the Star Stair');
  shortcut('lf.tower_top', 'lf_trap', 5, 3, 'seen.lf.trapdoor', 'lf_shortcut', 'A trapdoor fastened from below', 'Shortcut: the rope ladder down to the gate works');
  shortcut('lf.tower_mid', 'lf_ladder', 3, 3, 'seen.lf.ladder_mid', 'lf_shortcut', 'A rope ladder, hooked up out of reach', 'Shortcut: the rope ladder up to the loft');
  shortcut('sa.reading', 'sa_door', 26, 9, 'seen.sa.shortcut_locked', 'sa_shortcut', 'A door locked from the other side', 'Shortcut: this door to the Keeper\'s Study is open');
  shortcut('sa.study', 'sa_study_door', 0, 6, 'seen.sa.shortcut_open', 'sa_shortcut', 'A door to the Reading Room', 'Shortcut: this door back to the Reading Room is open');
})(RB.content);
