// Map › Known details (addendum §18.2, §18.3) in the BUILT index.html:
// details appear only once discovered, say what is known, and change state
// with the game (a solved mechanism loses its question mark; a found shortcut
// reads "barred" until opened); the existing shortcuts are labelled; records
// from other systems follow `world:changed`; player pins — four kinds, a
// plain-text note of at most 200 characters, edit, remove, at most 20 per map
// with the limit shown before anything could be lost — survive a save/load;
// markup in a note is shown as text; the page works on a phone; no errors.
// Screenshots: tests/e2e/out/known/.
// Usage: node tests/e2e/known.mjs
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';
import { install } from './drive.mjs';

const OUT = path.join(root, 'tests/e2e/out/known');
fs.mkdirSync(OUT, { recursive: true });
let fails = 0;
const say = (ok, m) => { if (!ok) fails++; console.log((ok ? 'ok   ' : 'FAIL ') + m); };
const FX = {
  rw_arrived: true, rw_road_lit: true, rw_met_tsuru: true, rw_mill_open: true, rw_echo_done: true, bridge_fixed: true, rw_koji_back: true,
  rw_evening: true, rw_hall_gather: true, departed: true, ch1_done: true, rw_letters_done: true,
  sg_arrived: true, sg_harbor_seen: true, sg_boss_done: true, sg_returned: true, sg_main_done: true, sg_road_open_seen: true, ch2_done: true,
  co_restored: true, ch3_done: true, sb_arrived: true, sb_lamp_lit: true, ch4_done: true, sb_path_seen: true, sb_stair_open: true,
};
async function setup(p, map, x, y) {
  await p.evaluate(install);
  await p.evaluate(async ([FX, map, x, y]) => {
    RB.test.enable({ battle: 'unravel', choose: () => 0 });
    const s = RB.game.debugStart(map, x, y, { comp: 'ren', profile: 'E', flags: FX, dir: 'down' });
    s.chapter = 5;
    for (const pl in RB.content.places) s.travel[pl] = true;
    for (const id in RB.content.maps) for (const ev of RB.content.maps[id].onEnter || []) s.flags['enter:' + id + ':' + ev.scene] = true;
    RB.game.settings.textSpeed = 'instant';
    await RB.test.idle(60000);
    RB.test.disable();
  }, [FX, map, x, y]);
}
const openKnown = async (p) => { await p.evaluate(() => { if (RB.ui.menu.isOpen()) RB.ui.menu.close(); RB.ui.menu.open('known'); }); await p.waitForTimeout(300); };
const rows = (p) => p.evaluate(() => [...document.querySelectorAll('#folio-page .kd-list li')].map((li) => li.textContent.replace(/\s+/g, ' ').trim()));
const shot = async (p, name) => { await p.evaluate(() => document.querySelectorAll('.notice,.toast').forEach((n) => n.remove())); await p.screenshot({ path: path.join(OUT, name + '.png') }); };

