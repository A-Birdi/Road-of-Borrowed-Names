/* Title screen and the six campaign slots. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.ui.title = (function () {
  'use strict';
  const esc = RB.util.esc;
  let layer = null;

  function storageBanner() {
    const st = RB.save.status();
    const file = st.fileMode ? ' You opened the file directly (file://). This browser allowed a storage test here, but some browsers treat each file location differently; for dependable saves serve the folder from a local web address.' : '';
    if (st.mode === 'idb') return '<div class="storage-banner ok">Saving works in this browser (IndexedDB). Saves belong to this browser profile and this page\'s address; clearing site data or private browsing can remove them.' + esc(file) + (st.persisted ? ' Persistent storage is granted.' : '') + '</div>';
    if (st.mode === 'local') return '<div class="storage-banner">IndexedDB was unavailable, so saves use this browser\'s smaller localStorage instead. They still belong to this browser profile and address.' + esc(file) + '</div>';
    return '<div class="storage-banner">This browser context refused storage, so the game is <b>session-only</b>: progress will be lost when the page closes. Nothing is being saved.</div>';
  }

  function drawBackdrop(c, w, h, t) {
    const g = c.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#0b0e22');
    g.addColorStop(0.6, '#1c2040');
    g.addColorStop(1, '#2a2a3a');
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);
    const r = RB.util.rng(7);
    for (let i = 0; i < 90; i++) {
      const x = r() * w, y = r() * h * 0.55, tw = (Math.sin(t / 700 + i) + 1) / 2;
      c.fillStyle = `rgba(255,248,220,${0.25 + tw * 0.55 * (RB.game.reducedMotion() ? 0.5 : 1)})`;
      c.fillRect(Math.round(x), Math.round(y), 1, 1);
    }
    // hills
    c.fillStyle = '#161a30';
    c.beginPath(); c.moveTo(0, h * 0.62);
    for (let x = 0; x <= w; x += 8) c.lineTo(x, h * 0.62 - Math.sin(x / 60) * 10 - Math.sin(x / 23) * 4);
    c.lineTo(w, h); c.lineTo(0, h); c.fill();
    c.fillStyle = '#1e2436';
    c.beginPath(); c.moveTo(0, h * 0.72);
    for (let x = 0; x <= w; x += 8) c.lineTo(x, h * 0.72 - Math.sin(x / 40 + 2) * 6);
    c.lineTo(w, h); c.lineTo(0, h); c.fill();
    // winding road with lanterns
    c.fillStyle = '#3a3448';
    c.beginPath();
    c.moveTo(w * 0.5 - 2, h * 0.64);
    c.quadraticCurveTo(w * 0.3, h * 0.8, w * 0.45, h);
    c.lineTo(w * 0.65, h);
    c.quadraticCurveTo(w * 0.42, h * 0.8, w * 0.5 + 2, h * 0.64);
    c.fill();
    for (let i = 0; i < 6; i++) {
      const k = i / 5;
      const x = Math.round(w * (0.5 - 0.12 * Math.sin(k * 2.6)) + (i % 2 ? 1 : -1) * (8 + k * 34));
      const y = Math.round(h * (0.66 + k * 0.3));
      const s = 1 + k * 2;
      const lit = i !== 3 || Math.floor(t / 2600) % 2 === 0; // one lantern keeps going out
      c.fillStyle = '#2a2430';
      c.fillRect(x, y - 10 * s, Math.max(1, s), 10 * s);
      if (lit) {
        const gl = c.createRadialGradient(x, y - 11 * s, 0, x, y - 11 * s, 10 * s);
        gl.addColorStop(0, 'rgba(255,210,120,0.8)');
        gl.addColorStop(1, 'rgba(255,210,120,0)');
        c.fillStyle = gl;
        c.fillRect(x - 10 * s, y - 21 * s, 20 * s, 20 * s);
      }
      c.fillStyle = lit ? '#ffd27a' : '#4a4650';
      c.fillRect(x - s, y - 12 * s, 3 * s, 3 * s);
    }
    // reeds foreground
    for (let x = 0; x < w; x += 3) {
      const hh = 6 + ((x * 7) % 11);
      const sway = RB.game.reducedMotion() ? 0 : Math.sin(t / 900 + x / 13) * 1.2;
      c.fillStyle = '#12161e';
      c.fillRect(x, h - hh, 1, hh);
      c.fillRect(Math.round(x + sway), h - hh - 3, 1, 3);
    }
  }

  function show() {
    RB.render.setOverride(drawBackdrop);
    RB.audio && RB.audio.playSong('title');
    if (layer) RB.ui.popLayer(layer);
    const box = RB.ui.el('div', 'title');
    box.innerHTML =
      '<h1>The Road of Borrowed Names</h1>' +
      RB.ui.jhtml('{借|か}りた {名|な} の {道|みち}') +
      '<div class="menu">' +
      '<button class="btn primary" data-a="continue">Continue</button>' +
      '<button class="btn" data-a="new">New Game</button>' +
      '<button class="btn" data-a="load">Load</button>' +
      '<button class="btn" data-a="settings">Settings</button>' +
      '<button class="btn" data-a="about">About &amp; credits</button>' +
      '</div><div class="foot">' + storageBanner() + '<div>Keyboard: arrows/WASD move · Z/Enter/Space confirm · X/Esc back · C menu · H lightbulb help. Mouse, touch and stylus supported.</div></div>';
    layer = { el: box, name: 'title' };
    box.onclick = async (e) => {
      const b = e.target.closest('[data-a]');
      if (!b) return;
      const a = b.getAttribute('data-a');
      RB.audio && RB.audio.sfx('confirm');
      if (a === 'new') slots('new');
      if (a === 'load') slots('load');
      if (a === 'settings') RB.ui.menu.settingsStandalone();
      if (a === 'about') about();
      if (a === 'continue') {
        const list = await RB.save.list();
        const used = list.filter((s) => !s.empty && !s.corrupt);
        if (!used.length) { RB.ui.notice('No saved campaign yet — start a New Game.', 'info'); return; }
        used.sort((x, y) => Math.max(y.meta.savedAt, y.auto ? y.auto.savedAt : 0) - Math.max(x.meta.savedAt, x.auto ? x.auto.savedAt : 0));
        const s = used[0];
        hide();
        const ok = await RB.game.loadCampaign(s.slot, s.autoNewer ? 'auto' : 'manual').catch((err) => { RB.ui.notice(err.message, 'bad'); return false; });
        if (!ok) show();
      }
    };
    RB.ui.pushLayer(layer);
    RB.save.list().then((list) => {
      const any = list.some((s) => !s.empty && !s.corrupt);
      const c = box.querySelector('[data-a=continue]');
      if (!any && c) c.classList.add('hidden');
      const f = RB.ui.focusables(box);
      if (f[0]) f[0].focus();
    });
  }
  function hide() {
    if (layer) { RB.ui.popLayer(layer); layer = null; }
  }

  function fmtDate(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }
  function slotCard(s, ctx) {
    const m = s.meta;
    let html = '<div class="slot" data-slot="' + s.slot + '">';
    html += s.thumb ? '<img alt="" src="' + esc(s.thumb) + '">' : '<div class="thumb"></div>';
    html += '<div><div class="n">Slot ' + s.slot + '</div>';
    if (s.empty) html += '<div class="dim">Empty</div>';
    else if (s.corrupt) html += '<div style="color:var(--bad)">Unreadable save — left untouched.</div><div class="small dim">' + esc(s.corruptWhy || '') + '</div>';
    else {
      html += '<div>' + esc(m.name) + (m.comp ? ' &amp; ' + esc(m.comp) : '') + '</div>';
      html += '<div class="small dim">' + (m.chapter ? 'Chapter ' + m.chapter + ' · ' : '') + esc(m.place) + (m.post ? ' · after the story' : '') + '</div>';
      html += '<div class="small dim">Played ' + RB.util.fmtTime(m.playtime) + ' · ' + (s.manual ? 'saved ' + fmtDate(m.savedAt) : 'autosave only') + '</div>';
      if (s.autoNewer && s.manual) html += '<div class="small" style="color:var(--accent)">Newer autosave: ' + fmtDate(s.auto.savedAt) + '</div>';
    }
    html += '</div><div class="acts">';
    const cur = RB.save.current().slot;
    if (ctx === 'new') html += s.empty ? '<button class="btn primary" data-a="start">Start here</button>' : '<button class="btn danger" data-a="start">Overwrite with new game…</button>';
    if (ctx === 'save') html += '<button class="btn primary" data-a="save">' + (s.empty ? 'Save here' : s.slot === cur ? 'Save' : 'Overwrite…') + '</button>';
    if (ctx === 'load' && !s.empty && !s.corrupt) {
      if (s.manual) html += '<button class="btn primary" data-a="load">Load</button>';
      if (s.auto) html += '<button class="btn" data-a="loadauto">' + (s.autoNewer ? 'Continue (autosave)' : 'Load autosave') + '</button>';
      if (s.pre) html += '<button class="btn" data-a="loadpre" title="Return to the room before choosing your companion">Before departure</button>';
    }
    if (!s.empty && ctx !== 'new') html += '<button class="btn small" data-a="copy">Copy…</button>';
    if (!s.empty && ctx !== 'new') html += '<button class="btn small danger" data-a="delete">Delete…</button>';
    html += '</div></div>';
    return html;
  }

  // ctx: 'new' | 'load' | 'save'
  async function slots(ctx, fromGame) {
    const scrim = RB.ui.el('div', 'scrim');
    const panel = RB.ui.el('div', 'panel');
    scrim.appendChild(panel);
    const lay = { el: scrim, name: 'slots' };
    const title = ctx === 'new' ? 'New game — choose a slot' : ctx === 'save' ? 'Save' : 'Load';
    const close = () => RB.ui.popLayer(lay);
    lay.onCancel = close;
    async function refresh() {
      const list = await RB.save.list();
      panel.innerHTML = '<header><h2>' + esc(title) + '</h2><button class="btn small" data-a="close">Back</button></header><div class="body">' + storageBanner() +
        (RB.save.current().readOnly && ctx === 'save' ? '<div class="storage-banner">This tab is read-only for this campaign because another tab owns it. Saving to other slots is still possible.</div>' : '') +
        '<div class="slots">' + list.map((s) => slotCard(s, ctx)).join('') + '</div>' +
        '<p class="small dim">Six local slots. Copy makes an independent duplicate in another slot. Deleting a slot also removes its autosaves. There is no export or cloud copy.</p></div>';
      const f = RB.ui.focusables(panel);
      if (f[1]) f[1].focus();
      panel.onclick = async (e) => {
        const b = e.target.closest('[data-a]');
        if (!b) return;
        const a = b.getAttribute('data-a');
        if (a === 'close') { close(); return; }
        const slot = +b.closest('[data-slot]').getAttribute('data-slot');
        const s = list[slot - 1];
        try {
          if (a === 'start') {
            if (!s.empty) {
              const r = await RB.ui.confirm('Slot ' + slot + ' holds ' + (s.meta ? s.meta.name + "'s campaign" : 'a campaign') + '. Starting a new game here will erase it and its autosaves.', ['Erase and start', 'Cancel'], { danger: true });
              if (r !== 0) return;
              await RB.save.del(slot);
            }
            close();
            hide();
            RB.ui.create.begin(slot);
          } else if (a === 'save') {
            const cur = RB.save.current().slot;
            if (!s.empty && slot !== cur) {
              const r = await RB.ui.confirm('Overwrite slot ' + slot + ' (' + (s.meta ? s.meta.name : '') + ')? That campaign will be replaced by this one.', ['Overwrite', 'Cancel'], { danger: true });
              if (r !== 0) return;
            }
            try {
              await RB.save.manualSave(slot);
            } catch (err) {
              if (err instanceof RB.save.ConflictError) {
                const r = await RB.ui.confirm('This slot was saved from another tab since you loaded it. Overwrite that newer save with this game?', ['Overwrite anyway', 'Cancel'], { danger: true });
                if (r !== 0) return;
                await RB.save.writeSlot(slot, RB.game.s, { force: true, thumb: RB.render.thumbnail() });
              } else throw err;
            }
            RB.audio && RB.audio.sfx('save');
            RB.ui.notice(RB.save.status().mode === 'session' ? 'Saved for this session only — storage is unavailable, so it will be lost when the page closes.' : 'Saved to slot ' + slot + '.', RB.save.status().mode === 'session' ? 'warn' : 'info');
            refresh();
          } else if (a === 'load' || a === 'loadauto' || a === 'loadpre') {
            if (fromGame) {
              const r = await RB.ui.confirm('Load slot ' + slot + '? Unsaved progress in the current game will be lost (your latest autosave remains).', ['Load', 'Cancel']);
              if (r !== 0) return;
            }
            close();
            RB.ui.menu.closeAll && RB.ui.menu.closeAll();
            hide();
            await RB.game.loadCampaign(slot, a === 'loadauto' ? 'auto' : a === 'loadpre' ? 'predeparture' : 'manual');
          } else if (a === 'copy') {
            const target = await pickSlot(list, slot);
            if (!target) return;
            if (!list[target - 1].empty) {
              const r = await RB.ui.confirm('Slot ' + target + ' is in use. Replace it with a copy of slot ' + slot + '?', ['Replace', 'Cancel'], { danger: true });
              if (r !== 0) return;
            }
            await RB.save.copy(slot, target);
            RB.ui.notice('Copied slot ' + slot + ' to slot ' + target + '. The two campaigns are now independent.', 'info');
            refresh();
          } else if (a === 'delete') {
            const r = await RB.ui.confirm('Delete slot ' + slot + '? Its manual save and autosaves will be removed. This cannot be undone.', ['Delete', 'Cancel'], { danger: true });
            if (r !== 0) return;
            await RB.save.del(slot);
            RB.ui.notice('Slot ' + slot + ' deleted.', 'info');
            refresh();
          }
        } catch (err) {
          RB.ui.notice(err.message || String(err), 'bad');
          if (!RB.game.G.playing && !layer) show();
        }
      };
    }
    RB.ui.pushLayer(lay);
    await refresh();
  }
  async function pickSlot(list, except) {
    const btns = list.filter((s) => s.slot !== except).map((s) => 'Slot ' + s.slot + (s.empty ? ' (empty)' : ' (' + (s.meta ? s.meta.name : 'used') + ')'));
    btns.push('Cancel');
    const r = await RB.ui.confirm('Copy slot ' + except + ' to which slot?', btns);
    if (r === btns.length - 1) return null;
    return list.filter((s) => s.slot !== except)[r].slot;
  }

  function about() {
    const scrim = RB.ui.el('div', 'scrim');
    const panel = RB.ui.el('div', 'panel');
    scrim.appendChild(panel);
    const lay = { el: scrim, name: 'about' };
    lay.onCancel = () => RB.ui.popLayer(lay);
    panel.innerHTML = '<header><h2>About</h2><button class="btn small" data-a="close">Back</button></header><div class="body">' +
      '<p>An original Japanese-learning adventure. Story, art, music and code are procedural and self-contained in this one file; nothing is downloaded while you play.</p>' +
      '<p>The world, its lantern roads and its magic are fiction. The Japanese is ordinary Japanese; where the story invents a term it is labelled as fictional in the notebook.</p>' +
      '<p>Voices, when present, come from speech synthesis already installed on your device. They are not recorded performances, and they are not a pronunciation reference.</p>' +
      '<h3>Third-party data</h3><pre style="white-space:pre-wrap;font-size:0.8em" class="dim">' + esc(RB.NOTICE || 'See the notice comment at the top of this file.') + '</pre></div>';
    panel.querySelector('[data-a=close]').onclick = lay.onCancel;
    RB.ui.pushLayer(lay);
  }

  return { show, hide, slots, drawBackdrop };
})();
