// Practice suite A (Practice addendum §15, §16, §8.1/§16.3, §23.6; docs/practice/suite_a.md):
// lantern tending's pool, scheduler use with caller-side cooldowns and short pools, one
// mastery event per objective, help never dimming a lamp, the first-session note, no story
// lantern flag / bond / currency change and no wall-clock reads; the writing desk's twenty
// cards resolved to existing lexicon records, notebook eligibility, trace/copy never
// promoting recall, prompted writing assessed only when unexposed, compact strokes, the
// six-page / 256 KiB budget with replace/cancel, storage failure; the mementos source, the
// display pin, the activities, the rest option and the world placements. Synthetic campaigns.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const L = RB.lanterns, D = RB.practiceDesk, P = RB.practice;
  const fresh = (o) => { const s = RB.state.newCampaign({}); s.map = 'rw.hall'; s.comp = 'mio'; Object.assign(s, o || {}); RB.game.s = s; return s; };
  const snap = (x) => JSON.stringify(x);
  const meet = (s, ids) => { for (const id of ids) RB.learn.record(id, { ok: true, mode: 'choice' }); };
  // count calls into the ordinary mastery recorder
  const rec = [];
  const realRecord = RB.learn.record;
  const spy = () => { rec.length = 0; RB.learn.record = (id, r) => { rec.push([id, r.ok, r.mode, !!r.assisted]); return realRecord(id, r); }; };
  const unspy = () => { RB.learn.record = realRecord; };

  // ---- lantern tending: place, unlock, the rack ---------------------------------------------
  const s0 = fresh();
  t.ok(!L.unlocked(s0), 'lamps are not offered before Chapter 1 has ended');
  s0.flags.ch1_done = true;
  t.ok(L.unlocked(s0) && L.here(s0), 'after ch1_done, in the Lantern Hall');
  t.ok(!L.here(Object.assign({}, s0, { map: 'rw.village' })), 'not from anywhere else');
  const hall = RB.content.maps['rw.hall'];
  const rack = hall.props.find((p) => p.p === 'pa_lamprack');
  t.ok(rack && rack.x === 9 && rack.y === 2 && rack.if === 'ch1_done' && rack.scene === 'pa.lamps', 'the practice lamps\' rack: (9,2), after ch1_done, scene pa.lamps');
  t.ok(RB.props.P.pa_lamprack && typeof RB.props.P.pa_lamprack.draw2 === 'function', 'the rack has art at art resolution');
  // the rack closes no path: every tile reachable before is reachable after (except its own)
  {
    const reach = (withRack) => {
      const save = hall.props;
      if (!withRack) hall.props = save.filter((p) => p.p !== 'pa_lamprack');
      RB.maps.invalidate && RB.maps.invalidate();
      const m = RB.maps.compile('rw.hall');
      hall.props = save;
      RB.maps.invalidate && RB.maps.invalidate();
      const ok = (x, y) => x >= 0 && y >= 0 && x < m.w && y < m.h && !m.block[y * m.w + x];
      const seen = new Set(['5,8']), q = [[5, 8]];
      while (q.length) { const [x, y] = q.shift(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const k = (x + dx) + ',' + (y + dy); if (!seen.has(k) && ok(x + dx, y + dy)) { seen.add(k); q.push([x + dx, y + dy]); } } }
      return seen;
    };
    const before = reach(false), after = reach(true);
    const lost = [...before].filter((k) => !after.has(k) && k !== '9,2');
    t.eq(lost, [], 'the rack blocks only its own corner tile (no path closed)');
    t.ok(after.has('8,2'), 'and the player can stand in front of it at (8,2)');
  }
  const scene = RB.content.scenes['pa.lamps'];
  const ops = scene.cmds.map((c) => c.op);
  t.ok(!ops.some((o) => ['set', 'unset', 'var', 'quest', 'give', 'take', 'depart', 'recruit'].indexOf(o) >= 0) && ops.indexOf('hook') >= 0, 'the rack\'s scene only offers the activity (no flag, quest or item change): ' + ops.join(','));

  // ---- the pool: familiar items, new vocabulary excluded by default -----------------------
  const s1 = fresh({ flags: { ch1_done: true } });
  s1.learn.profile = 'E'; s1.learn.kanaKnown = 'both';
  s1.visited = { 'rw.village': true, 'sg.harbor': true };
  meet(s1, ['v:水', 'v:海', 'v:山', 'k:あ']);
  const pool = L.pool(s1, { mode: 'review' });
  t.ok(['v:水', 'v:海', 'v:山', 'k:あ'].every((id) => pool.indexOf(id) >= 0), 'review: what has been met (' + pool.join(',') + ')');
  t.ok(pool.indexOf('v:風') < 0 && pool.indexOf('v:船') < 0, 'new vocabulary is not in the review pool');
  const nu = L.pool(s1, { mode: 'new' });
  t.ok(nu.length > 0 && nu.every((id) => !RB.learn.introduced(id)) && nu.indexOf('v:風') >= 0, 'Introduce something new: only words not yet introduced (' + nu.length + ')');
  const tops = L.topics(s1);
  t.ok(tops.some((x) => x.id === 'kana' && x.n === 1) && tops.some((x) => x.id === 'words' && x.n === 3), 'topics with counts: ' + JSON.stringify(tops.map((x) => x.id + ':' + x.n)));
  t.eq(L.pool(s1, { mode: 'topic', topic: 'kana' }), ['k:あ'], 'focus on a topic narrows the pool');

  // ---- the plan: 3 or 6, a short pool gives a short session, never repeats ------------------
  const p3 = L.plan(s1, { mode: 'review', count: 3 });
  t.ok(p3.items.length === 3 && new Set(p3.items).size === 3 && !p3.short, 'three lamps by default, all different');
  const p6 = L.plan(s1, { mode: 'review', count: 6 });
  t.ok(p6.items.length === 4 && p6.short && new Set(p6.items).size === 4, 'six asked, four eligible: four lamps, nothing repeated (' + p6.items.join(',') + ')');
  const s2 = fresh({ flags: { ch1_done: true } }); s2.learn.profile = 'E'; s2.learn.kanaKnown = 'both';
  meet(s2, ['v:水', 'v:海']);
  const short = L.plan(s2, { mode: 'review', count: 6 });
  t.ok(short.items.length === 2 && short.short, 'a two-item pool offers two lamps, not six');
  t.eq(L.plan(s2, { count: 4 }).count, 3, 'only 3 or 6 lamps (anything else is three)');

  // ---- the caller-side cooldown, across sessions ----------------------------------------------
  {
    const s = fresh({ flags: { ch1_done: true } }); s.learn.profile = 'E'; s.learn.kanaKnown = 'both';
    meet(s, ['v:水', 'v:海', 'v:山', 'v:空', 'v:雨', 'v:花', 'v:木']);
    L.state(s).recent = [{ id: 'v:水', missed: true }];
    for (let k = 0; k < 4; k++) t.ok(L.plan(s, { count: 6 }).items.indexOf('v:水') < 0, 'a missed item waits (' + k + ' objectives since)'), L.state(s).recent.push({ id: 'x' + k, missed: false });
    t.ok(L.cooldown(s).allow('v:水'), 'and may come back after four objectives');
    L.state(s).recent = [{ id: 'v:海', missed: false }];
    t.ok(!L.cooldown(s).allow('v:海'), 'never the identical objective at once, even in the next session');
    // the scheduler's own mistake cooldown is honoured too (the generic selector's fallback would refill with it)
    const r = RB.learn.rec('v:山'); r.cool = (s.learn.clock || 0) + 3;
    t.ok(L.pool(s, { mode: 'review' }).indexOf('v:山') < 0, 'an item resting after a recent mistake is left out of a short pool');
    // a short pool whose only items are resting: no lamps rather than repeats
    const s3 = fresh({ flags: { ch1_done: true } }); s3.learn.profile = 'E';
    meet(s3, ['v:水']);
    L.state(s3).recent = [{ id: 'v:水', missed: true }];
    t.eq(L.plan(s3, { count: 3 }).items, [], 'the only item just missed: an empty session, not the same weak item again');
  }

  // ---- one lamp: one authored step, one mastery event at most --------------------------------
  {
    const s = fresh({ flags: { ch1_done: true } }); s.learn.profile = 'E'; s.learn.kanaKnown = 'both';
    meet(s, ['v:海', 'k:あ']);
    const st1 = L.stepFor(s, 'v:海', 1);
    t.ok(st1 && st1.item && (st1.kind === 'write' || st1.kind === 'choose'), 'a word gets an authored step (' + (st1 && st1.kind) + ', ' + JSON.stringify(st1 && st1.item) + ')');
    t.ok(snap(L.stepFor(s, 'v:海', 1)) === snap(st1), 'the same lamp seed gives the same step (no hidden randomness)');
    const sk = L.stepFor(s, 'k:あ', 2);
    t.ok(sk && [].concat(sk.item).indexOf('k:あ') >= 0, 'a kana gets the kana task');
    // drills above the player's level are not used
    const hi = RB.content.drills.find((d) => d.lv === 'A' && typeof d.item === 'string' && d.item.slice(0, 2) === 'v:' && !RB.content.drills.some((x) => x !== d && x.item === d.item && x.lv !== 'A'));
    if (hi) { s.learn.profile = 'F'; const st = L.stepFor(s, hi.item, 3); t.ok(!st || st.id !== hi.id, 'an Advanced drill is not given to a Foundations player (' + hi.id + ')'); s.learn.profile = 'E'; }
    spy();
    const ob = P.objectives({ kind: 'lanterns', id: 1 });
    const a = L.tend(s, ob, 'lamp:1:0', 'v:海', st1, { ok: true, firstTry: false, mode: 'hand', assisted: false });
    t.ok(a.lit && a.missed && a.counted, 'a genuine mistake, then the right answer: the lamp is lit, one event (the mistake)');
    t.ok(!L.tend(s, ob, 'lamp:1:0', 'v:海', st1, { ok: true, firstTry: true, mode: 'hand' }).counted, 'a second result for the same objective adds no mastery event');
    const h = L.tend(s, ob, 'lamp:1:1', 'k:あ', sk, { ok: true, firstTry: null, mode: 'choice', assisted: true });
    t.ok(h.lit === true, 'help never dims a lamp: an assisted answer lights it just the same');
    const nw = L.tend(s, ob, 'lamp:1:2', 'v:風', { item: 'v:風' }, { ok: true, firstTry: true, mode: 'ime' }, { exposed: true });
    t.ok(nw.lit && !nw.counted && RB.learn.introduced('v:風'), 'a new word right after its card: lit, introduced, practice only');
    t.ok(!L.tend(s, ob, 'lamp:1:3', 'v:海', st1, { cancelled: true }).lit, 'leaving inside a step lights nothing and records nothing');
    t.eq(rec.map((r) => [r[0], r[1]]), [['v:海', false], [sk.item, true]], 'exactly one ordinary event per objective, none for the new word: ' + JSON.stringify(rec));
    unspy();
    t.ok(L.state(s).recent.length <= 8 && L.state(s).recent.some((x) => x.id === 'v:海' && x.missed), 'the kept history is short and marks the miss');
  }

  // ---- a whole simulated session: no story flag, bond, currency or wall clock ----------------
  {
    const s = fresh({ flags: { ch1_done: true, departed: true, rw_echo_done: true, rw_hall_gather: true, lq_ally2: true } }); s.learn.profile = 'E'; s.learn.kanaKnown = 'both';
    meet(s, ['v:水', 'v:海', 'v:山', 'v:空']);
    const flags0 = snap(s.flags), comp0 = snap(s.company), inv0 = snap(s.inv), disc0 = snap(s.discovery), gold0 = s.gold;
    const awarded = [];
    const realAward = RB.company.award;
    RB.company.award = (...a) => { awarded.push(a); return realAward.apply(null, a); };
    const realNow = Date.now, RealDate = globalThis.Date;
    let clockReads = 0;
    Date.now = () => { clockReads++; return realNow(); };
    const ob = P.objectives({ kind: 'lanterns', id: 9 });
    const plan = L.plan(s, { mode: 'review', count: 6 });
    plan.items.forEach((id, i) => { const st = L.stepFor(s, id, i); L.tend(s, ob, 'lamp:9:' + i, id, st, { ok: true, firstTry: i !== 1, mode: ['hand', 'choice', 'ime'][i % 3], assisted: i === 2 }); });
    const fin = L.finish(s, plan.items.length);
    Date.now = realNow;
    RB.company.award = realAward;
    t.eq(clockReads, 0, 'planning, tending and finishing read no wall clock');
    t.ok(snap(s.flags) === flags0, 'no story or lantern flag changed');
    t.ok(snap(s.company) === comp0 && !awarded.length, 'no bond, no memory, nothing through RB.company.award');
    t.ok(snap(s.inv) === inv0 && s.gold === gold0 && snap(s.discovery) === disc0, 'no currency, item or keepsake');
    t.ok(fin.firstNote && s.notebook.filter((n) => n.id === 'pa_lamps').length === 1, 'the first session adds one notebook note');
    t.ok(!L.finish(s, 3).firstNote && s.notebook.filter((n) => n.id === 'pa_lamps').length === 1, 'later sessions add nothing more');
    t.ok(RB.content.notes.pa_lamps && /no schedule/.test(RB.content.notes.pa_lamps.en) && !/day|daily|streak|missed/i.test(RB.content.notes.pa_lamps.en), 'the note promises no schedule and says nothing about days or streaks');
    void RealDate;
  }

  // ---- the activity, its eligibility and the Words index ------------------------------------
  {
    t.ok(RB.activity.kinds().indexOf('lanterns') >= 0 && RB.activity.kinds().indexOf('copying') >= 0, 'both activities are registered (lanterns, copying)');
    const s = fresh({ flags: { ch1_done: true } });
    RB.game.setBase('world');
    t.ok(RB.activity.eligible('lanterns').ok, 'eligible in the Hall, in plain walking');
    s.map = 'rw.village';
    t.ok(!RB.activity.eligible('lanterns').ok, 'not away from the Hall (no remote launch)');
    s.map = 'rw.hall'; delete s.flags.ch1_done;
    t.ok(!RB.activity.eligible('lanterns').ok, 'not before Chapter 1 has ended');
    s.flags.ch1_done = true;
    RB.game.pushMode('dialogue');
    t.ok(!RB.activity.eligible('lanterns').ok, 'not during a scene or dialogue');
    RB.game.popMode('dialogue');
    const acts = P.activities();
    const la = acts.find((d) => d.id === 'lanterns'), de = acts.find((d) => d.id === 'desk');
    t.ok(la && de && la.here(s) && !de.here(s), 'Ways to practise lists both; "here" only where each is');
    t.ok(typeof RB.hooks.pa_lamps === 'function' && typeof RB.hooks.pa_desk === 'function', 'the world scenes\' hooks exist');
  }

  // ---- the writing desk: the twenty cards ------------------------------------------------------
  const cards = D.cards(fresh());
  t.eq(cards.length, 20, 'twenty base cards');
  t.eq(cards.map((c) => c.id), ['water', 'light', 'wind', 'stone', 'voice', 'road', 'name', 'letter', 'sky', 'rain', 'flower', 'tree', 'river', 'sea', 'mountain', 'star', 'moon', 'morning', 'night', 'home'], 'the concepts the addendum names, in order');
  for (const c of cards) {
    const e = RB.lex.get(c.w, c.r);
    t.ok(e && e.src.indexOf('core') >= 0 && e.src.indexOf('practice_a') < 0 && c.item === 'v:' + e.w, c.id + ' → existing record ' + c.w + '【' + c.r + '】 “' + (e && e.m) + '”');
    t.ok(D.writable(c.w) && D.writable(c.r), c.id + ': every character has reference stroke data');
    t.ok(c.full.jp.indexOf(c.mark) >= 0 && c.accept.indexOf(c.r) >= 0 && c.accept.indexOf(c.w) >= 0, c.id + ': its sentence contains it; kana and kanji are accepted');
    t.ok(RB.challenge.check(c.r, { kind: 'write', answer: c.r, accept: c.accept, mode: 'reading' }).ok && RB.challenge.check(c.w, { kind: 'write', answer: c.r, accept: c.accept, mode: 'reading' }).ok, c.id + ': the answer checker accepts both forms');
  }
  t.ok(RB.challenge.check('いえ', { kind: 'write', answer: 'うち', accept: cards.find((c) => c.id === 'home').accept, mode: 'reading' }).ok, 'home: うち in context, いえ also accepted');
  t.ok(!RB.lex.problems().some((p) => p.src === 'practice_a') && !RB.lex.conflicts().some((c) => c.incoming && c.incoming.src === 'practice_a'), 'the suite\'s own lexicon entries conflict with nothing');

  // ---- notebook words ---------------------------------------------------------------------------------
  {
    const s = fresh();
    s.notebook = [
      { kind: 'word', id: 'w:船|ふね', surface: '船', reading: 'ふね', m: 'boat' },
      { kind: 'word', id: 'w:ありがとうございます|ありがとうございます', surface: 'ありがとうございます', reading: '', m: 'thank you' },
      { kind: 'word', id: 'w:水|みず', surface: '水', reading: 'みず', m: 'water' },
      { kind: 'word', id: 'w:ほげほげ|ほげほげ', surface: 'ほげほげ', reading: 'ほげほげ', m: '?' },
      { kind: 'lore', id: 'rw_roads' },
    ];
    const nb = D.notebookCards(s);
    t.eq(nb.map((c) => c.w), ['船'], 'notebook: a known word with a lexicon record, ≤8 clusters, real stroke data (not a base card again, not one without a record, not one over eight clusters)');
    t.eq(D.graphemes('ありがとうございます').length, 10, 'clusters counted as displayed');
  }

  // ---- compact strokes and page records ---------------------------------------------------------------
  {
    const s = fresh();
    const ref = RB.recog.reference('水');
    const ink = [{ ch: '水', strokes: ref.strokes.map((st) => st.map((p) => ({ x: p.x / ref.box, y: p.y / ref.box, t: 5 }))) }];
    const packed = D.pack(ink);
    const back = D.unpack(packed);
    t.ok(back[0].strokes.length === ink[0].strokes.length && back[0].strokes.every((st, i) => st.length <= ink[0].strokes[i].length), 'packing keeps every stroke and never adds points');
    const err = Math.max(...back[0].strokes.map((st) => Math.max(...st.map((p) => Math.min(...ink[0].strokes.flat().map((q) => Math.hypot(q.x - p.x, q.y - p.y)))))));
    t.ok(err < 0.002, 'every kept point is the player\'s own (within quantisation, ' + err.toFixed(5) + ')');
    const pg = D.makePage(s, { word: '水', reading: 'みず', mode: 'trace', ink, label: '  Water,\n traced  ' });
    t.ok(pg.kind === 'desk' && pg.mode === 'trace' && pg.strokes && pg.label === 'Water, traced' && pg.bytes === D.measure(pg) && pg.bytes < 4096 && pg.saved === false, 'a traced page: compact strokes, a clean label, its byte size (' + pg.bytes + ' B)');
    const ty = D.makePage(s, { word: '水', reading: 'みず', mode: 'typeset', typeset: { jp: '{水|みず}', layout: 'card' }, ink, label: 'x' });
    t.ok(!ty.strokes && ty.typeset && !D.handwritten(ty), 'a typeset page never carries strokes and is never "your handwriting"');
    let threw = 0;
    try { D.makePage(s, { word: '水', mode: 'copy', label: 'x' }); } catch (e) { threw++; }
    try { D.makePage(s, { word: '水', mode: 'scribble', ink, label: 'x' }); } catch (e) { threw++; }
    t.eq(threw, 2, 'a handwriting page needs real strokes; modes are the four');
    t.ok(D.handwritten(pg), 'a page with saved strokes is handwriting');
  }

  // ---- the six-page / 256 KiB budget, replace or cancel, storage ---------------------------------------
  {
    const s = fresh();
    RB.game.s = s;
    const realAuto = RB.save.autosave, realCur = RB.save.current, realStatus = RB.save.status;
    let writes = 0, fail = false;
    RB.save.current = () => ({ slot: 2, rev: 0, readOnly: false });
    RB.save.status = () => ({ mode: 'idb' });
    RB.save.autosave = async () => { writes++; return fail ? null : { ok: 1 }; };
    const strokes = (k) => [{ ch: '木', strokes: [[{ x: 0.1, y: 0.2 + k * 0.01 }, { x: 0.9, y: 0.2 }], [{ x: 0.5, y: 0.05 }, { x: 0.5, y: 0.95 }]] }];
    const page = (k) => ({ word: '木', reading: 'き', mode: 'copy', ink: strokes(k), label: 'Tree ' + k });
    let asked = 0, answer = null;
    D.setChooser(async (s2, pages, pg) => { asked++; t.ok(pages.length === 6 && pg && pg.label, 'the chooser sees the six pages and the new one (previews)'); return answer; });
    for (let k = 0; k < 6; k++) { const r = await D.keepPage(s, page(k)); t.ok(r.ok && r.saved, 'page ' + (k + 1) + ' kept and saved'); }
    t.ok(D.pages(s).every((p) => p.saved === true) && writes === 6, 'each keep writes the campaign once; pages are marked saved only after a write');
    const ids = D.pages(s).map((p) => p.id);
    answer = null;
    const c = await D.keepPage(s, page(7));
    t.ok(!c.ok && c.cancelled && asked === 1 && D.pages(s).length === 6 && snap(D.pages(s).map((p) => p.id)) === snap(ids), 'a seventh page asks first; cancel leaves the six exactly as they were');
    answer = { replace: ids[2] };
    const rp = await D.keepPage(s, page(8));
    t.ok(rp.ok && rp.replaced === ids[2] && D.pages(s).length === 6 && D.pages(s).map((p) => p.id).indexOf(ids[2]) < 0 && D.pages(s)[2].label === 'Tree 8', 'replace: the chosen page only, in its place, still six');
    // a page over budget is refused, never truncated silently
    const noisy = [{ ch: '木', strokes: Array.from({ length: 400 }, (_, i) => Array.from({ length: 200 }, (__, j) => ({ x: ((i * 37 + j * 13) % 997) / 997, y: ((i * 53 + j * 71) % 991) / 991 }))) }];
    const big = D.makePage(s, { word: '木', mode: 'trace', ink: noisy, label: 'Noise' });
    const raw = JSON.stringify(noisy).length;
    t.ok(big.bytes < raw / 4, 'an enormous page is compacted (' + raw + ' B of raw points → ' + big.bytes + ' B)');
    D.setChooser(async () => ({ replace: D.pages(s)[0].id }));
    const rb = await D.keepPage(s, { word: '木', mode: 'trace', ink: noisy, label: 'Noise' });
    t.ok(rb.ok && rb.page.bytes <= D.MAX_BYTES && Math.abs(rb.page.bytes - big.bytes) < 64, 'compacted under 256 KiB (' + big.bytes + ' B): kept within budget');
    // a page no simplification can bring under 256 KiB (wide zigzags, every point a corner)
    const zig = [{ ch: '木', strokes: Array.from({ length: 1000 }, (_, i) => Array.from({ length: 100 }, (__, j) => ({ x: j / 99, y: (j + i) % 2 ? 0.9 : 0.1 }))) }];
    const huge = D.makePage(s, { word: '木', mode: 'trace', ink: zig, label: 'Zigzag' });
    t.ok(huge.bytes > D.MAX_BYTES, 'a page beyond any compacting stays over budget (' + huge.bytes + ' B)');
    const before2 = snap(D.pages(s));
    const rz = await D.keepPage(s, { word: '木', mode: 'trace', ink: zig, label: 'Zigzag' });
    t.ok(!rz.ok && rz.error === 'too-large' && rz.page && snap(D.pages(s)) === before2, 'over 256 KiB after compacting: refused (the art is returned, unsaved), nothing replaced');
    // storage refuses the write: the pages go back exactly as they were (ordinary saving keeps working)
    const s5 = fresh(); RB.game.s = s5;
    for (let k = 0; k < 6; k++) await D.keepPage(s5, page(k));
    const pre = snap(D.pages(s5));
    D.setChooser(async (x, pages) => ({ replace: pages[0].id }));
    fail = true;
    const sf = await D.keepPage(s5, page(9));
    t.ok(!sf.ok && sf.error === 'storage' && sf.saved === false && sf.page && sf.page.saved === false, 'a refused write: not kept, the new art returned marked unsaved');
    t.ok(snap(D.pages(s5)) === pre, 'and the six earlier pages are back exactly (the replaced one restored)');
    const s6 = fresh(); RB.game.s = s6;
    const sf2 = await D.keepPage(s6, page(1));
    t.ok(!sf2.ok && D.pages(s6).length === 0, 'a refused write of a first page leaves no unsaved record behind');
    fail = false;
    // no slot / read-only / session-only: kept in the journey, but never claimed as saved
    RB.save.current = () => ({ slot: null });
    const ns = await D.keepPage(s6, page(2));
    t.ok(ns.ok && !ns.saved && ns.why === 'no-slot' && D.pages(s6)[0].saved === false, 'no save slot: kept, not saved, says why');
    RB.save.current = () => ({ slot: 3, readOnly: true });
    t.eq((await D.keepPage(s6, page(3))).why, 'read-only', 'read-only tab: not saved');
    RB.save.current = () => ({ slot: 3, readOnly: false });
    RB.save.status = () => ({ mode: 'session' });
    const se = await D.keepPage(s6, page(4));
    t.ok(se.ok && !se.saved && se.why === 'session' && D.pages(s6).every((p) => p.saved === false), 'session-only storage: never marked saved');
    RB.save.status = () => ({ mode: 'idb' });
    t.ok((await D.persist(s6)).saved && D.pages(s6).every((p) => p.saved === true), 'a later successful write marks them saved');
    // rename / remove are explicit; editing grants nothing
    const comp0 = snap(s6.company);
    t.ok(D.rename(s6, D.pages(s6)[0].id, '<b>Mine</b>') && D.pages(s6)[0].label === '<b>Mine</b>', 'a label is kept as plain text (escaped when shown)');
    t.ok(!D.rename(s6, D.pages(s6)[0].id, '   '), 'an empty label is refused');
    const n0 = D.pages(s6).length;
    t.ok(D.removePage(s6, D.pages(s6)[0].id) && D.pages(s6).length === n0 - 1, 'remove: only the page asked for');
    t.ok(snap(s6.company) === comp0, 'keeping, renaming and removing pages award nothing');
    // loading: pages read from storage are saved; unknown records are kept
    const st = { practice: { deskPages: [{ id: 'a', kind: 'desk', mode: 'trace', saved: false }, { id: 'f', kind: 'future-kind', saved: false }, 'junk'] } };
    D.migrate(st);
    t.ok(st.practice.deskPages.length === 3 && st.practice.deskPages[0].saved && st.practice.deskPages[1].saved && st.practice.deskPages[1].kind === 'future-kind', 'a loaded save: its pages are saved; an unknown kind is kept, not deleted');
    RB.save.autosave = realAuto; RB.save.current = realCur; RB.save.status = realStatus;
    D.setChooser(RB.ui.desk.chooser);
  }

  // ---- the learning adapter for desk modes ------------------------------------------------------------
  {
    const s = fresh(); s.learn.profile = 'E';
    const card = D.cards(s).find((c) => c.id === 'river');
    spy();
    const ob = P.objectives({ kind: 'copying', id: 3 });
    const tr = D.record(s, ob, 'desk:3:1', card, 'trace', null);
    const cp = D.record(s, ob, 'desk:3:2', card, 'copy', null);
    t.ok(!tr.counted && !cp.counted && rec.length === 0 && RB.learn.introduced(card.item), 'trace and copy never promote recall (no mastery event); the card is introduced');
    t.ok(!RB.learn.rec(card.item).modes.hand && RB.learn.rec(card.item).box === 0, 'and the item\'s handwriting tally and box are untouched');
    const ty = D.record(s, ob, 'desk:3:3', card, 'typeset', null);
    t.ok(!ty.counted && rec.length === 0, 'typeset is decoration: no event');
    const pe = D.record(s, ob, 'desk:3:4', card, 'prompt', { ok: true, firstTry: true, mode: 'hand' }, { exposed: true });
    t.ok(!pe.counted && rec.length === 0, 'prompt after the word was shown at this desk: practice only');
    const pa = D.record(s, ob, 'desk:3:5', card, 'prompt', { ok: true, firstTry: null, mode: 'hand', assisted: true });
    t.ok(!pa.counted && pa.exposed && rec.length === 0, 'prompt with the model, the answer or other help: practice only');
    const pu = D.record(s, ob, 'desk:3:6', card, 'prompt', { ok: true, firstTry: true, mode: 'hand' });
    t.ok(pu.counted && rec.length === 1 && rec[0][0] === card.item && rec[0][1] === true && rec[0][2] === 'hand', 'prompt written without the answer in view: one ordinary assessment');
    t.ok(!D.record(s, ob, 'desk:3:6', card, 'prompt', { ok: true, firstTry: true, mode: 'hand' }).counted && rec.length === 1, 'never a second event for the same objective');
    const pw = D.record(s, ob, 'desk:3:7', card, 'prompt', { ok: true, firstTry: false, mode: 'ime' });
    t.ok(pw.counted && rec.length === 2 && rec[1][1] === false, 'a genuine confirmed mistake can be that one event');
    unspy();
    t.ok(s.practice.tally.desk && s.practice.tally.desk.trace === 1 && s.practice.tally.desk.copy === 1 && s.practice.tally.desk.typeset === 1 && s.practice.tally.desk.prompt === 5 && s.practice.tally.desk.promptExposed === 2, 'each mode kept as its own practice tally: ' + snap(s.practice.tally.desk));
  }

  // ---- the prompt step: meaning and context first, never the answer ---------------------------------------
  {
    const s = fresh(); s.learn.profile = 'E';
    for (const c of D.cards(s)) {
      const st = RB.ui.desk.promptStep(c);
      const shown = (st.prompt.en || '') + ' ' + RB.tasks.plain(st.template ? st.template.before + st.template.after : '') + ' ' + (st.ctx ? RB.tasks.plain(st.ctx.jp || '') : '');
      t.ok(st.kind === 'write' && st.item === c.item && st.template && shown.indexOf(c.w) < 0 && !/[\u3040-\u30ff\u4e00-\u9fff]/.test(st.prompt.en), c.id + ': the prompt shows its meaning and a sentence with a gap, never the word itself');
    }
  }

  // ---- the desk's place, the rest menu, the activity ---------------------------------------------------------
  {
    const inn = RB.content.maps['sg.inn'];
    const desk = inn.props.find((p) => p.p === 'smalltable' && p.x === 9 && p.y === 7);
    t.ok(desk && desk.scene === 'pa.desk', 'the writing desk is the Gull\'s small table at (9,7), which had no interaction of its own');
    const dops = RB.content.scenes['pa.desk'].cmds.map((c) => c.op);
    t.ok(dops.indexOf('hook') >= 0 && !dops.some((o) => ['set', 'unset', 'quest', 'give', 'take'].indexOf(o) >= 0), 'its scene only offers the desk');
    const s = fresh({ map: 'sg.inn', chapter: 2 });
    const opts = RB.company.restOptions(s, { kind: 'inn', map: 'sg.inn' });
    t.ok(opts.some((o) => o.label.en === 'Writing desk'), 'at the Gull\'s rest menu: Writing desk (added after the existing choices)');
    t.ok(!RB.company.restOptions(s, { kind: 'tea', map: 'rw.tea' }).some((o) => o.label.en === 'Writing desk'), 'not at a rest place without a desk');
    RB.game.setBase('world');
    t.ok(RB.activity.eligible('copying').ok, 'the desk is eligible at the Gull');
    s.map = 'sg.harbor';
    t.ok(!RB.activity.eligible('copying').ok, 'and nowhere else');
  }

  // ---- Practice mementos: sources, the shelf, the pinned display ---------------------------------------------
  {
    const s = fresh();
    RB.practice.of(s).deskPages.push(D.makePage(s, { word: '月', reading: 'つき', mode: 'copy', ink: [{ ch: '月', strokes: [[{ x: 0.2, y: 0.2 }, { x: 0.2, y: 0.8 }]] }], label: 'Moon' }));
    RB.practice.of(s).deskPages.push({ id: 'pf1', kind: 'proof', mode: 'proof', label: 'Notice', typeset: { jp: 'みぎ' }, bytes: 10, saved: true });
    const ms = P.mementos(s).filter((m) => m.source === 'desk');
    t.ok(ms.length === 1 && ms[0].handwriting && /Your handwriting/.test(ms[0].kind) && typeof ms[0].draw === 'function', 'the desk source lists its own pages (not the proofreader\'s), handwriting labelled as such');
    const d = s.practice.mementoDisplay;
    t.ok(d && d.shelf === null && d.pin === null, 'the practice shelf and pin start empty');
    d.pin = 'desk:' + ms[0].id;
    RB.ui.practiceMementos.syncPin(s);
    t.eq(d.pin, 'desk:' + ms[0].id, 'a practice memento pinned while no keepsake is up stays pinned');
    const kid = Object.keys(RB.content.keepsakes).find((k) => RB.content.keepsakes[k].category !== 'shared');
    s.discovery.keepsakes[kid] = { map: 'rw.village' };
    s.discovery.display = kid;
    RB.ui.practiceMementos.syncPin(s);
    t.ok(d.pin === null && s.discovery.display === kid, 'a keepsake put on display later takes the spot; the keepsake itself is untouched');
    d.shelf = 'desk:' + ms[0].id;
    D.removePage(s, ms[0].id);
    t.ok(d.shelf === null, 'removing a page takes it off the shelf');
  }
};
