// The kana lesson before the Chronicle Hall's two puzzles, not at their dramatic moment (Agnes 6543444529; Local CL-549,
// CL-550, CL-553; Cloud CC-397; Robin's approval of D, Agnes 6544426511, 6544575390): the curriculum's next row
// (up to 20 or 33 pages) came in the middle of the chronicle's reading and of the records laid out with Tokiwa. Now
// the same lesson, unchanged, comes first in each scene's own guarded path, after a short calm beat shown on the
// Foundations profile only. On the real runner, the lesson in its automated form (RB.test: the row is taught, no pages;
// tests/e2e/lesson_pacing.mjs shows the pages), every line, lesson and challenge recorded in order:
//  1. first delivery (Foundations, the hiragana dakuten row next): the chronicle's beat, then the lesson (the 20
//     kana), then Tokiwa's first line and the rest, then the challenge; the records' beat, then the next row (the 5
//     handakuten), then the books laid out and Tokiwa, then the challenge;
//  2. a revisit after "later": one lesson at each visit, the next row each time, as before;
//  3. a row already partly taught: only its untaught kana;
//  4. untouched paths: the chronicle reread, its casual look, the records done or too early: no beat, no lesson;
//  5. the chronicle reached from its casual look (the third clue found at the desk): the beat and one lesson;
//  6. another profile: no beat and no lesson, and the scene's lines as before; Foundations knowing both kana sets, or
//     with every row taught: the beat and no lesson; Foundations knowing hiragana only: a lesson still comes;
//  7. no other way to either puzzle: only the desk and the reading table start them, and nothing Tokiwa says runs them;
//  8. and no scene ended on an error from the runner.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state, LS = RB.lessons;
  const flat = (x) => JSON.stringify(x);

  // the runner, with the screen stood in for: what is said, which lesson rows are taught, which challenge runs
  let log = [], res = true;
  RB.ui.dialogue.say = async (o) => { log.push('say:' + (o && o.en)); };
  RB.ui.dialogue.choose = async () => 0;
  RB.ui.dialogue.hide = () => {};
  RB.ui.toast = async () => {};
  RB.ui.shake = () => {};
  RB.ui.fade = async () => {};
  RB.challenge.run = async (id) => { log.push('challenge:' + id); return { ok: res }; };
  for (const k of ['dismissExtras', 'refreshActors']) RB.world[k] = () => {};
  RB.game.afterScene = () => {};
  RB.save.autosave = async () => {};
  RB.test.enable({});
  const lesson = LS.run;
  LS.run = async (which, args) => {
    const s = RB.game.s, before = new Set(Object.keys(s.learn.taught || {}));
    await lesson(which, args);
    const now = Object.keys(s.learn.taught || {}).filter((ch) => !before.has(ch));
    if (now.length) log.push('lesson:' + now.length);
  };

  const G = LS.groups(), row = (id) => G.findIndex((g) => g.id === id);
  const DAKU = row('h_dakuten');
  // a Foundations journey in the Chronicle Hall, every row before `upto` taught
  const camp = (o = {}) => {
    const s = S.newCampaign({ edition: 2 }); s.comp = 'nao'; s.map = 'co.hall'; s.x = 6; s.y = 7;
    Object.assign(s.flags, { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, co_met_sayo: true }, o.flags || {});
    s.learn.profile = o.profile || 'F'; s.learn.kanaKnown = o.known || 'none'; s.learn.taught = {};
    const upto = o.upto == null ? DAKU : o.upto;
    for (let i = 0; i < upto; i++) for (const c of LS.groupChars(G[i])) s.learn.taught[c.ch] = true;
    for (const ch of o.extra || []) s.learn.taught[ch] = true;
    if (o.stage != null) s.quests.co_main = { stage: o.stage, done: false, t: 1 };
    RB.game.G.s = s; RB.game.s = s;
    return s;
  };
  const errors = [];
  const run = async (scene) => {
    log = [];
    try { await RB.script.run(scene, {}); } catch (e) { errors.push(scene + ': ' + String(e && e.message || e)); }
    return log.slice();
  };
  const BEAT_CH = 'say:Before you read, you take a breath.';
  const BEAT_RE = 'say:Before you lay the books out, you take a breath.';
  const TOKIWA_CH = /^say:The chronicle\. From the founding/, BOOKS = /^say:On the reading table/, FAIRLY = /^say:…Let us look\. Fairly\./;
  const at = (l, re) => l.findIndex((x) => (re instanceof RegExp ? re.test(x) : x === re));
  const lessons = (l) => l.filter((x) => x.startsWith('lesson:'));

  // ---- 1. first delivery
  {
    const s = camp({ flags: { co_suspect: true } });
    const l = await run('co.chronicle');
    const order = [at(l, BEAT_CH), at(l, 'lesson:20'), at(l, TOKIWA_CH), at(l, 'challenge:co.c_chronicle')];
    t.ok(order.every((x) => x >= 0) && order.every((x, i) => !i || x > order[i - 1]) && lessons(l).length === 1 && s.flags.co_chronicle_read,
      '1 the chronicle: the beat, then the lesson (the 20 dakuten), then Tokiwa\'s first line, then the challenge (' + flat({ order, lessons: lessons(l) }) + ')');
    s.quests.co_main = { stage: 4, done: false, t: 1 };
    const r = await run('co.hall_reading');
    const ro = [at(r, BEAT_RE), at(r, 'lesson:5'), at(r, BOOKS), at(r, FAIRLY), at(r, 'challenge:co.c_records')];
    t.ok(ro.every((x) => x >= 0) && ro.every((x, i) => !i || x > ro[i - 1]) && lessons(r).length === 1,
      '1 the records: the beat, then the next row (the 5 handakuten), then the books laid out and Tokiwa, then the challenge (' + flat({ ro, lessons: lessons(r) }) + ')');
  }
  // ---- 2. a revisit after "later": one lesson at each visit, the next row each time
  {
    camp({ flags: { co_suspect: true } });
    res = false;
    const a = await run('co.chronicle');
    const b = await run('co.chronicle');
    res = true;
    const c = await run('co.chronicle');
    t.eq([lessons(a), lessons(b), lessons(c), at(a, 'say:You close the book. You can come back to it.') >= 0], [['lesson:20'], ['lesson:5'], ['lesson:33'], true],
      '2 put off and revisited: one lesson at each visit, the next row each time (20, then 5, then 33), as before');
  }
  // ---- 3. a row already partly taught
  {
    camp({ flags: { co_suspect: true }, extra: ['が', 'ぎ', 'じ'] });
    const l = await run('co.chronicle');
    t.eq(lessons(l), ['lesson:17'], '3 three of the row taught already: only its 17 untaught kana');
  }
  // ---- 4. untouched paths
  {
    camp({ flags: { co_suspect: true, co_chronicle_read: true } });
    const reread = await run('co.chronicle');
    camp({ flags: {} });
    const casual = await run('co.chronicle');
    camp({ flags: { co_records_done: true }, stage: 5 });
    const done = await run('co.hall_reading');
    camp({ stage: 3 });
    const early = await run('co.hall_reading');
    const none = (l) => !lessons(l).length && at(l, BEAT_CH) < 0 && at(l, BEAT_RE) < 0;
    t.ok([reread, casual, done, early].every(none), '4 the chronicle reread or only looked at, the records done or too early: no beat and no lesson (' + flat({ reread: lessons(reread), casual: lessons(casual), done: lessons(done), early: lessons(early) }) + ')');
  }
  // ---- 5. from the casual look to the main reading (the third clue found at the desk)
  {
    const s = camp({ flags: {} });
    s.vars.co_clues = 2;
    const l = await run('co.chronicle');
    t.ok(s.flags.co_suspect && at(l, BEAT_CH) >= 0 && flat(lessons(l)) === flat(['lesson:20']) && at(l, BEAT_CH) < at(l, 'lesson:20') && at(l, 'lesson:20') < at(l, TOKIWA_CH),
      '5 from the casual look, the third clue at the desk: the beat and one lesson, before Tokiwa (' + flat({ suspect: !!s.flags.co_suspect, lessons: lessons(l) }) + ')');
  }
  // ---- 6. other profiles; Foundations with nothing left to teach; hiragana only
  {
    const lines = async (o) => { camp(Object.assign({ flags: { co_suspect: true } }, o)); return run('co.chronicle'); };
    const other = await lines({ profile: 'I' });
    const both = await lines({ known: 'both' });
    const all = await lines({ upto: G.length });
    const hira = await lines({ known: 'hira', upto: row('k_a') });
    const plain = (l) => l.filter((x) => x !== BEAT_CH && !x.startsWith('lesson:'));
    t.ok(!lessons(other).length && at(other, BEAT_CH) < 0 && at(other, TOKIWA_CH) >= 0 && at(other, 'challenge:co.c_chronicle') > at(other, TOKIWA_CH),
      '6 another profile: no beat, no lesson; Tokiwa, then the challenge (' + flat(other.slice(0, 3)) + ')');
    t.ok([both, all].every((l) => at(l, BEAT_CH) === 0 && !lessons(l).length) && flat(plain(both)) === flat(plain(other)) && flat(plain(all)) === flat(plain(other)),
      '6 Foundations knowing both sets, or every row taught: the beat, no lesson, and otherwise the same lines (' + flat({ both: both.slice(0, 2), all: all.slice(0, 2) }) + ')');
    t.ok(at(hira, BEAT_CH) === 0 && flat(lessons(hira)) === flat(['lesson:5']), '6 Foundations knowing hiragana only: a lesson still comes (katakana\'s first row) (' + flat(lessons(hira)) + ')');
  }
  // ---- 7. no other way to either puzzle
  {
    const reaches = (id, want, seen = new Set()) => {
      if (seen.has(id)) return false; seen.add(id);
      const sc = C.scenes[id];
      return !!sc && (sc.cmds || []).some((c) => (c.op === 'challenge' && c.args[0] === want) || (c.op === 'call' && reaches(c.args[0], want, seen)));
    };
    const starts = [];
    for (const m in C.maps) {
      const d = C.maps[m];
      for (const p of d.props || []) if (p.scene) starts.push(m + ':' + p.p + '@' + p.x + ',' + p.y + '>' + p.scene);
      for (const n of d.npcs || []) for (const o of [].concat(n.talk || [])) { const sc = typeof o === 'string' ? o : o.scene; if (sc) starts.push(m + ':' + n.id + '>' + sc); }
      for (const ev of d.onEnter || []) if (ev.scene) starts.push(m + ':enter>' + ev.scene);
      for (const tr of d.triggers || []) if (tr.scene) starts.push(m + ':trigger>' + tr.scene);
    }
    const into = (want) => [...new Set(starts.filter((x) => reaches(x.split('>')[1], want)))].sort();
    t.eq([into('co.c_chronicle'), into('co.c_records')], [['co.hall:desk@5,3>co.chronicle'], ['co.hall:smalltable@9,6>co.hall_reading']],
      '7 only the desk starts the chronicle\'s puzzle and only the reading table the records\'; nothing Tokiwa says runs either');
  }
  // ---- 8. no scene ended on an error
  t.ok(!errors.length, '8 no scene ended on an error from the runner (' + errors.length + ': ' + flat(errors.slice(0, 3)) + ')');
};
