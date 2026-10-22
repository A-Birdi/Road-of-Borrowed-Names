// RBN-QA-115 (Agnes 6346428273, 6346676788; Local CL-209; Cloud CC-126 §2): the complaint's inquiry, in Chromium on the
// built game. The encounter itself is played through in tests/unit/zenroku_inquiry.test.mjs (its end is 'asked'); here,
// with that end given to the scene as the encounter would give it, from the real talk to Kane in the Lower House:
//  1. Kane's line after it is hers: 「上の湯には、私から聞いてみるわ。……」, shown with its readings, and its English;
//     no line says Plum or tomorrow; the complaint is marked done;
//  2. the built game's complaint carries the new offer, its near miss and its end, and nothing of the Plum room;
//  3. no page errors.
// Usage: node tools/build.mjs && node tests/e2e/zenroku_inquiry.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const YN = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_done: true, cr_called: true, cr_done: true, cr_delivered: true, yn_called: true, yn_kami_seen: true, yn_rooms_done: true, yn_shimo_seen: true, yn_shimo_heard: true };
const errs = [];
for (const comp of ['mio', 'suzu']) {
  const { p, errors } = await page(b, url);
  // Kane at (5,5) facing left; you to her left, facing right
  await p.evaluate(([YN, comp]) => {
    const s = RB.game.debugStart('yn.shimo', 4, 5, { dir: 'right', edition: RB.edition.forNew(), comp, flags: Object.assign({}, YN) });
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true;
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.suzuSpeech = 'standard';
    RB.world.enter('yn.shimo', 4, 5, 'right', { fresh: true });
    const start = RB.game.startEncounter;
    window.__encs = [];
    RB.game.startEncounter = async (id, o) => { window.__encs.push(id); return id === 'yn.complaint' ? { result: 'win', outcome: 'asked' } : start(id, o); };
  }, [YN, comp]);
  await p.waitForTimeout(800);
  await p.evaluate(() => RB.world.interact());
  const lines = [];
  for (let i = 0; i < 200; i++) {
    const st = await p.evaluate(() => {
      const d = RB.ui.dialogue.isOpen() && RB.ui.dialogue.shown();
      const box = document.querySelector('.dlg');
      return { d: d ? { who: d.who, en: String(d.en || ''), jp: String(d.jp || '') } : null, ruby: box ? box.querySelectorAll('ruby').length : 0, run: RB.script.isRunning() };
    });
    if (st.d) {
      if (!lines.length || lines[lines.length - 1].en !== st.d.en) { lines.push(Object.assign({ ruby: st.ruby }, st.d)); await p.waitForTimeout(120); await p.evaluate(() => RB.ui.dialogue.isOpen() && RB.ui.dialogue.advance()); }
      await p.waitForTimeout(60);
      continue;
    }
    if (!st.run && lines.length) break;
    await p.waitForTimeout(60);
  }
  await p.waitForTimeout(400);
  const kane = lines.find((l) => l.who === 'yn_kane' && /I'll ask the Upper House myself/.test(l.en));
  const s = await p.evaluate(() => ({ done: !!RB.game.s.flags.yn_complaint_done, encs: window.__encs }));
  ok(s.encs.join() === 'yn.complaint' && kane && kane.jp.startsWith('{上|かみ}の{湯|ゆ} に は 、 {私|わたし} から {聞|き}いて みる わ') && kane.ruby >= 4 && !lines.some((l) => /Plum|tomorrow|梅/.test(l.en + l.jp)) && s.done, comp + ': after the inquiry, Kane says she will ask the Upper House herself, with readings; no Plum, no tomorrow; the complaint done (' + JSON.stringify({ kane: kane && kane.en, ruby: kane && kane.ruby, done: s.done }) + ')');
  if (comp === 'mio') {
    const built = await p.evaluate(() => {
      const d = RB.content.encounters['yn.complaint'], mv = d.social.actions.find((a) => a.id === 'move');
      return { label: mv.label.en, near: mv.task.F.options.map((o) => o.jp), ends: d.conclusions.map((c) => c.id), plum: /Plum|梅/.test(JSON.stringify(d)) };
    });
    ok(built.label === 'Offer to ask the Upper House when a room will come free' && built.near.some((x) => /いつ まで/.test(x)) && built.ends.includes('asked') && !built.ends.includes('moved') && !built.plum, 'the built game\'s complaint: the new offer, its near miss and its end, and nothing of the Plum room (' + JSON.stringify(built) + ')');
  }
  errs.push(...errors);
  await p.close();
}
ok(errs.length === 0, 'no page errors' + (errs.length ? ' (' + errs.slice(0, 3).join(' | ') + ')' : ''));
console.log(`\n${pass} passed, ${fail} failed`);
await b.close(); srv.close();
process.exit(fail ? 1 : 0);
