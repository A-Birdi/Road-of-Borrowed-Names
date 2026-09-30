// An animal's meeting place through the Weave sheet (addendum §5.2: the optional
// gentle field action beside the ordinary interaction). The cat's loose reed
// screen in Reedwake: the sheet lists it among the nearby things; water is
// neutral (nothing changes, no language mistake is recorded for the world's
// answer); a rope word written correctly steadies the screen exactly as the
// ordinary route would (the same state, the method recorded), and the screen
// is then no longer offered. Real clicks; the language step answered by choice.
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let fail = 0;
const assert = (c, m) => { if (!c) { fail++; console.log('FAIL ' + m); } else console.log('ok   ' + m); };
const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });

const W0 = await p.evaluate(() => {
  const s = RB.game.debugStart('rw.village', 14, 24, { dir: 'up', comp: 'mio', flags: { rw_echo_done: true, departed: false } });
  s.learn.kanaKnown = 'both'; s.learn.profile = 'E';
  s.words = ['mizu', 'nawa'];
  RB.game.settings.input = 'choice'; RB.game.settings.textSpeed = 'instant';
  const v = RB.pets.vignettes.cat;
  return { targets: RB.pets.fieldTargets(s, 'rw.village', 14, 24), family: RB.families.ofResponse('w:nawa'), water: RB.families.ofResponse('w:mizu'), step: s.vars.pet_cat || 0, cause: v && v.cause };
});
assert(W0.targets.some((t) => t.id === 'cat'), 'the loose screen is a Weave target near it (' + JSON.stringify(W0.targets) + ')');
assert(W0.family === 'bind' && W0.water === 'water', 'rope is a binding word, water is water');

async function settle() {
  for (let i = 0; i < 300; i++) {
    const s = await p.evaluate(() => ({ dlg: RB.ui.dialogue.isOpen(), mode: RB.game.mode(), busy: RB.weave.busy(), chal: !!document.querySelector('.chal') }));
    if (s.chal) return s;
    if (s.dlg) { await p.evaluate(() => RB.ui.dialogue.advance(true)); await p.waitForTimeout(40); continue; }
    if (s.mode === 'world' && !s.busy) return s;
    await p.waitForTimeout(40);
  }
  return null;
}
async function weaveOn(word) {
  await settle();
  const opened = await p.evaluate(() => RB.weave.open());
  assert(opened, 'the Weave sheet opens beside the screen');
  const tIdx = await p.evaluate(() => [...document.querySelectorAll('.weave-sheet .wv-t')].findIndex((x) => /reed screen/.test(x.textContent)));
  assert(tIdx >= 0, 'the sheet lists the loose reed screen');
  await p.click('.weave-sheet .wv-t >> nth=' + tIdx);
  await p.click('.weave-sheet .wv-w[data-w="' + word + '"]');
  await p.waitForSelector('.chal', { timeout: 8000 });
  const tab = await p.$('.chal .ptab[data-mode=choice]');
  if (tab && (await tab.getAttribute('aria-selected')) !== 'true') await tab.click();
  await p.waitForSelector('.chal .mc .choice');
  const w = await p.evaluate((id) => { const x = RB.content.words[id]; return { r: x.r, k: RB.tasks.plain(x.jpK || x.jp) }; }, word);
  const i = await p.evaluate((w) => [...document.querySelectorAll('.chal .mc .choice')].findIndex((b) => { const c = b.cloneNode(true); c.querySelectorAll('rt').forEach((r) => r.remove()); const t = c.textContent.replace(/\s+/g, ''); return t === w.r || t === w.k; }), w);
  await p.click('.chal .mc .choice >> nth=' + i);
  await p.waitForSelector('.chal .fbwrap [data-a=continue]', { timeout: 8000 });
  await p.click('.chal .fbwrap [data-a=continue]');
  await p.waitForSelector('.chal', { state: 'detached', timeout: 8000 });
  await settle();
}

const mist0 = await p.evaluate(() => RB.game.s.learn.stats.mistakes);
await weaveOn('mizu');
let r = await p.evaluate(() => ({ step: RB.game.s.vars.pet_cat || 0, by: !!RB.game.s.flags.pet_cat_by_cord, said: RB.game.s.backlog.slice(-2).map((l) => l.en).join(' | '), mist: RB.game.s.learn.stats.mistakes }));
assert(r.step === W0.step && !r.by, 'water leaves the screen as it was (' + JSON.stringify(r) + ')');
assert(/still sways|needs tying/i.test(r.said), 'and the world says why, plainly (' + r.said + ')');
assert(r.mist === mist0, 'a correct word on the wrong thing is not a language mistake');

await weaveOn('nawa');
r = await p.evaluate(() => ({ step: RB.game.s.vars.pet_cat || 0, by: !!RB.game.s.flags.pet_cat_by_cord, said: RB.game.s.backlog.slice(-2).map((l) => l.en).join(' | '), targets: RB.pets.fieldTargets(RB.game.s, 'rw.village', 14, 24).map((t) => t.id) }));
assert(r.step === 2 && r.by, 'a rope word steadies the screen, as the ordinary route would (' + JSON.stringify(r) + ')');
assert(/ties the screen/i.test(r.said), 'the world says what the word did');
assert(!r.targets.includes('cat'), 'the steadied screen is no longer offered');
assert(!(await p.evaluate(() => RB.pets.record(RB.game.s, 'cat'))), 'the cat has not joined by itself: meeting it is still the player\'s choice');
assert(!errors.length, 'no page errors: ' + errors.join('; '));

await b.close(); srv.close();
console.log(fail ? fail + ' failed' : 'all ok');
process.exit(fail ? 1 : 0);
