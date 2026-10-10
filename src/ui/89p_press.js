/* The press on screen (expansion P09; plan C15, W10; the rules in src/engine/72p_press.js). One activity, 'press':
 *   1. What to print: a story or a notice; the last version and who is reading it.
 *   2. Compose: one block per line, chosen from what the journey has unlocked (absurd and funny combinations are
 *      welcome; nothing is graded).
 *   3. The page: a proof of the printed sheet. "Set the type yourself" (optional practice) puts each line together
 *      from its pieces through the ordinary language runner; its feedback is about the language and changes nothing
 *      that is printed.
 *   4. Print: ink the block, press, peel (three plain buttons; with reduced motion nothing moves).
 *   5. Circulate: post it at the press, leave it at an inn, or give it out at a stall (a favour, never a sale).
 *   6. Who is reading it: readers around the world will say what they think when you meet them.
 * Started by `!hook press_open [story|notice]` from a scene (after it ends), or from the press room. In the test
 * driver's automated runs a composition of the first offered blocks is printed and posted (no screen). */
var RB = (globalThis.RB = globalThis.RB || {});
RB.ui = RB.ui || {};

RB.ui.press = (function () {
  'use strict';
  const esc = (s) => RB.util.esc(String(s == null ? '' : s));
  const J = (t) => RB.ui.jhtml(t || '');
  const I = (n) => (RB.ui.folio ? RB.ui.folio.icon(n) : '');
  const P = () => RB.press;
  const S = () => RB.game.s;
  const still = () => !!(RB.game && RB.game.reducedMotion && RB.game.reducedMotion());
  const T = () => (RB.content.press && RB.content.press.text) || {};
  let open = null;

  function sheet() {
    const t = T().title || { jp: '{刷|す}り{場|ば}', en: 'The press' };
    const fr = RB.learnUi.sheet({ cls: 'activity pr-sheet', title: J(t.jp) + ' ' + esc(t.en) });
    const lay = { el: fr.scrim, name: 'press' };
    RB.learnUi.guardTaps(fr.leaf);
    let onCancel = null;
    lay.onCancel = () => { if (onCancel) onCancel(); };
    RB.ui.pushLayer(lay);
    const api = {
      fr, lay, leaf: fr.leaf, foot: fr.foot,
      cancel(fn) { onCancel = fn; },
      close() { if (lay.el.isConnected) RB.ui.popLayer(lay); open = null; },
      focus(sel) { setTimeout(() => { const b = fr.el.querySelector(sel); if (b && lay.el.isConnected) b.focus({ preventScroll: true }); }, 0); },
    };
    open = api;
    return api;
  }
  // wait for one button in the sheet (data-a), or the sheet's own close
  function choice(ui) {
    return new Promise((resolve) => {
      const done = (v) => { ui.leaf.removeEventListener('click', on); ui.foot.removeEventListener('click', on); ui.cancel(null); resolve(v); };
      const on = (e) => { const b = e.target.closest('[data-a]'); if (!b || b.disabled) return; done({ a: b.dataset.a, v: b.dataset.v || null }); };
      ui.leaf.addEventListener('click', on); ui.foot.addEventListener('click', on);
      ui.cancel(() => done({ a: 'close' }));
    });
  }
  const btn = (a, label, o) => '<button type="button" class="cbtn' + (o && o.go ? ' go' : '') + '" data-a="' + a + '"' + (o && o.v != null ? ' data-v="' + esc(o.v) + '"' : '') + (o && o.disabled ? ' disabled' : '') + '>' + (o && o.icon ? I(o.icon) : '') + '<span>' + esc(label) + '</span></button>';
  const line = (b, en) => '<span class="pr-jp" lang="ja">' + J(b.jp) + '</span>' + (en ? '<span class="pr-en">' + esc(b.en) + '</span>' : '');
  function readerName(r) { const c = RB.content.chars[r.who || r.id]; return c && c.name ? c.name.en : r.id; }

  // 1. what to print
  async function start(ui, s, want) {
    const rec = P().of(s);
    const reading = P().waitingAll(s);
    const kinds = RB.content.press.kinds;
    let h = '<p class="pr-intro">' + esc((T().intro || {}).en || 'Compose a page from the blocks in the racks, print it, and pass it round. Readers will tell you what they make of it.') + '</p>';
    if (rec && rec.version) {
      const comp = { kind: rec.kind, blocks: rec.blocks };
      h += '<section class="pr-last"><h3>Your last page (' + esc(kinds[rec.kind].name.en.toLowerCase()) + ', version ' + rec.version + ')</h3><ol class="pr-page small">' + P().lines(comp).map((b) => '<li>' + line(b) + '</li>').join('') + '</ol>' +
        (reading.length ? '<p class="muted small">Still to tell you what they thought: ' + esc(reading.map(readerName).join(', ')) + '.</p>' : '<p class="muted small">Everyone who read it has told you what they thought.</p>') + '</section>';
    }
    ui.leaf.innerHTML = h;
    ui.foot.innerHTML = Object.keys(kinds).map((k) => btn('kind', 'Compose a ' + kinds[k].name.en.toLowerCase(), { v: k, go: want === k, icon: 'note' })).join('') +
      (rec && rec.version ? btn('revise', 'Revise the last page', { icon: 'history' }) : '') + '<span class="spacer"></span>' + btn('close', 'Leave the press', { icon: 'back' });
    ui.focus(want ? '[data-a=kind][data-v="' + want + '"]' : '[data-a=kind]');
    return choice(ui);
  }

  // 2. compose: one block per slot
  async function compose(ui, s, comp) {
    const k = P().kind(comp.kind);
    let showEn = true, openSlot = null;
    for (;;) {
      let h = '<p class="pr-intro">' + esc(k.help ? k.help.en : 'Choose a block for each line.') + '</p><ol class="pr-slots">';
      for (const slot of k.slots) {
        const cur = comp.blocks[slot] ? P().block(comp.blocks[slot]) : null;
        const label = (k.labels && k.labels[slot]) || { en: slot };
        h += '<li class="pr-slot' + (openSlot === slot ? ' open' : '') + '"><div class="pr-slothead"><span class="pr-label">' + esc(label.en) + '</span>' +
          (cur ? '<span class="pr-cur">' + line(cur, showEn) + '</span>' : '<span class="pr-cur muted">Not chosen yet</span>') +
          btn('slot', openSlot === slot ? 'Close' : cur ? 'Change' : 'Choose', { v: slot }) + '</div>';
        if (openSlot === slot) {
          h += '<ul class="pr-opts" role="list">' + P().offered(s, slot).map((b) => '<li><button type="button" class="pr-opt' + (comp.blocks[slot] === b.id ? ' on' : '') + '" data-a="pick" data-v="' + esc(b.id) + '" aria-pressed="' + (comp.blocks[slot] === b.id) + '">' + line(b, true) + '</button></li>').join('') + '</ul>';
        }
        h += '</li>';
      }
      h += '</ol>';
      ui.leaf.innerHTML = h;
      const ready = P().complete(s, comp);
      ui.foot.innerHTML = btn('back', 'Back', { icon: 'back' }) + btn('en', showEn ? 'Hide the English' : 'Show the English') + '<span class="spacer"></span>' + btn('proof', 'See the page', { go: true, disabled: !ready, icon: 'next' });
      if (openSlot) ui.focus('.pr-opt'); else ui.focus(ready ? '[data-a=proof]' : '[data-a=slot]');
      const r = await choice(ui);
      if (r.a === 'close' || r.a === 'back') return r.a;
      if (r.a === 'en') showEn = !showEn;
      if (r.a === 'slot') openSlot = openSlot === r.v ? null : r.v;
      if (r.a === 'pick') { const b = P().block(r.v); if (b) comp.blocks[b.slot] = b.id; const i = k.slots.indexOf(b.slot); openSlot = k.slots.slice(i + 1).find((x) => !comp.blocks[x]) || null; }
      if (r.a === 'proof' && ready) return 'proof';
    }
  }

  // 3. the proof, and setting the type by hand (optional practice)
  async function proof(ui, s, comp) {
    const k = P().kind(comp.kind);
    for (;;) {
      ui.leaf.innerHTML = '<p class="pr-intro">The proof of your ' + esc(k.name.en.toLowerCase()) + '. Any combination may be printed.</p>' + page(comp, true);
      ui.foot.innerHTML = btn('back', 'Change a line', { icon: 'back' }) + btn('set', 'Set the type yourself', { icon: 'scroll' }) + '<span class="spacer"></span>' + btn('print', 'Print it', { go: true, icon: 'next' });
      ui.focus('[data-a=print]');
      const r = await choice(ui);
      if (r.a !== 'set') return r.a;
      // each line from its pieces: the language runner's own feedback; the printed line is the block's
      for (const b of P().lines(comp)) {
        if (!b.pieces || b.pieces.length < 2) continue;
        const step = { kind: 'order', item: b.item || 'c:press_set', prompt: { en: 'Set this line in the frame: "' + b.en + '"' }, tiles: b.pieces.slice(), answer: b.pieces.slice(), title: 'Setting the type' };
        const res = await RB.challenge.runStep(step, { ctxTag: 'press', cancelLabel: 'Stop setting' });
        if (res && res.cancelled) break;
      }
    }
  }
  function page(comp, en) {
    const k = P().kind(comp.kind);
    return '<figure class="pr-paper pr-' + esc(comp.kind) + '"><figcaption class="pr-head" lang="ja">' + J(k.name.jp) + '</figcaption><ol class="pr-page">' +
      P().lines(comp).map((b) => '<li>' + line(b, en) + '</li>').join('') + '</ol></figure>';
  }

  // 4. print: ink, press, peel
  async function print(ui, comp) {
    const steps = [['ink', 'Ink the blocks', 'The type is inked.'], ['press', 'Press the sheet', 'The press comes down.'], ['peel', 'Peel the sheet', 'The sheet comes away, printed.']];
    for (let i = 0; i < steps.length; i++) {
      ui.leaf.innerHTML = '<div class="pr-pressbed st' + i + (still() ? ' still' : '') + '" aria-hidden="true"><div class="pr-frame"></div><div class="pr-platen"></div><div class="pr-sheetart"></div></div>' +
        '<p class="pr-status" role="status">' + esc(i ? steps[i - 1][2] : 'The type is set in the frame.') + '</p>';
      ui.foot.innerHTML = btn('back', 'Not yet', { icon: 'back' }) + '<span class="spacer"></span>' + btn(steps[i][0], steps[i][1], { go: true });
      ui.focus('[data-a=' + steps[i][0] + ']');
      const r = await choice(ui);
      if (r.a !== steps[i][0]) return r.a;
    }
    ui.leaf.innerHTML = page(comp, false) + '<p class="pr-status" role="status">Printed.</p>';
    return 'printed';
  }

  // 5. where it goes
  async function where(ui) {
    const W = (T().where || {});
    ui.leaf.innerHTML = '<p class="pr-intro">Where should it go? Nothing is sold: people pass a good page on.</p>';
    ui.foot.innerHTML = ['board', 'inn', 'stall'].map((w) => btn('where', (W[w] || { en: w }).en, { v: w, go: w === 'board' })).join('') + '<span class="spacer"></span>' + btn('back', 'Keep it for now', { icon: 'back' });
    ui.focus('[data-a=where]');
    const r = await choice(ui);
    return r.a === 'where' ? r.v : null;
  }

  // 6. who has it
  async function after(ui, s, rec) {
    const readers = P().waitingAll(s);
    ui.leaf.innerHTML = '<p class="pr-intro">It is out in the world. ' + (readers.length ? readers.length + ' people have it in their hands; when you meet them, they will tell you what they thought of it.' : 'Nobody you know has read it yet.') + '</p>' +
      '<ul class="pr-readers">' + readers.map((r) => '<li>' + esc(readerName(r)) + (r.where ? '<span class="muted small"> · ' + esc(r.where.en) + '</span>' : '') + '</li>').join('') + '</ul>' +
      '<p class="muted small">What they say is about the story itself. If you want notes on the language, set the type yourself next time.</p>';
    ui.foot.innerHTML = btn('again', 'Print another', { icon: 'note' }) + '<span class="spacer"></span>' + btn('close', 'Leave the press', { go: true, icon: 'done' });
    ui.focus('[data-a=close]');
    void rec;
    return choice(ui);
  }

  async function run(session) {
    const s = S();
    const want = (session && session.ctx && session.ctx.kind) || null;
    const ui = sheet();
    let printed = 0;
    try {
      while (session.alive()) {
        session.set('preparing');
        const st = await start(ui, s, want);
        if (st.a === 'close' || !session.alive()) break;
        const rec = P().of(s);
        const comp = st.a === 'revise' && rec ? { kind: rec.kind, blocks: Object.assign({}, rec.blocks) } : { kind: st.v || want || 'story', blocks: {} };
        session.set('active');
        let stage = 'compose';
        for (;;) {
          if (stage === 'compose') { const r = await compose(ui, s, comp); if (r === 'close') return { printed }; if (r === 'back') break; stage = 'proof'; }
          if (stage === 'proof') { const r = await proof(ui, s, comp); if (r === 'close') return { printed }; if (r === 'back') { stage = 'compose'; continue; } stage = 'print'; }
          if (stage === 'print') { const r = await print(ui, comp); if (r === 'close') return { printed }; if (r !== 'printed') { stage = 'proof'; continue; } stage = 'where'; }
          if (stage === 'where') {
            const w = await where(ui);
            if (!w) { stage = 'proof'; continue; }
            session.set('resolving');
            const out = P().circulate(s, comp, w);
            printed++;
            if (RB.save && RB.save.autosave && RB.save.current && RB.save.current().slot != null) RB.save.autosave('progress');
            session.set('result');
            const r = await after(ui, s, out);
            if (r.a === 'again') break;
            return { printed };
          }
        }
      }
    } finally {
      ui.close();
    }
    return { printed };
  }
  function dispose() { if (open) open.close(); }

  // ---- registration ------------------------------------------------------------------------------------------------
  function eligible(s) {
    if (!(RB.edition && RB.edition.of(s) >= 2) || !s.flags.mp_press_open) return { ok: false, why: 'The press in Blockprint Row is not running yet.' };
    const w = RB.practiceA ? RB.practiceA.worldSafe() : { ok: true };
    return w.ok ? { ok: true } : { ok: false, why: RB.practiceA.whyText(w.why) };
  }
  RB.activity.register('press', { title: { en: 'The press', jp: '{刷|す}り{場|ば}' }, eligible, run, dispose });
  // the automated runs: the first offered block of every slot, posted at the press
  function autoPrint(s, kindId) {
    const k = P().kind(kindId);
    if (!k) return null;
    const comp = { kind: kindId, blocks: {} };
    for (const slot of k.slots) { const b = P().offered(s, slot)[0]; if (b) comp.blocks[slot] = b.id; }
    return P().circulate(s, comp, 'board');
  }
  RB.hooks = RB.hooks || {};
  RB.hooks.press_open = async (a) => {
    const s = S();
    if (RB.test && RB.test.auto) { const rec = autoPrint(s, (a && a[0]) || 'notice'); RB.test.log.push({ t: 'activity', kind: 'press', auto: rec ? rec.version : null }); return; }
    const go = () => (RB.practiceA ? RB.practiceA.launch('press', { source: 'world-prop', kind: (a && a[0]) || null }) : RB.activity.launch('press', { source: 'world-prop', kind: (a && a[0]) || null }));
    if (RB.practiceA) RB.practiceA.afterScene(go); else setTimeout(go, 0);
  };
  return { run, page, autoPrint, _open: () => open };
})();
