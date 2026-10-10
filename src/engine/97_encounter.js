/* The encounter platform (expansion P04; docs/future/plan/03_ENCOUNTERS.md E1–E27; docs/future/work/P04_ENCOUNTERS.md).
 *
 * One committed exchange is one transaction, run here and nowhere else: the screens (src/ui/80_combat.js for
 * encounters with creatures, src/ui/80s_encounter.js for those without), the player model
 * (src/engine/96_combat_sim.js) and the automated story runs (src/engine/99_test.js) all call it. The rules it
 * calls are RB.combatLogic's, looked up at call time so the Atlas's wrappers still apply, or the set a caller
 * passes as `impl` (the player model's look-ahead uses the unwrapped rules).
 *
 * The order within an exchange, derived from the rules as they stood and held to the 1,710 recorded battles
 * (tests/fixtures/combat_golden.json):
 *   1. your response (or a procedure step, or a conversational choice), and the Harmony it earns;
 *   2. your companion's action, aimed where you aimed it; then the target goes back to yours;
 *   3. guests and neutrals, each by its agenda, in the order they joined (in a social encounter, the people
 *      react);
 *   4. every creature still standing, in its numbered order (left to right as they stand), each creature's
 *      second move straight after its first;
 *   5. the close: creatures whose knots are all free settle, what lasts a time counts down, the next moves are
 *      telegraphed, then calls and scheduled arrivals come (while there is room).
 * After each step the encounter's conclusions are checked, in the order the encounter lists them; the first that
 * holds ends the exchange there, as freeing the last knot with your response always has. So a creature settled
 * by your response never acts; a guest whose objective is met leaves before the creatures move; a conclusion
 * reached in the close comes before any arrival. Nothing here is timed, and nothing advances while a player reads,
 * writes or opens help: only `exchange` (or its steps, in this order) moves an encounter on.
 *
 * An encounter definition (content: RB.content.encounters[id]; the validator checks every one):
 *   { id, kind: 'battle' | 'social' | 'procedure' | 'study', name: { jp, en },
 *     lead, group: [ids] | { normal, hard },       creatures at the start (none for a conversation or a machine)
 *     setPiece, capacity,                          up to five on the creatures' side in an authored set piece
 *     rules: { wait, conditions, doubles, modifiers }, field: ['rain' | 'mist'],
 *     actors: [{ aid, side: 'guest' | 'neutral' | 'object', name, hp, cond, protectable, agenda, lines }],
 *     arrivals: [{ enemy, after | leadBelow, prevent: [tags], say }], calls: { enemy, standing, knots },
 *     objective: { kind, aid, rounds, text }, conclusions: [{ id, when, result, text, flags }],
 *     procedure: {…}, social: {…}, study: {…}, companion: { <comp>: [actions] }, help: {…}, story, pool }
 * Results: 'win' (succeeded), 'end' (concluded another authored way: an objective lost, a conversation's end;
 * never a defeat), 'lose' (the party fell: back to the checkpoint, learning kept), 'flee' (stepped back). */
var RB = (globalThis.RB = globalThis.RB || {});

