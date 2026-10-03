// Quick travel: where the Map tab's Travel list works, and what it says where
// it doesn't (owner report, Chapter 2: on the Fishers' Cove the list only said
// "Step outside first", with no buttons). Through the real Map tab of the
// built index.html, at 1280×800 and at 390×844, in fresh synthetic campaigns
// (RB.game.debugStart; never a player's save):
// - out in the open (the Fishers' Cove, a beach with crabs and wisps): the
//   Travel buttons are there, a real click on Reedwake takes you there — the
//   companion and the pet arrive with you, the checkpoint moves and an
//   autosave is asked for, as from any other outdoor map — and the region
//   marker says where you are, before and after;
// - inside a building: the message names the building and says to step
//   outside (a one-door hut: "through the door"; an inn with a staircase:
//   where the way out leads; an inn you cannot leave just now: says so);
// - inside a dungeon: the message names the dungeon and where the way out
//   leads, following the exits open in this campaign;
// - on a story-locked map: its authored reason;
// - during a conversation (the History button opens the folio over it):
//   no Travel buttons, and the list says why; once the conversation is over
//   they are back. (Before this change the buttons were offered there on any
//   outdoor map, and a click left the conversation running in another town.)
// Wherever travel is unavailable the known places stay listed, with their
// descriptions. Usage: node tests/e2e/travel_rules.mjs [filter]
import { serve, launch, page } from './lib.mjs';

