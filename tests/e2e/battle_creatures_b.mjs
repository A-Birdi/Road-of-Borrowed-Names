// Creatures B in real battles (battle addendum §9, §10, §23.5), against the built index.html in
// Chromium: every enemy of the Chapter 4–6 and Atlas families (sb_snowfox, lantern, sb_frostlamp,
// lf_conduit, bell, lf_keeper, hush, sa_hush, fox, atlas_cartographer) performs every move its
// pattern and phases use, in a synthetic campaign (fresh browser context each).
// DIAGNOSTIC FIXTURES: each battle is started directly (RB.game.debugStart + startBattle) with
// Mio as the companion so a Sweep shows two recipients; the move is set as the creature's
// intent before the round (BA.setIntent), the Hush on the party is lifted and both of you are
// topped up between rounds so every move can be shown. None of this is a natural encounter.
// For each move:
// - the response (Unravel, answered with the real mouse) and Mio's turn, then the creature's move;
// - the creature's own delivery plays: its authored acts (prep:/exec:/cast:/recover:) and its
//   effects, no generic dart/arc fallback;
// - every rules result is shown exactly once (the sequence's beats against the rules' fx), in
//   order, and the display ends equal to the rules;
// - the ward path: a Strike met by a raised seal plays the creature's approach, the seal, and
//   its balk (one per family with a Strike);
// - reduced motion: one held key pose, no travel, the same results;
// - an Atlas group (three creatures, Demanding) where each acts with its own delivery;
// - no page errors or failed cues.
// Captures (with --shots): a strip of key moments of one move per family, and the timing trace,
// in tests/e2e/out/battle_creatures_b/ (WebP copies in docs/screenshots/battle/creatures_b/
// with --docs).
// Usage: node tests/e2e/battle_creatures_b.mjs [filter] [--shots] [--docs]
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root, companionTurn } from './lib.mjs';

