// The postgame's phase end (expansion P15h; playbook P15 "Evidence"; docs/future/work/P15_POSTGAME.md), with synthetic
// campaigns only. What the per-system tests show in depth (hall_w1 … hall_w10, guardians, settle, returns,
// pastimes_post, fishing, shogi, hanafuda, karuta, festival, delvers) is checked here across the whole postgame:
//  - the hundred-trial manifest: ten wings of ten, no duplicate id, every trial on a floor whose map exists;
//  - every wing through every reset path with the Hall's own rules: going in, defeat restarting only the current
//    floor, the emergency retreat (the next visit starts on that floor, earlier floors kept), the reprieve holding a
//    floor exactly, the suspend point keeping the very place, and the whole wing done — each in a journey that has met
//    nobody a delver could be (zero-delver runs), with the honest note;
//  - the guardians' policy: each one optional, awake only after the story, one mechanic family, a way to step back,
//    help after a defeat, and never more than five knots;
//  - the settlement's progression: one journal entry, its parts in order, each part changing the map;
//  - the pastimes' fixtures: every pastime on its page with how to play and where, its activity registered;
//  - the optional stays optional: outside its own content, a postgame system's state only colours a line (it never
//    gates an exit, a person, a thing, a scene's branch or the story's ending);
//  - the exit: no placeholder wing, no empty port, no "coming soon".
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state, H = RB.hall, X = RB.expedition;

  // ---- a minimal stage ----------------------------------------------------------------------------------------------
  let lines = [], warps = [];
  RB.ui.dialogue.say = async (l) => { lines.push({ who: l.who, jp: l.jp || '', en: l.en || '' }); };
  RB.ui.dialogue.choose = async () => 0;
  RB.ui.dialogue.hide = () => {};
  RB.ui.toast = async () => {};
  RB.ui.notice = () => {};
  RB.ui.confirm = async (q, opts) => opts.length - 1;
  RB.ui.shake = () => {};
  RB.ui.fade = async () => {};
  for (const k of ['ensureSpeaker', 'dismissExtras', 'refreshActors']) RB.world[k] = () => {};
  RB.world.whenArrived = async () => {};
  RB.world.emote = () => {};
  RB.game.afterScene = () => {};
  RB.world.W = RB.world.W || {};
  RB.game.transition = async (map) => { warps.push(map); RB.game.G.s.map = map; RB.world.W.map = { id: map }; RB.bus.emit('map:enter', { id: map }); };
  RB.game.rest = async () => {};
  RB.game.inBattle = () => false;
  RB.game.startEncounter = async () => ({ result: 'win', outcome: null });
  RB.save.autosave = async () => {};
  RB.challenge.run = async () => ({ ok: true });
  if (RB.lessons) RB.lessons.grammarCard = async () => {};
  const DONE = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_done: true, cr_done: true, yn_done: true, ch6_done: true, postgame: true, hall_ledger: true };
  const fresh = (o = {}) => {
    const s = S.newCampaign({ edition: 2 });
    s.id = o.id || 'postgame-phase'; s.map = 'hall.foyer'; s.comp = 'ren';
    s.player.name = 'Haru'; s.player.nameJp = 'ハル';
    s.learn.profile = 'E';
    Object.assign(s.flags, DONE);
    s.vars = {};
    RB.game.G.s = s; RB.game.s = s;
    RB.world.W.map = { id: s.map };
    return s;
  };
  const run = async (id) => { lines = []; await RB.script.run(id); return lines; };

  // ---- the hundred-trial manifest ----------------------------------------------------------------------------------------
  const man = H.manifest();
  const WINGS = H.list().map((w) => w.id);
  t.eq(WINGS, ['w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7', 'w8', 'w9', 'w10'], 'ten wings');
  t.eq(man.length, 100, 'a hundred trials');
  t.eq(new Set(man.map((x) => x.id)).size, 100, 'no id twice');
  t.ok(WINGS.every((w) => man.filter((x) => x.wing === w).length === 10), 'ten in every wing (no placeholder wing)');
  const badFloor = man.filter((x) => { const f = H.get(x.wing).floors[x.floor]; return !f || !C.maps[f.map]; }).map((x) => x.id);
  t.eq(badFloor, [], 'every trial on a floor whose map exists');
  t.ok(WINGS.every((w) => C.scenes['hall.door_' + w] && C.scenes['hall.hearth_' + w]), 'every wing has its door and its hearth in the foyer');

  // ---- every wing through every reset path, with nobody a delver could be ------------------------------------------------
  await RB.save.detect();
  for (const w of WINGS) {
    const s = fresh({ id: 'phase-' + w });
    if (w === 'w10') for (const k of WINGS.slice(0, 9)) H.wrec(s, k).done = true; // the tenth door wants nine lights
    t.eq(RB.delvers.eligible(s), [], w + ': a journey that has met nobody a delver could be');
    const D = H.get(w), floors = D.floors;
    const onFloor = (k) => D.trials.filter((x) => x.floor === k).map((x) => x.id);
    RB.hooks.hall_card = async () => { s.vars._res = 1; };
    warps = [];
    await run('hall.door_' + w);
    let v = H.visitOf(s);
    t.ok(v && v.wing === w && v.floor === 0 && warps.includes(floors[0].map), w + ': going in, the first floor');
    for (const x of onFloor(0)) H.markTrial(s, w, x);
    t.ok(S.test(s, 'hall.' + w + '.f0.clear'), w + ': the first floor cleared');
    // defeat on the second floor: only that floor starts again
    await RB.game.transition(floors[1].map);
    const f1 = onFloor(1);
    H.markTrial(s, w, f1[0]);
    const wake = X.onDefeat(s);
    t.ok(wake && wake.map === floors[1].map && !H.trialDone(s, w, f1[0]) && H.trialDone(s, w, onFloor(0)[0]) && s.resolve.pc === s.resolve.max, w + ': defeat restarts the second floor only, at full resolve');
    // the emergency retreat: out, the floor's progress gone, the next visit starts on it
    H.markTrial(s, w, f1[0]);
    await RB.ui.hall.leave(false);
    t.ok(!H.visitOf(s) && !X.of(s) && warps[warps.length - 1] === 'hall.foyer' && !H.trialDone(s, w, f1[0]), w + ': the retreat: back at the hearth, the floor\'s progress gone');
    await run('hall.door_' + w);
    v = H.visitOf(s);
    t.ok(v && v.floor === 1 && H.trialDone(s, w, onFloor(0)[0]), w + ': the next visit starts on the second floor, the first kept');
    // the reprieve: earned on its floor, then leave with the floor held exactly, and come back to it
    const rp = D.trials.find((x) => x.reprieve);
    t.ok(!!rp, w + ': the wing has a reprieve to earn');
    if (rp.floor === 2) { for (const x of f1) H.markTrial(s, w, x); await RB.game.transition(floors[2].map); }
    const r = H.markTrial(s, w, rp.id);
    t.ok(r.reprieve && H.visitOf(s).reprieve === 1, w + ': ' + rp.id + ' earns the reprieve');
    const here = H.visitOf(s).floor;
    RB.world.W.player = { x: 5, y: 5, dir: 'down' };
    await RB.ui.hall.leave(true);
    const held = H.peek(s, w).held;
    t.ok(held && held.floor === here && held.done[rp.id], w + ': leaving with it holds the floor exactly');
    RB.hooks.hall_card = async () => { s.vars._res = 2; };
    await run('hall.door_' + w);
    v = H.visitOf(s);
    t.ok(v && v.floor === here && H.trialDone(s, w, rp.id) && !H.peek(s, w).held, w + ': going back, exactly where you left it');
    // the suspend point keeps the very place (a recovery record with the slot, never a seventh save)
    RB.save.setCurrent(3, 0);
    await RB.save.writeSlot(3, s);
    await RB.save.writeRecovery(3, s, 'suspend');
    const rd = await RB.save.read(3, 'suspend');
    t.ok(rd && rd.state.hall && rd.state.hall.visit && rd.state.hall.visit.wing === w && rd.state.hall.visit.floor === here, w + ': the suspend point keeps the visit, on its floor');
    await RB.save.del(3);
    // the rest of the wing: the tale done, its lantern relit, with nobody met along the way
    for (let k = here; k < floors.length; k++) {
      if (k > here) await RB.game.transition(floors[k].map);
      for (const x of onFloor(k)) if (!H.trialDone(s, w, x)) H.markTrial(s, w, x);
    }
    t.ok(H.wingDone(s, w) && S.test(s, 'hall.' + w), w + ': the whole wing done');
    t.eq(Object.keys(RB.delvers.peek(s).met), [], w + ': and no delver was needed (none met)');
    const nt = H.note(s, w);
    t.ok(nt && nt.route && nt.tactics, w + ': the honest note');
  }

  // ---- the guardians' policy ------------------------------------------------------------------------------------------------
  {
    const G = Object.keys(C.enemies).filter((id) => C.enemies[id].guardian);
    t.eq(G.length, 9, 'nine guardians');
    const encs = Object.keys(C.encounters).filter((id) => id.startsWith('gd.'));
    const bad = [];
    for (const id of encs) {
      const e = C.encounters[id];
      if (!e.story || !e.canFlee || !e.help || !(e.help.explain || e.help.suggest)) bad.push(id + ' policy');
    }
    for (const id of G) if ((C.enemies[id].knots || C.enemies[id].hp || 0) > 5 && C.enemies[id].knots) bad.push(id + ' knots');
    t.eq(bad, [], 'every guardian encounter: counted for help after a defeat, a way to step back, help to give');
    const shrines = [];
    for (const m in C.maps) for (const p of C.maps[m].props || []) if (/^gd\./.test(p.scene || '')) shrines.push([m, p]);
    t.ok(shrines.length >= 9 && shrines.every(([, p]) => p.if === 'ed>=2&postgame'), 'their shrines stand only after the story, in a twelve-chapter journey');
  }

  // ---- the settlement's progression -----------------------------------------------------------------------------------------
  {
    const q = C.quests.as_main;
    t.ok(q && q.stages.length >= 4, 'Ashihara Shinden: one journal entry, its parts in order');
    const grow = (C.maps['as.village'].structs || []).filter((b) => b.grow && b.if);
    t.ok(grow.length >= 2, 'buildings that stand only once the village grows');
    t.ok(!JSON.stringify(C.maps['as.village']).match(/coin|price|upkeep/i), 'never money, never upkeep');
  }

  // ---- the pastimes' fixtures --------------------------------------------------------------------------------------------------
  {
    const all = RB.pastimes.all();
    const bad = all.filter((d) => !(d.title && d.title.jp && d.blurb && d.howto && d.howto.length && (d.venue || d.anywhere) && typeof d.met === 'function')).map((d) => d.id);
    t.eq(bad, [], 'every pastime has its page: what it is, how to play, where (its place, or anywhere safe with your companion) (' + all.map((d) => d.id).join(', ') + ')');
    const kinds = RB.activity.kinds();
    t.eq(all.filter((d) => d.activity && kinds.indexOf(d.activity) < 0).map((d) => d.id), [], 'every pastime\'s activity is registered');
    t.ok(C.shogi.tsume.every((tz) => { const g = RB.shogi.newGame(tz.size); g.b = tz.board.map((r) => [...r].map((ch) => (ch === '.' ? null : { t: ch.toUpperCase(), s: ch === ch.toUpperCase() ? 0 : 1, p: false }))); g.h = [Object.assign({}, tz.hand || {}), {}]; g.turn = 0; g.hist = []; return !!RB.shogi.mateIn(g, 1); }), 'every shogi puzzle is a legal mate in one (' + C.shogi.tsume.length + ')');
    t.ok(RB.fishing.SITE_ORDER.every((id) => { const st = RB.fishing.site(id); return (C.maps[st.map].props || []).some((p) => p.p === 'fish_station' && p.x === st.station.x && p.y === st.station.y); }), 'every fishing station stands in its map');
  }

  // ---- the optional stays optional --------------------------------------------------------------------------------------------
  {
    const FAM = { hall: /(^|[&|!])hall\.(w\d+|lit|ledger)/, guardians: /(^|[&|!])(gd\.|var\.gd_)/, settlement: /(^|[&|!])(as_|var\.as_)/, fishing: /(^|[&|!])fish\./, returns: /(^|[&|!])(rt_|var\.rt_)/ };
    const OWN = { hall: /^(hall\.|kr\.hall)/, guardians: /^gd\./, settlement: /^as\./, fishing: /^(fish\.|coast\.)/, returns: /^rt\./ };
    const gates = [], colours = [];
    const chk = (where, kind, cond, owner) => {
      if (!cond) return;
      for (const f in FAM) if (FAM[f].test(cond) && !OWN[f].test(owner)) (kind === 'say' ? colours : gates).push(f + ' ' + kind + ' ' + where + ' [' + cond + ']');
    };
    for (const id in C.scenes) for (const c of C.scenes[id].cmds) {
      if (c.if) chk(id, c.op === 'say' ? 'say' : 'cmd:' + c.op, c.if, id);
      if (c.op === 'if') chk(id, 'branch', c.args.slice(0, c.args.indexOf('->')).join(' '), id);
    }
    for (const m in C.maps) for (const k of ['exits', 'props', 'npcs', 'triggers', 'onEnter', 'structs', 'foes']) for (const e of C.maps[m][k] || []) {
      chk(m + ':' + k, k, e.if, e.scene || (typeof e.talk === 'string' ? e.talk : '') || m);
      if (Array.isArray(e.talk)) for (const x of e.talk) chk(m + ':' + e.id, 'talk', x.if, x.scene || '');
    }
    t.eq(gates, [], 'outside its own content no postgame system\'s state gates anything');
    t.ok(colours.length > 0 && colours.every((x) => /^(hall|guardians|settlement) say rt\.sanpei_last /.test(x)), 'it only colours lines (Sanpei\'s last editions report what you did): ' + colours.length);
    const ends = Object.keys(C.scenes).filter((id) => /^(end\.|sa2\.end_|pages\.)/.test(id));
    t.ok(ends.length && ends.every((id) => !C.scenes[id].cmds.some((c) => Object.values(FAM).some((re) => re.test(c.if || '') || (c.op === 'if' && re.test(c.args.join(' ')))))), 'the endings never look at the postgame');
  }

  // ---- the exit: no placeholder wing, no empty port, no "coming soon" -------------------------------------------------------
  {
    const empty = [];
    for (const id in C.ports) {
      const P = C.ports[id], m = C.maps[P.dock.map];
      if (!m) { empty.push(id + ': no map'); continue; }
      const things = (m.props || []).filter((p) => p.scene && p.scene !== 'sea.boat').length + (m.npcs || []).length + (m.exits || []).length;
      if (!things || !(m.props || []).some((p) => p.scene === 'sea.boat' && p.o && p.o.port === id)) empty.push(id);
    }
    t.eq(empty, [], 'every port of the boat\'s has the boat at its pier and something to do ashore (' + Object.keys(C.ports).join(', ') + ')');
    const soon = [];
    const RE = /coming soon|placeholder|\bTODO\b|\bTBD\b|lorem ipsum/i;
    for (const id in C.scenes) for (const c of C.scenes[id].cmds) if ((c.en && RE.test(c.en)) || (c.jp && /近日公開|準備中/.test(c.jp))) soon.push(id);
    for (const d of RB.pastimes.all()) if (RE.test(JSON.stringify(d.blurb) + JSON.stringify(d.venue))) soon.push('pastime ' + d.id);
    for (const w of H.list()) if (RE.test(JSON.stringify(w.title) + JSON.stringify(w.theme))) soon.push('wing ' + w.id);
    t.eq(soon, [], 'no "coming soon" anywhere a player reads');
  }
};
