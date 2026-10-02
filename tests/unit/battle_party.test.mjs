// Party art in battle (battle addendum §7, §8, §10, §18.3, §21.4): the player and the four companions.
// - pose and anchor coverage: every §7.5 state for every actor is drawn (not blank, feet on the anchor,
//   inside the frame) with feet / torso / head / acting hand / held object / release point anchors;
//   reactions and gestures return exactly to the stance; the actors' languages differ;
// - idle: 6–8 key poses per actor, a quieter calm, each actor on their own loop; bounded idle keys;
// - mapping: every response word, response kind, coordinated technique and companion support action
//   has a deliberate entry (a generic fallback fails here), with an existing gesture;
// - choreography: each family's own gesture, word motif and effects; one beat per result in the rules'
//   order; Protect at Normal follows the §18.3 prototype; Heal reaches only real recipients (zero gain
//   reaches no one); Light disperses a Shroud only when the rules cleared one; Unravel releases the
//   specific knot; techniques have two complementary performances; reduced motion keeps every result;
// - discipline: no Math.random in the party files; cache keys never carry elapsed time.
// The frames are rasterized in node (no canvas: RB.battlers._.measure).
import fs from 'node:fs';
import path from 'node:path';
import { load, root } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const B = RB.battlers, MV = RB.battlerMoves, PC = RB.partyChoreo, C = RB.content;
  const F = B.FRAME, A = B.ANCHOR;
  const PCLOOK = { skin: 1, hair: 'ponytail', hairColor: 3, outfit: 2, shape: 'coat', acc: ['flower', 'glasses'] };
  const cast = [['pc', PCLOOK, 'pc'], ['nao', C.chars.nao.look, 'comp'], ['mio', C.chars.mio.look, 'comp'], ['ren', C.chars.ren.look, 'comp'], ['suzu', C.chars.suzu.look, 'comp']];
  const finite = (q) => q && isFinite(q.x) && isFinite(q.y);

  // ---- pose and anchor coverage (§7.2, §7.5) ----------------------------------------------------------
  const STATES = ['quietReady', 'anticipate', 'express', 'release', 'protect', 'receiveHealing', 'directHit', 'softenedHit', 'blockedHit', 'condition', 'recover', 'incapacitated', 'revive', 'technique', 'settle', 'idle'];
  let frames = 0;
  const bad = [];
  for (const [id, look, who] of cast) {
    const cov = MV.coverage(id);
    t.eq(STATES.filter((s) => !cov[s]), [], id + ': every §7.5 state has an implementation');
    for (const st of STATES) {
      const [pose, g, k] = cov[st];
      const kk = k != null ? k : pose === 'hit' || pose === 'brace' ? 0.2 : pose === 'guard' || pose === 'soothed' || pose === 'afflict' ? 0.5 : 1;
      const m = B._.measure(look, { pose, gesture: g, k: kk, who, id, reduce: true });
      frames++;
      const tag = id + ' ' + st + ' (' + pose + (g ? ':' + g : '') + ')';
      if (m.n < 700) bad.push(tag + ': nearly blank (' + m.n + ' px)');
      if (m.box.y1 < A.y || m.box.y1 > A.y + 2) bad.push(tag + ': lowest row ' + m.box.y1);
      if (m.box.x0 <= 0 || m.box.x1 >= F.w - 1 || m.box.y0 <= 0) bad.push(tag + ': touches the frame edge');
      for (const a of ['feet', 'torso', 'head', 'hand', 'held', 'release', 'handR', 'handL']) if (!finite(m.pts[a])) bad.push(tag + ': no ' + a + ' anchor');
      if (!(m.pts.head.y < m.pts.torso.y && m.pts.torso.y < m.pts.feet.y)) bad.push(tag + ': head/torso/feet out of order');
      const r = m.pts.release;
      if (r.x + A.x < 0 || r.x + A.x > F.w || r.y + A.y < 0 || r.y + A.y > F.h) bad.push(tag + ': release point outside the frame');
    }
  }
  t.eq(bad, [], `${cast.length} actors × ${STATES.length} §7.5 states = ${frames} frames: drawn, planted on the anchor, inside the frame, with feet/torso/head/acting-hand/held/release anchors`);

  // every gesture of an actor's own vocabulary, and the reactions, start from and return to the stance
  // (a prop blended out to 0 is the same as no prop)
  const norm = (p) => { const o = Object.assign({}, p, { prop: {} }); for (const k in p.prop || {}) if (p.prop[k]) o.prop[k] = p.prop[k]; return JSON.stringify(o, (k, v) => (typeof v === 'number' ? Math.round(v * 1000) / 1000 || 0 : v)); };
  const near = (a, b) => norm(a) === norm(b);
  const drift = [];
  let gestures = 0;
  for (const [id, look, who] of cast) {
    const R = MV.poseAt(look, 'ready', null, 0, 0, who, true, id);
    for (const g of MV.OWN[id]) {
      gestures++;
      const a0 = MV.poseAt(look, 'anticipate', g, 0, 0, who, true, id), r1 = MV.poseAt(look, 'recover', g, 1, 0, who, true, id);
      if (!near(a0, R)) drift.push(id + ' ' + g + ': anticipation does not start at the stance');
      if (!near(r1, R)) drift.push(id + ' ' + g + ': recovery does not end at the stance');
      const ex = B._.measure(look, { pose: 'act', gesture: g, k: MV.release(id, g), who, id, reduce: true });
      const st = B._.measure(look, { pose: 'ready', who, id, reduce: true });
      let diff = 0;
      for (let i = 3; i < st.data.length; i += 4) if ((st.data[i] > 0) !== (ex.data[i] > 0)) diff++;
      if (diff < 40) drift.push(id + ' ' + g + ': the release pose barely changes the silhouette (' + diff + ' px)');
    }
    for (const [p, v] of [['hit', null], ['hit', 'soft'], ['brace', null], ['guard', null], ['guard', 'wary'], ['soothed', null], ['afflict', 'hush'], ['afflict', 'gust'], ['afflict', 'chill'], ['afflict', 'slip']]) {
      if (!near(MV.poseAt(look, p, v, 1, 0, who, true, id), R)) drift.push(id + ' ' + p + (v ? ':' + v : '') + ': does not end at the stance');
    }
  }
  t.eq(drift, [], `${gestures} own gestures (each changes the silhouette at its release) and 10 reactions per actor start and end exactly at that actor's stance`);

  // a softened hit is a smaller reaction than a full one; a wary brace smaller than a guard
  {
    const R = MV.poseAt(PCLOOK, 'ready', null, 0, 0, 'pc', true, 'pc');
    const full = MV.poseAt(PCLOOK, 'hit', null, 0.16, 0, 'pc', true, 'pc'), soft = MV.poseAt(PCLOOK, 'hit', 'soft', 0.16, 0, 'pc', true, 'pc');
    const dz = (p) => Math.abs(p.spinePitch - R.spinePitch) + Math.abs(p.pelvis[2] - R.pelvis[2]);
    t.ok(dz(soft) < dz(full) * 0.6, 'a softened hit recoils less than a direct one (' + dz(soft).toFixed(1) + ' vs ' + dz(full).toFixed(1) + ')');
  }
  // each person stands and moves in their own way (§7.4): stances differ, and a shared gesture name
  // (the technique's 'direct', 'restore', 'flow') is their own
  {
    const st = cast.map(([id, look, who]) => MV.poseAt(look, 'ready', null, 0, 0, who, true, id));
    const same = [];
    for (let i = 0; i < st.length; i++) for (let j = i + 1; j < st.length; j++) if (near(Object.assign({}, st[i], { prop: {} }), Object.assign({}, st[j], { prop: {} }))) same.push(cast[i][0] + '=' + cast[j][0]);
    t.eq(same, [], 'the five stances are all different');
    t.ok(MV.gestureOf('nao', 'direct') !== MV.gestureOf('pc', 'direct') && MV.gestureOf('mio', 'restore') !== MV.gestureOf('pc', 'restore') && MV.gestureOf('suzu', 'flow') !== MV.gestureOf('pc', 'flow') && MV.gestureOf('ren', 'ward') !== MV.gestureOf('pc', 'ward'), 'a companion does a shared gesture in their own way (Nao points, Mio pours, Suzu flourishes, Ren raises the lamp)');
    t.ok(MV.OWN.mio.filter((g) => g !== 'help').every((g) => { const p = MV.poseAt(C.chars.mio.look, 'act', g, 0.6, 0, 'comp', true, 'mio'); return p.prop.vial > 0.5; }), 'every one of Mio\'s gestures uses her vial (the bottles at her hip): no invented prop');
    t.ok(MV.OWN.ren.filter((g) => g !== 'help').every((g) => MV.actHand('ren', g) === 'L'), 'Ren\'s actions are done with his lamp hand');
  }

  // ---- idle (§7.3) --------------------------------------------------------------------------------------
  for (const id of ['pc', 'nao', 'mio', 'ren', 'suzu']) {
    const I = MV.IDLE[id];
    t.ok(I.ready.length >= 6 && I.ready.length <= 8 && I.calm.length >= 3 && I.calm.length < I.ready.length, id + ': ' + I.ready.length + ' idle key poses, ' + I.calm.length + ' quieter calm ones');
    const keys = new Set();
    for (let tt = 0; tt < 60000; tt += 7) keys.add(MV.idleKey(id, 'ready', tt, false));
    t.ok(keys.size <= I.ready.length * 4, id + ': the idle uses a bounded set of frames (' + keys.size + ' over a minute)');
    t.eq(MV.idleKey(id, 'ready', 12345, true), '0.0', id + ': reduced motion holds one still key');
  }
  t.ok(['nao', 'mio', 'ren', 'suzu'].every((id) => MV._.loopOf(id, 'ready') !== MV._.loopOf('pc', 'ready') && MV.IDLE[id].off !== MV.IDLE.pc.off), 'each companion\'s idle runs on its own loop and phase, apart from yours');
  t.ok(!/\|\d{4,}\|/.test(B._.resolve(PCLOOK, { pose: 'ready', t: 98765 }).key) && B._.resolve(PCLOOK, { pose: 'ready', t: 98765 }).key === B._.resolve(PCLOOK, { pose: 'ready', t: 98765 + MV._.loopOf('pc', 'ready') }).key, 'cache keys name the idle key frame, never elapsed time');

  // ---- mapping coverage (§8.3, §8.5) ---------------------------------------------------------------------
  const cov = PC.coverage();
  t.ok(cov.words.length >= 12 && cov.words.every((w) => w.mapped), 'every response word has its family: ' + cov.words.map((w) => w.id + '→' + w.family).join(', '));
  t.eq(cov.actions.length, 20, 'twenty companion support actions in the content');
  t.eq(cov.actions.filter((a) => !a.mapped || !a.gestureExists).map((a) => a.id), [], 'every support action has its own mapped performance with an existing gesture (no generic fallback)');
  t.ok(new Set(cov.actions.map((a) => a.gesture)).size >= 18, 'the support actions are performed with ' + new Set(cov.actions.map((a) => a.gesture)).size + ' different gestures');
  t.ok(cov.techs.every((x) => x.mapped && x.partner && x.lead), 'all four coordinated techniques mapped (lead and partner)');

  // ---- choreography ---------------------------------------------------------------------------------------
  const view = (o) => Object.assign({ pc: 12, comp: 12, max: 12, ward: { pc: 0, comp: 0 }, foes: [{ knots: 3, maxKnots: 3, shroud: true, heat: 1, charged: true }], harmony: 0, harmonyMax: 3, compId: 'mio' }, o || {});
  const ctxOf = (o) => Object.assign({ comp: 'mio', reduce: false, view: view(), group: false, foe: 0, reach: { foes: [0], allies: ['pc', 'comp'] } }, o || {});
  const word = (id, target) => ({ id: 'w:' + id, kind: 'word', word: C.words[id], target, jp: C.words[id].jp, en: C.words[id].en });
  const beats = (r) => r.cues.filter((c) => c.type === 'beat').map((c) => c.f.t);
  const fxn = (r) => r.cues.filter((c) => c.type === 'fx').map((c) => c.name);
  const motifs = {};
  for (const w of Object.keys(PC.WORD_FAMILY)) {
    if (!C.words[w]) continue;
    const r = PC.player(word(w, C.words[w].tags.includes('ward') ? 'pc' : undefined), [], ctxOf(), HOf(RB));
    const strip = r.cues.find((c) => c.type === 'strip');
    motifs[r.plan.family] = strip.tm.motif;
    t.ok(r.plan.mapped && strip.word.jp === (C.words[w].jpK || C.words[w].jp) && /<ruby|[぀-ヿ]/.test(strip.word.html), w + ': mapped (' + r.plan.family + ', gesture ' + r.plan.gesture + ', motif ' + strip.tm.motif + '); the strip carries its own Japanese with the reading');
  }
  const famMotifs = Object.entries(motifs);
  t.ok(new Set(famMotifs.map((x) => x[1])).size === famMotifs.length, 'every response family moves its word in its own way: ' + famMotifs.map((x) => x.join('→')).join(', '));

  const H = HOf(RB);
  // Protect at Normal: the §18.3 prototype
  {
    const r = PC.player(word('mamoru', 'pc'), [{ t: 'ward', target: 'pc', n: 2 }], ctxOf(), H);
    const st = r.cues.find((c) => c.type === 'strip'), ant = r.cues.find((c) => c.type === 'pose' && c.pose === 'anticipate'), rec = r.cues.find((c) => c.type === 'pose' && c.pose === 'recover');
    const beat = r.cues.find((c) => c.type === 'beat');
    const full = st.tm.fadeAt - st.tm.inkEnd;
    t.ok(ant.at === 0 && ant.d <= 200 && st.at >= 120 && st.at <= 200 && beat.at === 620 && full >= 650 && full <= 760 && rec.at >= 1050 && rec.at + rec.d <= 1500 && r.end === 1500,
      'Protect: braces at 0 (' + ant.d + ' ms), the word unfolds at ' + st.at + ' ms over the protected one and stays fully readable ' + full + ' ms, the ward forms at ' + beat.at + ' ms, recovery ' + rec.at + '–' + (rec.at + rec.d) + ' ms, the action ends at ' + r.end + ' ms');
    t.ok(st.to === 'pc' && st.tm.motif === 'seal' && fxn(r).includes('pSealClose') && fxn(r).includes('sealForm'), 'the seal closes round the protected one');
  }
  // Heal: only the real recipients, with real amounts; zero gain reaches no one
  {
    const one = PC.player(word('iyasu'), [{ t: 'heal', n: 3, aim: ['pc', 'comp'], who: ['pc'], d: { pc: 3, comp: 0 }, gain: 3 }], ctxOf(), H);
    const to = one.cues.filter((c) => c.name === 'pHealTo').map((c) => c.p.to), sooth = one.cues.filter((c) => c.type === 'pose' && c.pose === 'soothed').map((c) => c.who);
    const hb = one.cues.find((c) => c.type === 'beat' && c.f.t === 'heal');
    t.ok(to.join() === 'pc' && sooth.join() === 'pc' && typeof hb.then === 'function', 'Heal on two, one restored: the motes go to you only; only you ease; the numbers come from the applied change');
    const none = PC.player(word('iyasu'), [{ t: 'heal', n: 3, aim: ['pc', 'comp'], who: [], d: { pc: 0, comp: 0 }, gain: 0 }], ctxOf(), H);
    t.ok(!none.cues.some((c) => c.name === 'pHealTo' || c.name === 'motes') && !none.cues.some((c) => c.pose === 'soothed') && none.cues.some((c) => c.name === 'pGather' && c.p.none), 'Heal at full resolve: gathered, then settles back — no motes, no easing, no number');
    const solo = PC.player(word('iyasu'), [{ t: 'heal', n: 3, aim: ['pc'], who: ['pc'], d: { pc: 2, comp: 0 }, gain: 2 }], ctxOf({ comp: null }), H);
    t.ok(solo.plan.target === 'pc' && solo.cues.filter((c) => c.name === 'pHealTo').length === 1, 'Heal alone: one recipient, you');
  }
  // Light: the real Shroud disperses only when the rules cleared one
  {
    const lit = PC.player(word('hikari'), [{ t: 'light', foe: 0, by: 'light' }], ctxOf(), H);
    const dark = PC.player(word('hikari'), [], ctxOf({ view: view({ foes: [{ knots: 3, maxKnots: 3 }] }) }), H);
    t.ok(fxn(lit).includes('pShroudClear') && fxn(lit).includes('mistPart') && !fxn(dark).includes('pShroudClear') && !fxn(dark).includes('mistPart') && !fxn(lit).includes('impact'), 'Light: the Shroud\'s own mist disperses when it was cleared, and only then; no impact');
  }
  // Unravel: the specific knot
  {
    const r = PC.player({ id: 'unravel', kind: 'unravel', jp: 'ほどく', en: 'Unravel' }, [{ t: 'unravel', n: 1, foe: 0 }], ctxOf(), H);
    const th = r.cues.find((c) => c.name === 'pThread'), kr = r.cues.find((c) => c.name === 'knotRelease');
    t.ok(th && th.p.to === 'knot:2' && kr && kr.p.i === 2 && th.at < kr.at, 'Unravel: the thread runs to the top knot (knot 2 of 3), which is released at the beat');
    const rs = PC.player({ id: 'unravel', kind: 'unravel', jp: 'ほどく', en: 'Unravel' }, [{ t: 'unravel', n: 1, foe: 0 }], ctxOf({ resolved: { jp: '{雨|あめ}', en: 'rain' } }), H);
    const st = rs.cues.find((c) => c.type === 'strip'), b0 = rs.cues.find((c) => c.type === 'beat');
    t.ok(st.word.jp === '{雨|あめ}' && /雨/.test(st.word.html) && /あめ/.test(st.word.html) && /ほどく/.test(b0.word.html), 'Unravel with the restored word: the strip shows 雨 (あめ); the record keeps ほどく and the restored word');
    t.ok(PC.resolvedOf({ kind: 'word' }, { kind: 'write', answer: 'x' }) === null && PC.resolvedOf({ kind: 'unravel' }, { kind: 'write', item: 'k:あ', answer: 'あ', single: true }).jp === 'あ', 'resolvedOf: a word card keeps its own word; a kana task shows the kana it restored');
  }
  // beats: each result once, in the rules' order
  {
    const fx = [{ t: 'cost', en: 'slip' }, { t: 'unravel', n: 1, foe: 0 }, { t: 'harmony', n: 1, max: 3 }];
    const r = PC.player({ id: 'unravel', kind: 'unravel', jp: 'ほどく', en: 'Unravel' }, fx, ctxOf(), H);
    t.eq(beats(r), ['cost', 'unravel', 'harmony'], 'every result one beat, in the rules\' order (the slip first)');
  }
  // techniques: two real participants, complementary
  for (const who of ['nao', 'mio', 'ren', 'suzu']) {
    const card = { id: 'tech', kind: 'tech', jp: 'あわせ', en: 'Technique', tech: who };
    const fx = [{ t: 'unravel', n: 2, foe: 0 }, { t: 'tech', who, en: '', foe: 0 }];
    const r = PC.player(card, fx, ctxOf({ comp: who, view: view({ compId: who }) }), H);
    const acts = r.cues.filter((c) => c.type === 'pose' && c.pose === 'act');
    const pc = acts.find((c) => c.who === 'pc'), cp = acts.find((c) => c.who === 'comp');
    t.ok(pc && cp && pc.at !== cp.at && (pc.gesture !== cp.gesture || who === 'ren') && fxn(r).includes('pJoin') && beats(r).join() === 'unravel,tech', who + '\'s technique: two performances at different moments (' + cp.gesture + ' at ' + cp.at + ', yours ' + pc.gesture + ' at ' + pc.at + '), one culmination, each result once');
  }
  // companion support: every action, its own gesture, its results once and in order
  {
    const bad2 = [];
    for (const who of Object.keys(C.companionActions)) for (const act of C.companionActions[who]) {
      const e = act.effect || {};
      const fx = [{ t: 'cact', who, id: act.id, en: 'x' }];
      if (e.kind === 'heal') fx.push({ t: 'heal', n: e.n, aim: ['pc', 'comp'], who: ['pc'], by: who, d: { pc: e.n, comp: 0 }, gain: e.n });
      if (e.kind === 'ward') fx.push({ t: 'ward', target: 'pc', n: e.n, by: who });
      if (e.kind === 'soften' || e.kind === 'heckle') fx.push({ t: 'soften', foe: 0, n: 1 });
      if (e.kind === 'stun') fx.push({ t: 'stun', foe: 0 });
      if (e.kind === 'draw' || e.kind === 'drawAll') fx.push({ t: 'draw', foe: 0 });
      if (e.kind === 'clear') fx.push({ t: 'light', foe: 0, by: who });
      if (e.kind === 'knot') fx.push({ t: 'unravel', n: 1, foe: 0, by: who });
      if (e.kind === 'harmony') fx.push({ t: 'harmony', n: 2, max: 3, by: who });
      const r = PC.companion(Object.assign({ kind: e.kind }, act), fx, ctxOf({ comp: who, view: view({ compId: who }) }), H);
      const g = r.cues.find((c) => c.type === 'pose' && c.pose === 'act');
      if (!r.mapped) bad2.push(act.id + ': not mapped');
      if (!g || g.gesture !== PC.SUPPORT[act.id].g) bad2.push(act.id + ': gesture ' + (g && g.gesture));
      if (beats(r).join() !== fx.map((f) => f.t).join()) bad2.push(act.id + ': beats ' + beats(r).join());
      if (e.kind === 'heal' && !r.cues.some((c) => c.name === 'pPour' && c.p.who.join() === 'pc')) bad2.push(act.id + ': the drops do not go to the one restored');
    }
    t.eq(bad2, [], 'all 20 support actions: their own gesture, every result one beat in the rules\' order, drops only to the real recipient');
    const failed = PC.companion(Object.assign({ kind: 'opening' }, C.companionActions.nao[0]), [{ t: 'cact', who: 'nao', id: 'nao_opening', none: true }], ctxOf({ comp: 'nao' }), H);
    t.ok(!fxn(failed).includes('pSpot') && fxn(failed).includes('pNone'), 'a support that found nothing (no opening this time) shows no success mark');
  }
  // reactions to what the creatures do
  {
    const Q = [];
    const ctx = ctxOf({ blocked: { pc: true }, kind: 'strike' });
    PC.react(Q, { t: 'block', who: 'pc', n: 1 }, 600, ctx, 'enemy', H);
    PC.react(Q, { t: 'hit', who: 'pc', n: 1 }, 710, ctx, 'enemy', H);
    PC.react(Q, { t: 'silence' }, 900, ctxOf({ blocked: {} }), 'enemy', H);
    const poses = Q.filter((c) => c.type === 'pose').map((c) => c.who + ':' + c.pose + (c.gesture ? ':' + c.gesture : ''));
    t.eq(poses, ['pc:brace', 'pc:hit:soft', 'pc:afflict:hush', 'comp:afflict:hush'], 'a ward catches (brace), the softened rest lands smaller (hit soft); the Hush reaches both (a short hush reaction)');
  }
  // reduced motion keeps the word, the target and every result
  {
    const r = PC.player(word('mamoru', 'comp'), [{ t: 'ward', target: 'comp', n: 2 }], ctxOf({ reduce: true }), H);
    const st = r.cues.find((c) => c.type === 'strip');
    t.ok(st.tm.still && st.tm.travel === 0 && st.to === 'comp' && beats(r).join() === 'ward' && r.cues.filter((c) => c.type === 'pose').length === 1, 'reduced motion: the word stands still over its target, one held gesture, the result kept');
  }
  // the sequencer's own entry points reach this choreography
  {
    const r = RB.battleSeq.choreo.player(word('mizu'), [{ t: 'water', foe: 0 }], ctxOf());
    t.ok(r.plan.family === 'water' && r.plan.gesture === 'flow' && r.cues.some((c) => c.name === 'splashArc'), 'RB.battleSeq.choreo.player is the party choreography (water: flow, splashArc)');
  }

  // ---- discipline ---------------------------------------------------------------------------------------
  const files = ['src/engine/34_battlers.js', 'src/engine/34m_battler_moves.js', 'src/ui/84p_party_choreo.js', 'src/ui/84p_party_fx.js', 'src/ui/84p_party_word.js'];
  t.eq(files.filter((f) => /Math\.random/.test(fs.readFileSync(path.join(root, f), 'utf8').replace(/\/\/.*$|\/\*[\s\S]*?\*\//gm, ''))), [], 'no Math.random in the party art (cosmetic variation is seeded)');
  t.ok(Object.keys(RB.partyFx.NAMES).length >= 20 && RB.partyFx.NAMES.every((n) => typeof RB.battleFx.fx[n] === 'function'), RB.partyFx.NAMES.length + ' party effects registered beside the shared ones');
};

// the sequencer helpers the party choreography uses (as src/ui/82_battle_seq.js passes them)
function HOf(RB) {
  const fid = (ctx, i) => (i == null ? (ctx.foe == null ? 0 : ctx.foe) : i);
  return {
    T: RB.battleSeq.T, fid,
    foeId: (ctx, i) => (ctx.group ? 'foe:' + fid(ctx, i) : 'foe'),
    knotId: (ctx, i, j) => (ctx.group ? 'knot:' + fid(ctx, i) + ':' + j : 'knot:' + j),
    fview: (ctx, i) => (ctx.view.foes ? ctx.view.foes[fid(ctx, i)] : ctx.view) || ctx.view,
    healThen: () => {}, stillNums: () => 0,
    OUTCOME: { unravel: 1, ward: 1, heal: 1, water: 1, light: 1, bind: 1, warm: 1, bell: 1, settle: 1, reveal: 1, tech: 1, comp: 1, cact: 1, soften: 1, stun: 1, draw: 1 },
  };
}
