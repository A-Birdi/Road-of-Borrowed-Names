// RBN-QA-114 (Agnes 6345107712; Local CL-207): the Lower House's arrival line calls its entrance 土間, "earthen-floored",
// but the lobby was wood throughout. Now the strip inside the door is packed earth, with the raised floor's edge along
// it, and nothing else in the room changes:
//  1. the earth: (5..7, 7..8) and the doorway (6, 9), and only there; the rest of the room as it was (wood, the
//     tatami at (9..12, 3..5), the way to the bath at (13, 2));
//  2. walking: every tile that was walkable still is, and nothing new is blocked;
//  3. the room's props, people and exit as they were, with one floor-level prop added (yn_doma: non-blocking, always
//     there, so it is baked into the ground under everyone), used on no other map;
//  4. the shared earth and wood tiles keep their drawings (the strip's look is the prop's own).
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content;
  const def = C.maps['yn.shimo'];
  const rows = def.terrain;
  const EARTH = new Set(['5,7', '6,7', '7,7', '5,8', '6,8', '7,8', '6,9']);
  // 1. the earth, and the room around it as it was
  const want = (x, y) => {
    if (EARTH.has(x + ',' + y)) return ':';
    if (y >= 2 && y <= 8 && x >= 1 && x <= 13) return x >= 9 && x <= 12 && y >= 3 && y <= 5 ? 'm' : '_';
    return '#';
  };
  const wrong = [];
  for (let y = 0; y < rows.length; y++) for (let x = 0; x < rows[y].length; x++) if (rows[y][x] !== want(x, y)) wrong.push(x + ',' + y + ':' + rows[y][x]);
  t.ok(rows.length === 10 && rows.every((r) => r.length === 15) && !wrong.length, 'earth inside the door and in the doorway, the rest of the room as it was' + (wrong.length ? ': ' + wrong.slice(0, 8).join(' ') : ''));
  // 2. walking
  const m = RB.maps.compile('yn.shimo');
  const blockedNow = [], wasOpen = [];
  for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
    const floor = want(x, y) !== '#';
    if (floor && m.block[y * m.w + x] && EARTH.has(x + ',' + y)) blockedNow.push(x + ',' + y);
    if (!floor && !m.block[y * m.w + x]) wasOpen.push(x + ',' + y);
  }
  t.ok(!blockedNow.length && !wasOpen.length, 'the earth is walked on as the wood was; the walls stay walls' + (blockedNow.length || wasOpen.length ? ': ' + blockedNow.concat(wasOpen).join(' ') : ''));
  t.ok(RB.tiles.LEGEND[':'].tile === 'path' && !RB.tiles.LEGEND[':'].prop, 'the earth is the game\'s own earth tile, with nothing on it that blocks');
  // 3. props, people, exit
  // (as on the task head 7dd1517: the room's own, and those other content adds to it)
  const props = def.props.map((p) => p.p + '@' + p.x + ',' + p.y);
  t.ok(JSON.stringify(props) === JSON.stringify(['yn_doma@5,7', 'exitmat@6,8', 'counter@2,3', 'noticeboard@6,2', 'yn_noren@13,2', 'sb_irori@10,6', 'lantern@1,6', 'bench@3,7', 'noticeboard@9,2']), 'the room\'s props as they were, with the entrance added: ' + props.join(' '));
  const pd = RB.props.P.yn_doma, doma = def.props[0];
  t.ok(pd && pd.block === false && pd.w === 3 && pd.h === 2 && !doma.if && !doma.scene, 'the entrance: three tiles by two, never in the way, always there (so baked into the ground), nothing to look at');
  // (everyone placed here on the task head, where they were; a later change may add someone, never on the earth)
  const people = def.npcs.map((n) => n.id + '@' + n.x + ',' + n.y);
  const BATH = ['12,3', '11,3', '12,4', '12,3', '11,3', '12,4', '12,3', '11,3', '12,4', '12,3', '11,3', '12,4', '2,4', '2,5', '2,6', '9,6', '12,6', '10,8'];
  const WERE = ['yn_tahei@3,2', 'yn_kane@5,5', 'yn_zenroku@11,4', 'yn_senta_r3@3,4'].concat(BATH.map((at, i) => 'vbp_yn_vb_bath_' + i + '@' + at));
  const gone = WERE.filter((p) => !people.includes(p));
  t.ok(!gone.length, 'Tahei, Kane, Zenroku and the rest where they were (' + WERE.length + ')' + (gone.length ? ': not as they were ' + gone.join(' ') : ''));
  t.ok(!def.npcs.some((n) => EARTH.has(n.x + ',' + n.y)), 'nobody is placed on the earth');
  t.ok(def.exits.length === 1 && def.exits[0].x === 6 && def.exits[0].y === 9 && def.exits[0].to === 'yn.lower', 'the way out, as it was');
  const others = Object.keys(C.maps).filter((id) => id !== 'yn.shimo' && (C.maps[id].props || []).some((p) => p.p === 'yn_doma'));
  t.ok(!others.length, 'the entrance is the Lower House\'s alone' + (others.length ? ': ' + others.join(', ') : ''));
  // 4. the shared tiles
  t.ok(RB.tiles.T.path && RB.tiles.T.wood && RB.tiles.T.wood.step === 'step_wood', 'the shared earth and wood tiles are still the game\'s own');
};
