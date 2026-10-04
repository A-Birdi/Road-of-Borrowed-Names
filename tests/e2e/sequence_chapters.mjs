// The Chapter 3 and 4 illustrated sequences (src/ui/43c_seq_ch3.js, 43d_seq_ch4.js; docs/expressive/SHOTS.md §3, §4,
// §7b) in the BUILT game, headless Chromium, with real clicks and keys. Scenes run from synthetic starting points
// (RB.game.debugStart near the scene's place with the flags its callers set; fixture companions). Only the two
// challenges and the kana lesson are stubbed to pass (they are not what is tested here, and the sequences start
// after them); every line, choice and card is clicked as a player would. Checks:
//  - every new sequence plays through by hand on every branch: the assembly's three answers (and Gorō's bell line
//    only when the bell was rung), the firebreaks morning, Hoshino's three answers, the reply (also reached on its
//    own later), the inn at night, the morning after the storm; the shots appear in the planned order, each
//    sequence ends once, its seen record counts once, a kept memory only with a companion;
//  - 8 s of idle on a shot of each sequence moves nothing (same line, shot and beats; holding);
//  - Previous looks back read-only (campaign state unchanged) and Next comes back to the live line without
//    moving on; Skip scene asks first (Keep watching keeps the line); a confirmed skip runs the state commands
//    once, stops at the choice and answers nothing;
//  - reduced motion: each shot is at its end state once its dissolve is over; nothing shakes the screen;
//  - the focal area of every shot (every phase, with and without a companion) stays above the dialogue sheet at
//    1280×720, 390×844 and 844×390.
// Usage: node tests/e2e/sequence_chapters.mjs [--only assembly,lamp,reply,inn,morning,focus]
import { serve, launch, page } from './lib.mjs';

const args = process.argv.slice(2);
const oi = args.indexOf('--only'), ONLY = oi >= 0 ? args[oi + 1].split(',') : null;
const want = (k) => !ONLY || ONLY.includes(k);
const IDLE = 8000;
const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const wait = (p, ms) => p.waitForTimeout(ms);

