// RBN-QA-113 (Agnes 6344832644, 6344844762; Local CL-206): on different sides of the bamboo partition, the companion
// talks from beyond it. The bath scene narrates "From beyond the bamboo partition comes a familiar voice", and the
// map keeps the follower away, but each of the companion's lines brought a figure of them in beside you on your own
// (dry) side. Now, with yn_bath_apart, their lines are voices off-screen. In Chromium on the built game, at the Upper
// House's bath, for each companion and each bath that puts them on the other side (Mio and Suzu: the men's and the
// reserved; Nao and Ren: the men's and the women's), the first bath and a repeat, sampling every 50 ms:
//  1. apart: no figure of them on the bath map at any moment; every one of their lines is shown, marked off-screen;
//  2. the same with the comfort setting on Summarised;
//  3. together (Mio and Suzu in the women's bath, Nao and Ren in the reserved one): unchanged, their lines spoken
//     as before, not off-screen;
//  4. their bath beat and its bond moment come once, on the first bath only (the repeat has the repeat line);
//  5. back in the lobby they follow you again;
//  6. no page errors.
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const allErrors = [];
const SIDE = { men: 1, women: 2, reserved: 3 };
const TOGETHER = { mio: 'women', suzu: 'women', nao: 'reserved', ren: 'reserved' };
const FLAGS = { departed: true, cr_done: true, ch10_done: true, yn_called: true, yn_rooms_done: true, yn_kami_seen: true };

async function start(p, comp, side, view) {
  await p.evaluate(([comp, side, view, flags]) => {
    const s = RB.game.debugStart('yn.kami', 7, 6, { comp, dir: 'up', edition: RB.edition.forNew(), flags });
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true;
    s.vars.bath_side = side;
    Object.assign(RB.game.settings, { textSpeed: 'instant', bathScenes: view });
    // every line said, with whether it was off-screen; how many figures of the companion stand on the map, every 50 ms
    window.__lines = []; window.__bonds = 0; window.__figs = { max: 0, bath: 0 };
    const say = RB.ui.dialogue.say;
    if (!RB.ui.dialogue.__wrapped) {
      RB.ui.dialogue.__wrapped = true;
      RB.ui.dialogue.say = function (l) { window.__lines.push({ who: l && l.who, off: !!(l && l.offscreen), en: String((l && l.en) || '').slice(0, 30), map: RB.world.W.map && RB.world.W.map.id }); return say.apply(this, arguments); };
      const bond = RB.hooks.co_bond;
      RB.hooks.co_bond = function (a) { if (a && a[0] === 'yn:bath') window.__bonds++; return bond.apply(this, arguments); };
    }
    clearInterval(window.__figT);
    window.__figT = setInterval(() => {
      const W = RB.world.W;
      if (!W || !W.map) return;
      const who = (n) => (n === W.comp ? comp : (n.def && (n.def.char || n.def.id)) || n.id);
      const n = [W.comp].concat(W.npcs, W.extras, W.leavers).filter((a) => a && who(a) === comp && !(a.alpha != null && a.alpha <= 0.05)).length;
      if (W.map.id === 'yn.kami_bath') window.__figs.bath = Math.max(window.__figs.bath, n);
      window.__figs.max = Math.max(window.__figs.max, n);
    }, 50);
  }, [comp, side, view, FLAGS]);
  await p.waitForTimeout(900);
}
async function play(p, scene) {
  await p.evaluate((sc) => { RB.script.run(sc); }, scene);
  for (let i = 0; i < 300; i++) {
    const st = await p.evaluate(() => ({ d: RB.ui.dialogue.isOpen() && !!RB.ui.dialogue.shown(), run: RB.script.isRunning(), ch: document.querySelectorAll('.choices:not(.hidden) .choice').length }));
    if (st.ch) { await p.locator('.choices:not(.hidden) .choice').first().click(); await p.waitForTimeout(150); continue; }
    if (st.d) { await p.evaluate(() => RB.ui.dialogue.advance()); await p.waitForTimeout(90); continue; }
    if (!st.run && i > 3) break;
    await p.waitForTimeout(80);
  }
  await p.waitForTimeout(700);
}
const took = (p) => p.evaluate(() => ({ lines: window.__lines.splice(0), bonds: window.__bonds, bathFigs: window.__figs.bath, map: RB.world.W.map.id, bathed: !!RB.game.s.flags.yn_bathed, apart: !!RB.game.s.flags.yn_bath_apart }));

