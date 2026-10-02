/* Practice suite B, interface part 1: shared pieces (RB.ui.pb) and the villagers'
 * correspondence (Practice addendum §17). docs/practice/suite_b.md.
 *
 * The post box in Shino's Post House (RB.practiceB.PLACE) carries the scene
 * pb.postbox (src/content/practice_b/40_place.js): it offers the letters after the
 * journey's end and the proofreader's tray after Chapter 2; the chosen activity
 * starts through RB.activity once that scene has ended.
 *
 * A letter is answered in one of these supported ways, all against the same authored
 * answer space (RB.practiceB.space): building the reply from approved pieces (tap to
 * place, tap to take back; no dragging), choosing a reply (Foundations), or typing /
 * handwriting it through the ordinary challenge runner (RB.challenge.runStep with a
 * `judge`, nothing recorded there). The scope is shown before entry. A reply outside the
 * space gets a coverage note and the shapes the letter can read; a reply of another
 * intention gets what it would actually say. Different valid tones close the letter
 * equally. Learning evidence goes through RB.practice.objectives (once per letter per
 * campaign; replays are practice tallies). */
var RB = (globalThis.RB = globalThis.RB || {});

// The Japanese labels of this interface, kept where tools/validate.mjs walks them
// (RB.content.practiceB; the content files add letters, proof and compare beside it).
RB.content.practiceB = RB.content.practiceB || {};
RB.content.practiceB.ui = {
  place: RB.practiceB.PLACE.name,
  letters: { en: 'Villagers\' letters', jp: '{村|むら} の {人|ひと} から の {手紙|てがみ}' },
  lettersBox: { en: 'Villagers\' letters', jp: '{手紙|てがみ} の {箱|はこ}' },
  folder: { en: 'Letters folder', jp: '{手紙|てがみ} の {控|ひか}え' },
  writeReply: { en: 'Write or type your reply.', jp: '{返事|へんじ} を {書|か}きましょう 。' },
  tray: { en: 'The Proofreader\'s Tray', jp: '{校正|こうせい} の {盆|ぼん}' },
  compare: { en: 'One word, two moments', jp: '{一|ひと}つ の {言葉|ことば} 、 {二|ふた}つ の {場面|ばめん}' },
  compareWhere: { en: 'Words › One word, two moments', jp: '{言葉|ことば}' },
  open: { en: 'open', jp: '{開|あ}いて いる' },
  closed: { en: 'closed', jp: '{閉|し}まって いる' },
};
const PBT = RB.content.practiceB.ui;

