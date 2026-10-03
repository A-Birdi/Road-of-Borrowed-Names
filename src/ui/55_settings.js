/* Settings, as a folio section of named groups. Real controls: radio groups
 * for few exclusive options, switches for on/off, sliders with values,
 * a select for voices, key capture for remapping. Campaign-specific learning
 * choices are shown apart from preferences that apply to every campaign.
 * Changes apply and persist at once, as before (sliders debounce saving).
 *
 * In battle (openBattle(); the battle's Settings button or the menu key) the same
 * settings and the same controls, presentation only: options that change no rule,
 * reward or learning difficulty (IN_BATTLE); the others are listed read-only until
 * the encounter is over. The encounter is paused while the sheet is open
 * (RB.battleSeq.pause). No saving; Load and Return to title leave the encounter
 * after asking (src/ui/80_combat.js abandon()). The audit of every setting is in
 * docs/COMBAT_NOTES.md, "Settings in battle". */
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
  // in battle: presentation only (see the end of this file)
  const BATTLE_GROUPS = [
    ['motion', 'Speed & motion', '{速|はや}さと{動|うご}き', 'stride'],
    ['audio', 'Audio', '{音|おと}', 'sound'],
    ['reading', 'Reading & Language', '{読|よ}み{方|かた}と{言語|げんご}', 'words'],
    ['display', 'Display & Accessibility', '{表示|ひょうじ}', 'bulb'],
    ['battle', 'Battle display', '{戦|たたか}いの{表示|ひょうじ}', 'knot'],
    ['fixed', 'Until the encounter is over', '{戦|たたか}いの{後|あと}で', 'ward'],
  ];
  let lay = null, fr = null, group = null, mq = null, sampleCache = null;
  let battle = false, lastBattle = false; // open over a battle (presentation only)
  const groups = () => (battle ? BATTLE_GROUPS : GROUPS);
  const firstGroup = () => (battle ? 'motion' : 'reading');

  function open() {
    if (lay) return;
    // no route to the full Settings while a battle is open: it opens as the battle's sheet
    if (RB.game.inBattle && RB.game.inBattle()) { openBattle(); return; }
    show(false);
  }
  function show(inBattle) {
    battle = inBattle;
    if (battle !== lastBattle) { group = null; lastBattle = battle; }
    fr = RB.ui.folio.frame({ onClose: close, closeLabel: battle ? 'Back to the encounter' : 'Back', closeIcon: 'back', cls: 'folio-settings' + (battle ? ' folio-bset' : '') });
    fr.setTitle(RB.ui.label('{設定|せってい}', 'Settings'), battle ? 'During this encounter: how it looks, reads and sounds' : RB.game.s ? 'Some choices belong to this campaign' : 'Preferences for every campaign');
    lay = { el: fr.scrim, name: battle ? 'battle-settings' : 'settings' };
    lay.onCancel = back;
    // (in battle the menu key that opened the sheet closes it again)
    if (battle) { battleFoot(); lay.onAction = (a) => { if (a === 'menu') { close(); return true; } return false; }; }
    RB.ui.pushLayer(lay);
    if (!group && RB.ui.folio.wide()) group = firstGroup();
    render();
    if (typeof matchMedia !== 'undefined') { mq = matchMedia(RB.ui.folio.WIDE); mq.onchange = () => { if (lay) { if (!group && RB.ui.folio.wide()) group = firstGroup(); render(); } }; }
  }
  function close(o) {
    if (!lay) return;
    if (mq) mq.onchange = null;
    RB.ui.popLayer(lay);
    lay = null; fr = null;
    if (!RB.ui.folio.wide()) group = null;
    if (battle) { battle = false; if (!(o && o.leaving)) resumeBattle(); }
  }
  function back() {
    if (group && !RB.ui.folio.wide()) { group = null; render(); return; }
    close();
  }

  function render() {
    // a change can finish saving after the page was closed: then there is nothing to redraw
    if (!lay || !fr) return;
    const two = RB.ui.folio.wide();
    const leaves = fr.box.querySelectorAll('.leaf');
    const keep = leaves.length ? [leaves[0].scrollTop, leaves[1] ? leaves[1].scrollTop : 0] : [0, 0];
    fr.box.innerHTML = '<div class="spread' + (two ? ' two' : '') + '"><div class="leaf" tabindex="0" aria-label="Settings groups"></div><div class="leaf leaf-b" tabindex="0" aria-label="Settings"></div></div>';
    const [A, B] = fr.box.querySelectorAll('.leaf');
    const index = '<h3>Groups</h3><ul class="index">' + groups().map(([id, en, jp, ic]) => '<li><button data-grp="' + id + '" aria-current="' + (group === id) + '">' + I(ic) + '<span class="lbl">' + RB.ui.label(jp, en) + '</span><span class="fill"></span></button></li>').join('') + '</ul>' +
      (battle ? '<p class="muted small">Only how the encounter looks, reads and sounds can change now; it stays paused while this is open. Changes take effect straight away and are remembered in this browser.</p>'
        : '<p class="muted small">Changes take effect straight away and are remembered in this browser.</p>');
    if (two) { A.innerHTML = index; B.innerHTML = groupHtml(group || firstGroup()); }
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
    if (battle) return battleGroupHtml(g);
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
        '<h3 class="set-sub">' + I('aim') + ' Battles</h3>' +
        radios('battleAnim', 'Battle animations', [['normal', 'Normal'], ['fast', 'Fast'], ['instant', 'Instant']], null, 'How long each action takes to play. Separate from Text speed. Instant shows the results at once, with a summary of the last exchange.') +
        radios('battleControls', 'Battle controls during actions', [['adaptive', 'Adaptive'], ['keep', 'Keep visible']], null, 'Adaptive moves the menus out of the way while actions play, so the scene has room. Keep visible leaves them in place, disabled until your next choice.') +
        radios('intentDisplay', 'What creatures are about to do', [['adaptive', 'Adaptive'], ['expanded', 'Expanded']], null, 'Adaptive shows a compact badge on each creature that opens when you point at it, focus it or tap it; wording you need to read stays visible. Expanded keeps the full descriptions open while you decide.') +
        // (Harmony addendum §7.4: the portrait layer only — the technique, its stage performance and the banner stay)
        sw('harmonyFlourish', 'Harmony portrait flourish', 'A short paired portrait of you and your companion as a coordinated technique begins. Off keeps the technique, its performance on the stage and its name at the top.') +
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
      h += audioRows();
    } else if (g === 'display') {
      h += preview() + slider('textScale', 'Text size', st.textScale, 0.85, 1.5, 0.05, pct) + sw('contrast', 'High contrast', null) + sw('reducedMotion', 'Reduce motion', 'Removes sliding and bouncing; changes still show immediately.');
    } else if (g === 'storage') {
      const ss = RB.save.status();
      h += '<p class="' + (ss.mode === 'session' ? 'note-slip bad' : 'note-slip') + '">' + esc(ss.mode === 'idb' ? 'Saving to this browser (IndexedDB).' : ss.mode === 'local' ? 'Saving to this browser (localStorage fallback).' : 'Session only: nothing persists after closing.') + '</p>' +
        '<p>Saves belong to this browser profile and this page\'s address. Clearing site data, private windows, or opening the game from a different address or browser will not see them.' + (ss.persisted ? ' The browser has granted persistent storage (you can still clear it yourself).' : '') + '</p>' +
        (ss.mode !== 'session' && !ss.persisted ? '<div class="row-acts"><button class="pbtn" data-a="persist">Ask the browser to keep saves</button></div>' : '');
    }
    // rows added by later systems: EXTRA[group] = [({ radios, sw, slider, esc }) => html]
    for (const f of EXTRA[g] || []) h += f({ radios, sw, slider, esc }) || '';
    return h;
  }
  const EXTRA = {};
  function addRows(g, f) { (EXTRA[g] = EXTRA[g] || []).push(f); }
  // the volumes and the optional Japanese voice (the folio's Audio, and the battle's)
  function audioRows() {
    const st = RB.game.settings;
    const vs = RB.voice ? RB.voice.status() : { supported: false, localJaCount: 0, note: 'Speech synthesis is not available.' };
    const voices = RB.voice && RB.voice.japaneseVoices ? RB.voice.japaneseVoices() : [];
    return slider('vol.master', 'Overall volume', st.vol.master, 0, 1, 0.05, pct) + slider('vol.music', 'Music', st.vol.music, 0, 1, 0.05, pct) +
      slider('vol.sfx', 'Effects', st.vol.sfx, 0, 1, 0.05, pct) + slider('vol.voice', 'Voice', st.vol.voice, 0, 1, 0.05, pct) + sw('muted', 'Mute all sound') +
      '<h3>' + I('sound') + ' Japanese voice (optional)</h3><p class="small">' + esc(vs.note || '') + '</p>' +
      (voices.length ? '<div class="field"><label class="lab" for="vsel">Voice</label><select id="vsel" data-voice>' + voices.map((v) => '<option value="' + esc(v.voiceURI) + '"' + (st.voice.uri === v.voiceURI ? ' selected' : '') + '>' + esc(v.name) + '</option>').join('') + '</select></div>' +
        '<div class="field"><label class="switch"><input type="checkbox" role="switch" data-voiceauto' + (st.voice.auto ? ' checked' : '') + '><span>Speak dialogue automatically</span><span class="state">' + (st.voice.auto ? 'On' : 'Off') + '</span></label></div>' +
        slider('voice.rate', 'Speech rate', st.voice.rate, 0.6, 1.3, 0.05, (v) => v.toFixed(2) + '×') : '<p class="note-slip">No Japanese voice is installed on this device, so nothing will be spoken. Everything works without it.</p>') +
      '<p class="muted small">Voices are your device\'s own speech synthesis, labelled as such. They are not recorded actors and not a pronunciation authority.</p>';
  }

  // ---- behaviour (unchanged persistence: apply now, save now; sliders debounce) --------------
  function wire(L) {
    L.onclick = async (e) => {
      const gb = e.target.closest('[data-grp]');
      if (gb) { group = gb.dataset.grp || null; render(); return; }
      const b = e.target.closest('[data-bind],[data-a]');
      if (!b) return;
      if (battle) return; // (in battle: no keys, no storage requests — nothing of the kind is offered)
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
      // in battle only what changes no rule: anything else is refused, whatever sent it
      if (battle && !allowedNow(t)) { render(); return; }
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
      if (battle && !IN_BATTLE[r.dataset.range]) return;
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

  // ---- in battle: the same settings, presentation only ------------------------------------------
  // What may change while a battle is open: how it looks, reads and sounds and how fast it plays —
  // nothing that changes a rule, a reward, the learning difficulty or the campaign (the audit:
  // docs/COMBAT_NOTES.md, "Settings in battle"). Keys of RB.game.settings, and the slider paths.
  const IN_BATTLE = {
    battleAnim: 1, textSpeed: 1, reducedMotion: 1,
    'vol.master': 1, 'vol.music': 1, 'vol.sfx': 1, 'vol.voice': 1, muted: 1, petSounds: 1, 'voice.rate': 1,
    lead: 1, secondary: 1, spacing: 1, lightbulb: 1, romaji: 1,
    textScale: 1, contrast: 1,
    battleControls: 1, intentDisplay: 1, petBattle: 1,
  };
  // (the voice and its automatic speaking, and Suzu's speech, which src/ui/56_suzu_speech.js applies, are allowed too)
  function allowedNow(t) {
    if (t.matches('input[type=radio][data-set]')) return t.dataset.obj !== 'learn' && !!IN_BATTLE[t.dataset.set];
    if (t.matches('[data-sw]')) return !!IN_BATTLE[t.dataset.sw];
    if (t.matches('[data-range]')) return !!IN_BATTLE[t.dataset.range]; // (sliders apply on input, below)
    return t.matches('[data-voiceauto], [data-voice], [data-suzu-speech]');
  }
  // Fixed for the encounter, shown read-only with what they are (they change in the folio's
  // Settings once it is over): the learning and challenge choices, how answers are read, the
  // keys (so that none stops working mid-fight) and quest guidance (it belongs to the road).
  const PROFILE = { F: 'Foundations', E: 'Elementary', I: 'Intermediate', A: 'Advanced' };
  function fixedRows() {
    const st = RB.game.settings, L = (RB.game.s && RB.game.s.learn) || {};
    const v = (m, k) => m[k] || k || '—';
    const rows = [
      ['Japanese level', v(PROFILE, L.profile), 'Which version of each question you meet.'],
      ['Mistakes in battle', v({ assist: 'Assisted — no cost', normal: 'Standard — small and capped' }, L.assist), 'What a mistake costs in this encounter.'],
      ['Tactical challenge', v({ relaxed: 'Relaxed', normal: 'Standard', hard: 'Demanding' }, L.difficulty), 'How many creatures come, and how hard they press.'],
      ['Default way to answer', v({ hand: 'Handwriting', choice: 'Choices', ime: 'Keyboard / IME' }, st.input), 'Inside each question you can still switch how you answer, as always.'],
      ['Handwriting reads', v({ auto: 'By Japanese level', on: 'Kanji or kana', off: 'Kana only' }, st.padKanji || 'auto'), 'What the writing pad accepts. Read as on the pad still works inside a question.'],
      ['Stroke-order notes', st.strokePractice ? 'On' : 'Off', 'How strictly handwriting is checked.'],
      ['Keys', st.binds ? 'Your own' : 'The usual keys', 'So that no key stops working mid-fight.'],
      ['Quest guidance', v({ full: 'Markers and hints', hints: 'Hints only', off: 'Off' }, st.questGuide || 'full'), 'Markers and hints belong to the road.'],
    ];
    return '<p class="note-slip">' + I('ward') + ' These stay as they are until this encounter is over; change them in the folio’s Settings afterwards.</p>' +
      '<ul class="entries bset-fixed">' + rows.map(([l, val, why]) => '<li class="entry"><span class="mark">' + I('key') + '</span><div><div class="t">' + esc(l) + ': <b>' + esc(val) + '</b></div><div class="muted small">' + esc(why) + '</div></div></li>').join('') + '</ul>';
  }
  // Suzu's speech, the same control as in Reading & Language (src/ui/56_suzu_speech.js applies it)
  function suzuRow() {
    const v = RB.ui.suzuSpeech ? RB.ui.suzuSpeech.value() : 'standard';
    const r = (val, label) => '<label class="opt"><input type="radio" name="suzuSpeech" data-suzu-speech value="' + val + '"' + (v === val ? ' checked' : '') + '><span>' + label + '</span></label>';
    return '<fieldset class="field" data-speech-field><legend>Suzu’s speech</legend><div class="opts">' + r('standard', 'Standard') + r('kansai', 'Kansai (Kansai-ben)') + '</div>' +
      '<div class="hint">How Suzu talks, wherever she speaks. Questions always use standard Japanese.</div></fieldset>';
  }
  function battleGroupHtml(g) {
    const st = RB.game.settings;
    const title = BATTLE_GROUPS.find((x) => x[0] === g) || BATTLE_GROUPS[0];
    let h = '<h3>' + I(title[3]) + ' ' + RB.ui.label(title[2], title[1]) + '</h3>';
    if (title[0] === 'motion') {
      h += radios('battleAnim', 'Battle animations', [['normal', 'Normal'], ['fast', 'Fast'], ['instant', 'Instant']], null, 'How long each action takes to play. Instant shows the results at once, with a summary of the last exchange. An action already under way goes on at the new pace (with Instant, its results show at once).') +
        radios('textSpeed', 'Text speed', [['normal', 'Normal'], ['fast', 'Fast'], ['instant', 'Instant']], null, 'The lines spoken in this encounter. Separate from Battle animations.') +
        sw('reducedMotion', 'Reduce motion', 'Removes sliding and bouncing; changes still show immediately. An action under way settles at once.');
    } else if (title[0] === 'audio') {
      h += audioRows() + sw('petSounds', 'Quiet pet sounds', 'An occasional soft sound from your pet (never needed: everything it does is also seen).');
    } else if (title[0] === 'reading') {
      h += preview() +
        radios('lead', 'Dialogue leads with', [['en', 'English'], ['ja', 'Japanese']]) +
        radios('secondary', 'The second language', [['always', 'Always shown'], ['tap', 'Shown when tapped'], ['off', 'Hidden']]) +
        sw('spacing', 'Spaces between Japanese words', 'Beginner-friendly. Standard Japanese is written without spaces.') +
        sw('lightbulb', 'Word help (lightbulb)', 'Hover, focus or tap Japanese text for reading, meaning and notes. Inside a question it counts as assisted, as always.') +
        sw('romaji', 'Romaji in word help') + suzuRow() +
        '<p class="muted small">Furigana (readings over kanji) is always shown. It is an accessibility feature, not a difficulty setting.</p>';
    } else if (title[0] === 'display') {
      h += slider('textScale', 'Text size', st.textScale, 0.85, 1.5, 0.05, pct) + sw('contrast', 'High contrast', null) +
        '<p class="muted small">While an action plays, the scene keeps its place and size; the menus take a new text size at once.</p>';
    } else if (title[0] === 'battle') {
      h += radios('battleControls', 'Battle controls during actions', [['adaptive', 'Adaptive'], ['keep', 'Keep visible']], null, 'Adaptive moves the menus out of the way while actions play, so the scene has room. Keep visible leaves them in place, disabled until your next choice. From the next exchange.') +
        radios('intentDisplay', 'What creatures are about to do', [['adaptive', 'Adaptive'], ['expanded', 'Expanded']], null, 'Adaptive shows a compact badge on each creature that opens when you point at it, focus it or tap it; wording you need to read stays visible. Expanded keeps the full descriptions open while you decide.') +
        sw('petBattle', 'Show pet in battle', 'It sits beside the two of you and watches. It never acts, and hiding it changes nothing.');
    } else {
      h += fixedRows();
    }
    return h;
  }
  // the foot: no saving here; leaving the encounter (Load, Return to title) asks first
  function battleFoot() {
    fr.foot.innerHTML = '<p class="bset-save">' + I('save') + '<span>Saving is available after the encounter.</span></p>' +
      '<button type="button" class="cbtn" data-leave="load">' + I('load') + '<span>Load a journey…</span></button>' +
      '<button type="button" class="cbtn" data-leave="title">' + I('title') + '<span>Return to title…</span></button>';
    fr.foot.onclick = (e) => {
      const b = e.target.closest('[data-leave]');
      // (the second click of a double click opens nothing more)
      if (!b || e.detail > 1) return;
      leave(b.dataset.leave);
    };
  }
  let leaving = false;
  async function leave(kind) {
    if (leaving || !lay || !battle) return;
    leaving = true;
    try {
      const r = await RB.ui.confirm(kind === 'load'
        ? 'Leave this encounter and load another journey? This battle won’t count — the creature will still be there.'
        : 'Leave this encounter and return to the title? This battle won’t count — the creature will still be there. Anything since your last save or autosave will be lost.',
      [kind === 'load' ? 'Choose a journey…' : 'Return to title', 'Stay in the encounter']);
      if (r !== 0 || !lay || !battle || !RB.combat.state()) return;
      // the campaign change takes the encounter down whole (src/ui/80_combat.js abandon()) and closes this sheet
      if (kind === 'load') RB.ui.title.slots('load', true);
      else RB.game.toTitle();
    } finally { leaving = false; }
  }
  // When the battle's sheet may open: a battle on screen waiting for a choice (yours or your
  // companion's) or playing an exchange — never over the language task, a question, a teaching
  // card, a line being spoken, or the opening or the end of the encounter.
  const OPEN_PHASES = { choose: 1, companion: 1, player: 1, 'companion-act': 1, enemy: 1, revive: 1, finish: 1 };
  const BATTLE_LAYERS = { cards: 1, companion: 1, 'battle-sequence': 1 };
  function battleReady() {
    if (!(RB.game.inBattle && RB.game.inBattle()) || !RB.combat || !RB.combat.state() || !OPEN_PHASES[RB.combat.phase()]) return false;
    if ((RB.challenge && RB.challenge.active && RB.challenge.active()) || (RB.ui.dialogue && RB.ui.dialogue.isOpen())) return false;
    const top = RB.ui.topLayer();
    return !top || !!BATTLE_LAYERS[top.name];
  }
  let was = null;
  function openBattle() {
    if (lay || !battleReady()) return false;
    // the encounter waits: the playing action (if any) is paused where it stands; open notes close
    RB.battleSeq.pause(true);
    if (RB.combatHelp) RB.combatHelp.hide();
    if (RB.battleIntents) RB.battleIntents.close(false);
    const st = RB.game.settings;
    was = { anim: st.battleAnim, reduce: !!st.reducedMotion };
    if (RB.audio) RB.audio.sfx('menu_open');
    show(true);
    sync();
    return true;
  }
  function resumeBattle() {
    // the click that closed the sheet (or the second of a double click) lands on this, not on the battle
    shield();
    const st = RB.game.settings;
    // Instant chosen, or Reduce motion turned on, while an action stood paused: the rest of it shows at once
    if (was && RB.battleSeq.busy() && ((st.battleAnim === 'instant' && was.anim !== 'instant') || (st.reducedMotion && !was.reduce))) RB.battleSeq.settle('settings');
    was = null;
    RB.battleSeq.pause(false);
    if (RB.combat.state()) RB.combat.refresh();
    sync();
  }
  function shield() {
    if (typeof document === 'undefined') return;
    const sh = document.createElement('div');
    sh.className = 'bset-shield';
    sh.setAttribute('aria-hidden', 'true');
    document.body.appendChild(sh);
    // (and a click the closing key's release would send to the battle: some browsers activate the
    // newly focused button when Space comes up)
    const block = (e) => { if (e.target && e.target.closest && e.target.closest('.combat-ui')) { e.stopPropagation(); e.preventDefault(); } };
    document.addEventListener('click', block, true);
    setTimeout(() => { sh.remove(); document.removeEventListener('click', block, true); }, 400);
  }
  // the battle's Settings button: in the scene's lower right corner while the sheet may open
  let btn = null, poll = null;
  function sync() {
    if (btn && !btn.isConnected) unmount();
    if (btn) btn.hidden = !(battleReady() || (lay && battle));
  }
  function mount() {
    const root = typeof document !== 'undefined' && document.querySelector('.combat-ui');
    if (!root) return;
    unmount();
    btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cbtn cb-set';
    btn.title = 'Settings for this encounter (C)';
    btn.innerHTML = I('settings') + '<span>Settings</span>';
    btn.hidden = true;
    btn.addEventListener('click', (e) => { e.stopPropagation(); openBattle(); });
    root.appendChild(btn);
    poll = setInterval(sync, 150);
    sync();
  }
  function unmount() {
    if (poll) clearInterval(poll);
    poll = null;
    if (btn) btn.remove();
    btn = null;
  }
  if (RB.bus) {
    RB.bus.on('present:scene', (e) => {
      if (!e || e.scope !== 'battle') return;
      if (e.phase === 'enter') mount();
      else if (e.phase === 'exit') { if (lay && battle) close({ leaving: true }); unmount(); }
    });
    // a campaign change closes the sheet without resuming anything: the battle is being left
    RB.bus.on('campaign:changing', () => { if (lay && battle) close({ leaving: true }); unmount(); });
  }

  return { open, close, addRows, isOpen: () => !!lay, openBattle, battleReady, inBattle: () => !!(lay && battle) };
})();