const CH3 = { departed: true, ch1_done: true, ch2_done: true, co_arrived: true, co_kiln_done: true, co_tokiwa_page: true, co_suzu_done: true };
const CH4 = { departed: true, ch1_done: true, ch2_done: true, ch3_done: true, sb_storm: true, sb_morning: true, sb_quiet_done: true, sb_obs_open: true, sb_boss_done: true };
const CH4Q = { departed: true, ch1_done: true, ch2_done: true, ch3_done: true, sb_storm: true, sb_hearth_done: true };
// the shots each run must show, in order (a sequence id, then its shots)
const RUNS = [
  { key: 'assembly', name: 'assembly · the names (Mio, bell rung)', scene: 'co.assembly', at: ['co.village', 23, 17], comp: 'mio', flags: Object.assign({ co_bell_rung: true }, CH3), pick: /names of the dead/, branch: 'co_asm_names',
    expect: [['ch3.assembly', ['dusk', 'confess', 'voices', 'names', 'hands', 'ink', 'night']], ['ch3.firebreaks', ['climb', 'gate', 'breaks', 'rope']]], phases: { voices: 'bell' }, memory: 'seq:ch3.assembly' },
  { key: 'assembly', name: 'assembly · for the living (Nao, no bell)', scene: 'co.assembly', at: ['co.village', 23, 17], comp: 'nao', flags: CH3, pick: /firebreaks/, branch: 'co_asm_living',
    expect: [['ch3.assembly', ['dusk', 'confess', 'voices', 'living', 'hands', 'ink', 'night']], ['ch3.firebreaks', ['climb', 'gate', 'breaks', 'rope']]], noPhase: { voices: 'bell' }, memory: 'seq:ch3.assembly' },
  { key: 'assembly', name: 'assembly · Ume speaks (Suzu)', scene: 'co.assembly', at: ['co.village', 23, 17], comp: 'suzu', flags: CH3, pick: /Grandma Ume/, branch: 'co_asm_ume',
    expect: [['ch3.assembly', ['dusk', 'confess', 'voices', 'ume', 'hands', 'ink', 'night']], ['ch3.firebreaks', ['climb', 'gate', 'breaks', 'rope']]], memory: 'seq:ch3.assembly' },
  { key: 'lamp', name: 'lamp · stay (Ren)', scene: 'sb.lamp_name', at: ['sb.obs_dome', 7, 9], comp: 'ren', flags: CH4, pick: /even when no one/, branch: 'sb_hoshino_stays',
    expect: [['ch4.lamp', ['akari', 'ask', 'stay', 'flint', 'valley']], ['ch4.reply', ['seal', 'give']]], memory: 'seq:ch4.lamp', item: 'sb_reply_letter' },
  { key: 'lamp', name: 'lamp · go (Mio)', scene: 'sb.lamp_name', at: ['sb.obs_dome', 7, 9], comp: 'mio', flags: CH4, pick: /waiting for, not the lamp/, branch: 'sb_hoshino_goes',
    expect: [['ch4.lamp', ['akari', 'ask', 'go', 'flint', 'valley']], ['ch4.reply', ['seal', 'give']]], memory: 'seq:ch4.lamp', item: 'sb_reply_letter' },
  { key: 'lamp', name: 'lamp · both (no companion)', scene: 'sb.lamp_name', at: ['sb.obs_dome', 7, 9], comp: null, flags: CH4, pick: /leave the lamp/, branch: 'sb_hoshino_both',
    expect: [['ch4.lamp', ['akari', 'ask', 'both', 'flint', 'valley']], ['ch4.reply', ['seal', 'give']]], memory: null, item: 'sb_reply_letter' },
  { key: 'reply', name: 'the reply reached later, on its own (Suzu)', scene: 'sb.lamp_reply', at: ['sb.obs_dome', 7, 9], comp: 'suzu', flags: Object.assign({ sb_lamp_lit: true, sb_name_done: true, sb_hoshino_goes: true }, CH4),
    expect: [['ch4.reply', ['seal', 'give']]], memory: null, item: 'sb_reply_letter' },
  { key: 'inn', name: 'the night at the inn (Nao)', scene: 'sb.next_day_inn', at: ['sb.inn', 8, 9], comp: 'nao', flags: Object.assign({ sb_evening: true, sb_lamp_lit: true, ch4_done: true }, CH4), expect: [['ch4.inn', ['night']]], memory: null, dark: true },
  { key: 'morning', name: 'the morning after the storm (Mio)', scene: 'sb.quiet_morning', at: ['sb.inn_room', 6, 5], comp: 'mio', flags: CH4Q, expect: [['ch4.morning', ['snow']]], memory: null },
];

