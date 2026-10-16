/* Settings, as a book of the Ledger's family (ST-1, Robin 2026-10-15: "tabs at the top instead of Groups on the left
 * page's pane; more room for readability and context sentences"). Paper tabs across the top, as in the Ledger; each
 * tab's settings are laid out across both pages of the spread (one page on a phone). Every setting reads as a
 * heading with a sentence about what it does, and its controls are marks on the page: a choice is circled in ink,
 * as on a Japanese form (該当するものを○で囲む), an on/off setting is a tick box, a level is a ruled line with a
 * seal. They are the same real controls as before (radio groups, role="switch" checkboxes, range inputs, a select),
 * with the same keys, the same values and the same saving: changes apply and persist at once (sliders debounce).
 * Campaign-specific learning choices stay apart from preferences that apply to every campaign.
 *
 * review(s): when a new journey is created (src/ui/40_create.js, src/ui/66d_ngplus.js) the book opens on "Before you
 * set out", the settings that shape ordinary play on one spread (this journey's level, mistakes and challenge; quest
 * markers; reading; sound and voices; Suzu's speech; how stories and battles are told), with every other tab still
 * there, and resolves when the player sets out.
 *
 * In battle (openBattle(); the battle's Settings button or the menu key) the same settings and the same controls,
 * presentation only: options that change no rule, reward or learning difficulty (IN_BATTLE); the others are listed
 * read-only until the encounter is over. The encounter is paused while the sheet is open (RB.battleSeq.pause). No
 * saving; Load and Return to title leave the encounter after asking (src/ui/80_combat.js abandon()). The audit of
 * every setting is in docs/COMBAT_NOTES.md, "Settings in battle". */
var RB = (globalThis.RB = globalThis.RB || {});

