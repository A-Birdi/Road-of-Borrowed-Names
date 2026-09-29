// The difficulty curve (docs/COMBAT_NOTES.md, "Difficulty curve"): every story
// encounter, the groups of the last chapter's final stretch and the Atlas's
// rooms and guardians, played through the real rules by the player model of
// RB.combatSim at every difficulty, alone and with each companion (with the
// companion actions unlocked by that point of the story), by a player who
// reads the telegraphs ('smart') and slips on one answer in four (the capped
// −1). Bounds, not hand-waving:
// - nothing is lost or left stalled, at any setting, with or without a companion;
// - Relaxed stays single and gentle; Standard and Demanding add creatures only
//   in the final stretch of the last chapter and in the Atlas;
// - a group is a step up from its lead alone, never a spike (rounds and
//   resolve lost within fixed margins of the same creature alone);
// - a companion supports, it does not play for you: the number of language
//   steps (rounds) barely drops with a companion, or with their whole arsenal.
// The table it prints is the one recorded in docs/COMBAT_NOTES.md.
import { load } from '../lib/load.mjs';
import { KNOWN_AT, CH6 } from '../lib/story_words.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, L = RB.combatLogic, Sim = RB.combatSim;
  const CHAPTER = { rw: 1, sg: 2, co: 3, sb: 4, lf: 5, sa: 6, atlas: 7 };
  const COMPS = [null, 'nao', 'mio', 'ren', 'suzu'];
  const DIFFS = ['relaxed', 'normal', 'hard'];
  // what a companion can do by a chapter: the second action after chapter 2, the
  // personal quests in their chapters, the later milestones only in the Atlas
  // (the earliest they could be set); `all`: every action (the strongest case)
  const unlocks = (ch, all) => {
    const flags = {}, quests = {};
    if (all || ch >= 3) flags.ch2_done = true;
    if (all || ch >= 4) quests.co_suzu = { done: true, stage: 9 };
    if (all || ch >= 5) quests.ren_ushio = { done: true, stage: 9 };
    if (all || ch >= 6) { quests.lf_nao = { done: true, stage: 9 }; quests.lf_mio = { done: true, stage: 9 }; }
    if (all || ch >= 7) { flags.lq_ally1 = true; flags.lq_ally2 = true; }
    return { flags, quests };
  };
  const play = (lead, o) => Sim.run(lead, Object.assign({ policy: 'smart', slips: 4 }, o));
  const agg = {};
  const add = (key, r) => {
    const a = agg[key] || (agg[key] = { n: 0, won: 0, rounds: 0, lost: 0, minPc: 1, maxRounds: 0 });
    a.n++; a.won += r.win ? 1 : 0; a.rounds += r.rounds; a.lost += r.lost; a.minPc = Math.min(a.minPc, r.minPc / r.max); a.maxRounds = Math.max(a.maxRounds, r.rounds);
  };
  const fails = [];

  // ---- every story encounter, alone ------------------------------------------------------------------
  for (const diff of DIFFS) {
    for (const comp of COMPS) {
      for (const id of Object.keys(C.enemies)) {
        const pre = id.split('.')[0], ch = CHAPTER[pre];
        const words = pre === 'atlas' ? CH6 : KNOWN_AT[id];
        if (!ch || !words) continue;
        const r = play(id, Object.assign({ difficulty: diff, comp, words }, unlocks(ch)));
        const kind = C.enemies[id].boss ? 'boss' : 'regular';
        add([diff, pre === 'atlas' ? 'atlas' : 'ch' + ch, kind, comp ? 'comp' : 'alone'].join('|'), r);
        if (!r.win) fails.push(diff + ' ' + (comp || 'alone') + ' ' + id + ' (' + (r.lose ? 'lost' : 'stalled') + ' after ' + r.rounds + ')');
        if (diff === 'relaxed' && kind === 'regular' && r.minPc / r.max < 0.5) fails.push('relaxed is not gentle: ' + (comp || 'alone') + ' ' + id + ' leaves ' + r.minPc + '/' + r.max);
      }
    }
  }
  // ---- the groups of the last chapter's final stretch -------------------------------------------------
  const places = [];
  for (const [mid, m] of Object.entries(C.maps)) for (const f of m.foes || []) if (f.group) places.push({ mid, f });
  t.ok(places.length >= 7, 'group placements in the final stretch: ' + places.length);
  const step = [];
  for (const diff of DIFFS) {
    for (const comp of COMPS) {
      for (const { mid, f } of places) {
        const ids = L.groupFor(f.enemy, f, diff);
        if (diff === 'relaxed') t.eq(ids.length, 1, 'Relaxed: ' + mid + ' ' + f.id + ' is one creature');
        else t.eq(ids.length, diff === 'normal' ? 2 : 3, (diff === 'normal' ? 'Standard' : 'Demanding') + ': ' + mid + ' ' + f.id + ' brings ' + (ids.length - 1) + ' more');
        const o = Object.assign({ difficulty: diff, comp, words: CH6 }, unlocks(6));
        const g = play(f.enemy, Object.assign({ group: ids.slice(1) }, o));
        const one = play(f.enemy, o);
        add([diff, 'ch6', 'group', comp ? 'comp' : 'alone'].join('|'), g);
        if (!g.win) fails.push(diff + ' ' + (comp || 'alone') + ' group ' + ids.join('+') + ' (' + (g.lose ? 'lost' : 'stalled') + ')');
        step.push({ diff, comp, ids: ids.join('+'), dr: g.rounds - one.rounds, dl: (g.lost - one.lost) / g.max, g, one });
      }
    }
  }
  // the whole-game driver's solver (RB.test.battle, with the policy it plays) meets every story group
  // honestly: the real rules, one creature at a time, the companion's turn each round
  {
    const game = RB.game;
    RB.test.enable({ battle: 'unravel' });
    for (const diff of DIFFS) for (const comp of COMPS.slice(1)) for (const { f } of places) {
      const s = RB.state.newCampaign({});
      const u = unlocks(6);
      Object.assign(s, { comp }); Object.assign(s.flags, u.flags); Object.assign(s.quests, u.quests);
      s.learn.difficulty = diff; s.words = CH6.slice();
      RB.game = { s };
      const ids = L.groupFor(f.enemy, f, diff);
      t.eq(RB.test.battle(f.enemy, { group: ids.slice(1) }), 'win', 'the driver\'s solver, ' + diff + ' with ' + comp + ': ' + ids.join('+'));
    }
    const logged = RB.test.log.filter((l) => l.t === 'battle');
    t.ok(logged.some((l) => l.group.length === 2) && logged.some((l) => l.group.length === 1) && logged.some((l) => !l.group.length), 'it fought them as one, two and three creatures (by setting)');
    t.ok(logged.some((l) => Object.keys(l.acts).length), 'with the companion\'s actions');
    t.eq(RB.test.problems, [], 'and reported no problem');
    RB.test.disable();
    RB.game = game;
  }
  // a step up, never a spike: against the same creature alone, at the same setting
  const spikes = step.filter((x) => x.dr > 5 || x.dl > 0.5);
  t.ok(!spikes.length, 'every group is within 5 exchanges and half a resolve bar of its lead alone: ' + spikes.slice(0, 4).map((x) => x.diff + ' ' + (x.comp || 'alone') + ' ' + x.ids + ' +' + x.dr + ' rounds, +' + Math.round(x.dl * 100) + '% resolve').join('; '));
  const avg = (xs, f) => xs.reduce((n, x) => n + f(x), 0) / Math.max(1, xs.length);
  for (const diff of ['normal', 'hard']) {
    const xs = step.filter((x) => x.diff === diff);
    const up = avg(xs, (x) => x.g.lost) - avg(xs, (x) => x.one.lost);
    t.ok(up > 0, (diff === 'normal' ? 'Standard' : 'Demanding') + ': a group costs more resolve than its lead alone (a real step up: +' + up.toFixed(1) + ' on average)');
    t.ok(avg(xs, (x) => x.g.rounds) <= avg(xs, (x) => x.one.rounds) * 1.6 + 0.5, 'and lasts about as long (' + avg(xs, (x) => x.g.rounds).toFixed(1) + ' vs ' + avg(xs, (x) => x.one.rounds).toFixed(1) + ' exchanges)');
  }
  // ---- the Atlas: generated rooms (groups by seed) and the guardian with attendants ---------------------
  const s0 = RB.state.newCampaign({});
  for (const diff of DIFFS) {
    for (const comp of COMPS) {
      for (let seed = 1; seed <= 4; seed++) {
        const run = RB.atlas.newRun(s0, [], { seed });
        const P = RB.atlas.plan(run);
        for (const d of Object.values(P.rooms)) {
          const fights = [d.guard, ...d.foes].filter(Boolean).map((pl) => ({ lead: pl.enemy, ids: L.groupFor(pl.enemy, pl, diff), kind: 'room' }));
          if (d.kind === 'climax') { const cd = C.atlas.climaxes[d.boss]; fights.push({ lead: cd.enemy, ids: L.groupFor(cd.enemy, { group: d.attendants }, diff), kind: 'guardian' }); }
          for (const fg of fights) {
            if (diff === 'relaxed') t.ok(fg.ids.length === 1, 'Relaxed Atlas: one creature (' + fg.ids.join('+') + ')');
            const r = play(fg.lead, Object.assign({ difficulty: diff, comp, words: CH6, group: fg.ids.slice(1) }, unlocks(7)));
            add([diff, 'atlas', fg.kind + (fg.ids.length > 1 ? '+' + (fg.ids.length - 1) : ''), comp ? 'comp' : 'alone'].join('|'), r);
            if (!r.win) fails.push(diff + ' ' + (comp || 'alone') + ' Atlas ' + fg.ids.join('+') + ' (' + (r.lose ? 'lost' : 'stalled') + ')');
          }
        }
      }
    }
  }
  t.ok(!fails.length, 'nothing is lost or stalled, at any setting, alone or with any companion (' + fails.length + '): ' + fails.slice(0, 6).join('; '));

  // ---- companions support; they do not play for you ------------------------------------------------------
  for (const diff of DIFFS) {
    for (let ch = 1; ch <= 7; ch++) {
      const lab = ch === 7 ? 'atlas' : 'ch' + ch;
      const a = agg[[diff, lab, 'regular', 'alone'].join('|')], c = agg[[diff, lab, 'regular', 'comp'].join('|')];
      if (!a || !c) continue;
      t.ok(c.rounds / c.n >= 0.7 * (a.rounds / a.n), diff + ' ' + lab + ': with a companion the language steps per encounter stay (' + (c.rounds / c.n).toFixed(1) + ' vs ' + (a.rounds / a.n).toFixed(1) + ' alone)');
    }
  }
  {
    // the whole arsenal against the first action only, in the last chapter at Standard
    let base = 0, full = 0, lb = 0, lf = 0;
    for (const comp of COMPS.slice(1)) for (const id of Object.keys(C.enemies).filter((x) => x.startsWith('sa.') && !C.enemies[x].boss)) {
      const b = play(id, { difficulty: 'normal', comp, words: CH6, flags: {}, quests: {} });
      const f = play(id, Object.assign({ difficulty: 'normal', comp, words: CH6 }, unlocks(7, true)));
      base += b.rounds; full += f.rounds; lb += b.lost; lf += f.lost;
    }
    t.ok(full >= 0.85 * base, 'the whole arsenal does not shortcut the language steps (' + full + ' vs ' + base + ' rounds)');
    t.ok(lf <= lb, 'it does make fights a little safer (' + lf + ' vs ' + lb + ' resolve lost)');
  }

  // ---- the table (docs/COMBAT_NOTES.md) ----------------------------------------------------------------
  const rows = Object.keys(agg).sort((x, y) => {
    const o = (k) => { const [d, c] = k.split('|'); return DIFFS.indexOf(d) * 100 + (c === 'atlas' ? 7 : +c.slice(2)) * 10; };
    return o(x) - o(y) || x.localeCompare(y);
  });
  t.log('difficulty curve (smart player, one slip in four answers): setting | chapter | encounter | party | n | won | rounds avg/max | resolve lost avg | lowest resolve');
  for (const k of rows) {
    const a = agg[k];
    t.log(k.split('|').join(' | ') + ' | ' + a.n + ' | ' + Math.round((100 * a.won) / a.n) + '% | ' + (a.rounds / a.n).toFixed(1) + '/' + a.maxRounds + ' | ' + (a.lost / a.n).toFixed(1) + ' | ' + Math.round(100 * a.minPc) + '%');
  }
};
