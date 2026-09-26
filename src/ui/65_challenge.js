/* Challenge runner. Presents a step in the player's chosen input mode
 * (handwriting, choices, keyboard/IME), lets them switch mid-step without
 * losing anything, evaluates the CONFIRMED text with RB.answers (separately
 * from recognition), explains mistakes, and records mastery.
 * Recognizer uncertainty is never treated as a language mistake. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.challenge = (function () {
  'use strict';
  const esc = RB.util.esc;
  let active = null; // {step, assisted}

  function isActive() { return !!active; }
  function noteHelp() { if (active) active.helpUsed = true; }

  function plain(s) { return RB.tasks.plain(s || ''); }

  function check(input, step) {
    if (step.kind !== 'write') return { ok: false };
    const accept = (step.accept && step.accept.length ? step.accept : [step.answer]).map(String);
    if (RB.answers && RB.answers.check) return RB.answers.check(input, { accept, mode: step.mode || 'kana', scriptFree: !!step.scriptFree });
    const norm = (s) => plain(s).replace(/\s/g, '');
    const ok = accept.some((a) => norm(a) === norm(input));
    return { ok, feedback: ok ? [] : [{ code: 'generic', en: 'That is not what this needs.' }] };
  }
  function choicesFor(step) {
    if (step.kind === 'choose') return step.options.map((o) => Object.assign({}, o));
    let opts = step.choices ? step.choices.slice() : null;
    const ans = plain(step.answer);
    if (!opts) {
      let d = [];
      try { d = RB.answers.distractors(ans, { count: 3, kind: Array.from(ans).length === 1 ? 'kana' : 'word' }); } catch (e) { d = []; }
      opts = [ans].concat(d);
    }
    const acc = new Set((step.accept || [step.answer]).map(plain));
    // choice mode must always contain a right answer
    if (!opts.some((o) => acc.has(plain(o)))) opts.unshift(ans);
    const r = RB.util.rng(RB.util.hashStr(ans + RB.learn.clock()));
    return r.shuffle(Array.from(new Set(opts.map(plain)))).map((t) => ({ text: t, ok: acc.has(t) }));
  }

  // Render one step; resolves with a result object.
  function runStep(step, opts) {
    opts = opts || {};
    if (RB.test && RB.test.auto) return Promise.resolve(RB.test.solveStep(step, 'step ' + (step.title || step.item)));
    return new Promise((resolve) => {
      const st = RB.game.settings;
      let mode = step.kind === 'write' ? (opts.mode || st.input || 'hand') : 'choice';
      if (step.kind === 'order') mode = 'order';
      const res = { ok: false, firstTry: null, mistakes: 0, assisted: false, mode: null, recogMisses: 0 };
      active = { step, helpUsed: false };
      const wrap = RB.ui.el('div', 'chal');
      wrap.innerHTML = '<div class="wrap"><div class="ctx"></div><div class="work"></div><div class="row foot"></div></div>';
      const ctxEl = wrap.querySelector('.ctx'), work = wrap.querySelector('.work'), foot = wrap.querySelector('.foot');
      const layer = { el: wrap, name: 'challenge', noAutofocus: true };
      let pad = null, locked = false;

      // ---- context & prompt ----
      let showEn = !!(step.showEn || (step.ctx && step.ctx.showEn) || (RB.game.s && RB.game.s.learn.profile === 'F'));
      function renderCtx() {
        let h = opts.header ? '<div>' + opts.header + '</div>' : '';
        if (step.title) h += '<div class="small" style="color:var(--accent)">' + esc(step.title) + '</div>';
        if (step.ctx && step.ctx.jp) {
          h += '<div class="' + (step.ctx.big ? '' : 'small') + '" style="' + (step.ctx.big ? 'font-size:1.6em' : '') + '">' + RB.ui.jhtml(step.ctx.jp) + '</div>';
          if (step.ctx.en) h += showEn ? '<div class="en dim">' + esc(RB.script.enVars(step.ctx.en)) + '</div>' : '<button class="btn small" data-a="tr">Show translation (counts as assisted)</button>';
        }
        if (step.prompt) h += '<div class="prompt">' + esc(RB.script.enVars(step.prompt.en || '')) + (step.prompt.jp ? ' ' + RB.ui.jhtml(step.prompt.jp) : '') + '</div>';
        if (step.kind === 'write' && step.template && (step.template.before || step.template.after)) {
          h += '<div style="font-size:1.5em;margin-top:0.2em">' + RB.ui.jhtml(tplJp(step.template.before)) + '<span style="border-bottom:2px solid var(--accent);padding:0 0.6em;margin:0 0.1em" class="jp">？</span>' + RB.ui.jhtml(tplJp(step.template.after)) + '</div>';
        }
        if (step.copy) h += '<div style="font-size:1.6em">' + RB.ui.jhtml(step.answer) + '</div>';
        ctxEl.innerHTML = h;
        const tr = ctxEl.querySelector('[data-a=tr]');
        if (tr) tr.onclick = () => { showEn = true; active.helpUsed = true; renderCtx(); };
      }
      function tplJp(s) { return s ? s : ''; }

      // ---- work area ----
      function renderWork() {
        work.innerHTML = '';
        if (pad) { pad.destroy(); pad = null; }
        const main = RB.ui.el('div', '');
        main.style.minHeight = '0';
        const side = RB.ui.el('div', 'side');
        work.appendChild(main);
        work.appendChild(side);
        if (step.kind === 'write') {
          const modes = RB.ui.el('div', 'box');
          modes.innerHTML = '<div class="small dim">Answer by</div><div class="seg" role="tablist">' +
            [['hand', '✎ Writing'], ['choice', '☰ Choices'], ['ime', '⌨ Keyboard']].map(([m, l]) => '<button class="btn small' + (m === mode ? ' on' : '') + '" data-mode="' + m + '">' + l + '</button>').join('') + '</div>' +
            '<div class="small dim" style="margin-top:0.3em">Switching keeps your place.</div>';
          modes.onclick = (e) => { const b = e.target.closest('[data-mode]'); if (b && !locked) { mode = b.getAttribute('data-mode'); renderWork(); } };
          side.appendChild(modes);
        }
        const fbBox = RB.ui.el('div', 'box fbbox');
        fbBox.innerHTML = '<div class="fbwrap small dim">' + (step.kind === 'choose' ? 'Choose the best answer.' : step.kind === 'order' ? 'Tap the pieces in order.' : 'Take your time — nothing happens until you submit.') + '</div>';
        side.appendChild(fbBox);
        const help = RB.ui.el('div', 'box');
        help.innerHTML = '<button class="btn small" data-a="reveal">I don\'t know — show me</button>' + (opts.allowCancel !== false ? ' <button class="btn small" data-a="leave">' + esc(opts.cancelLabel || 'Step away') + '</button>' : '');
        help.onclick = (e) => {
          const b = e.target.closest('[data-a]');
          if (!b || locked) return;
          if (b.getAttribute('data-a') === 'reveal') reveal();
          if (b.getAttribute('data-a') === 'leave') finish(true);
        };
        side.appendChild(help);

        if (step.kind === 'write' && mode === 'hand') {
          const single = step.single || Array.from(plain(step.answer)).length === 1;
          pad = RB.pad.create(main, {
            maxLen: single ? 1 : Math.max(4, Array.from(plain(step.fullAnswer || step.answer)).length + 3),
            script: step.script || 'any',
            guide: step.copy ? Array.from(plain(step.answer))[0] : null,
            onChange: () => { if (step.copy && pad) pad.setGuide(Array.from(plain(step.answer))[pad.text().length] || null); },
            onAssist: (why) => { if (why !== 'model' || !step.copy) active.helpUsed = true; },
            modelFor: () => Array.from(plain(step.answer))[pad ? Math.min(pad.text().length, Array.from(plain(step.answer)).length - 1) : 0],
          });
          const submit = RB.ui.el('button', 'btn primary', 'Submit answer ▶');
          submit.style.width = '100%';
          submit.onclick = () => {
            if (locked) return;
            if (pad.hasPending()) { RB.ui.notice('Confirm (✓) or clear the character on the pad first.', 'info'); return; }
            if (!pad.text()) { RB.ui.notice('Write and confirm at least one character first.', 'info'); return; }
            evaluate(pad.text(), 'hand', pad.meta());
          };
          const sb = RB.ui.el('div', 'box');
          sb.appendChild(submit);
          side.insertBefore(sb, side.firstChild);
        } else if (step.kind === 'write' && mode === 'ime') {
          const box = RB.ui.el('div', 'box ime');
          box.innerHTML = '<label class="small dim" for="ime-in">Type your answer (Japanese input / IME ' + (step.mode === 'reading' ? '— kana or kanji' : '— kana') + '). Enter submits once composition is finished.</label>' +
            '<input id="ime-in" type="text" lang="ja" autocomplete="off" autocapitalize="off" spellcheck="false" inputmode="text"><div class="row" style="margin-top:0.4em"><button class="btn primary" data-a="sub">Submit ▶</button></div>';
          main.appendChild(box);
          const inp = box.querySelector('input');
          let composing = false;
          inp.addEventListener('compositionstart', () => (composing = true));
          inp.addEventListener('compositionend', () => { setTimeout(() => (composing = false), 0); });
          inp.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
              if (composing || e.isComposing || e.keyCode === 229) return; // IME is still composing: let it finish
              e.preventDefault();
              if (inp.value.trim()) evaluate(inp.value, 'ime', {});
            }
            e.stopPropagation();
          });
          box.querySelector('[data-a=sub]').onclick = () => { if (!composing && inp.value.trim()) evaluate(inp.value, 'ime', {}); };
          setTimeout(() => inp.focus(), 50);
        } else if (step.kind === 'order') {
          const box = RB.ui.el('div', 'box');
          const placed = [];
          const pool = RB.util.rng(RB.util.hashStr(step.tiles.join(''))).shuffle(step.tiles.map((t, i) => ({ t, i })));
          function draw() {
            box.innerHTML = '<div class="built">' + placed.map((p, j) => '<button class="btn" data-rm="' + j + '">' + RB.ui.jhtml(p.t) + '</button>').join('') + '</div>' +
              '<div class="tiles" style="margin-top:0.5em">' + pool.map((p, j) => placed.indexOf(p) >= 0 ? '' : '<button class="btn" data-add="' + j + '">' + RB.ui.jhtml(p.t) + '</button>').join('') + '</div>' +
              '<div class="row" style="margin-top:0.5em"><button class="btn primary" data-a="sub"' + (placed.length === step.tiles.length ? '' : ' disabled') + '>Submit ▶</button><button class="btn small" data-a="clr">Clear</button></div>';
          }
          box.onclick = (e) => {
            if (locked) return;
                const add = e.target.closest('[data-add]'), rm = e.target.closest('[data-rm]'), a = e.target.closest('[data-a]');
            if (add) placed.push(pool[+add.getAttribute('data-add')]);
            if (rm) placed.splice(+rm.getAttribute('data-rm'), 1);
            if (a && a.getAttribute('data-a') === 'clr') placed.length = 0;
            if (a && a.getAttribute('data-a') === 'sub') { evaluateOrder(placed.map((p) => p.t)); return; }
            draw();
          };
          draw();
          main.appendChild(box);
        } else {
          const box = RB.ui.el('div', 'mc');
          const ch = choicesFor(step);
          ch.forEach((o, i) => {
            const b = RB.ui.el('button', 'btn');
            b.innerHTML = o.text != null ? RB.ui.jhtml(o.text) : (o.jp ? RB.ui.jhtml(o.jp) : '') + (o.en ? '<div class="enline">' + esc(o.en) + '</div>' : '');
            b.onclick = (e) => {
              if (locked) return;
                    if (step.kind === 'choose') evaluateChoice(o, b);
              else {
                evaluate(o.text, 'choice', {});
                // like comprehension choices: a wrong option can't be picked twice
                if (!o.ok) b.disabled = true;
              }
            };
            box.appendChild(b);
            void i;
          });
          main.appendChild(box);
        }
      }
      function fb(html, cls) {
        const w = wrap.querySelector('.fbwrap');
        if (w) { w.className = 'fbwrap fb ' + (cls || ''); w.innerHTML = html; }
      }
      function explainHtml() {
        const e = step.explain;
        if (!e) return '';
        return '<div style="margin-top:0.4em">' + (e.jp ? RB.ui.jhtml(e.jp) : '') + '<div>' + esc(RB.script.enVars(e.en || '')) + '</div></div>';
      }
      function success(modeUsed) {
        locked = true;
        res.ok = true;
        res.mode = modeUsed;
        if (res.firstTry == null) res.firstTry = true;
        if (active.helpUsed) res.assisted = true;
        RB.audio && RB.audio.sfx('answer_right');
        fb('<b style="color:var(--good)">✓ Yes.</b>' + (res.assisted ? ' <span class="dim small">(assisted — that\'s fine)</span>' : '') + explainHtml(), 'ok');
        const w = wrap.querySelector('.fbwrap');
        const btn = RB.ui.el('button', 'btn primary', opts.continueLabel || 'Continue ▶');
        btn.style.marginTop = '0.5em';
        btn.onclick = () => finish(false);
        w.appendChild(btn);
        btn.focus();
        if (opts.autoContinue) setTimeout(() => { if (wrap.isConnected) finish(false); }, opts.autoContinue);
      }
      function evaluate(text, modeUsed, meta) {
        const r = check(text, step);
        if (r.ok) {
          if (meta.assisted) active.helpUsed = true;
          success(modeUsed);
          return;
        }
        // Wrong: was it the recognizer's uncertainty or a language mistake?
        if (modeUsed === 'hand' && meta.uncertain) {
          res.recogMisses++;
          RB.audio && RB.audio.sfx('recog_unsure');
          fb('The recognizer wasn\'t sure about your writing, so this doesn\'t count against you. Your strip reads <span class="jp big" lang="ja">' + esc(text) + '</span>. If that isn\'t what you meant, tap a character to rewrite it (or use the chart).', 'unsure');
          return;
        }
        res.mistakes++;
        if (res.firstTry == null) res.firstTry = false;
        RB.audio && RB.audio.sfx('answer_wrong');
        const msgs = (r.feedback || []).map((f) => '<div>' + (f.jp ? RB.ui.jhtml(f.jp) + ' ' : '') + esc(f.en) + '</div>').join('') || '<div>That isn\'t what this needs.</div>';
        fb('<b>Not quite.</b> You gave <span class="jp" lang="ja">' + esc(plain(text)) + '</span>.' + msgs + '<div class="small dim" style="margin-top:0.3em">Try again — take all the time you need.</div>', 'no');
        if (opts.onMistake) opts.onMistake(r);
        if (pad) pad.reset();
      }
      function evaluateChoice(o, btn) {
        if (o.ok) { success('choice'); btn.classList.add('on'); return; }
        res.mistakes++;
        if (res.firstTry == null) res.firstTry = false;
        btn.disabled = true;
        RB.audio && RB.audio.sfx('answer_wrong');
        fb('<b>Not that one.</b> ' + (o.why ? esc(o.why.en) : '') + '<div class="small dim">Try another.</div>', 'no');
        if (opts.onMistake) opts.onMistake({});
      }
      function evaluateOrder(arr) {
        const norm = (a) => a.map(plain).join('');
        const alts = [step.answer].concat(step.alts || []);
        if (alts.some((a) => norm(a) === norm(arr))) { success('choice'); return; }
        res.mistakes++;
        if (res.firstTry == null) res.firstTry = false;
        RB.audio && RB.audio.sfx('answer_wrong');
        fb('<b>Not quite.</b> ' + (step.orderHint ? esc(step.orderHint.en) : 'Check where the particles and the verb go.') + '<div class="small dim">Try again.</div>', 'no');
        if (opts.onMistake) opts.onMistake({});
      }
      function reveal() {
        active.helpUsed = true;
        res.assisted = true;
        let ans = '';
        if (step.kind === 'write') ans = plain(step.fullAnswer ? step.answer : step.answer);
        if (step.kind === 'choose') ans = (step.options.find((o) => o.ok) || {}).en || (step.options.find((o) => o.ok) || {}).jp || '';
        if (step.kind === 'order') ans = step.answer.map(plain).join(' ');
        fb('The answer is <span class="jp big" lang="ja" style="font-size:1.4em">' + esc(ans) + '</span>.' + explainHtml() + '<div class="small dim">This is recorded as assisted. Enter it to continue, or just continue.</div>', 'ok');
        const w = wrap.querySelector('.fbwrap');
        const btn = RB.ui.el('button', 'btn', 'Continue ▶');
        btn.onclick = () => { res.ok = true; res.mode = res.mode || mode; finish(false); };
        w.appendChild(btn);
        if (pad && step.kind === 'write') pad.setGuide(Array.from(plain(step.answer))[0]);
      }
      function finish(cancelled) {
        if (pad) { pad.destroy(); pad = null; }
        RB.ui.popLayer(layer);
        RB.ui.help.hide(true);
        active = null;
        res.cancelled = cancelled;
        if (!cancelled && step.item && !opts.noRecord) {
          RB.learn.record(step.item, { ok: res.firstTry !== false, mode: res.mode === 'hand' ? 'hand' : res.mode === 'ime' ? 'ime' : 'choice', assisted: res.assisted, ctx: opts.ctxTag });
        }
        if (step.item) [].concat(step.item).forEach((i) => RB.learn.markIntroduced(i));
        resolve(res);
      }
      layer.onAction = (a) => {
        if (a === 'cancel' && opts.allowCancel !== false && !locked) { finish(true); return true; }
        if (a === 'ok' && locked) { finish(false); return true; }
        return false;
      };
      renderCtx();
      renderWork();
      RB.ui.pushLayer(layer);
    });
  }

  // Authored challenge by id: all steps must be completed (retries unlimited).
  async function run(id, ctx) {
    const ch = RB.content.challenges[id];
    if (!ch) { console.warn('missing challenge', id); return { ok: true }; }
    if (RB.test && RB.test.auto) { RB.tasks.stepsOf(ch).forEach((st, i) => RB.test.solveStep(st, 'challenge ' + id + '[' + i + ']')); RB.game.s.flags['chal:' + id] = true; return { ok: true }; }
    RB.game.pushMode('challenge');
    try {
      if (ch.intro) await RB.ui.card(ch.intro.jp || '', ch.intro.en || '');
      const steps = RB.tasks.stepsOf(ch);
      const results = [];
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        step.title = step.title || (ch.title ? ch.title.en + (steps.length > 1 ? ' (' + (i + 1) + '/' + steps.length + ')' : '') : '');
        if (step.teach && !RB.learn.introduced([].concat(step.item)[0])) await teachCard(step.teach);
        const r = await runStep(step, { ctxTag: id, cancelLabel: 'Come back later' });
        if (r.cancelled) return { ok: false, cancelled: true };
        results.push(r);
      }
      RB.game.s.flags['chal:' + id] = true;
      return { ok: true, results };
    } finally {
      RB.game.popMode('challenge');
    }
  }
  function teachCard(t) {
    if (RB.test && RB.test.auto) return Promise.resolve();
    return new Promise((resolve) => {
      const scrim = RB.ui.el('div', 'scrim');
      const pn = RB.ui.el('div', 'panel');
      pn.style.width = 'min(620px, calc(100vw - 16px))';
      pn.innerHTML = '<header><h2>' + esc(t.title || 'Something new') + '</h2></header><div class="body">' + (t.jp ? '<div style="font-size:1.4em">' + RB.ui.jhtml(t.jp) + '</div>' : '') + '<p>' + esc(t.en || '') + '</p>' + (t.ex || []).map((e) => '<div>' + RB.ui.jhtml(e.jp) + ' <span class="dim">' + esc(e.en) + '</span></div>').join('') + '</div><div class="foot"><button class="btn primary">Got it ▶</button></div>';
      scrim.appendChild(pn);
      const lay = { el: scrim, name: 'teach' };
      const done = () => { RB.ui.popLayer(lay); resolve(); };
      lay.onCancel = done;
      pn.querySelector('.foot button').onclick = done;
      RB.ui.pushLayer(lay);
    });
  }

  // Optional practice from the notebook: due/weak items, no stakes.
  async function practice() {
    RB.game.pushMode('challenge');
    try {
      const weak = RB.learn.weakest(12);
      const pool = weak.length ? weak : RB.tasks.itemPool({});
      for (let i = 0; i < 5; i++) {
        const id = RB.learn.pick(pool, 1, { ignoreCooldown: i > 2 })[0];
        const step = id ? RB.tasks.prepare(RB.tasks.stepFor(id) || RB.tasks.next({})) : RB.tasks.next({});
        if (!step) break;
        step.title = 'Practice ' + (i + 1) + ' / 5 (optional)';
        const r = await runStep(step, { ctxTag: 'practice', cancelLabel: 'Stop practising' });
        if (r.cancelled) break;
      }
    } finally {
      RB.game.popMode('challenge');
    }
  }

  return { run, runStep, practice, active: isActive, noteHelp, teachCard, check, choicesFor };
})();
