// A quiet give's count, in Chromium (CC-541; Local CL-707, CL-710, CL-711; Cloud CC-561, CC-562; Agnes 6650249477,
// 6807667580). `!give <item> quiet` read `quiet` as the count (NaN, saved as null). On the built game, on throwaway
// journeys and the stand-in save slots of a fresh context (never a real save), with the test runner's automatic
// dialogue (each line shown, then passed) and its choices named:
//  1. Kotonoha: the call at Lanternfall gives the leaf quietly (no slip) and the Satchel holds it, one; Otoha says her
//     line about it; at the Wind Stone "Against" is offered and chosen; the leaf is sent home, counted once, and is
//     gone from the Satchel;
//  2. Reedwake: the arrival gives the letter quietly (no slip) and the Satchel holds it; Tsuru's "Hand over the letter."
//     takes it, and it is gone;
//  3. journeys saved with the corrupt entry (null), loaded through the title's Load ledger: the letter before Tsuru has
//     it (one, in the Satchel) and after (gone); the leaf before it is sent home (one) and after (gone); every other
//     item as saved;
//  4. no page errors, no network.
// Usage: node tools/build.mjs && node tests/e2e/quiet_give.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const flat = (x) => JSON.stringify(x);

const { p, errors, requests, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
await p.waitForFunction(() => window.RB && RB.game && RB.game.debugStart, null, { timeout: 30000 });

// a throwaway journey on a map, the test runner on (lines pass by themselves; a choice is the one named)
async function start(map, x, y, flags, pick) {
  await p.evaluate(async ([map, x, y, flags, pick]) => {
    const s = RB.game.debugStart(map, x, y, { edition: 2, comp: 'nao', flags });
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true;
    RB.game.settings.textSpeed = 'instant'; RB.game.applySettings();
    RB.test.enable({ choose: (opts) => Math.max(0, opts.findIndex((o) => pick.includes(o.en))) });
    window.__slips = [];
    if (!window.__toast) { window.__toast = RB.ui.toast; RB.ui.toast = (t) => { if (t && t.kind === 'item') window.__slips.push(t.id + ' ' + t.n); return window.__toast(t); }; }
    const W = RB.world.W, t0 = performance.now();
    while (W.time - W.enteredAt < 600 && performance.now() - t0 < 20000) await new Promise((r) => setTimeout(r, 50));
  }, [map, x, y, flags, pick]);
}
// a scene on the real runner; what it showed, what was offered, and the Satchel after it
async function play(id) {
  return p.evaluate(async (id) => {
    window.__slips = []; RB.test.log.length = 0;
    const said = [];
    const say = RB.ui.dialogue.say;
    RB.ui.dialogue.say = (l, ...a) => { if (l) said.push(l.en || ''); return say(l, ...a); };
    try { await RB.script.run(id); } finally { RB.ui.dialogue.say = say; }
    return { said, offered: RB.test.log.filter((e) => e.t === 'choice').map((e) => e.opts), slips: window.__slips.slice() };
  }, id);
}
// the Satchel as shown: each carried item's row (its id and the count it shows, if any)
async function satchel() {
  await p.evaluate(() => { if (RB.ui.menu.isOpen()) RB.ui.menu.close(); RB.ui.menu.open('satchel'); });
  await p.waitForSelector('button.item-row, .muted', { timeout: 5000 }).catch(() => {});
  await p.waitForTimeout(150);
  const rows = await p.evaluate(() => [...document.querySelectorAll('button.item-row')].map((e) => e.dataset.it + ((e.querySelector('.count') || {}).textContent || '')));
  await p.evaluate(() => RB.ui.menu.close());
  await p.waitForTimeout(150);
  return rows;
}
const inv = (ids) => p.evaluate((ids) => ids.map((k) => (k in RB.game.s.inv ? RB.game.s.inv[k] : 'absent')), ids);

// ---- 1. Kotonoha ---------------------------------------------------------------------------------------------------
{
  await start('lf.council', 7, 8, { departed: true }, ['"Against"']);
  let r = await play('ko.call');
  let rows = await satchel();
  ok(flat(await inv(['ko_leaf_lf'])) === '[1]' && !r.slips.length && rows.includes('ko_leaf_lf'),
    '1 the call: the leaf given quietly (no slip), held as one, in the Satchel ' + flat({ slips: r.slips, rows: rows.filter((x) => /ko_leaf/.test(x)) }));
  r = await play('ko.otoha_first');
  ok(r.said.some((x) => /And the leaf in that letter/.test(x)), '1 Otoha: her line about the leaf in the letter');
  const ret = await p.evaluate(() => RB.game.s.vars.ko_ret || 0);
  r = await play('ko.windstone');
  rows = await satchel();
  const after = await p.evaluate(() => ({ ret: RB.game.s.vars.ko_ret || 0, lf: !!RB.game.s.flags.ko_ret_lf }));
  ok(r.offered[0] && r.offered[0][0] === '"Against"' && after.lf && after.ret === ret + 1 && flat(await inv(['ko_leaf_lf'])) === '["absent"]' && !rows.includes('ko_leaf_lf'),
    '1 the Wind Stone: "Against" offered and chosen; the leaf sent home, counted once, gone from the Satchel ' + flat({ offered: r.offered[0], after }));
}

// ---- 2. Reedwake ---------------------------------------------------------------------------------------------------
{
  await start('rw.village', 22, 30, {}, ['Hand over the letter.']);
  let r = await play('rw.arrive');
  let rows = await satchel();
  ok(flat(await inv(['rw_letter'])) === '[1]' && !r.slips.length && rows.includes('rw_letter'), '2 the arrival: the letter given quietly (no slip), held as one, in the Satchel ' + flat({ slips: r.slips }));
  r = await play('rw.tsuru_first');
  rows = await satchel();
  ok(r.offered[0] && r.offered[0][0] === 'Hand over the letter.' && flat(await inv(['rw_letter'])) === '["absent"]' && !rows.includes('rw_letter'),
    '2 Tsuru: "Hand over the letter." offered and chosen; the letter taken, gone from the Satchel ' + flat({ offered: r.offered[0] }));
}

// ---- 3. saves with the corrupt entry, through the title's Load ledger ---------------------------------------------
{
  const cases = [
    [1, 'the letter, before Tsuru has it', 'rw.village', 22, 30, { departed: true }, { rw_letter: null }, { rw_letter: 1 }],
    [2, 'the letter, after Tsuru has it (rw_met_tsuru)', 'rw.village', 22, 30, { departed: true, rw_met_tsuru: true }, { rw_letter: null }, { rw_letter: 'absent' }],
    [3, 'the leaf, before it is sent home', 'ko.village', 20, 27, { departed: true, ko_otoha_met: true }, { ko_leaf_lf: null }, { ko_leaf_lf: 1 }],
    [4, 'the leaf, after it is sent home (ko_ret_lf)', 'ko.village', 20, 27, { departed: true, ko_otoha_met: true, ko_ret_lf: true }, { ko_leaf_lf: null }, { ko_leaf_lf: 'absent' }],
  ];
  await p.evaluate(async (cases) => {
    RB.test.disable();
    for (const [slot, , map, x, y, flags, bad] of cases) {
      const s = RB.game.debugStart(map, x, y, { edition: 2, comp: 'nao', flags });
      Object.assign(s.inv, { sg_plate: 1, yn_eggs: 3 }, bad);
      s.player.name = 'Quiet ' + slot;
      await RB.save.writeSlot(slot, s, { force: true });
    }
    await RB.game.toTitle();
  }, cases);
  for (const [slot, name, , , , , , want] of cases) {
    await p.waitForSelector('.title [data-a=load]', { timeout: 10000 });
    await p.click('.title [data-a=load]');
    await p.waitForSelector('.folio-ledger .rec[data-slot="' + slot + '"] [data-a=load]', { timeout: 10000 });
    const stored = await p.evaluate(async (slot) => { const r = await RB.save.list(); return r[slot - 1] ? r[slot - 1].corrupt : 'none'; }, slot);
    await p.click('.folio-ledger .rec[data-slot="' + slot + '"] [data-a=load]');
    await p.waitForFunction(() => RB.game.s && document.querySelector('.title') === null || (document.querySelector('.title') && document.querySelector('.title').offsetParent === null), null, { timeout: 15000 }).catch(() => {});
    await p.waitForTimeout(800);
    const id = Object.keys(want)[0];
    const got = await p.evaluate((id) => ({ v: id in RB.game.s.inv ? RB.game.s.inv[id] : 'absent', others: [RB.game.s.inv.sg_plate, RB.game.s.inv.yn_eggs], name: RB.game.s.player.name, marks: Object.keys(RB.game.s.newItems || {}) }), id);
    const rows = await satchel();
    ok(got.name === 'Quiet ' + slot && got.v === want[id] && flat(got.others) === '[1,3]' && (want[id] === 1 ? rows.includes(id) : !rows.includes(id)) && !got.marks.includes(id) && stored === false,
      '3 ' + name + ', saved as null and loaded through the Load ledger: ' + (want[id] === 1 ? 'one, in the Satchel' : 'gone') + '; the other items as saved; no "new" mark ' + flat({ got, stored }));
    await p.evaluate(() => RB.game.toTitle());
  }
}

ok(!errors.length && !requests.length, '4 no page errors, no network' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : '') + (requests.length ? ' ' + requests.slice(0, 2).join(' | ') : ''));
await ctx.close();
console.log(`\nquiet_give: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
