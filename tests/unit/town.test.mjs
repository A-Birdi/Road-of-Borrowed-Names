// The living world (expansion P05; src/engine/53_town.js, src/ui/53w_whereabouts.js). Synthetic towns on real maps,
// in a throwaway context: routines tick only on coming back (three transitions away, a story flag the town cares
// about, a rest), never within the town and never on loading; one person is in one place; pins hold; change beats are
// remembered until seen; "Have you seen…?" gives its four kinds of answer without omniscience and leaves notes, not
// markers; a road's first event is deferred, never lost, and once-only; sealed places are noticed, then opened.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, T = RB.town;
  const camp = (id) => { const s = RB.state.newCampaign({ edition: 2 }); s.id = id || 'town-test'; s.map = 'rw.village'; return s; };
  const go = (s, map) => { const why = T.beforeEnter(s, map); s.map = map; T.visited(s, map); return why; };

  // ---- a six-chapter journey meets none of it ---------------------------------------------------------------------
  {
    t.eq([Object.keys(C.towns).length, Object.keys(C.relations).length, Object.keys(C.roadEvents).length, Object.keys(C.sealed).length], [0, 0, 0, 0],
      'the shipped tables are empty until the new chapters fill them');
    const s = RB.state.newCampaign(); s.map = 'rw.village';
    for (const m of ['rw.road', 'sg.road', 'sg.harbor', 'sg.road', 'rw.road', 'rw.village']) t.eq(go(s, m), null, 'no town, no tick: ' + m);
    t.eq([T.changed(s), T.unfinished(s), T.noticed(s), T.roadEventAt(s, 'rw.road')], [[], [], [], null], 'and nothing to show in the Journey or Known details');
    const old = RB.state.newCampaign(); delete old.world;
    T.rec(old);
    t.eq(Object.keys(old.world).sort(), ['beats', 'lastSeen', 'moves', 'notes', 'rests', 'roads', 'sealed', 'towns'], 'an older save gains the empty record');
  }

  // ---- the synthetic towns ----------------------------------------------------------------------------------------
  // Tomo keeps three places in Reedwake (the square, the teahouse, the hall); Old Yasu two, pinned while a step needs
  // him; Kiyo two in Saltglass. Their placements are ordinary map entries with exclusive slot conditions.
  const place = (map, char, cond, x, y) => {
    const m = C.maps[map];
    m.npcs = (m.npcs || []).filter((n) => (n.char || n.id) !== char || n.if !== cond);
    m.npcs.push({ id: char, char, x, y, if: cond, talk: 'rw.tomo' });
  };
  C.maps['rw.village'].npcs = C.maps['rw.village'].npcs.filter((n) => (n.char || n.id) !== 'tomo' && (n.char || n.id) !== 'yasu');
  C.maps['sg.harbor'].npcs = C.maps['sg.harbor'].npcs.filter((n) => (n.char || n.id) !== 'kiyo');
  place('rw.village', 'tomo', 'slot.tomo=1', 10, 10); place('rw.tea', 'tomo', 'slot.tomo=2', 4, 4); place('rw.hall', 'tomo', 'slot.tomo=3', 5, 5);
  place('rw.village', 'yasu', 'slot.yasu=1', 12, 12); place('rw.ferry', 'yasu', 'slot.yasu=2', 4, 4);
  place('sg.harbor', 'kiyo', 'slot.kiyo=1', 8, 8); place('sg.inn', 'kiyo', 'slot.kiyo=2', 4, 4);
  C.towns.tx = {
    name: { en: 'Reedwake', jp: '{葦|あし}ノ{瀬|せ}' }, maps: ['rw.village', 'rw.tea', 'rw.hall', 'rw.ferry'],
    residents: { tomo: { slots: 3 }, yasu: { slots: 2, pin: 'tx_pin' } }, care: ['tx_story'],
    beats: [{ id: 'b1', when: 'tx_story' }, { id: 'b2', when: 'tx_later' }],
  };
  C.towns.ty = { name: { en: 'Saltglass', jp: '{潮硝子|しおがらす}' }, maps: ['sg.harbor', 'sg.inn'], residents: { kiyo: { slots: 2 } } };

  // ---- routines (W2) ------------------------------------------------------------------------------------------------
  {
    const s = camp();
    RB.game.s = s;
    t.eq([T.townOf('rw.tea'), T.townOf('sg.inn'), T.townOf('rw.road')], ['tx', 'ty', null], 'which town a map belongs to');
    t.eq(T.slotOf(s, 'tomo'), 1, 'a resident starts in their first place');
    for (let k = 1; k <= 3; k++) {
      T.rec(s); s.world.towns.tx = s.world.towns.tx || { tick: 0, slots: {}, leftAt: null, flags: {}, rests: 0 };
      s.world.towns.tx.slots.tomo = k;
      t.eq(RB.world.mapsWith('tomo'), [['rw.village', 'rw.tea', 'rw.hall'][k - 1]], 'one person, one place: slot ' + k);
      t.ok(RB.state.test(s, 'slot.tomo=' + k) && !RB.state.test(s, 'slot.tomo=' + ((k % 3) + 1)), 'the slot condition reads it');
    }
    s.world.towns.tx.slots.tomo = 1;
    // moving about inside the town never ticks
    for (const m of ['rw.tea', 'rw.village', 'rw.hall', 'rw.village', 'rw.ferry', 'rw.village']) t.eq(go(s, m), null, 'within the town, no tick: ' + m);
    t.eq(s.world.towns.tx.tick, 0, 'not once');
    // two transitions away is not enough
    go(s, 'rw.road');
    t.eq(go(s, 'rw.village'), null, 'back after two transitions: no tick');
    // three is
    go(s, 'rw.road'); go(s, 'sg.road');
    t.eq(go(s, 'sg.harbor'), null, 'a first visit to another town is not a tick');
    go(s, 'sg.road'); go(s, 'rw.road');
    const before = T.slotOf(s, 'tomo');
    t.eq(go(s, 'rw.village'), 'away', 'back after five transitions away: the routine moves on');
    t.ok(T.slotOf(s, 'tomo') !== before, 'into a new place (' + before + ' → ' + T.slotOf(s, 'tomo') + ')');
    t.eq(s.world.towns.tx.tick, 1, 'one tick');
    // a story flag the town cares about, set while away
    go(s, 'rw.road'); s.flags.tx_story = true;
    t.eq(go(s, 'rw.village'), 'story', 'a story beat it cares about, after one transition');
    // a rest at an inn elsewhere
    go(s, 'rw.road'); T.rested(s);
    t.eq(go(s, 'rw.village'), 'rest', 'a rest, after one transition');
    go(s, 'rw.road');
    t.eq(go(s, 'rw.village'), null, 'and the same flag or rest does not tick it twice');
    // a story flag set while you are in the town ticks nothing now (only on a later return)
    s.flags.tx_story = false; go(s, 'rw.road'); go(s, 'rw.village');
    s.flags.tx_story = true;
    t.eq([go(s, 'rw.tea'), go(s, 'rw.village')], [null, null], 'set while here: no tick on the spot');
  }
  {
    // pins and determinism
    const a = camp('same'), b = camp('same');
    a.flags.tx_pin = true; b.flags.tx_pin = true;
    const cycle = (s) => { go(s, 'rw.road'); go(s, 'sg.road'); go(s, 'rw.road'); return go(s, 'rw.village'); };
    const seqA = [], seqB = [];
    for (let k = 0; k < 6; k++) { cycle(a); seqA.push(T.slotOf(a, 'tomo')); }
    for (let k = 0; k < 3; k++) { cycle(b); seqB.push(T.slotOf(b, 'tomo')); }
    const b2 = JSON.parse(JSON.stringify(b)); // saved and loaded
    T.rec(b2);
    t.eq(T.slotOf(b2, 'tomo'), seqB[2], 'loading a save never re-rolls a routine');
    for (let k = 0; k < 3; k++) { cycle(b2); seqB.push(T.slotOf(b2, 'tomo')); }
    t.eq(seqA, seqB, 'the same campaign draws the same routine, across a save and load: ' + seqA.join(','));
    t.ok(seqA.every((k, i) => i === 0 || k !== seqA[i - 1]), 'each tick a different place, never a reshuffle into the same one');
    t.eq(T.slotOf(a, 'yasu'), 1, 'a pinned resident keeps their place while the step needs them');
    a.flags.tx_pin = false; cycle(a);
    t.eq(T.slotOf(a, 'yasu'), 2, 'and moves on once it no longer does');
  }

  // ---- change beats (W1) ------------------------------------------------------------------------------------------
  {
    const s = camp();
    go(s, 'rw.village');
    t.eq(T.changed(s), [], 'nothing has changed yet');
    go(s, 'rw.road'); s.flags.tx_story = true;
    t.eq(T.changed(s).map((c) => c.town), ['tx'], 'a beat while you are away: the town has changed since your last visit');
    t.ok(RB.state.test(s, 'beat.tx.b1') && !RB.state.test(s, 'beat.tx.b2'), 'the beat condition content uses');
    go(s, 'rw.village');
    t.eq(T.changed(s), [], 'seen once you are back');
    s.flags.tx_later = true;
    t.eq(T.beats(s, 'tx').map((b) => b.id), ['b1', 'b2'], 'later beats add, never replace');
  }

  // ---- "Have you seen…?" (W3) ---------------------------------------------------------------------------------------
  C.relations.hana = { knows: { tomo: 'routine', kiyo: 'loose' } };
  C.relations.koji = { friendly: false };
  C.relations.tsuru = { knows: {} };
  {
    const s = camp(); RB.game.s = s; T.rec(s);
    s.world.towns.tx = { tick: 0, slots: { tomo: 2 }, leftAt: null, flags: {}, rests: 0 };
    const near = T.whereabouts(s, 'hana', 'tomo', 'rw.village');
    t.eq([near.kind, near.map], ['sighting', 'rw.tea'], 'someone who knows them, beside where they are now: a sighting');
    const far = T.whereabouts(s, 'hana', 'tomo', 'sg.harbor');
    t.eq(far.kind, 'routine', 'far away, someone who knows them well: their usual places');
    t.ok(/teahouse|Tea/i.test(far.line.en) || far.note.maps.indexOf('rw.tea') >= 0, 'the usual places come from the routine: ' + far.line.en);
    const loose = T.whereabouts(s, 'hana', 'kiyo', 'rw.village');
    t.eq([loose.kind, loose.map], ['uncertain', 'sg.harbor'], 'a loose acquaintance: an unsure recollection');
    t.ok(/wouldn't swear/.test(loose.line.en) && /{分|わ}かりません/.test(loose.line.jp), 'said to be unsure, in both languages');
    t.eq(T.whereabouts(s, 'koji', 'tomo', 'rw.village').kind, 'refusal', 'someone unfriendly may refuse');
    t.eq(T.whereabouts(s, 'tsuru', 'tomo', 'rw.village').kind, 'unknown', 'a stranger to them does not know, even next door: no omniscience');
    t.eq(T.whereabouts(s, 'mame', 'tomo', 'rw.village').kind, 'unknown', 'nor anyone the table does not name');
    // every answer's Japanese: furigana on every kanji
    const bare = (jp) => jp.replace(/\{[^}]*\}/g, '').match(/[一-鿿]/);
    for (const a of [near, far, loose, T.whereabouts(s, 'koji', 'tomo', 'x'), T.whereabouts(s, 'tsuru', 'tomo', 'x'), T.whereabouts(s, 'hana', 'tomo', 'rw.village')]) {
      t.ok(a.line && a.line.jp && a.line.en && !bare(a.line.jp), a.kind + ': ' + a.line.jp + ' / ' + a.line.en);
    }
    // a note, not a marker
    const n = T.note(s, 'hana', near);
    t.eq([n.target, n.map, n.kind, n.from], ['tomo', 'rw.tea', 'sighting', 'hana'], 'the answer becomes a note');
    s.world.towns.tx.slots.tomo = 3;
    t.eq(s.world.notes.tomo.map, 'rw.tea', 'and stays what was said then, after they have moved on');
    t.eq(T.note(s, 'koji', T.whereabouts(s, 'koji', 'tomo', 'rw.village')), null, 'a refusal leaves no note');
    // whom you can ask about: people you have seen, or a quest of yours is looking for; never the asker or your companion
    t.eq(T.askable(s, 'hana'), [], 'nobody yet: talking stays plain talking');
    T.seen(s, 'kiyo', 'sg.harbor'); T.seen(s, 'hana', 'rw.village');
    s.comp = 'nao'; T.seen(s, 'nao', 'rw.village');
    t.eq(T.askable(s, 'hana'), ['kiyo'], 'someone you have seen (not the asker, not your companion)');
    C.quests.tx_seek = { title: { en: 'Seek', jp: '{探|さが}す' }, stages: [{ seek: 'tomo' }] };
    s.quests.tx_seek = { stage: 0, done: false, t: 1 };
    t.eq(T.askable(s, 'hana'), ['tomo', 'kiyo'], 'and someone a quest is looking for, first');
    t.eq(s.world.lastSeen.kiyo.map, 'sg.harbor', 'where you last saw them is kept with the save');
  }

  // ---- road events (W5) ---------------------------------------------------------------------------------------------
  C.roadEvents.rx = {
    maps: ['rw.road', 'sg.road'], unique: { id: 'u1', scene: 'rx.u1', title: { en: 'A cart with a broken wheel', jp: '{車輪|しゃりん} の {壊|こわ}れた {荷車|にぐるま}' } },
    variants: [{ id: 'v1', scene: 'rx.v1' }, { id: 'v2', scene: 'rx.v2' }], rate: 1, stamp: 'road:rx',
  };
  {
    const s = camp(); s.map = 'rw.village';
    t.eq(T.beforeEnter(s, 'rw.road') === null && T.roadEventAt(s, 'rw.road'), 'rx.u1', 'the first time on the road: its own event');
    t.eq([T.roadEventAt(s, 'rw.road'), T.roadEventAt(s, 'rw.road')], [null, null], 'asked again after the scene ends (the same visit): nothing more');
    s.map = 'rw.road';
    T.beforeEnter(s, 'sg.road');
    t.eq(T.roadEventAt(s, 'sg.road'), null, 'once a visit: walking on along the same road offers nothing more');
    t.eq(T.unfinished(s), ['rx'], 'left unsolved: unfinished, in the Journey');
    s.map = 'sg.road'; T.beforeEnter(s, 'sg.harbor'); s.map = 'sg.harbor';
    T.beforeEnter(s, 'sg.road');
    t.eq(T.roadEventAt(s, 'sg.road'), 'rx.u1', 'the next visit offers the same event again: never lost to a variant');
    t.eq(T.roadDone(s, 'rx', 'u1'), false, 'solved (not all of the road yet)');
    t.eq(T.unfinished(s), [], 'no longer unfinished');
    s.map = 'sg.road'; T.beforeEnter(s, 'sg.harbor'); s.map = 'sg.harbor'; T.beforeEnter(s, 'sg.road');
    const v = T.roadEventAt(s, 'sg.road');
    t.ok(v === 'rx.v1' || v === 'rx.v2', 'afterwards, a variant on the road\'s chance: ' + v);
    T.roadDone(s, 'rx', 'v1');
    t.eq(T.roadDone(s, 'rx', 'v2'), true, 'all of the road\'s events solved');
    t.ok(RB.records.has(s, 'stamps', 'road:rx'), 'and its stamp, once (never a consumable)');
    C.roadEvents.rx.rate = 0;
    s.map = 'sg.road'; T.beforeEnter(s, 'sg.harbor'); s.map = 'sg.harbor'; T.beforeEnter(s, 'sg.road');
    t.eq(T.roadEventAt(s, 'sg.road'), null, 'a road whose chance is nil stays quiet');
    const a = camp('road-a'), b = camp('road-a');
    C.roadEvents.rx.rate = 0.5;
    const draw = (s) => { const out = []; T.roadDone(s, 'rx', 'u1'); for (let k = 0; k < 8; k++) { s.map = 'rw.village'; T.beforeEnter(s, 'rw.road'); out.push(T.roadEventAt(s, 'rw.road')); T.roadEventAt(s, 'rw.road'); s.map = 'rw.road'; T.beforeEnter(s, 'rw.village'); } return out; };
    const da = draw(a);
    t.eq(da, draw(b), 'variants come from the campaign\'s own stream: the same journey, the same road');
    t.ok(da.some((x) => x) && da.some((x) => !x), 'now and then, not every visit: ' + da.map((x) => (x ? 'v' : '-')).join(''));
  }

  // ---- sealed places (W6) -------------------------------------------------------------------------------------------
  C.sealed.sx = { map: 'rw.village', x: 6, y: 7, needs: 'tx_word', hint: { jp: '{字|じ} が {薄|うす}れて {読|よ}めない 。', en: 'The writing has faded beyond reading.' }, opens: 'sx_open' };
  {
    const s = camp(); RB.game.s = s;
    t.eq(T.sealedOn('rw.village').map((x) => x.id), ['sx'], 'visible from the start, on its map');
    const r1 = T.examine(s, 'sx');
    t.eq([r1.state, r1.hint.en], ['noticed', 'The writing has faded beyond reading.'], 'examined: an in-world hint, and noticed');
    t.eq(T.noticed(s).map((x) => x.id), ['sx'], 'Known details can list it');
    const k = RB.known.entries(s, 'rw.village').find((e) => e.id === 'sealed:sx');
    t.eq(k && [k.state, k.x, k.y], ['barred', 6, 7], 'it is in Known details, barred, where it is');
    t.ok(!s.flags.sx_open, 'still shut');
    s.flags.tx_word = true;
    const r2 = T.examine(s, 'sx');
    t.eq(r2.state, 'opened', 'once what it needs is known, it opens');
    t.ok(s.flags.sx_open, 'and says so to the story');
    t.eq(RB.known.entries(s, 'rw.village').find((e) => e.id === 'sealed:sx').state, 'opened', 'Known details follows');
    t.eq(T.examine(s, 'sx').state, 'open', 'and stays open');
    t.eq(T.noticed(s), [], 'no longer waiting');
  }
};
