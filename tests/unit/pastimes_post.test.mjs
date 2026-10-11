// The pastimes after the story (expansion P15g; sealed S9, F-82), with synthetic campaigns only: the scenes played
// through the real scene runner with the dialogue stubbed.
//  - shogi's two places: Snowbell's abandoned game, a mate-in-one puzzle at its place (the inn's table reads as before
//    in a six-chapter journey and during the story); the hill bench, where Isamu, home again, plays Fuku every
//    morning, and either of them will play you.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state;

  // ---- a minimal stage ----------------------------------------------------------------------------------------------
  let lines = [], choice = 0, hooks = [];
  RB.ui.dialogue.say = async (l) => { lines.push({ who: l.who, jp: l.jp || '', en: l.en || '' }); };
  RB.ui.dialogue.choose = async () => choice;
  RB.ui.dialogue.hide = () => {};
  RB.ui.toast = async () => {};
  RB.ui.notice = () => {};
  RB.ui.fade = async () => {};
  for (const k of ['ensureSpeaker', 'dismissExtras', 'refreshActors']) RB.world[k] = () => {};
  RB.world.whenArrived = async () => {};
  RB.world.emote = () => {};
  RB.game.afterScene = () => {};
  RB.world.W = RB.world.W || {};
  if (RB.staging) RB.staging.walkTo = async () => {};
  for (const h of ['pt_play', 'pt_tsume', 'pt_fuku_bench']) RB.hooks[h] = async (a) => { hooks.push(h + ' ' + a.join(' ')); };
  const DONE = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_done: true, cr_done: true, yn_done: true, ch6_done: true };
  const fresh = (o = {}) => {
    const s = S.newCampaign({ edition: o.edition || 2 });
    s.id = 'pastimes-post-test'; s.map = o.map || 'sg.harbor'; s.comp = o.comp === undefined ? 'mio' : o.comp;
    s.player.name = 'Haru'; s.player.nameJp = 'ハル';
    s.learn.profile = o.profile || 'E';
    Object.assign(s.flags, DONE, o.story ? {} : { postgame: true }, o.flags || {});
    if (o.story) delete s.flags.ch6_done;
    if (o.seaglass) s.quests.sg_seaglass = { stage: 9, done: true };
    s.vars = {};
    RB.game.G.s = s; RB.game.s = s;
    RB.world.W.map = { id: s.map };
    return s;
  };
  const run = async (id, o = {}) => { lines = []; hooks = []; choice = o.choice || 0; await RB.script.run(id); return lines.map((l) => l.jp).join('|'); };
  const has = (re) => lines.some((l) => re.test(l.en) || re.test(l.jp));
  const here = (s, map) => (C.maps[map].npcs || []).filter((n) => !n.if || S.test(s, n.if));

  // ---- Snowbell's abandoned game -----------------------------------------------------------------------------------------
  {
    const tz = C.shogi.tsume.find((x) => x.id === 'sb_inn');
    t.ok(tz && tz.place === 'sb.inn' && tz.hand.G === 1 && C.maps['sb.inn'].props.some((p) => p.scene === 'pt.sb_inn_table'), 'the inn\'s abandoned game is a puzzle at its place: the gold off the board in your hand');
    const sp = RB.shogi, g = sp.newGame(tz.size);
    g.b = tz.board.map((r) => [...r].map((ch) => (ch === '.' ? null : { t: ch.toUpperCase(), s: ch === ch.toUpperCase() ? 0 : 1, p: false })));
    g.h = [Object.assign({}, tz.hand), {}]; g.turn = 0; g.hist = [];
    const m = sp.mateIn(g, 1);
    t.ok(m && m.drop === 'G' && m.to[0] === 1 && m.to[1] === 4, 'and the mate is the gold dropped in front of the king');
    t.ok(!sp.inCheck(g, 0) && !sp.inCheck(g, 1), 'a quiet position: nobody in check before the move');
    fresh({ edition: 1, map: 'sb.inn' });
    const before = await run('sb.inn_table');
    t.eq(await run('pt.sb_inn_table'), before, 'in a six-chapter journey the table reads exactly as before');
    fresh({ story: true, map: 'sb.inn' });
    t.eq(await run('pt.sb_inn_table'), before, 'and during the story');
    fresh({ map: 'sb.inn' });
    await run('pt.sb_inn_table', { choice: 0 });
    t.ok(has(/mate on the next move/) && hooks[0] === 'pt_tsume sb_inn', 'after the story: a guest\'s last words, and the board to finish');
    await run('pt.sb_inn_table', { choice: 1 });
    t.ok(!hooks.length && has(/waiting for someone/), 'or left be');
    fresh({ map: 'sb.inn', flags: { pt_tsume_sb_inn: true } });
    await run('pt.sb_inn_table');
    t.ok(!hooks.length && has(/wasn't lying/), 'once finished, the gold stands before the king');
  }

  // ---- the hill bench ----------------------------------------------------------------------------------------------------
  {
    const bench = C.maps['sg.harbor'].props.find((p) => p.x === 40 && p.y === 8);
    t.ok(bench && bench.scene === 'pt.bench', 'the bench, wrapped');
    for (const o of [{ edition: 1, seaglass: true, flags: { sa_isamu_done: true } }, { story: true, seaglass: true, flags: { sa_isamu_done: true } }, { seaglass: true }, { flags: { sa_isamu_done: true } }]) {
      const s = fresh(o);
      const want = await run('sg.bench_fuku');
      const h0 = hooks.slice();
      t.ok((await run('pt.bench')) === want && hooks.join() === h0.join() && !here(s, 'sg.harbor').some((n) => n.char === 'sa_isamu'), 'the bench as before, Isamu not there: ' + JSON.stringify(o));
    }
    const s = fresh({ seaglass: true, flags: { sa_isamu_done: true } });
    t.ok(here(s, 'sg.harbor').some((n) => n.char === 'sa_isamu' && n.talk === 'pt.bench_two'), 'after the story, Isamu home and Fuku\'s nameplate back: Isamu at the bench');
    await run('pt.bench', { choice: 0 });
    t.ok(has(/haven't won one yet/) && has(/back on the board/) && hooks[0] === 'pt_play shogi sa_isamu', 'they play every morning (he has not won yet); you can play Isamu');
    await run('pt.bench_two', { choice: 1 });
    t.eq(hooks, ['pt_play shogi fuku'], 'or Fuku');
    await run('pt.bench_two', { choice: 2 });
    t.ok(!hooks.length && has(/Fuku wins/), 'or just watch');
    t.ok(C.chars.sa_isamu && C.chars.sa_isamu.name.en === 'Isamu', 'the board names him as your partner');
  }
};
