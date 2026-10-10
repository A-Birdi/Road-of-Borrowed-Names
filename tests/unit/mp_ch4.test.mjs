// Manybridge, Chapter 4 (expansion P09; docs/future/work/P09_MANYBRIDGE2.md): the chapter in twelve-chapter journeys
// only; its maps (and the Understage's three gates that open only by working the machines); the three procedures and
// the Lord of the Understage played through in order, with wrong moves handled as declared; A Ghostwriter's Debt
// reaches every end; the festival's plan follows what was said; the fireworks are a bond event and a kept memory for
// every companion; festival dress is the night's only; the river road and the north road after the chapter; the
// stamps, the games, the wanderers and the music.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, E = RB.encounter;
  const OK = { ok: true, firstTry: true, mistakes: 0 };
  const camp = (o = {}) => {
    const s = RB.state.newCampaign({ edition: o.edition == null ? 2 : o.edition });
    s.id = o.id || 'mp-test'; s.comp = o.comp === undefined ? 'ren' : o.comp;
    s.words = (o.words || ['mamoru', 'mizu', 'hikari', 'kaze', 'nawa', 'iyasu']).slice();
    for (const f of o.flags || []) s.flags[f] = true;
    RB.game.s = s;
    return s;
  };
  const wordsOf = (s) => s.words.map((w) => C.words[w]).filter(Boolean);
  const cardOf = (st, s, pred) => E.cards(st, s, wordsOf(s)).find(pred);
  const play = (st, s, card) => E.exchange(st, { card, res: OK, comp: null, target: st.cur }, { enemy: st.foes[0] && st.foes[0].def });
  const test = (s, cond) => RB.state.test(s, cond);
  const cmds = (id) => (C.scenes[id] ? C.scenes[id].cmds : []);
  const ops = (id) => cmds(id).map((c) => c.op + ':' + (c.args || []).join(' '));

  // ---- the edition --------------------------------------------------------------------------------------------------
  const mpMaps = Object.keys(C.maps).filter((id) => /^mp\./.test(id));
  t.ok(mpMaps.length >= 13 && mpMaps.every((id) => C.maps[id].edition === 2), 'Chapter 4\'s ' + mpMaps.length + ' maps are all the twelve-chapter edition\'s');
  const exit = C.maps['mb.exchange'].exits.find((e) => e.to === 'mp.blockprint');
  t.ok(exit && !test(camp({ flags: ['mb_arrived'] }), exit.if) && test(camp({ flags: ['mb1_done'] }), exit.if), 'Blockprint Row opens from the Exchange once Chapter 3 is over');
  t.ok(Object.keys(C.quests).filter((q) => /^mp_/.test(q)).every((q) => C.quests[q].chapter === 'mb2'), 'every Chapter 4 quest belongs to mb2');
  t.eq(C.quests.mp_main.stages.length, 7, 'the main story has seven steps');
  t.ok(ops('mp.chapter_end').includes('set:mb2_done') && ops('mp.chapter_end').includes('quest:mp_main done'), 'the chapter ends with mb2_done and the main story done');
  t.ok(ops('mp.arrive').includes('chapter:mb2'), 'arriving on Blockprint Row starts Chapter 4');

  // ---- the world after: the river road from Reedwake (F-40), the north road from Saltglass -------------------------
  const river = C.roads.find((r) => r.includes('reedwake') && r.includes('manybridge'));
  t.ok(river && river[2].edition === 2 && river[2].sea && river[2].if === 'mb2_done', 'the river road is on the chart, twelve-chapter journeys only, once the river is open');
  t.ok(river[2].ferry.every((id) => cmds(id).some((c) => c.op === 'warp')), 'the river boat goes both ways');
  const koji = C.maps['rw.tea'].npcs.find((n) => n.id === 'koji');
  const kojiFirst = (s) => (koji.talk.find((x) => !x.if || test(s, x.if)) || {}).scene;
  t.ok(kojiFirst(camp({ edition: 1, flags: ['rw_koji_back', 'post', 'mb2_done'] })) !== 'mp.river_koji', 'Kōji in a six-chapter journey: no boat down to Manybridge');
  t.eq(kojiFirst(camp({ flags: ['rw_koji_back', 'mb2_done'] })), 'mp.river_koji', 'after the Opening, his boat goes down to Manybridge');
  const north = C.maps['sg.road'].exits.find((e) => e.to === 'co.road');
  t.ok(!test(camp({ flags: ['ch2_done', 'mb1_done'] }), north.if) && test(camp({ flags: ['ch2_done', 'mb1_done', 'mb2_done'] }), north.if), 'the road north from Saltglass mends at the chapter\'s end');

  // ---- the Understage: each way on opens only by working its machine ------------------------------------------------
  const reach = (mapId, from, s) => {
    RB.game.s = s; RB.maps.invalidate();
    const m = RB.maps.compile(mapId);
    const seen = new Set([from.join(',')]), q = [from];
    const solid = (x, y) => RB.maps.blockedStatic(m, x, y) || (m.def.props || []).some((p) => p.p === 'crate' && p.if && test(s, p.if) && p.x === x && p.y === y);
    while (q.length) {
      const [x, y] = q.shift();
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy, k = nx + ',' + ny;
        if (seen.has(k) || nx < 0 || ny < 0 || nx >= m.w || ny >= m.h || solid(nx, ny)) continue;
        seen.add(k); q.push([nx, ny]);
      }
    }
    return (x, y) => [[0, 1], [0, -1], [1, 0], [-1, 0]].some(([dx, dy]) => seen.has((x + dx) + ',' + (y + dy)));
  };
  for (const [map, flag, tx, ty, what] of [['mp.under1', 'mp_u1_lift', 27, 15, 'the stairs down'], ['mp.under2', 'mp_u2_turned', 28, 18, 'the stairs down'], ['mp.under3', 'mp_u3_raised', 13, 17, 'the door to the bottom']]) {
    const before = reach(map, [3, 3], camp())(tx, ty), after = reach(map, [3, 3], camp({ flags: [flag] }))(tx, ty);
    t.ok(!before && after, map + ': ' + what + ' only once the machine is worked (' + flag + ')');
    const pr = (C.maps[map].props || []).filter((p) => p.scene && /(_go|book\d)$/.test(p.scene));
    t.ok(pr.length >= 2 && pr.every((p) => reach(map, [3, 3], camp())(p.x, p.y)), map + ': its page and its machine are within reach from the stairs');
  }

  // ---- the three procedures -----------------------------------------------------------------------------------------
  const runProc = (id, plan) => {
    const s = camp();
    const st = E.begin(id, s);
    const steps = [];
    for (const aid of plan) { const c = cardOf(st, s, (x) => x.kind === 'proc' && x.action.id === aid); if (!c) { steps.push('no:' + aid); continue; } play(st, s, c); steps.push(st.enc.proc.step); }
    return { st, steps };
  };
  {
    const ok = runProc('mp.lifts', ['lower_r', 'raise_l', 'wait']);
    t.ok(ok.st.over === 'win' && ok.st.enc.proc.done, 'the trap lifts: lower the right, raise the left, wait and unhook');
    const early = runProc('mp.lifts', ['lower_r', 'raise_l', 'now']);
    t.eq(early.st.enc.proc.step, 0, 'unhooking the weight while the lift still rises: the lift drops, start again');
    const rev = runProc('mp.revolve', ['east', 'load_turn', 'leave']);
    t.ok(rev.st.over === 'win', 'the revolve: half east, load and the other half, leave it');
    const back = runProc('mp.revolve', ['east', 'load_turn', 'back']);
    t.ok(!back.st.over && back.st.enc.proc.step === 2 && back.st.enc.proc.machine.turn === 'full', 'turning it back before the curtain: wound forward again, the way still open, the last step still to do');
    const w = runProc('mp.weights', ['first', 'half', 'leave']);
    t.ok(w.st.over === 'win', 'the weights: the first, then half its size, and not the third');
    const full = runProc('mp.weights', ['first', 'full']);
    t.eq(full.st.enc.proc.step, 0, 'a full-sized second weight jams the platform: start again');
    for (const id of ['mp.lifts', 'mp.revolve', 'mp.weights', 'mp.boss']) {
      const P = C.encounters[id].procedure;
      t.ok(P.steps.every((x) => ['F', 'E', 'I', 'A'].every((k) => x.task[k] && x.task[k].options.some((o) => o.ok))), id + ': every step has a language task at every profile');
      t.ok(P.steps.every((x) => x.actions.some((a) => a.ok) && x.actions.every((a) => a.means)), id + ': every step has its right action, and every action says what it means before it is done');
    }
  }
  // the boss: the cues in the page's order; the companion's stage cues; the names called back
  {
    const s = camp();
    const st = E.begin('mp.boss', s);
    t.ok(st.foes.length === 1 && st.foes[0].boss && st.enc.proc, 'the Lord of the Understage: a boss with a procedure');
    const pick = (aid) => cardOf(st, s, (c) => c.kind === 'proc' && c.action.id === aid);
    play(st, s, pick('lift'));
    play(st, s, pick('east'));
    t.ok(st.enc.proc.step === 1 && st.enc.proc.machine.revolve === 'east', 'the revolve the same way again: jammed, the lift stays up');
    play(st, s, pick('west'));
    play(st, s, pick('lead'));
    t.eq(st.enc.proc.machine.names, 'below', 'calling only the lead\'s name: the rest stay below');
    play(st, s, pick('roll'));
    t.ok(st.over === 'win' && st.enc.outcome === 'roll', 'the roll call: every name back on the stage');
    for (const comp of ['nao', 'mio', 'ren', 'suzu']) t.ok((C.encounters['mp.boss'].companion[comp] || []).length === 1, comp + ' has a stage cue of their own in the boss');
    t.ok(C.encounters['mp.boss'].conclusions.every((c) => c.flags && c.flags.mp_under_done), 'the boss\'s end sets mp_under_done');
    t.eq(RB.audio.battleSong(C.enemies['mp.naraku']), 'boss_understage', 'its own boss theme');
  }

  // ---- A Ghostwriter's Debt: every end reachable; both lasting ends say what they mean --------------------------
  {
    const reached = new Set(), seen = new Set();
    const explore = (plan, depth) => {
      const s2 = camp({ comp: 'suzu', words: ['hikari', 'mizu'] });
      const x = E.begin('mp.ghost', s2);
      for (const id of plan) { if (x.over) break; play(x, s2, cardOf(x, s2, (c) => c.id === id)); }
      if (x.over) { reached.add(x.enc.outcome); return; }
      const key = E.stateKey(x) + x.round;
      if (seen.has(key) || depth > 8) return;
      seen.add(key);
      for (const c of E.cards(x, s2, wordsOf(s2))) if (!c.disabled) explore(plan.concat([c.id]), depth + 1);
    };
    explore([], 0);
    t.eq(C.encounters['mp.ghost'].conclusions.map((c) => c.id).filter((id) => !reached.has(id)), [], 'every end of the ghostwriter\'s debt is reachable (' + [...reached].join(', ') + ')');
    const lasting = C.encounters['mp.ghost'].social.actions.filter((a) => a.lasting);
    t.ok(lasting.length === 2 && lasting.every((a) => a.means && a.when), 'the two lasting ends (broker, expose) each say what they mean, and need the manuscript\'s evidence first');
    t.ok(ops('mp.ghost_after').includes('quest:mp_ghost done'), 'either end finishes the quest');
  }

  // ---- the festival's plan follows what was said ---------------------------------------------------------------------
  {
    const results = (id) => new Set(Object.values(C.challenges[id].tiers).flat().flatMap((st) => st.families.map((f) => f.result)));
    for (const [scene, chal, prefix, def] of [['mp.prep_lanterns', 'mp.fest_lanterns', 'mp_lan_', 'mp_lan_bank'], ['mp.prep_stalls', 'mp.fest_stalls', 'mp_st_', 'mp_st_bank'], ['mp.prep_procession', 'mp.fest_procession', 'mp_proc_', 'mp_proc_drums']]) {
      const sets = cmds(scene).filter((c) => c.op === 'set' && c.if && /var\._forge=/.test(c.if)).map((c) => c.if.split('=')[1] + '>' + c.args[0]);
      const rs = [...results(chal)];
      const right = Object.values(C.challenges[chal].tiers).flat().flatMap((st) => st.families.filter((f) => f.ok).map((f) => f.result));
      t.ok(right.every((r) => sets.includes(r + '>' + prefix + r)), scene + ': every right plan becomes the festival\'s (' + sets.join(', ') + ')');
      t.ok(ops(scene).includes('set:' + def), scene + ': a plan that could not work falls back to a sensible one');
      t.ok(rs.length >= 3, chal + ': several ways to say it');
    }
    const props = C.maps['mp.playhouse'].props;
    for (const f of ['mp_lan_bank', 'mp_lan_theatre', 'mp_lan_bridge', 'mp_st_bank', 'mp_st_square']) t.ok(props.some((p) => p.if && p.if.split(/[&|]/).includes(f)), 'the night shows ' + f);
  }

  // ---- the fireworks: a bond event and a kept memory, whoever travels with you --------------------------------------
  {
    t.eq(C.company.bondEvents['fest:fireworks'], 1, 'the fireworks are a bond event (one point)');
    const fw = cmds('mp.fireworks');
    t.ok(fw.some((c) => c.op === 'hook' && c.args.join(' ') === 'co_bond fest:fireworks') && fw.some((c) => c.op === 'hook' && c.args.join(' ') === 'co_remember together fireworks'), 'the scene records the bond and keeps the memory');
    for (const comp of ['nao', 'mio', 'ren', 'suzu']) {
      t.ok(C.scenes['mp.fireworks'].labels[comp] != null && fw.some((c) => c.op === 'choice' && c.opts.some((o) => o.to && o.to.startsWith(comp + '_'))), comp + ': their own fireworks, with a reply to choose');
      t.ok(C.company.mem.fireworks.texts[comp] && C.company.mem.fireworks.keep[comp], comp + ': the memory\'s words and what they keep of it');
    }
    const s = camp({ comp: 'mio' });
    RB.company.award(s, 'fest:fireworks', 1);
    t.ok(!RB.company.award(s, 'fest:fireworks', 1), 'the bond event happens once');
  }

  // ---- festival dress, the games, the wanderers, the stamps, the music ----------------------------------------------
  {
    const s = camp({ flags: ['mp_yukata', 'mp_fest_night'] });
    RB.world.W.map = { id: 'mp.playhouse' };
    t.ok(RB.festDress.on(s), 'on the festival night, on Manybridge\'s festival maps: yukata');
    s.flags.mb2_done = true;
    t.ok(!RB.festDress.on(s), 'the next morning: everyone as before');
    RB.world.W.map = { id: 'rw.village' };
    delete s.flags.mb2_done;
    t.ok(!RB.festDress.on(s), 'anywhere else: never');
    RB.world.W.map = null;
  }
  t.eq(RB.festival.list().map((d) => d.id).sort(), ['katanuki', 'kuji', 'taiko', 'wanage', 'yoyo'], 'five festival games');
  t.ok(RB.festival.list().every((d) => RB.ui.festivalGames[d.ui || d.id] && typeof RB.ui.festivalGames[d.ui || d.id].start === 'function'), 'each game has its screen');
  t.ok(C.festival.kuji.words.every((w) => ['F', 'E', 'I', 'A'].every((k) => C.challenges[w.challenge].tiers[k][0].families.filter((f) => f.ok).length >= 2)), 'every lottery word has at least two right sentences at every profile');
  t.ok(C.festival.wanage.prizes.every((p) => p.easy.jp && p.full.jp), 'every prize has a description for each grade');
  const booths = ['mp.booth_yoyo', 'mp.booth_wanage', 'mp.booth_katanuki', 'mp.booth_kuji', 'mp.booth_taiko'];
  t.ok(booths.every((id) => C.maps['mp.festhall'].props.some((p) => p.scene === id) && C.maps['mp.playhouse'].props.some((p) => p.scene === id && /mp_fest_night/.test(p.if))), 'each game has a booth on the night and in the festival hall');
  const hall = C.maps['mp.playhouse'].structs.find((x) => x.to === 'mp.festhall');
  t.ok(hall && hall.locked && hall.unlock === 'mb2_done', 'the festival hall opens after the festival');
  for (const id of ['mp.wander_gonta', 'mp.wander_hayashi']) t.ok(C.encounters[id].actors.some((a) => a.side === 'guest' && a.agenda), id + ': a guest with an aim of their own');
  t.ok(C.stamps['ch.mb2'] && C.stamps['side.mb2'] && C.stamps['ch.mb2'].stand === 'manybridge', 'the chapter\'s stamps, at the city\'s stand');
  t.ok(test(camp({ flags: ['mb2_done'] }), C.stamps['ch.mb2'].when) && !test(camp({ edition: 1, flags: ['mb2_done'] }), C.stamps['ch.mb2'].when), 'the chapter stamp: twelve-chapter journeys, once the chapter is over');
  for (const song of ['playhouse', 'understage', 'festival', 'fireworks', 'boss_understage']) t.ok(!!RB.audio._.songDefs[song], 'song: ' + song);
  t.ok(ops('mp.ikutsuka').includes('set:mod_ikutsuka') && ops('mp.ikutsuka').includes('teach:mod_ikutsuka'), 'C-74: Unravel reaches two (いくつか), taught after the crowded fights');
  t.ok(C.maps['mp.under3'].onEnter.some((e) => e.scene === 'mp.ikutsuka'), 'the growth comes at the top of the weight well, after the revolve\'s crowded fights');

  // ---- the double act, the side stories, the seeds, the world after -------------------------------------------------
  for (const id of ['mp.manzai_1', 'mp.manzai_2', 'mp.manzai_3']) {
    const tiers = C.challenges[id].tiers;
    t.ok(tiers.F[0].options.length === 2 && tiers.E[0].options.length === 2 && tiers.I[0].options.length === 3 && tiers.A[0].options.length === 3, id + ': two retorts to choose from at F and E, three at I and A');
    t.ok(['F', 'E', 'I', 'A'].every((k) => tiers[k][0].options.filter((o) => o.ok).length === 1 && tiers[k][0].options.every((o) => o.ok || (o.why && o.why.en))), id + ': one right retort, and every near miss says why');
  }
  const mz = cmds('mp.manzai');
  t.ok(mz.filter((c) => c.op === 'challenge').length === 3 && ['comp=suzu', 'comp!=suzu'].every((w) => mz.filter((c) => c.op === 'say' && c.if === w && c.who !== 'narr').length >= 4), 'the double act: three bits, Suzu the funny one in her journeys and Genta in the others');
  t.ok(!mz.some((c) => c.op === 'give' || c.op === 'gold' || c.op === 'xp'), 'the double act gives nothing: the audience reacts, nothing is scored');
  const onMap = (id) => Object.keys(C.maps).filter((m) => /^m[bp]\./.test(m) && JSON.stringify([C.maps[m].props, C.maps[m].npcs, C.maps[m].onEnter]).includes('"' + id + '"'));
  const doneBy = (q) => Object.keys(C.scenes).filter((id) => cmds(id).some((c) => c.op === 'quest' && c.args[0] === q && c.args[1] === 'done'));
  for (const q of ['mp_census', 'mp_apprentice', 'mp_actor', 'mp_ghost', 'mp_fest_extra']) t.ok(doneBy(q).length >= 1, q + ': the side story has its end (' + doneBy(q).join(', ') + ')');
  for (const id of ['mp.plaque_hangi', 'mp.plaque_sumi', 'mp.plaque_maku']) t.ok(onMap(id).length === 1, 'the census, continued: ' + id + ' on ' + onMap(id).join(', '));
  const seeds = { suzu: ['mp.stagedoor', 'mp_ev_koume'], mio: ['mp.tonic_bill', 'mp_ev_tonic'], nao: ['mp.hayate', 'mp_ev_hayate'], ren: ['mp.sobe_printed', 'mp_ev_slips'] };
  for (const comp in seeds) {
    const [id, flag] = seeds[comp];
    t.ok(cmds(id).some((c) => c.op === 'set' && c.args[0] === flag && (!c.if || c.if === 'comp=' + comp)), comp + '\'s seed in Chapter 4: ' + id + ' (' + flag + ')');
  }
  for (const [scene, note, map] of [['mp.oldest_block', 'mp_oldest_block', 'mp.workshop'], ['mp.oldest_play', 'mp_hyakumonogatari', 'mp.theatre']]) {
    t.ok(ops(scene).includes('note:' + note) && C.notes[note] && onMap(scene).includes(map), 'the folklore seed ' + scene + ': in ' + map + ', with its notebook page');
  }
  t.ok(C.notes.mp_oldest_block.fiction === true && C.notes.mp_hyakumonogatari.fiction === false && /game's own/.test(C.notes.mp_hyakumonogatari.en), 'the oldest block is the game\'s own; the Hundred Tales is labelled real, its keepers\' version the game\'s own');
  for (const id of ['mp.manbe_after', 'mp.genta_after', 'mp.tomi_hall', 'mp.shinobu_after', 'mp.miyo_after', 'mp.saku_after']) t.ok(onMap(id).length >= 1, 'the world after: ' + id + ' (' + onMap(id).join(', ') + ')');
};
