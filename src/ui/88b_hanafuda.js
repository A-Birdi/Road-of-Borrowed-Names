/* Hanafuda on screen: koi-koi (expansion P06, C12; the rules in src/engine/72d_hanafuda.js, the cards drawn in
 * src/ui/88c_hanafuda_cards.js). An activity (RB.activity 'hanafuda'): on a cloth with your companion anywhere safe,
 * from the Ledger's Distractions. Teaching first, as with shogi: a lesson on the months and their flowers, the sets
 * with their names and readings, and matching help that lights the cards of the same month (on by default, never
 * counted against you). Untimed. Points are points: never stakes, never a currency. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.ui.hanafuda = (function () {
  'use strict';
  const esc = RB.util.esc;
  const I = (n) => (RB.ui.folio ? RB.ui.folio.icon(n) : '');
  const J = (x) => (x && x.jp ? RB.ui.jhtml(x.jp) : '');
  const HF = () => RB.hanafuda, CARDS = () => RB.ui.hanafudaCards;
  const S = () => RB.game.s;
  const LEVEL = [[1, 'Gentle'], [2, 'Steady'], [3, 'Thoughtful']];
  const LENGTHS = [[1, 'One month'], [3, 'Three months'], [6, 'Half a year'], [12, 'A whole year']];
  let V = null;
  const partner = () => { const w = V && V.with; return w && RB.content.chars[w] ? RB.content.chars[w].name.en : 'your partner'; };
  const Partner = () => { const p = partner(); return p.charAt(0).toUpperCase() + p.slice(1); };

  RB.activity.register('hanafuda', {
    title: { en: 'Hanafuda', jp: '{花札|はなふだ}' },
    eligible: (s, ctx) => {
      if (!(ctx && ctx.with) && !s.comp) return { ok: false, why: 'There is nobody to play with here.' };
      return RB.activity.safe ? RB.activity.safe(ctx && ctx.with ? {} : { companion: true }) : { ok: true };
    },
    run: (session) => run(session),
    dispose: (session) => { if (V && V.session === session) close(); },
  });

  function run(session) {
    return new Promise((resolve) => {
      const s = S();
      const ctx = (session && session.ctx) || {};
      const who = ctx.with || s.comp || null;
      const fr = RB.ui.folio.frame({ cls: 'hf-folio', onClose: () => leave(), closeLabel: 'Leave', closeIcon: 'back' });
      fr.setTitle(RB.ui.label('{花札|はなふだ}', 'Hanafuda') + ' <span class="sg-with">' + esc('with ' + (who && RB.content.chars[who] ? RB.content.chars[who].name.en : 'a partner')) + '</span>', '');
      fr.box.innerHTML = '<div class="leaf hf-leaf" tabindex="-1"></div>' + CARDS().defs();
      V = { session, s, with: who, fr, leaf: fr.box.firstChild, view: 'menu', resolve, level: 2, months: 3, help: true, sel: null, seq: 0 };
      V.layer = { el: fr.scrim, name: 'hanafuda', noAutofocus: true, onCancel: () => leave() };
      V.leaf.addEventListener('click', onClick);
      V.leaf.addEventListener('change', onChange);
      RB.ui.pushLayer(V.layer);
      render();
    });
  }
  function close() { if (!V) return; clearTimeout(V.timer); RB.ui.popLayer(V.layer); const r = V.resolve; V = null; r({ ok: true }); }
  function leave() { if (!V) return; if (V.view === 'menu') close(); else { clearTimeout(V.timer); V.view = 'menu'; V.m = null; render(); } }
  const rec = () => RB.pastimes.rec(S(), 'hanafuda');

  // ---- a card on screen: the drawing, its name with reading beneath ------------------------------------------------
  function cardHtml(id, o) {
    o = o || {};
    const c = HF().card(id), M = HF().MONTHS[c.m];
    const label = c.name.en + ' (' + M.month.en + ', ' + HF().KINDS[c.kind].en.toLowerCase() + ')';
    const tag = o.button ? 'button type="button"' : 'div';
    const end = o.button ? 'button' : 'div';
    return '<' + tag + ' class="hf-card' + (o.cls ? ' ' + o.cls : '') + '"' + (o.attrs || '') + ' aria-label="' + esc(label) + '" data-m="' + c.m + '">' + CARDS().svg(id) +
      (o.caption === false ? '' : '<span class="hf-cap">' + RB.ui.jhtml(M.flower.jp) + '</span>') + '</' + end + '>';
  }
  const backHtml = (n) => '<div class="hf-backs" aria-label="' + n + ' cards">' + Array.from({ length: Math.min(n, 8) }, () => '<span class="hf-card back">' + CARDS().back() + '</span>').join('') + '</div>';
  // a player's catch, by kind, with the sets they have
  function caughtHtml(ids, who) {
    const by = { hikari: [], tane: [], tan: [], kasu: [] };
    for (const id of ids) by[HF().card(id).kind].push(id);
    const y = HF().yaku(ids);
    return '<div class="hf-caught"><span class="hf-who">' + esc(who) + '</span>' + ['hikari', 'tane', 'tan', 'kasu'].map((k) => '<span class="hf-pile" title="' + esc(HF().KINDS[k].en) + '"><span class="hf-kl">' + RB.ui.jhtml(HF().KINDS[k].jp) + ' <span class="en">' + by[k].length + '</span></span><span class="hf-mini">' + by[k].map((id) => cardHtml(id, { cls: 'mini', caption: false })).join('') + '</span></span>').join('') +
      (y.list.length ? '<span class="hf-sets">' + y.list.map((x) => '<span class="hf-set">' + RB.ui.jhtml(x.name.jp) + ' <span class="en">' + esc(x.name.en) + ' · ' + x.pts + '</span></span>').join('') + '</span>' : '') + '</div>';
  }

  // ---- the menu ----------------------------------------------------------------------------------------------------
  function menuHtml() {
    const r = rec();
    let h = '<p class="sg-intro">Koi-koi: match cards of the same month, collect sets, then stop and score, or call <i>koi-koi</i> and play on for more. Points are only points.</p>';
    h += '<div class="hf-menu"><section><h3>' + RB.ui.label('{遊|あそ}ぶ', 'Play') + '</h3>' +
      '<fieldset class="sg-level"><legend>How long</legend>' + LENGTHS.map(([n, l]) => '<label class="opt"><input type="radio" name="hf-len" value="' + n + '"' + (V.months === n ? ' checked' : '') + '><span>' + l + '</span></label>').join('') + '</fieldset>' +
      '<fieldset class="sg-level"><legend>How hard ' + esc(partner()) + ' plays</legend>' + LEVEL.map(([n, l]) => '<label class="opt"><input type="radio" name="hf-level" value="' + n + '"' + (V.level === n ? ' checked' : '') + '><span>' + l + '</span></label>').join('') + '</fieldset>' +
      '<div class="sg-acts"><button type="button" class="pbtn primary" data-a="start">' + I('next') + '<span>Deal</span></button></div>' +
      '<p class="muted small">' + esc(r.games ? 'Games: ' + r.games + (RB.game.settings.hideTotals ? '' : ', won ' + r.wins) + (r.best ? '. Best: ' + r.best + ' points.' : '.') : 'Not played yet.') + '</p></section>' +
      '<section><h3>' + RB.ui.label('{習|なら}う', 'Learn') + '</h3><div class="sg-acts"><button type="button" class="pbtn" data-a="months">' + (r.lessons.months ? '✓ ' : '') + 'The months and their flowers</button>' +
      '<button type="button" class="pbtn" data-a="sets">The sets (yaku)</button></div>' +
      (Object.keys(r.yaku || {}).length ? '<p class="muted small">Sets you have made: ' + Object.keys(r.yaku).map((id) => esc(HF().YAKU[id].name.en)).join(', ') + '.</p>' : '') + '</section></div>';
    return h;
  }
  function monthsHtml() {
    rec().lessons.months = rec().lessons.months || Date.now();
    let h = '<div class="sg-top"><span class="vb-jp">' + RB.ui.jhtml('{十二|じゅうに}か{月|げつ}') + '</span> <span class="en">The twelve months</span></div><p class="small">Every month has a flower and four cards. A card takes a card of its own month.</p><ol class="hf-months">';
    for (let m = 1; m <= 12; m++) {
      const M = HF().MONTHS[m], ids = HF().DECK.filter((c) => c.m === m).map((c) => c.id);
      h += '<li><div class="hf-mh"><span class="vb-jp">' + RB.ui.jhtml(M.month.jp) + '</span> <span class="en">' + esc(M.month.en) + '</span> · <span class="vb-jp">' + RB.ui.jhtml(M.flower.jp) + '</span> <span class="en">' + esc(M.flower.en) + '</span></div><div class="hf-row">' + ids.map((id) => cardHtml(id, { caption: false })).join('') + '</div><p class="small muted">' + ids.map((id) => esc(HF().card(id).name.en)).filter((x, i, a) => a.indexOf(x) === i).join(' · ') + '</p></li>';
    }
    return h + '</ol><div class="sg-acts"><button type="button" class="pbtn primary" data-a="menu">Back</button></div>';
  }
  function setsHtml() {
    const ex = {
      goko: (c) => c.kind === 'hikari', shiko: (c) => c.kind === 'hikari' && c.tag !== 'rain', ameshiko: (c) => c.kind === 'hikari' && c.tag !== 'phoenix', sanko: (c) => ['crane', 'curtain', 'moon'].includes(c.tag),
      inoshikacho: (c) => ['boar', 'deer', 'butterflies'].includes(c.tag), hanami: (c) => ['curtain', 'cup'].includes(c.tag), tsukimi: (c) => ['moon', 'cup'].includes(c.tag),
      akatan: (c) => c.tag === 'poem', aotan: (c) => c.tag === 'blue',
    };
    let h = '<div class="sg-top"><span class="vb-jp">' + RB.ui.jhtml('{役|やく}') + '</span> <span class="en">The sets</span></div><p class="small">A set scores when you stop. Seven points or more are doubled, and doubled again if ' + esc(partner()) + ' had called koi-koi.</p><ul class="hf-yaku">';
    for (const id in HF().YAKU) {
      const Y = HF().YAKU[id];
      h += '<li><div class="hf-mh"><span class="vb-jp">' + RB.ui.jhtml(Y.name.jp) + '</span> <span class="en">' + esc(Y.name.en) + ' · ' + Y.pts + ' point' + (Y.pts === 1 ? '' : 's') + '</span></div><p class="small">' + esc(Y.needs) + '</p>' +
        (ex[id] ? '<div class="hf-row">' + HF().DECK.filter(ex[id]).map((c) => cardHtml(c.id, { cls: 'small' })).join('') + '</div>' : '') + '</li>';
    }
    return h + '</ul><div class="sg-acts"><button type="button" class="pbtn primary" data-a="unsets">Back</button></div>';
  }

  // ---- a match ----------------------------------------------------------------------------------------------------
  function startMatch() {
    V.m = { round: 1, of: V.months, totals: [0, 0], dealer: 0, history: [] };
    newRound();
  }
  function newRound() {
    V.seq++;
    const seed = (RB.util.hashStr(String(S().id || 'hf') + '|hanafuda|' + (rec().games || 0) + '|' + V.m.round + '|' + V.seq) >>> 0) || 1;
    V.g = HF().newRound(seed, V.m.dealer);
    V.view = 'table'; V.sel = null; V.ask = null; V.said = null; V.counted = false;
    render();
    if (V.g.turn === 1) partnerTurn();
  }
  function statusLine() {
    const g = V.g;
    if (g.phase === 'over') {
      const r = g.result;
      if (r.winner === null) return 'The cards ran out with no one stopping: nobody scores this month.';
      return (r.winner === 0 ? 'You stopped: ' : Partner() + ' stopped: ') + r.points + ' point' + (r.points === 1 ? '' : 's') + '.';
    }
    if (V.thinking) return esc(Partner()) + ' is choosing…';
    if (g.turn !== 0) return esc(Partner()) + '\'s turn.';
    if (g.phase === 'decide') return 'A set! Stop and score ' + HF().score(g, 0) + ', or call koi-koi and play on for more (if ' + esc(partner()) + ' then stops, their points are doubled).';
    if (g.phase === 'draw') return V.ask ? 'The turned card could take either: choose one.' : 'Turning the top card…';
    if (V.ask) return 'Two cards of that month on the field: choose which to take.';
    if (V.sel) { const n = HF().options(g, V.sel).length; return n ? 'Now tap a lit card on the field to take it.' : 'No card of that month on the field: lay it down.'; }
    return 'Your turn: choose a card from your hand.';
  }
  function tableHtml() {
    const g = V.g;
    const selM = V.sel ? HF().card(V.sel).m : null;
    const drawn = g.phase === 'draw' && g.pending ? g.pending : null;
    const litM = V.help ? (drawn ? HF().card(drawn).m : selM) : null;
    const askSet = new Set(V.ask ? V.ask.opts : []);
    let h = '<div class="hf-top"><span>' + esc('Month ' + V.m.round + ' of ' + V.m.of) + '</span><span>' + esc('You ' + V.m.totals[0] + ' · ' + Partner() + ' ' + V.m.totals[1]) + '</span>' + (g.koi[0] || g.koi[1] ? '<span class="hf-koi">' + RB.ui.jhtml('こいこい') + ' ' + esc((g.koi[0] ? 'you ×' + g.koi[0] : '') + (g.koi[0] && g.koi[1] ? ', ' : '') + (g.koi[1] ? partner() + ' ×' + g.koi[1] : '')) + '</span>' : '') + '</div>';
    h += '<div class="hf-side them">' + backHtml(g.hands[1].length) + caughtHtml(g.caught[1], Partner()) + '</div>';
    h += '<div class="hf-field" role="group" aria-label="The field">' + g.field.map((id) => cardHtml(id, { button: true, attrs: ' data-f="' + id + '"', cls: (litM && HF().card(id).m === litM ? 'lit' : '') + (askSet.has(id) ? ' ask' : '') })).join('') +
      '<div class="hf-pilebox"><span class="hf-card back pile">' + CARDS().back() + '</span><span class="small muted">' + g.pile.length + '</span>' + (drawn ? cardHtml(drawn, { cls: 'turned' }) : '') + '</div></div>';
    h += '<p class="sg-status" role="status">' + statusLine() + '</p>';
    if (g.phase === 'decide' && g.turn === 0) h += '<div class="sg-ask hf-decide" role="group" aria-label="Stop or koi-koi"><button type="button" class="pbtn primary" data-a="stop">' + RB.ui.jhtml('{勝負|しょうぶ}') + ' <span class="en">Stop: ' + HF().score(g, 0) + ' points</span></button><button type="button" class="pbtn" data-a="koi">' + RB.ui.jhtml('こいこい') + ' <span class="en">Koi-koi: play on</span></button></div>';
    if (V.said) h += '<p class="sg-why">' + (V.said.jp ? RB.ui.jhtml(V.said.jp) : '') + '<span class="en">' + esc(V.said.en) + '</span></p>';
    if (g.phase === 'over') h += overHtml();
    h += '<div class="hf-side you">' + caughtHtml(g.caught[0], 'You') + '</div>';
    h += '<div class="hf-hand" role="group" aria-label="Your hand">' + g.hands[0].map((id) => cardHtml(id, { button: true, attrs: ' data-h="' + id + '"' + (g.turn === 0 && g.phase === 'play' && !V.thinking ? '' : ' disabled'), cls: (V.sel === id ? 'sel' : '') + (V.help && g.field.some((f) => HF().card(f).m === HF().card(id).m) ? ' pairs' : '') })).join('') + '</div>';
    h += '<div class="sg-acts">' + (V.sel && g.phase === 'play' && !HF().options(g, V.sel).length ? '<button type="button" class="pbtn primary" data-a="lay">Lay it down</button>' : '') +
      '<label class="opt"><input type="checkbox" data-a="help"' + (V.help ? ' checked' : '') + '><span>Matching help</span></label><button type="button" class="pbtn small" data-a="sets">The sets</button></div>';
    return h;
  }
  function overHtml() {
    const g = V.g, r = g.result;
    let h = '<div class="hf-over">';
    if (r.winner !== null) h += '<p>' + (r.yaku || []).map((y) => '<span class="hf-set">' + RB.ui.jhtml(y.name.jp) + ' <span class="en">' + esc(y.name.en) + ' · ' + y.pts + '</span></span>').join(' ') + '</p>';
    const last = V.m.round >= V.m.of;
    if (last) {
      const [a, b] = V.m.totals;
      h += '<p><b>' + (a > b ? 'You win the game, ' + a + ' to ' + b + '.' : a < b ? Partner() + ' wins the game, ' + b + ' to ' + a + '.' : 'A tie, ' + a + ' each.') + '</b></p><div class="sg-acts"><button type="button" class="pbtn primary" data-a="again">Another game</button><button type="button" class="pbtn" data-a="menu">Back</button></div>';
    } else h += '<div class="sg-acts"><button type="button" class="pbtn primary" data-a="next">Next month</button></div>';
    return h + '</div>';
  }
  // a round ended: the points to the match, the game to the record when it is the last month
  function roundOver() {
    if (V.counted) return;
    V.counted = true;
    const r = V.g.result;
    if (r.winner !== null) { V.m.totals[r.winner] += r.points; V.m.dealer = r.winner; }
    V.m.history.push(r);
    const R = rec();
    if (r.winner === 0) for (const y of r.yaku || []) R.yaku[y.id] = (R.yaku[y.id] || 0) + 1;
    if (V.m.round >= V.m.of) {
      const [a, b] = V.m.totals;
      RB.pastimes.result(S(), 'hanafuda', 'koikoi', a > b, a);
      if (RB.stampBook) RB.stampBook.settle(S());
    }
  }
  function step() {
    const g = V.g;
    if (g.phase === 'over') { roundOver(); render(); return; }
    if (g.turn === 1) { partnerTurn(); return; }
    if (g.phase === 'draw') { humanDraw(); return; }
    render();
  }
  // your play, then the turned card (a short beat so it can be seen)
  function humanPlay(id, take) {
    V.g = HF().play(V.g, id, take);
    V.sel = null; V.ask = null; V.said = null;
    render();
    V.timer = setTimeout(humanDraw, 420);
  }
  function humanDraw() {
    if (!V || V.g.phase !== 'draw') return;
    const g = V.g;
    const ms = g.pending ? HF().options(g, g.pending) : [];
    if (ms.length === 2) { V.ask = { kind: 'draw', opts: ms }; render(); return; }
    V.g = HF().draw(g, null);
    step();
  }
  function partnerTurn() {
    if (!V || V.view !== 'table') return;
    V.thinking = true; render();
    V.timer = setTimeout(() => {
      if (!V || V.view !== 'table') return;
      let g = V.g;
      const L = V.level;
      if (g.phase === 'play') { const m = HF().choosePlay(g, L); V.said = sayPlay(g, m); g = HF().play(g, m.card, m.take); V.g = g; render(); V.timer = setTimeout(() => partnerDraw(), 420); return; }
      partnerDraw();
    }, 380);
  }
  function partnerDraw() {
    if (!V || V.view !== 'table') return;
    let g = V.g;
    if (g.phase === 'draw') { const ms = g.pending ? HF().options(g, g.pending) : []; g = HF().draw(g, ms.length === 2 ? HF().chooseTake(g, V.level, g.pending, ms) : null); }
    if (g.phase === 'decide') {
      const d = HF().chooseDecide(g, V.level);
      const y = HF().yaku(g.caught[1]).list;
      V.said = d === 'koi' ? { jp: 'こいこい ！', en: Partner() + ' made ' + y.map((x) => x.name.en.toLowerCase()).join(' and ') + ', and calls koi-koi: playing on.' } : { jp: '{勝負|しょうぶ} ！', en: Partner() + ' made ' + y.map((x) => x.name.en.toLowerCase()).join(' and ') + ', and stops.' };
      g = HF().decide(g, d);
    }
    V.g = g; V.thinking = false;
    step();
  }
  function sayPlay(g, m) {
    const c = HF().card(m.card);
    if (!m.got.length) return { en: Partner() + ' lays down ' + c.name.en.toLowerCase() + '.', jp: '' };
    return { en: Partner() + ' takes ' + m.got.filter((x) => x !== m.card).map((x) => HF().card(x).name.en.toLowerCase()).join(' and ') + ' with ' + c.name.en.toLowerCase() + '.', jp: '' };
  }

  // ---- render and input ------------------------------------------------------------------------------------------
  function render() {
    if (!V) return;
    V.leaf.innerHTML = V.view === 'menu' ? menuHtml() : V.view === 'months' ? monthsHtml() : V.view === 'sets' ? setsHtml() : tableHtml();
  }
  function onChange(e) {
    if (!V) return;
    const t = e.target;
    if (t.name === 'hf-level') V.level = +t.value;
    if (t.name === 'hf-len') V.months = +t.value;
    if (t.dataset && t.dataset.a === 'help') { V.help = t.checked; render(); }
  }
  function onClick(e) {
    if (!V) return;
    const t = e.target;
    const h = t.closest('[data-h]'), f = t.closest('[data-f]');
    const g = V.g;
    if (h && !h.disabled && V.view === 'table') {
      if (g.turn !== 0 || g.phase !== 'play' || V.thinking) return;
      V.sel = V.sel === h.dataset.h ? null : h.dataset.h; V.ask = null;
      const ms = V.sel ? HF().options(g, V.sel) : [];
      // one card or three to take: taken at once; two: choose which
      if (V.sel && (ms.length === 1 || ms.length === 3)) return humanPlay(V.sel, null);
      if (V.sel && ms.length === 2) V.ask = { kind: 'play', opts: ms };
      render(); return;
    }
    if (f && V.view === 'table') {
      const id = f.dataset.f;
      if (V.ask && V.ask.opts.indexOf(id) >= 0) {
        if (V.ask.kind === 'play') return humanPlay(V.sel, id);
        V.ask = null; V.g = HF().draw(g, id); step(); return;
      }
      return;
    }
    const b = t.closest('[data-a]');
    if (!b || b.disabled || b.tagName === 'INPUT') return;
    const a = b.dataset.a;
    if (a === 'start' || a === 'again') return startMatch();
    if (a === 'menu') { clearTimeout(V.timer); V.view = 'menu'; render(); return; }
    if (a === 'months') { V.view = 'months'; render(); return; }
    if (a === 'sets') { V.back = V.view; V.view = 'sets'; render(); V.leaf.scrollTop = 0; return; }
    if (a === 'unsets') { V.view = V.back || 'menu'; render(); return; }
    if (a === 'lay' && V.sel) return humanPlay(V.sel, null);
    if (a === 'stop' || a === 'koi') { V.g = HF().decide(g, a); V.said = null; step(); return; }
    if (a === 'next') { V.m.round++; newRound(); return; }
  }
  return { run, close, state: () => (V ? { view: V.view, g: V.g, m: V.m, sel: V.sel, ask: V.ask, thinking: !!V.thinking, level: V.level } : null) };
})();
