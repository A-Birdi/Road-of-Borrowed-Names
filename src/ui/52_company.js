/* Company: the fifth folio section (src/ui/50_menu.js). Who is travelling —
 * the committed companion and, if one has been met and chosen, a cosmetic
 * pet — and what the two of you have shared.
 *
 * Three internal pages: Companion, Pet and Shared Memories. On a wide screen
 * the usual two-page spread (identity and choices on the left leaf, the
 * selected detail on the right); on a phone one page with a clear Back.
 *
 * Pages are registered, so the systems that own them draw them:
 *   RB.ui.company.addPage({ id, en, jp, icon, render(A, B, two, api) })
 * `api` is the folio's (see 50_menu.js api()): { s, view, render, close, go,
 * remember, two }, plus `back()` here to leave a detail on a phone. A page
 * that opens a detail on a phone sets api.view.detail and clears it on back.
 * The defaults below are honest minimal pages; later files replace them.
 *
 * Nothing on these pages changes play: no scores, no bonuses. The pet is a
 * cosmetic companion. See docs/ADDENDUM_CONTRACTS.md. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.ui.company = (function () {
  'use strict';
  const esc = RB.util.esc;
  const I = (n, t) => RB.ui.folio.icon(n, t);
  const j = (t) => (t ? RB.ui.jhtml(t) : '');
  const ORDER = ['companion', 'pet', 'memories'];
  const PAGES = {};
  function addPage(def) { PAGES[def.id] = def; }

  const chr = (id) => (id && RB.content.chars[id]) || null;
  // the species label and name of the active pet (RB.pets draws it once it exists)
  function petLine(s) {
    const c = s.company || {};
    const id = c.pet, p = id && c.pets && c.pets[id];
    if (!p) return null;
    const sp = RB.pets && RB.pets.species ? RB.pets.species(id) : null;
    return { id, name: p.name || (sp && sp.name) || id, label: sp ? sp.label : { en: id } };
  }
  // the paired summary at the top: who is travelling (never a third party slot)
  function summary(s) {
    const comp = chr(s.comp), prov = !s.comp && chr(s.provisional);
    const pl = petLine(s);
    const who = comp ? '<b>' + esc(comp.name.en) + '</b> <span class="muted">' + esc(comp.role ? comp.role.en : '') + '</span>'
      : prov ? '<b>' + esc(prov.name.en) + '</b> <span class="muted">travelling with you for now; not yet decided</span>'
        : '<span class="muted">No one has joined you yet.</span>';
    const pet = pl ? '<b>' + esc(pl.name) + '</b> <span class="muted">' + esc(pl.label.en || '') + '</span>' : '<span class="muted">No pet</span>';
    return '<div class="co-pair" role="group" aria-label="Travelling together"><div class="co-who">' + I('companion') + '<span>' + who + '</span></div>' +
      '<div class="co-who">' + I('paw') + '<span>' + pet + '</span></div></div>';
  }
  function nav(cur) {
    return '<div class="subnav" role="group" aria-label="Company pages">' + ORDER.filter((id) => PAGES[id]).map((id) =>
      '<button class="subbtn" data-cp="' + id + '" aria-pressed="' + (cur === id) + '">' + I(PAGES[id].icon || 'companion') + esc(PAGES[id].en) + '</button>').join('') + '</div>';
  }
  function defaultPage(s) {
    if (s.comp || s.provisional) return 'companion';
    return s.company && s.company.pet ? 'pet' : 'companion';
  }
  function render(A, B, two, api) {
    const s = api.s;
    const V = api.view;
    if (!V.page || !PAGES[V.page]) V.page = defaultPage(s);
    const page = PAGES[V.page];
    A.innerHTML = summary(s) + nav(V.page);
    const holder = RB.ui.el('div', 'xpage co-page');
    A.appendChild(holder);
    if (two) B.innerHTML = '';
    page.render(holder, B, two, Object.assign({ back: () => back(api) }, api));
    A.addEventListener('click', (e) => {
      const b = e.target.closest('[data-cp]');
      if (!b) return;
      api.remember(); V.page = b.dataset.cp; V.detail = null; api.render();
    });
  }
  // Back on a phone: leave an open detail first; otherwise let the folio close
  function back(api) {
    if (api.view.detail && !RB.ui.folio.wide()) { api.view.detail = null; api.render(); return true; }
    return false;
  }

  // ---- honest defaults (replaced by the systems that own each page) ---------------------------
  addPage({ id: 'companion', en: 'Companion', jp: '{相棒|あいぼう}', icon: 'companion', render(A, B, two, api) {
    const s = api.s, comp = chr(s.comp);
    if (!comp) {
      const prov = chr(s.provisional);
      A.innerHTML = prov ? '<p>' + esc(prov.name.en) + ' is travelling with you for now. Nothing is decided until you set out together.</p>'
        : '<p class="muted">No one travels with you yet.</p>';
      return;
    }
    const acts = (RB.content.companionActions && RB.content.companionActions[s.comp]) || [];
    const open = acts.filter((a) => !a.unlock || RB.state.test(s, a.unlock));
    const html = '<h3>' + j(comp.name.jp) + ' <span class="en">' + esc(comp.name.en) + '</span></h3>' +
      '<p class="muted">' + esc(comp.role ? comp.role.en : '') + '</p>' +
      '<h4>' + I('companion') + ' On their turn in battle</h4><ul class="entries">' + open.map((a) => '<li class="entry"><span class="mark">' + I('next') + '</span><div><div class="t">' + j(a.name.jp) + ' <span class="en">' + esc(a.name.en) + '</span></div><div class="muted small">' + esc(a.desc || '') + '</div></div></li>').join('') + '</ul>';
    A.innerHTML = html;
  } });
  addPage({ id: 'pet', en: 'Pet', jp: '{動物|どうぶつ}', icon: 'paw', render(A) {
    A.innerHTML = '<p class="muted">You haven’t met an animal on the road yet. Travelling without one is a complete way to travel.</p>';
  } });
  addPage({ id: 'memories', en: 'Shared memories', jp: '{思|おも}い{出|で}', icon: 'journey', render(A, B, two, api) {
    const m = (api.s.company || {}).memories || [];
    A.innerHTML = m.length ? '<ol class="entries">' + m.map((x) => '<li class="entry"><div><div class="t">' + esc(x.title ? x.title.en : x.id) + '</div></div></li>').join('') + '</ol>'
      : '<p class="muted">Moments you share on the road will be kept here.</p>';
  } });
  return { addPage, render, back, summary, pages: PAGES };
})();
