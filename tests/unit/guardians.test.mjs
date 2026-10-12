// The old guardians (expansion P15e; plan 03_ENCOUNTERS.md E16, sealed S7; docs/future/work/P15_POSTGAME.md), with
// synthetic campaigns only: the scenes played through the real scene runner with the dialogue stubbed, the encounters
// through the real encounter platform (src/engine/97_encounter.js) and the whole-game driver's player model.
//  - nine, one per region, none of them Kasane; each built round one family (conditions, arrivals, a procedure, an
//    argument), every family used, no padded health;
//  - the shrines: on their maps only after the story (twelve-chapter edition), on free tiles reachable from the way in;
//  - each encounter won by the automated player at every tactical setting; conversations ended the other way too; a
//    procedure's wrong action shown and not taken, and the steps done kept after stepping back (retries keep the
//    learning); every language task at four profiles with one right answer; help offered after a defeat;
//  - the scenes: wake, "not now", a fall (nothing given), a win (the honest record on the stamp, the keepsake once),
//    afterwards quiet; the stamp book's note; the travel volume's pages revealable (viewable, never witnessed).
import fs from 'node:fs';
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state, E = RB.encounter;
  const KEYS = ['rw', 'sg', 'co', 'sb', 'lf', 'mb', 'cr', 'yn', 'ko'];
  const OK = { ok: true, firstTry: true, mistakes: 0 };

  // ---- a minimal stage ----------------------------------------------------------------------------------------------
  let lines = [], encs = [], encRes = () => ({ result: 'win', outcome: null }), choice = 0;
  RB.ui.dialogue.say = async (l) => { lines.push({ who: l.who, jp: l.jp || '', en: l.en || '' }); };
  RB.ui.dialogue.choose = async () => choice;
  RB.ui.dialogue.hide = () => {};
  RB.ui.toast = async () => {};
  RB.ui.notice = () => {};
  RB.ui.shake = () => {};
  RB.ui.fade = async () => {};
  for (const k of ['ensureSpeaker', 'dismissExtras', 'refreshActors']) RB.world[k] = () => {};
  RB.world.whenArrived = async () => {};
  RB.world.emote = () => {};
  RB.game.afterScene = () => {};
  RB.world.W = RB.world.W || {};
  RB.game.inBattle = () => false;
  RB.game.startEncounter = async (id) => { encs.push(id); return encRes(id); };
  RB.save.autosave = async () => {};
  RB.challenge.run = async () => ({ ok: true });
  const ALL = Object.keys(C.words);
  const fresh = (o = {}) => {
    const s = S.newCampaign({ edition: o.edition || 2 });
    s.id = 'guardians-test'; s.map = 'rw.mill1'; s.comp = o.comp === undefined ? 'mio' : o.comp;
    s.player.name = 'Haru'; s.player.nameJp = 'ハル';
    s.learn.profile = o.profile || 'E';
    s.learn.difficulty = o.diff || 'normal';
    if (!o.story) Object.assign(s.flags, { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_done: true, cr_done: true, yn_done: true, ch6_done: true, postgame: true, ngp_offered: true });
    s.words = ALL.slice();
    s.vars = {};
    RB.game.G.s = s;
    RB.world.W.map = { id: s.map };
    return s;
  };
  const run = async (id, o = {}) => { lines = []; encs = []; choice = o.choice || 0; if (o.enc) encRes = o.enc; await RB.script.run(id); return lines; };
  const has = (re) => lines.some((l) => re.test(l.en) || re.test(l.jp));
  const wordsOf = (s) => s.words.map((w) => C.words[w]).filter(Boolean);
  const one = (task) => ['F', 'E', 'I', 'A'].every((p) => task && task[p] && task[p].options.filter((o) => o.ok).length === 1 && task[p].options.every((o) => o.ok || o.why));

  // ---- nine guardians, one family each --------------------------------------------------------------------------------
  const D = KEYS.map((k) => ({ k, d: C.encounters['gd.' + k] }));
  t.ok(D.every(({ k, d }) => d && d.story && d.guardian === k), 'nine guardian encounters, one per region (' + KEYS.join(' ') + '), each a story encounter (defeats counted for help)');
  const lead = (d) => C.enemies[d.lead.enemy];
  t.ok(D.every(({ d }) => lead(d) && lead(d).boss && lead(d).guardian && lead(d).edition === 2), 'each led by its own guardian, of the twelve-chapter edition');
  t.ok(D.every(({ d }) => !/kasane|sa\./i.test(d.lead.enemy) && !/Kasane/.test(JSON.stringify(lead(d).name))), 'Kasane is never one of them (S7)');
  const family = (d) => (d.kind === 'social' ? 'argument' : d.procedure ? 'procedure' : (d.arrivals || d.calls) ? 'arrivals' : d.rules && d.rules.conditions && (d.lead.conditions || []).length ? 'conditions' : '?');
  const fams = Object.fromEntries(D.map(({ k, d }) => [k, family(d)]));
  t.eq(fams, { rw: 'procedure', sg: 'argument', co: 'conditions', sb: 'arrivals', lf: 'argument', mb: 'argument', cr: 'arrivals', yn: 'conditions', ko: 'procedure' }, 'each built round one family: two of conditions, two of arrivals, two procedures, three arguments');
  t.ok(D.every(({ d }) => lead(d).knots <= 5) && Math.max(...D.map(({ d }) => lead(d).knots)) < C.enemies['sa.hush'].knots, 'no padded health: every guardian has fewer knots than the final boss, five at most');
  t.ok(['co', 'yn'].every((k) => C.encounters['gd.' + k].help && C.encounters['gd.' + k].help.explain) && D.every(({ d }) => d.kind === 'social' || (d.help && d.help.suggest)), 'every fight explains its mechanic when help is asked for');

  // ---- the language: four profiles, one right answer, every wrong one explained -------------------------------------
  for (const id of ['gd.firstfire', 'gd.sisterstar', 'gd.kettlemother']) t.ok(one(C.enemies[id].intents.plea.answer) && ['F', 'E', 'I', 'A'].every((p) => C.enemies[id].intents.plea.text[p]), id + ': its plea at four profiles, one right answer');
  t.ok(one(C.enemies['gd.oxelder'].intents.lie.truth), 'gd.oxelder: its false report at four profiles, one true answer');
  for (const k of ['rw', 'ko']) {
    const P = C.encounters['gd.' + k].procedure;
    t.ok(P.restart === 'stable' && P.steps.every((st) => st.stable && one(st.task) && st.actions.filter((a) => a.ok).length === 1 && st.actions.some((a) => !a.ok && a.wrong)), 'gd.' + k + ': every step stable, read at four profiles, one right action and a wrong one shown');
  }
  for (const k of ['sg', 'lf', 'mb']) {
    const d = C.encounters['gd.' + k];
    t.ok(d.social.actions.every((a) => one(a.task)) && d.social.unravelTip && ['nao', 'mio', 'ren', 'suzu'].every((c) => (d.social.companion[c] || []).length), 'gd.' + k + ': every line at four profiles, Unravel explained away, each companion with a way in');
    t.ok(d.conclusions.every((c) => c.result !== 'lose') && d.conclusions.some((c) => c.result === 'end') && d.social.actions.some((a) => a.lasting), 'gd.' + k + ': no end is a defeat; a blunt word ends it another way');
  }

  // ---- every one won by the automated player, at every setting ---------------------------------------------------------
  RB.test.enable({ battle: 'smart' });
  const game = RB.game;
  for (const diff of ['relaxed', 'normal', 'hard']) for (const comp of ['mio', 'ren']) {
    const res = {};
    for (const k of KEYS) {
      const s = fresh({ diff, comp });
      RB.game = { s, G: game.G };
      res[k] = RB.test.encounter('gd.' + k);
      RB.game = game;
    }
    t.eq(Object.keys(res).filter((k) => res[k] !== 'win'), [], 'all nine settle for the automated player, ' + diff + ' with ' + comp + ' (' + KEYS.map((k) => k + ':' + res[k]).join(' ') + ')');
  }
  t.eq(RB.test.problems.filter((p) => /gd\./.test(p.where)), [], 'and nothing the driver met was missing or unanswerable');
  RB.test.disable();

  // ---- conversations: the blunt word ends it, and you can come back -----------------------------------------------------
  for (const k of ['sg', 'lf', 'mb']) {
    const s = fresh();
    const st = E.begin('gd.' + k, s);
    const blunt = E.cards(st, s, wordsOf(s)).find((c) => c.kind === 'social' && c.action.lasting);
    E.exchange(st, { card: blunt, res: OK, comp: null, target: st.cur }, { enemy: st.foes[0] && st.foes[0].def });
    t.ok(st.over === 'end' && st.enc.outcome === 'left', 'gd.' + k + ': told bluntly, it goes away (an end, not a defeat)');
    const st2 = E.begin('gd.' + k, s);
    t.ok(!st2.over && E.cards(st2, s, wordsOf(s)).some((c) => c.kind === 'social' && !c.disabled), 'and it will talk again next time');
  }

  // ---- procedures: a wrong action is shown, not taken; steps done are kept after stepping back ---------------------------
  for (const k of ['rw', 'ko']) {
    const s = fresh();
    const st = E.begin('gd.' + k, s);
    const proc = () => E.cards(st, s, wordsOf(s)).filter((c) => c.kind === 'proc');
    const bad = proc().find((c) => !c.action.ok);
    E.exchange(st, { card: bad, res: OK, comp: null, target: st.cur }, { enemy: st.foes[0] && st.foes[0].def });
    t.ok(st.enc.proc.step === 0, 'gd.' + k + ': a wrong action is put right on the spot (still the first step)');
    for (let i = 0; i < 2 && !st.over; i++) E.exchange(st, { card: proc().find((c) => c.action.ok), res: OK, comp: null, target: st.cur }, { enemy: st.foes[0] && st.foes[0].def });
    const at = st.enc.proc.step;
    E.finishEncounter(st, s, 'flee');
    const st2 = E.begin('gd.' + k, s);
    t.ok(at === 2 && st2.enc.proc.step === 2, 'gd.' + k + ': stepping back keeps the two steps done (retries keep the learning)');
  }

  // ---- help after a defeat (E19) ---------------------------------------------------------------------------------------------
  {
    const s = fresh();
    const st = E.begin('gd.co', s);
    E.finishEncounter(st, s, 'lose');
    t.ok(E.helpOffer(s, C.encounters['gd.co']) === 1, 'beaten once by the First Fire, your companion offers to explain');
  }

  // ---- the shrines ------------------------------------------------------------------------------------------------------------
  const shrine = (k) => { for (const id in C.maps) for (const p of C.maps[id].props || []) if (p.scene === 'gd.' + k) return { map: id, p }; return null; };
  t.ok(KEYS.every((k) => shrine(k) && shrine(k).p.if === 'ed>=2&postgame'), 'a shrine for each in its region, there only after the story in a twelve-chapter journey');
  const REG = { rw: /^rw\./, sg: /^sg\./, co: /^co\./, sb: /^sb\./, lf: /^lf\./, mb: /^mb\./, cr: /^cr\./, yn: /^yn\./, ko: /^ko\./ };
  t.ok(KEYS.every((k) => REG[k].test(shrine(k).map)), 'each in its own region (' + KEYS.map((k) => shrine(k).map).join(', ') + ')');
  {
    const ed1 = fresh({ edition: 1 }), mid = fresh({ story: true }), post = fresh();
    t.ok(KEYS.every((k) => !S.test(ed1, shrine(k).p.if) && !S.test(mid, shrine(k).p.if) && S.test(post, shrine(k).p.if)), 'hidden in a six-chapter journey and during the story; there in the postgame');
    for (const k of KEYS) {
      const { map, p } = shrine(k);
      RB.game.G.s = post; RB.game.s = post;
      RB.maps.invalidate();
      const m = RB.maps.compile(map), def = C.maps[map];
      const sp = def.spawn && (def.spawn.default || Object.values(def.spawn)[0]);
      const seen = new Set([sp[0] + ',' + sp[1]]), stack = [[sp[0], sp[1]]];
      while (stack.length) { const [x, y] = stack.pop(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, key = nx + ',' + ny; if (seen.has(key) || RB.maps.blockedStatic(m, nx, ny)) continue; seen.add(key); stack.push([nx, ny]); } }
      const near = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => seen.has((p.x + dx) + ',' + (p.y + dy)));
      const others = (def.props || []).filter((q) => q !== p && (!q.if || S.test(post, q.if)) && q.x === p.x && q.y === p.y);
      t.ok(near && !others.length && !(def.npcs || []).some((n) => n.x === p.x && n.y === p.y), 'gd.' + k + ': its shrine at ' + map + ' (' + p.x + ',' + p.y + ') is free and reachable from the way in');
    }
  }

  // ---- the scenes ----------------------------------------------------------------------------------------------------------------
  {
    const s = fresh({ comp: 'suzu' });
    await run('gd.co', { choice: 1 });
    t.ok(s.flags.gd_co_met && !encs.length && !s.flags['gd.co'] && has(/will wait/), 'first touch: the First Fire wakes; "Not now" costs nothing');
    t.ok(lines.some((l) => l.who === 'suzu' && /stagehands/.test(l.en)), 'and the companion has something to say (Suzu, here)');
    await run('gd.co', { choice: 0, enc: () => ({ result: 'lose' }) });
    t.ok(encs[0] === 'gd.co' && !s.flags['gd.co'] && !s.inv.gd_co_keepsake && s.vars.gd_co_n === 1 && has(/still awake/), 'beaten: nothing given, the meeting counted');
    await run('gd.co', { choice: 0, enc: () => ({ result: 'win', outcome: 'settled' }) });
    const rec = s.records.stamps['gd.co'];
    t.ok(s.flags['gd.co'] && s.inv.gd_co_keepsake === 1 && rec && rec.tries === 2 && rec.tactics === 'normal', 'settled on the second meeting: the stamp pressed with the honest record (2 meetings, Standard) and the keepsake given');
    t.eq(RB.guardians.noteOf(rec), 'Settled on your second meeting, on Standard.', 'the stamp book says so plainly');
    await run('gd.co');
    t.ok(!encs.length && s.inv.gd_co_keepsake === 1 && has(/embers glow quietly/), 'afterwards the shrine is quiet; the keepsake is given once');
    const s2 = fresh({ diff: 'relaxed', comp: null });
    await run('gd.sg', { choice: 0, enc: () => ({ result: 'win', outcome: 'approved' }) });
    t.ok(s2.records.stamps['gd.sg'].tries === 1 && RB.guardians.noteOf(s2.records.stamps['gd.sg']) === 'Settled the first time you faced it, on Relaxed.' && has(/no reason to run/), 'alone, settled the first time on Relaxed: said just as plainly');
    const s3 = fresh();
    await run('gd.lf', { choice: 0, enc: () => ({ result: 'end', outcome: 'left' }) });
    t.ok(!s3.flags['gd.lf'] && has(/not satisfied yet/), 'a conversation that ends another way gives nothing, and the Maker can be met again');
  }

  // ---- records ---------------------------------------------------------------------------------------------------------------------
  t.ok(KEYS.every((k) => { const st = C.stamps['gd.' + k]; return st && st.family === 'guardian' && st.hidden && st.stand === null && st.when === 'ed>=2&gd.' + k; }), 'a hidden stamp for each, in the guardians\' own family, pressed where it settles');
  t.eq(new Set(KEYS.map((k) => C.stamps['gd.' + k].design.motif)).size, 9, 'nine different stamp pictures');
  {
    const s = fresh();
    t.ok(RB.stampBook.book(s).filter((x) => x.d.family === 'guardian').every((x) => x.veiled), 'in the stamp book, veiled until won');
    t.ok(!RB.stampBook.earned(fresh({ edition: 1 }), 'gd.rw'), 'never in a six-chapter journey');
  }
  const ACC = ['cap', 'glasses', 'scarf', 'earrings', 'bell', 'headband', 'cape', 'hood', 'leaf'];
  t.ok(KEYS.every((k, i) => { const it = C.items['gd_' + k + '_keepsake']; return it && it.slot === 'cosmetic' && it.acc === ACC[i] && /changes only how you look/.test(it.desc); }), 'nine keepsakes, each a different thing to wear, cosmetic only (C-53)');
  {
    const s = fresh();
    const pg = RB.volume.page('gd.mb');
    t.ok(pg && pg.special && pg.seq === 'gd.mb' && RB.sequence.get(pg.seq) && !RB.volume.viewable(s, pg) && !RB.volume.witnessed(s, pg), 'the Bridge Founder\'s page: painted, veiled before it settles');
    RB.volume.revealSpecial(s, 'gd.mb');
    t.ok(RB.volume.viewable(s, pg) && !RB.volume.witnessed(s, pg), 'revealed by confirmation without winning: viewable, never witnessed (H1)');
    s.flags['gd.mb'] = true;
    t.ok(RB.volume.witnessed(s, pg), 'settled: witnessed');
    t.eq(KEYS.filter((k) => RB.volume.page('gd.' + k)).length, 9, 'nine pages, one per guardian');
  }
  t.ok(/\['guardian', 'Old guardians', '\{古\|ふる\}い \{守\|まも\}り\{手\|て\}'\]/.test(fs.readFileSync(new URL('../../src/ui/66c_records.js', import.meta.url), 'utf8')), 'the stamp book has a heading for them, in both languages');
};
