/* The Atlas's commission board on screen (expansion P07; plan D7; src/atlas/80_commissions.js), and the
 * Cartographer's Atlas (Map › Cartographer's Atlas): the surveys you finished, each route as you walked it with the
 * landmarks you verified, and what is still to survey (F-30).
 *   RB.ui.atlasBoard.open(s) → Promise<commission | null>: choose a commission and its length; the card says what the
 *   run will be (its topic, what is new to you, how many rooms, the rules) before anything is fixed. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.ui.atlasBoard = (function () {
  'use strict';
  const esc = RB.util.esc;
  const I = (n) => (RB.ui.folio ? RB.ui.folio.icon(n) : '');
  const K = () => RB.atlasCommissions;
  const KIND = { practice: { en: 'Practice', jp: '{練習|れんしゅう}' }, themed: { en: 'Errands', jp: '{仕事|しごと}' }, survey: { en: 'Surveys', jp: '{測量|そくりょう}' } };
  let V = null;

  // the run this commission would be (the same seed the board's run will have), for exact numbers before it is fixed
  function probe(s, c) {
    const s2 = Object.assign({}, s, { atlas: Object.assign({}, s.atlas, { started: (s.atlas.started || 0) + 1 }) });
    const run = RB.atlas.newRun(s2, [], {});
    run.commission = c;
    const plan = RB.atlas.plan(run);
    const lens = [];
    const walk = (key, n) => { const d = plan.rooms[key]; if (!d || !d.next.length) { lens.push(n); return; } for (const k of d.next) walk(k, n + 1); };
    walk(plan.start, 1);
    const area = c.area && K().AREAS[c.area] ? K().AREAS[c.area].patterns : [];
    const marks = Object.values(plan.rooms).filter((d) => area.indexOf(d.pattern) >= 0 && ['path', 'branch', 'wild'].indexOf(d.kind) >= 0).length;
    return { min: Math.min(...lens), max: Math.max(...lens), marks };
  }
  function newItems(s, c) { return c.topic ? c.topic.items.filter((id) => !(RB.learn.introduced && RB.learn.introduced(id)) && !((s.learn.items[id] || {}).seen > 0)) : []; }
  function cardHtml(s) {
    const o = V.offers.find((x) => x.id === V.pick);
    if (!o) return '<p class="muted">Choose a commission.</p>';
    const c = K().commission(o, V.length), p = probe(s, c), fresh = newItems(s, c);
    const rows = [];
    rows.push(['Client', esc((o.client && o.client.en) || 'The board') + (o.done ? ' <span class="muted small">' + esc('(done ' + o.done + (o.done === 1 ? ' time' : ' times') + ')') + '</span>' : '')]);
    rows.push(['Aim', esc(o.aim.en)]);
    if (c.topic) rows.push(['Topic', esc(c.topic.title.en) + ' <span class="muted small">' + esc('(' + c.topic.items.length + ' items' + (fresh.length ? '; ' + fresh.length + ' new to you, each shown before it is asked' : '') + ')') + '</span>']);
    rows.push(['Length', esc(K().LENGTHS[c.length].en + ': ' + (p.min === p.max ? p.min : p.min + '–' + p.max) + ' rooms on the way (you choose at each fork). ' + K().LENGTHS[c.length].about)]);
    if (c.kind === 'survey') rows.push(['Survey', esc(p.marks + ' landmark' + (p.marks === 1 ? '' : 's') + ' on this route to verify, one in each room of ' + K().AREAS[c.area].title.en.toLowerCase() + '. Verifying is optional; the survey counts once all of them on the road you walk are verified.')]);
    rows.push(['Rules', '<ul class="xp-rules"><li>' + esc('The route is fixed when you set out; it never changes after a mistake.') + '</li><li>' + esc(c.topic ? 'Inside it, the lanterns and creatures ask about the topic, your weakest items first.' : 'Inside it, the practice follows your weakest items, as on any road.') + '</li><li>' + esc('As on any road: a camp to turn back from (on a standard or long road), and defeat brings you home with what you learned.') + '</li></ul>']);
    return '<div class="xp-card">' + rows.map(([k, v]) => '<div class="xp-row"><div class="xp-k">' + esc(k) + '</div><div class="xp-v">' + v + '</div></div>').join('') + '</div>';
  }
  function listHtml() {
    let h = '';
    for (const kind of ['practice', 'themed', 'survey']) {
      const L = V.offers.filter((o) => o.kind === kind);
      if (!L.length) continue;
      h += '<fieldset class="ab-set"><legend>' + RB.ui.jhtml(KIND[kind].jp) + ' <span class="en">' + esc(KIND[kind].en) + '</span></legend>' +
        L.map((o) => '<label class="ab-opt"><input type="radio" name="ab-offer" value="' + esc(o.id) + '"' + (o.id === V.pick ? ' checked' : '') + '><span class="ab-t">' + (o.title.jp ? '<span class="jp">' + RB.ui.jhtml(o.title.jp) + '</span> ' : '') + '<span class="en">' + esc(o.title.en) + '</span>' + (o.done ? ' ' + I('done') : '') + '</span></label>').join('') + '</fieldset>';
    }
    h += '<fieldset class="ab-set"><legend>How long</legend>' + Object.keys(K().LENGTHS).map((k) => '<label class="ab-opt"><input type="radio" name="ab-len" value="' + k + '"' + (k === V.length ? ' checked' : '') + '><span class="ab-t"><span class="jp">' + RB.ui.jhtml(K().LENGTHS[k].jp) + '</span> <span class="en">' + esc(K().LENGTHS[k].en) + '</span></span></label>').join('') + '</fieldset>';
    return h;
  }
  function render() {
    if (!V) return;
    const two = V.fr.el.clientWidth > 760;
    V.box.innerHTML = '<div class="leaf ab-leaf" tabindex="-1"><p class="muted">' + esc('Commissions pinned to the board. Choose one and how long a road you want; the card shows what it will be before anything is fixed.') + '</p>' +
      '<div class="ab-grid' + (two ? ' two' : '') + '"><div class="ab-list">' + listHtml() + '</div><div class="ab-card">' + cardHtml(V.s) +
      '<div class="sg-acts"><button type="button" class="pbtn primary" data-a="take">' + I('next') + '<span>Take this commission</span></button><button type="button" class="pbtn" data-a="no">Not now</button></div></div></div></div>';
  }
  function open(s) {
    return new Promise((resolve) => {
      const offers = K().offers(s);
      const finish = (c) => { if (!V) return; RB.ui.popLayer(V.layer); V = null; resolve(c); };
      const fr = RB.ui.folio.frame({ cls: 'xp-folio ab-folio', onClose: () => finish(null), closeLabel: 'Not now', closeIcon: 'back' });
      fr.setTitle(RB.ui.label('{依頼|いらい} の {掲示板|けいじばん}', 'The commission board'), 'The Unwritten Atlas');
      V = { s, fr, box: fr.box, offers, pick: offers[0] ? offers[0].id : null, length: 'standard' };
      V.layer = { el: fr.scrim, name: 'atlas-board', onCancel: () => finish(null) };
      fr.box.addEventListener('change', (e) => {
        if (e.target.name === 'ab-offer') { V.pick = e.target.value; render(); }
        if (e.target.name === 'ab-len') { V.length = e.target.value; render(); }
      });
      fr.box.addEventListener('click', (e) => {
        const b = e.target.closest('[data-a]');
        if (!b || !V) return;
        if (b.dataset.a === 'no') finish(null);
        if (b.dataset.a === 'take') { const o = V.offers.find((x) => x.id === V.pick); finish(o ? K().commission(o, V.length) : null); }
      });
      RB.ui.pushLayer(V.layer);
      render();
    });
  }

  // ---- the Cartographer's Atlas (Map tab) ---------------------------------------------------------------------------
  function routeSvg(route) {
    const step = 34, h = 54, w = Math.max(1, route.length) * step + 10;
    let out = '<svg class="ab-route" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="' + esc('The surveyed route: ' + route.length + ' rooms') + '"><line x1="17" y1="20" x2="' + (w - 17) + '" y2="20" class="ab-line"/>';
    route.forEach((r, i) => {
      const x = 17 + i * step;
      out += '<circle cx="' + x + '" cy="20" r="' + (r.pattern && K().areaOf(r.pattern) ? 8 : 5) + '" class="ab-node' + (r.verified ? ' on' : '') + '"/>' + (r.verified ? '<path d="M' + (x - 4) + ' 20 l3 3 l5 -6" class="ab-tick"/>' : '');
      const pat = r.pattern && RB.content.atlas && RB.content.atlas.patterns[r.pattern];
      if (pat && K().areaOf(r.pattern)) out += '<text x="' + x + '" y="44" text-anchor="middle" class="ab-lab">' + esc(pat.name.en.replace(/^The /, '').split(' ').slice(0, 2).join(' ')) + '</text>';
    });
    return out + '</svg>';
  }
  function cartographerHtml(s) {
    const rec = K().peek(s);
    let h = '<h3>' + I('map') + ' ' + RB.ui.jhtml('{地図師|ちずし} の {地図帳|ちずちょう}') + ' <span class="en">' + esc('The Cartographer\'s Atlas') + '</span></h3>' +
      '<p class="muted small">' + esc('One page for each area of the Unwritten Atlas you have surveyed. Rooms of a surveyed area open their way on for you in later walks.') + '</p>';
    for (const a in K().AREAS) {
      const A = K().AREAS[a], sv = rec.surveys[a];
      h += '<div class="ab-page"><h4>' + RB.ui.jhtml(A.title.jp) + ' <span class="en">' + esc(A.title.en) + '</span>' + (sv ? ' <span class="kind">' + I('done') + ' surveyed</span>' : '') + '</h4>' +
        (sv ? routeSvg(sv.route) + '<p class="small">' + esc(sv.route.filter((r) => r.verified).length + ' landmarks verified on a road of ' + sv.route.length + ' rooms.') + '</p>'
          : '<p class="muted small">' + esc('Not surveyed yet. Its rooms: ' + A.patterns.map((p) => (RB.content.atlas.patterns[p] || { name: { en: p } }).name.en).join(', ') + '.') + '</p>') + '</div>';
    }
    return h;
  }
  if (RB.ui.menu && RB.ui.menu.addPage) {
    RB.ui.menu.addPage('map', {
      id: 'cartographer', en: 'Cartographer\'s Atlas', icon: 'map',
      available: (s) => !!(s && RB.recordsUI && RB.recordsUI.inCampaign(s) && s.atlas && (s.atlas.unlocked || (s.flags && s.flags.postgame))),
      render(A) { A.innerHTML = cartographerHtml(RB.game.s); },
    });
  }
  return { open, probe, cartographerHtml, routeSvg, state: () => (V ? { pick: V.pick, length: V.length } : null) };
})();
