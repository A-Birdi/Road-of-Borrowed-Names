// The addendum's shared foundation (docs/ADDENDUM_CONTRACTS.md): save
// namespaces and their migration, once-only commits, bond as unique events
// (capped, stage words, only with a committed companion), memories kept once
// with an event-time pet snapshot, reactions chosen once and stable, keepsake
// discoveries once, the new condition heads, and the folio's Company tab and
// page registries.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const S = RB.state, K = RB.company;
  const fresh = (o) => { const s = S.newCampaign({}); s.map = 'rw.village'; Object.assign(s, o || {}); return s; };

  // ---- namespaces, migration, validation -------------------------------------------------------
  const s0 = fresh();
  for (const k of ['company', 'discovery', 'bookmarks', 'creatures', 'awarded']) t.ok(k in s0, 'a new campaign has ' + k);
  t.eq(s0.company.pet, null, 'no pet at the start (a complete state)');
  const old = JSON.parse(JSON.stringify(fresh()));
  for (const k of ['company', 'discovery', 'bookmarks', 'creatures', 'awarded']) delete old[k];
  t.eq(RB.save.validate(old), [], 'a save from before these records validates');
  const mig = RB.save.migrate(JSON.parse(JSON.stringify(old)));
  t.ok(mig.company && Array.isArray(mig.company.memories) && mig.discovery && mig.discovery.keepsakes && Array.isArray(mig.bookmarks), 'migrate fills empty records');
  const part = JSON.parse(JSON.stringify(fresh()));
  delete part.company.react; delete part.discovery.pins;
  RB.save.migrate(part);
  t.ok(part.company.react && part.discovery.pins, 'migrate fills missing keys inside company and discovery');
  const bad = JSON.parse(JSON.stringify(fresh())); bad.company = 'x'; bad.bookmarks = {};
  t.eq(RB.save.validate(bad).sort(), ['bad bookmarks', 'bad company'], 'the wrong shape is reported');
  let ran = 0; RB.save.addMigration((st) => { ran++; st.__m = true; });
  const m2 = RB.save.migrate(JSON.parse(JSON.stringify(old)));
  t.ok(ran === 1 && m2.__m, 'registered migrations run on load');

  // ---- once ------------------------------------------------------------------------------------------
  const s1 = fresh();
  t.eq([S.once(s1, 'x'), S.once(s1, 'x'), S.once(s1, 'y')], [true, false, true], 'once: the first commit only');

  // ---- bond ------------------------------------------------------------------------------------------
  const s2 = fresh();
  t.eq(K.award(s2, 'ch2', 1), false, 'no bond without a committed companion');
  s2.comp = 'mio';
  t.eq([K.award(s2, 'ch2', 1), K.award(s2, 'ch2', 1)], [true, false], 'a bond event counts once');
  t.eq([K.score(s2), K.stage(s2).id], [1, 'walking'], 'score 1: Walking Together');
  K.award(s2, 'ch3', 1); K.award(s2, 'pq', 3);
  t.eq([K.score(s2), K.stage(s2).id, K.stage(s2).label.en], [5, 'rhythm', 'Finding a Rhythm'], 'score 5: Finding a Rhythm');
  K.award(s2, 'ending', 2); K.award(s2, 'ch4', 1);
  t.eq(K.stage(s2).id, 'trusted', 'score 8: Trusted Company');
  for (const id of ['ch5', 'project:1', 'project:2', 'project:3', 'reflect:travel', 'reflect:keep']) K.award(s2, id, 1);
  t.eq([K.score(s2), K.stage(s2).id], [12, 'lasting'], 'capped at 12: A Lasting Bond');
  t.ok(S.test(s2, 'bond>=trusted') && S.test(s2, 'bond=lasting') && !S.test(fresh({ comp: 'nao' }), 'bond>=rhythm'), 'bond condition by stage');

  // ---- memories ---------------------------------------------------------------------------------------
  const s3 = fresh({ comp: 'ren' });
  s3.company.pets.cat = { name: 'Koma' }; s3.company.pet = 'cat';
  t.eq([K.memory(s3, { id: 'm1', kind: 'pets', title: { en: 'A dry corner', jp: '' } }), K.memory(s3, { id: 'm1', kind: 'pets' })], [true, false], 'a memory is kept once');
  s3.company.pets.cat.name = 'Tama';
  t.eq(s3.company.memories[0].pet, { species: 'cat', name: 'Koma' }, 'the memory keeps the pet\'s name at that time');
  t.ok(S.test(s3, 'memory.m1') && !S.test(s3, 'memory.m2'), 'memory condition');

  // ---- reactions ----------------------------------------------------------------------------------------
  K.addReactions([
    { id: 'r_a', comp: 'nao', event: 'puzzle:test', facts: { method: 'secured' }, lines: [{ jp: 'a', en: 'a' }] },
    { id: 'r_b', comp: 'nao', event: 'puzzle:test', facts: { method: 'secured' }, lines: [{ jp: 'b', en: 'b' }] },
    { id: 'r_c', comp: 'nao', event: 'puzzle:test', facts: { method: 'sheltered' }, priority: 1, lines: [{ jp: 'c', en: 'c' }] },
    { id: 'r_d', comp: 'mio', event: 'puzzle:test', lines: [{ jp: 'd', en: 'd' }] },
  ]);
  const s4 = fresh({ comp: 'nao' });
  const r1 = K.react(s4, { id: 'res1', event: 'puzzle:test', facts: { method: 'secured' } });
  t.ok(r1 && ['r_a', 'r_b'].includes(r1.id), 'the reaction fits the method actually used');
  const r1b = K.react(s4, { id: 'res1', event: 'puzzle:test', facts: { method: 'sheltered' } });
  t.eq(r1b.id, r1.id, 'the same resolution keeps its reaction (reloads, replays)');
  t.eq(K.react(s4, { id: 'res2', event: 'puzzle:test', facts: { method: 'sheltered' } }).id, 'r_c', 'a different method, a different line');
  t.eq(K.react(fresh({ comp: 'mio' }), { id: 'res3', event: 'puzzle:test', facts: { method: 'secured' } }).id, 'r_d', 'each companion has their own');
  t.eq(K.react(fresh({ comp: 'suzu' }), { id: 'res4', event: 'puzzle:test' }), null, 'nothing authored: nothing said');

  // ---- keepsakes -----------------------------------------------------------------------------------------
  const s5 = fresh();
  t.eq([RB.discovery.keepsake(s5, 'reed_boat', 'f1'), RB.discovery.keepsake(s5, 'reed_boat', 'f1')], [true, false], 'a keepsake is recorded once');
  t.ok(S.test(s5, 'keepsake.reed_boat') && !S.test(s5, 'keepsake.glass_leaf'), 'keepsake condition');

  // ---- the folio ---------------------------------------------------------------------------------------------
  t.ok(RB.ui.company && RB.ui.company.pages.companion && RB.ui.company.pages.pet && RB.ui.company.pages.memories, 'Company has its three pages');
  t.ok(typeof RB.ui.menu.addPage === 'function' && typeof RB.ui.settings.addRows === 'function', 'page and settings registries');
  const st = RB.game && RB.game.settings;
  void st;
};