async function start(p, R, o) {
  o = o || {};
  await p.evaluate(async ([R, o]) => {
    RB.game.debugStart(R.at[0], R.at[1], R.at[2], { comp: R.comp || undefined, flags: Object.assign({}, R.flags), dir: 'up' });
    if (R.give) RB.state.give(RB.game.s, R.give, 1);
    // the two challenges and the kana lesson are not under test (the sequences begin after them): they pass
    RB.challenge.run = async () => ({ ok: true });
    RB.lessons.run = async () => {};
    RB.game.settings.textSpeed = o.speed || 'instant';
    RB.game.settings.reducedMotion = !!o.reduce; RB.game.applySettings();
    window.__shook = false;
    new MutationObserver(() => { if (document.getElementById('world').classList.contains('shake')) window.__shook = true; }).observe(document.getElementById('world'), { attributes: true });
    await new Promise((r) => setTimeout(r, 400));
    window.__done = false; window.__seen = [];
    RB.bus.on('sequence:begin', (e) => window.__seen.push(['begin', e.id]));
    RB.bus.on('sequence:end', (e) => window.__seen.push(['end', e.id, !!e.skipped]));
    RB.script.run(R.scene).then(() => { window.__done = true; });
  }, [R, o]);
}
const S = (p) => p.evaluate(() => ({ seq: RB.sequence.state(), en: (RB.ui.dialogue.shown() || {}).en || null, n: RB.game.s.backlog.length, done: window.__done, open: RB.ui.dialogue.isOpen(), choices: !!document.querySelector('.choices:not(.hidden) .choice'), card: !!document.querySelector('.banner-layer'), confirm: !!document.querySelector('.csheet'), reviewing: !!document.querySelector('#ui .dlg.reviewing') }));
const settled = (p) => p.waitForFunction(() => { const s = RB.sequence.state(); return !s || s.state !== 'entering'; }, null, { timeout: 5000 }).catch(() => {});
const campaign = (p) => p.evaluate(() => { const s = RB.game.s; const q = Object.fromEntries(Object.entries(s.quests).map(([k, v]) => [k, { stage: v.stage, done: v.done }])); return JSON.stringify({ flags: s.flags, vars: s.vars, inv: s.inv, q, notes: s.notebook.map((n) => n.id), company: s.company, words: s.words, learn: Object.keys(s.learn.items).length, seq: s.seq, map: s.map, x: s.x, y: s.y }); });
async function clickChoice(p, re) {
  const i = await p.evaluate((src) => [...document.querySelectorAll('.choices:not(.hidden) .choice')].findIndex((c) => new RegExp(src).test(c.textContent)), re.source);
  await p.locator('.choices:not(.hidden) .choice').nth(Math.max(0, i)).click();
  return i;
}
// play a run through by hand: Next on every line (after any dissolve), the choice by its text, cards by a tap.
// hook(st, p) runs at each new sequence shot (the first time it is seen)
async function playThrough(p, R, hook) {
  const shots = {}, phases = {};
  let picked = -1;
  for (let i = 0; i < 400; i++) {
    const s = await S(p);
    if (s.done) break;
    if (s.seq) {
      const id = s.seq.id;
      shots[id] = shots[id] || [];
      // (a hook may move a line on: the state is read again before anything is clicked)
      if (shots[id][shots[id].length - 1] !== s.seq.shot) { shots[id].push(s.seq.shot); if (hook) { await hook(s, p); continue; } }
      (phases[s.seq.shot] = phases[s.seq.shot] || new Set()).add(s.seq.phase);
    }
    if (s.confirm) { await p.locator('.csheet button', { hasText: 'Keep watching' }).click(); continue; }
    if (s.choices) { picked = await clickChoice(p, R.pick || /./); await wait(p, 150); continue; }
    if (s.card) { await p.locator('.banner-layer').click().catch(() => {}); await wait(p, 700); continue; }
    if (s.open) { await settled(p); await p.locator('#ui .dlg .b-next').click({ timeout: 3000 }).catch(() => {}); await wait(p, 50); continue; }
    await wait(p, 120);
  }
  const fin = await p.evaluate(() => ({ done: window.__done, seen: window.__seen, live: RB.sequence.active(), shook: window.__shook }));
  return { shots, phases: Object.fromEntries(Object.entries(phases).map(([k, v]) => [k, [...v]])), picked, fin };
}

