// Known details › People (LI-7, Robin 2026-10-16: "saying we last saw someone at Reedwake is true, but not necessarily
// where in Reedwake"): a sighting keeps the spot, and the note says it in words: inside a small room, outside the
// nearest door, by a way out, or the part of the map; an older note without a spot still names the map.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const T = RB.town;
  t.ok(typeof T.spotWords === 'function', 'RB.town.spotWords exists');
  t.eq(T.spotWords('rw.village'), 'at Reedwake', 'no spot: the map, as before');
  t.eq(T.spotWords('rw.village', 29, 17), 'outside Hana\'s Teahouse, in Reedwake', 'beside a door: outside the building it opens into');
  t.eq(T.spotWords('rw.tea', 4, 4), 'inside Hana\'s Teahouse', 'in a small room: inside it');
  t.ok(/^by the way to the Lantern Road, in Reedwake$/.test(T.spotWords('rw.village', 2, 31)), 'near the road out: by the way to it (' + T.spotWords('rw.village', 2, 31) + ')');
  const far = T.spotWords('rw.village', 40, 32);
  t.ok(/^in the (south-east|south|east) of Reedwake$|^outside |^by the way to /.test(far), 'otherwise the part of the town: ' + far);
  const s = RB.state.newCampaign({ edition: 2, profile: 'E' });
  T.seen(s, 'oto', 'rw.village', 29.4, 16.6);
  t.eq(JSON.stringify([T.rec(s).lastSeen.oto.x, T.rec(s).lastSeen.oto.y]), '[29,17]', 'the sighting keeps the spot, rounded to its tile');
  T.seen(s, 'kiku', 'rw.village');
  t.ok(!('x' in T.rec(s).lastSeen.kiku), 'a sighting without a spot keeps none');
};
