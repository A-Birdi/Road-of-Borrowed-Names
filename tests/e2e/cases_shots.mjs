// Captures of the cases in the BUILT index.html (for review and for
// docs/screenshots/cases/): the places in the world, the case record on a wide
// and a narrow screen (evidence, comparison, the sketch, help), after solving.
// Also a keyboard pass through the record: every control is a real button or
// radio reached by Tab and pressed by Enter/Space.
// Usage: node tests/e2e/cases_shots.mjs
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';
import { install } from './drive.mjs';

const OUT = path.join(root, 'tests/e2e/out/cases');
fs.mkdirSync(OUT, { recursive: true });
let fails = 0;
const say = (ok, m) => { if (!ok) fails++; console.log((ok ? 'ok   ' : 'FAIL ') + m); };
const FX = {
  rw_arrived: true, rw_road_lit: true, rw_met_tsuru: true, rw_mill_open: true, rw_echo_done: true, bridge_fixed: true, rw_koji_back: true,
  rw_evening: true, rw_hall_gather: true, departed: true, ch1_done: true, rw_letters_done: true,
  sg_arrived: true, sg_harbor_seen: true, sg_boss_done: true, sg_returned: true, sg_main_done: true, sg_road_open_seen: true, ch2_done: true,
  sg_tide_read: true, sg_tide_low: true, sg_fog_cleared: true,
  co_restored: true, ch3_done: true, sb_arrived: true, sb_lamp_lit: true, ch4_done: true, sb_path_seen: true, sb_stair_open: true,
};
async function setup(p, map, x, y, dir, comp) {
  await p.evaluate(install);
  await p.evaluate(async ([FX, map, x, y, dir, comp]) => {
    window.PICK = [];
    RB.test.enable({ battle: 'unravel', choose: (opts) => { for (const re of window.PICK) { const i = opts.findIndex((q) => new RegExp(re, 'i').test(q.en)); if (i >= 0) return i; } return 0; } });
    const s = RB.game.debugStart(map, x, y, { comp, profile: 'E', flags: FX, dir });
    s.learn.kanaKnown = 'both'; s.chapter = 5;
    s.words = ['mamoru', 'mizu', 'hikari', 'iyasu', 'kaze', 'nawa', 'ishi', 'koori', 'tsuchi', 'honoo'];
    for (const q of ['rw_labels', 'rw_mill', 'rw_depart', 'sg_main', 'co_main', 'sb_lamp']) s.quests[q] = { stage: 0, done: true, t: Date.now() };
    for (const pl in RB.content.places) s.travel[pl] = true;
    for (const id in RB.content.maps) for (const ev of RB.content.maps[id].onEnter || []) s.flags['enter:' + id + ':' + ev.scene] = true;
    RB.game.settings.textSpeed = 'instant';
    await RB.test.idle(60000);
  }, [FX, map, x, y, dir, comp]);
}
const shot = async (p, name) => { await p.evaluate(() => document.querySelectorAll('.notice,.toast').forEach((n) => n.remove())); await p.screenshot({ path: path.join(OUT, name + '.png') }); };
// arrive, then wait (on the condition, not a fixed time) until the place-name label has gone
const go = (p, map, x, y, dir) => p.evaluate(async ([map, x, y, dir]) => {
  RB.test.disable(); await RB.game.transition(map, x, y, dir);
  const t0 = Date.now();
  await new Promise((r) => setTimeout(r, 300));
  while (document.querySelector('.place') && Date.now() - t0 < 9000) await new Promise((r) => setTimeout(r, 100));
  await new Promise((r) => setTimeout(r, 400));
}, [map, x, y, dir]);

