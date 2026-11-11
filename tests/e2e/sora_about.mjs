// Sora's description on the Company page, colour-neutral (Agnes 6780684863 and 6803414018; Local CL-766; Cloud CC-544
// E). In Chromium on the built game, Company › Pet, with the real buttons:
//  1. the bird's page: each look chosen with its own button (Brown, Gray, Muted cream): the label under the name names
//     that look, the large preview's description names it, its swatch is marked chosen, and the line under them is the
//     same colour-neutral sentence each time;
//  2. "Travel with Sora" selects the bird, as before;
//  3. saved, the page reloaded, Loaded: the bird, its look and its selection kept, the same line shown;
//  no page errors, in the wide and the narrow layout.
// Usage: node tools/build.mjs && node tests/e2e/sora_about.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const flat = (x) => JSON.stringify(x);
const LINE = 'A small road bird. Hops rather than walks, and never strays far from a good perch.';
const NAMES = { brown: 'Brown', gray: 'Gray', cream: 'Muted cream' };

async function begin(p) {
  await p.evaluate(async () => {
    RB.game.debugStart('rw.village', 22, 22, { edition: RB.edition.forNew(), comp: 'ren', flags: { rw_arrived: true, rw_road_lit: true, rw_echo_done: true, departed: true, ch1_done: true } });
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.reducedMotion = true; RB.game.applySettings();
    await new Promise((r) => setTimeout(r, 250));
    for (let i = 0; i < 60 && RB.ui.dialogue.isOpen(); i++) { RB.ui.dialogue.advance(true); await new Promise((r) => setTimeout(r, 40)); }
    RB.pets.meet(RB.game.s, 'bird');
  });
  await p.waitForTimeout(300);
}
async function openBird(p) {
  await p.evaluate(() => RB.ui.menu.open('pet'));
  await p.waitForSelector('[data-pet-sel="bird"]');
  if (!(await p.evaluate(() => !!document.querySelector('.pet-detail [data-pet-look]')))) { await p.click('[data-pet-sel="bird"]'); await p.waitForTimeout(250); }
  await p.waitForSelector('.pet-detail [data-pet-look]');
}
const read = (p) => p.evaluate(() => {
  const d = document.querySelector('.pet-detail');
  const live = d.querySelector('[data-pet-live]');
  const on = d.querySelector('.pet-look.on input');
  return { kind: d.querySelector('.kind').textContent.replace(/\s+/g, ' ').trim(), about: d.querySelector('.pet-about').textContent, live: live && live.getAttribute('aria-label'), on: on && on.value, swatches: d.querySelectorAll('[data-pet-look]').length, rec: RB.pets.record(RB.game.s, 'bird').look, active: RB.pets.active(RB.game.s) };
});

for (const [lay, vp] of [['wide', { width: 1280, height: 800 }], ['narrow', { width: 390, height: 844 }]]) {
  const { p, errors } = await page(b, url, { viewport: vp });
  await begin(p);
  await openBird(p);
  // ---- 1. each look, by its own button
  const rows = [];
  for (const lk of ['brown', 'gray', 'cream']) {
    await p.click('.pet-detail [data-pet-look="' + lk + '"]', { force: true });
    await p.waitForTimeout(200);
    await p.waitForSelector('.pet-detail [data-pet-look]');
    const r = await read(p);
    rows.push(Object.assign({ lk }, r));
    ok(r.rec === lk && r.on === lk && r.swatches === 3 && r.kind.endsWith('Small bird · ' + NAMES[lk]) && (r.live || '').indexOf('Sora, Small bird, ' + NAMES[lk].toLowerCase()) === 0 && r.about === LINE,
      '1 ' + lay + ': ' + NAMES[lk] + ' chosen by its button: the label and the preview name it; the line is the same sentence ' + flat({ kind: r.kind, live: r.live, about: r.about }));
  }
  ok(new Set(rows.map((r) => r.about)).size === 1, '1 ' + lay + ': one line for all three looks');
  // ---- 2. Travel with Sora
  const before = await p.evaluate(() => RB.pets.active(RB.game.s));
  await p.click('.pet-detail [data-pet-choose="bird"]');
  await p.waitForTimeout(250);
  const after = await read(p);
  ok(before !== 'bird' && after.active === 'bird' && after.about === LINE, '2 ' + lay + ': "Travel with Sora" selects the bird ' + flat({ before, after: after.active }));
  // ---- 3. save, reload, Load
  await p.evaluate(async () => { RB.ui.menu.close(); await RB.save.writeSlot(2, RB.game.s, { force: true }); await RB.game.toTitle(); });
  await p.reload();
  await p.waitForSelector('.title [data-a=load]');
  await p.waitForTimeout(300);
  await p.evaluate(async () => { await RB.game.loadCampaign(2, 'manual'); });
  await p.waitForTimeout(500);
  await openBird(p);
  const back = await read(p);
  ok(back.rec === 'cream' && back.on === 'cream' && back.active === 'bird' && back.kind.endsWith('Small bird · Muted cream') && back.about === LINE, '3 ' + lay + ': saved, reloaded, Loaded: the bird, its look and its selection kept, the same line ' + flat({ kind: back.kind, active: back.active }));
  ok(!errors.length, lay + ': no page errors ' + errors.join('; '));
  await p.context().close();
}

await b.close();
srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
