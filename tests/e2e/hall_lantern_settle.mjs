// The Hall's mist lanterns settle without Steamhollow's line (CL-741/742; Agnes 6757191548; Cloud CC-581; Local
// CL-812). In Chromium on the built game, on throwaway journeys (never a real save); each response's question answered
// right first time (the language is not what this is about), and every creature with one knot left:
//  1. the lanterns in the mist, started as the Hall's map starts them (its creature on hall.w1f2, with its own intro
//     and the encounter hall.w1.lanterns): a lantern settles ("Crossroads lantern settles."), the battle is won,
//     and Steamhollow's settle line ("The lantern drifts back to its street...") is never logged, said or spoken;
//     the Hall's own line follows ("The mist thins a little. The lanterns lie quietly at the roadside.");
//  2. the same encounter started without its map (as the development panel starts it): no Steamhollow settle line;
//  3. Steamhollow's own lantern (yn.chochin, fought as itself): it still says its settle line;
//  4. the content: the encounter's lead and its group's lantern carry settle: null; the species keeps its line;
//  no page errors (console errors included).
// Usage: node tools/build.mjs && node tests/e2e/hall_lantern_settle.mjs
import { serve, launch, page, companionTurn } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const flat = (x) => JSON.stringify(x);
const STEAM = /drifts back to its street/;
const HALL = /The mist thins a little/;

async function start(p, o) {
  await p.evaluate((o) => {
    RB.game.debugStart(o.map, o.x, o.y, { comp: null, flags: { departed: true, ch1_done: true }, dir: 'down', edition: 2 });
    RB.game.settings.textSpeed = 'instant';
    RB.game.applySettings();
    RB.challenge.runStep = async () => ({ ok: true, firstTry: true, mistakes: 0, assisted: false, mode: 'choice' });
    // every creature with one knot left
    const begin = RB.encounter.begin;
    RB.encounter.begin = function () { const st = begin.apply(this, arguments); for (const fo of st.foes) fo.knots = 1; return st; };
    window.__said = [];
    const say = RB.ui.dialogue.say;
    RB.ui.dialogue.say = function (l) { if (l) window.__said.push((l.en || '') + ' | ' + (l.jp || '')); return say.apply(this, arguments); };
    window.__spoken = []; if (RB.ui.spoken) { const ai = RB.ui.spoken.autoIn; RB.ui.spoken.autoIn = function (el) { window.__spoken.push((el && el.textContent) || ''); return ai.apply(this, arguments); }; }
    window.__res = null;
    // the battle log as it grows (it goes when the battle closes)
    window.__logs = []; window.__logT = setInterval(() => { const c = document.querySelector('.clog'); const x = c ? c.textContent : ''; if (x && x !== window.__logs[window.__logs.length - 1]) window.__logs.push(x); }, 15);
    const done = (r) => { window.__res = r || 'done'; };
    if (o.how === 'map') {
      const e = RB.content.maps['hall.w1f2'].foes.find((x) => x.id === 'b1');
      RB.game.startBattle(e.enemy, { foeKey: 'foe:hall.w1f2:b1', scene: e.scene, where: { map: 'hall.w1f2', x: e.x, y: e.y }, place: e }).then(done);
    } else if (o.how === 'direct') RB.game.startEncounter('hall.w1.lanterns', {}).then(done);
    else RB.game.startBattle('yn.chochin', {}).then(done);
  }, o);
}
async function ready(p) {
  for (let i = 0; i < 900; i++) {
    const s = await p.evaluate(() => ({ res: window.__res, dlg: RB.ui.dialogue.isOpen(), cards: RB.game.mode() === 'combat' && !!document.querySelector('.rcard[data-i]') && !document.querySelector('.confirm-scrim') && !RB.battleSeq.busy() && RB.combat.phase() === 'choose' }));
    if (s.res) return 'over';
    if (s.cards) { await p.waitForTimeout(150); return 'cards'; }
    if (s.dlg) { await p.evaluate(() => RB.ui.dialogue.advance(true)); await p.waitForTimeout(40); continue; }
    await p.waitForTimeout(50);
  }
  throw new Error('the battle did not come back to its cards');
}
async function unravel(p) {
  const did = await p.evaluate(() => { const c = [...document.querySelectorAll('.rcard[data-i]')].find((x) => !x.disabled && /Unravel/.test(x.textContent)); if (c) c.click(); return !!c; });
  if (!did) throw new Error('no Unravel card: ' + flat(await p.evaluate(() => [...document.querySelectorAll('.rcard[data-i]')].map((x) => x.textContent.replace(/\s+/g, ' ')))));
  for (let k = 0; k < 60; k++) {
    const s = await p.evaluate(() => ({ cf: !!document.querySelector('.confirm-scrim'), cc: !!document.querySelector('.ccard'), ph: RB.combat.phase() }));
    if (s.cf) { await p.evaluate(() => { const bt = [...document.querySelectorAll('.confirm-scrim .foot button')].find((x) => /Do it/.test(x.textContent)); if (bt) bt.click(); }); await p.waitForTimeout(120); continue; }
    if (s.cc || s.ph !== 'challenge') break;
    await p.waitForTimeout(50);
  }
  await companionTurn(p, {});
}
async function fight(name, o) {
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 860 } });
  await start(p, o);
  let at = await ready(p), n = 0;
  while (at === 'cards' && n < 8) { await unravel(p); n++; at = await ready(p); }
  // the scene after (the Hall's own line), then whatever it says next
  for (let i = 0; i < 80; i++) { const d = await p.evaluate(() => RB.ui.dialogue.isOpen()); if (d) await p.evaluate(() => RB.ui.dialogue.advance(true)); await p.waitForTimeout(60); }
  const m = await p.evaluate(() => ({ said: window.__said.slice(), spoken: window.__spoken.slice(), res: window.__res, mode: RB.game.mode(), log: window.__logs.join(' ¦ ') }));
  m.rounds = n;
  await p.close();
  return { m, errors };
}

