/* Pause menu: journal, notebook, items/equipment, map & fast travel,
 * dialogue log, settings, save/load. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.ui.menu = (function () {
  'use strict';
  const esc = RB.util.esc;
  const TABS = [
    ['journal', '{旅|たび} の {記録|きろく}', 'Journal'],
    ['notebook', '{手帳|てちょう}', 'Notebook'],
    ['items', '{持|も}ち{物|もの}', 'Items'],
    ['map', '{地図|ちず}', 'Map'],
    ['log', '{会話|かいわ}{履歴|りれき}', 'Log'],
    ['guide', '{手引|てび}き', 'Guide'],
    ['settings', '{設定|せってい}', 'Settings'],
    ['save', 'セーブ', 'Save'],
  ];
  let layer = null, tab = 'journal', panel = null;

  function open(which) {
    if (layer) { show(which || tab); return; }
    if (RB.game.mode() !== 'world' && RB.game.mode() !== 'dialogue') return;
    RB.game.pushMode('menu');
    RB.audio && RB.audio.sfx('menu_open');
    const scrim = RB.ui.el('div', 'scrim');
    panel = RB.ui.el('div', 'panel');
    scrim.appendChild(panel);
    layer = { el: scrim, name: 'menu' };
    layer.onCancel = close;
    layer.onAction = (a) => {
      if (a === 'menu') { close(); return true; }
      return false;
    };
    RB.ui.pushLayer(layer);
    show(which || tab);
  }
  function close() {
    if (!layer) return;
    RB.ui.popLayer(layer);
    layer = null;
    RB.game.popMode('menu');
    RB.audio && RB.audio.sfx('menu_close');
    RB.ui.help.hide();
  }
  function closeAll() { close(); }

  function show(t) {
    tab = t;
    const inGame = !!RB.game.s;
    panel.innerHTML = '<header><h2>' + RB.ui.label(TABS.find((x) => x[0] === t)[1], TABS.find((x) => x[0] === t)[2]) + '</h2>' +
      (inGame ? '<span class="small dim">' + esc(RB.game.s.player.name) + (RB.game.s.comp ? ' &amp; ' + esc(RB.content.chars[RB.game.s.comp].name.en) : '') + ' · ' + RB.util.fmtTime(RB.game.s.playtime) + '</span>' : '') +
      '<button class="btn small" data-close>Close</button></header>' +
      '<div class="tabs" role="tablist">' + TABS.map(([id, jp, en]) => '<button class="btn small' + (id === t ? ' sel' : '') + '" role="tab" data-tab="' + id + '">' + RB.ui.label(jp, en) + '</button>').join('') + '</div>' +
      '<div class="body"></div>';
    panel.querySelector('[data-close]').onclick = close;
    panel.querySelectorAll('[data-tab]').forEach((b) => (b.onclick = () => { RB.audio && RB.audio.sfx('page'); show(b.getAttribute('data-tab')); }));
    const body = panel.querySelector('.body');
    ({ journal, notebook, items, map, log, settings, save, guide })[t](body);
  }

  // ---- journal ----------------------------------------------------------------------
  function journal(body) {
    const s = RB.game.s;
    const qs = Object.keys(s.quests).map((id) => ({ id, q: s.quests[id], d: RB.content.quests[id] })).filter((x) => x.d);
    const active = qs.filter((x) => !x.q.done).sort((a, b) => (a.d.main ? -1 : 1) - (b.d.main ? -1 : 1) || b.q.t - a.q.t);
    const done = qs.filter((x) => x.q.done);
    const stageText = (x) => {
      const st = x.d.stages && x.d.stages[Math.min(x.q.stage, x.d.stages.length - 1)];
      return st ? RB.ui.jhtml(st.jp) + '<div class="en">' + esc(RB.script.enVars(st.en)) + '</div>' : '';
    };
    let h = '<h3>Current</h3><div class="list">';
    if (!active.length) h += '<p class="dim">Nothing pressing. Walk around; people will tell you what they need.</p>';
    for (const x of active) h += '<div class="item"><div class="t">' + (x.d.main ? '★ ' : '') + RB.ui.jhtml(x.d.title.jp) + ' <span class="dim">— ' + esc(x.d.title.en) + '</span></div><div class="small">' + stageText(x) + '</div></div>';
    h += '</div>';
    const j = (s.journal || []).slice(-8).reverse();
    if (j.length) h += '<h3>Notes to self</h3><div class="list">' + j.map((e) => '<div class="item small">' + RB.ui.jhtml(e.jp) + '<div class="en">' + esc(RB.script.enVars(e.en)) + '</div></div>').join('') + '</div>';
    if (done.length) h += '<h3>Completed</h3><div class="list">' + done.map((x) => '<div class="item small dim">✓ ' + esc(x.d.title.en) + '</div>').join('') + '</div>';
    body.innerHTML = h;
  }

  // ---- notebook ------------------------------------------------------------------------
  let nbTab = 'words';
  function notebook(body) {
    const s = RB.game.s;
    const sub = [['words', 'Words'], ['kana', 'Kana'], ['grammar', 'Grammar'], ['lore', 'Lore & histories'], ['stats', 'Progress']];
    let h = '<div class="row" style="margin-bottom:0.5em">' + sub.map(([id, l]) => '<button class="btn small' + (nbTab === id ? ' on' : '') + '" data-nb="' + id + '">' + esc(l) + '</button>').join('') +
      '<span class="grow"></span><button class="btn small" data-a="practice" title="Optional review of uncertain items">Practise (optional) ▶</button></div>';
    if (nbTab === 'words') {
      const ws = s.words.map((id) => RB.content.words[id]).filter(Boolean);
      h += '<h3>Inscriptions you can weave</h3><div class="grid2">' + (ws.length ? ws.map((w) => '<div class="item"><div class="t">' + RB.ui.jhtml(w.jp) + '</div><div class="small">' + esc(w.en) + '</div><div class="small dim">' + esc(w.effect || '') + '</div></div>').join('') : '<p class="dim">None yet.</p>') + '</div>';
      const saved = s.notebook.filter((n) => n.kind === 'word');
      h += '<h3>Words you noted</h3><div class="grid2">' + (saved.length ? saved.map((n) => '<div class="item"><span class="jp" lang="ja">' + esc(n.surface) + '</span> <span class="dim">【' + esc(n.reading) + '】</span><div class="small">' + esc(n.m) + '</div></div>').join('') : '<p class="dim small">Use the lightbulb on any Japanese text and press “＋ Notebook”.</p>') + '</div>';
    } else if (nbTab === 'kana') {
      const ng = s.learn.profile === 'F' && s.learn.kanaKnown !== 'both' ? RB.lessons.nextGroup(s) : null;
      if (ng) h += '<div class="row" style="margin-bottom:0.4em"><button class="btn small primary" data-a="nextkana">Learn the next kana group: ' + esc(ng.g.title || '') + ' ▶</button><span class="small dim">Optional — the story also teaches kana as you go.</span></div>';
      h += kanaChart(s);
    } else if (nbTab === 'grammar') {
      const seen = Object.keys(s.learn.items).filter((k) => k.startsWith('g:')).map((k) => k.slice(2));
      const pts = (RB.grammar && RB.grammar.points ? RB.grammar.points : []).filter((g) => seen.includes(g.id));
      h += pts.length ? '<div class="list">' + pts.map((g) => '<div class="item"><div class="t">' + RB.ui.jhtml(g.title) + '</div><div class="small">' + esc(g.en) + '</div>' + (g.ex || []).slice(0, 2).map((e) => '<div class="small">' + RB.ui.jhtml(e.jp) + ' <span class="dim">' + esc(e.en) + '</span></div>').join('') + '</div>').join('') + '</div>' : '<p class="dim">Grammar you meet on the road will be collected here.</p>';
    } else if (nbTab === 'lore') {
      const notes = s.notebook.filter((n) => n.kind === 'lore').map((n) => RB.content.notes[n.id]).filter(Boolean);
      h += notes.length ? '<div class="list">' + notes.map((n) => '<div class="item"><div class="t">' + RB.ui.jhtml(n.title.jp) + ' <span class="dim">— ' + esc(n.title.en) + '</span>' + (n.fiction ? ' <span class="small" style="color:var(--accent)">[fictional term]</span>' : '') + '</div>' + (n.jp ? '<div>' + RB.ui.jhtml(n.jp) + '</div>' : '') + '<div class="small">' + esc(n.en) + '</div></div>').join('') + '</div>' : '<p class="dim">Stories and inscriptions you collect will be kept here.</p>';
    } else if (nbTab === 'stats') {
      const L = s.learn;
      const items = Object.values(L.items);
      const by = (p) => items.filter((r) => r.id && r.id.startsWith(p));
      const strong = (arr) => arr.filter((r) => r.box >= 3).length;
      h += '<div class="grid2">' +
        [['k:', 'Characters'], ['v:', 'Vocabulary'], ['g:', 'Grammar'], ['c:', 'Comprehension']].map(([p, l]) => '<div class="item"><div class="t">' + l + '</div><div class="small">' + by(p).length + ' met · ' + strong(by(p)) + ' steady</div></div>').join('') + '</div>' +
        '<h3>How you answered</h3><div class="grid2"><div class="item small">Recognised (chose from options): ' + L.stats.recog + '</div><div class="item small">Recalled and typed: ' + L.stats.typed + '</div><div class="item small">Handwritten and recognised: ' + L.stats.hand + '</div><div class="item small">Assisted (help or manual correction): ' + L.stats.assisted + '</div></div>' +
        '<p class="small dim">These are counted separately because choosing, typing and writing show different things. None of them is a lesser way to play.</p>';
    }
    body.innerHTML = h;
    body.querySelectorAll('[data-nb]').forEach((b) => (b.onclick = () => { nbTab = b.getAttribute('data-nb'); notebook(body); }));
    const nk = body.querySelector('[data-a=nextkana]');
    if (nk) nk.onclick = async () => { close(); await RB.lessons.run('kana'); };
    const pr = body.querySelector('[data-a=practice]');
    if (pr) pr.onclick = async () => { close(); await RB.challenge.practice(); };
  }
  function kanaChart(s) {
    const K = RB.kana;
    const groups = RB.lessons.groups();
    if (!groups.length) return '<p class="dim">Kana chart unavailable.</p>';
    const rec = s.learn.items;
    const cell = (ch) => {
      const r = rec['k:' + ch];
      const lvl = !r ? 0 : r.box >= 3 ? 3 : r.box >= 1 ? 2 : 1;
      const col = ['#2a2d44', '#5a4a2a', '#6a7a3a', '#3a7a5a'][lvl];
      const lbl = ['not met', 'met', 'practising', 'steady'][lvl];
      return '<span class="jp" lang="ja" style="display:inline-block;width:2em;text-align:center;margin:1px;border-radius:4px;padding:2px 0;background:' + col + '" title="' + esc(K.romaji(ch) + ' — ' + lbl) + '">' + esc(ch) + '</span>';
    };
    let h = '<p class="small dim">Colour shows how settled each character is: not met · met · practising · steady (hover for the label).</p>';
    for (const g of groups) h += '<div style="margin:0.3em 0"><span class="small dim" style="display:inline-block;min-width:9em">' + esc(g.title || '') + '</span>' + RB.lessons.groupChars(g).map((c) => cell(c.ch)).join('') + '</div>';
    return h;
  }

  // ---- items & equipment --------------------------------------------------------------
  function items(body) {
    const s = RB.game.s;
    const inv = Object.keys(s.inv).map((id) => ({ id, n: s.inv[id], d: RB.content.items[id] })).filter((x) => x.d);
    const slots = [['charm', 'Charm'], ['tool', 'Tool'], ['cosmetic', 'Keepsake (appearance)']];
    let h = '<h3>Equipped</h3><div class="grid2">' + slots.map(([k, l]) => {
      const it = s.equip[k] && RB.content.items[s.equip[k]];
      return '<div class="item"><div class="small dim">' + l + '</div><div class="t">' + (it ? RB.ui.jhtml(it.name.jp) + ' ' + esc(it.name.en) : '<span class="dim">—</span>') + '</div>' + (it ? '<div class="small">' + esc(it.desc || '') + '</div><button class="btn small" data-unequip="' + k + '">Remove</button>' : '') + '</div>';
    }).join('') + '</div>';
    h += '<h3>Carried</h3><div class="list">';
    if (!inv.length) h += '<p class="dim">Your pack is light.</p>';
    for (const x of inv) {
      h += '<div class="item"><div class="t">' + RB.ui.jhtml(x.d.name.jp) + ' <span>' + esc(x.d.name.en) + '</span>' + (x.n > 1 ? ' ×' + x.n : '') + (x.d.key ? ' <span class="small" style="color:var(--accent)">important</span>' : '') + '</div><div class="small">' + esc(RB.script.enVars(x.d.desc || '')) + '</div>' +
        (x.d.slot ? '<button class="btn small" data-equip="' + x.id + '">' + (s.equip[x.d.slot] === x.id ? 'Equipped' : 'Equip') + '</button>' : '') + '</div>';
    }
    h += '</div><p class="small dim">Important items cannot be sold or used up. Nothing essential can be lost.</p>';
    body.innerHTML = h;
    body.onclick = (e) => {
      const eq = e.target.closest('[data-equip]'), un = e.target.closest('[data-unequip]');
      if (eq) { const id = eq.getAttribute('data-equip'); const d = RB.content.items[id]; s.equip[d.slot] = id; RB.audio && RB.audio.sfx('confirm'); items(body); if (d.slot === 'cosmetic') RB.world.W.player.look = null || RB.world.W.player.look; }
      if (un) { s.equip[un.getAttribute('data-unequip')] = null; items(body); }
      if (eq || un) { const W = RB.world.W; if (W.player) { const look = Object.assign({}, s.player.look); const c = s.equip.cosmetic && RB.content.items[s.equip.cosmetic]; if (c && c.acc) look.acc = (look.acc || []).concat([c.acc]); W.player.look = look; } }
    };
  }

  // ---- map & fast travel ------------------------------------------------------------------
  function map(body) {
    const s = RB.game.s;
    const places = Object.keys(RB.content.places).map((id) => Object.assign({ id }, RB.content.places[id]));
    const curMap = RB.content.maps[s.map] || {};
    const canTravel = !curMap.noTravel && RB.game.mode() === 'menu';
    const W = 520, H = 320;
    let svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;max-height:52vh;background:#1a1e2c;border-radius:10px;border:1px solid var(--line-soft)" role="img" aria-label="World map">';
    svg += '<path d="M0 250 Q120 220 200 250 T 520 230 L520 320 L0 320Z" fill="#23304a"/><path d="M60 0 L140 90 L230 60 L300 120 L420 40 L520 80 L520 0Z" fill="#2c3246"/>';
    const roads = RB.content.roads || [];
    for (const [a, b] of roads) {
      const A = RB.content.places[a], B = RB.content.places[b];
      if (!A || !B) continue;
      const known = s.travel[a] || s.travel[b];
      svg += '<line x1="' + A.pos[0] + '" y1="' + A.pos[1] + '" x2="' + B.pos[0] + '" y2="' + B.pos[1] + '" stroke="' + (known ? '#e7c46e' : '#4a4e60') + '" stroke-width="2" stroke-dasharray="' + (known ? '0' : '4 4') + '"/>';
    }
    for (const p of places) {
      const known = s.travel[p.id];
      const here = curMap.place === p.id || (curMap.region && p.region === curMap.region && p.hub);
      svg += '<circle cx="' + p.pos[0] + '" cy="' + p.pos[1] + '" r="' + (here ? 8 : 6) + '" fill="' + (known ? '#e7c46e' : '#3a3e50') + '" stroke="#fff" stroke-width="' + (here ? 2 : 0) + '"/>';
      svg += '<text x="' + (p.pos[0] + 10) + '" y="' + (p.pos[1] + 4) + '" fill="' + (known ? '#f3ecd9' : '#6a6e80') + '" font-size="12">' + esc(known ? p.name.en : '???') + '</text>';
    }
    svg += '</svg>';
    let h = svg + '<h3>Travel</h3><div class="grid2">';
    for (const p of places) {
      if (!s.travel[p.id]) continue;
      h += '<div class="item"><div class="t">' + RB.ui.jhtml(p.name.jp) + ' ' + esc(p.name.en) + '</div>' + (p.desc ? '<div class="small dim">' + esc(p.desc) + '</div>' : '') +
        (canTravel ? '<button class="btn small" data-go="' + p.id + '">Travel here</button>' : '') + '</div>';
    }
    h += '</div>' + (canTravel ? '<p class="small dim">Roads you have walked can be travelled quickly.</p>' : '<p class="small dim">You can\'t fast-travel from here.</p>');
    body.innerHTML = h;
    body.onclick = async (e) => {
      const b = e.target.closest('[data-go]');
      if (!b) return;
      const p = RB.content.places[b.getAttribute('data-go')];
      close();
      await RB.game.transition(p.map, p.x, p.y, p.dir || 'down');
    };
  }

  // ---- log --------------------------------------------------------------------------------------
  function log(body) {
    const s = RB.game.s;
    const lines = s.backlog.slice(-120);
    body.innerHTML = '<div class="list">' + lines.map((l) => {
      const ch = l.who === 'pc' ? { name: { en: s.player.name } } : RB.content.chars[l.who];
      return '<div class="item small"><div class="dim">' + (l.choice ? 'You chose' : ch ? esc(ch.name.en) : '') + '</div>' + (l.jp ? RB.ui.jhtml(l.jp) : '') + '<div class="en">' + esc(RB.script.enVars(l.en || '')) + '</div></div>';
    }).join('') + '</div>';
    body.scrollTop = body.scrollHeight;
  }

  // ---- guide (revisit tutorials any time) ------------------------------------------
  let gTab = 'basics';
  const GUIDE = {
    basics: ['Getting around', [
      'Move with the arrow keys or WASD, or tap/click where you want to walk. Z, Enter or Space talks and examines; X or Esc goes back; C (or ≡) opens this menu. Controls can be remapped in Settings.',
      'A small ▾ marker appears above things you can examine or people you can talk to. Talk to your companion by facing them and pressing Z.',
      'Nothing is timed. Take as long as you like to read, write or think.',
    ]],
    ink: ['Inkweaving (battles)', [
      'Enemies telegraph what they are about to do, in Japanese at your level. Read it: who is it aiming at? Is it heating up, hiding, or asking something?',
      'Pick a response. Ordinary words do what they mean: まもる (protect) raises a ward in front of whoever you choose, みず (water) cools heat, ひかり (light) burns off mist. Unravel restores one of its tangled words and frees a knot. Free every knot to settle the creature.',
      'Then express your response in Japanese — by writing, choosing, or typing. The enemy never acts while you write or read help.',
      'Clean answers build Harmony; when it is full, your companion offers a coordinated technique. Each companion changes the tactics in their own way.',
      'A genuine mistake costs at most 1 resolve per exchange (nothing in Assisted mode). When the recogniser is unsure of your handwriting, it never costs anything. You can always step back from ordinary encounters, and defeat just returns you to the last safe place.',
    ]],
    pad: ['The writing pad', [
      'Draw one character in the box. The pad shows what it thinks you wrote ("I read this as…") and alternatives. Nothing is submitted until you press Confirm, then Submit.',
      'Tap a character in the answer strip to replace it; tap a gap to insert. ↶ undoes a stroke; Clear wipes the box. Use 小 for small kana (ゃ, っ…) and the script buttons to choose hiragana or katakana.',
      'If the recogniser can\'t read you, pick the character from the chart. That counts as "assisted" — which is fine, it just isn\'t counted as unaided handwriting.',
      'You can switch to choices or keyboard (IME) at any time without losing your place.',
    ]],
    bulb: ['Lightbulb help', [
      'Press H or the bulb button. Then hover, focus or tap any Japanese text to see its reading, romaji, meaning in context, beats (morae) and notes. Pin the panel or add the word to your notebook.',
      'Furigana (small readings over kanji) are always shown. Using help during a question marks that answer as assisted, with no penalty.',
    ]],
    saves: ['Saving', [
      'Six slots. Save from Menu → Save. The game also autosaves at safe places; those autosaves belong to their slot and are listed there.',
      'Before you set out with a companion, a special recovery point is kept so you can revisit that choice by loading it (a separate timeline).',
      'Saves live in this browser, for this page\'s address. Clearing site data or private browsing removes them. There is no export or cloud copy.',
    ]],
    kana: ['Kana reference', []],
  };
  function guide(body) {
    let h = '<div class="row" style="margin-bottom:0.5em">' + Object.keys(GUIDE).map((k) => '<button class="btn small' + (gTab === k ? ' on' : '') + '" data-g="' + k + '">' + esc(GUIDE[k][0]) + '</button>').join('') + '</div>';
    if (gTab === 'kana') {
      const s = RB.game.s;
      const groups = RB.lessons.groups();
      h += '<p class="small dim">Tap a character to see its stroke order. Kana you have been taught are bright.</p>';
      for (const g of groups) {
        const cs = RB.lessons.groupChars(g);
        h += '<div style="margin:0.3em 0"><span class="small dim" style="display:inline-block;min-width:9em">' + esc(g.title || '') + '</span>' + cs.map((c) => {
          const taught = !RB.learn.taughtKana() || (s.learn.taught && s.learn.taught[c.ch]) || (s.learn.kanaKnown === 'hira' && RB.kana.isHira(c.ch));
          return '<button class="btn small jp" lang="ja" style="min-width:2.4em;opacity:' + (taught ? 1 : 0.45) + '" data-k="' + esc(c.ch) + '">' + esc(c.ch) + '</button>';
        }).join('') + '</div>';
      }
      h += '<div class="row" style="margin-top:0.6em"><canvas width="160" height="160" class="kdemo" style="width:160px;height:160px;border-radius:8px"></canvas><div class="kinfo"></div></div>';
    } else {
      h += '<h3>' + esc(GUIDE[gTab][0]) + '</h3>' + GUIDE[gTab][1].map((t) => '<p>' + esc(t) + '</p>').join('');
    }
    body.innerHTML = h;
    let stop = () => {};
    body.onclick = (e) => {
      const g = e.target.closest('[data-g]');
      if (g) { stop(); gTab = g.getAttribute('data-g'); guide(body); return; }
      const k = e.target.closest('[data-k]');
      if (k) {
        stop();
        const ch = k.getAttribute('data-k');
        stop = RB.lessons.demo(body.querySelector('.kdemo'), ch);
        body.querySelector('.kinfo').innerHTML = '<div class="jp" lang="ja" style="font-size:2.6em">' + esc(ch) + '</div><div>' + esc(RB.kana.romaji(ch)) + '</div>';
      }
    };
  }

  // ---- save ------------------------------------------------------------------------------------------
  function save(body) {
    const st = RB.save.status();
    body.innerHTML = '<p>' + (st.mode === 'session' ? 'Storage is unavailable here, so saves only last until this page closes.' : 'Choose a slot to save to, or load another campaign.') + '</p>' +
      '<div class="row"><button class="btn primary" data-a="save">Save…</button><button class="btn" data-a="load">Load…</button><button class="btn" data-a="title">Return to title</button></div>' +
      '<p class="small dim">Autosaves happen at safe places (arriving somewhere new, finishing a scene that matters). Manual saves are kept separately from them.</p>';
    body.onclick = async (e) => {
      const b = e.target.closest('[data-a]');
      if (!b) return;
      const a = b.getAttribute('data-a');
      if (a === 'save') RB.ui.title.slots('save', true);
      if (a === 'load') RB.ui.title.slots('load', true);
      if (a === 'title') {
        const r = await RB.ui.confirm('Return to the title screen? Anything since your last save or autosave will be lost.', ['Return to title', 'Cancel']);
        if (r === 0) { close(); RB.game.toTitle(); }
      }
    };
  }

  // ---- settings -----------------------------------------------------------------------------------------
  function settings(body) {
    const st = RB.game.settings;
    const s = RB.game.s;
    const seg = (key, opts, obj) => '<div class="seg">' + opts.map(([v, l]) => '<button class="btn small' + ((obj || st)[key] === v ? ' on' : '') + '" data-set="' + key + '" data-obj="' + (obj ? 'learn' : 'st') + '" data-v="' + v + '">' + esc(l) + '</button>').join('') + '</div>';
    const range = (path, v, min, max, step) => '<input type="range" data-range="' + path + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + v + '">';
    const vs = RB.voice ? RB.voice.status() : { supported: false, localJaCount: 0, note: 'Speech synthesis is not available.' };
    const voices = RB.voice && RB.voice.japaneseVoices ? RB.voice.japaneseVoices() : [];
    const ss = RB.save.status();
    let h = '';
    if (s) {
      h += '<h3>Learning (this campaign)</h3>' +
        '<div class="set-row"><span>Japanese level</span>' + seg('profile', [['F', 'Foundations'], ['E', 'Elementary'], ['I', 'Intermediate'], ['A', 'Advanced']], s.learn) + '</div>' +
        '<div class="set-row"><span>Mistakes in battle</span>' + seg('assist', [['assist', 'Assisted (no cost)'], ['normal', 'Standard (small, capped)']], s.learn) + '</div>' +
        '<div class="set-row"><span>Tactical challenge</span>' + seg('difficulty', [['relaxed', 'Relaxed'], ['normal', 'Standard'], ['hard', 'Demanding']], s.learn) + '</div>';
    }
    h += '<h3>Reading</h3>' +
      '<div class="set-row"><span>Dialogue leads with</span>' + seg('lead', [['en', 'English'], ['ja', 'Japanese']]) + '</div>' +
      '<div class="set-row"><span>Second line</span>' + seg('secondary', [['always', 'Always'], ['tap', 'On tap'], ['off', 'Hidden']]) + '</div>' +
      '<div class="set-row"><span>Menus</span>' + seg('uiLang', [['en', 'English'], ['ja', '日本語']]) + '</div>' +
      '<div class="set-row"><span>Spaces between Japanese words</span>' + seg('spacing', [[true, 'On (beginner-friendly)'], [false, 'Off (standard)']]) + '</div>' +
      '<div class="set-row"><span>Lightbulb help</span>' + seg('lightbulb', [[true, 'On'], [false, 'Off']]) + '</div>' +
      '<div class="set-row"><span>Romaji in help</span>' + seg('romaji', [[true, 'Show'], [false, 'Hide']]) + '</div>' +
      '<div class="set-row"><span>Text speed</span>' + seg('textSpeed', [['normal', 'Normal'], ['fast', 'Fast'], ['instant', 'Instant']]) + '</div>' +
      '<div class="set-row"><span>Seen scenes</span>' + seg('skipSeen', [[true, 'Offer skip'], [false, 'Never skip']]) + '</div>' +
      '<p class="small dim">Furigana is always on: it is an accessibility feature, not a difficulty setting.</p>' +
      '<h3>Answers</h3>' +
      '<div class="set-row"><span>Default answer method</span>' + seg('input', [['hand', 'Handwriting'], ['choice', 'Choices'], ['ime', 'Keyboard/IME']]) + '</div>' +
      '<div class="set-row"><span>Stroke-order practice</span>' + seg('strokePractice', [[false, 'Off (lenient)'], [true, 'Show stroke-order notes']]) + '</div>' +
      '<h3>Sound</h3>' +
      '<div class="set-row"><span>Master</span>' + range('vol.master', st.vol.master, 0, 1, 0.05) + '</div>' +
      '<div class="set-row"><span>Music</span>' + range('vol.music', st.vol.music, 0, 1, 0.05) + '</div>' +
      '<div class="set-row"><span>Effects</span>' + range('vol.sfx', st.vol.sfx, 0, 1, 0.05) + '</div>' +
      '<div class="set-row"><span>Voice</span>' + range('vol.voice', st.vol.voice, 0, 1, 0.05) + '</div>' +
      '<div class="set-row"><span>Mute all</span>' + seg('muted', [[false, 'Sound on'], [true, 'Muted']]) + '</div>' +
      '<h3>Japanese voice (optional)</h3><p class="small">' + esc(vs.note || '') + '</p>' +
      (voices.length ? '<div class="set-row"><span>Voice</span><select data-voice>' + voices.map((v) => '<option value="' + esc(v.voiceURI) + '"' + (st.voice.uri === v.voiceURI ? ' selected' : '') + '>' + esc(v.name) + '</option>').join('') + '</select></div>' +
        '<div class="set-row"><span>Speak dialogue automatically</span><div class="seg"><button class="btn small' + (st.voice.auto ? ' on' : '') + '" data-voiceauto="1">On</button><button class="btn small' + (!st.voice.auto ? ' on' : '') + '" data-voiceauto="0">Off</button></div></div>' +
        '<div class="set-row"><span>Speech rate</span>' + range('voice.rate', st.voice.rate, 0.6, 1.3, 0.05) + '</div>' : '') +
      '<p class="small dim">Voices are your device\'s own speech synthesis, labelled as such. They are not recorded actors and not a pronunciation authority. Everything works without them.</p>' +
      '<h3>Display &amp; comfort</h3>' +
      '<div class="set-row"><span>Text size</span>' + range('textScale', st.textScale, 0.85, 1.5, 0.05) + '</div>' +
      '<div class="set-row"><span>Contrast</span>' + seg('contrast', [['normal', 'Normal'], ['high', 'High']]) + '</div>' +
      '<div class="set-row"><span>Reduce motion</span>' + seg('reducedMotion', [[false, 'Off'], [true, 'On']]) + '</div>' +
      '<div class="set-row"><span>Touch controls</span>' + seg('touch', [['auto', 'Auto'], ['on', 'Always'], ['off', 'Never']]) + '</div>' +
      '<h3>Controls</h3><div class="grid2">' + Object.keys(RB.input.DEFAULT_BINDS).map((a) => '<div class="item small row"><span class="grow">' + esc(RB.input.ACTION_LABELS[a]) + '</span><button class="btn small" data-bind="' + a + '">' + esc(RB.input.getBinds()[a].map(RB.input.keyName).join(' / ')) + '</button></div>').join('') + '</div>' +
      '<div class="row"><button class="btn small" data-a="resetbinds">Reset controls</button></div>' +
      '<h3>Storage</h3><p class="small">' + esc(ss.mode === 'idb' ? 'Saving to this browser (IndexedDB).' : ss.mode === 'local' ? 'Saving to this browser (localStorage fallback).' : 'Session only: nothing persists after closing.') +
      ' Saves belong to this browser profile and this page\'s address. Clearing site data, private windows or a different address/browser will not see them.' + (ss.persisted ? ' The browser has granted persistent storage (it can still be cleared by you).' : '') + '</p>' +
      (ss.mode !== 'session' && !ss.persisted ? '<button class="btn small" data-a="persist">Ask the browser to keep saves persistent</button>' : '');
    body.innerHTML = h;
    body.onclick = async (e) => {
      const b = e.target.closest('[data-set],[data-bind],[data-a],[data-voiceauto]');
      if (!b) return;
      if (b.hasAttribute('data-set')) {
        let v = b.getAttribute('data-v');
        if (v === 'true') v = true; else if (v === 'false') v = false;
        const key = b.getAttribute('data-set');
        if (b.getAttribute('data-obj') === 'learn') s.learn[key] = v; else st[key] = v;
        await RB.game.saveSettings();
        if (key === 'lightbulb') RB.ui.hud.refresh();
        settings(body);
      } else if (b.hasAttribute('data-voiceauto')) {
        st.voice.auto = b.getAttribute('data-voiceauto') === '1';
        await RB.game.saveSettings();
        settings(body);
      } else if (b.hasAttribute('data-bind')) {
        const a = b.getAttribute('data-bind');
        b.textContent = 'Press a key…';
        RB.input.captureNext((code) => {
          const binds = RB.util.deepClone(RB.input.getBinds());
          for (const k in binds) binds[k] = binds[k].filter((c) => c !== code);
          binds[a] = [code].concat(binds[a].slice(0, 1));
          st.binds = binds;
          RB.input.setBinds(binds);
          RB.game.saveSettings();
          settings(body);
        });
      } else if (b.getAttribute('data-a') === 'resetbinds') {
        st.binds = null; RB.input.setBinds(null); await RB.game.saveSettings(); settings(body);
      } else if (b.getAttribute('data-a') === 'persist') {
        const r = await RB.save.requestPersist();
        RB.ui.notice(r ? 'The browser agreed to keep this site\'s storage persistent.' : 'The browser declined; saves still work but may be cleared under storage pressure.', 'info');
        settings(body);
      }
    };
    body.oninput = (e) => {
      const r = e.target.closest('[data-range]');
      if (r) {
        const path = r.getAttribute('data-range').split('.');
        if (path.length === 2) st[path[0]][path[1]] = +r.value; else st[path[0]] = +r.value;
        RB.game.applySettings();
        clearTimeout(settings._t);
        settings._t = setTimeout(() => RB.game.saveSettings(), 300);
      }
      const v = e.target.closest('[data-voice]');
      if (v) { st.voice.uri = v.value; RB.game.saveSettings(); RB.voice.speak('こんにちは'); }
    };
  }
  function settingsStandalone() {
    const scrim = RB.ui.el('div', 'scrim');
    const p = RB.ui.el('div', 'panel');
    scrim.appendChild(p);
    const lay = { el: scrim, name: 'settings' };
    lay.onCancel = () => RB.ui.popLayer(lay);
    p.innerHTML = '<header><h2>Settings</h2><button class="btn small" data-close>Back</button></header><div class="body"></div>';
    p.querySelector('[data-close]').onclick = lay.onCancel;
    settings(p.querySelector('.body'));
    RB.ui.pushLayer(lay);
  }

  return { open, close, closeAll, settingsStandalone, isOpen: () => !!layer };
})();

RB.ui.credits = function () {
  return RB.ui.card('{終|お}わり ── そして 、 {道|みち} は {続|つづ}く 。', 'The end — and the road goes on.');
};
RB.ui.shop = function () { return Promise.resolve(); };