// ---- 1. every branch by hand -------------------------------------------------------------------------------------
const idleDone = new Set(), prevDone = new Set();
for (const R of RUNS) {
  if (!want(R.key)) continue;
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 720 } });
  await start(p, R);
  const notes = [];
  const r = await playThrough(p, R, async (s) => {
    const id = s.seq.id;
    // once per sequence: 8 s of idle on its second shot (or its only one), then Previous read-only
    const shotsOf = R.expect.find((e) => e[0] === id);
    const target = shotsOf ? shotsOf[1][Math.min(1, shotsOf[1].length - 1)] : null;
    if (s.seq.shot !== target) return;
    await settled(p); await wait(p, 300);
    if (!idleDone.has(id)) {
      idleDone.add(id);
      const a = await S(p);
      await wait(p, IDLE);
      const z = await S(p);
      ok(z.n === a.n && z.en === a.en && z.seq.shot === a.seq.shot && z.seq.beats === a.seq.beats && z.seq.state === 'holding', id + ': ' + IDLE / 1000 + ' s idle on "' + a.seq.shot + '" — same line, same shot, holding (' + z.seq.state + ')');
    }
    if (!prevDone.has(id)) {
      // Escape opens the skip question (it never skips by itself) and Keep watching keeps the line; where lines of
      // the sequence are still ahead (new to this campaign), the Skip button asks first too
      const a = await S(p);
      await p.keyboard.press('Escape'); await wait(p, 150);
      const e1 = await S(p);
      await p.locator('.csheet button', { hasText: 'Keep watching' }).click().catch(() => {}); await wait(p, 120);
      const e2 = await S(p);
      ok(e1.confirm && !e2.confirm && e2.n === a.n && e2.en === a.en && e2.seq && e2.seq.id === id, id + ': Escape asks before any skip; Keep watching keeps the line');
      // is any line between here and the sequence's end new to this campaign? (the player's own reckoning)
      const ahead = await p.evaluate((id) => {
        const L = RB.ui.dialogue.shown() || {}, sc = RB.content.scenes[RB.sequence.get(id).scene], s = RB.game.s;
        const i = sc ? sc.cmds.findIndex((c) => c.op === 'say' && c.jp === L.jp) : -1;
        return { n: (s.seq[id] || { h: [] }).h.length, unseen: i >= 0 && RB.sequence.aheadUnseen(sc, i + 1, id, new Set((s.seq[id] || { h: [] }).h), (cond) => RB.state.test(s, cond)) };
      }, id);
      if (!ahead.unseen) notes.push('(nothing new ahead on ' + id + ' at "' + a.en.slice(0, 30) + '…": the Skip button would skip without asking)');
      else {
        await p.locator('#ui .dlg .b-sskip').click(); await wait(p, 150);
        const k1 = await S(p);
        await p.locator('.csheet button', { hasText: 'Keep watching' }).click().catch(() => {}); await wait(p, 120);
        const k2 = await S(p);
        ok(k1.confirm && !k2.confirm && k2.n === a.n && k2.en === a.en, id + ': Skip scene asks first while part of it is new (' + ahead.n + ' lines seen so far); Keep watching keeps the line');
      }
    }
    if (!prevDone.has(id)) {
      prevDone.add(id);
      // one more line first if there is nothing yet to look back at
      const oneLine = R.expect.find((e) => e[0] === id)[1].length === 1 && ['ch4.inn', 'ch4.morning'].includes(id);
      if (!oneLine && ((await S(p)).seq || {}).beats < 2) { await p.locator('#ui .dlg .b-next').click(); await wait(p, 80); await settled(p); }
      const live = await S(p), before = await campaign(p);
      if (live.seq && live.seq.beats > 1) {
        await p.keyboard.press('KeyP'); await wait(p, 80);
        const v = await S(p);
        await p.locator('#ui .dlg .b-next').click(); await wait(p, 80);
        const back = await S(p);
        const after = await campaign(p);
        ok(v.reviewing && v.en !== live.en && !back.reviewing && back.en === live.en && back.n === live.n && after === before, id + ': Previous looks back read-only and Next comes back to the live line without moving on');
      } else {
        // one line only: Previous is off and P does nothing (no look back, the line stays)
        const dis = await p.evaluate(() => { const b = document.querySelector('#ui .dlg .b-prev'); return !!b && b.disabled; });
        await p.keyboard.press('KeyP'); await wait(p, 80);
        const v = await S(p), after = await campaign(p);
        ok(dis && !v.reviewing && v.en === live.en && v.n === live.n && after === before, id + ': one line only — Previous is off, P looks back at nothing and changes nothing');
      }
    }
  });
  for (const [id, want] of R.expect) ok(JSON.stringify(r.shots[id] || []) === JSON.stringify(want), R.name + ': ' + id + ' shows ' + want.join(' → ') + (JSON.stringify(r.shots[id] || []) !== JSON.stringify(want) ? ' (saw ' + JSON.stringify(r.shots[id] || []) + ')' : ''));
  for (const [shot, ph] of Object.entries(R.phases || {})) ok((r.phases[shot] || []).includes(ph), R.name + ': the "' + ph + '" phase of ' + shot + ' plays on this branch');
  for (const [shot, ph] of Object.entries(R.noPhase || {})) ok(!(r.phases[shot] || []).includes(ph), R.name + ': no "' + ph + '" phase of ' + shot + ' on this branch');
  const st = await p.evaluate((R) => {
    const s = RB.game.s;
    return { seq: Object.fromEntries(R.expect.map(([id]) => [id, s.seq[id] ? s.seq[id].n : 0])), branch: R.branch ? !!s.flags[R.branch] : true, mem: (s.company.memories || []).filter((m) => m.id && m.id.startsWith('seq:')).map((m) => m.id), item: R.item ? s.inv[R.item] || 0 : null, map: s.map, fade: !!document.querySelector('#overlay > .fade.on'), mode: RB.game.mode() };
  }, R);
  ok(r.fin.done && !r.fin.live, R.name + ': the scene runs to its end and no sequence is left open');
  ok(R.expect.every(([id]) => st.seq[id] === 1) && r.fin.seen.filter((e) => e[0] === 'begin').length === R.expect.length, R.name + ': each sequence began and ended once ' + JSON.stringify(st.seq));
  ok(st.branch, R.name + ': the branch taken is the one chosen (' + (R.branch || '-') + ')');
  ok(R.memory ? st.mem.includes(R.memory) : !st.mem.some((m) => /ch4\.(reply|inn|morning)|ch3\.firebreaks/.test(m)), R.name + ': kept memory ' + (R.memory || 'none for this one') + ' ' + JSON.stringify(st.mem));
  if (R.item) ok(st.item === 1, R.name + ': the reply letter was given once (' + st.item + ')');
  ok(!st.fade, R.name + ': the world is not left in the dark at the end');
  ok(!r.fin.shook, R.name + ': nothing shook the screen');
  if (notes.length) console.log('     ' + notes.join(' '));
  ok(!errors.length, R.name + ': no page errors ' + errors.slice(0, 2).join(' | '));
  await ctx.close();
}

