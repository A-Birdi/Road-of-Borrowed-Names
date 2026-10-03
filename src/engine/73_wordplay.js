/* Companion shiritori at a rest stop: the table's rules of record, the Wordplay
 * records, and the two once-only relationship events (Practice addendum §9,
 * §13, §14, §21; docs/practice/wordplay.md). The house rules, banks and
 * opponents belong to RB.shiritori (71/72); the table and the Company card are
 * drawn by src/ui/87_wordplay*.js; the words the companions say are in
 * src/content/wordplay/.
 *
 *   RB.wordplay.eligible(s, ctx)        committed companion present, safe, at a rest place
 *   RB.wordplay.bankFor(s, setup)       the frozen bank a setup would use (fixed band or journey)
 *   RB.wordplay.start(s, setup, o)      a new game (one active game per campaign)
 *   RB.wordplay.live(s)                 the active game with its frozen bank, or why it cannot resume
 *   RB.wordplay.draft(s, text, pick)    what an input could be (never a move)
 *   RB.wordplay.playWord(s, edge, meta) the player's confirmed move (Play word)
 *   RB.wordplay.cpuChoose(s) / cpuCommit(s)  the companion's move: chosen and stored first, then committed
 *   RB.wordplay.concede / stopChain / abandon / suspend
 *   RB.wordplay.reflect(s, choice)      How we played (once; the same point for every reply)
 *   RB.wordplay.cells(s, comp)          the 3×3 stage grid for Company
 *
 * Records live in s.practice.shiritori (RB.practice namespace 'shiritori'):
 *   byCompanion[comp] = { stages, cooperative, customSummary, reflection, together, recent,
 *     firstClearTranscripts, pinned, totals, firsts, lastWin, lastFirst, thought }
 *   active (one game), encountered (entry ids shown with their meaning), recentStarters.
 * Nothing here reads the wall clock for eligibility, adapts an opponent to the
 * player's history, or awards bond except the two named events. */
var RB = (globalThis.RB = globalThis.RB || {});
RB.content = RB.content || {};
RB.content.wordplay = RB.content.wordplay || { lines: [], gestures: {}, reflections: {}, thoughts: [], texts: {} };

