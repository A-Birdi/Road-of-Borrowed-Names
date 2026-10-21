// RBN-QA-060 (Agnes 6312189282; Local CL-089/CL-091; Cloud CC-051): in a conversation with a creature in it, on the
// battle screen, Wait is the conversation's: "Say nothing this time, and let the others speak." (or the encounter's
// own waitDesc), its confirmation keeps the cost in view (the creatures still act), and while the conversation's own
// Wait would bring something out now the card says "They seem to have more to say." (never what). In Chromium on the
// built game:
//  1. all nine conversations: the Wait card's words; the cue exactly when the conversation's Wait would act now
//     (encounter.test of its `when`, read only); reading the cards again leaves the battle as it was;
//  2. the Teller's Shadow with the real buttons: the cue from the first exchange; Wait pressed, the confirmation in
//     the conversation's words with the cost; then the claim comes out and the cue is gone;
//  3. an ordinary battle keeps "Wait and watch", its description and its confirmation; no page errors.
// Usage: node tools/build.mjs && node tests/e2e/social_wait.mjs
import { serve, launch, page, companionTurn } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const WORDS = ['mamoru', 'mizu', 'hikari', 'kaze', 'nawa', 'ishi', 'iyasu', 'suzu'];
const SAY = 'Say nothing this time, and let the others speak.', CUE = 'They seem to have more to say.';

async function begin(o) {
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await p.evaluate(([o, WORDS]) => {
    const s = RB.game.debugStart('rw.millroad', 10, 22, { edition: RB.edition.forNew(), comp: o.comp || 'suzu' });
    s.learn.kanaKnown = 'both'; s.learn.profile = 'E'; s.words = WORDS.slice();
    for (const c of ['c_wait']) s.flags[c] = true;
    RB.game.settings.input = 'choice'; RB.game.settings.battleAnim = 'instant'; RB.game.settings.compPlan = 'ask'; RB.game.applySettings();
    if (o.enc) RB.game.startEncounter(o.enc, {}); else RB.game.startBattle(o.enemy, {});
  }, [o, WORDS]);
  await ready(p);
  return { p, errors };
}
async function ready(p) {
  for (let i = 0; i < 200; i++) {
    const s = await p.evaluate(() => { if (RB.ui.dialogue.isOpen()) RB.ui.dialogue.advance(true); return { ph: RB.combat.state() ? RB.combat.phase() : 'none', n: document.querySelectorAll('.rcard[data-i]:not([disabled])').length }; });
    if (s.ph === 'choose' && s.n) break;
    if (await p.evaluate(() => !!document.querySelector('[data-coach-ok]'))) { await p.mouse.move(2, 2); await p.waitForTimeout(300); await p.click('[data-coach-ok]').catch(() => {}); }
    if (await p.evaluate(() => !!document.querySelector('.ccard'))) { await p.mouse.move(2, 2); await p.waitForTimeout(320); await companionTurn(p).catch(() => {}); }
    await p.waitForTimeout(100);
  }
  await p.waitForTimeout(700);
  if (await p.evaluate(() => !!document.querySelector('[data-coach-ok]'))) { await p.mouse.move(2, 2); await p.waitForTimeout(300); await p.click('[data-coach-ok]').catch(() => {}); }
}
// the Wait card as shown, and whether the conversation's Wait would act now (read only), and the battle unchanged by
// reading the cards three times
const waitCard = (p) => p.evaluate(() => {
  const st = RB.combat.state(), s = RB.game.s;
  const c = [...document.querySelectorAll('.rcard[data-i]')].find((x) => /^Wait/.test(((x.querySelector('.rc-en') || {}).textContent || '').trim()));
  const w = st.enc && st.enc.def.social && st.enc.def.social.wait;
  const J = () => JSON.stringify(st, (k, v) => (typeof v === 'function' || k === 'def' ? undefined : v));
  const before = J();
  for (let k = 0; k < 3; k++) RB.encounter.cards(st, s, s.words.map((x) => RB.content.words[x]).filter(Boolean));
  return {
    en: c ? c.querySelector('.rc-en').textContent.trim() : null,
    more: c ? ((c.querySelector('.rc-more') || {}).textContent || '').trim() : null,
    cue: c ? ((c.querySelector('.rc-cue') || {}).textContent || '').trim() || null : null,
    acts: !!(w && RB.encounter.test(st, w.when)),
    pure: J() === before,
    i: c ? c.getAttribute('data-i') : null,
  };
});

