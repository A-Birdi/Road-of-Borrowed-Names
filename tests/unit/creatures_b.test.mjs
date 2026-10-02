// Creatures B (battle addendum §9, §10, §21.4–21.5, §23.5): the Chapter 4–6 and Atlas families.
// - every family is a rig with idle poses, the sequencer's reaction poses and its moves' poses;
// - authored frames draw inside their canvas (sampled: first, middle and last of every act);
// - every move each enemy uses (pattern, phases, intents) has the family's own delivery, whose
//   cues are visual only, name real poses and real effects, aim only at real targets, and put
//   contact inside the move; the sequencer places each rules result exactly once, at contact;
// - a Strike met by a ward stops at the seal (sealBlock at contact) and balks;
// - reduced motion: one held key pose, no travel, the same results at the same contact;
// - cues are deterministic (no Math.random) and every enemy has an audit disposition;
// - the estimated resident pixels stay inside the 48 MiB budget.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const CB = RB.creaturesB, EA = RB.enemyArt, K = RB.pxkit, Q = RB.battleSeq;
  t.ok(CB && Q, 'the kit and the sequencer are loaded');
  t.eq(CB.PENDING.length, 0, 'every delivery was registered with the sequencer');
  const FAM = CB.FAMILIES;
  t.eq(FAM.slice().sort(), ['atlas_cartographer', 'bell', 'fox', 'hush', 'lantern', 'lf_conduit', 'lf_keeper', 'sa_hush', 'sb_frostlamp', 'sb_snowfox', 'spirit'], 'the eleven families of this area');

  // ---- rigs and poses -----------------------------------------------------------------------------
  const REACT = ['recoil', 'release', 'balk', 'settle', 'rest', 'prep'];
  for (const id of FAM) {
    const spec = EA.P[id], R = CB.RIGS[id];
    t.ok(spec && R && spec.rig === R && typeof spec.pose === 'function', id + ': defined as a rig with authored poses');
    if (!spec || !R) continue;
    const nIdle = spec.seq ? spec.seq.length : spec.frames;
    t.ok(nIdle >= 6 && nIdle <= 12, id + ': 6–12 idle poses (' + nIdle + ')');
    t.ok(spec.ms >= 83 && spec.ms <= 170, id + ': idle cadence 6–12 pose changes a second (' + spec.ms + ' ms)');
    for (const a of REACT) t.ok(R.poses[a] >= 1, id + ': authored reaction pose ' + a);
    // frames inside the canvas: sampled first / middle / last of every act, and every idle frame
    const L0 = () => K.layer(spec.w, spec.h, spec.ox, spec.oy);
    const edge = (o) => {
      for (let x = 0; x < o.w; x++) if ((o.px[x] >>> 24) || (o.px[(o.h - 1) * o.w + x] >>> 24)) return true;
      for (let y = 0; y < o.h; y++) if ((o.px[y * o.w] >>> 24) || (o.px[y * o.w + o.w - 1] >>> 24)) return true;
      return false;
    };
    const filled = (o) => { let n = 0; for (let i = 0; i < o.px.length; i += 7) if (o.px[i] >>> 24) n++; return n; };
    const bad = [];
    for (let f = 0; f < spec.frames; f++) { const o = spec.build(L0(), f, {}, EA.H) || null; if (!o || edge(o) || filled(o) < 40) bad.push('idle#' + f); }
    for (const a of Object.keys(R.poses)) {
      const n = R.poses[a];
      for (const i of [...new Set([0, n >> 1, n - 1])]) { const o = spec.pose(L0(), a, i, n, {}, EA.H, -1); if (!o || edge(o) || filled(o) < 40) bad.push(a + '#' + i); }
    }
    t.ok(!bad.length, id + ': its frames draw inside the canvas and are not empty' + (bad.length ? ' — ' + bad.join(', ') : ''));
  }

  // ---- reduced motion: the sequencer's reactions hold one drawing ----------------------------------
  {
    const G = RB.game, saved = G.reducedMotion;
    const same = (a, b) => a.px.length === b.px.length && a.px.every((v, i) => v === b.px[i]);
    for (const id of ['bell', 'fox', 'sa_hush']) {
      const spec = EA.P[id], R = CB.RIGS[id];
      const fr = (act, i) => spec.pose(K.layer(spec.w, spec.h, spec.ox, spec.oy), act, i, R.poses[act], {}, EA.H, -1);
      G.reducedMotion = () => true;
      const held = ['recoil', 'release', 'balk', 'settle'].every((a) => same(fr(a, 0), fr(a, R.poses[a] - 1)));
      G.reducedMotion = () => false;
      const moving = ['recoil', 'balk'].every((a) => !same(fr(a, 0), fr(a, R.poses[a] - 1)));
      t.ok(held && moving, id + ': with reduced motion a reaction holds one drawing (and steps through its poses otherwise)');
    }
    G.reducedMotion = saved;
  }

  // ---- deliveries for every move each enemy uses --------------------------------------------------
  const view = (o) => Object.assign({ pc: 10, comp: 10, max: 10, ward: { pc: 0, comp: 0 }, foes: [{ knots: 2, maxKnots: 4 }], cur: 0, knots: 2, maxKnots: 4 }, o || {});
  const ctx = (art, o) => Object.assign({ comp: 'mio', reduce: false, view: view(), group: false, foe: 0, art, foeCol: '#8aa8e8' }, o || {});
  const SINGLE = { strike: 1, lie: 1, mirror: 1, chill: 1 };
  // the rules' results for a move landing on (one of) you, as RB.combatLogic.foeAct produces them
  const fxFor = (kind, aim) => {
    switch (kind) {
      case 'strike': case 'lie': case 'mirror': case 'chill': return [{ t: 'hit', who: aim, n: 2 }];
      case 'sweep': case 'flood': return [{ t: 'hit', who: 'pc', n: 1 }, { t: 'hit', who: 'comp', n: 1 }];
      case 'gust': return [{ t: 'stripWard' }, { t: 'hit', who: 'pc', n: 1 }];
      case 'heat': return [{ t: 'heat', n: 1, bonus: 1 }];
      case 'shroud': return [{ t: 'shroud' }];
      case 'charge': return [{ t: 'charge' }];
      case 'mend': return [{ t: 'mend' }];
      case 'silence': return [{ t: 'silence' }];
      case 'plea': return [{ t: 'plea' }];
      default: return [];
    }
  };
  const VALID_TO = { pc: 1, comp: 1, party: 1 };
  const rows = CB.auditRows();
  const enemies = Object.keys(RB.content.enemies).filter((id) => FAM.includes(RB.content.enemies[id].art));
  t.eq(rows.map((r) => r.id).sort(), enemies.slice().sort(), 'the audit has a row for every enemy of these families (' + enemies.length + ')');
  t.ok(enemies.length >= 14, 'all fourteen enemies of these families are present (' + enemies.join(', ') + ')');
  const origRandom = Math.random;
  let randomCalls = 0;
  Math.random = () => { randomCalls++; return origRandom(); };
  let checked = 0;
  for (const id of enemies) {
    const d = RB.content.enemies[id], art = d.art, R = CB.RIGS[art];
    for (const kind of CB.movesOf(d)) {
      if (kind === 'rest') continue; // the sequencer performs a rest with the family's authored rest / prep / balk
      const fam = SINGLE[kind] ? 'strike' : kind === 'sweep' || kind === 'flood' || kind === 'gust' ? 'sweep' : 'cast';
      const own = Q.deliveryOf(art, kind, null), any = Q.deliveryOf(art, '-', null);
      t.ok(own && own !== any, id + ' ' + kind + ': the family has its own delivery for it');
      for (const aim of SINGLE[kind] ? ['pc', 'comp'] : ['pc']) {
        const fx = fxFor(kind, aim);
        const it = { kind, target: aim };
        const c0 = ctx(art, { aim: SINGLE[kind] ? aim : null });
        const E1 = Q.choreo.enemy(it, fx, c0), E2 = Q.choreo.enemy(it, fx, ctx(art, { aim: SINGLE[kind] ? aim : null }));
        t.eq(JSON.stringify(E1.cues.map((c) => [c.at, c.type, c.act || c.name || (c.f && c.f.t)])), JSON.stringify(E2.cues.map((c) => [c.at, c.type, c.act || c.name || (c.f && c.f.t)])), id + ' ' + kind + ': deterministic');
        const beats = E1.cues.filter((c) => c.type === 'beat' && c.f.t !== 'spent');
        t.eq(beats.map((c) => c.f.t + (c.f.who ? ':' + c.f.who : '')), fx.map((f) => f.t + (f.who ? ':' + f.who : '')), id + ' ' + kind + ' (' + aim + '): every result exactly once, in order');
        const foes = E1.cues.filter((c) => c.type === 'foe'), fxc = E1.cues.filter((c) => c.type === 'fx');
        const contact = beats.length ? beats[0].at : -1;
        t.ok(foes.length >= 2 && foes.every((c) => R.poses[c.act] >= 1), id + ' ' + kind + ': its foe cues name its own authored acts: ' + foes.map((c) => c.act).join(','));
        t.ok(fxc.length >= 1 && fxc.every((c) => typeof RB.battleFx.fx[c.name] === 'function'), id + ' ' + kind + ': its effects exist: ' + fxc.map((c) => c.name).join(','));
        const firstAct = Math.min(...foes.map((c) => c.at)), lastEnd = Math.max(...foes.map((c) => c.at + c.d));
        t.ok(contact > firstAct && contact < lastEnd && contact <= E1.end, id + ' ' + kind + ': contact (' + contact + ') falls inside the move (' + firstAct + '–' + lastEnd + ', end ' + E1.end + ')');
        // effects and travel aim only at the move's actual recipients
        const tos = [].concat(...fxc.map((c) => [].concat(c.p.to || [], c.p.who || []))).concat(foes.filter((c) => c.travel).map((c) => c.travel.to));
        const allowed = SINGLE[kind] ? [aim] : ['pc', 'comp', 'party'];
        t.ok(tos.every((w) => VALID_TO[w] && allowed.includes(w)), id + ' ' + kind + ': aims only at its recipients: ' + tos.join(','));
        t.ok(fxc.filter((c) => /^cb[A-Z]/.test(c.name)).length >= 1 && fxc.filter((c) => /^cb[A-Z]/.test(c.name)).every((c) => c.p.foe === 0), id + ' ' + kind + ': its own effects are drawn from the creature that acts');
        // reduced motion: one held pose, no travel, the same results at the same moments
        const Rd = Q.choreo.enemy(it, fx, ctx(art, { aim: SINGLE[kind] ? aim : null, reduce: true }));
        const rf = Rd.cues.filter((c) => c.type === 'foe');
        t.ok(rf.length === 1 && rf[0].act === 'key:' + kind && !rf[0].travel && R.poses[rf[0].act] === 1, id + ' ' + kind + ': reduced motion holds one key pose (' + rf.map((c) => c.act).join(',') + ')');
        t.eq(Rd.cues.filter((c) => c.type === 'beat').map((c) => c.at + ':' + c.f.t), E1.cues.filter((c) => c.type === 'beat').map((c) => c.at + ':' + c.f.t), id + ' ' + kind + ': reduced motion keeps the results and their timing');
        checked++;
      }
      // a ward raised in front of the target stops a Strike at the seal (the only single-target
      // move a ward answers: RB.combatLogic.INTENTS[kind].counters includes 'ward')
      if (SINGLE[kind] && RB.combatLogic.INTENTS[kind].counters.includes('ward')) {
        const W = Q.choreo.enemy({ kind, target: 'pc' }, [{ t: 'countered', kind, foe: 0 }], ctx(art, { wardBlock: true, aim: 'pc' }));
        const sb = W.cues.find((c) => c.type === 'fx' && c.name === 'sealBlock'), bt = W.cues.filter((c) => c.type === 'beat');
        t.ok(sb && bt.length === 1 && bt[0].f.t === 'countered' && sb.at === bt[0].at, id + ' ' + kind + ': a ward stops it at the seal (sealBlock at contact, the countered result once)');
        t.ok(W.cues.some((c) => c.type === 'foe' && c.act === 'balk'), id + ' ' + kind + ': and it balks');
        t.ok(!W.cues.some((c) => c.type === 'fx' && /impact/.test(c.name)), id + ' ' + kind + ': no impact on a blocked move');
      }
    }
    // a Re-tying with nothing to re-tie shows no knot being tied
    if (CB.movesOf(d).includes('mend')) {
      const M = Q.choreo.enemy({ kind: 'mend' }, [], ctx(art, { view: view({ foes: [{ knots: 4, maxKnots: 4 }], knots: 4 }) }));
      const mf = M.cues.find((c) => c.type === 'fx' && c.name === 'cbMend');
      t.ok(!mf || mf.p.i == null, id + ' mend with every knot tied: no knot is shown being re-tied');
    }
  }
  Math.random = origRandom;
  t.eq(randomCalls, 0, 'no Math.random in any delivery (' + checked + ' moves checked)');

  // ---- audit dispositions ---------------------------------------------------------------------------
  for (const r of rows) {
    t.ok(CB.ALLOWED.includes(r.disposition), r.id + ': has an audit disposition (' + r.disposition + ')');
    t.ok(r.moves.every((m) => m.kind === 'rest' || m.delivery === 'own'), r.id + ': every move it uses is the family\'s own delivery');
    t.ok(r.reactions.length === 6, r.id + ': all reaction poses authored');
  }

  // ---- resources (§21.5) ------------------------------------------------------------------------------
  let all = 0, maxFrame = 0;
  for (const id of FAM) { const b = CB.budget(id); all += b.bytesAll; maxFrame = Math.max(maxFrame, b.w * b.h * 4); }
  const MiB = 1024 * 1024;
  t.ok(140 * maxFrame < 48 * MiB, 'the shared frame cache (140 canvases) at the largest frame stays under 48 MiB (' + (140 * maxFrame / MiB).toFixed(1) + ' MiB)');
  t.log('estimated pixels if every frame of every family were resident at once: ' + (all / MiB).toFixed(1) + ' MiB (the cache holds at most 140)');
};