RB.ui.pb = (function () {
  'use strict';
  const esc = RB.util.esc;
  const I = (n) => RB.learnUi.icon(n);
  const J = (t, vars) => (t ? RB.ui.jhtml(t, vars ? { vars } : undefined) : '');
  const MX = (t) => RB.learnUi.mixed(t || '');
  // English with {漢字|かな} groups for places that escape their text (the challenge
  // runner's prompts and options): the groups become their kana, so no kanji is shown
  // without its reading
  const kana = (t) => String(t || '').replace(/\{([^{}|]+)\|([^{}|]+)\}/g, '$2');
  const reading = (m) => (RB.jp.reading(m) || '').replace(/\s+/g, '');
  // the player's own text (a reply as written), with readings on any kanji, as the challenge runner shows it
  const own = (t) => RB.learnUi.mixed(RB.answers && RB.answers.rubyText ? RB.answers.rubyText(String(t || '')) : String(t || ''));
  const LAYERS = new Set();
  function push(lay) { LAYERS.add(lay); RB.ui.pushLayer(lay); }
  function pop(lay) { LAYERS.delete(lay); RB.ui.popLayer(lay); }
  // tear down whatever this suite has on screen (a campaign change mid-session)
  function closeAll() { for (const l of Array.from(LAYERS)) { try { pop(l); } catch (e) { /* gone */ } } }

  // A paper sheet on the cloth, like the game's other activities.
  function sheet(title, meta, o) {
    o = o || {};
    const fr = RB.learnUi.sheet({ cls: 'activity pb ' + (o.cls || ''), title, meta: meta || '', headBtn: o.close === false ? null : { html: I('back') + '<span>' + esc(o.closeLabel || 'Stop for now') + '</span>', attrs: { 'data-pb-x': '' } } });
    const lay = { el: fr.scrim, name: 'pb-' + (o.cls || 'sheet') };
    RB.learnUi.guardTaps(fr.leaf);
    return { fr, lay, leaf: fr.leaf, foot: fr.foot, el: fr.el };
  }
  function fb(el, kind, head, html) {
    el.className = 'fbwrap fb ' + kind;
    el.setAttribute('data-fb', kind);
    el.innerHTML = RB.learnUi.fbHead(kind, head) + '<div class="fb-b">' + html + '</div>';
    requestAnimationFrame(() => {
      if (!el.isConnected) return;
      const leaf = el.closest('.leaf');
      if (!leaf) return;
      const lr = leaf.getBoundingClientRect(), r = el.getBoundingClientRect();
      if (r.bottom > lr.bottom) leaf.scrollTop += r.bottom - lr.bottom + 12;
      else if (r.top < lr.top) leaf.scrollTop -= lr.top - r.top + 12;
    });
  }
  const showEnDefault = () => !!(RB.game.s && RB.game.s.learn.profile === 'F');
  const prof = () => (RB.game.s && RB.game.s.learn.profile) || 'E';
  function face(id) {
    return RB.content.chars[id] ? '<canvas width="48" height="48" class="act-face" data-pb-face="' + esc(id) + '" aria-hidden="true"></canvas>' : '';
  }
  function drawFaces(root) { for (const cv of root.querySelectorAll('canvas[data-pb-face]')) { try { RB.portraits.draw(cv, cv.getAttribute('data-pb-face'), 'neutral'); } catch (e) { /* no portrait */ } } }
  const who = (id) => (RB.content.chars[id] ? RB.content.chars[id].name : { en: id, jp: '' });
  const toneWord = (t) => ({ polite: 'polite', friendly: 'friendly', warm: 'warm', brief: 'brief', formal: 'formal', humble: 'humble', plain: 'plain', gracious: 'gracious', thanks: 'thankful', request: 'request-shaped', open: 'open', which: 'precise', where: 'precise', glad: 'glad', direct: 'direct', gentle: 'gentle', both: 'thorough', name: 'practical', 'place-first': 'practical', 'own-share': 'gracious', answer: '' })[t] || t || '';

  // ---- the bounded answer space as a challenge step --------------------------------------------
  // families: authored replies; o: { title, header, prompt:{en,jp}, ctx, what: 'letter'|'repair'|… }
  function limitHtml(families, what) {
    const oks = families.filter((f) => f.ok);
    return '<p>This ' + esc(what || 'letter') + ' can only read the replies it was written with — ' + families.length + ' of them, built from its pieces. Yours may be perfectly good Japanese; it is simply outside what this practice can check, so it is not marked wrong.</p>' +
      '<p class="muted small">Replies it can read say:</p><ul class="pb-shapes">' + oks.map((f) => '<li>' + esc(f.en) + (f.tone && toneWord(f.tone) ? ' <span class="muted small">(' + esc(toneWord(f.tone)) + ')</span>' : '') + '</li>').join('') + '</ul>' +
      '<p class="muted small">Try one of those shapes, or build it from the pieces.</p>';
  }
  function writeStep(families, o) {
    o = o || {};
    const sp = RB.practiceB.space(families);
    const oks = families.filter((f) => f.ok);
    const okReadings = [];
    let longest = '';
    families.forEach((f) => RB.practiceB.sequences(f).forEach((q) => {
      const r = reading(q.join(' '));
      if (f.ok) okReadings.push(r);
      if (r.length > longest.length) longest = r;
    }));
    return {
      kind: 'write', title: o.title, titleJp: o.titleJp, item: null,
      ctx: o.ctx || null,
      prompt: { en: kana(o.prompt && o.prompt.en), jp: o.prompt && o.prompt.jp },
      answer: reading(RB.practiceB.replyOf(oks[0])), fullAnswer: longest, accept: okReadings, mode: 'reading',
      // the Choose tab: every authored reply, in kana (its kanji would otherwise lose their readings)
      choices: families.map((f) => reading(RB.practiceB.replyOf(f))),
      judge(text, jo) {
        const m = RB.practiceB.match(sp, text, { handwritten: !!(jo && jo.handwritten) });
        if (!m) return { ok: false, limit: true, head: 'Outside what this ' + (o.what || 'letter') + ' can read', html: limitHtml(families, o.what), feedback: [] };
        if (m.family.ok) return { ok: true, matched: m.family, family: m.i };
        return { ok: false, family: m.i, feedback: [{ code: 'intent', en: m.family.why ? m.family.why.en : 'That says something else.' }] };
      },
    };
  }
  // a choose step for runStep: options [{ jp?, en, ok, why? }] (English may carry ruby groups)
  function chooseStep(options, o) {
    o = o || {};
    return {
      kind: 'choose', title: o.title, titleJp: o.titleJp, item: null, ctx: o.ctx || null, showEn: !!o.showEn,
      prompt: { en: kana(o.prompt && o.prompt.en), jp: o.prompt && o.prompt.jp },
      options: options.map((x) => ({ jp: x.jp || undefined, en: kana(x.en), ok: !!x.ok, why: x.why ? { en: kana(x.why.en) } : undefined, _src: x })),
    };
  }
  // the learning record for one authored objective: once per campaign (first assessment),
  // a replay or a supplied/exposed answer is a practice tally only
  function assess(session, rec, objId, item, r, o) {
    o = o || {};
    const s = RB.game.s;
    const via = r.mode === 'hand' ? 'hand' : r.mode === 'ime' ? 'ime' : 'choice';
    const res = { firstTry: r.firstTry !== false, mode: via, assisted: !!r.assisted };
    if (!o.sample && RB.practiceB.firstAssessment(rec, objId)) {
      const ob = session.objectives || (session.objectives = RB.practice.objectives(session));
      const recorded = ob.assess(objId, item, res, { exposed: !!o.exposed, kind: session.kind });
      if (recorded || o.exposed) RB.practiceB.markAssessed(rec, objId);
      return recorded;
    }
    RB.practice.tally(s, session.kind, { n: 1, replay: 1, ok: res.firstTry ? 1 : 0 });
    if (item) [].concat(item).forEach((i) => RB.learn.markIntroduced(i));
    return false;
  }

  // ---- a kept practice page: label, then the shared six-page budget ----------------------------------
  function askLabel(def) {
    return new Promise((resolve) => {
      const S = sheet(esc('Keep this page'), '', { cls: 'pb-keep', closeLabel: 'Cancel' });
      S.leaf.innerHTML = '<p>The page is kept as typeset text in the game\'s lettering — it is not handwriting. ' + (RB.practiceDesk && RB.practiceDesk.keepPage ? 'Kept pages share the writing desk\'s six places.' : 'Up to six pages are kept.') + '</p>' +
        '<form class="pb-label"><label for="pb-lab">Label <span class="muted small">(up to 40 characters)</span></label>' +
        '<input id="pb-lab" type="text" maxlength="40" autocomplete="off" spellcheck="false" value="' + esc(def || '') + '"></form>';
      S.foot.innerHTML = '<span class="spacer"></span><button class="cbtn go" data-pb-keepok>' + I('done') + '<span>Keep it</span></button>';
      const inp = S.leaf.querySelector('input');
      inp.addEventListener('keydown', (e) => { if (e.key !== 'Tab') e.stopPropagation(); });
      const done = (v) => { pop(S.lay); resolve(v); };
      S.leaf.querySelector('form').onsubmit = (e) => { e.preventDefault(); done(inp.value); };
      S.foot.querySelector('[data-pb-keepok]').onclick = () => done(inp.value);
      S.el.querySelector('[data-pb-x]').onclick = () => done(null);
      S.lay.onCancel = () => done(null);
      push(S.lay);
      setTimeout(() => inp.focus(), 30);
    });
  }
  // the six places are full: replace one explicitly, or cancel (never a silent deletion)
  function askReplace(pages) {
    return new Promise((resolve) => {
      const S = sheet(esc('All six places are full'), '', { cls: 'pb-replace', closeLabel: 'Cancel' });
      S.leaf.innerHTML = '<p>To keep this page, choose a kept page to replace. Nothing is removed unless you choose it here.</p><ul class="entries pb-pages">' +
        pages.map((p, i) => '<li class="entry"><span class="mark">' + I(p.kind === 'proof' ? 'scroll' : 'practice') + '</span><div><div class="t">' + esc(p.label || '(no label)') + '</div>' +
          '<div class="small muted">' + esc(p.kind === 'proof' ? 'Proofreader\'s page (typeset)' : (p.mode === 'typeset' ? 'Writing desk (typeset)' : 'Writing desk' + (p.mode ? ' (' + p.mode + ')' : ''))) + '</div>' +
          (p.typeset && p.typeset.lines ? '<div class="pb-prev">' + p.typeset.lines.slice(0, 2).map((l) => J(l)).join('<br>') + '</div>' : '') +
          '<div class="row-acts"><button class="pbtn danger" data-pb-rep="' + i + '">' + I('trash') + '<span>Replace this page</span></button></div></div></li>').join('') + '</ul>';
      S.foot.innerHTML = '<span class="spacer"></span><button class="cbtn go" data-pb-cancel>' + I('back') + '<span>Cancel — keep them all</span></button>';
      const done = (v) => { pop(S.lay); resolve(v); };
      S.el.addEventListener('click', (e) => {
        const r = e.target.closest('[data-pb-rep]');
        if (r) { done(+r.getAttribute('data-pb-rep')); return; }
        if (e.target.closest('[data-pb-cancel], [data-pb-x]')) done(-1);
      });
      S.lay.onCancel = () => done(-1);
      push(S.lay);
    });
  }
  async function keepFlow(s, page) {
    const label = await askLabel(page.label);
    if (label == null) return { ok: false, why: 'cancelled' };
    page.label = RB.practiceB.cleanLabel(label) || page.label;
    page.updated = Date.now();
    let r;
    try { r = await RB.practiceB.keepPage(s, page, askReplace); } catch (e) { console.error('keep page', e); r = { ok: false, why: 'error' }; }
    return r || { ok: false, why: 'error' };
  }

  // ---- a quotation card (comparisons; also the letters folder) ---------------------------------------
  function speakerOf(src) {
    if (src.teach) return { en: 'Teaching example', jp: '', teach: true };
    if (src.who === 'narr') return { en: 'Narration', jp: '' };
    if (src.who === 'pc') { const s = RB.game.s; return { en: 'You' + (s ? ' (' + s.player.name + ')' : ''), jp: '' }; }
    const c = RB.content.chars[src.who];
    return c ? { en: c.name.en, jp: c.name.jp } : { en: src.who, jp: '' };
  }

  return { esc, I, J, MX, kana, reading, own, sheet, fb, push, pop, closeAll, showEnDefault, prof, face, drawFaces, who, toneWord, limitHtml, writeStep, chooseStep, assess, keepFlow, askReplace, askLabel, speakerOf };
})();