// 1. all nine conversations
for (const [id, comp] of [['kr.shadow_gate', 'suzu'], ['kr.ghost_lectern', 'suzu'], ['kr.hyakuwa', 'ren'], ['cr.courier', 'nao'], ['ko.gardener', 'mio'], ['yn.kettle', 'suzu'], ['gd.sg', 'suzu'], ['gd.lf', 'ren'], ['gd.mb', 'nao']]) {
  const { p, errors } = await begin({ enc: id, comp });
  const w = await waitCard(p);
  ok(w.en === 'Wait' && w.more === SAY && (w.acts ? w.cue === CUE : w.cue === null) && w.pure && !errors.length, id + ': Wait in the conversation\'s words; the cue ' + (w.acts ? 'shown, as its Wait would act now' : 'not shown, as its Wait would not act yet') + '; reading the cards changes nothing (' + JSON.stringify(w) + ')');
  await p.close();
}
// 2. the Teller's Shadow, real buttons
{
  const { p, errors } = await begin({ enc: 'kr.shadow_gate', comp: 'suzu' });
  const w0 = await waitCard(p);
  const before = await p.evaluate(() => Object.keys(RB.combat.state().enc.social.revealed));
  await p.click('.rcard[data-i="' + w0.i + '"] .rc-en');
  await p.waitForSelector('.csheet .pbtn', { timeout: 8000 });
  const sheet = await p.evaluate(() => document.querySelector('.csheet').textContent.replace(/\s+/g, ' ').trim());
  await p.evaluate(() => { const bt = [...document.querySelectorAll('.csheet .pbtn')].find((x) => /^Wait$/.test(x.textContent.trim())); bt.click(); });
  await p.mouse.move(2, 2); await p.waitForTimeout(500);
  await companionTurn(p, { timeout: 2500 }).catch(() => {});
  await ready(p);
  const after = await p.evaluate(() => Object.keys(RB.combat.state().enc.social.revealed));
  const w1 = await waitCard(p);
  ok(w0.cue === CUE && /let the others speak/.test(sheet) && /The creatures still act/.test(sheet) && !/watch|next moves/i.test(sheet), 'the Teller\'s Shadow: the cue from the first exchange; Wait asks in the conversation\'s words, with the cost (' + JSON.stringify({ cue: w0.cue, sheet }) + ')');
  ok(before.indexOf('w3') < 0 && after.indexOf('w3') >= 0 && w1.cue === null && !w1.acts && !errors.length, 'the Teller\'s Shadow: after Wait the claim is out and the cue is gone (' + JSON.stringify({ before, after, cue: w1.cue, errors: errors.slice(0, 1) }) + ')');
  await p.close();
}
// 3. an ordinary battle: as before
{
  const { p, errors } = await begin({ enc: 'fx.ordinary', comp: 'suzu' });
  const w = await waitCard(p);
  await p.click('.rcard[data-i="' + w.i + '"] .rc-en');
  await p.waitForSelector('.csheet .pbtn', { timeout: 8000 });
  const sheet = await p.evaluate(() => document.querySelector('.csheet').textContent.replace(/\s+/g, ' ').trim());
  ok(w.en === 'Wait and watch' && /watch closely/.test(w.more) && w.cue === null && /^Wait and watch: you answer nothing this exchange, and the creatures act\. You will see their next moves\./.test(sheet) && !errors.length, 'an ordinary battle: "Wait and watch", its description and its confirmation as before (' + JSON.stringify({ en: w.en, more: w.more, sheet }) + ')');
  await p.close();
}
console.log(`\nsocial_wait: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
