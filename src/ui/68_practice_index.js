/* Words › Ways to practise (Practice addendum §20.1): where each roadside
 * activity is offered and whether it can begin from here. It never launches a
 * physical activity remotely: "Begin here" appears only when you are at its
 * place and the world is safe; otherwise the page says where to go. Entries
 * are registered with RB.practice.addActivity (src/engine/08_practice.js). */
RB.ui.practiceIndex = (function () {
  'use strict';
  const esc = RB.util.esc;
  const I = (n) => (RB.ui.folio ? RB.ui.folio.icon(n) : '');
  const J = (jp) => (jp ? '<span class="jt-wrap">' + RB.ui.jhtml(jp) + '</span> ' : '');

  function status(d, s) {
    let available = true, here = false, note = '';
    try { available = d.available ? !!d.available(s) : true; } catch (e) { available = false; }
    try { here = available && d.here ? !!d.here(s) : false; } catch (e) { here = false; }
    try { note = d.note ? d.note(s) || '' : ''; } catch (e) { note = ''; }
    const safe = RB.activity ? RB.activity.safe() : { ok: false };
    return { available, here, canBegin: here && safe.ok && !!d.begin, why: here && !safe.ok ? (safe.why === 'danger' ? 'Not with a creature close by.' : 'Not just now.') : '', note };
  }

  function html(s) {
    const acts = RB.practice.activities();
    let h = '<p class="muted small">Optional ways to use your Japanese along the road. None is needed for the story; none keeps a streak or a clock (fishing\'s pace is off unless you choose it).</p>';
    if (!acts.length) return h + '<p class="muted">Nothing is offered yet.</p>';
    h += '<ul class="entries pr-index">';
    for (const d of acts) {
      const st = status(d, s);
      h += '<li class="entry pr-act" data-pr="' + esc(d.id) + '"><span class="mark">' + I(d.icon || 'practice') + '</span><div>' +
        '<div class="t">' + J(d.jp) + '<span class="en">' + esc(d.en) + '</span></div>' +
        (d.where ? '<div class="small">' + I('map') + ' ' + J(d.where.jp) + '<span class="en">' + esc(d.where.en) + '</span></div>' : '') +
        '<div class="small muted">' + esc(!st.available ? (st.note || 'Not available yet.') : st.canBegin ? 'You are here.' : st.why || st.note || 'Offered at its place.') + '</div>' +
        (st.canBegin ? '<div class="row-acts"><button class="pbtn" data-pr-begin="' + esc(d.id) + '">' + I('practice') + 'Begin here</button></div>' : '') +
        '</div></li>';
    }
    return h + '</ul>';
  }
  function wire(el, s) {
    el.onclick = async (e) => {
      const b = e.target.closest('[data-pr-begin]');
      if (!b || b.disabled) return;
      const d = RB.practice.activities().find((x) => x.id === b.dataset.prBegin);
      if (!d || !status(d, s).canBegin) return;
      b.disabled = true;
      try { await d.begin({ source: 'words' }); } finally { b.disabled = false; }
    };
  }
  if (RB.ui.menu && RB.ui.menu.addPage) {
    RB.ui.menu.addPage('words', {
      id: 'practice', en: 'Ways to practise', jp: '{練習|れんしゅう} の {場所|ばしょ}',
      count: (s) => RB.practice.activities().filter((d) => status(d, s).available).length,
      available: () => RB.practice.activities().length > 0,
      html, wire,
    });
  }
  if (RB.ui.settings && RB.ui.settings.addRows) {
    RB.ui.settings.addRows('learning', ({ radios, sw }) => '<h3 class="pr-set">Ways to practise</h3>' +
      radios('activityChatter', 'Companion remarks during activities', [['normal', 'Normal'], ['quiet', 'Quiet']], null, 'Quiet keeps rules and results, and drops incidental comments.') +
      sw('hideTotals', 'Hide shiritori win/loss totals', 'Stage records stay visible.') +
      sw('fishSeconds', 'Show seconds beside the fishing line', 'Only when you choose a pace; fishing is untimed by default.') +
      sw('fishWait', 'Waiting animation before a bite', 'Off goes straight to the bite; the fish is the same.'));
  }
  return { html, status };
})();
