/* How Suzu speaks: standard Japanese or Kansai-ben (docs/dialect/suzu_kansai.md).
 * One setting, settings.suzuSpeech ('standard' | 'kansai'; an older settings
 * record has none = standard), shown and changed in three places:
 *   - once when she joins you (the Lantern Hall: rw.suzu_speech, `!hook suzu_speech`),
 *     or, in a saved campaign where she already travels with you (loaded from its
 *     slot), once after the next scene in which she speaks (never in the middle of
 *     a scene);
 *   - Settings › Reading & Language: "Suzu's speech";
 *   - Company › Suzu, in "Talk with Suzu": the same choice, plus an in-world way
 *     to ask her (co.suzu_speech_kansai / co.suzu_speech_standard).
 * Changing it applies at once (the line on screen, the history, the Company
 * pages) and touches nothing in the campaign save. */
var RB = (globalThis.RB = globalThis.RB || {});
RB.hooks = RB.hooks || {};

RB.ui.suzuSpeech = (function () {
  'use strict';
  const esc = RB.util.esc;
  const I = (n) => (RB.ui.folio ? RB.ui.folio.icon(n) : '');
  const value = () => (RB.dialect ? RB.dialect.choice() : 'standard');
  // escaped text whose {漢字|かな} pieces show as ruby (every kanji with its reading)
  const ruby = (t) => esc(t).replace(/\{([^|}]+)\|([^}]+)\}/g, '<ruby lang="ja">$1<rt>$2</rt></ruby>');
  const decided = () => !!(RB.game.settings && RB.game.settings.suzuSpeech);
  // one sentence on what it is; the small print says what stays the same and how to switch back
  const EXPLAIN = 'Kansai-ben ({関西弁|かんさいべん}) is the regional dialect of Osaka and Kyoto: the same Japanese with its own endings and words (や for だ, 〜へん for 〜ない, ほんま for "really"), each one explained in word help.';
  const BACK = 'Your exercises and answers always stay in standard Japanese, and you can switch back any time if it is hard to follow: Settings › Reading & Language, or Company › Suzu.';
  // one of her lines, both ways (the sample in the choice)
  const SAMPLE = { jp: '{開幕|かいまく} ！ …… ふふ 、 {一度|いちど} {言|い}って みたかった の 。', en: 'Curtain up! …Heh. I always wanted to say that.' };
  function sample(v) {
    if (v !== 'kansai' || !RB.dialect) return SAMPLE;
    const f = RB.dialect.find(SAMPLE.jp, SAMPLE.en);
    return f && !f.same ? { jp: f.jp, en: f.en } : SAMPLE;
  }

  async function set(v) {
    const st = RB.game.settings;
    if (!st) return;
    st.suzuSpeech = v === 'kansai' ? 'kansai' : 'standard';
    await RB.game.saveSettings();
    if (RB.ui.dialogue && RB.ui.dialogue.refresh) RB.ui.dialogue.refresh();
    RB.bus.emit('dialect:changed', { suzuSpeech: st.suzuSpeech });
  }

  // ---- the choice, as a folio sheet: resolves 'standard' | 'kansai' -------------------------------------
  function ask(o) {
    o = o || {};
    return new Promise((res) => {
      const cur = value();
      const scrim = RB.ui.el('div', 'scrim confirm-scrim');
      const panel = RB.ui.el('div', 'csheet speech-sheet');
      panel.setAttribute('role', 'dialog');
      panel.setAttribute('aria-modal', 'true');
      panel.setAttribute('aria-labelledby', 'sp-q');
      const opt = (v, title, sub) => {
        const smp = sample(v);
        return '<button type="button" class="speech-opt" data-sp="' + v + '" aria-pressed="' + (cur === v) + '"><span class="t">' + title + '</span><span class="muted small">' + sub + '</span>' +
          '<span class="smp">' + RB.ui.jhtml(smp.jp) + '<span class="en">' + esc(smp.en) + '</span></span></button>';
      };
      panel.innerHTML = '<h3 id="sp-q">' + I('words') + ' How should Suzu speak?</h3>' +
        (o.reason === 'existing' ? '<p>New: Suzu can now speak Kansai-ben. Nothing else in your journey changes.</p>' : '') +
        '<p class="small">' + ruby(EXPLAIN) + '</p>' +
        '<div class="speech-opts" role="group" aria-label="How Suzu speaks">' +
        opt('standard', 'Standard Japanese', 'As she speaks across the game') +
        opt('kansai', 'Kansai-ben', 'Osaka-style regional dialect') + '</div>' +
        '<p class="muted small">' + esc(BACK) + '</p>';
      const layer = { el: scrim, name: 'speech' };
      // a mode of its own while it is open: the world stands still and Escape reaches the sheet
      RB.game.pushMode('speech');
      const done = (v) => { RB.ui.popLayer(layer); RB.game.popMode('speech'); res(v); };
      panel.addEventListener('click', (e) => {
        const b = e.target.closest('[data-sp]');
        if (b) done(b.dataset.sp);
      });
      layer.onCancel = () => done(cur);
      scrim.appendChild(panel);
      RB.ui.pushLayer(layer);
      const first = panel.querySelector('[data-sp="' + cur + '"]');
      if (first) setTimeout(() => first.focus({ preventScroll: true }), 30);
    });
  }
  let asking = false;
  async function choose(reason) {
    if (asking) return null;
    asking = true;
    try {
      const v = await ask({ reason });
      await set(v);
      return v;
    } finally { asking = false; }
  }
  // !hook suzu_speech: asked once in a campaign, when she agrees to come (rw.suzu_speech)
  RB.hooks.suzu_speech = async () => {
    if (RB.test && RB.test.auto) return; // automated runs keep the setting as it is
    if (RB.ui.dialogue) RB.ui.dialogue.hide();
    await choose('join');
  };

  // ---- a saved campaign where she already travels with you: once, after a scene in which she spoke -----
  // (only a campaign loaded from a save: a new one asks when she joins)
  let askedNow = false, fromSave = false;
  if (RB.bus) RB.bus.on('campaign:changing', (e) => { fromSave = !!e && e.to === 'load'; });
  function maybeAskExisting() {
    const g = RB.game, s = g && g.s;
    if (askedNow || !fromSave || decided() || !s || s.comp !== 'suzu' || (RB.test && RB.test.auto)) return;
    const heard = (s.backlog || []).slice(-12).some((l) => l && l.who === 'suzu');
    if (!heard) return;
    setTimeout(async () => {
      if (askedNow || decided() || g.mode() !== 'world' || RB.script.isRunning() || (RB.ui.topLayer && RB.ui.topLayer())) return;
      askedNow = true;
      await choose('existing');
    }, 450);
  }
  if (RB.bus) RB.bus.on('story:settled', maybeAskExisting);

  // ---- Settings › Reading & Language ---------------------------------------------------------------------
  if (RB.ui.settings && RB.ui.settings.addRows) {
    RB.ui.settings.addRows('reading', () => {
      const v = value();
      const r = (val, label) => '<label class="opt"><input type="radio" name="suzuSpeech" data-suzu-speech value="' + val + '"' + (v === val ? ' checked' : '') + '><span>' + label + '</span></label>';
      return '<fieldset class="field" data-speech-field><legend>Suzu\'s speech</legend><div class="opts">' + r('standard', 'Standard') + r('kansai', 'Kansai (Kansai-ben)') + '</div>' +
        '<div class="hint">How Suzu talks, wherever she speaks. Kansai-ben is the regional dialect of Osaka and Kyoto; word help explains its forms, and exercises always use standard Japanese.</div></fieldset>';
    });
  }
  if (typeof document !== 'undefined') {
    document.addEventListener('change', (e) => {
      const t = e.target;
      if (t && t.matches && t.matches('input[data-suzu-speech]') && t.checked) set(t.value);
    });
  }

  // ---- Company › Suzu: in "Talk with Suzu" -----------------------------------------------------------------
  function companyHtml() {
    const v = value();
    const b = (val, label, jp) => '<button type="button" class="pbtn speech-btn" role="radio" aria-checked="' + (v === val) + '" data-suzu-speech-set="' + val + '">' + (v === val ? I('done') : '') + '<span>' + label + '</span> <span class="jp" lang="ja">' + ruby(jp) + '</span></button>';
    return '<section class="co-speech" aria-labelledby="co-speech-h"><h5 id="co-speech-h">How Suzu speaks</h5>' +
      '<div class="row-acts" role="radiogroup" aria-labelledby="co-speech-h">' + b('standard', 'Standard Japanese', '{標準語|ひょうじゅんご}') + b('kansai', 'Kansai-ben', '{関西弁|かんさいべん}') + '</div>' +
      '<p class="muted small">Kansai-ben is a regional dialect (Osaka, Kyoto). Word help explains it; if it is hard to follow, switch back any time.</p></section>';
  }
  // the in-world way: ask her (a row in the Talk list)
  function talkLabel() {
    return value() === 'kansai'
      ? { en: 'Ask her to use her stage Japanese (standard)', jp: '{舞台|ぶたい} の {言葉|ことば} で {話|はな}して' }
      : { en: 'Ask her to talk as she does backstage (Kansai-ben)', jp: '{楽屋|がくや} の {言葉|ことば} で {話|はな}して' };
  }
  async function talk() {
    const to = value() === 'kansai' ? 'standard' : 'kansai';
    await set(to);
    await RB.script.run(to === 'kansai' ? 'co.suzu_speech_kansai' : 'co.suzu_speech_standard');
  }

  return { value, decided, set, ask, choose, companyHtml, talkLabel, talk, EXPLAIN, sample };
})();
