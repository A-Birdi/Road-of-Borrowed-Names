// Rest stops in the twelve-chapter regions (Agnes 6442276500, 6442579050, 6442960189; Local CL-489; CC-349): a rest stop
// is where the game itself offers a night's rest. Kawaya (Uno's "rest a while?") is one, except on the night Ichi is lost
// (mb_night: no leisurely talk while a child is missing); the Upper House is one once your room under the stairs is yours
// (yn_rooms_done); every rest stop before stays one, with its kind; places with no rest offer stay out.
//  - restHere at each: Kawaya by day, on the search night and after the rescue; the Upper House before and after its
//    rooms;
//  - every map where a scene offers a rest (!inn) from a prop or a person on it is a rest stop (so an inn cannot be
//    left out again), the Upper House once its rooms are done;
//  - the rest[=kind] condition, which the rest thoughts and the rest menu read, follows restHere.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, K = RB.company, test = RB.state.test;
  const at = (map, flags) => { const s = RB.state.newCampaign(); s.id = 'rest'; s.edition = 2; s.comp = 'nao'; s.map = map; Object.assign(s.flags, flags || {}); return s; };
  const kind = (map, flags) => { const r = K.restHere(at(map, flags)); return r ? r.kind : null; };

  t.eq(kind('mb.inn'), 'inn', 'Kawaya is a rest stop (an inn)');
  // the search night: mb.uno_evening sets mb_night and mb_ichi_lost; mb.morning_after clears mb_night after the rescue
  t.eq([kind('mb.inn', { mb_night: true, mb_ichi_lost: true }), kind('mb.inn', { mb_ichi_lost: true })], [null, 'inn'], 'Kawaya: not on the night Ichi is lost; a rest stop again once he is found (mb_night cleared)');
  const sets = (id, f) => C.scenes[id].cmds.some((c) => c.op === 'set' && c.args.includes(f)), unsets = (id, f) => C.scenes[id].cmds.some((c) => c.op === 'unset' && c.args.includes(f));
  t.ok(sets('mb.uno_evening', 'mb_night') && unsets('mb.morning_after', 'mb_night'), 'the night begins with the search (mb.uno_evening) and ends with the morning after (mb.morning_after)');
  t.eq([kind('yn.kami'), kind('yn.kami', { yn_rooms_done: true })], [null, 'inn'], 'the Upper House: not before your room there is yours; an inn after');
  t.eq([kind('yn.shimo'), kind('yn.shimo', { yn_rooms_done: true }), kind('mb.exchange'), kind('yn.upper')], [null, null, null, null], 'the Lower House and the streets outside are not rest stops');
  const before = { 'rw.tea': 'tea', 'sg.inn': 'inn', 'co.inn': 'inn', 'sb.inn': 'inn', 'sb.inn_room': 'room', 'lf.inn': 'inn', 'sa.hut': 'hut', 'sa.camp': 'camp', 'lq.koharu_hut': 'hut' };
  t.eq(Object.keys(before).map((m) => kind(m)), Object.values(before), 'every rest stop before is one still, with its kind');

  // every map where the game offers a night's rest
  const innScenes = new Set(Object.keys(C.scenes).filter((id) => C.scenes[id].cmds.some((c) => c.op === 'inn')));
  const offers = Object.keys(C.maps).filter((id) => {
    const m = C.maps[id];
    const scenes = [].concat((m.props || []).map((p) => p.scene), ...(m.npcs || []).map((n) => [].concat(n.talk || []).map((x) => (typeof x === 'string' ? x : x && x.scene))));
    return scenes.some((sc) => sc && innScenes.has(sc));
  }).sort();
  t.eq(offers, ['co.inn', 'lf.inn', 'mb.inn', 'rw.tea', 'sa.hut', 'sb.inn', 'sg.inn', 'yn.kami'], 'the maps where a scene offers a rest: ' + offers.join(' '));
  t.eq(offers.filter((m) => !kind(m, { yn_rooms_done: true })), [], 'every one of them is a rest stop');

  // the rest condition follows
  t.ok(test(at('mb.inn'), 'rest') && test(at('mb.inn'), 'rest=inn') && !test(at('mb.inn', { mb_night: true }), 'rest') && !test(at('yn.kami'), 'rest') && test(at('yn.kami', { yn_rooms_done: true }), 'rest=inn') && !test(at('yn.shimo'), 'rest'),
    'the rest condition (rest thoughts, the rest menu) follows: Kawaya (not on the search night), the Upper House after its rooms, not the Lower House');
};
