// The addendum's systems together in the built game, where no single worker's test reaches (§23.2, §23.3):
// A. a pet through a ladder and a stairway — the Reedwake mill's real ladder and stairs scenes, which warp
//    to another floor: it arrives with you on a floor tile, is drawn, and never blocks a tile or starts
//    a scene (the world's blocking is exactly the map's own);
// B. slot isolation with real IndexedDB saves: two campaigns (Nao with a cat, bond and records; Mio with no
//    animal and nothing kept) are saved to two slots and loaded one after the other; each shows only its
//    own Company, animal, keepsakes, kept sentences and creatures — nothing is carried across by a
//    module's memory. Synthetic campaigns in a fresh browser profile (never a player's saves).
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let fail = 0;
const assert = (c, m) => { if (!c) { fail++; console.log('FAIL ' + m); } else console.log('ok   ' + m); };
const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
const wait = (ms) => p.waitForTimeout(ms);

// ---- A. ladder and stairs -------------------------------------------------------------------------------------------------
await p.evaluate(() => {
  const flags = { departed: false, rw_gears: true, rw_arrived: true, rw_echo_done: false };
  for (const id of ['rw.mill1', 'rw.mill2', 'rw.mill0']) for (const ev of RB.content.maps[id].onEnter || []) flags['enter:' + id + ':' + ev.scene] = true;
  const s = RB.game.debugStart('rw.mill1', 3, 3, { comp: 'mio', dir: 'up', flags });
  s.seen['rw.m1_enter'] = true;
  RB.game.settings.textSpeed = 'instant';
  // this check is about getting between floors: the floors' creatures are sent away as each floor is entered
  const calm = () => { if (RB.world.W && RB.world.W.foes) RB.world.W.foes.length = 0; };
  calm(); RB.bus.on('map:enter', calm);
  RB.pets.meet(s, 'cat', { map: 'rw.village' }); RB.pets.select(s, 'cat');
});
await wait(600);
const petAt = () => p.evaluate(() => {
  const W = RB.world.W, P = RB.petWorld.state();
  return { map: W.map.id, shown: P.shown, x: P.x, y: P.y, px: W.player.x, py: W.player.y, floor: !RB.maps.blockedStatic(W.map, P.x, P.y), blocks: RB.world.blocked(P.x, P.y, {}) !== RB.maps.blockedStatic(W.map, P.x, P.y), running: RB.script.isRunning(), trig: (W.map.triggers || []).some((t) => t.x === P.x && t.y === P.y) };
});
async function settleOn(map) {
  for (let i = 0; i < 60; i++) { const q = await petAt(); if (q.map === map && !q.running && q.shown) break; await wait(100); }
  // walk a step so the animal catches up as in play (it follows the party's trail)
  for (const k of ['ArrowRight', 'ArrowLeft']) { await p.keyboard.down(k); await wait(240); await p.keyboard.up(k); await wait(260); }
  await wait(900);
  return petAt();
}
await p.evaluate(() => RB.test.use(2, 2)); // the ladder up to the loft
let q = await settleOn('rw.mill2');
assert(q.map === 'rw.mill2' && q.shown, 'up the ladder: the cat arrives on the loft with you (' + JSON.stringify(q) + ')');
assert(q.floor && !(q.x === q.px && q.y === q.py) && Math.abs(q.x - q.px) + Math.abs(q.y - q.py) <= 4, 'on a floor tile near you, never on your tile');
assert(!q.blocks && !q.trig, 'it blocks nothing and stands on no trigger');
await p.evaluate(() => RB.test.go('rw.mill1', 11, 8, 'down'));
await wait(500);
await p.evaluate(() => RB.test.use(12, 9)); // the stairs down to the wheel pit
q = await settleOn('rw.mill0');
assert(q.map === 'rw.mill0' && q.shown && q.floor && !q.blocks && !q.trig && !(q.x === q.px && q.y === q.py), 'down the stairs: the same (' + JSON.stringify(q) + ')');
// turning back over the trail (two steps on, one back): it never ends up on your tile or your
// companion's, and it does not shuffle back and forth once you stand still
for (const d of ['right', 'right', 'left']) await p.evaluate((d) => RB.test.step(d), d);
await wait(1200);
const samples = [];
for (let i = 0; i < 10; i++) { samples.push(await p.evaluate(() => { const W = RB.world.W, P = RB.petWorld.state(); return { pet: P.x + ',' + P.y, pc: W.player.x + ',' + W.player.y, comp: W.comp ? W.comp.x + ',' + W.comp.y : null, moves: P.stats.moves }; })); await wait(200); }
const onSomeone = samples.filter((q) => q.pet === q.pc || q.pet === q.comp);
const moved = samples[samples.length - 1].moves - samples[0].moves;
assert(!onSomeone.length && moved === 0, 'after turning back it rests beside you, not on you or your companion, and stays put (' + JSON.stringify(samples[samples.length - 1]) + ', moves while standing: ' + moved + ')');
const pitSeen = await p.evaluate(() => Object.keys(RB.game.s.seen).filter((k) => /pet/.test(k)));
assert(!pitSeen.length, 'no pet scene was started by walking through (' + pitSeen.join(', ') + ')');

