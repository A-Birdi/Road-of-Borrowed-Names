// Inkweaving rules that the battle screen explains (src/engine/95_combat.js):
// Heat scaling and its cap, what a blow will do (the numbers the help text
// shows), Harmony gain and spending, per-companion techniques, and which
// moves each word answers.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const L = RB.combatLogic, C = RB.content;
  const W = (id) => C.words[id];
  const camp = (o) => {
    const s = RB.state.newCampaign({});
    s.learn.difficulty = o.diff || 'normal';
    s.comp = o.comp || null;
    s.words = o.words || ['mamoru', 'mizu', 'hikari', 'iyasu'];
    return s;
  };
  // a foe whose pattern is exactly `pattern`
  const foe = (pattern, knots) => ({ id: 'probe', knots: knots || 9, pattern });
  const ok = { ok: true, firstTry: true, mistakes: 0 };
  const unravel = { kind: 'unravel' };
  const exchange = (st, enemy, card, res) => {
    const { countered } = L.playerAct(st, card, res || ok, enemy);
    const fx = L.enemyAct(st, countered);
    L.endRound(st, enemy);
    return fx;
  };
  const hits = (fx) => fx.filter((f) => f.t === 'hit').reduce((n, f) => n + f.n, 0);

  // ---- Heat: +1 per level, capped; water clears it ------------------------------------
  t.eq([L.HEAT.max, L.HEAT.per], [2, 1], 'Heat is capped at 2 and adds 1 per level');
  {
    const e = foe(['heat', 'strike', 'heat', 'strike', 'heat', 'strike']);
    const st = L.init(e, camp({}), {});
    exchange(st, e, unravel); // heat left unanswered
    t.eq(st.heat, 1, 'an unanswered Heat raises it to 1');
    t.eq(L.blowOf(st, st.intent).per, 3, 'the telegraphed Strike then shows 2 + 1');
    t.eq(hits(exchange(st, e, unravel)), 3, 'and hits for 3 at Heat 1');
    exchange(st, e, unravel);
    t.eq(st.heat, 2, 'a second unanswered Heat raises it to 2');
    t.eq(hits(exchange(st, e, unravel)), 4, 'a Strike hits for 2 + 2 at Heat 2 (levels matter)');
    exchange(st, e, unravel);
    t.eq(st.heat, 2, 'Heat never goes past its cap');
    const water = { kind: 'word', word: W('mizu') };
    const fx = L.playerAct(st, water, ok, e).fx;
    t.ok(st.heat === 0 && fx.some((f) => f.t === 'water'), 'a water word clears all Heat');
  }
  {
    const e = foe(['heat', 'strike']);
    const st = L.init(e, camp({}), {});
    const r = L.playerAct(st, { kind: 'word', word: W('mizu') }, ok, e);
    t.ok(r.countered, 'a water word answers a Heat move before it lands');
    L.enemyAct(st, r.countered);
    t.eq(st.heat, 0, 'an answered Heat move leaves no Heat');
  }

  // ---- what a blow will do: blowOf agrees with enemyAct ----------------------------------
  for (const diff of ['relaxed', 'normal', 'hard']) {
    for (const kind of ['strike', 'sweep', 'flood', 'gust', 'chill', 'lie', 'mirror']) {
      for (const heat of [0, 1, 2]) {
        const e = foe([kind]);
        const st = L.init(e, camp({ diff, comp: 'nao' }), {});
        st.heat = heat;
        const b = L.blowOf(st, st.intent);
        const fx = L.enemyAct(st, false);
        const got = fx.filter((f) => f.t === 'hit').map((f) => f.n);
        const want = b.per > 0 ? b.who.map(() => b.per) : [];
        t.eq(got, want, `${kind} (${diff}, Heat ${heat}): the numbers shown are the ones applied`);
      }
    }
  }
  {
    const e = foe(['sweep']);
    const st = L.init(e, camp({ comp: 'mio' }), {});
    t.eq(L.blowOf(st, st.intent).who, ['pc', 'comp'], 'Sweep is a group attack: it hits both of you');
    const s2 = L.init(foe(['strike']), camp({ comp: 'mio' }), {});
    t.eq(L.blowOf(s2, s2.intent).who.length, 1, 'Strike hits one of you');
    t.eq(L.blowOf(s2, { kind: 'heat', target: 'pc' }), null, 'Heat itself deals no damage');
  }

  // ---- Harmony -----------------------------------------------------------------------------------
  {
    const e = foe(['strike', 'strike', 'strike', 'strike', 'strike']);
    const s = camp({ comp: 'ren' });
    const st = L.init(e, s, {});
    t.eq(st.harmony, 0, 'Harmony starts at 0');
    t.ok(!L.responses(st, s.words.map(W)).some((c) => c.kind === 'tech'), 'no technique before Harmony is full');
    // a clean ward in front of the aimed target cancels the Strike: +1
    const ward = () => ({ kind: 'word', word: W('mamoru'), target: st.intent.target });
    L.playerAct(st, ward(), ok, e); L.enemyAct(st, true); L.endRound(st, e);
    t.eq(st.harmony, 1, 'a clean answer that cancels the move adds 1');
    L.playerAct(st, ward(), { ok: true, firstTry: false, mistakes: 1 }, e); L.enemyAct(st, true); L.endRound(st, e);
    t.eq(st.harmony, 1, 'an answer that needed a retry adds nothing');
    L.playerAct(st, { kind: 'word', word: W('iyasu') }, ok, e); L.enemyAct(st, false); L.endRound(st, e);
    t.eq(st.harmony, 1, 'a response that cancels nothing adds nothing');
    L.playerAct(st, unravel, ok, e); L.enemyAct(st, false); L.endRound(st, e);
    L.playerAct(st, unravel, ok, e); L.enemyAct(st, false); L.endRound(st, e);
    t.eq(st.harmony, 3, 'clean Unravels add 1 each, up to 3');
    const tech = L.responses(st, s.words.map(W)).find((c) => c.kind === 'tech');
    t.ok(tech && tech.en === 'Lantern Ward' && /3-point ward/.test(tech.desc), 'the technique card names this companion\'s technique and its effect: ' + (tech && tech.en));
    const k0 = st.knots, w0 = st.ward.pc;
    const r = L.playerAct(st, tech, ok, e);
    t.ok(r.countered && st.knots === k0 - 1 && st.ward.pc === w0 + 3, 'Lantern Ward: frees 1 knot, a 3-point ward, cancels the move');
    t.eq(st.harmony, 0, 'a technique uses up Harmony (it starts again from 0)');
  }
  for (const [comp, name, knots] of [['nao', 'Read the Opening', 2], ['mio', 'Clearwater Draught', 1], ['ren', 'Lantern Ward', 1], ['suzu', 'Curtain Call', 2]]) {
    const e = foe(['rest']);
    const s = camp({ comp });
    const st = L.init(e, s, {});
    st.harmony = st.harmonyMax; st.heat = 2; st.pc = 3;
    const tech = L.responses(st, s.words.map(W)).find((c) => c.kind === 'tech');
    t.ok(tech && tech.en === name && tech.desc.indexOf(L.TECHS[comp].effect) === 0, comp + ': technique card is ' + name);
    const k0 = st.knots;
    L.playerAct(st, tech, ok, e);
    t.eq(k0 - st.knots, knots, comp + ': ' + name + ' frees ' + knots + ' knot(s), as its text says');
    if (comp === 'mio') t.ok(st.pc === st.max && st.heat === 0, 'Clearwater Draught restores resolve and clears Heat');
  }
  {
    const s = camp({});
    const st = L.init(foe(['strike']), s, {});
    st.harmony = 3;
    t.ok(!L.responses(st, s.words.map(W)).some((c) => c.kind === 'tech'), 'no technique without a companion');
  }

  // ---- which moves a word answers ----------------------------------------------------------------
  t.eq(L.answers(W('mizu')), ['heat'], 'みず answers Heat');
  t.eq(L.answers(W('koori')), ['heat'], 'こおり answers Heat');
  t.eq(L.answers(W('mamoru')), ['strike'], 'まもる cancels a Strike (it only softens Sweep and Flood)');
  t.eq(L.answers(W('hikari')).sort(), ['mend', 'mirror', 'shroud'], 'ひかり answers Shroud, Re-tying and Mirror');
  t.eq(L.answers(W('ishi')).sort(), ['flood', 'gust'], 'いし answers Gust and Flood');
  t.eq(L.answers(W('iyasu')), [], 'いやす answers nothing (it heals)');
  for (const id in C.words) t.ok(typeof C.words[id].effect === 'string' && C.words[id].effect.length > 10, 'word ' + id + ' says what it does');

  // ==== several creatures ========================================================================
  const ALL = ['mamoru', 'iyasu', 'hikari', 'mizu', 'kaze', 'nawa', 'ishi', 'tsuchi', 'koori', 'honoo', 'suzu', 'koe'];
  const grp = (pats, o) => {
    o = o || {};
    const lead = Object.assign(foe(pats[0], o.knots || 2), { id: 'lead' });
    const others = pats.slice(1).map((p, i) => Object.assign(foe(p, o.knots || 2), { id: 'g' + i }));
    const s = camp({ diff: o.diff || 'hard', comp: o.comp, words: o.words || ALL });
    return { lead, s, st: L.init(lead, s, { group: others }) };
  };
  // ---- difficulty: how many creatures, and their knots ----
  {
    const place = { group: { normal: ['sa.moth'], hard: ['sa.moth', 'sa.crane'] } };
    t.eq(L.groupFor('sa.wraith', place, 'relaxed'), ['sa.wraith'], 'Relaxed: a group placement is its lead creature alone');
    t.eq(L.groupFor('sa.wraith', place, 'normal'), ['sa.wraith', 'sa.moth'], 'Standard: the lead and one more');
    t.eq(L.groupFor('sa.wraith', place, 'hard'), ['sa.wraith', 'sa.moth', 'sa.crane'], 'Demanding: the lead and two more');
    t.eq(L.groupFor('sa.wraith', { group: { hard: ['sa.moth', 'sa.crane'] } }, 'normal'), ['sa.wraith', 'sa.moth'], 'a group for Demanding only is cut to two on Standard');
    t.eq(L.groupFor('sa.wraith', null, 'hard'), ['sa.wraith'], 'a placement without a group is one creature at every setting');
    const s = camp({ diff: 'relaxed' });
    const st = L.init(foe(['strike'], 3), s, { group: ['sa.moth', 'sa.crane'] });
    t.eq(st.foes.length, 1, 'init never exceeds the setting: a group handed to Relaxed is one creature');
    t.eq(st.knots, 3, 'and that creature keeps all its knots');
    for (const [diff, n, share] of [['normal', 2, 0.5], ['hard', 3, 0.4]]) {
      const s2 = camp({ diff });
      const lead = Object.assign({ id: 'sa.wraith' }, C.enemies['sa.wraith']);
      const st2 = L.init(lead, s2, { group: ['sa.moth', 'sa.echo'] });
      t.eq(st2.foes.length, n, diff + ': ' + n + ' creatures');
      const want = st2.foes.map((f) => Math.max(1, Math.round(Math.max(1, (C.enemies[f.enemyId].knots || 2) + L.DIFF[diff].knotMod) * share)));
      t.eq(st2.foes.map((f) => f.maxKnots), want, diff + ': each creature has fewer knots in a group (' + want.join('/') + ')');
    }
    // a guardian keeps its knots among attendants
    const boss = Object.assign({ id: 'sa.hush' }, C.enemies['sa.hush']);
    const st3 = L.init(boss, camp({ diff: 'normal' }), { group: ['sa.moth'] });
    t.eq(st3.foes[0].maxKnots, C.enemies['sa.hush'].knots, 'a guardian keeps all its knots; its attendants have fewer');
    t.eq(st3.foes[1].maxKnots, 1, 'an attendant: ' + st3.foes[1].maxKnots + ' knot');
  }
  // ---- the target and the focus ----
  {
    const { st } = grp([['rest'], ['strike'], ['heat']]);
    t.eq(st.foes.length, 3, 'three creatures on Demanding');
    t.eq(st.cur, 1, 'the default target is the one whose telegraph threatens most (the Strike)');
    t.ok(L.target(st, 2) && st.cur === 2 && st.intent.kind === 'heat', 'choosing a target focuses it: st.intent is its telegraph');
    st.knots = 1;
    t.eq(st.foes[2].knots, 1, 'st.<field> writes the creature in focus');
    t.ok(!L.target(st, 7) && !L.target(st, -1) && !L.target(st, null) && st.cur === 2, 'no target outside the group');
    st.foes[0].knots = 0; st.foes[0].settled = true;
    t.ok(!L.target(st, 0) && st.cur === 2, 'a settled creature cannot be targeted');
    const snap = L.snapshot(st);
    snap.knots = 0;
    t.ok(st.foes[2].knots === 1, 'a snapshot has its own creature records');
  }
  // ---- what a response reaches ----
  {
    const { st, s } = grp([['heat'], ['heat'], ['shroud']]);
    const card = (id) => L.responses(st, s.words.map(W)).find((c) => c.kind === 'word' && c.word.id === id);
    L.target(st, 0);
    t.eq(L.reachOf(st, card('mizu')).foes, [0, 1, 2], 'water reaches every creature');
    t.eq(L.reachOf(st, card('kaze')).foes, [0, 1, 2], 'wind reaches every creature');
    t.eq(L.reachOf(st, card('hikari')).foes, [0], 'light acts on the target alone');
    t.eq(L.reachOf(st, card('nawa')).foes, [0], 'rope acts on the target alone');
    t.eq(L.reachOf(st, { kind: 'unravel' }).foes, [0], 'Unravel acts on the target alone');
    const heal = L.reachOf(st, card('iyasu'));
    t.eq([heal.foes, heal.allies], [[], ['pc']], 'heal acts on you (no companion here)');
    const stone = L.reachOf(st, card('ishi'));
    t.ok(stone.party && stone.foes.length === 0, 'stone guards the party (against every creature\'s move of its kind)');
    // water cools every creature's Heat and answers every Heat move
    st.foes[0].heat = 2; st.foes[1].heat = 1;
    const r = L.playerAct(st, card('mizu'), ok, null);
    t.ok(st.foes.every((f) => !f.heat), 'water cools every creature');
    t.eq(r.answered, [true, true, false], 'and answers both Heat moves (not the Shroud)');
    t.eq(r.fx.filter((f) => f.t === 'water').map((f) => f.foe), [0, 1], 'one result per creature it cooled, each naming its creature');
    const fx = L.enemyAct(st, r.answered);
    t.eq(fx.map((f) => f.t + '@' + f.foe), ['countered@0', 'countered@1', 'shroud@2'], 'each creature acts in turn: the two answered moves fizzle, the third lands');
  }
  {
    const { st, s } = grp([['shroud'], ['shroud'], ['strike']]);
    st.foes[0].shroud = true; st.foes[1].shroud = true;
    L.target(st, 0);
    const light = L.responses(st, s.words.map(W)).find((c) => c.word && c.word.id === 'hikari');
    L.playerAct(st, light, ok, null);
    t.ok(!st.foes[0].shroud && st.foes[1].shroud, 'light clears the mist of the target only');
    const wind = L.responses(st, s.words.map(W)).find((c) => c.word && c.word.id === 'kaze');
    const r = L.playerAct(st, wind, ok, null);
    t.ok(!st.foes[1].shroud && r.answered[0] && r.answered[1] && !r.answered[2], 'wind clears every mist and answers every Shroud');
  }
  {
    const { st, s } = grp([['gust'], ['flood'], ['chill']], { comp: 'mio' });
    const stone = L.responses(st, s.words.map(W)).find((c) => c.word && c.word.id === 'ishi');
    const r = L.playerAct(st, stone, ok, null);
    t.eq(r.answered, [true, true, false], 'stone at your feet answers every Gust and Flood (not the Chill)');
    const flame = L.responses(st, s.words.map(W)).find((c) => c.word && c.word.id === 'honoo');
    t.eq(L.playerAct(st, flame, ok, null).answered, [false, false, true], 'warmth answers every Chill');
  }
  {
    // a ward before the one two Strikes aim at blocks one of them: the target's first
    const { st, s } = grp([['strike'], ['strike']], { diff: 'normal', comp: 'ren' });
    st.foes[0].intent.target = 'pc'; st.foes[1].intent.target = 'pc';
    L.target(st, 1);
    const ward = L.responses(st, s.words.map(W)).find((c) => c.word && c.word.id === 'mamoru' && c.target === 'pc');
    const r = L.playerAct(st, ward, ok, null);
    t.eq(r.answered, [false, true], 'the ward blocks the target\'s Strike; the other still comes');
  }
  // ---- settling one, then all ----
  {
    const { lead, st } = grp([['strike'], ['rest'], ['rest']], { knots: 1 });
    L.target(st, 1);
    L.playerAct(st, { kind: 'unravel' }, ok, lead);
    t.eq(st.foes[1].knots, 0, 'its last knot comes loose');
    const fx = L.enemyAct(st, [false, false, false]);
    t.ok(!fx.some((f) => f.foe === 1), 'a creature with no knots left does not act');
    L.endRound(st, lead);
    t.ok(st.foes[1].settled && st.justSettled.join() === '1' && !st.over, 'it settles; the others stand; the encounter goes on');
    t.ok(st.cur !== 1, 'the target moves to a creature still standing');
    for (const i of [0, 2]) { L.target(st, i); L.playerAct(st, { kind: 'unravel' }, ok, lead); }
    t.ok(L.allSettled(st), 'all knots free');
    L.endRound(st, lead);
    t.eq(st.over, 'win', 'the encounter is won when every creature has settled');
  }
  // ---- techniques in a group ----
  {
    const { lead, st } = grp([['strike'], ['strike'], ['heat']], { comp: 'suzu', knots: 3 });
    st.harmony = st.harmonyMax;
    L.target(st, 0);
    const tech = L.responses(st, []).find((c) => c.kind === 'tech');
    t.ok(/every creature's move turns back/.test(tech.desc), 'Curtain Call says what it does to a group: ' + tech.desc);
    const k0 = st.foes.map((f) => f.knots);
    const r = L.playerAct(st, tech, ok, lead);
    t.eq(r.answered, [true, true, true], 'Curtain Call: every creature\'s move turns back');
    t.eq(st.foes.map((f, i) => k0[i] - f.knots), [2, 1, 1], '2 knots on the target, 1 on each of the others');
    const single = L.init(foe(['strike'], 5), camp({ comp: 'suzu' }), {});
    single.harmony = 3;
    L.playerAct(single, L.responses(single, []).find((c) => c.kind === 'tech'), ok, null);
    t.eq(single.knots, 3, 'one creature: Curtain Call is exactly as before (2 knots)');
  }
  {
    const { st } = grp([['heat'], ['shroud'], ['charge']], { comp: 'mio' });
    st.foes.forEach((f) => { f.heat = 2; f.shroud = true; f.charged = true; });
    st.harmony = 3;
    L.playerAct(st, L.responses(st, []).find((c) => c.kind === 'tech'), ok, null);
    t.ok(st.foes.every((f) => !f.heat && !f.shroud && !f.charged), 'Clearwater Draught washes every creature\'s Heat, mist and Gathering away');
  }

  // ==== the companion's turn =======================================================================
  const opt = (st, s, card) => L.compOptions(st, s, card || { kind: 'unravel' });
  {
    const s = camp({ comp: 'nao' });
    const st = L.init(foe(['strike']), s, {});
    t.eq(opt(st, s).filter((o) => !o.locked).map((o) => o.def.id), ['nao_opening'], 'from recruitment: one action');
    s.flags.ch2_done = true;
    t.eq(opt(st, s).filter((o) => !o.locked).map((o) => o.def.id), ['nao_opening', 'nao_warn'], 'after the second chapter: one more');
    RB.state.setQuest(s, 'lf_nao', 'done');
    s.flags.lq_ally1 = true; s.flags.lq_ally2 = true;
    t.eq(opt(st, s).filter((o) => !o.locked).length, 5, 'with the personal quest and both later milestones: five');
    t.eq(opt(st, s, { kind: 'tech' }).map((o) => o.def.id), ['join'], 'with the technique queued, the companion is busy with it');
    st.comp = 0;
    t.eq(opt(st, s).length, 0, 'a companion who is down has no turn');
  }
  for (const c of ['nao', 'mio', 'ren', 'suzu']) {
    const acts = C.companionActions[c];
    t.eq(acts.length, 5, c + ': five actions');
    t.eq(acts.map((a) => a.unlock || ''), ['', 'ch2_done', { nao: 'quest.lf_nao=done', mio: 'quest.lf_mio=done', ren: 'quest.ren_ushio=done', suzu: 'quest.co_suzu=done' }[c], 'lq_ally1', 'lq_ally2'], c + ': unlocks follow the story beats and quests');
    for (const a of acts) t.ok(a.name.en && a.name.jp && a.desc && a.effect && a.effect.kind, c + ' ' + a.id + ' is described');
    t.ok(!acts[0].uses, c + ': the first action can be used every round');
  }
  {
    // resolution order: your response, then the companion, then the creature
    const e = foe(['strike', 'strike']);
    const s = camp({ comp: 'mio' });
    const st = L.init(e, s, {});
    st.intent.target = 'pc';
    st.pc = 8;
    const P = L.playerAct(st, { kind: 'unravel' }, ok, e);
    const C1 = L.compAct(st, 'mio_draught', P);
    t.ok(st.pc === 9 && st.comp === 12 && C1.fx.some((f) => f.t === 'heal' && f.n === 1), 'Mio\'s warm draught: +1 each (capped), before the creature acts');
    const fx = L.enemyAct(st, P.answered);
    t.eq(hits(fx), 2, 'then the Strike lands in full');
    t.ok(!fx.some((f) => f.t === 'comp' && f.who === 'mio'), 'Mio\'s draught no longer happens by itself at the end of the exchange (it is her action now)');
  }
  {
    const e = foe(['strike', 'strike', 'strike']);
    const s = camp({ comp: 'suzu' });
    const st = L.init(e, s, {});
    st.intent.target = 'pc';
    const P = L.playerAct(st, { kind: 'unravel' }, ok, e);
    L.compAct(st, 'suzu_heckle', P);
    t.eq(L.blowOf(st, st.intent).per, 1, 'Heckle: the blow the help text shows is 1 softer');
    t.eq(hits(L.enemyAct(st, P.answered)), 1, 'and it lands 1 softer');
    L.endRound(st, e);
    t.eq(st.foes[0].soften, 0, 'softening lasts for this exchange only');
    st.intent.target = 'pc';
    const P2 = L.playerAct(st, { kind: 'unravel' }, ok, e);
    L.compAct(st, 'suzu_eye', P2);
    const fx2 = L.enemyAct(st, P2.answered);
    t.ok(fx2.some((f) => f.t === 'hit' && f.who === 'comp') && !fx2.some((f) => f.t === 'hit' && f.who === 'pc'), 'Draw its eye: the blow at you comes at Suzu');
    const uses = (id, n) => { for (let k = 0; k < n; k++) { const P3 = L.playerAct(st, { kind: 'word', word: W('iyasu') }, ok, e); L.compAct(st, id, P3); L.enemyAct(st, P3.answered); L.endRound(st, e); } };
    uses('suzu_feint', 2);
    t.eq(st.compUses.suzu_feint, 1, 'a once-per-encounter action is spent once');
    t.ok(L.compOptions(st, Object.assign(s, { flags: { lq_ally1: true } }), { kind: 'unravel' }).find((o) => o.def.id === 'suzu_feint').used, 'and is shown as used');
  }
  {
    // Nao's opening: only when your response answered a move right first time
    const e = foe(['heat', 'strike', 'rest', 'rest']);
    const s = camp({ comp: 'nao' });
    const st = L.init(e, s, {});
    let P = L.playerAct(st, { kind: 'word', word: W('mizu') }, ok, e);
    L.compAct(st, 'nao_opening', P);
    t.ok(st.openingBonus, 'a clean answer + Spot the opening: the next Unravel is ready to free two');
    L.enemyAct(st, P.answered); L.endRound(st, e);
    const k0 = st.knots;
    P = L.playerAct(st, { kind: 'unravel' }, ok, e);
    t.eq(k0 - st.knots, 2, 'and it frees two knots');
    const st2 = L.init(e, s, {});
    const P2 = L.playerAct(st2, { kind: 'unravel' }, ok, e);
    L.compAct(st2, 'nao_opening', P2);
    t.ok(!st2.openingBonus, 'without an answered move, nothing is spotted');
    const st3 = L.init(e, s, {});
    const P3 = L.playerAct(st3, { kind: 'word', word: W('mizu') }, ok, e);
    t.ok(!st3.openingBonus && P3.answered[0], 'the opening is no longer a passive: without Nao\'s action a clean answer spots nothing');
  }
  {
    // Ren's lamp no longer interrupts a Gathering by itself; the Flare does (once)
    const e = foe(['charge', 'strike']);
    const s = camp({ comp: 'ren' });
    s.flags.ch2_done = true;
    const st = L.init(e, s, {});
    const P = L.playerAct(st, { kind: 'word', word: W('mizu') }, ok, e);
    t.ok(!P.answered[0], 'a clean word does not interrupt a Gathering by itself any more');
    L.compAct(st, 'ren_flare', P);
    t.ok(P.answered[0], 'Flare the lamp stops the Gathering it was about to make');
    const fx = L.enemyAct(st, P.answered);
    t.ok(fx.some((f) => f.t === 'countered') && !st.charged, 'and it comes to nothing');
    t.eq(st.ward.pc, 1, 'Ren\'s trait stays: a small ward at the start of each encounter');
  }
  {
    // Mio's salts: nobody falls this round
    const e = foe(['strike']);
    const s = camp({ comp: 'mio', diff: 'hard' });
    const st = L.init(e, s, {});
    st.intent.target = 'pc'; st.pc = 2;
    const P = L.playerAct(st, { kind: 'unravel' }, ok, e);
    L.compAct(st, 'mio_salts', P);
    L.enemyAct(st, P.answered);
    t.eq(st.pc, 1, 'Smelling salts: the blow leaves you at 1, not 0');
    L.endRound(st, e);
    t.ok(!st.salts, 'for this exchange only');
  }
  {
    // the late alliances keep the companions' promises (src/content/lq): lq_ally1 "on their own
    // initiative", lq_ally2 "stand with you"
    const by = (who) => Object.fromEntries(['lq_ally1', 'lq_ally2'].map((u) => [u, C.companionActions[who].filter((d) => d.unlock === u).map((d) => d.id)]));
    t.eq(['nao', 'mio', 'ren', 'suzu'].map((w) => by(w).lq_ally1.length + '/' + by(w).lq_ally2.length).join(' '), '1/1 1/1 1/1 1/1', 'one action for each companion at each late alliance');
    // Nao, "whatever comes for you … I'll take half"
    const e = foe(['strike', 'sweep', 'strike']);
    const s = camp({ comp: 'nao', diff: 'hard' });
    const st = L.init(e, s, {});
    st.intent.target = 'pc';
    const per = L.blowOf(st, st.intent).per;
    const P = L.playerAct(st, { kind: 'word', word: W('iyasu') }, ok, e);
    L.compAct(st, 'nao_mark', P);
    const pc0 = st.pc, comp0 = st.comp;
    const fx = L.enemyAct(st, P.answered);
    t.ok(per > 1 && pc0 - st.pc === Math.floor(per / 2) && comp0 - st.comp === Math.ceil(per / 2), 'Take half: a blow of ' + per + ' at you is shared, Nao takes the larger half (' + (pc0 - st.pc) + ' / ' + (comp0 - st.comp) + ')');
    t.ok(fx.some((f) => f.t === 'comp' && f.who === 'nao' && f.share) && hits(fx) === per, 'nothing is lost or added: the hits add up to the blow');
    L.endRound(st, e);
    t.ok(!st.share, 'for this exchange only');
    // the sweep next round lands on both in full again
    const P2 = L.playerAct(st, { kind: 'word', word: W('iyasu') }, ok, e);
    const fx2 = L.enemyAct(st, P2.answered);
    t.ok(fx2.filter((f) => f.t === 'hit' && f.who === 'pc').length === 1 && !fx2.some((f) => f.share), 'without it, nothing is shared');
  }
  {
    // Suzu, "if something takes aim at you, I'll draw the audience's eye": every creature
    const a = foe(['strike', 'strike']), b = foe(['strike', 'strike']);
    const s = camp({ comp: 'suzu', diff: 'normal' });
    const st = L.init(a, s, { group: [b] });
    for (const f of st.foes) f.intent.target = 'pc';
    const P = L.playerAct(st, { kind: 'word', word: W('iyasu') }, ok, a);
    const C1 = L.compAct(st, 'suzu_finale', P);
    t.ok(st.foes.every((f) => f.drawn) && C1.fx.filter((f) => f.t === 'draw').length === 2, 'Grand gesture: both creatures\' eyes are drawn');
    const fx = L.enemyAct(st, P.answered);
    t.ok(fx.filter((f) => f.t === 'hit' || f.t === 'block').every((f) => f.who === 'comp') && fx.some((f) => f.t === 'hit' || f.t === 'comp'), 'every blow aimed at you comes at Suzu (or her flourish turns it aside)');
  }
  {
    // Ren: lq_ally1 "I'll raise the light before I'm asked"; lq_ally2 "I'll stand in front of you"
    const a = foe(['silence', 'strike']), b = foe(['shroud', 'strike']);
    const s = camp({ comp: 'ren', diff: 'normal' });
    const st = L.init(a, s, { group: [b] });
    st.silenced = 1; st.foes[1].shroud = true;
    const P = L.playerAct(st, { kind: 'word', word: W('iyasu') }, ok, a);
    const C1 = L.compAct(st, 'ren_lanterns', P);
    t.ok(!st.silenced && !st.foes[1].shroud && P.answered[0] && C1.fx.some((f) => f.t === 'bell'), 'Raise the lamps: the Hush breaks, the mist burns off, the Hush about to fall is stopped');
    L.enemyAct(st, P.answered); L.endRound(st, a);
    const w0 = st.ward.pc, wc = st.ward.comp;
    const P2 = L.playerAct(st, { kind: 'word', word: W('iyasu') }, ok, a);
    L.compAct(st, 'ren_chime', P2);
    t.ok(st.ward.pc === w0 + 3 && st.ward.comp === wc, 'Stand in front: a 3-point ward before you (not before Ren)');
  }
  {
    // resolve in battle follows the difficulty table
    t.eq(['relaxed', 'normal', 'hard'].map((d) => L.init(foe(['rest']), camp({ diff: d }), {}).max), [14, 12, 10], 'battle resolve: Relaxed 14, Standard 12, Demanding 10');
  }
};
