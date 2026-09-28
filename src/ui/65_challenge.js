/* Challenge runner. Presents a step in the player's chosen input mode
 * (handwriting, choices, keyboard/IME), lets them switch mid-step without
 * losing anything, evaluates the CONFIRMED text with RB.answers (separately
 * from recognition), explains mistakes, and records mastery.
 * Recognizer uncertainty is never treated as a language mistake.
 *
 * Layout (folio materials): a cloth frame holding three paper pieces that
 * read in the order of the task — 1 the task slip (prompt), 2 the sheet
 * (writing canvas with what the recognizer read, or choices / keyboard /
 * pieces, under paper tabs that switch input mode), 3 the answer slip (the
 * composed answer, Submit, and language feedback). Phones stack them;
 * wider screens set them side by side. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.challenge = (function () {
  'use strict';
  const esc = RB.util.esc;
  const I = (n) => RB.learnUi.icon(n);
  let active = null; // {step, assisted}

  function isActive() { return !!active; }
  function noteHelp() { if (active) active.helpUsed = true; }

  function plain(s) { return RB.tasks.plain(s || ''); }
  // English feedback may carry {漢字|かな} markup for a word it quotes: give it ruby
  const enRuby = (t) => RB.learnUi.mixed(t);

  // opts.handwritten: the text came from the writing pad, so characters that
  // are written with one shape (ロ/口, へ/ヘ…) count as one (RB.answers).
  function check(input, step, opts) {
    if (step.kind !== 'write') return { ok: false };
    const accept = (step.accept && step.accept.length ? step.accept : [step.answer]).map(String);
    if (RB.answers && RB.answers.check) return RB.answers.check(input, { accept, mode: step.mode || 'kana', scriptFree: !!step.scriptFree, handwritten: !!(opts && opts.handwritten) });
    const norm = (s) => plain(s).replace(/\s/g, '');
    const ok = accept.some((a) => norm(a) === norm(input));
    return { ok, feedback: ok ? [] : [{ code: 'generic', en: 'That is not what this needs.' }] };
  }
  // The order choices are shown in. Seeded by the step and the review clock,
  // so it holds while a step is open (switching input modes redraws it) and
  // changes from one asking to the next.
  function orderRng(key) {
    let turn = 0;
    try { turn = RB.learn.clock(); } catch (e) { turn = 0; }
    return RB.util.rng(RB.util.hashStr(key + '#' + turn));
  }
  function choicesFor(step) {
    // Authors (and the meaning questions RB.tasks builds) list the right
    // option first, so where an option sits must never give the answer away.
    if (step.kind === 'choose') {
      const key = (step.item || '') + '|' + ((step.prompt && step.prompt.en) || '') + '|' + step.options.map((o) => o.en || o.jp || '').join('|');
      return orderRng(key).shuffle(step.options).map((o) => Object.assign({}, o));
    }
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
    const r = orderRng(ans);
    return r.shuffle(Array.from(new Set(opts.map(plain)))).map((t) => ({ text: t, ok: acc.has(t) }));
  }

  const MODES = [
    { id: 'hand', en: 'Write', jp: '{書|か}く', icon: 'practice' },
    { id: 'choice', en: 'Choose', jp: '{選|えら}ぶ', icon: 'list' },
    { id: 'ime', en: 'Type', jp: '{打|う}つ', icon: 'keyboard' },
  ];
  const SHEET_LAB = { hand: 'Write', choice: 'Choose', ime: 'Type', order: 'Arrange the pieces' };
  // A kana-practice step (a k: item) asks for kana, so its pad reads kana only;
  // every other step reads kanji too when the player does (RB.pad).
  const kanaTask = (step) => [].concat(step.item || []).some((i) => typeof i === 'string' && i.slice(0, 2) === 'k:');
  // the player's own text, with readings on any kanji (there is no word context)
  const ownText = (t) => RB.learnUi.mixed(RB.answers && RB.answers.rubyText ? RB.answers.rubyText(t) : t);

  // Render one step; resolves with a result object.
  function runStep(step, opts) {
    opts = opts || {};
    if (RB.test && RB.test.auto) return Promise.resolve(RB.test.solveStep(step, 'step ' + (step.title || step.item)));
    return new Promise((resolve) => {
      const st = RB.game.settings;
      let mode = step.kind === 'write' ? (opts.mode || st.input || 'hand') : step.kind === 'order' ? 'order' : 'choice';
      if (step.kind === 'write' && !MODES.some((m) => m.id === mode)) mode = 'hand';
      const res = { ok: false, firstTry: null, mistakes: 0, assisted: false, mode: null, recogMisses: 0 };
      active = { step, helpUsed: false };
      const canLeave = opts.allowCancel !== false;
      const tid = 'chal-t' + Math.random().toString(36).slice(2, 7);
      const wrap = RB.ui.el('div', 'chal');
      wrap.setAttribute('data-kind', step.kind);
      wrap.innerHTML =
        '<div class="chal-frame" role="dialog" aria-modal="true" aria-labelledby="' + tid + '">' +
          '<div class="chal-head"><h2 class="chal-title" id="' + tid + '"></h2>' +
            (canLeave ? '<button class="cbtn" data-a="leave">' + I('back') + '<span>' + esc(opts.cancelLabel || 'Step away') + '</span></button>' : '') + '</div>' +
          '<div class="chal-body">' +
            '<section class="chal-task slip" aria-label="The task"><div class="slip-lab">The task</div><div class="task-ctx"></div>' +
              '<div class="task-acts"><span class="task-tr"></span><button class="pbtn quiet" data-a="reveal">' + I('help') + '<span>I don\'t know</span></button></div></section>' +
            '<section class="chal-work"><div class="tabslot"></div><div class="chal-sheet slip" id="chal-sheet"><div class="slip-lab sheet-lab"><span class="t"></span></div></div></section>' +
            '<section class="chal-answer slip" aria-label="Your answer">' +
              '<div class="chal-line"></div>' +
              '<button class="pbtn primary chal-submit" data-a="submit">' + I('seal') + '<span>Submit<span class="w"> answer</span></span></button>' +
              '<div class="fbwrap hint" aria-live="polite"></div>' +
            '</section>' +
          '</div>' +
        '</div>';
      const $ = (q) => wrap.querySelector(q);
      const ctxEl = $('.chal-task .task-ctx'), sheet = $('.chal-sheet'), line = $('.chal-line'), body = $('.chal-body');
      const submitBtn = $('[data-a=submit]'), revealBtn = $('[data-a=reveal]');
      $('.chal-title').innerHTML = (step.titleJp ? RB.ui.jhtml(step.titleJp) + ' ' : '') + esc(step.title || (step.kind === 'choose' ? 'Read and choose' : step.kind === 'order' ? 'Put it in order' : 'Write it'));
      const layer = { el: wrap, name: 'challenge', noAutofocus: true };
      let pad = null, locked = false, tabsApi = null, ime = null, order = null;
      const panes = {};

      // ---- 1 · the task ----
      let showEn = !!(step.showEn || (step.ctx && step.ctx.showEn) || (RB.game.s && RB.game.s.learn.profile === 'F'));
      function renderCtx() {
        let h = opts.header ? '<div class="chal-situ">' + opts.header + '</div>' : '';
        if (step.ctx && step.ctx.jp) {
          h += '<div class="chal-ctx' + (step.ctx.big ? ' big' : '') + '">' + RB.ui.jhtml(step.ctx.jp) + '</div>';
          if (step.ctx.en && showEn) h += '<div class="chal-en">' + esc(RB.script.enVars(step.ctx.en)) + '</div>';
        }
        if (step.prompt) h += '<div class="chal-prompt">' + esc(RB.script.enVars(step.prompt.en || '')) + (step.prompt.jp ? ' ' + RB.ui.jhtml(step.prompt.jp) : '') + '</div>';
        if (step.kind === 'write' && step.template && (step.template.before || step.template.after)) {
          h += '<div class="chal-tpl">' + RB.ui.jhtml(step.template.before || '') + '<span class="blank jp" role="img" aria-label="the missing part">？</span>' + RB.ui.jhtml(step.template.after || '') + '</div>';
        }
        if (step.copy) h += '<div class="chal-copy">' + RB.ui.jhtml(step.answer) + '</div>';
        ctxEl.innerHTML = h;
        // the translation toggle shares a line with "I don't know"
        const trSlot = wrap.querySelector('.task-tr');
        trSlot.innerHTML = step.ctx && step.ctx.jp && step.ctx.en && !showEn ? '<button class="pbtn quiet tr" data-a="tr" title="Show the English (counts as assisted)">' + I('note') + '<span>Translate <span class="aside">(assisted)</span></span></button>' : '';
        const tr = trSlot.querySelector('[data-a=tr]');
        if (tr) tr.onclick = () => { showEn = true; active.helpUsed = true; renderCtx(); };
      }

      // ---- 2 · the sheet: one pane per input mode, kept when switching ----
      const build = {
        hand(p) {
          const single = step.single || Array.from(plain(step.answer)).length === 1;
          pad = RB.pad.create(p, {
            maxLen: single ? 1 : Math.max(4, Array.from(plain(step.fullAnswer || step.answer)).length + 3),
            script: step.script || 'any',
            kanji: kanaTask(step) ? false : undefined,
            guide: step.copy ? Array.from(plain(step.answer))[0] : null,
            composeHost: line,
            onChange: () => { if (step.copy && pad) pad.setGuide(Array.from(plain(step.answer))[pad.text().length] || null); },
            onAssist: (why) => { if (why !== 'model' || !step.copy) active.helpUsed = true; },
            modelFor: () => Array.from(plain(step.answer))[pad ? Math.min(pad.text().length, Array.from(plain(step.answer)).length - 1) : 0],
          });
        },
        ime(p) {
          p.innerHTML = '<label class="ime-lab" for="ime-in">Type your answer in Japanese</label>' +
            '<input id="ime-in" type="text" lang="ja" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" inputmode="text" enterkeyhint="done">' +
            '<p class="hint">Use a Japanese keyboard (IME)' + (step.mode === 'reading' ? ' — kana or kanji' : ' — kana') + '. Enter submits once the composition is finished.</p>';
          const inp = p.querySelector('input');
          ime = { inp, composing: false };
          inp.addEventListener('compositionstart', () => (ime.composing = true));
          inp.addEventListener('compositionend', () => { setTimeout(() => (ime.composing = false), 0); });
          inp.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
              if (ime.composing || e.isComposing || e.keyCode === 229) return; // IME is still composing: let it finish
              e.preventDefault();
              submitIme();
            }
            // typing never reaches the game's keys (Escape included); Tab still cycles focus
            if (e.key !== 'Tab') e.stopPropagation();
          });
          inp.addEventListener('input', syncSubmit);
          inp.addEventListener('focus', () => setTimeout(keepFocusVisible, 250));
        },
        choice(p) {
          const box = RB.ui.el('div', 'mc' + (step.kind === 'choose' ? ' mc-read' : ''));
          box.setAttribute('role', 'group');
          box.setAttribute('aria-label', 'Choices');
          const ch = choicesFor(step);
          ch.forEach((o) => {
            const b = RB.ui.el('button', 'btn choice');
            b.innerHTML = o.text != null ? RB.ui.jhtml(o.text) : (o.jp ? RB.ui.jhtml(o.jp) : '') + (o.en ? '<span class="enline">' + esc(o.en) + '</span>' : '');
            b.onclick = () => {
              if (locked) return;
              if (step.kind === 'choose') evaluateChoice(o, b);
              else {
                evaluate(o.text, 'choice', {});
                // like comprehension choices: a wrong option can't be picked twice
                if (!o.ok) { b.disabled = true; b.classList.add('tried'); }
                else b.classList.add('on');
              }
            };
            box.appendChild(b);
          });
          RB.learnUi.guardTaps(box);
          p.appendChild(box);
        },
        order(p) {
          const placed = [];
          const pool = RB.util.rng(RB.util.hashStr(step.tiles.join(''))).shuffle(step.tiles.map((t, i) => ({ t, i })));
          const lineBox = RB.ui.el('div', 'order-line');
          lineBox.innerHTML = '<div class="pad-lab" id="order-lab">Your order</div><ol class="built" aria-labelledby="order-lab"></ol>' +
            '<button class="pbtn" data-o="clr">' + I('erase') + '<span>Clear</span></button>';
          line.appendChild(lineBox);
          p.innerHTML = '<div class="pool-lab muted small">Tap the pieces in the order they belong. Tap a placed piece to take it back.</div><div class="tiles"></div>';
          const built = lineBox.querySelector('.built'), tiles = p.querySelector('.tiles');
          function draw() {
            built.innerHTML = placed.length ? placed.map((pc, j) => '<li><button class="tile placed" data-rm="' + j + '">' + RB.ui.jhtml(pc.t) + '</button></li>').join('') : '<li class="empty muted small">Nothing placed yet.</li>';
            tiles.innerHTML = pool.map((pc, j) => placed.indexOf(pc) >= 0 ? '' : '<button class="tile" data-add="' + j + '">' + RB.ui.jhtml(pc.t) + '</button>').join('') || '<span class="muted small">All pieces placed — check the order, then submit.</span>';
            lineBox.querySelector('[data-o=clr]').disabled = !placed.length;
            syncSubmit();
          }
          const click = (e) => {
            if (locked) return;
            const add = e.target.closest('[data-add]'), rm = e.target.closest('[data-rm]'), clr = e.target.closest('[data-o=clr]');
            if (add) placed.push(pool[+add.getAttribute('data-add')]);
            else if (rm) placed.splice(+rm.getAttribute('data-rm'), 1);
            else if (clr) placed.length = 0;
            else return;
            RB.audio && RB.audio.sfx('cursor');
            draw();
          };
          p.addEventListener('click', click);
          lineBox.addEventListener('click', click);
          RB.learnUi.guardTaps(p);
          RB.learnUi.guardTaps(lineBox);
          order = { placed, lineBox, complete: () => placed.length === step.tiles.length, value: () => placed.map((x) => x.t) };
          draw();
        },
      };
      function pane(m) {
        if (panes[m]) return panes[m];
        const p = RB.ui.el('div', 'pane pane-' + m);
        p.setAttribute('data-pane', m);
        sheet.appendChild(p);
        panes[m] = p;
        build[m](p);
        return p;
      }
      function showMode(m, how) {
        mode = m;
        pane(m);
        for (const k in panes) panes[k].hidden = k !== m;
        wrap.setAttribute('data-mode', m);
        if (pad) pad.compose.hidden = m !== 'hand';
        if (order) order.lineBox.hidden = m !== 'order';
        line.hidden = m === 'choice' || m === 'ime';
        submitBtn.hidden = m === 'choice';
        $('.sheet-lab .t').textContent = SHEET_LAB[m];
        if (step.kind === 'write') sheet.setAttribute('aria-labelledby', 'tab-' + m);
        else { sheet.setAttribute('role', 'region'); sheet.setAttribute('aria-label', SHEET_LAB[m]); }
        if (m === 'hand' && pad) requestAnimationFrame(() => pad && pad.layout());
        if (m === 'ime' && ime) {
          // keep your place: carry what was written by hand over to the keyboard
          if (!ime.inp.value && pad && pad.text()) { ime.inp.value = pad.text(); syncSubmit(); }
          setTimeout(() => { if (wrap.isConnected && mode === 'ime' && !locked) ime.inp.focus({ preventScroll: true }); }, how === 'init' ? 50 : 0);
        }
        if (wrap.querySelector('.fbwrap.hint')) setHint();
        syncSubmit();
      }
      function syncSubmit() {
        let ready = true;
        if (mode === 'ime') ready = !!(ime && ime.inp.value.trim());
        if (mode === 'order') ready = !!(order && order.complete());
        submitBtn.disabled = locked || !ready;
        submitBtn.setAttribute('aria-disabled', String(submitBtn.disabled));
      }
      function setHint() {
        const w = wrap.querySelector('.fbwrap');
        w.className = 'fbwrap hint';
        wrap.classList.remove('fb-on');
        w.removeAttribute('data-fb');
        w.innerHTML = '<span class="muted">' + (mode === 'choice' ? (step.kind === 'choose' ? 'Choose the best answer. A wrong choice can be tried again.' : 'Choose the answer. Nothing is timed.') : 'Take your time — nothing happens until you submit.') + '</span>';
      }

      // ---- 3 · answer and feedback ----
      function fb(kind, head, html) {
        const w = wrap.querySelector('.fbwrap');
        if (!w) return;
        w.className = 'fbwrap fb ' + kind;
        wrap.classList.add('fb-on');
        w.setAttribute('data-fb', kind);
        w.innerHTML = RB.learnUi.fbHead(kind, head) + '<div class="fb-b">' + html + '</div>';
        requestAnimationFrame(() => reveal(w));
      }
      function reveal(el) {
        // bring feedback into view inside the one scroll surface (never the page)
        if (!el.isConnected) return;
        const br = body.getBoundingClientRect(), r = el.getBoundingClientRect();
        if (r.bottom > br.bottom) body.scrollTop += Math.min(r.bottom - br.bottom + 8, r.top - br.top - 8);
        else if (r.top < br.top) body.scrollTop -= br.top - r.top + 8;
      }
      function explainHtml() {
        const e = step.explain;
        if (!e) return '';
        return '<div class="fb-ex">' + (e.jp ? '<div class="fb-jp">' + RB.ui.jhtml(e.jp) + '</div>' : '') + '<div>' + esc(RB.script.enVars(e.en || '')) + '</div></div>';
      }
      function continueBtn(label) {
        const btn = RB.ui.el('button', 'pbtn primary fb-go', '<span>' + esc(label || opts.continueLabel || 'Continue') + '</span>' + I('next'));
        btn.setAttribute('data-a', 'continue');
        return btn;
      }
      function lock() {
        locked = true;
        wrap.classList.add('locked');
        revealBtn.hidden = true;
        syncSubmit();
        if (tabsApi) tabsApi.el.querySelectorAll('.ptab').forEach((b) => b.setAttribute('aria-disabled', 'true'));
      }
      function success(modeUsed, notes) {
        lock();
        res.ok = true;
        res.mode = modeUsed;
        if (res.firstTry == null) res.firstTry = true;
        if (active.helpUsed) res.assisted = true;
        RB.audio && RB.audio.sfx('answer_right');
        // how it was written: "水 (みず) — written in kanji", one-shape characters
        const how = (notes || []).map((n) => '<div class="fb-how" data-note="' + esc(n.code) + '">' + enRuby(n.en) + '</div>').join('');
        fb('ok', 'Yes.', how + (res.assisted ? '<span class="muted small">Assisted — that\'s fine.</span>' : '') + explainHtml());
        const w = wrap.querySelector('.fbwrap');
        const btn = continueBtn();
        btn.onclick = () => finish(false);
        w.appendChild(btn);
        btn.focus({ preventScroll: true });
        if (opts.autoContinue) setTimeout(() => { if (wrap.isConnected) finish(false); }, opts.autoContinue);
      }
      function evaluate(text, modeUsed, meta) {
        const r = check(text, step, { handwritten: modeUsed === 'hand' });
        if (r.ok) {
          if (meta.assisted) active.helpUsed = true;
          success(modeUsed, r.notes);
          return;
        }
        // Wrong: was it the recognizer's uncertainty or a language mistake?
        if (modeUsed === 'hand' && meta.uncertain) {
          res.recogMisses++;
          RB.audio && RB.audio.sfx('recog_unsure');
          fb('unsure', 'I could not read that clearly',
            '<p>This doesn\'t count against you. Your answer reads <span class="jp big" lang="ja">' + ownText(text) + '</span> — if you meant something else, tap it to rewrite it, or use the chart.</p>');
          return;
        }
        res.mistakes++;
        if (res.firstTry == null) res.firstTry = false;
        RB.audio && RB.audio.sfx('answer_wrong');
        const msgs = (r.feedback || []).map((f) => '<div class="fb-why">' + (f.jp && !/\{[^|}]+\|/.test(f.en || '') ? RB.ui.jhtml(f.jp) + ' ' : '') + enRuby(f.en) + '</div>').join('') || '<div class="fb-why">That isn\'t what this needs.</div>';
        fb('no', 'Not quite.', '<p>You gave <span class="jp big" lang="ja">' + ownText(plain(text)) + '</span>.</p>' + msgs + '<p class="muted small">Try again — take all the time you need.</p>');
        if (opts.onMistake) opts.onMistake(r);
        if (pad && modeUsed === 'hand') pad.reset();
      }
      function evaluateChoice(o, btn) {
        if (o.ok) { btn.classList.add('on'); success('choice'); return; }
        res.mistakes++;
        if (res.firstTry == null) res.firstTry = false;
        btn.disabled = true;
        btn.classList.add('tried');
        RB.audio && RB.audio.sfx('answer_wrong');
        fb('no', 'Not that one.', (o.why ? '<div class="fb-why">' + (o.why.jp ? RB.ui.jhtml(o.why.jp) + ' ' : '') + esc(o.why.en) + '</div>' : '') + '<p class="muted small">Try another.</p>');
        if (opts.onMistake) opts.onMistake({});
      }
      function evaluateOrder(arr) {
        const norm = (a) => a.map(plain).join('');
        const alts = [step.answer].concat(step.alts || []);
        if (alts.some((a) => norm(a) === norm(arr))) { success('choice'); return; }
        res.mistakes++;
        if (res.firstTry == null) res.firstTry = false;
        RB.audio && RB.audio.sfx('answer_wrong');
        fb('no', 'Not quite.', '<div class="fb-why">' + (step.orderHint ? esc(step.orderHint.en) : 'Check where the particles and the verb go.') + '</div><p class="muted small">Try again.</p>');
        if (opts.onMistake) opts.onMistake({});
      }
      function submitIme() {
        if (locked || !ime || ime.composing) return;
        if (ime.inp.value.trim()) evaluate(ime.inp.value, 'ime', {});
      }
      function submit() {
        if (locked) return;
        if (mode === 'hand') {
          if (pad.hasPending()) { RB.ui.notice('Confirm (✓) or clear the character on the pad first.', 'info'); return; }
          if (!pad.text()) { RB.ui.notice('Write and confirm at least one character first.', 'info'); return; }
          evaluate(pad.text(), 'hand', pad.meta());
        } else if (mode === 'ime') submitIme();
        else if (mode === 'order' && order && order.complete()) evaluateOrder(order.value());
      }
      function revealAnswer() {
        active.helpUsed = true;
        res.assisted = true;
        let ans = '';
        if (step.kind === 'write') ans = plain(step.answer);
        if (step.kind === 'choose') ans = (step.options.find((o) => o.ok) || {}).en || (step.options.find((o) => o.ok) || {}).jp || '';
        if (step.kind === 'order') ans = step.answer.map(plain).join(' ');
        revealBtn.hidden = true;
        fb('reveal', 'The answer', '<p><span class="jp big" lang="ja">' + esc(ans) + '</span></p>' + explainHtml() + '<p class="muted small">This is recorded as assisted. Enter it to continue, or just continue.</p>');
        const w = wrap.querySelector('.fbwrap');
        const btn = continueBtn();
        btn.onclick = () => { res.ok = true; res.mode = res.mode || mode; finish(false); };
        w.appendChild(btn);
        btn.focus({ preventScroll: true });
        if (pad && step.kind === 'write') pad.setGuide(Array.from(plain(step.answer))[0]);
      }

      // ---- the software keyboard: keep the typing field above it ----
      const vv = typeof window !== 'undefined' ? window.visualViewport : null;
      function keepFocusVisible() {
        const a = document.activeElement;
        if (!a || !wrap.contains(a) || !RB.input.isTextTarget(a)) return;
        reveal(a);
      }
      function syncVV() {
        if (!vv) return;
        // pinch-zoom moves the visual viewport too; never chase it
        if (vv.scale && Math.abs(vv.scale - 1) > 0.01) { wrap.style.removeProperty('--vv-h'); wrap.style.removeProperty('--vv-top'); wrap.classList.remove('kb'); return; }
        const covered = window.innerHeight - vv.height - vv.offsetTop;
        if (covered > 60 || vv.offsetTop > 1) {
          wrap.style.setProperty('--vv-h', Math.round(vv.height) + 'px');
          wrap.style.setProperty('--vv-top', Math.round(vv.offsetTop) + 'px');
          wrap.classList.add('kb');
          requestAnimationFrame(keepFocusVisible);
        } else {
          wrap.style.removeProperty('--vv-h'); wrap.style.removeProperty('--vv-top'); wrap.classList.remove('kb');
        }
      }
      if (vv) { vv.addEventListener('resize', syncVV); vv.addEventListener('scroll', syncVV); }

      function finish(cancelled) {
        if (vv) { vv.removeEventListener('resize', syncVV); vv.removeEventListener('scroll', syncVV); }
        if (tabsApi) { tabsApi.destroy(); tabsApi = null; }
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
      wrap.addEventListener('click', (e) => {
        const b = e.target.closest('[data-a]');
        if (!b || b.disabled || !wrap.contains(b)) return;
        const a = b.getAttribute('data-a');
        if (a === 'leave' && !locked) finish(true);
        else if (a === 'submit') submit();
        else if (a === 'reveal' && !locked) revealAnswer();
      });
      layer.onAction = (a, e) => {
        // Backspace while writing edits the answer line instead of leaving
        if (a === 'cancel' && e && e.code === 'Backspace' && mode === 'hand' && pad && !locked) { pad.remove(); return true; }
        if (a === 'cancel' && canLeave && !locked) { finish(true); return true; }
        if (a === 'ok' && locked) { finish(false); return true; }
        return false;
      };
      renderCtx();
      if (step.kind === 'write') {
        tabsApi = RB.ui.folio.tabs($('.tabslot'), MODES, mode, (id) => {
          if (locked) { tabsApi.select(mode); return; }
          showMode(id, 'tab');
        }, { label: 'Answer by', panelId: 'chal-sheet' });
        tabsApi.el.classList.add('chal-tabs');
        tabsApi.el.querySelectorAll('.ptab').forEach((b) => { b.setAttribute('data-mode', b.getAttribute('data-id')); b.classList.remove('autofocus'); });
        sheet.setAttribute('role', 'tabpanel');
      }
      showMode(mode, 'init');
      RB.ui.pushLayer(layer);
      syncVV();
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
  // A note card that teaches something before it is asked for.
  function teachCard(t) {
    if (RB.test && RB.test.auto) return Promise.resolve();
    return new Promise((resolve) => {
      const lay = { name: 'teach' };
      // titleMixed / jpMixed: mixed text (English with {漢字|かな} groups), as grammar points use
      const fr = RB.learnUi.sheet({ cls: 'small teach', title: esc(t.title || 'Something new') + (t.titleMixed ? ' ' + RB.learnUi.mixed(t.titleMixed) : '') });
      fr.leaf.innerHTML = (t.jp ? '<div class="teach-jp">' + RB.ui.jhtml(t.jp) + '</div>' : t.jpMixed ? '<div class="teach-jp">' + RB.learnUi.mixed(t.jpMixed) + '</div>' : '') + (t.en ? '<p class="teach-en">' + RB.learnUi.mixed(t.en) + '</p>' : '') +
        ((t.ex || []).length ? '<h3>Examples</h3><ul class="teach-ex">' + t.ex.map((e) => '<li>' + RB.ui.jhtml(e.jp) + '<span class="en">' + esc(e.en) + '</span></li>').join('') + '</ul>' : '');
      fr.foot.innerHTML = '<span class="spacer"></span><button class="cbtn go" data-ok>' + I('done') + '<span>Got it</span></button>';
      lay.el = fr.scrim;
      const done = () => { RB.ui.popLayer(lay); resolve(); };
      lay.onCancel = done;
      fr.foot.querySelector('[data-ok]').onclick = done;
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
