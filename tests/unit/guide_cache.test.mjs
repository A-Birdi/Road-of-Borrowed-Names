// The quest guide's cache (CC-541 finding 1; Local CL-708 and CL-711; Agnes 6650249477). The live answers were kept
// under a signature that counted the flags set, the scenes seen and the words known, so a change that kept each count
// (one flag cleared, another set) was read as the same journey: gate B's seal clears lf_east_open and sets lf_gate_b,
// and plate B stayed marked in the Gate Works until something else changed. Nothing cleared the cache when another
// journey began or was loaded either (only past 40 answers). Now the signature names them, and a journey begun, loaded
// or left clears it (`campaign:changing`). In node, on the real guide and content:
//  1. gate B sealed as lf.east_door's :seal does it, on the same map and without clearing anything: the guide moves on
//     to plate C, as a fresh analysis does (and as walking down the stairs did before);
//  2. a change that keeps every count gives a fresh answer, equal to a fresh analysis of the changed journey: a flag
//     cleared and another set (deleted, or set false as the guide's own copies do), a scene seen swapped for another,
//     a word known swapped for another;
//  3. asked again with nothing changed: the same answer, from the cache;
//  4. a journey begun, loaded, left for the title or started for a test clears the cache: the same journey asked
//     again is a fresh answer; a second journey with every count the same as the first, loaded after it, gets its own;
//  5. what the guide says is unchanged otherwise: each fixture journey's every active quest answers as a fresh
//     analysis does.
import fs from 'node:fs';
import { load, root } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const G = RB.questGuide, J = JSON.stringify;
  const where = (r) => r.how + ' ' + r.targets.map((x) => x.map + ':' + (x.id || x.p || x.kind) + '@' + x.x + ',' + x.y).join(' ');
  // a fresh analysis of a separate copy of the journey (the oracle)
  const fresh = (q, s) => { const c = JSON.parse(J(s)); G.reset(); const r = J(G.analyse(q, c)); G.reset(); return r; };
  const fixture = (name) => RB.save.migrate(JSON.parse(fs.readFileSync(root + '/tests/fixtures/campaign/' + name + '.json', 'utf8')));

  // ---- 1. gate B's seal, on the same map
  {
    const BASE = ['departed', 'ch1_done', 'ch2_done', 'ch3_done', 'ch4_done', 'lf_arrived', 'lf_town_intro', 'lf_yae_told', 'lf_tokuji_told', 'lf_tokuji_boat', 'lf_akari_key',
      'lf_stacks_open', 'lf_ledger_seen', 'lf_conduit_seen', 'lf_tower_entered'];
    const s = RB.state.newCampaign({ edition: 2 });
    s.comp = 'nao';
    for (const f of BASE) s.flags[f] = true;
    Object.assign(s.flags, { lf_gate_a: true, lf_mid_seen: true, lf_shortcut: true, lf_mid_drained: true, lf_east_open: true, lf_plate_b_read: true });
    s.seen['lf.east_door'] = true; // the door was opened through this scene
    s.quests.lf_main = { stage: 7, done: false, t: 1 };
    s.map = 'lf.tower_mid'; s.x = 10; s.y = 4;
    RB.game.s = s;
    G.reset();
    const before = where(G.targets('lf_main', s));
    // lf.east_door's :seal, its flag commands as the script runner does them (70_script.js: !unset deletes)
    const sc = RB.content.scenes['lf.east_door'];
    const ops = sc.cmds.slice(sc.labels.seal).filter((c) => c.op === 'set' || c.op === 'unset').map((c) => [c.op].concat(c.args));
    for (const [op, ...flags] of ops) for (const f of flags) { if (op === 'set') s.flags[f] = true; else delete s.flags[f]; }
    const after = G.targets('lf_main', s);
    const next = G.nextLines(after).map((l) => l.en).join(' | ');
    t.ok(J(ops) === J([['unset', 'lf_east_open'], ['set', 'lf_gate_b']]) && before === 'authored lf.tower_mid:lf_plate@9,3' && where(after) === 'authored lf.tower_low:lf_plate@3,2' &&
      J(after) === fresh('lf_main', s) && /in Drowned Stair/.test(next),
      '1 gate B sealed as its scene does it, on the same map, nothing cleared: plate B, then plate C, as a fresh analysis ' + J({ ops, before, after: where(after), next }));
  }

  // ---- 2. a change that keeps every count
  {
    const q = 'sb_snow';
    const set = (o) => Object.keys(o).filter((k) => o[k]);
    const cases = [
      ['a flag cleared (deleted) and another set', (x) => { const k = set(x.flags).find((f) => f !== 'postgame'); delete x.flags[k]; x.flags.zz_guide_cache_probe = true; }],
      ['a flag cleared (set false) and another set', (x) => { const k = set(x.flags).find((f) => f !== 'postgame'); x.flags[k] = false; x.flags.zz_guide_cache_probe = true; }],
      ['a scene seen swapped for another', (x) => { const k = set(x.seen)[0]; delete x.seen[k]; x.seen['sb.sculpt_goat'] = true; }],
      ['a word known swapped for another', (x) => { x.words = x.words.slice(); x.words[0] = Object.keys(RB.content.words).find((w) => !x.words.includes(w)); }],
    ];
    for (const [what, change] of cases) {
      const live = fixture('F-ren-ch4_done');
      RB.game.s = live;
      G.reset();
      const n0 = [set(live.flags).length, set(live.seen).length, live.words.length];
      const r1 = G.targets(q, live);
      change(live);
      const n1 = [set(live.flags).length, set(live.seen).length, live.words.length];
      const r2 = G.targets(q, live);
      t.ok(J(n0) === J(n1) && r2 !== r1 && J(r2) === fresh(q, live), '2 ' + what + ', every count kept: a fresh answer, as a fresh analysis ' + J({ n0, n1, hit: r2 === r1 }));
    }
  }

  // ---- 3. nothing changed: the cache answers
  {
    const s = fixture('F-ren-yn_done');
    RB.game.s = s;
    G.reset();
    const qs = Object.keys(s.quests).filter((q) => !s.quests[q].done && RB.content.quests[q]);
    const same = qs.every((q) => { const r = G.targets(q, s); return G.targets(q, s) === r; });
    t.ok(qs.length > 0 && same, '3 asked again with nothing changed: the same answer, from the cache (' + qs.length + ' quests)');
  }

  // ---- 4. a journey begun, loaded, left or started for a test
  {
    const s = fixture('F-ren-ch4_done');
    RB.game.s = s;
    const got = {};
    for (const to of ['new', 'load', 'title', 'debug']) {
      G.reset();
      const r1 = G.targets('sb_snow', s);
      RB.bus.emit('campaign:changing', { to });
      const r2 = G.targets('sb_snow', s);
      got[to] = r2 !== r1 && J(r2) === J(r1);
    }
    t.ok(Object.values(got).every(Boolean), '4 a journey begun, loaded, left or started for a test: the same journey asked again is a fresh answer ' + J(got));
    // a second journey, every count as the first's, loaded after it (gate B's seal again, as two saves)
    const BASE = ['departed', 'ch1_done', 'ch2_done', 'ch3_done', 'ch4_done', 'lf_arrived', 'lf_town_intro', 'lf_yae_told', 'lf_tokuji_told', 'lf_tokuji_boat', 'lf_akari_key',
      'lf_stacks_open', 'lf_ledger_seen', 'lf_conduit_seen', 'lf_tower_entered', 'lf_gate_a', 'lf_mid_seen', 'lf_shortcut', 'lf_mid_drained', 'lf_plate_b_read'];
    const make = (extra) => {
      const x = RB.state.newCampaign({ edition: 2 });
      x.comp = 'nao';
      for (const f of BASE.concat(extra)) x.flags[f] = true;
      x.seen['lf.east_door'] = true;
      x.quests.lf_main = { stage: 7, done: false, t: 1 };
      x.map = 'lf.tower_mid'; x.x = 10; x.y = 4;
      return x;
    };
    const one = make(['lf_east_open']), two = make(['lf_gate_b']);
    G.reset();
    RB.game.s = one;
    const a = where(G.targets('lf_main', one));
    RB.bus.emit('campaign:changing', { to: 'load', slot: 2 });
    RB.game.s = two;
    const b = G.targets('lf_main', two);
    t.ok(a === 'authored lf.tower_mid:lf_plate@9,3' && where(b) === 'authored lf.tower_low:lf_plate@3,2' && J(b) === fresh('lf_main', two),
      '4 a second journey with every count the same, loaded after the first: its own answer (plate C after plate B) ' + J({ a, b: where(b) }));
  }

  // ---- 5. otherwise as before: every fixture's every active quest answers as a fresh analysis does
  {
    const bad = [];
    let n = 0;
    for (const f of fs.readdirSync(root + '/tests/fixtures/campaign').filter((x) => x.endsWith('.json')).sort()) {
      const s = fixture(f.replace(/\.json$/, ''));
      RB.game.s = s;
      for (const q in s.quests) {
        if (s.quests[q].done || !RB.content.quests[q]) continue;
        const expect = fresh(q, s);
        G.reset();
        n++;
        if (J(G.targets(q, s)) !== expect) bad.push(f + ':' + q);
      }
    }
    t.ok(n > 50 && !bad.length, '5 every fixture journey\'s every active quest (' + n + '): the cached guide answers as a fresh analysis ' + J(bad.slice(0, 5)));
  }
};
