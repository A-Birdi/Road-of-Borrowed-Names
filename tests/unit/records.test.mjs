// The journey's records (expansion P06, K1–K5, K8, K9; src/engine/58b_records.js, src/content/records/): stamps are
// earned by meaningful moments and pressed once, at their stand or at once; a side story only another journey can
// have counts as done; no stamp asks for an input mode, going without help, a streak, a time, a star or a score;
// hidden criteria name no later place; the travel volume's pages are witnessed when the moment happened (skipped
// or not), viewable in a campaign by R2 §6's rules, veiled on the Main Menu until revealed; a replay reads beats
// and runs nothing; the seal is the traveller's and New Game+ carries it with the stamps. A six-chapter journey's
// Ledger is unchanged (F-21).
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, SB = RB.stampBook, V = RB.volume;
  const camp = (o = {}) => { const s = RB.state.newCampaign({ edition: o.edition || 2 }); s.id = 'rec-test'; s.comp = o.comp || 'mio'; RB.game.s = s; return s; };

  // ---- a six-chapter journey: nothing changes --------------------------------------------------------------------
  {
    const s = camp({ edition: 1 });
    s.flags.ch1_done = true; s.flags.ch2_done = true;
    t.eq(SB.settle(s), [], 'a six-chapter journey presses nothing');
    t.ok(!RB.recordsUI.inCampaign(s), 'and its Ledger has no stamp book or travel volume yet (F-21)');
    for (const id in C.stampStands) { const st = C.stampStands[id]; const pr = C.maps[st.map].props.find((p) => p.p === 'rb_stampstand' && p.o.stand === id); t.ok(pr && !RB.state.test(s, pr.if), id + ': no stand in its town'); }
    t.eq(Object.keys(s.records.stamps), [], 'no stamp record written');
  }

  // ---- stamps -------------------------------------------------------------------------------------------------------
  {
    const s = camp();
    t.ok(RB.recordsUI.inCampaign(s), 'a twelve-chapter journey has them');
    t.eq(SB.book(s).find((x) => x.id === 'ch.rw').state, 'open', 'Reedwake\'s stamp: not yet');
    s.flags.ch1_done = true;
    t.eq(SB.book(s).find((x) => x.id === 'ch.rw').state, 'ready', 'earned: ready at its stand');
    t.eq(SB.settle(s).indexOf('ch.rw'), -1, 'a stamp with a stand is not pressed by itself');
    t.eq(SB.pressAt(s, 'saltglass'), [], 'nor at another town\'s stand');
    t.eq(SB.pressAt(s, 'reedwake'), ['ch.rw'], 'pressed at Reedwake\'s stand');
    t.eq(SB.pressAt(s, 'reedwake'), [], 'once');
    const r = SB.book(s).find((x) => x.id === 'ch.rw');
    t.ok(r.state === 'pressed' && r.at === 'reedwake' && r.t > 0, 'where and when it was pressed');
    // stamps without a stand: pressed as soon as earned
    s.learn.items['c:ask_back'] = { ok: 1, assisted: 1 };
    t.ok(SB.settle(s).indexOf('ms.askback') >= 0, 'asking back, even with help: pressed at once');
    // a side story only another journey can have counts as done
    const sides = (n) => Object.keys(C.quests).filter((id) => C.quests[id].chapter === n && !C.quests[id].main);
    const s5 = camp({ comp: 'mio' });
    for (const id of sides(5)) if (id !== 'lf_nao') s5.quests[id] = { stage: 9, done: true, t: 1 };
    t.ok(SB.earned(s5, 'side.lf'), 'Chapter 5 with Mio: Nao\'s own side story counts as done');
    delete s5.quests.lf_mio;
    t.ok(!SB.earned(s5, 'side.lf'), 'but Mio\'s own must be done');
    const s3 = camp({ comp: 'suzu' });
    for (const id of sides(3)) if (id !== 'co_suzu') s3.quests[id] = { stage: 9, done: true, t: 1 };
    t.ok(SB.earned(s3, 'side.co'), 'Chapter 3 with Suzu: her own story there (which needs her elsewhere) counts as done');
    const s3b = camp({ comp: 'nao' });
    for (const id of sides(3)) if (id !== 'co_suzu') s3b.quests[id] = { stage: 9, done: true, t: 1 };
    t.ok(!SB.earned(s3b, 'side.co'), 'with Nao it is part of the road');
    // the rules (C-13, C-55, R1)
    for (const id in C.stamps) {
      const src = String(C.stamps[id].when);
      t.ok(!/assist|\.mode|stars?\b|streak|time|score|hand|ime\b|choice/.test(src), id + ': asks for no mode, no help-free play, no star, streak, time or score');
    }
    const later = Object.values(RB.edition.TITLES).slice(2).map((x) => x.en);
    for (const id in C.stamps) {
      const d = C.stamps[id];
      if (d.hidden) t.ok(!later.some((n) => d.criteria.en.indexOf(n) >= 0), id + ': its criteria name no later place');
    }
    // the stands: free tiles that cut off no way out
    RB.game.s = camp({ edition: 1 }); // (the ground as it is without the stand, which is conditional)
    for (const id in C.stampStands) {
      const st = C.stampStands[id], m = RB.maps.compile(st.map), pl = Object.values(C.places).find((p) => p.map === st.map);
      t.ok(!RB.maps.blockedStatic(m, st.x, st.y) && !RB.maps.exitAt(m, st.x, st.y), id + ': its stand stands on open ground, not a way out');
      const without = RB.verbs.cutOff(st.map, [[pl.x, pl.y]], []), withIt = RB.verbs.cutOff(st.map, [[pl.x, pl.y]], [[st.x, st.y]]);
      t.eq(withIt, without, id + ': and cuts off nothing that was reachable');
    }
  }

  // ---- the travel volume --------------------------------------------------------------------------------------------
  {
    const pages = V.pages();
    t.ok(pages.length >= 14 && pages.some((p) => p.kind === 'prologue'), 'every illustrated sequence is a page (' + pages.length + ')');
    const s = camp();
    const p1 = V.page('ch1.bridge'), p2 = V.page('ch2.notice'), p5 = V.page('ch5.bell');
    t.ok(V.witnessed(s, V.page('prologue')), 'the prologue: every journey');
    t.ok(!V.witnessed(s, p1) && !V.viewable(s, p1), 'a chapter page before its moment: neither');
    s.seq['ch1.bridge'] = { n: 1, h: [], skipped: true };
    t.ok(V.witnessed(s, p1), 'skipped, it still happened: witnessed');
    const old = camp(); old.seen[p2.scene] = true;
    t.ok(V.witnessed(old, p2), 'an older journey that saw the scene before its picture existed: witnessed');
    s.flags.ch2_done = true;
    t.ok(V.viewable(s, p2) && !V.witnessed(s, p2), 'a finished chapter opens all its pages (viewable, not witnessed)');
    t.ok(!V.viewable(s, p5), 'a later one stays closed');
    // a companion's page and a special page (added by later content; synthetic here)
    V.add({ id: 'tx.comp', chapter: 3, comp: 'mio', title: { en: 'A moment with Mio', jp: 'ミオ と' } });
    V.add({ id: 'tx.special', chapter: 0, special: true, title: { en: 'A Trial', jp: '{試練|しれん}' } });
    t.ok(!V.viewable(s, V.page('tx.comp')), 'a companion\'s page: not before the story ends');
    s.flags.postgame = true;
    t.ok(V.viewable(s, V.page('tx.comp')), 'the whole set of your companion\'s once it ends');
    s.comp = 'nao';
    t.ok(!V.viewable(s, V.page('tx.comp')), 'not another companion\'s (that is the Main Menu\'s)');
    t.ok(!V.viewable(s, V.page('tx.special')), 'a special page waits');
    V.revealSpecial(s, 'tx.special');
    t.ok(V.viewable(s, V.page('tx.special')), 'until revealed, after its confirmation');
    // the Main Menu: veiled until revealed, unless some journey witnessed it
    const prefs = { unveiled: {}, showAll: false };
    t.eq(V.menuState(p5, prefs, [s]).veiled, true, 'Main Menu: veiled');
    t.eq(V.menuState(p1, prefs, [s]).veiled, false, 'unless a journey witnessed it (seen in ' + V.menuState(p1, prefs, [s]).seenIn + ')');
    prefs.unveiled[p5.id] = true;
    t.eq(V.menuState(p5, prefs, []).veiled, false, 'revealed by the device\'s preference');
    t.eq(V.menuState(p5, { unveiled: {}, showAll: true }, []).veiled, false, 'or shown all');
    t.ok(!V.witnessed(camp(), p5), 'a reveal never witnesses anything');
    // a replay reads the beats; nothing runs
    const before = JSON.stringify(s);
    const b = V.beats('ch1.bridge', (cond) => RB.state.test(s, cond), s.comp);
    t.ok(b.length > 0 && b.every((x) => x.shot && x.line && x.line.jp), 'a replay\'s beats come from the scene (' + b.length + ')');
    t.eq(JSON.stringify(s), before, 'and reading them changes nothing in the journey');
    const fb = V.beats('ch1.bridge', V.fixtureTest('ren'), 'ren');
    t.ok(fb.length > 0, 'the Main Menu\'s neutral branch reads them too');
  }

  // ---- the seal, and New Game+ ------------------------------------------------------------------------------------
  {
    const s = camp();
    s.player.nameJp = 'ハル';
    t.eq([RB.seal.of(s).kana, RB.seal.of(s).chosen], ['ハ', false], 'a default seal from the name\'s first kana');
    t.eq(RB.seal.set(s, { frame: 'triangle', kana: 'ハ' }), null, 'only the four frames');
    t.eq(RB.seal.set(s, { frame: 'round', kana: 'A' }), null, 'kana only');
    t.eq(RB.seal.set(s, { frame: 'round', kana: 'ハルカ' }), null, 'one or two');
    t.ok(RB.seal.set(s, { frame: 'gourd', kana: 'ハル', style: 'fine' }), 'a chosen seal');
    t.ok(/ハ/.test(RB.seal.svg(RB.seal.of(s))) && /ル/.test(RB.seal.svg(RB.seal.of(s))), 'drawn with its kana');
    s.flags.ch1_done = true; SB.pressAt(s, 'reedwake');
    s.seq['ch1.bridge'] = { n: 1, h: [] };
    s.flags.postgame = true;
    const n = RB.ui.create.carry(s);
    t.eq([n.player.seal.frame, n.player.seal.kana], ['gourd', 'ハル'], 'New Game+ carries the seal with the traveller');
    t.ok(n.records.stamps['ch.rw'] && n.seq['ch1.bridge'], 'and the stamps and the volume\'s witnessed pages');
    t.ok(!n.flags.ch1_done && !n.flags.postgame && !n.comp, 'never the story or the companion');
    for (const c of ['nao', 'mio', 'ren', 'suzu']) t.ok((C.ngFarewell[c] || []).length >= 2 && C.ngFarewell[c].every((l) => l.who === c && l.jp && l.en && RB.jp.validate(l.jp).length === 0), c + ': a farewell in their own words, with furigana');
  }
};
