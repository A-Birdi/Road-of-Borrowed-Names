/* The field puzzles placed in existing maps (addendum §14.2-14.7, §18.1):
 * props added from here (the pattern of src/content/lq/20_maps.js), with the
 * few decorative props that stood on the chosen tiles moved aside, and the
 * small, guarded changes to people whose place changes use. Every spot was
 * chosen from the map's actual geometry (docs/addendum/fieldweave.md lists
 * each spot, why, and what it replaced). */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const drop = (map, pred) => { const m = C.maps[map]; m.props = (m.props || []).filter((p) => !pred(p)); };
  const at = (p, id, x, y) => p.p === id && p.x === x && p.y === y;
  const add = (map, list) => { const m = C.maps[map]; m.props = (m.props || []).concat(list); };
  // a one-off line put in front of someone's usual talk (guarded so it never
  // stands before a story conversation); `n` picks one of several placements
  const talkFirst = (map, id, opt, n) => {
    const ns = (C.maps[map].npcs || []).filter((q) => q.id === id);
    const p = ns[n || 0];
    if (p) p.talk = [opt].concat(Array.isArray(p.talk) ? p.talk : [{ scene: p.talk }]);
  };
  const P = (p, x, y, pz, part, scene, extra) => Object.assign({ p, x, y, o: { pz, part }, scene }, extra || {});

  // ---- F1, Reedwake: the nook between the river warehouse and the river ------------------------------
  // (32,22)-(33,22): the crate that stood at (33,22) and the barrel at (32,23)
  // make room for the screen, its clamp post and a place to stand.
  drop('rw.village', (p) => at(p, 'crate', 33, 22) || at(p, 'barrel', 32, 23));
  add('rw.village', [
    P('fw_slipscreen', 32, 22, 'f1', 'screen', 'fw.f1.screen'),
    P('fw_clamppost', 33, 22, 'f1', 'clamp', 'fw.f1.clamp'),
  ]);
  // Tomo, who does the washing by the river, once the screen stops flapping
  talkFirst('rw.village', 'tomo', { if: 'puzzle.f1=done&!seen.fw.f1_tomo', scene: 'fw.f1_tomo' });

  // ---- F2, Saltglass: on the sand past the east end of the quay (44-46, 24-25) --------------------------
  // Open beach, away from the tide board on the west quay (the harbour's own
  // tide reading stays a separate place) and clear of the sea-glass sparkles.
  add('sg.harbor', [
    P('fw_floatdiagram', 44, 24, 'f2', 'diagram', 'fw.f2.diagram'),
    P('fw_pulleypost', 45, 24, 'f2', 'post', 'fw.f2.post'),
    P('fw_winch', 46, 24, 'f2', 'crank', 'fw.f2.crank'),
    P('fw_inlet', 44, 25, 'f2', 'inlet', 'fw.f2.inlet'),
    P('fw_floattank', 45, 25, 'f2', 'tank', 'fw.f2.tank'),
    P('fw_ventpipe', 46, 25, 'f2', 'vent', 'fw.f2.vent'),
  ]);
  // Tobi, who plays on this beach, can read the window once it works
  // (after his cove directions, if those are still due)
  talkFirst('sg.harbor', 'tobi', { if: 'puzzle.f2=done&!seen.fw.f2_tobi&!quest.sg_cove=0|puzzle.f2=done&!seen.fw.f2_tobi&sg_dir_tobi', scene: 'fw.f2_tobi' });

  // ---- F3, Cinder Orchard: the east side of Isao's glass workshop -----------------------------------------
  // (9,5) wedge rack, (10,5) tray, (11,4) lamp, (11,5) note; stand at (10,6),
  // (10,4) or (8,5). The half-made globes on the table at (5,5) are the
  // nearby unfinished work.
  add('co.glass', [
    P('fw_wedgerack', 9, 5, 'f3', 'peg', 'fw.f3.peg'),
    P('fw_tray', 10, 5, 'f3', 'tray', 'fw.f3.tray'),
    P('fw_armlamp', 11, 4, 'f3', 'lamp', 'fw.f3.lamp'),
    P('fw_note', 11, 5, 'f3', 'note', 'fw.f3.note'),
  ]);
  // Isao, once the sample's card is back (not before the chronicle talk he owes)
  talkFirst('co.glass', 'co_isao', { if: 'puzzle.f3=done&!seen.fw.f3_isao&!co_chronicle_read|puzzle.f3=done&!seen.fw.f3_isao&co_hist_isao', scene: 'fw.f3_isao' });

  // ---- F4, Snowbell: the post shelter's holding boxes, east of the shelter ---------------------------------
  // (32,28) note on the shelter wall, (33-35,28) the three boxes under one
  // glass cover, (36,28) the warming box; stand on row 29. Row 27 stays free
  // so the way round the shelter is not closed.
  add('sb.hamlet', [
    P('fw_postnote', 32, 28, 'f4', 'note', 'fw.f4.note'),
    P('fw_locker', 33, 28, 'f4', 'a', 'fw.f4.box'),
    P('fw_locker', 34, 28, 'f4', 'b', 'fw.f4.box'),
    P('fw_locker', 35, 28, 'f4', 'c', 'fw.f4.box'),
    P('fw_warmbox', 36, 28, 'f4', 'cloth', 'fw.f4.cloth'),
  ]);
  // Denji, the retired carpenter who carved the toggles (after you have met him)
  talkFirst('sb.hamlet', 'denji', { if: 'puzzle.f4=done&!seen.fw.f4_denji&seen.sb.denji', scene: 'fw.f4_denji' });

  // ---- F5, Lanternfall: the listening corner of the Garden Quarter (15-21, 13) ---------------------------
  // A row of objects along the grass south of the garden path, stood before
  // on row 14; far from the fence dispute on the north side (a separate place).
  C.chars.fw_fumi = {
    name: { en: 'Fumi', jp: 'フミ' }, voice: { pitch: 0.95 },
    look: { skin: 2, hair: 'bun', hairColor: 6, cloth: ['#5a6a8a', '#46546e', '#e8dcc0'], shape: 'robe', acc: ['glasses'], age: 'old' },
    portrait: { eyes: 'soft', style: 'bun', age: 'old', acc: ['glasses'], bg: '#2a2e3a' },
  };
  add('lf.gardens', [
    P('fw_nook', 15, 13, 'f5', 'nook', null, { block: false }),
    P('fw_flap', 16, 13, 'f5', 'B', 'fw.f5.B'),
    P('fw_mouth', 17, 13, 'f5', 'mL', 'fw.f5.mL'),
    P('fw_alcove', 18, 13, 'f5', 'alcove', 'fw.f5.alcove'),
    P('fw_mouth', 19, 13, 'f5', 'mR', 'fw.f5.mR'),
    P('fw_display', 20, 13, 'f5', 'display', 'fw.f5.display'),
    P('fw_tubemap', 21, 13, 'f5', 'diagram', 'fw.f5.diagram'),
  ]);
  C.maps['lf.gardens'].npcs = (C.maps['lf.gardens'].npcs || []).concat([{ id: 'fw_fumi', x: 15, y: 13, dir: 'down', talk: 'fw.f5_fumi' }]);

  // ---- F6, the Archive road: Oyone's index box in the Last Lamp Hut --------------------------------------------
  // (7,2) the index box on the wall, (9,4) the tray of loose slips. The hut
  // stays open after the ending; the puzzle waits while the descent is on.
  add('sa.hut', [
    P('fw_indexbox', 7, 2, 'f6', 'box', 'fw.f6.box', { if: '!sa_descent|sa_done|post' }),
    P('fw_sliptray', 9, 4, 'f6', 'slips', 'fw.f6.slips', { if: '!sa_descent|sa_done|post' }),
  ]);
  talkFirst('sa.hut', 'sa_oyone', { if: 'puzzle.f6=done&!seen.fw.f6_oyone&seen.sa.oyone_first&!sa_descent|puzzle.f6=done&!seen.fw.f6_oyone&post', scene: 'fw.f6_oyone' });
})(RB.content);
