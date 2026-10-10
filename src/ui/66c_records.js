/* The journey's records in the Wayfarer's Ledger and on the Main Menu (expansion P06; K1–K5, K6 tier 1, K8; the
 * engines in src/engine/58b_records.js). Journey › Stamp book and Journey › Travel volume appear in journeys of the
 * twelve-chapter edition (F-21); the Main Menu's Travel volume appears once the edition ships or the development
 * switch is on.
 *
 *   Stamp book     every stamp in its family: pressed (the design in ink, where and when), ready (earned; its stand
 *                  waits in a town), or open (its criteria; a hidden one in neutral words). No counters to fill, no
 *                  percentages.
 *   Travel volume  your seal (and changing it); every page of the volume: viewable ones with their picture, the
 *                  seal on those you witnessed and "Watch it again" (read-only: nothing in the journey changes);
 *                  the rest as their criteria only, never their picture or title. A special page is revealed after
 *                  a confirmation.
 *   Main Menu      everything (H1), veiled until revealed (K5: one page or a whole chapter, after a one-line
 *                  confirmation; re-veil; "Show all illustrations unveiled"); the Continue save's look and seals,
 *                  fixed while the volume is open; a replay uses a neutral fixture branch. Nothing is written to
 *                  any save: the reveals are a device preference. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.ui.records = (function () {
  'use strict';
  const esc = RB.util.esc;
  const I = (n) => (RB.ui.folio ? RB.ui.folio.icon(n) : '');
  const J = (x) => (x && x.jp ? RB.ui.jhtml(x.jp) : '');
  const both = (x) => (x ? '<span class="rb-jp">' + J(x) + '</span><span class="en">' + esc(x.en || '') + '</span>' : '');
  const FAMILY = [
    ['chapter', 'Chapters', '{章|しょう}'], ['region', 'People helped', '{頼|たの}み'], ['dungeon', 'Places explored', '{探索|たんさく}'],
    ['pastime', 'Pastimes', '{遊|あそ}び'], ['milestone', 'Along the way', '{道|みち}すがら'], ['language', 'What I can do', 'できる こと'],
  ];

  // ---- a stamp's design (SVG: a shape, a motif, an ink; pictures, never characters) ---------------------------------
  const MOTIF = {
    bridge: 'M8 26 Q20 12 32 26 M8 26 H32 M12 26 V30 M28 26 V30',
    wave: 'M6 22 Q11 16 16 22 T26 22 T36 22 M6 28 Q11 22 16 28 T26 28 T36 28',
    leaf: 'M20 8 C30 14 30 26 20 32 C10 26 10 14 20 8 Z M20 10 V31',
    bell: 'M14 28 C14 16 16 12 20 12 C24 12 26 16 26 28 Z M12 28 H28 M20 28 V31',
    lantern: 'M15 12 H25 M14 14 H26 V27 H14 Z M16 27 V30 H24 V27 M20 9 V12',
    book: 'M8 12 Q14 10 20 13 Q26 10 32 12 V29 Q26 27 20 30 Q14 27 8 29 Z M20 13 V30',
    chain: 'M8 20 a4 4 0 1 1 8 0 a4 4 0 1 1 -8 0 M16 20 a4 4 0 1 1 8 0 a4 4 0 1 1 -8 0 M24 20 a4 4 0 1 1 8 0 a4 4 0 1 1 -8 0',
    fish: 'M8 20 Q18 10 30 20 Q18 30 8 20 Z M30 20 L35 15 V25 Z',
    brush: 'M26 8 L30 12 L16 26 L12 22 Z M12 22 Q7 27 9 31 Q13 33 16 26',
    ear: 'M14 14 Q20 6 27 13 Q30 20 23 24 Q20 27 22 31 M18 17 Q21 14 23 18',
    path: 'M10 32 Q14 22 20 20 Q27 18 30 8 M14 30 L12 28 M28 12 L31 9',
    stairs: 'M8 31 H15 V25 H21 V19 H27 V13 H33 M8 31 V34 M33 13 V9',
    plaque: 'M11 13 H29 V28 H11 Z M15 13 L20 8 L25 13 M15 18 H25 M15 23 H25',
    koma: 'M20 7 L28 11 L31 32 H9 L12 11 Z M16 18 H24 M20 18 V28 M16 23 H24',
    card: 'M11 9 H29 V33 H11 Z M15 13 a3 3 0 1 0 0.1 0 M14 24 q6 -6 12 0 M14 28 h12',
  };
  function stampSvg(d, state, label) {
    const ink = state === 'pressed' ? d.design.ink : '#8a7a62';
    const op = state === 'pressed' ? 0.95 : 0.55, dash = state === 'pressed' ? '' : ' stroke-dasharray="3 2"';
    let shape;
    const sh = d.design.shape;
    if (sh === 'square') shape = '<rect x="3" y="3" width="34" height="34" rx="4" fill="none" stroke="' + ink + '" stroke-width="2.6"' + dash + '/>';
    else if (sh === 'oval') shape = '<ellipse cx="20" cy="20" rx="17" ry="14" fill="none" stroke="' + ink + '" stroke-width="2.6"' + dash + '/>';
    else if (sh === 'hexagon') shape = '<path d="M20 2 L36 11 V29 L20 38 L4 29 V11 Z" fill="none" stroke="' + ink + '" stroke-width="2.6"' + dash + '/>';
    else shape = '<circle cx="20" cy="20" r="17" fill="none" stroke="' + ink + '" stroke-width="2.6"' + dash + '/><circle cx="20" cy="20" r="14" fill="none" stroke="' + ink + '" stroke-width="1"' + dash + '/>';
    const motif = state === 'open' && d.hidden ? '<text x="20" y="25" text-anchor="middle" font-size="14" font-weight="700" fill="' + ink + '">?</text>' : '<path d="' + (MOTIF[d.design.motif] || MOTIF.path) + '" fill="none" stroke="' + ink + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
    return '<svg class="rb-stamp ' + state + '" viewBox="0 0 40 40" role="img" aria-label="' + esc(label) + '"><g opacity="' + op + '">' + shape + motif + '</g></svg>';
  }

  // ---- Journey › Stamp book ---------------------------------------------------------------------------------------
  const STATE_WORD = { pressed: 'Pressed', ready: 'Earned: ready to press', open: 'Not yet' };
  function stamps(A, B, two, api) {
    const s = api.s;
    RB.stampBook.settle(s);
    const book = RB.stampBook.book(s);
    const stands = RB.content.stampStands || {};
    const fmt = (t) => { try { return new Date(t).toLocaleDateString(); } catch (e) { return ''; } };
    let h = '<h3>' + I('ledger') + ' The Road Stamp Book <span class="count">' + book.filter((x) => x.state === 'pressed').length + ' pressed</span></h3>' +
      '<p class="muted small">A stamp for each moment worth keeping. Many are pressed at a stand in the town where it happened; the rest are pressed as soon as they are earned. None asks for a way of answering or for doing without help.</p>';
    for (const [fam, en, jp] of FAMILY) {
      const L = book.filter((x) => x.d.family === fam);
      if (!L.length) continue;
      h += '<h4 class="rb-fam">' + RB.ui.jhtml(jp) + ' <span class="en">' + esc(en) + '</span></h4><ul class="rb-stamps">' + L.map((x) => {
        const st = stands[x.d.stand];
        const title = x.veiled ? { en: 'A stamp of the story', jp: '{物語|ものがたり} の {判|はん}' } : x.d.title;
        const note = x.state === 'pressed' ? 'Pressed' + (x.at && stands[x.at] ? ' at ' + stands[x.at].title.en : '') + (x.t ? ', ' + fmt(x.t) : '')
          : x.state === 'ready' ? 'Earned: press it at the stand in ' + (st ? st.title.en : 'its town') + '.'
          : x.d.criteria.en;
        return '<li class="rb-st ' + x.state + '" data-stamp="' + esc(x.id) + '">' + stampSvg(x.d, x.state, STATE_WORD[x.state] + ': ' + title.en) +
          '<div class="rb-st-t">' + both(title) + '<span class="rb-st-n">' + esc(note) + '</span></div></li>';
      }).join('') + '</ul>';
    }
    if (two) { A.innerHTML = h; B.innerHTML = '<p class="muted">Stands are found in each town, near where you arrive. A stand presses every stamp of its town that you have earned.</p>'; }
    else A.innerHTML = h;
  }

  // ---- your seal -------------------------------------------------------------------------------------------------
  const V = { seal: null, status: '' };
  function sealBlock(s) {
    const cur = RB.seal.of(s);
    if (!V.seal) return '<div class="rb-seal-box">' + RB.seal.svg(cur, 56, 'Your seal: ' + cur.kana) + '<div><p>Your seal marks every page you witnessed. In this world a seal is a name: you press it as yourself.</p>' +
      '<button type="button" class="pbtn" data-a="seal-edit">' + I('note') + '<span>' + (cur.chosen ? 'Change your seal' : 'Design your seal') + '</span></button></div></div>';
    const d = V.seal, name = String((s.player && (s.player.nameJp || s.player.name)) || '');
    const kanaOpts = [...new Set([...name].filter((c) => RB.kana && RB.kana.isKana(c)))].slice(0, 8);
    if (kanaOpts.indexOf(d.kana) < 0 && d.kana) kanaOpts.unshift(d.kana);
    return '<div class="rb-seal-form" role="group" aria-label="Design your seal"><div class="rb-seal-prev">' + RB.seal.svg(d, 72, 'Preview of your seal') + '</div>' +
      '<fieldset><legend>Frame</legend>' + RB.seal.FRAMES.map((f) => '<label class="opt"><input type="radio" name="rb-frame" value="' + f + '"' + (d.frame === f ? ' checked' : '') + '><span>' + esc({ round: 'Round', square: 'Square', oval: 'Oval', gourd: 'Gourd' }[f]) + '</span></label>').join('') + '</fieldset>' +
      '<fieldset><legend>From your name</legend>' + kanaOpts.map((k) => '<label class="opt"><input type="radio" name="rb-kana" value="' + esc(k) + '"' + (d.kana === k ? ' checked' : '') + '><span lang="ja">' + esc(k) + '</span></label>').join('') + '</fieldset>' +
      '<fieldset><legend>Brush</legend>' + RB.seal.STYLES.map((f) => '<label class="opt"><input type="radio" name="rb-style" value="' + f + '"' + (d.style === f ? ' checked' : '') + '><span>' + (f === 'bold' ? 'Bold' : 'Fine') + '</span></label>').join('') + '</fieldset>' +
      '<div class="cs-acts"><button type="button" class="pbtn primary" data-a="seal-save">' + I('save') + '<span>Keep this seal</span></button><button type="button" class="pbtn" data-a="seal-cancel"><span>Cancel</span></button></div></div>';
  }

  // ---- Journey › Travel volume ----------------------------------------------------------------------------------
  function thumb(p, cast, test) {
    const def = RB.sequence.get(p.seq);
    if (!def) return '';
    const shot = Object.keys(def.shots)[0];
    const ph = def.shots[shot].phases;
    const phase = Array.isArray(ph) ? (ph[ph.length - 1] || [])[0] || (ph[ph.length - 1] || {}).id : Object.keys(ph || {}).pop();
    return '<canvas class="rb-thumb" width="160" height="90" data-seq="' + esc(p.seq) + '" data-shot="' + esc(shot) + '" data-phase="' + esc(phase || '') + '" aria-hidden="true"></canvas>';
  }
  function paintThumbs(root, cast, test) {
    for (const c of root.querySelectorAll('canvas.rb-thumb')) {
      try {
        const g = c.getContext('2d');
        RB.sequence.drawAt(g, c.width, c.height, { seq: c.dataset.seq, shot: c.dataset.shot, phase: c.dataset.phase || undefined, k: 1, vb: c.height, t: 4000, cast, test });
      } catch (e) { /* a picture that cannot be drawn small stays blank paper */ }
    }
  }
  const castOf = (s) => ({ pc: RB.equip ? RB.equip.look(s) : s.player.look, comp: s.comp ? { id: s.comp, look: (RB.content.chars[s.comp] || {}).look || {} } : null });
  function volume(A, B, two, api) {
    const s = api.s;
    const pages = RB.volume.pages();
    let h = '<h3>' + I('book') + ' The travel volume</h3>' + sealBlock(s) + (V.status ? '<p class="sr" role="status">' + esc(V.status) + '</p>' : '');
    const byCh = {};
    for (const p of pages) (byCh[p.chapter] = byCh[p.chapter] || []).push(p);
    for (const ch of Object.keys(byCh).sort((a, b) => a - b)) {
      h += '<h4 class="rb-fam">' + (+ch ? RB.ui.jhtml('{第|だい}' + ch + '{章|しょう}') + ' <span class="en">Chapter ' + ch + '</span>' : RB.ui.jhtml('{序章|じょしょう}') + ' <span class="en">Prologue</span>') + '</h4><ul class="rb-pages">';
      for (const p of byCh[ch]) {
        const ok = RB.volume.viewable(s, p), w = RB.volume.witnessed(s, p);
        if (!ok) {
          h += '<li class="rb-pg veiled"><div class="rb-veil" aria-hidden="true"></div><div class="rb-pg-t"><span class="en">' + esc(RB.volume.criteria(p).en) + '</span>' +
            (p.special ? '<button type="button" class="pbtn small" data-a="reveal" data-page="' + esc(p.id) + '">Reveal…</button>' : '') + '</div></li>';
          continue;
        }
        h += '<li class="rb-pg' + (w ? ' witnessed' : '') + '"><div class="rb-frame">' + thumb(p) + (w ? '<span class="rb-mark">' + RB.seal.svg(RB.seal.of(s), 28, 'Witnessed in this journey') + '</span>' : '') + '</div>' +
          '<div class="rb-pg-t">' + both(p.title) + '<span class="rb-st-n">' + esc(w ? 'You were there.' : RB.volume.criteria(p).en) + '</span>' +
          (p.scene ? '<button type="button" class="pbtn small" data-a="watch" data-page="' + esc(p.id) + '">' + I('next') + '<span>Watch it again</span></button>' : '') + '</div></li>';
      }
      h += '</ul>';
    }
    // after the story: a new journey with what carries (K9)
    if (s.flags.postgame && RB.ui.ngplus) h += '<div class="rb-ngp"><h4 class="rb-fam">' + RB.ui.jhtml('{新|あたら}しい {旅|たび}') + ' <span class="en">A new journey</span></h4><p class="muted small">New Game+ begins the story again with what you have learned, your records and this volume.</p><button type="button" class="pbtn" data-a="ngplus">' + I('journey') + '<span>Begin New Game+…</span></button></div>';
    A.innerHTML = h;
    if (two) B.innerHTML = '<p class="muted">Every chapter you finish opens all of its pages, side stories included; finishing the story opens all of your companion\'s. Watching a page again changes nothing in your journey.</p>';
    paintThumbs(A, castOf(s), (cond) => RB.state.test(s, cond));
    A.onclick = (e) => click(e, s, api);
    A.onchange = (e) => {
      if (!V.seal) return;
      const t = e.target;
      if (t.name === 'rb-frame') V.seal.frame = t.value;
      if (t.name === 'rb-kana') V.seal.kana = t.value;
      if (t.name === 'rb-style') V.seal.style = t.value;
      const pv = A.querySelector('.rb-seal-prev');
      if (pv) pv.innerHTML = RB.seal.svg(V.seal, 72, 'Preview of your seal');
    };
  }
  async function click(e, s, api) {
    const b = e.target.closest('[data-a]');
    if (!b) return;
    const a = b.dataset.a;
    if (a === 'ngplus') { RB.ui.ngplus.begin(s, RB.save.current ? RB.save.current().slot : null); return; }
    if (a === 'seal-edit') { V.seal = Object.assign({}, RB.seal.of(s)); api.render(); return; }
    if (a === 'seal-cancel') { V.seal = null; api.render(); return; }
    if (a === 'seal-save') {
      const r = RB.seal.set(s, V.seal);
      V.seal = null; V.status = r ? 'Your seal is kept.' : 'That seal could not be kept.';
      if (r && RB.save && RB.save.autosave) RB.save.autosave('progress');
      api.render(); return;
    }
    if (a === 'reveal') {
      const p = RB.volume.page(b.dataset.page);
      const r = await RB.ui.confirm('This shows a special moment (' + RB.volume.criteria(p).en + ') before you reach it. Reveal it?', ['Reveal', 'Keep it veiled']);
      if (r === 0) { RB.volume.revealSpecial(s, p.id); api.render(); }
      return;
    }
    if (a === 'watch') {
      const p = RB.volume.page(b.dataset.page);
      if (!p || !RB.volume.viewable(s, p)) return;
      if (api.remember) api.remember();
      RB.ui.menu.close();
      await watch(p, castOf(s), (cond) => RB.state.test(s, cond), s.comp);
      if (RB.game.s === s) RB.ui.menu.open('volume');
    }
  }
  // a read-only replay: the beats are read from the scene, nothing runs (K6, HX49)
  function watch(p, cast, test, comp) {
    const beats = RB.volume.beats(p.seq, test, comp);
    if (!beats.length) return Promise.resolve(null);
    return RB.sequence.view({ seq: p.seq, beats, cast, label: 'Replay: ' + p.title.en, name: 'seq-replay', seen: () => true, skip: { label: 'Close' }, replay: true, speakers: true });
  }

  // ---- the Main Menu's travel volume (K4, K5) -----------------------------------------------------------------------
  async function menuVolume() {
    if (!RB.recordsUI.onMenu()) return;
    const list = await RB.save.list();
    const live = list.filter((x) => !x.empty && !x.corrupt);
    const saves = [];
    // the Continue save is the title's: the newest of every slot's save and autosave, read as the title would load it
    for (const x of live) { try { const r = await RB.save.read(x.slot, x.autoNewer || !x.manual ? 'auto' : 'manual'); if (r && r.state) saves.push({ slot: x.slot, s: r.state, t: Math.max((x.meta && x.meta.savedAt) || 0, x.auto ? x.auto.savedAt : 0) }); } catch (e) { /* an unreadable slot shows nothing */ } }
    saves.sort((a, b) => b.t - a.t);
    const cont = saves[0] ? saves[0].s : null; // the Continue save: its look and its seals, fixed while open
    const look = cont ? (RB.equip ? RB.equip.look(cont) : cont.player.look) : (RB.ui.create && RB.ui.create.defaultLook ? RB.ui.create.defaultLook() : { skin: 2, hair: 'short', hairColor: 3, outfit: 0, acc: [] });
    const settings = RB.game.settings;
    settings.volume = settings.volume || { unveiled: {}, showAll: false };
    const prefs = settings.volume;
    let close = null;
    const fr = RB.ui.folio.frame({ cls: 'folio-volume', onClose: () => close() });
    fr.setTitle('The travel volume', cont ? 'With the Continue journey\'s seals' : 'No journey yet');
    const layer = { el: fr.scrim, name: 'menu-volume' };
    close = () => { RB.ui.popLayer(layer); };
    layer.onCancel = close;
    function render() {
      const pages = RB.volume.pages();
      const byCh = {};
      for (const p of pages) (byCh[p.chapter] = byCh[p.chapter] || []).push(p);
      let h = '<section class="leaf rb-menu"><p class="muted small">Every illustration is here. Those no journey has reached yet are veiled until you choose to see them.</p>' +
        '<label class="opt"><input type="checkbox" data-a="showall"' + (prefs.showAll ? ' checked' : '') + '><span>Show all illustrations unveiled</span></label>';
      for (const ch of Object.keys(byCh).sort((a, b) => a - b)) {
        const L = byCh[ch];
        const anyVeiled = L.some((p) => RB.volume.menuState(p, prefs, saves.map((x) => x.s)).veiled);
        h += '<h4 class="rb-fam">' + (+ch ? 'Chapter ' + ch : 'Prologue') + (anyVeiled ? ' <button type="button" class="pbtn small" data-a="revealch" data-ch="' + ch + '">Reveal this chapter…</button>' : '') + '</h4><ul class="rb-pages">';
        for (const p of L) {
          const st = RB.volume.menuState(p, prefs, saves.map((x) => x.s));
          if (st.veiled) {
            h += '<li class="rb-pg veiled"><div class="rb-veil" aria-hidden="true"></div><div class="rb-pg-t"><span class="en">' + esc(RB.volume.criteria(p).en) + '</span><button type="button" class="pbtn small" data-a="reveal" data-page="' + esc(p.id) + '">Reveal…</button></div></li>';
            continue;
          }
          const sealed = cont && RB.volume.witnessed(cont, p);
          h += '<li class="rb-pg' + (sealed ? ' witnessed' : '') + '"><div class="rb-frame">' + thumb(p) + (sealed ? '<span class="rb-mark">' + RB.seal.svg(RB.seal.of(cont), 28, 'Witnessed in the Continue journey') + '</span>' : '') + '</div>' +
            '<div class="rb-pg-t">' + both(p.title) + '<span class="rb-st-n">' + esc(RB.volume.criteria(p).en) + (st.seenIn ? ' Seen in ' + st.seenIn + ' journey' + (st.seenIn > 1 ? 's' : '') + '.' : '') + '</span>' +
            (p.scene ? '<button type="button" class="pbtn small" data-a="watch" data-page="' + esc(p.id) + '">' + I('next') + '<span>Watch</span></button>' : '') +
            (prefs.unveiled[p.id] && !st.seenIn ? '<button type="button" class="pbtn small quiet" data-a="reveil" data-page="' + esc(p.id) + '">Veil again</button>' : '') + '</div></li>';
        }
        h += '</ul>';
      }
      fr.box.innerHTML = h + '</section>';
      const comp = cont && cont.comp;
      paintThumbs(fr.box, { pc: look, comp: comp ? { id: comp, look: (RB.content.chars[comp] || {}).look || {} } : null }, RB.volume.fixtureTest(comp || 'mio'));
    }
    fr.box.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-a]');
      if (!b) return;
      const a = b.dataset.a;
      if (a === 'reveal' || a === 'revealch') {
        const ch = a === 'revealch' ? +b.dataset.ch : RB.volume.page(b.dataset.page).chapter;
        const r = await RB.ui.confirm('This shows a moment from ' + (ch ? 'Chapter ' + ch : 'the prologue') + '. Reveal ' + (a === 'revealch' ? 'the whole chapter' : 'it') + '?', ['Reveal', 'Keep it veiled']);
        if (r !== 0) return;
        for (const p of RB.volume.pages()) if (a === 'revealch' ? p.chapter === ch : p.id === b.dataset.page) prefs.unveiled[p.id] = true;
        await RB.game.saveSettings(); render(); return;
      }
      if (a === 'reveil') { delete prefs.unveiled[b.dataset.page]; await RB.game.saveSettings(); render(); return; }
      if (a === 'watch') {
        const p = RB.volume.page(b.dataset.page);
        const comp = p.comp || (cont && cont.comp) || 'mio';
        fr.scrim.classList.add('hidden');
        await watch(p, { pc: look, comp: { id: comp, look: (RB.content.chars[comp] || {}).look || {} } }, RB.volume.fixtureTest(comp), comp);
        fr.scrim.classList.remove('hidden');
      }
    });
    fr.box.addEventListener('change', async (e) => {
      if (e.target.dataset.a === 'showall') { prefs.showAll = e.target.checked; await RB.game.saveSettings(); render(); }
    });
    render();
    RB.ui.pushLayer(layer);
    return { close };
  }

  RB.ui.menu.addPage('journey', { id: 'stamps', en: 'Stamp book', icon: 'ledger', available: (s) => RB.recordsUI.inCampaign(s), render: stamps });
  RB.ui.menu.addPage('journey', { id: 'volume', en: 'Travel volume', icon: 'book', available: (s) => RB.recordsUI.inCampaign(s), render: volume });
  return { stamps, volume, menuVolume, watch, stampSvg, V };
})();
