// Shiritori house rules and the shipped word banks (Practice addendum §10, §11,
// §23.4, §26.3): every entry's forms, reading, head/tail, repeat-group and
// eligibility; the three nested banks (sizes, closure, certified starters,
// manifests, frozen snapshots); and the language fixtures — voiced distinctions,
// half-width and decomposed input, small kana, the final long-vowel mark, written
// vowel sequences, ん, alternate readings, homophones, internal punctuation,
// unsupported scripts and unsafe markup. Test-only fixture entries are marked as such.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const SH = RB.shiritori;
  const P = SH.bank('pocket'), E = SH.bank('everyday'), X = SH.bank('extended');
  const banks = [P, E, X];
  const TARGET = { pocket: 72, everyday: 180, extended: 360 };
  const byReading = (b, r) => b.entries.filter((e) => SH.readingsOf(e).indexOf(r) >= 0);
  const edgeOf = (b, r) => b.edges.find((e) => e.reading === r);

  // ---- every shipped entry --------------------------------------------------------------------
  const words = SH.words();
  t.ok(words.length >= 360, words.length + ' entries registered');
  const probs = [], dispBad = [], formBad = [], lexMissing = [], provBad = [];
  const ids = new Set();
  const strip = (jp) => SH.toHira(jp.replace(/\{([^|}]*)\|([^}]*)\}/g, '$2'));
  for (const e of words) {
    if (ids.has(e.id)) probs.push('duplicate ' + e.id);
    ids.add(e.id);
    probs.push(...SH.validateEntry(e, { strict: true }));
    const b = SH.boundary(e.reading);
    if (b.head !== e.head || b.tail !== e.tail) probs.push(e.id + ': authored boundary differs');
    if (RB.jp.validate(e.display.jp).length) dispBad.push(e.id + ' furigana');
    if (strip(e.display.jp) !== e.reading) dispBad.push(e.id + ': display ' + e.display.jp + ' does not spell ' + e.reading);
    if (/[<>&]/.test(e.display.jp + e.display.en)) dispBad.push(e.id + ' markup');
    for (const f of e.forms) if (/[A-Za-z0-9０-９Ａ-Ｚａ-ｚ]/.test(f)) formBad.push(e.id + ': ' + f);
    const lx = e.forms.some((f) => RB.lex.get(f, e.reading) || RB.lex.get(f, f));
    if (!lx) lexMissing.push(e.id);
    if (!/^jmdict:\d+$/.test(e.lookupRef || '') || !e.provenance.some((p) => /JMdict/.test(p.source) && p.reviewed === true)) provBad.push(e.id);
  }
  t.eq(probs, [], 'every entry meets the full §11.2 contract and its authored head/tail equal the house rule');
  t.eq(dispBad, [], 'every display has furigana on each kanji and spells exactly the verified reading; no markup');
  t.eq(formBad, [], 'no approved form uses letters or digits (no number strings or counters)');
  t.eq(lexMissing, [], 'word help knows every bank word (project lexicon or src/content/shiritori/00_lex.js)');
  t.eq(provBad, [], 'every entry names its JMdict reference and was checked against it');
  // every form and reading resolves to its entry in every bank holding it
  const resBad = [];
  for (const b of banks) for (const e of b.entries) {
    for (const f of e.forms.concat(SH.readingsOf(e))) {
      const r = SH.resolve(b, f);
      const m = r.matches.find((x) => x.entry.id === e.id);
      if (!m || !m.edges.length || r.why) resBad.push(b.id + ':' + e.id + ':' + f);
    }
    const ed = b.edges.filter((x) => x.entry === e.id);
    if (ed.some((x) => x.group !== b.groupOf[e.id])) resBad.push(b.id + ':' + e.id + ' group');
  }
  t.eq(resBad, [], 'each approved form and reading resolves to its entry, in its repeat-group, in every bank');
  // eligibility: the banks hold common nouns only
  t.ok(words.every((e) => e.nounKind === 'common' || e.nounKind === 'established-compound'), 'only common nouns and established compounds');

  // ---- the banks ----------------------------------------------------------------------------
  for (const b of banks) {
    t.eq(b.groupCount, TARGET[b.id], b.id + ': ' + b.groupCount + ' distinct repeat-groups (target ' + TARGET[b.id] + ')');
    t.ok(SH.BANDS[b.id].complete && SH.BANDS[b.id].groups === b.groupCount, b.id + ' is recorded as complete');
    t.eq(b.problems, [], b.id + ' builds strictly without problems');
    const safe = b.edges.filter((e) => !e.terminal);
    const dead = safe.filter((e) => !safe.some((x) => x.head === e.tail && x.group !== e.group));
    t.eq(dead.map((e) => e.entry), [], b.id + ': no non-ん word ends on a kana without a safe reply (initial bank)');
    // starters: re-checked here with a plain two-ply search
    const movesFrom = (used, k) => safe.filter((e) => e.head === k && !used.has(e.group));
    const okStarter = (s) => {
      const used = new Set([s.group]);
      const A = movesFrom(used, s.tail);
      if (new Set(A.map((e) => e.group)).size < 4) return false;
      let forced = true;
      for (const a of A) {
        used.add(a.group);
        const B = movesFrom(used, a.tail);
        if (!B.length) return false;
        if (!B.some((r) => { used.add(r.group); const z = !movesFrom(used, r.tail).length; used.delete(r.group); return z; })) forced = false;
        used.delete(a.group);
      }
      return !forced;
    };
    t.ok(b.starters.length >= 12, b.id + ': ' + b.starters.length + ' stored starters (at least 12)');
    t.eq(b.starters.filter((s) => !okStarter(b.edges.find((e) => e.entry === s))), [], b.id + ': every stored starter has ≥4 safe responses and no forced terminal win within two plies');
    t.ok(b.starters.every((s) => !SH.newGame(b, { starter: s }).over), b.id + ': no stored starter ends a game at once');
    // manifest and hash
    const again = SH.buildBank({ id: b.id, version: b.version, entries: b.entries.slice().reverse(), starters: b.starters });
    t.ok(again.hash === b.hash && b.manifest.hash === b.hash && b.manifest.groups.length === b.groupCount && b.manifest.entries.length === b.entries.length && b.manifest.version === 1 && b.manifest.rules === SH.RULES, b.id + ': manifest lists groups and entries with version, rules and a stable content hash');
    // snapshot / thaw
    const snap = JSON.parse(JSON.stringify(SH.snapshot(b)));
    const th = SH.thaw(snap);
    t.ok(th.ok && th.bank.hash === b.hash && th.bank.groupCount === b.groupCount && th.bank.starters.length === b.starters.length, b.id + ': a frozen snapshot thaws to the same bank (' + JSON.stringify(snap).length + ' bytes)');
    const g1 = SH.newGame(b, { starter: b.starters[0] }), g2 = SH.newGame(th.bank, { starter: b.starters[0] });
    t.eq(SH.safeReplies(g2, th.bank).map((e) => e.id), SH.safeReplies(g1, b).map((e) => e.id), b.id + ': and plays identically');
  }
  const snap = JSON.parse(JSON.stringify(SH.snapshot(P)));
  snap.entries[0].r = ['ぬぬぬ'];
  t.eq(SH.thaw(snap).why, 'hash-mismatch', 'a snapshot whose content changed is refused (no silent different bank)');
  const snap2 = JSON.parse(JSON.stringify(SH.snapshot(P))); snap2.rules = 'roadside-0';
  t.eq(SH.thaw(snap2).why, 'rules-changed', 'a snapshot under other rules is refused');
  t.eq(SH.bankProblems, [], 'bank registration reported no problems');
  const sub = (a, b) => a.entries.every((e) => b.entryById[e.id]) && Object.keys(a.groups).every((g) => b.groups[g] && a.groups[g].entries.every((id) => b.groups[g].entries.indexOf(id) >= 0));
  t.ok(sub(P, E) && sub(E, X), 'Pocket ⊆ Everyday ⊆ Extended (entries and repeat-groups)');
  for (const r of ['のり', 'のど']) t.ok(edgeOf(P, r) && !edgeOf(P, r).terminal, 'Pocket has verified ' + r + ' (の is not automatically terminal)');
  const homo = ['はし', 'くも', 'かみ', 'あめ', 'は', 'め', 'はな'].filter((r) => byReading(X, r).length > 1);
  t.ok(homo.length >= 5 && homo.every((r) => new Set(byReading(X, r).map((e) => X.groupOf[e.id])).size === 1), 'homophone senses share one repeat-group (' + homo.join(', ') + ')');

  // ---- §26.3 and §23.4 fixtures -----------------------------------------------------------------
  const st = (b, req) => { const g = SH.newGame(b, { starter: b.starters[0], first: 'pc' }); g.required = req; return g; };
  const neko = SH.resolve(P, 'ねこ').matches[0];
  t.ok(neko && neko.entry.forms.indexOf('猫') >= 0, 'ねこ is an approved Pocket entry with the form 猫');
  let g = st(P, 'ね');
  t.ok(SH.check(g, P, neko.edges[0], 'pc').ok, 'ねこ, approved and unused, is legal under required ね');
  SH.play(g, P, neko.edges[0], 'pc');
  t.ok(g.used[P.groupOf[neko.entry.id]] && g.required === 'こ', 'it consumes the cat repeat-group; next こ');
  g.required = 'ね'; g.next = 'pc';
  t.eq(SH.check(g, P, SH.resolve(P, '猫').matches[0].edges[0], 'pc').why, 'repeat', '猫 after ねこ: an invalid repeated group (the turn is kept)');
  t.eq(SH.resolve(P, 'ﾈｺ').matches.map((m) => m.entry.id), [neko.entry.id], 'half-width ﾈｺ is the same approved reading');
  t.eq(SH.resolve(P, 'ネコ').matches.map((m) => m.entry.id), [neko.entry.id], 'katakana ネコ is the same play');
  const ga = X.edges.find((e) => e.head === 'が' && !e.terminal);
  t.eq(SH.check(st(X, 'か'), X, ga, 'pc').why, 'wrong-head', 'が is not accepted for required か (' + ga.reading + '): no automatic voicing removal');
  t.ok(SH.norm('か') !== SH.norm('が') && SH.norm('は') !== SH.norm('ぱ') && SH.norm('ず') !== SH.norm('す'), 'か/が/ぱ and す/ず stay distinct');
  const tamago = SH.resolve(X, 'たまご').matches[0];
  for (const [txt, label] of [['たまご', 'a decomposed dakuten'], ['たまこ゛', 'a spacing dakuten ゛'], ['ﾀﾏｺﾞ', 'half-width ﾀﾏｺﾞ'], ['　たまご ', 'surrounding full-width/ASCII spaces']]) {
    t.eq(SH.resolve(X, txt).matches.map((m) => m.entry.id), [tamago.entry.id], label + ' normalizes to the verified たまご');
  }
  t.eq(SH.boundary('おもちゃ').tail, 'や', 'おもちゃ passes や');
  const omocha = SH.resolve(X, 'おもちゃ').matches[0];
  if (omocha) {
    t.ok(omocha.entry.forms.indexOf('おもちゃ') >= 0 && omocha.edges[0].tail === 'や', 'the approved おもちゃ keeps its spelling and passes や');
    t.eq(SH.resolve(X, 'おもちや').why, 'outside-bank', 'おもちや (full-size や) is not the same word: small kana are kept inside words');
  } else t.log('おもちゃ is not in the shipped banks; its boundary is checked above');
  t.eq(SH.resolve(X, 'でんしや').matches.length, 0, 'でんしや is not でんしゃ');
  for (const [r, tail] of [['こーひー', 'い'], ['すーぱー', 'あ'], ['るびー', 'い'], ['ぼーる', 'る'], ['じゅーす', 'す'], ['せーたー', 'あ'], ['ぎゅうにゅう', 'う'], ['とけい', 'い'], ['ふうとう', 'う'], ['ぼうし', 'し'], ['ちず', 'ず'], ['でんしゃ', 'や'], ['きんぎょ', 'よ'], ['きっぷ', 'ぷ']]) {
    t.eq(SH.boundary(r).tail, tail, r + ' passes ' + tail + (edgeOf(X, r) ? ' (bank entry)' : ' (rule fixture)'));
  }
  const kh = edgeOf(X, 'こーひー');
  t.ok(kh && kh.tail === 'い' && SH.resolve(X, 'コーヒー').matches.length === 1, 'the approved コーヒー entry passes い');
  t.ok(SH.resolve(X, 'こーひ').why === 'outside-bank' && SH.resolve(X, 'こおひい').why === 'outside-bank', 'the long-vowel mark is not inferred or replaced by vowel letters');
  const chizu = edgeOf(X, 'ちず');
  if (chizu) {
    t.eq(SH.resolve(X, 'ちづ').matches.length, 0, 'ちづ is not ちず: no ず/づ collapse');
    t.ok(X.byHead['ず'] && X.byHead['ず'].some((e) => !e.terminal) && !(X.byHead['す'] || []).some((e) => e.reading === 'ずつう'), 'ちず is answered from ず, never from す');
  }
  // ん
  const mikan = SH.resolve(P, 'みかん').matches[0];
  t.ok(mikan && mikan.edges[0].terminal, 'みかん is an approved word that ends in ん');
  g = st(P, 'み');
  const c = SH.check(g, P, mikan.edges[0], 'pc');
  t.ok(c.ok && c.terminal && !g.over && g.history.length === 1, 'checking みかん only warns (terminal); nothing is committed until Play anyway');
  SH.play(g, P, mikan.edges[0], 'pc');
  t.eq(g.over, { winner: 'cpu', reason: 'terminal-n' }, 'playing it anyway is the player\'s loss, not an attack that makes the other side answer ん');
  t.eq(SH.moves(g), 0, 'a ん commitment is not counted as a chain move');
  // homophones
  const hb = byReading(P, 'はし');
  t.ok(hb.length === 2, 'Pocket has two senses read はし (' + hb.map((e) => e.display.en).join(', ') + ')');
  g = st(P, 'は');
  SH.play(g, P, X.edges.find((e) => e.entry === hb[0].id), 'pc');
  g.required = 'は'; g.next = 'pc';
  t.eq(SH.check(g, P, P.edges.find((e) => e.entry === hb[1].id), 'pc').why, 'repeat', 'はし sense A used, sense B proposed: the same-reading group is unavailable');
  // words outside the bank, names, phrases, scripts and markup
  const outside = X.entries.find((e) => !P.entryById[e.id] && !X.groups[X.groupOf[e.id]].terminal);
  t.eq(SH.resolve(P, SH.readingsOf(outside)[0]).why, 'outside-bank', 'a real word absent from this bank (' + outside.display.en + ') is "outside this match\'s word bank"');
  t.ok(/outside this match's word bank/.test(SH.WHY['outside-bank']) && !/not Japanese/i.test(Object.values(SH.WHY).join(' ')), 'the explanation never calls a word "not Japanese"');
  const mk = SH.resolve(P, '<img src=x onerror=alert(1)>ねこ');
  t.ok(mk.why === 'markup' && !mk.matches.length && mk.display.indexOf('<') < 0, 'injected markup creates no word and is shown escaped');
  t.eq(SH.resolve(P, 'neko').why, 'unsupported-script', 'romaji is not read as a word (no romanised endings)');
  t.eq(SH.resolve(P, 'ｎｅｋｏ').why, 'unsupported-script', 'full-width letters likewise');
  t.eq(SH.resolve(P, '고양이').why, 'unsupported-script', 'another script is unsupported, not an error in Japanese');
  t.eq(SH.resolve(P, 'ナオ').why, 'outside-bank', 'a personal name is never a legal word');
  t.eq(SH.resolve(P, 'ね・こ').why, 'internal-punctuation', 'internal punctuation is not removed to manufacture ねこ');
  t.eq(SH.resolve(P, 'ね こ').why, 'internal-punctuation', 'nor an internal space');
  t.eq(SH.resolve(P, 'ねこ。').why, 'internal-punctuation', 'nor a trailing full stop');
  t.eq(SH.resolve(P, '猫です').why, 'outside-bank', 'a phrase is not stripped down to its noun');
  t.eq(SH.resolve(P, '').why, 'empty', 'an empty draft is just empty');
  // an explicitly approved spelling with internal formatting is accepted (test-only fixture entry)
  const fx = SH.buildBank({ id: '__fx', entries: [
    { id: 'kojo', readings: ['こうじょう', 'こうば'], forms: ['工場'], display: { jp: '{工場|こうじょう}', en: 'factory (test fixture)' }, nounKind: 'common' },
    { id: 'tshirt', reading: 'てぃーしゃつ', forms: ['ティー・シャツ'], display: { jp: 'ティー・シャツ', en: 'T-shirt (test fixture)' }, nounKind: 'common' },
    { id: 'shika', reading: 'しか', forms: ['鹿'], display: { jp: '{鹿|しか}', en: 'deer (test fixture)' }, nounKind: 'common' },
  ] });
  t.eq(fx.problems, [], 'the test-only fixture bank validates');
  t.eq(SH.resolve(fx, 'ティー・シャツ').matches.map((m) => m.entry.id), ['tshirt'], 'internal formatting is accepted only where an explicit spelling variant has it');
  const kj = SH.resolve(fx, '工場').matches[0];
  t.ok(kj.needsReading && kj.edges.length === 2 && kj.edges[0].group === kj.edges[1].group, 'alternate readings of one lemma: the kanji asks which reading, and both readings are one repeat-group');
  let gk = SH.newGame(fx, { starter: 'shika', first: 'pc' }); gk.over = null; gk.required = 'こ'; // the 3-word fixture has no か reply, so the test reopens the turn
  SH.play(gk, fx, kj.edges.find((e) => e.reading === 'こうば'), 'pc');
  t.eq(gk.required, 'ば', 'the chosen reading sets that turn\'s boundary (こうば → ば)');
  gk.required = 'こ'; gk.next = 'pc'; gk.over = null;
  t.eq(SH.check(gk, fx, kj.edges.find((e) => e.reading === 'こうじょう'), 'pc').why, 'repeat', 'and the other reading is then used up too');
  // status and starters
  const g0 = SH.newGame(X, { starter: X.starters[0], first: 'pc' });
  const s0 = SH.status(g0, X);
  t.ok(s0.required === g0.required && s0.next === 'pc' && s0.safeGroups >= 4 && s0.chain === 0, 'status() reports the required kana, the mover and the safe replies');
  const seen = [];
  for (let i = 0; i < X.starters.length; i++) seen.push(SH.pickStarter(X, RB.util.rng(i + 1), seen));
  t.eq(new Set(seen).size, X.starters.length, 'rematches use every certified starter before repeating one');
  t.ok(SH.pickStarter(X, RB.util.rng(9), X.starters) !== X.starters[X.starters.length - 1], 'and never the one just played');
};
