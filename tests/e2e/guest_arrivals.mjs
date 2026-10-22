// RBN-QA-092 (Agnes 6334290400, 6334506153; Local CL-175; Cloud CC-094, CC-095): a guest who is in an encounter from
// its start comes in with words of their own (their authored `arrive` line), and nothing ever said them: the battle
// opened with the creature's intro only, so Kihei, the pale sailor at the tide pools, was on the party's slip with no
// word of who he was. Now each such guest's arrival is written once to the exchange log after the creature's intro (in
// English, as the guests' other lines are), standing under the responses when the first decision comes in; the first
// exchange's own lines take its place. In Chromium on the built game:
//  1. Kihei, from the real wanderer on the tide pools (facing it and stepping up to it): the creature's intro is said
//     first, with the log empty; at the first decision his arrival is in the log once, and is no line of dialogue; his
//     resolve, aim and the round are as the encounter began them; after the first exchange it is gone and never comes
//     back; won, the victory says he has moved a little way off and waits by the water, and he is there on the map;
//  2. Ao (the other guest of the island), started as a story starts one: his arrival once at the first decision;
//  3. a battle with no guest: nothing new in the log at the first decision;
//  4. two guests and one with no words of arrival (a definition made here, at run time): the two arrivals in the
//     encounter's order, the third nothing;
//  5. Reduce motion and seen battle lines skipped: the same, once;
//  6. cancelled by a load while the creature's intro is said: no arrival written, no battle left; a battle with no
//     guest after it has an empty log at its first decision; the same battle started again: the arrival once;
//  7. no page errors, no network.
// Usage: node tools/build.mjs && node tests/e2e/guest_arrivals.mjs
import { serve, launch, page, companionTurn } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const PRE = ['ch1_done', 'ch2_done', 'mb2_done', 'ch3_done', 'ch4_done', 'kr_done', 'ch5_done', 'departed', 'ko_ch9', 'ko_arrived'];
const KIHEI = 'Jellies come in with the tide';

