// P18 Plan B (Robin's C-89): every profile-tiered language task, judged at every learning profile by the checkers the
// game itself uses (RB.challenge.check, RB.challenge.orderOk, RB.challenge.choicesFor, RB.forge, RB.relay.judge),
// with the tier each profile actually gets (RB.tasks.stepsOf for challenges, RB.activities.tier for creatures,
// encounters and activities, RB.relay.optsAt for the relay). Four continuous campaigns meet only their own profile's
// tier of what lies on their route; this meets every tier of everything.
//  - The registries are enumerated from the content, not listed by count: every object keyed by profile (F/E/I/A)
//    anywhere in RB.content is found and classed as a task (judged here), a task another suite already sweeps at
//    every tier (named, not repeated), or text that only varies by profile (each profile must select a line). An
//    object that fits no class fails the test, so a new registry cannot pass unseen.
//  - Acceptance: a write step's answer and every accepted form are accepted typed and handwritten; an order step's
//    answer and alternatives are accepted; a forged sentence's accepted replies are read; a relay said faithfully is
//    judged faithful.
//  - Negative controls, so nothing passes because everything is accepted: an empty reply and another task's answer
//    are refused; every option the choice mode marks wrong is also refused when typed; every choose step has a wrong
//    option; an arrangement that is not the answer is refused; a forged reply that is not accepted is not read as
//    accepted; a relay with any part overstated or understated is not faithful. A self-test first proves the sweep
//    reports a broken accept list, an accept-everything judge, an order step with no wrong arrangement and so on.
// What it does not do: judge whether the Japanese is natural (that is review, C-26), lay anything out (the browser
// suites), or record learning (wrong-answer, help and learning-record behaviour have their own suites: lang_answers,
// evidence, learn_prepare, practice_core).
import { load } from '../lib/load.mjs';

const LV = ['F', 'E', 'I', 'A'];