const args = process.argv.slice(2);
const only = args.find((a) => !a.startsWith('--'));
const shots = args.includes('--shots') || args.includes('--docs');
const toDocs = args.includes('--docs');
const outDir = path.join(root, 'tests', 'e2e', 'out', 'battle_creatures_b');
const docDir = path.join(root, 'docs', 'screenshots', 'battle', 'creatures_b');
fs.mkdirSync(outDir, { recursive: true });
if (toDocs) fs.mkdirSync(docDir, { recursive: true });
const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const results = [], timings = [];
async function test(name, fn) {
  if (only && !name.includes(only)) return;
  try { await Promise.race([fn(), new Promise((_, rej) => setTimeout(() => rej(new Error('test timed out after 420s')), 420000))]); pass++; results.push('PASS ' + name); console.log('PASS ' + name); }
  catch (e) { fail++; results.push('FAIL ' + name); console.log('FAIL ' + name + ': ' + String(e && e.stack || e).slice(0, 1800)); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };
const wait = (p, ms) => p.waitForTimeout(ms);
const DESK = { viewport: { width: 1280, height: 800 } };
const MOVES = ['strike', 'sweep', 'rest', 'heat', 'shroud', 'charge', 'gust', 'mend', 'lie', 'plea', 'flood', 'chill', 'silence', 'mirror'];
// every enemy of these families and every move its pattern and phases use (docs/battle/INVENTORY.md)
const ROSTER = [
  ['sb.fox', 'sb_snowfox', ['strike', 'rest', 'chill']],
  ['sb.ghost', 'lantern', ['strike', 'lie', 'mend', 'rest']],
  ['sb.boss', 'sb_frostlamp', ['chill', 'strike', 'rest', 'plea']],
  ['lf.conduit', 'lf_conduit', ['mend', 'silence', 'sweep', 'rest']],
  ['lf.wraith', 'bell', ['charge', 'sweep', 'silence', 'strike']],
  ['lf.keeper', 'lf_keeper', ['silence', 'strike', 'lie', 'rest', 'flood', 'plea', 'charge']],
  ['sa.wraith', 'hush', ['silence', 'strike', 'mend', 'rest']],
  ['sa.ghost', 'lantern', ['shroud', 'heat', 'strike', 'rest']],
  ['sa.hush', 'sa_hush', ['silence', 'strike', 'shroud', 'mend', 'heat', 'gust', 'charge', 'lie', 'mirror', 'chill', 'plea', 'flood', 'sweep']],
  ['atlas.bell', 'bell', ['lie', 'strike', 'rest', 'sweep', 'charge']],
  ['atlas.cartographer', 'atlas_cartographer', ['rest', 'strike', 'plea', 'sweep', 'shroud']],
  ['atlas.fox', 'fox', ['lie', 'rest', 'sweep']],
  ['atlas.lamp', 'lantern', ['heat', 'strike', 'rest']],
  ['atlas.mothlamp', 'lantern', ['shroud', 'heat', 'strike', 'rest']],
];
// the move captured for each enemy (with --shots): its most characteristic one
const SHOT = { 'sb.fox': 'strike', 'sb.ghost': 'lie', 'sb.boss': 'chill', 'lf.conduit': 'sweep', 'lf.wraith': 'strike', 'lf.keeper': 'flood', 'sa.wraith': 'silence', 'sa.ghost': 'heat', 'sa.hush': 'strike', 'atlas.bell': 'sweep', 'atlas.cartographer': 'sweep', 'atlas.fox': 'sweep', 'atlas.lamp': 'strike', 'atlas.mothlamp': 'shroud' };
const GENERIC = ['dart', 'arc', 'pane', 'gust', 'gather', 'mistRoll', 'hushWave', 'mendThread', 'note'];

async function helpers(p) {
  await p.evaluate(() => {
    const pick = (x) => x && { pc: x.pc, comp: x.comp, ward: Object.assign({}, x.ward), silenced: x.silenced || 0, harmony: x.harmony, foes: (x.foes || []).map((f) => ({ knots: f.knots, heat: f.heat, shroud: !!f.shroud, charged: !!f.charged })) };
    const BA = (window.BA = { exch: [], samples: [], sampling: false, pick, errors: 0 });
    const L = RB.combatLogic;
    for (const k of ['playerAct', 'compAct', 'enemyAct']) {
      const f = L[k];
      L[k] = function (st, ...a) { const r = f.call(this, st, ...a); BA.exch.push({ k, fx: k === 'enemyAct' ? JSON.parse(JSON.stringify(r)) : null }); return r; };
    }
    const runStep = RB.challenge.runStep;
    RB.challenge.runStep = (step, o) => { window.__step = step; return runStep(step, o); };
    BA.sampleOn = () => {
      BA.samples = []; BA.sampling = true;
      const loop = () => {
        if (!BA.sampling) return;
        const d = RB.combat.debug(), f = d.stage.frame;
        BA.samples.push({ busy: d.seq.running, kind: d.seq.kind, foes: f && f.foes.map((x) => x.act), effects: f && f.effects, poses: f && f.poses, off: f && f.foeOff, errors: d.seq.counters.errors || 0 });
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    };
    BA.sampleOff = () => { BA.sampling = false; return BA.samples; };
    // captures: the next creature sequence plays on a slowed clock (set before it starts, so the
    // sequencer's watchdog allows for it); the clock is restored when it ends
    const run = RB.battleSeq.run;
    RB.battleSeq.run = function (kind, cues, meta) {
      if (kind === 'enemy' && BA.slowNext) {
        const k = BA.slowNext; BA.slowNext = 0;
        RB.battleSeq.setTimeScale(k);
        BA.slowT0 = RB.battleSeq.now();
        return run.call(this, kind, cues, meta).then((r) => { RB.battleSeq.setTimeScale(BA.fast || 3); BA.slowT0 = null; return r; });
      }
      return run.call(this, kind, cues, meta);
    };
    BA.right = () => {
      const st = window.__step, bs = [...document.querySelectorAll('.chal .mc .btn')];
      const txt = (h) => { const d = document.createElement('div'); d.innerHTML = h; return d.textContent.replace(/\s+/g, ' ').trim(); };
      const html = (o) => o.text != null ? RB.ui.jhtml(o.text) : (o.jp ? RB.ui.jhtml(o.jp) : '') + (o.en ? '<span class="enline">' + RB.util.esc(o.en) + '</span>' : '');
      const right = RB.challenge.choicesFor(st).filter((o) => o.ok).map((o) => txt(html(o)));
      const el = bs.find((x) => right.includes(x.textContent.replace(/\s+/g, ' ').trim()));
      el.scrollIntoView({ block: 'center' });
      const q = el.getBoundingClientRect();
      return { x: q.left + q.width / 2, y: q.top + q.height / 2 };
    };
    // the next round's move for creature i (a diagnostic intent; 'rand' becomes `target`)
    BA.setIntent = (kind, target, i) => {
      const st = RB.combat.state(), L = RB.combatLogic;
      const it = Object.assign(L.intentDef({}, kind), target ? { target } : {});
      if (it.target === 'rand') it.target = target || 'pc';
      if (st.foes && st.foes.length > 1) { st.foes[i || 0].intent = it; if ((i || 0) === st.cur) st.intent = it; } else st.intent = it;
      RB.combat.refresh();
      return it.kind;
    };
    // between rounds (diagnostic): both of you topped up, the Hush lifted, knots kept from running out
    BA.prime = (o) => {
      const st = RB.combat.state();
      st.pc = st.max; if (st.compId) st.comp = st.max;
      st.silenced = 0;
      if (o && o.ward) for (const w of Object.keys(o.ward)) st.ward[w] = o.ward[w];
      for (const f of st.foes || []) { if (f.knots > 0 && f.knots < 3) f.knots = Math.min(f.maxKnots, 3); f.shroud = false; }
      if (st.knots != null && st.knots > 0 && st.knots < 3) st.knots = Math.min(st.maxKnots, 3);
      RB.combat.refresh();
    };
  });
}
async function battle(p, enemy, o) {
  o = o || {};
  await p.evaluate(([enemy, o]) => {
    const s = RB.game.debugStart('rw.millroad', 10, 22, { comp: o.solo ? null : 'mio' });
    s.learn.kanaKnown = 'both'; s.learn.profile = 'E'; s.learn.difficulty = o.diff || 'normal';
    s.words = ['mamoru', 'mizu', 'hikari'];
    s.tips = Object.assign({ harmony: 1, harmonyFull: 1, cturn: 1, group: 1 }, ...['strike', 'sweep', 'rest', 'heat', 'shroud', 'charge', 'gust', 'mend', 'lie', 'plea', 'flood', 'chill', 'silence', 'mirror'].map((k) => ({ ['intent:' + k]: 1 })), ...s.words.map((w) => ({ ['word:' + w]: 1 })));
    RB.game.settings.input = 'choice';
    RB.game.settings.textSpeed = 'normal';
    RB.game.settings.reducedMotion = !!o.reduce; RB.game.applySettings();
    RB.battleSeq.setTimeScale(o.timeScale || 3);
    window.__result = null;
    RB.game.startBattle(enemy, o.group ? { group: o.group } : {}).then((r) => { window.__result = r || 'done'; });
  }, [enemy, o]);
  await cards(p);
}
async function cards(p) {
  for (let i = 0; i < 400; i++) {
    const st = await p.evaluate(() => ({ dlg: RB.ui.dialogue.isOpen(), cards: !!document.querySelector('.rcard[data-i]') && !document.querySelector('.chal') && !RB.battleSeq.busy(), coach: !!document.querySelector('[data-coach-ok]'), teach: !!document.querySelector('button[data-ok]') }));
    if (st.cards) break;
    if (st.coach) await p.click('[data-coach-ok]').catch(() => {});
    if (st.teach) await p.click('button[data-ok]').catch(() => {});
    if (st.dlg) await p.evaluate(() => RB.ui.dialogue.advance(true));
    await wait(p, 50);
  }
  await p.waitForSelector('.rcard[data-i]');
  await wait(p, 100);
}
const center = (p, sel) => p.evaluate((s) => { const e = document.querySelector(s); if (!e) return null; e.scrollIntoView({ block: 'nearest' }); const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, sel);
// a response chosen with the mouse and answered with the right option (or the game's own
// "I don't know" for an ordering task); then Mio's turn (her first available action)
async function respond(p, match) {
  const i = await p.evaluate((m) => { const c = [...document.querySelectorAll('.rcard')].find((x) => !x.disabled && new RegExp(m, 'i').test(x.textContent.replace(/\s+/g, ' '))); return c ? c.getAttribute('data-i') : null; }, match);
  assert(i != null, 'no enabled response matching ' + match);
  const c = await center(p, '.rcard[data-i="' + i + '"]');
  await p.mouse.click(c.x, c.y);
  await p.waitForSelector('.chal');
  await p.waitForSelector('.chal .mc .btn, .chal [data-a=reveal], #ime-in', { timeout: 8000 });
  if (await p.$('.chal .mc .btn')) {
    const r = await p.evaluate(() => BA.right());
    await p.mouse.click(r.x, r.y);
    await p.waitForSelector('.fbwrap .fb-go');
  } else {
    const rv = await center(p, '.chal [data-a=reveal]');
    await p.mouse.click(rv.x, rv.y);
    await p.waitForSelector('.fbwrap .fb-go');
  }
  const g = await center(p, '.fbwrap .fb-go');
  await p.mouse.click(g.x, g.y);
  await companionTurn(p, { match: 'draught|salve|tonic|beside' }).catch(() => companionTurn(p, {}));
}
async function idle(p) {
  const t0 = Date.now();
  let s = null;
  while (Date.now() - t0 < 90000) {
    s = await p.evaluate(() => ({ busy: RB.battleSeq.busy(), kind: RB.battleSeq.stats().kind, phase: RB.combat.phase(), cards: !!document.querySelector('.rcard[data-i]') && !document.querySelector('.chal'), ccards: !!document.querySelector('.ccard:not([disabled])'), dlg: RB.ui.dialogue.isOpen(), mode: RB.game.mode(), res: window.__result, coach: !!document.querySelector('[data-coach-ok]'), teach: !!document.querySelector('button[data-ok]') }));
    if (s.coach) await p.click('[data-coach-ok]').catch(() => {});
    // a guardian's new phase is told (its own line) and explained on a card: read, then "Got it"
    if (!s.busy && s.teach) await p.click('button[data-ok]').catch(() => {});
    if (!s.busy && (s.cards || s.mode !== 'combat' || s.res)) { await wait(p, 60); return s; }
    if (!s.busy && s.dlg) { await p.evaluate(() => RB.ui.dialogue.advance(true)); }
    if (!s.busy && s.ccards && s.phase === 'companion') await companionTurn(p, {}).catch(() => {});
    await wait(p, 40);
  }
  throw new Error('the exchange did not settle: ' + JSON.stringify(s));
}
// One round in which creature i performs `kind` (after an Unravel); returns what was seen.
async function round(p, kind, o) {
  o = o || {};
  await p.evaluate((o) => { BA.prime(o); BA.exch = []; }, o);
  const target = o.target || (['strike', 'lie', 'mirror', 'chill'].includes(kind) ? 'pc' : null);
  await p.evaluate(([k, t, i]) => BA.setIntent(k, t, i), [kind, target, o.foe || 0]);
  await p.evaluate(() => BA.sampleOn());
  const shot = o.shots ? captureMove(p, o.shots) : null;
  // a response that leaves the move alone: Unravel (unless the mist hides the knots, or it would
  // answer a rest); water (it only answers Heat); light (it answers Shroud, Re-tying and Mirror)
  let resp = o.response;
  if (!resp) {
    const en = await p.evaluate(() => [...document.querySelectorAll('.rcard')].filter((x) => !x.disabled).map((x) => x.textContent.replace(/\s+/g, ' ')));
    const has = (re) => en.some((t) => new RegExp(re, 'i').test(t));
    const cand = [];
    if (!(kind === 'rest' && !o.countered)) cand.push('Unravel|ほどく');
    if (kind !== 'heat') cand.push('water|水');
    if (!['shroud', 'mend', 'mirror'].includes(kind)) cand.push('light|光');
    resp = cand.find(has) || cand[0];
  }
  await respond(p, resp);
  await idle(p);
  if (shot) await compose(await shot, o.shots.name);
  const S = await p.evaluate(() => BA.sampleOff());
  const tr = await p.evaluate(() => RB.combat.debug().trace);
  const ex = await p.evaluate(() => BA.exch.filter((x) => x.k === 'enemyAct'));
  const end = await p.evaluate(() => ({ shown: BA.pick(RB.combat.shown()), real: BA.pick(RB.combat.state()), result: window.__result }));
  const enemySeq = tr.filter((r) => r.kind === 'enemy');
  return { S, tr, enemySeq, ex, end, E: S.filter((s) => s.busy && s.kind === 'enemy') };
}
const uniq = (a) => [...new Set(a)];
function seqOf(values) { const out = []; for (const v of values) if (v != null && out[out.length - 1] !== v) out.push(v); return out; }

// Stage captures during one creature's move: the presentation clock slowed, a clip of the
// stage at fixed presentation times (ms from the move's start). Resolves to the file names.
async function captureMove(p, o) {
  const at = o.at || [0, 200, 420, 640, 800, 1000, 1250];
  const files = [];
  await p.evaluate(() => { BA.slowNext = 0.1; BA.slowT0 = null; });
  // wait for the creature's sequence to begin (on the slowed clock)
  for (let i = 0; i < 1500; i++) { const k = await p.evaluate(() => BA.slowT0 != null); if (k) break; await wait(p, 10); }
  const clip = await p.evaluate(() => {
    const d = RB.combat.debug().stage, L = d.lay, cp = d.cssPerArt, cv = document.querySelector('#world').getBoundingClientRect();
    const xs = [L.party.x, L.party.x + L.party.w].concat(...L.foes.map((f) => [f.left, f.right])), ys = [L.party.y, L.party.y + L.party.h].concat(...L.foes.map((f) => [f.top, f.bottom]));
    const x0 = Math.max(0, cv.left + (Math.min(...xs) - 20) * cp), y0 = Math.max(0, cv.top + (Math.min(...ys) - 30) * cp);
    return { x: Math.round(x0), y: Math.round(y0), width: Math.round(Math.min(innerWidth - x0, (Math.max(...xs) - Math.min(...xs) + 40) * cp)), height: Math.round(Math.min(innerHeight - y0, (Math.max(...ys) - Math.min(...ys) + 50) * cp)) };
  });
  for (const ms of at) {
    let s = null;
    for (let i = 0; i < 4000; i++) { s = await p.evaluate(() => ({ el: BA.slowT0 == null ? null : RB.battleSeq.now() - BA.slowT0 })); if (s.el == null || s.el >= ms) break; await wait(p, 5); }
    if (s.el == null) break;
    const f = path.join(outDir, o.name + '_' + String(ms).padStart(4, '0') + '.png');
    await p.screenshot({ path: f, clip });
    files.push(f);
  }
  return files;
}

// Compose captured frames into one strip (labelled with their presentation times): PNG in the
// output folder and, with --docs, a WebP for the record.
async function compose(files, name, cols) {
  if (!files || !files.length) return null;
  const pg = await b.newPage();
  const data = files.map((f) => 'data:image/png;base64,' + fs.readFileSync(f).toString('base64'));
  const labels = files.map((f) => path.basename(f).replace(/\.png$/, '').split('_').pop().replace(/^0+(?=\d)/, '') + ' ms');
  const out = await pg.evaluate(async ([data, labels, cols]) => {
    const ims = await Promise.all(data.map(async (u) => { const im = new Image(); im.src = u; await im.decode(); return im; }));
    const w = ims[0].width, h = ims[0].height, n = ims.length, c0 = cols || Math.min(n, 4), r0 = Math.ceil(n / c0), sc = w > 520 ? 0.5 : 1;
    const cv = document.createElement('canvas'); cv.width = Math.round(c0 * w * sc); cv.height = Math.round(r0 * h * sc);
    const g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
    ims.forEach((im, i) => { const x = (i % c0) * w * sc, y = Math.floor(i / c0) * h * sc; g.drawImage(im, x, y, w * sc, h * sc); g.fillStyle = 'rgba(20,16,28,0.75)'; g.fillRect(x, y, 74, 20); g.fillStyle = '#efe4c8'; g.font = '13px monospace'; g.fillText(labels[i], x + 6, y + 14); });
    return { png: cv.toDataURL('image/png'), webp: cv.toDataURL('image/webp', 0.9) };
  }, [data, labels, cols]);
  await pg.close();
  fs.writeFileSync(path.join(outDir, 'strip_' + name + '.png'), Buffer.from(out.png.split(',')[1], 'base64'));
  if (toDocs) fs.writeFileSync(path.join(docDir, 'strip_' + name + '.webp'), Buffer.from(out.webp.split(',')[1], 'base64'));
  return name;
}

// ---------------------------------------------------------------------------------------------------
for (const [enemy, fam, moves] of ROSTER) {
  await test(enemy + ' (' + fam + '): every move it uses plays its own delivery; each result once; display = rules', async () => {
    const { p, errors, ctx } = await page(b, url, DESK);
    p.on('pageerror', (e) => console.log('  page error (' + enemy + '):', e.message, (e.stack || '').split('\n').slice(0, 3).join(' | ')));
    await helpers(p);
    await battle(p, enemy, {});
    const ok = await p.evaluate((fam) => RB.combat.members()[0] && RB.enemyArt.P[fam] && !!RB.enemyArt.P[fam].rig, fam);
    assert(ok, enemy + ': the ' + fam + ' rig is defined');
    const row = [];
    for (const kind of moves) {
      if (process.env.CBV) console.log('  ', enemy, kind);
      const r = await round(p, kind, { shots: shots && kind === SHOT[enemy] && { name: enemy + '_' + kind, at: [0, 150, 300, 450, 600, 700, 800, 950, 1100, 1300, 1500, 1800] } });
      assert(!r.end.result || r.end.result === 'done', enemy + ' ' + kind + ': battle went on');
      const seqR = r.enemySeq[r.enemySeq.length - 1];
      assert(seqR && seqR.meta.kind === kind, enemy + ' ' + kind + ': the creature performed it: ' + JSON.stringify(r.enemySeq.map((x) => x.meta.kind)));
      const acts = seqOf(r.E.map((s) => s.foes && s.foes[0]));
      const effects = uniq([].concat(...r.E.map((s) => s.effects || [])).map((e) => e.split(/[>@]/)[0]));
      if (kind === 'rest') {
        assert(acts.includes('rest'), enemy + ' rest: its authored rest: ' + acts.join('→'));
        // an Unravel answers a rest: the move that began comes to nothing (its own prep and balk)
        const r2 = await round(p, 'rest', { countered: true });
        const acts2 = seqOf(r2.E.map((s) => s.foes && s.foes[0]));
        const posed = await p.evaluate((fam) => Object.keys(RB.enemyArt.P[fam].poses), fam);
        assert(acts2.join() === 'prep,balk' && posed.includes('prep') && posed.includes('balk'), enemy + ' answered rest: its own wind-up and balk: ' + acts2.join('→'));
      }
      else {
        assert(acts.some((a) => /^(prep|exec|cast):/.test(a)), enemy + ' ' + kind + ': its own authored acts: ' + acts.join('→'));
        assert(!effects.some((e) => GENERIC.includes(e)), enemy + ' ' + kind + ': no generic fallback effect: ' + effects.join(','));
      }
      // every rules result, once, in order
      const fx = (r.ex[r.ex.length - 1] || { fx: [] }).fx;
      const beats = seqR.beats.map((x) => x.t).filter((t) => t !== 'spent');
      const want = fx.map((f) => f.t);
      assert(JSON.stringify(beats.filter((t) => want.includes(t))) === JSON.stringify(want), enemy + ' ' + kind + ': results once each, in order: beats ' + beats.join(',') + ' / rules ' + want.join(','));
      assert(JSON.stringify(r.end.shown) === JSON.stringify(r.end.real), enemy + ' ' + kind + ': the display ends equal to the rules');
      assert(!r.S.some((s) => s.errors), enemy + ' ' + kind + ': no failed cue');
      const first = seqR.beats.find((x) => ['hit', 'block', 'heat', 'shroud', 'charge', 'silence', 'mend', 'plea', 'stripWard', 'rest'].includes(x.t));
      row.push({ kind, acts, effects, beats: seqR.beats.map((x) => x.t + '@' + x.at), contact: first ? first.at : null, dur: seqR.dur });
    }
    timings.push({ enemy, fam, row });
    assert(!errors.length, errors.join('; '));
    await ctx.close();
  });
}

// ---------------------------------------------------------------------------------------------------
// The ward path: a Strike (or a single-target move) meets the seal raised in front of its target.
const WARDED = [['sb.fox', 'strike'], ['sb.ghost', 'strike'], ['sb.boss', 'strike'], ['lf.wraith', 'strike'], ['lf.keeper', 'strike'], ['sa.wraith', 'strike'], ['sa.hush', 'strike'], ['atlas.cartographer', 'strike']];
for (const [enemy, kind] of WARDED) {
  await test(enemy + ': a ' + kind + ' met by a raised seal — its approach, the seal, its balk; no hit', async () => {
    const { p, errors, ctx } = await page(b, url, DESK);
    await helpers(p);
    await battle(p, enemy, { solo: true });
    // protect raised on you (the seal waits for the blow): the response itself is the ward
    const r = await round(p, kind, { target: 'pc', response: 'protect|守る' });
    const seqR = r.enemySeq[r.enemySeq.length - 1];
    const acts = seqOf(r.E.map((s) => s.foes && s.foes[0]));
    const effects = uniq([].concat(...r.E.map((s) => s.effects || [])).map((e) => e.split(/[>@]/)[0]));
    assert(seqR.beats.some((x) => x.t === 'countered') && !seqR.beats.some((x) => x.t === 'hit'), 'countered, no hit: ' + JSON.stringify(seqR.beats));
    assert(effects.includes('sealBlock'), 'the seal blocks: ' + effects.join(','));
    assert(acts.some((a) => /^exec:/.test(a)) && acts.includes('balk'), 'its approach, then its balk: ' + acts.join('→'));
    assert(!errors.length, errors.join('; '));
    await ctx.close();
  });
}

// ---------------------------------------------------------------------------------------------------
await test('reduced motion: one held key pose, no travel, the same results (the Keeper\'s Flood, the Bell\'s Strike)', async () => {
  const { p, errors, ctx } = await page(b, url, DESK);
  await helpers(p);
  await battle(p, 'lf.keeper', { reduce: true });
  for (const kind of ['flood', 'strike']) {
    const r = await round(p, kind);
    const acts = seqOf(r.E.map((s) => s.foes && s.foes[0]));
    assert(acts.length && acts.every((a) => a === 'key:' + kind || a === 'release' || a === 'recoil'), kind + ': one held key pose: ' + acts.join('→'));
    assert(r.E.every((s) => !s.off || (s.off.dx === 0 && s.off.dy === 0)), kind + ': no travel');
    const seqR = r.enemySeq[r.enemySeq.length - 1], fx = r.ex[r.ex.length - 1].fx;
    assert(JSON.stringify(seqR.beats.map((x) => x.t).filter((t) => fx.some((f) => f.t === t))) === JSON.stringify(fx.map((f) => f.t)), kind + ': the same results');
    assert(JSON.stringify(r.end.shown) === JSON.stringify(r.end.real), kind + ': display = rules');
  }
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------------------------------
await test('an Atlas group (Demanding, three creatures: Moth and Lantern with a Name-borrowing Fox and a Guttering Lantern) — each acts with its own delivery', async () => {
  const { p, errors, ctx } = await page(b, url, DESK);
  await helpers(p);
  await battle(p, 'atlas.mothlamp', { diff: 'hard', group: ['atlas.fox', 'atlas.lamp'] });
  const m = await p.evaluate(() => RB.combat.members());
  assert(m.length === 3, 'three creatures: ' + m.join(','));
  await p.evaluate(() => { BA.prime(); BA.exch = []; BA.setIntent('heat', null, 0); BA.setIntent('sweep', null, 1); BA.setIntent('strike', 'pc', 2); BA.sampleOn(); });
  await respond(p, 'Unravel|ほどく');
  await idle(p);
  const S = await p.evaluate(() => BA.sampleOff());
  const E = S.filter((s) => s.busy && s.kind === 'enemy');
  const tr = (await p.evaluate(() => RB.combat.debug().trace)).filter((r) => r.kind === 'enemy');
  assert(tr.length >= 3, 'three creature sequences: ' + tr.length);
  for (let i = 0; i < 3; i++) {
    const acts = seqOf(E.map((s) => s.foes && s.foes[i]));
    assert(acts.some((a) => /^(prep|exec|cast):/.test(a)), 'creature ' + i + ' (' + m[i] + ') performs its own move: ' + acts.join('→'));
  }
  if (shots) await p.screenshot({ path: path.join(outDir, 'atlas_group.png') });
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

fs.writeFileSync(path.join(outDir, 'timings.json'), JSON.stringify(timings, null, 1));
console.log('\n' + results.join('\n'));
console.log(`\n${pass} passed, ${fail} failed`);
await b.close(); srv.close();
process.exit(fail ? 1 : 0);
