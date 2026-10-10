// The living world on screen (expansion P05; src/engine/53_town.js, src/ui/53w_whereabouts.js, the Journey's Places
// and Known details' People), in Chromium on the built game, with no journey saved. Synthetic towns on real maps are
// put into a throwaway session (the shipped tables are empty until the new chapters fill them):
//  - with nobody to ask about, talking to someone who can be asked is plain talking;
//  - "Have you seen…?": Talk / Have you seen…? / Never mind, the people you know of, the question and the answer in
//    both languages; a note in Known details that says who said it and that it was then;
//  - routines tick only on a transition back after three away: never while walking about the town, never during a
//    conversation; the resident is then in their one new place;
//  - the Journey's one line for a changed town (and Settings turning it off), and a road event left unfinished;
//  - a six-chapter journey keeps no record of where you saw people;
//  - phone width: no horizontal overflow; no errors, no network.
// Usage: node tests/e2e/world_living.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
async function test(name, fn) {
  try { await Promise.race([fn(), new Promise((_, rej) => setTimeout(() => rej(new Error('timed out after 180 s')), 180000))]); pass++; console.log('PASS ' + name); }
  catch (e) { fail++; console.log('FAIL ' + name + ': ' + String(e && e.stack || e).slice(0, 1200)); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };
const noOverflow = (p) => p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);

// a throwaway session in Reedwake with the synthetic towns (as tests/unit/town.test.mjs)
async function begin(p, o = {}) {
  await p.evaluate((o) => {
    const C = RB.content;
    const place = (map, char, cond, x, y, talk) => { const m = C.maps[map]; m.npcs = (m.npcs || []).filter((n) => (n.char || n.id) !== char); m.npcs.push({ id: char, char, x, y, if: cond, talk: talk || 'rw.tomo' }); };
    if (!o.plain) {
      place('rw.tea', 'tomo', 'slot.tomo=2', 4, 4);
      C.maps['rw.village'].npcs.push({ id: 'tomo', char: 'tomo', x: 30, y: 26, if: 'slot.tomo=1', talk: 'rw.tomo' });
      C.maps['rw.village'].npcs = C.maps['rw.village'].npcs.filter((n) => !((n.char || n.id) === 'tomo' && !n.if));
      place('sg.harbor', 'kiyo', 'slot.kiyo=1', 8, 8); place('sg.inn', 'kiyo', 'slot.kiyo=2', 4, 4);
      C.towns.tx = { name: { en: 'Reedwake', jp: '{葦|あし}ノ{瀬|せ}' }, maps: ['rw.village', 'rw.tea'], residents: { tomo: { slots: 2 } }, care: ['tx_story'], beats: [{ id: 'b1', when: 'tx_story' }] };
      C.towns.ty = { name: { en: 'Saltglass', jp: '{潮硝子|しおがらす}' }, maps: ['sg.harbor', 'sg.inn'], residents: { kiyo: { slots: 2 } } };
      C.relations.mame = { knows: { kiyo: 'loose', tomo: 'routine' } };
      // (a one-line greeting of the test's own, so the plain talk is easy to follow)
      if (!C.scenes['wbt.hello']) RB.script.add('@scene wbt.hello\nmame: こんにちは 。 || Hello.\n', 'test');
      for (const n of C.maps['rw.village'].npcs) if ((n.char || n.id) === 'mame') { n.asks = true; n.talk = 'wbt.hello'; }
      C.roadEvents.rx = { maps: ['rw.road'], unique: { id: 'u1', scene: 'wbt.hello', title: { en: 'A cart with a broken wheel', jp: '{車輪|しゃりん} の {壊|こわ}れた {荷車|にぐるま}' } }, variants: [] };
    }
    const s = RB.game.debugStart('rw.village', 22, 18, { flags: { departed: true, ch2_done: true } });
    s.edition = o.edition || 2;
    s.learn.kanaKnown = 'both';
    RB.game.settings.textSpeed = 'instant';
    RB.game.settings.townHints = 'on';
    RB.game.applySettings();
  }, o);
  await p.waitForTimeout(400);
}
// press through dialogue until a choice appears (resolves its labels) or the world is back (null)
async function untilChoice(p) {
  for (let i = 0; i < 200; i++) {
    const st = await p.evaluate(() => ({ ch: [...document.querySelectorAll('.choice')].map((b) => b.textContent.replace(/\s+/g, ' ').trim()), dlg: RB.ui.dialogue.isOpen(), mode: RB.game.mode(), run: RB.script.isRunning() }));
    if (st.ch.length) return st.ch;
    if (st.dlg) await p.evaluate(() => RB.ui.dialogue.advance(true));
    else if (!st.run && st.mode === 'world') return null;
    await p.waitForTimeout(60);
  }
  throw new Error('neither a choice nor the world');
}
// run fn in the page while pressing through whatever it says (a road event, a greeting): Never mind to any menu
async function drive(p, fn, arg) {
  let done = false, err = null;
  const run = p.evaluate(fn, arg).then(() => { done = true; }, (e) => { done = true; err = e; });
  for (let i = 0; i < 600 && !done; i++) {
    await p.evaluate(() => {
      const c = [...document.querySelectorAll('.choice')];
      if (c.length) (c.find((b) => /Never mind/.test(b.textContent)) || c[0]).click();
      else if (RB.ui.dialogue.isOpen()) RB.ui.dialogue.advance(true);
    });
    await p.waitForTimeout(80);
  }
  await run;
  if (err) throw err;
}
// face Mame and talk, without waiting for the conversation (the test presses through it)
const talkMame = (p) => p.evaluate(() => { const n = RB.world.W.npcs.find((a) => a.id === 'mame'); RB.test.place(n.x + 1, n.y, 'left'); RB.world.interact(); });
async function pick(p, re) {
  await p.waitForTimeout(150); // (a press from before the replies appeared is ignored)
  const ok = await p.evaluate((m) => { const c = [...document.querySelectorAll('.choice')].find((b) => new RegExp(m, 'i').test(b.textContent)); if (c) c.click(); return !!c; }, re);
  assert(ok, 'no choice matching ' + re);
}
// the lines said, in order, until the world is back
async function lines(p) {
  const out = [];
  for (let i = 0; i < 200; i++) {
    const st = await p.evaluate(() => ({ cur: RB.ui.dialogue.isOpen() ? RB.ui.dialogue.shown() : null, mode: RB.game.mode(), run: RB.script.isRunning(), ch: !!document.querySelector('.choice') }));
    if (st.ch) throw new Error('an unexpected choice');
    if (st.cur) { if (!out.length || out[out.length - 1].en !== st.cur.en) out.push(st.cur); await p.evaluate(() => RB.ui.dialogue.advance(true)); }
    else if (!st.run && st.mode === 'world') return out;
    await p.waitForTimeout(60);
  }
  throw new Error('the conversation did not end');
}