const only = process.argv[2];
const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
async function test(name, fn) {
  if (only && !name.includes(only)) return;
  try { await Promise.race([fn(), new Promise((_, rej) => setTimeout(() => rej(new Error('timed out after 90s')), 90000))]); pass++; console.log('PASS ' + name); }
  catch (e) { fail++; console.log('FAIL ' + name + ': ' + String(e && e.message || e).slice(0, 500)); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };
const VIEWS = [[1280, 800], [390, 844]];
// Chapter 2 under way, the cove found; Reedwake and Saltglass known
const CH2 = { rw_arrived: true, rw_road_lit: true, ch1_done: true, departed: true, sg_arrived: true, sg_harbor_seen: true, sg_cove_open: true, sg_cove_seen: true, 'enter:rw.village:rw.village_first': true };

async function start(p, map, x, y, flags, extra) {
  await p.evaluate(async ([map, x, y, flags, extra]) => {
    const s = RB.game.debugStart(map, x, y, { comp: 'mio', flags, dir: 'down' });
    RB.game.settings.textSpeed = 'instant';
    s.travel = extra.travel || { reedwake: true, saltglass: true };
    if (extra.pet) { RB.pets.meet(s, extra.pet); RB.pets.select(s, extra.pet); }
    await new Promise((r) => setTimeout(r, 300));
    for (let i = 0; i < 60 && RB.ui.dialogue.isOpen(); i++) { RB.ui.dialogue.advance(true); await new Promise((r) => setTimeout(r, 30)); }
  }, [map, x, y, flags, extra || {}]);
}
// open the Map tab the way a player does (M in the world)
async function openMap(p) {
  await p.keyboard.press('m');
  await p.waitForFunction(() => RB.ui.menu.isOpen() && RB.ui.menu.current().section === 'map', null, { timeout: 5000 });
  await p.waitForTimeout(150);
}
async function closeMenu(p) { await p.evaluate(() => RB.ui.menu.close()); await p.waitForTimeout(100); }
// what the Travel list shows: its notice, its entries (with descriptions and marks), its buttons
async function travelList(p) {
  return p.evaluate(() => {
    const h = [...document.querySelectorAll('.folio h3')].find((x) => /Travel\s*\d+ known/.test(x.textContent));
    if (!h) return null;
    const box = h.parentElement;
    const note = h.nextElementSibling && h.nextElementSibling.matches('p.note-slip') ? h.nextElementSibling : null;
    const entries = [...box.querySelectorAll('.entries .entry')].map((li) => ({
      name: (li.querySelector('.t .en') || {}).textContent || '',
      desc: (li.querySelector('.muted.small') || {}).textContent || '',
      here: /you are in this region/.test(li.textContent),
      go: li.querySelector('[data-go]') ? li.querySelector('[data-go]').dataset.go : null,
    }));
    return { note: note ? note.textContent.replace(/\s+/g, ' ').trim() : '', kind: note ? note.dataset.kind || '' : '', entries, buttons: box.querySelectorAll('[data-go]').length };
  });
}
const listedWithDescs = (L) => L.entries.length === 2 && L.entries.every((e) => e.desc.length > 10) && L.buttons === 0;

for (const [w, h] of VIEWS) {
  const tag = ' (' + w + '×' + h + ')';

  await test('out in the open: the Fishers\' Cove has Travel, and a real click takes you to Reedwake' + tag, async () => {
    const { p, ctx, errors } = await page(b, url, { viewport: { width: w, height: h } });
    await start(p, 'sg.cove', 3, 8, CH2, { pet: 'cat' });
    await p.evaluate(() => { window.__autos = []; const real = RB.save.autosave; RB.save.autosave = (k) => { window.__autos.push(k); return real(k); }; });
    await openMap(p);
    const L = await travelList(p);
    assert(L, 'the Travel list is shown');
    assert(L.buttons === 2 && L.entries.every((e) => e.go), 'a Travel button for each known place on the cove (got ' + L.buttons + '; notice: "' + L.note + '")');
    assert(!L.note, 'no notice above the list when travel works (got "' + L.note + '")');
    assert(L.entries.find((e) => e.name === 'Saltglass').here && !L.entries.find((e) => e.name === 'Reedwake').here, 'the cove is marked as the Saltglass region');
    // a real click (scrolled into view on the phone)
    await p.click('[data-go="reedwake"]');
    await p.waitForFunction(() => RB.world.W.map && RB.world.W.map.id === 'rw.village', null, { timeout: 8000 });
    // arriving runs Reedwake's arrival scenes as any arrival does (this synthetic campaign has not seen them): read them through
    await p.evaluate(async () => {
      for (let i = 0; i < 300 && RB.game.mode() !== 'world'; i++) {
        const c = document.querySelector('.choices:not(.hidden) button');
        if (c) c.click(); else if (RB.ui.dialogue.isOpen()) RB.ui.dialogue.advance(true);
        await new Promise((r) => setTimeout(r, 40));
      }
    });
    await p.waitForFunction(() => RB.game.mode() === 'world' && !RB.script.isRunning(), null, { timeout: 8000 });
    await p.waitForTimeout(700);
    const at = await p.evaluate(() => {
      const W = RB.world.W, s = RB.game.s, pet = RB.petWorld.state(), pl = RB.content.places.reedwake;
      return { map: W.map.id, x: W.player.x, y: W.player.y, want: [pl.x, pl.y], comp: W.comp && W.comp.id, compNear: W.comp ? Math.abs(W.comp.x - W.player.x) + Math.abs(W.comp.y - W.player.y) : -1,
        pet: { map: pet.map, shown: pet.shown, near: Math.abs(pet.x - W.player.x) + Math.abs(pet.y - W.player.y) }, cp: s.checkpoint, autos: window.__autos.slice(), menu: RB.ui.menu.isOpen() };
    });
    assert(at.x === at.want[0] && at.y === at.want[1], 'arrived on Reedwake\'s travel tile ' + at.want + ' (got ' + at.x + ',' + at.y + ')');
    assert(at.comp === 'mio' && at.compNear >= 0 && at.compNear <= 1, 'the companion arrives beside you (' + at.comp + ', ' + at.compNear + ' away)');
    assert(at.pet.map === 'rw.village' && at.pet.shown && at.pet.near <= 4, 'the pet arrives with you ' + JSON.stringify(at.pet));
    assert(at.cp && at.cp.map === 'rw.village' && at.cp.x === at.x && at.cp.y === at.y, 'the checkpoint moves to the arrival, as from any outdoor map ' + JSON.stringify(at.cp));
    assert(at.autos.includes('auto'), 'an autosave is asked for on arrival (' + at.autos + '; a synthetic campaign has no slot, so nothing is written)');
    assert(!at.menu, 'the folio is closed after travelling');
    await openMap(p);
    const L2 = await travelList(p);
    assert(L2.entries.find((e) => e.name === 'Reedwake').here && L2.buttons === 2, 'in Reedwake: marked as here, Travel still offered');
    assert(!errors.length, 'page errors: ' + errors.join('; '));
    await ctx.close();
  });

  await test('inside a building: the message names it and says to step outside' + tag, async () => {
    const { p, ctx, errors } = await page(b, url, { viewport: { width: w, height: h } });
    await start(p, 'sg.tidehut', 4, 6, CH2);
    await openMap(p);
    let L = await travelList(p);
    assert(L.note === 'You\'re inside the Tide-Watch Hut. Step out through the door to travel.', 'a one-door hut: "' + L.note + '"');
    assert(listedWithDescs(L), 'the known places stay listed with their descriptions, without buttons ' + JSON.stringify(L.entries));
    await closeMenu(p);
    // an inn with a staircase as well as its door: where the way out leads
    await start(p, 'sb.inn', 8, 9, Object.assign({}, CH2, { ch2_done: true, ch3_done: true, sb_lamp_lit: true }));
    await openMap(p);
    L = await travelList(p);
    assert(L.note === 'You\'re inside the Yukimiya Inn. Step outside to travel — the nearest way out leads to Snowbell.', 'two ways out: "' + L.note + '"');
    await closeMenu(p);
    // the same inn while the storm keeps everyone in: no way out just now
    await start(p, 'sb.inn', 8, 9, Object.assign({}, CH2, { ch2_done: true, ch3_done: true, sb_storm: true }));
    await openMap(p);
    L = await travelList(p);
    assert(L.note === 'You\'re inside the Yukimiya Inn, and there\'s no way out just now. Travel works again once you can step outside.', 'no way out now: "' + L.note + '"');
    assert(L.buttons === 0, 'no Travel buttons');
    assert(!errors.length, 'page errors: ' + errors.join('; '));
    await ctx.close();
  });

  await test('inside a dungeon: the message names the dungeon and the way out' + tag, async () => {
    const { p, ctx, errors } = await page(b, url, { viewport: { width: w, height: h } });
    await start(p, 'sg.da_stacks', 14, 19, Object.assign({}, CH2, { sg_tide_low: true, sg_da_seen: true, sg_da_catalog: true }));
    await openMap(p);
    const L = await travelList(p);
    assert(L.note === 'You\'re in the Drowned Archive. Travel works again once you\'re back out in the open — the way out leads to Saltglass.', 'the Drowned Archive: "' + L.note + '"');
    assert(listedWithDescs(L), 'the known places stay listed with their descriptions, without buttons ' + JSON.stringify(L.entries));
    assert(!errors.length, 'page errors: ' + errors.join('; '));
    await ctx.close();
  });

  await test('a story-locked map shows its authored reason' + tag, async () => {
    const { p, ctx, errors } = await page(b, url, { viewport: { width: w, height: h } });
    await start(p, 'co.festival', 23, 17, Object.assign({}, CH2, { ch2_done: true, co_firebreak_cut: true }), { travel: { reedwake: true, saltglass: true, cinder: true } });
    await openMap(p);
    const L = await travelList(p);
    const why = await p.evaluate(() => RB.content.maps['co.festival'].noTravelWhy && RB.content.maps['co.festival'].noTravelWhy.en);
    assert(why && L.note === why, 'the festival\'s own reason: "' + L.note + '" (authored: "' + why + '")');
    assert(L.entries.length === 3 && L.buttons === 0, 'places listed, no buttons');
    assert(!errors.length, 'page errors: ' + errors.join('; '));
    await ctx.close();
  });

  await test('during a conversation the folio cannot travel; afterwards it can' + tag, async () => {
    const { p, ctx, errors } = await page(b, url, { viewport: { width: w, height: h } });
    // (the harbour square: a map where travel has always worked, reading the noticeboard)
    await start(p, 'sg.harbor', 20, 22, CH2);
    await p.evaluate(() => { RB.script.run('sg.notice'); });
    await p.waitForFunction(() => RB.ui.dialogue.isOpen(), null, { timeout: 5000 });
    await p.waitForTimeout(200);
    // the History button opens the folio over the conversation; then the Map tab, by real clicks
    await p.click('.b-log');
    await p.waitForFunction(() => RB.ui.menu.isOpen(), null, { timeout: 5000 });
    await p.click('#tab-map');
    await p.waitForFunction(() => RB.ui.menu.current().section === 'map', null, { timeout: 5000 });
    await p.waitForTimeout(150);
    const L = await travelList(p);
    const modes = await p.evaluate(() => RB.game.G.modes.join('>'));
    assert(L.buttons === 0, 'no Travel buttons over a conversation (modes ' + modes + ', ' + L.buttons + ' buttons)');
    assert(L.note === 'A conversation is under way. Travel works again once it\'s over.', 'and it says why: "' + L.note + '"');
    await closeMenu(p);
    await p.evaluate(async () => { for (let i = 0; i < 80 && (RB.ui.dialogue.isOpen() || RB.script.isRunning()); i++) { RB.ui.dialogue.advance(true); await new Promise((r) => setTimeout(r, 40)); } });
    await p.waitForFunction(() => RB.game.mode() === 'world', null, { timeout: 5000 });
    await openMap(p);
    const L2 = await travelList(p);
    assert(L2.buttons === 2 && !L2.note, 'once it is over, Travel is back (' + L2.buttons + ', "' + L2.note + '")');
    assert(!errors.length, 'page errors: ' + errors.join('; '));
    await ctx.close();
  });
}

console.log(`\n${pass} passed, ${fail} failed`);
await b.close();
srv.close();
process.exit(fail ? 1 : 0);
