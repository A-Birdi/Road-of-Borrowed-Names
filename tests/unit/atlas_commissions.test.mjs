// The Atlas's commissions (expansion P07, plan D7; src/atlas/80_commissions.js, the generator's commission hooks in
// src/atlas/30_gen.js). The playbook's evidence: topic constraints; unseen concept teaching; geometry unchanged after
// mistakes; surveys optional and useful; ordinary resume preserved; Atlas topology fixed while permitted practice
// adapts; and ordinary runs exactly as before.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, K = RB.atlasCommissions, AT = RB.atlas;
  const J = (x) => JSON.stringify(x);
  const camp = (id) => { const s = RB.state.newCampaign({ edition: 2 }); s.id = id; s.flags.postgame = true; s.atlas.unlocked = true; s.comp = 'mio'; RB.game.s = s; return s; };
  const met = (s, id, box, bad) => { s.learn.items[id] = { id, seen: 3, ok: 2, bad: bad || 0, box, last: 0, due: 0, cool: 0 }; };

  // ---- the board: practice topics from the evidence, themed and survey offers; reading makes no record ----------
  const s = camp('cm-1');
  const G = RB.exams.FAMILIES;
  for (const g of G.requests.ids) met(s, 'g:' + g, 0, 3);   // weak
  for (const g of G.particles.ids) met(s, 'g:' + g, 4, 0);  // strong
  for (const g of G.verbs.ids) met(s, 'g:' + g, 2, 1);      // middling
  const offers = K.offers(s);
  const practice = offers.filter((o) => o.kind === 'practice');
  t.ok(practice.length >= 2 && practice[0].topic.items.indexOf('g:v_te_kudasai') >= 0, 'the weakest group met comes first as a practice topic: ' + practice.map((o) => o.title.en).join(' | '));
  t.ok(practice.every((o) => o.topic.items.indexOf('g:prt_wa') < 0) || practice.findIndex((o) => o.topic.items.indexOf('g:prt_wa') >= 0) > 0, 'a strong group never comes before a weak one');
  t.ok(practice.every((o) => o.topic.items.some((id) => s.learn.items[id])), 'every practice topic rests on evidence: nothing never answered is called weak (' + practice.map((o) => o.id).join(', ') + ')');
  t.eq(offers.filter((o) => o.kind === 'themed').length, K.THEMED.length, 'every themed commission is on the board');
  t.eq(offers.filter((o) => o.kind === 'survey').map((o) => o.area), Object.keys(K.AREAS), 'a survey for each area');
  t.ok(!s.atlas.commissions, 'reading the board makes no record');
  const c0 = K.commission(practice[0], 'short');
  practice[0].topic.items.push('g:zzz');
  t.ok(c0.topic.items.indexOf('g:zzz') < 0 && c0.length === 'short', 'a commission is fixed when taken: a copy of its topic, its length');

  // ---- the shape: ordinary runs untouched; lengths; a survey's area; a theme's lean -------------------------------
  const runFor = (seed, c) => { const r = AT.newRun(s, [], { seed }); if (c) r.commission = c; return r; };
  const count = (pl) => Object.keys(pl.rooms).length;
  let same = 0, shorter = 0, longer = 0, inArea = 0, outArea = 0, lean = 0;
  const themedRoute = K.commission(offers.find((o) => o.id === 'themed:route'), 'standard');
  for (let seed = 1; seed <= 60; seed++) {
    const base = AT.plan(runFor(seed));
    const std = AT.plan(runFor(seed, K.commission(offers.find((o) => o.kind === 'practice'), 'standard')));
    if (J(base.rooms) === J(std.rooms)) same++;
    if (count(AT.plan(runFor(seed, K.commission(practice[0], 'short')))) < count(base)) shorter++;
    if (count(AT.plan(runFor(seed, K.commission(practice[0], 'long')))) > count(base)) longer++;
    const sv = AT.plan(runFor(seed, K.commission(offers.find((o) => o.id === 'survey:water'), 'standard')));
    for (const d of Object.values(sv.rooms)) if (d.kind === 'path' || d.kind === 'branch') { if (K.AREAS.water.patterns.indexOf(d.pattern) >= 0) inArea++; else outArea++; }
    const th = AT.plan(runFor(seed, themedRoute));
    if (Object.values(th.rooms).some((d) => d.pattern === 'doors')) lean++;
  }
  t.eq(same, 60, 'a practice commission of standard length has exactly an ordinary run\'s shape (60 seeds): only the practice inside differs');
  t.ok(shorter === 60 && longer === 60, 'short is always shorter (no camp), long always longer (' + shorter + ', ' + longer + ')');
  t.ok(inArea > outArea * 4, 'a survey keeps to its area\'s rooms wherever a branch allows (' + inArea + ' in, ' + outArea + ' out)');
  t.ok(lean >= 55, 'the lost route leans on the hall of three doors (' + lean + ' of 60 runs)');
  const shortPlan = AT.plan(runFor(5, K.commission(practice[0], 'short')));
  t.ok(!shortPlan.rooms.c && shortPlan.rooms.x && shortPlan.rooms.z && Object.values(shortPlan.rooms).filter((d) => d.next.indexOf('x') >= 0).length === 2, 'short: one fork, no camp, both branches to the guardian, the road home after');

  // ---- the topic: lamps ask only about it, unmet items taught first; ordinary lamps unchanged -----------------------
  const s2 = camp('cm-2');
  for (const g of G.requests.ids.slice(0, 4)) met(s2, 'g:' + g, 1, 1);
  const topicC = K.commission({ kind: 'themed', id: 'themed:orders', title: { en: 'x', jp: '' }, topic: K.themed('orders').topic, prefer: 'sign' }, 'standard');
  const items = new Set(topicC.topic.items);
  let inTopic = 0, outTopic = 0;
  for (let seed = 1; seed <= 30; seed++) {
    const run = runFor(seed, topicC);
    for (let i = 0; i < 3; i++) { const st = AT.lampStep({ seed: seed * 7 + i, lamps: 3 }, run, s2.learn.profile, i, (seed * 31 + i) >>> 0); if (st && items.has(st.topicItem)) inTopic++; else outTopic++; }
  }
  t.ok(inTopic === 90 && outTopic === 0, 'every lamp of a commission asks about its topic (' + inTopic + ' of 90)');
  const s3 = camp('cm-3');
  const fam = K.commission({ kind: 'themed', id: 'themed:endings', title: { en: 'x', jp: '' }, topic: K.themed('endings').topic }, 'standard');
  const fresh = AT.lampStep({ seed: 3, lamps: 2 }, runFor(9, fam), 'E', 0, 1234);
  t.ok(fresh && fresh.teachFirst === true && fam.topic.items.indexOf(fresh.topicItem) >= 0, 'an item never met is marked to be taught before it is asked: ' + (fresh && fresh.topicItem));
  for (const id of K.themed('endings').topic.items) t.ok(['F', 'E', 'I', 'A'].every((P) => { s3.learn.profile = P; return !!K.stepFor(s3, id, 0); }), id + ': a step at every profile');
  const plainRun = runFor(4);
  const lp = AT.lampStep({ seed: 4, lamps: 2 }, plainRun, 'E', 1, 99);
  t.ok(lp && !lp.topicItem, 'an ordinary run\'s lamps are as before (no topic)');

  // ---- the geometry is fixed: mistakes change the practice, never the route; resume rebuilds the same rooms --------
  const run = runFor(77, K.commission(offers.find((o) => o.id === 'survey:wild'), 'long'));
  const before = J(AT.buildMaps(run).maps);
  for (let i = 0; i < 40; i++) RB.learn.record('g:v_te_kudasai', { ok: false, mode: 'choice' });
  run.lastWrong = 'g:v_te_kudasai';
  t.eq(J(AT.buildMaps(run).maps), before, 'forty mistakes later the same route, rooms, exits and placements (D1, C-57)');
  const back = JSON.parse(J(run));
  t.eq(J(AT.buildMaps(back).maps), before, 'a saved run read back builds the same maps (ordinary resume preserved)');

  // ---- surveys: a landmark in every room of the area, every variant; the task at every profile ---------------------
  let rooms = 0, marked = 0;
  for (let seed = 1; seed <= 40; seed++) {
    for (const a in K.AREAS) {
      const r = runFor(seed, K.commission(offers.find((o) => o.id === 'survey:' + a), 'long'));
      const b = AT.buildMaps(r);
      for (const key in b.plan.rooms) {
        const d = b.plan.rooms[key];
        if (K.AREAS[a].patterns.indexOf(d.pattern) < 0 || ['path', 'branch', 'wild'].indexOf(d.kind) < 0) continue;
        rooms++;
        const def = b.maps[AT.mapId(r, key)];
        const m = def.props.find((p) => p.scene === 'atlas.survey.mark');
        if (m && def.atlas.survey) marked++;
      }
    }
  }
  t.ok(rooms > 200 && marked === rooms, 'every room of a surveyed area has its landmark (' + marked + ' of ' + rooms + ', every variant and mirror)');
  for (const P of ['F', 'E', 'I', 'A']) {
    const st = K.landmarkStep(run, 'p1', 'tide', P);
    t.ok(st.options.length === 3 && st.options.filter((o) => o.ok).length === 1 && st.options.every((o) => o.ok || o.why), P + ': three lines, one right, each wrong one says what it describes');
  }
  const bad = [];
  for (const k in K.LANDMARKS) for (const v of ['simple', 'rich']) { const jp = K.LANDMARKS[k][v].jp; if (RB.jp.validate(jp).length) bad.push(jp); for (const tk of RB.jp.parse(jp)) if (!tk.punct && !tk.ph && /[぀-ヿ一-鿿]/.test(tk.surface) && RB.jp.lookup(tk).unknown) bad.push(tk.surface); }
  t.eq(bad, [], 'every landmark line has its readings and every word is in the lexicon');

  // ---- finishing: what is kept; safe passage; the compass and the stamp ----------------------------------------------
  const s4 = camp('cm-4');
  for (const g of G.requests.ids) met(s4, 'g:' + g, 1, 1);
  const finish = (kind, area, verifyAll) => {
    const c = kind === 'survey' ? K.commission(K.offers(s4).find((o) => o.id === 'survey:' + area), 'standard') : K.commission(K.offers(s4).find((o) => o.kind === kind), 'short');
    const r = runFor(area === 'water' ? 11 : area === 'wild' ? 12 : 13, c);
    AT.register(r);
    const pl = AT.planOf(r);
    // walk the first branch at each fork, to the road home
    r.path = []; let k = pl.start; while (k) { r.path.push(k); k = pl.rooms[k].next[0]; }
    r.survey = { marks: {} };
    for (const key of r.path) { const def = C.maps[AT.mapId(r, key)]; if (def && def.atlas.survey && (verifyAll || key !== r.path.find((x) => C.maps[AT.mapId(r, x)].atlas.survey))) r.survey.marks[key] = true; }
    const out = K.finished(s4, r, 'complete');
    AT.unregister(r.id);
    return out;
  };
  t.eq(finish('practice').kind, 'practice', 'a practice commission finished');
  t.ok(s4.atlas.commissions && s4.atlas.commissions.practice === 1, 'the record made at the first finish, not before');
  const missing = finish('survey', 'water', false);
  t.ok(!missing.surveyComplete && !s4.atlas.commissions.surveys.water, 'a survey with a landmark left unverified is not recorded (optional, and it waits for another walk)');
  t.ok(finish('survey', 'water', true).survey === 'water' && s4.atlas.commissions.surveys.water.route.length > 3, 'a survey with every landmark on its road verified goes into the Cartographer\'s Atlas');
  // safe passage in a later run
  const later = runFor(21);
  later.safe = K.surveyed(s4);
  const lb = AT.buildMaps(later);
  const safeRooms = Object.values(lb.maps).filter((d) => d.atlas.safe);
  t.ok(safeRooms.length === 0 || safeRooms.every((d) => !d.props.some((p) => p.p === 'atlas_veil')), 'a room of a surveyed area has no veil across its way on (' + safeRooms.length + ' such rooms in this run)');
  let anySafe = 0, veiled = 0, locked = 0;
  for (let seed = 30; seed < 60; seed++) {
    const r = runFor(seed); r.safe = ['water', 'lantern'];
    for (const d of Object.values(AT.buildMaps(r).maps)) {
      if (!d.atlas.safe) continue;
      anySafe++;
      if (d.props.some((p) => p.p === 'atlas_veil' || p.p === 'water')) veiled++;
      if (d.atlas.pattern === 'doors' && !d.exits.some((e) => e.correct && !e.locked)) locked++;
    }
  }
  t.ok(anySafe > 20 && veiled === 0 && locked === 0, 'surveyed rooms open their way in later runs: no veil, no flooded planks, the right door unlocked (' + anySafe + ' rooms over 30 runs)');
  t.ok(!s4.inv.atlas_cos_compass && !RB.stampBook.earned(s4, 'atlas.surveys'), 'one area surveyed: no compass, no stamp yet');
  finish('survey', 'lantern', true); const last = finish('survey', 'wild', true);
  t.ok(last.all && last.compass && s4.inv.atlas_cos_compass === 1, 'all three areas: the cartographer\'s compass');
  t.ok(RB.stampBook.earned(s4, 'atlas.surveys') === true && RB.stampBook.earned(camp('cm-5'), 'atlas.surveys') === false, 'and the stamp is earned (and not by a journey without the surveys)');
  t.ok(C.items.atlas_cos_compass.acc === 'atlas_compass' && RB.sprites._art && RB.sprites._art.ACC.atlas_compass && RB.atlasArt.ACC.atlas_compass, 'the compass is worn, drawn on the walking sprite and in the Atlas\'s');
  // the board in the hall
  const prop = (C.maps['rw.hall'].props || []).find((p) => p.scene === 'atlas.board');
  t.ok(prop && prop.if === 'ed>=2&postgame', 'the board: in the Lantern Hall, twelve-chapter journeys once the story is over');
};
