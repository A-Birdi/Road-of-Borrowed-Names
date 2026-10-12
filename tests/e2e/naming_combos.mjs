// P18 Plan B (Robin's C-89): the sixteen companion × Japanese-level combinations of Chapter 12's naming, as focused
// tests at the selected level, in the built index.html (headless Chromium, a fresh isolated browser context per case).
// At the Archive's gate the companion's voice is hushed and comes back when you call their name (sa2.hushed; the
// challenge sa2.name_<companion>, one tier per level: src/content/sa2/10_approach.js, 20_scenes.js). Each case:
//  - starts from a fresh copy of that companion's own pre-Archive state (Steamhollow finished, yn_done), captured by a
//    continuous campaign of the Plan B launcher (tests/fixtures/p18/README.md says which build and run), written to a
//    save slot of the case's own browser profile and continued from the title screen (Enter on Continue); the fixture
//    file is checked unchanged before and after, and no case reuses another's state;
//  - sets the Japanese level with the real control: Back opens the Ledger, Settings, Learning, the "Japanese level"
//    radio clicked; the level is checked applied (the radio, the journey) before going on;
//  - goes on as the campaign does (the test driver, RB.test auto) only as far as the Archive road's arrival
//    (sa_arrived), then with the driver off walks with real arrow keys into the camp and on into the gate, every line
//    advanced with Enter: the gate's first sight, then the naming scene, by their own triggers (map entry);
//  - answers on the real sheet with real clicks: the options shown must be that level's tier; on half the cases a
//    look-alike first (refused, "Not that one", the button spent), then the name; Continue with Enter;
//  - checks the result and what follows: the voice back (sa2_voice_back), the companion's own reply, the journal line,
//    the learning record of c:sa2_name_<companion> (seen, right, and a first-try miss counted), the same companion and
//    level after, the world again on the gate, and the scene not offered again on walking back in.
// These are focused tests at the selected level: they do not show that the campaign before them was played at that
// level (it was played at the fixture's own level).
// Usage: node tests/e2e/naming_combos.mjs [fixtureDir=tests/fixtures/p18] [filter, e.g. ren or E/mio]
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { serve, launch, page, root } from './lib.mjs';
import { install } from './drive.mjs';

const dir = path.resolve(root, process.argv[2] || 'tests/fixtures/p18');
const filter = process.argv[3] || '';
const COMPS = ['nao', 'mio', 'ren', 'suzu'], LEVELS = ['F', 'E', 'I', 'A'];
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const fixtures = {};
for (const c of COMPS) {
  const f = fs.readdirSync(dir).find((n) => new RegExp('^[FEIA]-' + c + '-yn_done\\.json$').test(n));
  if (f) fixtures[c] = { file: path.join(dir, f), hash: sha(fs.readFileSync(path.join(dir, f))) };
}
const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const results = [];
const wait = (p, ms) => p.waitForTimeout(ms);

// every line advanced with Enter, a choice taken with Enter (its first, focused option), until the world is back
async function playThrough(p, until) {
  for (let i = 0; i < 400; i++) {
    const st = await p.evaluate(() => ({ mode: RB.game.mode(), dlg: RB.ui.dialogue.isOpen(), run: RB.script.isRunning(), chal: !!document.querySelector('.chal'), sheet: !!document.querySelector('.csheet') }));
    if (until && (await p.evaluate(until))) return true;
    if (st.chal) return 'challenge';
    if (st.mode === 'world' && !st.dlg && !st.run && !st.sheet) { await wait(p, 200); if (await p.evaluate(() => RB.game.mode() === 'world' && !RB.ui.dialogue.isOpen() && !RB.script.isRunning())) return 'world'; continue; }
    await p.keyboard.press('Enter');
    await wait(p, 90);
  }
  throw new Error('the scene did not settle: ' + JSON.stringify(await p.evaluate(() => ({ mode: RB.game.mode(), map: RB.world.W.map.id }))));
}
// stand beside a map's exit to `to` and step into it with a real arrow key
async function walkInto(p, to) {
  const where = await p.evaluate((to) => {
    const W = RB.world.W, m = RB.maps.compile(W.map.id);
    const e = (W.map.def.exits || []).find((x) => x.to === to);
    if (!e) return null;
    for (const [dx, dy, key, dir] of [[0, 1, 'ArrowUp', 'up'], [0, -1, 'ArrowDown', 'down'], [1, 0, 'ArrowLeft', 'left'], [-1, 0, 'ArrowRight', 'right']]) {
      const x = e.x + dx, y = e.y + dy;
      if (x >= 0 && y >= 0 && x < m.w && y < m.h && !RB.maps.blockedStatic(m, x, y)) { RB.test.place(x, y, dir); return { key, from: W.map.id }; }
    }
    return null;
  }, to);
  if (!where) throw new Error('no way to step into ' + to);
  for (let i = 0; i < 6 && (await p.evaluate((to) => RB.world.W.map.id !== to, to)); i++) {
    await p.keyboard.down(where.key); await wait(p, 260); await p.keyboard.up(where.key); await wait(p, 500);
  }
  await p.waitForFunction((to) => RB.world.W.map.id === to, to, { timeout: 15000 });
}