// ---- 2. Skip scene: asks first, Keep watching keeps the line, a confirmed skip stops at the choice --------------------
if (want('lamp')) {
  const R = RUNS.find((x) => x.key === 'lamp');
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 720 } });
  await start(p, R);
  await p.waitForFunction(() => !!document.querySelector('#ui > .dlg:not(.hidden) .seq-ctrl'), null, { timeout: 10000 });
  await settled(p);
  const live = await S(p);
  await p.locator('#ui .dlg .b-sskip').click(); await wait(p, 150);
  ok((await S(p)).confirm, 'ch4.lamp: Skip scene asks first (part of the scene is new)');
  await p.locator('.csheet button', { hasText: 'Keep watching' }).click(); await wait(p, 120);
  const k1 = await S(p);
  ok(!k1.confirm && k1.n === live.n && k1.en === live.en, 'ch4.lamp: Keep watching keeps the line');
  await p.locator('#ui .dlg .b-sskip').click(); await wait(p, 150);
  await p.locator('.csheet button', { hasText: 'Skip scene' }).click();
  await p.waitForFunction(() => !!document.querySelector('.choices:not(.hidden) .choice'), null, { timeout: 8000 });
  await wait(p, 800);
  const c = await p.evaluate(() => ({ seq: RB.sequence.state(), flags: Object.keys(RB.game.s.flags).filter((f) => /^sb_hoshino_|^sb_name_done$|^sb_lamp_lit$/.test(f)) }));
  ok(c.seq && c.seq.shot === 'ask' && !c.seq.skip && c.flags.includes('sb_name_done') && !c.flags.some((f) => f.startsWith('sb_hoshino_')) && !c.flags.includes('sb_lamp_lit'), 'ch4.lamp: the confirmed skip ran the state lines before it once, stopped at the choice on its shot, and answered nothing ' + JSON.stringify(c));
  ok(!errors.length, 'skip: no page errors ' + errors.slice(0, 2).join(' | '));
  await ctx.close();
}

