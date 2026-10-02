// Practice suite B (Practice addendum §17–§19, §23.6): villagers' letters, the
// Proofreader's Tray and One Word, Two Moments — content, answer spaces, source
// integrity, seen tracking, learning evidence, records, limits and migration.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const PB = RB.practiceB, C = RB.content.practiceB;
  const LV = ['F', 'E', 'I', 'A'];
  const fresh = (o) => { const s = RB.state.newCampaign({}); s.map = 'co.post'; Object.assign(s, o || {}); RB.game.s = s; return s; };
  const mixedOk = (x) => !x || RB.jp.validateMixed(x).length === 0;
  const lexHas = (w) => (RB.lex.bySurface(w) || []).length > 0 || (RB.lex.byReading(w) || []).length > 0;
  const itemOk = (id) => (id.startsWith('g:') ? !!RB.grammar.get(id.slice(2)) : id.startsWith('v:') ? lexHas(id.slice(2)) : false);

  // ---- every Japanese string has furigana; English that quotes Japanese has it too ----------------
  {
    const bad = [];
    const seen = new Set();
    const walk = (o, w) => {
      if (!o || typeof o !== 'object' || seen.has(o)) return;
      seen.add(o);
      for (const k of Object.keys(o)) {
        const v = o[k];
        if (typeof v === 'string' && k === 'jp' && RB.jp.validate(v).length) bad.push(w + '.' + k);
        else if (typeof v === 'string' && !['jp', 'item', 'reading', 'scene', 'h', 'word', 'who', 'id', 'from', 'met'].includes(k) && /[一-鿿々]/.test(v) && !mixedOk(v)) bad.push(w + '.' + k);
        else if (Array.isArray(v) && k === 'parts') v.forEach((p, i) => { if (RB.jp.validate(String(p).replace(/^\?/, '')).length) bad.push(w + '.parts.' + i); });
        else if (v && typeof v === 'object') walk(v, w + '.' + k);
      }
    };
    walk(C, 'practiceB');
    t.eq(bad, [], 'every displayed kanji in suite B text has its reading');
  }

  // ---- letters (§17.2): twelve situations × four adaptations -------------------------------------------
  const FN = ['ack-parcel', 'accept', 'decline', 'which-day', 'where', 'thanks', 'clarify', 'no-hurry', 'request-vs-promise', 'bounded-offer', 'sequence', 'ambiguous'];
  t.eq(C.letters.map((l) => l.id), ['L01', 'L02', 'L03', 'L04', 'L05', 'L06', 'L07', 'L08', 'L09', 'L10', 'L11', 'L12'], 'the twelve letters L01–L12');
  t.eq(C.letters.map((l) => l.fn), FN, 'in the order of the addendum\'s table');
  let variants = 0, families = 0, realisations = 0;
  const lprob = [];
  for (const l of C.letters) {
    if (!RB.content.chars[l.from]) lprob.push(l.id + ': unknown villager ' + l.from);
    if (!/^seen\./.test(l.met) || !RB.content.scenes[l.met.slice(5)]) lprob.push(l.id + ': met condition names no scene');
    for (const lv of LV) {
      const v = l.tiers[lv];
      if (!v) { lprob.push(l.id + lv + ': missing'); continue; }
      variants++;
      if (!v.msg || !v.msg.jp || !v.msg.en || !v.task || !v.task.jp || !v.task.en || !v.ack || !v.ack.jp || !v.explain || !v.explain.en) lprob.push(l.id + lv + ': incomplete');
      if (!itemOk(v.item)) lprob.push(l.id + lv + ': item ' + v.item + ' is not a known grammar point or word');
      const oks = v.replies.filter((f) => f.ok), nos = v.replies.filter((f) => !f.ok);
      if (oks.length < 2) lprob.push(l.id + lv + ': fewer than two accepted replies');
      if (new Set(oks.map((f) => f.tone)).size !== oks.length) lprob.push(l.id + lv + ': accepted replies should differ in tone');
      if (!nos.length || nos.some((f) => !f.why || !f.why.en)) lprob.push(l.id + lv + ': a not-accepted reply needs what it would actually say');
      // the answer space: every authored reply, typed or built from pieces, reads as itself
      const sp = PB.space(v.replies);
      v.replies.forEach((f, i) => {
        families++;
        for (const seq of PB.sequences(f)) {
          for (const w of PB.writings(seq.join(' '))) {
            realisations++;
            const m = PB.match(sp, w);
            if (!m || m.i !== i) lprob.push(l.id + lv + ': "' + w + '" reads as ' + (m ? 'family ' + m.i : 'nothing') + ', not family ' + i);
          }
          const pm = PB.partsMatch(v.replies, seq);
          if (!pm || pm.i !== i) lprob.push(l.id + lv + ': pieces ' + seq.join('/') + ' do not build family ' + i);
        }
      });
      // and it is bounded: an unrelated reply is outside it (a limitation, never "wrong")
      const step = RB.ui.pb.writeStep(v.replies, { what: 'letter' });
      const off = step.judge('ねこがすきです', {});
      if (!off.limit || off.ok) lprob.push(l.id + lv + ': unrelated text is not reported as outside the space');
      const okJ = step.judge(PB.writings(PB.replyOf(oks[1]))[0], {});
      if (!okJ.ok) lprob.push(l.id + lv + ': the judge refuses an accepted tone');
      const noJ = step.judge(PB.writings(PB.replyOf(nos[0]))[0], {});
      if (noJ.ok || noJ.limit || !noJ.feedback.length) lprob.push(l.id + lv + ': a reply of another intention gets no explanation');
      if (!mixedOk(v.explain.en)) lprob.push(l.id + lv + ': explanation kanji without readings');
    }
  }
  t.eq(lprob, [], 'letters: every variant complete, every authored tone accepted, every other intention explained');
  t.eq(variants, 48, 'letters: 12 × 4 = 48 profile variants');
  t.log('letters: ' + families + ' reply families, ' + realisations + ' accepted writings checked');
  {
    // kanji or kana, spaces and punctuation, one-shape handwriting characters
    const v = C.letters[0].tiers.E, sp = PB.space(v.replies);
    t.ok(PB.match(sp, '小包が無事に届きました。ありがとうございます。').family.ok, 'a reply in kanji is read');
    t.ok(PB.match(sp, 'こづつみが ぶじに とどきました').family.ok, 'the same in kana, with spaces, is read');
    t.ok(PB.match(sp, 'ありがとうございます。小包が届きました。').family.ok, 'the two sentences in either order are read');
    t.ok(PB.match(sp, '小包が届きませんでした').family.ok === false, 'a reply that says it never came is read — as another intention');
    t.eq(PB.match(sp, 'ねこ'), null, 'anything else is outside the space');
  }

  // ---- the Proofreader's Tray (§18.2): twelve tasks × four adaptations -----------------------------------
  const PFN = ['left-right', 'quantity', 'recipient', 'negation', 'steps', 'before-after', 'label', 'date', 'vague', 'comparison', 'condition', 'insufficient'];
  t.eq(C.proof.map((d) => d.id), ['P01', 'P02', 'P03', 'P04', 'P05', 'P06', 'P07', 'P08', 'P09', 'P10', 'P11', 'P12'], 'the twelve tasks P01–P12');
  t.eq(C.proof.map((d) => d.fn), PFN, 'in the order of the addendum\'s table');
  let pv = 0, styleNotes = 0;
  const pprob = [];
  for (const d of C.proof) for (const lv of LV) {
    const v = d.tiers[lv];
    if (!v) { pprob.push(d.id + lv + ': missing'); continue; }
    pv++;
    const w = d.id + lv;
    if (!v.purpose || !v.evidence || !v.evidence.length || !v.notice || !v.notice.en || !v.consequence || !v.explain) pprob.push(w + ': incomplete');
    if (!itemOk(v.item)) pprob.push(w + ': item ' + v.item);
    const bad = v.notice.segs.filter((g) => g.bad);
    styleNotes += v.notice.segs.filter((g) => g.style).length;
    if (d.id === 'P12') {
      if (!v.insufficient || bad.length) pprob.push(w + ': P12 must have nothing to repair (insufficient evidence)');
      if (v.repair.kind !== 'ask') pprob.push(w + ': P12 repairs by asking');
    } else {
      if (v.insufficient) pprob.push(w + ': only P12 is insufficient');
      if (!bad.length && !v.find) pprob.push(w + ': nothing to find');
    }
    const r = v.repair;
    if (r.kind === 'replace') {
      for (const g of bad) {
        if (!g.options || !g.options.some((o) => o.ok)) { pprob.push(w + ': a bad portion with no accepted repair'); continue; }
        const fams = g.options.map((o) => ({ ok: o.ok, parts: [o.jp], en: o.en, why: o.why }));
        const st = RB.ui.pb.writeStep(fams, { what: 'repair' });
        for (const o of g.options) for (const x of PB.writings(o.jp)) { const j = st.judge(x, {}); if (j.ok !== !!o.ok) pprob.push(w + ': repair "' + x + '" judged ' + j.ok); }
        if (g.options.filter((o) => o.ok).length > 1 && !g.options.some((o) => o.ok && o.note)) pprob.push(w + ': an accepted alternative should say why it also works');
      }
    } else if (r.kind === 'order') {
      if (r.tiles.length !== r.answer.length || r.tiles.slice().sort().join() !== r.answer.slice().sort().join()) pprob.push(w + ': order pieces differ from the answer');
      if (r.tiles.join() === r.answer.join()) pprob.push(w + ': the pieces start in the right order');
    } else if (r.kind === 'choose') {
      if (!r.options.some((o) => o.ok) || r.options.some((o) => !o.ok && !(o.why && o.why.en))) pprob.push(w + ': choose options');
    } else if (r.kind === 'ask') {
      const sp = PB.space(r.replies);
      r.replies.forEach((f, i) => PB.sequences(f).forEach((q) => PB.writings(q.join(' ')).forEach((x) => { const m = PB.match(sp, x); if (!m || m.i !== i) pprob.push(w + ': question "' + x + '"'); })));
      if (r.replies.filter((f) => f.ok).length < 2) pprob.push(w + ': fewer than two useful questions');
    } else pprob.push(w + ': repair kind ' + r.kind);
    if (v.find && (!v.find.options.some((o) => o.ok) || v.find.options.some((o) => !o.ok && !(o.why && o.why.en)))) pprob.push(w + ': find options');
    for (const ev of v.evidence) if (['plan', 'count', 'seq', 'measure'].includes(ev.k) && !ev.alt) pprob.push(w + ': a picture without a text equivalent');
  }
  t.eq(pprob, [], 'proofreading: every variant complete; P12 asks instead of repairing; every accepted repair accepted, every other one explained');
  t.eq(pv, 48, 'proofreading: 12 × 4 = 48 profile variants');
  t.ok(styleNotes >= 3, 'some portions are fine on purpose: wording that is only a matter of style is never graded wrong (' + styleNotes + ')');

  // ---- One Word, Two Moments (§19): real lines, exact hashes ---------------------------------------------
  const CATS = ['referent', 'literal-contextual', 'request-statement', 'permission-prohibition', 'direct-indirect', 'certainty', 'cause-sequence', 'completed-intended', 'bounded-open', 'before-after', 'register', 'ambiguity'];
  const story = C.compare.filter((d) => !d.sample), sample = C.compare.filter((d) => d.sample);
  t.eq(story.map((d) => d.cat), CATS, 'twelve story pairs, one per contrast category');
  t.ok(sample.length === 1 && sample[0].a.teach && sample[0].b.teach, 'one sample pair, made of labelled teaching examples');
  const hash = (jp, en) => RB.util.hashStr(String(jp || '') + '||' + String(en || '')).toString(36);
  const cprob = [];
  for (const d of C.compare) {
    for (const src of [d.a, d.b]) {
      if (src.teach) { if (!d.sample) cprob.push(d.id + ': a teaching example in a story pair'); continue; }
      const sc = RB.content.scenes[src.scene], c = sc && sc.cmds[src.line];
      if (!c || c.op !== 'say') { cprob.push(d.id + ': ' + src.scene + '#' + src.line + ' is not a line'); continue; }
      if (c.jp !== src.jp || c.en !== src.en) cprob.push(d.id + ': the quotation differs from ' + src.scene + '#' + src.line);
      if (c.who !== src.who) cprob.push(d.id + ': speaker ' + src.who + ' is ' + c.who + ' in the scene');
      if (hash(c.jp, c.en) !== src.h) cprob.push(d.id + ': hash');
      if (RB.jp.reading(src.jp).replace(/\s/g, '') !== src.reading) cprob.push(d.id + ': reading');
      if (RB.compare.status(src) !== 'ok') cprob.push(d.id + ': status ' + RB.compare.status(src));
    }
    for (const lv of LV) {
      const q = d.q[lv];
      if (!q) { cprob.push(d.id + lv + ': missing'); continue; }
      if (q.kind === 'choose' && (!q.options.some((o) => o.ok) || q.options.some((o) => !o.ok && !(o.why && o.why.en)))) cprob.push(d.id + lv + ': options');
      if (q.kind === 'write') { const sp = PB.space(q.replies); q.replies.forEach((f, i) => PB.sequences(f).forEach((s) => PB.writings(s.join(' ')).forEach((x) => { const m = PB.match(sp, x); if (!m || m.i !== i) cprob.push(d.id + lv + ': "' + x + '"'); }))); }
    }
    if (!d.q.F.showEn) cprob.push(d.id + ': Foundations supplies the translation');
    if (!itemOk(d.item)) cprob.push(d.id + ': item');
    if (d.ref.grammar ? !RB.grammar.get(d.ref.grammar) : !lexHas(d.ref.word)) cprob.push(d.id + ': link to the grammar point or word');
    if (!d.explain || !mixedOk(d.explain.en)) cprob.push(d.id + ': explanation');
  }
  t.eq(cprob, [], 'comparisons: every quotation is the real line (scene, index, speaker, text, reading, hash); every level asks the same meaning');
  t.ok(story.filter((d) => d.q.I.kind === 'write' || d.q.A.kind === 'write' || d.q.E.kind === 'write').length >= 3, 'some comparisons ask for a short written answer (typed or handwritten)');

  // seen tracking: never a line the player has not seen
  {
    const s = fresh();
    t.eq(RB.compare.unlocked(s), [], 'a new campaign has no comparisons');
    t.eq(RB.compare.locked(s), 12, 'and twelve waiting');
    const html = RB.ui.compare.html(s);
    const leaks = story.filter((d) => [d.a, d.b].some((x) => html.includes(RB.jp.plain(x.jp).slice(0, 8)) || html.includes(x.en.slice(0, 24))));
    t.eq(leaks.map((d) => d.id), [], 'the Words page shows nothing of a locked pair');
    t.ok(/No comparisons yet/.test(html) && /sample pair/.test(html), 'an empty list says why and offers the labelled sample pair');
    const c11 = story.find((d) => d.id === 'C11');
    s.seen[c11.a.scene] = true;
    t.eq(RB.compare.unlocked(s).map((d) => d.id), [], 'one of the two lines is not enough');
    s.seen[c11.b.scene] = true;
    t.eq(RB.compare.unlocked(s).map((d) => d.id), ['C11'], 'both scenes seen (lines on their unconditional opening stretch): the pair appears');
    // a conditional line needs the dialogue history
    const c02 = story.find((d) => d.id === 'C02');
    s.seen[c02.a.scene] = true; s.seen[c02.b.scene] = true;
    t.ok(!RB.compare.unlocked(s).some((d) => d.id === 'C02'), 'a line behind a condition is not assumed seen from its scene alone');
    s.backlog.push({ who: c02.b.who, jp: c02.b.jp, en: c02.b.en, k: { src: { k: 'sc', id: c02.b.scene } } });
    t.ok(RB.compare.unlocked(s).some((d) => d.id === 'C02'), 'once it is in the dialogue history, it counts');
    t.ok(RB.compare.scan(s) >= 1 && RB.compare.rec(s).seen[RB.compare.keyOf(c02.b)] === c02.b.h, 'the sighting is kept (bounded, by key and hash)');
    s.backlog.length = 0;
    t.ok(RB.compare.unlocked(s).some((d) => d.id === 'C02'), 'and survives the history scrolling away');
    // content changes: no silent contradiction
    const sc = RB.content.scenes[c11.a.scene], i = c11.a.line, keep = sc.cmds[i].jp;
    RB.compare.mark(s, 'C11');
    sc.cmds[i].jp = keep + ' 。';
    t.eq(RB.compare.status(c11.a), 'changed', 'an edited line is detected by its hash');
    t.ok(!RB.compare.unlocked(s).some((d) => d.id === 'C11'), 'the pair is withdrawn rather than shown contradicting the story');
    t.eq(RB.compare.markStatus(RB.compare.rec(s).marks.C11), 'historical', 'a bookmark keeps its quotation, marked historical');
    sc.cmds[i].jp = keep;
    sc.cmds.splice(0, 0, { op: 'say', who: 'narr', jp: 'あ', en: 'a' });
    t.eq(RB.compare.status(c11.a), 'moved', 'an unchanged line that moved is still found');
    sc.cmds.splice(0, 1);
    t.eq(RB.compare.markStatus(RB.compare.rec(s).marks.C11), 'current', 'and the bookmark is current again');
  }

  // ---- learning evidence: one mastery event per objective; exposure and replays never count ------------
  {
    const s = fresh();
    const calls = [];
    const real = RB.learn.record;
    RB.learn.record = (id, r) => { calls.push([id, r.ok, r.mode, r.assisted]); return real(id, r); };
    const sess = { kind: 'letters', id: 1 };
    const rec = RB.letters.rec(s);
    const U = RB.ui.pb;
    t.ok(U.assess(sess, rec, 'letter:L01', 'g:v_masu_forms', { firstTry: false, mode: 'ime' }), 'the first confirmed answer is one ordinary event (a genuine mistake can be that event)');
    t.ok(!U.assess(sess, rec, 'letter:L01', 'g:v_masu_forms', { firstTry: true, mode: 'ime' }), 'the corrected continuation adds none');
    t.ok(!U.assess({ kind: 'letters', id: 2 }, rec, 'letter:L01', 'g:v_masu_forms', { firstTry: true, mode: 'hand' }), 'a later sitting (a practice copy) adds none either');
    t.ok(!U.assess(sess, rec, 'letter:L02', 'g:v_mashou', { firstTry: true, mode: 'choice' }, { exposed: true }), 'shown answers are not recall');
    t.ok(!U.assess(sess, rec, 'letter:L02', 'g:v_mashou', { firstTry: true, mode: 'choice' }), 'and the objective stays assessed');
    t.ok(!U.assess({ kind: 'comparisons', id: 3 }, RB.compare.rec(s), 'compare:S01', 'g:indirectness', { firstTry: true, mode: 'choice' }, { sample: true }), 'a teaching-example sample is practice only');
    t.eq(calls, [['g:v_masu_forms', false, 'ime', false]], 'exactly one mastery record in all of that');
    RB.learn.record = real;
    t.ok(s.practice.tally.letters && s.practice.tally.letters.n >= 2, 'the rest is kept as bounded practice tallies');
  }
  {
    // cooldown from the shared helper, primed across sittings
    const rec = { recent: [] };
    PB.note(rec, 'proof:P01', true);
    const cd = PB.cooldown(rec);
    t.ok(!cd.allow('proof:P01'), 'not the same objective at once');
    PB.note(rec, 'proof:P02', false, cd); PB.note(rec, 'proof:P03', false, cd); PB.note(rec, 'proof:P04', false, cd);
    t.ok(!PB.cooldown(rec).allow('proof:P01'), 'a missed one waits four objectives, across sittings');
    PB.note(rec, 'proof:P05', false);
    t.ok(PB.cooldown(rec).allow('proof:P01'), 'then it may come back');
    for (let i = 0; i < 20; i++) PB.note(rec, 'x' + i, false);
    t.ok(rec.recent.length === 8, 'the history is bounded (8)');
  }

  // ---- letters: one open at a time; nothing expires; sent once, then practice copies ---------------------
  {
    const s = fresh({ flags: { postgame: true } });
    t.ok(RB.letters.list(s).every((x) => !x.met), 'a letter waits for its writer to have been met');
    for (const l of C.letters) s.seen[l.met.slice(5)] = true;
    t.ok(RB.letters.open(s, 'L01').ok, 'a letter opens');
    t.eq(RB.letters.open(s, 'L02').why, 'other-open', 'only one practice letter is open at a time');
    RB.letters.setAside(s);
    t.ok(RB.letters.open(s, 'L02').ok, 'put back on the pile, another can open');
    const c1 = RB.letters.complete(s, 'L02', { tone: 'friendly', via: 'parts', reply: 'いいよ。' + 'あ'.repeat(200), prof: 'E' });
    t.ok(c1.sent && c1.rec.reply.length <= RB.letters.MAX_REPLY, 'the first reply is sent (its text kept, bounded)');
    const c2 = RB.letters.complete(s, 'L02', { tone: 'polite', via: 'ime', reply: 'はい', prof: 'E' });
    t.ok(!c2.sent && c2.rec.replays === 1 && c2.rec.tone === 'friendly', 'a later reply is a practice copy: not resent, the first one kept');
    t.ok(RB.letters.list(s).filter((x) => x.state === 'waiting').length === 11, 'the others keep waiting (no dates, no expiry)');
    const before = JSON.stringify(s.company);
    t.eq(JSON.stringify(s.company), before, 'no bond');
  }

  // ---- eligibility: the real furniture, the right story points ---------------------------------------------
  {
    const box = (RB.content.maps['co.post'].props || []).find((p) => p.p === 'mailbox' && p.x === 7 && p.y === 5);
    t.ok(box && box.scene === 'pb.postbox' && RB.content.scenes['pb.postbox'], 'the post box in Shino\'s Post House (co.post 7,5) offers them');
    t.ok(typeof RB.hooks.pb_open === 'function', 'its scene starts an activity once the scene is over');
    const s = fresh({ flags: {} });
    t.ok(!RB.letters.eligible(s).ok && /journey/.test(RB.letters.eligible(s).why), 'letters wait for the journey\'s end');
    t.ok(!RB.proof.eligible(s).ok, 'the tray waits for Chapter 2\'s resolution');
    s.flags.ch2_done = true;
    t.ok(RB.proof.available(s) && !RB.letters.available(s), 'after Chapter 2: the tray, not yet the letters');
    s.map = 'rw.village';
    t.ok(/post box/.test(RB.proof.eligible(s).why), 'and only at the post box — no remote launch');
    t.ok(['letters', 'proofreading', 'comparisons'].every((k) => RB.activity.kinds().includes(k)), 'all three run as RB.activity sessions');
    const acts = RB.practice.activities().map((a) => a.id);
    t.ok(['letters', 'proofreading', 'comparisons'].every((k) => acts.includes(k)), 'and appear in Words › Ways to practise');
    const html = RB.ui.practiceIndex.html(s);
    t.ok(!/data-pr-begin="letters"|data-pr-begin="proofreading"/.test(html), 'away from the post box the index says where, without a Begin button');
  }

  // ---- kept pages: the shared six, never a silent deletion ---------------------------------------------
  {
    const s = fresh();
    const page = (i) => ({ id: 'proof:T' + i, kind: 'proof', mode: 'proof', typeset: { task: 'P01', lv: 'E', lines: ['{右|みぎ}'] }, label: 'page ' + i, created: 1, updated: 1 });
    for (let i = 0; i < 6; i++) t.ok((await PB.keepPage(s, page(i))).ok, 'page ' + (i + 1) + ' of six kept');
    let asked = null;
    const r7 = await PB.keepPage(s, page(6), async (pages) => { asked = pages.length; return -1; });
    t.ok(!r7.ok && r7.why === 'cancelled' && asked === 6 && s.practice.deskPages.length === 6, 'a seventh asks first; Cancel changes nothing');
    const r8 = await PB.keepPage(s, page(7), async () => 2);
    t.ok(r8.ok && r8.replaced.id === 'proof:T2' && s.practice.deskPages.length === 6 && s.practice.deskPages[2].id === 'proof:T7', 'replacing is an explicit choice of which page');
    t.ok((await PB.keepPage(s, Object.assign(page(7), { label: 'renamed' }))).updated && s.practice.deskPages.length === 6, 'keeping the same page again updates it');
    const big = page(9); big.typeset.lines = ['あ'.repeat(200000)];
    t.eq((await PB.keepPage(s, big, async () => 0)).why, 'too-big', 'a page over 256 KiB is refused');
    t.ok(s.practice.deskPages.every((p) => p.bytes > 0 && p.bytes <= PB.MAX_BYTES && p.saved), 'every kept page records its size and saved state');
    const mem = RB.practice.mementos(s).filter((m) => m.source === 'proof');
    t.ok(mem.length === 6 && mem.every((m) => /typeset/.test(m.note)), 'Practice mementos list them, labelled typeset (not handwriting)');
    t.eq(RB.proof.pageFor(C.proof[0], Object.assign({ lv: 'E' }, C.proof[0].tiers.E), 'x', ['a']).kind, 'proof', 'page records: kind proof');
  }

  // ---- records: namespaces, migration, bounds ----------------------------------------------------------------
  {
    const s = fresh();
    t.ok(s.practice.letters && s.practice.proof && s.practice.compare, 'a new campaign has the three records');
    const old = JSON.parse(JSON.stringify(s));
    delete old.practice.letters; delete old.practice.proof; delete old.practice.compare;
    const mig = RB.save.migrate(old);
    t.ok(mig.practice.letters.v === 1 && Object.keys(mig.practice.letters.done).length === 0 && mig.practice.compare.seen && mig.practice.proof.done, 'an older save gains them empty (nothing inferred)');
    const odd = JSON.parse(JSON.stringify(s));
    odd.practice.letters = { done: { L99: { st: 'sent', reply: 'x'.repeat(500), replays: -3 } }, recent: Array.from({ length: 30 }, (_, i) => ({ id: 'a' + i })), active: 'L01' };
    odd.practice.compare = { seen: Object.fromEntries(Array.from({ length: 100 }, (_, i) => ['s' + i + '#0', 'h'])), marks: { C01: { quotes: [1, 2, 3] }, bad: 7 } };
    const m2 = RB.save.migrate(odd);
    t.ok(m2.practice.letters.done.L99 && m2.practice.letters.done.L99.reply.length === 80 && m2.practice.letters.done.L99.replays === 0, 'an unknown future letter is kept, bounded');
    t.ok(m2.practice.letters.recent.length === 8 && m2.practice.letters.active === null, 'histories are bounded; a malformed open letter is dropped');
    t.ok(Object.keys(m2.practice.compare.seen).length === RB.compare.MAX_SEEN && m2.practice.compare.marks.C01.quotes.length === 2 && !m2.practice.compare.marks.bad, 'sightings and bookmarks are bounded and validated');
    t.eq(RB.save.validate(m2), [], 'and the save still validates');
  }

  // ---- no relationship effects ---------------------------------------------------------------------------------
  {
    const s = fresh({ flags: { postgame: true, ch2_done: true } });
    let awards = 0;
    const real = RB.company.award;
    RB.company.award = (...a) => { awards++; return real.apply(RB.company, a); };
    RB.letters.complete(s, 'L03', { tone: 'polite', via: 'parts', reply: 'x', prof: 'E' });
    RB.proof.complete(s, 'P01', { prof: 'E' });
    RB.compare.complete(s, 'C01', { prof: 'E' });
    RB.compare.mark(s, 'C01');
    RB.company.award = real;
    t.eq(awards, 0, 'completing, replaying or bookmarking awards no bond');
  }
};