await test('nobody to ask about: talking is plain talking; then "Have you seen…?" asks, answers in both languages, and leaves a note', async () => {
  const { p, errors, requests, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await begin(p);
  await p.evaluate(() => { RB.game.s.world.lastSeen = {}; });
  await talkMame(p);
  const first = await untilChoice(p);
  assert(first === null, 'no menu with nobody to ask about: ' + JSON.stringify(first));
  // someone you have seen
  await p.evaluate(() => RB.town.seen(RB.game.s, 'kiyo', 'sg.harbor'));
  await talkMame(p);
  const menu = await untilChoice(p);
  assert(menu && menu.length === 3 && /Talk/.test(menu[0]) && /Have you seen/.test(menu[1]) && /Never mind/.test(menu[2]), 'the menu: ' + JSON.stringify(menu));
  await pick(p, 'Have you seen');
  const people = await untilChoice(p);
  assert(people && people.some((x) => /Kiyo/.test(x)) && /Never mind/.test(people[people.length - 1]), 'the people you know of: ' + JSON.stringify(people));
  await pick(p, 'Kiyo');
  const said = await lines(p);
  assert(said.length === 2 && said[0].who === 'pc' && /Have you seen Kiyo/.test(said[0].en) && /キヨ/.test(said[0].jp), 'your question, in both languages: ' + JSON.stringify(said[0]));
  assert(said[1].who === 'mame' && /wouldn't swear/.test(said[1].en) && /{分|わ}かりません/.test(said[1].jp), 'an unsure recollection, from a loose acquaintance: ' + JSON.stringify(said[1]));
  const note = await p.evaluate(() => RB.game.s.world.notes.kiyo);
  assert(note && note.from === 'mame' && note.kind === 'uncertain', 'a note: ' + JSON.stringify(note));
  // Known details: People
  await p.evaluate(() => RB.ui.menu.open('known'));
  await p.waitForSelector('.kd-people');
  const kd = await p.evaluate(() => document.querySelector('.kd-people').textContent.replace(/\s+/g, ' '));
  assert(/Kiyo/.test(kd) && /You last saw them at/.test(kd) && /Not sure · Mame said/.test(kd), 'Known details › People: ' + kd);
  assert(await p.evaluate(() => /not where anyone is now/.test(document.querySelector('.kd-people').previousElementSibling.textContent)), 'said to be notes, not live');
  await p.evaluate(() => RB.ui.menu.close());
  // Never mind changes nothing
  await talkMame(p);
  await untilChoice(p);
  await pick(p, 'Never mind');
  assert((await lines(p)).length === 0, 'Never mind: nothing said');
  assert(!errors.length, 'no errors: ' + errors.join(' | '));
  assert(!requests.length, 'no network: ' + requests.join(' '));
  await ctx.close();
});

await test('routines move only on coming back: never while walking the town, never mid-conversation; then one new place', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await begin(p);
  const tick = () => p.evaluate(() => ((RB.game.s.world.towns.tx || {}).tick) || 0);
  assert(await p.evaluate(() => RB.world.W.npcs.some((n) => (n.def.char || n.id) === 'tomo')), 'Tomo starts in the square');
  // walking about, in and out of the teahouse, talking: nothing moves
  await drive(p, async () => { for (const d of ['left', 'left', 'up', 'right']) await RB.test.step(d); });
  await drive(p, async () => { await RB.test.go('rw.tea', 4, 7, 'up'); await RB.test.go('rw.village', 22, 18, 'down'); });
  await talkMame(p);
  const menu = await untilChoice(p);
  assert(menu && await tick() === 0, 'no tick while walking the town, nor in the middle of a conversation');
  await pick(p, 'Never mind');
  await lines(p);
  // two transitions away is not enough; three is
  const hellos = () => p.evaluate(() => RB.game.s.backlog.filter((l) => l.en === 'Hello.' && l.who === 'mame').length);
  const h0 = await hellos();
  await drive(p, async () => { await RB.test.go('rw.road', 5, 10); await new Promise((r) => setTimeout(r, 600)); await RB.test.idle(); });
  assert(await hellos() === h0 + 1, 'the road\'s first event, once on this visit (not again after it ends): ' + (await hellos() - h0));
  await drive(p, async () => { await RB.test.go('rw.village', 22, 18); });
  assert(await tick() === 0, 'two transitions away: no tick');
  await drive(p, async () => { await RB.test.go('rw.road', 5, 10); await RB.test.go('sg.road', 5, 10); await RB.test.go('rw.road', 5, 10); await RB.test.go('rw.village', 22, 18); });
  assert(await tick() === 1, 'back after three away: one tick, on the transition');
  const where = await p.evaluate(() => ({ slot: RB.town.slotOf(RB.game.s, 'tomo'), here: RB.world.W.npcs.some((n) => (n.def.char || n.id) === 'tomo'), maps: RB.world.mapsWith('tomo') }));
  assert(where.slot === 2 && !where.here && where.maps.length === 1 && where.maps[0] === 'rw.tea', 'Tomo is in one new place, the teahouse: ' + JSON.stringify(where));
  await drive(p, async () => { await RB.test.go('rw.tea', 4, 7, 'up'); });
  assert(await p.evaluate(() => RB.world.W.npcs.some((n) => (n.def.char || n.id) === 'tomo')), 'and is found there');
  assert(!errors.length, 'no errors: ' + errors.join(' | '));
  await ctx.close();
});

await test('the Journey: one line for a changed town (and Settings turning it off), and a road event left unfinished; phone width', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 390, height: 844 }, mobile: true, touch: true });
  await begin(p);
  await p.evaluate(() => { const s = RB.game.s; s.flags.tx_story = true; RB.town.rec(s).roads.rx = { unique: 'offered', solved: {}, offered: 1 }; });
  await p.evaluate(() => RB.ui.menu.open('journey'));
  await p.waitForTimeout(300);
  const txt = await p.evaluate(() => document.querySelector('.folio').textContent.replace(/\s+/g, ' '));
  assert(/Places/.test(txt) && /Reedwake has changed since you were last there\./.test(txt), 'the changed town: ' + txt.slice(0, 600));
  assert(/Unfinished on The Lantern Road: A cart with a broken wheel/.test(txt), 'the unfinished road event');
  assert(await noOverflow(p), 'no horizontal overflow at phone width');
  await p.evaluate(() => { RB.ui.menu.close(); RB.game.settings.townHints = 'off'; RB.ui.menu.open('journey'); });
  await p.waitForTimeout(300);
  const off = await p.evaluate(() => document.querySelector('.folio').textContent.replace(/\s+/g, ' '));
  assert(!/has changed since/.test(off) && /Unfinished on/.test(off), 'turned off: no town line (the unfinished event stays)');
  await p.evaluate(() => RB.ui.menu.close());
  // back in the town: the beat is seen
  await drive(p, async () => { RB.game.settings.townHints = 'on'; await RB.test.go('rw.road', 5, 10); await RB.test.go('rw.village', 22, 18); });
  assert(await p.evaluate(() => RB.town.changed(RB.game.s).length === 0), 'seen once you are back');
  assert(!errors.length, 'no errors: ' + errors.join(' | '));
  await ctx.close();
});

await test('a six-chapter journey keeps no record of where you saw people, and shows no Places or People', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await begin(p, { plain: true, edition: 1 });
  await drive(p, async () => { await RB.test.go('rw.road', 5, 10); await RB.test.go('rw.village', 22, 18); await RB.test.go('rw.tea', 4, 7, 'up'); });
  const w = await p.evaluate(() => RB.game.s.world);
  assert(Object.keys(w.lastSeen).length === 0 && Object.keys(w.towns).length === 0, 'nothing recorded: ' + JSON.stringify(w));
  await p.evaluate(() => RB.ui.menu.open('journey'));
  await p.waitForTimeout(250);
  assert(!(await p.evaluate(() => /Places/.test([...document.querySelectorAll('.folio h3')].map((h) => h.textContent).join('|')))), 'no Places in the Journey');
  await p.evaluate(() => { RB.ui.menu.close(); RB.ui.menu.open('known'); });
  await p.waitForTimeout(250);
  assert(!(await p.evaluate(() => !!document.querySelector('.kd-people'))), 'no People in Known details');
  assert(!errors.length, 'no errors: ' + errors.join(' | '));
  await ctx.close();
});

await b.close();
srv.close();
console.log(pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
