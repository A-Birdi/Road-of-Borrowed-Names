// Three Tellings of the Fox Bridge (kr_fox; Cloud CC-386, CC-387; Local CL-539, CL-540, CL-541; Agnes 6541203705). In
// Chromium on the built game, with throwaway journeys (never a real save), talking to Shōzō as a player does (pressed at
// him, the automated player answering as asked):
//  1. before the chapter's end, Kame's story and the shrine's board in: he offers the register, it is read, the
//     comparison is offered at once, and the tellings settle it: the quest done once, the board decided;
//  2. after the chapter's end with the quest still open: the same route, done; then his after-chapter line, with the
//     board;
//  3. after the chapter's end, never begun: only "People come out at night just to look at the bridge.", never the
//     board;
//  4. the register's choice in Japanese has a reading on every kanji; no page errors.
// Usage: node tools/build.mjs && node tests/e2e/kr_fox_route.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const errorsAll = [];
const KR = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_arrived: true, kr_fox_seen: true };
const REG = 'Ask to see the hamlet\'s register.', CMP = 'Compare the tellings.';
const BOARD = /the new board can be read by it/, NIGHT = 'People come out at night just to look at the bridge.';
const DONE = 'quest_done:Three Tellings of the Fox Bridge';

async function begin(p, o) {
  await p.evaluate(async (o) => {
    const s = RB.game.debugStart('kr.fox', 5, 12, { dir: 'up', edition: RB.edition.forNew(), flags: o.flags });
    s.comp = null;
    if (o.quest) s.quests.kr_fox = o.quest;
    for (const k of o.seen || []) s.seen[k] = true;
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true;
    RB.game.settings.textSpeed = 'instant';
    RB.save.autosave = async () => {};
    // the automated player answers each choice with the option asked for, in turn ("Later" when nothing is asked)
    window.__want = []; window.__offered = [];
    RB.test.enable({ choose: (opts) => { window.__offered.push(opts.map((x) => x.en)); const w = window.__want.shift(); const i = opts.findIndex((x) => x.en === w); return i >= 0 ? i : opts.findIndex((x) => /^Later/.test(x.en)); } });
    await new Promise((r) => setTimeout(r, 800));
    RB.world.refreshActors();
    window.__said = []; window.__toasts = [];
    if (!window.__wrapped) {
      window.__wrapped = true;
      const say = RB.ui.dialogue.say, toast = RB.ui.toast;
      RB.ui.dialogue.say = function (l) { if (l) window.__said.push(l.en || ''); return say.apply(this, arguments); };
      RB.ui.toast = function (x) { if (x && x.kind) window.__toasts.push(x.kind + ':' + (x.en || '')); return toast.apply(this, arguments); };
    }
  }, o);
}
const talk = (p, want) => p.evaluate(async (want) => {
  window.__said = []; window.__offered = []; window.__want = want.slice();
  await RB.test.talk('kr_shozo'); await RB.test.idle();
  const s = RB.game.s;
  return { said: window.__said.slice(), offered: window.__offered.slice(), q: s.quests.kr_fox || null, board: !!s.flags.kr_fox_board, record: !!s.flags.kr_record_read, toasts: window.__toasts.slice() };
}, want);

// ---- 1. before the chapter's end
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await begin(p, { flags: Object.assign({ kr_shozo_met: true }, KR), quest: { stage: 0, done: false, t: 1 }, seen: ['kr.kame', 'kr.fox_shrine'] });
  const r = await talk(p, [REG, CMP]);
  ok(JSON.stringify(r.offered) === JSON.stringify([[REG, 'Later.'], [CMP, 'Later.']]) && r.record && r.said.some((l) => /The hamlet's old register/.test(l)) && r.q && r.q.done && r.board && r.toasts.filter((x) => x === DONE).length === 1,
    '1 before the chapter: the register asked for and read, the comparison at once, settled: done once, the board decided (' + JSON.stringify({ offered: r.offered, q: r.q, toasts: r.toasts }) + ')');
  // ---- 4. the register's choice, in Japanese, with every kanji read
  const jp = await p.evaluate(() => {
    const sc = RB.content.scenes['kr.shozo_idle'];
    const c = sc.cmds.find((x) => x.op === 'choice' && x.opts.some((o) => /register/.test(o.en)));
    if (!c) return { rubies: [], bare: [], missing: true };
    const o = c.opts.find((x) => /register/.test(x.en));
    const el = document.createElement('div'); el.innerHTML = RB.ui.jhtml(o.jp); document.body.appendChild(el);
    const bare = []; const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let n;
    while ((n = w.nextNode())) if (/[一-鿿々]/.test(n.nodeValue) && !n.parentElement.closest('ruby')) bare.push(n.nodeValue);
    const rubies = [...el.querySelectorAll('ruby')].map((r) => { const c2 = r.cloneNode(true); const rt = c2.querySelector('rt'); const k = rt ? rt.textContent : ''; if (rt) rt.remove(); return c2.textContent + ':' + k; });
    el.remove();
    return { rubies, bare };
  });
  ok(JSON.stringify(jp.rubies) === JSON.stringify(['里:さと', '記録:きろく', '見:み']) && !jp.bare.length, '4 the register\'s choice: 里 (さと), 記録 (きろく), 見 (み), no kanji without a reading (' + JSON.stringify(jp) + ')');
  ok(!errors.length, 'before the chapter: no page errors ' + errors.slice(0, 3).join(' | '));
  errorsAll.push(...errors);
  await p.close();
}

// ---- 2. after the chapter's end, the quest still open
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await begin(p, { flags: Object.assign({ kr_shozo_met: true, kr_done: true }, KR), quest: { stage: 0, done: false, t: 1 }, seen: ['kr.kame', 'kr.fox_shrine'] });
  const r = await talk(p, [REG, CMP]);
  const again = await talk(p, []);
  ok(r.q && r.q.done && r.board && r.toasts.filter((x) => x === DONE).length === 1 && !r.said.some((l) => BOARD.test(l)),
    '2 after the chapter, open: the register, the comparison, done once (' + JSON.stringify({ offered: r.offered, q: r.q, toasts: r.toasts }) + ')');
  ok(again.said.some((l) => BOARD.test(l)) && !again.offered.length && again.toasts.filter((x) => x === DONE).length === 1,
    '2 then his after-chapter line, with the board, and nothing twice (' + JSON.stringify(again.said) + ')');
  ok(!errors.length, 'after the chapter: no page errors ' + errors.slice(0, 3).join(' | '));
  errorsAll.push(...errors);
  await p.close();
}

// ---- 3. after the chapter's end, never begun
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await begin(p, { flags: Object.assign({ kr_done: true }, KR) });
  const r = await talk(p, []);
  ok(r.said.includes(NIGHT) && !r.said.some((l) => BOARD.test(l)) && !r.q, '3 after the chapter, never begun: "' + NIGHT + '" only, never the board (' + JSON.stringify(r.said) + ')');
  ok(!errors.length, 'never begun: no page errors ' + errors.slice(0, 3).join(' | '));
  errorsAll.push(...errors);
  await p.close();
}

console.log(`\nkr_fox_route: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
