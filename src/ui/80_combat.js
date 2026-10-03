/* Inkweaving — presentation and exchange loop. Logic lives in
 * RB.combatLogic; this file draws the arena, the telegraphed intents,
 * response cards, runs the language step for the chosen response, and (with
 * a companion) the companion's support turn.
 *
 * A round: you choose a response (and, with several creatures, whom it acts
 * on), then do its ONE language step. With a companion the response is then
 * queued while your companion chooses a support action (a menu; "Back to
 * you" returns to your choice at no cost). Then the exchange resolves: your
 * response, your companion's action, and each creature in turn. Nothing is
 * timed; no creature acts while you read, write or choose.
 *
 * Targeting (several creatures): the current target has a small ink bracket
 * at its feet and a marked slip; press a creature (on the stage or its slip),
 * or use the arrow keys on the slips, or [ and ], to change it. Hovering or
 * focusing a response previews whom it would reach (every creature it
 * reaches, every ally it acts on); the preview stays while its step is open
 * and clears if you choose a different response. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.combat = (function () {
  'use strict';
  const esc = RB.util.esc;
  const L = () => RB.combatLogic;
  // st: the rules' state; enemy: the lead creature (placement, rewards, lines);
  // members: every creature of the encounter by the rules' index (the lead first)
  let st = null, enemy = null, ui = null, members = [];
  // What the screen shows lags the rules by one beat: the rules apply a whole
  // exchange at once, and `view` (a copy of the state from before it) steps
  // forward as each result is shown (RB.battleSeq). null = show `st` itself.
  // `chain`: several sequences in a row share one displayed state.
  let view = null, phase = 'idle', sealHeld = null, curCard = null, chain = false;
  const V = () => view || st;
  const snapshot = (x) => L().snapshot(x);
  const isGroup = () => !!(st && st.foes.length > 1);
  // targeting marks: `hover` (a card under the pointer or focus), `lock` (the
  // response whose step is open, kept until it resolves or you back out)
  const tg = { hover: null, lock: null };
  // a card focused from the keyboard previews; one focused for you (the first
  // card, when the choice opens) does not until you move
  let keyAt = -1e9, kbEl = null;
  if (typeof document !== 'undefined') {
    document.addEventListener('keydown', () => { keyAt = performance.now(); }, true);
    document.addEventListener('pointerdown', () => { keyAt = -1e9; }, true);
  }
  const byKeys = () => performance.now() - keyAt < 500;

  // ---- the scene, framed inside the stage: the free area the overlay leaves ----
  // Drawn at art resolution (2 art px per logical px): the regional backdrop
  // (RB.battleScene), then the stage (RB.battleStage: the creatures, knots,
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
  // The scene keeps one cadence (battle addendum §9.4): the ambient clock (the backdrop's drifting
  // motes, the creatures' idle, their lingering effects) runs at its authored rate in every phase,
  // so nothing slows when the opening lines close and the decision begins. While you choose a
  // response or your companion's support the party stands ready; only while the language task is
  // open (reading, writing) do the adventurers take their quieter calm stance.
  const calmNow = () => phase === 'challenge';
  const amb = { v: null, last: null };
  function ambient(t) {
    if (amb.v == null) { amb.v = t; amb.last = t; }
    // a continuous clock: a long gap (a hidden tab) does not jump the idle forward
    amb.v += Math.max(0, Math.min(100, t - amb.last));
    amb.last = t;
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
    Sc.backdrop(c, enemy.bgKey || enemy.bg || enemy.region || 'reedwake', w, h, hz, tt, reduce, lay ? {
      S, ex: lay.ex, ey: lay.ey, ext: lay.ext, px: lay.px, py: lay.py, ps: lay.ps, scale: lay.scale, art: enemy.art, party: lay.party,
      creatures: lay.foes.length > 1 ? lay.foes.map((f, i) => ({ ex: f.ex, ey: f.ey, ext: f.ext, art: (members[i] || enemy).art, artOpts: (members[i] || enemy).artOpts })) : null,
    } : null);
    if (lay) {
      // the frame loop must survive anything the presentation does wrong
      try { RB.battleStage.draw(c, w, h, { t, pt, amb: tt, view: V(), reduce, calm: calmNow(), Sr: S, lay, stageCss, sealHeld }); }
      catch (err) { if (!draw.failed) console.error('battle stage', err); draw.failed = true; }
      // the creatures' rest boxes (page px): every frame while a target can be pressed; for the
      // badges only when the layout may have changed (a new layout, a resize, a scroll), at most
      // every 300 ms otherwise — never a per-frame cost during a sequence
      const wantHits = canTarget(), wantBadges = badgesDue(t);
      const hs = stageCss && RB.battleStage.active() && (wantHits || wantBadges) ? RB.battleStage.stats().hits || [] : [];
      placeHits(hs);
      if (wantBadges) placeBadges(hs);
    }
    const dt = performance.now() - t0;
    cost.n++; cost.sum += dt; cost.max = Math.max(cost.max, dt);
    if (RB.battleSeq.busy()) { cost.seqN++; cost.seqSum += dt; cost.seqMax = Math.max(cost.seqMax, dt); }
  }
  draw.art = true;
  function tierOf(obj) {
    return RB.activities.tier(obj);
  }
  const nameOf = (i) => (members[i] || enemy).name || { en: '?', jp: '?' };
  // An instance mark where names repeat (battle addendum §13.1): two Ink Wisps are "A" and "B" in
  // formation order, left to right (the stage's slots, fixed for the encounter); the slip, the
  // badge, the telegraph, the response cards and the banner all carry it.
  function markOf(i) {
    if (!st || st.foes.length < 2) return '';
    const en = nameOf(i).en;
    const same = st.foes.map((_, k) => k).filter((k) => nameOf(k).en === en);
    if (same.length < 2) return '';
    const lay = RB.battleStage.lay();
    const slot = (k) => (lay && lay.foes && lay.foes[k] && lay.foes[k].slot != null ? lay.foes[k].slot : [1, 0, 2][k]);
    same.sort((a, b) => slot(a) - slot(b));
    return 'ABCD'[same.indexOf(i)] || '';
  }
  const nameEn = (i) => nameOf(i).en + (markOf(i) ? ' ' + markOf(i) : '');
  const markHtml = (i) => (markOf(i) ? ' <span class="ib-m">' + markOf(i) + '</span>' : '');
  // the creature's name as a short English label ("the Moth"), for card targets and lines
  const shortEn = (i) => { const n = nameOf(i).en || ''; const w = n.split(' '); return w[w.length - 1] + (markOf(i) ? ' ' + markOf(i) : ''); };
  function linePool(it) {
    const s = RB.game.s, prof = s.learn.profile;
    let pool;
    if (it.text) pool = [].concat(tierOf(it.text) || []);
    else {
      const T = RB.content.intentText[it.kind];
      pool = T ? [].concat(T[prof] || T.F || []) : [];
    }
    return pool;
  }
  // the line chosen when a move is telegraphed stays put for the whole exchange
  // (one choice per creature's telegraph)
  const linePicks = new WeakMap();
  function intentLine(it, i) {
    const s = RB.game.s;
    const solo = !s.comp;
    const pool = linePool(it);
    if (!pool.length) return { jp: '', en: moveLabel(it) };
    let cands = pool;
    if (solo || it.target === 'both') cands = pool.filter((x) => !x.neg);
    if (!cands.length) cands = pool;
    const f = st.foes[i] || st.foes[0];
    if (!linePicks.has(it)) linePicks.set(it, (st.round + f.knots + (i || 0) * 3) % cands.length);
    const pick = cands[linePicks.get(it) % cands.length];
    const nm = { pc: s.player.nameJp || s.player.name, comp: s.comp ? RB.jp.plain(RB.content.chars[s.comp].name.jp) : '' };
    const nmEn = { pc: s.player.name, comp: s.comp ? RB.content.chars[s.comp].name.en : '' };
    const tgt = it.target === 'comp' ? 'comp' : 'pc';
    const other = tgt === 'pc' ? 'comp' : 'pc';
    return {
      jp: pick.jp, en: (pick.en || '').replace(/\$tgtEn/g, nmEn[tgt]).replace(/\$otherEn/g, nmEn[other]),
      vars: { tgt: nm[tgt], other: nm[other] }, neg: !!pick.neg,
    };
  }

  // ---- the overlay: foe slip(s), telegraph card, stage, party, response dock ----
  const I = (n, t) => RB.learnUi.icon(n, t);
  const INTENT_ICON = { strike: 'strike', sweep: 'sweep', heat: 'flame', shroud: 'cloud', charge: 'hourglass', gust: 'gust', mend: 'needle', lie: 'mask', plea: 'history', rest: 'rest', flood: 'waves', chill: 'snow', silence: 'mute', mirror: 'mirror' };
  const TAG_ICON = [['ward', 'shield'], ['water', 'drop'], ['light', 'sun'], ['heal', 'leaf'], ['wind', 'wind'], ['bind', 'rope'], ['anchor', 'stone'], ['stone', 'stone'], ['fire', 'flame'], ['warm', 'flame'], ['bell', 'bell'], ['voice', 'sound']];
  // plain attacks whose target the translated telegraph names outright
  const AIMED = { strike: 1, sweep: 1, gust: 1, flood: 1, chill: 1 };
  // Reading-critical moves (battle addendum §13.3), an authored rule by kind: reading what the
  // creature says is the task itself, so its wording stays on screen (never only behind a badge)
  // and the move is named and marked neutrally — "False promise" or a mask would answer the
  // question it asks. The explicitly opened help note still explains the mechanic.
  const READING = { lie: { en: 'A promise', icon: 'note' }, mirror: { en: 'Your words, echoed', icon: 'note' }, plea: {} };
  const moveLabel = (it) => (it && READING[it.kind] && READING[it.kind].en) || (it && it.label) || '';
  const moveIcon = (it) => (it && READING[it.kind] && READING[it.kind].icon) || INTENT_ICON[it && it.kind] || 'strike';
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
    const root = RB.ui.el('div', 'combat-ui' + (isGroup() ? ' cb-group' : ''));
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

      '<section class="bars cb-party" aria-label="Your party"></section>' +
      // Skip (battle addendum §14.5): settles the rest of this exchange; shown only while one plays
      '<button type="button" class="cbtn cb-skip" hidden>' + I('next') + '<span>Skip</span></button>';
    // Beneath every other layer: the dialogue sheet usually exists before the
    // battle, and an overlay appended after it would sit on top of its buttons.
    RB.ui.root.insertBefore(root, RB.ui.root.firstChild);
    const q = (x) => root.querySelector(x);
    const o = { root, foe: q('.cb-foe'), intent: q('.intent'), stage: q('.cb-stage'), hits: q('.cb-stage'), bars: q('.bars'), dock: q('.cb-dock'), dockH: q('.cb-dock-h'), resp: q('.responses'), log: q('.clog'), coach: q('.cb-coachbox'), skip: q('.cb-skip'), party: q('.cb-party') };
    // a fresh press only (the one that committed the answer cannot also skip): it is shown a moment
    // after the exchange starts, and pressing it settles the exchange, nothing else
    o.skip.addEventListener('click', (e) => { e.stopPropagation(); if (!o.skip.hidden && performance.now() - (o.skipAt || 0) > 150) RB.battleSeq.skip(); });
    RB.learnUi.guardTaps(o.resp);
    // which presses are fresh (battle addendum §14.5–§14.6): when the pointer last went down, and
    // whether an activating key is held (since when, and repeating)
    o.press = { ptr: -1, key: null };
    o.onPress = (e) => {
      if (e.type === 'pointerdown') { o.press.ptr = performance.now(); return; }
      if (e.key !== 'Enter' && e.key !== ' ') return;
      if (e.type === 'keydown') o.press.key = { at: e.repeat && o.press.key ? o.press.key.at : performance.now(), repeat: e.repeat, up: null };
      else if (o.press.key) o.press.key.up = performance.now();
    };
    for (const t of ['pointerdown', 'keydown', 'keyup']) document.addEventListener(t, o.onPress, true);
    o.onResize = () => requestAnimationFrame(measure);
    o.onHold = () => { if (acting) hold(true); };
    window.addEventListener('resize', o.onHold);
    window.addEventListener('resize', o.onResize);
    root.addEventListener('scroll', o.onResize, { passive: true });
    o.ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(o.onResize) : null;
    if (o.ro) o.ro.observe(o.stage);
    // choosing a target: its slip (click, tap, arrows) or the creature itself on the stage
    o.foe.addEventListener('click', (e) => {
      const b = e.target.closest('[data-foe]');
      if (b && canTarget()) { selectTarget(+b.getAttribute('data-foe'), true); }
    });
    o.hits.addEventListener('click', (e) => {
      const b = e.target.closest('[data-foe]');
      if (!b || !canTarget()) return;
      // where the boxes overlap, the creature in front (nearest the pointer) is the one pressed
      const i = RB.battleStage.foeAt(e.clientX, e.clientY);
      selectTarget(i >= 0 ? i : +b.getAttribute('data-foe'), false);
    });
    o.onKey = (e) => {
      if (!canTarget() || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      const tgEl = e.target;
      if (tgEl && (tgEl.tagName === 'INPUT' || tgEl.tagName === 'TEXTAREA' || tgEl.isContentEditable)) return;
      if (e.key === '[' || e.key === ']') { e.preventDefault(); stepTarget(e.key === ']' ? 1 : -1, !!(document.activeElement && document.activeElement.closest && document.activeElement.closest('.cb-foe'))); }
    };
    document.addEventListener('keydown', o.onKey);
    return o;
  }
  let showIntentEn = false;
  function enShown() { return RB.game.s.learn.profile === 'F' || showIntentEn; }
  // Translate: the creatures' lines in English from now on in this encounter (counts as assisted)
  function translate() { showIntentEn = true; if (st) st.assistedRound = true; renderUi(); }
  // A keyword: a button that explains itself (RB.combatHelp) on hover, focus or tap.
  const kw = (key, cls, inner, sr) => '<button type="button" class="kw ' + cls + '" data-kw="' + key + '" aria-expanded="false" aria-controls="kwcard">' + inner +
    '<span class="sr">' + esc(sr || ' — what this means') + '</span></button>';
  // the small "explain" mark on a keyword (shape, not colour alone)
  const Q = () => '<span class="kw-q" aria-hidden="true">' + I('help') + '</span>';
  // States in play, shown as keywords on the foe's slip beside its knots
  // (wards are on the party slip).
  const STATUS_ICON = { heat: 'flame', shroud: 'cloud', charge: 'hourglass', silence: 'mute', 'ward:pc': 'shield', 'ward:comp': 'shield' };
  const fv = (i) => { const v = V(); return v.foes ? v.foes[i == null ? v.cur : i] : v; };
  function statusList(i) {
    const out = [], v = V(), f = fv(i);
    if (f.heat) out.push({ key: 'heat', label: 'Heat ' + f.heat });
    if (f.shroud) out.push({ key: 'shroud', label: 'Shrouded' });
    if (f.charged) out.push({ key: 'charge', label: 'Gathering' });
    if (v.silenced) out.push({ key: 'silence', label: 'Hushed' });
    return out;
  }
  // a key with the creature it concerns (a group: 'heat:1'; one creature: 'heat')
  const kkey = (k, i) => (isGroup() ? k + ':' + i : k);
  function gistOf(i, it) {
    return L().withFoe(st, i, () => RB.combatHelp.gist(st, it));
  }
  // The telegraph of creature i (default: the target). compact: on the task slip.
  function intentHtml(compact, i) {
    if (i == null) i = st.cur;
    const it = st.foes[i].intent;
    const line = intentLine(it, i);
    const g = gistOf(i, it);
    const face = I(moveIcon(it)) + '<span class="k">' + esc(moveLabel(it)) + '</span>' + (g ? '<span class="gist">' + esc(g) + '</span>' : '');
    // (the task slip carries the states as plain text; on screen they are on the foe's slip)
    const states = compact ? statusList(i) : [];
    let h = '<div class="it-label">' + (compact ? '<span class="it-kind">' + face + '</span>' : kw(kkey('intent', i), 'it-kind', face + Q())) +
      states.map((x) => '<span class="st">' + esc(x.label) + '</span>').join('') + '</div>';
    if (line.jp) h += '<div class="it-jp">' + RB.ui.jhtml(line.jp, { vars: line.vars }) + '</div>';
    if (line.en) h += enShown() ? '<div class="it-en">' + esc(line.en) + '</div>' : (compact ? '' : '<button class="pbtn quiet tr" data-tr title="Show the English (counts as assisted)">' + I('note') + '<span>Translate <span class="aside">(assisted)</span></span></button>');
    const nx = st.foes[i].nextIntents || [];
    if (!compact && RB.game.s.comp === 'nao' && nx.length) h += '<div class="it-next">' + I('companion') + '<span>Nao: “After that — ' + esc(nx.map(moveLabel).join(', then ')) + '.”</span></div>';
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
    const parts = key.split(':');
    const idx = parts.length > 1 && /^\d+$/.test(parts[parts.length - 1]) ? +parts.pop() : null;
    const k = parts.join(':');
    const who = idx != null ? idx : st.cur;
    const title = (t) => (isGroup() ? esc(nameOf(who).en) + ': ' : '') + t;
    if (k === 'intent') {
      const it = st.foes[who].intent;
      const i = L().withFoe(st, who, () => H.intentInfo(st, it, ws));
      return { icon: INTENT_ICON[it.kind] || 'strike', title: title(esc(i.title)), body: p(i.what) + ans(i.answer) + (isGroup() ? p(H.groupNote()) : '') };
    }
    if (k === 'harmony') {
      if (!st.compId) return null;
      const h = H.harmonyInfo(V());
      return { icon: 'join', title: h.title, body: '<p class="kw-now">' + h.now + '</p><p><b>How it fills:</b> ' + h.fills + '</p><p><b>When it is full:</b> ' + h.offers + '</p><p>' + h.more + '</p>' };
    }
    if (k === 'target') return { icon: 'aim', title: 'Choosing whom you act on', body: p(H.groupNote()) };
    const v = V();
    const i = L().withFoe(v, who, () => H.statusInfo(v, k, ws, { pc: esc(s.player.name), comp: esc(compName()) }));
    if (!i) return null;
    return { icon: STATUS_ICON[k], title: k.startsWith('ward') || k === 'silence' ? i.title : title(i.title), body: p(i.what) + ans(i.answer) };
  }
  function knotsHtml(i) {
    let h = '';
    const f = fv(i);
    for (let j = 0; j < f.maxKnots; j++) h += '<span class="kn' + (j < f.knots ? ' tied' : '') + '"></span>';
    return '<span class="knots" role="img" aria-label="Knots still tied: ' + f.knots + ' of ' + f.maxKnots + '">' + h + '</span><span class="kn-t">' + f.knots + ' / ' + f.maxKnots + ' knots</span>';
  }
  // ---- the creatures' slips (a group): one per creature, a radio each; the
  // target's is marked with an ink bracket; its move (icon, name, gist) is on it
  function slipsHtml() {
    const v = V();
    const lay = RB.battleStage.lay();
    const order = lay && lay.visual && lay.visual.length === st.foes.length ? lay.visual : st.foes.map((_, i) => i);
    const can = canTarget();
    let h = '';
    for (const i of order) {
      const f = v.foes[i], down = f.knots <= 0 || st.foes[i].settled;
      const on = i === curTarget() && !down;
      const it = st.foes[i].intent;
      const g = !down && it ? gistOf(i, it) : '';
      const pv = previewFoes().indexOf(i) >= 0 && !down;
      const states = down ? [] : statusList(i).filter((x) => x.key !== 'silence');
      const label = esc(nameEn(i)) + (down ? ', settled' : ', ' + f.knots + ' of ' + f.maxKnots + ' knots' + (it ? ', about to ' + moveLabel(it) + (g ? ': ' + g : '') : '') + (states.length ? ', ' + states.map((x) => x.label).join(', ') : ''));
      h += '<button type="button" class="fs' + (on ? ' on' : '') + (pv ? ' cb-pv' : '') + (down ? ' down' : '') + '" role="radio" data-foe="' + i + '" aria-checked="' + on + '"' +
        (down ? ' aria-disabled="true"' : '') + ' tabindex="' + (on ? 0 : -1) + '" aria-label="' + label + '"' + (can ? '' : ' data-locked="1"') + '>' +
        '<span class="fs-mark" aria-hidden="true"></span>' +
        '<span class="fs-n" aria-hidden="true">' + RB.ui.jhtml(nameOf(i).jp) + ' <span class="en">' + esc(nameOf(i).en) + '</span>' + markHtml(i) + '</span>' +
        '<span class="fs-l2" aria-hidden="true"><span class="fs-k">' + (down ? '<span class="fs-done">' + I('done') + 'Settled</span>' : knotsHtml(i)) + '</span>' +
        (down || !it ? '' : '<span class="fs-it">' + I(moveIcon(it)) + '<span class="k">' + esc(moveLabel(it)) + '</span>' + (g ? '<span class="gist">' + esc(g) + '</span>' : '') + '</span>') + '</span>' +
        (states.length ? '<span class="fs-st" aria-hidden="true">' + states.map((x) => '<span class="pill">' + I(STATUS_ICON[x.key]) + esc(x.label) + '</span>').join('') + '</span>' : '') +
        '</button>';
    }
    return '<span class="fs-h" id="cb-tgt-h">' + I('aim') + '<span>' + (can ? 'Target' : 'Creatures') + '</span>' + kw('target', 'fs-help', Q(), ' — how to choose whom you act on') + '</span>' +
      '<div class="fs-row" role="radiogroup" aria-labelledby="cb-tgt-h" style="--n:' + order.length + '">' + h + '</div>';
  }
  function renderUi() {
    const s = RB.game.s;
    const T = curTarget();
    const it = st.foes[T].intent;
    const group = isGroup();
    if (group) {
      const keep = document.activeElement && ui.foe.contains(document.activeElement);
      ui.foe.innerHTML = slipsHtml();
      ui.foe.classList.add('group');
      if (keep) { const on = ui.foe.querySelector('.fs.on') || ui.foe.querySelector('.fs:not(.down)'); if (on) on.focus({ preventScroll: true }); }
    } else {
      const states = statusList(T);
      ui.foe.classList.remove('group');
      ui.foe.innerHTML = '<div class="fplate solo" data-foe="' + T + '"><span class="foe-n">' + RB.ui.jhtml(enemy.name.jp) + ' <span class="en">' + esc(enemy.name.en) + '</span></span>' +
        '<span class="foe-k' + (states.length ? ' has-st' : '') + '">' + knotsHtml(T) + (states.length ? '<span class="it-states" role="group" aria-label="Its state">' +
          states.map((x) => kw(x.key, 'st', '<span class="pill">' + I(STATUS_ICON[x.key]) + esc(x.label) + '</span>')).join('') + '</span>' : '') + '</span></div>';
    }
    // the telegraph panel, by intent display (battle addendum §13.3, §13.6). Adaptive: a routine move
    // is its creature's badge (symbol and strength; its words, what it does and the translation in the
    // badge's card), so the panel holds only the passages whose reading is the task (READING: a
    // promise, a mirror, a plea), each named — no such passage hides behind a badge; with none, the
    // panel is not there at all. A move met for the first time also gets the coach's note. Expanded:
    // the target's telegraph in full and every other creature's, while you decide.
    const expanded = RB.game.settings.intentDisplay === 'expanded';
    const standingNow = L().standing(st);
    const readsOf = (order) => order.filter((i) => standingNow.indexOf(i) >= 0 && st.foes[i].intent && READING[st.foes[i].intent.kind]);
    let ih = '', blocks = 0;
    if (group) {
      const block = (i, tag) => {
        const sts = statusList(i).filter((x) => x.key !== 'silence');
        return '<div class="it-block' + (i === T ? ' it-target' : ' it-other') + '" data-foe="' + i + '"><div class="it-who">' + (i === T ? I('aim') : '') + '<span>' + RB.ui.jhtml(nameOf(i).jp) + ' <span class="en">' + esc(nameOf(i).en) + '</span>' + markHtml(i) + '</span>' +
          (tag ? '<span class="it-tag">' + tag + '</span>' : '') +
          (sts.length ? '<span class="it-states" role="group" aria-label="Its state">' + sts.map((x) => kw(kkey(x.key, i), 'st', '<span class="pill">' + I(STATUS_ICON[x.key]) + esc(x.label) + '</span>')).join('') + '</span>' : '') + '</div>' + intentHtml(false, i) + '</div>';
      };
      const lay = RB.battleStage.lay();
      const order = lay && lay.visual && lay.visual.length === st.foes.length ? lay.visual : st.foes.map((_, k) => k);
      if (expanded) {
        ih += block(T, ''); blocks++;
        for (const i of order) {
          if (i === T || standingNow.indexOf(i) < 0 || !st.foes[i].intent) continue;
          ih += block(i, READING[st.foes[i].intent.kind] ? 'Also to read' : ''); blocks++;
        }
      } else for (const i of readsOf(order)) { ih += block(i, 'To read'); blocks++; }
    } else if (expanded || readsOf([T]).length) { ih = intentHtml(false, T); blocks = 1; }
    ui.intent.innerHTML = ih;
    ui.intent.classList.toggle('it-none', !blocks);
    ui.intent.classList.toggle('it-multi', blocks > 1);
    ui.intent.setAttribute('aria-label', group ? 'What they are about to do' : 'What it is about to do');
    for (const tr of ui.intent.querySelectorAll('[data-tr]')) tr.onclick = translate;
    syncBadges();
    // (the plates were just rebuilt: put them back over their creatures)
    RB.battleIntents.relayout();
    // the party: resolve (numbers and bar) and wards; Harmony is its own band
    // above them (not a third resolve bar). The telegraph's target is marked
    // once its meaning is on screen (never before).
    const aimed = [];
    if (enShown()) for (const i of L().standing(st)) { if (group && i !== T) continue; const x = st.foes[i].intent; if (x && AIMED[x.kind]) for (const w of (x.target === 'both' ? ['pc', 'comp'] : [L().withFoe(st, i, () => L().aimOf(st, x))])) if (aimed.indexOf(w) < 0) aimed.push(w); }
    const pvA = previewAllies();
    const member = (who, name, v, max, ward) => '<div class="pm' + (aimed.indexOf(who) >= 0 ? ' aimed' : '') + (pvA.indexOf(who) >= 0 ? ' cb-pv' : '') + '">' +
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
  // The party's permanent status, compact, for surfaces that cover the battle (the language task):
  // names, Resolve as numbers and bars, Harmony as pips — the values the rules hold now.
  function statusInset() {
    const s = RB.game.s, v = V();
    const one = (name, val, max) => '<span class="cs-m"><span class="cs-n">' + esc(name) + '</span><span class="bar" role="meter" aria-label="' + esc(name) + ' resolve" aria-valuemin="0" aria-valuemax="' + max + '" aria-valuenow="' + val + '"><i style="width:' + Math.round((100 * val) / max) + '%"></i></span><span class="cs-v"><span class="sr">Resolve </span>' + val + '/' + max + '</span></span>';
    let h = one(s.player.name, v.pc, v.max) + (s.comp && st.compId ? one(compName(), v.comp, v.max) : '');
    if (s.comp && st.compId) { let pips = ''; for (let i = 0; i < v.harmonyMax; i++) pips += '<i class="hp' + (i < v.harmony ? ' on' : '') + '"></i>'; h += '<span class="cs-h" aria-label="Harmony ' + v.harmony + ' of ' + v.harmonyMax + '">' + I('join') + '<span class="hm-pips" aria-hidden="true">' + pips + '</span></span>'; }
    return h;
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

  // ---- targets and previews ----------------------------------------------------------------------
  const canTarget = () => isGroup() && (phase === 'choose' || phase === 'companion');
  // whom the next choice acts on: your target, or your companion's while they choose
  const curTarget = () => (phase === 'companion' && tg.compTarget != null && st.foes[tg.compTarget] ? tg.compTarget : st.cur);
  const previewNow = () => (phase === 'choose' || phase === 'challenge' || phase === 'companion' ? tg.hover || tg.lock : null);
  const previewFoes = () => { const p = previewNow(); return p ? p.foes || [] : []; };
  const previewAllies = () => { const p = previewNow(); return p ? p.allies || [] : []; };
  // what the stage marks this frame: the target (a group, while choosing) and the preview
  function marks() {
    if (!st) return null;
    const show = phase === 'choose' || phase === 'challenge' || phase === 'companion';
    return { target: show && isGroup() ? (phase === 'companion' && tg.compTarget != null ? tg.compTarget : st.cur) : null, preview: show ? previewNow() : null };
  }
  // whom a response card reaches, for the marks and the label on the card
  function reachOf(c) { return L().reachOf(st, c); }
  const nWord = (n) => (n === 2 ? 'both' : n === 3 ? 'all three' : 'all ' + n);
  function reachLabel(c, r) {
    const group = isGroup(), up = L().standing(st).length;
    const ally = (a) => (a === 'comp' ? compName() : 'you');
    if (c.kind === 'word' && (c.word.tags || []).indexOf('ward') >= 0) return 'on ' + ally(c.target);
    if (!group) return '';
    if (r.foes.length > 1) return 'on ' + nWord(r.foes.length) + (r.allies.length ? ' · you both' : '');
    if (r.foes.length === 1) return 'on the ' + shortEn(r.foes[0]);
    if (r.party) return 'guards you both';
    if (r.allies.length > 1) return 'on you both';
    if (r.allies.length === 1) return 'on ' + ally(r.allies[0]);
    return '';
  }
  function refreshMarks() {
    if (!ui) return;
    const pf = previewFoes(), pa = previewAllies();
    for (const b of ui.foe.querySelectorAll('.fs')) b.classList.toggle('cb-pv', pf.indexOf(+b.getAttribute('data-foe')) >= 0 && !b.classList.contains('down'));
    const pms = ui.bars.querySelectorAll('.pm');
    if (pms[0]) pms[0].classList.toggle('cb-pv', pa.indexOf('pc') >= 0);
    if (pms[1]) pms[1].classList.toggle('cb-pv', pa.indexOf('comp') >= 0);
  }
  function setHover(r) { tg.hover = r; refreshMarks(); }
  let onTarget = null; // set while a choice is open: re-deal the cards for the new target
  function selectTarget(i, fromSlip) {
    if (!st || !canTarget()) return false;
    if (phase === 'companion') {
      if (i < 0 || st.foes[i].knots <= 0 || st.foes[i].settled) return false;
      tg.compTarget = i;
    } else if (!L().target(st, i)) return false;
    if (RB.audio) RB.audio.sfx('cursor', { vol: 0.5 });
    renderUi();
    if (onTarget) onTarget(fromSlip);
    if (fromSlip) { const b = ui.foe.querySelector('.fs[data-foe="' + i + '"]'); if (b) b.focus({ preventScroll: true }); }
    announce('Target: ' + nameOf(i).en + '.');
    return true;
  }
  // step through the standing creatures in their order across the stage
  function stepTarget(d, focusSlip) {
    const lay = RB.battleStage.lay();
    const order = (lay && lay.visual ? lay.visual : st.foes.map((_, i) => i)).filter((i) => st.foes[i].knots > 0 && !st.foes[i].settled);
    if (order.length < 2) return;
    const cur = curTarget();
    const k = order.indexOf(cur);
    selectTarget(order[(k + d + order.length) % order.length], focusSlip);
  }
  // one polite announcement for screen readers (target changes)
  function announce(msg) {
    if (!ui) return;
    let a = ui.root.querySelector('.cb-sr');
    if (!a) { a = document.createElement('div'); a.className = 'cb-sr sr'; a.setAttribute('aria-live', 'polite'); ui.root.appendChild(a); }
    a.textContent = msg;
  }
  // the pressable creatures on the stage (pointer only; the slips are the
  // accessible control): invisible boxes inside the stage cell, clipped to it,
  // so they never lie over the telegraph, the party or the responses
  let hitKey = '';
  function placeHits(hits) {
    if (!ui || !ui.hits) return;
    const on = canTarget() && !!stageCss;
    ui.hits.classList.toggle('hits-on', on);
    if (!on) { if (hitKey) { ui.hits.innerHTML = ''; hitKey = ''; } return; }
    const r = stageCss;
    const hs = (hits || []).filter((q) => !q.settled).map((q) => {
      const x0 = Math.max(q.x, r.x), y0 = Math.max(q.y, r.y), x1 = Math.min(q.x + q.w, r.x + r.w), y1 = Math.min(q.y + q.h, r.y + r.h);
      return { i: q.i, x: Math.round(x0 - r.x), y: Math.round(y0 - r.y), w: Math.round(x1 - x0), h: Math.round(y1 - y0) };
    }).filter((q) => q.w > 8 && q.h > 8);
    const key = hs.map((q) => [q.i, q.x, q.y, q.w, q.h].join(',')).join(';');
    if (key === hitKey) return;
    hitKey = key;
    ui.hits.innerHTML = hs.map((q) => '<button type="button" tabindex="-1" class="cb-hit" data-foe="' + q.i + '" style="left:' + q.x + 'px;top:' + q.y + 'px;width:' + q.w + 'px;height:' + q.h + 'px"></button>').join('');
  }

  // ---- intent badges (battle addendum §13; src/ui/82c_battle_intents.js) ----------------------
  // One per standing creature at its formation slot, from what the telegraph reveals. While an
  // exchange plays they stay quiet (no input, no open card) and show the moves as they were
  // committed: the creature acting is marked, a move your response answered shows as answered once
  // that response has played, and a creature that settles takes its badge with it.
  let badgeSnap = null, actFoe = null, shownAnswered = null, badgeGeo = '', badgeLay = null, badgeAt = -1e9, badgeCss = '';
  function badgesDue(t) {
    const L0 = RB.battleStage.lay();
    // (the stage lays the formation out every frame: its positions, not its object, say whether it moved)
    const lay = L0 ? L0.scale + ':' + L0.foes.map((f) => f.ex + ',' + f.ey).join(';') : '';
    const css = stageCss ? stageCss.x + ',' + stageCss.y + ',' + stageCss.w + ',' + stageCss.h + ',' + (ui ? ui.root.scrollTop : 0) : '';
    if (lay === badgeLay && css === badgeCss && t - badgeAt < 300) return false;
    badgeLay = lay; badgeCss = css; badgeAt = t;
    return true;
  }
  function syncBadges() {
    if (!ui || !st || !RB.battleIntents) return;
    const v = V(), items = [];
    for (let i = 0; i < st.foes.length; i++) {
      const f = v.foes ? v.foes[i] : v;
      const it = badgeSnap ? badgeSnap[i] : st.foes[i].intent;
      if (!it || !f || f.knots <= 0 || st.foes[i].settled) continue;
      const b = L().withFoe(st, i, () => L().blowOf(st, it));
      items.push({ i, mark: markOf(i), name: nameOf(i).en, icon: moveIcon(it), label: moveLabel(it), short: b && b.per ? String(b.per) : '', reading: !!READING[it.kind], answered: !!(shownAnswered && shownAnswered[i] && it.kind !== 'rest'), actor: actFoe === i });
    }
    RB.battleIntents.render(items, { quiet: acting || phase === 'challenge' || phase === 'intro' || phase === 'outro' });
  }
  // the card a badge opens: the move as telegraphed (symbol, name, the strength it states), the
  // creature's words, and what the move does; how to answer it is a note you open yourself
  function intentCardHtml(i) {
    const it = badgeSnap ? badgeSnap[i] : st.foes[i] && st.foes[i].intent;
    if (!it) return '';
    const line = intentLine(it, i);
    const g = gistOf(i, it);
    let what = '';
    if (READING[it.kind]) what = it.kind === 'plea' ? 'It is asking you something. Read what it asks.' : 'It is telling you something. Read what it says.';
    else what = L().withFoe(st, i, () => RB.combatHelp.intentInfo(st, it, words())).what;
    return '<div class="ic-k">' + I(moveIcon(it)) + '<span class="k">' + esc(moveLabel(it)) + '</span>' + (g ? '<span class="gist">' + esc(g) + '</span>' : '') + '</div>' +
      (line.jp ? '<div class="ic-jp">' + RB.ui.jhtml(line.jp, { vars: line.vars }) + '</div>' : '') +
      (line.en && enShown() ? '<div class="ic-en">' + esc(line.en) + '</div>' : '') +
      (line.en && !enShown() ? '<button type="button" class="pbtn quiet tr ic-tr" data-tr title="Show the English (counts as assisted)">' + I('note') + '<span>Translate <span class="aside">(assisted)</span></span></button>' : '') +
      (what ? '<p class="ic-what">' + what + '</p>' : '') +
      (!badgeSnap && RB.game.s.comp === 'nao' && (st.foes[i].nextIntents || []).length ? '<div class="it-next">' + I('companion') + '<span>Nao: “After that — ' + esc(st.foes[i].nextIntents.map(moveLabel).join(', then ')) + '.”</span></div>' : '') +
      '<div class="ic-f">' + kw(kkey('intent', i), 'pbtn quiet ic-more', '<span>How to answer it</span>', ' — opens a note') + '</div>';
  }
  // where each creature rests (page px) and the safe areas: the badges stay in the scene; the
  // card may use the scene's column from the top of the overlay down to the party slip
  function placeBadges(hits) {
    if (!ui || !RB.battleIntents) return;
    // no scene to sit in (a stage squeezed under 60 px): the plates go back to a row of slips that
    // carry the moves too, and the badges stand down
    ui.foe.classList.toggle('onstage', !!stageCss);
    if (!stageCss) { if (badgeGeo !== 'none') { badgeGeo = 'none'; RB.battleIntents.place([], null, null); } return; }
    const rr = ui.root.getBoundingClientRect(), pr = ui.party ? ui.party.getBoundingClientRect() : null;
    const r = stageCss;
    const rects = (hits || []).map((q) => ({ i: q.i, x: Math.round(q.x), y: Math.round(q.y), w: Math.round(q.w), settled: !!q.settled }));
    const bottom = pr && pr.height && pr.top > r.y ? Math.min(pr.top, rr.bottom) : Math.min(r.y + r.h, rr.bottom);
    const top = Math.max(rr.top, 0) + 6;
    const bounds = { x: r.x, y: r.y, w: r.w, h: Math.max(44, Math.min(r.h, bottom - r.y)) };
    const cardBounds = { x: r.x, y: top, w: r.w, h: Math.max(120, bottom - 6 - top) };
    const k = JSON.stringify([rects, bounds, cardBounds]);
    if (k === badgeGeo) return;
    badgeGeo = k;
    RB.battleIntents.place(rects, bounds, cardBounds);
  }
  // Words used in battle for the first time are marked "New" for that whole
  // encounter, with what they answer; recorded (s.tips) when it ends.
  let newWords = new Set(), shownWords = new Set();
  function cardHtml(c, i, hi) {
    const r = reachOf(c);
    const tgt = reachLabel(c, r);
    const desc = c.disabled || RB.script.enVars(c.target ? String(c.desc).replace(/\s*\([^)]*\)\s*$/, '') : c.desc);
    const fresh = c.kind === 'word' && newWords.has(c.word.id);
    const ans = fresh ? L().answers(c.word).map((k) => L().INTENTS[k].label) : [];
    const ready = c.kind === 'tech' && !c.disabled; // a technique waiting for the companion doesn't glow
    return '<button class="resp rcard' + (fresh ? ' fresh' : '') + (ready ? ' tech' : '') + '" data-i="' + i + '"' + (c.id != null ? ' data-cid="' + esc(String(c.id)) + '"' : '') + ' data-foes="' + r.foes.join(',') + '" data-allies="' + r.allies.join(',') + '"' + (c.disabled ? ' disabled' : '') + '>' +
      '<span class="ic">' + I(cardIcon(c)) + '</span>' +
      '<span class="rc-w"><span class="rc-jp">' + RB.ui.jhtml(hi && c.word && c.word.jpK ? c.word.jpK : c.jp) + '</span><span class="rc-en">' + esc(c.en) + '</span>' +
      (fresh ? '<span class="rc-new">New</span>' : '') + (ready ? '<span class="rc-new">With ' + esc(compName()) + '</span>' : '') + '</span>' +
      (tgt ? '<span class="rc-tgt' + (r.foes.length > 1 ? ' many' : '') + '">' + esc(tgt) + '</span>' : '') +
      '<span class="rc-d">' + (c.disabled ? I('warn') : '') + esc(desc) +
      (ans.length ? '<span class="rc-ans"><b>Answers:</b> ' + esc(ans.join(', ')) + (c.word.tags.indexOf('ward') >= 0 ? ' (in front of the one it aims at)' : '') + '</span>' : '') + '</span></button>';
  }
  // One short note per exchange, the first time something needs explaining:
  // several creatures, a kind of move never seen before, then a full Harmony,
  // then Harmony itself.
  function coachFor() {
    const s = RB.game.s;
    const H = RB.combatHelp;
    const it = st.intent;
    const cn = esc(compName());
    if (isGroup() && !H.seen(s, 'group')) {
      H.mark(s, 'group');
      return { icon: 'aim', title: 'More than one', body: H.groupNote(), more: 'target' };
    }
    for (const i of [st.cur].concat(L().standing(st))) {
      const x = st.foes[i].intent;
      if (x && !H.seen(s, 'intent:' + x.kind)) {
        H.mark(s, 'intent:' + x.kind);
        const inf = L().withFoe(st, i, () => H.intentInfo(st, x, words()));
        return { icon: moveIcon(x), title: 'New move: ' + esc(moveLabel(x)), body: inf.what + (inf.answer ? ' ' + inf.answer : ''), more: kkey('intent', i) };
      }
    }
    void it;
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
      '<div class="cc-f">' + (c.more ? kw(c.more, 'cc-more pbtn quiet', '<span>More</span>', ' about this') : '') +
      '<button type="button" class="pbtn cc-ok" data-coach-ok>' + I('done') + '<span>Got it</span></button></div></div>';
    ui.coach.querySelector('[data-coach-ok]').onclick = () => {
      ui.coach.innerHTML = '';
      RB.combatHelp.hide();
      const f = ui.resp.querySelector('.rcard:not([disabled]), .ccard:not([disabled])');
      if (f) f.focus({ preventScroll: true });
      requestAnimationFrame(measure);
    };
  }
  // card previews: hover (mouse) and keyboard focus show whom it reaches; leaving clears
  function wirePreview(container, reachFor) {
    const at = (e) => e.target && e.target.closest && e.target.closest('[data-i], [data-a]');
    container.onpointerover = (e) => { if (e.pointerType !== 'mouse') return; const b = at(e); if (b && !b.disabled) setHover(reachFor(b)); };
    container.onpointerout = (e) => { if (e.pointerType !== 'mouse') return; const b = at(e); if (b && !(e.relatedTarget && b.contains(e.relatedTarget))) { const f = document.activeElement && container.contains(document.activeElement) ? at({ target: document.activeElement }) : null; setHover(f && f === kbEl && f.matches(':focus-visible') ? reachFor(f) : null); } };
    // (focusin/focusout have no on… properties: listeners, removed again by unwirePreview)
    unwireFocus(container);
    const fi = (e) => { const b = at(e); kbEl = b && byKeys() ? b : null; if (kbEl && !b.disabled) setHover(reachFor(b)); };
    const fo = (e) => { if (!(e.relatedTarget && container.contains(e.relatedTarget))) { kbEl = null; setHover(null); } };
    container.addEventListener('focusin', fi);
    container.addEventListener('focusout', fo);
    container.__pv = { fi, fo };
  }
  function unwireFocus(container) { const w = container.__pv; if (w) { container.removeEventListener('focusin', w.fi); container.removeEventListener('focusout', w.fo); container.__pv = null; } }
  function unwirePreview(container) { container.onpointerover = container.onpointerout = null; unwireFocus(container); kbEl = null; }
  // A press that began before a menu opened (the click or the held Enter / Space that submitted the
  // answer, a key repeating across the exchange) never chooses anything in it, nor does the second
  // click of a double click that opened it (Instant playback brings the menu back at once); a fresh
  // press does.
  function stalePress(e, openAt) {
    const P = ui && ui.press;
    if (!P) return false;
    let stale;
    if (e && e.detail > 0) stale = (P.ptr >= 0 && P.ptr < openAt) || (e.detail > 1 && performance.now() - openAt < 500);
    else { const k = P.key; const held = !!k && (!k.up || performance.now() - k.up < 60); stale = !!k && held && (k.repeat || k.at < openAt); }
    if (stale) P.ignored = (P.ignored || 0) + 1;
    return stale;
  }
  function pickCard() {
    return new Promise((resolve) => {
      const s = RB.game.s;
      let cards = [];
      const known = new Set(words().flatMap((w) => w.tags));
      // say "kana or kanji" whenever the writing pad will read kanji for this player
      const hi = RB.pad && RB.pad.kanjiPreferred ? RB.pad.kanjiPreferred() : s.learn.profile === 'I' || s.learn.profile === 'A';
      const deal = () => {
        cards = L().responses(st, words());
        // Keep every encounter solvable: only block Unravel if a counter is actually known.
        for (const c of cards) {
          if (c.kind === 'unravel' && st.shroud && !(known.has('light') || known.has('wind'))) c.disabled = null;
          if (c.kind === 'unravel' && st.silenced && (known.has('bell') || known.has('voice'))) c.disabled = 'The hush swallows words: ring a bell or raise a voice first.';
        }
        for (const c of cards) if (c.kind === 'word') shownWords.add(c.word.id);
        const focusedI = document.activeElement && ui.resp.contains(document.activeElement) ? document.activeElement.getAttribute('data-i') : null;
        ui.resp.innerHTML = '<div class="rcards">' + cards.map((c, i) => cardHtml(c, i, hi)).join('') + '</div>' +
          (st.noFlee ? '' : '<button class="cbtn flee" data-flee>' + I('back') + '<span>Step back from this encounter</span></button>');
        if (focusedI != null) { const b = ui.resp.querySelector('[data-i="' + focusedI + '"]'); if (b) b.focus({ preventScroll: true }); }
        // a card still under the pointer or focus previews for the new target
        const f = ui.resp.querySelector('.rcard:focus-visible, .rcard:hover');
        tg.hover = f ? reachFor(f) : null;
        refreshMarks();
      };
      const reachFor = (b) => { const c = cards[+b.getAttribute('data-i')]; return c ? reachOf(c) : null; };
      deal();
      const openAt = performance.now();
      // Back from an exchange: focus left in the withdrawn menus (or on Skip) returns to the response
      // chosen last time if it is still offered, otherwise to the first one that can be chosen (§14.6)
      if (exchangeN > 1) {
        const a = document.activeElement;
        const lost = !a || a === document.body || !a.isConnected || a === ui.skip || a === ui.root || (ui.root.contains(a) && !!a.closest('[inert]'));
        if (lost) {
          const want = lastCardId != null ? [...ui.resp.querySelectorAll('.rcard[data-cid]:not([disabled])')].find((x) => x.getAttribute('data-cid') === lastCardId) : null;
          const f = want || ui.resp.querySelector('.rcard:not([disabled])');
          if (f) f.focus({ preventScroll: true });
        }
      }
      onTarget = () => deal();
      // the last exchange stays readable under the responses (what was woven, what it did)
      recap();
      showCoach(coachFor());
      wirePreview(ui.resp, reachFor);
      // Keyboard focus starts on the responses but may also reach the
      // keywords (telegraph, states, Harmony, wards), the target slips and the note above them.
      const layer = { el: ui.resp, name: 'cards', parent: ui.dock, scope: ui.root };
      // one choice per exchange: a second click (or a double click) is ignored
      let chosen = false;
      const done = (v) => { if (chosen) return; chosen = true; onTarget = null; unwirePreview(ui.resp); RB.combatHelp.hide(); showCoach(null); RB.ui.popLayer(layer); ui.dock.insertBefore(ui.resp, ui.log); resolve(v); };
      ui.resp.onclick = (e) => {
        if (stalePress(e, openAt)) return;
        const b = e.target.closest('[data-i]');
        if (b && !b.disabled) { const c = cards[+b.getAttribute('data-i')]; lastCardId = c.id != null ? String(c.id) : null; tg.lock = reachOf(c); tg.hover = null; done(c); return; }
        if (e.target.closest('[data-flee]')) done({ kind: 'flee' });
      };
      // Back closes an open keyword note first; it never leaves the encounter.
      // On a target slip the arrow keys choose the target.
      layer.onAction = (a) => {
        if (a === 'cancel' && RB.combatHelp.isOpen()) { RB.combatHelp.hide(); return true; }
        if (a === 'cancel' && RB.battleIntents.isOpen()) { RB.battleIntents.close(true); return true; }
        const onSlip = document.activeElement && document.activeElement.closest && document.activeElement.closest('.cb-foe .fs');
        if (onSlip && (a === 'left' || a === 'right' || a === 'up' || a === 'down')) { stepTarget(a === 'left' || a === 'up' ? -1 : 1, true); return true; }
        if (onSlip && a === 'ok') { selectTarget(+onSlip.getAttribute('data-foe'), true); return true; }
        return false;
      };
      layer.onCancel = () => {};
      RB.ui.pushLayer(layer);
      ui.dock.insertBefore(ui.resp, ui.log);
      requestAnimationFrame(measure);
    });
  }
  // ---- the companion's turn ----------------------------------------------------------------------
  // Your response is queued (its step is done); your companion chooses one
  // support action. "Back to <you>" drops the queued response at no cost.
  // Resolves { act (def or null), target } or 'back'.
  function pickCompanion(card) {
    return new Promise((resolve) => {
      const s = RB.game.s;
      const H = RB.combatHelp;
      const opts = L().compOptions(st, s, card).filter((o) => !o.locked);
      const cn = compName();
      const pn = s.player.name;
      tg.compTarget = st.cur;
      const queued = tg.lock;
      const r0 = reachOf(card);
      const qlabel = reachLabel(card, r0) || (card.kind === 'word' && (card.word.tags || []).indexOf('heal') >= 0 ? 'on you both' : isGroup() ? '' : 'on it');
      const newActs = new Set(opts.filter((o) => !H.seen(s, 'cact:' + o.def.id)).map((o) => o.def.id));
      const reachFor = (b) => { const o = opts[+b.getAttribute('data-a')]; if (!o) return null; const T = st.cur; L().target(st, tg.compTarget); const r = L().compReach(st, o.def); if (!L().target(st, T)) st.cur = T; return r; };
      const actLabel = (o) => {
        const r = reachFor({ getAttribute: () => String(opts.indexOf(o)) }) || { foes: [], allies: [] };
        if (o.def.id === 'join') return '';
        if (r.foes.length > 1) return 'on ' + nWord(r.foes.length);
        if (r.foes.length === 1 && o.def.aim === 'aimed') return 'before ' + (r.allies[0] === 'comp' ? cn : 'you');
        if (r.foes.length === 1) return isGroup() ? 'on the ' + shortEn(r.foes[0]) : 'on it';
        if (r.allies.length > 1) return 'on you both';
        if (r.allies.length === 1) return 'on ' + (r.allies[0] === 'comp' ? cn : 'you');
        return '';
      };
      const render = () => {
        const focusedA = document.activeElement && ui.resp.contains(document.activeElement) ? document.activeElement.getAttribute('data-a') : null;
        ui.dockH.textContent = cn + '\'s turn';
        ui.dock.classList.add('cb-cturn');
        ui.resp.innerHTML =
          '<div class="cb-queued paper" role="status"><span class="cq-l">' + I('seal') + '<span>Queued: <b>' + esc(card.en) + '</b>' + (qlabel ? ' <span class="cq-t">' + esc(qlabel) + '</span>' : '') + '</span></span>' +
            '<button type="button" class="pbtn quiet cq-back" data-back>' + I('back') + '<span>Back to ' + esc(pn) + '</span></button></div>' +
          '<p class="ct-sub">' + esc(cn) + ' is not an inkweaver: a small move to support you, no writing. Then it all happens, in that order.</p>' +
          '<div class="rcards ccards" role="group" aria-label="' + esc(cn) + '\'s support">' + opts.map((o, i) => {
            const d = o.def, t = actLabel(o), used = o.used, fresh = newActs.has(d.id) && d.id !== 'join';
            return '<button type="button" class="ccard rcard' + (fresh ? ' fresh' : '') + (d.id === 'join' ? ' tech' : '') + '" data-a="' + i + '"' + (used ? ' disabled' : '') + '>' +
              '<span class="ic">' + I(d.id === 'join' ? 'join' : 'companion') + '</span>' +
              '<span class="rc-w"><span class="rc-jp">' + RB.ui.jhtml(d.name.jp) + '</span><span class="rc-en">' + esc(d.name.en) + '</span>' + (fresh ? '<span class="rc-new">New</span>' : '') + '</span>' +
              (t ? '<span class="rc-tgt">' + esc(t) + '</span>' : '') +
              '<span class="rc-d">' + esc(d.desc || '') + (d.uses ? '<span class="rc-uses">' + (used ? 'Used in this encounter' : 'Once per encounter') + '</span>' : '') + '</span></button>';
          }).join('') + '</div>';
        if (focusedA != null) { const b = ui.resp.querySelector('[data-a="' + focusedA + '"]'); if (b) b.focus({ preventScroll: true }); }
        refreshMarks();
      };
      // a one-time note the first time, and when a new action has been learned
      const firstTurn = !H.seen(s, 'cturn');
      if (firstTurn) { H.mark(s, 'cturn'); showCoach({ icon: 'companion', title: esc(cn) + '\'s turn', body: 'Your response is ready and waiting. Now ' + esc(cn) + ' chooses a small support move — no writing. If you have second thoughts, go back to ' + esc(pn) + ': nothing is lost. Then your response, ' + esc(cn) + '\'s move and the creatures\' moves happen in that order.', more: null }); }
      else {
        const nw = opts.find((o) => newActs.has(o.def.id) && o.def.id !== 'join' && o.def.unlock);
        if (nw) showCoach({ icon: 'companion', title: esc(cn) + ' has a new move: ' + esc(nw.def.name.en), body: esc(nw.def.desc || ''), more: null });
      }
      render();
      onTarget = () => { render(); };
      wirePreview(ui.resp, (b) => (b.hasAttribute('data-a') ? reachFor(b) : null));
      const layer = { el: ui.resp, name: 'companion', parent: ui.dock, scope: ui.root };
      let chosen = false;
      const done = (v) => {
        if (chosen) return; chosen = true; onTarget = null; unwirePreview(ui.resp);
        for (const id of newActs) H.mark(s, 'cact:' + id);
        RB.combatHelp.hide(); showCoach(null); RB.ui.popLayer(layer); ui.dock.insertBefore(ui.resp, ui.log);
        // (the menu goes: nothing that looks pressable stays while the exchange plays out)
        ui.resp.innerHTML = '';
        ui.dockH.textContent = 'Respond';
        ui.dock.classList.remove('cb-cturn');
        resolve(v);
      };
      // presses already on their way when the menu opened (a quick second click on
      // Continue, a held Enter) do not choose anything
      const readyAt = performance.now() + 250;
      const early = () => performance.now() < readyAt;
      ui.resp.onclick = (e) => {
        if (early()) return;
        if (e.target.closest('[data-back]')) { done('back'); return; }
        const b = e.target.closest('[data-a]');
        if (b && !b.disabled) { const o = opts[+b.getAttribute('data-a')]; tg.hover = null; done({ act: o.def, target: tg.compTarget }); }
      };
      layer.onAction = (a) => {
        if (early() && (a === 'ok' || a === 'cancel')) return true;
        if (a === 'cancel' && RB.combatHelp.isOpen()) { RB.combatHelp.hide(); return true; }
        if (a === 'cancel' && RB.battleIntents.isOpen()) { RB.battleIntents.close(true); return true; }
        const onSlip = document.activeElement && document.activeElement.closest && document.activeElement.closest('.cb-foe .fs');
        if (onSlip && (a === 'left' || a === 'right' || a === 'up' || a === 'down')) { stepTarget(a === 'left' || a === 'up' ? -1 : 1, true); return true; }
        if (onSlip && a === 'ok') { selectTarget(+onSlip.getAttribute('data-foe'), true); return true; }
        return false;
      };
      // Back (Escape, or the player's cancel key) returns to your own choice
      layer.onCancel = () => { if (!early()) done('back'); };
      RB.ui.pushLayer(layer);
      ui.dock.insertBefore(ui.resp, ui.log);
      setTimeout(() => { if (!chosen) { const f = ui.resp.querySelector('.ccard:not([disabled])'); if (f && !ui.coach.querySelector('.cb-coach')) f.focus({ preventScroll: true }); } }, 0);
      void queued;
      requestAnimationFrame(measure);
    });
  }
  function stepFor(card) {
    const s = RB.game.s;
    const it = st.intent;
    const pool = (members[st.cur] || enemy).pool || enemy.pool || {};
    if (card.kind === 'unravel' || card.kind === 'tech') {
      const step = RB.tasks.next(pool, {});
      step.title = card.kind === 'tech' ? 'Coordinated technique with ' + compName() + ': ' + card.en : 'Unravel: restore one of its tangled words';
      return step;
    }
    if (card.kind === 'answer' || card.kind === 'truth') {
      const src = card.kind === 'answer' ? it.answer : it.truth;
      const t = src ? RB.util.deepClone(tierOf(src) || src) : null;
      if (t) { t.title = card.kind === 'answer' ? 'Answer what it is really asking' : 'See through the false promise'; return RB.tasks.prepare(t); }
      return RB.tasks.next(pool);
    }
    const w = card.word;
    // name the script it accepts; "or in kanji" whenever the writing pad will read kanji for this player (RBN-02)
    const hi = RB.pad && RB.pad.kanjiPreferred ? RB.pad.kanjiPreferred() : s.learn.profile === 'I' || s.learn.profile === 'A';
    return RB.tasks.prepare({
      kind: 'write', item: 'v:' + (w.lex || w.r), answer: w.r, accept: [w.r, RB.tasks.plain(w.jpK || w.jp)], mode: 'reading',
      title: 'Weave the inscription', prompt: { en: 'Write the word for “' + w.en + '” ' + RB.tasks.askScript(w.r, hi ? RB.tasks.plain(w.jpK || w.jp) : null) + '.' },
      explain: { jp: w.jpK || w.jp, en: w.en + ' — ' + w.effect },
    });
  }
  // The situation, carried onto the challenge's task slip: the foe, its
  // telegraph, and the response (and whom it acts on) the player chose.
  function situationHtml(card) {
    const r = reachOf(card);
    const tgt = reachLabel(card, r) || (card.target ? (card.target === 'comp' ? 'on ' + compName() : 'on you') : '');
    const T = st.cur;
    const who = isGroup() && r.foes.length > 1 ? r.foes : [T];
    return '<div class="cb-situ">' + who.map((i) =>
      '<div class="cs-foe">' + RB.ui.jhtml(nameOf(i).jp) + ' <span class="en">' + esc(nameOf(i).en) + '</span> ' + knotsHtml(i) + '</div>' +
      '<div class="cs-intent">' + intentHtml(true, i) + '</div>').join('') +
      '<div class="cs-chose">' + I(cardIcon(card)) + '<span>You chose <b>' + esc(card.en) + '</b>' + (tgt ? ' — <b>' + esc(tgt) + '</b>' : '') + '. The encounter waits while you write.</span></div></div>';
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
    while (ui.log.children.length > (isGroup() ? 8 : 5)) ui.log.removeChild(ui.log.firstChild);
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
  // What a recovery did, from the actual change: solo is singular, one of two names who it was,
  // and at full resolve nobody "breathes easier" (battle addendum RBN-04).
  function healLine(d, pair, by) {
    const s = RB.game.s, cn = pair ? compName() : '';
    const pc = d.pc > 0, cp = pair && d.comp > 0;
    const lead = by && pair ? cn + ' tends to you. ' : '';
    if (pc && cp) return lead + 'You both breathe easier (+' + d.pc + ' for you, +' + d.comp + ' for ' + cn + ').';
    if (pc) return lead + 'You breathe easier (+' + d.pc + ')' + (pair ? '; ' + cn + ' was already steady.' : '.');
    if (cp) return lead + cn + ' breathes easier (+' + d.comp + '); you were already steady.';
    void s;
    return lead + (pair ? 'No recovery was needed: you are both already steady.' : 'No recovery was needed: you are already steady.');
  }
  function applyBeat(f, cue) {
    const s = RB.game.s;
    if (!view) view = snapshot(st);
    const v = view;
    const fi = f.foe != null ? f.foe : v.cur;
    const fo = v.foes[fi] || v.foes[0];
    const nm = (who) => (who === 'comp' ? RB.content.chars[s.comp].name.en : s.player.name);
    // in a group, a line about one creature says which
    const who = (en) => (isGroup() ? 'The ' + shortEn(fi) + ': ' + en : en);
    const was = { pc: v.pc, comp: v.comp };
    const sfx = (n) => RB.audio && RB.audio.sfx(n);
    let msg = '';
    switch (f.t) {
      case 'unravel': fo.knots = Math.max(0, fo.knots - (f.n || 1)); sfx('knot_untie'); msg = who(f.n > 1 ? 'Two knots come loose.' : 'A knot comes loose.'); break;
      case 'ward':
        if (f.block) sealHeld = f.target; else v.ward[f.target] = (v.ward[f.target] || 0) + (f.n || 2);
        sfx('ward'); msg = f.block ? 'The ward catches the blow meant for ' + nm(f.target) + '.' : 'A ward rises before ' + nm(f.target) + (f.n && f.n !== 2 ? ' (' + f.n + ')' : '') + '.'; break;
      case 'water': fo.heat = 0; sfx('water'); msg = who('Water hisses over the heat — it cools. Heat cleared.'); break;
      case 'light': fo.shroud = false; sfx('light'); msg = who(f.by === 'wind' ? 'Wind tears the mist away — its knots show again.' : 'Light burns the mist away — its knots show again.'); break;
      case 'bind': fo.charged = false; sfx('ward'); msg = who('The rope holds it fast; the gathered force spills away.'); break;
      case 'heal': {
        const n = f.n || 3, ws = f.who || ['pc', 'comp'];
        if (ws.indexOf('pc') >= 0 && v.pc > 0 || (!f.by && ws.indexOf('pc') >= 0)) v.pc = Math.min(v.max, v.pc + n);
        if (v.compId && ws.indexOf('comp') >= 0 && (v.comp > 0 || !f.by)) v.comp = Math.min(v.max, v.comp + n);
        sfx(f.gain === 0 ? 'enemy_intent' : 'heal');
        // the line says who actually recovered, from the real change (the companion's own action
        // carries its line on the 'cact' event before this one)
        msg = f.by ? '' : healLine(f.d || { pc: v.pc - was.pc, comp: v.comp - was.comp }, !!v.compId);
        break;
      }
      case 'warm': sfx('light'); msg = 'Warmth spreads through your fingers.'; break;
      case 'bell': v.silenced = 0; sfx('bell'); msg = f.by ? '' : 'A clear note breaks the hush.'; break;
      case 'hit': {
        if (f.who === 'comp') v.comp = Math.max(0, v.comp - f.n); else v.pc = Math.max(0, v.pc - f.n);
        sfx('party_hit');
        const hb = L().heatBonus(fo);
        msg = (isGroup() ? 'The ' + shortEn(fi) + ' strikes ' + nm(f.who) : nm(f.who) + ' is struck') + ' (−' + f.n + (hb ? ', with +' + hb + ' from Heat' : '') + ')' + (f.held ? ' — the salts keep them standing' : '') + '.'; break;
      }
      case 'block': v.ward[f.who] = Math.max(0, (v.ward[f.who] || 0) - f.n); sfx('ward'); msg = 'The ward absorbs ' + f.n + '.'; break;
      case 'heat': fo.heat = f.n; sfx('enemy_intent'); msg = who('It overheats: Heat ' + f.n + ' — its blows now hit +' + (f.bonus != null ? f.bonus : f.n) + ' harder until it is cooled.'); break;
      case 'shroud': fo.shroud = true; sfx('wind'); msg = who('Mist swallows its knots.'); break;
      case 'charge': fo.charged = true; sfx('enemy_intent'); msg = who('It gathers itself: its next blow will hit +2 harder.'); break;
      case 'harmony': {
        v.harmony = f.n;
        const full = f.n >= f.max;
        if (full) sfx('harmony_ready');
        msg = full ? 'In step with ' + compName() + ': Harmony is full — ' + RB.combatHelp.techOf(st).name + ' is ready.' : 'In step with ' + compName() + ': Harmony ' + f.n + ' of ' + f.max + '.';
        break;
      }
      case 'mend': fo.knots = Math.min(fo.maxKnots, fo.knots + 1); sfx('enemy_intent'); msg = who('It ties one knot back up.'); break;
      case 'stripWard': v.ward.pc = 0; v.ward.comp = 0; sfx('wind'); msg = 'The gust tears your wards away.'; break;
      case 'silence': v.silenced = 1; sfx('enemy_intent'); msg = 'Sound drains out of the air: you are Hushed.'; break;
      case 'countered': sealHeld = null; if (f.kind === 'charge') fo.charged = false; sfx('reveal'); msg = who(f.by ? 'Its move comes to nothing.' : 'You answered it — its move comes to nothing.'); break;
      case 'cost': v.pc = Math.max(0, v.pc - 1); msg = f.en; break;
      case 'tech':
        if (f.who === 'mio') { v.pc = v.max; v.comp = v.max; for (const g of f.all ? v.foes : [fo]) { g.heat = 0; g.shroud = false; g.charged = false; } }
        if (f.who === 'ren') { v.ward.pc += 3; v.ward.comp += 3; }
        sfx('technique'); msg = f.en; break;
      case 'settle': if (cue && cue.side === 'player' && curCard && curCard.kind === 'answer') fo.knots = Math.max(0, fo.knots - 1); sfx('reveal'); msg = f.en; break;
      case 'reveal': if (st.foes[fi] && st.foes[fi].intent && st.foes[fi].intent.kind === 'mirror') fo.knots = Math.max(0, fo.knots - 1); sfx('reveal'); msg = f.en; break;
      case 'comp':
        // a companion's own move (Suzu's flourish; the Atlas vial at the end of the exchange)
        if (f.who === 'mio' && cue && cue.side === 'enemy') { v.pc = st.pc; v.comp = st.comp; }
        sfx('reveal'); msg = f.en; break;
      // your companion's support action
      case 'cact': sfx(f.none ? 'enemy_intent' : 'reveal'); msg = f.en || (f.heal && f.d ? healLine(f.d, !!v.compId, f.who) : ''); break;
      case 'soften': fo.soften = (fo.soften || 0) + (f.n || 1); break;
      case 'stun': fo.stunned = fo.stunned || s.comp || 'comp'; break;
      case 'draw': fo.drawn = true; break;
      case 'settled': {
        fo.settled = true;
        const m = members[fi] || enemy;
        const line = m.settle ? (tierOf(m.settle) || m.settle) : null;
        sfx('reveal');
        const jp = line && line.jp ? '<span class="cl-w">' + RB.ui.jhtml(line.jp) + '</span> ' : '';
        logLine(jp + esc(nameOf(fi).en + ' settles' + (line && line.en ? ': ' + line.en : '.')));
        msg = '';
        break;
      }
      case 'plea': msg = who('It waits for an answer that doesn\'t come.'); break;
      case 'rest': msg = who('It hangs back, waiting.'); break;
      case 'spent': fo.charged = false; msg = who('The force it gathered is spent in that blow.'); break;
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
    return Object.assign({ comp: st.compId || null, reduce: RB.game.reducedMotion(), view: snapshot(V()), group: isGroup(), foe: st.cur }, extra || {});
  }
  const tagSide = (cues, side) => { for (const c of cues) if (c.type === 'beat') c.side = side; return cues; };
  // Semantic presentation events for observers that never act (the cosmetic pet; docs/ADDENDUM_CONTRACTS.md
  // §6): emitted once the rules have committed the result, with stable ids, families and timing on the
  // presentation clock (t0 + beat); nothing an observer does is read back. A failing listener never
  // stops the battle.
  let presentN = 0, exchangeN = 0;
  const OUTS = ['unravel', 'ward', 'heal', 'water', 'light', 'bind', 'warm', 'bell', 'settle', 'reveal', 'tech', 'cact', 'soften', 'stun', 'draw', 'comp'];
  function present(ev, o) {
    try { RB.bus.emit('present:' + ev, Object.assign({ scope: 'battle', t0: RB.battleSeq.now(), n: ++presentN, exchange: exchangeN }, o)); } catch (err) { console.warn('present:' + ev, err); }
  }
  const firstAt = (cues, test) => { let a = null; for (const c of cues) if (test(c) && (a == null || c.at < a)) a = c.at; return a; };
  function presentAct(actor, action, family, targets, fx, cues, end, extra) {
    const out = fx.find((f) => OUTS.indexOf(f.t) >= 0);
    present('action', Object.assign({ actor, action, family, targets, result: out ? out.t : 'none', id: 'battle:' + (enemy && enemy.id) + ':' + presentN + ':' + actor,
      beat: firstAt(cues, (c) => c.type === 'beat' && c.f.t !== 'cost' && c.f.t !== 'harmony') || 0, end,
      victory: firstAt(cues, (c) => c.type === 'pose' && c.pose === 'cheer') }, extra || {}));
  }
  // ---- the menus during an exchange (battle addendum §12, §14.1, §14.6) ---------------------
  // Committed: the telegraph and the response dock withdraw (Adaptive) or stay, disabled (Keep
  // visible), until the next real decision; they are inert either way (no pointer, no keyboard,
  // no focus inside them). The scene is already drawn under them, so withdrawing them reveals it:
  // nothing is re-laid out or rescaled. Resolve and Harmony (the party slip) never move.
  let acting = false, lastCardId = null;
  function setActing(on) {
    if (!ui || acting === on) return;
    acting = on;
    const keep = RB.game.settings.battleControls === 'keep';
    ui.root.classList.toggle('cb-acting', on);
    ui.root.classList.toggle('cb-keep', on && keep);
    for (const el of [ui.intent, ui.dock]) { el.inert = on; if (on) el.setAttribute('aria-hidden', keep ? 'false' : 'true'); else el.removeAttribute('aria-hidden'); }
    hold(on);
    // the badges keep the moves as committed; an open card closes (§13.5)
    badgeSnap = on && st ? st.foes.map((f) => f.intent) : null;
    shownAnswered = null; actFoe = null;
    RB.battleIntents.close(false);
    syncBadges();
    const fast = RB.battleSeq.mode() !== 'instant';
    if (on) {
      const a = document.activeElement;
      ui.skipAt = performance.now();
      ui.skip.hidden = !fast;
      // focus never stays in hidden controls: the playback control holds it
      if (a && (ui.intent.contains(a) || ui.dock.contains(a))) { if (fast) ui.skip.focus({ preventScroll: true }); else ui.root.focus && ui.root.focus({ preventScroll: true }); }
    } else {
      ui.skip.hidden = true;
      if (document.activeElement === ui.skip) ui.skip.blur();
    }
  }
  // While an exchange plays the layout holds still, so the actors keep their place and size (§12.3):
  // the overlay's rows keep their committed sizes and the menus away their committed heights, so
  // neither a condition appearing on a creature's slip nor the next decision prepared behind the
  // menus (large text lets those rows follow their content) moves the stage. A resize (a phone
  // turned, a foldable opened) measures them again.
  function hold(on) {
    if (!ui) return;
    const els = [ui.intent, ui.dock];
    ui.root.style.gridTemplateRows = '';
    for (const el of els) { el.style.height = ''; el.style.overflow = ''; }
    if (!on) return;
    const hs = els.map((el) => el.offsetHeight);
    els.forEach((el, k) => { el.style.height = hs[k] + 'px'; el.style.overflow = 'hidden'; });
    ui.root.style.gridTemplateRows = getComputedStyle(ui.root).gridTemplateRows;
  }
  // What the banner names (battle addendum §15): the actor and the action's own name. A reading
  // task's move is named neutrally (§13.3, READING): "False promise" would answer the question it asks.
  function cardLabel(card) {
    if (card.kind === 'word') return { jp: card.word.jpK || card.word.jp, en: card.word.en };
    return { jp: card.jp || null, en: card.en || '' };
  }
  function actionOf(side, actorEn, label, id, end) {
    return { id: 'battle:' + ((enemy && enemy.id) || '?') + ':' + exchangeN + ':' + id, side, actor: { en: actorEn }, label, end };
  }
  // Your response, once accepted and applied by the rules: anticipation → the
  // gesture → the word on paper → its effect on the actual target → recovery.
  // The finishing response also lets the creature settle before the last line.
  function playPlayer(card, fx, before, won, reach, target, step) {
    view = before;
    // (the word on the strip: what the answered task restored, where the response is about it — RB.partyChoreo)
    const ctx = seqCtx({ view: before, reach, foe: target, resolved: step && RB.partyChoreo ? RB.partyChoreo.resolvedOf(card, step) : null });
    const P = RB.battleSeq.choreo.player(card, fx, ctx);
    let cues = tagSide(P.cues, 'player'), end = P.end;
    if (won) { const F = RB.battleSeq.choreo.finish(P.end, Object.assign(ctx, { last: lastStanding(before) })); cues = cues.concat(F.cues); end = F.end; }
    phase = won ? 'finish' : 'player';
    presentAct('pc', card.id, RB.families.ofCard(card), P.plan.target === 'foes' ? (reach.foes || []).map((i) => 'foe:' + i) : [P.plan.target], fx, cues, end, { kind: card.kind, tech: card.tech || null, actors: P.plan.actors, won: !!won });
    // the banner: this response only (not the settling that may follow it: P.end, §15.3)
    const who = card.kind === 'tech' && st.compId ? RB.game.s.player.name + ' & ' + compName() : RB.game.s.player.name;
    const action = actionOf('party', who, cardLabel(card), 'pc:' + card.id, P.end);
    return RB.battleSeq.run(phase, cues, { end, action, card: card.id, word: P.word.jp, target: P.plan.target, gesture: P.plan.gesture, actors: P.plan.actors, fx: fx.map((f) => f.t + (f.foe != null && isGroup() ? '@' + f.foe : '')) });
  }
  // the creatures that were standing before the exchange's last knot came loose
  function lastStanding(before) {
    const out = [];
    for (let i = 0; i < st.foes.length; i++) if (before.foes[i].knots > 0) out.push(i);
    return out.length ? out : [0];
  }
  // Your companion's support action: their gesture, then each result on its target.
  function playCompanion(act, fx, won, target) {
    const ctx = seqCtx({ view: snapshot(V()), foe: target });
    const C = RB.battleSeq.choreo.companion(Object.assign({ kind: act.effect && act.effect.kind, gesture: act.gesture }, act), fx, ctx);
    let cues = tagSide(C.cues, 'companion'), end = C.end;
    if (won) { const F = RB.battleSeq.choreo.finish(C.end, Object.assign(ctx, { last: lastStanding(ctx.view) })); cues = cues.concat(F.cues); end = F.end; }
    phase = won ? 'finish' : 'companion-act';
    const aim = act.aim || (act.def && act.def.aim);
    presentAct('comp', act.id, RB.families.ofAction(act.id), aim === 'allies' ? ['pc', 'comp'] : aim === 'pc' ? ['pc'] : aim === 'foes' ? ['foes'] : aim === 'none' ? [] : aim === 'aimed' || aim === 'lower' ? ['party'] : ['foe:' + (target != null ? target : 0)], fx, cues, end, { won: !!won });
    const action = actionOf('party', compName(), { jp: act.name && act.name.jp, en: (act.name && act.name.en) || act.id }, 'comp:' + act.id, C.end);
    return RB.battleSeq.run(won ? 'finish' : 'companion', cues, { end, action, act: act.id, target, fx: fx.map((f) => f.t + (f.foe != null && isGroup() ? '@' + f.foe : '')) });
  }
  // A creature of a group whose knots are all free settles (the others stand).
  function playSettle(i) {
    const R = RB.battleSeq.choreo.settleFoe(i, seqCtx());
    return RB.battleSeq.run('settle', tagSide(R.cues, 'settle'), { end: R.end, foe: i });
  }
  // One creature's move as the rules resolved it: preparation → execution →
  // contact on each actual target → their reactions → recovery.
  function playEnemy(i, it, fx, wardBlock) {
    const m = members[i] || enemy;
    const aimHit = fx.find((f) => f.t === 'hit' || f.t === 'block');
    const ctx = seqCtx({ view: snapshot(V()), foe: i, wardBlock, art: m.art || null, foeCol: (m.artOpts && m.artOpts.col) || null, aim: aimHit ? aimHit.who : (V().foes[i] && V().foes[i].drawn && st.compId ? 'comp' : null) });
    const E = RB.battleSeq.choreo.enemy(it, fx, ctx);
    phase = 'enemy';
    actFoe = i; syncBadges();
    {
      const hit = fx.filter((f) => f.t === 'hit'), blk = fx.filter((f) => f.t === 'block'), ctr = fx.some((f) => f.t === 'countered');
      present('enemy', { actor: 'foe:' + i, kind: it.kind, id: 'battle:' + (enemy && enemy.id) + ':' + presentN + ':foe' + i,
        targets: hit.concat(blk).map((f) => f.who).filter((w, k, a) => a.indexOf(w) === k),
        outcome: ctr ? 'blocked' : hit.length ? 'hit' : blk.length ? 'absorbed' : 'status',
        at: firstAt(E.cues, (c) => c.type === 'beat' && ['hit', 'block', 'countered', 'heat', 'shroud', 'charge', 'silence', 'mend', 'stripWard', 'rest', 'plea'].indexOf(c.f.t) >= 0) || 0, end: E.end });
    }
    // a move that never really starts (the creature rests, or nothing is performed) has no banner
    const performed = it.kind !== 'rest' || fx.some((f) => f.t !== 'rest' && f.t !== 'settle');
    const action = performed ? actionOf('enemy', nameEn(i), { en: moveLabel(it) }, 'foe' + i + ':' + it.kind, E.end) : null;
    return RB.battleSeq.run('enemy', tagSide(E.cues, 'enemy'), { end: E.end, action, kind: it.kind, target: it.target, foe: i, fx: fx.map((f) => f.t + (f.who ? ':' + f.who : '')) });
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
    // (in a chain of sequences, at the end of the chain)
    reconcile() { if (chain) { if (ui && st) renderUi(); return; } view = null; if (ui && st) renderUi(); },
  };
  function endChain() { chain = false; view = null; if (ui && st) renderUi(); }

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
    // the backdrop's composition for this place, chosen once (RB.battlePlaces)
    if (RB.battlePlaces) RB.battlePlaces.begin(e, opts);
  }
  // the creatures that come to this encounter (the lead first): a placement's
  // group for the difficulty (Relaxed: always one), or an explicit opts.group
  function groupOf(enemyId, opts) {
    const s = RB.game.s;
    if (opts.group) return [enemyId].concat(opts.group).slice(0, (L().DIFF[s.learn.difficulty] || L().DIFF.normal).maxFoes);
    return L().groupFor(enemyId, opts.place, s.learn.difficulty);
  }
  // Every await of start() goes through live(): once the battle has been left for another journey
  // (abandon(), below) whatever it was waiting for never resumes it, so nothing of the abandoned
  // battle (its outcome, flags, rewards, lines, fades, music) reaches the campaign that comes next.
  let runN = 0;
  const never = () => new Promise(() => {});
  function live(p) { const n = runN; return Promise.resolve(p).then((v) => (n === runN ? v : never()), (e) => (n === runN ? Promise.reject(e) : never())); }
  async function start(enemyId, opts) {
    opts = opts || {};
    const s = RB.game.s;
    const ids = groupOf(enemyId, opts).filter((id, k) => k === 0 || RB.content.enemies[id]);
    if (RB.creatures) RB.creatures.meet(s, ids, opts); // Creatures met: the encounter begins (src/engine/64_creatures.js)
    if (RB.test && RB.test.auto) return RB.test.battle(enemyId, { group: ids.slice(1) });
    enemy = Object.assign({ id: enemyId }, RB.content.enemies[enemyId] || {});
    if (!RB.content.enemies[enemyId]) console.warn('missing enemy', enemyId);
    placeEnemy(enemy, opts);
    members = [enemy].concat(ids.slice(1).map((id) => Object.assign({ id }, RB.content.enemies[id])));
    RB.game.pushMode('combat');
    const prevSong = RB.audio && RB.audio.currentSong();
    // the zone's battle or boss theme (src/audio/39_zones.js); enemy.music still overrides
    const here = RB.world.W.map;
    RB.audio && RB.audio.playSong(RB.audio.battleSong ? RB.audio.battleSong(enemy, here && here.def, s.map) : (enemy.music || (enemy.boss ? 'boss' : 'battle')));
    await live(RB.ui.fade(true, 200));
    if (RB.battlers && RB.battlers.prewarm) { RB.battlers.prewarm(RB.equip.look(s), 'pc'); if (s.comp) RB.battlers.prewarm(RB.content.chars[s.comp].look, 'comp'); }
    RB.render.setOverride(draw);
    st = L().init(enemy, s, Object.assign({}, opts, { group: members.slice(1) }));
    st.noFlee = !!opts.noFlee || !!enemy.boss;
    showIntentEn = false;
    const H = RB.combatHelp;
    newWords = new Set(s.words.filter((w) => !H.seen(s, 'word:' + w)));
    shownWords = new Set();
    H.attach(helpFor);
    tg.hover = null; tg.lock = null; tg.compTarget = null;
    ui = buildUi();
    RB.battleBanner.attach(ui.root);
    RB.battleIntents.attach(ui.root, {
      cardHtml: intentCardHtml, translate,
      // the creatures' plates (their names, knots and conditions), placed with their badges above each one
      plates: () => { const m = {}; if (ui && ui.foe.classList.contains('onstage')) for (const e of ui.foe.querySelectorAll('[data-foe]')) m[+e.getAttribute('data-foe')] = e; return m; },
      compact: (on) => { if (ui) ui.foe.classList.toggle('compact', !!on); },
    });
    badgeSnap = null; actFoe = null; shownAnswered = null; badgeGeo = ''; badgeLay = null; badgeAt = -1e9; badgeCss = '';
    view = null; sealHeld = null; curCard = null; phase = 'intro'; logFresh = true; chain = false; hitKey = '';
    amb.v = null; Object.assign(cost, { n: 0, sum: 0, max: 0, seqN: 0, seqSum: 0, seqMax: 0 });
    RB.battleStage.begin({
      enemy, overlay: ui.root, view: V, hasComp: () => !!(st && st.compId),
      foes: () => members.map((m) => ({ id: m.id, art: m.art, artOpts: m.artOpts })),
      looks: () => ({ pc: RB.equip.look(RB.game.s), comp: st && st.compId && RB.content.chars[st.compId] ? RB.content.chars[st.compId].look : null }),
      marks,
    });
    RB.battleSeq.attach(port);
    measure();
    exchangeN = 0;
    present('scene', { phase: 'enter', comp: st.compId || null, foes: members.length });
    // While the opening lines are spoken the decision surfaces (plates, badges, telegraph, responses)
    // stay away — never empty boxes on screen — and come in once the first decision is ready; the
    // party's slip is filled now.
    ui.root.classList.add('cb-intro');
    for (const el of [ui.intent, ui.dock]) el.inert = true;
    try { renderUi(); } catch (e) { console.error('battle intro', e); }
    await live(RB.ui.fade(false, 200));
    let outcome = null;
    try {
      if (enemy.intro) await live(say(tierOf(enemy.intro) || enemy.intro, enemy.introWho));
      RB.ui.dialogue.hide();
      while (!outcome) {
        // a creature's new phase (a guardian changing its ways) is told before you choose
        for (let i = 0; i < st.foes.length; i++) {
          const ph = st.foes[i].phaseChanged;
          if (!ph) continue;
          if (ph.line) { await live(say(tierOf(ph.line) || ph.line, ph.who)); RB.ui.dialogue.hide(); }
          if (ph.teach) {
            await live(RB.challenge.teachCard({ title: 'Something has changed', en: ph.teach.en, jp: ph.teach.jp }));
            // the authored note has just explained the move now telegraphed
            RB.combatHelp.mark(s, 'intent:' + st.foes[i].intent.kind);
          }
          st.foes[i].phaseChanged = null;
        }
        phase = 'choose';
        exchangeN++;
        RB.battleSeq.endExchange();
        setActing(false);
        present('scene', { phase: 'calm' });
        tg.hover = null; tg.lock = null;
        renderUi();
        // (the first decision: the surfaces come in, filled)
        if (ui.root.classList.contains('cb-intro')) { ui.root.classList.remove('cb-intro'); for (const el of [ui.intent, ui.dock]) el.inert = false; }
        if (RB.creatures) RB.creatures.saw(s, st, members); // the telegraphs now on screen
        RB.audio && RB.audio.sfx('enemy_intent', { vol: 0.5 });
        st.assistedRound = false;
        const card = await live(pickCard());
        if (card.kind === 'flee') {
          tg.lock = null;
          const r = await live(RB.ui.confirm('Step back from this encounter? Nothing is lost; you can return whenever you like.', ['Step back', 'Stay']));
          if (r === 0) { outcome = 'flee'; break; }
          continue;
        }
        ui.resp.innerHTML = '';
        curCard = card;
        phase = 'challenge';
        renderUi();
        const step = stepFor(card);
        const T = st.cur;
        const res = await live(RB.challenge.runStep(step, {
          header: situationHtml(card), status: statusInset,
          allowCancel: true, cancelLabel: 'Choose a different response', ctxTag: 'battle:' + (st.enemyId || enemyId),
        }));
        // backed out: the preview drops back to normal, nothing else changed
        if (res.cancelled) { tg.lock = null; continue; }
        if (st.assistedRound) res.assisted = true;
        // your companion's turn: the response is queued, not yet applied
        let cact = null;
        if (st.compId && st.comp > 0 && L().compOptions(st, s, card).some((o) => !o.locked)) {
          phase = 'companion';
          renderUi();
          const c = await live(pickCompanion(card));
          tg.compTarget = null;
          if (c === 'back') { tg.lock = null; L().target(st, T); continue; }
          cact = c;
        }
        L().target(st, T);
        tg.lock = null; tg.hover = null;
        setActing(true);
        // The rules resolve the exchange (once); the screen then shows it beat by beat:
        // your response, your companion's action, then each creature in turn.
        const hb = st.harmony;
        const before = snapshot(st);
        const reach = reachOf(card);
        const P = L().playerAct(st, card, res, enemy);
        const { fx } = P;
        if (st.compId && st.harmony > hb) fx.push({ t: 'harmony', n: st.harmony, max: st.harmonyMax });
        let won = L().allSettled(st);
        let cfx = null;
        if (!won && cact && cact.act && cact.act.id !== 'join') {
          const hc = st.harmony;
          L().target(st, cact.target != null ? cact.target : T);
          cfx = L().compAct(st, cact.act.id, P).fx;
          if (!L().target(st, T)) st.cur = L().defaultTarget(st);
          if (st.harmony > hc && !cfx.some((f) => f.t === 'harmony')) cfx.push({ t: 'harmony', n: st.harmony, max: st.harmonyMax });
        }
        const wonByComp = !won && L().allSettled(st);
        // (the displayed state starts as `before` and steps forward: keep its knots apart)
        const knots0 = before.foes.map((f) => f.knots);
        chain = true;
        await live(playPlayer(card, fx, before, won, reach, T, step));
        if (!won) {
          // a creature of the group whose last knot your response freed settles now
          for (let i = 0; i < st.foes.length; i++) if (knots0[i] > 0 && V().foes[i].knots <= 0 && !wonByComp) await live(playSettle(i));
          if (cfx && cfx.length) {
            const kb = snapshot(V());
            await live(playCompanion(cact.act, cfx, wonByComp, cact.target != null ? cact.target : T));
            if (!wonByComp) for (let i = 0; i < st.foes.length; i++) if (kb.foes[i].knots > 0 && V().foes[i].knots <= 0) await live(playSettle(i));
          }
        }
        // the moves your response and your companion's answered: shown on their badges now
        shownAnswered = Object.assign({}, P.answered || {});
        endChain();
        if (RB.creatures) RB.creatures.saw(s, st, members, { fx: fx.concat(cfx || []), card, answered: P.answered }); // what your response and your companion's did
        if (won || wonByComp) { outcome = 'win'; break; }
        // each creature still standing acts in turn
        const standing = L().standing(st);
        const before2 = snapshot(st);
        const intents = st.foes.map((f) => f.intent);
        const efx = L().enemyAct(st, P.answered);
        view = before2; chain = true;
        const tail = efx.filter((f) => f.foe == null || standing.indexOf(f.foe) < 0);
        for (let k = 0; k < standing.length; k++) {
          const i = standing[k];
          let mine = efx.filter((f) => f.foe === i);
          if (k === standing.length - 1) mine = mine.concat(tail);
          const blockedByWard = fx.some((f) => f.t === 'ward' && f.block && (f.foe == null || f.foe === i));
          await live(playEnemy(i, intents[i], mine, blockedByWard));
        }
        actFoe = null;
        endChain();
        if (RB.creatures) RB.creatures.saw(s, st, members, { fx: efx, enemy: true }); // their moves as they landed
        sealHeld = null;
        L().endRound(st, enemy);
        if (st.log.length && st.log[st.log.length - 1].t === 'revive') {
          st.log.pop();
          await live(playRevive());
        }
        if (st.over) outcome = st.over;
      }
      if (outcome === 'lose') present('scene', { phase: 'defeat' });
      if (outcome === 'win') {
        present('scene', { phase: 'victory' });
        phase = 'outro';
        RB.audio && RB.audio.playSong('victory');
        if (enemy.settle) { await live(say(tierOf(enemy.settle) || enemy.settle, enemy.settleWho)); RB.ui.dialogue.hide(); }
        if (RB.creatures) RB.creatures.settle(s, members, enemy); // a settled observation (no count)
        if (enemy.reward) {
          for (const k in enemy.reward.items || {}) { RB.state.give(s, k, enemy.reward.items[k]); const it = RB.content.items[k]; if (it) await live(RB.ui.toast({ kind: 'item', jp: it.name.jp, en: it.name.en })); }
          for (const wd of enemy.reward.words || []) if (s.words.indexOf(wd) < 0) { s.words.push(wd); const W = RB.content.words[wd]; if (W) await live(RB.ui.toast({ kind: 'word', jp: W.jp, en: W.en })); }
        }
        s.vars.battlesWon = (s.vars.battlesWon || 0) + 1;
      }
    } finally {
      // the presentation ends first: any unfinished sequence is settled, its input hook released
      chain = false;
      RB.battleSeq.detach();
      present('scene', { phase: 'exit', outcome });
      view = null; sealHeld = null; curCard = null; phase = 'idle';
      tg.hover = null; tg.lock = null; tg.compTarget = null; onTarget = null;
      // Resolve recovers after every encounter: no attrition grinding.
      s.resolve.pc = s.resolve.max;
      s.resolve.comp = s.resolve.max;
      for (const w of shownWords) RB.combatHelp.mark(s, 'word:' + w);
      RB.combatHelp.detach();
      RB.battleBanner.detach();
      RB.battleIntents.detach();
      if (ui) { for (const t of ['pointerdown', 'keydown', 'keyup']) document.removeEventListener(t, ui.onPress, true); }
      lastCardId = null;
      if (ui) { window.removeEventListener('resize', ui.onHold); window.removeEventListener('resize', ui.onResize); document.removeEventListener('keydown', ui.onKey); if (ui.ro) ui.ro.disconnect(); ui.root.remove(); }
      ui = null; stageCss = null;
      await live(RB.ui.fade(true, 200));
      // while the screen is dark, before the map comes back: the world settles its side of the
      // encounter (src/engine/90_game.js startBattle: a creature you settled is gone; one you
      // stepped back from backs off and stays calm)
      if (opts.closing) { try { opts.closing(outcome); } catch (err) { console.error('battle closing', err); } }
      RB.render.setOverride(null);
      RB.battleStage.end();
      RB.game.popMode('combat');
      await live(RB.ui.fade(false, 200));
      const m = RB.world.W.map;
      const back = m && RB.world.musicFor(m.def, s);
      if (back) RB.audio && RB.audio.playSong(back);
      else if (prevSong) RB.audio && RB.audio.playSong(prevSong);
      st = null; members = [];
    }
    return outcome;
  }
  // refresh(): redraw the overlay from the current state (tests, tools)
  // context(): where the current encounter happens (tests, tools)
  // phase(): 'idle' | 'intro' | 'choose' | 'challenge' | 'companion' | 'player' | 'companion-act' | 'enemy' | 'revive' | 'finish' | 'outro'
  // shown(): the state as currently displayed (one beat behind the rules during a sequence)
  // marks(): the target and preview the stage marks now
  // target(i): choose whom you act on (as a press on the creature would; tests, tools)
  // debug(): sequencer and stage counters, the sequence trace and frame cost (tests, tuning)
  function debug() {
    return {
      phase, seq: RB.battleSeq.stats(), stage: RB.battleStage.stats(), trace: RB.battleSeq.trace(), pressesIgnored: ui && ui.press ? ui.press.ignored || 0 : 0, ambient: amb.v,
      frames: { n: cost.n, avg: cost.n ? +(cost.sum / cost.n).toFixed(3) : 0, max: +cost.max.toFixed(3), seqN: cost.seqN, seqAvg: cost.seqN ? +(cost.seqSum / cost.seqN).toFixed(3) : 0, seqMax: +cost.seqMax.toFixed(3) },
    };
  }
  // ---- leaving the encounter for another journey ----------------------------------------------
  // Load or Return to title from the battle's settings sheet (src/ui/55_settings.js), or any other
  // campaign change while a battle is open: the battle is taken down at once — the playing sequence
  // dropped unresolved, the overlay, its listeners and layers, the notes, the banner, the badges,
  // the stage, the battle music — and its coroutine never resumes (live()). Nothing is written to
  // either campaign: no outcome, no closing callback (so no win, flee or defeat flag), no Harmony,
  // no rewards, no word marks. The mode stack keeps 'combat' on top until the campaign change
  // replaces it (so the old map cannot start another encounter meanwhile), and the screen stays
  // dark until the next campaign draws.
  const VEIL = (c, w, h) => { c.fillStyle = '#0d1220'; c.fillRect(0, 0, w, h); };
  VEIL.art = true;
  function abandon() {
    if (!st && !ui) return false;
    runN++;
    RB.battleSeq.drop();
    present('scene', { phase: 'exit', outcome: 'abandoned' });
    chain = false; view = null; sealHeld = null; curCard = null; phase = 'idle'; acting = false;
    tg.hover = null; tg.lock = null; tg.compTarget = null; onTarget = null; lastCardId = null;
    badgeSnap = null; actFoe = null; shownAnswered = null;
    RB.combatHelp.detach();
    RB.battleBanner.detach();
    RB.battleIntents.detach();
    if (RB.ui.dialogue) RB.ui.dialogue.hide();
    if (ui) {
      for (const t of ['pointerdown', 'keydown', 'keyup']) document.removeEventListener(t, ui.onPress, true);
      window.removeEventListener('resize', ui.onHold); window.removeEventListener('resize', ui.onResize); document.removeEventListener('keydown', ui.onKey); if (ui.ro) ui.ro.disconnect();
      RB.ui.popLayersIn(ui.root); // the responses' and the companion's menus
      ui.root.remove();
    }
    ui = null; stageCss = null;
    RB.render.setOverride(VEIL);
    RB.battleStage.end();
    if (RB.audio) RB.audio.stopSong({ fade: 300 });
    RB.ui.fade(false, 120);
    st = null; members = []; enemy = null;
    return true;
  }
  // A campaign changing (new, loaded, back to the title) leaves no battle behind: an open one is
  // abandoned, and a battle overlay that no open battle owns is removed (two battles at once, now
  // refused by RB.game.startBattle, could leave one over the map).
  if (RB.bus) RB.bus.on('campaign:changing', () => {
    abandon();
    if (typeof document === 'undefined') return;
    for (const el of document.querySelectorAll('.combat-ui')) if (!ui || el !== ui.root) el.remove();
  });
  return {
    start, state: () => st, refresh: () => { if (st && ui) renderUi(); }, context: () => enemy && st ? { id: enemy.id, where: enemy.where, setting: enemy.setting, bg: enemy.bgKey, intro: enemy.intro, settle: enemy.settle, group: members.map((m) => m.id) } : null,
    phase: () => phase, shown: () => (st ? snapshot(V()) : null), debug, marks, target: (i) => selectTarget(i, false), members: () => members.map((m) => m.id),
  };
})();
