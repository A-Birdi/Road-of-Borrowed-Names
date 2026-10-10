// The expansion's foundations (playbook P02; docs/future/plan/02_FOUNDATIONS.md S1–S4, K9; src/engine/05a_edition.js,
// 05b_foundations.js): the edition field and the chapter display map, records that live with each save, seeded
// streams that loading never re-rolls, story phases as conditions, the frozen result envelope, and the one New Game+
// carryover.
import { load } from '../lib/load.mjs';

export default async (t) => {
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const E = RB.edition;

  // ---- the edition --------------------------------------------------------------------------------------------
  {
    const s = RB.state.newCampaign();
    t.eq(s.edition, 1, 'a campaign is six-chapter unless told otherwise');
    t.eq(E.forNew(), 1, 'without the development switch, new journeys are six-chapter (the edition ships at the release)');
    t.ok(!E.shipped() && !E.isOld(s), 'until it ships, no save is an "old edition" save');
    RB.edition.setChapter(s, '3');
    t.ok(s.chapter === 3 && s.chapterKey === 'co' && E.number(s) === 3, 'edition 1: Cinder Orchard is Chapter 3, as it always was');
    s.edition = 2;
    t.eq(E.number(s), 5, 'edition 2: Cinder Orchard shows as Chapter 5');
    RB.edition.setChapter(s, '2'); RB.edition.setChapter(s, 'mb1');
    t.ok(s.chapter === 2 && E.number(s) === 3, 'a new chapter leaves s.chapter as it was (ch>=3 stays false in Manybridge), shows as Chapter 3');
    t.ok(RB.state.test(s, 'ed>=2') && !RB.state.test(s, 'ch>=3') && RB.state.test(s, 'chap>=mb1') && !RB.state.test(s, 'chap>=mb2'), 'conditions: ed, chap, and the old ch unchanged');
    RB.edition.setChapter(s, 'kr');
    t.ok(E.number(s) === 7 && RB.state.test(s, 'chap>sb') && RB.state.test(s, 'chap<lf'), 'the Keepers\' Road is Chapter 7, between Snowbell and Lanternfall');
    const old = RB.state.newCampaign(); RB.edition.setChapter(old, '5');
    t.ok(RB.state.test(old, 'chap>=lf') && !RB.state.test(old, 'chap>=ko'), 'an edition-1 campaign is placed by its old chapter');
    t.ok(RB.state.test(old, 'chap=lf') && !RB.state.test(old, 'ed>=2'), 'edition 1 at Chapter 5 is at Lanternfall');
    t.eq(E.ORDER.length, 12, 'twelve chapters');
    for (const k of E.ORDER) t.ok(E.TITLES[k] && E.TITLES[k].en && E.DONE[k], 'chapter ' + k + ' has a title and a done flag');
    E._ship(true);
    t.ok(E.isOld(old) && E.forNew() === 2 && !E.isOld(s), 'once shipped: edition-1 saves are old, new journeys twelve-chapter');
    E._ship(false);
  }

  // ---- an older save on load: empty records, edition 1, nothing else touched --------------------------------------
  {
    const s = RB.state.newCampaign();
    s.map = 'rw.village'; s.flags.ch1_done = true; s.chapter = 2;
    delete s.edition; delete s.records; delete s.rng; delete s.chapterKey;
    const before = JSON.stringify(s);
    const m = RB.save.migrate(JSON.parse(before));
    t.ok(m.edition === 1 && m.records && m.records.stamps && m.records.seals && m.records.stars && m.records.found && m.rng && m.rng.n, 'an older save gains edition 1 and empty records');
    const back = JSON.parse(JSON.stringify(m));
    for (const k of ['edition', 'records', 'rng', 'chapterKey']) delete back[k];
    t.eq(Object.keys(back).sort(), Object.keys(JSON.parse(before)).sort(), 'and nothing it held is removed');
    t.ok(m.flags.ch1_done === true && m.chapter === 2, 'its story is as it was');
    const m2 = RB.save.migrate(JSON.parse(JSON.stringify(m)));
    t.eq(JSON.stringify(m2), JSON.stringify(m), 'migrating twice changes nothing more');
    // a twelve-chapter save keeps its edition
    const e2 = RB.state.newCampaign({ edition: 2 }); e2.map = 'rw.village';
    t.eq(RB.save.migrate(JSON.parse(JSON.stringify(e2))).edition, 2, 'a twelve-chapter save stays twelve-chapter');
  }

  // ---- records ------------------------------------------------------------------------------------------------------
  {
    const s = RB.state.newCampaign();
    t.ok(RB.records.award(s, 'stamps', 'first_bridge', { ch: 'mb1' }), 'a stamp is awarded once');
    t.ok(!RB.records.award(s, 'stamps', 'first_bridge'), 'and never twice');
    t.ok(RB.records.has(s, 'stamps', 'first_bridge') && !RB.records.has(s, 'seals', 'first_bridge'), 'kinds are separate');
    let threw = false; try { RB.records.award(s, 'medals', 'x'); } catch (e) { threw = true; }
    t.ok(threw, 'an unknown record kind is refused');
  }

  // ---- seeded streams ---------------------------------------------------------------------------------------------
  {
    const a = RB.state.newCampaign(); a.id = 'camp-A';
    const b = RB.state.newCampaign(); b.id = 'camp-A';
    const c = RB.state.newCampaign(); c.id = 'camp-B';
    const seqA = [0, 1, 2, 3].map(() => RB.streams.next(a, 'road'));
    const seqB = [0, 1, 2, 3].map(() => RB.streams.next(b, 'road'));
    t.eq(seqA, seqB, 'the same campaign and family give the same values');
    t.ok(seqA.every((v) => v >= 0 && v < 1) && new Set(seqA).size === 4, 'values in [0, 1), varied');
    t.ok(RB.streams.next(c, 'road') !== RB.streams.next(RB.state.newCampaign(), 'road'), 'another campaign differs');
    const x = RB.state.newCampaign(); x.id = 'camp-A';
    RB.streams.next(x, 'sea'); RB.streams.next(x, 'sea');
    t.eq(RB.streams.next(x, 'road'), seqA[0], 'families are independent: drawing from one never shifts another');
    // drawn once, kept across a save and a load
    const s = RB.state.newCampaign(); s.id = 'camp-C'; s.map = 'rw.village';
    const v1 = RB.streams.fixed(s, 'road:rw.road:event', 'road', (d) => Math.floor(d() * 1000));
    const reloaded = RB.save.migrate(JSON.parse(JSON.stringify(s)));
    const v2 = RB.streams.fixed(reloaded, 'road:rw.road:event', 'road', (d) => Math.floor(d() * 1000));
    t.eq(v2, v1, 'an outcome drawn before saving is the same after loading (no re-roll by loading)');
    t.ok(RB.streams.consume(reloaded, 'road:rw.road:event'), 'consumed once used');
    const v3 = RB.streams.fixed(reloaded, 'road:rw.road:event', 'road', (d) => Math.floor(d() * 1000));
    const v3b = RB.streams.fixed(RB.save.migrate(JSON.parse(JSON.stringify(reloaded))), 'road:rw.road:event', 'road', () => -1);
    t.ok(v3 === v3b, 'the next draw is kept the same way');
  }

  // ---- story phases ------------------------------------------------------------------------------------------------
  {
    const s = RB.state.newCampaign();
    t.eq(RB.phase.of(s, 'saltglass'), 'before', 'Saltglass before Chapter 1 ends');
    s.flags.ch1_done = true;
    t.ok(RB.phase.of(s, 'saltglass') === 'story' && RB.state.test(s, 'phase.saltglass>=story') && !RB.state.test(s, 'phase.saltglass>=after'), 'during its chapter');
    s.flags.ch2_done = true;
    t.ok(RB.phase.of(s, 'saltglass') === 'after' && RB.phase.of(s, 'cinder') === 'story', 'edition 1: Cinder Orchard follows Saltglass');
    s.edition = 2;
    t.eq(RB.phase.of(s, 'cinder'), 'before', 'edition 2: Cinder Orchard waits for Manybridge');
    s.flags.mb2_done = true;
    t.eq(RB.phase.of(s, 'cinder'), 'story', 'and begins once Manybridge is done');
    s.flags.postgame = true;
    t.ok(RB.phase.of(s, 'reedwake') === 'post' && RB.state.test(s, 'phase.reedwake=post'), 'after the story');
    RB.phase.concept('t_unravel2', { kind: 'modifier', ch: 'mb2', taught: 'mb_unravel2' });
    t.ok(!RB.phase.knows(s, 't_unravel2'), 'a concept is unknown until taught');
    s.flags.mb_unravel2 = true;
    const snap = RB.phase.snapshot(s, ['saltglass']);
    t.ok(snap.concepts.t_unravel2 && snap.phases.saltglass === 'post' && Object.isFrozen(snap) && Object.isFrozen(snap.phases), 'a task\'s snapshot holds phase, profile and concepts, frozen');
    s.flags.postgame = false;
    t.ok(RB.phase.of(s, 'saltglass') === 'after' && snap.phases.saltglass === 'post', 'a snapshot does not change under a running task');
  }

  // ---- the result envelope -----------------------------------------------------------------------------------------
  {
    const ev = RB.events.make({ src: 'battle', action: 'unravel', targets: ['f1'], changes: [{ t: 'f1', knots: -1 }], cues: [{ sfx: 'unravel' }] });
    t.ok(Object.isFrozen(ev) && Object.isFrozen(ev.changes) && Object.isFrozen(ev.changes[0]), 'a result is frozen once computed');
    let threw = false; try { 'use strict'; ev.changes[0].knots = -5; } catch (e) { threw = true; }
    t.ok(ev.changes[0].knots === -1, 'presentation cannot change it' + (threw ? '' : ' (silently ignored)'));
    t.ok(/^battle:\d+$/.test(ev.id) && RB.events.log().some((e) => e.id === ev.id), 'it has an id and is logged');
  }

  // ---- New Game+: exactly the K9 table ------------------------------------------------------------------------------
  {
    const s = RB.state.newCampaign({ profile: 'I', edition: 1 });
    s.id = 'origin'; s.map = 'rw.hall'; s.comp = 'ren'; s.flags.postgame = true; s.flags.ch3_done = true; s.chapter = 6;
    s.player.name = 'Veteran'; s.player.look.hair = 'long'; s.player.bath = 'east';
    s.learn.items['k:あ'] = { id: 'k:あ', box: 4, seen: 9 };
    s.words.push('mamoru'); s.quests.rw_main = { stage: 9, done: true };
    s.inv.rw_ribbon = 1; s.equip.cosmetic = 'rw_ribbon'; s.atlas.cosmetics = ['atlas_scarf'];
    s.notebook.push({ kind: 'lore', id: 'rw_hush', t: 1 }, { kind: 'word', id: 'w:みず', surface: '水', t: 2 });
    s.bookmarks.push({ id: 'b1', jp: 'みず', en: 'water' });
    s.company.bond = { x: 3 }; s.company.pet = 'cat';
    s.discovery.keepsakes = { rw_ribbon: { t: 5, map: 'rw.village' } }; s.discovery.known = { 'rw.village': { a: { t: 1 } } };
    s.creatures = { 'rw.moth': { t: 1, maps: {}, notes: {} } };
    RB.records.award(s, 'stamps', 'st1'); RB.records.award(s, 'seals', 'seq.ch1'); RB.records.award(s, 'stars', 'ex1:hand');
    s.seq = { 'ch1.lantern': { n: 1, h: [] } };
    RB.practice.of(s).shiritori.byCompanion = { ren: { wins: 2 } };
    s.practice.fishing.observed = { carp: { n: 1 } };
    s.practice.deskPages.push({ id: 'p1' });
    s.ngplus = 1;
    s.enc.studies['fx.study.mist'] = { best: 2, tries: 3 }; s.enc.solved['x:s1:v1:[]'] = true; s.enc.defeats['tmp'] = 2;
    const n = RB.ngplus.carry(s);
    t.ok(n.enc.studies['fx.study.mist'].best === 2 && !Object.keys(n.enc.solved).length && !Object.keys(n.enc.defeats).length, 'carries: the Tactics Board\'s bests only (F-08)');
    t.ok(n.learn.items['k:あ'].box === 4 && n.learn.profile === 'I', 'carries: the learning record and profile');
    t.ok(n.records.stamps.st1 && n.records.seals['seq.ch1'] && n.records.stars['ex1:hand'] && n.records.found.rw_ribbon, 'carries: stamps, seals, stars, and the keepsake catalogue\'s found record');
    t.ok(n.seq['ch1.lantern'], 'carries: illustrations seen');
    t.ok(n.practice.shiritori.byCompanion.ren.wins === 2 && n.practice.fishing.observed.carp, 'carries: pastime records');
    t.ok(n.practice.deskPages.length === 0, 'kept pages start fresh');
    t.ok(n.notebook.length === 1 && n.notebook[0].kind === 'word', 'carries: noted words, not lore');
    t.ok(n.bookmarks.length === 1, 'carries: kept sentences');
    t.ok(n.player.name === 'Veteran' && n.player.look.hair === 'long' && n.player.bath === 'east', 'carries: the traveller as they are');
    t.ok(n.ngplus === 2 && n.ngFrom.id === 'origin' && n.ngFrom.comp === 'ren', 'counts the runs and remembers where it came from (the farewell\'s companion)');
    t.ok(!n.comp && !n.flags.postgame && !n.flags.ch3_done && n.chapter === 0 && !Object.keys(n.quests).length, 'never: story, chapter or quests');
    t.ok(!n.words.length && !Object.keys(n.inv).length && !n.equip.cosmetic && !n.atlas.cosmetics.length, 'never: story words, items, keepsakes worn, Atlas cosmetics');
    t.ok(!Object.keys(n.company.bond).length && !n.company.pet && !Object.keys(n.discovery.keepsakes).length && !Object.keys(n.discovery.known).length && !Object.keys(n.creatures).length, 'never: Bond, the pet, keepsakes, Known details, creatures met');
    t.ok(s.comp === 'ren' && s.flags.postgame && s.inv.rw_ribbon === 1, 'the origin is not touched');
    t.eq(n.edition, 1, 'the new journey takes the build\'s edition for new journeys');
  }
};
