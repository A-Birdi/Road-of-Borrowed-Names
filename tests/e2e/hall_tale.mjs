// The question after each Hall scroll in the browser (CC-568, CC-569; Agnes 6848355918; Local CL-793, CL-794), on
// journeys made for the test and the stand-in save slots of a fresh context (never a real save). Wing 1's scroll is
// written inline, Wing 2's by the kit (K.taskTrial); both are played with real clicks on the real sheets:
//  1. Wing 1: the ordering, then "Come back later" on the question: no reflection, the notice saying where it can be
//     answered; the scroll again: asked again, put off again, no second notice;
//  2. the floor counted (its other trials marked by the engine's own markTrial), then Leave: the hearth asks, with
//     "Answer it now" / "Not now"; Escape is "Not now"; "Not now"; "Answer it now", then "Come back later" (no reflection,
//     no second autosave); "Answer it now", then "I don't know" (the answer revealed: assisted), Continue: the
//     companion's reflection, then one autosave; the title's Continue (the latest record) loads the answer, and the
//     hearth asks nothing more;
//  3. the journey changed while the hearth's choice is open, and while the question is open: the choice is taken down;
//     the question, answered after the change, records nothing in the journey loaded meanwhile; no reflection, no
//     autosave, no variable written there; and the challenge runner on its own, the same way;
//  4. Wing 2: put off in the flow (the notice), then answered at the scroll with the right choice (the reflection); the
//     hearth on another journey of it, answered there with the right choice (the reflection, one autosave);
//  5. Suzu speaking Kansai-ben: the hearth, "Come back later" (no reflection), then the answer revealed: her reflection
//     shown in its Kansai version (src/content/dialect/kansai_99_hall.js);
//  6. no page errors.
// Usage: node tools/build.mjs && node tests/e2e/hall_tale.mjs   (RB_PAGE=<file> for another page)
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const DONE = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_done: true, cr_done: true, yn_done: true, postgame: true, ch6_done: true, hall_ledger: true };
const { p, ctx, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
const wait = (ms) => p.waitForTimeout(ms);

await p.evaluate((DONE) => {
  RB.test.disable();
  window.__said = []; window.__shown = []; window.__notices = []; window.__chal = []; window.__saves = [];
  const say = RB.ui.dialogue.say;
  RB.ui.dialogue.say = function (l) { if (l) window.__said.push({ who: l.who, jp: l.jp || '', en: l.en || '' }); return say.apply(this, arguments); };
  const notice = RB.ui.notice;
  RB.ui.notice = function (m) { window.__notices.push(String(m)); return notice.apply(this, arguments); };
  const run = RB.challenge.run;
  RB.challenge.run = function (id) { window.__chal.push(id); return run.apply(this, arguments); };
  const auto = RB.save.autosave;
  RB.save.autosave = async function (kind) { const r = await auto.apply(this, arguments); window.__saves.push({ kind, slot: RB.game.s && RB.game.s.player.name, wrote: !!r }); return r; };
  window.__txt = (el) => { if (!el) return ''; const c = el.cloneNode(true); c.querySelectorAll('rt, rp').forEach((x) => x.remove()); return c.textContent.replace(/\s+/g, ''); };
  window.__plain = (jp) => RB.jp.plain(jp).replace(/\s+/g, '');
  window.__mk = async (slot, w, o) => {
    const H = RB.hall.get(w).hearth;
    const s = RB.game.debugStart(H.map, H.x, H.y, { edition: 2, comp: o.comp, flags: DONE, dir: H.dir });
    s.learn.profile = 'E'; s.learn.kanaKnown = 'both'; s.player.name = o.name;
    if (w === 'w10') for (let k = 1; k <= 9; k++) RB.hall.wrec(s, 'w' + k).done = true;
    await RB.save.writeSlot(slot, s, { force: true });
  };
  window.__settings = (o) => { Object.assign(RB.game.settings, { textSpeed: 'instant', input: 'choice' }, o || {}); RB.game.applySettings(); };
  window.__bank0 = (w) => { for (const t of RB.hall.floorTrials(w, 0)) if (t.id !== 't1') RB.hall.markTrial(RB.game.s, w, t.id); };
  window.__reflection = (w) => RB.content.scenes['hall.' + w + '.t1'].cmds.filter((c) => c.op === 'say' && c.who === 'comp').map((c) => ({ jp: c.jp, en: c.en, if: c.if }));
  window.__pending = (w) => RB.state.test(RB.game.s, 'hall.' + w + '.tale');
  window.__run = (id) => { window.__done = false; window.__said = []; window.__shown = []; window.__notices = []; window.__chal = []; RB.script.run(id).then(() => { window.__done = true; }, (e) => { window.__done = 'error: ' + e; }); };
}, DONE);

// play a scene to its end: the ordering solved, the question as `q` ('leave' | 'reveal' | 'right'), the hearth's choice
// as `confirm` ('escape' | 'notnow' | 'answer'); `stop` ends early once something is on screen ('confirm' | 'question')
async function play(o = {}) {
  const acted = new Set();
  for (let i = 0; i < 500; i++) {
    const st = await p.evaluate(() => {
      const chal = document.querySelector('.chal');
      const cont = chal && [...chal.querySelectorAll('.fbwrap button')].find((x) => /Continue/.test(x.textContent));
      const conf = document.querySelector('.confirm-scrim .csheet');
      const dlg = document.querySelector('.dlg:not(.hidden)');
      return { done: window.__done, chal: !!chal, n: window.__chal.length, id: window.__chal[window.__chal.length - 1] || '', cont: !!cont,
        conf: conf ? { q: conf.querySelector('.q').textContent, b: [...conf.querySelectorAll('.foot button')].map((x) => x.textContent.trim()) } : null,
        dlg: RB.ui.dialogue.isOpen(), sub: dlg ? window.__txt(dlg.querySelector('.sub')) : '' };
    });
    if (st.done) return st;
    if (st.conf) {
      if (o.stop === 'confirm') return st;
      if (!acted.has('c' + i)) {
        if (o.confirm === 'escape') await p.keyboard.press('Escape');
        else await p.evaluate((label) => { [...document.querySelectorAll('.confirm-scrim .csheet .foot button')].find((x) => x.textContent.trim() === label).click(); }, o.confirm === 'answer' ? 'Answer it now' : 'Not now');
        acted.add('c' + i);
      }
      await wait(150); continue;
    }
    if (st.chal) {
      if (st.cont) { await p.evaluate(() => [...document.querySelectorAll('.chal .fbwrap button')].find((x) => /Continue/.test(x.textContent)).click()); await wait(200); continue; }
      const key = st.n + ':' + st.id;
      if (!acted.has(key)) {
        acted.add(key);
        if (/\.story$/.test(st.id)) {
          await p.evaluate((id) => {
            const step = RB.content.challenges[id].tiers[RB.game.s.learn.profile][0];
            const pool = RB.util.rng(RB.util.hashStr(step.tiles.join(''))).shuffle(step.tiles.map((t, i) => ({ t, i })));
            for (const a of step.answer) document.querySelector('[data-add="' + pool.findIndex((pc) => pc.t === a) + '"]').click();
            document.querySelector('.chal-submit').click();
          }, st.id);
        } else if (/\.story_q$/.test(st.id)) {
          if (o.stop === 'question') return st;
          if (o.q === 'leave') await p.evaluate(() => document.querySelector('.chal [data-a=leave]').click());
          else if (o.q === 'reveal') await p.evaluate(() => document.querySelector('.chal [data-a=reveal]').click());
          else await p.evaluate((id) => {
            const step = RB.content.challenges[id].tiers[RB.game.s.learn.profile][0];
            const right = step.options.find((x) => x.ok).en;
            [...document.querySelectorAll('.chal .mc .choice')].find((x) => x.textContent.replace(/\s+/g, ' ').trim() === right).click();
          }, st.id);
        }
      }
      await wait(200); continue;
    }
    if (st.dlg) { if (st.sub) await p.evaluate((sub) => { if (window.__shown[window.__shown.length - 1] !== sub) window.__shown.push(sub); }, st.sub); await p.evaluate(() => RB.ui.dialogue.advance()); }
    await wait(60);
  }
  return { done: false };
}
const reflected = (w) => p.evaluate((w) => window.__said.some((l) => window.__reflection(w).some((r) => r.en === l.en)), w);
const load = async (slot) => { await p.evaluate(async (slot) => { await RB.game.loadCampaign(slot, 'manual'); window.__settings(); }, slot); await wait(700); };

// ---- 1, 2. Wing 1 (the inline scene), Ren --------------------------------------------------------------------------
await p.evaluate(async () => { await window.__mk(1, 'w1', { comp: 'ren', name: 'Tale One' }); await window.__mk(2, 'w1', { comp: 'nao', name: 'Tale Two' }); });
await load(1);
await p.evaluate(async () => { await RB.ui.hall.goIn('w1'); });
await wait(800);
await p.evaluate(() => window.__run('hall.w1.t1'));
let st = await play({ q: 'leave' });
let got = await p.evaluate(() => ({ chal: window.__chal, notices: window.__notices, pending: window.__pending('w1'), done: !!RB.hall.visitOf(RB.game.s).done.t1 }));
ok(st.done === true && got.chal.join() === 'hall.w1.story,hall.w1.story_q' && got.done && got.pending && !(await reflected('w1')),
  '1 Wing 1, the ordering, then "Come back later" on the question: credit, no reflection, pending ' + JSON.stringify(got));
ok(got.notices.length === 1 && got.notices[0].endsWith('You can answer the question later at this scroll. Once this floor is counted, you can also answer it at this wing\'s hearth.'),
  '1 the lantern\'s notice says where it can be answered ' + JSON.stringify(got.notices));
await p.evaluate(() => window.__run('hall.w1.t1'));
st = await play({ q: 'leave' });
got = await p.evaluate(() => ({ chal: window.__chal, notices: window.__notices, pending: window.__pending('w1') }));
ok(st.done === true && got.chal.join() === 'hall.w1.story_q' && !got.notices.length && got.pending && !(await reflected('w1')), '1 the scroll again: the question only, put off again, no second notice ' + JSON.stringify(got));

await p.evaluate(() => window.__bank0('w1'));
await p.evaluate(async () => { await RB.ui.hall.leave(false); window.__saves = []; });
await wait(600);
got = await p.evaluate(() => ({ map: RB.game.s.map, visit: !!RB.hall.visitOf(RB.game.s), pending: window.__pending('w1'), banked: !!RB.hall.peek(RB.game.s, 'w1').trials.t1 }));
ok(got.map === 'hall.foyer' && !got.visit && got.pending && got.banked, '2 the floor counted, then Leave: at the hearth, pending ' + JSON.stringify(got));
await p.evaluate(() => { window.__saves = []; window.__run('hall.hearth_w1'); });
st = await play({ stop: 'confirm' });
ok(st.conf && st.conf.q === 'The question after the tale is still open.' && JSON.stringify(st.conf.b) === '["Answer it now","Not now"]', '2 the hearth asks, "Not now" last ' + JSON.stringify(st.conf));
st = await play({ confirm: 'escape' });
got = await p.evaluate(() => ({ chal: window.__chal, pending: window.__pending('w1'), tale: RB.game.s.vars._tale, saves: window.__saves.length }));
ok(st.done === true && !got.chal.length && got.pending && !got.tale && got.saves === 1, '2 Escape: "Not now" (no question; still pending; the hearth\'s own autosave only) ' + JSON.stringify(got));
await p.evaluate(() => { window.__saves = []; window.__run('hall.hearth_w1'); });
st = await play({ confirm: 'notnow' });
got = await p.evaluate(() => ({ chal: window.__chal, pending: window.__pending('w1'), saves: window.__saves.length }));
ok(st.done === true && !got.chal.length && got.pending && got.saves === 1, '2 "Not now": no question; still pending ' + JSON.stringify(got));
await p.evaluate(() => { window.__saves = []; window.__run('hall.hearth_w1'); });
st = await play({ confirm: 'answer', q: 'leave' });
got = await p.evaluate(() => ({ chal: window.__chal, pending: window.__pending('w1'), saves: window.__saves.length, tale: RB.game.s.vars._tale }));
ok(st.done === true && got.chal.join() === 'hall.w1.story_q' && got.pending && got.saves === 1 && got.tale === 0 && !(await reflected('w1')),
  '2 "Answer it now", then "Come back later": no reflection, no second autosave, still pending ' + JSON.stringify(got));
await p.evaluate(() => { window.__saves = []; window.__run('hall.hearth_w1'); });
st = await play({ confirm: 'answer', q: 'reveal' });
got = await p.evaluate(() => ({ chal: window.__chal, pending: window.__pending('w1'), saves: window.__saves, flag: RB.game.s.flags['chal:hall.w1.story_q'], said: window.__said.map((l) => l.en) }));
ok(st.done === true && got.chal.join() === 'hall.w1.story_q' && got.flag === true && !got.pending && (await reflected('w1')) && got.saves.length === 2 && got.saves[1].wrote,
  '2 "Answer it now", then "I don\'t know" (revealed): Ren\'s reflection, then one more autosave, written ' + JSON.stringify(got));
const renLine = await p.evaluate(() => window.__reflection('w1').find((r) => /ren/.test(r.if)).en);
ok(got.said[got.said.length - 1] === renLine, '2 the reflection is the scroll scene\'s own line for Ren: ' + renLine);
// the latest record, through the title's Continue
await p.evaluate(async () => { await RB.game.toTitle(); });
await p.waitForSelector('.title [data-a=continue]:not(.hidden)', { timeout: 10000 });
await p.click('.title [data-a=continue]');
await p.waitForFunction(() => RB.game.s && RB.game.s.player && RB.game.s.player.name === 'Tale One', null, { timeout: 15000 });
await wait(800);
await p.evaluate(() => window.__settings());
got = await p.evaluate(() => ({ name: RB.game.s.player.name, flag: RB.game.s.flags['chal:hall.w1.story_q'], pending: window.__pending('w1'), banked: !!RB.hall.peek(RB.game.s, 'w1').trials.t1 }));
ok(got.flag === true && !got.pending && got.banked, '2 the title\'s Continue loads the latest record: the answer kept ' + JSON.stringify(got));
await p.evaluate(() => { window.__saves = []; window.__run('hall.hearth_w1'); });
st = await play({ confirm: 'notnow' });
ok(st.done === true && !(await p.evaluate(() => window.__chal.length)), '2 after the load, the hearth asks nothing more');

// ---- 3. the journey changed while the choice, and then the question, is open -------------------------------------
await p.evaluate(async () => { await window.__mk(3, 'w1', { comp: 'ren', name: 'Tale Three' }); });
await load(3);
await p.evaluate(async () => { const s = RB.game.s; RB.hall.wrec(s, 'w1').trials.t1 = { t: 1, route: 'consolidate', tactics: 'normal' }; RB.hall.wrec(s, 'w1').floors[0] = true; await RB.save.writeSlot(3, s, { force: true }); });
got = await p.evaluate(() => ({ pending: window.__pending('w1') }));
ok(got.pending, '3 (a journey with the question pending at the hearth: credit, no answer)');
await p.evaluate(() => { window.__saves = []; window.__run('hall.hearth_w1'); });
st = await play({ stop: 'confirm' });
await p.evaluate(async () => { window.__saves = []; await RB.game.loadCampaign(2, 'manual'); });
await wait(800);
got = await p.evaluate(() => ({ name: RB.game.s.player.name, sheet: !!document.querySelector('.confirm-scrim .csheet'), vars: RB.game.s.vars, flag: !!RB.game.s.flags['chal:hall.w1.story_q'], saves: window.__saves.filter((x) => x.slot === 'Tale Two' && x.kind === 'progress').length, chal: window.__chal.length }));
ok(got.name === 'Tale Two' && !got.sheet && !got.vars._tale && !('_res' in got.vars && got.vars._res === 1) && !got.flag && !got.saves && !got.chal,
  '3 a load while the hearth\'s choice is open: the choice taken down; nothing written to the journey loaded ' + JSON.stringify(got));
await load(3);
await p.evaluate(() => { window.__saves = []; window.__run('hall.hearth_w1'); });
st = await play({ confirm: 'answer', stop: 'question' });
const before = await p.evaluate(() => JSON.stringify(RB.game.s.vars));
await p.evaluate(async () => { await RB.game.loadCampaign(2, 'manual'); });
await wait(800);
const lingering = await p.evaluate(() => !!document.querySelector('.chal'));
if (lingering) {
  await p.evaluate(() => document.querySelector('.chal [data-a=reveal]').click()); await wait(300);
  await p.evaluate(() => { const c = [...document.querySelectorAll('.chal .fbwrap button')].find((x) => /Continue/.test(x.textContent)); if (c) c.click(); });
  await wait(800);
}
got = await p.evaluate(() => ({ name: RB.game.s.player.name, flag: !!RB.game.s.flags['chal:hall.w1.story_q'], tale: RB.game.s.vars._tale, saves: window.__saves.filter((x) => x.slot === 'Tale Two').length, said: window.__said.map((l) => l.en) }));
ok(got.name === 'Tale Two' && !got.flag && !got.tale && !got.saves && !(await reflected('w1')),
  '3 a load while the question is open' + (lingering ? ' (its sheet still up, then answered)' : '') + ': the journey loaded records no answer, no reflection, no autosave ' + JSON.stringify(got));
await load(3);
got = await p.evaluate(() => ({ pending: window.__pending('w1'), flag: !!RB.game.s.flags['chal:hall.w1.story_q'] }));
ok(got.pending && !got.flag, '3 the journey left loads as it was saved: still pending');
// the challenge runner itself: a question open when another journey is loaded, then answered
got = await p.evaluate(async () => {
  window.__q = null;
  RB.challenge.run('hall.w1.story_q', { scene: 'hall.w1.t1' }).then((v) => { window.__q = v; });
  await new Promise((r) => setTimeout(r, 600));
  const open = !!document.querySelector('.chal');
  await RB.game.loadCampaign(2, 'manual');
  await new Promise((r) => setTimeout(r, 800));
  const rev = document.querySelector('.chal [data-a=reveal]'); if (rev) rev.click();
  await new Promise((r) => setTimeout(r, 400));
  const c = [...document.querySelectorAll('.chal .fbwrap button')].find((x) => /Continue/.test(x.textContent)); if (c) c.click();
  await new Promise((r) => setTimeout(r, 800));
  return { open, answered: !!(window.__q && window.__q.ok), name: RB.game.s.player.name, flag: !!RB.game.s.flags['chal:hall.w1.story_q'] };
});
ok(got.open && got.answered && got.name === 'Tale Two' && !got.flag, '3 the challenge runner: a question answered after another journey is loaded records nothing in that journey ' + JSON.stringify(got));

// ---- 4. Wing 2 (the kit's scene), Nao ------------------------------------------------------------------------------
await p.evaluate(async () => { await window.__mk(4, 'w2', { comp: 'nao', name: 'Tale Four' }); });
await load(4);
await p.evaluate(async () => { await RB.ui.hall.goIn('w2'); });
await wait(800);
await p.evaluate(() => window.__run('hall.w2.t1'));
st = await play({ q: 'leave' });
got = await p.evaluate(() => ({ chal: window.__chal, notices: window.__notices, pending: window.__pending('w2') }));
ok(st.done === true && got.chal.join() === 'hall.w2.story,hall.w2.story_q' && got.pending && !(await reflected('w2')) && got.notices.length === 1 && got.notices[0].endsWith('You can answer the question later at this scroll. Once this floor is counted, you can also answer it at this wing\'s hearth.'),
  '4 Wing 2: put off in the flow: credit, no reflection, the notice ' + JSON.stringify(got));
await p.evaluate(() => window.__run('hall.w2.t1'));
st = await play({ q: 'right' });
got = await p.evaluate(() => ({ chal: window.__chal, pending: window.__pending('w2'), flag: RB.game.s.flags['chal:hall.w2.story_q'], notices: window.__notices }));
ok(st.done === true && got.chal.join() === 'hall.w2.story_q' && !got.pending && got.flag === true && (await reflected('w2')) && !got.notices.length, '4 Wing 2, the scroll again, the right choice: Nao\'s reflection; nothing pending ' + JSON.stringify(got));
await p.evaluate(async () => { await window.__mk(5, 'w2', { comp: 'nao', name: 'Tale Five' }); });
await load(5);
await p.evaluate(async () => { await RB.ui.hall.goIn('w2'); });
await wait(800);
await p.evaluate(() => window.__run('hall.w2.t1'));
st = await play({ q: 'leave' });
await p.evaluate(() => window.__bank0('w2'));
await p.evaluate(async () => { await RB.ui.hall.leave(false); });
await wait(600);
await p.evaluate(() => { window.__saves = []; window.__run('hall.hearth_w2'); });
st = await play({ confirm: 'answer', q: 'right' });
got = await p.evaluate(() => ({ chal: window.__chal, pending: window.__pending('w2'), saves: window.__saves.map((x) => x.wrote) }));
ok(st.done === true && got.chal.join() === 'hall.w2.story_q' && !got.pending && (await reflected('w2')) && got.saves.length === 2 && got.saves[1],
  '4 Wing 2, counted, then the hearth: "Answer it now", the right choice: the reflection, then one more autosave ' + JSON.stringify(got));

// ---- 5. Suzu, in Kansai-ben, at Wing 1's hearth -------------------------------------------------------------------
await p.evaluate(async () => { await window.__mk(6, 'w1', { comp: 'suzu', name: 'Tale Six' }); });
await load(6);
await p.evaluate(async () => { window.__settings({ suzuSpeech: 'kansai' }); const s = RB.game.s; RB.hall.wrec(s, 'w1').trials.t1 = { t: 1, route: 'consolidate', tactics: 'normal' }; RB.hall.wrec(s, 'w1').floors[0] = true; });
await p.evaluate(() => { window.__run('hall.hearth_w1'); });
st = await play({ confirm: 'answer', q: 'leave' });
got = await p.evaluate(() => ({ shown: window.__shown, pending: window.__pending('w1') }));
const suzu = await p.evaluate(() => { const r = window.__reflection('w1').find((x) => /suzu/.test(x.if)); const k = RB.dialect.find(r.jp, r.en); return { std: window.__plain(r.jp), kansai: window.__plain(k.jp) }; });
ok(st.done === true && got.pending && !got.shown.includes(suzu.kansai) && !got.shown.includes(suzu.std), '5 Suzu, "Answer it now", then "Come back later": no reflection ' + JSON.stringify(got));
await p.evaluate(() => { window.__run('hall.hearth_w1'); });
st = await play({ confirm: 'answer', q: 'reveal' });
got = await p.evaluate(() => ({ shown: window.__shown, pending: window.__pending('w1'), choice: RB.dialect.choice() }));
ok(st.done === true && !got.pending && got.choice === 'kansai' && suzu.kansai !== suzu.std && got.shown.includes(suzu.kansai) && !got.shown.includes(suzu.std),
  '5 Suzu, answered at the hearth: her reflection shown in Kansai-ben (' + suzu.kansai + ') ' + JSON.stringify(got));

ok(!errors.length, '6 no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
await ctx.close(); await b.close(); srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
