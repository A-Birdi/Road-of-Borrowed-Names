// Lanternfall's memorial stone (Agnes 6549722354; Local CL-574; Cloud CC-415). In Chromium on the built game, on
// throwaway journeys (never a real save), the stone looked at as a player does (standing in front of it, the action
// key), every line said recorded with the voice key the voicebank gives it:
//  1. after the bell, with Nao: the heading, the twelve names, then Nao's "…Seventeen, huh."; never the smooth face;
//     each line under its own key; again on a second visit;
//  2. before the bell, with Nao: the heading and the smooth face; no restored names, no line of Nao's;
//  3. after the bell, with Mio: the heading, the twelve names and her line about the flowers; never the smooth face;
//  no page errors (console errors included).
// (That each line's recording plays needs a voice site; this test checks the key each line is asked under.)
// Usage: node tools/build.mjs && node tests/e2e/lf_memorial.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const flat = (x) => JSON.stringify(x);
const FLAGS = { departed: true, ch1_done: true, ch2_done: true, ch3_done: true, ch4_done: true, lf_arrived: true, lf_town_intro: true };
const SMOOTH = /^The face where the names should be is smooth/, BACK = /^Now all the names are back/, HEAD = /^A memorial stone/;
const AGE = '…Seventeen, huh.';

async function visit(p, comp, bell, times) {
  return p.evaluate(async ([comp, flags, times]) => {
    const s = RB.game.debugStart('lf.sluice', 10, 12, { comp, dir: 'up', edition: RB.edition.forNew(), flags });
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true;
    RB.game.settings.textSpeed = 'instant';
    RB.save.autosave = async () => {};
    RB.test.enable({});
    await new Promise((r) => setTimeout(r, 700));
    await RB.test.idle();
    const out = [];
    for (let i = 0; i < times; i++) {
      const said = [], say = RB.ui.dialogue.say;
      RB.ui.dialogue.say = function (l) { if (l) said.push({ who: l.who, en: l.en || '', key: l.jp ? RB.voicebank.keyOf(l.sceneId, l.jp) : null }); return say.apply(this, arguments); };
      // in front of the stone (10,10), facing it, the action key's own interaction
      RB.test.place(10, 11, 'up');
      try { RB.world.interact(); await new Promise((r) => setTimeout(r, 300)); await RB.test.idle(); } finally { RB.ui.dialogue.say = say; }
      out.push(said);
    }
    const keys = {};
    for (const c of RB.content.scenes['lf.memorial'].cmds) if (c.op === 'say') keys[c.en] = RB.voicebank.keyOf('lf.memorial', c.jp);
    return { out, keys };
  }, [comp, Object.assign({}, FLAGS, bell ? { lf_bell_rung: true } : {}), times]);
}
const keyed = (r, l) => l.every((x) => x.key && x.key === r.keys[x.en]);

// 1. after the bell, with Nao
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  const r = await visit(p, 'nao', true, 2);
  const [one, two] = r.out;
  const en = one.map((x) => x.en);
  ok(HEAD.test(en[0] || '') && BACK.test(en[1] || '') && en[2] === AGE && one[2].who !== 'narr' && en.length === 3 && !en.some((x) => SMOOTH.test(x)) && keyed(r, one),
    '1 after the bell, with Nao: the heading, the twelve names, "…Seventeen, huh.", each under its own key; never the smooth face ' + flat(one.map((x) => [x.who, x.en.slice(0, 30), x.key])));
  ok(flat(two) === flat(one), '1 and the same on a second visit ' + flat(two.map((x) => x.en.slice(0, 20))));
  ok(!errors.length, '1 no page errors ' + errors.slice(0, 3).join(' | '));
  await p.context().close();
}

// 2. before the bell, with Nao
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  const r = await visit(p, 'nao', false, 1);
  const en = r.out[0].map((x) => x.en);
  ok(HEAD.test(en[0] || '') && SMOOTH.test(en[1] || '') && en.length === 2 && !en.some((x) => BACK.test(x) || x === AGE) && keyed(r, r.out[0]),
    '2 before the bell, with Nao: the heading and the smooth face; no restored names, no line of Nao\'s ' + flat(r.out[0].map((x) => [x.who, x.en.slice(0, 30)])));
  ok(!errors.length, '2 no page errors ' + errors.slice(0, 3).join(' | '));
  await p.context().close();
}

// 3. after the bell, with Mio
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  const r = await visit(p, 'mio', true, 1);
  const en = r.out[0].map((x) => x.en);
  ok(HEAD.test(en[0] || '') && BACK.test(en[1] || '') && /flowers/.test(en[2] || '') && en.length === 3 && !en.some((x) => SMOOTH.test(x)) && keyed(r, r.out[0]),
    '3 after the bell, with Mio: the heading, the twelve names, her line about the flowers; never the smooth face ' + flat(r.out[0].map((x) => [x.who, x.en.slice(0, 30)])));
  ok(!errors.length, '3 no page errors ' + errors.slice(0, 3).join(' | '));
  await p.context().close();
}

console.log(`\nlf_memorial: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