const apartBad = [], togetherBad = [], onceBad = [], backBad = [];
let apartRuns = 0, togetherRuns = 0;
for (const comp of ['mio', 'suzu', 'nao', 'ren']) {
  for (const sideName of ['men', 'women', 'reserved']) {
    const together = TOGETHER[comp] === sideName;
    for (const view of together ? ['shown'] : ['shown', 'summarised']) {
      const { p, errors } = await page(b, url);
      await start(p, comp, SIDE[sideName], view);
      const tag = `${comp} ${sideName} ${view}`;
      // the first bath, then a repeat
      for (const visit of ['first', 'repeat']) {
        if (visit === 'repeat') await p.evaluate(() => { window.__figs.bath = 0; RB.world.enter('yn.kami', 7, 6, 'up', {}); });
        await p.waitForTimeout(600);
        await play(p, 'yn.bath_kami');
        const r = await took(p);
        const theirs = r.lines.filter((l) => l.who === comp && l.map === 'yn.kami_bath');
        if (together) {
          togetherRuns++;
          if (r.apart || !theirs.length || theirs.some((l) => l.off) || r.bathFigs !== 1) togetherBad.push({ tag, visit, apart: r.apart, lines: theirs.length, off: theirs.filter((l) => l.off).length, figs: r.bathFigs });
        } else {
          apartRuns++;
          if (!r.apart || !theirs.length || theirs.some((l) => !l.off) || r.bathFigs !== 0) apartBad.push({ tag, visit, apart: r.apart, lines: theirs.length, onScreen: theirs.filter((l) => !l.off).length, figs: r.bathFigs });
        }
        if ((visit === 'first' && r.bonds !== 1) || (visit === 'repeat' && r.bonds !== 1) || !r.bathed) onceBad.push({ tag, visit, bonds: r.bonds, bathed: r.bathed });
      }
      // back in the lobby, through the bath's own way out
      await p.evaluate(() => { RB.game.transition('yn.kami', 7, 7, 'down'); });
      await p.waitForTimeout(2500);
      const back = await p.evaluate((comp) => ({ map: RB.world.W.map.id, comp: RB.world.W.comp ? (RB.world.W.comp.id || comp) : null }), comp);
      if (back.map !== 'yn.kami' || !back.comp) backBad.push({ tag, back });
      allErrors.push(...errors);
      await p.close();
    }
  }
}
ok(apartRuns === 32 && !apartBad.length, `apart (each companion, each bath on the other side, shown and Summarised, first and repeat; ${apartRuns} baths): no figure of them by you, every line of theirs a voice off-screen` + (apartBad.length ? ' (' + JSON.stringify(apartBad.slice(0, 4)) + ')' : ''));
ok(togetherRuns === 8 && !togetherBad.length, `together (Mio and Suzu in the women's, Nao and Ren in the reserved; ${togetherRuns} baths): unchanged, beside you, their lines not off-screen` + (togetherBad.length ? ' (' + JSON.stringify(togetherBad.slice(0, 4)) + ')' : ''));
ok(!onceBad.length, 'the bath beat\'s bond moment comes once, on the first bath; the repeat adds none' + (onceBad.length ? ' (' + JSON.stringify(onceBad.slice(0, 4)) + ')' : ''));
ok(!backBad.length, 'back in the lobby, they follow you again' + (backBad.length ? ' (' + JSON.stringify(backBad.slice(0, 4)) + ')' : ''));
ok(allErrors.length === 0, 'no page errors' + (allErrors.length ? ' (' + allErrors.slice(0, 3).join(' | ') + ')' : ''));
console.log(`\n${pass} passed, ${fail} failed`);
await b.close(); srv.close();
process.exit(fail ? 1 : 0);