RB.encounter = (function () {
  'use strict';
  const L = () => RB.combatLogic;
  const clone = (x) => (x == null ? x : JSON.parse(JSON.stringify(x)));
  const isObj = (x) => !!x && typeof x === 'object' && !Array.isArray(x);
  // the rules to run: the caller's set, else the live ones (with whatever wrappers are installed)
  function rules(impl) {
    const C = L();
    // (live rules: enemyAct looks up RB.combatLogic.foeAct itself, wrapped or not)
    if (!impl) return { playerAct: C.playerAct, compAct: C.compAct, enemyAct: C.enemyAct, foeAct: null, endRound: C.endRound };
    return {
      playerAct: impl.playerAct || C.playerAct, compAct: impl.compAct || C.compAct, enemyAct: impl.enemyAct || C.enemyAct,
      foeAct: impl.foeAct || null, endRound: impl.endRound || C.endRound,
    };
  }
  function defOf(id) {
    const d = (RB.content.encounters || {})[id];
    if (!d) throw new Error('unknown encounter ' + id);
    return d;
  }
  // the campaign's encounter record (older saves gain it empty: RB.save.migrate)
  function rec(s) {
    if (!isObj(s.enc)) s.enc = {};
    const e = s.enc;
    for (const k of ['proc', 'solved', 'rewarded', 'defeats', 'outcomes', 'studies']) if (!isObj(e[k])) e[k] = {};
    if (!isObj(e.wanderers)) e.wanderers = { recent: [], met: {} };
    if (!Array.isArray(e.wanderers.recent)) e.wanderers.recent = [];
    if (!isObj(e.wanderers.met)) e.wanderers.met = {};
    return e;
  }

  // ---- beginning an encounter -----------------------------------------------------------------------------------
  // A creature in an encounter: an existing creature's id, or { enemy: id, …what this encounter changes } (its
  // pattern, authored moves, conditions, knots, name): a set piece's variation, never a new species.
  function creature(spec) {
    const C = RB.content;
    if (typeof spec === 'string') return Object.assign({ id: spec }, C.enemies[spec] || {});
    const base = C.enemies[spec.enemy] || {};
    const o = Object.assign({ id: spec.enemy }, base, spec);
    delete o.enemy;
    if (spec.intents) o.intents = Object.assign({}, base.intents || {}, spec.intents);
    return o;
  }
  function groupOf(def, difficulty) {
    const g = def.group;
    if (!g || difficulty === 'relaxed') return [];
    const list = Array.isArray(g) ? g : (difficulty === 'hard' ? g.hard || g.normal : g.normal || g.hard) || [];
    return list.map(creature);
  }
  // an encounter with no creatures in it (a conversation, a machine): the party and the people or the object
  function bare(s, rules0) {
    const d = L().DIFF[s.learn.difficulty] || L().DIFF.normal;
    const comp = s.comp || null;
    const max = Math.max(4, s.resolve.max + ((d.resolve || 12) - 12));
    return {
      foes: [], cur: 0, pc: Math.min(s.resolve.pc + ((d.resolve || 12) - 12), max), comp: comp ? Math.min(s.resolve.comp + ((d.resolve || 12) - 12), max) : 0, max,
      ward: { pc: 0, comp: 0 }, harmony: 0, harmonyMax: 3, silenced: 0, compId: comp, compUses: {}, round: 0, log: [], over: null, diff: d,
      assist: s.learn.assist === 'assist', rules: Object.assign({}, rules0), actors: L().partyActors(comp), mistakeCostThisRound: 0,
    };
  }
  function actorFrom(a) {
    const o = Object.assign({ side: 'guest' }, clone(a));
    if (o.hp != null) o.maxHp = o.maxHp || o.hp;
    const cond = {};
    for (const c of [].concat(a.cond || [])) cond[c] = -1;
    o.cond = cond;
    o.left = false;
    return o;
  }
  // the arrivals of this encounter, drawn before it begins and kept with it (E2). Relaxed: never a hostile arrival.
  function schedule(def, s) {
    if (s.learn.difficulty === 'relaxed') return [];
    const out = [];
    for (const a of def.arrivals || []) out.push({ enemy: a.enemy, after: a.after, leadBelow: a.leadBelow, prevent: a.prevent || null, say: a.say || null, knots: a.knots, state: 'waiting' });
    if (s.learn.difficulty === 'hard') for (const a of def.extras || []) out.push({ enemy: a.enemy, after: a.after, leadBelow: a.leadBelow, prevent: a.prevent || null, say: a.say || null, knots: a.knots, state: 'waiting', extra: true });
    // a zone's table (an eligible dungeon encounter): 0–2 arrivals, drawn once from the campaign's own stream
    const T = def.arrivalTable;
    if (T && RB.streams && s.id) {
      const pick = RB.streams.fixed(s, 'enc:' + def.id + ':arrivals', 'arrivals', (d) => {
        const n = Math.min(2, Math.floor(d() * ((T.max != null ? T.max : 2) + 1)));
        const list = [];
        for (let k = 0; k < n; k++) list.push({ enemy: T.from[Math.floor(d() * T.from.length)], after: (T.after || 2) + k * (T.gap || 2) });
        return list;
      });
      for (const a of pick || []) out.push(Object.assign({ state: 'waiting', prevent: T.prevent || null }, a));
    }
    return out;
  }
  // def: an encounter definition or its id. o: { words } (the battle's inscriptions, for the study's fixed tools)
  function begin(def, s, o) {
    o = o || {};
    def = typeof def === 'string' ? defOf(def) : def;
    const kind = def.kind || 'battle';
    const rules0 = Object.assign({}, def.rules || {});
    let st;
    if (def.lead) {
      st = L().init(creature(def.lead), s, { group: groupOf(def, s.learn.difficulty), rules: rules0, maxFoes: def.setPiece ? def.capacity || 5 : null });
    } else st = bare(s, rules0);
    st.enc = {
      id: def.id, def, kind, flags: {}, outcome: null, conclusion: null, arrived: 0, prevented: 0,
      arrivals: schedule(def, s), lines: [], tried: {}, point: false,
      capacity: def.setPiece ? Math.min(5, def.capacity || 5) : Math.min(3, def.capacity || 3),
    };
    // tuned with modifiers in hand (E27; lead's decision F-12): where modifiers are allowed, a creature in a group
    // keeps at least two knots, so reaching two (いくつか, a knot each) never settles two creatures in one exchange
    if (rules0.modifiers && st.foes.length > 1) for (const f of st.foes) if (!f.boss && f.maxKnots < 2) { f.knots = 2; f.maxKnots = 2; }
    for (const a of def.actors || []) L().addActor(st, actorFrom(a));
    if (rules0.conditions && RB.conditions && st.foes.length) RB.conditions.begin(st, def.field);
    if (def.procedure) procBegin(st, s);
    if (def.social) socialBegin(st);
    if (def.study) st.enc.study = { limit: def.study.turns || 3 };
    st.noFlee = !!def.noFlee;
    return st;
  }

  // ---- conditions to test (`when`) ------------------------------------------------------------------------------
  function actorOf(st, aid) { return (st.actors || []).find((a) => a.aid === aid) || null; }
  function foeIndex(st, ref) {
    if (typeof ref === 'number') return ref;
    if (/^f\d+$/.test(ref)) return +ref.slice(1);
    const i = st.foes.findIndex((f) => f.enemyId === ref);
    return i;
  }
  function test(st, w, self) {
    if (w == null) return true;
    if (Array.isArray(w)) return w.every((x) => test(st, x, self));
    const E = st.enc || {};
    for (const k of Object.keys(w)) {
      const v = w[k];
      let ok = true;
      switch (k) {
        case 'all': ok = v.every((x) => test(st, x, self)); break;
        case 'any': ok = v.some((x) => test(st, x, self)); break;
        case 'not': ok = !test(st, v, self); break;
        case 'settled':
          if (v === 'all') ok = st.foes.length > 0 && L().allSettled(st);
          else ok = [].concat(v).every((r) => { const i = foeIndex(st, r === 'target' && self ? self.agenda.target : r); return i >= 0 && st.foes[i] && st.foes[i].knots <= 0; });
          break;
        case 'down': ok = [].concat(v).every((aid) => { const a = actorOf(st, aid); return !!a && (a.hp || 0) <= 0; }); break;
        case 'standing': ok = [].concat(v).every((aid) => { const a = actorOf(st, aid); return !!a && (a.hp == null || a.hp > 0) && !a.left; }); break;
        case 'left': ok = [].concat(v).every((aid) => { const a = actorOf(st, aid); return !!a && a.left; }); break;
        case 'rounds': ok = st.round >= v; break;
        case 'flag': ok = [].concat(v).every((f) => !!E.flags[f]); break;
        case 'noFlag': ok = [].concat(v).every((f) => !E.flags[f]); break;
        case 'arrived': ok = (E.arrived || 0) >= v; break;
        case 'prevented': ok = (E.prevented || 0) >= v; break;
        case 'comp': ok = st.compId === v; break;
        case 'proc': ok = !!E.proc && (v === 'done' ? E.proc.done : E.proc.steps[E.proc.step] && E.proc.steps[E.proc.step].id === v); break;
        case 'machine': ok = !!E.proc && Object.keys(v).every((m) => E.proc.machine[m] === v[m]); break;
        case 'stance': ok = !!E.social && Object.keys(v).every((aid) => [].concat(v[aid]).indexOf(E.social.stance[aid]) >= 0); break;
        case 'claims': ok = !!E.social && [].concat(v).every((c) => !!E.social.revealed[c]); break;
        case 'understanding': ok = !!E.social && E.social.understanding >= v; break;
        case 'used': ok = !!E.social && [].concat(v).every((id) => (E.social.used[id] || 0) > 0); break;
        case 'knots': ok = Object.keys(v).every((r) => { const i = foeIndex(st, r); return i >= 0 && st.foes[i].knots <= v[r]; }); break;
        default: throw new Error('unknown encounter condition ' + k);
      }
      if (!ok) return false;
    }
    return true;
  }

  // ---- conclusions ---------------------------------------------------------------------------------------------
  // An ordinary battle ends when every creature is settled (a win), or in the close when the party has fallen.
  // An encounter lists its own conclusions, checked in order; with none that holds, settling every creature
  // still wins a battle (an objective encounter says so itself if it should not).
  function conclude(st) {
    const E = st.enc;
    if (!E) return L().allSettled(st) ? 'win' : null;
    if (E.conclusion) return E.conclusion.result || 'win';
    for (const c of E.def.conclusions || []) {
      if (test(st, c.when)) { E.conclusion = c; E.outcome = c.id; return c.result || 'win'; }
    }
    if (st.foes.length && E.def.settleWins !== false && L().allSettled(st)) { E.conclusion = { id: 'settled', result: 'win' }; E.outcome = 'settled'; return 'win'; }
    return null;
  }

  // ---- the cards on offer ---------------------------------------------------------------------------------------
  // The responses for the current target, as the screen offers them: Unravel is blocked only while a word that
  // clears the way is known (every encounter stays solvable), a Hush on a family says so with the exchanges left,
  // and an encounter adds its own (procedure steps, conversational choices, Resolve this step).
  function cards(st, s, words) {
    const E = st.enc;
    const known = new Set(words.flatMap((w) => w.tags || []));
    let out = [];
    if (st.foes.length) {
      out = L().responses(st, words);
      for (const c of out) {
        if (c.kind === 'unravel' && st.shroud && !(known.has('light') || known.has('wind'))) c.disabled = null;
        if (c.kind === 'unravel' && st.silenced && (known.has('bell') || known.has('voice'))) c.disabled = 'The hush swallows words: ring a bell or raise a voice first.';
      }
    } else if (E) {
      out.push({ id: 'unravel', kind: 'unravel', icon: '🪢', jp: 'ほどく', en: 'Unravel', desc: 'Restore something tangled — where something really is.' });
      for (const w of words) out.push({ id: 'w:' + w.id, kind: 'word', word: w, icon: w.icon || '✦', jp: w.jp, en: w.en, desc: w.effect });
      if (st.rules.wait) out.push({ id: 'wait', kind: 'wait', icon: '…', jp: '{待|ま}つ', en: 'Wait', desc: st.rules.waitDesc || 'Say nothing this time, and let the others speak.' });
    }
    // a Hush on one family of responses (E26): the card says why, for how long, and what ends it
    if (st.hushed) {
      for (const c of out) {
        const fam = c.kind === 'word' && RB.conditions ? RB.conditions.familyOf(c) : null;
        const left = fam && st.hushed[fam];
        if (left && !c.disabled) c.disabled = 'Hushed for ' + left + ' more exchange' + (left > 1 ? 's' : '') + ': a bell or a voice ends it now.';
      }
    }
    if (E && E.proc) out = procCards(st, s).concat(out);
    if (E && E.social) out = socialCards(st).concat(out);
    // a response that did nothing in a situation that has not changed since is marked tried (C-64)
    if (E && !st.foes.length) for (const c of out) if (E.tried[c.id] === stateKey(st)) c.tried = true;
    return out;
  }
  function stateKey(st) {
    const E = st.enc;
    return JSON.stringify([E.proc ? [E.proc.step, E.proc.machine] : null, E.social ? [E.social.stance, E.social.revealed, E.social.understanding, E.flags] : null]);
  }

  // ---- the steps -----------------------------------------------------------------------------------------------
  // 1. Your response. res: { ok, firstTry, mistakes } from the language step.
  function player(st, card, res, enemy, impl) {
    res = res || { ok: true, firstTry: true, mistakes: 0 };
    const E = st.enc;
    if (card.kind === 'proc' || card.kind === 'resolve') return procAct(st, card, res);
    if (E && E.social) return socialAct(st, card, res);
    if (!st.foes.length) return plainAct(st, card, res);
    const R = rules(impl);
    const hb = st.harmony;
    const P = R.playerAct(st, card, res, enemy);
    if (st.compId && st.harmony > hb) P.fx.push({ t: 'harmony', n: st.harmony, max: st.harmonyMax });
    if (E) preventArrivals(st, card, P.fx);
    return P;
  }
  // a response in an encounter with no creatures and no conversation (a machine): it does what it does in
  // general, and says plainly when that was nothing (C-60, C-64)
  function plainAct(st, card, res) {
    const fx = [];
    costOf(st, res, fx);
    const step = st.enc.proc && st.enc.proc.steps[st.enc.proc.step];
    const fam = card.kind === 'word' && RB.conditions ? RB.conditions.familyOf(card) : card.kind;
    const r = step && step.responses && (step.responses[card.kind === 'word' ? card.word.id : card.kind] || step.responses[fam]);
    if (r && test(st, r.when)) { applyEffect(st, r.effect || {}, fx); fx.push({ t: 'say', en: r.says ? r.says.en : '', jp: r.says ? r.says.jp : '' }); }
    else {
      const says = card.kind === 'unravel' ? (step && step.untangled) || { en: 'Nothing here is tangled.' } : card.kind === 'wait' ? { en: 'You wait. Nothing moves.' } : { en: 'Nothing here answers to it.' };
      fx.push({ t: 'say', none: true, en: says.en, jp: says.jp });
      st.enc.tried[card.id] = stateKey(st);
    }
    return { fx, answered: [], countered: false, perfect: res.ok && res.firstTry !== false };
  }
  // a mistake costs at most 1 resolve an exchange, and nothing with Assisted (as in every battle)
  function costOf(st, res, fx) {
    st.mistakeCostThisRound = 0;
    if (res && res.mistakes > 0 && !st.assist) {
      st.mistakeCostThisRound = 1;
      st.pc = Math.max(0, st.pc - 1);
      fx.push({ t: 'cost', en: 'A slip of the brush costs a little resolve (−1).' });
    }
  }
  // 2. Your companion's action. cact: { act: id | def, target } or null; T: the target of your response.
  function companion(st, cact, P, T, impl) {
    const id = cact && cact.act && (typeof cact.act === 'string' ? cact.act : cact.act.id);
    if (!id || id === 'join') return null;
    const E = st.enc;
    if (E && E.social) return socialCompanion(st, id);
    if (E && E.def.companion && E.def.companion[st.compId] && E.def.companion[st.compId].some((a) => a.id === id)) return ownCompanion(st, id, T);
    if (!st.foes.length) return null;
    const R = rules(impl);
    const hc = st.harmony;
    L().target(st, cact.target != null ? cact.target : T);
    const cfx = R.compAct(st, id, P).fx;
    if (!L().target(st, T)) st.cur = L().defaultTarget(st);
    if (st.harmony > hc && !cfx.some((f) => f.t === 'harmony')) cfx.push({ t: 'harmony', n: st.harmony, max: st.harmonyMax });
    return cfx;
  }
  // an encounter's own companion actions (E10): authored per encounter, in the companion's own role
  function companionOptions(st, s) {
    const E = st.enc;
    if (!E || !st.compId || st.comp <= 0 && st.foes.length) return [];
    const list = E.social ? (E.def.social.companion || {})[st.compId] : (E.def.companion || {})[st.compId];
    return (list || []).filter((a) => test(st, a.when) && !(a.once && (st.compUses[a.id] || 0) > 0)).map((a) => ({ def: { id: a.id, name: a.name, desc: a.desc, aim: a.aim || 'none', own: true }, locked: false, used: false }));
  }
  function ownCompanion(st, id, T) {
    const list = (st.enc.def.companion || {})[st.compId] || [];
    const a = list.find((x) => x.id === id);
    const fx = [];
    if (!a) return fx;
    st.compUses[id] = (st.compUses[id] || 0) + 1;
    applyEffect(st, a.effect || {}, fx, T);
    fx.push({ t: 'cact', who: st.compId, id, en: a.says ? a.says.en : '', jp: a.says ? a.says.jp : '' });
    return fx;
  }
  // 3. Guests and neutrals act by their agendas (E1, E3); in a conversation, the people react (E8).
  function guests(st, P) {
    const gfx = [];
    const E = st.enc;
    if (!E) return gfx;
    if (E.social) return socialDrift(st);
    for (const a of st.actors) {
      if ((a.side !== 'guest' && a.side !== 'neutral') || a.left || !a.agenda) continue;
      if (a.hp != null && a.hp <= 0) { a.left = true; gfx.push({ t: 'leave', aid: a.aid, en: line(a, 'hurt') || (a.name.en + ' falls back, out of it.') }); continue; }
      const ag = a.agenda;
      const ti = ag.target != null ? foeIndex(st, ag.target) : -1;
      const tf = ti >= 0 ? st.foes[ti] : null;
      // what you did this exchange, as this person sees it
      const youHit = !!(P && tf && (P.fx || []).some((f) => (f.t === 'unravel' || f.t === 'settle' || f.t === 'cond') && f.foe === ti));
      if (tf && tf.knots <= 0) {
        const how = youHit ? (ag.reactsTo && ag.reactsTo.youSettle) || 'satisfied' : 'done';
        a.left = true;
        if (how === 'engaged') { a.engaged = true; E.flags['engaged:' + a.aid] = true; }
        gfx.push({ t: 'leave', aid: a.aid, how, en: line(a, how) || line(a, 'leave') || (a.name.en + ' nods and goes on their way.') });
        continue;
      }
      if (ag.leavesWhen && test(st, ag.leavesWhen, a)) { a.left = true; gfx.push({ t: 'leave', aid: a.aid, en: line(a, 'leave') || (a.name.en + ' goes on their way.') }); continue; }
      if (youHit && ag.reactsTo && ag.reactsTo.youHelp) gfx.push({ t: 'gsay', aid: a.aid, en: line(a, ag.reactsTo.youHelp) || '' });
      const act = ag.act || { kind: 'say' };
      const n = act.n || 1;
      if (act.kind === 'unravel' && tf) {
        tf.knots = Math.max(0, tf.knots - n);
        gfx.push({ t: 'gact', aid: a.aid, act: 'unravel', foe: ti, n, en: line(a, 'act') || (a.name.en + ' works a knot loose.') });
        // their own work done: they go, with their own words
        if (tf.knots <= 0) { a.left = true; gfx.push({ t: 'leave', aid: a.aid, how: 'done', en: line(a, 'done') || line(a, 'leave') || (a.name.en + ' goes on their way.') }); }
      }
      else if (act.kind === 'soften' && tf) { tf.soften = (tf.soften || 0) + n; gfx.push({ t: 'gact', aid: a.aid, act: 'soften', foe: ti, n, en: line(a, 'act') || (a.name.en + ' gets in its way: its blow will land softer.') }); }
      else if (act.kind === 'ward') { const on = act.on || 'pc'; st.ward[on] = (st.ward[on] || 0) + n; gfx.push({ t: 'gact', aid: a.aid, act: 'ward', target: on, n, en: line(a, 'act') || (a.name.en + ' stands guard.') }); }
      else if (act.kind === 'stun' && tf && tf.intent) { tf.stunned = a.aid; gfx.push({ t: 'gact', aid: a.aid, act: 'stun', foe: ti, en: line(a, 'act') || (a.name.en + ' throws it off its stride.') }); }
      else if (line(a, 'act')) gfx.push({ t: 'gsay', aid: a.aid, en: line(a, 'act') });
    }
    return gfx;
  }
  function line(a, key) {
    const l = a.lines && a.lines[key];
    if (!l) return '';
    return typeof l === 'string' ? l : l.en || '';
  }
  // 4. The creatures still standing, each in turn. Returns { efx, standing, intents } as they were when the step
  // began (the screen plays each creature's move from these). A guest stunned a creature: its move comes to nothing.
  function foes(st, P, impl) {
    const R = rules(impl);
    const standing = L().standing(st);
    const intents = st.foes.map((f) => f.intent);
    if (!standing.length) return { efx: [], standing, intents };
    let answered = P.answered || [P.countered];
    if (st.enc) answered = st.foes.map((f, i) => !!(P.answered && P.answered[i]) || (!!f.stunned && f.stunned.indexOf && f.stunned.indexOf(':') > 0));
    const efx = R.foeAct ? R.enemyAct(st, answered, R.foeAct) : R.enemyAct(st, answered);
    return { efx, standing, intents };
  }
  // 5. The close of the exchange. Returns { revived, over, afx (arrivals) }.
  function close(st, enemy, impl) {
    const E = st.enc;
    let revived = false;
    const afx = [];
    if (st.foes.length) {
      const R = rules(impl);
      R.endRound(st, enemy);
      if (st.log.length && st.log[st.log.length - 1].t === 'revive') { st.log.pop(); revived = true; }
    } else {
      st.round++;
      if (E && E.social) socialClose(st);
    }
    if (E) {
      if (st.over === 'win' && E.def.settleWins === false) st.over = null;
      if (st.over !== 'lose') {
        const r = conclude(st);
        if (r) st.over = r;
        else if (st.over === 'win') st.over = null;
      }
      if (!st.over) arrive(st, afx);
      if (!st.over && E.study && st.round >= E.study.limit) { st.over = 'end'; E.outcome = 'over'; E.conclusion = { id: 'over', result: 'end', text: E.def.study.explain || null }; }
      st.calls = [];
    }
    return { revived, over: st.over || null, afx };
  }

  // ---- arrivals (E2) ---------------------------------------------------------------------------------------------
  // What is on its way, for the telegraph: [{ enemy, in (exchanges), prevent (tags that stop it), say }].
  function coming(st) {
    const E = st.enc;
    if (!E) return [];
    const out = [];
    for (const a of E.arrivals) {
      if (a.state !== 'waiting') continue;
      if (a.after != null) { const n = Math.max(0, a.after - st.round); if (n <= 2) out.push({ enemy: a.enemy, in: n || 1, prevent: a.prevent, say: a.say }); }
      else if (a.leadBelow != null && st.foes[0] && st.foes[0].knots <= a.leadBelow + 1) out.push({ enemy: a.enemy, in: null, prevent: a.prevent, say: a.say, when: 'below' });
    }
    return out;
  }
  function room(st) {
    const E = st.enc;
    const side = L().standing(st).length + st.actors.filter((a) => a.side === 'neutral' && a.hostile && !a.left).length;
    return side < E.capacity;
  }
  function joinFoe(st, spec, knots, afx, how) {
    const def = creature(spec);
    const enemyId = def.id;
    const f = L().makeFoe(def, Math.max(1, knots || Math.min(2, def.knots || 2)));
    L().addActor(st, f);
    const i = st.foes.length - 1;
    f.pi = i % f.pattern.length;
    if (st.rules.conditions && RB.conditions) for (const c of def.conditions || []) RB.conditions.set(st, f, c, -1);
    L().withFoe(st, i, (g) => { st.intent = L().drawIntent(g.def, st); });
    st.enc.arrived++;
    afx.push({ t: 'arrive', foe: i, enemy: enemyId, how, en: ((def.name && def.name.en) || 'A creature') + ' joins the encounter.' });
    return i;
  }
  function arrive(st, afx) {
    const E = st.enc;
    // Relaxed: never a hostile arrival, whoever calls (the tested promise: Relaxed always meets one creature)
    if (st.diff === L().DIFF.relaxed) { if ((st.calls || []).length) afx.push({ t: 'arrive', none: true, en: 'The call goes unanswered.' }); return; }
    // calls answered by no one bring the creature called (a summoner's, up to its standing limit)
    for (const c of st.calls || []) {
      const spec = E.def.calls || {};
      const enemyId = c.enemy || spec.enemy;
      if (!enemyId) continue;
      const standingCalled = st.foes.filter((f) => f.called && f.knots > 0).length;
      if (spec.standing != null && standingCalled >= spec.standing) { afx.push({ t: 'arrive', none: true, en: 'Nothing more comes: there are already as many as can answer.' }); continue; }
      if (!room(st)) { afx.push({ t: 'arrive', none: true, en: 'There is no room for anything more to come.' }); continue; }
      const i = joinFoe(st, enemyId, spec.knots, afx, 'called');
      st.foes[i].called = true;
    }
    for (const a of E.arrivals) {
      if (a.state !== 'waiting') continue;
      const due = (a.after != null && st.round >= a.after) || (a.leadBelow != null && st.foes[0] && st.foes[0].knots <= a.leadBelow);
      if (!due || !room(st)) continue;
      a.state = 'arrived';
      joinFoe(st, a.enemy, a.knots, afx, a.extra ? 'extra' : 'scheduled');
    }
  }
  // a response that stops what is coming: a bell calls the swarm off, a rope holds the way shut (never "Silence")
  function preventArrivals(st, card, fx) {
    if (card.kind !== 'word') return;
    const tags = card.word.tags || [];
    const near = coming(st);
    for (const a of st.enc.arrivals) {
      if (a.state !== 'waiting' || !a.prevent || !tags.some((t) => a.prevent.indexOf(t) >= 0)) continue;
      if (!near.some((c) => c.enemy === a.enemy)) continue;
      a.state = 'prevented';
      st.enc.prevented++;
      fx.push({ t: 'prevent', enemy: a.enemy, en: 'What was coming turns back.' });
    }
  }

  // ---- effects authored in content (companion actions, procedure steps, conversational choices) ---------------
  function applyEffect(st, e, fx, T) {
    const E = st.enc;
    if (e.flag) for (const f of [].concat(e.flag)) E.flags[f] = true;
    if (e.unflag) for (const f of [].concat(e.unflag)) delete E.flags[f];
    if (e.reveal && E.social) for (const c of [].concat(e.reveal)) if (!E.social.revealed[c]) { E.social.revealed[c] = true; fx.push({ t: 'claim', claim: c }); }
    if (e.stance && E.social) for (const aid of Object.keys(e.stance)) { const was = E.social.stance[aid]; E.social.stance[aid] = e.stance[aid]; if (was !== e.stance[aid]) fx.push({ t: 'stance', aid, from: was, to: e.stance[aid] }); }
    if (e.understanding && E.social) {
      const was = E.social.understanding;
      E.social.understanding = Math.max(0, Math.min(E.social.max, was + e.understanding));
      st.harmony = E.social.understanding;
      if (E.social.understanding !== was) fx.push({ t: 'harmony', n: E.social.understanding, max: E.social.max, understanding: true });
    }
    if (e.machine && E.proc) Object.assign(E.proc.machine, e.machine);
    if (e.knots && st.foes.length) { const i = T != null ? T : st.cur; const f = st.foes[i]; if (f && f.knots > 0) { f.knots = Math.max(0, f.knots - e.knots); fx.push({ t: 'unravel', n: e.knots, foe: i, by: st.compId }); } }
    if (e.ward) for (const who of Object.keys(e.ward)) { st.ward[who] = (st.ward[who] || 0) + e.ward[who]; fx.push({ t: 'ward', target: who, n: e.ward[who] }); }
    if (e.hp) for (const aid of Object.keys(e.hp)) { const a = actorOf(st, aid); if (a) { a.hp = Math.max(0, Math.min(a.maxHp || 99, (a.hp || 0) + e.hp[aid])); } }
    if (e.leave) for (const aid of [].concat(e.leave)) { const a = actorOf(st, aid); if (a && !a.left) { a.left = true; fx.push({ t: 'leave', aid }); } }
    if (e.conclude) { const c = (E.def.conclusions || []).find((x) => x.id === e.conclude); if (c) { E.conclusion = c; E.outcome = c.id; } }
  }

  // ---- procedures (E7) and Resolve this step (E11) ---------------------------------------------------------------
  // procedure: { id, version, machine: {…}, show: [{ key, label, values }], restart: 'start' | 'stable',
  //   steps: [{ id, text: { jp, en } (the instruction, read in the language step), task (the language step),
  //     actions: [{ id, label: { jp, en }, means: { en } (the interpretation shown before committing),
  //       ok, set: {…}, result: { jp, en }, wrong: { en, restart, cost } }],
  //     stable (a checkpoint a long procedure goes back to), responses: { <family | word | 'unravel'>: … },
  //     untangled: { en } (what Unravel finds), reward: { once: id, flag } }] }
  function procBegin(st, s) {
    const P = st.enc.def.procedure;
    const kept = s && rec(s).proc[P.id];
    const fresh = { step: 0, machine: clone(P.machine || {}), stable: { step: 0, machine: clone(P.machine || {}) } };
    const k = kept && kept.version === (P.version || 1) && !kept.done ? kept : null;
    st.enc.proc = {
      id: P.id, version: P.version || 1, steps: P.steps, step: k ? k.step : 0, machine: k ? clone(k.machine) : fresh.machine,
      stable: k && k.stable ? clone(k.stable) : fresh.stable, start: clone(P.machine || {}), done: false, restarts: 0, resolved: 0,
      startOf: null,
    };
    st.enc.proc.startOf = clone(st.enc.proc.machine);
  }
  // the key under which a step counts as done before: the same procedure, the same step, the same version of its
  // instructions and the same machine state when it began (a different valve, or the same valve after the
  // machine changed, is never the same step)
  function solvedKey(p, step) {
    return p.id + ':' + step.id + ':v' + p.version + ':' + JSON.stringify(Object.keys(p.startOf || {}).sort().map((k) => [k, p.startOf[k]]));
  }
  function procCards(st, s) {
    const p = st.enc.proc;
    if (!p || p.done) return [];
    const step = p.steps[p.step];
    if (!step) return [];
    const out = step.actions.map((a) => ({ id: 'p:' + a.id, kind: 'proc', action: a, step: step.id, icon: '⚙', jp: a.label.jp, en: a.label.en, desc: a.desc || '', means: a.means || null }));
    if (s && rec(s).solved[solvedKey(p, step)]) {
      const ok = step.actions.find((a) => a.ok);
      if (ok) out.unshift({ id: 'resolve', kind: 'resolve', action: ok, step: step.id, icon: '✓', jp: ok.label.jp, en: 'Resolve this step (completed before)', desc: 'Does exactly what you did before: ' + ok.label.en + '. No writing; nothing new is recorded.', means: ok.means || null });
    }
    return out;
  }
  function procAct(st, card, res) {
    const E = st.enc, p = E.proc;
    const fx = [];
    const step = p.steps[p.step];
    if (card.kind !== 'resolve') costOf(st, res, fx);
    const a = card.action;
    const ok = !!a.ok && test(st, a.requires);
    if (ok) {
      if (a.set) Object.assign(p.machine, a.set);
      fx.push({ t: 'proc', ok: true, step: step.id, action: a.id, resolved: card.kind === 'resolve' || undefined, en: a.result ? a.result.en : '', jp: a.result ? a.result.jp : '' });
      if (card.kind === 'resolve') p.resolved++;
      else E.solvedNow = (E.solvedNow || []).concat([solvedKey(p, step)]);
      if (step.reward && card.kind !== 'resolve') E.rewardNow = (E.rewardNow || []).concat([step.reward]);
      if (step.stable) p.stable = { step: p.step + 1, machine: clone(p.machine) };
      p.step++;
      p.startOf = clone(p.machine);
      if (p.step >= p.steps.length) { p.done = true; fx.push({ t: 'proc', done: true, en: (E.def.procedure.done && E.def.procedure.done.en) || 'It is done.' }); }
    } else {
      const w = a.wrong || step.wrong || {};
      if (a.set && w.apply) Object.assign(p.machine, a.set);
      const restart = w.restart != null ? w.restart : E.def.procedure.restart || 'start';
      let to = p.step;
      if (restart === 'start' || restart === true) { to = 0; p.machine = clone(p.start); }
      else if (restart === 'stable') { to = p.stable.step; p.machine = clone(p.stable.machine); }
      if (to !== p.step) p.restarts++;
      p.step = to;
      p.startOf = clone(p.machine);
      if (w.cost && !st.assist) st.pc = Math.max(0, st.pc - w.cost);
      fx.push({ t: 'proc', ok: false, step: step.id, action: a.id, to: p.steps[to] ? p.steps[to].id : null, restart: to !== p.step || restart, en: w.en || 'That was not the way: the machine settles back.', cost: w.cost || 0 });
    }
    return { fx, answered: st.foes.map(() => false), countered: false, perfect: ok && res.ok && res.firstTry !== false, proc: { ok } };
  }

  // ---- social encounters (E8) ------------------------------------------------------------------------------------
  // social: { parties: [{ aid, name, stance, wants }], claims: { id: { by, jp, en, hidden } },
  //   actions: [{ id, kind, label, when, task, effect, says, once, lasting, means }],
  //   responses: { <word id | family | 'unravel' | 'wait'>: { when, effect, says } }, unravelTip: { en },
  //   companion: { <comp>: [{ id, name, desc, when, effect, says, once }] },
  //   drift: [{ when, effect, says, once }], understanding: n (the agreement meter's size), gesture: { name, effect, says },
  //   rounds (it comes to an end regardless), conclusions (in the encounter's own list) }
  function socialBegin(st) {
    const S = st.enc.def.social;
    for (const p of S.parties || []) if (!actorOf(st, p.aid)) L().addActor(st, actorFrom(Object.assign({ side: 'neutral' }, p)));
    const stance = {};
    for (const p of S.parties || []) stance[p.aid] = p.stance || 'listening';
    const revealed = {};
    for (const id of Object.keys(S.claims || {})) if (!S.claims[id].hidden) revealed[id] = true;
    st.enc.social = { stance, revealed, understanding: 0, max: S.understanding || 3, used: {}, drifted: {}, said: [] };
    st.harmonyMax = st.enc.social.max;
  }
  function socialCards(st) {
    const E = st.enc, S = E.def.social;
    const out = [];
    for (const a of S.actions || []) {
      if (a.once && E.social.used[a.id]) continue;
      if (!test(st, a.when)) continue;
      out.push({ id: 's:' + a.id, kind: 'social', action: a, icon: '💬', jp: a.label.jp, en: a.label.en, desc: a.desc || '', means: a.means || null, lasting: !!a.lasting });
    }
    if (S.gesture && st.compId && E.social.understanding >= E.social.max) out.unshift({ id: 'gesture', kind: 'gesture', icon: '✧', jp: S.gesture.name.jp, en: S.gesture.name.en, desc: S.gesture.desc || '', tech: st.compId });
    return out;
  }
  function socialAct(st, card, res) {
    const E = st.enc, S = E.def.social;
    const fx = [];
    costOf(st, res, fx);
    let did = false;
    if (card.kind === 'social') {
      const a = card.action;
      E.social.used[a.id] = (E.social.used[a.id] || 0) + 1;
      // a choice can work differently as things stand (`cases`, the first that holds); with none that holds it says
      // so, and changes nothing
      const cs = (a.cases || []).find((c) => test(st, c.when));
      if (a.cases && !cs) { if (a.says) fx.push({ t: 'say', none: true, en: a.says.en, jp: a.says.jp }); }
      else {
        applyEffect(st, (cs || a).effect || {}, fx);
        const sy = (cs && cs.says) || a.says;
        if (sy) fx.push({ t: 'say', who: 'pc', en: sy.en, jp: sy.jp });
        did = true;
      }
    } else if (card.kind === 'gesture') {
      applyEffect(st, S.gesture.effect || {}, fx);
      E.social.understanding = 0; st.harmony = 0;
      fx.push({ t: 'tech', who: st.compId, en: S.gesture.says ? S.gesture.says.en : '', jp: S.gesture.says ? S.gesture.says.jp : '' });
      did = true;
    } else {
      const key = card.kind === 'word' ? card.word.id : card.kind;
      const fam = card.kind === 'word' && RB.conditions ? RB.conditions.familyOf(card) : null;
      const R = S.responses || {};
      // by the word itself, its family, or any of its tags (a bell: 'bell')
      const tagKey = card.kind === 'word' ? (card.word.tags || []).find((t) => R[t]) : null;
      const r = R[key] || (fam && R[fam]) || (tagKey && R[tagKey]);
      if (r && test(st, r.when) && !(card.kind === 'unravel' && !r.effect)) { applyEffect(st, r.effect || {}, fx); if (r.says) fx.push({ t: 'say', en: r.says.en, jp: r.says.jp }); did = true; }
      else if (card.kind === 'unravel') {
        fx.push({ t: 'say', none: true, en: (R.unravel && R.unravel.says && R.unravel.says.en) || 'Nothing here is tangled: the problem is what each of them believes.' });
        if (!E.flags._unravelTold && S.unravelTip) { E.flags._unravelTold = true; fx.push({ t: 'tip', en: S.unravelTip.en, who: st.compId }); }
      } else if (card.kind === 'wait') {
        const w = S.wait;
        if (w && test(st, w.when)) { applyEffect(st, w.effect || {}, fx); if (w.says) fx.push({ t: 'say', en: w.says.en, jp: w.says.jp }); did = true; }
        else fx.push({ t: 'say', none: true, en: 'You let the silence sit. No one fills it.' });
      } else fx.push({ t: 'say', none: true, en: 'It changes nothing here.' });
    }
    if (!did) E.tried[card.id] = stateKey(st);
    return { fx, answered: [], countered: false, perfect: did && res.ok && res.firstTry !== false };
  }
  function socialCompanion(st, id) {
    const S = st.enc.def.social;
    const a = ((S.companion || {})[st.compId] || []).find((x) => x.id === id);
    const fx = [];
    if (!a) return fx;
    st.compUses[id] = (st.compUses[id] || 0) + 1;
    applyEffect(st, a.effect || {}, fx);
    fx.push({ t: 'cact', who: st.compId, id, en: a.says ? a.says.en : '', jp: a.says ? a.says.jp : '' });
    return fx;
  }
  // the people react to how things stand (authored, in order, each once unless repeatable)
  function socialDrift(st) {
    const E = st.enc, S = E.def.social;
    const fx = [];
    (S.drift || []).forEach((d, k) => {
      if (d.once !== false && E.social.drifted[k]) return;
      if (!test(st, d.when)) return;
      E.social.drifted[k] = true;
      applyEffect(st, d.effect || {}, fx);
      if (d.says) fx.push({ t: 'say', who: d.who || null, en: d.says.en, jp: d.says.jp });
    });
    return fx;
  }
  function socialClose(st) {
    const E = st.enc;
    // someone who is leaving goes at the end of the exchange
    for (const aid of Object.keys(E.social.stance)) if (E.social.stance[aid] === 'leaving') { const a = actorOf(st, aid); if (a && !a.left) a.left = true; }
  }

  // ---- the whole exchange --------------------------------------------------------------------------------------
  // input: { card, res, comp: { act, target } | null, target (whom your response acts on) }
  // o: { enemy, impl, onStep(name, ev) }. Returns the exchange's record:
  // { P, fx, cfx, gfx, efx, afx, standing, intents, won, wonByComp, revived, over, log }.
  function exchange(st, input, o) {
    o = o || {};
    const T = input.target != null ? input.target : st.cur;
    if (st.foes.length) L().target(st, T);
    const ev = { round: st.round, P: null, fx: [], cfx: null, gfx: [], efx: [], afx: [], standing: [], intents: [], won: false, wonByComp: false, revived: false, over: null };
    const step = (name) => { if (o.onStep) o.onStep(name, ev); };
    const ended = () => { const r = conclude(st); if (r) { ev.over = st.over = r; return true; } return false; };
    ev.P = player(st, input.card, input.res || { ok: true, firstTry: true, mistakes: 0 }, o.enemy, o.impl);
    ev.fx = ev.P.fx;
    const r1 = conclude(st);
    ev.won = r1 === 'win';
    step('player');
    if (r1) { ev.over = st.over = r1; step('companion'); return finish(ev); }
    ev.cfx = companion(st, input.comp, ev.P, T, o.impl);
    const r2 = conclude(st);
    ev.wonByComp = r2 === 'win';
    step('companion');
    if (r2) { ev.over = st.over = r2; return finish(ev); }
    ev.gfx = guests(st, ev.P);
    step('guests');
    if (st.enc && ended()) return finish(ev);
    const F = foes(st, ev.P, o.impl);
    ev.efx = F.efx; ev.standing = F.standing; ev.intents = F.intents;
    step('foes');
    if (st.enc && conclude(st) && conclude(st) !== 'win') { ev.over = st.over = conclude(st); return finish(ev); }
    const C = close(st, o.enemy, o.impl);
    ev.revived = C.revived; ev.over = C.over; ev.afx = C.afx;
    step('close');
    return finish(ev);
  }
  // the exchange's lines, for logs and tests: every effect in order, as plain words
  function finish(ev) {
    const line = (ph, f) => ph + ':' + f.t + (f.foe != null ? '@' + f.foe : '') + (f.aid ? '@' + f.aid : '') + (f.n != null ? '=' + f.n : '') + (f.who ? '>' + f.who : '') + (f.target ? '>' + f.target : '') + (f.change ? '/' + f.change : '') + (f.ok != null ? '/' + (f.ok ? 'ok' : 'wrong') : '');
    ev.log = [].concat(
      ev.fx.map((f) => line('you', f)),
      (ev.cfx || []).map((f) => line('comp', f)),
      ev.gfx.map((f) => line('guest', f)),
      ev.efx.map((f) => line('foe', f)),
      ev.afx.map((f) => line('close', f)),
      ev.over ? ['over:' + ev.over] : [],
    );
    return ev;
  }

  // ---- after the encounter: what the campaign keeps -------------------------------------------------------------
  // Called once when an encounter ends (any result). Steps solved count for Resolve this step; a procedure left
  // mid-way keeps its machine (stepping away costs nothing); one-time rewards are given once; a story encounter's
  // defeats are counted (only to offer help, E19); a lasting outcome is recorded (E17), neutrally.
  function finishEncounter(st, s, outcome) {
    const E = st.enc;
    if (!E || !s) return null;
    const R = rec(s);
    for (const k of E.solvedNow || []) R.solved[k] = true;
    const rewards = [];
    for (const rw of E.rewardNow || []) if (rw.once && !R.rewarded[rw.once]) { R.rewarded[rw.once] = true; rewards.push(rw); }
    if (E.proc) {
      const P = E.def.procedure;
      if (E.proc.done) R.proc[P.id] = { done: true, version: E.proc.version };
      else if (P.keep !== false) R.proc[P.id] = { step: E.proc.step, machine: clone(E.proc.machine), stable: clone(E.proc.stable), version: E.proc.version };
    }
    if (E.def.story && outcome === 'lose') R.defeats[E.id] = (R.defeats[E.id] || 0) + 1;
    if (E.conclusion && E.def.lasting) R.outcomes[E.id] = { id: E.outcome, t: Date.now() };
    if (E.study) {
      const won = st.over === 'win';
      const b = R.studies[E.id] || {};
      if (won && (!b.best || st.round < b.best)) b.best = st.round;
      b.tries = (b.tries || 0) + 1;
      R.studies[E.id] = b;
    }
    if (RB.streams && E.def.arrivalTable && (outcome === 'win' || outcome === 'end')) RB.streams.consume(s, 'enc:' + E.id + ':arrivals');
    return { rewards, flags: (E.conclusion && E.conclusion.flags) || null, outcome: E.outcome, text: E.conclusion && E.conclusion.text };
  }
  // help in a required story battle after a defeat (E19): what the companion offers now, escalating with defeats
  // (1 explain, 2 suggest, 3+ point); always optional, and the player may also ask at any time
  function helpOffer(s, def) {
    if (!def || !def.story) return 0;
    const n = rec(s).defeats[def.id] || 0;
    return Math.min(3, n);
  }

  // ---- wanderers (E3) --------------------------------------------------------------------------------------------
  // At most about one eligible encounter in eight brings a wanderer from the region's cast, drawn from the
  // campaign's own stream; none who appeared in the last five, never the same twice in a row.
  function wanderer(s, region, eligible) {
    const W = RB.content.wanderers || {};
    const R = rec(s).wanderers;
    if (!eligible || !RB.streams) return null;
    const cast = Object.keys(W).filter((id) => W[id].region === region && R.recent.indexOf(id) < 0);
    if (!cast.length) { R.recent.push(null); R.recent = R.recent.slice(-5); return null; }
    const roll = RB.streams.next(s, 'wanderers');
    if (roll >= (W._rate || 1 / 8)) { R.recent.push(null); R.recent = R.recent.slice(-5); return null; }
    const id = cast[Math.floor(RB.streams.next(s, 'wanderers') * cast.length)];
    R.recent.push(id); R.recent = R.recent.slice(-5);
    R.met[id] = (R.met[id] || 0) + 1;
    return id;
  }

  return {
    begin, exchange, player, companion, guests, foes, close, conclude, cards, coming, test, finishEncounter, helpOffer,
    wanderer, companionOptions, solvedKey, rec, defOf, actorOf, stateKey,
  };
})();
