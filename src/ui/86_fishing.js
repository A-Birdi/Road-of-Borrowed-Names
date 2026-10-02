/* A Quiet Cast — the activity (Practice addendum §5–§8, §20). Runs through the
 * shared session owner (RB.activity: one foreground session; eligibility
 * checked again at launch; session.alive() after every await; disposal).
 *
 * A catch (§6.1): choose a patch (or Discover the waters / Look for this
 * fish), the input method, the pace and a suggested number of casts → Cast
 * (the fish and the situation are frozen now) → a cosmetic 2–4 s wait (Skip
 * after the first cast; Settings › fishWait) → a bite that waits as long as
 * you like → the situation and Yasu's note, read without any clock → one
 * authored task through the existing challenge UI → the catch and its
 * learning outcome committed once → the line/rod/water action, the fish, the
 * observation page (until you close it) → release → Cast again / Review / Leave.
 *
 * THE PACE SEAM: every response entry goes through respond() below, which
 * calls RB.pace.attempt(step, o) — Off included — with o.pace from the
 * campaign's setting (RB.practice.settings(s).fishingPace). When the real
 * pace module replaces the provisional one (src/ui/69_pace.js, same API),
 * Gentle/Brisk/Custom work here with no further fishing change: the result's
 * `paced` record is stored in the attempt, and a timed attempt never touches
 * ordinary mastery ({ paced: true } to the learning adapter).
 *
 *   RB.ui.fishing.respond(step, ctx) -> Promise<result>   (the seam)
 *   RB.ui.fishing.current()                               the open activity (tests)
 * Hooks for scenes: fish_go <site> (start once the scene has ended), fish_intro <via>. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.ui.fishing = (function () {
  'use strict';
  const esc = RB.util.esc;
  const F = RB.fishing;
  const I = (n) => RB.ui.folio.icon(n);
  const J = (t) => (t ? RB.ui.jhtml(t) : '');
  const T = (k) => F.text(k);
  const L = (k) => '<span class="jt-wrap">' + J(T(k).jp) + '</span> <span class="en">' + esc(T(k).en) + '</span>';
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  let cur = null; // the open activity's controller (one at a time)

  // a small fish icon for the folio's icon set
  if (RB.ui.folio && RB.ui.folio.ICONS) RB.ui.folio.ICONS.fish = '<path d="M3 12c3-4 8-5 12-3l4-3v12l-4-3c-4 2-9 1-12-3z"/><circle cx="8" cy="11" r="0.9"/>';

  // ---- the seam: one response entry (§7 is the pace module's; §4 the adapter's) ----------------------------------------
  // ctx: { s, header, pace, budgetSec, mode, wrongNote, session }
  function respond(step, ctx) {
    ctx = ctx || {};
    return RB.pace.attempt(step, {
      pace: ctx.pace || 'off', budgetSec: ctx.budgetSec || null, header: ctx.header, ctxTag: 'fishing',
      representation: ctx.representation || null, session: ctx.session || null,
      runOpts: { mode: ctx.mode, cancelLabel: 'Back to the water', continueLabel: 'Bring it in', misread: true, wrongNote: ctx.wrongNote || null },
    });
  }

  // ---- launching from the world (after the station's scene has ended) ------------------------------------------------------
  let pending = null;
  RB.hooks = RB.hooks || {};
  RB.hooks.fish_intro = async (args) => { const s = RB.game.s; if (s) F.intro(s, args[0] || 'note'); };
  RB.hooks.fish_go = async (args) => { pending = { site: args[0], tries: 0 }; };
  function tryLaunch() {
    if (!pending) return;
    if (RB.script.isRunning() || RB.game.mode() !== 'world') {
      if (++pending.tries > 60) { pending = null; return; }
      setTimeout(tryLaunch, 50);
      return;
    }
    const p = pending;
    pending = null;
    RB.activity.launch('fishing', { source: 'world-prop', site: p.site }).then((r) => {
      if (r && !r.ok && r.why) RB.ui.notice(r.why, 'info');
    });
  }
  if (RB.bus) RB.bus.on('story:settled', () => { if (pending) setTimeout(tryLaunch, 0); });

  // ---- the activity ------------------------------------------------------------------------------------------------------------------
  RB.activity.register('fishing', {
    title: T('title'),
    eligible: (s, ctx) => F.eligible(s, ctx),
    run: (session) => run(session),
    dispose: (session) => { if (cur && cur.session === session) cur.dispose(); },
  });

  async function run(session) {
    const s = RB.game.s;
    const sid = session.ctx.site || F.siteHere(s);
    const S = F.site(sid);
    const att = F.attendance(s);
    const A = F.st(s);
    const chatter = () => RB.game.settings.activityChatter !== 'quiet';
    const C = {
      session, s, sid, S, att, casts: 3, done: 0, castsThisSession: 0, ambient: 0, remarks: 0,
      how: null, patch: null, look: null, mode: RB.game.settings.input || 'hand', last: null, timers: [],
    };
    cur = C;
    F.intro(s, session.ctx.source === 'words' ? 'words' : 'note');
    const ui = overlay(C);
    C.ui = ui;
    C.dispose = () => {
      C.timers.forEach(clearTimeout);
      // an answer sheet still open belongs to this session: close it without a result
      const leave = document.querySelector('.chal [data-a=leave]');
      if (leave && RB.challenge.active()) leave.click();
      ui.destroy();
      if (cur === C) cur = null;
    };
    let result = { casts: 0, catches: 0 };
    try {
      // a cast left in the water in a saved game: pick it up (same fish) or let it go
      if (A.active && A.active.site === sid) {
        const k = await ui.ask(resumeHtml(C, A.active), ['resume', 'drop']);
        if (!session.alive()) return result;
        if (k === 'resume') { const r = await catchFrom(C, A.active, true); if (r === 'leave' || !session.alive()) return finishRes(C, result); }
        else F.abandon(s);
      } else if (A.active) F.abandon(s); // left at another station: back safely on the bank, nothing lost
      // the companion's first outing here
      if (C.att.comp && chatter() && !(A.outings[C.att.comp] > 0) && !A.milestones['met:' + C.att.comp]) {
        A.milestones['met:' + C.att.comp] = { t: Date.now() };
        remark(C, 'first', 0, true);
      }
      for (;;) {
        session.set('preparing');
        await C.ui.stage.go('prep');
        const pick = await prep(C);
        if (!session.alive()) return result;
        if (pick.action === 'leave') break;
        const a = F.beginCast(s, { site: sid, how: pick.how, patch: pick.patch, look: pick.look, inputMode: C.mode, pace: { kind: paceKind(C) }, attend: C.att });
        if (!a) { RB.ui.notice('Nothing to cast for here.', 'info'); break; }
        C.castsThisSession++;
        const r = await catchFrom(C, a, false);
        if (!session.alive()) return result;
        if (r === 'leave') break;
      }
    } finally {
      if (session.alive() && C.done > 0 && C.att.comp && chatter()) {
        // a voluntary stop is a normal decision: one brief line, then the world
        remark(C, 'stop', C.castsThisSession, true);
        await wait(RB.game.fastForward() ? 50 : 1400);
      }
    }
    return finishRes(C, result);
  }
  function finishRes(C, r) { r.casts = C.castsThisSession; r.catches = C.done; return r; }
  const paceKind = (C) => (RB.practice.settings(C.s).fishingPace || 'off');

  // one cast, from the cast itself to the choice after release; resolves 'again' | 'leave'
  async function catchFrom(C, a, resumed) {
    const { s, session, ui } = C;
    const stage = ui.stage;
    session.set('active');
    stage.set({ patch: a.patch, fish: a.fish, situation: null, intent: null, labels: null });
    if (!resumed) {
      ui.panel('<p class="fp-status">' + L('cast') + '</p>');
      await stage.go('cast');
      if (!session.alive()) return 'leave';
      F.setPhase(s, a.seq, 'wait');
      // the cosmetic wait: 2–4 s, decorative only; Skip after the first cast (Settings: fishWait)
      const A = F.st(s);
      const tutorial = (A.catches | 0) === 0;
      const ms = 2000 + Math.round(RB.util.rng(RB.util.hashStr('wait|' + a.seq + '|' + (s.id || '')))() * 2000);
      if (tutorial || RB.game.settings.fishWait !== false) {
        stage.go('wait');
        const k = await ui.ask('<p class="fp-status">' + L('wait') + '</p>' + (tutorial ? '<p class="muted small">The float settles. Something will come — there is no hurry.</p>' : '') +
          '<div class="fp-acts">' + (tutorial ? '' : '<button class="pbtn" data-k="skip">' + I('next') + L('skip') + '</button>') + leaveBtn('Leave (let this cast go)') + '</div>', ['skip', 'leave'], ms, () => ambient(C));
        if (!session.alive()) return 'leave';
        if (k === 'leave') { F.abandon(s, a.seq); return 'leave'; }
      }
    }
    // the bite: it waits as long as you like
    F.setPhase(s, a.seq, 'bite');
    stage.go('bite');
    const k1 = await ui.ask('<p class="fp-status">' + L('bite') + '</p><p class="small">The float bobs and dips. It will wait for you.</p><div class="fp-acts"><button class="pbtn primary autofocus" data-k="take">' + I('look') + L('take') + '</button>' + leaveBtn('Leave (let this cast go)') + '</div>', ['take', 'leave']);
    if (!session.alive()) return 'leave';
    if (k1 === 'leave') { F.abandon(s, a.seq); return 'leave'; }
    // the situation, read untimed; then one authored task
    const sit = F.situation(a.situation);
    const prof = a.profile;
    const task = sit.tasks[prof] || sit.tasks.E;
    F.setPhase(s, a.seq, 'situation');
    stage.set({ situation: sit.id, labels: task.labels || null });
    stage.go('situation');
    let step = null, res = null;
    for (;;) {
      const k2 = await ui.ask(situationHtml(C, sit, task, prof), ['answer', 'teach', 'leave']);
      if (!session.alive()) return 'leave';
      if (k2 === 'leave') { F.abandon(s, a.seq); return 'leave'; }
      if (k2 === 'teach') { if (task.teach) await RB.challenge.teachCard(task.teach); continue; }
      // Foundations: the expression is taught before it is asked for
      if (prof === 'F' && task.teach && !RB.learn.introduced([].concat(task.item)[0])) await RB.challenge.teachCard(task.teach);
      if (!session.alive()) return 'leave';
      step = buildStep(task, sit, prof);
      F.setPhase(s, a.seq, 'task');
      session.set('active');
      stage.go('task');
      ui.panel('<p class="fp-status">' + L('answer') + '</p><p class="muted small">Answering on the sheet — nothing here is timed.</p>');
      res = await respond(step, { s, header: headerHtml(C, sit, task), pace: paceKind(C), mode: step.kind === 'write' ? C.mode : undefined, wrongNote: wrongNoteFor(task), session });
      if (!session.alive()) return 'leave';
      if (res && res.cancelled) { stage.go('situation'); continue; } // back to the water: no loss, nothing recorded
      break;
    }
    // commit the catch and its learning outcome, once (§21.2)
    session.set('resolving');
    const paced = res.paced || { kind: 'off' };
    const isPaced = !!(paced && paced.kind && paced.kind !== 'off');
    const exposed = !!step.copy || (!!res.revealed && res.firstTry !== false);
    const obj = C.obj || (C.obj = RB.practice.objectives(session));
    const out = F.commitCatch(s, a.seq, {
      result: res, paced, exposed,
      assess: () => obj.assess('fish:' + a.seq + ':' + a.variant, step.item, res, { kind: 'fishing', exposed, paced: isPaced }),
    });
    if (!out.ok) return 'leave';
    C.done++;
    C.last = { a, sit, task, step, res, out, paced };
    // the authoritative state is committed; now its persistence is known before any reward is shown
    let saved = null;
    try { saved = await RB.save.autosave('auto'); } catch (e) { saved = null; }
    if (!session.alive()) return 'leave';
    C.saved = saved ? 'saved' : RB.save.status && RB.save.status().mode === 'session' ? 'session' : 'unsaved';
    // the matching action, the fish, the observation (until dismissed), the release
    ui.panel('<p class="fp-status">' + esc(actionLine(sit.intent)) + '</p>');
    await stage.go('act', { intent: sit.intent });
    if (!session.alive()) return 'leave';
    await stage.go('land');
    if (!session.alive()) return 'leave';
    stage.go('observe');
    const say = catchRemark(C, out);
    await ui.ask(observeHtml(C, out, say), ['release']);
    if (!session.alive()) return 'leave';
    stage.set({ labels: null });
    ui.panel('<p class="fp-status">' + L('release') + '</p>');
    await stage.go('release');
    if (!session.alive()) return 'leave';
    stage.go('after');
    for (;;) {
      const k3 = await ui.ask(afterHtml(C, out), ['again', 'review', 'reflect', 'leave']);
      if (!session.alive()) return 'leave';
      if (k3 === 'review') { await ui.ask(reviewHtml(C), ['back']); continue; }
      if (k3 === 'reflect') { await reflection(C); continue; }
      session.set('result');
      return k3 === 'again' ? 'again' : 'leave';
    }
  }

  // ---- the task: an ordinary step (write / choose / order), prepared for the profile ------------------------------------------
  function buildStep(task, sit, prof) {
    const st = RB.util.deepClone(task);
    // the I/A note is the task's context; the step keeps only fields the challenge runner reads
    if (st.note) st.ctx = { jp: st.note.jp, en: st.note.en };
    for (const k of ['note', 'others', 'labels', 'reading', 'meaning', 'teach']) delete st[k];
    st.title = T('title').en;
    st.titleJp = T('title').jp;
    // Foundations: only taught kana are asked for (RB.tasks.prepare blanks one, or makes it a copy)
    return RB.tasks.prepare(st);
  }
  // real Japanese for another action: "not supported here", never a grammar error (§6.4)
  function wrongNoteFor(task) {
    if (!task.others || !task.others.length) return null;
    const plain = (x) => RB.tasks.plain(x).replace(/\s/g, '');
    return (text) => {
      const t = plain(text);
      for (const o of task.others) if (o.forms.some((f) => plain(f) === t || RB.kana.toHira(plain(f)) === RB.kana.toHira(t))) return [{ code: 'intent', en: o.en + ' (This activity only supports what Yasu\'s note asks for here.)' }];
      return null;
    };
  }

  // ---- remarks (§8.3): one per catch; two ambient per three casts; never over an answer; Quiet drops them ----------------------
  function remark(C, kind, seed, force) {
    if (!C.att.comp || RB.game.settings.activityChatter === 'quiet') return null;
    if (RB.challenge.active()) return null;
    const line = F.remark(C.s, C.att.comp, kind, seed | 0);
    if (!line) return null;
    C.ui.stage.say(line, C.att.comp);
    C.ui.stage.event('remark');
    C.remarks++;
    C.remarkLog = (C.remarkLog || []).concat([kind]);
    void force;
    return line;
  }
  function ambient(C) {
    const budget = Math.max(1, Math.round((C.casts * 2) / 3));
    if (C.ambient >= budget || !C.att.comp) return;
    const r = RB.util.rng(RB.util.hashStr('amb|' + C.castsThisSession + '|' + (C.s.id || '')))();
    if (r < 0.55 && remark(C, 'wait', C.castsThisSession)) C.ambient++;
  }
  function catchRemark(C, out) {
    if (!C.att.comp || RB.game.settings.activityChatter === 'quiet') return null;
    const kind = out.milestones.indexOf('survey') >= 0 ? 'survey' : out.isNew ? 'discover' : (out.seq % 2 ? 'catch' : null);
    if (!kind) return null;
    const line = F.remark(C.s, C.att.comp, kind, out.seq);
    if (line) { C.remarks++; C.remarkLog = (C.remarkLog || []).concat([kind]); C.ui.stage.event('remark'); }
    return line;
  }

  // ---- the reflection after all nine (§8.1): shared only when the companion is here; no bond ------------------------------------
  async function reflection(C) {
    const s = C.s, R = F.st(s).milestones.reflection || {};
    const comp = C.att.comp;
    const choices = F.remark(s, '__reflect', 'choices', 0) ? F.content().remarks.__reflect.choices : [];
    const spread = F.content().remarks.__reflect.spread[0];
    if (comp && !R.shared) {
      const ask = F.remark(s, comp, 'reflectAsk', 0);
      const nm = RB.content.chars[comp].name.en;
      const k = await C.ui.ask('<h3>' + L('reflect') + '</h3><p>' + J(spread.jp) + '<span class="en">' + esc(spread.en) + '</span></p>' +
        '<blockquote class="fp-say"><span class="who">' + esc(nm) + '</span>' + J(ask.jp) + '<span class="en">' + esc(ask.en) + '</span></blockquote>' +
        '<div class="fp-acts col">' + choices.map((c, i) => '<button class="pbtn" data-k="c' + i + '">' + J(c.jp) + '<span class="en">' + esc(c.en) + '</span></button>').join('') +
        '<button class="pbtn quiet" data-k="later">Not now</button></div>', ['c0', 'c1', 'c2', 'later']);
      if (k === 'later' || !C.session.alive()) return;
      const i = +k.slice(1);
      const reply = F.content().remarks[comp].reflect[i];
      F.reflect(s, { comp, choice: i, site: C.sid, lines: [{ who: 'narr', jp: spread.jp, en: spread.en }, { who: comp, jp: ask.jp, en: ask.en }, { who: 'pc', jp: choices[i].jp, en: choices[i].en, choice: true }, { who: comp, jp: reply.jp, en: reply.en }] });
      C.ui.stage.say(reply, comp);
      C.ui.stage.event('remark');
      await C.ui.ask('<blockquote class="fp-say"><span class="who">' + esc(nm) + '</span>' + J(reply.jp) + '<span class="en">' + esc(reply.en) + '</span></blockquote><p class="muted small">Kept in Company › Shared memories.</p><div class="fp-acts"><button class="pbtn primary" data-k="ok">' + I('done') + 'Close the notebook</button></div>', ['ok']);
      return;
    }
    if (!R.solo && !R.shared) {
      const k = await C.ui.ask('<h3>' + L('reflectSolo') + '</h3><p>' + J(spread.jp) + '<span class="en">' + esc(spread.en) + '</span></p><div class="fp-acts col">' +
        choices.map((c, i) => '<button class="pbtn" data-k="c' + i + '">' + J(c.jp) + '<span class="en">' + esc(c.en) + '</span></button>').join('') + '<button class="pbtn quiet" data-k="later">Not now</button></div>', ['c0', 'c1', 'c2', 'later']);
      if (k === 'later' || !C.session.alive()) return;
      F.reflect(C.s, { choice: +k.slice(1) });
      const solo = F.content().remarks.__reflect.solo[0];
      await C.ui.ask('<p>' + J(solo.jp) + '<span class="en">' + esc(solo.en) + '</span></p><div class="fp-acts"><button class="pbtn primary" data-k="ok">' + I('done') + 'Done</button></div>', ['ok']);
    }
  }

  // ---- panels ------------------------------------------------------------------------------------------------------------------
  const leaveBtn = (label) => '<button class="pbtn quiet" data-k="leave">' + I('back') + esc(label || 'Leave') + '</button>';
  function siteHead(C) { return '<div class="fp-site">' + J(C.S.name.jp) + ' <span class="en">' + esc(C.S.name.en) + '</span></div>'; }
  function resumeHtml(C, a) {
    return siteHead(C) + '<p>A cast was left in the water here. Pick it up again (the same fish is on the line), or let it go — your earlier records stay either way.</p>' +
      '<div class="fp-acts"><button class="pbtn primary autofocus" data-k="resume">' + I('next') + 'Pick it up again</button><button class="pbtn" data-k="drop">Let it go</button></div>';
  }
  async function prep(C) {
    const { s, S } = C;
    const A = F.st(s);
    const q = F.queue(s, S.id);
    const unseen = q.order.filter((f) => !A.observed[f]);
    if (!C.how) { C.how = unseen.length ? 'discover' : 'patch'; C.patch = S.patches[0].id; }
    for (;;) {
      const pv = F.preview(s, S.id, C.how, C.patch, C.look);
      C.ui.stage.set({ patch: pv ? pv.patch : C.patch });
      const html = prepHtml(C, pv, unseen);
      const k = await C.ui.ask(html, null);
      if (!C.session.alive()) return { action: 'leave' };
      if (k === 'leave') return { action: 'leave' };
      if (k === 'cast') return { action: 'cast', how: C.how, patch: C.how === 'patch' ? C.patch : pv ? pv.patch : C.patch, look: C.look };
      if (k === 'discover') { C.how = 'discover'; C.look = null; continue; }
      if (k.indexOf('patch:') === 0) { C.how = 'patch'; C.patch = k.slice(6); C.look = null; continue; }
      if (k.indexOf('look:') === 0) { C.how = 'look'; C.look = k.slice(5); continue; }
      if (k.indexOf('mode:') === 0) { C.mode = k.slice(5); continue; }
      if (k.indexOf('casts:') === 0) { C.casts = +k.slice(6); continue; }
      if (k.indexOf('pace:') === 0) { setPace(C, k.slice(5)); continue; }
      if (k === 'notes') { await notesInline(C); continue; }
      if (k === 'rules') { await C.ui.ask(rulesHtml(), ['back']); continue; }
      if (k === 'reflect') { await reflection(C); continue; }
    }
  }
  function setPace(C, v) {
    const ok = v === 'off' || (RB.pace.available && RB.pace.available(C.s, { site: C.sid }));
    if (ok) RB.practice.set(C.s, 'fishingPace', v);
  }
  function prepHtml(C, pv, unseen) {
    const { s, S } = C;
    const A = F.st(s);
    const known = S.species.filter((f) => A.observed[f]);
    const c = F.counts(s);
    const showCounts = RB.game.settings.keepsakeCounts !== false;
    let h = siteHead(C);
    h += '<p class="muted small">' + esc(S.view.en) + '</p>';
    // Yasu's survey line
    h += '<p class="fp-survey">' + I('note') + L('survey') + ' — ' + (A.milestones.survey ? 'complete. Fishing on is for its own sake.' : showCounts ? c.survey + ' of 3 different fish recorded.' : 'three different fish to record.') + '</p>';
    // where to cast: Discover the waters (guided) vs a patch you pick (manual)
    h += '<fieldset class="fp-where"><legend>' + L('where') + '</legend>';
    h += '<button class="pbtn fp-disc' + (C.how === 'discover' ? ' on' : '') + '" data-k="discover" aria-pressed="' + (C.how === 'discover') + '">' + I('here') + L('discover') +
      '<span class="fp-sub">' + (unseen.length ? 'Guided: takes you to a patch where something you haven\'t recorded is.' : 'Everything here is recorded: a patch is picked for you.') + '</span></button>';
    h += '<div class="fp-patches" role="group" aria-label="Or pick a patch yourself">';
    for (const p of S.patches) {
      const hasNew = p.fish.some((f) => !A.observed[f]);
      const on = C.how === 'patch' && C.patch === p.id;
      const auto = C.how !== 'patch' && pv && pv.patch === p.id;
      h += '<button class="pbtn fp-patch' + (on ? ' on' : '') + (auto ? ' auto' : '') + '" data-k="patch:' + esc(p.id) + '" aria-pressed="' + on + '">' + J(p.name.jp) + '<span class="en">' + esc(p.name.en) + '</span>' +
        '<span class="fp-sub">' + esc(p.desc.en) + (hasNew ? ' Something not yet in your notes may be here.' : '') + (auto ? ' (the guided choice)' : '') + '</span></button>';
    }
    h += '</div>';
    if (known.length) {
      h += '<div class="fp-look" role="group" aria-label="Look for this fish"><span class="lab">' + L('look') + ':</span> ' +
        known.map((f) => { const d = F.fish(f); const on = C.how === 'look' && C.look === f; return '<button class="pbtn small' + (on ? ' on' : '') + '" data-k="look:' + f + '" aria-pressed="' + on + '">' + esc(d.jp) + ' <span class="en">' + esc(d.en) + '</span></button>'; }).join('') +
        (C.how === 'look' ? '<span class="fp-sub">It is guaranteed on your next catch at its patch (' + esc((F.patchOf(S.id, pv.patch) || {}).name.en) + ').</span>' : '') + '</div>';
    }
    h += '</fieldset>';
    // how you answer, the pace, how many casts
    const modes = [['hand', 'Write'], ['choice', 'Choose'], ['ime', 'Type']];
    h += '<fieldset class="fp-opts"><legend>' + L('input') + '</legend><div class="seg" role="group">' + modes.map(([m, en]) => '<button class="pbtn small' + (C.mode === m ? ' on' : '') + '" data-k="mode:' + m + '" aria-pressed="' + (C.mode === m) + '">' + esc(en) + '</button>').join('') + '</div>' +
      '<p class="fp-sub">You can switch on the answer sheet too. Some tasks are choices or arrangements whatever you pick.</p></fieldset>';
    h += paceHtml(C);
    h += '<fieldset class="fp-opts"><legend>' + L('casts') + '</legend><div class="seg" role="group">' + [1, 3, 5].map((n) => '<button class="pbtn small' + (C.casts === n ? ' on' : '') + '" data-k="casts:' + n + '" aria-pressed="' + (C.casts === n) + '">' + n + '</button>').join('') + '</div>' +
      '<p class="fp-sub">A suggested stopping point, not a promise: leave whenever you like.</p></fieldset>';
    const M = A.milestones;
    const canReflect = M.spread && (!(M.reflection && (M.reflection.shared || M.reflection.solo)) || (C.att.comp && !(M.reflection && M.reflection.shared)));
    h += '<div class="fp-acts"><button class="pbtn primary autofocus fp-cast" data-k="cast">' + I('next') + L('cast') + '</button>' +
      '<button class="pbtn" data-k="notes">' + I('fish') + L('notes') + '</button><button class="pbtn" data-k="rules">' + I('help') + L('rules') + '</button>' +
      (canReflect ? '<button class="pbtn" data-k="reflect">' + I('history') + L(C.att.comp ? 'reflect' : 'reflectSolo') + '</button>' : '') + leaveBtn() + '</div>';
    return h;
  }
  function paceHtml(C) {
    const s = C.s;
    const avail = !!(RB.pace.available && RB.pace.available(s, { site: C.sid }));
    let b = null;
    try { b = RB.pace.budgets ? RB.pace.budgets(s, { site: C.sid, mode: C.mode }) : null; } catch (e) { b = null; }
    const curK = paceKind(C);
    const opt = (k, key, enabled, why) => '<button class="pbtn small' + (curK === k ? ' on' : '') + '" data-k="pace:' + k + '" aria-pressed="' + (curK === k) + '"' + (enabled ? '' : ' disabled aria-disabled="true"') + ' title="' + esc(why || '') + '">' + L(key) + '</button>';
    const gentleOk = avail && b && b.gentle != null, briskOk = avail && b && b.brisk != null;
    let note;
    if (!avail) note = 'Gentle, Brisk and Custom are not available yet: the optional pace for fishing is still being built. Every cast is untimed.';
    else if (!gentleOk) note = 'Gentle and Brisk need ' + ((b && b.needed) || 12) + ' comparable untimed answers first' + (b && b.samples != null ? ' (' + b.samples + ' so far)' : '') + '. Custom can be chosen now. Help and pausing never cost a fish.';
    else note = 'Pace is optional and only times the answer you write after Ready. Help and pausing never cost a fish.';
    return '<fieldset class="fp-opts"><legend>' + L('pace') + '</legend><div class="seg" role="group">' +
      opt('off', 'paceOff', true) + opt('gentle', 'paceGentle', gentleOk, note) + opt('brisk', 'paceBrisk', briskOk, note) + opt('custom', 'paceCustom', avail, note) +
      '</div><p class="fp-sub" data-pace-note>' + esc(note) + '</p></fieldset>';
  }
  function rulesHtml() {
    return '<h3>' + L('rules') + '</h3><ol class="fp-rules">' +
      '<li>Choose where to cast: <b>Discover the waters</b> takes you to a patch with a fish you have not recorded yet; or pick one of the three patches yourself.</li>' +
      '<li>After a short wait (skippable after your first cast) something bites. The bite waits for you.</li>' +
      '<li>Read what is happening and Yasu\'s note, then answer in Japanese — by writing, choosing or typing. Nothing is timed; help never costs the fish.</li>' +
      '<li>The fish comes in, you look at it, and you let it go into the same water. Each kind you see is kept in Fishing notes (Journey).</li>' +
      '<li>Leave whenever you like: a cast you leave is simply let go, and every earlier record stays.</li></ol>' +
      '<div class="fp-acts"><button class="pbtn primary autofocus" data-k="back">' + I('back') + 'Back</button></div>';
  }
  function situationHtml(C, sit, task, prof) {
    const lowNote = prof === 'F' || prof === 'E';
    let h = '<h3>' + J(sit.title.jp) + ' <span class="en">' + esc(sit.title.en) + '</span></h3>';
    h += '<p class="fp-scene">' + I('look') + esc(sit.scene.en) + '</p>';
    if (lowNote) h += '<div class="fp-note"><div class="lab">' + L('note') + '</div>' + J(sit.rule.jp) + '<div class="en">' + esc(sit.rule.en) + '</div></div>';
    else h += '<div class="fp-note"><div class="lab">' + L('note') + '</div>' + J((task.note || sit.rule).jp) + '<div class="muted small">Reading this is part of the task: the answer sheet can translate it (that counts as help, nothing more).</div></div>';
    h += '<p class="muted small">Take as long as you like. Nothing happens until you answer.</p>';
    h += '<div class="fp-acts"><button class="pbtn primary autofocus" data-k="answer">' + I('practice') + L('answer') + '</button>' +
      (task.teach ? '<button class="pbtn" data-k="teach">' + I('help') + L('expression') + '</button>' : '') + leaveBtn('Leave (let this cast go)') + '</div>';
    return h;
  }
  // the situation, carried onto the answer sheet (its task slip): what you see, the rule (F/E), and a picture
  function headerHtml(C, sit, task) {
    let img = '';
    try { const c = C.ui.el.querySelector('.fs-canvas'); if (c && c.width) img = '<img class="fp-snap" alt="" src="' + c.toDataURL() + '">'; } catch (e) { img = ''; }
    const prof = F.st(C.s).active ? F.st(C.s).active.profile : 'E';
    const rule = prof === 'F' || prof === 'E' ? '<div class="fp-hrule">' + I('note') + J(sit.rule.jp) + ' <span class="en">' + esc(sit.rule.en) + '</span></div>' : '';
    return '<div class="fp-head">' + img + '<div><div class="fp-hscene">' + esc(sit.scene.en) + '</div>' + rule + '</div></div>';
  }
  function actionLine(intent) {
    return ({ wait: 'You wait. The float settles — then goes under. You lift gently.', right: 'You guide the line to the right, into open water.', left: 'You guide the line to the left, into clear water.', lift: 'You lift the rod gently.',
      slack: 'You give the line slack; the twig slips free.', lane: 'You move the line into the slow lane and draw it in.', close: 'You bring it in slowly.', side: 'Rod low, you bring it out through the gap at the side.',
      tray: 'You bring it to the tub of water.', slow: 'You ease it the last bit, slowly.', recover: 'You wait a moment, then wind the line in.', patch: 'You cast to the calm marker.', closefirst: 'You bring it near first, then lift it.' })[intent] || 'You bring it in.';
  }
  function observeHtml(C, out, say) {
    const d = F.fish(out.fish);
    const A = F.st(C.s);
    const o = A.observed[out.fish];
    const P = F.patchOf(out.site, out.patch);
    const showCounts = RB.game.settings.keepsakeCounts !== false;
    let h = '<div class="fp-obs"><div class="fp-plate" data-plate="' + esc(out.fish) + '"></div><div>';
    h += '<div class="fp-name"><span lang="ja">' + esc(d.jp) + '</span> <span class="small muted">(' + esc(d.romaji) + ')</span> <span class="en">' + esc(d.en) + ' — ' + esc(d.common) + '</span></div>';
    h += '<p class="small">' + J(d.survey.jp) + '<span class="en">' + esc(d.survey.en) + '</span></p>';
    h += '<p class="muted small">' + esc(C.S.name.en) + (P ? ' · ' + esc(P.name.en) : '') + (out.isNew ? ' · <b>' + esc(T('first').en) + '</b>' : showCounts ? ' · seen ' + o.count + ' time' + (o.count === 1 ? '' : 's') : '') + '</p>';
    h += '</div></div>';
    const ms = out.milestones;
    if (ms.indexOf('first') >= 0) h += '<p class="fp-ms">' + I('fish') + 'Fishing notes are open in your Journey — this is the first drawing.</p>';
    if (ms.indexOf('survey') >= 0) h += '<p class="fp-ms">' + I('done') + 'Yasu\'s survey is complete: three kinds recorded and left for him at the station. A <b>rod ribbon</b> is tied on (Fishing notes can take it off).</p>';
    if (ms.indexOf('frame') >= 0) h += '<p class="fp-ms">' + I('keepsake') + 'Six kinds: a <b>framed waterside illustration</b> joins your Practice mementos.</p>';
    if (ms.indexOf('spread') >= 0) h += '<p class="fp-ms">' + I('book') + 'All nine: the catalogue spread is complete. When you like, you can look back over it' + (C.att.comp ? ' together' : '') + '.</p>';
    if (out.memory) h += '<p class="fp-ms muted small">A shared memory was kept (Company › Shared memories).</p>';
    if (say && C.att.comp) h += '<blockquote class="fp-say"><span class="who">' + esc(RB.content.chars[C.att.comp].name.en) + '</span>' + J(say.jp) + '<span class="en">' + esc(say.en) + '</span></blockquote>';
    const sv = C.saved === 'saved' ? 'Saved.' : C.saved === 'session' ? 'Kept for this browser session only (this browser is not keeping saves).' : 'Recorded in this journey; save from the folio to keep it.';
    h += '<p class="muted small fp-saved">' + esc(sv) + '</p>';
    h += '<div class="fp-acts"><button class="pbtn primary autofocus" data-k="release">' + I('wave') + L('release') + '</button></div>';
    return h;
  }
  function afterHtml(C, out) {
    const A = F.st(C.s);
    const reached = C.castsThisSession >= C.casts;
    const M = A.milestones;
    const canReflect = M.spread && (!(M.reflection && (M.reflection.shared || M.reflection.solo)) || (C.att.comp && !(M.reflection && M.reflection.shared)));
    let h = '<p class="fp-status">The fish is back in the water.</p>';
    if (reached) h += '<p class="small">That makes ' + C.castsThisSession + ' cast' + (C.castsThisSession === 1 ? '' : 's') + ' — the number you had in mind. Cast again or leave; either is fine.</p>';
    h += '<div class="fp-acts"><button class="pbtn' + (reached ? '' : ' primary autofocus') + '" data-k="again">' + I('next') + L('again') + '</button><button class="pbtn" data-k="review">' + I('note') + L('review') + '</button>' +
      (canReflect ? '<button class="pbtn" data-k="reflect">' + I('history') + L(C.att.comp ? 'reflect' : 'reflectSolo') + '</button>' : '') +
      '<button class="pbtn' + (reached ? ' primary autofocus' : ' quiet') + '" data-k="leave">' + I('back') + L('leave') + '</button></div>';
    void out;
    return h;
  }
  // a look back at the last task: never re-recorded, nothing changes
  function reviewHtml(C) {
    const l = C.last;
    if (!l) return '<p>Nothing to review yet.</p><div class="fp-acts"><button class="pbtn" data-k="back">Back</button></div>';
    const { sit, task, res } = l;
    let h = '<h3>' + L('review') + ': ' + J(sit.title.jp) + ' <span class="en">' + esc(sit.title.en) + '</span></h3>';
    h += '<div class="fp-note"><div class="lab">' + L('note') + '</div>' + J((task.note || sit.rule).jp) + '<div class="en">' + esc((task.note || sit.rule).en) + '</div></div>';
    let ans = '';
    if (task.kind === 'write') ans = Array.from(new Set((task.accept || [task.answer]).map((a) => RB.tasks.plain(a)))).slice(0, 6).map((a) => '<span lang="ja">' + esc(a) + '</span>').join(' · ');
    else if (task.kind === 'choose') ans = task.options.filter((o) => o.ok).map((o) => J(o.jp)).join(' · ');
    else ans = J(task.answer.join(' '));
    h += '<p><b>Accepted:</b> ' + ans + (task.reading ? ' <span class="muted small">(read: <span lang="ja">' + esc(task.reading) + '</span> — ' + esc(task.meaning ? task.meaning.en : '') + ')</span>' : '') + '</p>';
    if (task.explain) h += '<p>' + (task.explain.jp ? J(task.explain.jp) + ' ' : '') + esc(task.explain.en) + '</p>';
    h += '<p class="muted small">' + esc(sit.misread.en) + '</p>';
    const how = res.revealed ? 'You looked at the answer — recorded as help, nothing more.' : res.firstTry === false ? 'Answered after a correction — that is ordinary practice.' : res.assisted ? 'Answered with help — recorded as assisted; the fish and the record are the same.' : 'Answered on the first try.';
    const rep = res.recogRepairs || res.misreads ? ' The pad\'s reading was corrected along the way; that is never counted as a mistake in Japanese.' : '';
    h += '<p class="small">' + esc(how + rep) + '</p>';
    h += '<div class="fp-acts"><button class="pbtn primary autofocus" data-k="back">' + I('back') + 'Back</button></div>';
    return h;
  }
  async function notesInline(C) {
    const host = RB.ui.el('div', 'fp-notes-inline');
    const h = RB.ui.fishingNotes ? RB.ui.fishingNotes.html(C.s, { compact: true }) : '';
    await C.ui.ask('<h3>' + L('notes') + '</h3>' + h + '<div class="fp-acts"><button class="pbtn primary autofocus" data-k="back">' + I('back') + 'Back to the water</button></div>', ['back'], 0, null, (el) => { if (RB.ui.fishingNotes) RB.ui.fishingNotes.paint(el); });
    void host;
  }

  // ---- the overlay: stage + panel --------------------------------------------------------------------------------------------
  function overlay(C) {
    const wrap = RB.ui.el('div', 'fish-wrap');
    const tid = 'fish-t' + Math.random().toString(36).slice(2, 7);
    wrap.innerHTML = '<div class="fish-frame" role="dialog" aria-modal="true" aria-labelledby="' + tid + '">' +
      '<div class="fish-head"><h2 id="' + tid + '">' + L('title') + '</h2></div>' +
      '<div class="fish-body"><div class="fish-stagecol"><div class="fish-stagebox"></div></div><section class="fish-panel slip" aria-live="polite"></section></div></div>';
    const panelEl = wrap.querySelector('.fish-panel');
    const layer = { el: wrap, name: 'fishing', noAutofocus: true };
    let resolver = null, allowed = null, askTimer = 0;
    const s = C.s;
    const look = RB.equip && RB.equip.look ? RB.equip.look(s) : s.player.look;
    const ribbon = !!(F.st(s).milestones.survey && F.ribbon(s));
    RB.ui.pushLayer(layer);
    const stage = RB.fishStage.create(wrap.querySelector('.fish-stagebox'), { site: C.sid, comp: C.att.comp, pet: C.att.pet, look, ribbon, decorSeed: F.st(s).castSeq });
    function settle(k) {
      if (!resolver) return;
      if (allowed && allowed.indexOf(k) < 0 && !(allowed === null)) return;
      const r = resolver;
      resolver = null; allowed = null;
      clearTimeout(askTimer);
      r(k);
    }
    // a panel that waits for one of its buttons (or the timeout, for the cosmetic wait)
    function ask(html, keys, timeoutMs, onTick, onPaint) {
      panelEl.innerHTML = html;
      if (onPaint) onPaint(panelEl);
      paintPlates(panelEl);
      const f = panelEl.querySelector('.autofocus') || panelEl.querySelector('button:not([disabled])');
      if (f) setTimeout(() => { if (f.isConnected && !RB.challenge.active()) f.focus({ preventScroll: true }); }, 0);
      return new Promise((res) => {
        resolver = res; allowed = keys || null;
        if (timeoutMs) {
          if (onTick) C.timers.push(setTimeout(() => { if (resolver === res) onTick(); }, Math.round(timeoutMs * 0.45)));
          askTimer = setTimeout(() => { if (resolver === res) { resolver = null; res('timeout'); } }, timeoutMs);
        }
      });
    }
    function panel(html) { panelEl.innerHTML = html; }
    function paintPlates(el) {
      el.querySelectorAll('[data-plate]').forEach((p) => {
        const d = F.fish(p.dataset.plate);
        if (!d) return;
        p.innerHTML = '';
        const cv = RB.fishArt.canvas(d, { len: d.art.len, view: 'plate' });
        const c2 = document.createElement('canvas');
        c2.width = cv.width; c2.height = cv.height;
        c2.getContext('2d').drawImage(cv, 0, 0);
        c2.className = 'fp-art';
        c2.setAttribute('role', 'img');
        c2.setAttribute('aria-label', 'Drawing of the ' + d.en);
        p.appendChild(c2);
      });
    }
    wrap.addEventListener('click', (e) => {
      const b = e.target.closest('[data-k]');
      if (!b || b.disabled || !panelEl.contains(b)) return;
      RB.audio && RB.audio.sfx('cursor');
      settle(b.dataset.k);
    });
    layer.onAction = (a) => {
      if (a === 'cancel') {
        // Escape/Back: the panel's way back, or leave
        const back = panelEl.querySelector('[data-k=back]') || panelEl.querySelector('[data-k=later]') || panelEl.querySelector('[data-k=leave]');
        if (back) { back.click(); return true; }
        return true;
      }
      return false;
    };
    return {
      el: wrap, stage, ask, panel,
      destroy() { clearTimeout(askTimer); if (resolver) { const r = resolver; resolver = null; r('leave'); } stage.destroy(); RB.ui.popLayer(layer); },
    };
  }

  // ---- Words › Ways to practise (no remote launch: Begin only at a station, in a safe world) ---------------------------------------
  RB.practice.addActivity({
    id: 'fishing', order: 10, icon: 'fish',
    en: 'A Quiet Cast — fishing for Yasu\'s survey', jp: '{静|しず}か な {釣|つ}り',
    where: { en: 'Three stations: the Reedwake riverbank below the bridge, the pond by the Lantern Road, and the Saltglass quay', jp: '{葦|あし}ノ{瀬|せ} の {川岸|かわぎし} ・ {灯|ひ}の{道|みち} の {池|いけ} ・ {潮|しお}{硝子|がらす} の {波止場|はとば}' },
    available: (s) => !!(s && s.flags && s.flags.postgame),
    here: (s) => !!F.siteHere(s),
    safe: () => F.worldSafe(),
    note: (s) => (!s.flags.postgame ? 'Yasu\'s survey begins once the journey has reached its end.' : F.siteHere(s) ? '' : 'Go to one of the three stations, then begin.'),
    begin: (ctx) => RB.activity.launch('fishing', Object.assign({ site: F.siteHere(RB.game.s) }, ctx || {}, { source: 'words' })),
  });

  return { respond, current: () => cur, _tryLaunch: tryLaunch, pending: () => pending };
})();
