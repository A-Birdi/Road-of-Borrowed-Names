/* Company › Companion and Company › Shared memories (addendum §6.2, §6.4, §6.5),
 * drawn over the scaffold in 52_company.js, plus the discreet HUD button for a
 * topic that is waiting (§7.4). The rules live in src/engine/58_companion.js;
 * the words in src/content/company/.
 *
 * Companion: who they are (portrait, role, what you have learned of them),
 * the bond in words only, what is on their mind, their own road once you know
 * of it, and what they do on their turn in battle (the real combat data).
 * Conversations opened here close the folio, play through the normal dialogue
 * runner where it is safe, and come back to the same page and scroll.
 * Shared memories: chronological, filterable, each with where it happened, what
 * happened and what your companion said; a recollection view that is only a
 * transcript (it runs nothing). Nothing on these pages changes play. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.ui.companyPages = (function () {
  'use strict';
  const esc = RB.util.esc;
  const K = RB.company;
  const CC = RB.content.company;
  const F = () => RB.ui.folio;
  // a few more line icons for these pages (same 24×24 line style as the folio's own)
  Object.assign(RB.ui.folio.ICONS, {
    talk: '<path d="M4 6h13v9H9l-4 3.5V15H4z"/><path d="M7.5 9.5h6M7.5 12h4"/><path d="M17 9h3v8h-2v2.5L15 17h-4"/>',
    mind: '<path d="M7 15a6 6 0 1 1 9 0c-.8.7-1 1.6-1 2.5V19H8v-1.5c0-.9-.3-1.8-1-2.5z"/><path d="M9.5 21h5"/><path d="M10 10c.5-1.2 1.4-1.8 2.5-1.8"/>',
    rest: '<path d="M5 10h11v3.5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5z"/><path d="M16 11h1.5a2.5 2.5 0 0 1 0 5H15.5"/><path d="M9 3.5c0 1.5 1 2 1 3.5M12.5 3.5c0 1.5 1 2 1 3.5"/><path d="M4 21h14"/>',
    place: '<path d="M4 19l5-11 4 7 3-4 4 8z"/><path d="M4 19h16"/>',
  });
  const I = (n, t) => F().icon(n, t);
  const L = (jp, en) => RB.ui.label(jp, en);
  const j = (t) => (t ? RB.ui.jhtml(t) : '');
  const chr = (id) => (id && RB.content.chars[id]) || null;
  const said = (t, cls) => (t ? '<div class="co-said' + (cls ? ' ' + cls : '') + '">' + (t.jp ? '<div class="jp">' + j(t.jp) + '</div>' : '') + (t.en ? '<div class="en">' + RB.ui.ehtml(t.en) + '</div>' : '') + '</div>' : '');
  const AIM = { foe: 'the creature you target', foes: 'every creature', allies: 'you both', aimed: 'whoever the target is aiming at', lower: 'whichever of you has less resolve', pc: 'you', none: 'no target' };
  const BOND_LINE = {
    walking: { jp: '{一緒|いっしょ} に {歩|ある}き{始|はじ}めた ところ 。', en: 'You have set out together; the road is still new to you both.' },
    rhythm: { jp: 'お{互|たが}い の {歩|ある}く {速|はや}さ が わかって きた 。', en: 'You have come to know each other\'s pace.' },
    trusted: { jp: '{言|い}わなくても 、 {任|まか}せられる 。', en: 'You rely on each other without needing to say so.' },
    lasting: { jp: 'どの {道|みち} でも 、 {二人|ふたり} で {歩|ある}いて いける 。', en: 'Whatever road comes next, you would walk it together.' },
  };
  const KIND = {
    together: { en: 'Together', jp: '{二人|ふたり} で', icon: 'companion' },
    pets: { en: 'Pets', jp: '{動物|どうぶつ}', icon: 'paw' },
    discoveries: { en: 'Discoveries', jp: '{発見|はっけん}', icon: 'keepsake' },
    reflections: { en: 'Reflections', jp: '{振|ふ}り{返|かえ}り', icon: 'mind' },
  };

  // ---- conversations from the folio (§6.5) ------------------------------------------------------------
  // Close the folio, play the scene through the normal runner where it is safe, then come back to
  // the same Company page and scroll. Not safe here: say so, and keep the topic for later.
  const WHY = {
    busy: 'Not now — something else is happening. It can wait for a quiet moment.',
    apart: 'Your companion isn\'t beside you here. It can wait until you are together.',
    danger: 'Not with a creature this close. It can wait for a safe pause.',
    none: 'It can wait for a quiet moment.',
  };
  async function converse(api, run) {
    const ok = K.safeHere();
    if (!ok.ok) { RB.ui.notice(WHY[ok.why] || WHY.none, 'info'); return false; }
    api.remember();
    api.close();
    try { await run(); } finally {
      await new Promise((r) => setTimeout(r, 40));
      // back to the page you came from, if the world is quiet again (an arrival scene may have started)
      if (RB.game.playing !== false && RB.game.mode() === 'world' && !RB.script.isRunning()) RB.ui.menu.open('company');
    }
    return true;
  }

  // ---- Companion ------------------------------------------------------------------------------------------------
  function bio(s, comp) {
    const b = CC.bios[comp] || {};
    return (b.summary || []).filter((x) => !x.when || RB.state.test(s, x.when));
  }
  function questInfo(s, comp) {
    const qid = K.PQ[comp];
    const q = qid && s.quests[qid];
    const qd = qid && RB.content.quests[qid];
    if (!q || !qd) return null; // not discovered yet: never advertised
    const reached = q.done ? qd.stages.length : Math.min(qd.stages.length, (q.stage || 0) + 1);
    return { qid, qd, q, done: !!q.done, stages: qd.stages.slice(0, reached) };
  }
  function supportActions(s, comp) {
    const acts = (RB.content.companionActions && RB.content.companionActions[comp]) || [];
    return acts.filter((a) => !a.unlock || RB.state.test(s, a.unlock));
  }
  function cases(s) {
    try {
      const d = RB.cases && RB.cases.discussable ? RB.cases.discussable(s) : null;
      return Array.isArray(d) ? d : d ? [d] : [];
    } catch (e) { return []; }
  }
  function identity(s, comp, c) {
    const st = K.stage(s);
    const bl = BOND_LINE[st.id] || BOND_LINE.walking;
    const known = bio(s, comp);
    const th = K.thought(s);
    const qi = questInfo(s, comp);
    const who = esc(c.name.en);
    return '<div class="co-id' + (st.id === 'lasting' ? ' lasting' : '') + '">' +
      '<canvas class="co-portrait" width="96" height="96" role="img" aria-label="' + esc('Portrait of ' + c.name.en) + '"></canvas>' +
      '<div class="co-name"><h3>' + j(c.name.jp) + ' <span class="en">' + who + '</span></h3>' +
      '<p class="muted">' + L(c.role ? c.role.jp : '', c.role ? c.role.en : '') + '</p>' +
      '<p class="co-bond"><span class="k">' + L('{絆|きずな}', 'Bond') + '</span> <b>' + esc(st.label.en) + '</b> <span class="jp">' + j(st.label.jp) + '</span></p></div></div>' +
      '<p class="co-bondline">' + j(bl.jp) + ' <span class="en">' + esc(bl.en) + '</span></p>' +
      '<section class="co-thought" aria-label="' + esc('On ' + c.name.en + '\'s mind') + '"><h4>' + I('mind') + L('{今|いま} の {思|おも}い', 'On ' + c.name.en + '\'s mind') + '</h4>' +
      (th ? said(th.text) : '<p class="muted">Nothing in particular. The road is enough for now.</p>') + '</section>' +
      (known.length ? '<h4>' + I('companion') + L('{知|し}って いる こと', 'What you know of ' + c.name.en) + '</h4><ul class="co-know">' + known.map((x) => '<li>' + esc(x.en) + '</li>').join('') + '</ul>' : '') +
      (qi ? '<h4>' + I(qi.done ? 'done' : 'side') + L('{自分|じぶん} の {道|みち}', c.name.en + '\'s own road') + '</h4><p class="co-q"><span class="t">' + j(qi.qd.title.jp) + ' <span class="en">' + esc(qi.qd.title.en) + '</span></span> <span class="kind">' + (qi.done ? 'resolved' : 'in progress') + '</span></p>' : '');
  }
  function actionRow(act, icon, en, jp, note, extra) {
    return '<li><button class="pbtn co-act" data-co-act="' + act + '"' + (extra || '') + '>' + I(icon) + '<span>' + L(jp, en) + '</span></button>' + (note ? '<span class="muted small">' + note + '</span>' : '') + '</li>';
  }
  function actions(s, comp, c, V) {
    const who = esc(c.name.en);
    const p = K.pending(s);
    const here = K.placeTalk(s);
    const rest = K.restHere(s);
    const cs = cases(s);
    const qi = questInfo(s, comp);
    let h = '';
    if (p) {
      h += '<div class="co-pending" role="note">' + I('talk') + '<span>' + (p.quiet ? who + ' can wait — you said not now. The topic is still there when you want it.' : who + ' has something to ask you.') + '</span></div>';
    }
    h += '<h4>' + I('talk') + L('{話|はな}す', 'Talk with ' + who) + '</h4><ul class="co-acts">';
    if (here) h += actionRow('place', 'place', 'Talk about this place', 'この {場所|ばしょ} の {話|はなし}', '');
    h += actionRow('mind', 'mind', p ? 'Ask what\'s on their mind' : 'Ask what\'s on their mind', '{何|なに} を {考|かんが}えて いる ?', p ? (p.quiet ? 'the topic you put off' : 'something is waiting') : '');
    if (cs.length) h += actionRow('case', 'scroll', 'Discuss a discovered case', '{謎|なぞ} の {話|はなし} を する', '');
    if (rest) h += actionRow('rest', 'rest', 'Rest together', '{一緒|いっしょ} に {休|やす}む', 'a quiet moment here');
    h += actionRow('memories', 'journey', 'Shared memories', '{思|おも}い{出|で}', '');
    if (qi) h += actionRow('quest', qi.done ? 'done' : 'side', 'Personal quest details', '{自分|じぶん} の {道|みち}', '', ' aria-expanded="' + (V.detail === 'quest') + '"');
    h += '</ul>';
    return h;
  }
  function questDetail(s, comp, c) {
    const qi = questInfo(s, comp);
    if (!qi) return '';
    return '<section class="co-detail" aria-label="' + esc(c.name.en + '\'s own road') + '"><h4>' + I(qi.done ? 'done' : 'side') + j(qi.qd.title.jp) + ' <span class="en">' + esc(qi.qd.title.en) + '</span></h4>' +
      '<ol class="earlier">' + qi.stages.map((st) => '<li>' + j(st.jp) + '<div class="en">' + esc(st.en) + '</div></li>').join('') + '</ol>' +
      (qi.done ? '<p class="muted">Resolved. ' + esc(c.name.en) + '\'s way, with you beside them.</p>' : '<p class="muted">Still ahead. Nothing is decided for ' + esc(c.name.en) + ' until they decide it.</p>') + '</section>';
  }
  function topicsBlock(s, c) {
    const list = K.topics(s);
    if (!list.length) return '';
    const rest = K.restHere(s);
    return '<h4>' + I('rest') + L('{休|やす}む {時|とき} の {話|はなし}', 'Conversations at rest') + '</h4><ul class="entries co-topics">' + list.map((x) =>
      '<li class="entry"><span class="mark">' + I(x.heard ? 'done' : 'talk') + '</span><div><div class="t">' + j(x.title.jp) + ' <span class="en">' + esc(x.title.en) + '</span></div>' +
      '<div class="kind">' + (x.heard ? 'talked about' : rest ? 'you could talk about this now' : 'new — for a rest stop (an inn, a teahouse, a camp)') + '</div></div>' +
      (rest ? '<button class="pbtn" data-co-topic="' + esc(x.id) + '">' + L('{話|はな}す', x.heard ? 'Again' : 'Talk') + '</button>' : '<span></span>') + '</li>').join('') + '</ul>';
  }
  function supportBlock(s, comp, c) {
    const acts = supportActions(s, comp);
    return '<h4>' + I('ward') + L('{戦|たたか}い で の {手助|てだす}け', 'On ' + esc(c.name.en) + '\'s turn in battle') + '</h4>' +
      '<ul class="entries co-support">' + acts.map((a) => '<li class="entry"><span class="mark">' + I('next') + '</span><div><div class="t">' + j(a.name.jp) + ' <span class="en">' + esc(a.name.en) + '</span></div>' +
        '<div class="muted small">' + esc(a.desc || '') + '</div><div class="kind">aims at ' + esc(AIM[a.aim] || a.aim) + (a.uses ? ' · ' + a.uses + ' per encounter' : ' · every round') + '</div></div></li>').join('') + '</ul>' +
      '<p class="muted small">These come from the journey itself. The bond between you never changes them.</p>';
  }
  function before(s) {
    const prov = chr(s.provisional);
    if (!prov) return '<p class="muted">No one travels with you yet. In the Lantern Hall you can ask someone to come along.</p>';
    const b = CC.bios[s.provisional] || {};
    return '<div class="co-id"><canvas class="co-portrait" width="96" height="96" role="img" aria-label="' + esc('Portrait of ' + prov.name.en) + '"></canvas>' +
      '<div class="co-name"><h3>' + j(prov.name.jp) + ' <span class="en">' + esc(prov.name.en) + '</span></h3><p class="muted">' + L(prov.role ? prov.role.jp : '', prov.role ? prov.role.en : '') + '</p></div></div>' +
      '<p>' + esc(prov.name.en) + ' is travelling with you for now. Nothing is decided until you set out together — the lantern will carry two names, and you can still change your mind before the door.</p>' +
      (b.first ? said(b.first, 'first') : '');
  }
  function companionPage(A, B, two, api) {
    const s = api.s, V = api.view;
    const comp = s.comp, c = chr(comp);
    if (!c) {
      A.innerHTML = before(s);
      const cv = A.querySelector('.co-portrait');
      if (cv && s.provisional) RB.portraits.draw(cv, s.provisional, 'neutral');
      return;
    }
    const idHtml = identity(s, comp, c);
    const actHtml = actions(s, comp, c, V);
    const qd = V.detail === 'quest' ? questDetail(s, comp, c) : '';
    const rest = topicsBlock(s, c) + supportBlock(s, comp, c);
    if (!two && V.detail === 'quest') {
      A.innerHTML = '<button class="pbtn quiet co-back" data-co-back>' + I('back') + L('{戻|もど}る', 'Back') + '</button>' + qd;
    } else if (two) {
      A.innerHTML = idHtml;
      B.innerHTML = '<div class="xpage co-page">' + actHtml + qd + rest + '</div>';
    } else {
      A.innerHTML = idHtml + actHtml + rest;
    }
    const cv = A.querySelector('.co-portrait');
    if (cv) RB.portraits.draw(cv, comp, K.stage(s).id === 'walking' ? 'neutral' : 'smile');
    const click = async (e) => {
      const b = e.target.closest('[data-co-act],[data-co-topic],[data-co-back]');
      if (!b) return;
      if (b.hasAttribute('data-co-back')) { V.detail = null; api.render(); return; }
      if (b.dataset.coTopic) {
        const tp = CC.topics.find((x) => x.id === b.dataset.coTopic);
        if (tp) await converse(api, () => RB.script.run(tp.scene));
        return;
      }
      const act = b.dataset.coAct;
      if (act === 'memories') { api.go('company', 'memories'); return; }
      if (act === 'quest') { V.detail = V.detail === 'quest' ? null : 'quest'; api.render(); return; }
      if (act === 'place') { await converse(api, () => RB.script.run('co.place')); return; }
      if (act === 'rest') { await converse(api, () => RB.script.run('co.rest')); return; }
      if (act === 'mind') {
        await converse(api, async () => { if (!(await K.openPending())) await RB.script.run('co.mind'); });
        return;
      }
      if (act === 'case') {
        const cs = cases(s);
        const first = cs[0];
        if (first && first.scene && RB.content.scenes[first.scene]) await converse(api, () => RB.script.run(first.scene));
        else if (first && RB.cases.discuss) await converse(api, () => RB.cases.discuss(s, first.id || first));
        else api.go('journey', 'cases');
      }
    };
    A.onclick = null;
    // (the scaffold listens on A for its own page tabs; this page listens on its holder and on B)
    A.addEventListener('click', click);
    if (two) B.onclick = click;
  }

  // ---- Shared memories -------------------------------------------------------------------------------------------
  function memName(m) {
    const c = chr(m.comp);
    return c ? c.name.en : 'Your companion';
  }
  function memItem(m, sel) {
    const k = KIND[m.kind] || KIND.together;
    return '<li class="entry co-mem' + (sel ? ' current' : '') + '" data-kind="' + esc(m.kind) + '"><span class="mark">' + I(k.icon) + '</span><div>' +
      '<div class="kind">' + esc(k.en) + (m.place ? ' · ' + esc(m.place.en || '') : '') + (m.retro ? ' · from the journey\'s record' : '') + '</div>' +
      '<div class="t">' + (m.title && m.title.jp ? j(m.title.jp) + ' ' : '') + '<span class="en">' + esc(m.title ? m.title.en : m.id) + '</span>' + (m.petName ? ' <span class="co-petname">“' + esc(m.petName) + '”</span>' : '') + '</div>' +
      (m.text ? '<div class="small">' + esc(m.text.en || '') + '</div>' : '') +
      (m.reply ? '<blockquote class="co-reply"><span class="who">' + esc(memName(m)) + '</span>' + said(m.reply) + '</blockquote>' : '') +
      '<div class="row-acts"><button class="pbtn" data-co-recall="' + esc(m.id) + '" aria-pressed="' + !!sel + '">' + I('history') + L('{思|おも}い{出|だ}す', 'Recollect') + '</button>' +
      refButton(m) + '</div></div></li>';
  }
  function refButton(m) {
    const r = m.ref;
    if (!r) return '';
    if (r.kind === 'keepsake' && RB.content.keepsakes && RB.content.keepsakes[r.id]) return '<button class="pbtn quiet" data-co-ref="keepsakes">' + I('keepsake') + 'See the keepsake</button>';
    if (r.kind === 'case' && RB.cases) return '<button class="pbtn quiet" data-co-ref="cases">' + I('scroll') + 'Open the case</button>';
    return '';
  }
  // the recollection: only a transcript of what was kept; reading it runs nothing and changes nothing
  function recollection(s, m) {
    if (!m) return '<p class="muted">Choose a memory to recollect it.</p>';
    const who = memName(m);
    const lines = m.lines && m.lines.length ? m.lines : [
      m.text ? { who: 'narr', jp: m.text.jp, en: m.text.en } : null,
      m.reply ? { who: m.comp, jp: m.reply.jp, en: m.reply.en } : null,
    ].filter(Boolean);
    const nm = (w) => (w === 'pc' ? s.player.name : w === 'narr' || !w ? '' : chr(w) ? chr(w).name.en : '');
    return '<section class="co-recall" aria-label="Recollection"><h4>' + I('history') + L('{思|おも}い{出|だ}す', 'Recollection') + '</h4>' +
      '<p class="kind">A record of what was kept. Reading it changes nothing.</p>' +
      '<p class="co-rtitle">' + (m.title && m.title.jp ? j(m.title.jp) + ' ' : '') + '<span class="en">' + esc(m.title ? m.title.en : '') + '</span></p>' +
      '<p class="muted small">' + esc(m.place ? m.place.en : '') + (m.petName ? ' · with ' + esc(m.petName) : '') + '</p>' +
      (m.retro ? '<p class="muted small">This was reconstructed from what your journey records, when it was loaded. The words are how ' + esc(who) + ' speaks of it now.</p>' : '') +
      '<ol class="co-transcript">' + lines.map((l) => '<li class="' + (l.who === 'narr' ? 'narr' : l.who === 'pc' ? 'pc' : 'npc') + '">' +
        (nm(l.who) ? '<span class="who">' + esc(nm(l.who)) + (l.choice ? ' (your reply)' : '') + '</span>' : '') +
        (l.jp ? '<div class="jp">' + j(l.jp) + '</div>' : '') + '<div class="en">' + esc(l.en || '') + '</div></li>').join('') + '</ol></section>';
  }
  function pinned(s) {
    const id = s.discovery && s.discovery.display;
    const k = id && RB.content.keepsakes && RB.content.keepsakes[id];
    if (!k) return '';
    return '<p class="co-pinned">' + I('keepsake') + '<span>On display: ' + (k.name && k.name.jp ? j(k.name.jp) + ' ' : '') + '<span class="en">' + esc(k.name ? k.name.en : id) + '</span></span> <button class="pbtn quiet" data-co-ref="keepsakes">See it</button></p>';
  }
  function memoriesPage(A, B, two, api) {
    const s = api.s, V = api.view;
    const all = ((s.company || {}).memories || []);
    if (!V.filter || (V.filter !== 'all' && !KIND[V.filter])) V.filter = 'all';
    const list = all.filter((m) => V.filter === 'all' || m.kind === V.filter);
    const count = (k) => all.filter((m) => k === 'all' || m.kind === k).length;
    const filters = '<div class="co-filters" role="group" aria-label="Show memories">' + ['all', 'together', 'pets', 'discoveries', 'reflections'].map((k) =>
      '<button class="chip" data-co-filter="' + k + '" aria-pressed="' + (V.filter === k) + '">' + (k === 'all' ? L('{全部|ぜんぶ}', 'All') : L(KIND[k].jp, KIND[k].en)) + ' <span class="n">' + count(k) + '</span></button>').join('') + '</div>';
    const sel = V.sel && all.find((m) => m.id === V.sel);
    const listHtml = list.length ? '<ol class="entries co-mems">' + list.map((m) => memItem(m, sel && sel.id === m.id)).join('') + '</ol>'
      : '<p class="muted">' + (all.length ? 'Nothing of this kind yet.' : 'Moments you share on the road will be kept here: setting out together, your companion\'s own story, things you work out, animals you meet, and the conversations that matter.') + '</p>';
    const head = '<h3>' + I('journey') + L('{思|おも}い{出|で}', 'Shared memories') + ' <span class="count">' + all.length + ', oldest first</span></h3>';
    if (!two && V.detail === 'recall' && sel) {
      A.innerHTML = '<button class="pbtn quiet co-back" data-co-back>' + I('back') + L('{戻|もど}る', 'Back') + '</button>' + recollection(s, sel);
    } else if (two) {
      A.innerHTML = head + pinned(s) + filters + listHtml;
      B.innerHTML = '<div class="xpage co-page">' + recollection(s, sel || null) + '</div>';
    } else {
      A.innerHTML = head + pinned(s) + filters + listHtml;
    }
    const click = (e) => {
      const b = e.target.closest('[data-co-filter],[data-co-recall],[data-co-back],[data-co-ref]');
      if (!b) return;
      if (b.dataset.coFilter) { V.filter = b.dataset.coFilter; api.render(); return; }
      if (b.dataset.coRecall) { V.sel = b.dataset.coRecall; if (!two) V.detail = 'recall'; api.render(); return; }
      if (b.hasAttribute('data-co-back')) { V.detail = null; api.render(); return; }
      if (b.dataset.coRef) api.go('journey', b.dataset.coRef);
    };
    A.addEventListener('click', click);
    if (two) B.onclick = click;
  }

  RB.ui.company.addPage({ id: 'companion', en: 'Companion', jp: '{相棒|あいぼう}', icon: 'companion', render: companionPage });
  RB.ui.company.addPage({ id: 'memories', en: 'Shared memories', jp: '{思|おも}い{出|で}', icon: 'journey', render: memoriesPage });

  // ---- the HUD: a waiting topic, reachable by keyboard and touch too (§7.4) ----------------------------------------
  function hudUpdate() {
    if (typeof document === 'undefined') return;
    const hud = document.querySelector('.hud');
    const s = RB.game && RB.game.s;
    if (!hud) return;
    let b = hud.querySelector('.co-topic');
    const on = !!(s && s.comp && K.indicator(s));
    if (!on) { if (b) b.hidden = true; return; }
    const c = chr(s.comp);
    if (!b) {
      b = RB.ui.el('button', 'hbtn co-topic');
      b.innerHTML = I('talk') + '<span class="l">Talk</span>';
      b.onclick = async () => {
        if (RB.game.mode() !== 'world') return;
        const ok = K.safeHere();
        if (!ok.ok) { RB.ui.notice(WHY[ok.why] || WHY.none, 'info'); return; }
        b.blur();
        await K.openPending();
        hudUpdate();
      };
      hud.insertBefore(b, hud.firstChild);
    }
    b.hidden = false;
    const label = (c ? c.name.en : 'Your companion') + ' has something to ask you';
    b.title = label;
    b.setAttribute('aria-label', label);
  }
  for (const ev of ['company:changed', 'company:talk', 'map:enter', 'company:bond']) RB.bus.on(ev, () => setTimeout(hudUpdate, 0));

  return { converse, recollection, hudUpdate };
})();