async function runCase(comp, level, wrongFirst) {
  const name = level + '/' + comp;
  const fx = fixtures[comp];
  const buf = fs.readFileSync(fx.file);
  if (sha(buf) !== fx.hash) throw new Error('the fixture changed before this case');
  const state = JSON.parse(buf.toString('utf8'));
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  try {
    // the journey, written to a slot of this isolated profile, then continued from the title screen with Enter
    await p.evaluate(async (st) => { await RB.save.writeSlot(1, st, { force: true }); }, state);
    await p.reload(); await p.waitForFunction(() => window.__RB_READY__ === true);
    await p.waitForSelector('.title [data-a=continue]:not(.hidden)');
    await wait(p, 200);
    if ((await p.evaluate(() => document.activeElement && document.activeElement.getAttribute('data-a'))) !== 'continue') throw new Error('Continue is not focused on the title');
    await p.keyboard.press('Enter');
    await p.waitForFunction(() => RB.game.mode() === 'world' && RB.game.s && !document.querySelector('.title'), null, { timeout: 20000 });
    await wait(p, 600);
    await playThrough(p);
    const loaded = await p.evaluate(() => ({ comp: RB.game.s.comp, level: RB.game.s.learn.profile, map: RB.world.W.map.id, ed: RB.game.s.edition, voice: !!RB.game.s.flags.sa2_voice_back }));
    if (loaded.comp !== comp || loaded.ed !== 2 || loaded.voice) throw new Error('the fixture is not ' + comp + '\'s pre-Archive journey: ' + JSON.stringify(loaded));
    // the Japanese level, with the real control
    await p.evaluate(() => { RB.game.settings.textSpeed = 'instant'; });
    await p.keyboard.press('Escape');
    await p.waitForFunction(() => RB.ui.menu.isOpen(), null, { timeout: 5000 });
    await p.click('[data-util="settings"]');
    await p.waitForSelector('[data-grp=learning]');
    await p.click('[data-grp=learning]');
    await p.click(`label.opt:has(input[data-set=profile][value="${level}"])`);
    await wait(p, 300);
    const set = await p.evaluate((level) => ({ checked: !!document.querySelector(`input[data-set=profile][value="${level}"]:checked`), level: RB.game.s.learn.profile }), level);
    if (!set.checked || set.level !== level) throw new Error('the Japanese level did not take: ' + JSON.stringify(set));
    for (let i = 0; i < 6 && (await p.evaluate(() => RB.ui.menu.isOpen() || (RB.ui.settings.isOpen && RB.ui.settings.isOpen()))); i++) { await p.keyboard.press('Escape'); await wait(p, 300); }
    if (await p.evaluate(() => RB.ui.menu.isOpen() || RB.game.mode() !== 'world')) throw new Error('Settings would not close');
    // on as the campaign does, to the Archive road's arrival (the driver; the level now the selected one)
    await p.evaluate(install);
    const drove = await p.evaluate(async () => {
      RB.test.enable({ battle: 'unravel', choose: () => 0 });
      const r = await RBDrive.pursue('sa_arrived', { prefix: 'sa.', main: 'sa_main', max: 300 });
      await RB.test.idle(60000);
      RB.test.disable();
      return { ok: r.ok, steps: r.steps, map: RB.world.W.map.id, level: RB.game.s.learn.profile, problems: (RB.test.problems || []).slice(0, 5) };
    });
    if (!drove.ok || drove.map !== 'sa.road') throw new Error('the driver did not reach the Archive road: ' + JSON.stringify(drove));
    await playThrough(p);
    const before = await p.evaluate((comp) => ({ rec: JSON.parse(JSON.stringify(RB.game.s.learn.items['c:sa2_name_' + comp] || null)), journal: (RB.game.s.journal || []).length, level: RB.game.s.learn.profile, hushed: !!RB.game.s.flags.sa2_hushed }), comp);
    if (before.level !== level || before.hushed) throw new Error('before the gate: ' + JSON.stringify(before));
    // real keys from here: into the camp, then the gate
    await walkInto(p, 'sa.camp');
    await playThrough(p);
    await walkInto(p, 'sa.gate');
    const reached = await playThrough(p);
    if (reached !== 'challenge') throw new Error('no naming sheet at the gate (' + reached + '): ' + JSON.stringify(await p.evaluate(() => ({ map: RB.world.W.map.id, seen: Object.keys(RB.game.s.seen).filter((k) => /^sa/.test(k)), flags: Object.keys(RB.game.s.flags).filter((k) => /^sa2/.test(k)) }))));
    // the sheet: this level's tier
    const sheet = await p.evaluate(([comp, level]) => {
      const tier = RB.content.challenges['sa2.name_' + comp].tiers[level][0];
      const shown = [...document.querySelectorAll('.chal .mc button.choice')].map((x) => x.textContent.trim());
      return { shown, want: tier.options.map((o) => o.jp), right: tier.options.find((o) => o.ok).jp, level: RB.game.s.learn.profile, scene: RB.script.current ? RB.script.current() : null };
    }, [comp, level]);
    if (sheet.shown.slice().sort().join('|') !== sheet.want.slice().sort().join('|')) throw new Error('the options are not the ' + level + ' tier: shown ' + sheet.shown.join(' ') + ', the tier ' + sheet.want.join(' '));
    const btn = (text) => p.locator('.chal .mc button.choice', { hasText: new RegExp('^\\s*' + text + '\\s*$') });
    if (wrongFirst) {
      const wrong = sheet.want.find((x) => x !== sheet.right);
      await btn(wrong).click();
      await wait(p, 300);
      const refused = await p.evaluate(() => ({ fb: (document.querySelector('.chal .fbwrap') || {}).textContent || '', spent: [...document.querySelectorAll('.chal .mc button.choice.tried')].length, open: !!document.querySelector('.chal') }));
      if (!/Not that one/.test(refused.fb) || refused.spent !== 1 || !refused.open) throw new Error('a look-alike was not refused: ' + JSON.stringify(refused));
    }
    await btn(sheet.right).click();
    await p.waitForSelector('.chal [data-a="continue"]', { timeout: 5000 });
    const yes = await p.evaluate(() => (document.querySelector('.chal .fbwrap') || {}).textContent || '');
    if (!/Yes/.test(yes)) throw new Error('the name was not accepted: ' + yes);
    await p.keyboard.press('Enter');
    // what follows: the companion's reply in their own voice, then the world on the gate
    const said = [];
    for (let i = 0; i < 80; i++) {
      const st = await p.evaluate(() => ({ dlg: RB.ui.dialogue.isOpen(), who: RB.ui.dialogue.isOpen() && RB.ui.dialogue.shown ? (RB.ui.dialogue.shown() || {}).who : null, mode: RB.game.mode(), run: RB.script.isRunning(), chal: !!document.querySelector('.chal') }));
      if (st.chal) throw new Error('the naming was asked again after the right answer');
      if (st.who) said.push(st.who);
      if (!st.dlg && !st.run && st.mode === 'world') break;
      await p.keyboard.press('Enter');
      await wait(p, 90);
    }
    const after = await p.evaluate((comp) => {
      const s = RB.game.s;
      return { voice: !!s.flags.sa2_voice_back, hushed: !!s.flags.sa2_hushed, comp: s.comp, level: s.learn.profile, map: RB.world.W.map.id, mode: RB.game.mode(), rec: JSON.parse(JSON.stringify(s.learn.items['c:sa2_name_' + comp] || null)), journal: (s.journal || []).length, lastJournal: JSON.stringify((s.journal || [])[(s.journal || []).length - 1] || '').slice(0, 120) };
    }, comp);
    const r0 = before.rec || { seen: 0, ok: 0, bad: 0 };
    const problems = [];
    if (!after.voice || !after.hushed) problems.push('the voice is not back (sa2_hushed ' + after.hushed + ', sa2_voice_back ' + after.voice + ')');
    if (after.comp !== comp) problems.push('the companion changed to ' + after.comp);
    if (after.level !== level) problems.push('the level changed to ' + after.level);
    if (after.map !== 'sa.gate' || after.mode !== 'world') problems.push('not back in the world at the gate: ' + after.map + ' ' + after.mode);
    if (!said.includes(comp)) problems.push(comp + ' did not answer in their own voice (speakers: ' + [...new Set(said)].join(', ') + ')');
    if (!(after.journal > before.journal) || !/書庫|Archive/.test(after.lastJournal)) problems.push('no journal line for it (' + before.journal + ' → ' + after.journal + ' ' + after.lastJournal + ')');
    if (!after.rec || after.rec.seen <= r0.seen) problems.push('c:sa2_name_' + comp + ' not recorded: ' + JSON.stringify(after.rec));
    else if (wrongFirst ? !(after.rec.bad > (r0.bad || 0) || after.rec.ok === (r0.ok || 0)) : !(after.rec.ok > (r0.ok || 0))) problems.push('the record does not say ' + (wrongFirst ? 'a first-try miss' : 'right first time') + ': ' + JSON.stringify(after.rec) + ' from ' + JSON.stringify(r0));
    // walking out and back in: the scene is not offered again
    await walkInto(p, 'sa.camp');
    await playThrough(p);
    await walkInto(p, 'sa.gate');
    const again = await playThrough(p);
    if (again === 'challenge') problems.push('the naming was offered again on walking back in');
    if (errors.length) problems.push('page errors: ' + errors.slice(0, 3).join(' | '));
    if (sha(fs.readFileSync(fx.file)) !== fx.hash) problems.push('the fixture file changed');
    if (problems.length) throw new Error(problems.join('; '));
    results.push({ case: name, wrongFirst, options: sheet.shown.length, drive: drove.steps, record: { seen: after.rec.seen, ok: after.rec.ok, bad: after.rec.bad } });
    return 'the ' + level + ' tier (' + sheet.shown.join(' ') + ')' + (wrongFirst ? ', a look-alike refused first' : ', right first time') + '; ' + comp + ' answers; recorded (seen ' + after.rec.seen + ', right ' + after.rec.ok + ', missed ' + after.rec.bad + ')';
  } finally { await ctx.close(); }
}

let k = 0;
for (const comp of COMPS) {
  for (const level of LEVELS) {
    const name = level + '/' + comp;
    const wrongFirst = (k++ % 2) === 1;
    if (filter && !name.includes(filter) && comp !== filter) continue;
    if (!fixtures[comp]) { fail++; console.log('MISSING ' + name + ': no pre-Archive fixture for ' + comp + ' in ' + path.relative(root, dir)); continue; }
    const t0 = Date.now();
    try { const msg = await runCase(comp, level, wrongFirst); pass++; console.log('PASS ' + name + ' (' + Math.round((Date.now() - t0) / 1000) + ' s): ' + msg); }
    catch (e) { fail++; console.log('FAIL ' + name + ': ' + String(e && e.message || e).slice(0, 1500)); }
  }
}
for (const c of COMPS) if (fixtures[c]) console.log('fixture ' + c + ': ' + path.relative(root, fixtures[c].file) + ' sha256 ' + fixtures[c].hash.slice(0, 16) + ' (unchanged)');
await b.close(); srv.close();
console.log(pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
