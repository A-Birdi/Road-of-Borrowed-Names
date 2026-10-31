// Three Tellings of the Fox Bridge (kr_fox; Cloud CC-386, CC-387; Local CL-539, CL-540, CL-541; Agnes 6541203705): its
// third clue, the hamlet's register (kr.record), was never shown by anything, so Shōzō's comparison was never offered
// and the quest could not be finished in any chapter; and once the chapter was over his list went straight to his
// after-chapter line, which spoke of the new board whether or not it had been decided. On the real runner, entering
// through Shōzō's own talk list (as talkTo picks it, src/engine/50_world.js):
//  1. who answers: before meeting him, his first meeting; an open quest, his comparison scene, before and after the
//     chapter; a finished quest, or one never begun, after the chapter: his after-chapter line;
//  2. the register: asked for once, read, and not offered again; "Later" leaves it unread and it is offered again;
//  3. the register first, with each other clue missing: no comparison yet (Kame's story and the shrine's board are still
//     needed); the register's own clue for the fox lantern is set;
//  4. with every clue, the register read on the same visit: the clues checked again at once and the comparison
//     offered; done once, with its board, its flag and one completion;
//  5. the comparison put off, then a reading that does not hold, then one that does: open, open, done;
//  6. each supported reading: its own line, the same board, done;
//  7. after the chapter with the quest open: the comparison, done; after it, his line with the board;
//  8. done, then asked again (before and after the chapter): no second completion;
//  9. after the chapter, never begun: only the line's second sentence, never the board;
// 10. the guide: with Kame's story and the shrine's board in, Shōzō is next, before and after the chapter;
// 11. and no talk ended on an error from the runner (each one's error is kept, so a failing run says where: Agnes
//     6541614189).
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state, G = RB.questGuide, T = RB.tellings;
  const shozo = C.maps['kr.fox'].npcs.find((n) => n.id === 'kr_shozo');
  const flat = (x) => JSON.stringify(x);

  // the runner, with the screen stood in for: what is said, what is offered, what is chosen
  let said = [], offered = [], picks = [], toasts = [], readings = [];
  RB.ui.dialogue.say = async (o) => { said.push(o && o.en); };
  RB.ui.dialogue.choose = async (opts) => {
    offered.push(opts.map((o) => o.en));
    const want = picks.shift();
    const i = want == null ? -1 : opts.findIndex((o) => o.en === want);
    if (i < 0) throw new Error('no option ' + flat(want) + ' among ' + flat(opts.map((o) => o.en)));
    return i;
  };
  RB.ui.dialogue.hide = () => {};
  RB.ui.toast = async (o) => { toasts.push(o.kind + ':' + o.en); };
  RB.ui.shake = () => {};
  RB.challenge.run = async () => ({ ok: true });
  for (const k of ['dismissExtras', 'refreshActors']) RB.world[k] = () => {};
  RB.game.afterScene = () => {};
  RB.save.autosave = async () => {};
  // the tellings sheet, stood in for as the real hook does it (src/ui/89k_tellings.js): a reading judged and kept
  RB.hooks.tellings = async (a) => {
    const s = RB.game.s, d = T.def(a[0]), pick = readings.shift();
    if (pick === 'cancel') { s.vars._tell = 'cancel'; return; }
    const r = T.judge(d, pick);
    T.keep(s, a[0], r);
    s.vars._tell = r.ok ? (r.best ? 'best' : 'ok') : 'no';
  };

  const camp = (o = {}) => {
    G.reset();
    const s = S.newCampaign({ edition: 2 }); s.comp = 'nao'; s.map = 'kr.fox'; s.x = 5; s.y = 10;
    Object.assign(s.flags, { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_arrived: true, kr_fox_seen: true }, o.flags || {});
    if (o.met) { s.flags.kr_shozo_met = true; s.quests.kr_fox = { stage: 0, done: false, t: 1 }; }
    if (o.kame) s.seen['kr.kame'] = true;
    if (o.shrine) s.seen['kr.fox_shrine'] = true;
    RB.game.G.s = s; RB.game.s = s;
    return s;
  };
  const talkScene = (s) => (shozo.talk.find((x) => !x.if || S.test(s, x.if)) || {}).scene;
  const errors = [];
  const talk = async (s, choose = [], tell = []) => {
    said = []; offered = []; picks = choose.slice(); readings = tell.slice();
    const scene = talkScene(s);
    let error = null;
    // (an option asked for that is not there ends the talk here: the check that follows says what was offered)
    try { await RB.script.run(scene, { npc: 'kr_shozo' }); } catch (e) { error = String(e && e.message || e); errors.push(scene + ': ' + error); }
    return { scene, said: said.slice(), offered: offered.slice(), left: picks.length, error };
  };
  const REG = 'Ask to see the hamlet\'s register.', CMP = 'Compare the tellings.', LATER = 'Later.';
  const BOARD = 'The bridge lantern glows fox-brown, and the new board can be read by it. People come out at night just to look at the bridge.';
  const NIGHT = 'People come out at night just to look at the bridge.';
  const done = (s) => !!(s.quests.kr_fox && s.quests.kr_fox.done);
  const DONE = 'quest_done:Three Tellings of the Fox Bridge';

  // ---- 1. who answers
  t.eq([talkScene(camp()), talkScene(camp({ met: true })), talkScene(camp({ met: true, flags: { kr_done: true } })),
    talkScene(camp({ flags: { kr_done: true } }))],
  ['kr.shozo_first', 'kr.shozo_idle', 'kr.shozo_idle', 'kr.shozo_after'],
  '1 his first meeting; an open quest\'s comparison, before and after the chapter; never begun, his after-chapter line');

  // ---- 2. the register: asked for once; "Later" leaves it
  {
    const s = camp({ met: true });
    const a = await talk(s, [LATER]);
    const b = await talk(s, [REG]);
    const c = await talk(s, []);
    t.ok(flat(a.offered) === flat([[REG, LATER]]) && !a.said.some((l) => /register\. On the page/.test(l || '')) &&
      flat(b.offered) === flat([[REG, LATER]]) && s.flags.kr_record_read && s.seen['kr.record'] && !c.offered.length,
    '2 the register: "Later" leaves it unread and it is offered again; read once, it is not offered again (' + flat({ a: a.offered, b: b.offered, c: c.offered }) + ')');
  }

  // ---- 3. the register first, each other clue missing
  for (const [label, o] of [['neither', {}], ['no shrine', { kame: true }], ['no Kame', { shrine: true }]]) {
    const s = camp(Object.assign({ met: true }, o));
    const r = await talk(s, [REG]);
    t.ok(flat(r.offered) === flat([[REG, LATER]]) && s.flags.kr_record_read && s.flags.kr_clue_fox && !done(s) && r.left === 0,
      '3 the register first (' + label + '): read, its fox-lantern clue set, no comparison yet (' + flat({ offered: r.offered, clue: !!s.flags.kr_clue_fox }) + ')');
  }

  // ---- 4. every clue, the register read on the same visit: the comparison at once; done once
  {
    const s = camp({ met: true, kame: true, shrine: true });
    toasts = [];
    const r = await talk(s, [REG, CMP], ['both']);
    t.ok(flat(r.offered) === flat([[REG, LATER], [CMP, LATER]]) && done(s) && s.flags.kr_fox_board && s.flags.kr_fox_done && toasts.filter((x) => x === DONE).length === 1,
      '4 the register, then the clues checked again at once: the comparison, done once, with its board (' + flat({ offered: r.offered, q: s.quests.kr_fox, toasts }) + ')');
  }

  // ---- 5. put off, then a reading that does not hold, then one that does
  {
    const s = camp({ met: true, kame: true, shrine: true, flags: { kr_record_read: true } });
    const a = await talk(s, [CMP], ['cancel']);
    const open1 = !done(s);
    const b = await talk(s, [CMP], ['fox']);
    const open2 = !done(s) && !s.flags.kr_fox_board;
    const c = await talk(s, [CMP], ['record']);
    t.ok(open1 && open2 && done(s) && s.flags.kr_fox_board && flat(a.offered) === flat([[CMP, LATER]]),
      '5 put off, then "the fox built it" (not held), then the register\'s reading: open, open, done (' + flat({ a: a.said.slice(-1), b: b.said.slice(-1), c: c.said.slice(-2) }) + ')');
  }

  // ---- 6. each supported reading: its own line, the same board
  {
    const lines = {};
    for (const pick of ['both', 'record', 'three']) {
      const s = camp({ met: true, kame: true, shrine: true, flags: { kr_record_read: true } });
      const r = await talk(s, [CMP], [pick]);
      lines[pick] = { done: done(s), board: !!s.flags.kr_fox_board, var: s.vars['tell_kr.t_fox'], said: r.said.length };
    }
    t.ok(['both', 'record', 'three'].every((k) => lines[k].done && lines[k].board && lines[k].var === k), '6 each supported reading is kept, the board decided, done (' + flat(lines) + ')');
  }

  // ---- 7. after the chapter, the quest open
  {
    const s = camp({ met: true, kame: true, shrine: true, flags: { kr_done: true } });
    const r = await talk(s, [REG, CMP], ['three']);
    const after = await talk(s, []);
    t.ok(r.scene === 'kr.shozo_idle' && done(s) && after.scene === 'kr.shozo_after' && after.said.includes(BOARD) && !after.said.includes(NIGHT),
      '7 after the chapter: the register and the comparison, done; then his line with the board (' + flat({ scene: r.scene, after: after.said }) + ')');
  }

  // ---- 8. done, then asked again: no second completion
  {
    const s = camp({ met: true, kame: true, shrine: true, flags: { kr_record_read: true } });
    toasts = [];
    await talk(s, [CMP], ['both']);
    const again = await talk(s, [CMP], ['both']);
    s.flags.kr_done = true;
    const post = await talk(s, []);
    t.ok(toasts.filter((x) => x === DONE).length === 1 && done(s) && post.scene === 'kr.shozo_after' && post.said.includes(BOARD),
      '8 done, asked again before and after the chapter: one completion only (' + flat({ toasts, again: again.said.slice(-1), post: post.said }) + ')');
  }

  // ---- 9. after the chapter, never begun: no board
  {
    const s = camp({ flags: { kr_done: true } });
    const r = await talk(s, []);
    t.ok(r.scene === 'kr.shozo_after' && r.said.includes(NIGHT) && !r.said.some((l) => /board/.test(l || '')) && !s.quests.kr_fox,
      '9 after the chapter, never begun: only "' + NIGHT + '", never the board (' + flat(r.said) + ')');
  }

  // ---- 10. the guide
  {
    const nextOf = (o) => { const s = camp(o); s.follow = 'kr_fox'; const r = G.targets('kr_fox', s); return { ids: (r.targets || []).map((x) => x.id || x.p), next: G.nextLines(r).map((l) => l.en) }; };
    const pre = nextOf({ met: true, kame: true, shrine: true }), post = nextOf({ met: true, kame: true, shrine: true, flags: { kr_done: true } });
    t.ok(flat(pre.ids) === flat(['kr_shozo']) && flat(post.ids) === flat(['kr_shozo']) && /^Next: Shōzō, in Fox Bridge/.test(pre.next[0] || '') && /^Next: Shōzō/.test(post.next[0] || ''),
      '10 the guide: Kame\'s story and the shrine\'s board in, Shōzō is next, before and after the chapter (' + flat({ pre, post }) + ')');
  }

  // ---- 11. no talk ended on an error
  t.ok(!errors.length, '11 no talk ended on an error from the runner (' + errors.length + ': ' + flat(errors.slice(0, 3)) + ')');
};
