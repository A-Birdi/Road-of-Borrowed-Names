// RBN-QA-111 (Agnes; Local CL-207): once Sono has named the Courier's Inn at Sakashita for her grandfather
// (cr_family_inn), its doorway gets a new noren. Here:
//  1. the noren is a prop you walk through (non-blocking), drawn on the inn's front wall after the building (onWall);
//  2. it hangs at (7,10), the doorway of the house that leads into the inn (cr.saka_inn), and only there;
//  3. it is there only with cr_family_inn, before it not;
//  4. the doorway is walked through as before, with it or without it;
//  5. no other map has it.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content;
  // 1. the prop
  const P = RB.props.P.cr_noren;
  t.ok(P && P.block === false && P.onWall === true, 'the noren is walked through and drawn on the wall (block: false, onWall)');
  // 2. where
  const m = C.maps['cr.sakashita'];
  const here = m.props.filter((p) => p.p === 'cr_noren');
  const inn = (m.structs || []).find((b) => b.to === 'cr.saka_inn');
  const door = inn && (inn.x + inn.door) + ',' + (inn.y + inn.h - 1);
  t.ok(here.length === 1 && here[0].x + ',' + here[0].y === '7,10' && door === '7,10', 'one noren, at (7,10), the doorway into the inn (' + door + ')');
  // 3. when
  const st = (flags) => { const s = RB.state.newCampaign({ difficulty: 'normal' }); Object.assign(s.flags, flags); return s; };
  const shown = (s) => !here[0].if || RB.state.test(s, here[0].if);
  t.ok(here[0].if === 'cr_family_inn' && !shown(st({ cr_called: true, cr_done: true })) && shown(st({ cr_family_inn: true })), 'there only once the inn is named for her grandfather (cr_family_inn)');
  // 4. walking
  const cm = RB.maps.compile('cr.sakashita');
  t.ok(!cm.block[10 * cm.w + 7] && !RB.maps.blockedStatic(cm, 7, 10), 'the doorway is walked through as before');
  // 5. nowhere else
  const others = Object.keys(C.maps).filter((id) => id !== 'cr.sakashita' && (C.maps[id].props || []).some((p) => p.p === 'cr_noren'));
  t.ok(!others.length, 'no other map has it' + (others.length ? ': ' + others.join(', ') : ''));
};