// ---- 3. reduced motion: end states at once; no shake ----------------------------------------------------------------
if (want('assembly') || want('morning')) {
  for (const R of [RUNS.find((x) => x.key === 'assembly'), RUNS.find((x) => x.key === 'morning')]) {
    const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 720 } });
    await start(p, R, { reduce: true });
    let checked = 0, bad = [];
    await playThrough(p, R, async () => {
      await settled(p); await wait(p, 120);
      const s = await p.evaluate(() => RB.sequence.state());
      checked++;
      if (!(s && s.state === 'holding' && s.k === 1)) bad.push(s && s.shot + '/' + s.state + '/' + s.k);
    });
    ok(checked > 0 && !bad.length, R.name + ', reduced motion: every shot holds at its end state once its dissolve is over (' + checked + ' shots) ' + JSON.stringify(bad));
    ok(!(await p.evaluate(() => window.__shook)), R.name + ', reduced motion: nothing shook the screen');
    ok(!errors.length, 'reduced motion: no page errors ' + errors.slice(0, 2).join(' | '));
    await ctx.close();
  }
}

// ---- 4. the focal area of every shot, every phase, with and without a companion, at three screen shapes --------------
const IDS = ['ch3.assembly', 'ch3.firebreaks', 'ch4.lamp', 'ch4.reply', 'ch4.inn', 'ch4.morning'];
for (const [tag, vp, dpr] of want('focus') ? [['1280x720', { width: 1280, height: 720 }, 1], ['390x844', { width: 390, height: 844 }, 3], ['844x390', { width: 844, height: 390 }, 3]] : []) {
  const { p, ctx, errors } = await page(b, url, { viewport: vp, dpr, mobile: dpr > 1, touch: dpr > 1 });
  await start(p, RUNS.find((x) => x.key === 'inn'));
  await p.waitForFunction(() => !!RB.sequence.state() && !!RB.sequence.state().vb, null, { timeout: 10000 });
  const r = await p.evaluate((IDS) => {
    const st0 = RB.sequence.state(), [w, h] = st0.wh, vb0 = st0.vb;
    const out = [];
    // the sheet's top moves with the line (its length, a portrait or not): the one on screen now and the range a
    // sheet takes at this screen shape (a phone on its side: from about a third of the height to two thirds)
    const vbs = [vb0].concat(w / h > 1.45 && h < 300 ? [Math.round(h * 0.28), Math.round(h * 0.5), Math.round(h * 0.66)] : [Math.round(h * 0.6), Math.round(h * 0.72)]);
    for (const vb of vbs) for (const comp of [null, 'mio', 'nao']) for (const flags of [[], ['co_asm_names', 'co_bell_rung', 'sb_hoshino_goes']]) for (const id of IDS) {
      const def = RB.sequence.get(id);
      for (const shot of Object.keys(def.shots)) for (const ph of def.shots[shot].phases) for (const still of [false, true]) {
        const c = document.createElement('canvas'); c.width = w; c.height = h;
        let st = null, err = null;
        try { st = RB.sequence.drawAt(c.getContext('2d'), w, h, { seq: id, shot, phase: ph.id, k: 1, vb, still, t: 3000, cast: { pc: RB.equip.look(RB.game.s), comp: comp ? { id: comp, look: RB.content.chars[comp].look } : null }, test: (cond) => flags.includes(cond) }); } catch (e) { err = String(e); }
        const f = st && st.focusRect;
        out.push({ id: id + '/' + shot + '/' + ph.id + '@' + vb, f, err, ok: !err && !!f && f.y >= -2 && f.y + f.h <= vb + 4 && f.x >= -4 && f.x + f.w <= w + 4 && f.w > 8 && f.h > 8 });
      }
    }
    return { w, h, vb: vbs.join('/'), n: out.length, bad: out.filter((x) => !x.ok) };
  }, IDS);
  ok(!r.bad.length, tag + ': every Chapter 3–4 shot\'s focal area sits above the sheet (' + r.n + ' drawings; buffer ' + r.w + '×' + r.h + ', sheet top ' + r.vb + ')' + (r.bad.length ? ' ' + JSON.stringify(r.bad.slice(0, 3)) : ''));
  ok(!errors.length, tag + ': no page errors ' + errors.slice(0, 2).join(' | '));
  await ctx.close();
}

await b.close();
srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
