// Companion shiritori, the rules of record (src/engine/73_wordplay.js; docs/practice/wordplay.md):
// eligibility, banks and the journey pool, drafts against the §26.3 input fixtures, moves and
// the stored computer move, stage cells in four isolated companion campaigns, support flags
// (Open-book, Recall without/with suggestions, input-only correction, mixed input), no
// fabricated progression, transcript caps, suspension and resume, incompatible resume,
// migration and bank upgrades. Banks here are TEST-ONLY: the fixture of real nouns
// (tests/e2e/wordplay_fixture.mjs) and abstract kana chains that never appear in the game.
import { load } from '../lib/load.mjs';
import { fixtureDef } from '../e2e/wordplay_fixture.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const SH = RB.shiritori, WP = RB.wordplay;
  const realChoose = SH.chooseMove;
  const fresh = (comp, o) => { const s = RB.state.newCampaign({}); s.map = 'sb.inn_room'; s.comp = comp === undefined ? 'nao' : comp; s.chapter = 2; Object.assign(s, o || {}); RB.game.s = s; return s; };
  // an abstract chain bank (test-only kana "words"): every head has exactly the words listed
  const E = (id, r, en) => ({ id, reading: r, forms: [r], display: { jp: r, en: en || id }, nounKind: 'common', lexicalLevel: 'pocket', provenance: [{ source: 'abstract test node', reviewed: false }] });
  const chainBank = (id, readings, starters, version) => SH.addBank({ id, version: version || 1, entries: readings.map((r, i) => E(id.slice(0, 2) + i, r)), starters: (starters || [0]).map((i) => id.slice(0, 2) + i) });
  // linear: あい → いう → うえ → えお → おか → かき → きく → くけ → けこ → こさ → さし → しす → すせ → せそ → そた (→ た: nothing)
  const LIN = ['あい', 'いう', 'うえ', 'えお', 'おか', 'かき', 'きく', 'くけ', 'けこ', 'こさ', 'さし', 'しす', 'すせ', 'せそ', 'そた'];
  const edgeOf = (bank, reading) => bank.edges.find((x) => x.reading === reading);
  // play the player's next linear move (the only legal one) until the game ends
  async function playOut(s, o) {
    o = o || {};
    let guard = 0;
    while (WP.ns(s).active && guard++ < 60) {
      const L = WP.live(s);
      const a = L.active, b = L.bank;
      if (a.st.next === 'cpu') { await WP.cpuChoose(s); const r = WP.cpuCommit(s); if (r.over) return r.result; continue; }
      if (o.concedeAfter != null && SH.moves(a.st, 'pc') >= o.concedeAfter) return WP.concede(s);
      if (o.stopAfter != null && SH.moves(a.st) >= o.stopAfter) return WP.stopChain(s);
      const e = SH.safeReplies(a.st, b)[0] || SH.legalEdges(a.st, b)[0];
      if (!e) return null;
      const r = WP.playWord(s, e, { mode: o.mode ? o.mode(SH.moves(a.st, 'pc')) : 'ime', repaired: !!o.repaired });
      if (r.over) return r.result;
    }
    return null;
  }
  const settingsFor = (s, x) => { for (const k in x) RB.practice.set(s, k, x[k]); };

  // ---- namespace, old saves --------------------------------------------------------------------------
  {
    const s = fresh();
    t.ok(s.practice.shiritori && s.practice.shiritori.byCompanion && s.practice.shiritori.active === null && s.practice.shiritori.encountered, 'a new campaign has the wordplay namespace');
    t.eq(WP.peek(s), null, 'nothing is recorded until a game is played (Company: No matches recorded)');
    const old = JSON.parse(JSON.stringify(s)); delete old.practice;
    const mig = RB.save.migrate(old);
    t.ok(mig.practice.shiritori && Object.keys(mig.practice.shiritori.byCompanion).length === 0 && mig.practice.shiritori.active === null, 'an old save starts with no matches (nothing inferred from bond, chapter or vocabulary)');
    const fut = JSON.parse(JSON.stringify(s));
    fut.practice.shiritori.byCompanion.nao = { stages: { 'pocket:casual': { played: 1, won: 1, first: { stage: 'pocket:casual' } } }, future: 1, recent: new Array(30).fill(0).map((_, i) => ({ id: 'x' + i })), pinned: new Array(8).fill({ id: 'p' }) };
    fut.practice.shiritori.unknownFuture = { keep: true };
    RB.save.migrate(fut);
    const c = fut.practice.shiritori.byCompanion.nao;
    t.ok(c.future === 1 && fut.practice.shiritori.unknownFuture.keep && c.stages['pocket:casual'].won === 1, 'unknown future records are kept, not deleted');
    t.ok(c.recent.length === 20 && c.pinned.length === 5 && c.cooperative && c.customSummary, 'bounded on load: 20 recent, 5 pinned; missing parts filled');
  }

  // ---- eligibility (§3.2, §23.5) -----------------------------------------------------------------------
  {
    const safe0 = RB.company.safeHere;
    const s = fresh(null);
    s.provisional = 'mio';
    t.eq(WP.eligible(s).code, 'nocomp', 'a provisional companion is not a loophole: no table before commitment');
    const s2 = fresh('mio');
    RB.company.safeHere = () => ({ ok: true });
    t.eq(WP.eligible(s2), { ok: true }, 'committed, present, safe, at a rest place: eligible');
    s2.map = 'rw.village';
    t.eq(WP.eligible(s2).code, 'rest', 'away from a rest place: not here (records stay readable)');
    s2.map = 'sb.inn_room';
    RB.company.safeHere = () => ({ ok: false, why: 'apart' });
    t.ok(/isn't beside you/.test(WP.eligible(s2).why), 'the companion absent: a truthful reason, nobody is walked in');
    RB.company.safeHere = () => ({ ok: false, why: 'danger' });
    t.ok(/creature/.test(WP.eligible(s2).why), 'a creature nearby: a truthful reason');
    RB.company.safeHere = safe0;
    t.eq(WP.eligible(s2).ok, false, 'the real safeHere outside a page is never ok (nothing launches headless)');
  }

  // ---- banks: nothing installed, fixed, journey (§11.1, §11.4) ----------------------------------------------
  {
    const s = fresh();
    const nb = WP.bankFor(s, { band: 'pocket' });
    t.ok(!nb.ok && nb.code === 'nobank' && /not installed/.test(nb.why), 'no bank installed: an honest "not installed", nothing invented');
    t.eq(WP.start(s, { band: 'pocket' }).ok, false, 'and no game starts');
    SH.addBank(fixtureDef('pocket'));
    const fb = WP.bankFor(s, { band: 'pocket' });
    t.ok(fb.ok && fb.kind === 'fixed' && fb.size === SH.bank('pocket').groupCount && fb.certified, 'a fixed band uses exactly RB.shiritori.bank(id)');
    const j0 = WP.bankFor(s, { band: 'journey' });
    t.ok(!j0.ok && j0.code === 'tiny', 'From my journey with nothing met: explained, not padded');
    s.learn.intro = { 'v:猫': true, 'v:みず': true }; s.learn.items['v:かさ'] = { id: 'v:かさ' };
    s.notebook.push({ kind: 'word', surface: '駅', reading: 'えき' });
    WP.markEncountered(s, ['kitsune']);
    const jp = WP.journeyPool(s).map((e) => e.id).sort();
    t.eq(jp, ['eki', 'kasa', 'kitsune', 'mizu', 'neko'], 'the journey pool: introduced, noted or met at the table (no mastery claim)');
    const j1 = WP.bankFor(s, { band: 'journey' });
    t.ok(j1.ok && j1.kind === 'journey' && j1.small && j1.size === 5, 'a small journey bank is flagged: fewer than 24 groups');
    t.ok(j1.bank.starters.every((id) => WP.journeyPool(s).some((e) => e.id === id)), 'its starters come from the certified ones it actually contains');
    const pr = WP.primer(s);
    t.ok(pr.length > 0 && pr.length <= 6 && pr.every((e) => !jp.includes(e.id) && !SH.boundary(SH.readingsOf(e)[0]).terminal), 'the primer offers a few unmet, non-ん words');
    t.ok(Object.keys(WP.ns(s).encountered).length === 1, 'showing nothing yet adds nothing');
    WP.markEncountered(s, pr.map((e) => e.id));
    t.ok(WP.bankFor(s, { band: 'journey' }).size > 5, 'once shown, the next journey pool is rebuilt with them');
    t.eq(Object.keys(s.learn.items).length, 1, 'and no mastery record was touched');
  }

  // ---- the §26.3 input fixtures, as drafts (never moves) ------------------------------------------------------
  {
    const s = fresh();
    SH.addBank(fixtureDef('pocket'));
    settingsFor(s, { shiritoriBand: 'pocket' });
    const st = WP.start(s, {}, { first: 'pc', starter: 'shika' });
    t.ok(st.ok, 'a game starts from a certified starter');
    const a = WP.ns(s).active, b = WP.live(s).bank;
    // move the required kana around by hand for the fixtures (drafts never change the state)
    const at = (head) => { a.st.required = head; a.st.next = 'pc'; };
    at('ね');
    const used0 = JSON.stringify(a.st.used);
    let d = WP.draft(s, 'ねこ');
    t.ok(d.status === 'ok' && d.edge.tail === 'こ', 'ねこ under ね: legal, next こ');
    t.eq(WP.draft(s, 'ﾈｺ').status, 'ok', 'half-width ﾈｺ is the same approved reading');
    a.st.used[d.edge.group] = true;
    t.eq(WP.draft(s, '猫').status, 'repeat', '猫 after ねこ: the same group, an invalid repeat');
    a.st.used = JSON.parse(used0);
    at('か');
    t.eq(WP.draft(s, 'かさ').status, 'ok', 'か: かさ');
    at('が');
    t.eq(WP.draft(s, 'かさ').status, 'wrong-head', 'が is not か: no voicing removed');
    at('ず');
    t.eq(WP.draft(s, 'ずかん').status, 'ok', 'ずかん under ず');
    t.eq(WP.draft(s, 'ずかん'.normalize('NFD')).status, 'ok', 'a decomposed dakuten spelling normalises to the verified form');
    at('お');
    d = WP.draft(s, 'おもちゃ');
    t.ok(d.status === 'ok' && d.edge.tail === 'や' && d.key === 'おもちゃ', 'おもちゃ passes や; its spelling is kept');
    at('こ');
    t.eq(WP.draft(s, 'コーヒー').edge.tail, 'い', 'コーヒー passes い');
    at('す');
    t.eq(WP.draft(s, 'スーパー').edge.tail, 'あ', 'スーパー passes あ, not ぱ');
    at('ぎ');
    t.eq(WP.draft(s, 'ぎゅうにゅう').edge.tail, 'う', 'ぎゅうにゅう passes う');
    at('み');
    d = WP.draft(s, 'みかん');
    t.ok(d.status === 'ok' && d.terminal, 'みかん: a legal draft that ends in ん (the table warns before Play anyway)');
    at('は');
    d = WP.draft(s, 'はし');
    t.ok(d.status === 'ok' && d.senses && d.senses.length === 2, 'はし: one play with two optional senses');
    a.st.used[d.edge.group] = true;
    t.eq(WP.draft(s, '箸').status, 'repeat', 'はし sense A used: 箸 (sense B) is unavailable');
    a.st.used = JSON.parse(used0);
    at('こ');
    d = WP.draft(s, '工場');
    t.ok(d.status === 'needs-reading' && d.readings.length === 2, '工場: choose among the approved readings (never chosen for you)');
    t.eq(WP.draft(s, '工場', { reading: 'こうば' }).edge.tail, 'ば', 'and the chosen reading sets this turn\'s ending');
    t.eq(WP.draft(s, 'ぞう').status, 'outside', 'a real word not in this bank: outside this match\'s bank (not "not Japanese")');
    t.eq(WP.draft(s, '<img src=x onerror=alert(1)>').status, 'script', 'markup or a name in Latin letters is no word');
    t.eq(WP.draft(s, '  ').status, 'empty', 'whitespace is nothing');
    t.eq(JSON.stringify(a.st.used), used0, 'drafts never change the game');
    // put it back for the move tests
    a.st.required = 'こ';
  }

  // ---- moves: invalid drafts keep the turn; the computer's move is chosen and stored first --------------------
  {
    const s = fresh();
    SH.addBank(fixtureDef('pocket'));
    WP.start(s, { band: 'pocket' }, { first: 'pc', starter: 'neko' });
    const a = WP.ns(s).active, b = WP.live(s).bank;
    const n0 = a.st.history.length;
    t.eq(WP.playWord(s, edgeOf(b, 'かさ'), { mode: 'ime' }).ok, false, 'a wrong-kana move is refused');
    t.ok(a.st.history.length === n0 && a.st.next === 'pc' && !a.cpuMove, 'and the turn is kept: no move, no record, no opponent turn');
    t.eq(WP.playWord(s, { id: 'nonsense' }, {}).ok, false, 'an edge outside the bank is no move');
    const r = WP.playWord(s, edgeOf(b, 'こども'), { mode: 'hand' });
    t.ok(r.ok && a.st.next === 'cpu' && a.st.required === 'も', 'Play word with a legal word: committed');
    t.eq(WP.playWord(s, edgeOf(b, 'もり'), {}).why, 'not-your-turn', 'and never twice');
    let calls = 0;
    SH.chooseMove = async (st, bank, level, rng) => { calls++; return realChoose(st, bank, level, rng); };
    const c1 = await WP.cpuChoose(s);
    const c2 = await WP.cpuChoose(s);
    t.ok(c1 && c1 === c2 && calls === 1 && a.cpuMove && a.st.history.length === n0 + 1, 'the companion\'s move is chosen once and stored before anything is shown');
    const saved = JSON.parse(JSON.stringify(s));
    const cr = WP.cpuCommit(s);
    t.ok(cr.ok && a.st.history[a.st.history.length - 1].edge === c1.edge && !a.cpuMove, 'then committed exactly as stored');
    // a reload between choosing and showing replays the stored move, never a reroll
    RB.game.s = saved;
    const L2 = WP.live(saved);
    t.ok(L2.ok && L2.active.cpuMove && L2.active.cpuMove.edge === c1.edge, 'a reload keeps the stored candidate');
    t.ok(WP.cpuCommit(saved).ok && L2.active.st.history[L2.active.st.history.length - 1].edge === c1.edge && calls === 1, 'and commits it without asking the opponent again');
    SH.chooseMove = realChoose;
    // the strategy stream: same game, same ply → same choice; pets and decorative draws do not touch it
    const s3 = fresh(); const s4 = JSON.parse(JSON.stringify(s3)); s4.company.pet = 'cat'; s4.company.pets = { cat: { name: 'Mochi' } };
    WP.start(s3, { band: 'pocket' }, { first: 'cpu' });
    RB.game.s = s4; WP.start(s4, { band: 'pocket' }, { first: 'cpu' });
    RB.practice.stream(s4, 'shiritori:deco', 'x')(); RB.practice.stream(s4, 'shiritori:deco', 'y')();
    RB.game.s = s3; const m3 = await WP.cpuChoose(s3);
    RB.game.s = s4; const m4 = await WP.cpuChoose(s4);
    t.ok(m3.edge === m4.edge, 'a pet or a decorative draw never changes the companion\'s choice');
    t.ok(WP.ns(s3).active.starter === WP.ns(s4).active.starter && WP.ns(s3).active.bank.hash === WP.ns(s4).active.bank.hash, 'nor the bank or the starter (§26.3: a pet hidden or recoloured before a rematch)');
    // an opponent that returns nothing while safe replies exist never fakes a concession
    const s5 = fresh(); WP.start(s5, { band: 'pocket' }, { first: 'cpu' });
    SH.chooseMove = async () => ({ edge: null });
    const m5 = await WP.cpuChoose(s5);
    t.ok(m5.edge && m5.fallback === 'invalid-or-null', 'a null or illegal opponent answer falls back to a legal move (recorded), never a fake concession');
    SH.chooseMove = async (st) => ({ edge: { id: 'neko#0' } });
    const s6 = fresh(); WP.start(s6, { band: 'pocket' }, { first: 'cpu' });
    const m6 = await WP.cpuChoose(s6);
    t.ok(m6.edge !== 'neko#0' && WP.live(s6).bank.edges.find((x) => x.id === m6.edge).head === WP.ns(s6).active.st.required, 'an illegal opponent word is never committed');
    SH.chooseMove = realChoose;
  }

  // ---- the nine stage cells, in four isolated companion campaigns (§9.4, §23.4) ---------------------------------
  {
    const comps = ['nao', 'mio', 'ren', 'suzu'];
    const cellsOK = [];
    for (const comp of comps) {
      const s = fresh(comp);
      for (const band of WP.BANDS) chainBank(band, LIN, [0], 1);
      // the player wins the linear chain: 7 player moves from あい, first the player
      const plan = [['pocket', 'sharp', 'win'], ['pocket', 'casual', 'loss'], ['everyday', 'thoughtful', 'win'], ['extended', 'casual', 'concede']];
      for (const [band, level, how] of plan) {
        const st = WP.start(s, { format: 'competitive', band, level }, { first: how === 'loss' ? 'pc' : 'cpu' });
        t.ok(st.ok, comp + ': ' + band + ' ' + level + ' starts');
        const r = await playOut(s, how === 'concede' ? { concedeAfter: 2 } : {});
        t.ok(r && r.verified, comp + ' ' + band + '/' + level + ': a verified result (' + (r && r.reason) + ')');
      }
      const cells = WP.cells(s, comp);
      const by = (id) => cells.find((x) => x.id === id).state;
      cellsOK.push([comp, by('pocket:sharp'), by('pocket:thoughtful'), by('pocket:casual'), by('everyday:thoughtful'), by('extended:casual'), by('extended:sharp')]);
      // other companions' records are untouched in this campaign
      t.ok(Object.keys(WP.ns(s).byCompanion).length === 1 && WP.ns(s).byCompanion[comp], comp + ': only this companion\'s records exist in this campaign');
    }
    for (const row of cellsOK) t.eq(row.slice(1), ['won', 'none', 'played', 'won', 'played', 'none'], row[0] + ': Sharp won, Thoughtful/Casual not backfilled; losses and concessions are Played; untouched cells Not played');
    // all nine for one companion: every cell by its own win, still exactly nine receipts
    const s = fresh('ren');
    for (const band of WP.BANDS) for (const level of WP.LEVELS) { WP.start(s, { band, level }, { first: 'cpu' }); await playOut(s); }
    t.ok(WP.cells(s, 'ren').every((x) => x.state === 'won' && x.cell.first && x.cell.first.stage === x.id), 'all nine cells: each won once by its own exact stage');
    t.eq(Object.keys(WP.rec(s).firstClearTranscripts).length, 9, 'nine first-clear transcripts kept');
    const rc = WP.rec(s).stages['pocket:sharp'].first;
    t.ok(rc.band === 'pocket' && rc.level === 'sharp' && rc.chain === 14 && rc.pmoves === 7 && rc.rules === SH.RULES && rc.bank.id === 'pocket' && rc.bank.version === 1 && rc.t > 0 && rc.support && rc.transcript, 'a receipt: band, level, first-win time, first winning chain length, support, rules/bank versions, transcript');
  }

  // ---- support flags (§13.1, §23.4) ----------------------------------------------------------------------------
  {
    for (const band of WP.BANDS) chainBank(band, LIN, [0], 1);
    const s = fresh('mio');
    WP.start(s, { band: 'pocket', level: 'casual', support: 'open' }, { first: 'cpu' });
    let r = await playOut(s);
    let rc = WP.rec(s).stages['pocket:casual'];
    t.ok(r.stage && rc.first.support.support === 'open' && rc.first.support.suggested && !rc.noSuggest, 'Open-book: a full stage clear, labelled Open-book (the bank was shown), no no-suggestions marker');
    WP.start(s, { band: 'pocket', level: 'thoughtful', support: 'recall' }, { first: 'cpu' });
    r = await playOut(s);
    rc = WP.rec(s).stages['pocket:thoughtful'];
    t.ok(r.noSuggestClear && rc.noSuggest && !rc.first.support.suggested && /no in-game word suggestions used/.test(WP.supportLabel(rc.first.support)), 'Recall with no suggestions: the extra marker "No in-game word suggestions used"');
    WP.start(s, { band: 'pocket', level: 'sharp', support: 'recall' }, { first: 'cpu' });
    const a = WP.ns(s).active;
    await WP.cpuChoose(s); WP.cpuCommit(s);
    t.ok(!a.flags.suggested, 'Recall starts without suggestions');
    WP.noteSuggestion(s);
    t.ok(a.flags.suggested, 'Find a word in Recall: the game is marked');
    WP.playWord(s, SH.safeReplies(a.st, WP.live(s).bank)[0], { mode: 'hand' });
    await WP.cpuChoose(s); WP.cpuCommit(s);
    t.ok(a.flags.suggested, 'and the mark is never revoked when the panel closes');
    r = await playOut(s);
    rc = WP.rec(s).stages['pocket:sharp'];
    t.ok(r.stage === 'pocket:sharp' && !rc.noSuggest && rc.first.support.suggested && /suggestions used/.test(WP.supportLabel(rc.first.support)), 'Recall converted by suggestions: still a valid clear, labelled honestly');
    const s2 = fresh('mio');
    WP.start(s2, { band: 'everyday', level: 'casual', support: 'recall' }, { first: 'cpu' });
    r = await playOut(s2, { repaired: true, mode: (k) => 'hand' });
    rc = WP.rec(s2).stages['everyday:casual'];
    t.ok(rc.noSuggest && rc.first.support.inputAssist && !rc.first.support.suggested, 'input-only correction (That is not what I wrote): input assistance, not a word suggestion; the marker stays');
    const s3 = fresh('mio');
    WP.start(s3, { band: 'extended', level: 'casual', support: 'open' }, { first: 'cpu' });
    r = await playOut(s3, { mode: (k) => ['hand', 'ime', 'select'][k % 3] });
    t.eq(WP.rec(s3).stages['extended:casual'].first.support.inputs, ['hand', 'ime', 'select'], 'mixed input is summarised on the receipt');
    t.ok(/handwriting \+ typing \+ choosing/.test(WP.supportLabel(WP.rec(s3).stages['extended:casual'].first.support)), 'and named in words');
  }

  // ---- no fabricated progression (§13.3) ----------------------------------------------------------------------------
  {
    for (const band of WP.BANDS) chainBank(band, LIN, [0], 1);
    const s = fresh('suzu');
    WP.start(s, { format: 'cooperative', band: 'pocket', goal: 6 }, { first: 'pc' });
    let r = await playOut(s);
    t.ok(r.reason === 'cooperative-goal' && r.winner === null && !r.stage, 'a completed cooperative chain is not a win and clears nothing');
    t.ok(WP.cells(s, 'suzu').every((x) => x.state === 'none') && WP.rec(s).cooperative.goals[6].done === 1, 'it is a cooperative milestone in its own row');
    WP.start(s, { band: 'pocket', level: 'casual' }, { first: 'pc' });
    r = await playOut(s, { concedeAfter: 1 });
    t.ok(r.reason === 'human-concession' && r.winner === 'cpu' && !r.stage, 'a concession is a loss, never a clear');
    WP.start(s, { band: 'pocket', level: 'casual' }, { first: 'pc' });
    WP.playWord(s, SH.safeReplies(WP.ns(s).active.st, WP.live(s).bank)[0], {});
    r = WP.abandon(s, 'abandoned');
    t.ok(r.reason === 'abandoned' && r.winner === null && !r.stage && WP.cells(s, 'suzu').find((x) => x.id === 'pocket:casual').state === 'played', 'leaving without a result: no win, no loss, nothing counted (the cell keeps only its earlier Played)');
    // a test hook setting a "win" is not a win: the replay of the confirmed moves decides
    WP.start(s, { band: 'pocket', level: 'sharp' }, { first: 'pc' });
    const a = WP.ns(s).active;
    a.st.over = { winner: 'pc', reason: 'no-safe-reply' };
    r = WP.finish(s, a, WP.live(s).bank);
    t.ok(!r.verified && !r.stage && WP.cells(s, 'suzu').find((x) => x.id === 'pocket:sharp').state === 'none', 'a manufactured result fails verification: no stage, no record');
    // an uncertified opening (a custom bank) never clears a stage
    chainBank('pocket', LIN, [], 2);
    t.ok(!WP.bankFor(s, { band: 'pocket' }).certified, 'a bank without certified starters is reported as such');
    WP.start(s, { band: 'pocket', level: 'thoughtful' }, { first: 'cpu', starter: 'po0' });
    r = await playOut(s);
    t.ok(r.winner === 'pc' && !r.stage, 'a win from an uncertified opening is a real win but not a stage clear');
    // the journey bank: a custom record only
    const s2 = fresh('suzu');
    SH.addBank(fixtureDef('pocket'));
    s2.learn.intro = Object.fromEntries(SH.bank('pocket').entries.map((e) => ['v:' + e.forms[0], true]));
    const st = WP.start(s2, { band: 'journey', level: 'casual' }, { first: 'pc' });
    t.ok(st.ok && WP.ns(s2).active.kind === 'journey', 'a journey game starts on its frozen pool');
    r = await playOut(s2, { concedeAfter: 2 });
    t.ok(!r.stage && WP.rec(s2).customSummary.played === 1 && WP.rec(s2).customSummary.lost === 1 && WP.cells(s2, 'suzu').every((x) => x.state === 'none'), 'From my journey: a custom-bank result, never one of the nine');
  }

  // ---- transcripts: 20 rolling, nine first clears, five pinned (§13.6, §21.3) -----------------------------------------
  {
    for (const band of WP.BANDS) chainBank(band, LIN, [0], 1);
    const s = fresh('nao');
    WP.start(s, { band: 'pocket', level: 'casual' }, { first: 'cpu' });
    const first = await playOut(s);
    for (let i = 0; i < 24; i++) { WP.start(s, { band: 'pocket', level: 'casual' }, { first: 'pc' }); await playOut(s, { concedeAfter: 1 }); }
    const r = WP.rec(s);
    t.eq(r.recent.length, 20, 'the rolling history keeps the 20 most recent chains');
    t.ok(!r.recent.some((x) => x.id === first.session) && r.firstClearTranscripts['pocket:casual'].id === first.session, 'a first-clear transcript survives the rolling history');
    t.ok(WP.findTranscript(s, first.session), 'and stays reviewable');
    const ids = r.recent.slice(-6).map((x) => x.id);
    for (const id of ids.slice(0, 5)) t.ok(WP.pin(s, id).ok, 'pin ' + id);
    const full = WP.pin(s, ids[5]);
    t.ok(!full.ok && full.why === 'full' && full.pinned.length === 5, 'a sixth pin needs an explicit replacement');
    t.ok(WP.pin(s, ids[5], ids[0]).ok && r.pinned.length === 5 && !r.pinned.some((x) => x.id === ids[0]), 'replacing one keeps five');
    t.ok(WP.unpin(s, ids[1]) && r.pinned.length === 4, 'unpinning frees a place');
    const tr = r.recent[r.recent.length - 1];
    t.ok(tr.moves.length <= LIN.length && tr.moves.every((m) => m.a && m.e && m.r) && tr.bank.hash && tr.rules && tr.result.reason, 'a transcript is bounded by the bank and carries what was played and how it ended');
    t.ok(JSON.stringify(r).length < 120000, 'the whole record stays small (' + JSON.stringify(r).length + ' bytes)');
  }

  // ---- suspension, resume, incompatible resume (§13.6, §21.5) ----------------------------------------------------------
  {
    SH.addBank(fixtureDef('pocket'));
    const s = fresh('ren');
    WP.start(s, { band: 'pocket', level: 'casual' }, { first: 'pc', starter: 'neko' });
    WP.playWord(s, edgeOf(WP.live(s).bank, 'こども'), { mode: 'select' });
    await WP.cpuChoose(s); WP.cpuCommit(s);
    t.ok(WP.suspend(s, { text: 'りん', mode: 'ime' }), 'suspend at a confirmed-word boundary, the draft beside it');
    const a0 = WP.ns(s).active;
    t.ok(a0.susp && a0.susp.draft.text === 'りん' && a0.st.history.every((h) => h.reading !== 'りん'), 'the draft is kept separately and never committed');
    const json = JSON.parse(JSON.stringify(s));
    RB.game.s = json;
    const L = WP.live(json);
    t.ok(L.ok && L.active.st.history.length === a0.st.history.length && L.active.st.required === a0.st.required && L.active.flags.inputs.select === 1, 'resume restores the same bank, used words, turn, flags');
    const d = WP.resumed(json);
    t.ok(d && d.text === 'りん' && !L.active.susp && L.active.resumes === 1, 'and hands back the draft (as a draft)');
    // the installed bank changed: the frozen snapshot finishes the game under the original bank
    SH.addBank(fixtureDef('pocket', { version: 2, entries: fixtureDef('pocket').entries.slice(0, 30) }));
    const L2 = WP.live(JSON.parse(JSON.stringify(json)));
    t.ok(L2.ok && L2.bank.hash === json.practice.shiritori.active.bank.hash && L2.bank.version === 1, 'a bank upgrade mid-match: the match finishes under its frozen snapshot');
    // snapshot lost or corrupted: cannot resume → kept as unfinished, no loss
    const broken = JSON.parse(JSON.stringify(json));
    broken.practice.shiritori.active.bank.snap = broken.practice.shiritori.active.bank.snap.slice(0, 3);
    RB.game.s = broken;
    const L3 = WP.live(broken);
    t.ok(!L3.ok && L3.code === 'bank', 'a snapshot that no longer matches its hash cannot resume');
    const ir = WP.abandon(broken, 'incompatible-resume');
    const rr = WP.rec(broken);
    t.ok(ir.reason === 'incompatible-resume' && ir.winner === null && rr.totals.lost === 0 && rr.recent[rr.recent.length - 1].result.reason === 'incompatible-resume' && !WP.ns(broken).active, 'incompatible resume: transcript kept as unfinished, no winner invented, no loss');
    const rules = JSON.parse(JSON.stringify(json)); rules.practice.shiritori.active.st.rules = 'roadside-0';
    t.eq(WP.live(rules).code, 'rules', 'a different house-rule version is detected');
    const other = JSON.parse(JSON.stringify(json)); other.comp = 'mio';
    t.eq(WP.live(other).code, 'companion', 'another companion never resumes it');
    SH.addBank(fixtureDef('pocket'));
  }

  // ---- bank/rule upgrades preserve historical wins (§13.3) -----------------------------------------------------------
  {
    chainBank('pocket', LIN, [0], 1);
    const s = fresh('nao');
    WP.start(s, { band: 'pocket', level: 'casual' }, { first: 'cpu' }); await playOut(s);
    const first = JSON.stringify(WP.rec(s).stages['pocket:casual'].first);
    chainBank('pocket', LIN.concat(['たち']).slice(0, 15).concat(['あう']), [0], 2);
    WP.start(s, { band: 'pocket', level: 'casual' }, { first: 'cpu' });
    const r = await playOut(s);
    const cell = WP.rec(s).stages['pocket:casual'];
    t.ok(JSON.stringify(cell.first) === first && cell.first.bank.version === 1, 'the original receipt keeps its version after an upgrade');
    t.ok(r.stage === 'pocket:casual' && cell.current && cell.current.bank.version === 2 && cell.won === 2, 'a current-version win adds a newer receipt beside it');
  }

  // ---- one active game; rematch alternates and changes the starter (§13.4) -----------------------------------------------
  {
    SH.addBank(fixtureDef('pocket'));
    const s = fresh('nao');
    const g1 = WP.start(s, { band: 'pocket' });
    t.eq(WP.start(s, { band: 'pocket' }).code, 'active', 'one active game per campaign');
    const st1 = WP.ns(s).active.starter, f1 = WP.ns(s).active.first;
    WP.abandon(s);
    WP.start(s, { band: 'pocket' });
    const st2 = WP.ns(s).active.starter, f2 = WP.ns(s).active.first;
    t.ok(st1 !== st2 && f1 !== f2, 'a rematch uses a different certified starter and the other responder (' + st1 + '/' + f1 + ' → ' + st2 + '/' + f2 + ')');
    WP.abandon(s); WP.start(s, { band: 'pocket' });
    const st3 = WP.ns(s).active.starter;
    t.ok(st3 !== st1 && st3 !== st2, 'every certified starter before any repeats');
    t.ok(SH.bank('pocket').starters.includes(st1) && SH.bank('pocket').starters.includes(st2), 'only certified starters for a fixed bank');
    WP.abandon(s);
    t.ok(g1.ok, 'started');
    // difficulty is never adjusted: the same explicit level after wins and losses
    for (const band of WP.BANDS) chainBank(band, LIN, [0], 1);
    const s2 = fresh('mio');
    settingsFor(s2, { shiritoriLevel: 'thoughtful' });
    for (let i = 0; i < 3; i++) { WP.start(s2, {}, { first: 'cpu' }); await playOut(s2); }
    WP.start(s2, {}); t.eq(WP.ns(s2).active.level, 'thoughtful', 'three wins later the level is what the player chose');
    WP.abandon(s2);
  }
  RB.game.s = null;
  SH.chooseMove = realChoose;
};
