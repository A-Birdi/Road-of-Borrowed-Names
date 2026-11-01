// Wataru's outcome in the Company's thoughts (Agnes 6561292860; Local CL-620; Cloud CC-458): on Wataru's own route
// ("Tell the harbourmaster yourself") the scene sets sg_wataru_self and then, for both routes, sg_wataru_confessed, so
// both of a companion's thoughts on dec:sg_wataru held and the Company page could show "We spoke first…" after Wataru
// went himself (which one shows is chosen by a hash of companion, map and chapter). The four "we told" thoughts now
// hold only on the other route. In the loaded game, the decision recorded the game's own way (the flags set, the story
// settled), the thought read as the Company page reads it:
//  1. the eight thoughts: the four self ones as before, the four "we told" ones under sg_wataru_confessed&!sg_wataru_self;
//     their texts and voice keys as before; every other thought, and the invitation's follow-up, as before
//     (fingerprints taken before the change);
//  2. for each companion and each of the four flag states (both, self only, "we told" only, neither): which of the two
//     thoughts holds, and the thought shown on every Saltglass map (each with its own hash), within the recent-event
//     window: Wataru's route, its own thought everywhere; the other route, "we told" everywhere; neither, no thought on
//     the decision;
//  3. the thought shown is under its own voice key (Nao's: code.comp#70f9a63377 and #23b211b7f2);
//  4. a save's round trip keeps the decision and the right thought.
import crypto from 'node:crypto';
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state, K = RB.company;
  const flat = (x) => JSON.stringify(x);
  const fp = (x) => crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex').slice(0, 16);
  const key = (jp) => 'code.comp#' + crypto.createHash('sha256').update(String(jp)).digest('hex').slice(0, 10);
  const COMPS = ['nao', 'mio', 'ren', 'suzu'];
  const ALL = C.company.thoughts;
  const on = ALL.filter((x) => x.on === 'dec:sg_wataru');
  const SELF = {}, TOLD = {};
  for (const x of on) (x.when === 'sg_wataru_self' ? SELF : TOLD)[x.comp] = x;
  const sgMaps = Object.keys(C.maps).filter((m) => m.startsWith('sg.') && K.placeKey({ map: m }) === 'saltglass').sort();

  // 1. the eight thoughts
  t.ok(on.length === 8 && COMPS.every((c) => SELF[c] && TOLD[c] && TOLD[c].when === 'sg_wataru_confessed&!sg_wataru_self'),
    '1 the four self thoughts as before, the four "we told" ones under sg_wataru_confessed&!sg_wataru_self ' + flat(on.map((x) => [x.comp, x.when])));
  const texts = COMPS.map((c) => [c, SELF[c].text, TOLD[c].text]);
  const others = ALL.filter((x) => x.on !== 'dec:sg_wataru');
  const invite = C.scenes['co.inv_sg_hands_after'].cmds;
  t.ok(fp(texts) === TEXTS_FP && key(TOLD.nao.text.jp) === 'code.comp#23b211b7f2' && key(SELF.nao.text.jp) === 'code.comp#70f9a63377' && fp(others) === OTHERS_FP && fp(invite) === INVITE_FP,
    '1 their texts and keys, every other thought and the invitation\'s follow-up as before ' + flat({ texts: fp(texts), others: fp(others), n: others.length, invite: fp(invite) }));

  // 2. each companion, each flag state, every Saltglass map
  const STATES = { both: ['sg_wataru_self', 'sg_wataru_confessed'], self: ['sg_wataru_self'], told: ['sg_wataru_confessed'], neither: [] };
  const journey = (comp, flags) => {
    const s = S.newCampaign({ edition: 2 });
    s.comp = comp; s.map = 'sg.harbor'; s.playtime = 1000;
    for (const f of ['departed', 'ch1_done', 'sg_arrived', 'sg_wataru_met'].concat(flags)) s.flags[f] = true;
    RB.game.G.s = s; RB.game.s = s;
    K.sync(s, 'load');
    K.settle();
    return s;
  };
  const seen = {};
  for (const comp of COMPS) {
    for (const st in STATES) {
      const s = journey(comp, STATES[st]);
      const holds = [SELF[comp], TOLD[comp]].map((x) => S.test(s, x.when));
      const shown = sgMaps.map((m) => { s.map = m; const th = K.thought(s); return th && th.kind === 'recent' && th.id === 'dec:sg_wataru' ? th.text.en : null; });
      const want = st === 'both' || st === 'self' ? SELF[comp].text.en : st === 'told' ? TOLD[comp].text.en : null;
      const ok = flat(holds) === flat({ both: [true, false], self: [true, false], told: [false, true], neither: [false, false] }[st]) && shown.every((x) => x === want);
      seen[comp + ':' + st] = { holds, shown: [...new Set(shown)] };
      t.ok(ok, '2 ' + comp + ', ' + st + ': ' + (want ? '"' + want.slice(0, 40) + '…"' : 'no thought on the decision') + ' on every Saltglass map (' + sgMaps.length + ') ' + flat(seen[comp + ':' + st]));
    }
  }

  // 3. the voice key of the thought shown
  {
    const a = journey('nao', STATES.both), b = journey('nao', STATES.told);
    const ka = key(K.thought(a).text.jp), kb = key(K.thought(b).text.jp);
    t.ok(ka === 'code.comp#70f9a63377' && kb === 'code.comp#23b211b7f2', '3 Nao\'s thought under its own key on each route ' + flat([ka, kb]));
  }

  // 4. a save's round trip
  {
    const s = journey('suzu', STATES.both);
    const back = RB.save.migrate(JSON.parse(JSON.stringify(s)));
    RB.game.G.s = back; RB.game.s = back;
    const th = K.thought(back);
    t.ok(th && th.id === 'dec:sg_wataru' && th.text.en === SELF.suzu.text.en, '4 a save\'s round trip: the decision and Suzu\'s self thought ' + flat(th && th.text.en));
  }
};
// before this change (computed on its parent): the eight thoughts' texts, every other thought, the invitation's follow-up
const TEXTS_FP = '58aeec6aa8401d37', OTHERS_FP = 'c65058d47607f57e', INVITE_FP = '42bceeb39308fa2c';
