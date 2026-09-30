// The ending extensions and The Pages We Keep (addendum §10, §11, §23.4),
// exercised through the real scene runner and hooks with the dialogue stubbed
// (lines are collected, choices are picked by the test). Synthetic campaigns
// only. What this covers:
//  - every companion's ending passage for every legitimate personal-quest
//    state, low and high bond, pet absent and present: the lines are
//    state-correct, +2 bond and one Reflections memory once, nothing else
//    changes (flags, items, quests); replay changes nothing;
//  - A Conversation We Still Owe Ourselves for an older postgame save, and An
//    Unfinished Conversation after a late personal quest;
//  - The Pages We Keep for all four companions through the Atlas bus events
//    (the real hook lines in src/atlas/50_run.js emit them): early return,
//    normal return, deferred discussions, defeat after and before a
//    qualifying event, a run that vanished; save/load (JSON + migrate) at
//    every point; +1 × 3 and the memento exactly once;
//  - "Talk about this road": 12 topics per companion, every slot has true
//    content in every state, no bond, recent topics skipped, a quiet line when
//    all are heard; the Japanese in data strings is valid and in the lexicon.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state, PG = RB.pages, K = RB.company;

  // ---- a minimal stage: the real runner, with dialogue collected and choices picked --------------
  let lines = [], picks = [];
  let chooser = () => 0;
  RB.ui.dialogue.say = async (l) => { lines.push({ who: l.who, jp: l.jp || '', en: l.en || '' }); };
  RB.ui.dialogue.choose = async (opts) => { const i = chooser(opts); picks.push(opts[i] && opts[i].en); return i; };
  RB.ui.dialogue.hide = () => {};
  RB.ui.toast = async () => {};
  RB.world.ensureSpeaker = () => {};
  RB.world.whenArrived = async () => {};
  RB.world.dismissExtras = () => {};
  RB.world.refreshActors = () => {};
  RB.game.afterScene = () => {};
  RB.save.autosave = async () => {};
  const byEn = (...words) => (opts) => { for (const w of words) { const i = opts.findIndex((o) => (o.en || '').indexOf(w) >= 0); if (i >= 0) return i; } return 0; };
  const fresh = (comp, o) => {
    const s = S.newCampaign({});
    s.map = 'rw.village'; s.comp = comp;
    Object.assign(s.flags, { departed: true, ch1_done: true, ch2_done: true, ch3_done: true, ch4_done: true, ch5_done: true, lf_bell_rung: true });
    Object.assign(s, o || {});
    RB.game.G.s = s;
    return s;
  };
  const run = async (id, pick) => { lines = []; picks = []; chooser = pick || (() => 0); await RB.script.run(id); return lines; };
  const text = () => lines.map((l) => l.en).join(' | ');
  const has = (re) => lines.some((l) => re.test(l.en) || re.test(l.jp));
  const snap = (s) => JSON.stringify({ f: s.flags, i: s.inv, q: s.quests, w: s.words });
  const reload = (s) => { const st = RB.save.migrate(JSON.parse(JSON.stringify(s))); RB.game.G.s = st; return st; };
  const bond = (s, id) => (s.company.bond || {})[id];
  const setBond = (s, n) => { s.company.bond = {}; for (let i = 0; i < n; i++) s.company.bond['t' + i] = 1; };
  const quest = (s, id, v) => { if (v === 'done') s.quests[id] = { stage: 99, done: true }; else if (v != null) s.quests[id] = { stage: v, done: false }; };

  // ---- content hygiene -----------------------------------------------------------------------------
  t.eq((C.scriptErrors || []).filter((e) => /pages|end\.|road\.|ch6\/scenes-ending|atlas\/scenes/.test(e)), [], 'the new and edited scenes parse');
  const refs = new Set();
  for (const id in C.scenes) for (const c of C.scenes[id].cmds) if (c.op === 'call') refs.add(c.args[0]);
  t.ok([...refs].every((r) => C.scenes[r]), 'every called scene exists');
  for (const h of ['pages_choose', 'pages_event', 'pages_recall', 'pages_end_done', 'pages_retro_begin', 'pages_unfinished_done', 'pages_topic', 'pages_display']) t.ok(typeof RB.hooks[h] === 'function', 'hook ' + h);
  // Japanese kept in data (presented by hooks, so the content validator does not see it)
  const strs = [];
  const walk = (o, w, d) => { if (!o || d > 8) return; if (typeof o === 'string') return; if (Array.isArray(o)) { o.forEach((x, i) => walk(x, w + '[' + i + ']', d + 1)); return; } if (typeof o === 'object') for (const k in o) { if (k === 'jp' && typeof o[k] === 'string') strs.push([o[k], w]); else walk(o[k], w + '.' + k, d + 1); } };
  walk(PG.PROJECT, 'PROJECT', 0); walk(PG.REPLY, 'REPLY', 0); walk(PG.MEMO_TITLE, 'MEMO', 0); walk(PG.RET, 'RET', 0);
  for (const k of ['inscription', 'lanterns', 'sign', 'promise', 'name', 'doors', 'guardian', 'climax', 'other']) for (const pat of ['threshold', 'stacks', 'margin', 'crossing', 'tide', 'x']) {
    const d = PG.describe({ kind: k, pattern: pat, name: 'ferry', boss: 'bell', read: pat === 'x' });
    strs.push([d[0].jp, 'describe ' + k]); strs.push([d[1].jp, 'describe ' + k]);
  }
  for (const c of PG.COMPS) { strs.push([C.keepsakes['pages_' + c].name.jp, 'keepsake ' + c]); const Sh = PG.SHOW[c]; strs.push([Sh.narr({ jp: '{道|みち}', en: 'x' }).jp, 'show ' + c]); strs.push([Sh.inside({ jp: '{道|みち}', en: 'x' }).jp, 'show ' + c]); strs.push([Sh.say.jp, 'show ' + c]); }
  const bad = [], unknown = new Set();
  for (const [str, w] of strs) {
    if (RB.jp.validate(str).length) bad.push(w + ': ' + str.slice(0, 40));
    for (const tk of RB.jp.parse(str)) {
      if (tk.punct || tk.ph || !/[぀-ヿ一-鿿]/.test(tk.surface)) continue;
      let info; try { info = RB.jp.lookup(tk); } catch (e) { info = { unknown: true }; }
      if (info.unknown) unknown.add(tk.surface + ' (' + w + ')');
    }
  }
  t.eq(bad, [], 'data Japanese: valid markup, furigana on every kanji (' + strs.length + ' strings)');
  t.eq([...unknown], [], 'data Japanese: every word is in the lexicon');
  // mementos: Shared Journey keepsakes, one per companion, with art
  t.ok(PG.COMPS.every((c) => { const k = C.keepsakes['pages_' + c]; return k && k.category === 'shared' && k.comp === c && typeof k.art === 'function' && k.hint && k.name.en; }), 'four Shared Journey mementos, each for one companion, with art and hints');
  // the displays stand on wall tiles (no new obstacle) and only for that companion's finished page
  for (const [m, list] of [['rw.hall', ['nao', 'ren']], ['rw.tea', ['mio', 'suzu']]]) {
    const map = RB.maps.compile(m);
    for (const c of list) {
      const pr = C.maps[m].props.find((p) => p.p === 'pages_card' && p.o.kind === c);
      t.ok(pr && pr.if.indexOf('keepsake.pages_' + c) >= 0 && pr.if.indexOf('comp=' + c) >= 0, m + ': ' + c + '\'s page is shown only once it exists');
      t.ok(pr && C.maps[m].terrain[pr.y][pr.x] === '#' && !map.block[(pr.y + 1) * map.w + pr.x], m + ': ' + c + '\'s page hangs on a wall with a free tile below it');
    }
  }

  // =====================================================================================================
  // The ending passages (§10): every legitimate state
  // =====================================================================================================
  // Legitimate personal-quest states at the ending (from the source): Nao's letter may be undelivered
  // (optional after the bell); Mio's refusal may be pending (stage 2) or never started (the bell rang
  // first); Ren always decides at the Memories shelf (took | left); Suzu's truth is required for Ch3.
  const CASES = [
    ['nao', (s) => quest(s, 'lf_nao', 'done'), 'done'], ['nao', (s) => quest(s, 'lf_nao', 1), 'open (met Umi)'], ['nao', (s) => quest(s, 'lf_nao', 0), 'open (never met)'],
    ['mio', (s) => quest(s, 'lf_mio', 'done'), 'done'], ['mio', (s) => quest(s, 'lf_mio', 2), 'open (pending)'], ['mio', () => {}, 'never started'],
    ['ren', (s) => { quest(s, 'ren_ushio', 'done'); s.flags.sa_ren_took = true; s.flags.sa_ren_decided = true; }, 'took the face'],
    ['ren', (s) => { quest(s, 'ren_ushio', 'done'); s.flags.sa_ren_left = true; s.flags.sa_ren_decided = true; }, 'left the face'],
    ['suzu', (s) => { quest(s, 'co_suzu', 'done'); s.flags.co_suzu_done = true; }, 'done'],
  ];
  const PQ_LINE = { nao: { yes: /peeled off Umi/, no: /haven't delivered/ }, mio: { yes: /Tadashi at the Records Hall/, no: /(haven't answered|still practising)/ } };
  let variant = 0;
  const addedCount = {};
  for (const [c, setup, label] of CASES) {
    for (const hi of [false, true]) for (const pet of [null, 'cat', 'dog', 'bird', 'tanuki']) {
      if (pet && variant++ % 3) continue; // every species with every companion over the loop, not every combination
      const s = fresh(c, { map: 'rw.village' });
      setup(s);
      setBond(s, hi ? 9 : 2);
      if (pet) { s.company.pets[pet] = { name: '<b>Koma</b>' }; s.company.pet = pet; RB.pets = { visible: () => true }; } else RB.pets = undefined;
      if (hi) K.memory(s, { id: 'm_disc', kind: 'discoveries', title: { jp: '{乾|かわ}いた {隅|すみ}', en: 'A dry corner' }, comp: c });
      const before = snap(s);
      await run('sa.end_comp', byEn('(Just'));
      const tag = c + ' / ' + label + ' / bond ' + (hi ? 'high' : 'low') + ' / ' + (pet || 'no pet');
      const L = lines.slice();
      const orig = new Set(C.scenes['sa.end_comp'].cmds.filter((x) => x.op === 'say').map((x) => x.en));
      const added = L.filter((l) => !orig.has(l.en)).length;
      addedCount[c] = (addedCount[c] || []).concat(added);
      t.ok(L.length - added >= 8 && added >= 7 && added <= 15, tag + ': one scene — the original branch (' + (L.length - added) + ' lines) with ' + added + ' added lines (target roughly 8–14)');
      t.eq(bond(s, 'ending'), 2, tag + ': +2 bond for the ending');
      const m = s.company.memories.find((x) => x.id === 'ending:' + c);
      t.ok(m && m.kind === 'reflections' && m.pq === PG.pqDone(s, c) && m.replyId === 'quiet', tag + ': one Reflections memory, with the real quest state and the reply');
      t.eq(snap(s), before, tag + ': no flag, item, quest or word changed by the passage');
      t.ok(!pet ? !L.some((l) => /(cat|dog|bird|tanuki)/i.test(l.who === 'narr' ? l.en : '')) : L.some((l) => l.who === 'narr' && new RegExp(pet === 'tanuki' ? 'tanuki' : pet).test(l.en)), tag + ': a pet in the background only when one is shown');
      t.ok(!L.some((l) => /Koma|<b>/.test(l.en + l.jp)), tag + ': a player-given name is never put into the lines');
      if (hi) t.ok(has(/A dry corner/), tag + ': recalls one real shared memory');
      else t.ok(!has(/A dry corner/) && L.some((l) => /(Lanternfall|bell|Archive|Snowbell|workshop)/.test(l.en)), tag + ': with no memory, a main-journey reference instead');
      if (PQ_LINE[c]) t.ok(PG.pqDone(s, c) ? has(PQ_LINE[c].yes) && !has(PQ_LINE[c].no) : has(PQ_LINE[c].no) && !has(PQ_LINE[c].yes), tag + ': the personal quest acknowledged as it really stands');
      if (c === 'ren') t.ok(s.flags.sa_ren_took ? has(/remembered the face/) && !has(/left the face at the Archive/) : has(/left the face at the Archive/) && !has(/remembered the face/), tag + ': Ren\'s choice as it was made');
      t.ok(hi ? L.some((l) => /(mind you|unsettled me|publishing|embarrassing)/.test(l.en)) : !L.some((l) => /(mind you|unsettled me|publishing the figures|too embarrassing)/.test(l.en)), tag + ': stronger bond adds a callback, not a different ending');
      // replay: nothing more
      const mems = s.company.memories.length, aw = JSON.stringify(s.awarded);
      await run('sa.end_comp');
      t.ok(s.company.memories.length === mems && JSON.stringify(s.awarded) === aw && bond(s, 'ending') === 2, tag + ': replaying the scene awards nothing more');
    }
  }
  RB.pets = undefined;
  t.log('added ending lines per companion (min–max over the states):', JSON.stringify(Object.fromEntries(Object.entries(addedCount).map(([k, v]) => [k, Math.min(...v) + '–' + Math.max(...v)]))));
  // the three replies are all offered, none is "right"
  for (const c of PG.COMPS) {
    const s = fresh(c); quest(s, { nao: 'lf_nao', mio: 'lf_mio', ren: 'ren_ushio', suzu: 'co_suzu' }[c], 'done'); s.flags.sa_ren_took = true;
    let offered = null;
    await run('end.' + c + '.reply', (opts) => { offered = opts.map((o) => o.en); return 1; });
    t.ok(offered && offered.length === 3 && /^\(/.test(offered[2]), c + ': two sincere replies and a quiet one');
    t.ok(lines.length >= 2, c + ': the reply is answered in character');
    t.eq(bond(s, 'ending'), undefined, c + ': a reply alone awards nothing');
  }
  // Nao's walk through Lanternfall no longer contradicts an undelivered letter
  {
    const s = fresh('nao'); quest(s, 'lf_nao', 1);
    await run('sa.epi_lf');
    t.ok(!has(/I haven't written back/) && has(/You said you'd come back/), 'epilogue: Umi does not speak of a letter she has not received');
    const s2 = fresh('nao'); quest(s2, 'lf_nao', 'done');
    await run('sa.epi_lf');
    t.ok(has(/I haven't written back/) && !has(/You said you'd come back/), 'epilogue: with the letter delivered, the original lines');
  }

  // ---- A Conversation We Still Owe Ourselves ------------------------------------------------------
  for (const c of PG.COMPS) {
    const s = fresh(c, { map: 'rw.hall' });
    s.flags.postgame = true; s.flags.post = true; s.seen['rw.atlas_intro'] = true;
    quest(s, { nao: 'lf_nao', mio: 'lf_mio', ren: 'ren_ushio', suzu: 'co_suzu' }[c], c === 'nao' ? 0 : 'done'); s.flags.sa_ren_left = true;
    t.ok(PG.needRetro(s) && PG.pending(s, 'hall').id === 'retro' && !PG.offerOpen(s), c + ': an older postgame save owes the conversation (the project waits for it)');
    await run('pages.enter_retro', byEn('Later'));
    t.ok(PG.needRetro(s) && bond(s, 'ending') == null, c + ': deferring it is free and keeps it');
    await run('pages.enter_retro', byEn('now', '(Just'));
    t.ok(!PG.needRetro(s) && bond(s, 'ending') === 2 && s.company.memories.some((m) => m.id === 'ending_retro:' + c && m.retro), c + ': the retrospective conversation: +2 once, a memory marked as told afterwards');
    t.ok(!lines.some((l) => /bridge at sunset|sets down the satchel on the bridge/.test(l.en)), c + ': it does not pretend the scene already played');
    await run('pages.retro');
    t.ok(bond(s, 'ending') === 2 && s.company.memories.filter((m) => /^ending/.test(m.id)).length === 1, c + ': asking again adds nothing');
    t.ok(PG.offerOpen(s), c + ': afterwards, Page I can be offered');
  }

  // ---- An Unfinished Conversation -------------------------------------------------------------------
  {
    const s = fresh('nao', { map: 'rw.village' }); quest(s, 'lf_nao', 1);
    await run('sa.end_comp');
    t.ok(!PG.needUnfinished(s), 'nao: nothing unfinished while the letter is still undelivered');
    quest(s, 'lf_nao', 'done');
    t.ok(PG.needUnfinished(s) && PG.pending(s, 'safe').id === 'unfinished', 'nao: after the late delivery, the follow-up waits (anywhere safe)');
    const b = JSON.stringify(s.company.bond);
    await run('pages.unfinished');
    t.ok(has(/I read it/) && !PG.needUnfinished(s) && s.company.memories.some((m) => m.id === 'unfinished:nao') && JSON.stringify(s.company.bond) === b, 'nao: the new resolution acknowledged, once, without a second ending award');
    const s2 = fresh('mio'); quest(s2, 'lf_mio', 2);
    await run('sa.end_comp');
    quest(s2, 'lf_mio', 'done');
    await run('pages.unfinished');
    t.ok(has(/I refuse/) && s2.company.memories.some((m) => m.id === 'unfinished:mio'), 'mio: the late refusal acknowledged');
    const s3 = fresh('mio'); quest(s3, 'lf_mio', 'done');
    await run('sa.end_comp');
    t.ok(!PG.needUnfinished(s3), 'mio: nothing unfinished when the quest was done at the ending');
  }

  // =====================================================================================================
  // The Pages We Keep (§11)
  // =====================================================================================================
  const post = (c) => {
    const s = fresh(c, { map: 'rw.hall' });
    s.flags.postgame = true; s.flags.post = true; s.seen['rw.atlas_intro'] = true; s.atlas.unlocked = true;
    quest(s, { nao: 'lf_nao', mio: 'lf_mio', ren: 'ren_ushio', suzu: 'co_suzu' }[c], 'done'); s.flags.sa_ren_took = true;
    K.memory(s, { id: 'ending:' + c, kind: 'reflections', title: { jp: '{橋|はし}', en: 'x' }, pq: true, comp: c });
    return s;
  };
  let seq = 0;
  const startRun = (s) => { s.atlas.run = { id: 'r' + (++seq), mods: [], path: ['t'] }; s.map = 'atlas.' + s.atlas.run.id + '.c'; return s.atlas.run.id; };
  const ev = (s, kind, extra) => RB.bus.emit('atlas:event', Object.assign({ run: s.atlas.run.id, id: kind + seq, kind, room: 't', pattern: 'threshold', branch: 'lantern' }, extra || {}));
  const end = (s, kind) => { const id = s.atlas.run.id; RB.bus.emit('atlas:end', { run: id, kind }); s.atlas.run = null; s.map = 'rw.hall'; RB.bus.emit('map:enter', { id: 'rw.hall' }); return id; };
  const awards = (s) => ['project:1', 'project:2', 'project:3'].map((k) => bond(s, k) || 0);

  // Page I is not stacked onto the ending: the visit the story ends on (the introduction plays
  // inside it) does not offer it; the next time you come into the Lantern Hall does
  {
    const s = post('mio');
    const offerCond = C.maps['rw.hall'].onEnter.find((e) => e.scene === 'pages.enter_offer').if;
    delete s.seen['rw.atlas_intro'];
    RB.bus.emit('map:enter', { id: 'rw.hall' }); // the epilogue brings you into the Hall
    s.seen['rw.atlas_intro'] = true; // Tsuru introduces the Atlas in that visit
    t.ok(PG.offerOpen(s) && !S.test(s, offerCond), 'Page I is not offered in the visit the story ends on (' + offerCond + ')');
    t.ok(PG.pending(s, 'hall') && PG.pending(s, 'hall').id === 'offer', '...but talking to your companion there can open it');
    RB.bus.emit('map:enter', { id: 'rw.village' });
    RB.bus.emit('map:enter', { id: 'rw.hall' });
    t.ok(S.test(s, offerCond), 'the next time you come into the Lantern Hall it is offered');
  }
  for (const c of PG.COMPS) {
    // Page I: offered in the hall, deferrable, never blocking; then a theme
    let s = post(c);
    t.ok(PG.offerOpen(s) && PG.pending(s, 'hall').id === 'offer' && !PG.pending(s, 'safe'), c + ': Page I is offered in the Lantern Hall only');
    await run('pages.enter_offer', byEn('Not now'));
    t.ok(!PG.state(s) && PG.offerOpen(s) && awards(s)[0] === 0, c + ': "not now" keeps the offer and awards nothing');
    const theme = Object.keys(PG.PROJECT[c].themes)[1];
    await run('pages.offer', (opts) => opts.findIndex((o) => o.en === PG.PROJECT[c].themes[theme].en));
    let p = PG.state(s);
    t.ok(p && p.stage === 1 && p.theme === theme && awards(s).join() === '1,0,0' && s.company.memories.some((m) => m.id === 'pages:1'), c + ': Page I accepted with a theme: +1 and a Company memory');
    s = reload(s);

    // an outing that ends before anything happens: no page, the project stays open
    startRun(s);
    const r0 = end(s, 'defeat');
    await run('pages.home');
    p = PG.state(s);
    t.ok(!p.ev && p.lastEmpty === r0 && has(/another road|next road|next show|Called off|sent back before/) && awards(s).join() === '1,0,0', c + ': defeat before any event: honest, nothing fabricated, no loss');
    t.ok(!PG.home2Open(s) && !PG.home3Open(s), c + ': nothing to discuss from an empty outing');

    // an outing: a real event is captured (copied out of the run at once)
    const rid = startRun(s);
    ev(s, 'inscription');
    ev(s, 'lanterns', { pattern: 'lanterns' });
    p = PG.state(s);
    t.ok(p.ev && p.ev.run === rid && p.ev.kind === 'inscription' && /half-written gate/.test(p.ev.desc.en) && p.ev.ret === null && s.atlas.run.pages.ev === p.ev.id, c + ': the first real event of the outing is recorded (summary in company data, a reference in the run)');
    s = reload(s); // save/load after the evidence
    t.ok(PG.state(s).ev.id === p.ev.id && PG.campOpen(s), c + ': reload after the evidence: kept, and the camp can discuss it');
    // the camp: defer once, then (next variant) discuss
    if (c === 'mio' || c === 'suzu') {
      await run('pages.camp', byEn('at home'));
      t.ok(PG.state(s).stage === 1 && !PG.campOpen(s) && awards(s).join() === '1,0,0', c + ': camp talk deferred: free, and not asked again at this camp');
    } else {
      const asp = Object.keys(PG.PROJECT[c].aspects)[2];
      await run('pages.camp', (opts) => opts.findIndex((o) => o.en === PG.PROJECT[c].aspects[asp].en));
      p = PG.state(s);
      t.ok(p.stage === 2 && p.aspect === asp && p.where === 'camp' && awards(s).join() === '1,1,0', c + ': Page II at the camp: +1, the aspect kept');
      t.ok(lines[0] && /Today, the two of you/.test(lines[0].en), c + ': the camp talk names what actually happened');
      s = reload(s); // save/load after the camp talk
      t.ok(PG.state(s).stage === 2 && awards(s).join() === '1,1,0', c + ': reload after the camp talk: no loss, no second award');
    }
    // the way home: early for nao and mio, a defeat after the event for ren, a complete road for suzu
    const kind = { nao: 'early', mio: 'complete', ren: 'defeat', suzu: 'early' }[c];
    end(s, kind);
    p = PG.state(s);
    t.ok(p.ev.ret === kind && PG.returned(s), c + ': the return type is copied out before the run is cleared (' + kind + ')');
    s = reload(s); // save/load before the homecoming talk
    await run('pages.home', byEn('Later', 'Another time'));
    t.ok(PG.state(s).stage < 3 && awards(s)[2] === 0 && (PG.pending(s, 'hall') || {}).id === (PG.state(s).stage === 1 ? 'home2' : 'home3'), c + ': homecoming talk deferred: it waits in the Lantern Hall');
    if (kind === 'defeat') t.ok(PG.retOf(s) === 'defeat', c + ': a defeat is recorded as the road sending you home');
    // finish at home (through the Company/Chat entry)
    const pend = PG.pending(s, 'hall');
    const capI = 1;
    await run(pend.scene, (opts) => {
      const P = PG.PROJECT[c];
      const i = opts.findIndex((o) => o.en === (P.captions[PG.state(s).theme] || [])[capI].en);
      if (i >= 0) return i;
      const j = opts.findIndex((o) => Object.values(P.aspects).some((a) => a.en === o.en));
      if (j >= 0) return j;
      return byEn('now', 'Just pin')(opts);
    });
    p = PG.state(s);
    t.ok(p.stage === 3 && p.caption === capI && awards(s).join() === '1,1,1' && s.discovery.keepsakes['pages_' + c], c + ': Page III at home: +1, the memento, the caption (' + (p.where === 'home' ? 'Page II deferred to home' : 'Page II at the camp') + ')');
    if (kind === 'defeat') t.ok(has(/sent us home|sent us back|road sent/) && !has(/walked (it|that one) to the end/), c + ': the defeat is told honestly');
    if (kind === 'early') t.ok(has(/turned back|came back early|curtain down early|Turning back/), c + ': the early return is a real, warm decision');
    t.ok(s.company.memories.filter((m) => /^pages:/.test(m.id)).length === 3, c + ': three project memories');
    s = reload(s); // save/load after the reward
    await run(PG.pending(s, 'hall') ? PG.pending(s, 'hall').scene : 'pages.home3');
    RB.discovery.keepsake(s, 'pages_' + c, 'again');
    t.ok(awards(s).join() === '1,1,1' && Object.keys(s.discovery.keepsakes).filter((k) => k === 'pages_' + c).length === 1 && PG.page3(s, 0) === false, c + ': after the reward, nothing can be awarded twice');
    // the display
    await run('pages.display');
    t.ok(lines.length === 3 && lines[0].en.indexOf(PG.PROJECT[c].captions[PG.state(s).theme][capI].en) >= 0, c + ': the pinned page shows the chosen caption and the moment');
    // the finished project stays finished across a new outing
    startRun(s); ev(s, 'name', { name: 'ferry' }); end(s, 'complete');
    t.ok(PG.state(s).stage === 3 && PG.state(s).ev.run !== s.atlas.run && PG.state(s).ev.kind === 'inscription', c + ': a later outing does not rewrite the page');
  }

  // a run that vanished (the save could not restore it) still comes home honestly
  {
    const s = post('nao');
    await run('pages.offer', byEn('instruction'));
    startRun(s); ev(s, 'doors', { read: false, pattern: 'doors' });
    s.atlas.run = null; s.map = 'rw.hall'; // what RB.atlas.prepare does to an unrestorable run
    t.ok(PG.returned(s) && PG.retOf(s) === 'folded' && PG.home2Open(s), 'a vanished run: evidence kept, treated as the road returning you');
    t.ok(/found the one of three doors/.test(PG.state(s).ev.desc.en), 'a lucky door is described as found, not as read');
    await run('pages.home2', (opts) => { const i = opts.findIndex((o) => /checked/.test(o.en)); return i >= 0 ? i : byEn('now')(opts); });
    t.ok(PG.state(s).stage === 3 && PG.state(s).ev.ret === 'folded', 'deferred Page II at home, then Page III, from a vanished run');
  }
  // entering and leaving at once cannot fabricate a page; Page II needs the camp of its own run
  {
    const s = post('ren');
    await run('pages.offer', byEn('certainty'));
    startRun(s);
    t.ok(!PG.campOpen(s) && PG.page2(s, 'known', 'camp') === false, 'no event, no Page II');
    RB.bus.emit('atlas:event', { run: 'other', id: 'x', kind: 'inscription', pattern: 'threshold' });
    t.ok(!PG.state(s).ev, 'an event from another run is ignored');
    RB.bus.emit('atlas:event', { run: s.atlas.run.id, id: 'x', kind: 'relic' });
    t.ok(!PG.state(s).ev, 'finding a relic is not a qualifying event');
    t.ok(PG.page3(s, 0) === false && PG.accept(s, 'sure') === false, 'no skipping ahead, no second acceptance');
  }
  // seeds and route generation never see the project (§11.3): the same save plans the same road
  {
    const s = post('mio');
    s.atlas.started = 3; s.atlas.completed = 1;
    const gen = (extra) => { const r = RB.atlas.newRun(s, ['escort']); delete r.started; Object.assign(r, extra || {}); const pl = RB.atlas.plan(r); delete r.pages; return JSON.stringify({ r, pl }); };
    const before = gen();
    await run('pages.offer', (opts) => opts.findIndex((o) => o.en === PG.PROJECT.mio.themes.share.en));
    const accepted = gen();
    startRun(s); ev(s, 'lanterns', { pattern: 'lanterns' });
    const captured = gen({ pages: { ev: PG.state(s).ev.id } });
    end(s, 'early');
    await run('pages.home2', (opts) => { const i = opts.findIndex((o) => o.en === PG.PROJECT.mio.aspects.turns.en); return i >= 0 ? i : byEn('now')(opts); });
    const done = gen();
    t.ok(PG.state(s).stage >= 2, 'the project moved on meanwhile (stage ' + PG.state(s).stage + ')');
    t.ok(before === accepted && accepted === captured && captured === done, 'the seed, the route plan and the climax are the same before, during and after the project');
  }
  // bond and project belong to the committed companion only
  {
    const s = post('suzu');
    s.comp = null; s.provisional = 'suzu';
    t.ok(!PG.offerOpen(s) && !PG.pending(s, 'hall') && PG.accept(s, 'funny') === false, 'no project without a committed companion');
  }

  // =====================================================================================================
  // Talk about this road (§11.6)
  // =====================================================================================================
  for (const c of PG.COMPS) {
    const mine = PG.TOPICS.filter((x) => x.comp === c);
    t.eq(mine.map((x) => x.slot).sort().join(), 'h1,h2,h3,h4,o1,o2,o3,o4,r1,r2,r3,r4', c + ': 12 topics — four habits, four reflections, four observations');
    // every slot shows true content in every state
    const states = [];
    for (const petOn of [false, true]) for (const done of [0, 1]) for (const keeps of [0, 1]) for (const at of ['camp', 'home']) states.push({ petOn, done, keeps, at });
    let empty = [];
    for (const st of states) {
      const s = post(c);
      await run('pages.offer', (opts) => 0);
      const p = PG.state(s); p.stage = 3; p.caption = 0; p.ev = { run: 'x', id: 'y', kind: 'inscription', desc: { jp: '', en: '' }, title: { jp: '', en: '' }, ret: 'early' };
      s.atlas.completed = st.done; if (st.done) s.flags.atlas_restore_1 = true;
      if (st.keeps) s.discovery.keepsakes.reed_boat = { t: 1 };
      if (st.petOn) { s.company.pets.cat = { name: 'x' }; s.company.pet = 'cat'; RB.pets = { visible: () => true }; } else RB.pets = undefined;
      if (st.at === 'camp') { s.atlas.run = { id: 'rt', mods: [] }; s.map = 'atlas.rt.c'; } else s.map = 'rw.hall';
      if (c === 'nao') quest(s, 'lf_nao', st.done ? 'done' : 1);
      for (const x of mine) { await run(x.scene); if (lines.length < 1) empty.push(x.id + ' ' + JSON.stringify(st)); }
      if (st.petOn) for (const x of mine.filter((y) => y.slot === 'o1')) { await run(x.scene); if (!lines.some((l) => /cat/i.test(l.en))) empty.push(x.id + ' pet not mentioned'); }
      else for (const x of mine.filter((y) => y.slot === 'o1')) { await run(x.scene); if (lines.some((l) => /\b(cat|dog|bird|tanuki)\b/i.test(l.en) && !/harbour dog/.test(l.en))) empty.push(x.id + ' claims a pet'); }
      if (!st.done) for (const x of mine.filter((y) => y.slot === 'r2')) { await run(x.scene); if (lines.some((l) => /(Remember walking an unwritten road|The day we got to the end of a road|lantern at the road's end was mine|The final curtain the day we reached)/.test(l.en))) empty.push(x.id + ' claims a finished road'); }
    }
    RB.pets = undefined;
    t.eq(empty, [], c + ': every slot has content, and only true content, in all ' + states.length + ' states');
    // selection: at camp once per outing, at home once per homecoming; unseen first; quiet when all heard; no bond
    const s = post(c);
    await run('pages.offer', (opts) => 0);
    const p = PG.state(s); p.stage = 3; p.caption = 0; p.theme = Object.keys(PG.PROJECT[c].themes)[0]; p.ev = { run: 'x', id: 'y', kind: 'inscription', desc: { jp: '', en: '' }, title: { jp: '', en: '' }, ret: 'early' };
    const b0 = JSON.stringify(s.company.bond);
    const heard = [], ids = [];
    const QUIET = /(Nothing|nothing|Tea instead|Two exits|sold out|silence|Interval|script is blank|all out|Watching the flame|perfectly good line|close, apparently)/;
    const idOf = () => { const r = s.company.project.road; return r && r.recent ? r.recent[0] : null; };
    for (let i = 0; i < 16; i++) {
      startRun(s);
      await run('pages.road.camp');
      heard.push(lines[0] && lines[0].en); ids.push(idOf());
      if (i === 0) t.ok(!PG.roadCampOpen(s), c + ': one camp topic per outing');
      end(s, 'early');
      if (i === 0) t.ok(PG.roadHomeOpen(s) && PG.pending(s, 'hall').id === 'road', c + ': after coming home, one homecoming topic waits (by talking to them)');
      await run(PG.pending(s, 'hall') ? PG.pending(s, 'hall').scene : 'pages.road.home');
      heard.push(lines[0] && lines[0].en); ids.push(idOf());
      if (i === 0) t.ok(!PG.roadHomeOpen(s) && !PG.pending(s, 'hall'), c + ': and only one');
    }
    const talk = Object.keys(s.company.talk).filter((k) => k.indexOf('road:' + c) === 0);
    t.eq(talk.length, 12, c + ': all 12 topics heard over enough outings');
    t.ok(new Set(heard.slice(0, 12)).size === 12 && heard.slice(0, 12).every((h) => !QUIET.test(h)), c + ': the first twelve are twelve different topics');
    const topicsHeard = heard.filter((h) => !QUIET.test(h)).length;
    t.ok(topicsHeard <= 16 && heard.slice(-6).every((h) => QUIET.test(h)), c + ': a finite bank — ' + topicsHeard + ' topics (12, plus a slot whose facts changed), then brief ordinary lines');
    let rep = 0;
    for (let i = 1; i < heard.length; i++) if (!QUIET.test(heard[i]) && heard.slice(Math.max(0, i - 4), i).indexOf(heard[i]) >= 0) rep++;
    t.eq(rep, 0, c + ': no topic comes back within four of hearing it');
    t.eq(JSON.stringify(s.company.bond), b0, c + ': topics award no bond');
  }
};