// every line said in the dialogue strip, and every change of the exchange log, with the time and whether the Respond
// panel (where the log is) was shown then
const watch = (p) => p.evaluate(() => {
  window.__said = []; window.__logs = [];
  const say = RB.ui.dialogue.say;
  RB.ui.dialogue.say = function (line) { window.__said.push({ t: performance.now(), en: String(line.en || ''), scene: line.sceneId || null }); return say.apply(this, arguments); };
  new MutationObserver(() => {
    const log = document.querySelector('.combat-ui .clog');
    if (!log) return;
    const root = document.querySelector('.combat-ui');
    window.__logs.push({ t: performance.now(), lines: [...log.querySelectorAll('.cl-l')].map((x) => x.textContent), hidden: log.classList.contains('hidden'), intro: !!root && root.classList.contains('cb-intro') });
  }).observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['class'] });
});
// on to the first decision (the cards), moving the opening lines on
async function cards(p) {
  for (let i = 0; i < 400; i++) {
    const st = await p.evaluate(() => ({ dlg: RB.ui.dialogue.isOpen(), cards: !!document.querySelector('.resp[data-i]') && RB.combat.phase() === 'choose' && !document.querySelector('.combat-ui.cb-intro'), conf: !!document.querySelector('.csheet') }));
    if (st.cards && !st.conf) break;
    if (st.dlg) await p.evaluate(() => RB.ui.dialogue.advance(true));
    await p.waitForTimeout(60);
  }
  await p.waitForSelector('.resp[data-i]');
  await p.waitForTimeout(200);
}
const at = (p) => p.evaluate(() => {
  const log = document.querySelector('.combat-ui .clog'), st = RB.combat.state();
  const dock = document.querySelector('.combat-ui .cb-dock');
  const rc = log && log.getBoundingClientRect();
  return {
    lines: log ? [...log.querySelectorAll('.cl-l')].map((x) => x.textContent) : [], hidden: !log || log.classList.contains('hidden'),
    shown: !!rc && rc.width > 0 && rc.height > 0 && getComputedStyle(dock).visibility !== 'hidden',
    round: st && st.round, actors: st ? (st.actors || []).map((a) => ({ aid: a.aid, hp: a.hp, left: a.left, wants: a.agenda && a.agenda.wants })) : [],
  };
});
const watchSteps = (p) => p.evaluate(() => {
  if (RB.challenge.__watched) return;
  const run = RB.challenge.runStep;
  RB.challenge.runStep = function (step) { window.__step = step; return run.apply(this, arguments); };
  RB.challenge.__watched = true;
});
const clickCard = async (p, re) => {
  const i = await p.evaluate((m) => { const c = [...document.querySelectorAll('.rcard')].find((x) => !x.disabled && new RegExp(m, 'i').test(x.textContent.replace(/\s+/g, ' '))); return c ? c.getAttribute('data-i') : null; }, re);
  if (i == null) throw new Error('no card matching ' + re);
  await p.click('.rcard[data-i="' + i + '"]');
};
// answer the open language step correctly in choice mode (the right option), continue
async function answer(p) {
  await p.waitForSelector('.chal');
  if (await p.evaluate(() => document.querySelector('.chal').getAttribute('data-kind') === 'order')) {
    const want = await p.evaluate(() => window.__step.answer.map((x) => RB.tasks.plain(x).replace(/\s/g, '')));
    for (const piece of want) {
      const i = await p.evaluate((piece) => { const t = (el) => { const c = el.cloneNode(true); c.querySelectorAll('rt').forEach((x) => x.remove()); return c.textContent.replace(/\s/g, ''); }; return [...document.querySelectorAll('.chal .tiles .tile')].findIndex((x) => !x.disabled && t(x) === piece); }, piece);
      if (i < 0) throw new Error('no piece ' + piece);
      await p.click('.chal .tiles .tile >> nth=' + i);
    }
    await p.click('.chal [data-a=submit]');
  } else {
    await p.evaluate(() => { const tab = document.querySelector('.chal-tabs .ptab[data-mode="choice"]'); if (tab) tab.click(); });
    await p.waitForSelector('.chal .mc .btn');
    const n = await p.evaluate(() => document.querySelectorAll('.chal .mc .btn').length);
    for (let k = 0; k < n; k++) {
      await p.evaluate((k) => { const x = [...document.querySelectorAll('.chal .mc .btn')][k]; if (x && !x.disabled) x.click(); }, k);
      await p.waitForTimeout(80);
      if (await p.evaluate(() => !!document.querySelector('.fbwrap[data-fb=ok] .fb-go'))) break;
    }
  }
  await p.waitForSelector('.fbwrap[data-fb=ok] .fb-go');
  await p.click('.fbwrap[data-fb=ok] .fb-go');
}
// one exchange: Unravel, answered right, your companion's first action; then on to the next decision or the battle's end
async function exchange(p) {
  await clickCard(p, 'unravel');
  for (let k = 0; k < 20 && !(await p.evaluate(() => !!document.querySelector('.chal'))); k++) {
    if (await p.evaluate(() => !!document.querySelector('.csheet .pbtn'))) await p.evaluate(() => [...document.querySelectorAll('.csheet .pbtn')][0].click());
    await p.waitForTimeout(100);
  }
  await answer(p);
  // your companion's turn, when it opens: their first action
  await companionTurn(p, { timeout: 6000 });
  await p.waitForFunction(() => window.__res || (RB.combat.phase() === 'choose' && !!document.querySelector('.resp[data-i]')) || RB.ui.dialogue.isOpen(), null, { timeout: 30000 });
}
const settings = (o) => {
  RB.game.settings.textSpeed = 'instant'; RB.game.settings.input = 'choice'; RB.game.settings.battleAnim = 'instant';
  RB.game.settings.intentDisplay = 'adaptive'; RB.game.settings.compPlan = 'ask';
  if (o && o.reduce) RB.game.settings.reducedMotion = true;
  RB.game.applySettings();
};
const errorsAll = [], requestsAll = [];