RB.wordplay = (function () {
  'use strict';
  const SH = () => RB.shiritori;
  const V = 1;
  const BANDS = ['pocket', 'everyday', 'extended'];
  const LEVELS = ['casual', 'thoughtful', 'sharp'];
  const GOALS = [6, 12, 20];
  const LIMITS = { recent: 20, firstClear: 9, pinned: 5, primer: 6, smallBank: 24, restPrompt: 24, commentEvery: 4, thoughtSeconds: 8 * 60 };
  const EV_TOGETHER = 'activity:shiritori:together';
  const EV_REFLECT = 'activity:shiritori:reflection';
  const BAND = {
    pocket: { en: 'Pocket words', jp: 'ポケット の {言葉|ことば}', code: 'P' },
    everyday: { en: 'Everyday words', jp: '{毎日|まいにち} の {言葉|ことば}', code: 'E' },
    extended: { en: 'Extended words', jp: '{広|ひろ}い {言葉|ことば}', code: 'X' },
    journey: { en: 'From my journey', jp: '{旅|たび} で {会|あ}った {言葉|ことば}', code: 'J' },
  };
  const LEVEL = {
    partner: { en: 'Learning partner', jp: '{練習|れんしゅう} {相手|あいて}', code: 'L' },
    casual: { en: 'Casual', jp: '{気楽|きらく}', code: 'C' },
    thoughtful: { en: 'Thoughtful', jp: '{考|かんが}える', code: 'T' },
    sharp: { en: 'Sharp', jp: '{鋭|するど}い', code: 'S' },
  };
  const REASON = ['no-safe-reply', 'terminal-n', 'human-concession', 'cooperative-goal', 'abandoned', 'incompatible-resume'];
  const stageId = (band, level) => band + ':' + level;
  const stageCode = (id) => { const [b, l] = String(id).split(':'); return (BAND[b] ? BAND[b].code : '?') + '-' + (LEVEL[l] ? LEVEL[l].code : '?'); };
  const isObj = (x) => !!x && typeof x === 'object' && !Array.isArray(x);
  const now = () => Date.now();

  // ---- the namespace ------------------------------------------------------------------------------
  function blankComp() {
    return {
      v: V, stages: {}, cooperative: { goals: {}, chains: 0, best: 0 },
      customSummary: { played: 0, won: 0, lost: 0, coop: 0, best: 0, last: null },
      reflection: null, together: null, recent: [], firstClearTranscripts: {}, pinned: [],
      totals: { played: 0, won: 0, lost: 0 }, firsts: {}, lastWin: null, lastFirst: null, thought: null,
    };
  }
  // fill what is missing and bound what grows; unknown ids from a later version are kept
  function normComp(c) {
    if (!isObj(c)) return blankComp();
    const b = blankComp();
    for (const k in b) if (c[k] == null || (isObj(b[k]) && !isObj(c[k])) || (Array.isArray(b[k]) && !Array.isArray(c[k]))) c[k] = b[k];
    if (!isObj(c.cooperative.goals)) c.cooperative.goals = {};
    if (c.recent.length > LIMITS.recent) c.recent = c.recent.slice(-LIMITS.recent);
    if (c.pinned.length > LIMITS.pinned) c.pinned = c.pinned.slice(0, LIMITS.pinned);
    const fc = Object.keys(c.firstClearTranscripts);
    if (fc.length > LIMITS.firstClear) for (const k of fc.slice(LIMITS.firstClear)) delete c.firstClearTranscripts[k];
    return c;
  }
  function norm(sh) {
    if (!isObj(sh)) sh = {};
    if (!isObj(sh.byCompanion)) sh.byCompanion = {};
    for (const k in sh.byCompanion) sh.byCompanion[k] = normComp(sh.byCompanion[k]);
    if (sh.active != null && !isObj(sh.active)) sh.active = null;
    if (!isObj(sh.encountered)) sh.encountered = {};
    if (!isObj(sh.recentStarters)) sh.recentStarters = {};
    return sh;
  }
  if (RB.practice && RB.practice.addNamespace) {
    RB.practice.addNamespace('shiritori', () => ({ byCompanion: {}, active: null, encountered: {}, recentStarters: {} }), norm);
  }
  function ns(s) {
    const p = RB.practice.of(s);
    if (!isObj(p.shiritori) || !p.shiritori._n) {
      p.shiritori = norm(p.shiritori);
      Object.defineProperty(p.shiritori, '_n', { value: true, enumerable: false, configurable: true });
    }
    return p.shiritori;
  }
  function rec(s, comp) {
    const sh = ns(s);
    comp = comp || s.comp;
    if (!comp) return null;
    if (!sh.byCompanion[comp]) sh.byCompanion[comp] = blankComp();
    return sh.byCompanion[comp];
  }
  // read without creating (the Company card of an old save: "No matches recorded")
  function peek(s, comp) {
    const p = s && s.practice && s.practice.shiritori;
    const c = p && p.byCompanion && p.byCompanion[comp || s.comp];
    return c ? normComp(c) : null;
  }

  // ---- eligibility (§3.2) --------------------------------------------------------------------------
  // A committed companion actually beside you, a quiet rest place, the world safe. A provisional
  // companion never qualifies (no records or bond with all four candidates).
  const WHY = {
    nocomp: 'Shiritori is played with the companion travelling with you, once you have set out together.',
    apart: 'Your companion isn\'t beside you here.',
    danger: 'Not with a creature this close.',
    busy: 'Not just now — something else is happening.',
    rest: 'Shiritori is played at a quiet rest stop: an inn, the teahouse, a hut or a camp.',
    scene: 'A conversation is still waiting to finish first.',
  };
  function eligible(s, ctx) {
    if (!s || !s.comp) return { ok: false, why: WHY.nocomp, code: 'nocomp' };
    const safe = RB.company && RB.company.safeHere ? RB.company.safeHere() : { ok: false, why: 'busy' };
    if (!safe.ok) return { ok: false, why: WHY[safe.why] || WHY.busy, code: safe.why || 'busy' };
    if (!RB.company.restHere(s)) return { ok: false, why: WHY.rest, code: 'rest' };
    return { ok: true };
  }

  // ---- banks -------------------------------------------------------------------------------------------
  const installed = () => BANDS.filter((b) => !!SH().bank(b));
  function strategyVersion() {
    const S = SH();
    // the engine's opponents export SH.ai.STRATEGY ('roadside-ai-1', docs/practice/shiritori_engine.md §2)
    return String((S.ai && S.ai.STRATEGY) || S.STRATEGY || S.AI_VERSION || (S.chooseMove && S.chooseMove.version) || 'provisional-1');
  }
  // a compact frozen copy of the approved entries, enough to finish the game under the original
  // bank (§21.5); rebuilding it gives the same content hash
  function snapOf(bank) {
    return bank.entries.map((e) => [e.id, SH().readingsOf(e), e.forms.slice(), e.display ? e.display.jp : '', e.display ? e.display.en : '', e.repeatGroup || '', e.lemmaId || '']);
  }
  function fromSnap(meta, snap) {
    if (!Array.isArray(snap) || !snap.length) return null;
    const entries = snap.map((x) => {
      const e = { id: x[0], readings: x[1], forms: x[2], display: { jp: x[3], en: x[4] }, nounKind: 'common' };
      if (x[5]) e.repeatGroup = x[5];
      if (x[6]) e.lemmaId = x[6];
      return e;
    });
    try { return SH().buildBank({ id: meta.id, version: meta.version, entries, starters: meta.starters || [] }); } catch (e) { return null; }
  }
  // the union of the installed fixed banks by entry id (they are nested; the larger wins)
  function allEntries() {
    const out = {};
    for (const b of BANDS) { const bk = SH().bank(b); if (bk) for (const e of bk.entries) out[e.id] = e; }
    return out;
  }
  // "encountered": introduced in ordinary learning, kept in the notebook, or shown with its meaning
  // at the table or in the primer. Never a claim of mastery.
  function encounteredEntry(s, e, words) {
    const sh = ns(s);
    if (sh.encountered[e.id]) return true;
    const L = s.learn || {};
    const intro = L.intro || {}, items = L.items || {};
    const keys = e.forms.concat(SH().readingsOf(e));
    if (keys.some((f) => intro['v:' + f] || items['v:' + f])) return true;
    return keys.some((f) => words.has(SH().norm(f)));
  }
  function journeyPool(s) {
    const words = new Set();
    for (const n of s.notebook || []) if (n && n.kind === 'word') { if (n.surface) words.add(SH().norm(n.surface)); if (n.reading) words.add(SH().norm(n.reading)); }
    const all = allEntries();
    return Object.keys(all).sort().map((id) => all[id]).filter((e) => encounteredEntry(s, e, words));
  }
  // certified starters of the source banks that are in the journey pool and still open there
  function journeyStarters(bank) {
    const cert = new Set();
    for (const b of BANDS) { const bk = SH().bank(b); if (bk) for (const id of bk.starters || []) cert.add(id); }
    return bank.entries.filter((e) => cert.has(e.id)).map((e) => e.id).filter((id) => {
      const g = SH().newGame(bank, { starter: id });
      return !g.over && SH().safeGroups(g, bank).length >= 4;
    });
  }
  // setup: { format, band, level, support, goal }
  function bankFor(s, setup) {
    if (setup.band === 'journey') {
      const srcs = installed();
      if (!srcs.length) return { ok: false, why: 'The shiritori word banks are not installed in this copy of the game.', code: 'nobank' };
      const pool = journeyPool(s);
      if (pool.length < 2) return { ok: false, why: 'Too few of the words you have met on the road are in the word banks yet.', code: 'tiny', size: pool.length };
      const src = srcs.map((b) => SH().bank(b));
      const version = 'j' + src.map((b) => b.id + '.' + b.version).join('+');
      const bank = SH().buildBank({ id: 'journey', version, entries: pool.map((e) => Object.assign({}, e)), starters: [] });
      bank.starters = journeyStarters(bank);
      const small = bank.groupCount < LIMITS.smallBank || !bank.starters.length;
      return { ok: true, bank, kind: 'journey', size: bank.groupCount, small, certified: bank.starters.length > 0, src: src.map((b) => ({ id: b.id, version: b.version, hash: b.hash })) };
    }
    const bank = BANDS.indexOf(setup.band) >= 0 ? SH().bank(setup.band) : null;
    if (!bank) return { ok: false, why: 'The shiritori word banks are not installed in this copy of the game.', code: 'nobank' };
    return { ok: true, bank, kind: 'fixed', size: bank.groupCount, small: false, certified: (bank.starters || []).length > 0 };
  }

  // ---- starting a game -----------------------------------------------------------------------------------
  function normSetup(s, setup) {
    const st = Object.assign({}, RB.practice.settings(s), setup || {});
    const format = st.format || st.shiritoriFormat;
    const out = {
      format: format === 'cooperative' ? 'cooperative' : 'competitive',
      band: BANDS.concat('journey').indexOf(st.band || st.shiritoriBand) >= 0 ? (st.band || st.shiritoriBand) : 'pocket',
      level: st.level || st.shiritoriLevel,
      support: (st.support || st.shiritoriSupport) === 'recall' ? 'recall' : 'open',
      goal: GOALS.indexOf(+(st.goal || st.shiritoriChain)) >= 0 ? +(st.goal || st.shiritoriChain) : 12,
    };
    if (out.format === 'cooperative') out.level = 'partner';
    else if (LEVELS.indexOf(out.level) < 0) out.level = 'casual';
    return out;
  }
  // a different certified starter before cycling through the recent ones (§13.4)
  function pickStarter(s, bank, session) {
    const sh = ns(s);
    const list = (bank.starters || []).filter((id) => bank.entryById[id]);
    let pool = list, certified = list.length > 0;
    if (!pool.length) {
      // an uncertified opening (journey free play only): any entry that leaves at least one safe reply
      pool = bank.entries.map((e) => e.id).filter((id) => { const g = SH().newGame(bank, { starter: id }); return !g.over; });
    }
    if (!pool.length) return null;
    const key = bank.id + '@' + bank.hash;
    const recent = (sh.recentStarters[key] || []).filter((id) => pool.indexOf(id) >= 0);
    let open = pool.filter((id) => recent.indexOf(id) < 0);
    if (!open.length) { open = pool.slice(); sh.recentStarters[key] = []; }
    const r = RB.practice.stream(s, 'shiritori:starter', session);
    const id = open[Math.floor(r() * open.length)];
    sh.recentStarters[key] = (sh.recentStarters[key] || []).concat(id).slice(-Math.max(1, pool.length - 1));
    // bounded: one list per bank version, and only a handful of versions
    const keys = Object.keys(sh.recentStarters);
    if (keys.length > 8) for (const k of keys.slice(0, keys.length - 8)) delete sh.recentStarters[k];
    return { id, certified: certified && list.indexOf(id) >= 0 };
  }
  // setup → the active game. o: { first: 'pc'|'cpu', ctx }
  function start(s, setupIn, o) {
    o = o || {};
    const sh = ns(s);
    if (!s.comp) return { ok: false, why: WHY.nocomp };
    if (sh.active) return { ok: false, why: 'A match is already waiting. Resume it, or end it without a result first.', code: 'active' };
    const setup = normSetup(s, setupIn);
    const bf = bankFor(s, setup);
    if (!bf.ok) return bf;
    const bank = bf.bank;
    const session = 'wp' + RB.practice.seq(s);
    // o.starter (tests, a demonstration): any entry; it is "certified" only if the bank certifies it
    const st0 = o.starter && bank.entryById[o.starter] ? { id: o.starter, certified: (bank.starters || []).indexOf(o.starter) >= 0 } : pickStarter(s, bank, session);
    if (!st0) return { ok: false, why: 'This bank has no opening that leaves a reply.', code: 'nostarter' };
    const r = rec(s);
    const first = o.first === 'pc' || o.first === 'cpu' ? o.first : r.lastFirst ? (r.lastFirst === 'pc' ? 'cpu' : 'pc') : 'pc';
    r.lastFirst = first;
    const st = SH().newGame(bank, { starter: st0.id, first });
    const pet = s.company && s.company.pet && s.company.pets && s.company.pets[s.company.pet] ? { species: s.company.pet, name: s.company.pets[s.company.pet].name || null } : null;
    sh.active = {
      v: V, session, campaign: s.id, comp: s.comp, format: setup.format, band: setup.band, level: setup.level,
      support: setup.support, goal: setup.goal, kind: bf.kind,
      ctx: { source: (o.ctx && o.ctx.source) || 'company-talk', map: s.map },
      bank: { id: bank.id, version: bank.version, hash: bank.hash, rules: bank.rules, size: bank.groupCount, src: bf.src || null, starters: (bank.starters || []).slice(), snap: snapOf(bank) },
      ai: strategyVersion(), seed: RB.util.hashStr(String(s.id) + '|shiritori|' + session),
      starter: st0.id, certified: st0.certified, first, st,
      cpuMove: null,
      flags: { suggested: setup.support === 'open', inputAssist: false, inputs: {}, restPrompted: false, findUsed: false },
      lastComment: -99, t0: now(), place: placeOf(s), pet, susp: null,
    };
    if (sh.active.st.over) { // a starter with no reply cannot happen for certified starters; never a result
      sh.active = null;
      return { ok: false, why: 'That opening leaves no reply.', code: 'nostarter' };
    }
    return { ok: true, active: sh.active, bank, size: bf.size, small: bf.small, certified: st0.certified };
  }
  function placeOf(s) {
    const m = RB.content.maps && RB.content.maps[s.map];
    return m && m.name ? { jp: m.name.jp || '', en: m.name.en || '' } : null;
  }

  // ---- the active game with its frozen bank (§13.6, §21.5) ---------------------------------------------------
  // Same campaign, same companion, same house rules, and a bank whose content hash matches the
  // snapshot (the installed bank when it is unchanged, or the snapshot itself rebuilt).
  const liveCache = new WeakMap();
  function live(s) {
    const a = ns(s).active;
    if (!a) return { ok: false, code: 'none' };
    const hit = liveCache.get(a);
    if (hit) return { ok: true, active: a, bank: hit };
    if (a.campaign !== s.id) return { ok: false, code: 'campaign', why: 'This match belongs to another journey.' };
    if (a.comp !== s.comp) return { ok: false, code: 'companion', why: 'This match was with another companion.' };
    if (a.st.rules !== SH().RULES || a.bank.rules !== SH().RULES) return { ok: false, code: 'rules', why: 'The house rules have changed since this match was saved.' };
    let bank = null;
    if (a.kind === 'fixed') { const b = SH().bank(a.band); if (b && b.hash === a.bank.hash) bank = b; }
    if (!bank) {
      const b = fromSnap({ id: a.bank.id, version: a.bank.version, starters: a.bank.starters }, a.bank.snap);
      if (b && b.hash === a.bank.hash) bank = b;
    }
    if (!bank) return { ok: false, code: 'bank', why: 'This match\'s word bank cannot be restored.' };
    liveCache.set(a, bank);
    return { ok: true, active: a, bank };
  }

  // ---- drafts: what an input could be (never a move; §10.2–§10.4) -------------------------------------------
  // pick: { entry?: id (an optional sense), reading?: kana (a disambiguation among approved readings) }
  function draft(s, text, pick) {
    pick = pick || {};
    const L = live(s);
    if (!L.ok) return { status: 'none' };
    const { active: a, bank } = L;
    const t = String(text == null ? '' : text);
    const res = SH().resolve(bank, t);
    if (!res.key) return { status: 'empty', key: '' };
    if (!/^[぀-ゟ゠-ヿ一-鿿々〆ー]+$/.test(res.key)) return { status: 'script', key: res.key };
    if (!res.matches.length) return { status: 'outside', key: res.key };
    // senses that share a reading are one play; a kanji form with two approved readings asks which
    let ms = res.matches;
    if (pick.entry) { const m = ms.filter((x) => x.entry.id === pick.entry); if (m.length) ms = m; }
    const readings = Array.from(new Set(ms.reduce((acc, m) => acc.concat(m.edges.map((e) => e.reading)), [])));
    let reading = pick.reading && readings.indexOf(pick.reading) >= 0 ? pick.reading : null;
    if (!reading && readings.length === 1) reading = readings[0];
    if (!reading) return { status: 'needs-reading', key: res.key, readings, matches: ms.map(senseOf) };
    const cands = ms.filter((m) => m.edges.some((e) => e.reading === reading));
    const m0 = cands[0];
    const edge = m0.edges.find((e) => e.reading === reading);
    const senses = cands.length > 1 ? cands.map(senseOf) : null;
    const c = SH().check(a.st, bank, edge, 'pc');
    const out = { key: res.key, edge, reading, entry: m0.entry.id, senses, sense: pick.entry && cands.some((x) => x.entry.id === pick.entry) ? pick.entry : null, readings };
    if (!c.ok) return Object.assign(out, { status: c.why === 'repeat' ? 'repeat' : c.why === 'wrong-head' ? 'wrong-head' : c.why, required: a.st.required, head: edge.head });
    return Object.assign(out, { status: 'ok', terminal: !!c.terminal });
  }
  const senseOf = (m) => ({ entry: m.entry.id, jp: m.entry.display.jp, en: m.entry.display.en, readings: Array.from(new Set(m.edges.map((e) => e.reading))) });

  // ---- moves -------------------------------------------------------------------------------------------------
  const isCoop = (a) => a.format === 'cooperative';
  function combined(a) { return SH().moves(a.st); }
  // the player's confirmed move. meta: { mode: 'hand'|'ime'|'select', repaired, sense }
  function playWord(s, edge, meta) {
    meta = meta || {};
    const L = live(s);
    if (!L.ok) return { ok: false, why: 'none' };
    const { active: a, bank } = L;
    if (a.st.over) return { ok: false, why: 'over' };
    if (a.cpuMove || a.st.next !== 'pc') return { ok: false, why: 'not-your-turn' };
    const e = edge && bank.edges.find((x) => x.id === edge.id);
    const c = SH().check(a.st, bank, e, 'pc');
    if (!c.ok) return c; // an invalid draft: explained, the turn kept
    const mode = ['hand', 'ime', 'select'].indexOf(meta.mode) >= 0 ? meta.mode : 'ime';
    const sr = SH().safeGroups(a.st, bank).length;
    a.flags.inputs[mode] = (a.flags.inputs[mode] || 0) + 1;
    if (meta.repaired) a.flags.inputAssist = true;
    // the move as it was actually submitted (form as typed, written or chosen; bounded)
    const form = meta.form ? String(meta.form).slice(0, 24) : null;
    const extra = { m: mode, sr, rep: meta.repaired ? 1 : 0, sense: meta.sense || null, sug: a.flags.suggested ? 1 : 0, f: form, t: now() };
    const r = SH().play(a.st, bank, e, 'pc', extra);
    afterMove(s, a, bank);
    // wordplay use is its own tally (§4.3): never a mastery event
    RB.practice.tally(s, 'shiritori', Object.assign({ moves: 1, repaired: meta.repaired ? 1 : 0 }, { [mode]: 1 }));
    return Object.assign({ ok: true }, endIfOver(s, a, bank));
  }
  function afterMove(s, a, bank) {
    const h = a.st.history[a.st.history.length - 1];
    if (!a.st.over) h.left = SH().safeGroups(a.st, bank).length; // the other side's safe replies now
    else h.left = 0;
    // the cooperative goal: a shared chain of the chosen length (§9.2); reaching it counts even
    // when the last word also left no reply (a ん word never counts towards it)
    if (isCoop(a) && combined(a) >= a.goal && !(a.st.over && a.st.over.reason === 'terminal-n')) a.st.over = { winner: null, reason: 'cooperative-goal' };
  }
  function endIfOver(s, a, bank) {
    if (!a.st.over) return { over: null };
    return { over: a.st.over, result: finish(s, a, bank) };
  }
  // the companion's move: chosen from the public state with a per-ply strategy stream and stored
  // before anything is animated; reopening help, pets or sound never change it (§12.3)
  async function cpuChoose(s) {
    const L = live(s);
    if (!L.ok) return null;
    const { active: a, bank } = L;
    if (a.st.over || a.st.next !== 'cpu') return null;
    if (a.cpuMove) return a.cpuMove;
    const ply = a.st.history.length;
    const rng = RB.practice.stream(s, 'shiritori:strategy', a.session + ':' + ply);
    const level = isCoop(a) ? 'partner' : a.level;
    let res = null;
    try { res = await SH().chooseMove(a.st, bank, level, rng, { session: a.session }); } catch (e) { res = { edge: null, error: String(e && e.message || e) }; }
    if (ns(s).active !== a || a.st.over || a.st.next !== 'cpu') return null; // the game moved on (left, reloaded)
    if (a.cpuMove) return a.cpuMove;
    let edge = res && res.edge ? bank.edges.find((x) => x.id === res.edge.id) : null;
    const safe = SH().safeReplies(a.st, bank);
    let fallback = !!(res && res.fallback);
    // never an illegal word; never a pretended concession while a safe reply exists
    if (!edge || !SH().check(a.st, bank, edge, 'cpu').ok || edge.terminal) {
      if (safe.length) { edge = SH().casualMove(a.st, bank, rng); fallback = 'invalid-or-null'; }
      else edge = null;
    }
    a.cpuMove = { edge: edge ? edge.id : null, level, depth: res ? res.depth || 0 : 0, exact: !!(res && res.exact), nodes: res ? res.nodes || 0 : 0, fallback, provisional: !!(res && res.provisional), sr: SH().safeGroups(a.st, bank).length };
    return a.cpuMove;
  }
  function cpuCommit(s) {
    const L = live(s);
    if (!L.ok) return { ok: false };
    const { active: a, bank } = L;
    const cm = a.cpuMove;
    if (!cm || a.st.over || a.st.next !== 'cpu') return { ok: false };
    a.cpuMove = null;
    if (!cm.edge) {
      // nothing safe remains for the companion: they concede truthfully (the core reports a
      // no-safe-reply finish after the player's move, so this is only reached through old saves)
      a.st.over = isCoop(a) ? { winner: null, reason: 'no-safe-reply' } : { winner: 'pc', reason: 'no-safe-reply' };
      return Object.assign({ ok: true, edge: null }, endIfOver(s, a, bank));
    }
    const edge = bank.edges.find((x) => x.id === cm.edge);
    const extra = { m: 'cpu', sr: cm.sr, depth: cm.depth, exact: cm.exact ? 1 : 0, nodes: cm.nodes, fb: cm.fallback || 0, prov: cm.provisional ? 1 : 0, ai: a.ai };
    const r = SH().play(a.st, bank, edge, 'cpu', extra);
    if (!r.ok) return { ok: false, why: r.why };
    // the companion's word is now shown with its meaning: encountered (never mastered)
    ns(s).encountered[edge.entry] = 1;
    afterMove(s, a, bank);
    return Object.assign({ ok: true, edge }, endIfOver(s, a, bank));
  }
  // Find a word (Recall) or any forward-looking suggestion: the game is marked for good (§13.1)
  function noteSuggestion(s) {
    const a = ns(s).active;
    if (!a) return false;
    a.flags.suggested = true;
    a.flags.findUsed = true;
    return true;
  }
  // a recognition repair or a different reading of the player's own strokes: input assistance only
  function noteInputAssist(s) { const a = ns(s).active; if (a) a.flags.inputAssist = true; }
  function concede(s) {
    const L = live(s);
    if (!L.ok) return null;
    const { active: a, bank } = L;
    if (a.st.over || isCoop(a)) return null;
    SH().concede(a.st, 'pc');
    return finish(s, a, bank);
  }
  // cooperative: stop the chain here together (no loss)
  function stopChain(s) {
    const L = live(s);
    if (!L.ok) return null;
    const { active: a, bank } = L;
    if (a.st.over || !isCoop(a)) return null;
    a.st.over = { winner: null, reason: 'abandoned', stopped: true };
    return finish(s, a, bank);
  }
  // Leave without a result: no win, no loss, no stage clear, no hidden penalty (§10.5)
  function abandon(s, why) {
    const sh = ns(s);
    const a = sh.active;
    if (!a) return null;
    if (!a.st.over) a.st.over = { winner: null, reason: why === 'incompatible-resume' ? 'incompatible-resume' : 'abandoned' };
    const L = live(s);
    return finish(s, a, L.ok ? L.bank : null);
  }
  // Suspend at a stable confirmed-word boundary: the draft is kept beside it, never committed
  function suspend(s, draftIn) {
    const a = ns(s).active;
    if (!a || a.st.over) return false;
    const d = draftIn && draftIn.text ? { text: String(draftIn.text).slice(0, 24), mode: draftIn.mode || null } : null;
    a.susp = { t: now(), map: s.map, draft: d };
    return true;
  }
  // back at the table: the kept draft is handed back as a draft (never a move)
  function resumed(s) {
    const a = ns(s).active;
    if (!a || !a.susp) return null;
    const d = a.susp.draft || null;
    a.resumes = (a.resumes || 0) + 1;
    a.susp = null;
    return d;
  }

  // ---- results (§13.2–§13.6, §14, §21.1a–§21.2) ------------------------------------------------------------------
  // Replays the confirmed moves from the starter on the frozen bank: the outcome a record is
  // based on is the one the rules give, not a field anyone set.
  function verify(a, bank) {
    if (!bank) return false;
    try {
      const g = SH().newGame(bank, { starter: a.starter, first: a.first });
      for (const h of a.st.history.slice(1)) {
        if (g.over) return false;
        const e = bank.edges.find((x) => x.id === h.edge);
        if (!e || g.next !== h.actor) return false;
        const r = SH().play(g, bank, e, h.actor);
        if (!r.ok) return false;
      }
      const o = a.st.over || {};
      if (o.reason === 'no-safe-reply' && a.format === 'competitive') return !!g.over && g.over.reason === 'no-safe-reply' && g.over.winner === o.winner;
      if (o.reason === 'terminal-n') return !!g.over && g.over.reason === 'terminal-n';
      if (o.reason === 'cooperative-goal') return SH().moves(g) >= a.goal;
      return true;
    } catch (e) { return false; }
  }
  function supportOf(a) { return { support: a.support, suggested: !!a.flags.suggested, inputAssist: !!a.flags.inputAssist, inputs: Object.keys(a.flags.inputs).filter((k) => a.flags.inputs[k] > 0).sort() }; }
  function transcriptOf(s, a, result) {
    const words = (id) => { const L = live(s); const e = L.ok && L.bank.entryById[id]; return e ? [e.display.jp, e.display.en] : ['', '']; };
    return {
      id: a.session, t0: a.t0, t1: now(), comp: a.comp, format: a.format, band: a.band, level: a.level, goal: a.format === 'cooperative' ? a.goal : null,
      bank: { id: a.bank.id, version: a.bank.version, hash: a.bank.hash, size: a.bank.size }, rules: a.st.rules, ai: a.ai, certified: !!a.certified,
      moves: a.st.history.map((h) => {
        const w = words(h.entry);
        const m = { a: h.actor, e: h.entry, r: h.reading, t: h.tail, j: w[0], en: w[1] };
        if (h.m) m.m = h.m;
        if (h.f && h.f !== h.reading) m.f = h.f;
        if (h.sr != null) m.sr = h.sr;
        if (h.left != null) m.left = h.left;
        if (h.rep) m.rep = 1;
        if (h.actor === 'cpu') { m.d = h.depth || 0; m.x = h.exact ? 1 : 0; if (h.fb) m.fb = h.fb; if (h.prov) m.prov = 1; }
        return m;
      }),
      result: { winner: result.winner, reason: result.reason, pmoves: result.pmoves, cmoves: result.cmoves, stage: result.stage || null, note: result.note || null },
      support: supportOf(a), place: a.place, pet: a.pet, map: a.ctx.map,
    };
  }
  // the one short default review point: a fact about this match's frozen bank (§13.5, §26.2)
  function reviewNote(a, bank) {
    const o = a.st.over || {};
    const h = a.st.history;
    const last = h[h.length - 1];
    if (!bank || !last) return null;
    if (o.reason === 'terminal-n') return { kind: 'terminal', reading: last.reading, actor: last.actor };
    if (o.reason === 'human-concession') {
      const reps = SH().safeReplies(a.st, bank);
      const groups = Array.from(new Set(reps.map((x) => x.group)));
      const ex = groups.slice(0, 3).map((g) => { const e = reps.find((x) => x.group === g); return { e: e.entry, r: e.reading }; });
      return { kind: 'overlooked', head: a.st.required, n: groups.length, examples: ex };
    }
    if (o.reason === 'no-safe-reply') {
      // the replies this bank had for that kana, all already used in this match
      const head = last.tail;
      const used = Array.from(new Set((bank.byHead[head] || []).filter((x) => !x.terminal).map((x) => x.group)))
        .map((g) => { const hh = h.find((x) => x.group === g); return hh ? { e: hh.entry, r: hh.reading } : null; }).filter(Boolean);
      return { kind: 'closed', head, by: last.actor, reading: last.reading, used };
    }
    return null;
  }
  const RESULT_LOCK = new WeakSet();
  function finish(s, a, bank) {
    const sh = ns(s);
    if (RESULT_LOCK.has(a) || sh.active !== a) return a._result || null; // one result per game, ever
    RESULT_LOCK.add(a);
    const o = a.st.over || { winner: null, reason: 'abandoned' };
    let reason = o.reason === 'cpu-concession' ? 'no-safe-reply' : o.reason;
    if (REASON.indexOf(reason) < 0) reason = 'abandoned';
    const coop = isCoop(a);
    const winner = coop ? null : reason === 'abandoned' || reason === 'incompatible-resume' ? null : o.winner || null;
    const pmoves = SH().moves(a.st, 'pc'), cmoves = SH().moves(a.st);
    const ok = reason === 'abandoned' || reason === 'incompatible-resume' ? true : verify(a, bank);
    const comp = a.comp;
    const committed = !!s.comp && s.comp === comp; // the committed companion actually played
    const r = rec(s, comp);
    const result = { session: a.session, format: a.format, band: a.band, level: a.level, goal: coop ? a.goal : null, winner, reason, pmoves, cmoves, verified: ok, t: now(), stopped: !!o.stopped };
    result.note = ok ? reviewNote(a, bank) : null;
    const fixed = a.kind === 'fixed' && BANDS.indexOf(a.band) >= 0;
    const finished = ok && (reason === 'no-safe-reply' || reason === 'terminal-n' || reason === 'human-concession');
    // ---- stage records: a single authoritative competitive victory from a certified opening (§9.4, §13.3)
    if (!coop && fixed && finished && LEVELS.indexOf(a.level) >= 0) {
      const id = stageId(a.band, a.level);
      const cell = r.stages[id] || (r.stages[id] = { played: 0, won: 0, first: null, current: null, noSuggest: null });
      cell.played++;
      r.totals.played++;
      if (winner === 'pc') { cell.won++; r.totals.won++; } else r.totals.lost++;
      const clears = winner === 'pc' && reason === 'no-safe-reply' && a.certified && (a.bank.starters || []).indexOf(a.starter) >= 0;
      if (clears) {
        result.stage = id;
        const receipt = {
          stage: id, band: a.band, level: a.level, comp, session: a.session, t: result.t, chain: cmoves, pmoves,
          rules: a.st.rules, bank: { id: a.bank.id, version: a.bank.version, hash: a.bank.hash }, ai: a.ai, starter: a.starter,
          support: supportOf(a), transcript: a.session,
        };
        if (!cell.first) {
          cell.first = receipt;
          result.firstClear = true;
          // a requested stage receipt keeps its transcript even when the rolling history fills
          r.firstClearTranscripts[id] = null; // filled below with the transcript
        } else if (cell.first.bank.hash !== a.bank.hash || cell.first.rules !== a.st.rules) {
          // a rematch under a newer bank or rule version adds a receipt; the historical one stays
          if (!cell.current || cell.current.bank.hash !== a.bank.hash) { cell.current = receipt; result.newVersionReceipt = true; }
        }
        if (!a.flags.suggested && a.support === 'recall' && !cell.noSuggest) { cell.noSuggest = receipt; result.noSuggestClear = true; }
        r.lastWin = { stage: id, t: result.t, session: a.session, chain: cmoves, support: supportOf(a), bank: receipt.bank, rules: receipt.rules };
        RB.bus && RB.bus.emit('wordplay:stage-cleared', { stage: id, comp, session: a.session, first: !!result.firstClear });
      }
    }
    // ---- cooperative milestones and custom-bank results are kept apart from the nine stages
    if (coop && ok) {
      r.cooperative.chains++;
      r.cooperative.best = Math.max(r.cooperative.best, cmoves);
      if (reason === 'cooperative-goal') {
        const g = r.cooperative.goals[a.goal] || (r.cooperative.goals[a.goal] = { done: 0, first: null });
        g.done++;
        if (!g.first) g.first = { t: result.t, session: a.session, band: a.band, chain: cmoves, support: supportOf(a) };
        result.coopFirst = g.done === 1;
      }
    }
    if (a.kind === 'journey' && ok && reason !== 'abandoned' && reason !== 'incompatible-resume') {
      const c = r.customSummary;
      if (coop) { if (reason === 'cooperative-goal') c.coop++; }
      else { c.played++; if (winner === 'pc') c.won++; else c.lost++; }
      c.best = Math.max(c.best, cmoves);
      c.last = { t: result.t, format: a.format, level: a.level, winner, reason, size: a.bank.size, session: a.session };
    }
    if (ok) RB.practice.tally(s, 'shiritori', { games: 1 });
    // ---- the transcript (rolling 20; first clears kept apart)
    const tr = transcriptOf(s, a, result);
    r.recent.push(tr);
    if (r.recent.length > LIMITS.recent) r.recent = r.recent.slice(-LIMITS.recent);
    if (result.firstClear) r.firstClearTranscripts[result.stage] = tr;
    // ---- the two relationship events (§14.1): once, through RB.company.award
    result.bond = social(s, a, result, committed);
    // ---- memories (§14.5): bounded, truthful
    result.memories = memories(s, a, result, r, committed);
    // ---- a recent thought for a quiet rest moment (expires after 8 minutes of active play or a chapter)
    if (reason !== 'incompatible-resume') r.thought = { kind: coop ? (reason === 'cooperative-goal' ? 'coop' : 'stop') : reason === 'abandoned' ? 'stop' : winner === 'pc' ? 'win' : 'loss', pt: Math.round(s.playtime || 0), ch: s.chapter || 0, session: a.session };
    sh.active = null;
    a._result = result;
    liveCache.delete(a);
    return result;
  }
  function social(s, a, result, committed) {
    const r = rec(s, a.comp);
    const out = { together: null, reflection: false };
    if (!committed || !result.verified) return out;
    const coop = isCoop(a);
    const qualifies = coop ? result.reason === 'cooperative-goal' && result.pmoves >= 6
      : (result.reason === 'no-safe-reply' || result.reason === 'terminal-n' || result.reason === 'human-concession') && result.pmoves >= 3;
    if (!qualifies) return out;
    if (r.together) return out; // already: rematches, reloads and replays add nothing
    const before = RB.company.score(s);
    const got = RB.company.award(s, EV_TOGETHER, 1);
    const after = RB.company.score(s);
    r.together = { session: a.session, t: result.t, event: EV_TOGETHER, memory: 'wordplay:together', committed: got || !!(s.company && s.company.bond && s.company.bond[EV_TOGETHER] != null), raised: after > before, format: a.format, winner: result.winner, reason: result.reason, band: a.band, level: a.level };
    if (!r.reflection) r.reflection = { st: 'available', source: a.session, event: EV_REFLECT, memory: 'wordplay:reflection', format: a.format, winner: result.winner, reason: result.reason, band: a.band, level: a.level, t: result.t };
    out.together = r.together.raised ? 'raised' : 'recorded';
    out.reflection = true;
    return out;
  }
  // memory text facts (the words are authored in src/content/wordplay/; plain facts here)
  function memories(s, a, result, r, committed) {
    const got = [];
    if (!committed) return got;
    const T = RB.content.wordplay.texts || {};
    const place = a.place || placeOf(s);
    const fact = describe(a, result);
    if (r.together && r.together.session === a.session && !r.firsts.together) {
      r.firsts.together = a.session;
      const lines = a.st.history.map((h) => { const w = wordOf(s, h); return { who: h.actor === 'pc' ? 'pc' : h.actor === 'cpu' ? a.comp : 'narr', jp: w.jp, en: h.reading + (w.en ? ' — ' + w.en : '') }; });
      if (RB.company.memory(s, { id: 'wordplay:together', kind: 'together', title: T.memTogether || { jp: 'しりとり', en: 'A game of shiritori' }, text: fact, place, lines: lines.slice(0, 40), ref: { kind: 'wordplay', session: a.session } })) got.push('wordplay:together');
    }
    if (result.stage && result.firstClear) {
      const sharp = a.level === 'sharp';
      if (!r.firsts.clear) {
        r.firsts.clear = a.session;
        if (sharp) r.firsts.sharp = a.session;
        const text = { jp: fact.jp, en: fact.en + (sharp ? ' It was also the first win against Sharp play.' : '') };
        if (RB.company.memory(s, { id: 'wordplay:first-clear', kind: 'together', title: T.memClear || { jp: '{初|はじ}めて の {勝|か}ち', en: 'A first shiritori win' }, text, place, ref: { kind: 'wordplay', stage: result.stage, session: a.session } })) got.push('wordplay:first-clear');
      } else if (sharp && !r.firsts.sharp) {
        r.firsts.sharp = a.session;
        if (RB.company.memory(s, { id: 'wordplay:first-sharp', kind: 'together', title: T.memSharp || { jp: '{鋭|するど}い {相手|あいて} に {勝|か}った', en: 'A win against Sharp play' }, text: fact, place, ref: { kind: 'wordplay', stage: result.stage, session: a.session } })) got.push('wordplay:first-sharp');
      }
    }
    return got;
  }
  function wordOf(s, h) {
    const L = live(s);
    const e = L.ok && L.bank.entryById[h.entry];
    return e ? { jp: e.display.jp, en: e.display.en } : { jp: h.reading, en: '' };
  }
  // plain facts for a memory: who, what, where, how it ended (never "mastered")
  function describe(a, result) {
    const C = (RB.content.chars || {})[a.comp];
    const who = C ? C.name.en : 'your companion';
    const band = BAND[a.band].en, level = LEVEL[a.level].en;
    const n = result.cmoves;
    let en;
    if (a.format === 'cooperative') en = 'You and ' + who + ' built a chain of ' + n + ' words together (' + band + ', aiming for ' + a.goal + ').';
    else if (result.winner === 'pc') en = 'You won a game of shiritori against ' + who + ' (' + band + ', ' + level + ') after ' + n + ' played words' + (result.reason === 'no-safe-reply' ? ': no playable continuation remained in the match\'s bank.' : '.');
    else en = who + ' won a game of shiritori against you (' + band + ', ' + level + ') after ' + n + ' played words' + (result.reason === 'human-concession' ? '; you conceded.' : result.reason === 'terminal-n' ? '; a word ending in ん closed it.' : '.');
    // the Japanese line is authored (src/content/wordplay/20_reflect.js texts.desc), so the validator reads it
    const D = (RB.content.wordplay.texts && RB.content.wordplay.texts.desc) || {};
    const pick = a.format === 'cooperative' ? D.coop : result.winner === 'pc' ? D.win : D.loss;
    return { jp: pick ? pick.jp : '', en };
  }

  // ---- How we played (§14.3) -------------------------------------------------------------------------------------
  function reflection(s) {
    const r = peek(s);
    if (!r || !r.reflection || !s.comp) return null;
    return r.reflection.st === 'available' || r.reflection.st === 'deferred' ? r.reflection : null;
  }
  function deferReflection(s) { const rf = reflection(s); if (rf) rf.st = 'deferred'; return !!rf; }
  // choice: 'endings' | 'finding' | 'together'; reply: the companion's answer as said ({jp,en})
  function reflect(s, choice, o) {
    o = o || {};
    const rf = reflection(s);
    if (!rf || ['endings', 'finding', 'together'].indexOf(choice) < 0) return false;
    const r = rec(s);
    const before = RB.company.score(s);
    RB.company.award(s, EV_REFLECT, 1);
    const after = RB.company.score(s);
    Object.assign(rf, { st: 'completed', choice, t: now(), raised: after > before });
    const T = RB.content.wordplay.texts || {};
    // the reply as it was actually chosen (the scene passes it); the authored text otherwise
    const said = o.said && (o.said.jp || o.said.en) ? o.said : (T.replies && T.replies[choice]) || { jp: '', en: choice };
    rf.said = { jp: said.jp || '', en: said.en || '' };
    RB.company.memory(s, {
      id: 'wordplay:reflection', kind: 'reflections', title: T.memReflect || { jp: 'どう {遊|あそ}んだ か', en: 'How we played' },
      text: { jp: said.jp, en: 'You said: "' + said.en + '"' }, reply: o.reply || null, choice, lines: o.lines || null, place: placeOf(s),
      ref: rf.source ? { kind: 'wordplay', session: rf.source } : null,
    });
    r.firsts.reflection = rf.source || true;
    return { raised: rf.raised };
  }

  // ---- the companion's lines (src/content/wordplay/10_lines.js) ---------------------------------------------------
  // categories: invite rules thinking move newword escape trap win loss coop stop resume firstclear reflect
  const INCIDENTAL = { move: 1, newword: 1, escape: 1 };
  function line(s, cat, salt, facts) {
    const comp = s.comp;
    const all = (RB.content.wordplay.lines || []).filter((l) => l.comp === comp && l.cat === cat && (!l.when || RB.state.test(s, l.when)) &&
      (!l.facts || Object.keys(l.facts).every((k) => (facts || {})[k] === l.facts[k])));
    if (!all.length) return null;
    const top = Math.max(...all.map((l) => l.prio || 0));
    const best = all.filter((l) => (l.prio || 0) === top);
    const pick = best[RB.util.hashStr(String(salt || '') + '|' + cat) % best.length];
    return RB.dialect ? RB.dialect.line(comp, pick) : pick; // shown as she speaks (Suzu's Kansai-ben, src/lang/85_dialect.js)
  }
  // at most one optional comment per four combined moves; Quiet keeps rules and results only
  function mayComment(s, cat) {
    const a = ns(s).active;
    if (!INCIDENTAL[cat]) return true;
    const st = RB.game && RB.game.settings;
    if (st && st.activityChatter === 'quiet') return false;
    if (!a) return false;
    const n = combined(a);
    if (n - (a.lastComment == null ? -99 : a.lastComment) < LIMITS.commentEvery) return false;
    a.lastComment = n;
    return true;
  }

  // ---- Company: the 3×3 grid and the rest (§13.2, §26.4) -----------------------------------------------------------
  function cells(s, comp) {
    const r = peek(s, comp);
    const out = [];
    for (const b of BANDS) for (const l of LEVELS) {
      const c = r && r.stages[stageId(b, l)];
      out.push({ id: stageId(b, l), code: stageCode(stageId(b, l)), band: b, level: l, state: c && c.first ? 'won' : c && c.played ? 'played' : 'none', cell: c || null });
    }
    return out;
  }
  function supportLabel(sp) {
    if (!sp) return '';
    const base = sp.support === 'recall' ? (sp.suggested ? 'Recall · in-game word suggestions used' : 'Recall · no in-game word suggestions used') : 'Open-book · word bank shown';
    const inp = (sp.inputs || []).map((k) => ({ hand: 'handwriting', ime: 'typing', select: 'choosing from the bank' })[k]).filter(Boolean);
    return base + (inp.length ? ' · ' + inp.join(' + ') : '') + (sp.inputAssist ? ' (with input corrections)' : '');
  }
  function transcripts(s, comp) {
    const r = peek(s, comp);
    if (!r) return [];
    const seen = new Set(), out = [];
    const add = (t, why) => { if (t && t.id && !seen.has(t.id)) { seen.add(t.id); out.push(Object.assign({ why }, t)); } };
    for (const t of r.pinned) add(t, 'pinned');
    for (const k of Object.keys(r.firstClearTranscripts)) add(r.firstClearTranscripts[k], 'first-clear');
    for (const t of r.recent.slice().reverse()) add(t, 'recent');
    return out;
  }
  function findTranscript(s, id, comp) { return transcripts(s, comp).find((t) => t.id === id) || null; }
  // pin a transcript; with five pinned, an explicit replacement is needed (§13.6)
  function pin(s, id, replaceId) {
    const r = rec(s);
    if (r.pinned.some((t) => t.id === id)) return { ok: true };
    const t = findTranscript(s, id);
    if (!t) return { ok: false, why: 'missing' };
    if (r.pinned.length >= LIMITS.pinned) {
      const i = r.pinned.findIndex((x) => x.id === replaceId);
      if (i < 0) return { ok: false, why: 'full', pinned: r.pinned.map((x) => x.id) };
      r.pinned.splice(i, 1);
    }
    const copy = Object.assign({}, t); delete copy.why;
    r.pinned.push(copy);
    return { ok: true };
  }
  function unpin(s, id) { const r = rec(s); const i = r.pinned.findIndex((t) => t.id === id); if (i >= 0) r.pinned.splice(i, 1); return i >= 0; }

  // ---- "Learn a few more words together": a primer outside the match (§11.4) ----------------------------------------
  function primer(s, n) {
    const pocket = SH().bank('pocket') || SH().bank(installed()[0]);
    if (!pocket) return [];
    const pool = journeyPool(s);
    const have = new Set(pool.map((e) => e.id));
    const tails = new Set(pool.map((e) => SH().boundary(SH().readingsOf(e)[0]).tail));
    const heads = new Set(pool.map((e) => SH().boundary(SH().readingsOf(e)[0]).head));
    const cand = pocket.entries.filter((e) => !have.has(e.id) && !SH().boundary(SH().readingsOf(e)[0]).terminal);
    // words that give the pool a reply where it has none come first; then the bank's own order
    const score = (e) => { const b = SH().boundary(SH().readingsOf(e)[0]); return (tails.has(b.head) && !heads.has(b.head) ? 2 : 0) + (heads.has(b.tail) ? 1 : 0); };
    const r = RB.practice.stream(s, 'shiritori:primer', pool.length);
    return cand.map((e) => ({ e, k: score(e) + r() * 0.5 })).sort((x, y) => y.k - x.k).slice(0, n || LIMITS.primer).map((x) => x.e);
  }
  function markEncountered(s, ids) { const sh = ns(s); for (const id of ids || []) sh.encountered[id] = 1; }

  // ---- conditions and the recent thought (§14.5) -----------------------------------------------------------------------
  // wordplay.recent[=win|loss|coop|stop]: a game just finished at this rest stop; lower priority than a
  // story topic, an owed ending or a Pages conversation; gone after 8 minutes of active play or a chapter
  function recentThought(s) {
    const r = peek(s);
    const t = r && r.thought;
    if (!t || !s.comp) return null;
    if ((s.playtime || 0) - (t.pt || 0) > LIMITS.thoughtSeconds) return null;
    if ((s.chapter || 0) !== (t.ch || 0)) return null;
    try { if (RB.pages && RB.pages.pending && RB.pages.pending(s)) return null; } catch (e) { /* pages not loaded */ }
    try { if (RB.company.pending && RB.company.pending(s)) return null; } catch (e) { /* none */ }
    return t;
  }
  if (RB.state && RB.state.addTerm) {
    RB.state.addTerm('wordplay', (s, rest, op, val) => {
      if (rest === 'recent') { const t = recentThought(s); return !!t && (!op || (op === '!=' ? t.kind !== val : t.kind === val)); }
      if (rest === 'reflect') { const rf = reflection(s) || (peek(s) && peek(s).reflection); return !!rf && (!op || (op === '!=' ? rf.format !== val : rf.format === val)); }
      if (rest === 'won') { const rf = peek(s) && peek(s).reflection; return !!rf && rf.winner === 'pc'; }
      if (rest === 'lost') { const rf = peek(s) && peek(s).reflection; return !!rf && rf.winner === 'cpu'; }
      if (rest === 'played') return !!(peek(s) && peek(s).recent.length);
      return false;
    });
  }

  return {
    V, BANDS, LEVELS, GOALS, LIMITS, BAND, LEVEL, REASON, WHY, EV_TOGETHER, EV_REFLECT, stageId, stageCode,
    ns, rec, peek, blankComp, normComp, norm, eligible, installed, bankFor, journeyPool, journeyStarters, snapOf, fromSnap, strategyVersion,
    normSetup, start, live, draft, playWord, cpuChoose, cpuCommit, noteSuggestion, noteInputAssist, concede, stopChain, abandon, suspend, resumed,
    verify, finish, reflection, deferReflection, reflect, line, mayComment, cells, supportLabel, transcripts, findTranscript, pin, unpin,
    primer, markEncountered, recentThought, describe, combined, isCoop,
  };
})();