// ---- B. slot isolation ------------------------------------------------------------------------------------------------------
const slots = await p.evaluate(async () => {
  const A = RB.game.debugStart('rw.village', 22, 30, { comp: 'nao', flags: { departed: true, ch1_done: true, rw_echo_done: true, ch2_done: true } });
  A.player.name = 'Slot One';
  RB.pets.meet(A, 'cat', { map: 'rw.village' }); RB.pets.select(A, 'cat'); A.company.pets.cat.name = 'ミケ';
  RB.company.sync(A, 'live');
  RB.discovery.keepsake(A, Object.keys(RB.content.keepsakes)[0], { how: 'test' });
  A.backlog.push({ who: 'nao', jp: '{行|い}こう 。', en: "Let's go." });
  RB.bookmarks.keep(A, A.backlog[A.backlog.length - 1]);
  RB.creatures.meet(A, ['rw.dustmoth'], { where: { map: 'rw.millroad' } });
  await RB.save.writeSlot(1, A, { force: true });
  const B = RB.game.debugStart('sg.harbor', 20, 22, { comp: 'mio', flags: { departed: true, ch1_done: true, rw_echo_done: true, sg_arrived: true } });
  B.player.name = 'Slot Two';
  RB.company.sync(B, 'live');
  await RB.save.writeSlot(2, B, { force: true });
  return { a: { bond: Object.keys(A.company.bond).length, mem: A.company.memories.length }, b: { bond: Object.keys(B.company.bond).length, mem: B.company.memories.length } };
});
async function loadAndRead(slot) {
  await p.evaluate(async (slot) => { await RB.game.loadCampaign(slot); }, slot);
  await wait(900);
  for (let i = 0; i < 40 && (await p.evaluate(() => RB.script.isRunning() || RB.ui.dialogue.isOpen())); i++) { await p.evaluate(() => RB.ui.dialogue.isOpen() && RB.ui.dialogue.advance(true)); await wait(80); }
  await p.evaluate(() => RB.ui.menu.open('companion'));
  await p.waitForSelector('.co-page');
  await wait(200);
  const r = await p.evaluate(() => {
    const s = RB.game.s;
    return {
      name: s.player.name, comp: s.comp, pet: RB.pets.active(s), petShown: RB.petWorld.state().shown, pets: Object.keys(s.company.pets),
      bond: Object.keys(s.company.bond).length, mem: s.company.memories.length, keeps: Object.keys(s.discovery.keepsakes).length,
      kept: (s.bookmarks || []).length, met: RB.creatures.met(s).length,
      page: document.querySelector('.folio').textContent.replace(/\s+/g, ' '),
    };
  });
  await p.evaluate(() => RB.ui.menu.close());
  await wait(200);
  return r;
}
const one = await loadAndRead(1);
const two = await loadAndRead(2);
const again = await loadAndRead(1);
assert(one.name === 'Slot One' && one.comp === 'nao' && one.pet === 'cat' && one.petShown && one.keeps === 1 && one.kept === 1 && one.met === 1 && one.mem === slots.a.mem && one.bond === slots.a.bond, 'slot 1 loads its own campaign: Nao, the cat, a keepsake, a kept sentence, a creature, its bond and memories (' + JSON.stringify(Object.assign({}, one, { page: undefined })) + ')');
assert(/Nao/.test(one.page) && /ミケ/.test(one.page), 'its Company shows Nao and ミケ');
assert(two.name === 'Slot Two' && two.comp === 'mio' && !two.pet && !two.petShown && !two.pets.length && two.keeps === 0 && two.kept === 0 && two.met === 0 && two.mem === slots.b.mem && two.bond === slots.b.bond, 'slot 2 after it: Mio, no animal, nothing kept — nothing carried over from slot 1 (' + JSON.stringify(Object.assign({}, two, { page: undefined })) + ')');
assert(/Mio/.test(two.page) && !/ミケ/.test(two.page) && !/Nao/.test(two.page.replace(/Nao's|Nao and/g, '')), 'its Company shows Mio and no animal');
assert(JSON.stringify(Object.assign({}, again, { page: 0 })) === JSON.stringify(Object.assign({}, one, { page: 0 })), 'slot 1 again reads exactly as before');

assert(!errors.length, 'no page errors: ' + errors.join('; '));
await b.close(); srv.close();
console.log(fail ? fail + ' failed' : 'all ok');
process.exit(fail ? 1 : 0);
