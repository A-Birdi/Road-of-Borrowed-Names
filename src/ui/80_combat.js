/* Inkweaving — presentation and exchange loop. Logic lives in
 * RB.combatLogic; this file draws the arena, the telegraphed intent,
 * response cards, and runs the language step for the chosen response. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.combat = (function () {
  'use strict';
  const esc = RB.util.esc;
  const L = () => RB.combatLogic;
  let st = null, enemy = null, ui = null;
  // What the screen shows lags the rules by one beat: the rules apply a whole
  // exchange at once, and `view` (a copy of the state from before it) steps
  // forward as each result is shown (RB.battleSeq). null = show `st` itself.
  let view = null, phase = 'idle', sealHeld = null, curCard = null;
  const V = () => view || st;
  const snapshot = (x) => Object.assign({}, x, { ward: Object.assign({}, x.ward) });

  // ---- the scene, framed inside the stage: the free area the overlay leaves ----
  // Drawn at art resolution (2 art px per logical px): the regional backdrop
  // (RB.battleScene), then the stage (RB.battleStage: the creature, knots,
  // the party, states and effects). Positions are art px.
  let stageCss = null, measureAt = -1e9;
  function measure() {
    if (!ui || !ui.stage) { stageCss = null; return; }
    const r = ui.stage.getBoundingClientRect();
    stageCss = r.width > 60 && r.height > 60 ? { x: r.left, y: r.top, w: r.width, h: r.height } : null;
  }
  // the stage cell in art px (CSS px per art px = the view's CSS px per logical px / ART)
  function stageBuf(w, h) {
    const k = (RB.render.viewSize().scale || 1) / RB.render.ART;
    if (!stageCss) return { x: 0, y: 0, w, h };
    const x = Math.max(0, stageCss.x / k), y = Math.max(0, stageCss.y / k);
    return { x, y, w: Math.min(w - x, stageCss.w / k), h: Math.min(h - y, stageCss.h / k) };
  }
  // While you read, choose and write, the scene stays alive but calm: the
  // adventurers take their calm stance and the ambient clock (the backdrop's
  // drifting motes, the creature's idle) runs at half speed. Strong motion
  // belongs to the committed beats.
  const calmNow = () => phase === 'choose' || phase === 'challenge';
  const amb = { v: null, last: null, rate: 1 };
  function ambient(t) {
    if (amb.v == null) { amb.v = t; amb.last = t; }
    const dt = Math.max(0, Math.min(100, t - amb.last));
    amb.last = t;
    amb.rate += ((calmNow() ? 0.5 : 1) - amb.rate) * Math.min(1, dt / 400);
    amb.v += dt * amb.rate;
    return amb.v;
  }
  // frame cost (ms spent drawing the battle), for tests and tuning
  const cost = { n: 0, sum: 0, max: 0, seqN: 0, seqSum: 0, seqMax: 0 };
  function draw(c, w, h, t) {
    const t0 = performance.now();
    if (t - measureAt > 400) { measureAt = t; measure(); }
    const S = stageBuf(w, h);
    const Sc = RB.battleScene;
    const reduce = RB.game.reducedMotion();
    const pt = RB.battleSeq.tick(t);
    const tt = reduce ? 0 : ambient(t);
    const lay = st && RB.battleStage.active() ? RB.battleStage.layout(S, w, h) : null;
    const hz = lay ? lay.hz : Math.round(h * 0.62);
    c.imageSmoothingEnabled = false;
    // (the stage's arrangement, for a backdrop composer that keeps the actors' boxes clear)
    Sc.backdrop(c, enemy.bgKey || enemy.bg || enemy.region || 'reedwake', w, h, hz, tt, reduce, lay ? { S, ex: lay.ex, ey: lay.ey, ext: lay.ext, px: lay.px, py: lay.py, ps: lay.ps, scale: lay.scale, art: enemy.art, party: lay.party } : null);
    if (lay) {
      // the frame loop must survive anything the presentation does wrong
      try { RB.battleStage.draw(c, w, h, { t, pt, amb: tt, view: V(), reduce, calm: calmNow(), Sr: S, lay, stageCss, sealHeld }); }
      catch (err) { if (!draw.failed) console.error('battle stage', err); draw.failed = true; }
    }
    const dt = performance.now() - t0;
    cost.n++; cost.sum += dt; cost.max = Math.max(cost.max, dt);
    if (RB.battleSeq.busy()) { cost.seqN++; cost.seqSum += dt; cost.seqMax = Math.max(cost.seqMax, dt); }
  }
  draw.art = true;
  function tierOf(obj) {
    return RB.activities.tier(obj);
  }
  let linePick = null;
  function intentLine(it) {
    const s = RB.game.s;
    const prof = s.learn.profile;
    const solo = !s.comp;
    let pool;
    if (it.text) pool = [].concat(tierOf(it.text) || []);
    else {
      const T = RB.content.intentText[it.kind];
      pool = T ? [].concat(T[prof] || T.F || []) : [];
    }
    if (!pool.length) return { jp: '', en: it.label };
    let cands = pool;
    if (solo || it.target === 'both') cands = pool.filter((x) => !x.neg);
    if (!cands.length) cands = pool;
    // the line chosen when the move was telegraphed stays put for the whole exchange
    if (!linePick || linePick.it !== it || linePick.round !== st.round) linePick = { it, round: st.round, i: (st.round + st.knots) % cands.length };
    const pick = cands[linePick.i % cands.length];
    const nm = { pc: s.player.nameJp || s.player.name, comp: s.comp ? RB.jp.plain(RB.content.chars[s.comp].name.jp) : '' };
    const nmEn = { pc: s.player.name, comp: s.comp ? RB.content.chars[s.comp].name.en : '' };
    const tgt = it.target === 'comp' ? 'comp' : 'pc';
    const other = tgt === 'pc' ? 'comp' : 'pc';
    return {
      jp: pick.jp, en: (pick.en || '').replace(/\$tgtEn/g, nmEn[tgt]).replace(/\$otherEn/g, nmEn[other]),
      vars: { tgt: nm[tgt], other: nm[other] }, neg: !!pick.neg,
    };
  }

  // ---- the overlay: foe slip, telegraph card, stage, party, response dock ----
  const I = (n, t) => RB.learnUi.icon(n, t);
  const INTENT_ICON = { strike: 'strike', sweep: 'sweep', heat: 'flame', shroud: 'cloud', charge: 'hourglass', gust: 'gust', mend: 'needle', lie: 'mask', plea: 'history', rest: 'rest', flood: 'waves', chill: 'snow', silence: 'mute', mirror: 'mirror' };
  const TAG_ICON = [['ward', 'shield'], ['water', 'drop'], ['light', 'sun'], ['heal', 'leaf'], ['wind', 'wind'], ['bind', 'rope'], ['anchor', 'stone'], ['stone', 'stone'], ['fire', 'flame'], ['warm', 'flame'], ['bell', 'bell'], ['voice', 'sound']];
  // plain attacks whose target the translated telegraph names outright
  const AIMED = { strike: 1, sweep: 1, gust: 1, flood: 1, chill: 1 };
  function cardIcon(c) {
    if (c.kind === 'unravel') return 'knot';
    if (c.kind === 'answer') return 'history';
    if (c.kind === 'truth') return 'lens';
    if (c.kind === 'tech') return 'join';
    const tags = (c.word && c.word.tags) || [];
    for (const [t, n] of TAG_ICON) if (tags.indexOf(t) >= 0) return n;
    return 'words';
  }
  function compName() {
    const s = RB.game.s;
    return s.comp && RB.content.chars[s.comp] ? RB.content.chars[s.comp].name.en : 'companion';
  }
  function buildUi() {
    const root = RB.ui.el('div', 'combat-ui');
    root.innerHTML =
      '<div class="cb-foe"></div>' +
      '<div class="cb-side">' +
        '<section class="intent paper" aria-live="polite" aria-label="What it is about to do"></section>' +
        '<section class="cb-dock" aria-label="Respond"><h2 class="cb-dock-h">Respond</h2>' +
          '<div class="cb-coachbox" aria-live="polite"></div>' +
          '<div class="responses" role="group" aria-label="Responses"></div>' +
          '<div class="clog paper hidden" aria-live="polite"></div></section>' +
      '</div>' +
      '<div class="cb-stage" aria-hidden="true"></div>' +
      '<section class="bars cb-party" aria-label="Your party"></section>';
    // Beneath every other layer: the dialogue sheet usually exists before the
    // battle, and an overlay appended after it would sit on top of its buttons.
    RB.ui.root.insertBefore(root, RB.ui.root.firstChild);
    const q = (x) => root.querySelector(x);
    const o = { root, foe: q('.cb-foe'), intent: q('.intent'), stage: q('.cb-stage'), bars: q('.bars'), dock: q('.cb-dock'), resp: q('.responses'), log: q('.clog'), coach: q('.cb-coachbox') };
    RB.learnUi.guardTaps(o.resp);
    o.onResize = () => requestAnimationFrame(measure);
    window.addEventListener('resize', o.onResize);
    root.addEventListener('scroll', o.onResize, { passive: true });
    o.ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(o.onResize) : null;
    if (o.ro) o.ro.observe(o.stage);
    return o;
  }
  let showIntentEn = false;
  function enShown() { return RB.game.s.learn.profile === 'F' || showIntentEn; }
  // A keyword: a button that explains itself (RB.combatHelp) on hover, focus or tap.
  const kw = (key, cls, inner, sr) => '<button type="button" class="kw ' + cls + '" data-kw="' + key + '" aria-expanded="false" aria-controls="kwcard">' + inner +
    '<span class="sr">' + esc(sr || ' — what this means') + '</span></button>';
  // the small "explain" mark on a keyword (shape, not colour alone)
  const Q = () => '<span class="kw-q" aria-hidden="true">' + I('help') + '</span>';
  // States in play, shown as keywords on the foe's slip beside its knots
  // (wards are on the party slip).
  const STATUS_ICON = { heat: 'flame', shroud: 'cloud', charge: 'hourglass', silence: 'mute', 'ward:pc': 'shield', 'ward:comp': 'shield' };
  function statusList() {
    const out = [], v = V();
    if (v.heat) out.push({ key: 'heat', label: 'Heat ' + v.heat });
    if (v.shroud) out.push({ key: 'shroud', label: 'Shrouded' });
    if (v.charged) out.push({ key: 'charge', label: 'Gathering' });
    if (v.silenced) out.push({ key: 'silence', label: 'Hushed' });
    return out;
  }
  function intentHtml(compact) {
    const it = st.intent;
    const line = intentLine(it);
    const H = RB.combatHelp;
    const g = H.gist(st, it);
    const face = I(INTENT_ICON[it.kind] || 'strike') + '<span class="k">' + esc(it.label) + '</span>' + (g ? '<span class="gist">' + esc(g) + '</span>' : '');
    // (the task slip carries the states as plain text; on screen they are on the foe's slip)
    const states = compact ? statusList() : [];
    let h = '<div class="it-label">' + (compact ? '<span class="it-kind">' + face + '</span>' : kw('intent', 'it-kind', face + Q())) +
      states.map((x) => '<span class="st">' + esc(x.label) + '</span>').join('') + '</div>';
    if (line.jp) h += '<div class="it-jp">' + RB.ui.jhtml(line.jp, { vars: line.vars }) + '</div>';
    if (line.en) h += enShown() ? '<div class="it-en">' + esc(line.en) + '</div>' : (compact ? '' : '<button class="pbtn quiet tr" data-tr title="Show the English (counts as assisted)">' + I('note') + '<span>Translate <span class="aside">(assisted)</span></span></button>');
    if (!compact && RB.game.s.comp === 'nao' && st.nextIntents.length) h += '<div class="it-next">' + I('companion') + '<span>Nao: “After that — ' + esc(st.nextIntents.map((x) => x.label).join(', then ')) + '.”</span></div>';
    return h;
  }
  // The text of a keyword's note card, for the encounter on screen.
  function helpFor(key) {
    if (!st) return null;
    const H = RB.combatHelp;
    const s = RB.game.s;
    const ws = words();
    const p = (x) => (x ? '<p>' + x + '</p>' : '');
    const ans = (x) => (x ? '<p><b>Answer:</b> ' + x + '</p>' : '');
    if (key === 'intent') {
      const it = st.intent;
      const i = H.intentInfo(st, it, ws);
      return { icon: INTENT_ICON[it.kind] || 'strike', title: esc(i.title), body: p(i.what) + ans(i.answer) };
    }
    if (key === 'harmony') {
      if (!st.compId) return null;
      const h = H.harmonyInfo(V());
      return { icon: 'join', title: h.title, body: '<p class="kw-now">' + h.now + '</p><p><b>How it fills:</b> ' + h.fills + '</p><p><b>When it is full:</b> ' + h.offers + '</p><p>' + h.more + '</p>' };
    }
    const i = H.statusInfo(V(), key, ws, { pc: esc(s.player.name), comp: esc(compName()) });
    if (!i) return null;
    return { icon: STATUS_ICON[key], title: i.title, body: p(i.what) + ans(i.answer) };
  }
  function knotsHtml() {
    let h = '';
    const v = V();
    for (let i = 0; i < v.maxKnots; i++) h += '<span class="kn' + (i < v.knots ? ' tied' : '') + '"></span>';
    return '<span class="knots" role="img" aria-label="Knots still tied: ' + v.knots + ' of ' + v.maxKnots + '">' + h + '</span><span class="kn-t">' + v.knots + ' / ' + v.maxKnots + ' knots</span>';
  }
  function renderUi() {
    const s = RB.game.s;
    const it = st.intent;
    const states = statusList();
    ui.foe.innerHTML = '<span class="foe-n">' + RB.ui.jhtml(enemy.name.jp) + ' <span class="en">' + esc(enemy.name.en) + '</span></span>' +
      '<span class="foe-k' + (states.length ? ' has-st' : '') + '">' + knotsHtml() + (states.length ? '<span class="it-states" role="group" aria-label="Its state">' +
        states.map((x) => kw(x.key, 'st', '<span class="pill">' + I(STATUS_ICON[x.key]) + esc(x.label) + '</span>')).join('') + '</span>' : '') + '</span>';
    ui.intent.innerHTML = intentHtml(false);
    const tr = ui.intent.querySelector('[data-tr]');
    if (tr) tr.onclick = () => { showIntentEn = true; st.assistedRound = true; renderUi(); };
    // the party: resolve (numbers and bar) and wards; Harmony is its own band
    // above them (not a third resolve bar). The telegraph's target is marked
    // once its meaning is on screen (never before).
    const aimed = enShown() && AIMED[it.kind] ? (it.target === 'both' ? ['pc', 'comp'] : [it.target]) : [];
    const member = (who, name, v, max, ward) => '<div class="pm' + (aimed.indexOf(who) >= 0 ? ' aimed' : '') + '">' +
      '<div class="pm-h"><span class="pm-n">' + esc(name) + '</span>' +
      (aimed.indexOf(who) >= 0 ? '<span class="aimtag">' + I('aim') + 'its aim</span>' : '') +
      (ward ? kw('ward:' + who, 'pm-w', '<span class="pill">' + I('shield') + '<span class="wl">Ward </span>' + ward + '</span>', ' in front of ' + name + ' — what this means') : '') + '</div>' +
      '<div class="pm-r"><div class="bar" role="meter" aria-label="' + esc(name) + ' resolve" aria-valuemin="0" aria-valuemax="' + max + '" aria-valuenow="' + v + '"><i style="width:' + Math.round((100 * v) / max) + '%"></i></div>' +
      '<span class="pm-v"><span class="sr">Resolve </span>' + v + ' / ' + max + '</span></div></div>';
    const v = V();
    ui.bars.innerHTML = (s.comp && st.compId ? harmonyHtml() : '') + '<div class="pm-list">' +
      member('pc', s.player.name, v.pc, v.max, v.ward.pc) +
      (s.comp ? member('comp', compName(), v.comp, v.max, v.ward.comp) : '') +
      '<div class="pm-note">' + (st.assist ? 'Assisted: mistakes cost nothing' : 'Mistakes cost at most 1') + '</div></div>';
    RB.combatHelp.refresh(ui.root);
    requestAnimationFrame(measure);
  }
  // Harmony: a paper band tied to the top of the party slip, with pips (not a
  // bar), what it is building towards (this companion's technique), and its
  // own explanation on hover, focus or tap.
  function harmonyHtml() {
    const T = RB.combatHelp.techOf(st);
    const v = V();
    const full = v.harmony >= v.harmonyMax;
    let pips = '';
    for (let i = 0; i < v.harmonyMax; i++) pips += '<i class="hp' + (i < v.harmony ? ' on' : '') + '"></i>';
    return kw('harmony', 'cb-harmony' + (full ? ' full' : ''),
      '<span class="hm-a">' + I('join') + '<span class="hm-n">Harmony</span>' +
      '<span class="hm-pips" aria-hidden="true">' + pips + '</span><span class="hm-v">' + v.harmony + '<span class="sr"> of </span><span aria-hidden="true">/</span>' + v.harmonyMax + '</span></span>' +
      '<span class="hm-t">' + (full ? '<b>Ready:</b> ' + esc(T.name) + ' is in your responses' : esc(compName()) + '\'s technique at ' + v.harmonyMax + ': ' + esc(T.name)) + '</span>' + Q(),
      ' — what Harmony is and how it fills');
  }
  function words() {
    const s = RB.game.s;
    return s.words.map((id) => RB.content.words[id]).filter(Boolean);
  }
  // Words used in battle for the first time are marked "New" for that whole
  // encounter, with what they answer; recorded (s.tips) when it ends.
  let newWords = new Set(), shownWords = new Set();
  function cardHtml(c, i, hi) {
    const tgt = c.target ? (c.target === 'comp' ? compName() : 'you') : '';
    const desc = c.disabled || RB.script.enVars(tgt ? String(c.desc).replace(/\s*\([^)]*\)\s*$/, '') : c.desc);
    const fresh = c.kind === 'word' && newWords.has(c.word.id);
    const ans = fresh ? L().answers(c.word).map((k) => L().INTENTS[k].label) : [];
    const ready = c.kind === 'tech';
    return '<button class="resp rcard' + (fresh ? ' fresh' : '') + (ready ? ' tech' : '') + '" data-i="' + i + '"' + (c.disabled ? ' disabled' : '') + '>' +
      '<span class="ic">' + I(cardIcon(c)) + '</span>' +
      '<span class="rc-w"><span class="rc-jp">' + RB.ui.jhtml(hi && c.word && c.word.jpK ? c.word.jpK : c.jp) + '</span><span class="rc-en">' + esc(c.en) + '</span>' +
      (fresh ? '<span class="rc-new">New</span>' : '') + (ready ? '<span class="rc-new">With ' + esc(compName()) + '</span>' : '') + '</span>' +
      (tgt ? '<span class="rc-tgt">on ' + esc(tgt) + '</span>' : '') +
      '<span class="rc-d">' + (c.disabled ? I('warn') : '') + esc(desc) +
      (ans.length ? '<span class="rc-ans"><b>Answers:</b> ' + esc(ans.join(', ')) + (c.word.tags.indexOf('ward') >= 0 ? ' (in front of the one it aims at)' : '') + '</span>' : '') + '</span></button>';
  }
  // One short note per exchange, the first time something needs explaining:
  // a kind of move never seen before, then a full Harmony, then Harmony itself.
  function coachFor() {
    const s = RB.game.s;
    const H = RB.combatHelp;
    const it = st.intent;
    const cn = esc(compName());
    if (!H.seen(s, 'intent:' + it.kind)) {
      H.mark(s, 'intent:' + it.kind);
      const i = H.intentInfo(st, it, words());
      return { icon: INTENT_ICON[it.kind] || 'strike', title: 'New move: ' + esc(it.label), body: i.what + (i.answer ? ' ' + i.answer : ''), more: 'intent' };
    }
    if (st.compId && st.harmony >= st.harmonyMax && !H.seen(s, 'harmonyFull')) {
      H.mark(s, 'harmonyFull'); H.mark(s, 'harmony');
      const T = H.techOf(st);
      return { icon: 'join', title: esc(T.name) + ' is ready', body: 'Harmony is full, so ' + cn + '\'s technique is now among your responses. ' + esc(T.effect) + ' It also cancels its move, and uses up Harmony.', more: 'harmony' };
    }
    if (st.compId && !H.seen(s, 'harmony')) {
      H.mark(s, 'harmony');
      const T = H.techOf(st);
      return { icon: 'join', title: 'Harmony', body: cn + ' fights beside you. Each time you answer right first time with a response that cancels its move — or with Unravel — Harmony fills by 1. At ' + st.harmonyMax + ', ' + cn + '\'s technique, <b>' + esc(T.name) + '</b>, joins your responses.', more: 'harmony' };
    }
    return null;
  }
  function showCoach(c) {
    if (!c) { ui.coach.innerHTML = ''; return; }
    ui.coach.innerHTML = '<div class="cb-coach paper" role="note">' +
      '<div class="cc-h">' + I(c.icon) + '<b>' + c.title + '</b></div><p>' + c.body + '</p>' +
      '<div class="cc-f">' + kw(c.more, 'cc-more pbtn quiet', '<span>More</span>', ' about this') +
      '<button type="button" class="pbtn cc-ok" data-coach-ok>' + I('done') + '<span>Got it</span></button></div></div>';
    ui.coach.querySelector('[data-coach-ok]').onclick = () => {
      ui.coach.innerHTML = '';
      RB.combatHelp.hide();
      const f = ui.resp.querySelector('.rcard:not([disabled])');
      if (f) f.focus({ preventScroll: true });
      requestAnimationFrame(measure);
    };
  }
  function pickCard() {
    return new Promise((resolve) => {
      const s = RB.game.s;
      const cards = L().responses(st, words());
      const known = new Set(words().flatMap((w) => w.tags));
      // Keep every encounter solvable: only block Unravel if a counter is actually known.
      for (const c of cards) {
        if (c.kind === 'unravel' && st.shroud && !(known.has('light') || known.has('wind'))) c.disabled = null;
        if (c.kind === 'unravel' && st.silenced && (known.has('bell') || known.has('voice'))) c.disabled = 'The hush swallows words: ring a bell or raise a voice first.';
      }
      // say "kana or kanji" whenever the writing pad will read kanji for this player
    const hi = RB.pad && RB.pad.kanjiPreferred ? RB.pad.kanjiPreferred() : s.learn.profile === 'I' || s.learn.profile === 'A';
      for (const c of cards) if (c.kind === 'word') shownWords.add(c.word.id);
      ui.resp.innerHTML = '<div class="rcards">' + cards.map((c, i) => cardHtml(c, i, hi)).join('') + '</div>' +
        (st.noFlee ? '' : '<button class="cbtn flee" data-flee>' + I('back') + '<span>Step back from this encounter</span></button>');
      // the last exchange stays readable under the responses (what was woven, what it did)
      recap();
      showCoach(coachFor());
      // Keyboard focus starts on the responses but may also reach the
      // keywords (telegraph, states, Harmony, wards) and the note above them.
      const layer = { el: ui.resp, name: 'cards', parent: ui.dock, scope: ui.root };
      // one choice per exchange: a second click (or a double click) is ignored
      let chosen = false;
      const done = (v) => { if (chosen) return; chosen = true; RB.combatHelp.hide(); showCoach(null); RB.ui.popLayer(layer); ui.dock.insertBefore(ui.resp, ui.log); resolve(v); };
      ui.resp.onclick = (e) => {
        const b = e.target.closest('[data-i]');
        if (b && !b.disabled) { done(cards[+b.getAttribute('data-i')]); return; }
        if (e.target.closest('[data-flee]')) done({ kind: 'flee' });
      };
      // Back closes an open keyword note first; it never leaves the encounter.
      layer.onAction = (a) => { if (a === 'cancel' && RB.combatHelp.isOpen()) { RB.combatHelp.hide(); return true; } return false; };
      layer.onCancel = () => {};
      RB.ui.pushLayer(layer);
      ui.dock.insertBefore(ui.resp, ui.log);
      requestAnimationFrame(measure);
    });
  }
  function stepFor(card) {
    const s = RB.game.s;
    const it = st.intent;
    if (card.kind === 'unravel' || card.kind === 'tech') {
      const step = RB.tasks.next(enemy.pool || {}, {});
      step.title = card.kind === 'tech' ? 'Coordinated technique with ' + compName() + ': ' + card.en : 'Unravel: restore one of its tangled words';
      return step;
    }
    if (card.kind === 'answer' || card.kind === 'truth') {
      const src = card.kind === 'answer' ? it.answer : it.truth;
      const t = src ? RB.util.deepClone(tierOf(src) || src) : null;
      if (t) { t.title = card.kind === 'answer' ? 'Answer what it is really asking' : 'See through the false promise'; return RB.tasks.prepare(t); }
      return RB.tasks.next(enemy.pool || {});
    }
    const w = card.word;
    // say "kana or kanji" whenever the writing pad will read kanji for this player
    const hi = RB.pad && RB.pad.kanjiPreferred ? RB.pad.kanjiPreferred() : s.learn.profile === 'I' || s.learn.profile === 'A';
    return RB.tasks.prepare({
      kind: 'write', item: 'v:' + (w.lex || w.r), answer: w.r, accept: [w.r, RB.tasks.plain(w.jpK || w.jp)], mode: 'reading',
      title: 'Weave the inscription', prompt: { en: 'Write the word for “' + w.en + '”' + (hi ? ' (kana or kanji).' : '.') },
      explain: { jp: w.jpK || w.jp, en: w.en + ' — ' + w.effect },
    });
  }
  // The situation, carried onto the challenge's task slip: the foe, its
  // telegraph, and the response (and its target) the player chose.
  function situationHtml(card) {
    const tgt = card.target ? (card.target === 'comp' ? compName() : 'you') : '';
    return '<div class="cb-situ">' +
      '<div class="cs-foe">' + RB.ui.jhtml(enemy.name.jp) + ' <span class="en">' + esc(enemy.name.en) + '</span> ' + knotsHtml() + '</div>' +
      '<div class="cs-intent">' + intentHtml(true) + '</div>' +
      '<div class="cs-chose">' + I(cardIcon(card)) + '<span>You chose <b>' + esc(card.en) + '</b>' + (tgt ? ' — on <b>' + esc(tgt) + '</b>' : '') + '. The encounter waits while you write.</span></div></div>';
  }
  function say(line, who) {
    return RB.ui.dialogue.say({ who: who || 'narr', jp: line.jp, en: line.en });
  }
  // ---- the exchange log: every result as a line, kept for the whole exchange and
  // left under the responses afterwards as a recap (the resolved word with its
  // reading, and what it did), so nothing depends on catching the animation.
  let logFresh = true;
  function logLine(html) {
    if (!ui || !html) return;
    if (logFresh) { ui.log.innerHTML = ''; logFresh = false; }
    ui.log.classList.remove('hidden', 'recap');
    ui.log.setAttribute('aria-live', 'polite');
    const p = document.createElement('p');
    p.className = 'cl-l';
    p.innerHTML = html;
    ui.log.appendChild(p);
    while (ui.log.children.length > 5) ui.log.removeChild(ui.log.firstChild);
  }
  function recap() {
    logFresh = true;
    const any = ui.log.children.length > 0;
    ui.log.classList.toggle('hidden', !any);
    ui.log.classList.toggle('recap', any);
    ui.log.setAttribute('aria-live', 'off');
  }
  const wordHtml = (w) => '<span class="cl-w">' + w.html + '</span> <span class="cl-en">' + esc(w.en) + '</span>';
  // One authoritative fx event reaches the screen: the displayed state steps
  // forward by exactly this result, its line is logged and its sound plays.
  // Called once per event by the sequencer (RB.battleSeq), at its beat.
  function applyBeat(f, cue) {
    const s = RB.game.s;
    if (!view) view = snapshot(st);
    const v = view;
    const nm = (who) => (who === 'comp' ? RB.content.chars[s.comp].name.en : s.player.name);
    const was = { pc: v.pc, comp: v.comp };
    const sfx = (n) => RB.audio && RB.audio.sfx(n);
    let msg = '';
    switch (f.t) {
      case 'unravel': v.knots = Math.max(0, v.knots - (f.n || 1)); sfx('knot_untie'); msg = f.n > 1 ? 'Two knots come loose.' : 'A knot comes loose.'; break;
      case 'ward':
        if (f.block) sealHeld = f.target; else v.ward[f.target] = (v.ward[f.target] || 0) + 2;
        sfx('ward'); msg = f.block ? 'The ward catches the blow meant for ' + nm(f.target) + '.' : 'A ward rises before ' + nm(f.target) + '.'; break;
      case 'water': v.heat = 0; sfx('water'); msg = 'Water hisses over the heat — it cools. Heat cleared.'; break;
      case 'light': v.shroud = false; sfx('light'); msg = 'Light burns the mist away — its knots show again.'; break;
      case 'bind': v.charged = false; sfx('ward'); msg = 'The rope holds it fast; the gathered force spills away.'; break;
      case 'heal': v.pc = Math.min(v.max, v.pc + 3); if (v.compId) v.comp = Math.min(v.max, v.comp + 3); sfx('heal'); msg = 'You both breathe easier.'; break;
      case 'warm': sfx('light'); msg = 'Warmth spreads through your fingers.'; break;
      case 'bell': v.silenced = 0; sfx('bell'); msg = 'A clear note breaks the hush.'; break;
      case 'hit': {
        if (f.who === 'comp') v.comp = Math.max(0, v.comp - f.n); else v.pc = Math.max(0, v.pc - f.n);
        sfx('party_hit');
        const hb = L().heatBonus(v);
        msg = nm(f.who) + ' is struck (−' + f.n + (hb ? ', with +' + hb + ' from Heat' : '') + ').'; break;
      }
      case 'block': v.ward[f.who] = Math.max(0, (v.ward[f.who] || 0) - f.n); sfx('ward'); msg = 'The ward absorbs ' + f.n + '.'; break;
      case 'heat': v.heat = f.n; sfx('enemy_intent'); msg = 'It overheats: Heat ' + f.n + ' — its blows now hit +' + (f.bonus != null ? f.bonus : f.n) + ' harder until it is cooled.'; break;
      case 'shroud': v.shroud = true; sfx('wind'); msg = 'Mist swallows its knots.'; break;
      case 'charge': v.charged = true; sfx('enemy_intent'); msg = 'It gathers itself: its next blow will hit +2 harder.'; break;
      case 'harmony': {
        v.harmony = f.n;
        const full = f.n >= f.max;
        if (full) sfx('harmony_ready');
        msg = full ? 'In step with ' + compName() + ': Harmony is full — ' + RB.combatHelp.techOf(st).name + ' is ready.' : 'In step with ' + compName() + ': Harmony ' + f.n + ' of ' + f.max + '.';
        break;
      }
      case 'mend': v.knots = Math.min(v.maxKnots, v.knots + 1); sfx('enemy_intent'); msg = 'It ties one knot back up.'; break;
      case 'stripWard': v.ward.pc = 0; v.ward.comp = 0; sfx('wind'); msg = 'The gust tears your wards away.'; break;
      case 'silence': v.silenced = 1; sfx('enemy_intent'); msg = 'Sound drains out of the air: you are Hushed.'; break;
      case 'countered': sealHeld = null; if (f.kind === 'charge') v.charged = false; sfx('reveal'); msg = 'You answered it — its move comes to nothing.'; break;
      case 'cost': v.pc = Math.max(0, v.pc - 1); msg = f.en; break;
      case 'tech':
        if (f.who === 'mio') { v.pc = v.max; v.comp = v.max; v.heat = 0; v.shroud = false; v.charged = false; }
        if (f.who === 'ren') { v.ward.pc += 3; v.ward.comp += 3; }
        sfx('technique'); msg = f.en; break;
      case 'settle': if (cue && cue.side === 'player' && curCard && curCard.kind === 'answer') v.knots = Math.max(0, v.knots - 1); sfx('reveal'); msg = f.en; break;
      case 'reveal': if (st.intent && st.intent.kind === 'mirror') v.knots = Math.max(0, v.knots - 1); sfx('reveal'); msg = f.en; break;
      case 'comp':
        // a companion's own move; Mio's draught at the end of the exchange is
        // the last change, so the display meets the rules there
        if (f.who === 'mio' && cue && cue.side === 'enemy') { v.pc = st.pc; v.comp = st.comp; }
        sfx('reveal'); msg = f.en; break;
      case 'plea': msg = 'It waits for an answer that doesn\'t come.'; break;
      case 'rest': msg = 'It hangs back, waiting.'; break;
      case 'spent': v.charged = false; msg = 'The force it gathered is spent in that blow.'; break;
      case 'revive': v.pc = st.pc; msg = compName() + ' hauls you back to your feet.'; break;
      case 'woven': msg = ''; break;
      default: msg = f.en || '';
    }
    const w = cue && cue.word;
    const html = w ? wordHtml(w) + (msg ? ' — ' + esc(msg) : '') : esc(msg);
    if (html) logLine(html);
    renderUi();
    return { delta: { pc: v.pc - was.pc, comp: v.comp - was.comp } };
  }
  function seqCtx(extra) {
    return Object.assign({ comp: st.compId || null, reduce: RB.game.reducedMotion(), view: snapshot(V()) }, extra || {});
  }
  const tagSide = (cues, side) => { for (const c of cues) if (c.type === 'beat') c.side = side; return cues; };
  // Your response, once accepted and applied by the rules: anticipation → the
  // gesture → the word on paper → its effect on the actual target → recovery.
  // The finishing response also lets the creature settle before the last line.
  function playPlayer(card, fx, before, won) {
    view = before;
    const ctx = seqCtx({ view: before });
    const P = RB.battleSeq.choreo.player(card, fx, ctx);
    let cues = tagSide(P.cues, 'player'), end = P.end;
    if (won) { const F = RB.battleSeq.choreo.finish(P.end, ctx); cues = cues.concat(F.cues); end = F.end; }
    phase = won ? 'finish' : 'player';
    return RB.battleSeq.run(phase, cues, { end, card: card.id, word: P.word.jp, target: P.plan.target, gesture: P.plan.gesture, actors: P.plan.actors, fx: fx.map((f) => f.t) });
  }
  // The creature's move as the rules resolved it: preparation → execution →
  // contact on each actual target → their reactions → recovery.
  function playEnemy(it, fx, before, wardBlock) {
    view = before;
    const ctx = seqCtx({ view: before, wardBlock, foeCol: (enemy.artOpts && enemy.artOpts.col) || null });
    const E = RB.battleSeq.choreo.enemy(it, fx, ctx);
    phase = 'enemy';
    return RB.battleSeq.run('enemy', tagSide(E.cues, 'enemy'), { end: E.end, kind: it.kind, target: it.target, fx: fx.map((f) => f.t + (f.who ? ':' + f.who : '')) });
  }
  function playRevive() {
    view = snapshot(st);
    view.pc = 0;
    const R = RB.battleSeq.choreo.revive(seqCtx());
    phase = 'revive';
    return RB.battleSeq.run('revive', tagSide(R.cues, 'revive'), { end: R.end });
  }
  const port = {
    beat: applyBeat,
    log: logLine,
    // every sequence ends with the screen showing exactly what the rules hold
    reconcile() { view = null; if (ui && st) renderUi(); },
  };

  // The encounter's place decides its setting (indoors / outdoors), its
  // backdrop and the lines that describe it, not the species: a foe placed
  // on a map may carry its own intro/settle/bg (tools/validate.mjs requires
  // that when the place differs from the creature's usual setting).
  const INDOOR_BG = { mill: 1, archive: 1, kiln: 1, observatory: 1, belltower: 1 };
  const OUTDOOR_BG = { reedwake: 1, saltglass: 1, cinder: 1, snowbell: 1, lanternfall: 1 }; // 'still', 'atlas': open, dreamlike
  function placeEnemy(e, opts) {
    const W = RB.world.W, where = opts.where || null;
    const m = W && W.map && where && W.map.id === where.map ? W.map : null;
    e.where = where;
    e.setting = m ? (RB.render.enclosed(m) ? 'indoor' : 'outdoor') : null;
    const place = opts.place || {};
    for (const k of ['intro', 'settle', 'introWho', 'settleWho', 'bg']) if (place[k] != null) e[k] = place[k];
    let bg = e.bg || e.region || 'reedwake';
    // never an interior backdrop out of doors, or open sky inside
    if (e.setting === 'outdoor' && INDOOR_BG[bg]) bg = OUTDOOR_BG[e.region] ? e.region : 'reedwake';
    if (e.setting === 'indoor' && OUTDOOR_BG[bg] && !place.bg) console.warn('outdoor backdrop indoors', e.id, where && where.map);
    e.bgKey = bg;
  }
  async function start(enemyId, opts) {
    opts = opts || {};
    if (RB.test && RB.test.auto) return RB.test.battle(enemyId);
    const s = RB.game.s;
    enemy = Object.assign({ id: enemyId }, RB.content.enemies[enemyId] || {});
    if (!RB.content.enemies[enemyId]) console.warn('missing enemy', enemyId);
    placeEnemy(enemy, opts);
    RB.game.pushMode('combat');
    const prevSong = RB.audio && RB.audio.currentSong();
    RB.audio && RB.audio.playSong(enemy.music || (enemy.boss ? 'boss' : 'battle'));
    await RB.ui.fade(true, 200);
    RB.render.setOverride(draw);
    st = L().init(enemy, s, opts);
    st.noFlee = !!opts.noFlee || !!enemy.boss;
    showIntentEn = false;
    const H = RB.combatHelp;
    newWords = new Set(s.words.filter((w) => !H.seen(s, 'word:' + w)));
    shownWords = new Set();
    H.attach(helpFor);
    ui = buildUi();
    view = null; sealHeld = null; curCard = null; phase = 'intro'; logFresh = true;
    amb.v = null; Object.assign(cost, { n: 0, sum: 0, max: 0, seqN: 0, seqSum: 0, seqMax: 0 });
    RB.battleStage.begin({
      enemy, overlay: ui.root, view: V, hasComp: () => !!(st && st.compId),
      looks: () => ({ pc: RB.equip.look(RB.game.s), comp: st && st.compId && RB.content.chars[st.compId] ? RB.content.chars[st.compId].look : null }),
    });
    RB.battleSeq.attach(port);
    measure();
    await RB.ui.fade(false, 200);
    let outcome = null;
    try {
      if (enemy.intro) await say(tierOf(enemy.intro) || enemy.intro, enemy.introWho);
      RB.ui.dialogue.hide();
      while (!outcome) {
        if (st.phaseChanged) {
          const ph = st.phaseChanged;
          if (ph.line) { await say(tierOf(ph.line) || ph.line, ph.who); RB.ui.dialogue.hide(); }
          if (ph.teach) {
            await RB.challenge.teachCard({ title: 'Something has changed', en: ph.teach.en, jp: ph.teach.jp });
            // the authored note has just explained the move now telegraphed
            RB.combatHelp.mark(s, 'intent:' + st.intent.kind);
          }
          st.phaseChanged = null;
        }
        phase = 'choose';
        renderUi();
        RB.audio && RB.audio.sfx('enemy_intent', { vol: 0.5 });
        st.assistedRound = false;
        const card = await pickCard();
        if (card.kind === 'flee') {
          const r = await RB.ui.confirm('Step back from this encounter? Nothing is lost; you can return whenever you like.', ['Step back', 'Stay']);
          if (r === 0) { outcome = 'flee'; break; }
          continue;
        }
        ui.resp.innerHTML = '';
        curCard = card;
        phase = 'challenge';
        const step = stepFor(card);
        const res = await RB.challenge.runStep(step, {
          header: situationHtml(card),
          allowCancel: true, cancelLabel: 'Choose a different response', ctxTag: 'battle:' + enemyId,
        });
        if (res.cancelled) continue;
        if (st.assistedRound) res.assisted = true;
        // The rules resolve the exchange (once); the screen then shows it beat by beat.
        const hb = st.harmony;
        const before = snapshot(st);
        const { fx, countered } = L().playerAct(st, card, res, enemy);
        if (st.compId && st.harmony > hb) fx.push({ t: 'harmony', n: st.harmony, max: st.harmonyMax });
        const won = st.knots <= 0;
        await playPlayer(card, fx, before, won);
        if (won) { outcome = 'win'; break; }
        const it = st.intent, blockedByWard = fx.some((f) => f.t === 'ward' && f.block);
        const before2 = snapshot(st);
        const efx = L().enemyAct(st, countered);
        await playEnemy(it, efx, before2, blockedByWard);
        sealHeld = null;
        L().endRound(st, enemy);
        if (st.log.length && st.log[st.log.length - 1].t === 'revive') {
          st.log.pop();
          await playRevive();
        }
        if (st.over) outcome = st.over;
      }
      if (outcome === 'win') {
        phase = 'outro';
        RB.audio && RB.audio.playSong('victory');
        if (enemy.settle) { await say(tierOf(enemy.settle) || enemy.settle, enemy.settleWho); RB.ui.dialogue.hide(); }
        if (enemy.reward) {
          for (const k in enemy.reward.items || {}) { RB.state.give(s, k, enemy.reward.items[k]); const it = RB.content.items[k]; if (it) await RB.ui.toast({ kind: 'item', jp: it.name.jp, en: it.name.en }); }
          for (const wd of enemy.reward.words || []) if (s.words.indexOf(wd) < 0) { s.words.push(wd); const W = RB.content.words[wd]; if (W) await RB.ui.toast({ kind: 'word', jp: W.jp, en: W.en }); }
        }
        s.vars.battlesWon = (s.vars.battlesWon || 0) + 1;
      }
    } finally {
      // the presentation ends first: any unfinished sequence is settled, its input hook released
      RB.battleSeq.detach();
      view = null; sealHeld = null; curCard = null; phase = 'idle';
      // Resolve recovers after every encounter: no attrition grinding.
      s.resolve.pc = s.resolve.max;
      s.resolve.comp = s.resolve.max;
      for (const w of shownWords) RB.combatHelp.mark(s, 'word:' + w);
      RB.combatHelp.detach();
      if (ui) { window.removeEventListener('resize', ui.onResize); if (ui.ro) ui.ro.disconnect(); ui.root.remove(); }
      ui = null; stageCss = null;
      await RB.ui.fade(true, 200);
      RB.render.setOverride(null);
      RB.battleStage.end();
      RB.game.popMode('combat');
      await RB.ui.fade(false, 200);
      const m = RB.world.W.map;
      if (m && m.def.music) RB.audio && RB.audio.playSong(typeof m.def.music === 'string' ? m.def.music : (m.def.music.find((x) => !x.if || RB.state.test(s, x.if)) || {}).id);
      else if (prevSong) RB.audio && RB.audio.playSong(prevSong);
      st = null;
    }
    return outcome;
  }
  // refresh(): redraw the overlay from the current state (tests, tools)
  // context(): where the current encounter happens (tests, tools)
  // phase(): 'idle' | 'intro' | 'choose' | 'challenge' | 'player' | 'enemy' | 'revive' | 'finish' | 'outro'
  // shown(): the state as currently displayed (one beat behind the rules during a sequence)
  // debug(): sequencer and stage counters, the sequence trace and frame cost (tests, tuning)
  function debug() {
    return {
      phase, seq: RB.battleSeq.stats(), stage: RB.battleStage.stats(), trace: RB.battleSeq.trace(),
      frames: { n: cost.n, avg: cost.n ? +(cost.sum / cost.n).toFixed(3) : 0, max: +cost.max.toFixed(3), seqN: cost.seqN, seqAvg: cost.seqN ? +(cost.seqSum / cost.seqN).toFixed(3) : 0, seqMax: +cost.seqMax.toFixed(3) },
    };
  }
  return {
    start, state: () => st, refresh: () => { if (st && ui) renderUi(); }, context: () => enemy && st ? { id: enemy.id, where: enemy.where, setting: enemy.setting, bg: enemy.bgKey, intro: enemy.intro, settle: enemy.settle } : null,
    phase: () => phase, shown: () => (st ? snapshot(V()) : null), debug,
  };
})();
