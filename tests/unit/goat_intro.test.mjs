// Too Many Goats: Tetsuji's first talk once the storm has begun, and his line after the lamp (Agnes 6546145159,
// 6546381905; Local CL-559; Cloud CC-401). His intro said "this morning" and "before the storm" whenever it came, and
// his after-the-lamp line named the kids before his quest revealed them. On the real runner, the screen stood in for,
// every line said with its voice key:
//  1. before the storm: the intro as before, every line and key ("This morning I opened the shed…", "…before the
//     storm."), and the quest started;
//  2. the morning after the storm, the lamp not lit: "The morning before the storm, I opened the shed…" and no
//     deadline, and the quest started;
//  3. after the lamp, the quest not begun: "The goats want to look outside.", then the intro of 2;
//  4. after the lamp, the quest begun: "The goats…", then his waiting line; with the note read (through the note's own
//     scene), "The goats…", then the report and its reveal;
//  5. after the lamp, the quest done: "The kids want to look outside.", as before, and nothing more;
//  6. his after-the-lamp line never names the kids before his quest is done, in each state above (the note and the
//     report's reveal still do: Agnes 6546381905);
//  7. the quest's mechanics, before the storm and after the lamp: started at the first talk, stage 2 from the note,
//     done at the report with the bell, the cheese and the note; once only;
//  8. the voice keys: the three original lines keep theirs (sb.tetsuji#99e1209fc2, #7510b8993c, #5248c5e78b), and the
//     three new lines each have their own;
//  9. Suzu: her line in the intro before the storm and after it, standard and Kansai, its Kansai version unchanged;
//  and no scene ended on an error from the runner.
import crypto from 'node:crypto';
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state;
  const flat = (x) => JSON.stringify(x);
  const keyOf = (scene, jp) => scene + '#' + crypto.createHash('sha256').update(String(jp)).digest('hex').slice(0, 10);

  // the runner, with the screen stood in for: each line said, by its English, its Japanese and its voice key
  let log = [];
  RB.ui.dialogue.say = async (o) => { log.push({ en: o && o.en, jp: o && o.jp, key: o && o.jp ? keyOf(o.sceneId, o.jp) : null }); };
  RB.ui.dialogue.choose = async () => 0;
  RB.ui.dialogue.hide = () => {};
  RB.ui.toast = async () => {};
  RB.ui.shake = () => {};
  RB.ui.fade = async () => {};
  for (const k of ['dismissExtras', 'refreshActors']) RB.world[k] = () => {};
  RB.game.afterScene = () => {};
  RB.save.autosave = async () => {};
  RB.test.enable({});
  // (no settings record without the screen: one for the speech choice, which the dialogue box applies when it shows a line)
  if (!RB.game.G.settings) RB.game.G.settings = {};

  // at his pen gate: before the storm, the morning after it, or after the lamp; the quest at a stage or not begun
  const camp = (o = {}) => {
    const s = S.newCampaign(); s.comp = o.comp || 'nao'; s.map = 'sb.hamlet'; s.x = 10; s.y = 27;
    Object.assign(s.flags, { departed: true, ch1_done: true, ch2_done: true, ch3_done: true }, o.storm || o.lamp ? { sb_storm: true, sb_morning: true } : {}, o.lamp ? { sb_lamp_lit: true } : {});
    if (o.quest != null) S.setQuest(s, 'sb_goats', o.quest);
    RB.game.G.s = s; RB.game.s = s;
    RB.game.settings.suzuSpeech = o.speech || 'standard';
    return s;
  };
  const errors = [];
  const run = async (scene) => {
    log = [];
    try { await RB.script.run(scene, {}); } catch (e) { errors.push(scene + ': ' + String((e && e.message) || e)); }
    return log.slice();
  };
  const en = (l) => l.map((x) => x.en);
  const has = (l, re) => en(l).some((x) => re.test(x || ''));
  const L = {
    morning: /^I own ten goats\. This morning I opened the shed/,
    before: /^I own ten goats\. The morning before the storm, I opened the shed/,
    deadline: /^They need returning to their owner before the storm\./,
    noDeadline: /^They need returning to their owner\. But no one's come forward\./,
    kids: /^With the observatory lamp lit, the shed's bright at night\. The kids want to look outside\.$/,
    goats: /^With the observatory lamp lit, the shed's bright at night\. The goats want to look outside\.$/,
    waiting: /^Anyone know anything\?/,
    reveal: /^…Born\. Momo had kids\. Two of them\./,
    done: /^Twelve\. …However many times I count, twelve\. Not bad\./,
    suzu: /^Troubled because you've got/,
  };
  const stage = (s) => { const q = s.quests.sb_goats; return q ? (q.done ? 'done' : q.stage) : null; };
  const afterLine = (l) => l.find((x) => L.kids.test(x.en || '') || L.goats.test(x.en || ''));

  // ---- 1. before the storm
  {
    const s = camp();
    const l = await run('sb.tetsuji');
    t.ok(has(l, L.morning) && has(l, L.deadline) && !has(l, L.before) && !has(l, L.noDeadline) && !afterLine(l) && stage(s) === 0,
      '1 before the storm: "This morning…" and "…before the storm.", as before, and the quest started (' + flat({ lines: l.length, stage: stage(s) }) + ')');
  }
  // ---- 2. the morning after the storm, the lamp not lit
  {
    const s = camp({ storm: true });
    const l = await run('sb.tetsuji');
    t.ok(has(l, L.before) && has(l, L.noDeadline) && !has(l, L.morning) && !has(l, L.deadline) && !afterLine(l) && stage(s) === 0,
      '2 the morning after the storm: "The morning before the storm…" and no deadline, and the quest started (' + flat({ lines: l.length, stage: stage(s) }) + ')');
  }
  // ---- 3–5. after the lamp
  const seen = {};
  {
    const s = camp({ lamp: true });
    const l = await run('sb.tetsuji');
    seen.unbegun = l;
    t.ok(L.goats.test(en(l)[0] || '') && has(l, L.before) && has(l, L.noDeadline) && !has(l, L.morning) && !has(l, L.deadline) && stage(s) === 0,
      '3 after the lamp, not begun: "The goats want to look outside.", then the intro of 2, and the quest started (' + flat(en(l).slice(0, 3)) + ')');
  }
  {
    const s = camp({ lamp: true, quest: 'start' });
    const w = await run('sb.tetsuji');
    seen.waiting = w;
    await run('sb.goat_note');
    const st2 = stage(s);
    const r = await run('sb.tetsuji');
    seen.report = r;
    t.ok(L.goats.test(en(w)[0] || '') && has(w, L.waiting) && !has(w, L.reveal) && st2 === 2 && L.goats.test(en(r)[0] || '') && has(r, L.reveal) && stage(s) === 'done',
      '4 after the lamp, begun: "The goats…", then his waiting line; the note read (stage 2), "The goats…", then the report and its reveal (' + flat({ w: en(w), st2, r: en(r).slice(0, 2) }) + ')');
  }
  {
    const s = camp({ lamp: true, quest: 'done' });
    const l = await run('sb.tetsuji');
    seen.done = l;
    t.ok(l.length === 1 && L.kids.test(l[0].en || '') && stage(s) === 'done',
      '5 after the lamp, done: "The kids want to look outside.", as before, and nothing more (' + flat(en(l)) + ')');
  }
  // ---- 6. the after-the-lamp line never names the kids before the quest is done
  {
    const lines = ['unbegun', 'waiting', 'report'].map((k) => (afterLine(seen[k]) || {}).en || null);
    t.ok(lines.every((x) => x && L.goats.test(x)) && L.kids.test((afterLine(seen.done) || {}).en || '') && has(seen.report, L.reveal),
      '6 his after-the-lamp line names the goats, not the kids, until his quest is done; the report\'s reveal still names them (' + flat(lines) + ')');
  }
  // ---- 7. the quest's mechanics, before the storm and after the lamp
  for (const when of ['before the storm', 'after the lamp']) {
    const s = camp(when === 'after the lamp' ? { lamp: true } : {});
    await run('sb.tetsuji');
    const st0 = stage(s);
    await run('sb.goat_note');
    const st2 = stage(s);
    await run('sb.tetsuji');
    const got = { stage: stage(s), bell: s.inv.sb_goat_bell || 0, cheese: s.inv.sb_cheese || 0, note: (s.notes || []).includes ? (s.notes || []).includes('sb_counters') : !!(s.notes && s.notes.sb_counters) };
    const again = await run('sb.tetsuji');
    const twice = { bell: s.inv.sb_goat_bell || 0, cheese: s.inv.sb_cheese || 0 };
    const last = when === 'after the lamp' ? L.kids : L.done;
    t.ok(st0 === 0 && st2 === 2 && got.stage === 'done' && got.bell === 1 && got.cheese === 1 && again.length === 1 && last.test(again[0].en || '') && flat(twice) === flat({ bell: 1, cheese: 1 }),
      '7 ' + when + ': started, stage 2 from the note, done at the report with the bell and the cheese; asked again, his closing line only, nothing given twice (' + flat({ st0, st2, got, again: en(again) }) + ')');
  }
  // ---- 8. the voice keys
  {
    const cmds = C.scenes['sb.tetsuji'].cmds.filter((c) => c.jp);
    const keyFor = (re) => cmds.filter((c) => re.test(c.en || '')).map((c) => keyOf('sb.tetsuji', c.jp));
    const k = { morning: keyFor(L.morning), deadline: keyFor(L.deadline), kids: keyFor(L.kids), before: keyFor(L.before), noDeadline: keyFor(L.noDeadline), goats: keyFor(L.goats) };
    const fresh = [k.before[0], k.noDeadline[0], k.goats[0]];
    const said = (re, l) => (l.find((x) => re.test(x.en || '')) || {}).key || null;
    t.ok(flat([k.morning, k.deadline, k.kids]) === flat([['sb.tetsuji#99e1209fc2'], ['sb.tetsuji#7510b8993c'], ['sb.tetsuji#5248c5e78b']])
      && k.before.length === 1 && k.noDeadline.length === 1 && k.goats.length === 1 && new Set(fresh).size === 3 && !fresh.some((x) => ['sb.tetsuji#99e1209fc2', 'sb.tetsuji#7510b8993c', 'sb.tetsuji#5248c5e78b'].includes(x))
      && said(L.kids, seen.done) === 'sb.tetsuji#5248c5e78b' && said(L.goats, seen.unbegun) === k.goats[0] && said(L.before, seen.unbegun) === k.before[0],
      '8 the three original lines keep their keys, and the three new lines have their own, as said (' + flat(fresh) + ')');
  }
  // ---- 9. Suzu, standard and Kansai, before the storm and after it
  {
    const rows = [];
    for (const storm of [false, true]) for (const speech of ['standard', 'kansai']) {
      camp({ comp: 'suzu', storm, speech });
      const l = await run('sb.tetsuji');
      const mine = l.find((x) => L.suzu.test(x.en || ''));
      const shown = mine ? RB.dialect.line('comp', { jp: mine.jp, en: mine.en }) : null;
      rows.push({ storm, speech, said: !!mine, dia: shown ? shown.dia || null : null, kansai: shown ? /わへん/.test(shown.jp) && /うち も/.test(shown.jp) : false });
    }
    t.ok(rows.every((r) => r.said && (r.speech === 'kansai' ? r.dia === 'kansai' && r.kansai : r.dia === null && !r.kansai)),
      '9 Suzu\'s line in the intro, before the storm and after it: standard as written, and in Kansai her Kansai line (' + flat(rows) + ')');
  }

  t.ok(!errors.length, 'no scene ended on an error from the runner: ' + errors.join(' | '));
};
