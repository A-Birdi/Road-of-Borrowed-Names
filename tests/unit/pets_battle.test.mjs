// Pets in battle (battle addendum §11, §23.1, §23.5): a cosmetic pet is never a battler.
// - Never among targets or results: across scripted encounters (a lone creature and groups of two
//   and three, each companion and none), no rules result, intent target, companion option, state key
//   or presentation event names the pet, and the rules' code does not read the pet system.
// - Identical with any pet, a hidden one or none: with a fixed seed (the game's Math.random stream
//   seeded the same way for every run), the tasks the encounter generates, the answer-option order,
//   every rules result, enemy choice and end state, and the presentation schedule of the actual actors
//   (every cue of the player's, companion's and creatures' choreography: time, type, length, actor,
//   pose, effect) are the same for no pet, each of the four species, a different look, a pet hidden by
//   the setting and one hidden by a scene — while the observer really did react when it was shown.
// - The observer's own timing: reactions fit inside the action they answer (never faster than 1.6×),
//   nothing plays for an instant-length action, a creature's preparation gets a brace and its move a
//   settle, and reduced motion holds one key pose.
import fs from 'node:fs';
import path from 'node:path';
import { load, root } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const C = RB.content, L = RB.combatLogic, Q = RB.battleSeq, F = RB.families, BP = RB.battlePets, PETS = RB.pets;
  // the vm context's own Math (the game's Math.random): reached through a function made in that context
  const CtxMath = RB.util.rng.constructor('return Math')();
  const realRandom = CtxMath.random;
  const seedRandom = (seed) => { let s = seed >>> 0; CtxMath.random = () => { s = (s + 0x6d2b79f5) | 0; let x = s; x = Math.imul(x ^ (x >>> 15), x | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; };
  // settings live on the game's G (RB.game.settings is a getter)
  const setSettings = (o) => { RB.game.G.settings = Object.assign({}, RB.game.G.settings || {}, o); };

  const words = ['mamoru', 'mizu', 'hikari', 'kaze', 'iyasu', 'nawa', 'ishi', 'honoo', 'suzu'];
  const fresh = (comp) => { const s = RB.state.newCampaign({}); s.map = 'rw.village'; s.comp = comp || null; s.words = words.slice(); s.learn.profile = 'E'; s.learn.kanaKnown = 'both'; return s; };
  // a compact, comparable record of a choreography's cues (the actual actors' presentation schedule)
  const cueRec = (cues) => cues.map((c) => [c.at, c.type, c.d || 0, c.who || c.side || null, c.pose || c.act || null, c.gesture || null, c.name || null, c.f ? c.f.t + ':' + (c.f.who || '') + ':' + (c.f.n || 0) : null]);
  const stepRec = (st) => st ? [st.kind, st.item, st.answer, (st.accept || []).join('|'), st.mode, (st.choices || []).join('|'), st.prompt && st.prompt.en] : null;

  // One scripted encounter through the rules and the choreography, the observer hearing every presentation
  // event as the screen would emit them (t0 on a virtual presentation clock) and being asked for its pose
  // through every action (so its own cosmetic stream runs as it does on screen).
  function play(enemyId, comp, petSetup, opts) {
    opts = opts || {};
    seedRandom(0xC0FFEE);
    const g = fresh(comp);
    setSettings({ petBattle: true, petWorld: true, reducedMotion: false });
    PETS.show();
    petSetup(g);
    const prevS = RB.game.s; RB.game.s = g;
    const ids = [enemyId].concat(opts.group || []);
    const enemy = Object.assign({ id: enemyId }, C.enemies[enemyId]);
    const group = (opts.group || []).map((id) => Object.assign({ id }, C.enemies[id]));
    const st = L.init(enemy, g, { group });
    const log = [], sched = [], events = [];
    let clock = 0;
    const emit = (ev, o) => { const e = Object.assign({ scope: 'battle', t0: clock, exchange: o.exchange }, o); events.push(['present:' + ev, e.actor || e.phase, (e.targets || []).join(',')]); RB.bus.emit('present:' + ev, e); };
    const watch = (from, to) => { for (let tt = from; tt <= to; tt += 50) BP.poseAt(tt, tt, false); };
    const origNow = Q.now; Q.now = () => clock;
    emit('scene', { phase: 'enter', comp: st.compId || null, foes: ids.length });
    for (let r = 0; r < 14 && !st.over; r++) {
      emit('scene', { phase: 'calm', exchange: r });
      const ws = g.words.map((w) => C.words[w]);
      const cards = L.responses(st, ws);
      const card = cards.find((c) => c.kind === 'tech') || cards[(r * 5) % cards.length];
      // the task the rules would put in front of you for it (the encounter's learning stream)
      const pool = (st.foes[st.cur] && (C.enemies[ids[st.cur]] || {}).pool) || enemy.pool || {};
      const task = card.kind === 'word' ? null : RB.tasks.next(pool, {});
      const order = RB.challenge && RB.challenge.choicesFor && task && task.kind === 'write' ? RB.challenge.choicesFor(task).map((o) => o.text || o.jp || JSON.stringify(o)) : null;
      const before = L.snapshot(st);
      const P = L.playerAct(st, card, { ok: true, firstTry: r % 3 !== 1, mistakes: r % 3 === 1 ? 1 : 0 }, enemy);
      const ctx = { comp: st.compId || null, reduce: false, view: before, group: st.foes.length > 1, foe: st.cur, reach: { foes: st.foes.map((f, i) => i) } };
      const CP = Q.choreo.player(card, P.fx, ctx);
      sched.push(['pc', CP.end, cueRec(CP.cues)]);
      emit('action', { actor: 'pc', action: card.id, family: F.ofCard(card), targets: ['foe:' + st.cur], result: 'x', exchange: r, beat: (CP.cues.find((c) => c.type === 'beat') || { at: 0 }).at, end: CP.end });
      watch(clock, clock + CP.end); clock += CP.end;
      const acts = L.compOptions(st, g, card).filter((o) => !o.locked);
      let C2 = null;
      if (acts.length && !L.allSettled(st)) {
        const a = acts[r % acts.length];
        C2 = L.compAct(st, a.def.id, P);
        const CC = Q.choreo.companion(Object.assign({ kind: a.def.effect && a.def.effect.kind, gesture: a.def.gesture }, a.def, { id: a.def.id }), C2.fx || [], { comp: st.compId, reduce: false, view: L.snapshot(st), group: st.foes.length > 1, foe: st.cur });
        sched.push(['comp', CC.end, cueRec(CC.cues)]);
        emit('action', { actor: 'comp', action: a.def.id, family: F.ofAction(a.def.id), targets: [], exchange: r, beat: 300, end: CC.end });
        watch(clock, clock + CC.end); clock += CC.end;
      }
      if (L.allSettled(st)) { log.push({ r, task: stepRec(task), order, fx: P.fx, c: C2 && C2.fx, win: true }); break; }
      const intents = st.foes.map((f) => f.intent && f.intent.kind + ':' + f.intent.target);
      const efx = L.enemyAct(st, P.answered);
      for (let i = 0; i < st.foes.length; i++) {
        const it = st.foes[i].intent || st.intent;
        if (!it) continue;
        const mine = (efx || []).filter((f) => f.foe == null || f.foe === i);
        const CE = Q.choreo.enemy(it, mine, { comp: st.compId || null, reduce: false, view: L.snapshot(st), group: st.foes.length > 1, foe: i, art: (C.enemies[ids[i]] || {}).art || null });
        sched.push(['foe:' + i, CE.end, cueRec(CE.cues)]);
        const hit = mine.filter((f) => f.t === 'hit'), blk = mine.filter((f) => f.t === 'block');
        emit('enemy', { actor: 'foe:' + i, kind: it.kind, targets: hit.concat(blk).map((f) => f.who).filter((w, k, a) => w && a.indexOf(w) === k), outcome: hit.length ? 'hit' : blk.length ? 'absorbed' : 'status', exchange: r, at: (CE.cues.find((c) => c.type === 'beat') || { at: 400 }).at, end: CE.end });
        watch(clock, clock + CE.end); clock += CE.end;
      }
      L.endRound(st, enemy);
      log.push({ r, task: stepRec(task), order, fx: P.fx, c: C2 && C2.fx, intents, efx, pc: st.pc, comp: st.comp, knots: st.foes.map((f) => f.knots) });
    }
    const pet = BP.stats();
    emit('scene', { phase: 'exit' });
    Q.now = origNow;
    const endState = JSON.parse(JSON.stringify(st));
    RB.game.s = prevS;
    CtxMath.random = realRandom;
    PETS.show();
    return { rules: JSON.stringify({ log, over: st.over, endState }), sched: JSON.stringify(sched), events: JSON.stringify(events), pet, st: endState, logObj: log };
  }

  const SETUPS = {
    none: () => {},
    cat: (g) => { PETS.meet(g, 'cat'); PETS.select(g, 'cat'); },
    dog: (g) => { PETS.meet(g, 'dog'); PETS.select(g, 'dog'); },
    bird: (g) => { PETS.meet(g, 'bird'); PETS.select(g, 'bird'); PETS.setLook(g, 'bird', 'gray'); },
    tanuki: (g) => { PETS.meet(g, 'tanuki'); PETS.select(g, 'tanuki'); PETS.setLook(g, 'tanuki', 'dark'); },
    hiddenBySetting: (g) => { PETS.meet(g, 'cat'); PETS.select(g, 'cat'); setSettings({ petBattle: false }); },
    hiddenByScene: (g) => { PETS.meet(g, 'dog'); PETS.select(g, 'dog'); PETS.hide('test-scene'); setSettings({ petBattle: false }); },
  };
  const CASES = [
    { enemy: 'rw.dustmoth', comp: null },
    { enemy: 'rw.dustmoth', comp: 'mio' },
    { enemy: 'sg.crab', comp: 'nao', group: ['sg.fogwisp'] },
    { enemy: 'co.golem', comp: 'ren', group: ['co.ember', 'co.soot'] },
    { enemy: 'lf.wraith', comp: 'suzu' },
  ].filter((c) => C.enemies[c.enemy] && (c.group || []).every((id) => C.enemies[id]));
  t.ok(CASES.length >= 4, 'the scripted encounters exist (' + CASES.length + ')');

  const petWords = ['pet', 'cat', 'dog', 'bird', 'tanuki', 'Koma', 'Mugi', 'Sora', 'Ponta'];
  const mentions = (obj) => { const s = JSON.stringify(obj); return petWords.filter((w) => new RegExp('"(?:who|target|targets|t|actor|kind)":"?[^"]*\\b' + w + '\\b').test(s)); };
  for (const cs of CASES) {
    const label = cs.enemy + (cs.group ? ' + ' + cs.group.join(' + ') : '') + ' / ' + (cs.comp || 'solo');
    const runs = {};
    for (const k in SETUPS) runs[k] = play(cs.enemy, cs.comp, SETUPS[k], cs);
    const base = runs.none;
    t.ok(base.rules.length > 300 && base.sched.length > 300, label + ': the encounter ran (' + base.logObj.length + ' exchanges)');
    const diffs = Object.keys(runs).filter((k) => runs[k].rules !== base.rules);
    t.eq(diffs, [], label + ': identical tasks, option order, rules results, enemy choices and end state for every pet setup');
    const sd = Object.keys(runs).filter((k) => runs[k].sched !== base.sched);
    t.eq(sd, [], label + ': identical presentation schedule for the actual actors (every cue) for every pet setup');
    const ed = Object.keys(runs).filter((k) => runs[k].events !== base.events);
    t.eq(ed, [], label + ': the presentation events (actors and targets) are the same with or without a pet');
    // the variation is real: the shown pets reacted, the hidden ones were never on
    const shown = ['cat', 'dog', 'bird', 'tanuki'].filter((k) => runs[k].pet.on && runs[k].pet.stats.reactions > 0 && runs[k].pet.stats.impacts > 0);
    t.eq(shown, ['cat', 'dog', 'bird', 'tanuki'], label + ': each shown species reacted to the actions and the creatures\' moves');
    t.eq([runs.none.pet.on, runs.hiddenBySetting.pet.on, runs.hiddenByScene.pet.on], [false, false, false], label + ': no pet, or a hidden one, never takes part');
    // never a target or a result
    for (const k of ['cat', 'tanuki']) {
      const R = runs[k];
      t.eq(mentions(R.logObj), [], label + ' (' + k + '): no rules result or intent names the pet');
      const keys = []; (function walk(o, p) { if (o && typeof o === 'object') for (const kk in o) { if (/pet|tanuki|koma/i.test(kk)) keys.push(p + kk); walk(o[kk], p + kk + '.'); } })(R.st, '');
      t.eq(keys, [], label + ' (' + k + '): the battle state holds nothing about the pet');
      t.ok(R.logObj.every((e) => (e.intents || []).every((s) => !s || /:(pc|comp|both|party|allies|foes|null|undefined|self|all|\d)$/.test(s))), label + ' (' + k + '): every creature intent targets an adventurer, the party or itself: ' + JSON.stringify(R.logObj.map((e) => e.intents)));
      const tr = R.pet.trace || [];
      t.ok(tr.every((x) => !('target' in x) && !('hp' in x)), label + ' (' + k + '): the observer\'s own record carries no target or health');
    }
  }

  // the rules' code does not read the pet system (a static check of the rules files)
  for (const f of ['src/engine/95_combat.js', 'src/engine/96_combat_sim.js']) {
    const src = fs.readFileSync(path.join(root, f), 'utf8');
    t.ok(!/RB\.pets\b|battlePets|petArt|petWorld/.test(src), f + ' never reads the pet system');
  }
  // the companion's options and the response cards never include the pet
  {
    const g = fresh('mio'); PETS.meet(g, 'cat'); PETS.select(g, 'cat'); RB.game.s = g;
    const st = L.init(Object.assign({ id: 'rw.dustmoth' }, C.enemies['rw.dustmoth']), g, {});
    st.harmony = st.harmonyMax;
    const cards = L.responses(st, words.map((w) => C.words[w]));
    const opts = L.compOptions(st, g, cards[0]);
    t.eq(mentions({ cards: cards.map((c) => ({ kind: c.kind, id: c.id, target: c.target })), opts: opts.map((o) => ({ id: o.def.id, target: o.def.aim })) }), [], 'no response card or companion option targets the pet');
  }

  // ---- the observer's own timing ------------------------------------------------------------------------
  const ob = (comp) => { const g = fresh(comp); PETS.meet(g, 'dog'); PETS.select(g, 'dog'); RB.game.s = g; setSettings({ petBattle: true }); BP._begin({ comp }); return BP._B; };
  let B = ob('mio');
  RB.bus.emit('present:action', { scope: 'battle', actor: 'pc', family: 'protect', exchange: 1, t0: 1000, beat: 400, end: 900 });
  const r1 = B.q[B.q.length - 1];
  t.ok(r1 && r1.at === 1220 && r1.at + r1.dur <= 1000 + 900 + 1 && r1.rate <= 1.6, 'a reaction fits inside its action (starts at 1220, ends by 1900; rate ' + (r1 && r1.rate.toFixed(2)) + ')');
  RB.bus.emit('present:action', { scope: 'battle', actor: 'pc', family: 'wind', exchange: 2, t0: 3000, beat: 0, end: 40 });
  t.ok(B.q.every((r) => r.at < 3000) && B.trace[B.trace.length - 1].skipped === 'instant', 'an instant-length action gets no reaction (the recap carries the result)');
  RB.bus.emit('present:enemy', { scope: 'battle', actor: 'foe:0', kind: 'strike', targets: ['pc'], outcome: 'hit', exchange: 2, t0: 5000, at: 700, end: 1500 });
  const kinds = B.q.filter((r) => r.at >= 5000).map((r) => r.impact);
  t.eq(kinds, ['prep', 'hit', 'settle'], 'a creature\'s move: a brace while it prepares, a safe flinch at contact, a settle after');
  const qs = B.q.filter((r) => r.at >= 5000);
  t.ok(qs.slice(0, 2).every((r) => r.at + r.dur <= 5000 + 1500 + 1) && qs[2].at + qs[2].dur <= 5000 + 1500 + BP.SETTLE_GRACE + 1, 'the brace and the flinch inside the creature\'s own performance; the settle alongside its recovery (at most ' + BP.SETTLE_GRACE + ' ms past it)');
  RB.bus.emit('present:scene', { scope: 'battle', phase: 'calm' });
  t.eq(B.q.length, 0, 'the next decision drops anything still pending or playing (it eases out; nothing replays)');
  // reduced motion: a held key pose (the same at every moment) for the brace and the settle too
  for (const sp of PETS.ORDER) for (const k of ['prep', 'settle', 'hit']) {
    const a = BP.sampleAny(sp, 'impact', k, 50, { reduce: true }), b = BP.sampleAny(sp, 'impact', k, 400, { reduce: true });
    if (JSON.stringify(a.po) !== JSON.stringify(b.po)) t.ok(false, sp + ':' + k + ' reduced motion is not one held pose');
  }
  t.ok(PETS.ORDER.every((sp) => BP.PREP[sp] && BP.SETTLE[sp] && BP.IMPACT[sp].prep && BP.IMPACT[sp].settle), 'every species has a brace and a settle');
  BP._end();

  // placement: computed from the live anchors; never on a foot anchor; moves aside when crowded
  const lay = (o) => Object.assign({ ps: 1, pw: 80, ph: 104, F: { w: 80, h: 104 }, AN: { x: 36, y: 100 }, Sr: { x: 0, y: 0, w: 600, h: 330 }, foes: [] }, o);
  const footIn = (P, a, w, h) => a.x >= P.x - w / 2 && a.x <= P.x + w / 2 && a.y >= P.y - h && a.y <= P.y;
  const wide = lay({ pc: { x: 150, y: 315 }, comp: { x: 68, y: 306 } });
  const p1 = BP.place(wide, 46, 46);
  t.ok(p1.mode === 'between' && !footIn(p1, wide.pc, 46, 46) && !footIn(p1, wide.comp, 46, 46), 'between the two of you, clear of both foot anchors: ' + JSON.stringify(p1));
  const moved = lay({ pc: { x: 250, y: 300 }, comp: { x: 168, y: 291 } });
  const p2 = BP.place(moved, 46, 46);
  t.ok(p2.x - p1.x === 100 && p2.y - p1.y === -15, 'follows the anchors when the stage changes (moved by the same offset)');
  const tight = lay({ pc: { x: 112, y: 315 }, comp: { x: 68, y: 306 } });
  const p3 = BP.place(tight, 46, 46);
  t.ok(p3.mode !== 'between' && !footIn(p3, tight.pc, 46, 46) && !footIn(p3, tight.comp, 46, 46), 'crowded: it moves aside or rests, never onto a foot anchor: ' + JSON.stringify(p3));
  const solo = lay({ pc: { x: 150, y: 315 }, comp: null });
  const p4 = BP.place(solo, 46, 46);
  t.ok(!footIn(p4, solo.pc, 46, 46) && p4.x < solo.pc.x, 'travelling alone: at your left, clear of your feet');
  const badge = lay({ pc: { x: 150, y: 315 }, comp: { x: 68, y: 306 }, badges: [{ x0: 95, y0: 270, x1: 130, y1: 320 }] });
  const p5 = BP.place(badge, 46, 46);
  t.ok(!(p5.x + 23 > 95 && p5.x - 23 < 130 && p5.y > 270 && p5.y - 46 < 320) || p5.mode === 'rest', 'never over an intent badge the layout reports: ' + JSON.stringify(p5));
};