// 4. the content
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 860 } });
  const c = await p.evaluate(() => {
    const d = RB.content.encounters['hall.w1.lanterns'], sp = RB.content.enemies['yn.chochin'];
    const g = [].concat(d.group.normal || [], d.group.hard || []);
    const kind = (v) => (v === null ? 'null' : typeof v);
    return { lead: kind(d.lead.settle), group: g.map((x) => kind(x.settle)), species: !!(sp.settle && sp.settle.en && /drifts back to its street/.test(sp.settle.en)) };
  });
  ok(c.lead === 'null' && c.group.length && c.group.every((x) => x === 'null') && c.species, '4 the encounter\'s lead and group lanterns carry settle: null; the species keeps its line ' + flat(c));
  await p.close();
  if (errors.length) console.log('  errors: ' + errors.join(' | '));
}
const all = (m) => [m.log].concat(m.said, m.spoken).join(' \n ');
{
  const { m, errors } = await fight('map', { how: 'map', map: 'hall.w1f2', x: 26, y: 12 });
  const settles = (m.log.match(/Crossroads lantern settles\./g) || []).length;
  ok(m.res === 'win', '1 the Hall\'s lanterns, as its map starts them: the battle is won ' + flat({ res: m.res, rounds: m.rounds }));
  ok(!STEAM.test(all(m)) && settles >= 1, '1 the Hall\'s lanterns settle ("Crossroads lantern settles." in the log) with no Steamhollow line logged, said or spoken ' + flat({ said: m.said.slice(-4) }));
  ok(m.said.some((x) => HALL.test(x)), '1 the Hall\'s own line follows ' + flat(m.said.slice(-3)));
  ok(!errors.length, '1 no page errors ' + flat(errors));
}
{
  const { m, errors } = await fight('direct', { how: 'direct', map: 'hall.w1f2', x: 26, y: 12 });
  ok(!!m.res && !STEAM.test(all(m)), '2 the same encounter started without its map: no Steamhollow settle line ' + flat({ res: m.res, log: m.log.slice(-300) }));
  ok(!errors.length, '2 no page errors ' + flat(errors));
}
{
  const { m, errors } = await fight('steam', { how: 'steam', map: 'yn.upper', x: 10, y: 10 });
  ok(!!m.res && STEAM.test(all(m)), '3 Steamhollow\'s own lantern still says its settle line ' + flat({ res: m.res, said: m.said.filter((x) => STEAM.test(x)).slice(0, 1), logged: STEAM.test(m.log) }));
  ok(!errors.length, '3 no page errors ' + flat(errors));
}
console.log(pass + ' passed, ' + fail + ' failed');
await b.close(); srv.close();
process.exit(fail ? 1 : 0);
