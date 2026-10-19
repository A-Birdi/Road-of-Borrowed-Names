// Road events stand on the road (RE-1; Robin, 2026-10-19: "These random events on the paths should have actual NPCs
// where the event is meant to take place, along with any relevant props. It should not force you into the interaction
// as soon as you enter, instead leaving it up to the player to interact with the given NPC or props"):
//  - walking onto a road chooses the visit's event as before; a placed one runs nothing (src/engine/90_game.js) but
//    stands there (`roadev.<road>.<event>`) until it is seen through or you leave the road;
//  - every road event is placed: its people and things on its road's map, on open ground you can reach, clear of the
//    ways out, of each other and of what already stands there; talking to its people (or examining a thing marked to
//    be met) runs its scene; a named speaker stands under their own id, so the scene's gestures find them.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, T = RB.town;
  const camp = (flags) => { const s = RB.state.newCampaign({ edition: 2 }); s.id = 're-test'; Object.assign(s.flags, flags || {}); s.map = 'sg.harbor'; RB.game.s = s; return s; };
  const go = (s, map) => { T.beforeEnter(s, map); s.map = map; };

  // ---- the coast road: the child stands under the fork's lantern ------------------------------------------------------
  {
    const s = camp({ departed: true, ch1_done: true });
    const child = C.maps['sg.road'].npcs.find((n) => n.roadEvent === 'sg_road.child');
    t.ok(!!child && child.char === 'lw_rd_child', 'the lost child is placed on the coast road');
    t.ok(!RB.state.test(s, child.if), 'not there before you walk onto the road');
    go(s, 'sg.road');
    t.eq(T.roadEventAt(s, 'sg.road'), 'sg.lw_road_child', 'walking onto it chooses the child, as before');
    t.ok(T.placedAt(s, 'sg.road'), 'placed: nothing runs on arrival');
    t.ok(RB.state.test(s, child.if), 'the child stands under the lantern');
    t.eq(child.talk, [{ scene: 'sg.lw_road_child' }], 'talking to the child runs the event');
    t.eq(T.roadEventAt(s, 'sg.road'), null, 'asked again on the same visit: nothing new');
    t.ok(RB.state.test(s, child.if), 'and the child is still there (left for later)');
    go(s, 'sg.harbor');
    t.ok(!RB.state.test(s, child.if), 'leaving the road: gone with the visit');
    go(s, 'sg.road');
    t.eq(T.roadEventAt(s, 'sg.road'), 'sg.lw_road_child', 'the next visit: there again (never lost)');
    T.roadDone(s, 'sg_road', 'child');
    t.ok(!RB.state.test(s, child.if), 'seen through: the child goes home');
    t.ok(T.eventHere(s, 'sg_road') === null, 'nothing stands on the road for the rest of the visit');
  }

  // ---- every road event is placed, well ------------------------------------------------------------------------------
  {
    const st = camp({ departed: true });
    let events = 0, placed = 0;
    const unplaced = [];
    for (const rid in C.roadEvents) {
      const D = C.roadEvents[rid];
      for (const e of [D.unique].concat(D.variants || []).filter(Boolean)) {
        events++;
        if (!e.at) { unplaced.push(rid + '.' + e.id); continue; }
        placed++;
        const mapId = e.at.map || D.maps[0];
        t.ok(D.maps.indexOf(mapId) >= 0, rid + '.' + e.id + ': on its own road (' + mapId + ')');
        const m = RB.maps.compile(mapId);
        const who = e.at.who || [], props = e.at.props || [];
        t.ok(who.length + props.length > 0, rid + '.' + e.id + ': something stands there');
        t.ok(who.length > 0 || props.some((p) => p.meet), rid + '.' + e.id + ': someone or something to go to');
        // reach from the map's spawn over open ground (other road events' people and things set aside)
        const sp = (m.def.spawn && m.def.spawn.default) || [m.exits[0].x, m.exits[0].y];
        const own = (o) => o.roadEvent;
        const block = (x, y) => RB.maps.blockedStatic(m, x, y) || (m.props || []).some((p) => !own(p) && !/dev_/.test(p.if || '') && (!p.if || RB.state.test(st, p.if)) && (RB.props.P[p.p] || {}).block && x >= p.x && x < p.x + (p.w || (RB.props.P[p.p] || {}).w || 1) && y >= p.y && y < p.y + (p.h || (RB.props.P[p.p] || {}).h || 1));
        const reach = new Set([sp[0] + ',' + sp[1]]), q = [[sp[0], sp[1]]];
        while (q.length) { const [x, y] = q.shift(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, k = nx + ',' + ny; if (nx < 0 || ny < 0 || nx >= m.w || ny >= m.h || reach.has(k) || block(nx, ny)) continue; reach.add(k); q.push([nx, ny]); } }
        const tiles = [];
        for (const w of who) {
          t.ok(!!C.chars[w.char], rid + '.' + e.id + ': ' + w.char + ' is a person');
          t.ok(w.x >= 0 && w.y >= 0 && w.x < m.w && w.y < m.h && !block(w.x, w.y), rid + '.' + e.id + ': ' + w.char + ' on open ground at ' + w.x + ',' + w.y);
          t.ok([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => reach.has((w.x + dx) + ',' + (w.y + dy))), rid + '.' + e.id + ': ' + w.char + ' can be walked up to');
          tiles.push([w.x, w.y, 1, 1]);
        }
        for (const p of props) {
          const pd = RB.props.P[p.p];
          t.ok(!!pd, rid + '.' + e.id + ': a prop kind ' + p.p);
          if (!pd) continue;
          const w = p.w || pd.w || 1, h = p.h || pd.h || 1;
          let free = true;
          for (let yy = p.y; yy < p.y + h; yy++) for (let xx = p.x; xx < p.x + w; xx++) if (xx >= m.w || yy >= m.h || block(xx, yy)) free = false;
          t.ok(free, rid + '.' + e.id + ': ' + p.p + ' on open ground at ' + p.x + ',' + p.y);
          if (p.meet) {
            let near = false;
            for (let yy = p.y - 1; yy <= p.y + h; yy++) for (let xx = p.x - 1; xx <= p.x + w; xx++) if (reach.has(xx + ',' + yy)) near = true;
            t.ok(near, rid + '.' + e.id + ': ' + p.p + ' (to be examined) can be walked up to');
          }
          tiles.push([p.x, p.y, w, h]);
        }
        // with the event in place, every way out can still be reached: no one stands across the road
        {
          const inEv = (x, y) => tiles.some((b) => x >= b[0] && x < b[0] + b[2] && y >= b[1] && y < b[1] + b[3]);
          const r2 = new Set([sp[0] + ',' + sp[1]]), q2 = [[sp[0], sp[1]]];
          while (q2.length) { const [x, y] = q2.shift(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, k = nx + ',' + ny; if (nx < 0 || ny < 0 || nx >= m.w || ny >= m.h || r2.has(k) || block(nx, ny) || inEv(nx, ny)) continue; r2.add(k); q2.push([nx, ny]); } }
          for (const x of m.exits || []) {
            if (x.if && !RB.state.test(st, x.if)) continue;
            let was = false, still = false;
            for (let yy = x.y; yy < x.y + (x.h || 1); yy++) for (let xx = x.x; xx < x.x + (x.w || 1); xx++) { if (reach.has(xx + ',' + yy)) was = true; if (r2.has(xx + ',' + yy)) still = true; }
            if (was) t.ok(still, rid + '.' + e.id + ': the way out to ' + x.to + ' is not blocked');
          }
        }
        // clear of the ways out, of each other and of the people already there
        const hit = (a, b) => a[0] < b[0] + b[2] && b[0] < a[0] + a[2] && a[1] < b[1] + b[3] && b[1] < a[1] + a[3];
        for (let i = 0; i < tiles.length; i++) {
          t.ok(!(m.exits || []).some((x) => hit(tiles[i], [x.x, x.y, x.w || 1, x.h || 1])), rid + '.' + e.id + ': clear of the ways out at ' + tiles[i].slice(0, 2));
          for (let j = i + 1; j < tiles.length; j++) t.ok(!hit(tiles[i], tiles[j]), rid + '.' + e.id + ': its people and things do not overlap at ' + tiles[i].slice(0, 2));
          t.ok(!(m.def.npcs || []).some((n) => !n.roadEvent && !/dev_/.test(n.if || '') && hit(tiles[i], [n.x, n.y, 1, 1])), rid + '.' + e.id + ': clear of the people already there at ' + tiles[i].slice(0, 2));
        }
        // a named speaker of the scene stands under their own id (the scene's gestures and faces find them)
        const sc = C.scenes[e.scene];
        const speakers = new Set(sc.cmds.filter((c) => c.op === 'say' && c.who && c.who !== 'narr' && c.who !== 'pc' && c.who !== 'comp').map((c) => c.who));
        for (const w of who) if (speakers.has(w.char)) t.ok((w.id || w.char) === w.char, rid + '.' + e.id + ': ' + w.char + ' stands as themselves');
      }
    }
    t.ok(placed > 0, 'road events placed: ' + placed + ' of ' + events + (unplaced.length ? ' (not yet: ' + unplaced.join(', ') + ')' : ''));
    t.eq(unplaced, [], 'every road event stands on its road');
  }
};