RB.ui.letters = (function () {
  'use strict';
  const U = RB.ui.pb;
  const { esc, I, J, MX } = U;
  const L = () => RB.letters;

  // ---- the tray of letters ----------------------------------------------------------------------
  function tray(session) {
    return new Promise((resolve) => {
      const s = RB.game.s;
      const S = U.sheet(J(PBT.lettersBox.jp) + ' ' + esc(PBT.lettersBox.en), '', { cls: 'pb-tray', closeLabel: 'Leave the post box' });
      function render() {
        const list = L().list(s), r = L().rec(s);
        const open = r.active ? L().byId(r.active.id) : null;
        const n = L().answered(s);
        S.fr.setTitle(J(PBT.lettersBox.jp) + ' ' + esc(PBT.lettersBox.en), n + ' of ' + list.length + ' answered');
        let h = '<p class="muted small act-lead">Short practice letters from people you have met. Answer one at a time; the others wait at the post box for as long as you like — nothing expires.</p>';
        if (open) h += '<p class="note-slip pb-open" role="note">' + I('letter') + ' <b>Open:</b> ' + esc(open.title.en) + ' — finish it, or put it back on the pile, before opening another.</p>';
        h += '<ul class="entries pb-cards">' + list.map((x) => {
          const d = x.def, nm = U.who(d.from);
          const blocked = open && x.state !== 'open';
          const st = x.state === 'open' ? 'Open — continue' : x.state === 'answered' ? 'Answered · practise again (not sent)' : !x.met ? 'From someone you haven\'t met on this journey' : 'Waiting';
          return '<li><button class="entry pb-card" data-pb-letter="' + esc(d.id) + '"' + (blocked || !x.met ? ' disabled aria-disabled="true"' : '') + ' data-state="' + x.state + '">' +
            '<span class="mark">' + I(x.state === 'answered' ? 'done' : 'letter') + '</span><span class="body">' +
            '<span class="t">' + J(d.title.jp) + ' <span class="en">' + esc(d.title.en) + '</span></span>' +
            '<span class="d">' + esc(nm.en) + ' ' + J(nm.jp) + ' · ' + esc(d.gist) + '</span>' +
            '<span class="kind">' + esc(st) + '</span></span></button></li>';
        }).join('') + '</ul>';
        S.leaf.innerHTML = h;
        S.foot.innerHTML = '<span class="spacer"></span><button class="cbtn" data-pb-folder>' + I('book') + '<span>Letters folder (in Words)</span></button>';
      }
      const done = (v) => { U.pop(S.lay); resolve(v); };
      S.el.addEventListener('click', (e) => {
        if (e.target.closest('[data-pb-x]')) { done({ leave: true }); return; }
        if (e.target.closest('[data-pb-folder]')) { done({ leave: true, folder: true }); return; }
        const b = e.target.closest('[data-pb-letter]');
        if (b && !b.disabled) done({ open: b.getAttribute('data-pb-letter') });
      });
      S.lay.onCancel = () => done({ leave: true });
      render();
      U.push(S.lay);
    });
  }

  // ---- one letter -----------------------------------------------------------------------------------
  function letterSheet(session, d, t, replay) {
    return new Promise((resolve) => {
      const s = RB.game.s;
      const nm = U.who(d.from);
      const families = t.replies;
      const pieces = RB.practiceB.pieces(families, t.extra);
      // a stable shuffle of the pieces (never the order of an accepted reply)
      const rng = RB.util.rng(RB.util.hashStr(d.id + t.lv + 'pieces'));
      const pool = rng.shuffle(pieces.map((p, i) => ({ p, i })));
      const placed = [];
      let showEn = U.showEnDefault(), assisted = false, exposed = false, mistakes = 0, limits = 0, revealed = false, locked = false;
      const S = U.sheet(J(d.title.jp) + ' ' + esc(d.title.en), 'From ' + esc(nm.en), { cls: 'pb-letter', closeLabel: 'Stop for now' });
      const modes = t.modes || (t.lv === 'F' ? ['choose', 'parts'] : ['parts', 'write']);
      function scope() {
        return '<section class="pb-scope slip" aria-label="How you can reply"><div class="slip-lab">How you can reply</div>' +
          '<p>' + (modes.includes('parts') ? 'Build a reply from the pieces' : '') + (modes.includes('choose') ? (modes.includes('parts') ? ', or ' : '') + 'choose one of the replies' : '') + (modes.includes('write') ? ', or write or type a short reply in Japanese (kana or kanji)' : '') + '.</p>' +
          '<p class="muted small">This letter can read ' + families.length + ' replies — the ways its pieces go together — and different tones count the same. Anything else is outside what it can check and is never marked wrong.</p></section>';
      }
      function render() {
        const ok = families.some((f) => f.ok);
        let h = '';
        if (replay) {
          const rr = L().rec(s).done[d.id];
          h += '<p class="note-slip pb-replay" role="note">' + I('copy') + ' <b>Practice copy — not sent.</b> ' + esc(nm.en) + ' already has your reply' + (rr && rr.reply ? ': <span class="jp" lang="ja">' + U.own(rr.reply) + '</span>' : '') + '. This one is just for practice.</p>';
        }
        h += '<section class="act-say pb-from">' + U.face(d.from) + '<div class="act-line"><div class="act-who">' + esc(nm.en) + ' ' + J(nm.jp) + '</div>' +
          '<article class="letter" aria-label="The letter">' + I('letter') + '<div class="letter-jp">' + J(t.msg.jp) + '</div>' + (showEn ? '<div class="act-en">' + esc(RB.script.enVars(t.msg.en)) + '</div>' : '') + '</article>' +
          (showEn ? '' : '<div class="act-tr"><button class="pbtn quiet tr" data-pb-tr title="Show the English (counts as assisted)">' + I('note') + '<span>Translate <span class="aside">(assisted)</span></span></button></div>') + '</div></section>';
        h += '<section class="pb-task"><div class="slip-lab">Your reply should</div><p class="pb-task-en">' + MX(t.task.en) + '</p><p class="pb-task-jp">' + J(t.task.jp) + '</p></section>';
        h += scope();
        if (modes.includes('parts')) {
          h += '<section class="pb-build" aria-label="Build your reply"><h3>' + I('pieces') + '<span>Your reply</span></h3>' +
            '<ol class="pb-line" aria-label="Your reply so far">' + (placed.length ? placed.map((x, j) => '<li><button class="tile placed" data-pb-rm="' + j + '" aria-label="Take back: ' + esc(RB.ui.plainJp(x.p)) + '">' + J(x.p) + '</button></li>').join('') : '<li class="empty muted small">Nothing placed yet. Tap the pieces below in order; tap a placed piece to take it back.</li>') + '</ol>' +
            '<h3>' + I('tray') + '<span>The pieces</span></h3><div class="tiles pb-pieces">' +
            pool.map((x, j) => (placed.indexOf(x) >= 0 ? '' : '<button class="tile" data-pb-add="' + j + '">' + J(x.p) + '</button>')).join('') + '</div>' +
            '<div class="row-acts"><button class="pbtn" data-pb-clear' + (placed.length ? '' : ' disabled') + '>' + I('erase') + '<span>Clear</span></button>' +
            '<button class="pbtn primary" data-pb-send' + (placed.length && !locked ? '' : ' disabled') + '>' + I('seal') + '<span>Send this reply</span></button></div></section>';
        }
        h += '<div class="row-acts pb-other">' +
          (modes.includes('choose') ? '<button class="pbtn" data-pb-choose>' + I('list') + '<span>Choose a reply</span></button>' : '') +
          (modes.includes('write') ? '<button class="pbtn" data-pb-write>' + I('keyboard') + '<span>Write or type a reply</span></button>' : '') +
          (revealed ? '' : '<button class="pbtn quiet" data-pb-reveal>' + I('eye') + '<span>Show the replies it can read <span class="aside">(shows the answers)</span></span></button>') + '</div>';
        if (revealed) h += '<section class="pb-known"><h3>' + I('eye') + '<span>Replies this letter can read</span></h3><ul class="pb-shapes">' + families.map((f) => '<li class="' + (f.ok ? 'ok' : 'no') + '">' + I(f.ok ? 'right' : 'wrong') + ' <span class="jp">' + J(RB.practiceB.replyOf(f)) + '</span> <span class="muted small">' + esc(f.en) + (f.ok ? ' — completes it' + (U.toneWord(f.tone) ? ' (' + esc(U.toneWord(f.tone)) + ')' : '') : ' — says something else') + '</span></li>').join('') + '</ul><p class="muted small">You have seen the answers now, so this letter counts as practice, not as recall.</p></section>';
        h += '<div class="fbwrap" aria-live="polite"></div>';
        S.leaf.innerHTML = h;
        U.drawFaces(S.leaf);
        S.foot.innerHTML = '<button class="cbtn" data-pb-aside>' + I('back') + '<span>Put it back on the pile</span></button><span class="spacer"></span>';
        void ok;
      }
      function finish(v) { U.pop(S.lay); resolve(v); }
      function plainOf(f) { return RB.ui.plainJp(RB.practiceB.replyOf(f)); }
      function succeed(f, via, given, markup) {
        locked = true;
        RB.audio && RB.audio.sfx('answer_right');
        finish({ done: true, family: f, via, reply: given || plainOf(f), markup: markup || (given ? null : RB.practiceB.replyOf(f)), firstTry: mistakes === 0, assisted, exposed, limits });
      }
      function wrong(f) {
        mistakes++;
        RB.audio && RB.audio.sfx('answer_wrong');
        U.fb(S.leaf.querySelector('.fbwrap'), 'no', 'That reply says something else', '<p><span class="jp">' + J(RB.practiceB.replyOf(f)) + '</span> — ' + esc(f.en) + '</p><div class="fb-why">' + MX(f.why ? f.why.en : '') + '</div><p class="muted small">Take back a piece or two and try again — nothing is timed.</p>');
      }
      async function viaStep(kind) {
        const header = '<div class="pb-hdr"><div class="kind">' + esc(nm.en) + '\'s letter</div>' + J(t.msg.jp) + (showEn ? '<div class="act-en">' + esc(RB.script.enVars(t.msg.en)) + '</div>' : '') + '<div class="pb-hdr-task">' + MX(t.task.en) + '</div></div>';
        const step = kind === 'choose'
          ? U.chooseStep(families.map((f) => ({ jp: RB.practiceB.replyOf(f), en: f.en, ok: f.ok, why: f.why })), { title: d.title.en, titleJp: d.title.jp, prompt: { en: 'Choose a reply that does what the letter needs.' }, showEn: U.showEnDefault() })
          : U.writeStep(families, { title: d.title.en, titleJp: d.title.jp, prompt: PBT.writeReply, what: 'letter' });
        S.lay.el.classList.add('pb-hidden');
        let r;
        try { r = await RB.challenge.runStep(step, { header, noRecord: true, ctxTag: 'letters', cancelLabel: 'Back to the letter' }); }
        finally { S.lay.el.classList.remove('pb-hidden'); }
        if (!session.alive()) return;
        if (r.cancelled) { if (r.mistakes) mistakes += r.mistakes; return; }
        mistakes += r.mistakes || 0;
        if (r.assisted) assisted = true;
        let f = null, given = null;
        if (r.given && r.given.option) f = r.given.option._src ? families.find((x) => RB.practiceB.replyOf(x) === r.given.option._src.jp) : null;
        if (r.given && r.given.family != null) { f = families[r.given.family]; given = r.given.text; }
        if (!f) { f = families.find((x) => x.ok); exposed = true; } // the runner showed the answer and they continued
        succeed(f, r.mode === 'hand' ? 'hand' : r.mode === 'ime' ? 'ime' : 'choice', given);
      }
      S.el.addEventListener('click', async (e) => {
        const tg = e.target;
        if (tg.closest('[data-pb-x]')) { finish({ stop: true }); return; }
        if (tg.closest('[data-pb-aside]')) { finish({ aside: true }); return; }
        if (tg.closest('[data-pb-tr]')) { showEn = true; assisted = true; render(); return; }
        if (tg.closest('[data-pb-reveal]')) { revealed = true; exposed = true; assisted = true; render(); return; }
        const add = tg.closest('[data-pb-add]'), rm = tg.closest('[data-pb-rm]');
        if (add && !locked) { placed.push(pool[+add.getAttribute('data-pb-add')]); RB.audio && RB.audio.sfx('cursor'); render(); const nx = S.leaf.querySelector('[data-pb-add]'); (nx || S.leaf.querySelector('[data-pb-send]')).focus({ preventScroll: true }); return; }
        if (rm && !locked) { placed.splice(+rm.getAttribute('data-pb-rm'), 1); render(); return; }
        if (tg.closest('[data-pb-clear]')) { placed.length = 0; render(); return; }
        if (tg.closest('[data-pb-send]') && placed.length && !locked) {
          const m = RB.practiceB.partsMatch(families, placed.map((x) => x.p));
          if (!m) { limits++; U.fb(S.leaf.querySelector('.fbwrap'), 'unsure', 'Outside what this letter can read', U.limitHtml(families, 'letter')); return; }
          if (!m.family.ok) { wrong(m.family); return; }
          succeed(m.family, 'parts', RB.ui.plainJp(placed.map((x) => x.p).join(' ')), placed.map((x) => x.p).join(' '));
          return;
        }
        if (tg.closest('[data-pb-choose]')) { await viaStep('choose'); return; }
        if (tg.closest('[data-pb-write]')) { await viaStep('write'); return; }
      });
      S.lay.onCancel = () => finish({ stop: true });
      render();
      U.push(S.lay);
    });
  }

  // ---- the closing: the villager's short, truthful acknowledgement ---------------------------------
  function closing(d, t, out, sent, recorded) {
    return new Promise((resolve) => {
      const nm = U.who(d.from);
      const S = U.sheet(J(d.title.jp) + ' ' + esc(d.title.en), sent ? 'Answered' : 'Practice copy', { cls: 'pb-close', close: false });
      const f = out.family;
      const tone = U.toneWord(f.tone);
      let h = '<section class="pb-sent"><div class="slip-lab">' + (sent ? 'Your reply' : 'Your practice reply (not sent)') + '</div><p class="jp big" lang="ja">' + (out.markup ? J(out.markup) : U.own(out.reply)) + '</p>' +
        '<p class="muted small">' + esc(f.en) + (tone ? ' — a ' + esc(tone) + ' reply. Any of this letter\'s accepted tones closes it in exactly the same way.' : '') + '</p></section>';
      if (sent) {
        h += '<section class="act-say pb-ack">' + U.face(d.from) + '<div class="act-line"><div class="act-who">' + esc(nm.en) + ' ' + J(nm.jp) + '</div><div class="act-jp">' + J(t.ack.jp) + '</div><div class="act-en">' + esc(RB.script.enVars(t.ack.en)) + '</div></div></section>';
      } else {
        h += '<p class="note-slip" role="note">' + I('copy') + ' Nothing is sent: ' + esc(nm.en) + ' answered your first reply already, and gets no second copy.</p>';
      }
      h += '<section class="fb-ex pb-explain"><h3>' + I('bulb') + '<span>Why it works</span></h3><p>' + MX(t.explain.en) + '</p></section>';
      h += '<p class="muted small">' + (recorded ? 'Recorded once in your learning progress.' : out.exposed ? 'You saw the answers, so this is kept as practice, not as recall.' : sent ? 'Kept as practice.' : 'A practice copy: kept as practice, not counted again.') + ' Letters give no rewards; the twelve answered letters are kept in Words › Letters folder.</p>';
      S.leaf.innerHTML = h;
      U.drawFaces(S.leaf);
      S.foot.innerHTML = '<span class="spacer"></span><button class="cbtn go" data-pb-ok data-ok>' + I('next') + '<span>Back to the post box</span></button>';
      const done = () => { U.pop(S.lay); resolve(); };
      S.foot.querySelector('[data-pb-ok]').onclick = done;
      S.lay.onCancel = done;
      U.push(S.lay);
      setTimeout(() => { const b = S.foot.querySelector('[data-pb-ok]'); if (b) b.focus({ preventScroll: true }); }, 30);
    });
  }

  // ---- the activity ------------------------------------------------------------------------------------
  async function run(session) {
    session.set('active');
    const s = RB.game.s;
    let answered = 0;
    for (;;) {
      if (!session.alive()) return { abandoned: true };
      const r0 = L().rec(s);
      let pick = await tray(session);
      if (!session.alive()) return { abandoned: true };
      if (pick.leave) { if (pick.folder) setTimeout(() => { if (RB.game.mode() === 'world') RB.ui.menu.open('letters'); }, 260); return { answered }; }
      const op = L().open(s, pick.open);
      if (!op.ok) { RB.ui.notice(op.why === 'other-open' ? 'Finish the open letter, or put it back, first.' : 'Not this letter yet.', 'info'); continue; }
      const d = L().byId(pick.open), t = L().tier(d, U.prof());
      session.set('active');
      const out = await letterSheet(session, d, t, op.replay);
      if (!session.alive()) return { abandoned: true };
      if (out.aside) { L().setAside(s); continue; }
      if (out.stop) continue; // the letter stays open; the others keep waiting
      session.set('resolving');
      const recorded = U.assess(session, r0, 'letter:' + d.id, t.item, { firstTry: out.firstTry, mode: out.via === 'hand' ? 'hand' : out.via === 'ime' ? 'ime' : 'choice', assisted: out.assisted }, { exposed: out.exposed || op.replay });
      RB.practiceB.note(r0, 'letter:' + d.id, !out.firstTry);
      const c = L().complete(s, d.id, { tone: out.family.tone, via: out.via, reply: out.reply, prof: t.lv });
      if (c.sent) answered++;
      RB.bus.emit('practice:letter', { id: d.id, sent: c.sent, tone: out.family.tone });
      session.set('result');
      await closing(d, t, out, c.sent, recorded);
      if (!session.alive()) return { abandoned: true };
    }
  }
  if (RB.activity) RB.activity.register('letters', {
    title: PBT.letters,
    eligible: (s) => RB.letters.eligible(s),
    run,
    dispose: () => U.closeAll(),
  });

  // ---- Words › Letters folder (the twelve, for reference; completion is informational) --------------
  function folderHtml(s) {
    const list = L().list(s);
    const n = L().answered(s);
    let h = '<p class="muted small">The practice letters from the post box in Shino\'s Post House and how you answered them. This folder is for reference: answering letters unlocks nothing and gives no reward.</p>';
    if (!L().available(s)) h += '<p class="note-slip" role="note">' + I('letter') + ' The practice letters wait for the journey\'s end.</p>';
    h += '<p class="small">' + n + ' of ' + list.length + ' answered.</p><ol class="entries pb-folder">' + list.map((x) => {
      const d = x.def, nm = U.who(d.from), rr = x.rec, t = L().tier(d, (rr && rr.prof) || U.prof());
      if (!rr) return '<li class="entry"><span class="mark">' + I('letter') + '</span><div><div class="t">' + J(d.title.jp) + ' <span class="en">' + esc(d.title.en) + '</span></div><div class="small muted">' + esc(nm.en) + ' · ' + esc(x.state === 'open' ? 'open at the post box' : 'waiting at the post box') + '</div></div></li>';
      return '<li class="entry filed"><span class="mark">' + I('done') + '</span><div><div class="t">' + J(d.title.jp) + ' <span class="en">' + esc(d.title.en) + '</span></div>' +
        '<div class="small muted">' + esc(nm.en) + ' ' + J(nm.jp) + (rr.replays ? ' · practised again ' + rr.replays + '×' : '') + '</div>' +
        '<div class="pb-f-msg">' + J(t.msg.jp) + '<div class="act-en">' + esc(RB.script.enVars(t.msg.en)) + '</div></div>' +
        '<div class="pb-f-reply"><span class="kind">Your reply</span> <span class="jp" lang="ja">' + U.own(rr.reply || '') + '</span>' + (rr.tone ? ' <span class="muted small">(' + esc(U.toneWord(rr.tone)) + ')</span>' : '') + '</div>' +
        '<div class="pb-f-ack"><span class="kind">' + esc(nm.en) + '</span> ' + J(t.ack.jp) + '<div class="act-en">' + esc(RB.script.enVars(t.ack.en)) + '</div></div>' +
        '<details class="pb-f-known"><summary>Replies this letter could read</summary><ul class="pb-shapes">' + t.replies.filter((f) => f.ok).map((f) => '<li>' + J(RB.practiceB.replyOf(f)) + ' <span class="muted small">' + esc(f.en) + '</span></li>').join('') + '</ul></details>' +
        '</div></li>';
    }).join('') + '</ol>';
    return h;
  }
  if (RB.ui.menu && RB.ui.menu.addPage) {
    RB.ui.menu.addPage('words', {
      id: 'letters', en: PBT.folder.en, jp: PBT.folder.jp,
      count: (s) => L().answered(s),
      available: (s) => L().available(s) || L().answered(s) > 0,
      html: folderHtml,
    });
  }
  // ---- Words › Ways to practise ------------------------------------------------------------------------
  const PL = () => RB.practiceB.PLACE;
  if (RB.practice && RB.practice.addActivity) {
    RB.practice.addActivity({
      id: 'letters', en: PBT.letters.en, jp: PBT.letters.jp, icon: 'letter', order: 60,
      where: { en: PL().name.en, jp: PL().name.jp },
      available: (s) => L().available(s),
      here: (s) => RB.practiceB.atPlace(s),
      note: (s) => (!L().available(s) ? 'After the journey\'s end: twelve short letters to answer at the post box.' : L().answered(s) + ' of 12 answered. Offered at the post box.'),
      begin: (ctx) => RB.activity.launch('letters', ctx),
    });
  }

  // the post box's scene asks for an activity (!hook pb_open letters|proofreading)
  RB.hooks = RB.hooks || {};
  RB.hooks.pb_open = async (a) => { RB.practiceB.launchAfterScene(a[0], { source: 'world-prop' }); };

  return { run, tray, letterSheet, folderHtml };
})();