RB.ui.settings = (function () {
  'use strict';
  const esc = RB.util.esc;
  const I = (n) => RB.ui.folio.icon(n);
  // furigana without word help (labels on a control: a word there is chosen, not studied)
  const ruby = (t) => esc(t).replace(/\{([^|}]+)\|([^}]+)\}/g, '<ruby lang="ja">$1<rt>$2</rt></ruby>');
  // tabs: en is the tab's word, title the page's running head
  const TABS = [
    { id: 'reading', en: 'Reading', title: 'Reading & language', jp: '{読|よ}み{方|かた}', icon: 'words' },
    { id: 'learning', en: 'Learning', title: 'Learning & challenge', jp: '{学|まな}び', icon: 'practice' },
    { id: 'play', en: 'Play', title: 'Guidance, stories and battles', jp: '{遊|あそ}び{方|かた}', icon: 'road' },
    { id: 'audio', en: 'Sound', title: 'Sound and voices', jp: '{音|おと}', icon: 'sound' },
    { id: 'display', en: 'Display', title: 'Display & accessibility', jp: '{表示|ひょうじ}', icon: 'eye' },
    { id: 'controls', en: 'Controls', title: 'Controls and saves', jp: '{操作|そうさ}', icon: 'keys' },
  ];
  // in battle: presentation only (see the end of this file)
  const BATTLE_TABS = [
    { id: 'motion', en: 'Speed', title: 'Speed & motion', jp: '{速|はや}さ', icon: 'stride' },
    { id: 'audio', en: 'Sound', title: 'Sound and voices', jp: '{音|おと}', icon: 'sound' },
    { id: 'reading', en: 'Reading', title: 'Reading & language', jp: '{読|よ}み{方|かた}', icon: 'words' },
    { id: 'display', en: 'Display', title: 'Display & accessibility', jp: '{表示|ひょうじ}', icon: 'eye' },
    { id: 'battle', en: 'Battle', title: 'Battle display', jp: '{戦|たたか}い', icon: 'knot' },
    { id: 'fixed', en: 'Fixed', title: 'Until the encounter is over', jp: '{戦|たたか}いの{後|あと}で', icon: 'ward' },
  ];
  const START_TAB = { id: 'start', en: 'Start', title: 'Before you set out', jp: '{出発|しゅっぱつ}の{前|まえ}に', icon: 'journey' };
  // older names for the tabs (what callers and tests may still ask for)
  const ALIAS = { storage: 'controls', sound: 'audio', battles: 'play', gameplay: 'play' };

  let lay = null, fr = null, tabsApi = null, group = null, mq = null, sampleCache = null;
  let mode = 'normal', lastMode = 'normal'; // 'normal' | 'battle' (presentation only) | 'review' (a new journey)
  let reviewS = null, reviewDone = null;
  const scroll = {};
  const battle = () => mode === 'battle';
  const tabsFor = () => (mode === 'battle' ? BATTLE_TABS : mode === 'review' ? [START_TAB].concat(TABS) : TABS);
  // the journey these settings belong to: the one being created (review), or the one being played
  const cs = () => reviewS || RB.game.s || null;
  const learnObj = () => (cs() ? cs().learn : {});

  function open(tab) {
    if (lay) return;
    // no route to the full Settings while a battle is open: it opens as the battle's sheet
    if (RB.game.inBattle && RB.game.inBattle()) { openBattle(); return; }
    show('normal', tab);
  }
  function show(m, want) {
    mode = m;
    if (mode !== lastMode) { group = null; lastMode = mode; }
    if (want) group = ALIAS[want] || want;
    if (!tabsFor().some((t) => t.id === group)) group = tabsFor()[0].id;
    if (RB.bookType) RB.bookType.install(); // the book's type, if the idle start hasn't made it yet
    const style = RB.game.settings && RB.game.settings.ledgerStyle === 'flat' ? 'flat' : 'book';
    const review = mode === 'review';
    fr = RB.ui.folio.frame({
      onClose: review ? finishReview : close,
      closeLabel: battle() ? 'Back to the encounter' : review ? 'Set out' : 'Back', closeIcon: review ? 'next' : 'back',
      cls: 'folio-settings' + (battle() ? ' folio-bset' : '') + (review ? ' folio-review' : ''), book: style,
    });
    fr.setTitle(RB.ui.label('{設定|せってい}', 'Settings'), battle() ? 'During this encounter: how it looks, reads and sounds' : review ? 'Before you set out' : cs() ? 'Some choices belong to this campaign' : 'Preferences for every campaign');
    lay = { el: fr.scrim, name: battle() ? 'battle-settings' : review ? 'settings-review' : 'settings' };
    lay.onCancel = review ? finishReview : close;
    if (battle()) { battleFoot(); lay.onAction = (a) => { if (a === 'menu') { close(); return true; } return false; }; }
    else if (review) reviewFoot();
    else fr.foot.innerHTML = '<p class="sx-foot">' + I('save') + '<span>Changes take effect straight away and are remembered in this browser.</span></p>';
    RB.ui.pushLayer(lay);
    tabsApi = RB.ui.folio.tabs(fr.tabslot, tabsFor(), group, (id) => { remember(); group = id; render(true); }, { label: 'Settings', panelId: 'settings-page' });
    // (each tab also answers to the group name it had when Settings was a list of groups)
    tabsApi.el.querySelectorAll('.ptab').forEach((b) => { b.dataset.grp = b.dataset.id; });
    render();
    if (typeof matchMedia !== 'undefined') { mq = matchMedia(RB.ui.folio.WIDE); mq.onchange = () => { if (lay) { remember(); render(); } }; }
  }
  function close(o) {
    if (!lay) return;
    if (mq) mq.onchange = null;
    if (tabsApi) tabsApi.destroy();
    RB.ui.popLayer(lay);
    lay = null; fr = null; tabsApi = null;
    const was = mode;
    mode = 'normal';
    if (was === 'battle' && !(o && o.leaving)) resumeBattle();
  }
  // a tab asked for by name (the Ledger, a test, a link from another page)
  function show_(id) {
    id = ALIAS[id] || id;
    if (!lay || !tabsFor().some((t) => t.id === id)) return false;
    remember(); group = id; tabsApi.select(id); render(true);
    return true;
  }
  function remember() {
    if (!fr) return;
    const leaves = fr.box.querySelectorAll('.leaf');
    if (leaves[0]) scroll[mode + ':' + group] = [leaves[0].scrollTop, leaves[1] ? leaves[1].scrollTop : 0];
  }

  // ---- the spread --------------------------------------------------------------------------
  function render(turn) {
    // a change can finish saving after the page was closed: then there is nothing to redraw
    if (!lay || !fr) return;
    const two = RB.ui.folio.wide();
    const tab = tabsFor().find((t) => t.id === group) || tabsFor()[0];
    const leaves = fr.box.querySelectorAll('.leaf');
    const keep = turn ? scroll[mode + ':' + group] || [0, 0] : leaves.length ? [leaves[0].scrollTop, leaves[1] ? leaves[1].scrollTop : 0] : [0, 0];
    let sp = fr.box.querySelector(':scope > .spread');
    if (!sp) { fr.box.innerHTML = '<div class="spread" id="settings-page" role="tabpanel"></div>'; sp = fr.box.firstChild; }
    const tb = turn && sp.classList.contains('turn') && !sp.classList.contains('tb');
    sp.className = 'spread sx-spread' + (two ? ' two' : '') + (turn ? ' turn' + (tb ? ' tb' : '') : '');
    sp.setAttribute('aria-labelledby', 'tab-' + tab.id);
    sp.innerHTML = '<div class="leaf" tabindex="0" aria-label="' + esc(tab.title) + '"></div><div class="leaf leaf-b" tabindex="0" aria-label="' + esc(tab.title) + ', facing page"></div>';
    const [A, B] = sp.querySelectorAll(':scope > .leaf');
    const [a, b] = pages(tab.id);
    if (two) { A.innerHTML = runHead(tab, true) + a; B.innerHTML = runHeadR() + b; }
    else A.innerHTML = runHead(tab, false) + a + b;
    A.scrollTop = keep[0]; B.scrollTop = keep[1];
    wire(sp);
  }
  // the book's running heads (as in the Ledger): the tab's name at the top of the first page, whose settings these
  // are at the top of the second. The dialog keeps its own accessible name, so these are hidden from assistive
  // technology.
  function meta() {
    if (battle()) return 'During this encounter';
    const s = cs();
    if (mode === 'review') return s && s.player ? esc(s.player.name) + '’s new journey' : 'A new journey';
    return s && s.player ? esc(s.player.name) + '’s journey' : 'For every journey';
  }
  function runHead(tab, two) {
    const jp = ruby(tab.jp).replace(/<ruby lang="ja">/g, '<ruby>');
    return '<header class="bk-runhead" aria-hidden="true"><span class="bk-sec" lang="ja">' + jp + '</span><span class="bk-sec-en">' + esc(tab.title) + '</span>' + (two ? '' : '<span class="bk-meta">' + meta() + '</span>') + '</header>';
  }
  const runHeadR = () => '<header class="bk-runhead r" aria-hidden="true"><span class="bk-meta">' + meta() + '</span></header>';

  // ---- marks on the page ---------------------------------------------------------------------
  // A chosen option is circled in ink; the circle is one hand-drawn loop that overshoots where it closes.
  const RING = '<svg class="sx-ring" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M22 5C40 2 70 2 86 6c10 3 13 9 11 16-3 9-22 15-47 15C24 37 4 32 3 21 2 12 14 6 32 3.5"/></svg>';
  // an on/off setting: a pencilled box and an ink tick
  const TICK = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path class="bx" d="M4.4 5.1c4.9-.6 10-.5 15-.2.4 4.7.5 9.5.2 14.4-5 .5-10 .4-14.9.1-.5-4.8-.6-9.5-.3-14.3z"/><path class="tk" d="M7 12.6c1.5 1.2 2.7 2.6 3.7 4.3 2-4 4.6-7.7 8.2-10.8"/></svg>';

  // Option icons, drawn here (no emoji, no image files): a few inks of the book (vermilion, river blue, pine green,
  // the ribbon's amber) on a 32-unit square. Decorative: the option's words say the same thing.
  const OI = {
    // Music performance: one voice / an ensemble (Robin's reference: a red note, a blue pair, a green note)
    original: '<path class="st" d="M3 10.5h26M3 15.5h26M3 20.5h26"/><ellipse class="c-r" cx="13" cy="23.3" rx="4.7" ry="3.5" transform="rotate(-22 13 23.3)"/><path class="c-r" d="M16.4 22.6V5.5h2.3v17.1z"/><path class="c-r" d="M18.7 5.5c.4 3.6 6.4 4.6 6 10.2-1.1-2.8-3.6-3.9-6-4.1z"/><ellipse class="gl" cx="11.5" cy="22.2" rx="1.7" ry=".9" transform="rotate(-22 11.5 22.2)"/>',
    ensemble: '<ellipse class="c-r" cx="5.6" cy="22.6" rx="3.4" ry="2.6" transform="rotate(-22 5.6 22.6)"/><path class="c-r" d="M8 22V10h1.7v12z"/><path class="c-r" d="M9.7 10c.3 2.4 4.1 3 3.8 6.6-.8-1.7-2.2-2.4-3.8-2.6z"/>' +
      '<ellipse class="c-b" cx="13.4" cy="25.3" rx="3.6" ry="2.7" transform="rotate(-22 13.4 25.3)"/><ellipse class="c-b" cx="22.2" cy="23.3" rx="3.6" ry="2.7" transform="rotate(-22 22.2 23.3)"/><path class="c-b" d="M15.9 24.7V8.6l9-2.2v16.2h-1.8V9.7l-5.4 1.3v13.7z"/><path class="c-b" d="M15.9 8.6l9-2.2v3.1l-9 2.2z"/>' +
      '<ellipse class="c-g" cx="27.4" cy="13.9" rx="2.9" ry="2.2" transform="rotate(-22 27.4 13.9)"/><path class="c-g" d="M29.4 13.4V3.6h1.4v9.8z"/>' +
      '<ellipse class="gl" cx="12.4" cy="24.4" rx="1.3" ry=".7"/><ellipse class="gl" cx="21.2" cy="22.4" rx="1.3" ry=".7"/>',
    // which language leads: a letter and a kana on paper tiles
    en: '<rect class="tile" x="4" y="4" width="24" height="24" rx="3"/><text class="tx" x="16" y="23.2" text-anchor="middle">A</text>',
    ja: '<rect class="tile" x="4" y="4" width="24" height="24" rx="3"/><text class="tx jp" x="16" y="22.8" text-anchor="middle">あ</text>',
    // the second language: in view, under a tap, out of view
    shown: '<path class="ln" d="M3.5 16c3.4-5.6 7.5-8.5 12.5-8.5s9.1 2.9 12.5 8.5c-3.4 5.6-7.5 8.5-12.5 8.5S6.9 21.6 3.5 16z"/><circle class="c-b" cx="16" cy="16" r="4.2"/>',
    tap: '<path class="ln" d="M13 27v-9.5a2 2 0 0 1 4 0V22l5.2.9a2.8 2.8 0 0 1 2.3 3.1L24 29"/><path class="ln" d="M15 13.6v-5.6a2 2 0 0 1 4 0v8"/><circle class="c-a" cx="17" cy="6.5" r="1.4"/><path class="ln" d="M10 9.5a7 7 0 0 1 14 0" stroke-dasharray="1.6 2.4"/>',
    hidden: '<path class="ln" d="M3.5 16c3.4-5.6 7.5-8.5 12.5-8.5s9.1 2.9 12.5 8.5c-3.4 5.6-7.5 8.5-12.5 8.5S6.9 21.6 3.5 16z"/><path class="ln-r" d="M6 26L26 6"/>',
    // speeds: a brush stroke and its trail
    s1: '<path class="ln" d="M5 16h14"/><path class="c-a" d="M19 11.5l8 4.5-8 4.5z"/>',
    s2: '<path class="ln" d="M3 12.5h8M3 19.5h8"/><path class="ln" d="M12 16h7"/><path class="c-a" d="M19 11.5l8 4.5-8 4.5z"/>',
    s3: '<path class="c-a" d="M18.5 3L7 18h7.5L12 29l13-16.5h-8z"/>',
    // the Japanese level: a sprout that grows
    lvF: '<path class="soil" d="M5 26.5h22"/><path class="ln-g" d="M16 26.5v-6"/><path class="c-g" d="M16 21c-4.6.2-6.6-2-6.8-5.2 3.8-.2 6.5 1.3 6.8 5.2z"/>',
    lvE: '<path class="soil" d="M5 26.5h22"/><path class="ln-g" d="M16 26.5v-9"/><path class="c-g" d="M16 18c-4.6.2-6.6-2-6.8-5.2 3.8-.2 6.5 1.3 6.8 5.2zM16 20.5c4.6.2 6.6-2 6.8-5.2-3.8-.2-6.5 1.3-6.8 5.2z"/>',
    lvI: '<path class="soil" d="M5 27h22"/><path class="ln-g" d="M16 27V9"/><path class="c-g" d="M16 12.5c-4-.1-5.7-2-5.8-4.7 3.3-.1 5.6 1.2 5.8 4.7zM16 17.5c4.6.2 6.6-2 6.8-5.2-3.8-.2-6.5 1.3-6.8 5.2zM16 22.5c-4.6.2-6.6-2-6.8-5.2 3.8-.2 6.5 1.3 6.8 5.2z"/>',
    lvA: '<path class="soil" d="M4 28h24"/><path class="trunk" d="M14.6 28l.6-9h1.6l.6 9z"/><circle class="c-g" cx="16" cy="12" r="7.4"/><circle class="c-g2" cx="10.8" cy="15.8" r="4.4"/><circle class="c-g2" cx="21.4" cy="15.4" r="4.6"/>',
    // the tactical challenge: one, two or three flames
    f1: '<path class="c-a" d="M16 5c3 4.4 6.3 7.6 6.3 13.2a6.3 6.3 0 0 1-12.6 0c0-3.3 1.8-5 3.2-7 .3 2.1 1.1 3.2 2.3 3.6C14.5 11.6 15 8.6 16 5z"/>',
    f2: '<path class="c-a" d="M10.5 9c2.3 3.4 4.8 5.8 4.8 10.1a4.8 4.8 0 0 1-9.6 0c0-2.5 1.4-3.8 2.4-5.3.2 1.6.8 2.4 1.8 2.8-.6-2.7-.2-5 .6-7.6z"/><path class="c-r" d="M21.5 6c2.6 3.9 5.4 6.6 5.4 11.4a5.4 5.4 0 0 1-10.8 0c0-2.8 1.6-4.3 2.7-6 .2 1.8.9 2.7 2 3.1-.7-3-.2-5.6.7-8.5z"/>',
    f3: '<path class="c-a" d="M7.5 12c1.8 2.7 3.8 4.6 3.8 8a3.8 3.8 0 0 1-7.6 0c0-2 1.1-3 1.9-4.2.2 1.3.7 1.9 1.4 2.2-.4-2.1-.1-4 .5-6z"/><path class="c-r" d="M16 5c2.6 3.9 5.4 6.6 5.4 11.4a5.4 5.4 0 0 1-10.8 0c0-2.8 1.6-4.3 2.7-6 .2 1.8.9 2.7 2 3.1-.7-3-.2-5.6.7-8.5z"/><path class="c-a" d="M24.5 12c1.8 2.7 3.8 4.6 3.8 8a3.8 3.8 0 0 1-7.6 0c0-2 1.1-3 1.9-4.2.2 1.3.7 1.9 1.4 2.2-.4-2.1-.1-4 .5-6z"/>',
    // mistakes in battle: a ward / a small, capped cost
    assist: '<path class="c-g" d="M16 3.5l10 4v7.2c0 6.4-4.2 11-10 13.8-5.8-2.8-10-7.4-10-13.8V7.5z"/><path class="tk-w" d="M11 16l3.6 3.6L21.5 12"/>',
    capped: '<circle class="c-a" cx="16" cy="17" r="10"/><circle class="ring-in" cx="16" cy="17" r="7"/><path class="tk-w" d="M11.5 17h9"/>',
    // ways to answer: the brush, the choices, the keyboard
    hand: '<path class="c-ink" d="M23.5 3.5l5 5-11.8 11.8-5-5z"/><path class="c-r" d="M11.7 15.3l5 5c-1.4 4.2-5.4 7.4-12.2 7.2 2.5-2.1 2.4-5.6 3.3-8.5.8-2.3 2-3.5 3.9-3.7z"/>',
    choice: '<rect class="tile" x="4" y="5" width="24" height="22" rx="2.5"/><path class="ln" d="M13 11.5h10M13 16.5h10M13 21.5h10"/><circle class="ln" cx="9" cy="11.5" r="1.6"/><circle class="c-b" cx="9" cy="16.5" r="2"/><circle class="ln" cx="9" cy="21.5" r="1.6"/>',
    ime: '<rect class="tile" x="3" y="8" width="26" height="16" rx="2.5"/><path class="ln" d="M7.5 13h2M12 13h2M16.5 13h2M21 13h3.5M7.5 17.5h2M11 19.5h10M21 17.5h3.5"/>',
    // quest guidance: the amber marker, a nudge only, nothing
    mark: '<path class="c-a" d="M16 3l7.5 9.5L16 22 8.5 12.5z"/><path class="ln" d="M16 22v3.5M10 28h12"/><path class="dia" d="M16 8.5l3.2 4-3.2 4-3.2-4z"/>',
    nudge: '<path class="tile" d="M5 6h22v15H14l-6 5v-5H5z"/><path class="ln" d="M13.4 11a2.7 2.7 0 1 1 3.8 2.5c-.8.4-1.2 1-1.2 1.8"/><circle class="c-ink" cx="16" cy="18.2" r="1"/>',
    none: '<circle class="ln" cx="16" cy="16" r="10"/><path class="ln" d="M9 23L23 9"/>',
    // the Ledger's look: a book with depth / the same book, flat
    book: '<path class="c-b" d="M3 8.5c5-1.6 9.6-1.4 13 1.2v17c-3.4-2.6-8-2.8-13-1.2z"/><path class="c-b2" d="M29 8.5c-5-1.6-9.6-1.4-13 1.2v17c3.4-2.6 8-2.8 13-1.2z"/><path class="pg" d="M6 11c3.4-.8 6.4-.6 8.5.7M6 14.5c3.4-.8 6.4-.6 8.5.7M17.5 11.7c2.1-1.3 5.1-1.5 8.5-.7M17.5 15.2c2.1-1.3 5.1-1.5 8.5-.7"/>',
    flat: '<rect class="tile" x="4" y="7" width="24" height="18" rx="1"/><path class="ln" d="M16 7v18"/><path class="ln" d="M7.5 11.5h5.5M7.5 15h5.5M19 11.5h5.5M19 15h5.5"/>',
    // your companion's turn
    ask: '<path class="tile" d="M5 6h22v14H14l-6 5v-5H5z"/><path class="ln" d="M10 11.5h12M10 15h8"/>',
    protect: '<path class="c-g" d="M16 3.5l10 4v7.2c0 6.4-4.2 11-10 13.8-5.8-2.8-10-7.4-10-13.8V7.5z"/>',
    reveal: '<path class="ln" d="M3.5 16c3.4-5.6 7.5-8.5 12.5-8.5s9.1 2.9 12.5 8.5c-3.4 5.6-7.5 8.5-12.5 8.5S6.9 21.6 3.5 16z"/><circle class="c-b" cx="16" cy="16" r="4.2"/><path class="c-a" d="M25 3l1.2 2.8L29 7l-2.8 1.2L25 11l-1.2-2.8L21 7l2.8-1.2z"/>',
    press: '<path class="c-r" d="M4 13.5h13V7l11 9-11 9v-6.5H4z"/>',
  };
  const icon = (k) => (OI[k] ? '<svg class="sx-ic" viewBox="0 0 32 32" aria-hidden="true" focusable="false">' + OI[k] + '</svg>' : '');

  let uid = 0;
  // a section of a page: the book's small-capitals head
  const sec = (t) => '<h3 class="sx-sec">' + esc(t) + '</h3>';
  // a sentence about what a setting does, under its heading
  const why = (t) => (t ? '<p class="hint sx-why">' + esc(t) + '</p>' : '');
  // opts: [value, words, { i: icon, jp: Japanese name, d: a line under it }]
  function radios(key, label, opts, obj, hint) {
    const cur = (obj === 'learn' ? learnObj() : RB.game.settings)[key];
    const name = 'r' + (++uid) + key;
    const stack = opts.some((o) => o[2] && o[2].d);
    return '<fieldset class="field sx-field" data-field="' + esc(key) + '"><legend class="sx-h">' + esc(label) + '</legend>' + why(hint) +
      '<div class="opts sx-opts' + (stack ? ' stack' : '') + '">' + opts.map(([v, l, x]) => {
        x = x || {};
        return '<label class="opt sx-opt"><input type="radio" name="' + name + '" data-set="' + esc(key) + '" data-obj="' + (obj || 'st') + '" value="' + esc(String(v)) + '"' + (String(cur) === String(v) ? ' checked' : '') + '>' +
          '<span class="sx-face"><span class="sx-mark">' + icon(x.i) + '<span class="sx-w">' + (x.jp ? '<span class="sx-jp">' + ruby(x.jp) + '</span>' : '') + '<span class="sx-en">' + esc(l) + '</span></span>' + RING + '</span>' +
          (x.d ? '<span class="sx-d">' + esc(x.d) + '</span>' : '') + '</span></label>';
      }).join('') + '</div></fieldset>';
  }
  // an on/off setting (attrs: what identifies the control)
  function tick(attrs, on, label, hint) {
    return '<div class="field sx-field sx-tickf"><label class="switch sx-tick"><input type="checkbox" role="switch" ' + attrs + (on ? ' checked' : '') + '>' +
      '<span class="sx-box">' + TICK + '</span><span class="sx-h">' + esc(label) + '</span><span class="state">' + (on ? 'On' : 'Off') + '</span></label>' + why(hint) + '</div>';
  }
  function sw(key, label, hint, invert) {
    const st = RB.game.settings;
    const on = (key === 'contrast' ? st.contrast === 'high' : !!st[key]) !== !!invert;
    return tick('data-sw="' + esc(key) + '"' + (invert ? ' data-inv="1"' : ''), on, label, hint);
  }
  const at = (v, min, max) => Math.max(0, Math.min(100, ((v - min) / (max - min)) * 100)).toFixed(1) + '%';
  function rangeHtml(id, path, v, min, max, step, fmt) {
    return '<div class="slider sx-slider" style="--v:' + at(v, min, max) + '"><input type="range" id="' + id + '" data-range="' + path + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + v + '"><output for="' + id + '">' + esc(fmt(v)) + '</output></div>';
  }
  function slider(path, label, v, min, max, step, fmt, hint) {
    const id = 'sl' + (++uid);
    return '<div class="field sx-field"><label class="lab sx-h" for="' + id + '">' + esc(label) + '</label>' + why(hint) + rangeHtml(id, path, v, min, max, step, fmt) + '</div>';
  }
  const pct = (v) => Math.round(v * 100) + '%';
  // the volumes as one table: the name of each, its level
  function mixer(rows) {
    const st = RB.game.settings;
    return '<div class="sx-mix">' + rows.map(([path, label]) => {
      const id = 'sl' + (++uid), k = path.split('.');
      return '<label class="sx-mix-l" for="' + id + '">' + esc(label) + '</label>' + rangeHtml(id, path, st[k[0]][k[1]], 0, 1, 0.05, pct);
    }).join('') + '</div>';
  }

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

  // ---- the settings, shared by the tabs, the review and the battle's sheet ------------------------
  const R = {
    lead: () => radios('lead', 'Dialogue leads with', [['en', 'English', { i: 'en' }], ['ja', 'Japanese', { i: 'ja', jp: '{日本語|にほんご}' }]], null,
      'Which language each line of dialogue shows first, in the larger type.'),
    secondary: () => radios('secondary', 'The second language', [['always', 'Always shown', { i: 'shown' }], ['tap', 'Shown when tapped', { i: 'tap' }], ['off', 'Hidden', { i: 'hidden' }]], null,
      'The other language, under the first. Tapping a line shows it when it is tucked away.'),
    spacing: () => sw('spacing', 'Spaces between Japanese words', 'Beginner-friendly. Standard Japanese is written without spaces.'),
    uiLang: () => radios('uiLang', 'Menu language', [['en', 'English', { i: 'en' }], ['ja', 'Japanese', { i: 'ja', jp: '{日本語|にほんご}' }]], null,
      'The words on tabs, buttons and headings. Japanese menus keep furigana and an English name for screen readers.'),
    lightbulb: (extra) => sw('lightbulb', 'Word help (the lightbulb)', 'Hover, focus or tap any Japanese word for its reading, meaning and notes.' + (extra || '')),
    romaji: () => sw('romaji', 'Romaji in word help', 'Adds the reading in Latin letters to word help, beside the kana.'),
    textSpeed: (hint) => radios('textSpeed', 'Text speed', [['normal', 'Normal', { i: 's1' }], ['fast', 'Fast', { i: 's2' }], ['instant', 'Instant', { i: 's3' }]], null,
      hint || 'How quickly each line writes itself out. Instant shows the whole line at once.'),
    skipSeen: () => sw('skipSeen', 'Offer to skip scenes you have already seen', 'On a second visit, a scene you have read can be passed over; nothing in it is missed.'),
    furigana: () => '<p class="muted small sx-note">Furigana (readings over kanji) is always shown. It is an accessibility feature, not a difficulty setting.</p>',
    profile: (d) => radios('profile', 'Japanese level', [
      ['F', 'Foundations', { i: 'lvF', d: d ? 'Start from the kana; every character is taught before you are asked for it.' : null }],
      ['E', 'Elementary', { i: 'lvE', d: d ? 'You read kana: everyday words, particles, polite and plain forms.' : null }],
      ['I', 'Intermediate', { i: 'lvI', d: d ? 'Connected sentences: cause, time, conditions, reading in context.' : null }],
      ['A', 'Advanced', { i: 'lvA', d: d ? 'Nuance, register and implication in longer passages.' : null }]], 'learn',
      'Which version of each challenge you meet. It never locks you out of the story, and you can change it at any time.'),
    assist: () => radios('assist', 'Mistakes in battle', [['assist', 'Assisted', { i: 'assist', d: 'A wrong answer costs nothing.' }], ['normal', 'Standard', { i: 'capped', d: 'A wrong answer costs a little, never much.' }]], 'learn',
      'What a wrong answer costs in an encounter. Either way you are shown the right answer and can try again.'),
    difficulty: () => radios('difficulty', 'Tactical challenge', [['relaxed', 'Relaxed', { i: 'f1' }], ['normal', 'Standard', { i: 'f2' }], ['hard', 'Demanding', { i: 'f3' }]], 'learn',
      'How many creatures come, and how hard they press. Separate from the Japanese level.'),
    input: () => radios('input', 'Default way to answer', [['hand', 'Handwriting', { i: 'hand' }], ['choice', 'Choices', { i: 'choice' }], ['ime', 'Keyboard / IME', { i: 'ime' }]], null,
      'How a question first asks for your answer. You can switch during any question without losing your place.'),
    padKanji: () => radios('padKanji', 'Handwriting reads', [['auto', 'By Japanese level'], ['on', 'Kanji or kana'], ['off', 'Kana only']], null,
      'By level: kana only in Foundations, kanji or kana from Elementary on. The pad knows every kanji in the game (the chart lists them all); writing in kana is always fine. Kana practice reads kana only. Read as on the writing pad changes it too.'),
    strokePractice: () => sw('strokePractice', 'Stroke-order notes after handwriting', 'Off keeps handwriting lenient: only the shape is checked.'),
    questGuide: () => radios('questGuide', 'Quest guidance', [['full', 'Markers and hints', { i: 'mark' }], ['hints', 'Hints only', { i: 'nudge' }], ['off', 'Objectives only', { i: 'none' }]], null,
      'Markers point to where the followed quest’s next step happens, in the world and on the Map. Hints are nudges you open in the Journey. Asking for them is free and never counts as a mistake.'),
    townHints: () => radios('townHints', 'Towns that have changed', [['on', 'A line in the Journey'], ['off', 'Off']], null, 'When a town you know has changed since you were last there, the Journey says so in one line. It never says what changed.'),
    // (expansion E17, C-65: how a grave outcome is told; it never changes what happened or what follows)
    outcomeView: () => radios('outcomeView', 'Grave outcomes', [['shown', 'Shown'], ['summarised', 'Summarised']], null, 'Rarely, a side story can end badly for someone in it. Shown tells it as it happens, with restraint; Summarised tells it in a sentence. What happened, and the talk with your companion afterwards, are the same either way.'),
    // (expansion P13, R3: towel-wrapped and nonsexual either way; presentation only)
    bathScenes: () => radios('bathScenes', 'Bathing scenes', [['shown', 'Shown'], ['summarised', 'Summarised']], null, 'At the hot springs, a bath is part of the stay. Shown describes the bath (towels on, warm and funny); Summarised tells the bath itself in a sentence. The conversation, and what follows, are the same either way.'),
    battleAnim: (hint) => radios('battleAnim', 'Battle animations', [['normal', 'Normal', { i: 's1' }], ['fast', 'Fast', { i: 's2' }], ['instant', 'Instant', { i: 's3' }]], null,
      hint || 'How long each action takes to play. Separate from Text speed. Instant shows the results at once, with a summary of the last exchange.'),
    battleControls: (more) => radios('battleControls', 'Battle controls during actions', [['adaptive', 'Adaptive'], ['keep', 'Keep visible']], null, 'Adaptive moves the menus out of the way while actions play, so the scene has room. Keep visible leaves them in place, disabled until your next choice.' + (more || '')),
    intentDisplay: () => radios('intentDisplay', 'What creatures are about to do', [['adaptive', 'Adaptive'], ['expanded', 'Expanded']], null, 'Adaptive shows a compact badge on each creature that opens when you point at it, focus it or tap it; wording you need to read stays visible. Expanded keeps the full descriptions open while you decide.'),
    // (expansion E10: a standing intention for the companion's turn; Ask me keeps the menu, as always)
    compPlan: (hint) => radios('compPlan', 'Your companion’s turn', [['ask', 'Ask me', { i: 'ask' }], ['protect', 'Protect', { i: 'protect' }], ['reveal', 'Reveal', { i: 'reveal' }], ['press', 'Press the opening', { i: 'press' }]], null,
      hint || 'Ask me opens your companion’s menu each exchange. With a plan, they act on it by themselves, in their own way (Nao still reads, Ren still wards), and the menu opens only when they have nothing of that kind.'),
    // (Harmony addendum §7.4: the portrait layer only — the technique, its stage performance and the banner stay)
    harmonyFlourish: (hint) => sw('harmonyFlourish', 'Harmony portrait flourish', hint || 'A short paired portrait of you and your companion as a coordinated technique begins. Off keeps the technique, its performance on the stage and its name at the top.'),
    textScale: () => slider('textScale', 'Text size', RB.game.settings.textScale, 0.85, 1.5, 0.05, pct, 'Every page, line and button, together.'),
    contrast: () => sw('contrast', 'High contrast', 'Black ink on white paper, without the paper’s grain, and stronger outlines.'),
    reducedMotion: (hint) => sw('reducedMotion', 'Reduce motion', hint || 'Removes sliding and bouncing; changes still show immediately.'),
    worldLight: () => sw('worldLight', 'Light and shadow', 'Sunlight, cast shadows and lamplight on every map, and daylight through a room’s windows. Off gives a flatter picture that is quicker to draw; nothing in your journey changes.'),
    ledgerStyle: () => radios('ledgerStyle', 'The Wayfarer’s Ledger', [['book', 'The book', { i: 'book' }], ['flat', 'The book, flat', { i: 'flat' }]], null,
      'How the Ledger, the dialogue and every other page are drawn. It changes only how things look. “Flat” keeps the book’s type and pages without texture, depth or motion.'),
    muted: () => sw('muted', 'Mute all sound', 'Silences music, effects and voices at once; the levels above are kept for when you turn sound back on.'),
    highlight: () => tick('data-voicehl', RB.game.settings.voice.highlight !== false, 'Highlight each word as it is spoken',
      'While a line is spoken, the Japanese word being said is marked, and the English words that render it where the translation shows. It follows whichever voice speaks: your device’s voice now, the game’s recorded voices once they are added. Separate from word help.'),
  };
  // Suzu's speech: the control src/ui/56_suzu_speech.js applies (the same one as in Reading)
  function suzuRow(hint) {
    const v = RB.ui.suzuSpeech ? RB.ui.suzuSpeech.value() : 'standard';
    const r = (val, label, jp) => '<label class="opt sx-opt"><input type="radio" name="suzuSpeech' + (++uid) + '" data-suzu-speech value="' + val + '"' + (v === val ? ' checked' : '') + '>' +
      '<span class="sx-face"><span class="sx-mark"><span class="sx-w"><span class="sx-jp">' + ruby(jp) + '</span><span class="sx-en">' + label + '</span></span>' + RING + '</span></span></label>';
    return '<fieldset class="field sx-field" data-speech-field><legend class="sx-h">Suzu’s speech</legend>' + why(hint || 'How Suzu talks, wherever she speaks. Kansai-ben is the regional dialect of Osaka and Kyoto; word help explains its forms. Questions always use standard Japanese.') +
      '<div class="opts sx-opts">' + r('standard', 'Standard', '{標準語|ひょうじゅんご}') + r('kansai', 'Kansai-ben', '{関西弁|かんさいべん}') + '</div></fieldset>';
  }

  // ---- voices: why a line may be silent, the device's voice, following along ---------------------
  function voiceNote() {
    return '<div class="sx-slip"><p class="sx-slip-h">No recorded voices yet</p>' +
      '<p>The game’s own Japanese voices are still being cast and recorded, so this version has none. Until they arrive, a line is spoken only by a Japanese voice installed on your device, if it has one and you turn it on; otherwise every line stays silent, and everything still works by reading.</p>' +
      '<p class="muted small">When the recordings are added they will play by default, and this page will offer them, your device’s voice, or no voice at all.</p></div>';
  }
  function deviceVoice() {
    const st = RB.game.settings;
    const vs = RB.voice ? RB.voice.status() : { supported: false, localJaCount: 0, note: 'Speech synthesis is not available.' };
    const voices = RB.voice && RB.voice.japaneseVoices ? RB.voice.japaneseVoices() : [];
    let h = '<div class="field sx-field"><p class="sx-h">Your device’s Japanese voice</p>';
    if (!voices.length) {
      return h + '<p class="hint sx-why">' + esc(vs.note || '') + '</p>' +
        '<p class="muted small sx-note">On Windows, a Japanese voice comes with the Japanese language’s speech option in the system settings; on a Mac, an iPhone or an Android phone, from the system’s spoken-content or text-to-speech settings. The game uses only voices on the device: nothing is sent anywhere.</p></div>';
    }
    h += '<p class="hint sx-why">' + esc(vs.note || '') + '</p><div class="sx-row"><label class="lab" for="vsel">Voice</label><select id="vsel" data-voice>' +
      voices.map((v) => '<option value="' + esc(v.voiceURI) + '"' + (st.voice.uri === v.voiceURI ? ' selected' : '') + '>' + esc(v.name) + '</option>').join('') + '</select></div></div>';
    h += tick('data-voiceauto', !!st.voice.auto, 'Speak dialogue automatically', 'Off: a line is spoken when you press its Voice button. On: each line is spoken as it appears.');
    h += slider('voice.rate', 'Speech rate', st.voice.rate, 0.6, 1.3, 0.05, (v) => v.toFixed(2) + '×');
    return h;
  }
  // Music performance (MT-1, src/audio/22_ensemble.js): offered once the game has at least one Ensemble recording.
  // The line under it says what is actually playing, which can differ from what is chosen.
  function performanceRows() {
    const n = RB.audio && RB.audio.ensembleSongs ? RB.audio.ensembleSongs().length : 0;
    if (!n) return '';
    return radios('musicPerformance', 'Music performance', [
      ['original', 'Original', { i: 'original', d: 'The game’s own instruments, made as it plays. Works offline.' }],
      ['ensemble', 'Ensemble', { i: 'ensemble', d: 'The same music recorded with a fuller set of instruments.' }]], null,
      'The same melodies and arrangements, with a different instrumental sound. Ensemble recordings load when available; Original works offline.') +
      '<p class="muted small mp-status" data-mp-status role="status" aria-live="polite">' + esc(performanceLine()) + '</p>';
  }
  function performanceLine() {
    const s = RB.audio && RB.audio.performanceStatus ? RB.audio.performanceStatus() : null;
    if (!s) return '';
    const kept = s.pref === 'ensemble' ? 'Ensemble' : 'Original';
    const line = {
      off: 'Music off · ' + kept + ' remembered',
      none: 'No music playing',
      original: 'Original playing',
      ensemble: 'Ensemble playing',
      loading: 'Original playing while Ensemble loads',
      unsupported: 'Ensemble selected · Original playing for this track',
      standalone: 'Ensemble selected · Original playing in this standalone copy',
      failed: 'Ensemble selected · Original playing; recording unavailable',
      'original-only': 'Ensemble selected · Original playing',
    }[s.state] || '';
    const n = s.available, defs = RB.audio._ && RB.audio._.songDefs, all = defs ? Object.keys(defs).length : 0;
    // (MT-2: once every song has its recording the line says so instead of counting)
    if (s.pref === 'ensemble' && n && all && n >= all) return line + ' — Ensemble is available for every track.';
    return line + (s.pref === 'ensemble' && n ? ' — Ensemble is available for ' + (n === 1 ? 'one track' : n === 2 ? 'two tracks' : n + ' tracks') + ' so far.' : '');
  }
  if (RB.bus) RB.bus.on('audio:performance', () => {
    const el = fr && fr.box && fr.box.querySelector('[data-mp-status]');
    if (el) el.textContent = performanceLine();
  });

  // ---- the pages of each tab: [first page, facing page] (one page on a phone: the two in order) ------
  const EXTRA = {};
  // rows added by later systems: addRows(tab, f, page) with f({ radios, sw, slider, esc }) → html; page 'a' or 'b'
  // (the facing page unless said)
  function addRows(g, f, page) { (EXTRA[g] = EXTRA[g] || []).push({ f, page: page === 'a' ? 'a' : 'b' }); }
  function extras(g, page) { return (EXTRA[g] || []).filter((x) => x.page === page).map((x) => x.f({ radios, sw, slider, esc }) || '').join(''); }
  function journeyBox(inner) {
    const s = cs();
    return '<div class="campaign-box sx-journey"><div class="kind">' + I('ledger') + ' Saved with this journey' + (s && s.player ? ' (' + esc(s.player.name) + ')' : '') + '</div>' + inner + '</div>';
  }
  function pages(g) {
    if (battle()) return battlePages(g);
    if (g === 'start') return startPages();
    const st = RB.game.settings;
    switch (g) {
      case 'reading': {
        const sz = extras('reading', 'b');
        return [
          preview() + sec('Dialogue') + R.lead() + R.secondary() + R.spacing() + R.uiLang() + extras('reading', 'a'),
          sec('Help with words') + R.lightbulb() + R.romaji() + (sz ? sec('How people speak') + sz : '') + sec('Pace') + R.textSpeed() + R.skipSeen() + R.furigana(),
        ];
      }
      case 'learning':
        return [
          (cs() ? journeyBox(R.profile(true) + R.assist() + R.difficulty())
            : '<p class="note-slip">Japanese level, mistakes and tactical challenge are chosen for each campaign when you start it, and can be changed here during play.</p>') + extras('learning', 'a'),
          sec('Answering') + R.input() + R.padKanji() + R.strokePractice() + extras('learning', 'b'),
        ];
      case 'play':
        return [
          sec('Finding the way') + R.questGuide() + R.townHints() + sec('Stories') + R.outcomeView() + R.bathScenes() + extras('play', 'a'),
          sec('Battles') + R.battleAnim() + R.compPlan() + R.battleControls() + R.intentDisplay() + R.harmonyFlourish() + extras('play', 'b'),
        ];
      case 'audio':
        return [
          sec('Volume') + mixer([['vol.master', 'Overall'], ['vol.music', 'Music'], ['vol.sfx', 'Effects'], ['vol.voice', 'Voices']]) + R.muted() +
            (performanceRows() ? sec('Music') + performanceRows() : '') + extras('audio', 'a'),
          sec('Voices') + voiceNote() + deviceVoice() + sec('Following along') + R.highlight() + extras('audio', 'b'),
        ];
      case 'display':
        return [
          preview() + sec('Text') + R.textScale() + R.contrast() + sec('Motion and light') + R.reducedMotion() + R.worldLight() + extras('display', 'a'),
          sec('The book') + R.ledgerStyle() + extras('display', 'b'),
        ];
      case 'controls': {
        const binds = RB.input.getBinds();
        const ss = RB.save.status();
        return [
          sec('Keys') + '<p class="sx-why">Choose Change, then press the key you want. Each key does one thing; taking a key from another action removes it there.</p><ul class="entries keys">' +
            Object.keys(RB.input.DEFAULT_BINDS).map((a) => '<li class="entry"><span class="mark">' + I('next') + '</span><div><div class="t">' + esc(RB.input.ACTION_LABELS[a]) + '</div><div class="muted small keycaps">' + binds[a].map((k) => '<kbd>' + esc(RB.input.keyName(k)) + '</kbd>').join(' ') + '</div></div><button class="pbtn" data-bind="' + a + '">Change</button></li>').join('') + '</ul>' +
            '<div class="row-acts"><button class="pbtn" data-a="resetbinds">Reset all keys</button></div>' + extras('controls', 'a'),
          sec('Touch') +
            radios('touch', 'On-screen touch controls', [['auto', 'Automatic'], ['on', 'Always'], ['off', 'Never']], null, 'Automatic shows them on touch screens.') +
            radios('touchHand', 'Action and Run buttons on the', [['right', 'Right', { d: 'Move with the left thumb.' }], ['left', 'Left', { d: 'Move with the right thumb.' }]]) +
            radios('touchSize', 'Touch control size', [['normal', 'Standard'], ['large', 'Large']]) +
            sec('Saves') + '<p class="' + (ss.mode === 'session' ? 'note-slip bad' : 'note-slip') + '">' + esc(ss.mode === 'idb' ? 'Saving to this browser (IndexedDB).' : ss.mode === 'local' ? 'Saving to this browser (localStorage fallback).' : 'Session only: nothing persists after closing.') + '</p>' +
            '<p class="sx-why">Saves belong to this browser profile and this page’s address. Clearing site data, private windows, or opening the game from a different address or browser will not see them.' + (ss.persisted ? ' The browser has granted persistent storage (you can still clear it yourself).' : '') + '</p>' +
            (ss.mode !== 'session' && !ss.persisted ? '<div class="row-acts"><button class="pbtn" data-a="persist">Ask the browser to keep saves</button></div>' : '') + extras('controls', 'b'),
        ];
      }
    }
    return ['', ''];
  }
  // "Before you set out": what shapes ordinary play, on one spread, for a journey just made (ST-1b)
  function startPages() {
    return [
      '<p class="sx-lede">These shape how the road plays. Look them over before the story begins; every one can be changed later in Settings (the gear at the top of the screen, or in the Ledger), and the other tabs above hold the rest.</p>' +
        journeyBox(R.profile(false) + R.assist() + R.difficulty()) +
        sec('Finding the way') + R.questGuide() +
        sec('Reading') + R.lead() + R.secondary() + R.spacing() + R.lightbulb() + R.textSpeed(),
      sec('Sound') + mixer([['vol.master', 'Overall'], ['vol.music', 'Music'], ['vol.sfx', 'Effects']]) + performanceRows() +
        sec('Voices') + voiceNote() + R.highlight() +
        sec('How people speak') + suzuRow('Suzu, one of the companions you may travel with, grew up speaking Kansai-ben, the regional dialect of Osaka and Kyoto. Standard keeps her lines in standard Japanese; Kansai lets her speak as she would at home, with word help explaining its forms. Questions always use standard Japanese.') +
        sec('Stories') + R.outcomeView() + R.bathScenes() +
        sec('Battles') + R.battleAnim() + R.compPlan(),
    ];
  }

  // ---- behaviour (unchanged persistence: apply now, save now; sliders debounce) --------------
  function wire(L) {
    L.onclick = async (e) => {
      const b = e.target.closest('[data-bind],[data-a]');
      if (!b) return;
      if (battle()) return; // (in battle: no keys, no storage requests — nothing of the kind is offered)
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
      if (battle() && !allowedNow(t)) { render(); return; }
      if (t.matches('input[type=radio][data-set]')) {
        let v = t.value;
        if (v === 'true') v = true; else if (v === 'false') v = false;
        if (t.dataset.obj === 'learn') learnObj()[t.dataset.set] = v; else st[t.dataset.set] = v;
        await RB.game.saveSettings();
        if (t.dataset.set === 'uiLang') { RB.ui.hud.refresh && RB.ui.hud.refresh(); relabel(); }
        if (t.dataset.set === 'ledgerStyle') { if (fr) fr.setBook(st.ledgerStyle === 'flat' ? 'flat' : 'book'); if (RB.ui.menu && RB.ui.menu.restyle) RB.ui.menu.restyle(); }
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
      } else if (t.matches('[data-voicehl]')) {
        st.voice.highlight = t.checked; if (!t.checked && RB.ui.speechMark) RB.ui.speechMark.stop();
        await RB.game.saveSettings(); render(); focusSame(t);
      } else if (t.matches('[data-voice]')) {
        st.voice.uri = t.value; RB.game.saveSettings(); RB.voice.speak('こんにちは');
      } else if (t.matches('[data-suzu-speech]')) {
        // (src/ui/56_suzu_speech.js applies it on the document's change; the page is drawn again after it)
        setTimeout(() => { render(); focusSame(t); }, 0);
      }
    };
    L.oninput = (e) => {
      const r = e.target.closest('[data-range]');
      if (!r) return;
      if (battle() && !IN_BATTLE[r.dataset.range]) return;
      const st = RB.game.settings;
      const path = r.dataset.range.split('.');
      if (path.length === 2) st[path[0]][path[1]] = +r.value; else st[path[0]] = +r.value;
      const out = r.parentNode.querySelector('output');
      if (out) out.textContent = path[1] === 'rate' ? (+r.value).toFixed(2) + '×' : Math.round(+r.value * 100) + '%';
      r.parentNode.style.setProperty('--v', at(+r.value, +r.min, +r.max));
      RB.game.applySettings();
      clearTimeout(wire._t);
      wire._t = setTimeout(() => RB.game.saveSettings(), 300);
    };
  }
  // the menu language changed: the tabs' words follow it
  function relabel() {
    if (!tabsApi || !fr) return;
    for (const t of tabsFor()) {
      const b = tabsApi.el.querySelector('.ptab[data-id="' + t.id + '"] .tl');
      if (b) b.innerHTML = RB.ui.label(t.jp, t.en);
    }
    tabsApi.select(group);
  }
  // after a re-render, keep keyboard focus on the equivalent control
  function focusSame(t) {
    const sel = t.dataset.set ? 'input[data-set="' + t.dataset.set + '"][value="' + CSS.escape(t.value) + '"]' : t.dataset.sw ? '[data-sw="' + t.dataset.sw + '"]'
      : t.hasAttribute('data-voiceauto') ? '[data-voiceauto]' : t.hasAttribute('data-voicehl') ? '[data-voicehl]' : t.hasAttribute('data-suzu-speech') ? 'input[data-suzu-speech][value="' + CSS.escape(t.value) + '"]' : null;
    const n = sel && fr && fr.box.querySelector(sel);
    if (!n) return;
    n.focus({ preventScroll: true });
    // (the mark just made is drawn in: its loop or tick, and only that one)
    const m = n.closest('.sx-opt, .sx-tick');
    if (m) m.classList.add('fresh');
  }

  // ---- a new journey: look the settings over before setting out (ST-1b) --------------------------
  function reviewFoot() {
    fr.foot.innerHTML = '<p class="sx-foot">' + I('save') + '<span>Changes take effect straight away. You can come back to all of them at any time.</span></p>' +
      '<button type="button" class="cbtn sx-go" data-review-go>' + '<span>Set out</span>' + I('next') + '</button>';
    fr.foot.onclick = (e) => { const b = e.target.closest('[data-review-go]'); if (b && e.detail < 2) finishReview(); };
  }
  // opens on "Before you set out" for the journey s (not yet begun); resolves when the player sets out
  function review(s) {
    if (lay) close();
    return new Promise((res) => {
      reviewS = s || null; reviewDone = res;
      lastMode = 'review'; group = 'start';
      if (RB.audio) RB.audio.sfx('menu_open');
      show('review');
    });
  }
  function finishReview() {
    if (mode !== 'review') return;
    const done = reviewDone;
    reviewDone = null;
    close();
    reviewS = null;
    lastMode = 'normal'; group = null;
    if (RB.audio) RB.audio.sfx('confirm');
    if (done) done();
  }

  // ---- in battle: the same settings, presentation only ------------------------------------------
  // What may change while a battle is open: how it looks, reads and sounds and how fast it plays —
  // nothing that changes a rule, a reward, the learning difficulty or the campaign (the audit:
  // docs/COMBAT_NOTES.md, "Settings in battle"). Keys of RB.game.settings, and the slider paths.
  const IN_BATTLE = {
    battleAnim: 1, textSpeed: 1, reducedMotion: 1,
    'vol.master': 1, 'vol.music': 1, 'vol.sfx': 1, 'vol.voice': 1, muted: 1, petSounds: 1, 'voice.rate': 1,
    musicPerformance: 1, // (how the music sounds: MT-1)
    lead: 1, secondary: 1, spacing: 1, lightbulb: 1, romaji: 1,
    textScale: 1, contrast: 1,
    battleControls: 1, intentDisplay: 1, petBattle: 1, compPlan: 1,
    harmonyFlourish: 1, // (Harmony addendum §7.4: the portrait layer only — presentation)
  };
  // (the voice and its automatic speaking, and Suzu's speech, which src/ui/56_suzu_speech.js applies, are allowed too)
  function allowedNow(t) {
    if (t.matches('input[type=radio][data-set]')) return t.dataset.obj !== 'learn' && !!IN_BATTLE[t.dataset.set];
    if (t.matches('[data-sw]')) return !!IN_BATTLE[t.dataset.sw];
    if (t.matches('[data-range]')) return !!IN_BATTLE[t.dataset.range]; // (sliders apply on input, below)
    return t.matches('[data-voiceauto], [data-voicehl], [data-voice], [data-suzu-speech]');
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
      '<ul class="entries bset-fixed">' + rows.map(([l, val, whyx]) => '<li class="entry"><span class="mark">' + I('key') + '</span><div><div class="t">' + esc(l) + ': <b>' + esc(val) + '</b></div><div class="muted small">' + esc(whyx) + '</div></div></li>').join('') + '</ul>';
  }
  const PAUSED = '<p class="muted small sx-note">The encounter stays paused while this is open. Only how it looks, reads and sounds can change now; changes take effect straight away and are remembered in this browser.</p>';
  function battlePages(g) {
    switch (g) {
      case 'motion':
        return [
          R.battleAnim('How long each action takes to play. Instant shows the results at once, with a summary of the last exchange. An action already under way goes on at the new pace (with Instant, its results show at once).') +
            R.textSpeed('The lines spoken in this encounter. Separate from Battle animations.'),
          R.reducedMotion('Removes sliding and bouncing; changes still show immediately. An action under way settles at once.') + PAUSED,
        ];
      case 'audio':
        return [
          sec('Volume') + mixer([['vol.master', 'Overall'], ['vol.music', 'Music'], ['vol.sfx', 'Effects'], ['vol.voice', 'Voices']]) + R.muted() + (performanceRows() ? sec('Music') + performanceRows() : '') +
            sw('petSounds', 'Quiet pet sounds', 'An occasional soft sound from your pet (never needed: everything it does is also seen).'),
          sec('Voices') + voiceNote() + deviceVoice() + sec('Following along') + R.highlight(),
        ];
      case 'reading':
        return [
          preview() + R.lead() + R.secondary() + R.spacing(),
          R.lightbulb(' Inside a question it counts as assisted, as always.') + R.romaji() + suzuRow() + R.furigana(),
        ];
      case 'display':
        return [R.textScale() + R.contrast(), '<p class="muted small sx-note">While an action plays, the scene keeps its place and size; the menus take a new text size at once.</p>' + PAUSED];
      case 'battle':
        return [
          R.battleControls(' From the next exchange.') + R.intentDisplay(),
          R.compPlan('With a plan, your companion acts on it by themselves from the next exchange; Ask me opens their menu.') +
            sw('petBattle', 'Show pet in battle', 'It sits beside the two of you and watches. It never acts, and hiding it changes nothing.') +
            // (Harmony addendum §7.4: the portrait layer only; a portrait on screen goes when the encounter resumes)
            R.harmonyFlourish('A short paired portrait of you and your companion as a coordinated technique begins. Off keeps the technique, its performance and its name at the top.'),
        ];
      default:
        return [fixedRows(), PAUSED];
    }
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
    if (leaving || !lay || !battle()) return;
    leaving = true;
    try {
      const r = await RB.ui.confirm(kind === 'load'
        ? 'Leave this encounter and load another journey? This battle won’t count — the creature will still be there.'
        : 'Leave this encounter and return to the title? This battle won’t count — the creature will still be there. Anything since your last save or autosave will be lost.',
      [kind === 'load' ? 'Choose a journey…' : 'Return to title', 'Stay in the encounter']);
      if (r !== 0 || !lay || !battle() || !RB.combat.state()) return;
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
    show('battle');
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
    if (btn) btn.hidden = !(battleReady() || (lay && battle()));
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
      else if (e.phase === 'exit') { if (lay && battle()) close({ leaving: true }); unmount(); }
    });
    // a campaign change closes the sheet without resuming anything: the battle is being left
    RB.bus.on('campaign:changing', () => { if (lay && battle()) close({ leaving: true }); unmount(); });
  }

  return {
    open, close, addRows, review, isOpen: () => !!lay, openBattle, battleReady, inBattle: () => !!(lay && battle()),
    reviewing: () => !!(lay && mode === 'review'), tab: show_, suzuRow, current: () => (lay ? group : null), TABS, BATTLE_TABS,
  };
})();
