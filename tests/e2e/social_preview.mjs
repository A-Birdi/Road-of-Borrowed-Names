// RBN-QA-055 (Agnes; preview-only fix agreed by Agnes 6309664667, Local CL-073, Cloud CC-044): in a conversation with a
// creature in it, the battle screen's cards said what they would do in a battle ("Here: Sees through the false
// promise.", "Here: Frees 1 knot."), but a conversation does with them only what it makes of them, and the result said
// "It changes nothing here". The "Here:" line is not given in a conversation; nothing is tried on the conversation to
// say it. In Chromium on the built game:
//  1. the Teller's Shadow: no card has a "Here:" line; See through and Unravel keep their own description;
//  2. all nine conversations with a creature: no "Here:" line on any card;
//  3. preview purity: hovering every card leaves the conversation exactly as it was;
//  4. ordinary battles and an encounter that is not a conversation keep their "Here:" lines; no page errors.
// Usage: node tools/build.mjs && node tests/e2e/social_preview.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const WORDS = ['mamoru', 'mizu', 'hikari', 'kaze', 'nawa', 'ishi', 'iyasu', 'honoo', 'suzu', 'koe'];

async function begin(o) {
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await p.evaluate(([o, WORDS]) => {
    const s = RB.game.debugStart('rw.millroad', 10, 22, { edition: RB.edition.forNew(), comp: o.comp || 'suzu' });
    s.learn.kanaKnown = 'both'; s.learn.profile = 'E'; s.words = WORDS.slice();
    RB.game.settings.input = 'choice'; RB.game.settings.battleAnim = 'instant'; RB.game.settings.compPlan = 'ask'; RB.game.applySettings();
    if (o.enc) RB.game.startEncounter(o.enc, {}); else RB.game.startBattle(o.enemy, {});
  }, [o, WORDS]);
  for (let i = 0; i < 150; i++) {
    const s = await p.evaluate(() => { if (RB.ui.dialogue.isOpen()) RB.ui.dialogue.advance(true); return { ph: RB.combat.state() ? RB.combat.phase() : 'none', n: document.querySelectorAll('.rcard[data-i]').length }; });
    if (s.ph === 'choose' && s.n) break;
    await p.waitForTimeout(100);
  }
  await p.waitForTimeout(700);
  if (await p.evaluate(() => !!document.querySelector('[data-coach-ok]'))) { await p.mouse.move(2, 2); await p.waitForTimeout(300); await p.click('[data-coach-ok]'); await p.waitForTimeout(300); }
  return { p, errors };
}
const cards = (p) => p.evaluate(() => [...document.querySelectorAll('.rcard[data-i]')].map((x) => ({
  en: ((x.querySelector('.rc-en') || {}).textContent || '').trim(),
  here: ((x.querySelector('.rc-here') || {}).textContent || '').trim(),
  more: ((x.querySelector('.rc-more') || {}).textContent || '').trim(),
})));

// 1 and 3. the Teller's Shadow
{
  const { p, errors } = await begin({ enc: 'kr.shadow_gate' });
  const cs = await cards(p);
  const st = (n) => cs.find((c) => c.en === n) || {};
  ok(cs.length && cs.every((c) => !c.here), 'the Teller\'s Shadow: no card has a "Here:" line (' + JSON.stringify(cs.filter((c) => c.here).map((c) => c.en + ': ' + c.here)) + ')');
  ok(st('See through').more && st('Unravel').more, 'See through and Unravel keep their own description (' + JSON.stringify({ seeThrough: st('See through').more, unravel: st('Unravel').more }) + ')');
  const before = await p.evaluate(() => JSON.stringify(RB.combat.state().enc.social));
  const n = await p.evaluate(() => document.querySelectorAll('.rcard[data-i]').length);
  for (let i = 0; i < n; i++) { await p.hover('.rcard[data-i]:nth-of-type(' + (i + 1) + ')').catch(() => {}); await p.waitForTimeout(60); }
  await p.mouse.move(2, 2); await p.waitForTimeout(200);
  const after = await p.evaluate(() => JSON.stringify(RB.combat.state().enc.social));
  ok(before === after, 'hovering every card leaves the conversation as it was');
  ok(!errors.length, 'the Teller\'s Shadow: no page errors ' + errors.slice(0, 2).join(' | '));
  await p.close();
}
// 2. all nine conversations with a creature
for (const [id, comp] of [['kr.ghost_lectern', 'suzu'], ['kr.hyakuwa', 'ren'], ['cr.courier', 'nao'], ['ko.gardener', 'mio'], ['yn.kettle', 'suzu'], ['gd.sg', 'suzu'], ['gd.lf', 'ren'], ['gd.mb', 'nao']]) {
  const { p, errors } = await begin({ enc: id, comp });
  const cs = await cards(p);
  ok(cs.length && cs.every((c) => !c.here) && !errors.length, id + ': no "Here:" line on any card, no page errors (' + JSON.stringify(cs.filter((c) => c.here).map((c) => c.en)) + ')');
  await p.close();
}
// 4. not a conversation: as before
for (const o of [{ enemy: 'rw.reedling' }, { enc: 'fx.ordinary' }]) {
  const { p, errors } = await begin(o);
  const cs = await cards(p);
  ok(cs.some((c) => c.here) && !errors.length, (o.enc || o.enemy) + ': "Here:" lines as before (' + JSON.stringify(cs.filter((c) => c.here).slice(0, 3).map((c) => c.en + ': ' + c.here)) + ')');
  await p.close();
}
console.log(`\nsocial_preview: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
