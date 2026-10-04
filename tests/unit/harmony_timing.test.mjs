// Harmony techniques: the cut-in cue and the four stage performances (Harmony addendum §7, §9), in node from
// the real choreography (RB.partyChoreo.player) and pose library (RB.battlerMoves) — no browser:
// - one `cutin` cue per technique at its own start (groups included), none without a companion, none for any
//   other response; the portrait (Normal 180/380/220, Fast 143/315/229 presentation ms = 100/220/160 wall) is
//   over before the first result at Normal, Fast and with a slip cost first;
// - totals: Normal 2.2–2.7 s (a group < 3.0 s), Fast 1.4–1.8 s of wall time;
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
//   rig's own, not a mirrored costume) and plants; the player's four terminal gestures differ.
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
  t.eq([sum(cut.normal), Math.round(cut.fast.in / T.speed.fast), Math.round(cut.fast.hold / T.speed.fast), Math.round(cut.fast.out / T.speed.fast)], [780, 100, 220, 160], 'the portrait: 780 ms at Normal; Fast 100 / 220 / 160 ms of wall time (480)');

  const table = [];
  for (const who of COMPS) {
    const r = PC.player(card(who), fxOf(who), ctxOf(who), H);
    const cuts = r.cues.filter((c) => c.type === 'cutin');
    const first = Math.min(...beats(r).map((c) => c.at));
    t.ok(cuts.length === 1 && cuts[0].at === 0 && cuts[0].comp === who, who + ': one cut-in cue, at the technique\'s own start, for the committed companion');
    t.ok(sum(cut.normal) < first && sum(cut.fast) < first, who + ': the portrait is gone (Normal ' + sum(cut.normal) + ', Fast ' + sum(cut.fast) + ' presentation ms) before the first result (' + first + ')');
    t.ok(r.end >= 2200 && r.end <= 2700, who + ': Normal total ' + r.end + ' ms (2.2–2.7 s, the portrait included)');
    const fast = r.end / T.speed.fast;
    t.ok(fast >= 1400 && fast <= 1800, who + ': Fast total ' + Math.round(fast) + ' ms of wall time (1.4–1.8 s)');
    t.eq(beats(r).map((c) => c.f.t), ['unravel', 'tech'], who + ': the rules\' results, each one beat, in their order (nothing added)');
    // the performers: anticipation → signature → held → recovery; the companion's cue comes before your release
    const poses = (w) => r.cues.filter((c) => c.type === 'pose' && c.who === w).sort((a, b) => a.at - b.at);
    const pc = poses('pc'), cp = poses('comp');
    t.eq(cp.map((c) => c.pose + (c.k != null ? '@' + c.k : '')), ['anticipate', 'act', 'act@1', 'recover'], who + ': the companion anticipates, performs, holds the signature and recovers');
    t.eq(pc.map((c) => c.pose + (c.k != null ? '@' + c.k : '')), ['anticipate', 'anticipate@1', 'act', 'act@1', 'recover'], who + ': you gather (a breath, the writing hand), wait for the cue, release, hold and recover');
    const gap = (a) => a.every((c, i) => !i || c.at <= a[i - 1].at + a[i - 1].d);
    t.ok(gap(pc) && gap(cp), who + ': no frame between pose segments falls back to the idle');
    const F = PC.TECH[who];
    const relC = F.pAt + F.pAnt + F.pAct * MV.release(who, F.p), relP = F.gAt + F.gAct * MV.release('pc', F.g);
    t.ok(relC < relP && relP < F.contact, who + ': the companion\'s cue (' + Math.round(relC) + ') → your release (' + Math.round(relP) + ') → the first result (' + F.contact + ')');
    t.ok(cp[0].at >= 300 && cp[0].at <= 600 && cp[1].at + cp[1].d > sum(cut.normal), who + ': the companion\'s preparation develops as the portrait fades (' + cp[0].at + '–' + (cp[1].at + cp[1].d) + ')');
    table.push({ who, end: r.end, fast: Math.round(fast), first, cue: Math.round(relC), release: Math.round(relP) });
    // with a slip of the brush first: the portrait starts with the technique, after the slip
    const rs = PC.player(card(who), [{ t: 'cost', en: 'slip' }].concat(fxOf(who)), ctxOf(who), H);
    const cs = rs.cues.find((c) => c.type === 'cutin');
    t.ok(cs && cs.at === 320 && cs.at + sum(cut.normal) < Math.min(...beats(rs).filter((c) => c.f.t !== 'cost').map((c) => c.at)) && rs.end === r.end + 320, who + ': after a slip (its own 320 ms beat first) the portrait starts at 320 and is still gone before the first result (total ' + rs.end + ')');
    // reduced motion: three held poses each, no travel
    const rd = PC.player(card(who), fxOf(who), ctxOf(who, { reduce: true }), H);
    const held = (w) => rd.cues.filter((c) => c.type === 'pose' && c.who === w);
    t.ok(['pc', 'comp'].every((w) => held(w).length === 3 && held(w).every((c) => c.k != null) && new Set(held(w).map((c) => c.pose + c.k)).size === 3), who + ': reduced motion — three distinct held poses each (' + held('comp').map((c) => c.pose + '@' + c.k).join(', ') + ')');
    t.ok(rd.cues.filter((c) => c.type === 'cutin').length === 1 && beats(rd).map((c) => c.f.t).join() === 'unravel,tech', who + ': reduced motion keeps the one portrait cue and every result');
  }
  t.log('timing (Normal ms; Fast wall ms): ' + JSON.stringify(table));
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
    t.ok(r.cues.filter((c) => c.type === 'cutin').length === 1 && curt === '0,1,2' && r.end < 3000 && beats(r).map((c) => c.f.t).join() === 'unravel,tech,unravel,unravel', 'Suzu with three creatures: one portrait, the curtain round each of the three whose move turns, every result once, total ' + r.end + ' ms (< 3.0 s)');
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
    t.ok(ticksBy(cr2) < F.contact && ticksBy(cr1) < F.contact && cr2.at > F.pAt + F.pAnt && !fxn(two).includes('pSpot'), 'Nao: the route is sketched during their signature and its ticks land before the knots go (' + Math.round(ticksBy(cr2)) + ' < ' + F.contact + '); it is their own route, not the plain Unravel\'s spot');
  }
  // Mio: three beats, truthful
  {
    const full = PC.player(card('mio'), fxOf('mio'), ctxOf('mio', { view: view({ compId: 'mio', foes: [{ knots: 3, maxKnots: 3 }] }) }), H);
    t.ok(!full.cues.some((c) => c.name === 'motes' || c.name === 'pRefill' || c.pose === 'soothed') && !fxn(full).some((n) => n === 'pSteam' || n === 'pShroudClear' || n === 'scatter' || n === 'pWash'), 'Mio, both full and nothing on the creature: no restoring shown, nothing washed off (the knot alone)');
    const cas = full.cues.find((c) => c.name === 'pCascade'), drop = full.cues.find((c) => c.name === 'pDrop');
    t.ok(cas && cas.p.who.join() === 'pc,comp' && drop && drop.p.to === 'knot:2' && drop.p.from === 'pc' && Math.abs(drop.at + drop.d * drop.p.land - PC.TECH.mio.contact) < 2 && !fxn(full).includes('pPour'), 'Mio: the pour goes over you both (the act, also at full), and your ink carries one drop to the knot, landing at the contact');
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
  // the portrait's own performance, where the art provides a timeline (a stub here: the proposed defaults):
  // the state shown at each moment of Normal and Fast, missing optional states holding the one before, reduced
  // motion the last state only; without a timeline the two drawings ('enter' arriving, then 'hold')
  {
    // (RB.harmonyArt's timeline is a getter of the painted path: the stub is an object over it, swapped in and back)
    const HC = RB.harmonyCutin._, REAL = RB.harmonyArt;
    let stub = null;
    const ART = { set timeline(fn) { stub = stub || Object.create(REAL); Object.defineProperty(stub, 'timeline', { value: fn, configurable: true, writable: true }); RB.harmonyArt = stub; } };
    const seq = (mode, reduce) => {
      const d = cut[mode], c = { comp: 'suzu', d, reduce }, out = [];
      for (let el = 0; el < sum(d); el += 1) { const ph = HC.phaseAt(c, el); if (!out.length || out[out.length - 1][0] !== ph) out.push([ph, el]); }
      return out;
    };
    const had = REAL.timeline;
    t.eq(seq('normal', false), [['enter', 0], ['hold', 240]], 'no timeline (today\'s art): the arrival drawing, then the hold resolved at 240 ms — unchanged');
    t.eq(seq('normal', true), [['hold', 0]], 'no timeline, reduced motion: the code busts keep their single held drawing — unchanged');
    t.eq(HC.mixAt({ comp: 'suzu', d: cut.normal, reduce: true }, 370), null, 'and no cross-fade');
    const FULL = [
      { phase: 'prep_a', seg: 'in', from: 0, to: 0.5 }, { phase: 'prep_b', seg: 'in', from: 0.5, to: 1 },
      { phase: 'cue', seg: 'hold', from: 0, to: 0.21 }, { phase: 'peak', seg: 'hold', from: 0.21, to: 0.58 }, { phase: 'settle_a', seg: 'hold', from: 0.58, to: 0.79 },
      { phase: 'settle_b', seg: 'hold', from: 0.79, to: 1 }, { phase: 'settle_b', seg: 'out', from: 0, to: 1 },
    ];
    try {
      ART.timeline = () => FULL;
      t.eq(seq('normal', false), [['prep_a', 0], ['prep_b', 90], ['cue', 180], ['peak', 260], ['settle_a', 401], ['settle_b', 481]], 'Normal: prep_a 0, prep_b 90, cue 180, peak 260, settle_a 401, settle_b 481 ms through the fade (the art\'s fractions of 180 / 380 / 220)');
      t.eq(seq('fast', false), [['prep_a', 0], ['prep_b', 72], ['cue', 143], ['peak', 210], ['settle_a', 326], ['settle_b', 392]], 'Fast: the same states on its own 143 / 315 / 229 presentation ms (100 / 220 / 160 wall)');
      // reduced motion with painted art (contract v3): two held poses, peak then settle_b, one restrained cross-fade
      // at the middle of the hold, inside the overlay's own reduced timing (no travel: phaseAt has no position)
      t.eq(seq('normal', true), [['peak', 0], ['settle_b', 370]], 'reduced motion: peak held, then settle_b held from the middle of the hold (370 ms at Normal)');
      t.eq(seq('fast', true), [['peak', 0], ['settle_b', 301]], 'reduced motion, Fast: the same two held poses on its own clock (301 presentation ms)');
      const mix = (mode) => { const d = cut[mode], c = { comp: 'suzu', d, reduce: true, tl: HC.timelineOf('suzu') }; let a = null, b = null, ks = []; for (let el = 0; el < sum(d); el += 1) { const m = HC.mixAt(c, el); if (m) { if (a == null) a = el; b = el; ks.push(m.k); } } return { from: a, to: b, len: b - a + 1, rising: ks.every((k, i) => !i || k > ks[i - 1]), ends: [m0(ks[0]), m0(ks[ks.length - 1])] }; };
      const m0 = (k) => Math.round(k * 100) / 100;
      const mn = mix('normal'), mf = mix('fast');
      t.ok(mn.from === 321 && mn.to === 419 && mn.len <= 120 && mn.rising && mf.len <= 120 && mf.rising, 'one cross-fade, ≤ 120 ms: Normal ' + mn.from + '–' + mn.to + ' ms (' + mn.len + '), Fast ' + mf.from + '–' + mf.to + ' (' + mf.len + ' presentation ms), the blend rising ' + JSON.stringify(mn.ends));
      t.ok(mn.from > cut.normal.in && mn.to < cut.normal.in + cut.normal.hold, 'the cross-fade sits inside the hold (after the fade in, before the fade out)');
      t.eq(HC.phaseList('suzu', true), ['peak', 'settle_b'], 'reduced motion\'s footprint and preparation: the two held poses');
      t.eq(HC.phaseList('suzu', false), ['prep_a', 'prep_b', 'cue', 'peak', 'settle_a', 'settle_b'], 'every state of the timeline is footprint and is prepared ahead');
      ART.timeline = () => FULL.filter((e) => e.phase !== 'prep_b' && e.phase !== 'settle_a');
      t.eq(seq('normal', false), [['prep_a', 0], ['cue', 180], ['peak', 260], ['settle_b', 481]], 'optional states left out: the one before is held (prep_a through the arrival, peak until settle_b)');
      t.eq(seq('normal', true), [['peak', 0], ['settle_b', 370]], 'reduced motion is the same two held poses without the optional states');
      ART.timeline = () => [];
      t.eq(seq('normal', false), [['enter', 0], ['hold', 240]], 'an empty timeline: the two drawings, as without one');
    } finally { RB.harmonyArt = REAL; }
    t.ok(RB.harmonyArt === REAL && REAL.timeline === had, 'the real art API is back, untouched');
  }
  // the overlay's overlap test (pure): a row span inside an inflated rect is a hit, a transparent corner is not
  {
    const hits = RB.harmonyCutin._.hits;
    const sp = [null, [2, 5], [0, 9]];
    t.ok(hits(sp, 0, 0, 2, [{ id: 'a', x: 40, y: 0, w: 10, h: 10 }]) === null && hits(sp, 0, 0, 2, [{ id: 'b', x: 26, y: 0, w: 10, h: 10 }]) === 'b' && hits(sp, 0, 0, 2, [{ id: 'c', x: 16, y: 20, w: 4, h: 4 }]) === null, 'the overlay tests its drawn rows against each rectangle kept 12 px clear (empty rows and corners do not count)');
  }
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
