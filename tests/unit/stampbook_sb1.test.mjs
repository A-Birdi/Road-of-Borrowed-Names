// The Stamp Book after the owner's Chapter 1 playtest (2026-10-19): the field guide is a family of the book (its
// bosses not counted, said so), veiled until a creature of its region is met; the Chapters number 1–12 in story order
// with no repeats; the Flood Cellars' stamp names no place before Chapter 2 is over.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, SB = RB.stampBook, E = RB.encounter;
  const camp = (ed = 2) => { const s = RB.state.newCampaign({ edition: ed }); s.id = 'sb1'; s.comp = 'mio'; RB.game.s = s; return s; };
  const settle = (s, id) => { s.creatures[id] = s.creatures[id] || { t: 1, maps: {}, notes: {} }; s.creatures[id].settled = { t: 1, m: 'rw.mill0' }; };
  const foe = (map, fid) => C.maps[map].foes.find((f) => f.id === fid);
  const row = (s, id) => SB.book(s).find((x) => x.id === id);

  // ---- 1, 4: the field guide -----------------------------------------------------------------------------------------
  {
    const s = camp();
    const kinds = Object.keys(C.enemies).filter((id) => C.enemies[id].region === 'reedwake' && !C.enemies[id].boss);
    t.eq(kinds.sort(), ['rw.dustmoth', 'rw.inkblot', 'rw.reedling'], 'Reedwake\'s roaming kinds: Reedling, Flour Moth, Runoff Blot (the Mill Echo and the Founder\'s Voice are bosses)');
    t.ok(row(s, 'guide:reedwake') && row(s, 'guide:reedwake').veiled, 'the field guide is in the book, veiled before any creature of Reedwake is met');
    settle(s, 'rw.reedling'); settle(s, 'rw.dustmoth');
    t.ok(!row(s, 'guide:reedwake').veiled && /not its bosses/.test(row(s, 'guide:reedwake').criteria.en), 'once met it names Reedwake and says its bosses are not counted');
    t.eq(E.roamingWon(s, foe('rw.mill1', 'm1a'), 'rw.mill1'), [], 'two kinds of three: no stamp');
    settle(s, 'rw.inkblot');
    t.eq(E.roamingWon(s, foe('rw.mill0', 'p1'), 'rw.mill0'), [{ t: 'stamp', id: 'guide:reedwake' }], 'the third kind: the stamp, the Mill Echo unmet');
    t.eq(row(s, 'guide:reedwake').state, 'pressed', 'and it is pressed in the book');
    t.eq(E.roamingWon(s, foe('rw.mill0', 'p1'), 'rw.mill0'), [], 'once');
    const old = camp(); RB.records.award(old, 'stamps', 'guide:reedwake');
    t.eq(row(old, 'guide:reedwake').state, 'pressed', 'a journey that earned it before keeps it, now shown');
    t.eq(C.guideRegion.yn_vents, 'guide:steamhollow', 'the vents under Steamhollow are part of its guide');
    const s1 = camp(1); for (const k of kinds) settle(s1, k);
    t.eq(E.roamingWon(s1, foe('rw.mill0', 'p1'), 'rw.mill0'), [], 'a six-chapter journey: no field guide');
    const later = Object.values(RB.edition.TITLES).slice(2).map((x) => x.en);
    for (const id in C.stamps) if (C.stamps[id].veil) t.ok(!later.some((n) => C.stamps[id].veil.en.indexOf(n) >= 0) && !/Cellars|Warehouse/.test(C.stamps[id].veil.en), id + ': its veiled words name no place');
    for (const id in C.stamps) if (C.stamps[id].family === 'guide') t.ok(RB.jp.validate(C.stamps[id].title.jp).length === 0 && RB.jp.validate(C.stamps[id].veil.jp).length === 0, id + ': furigana');
  }

  // ---- 5: the Chapters, 1 to 12 in story order, no repeats -------------------------------------------------------------
  {
    const s = camp();
    const ch = SB.book(s).filter((x) => x.d.family === 'chapter');
    const nos = ch.map((x) => +(/Chapter (\d+)/.exec(x.criteria.en) || [])[1]);
    t.eq(nos, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 'Chapters: 1 to 12, in story order (' + ch.map((x) => x.id).join(' ') + ')');
    t.eq(ch.map((x) => x.id), RB.edition.ORDER.map((k) => 'ch.' + k), 'each chapter\'s stamp in its place');
    const side = SB.book(s).filter((x) => x.d.family === 'region' && /^side\./.test(x.id) && x.id !== 'side.sz').map((x) => +(/Chapter (\d+)/.exec(x.criteria.en) || [])[1]);
    t.eq(side, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 'People helped: the same numbers');
    t.eq(SB.book(s).filter((x) => x.d.family === 'region').pop().id, 'as.village', 'the village after the story comes last');
  }

  // ---- 3: the Flood Cellars ---------------------------------------------------------------------------------------------
  {
    const s = camp();
    const r = row(s, 'xp.cellars');
    t.ok(r.veiled && !/Cellars|Warehouse|Mill/.test(r.criteria.en), 'Chapter 1: the cellars\' stamp is veiled and names no place: ' + r.criteria.en);
    s.flags.ch1_done = true; s.flags.ch2_done = true;
    t.ok(!row(s, 'xp.cellars').veiled && /River Warehouse/.test(row(s, 'xp.cellars').criteria.en), 'once Chapter 2 is over: the Flood Cellars under the River Warehouse');
  }
};
