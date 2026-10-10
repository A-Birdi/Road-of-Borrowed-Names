// The world proof's dressing (playbook V6: "deterministic per scene, restricted to safe decorative zones; it cannot
// block navigation, hide a clue or change required room geometry"; src/engine/66_worldkit.js) on the proof's maps:
// no shrub on or beside anything you examine, any way out, trigger or person; rails only along a bridge's edge; the
// same dressing every time; and collision unchanged by it.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const K = RB.worldKit;
  RB.game.s = RB.state.newCampaign({});
  for (const id of ['rw.village', 'sg.harbor']) {
    const m = RB.maps.compile(id);
    const blockBefore = [];
    for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) blockBefore.push(RB.maps.blockedStatic(m, x, y) ? 1 : 0);
    const sh = K.shrubs(m);
    t.ok(sh.length > 0, id + ': dressed (' + sh.length + ' shrubs)');
    const near = (x, y, X, Y, w, h, r) => x >= X - r && x < X + (w || 1) + r && y >= Y - r && y < Y + (h || 1) + r;
    const bad = [];
    for (const s of sh) {
      for (const p of m.props) { const pd = RB.props.P[p.p] || {}; if ((p.scene || p.text) && near(s.x, s.y, p.x, p.y, p.w || pd.w, p.h || pd.h, 1)) bad.push('beside ' + p.p + ' at ' + p.x + ',' + p.y); }
      for (const e of (m.def.exits || []).concat(m.def.triggers || [])) if (near(s.x, s.y, e.x, e.y, e.w, e.h, 1)) bad.push('beside a way out or trigger at ' + e.x + ',' + e.y);
      for (const n of RB.content.maps[id].npcs || []) if (near(s.x, s.y, n.x, n.y, 1, 1, 1)) bad.push('beside ' + (n.char || n.id));
      for (const st of m.structs) if (near(s.x, s.y, st.x, st.y, st.w, st.h, 0)) bad.push('on a building');
    }
    t.eq(bad.slice(0, 5), [], id + ': no shrub on or beside anything examined, a way out, a trigger, a person or a building');
    // rails stand only on a bridge's edge tiles (birds are drawn only over water: pushDecor skips any other spot as
    // each frame is drawn, which this test does not repeat)
    const dec = K.decor(m, {});
    const rails = dec.filter((d) => d.kind === 'rail' || d.kind === 'railV');
    t.ok(rails.every((d) => /^bridge/.test(m.tiles[d.y * m.w + d.x].id)), id + ': rails only along a bridge (' + rails.length + ')');
    m.kitShrubs = null;
    t.eq(JSON.stringify(K.shrubs(m)), JSON.stringify(sh), id + ': the same dressing every time');
    const blockAfter = [];
    for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) blockAfter.push(RB.maps.blockedStatic(m, x, y) ? 1 : 0);
    t.eq(blockAfter.join(''), blockBefore.join(''), id + ': collision unchanged by it');
  }
};
