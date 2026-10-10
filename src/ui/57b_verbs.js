/* The exploration actions' sheets (expansion P05; the templates and rules in src/engine/55b_verbs.js). Examining an
 * action's prop opens its sheet inside a scene (so the world, and every creature in it, waits: a quiet puzzle
 * space). The sheet only asks the engines and shows what they decided; every change goes through
 * RB.fieldweave (act / arrange) or RB.cases, and is autosaved like any field puzzle.
 *
 *   notice    the pieces, the notice as it reads, Post it, and what people understood
 *   courier   who is where on each leg (the information to plan with), a stop for each leg, Check, Set out
 *   repair    Look, Instructions, a tool and a part, Test; the steps done so far
 *   network   every basin's water (near and far), the gates you can reach from here, the ways that must stay open
 *   observe   the machine's parts in the phase shown, its pattern, Pause / Play / Step, notes, adjustments
 *   follow    the step to follow, its actions, why a wrong one does not fit
 *   route     where the creature is, this object, and Weave a word here (the Weave sheet, with its language step)
 *   layers    the old plan over today's map, each mark compared where it is, the readings to conclude with
 *   blocking  the stage, the wings, the directions; place each piece; Rehearse (it walks on, around the scenery)
 *
 * Shapes and words carry every meaning; colour only reinforces. Reduced motion: no autoplay, no walking on. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.verbSheets = (function () {
  'use strict';
  const esc = RB.util.esc;
  const I = (n) => (RB.ui.folio ? RB.ui.folio.icon(n) : '');
  const FW = () => RB.fieldweave, V = () => RB.verbs, S = () => RB.game.s;
  const J = (x) => (x && x.jp ? RB.ui.jhtml(x.jp) : '');
  const both = (x, cls) => (x ? '<span class="vb-l' + (cls ? ' ' + cls : '') + '"><span class="vb-jp">' + J(x) + '</span><span class="en">' + esc(x.en || '') + '</span></span>' : '');
  const TITLE = { notice: 'A notice', courier: 'A courier\'s round', repair: 'A repair', network: 'Water across the rooms', observe: 'Watch the machine', follow: 'Follow the steps', route: 'Move it along', layers: 'The old plan and today', blocking: 'A rehearsal' };
  const ICON = { notice: 'note', courier: 'letter', repair: 'tool', network: 'wave', observe: 'look', follow: 'note', route: 'stride', layers: 'map', blocking: 'companion' };
  const reduced = () => !!(RB.game.reducedMotion && RB.game.reducedMotion());
  let cur = null;

  function open(id, o) {
    const spec = V().get(id);
    if (!spec || !S()) return Promise.resolve(null);
    if (cur) close();
    return new Promise((resolve) => {
      const el = RB.ui.el('div', 'weave-sheet verb-sheet vb-' + spec.kind);
      el.setAttribute('role', 'dialog');
      el.setAttribute('aria-modal', 'true');
      el.setAttribute('aria-labelledby', 'vb-title');
      const layer = { el, name: 'verb' };
      cur = { id, spec, el, layer, resolve, part: o && o.part, said: [], view: {}, t: 0, timer: null, closed: false };
      if (spec.kind === 'layers' && RB.cases && !RB.cases.known(S(), id)) RB.cases.open(S(), id); // reading the plan starts the case
      if (spec.kind === 'observe') { cur.view.play = !reduced(); tickObserve(); }
      el.addEventListener('click', onClick);
      layer.onCancel = () => close();
      render();
      RB.ui.pushLayer(layer);
    });
  }
  function close() {
    if (!cur || cur.closed) return;
    const c = cur;
    c.closed = true;
    if (c.timer) clearTimeout(c.timer);
    RB.ui.popLayer(c.layer);
    cur = null;
    c.resolve(FW().get(c.id) ? FW().peek(S(), c.id) : null);
  }
  // an act through the field puzzle engine: what it says is shown; an effective change is kept (autosave)
  function act(name) {
    const res = FW().act(S(), cur.id, name);
    show(res);
    return res;
  }
  function arrange(patch) {
    const res = FW().arrange(S(), cur.id, patch);
    if (res && res.effective && RB.save && RB.save.autosave) RB.save.autosave('progress');
    return res;
  }
  function show(res) {
    if (!res) return;
    cur.said = (res.say || []).slice();
    if (res.stale) cur.said = [{ en: 'That is settled now; it stays as it is.', jp: 'もう {終|お}わって いる 。 このまま に して おこう 。' }];
    if (res.effective && RB.save && RB.save.autosave) RB.save.autosave('progress');
    if (res.completed) cur.view.justDone = true;
    RB.audio && RB.audio.sfx(res.completed ? 'confirm' : res.effective ? 'page' : 'cancel', { vol: 0.5 });
  }

  // ---- the frame -----------------------------------------------------------------------------------------------
  function title(spec) {
    const t = spec.title || spec.name || (spec.plan && spec.plan.title);
    return t ? '<span class="vb-jp">' + J(t) + '</span><span class="en">' + esc(t.en) + '</span>' : esc(TITLE[spec.kind]);
  }
  function doneLine() {
    const def = FW().get(cur.id), s = S();
    const done = def ? FW().peek(s, cur.id).done : RB.cases && RB.cases.solved(s, cur.id);
    if (!done) return '';
    return '<p class="vb-done" role="status">' + I('done') + '<span>' + (cur.view.justDone ? 'Done.' : 'Done before; it stays as it is.') + '</span></p>';
  }
  function saidHtml() {
    return '<div class="vb-said" aria-live="polite">' + (cur.said.length ? cur.said.map((l) => '<p>' + both(l) + '</p>').join('') : '') + '</div>';
  }
  function render(focusSel) {
    if (!cur) return;
    const spec = cur.spec, body = BODY[spec.kind] ? BODY[spec.kind](spec) : '';
    cur.el.innerHTML = '<div class="wv-frame"><div class="wv-head"><h2 id="vb-title">' + I(ICON[spec.kind] || 'look') + '<span class="vb-title">' + title(spec) + '</span></h2>' +
      '<button type="button" class="cbtn wv-cancel" data-a="close">' + I('back') + '<span>Close</span></button></div>' +
      '<div class="wv-body">' + doneLine() + body + saidHtml() + '</div></div>';
    if (focusSel) { const f = cur.el.querySelector(focusSel); if (f) f.focus({ preventScroll: true }); }
  }
  const radio = (group, value, on, inner, extra) => '<button type="button" class="wv-t" role="radio" data-g="' + esc(group) + '" data-v="' + esc(value) + '" aria-checked="' + !!on + '"' + (extra || '') + '>' + inner + '</button>';
  const btn = (a, label, icon, extra, cls) => '<button type="button" class="pbtn' + (cls ? ' ' + cls : '') + '" data-a="' + esc(a) + '"' + (extra || '') + '>' + (icon ? I(icon) : '') + '<span>' + label + '</span></button>';

  // ---- W9 · notice ----------------------------------------------------------------------------------------------
  const BODY = {};
  BODY.notice = (spec) => {
    const st = FW().stateOf(S(), spec.id);
    const txt = V().noticeText(spec, st);
    return '<div class="vb-notice-preview" aria-label="The notice as it reads"><span class="vb-jp">' + J(txt) + '</span><span class="en">' + esc(txt.en) + '</span></div>' +
      spec.slots.map((sl) => '<div class="ar-item"><div class="wv-lab">' + both(sl.label) + '</div><div class="ar-slots" role="radiogroup" aria-label="' + esc(sl.label.en) + '">' +
        sl.options.map((op) => radio(sl.key, op.id, st[sl.key] === op.id, '<span class="vb-jp">' + J(op) + '</span><span class="en">' + esc(op.en) + '</span>')).join('') + '</div></div>').join('') +
      '<div class="wv-foot">' + btn('post', 'Post it', 'note', spec.slots.every((sl) => st[sl.key]) ? '' : ' disabled') + '</div>';
  };

  // ---- W11 · courier ----------------------------------------------------------------------------------------------
  BODY.courier = (spec) => {
    const st = FW().stateOf(S(), spec.id);
    const stop = (k) => spec.stops[k] || { en: k, jp: k };
    let h = '<div class="vb-table-wrap"><table class="vb-table"><caption>Who is where on each leg of the round</caption><thead><tr><th scope="col">For</th>' +
      spec.legs.map((l) => '<th scope="col">' + both(l) + '</th>').join('') + '</tr></thead><tbody>' +
      spec.parcels.map((pc) => { const r = spec.recipients[pc.to]; return '<tr><th scope="row">' + both(r.name) + '<span class="vb-small">' + both({ jp: pc.jp, en: pc.en }) + '</span></th>' + r.at.map((k) => '<td>' + both(stop(k)) + '</td>').join('') + '</tr>'; }).join('') +
      '</tbody></table></div>';
    h += spec.legs.map((l, i) => '<div class="ar-item"><div class="wv-lab">' + both(l) + '</div><div class="ar-slots" role="radiogroup" aria-label="' + esc(l.en) + ' stop">' +
      Object.keys(spec.stops).map((k) => radio('leg' + i, k, st['leg' + i] === k, '<span class="vb-jp">' + J(stop(k)) + '</span><span class="en">' + esc(stop(k).en) + '</span>')).join('') + '</div></div>').join('');
    const plan = spec.legs.map((l, i) => st['leg' + i]);
    h += '<div class="wv-foot">' + btn('check', 'Check the round', 'look', plan.every(Boolean) ? '' : ' disabled') + btn('go', 'Set out', 'journey', plan.every(Boolean) ? '' : ' disabled', 'primary') + '</div>';
    if (cur.view.check) {
      const c = V().courierCheck(spec, plan);
      h += '<ul class="ar-list">' + c.parcels.map((p) => {
        const pc = spec.parcels.find((x) => x.id === p.parcel), r = spec.recipients[pc.to];
        return '<li class="' + (p.ok ? 'ok' : 'no') + '">' + esc(pc.en[0].toUpperCase() + pc.en.slice(1)) + ' for ' + esc(r.name.en) + ': ' + (p.ok ? 'delivered on the ' + esc(spec.legs[p.leg].en.toLowerCase()) + ' leg' : 'missed — ' + esc(r.name.en) + ' is ' + r.at.map((k, i) => 'at ' + stop(k).en + ' (' + spec.legs[i].en.toLowerCase() + ')').join(', ')) + '</li>';
      }).join('') + '</ul>';
    }
    return h;
  };

  // ---- W12 · repair ------------------------------------------------------------------------------------------------
  BODY.repair = (spec) => {
    const st = FW().stateOf(S(), spec.id);
    const tool = cur.view.tool || null;
    let h = '<div class="wv-foot">' + btn('inspect', 'Look at it', 'look') + btn('read', 'Read the instructions', 'note') + '</div>';
    h += '<ol class="vb-steps" aria-label="The steps">' + spec.steps.map((s0, i) => '<li class="' + (i < st.step ? 'ok' : '') + '">' + (i < st.step ? '<span class="vb-mark" aria-hidden="true">✓</span>' : '<span class="vb-mark" aria-hidden="true">' + (i + 1) + '</span>') + '<span>' + (i < st.step ? 'Done: ' : 'To do: ') + esc(spec.parts[s0.part].en) + '</span></li>').join('') + '</ol>';
    h += '<div class="ar-item"><div class="wv-lab">The tools the job came with</div><div class="ar-slots" role="radiogroup" aria-label="Tool">' +
      spec.tools.map((t) => radio('tool', t.id, tool === t.id, '<span class="vb-jp">' + J(t) + '</span><span class="en">' + esc(t.en) + '</span>')).join('') + '</div></div>';
    h += '<div class="ar-item"><div class="wv-lab">Use it on</div><div class="ar-slots">' +
      Object.keys(spec.parts).map((k) => '<button type="button" class="wv-t" data-a="use" data-part="' + esc(k) + '"' + (tool ? '' : ' disabled') + '><span class="vb-jp">' + J(spec.parts[k]) + '</span><span class="en">' + esc(spec.parts[k].en) + '</span></button>').join('') + '</div></div>';
    h += '<div class="wv-foot">' + btn('test', 'Try it', 'done', '', 'primary') + '</div>';
    return h;
  };

  // ---- W13 · network -------------------------------------------------------------------------------------------------
  const mapName = (m) => { const d = RB.content.maps[m]; return d && d.name ? d.name.en : m; };
  BODY.network = (spec) => {
    const st = FW().stateOf(S(), spec.id), here = S().map, L = spec.levels || 3;
    const lv = (k) => +st['b_' + k] || 0;
    let h = '<div class="wv-lab">The water</div><ul class="vb-basins">' + Object.keys(spec.basins).map((k) => {
      const b = spec.basins[k];
      return '<li><span class="vb-n">' + both(b) + '<span class="vb-where">' + esc(b.map === here ? 'here' : mapName(b.map)) + '</span></span>' +
        '<span class="vb-meter" role="img" aria-label="' + esc(V().LEVEL_EN[lv(k)]) + '">' + Array.from({ length: L }, (x, i) => '<i class="' + (i < lv(k) ? 'on' : '') + '"></i>').join('') + '</span><span class="vb-lv">' + esc(V().LEVEL_EN[lv(k)]) + '</span></li>';
    }).join('') + '</ul>';
    h += '<div class="wv-lab">The sluices</div><ul class="vb-gates">' + Object.keys(spec.gates).map((g) => {
      const G = spec.gates[g], open = st['g_' + g] === 'open', reach = G.map === here;
      return '<li><span class="vb-n">' + both(G) + '<span class="vb-where">' + esc(reach ? 'here' : mapName(G.map)) + '</span></span><span class="vb-state">' + (open ? 'Open' : 'Shut') + '</span>' +
        (reach ? btn((open ? 'shut:' : 'open:') + g, open ? 'Close it' : 'Open it', open ? 'none' : 'key', ' data-gate="' + esc(g) + '"') : '<span class="vb-far">Out of reach from here</span>') + '</li>';
    }).join('') + '</ul>';
    if ((spec.required || []).length) h += '<div class="wv-lab">Ways that must stay open</div><ul class="ar-list">' + spec.required.map((r) => { const ok = V().passable(spec, st, r); return '<li class="' + (ok ? 'ok' : 'no') + '">' + both(r) + ' — ' + (ok ? 'passable' : 'under water') + '</li>'; }).join('') + '</ul>';
    return h;
  };

  // ---- W14 · observe and follow ----------------------------------------------------------------------------------------
  function tickObserve() {
    if (!cur || cur.spec.kind !== 'observe') return;
    if (cur.timer) clearTimeout(cur.timer);
    if (!cur.view.play) return;
    cur.timer = setTimeout(() => { if (!cur || !cur.view.play) return; cur.t += cur.spec.beat || 900; render(); tickObserve(); }, cur.spec.beat || 900);
  }
  BODY.observe = (spec) => {
    const st = FW().stateOf(S(), spec.id), rec = FW().peek(S(), spec.id);
    const ph = V().phaseAt(spec, st, cur.t), P = spec.phases[ph] || {};
    const pat = V().pattern(spec, st.adj);
    let h = '<div class="vb-machine" aria-live="off"><div class="vb-phase">' + both(P) + '</div><ul class="vb-parts">' +
      spec.parts.map((p) => { const s0 = (P.parts || {})[p.key]; const w = p.states[s0] || { en: s0, jp: s0 }; return '<li class="st-' + esc(s0) + '"><span class="vb-n">' + both(p) + '</span><span class="vb-ps">' + both(w) + '</span></li>'; }).join('') + '</ul></div>';
    h += '<ol class="vb-pattern" aria-label="The pattern, in order">' + pat.map((x, i) => '<li class="' + (x === ph ? 'now' : '') + '"' + (x === ph ? ' aria-current="step"' : '') + '>' + both(spec.phases[x]) + '</li>').join('') + '</ol>';
    h += '<div class="wv-foot">' + btn('play', cur.view.play ? 'Pause' : 'Watch it run', cur.view.play ? 'none' : 'next', ' aria-pressed="' + !!cur.view.play + '"') + btn('step', 'Next movement', 'next') + '</div>';
    const here = (spec.clues || []).filter((c) => c.phase === ph);
    const seen = (spec.clues || []).filter((c) => rec.seen && rec.seen[c.id]);
    if (here.length) h += '<div class="wv-foot">' + here.filter((c) => !(rec.seen && rec.seen[c.id])).map((c) => btn('note:' + c.id, 'Note what you see', 'note')).join('') + '</div>';
    if (seen.length) h += '<div class="wv-lab">What you have noticed</div><ul class="ar-list">' + seen.map((c) => '<li class="unsure">' + both(c) + '</li>').join('') + '</ul>';
    const on = String(st.adj || '').split(',').filter(Boolean);
    h += '<div class="wv-lab">Adjustments</div><div class="ar-slots">' + spec.adjustments.map((A) => '<button type="button" class="wv-t" data-a="adjust:' + esc(A.id) + '" aria-pressed="' + (on.indexOf(A.id) >= 0) + '"><span class="vb-jp">' + J(A) + '</span><span class="en">' + esc(A.en) + (on.indexOf(A.id) >= 0 ? ' (made)' : '') + '</span></button>').join('') + '</div>';
    return h;
  };
  BODY.follow = (spec) => {
    const st = FW().stateOf(S(), spec.id);
    if (st.step >= spec.steps.length) return '<p>' + both(spec.done) + '</p>';
    const step = spec.steps[st.step];
    return '<div class="wv-lab">Step ' + (st.step + 1) + ' of ' + spec.steps.length + '</div><div class="vb-notice-preview">' + both(step) + '</div><div class="ar-slots">' +
      step.options.map((op) => '<button type="button" class="wv-t" data-a="do:' + st.step + ':' + esc(op.id) + '"><span class="vb-jp">' + J(op) + '</span><span class="en">' + esc(op.en) + '</span></button>').join('') + '</div>';
  };

  // ---- W15 · route ------------------------------------------------------------------------------------------------------
  BODY.route = (spec) => {
    const st = FW().stateOf(S(), spec.id);
    const at = (spec.creature.say || {})[st.route];
    const obj = cur.part && FW().get(spec.id).objects[cur.part];
    return (at ? '<p class="vb-notice-preview">' + both(at) + '</p>' : '') + (obj ? '<div class="wv-look"><div class="wv-name">' + both(obj.name) + '</div></div>' : '') +
      '<p class="muted small">Words woven here can move it along; nothing needs to be fought.</p><div class="wv-foot">' + btn('weave', 'Weave a word here', 'words', '', 'primary') + '</div>';
  };

  // ---- W16 · layers -------------------------------------------------------------------------------------------------------
  BODY.layers = (spec) => {
    const s = S(), view = cur.view.layer || 'both';
    const seen = (mk) => RB.cases.observed(s, V().clueId(spec, mk.id));
    let m;
    try { m = RB.maps.compile(spec.map); } catch (e) { return ''; }
    const k = 8, W = m.w * k, H = m.h * k;
    let svg = '<rect width="' + W + '" height="' + H + '" class="vb-ground"/>';
    for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
      const t = m.tiles[y * m.w + x];
      const cls = t && t.water ? 'vb-water' : RB.maps.blockedStatic(m, x, y) ? 'vb-wall' : null;
      if (cls) svg += '<rect x="' + x * k + '" y="' + y * k + '" width="' + k + '" height="' + k + '" class="' + cls + '"/>';
    }
    if (view !== 'today') spec.plan.marks.forEach((mk, i) => {
      svg += '<g class="vb-oldmark' + (seen(mk) ? ' seen' : '') + '" transform="translate(' + (mk.x * k + k / 2) + ',' + (mk.y * k + k / 2) + ')"><circle r="' + k * 1.1 + '"/><text y="4" text-anchor="middle">' + (i + 1) + '</text></g>';
    });
    if (s.map === spec.map) svg += '<path class="vb-you" d="M' + (s.x * k + k / 2) + ' ' + (s.y * k) + ' l5 8 h-10 z"/>';
    let h = '<div class="ar-slots" role="radiogroup" aria-label="What the picture shows">' + radio('layer', 'both', view === 'both', '<span class="en">The old plan over today</span>') + radio('layer', 'today', view === 'today', '<span class="en">Today only</span>') + '</div>' +
      '<div class="vb-plan"><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc('The road today' + (view === 'today' ? '' : ', with the old plan\'s ' + spec.plan.marks.length + ' marks, numbered as in the list below') + (s.map === spec.map ? '. The triangle is you.' : '')) + '">' + svg + '</svg></div>';
    h += '<p class="muted small">' + both(spec.plan.title) + '</p><ol class="vb-marks">' + spec.plan.marks.map((mk) => '<li class="' + (seen(mk) ? 'ok' : '') + '"><span class="vb-n">' + both(mk) + '</span>' + (seen(mk) ? '<span class="vb-obs">' + both(mk.obs) + '</span>' : '<span class="vb-far">Not compared yet: walk to it and look.</span>') + '</li>').join('') + '</ol>';
    const hs = RB.cases.hyps(s, spec.id);
    if (!hs.length) return h + '<div class="wv-lab">' + both(spec.question) + '</div><p class="muted small vb-nohyp">Compare a mark where it is first; then you can say what you think happened.</p>';
    h += '<div class="wv-lab">' + both(spec.question) + '</div><ul class="vb-hyps">' + hs.map((x) => '<li>' + both(x.label) + (x.tried ? '<span class="vb-far">Tried: it does not fit what you saw.</span>' : '') + btn('conclude:' + x.id, 'Conclude this', 'done', RB.cases.solved(s, spec.id) ? ' disabled' : '') + '</li>').join('') + '</ul>';
    return h;
  };

  // ---- W17 · blocking ------------------------------------------------------------------------------------------------------
  BODY.blocking = (spec) => {
    const st = FW().stateOf(S(), spec.id), sel = cur.view.sel || spec.pieces[0].id;
    const scen = new Set((spec.stage.scenery || []).map((t) => t.join(',')));
    const who = {};
    for (const p of spec.pieces) if (st[p.id]) who[st[p.id]] = (who[st[p.id]] || []).concat([p]);
    const token = (c) => (who[c] || []).map((p) => '<span class="vb-tok ' + p.kind + '">' + J(p) + '</span>').join('');
    const cell = (c, label) => '<button type="button" class="vb-cell' + (scen.has(c) ? ' scen' : '') + '" data-cell="' + c + '"' + (scen.has(c) ? ' disabled aria-label="Scenery: nobody stands here"' : ' aria-label="' + esc(label + ((who[c] || []).length ? ': ' + who[c].map((p) => p.en).join(', ') : '')) + '"') + '>' + token(c) + '</button>';
    let h = '<div class="wv-lab">Directions</div><ol class="vb-dirs">' + spec.directions.map((d, i) => { const r = cur.view.result && cur.view.result.directions[i]; return '<li class="' + (r ? (r.ok ? 'ok' : 'no') : '') + '">' + both(d) + '</li>'; }).join('') + '</ol>';
    h += '<div class="wv-lab">Place</div><div class="ar-slots" role="radiogroup" aria-label="Piece to place">' + spec.pieces.map((p) => radio('piece', p.id, sel === p.id, '<span class="vb-jp">' + J(p) + '</span><span class="en">' + esc(p.en) + '</span>')).join('') + '</div>';
    h += '<div class="vb-stage" style="--w:' + spec.stage.w + '"><div class="vb-wing">' + cell('wing:left', 'Shimote wing (the audience\'s left)') + '<span class="vb-small">' + RB.ui.jhtml('{下手|しもて}') + '</span></div><div class="vb-grid">';
    for (let y = 0; y < spec.stage.h; y++) for (let x = 0; x < spec.stage.w; x++) h += cell(x + ',' + y, 'Stage, ' + (y === spec.stage.h - 1 ? 'front' : y === 0 ? 'back' : 'middle') + ' row, ' + (x + 1) + ' from the audience\'s left');
    h += '</div><div class="vb-wing">' + cell('wing:right', 'Kamite wing (the audience\'s right)') + '<span class="vb-small">' + RB.ui.jhtml('{上手|かみて}') + '</span></div></div><p class="muted small vb-aud">The audience is here, in front of the stage.</p>';
    h += '<div class="wv-foot">' + btn('rehearse', 'Rehearse', 'next', '', 'primary') + '</div>';
    return h;
  };
  // the rehearsal: each placed piece walks on from its wing along its path, one after another
  async function rehearse() {
    const spec = cur.spec, st = FW().stateOf(S(), spec.id);
    const res = V().blockingCheck(spec, st);
    cur.view.result = res;
    if (!reduced()) {
      for (const p of spec.pieces) {
        const v = st[p.id];
        if (!v || /^wing:/.test(v)) continue;
        // on from the nearer wing
        const path = V().rehearsalPath(spec, V().cellOf(v)[0] < spec.stage.w / 2 ? 'wing:left' : 'wing:right', v) || [];
        for (const c of path.slice(1, -1)) {
          if (!cur) return;
          const b = cur.el.querySelector('.vb-cell[data-cell="' + c.join(',') + '"]');
          if (b) { b.classList.add('walk'); await new Promise((r) => setTimeout(r, 140)); b.classList.remove('walk'); }
        }
      }
    }
    if (!cur) return;
    const r = act('rehearse');
    if (!r.completed) {
      cur.said = res.directions.filter((d) => !d.ok).map((d) => ({ en: 'Not as directed: "' + d.d.en + '"', jp: d.d.jp })).concat(res.clash.length ? [{ en: 'Two things cannot stand in one place, and nobody stands in the scenery.', jp: '{一|ひと}つ の {場所|ばしょ} に {二|ふた}つ は {置|お}けない 。' }] : []);
      if (!cur.said.length) cur.said = [{ en: 'Not quite.', jp: 'もう {少|すこ}し 。' }];
    } else cur.said = [{ en: 'Everyone is where the directions say. The rehearsal runs through.', jp: '{全員|ぜんいん} 、 {言|い}われた {場所|ばしょ} に いる 。 {稽古|けいこ} は うまく いった 。' }];
    render();
  }

  // ---- input -------------------------------------------------------------------------------------------------------
  async function onClick(e) {
    if (!cur) return;
    const b = e.target.closest('button');
    if (!b || b.disabled) return;
    const spec = cur.spec, s = S();
    const keep = (sel) => render(sel);
    if (b.dataset.a === 'close') { close(); return; }
    if (b.dataset.g) {
      const g = b.dataset.g, v = b.dataset.v;
      if (spec.kind === 'repair' && g === 'tool') cur.view.tool = v;
      else if (spec.kind === 'blocking' && g === 'piece') cur.view.sel = v;
      else if (spec.kind === 'layers' && g === 'layer') cur.view.layer = v;
      else { arrange({ [g]: v }); cur.view.check = false; }
      RB.audio && RB.audio.sfx('page', { vol: 0.4 });
      keep('[data-g="' + g + '"][data-v="' + v + '"]');
      return;
    }
    if (b.dataset.cell) {
      const piece = cur.view.sel || spec.pieces[0].id;
      arrange({ [piece]: b.dataset.cell });
      cur.view.result = null;
      keep('[data-cell="' + b.dataset.cell + '"]');
      return;
    }
    const a = b.dataset.a;
    if (!a) return;
    if (a === 'check') { cur.view.check = true; keep('[data-a="check"]'); return; }
    if (a === 'use') { act('use:' + cur.view.tool + '@' + b.dataset.part); keep('[data-part="' + b.dataset.part + '"]'); return; }
    if (a === 'play') { cur.view.play = !cur.view.play; tickObserve(); keep('[data-a="play"]'); return; }
    if (a === 'step') { cur.view.play = false; tickObserve(); cur.t += spec.beat || 900; keep('[data-a="step"]'); return; }
    if (a === 'weave') { close(); if (RB.weave && RB.weave.open) setTimeout(() => RB.weave.open(), 0); return; }
    if (a === 'rehearse') { await rehearse(); return; }
    if (/^conclude:/.test(a)) {
      const r = V().conclude(s, spec.id, a.slice(9));
      const h = RB.content.cases[spec.id].hypotheses.find((x) => x.id === a.slice(9));
      cur.said = r.ok ? [{ en: 'That fits everything you saw.', jp: '{見|み}た こと と {全部|ぜんぶ} {合|あ}う 。' }]
        : r.why === 'evidence' ? [{ en: 'You have not seen enough yet to say. Compare more of the marks.', jp: 'まだ {見|み}た こと が {足|た}りない 。 {他|ほか} の {印|しるし} も {比|くら}べよう 。' }]
        : [h.mismatch || { en: 'That does not fit what you saw.', jp: '{見|み}た こと と {合|あ}わない 。' }];
      if (r.ok) { cur.view.justDone = true; if (RB.save && RB.save.autosave) RB.save.autosave('progress'); }
      keep();
      return;
    }
    act(a);
    keep('[data-a="' + a + '"]');
  }

  return { open, close, isOpen: () => !!cur, current: () => (cur ? { id: cur.id, kind: cur.spec.kind, t: cur.t, view: cur.view } : null) };
})();
