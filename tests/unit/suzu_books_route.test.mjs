// RBN-QA-128 (Agnes 6347939181, Local CL-222; Cloud CC-129 §7): Suzu's books (yn.suzu_books, the morning after her night
// apart) played only on coming into the lower town, but the mediation needs only yn_eve_done, so going from the inn to
// the hall reached the mediation, the walk and the chapter's end first. Now the same arrival scene is also the upper
// town's first, and the Upper House and the hall both open onto the upper town. Run as the game chooses an arrival
// scene (90_game.js runEnterEvents: the first whose condition holds and which has not played on that map):
//  1. Suzu back from her night apart, the books not seen: coming into the upper town plays them, before the walk where
//     the mediation is done too; coming into the lower town plays them as before;
//  2. once only: with the books seen, neither town plays them again, and the upper town's walk comes next;
//  3. not for anyone else: with another companion, or none, nothing changes (the walk, or nothing);
//  4. old saves: mediated, or past the chapter's end, with the books pending: they play on the next arrival in either
//     town; the scene's bond event, yn:settled, is its own hook, once, set by its own flag first;
//  5. nothing else in either town's arrival list moved.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content;
  const arrival = (s, map) => {
    for (const ev of C.maps[map].onEnter || []) {
      if (ev.if && !RB.state.test(s, ev.if)) continue;
      if (ev.once !== false && s.flags['enter:' + map + ':' + ev.scene]) continue;
      return ev.scene;
    }
    return null;
  };
  const mk = (comp, flags) => { const s = RB.state.newCampaign(); RB.game.s = s; s.comp = comp; Object.assign(s.flags, { yn_called: true, yn_arrived: true, yn_lower_seen: true, yn_eve_started: true, yn_eve_done: true }, flags); return s; };
  // 1
  const back = { yn_suzu_night: true, yn_suzu_back: true };
  t.eq(arrival(mk('suzu', back), 'yn.upper'), 'yn.suzu_books', 'Suzu back, books pending: the upper town plays them');
  t.eq(arrival(mk('suzu', back), 'yn.lower'), 'yn.suzu_books', 'and the lower town, as before');
  t.eq(arrival(mk('suzu', Object.assign({ yn_mediated: true }, back)), 'yn.upper'), 'yn.suzu_books', 'mediated too: the books before the walk');
  // 2
  const seen = mk('suzu', Object.assign({ yn_mediated: true, yn_suzu_books: true, 'enter:yn.lower:yn.suzu_books': true }, back));
  t.eq([arrival(seen, 'yn.upper'), arrival(seen, 'yn.lower')], ['yn.walk', null], 'books seen: not again; the upper town\'s walk comes next');
  const seenUp = mk('suzu', Object.assign({ yn_suzu_books: true, 'enter:yn.upper:yn.suzu_books': true }, back));
  t.eq(arrival(seenUp, 'yn.lower'), null, 'seen from the upper town: the lower town does not play them again');
  // 3
  for (const comp of [null, 'nao', 'mio', 'ren']) {
    t.eq([arrival(mk(comp, Object.assign({ yn_mediated: true }, back)), 'yn.upper'), arrival(mk(comp, back), 'yn.lower')], ['yn.walk', null], (comp || 'no companion') + ': nothing changes');
  }
  // 4
  const done = mk('suzu', Object.assign({ yn_mediated: true, yn_done: true }, back));
  t.eq([arrival(done, 'yn.upper'), arrival(done, 'yn.lower')], ['yn.suzu_books', 'yn.suzu_books'], 'past the chapter\'s end with the books pending: either town plays them');
  const sc = C.scenes['yn.suzu_books'].cmds;
  t.ok(sc[0].op === 'set' && sc[0].args.join(' ') === 'yn_suzu_books', 'the scene sets its own flag first');
  t.eq(sc.filter((c) => c.op === 'hook').map((c) => c.args.join(' ')), ['co_bond yn:settled'], 'its bond event, once in the scene');
  t.ok(sc.some((c) => c.op === 'warp' && c.args[0] === 'yn.playhouse'), 'it takes you to the playhouse itself, from either town');
  // 5
  const up = C.maps['yn.upper'].onEnter.map((e) => e.scene), lo = C.maps['yn.lower'].onEnter.map((e) => e.scene);
  t.eq(up, ['yn.suzu_books', 'yn.arrive', 'yn.walk', 'yn.evening'], 'the upper town: the books first, the rest as they were');
  t.eq(lo, ['yn.lower_first', 'yn.evening', 'yn.suzu_books'], 'the lower town: as it was');
};
