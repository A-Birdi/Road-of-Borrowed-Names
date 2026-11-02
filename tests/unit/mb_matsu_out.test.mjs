// Matsu's door: shown out, you are outside (Agnes 6569082815, 6569311618; Local CL-629; Cloud CC-466). When the
// conversation at the lock-keeper's door ended with Matsu showing you out (or ran out of time), the scene after it said
// "Matsu shuts her door. …Outside, Sen is waiting." and Sen spoke, but nothing moved the party or placed Sen: you were
// still inside, facing Matsu. Now, on that branch only, the party goes out by her door to the street and Sen is staged
// there for her line, already there (`!enter … here`: set down at her place, not walking in from the Tally Exchange).
// With synthetic campaigns only, the real scene runner (the dialogue, the move and the staging recorded, not drawn),
// each end of the conversation applied as its own conclusion's flags:
//  1. the scene: the two lines, both on `?(!mb_passage)`, straight before the narration, so all four of that branch's
//     lines take it before `!set mb_passage`; no line said, key or flag changed;
//  2. shown out, and timed out (unresolved): out by the door to mb.exchange (52, 16), facing down, before "Matsu shuts
//     her door"; Sen staged at (52, 17), already there, before it too; then mb_passage, mb_main at step 6 and its journal
//     line, as before;
//  3. the letter, and agreed: no move and no Sen; Matsu's own lines, and the lamp with the letter, as before;
//  4. the door's own way out is the same tile (the lockhouse's exit to mb.exchange 52, 16, facing down), and it and
//     Sen's tile are open on the street; no arrival scene plays there at this stage (mb.exchange_first is seen);
//  5. Sen's own places in the world, unchanged: the Tally Exchange, and the playhouse on the festival night;
//  6. every `!enter` in the game (Local CL-647): Matsu's is the only one with `here`; Nana's on the sea-cave stage is as
//     it was;
//  no scene ended on an error from the runner.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state;
  const flat = (x) => JSON.stringify(x);

  // ---- a minimal stage (as tests/unit/mp_comic_cancel.test.mjs), with the move and the staging recorded ---------------
  let ev = [];
  RB.ui.dialogue.say = async (l) => { ev.push(['say', l.who || '', l.en || '']); };
  RB.ui.dialogue.choose = async () => 0;
  RB.ui.dialogue.hide = () => {};
  RB.ui.toast = async () => {};
  RB.ui.notice = () => {};
  RB.ui.shake = () => {};
  RB.ui.fade = async () => {};
  for (const k of ['dismissExtras', 'refreshActors']) RB.world[k] = () => {};
  RB.world.ensureSpeaker = (who, scene, o) => { if (o && o.staged) ev.push(['enter', who, o.at, !!o.here]); return null; };
  RB.world.whenArrived = async () => {};
  RB.world.emote = () => {};
  RB.game.afterScene = () => {};
  RB.world.W = RB.world.W || {};
  RB.game.inBattle = () => false;
  RB.game.transition = async (map, x, y, dir) => { ev.push(['warp', map, x, y, dir]); };
  RB.save.autosave = async () => {};
  if (RB.staging) RB.staging.walkTo = async () => {};
  const ends = Object.fromEntries(C.encounters['mb.passage'].conclusions.map((c) => [c.id, c]));
  let s;
  const fresh = (end) => {
    const st = S.newCampaign({ edition: 2 });
    st.id = 'mb-matsu-test'; st.map = 'mb.lockhouse'; st.x = 5; st.y = 4; st.comp = 'mio';
    Object.assign(st.flags, { departed: true, ch1_done: true, ch2_done: true, mb_arrived: true, mb_exchange_seen: true, mb_ev_letter: true });
    st.quests.mb_main = { stage: 5, done: false, t: 1 };
    // the conversation's end, as it leaves the campaign: its conclusion's flags
    Object.assign(st.flags, ends[end].flags || {});
    s = st; RB.game.G.s = st; RB.game.s = st; RB.world.W.map = { id: st.map, def: C.maps[st.map] };
    return st;
  };
  const errors = [];
  const cerr = console.error;
  console.error = (...a) => { if (a[0] === 'scene error') errors.push(a[1] + ': ' + String((a[2] && a[2].message) || a[2])); else cerr(...a); };
  const run = async (id) => { ev = []; try { await RB.script.run(id); } catch (e) { errors.push(id + ': ' + String((e && e.message) || e)); } return ev; };
  const idx = (re) => ev.findIndex((e) => e[0] === 'say' && re.test(e[2]));
  const SHUT = /Matsu shuts her door/, SEN = /Exchange|permission|lock/i;

  // 1. the scene
  {
    const cmds = C.scenes['mb.passage_after'].cmds;
    const i = cmds.findIndex((c) => c.op === 'warp');
    const branch = cmds.slice(i, i + 5).map((c) => [c.op, c.if || null, (c.args || []).join(' ')]);
    t.ok(cmds.filter((c) => c.op === 'warp' || c.op === 'enter').length === 2 &&
      flat(branch.slice(0, 2)) === flat([['warp', '!mb_passage', 'mb.exchange 52 16 down'], ['enter', '!mb_passage', 'mb_sen 52 17 up here']]) &&
      branch[2][1] === '!mb_passage' && branch[3][1] === '!mb_passage' && branch[4][0] === 'set' && branch[4][1] === '!mb_passage',
      '1 the scene: the two lines on !mb_passage straight before the narration, Sen\'s line, then !set mb_passage ' + flat(branch));
  }

  // 2. shown out, and timed out
  for (const end of ['shown_out', 'unresolved']) {
    fresh(end);
    await run('mb.passage_after');
    const w = ev.findIndex((e) => e[0] === 'warp'), en = ev.findIndex((e) => e[0] === 'enter'), shut = idx(SHUT), sen = ev.findIndex((e) => e[0] === 'say' && e[1] === 'mb_sen');
    t.ok(w >= 0 && flat(ev[w]) === flat(['warp', 'mb.exchange', 52, 16, 'down']) && w < en && en >= 0 && flat(ev[en]) === flat(['enter', 'mb_sen', [52, 17], true]) && en < shut && shut < sen,
      '2 ' + end + ': out by the door to mb.exchange (52, 16) facing down, then Sen staged at (52, 17), already there, before "Matsu shuts her door" and her line ' + flat({ w: ev[w], en: ev[en], order: [w, en, shut, sen] }));
    t.ok(!!s.flags.mb_passage && s.quests.mb_main.stage === 6 && (s.journal || []).some((j) => /Down through the lock/.test(j.en || '')) && ev.filter((e) => e[0] === 'warp').length === 1,
      '2 ' + end + ': then mb_passage, mb_main at step 6 and its journal line, as before; one move ' + flat({ passage: !!s.flags.mb_passage, stage: s.quests.mb_main.stage }));
  }

  // 3. the letter, and agreed
  for (const end of ['letter', 'agreed']) {
    fresh(end);
    await run('mb.passage_after');
    const matsu = ev.filter((e) => e[0] === 'say' && e[1] === 'mb_matsu').map((e) => e[2]);
    t.ok(!ev.some((e) => e[0] === 'warp' || e[0] === 'enter') && idx(SHUT) < 0 && !ev.some((e) => e[1] === 'mb_sen') && matsu.some((x) => /unlocked it/.test(x)) &&
      !!s.flags.mb_matsu_lamp === (end === 'letter') && !!s.flags.mb_matsu_letter === (end === 'letter') && s.quests.mb_main.stage === 6,
      '3 ' + end + ': no move and no Sen; Matsu\'s own lines' + (end === 'letter' ? ', and her lamp with the letter' : '') + ', as before ' + flat({ matsu: matsu.length, lamp: !!s.flags.mb_matsu_lamp }));
  }

  // 4. the street outside the door
  {
    const door = (C.maps['mb.lockhouse'].exits || []).find((e) => e.to === 'mb.exchange');
    const m = RB.maps.compile('mb.exchange');
    const open = (x, y) => { const tl = RB.maps.tileAt(m, x, y); return !!tl && tl.walk && !RB.maps.blockedStatic(m, x, y); };
    fresh('shown_out');
    const arrivals = (C.maps['mb.exchange'].onEnter || []).filter((o) => !o.if || S.test(s, o.if)).map((o) => o.scene);
    t.ok(door && door.tx === 52 && door.ty === 16 && door.dir === 'down' && open(52, 16) && open(52, 17) && !arrivals.length,
      '4 the door\'s own way out is the same tile; it and Sen\'s are open; no arrival scene plays there at this stage ' + flat({ door: door && [door.tx, door.ty, door.dir], arrivals }));
  }

  // 5. Sen's own places
  {
    const where = [];
    for (const id in C.maps) for (const n of C.maps[id].npcs || []) if (n.id === 'mb_sen' || n.char === 'mb_sen') where.push(id);
    t.eq(where.sort(), ['mb.tally', 'mp.playhouse'], '5 Sen\'s own places, unchanged: the Tally Exchange, and the playhouse');
  }

  // 6. every !enter in the game
  {
    const all = [];
    for (const id in C.scenes) for (const c of C.scenes[id].cmds || []) if (c.op === 'enter') all.push([id, (c.args || []).join(' ')]);
    t.eq(all.sort(), [['ko.suzu_stage', 'ko_nana 13 10 up'], ['mb.passage_after', 'mb_sen 52 17 up here']], '6 every !enter in the game: Matsu\'s is the only one with here; Nana\'s is as it was');
  }

  t.ok(!errors.length, 'no scene ended on an error from the runner ' + errors.slice(0, 3).join(' | '));
  console.error = cerr;
};
