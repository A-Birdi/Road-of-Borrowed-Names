// Harmony techniques: the cut-in cue and the four stage performances (Harmony addendum §7, §9), in node from
// the real choreography (RB.partyChoreo.player) and pose library (RB.battlerMoves) — no browser:
// - the portrait's timing (Robin's decision, 2026-10-05): Normal 220 / 820 / 360 ms (1,400 wall); Fast 180 / 380 / 220
//   ms of wall time (780) = 257 / 543 / 315 presentation ms on its ×1.43 clock; the contract's wall SEGMENTS agree;
// - one `cutin` cue per technique at its own start (groups included), none without a companion, none for any
//   other response, none with the setting Off or at Instant; its d is the real length; while it can play, every other
//   cue of the technique starts WAIT = max(0, portrait end + 120 − contact) later, so the first result comes ≥ 120 ms
//   after the portrait is gone — at Normal, Fast and with a slip cost first; with the setting Off or at Instant, no wait;
// - totals (derived from the numbers: TECH end + WAIT): Normal 2.57–2.69 s for one creature (bounds 2.5–2.75 s; a group
//   or a slip first ≤ 3.3 s), Fast 1.63–1.71 s of wall time (bounds 1.4–1.8 s, as before);
// - the rules' results unchanged: each result one beat, in the rules' order; nothing added;
// - each performer: anticipation → signature → held signature → recovery, back to the ready stance; reduced
//   motion: three held poses each (fixed progress), no travel; the companion's cue before your release;
// - truthfulness: Mio's restoring only on one of you below full, her washing only on creatures that had
//   Heat, mist or Gathering (each rinse naming what was there); Mio's pour over you both; Nao's route ticking
//   each knot that really comes loose, the two going together in one shared burst only when two do, never on
//   another creature; Suzu's curtain round each creature whose move it turns; Ren's plane before each of you;
// - distinct body mechanics (§9.7): Nao takes their pencil from behind their ear, turns side-on, steps and sketches
//   the route (two ticks), Mio raises the (larger) vial high over her head and tips it, Ren raises
//   the lamp high and draws a level line, Suzu turns a full circle through side, front and back views (the
//   rig's own, not a mirrored costume) and plants; the player's four terminal gestures differ;
// - the portrait's seven states (cue_b new, optional) at both modes, a six-state set holding cue through cue_b's span;
//   its motion at Normal (overshoot +3 art px at the in's end, back by 140 ms, a −2.5 lean 50 ms after the peak lands,
//   a −1.5 drift at the end), none at Fast; the motion's reach widens what placement keeps clear.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const PC = RB.partyChoreo, MV = RB.battlerMoves, B = RB.battlers, C = RB.content, T = RB.battleSeq.T;
  const COMPS = ['nao', 'mio', 'ren', 'suzu'];
  const H = HOf(RB);
  const view = (o) => Object.assign({ pc: 12, comp: 12, max: 12, ward: { pc: 0, comp: 0 }, foes: [{ knots: 3, maxKnots: 3 }], harmony: 3, harmonyMax: 3 }, o || {});
  const ctxOf = (comp, o) => Object.assign({ comp, reduce: false, view: view({ compId: comp }), group: false, foe: 0, reach: { foes: [0], allies: ['pc', 'comp'] } }, o || {});
  const card = (who) => ({ id: 'tech', kind: 'tech', jp: 'あわせ', en: 'Technique', tech: who });
  const fxOf = (who, o) => [{ t: 'unravel', n: { nao: 2, mio: 1, ren: 1, suzu: 2 }[who], foe: 0 }, Object.assign({ t: 'tech', who, en: '', foe: 0 }, o || {})];
  const cut = T.cutin, sum = (d) => d.in + d.hold + d.out;
  const beats = (r) => r.cues.filter((c) => c.type === 'beat');
  const fxn = (r) => r.cues.filter((c) => c.type === 'fx').map((c) => c.name);
  const HCON = RB.harmonyContract;
  // the playback the choreography sees: RB.game.settings is a getter of the game's G (restored at the end)
  const G = RB.game.G, settings0 = G.settings;
  const use = (o) => { G.settings = Object.assign(RB.game.defaultSettings(), { reducedMotion: false }, o || {}); };
  const wallOf = (d) => ({ in: Math.round(d.in / T.speed.fast), hold: Math.round(d.hold / T.speed.fast), out: Math.round(d.out / T.speed.fast) });
  t.eq([cut.normal, sum(cut.normal)], [{ in: 220, hold: 820, out: 360 }, 1400], 'the portrait at Normal: 220 / 820 / 360 ms, 1,400 ms (presentation = wall; Robin\'s decision, 2026-10-05)');
  t.eq([cut.fast, wallOf(cut.fast), Math.round(sum(cut.fast) / T.speed.fast)], [{ in: 257, hold: 543, out: 315 }, { in: 180, hold: 380, out: 220 }, 780], 'the portrait at Fast: 257 / 543 / 315 presentation ms = 180 / 380 / 220 ms of wall time (780) — what Normal played before');
  t.eq([HCON.SEGMENTS.normal, HCON.SEGMENTS.fast], [cut.normal, wallOf(cut.fast)], 'the contract\'s segments (wall ms) agree with the sequencer\'s');
  t.ok(['in', 'hold', 'out'].every((k) => cut.fast[k] === Math.round(HCON.SEGMENTS.fast[k] * T.speed.fast)) && T.cutinGap === 120, 'Fast\'s presentation values are its wall values × 1.43, rounded; the gap before the first result is 120 ms');
  // the wait the stage takes for the portrait, from the numbers: max(0, the portrait's end + 120 − the first contact)
  const WAIT = (mode, F) => Math.max(0, sum(cut[mode]) + T.cutinGap - F.contact);
  // every cue of `on` but the portrait's equals `off`'s, from `from` on `D` ms later (the same order, every field)
  const shifted = (on, off, D, from) => {
    const a = on.cues.filter((c) => c.type !== 'cutin'), b = off.cues;
    // (the word's markup carries a running render counter, data-src, which differs between any two calls)
    const bare = (c) => JSON.stringify(Object.assign({}, c, { at: 0 })).replace(/data-src=\\"\d+\\"/g, '');
    return a.length === b.length && a.every((c, i) => c.at === b[i].at + (b[i].at >= from ? D : 0) && bare(c) === bare(b[i]));
  };

  use({ battleAnim: 'normal' });
  const table = [];
  for (const who of COMPS) {
    const F = PC.TECH[who], D = WAIT('normal', F);
    const r = PC.player(card(who), fxOf(who), ctxOf(who), H);
    const cuts = r.cues.filter((c) => c.type === 'cutin');
    const first = Math.min(...beats(r).map((c) => c.at));
    t.ok(cuts.length === 1 && cuts[0].at === 0 && cuts[0].comp === who && cuts[0].d === sum(cut.normal), who + ': one cut-in cue, at the technique\'s own start, for the committed companion; d = its real length (' + (cuts[0] && cuts[0].d) + ' ms, not a fixed 780)');
    t.ok(cuts[0].wait === D && cuts[0].first === first && first === F.contact + D && first - (cuts[0].at + cuts[0].d) >= T.cutinGap, who + ': the stage waits ' + D + ' ms for the portrait: the first result at ' + first + ', ≥ 120 ms after it is gone (' + sum(cut.normal) + ')');
    use({ battleAnim: 'normal', harmonyFlourish: false });
    const off = PC.player(card(who), fxOf(who), ctxOf(who), H);
    use({ battleAnim: 'normal' });
    t.ok(shifted(r, off, D, 0) && r.end === off.end + D, who + ': every other cue — the poses, the sounds, the word, the carriers, the results — and the end come exactly ' + D + ' ms later than with the portrait Off');
    t.ok(r.end === F.end + D && r.end >= 2500 && r.end <= 2750, who + ': Normal total ' + r.end + ' ms (TECH end ' + F.end + ' + the wait ' + D + '; bounds 2.5–2.75 s)');
    // Fast: the portrait's own numbers, the same rule
    use({ battleAnim: 'fast' });
    const rf = PC.player(card(who), fxOf(who), ctxOf(who), H), Df = WAIT('fast', F);
    use({ battleAnim: 'normal' });
    const cf = rf.cues.find((c) => c.type === 'cutin'), ff = Math.min(...beats(rf).map((c) => c.at));
    t.ok(cf && cf.at === 0 && cf.d === sum(cut.fast) && cf.wait === Df && ff === F.contact + Df && ff - cf.d >= T.cutinGap && Df <= 40, who + ': Fast — the portrait ' + sum(cut.fast) + ' presentation ms, the stage waits ' + Df + ' (≤ 40), the first result at ' + ff + ', ≥ 120 after the portrait');
    const fast = rf.end / T.speed.fast;
    t.ok(rf.end === F.end + Df && fast >= 1400 && fast <= 1800, who + ': Fast total ' + Math.round(fast) + ' ms of wall time (1.4–1.8 s)');
    t.eq(beats(r).map((c) => c.f.t), ['unravel', 'tech'], who + ': the rules\' results, each one beat, in their order (nothing added)');
    // the performers: anticipation → signature → held → recovery; the companion's cue comes before your release
    const poses = (w) => r.cues.filter((c) => c.type === 'pose' && c.who === w).sort((a, b) => a.at - b.at);
    const pc = poses('pc'), cp = poses('comp');
    t.eq(cp.map((c) => c.pose + (c.k != null ? '@' + c.k : '')), ['anticipate', 'act', 'act@1', 'recover'], who + ': the companion anticipates, performs, holds the signature and recovers');
    t.eq(pc.map((c) => c.pose + (c.k != null ? '@' + c.k : '')), ['anticipate', 'anticipate@1', 'act', 'act@1', 'recover'], who + ': you gather (a breath, the writing hand), wait for the cue, release, hold and recover');
    const gap = (a) => a.every((c, i) => !i || c.at <= a[i - 1].at + a[i - 1].d);
    t.ok(gap(pc) && gap(cp), who + ': no frame between pose segments falls back to the idle');
    // through the wait both stand in their ready stance: no pose before it (the stage's own idle; no new pose)
    t.ok(pc[0].at === D && cp[0].at === F.pAt + D && !r.cues.some((c) => c.type === 'pose' && c.at < D), who + ': through the wait (0–' + D + ') both stand in their ready stance; your rally from ' + D + ', the companion\'s anticipation from ' + cp[0].at);
    const relC = F.pAt + F.pAnt + F.pAct * MV.release(who, F.p), relP = F.gAt + F.gAct * MV.release('pc', F.g);
    t.ok(relC < relP && relP < F.contact, who + ': the companion\'s cue (' + Math.round(relC) + ') → your release (' + Math.round(relP) + ') → the first result (' + F.contact + '), from the stage\'s own start');
    t.ok(cp[0].at < sum(cut.normal) && cp[1].at < sum(cut.normal) && cp[1].at + cp[1].d > sum(cut.normal), who + ': the companion\'s preparation and signature begin while the portrait plays (' + cp[0].at + ', ' + cp[1].at + ') and the signature carries past its end (' + (cp[1].at + cp[1].d) + ')');
    table.push({ who, wait: D, waitFast: Df, end: r.end, fast: Math.round(fast), first, firstFast: ff, cue: Math.round(relC + D), release: Math.round(relP + D) });
    // with a slip of the brush first: the portrait starts with the technique, after the slip; the same rule
    const slip = [{ t: 'cost', en: 'slip' }].concat(fxOf(who));
    const rs = PC.player(card(who), slip, ctxOf(who), H);
    const cs = rs.cues.find((c) => c.type === 'cutin'), fs = Math.min(...beats(rs).filter((c) => c.f.t !== 'cost').map((c) => c.at));
    t.ok(cs && cs.at === 320 && cs.wait === D && fs === 320 + F.contact + D && fs - (cs.at + cs.d) >= T.cutinGap && rs.end === r.end + 320 && rs.end <= 3300, who + ': after a slip (its own 320 ms beat first) the portrait starts at 320, the stage waits ' + D + ', the first result at ' + fs + ' (≥ 120 after the portrait); total ' + rs.end + ' (≤ 3.3 s)');
    use({ battleAnim: 'normal', harmonyFlourish: false });
    const rsOff = PC.player(card(who), slip, ctxOf(who), H);
    use({ battleAnim: 'fast' });
    const rsf = PC.player(card(who), slip, ctxOf(who), H);
    use({ battleAnim: 'normal' });
    const csf = rsf.cues.find((c) => c.type === 'cutin'), fsf = Math.min(...beats(rsf).filter((c) => c.f.t !== 'cost').map((c) => c.at));
    t.ok(shifted(rs, rsOff, D, 320) && csf && csf.at === 320 && fsf - (csf.at + csf.d) >= T.cutinGap, who + ': with a slip, the slip itself is not moved and the technique after it waits as without one (Fast: the first result at ' + fsf + ')');
    // reduced motion: three held poses each, no travel; the portrait plays (still), so the stage waits the same
    const rd = PC.player(card(who), fxOf(who), ctxOf(who, { reduce: true }), H);
    const held = (w) => rd.cues.filter((c) => c.type === 'pose' && c.who === w);
    t.ok(['pc', 'comp'].every((w) => held(w).length === 3 && held(w).every((c) => c.k != null) && new Set(held(w).map((c) => c.pose + c.k)).size === 3), who + ': reduced motion — three distinct held poses each (' + held('comp').map((c) => c.pose + '@' + c.k).join(', ') + ')');
    t.ok(rd.cues.filter((c) => c.type === 'cutin').length === 1 && beats(rd).map((c) => c.f.t).join() === 'unravel,tech' && Math.min(...rd.cues.filter((c) => c.type === 'pose').map((c) => c.at)) === D, who + ': reduced motion keeps the one portrait cue, every result and the same wait');
  }
  t.log('timing (Normal presentation = wall ms; Fast wall ms): ' + JSON.stringify(table));
  // the setting Off, or Instant: no portrait cue and no wait — the stage as it plays alone
  for (const o of [{ harmonyFlourish: false, label: 'the setting Off' }, { battleAnim: 'instant', label: 'Instant playback' }, { battleAnim: 'fast', harmonyFlourish: false, label: 'Fast with the setting Off' }]) {
    use(o);
    const bad = [];
    for (const who of COMPS) {
      const F = PC.TECH[who];
      for (const fx of [fxOf(who), [{ t: 'cost', en: 'slip' }].concat(fxOf(who))]) {
        const r = PC.player(card(who), fx, ctxOf(who), H), t0 = fx[0].t === 'cost' ? 320 : 0;
        const first = Math.min(...beats(r).filter((c) => c.f.t !== 'cost').map((c) => c.at));
        if (r.cues.some((c) => c.type === 'cutin') || first !== t0 + F.contact || r.end !== t0 + F.end || Math.min(...r.cues.filter((c) => c.type === 'pose' && c.who === 'comp').map((c) => c.at)) !== t0 + F.pAt) bad.push(who + (t0 ? ' (slip)' : '') + ': ' + JSON.stringify({ cutin: r.cues.some((c) => c.type === 'cutin'), first, end: r.end }));
      }
    }
    t.eq(bad, [], o.label + ': no portrait cue and no wait (the first result at TECH contact, the end at TECH end, with and without a slip)');
  }
  use({ battleAnim: 'normal' });
  // no companion → no portrait; no other response has one
  {
    const r = PC.player(card('suzu'), fxOf('suzu'), ctxOf(null), H);
    t.ok(!r.cues.some((c) => c.type === 'cutin'), 'no committed companion: no portrait cue');
    const u = PC.player({ id: 'unravel', kind: 'unravel', jp: 'ほどく', en: 'Unravel' }, [{ t: 'unravel', n: 1, foe: 0 }], ctxOf('mio'), H);
    const s = PC.companion(Object.assign({ kind: 'heal' }, C.companionActions.mio[0]), [{ t: 'cact', who: 'mio', id: C.companionActions.mio[0].id, en: 'x' }], ctxOf('mio'), H);
    t.ok(!u.cues.some((c) => c.type === 'cutin') && !s.cues.some((c) => c.type === 'cutin'), 'an ordinary response and a companion\'s support action have no portrait cue');
  }
  // groups: one portrait for the whole technique; Suzu's curtain round each creature whose move turns
  {
    const reach = { foes: [0, 1, 2], allies: ['pc', 'comp'] };
    const v3 = view({ compId: 'suzu', foes: [{ knots: 3, maxKnots: 3 }, { knots: 2, maxKnots: 2 }, { knots: 2, maxKnots: 2 }] });
    const fx = [{ t: 'unravel', n: 2, foe: 0 }, { t: 'tech', who: 'suzu', en: '', foe: 0, all: true }, { t: 'unravel', n: 1, foe: 1, by: 'suzu' }, { t: 'unravel', n: 1, foe: 2, by: 'suzu' }];
    const r = PC.player(card('suzu'), fx, ctxOf('suzu', { group: true, reach, view: v3 }), H);
    const curt = r.cues.filter((c) => c.name === 'pCurtain').map((c) => c.p.foe).sort().join();
    t.ok(r.cues.filter((c) => c.type === 'cutin').length === 1 && curt === '0,1,2' && r.end <= 3300 && beats(r).map((c) => c.f.t).join() === 'unravel,tech,unravel,unravel', 'Suzu with three creatures: one portrait, the curtain round each of the three whose move turns, every result once, total ' + r.end + ' ms (≤ 3.3 s, the wait for the portrait included)');
    const nao = PC.player(card('nao'), [{ t: 'unravel', n: 2, foe: 1 }, { t: 'tech', who: 'nao', en: '', foe: 1 }], ctxOf('nao', { group: true, reach: { foes: [1], allies: [] }, foe: 1, view: view({ compId: 'nao', foes: [{ knots: 3, maxKnots: 3 }, { knots: 3, maxKnots: 3 }, { knots: 3, maxKnots: 3 }] }) }), H);
    const on = new Set(nao.cues.filter((c) => c.type === 'fx' && c.p && c.p.foe != null).map((c) => c.p.foe));
    t.ok(on.size === 1 && on.has(1) && nao.cues.filter((c) => c.type === 'cutin').length === 1, 'Nao in a group: every effect on the one creature targeted (no splash on the others)');
  }
  // Nao: the courier's route lands a waypoint tick on each knot that really comes loose; the two go together in one
  // shared burst only when two really do; your thread follows the route to the same knots
  {
    const two = PC.player(card('nao'), fxOf('nao'), ctxOf('nao'), H);
    const one = PC.player(card('nao'), fxOf('nao'), ctxOf('nao', { view: view({ compId: 'nao', foes: [{ knots: 1, maxKnots: 3 }] }) }), H);
    const cr2 = two.cues.find((c) => c.name === 'pCourier'), cr1 = one.cues.find((c) => c.name === 'pCourier'), kp = two.cues.find((c) => c.name === 'pKnotPair');
    const kr2 = two.cues.filter((c) => c.name === 'knotRelease'), kr1 = one.cues.filter((c) => c.name === 'knotRelease');
    const th2 = two.cues.find((c) => c.name === 'pThreadRoute'), th1 = one.cues.find((c) => c.name === 'pThreadRoute');
    const F = PC.TECH.nao, ticksBy = (cr) => cr.at + cr.d * cr.p.draw * (cr.p.way.length / (cr.p.way.length + 1));
    t.ok(cr2 && cr2.p.way.join() === 'knot:1,knot:2' && kp && kp.p.a === 'knot:1' && kp.p.b === 'knot:2' && kr2.length === 2 && kr2[0].at === kr2[1].at && Math.abs(kp.at - kr2[0].at) <= 60 && th2 && th2.p.way.join() === cr2.p.way.join() && th2.at + th2.d * th2.p.arrive <= kr2[0].at && th2.at + th2.d * th2.p.arrive > kr2[0].at - 80, 'Nao, two knots come loose: the route ticks both (' + cr2.p.way.join() + '), your thread follows it to them just before they go (' + Math.round(th2.at + th2.d * th2.p.arrive) + '), and they go together (' + kr2.map((c) => c.at).join(' = ') + ') in one shared burst');
    t.ok(cr1 && cr1.p.way.join() === 'knot:0' && th1 && th1.p.way.join() === 'knot:0' && !fxn(one).includes('pKnotPair') && kr1.length === 1, 'Nao, only one knot left: the route lands on that one, one contact, no shared burst');
    // (times as played: the stage starts after its wait for the portrait, so the contact is the first beat's own time)
    const c2 = Math.min(...beats(two).map((c) => c.at)), c1 = Math.min(...beats(one).map((c) => c.at)), w2 = c2 - F.contact;
    t.ok(ticksBy(cr2) < c2 && ticksBy(cr1) < c1 && cr2.at > w2 + F.pAt + F.pAnt && !fxn(two).includes('pSpot'), 'Nao: the route is sketched during their signature and its ticks land before the knots go (' + Math.round(ticksBy(cr2)) + ' < ' + c2 + '); it is their own route, not the plain Unravel\'s spot');
  }
  // Mio: three beats, truthful
  {
    const full = PC.player(card('mio'), fxOf('mio'), ctxOf('mio', { view: view({ compId: 'mio', foes: [{ knots: 3, maxKnots: 3 }] }) }), H);
    t.ok(!full.cues.some((c) => c.name === 'motes' || c.name === 'pRefill' || c.pose === 'soothed') && !fxn(full).some((n) => n === 'pSteam' || n === 'pShroudClear' || n === 'scatter' || n === 'pWash'), 'Mio, both full and nothing on the creature: no restoring shown, nothing washed off (the knot alone)');
    const cas = full.cues.find((c) => c.name === 'pCascade'), drop = full.cues.find((c) => c.name === 'pDrop');
    t.ok(cas && cas.p.who.join() === 'pc,comp' && drop && drop.p.to === 'knot:2' && drop.p.from === 'pc' && Math.abs(drop.at + drop.d * drop.p.land - Math.min(...beats(full).map((c) => c.at))) < 2 && !fxn(full).includes('pPour'), 'Mio: the pour goes over you both (the act, also at full), and your ink carries one drop to the knot, landing at the contact');
    const low = PC.player(card('mio'), fxOf('mio', { all: true }), ctxOf('mio', { group: true, reach: { foes: [0, 1], allies: ['pc', 'comp'] }, view: view({ compId: 'mio', pc: 7, foes: [{ knots: 3, maxKnots: 3, heat: 1 }, { knots: 2, maxKnots: 2, shroud: true, charged: true }] }) }), H);
    const motes = low.cues.find((c) => c.name === 'motes'), sooth = low.cues.filter((c) => c.pose === 'soothed').map((c) => c.who);
    const steam = low.cues.filter((c) => c.name === 'pSteam').map((c) => c.p.foe), mist = low.cues.filter((c) => c.name === 'pShroudClear').map((c) => c.p.foe), sc = low.cues.filter((c) => c.name === 'scatter').map((c) => c.p.foe);
    const kn = low.cues.find((c) => c.name === 'knotRelease').at, rs = motes.at, ds = Math.min(...low.cues.filter((c) => c.name === 'pSteam' || c.name === 'pShroudClear').map((c) => c.at));
    const refill = low.cues.filter((c) => c.name === 'pRefill').map((c) => c.p.who.join()), wash = low.cues.filter((c) => c.name === 'pWash').map((c) => c.p.foe + ':' + ['heat', 'mist', 'gather'].filter((q) => c.p[q]).join('+'));
    t.ok(motes.p.who.join() === 'pc' && refill.join() === 'pc' && sooth.join() === 'pc' && steam.join() === '0' && mist.join() === '1' && sc.join() === '1' && wash.join() === '0:heat,1:mist+gather', 'Mio: the restoring reaches only you (below full); the rinse on each creature names what it really had (' + wash.join(', ') + '): Heat steams off the first, mist and Gathering leave the second — only what was there');
    t.ok(kn < rs && rs < ds, 'Mio: the knot (' + kn + '), the restoring (' + rs + ') and the washing (' + ds + ') are three separate beats');
    t.ok(low.cues.find((c) => c.type === 'beat' && c.f.t === 'tech').then === H.healThen, 'Mio: the numbers come from the applied change (never a fabricated amount)');
  }
  // Ren: the plane before each of you, the knot on the creature
  {
    const r = PC.player(card('ren'), fxOf('ren'), ctxOf('ren'), H);
    const pl = r.cues.find((c) => c.name === 'pPlane'), seals = r.cues.filter((c) => c.name === 'sealForm').map((c) => c.p.to).sort().join();
    t.ok(pl && pl.p.who.join() === 'pc,comp' && seals === 'comp,pc' && r.cues.find((c) => c.name === 'knotRelease').p.foe === 0, 'Ren: the level plane and a ward before each of you; the knot shown on the creature');
  }

  // ---- the performances' body mechanics (§9.7) ------------------------------------------------------------
  const look = (who) => C.chars[who].look;
  const P = (who, stage, k) => MV.poseAt(look(who), stage, PC.TECH[who].p, k, 0, 'comp', false, who);
  const R0 = (who) => MV.poseAt(look(who), 'ready', null, 0, 0, 'comp', true, who);
  const range = (who, f, n) => { const v = []; for (let i = 0; i <= (n || 32); i++) v.push(f(P(who, 'act', i / (n || 32)))); return [Math.min(...v), Math.max(...v)]; };
  {
    const R = R0('nao'), st = P('nao', 'act', 0.3), a = P('nao', 'anticipate', 1), ear = P('nao', 'anticipate', 0.5), end = P('nao', 'act', 1);
    t.ok(ear.handR[1] > 55 && ear.prop.pencil > 0.5 && !(R.prop.pencil > 0.5) && a.prop.pencil > 0.5, 'Nao: their pencil taken from behind their ear (the hand up at ' + ear.handR[1] + ')');
    t.ok(a.pelvis[1] < R.pelvis[1] - 2 && st.footR[2] > R.footR[2] + 3 && st.turn >= 45 && end.turn >= 45 && end.prop.pencil > 0.5 && end.handR[1] > R.handR[1] + 20 && end.handR[2] > R.handR[2] + 12, 'Nao: the weight dropped (' + a.pelvis[1].toFixed(1) + ' vs ' + R.pelvis[1] + '), turned side-on (' + end.turn + '°) with a step in, the pencil out high at the route\'s end');
    const ys = []; for (let i = 0; i <= 48; i++) ys.push(P('nao', 'act', i / 48).handR[1]);
    let dips = 0; for (let i = 1; i < ys.length - 1; i++) if (ys[i] < ys[i - 1] && ys[i] <= ys[i + 1] && ys[i] < Math.max(...ys.slice(0, i)) - 2) dips++;
    t.ok(dips >= 2, 'Nao: the pencil ticks twice as it sketches the route (' + dips + ' dips)');
    const nod = P('nao', 'recover', 0.5), back = P('nao', 'recover', 0.4);
    t.ok(nod.headYaw > R.headYaw + 20 && back.prop.pencil > 0.5 && back.handR[1] > 55 && !(nod.prop.pencil > 0.5) && P('nao', 'recover', 0.76).headPitch > R.headPitch + 12, 'Nao: their recovery puts the pencil back behind their ear with a glance to you, then a short nod');
  }
  {
    const tilt = range('mio', (p) => p.prop.vialTilt || 0), A = P('mio', 'anticipate', 1);
    t.ok(A.prop.vial > 0.5 && A.handR[1] > 48 && tilt[1] >= 99 && (P('mio', 'act', 0.02).prop.cork || 0) < 0.5 && P('mio', 'act', 0.4).prop.cork > 0.5, 'Mio: the vial raised to eye level, uncorked, then tipped right over (to ' + tilt[1] + '°)');
    const R = R0('mio'), hi = range('mio', (p) => p.handR[1]), big = range('mio', (p) => p.prop.vialBig || 0), pour = P('mio', 'act', 1);
    t.ok(hi[1] > 62 && pour.turn >= 30 && pour.handShapeL === 'spread' && big[0] >= 1 && A.prop.vialBig >= 1 && !(R.prop.vialBig > 0), 'Mio: the vial (drawn larger in the technique) lifted high over her head (' + hi[1] + '), side-on (' + pour.turn + '°), her free hand spread over you both');
    t.ok(P('mio', 'recover', 0.3).prop.cork < 0.5 && P('mio', 'recover', 0.5).headPitch > R.headPitch + 10 && P('mio', 'recover', 0.5).handR[1] < 32, 'Mio: the cork back, the vial to her hip, a small satisfied nod');
  }
  {
    const lamp = range('ren', (p) => p.handL[1]), sweep = range('ren', (p) => p.handR[0]), A = P('ren', 'anticipate', 1);
    const lvl = range('ren', (p) => p.handR[1], 32);
    t.ok(lamp[1] > 52 && sweep[1] - sweep[0] > 14 && lvl[1] - lvl[0] < 2 && A.leftFree === 1 && MV.actHand('ren', 'ward_plane') === 'L', 'Ren: the lamp raised high (' + lamp[1] + '), the right hand drawn level (±' + ((lvl[1] - lvl[0]) / 2).toFixed(1) + ') across ' + (sweep[1] - sweep[0]).toFixed(1) + ' units — the plane');
  }
  {
    const turns = [];
    for (let i = 0; i <= 64; i++) turns.push(P('suzu', 'act', i / 64).turn || 0);
    const quad = [[30, 120], [120, 210], [210, 300], [300, 359]].map(([a, b]) => turns.some((x) => x >= a && x < b));
    t.ok(quad.every(Boolean) && P('suzu', 'act', 1).turn === 0 && P('suzu', 'recover', 0).turn === 0, 'Suzu: one full turn — side, front, the other side, back — ending at 0 (the recovery never spins back)');
    const fl = range('suzu', (p) => p.clothFlare || 0, 64);
    t.ok(fl[1] > 0.6, 'Suzu: the dress flares out with the turn and settles (' + fl[1] + ')');
    // dedicated turning silhouettes: drawn from the turned rig (side, front, back), never the stance mirrored
    const look2 = look('suzu');
    const qk = MV.qkOf('suzu', 'curtain');
    const sil = new Set();
    let mirrored = 0;
    const st = B._.measure(look2, { pose: 'ready', who: 'comp', id: 'suzu', reduce: true });
    const mir = (d, w, h) => { const o = new Uint8Array(w * h); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) o[y * w + x] = d[(y * w + (w - 1 - x)) * 4 + 3] > 0 ? 1 : 0; return o; };
    const stm = mir(st.data, 80, 104);
    for (let i = 0; i <= Math.round(qk * 0.48); i++) {
      const m = B._.measure(look2, { pose: 'act', gesture: 'curtain', k: i / qk, who: 'comp', id: 'suzu' });
      let h = 0, same = 0;
      for (let j = 3; j < m.data.length; j += 4) { h = (h * 31 + (m.data[j] > 0 ? 1 : 0)) >>> 0; if ((m.data[j] > 0 ? 1 : 0) === stm[(j - 3) / 4]) same++; }
      sil.add(h);
      if (same === 80 * 104) mirrored++;
    }
    t.ok(sil.size >= 12 && mirrored === 0, 'Suzu\'s twirl: ' + sil.size + ' distinct turning silhouettes over ' + qk + ' steps a stage, none a mirror of her stance');
    const A = P('suzu', 'anticipate', 1), cue = P('suzu', 'act', 0.7), bow = P('suzu', 'recover', 0.5), R = R0('suzu');
    t.ok(A.footL[2] < R.footL[2] - 2 && cue.handShapeR === 'spread' && cue.handR[1] > 45 && bow.headPitch > R.headPitch + 12, 'Suzu: a step back onto the left foot, the planted open-armed cue, a half-bow before the stance');
  }
  // the four differ by body mechanics alone: signature silhouettes pairwise far apart; your terminals differ
  {
    const sig = COMPS.map((w) => B._.measure(look(w), { pose: 'act', gesture: PC.TECH[w].p, k: 0.7, who: 'comp', id: w }));
    const diff = (a, b) => { let n = 0; for (let j = 3; j < a.data.length; j += 4) if ((a.data[j] > 0) !== (b.data[j] > 0)) n++; return n; };
    const pairs = [];
    for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) pairs.push(diff(sig[i], sig[j]));
    t.ok(Math.min(...pairs) > 150, 'the four signature silhouettes differ pairwise by ' + Math.min(...pairs) + '+ px (body shape alone, no effects)');
    const PCLOOK = { skin: 1, hair: 'ponytail', hairColor: 3, outfit: 2, shape: 'coat', acc: ['flower', 'glasses'] };
    const mine = COMPS.map((w) => B._.measure(PCLOOK, { pose: 'act', gesture: PC.TECH[w].g, k: MV.release('pc', PC.TECH[w].g), who: 'pc', id: 'pc' }));
    const pp = [];
    for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) pp.push(diff(mine[i], mine[j]));
    t.ok(new Set(COMPS.map((w) => PC.TECH[w].g)).size === 4 && Math.min(...pp) > 30, 'your part differs with each technique (' + COMPS.map((w) => PC.TECH[w].g).join(', ') + '; ≥ ' + Math.min(...pp) + ' px apart at the release)');
  }
  // the portrait's own performance, where the art provides a timeline (a stub over the contract's own, per mode): the
  // state shown at each moment of Normal and Fast — seven states, cue_b new (Robin's decision, 2026-10-05) — a missing
  // optional state holding the one before (a six-state set: cue through cue_b's span), reduced motion two held poses;
  // without a timeline the two drawings ('enter' arriving, then 'hold')
  {
    // (RB.harmonyArt's timeline is a getter of the painted path: the stub is an object over it, swapped in and back)
    const HC = RB.harmonyCutin._, REAL = RB.harmonyArt;
    let stub = null;
    const ART = { set timeline(fn) { stub = stub || Object.create(REAL); Object.defineProperty(stub, 'timeline', { value: fn, configurable: true, writable: true }); RB.harmonyArt = stub; } };
    const seq = (mode, reduce) => {
      const d = cut[mode], c = { comp: 'suzu', d, reduce, mode }, out = [];
      for (let el = 0; el < sum(d); el += 1) { const ph = HC.phaseAt(c, el); if (!out.length || out[out.length - 1][0] !== ph) out.push([ph, el]); }
      return out;
    };
    const had = REAL.timeline;
    t.eq(seq('normal', false), [['enter', 0], ['hold', 280]], 'no timeline (today\'s code busts): the arrival drawing, then the hold resolved 60 ms into the hold (280 ms at Normal) — the rule unchanged');
    t.eq(seq('fast', false), [['enter', 0], ['hold', 317]], 'no timeline, Fast: the hold resolved at 317 presentation ms (257 + 60)');
    t.eq(seq('normal', true), [['hold', 0]], 'no timeline, reduced motion: the code busts keep their single held drawing — unchanged');
    t.eq(HC.mixAt({ comp: 'suzu', d: cut.normal, reduce: true, mode: 'normal' }, 630), null, 'and no cross-fade');
    const BASE = (mode, have) => HCON.timeline(have || null, null, mode);
    const SIX = ['prep_a', 'prep_b', 'cue', 'peak', 'settle_a', 'settle_b'];
    try {
      ART.timeline = (comp, mode) => BASE(mode);
      t.eq(seq('normal', false), [['prep_a', 0], ['prep_b', 132], ['cue', 220], ['cue_b', 311], ['peak', 376], ['settle_a', 762], ['settle_b', 852]], 'Normal (the proposed performance): prep_a 0, prep_b 132, cue 220, cue_b 311, peak 376, settle_a 762, settle_b 852 ms through the fade (in 0–0.6–1 of 220; hold 0, 0.11, 0.19, 0.66, 0.77 of 820)');
      t.eq(seq('fast', false), [['prep_a', 0], ['prep_b', 129], ['cue', 257], ['cue_b', 315], ['peak', 372], ['settle_a', 572], ['settle_b', 686]], 'Fast (Normal\'s old fractions, cue_b the second half of cue\'s span): prep_a 0, prep_b 129, cue 257, cue_b 315, peak 372, settle_a 572, settle_b 686 presentation ms (of 257 / 543 / 315)');
      // reduced motion with painted art (contract v3): two held poses, peak then settle_b, one restrained cross-fade
      // at the middle of the hold, inside the overlay's own reduced timing on the mode's segments (no travel, no motion)
      t.eq(seq('normal', true), [['peak', 0], ['settle_b', 630]], 'reduced motion: peak held, then settle_b held from the middle of the hold (630 ms at Normal)');
      t.eq(seq('fast', true), [['peak', 0], ['settle_b', 529]], 'reduced motion, Fast: the same two held poses on its own clock (529 presentation ms)');
      const mix = (mode) => { const d = cut[mode], c = { comp: 'suzu', d, reduce: true, mode, tl: HC.timelineOf('suzu', mode) }; let a = null, b = null, ks = []; for (let el = 0; el < sum(d); el += 1) { const m = HC.mixAt(c, el); if (m) { if (a == null) a = el; b = el; ks.push(m.k); } } return { from: a, to: b, len: b - a + 1, rising: ks.every((k, i) => !i || k > ks[i - 1]), ends: [m0(ks[0]), m0(ks[ks.length - 1])] }; };
      const m0 = (k) => Math.round(k * 100) / 100;
      const mn = mix('normal'), mf = mix('fast');
      t.ok(mn.from === 581 && mn.to === 679 && mn.len <= 120 && mn.rising && mf.from === 479 && mf.to === 578 && mf.len <= 120 && mf.rising, 'one cross-fade, ≤ 120 ms: Normal ' + mn.from + '–' + mn.to + ' ms (' + mn.len + '), Fast ' + mf.from + '–' + mf.to + ' (' + mf.len + ' presentation ms), the blend rising ' + JSON.stringify(mn.ends));
      t.ok(mn.from > cut.normal.in && mn.to < cut.normal.in + cut.normal.hold && mf.from > cut.fast.in && mf.to < cut.fast.in + cut.fast.hold, 'the cross-fade sits inside the hold (after the fade in, before the fade out) at both modes');
      t.eq(HC.phaseList('suzu', true), ['peak', 'settle_b'], 'reduced motion\'s footprint and preparation: the two held poses');
      t.eq(HC.phaseList('suzu', false), ['prep_a', 'prep_b', 'cue', 'cue_b', 'peak', 'settle_a', 'settle_b'], 'every state of the timeline is footprint and is prepared ahead (seven, the same at both modes)');
      // a six-state set (no cue_b, today's sets): cue is held through cue_b's span, at both modes
      ART.timeline = (comp, mode) => BASE(mode, SIX);
      t.eq([BASE('normal', SIX).find((e) => e.phase === 'cue'), BASE('fast', SIX).find((e) => e.phase === 'cue')], [{ phase: 'cue', seg: 'hold', from: 0, to: 0.19 }, { phase: 'cue', seg: 'hold', from: 0, to: 0.21 }], 'without cue_b, cue spans cue_b\'s time (Normal 0–0.19, Fast 0–0.21 of the hold)');
      t.eq(seq('normal', false), [['prep_a', 0], ['prep_b', 132], ['cue', 220], ['peak', 376], ['settle_a', 762], ['settle_b', 852]], 'a six-state set at Normal: cue from 220 to the peak at 376');
      t.eq(seq('fast', false), [['prep_a', 0], ['prep_b', 129], ['cue', 257], ['peak', 372], ['settle_a', 572], ['settle_b', 686]], 'a six-state set at Fast: exactly the old six-state performance on Fast\'s numbers');
      t.eq(HC.phaseList('suzu', false), SIX, 'a six-state set prepares its six states');
      ART.timeline = (comp, mode) => BASE(mode, ['prep_a', 'cue', 'peak', 'settle_b']);
      t.eq(seq('normal', false), [['prep_a', 0], ['cue', 220], ['peak', 376], ['settle_b', 852]], 'only the required states: the one before is held (prep_a through the arrival, cue to the peak, peak until settle_b)');
      t.eq(seq('normal', true), [['peak', 0], ['settle_b', 630]], 'reduced motion is the same two held poses without the optional states');
      for (const mode of HCON.MODES) for (const have of [null, SIX, ['prep_a', 'cue', 'peak', 'settle_b'], ['prep_a', 'cue', 'cue_b', 'peak', 'settle_b']]) t.eq(HCON.validTimeline(BASE(mode, have)), [], 'valid: ' + mode + ' ' + (have ? have.join(',') : 'all seven'));
      ART.timeline = () => [];
      t.eq(seq('normal', false), [['enter', 0], ['hold', 280]], 'an empty timeline: the two drawings, as without one');
    } finally { RB.harmonyArt = REAL; }
    t.ok(RB.harmonyArt === REAL && REAL.timeline === had, 'the real art API is back, untouched');
  }
  // the portrait's motion (Robin's decision, 2026-10-05): Normal only, in art px (× the scale, to whole CSS px)
  {
    const X = RB.harmonyCutin, _ = X._, M = X.MOTION.normal, d = cut.normal;
    const sm = (k) => { k = Math.max(0, Math.min(1, k)); return k * k * (3 - 2 * k); };
    const drift = (h) => -1.5 * sm(h / (d.hold + d.out));
    const near = (a, b) => Math.abs(a - b) < 1e-9;
    const pk = _.peakH({ peakAt: _.peakLine(null, 'normal'), d });
    const x = (h) => _.motionAt(M, d, pk, h), W = 300;
    t.ok(near(pk, 155.8) && near(_.peakH({ peakAt: _.peakLine(null, 'fast'), d: cut.fast }), 0.21 * 543), 'the lean lands with the peak: 155.8 ms into the hold at Normal (0.19 of 820); Fast\'s peak at 0.21 of its hold');
    t.ok(near(_.slideAt(M, W, 0), -W) && near(_.slideAt(M, W, 1), 3) && near(x(0), 3), 'the in: from beyond the left edge (−W) to +3 art px at its end — the overshoot — and the hold starts there');
    let mono = true;
    for (let i = 1; i <= 100; i++) if (_.slideAt(M, W, i / 100) < _.slideAt(M, W, (i - 1) / 100) - 1e-9) mono = false;
    t.ok(mono, 'the in runs one way, eased out (no wobble on the way in)');
    t.ok(near(x(140), drift(140)) && Math.abs(x(140)) < 0.1, 'back to 0 by 140 ms into the hold (' + x(140).toFixed(3) + ' art px: only the drift, just begun)');
    t.ok(near(x(pk + 50) - drift(pk + 50), -2.5), 'the lean: −2.5 art px 50 ms after the peak lands (' + x(pk + 50).toFixed(3) + ' with the drift)');
    t.ok(near(x(pk + 310), drift(pk + 310)), 'the lean has eased back 310 ms after the peak lands (50 in, 260 out)');
    t.ok(near(x(d.hold + d.out), -1.5) && near(x(d.hold), drift(d.hold)), 'the drift: −1.5 art px at the end of the fade, the fade continuing it (' + x(d.hold).toFixed(3) + ' as the fade begins)');
    const xs = [];
    for (let h = 0; h <= d.hold + d.out; h++) xs.push(x(h));
    t.ok(near(Math.max(...xs), 3) && Math.min(...xs) < -2.5 && Math.min(...xs) >= -X.ENVELOPE.normal.l && Math.max(...xs) <= X.ENVELOPE.normal.r, 'the hold and fade stay inside the placement envelope (' + Math.min(...xs).toFixed(2) + ' to ' + Math.max(...xs).toFixed(2) + ' art px; envelope −' + X.ENVELOPE.normal.l + ' / +' + X.ENVELOPE.normal.r + ')');
    t.eq([3, -2.5, -1.5].map((v) => [1, 2, 4 / 3].map((s) => Math.round(v * s))), [[3, 6, 4], [-2, -5, -3], [-1, -3, -2]], 'whole CSS px at scales 1, 2 and 4/3 (Math.round of art px × scale)');
    t.ok(X.MOTION.fast == null && _.motionAt(null, cut.fast, 0, 100) === 0 && near(_.slideAt(null, W, 0), -W) && near(_.slideAt(null, W, 1), 0), 'Fast: the plain slide (−W to 0, no overshoot) and no motion in the hold or the fade');
    t.eq([_.envelopeOf({ mode: 'normal' }), _.envelopeOf({ mode: 'fast' }), _.envelopeOf({ mode: 'normal', still: true })], [{ r: 3, l: 4 }, { r: 0, l: 0 }, { r: 0, l: 0 }], 'placement keeps clear of the motion\'s reach at Normal (3 art px right, the overshoot; 4 left, the lean and drift), none at Fast or with reduced motion');
    const sp = [null, [2, 5], [0, 9]], R = [{ id: 'r', x: 34, y: 0, w: 10, h: 10 }];
    t.ok(_.hits(sp, 0, 0, 2, R) === null && _.hits(_.widen(sp, _.envelopeOf({ mode: 'normal' })), 0, 0, 2, R) === 'r' && _.hits(_.widen(sp, _.envelopeOf({ mode: 'fast' })), 0, 0, 2, R) === null, 'a rectangle 14 px clear of the drawn rows at scale 2 is clear without the reach, not with it (3 art px = 6 px): at Normal that placement gives way to the next candidate; at Fast it stands');
  }
  // the overlay's overlap test (pure): a row span inside an inflated rect is a hit, a transparent corner is not
  {
    const hits = RB.harmonyCutin._.hits;
    const sp = [null, [2, 5], [0, 9]];
    t.ok(hits(sp, 0, 0, 2, [{ id: 'a', x: 40, y: 0, w: 10, h: 10 }]) === null && hits(sp, 0, 0, 2, [{ id: 'b', x: 26, y: 0, w: 10, h: 10 }]) === 'b' && hits(sp, 0, 0, 2, [{ id: 'c', x: 16, y: 20, w: 4, h: 4 }]) === null, 'the overlay tests its drawn rows against each rectangle kept 12 px clear (empty rows and corners do not count)');
  }  G.settings = settings0;
};

// the sequencer helpers the party choreography uses (as src/ui/82_battle_seq.js passes them)
function HOf(RB) {
  const fid = (ctx, i) => (i == null ? (ctx.foe == null ? 0 : ctx.foe) : i);
  const healThen = () => {};
  return {
    T: RB.battleSeq.T, fid,
    foeId: (ctx, i) => (ctx.group ? 'foe:' + fid(ctx, i) : 'foe'),
    knotId: (ctx, i, j) => (ctx.group ? 'knot:' + fid(ctx, i) + ':' + j : 'knot:' + j),
    fview: (ctx, i) => (ctx.view.foes ? ctx.view.foes[fid(ctx, i)] : ctx.view) || ctx.view,
    healThen, stillNums: () => 0,
    OUTCOME: { unravel: 1, ward: 1, heal: 1, water: 1, light: 1, bind: 1, warm: 1, bell: 1, settle: 1, reveal: 1, tech: 1, comp: 1, cact: 1, soften: 1, stun: 1, draw: 1 },
  };
}
