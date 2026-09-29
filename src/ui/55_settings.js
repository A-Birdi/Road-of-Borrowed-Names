/* Settings, as a folio section of named groups. Real controls: radio groups
 * for few exclusive options, switches for on/off, sliders with values,
 * a select for voices, key capture for remapping. Campaign-specific learning
 * choices are shown apart from preferences that apply to every campaign.
 * Changes apply and persist at once, as before (sliders debounce saving). */
var RB = (globalThis.RB = globalThis.RB || {});

RB.ui.settings = (function () {
  'use strict';
  const esc = RB.util.esc;
  const I = (n) => RB.ui.folio.icon(n);
  const GROUPS = [
    ['reading', 'Reading & Language', '{読|よ}み{方|かた}と{言語|げんご}', 'words'],
    ['learning', 'Learning & Challenge', '{学|まな}びと{難|むずか}しさ', 'practice'],
    ['controls', 'Controls', '{操作|そうさ}', 'settings'],
    ['audio', 'Audio', '{音|おと}', 'sound'],
    ['display', 'Display & Accessibility', '{表示|ひょうじ}', 'bulb'],
    ['storage', 'Storage', '{保存|ほぞん}', 'ledger'],
  ];
  let lay = null, fr = null, group = null, mq = null, sampleCache = null;

  function open() {
    if (lay) return;
    fr = RB.ui.folio.frame({ onClose: close, closeLabel: 'Back', closeIcon: 'back', cls: 'folio-settings' });
    fr.setTitle(RB.ui.label('{設定|せってい}', 'Settings'), RB.game.s ? 'Some choices belong to this campaign' : 'Preferences for every campaign');
    lay = { el: fr.scrim, name: 'settings' };
    lay.onCancel = back;
    RB.ui.pushLayer(lay);
    if (!group && RB.ui.folio.wide()) group = 'reading';
    render();
    if (typeof matchMedia !== 'undefined') { mq = matchMedia(RB.ui.folio.WIDE); mq.onchange = () => { if (lay) { if (!group && RB.ui.folio.wide()) group = 'reading'; render(); } }; }
  }
  function close() {
    if (!lay) return;
    if (mq) mq.onchange = null;
    RB.ui.popLayer(lay);
    lay = null; fr = null;
    if (!RB.ui.folio.wide()) group = null;
  }
  function back() {
    if (group && !RB.ui.folio.wide()) { group = null; render(); return; }
    close();
  }

  function render() {
    const two = RB.ui.folio.wide();
    const leaves = fr.box.querySelectorAll('.leaf');
    const keep = leaves.length ? [leaves[0].scrollTop, leaves[1] ? leaves[1].scrollTop : 0] : [0, 0];
    fr.box.innerHTML = '<div class="spread' + (two ? ' two' : '') + '"><div class="leaf" tabindex="0" aria-label="Settings groups"></div><div class="leaf leaf-b" tabindex="0" aria-label="Settings"></div></div>';
    const [A, B] = fr.box.querySelectorAll('.leaf');
    const index = '<h3>Groups</h3><ul class="index">' + GROUPS.map(([id, en, jp, ic]) => '<li><button data-grp="' + id + '" aria-current="' + (group === id) + '">' + I(ic) + '<span class="lbl">' + RB.ui.label(jp, en) + '</span><span class="fill"></span></button></li>').join('') + '</ul>' +
      '<p class="muted small">Changes take effect straight away and are remembered in this browser.</p>';
    if (two) { A.innerHTML = index; B.innerHTML = groupHtml(group || 'reading'); }
    else if (!group) { A.innerHTML = index; }
    else { A.innerHTML = '<div class="backline"><button class="pbtn quiet" data-grp="">' + I('back') + 'All groups</button></div>' + groupHtml(group); }
    A.scrollTop = keep[0]; B.scrollTop = keep[1];
    for (const L of [A, B]) wire(L);
  }

  // ---- control builders ------------------------------------------------------------------
  let uid = 0;
  function radios(key, label, opts, obj, hint) {
    const cur = (obj === 'learn' ? RB.game.s.learn : RB.game.settings)[key];
    const name = 'r' + (++uid) + key;
    return '<fieldset class="field"><legend>' + esc(label) + '</legend><div class="opts">' + opts.map(([v, l]) =>
      '<label class="opt"><input type="radio" name="' + name + '" data-set="' + key + '" data-obj="' + (obj || 'st') + '" value="' + esc(String(v)) + '"' + (String(cur) === String(v) ? ' checked' : '') + '><span>' + esc(l) + '</span></label>').join('') + '</div>' + (hint ? '<div class="hint">' + esc(hint) + '</div>' : '') + '</fieldset>';
  }
  function sw(key, label, hint, invert) {
    const st = RB.game.settings;
    const on = (key === 'contrast' ? st.contrast === 'high' : !!st[key]) !== !!invert;
    return '<div class="field"><label class="switch"><input type="checkbox" role="switch" data-sw="' + key + '"' + (invert ? ' data-inv="1"' : '') + (on ? ' checked' : '') + '><span>' + esc(label) + '</span><span class="state">' + (on ? 'On' : 'Off') + '</span></label>' + (hint ? '<div class="hint">' + esc(hint) + '</div>' : '') + '</div>';
  }
  function slider(path, label, v, min, max, step, fmt) {
    const id = 'sl' + (++uid);
    return '<div class="field"><label class="lab" for="' + id + '">' + esc(label) + '</label><div class="slider"><input type="range" id="' + id + '" data-range="' + path + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + v + '"><output for="' + id + '">' + esc(fmt(v)) + '</output></div></div>';
  }
  const pct = (v) => Math.round(v * 100) + '%';

  function sample() {
    if (sampleCache) return sampleCache;
    const sc = RB.content.scenes['rw.arrive'];
    const c = sc && sc.cmds.find((x) => x.op === 'say' && x.jp);
    sampleCache = c ? { jp: c.jp, en: c.en } : { jp: '{嵐|あらし} の {次|つぎ} の {朝|あさ} 。', en: 'The morning after the storm.' };
    return sampleCache;
  }
  function preview() {
    const st = RB.game.settings;
    const smp = sample();
    const ja = st.lead === 'ja';
    const main = ja ? RB.ui.jhtml(smp.jp) : '<span class="enline">' + esc(smp.en) + '</span>';
    const sub = st.secondary === 'off' ? '' : st.secondary === 'tap' ? '<div class="pv-sub tap">(' + (ja ? 'English' : 'Japanese') + ' appears when you tap the line)</div>' : '<div class="pv-sub">' + (ja ? '<span class="enline">' + esc(smp.en) + '</span>' : RB.ui.jhtml(smp.jp)) + '</div>';
    return '<figure class="pv"><figcaption>Preview — a line from the game with your current reading settings</figcaption><div class="pv-box"><div class="pv-main">' + main + '</div>' + sub + '</div></figure>';
  }

  function groupHtml(g) {
    const st = RB.game.settings;
    const s = RB.game.s;
    const title = GROUPS.find((x) => x[0] === g);
    let h = '<h3>' + I(title[3]) + ' ' + RB.ui.label(title[2], title[1]) + '</h3>';
    if (g === 'reading') {
      h += preview() +
        radios('lead', 'Dialogue leads with', [['en', 'English'], ['ja', 'Japanese']]) +
        radios('secondary', 'The second language', [['always', 'Always shown'], ['tap', 'Shown when tapped'], ['off', 'Hidden']]) +
        sw('spacing', 'Spaces between Japanese words', 'Beginner-friendly. Standard Japanese is written without spaces.') +
        radios('uiLang', 'Menu language', [['en', 'English'], ['ja', '日本語']]) +
        sw('lightbulb', 'Word help (lightbulb)', 'Hover, focus or tap Japanese text for reading, meaning and notes.') +
        sw('romaji', 'Romaji in word help') +
        radios('textSpeed', 'Text speed', [['normal', 'Normal'], ['fast', 'Fast'], ['instant', 'Instant']]) +
        sw('skipSeen', 'Offer to skip scenes you have already seen') +
        '<p class="muted small">Furigana (readings over kanji) is always shown. It is an accessibility feature, not a difficulty setting.</p>';
    } else if (g === 'learning') {
      if (s) {
        h += '<div class="campaign-box"><div class="kind">' + I('ledger') + ' Saved with this campaign (' + esc(s.player.name) + ')</div>' +
          radios('profile', 'Japanese level', [['F', 'Foundations'], ['E', 'Elementary'], ['I', 'Intermediate'], ['A', 'Advanced']], 'learn', 'Changes which version of each challenge you meet. It never locks you out of the story.') +
          radios('assist', 'Mistakes in battle', [['assist', 'Assisted — no cost'], ['normal', 'Standard — small and capped']], 'learn') +
          radios('difficulty', 'Tactical challenge', [['relaxed', 'Relaxed'], ['normal', 'Standard'], ['hard', 'Demanding']], 'learn', 'Separate from the Japanese level.') + '</div>';
      } else {
        h += '<p class="note-slip">Japanese level, mistakes and tactical challenge are chosen for each campaign when you start it, and can be changed here during play.</p>';
      }
      h += '<div class="kind">' + I('settings') + ' For every campaign</div>' +
        radios('input', 'Default way to answer', [['hand', 'Handwriting'], ['choice', 'Choices'], ['ime', 'Keyboard / IME']], null, 'You can switch during any question without losing your place.') +
        radios('padKanji', 'Handwriting reads', [['auto', 'By Japanese level'], ['on', 'Kanji or kana'], ['off', 'Kana only']], null, 'By level: kana only in Foundations, kanji or kana from Elementary on. The pad knows every kanji in the game (the chart lists them all); writing in kana is always fine. Kana practice reads kana only. You can also change this with Read as on the writing pad.') +
        sw('strokePractice', 'Show stroke-order notes after handwriting', 'Off keeps handwriting lenient: only the shape is checked.') +
        radios('questGuide', 'Quest guidance', [['full', 'Markers and hints'], ['hints', 'Hints only (no markers)'], ['off', 'Off (objectives only)']], null,
          'Markers point to where the followed quest’s next step happens. Hints are nudges you open in the Journey page. Asking for them is free and never counts as a mistake.');
    } else if (g === 'controls') {
      const binds = RB.input.getBinds();
      h += '<p class="muted small">Choose Change, then press the key you want. Each key does one thing; taking a key from another action removes it there.</p><ul class="entries keys">' +
        Object.keys(RB.input.DEFAULT_BINDS).map((a) => '<li class="entry"><span class="mark">' + I('next') + '</span><div><div class="t">' + esc(RB.input.ACTION_LABELS[a]) + '</div><div class="muted small keycaps">' + binds[a].map((k) => '<kbd>' + esc(RB.input.keyName(k)) + '</kbd>').join(' ') + '</div></div><button class="pbtn" data-bind="' + a + '">Change</button></li>').join('') + '</ul>' +
        '<div class="row-acts"><button class="pbtn" data-a="resetbinds">Reset all keys</button></div>' +
        radios('touch', 'On-screen touch controls', [['auto', 'Automatic'], ['on', 'Always'], ['off', 'Never']], null, 'Automatic shows them on touch screens.') +
        radios('touchHand', 'Action and Run buttons on the', [['right', 'Right (move on the left)'], ['left', 'Left (move on the right)']]) +
        radios('touchSize', 'Touch control size', [['normal', 'Standard'], ['large', 'Large']]);
    } else if (g === 'audio') {
      const vs = RB.voice ? RB.voice.status() : { supported: false, localJaCount: 0, note: 'Speech synthesis is not available.' };
      const voices = RB.voice && RB.voice.japaneseVoices ? RB.voice.japaneseVoices() : [];
      h += slider('vol.master', 'Overall volume', st.vol.master, 0, 1, 0.05, pct) + slider('vol.music', 'Music', st.vol.music, 0, 1, 0.05, pct) +
        slider('vol.sfx', 'Effects', st.vol.sfx, 0, 1, 0.05, pct) + slider('vol.voice', 'Voice', st.vol.voice, 0, 1, 0.05, pct) + sw('muted', 'Mute all sound') +
        '<h3>' + I('sound') + ' Japanese voice (optional)</h3><p class="small">' + esc(vs.note || '') + '</p>' +
        (voices.length ? '<div class="field"><label class="lab" for="vsel">Voice</label><select id="vsel" data-voice>' + voices.map((v) => '<option value="' + esc(v.voiceURI) + '"' + (st.voice.uri === v.voiceURI ? ' selected' : '') + '>' + esc(v.name) + '</option>').join('') + '</select></div>' +
          '<div class="field"><label class="switch"><input type="checkbox" role="switch" data-voiceauto' + (st.voice.auto ? ' checked' : '') + '><span>Speak dialogue automatically</span><span class="state">' + (st.voice.auto ? 'On' : 'Off') + '</span></label></div>' +
          slider('voice.rate', 'Speech rate', st.voice.rate, 0.6, 1.3, 0.05, (v) => v.toFixed(2) + '×') : '<p class="note-slip">No Japanese voice is installed on this device, so nothing will be spoken. Everything works without it.</p>') +
        '<p class="muted small">Voices are your device\'s own speech synthesis, labelled as such. They are not recorded actors and not a pronunciation authority.</p>';
    } else if (g === 'display') {
      h += preview() + slider('textScale', 'Text size', st.textScale, 0.85, 1.5, 0.05, pct) + sw('contrast', 'High contrast', null) + sw('reducedMotion', 'Reduce motion', 'Removes sliding and bouncing; changes still show immediately.');
    } else if (g === 'storage') {
      const ss = RB.save.status();
      h += '<p class="' + (ss.mode === 'session' ? 'note-slip bad' : 'note-slip') + '">' + esc(ss.mode === 'idb' ? 'Saving to this browser (IndexedDB).' : ss.mode === 'local' ? 'Saving to this browser (localStorage fallback).' : 'Session only: nothing persists after closing.') + '</p>' +
        '<p>Saves belong to this browser profile and this page\'s address. Clearing site data, private windows, or opening the game from a different address or browser will not see them.' + (ss.persisted ? ' The browser has granted persistent storage (you can still clear it yourself).' : '') + '</p>' +
        (ss.mode !== 'session' && !ss.persisted ? '<div class="row-acts"><button class="pbtn" data-a="persist">Ask the browser to keep saves</button></div>' : '');
    }
    return h;
  }

  // ---- behaviour (unchanged persistence: apply now, save now; sliders debounce) --------------
  function wire(L) {
    L.onclick = async (e) => {
      const gb = e.target.closest('[data-grp]');
      if (gb) { group = gb.dataset.grp || null; render(); return; }
      const b = e.target.closest('[data-bind],[data-a]');
      if (!b) return;
      const st = RB.game.settings;
      if (b.hasAttribute('data-bind')) {
        const a = b.dataset.bind;
        b.textContent = 'Press a key…';
        RB.input.captureNext((code) => {
          const binds = RB.util.deepClone(RB.input.getBinds());
          for (const k in binds) binds[k] = binds[k].filter((c) => c !== code);
          binds[a] = [code].concat(binds[a].slice(0, 1));
          st.binds = binds;
          RB.input.setBinds(binds);
          RB.game.saveSettings();
          render();
        });
      } else if (b.dataset.a === 'resetbinds') {
        st.binds = null; RB.input.setBinds(null); await RB.game.saveSettings(); render();
      } else if (b.dataset.a === 'persist') {
        const r = await RB.save.requestPersist();
        RB.ui.notice(r ? 'The browser agreed to keep this site\'s storage persistent.' : 'The browser declined; saves still work but may be cleared under storage pressure.', 'info');
        render();
      }
    };
    L.onchange = async (e) => {
      const t = e.target;
      const st = RB.game.settings;
      if (t.matches('input[type=radio][data-set]')) {
        let v = t.value;
        if (v === 'true') v = true; else if (v === 'false') v = false;
        if (t.dataset.obj === 'learn') RB.game.s.learn[t.dataset.set] = v; else st[t.dataset.set] = v;
        await RB.game.saveSettings();
        if (t.dataset.set === 'uiLang') { RB.ui.hud.refresh && RB.ui.hud.refresh(); }
        render();
        focusSame(t);
      } else if (t.matches('[data-sw]')) {
        const k = t.dataset.sw;
        const on = t.checked;
        if (k === 'contrast') st.contrast = on ? 'high' : 'normal';
        else st[k] = t.dataset.inv ? !on : on;
        await RB.game.saveSettings();
        if (k === 'lightbulb') RB.ui.hud.refresh();
        render();
        focusSame(t);
      } else if (t.matches('[data-voiceauto]')) {
        st.voice.auto = t.checked; await RB.game.saveSettings(); render(); focusSame(t);
      } else if (t.matches('[data-voice]')) {
        st.voice.uri = t.value; RB.game.saveSettings(); RB.voice.speak('こんにちは');
      }
    };
    L.oninput = (e) => {
      const r = e.target.closest('[data-range]');
      if (!r) return;
      const st = RB.game.settings;
      const path = r.dataset.range.split('.');
      if (path.length === 2) st[path[0]][path[1]] = +r.value; else st[path[0]] = +r.value;
      const out = r.parentNode.querySelector('output');
      if (out) out.textContent = path[1] === 'rate' ? (+r.value).toFixed(2) + '×' : Math.round(+r.value * 100) + '%';
      RB.game.applySettings();
      clearTimeout(wire._t);
      wire._t = setTimeout(() => RB.game.saveSettings(), 300);
    };
  }
  // after a re-render, keep keyboard focus on the equivalent control
  function focusSame(t) {
    const sel = t.dataset.set ? 'input[data-set="' + t.dataset.set + '"][value="' + CSS.escape(t.value) + '"]' : t.dataset.sw ? '[data-sw="' + t.dataset.sw + '"]' : t.hasAttribute('data-voiceauto') ? '[data-voiceauto]' : null;
    const n = sel && fr && fr.box.querySelector(sel);
    if (n) n.focus({ preventScroll: true });
  }

  return { open, close, isOpen: () => !!lay };
})();