// ---- 1. Kihei, from the real wanderer ----------------------------------------------------------------------------
{
  const { p, errors, requests } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await p.evaluate(([PRE, settingsSrc]) => {
    const flags = {}; PRE.forEach((f) => (flags[f] = true));
    const s = RB.game.debugStart('ko.tidepools', 20, 12, { dir: 'left', edition: RB.edition.forNew(), comp: 'nao', flags });
    s.learn.kanaKnown = 'both'; s.learn.profile = 'E'; s.learn.difficulty = 'normal';
    (0, eval)('(' + settingsSrc + ')')();
  }, [PRE, settings.toString()]);
  await p.waitForTimeout(800);
  await watch(p); await watchSteps(p);
  // stand beside the wanderer, face it and step up to it (as pressing the action key does)
  const start = await p.evaluate(() => {
    const W = RB.world.W, f = W.foes.find((x) => x.def.id === 'w_kihei');
    if (!f) return { foe: false };
    f.wt = 1e9; if (f.mv) { f.x = f.mv.tx; f.y = f.mv.ty; f.mv = null; f.fx = f.x; f.fy = f.y; }
    const D = { left: [1, 0], right: [-1, 0], up: [0, 1], down: [0, -1] };
    for (const dir in D) {
      const x = f.x + D[dir][0], y = f.y + D[dir][1];
      if (RB.maps.blockedStatic(W.map, x, y) || RB.maps.exitAt(W.map, x, y) || W.npcs.concat(W.foes).some((a) => a !== f && a.x === x && a.y === y)) continue;
      const pl = W.player; pl.x = x; pl.y = y; pl.fx = x; pl.fy = y; pl.dir = dir; pl.mv = null;
      if (W.comp) { W.comp.x = x; W.comp.y = y; W.comp.fx = x; W.comp.fy = y; W.comp.mv = null; }
      window.__res = null;
      RB.world.interact();
      return { foe: true, at: [x, y], foeAt: [f.x, f.y] };
    }
    return { foe: true, at: null };
  });
  await p.waitForFunction(() => !!document.querySelector('.combat-ui'), null, { timeout: 15000 }).catch(() => {});
  const enc = await p.evaluate(() => { const st = RB.combat.state(); return st && st.enc ? st.enc.id : null; });
  await cards(p);
  const first = await at(p);
  const said = await p.evaluate(() => window.__said.slice()), logs = await p.evaluate(() => window.__logs.slice());
  const intro = said.find((l) => l.scene === 'code.battle' && /jellyfish/i.test(l.en));
  const arrivedAt = logs.find((l) => l.lines.some((x) => x.includes(KIHEI)));
  ok(start.foe && start.at && enc === 'ko.wander_kihei', 'Kihei: the battle comes from the wanderer on the tide pools, stepped up to (' + JSON.stringify({ start, enc }) + ')');
  ok(intro && arrivedAt && intro.t < arrivedAt.t && logs.filter((l) => l.t <= intro.t).every((l) => !l.lines.length || l.hidden),
    'Kihei: the creature\'s intro is said first, with nothing in the log; his arrival is written after it (' + JSON.stringify({ intro: intro && intro.en.slice(0, 40), arrived: !!arrivedAt }) + ')');
  ok(first.lines.filter((x) => x.includes(KIHEI)).length === 1 && !first.hidden && first.shown && /pale as sea mist/.test(first.lines.join(' ')),
    'Kihei: at the first decision his arrival is in the log once, shown under the responses (' + JSON.stringify(first.lines) + ')');
  ok(!said.some((l) => l.en.includes(KIHEI)), 'Kihei: his arrival is no line of dialogue');
  const k = first.actors.find((a) => a.aid === 'g:kihei');
  ok(k && k.hp === 3 && !k.left && k.wants === 'pass' && first.round === 0, 'Kihei: his resolve, aim and the round are as the encounter began them (' + JSON.stringify({ k, round: first.round }) + ')');
  await exchange(p);
  const after1 = await at(p);
  ok(!after1.lines.some((x) => x.includes(KIHEI)), 'Kihei: after the first exchange the arrival is gone from the log (' + JSON.stringify(after1.lines) + ')');
  // on to the end: every line said is moved on; the victory's own words
  for (let i = 0; i < 6 && !(await p.evaluate(() => !document.querySelector('.combat-ui'))); i++) {
    if (await p.evaluate(() => RB.combat.phase() === 'choose' && !!document.querySelector('.resp[data-i]'))) await exchange(p);
    else if (await p.evaluate(() => RB.ui.dialogue.isOpen())) await p.evaluate(() => RB.ui.dialogue.advance(true));
    await p.waitForTimeout(200);
    for (let j = 0; j < 60 && (await p.evaluate(() => RB.ui.dialogue.isOpen())); j++) { await p.evaluate(() => RB.ui.dialogue.advance(true)); await p.waitForTimeout(100); }
  }
  await p.waitForFunction(() => !document.querySelector('.combat-ui') && RB.game.mode() === 'world', null, { timeout: 30000 }).catch(() => {});
  await p.waitForTimeout(600);
  const logsAll = await p.evaluate(() => window.__logs.slice());
  const again = logsAll.filter((l) => l.t > (arrivedAt ? arrivedAt.t : 0)).some((l, i, a) => l.lines.some((x) => x.includes(KIHEI)) && i > 0 && !a[i - 1].lines.some((x) => x.includes(KIHEI)));
  ok(!again, 'Kihei: the arrival never comes back in a later exchange');
  const said2 = await p.evaluate(() => window.__said.slice());
  const won = said2.find((l) => /jelly drifts off/i.test(l.en));
  const map = await p.evaluate(() => ({ met: !!RB.game.s.flags.ko_kihei_met, kihei: RB.world.W.npcs.filter((n) => n.id === 'ko_kihei').map((n) => [n.x, n.y]), wanderer: RB.world.W.foes.some((f) => f.def.id === 'w_kihei') }));
  ok(won && /moved a little way off/.test(won.en) && /waits at the water's edge/.test(won.en) && !/only footprints/.test(won.en),
    'Kihei: won, the victory says he has moved a little way off and waits by the water (' + JSON.stringify(won && won.en) + ')');
  ok(map.met && map.kihei.length === 1 && map.kihei[0].join() === '9,19' && !map.wanderer, 'Kihei: back on the map he is there, one of him, at his place; the wanderer gone (' + JSON.stringify(map) + ')');
  errorsAll.push(...errors); requestsAll.push(...requests);
  await p.close();
}