export default async (t) => {
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content;
  const s = RB.state.newCampaign({ profile: 'E' });
  RB.game.s = s;
  const plain = (x) => RB.tasks.plain(String(x == null ? '' : x)).replace(/\s/g, '');
  const atProfile = (P) => { s.learn.profile = P; s.profile = P; s.learn.kanaKnown = 'both'; s.learn.taught = {}; };

  // ---- the judges -------------------------------------------------------------------------------------------------
  // pool: answers of other write steps, by mode, for the "another task's answer" control
  const pool = { kana: [], meaning: [] };
  function poolAdd(st) { if (st && st.kind === 'write' && st.answer) (st.mode === 'meaning' ? pool.meaning : pool.kana).push(plain(st.answer)); }
  function foreign(st, acc) {
    const list = st.mode === 'meaning' ? pool.meaning : pool.kana;
    if (!list.length) return null;
    const accR = new Set(acc.map((a) => RB.tasks.readingOf(a)));
    const h = RB.util.hashStr(String(st.answer) + '|' + (st.item || ''));
    for (let k = 0; k < list.length; k++) {
      const x = list[(h + k) % list.length];
      if (x && !acc.includes(x) && !accR.has(RB.tasks.readingOf(x))) return x;
    }
    return null;
  }
  // judge one resolved step; returns { problems, accepted, refused, skipped }
  function judgeStep(st, where) {
    const out = { problems: [], accepted: 0, refused: 0, skipped: [] };
    const P = (m) => out.problems.push(where + ': ' + m);
    if (!st || typeof st !== 'object') { P('no step'); return out; }
    if (st.kind === 'write') {
      if (!st.answer && typeof st.judge !== 'function') { P('write step without an answer'); return out; }
      const acc = (st.accept && st.accept.length ? st.accept : [st.answer]).map(plain);
      for (const a of [plain(st.answer)].concat(acc)) {
        for (const hand of [false, true]) {
          const r = RB.challenge.check(a, st, { handwritten: hand });
          if (r && r.ok) out.accepted++; else P('an accepted form is refused' + (hand ? ' handwritten' : ' typed') + ': ' + a);
        }
      }
      // negative controls
      const no = (x, why) => { const r = RB.challenge.check(x, st); if (r && r.ok) P('accepted ' + why + ': "' + x + '"'); else out.refused++; };
      no('', 'an empty reply');
      const f = foreign(st, acc);
      if (f != null) no(f, 'another task\'s answer'); else out.skipped.push(where + ': no other answer in its mode to try');
      const opts = RB.challenge.choicesFor(st);
      if (!opts.some((o) => o.ok)) P('the choice mode offers no right answer');
      for (const o of opts) if (!o.ok) no(o.text, 'a choice the choice mode marks wrong');
      if (!opts.some((o) => !o.ok)) out.skipped.push(where + ': the choice mode offers no wrong option');
    } else if (st.kind === 'choose' || st.kind === 'listen') {
      if (st.kind === 'listen' && !(st.transcript && st.transcript.jp)) P('a listening step without its transcript');
      const opts = RB.challenge.choicesFor(st);
      if (opts.length !== (st.options || []).length) P('the choice mode shows ' + opts.length + ' of ' + (st.options || []).length + ' options');
      const right = opts.filter((o) => o.ok).length, wrong = opts.filter((o) => !o.ok).length;
      if (!right) P('no right option'); else out.accepted += right;
      if (!wrong) P('no wrong option: any choice passes'); else out.refused += wrong;
    } else if (st.kind === 'order') {
      const tiles = st.tiles || [];
      const sorted = (a) => a.map(plain).slice().sort().join('|');
      if (!Array.isArray(st.answer) || sorted(st.answer) !== sorted(tiles)) { P('the answer is not an arrangement of its tiles'); return out; }
      for (const a of [st.answer].concat(st.alts || [])) { if (RB.challenge.orderOk(st, a)) out.accepted++; else P('an accepted order is refused: ' + a.join(' ')); }
      // a wrong arrangement: the answer turned or reversed, the first that is none of the accepted orders
      const tries = [];
      for (let k = 1; k < tiles.length; k++) tries.push(st.answer.slice(k).concat(st.answer.slice(0, k)));
      tries.push(st.answer.slice().reverse());
      const accepted = [st.answer].concat(st.alts || []).map((a) => a.map(plain).join(''));
      const wrong = tries.find((a) => !accepted.includes(a.map(plain).join('')));
      if (!wrong) P('no wrong arrangement exists: any order passes');
      else if (RB.challenge.orderOk(st, wrong)) P('a wrong order is accepted: ' + wrong.join(' '));
      else out.refused++;
    } else if (st.kind === 'forge') {
      let F;
      try { F = RB.forge.prepare(st); } catch (e) { P('forge: ' + e.message); return out; }
      const fams = F.families || [];
      if (!fams.some((x) => x.ok)) P('no accepted reply');
      if (!fams.some((x) => !x.ok)) out.skipped.push(where + ': every authored reply is accepted (no wrong reply authored)');
      fams.forEach((fam) => {
        for (const q of RB.practiceB.sequences(fam)) {
          const j = F.judge(RB.jp.reading(q.join(' ')), {});
          if (fam.ok) { if (j && j.ok) out.accepted++; else P('an accepted reply is not read: ' + q.join(' ')); }
          else { if (j && j.ok) P('a reply that is not accepted is read as accepted: ' + q.join(' ')); else out.refused++; }
        }
      });
      const e = F.judge('', {});
      if (e && e.ok) P('an empty reply is accepted'); else out.refused++;
    } else P('unknown step kind ' + st.kind);
    return out;
  }

  // ---- self-test: the sweep reports what it must ------------------------------------------------------------------
  {
    poolAdd({ kind: 'write', answer: 'みず' }); poolAdd({ kind: 'write', answer: 'やま' });
    const bad = (st) => judgeStep(st, 'x').problems.length > 0;
    t.ok(!bad({ kind: 'write', answer: 'かぎ', accept: ['かぎ'], mode: 'kana' }), 'self-test: a sound write step passes');
    t.ok(bad({ kind: 'write', answer: 'かぎ', accept: ['かぎ', 'かき゚'], mode: 'kana' }) || bad({ kind: 'write', answer: 'かぎ', accept: ['いし'], mode: 'kana' }), 'self-test: an accept list that refuses the answer is reported');
    t.ok(bad({ kind: 'write', answer: 'かぎ', accept: ['かぎ'], judge: () => ({ ok: true }) }), 'self-test: a judge that accepts everything is reported');
    t.ok(bad({ kind: 'write', answer: 'かぎ', accept: ['かぎ'], mode: 'kana', choices: ['かぎ', 'かき'], judge: (x) => ({ ok: x === 'かぎ' || x === 'かき' }) }), 'self-test: a choice marked wrong but accepted when typed is reported');
    t.ok(bad({ kind: 'choose', options: [{ jp: 'a', ok: true }, { jp: 'b', ok: true }] }), 'self-test: a choose step with no wrong option is reported');
    t.ok(bad({ kind: 'choose', options: [{ jp: 'a' }, { jp: 'b' }] }), 'self-test: a choose step with no right option is reported');
    t.ok(bad({ kind: 'order', tiles: ['a', 'b'], answer: ['a', 'c'] }), 'self-test: an order answer that is not its tiles is reported');
    t.ok(bad({ kind: 'order', tiles: ['a', 'b'], answer: ['a', 'b'], alts: [['b', 'a']] }), 'self-test: an order step that accepts every order is reported');
    t.ok(!bad({ kind: 'order', tiles: ['b', 'a', 'c'], answer: ['a', 'b', 'c'] }), 'self-test: a sound order step passes');
    t.ok(bad({ kind: 'listen', options: [{ jp: 'a', ok: true }, { jp: 'b' }] }), 'self-test: a listening step without its transcript is reported');
    pool.kana.length = 0; pool.meaning.length = 0;
  }

  // ---- the census: every profile-keyed object in the content ------------------------------------------------------
  const isTiered = (o) => o && typeof o === 'object' && !Array.isArray(o) && Object.keys(o).length >= 1 && Object.keys(o).every((k) => LV.includes(k));
  const found = []; // { reg, key, path, segs, obj }
  {
    const seen = new Set();
    const walk = (o, reg, key, segs) => {
      if (!o || typeof o !== 'object' || seen.has(o)) return;
      seen.add(o);
      if (isTiered(o)) { found.push({ reg, key, path: segs.join('.'), segs, obj: o }); return; }
      for (const k of Object.keys(o)) walk(o[k], reg, Array.isArray(o) ? key : k, segs.concat(k));
    };
    for (const reg of Object.keys(C)) if (typeof C[reg] === 'object') walk(C[reg], reg, reg, [reg]);
  }
  // the classes: tasks judged here, tasks another suite sweeps at every tier, text selected by profile
  // (the Atlas's unmoored names: the run takes the name's own tier, AT.objectiveSteps; each tier is also a drill)
  const TASK = { 'challenges:tiers': 'challenge', 'enemies:answer': 'tier', 'enemies:truth': 'tier', 'activities:question': 'tier', 'encounters:task': 'tier', 'relay:say': 'relay', 'atlas:steps': 'own' };
  const ELSEWHERE = { 'practiceB:tiers': 'practice_b.test.mjs (the letters and the Proofreader\'s Tray, every tier, typed, built and handwritten)', 'practiceB:q': 'practice_b.test.mjs (the comparisons, every tier)' };
  const TEXT = /^(enemies:text|intentText:\w+|activities:(desc|text|clue|fragments|line|hint)|tellings:text|hallW\d+(Cards|Plaques):\d+|shells:text|atlas:doorClues)$/;
  const classOf = (f) => { const k = f.reg + ':' + f.key; return TASK[k] ? 'task' : ELSEWHERE[k] ? 'elsewhere' : TEXT.test(k) ? 'text' : null; };
  const unclassed = found.filter((f) => !classOf(f)).map((f) => f.path);
  t.eq(unclassed, [], 'every profile-keyed object in the content is a task judged here, a task swept elsewhere, or profile text');

  // ---- the sweep --------------------------------------------------------------------------------------------------
  // first pass: the answers pool (every write step at every tier)
  const resolved = []; // { reg, where, P, steps: [step] }
  for (const P of LV) {
    atProfile(P);
    for (const f of found) {
      const k = f.reg + ':' + f.key;
      if (TASK[k] === 'challenge') {
        const id = f.segs[1];
        const ch = C.challenges[id];
        const got = ch.tiers[P] ? P : null;
        resolved.push({ reg: 'challenges', where: 'challenge ' + id + ' at ' + P, P, own: got, steps: RB.tasks.stepsOf(ch, { profile: P }) });
      } else if (TASK[k] === 'tier') {
        const st = RB.activities.tier(f.obj);
        resolved.push({ reg: f.reg + '.' + f.key, where: f.path + ' at ' + P, P, own: f.obj[P] ? P : null, steps: [st ? RB.tasks.prepare(st) : null] });
      } else if (TASK[k] === 'own') {
        resolved.push({ reg: f.reg + '.' + f.key, where: f.path + ' at ' + P, P, own: f.obj[P] ? P : null, steps: [f.obj[P] ? RB.tasks.prepare(f.obj[P]) : null] });
      }
    }
  }
  // untiered challenges and drills: the same step at every profile
  atProfile('E');
  for (const id in C.challenges) if (!C.challenges[id].tiers) resolved.push({ reg: 'challenges (one form for all)', where: 'challenge ' + id, P: '-', own: '-', steps: RB.tasks.stepsOf(C.challenges[id]) });
  (C.drills || []).forEach((d, i) => resolved.push({ reg: 'drills (one form for all)', where: 'drill ' + (d.id || i), P: '-', own: '-', steps: [RB.tasks.prepare(d)] }));
  for (const r of resolved) for (const st of r.steps) poolAdd(st);

  const report = {}; // reg -> { objects, judged, fallback, steps, kinds, accepted, refused, skipped }
  const problems = [], skipped = [];
  const R = (reg) => report[reg] || (report[reg] = { judged: 0, fallback: 0, steps: 0, kinds: {}, accepted: 0, refused: 0, skipped: 0 });
  for (const r of resolved) {
    atProfile(r.P === '-' ? 'E' : r.P);
    const rr = R(r.reg);
    rr.judged++;
    if (r.own === null) rr.fallback++;
    r.steps.forEach((st, i) => {
      rr.steps++;
      const kind = (st && st.kind) || '?';
      rr.kinds[kind] = (rr.kinds[kind] || 0) + 1;
      const j = judgeStep(st, r.where + (r.steps.length > 1 ? ' step ' + i : ''));
      rr.accepted += j.accepted; rr.refused += j.refused; rr.skipped += j.skipped.length;
      problems.push(...j.problems); skipped.push(...j.skipped);
    });
  }

  // Foundations with only some kana taught: a write step becomes one blanked taught kana (RB.tasks.prepare); that kana
  // is accepted and any other is refused
  {
    const rr = R('challenges (Foundations, one taught kana blanked)');
    s.learn.profile = 'F'; s.profile = 'F'; s.learn.kanaKnown = 'none';
    s.learn.taught = {}; for (const k of 'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん') s.learn.taught[k] = 1;
    for (const id in C.challenges) {
      const ch = C.challenges[id];
      if (!ch.tiers || !ch.tiers.F) continue;
      RB.tasks.stepsOf(ch, { profile: 'F' }).forEach((st, i) => {
        if (st.kind !== 'write' || !st.single) return;
        rr.judged++; rr.steps++; rr.kinds.write = (rr.kinds.write || 0) + 1;
        const w = 'challenge ' + id + ' at F (blanked) step ' + i;
        if (RB.challenge.check(st.answer, st).ok) rr.accepted++; else problems.push(w + ': the blanked kana is refused');
        const other = st.answer === 'の' ? 'ね' : 'の';
        if (RB.challenge.check(other, st).ok) problems.push(w + ': another kana is accepted'); else rr.refused++;
      });
    }
  }

  // the relay: at every tier, every part (each branch of a conditional part, in a state where it applies)
  {
    const rr = R('relay.say');
    for (const id in C.relay) {
      const d = C.relay[id];
      // two states: the fresh one, and one where each part's own condition holds (a flag set, a var given its value)
      const on = RB.state.newCampaign({ profile: 'E' });
      for (const p of d.parts) for (const term of String(p.if || '').split(/[&|]/)) {
        if (!term || term[0] === '!') continue;
        const m = term.match(/^var\.(.+?)=(.+)$/);
        if (m) on.vars[m[1]] = m[2]; else if (/^[a-z0-9_]+$/.test(term)) on.flags[term] = true;
      }
      const states = [RB.state.newCampaign({ profile: 'E' }), on];
      const reached = new Set();
      for (const st of states) for (const P of LV) {
        st.learn.profile = P;
        const parts = RB.relay.parts(d, st);
        parts.forEach((p) => reached.add(p.id));
        const said = RB.relay.autoSaid(d, st, P);
        rr.judged++;
        const r = RB.relay.judge(d, said, st, P);
        if (r.ok) rr.accepted++; else problems.push('relay ' + id + ' at ' + P + ': said faithfully, it is not judged faithful');
        for (const p of parts) for (const o of RB.relay.optsAt(p, P)) {
          if (o.ok) continue;
          const r2 = RB.relay.judge(d, Object.assign({}, said, { [p.id]: o.id }), st, P);
          if (r2.ok) problems.push('relay ' + id + '.' + p.id + ' at ' + P + ': "' + o.id + '" (' + (o.over ? 'overstated' : 'understated') + ') is judged faithful'); else rr.refused++;
        }
      }
      for (const p of d.parts) if (!reached.has(p.id)) skipped.push('relay ' + id + '.' + p.id + ': no state tried here reaches it');
    }
  }

  // profile text: every profile selects a line (selection only; layout is the browser suites')
  const textProblems = [];
  let textObjects = 0, textSelections = 0;
  for (const f of found.filter((x) => classOf(x) === 'text')) {
    textObjects++;
    // the Atlas's door clues: the tablet the room shows (RB.atlas.doorClue) for whichever door is right
    if (f.reg === 'atlas' && f.key === 'doorClues') {
      for (const P of LV) for (const side of ['L', 'M', 'R']) for (let i = 0; i < 3; i++) {
        textSelections++;
        const v = RB.atlas.doorClue({ correct: side, clue: i }, P);
        if (!v || !v.jp || !String(v.jp).trim()) textProblems.push('atlas.doorClues at ' + P + ' for ' + side + ' #' + i + ': no clue');
      }
      continue;
    }
    for (const P of LV) {
      atProfile(P);
      const v = RB.activities.tier(f.obj);
      textSelections++;
      // a tier is a line, or a list of lines one of which is shown (a creature's telegraph)
      const lines = Array.isArray(v) ? v : [v];
      // (a line has Japanese, or for a hint after a wrong tray only English: what to look at again)
      // (the Hall's plaques and cards are rows [sentence, odd one out?, note]: the sentences its challenge asks about)
      if (!lines.length || lines.some((x) => { const tx = Array.isArray(x) ? x[0] : x && typeof x === 'object' ? x.jp || x.en : x; return !tx || !String(tx).trim(); })) textProblems.push(f.path + ' at ' + P + ': no line selected');
    }
  }

  // challenges met only with one companion, or only without one (a scene of a companion's, or a call under a companion
  // condition): which tier a player meets there depends on both their level and their companion's history, so each
  // must have its own tier at every level (their acceptance is judged above with every other challenge)
  {
    const compRe = /\b(comp|party|prov)\b|(^|[^a-z])(nao|mio|ren|suzu)_|[._](nao|mio|ren|suzu)(_|\b)/;
    const met = new Set();
    for (const id in C.scenes) for (const c of C.scenes[id].cmds || []) if (c.op === 'challenge' && (compRe.test(String(c.if || '')) || compRe.test(id))) for (const a of [].concat(c.id || c.arg || c.args || [])) if (C.challenges[a]) met.add(a);
    const list = [...met].sort();
    t.log('challenges met by companion (or companion history): ' + list.length + ' (' + list.join(', ') + ')');
    t.eq(list.filter((id) => !C.challenges[id].tiers || LV.some((P) => !C.challenges[id].tiers[P])), [], 'each challenge met by companion has its own tier at every level');
  }

  // ---- the report -------------------------------------------------------------------------------------------------
  const census = {};
  for (const f of found) { const k = f.reg + '.' + f.key + ' (' + classOf(f) + ')'; census[k] = (census[k] || 0) + 1; }
  t.log('census of profile-keyed objects: ' + found.length + ' in ' + new Set(found.map((f) => f.reg)).size + ' registries');
  for (const k of Object.keys(census).sort()) t.log('  ' + k + ': ' + census[k]);
  t.log('judged here (registry: tier resolutions · steps by kind · accepted inputs · refused negatives · skipped controls · resolutions that fell back to another tier):');
  for (const reg of Object.keys(report)) {
    const r = report[reg];
    t.log('  ' + reg + ': ' + r.judged + ' · ' + r.steps + ' ' + JSON.stringify(r.kinds) + ' · ' + r.accepted + ' · ' + r.refused + ' · ' + r.skipped + ' · ' + r.fallback);
  }
  for (const k in ELSEWHERE) t.log('  swept elsewhere: ' + k.replace(':', '.') + ' (' + found.filter((f) => f.reg + ':' + f.key === k).length + ') by ' + ELSEWHERE[k]);
  t.log('  swept elsewhere: fishing situations (RB.fishing, outside RB.content) by fishing.test.mjs (every tier, typed and handwritten, with an unrelated word refused)');
  t.log('profile text: ' + textObjects + ' objects, ' + textSelections + ' selections');
  t.log('skipped controls: ' + skipped.length + (skipped.length ? ' (first: ' + skipped.slice(0, 3).join('; ') + ')' : ''));
  const sum = (k) => Object.values(report).reduce((a, r) => a + r[k], 0);
  t.ok(sum('accepted') > 1000 && sum('refused') > 1000, 'the sweep judged ' + sum('accepted') + ' accepted inputs and ' + sum('refused') + ' refusals');
  t.eq(problems.slice(0, 20), [], 'every tier of every task: right answers accepted, wrong ones refused (' + problems.length + ' problems)');
  t.eq(textProblems.slice(0, 10), [], 'every profile selects a line of every profile text');
  for (const reg of Object.keys(report)) if (!/one form|blanked/.test(reg)) t.eq(report[reg].fallback, 0, reg + ': every profile has its own tier (no fallback)');
};
