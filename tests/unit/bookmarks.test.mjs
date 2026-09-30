// Sentence bookmarks and Creatures met (addendum §20; src/engine/63_bookmarks.js,
// src/engine/64_creatures.js, src/content/words/): event-time text for mutable
// names and branch wording, keeping from history (with and without recorded
// context), duplicates, the cap, plain user text, source checks (a changed or
// removed source is a saved excerpt, the kept text never changes), noted-word
// uses only among kept sentences, practice steps from the real template with no
// learning item, no learning record touched; creatures registered only when met,
// species apart from placements, observations only from what the rules
// produced, phases only once begun, no counts; migration keeps every record;
// every Japanese label is valid markup with known words.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const S = RB.state, BM = RB.bookmarks, CR = RB.creatures, C = RB.content;
  const fresh = (o) => { const s = S.newCampaign({}); s.map = 'rw.hall'; s.player.name = 'Aki'; s.player.nameJp = 'アキ'; Object.assign(s, o || {}); RB.game.s = s; return s; };
  const learnOf = (s) => JSON.stringify(s.learn);

  // ---- a test scene: mutable names and a companion branch ------------------------------------------
  RB.script.add([
    '@scene wt.unit',
    'narr: $name は 、 {古|ふる}い {看板|かんばん} を {見|み}た 。 || $name looks at the old sign.',
    '?(comp=nao) comp: {届|とど}かなかった {約束|やくそく} か 。 || A promise that never arrived, then.',
    '?(comp=mio) comp: {約束|やくそく} は {重|おも}い です 。 || Promises are heavy.',
    'comp: $comp も $name も 、 {行|い}こう 。 || $comp and $name — let\'s go.',
    '!choice',
    '* $comp と {行|い}く || Go with $comp -> end',
  ].join('\n'), 'wt');
  const sc = C.scenes['wt.unit'];
  const say = (i) => { const c = sc.cmds.filter((x) => x.op === 'say')[i]; return { who: c.who === 'comp' ? RB.game.s.comp : c.who, jp: c.jp, en: c.en, sceneId: 'wt.unit', line: c.line }; };
  // what the dialogue box does for each line: a history entry, then the context on it
  const show = (s, line) => { s.backlog.push({ who: line.who, jp: line.jp, en: line.en }); const e = s.backlog[s.backlog.length - 1]; BM.capture(line, e, s); return e; };

  const s = fresh({ comp: 'nao' });
  const L0 = learnOf(s);
  const e0 = show(s, say(0));
  t.eq(e0.k && e0.k.src, { k: 'sc', id: 'wt.unit' }, 'a shown line gets its source on its history entry');
  t.eq(e0.k.v, { name: 'アキ' }, 'and the placeholder values it was shown with');
  t.eq(e0.k.e, 'Aki looks at the old sign.', 'and the English as it read');
  const r0 = BM.keep(s, e0);
  t.ok(r0.ok && s.bookmarks.length === 1, 'keep a narration line');
  const b0 = r0.b;
  t.eq([b0.jp, b0.en, b0.v, b0.who, b0.map, b0.place && b0.place.en], [say(0).jp, 'Aki looks at the old sign.', { name: 'アキ' }, 'narr', 'rw.hall', C.maps['rw.hall'].name.en], 'kept: original markup, event-time English and names, speaker, place');
  t.eq(BM.keep(s, e0).already, true, 'keeping the same line again finds the one already kept');
  t.eq(s.bookmarks.length, 1, 'no duplicate');
  // the companion's branch line
  const e1 = show(s, say(1));
  const b1 = BM.keep(s, e1).b;
  t.eq([b1.who, b1.wn.en, b1.en], ['nao', 'Nao', 'A promise that never arrived, then.'], 'the branch line shown for Nao, with her name then');
  const e2 = show(s, say(3));
  const b2 = BM.keep(s, e2).b;
  t.eq([b2.v, b2.en], [{ comp: 'ナオ', name: 'アキ' }, 'Nao and Aki — let\'s go.'], 'two placeholders kept');
  t.eq(learnOf(s), L0, 'keeping records nothing about learning');

  // later changes never reach a kept sentence
  s.player.name = 'Beni'; s.player.nameJp = 'ベニ'; s.comp = 'mio';
  t.eq([b0.en, b0.v.name, b1.en, b2.en], ['Aki looks at the old sign.', 'アキ', 'A promise that never arrived, then.', 'Nao and Aki — let\'s go.'], 'a rename and a different companion leave kept text as it was');
  const plain = RB.jp.plain(b2.jp, b2.v);
  t.ok(plain.includes('ナオ') && plain.includes('アキ') && !plain.includes('ベニ'), 'the kept Japanese reads with the names it was shown with');
  s.player.name = 'Aki'; s.player.nameJp = 'アキ'; s.comp = 'nao';

  // a placeholder another system adds (a pet's name, as a pets system might add
  // it to the scene variables): kept with the name it was shown with
  const jv = RB.script.jpVars, ev = RB.script.enVars;
  RB.script.jpVars = () => Object.assign(jv(), { pet: 'ミケ' });
  RB.script.enVars = (x) => ev(x).replace(/\$pet\b/g, 'Mike');
  const bpet = BM.keep(s, show(s, { who: 'narr', jp: '$pet が {鳴|な}いた 。', en: '$pet mewed.', sceneId: 'wt.unit' })).b;
  RB.script.jpVars = () => Object.assign(jv(), { pet: 'タマ' });
  RB.script.enVars = (x) => ev(x).replace(/\$pet\b/g, 'Tama');
  const petPlain = RB.jp.plain(bpet.jp, bpet.v);
  t.ok(bpet.v.pet === 'ミケ' && bpet.en === 'Mike mewed.' && petPlain.includes('ミケ') && !petPlain.includes('タマ'), 'a pet renamed later: the kept line keeps the name it was shown with');
  RB.script.jpVars = jv; RB.script.enVars = ev;
  BM.remove(s, bpet.id);

  // a reply: its context waits until the scene runner adds its history entry
  BM.chose({ jp: '$comp と {行|い}く', en: 'Go with $comp' }, s);
  s.backlog.push({ who: 'pc', jp: '$comp と {行|い}く', en: 'Go with $comp', choice: true });
  await new Promise((r) => setTimeout(r, 5));
  const ec = s.backlog[s.backlog.length - 1];
  t.ok(ec.k && ec.k.v && ec.k.v.comp === 'ナオ' && ec.k.e === 'Go with Nao' && ec.k.src.id === 'wt.unit', 'a chosen reply gets its event-time context and scene');
  const bc = BM.keep(s, ec).b;
  t.eq([bc.choice, bc.who, bc.wn.en, bc.en], [true, 'pc', 'Aki', 'Go with Nao'], 'a reply kept from the history, with the player\'s name then');
  // an old history entry (no context recorded): kept honestly, names as they are now
  const old = { who: 'narr', jp: '$name は {歩|ある}いた 。', en: '$name walked.' };
  s.backlog.unshift(old);
  const bo = BM.keep(s, old).b;
  t.eq([bo.approx, bo.en, bo.src.k], [true, 'Aki walked.', 'ln'], 'an entry from before context was recorded is marked approximate');
  t.eq(BM.keep(s, { who: 'narr', jp: '', en: 'English only' }).why, 'ineligible', 'a line with no Japanese cannot be kept');

  // ---- source status: ok / changed / removed / unknown ---------------------------------------------------
  t.eq([BM.status(b0), BM.status(b1), BM.status(bc), BM.status(bo)], ['ok', 'ok', 'ok', 'unknown'], 'sources found where they are');
  const orig = sc.cmds.find((c) => c.op === 'say' && c.jp === say(1).jp);
  const keepJp = orig.jp;
  orig.jp = '{届|とど}いた {約束|やくそく} か 。';
  t.eq(BM.status(b1), 'changed', 'a changed source line: a saved excerpt');
  t.eq(b1.jp, keepJp, 'the kept text is unchanged');
  orig.jp = keepJp;
  const hold = C.scenes['wt.unit']; delete C.scenes['wt.unit'];
  t.eq(BM.status(b0), 'removed', 'a removed scene: a saved excerpt');
  C.scenes['wt.unit'] = hold;
  // a readable prop's text line and an encounter's line
  const mp = Object.keys(C.maps).find((id) => (C.maps[id].props || []).some((p) => p.text && p.text.jp));
  const pr = C.maps[mp].props.find((p) => p.text && p.text.jp);
  const bp = BM.keep(s, { who: 'narr', jp: pr.text.jp, en: pr.text.en, k: { m: mp, src: { k: 'pr', m: mp, x: pr.x, y: pr.y, o: pr.p } } }).b;
  t.eq([BM.status(bp), bp.obj], ['ok', pr.p], 'a line read from a thing in the world: its prop is the source');
  const reed = C.enemies['rw.reedling'];
  const bb = BM.keep(s, { who: 'narr', jp: reed.intro.jp, en: reed.intro.en, k: { m: 'rw.millroad', src: { k: 'bt', id: 'rw.reedling' } } }).b;
  t.eq(BM.status(bb), 'ok', 'an encounter\'s opening line: the creature is the source');
  const f3 = C.maps['rw.millroad'].foes.find((f) => f.id === 'f3');
  const bpl = BM.keep(s, { who: 'narr', jp: f3.intro.jp, en: f3.intro.en, k: { m: 'rw.millroad', src: { k: 'bt', id: 'rw.dustmoth' } } }).b;
  t.eq(BM.status(bpl), 'ok', 'a placement\'s own line is found at its placement');

  // ---- user text: plain, bounded ---------------------------------------------------------------------------
  const nasty = '<img src=x onerror=alert(1)>' + String.fromCharCode(0, 7, 27) + 'ok' + String.fromCharCode(0x202e) + 'x' + 'y'.repeat(100);
  const rt = BM.rename(s, b0.id, nasty);
  t.ok(rt.title.length <= BM.TITLE_MAX && rt.title.startsWith('<img src=x onerror=alert(1)>') && !/[\u0000-\u001f]/.test(rt.title) && rt.title.indexOf(String.fromCharCode(0x202e)) < 0, 'a title keeps its characters as text, without control or direction marks, within the limit');
  const rn = BM.setNote(s, b0.id, 'line one\r\nline two\n\n\n\nline three' + 'z'.repeat(400));
  t.ok(rn.note.startsWith('line one\nline two\n\nline three') && Array.from(rn.note).length <= BM.NOTE_MAX, 'a note keeps its lines, bounded');
  t.eq(BM.rename(s, 'nope', 'x'), null, 'unknown bookmark: nothing happens');
  // what the page shows for them: escaped
  const html = RB.ui.wordsPages.bmHtml(s, { view: { bmOpen: b0.id }, s });
  t.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;') && !html.includes('<img src=x'), 'the page shows a title as escaped text');

  // ---- noted words: uses among kept sentences only ---------------------------------------------------------
  s.notebook.push({ kind: 'word', id: 'w:約束|やくそく', surface: '約束', reading: 'やくそく', m: 'promise', t: 1 });
  const uses = BM.usesOf(s, s.notebook[s.notebook.length - 1]);
  const inGame = Object.values(C.scenes).reduce((n, x) => n + x.cmds.filter((c) => c.op === 'say' && c.jp && c.jp.includes('{約束|やくそく}')).length, 0);
  t.ok(uses.length === 1 && uses[0].id === b1.id && inGame > 5, 'a noted word lists only the kept sentence that uses it (' + inGame + ' lines in the game use it)');

  // ---- practice: the real recognition template, no learning item ----------------------------------------------
  const steps = BM.practiceSteps(b1, 3);
  t.ok(steps.length >= 1 && steps.every((x) => x.kind === 'choose' && !x.item && x.options.filter((o) => o.ok).length === 1), 'practice steps: recognition choices with one right answer and no learning item');
  const right = steps[0].options.find((o) => o.ok).en;
  const lexM = RB.lex.all().filter((e) => e.m === right);
  t.ok(lexM.length >= 1, 'the right answer is a lexicon meaning (' + right + ')');
  t.eq(learnOf(s), L0, 'building practice records nothing');

  // ---- the cap ------------------------------------------------------------------------------------------------------
  const s2 = fresh({ comp: null });
  for (let i = 0; i < BM.MAX; i++) BM.keep(s2, { who: 'narr', jp: 'あ' + i, en: 'a' + i, k: { m: 'rw.hall', src: { k: 'ln' } } });
  const over = BM.keep(s2, { who: 'narr', jp: 'いっぱい', en: 'full', k: { m: 'rw.hall', src: { k: 'ln' } } });
  t.eq([over.ok, over.why, s2.bookmarks.length, s2.bookmarks[0].jp], [false, 'full', BM.MAX, 'あ0'], 'at the cap nothing is evicted: keeping says it is full');
  t.ok(BM.remove(s2, s2.bookmarks[0].id) && BM.keep(s2, { who: 'narr', jp: 'いっぱい', en: 'full' }).ok, 'remove one, keep another');

  // ---- migration keeps every record ------------------------------------------------------------------------------------
  const oldSave = JSON.parse(JSON.stringify(fresh()));
  delete oldSave.bookmarks; delete oldSave.creatures;
  const m1 = RB.save.migrate(JSON.parse(JSON.stringify(oldSave)));
  t.ok(Array.isArray(m1.bookmarks) && m1.bookmarks.length === 0 && m1.creatures && !Object.keys(m1.creatures).length, 'an older save gains empty records');
  const odd = JSON.parse(JSON.stringify(fresh()));
  odd.bookmarks = [{ jp: '{古|ふる}い', en: 'old', who: 'narr' }, 'junk'];
  odd.creatures = { 'gone.creature': { t: 1, name: { en: 'Gone', jp: '' } } };
  const m2 = RB.save.migrate(odd);
  t.ok(m2.bookmarks.length === 2 && m2.bookmarks[0].id && m2.bookmarks[0].title === '' && m2.bookmarks[1] === 'junk', 'bookmarks: an id is filled, nothing is dropped');
  t.ok(m2.creatures['gone.creature'].maps && m2.creatures['gone.creature'].notes, 'an unknown creature is kept (shape repaired)');
  t.eq(RB.save.validate(m2), [], 'the migrated save validates');

  // =================================================================================================================
  // Creatures met
  // =================================================================================================================
  const s3 = fresh({ comp: null });
  t.eq(Object.keys(s3.creatures).length, 0, 'no creature is registered by its definition (' + Object.keys(C.enemies).length + ' defined)');
  RB.test.disable();
  const met = CR.meet(s3, ['rw.reedling'], { where: { map: 'rw.millroad', x: 10, y: 21 }, place: C.maps['rw.millroad'].foes.find((f) => f.id === 'f1') });
  t.eq([met, Object.keys(s3.creatures)], [['rw.reedling'], ['rw.reedling']], 'an encounter registers its creature');
  const r3 = s3.creatures['rw.reedling'];
  t.eq([r3.name.en, r3.maps['rw.millroad'].name.en, r3.maps['rw.millroad'].intro.en], ['Reedling', C.maps['rw.millroad'].name.en, C.enemies['rw.reedling'].intro.en], 'its name and the first line seen at that place');
  const p2 = C.maps['rw.mill0'].foes.find((f) => f.id === 'p2');
  CR.meet(s3, ['rw.reedling'], { where: { map: 'rw.mill0', x: 3, y: 4 }, place: p2 });
  t.eq([Object.keys(r3.maps), r3.maps['rw.mill0'].intro.en], [['rw.millroad', 'rw.mill0'], p2.intro.en], 'the same species at another placement keeps that place\'s own line');
  CR.meet(s3, ['rw.reedling'], { where: { map: 'rw.millroad' } });
  t.eq(Object.keys(r3.maps).length, 2, 'meeting it again at a known place adds nothing');
  // the Atlas: every generated room is one place
  CR.meet(s3, ['atlas.moth'], { where: { map: 'atlas.r1.a' } });
  CR.meet(s3, ['atlas.moth'], { where: { map: 'atlas.r2.b' } });
  t.eq([Object.keys(s3.creatures['atlas.moth'].maps), s3.creatures['atlas.moth'].maps.atlas.name.en], [['atlas'], 'The Unwritten Atlas'], 'Atlas rooms count as one place');
  // a group: the others are met alongside the lead
  CR.meet(s3, ['sg.crab', 'sg.moth'], { where: { map: 'sg.harbor' } });
  t.ok(s3.creatures['sg.moth'] && s3.creatures['sg.moth'].maps['sg.harbor'].with === 'sg.crab' && !s3.creatures['sg.moth'].maps['sg.harbor'].intro, 'a group\'s other creature: met alongside, with no opening line of its own');
  t.eq(CR.meet(s3, ['no.such'], {}), [], 'an unknown id registers nothing');

  // observations from real rules state: the mill echo, step by step
  const L = RB.combatLogic;
  const echo = Object.assign({ id: 'rw.mill_echo' }, C.enemies['rw.mill_echo']);
  const s4 = fresh({ comp: null, map: 'rw.mill1' });
  s4.words = ['mamoru', 'mizu', 'hikari'];
  CR.meet(s4, ['rw.mill_echo'], { where: { map: 'rw.mill1' } });
  const st = L.init(echo, s4, {});
  const members = [echo];
  const ws = s4.words.map((w) => C.words[w]);
  const rec4 = () => s4.creatures['rw.mill_echo'];
  const notes = () => Object.keys(rec4().notes).sort();
  const exchange = (cardOf) => {
    CR.saw(s4, st, members); // telegraph on screen
    const card = cardOf(L.responses(st, ws));
    const P = L.playerAct(st, card, { ok: true, firstTry: true, mistakes: 0 }, echo);
    CR.saw(s4, st, members, { fx: P.fx, card, answered: P.answered });
    if (L.allSettled(st)) return 'win';
    const efx = L.enemyAct(st, P.answered);
    CR.saw(s4, st, members, { fx: efx, enemy: true });
    L.endRound(st, echo);
    return st.over;
  };
  const pickWord = (id) => (cs) => cs.find((c) => c.kind === 'word' && c.word.id === id && (c.target || 'pc') === 'pc');
  const pick = (kind) => (cs) => cs.find((c) => c.kind === kind);
  t.eq(st.intent.kind, 'strike', 'the echo opens with a Strike');
  exchange(pickWord('mamoru'));
  t.eq(notes(), ['a:strike:mamoru', 'i:strike'], 'a Strike seen and blocked by a ward: two notes');
  t.eq(st.intent.kind, 'heat', 'then Heat');
  exchange(pick('unravel'));
  t.eq(notes(), ['a:strike:mamoru', 'i:heat', 'i:strike', 's:heat'], 'Heat seen, left unanswered, took effect');
  exchange(pickWord('mizu'));
  t.ok(notes().includes('c:heat:mizu') && !notes().includes('a:strike:mizu'), 'water cooled its Heat (the Strike it did not answer is not claimed)');
  const noFuture = (label) => {
    const n = notes();
    const html = RB.ui.wordsPages.crHtml(s4, { view: { crOpen: 'rw.mill_echo' }, s: s4 });
    const txt = html.replace(/<[^>]+>/g, ' ');
    const ph = echo.phases.map((x) => x.line.en.slice(0, 24));
    return { n, bad: n.filter((k) => /^(p:|i:mirror|i:plea)/.test(k)), text: ['Mirror', 'Plea', 'Kōji', 'コウジ'].concat(ph).filter((w) => txt.includes(w)), label };
  };
  const before = noFuture('before its first change');
  t.eq([before.bad, before.text], [[], []], 'before its first change: no later move, phase line or plea answer anywhere (' + before.n.join(' ') + ')');
  t.eq([st.intent.kind, st.knots], ['rest', 3], 'then it waits, with 3 knots left');
  exchange(pick('unravel')); // knots 3 → 2: its first change begins
  CR.saw(s4, st, members);
  t.ok(notes().includes('p:0') && notes().includes('i:mirror') && rec4().notes['p:0'].line.en === echo.phases[0].line.en, 'its first change, once begun: the line shown and the new move');
  const mid = noFuture('after its first change');
  t.eq([mid.bad.filter((k) => k !== 'p:0' && k !== 'i:mirror'), ['Plea', 'Kōji', 'コウジ', echo.phases[1].line.en.slice(0, 24)].filter((w) => mid.text.includes(w))], [[], []], 'the second change and the plea\'s answer stay unseen');
  // see through the mirror, answer the plea, settle
  let guard = 0;
  while (!st.over && guard++ < 20) {
    CR.saw(s4, st, members);
    const cs = L.responses(st, ws);
    const k = st.intent.kind;
    const card = k === 'mirror' ? pick('truth')(cs) : k === 'plea' ? pick('answer')(cs) : pick('unravel')(cs);
    const P = L.playerAct(st, card, { ok: true, firstTry: true, mistakes: 0 }, echo);
    CR.saw(s4, st, members, { fx: P.fx, card, answered: P.answered });
    if (L.allSettled(st)) { st.over = 'win'; break; }
    const efx = L.enemyAct(st, P.answered);
    CR.saw(s4, st, members, { fx: efx, enemy: true });
    L.endRound(st, echo);
  }
  t.eq(st.over, 'win', 'the echo settles');
  CR.settle(s4, members, echo);
  t.ok(notes().includes('a:mirror:truth') && notes().includes('a:plea:answer') && notes().includes('p:1'), 'seen through, answered, its last change');
  t.ok(rec4().settled && rec4().maps['rw.mill1'].settle.en === echo.settle.en, 'a settled observation with the line the screen showed');
  const all = JSON.stringify(rec4());
  t.ok(!/"(count|wins|kills|defeats|times|n)"\s*:/.test(all), 'no counts of any kind');
  const mv = CR.moves(rec4()).map((m) => m.kind);
  t.eq(mv.slice(0, 2), ['strike', 'heat'], 'moves grouped in the order first seen');
  // the page wording is the battle's: each move's title from the battle help
  t.ok(RB.ui.wordsPages.moveTitle('heat', s4) === RB.combatHelp.intentInfo({ compId: null, foes: [{ soften: 0 }], cur: 0, diff: L.DIFF.normal, heat: 0, knots: 1, maxKnots: 1, ward: { pc: 0, comp: 0 } }, Object.assign({ key: 'heat', kind: 'heat' }, L.INTENTS.heat), []).title, 'a move is named as the battle help names it');
  // nothing here touches play
  t.eq(learnOf(s4), learnOf(fresh({ comp: null })), 'no learning record touched by the notebook');

  // automated test battles (nothing on screen): met, but no lines kept
  const s5 = fresh();
  RB.test.enable({});
  CR.meet(s5, ['rw.inkblot'], { where: { map: 'rw.mill0' } });
  RB.test.disable();
  t.ok(s5.creatures['rw.inkblot'] && !s5.creatures['rw.inkblot'].maps['rw.mill0'].intro, 'a battle that shows nothing keeps no line as seen');
  // a notebook fault never reaches the battle
  t.ok(CR.saw(null, null, null) == null && CR.meet(null, null).length === 0 && CR.settle(null, null) == null, 'bad input is ignored');

  // =================================================================================================================
  // Japanese labels: valid markup, every word known
  // =================================================================================================================
  const strs = [];
  const walk = (o, p) => { for (const k in o) { const v = o[k]; if (v && typeof v === 'object') walk(v, p + '.' + k); else if (k === 'jp' && v) strs.push([p, v]); } };
  walk(C.wordsText, 'wordsText');
  strs.push(['Atlas place', BM.placeName('atlas.x.y').jp]);
  const bad = [];
  for (const [w, x] of strs) {
    for (const p of RB.jp.validate(x)) bad.push(w + ': ' + (p.msg || JSON.stringify(p)));
    for (const tk of RB.jp.parse(x)) {
      if (tk.punct || tk.ph || !/[぀-ヿ一-鿿]/.test(tk.surface)) continue;
      if (RB.jp.lookup(tk).unknown) bad.push(w + ': unknown word ' + tk.surface);
    }
    if (/[一-鿿]/.test(RB.jp.plain(x)) && !/\{[^|}]+\|[^}]+\}/.test(x)) bad.push(w + ': kanji without a reading');
  }
  t.eq(bad, [], 'every Japanese label of the Words pages is valid, with readings and known words (' + strs.length + ')');
};