// ---- 2.–5. started as a story starts an encounter ----------------------------------------------------------------
async function encounter(o) {
  const { p, errors, requests } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await p.evaluate(([PRE, o, settingsSrc]) => {
    const flags = {}; PRE.forEach((f) => (flags[f] = true));
    const s = RB.game.debugStart(o.map || 'ko.village', o.x || 20, o.y || 20, { dir: 'down', edition: RB.edition.forNew(), comp: 'mio', flags });
    s.learn.kanaKnown = 'both'; s.learn.profile = 'E'; s.learn.difficulty = 'normal';
    if (o.seen) { s.seen['code.battle'] = true; RB.game.settings.skipSeen = true; }
    (0, eval)('(' + settingsSrc + ')')(o);
    if (o.def) RB.content.encounters[o.def.id] = o.def;
  }, [PRE, o, settings.toString()]);
  await p.waitForTimeout(600);
  await watch(p); await watchSteps(p);
  await p.evaluate((o) => { window.__res = null; (o.enc ? RB.game.startEncounter(o.enc, {}) : RB.game.startBattle(o.enemy, {})).then((r) => { window.__res = r; }); }, o);
  await cards(p);
  const r = await at(p);
  r.said = await p.evaluate(() => window.__said.map((l) => l.en));
  errorsAll.push(...errors); requestsAll.push(...requests);
  await p.close();
  return r;
}
{
  const r = await encounter({ enc: 'ko.wander_ao' });
  ok(r.lines.length === 1 && /That's my basket! Give the leaves back!/.test(r.lines[0]) && !r.said.some((x) => /my basket/.test(x)), 'Ao: his arrival once in the log at the first decision, and no line of dialogue (' + JSON.stringify(r.lines) + ')');
}
{
  const r = await encounter({ enemy: 'ko.jelly' });
  ok(!r.lines.length && r.hidden, 'a battle with no guest: nothing new in the log at the first decision (' + JSON.stringify(r.lines) + ')');
}
{
  const def = { id: 'zz.two_guests', name: { jp: '{二人|ふたり}', en: 'Two guests' }, lead: { enemy: 'ko.jelly', knots: 2 },
    actors: [
      { aid: 'g:one', side: 'guest', name: { jp: 'イチ', en: 'Ichi' }, hp: 3, agenda: { wants: 'pass', act: { kind: 'say' }, leavesWhen: { rounds: 3 } }, lines: { arrive: { jp: '{一|いち}', en: 'Ichi arrives first.' } } },
      { aid: 'g:two', side: 'guest', name: { jp: 'ニ', en: 'Ni' }, hp: 3, agenda: { wants: 'pass', act: { kind: 'say' }, leavesWhen: { rounds: 3 } }, lines: { arrive: { jp: '{二|に}', en: 'Ni arrives second.' } } },
      { aid: 'g:three', side: 'guest', name: { jp: 'サン', en: 'San' }, hp: 3, agenda: { wants: 'pass', act: { kind: 'say' }, leavesWhen: { rounds: 3 } }, lines: { act: { jp: '{三|さん}', en: 'San says something.' } } },
    ],
    conclusions: [{ id: 'won', when: { settled: 'all' }, result: 'win', text: { en: 'Done.' } }] };
  const r = await encounter({ enc: 'zz.two_guests', def });
  ok(r.lines.length === 2 && r.lines[0] === 'Ichi arrives first.' && r.lines[1] === 'Ni arrives second.', 'two guests and one with no words of arrival: the two arrivals in the encounter\'s order, the third nothing (' + JSON.stringify(r.lines) + ')');
}
{
  const r = await encounter({ enc: 'ko.wander_kihei', map: 'ko.tidepools', x: 20, y: 12, reduce: true, seen: true });
  ok(r.lines.filter((x) => x.includes(KIHEI)).length === 1 && !r.hidden, 'Reduce motion, seen battle lines skipped: Kihei\'s arrival once at the first decision (' + JSON.stringify(r.lines) + ')');
}

// ---- 6. cancelled during the opening lines; another battle after it; the same battle started again ------------------
{
  const { p, errors, requests } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await p.evaluate(async ([PRE, settingsSrc]) => {
    const flags = {}; PRE.forEach((f) => (flags[f] = true));
    const s = RB.game.debugStart('ko.tidepools', 20, 12, { dir: 'left', edition: RB.edition.forNew(), comp: 'mio', flags });
    s.learn.kanaKnown = 'both'; s.learn.profile = 'E'; s.learn.difficulty = 'normal';
    (0, eval)('(' + settingsSrc + ')')();
    await RB.save.writeSlot(4, RB.game.s, { force: true });
  }, [PRE, settings.toString()]);
  await p.waitForTimeout(600);
  await watch(p); await watchSteps(p);
  const start = (enc) => p.evaluate((enc) => { window.__res = null; (enc ? RB.game.startEncounter(enc, {}) : RB.game.startBattle('ko.jelly', {})).then((r) => { window.__res = r; }); }, enc);
  const load = async () => { await p.evaluate(async () => { await RB.game.loadCampaign(4, 'manual'); }); await p.waitForTimeout(2500); return p.evaluate(() => ({ ui: !!document.querySelector('.combat-ui'), state: !!RB.combat.state(), mode: RB.game.mode() })); };
  // (a) a load while the creature's intro is being said: nothing of the arrival is written, nothing of the battle stays
  await start('ko.wander_kihei');
  await p.waitForFunction(() => !!document.querySelector('.combat-ui') && RB.ui.dialogue.isOpen(), null, { timeout: 15000 });
  const during = await at(p);
  const gone = await load();
  ok(!during.lines.length && !gone.ui && gone.mode === 'world', 'cancelled while the intro is said (a load): no arrival written, no battle left (' + JSON.stringify({ during: during.lines, gone }) + ')');
  // (b) another battle after it, with no guest: nothing of the cancelled battle's arrival in its log
  await start(null);
  await cards(p);
  const other = await at(p);
  ok(!other.lines.length, 'a battle with no guest after it: its log is its own, empty at the first decision (' + JSON.stringify(other.lines) + ')');
  await load();
  // (c) the same battle started again: the arrival once, never twice
  await start('ko.wander_kihei');
  await cards(p);
  const again = await at(p);
  ok(again.lines.filter((x) => x.includes(KIHEI)).length === 1 && again.lines.length === 1, 'the same battle started again: the arrival once at the first decision (' + JSON.stringify(again.lines) + ')');
  errorsAll.push(...errors); requestsAll.push(...requests);
  await p.close();
}

ok(!errorsAll.length && !requestsAll.length, 'no page errors, no network ' + errorsAll.concat(requestsAll).slice(0, 3).join(' | '));
await b.close();
srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
