// Walking reachability in the new chapters' maps (expansion P12's phase end; P13): from each map's default spawn, in
// a few story states, every open exit, every prop or trigger with a scene and every person standing there can be
// reached on foot, with the state's conditional props blocking as they do in play. A gate that is meant to hold (the
// Mist Barrier before the papers are made good) is listed as such, so a map that leaks round it fails too. Found by
// the Chapter 10 route run: the High Pass's goat path was not joined to the road at its lower end, and the Barrier's
// fence stopped short of the cliffs.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content;
  const D4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  function check(prefix, flags, at) {
    const s = RB.state.newCampaign({ edition: 2 });
    for (const f of flags) { if (f.indexOf('=') > 0) { const [k, v] = f.split('='); s.vars[k.replace('var.', '')] = +v; } else s.flags[f] = true; }
    RB.game = RB.game || {}; RB.game.s = s;
    const out = [];
    for (const id of Object.keys(C.maps).filter((m) => m.startsWith(prefix)).sort()) {
      RB.maps.invalidate();
      const m = RB.maps.compile(id);
      const sp = (at && at[id]) || (C.maps[id].spawn || {}).default;
      if (!sp) { out.push(id + ' has no default spawn'); continue; }
      const seen = new Set([sp[0] + ',' + sp[1]]), st = [[sp[0], sp[1]]];
      while (st.length) {
        const [x, y] = st.pop();
        for (const [dx, dy] of D4) { const nx = x + dx, ny = y + dy, k = nx + ',' + ny; if (seen.has(k) || RB.maps.blockedStatic(m, nx, ny)) continue; seen.add(k); st.push([nx, ny]); }
      }
      // on it, or beside it (an exit on a solid tile is taken from beside it; a prop is used from beside it)
      const near = (x, y, w, h) => { for (let yy = y - 1; yy <= y + h; yy++) for (let xx = x - 1; xx <= x + w; xx++) if (seen.has(xx + ',' + yy)) return true; return false; };
      const open = (c) => !c || RB.state.test(s, c);
      for (const ex of m.exits) if (open(ex.if) && !near(ex.x, ex.y, ex.w || 1, ex.h || 1)) out.push(id + ' exit to ' + ex.to);
      for (const p of C.maps[id].props || []) { const pd = RB.props.P[p.p] || {}; if (p.scene && open(p.if) && !near(p.x, p.y, p.w || pd.w || 1, p.h || pd.h || 1)) out.push(id + ' ' + p.scene + '@' + p.x + ',' + p.y); }
      for (const n of C.maps[id].npcs || []) if (open(n.if) && !near(n.x, n.y, 1, 1)) out.push(id + ' ' + n.id);
      for (const tr of C.maps[id].triggers || []) if (open(tr.if) && !near(tr.x, tr.y, tr.w || 1, tr.h || 1)) out.push(id + ' ' + tr.scene);
    }
    return out;
  }

  // ---- the Cloudroad (Chapter 10) -----------------------------------------------------------------------------------
  t.eq(check('cr.', ['ko_done', 'cr_called']), ['cr.barrier exit to cr.above'],
    'the Cloudroad on the way up: everything reachable on foot, and the Mist Barrier holds (no way round its fence)');
  t.eq(check('cr.', ['ko_done', 'cr_called', 'cr_fetching', 'var.cr_phase=6']), [], 'fetching proof: the gate opens for the one who goes up');
  t.eq(check('cr.', ['ko_done', 'cr_called', 'cr_passed', 'var.cr_phase=6']), [], 'through the Barrier: the High Pass can be climbed with the slide still down (the goat path)');
  t.eq(check('cr.', ['cr_done', 'cr_passed', 'cr_turn_cleared', 'cr_drift_cleared', 'cr_courier_done', 'cr_bridge_mended', 'cr_ledge_cleared']), [], 'the chapter done: everything reachable');

  // ---- Steamhollow (Chapter 11) -------------------------------------------------------------------------------------
  // The Steam Vents' connected airflow (A11) blocks passages on purpose: the steam has to go somewhere. Everything else
  // in the valley is reachable on foot from the start; in the vents, what each valve or the shutter blocks is listed,
  // and from either end of the Channel its own wheel turns the shutter back (no state traps the player).
  const yn = ['cr_done', 'yn_called', 'yn_arrived', 'yn_rooms_done', 'yn_quarrel', 'yn_vents_open'];
  t.eq(check('yn.', ['cr_done', 'yn_called']), ['yn.vents1 exit to yn.vents2', 'yn.vents1 yn.handle@26,14', 'yn.vents2 exit to yn.vents3', 'yn.vents2 yn.shutter_end@29,5'],
    'Steamhollow on arrival: the town, the inns, the terraces and the north road all reachable; in the vents, the stair down and the tool nook are steamed over, and the Channel\'s upper corridor (where its far wheel is) waits for the shutter');
  t.eq(check('yn.', yn.concat(['yn_vent1'])), ['yn.vents1 exit to yn.vents2', 'yn.vents1 yn.pool1@3,5', 'yn.vents2 exit to yn.vents3', 'yn.vents2 yn.shutter_end@29,5'],
    'the near valve open: the tool nook (the handle) clears, and the steam fills the way to the first hot pool');
  t.eq(check('yn.', yn.concat(['yn_vent2', 'yn_handle_taken'])), ['yn.vents1 yn.pool1@3,5', 'yn.vents2 exit to yn.vents3', 'yn.vents2 yn.shutter_end@29,5'],
    'the far valve open with its handle: the stair down to the Channel clears (the first pool comes back with the valves closed)');
  t.eq(check('yn.vents2', yn.concat(['yn_shutter']), { 'yn.vents2': [16, 16] }), ['yn.vents2 exit to yn.vents1', 'yn.vents2 yn.shutter_end@4,18'],
    'the shutter turned, from the middle chamber: the upper corridor and the way to the Deep Vents clear; the lower corridor fills');
  t.eq(check('yn.vents2', yn.concat(['yn_shutter'])), ['yn.vents2 exit to yn.vents3', 'yn.vents2 yn.shutter@19,15', 'yn.vents2 yn.shutter_end@29,5', 'yn.vents2 yn.float@16,18', 'yn.vents2 yn.pool2@16,13'],
    'back down from the Valve Hall with the shutter still turned: the wheel at this end of the Channel can turn it back');
  t.eq(check('yn.vents2', yn, { 'yn.vents2': [28, 1] }), ['yn.vents2 exit to yn.vents1', 'yn.vents2 yn.shutter@19,15', 'yn.vents2 yn.shutter_end@4,18', 'yn.vents2 yn.float@16,18', 'yn.vents2 yn.pool2@16,13'],
    'up from the Deep Vents with the shutter back: the wheel at that end can turn it again');
  t.eq(check('yn.', yn.concat(['yn_float_found', 'yn_kettle_done', 'yn_mediated', 'yn_done'])), ['yn.vents1 exit to yn.vents2', 'yn.vents1 yn.handle@26,14', 'yn.vents2 exit to yn.vents3', 'yn.vents2 yn.shutter_end@29,5'],
    'the chapter done: the valley and the north road open; the vents as the valves were left');
};