const { srv, url } = await serve();
const b = await launch();
{
  const { p, ctx, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await setup(p, 'lf.tower_upper', 10, 8);
  await openKnown(p);
  let r = await rows(p);
  say(r.length === 0 || !r.some((t) => /gate/i.test(t)), 'nothing about the gates before they are found: ' + JSON.stringify(r));
  // discovered: the plate was read
  await p.evaluate(() => { RB.game.s.seen['lf.plate_a'] = true; RB.ui.menu.close(); RB.ui.menu.open('known'); });
  await p.waitForTimeout(250);
  r = await rows(p);
  say(r.some((t) => /Unexplained/.test(t) && /Two gate wheels/.test(t)), 'found: the gate wheels, unexplained: ' + r.join(' | '));
  await p.evaluate(() => { RB.game.s.flags.lf_up_closed = true; RB.ui.menu.close(); RB.ui.menu.open('known'); });
  await p.waitForTimeout(250);
  r = await rows(p);
  say(r.some((t) => /Upper gate \(west wheel\) closed/.test(t)), 'the state follows the world (upper gate closed): ' + r.join(' | '));
  await p.evaluate(() => { RB.game.s.flags.lf_gate_a = true; RB.ui.menu.close(); RB.ui.menu.open('known'); });
  await p.waitForTimeout(250);
  r = await rows(p);
  say(r.some((t) => /Solved/.test(t) && /Lower gate open/.test(t)) && !r.some((t) => /Unexplained/.test(t) && /gate/i.test(t)), 'solved: no question mark left: ' + r.join(' | '));
  const shapes = await p.evaluate(() => [...document.querySelectorAll('#folio-page .kd-list .kd-sym svg')].map((s) => s.getAttribute('aria-label')));
  say(shapes.includes('Solved'), 'the mark is a shape with a name, not a colour: ' + shapes.join(','));
  await shot(p, 'known_tower_solved_1280x800');
  // a shortcut, labelled from the side it is found, then opened
  await p.evaluate(async () => { RB.ui.menu.close(); await RB.game.transition('lf.tower_top', 7, 8, 'up'); RB.game.s.seen['lf.trapdoor'] = true; RB.ui.menu.open('known'); });
  await p.waitForTimeout(500);
  r = await rows(p);
  say(r.some((t) => /Barred/.test(t) && /trapdoor fastened from below/.test(t)), 'shortcut found from the far side: barred: ' + r.join(' | '));
  await p.evaluate(() => { RB.game.s.flags.lf_shortcut = true; RB.ui.menu.close(); RB.ui.menu.open('known'); });
  await p.waitForTimeout(250);
  r = await rows(p);
  say(r.some((t) => /Opened/.test(t) && /rope ladder down/.test(t)), 'the same place, once opened: ' + r.join(' | '));
  // records from other systems (D1's puzzles emit world:changed)
  await p.evaluate(() => {
    RB.bus.emit('world:changed', { map: 'lf.tower_top', prop: 'test_panel', state: 'question', label: { en: 'A loose panel that rattles in the draught' }, x: 3, y: 3 });
    RB.bus.emit('world:changed', { map: 'lf.tower_top', prop: 'test_panel', state: 'solved' });
    RB.ui.menu.close(); RB.ui.menu.open('known');
  });
  await p.waitForTimeout(250);
  r = await rows(p);
  say(r.some((t) => /Solved/.test(t) && /loose panel/.test(t)), 'a detail recorded by another system follows world:changed: ' + r.join(' | '));
  // ---- pins through the page ----
  const click = async (sel) => { await p.click('#folio-page ' + sel); await p.waitForTimeout(150); };
  await click('[data-k="new"]');
  await click('input[name="kd-type"][value="view"]');
  const long = '<img src=x onerror="window.__pwned=1"> ' + 'あ'.repeat(230);
  await p.fill('#folio-page textarea[data-k="note"]', long);
  await p.waitForTimeout(100);
  const warn = await p.evaluate(() => document.querySelector('#folio-page .cs-count').textContent);
  say(/only the first 200 characters will be kept/.test(warn), 'the limit is shown before saving: ' + warn);
  const before = await p.evaluate(() => { const f = RB.ui.known.V.form; return [f.x, f.y]; });
  await click('[data-k="mv"][data-d="1,0"]');
  await click('[data-k="mv"][data-d="0,1"]');
  const after = await p.evaluate(() => { const f = RB.ui.known.V.form; return [f.x, f.y]; });
  say(after[0] === before[0] + 1 && after[1] === before[1] + 1, 'the pin can be moved with buttons (keyboard) ' + before + ' → ' + after);
  await click('[data-k="save"]');
  const pin = await p.evaluate(() => { const q = RB.known.pins(RB.game.s, 'lf.tower_top')[0]; return q && Object.assign({ len: RB.cases.graphemes(q.note).length }, q); });
  say(pin && pin.type === 'view' && pin.len === 200, 'pin placed: kind View, note cut to 200 (' + (pin && pin.len) + ')');
  const safe = await p.evaluate(() => ({ img: !!document.querySelector('#folio-page .kd-note img'), pw: !!window.__pwned, txt: (document.querySelector('#folio-page .kd-note') || {}).textContent || '' }));
  say(!safe.img && !safe.pw && safe.txt.startsWith('<img src=x'), 'markup in a note is shown as text, never run');
  await shot(p, 'known_pins_1280x800');
  // edit
  await click('[data-k="edit"]');
  await click('input[name="kd-type"][value="passage"]');
  await p.fill('#folio-page textarea[data-k="note"]', 'the ladder, again');
  await click('[data-k="save"]');
  const ed = await p.evaluate(() => RB.known.pins(RB.game.s, 'lf.tower_top')[0]);
  say(ed.type === 'passage' && ed.note === 'the ladder, again', 'edit: kind and note changed');
  // the limit: 20 per map, nothing replaced
  const lim = await p.evaluate(() => {
    const s = RB.game.s;
    for (let i = 0; i < 25; i++) RB.known.addPin(s, 'lf.tower_top', { type: 'question', note: 'n' + i, x: i % 10, y: 5 });
    return { n: RB.known.pins(s, 'lf.tower_top').length, first: RB.known.pins(s, 'lf.tower_top')[0].note, r: RB.known.addPin(s, 'lf.tower_top', { type: 'view', x: 1, y: 1 }) };
  });
  say(lim.n === 20 && lim.first === 'the ladder, again' && !lim.r.ok && lim.r.reason === 'full', 'at most 20 pins; the 21st is refused and nothing is evicted');
  await p.evaluate(() => { RB.ui.menu.close(); RB.ui.menu.open('known'); });
  await p.waitForTimeout(250);
  const full = await p.evaluate(() => ({ dis: document.querySelector('#folio-page [data-k="new"]').disabled, msg: (document.querySelector('#kd-full') || {}).textContent || '' }));
  say(full.dis && /most it can keep/.test(full.msg), 'the page says the map is full before anything is lost');
  // remove (asks first)
  await click('[data-k="remove"]');
  await p.waitForTimeout(200);
  await p.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /^Remove$/.test(x.textContent.trim()) && !x.closest('#folio-page')); b.click(); });
  await p.waitForTimeout(300);
  const nrem = await p.evaluate(() => RB.known.pins(RB.game.s, 'lf.tower_top').length);
  say(nrem === 19, 'remove asks, then removes one (' + nrem + ')');
  // another visited map
  await p.evaluate(() => { RB.game.s.visited['lf.tower_upper'] = true; });
  await p.evaluate(() => { RB.ui.menu.close(); RB.ui.menu.open('known'); });
  await p.waitForTimeout(250);
  await p.selectOption('#kd-map', 'lf.tower_upper');
  await p.waitForTimeout(250);
  r = await rows(p);
  say(r.some((t) => /Lower gate open/.test(t)), 'a previously visited map can be chosen: ' + r.join(' | '));
  // save and load
  const rt = await p.evaluate(() => {
    const json = JSON.parse(JSON.stringify(RB.game.s));
    const probs = RB.save.validate(json);
    const back = RB.save.migrate(json);
    return { probs, n: back.discovery.pins['lf.tower_top'].length, rec: back.discovery.known['lf.tower_top'].test_panel.state };
  });
  say(rt.probs.length === 0 && rt.n === 19 && rt.rec === 'solved', 'pins and recorded details survive a save/load');
  say(!errors.length, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  await ctx.close();
}
{
  // discovered through play: the old footing, then the Seto house; a phone
  const { p, ctx, errors } = await page(b, url, { viewport: { width: 390, height: 844 }, touch: true, mobile: true });
  await setup(p, 'sg.harbor', 52, 29);
  await p.evaluate(async () => { RB.test.enable({ battle: 'unravel', choose: () => 0 }); await RBDrive.run(['cs.parcel_oldsite']); RB.test.disable(); });
  await openKnown(p);
  const r = await rows(p);
  say(r.some((t) => /East Landing/.test(t)), 'the old footing is noted once seen: ' + r.join(' | '));
  const ov = await p.evaluate(() => { const l = document.querySelector('#folio-page .leaf'); return l.scrollWidth <= l.clientWidth + 1 && document.documentElement.scrollWidth <= innerWidth + 1; });
  say(ov, 'no horizontal overflow on a phone');
  await shot(p, 'known_harbour_390x844');
  await p.evaluate(() => document.querySelector('#folio-page .kd-list').scrollIntoView());
  await shot(p, 'known_harbour_list_390x844');
  say(!errors.length, 'no page errors (phone)' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  await ctx.close();
}
await b.close();
srv.close();
console.log(fails ? fails + ' FAILED' : 'all passed');
process.exit(fails ? 1 : 0);
