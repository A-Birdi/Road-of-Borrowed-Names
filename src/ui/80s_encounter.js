/* The encounter screen for encounters with no creatures in them (expansion E7, E8; src/engine/97_encounter.js): a
 * conversation (the people, where each stands, what is on record, what each wants) or a machine (its parts, the
 * notice's instruction, the step you are on). Encounters with creatures use the battle screen.
 *
 * An exchange: choose (a conversational choice, an ordinary response, a procedure step, Wait), do its language step,
 * confirm what you meant where it can have a lasting or procedural consequence, let your companion add their own
 * move, and see what happens. Nothing is timed; nothing moves while you read, write or choose. Responses that did
 * nothing are marked tried until the situation changes (C-64); judging what will work is the player's (C-60), so
 * cards say what a response does in general, never "effect here". Stepping away costs nothing: a machine stays as
 * you left it. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.encScreen = (function () {
  'use strict';
  const esc = RB.util.esc;
  const I = (n) => RB.learnUi.icon(n);
  const E = () => RB.encounter;
  const STANCE = { listening: { en: 'Listening', icon: 'note' }, heated: { en: 'Heated', icon: 'flame' }, closed: { en: 'Closed off', icon: 'mute' }, leaving: { en: 'Leaving', icon: 'back' } };
  let cur = null;

  function compName(st) { return st.compId && RB.content.chars[st.compId] ? RB.content.chars[st.compId].name.en : 'your companion'; }
  const tier = (o) => RB.activities.tier(o);

  function peopleHtml(st) {
    const S = st.enc.social;
    if (!S) return '';
    const parts = st.enc.def.social.parties || [];
    return '<section class="enc-people" aria-label="The people"><h3>' + I('companion') + '<span>The people</span></h3><ul>' + parts.map((p) => {
      const a = E().actorOf(st, p.aid) || p;
      const sd = STANCE[S.stance[p.aid]] || STANCE.listening;
      return '<li class="enc-person' + (a.left ? ' left' : '') + '" data-aid="' + esc(p.aid) + '"><span class="ep-n">' + RB.ui.jhtml(p.name.jp || '') + ' <span class="en">' + esc(p.name.en) + '</span></span>' +
        '<span class="pill ep-st st-' + esc(S.stance[p.aid] || 'listening') + '">' + I(sd.icon) + esc(a.left ? 'Gone' : sd.en) + '</span>' +
        (p.wants ? '<span class="ep-w">Wants: ' + esc(p.wants.en) + '</span>' : '') + '</li>';
    }).join('') + '</ul></section>';
  }
  function recordHtml(st) {
    const S = st.enc.social;
    if (!S) return '';
    const C = st.enc.def.social.claims || {};
    const ids = Object.keys(C);
    const by = (b) => { const p = (st.enc.def.social.parties || []).find((x) => x.aid === b); return p ? p.name.en : b === 'slip' ? 'The slip' : b; };
    const shown = ids.filter((c) => S.revealed[c]);
    const hidden = ids.length - shown.length;
    return '<section class="enc-record" aria-label="On record"><h3>' + I('note') + '<span>On record</span></h3><ol>' + shown.map((c) =>
      '<li class="enc-claim" data-claim="' + esc(c) + '"><span class="ec-by">' + esc(by(C[c].by)) + '</span><span class="ec-jp">' + RB.ui.jhtml(C[c].jp) + '</span><span class="ec-en">' + esc(C[c].en) + '</span></li>').join('') + '</ol>' +
      (hidden ? '<p class="muted small">' + esc(hidden === 1 ? 'Something here is not known yet.' : hidden + ' things here are not known yet.') + '</p>' : '') + '</section>';
  }
  function agreementHtml(st) {
    const S = st.enc.social;
    if (!S || !st.compId) return '';
    let pips = '';
    for (let i = 0; i < S.max; i++) pips += '<i class="hp' + (i < S.understanding ? ' on' : '') + '"></i>';
    return '<div class="enc-agree" role="meter" aria-label="Understanding ' + S.understanding + ' of ' + S.max + '" aria-valuemin="0" aria-valuemax="' + S.max + '" aria-valuenow="' + S.understanding + '">' + I('join') + '<span>Understanding</span><span class="hm-pips" aria-hidden="true">' + pips + '</span>' +
      (S.understanding >= S.max ? '<span class="aside">' + esc(compName(st)) + ' can help bring them together</span>' : '') + '</div>';
  }
  function machineHtml(st) {
    const P = st.enc.proc;
    if (!P) return '';
    const D = st.enc.def.procedure;
    const stp = P.steps[P.step];
    return '<section class="enc-machine" aria-label="The machine"><h3>' + I('needle') + '<span>' + esc(st.enc.def.name.en) + '</span><span class="count">' + (P.done ? 'Done' : 'Step ' + (P.step + 1) + ' of ' + P.steps.length) + '</span></h3>' +
      '<dl class="enc-parts">' + (D.show || []).map((sh) => { const v = sh.values[P.machine[sh.key]] || { en: String(P.machine[sh.key]) }; return '<div><dt>' + RB.ui.jhtml(sh.label.jp || '') + ' <span class="en">' + esc(sh.label.en) + '</span></dt><dd>' + (v.jp ? RB.ui.jhtml(v.jp) + ' ' : '') + '<span class="en">' + esc(v.en) + '</span></dd></div>'; }).join('') + '</dl>' +
      (stp && !P.done ? '<div class="enc-notice paper"><div class="slip-lab">The notice</div><div class="en-jp">' + RB.ui.jhtml(stp.text.jp) + '</div></div>' : '') + '</section>';
  }
  function cardHtml(c, i) {
    return '<button type="button" class="resp rcard enc-card' + (c.tried ? ' tried' : '') + (c.kind === 'resolve' ? ' resolve' : '') + '" data-i="' + i + '"' + (c.disabled ? ' disabled' : '') + '>' +
      '<span class="rc-w"><span class="rc-jp">' + RB.ui.jhtml(c.jp || '') + '</span><span class="rc-en">' + esc(c.en || '') + '</span>' + (c.tried ? '<span class="rc-new rc-tried">Tried</span>' : '') + '</span>' +
      '<span class="rc-d">' + esc(c.disabled || c.desc || '') + '</span></button>';
  }
  function words(st) {
    const s = RB.game.s;
    return s.words.map((id) => RB.content.words[id]).filter(Boolean);
  }
  function stepFor(st, c) {
    if (c.kind === 'wait' || c.kind === 'resolve' || c.kind === 'gesture') return null;
    let t = null;
    if (c.kind === 'social' && c.action.task) t = tier(c.action.task);
    else if (c.kind === 'proc') { const stp = st.enc.proc.steps[st.enc.proc.step]; if (stp && stp.task) { t = tier(stp.task); if (t && !t.ctx) t = Object.assign({}, t, { ctx: { jp: stp.text.jp, en: stp.text.en } }); } }
    else if (c.kind === 'word') {
      const w = c.word;
      return RB.tasks.prepare({ kind: 'write', item: 'v:' + (w.lex || w.r), answer: w.r, accept: [w.r, RB.tasks.plain(w.jpK || w.jp)], mode: 'reading', title: 'Say the word', prompt: { en: 'Write the word for “' + w.en + '”.' }, explain: { jp: w.jpK || w.jp, en: w.en } });
    } else if (c.kind === 'unravel') return null;
    if (!t) return null;
    t = RB.util.deepClone(t);
    t.title = t.title || (c.kind === 'social' ? 'Say it' : 'Read the instructions');
    return RB.tasks.prepare(t);
  }

  // def: an encounter definition; resolves { result, outcome }
  async function start(def, opts) {
    opts = opts || {};
    const s = RB.game.s;
    const st = E().begin(def, s);
    if (RB.test && RB.test.auto) return { result: RB.test.encounter(def, opts), outcome: st.enc.outcome };
    RB.game.pushMode('encounter');
    const fr = RB.learnUi.sheet({ cls: 'enc-sheet', title: RB.ui.jhtml(def.name.jp || '') + ' ' + esc(def.name.en), headBtn: { html: I('back') + '<span>Step away</span>', attrs: { 'data-away': '' } } });
    const lay = { el: fr.scrim, name: 'encounter' };
    RB.learnUi.guardTaps(fr.leaf);
    const log = [];
    cur = { st, fr };
    const say = (f, who) => { if (f && (f.en || f.jp)) log.push({ who: who || '', jp: f.jp || '', en: f.en || '', none: !!f.none }); };
    let result = null;
    try {
      RB.ui.pushLayer(lay);
      while (!st.over) {
        const pick = await choose(st, fr, log);
        if (pick === 'away') {
          const r = await RB.ui.confirm(st.enc.proc ? 'Step away? The machine stays as you leave it; you can come back whenever you like.' : 'Step away from this? Nothing is lost.', ['Step away', 'Stay']);
          if (r === 0) { result = 'flee'; break; }
          continue;
        }
        let card = pick;
        if (card.kind === 'wait') {
          const r = await RB.ui.confirm('Wait: say nothing this time, and let the others speak.', ['Wait', 'Choose again']);
          if (r !== 0) continue;
        }
        const step = stepFor(st, card);
        const res = step ? await RB.challenge.runStep(step, { allowCancel: true, cancelLabel: 'Choose something else', ctxTag: 'encounter:' + def.id }) : { ok: true, firstTry: true, mistakes: 0 };
        if (res.cancelled) continue;
        // what you meant, before a lasting or procedural consequence (E7, E17): a misread never commits
        if (card.means && (card.lasting || card.kind === 'proc' || card.kind === 'resolve')) {
          const r = await RB.ui.confirm(card.means.en, ['Yes, do it', 'Choose again']);
          if (r !== 0) continue;
        }
        // your companion's own move, in their own voice (E8, E10)
        let comp = null;
        const opts2 = E().companionOptions(st, s);
        if (opts2.length) {
          const names = opts2.map((o) => o.def.name.en);
          const r = await RB.ui.confirm(compName(st) + ' could add something:', names.concat(['Nothing this time']));
          if (r >= 0 && r < opts2.length) comp = { act: opts2[r].def.id };
        }
        const ev = E().exchange(st, { card, res, comp }, {});
        say({ en: (card.kind === 'social' || card.kind === 'proc' ? 'You: ' : 'You chose: ') + card.en, jp: card.kind === 'social' ? card.jp : '' }, 'pc');
        for (const f of ev.fx) say(f, f.who || '');
        for (const f of ev.cfx || []) say(f, 'comp');
        for (const f of ev.gfx || []) say(f, f.who || '');
        RB.audio && RB.audio.sfx(ev.fx.some((f) => f.none) ? 'cursor' : 'reveal');
      }
      if (!result) result = st.over;
      if (st.enc.conclusion && st.enc.conclusion.text && result !== 'flee') await conclusion(st, fr, log);
    } finally {
      try {
        const fin = E().finishEncounter(st, s, result);
        if (fin && fin.flags) for (const k in fin.flags) s.flags[k] = fin.flags[k];
      } catch (err) { console.error('encounter finish', err); }
      RB.ui.popLayer(lay);
      RB.game.popMode('encounter');
      cur = null;
    }
    return { result, outcome: st.enc.outcome };
  }
  function logHtml(log) {
    if (!log.length) return '';
    return '<section class="enc-log" aria-live="polite" aria-label="What has happened"><h3>' + I('history') + '<span>So far</span></h3><ol>' + log.slice(-8).map((l) =>
      '<li class="' + (l.none ? 'none' : '') + (l.who === 'pc' ? ' you' : l.who === 'comp' ? ' comp' : '') + '">' + (l.jp ? '<span class="el-jp">' + RB.ui.jhtml(l.jp) + '</span> ' : '') + '<span class="el-en">' + esc(l.en) + '</span></li>').join('') + '</ol></section>';
  }
  function choose(st, fr, log) {
    return new Promise((resolve) => {
      const s = RB.game.s;
      const cards = E().cards(st, s, words(st));
      const kind = st.enc.social ? 'conversation' : 'machine';
      fr.setTitle(RB.ui.jhtml(st.enc.def.name.jp || '') + ' ' + esc(st.enc.def.name.en), kind === 'machine' ? '' : 'Exchange ' + (st.round + 1));
      fr.leaf.innerHTML = '<div class="enc-grid">' + '<div class="enc-col">' + peopleHtml(st) + machineHtml(st) + agreementHtml(st) + recordHtml(st) + '</div>' +
        '<div class="enc-col">' + logHtml(log) + '<section class="enc-choices" aria-label="What you can do"><h3>' + I('words') + '<span>What will you do?</span></h3><div class="rcards">' + cards.map(cardHtml).join('') + '</div></section></div></div>';
      fr.foot.innerHTML = '<span class="muted small">' + esc(kind === 'machine' ? 'A wrong step sends the machine back; misreading the notice only means trying again.' : 'Nothing is timed. It will come to an end, one way or another.') + '</span>';
      let done = false;
      const fin = (v) => { if (done) return; done = true; fr.el.onclick = null; resolve(v); };
      fr.el.onclick = (e) => {
        if (e.target.closest('[data-away]')) { fin('away'); return; }
        const b = e.target.closest('[data-i]');
        if (b && !b.disabled) fin(cards[+b.getAttribute('data-i')]);
      };
      const first = fr.leaf.querySelector('.rcard:not([disabled])');
      if (first) setTimeout(() => { if (!done && first.isConnected) first.focus({ preventScroll: true }); }, 0);
    });
  }
  function conclusion(st, fr, log) {
    return new Promise((resolve) => {
      const c = st.enc.conclusion;
      fr.leaf.innerHTML = '<div class="enc-grid"><div class="enc-col">' + peopleHtml(st) + machineHtml(st) + recordHtml(st) + '</div><div class="enc-col">' + logHtml(log) +
        '<section class="enc-end paper" aria-live="polite"><h3>' + I('done') + '<span>How it ended</span></h3>' + (c.text.jp ? '<p class="el-jp">' + RB.ui.jhtml(c.text.jp) + '</p>' : '') + '<p>' + esc(c.text.en) + '</p></section></div></div>';
      fr.foot.innerHTML = '<span class="spacer"></span><button type="button" class="cbtn go" data-ok>' + I('next') + '<span>Continue</span></button>';
      const b = fr.foot.querySelector('[data-ok]');
      b.onclick = () => resolve();
      setTimeout(() => b.focus({ preventScroll: true }), 0);
    });
  }
  return { start, current: () => cur };
})();
