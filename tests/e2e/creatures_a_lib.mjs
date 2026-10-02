// Helpers for the Creatures A browser tests (tests/e2e/creatures_a*.mjs): a synthetic campaign
// in a fresh context, a battle started as a placement would start it, responses chosen and
// answered with the real mouse, the enemy's move sampled frame by frame, and the rules' calls
// counted (each must run once per exchange). Never a player's save.
import { companionTurn } from './lib.mjs';

export const MOVES = ['strike', 'sweep', 'rest', 'heat', 'shroud', 'charge', 'gust', 'mend', 'lie', 'plea', 'flood', 'chill', 'silence', 'mirror'];
export const wait = (p, ms) => p.waitForTimeout(ms);

export async function helpers(p) {
  await p.evaluate(() => {
    const pick = (x) => x && { pc: x.pc, comp: x.comp, ward: Object.assign({}, x.ward), harmony: x.harmony, foes: (x.foes || []).map((f) => ({ knots: f.knots, shroud: !!f.shroud, heat: f.heat, charged: !!f.charged })) };
    const CA = (window.CA = { calls: { playerAct: 0, compAct: 0, enemyAct: 0, endRound: 0 }, exch: [], samples: [], sampling: false, pick });
    const L = RB.combatLogic;
    for (const k of ['playerAct', 'compAct', 'enemyAct', 'endRound']) {
      const f = L[k];
      L[k] = function (st, ...a) {
        CA.calls[k]++;
        const before = JSON.parse(JSON.stringify(pick(st)));
        const r = f.call(this, st, ...a);
        CA.exch.push({ k, before, after: JSON.parse(JSON.stringify(pick(st))), fx: k === 'playerAct' || k === 'compAct' ? r.fx : k === 'enemyAct' ? r : null });
        return r;
      };
    }
    const run = RB.challenge.runStep;
    RB.challenge.runStep = (step, o) => { window.__step = step; return run(step, o); };
    CA.right = () => {
      const st = window.__step, bs = [...document.querySelectorAll('.chal .mc .btn')];
      const txt = (h) => { const d = document.createElement('div'); d.innerHTML = h; return d.textContent.replace(/\s+/g, ' ').trim(); };
      const html = (o) => o.text != null ? RB.ui.jhtml(o.text) : (o.jp ? RB.ui.jhtml(o.jp) : '') + (o.en ? '<span class="enline">' + RB.util.esc(o.en) + '</span>' : '');
      const right = RB.challenge.choicesFor(st).filter((o) => o.ok).map((o) => txt(html(o)));
      const el = bs.find((x) => right.includes(x.textContent.replace(/\s+/g, ' ').trim()));
      el.scrollIntoView({ block: 'center' });
      const q = el.getBoundingClientRect();
      return { x: q.left + q.width / 2, y: q.top + q.height / 2 };
    };
    // one telegraphed move for creature i (as the rules would draw it; a test fixture)
    CA.setIntent = (kind, target, i) => {
      const st = RB.combat.state();
      const it = Object.assign(RB.combatLogic.intentDef({}, kind), target ? { target } : {});
      if (it.target === 'rand') it.target = 'pc';
      if (i != null && st.foes && st.foes[i]) { st.foes[i].intent = it; if (i === st.cur) st.intent = it; }
      else st.intent = it;
      RB.combat.refresh();
      return it.kind;
    };
    CA.sampleOn = () => {
      CA.samples = []; CA.sampling = true;
      const loop = () => {
        if (!CA.sampling) return;
        const d = RB.combat.debug(), f = d.stage.frame;
        CA.samples.push({ t: performance.now(), pt: RB.battleSeq.now(), phase: d.phase, busy: d.seq.running, kind: d.seq.kind, foe: f && f.foe, foes: f && f.foes, foeOff: f && f.foeOff, marks: f && f.marks, effects: f && f.effects, poses: f && f.poses, shown: pick(RB.combat.shown()) });
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    };
    CA.sampleOff = () => { CA.sampling = false; return CA.samples.length; };
  });
}

// A synthetic campaign on a map, then the battle as the placement there would start it.
// o: { map, x, y, foe (placement id) | enemy, group, comp, words, diff, speed, reduce, timeScale }
export async function battle(p, o) {
  await p.evaluate((o) => {
    const s = RB.game.debugStart(o.map, o.x || 5, o.y || 5, { comp: o.comp || null, flags: o.flags || {} });
    s.learn.kanaKnown = 'both'; s.learn.profile = o.profile || 'E';
    if (o.diff) s.learn.difficulty = o.diff;
    s.words = (o.words || ['mamoru', 'hikari', 'mizu']).slice();
    s.tips = Object.assign({ harmony: 1, harmonyFull: 1, cturn: 1, group: 1 }, ...o.moves.map((k) => ({ ['intent:' + k]: 1 })), ...s.words.map((w) => ({ ['word:' + w]: 1 })));
    RB.game.settings.input = 'choice';
    RB.game.settings.textSpeed = o.speed || 'normal';
    if ('battleSpeed' in RB.game.settings || o.speed) RB.game.settings.battleSpeed = o.speed || 'normal';
    RB.game.settings.reducedMotion = !!o.reduce; RB.game.applySettings();
    RB.battleSeq.setTimeScale(o.timeScale || 1);
    window.__result = null;
    const place = o.foe ? RB.content.maps[o.map].foes.find((f) => f.id === o.foe) : null;
    const opts = place ? { place, where: { map: o.map, x: place.x, y: place.y }, foeKey: 'foe:' + o.map + ':' + place.id } : {};
    if (o.group) opts.group = o.group;
    RB.game.startBattle(place ? place.enemy : o.enemy, opts).then((r) => { window.__result = r || 'done'; });
  }, Object.assign({ moves: MOVES }, o));
  return cards(p);
}
// Through the opening lines until the response cards are up; resolves the lines seen.
export async function cards(p) {
  const lines = [];
  for (let i = 0; i < 400; i++) {
    const s = await p.evaluate(() => ({ r: window.__result, dlg: RB.ui.dialogue.isOpen(), text: (document.querySelector('.dlg:not(.hidden) .d-text, .dlg:not(.hidden)') || {}).textContent || '', cards: !!document.querySelector('.rcard[data-i]') && !document.querySelector('.chal') && !RB.battleSeq.busy() }));
    if (s.cards || s.r) break;
    if (s.dlg) { if (s.text && lines[lines.length - 1] !== s.text) lines.push(s.text.replace(/\s+/g, ' ').trim()); await p.evaluate(() => RB.ui.dialogue.advance(true)); }
    await wait(p, 50);
  }
  await wait(p, 150);
  return lines;
}
const center = (p, sel) => p.evaluate((s) => { const e = document.querySelector(s); if (!e) return null; e.scrollIntoView({ block: 'nearest' }); const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, sel);
// Choose the enabled response card matching `match` and answer it right, with the real mouse.
export async function respond(p, match, o) {
  o = o || {};
  const i = await p.evaluate((m) => { const c = [...document.querySelectorAll('.rcard')].find((x) => !x.disabled && new RegExp(m, 'i').test(x.textContent.replace(/\s+/g, ' '))); return c ? c.getAttribute('data-i') : null; }, match);
  if (i == null) throw new Error('no enabled response card matching ' + match + ': ' + await p.evaluate(() => [...document.querySelectorAll('.rcard')].map((c) => (c.disabled ? '(off) ' : '') + c.textContent.replace(/\s+/g, ' ').slice(0, 50)).join(' | ')));
  const c = await center(p, '.rcard[data-i="' + i + '"]');
  await p.mouse.click(c.x, c.y);
  await p.waitForSelector('.chal');
  await p.waitForSelector('.chal .mc .btn, .chal [data-a=reveal]');
  if (await p.$('.chal .mc .btn')) {
    await wait(p, 120);
    const r = await p.evaluate(() => CA.right());
    await p.mouse.click(r.x, r.y);
    await p.waitForSelector('.fbwrap[data-fb=ok] .fb-go');
    const g = await center(p, '.fbwrap[data-fb=ok] .fb-go');
    if (o.before) await o.before();
    await p.mouse.click(g.x, g.y);
  } else {
    const rv = await center(p, '.chal [data-a=reveal]');
    await p.mouse.click(rv.x, rv.y);
    await p.waitForSelector('.fbwrap .fb-go');
    const g = await center(p, '.fbwrap .fb-go');
    if (o.before) await o.before();
    await p.mouse.click(g.x, g.y);
  }
  if (o.comp !== false) await companionTurn(p, o.comp || {});
}
// until the exchange has played out (cards back, a line, or the end)
export async function idle(p) {
  for (let i = 0; i < 600; i++) {
    const s = await p.evaluate(() => ({ busy: RB.battleSeq.busy(), cards: !!document.querySelector('.rcard[data-i]') && !document.querySelector('.chal'), dlg: RB.ui.dialogue.isOpen(), res: window.__result, ph: RB.combat.phase && RB.combat.phase() }));
    // (a line in the middle of an exchange — a boss's new phase — waits for the reader: that counts too)
    if (!s.busy && (s.dlg || s.res || (s.cards && s.ph !== 'player' && s.ph !== 'enemy' && s.ph !== 'companion'))) return s;
    await wait(p, 40);
  }
  throw new Error('the exchange never finished');
}
// the samples of one phase ('enemy', 'player' …)
export const during = (S, phase) => S.filter((s) => s.phase === phase && s.busy);
export const seq = (a) => a.filter((x, i) => i === 0 || JSON.stringify(x) !== JSON.stringify(a[i - 1]));