const { srv, url } = await serve();
const b = await launch();
{
  const { p, ctx, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await setup(p, 'sg.harbor', 38, 29, 'up', 'mio');
  await p.waitForTimeout(1200);
  await shot(p, 'world_quay_bench_1280x800');
  await go(p, 'sg.harbor', 51, 6, 'up');
  await shot(p, 'world_seto_house_1280x800');
  await go(p, 'sg.harbor', 52, 29, 'down');
  await shot(p, 'world_old_footing_1280x800');
  await go(p, 'sg.lighthouse', 6, 3, 'up');
  await shot(p, 'world_lighthouse_sketch_1280x800');
  await go(p, 'sb.obs_path', 10, 35, 'up');
  await shot(p, 'world_star_stair_1280x800');
  // play both cases partway (the record needs something in it)
  await p.evaluate(async () => {
    RB.test.enable({ battle: 'unravel', choose: (opts) => { for (const re of window.PICK) { const i = opts.findIndex((q) => new RegExp(re, 'i').test(q.en)); if (i >= 0) return i; } return 0; } });
    window.PICK = ['^Take it along', '^Carry on', 'Close the', 'May I borrow', '^Sit and look out', '^Look out'];
    await RBDrive.run(['cs.parcel_shelf', 'cs.parcel_record', 'cs.parcel_marks', 'cs.hama_bell', 'cs.view_window', 'cs.view_seat', 'cs.view_west']);
    RB.cases.choose(RB.game.s, 'parcel', 'keeper');
    RB.cases.setNote(RB.game.s, 'parcel', 'Hama\'s bell has the same notch as the seal. <b>not bold</b>');
    RB.cases.askHint(RB.game.s, 'parcel');
    RB.test.disable();
  });
  const rec = async (id, name, prep) => {
    await p.evaluate((id) => { RB.ui.casebook.select(id); RB.ui.menu.open('cases'); }, id);
    await p.waitForTimeout(400);
    if (prep) await prep();
    await shot(p, name);
  };
  await rec('parcel', 'record_parcel_1280x800');
  const esc = await p.evaluate(() => { const t = document.querySelector('#folio-page textarea[data-note]'); return { v: t.value, b: !!document.querySelector('#folio-page .cs-note b') }; });
  say(esc.v.includes('<b>not bold</b>') && !esc.b, 'the personal note is plain text (markup shown, never rendered)');
  // compare two observations side by side
  await p.evaluate(() => { document.querySelector('#folio-page [data-a="cmp"][data-cid="parcel.seal"]').click(); });
  await p.waitForTimeout(150);
  await p.evaluate(() => { document.querySelector('#folio-page [data-a="cmp"][data-cid="parcel.makernote"]').click(); });
  await p.waitForTimeout(250);
  const cmp = await p.evaluate(() => { const g = document.querySelector('#folio-page .cs-compare .cs-grid'); g && g.scrollIntoView(); return g ? g.children.length : 0; });
  say(cmp === 2, 'two observations side by side (' + cmp + ')');
  await shot(p, 'record_parcel_compare_1280x800');
  await p.evaluate(() => RB.ui.menu.close());
  await rec('view', 'record_view_sheet_1280x800', async () => {
    await p.evaluate(() => { document.querySelector('#folio-page [data-a="reveal"][data-way="tilt"]').click(); });
    await p.waitForTimeout(150);
    await p.evaluate(() => { const r = document.querySelector('#folio-page input[name="cs-hyp-view"][value="seat"]'); r.checked = true; r.dispatchEvent(new Event('change', { bubbles: true })); });
    await p.waitForTimeout(200);
    await p.evaluate(() => { document.querySelector('#folio-page [data-a="cmpview"]').click(); });
    await p.waitForTimeout(200);
    await p.evaluate(() => document.querySelector('#folio-page .cs-sheet').scrollIntoView());
  });
  // keyboard: Tab to "Turn over", press Enter; Space on "Reset"
  const kb = await (async () => {
    await p.evaluate(() => { const b = document.querySelector('#folio-page [data-a="turn"]'); b.focus(); });
    await p.keyboard.press('Enter');
    await p.waitForTimeout(200);
    const a = await p.evaluate(() => RB.cases.rec(RB.game.s, 'view').sheet.side);
    await p.evaluate(() => { const b = document.querySelector('#folio-page [data-a="reset"]'); b.focus(); });
    await p.keyboard.press('Space');
    await p.waitForTimeout(200);
    const c = await p.evaluate(() => RB.cases.rec(RB.game.s, 'view').sheet.side);
    // Tab moves between the sheet's buttons
    await p.evaluate(() => document.querySelector('#folio-page [data-a="turn"]').focus());
    await p.keyboard.press('Tab');
    const next = await p.evaluate(() => document.activeElement && document.activeElement.dataset.a);
    return { a, c, next };
  })();
  say(kb.a === 'front' && kb.c === 'back' && kb.next === 'cmpview', 'keyboard: Enter turns it over, Space resets, Tab reaches Compare (' + JSON.stringify(kb) + ')');
  await p.evaluate(() => { document.querySelector('#folio-page [data-a="turn"]').click(); });
  await p.waitForTimeout(200);
  await p.evaluate(() => document.querySelector('#folio-page .cs-sheet').scrollIntoView());
  await shot(p, 'record_view_turned_1280x800');
  // help: the answer needs a second press, labelled
  await p.evaluate(() => { for (let i = 0; i < 3; i++) RB.cases.askHint(RB.game.s, 'view'); RB.ui.menu.close(); RB.ui.casebook.select('view'); RB.ui.menu.open('cases'); });
  await p.waitForTimeout(300);
  await p.evaluate(() => { const b = document.querySelector('#folio-page [data-a="hint"]'); b.scrollIntoView(); b.click(); });
  await p.waitForTimeout(200);
  const warn = await p.evaluate(() => ({ w: !!document.querySelector('#folio-page [data-a="hintyes"]'), lvl: RB.cases.hintLevel(RB.game.s, 'view'), txt: (document.querySelector('#folio-page .cs-help .note-slip') || {}).textContent || '' }));
  say(warn.w && warn.lvl === 3 && /answer outright/.test(warn.txt), 'the answer is labelled and needs a second press (level still 3)');
  await shot(p, 'record_view_help_1280x800');
  await p.evaluate(() => RB.ui.menu.close());
  // after solving: the remembered view in the record; the tide board chalked in; the framed sketch by the seat
  const fr = await p.evaluate(async () => {
    const s = RB.game.s;
    const seen = [];
    RB.test.enable({ battle: 'unravel', choose: (opts) => { seen.push(opts.map((q) => q.en).join(' / ')); for (const re of window.PICK) { const i = opts.findIndex((q) => new RegExp(re, 'i').test(q.en)); if (i >= 0) return i; } return 0; } });
    window.PICK = ['turned over', 'Leave the sketch here'];
    const had = s.inv.cs_sketch || 0;
    // (the seat's scene already ran above, when you first sat there: both visits are 'again')
    const d1 = await RBDrive.run([{ scene: 'cs.view_seat', again: true }]).catch((e) => ({ ok: false, fail: String(e) }));
    const d = d1.ok ? await RBDrive.run([{ scene: 'cs.view_seat', again: true }]).catch((e) => ({ ok: false, fail: String(e) })) : d1;
    s.flags.sg_tide_read = true;
    RB.test.disable();
    return { ok: d.ok, fail: d.fail, had, framed: !!s.flags.cs_view_framed, seen };
  });
  say(fr.ok && fr.framed, 'the sketch was solved at the seat and then left there in its frame (' + JSON.stringify(fr) + ')');
  await p.evaluate(() => { RB.ui.casebook.select('view'); RB.ui.menu.open('cases'); });
  await p.waitForTimeout(400);
  await p.evaluate(() => { const e = document.querySelector('#folio-page .cs-remember'); if (e) e.scrollIntoView(); });
  const rem = await p.evaluate(() => !!document.querySelector('#folio-page .cs-remember svg'));
  say(rem, 'the solved record keeps the remembered view');
  await shot(p, 'record_view_solved_1280x800');
  await p.evaluate(() => RB.ui.menu.close());
  await go(p, 'sb.obs_path', 13, 36, 'left');
  await shot(p, 'world_seat_framed_1280x800');
  await go(p, 'sg.harbor', 11, 27, 'up');
  await shot(p, 'world_tideboard_chalk_1280x800');
  say(!errors.length, 'no page errors (wide)' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  await ctx.close();
}
{
  const { p, ctx, errors } = await page(b, url, { viewport: { width: 390, height: 844 }, touch: true, mobile: true });
  await setup(p, 'sg.harbor', 38, 29, 'up', 'suzu');
  await p.evaluate(async () => {
    window.PICK = ['^Take it along', '^Carry on', 'Close the', 'May I borrow'];
    await RBDrive.run(['cs.parcel_shelf', 'cs.parcel_record', 'cs.view_window']);
    RB.test.disable();
    // the place name shown on arriving at the lighthouse fades by itself: wait for it
    const t0 = Date.now();
    while (document.querySelector('.place') && Date.now() - t0 < 9000) await new Promise((r) => setTimeout(r, 100));
    RB.ui.menu.open('cases');
  });
  await p.waitForTimeout(400);
  await shot(p, 'record_list_390x844');
  const ov = await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1);
  say(ov, 'no horizontal overflow on a phone (list)');
  await p.evaluate(() => { document.querySelector('#folio-page [data-case="view"]').click(); });
  await p.waitForTimeout(300);
  await shot(p, 'record_view_390x844');
  const ov2 = await p.evaluate(() => { const l = document.querySelector('#folio-page .leaf'); return l.scrollWidth <= l.clientWidth + 1; });
  say(ov2, 'no horizontal overflow on a phone (record)');
  await p.evaluate(() => { document.querySelector('#folio-page .cs-sheet').scrollIntoView(); });
  await shot(p, 'record_view_sheet_390x844');
  // the largest text size and high contrast: still no sideways scrolling, every control reachable
  await p.evaluate(() => { RB.game.settings.textScale = 2; RB.game.settings.contrast = 'high'; RB.game.applySettings(); RB.ui.menu.close(); RB.ui.menu.open('cases'); });
  await p.waitForTimeout(400);
  const big = await p.evaluate(() => { const l = document.querySelector('#folio-page .leaf'); const bad = [...document.querySelectorAll('#folio-page button')].filter((b) => b.getBoundingClientRect().right > innerWidth + 1).length; return { fit: l.scrollWidth <= l.clientWidth + 1, bad }; });
  say(big.fit && big.bad === 0, 'at 200 % text with high contrast: no sideways scrolling, no button off-screen (' + JSON.stringify(big) + ')');
  await p.evaluate(() => document.querySelector('#folio-page .cs-sheet').scrollIntoView());
  await shot(p, 'record_view_sheet_390x844_text200');
  say(!errors.length, 'no page errors (phone)' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  await ctx.close();
}
await b.close();
srv.close();
console.log(fails ? fails + ' FAILED' : 'all passed');
process.exit(fails ? 1 : 0);
