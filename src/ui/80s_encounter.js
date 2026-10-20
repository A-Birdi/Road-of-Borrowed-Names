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
  // What is said in an encounter on this screen is spoken (Robin, 2026-10-20: every line spoken): each line of the log
  // with Japanese is a spoken line under this scene id (src/ui/22c_spoken_panel.js: a Voice button, the spoken word
  // marked, the newest said as it appears when lines are spoken automatically), and so is how it ended. Who says it:
  // you (your choice's words, and what you say with it), your companion (their own move: 'comp'; the gesture the
  // understanding opens, said by whichever companion is with you), a person the game knows by name, else the
  // narrator (what happens, what the people do). Every such line is listed for recording (RB.content.spokenSources,
  // read by tools/voice/lines.mjs) from the encounters' own definitions, the way src/engine/97_encounter.js says them.
  // (An encounter led by a creature is played on the battle screen, which shows these results in English only.)
  const SCENE = 'code.enc';
  const COMPS = ['nao', 'mio', 'ren', 'suzu'];
  const speakerOf = (who) => (who === 'pc' || who === 'comp' ? who : who && RB.content.chars[who] ? who : 'narr');
  function spoken() {
    const out = [], seen = new Set();
    // (a companion's line is listed for each companion who can say it, by their own id: their own recordings)
    const add = (who, t, file, comps) => {
      if (!t || !t.jp || /\$\w/.test(t.jp)) return;
      const w = speakerOf(who);
      for (const sp of w === 'comp' ? comps || COMPS : [w]) {
        const k = sp + '|' + t.jp;
        if (seen.has(k)) continue;
        seen.add(k);
        out.push({ scene: SCENE, who: sp, jp: t.jp, en: t.en || '', file });
      }
    };
    const comp = (list, file) => { for (const c in list || {}) for (const a of list[c] || []) add('comp', a.says, file, [c]); };
    for (const id in RB.content.encounters || {}) {
      const d = RB.content.encounters[id], file = 'encounter ' + id;
      if (d.lead) continue;
      const S = d.social;
      if (S) {
        for (const a of S.actions || []) {
          add('pc', a.label, file); // "You: …", your choice's own words
          if (a.cases) { for (const c of a.cases) add('pc', c.says || a.says, file); add('narr', a.says, file); } // (no case holds: said as what happens)
          else add('pc', a.says, file);
        }
        if (S.gesture) add('comp', S.gesture.says, file);
        for (const k in S.responses || {}) add('narr', S.responses[k] && S.responses[k].says, file);
        if (S.wait) add('narr', S.wait.says, file);
        for (const dr of S.drift || []) add(dr.who, dr.says, file);
        comp(S.companion, file);
      }
      const P = d.procedure;
      if (P) for (const st of P.steps || []) {
        for (const a of st.actions || []) add('narr', a.result, file);
        for (const k in st.responses || {}) add('narr', st.responses[k] && st.responses[k].says, file);
        add('narr', st.untangled, file);
      }
      comp(d.companion, file);
      for (const c of d.conclusions || []) { add('narr', c.text, file); if (c.severe && c.summarised) add('narr', c.summarised, file); }
      if (d.study && d.study.explain) add('narr', d.study.explain, file);
    }
    return out;
  }
  RB.content.spokenSources = RB.content.spokenSources || [];
  RB.content.spokenSources.push(spoken);
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
      if (E().conclusionText(st.enc.conclusion, RB.game.settings) && result !== 'flee') await conclusion(st, fr, log);
    } finally {
      try {
        const fin = E().finishEncounter(st, s, result);
        if (fin && fin.flags) for (const k in fin.flags) s.flags[k] = fin.flags[k];
        cur && (cur.fin = fin);
        if (opts.encounterDone) opts.encounterDone(st.enc.outcome, fin);
      } catch (err) { console.error('encounter finish', err); }
      if (RB.ui.spoken) RB.ui.spoken.stop();
      RB.ui.popLayer(lay);
      RB.game.popMode('encounter');
      cur = null;
    }
    return { result, outcome: st.enc.outcome };
  }
  function logHtml(log) {
    if (!log.length) return '';
    return '<section class="enc-log" aria-live="polite" aria-label="What has happened"><h3>' + I('history') + '<span>So far</span></h3><ol>' + log.slice(-8).map((l) => {
      const cls = (l.none ? 'none' : '') + (l.who === 'pc' ? ' you' : l.who === 'comp' ? ' comp' : '');
      // a line with Japanese: a spoken line, its speaker's recording under SCENE
      if (l.jp && RB.ui.spoken) return RB.ui.spoken.html({ who: speakerOf(l.who), jp: l.jp, en: l.en, sceneId: SCENE }, { tag: 'li', cls: cls.trim(), jpCls: 'el-jp', enCls: 'el-en' });
      return '<li class="' + cls + '">' + (l.jp ? '<span class="el-jp">' + RB.ui.jhtml(l.jp) + '</span> ' : '') + '<span class="el-en">' + esc(l.en) + '</span></li>';
    }).join('') + '</ol></section>';
  }
  // the newest line of the log with Japanese, said as it appears (when lines are spoken automatically); once
  function sayNewest(root, log) {
    const from = Math.max(0, log.length - 8);
    let k = -1;
    for (let i = log.length - 1; i >= Math.max(from, log.heard || 0); i--) if (log[i].jp) { k = i; break; }
    log.heard = log.length;
    const li = k >= 0 && RB.ui.spoken ? root.querySelectorAll('.enc-log ol > li')[k - from] : null;
    if (li) RB.ui.spoken.autoIn(li);
  }
  // Where a card is shown. Procedures and conversations are written in the order that solves them (the right step
  // first; the move that ends a talk badly last), so their cards are dealt (RB.learnUi.deal): each gets a rank from
  // the encounter's deal (taken when it opens) and its own step and id, so the layout holds from one exchange to the
  // next and a new step is dealt afresh. A labelled shortcut (Resolve, the companion's gesture) stays first,
  // the general responses (Unravel, words, Wait) after. Only the view changes: each card keeps its index (`data-i`)
  // in the rules' own list, which the rules, the automated player and the tests read in written order. The battle
  // screen (src/ui/80_combat.js), where an encounter with someone present is played, deals its cards the same way.
  const deals = new WeakMap(); // encounter → its deal (presentation only: never in the encounter's state or a save)
  function shownOrder(st, cards) {
    const E0 = st.enc;
    if (!E0) return cards.map((c, i) => i);
    if (!deals.has(E0)) deals.set(E0, RB.learnUi.deal('encounter|' + ((E0.def && E0.def.id) || '')));
    const D = deals.get(E0);
    const rank = (c) => D.rank(c.id, c.step);
    const idx = cards.map((c, i) => i);
    const lead = idx.filter((i) => cards[i].kind === 'resolve' || cards[i].kind === 'gesture');
    const dealt = idx.filter((i) => cards[i].kind === 'proc' || cards[i].kind === 'social').sort((x, y) => rank(cards[x]) - rank(cards[y]));
    const rest = idx.filter((i) => lead.indexOf(i) < 0 && dealt.indexOf(i) < 0);
    return lead.concat(dealt, rest);
  }
  function choose(st, fr, log) {
    return new Promise((resolve) => {
      const s = RB.game.s;
      const cards = E().cards(st, s, words(st));
      const kind = st.enc.social ? 'conversation' : 'machine';
      fr.setTitle(RB.ui.jhtml(st.enc.def.name.jp || '') + ' ' + esc(st.enc.def.name.en), kind === 'machine' ? '' : 'Exchange ' + (st.round + 1));
      fr.leaf.innerHTML = '<div class="enc-grid">' + '<div class="enc-col">' + peopleHtml(st) + machineHtml(st) + agreementHtml(st) + recordHtml(st) + '</div>' +
        '<div class="enc-col">' + logHtml(log) + '<section class="enc-choices" aria-label="What you can do"><h3>' + I('words') + '<span>What will you do?</span></h3><div class="rcards">' + shownOrder(st, cards).map((i) => cardHtml(cards[i], i)).join('') + '</div></section></div></div>';
      sayNewest(fr.leaf, log);
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
      const c = { text: E().conclusionText(st.enc.conclusion, RB.game.settings) };
      fr.leaf.innerHTML = '<div class="enc-grid"><div class="enc-col">' + peopleHtml(st) + machineHtml(st) + recordHtml(st) + '</div><div class="enc-col">' + logHtml(log) +
        '<section class="enc-end paper" aria-live="polite"><h3>' + I('done') + '<span>How it ended</span></h3>' +
        (c.text.jp && RB.ui.spoken ? RB.ui.spoken.html({ who: 'narr', jp: c.text.jp, en: c.text.en, sceneId: SCENE }, { cls: 'enc-end-l', jpCls: 'el-jp', enCls: '' }) : (c.text.jp ? '<p class="el-jp">' + RB.ui.jhtml(c.text.jp) + '</p>' : '') + '<p>' + esc(c.text.en) + '</p>') + '</section></div></div>';
      // how it ended is said as it appears (the log's newest line, if it has not been said, gives way to it)
      const end = fr.leaf.querySelector('.enc-end .say-line');
      if (end) { log.heard = log.length; RB.ui.spoken.autoIn(end); } else sayNewest(fr.leaf, log);
      fr.foot.innerHTML = '<span class="spacer"></span><button type="button" class="cbtn go" data-ok>' + I('next') + '<span>Continue</span></button>';
      const b = fr.foot.querySelector('[data-ok]');
      b.onclick = () => resolve();
      setTimeout(() => b.focus({ preventScroll: true }), 0);
    });
  }
  return { start, current: () => cur, shownOrder, spoken, SCENE };
})();
