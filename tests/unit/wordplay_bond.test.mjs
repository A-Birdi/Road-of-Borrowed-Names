// Companion shiritori and the relationship (Practice addendum §14, §23.5): every row of the
// Bond and dialogue regression matrix that can be decided without a page (the inn's Just chat,
// the Ledger round trip and slot changes with a page open are in tests/e2e/wordplay.mjs),
// memories, the recent thought and its expiry, the companions' authored lines (categories,
// variants, the comment limit, Quiet) and the four How we played scenes. Banks are TEST-ONLY
// abstract kana chains.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const SH = RB.shiritori, WP = RB.wordplay, K = RB.company;
  RB.game.G.settings = RB.game.G.settings || RB.game.defaultSettings();
  const fresh = (comp, o) => { const s = RB.state.newCampaign({}); s.map = 'sb.inn_room'; s.comp = comp || 'nao'; s.chapter = 2; Object.assign(s, o || {}); RB.game.s = s; return s; };
  const E = (id, r) => ({ id, reading: r, forms: [r], display: { jp: r, en: id }, nounKind: 'common', lexicalLevel: 'pocket', provenance: [{ source: 'abstract test node', reviewed: false }] });
  const chainBank = (id, readings, version) => SH.addBank({ id, version: version || 1, entries: readings.map((r, i) => E(id.slice(0, 2) + i, r)), starters: [id.slice(0, 2) + '0'] });
  const LIN = ['あい', 'いう', 'うえ', 'えお', 'おか', 'かき', 'きく', 'くけ', 'けこ', 'こさ', 'さし', 'しす', 'すせ', 'せそ', 'そた'];
  const useBanks = (readings) => { for (const b of WP.BANDS) chainBank(b, readings); };
  async function playOut(s, o) {
    o = o || {};
    for (let guard = 0; WP.ns(s).active && guard < 80; guard++) {
      const L = WP.live(s), a = L.active, b = L.bank;
      if (a.st.next === 'cpu') { await WP.cpuChoose(s); const r = WP.cpuCommit(s); if (r.over) return r.result; continue; }
      if (o.concedeAfter != null && SH.moves(a.st, 'pc') >= o.concedeAfter) return WP.concede(s);
      const e = SH.safeReplies(a.st, b)[0] || SH.legalEdges(a.st, b)[0];
      const r = WP.playWord(s, e, { mode: 'ime' });
      if (r.over) return r.result;
    }
    return null;
  }
  const game = async (s, setup, first, o) => { const st = WP.start(s, setup, { first }); if (!st.ok) throw new Error(st.why); return playOut(s, o); };
  const bondEv = (s) => Object.keys(s.company.bond).filter((k) => k.startsWith('activity:'));
  const mems = (s) => s.company.memories.filter((m) => m.id.startsWith('wordplay:')).map((m) => m.id);
  const seen = { cleared: 0, discovery: 0 };
  RB.bus.on('wordplay:stage-cleared', () => seen.cleared++);
  RB.bus.on('discovery:resolved', () => seen.discovery++);

  // ---- §23.5 row 1: first competitive loss after 3 valid player moves --------------------------------------
  {
    useBanks(LIN.slice(0, 7)); // starter + 6 words: you, them, you, them, you, them (they close it)
    const s = fresh('nao');
    const r = await game(s, { band: 'pocket', level: 'casual' }, 'pc');
    t.ok(r.winner === 'cpu' && r.reason === 'no-safe-reply' && r.pmoves === 3, 'a competitive loss after three valid player moves (' + r.reason + ', ' + r.pmoves + ')');
    t.eq(bondEv(s), ['activity:shiritori:together'], 'row 1: +1 together event');
    t.eq(K.score(s), 1, 'the bond rises by one');
    t.ok(WP.reflection(s) && WP.reflection(s).st === 'available' && WP.reflection(s).winner === 'cpu', 'and How we played becomes available, with the real result');
    t.eq(mems(s), ['wordplay:together'], 'one memory of the first substantial game');
    const m = s.company.memories.find((x) => x.id === 'wordplay:together');
    t.ok(m.kind === 'together' && /won a game of shiritori against you/.test(m.text.en) && m.place && m.lines.length === 7, 'its text is the real result and place, with the chain');
    const trap = WP.line(s, 'trap', r.session + ':end', { reason: r.reason });
    t.ok(trap && !/stupid|pathetic|hopeless|told you|should have studied|sulk/i.test(trap.en), 'the companion acknowledges a real result without mockery (' + (trap && trap.en) + ')');
  }
  // ---- row 2: first competitive win after 2 player moves ------------------------------------------------------------
  {
    useBanks(LIN.slice(0, 5)); // starter + them, you, them, you (you close it)
    const s = fresh('mio');
    const r = await game(s, { band: 'pocket', level: 'casual' }, 'cpu');
    t.ok(r.winner === 'pc' && r.pmoves === 2 && r.stage === 'pocket:casual', 'a competitive win after two player moves is a genuine stage clear');
    t.eq(bondEv(s), [], 'row 2: no substantial-session bond yet');
    t.ok(!WP.reflection(s), 'and no reflection yet');
    t.eq(mems(s), ['wordplay:first-clear'], 'the first stage victory is remembered (with its receipt link)');
    t.ok(s.company.memories[0].ref && s.company.memories[0].ref.stage === 'pocket:casual' && s.company.memories[0].ref.session === r.session, 'the memory links to the receipt\'s chain');
    // a later substantial game satisfies it
    useBanks(LIN);
    const r2 = await game(s, { band: 'pocket', level: 'casual' }, 'cpu');
    t.ok(r2.pmoves === 7 && bondEv(s).length === 1, 'a later substantial game earns the one together event');
  }
  // ---- row 3: completed cooperative chain with 6 player moves --------------------------------------------------------
  {
    useBanks(LIN);
    const s = fresh('ren');
    const r = await game(s, { format: 'cooperative', band: 'pocket', goal: 12 }, 'pc');
    t.ok(r.reason === 'cooperative-goal' && r.pmoves === 6 && r.winner === null && !r.stage, 'a completed cooperative chain of 12 with six player moves');
    t.eq(bondEv(s), ['activity:shiritori:together'], 'row 3: +1 together event');
    t.ok(WP.cells(s, 'ren').every((c) => c.state === 'none'), 'no competitive stage clear');
    t.ok(WP.reflection(s).format === 'cooperative', 'the reflection knows it was cooperative');
    const s2 = fresh('ren');
    const r2 = await game(s2, { format: 'cooperative', band: 'pocket', goal: 6 }, 'pc');
    t.ok(r2.reason === 'cooperative-goal' && r2.pmoves === 3 && bondEv(s2).length === 0, 'a chain of 6 (three player moves) is complete but not the substantial session');
  }
  // ---- row 4: How we played after eligibility: +1 once, the same for every reply and support mode ----------------------
  {
    useBanks(LIN.slice(0, 7));
    const results = [];
    for (const [choice, support] of [['endings', 'open'], ['finding', 'recall'], ['together', 'open']]) {
      const s = fresh('suzu');
      await game(s, { band: 'pocket', level: 'casual', support }, 'pc');
      const before = K.score(s);
      s.backlog.push({ who: 'pc', jp: RB.content.wordplay.texts.replies[choice].jp, en: RB.content.wordplay.texts.replies[choice].en, choice: true });
      s.backlog.push({ who: 'suzu', jp: 'ふふ 。', en: 'Heh.' });
      await RB.hooks.wp_reflect([choice]);
      const after = K.score(s);
      await RB.hooks.wp_reflect([choice]);
      results.push([choice, support, after - before, K.score(s) - after, bondEv(s).sort().join(',')]);
      const m = s.company.memories.find((x) => x.id === 'wordplay:reflection');
      t.ok(m && m.kind === 'reflections' && m.text.en.indexOf(RB.content.wordplay.texts.replies[choice].en) >= 0 && m.reply && m.reply.en === 'Heh.' && m.choice === choice, choice + ': the memory keeps the reply actually chosen and the companion\'s answer');
      t.ok(!WP.reflection(s), 'and the topic is done');
    }
    for (const r of results) t.eq(r.slice(2), [1, 0, 'activity:shiritori:reflection,activity:shiritori:together'], 'row 4 (' + r[0] + ', ' + r[1] + '): +1 once, never twice');
    // Not now: nothing yet, still available
    const s = fresh('nao');
    await game(s, { band: 'pocket', level: 'casual' }, 'pc');
    await RB.hooks.wp_reflect_defer([]);
    t.ok(WP.reflection(s).st === 'deferred' && bondEv(s).length === 1, 'Not now awards nothing and keeps the topic');
    t.ok(!WP.reflect(s, 'something-else'), 'only the three authored replies count');
    const s0 = fresh('nao');
    t.ok(!WP.reflect(s0, 'endings') && bondEv(s0).length === 0, 'no reflection before the qualifying game');
  }
  // ---- row 5: rematch / replay / reload the same events ------------------------------------------------------------------
  {
    useBanks(LIN.slice(0, 7));
    const s = fresh('mio');
    await game(s, { band: 'pocket', level: 'casual' }, 'pc');
    await RB.hooks.wp_reflect(['together']);
    const snap = JSON.stringify([s.company.bond, s.company.memories.map((m) => m.id)]);
    for (let i = 0; i < 4; i++) await game(s, { band: 'pocket', level: 'casual' }, 'pc');
    const reload = JSON.parse(JSON.stringify(s)); RB.game.s = reload;
    RB.save.migrate(reload);
    await game(reload, { band: 'pocket', level: 'casual' }, 'pc');
    await RB.hooks.wp_reflect(['endings']);
    t.eq(JSON.stringify([reload.company.bond, reload.company.memories.map((m) => m.id)]), snap, 'row 5: rematches, a reload and a replayed reflection add no bond and no memory');
    const b0 = JSON.stringify(reload.company.bond);
    const tr = WP.findTranscript(reload, WP.rec(reload).recent[0].id);
    WP.transcripts(reload);
    t.ok(tr && JSON.stringify(reload.company.bond) === b0 && b0 === JSON.stringify(JSON.parse(snap)[0]), 'reading a saved chain changes nothing');
  }
  // ---- rows 6–7: at the cap ------------------------------------------------------------------------------------------------
  {
    useBanks(LIN.slice(0, 7));
    const s = fresh('ren');
    for (const [id, p] of [['ch2', 1], ['ch3', 1], ['ch4', 1], ['ch5', 1], ['pq', 3], ['reflect:travel', 1], ['reflect:keep', 1], ['puzzle:a', 1], ['puzzle:b', 1]]) K.award(s, id, p);
    t.eq(K.score(s), 11, 'a campaign at 11');
    const r = await game(s, { band: 'pocket', level: 'casual' }, 'pc');
    t.ok(r.bond.together === 'raised' && K.score(s) === 12, 'row 6: the together event raises it to 12');
    const rr = WP.reflect(s, 'finding', { said: RB.content.wordplay.texts.replies.finding });
    t.ok(rr && rr.raised === false && K.score(s) === 12 && s.company.bond['activity:shiritori:reflection'] === 1, 'the reflection is recorded truthfully, with no visible increase (capped at 12)');
    t.ok(WP.rec(s).reflection.raised === false, 'and the record says so ("A shared moment recorded", never a false +1)');
    const s2 = fresh('suzu');
    for (const [id, p] of [['ch2', 1], ['ch3', 1], ['ch4', 1], ['ch5', 1], ['pq', 3], ['ending', 2], ['project:1', 1], ['project:2', 1], ['project:3', 1]]) K.award(s2, id, p);
    t.eq(K.score(s2), 12, 'a campaign at 12');
    const r2 = await game(s2, { band: 'pocket', level: 'casual' }, 'pc');
    t.ok(r2.bond.together === 'recorded' && K.score(s2) === 12 && s2.company.bond['activity:shiritori:together'] === 1, 'row 7: the event and its memory are recorded; no displayed increase');
    t.ok(mems(s2).includes('wordplay:together'), 'the memory is kept although the score is capped');
    t.ok(K.memory(s2, { id: 'story:later', kind: 'together', title: { jp: '', en: 'later' } }), 'and a later story memory is not lost because of the cap');
  }
  // ---- row 8: all nine stage victories ---------------------------------------------------------------------------------------
  {
    useBanks(LIN);
    const s = fresh('nao');
    for (const band of WP.BANDS) for (const level of WP.LEVELS) await game(s, { band, level }, 'cpu');
    await RB.hooks.wp_reflect(['endings']);
    t.ok(WP.cells(s, 'nao').every((c) => c.state === 'won'), 'nine stage victories');
    t.eq(bondEv(s).length, 2, 'row 8: still only the two activity events');
    t.ok(K.score(s) <= 2, 'no more than +2 from the whole activity (' + K.score(s) + ')');
    t.eq(mems(s).sort(), ['wordplay:first-clear', 'wordplay:first-sharp', 'wordplay:reflection', 'wordplay:together'], 'memories stay bounded: first game, first clear, first Sharp, reflection — not one per win');
    const sharpFirst = fresh('mio');
    await game(sharpFirst, { band: 'pocket', level: 'sharp' }, 'cpu');
    const fm = sharpFirst.company.memories.find((m) => m.id === 'wordplay:first-clear');
    t.ok(fm && /first win against Sharp/.test(fm.text.en) && !mems(sharpFirst).includes('wordplay:first-sharp'), 'a first victory that is also Sharp: one combined memory');
    t.ok(seen.cleared >= 10 && seen.discovery === 0, 'wordplay:stage-cleared is emitted; discovery:resolved never is');
  }
  // ---- row 9: a pending story topic stays as it was -----------------------------------------------------------------------------
  {
    useBanks(LIN.slice(0, 7));
    const s = fresh('mio', { flags: { departed: true, ch1_done: true, sg_arrived: true } });
    s.quests.sg_main = { stage: 3, done: false, t: 1 };
    K.refresh(s);
    const before = JSON.stringify({ p: s.company.talk._pending, rec: s.company.talk[s.company.talk._pending] || null, pending: K.pending(s) });
    t.ok(s.company.talk._pending, 'a story invitation is pending (' + s.company.talk._pending + ')');
    await game(s, { band: 'pocket', level: 'casual' }, 'pc');
    await RB.hooks.wp_reflect(['together']);
    await game(s, { format: 'cooperative', band: 'pocket', goal: 6 }, 'pc');
    t.eq(JSON.stringify({ p: s.company.talk._pending, rec: s.company.talk[s.company.talk._pending] || null, pending: K.pending(s) }), before, 'row 9: the invitation, its record and talk._pending are untouched');
    t.ok(!Object.keys(s.seen).some((k) => /^co\.|^pages\./.test(k)), 'no scene is marked heard by playing');
    // the recent thought steps aside for a waiting story topic
    t.ok(!WP.recentThought(s), 'a game\'s thought never outranks a pending story topic');
  }
  // ---- the recent thought: a quiet rest moment; 8 minutes of active play or a chapter (§14.5) ------------------------------------
  {
    useBanks(LIN.slice(0, 7));
    for (const comp of ['nao', 'mio', 'ren', 'suzu']) {
      const s = fresh(comp, { playtime: 1000 });
      await game(s, { band: 'pocket', level: 'casual' }, 'pc');
      const mine = RB.content.wordplay.thoughts.filter((x) => x.comp === comp && x.when === 'wordplay.recent=loss').map((x) => x.text.en);
      const th = K.thought(s);
      t.ok(th && th.kind === 'rest' && mine.includes(th.text.en), comp + ': after the game, a quiet thought at the rest stop (' + (th && th.text.en) + ')');
      s.map = 'rw.village';
      const away = K.thought(s);
      t.ok(!away || !mine.includes(away.text.en), comp + ': not away from the rest stop');
      s.map = 'sb.inn_room';
      s.playtime += 8 * 60 + 1;
      t.ok(!mine.includes((K.thought(s) || { text: {} }).text.en), comp + ': gone after eight minutes of play');
      s.playtime -= 8 * 60 + 1; s.chapter = 3;
      t.ok(!mine.includes((K.thought(s) || { text: {} }).text.en), comp + ': gone after a chapter transition');
      s.chapter = 2;
      t.ok(WP.rec(s).recent.length === 1, comp + ': the archived record remains');
    }
  }
  // ---- the companions' lines (§14.4) ---------------------------------------------------------------------------------------------
  {
    const L = RB.content.wordplay.lines;
    const CATS = ['invite', 'rules', 'thinking', 'move', 'newword', 'escape', 'trap', 'win', 'loss', 'coop', 'stop', 'resume', 'firstclear'];
    const REPEAT = ['rules', 'thinking', 'move', 'newword', 'escape', 'trap', 'win', 'loss', 'coop', 'stop', 'resume'];
    for (const comp of ['nao', 'mio', 'ren', 'suzu']) {
      const mine = L.filter((l) => l.comp === comp);
      const cats = new Set(mine.map((l) => l.cat));
      t.ok(CATS.every((c) => cats.has(c)), comp + ': all thirteen table categories (+ the reflection scene = 14)');
      t.ok(!!RB.content.scenes[RB.content.wordplay.reflections[comp]], comp + ': How we played exists');
      for (const c of REPEAT) {
        const groups = {};
        for (const l of mine.filter((x) => x.cat === c)) { const k = JSON.stringify(l.facts || {}); groups[k] = (groups[k] || 0) + 1; }
        const general = groups['{}'] || 0;
        t.ok(Object.keys(groups).every((k) => groups[k] + (k === '{}' ? 0 : general) >= 2), comp + ' ' + c + ': at least two variants for every situation (' + JSON.stringify(groups) + ')');
      }
      t.ok(mine.every((l) => l.jp && l.en && !/\b(stupid|pathetic|loser|told you so|should study|sulk)\b/i.test(l.en)), comp + ': every line in both languages, no mockery');
      t.ok(mine.filter((l) => l.cat === 'thinking').every((l) => l.gesture), comp + ': thinking comes with a table gesture');
      t.ok(RB.content.wordplay.gestures[comp] && RB.content.wordplay.gestures[comp].motion, comp + ': a table presence of their own');
    }
    // one optional remark per four combined moves; Quiet keeps rules and results only
    useBanks(LIN);
    const s = fresh('suzu');
    WP.start(s, { band: 'pocket', level: 'casual' }, { first: 'pc' });
    const a = WP.ns(s).active;
    const allowed = [];
    for (let i = 0; i < 12; i++) {
      const L2 = WP.live(s);
      if (a.st.next === 'pc') WP.playWord(s, SH.safeReplies(a.st, L2.bank)[0], {}); else { await WP.cpuChoose(s); WP.cpuCommit(s); }
      allowed.push(WP.mayComment(s, 'move') ? SH.moves(a.st) : null);
    }
    const said = allowed.filter((x) => x != null);
    t.ok(said.length >= 2 && said.every((n, i) => i === 0 || n - said[i - 1] >= 4), 'incidental remarks: at most one per four combined moves (' + said.join(',') + ')');
    t.ok(WP.mayComment(s, 'win') && WP.mayComment(s, 'trap'), 'results are never limited');
    RB.game.settings.activityChatter = 'quiet';
    a.lastComment = -99;
    t.ok(!WP.mayComment(s, 'move') && !WP.mayComment(s, 'newword') && WP.mayComment(s, 'loss'), 'Quiet drops incidental comments, keeps results');
    RB.game.settings.activityChatter = 'normal';
    WP.abandon(s);
  }
  // ---- How we played: the four scenes (§14.3) ------------------------------------------------------------------------------------------
  for (const comp of ['nao', 'mio', 'ren', 'suzu']) {
    const sc = RB.content.scenes[RB.content.wordplay.reflections[comp]];
    const ch = sc.cmds.find((c) => c.op === 'choice');
    t.ok(ch && ch.opts.length === 4 && /Not now/.test(ch.opts[3].en), comp + ': three statements plus Not now');
    t.eq(ch.opts.slice(0, 3).map((o) => o.en), ['I was watching which endings were still available.', 'Finding the next word was the difficult part.', 'I mostly enjoyed sitting down to play together.'], comp + ': the three authored statements');
    const hooks = sc.cmds.filter((c) => c.op === 'hook').map((c) => c.args.join(' '));
    t.eq(hooks.sort(), ['wp_reflect endings', 'wp_reflect finding', 'wp_reflect together', 'wp_reflect_defer'].sort(), comp + ': each reply is recorded once, Not now defers');
    t.ok(sc.cmds.some((c) => c.if === 'wordplay.reflect=cooperative') && sc.cmds.some((c) => c.if === '!wordplay.reflect=cooperative'), comp + ': cooperative wording of its own');
    t.ok(sc.cmds.some((c) => c.if === 'wordplay.won') && sc.cmds.some((c) => c.if === 'wordplay.lost'), comp + ': a real win or loss is named only as it happened');
    t.ok(!sc.cmds.some((c) => c.op === 'hook' && /^co_/.test(c.args[0])), comp + ': never touches the story\'s pending topic hooks');
  }
  // the scene's conditions follow the record
  {
    useBanks(LIN);
    const s = fresh('nao');
    await game(s, { format: 'cooperative', band: 'pocket', goal: 12 }, 'pc');
    t.ok(RB.state.test(s, 'wordplay.reflect=cooperative') && !RB.state.test(s, 'wordplay.won') && !RB.state.test(s, 'wordplay.lost'), 'after a chain: cooperative wording, no victory mentioned');
    const s2 = fresh('nao');
    await game(s2, { band: 'pocket', level: 'casual' }, 'cpu');
    t.ok(!RB.state.test(s2, 'wordplay.reflect=cooperative') && RB.state.test(s2, 'wordplay.won'), 'after a win: the win is named');
  }
  // ---- the Company card reads the records (and only this companion's) --------------------------------------------------------------
  {
    useBanks(LIN);
    const s = fresh('mio');
    let h = RB.ui.wordplay.card(s, 'mio', {});
    t.ok(/No matches recorded/.test(h) && (h.match(/data-state="none"/g) || []).length === 9, 'before any game: nine Not played cells and "No matches recorded"');
    t.ok(/data-wp-act="play" disabled/.test(h) && /beside you|rest stop|quiet moment|happening/.test(h), 'Play disabled with a truthful reason where it cannot be played; records still readable');
    await game(s, { band: 'pocket', level: 'sharp' }, 'cpu');
    h = RB.ui.wordplay.card(s, 'mio', {});
    t.ok(/data-code="P-S"[^>]*>|data-state="won" data-code="P-S"/.test(h) && (h.match(/data-state="won"/g) || []).length === 1, 'one Won cell: Pocket · Sharp');
    t.ok(/Latest clear:<\/b> Pocket words · Sharp/.test(h) && /Rules roadside-1 · Bank pocket v1/.test(h), 'the latest clear with its rules and bank version');
    RB.game.settings.hideTotals = true;
    t.ok(!/Fixed-bank games/.test(RB.ui.wordplay.card(s, 'mio', {})) && /Latest clear/.test(RB.ui.wordplay.card(s, 'mio', {})), 'Hide win/loss totals hides totals only, never the stage history');
    RB.game.settings.hideTotals = false;
  }
  RB.game.s = null;
};
