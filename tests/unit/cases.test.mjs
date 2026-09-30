// Cases, layered help, refined sequences and Known Details
// (src/engine/59_cases.js, src/ui/59_casebook.js, src/ui/61_known.js,
// src/content/cases/, src/content/zz_cases.js; docs/addendum/cases.md).
// - Words: every Japanese string the cases can show — including the lines
//   built at run time (views, acknowledgements, reactions) — has furigana on
//   every kanji and only words the lexicon knows.
// - Geometry: the Star Stair views are computed from the props the map
//   draws; each viewpoint sees a different order; the sketch, turned the right
//   way, matches exactly one view and, as it hung, none; perspective and
//   left/right agree. The harbour picture agrees with the harbour map.
// - Placement: every added prop and person stands on a tile that was free;
//   with them (and their conditional variants) in place, every way out and
//   every tile that was reachable from the map's spawn still is.
// - Rules: clues kept before a case is known; bounded hypotheses; wrong
//   guesses recorded; sufficient evidence sets; resolution once (keepsake,
//   quest, one discovery:resolved); methods; help levels; navigation only to
//   a chosen or disclosed place; concealed quest stages; plain-text notes;
//   older saves; conditions; reactions for every companion and method;
//   keepsake records; Known Details and pins.
// - The refined sequences still accept every original correct form, and the
//   new talk options never stand in front of a main-story conversation.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, K = RB.cases;

  // ---- 1. words ---------------------------------------------------------------------------------------
  const probs = [];
  let checked = 0;
  const line = (jp, where) => {
    if (jp == null) return;
    checked++;
    for (const e of RB.jp.validate(jp)) probs.push(where + ': ' + e.msg + ' in ' + jp);
    for (const tk of RB.jp.parse(jp)) {
      if (tk.punct || tk.ph || !/[぀-ヿ一-鿿]/.test(tk.surface)) continue;
      const a = RB.jp.lookup(tk);
      if (!a || !a.entry) probs.push(where + ': unknown word ' + tk.surface + ' in ' + jp);
    }
  };
  for (const id in C.cases) {
    const cd = C.cases[id];
    line(cd.title.jp, id + ' title'); line(cd.question.jp, id + ' question'); if (cd.result) line(cd.result.jp, id + ' result');
    cd.hints.forEach((h, i) => line(h.jp, id + ' hint ' + (i + 1)));
    cd.hypotheses.forEach((h) => line(h.label.jp, id + ' hyp ' + h.id));
  }
  for (const cid in C.clues) {
    const c = C.clues[cid];
    line(c.title.jp, cid + ' title'); line(c.jp, cid);
    (c.lang || []).forEach((l, i) => line(l.w, cid + ' lang ' + i));
  }
  for (const q of ['cs_parcel', 'cs_view']) { const d = C.quests[q]; line(d.title.jp, q); d.stages.forEach((sg, i) => { line(sg.jp, q + '[' + i + ']'); if (sg.hint) line(sg.hint.jp, q + '[' + i + '] hint'); }); }
  for (const id of ['parcel_seal', 'turning_picture', 'shell_button', 'clay_swallow', 'star_rosette', 'thread_spool']) line(C.keepsakes[id].name.jp, 'keepsake ' + id);
  for (const r of C.caseReactions) r.lines.forEach((l) => line(l.jp, 'reaction ' + r.id));
  const V = C.caseView;
  for (const pid in V.points) { const P = V.points[pid]; line(P.name.jp, pid); line(P.facing.jp, pid); line(P.look.jp, pid); line(V.words(V.order(pid)).jp, 'view ' + pid); line(V.words(V.order(pid).slice().reverse()).jp, 'view back ' + pid); }
  for (const k in V.landmarks) line(V.landmarks[k].name.jp, k);
  for (const d of C.knownDetails) for (const st of d.states) if (st.label.jp) line(st.label.jp, 'known ' + d.id);
  // acknowledgements, for every combination of what could have been observed
  const s0 = RB.state.newCampaign();
  RB.game.s = s0;
  for (let mask = 0; mask < 16; mask++) {
    const s = RB.state.newCampaign();
    ['parcel.record', 'parcel.makernote', 'parcel.bell', 'parcel.bench'].forEach((c, i) => { if (mask & (1 << i)) s.discovery.clues[c] = { t: 1 }; });
    for (const m of ['reasoned', 'early', 'helped']) for (const l of C.cases.parcel.acknowledge(s, { method: m, tried: { family: mask & 1 ? 1 : 0 } }, K)) line(l.jp, 'ack ' + mask + ' ' + m);
  }
  line(RB.questGuide.nudges ? null : null, 'x');
  t.log('case lines checked: ' + checked);
  t.eq(probs.slice(0, 10), [], 'every case line has furigana on every kanji and known words');

  // ---- 2. geometry: the Star Stair --------------------------------------------------------------------------
  const sb = C.maps['sb.obs_path'];
  for (const k in V.landmarks) {
    const l = V.landmarks[k];
    const here = (sb.props || []).filter((p) => p.x === l.x && p.y === l.y && l.props.includes(p.p));
    t.ok(here.length > 0 && here.every((p) => !p.if || /sb_lamp_lit/.test(p.if)), 'landmark ' + k + ' is a real prop at ' + l.x + ',' + l.y + ' (' + here.map((p) => p.p).join('/') + ')');
  }
  const orders = {};
  for (const pid in V.points) {
    const see = V.see(pid);
    orders[pid] = see.map((x) => x.k).join(',');
    t.ok(see.every((x) => x.f >= 1.5 && Math.abs(x.deg) <= 70), 'from ' + pid + ' every landmark is ahead and in view');
    const byR = see.slice().sort((a, b) => a.r - b.r).map((x) => x.k).join(',');
    t.eq(byR, orders[pid], 'from ' + pid + ': perspective order = left/right on the map');
    for (let i = 1; i < see.length; i++) t.ok(see[i].deg - see[i - 1].deg >= 9 && see[i].r - see[i - 1].r >= 1, 'from ' + pid + ': ' + see[i - 1].k + ' and ' + see[i].k + ' are clearly apart');
  }
  t.eq(new Set(Object.values(orders)).size, Object.keys(V.points).length, 'every viewpoint sees a different order: ' + JSON.stringify(orders));
  const front = V.order(V.target).join(','), back = V.order(V.target).slice().reverse().join(',');
  t.eq(Object.keys(orders).filter((p) => orders[p] === front), [V.target], 'the sketch turned the right way matches exactly one view: the ' + V.target);
  t.eq(Object.keys(orders).filter((p) => orders[p] === back), [], 'as it hung (back to front) it matches no view');
  const sh = C.cases.view.sheet;
  const sv = RB.state.newCampaign();
  for (const pid in V.points) sv.discovery.clues['view.' + pid] = { t: 1 };
  t.ok(sh.matches(sv, 'front', V.target) && !sh.matches(sv, 'back', V.target), 'the sheet predicate: front + target only');
  t.ok(Object.keys(V.points).filter((p) => p !== V.target).every((p) => !sh.matches(sv, 'front', p) && !sh.matches(sv, 'back', p)), 'no other view matches either way');
  // each viewpoint: the viewer's tile is walkable and faces its inspectable prop
  const msb = RB.maps.compile('sb.obs_path');
  const vpScene = { seat: 'cs.view_seat', west: 'cs.view_west', east: 'cs.view_east' };
  for (const pid in V.points) {
    const P = V.points[pid], vx = Math.floor(P.x), vy = Math.floor(P.y);
    const pr = msb.props.find((p) => p.scene === vpScene[pid]);
    const pd = pr && (RB.props.P[pr.p] || {});
    const on = pr && vx >= pr.x && vx < pr.x + (pr.w || pd.w || 1) && vy >= pr.y && vy < pr.y + (pr.h || pd.h || 1);
    const adj = pr && [[0, 1], [0, -1], [1, 0], [-1, 0]].some(([dx, dy]) => { for (let yy = pr.y; yy < pr.y + (pd.h || 1); yy++) for (let xx = pr.x; xx < pr.x + (pr.w || pd.w || 1); xx++) if (xx + dx === vx && yy + dy === vy) return true; return false; });
    t.ok(pr && (on || (!RB.maps.blockedStatic(msb, vx, vy) && adj)), 'viewpoint ' + pid + ': seen from ' + vx + ',' + vy + (on ? ', sitting on the ' : ', standing beside the ') + (pr && pr.p));
  }
  // the harbour picture: the old landing east (and north) of where the ferry lands now
  const hb = C.maps['sg.harbor'], ferry = hb.props.find((p) => p.p === 'sg_ferry'), foot = hb.props.find((p) => p.p === 'cs_footing');
  t.ok(foot.x > ferry.x + 10 && foot.y < ferry.y, 'the old footing is east of and above the ferry, as the picture and record say');
  const mhb = RB.maps.compile('sg.harbor');
  t.ok(mhb.tiles[(foot.y + 1) * mhb.w + foot.x].water, 'the old footing is at the water\'s edge');

  // ---- 3. placement -----------------------------------------------------------------------------------------------
  const touched = ['rw.warehouse', 'sg.office', 'sg.harbor', 'co.post', 'sg.lighthouse', 'co.inn', 'sb.obs_path', 'sb.hoshino'];
  const DIR = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  function reach(m, extraBlock) {
    const d = m.def, sp = (d.spawn && (d.spawn.default || Object.values(d.spawn)[0])) || [m.exits[0].x, m.exits[0].y];
    const seen = new Set([sp[0] + ',' + sp[1]]), q = [[sp[0], sp[1]]];
    const blocked = (x, y) => x < 0 || y < 0 || x >= m.w || y >= m.h || m.block[y * m.w + x] || extraBlock.has(x + ',' + y);
    while (q.length) {
      const [x, y] = q.pop();
      for (const [dx, dy] of DIR) { const nx = x + dx, ny = y + dy, k = nx + ',' + ny; if (seen.has(k) || blocked(nx, ny)) continue; seen.add(k); q.push([nx, ny]); }
    }
    return seen;
  }
  const exitOk = (m, R, e) => { for (let y = e.y; y < e.y + (e.h || 1); y++) for (let x = e.x; x < e.x + (e.w || 1); x++) { if (R.has(x + ',' + y)) return true; if (DIR.some(([dx, dy]) => R.has((x + dx) + ',' + (y + dy)))) return true; } return false; };
  for (const id of touched) {
    const def = C.maps[id];
    const mine = (x) => x && x.cs;
    // before: the map as the chapters defined it (every conditional prop of theirs left conditional)
    C.maps.__before = Object.assign({}, def, { props: (def.props || []).filter((p) => !mine(p)), npcs: (def.npcs || []).filter((n) => !mine(n)), structs: (def.structs || []).filter((b) => !mine(b)) });
    // after: with everything added, each conditional variant present at once (the worst case)
    C.maps.__after = Object.assign({}, def, { props: (def.props || []).map((p) => (mine(p) ? Object.assign({}, p, { if: null }) : p)) });
    RB.maps.invalidate();
    const mb = RB.maps.compile('__before'), ma = RB.maps.compile('__after');
    const npcTiles = new Set((def.npcs || []).filter(mine).map((n) => n.x + ',' + n.y));
    const Rb = reach(mb, new Set()), Ra = reach(ma, npcTiles);
    const occupied = new Set();
    for (const p of (def.props || []).filter((q) => mine(q) && (RB.props.P[q.p] || {}).block !== false)) { const pd = RB.props.P[p.p] || { w: 1, h: 1 }; for (let y = p.y; y < p.y + (p.h || pd.h || 1); y++) for (let x = p.x; x < p.x + (p.w || pd.w || 1); x++) occupied.add(x + ',' + y); }
    for (const b of (def.structs || []).filter(mine)) for (let y = b.y; y < b.y + b.h; y++) for (let x = b.x; x < b.x + b.w; x++) occupied.add(x + ',' + y);
    npcTiles.forEach((k) => occupied.add(k));
    // what was free
    const baseProps = (def.props || []).filter((p) => !mine(p));
    const takenBefore = new Set();
    for (const p of baseProps) { const pd = RB.props.P[p.p] || { w: 1, h: 1 }; for (let y = p.y; y < p.y + (p.h || pd.h || 1); y++) for (let x = p.x; x < p.x + (p.w || pd.w || 1); x++) takenBefore.add(x + ',' + y); }
    for (const n of (def.npcs || []).filter((q) => !mine(q))) takenBefore.add(n.x + ',' + n.y);
    for (const e of mb.exits) for (let y = e.y; y < e.y + (e.h || 1); y++) for (let x = e.x; x < e.x + (e.w || 1); x++) takenBefore.add(x + ',' + y);
    const clash = [...occupied].filter((k) => { const [x, y] = k.split(',').map(Number); const onMine = (def.props || []).some((p) => mine(p) && p.x === x && p.y === y && ['bookpile'].includes(p.p) && (def.props || []).some((q) => !mine(q) && q.x === x && q.y === y)); return !onMine && (takenBefore.has(k) || mb.block[y * mb.w + x]); });
    t.eq(clash, [], id + ': every added thing stands on a tile that was free');
    const lost = [...Rb].filter((k) => !Ra.has(k) && !occupied.has(k));
    t.eq(lost, [], id + ': nothing that was reachable is cut off');
    const exits = mb.exits.filter((e) => exitOk(mb, Rb, e) && !exitOk(ma, Ra, e)).map((e) => e.to + '@' + e.x + ',' + e.y);
    t.eq(exits, [], id + ': every way out still reachable');
    delete C.maps.__before; delete C.maps.__after;
  }
  RB.maps.invalidate();

  // ---- 4. rules ----------------------------------------------------------------------------------------------------
  const got = [];
  RB.bus.on('discovery:resolved', (e) => got.push(e));
  let s = RB.state.newCampaign();
  s.comp = 'nao'; s.map = 'sg.harbor';
  RB.game.s = s;
  t.eq(K.observe(s, 'parcel.bell'), 'new', 'a clue can be observed before its case is known');
  t.eq(K.observe(s, 'parcel.bell'), 'again', 'observing again changes nothing');
  t.ok(!K.known(s, 'parcel') && s.discovery.clues['parcel.bell'].case === null && s.discovery.clues['parcel.bell'].early, 'kept, not yet tied to a case');
  t.ok(RB.state.test(s, 'clue.parcel.bell') && !RB.state.test(s, 'case.parcel'), 'conditions: clue.<id>, case.<id>');
  t.ok(K.bookmark(s, 'parcel.bell') && K.loose(s).includes('parcel.bell'), 'a clue can be bookmarked before its case is known (loose details)');
  s.map = 'rw.warehouse';
  K.open(s, 'parcel');
  t.ok(K.known(s, 'parcel') && s.quests.cs_parcel && s.discovery.clues['parcel.bell'].case === 'parcel' && s.discovery.clues['parcel.bell'].early, 'recognising the case ties the earlier clue to it (still marked early)');
  t.eq(K.loose(s), [], 'no longer loose once its case is known');
  t.ok(RB.state.test(s, 'case.parcel=open') && !RB.state.test(s, 'case.parcel=done'), 'case.<id>=open|done');
  t.ok(!K.choose(s, 'parcel', 'family'), 'a hypothesis nothing has suggested yet cannot be chosen (no spoiler)');
  t.eq(K.hyps(s, 'parcel').map((h) => h.id), ['keeper'], 'only what the observations suggest is offered');
  K.observe(s, 'parcel.address');
  t.eq(K.hyps(s, 'parcel').map((h) => h.id), ['oldsite', 'keeper'], 'the address suggests the old landing too');
  t.ok(K.choose(s, 'parcel', 'oldsite') && RB.state.test(s, 'case.parcel.hyp=oldsite'), 'choose; case.<id>.hyp=');
  t.eq(K.markAt(s, 'parcel'), null, 'a chosen place not yet found is not marked');
  K.observe(s, 'parcel.oldsite');
  t.eq(K.markAt(s, 'parcel'), { map: 'sg.harbor', x: 53, y: 31 }, 'once found, the chosen place is what navigation may show');
  K.rule(s, 'parcel', 'oldsite');
  t.ok(RB.state.test(s, 'case.parcel.tried=oldsite') && K.hyps(s, 'parcel').find((h) => h.id === 'oldsite').tried, 'a wrong guess is recorded as tried (no penalty)');
  t.ok(!K.sufficient(s, 'parcel'), 'address + bell: not yet sufficient');
  K.observe(s, 'parcel.record');
  t.ok(K.sufficient(s, 'parcel'), 'address + record + a current fixture: sufficient (no maker note needed)');
  s.discovery.clues['parcel.record'] = undefined; delete s.discovery.clues['parcel.record'];
  K.observe(s, 'parcel.makernote');
  t.ok(K.sufficient(s, 'parcel'), 'the maker note is the other route');
  // resolution
  t.eq(K.methodOf(s, 'parcel'), 'reasoned', 'method: reasoned');
  t.ok(K.resolve(s, 'parcel') === true && K.resolve(s, 'parcel') === false, 'resolved once');
  t.ok(s.quests.cs_parcel.done && s.discovery.keepsakes.parcel_seal && RB.state.test(s, 'keepsake.parcel_seal'), 'quest done; keepsake recorded');
  t.eq(got.map((e) => e.kind + ':' + e.id + ':' + e.method + ':' + e.id2), ['case:parcel:reasoned:case:parcel:done'], 'one discovery:resolved, with the method and a unique id');
  t.eq(K.rec(s, 'parcel').hypothesis, 'keeper', 'the record states the answer only once it is found');
  t.eq(K.markAt(s, 'parcel'), null, 'nothing to navigate to once solved');
  // help: levels, disclosure, method
  s = RB.state.newCampaign(); s.comp = 'mio'; RB.game.s = s;
  K.open(s, 'view');
  t.eq(K.markAt(s, 'view'), null, 'nothing chosen: nothing marked');
  const kinds = [];
  for (let i = 0; i < 5; i++) { const h = K.askHint(s, 'view'); kinds.push(h ? h.kind : null); }
  t.eq(kinds, ['nudge', 'compare', 'step', 'solution', null], 'reasoning help: four levels, one at a time, then no more');
  t.eq(s.discovery.hints['case:view'], 4, 'the level asked for is kept in the save');
  t.eq(K.markAt(s, 'view'), { map: 'sb.obs_path', x: 10, y: 36 }, 'the answer, asked for, discloses its place to navigation');
  t.eq(K.methodOf(s, 'view'), 'helped', 'method: helped');
  K.resolve(s, 'view');
  t.ok(s.discovery.keepsakes.turning_picture, 'help gives the same keepsake');
  // the quest guide: concealed until chosen
  s = RB.state.newCampaign(); s.map = 'sg.harbor'; s.travel = { saltglass: true }; RB.game.s = s;
  K.open(s, 'parcel');
  const r0 = RB.questGuide.analyse('cs_parcel', s);
  t.eq([r0.how, r0.targets.length], ['concealed', 0], 'the delivery is concealed before a choice (not the derived answer)');
  const st = RB.questGuide.analyse('cs_parcel', s, { static: true, derive: true });
  t.ok(st.targets.some((e) => e.id === 'cs_hama'), 'the static listing still knows where it leads (for tests)');
  K.observe(s, 'parcel.crest'); K.choose(s, 'parcel', 'family');
  const r1 = RB.questGuide.analyse('cs_parcel', s);
  t.eq(r1.targets.map((e) => e.id), ['cs_seto'], 'after a choice the markers follow the choice, right or wrong');
  const nd = RB.questGuide.nudges('cs_parcel', s);
  t.ok(nd.lines[0][0].en.length > 0, 'a nudge exists for a concealed step');
  // notes: plain text, control characters, grapheme limit
  const n1 = K.setNote(s, 'parcel', 'a\u0000b\nc <b>d</b>');
  t.eq(K.rec(s, 'parcel').note, 'a b c <b>d</b>', 'notes: control characters and breaks become spaces; markup is kept as text');
  const fam = '\u{1F469}‍\u{1F469}‍\u{1F467}';
  const long = fam.repeat(150) + 'x'.repeat(100);
  const n2 = K.setNote(s, 'parcel', long);
  t.ok(n2.cut && K.graphemes(K.rec(s, 'parcel').note).length === 200 && K.rec(s, 'parcel').note.startsWith(fam), 'notes: at most 200 grapheme clusters (a family emoji is one)');
  // older saves
  const old = RB.state.newCampaign();
  delete old.discovery;
  const mig = RB.save.migrate(JSON.parse(JSON.stringify(old)));
  t.ok(mig.discovery && Object.keys(mig.discovery.cases).length === 0 && Object.keys(mig.discovery.clues).length === 0, 'an older save gains empty records and no invented evidence');
  const half = RB.state.newCampaign();
  half.map = 'rw.village';
  half.discovery.cases.parcel = { stage: 'done', t: 1 };
  half.discovery.cases.future_case = { stage: 'open', t: 2 };
  const mh = RB.save.migrate(JSON.parse(JSON.stringify(half)));
  t.ok(mh.quests.cs_parcel && mh.quests.cs_parcel.done, 'a solved case whose quest was never closed is made consistent');
  t.ok(mh.discovery.cases.future_case, 'an unknown case id is kept, not deleted');
  t.eq(RB.save.validate(JSON.parse(JSON.stringify(mh))), [], 'the save validates');

  // ---- 5. reactions, keepsakes, Company topics -----------------------------------------------------------------------
  for (const id in C.cases) for (const comp of ['nao', 'mio', 'ren', 'suzu']) for (const m in C.cases[id].methods) {
    t.ok(RB.company.reactions.some((r) => r.event === 'case:' + id && r.comp === comp && r.facts.method === m), 'reaction: ' + id + ' / ' + comp + ' / ' + m);
  }
  s = RB.state.newCampaign(); s.comp = 'suzu'; RB.game.s = s;
  K.open(s, 'parcel'); K.resolve(s, 'parcel', 'early');
  const pick = K.reaction(s, 'parcel');
  t.ok(pick && pick.comp === 'suzu' && pick.facts.method === 'early' && K.reaction(s, 'parcel').id === pick.id, 'a reaction is chosen for the actual method and stays the same');
  t.ok(K.discussable(s) && K.topics(s)[0].scene === 'cs.talk_parcel' && C.scenes['cs.talk_parcel'], 'Company can discuss a known case (topics with a scene)');
  const ctx = new Proxy({}, { get: (o, k) => (k in o ? o[k] : typeof k === 'string' && /^(fillStyle|strokeStyle|lineWidth)$/.test(k) ? '' : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
  for (const id of ['parcel_seal', 'turning_picture', 'shell_button', 'clay_swallow', 'star_rosette', 'thread_spool']) {
    const k = C.keepsakes[id];
    let ok = true;
    try { k.art(ctx); } catch (e) { ok = false; }
    t.ok(k.name.en && k.name.jp && k.desc.en && k.region && k.source && k.hint.broad.en && k.hint.specific.en && k.artSize === 32 && ok, 'keepsake ' + id + ': the catalogue schema, and its art draws');
  }

  // ---- 6. the refined sequences -------------------------------------------------------------------------------------------
  const refined = ['sg.c_tidetable', 'co.c_kiln', 'sb.c_log', 'lf.ch_gate1', 'lf.ch_gate2', 'lf.ch_gate3', 'sa.charter'];
  let forms = 0;
  const bad = [];
  for (const id of refined) {
    const ch = C.challenges[id];
    for (const tier of ['F', 'E', 'I', 'A']) for (const step of ch.tiers[tier] || []) {
      if (step.kind === 'write') for (const a of [step.answer].concat(step.accept || [])) { forms++; const r = RB.challenge.check(RB.tasks.plain(a), step); if (!r.ok) bad.push(id + '[' + tier + ']: ' + a); }
      else if (step.kind === 'choose') { forms++; if (!step.options.some((o) => o.ok)) bad.push(id + '[' + tier + ']: no correct option'); }
      else if (step.kind === 'order') { forms++; if (step.answer.length !== step.tiles.length) bad.push(id + '[' + tier + ']: order'); }
    }
  }
  t.eq(bad, [], 'the refined sequences still accept every original correct form (' + forms + ' forms, every tier)');
  const first = (map, id) => { const n = C.maps[map].npcs.find((q) => q.id === id); return (st2) => n.talk.find((o) => !o.if || RB.state.test(st2, o.if)).scene; };
  const mk = (flags, quests) => { const x = RB.state.newCampaign(); Object.assign(x.flags, flags); for (const q in quests) RB.state.setQuest(x, q, quests[q]); return x; };
  t.eq(first('sg.tidehut', 'shiori')(mk({ sg_tide_low: true, sg_tide_read: true }, { sg_main: 6 })), 'sg.shiori_fog', 'Shiori: the fog conversation still comes first while it is the main road');
  t.eq(first('sg.tidehut', 'shiori')(mk({ sg_tide_low: true, sg_boss_done: true }, { sg_main: 8 })), 'cs.shell_shiori', 'Shiori: the shell button afterwards');
  t.eq(first('co.pottery', 'co_nobu')(mk({ co_kiln_open: true }, { co_main: 7, co_count: 2 })), 'co.nobu', 'Nobu: not before the chapter is over');
  t.eq(first('co.pottery', 'co_nobu')(mk({ co_kiln_open: true, ch3_done: true, postgame: true }, {})), 'cs.swallow_nobu', 'Nobu: after it (even after the story)');
  t.eq(first('lf.sluice', 'lf_tokuji')(mk({ lf_gate_c: true }, { lf_main: 8 })), 'lf.tokuji_story', 'Tokuji: his own story first, and nothing of ours before the bell');
  t.eq(first('lf.sluice', 'lf_tokuji')(mk({ lf_gate_c: true, lf_bell_rung: true }, {})), 'cs.spool_tokuji', 'Tokuji: after it');

  // ---- 7. Known Details ----------------------------------------------------------------------------------------------------
  const kinds2 = new Set(['case', 'view', 'mechanism', 'inscription', 'passage', 'door']);
  const sceneRefs = [];
  for (const d of C.knownDetails) {
    const m = C.maps[d.map];
    t.ok(m && kinds2.has(d.kind) && d.states.length && d.states.every((x) => x.label && x.label.en && RB.known.STATE_WORD[x.state]), 'known ' + d.map + '/' + d.id + ': map, kind, states with words');
    const cm = m && RB.maps.compile(d.map);
    t.ok(cm && d.x >= 0 && d.y >= 0 && d.x < cm.w && d.y < cm.h, 'known ' + d.id + ': inside the map');
    for (const m2 of (d.show + '|' + d.states.map((x) => x.if || '').join('|')).matchAll(/seen\.([\w.]+)/g)) sceneRefs.push(m2[1]);
  }
  t.eq(sceneRefs.filter((id) => !C.scenes[id]), [], 'every scene a Known Details entry waits for exists');
  s = RB.state.newCampaign(); RB.game.s = s;
  t.eq(RB.known.entries(s, 'lf.tower_upper'), [], 'nothing shown before it is found');
  s.seen['lf.plate_a'] = true;
  t.eq(RB.known.entries(s, 'lf.tower_upper').map((e) => e.state), ['question'], 'found: unexplained');
  s.flags.lf_gate_a = true;
  t.eq(RB.known.entries(s, 'lf.tower_upper').map((e) => e.state), ['solved'], 'solved: the question mark is gone');
  RB.known.note(s, 'lf.tower_upper', 'panel', { label: { en: 'A panel' }, state: 'question', x: 2, y: 2 });
  RB.bus.emit('world:changed', { map: 'lf.tower_upper', prop: 'panel', state: 'solved' });
  t.eq(RB.known.entries(s, 'lf.tower_upper').map((e) => e.id + ':' + e.state), ['lf_gates_a:solved', 'panel:solved'], 'recorded details follow world:changed');
  for (let i = 0; i < 22; i++) RB.known.addPin(s, 'lf.tower_upper', { type: ['return', 'question', 'view', 'passage'][i % 4], note: 'n' + i, x: i, y: 1 });
  t.eq(RB.known.pins(s, 'lf.tower_upper').length, 20, 'at most 20 pins on a map');
  t.eq(RB.known.addPin(s, 'lf.tower_upper', { type: 'view' }), { ok: false, reason: 'full' }, 'the 21st is refused, nothing evicted');
  t.eq(RB.known.addPin(s, 'lf.tower_top', { type: 'nope' }).reason, 'unknown type', 'only the four kinds');
  const pin0 = RB.known.pins(s, 'lf.tower_upper')[0];
  RB.known.editPin(s, 'lf.tower_upper', pin0.id, { note: 'x'.repeat(300), type: 'passage' });
  t.ok(pin0.note.length === 200 && pin0.type === 'passage', 'edit: kind and note (cut to 200)');
  t.ok(RB.known.removePin(s, 'lf.tower_upper', pin0.id) && RB.known.pins(s, 'lf.tower_upper').length === 19, 'remove');
  s.map = 'lf.tower_upper';
  t.eq(RB.save.validate(JSON.parse(JSON.stringify(s))), [], 'a save with pins validates');
  RB.game.s = null;
};
