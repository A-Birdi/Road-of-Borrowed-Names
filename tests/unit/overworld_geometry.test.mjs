// Overworld parity pass (battle addendum §20): the art may change, the play geometry may not.
// Every authored map (and Atlas rooms from three fixed seeds) is compiled and compared with the
// record made from the base commit 982c8df (tests/fixtures/overworld_geometry_982c8df.json):
// collision (static blocking, conditional props under two flag sets), exits and their targets,
// doors (shut and open), triggers, spawn points, every prop's footprint and blocking (the prop
// definitions' w, h and block, and each placement's tiles), and the renderer's tile/anchor
// constants. A painter or sprite change that moved a footprint, a door or a link fails here.
// Re-record only for a deliberate geometry change: RECORD=1 node tests/run-unit.mjs overworld_geometry
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { load, root } from '../lib/load.mjs';

const FIX = path.join(root, 'tests/fixtures/overworld_geometry_982c8df.json');

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content;
  const h = (v) => crypto.createHash('sha256').update(typeof v === 'string' ? v : JSON.stringify(v)).digest('hex').slice(0, 16);
  // two flag sets: a fresh campaign, and one late in the story (conditional props and exits differ)
  const late = { rw_arrived: true, rw_road_lit: true, rw_echo_done: true, rw_mill_open: true, departed: true, ch1_done: true, ch2_done: true, ch3_done: true, ch4_done: true, ch5_done: true, postgame: true };
  const states = { fresh: () => RB.state.newCampaign({}), late: () => { const s = RB.state.newCampaign({}); Object.assign(s.flags, late); s.chapter = 6; return s; } };
  function mapRecord(id) {
    RB.maps.invalidate();
    const m = RB.maps.compile(id);
    const rec = { w: m.w, h: m.h };
    rec.block = h(Array.from(m.block).join(''));
    for (const k in states) {
      RB.game = RB.game || {};
      const prev = RB.game.s;
      RB.game.s = states[k]();
      let bits = '', ex = [], sh = [];
      for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
        bits += RB.maps.blockedStatic(m, x, y) ? 1 : 0;
        const e = RB.maps.exitAt(m, x, y);
        if (e) ex.push([x, y, e.to, e.tx, e.ty, e.dir || null, !!e.door]);
        if (RB.maps.shutDoorAt(m, x, y)) sh.push([x, y]);
      }
      rec['coll_' + k] = h(bits);
      rec['exits_' + k] = h(ex);
      rec['shut_' + k] = h(sh);
      RB.game.s = prev;
    }
    rec.exits = m.exits.map((e) => [e.x, e.y, e.w, e.h, e.to, e.tx == null ? null : e.tx, e.ty == null ? null : e.ty, e.dir || null, !!e.door, e.if || null]);
    rec.structs = m.structs.map((s) => [s.x, s.y, s.w, s.h, s.door == null ? null : s.door, s.to || null]);
    // (placements only the expansion can show are left out: the twelve-chapter edition's (ed>=2) and the
    // development fixtures' (dev_verbs, dev_perform). A six-chapter game never meets them, so its geometry is the
    // base's; the expansion's own tests check what they place: tests/unit/verbs, perform, records.)
    const six = (x) => !(x.if && /(^|[&|])(ed>=2|dev_verbs|dev_perform)(?=$|[&|])/.test(String(x.if)));
    rec.triggers = h(m.triggers.filter(six).map((q) => [q.x, q.y, q.w, q.h, q.if || null, q.scene || q.run || null]));
    rec.spawn = h(m.def.spawn || null);
    rec.props = h(m.props.filter(six).map((p) => { const d = RB.props.P[p.p] || {}; return [p.p, p.x, p.y, p.w || d.w, p.h || d.h, !!(d.block && p.block !== false), p.if || null, !!(p.scene || p.text)]; }));
    rec.npcs = h((m.def.npcs || []).filter(six).map((n) => [n.id, n.x, n.y, n.if || null]));
    return rec;
  }
  const out = { base: '982c8df', maps: {}, props: {}, consts: {} };
  // (maps only the twelve-chapter edition can reach, `edition: 2` on their definition, are left out for the same reason:
  // the expansion's own tests walk them, e.g. tests/unit/expedition_cellars)
  for (const id of Object.keys(C.maps).sort()) if (!(C.maps[id].edition >= 2)) out.maps[id] = mapRecord(id);
  // Atlas rooms from three fixed seeds
  for (const seed of [11, 4242, 90001]) {
    const s = RB.state.newCampaign({}); s.id = 'geom-' + seed;
    const run = RB.atlas.newRun(s, [], { seed });
    run.started = 0;
    const built = RB.atlas.buildMaps(run);
    for (const id in built.maps) C.maps[id] = built.maps[id];
    for (const id of Object.keys(built.maps).sort()) out.maps[id] = mapRecord(id);
    for (const id in built.maps) delete C.maps[id];
  }
  for (const k of Object.keys(RB.props.P).sort()) { const d = RB.props.P[k]; out.props[k] = [d.w, d.h, !!d.block, d.across || null]; }
  out.consts = { TS: RB.tiles.TS || 16, petWorld: RB.petArt.SIZES.world };

  if (process.env.RECORD === '1') {
    fs.mkdirSync(path.dirname(FIX), { recursive: true });
    fs.writeFileSync(FIX, JSON.stringify(out, null, 0).replace(/\},"/g, '},\n"'));
    t.ok(true, 'recorded ' + Object.keys(out.maps).length + ' maps');
    return;
  }
  const base = JSON.parse(fs.readFileSync(FIX, 'utf8'));
  const diff = [];
  for (const id of Object.keys(base.maps)) {
    if (!out.maps[id]) { diff.push(id + ': missing'); continue; }
    for (const k of Object.keys(base.maps[id])) if (JSON.stringify(base.maps[id][k]) !== JSON.stringify(out.maps[id][k])) diff.push(id + '.' + k);
  }
  for (const id of Object.keys(out.maps)) if (!base.maps[id]) diff.push(id + ': new map (not in the base record)');
  t.eq(diff, [], 'collision, exits, doors, triggers, spawns, prop footprints and NPC places of ' + Object.keys(base.maps).length + ' maps (incl. Atlas rooms of three seeds) are as at the base commit');
  const pd = Object.keys(base.props).filter((k) => JSON.stringify(base.props[k]) !== JSON.stringify(out.props[k]));
  t.eq(pd, [], 'every prop definition keeps its footprint (w, h), blocking and across-flag (' + Object.keys(base.props).length + ' kinds)');
  t.eq(out.consts, base.consts, 'tile size and the pets\' road frame are unchanged');
};
