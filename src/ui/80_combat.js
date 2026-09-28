/* Inkweaving — presentation and exchange loop. Logic lives in
 * RB.combatLogic; this file draws the arena, the telegraphed intent,
 * response cards, and runs the language step for the chosen response. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.combat = (function () {
  'use strict';
  const esc = RB.util.esc;
  const L = () => RB.combatLogic;
  let st = null, enemy = null, ui = null, fxList = [], shake = 0;

  // ---- the scene, framed inside the stage: the free area the overlay leaves ----
  // Drawn at art resolution (2 art px per logical px): the regional backdrop
  // (RB.battleScene), the creature (RB.enemyArt), knots, the party, wards and
  // effects. Positions below are art px.
  let stageCss = null, lastLay = null, measureAt = -1e9;
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
  function partySprite(look) {
    const S = RB.sprites;
    if (typeof S.getArt === 'function') { const a = S.getArt(look, 'up', 0); if (a) return a; }
    return S.get(look, 'up', 0);
  }
  function draw(c, w, h, t) {
    if (t - measureAt > 400) { measureAt = t; measure(); }
    const S = stageBuf(w, h);
    const Sc = RB.battleScene;
    const reduce = RB.game.reducedMotion();
    const tt = reduce ? 0 : t;
    const sx = shake > 0 && !reduce ? Math.round(Math.sin(t / 20) * 4) : 0;
    if (shake > 0) shake -= 16;
    // integer scale only (pixel art), chosen so the whole scene fits the stage
    const scale = Math.max(1, Math.min(3, Math.floor(Math.min(S.h / 224, S.w / 300))));
    const ps = scale;
    const ex = Math.round(S.x + S.w * 0.62) + sx;
    let ey = Math.round(Math.min(S.y + S.h - 100 * scale, Math.max(S.y + 80 * scale, S.y + S.h * 0.44)));
    // a tall creature on a short stage: keep its head inside the stage
    // (letting its feet sit a little lower) rather than under the foe slip
    const ext = RB.enemyArt.extent(enemy.art || 'wisp', enemy.artOpts || {});
    ey = Math.min(Math.max(ey, Math.round(S.y - ext.top * scale + 2)), Math.round(S.y + S.h - 64 * scale));
    const px = Math.round(S.x + S.w * 0.1), py = Math.round(S.y + S.h - 52 * ps - 8);
    const hz = Math.max(0, Math.min(h - 1, Math.round(Math.min(ey + 36 * scale, py + 16 * ps))));
    c.imageSmoothingEnabled = false;
    Sc.backdrop(c, enemy.bg || enemy.region || 'reedwake', w, h, hz, tt, reduce);
    // creature and its ground shadow
    Sc.shadow(c, ex, ey + 84 * scale, 58 * scale, 11 * scale, 0.5);
    if (st && st.over === 'win') c.globalAlpha = 0.5;
    RB.enemyArt.drawArt(c, enemy.art || 'wisp', tt, enemy.artOpts || {}, ex, ey, scale, reduce);
    c.globalAlpha = 1;
    if (st && st.shroud) Sc.mist(c, ex, ey, scale, t, reduce);
    // knots: a row of cord loops under it, tied or undone
    if (st) for (let i = 0; i < st.maxKnots; i++) {
      const a = -Math.PI / 2 + (i - (st.maxKnots - 1) / 2) * 0.5;
      const kx = Math.round(ex + Math.cos(a) * 60 * scale), ky = Math.round(ey + 88 * scale + 12 + Math.sin(a) * 8);
      const icon = Sc.knot(i < st.knots);
      c.drawImage(icon, kx - 10 * scale, ky - 10 * scale, icon.width * scale, icon.height * scale);
    }
    // party (backs to us), each on a small contact shadow
    const s = RB.game.s;
    const look = RB.equip.look(s); // with the equipped keepsake, as on the road
    const members = [[px, py, look]];
    if (s.comp) members.push([px + 40 * ps, py + 12, RB.content.chars[s.comp].look]);
    for (const [x, y, lk] of members) {
      Sc.shadow(c, x + 16 * ps, y + 46 * ps, 12 * ps, 4 * ps, 0.55);
      c.drawImage(partySprite(lk), x, y, 32 * ps, 48 * ps);
    }
    lastLay = { ex, ey, px, py, ps, scale };
    if (st) {
      Sc.ward(c, px + 16 * ps, py + 16 * ps, 24 * ps, st.ward.pc, ps);
      if (s.comp) Sc.ward(c, px + 56 * ps, py + 12 + 16 * ps, 24 * ps, st.ward.comp, ps);
      if (st.heat) { c.fillStyle = `rgba(255,120,60,${0.08 * st.heat})`; c.fillRect(0, 0, w, h); }
    }
    // effects
    fxList = fxList.filter((e) => t - e.t0 < e.d);
    const at = { ex, ey, px, py };
    for (const e of fxList) Sc.effect(c, e, (t - e.t0) / e.d, at, 1);
  }
  draw.art = true;
  function addFx(kind, extra) {
    fxList.push(Object.assign({ kind, t0: performance.now(), d: RB.game.reducedMotion() ? 300 : 700 }, extra));
  }
  // where the party stands (for effects), in art px; dx/dy in 16×24 sprite units
  function partyAt(dx, dy) {
    const l = lastLay || { px: 40, py: 120, ps: 1 };
    return { x: l.px + (dx || 8) * 2 * l.ps, y: l.py + (dy || 12) * 2 * l.ps };
  }
  function tierOf(obj) {
    return RB.activities.tier(obj);
  }
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
    const pick = cands[(st.round + st.knots) % cands.length];
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
          '<div class="responses" role="group" aria-label="Responses"></div>' +
          '<div class="clog paper hidden" aria-live="polite"></div></section>' +
      '</div>' +
      '<div class="cb-stage" aria-hidden="true"></div>' +
      '<section class="bars cb-party" aria-label="Your party"></section>';
    RB.ui.root.appendChild(root);
    const q = (x) => root.querySelector(x);
    const o = { root, foe: q('.cb-foe'), intent: q('.intent'), stage: q('.cb-stage'), bars: q('.bars'), dock: q('.cb-dock'), resp: q('.responses'), log: q('.clog') };
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
  function intentHtml(compact) {
    const it = st.intent;
    const line = intentLine(it);
    const states = [st.shroud ? 'shrouded' : '', st.heat ? 'heat ' + st.heat : '', st.charged ? 'charged' : ''].filter(Boolean);
    let h = '<div class="it-label">' + I(INTENT_ICON[it.kind] || 'strike') + '<span class="k">' + esc(it.label) + '</span>' + states.map((x) => '<span class="st">' + esc(x) + '</span>').join('') + '</div>';
    if (line.jp) h += '<div class="it-jp">' + RB.ui.jhtml(line.jp, { vars: line.vars }) + '</div>';
    if (line.en) h += enShown() ? '<div class="it-en">' + esc(line.en) + '</div>' : (compact ? '' : '<button class="pbtn quiet tr" data-tr title="Show the English (counts as assisted)">' + I('note') + '<span>Translate <span class="aside">(assisted)</span></span></button>');
    if (!compact && RB.game.s.comp === 'nao' && st.nextIntents.length) h += '<div class="it-next">' + I('companion') + '<span>Nao: “After that — ' + esc(st.nextIntents.map((x) => x.label).join(', then ')) + '.”</span></div>';
    return h;
  }
  function knotsHtml() {
    let h = '';
    for (let i = 0; i < st.maxKnots; i++) h += '<span class="kn' + (i < st.knots ? ' tied' : '') + '"></span>';
    return '<span class="knots" role="img" aria-label="Knots still tied: ' + st.knots + ' of ' + st.maxKnots + '">' + h + '</span><span class="kn-t">' + st.knots + ' / ' + st.maxKnots + ' knots</span>';
  }
  function renderUi() {
    const s = RB.game.s;
    const it = st.intent;
    ui.foe.innerHTML = '<span class="foe-n">' + RB.ui.jhtml(enemy.name.jp) + ' <span class="en">' + esc(enemy.name.en) + '</span></span>' + knotsHtml();
    ui.intent.innerHTML = intentHtml(false);
    const tr = ui.intent.querySelector('[data-tr]');
    if (tr) tr.onclick = () => { showIntentEn = true; st.assistedRound = true; renderUi(); };
    // the party: resolve (numbers and bar), wards, harmony; the telegraph's
    // target is marked once its meaning is on screen (never before)
    const aimed = enShown() && AIMED[it.kind] ? (it.target === 'both' ? ['pc', 'comp'] : [it.target]) : [];
    const member = (who, name, v, max, ward) => '<div class="pm' + (aimed.indexOf(who) >= 0 ? ' aimed' : '') + '">' +
      '<div class="pm-h"><span class="pm-n">' + esc(name) + '</span>' +
      (ward ? '<span class="pm-w" title="Wards">' + I('shield') + '<span class="sr">wards </span>' + ward + '</span>' : '') +
      (aimed.indexOf(who) >= 0 ? '<span class="aimtag">' + I('aim') + 'its aim</span>' : '') +
      '<span class="pm-v">' + v + ' / ' + max + '</span></div>' +
      '<div class="bar" role="meter" aria-label="' + esc(name) + ' resolve" aria-valuemin="0" aria-valuemax="' + max + '" aria-valuenow="' + v + '"><i style="width:' + Math.round((100 * v) / max) + '%"></i></div></div>';
    ui.bars.innerHTML = member('pc', s.player.name, st.pc, st.max, st.ward.pc) +
      (s.comp ? member('comp', compName(), st.comp, st.max, st.ward.comp) : '') +
      (s.comp ? '<div class="pm harmony"><div class="pm-h"><span class="pm-n">Harmony</span><span class="pm-v">' + st.harmony + ' / ' + st.harmonyMax + '</span></div><div class="bar h" role="meter" aria-label="Harmony" aria-valuemin="0" aria-valuemax="' + st.harmonyMax + '" aria-valuenow="' + st.harmony + '"><i style="width:' + Math.round((100 * st.harmony) / st.harmonyMax) + '%"></i></div></div>' : '') +
      '<div class="pm-note">' + (st.assist ? 'Assisted: mistakes cost nothing' : 'Mistakes cost at most 1') + '</div>';
    requestAnimationFrame(measure);
  }
  function words() {
    const s = RB.game.s;
    return s.words.map((id) => RB.content.words[id]).filter(Boolean);
  }
  function cardHtml(c, i, hi) {
    const tgt = c.target ? (c.target === 'comp' ? compName() : 'you') : '';
    const desc = c.disabled || RB.script.enVars(tgt ? String(c.desc).replace(/\s*\([^)]*\)\s*$/, '') : c.desc);
    return '<button class="resp rcard" data-i="' + i + '"' + (c.disabled ? ' disabled' : '') + '>' +
      '<span class="ic">' + I(cardIcon(c)) + '</span>' +
      '<span class="rc-w"><span class="rc-jp">' + RB.ui.jhtml(hi && c.word && c.word.jpK ? c.word.jpK : c.jp) + '</span><span class="rc-en">' + esc(c.en) + '</span></span>' +
      (tgt ? '<span class="rc-tgt">on ' + esc(tgt) + '</span>' : '') +
      '<span class="rc-d">' + (c.disabled ? I('warn') : '') + esc(desc) + '</span></button>';
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
      const hi = s.learn.profile === 'I' || s.learn.profile === 'A';
      ui.resp.innerHTML = '<div class="rcards">' + cards.map((c, i) => cardHtml(c, i, hi)).join('') + '</div>' +
        (st.noFlee ? '' : '<button class="cbtn flee" data-flee>' + I('back') + '<span>Step back from this encounter</span></button>');
      ui.log.classList.add('hidden');
      const layer = { el: ui.resp, name: 'cards', parent: ui.dock };
      const done = (v) => { RB.ui.popLayer(layer); ui.dock.insertBefore(ui.resp, ui.log); resolve(v); };
      ui.resp.onclick = (e) => {
        const b = e.target.closest('[data-i]');
        if (b && !b.disabled) { done(cards[+b.getAttribute('data-i')]); return; }
        if (e.target.closest('[data-flee]')) done({ kind: 'flee' });
      };
      layer.onCancel = () => {};
      RB.ui.pushLayer(layer);
      ui.dock.insertBefore(ui.resp, ui.log);
    });
  }
  function stepFor(card) {
    const s = RB.game.s;
    const it = st.intent;
    if (card.kind === 'unravel' || card.kind === 'tech') {
      const step = RB.tasks.next(enemy.pool || {}, {});
      step.title = card.kind === 'tech' ? 'Coordinated technique — weave it together' : 'Unravel: restore one of its tangled words';
      return step;
    }
    if (card.kind === 'answer' || card.kind === 'truth') {
      const src = card.kind === 'answer' ? it.answer : it.truth;
      const t = src ? RB.util.deepClone(tierOf(src) || src) : null;
      if (t) { t.title = card.kind === 'answer' ? 'Answer what it is really asking' : 'See through the false promise'; return RB.tasks.prepare(t); }
      return RB.tasks.next(enemy.pool || {});
    }
    const w = card.word;
    const hi = s.learn.profile === 'I' || s.learn.profile === 'A';
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
  function log(text) {
    ui.log.classList.remove('hidden');
    ui.log.innerHTML = text;
    return new Promise((r) => setTimeout(r, RB.game.reducedMotion() ? 500 : 900));
  }
  async function playFx(fx) {
    for (const f of fx) {
      let msg = '';
      const s = RB.game.s;
      const nm = (who) => (who === 'comp' ? RB.content.chars[s.comp].name.en : s.player.name);
      switch (f.t) {
        case 'unravel': addFx('untie'); RB.audio && RB.audio.sfx('knot_untie'); msg = f.n > 1 ? 'Two knots come loose.' : 'A knot comes loose.'; break;
        case 'ward': addFx('glyph', partyAt(f.target === 'comp' ? 28 : 8, 12)); RB.audio && RB.audio.sfx('ward'); msg = f.block ? 'The ward catches the blow meant for ' + nm(f.target) + '.' : 'A ward rises before ' + nm(f.target) + '.'; break;
        case 'water': addFx('water'); RB.audio && RB.audio.sfx('water'); msg = 'Water hisses over the heat.'; break;
        case 'light': addFx('light'); RB.audio && RB.audio.sfx('light'); msg = 'Light burns the mist away.'; break;
        case 'bind': RB.audio && RB.audio.sfx('ward'); msg = 'The rope holds it fast; the gathered force spills away.'; break;
        case 'heal': addFx('heal'); RB.audio && RB.audio.sfx('heal'); msg = 'You both breathe easier.'; break;
        case 'warm': RB.audio && RB.audio.sfx('light'); msg = 'Warmth spreads through your fingers.'; break;
        case 'bell': RB.audio && RB.audio.sfx('bell'); msg = 'A clear note breaks the hush.'; break;
        case 'hit': shake = 200; addFx('hit', partyAt(f.who === 'comp' ? 28 : 8, 16)); RB.audio && RB.audio.sfx('party_hit'); msg = nm(f.who) + ' is struck (−' + f.n + ').'; break;
        case 'block': RB.audio && RB.audio.sfx('ward'); msg = 'The ward absorbs ' + f.n + '.'; break;
        case 'heat': RB.audio && RB.audio.sfx('enemy_intent'); msg = 'The heat builds (' + f.n + ').'; break;
        case 'shroud': RB.audio && RB.audio.sfx('wind'); msg = 'Mist swallows its knots.'; break;
        case 'charge': RB.audio && RB.audio.sfx('enemy_intent'); msg = 'It gathers itself. The next blow will be heavy.'; break;
        case 'mend': RB.audio && RB.audio.sfx('enemy_intent'); msg = 'It ties one knot back up.'; break;
        case 'stripWard': RB.audio && RB.audio.sfx('wind'); msg = 'The gust tears your wards away.'; break;
        case 'silence': RB.audio && RB.audio.sfx('enemy_intent'); msg = 'Sound drains out of the air.'; break;
        case 'countered': RB.audio && RB.audio.sfx('reveal'); msg = 'You answered it — its move comes to nothing.'; break;
        case 'cost': msg = f.en; break;
        case 'comp': case 'tech': case 'settle': case 'reveal': msg = f.en; RB.audio && RB.audio.sfx(f.t === 'tech' ? 'technique' : 'reveal'); break;
        case 'plea': msg = 'It waits for an answer that doesn\'t come.'; break;
        default: msg = '';
      }
      if (msg) { renderUi(); await log(esc(msg)); }
    }
    ui.log.classList.add('hidden');
    renderUi();
  }

  async function start(enemyId, opts) {
    opts = opts || {};
    if (RB.test && RB.test.auto) return RB.test.battle(enemyId);
    const s = RB.game.s;
    enemy = Object.assign({ id: enemyId }, RB.content.enemies[enemyId] || {});
    if (!RB.content.enemies[enemyId]) console.warn('missing enemy', enemyId);
    RB.game.pushMode('combat');
    const prevSong = RB.audio && RB.audio.currentSong();
    RB.audio && RB.audio.playSong(enemy.music || (enemy.boss ? 'boss' : 'battle'));
    await RB.ui.fade(true, 200);
    RB.render.setOverride(draw);
    st = L().init(enemy, s, opts);
    st.noFlee = !!opts.noFlee || !!enemy.boss;
    showIntentEn = false;
    ui = buildUi();
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
          if (ph.teach) await RB.challenge.teachCard({ title: 'Something has changed', en: ph.teach.en, jp: ph.teach.jp });
          st.phaseChanged = null;
        }
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
        const step = stepFor(card);
        const res = await RB.challenge.runStep(step, {
          header: situationHtml(card),
          allowCancel: true, cancelLabel: 'Choose a different response', ctxTag: 'battle:' + enemyId,
        });
        if (res.cancelled) continue;
        if (st.assistedRound) res.assisted = true;
        const { fx, countered } = L().playerAct(st, card, res, enemy);
        await playFx(fx);
        if (st.knots <= 0) { outcome = 'win'; break; }
        const efx = L().enemyAct(st, countered);
        await playFx(efx);
        L().endRound(st, enemy);
        if (st.log.length && st.log[st.log.length - 1].t === 'revive') {
          st.log.pop();
          const c = RB.content.chars[s.comp];
          await log(esc(c.name.en + ' hauls you back to your feet.'));
        }
        if (st.over) outcome = st.over;
      }
      if (outcome === 'win') {
        RB.audio && RB.audio.playSong('victory');
        if (enemy.settle) { await say(tierOf(enemy.settle) || enemy.settle, enemy.settleWho); RB.ui.dialogue.hide(); }
        if (enemy.reward) {
          for (const k in enemy.reward.items || {}) { RB.state.give(s, k, enemy.reward.items[k]); const it = RB.content.items[k]; if (it) await RB.ui.toast({ kind: 'item', jp: it.name.jp, en: it.name.en }); }
          for (const wd of enemy.reward.words || []) if (s.words.indexOf(wd) < 0) { s.words.push(wd); const W = RB.content.words[wd]; if (W) await RB.ui.toast({ kind: 'word', jp: W.jp, en: W.en }); }
        }
        s.vars.battlesWon = (s.vars.battlesWon || 0) + 1;
      }
    } finally {
      // Resolve recovers after every encounter: no attrition grinding.
      s.resolve.pc = s.resolve.max;
      s.resolve.comp = s.resolve.max;
      if (ui) { window.removeEventListener('resize', ui.onResize); if (ui.ro) ui.ro.disconnect(); ui.root.remove(); }
      ui = null; stageCss = null; lastLay = null;
      await RB.ui.fade(true, 200);
      RB.render.setOverride(null);
      RB.game.popMode('combat');
      await RB.ui.fade(false, 200);
      const m = RB.world.W.map;
      if (m && m.def.music) RB.audio && RB.audio.playSong(typeof m.def.music === 'string' ? m.def.music : (m.def.music.find((x) => !x.if || RB.state.test(s, x.if)) || {}).id);
      else if (prevSong) RB.audio && RB.audio.playSong(prevSong);
      st = null;
    }
    return outcome;
  }
  return { start, state: () => st };
})();
