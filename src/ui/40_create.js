/* New game flow: prologue cutscene (skippable), then one stepped registration
 * in the folio — Identity, Appearance, Background, Learning setup (with an
 * optional placement) — and New Game+. Skipping the prologue reaches the
 * same starting state; its content is recorded in the journal. Moving back
 * through the steps never replays the prologue, and every entry survives
 * step changes, resizes and orientation changes (the state lives here, the
 * layout is CSS: src/styles/45_create.css). */
var RB = (globalThis.RB = globalThis.RB || {});

RB.ui.create = (function () {
  'use strict';
  const esc = RB.util.esc;
  const I = (n, t) => RB.ui.folio.icon(n, t);
  // icons for this flow (24×24, stroke currentColor), read by RB.ui.folio.icon
  Object.assign(RB.ui.folio.ICONS, {
    'cr-turnl': '<path d="M8.5 8.5H4v-4.5"/><path d="M4.6 8.2A8 8 0 1 1 5.2 16"/>',
    'cr-turnr': '<path d="M15.5 8.5H20v-4.5"/><path d="M19.4 8.2A8 8 0 1 0 18.8 16"/>',
    'cr-expand': '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
    'cr-collapse': '<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/>',
    'cr-edit': '<path d="M4 20l1.2-4.6L16.6 4a2 2 0 0 1 2.8 0l.6.6a2 2 0 0 1 0 2.8L8.6 18.8z"/><path d="M14.5 6.1l3.4 3.4"/>',
  });

  // Tab inside a layer: the game binds Tab to "menu", so move focus here in
  // document order (radio groups count once, as in the browser).
  function tabKey(root, e) {
    if (!e || e.key !== 'Tab') return false;
    if (document.activeElement !== e.target) return true; // the layer's wrap-around already moved it
    const f = RB.ui.focusables(root).filter((el) => {
      if (el.type !== 'radio') return true;
      if (el.checked) return true;
      const grp = root.querySelectorAll('input[type=radio][name="' + el.name + '"]');
      return !Array.from(grp).some((r) => r.checked) && grp[0] === el;
    });
    if (!f.length) return true;
    const i = f.indexOf(document.activeElement);
    const j = e.shiftKey ? (i <= 0 ? f.length - 1 : i - 1) : (i + 1) % f.length;
    f[j].focus();
    return true;
  }

  // ---- prologue ----------------------------------------------------------------
  // Six shots, each drawn at art resolution by RB.prologueArt (src/ui/41*_prologue_*.js):
  // the title's lantern road, Hana's teahouse twice, the riverbank lantern, the bridge,
  // and the traveller walking up the road into the distance.
  const SHOTS = [
    { jp: '{灯|ひ} の {道|みち} は 、 {通|とお}った {場所|ばしょ} の {名前|なまえ} を {覚|おぼ}えている 。', en: 'The lantern roads remember the name of every place they pass through.', draw: 'road' },
    { jp: '{夜明|よあ}け 、 {茶屋|ちゃや} の ハナ は お{茶|ちゃ} を ふたつ いれた 。', en: 'At dawn, Hana at the teahouse poured two cups of tea.', draw: 'tea' },
    { jp: 'でも 、 ふたつ{目|め} が {誰|だれ} の ため なのか 、 {思|おも}い{出|だ}せなかった 。', en: 'But she could not remember who the second cup was for.', draw: 'cup' },
    { jp: '{川|かわ}べり の {灯|あか}り から 、 {名前|なまえ} が ひと{文字|もじ} ずつ {消|き}えていった 。', en: 'On the riverbank, the name on a lantern faded, one letter at a time.', draw: 'lantern' },
    { jp: '{朝|あさ} に なって も {橋|はし} は あった 。 ただ 、 {向|む}こう{岸|ぎし} に は もう {届|とど}かない 。', en: 'By morning the bridge was still there. It just no longer reached the other bank.', draw: 'bridge' },
    { jp: 'そして 、 {古|ふる}い {文字|もじ} を {読|よ}める {旅人|たびびと} が ひとり 、 {葦|あし}ノ{瀬|せ} へ {歩|ある}いていた 。', en: 'And a traveller who could still read the old letters was walking toward Reedwake.', draw: 'walker' },
  ];
  // On manual advancement (docs/expressive/SHOTS.md §7; the shared player, src/ui/43_sequence.js): each
  // shot dissolves in (from black for the first), plays its one-time action once (the lantern's name
  // leaving it, the walk up the road), then holds for as long as the reader likes — nothing moves on by
  // itself. Next is one shot per press; the last Next leaves for creation once. Previous looks back, Replay
  // shot plays the action again, Hide text shows the whole picture. Escape or Skip prologue asks first,
  // unless the prologue has been watched through on this device before. The caption slip is the paper
  // slip it always was (furigana and word help as everywhere).
  function prologue() {
    return RB.sequence.view({
      seq: 'prologue', label: 'Prologue', name: 'prologue', music: 'prologue',
      beats: SHOTS.map((s) => ({ shot: s.draw, line: { jp: s.jp, en: s.en } })),
      seen: () => !!(RB.game.settings && RB.game.settings.prologueSeen),
      // a device setting, not campaign state (older settings records lack it: not yet seen)
      onSeen: () => { const st = RB.game.settings; if (st && !st.prologueSeen) { st.prologueSeen = true; RB.game.saveSettings(); } },
      skip: { label: 'Skip prologue', confirm: 'Skip the prologue? You have not seen it through yet. You will go straight to making your traveller.', yes: 'Skip the prologue', no: 'Keep watching' },
      release: () => RB.prologueArt.release(),
    }).then(() => {});
  }

  // ---- data ----------------------------------------------------------------------------
  const BACKGROUNDS = [
    { id: 'courier', en: "Courier's apprentice", jp: '{配達|はいたつ}{見習|みなら}い', d: 'You know roads, weather and how to read an address written in a hurry.' },
    { id: 'craft', en: 'Village craftsperson', jp: '{村|むら} の {職人|しょくにん}', d: 'You fix things. People bring you broken boots and bad hinges and stay to talk.' },
    { id: 'student', en: 'Wandering student', jp: '{旅|たび} の {学生|がくせい}', d: 'You collect old words and older arguments, and you are rarely short of questions.' },
  ];
  const BG_ICON = { courier: 'letter', craft: 'tool', student: 'book' };
  const PROFILES = [
    { id: 'F', en: 'Foundations', d: 'Start from the kana. Every character is taught with examples before you are asked for it. You can finish the whole story from here.' },
    { id: 'E', en: 'Elementary', d: 'You read kana. Everyday words, particles, polite and plain forms, simple sentences.' },
    { id: 'I', en: 'Intermediate', d: 'Connected sentences: cause, time, conditions, reading in context.' },
    { id: 'A', en: 'Advanced', d: 'Nuance, register, implication and paraphrase in longer passages (curated material approaching N2/N1-style reading — not a complete course).' },
  ];
  // Names for the look palettes (labels only; the colours are RB.sprites').
  const SKIN_NAMES = ['Very light', 'Light', 'Light-medium', 'Medium', 'Medium-deep', 'Deep', 'Very deep'];
  const CLOTH_NAMES = ['Indigo', 'Rust red', 'Moss green', 'Wisteria', 'Ochre', 'Charcoal', 'Undyed linen', 'Deep teal'];
  const HAIR_STYLE_NAMES = { short: 'Short', bob: 'Bob', long: 'Long', ponytail: 'Ponytail', bun: 'Bun', curly: 'Curly', spiky: 'Spiky', braid: 'Braid', shaved: 'Shaved', twintails: 'Twin tails', wavy: 'Wavy', wrap: 'Head wrap' };
  const SHAPES = [['tunic', 'Tunic'], ['robe', 'Robe'], ['coat', 'Coat'], ['apron', 'Apron']];
  const ACC_NAMES = { scarf: 'Scarf', satchel: 'Satchel', glasses: 'Glasses', headband: 'Headband', flower: 'Flower', hat: 'Hat', earrings: 'Earrings', cape: 'Cape' };
  const MAX_ACC = 2;
  const PRON = [['they', 'they/them'], ['she', 'she/her'], ['he', 'he/him'], ['custom', 'custom…']];
  const cap1 = (s) => String(s).charAt(0).toUpperCase() + String(s).slice(1);
  // FR-1 F16: a compound piece name may break where its parts meet ("Head-|band" on a narrow phone), never mid-part
  // ("Headban|d"); a soft hyphen shows only when the line breaks there, and the label reads as one word to a screen reader
  const SHY = { Headband: 'Head\u00adband', Ponytail: 'Pony\u00adtail', Earrings: 'Ear\u00adrings' };
  const label = (t) => esc(SHY[t] || t);
  const NAME = {
    skin: (i) => SKIN_NAMES[i] || 'Tone ' + (+i + 1),
    hairColor: (i) => cap1((RB.sprites.HAIR_NAMES || [])[i] || 'colour ' + (+i + 1)),
    outfit: (i) => CLOTH_NAMES[i] || 'Colour ' + (+i + 1),
    hair: (v) => HAIR_STYLE_NAMES[v] || cap1(v),
    shape: (v) => (SHAPES.find((s) => s[0] === v) || [v, cap1(v)])[1],
    acc: (v) => ACC_NAMES[v] || cap1(v),
  };
  const STEPS = {
    identity: { en: 'Identity', title: 'Who is walking the road?', lede: 'How people on the road will know you. Only the name is needed; everything else has a starting choice.' },
    appearance: { en: 'Appearance', title: 'Who is walking the road?', lede: 'Appearance never affects difficulty or ability.' },
    background: { en: 'Background', title: 'Who is walking the road?', lede: 'Backgrounds change a few conversations and your starting keepsake. They never lock you out of anything.' },
    learning: { en: 'Learning', title: 'How would you like to learn?', lede: 'All of this can be changed later in Settings without losing story progress. Language level and combat difficulty are separate.' },
    summary: { en: 'Summary', title: 'Before you set out' },
  };
  const LEARN = {
    kana: ['Kana so far', [['none', 'Teach me from the start'], ['hira', 'I know hiragana'], ['both', 'I know hiragana and katakana']]],
    assist: ['Mistakes in battle', [['assist', 'Assisted: no cost for mistakes'], ['normal', 'Standard: small, capped cost']]],
    difficulty: ['Tactical challenge', [['relaxed', 'Relaxed'], ['normal', 'Standard'], ['hard', 'Demanding']]],
    input: ['Answer with', [['hand', 'Handwriting'], ['choice', 'Choices'], ['ime', 'Keyboard / IME']]],
    lead: ['Dialogue', [['en', 'English-led (Japanese beneath)'], ['ja', 'Japanese-led (English beneath)']]],
    secondary: ['Second language line', [['always', 'Always shown'], ['tap', 'Tap to show'], ['off', 'Hidden']]],
    uiLang: ['Menus', [['en', 'English'], ['ja', null]]],
  };

  // the learning step's choices in the Settings book's look (ST-2): legend, choices with their drawn icons, a sentence
  const LEARN_LOOK = {
    kana: ['Kana so far', [['none', 'From the start', { i: 'kana0' }], ['hira', 'Hiragana', { i: 'kanaH' }], ['both', 'Both kana', { i: 'kanaHK' }]],
      'What you can already read: none yet, hiragana, or hiragana and katakana. Kana you know is not taught again, and every character can still be looked up.'],
    assist: ['Mistakes in battle', [['assist', 'Assisted', { i: 'assist', d: 'Learning mistakes cost nothing. Try again, with help if you like; the creature\u2019s moves still matter.' }], ['normal', 'Standard', { i: 'capped', d: 'A wrong answer costs a little resolve, never much.' }]],
      'What a wrong answer costs in an encounter. Either way you are shown the right answer and can try again. Separate from the tactical challenge.'],
    difficulty: ['Tactical challenge', [['relaxed', 'Relaxed', { i: 'f1' }], ['normal', 'Standard', { i: 'f2' }], ['hard', 'Demanding', { i: 'f3' }]],
      'How many creatures come, and how hard they press. Separate from the Japanese level.'],
    input: ['Default way to answer', [['hand', 'Handwriting', { i: 'hand' }], ['choice', 'Choices', { i: 'choice' }], ['ime', 'Keyboard / IME', { i: 'ime' }]],
      'How a question first asks for your answer. You can switch during any question.'],
    lead: ['Dialogue leads with', [['en', 'English', { i: 'en' }], ['ja', 'Japanese', { i: 'ja', jp: '{日本語|にほんご}' }]],
      'Which language each line of dialogue shows first, in the larger type.'],
    secondary: ['The second language', [['always', 'Always shown', { i: 'shown' }], ['tap', 'Shown when tapped', { i: 'tap' }], ['off', 'Hidden', { i: 'hidden' }]],
      'The other language, under the first. Tapping a line shows it when it is tucked away.'],
    uiLang: ['Menu language', [['en', 'English', { i: 'en' }], ['ja', 'Japanese', { i: 'ja', jp: '{日本語|にほんご}' }]],
      'The words on tabs, buttons and headings. Japanese menus keep furigana.'],
  };

  function romajiToKata(s) {
    const src = s.toLowerCase().replace(/[^a-z]/g, '');
    if (!src) return '';
    const T = { kya: 'キャ', kyu: 'キュ', kyo: 'キョ', sha: 'シャ', shu: 'シュ', sho: 'ショ', shi: 'シ', chi: 'チ', cha: 'チャ', chu: 'チュ', cho: 'チョ', tsu: 'ツ', nya: 'ニャ', nyu: 'ニュ', nyo: 'ニョ', hya: 'ヒャ', hyu: 'ヒュ', hyo: 'ヒョ', rya: 'リャ', ryu: 'リュ', ryo: 'リョ', ja: 'ジャ', ju: 'ジュ', jo: 'ジョ', ji: 'ジ',
      ka: 'カ', ki: 'キ', ku: 'ク', ke: 'ケ', ko: 'コ', sa: 'サ', su: 'ス', se: 'セ', so: 'ソ', ta: 'タ', ti: 'ティ', tu: 'トゥ', te: 'テ', to: 'ト', na: 'ナ', ni: 'ニ', nu: 'ヌ', ne: 'ネ', no: 'ノ', ha: 'ハ', hi: 'ヒ', fu: 'フ', hu: 'フ', he: 'ヘ', ho: 'ホ', ma: 'マ', mi: 'ミ', mu: 'ム', me: 'メ', mo: 'モ', ya: 'ヤ', yu: 'ユ', yo: 'ヨ', ra: 'ラ', ri: 'リ', ru: 'ル', re: 'レ', ro: 'ロ', wa: 'ワ', wo: 'ヲ',
      ga: 'ガ', gi: 'ギ', gu: 'グ', ge: 'ゲ', go: 'ゴ', za: 'ザ', zi: 'ジ', zu: 'ズ', ze: 'ゼ', zo: 'ゾ', da: 'ダ', di: 'ディ', du: 'ドゥ', de: 'デ', do: 'ド', ba: 'バ', bi: 'ビ', bu: 'ブ', be: 'ベ', bo: 'ボ', pa: 'パ', pi: 'ピ', pu: 'プ', pe: 'ペ', po: 'ポ',
      la: 'ラ', li: 'リ', lu: 'ル', le: 'レ', lo: 'ロ', va: 'ヴァ', vi: 'ヴィ', vu: 'ヴ', ve: 'ヴェ', vo: 'ヴォ', fa: 'ファ', fi: 'フィ', fe: 'フェ', fo: 'フォ', wi: 'ウィ', we: 'ウェ', je: 'ジェ', she: 'シェ', che: 'チェ',
      a: 'ア', i: 'イ', u: 'ウ', e: 'エ', o: 'オ' };
    let out = '', i = 0;
    while (i < src.length) {
      let hit = false;
      for (const n of [3, 2, 1]) {
        const seg = src.slice(i, i + n);
        if (T[seg]) { out += T[seg]; i += n; hit = true; break; }
      }
      if (hit) continue;
      const ch = src[i];
      if (ch === 'n') { out += 'ン'; i++; continue; }
      if (i + 1 < src.length && src[i + 1] === ch) { out += 'ッ'; i++; continue; }
      const alt = { c: 'ク', k: 'ク', s: 'ス', t: 'ト', d: 'ド', b: 'ブ', p: 'プ', g: 'グ', m: 'ム', r: 'ル', l: 'ル', f: 'フ', v: 'ヴ', z: 'ズ', h: 'フ', j: 'ジ', x: 'クス', q: 'ク', w: 'ウ', y: 'イ' }[ch];
      out += alt || '';
      i++;
    }
    return out;
  }

  // ---- portraits on paper -----------------------------------------------------------------
  // RB.portraits.drawPlayer paints its own dark mount. For the paper sheet we
  // lift the figure off it: pixels that match that mount's gradient exactly
  // (rendered the same way here) become transparent. The drawing is unchanged.
  // The player's portrait without its dark mount, for the paper sheet.
  function cut(look, expr) {
    return RB.portraits.playerImage(look, expr);
  }
  // the road sprite at the character standard (RB.sprites.FRAME, 40×58 art px)
  function fig(c, look, dir, frame) {
    const art = RB.sprites.getArt && RB.sprites.getArt(look, dir, frame);
    c.imageSmoothingEnabled = false;
    if (art) c.drawImage(art, 0, 0);
    else c.drawImage(RB.sprites.get(look, dir, frame), 4, 9, 32, 48);
  }
  const FIG_W = (RB.sprites.FRAME || { w: 40 }).w, FIG_H = (RB.sprites.FRAME || { h: 58 }).h;

  // ---- the stepped registration --------------------------------------------------------------
  // CW-1, the traveller's setup book (Robin, 2026-10-18): the steps are spreads of one book, two equal pages each. A
  // spread is printed from the setup draft by a pure builder (spread()), and the live pages are mounted from it; the
  // same builder prints the pages a leaf carries while it turns (src/ui/39_leafturn.js). The draft (p, o, prefs) is the
  // only state: no value lives only in a control, so a page can always be printed again. Steps: any of identity,
  // appearance, background, learning, summary, in that order. With the Summary (a new journey), Begin there is the one
  // final action, and the draft's other preferences (prefs, set in the Summary's editor) come back with it; nothing is
  // saved or built before then. Resolves { player, learn } (+ { prefs, changed, owned } with the Summary).
  let active = null; // the open wizard's teardown (dispose())
  function wizard(steps) {
    return new Promise((resolve) => {
      const st = RB.game.settings || {};
      const p = {
        name: '', nameJp: '', pron: 'they', bg: 'courier', custom: { they: 'they', them: 'them', their: 'their', theirs: 'theirs', self: 'themself', plural: true },
        look: { skin: 2, hair: 'short', hairColor: 1, outfit: 0, shape: 'tunic', acc: ['scarf'] },
      };
      // (mistakes: Assisted unless chosen otherwise, FR-1 F17; the way to answer: the player's own, else handwriting)
      const o = { profile: 'F', kana: 'none', assist: 'assist', difficulty: 'normal', lead: st.lead || 'en', secondary: st.secondary || 'always', uiLang: st.uiLang || 'en', input: st.input || 'hand' };
      const has = (id) => steps.indexOf(id) >= 0;
      const full = has('summary');
      // the journey's other preferences, a copy of the browser's until Begin; the editor previews a few on the live
      // settings (owned: their values before), and changed lists what it changed
      const prefs = full ? RB.util.deepClone(st) : null;
      const owned = {};
      const changed = new Set();
      const V = { i: 0, max: 0, jpEdited: false, dir: 'down', blink: false, closed: false, accNote: '', per: {}, edit: null, nav: 'idle', token: 0, turn: null, done: false, editor: false };
      const fr = RB.ui.folio.frame({ cls: 'folio-create' + (steps.length < 2 ? ' one-step' : '') + (full ? ' cr-five' : '') });
      fr.scrim.classList.add('cr-scrim');
      const layer = { el: fr.scrim, name: 'create', noAutofocus: true };
      fr.box.innerHTML = '<div class="cr-body"></div><div class="cr-stage" aria-hidden="true"></div>';
      const body = fr.box.querySelector('.cr-body');
      const stage = fr.box.querySelector('.cr-stage');
      fr.foot.innerHTML = '<button type="button" class="cbtn cr-back" data-a="back">' + I('back') + '<span>Back</span></button>' +
        '<span class="spacer"></span><span class="sr cr-live" aria-live="polite"></span><span class="cr-busy" aria-hidden="true"></span>' +
        '<button type="button" class="cbtn cr-primary cr-next" data-a="next"><span>Next<span class="to"></span></span>' + I('next') + '</button>' +
        '<button type="button" class="cbtn cr-primary cr-ret" data-a="return" hidden><span>Return to summary</span>' + I('next') + '</button>' +
        '<button type="button" class="cbtn cr-primary cr-go" data-a="go" hidden><span>' + (has('learning') ? 'Begin<span class="to"> the journey</span>' : 'Continue') + '</span>' + I('next') + '</button>';
      const live = fr.foot.querySelector('.cr-live');
      const say = (t) => { live.textContent = ''; setTimeout(() => { live.textContent = t; }, 30); };
      const D = () => ({ p, o, prefs, accNote: V.accNote, jpEdited: V.jpEdited, dir: V.dir });
      const sel = (s) => body.querySelector(s);

      // -- builders (pure: they read the draft d and return markup) --------------------------------------------------
      function sheetHtml(cls) {
        return '<aside class="cr-sheet cr-l' + (cls ? ' ' + cls : '') + '" aria-label="Your traveller"><div class="cr-kick" aria-hidden="true">Your traveller</div>' +
          '<div class="cr-figs" aria-hidden="true"><div class="cr-port"><canvas width="' + RB.portraits.S + '" height="' + RB.portraits.S + '"></canvas></div>' +
          '<div class="cr-fig" data-dir="down"><canvas width="' + FIG_W + '" height="' + FIG_H + '"></canvas></div></div>' +
          '<div class="cr-sum"><div class="cr-nm"></div><div class="cr-sub"></div></div>' +
          '<div class="cr-turn" role="group" aria-label="Turn the figure"><button type="button" class="pbtn" data-a="turnl" aria-label="Turn figure left">' + I('cr-turnl') + '</button>' +
          '<button type="button" class="pbtn" data-a="turnr" aria-label="Turn figure right">' + I('cr-turnr') + '</button></div>' +
          '<dl class="cr-reg"></dl>' +
          '<p class="cr-note">Appearance never affects difficulty or ability.</p>' +
          '<button type="button" class="pbtn cr-expand" data-a="expand" aria-expanded="false">' + I('cr-expand') + '<span class="tx">Inspect</span></button>' +
          '</aside>';
      }
      function chips(key, attr, legend, opts, hint) {
        return '<fieldset class="field cr-group" data-group="' + key + '"><legend>' + esc(legend) + '</legend><div class="cr-opts">' + opts.map(([v, l]) =>
          '<label class="cr-opt"><input type="radio" name="cr-' + key + '" ' + attr + '="' + key + '" data-v="' + esc(v) + '"><span class="face">' + l + '</span></label>').join('') +
          '</div>' + (hint ? '<div class="hint">' + esc(hint) + '</div>' : '') + '</fieldset>';
      }
      const tick = '<span class="cr-tick" aria-hidden="true">' + I('done') + '</span>';
      function swatchGroup(key, legend, list, style) {
        return '<fieldset class="field cr-group" data-group="' + key + '"><legend>' + esc(legend) + ' <span class="cr-selected" data-selof="' + key + '"></span></legend><div class="cr-swatches">' +
          list.map((c, i) => '<label class="cr-sw cr-sw-' + style + '"><input type="radio" name="cr-' + key + '" data-set="' + key + '" data-v="' + i + '">' +
            '<span class="face"><span class="chip" style="' + chipStyle(style, c) + '">' + tick + '</span><span class="nm">' + label(NAME[key](i)) + '</span></span></label>').join('') +
          '</div></fieldset>';
      }
      function chipStyle(style, c) {
        const a = Array.isArray(c) ? c : [c, c, c];
        return '--c0:' + a[0] + ';--c1:' + (a[1] || a[0]) + ';--c2:' + (a[2] || a[1] || a[0]);
      }
      function tileGroup(key, legend, vals, thumb) {
        return '<fieldset class="field cr-group" data-group="' + key + '"><legend>' + esc(legend) + ' <span class="cr-selected" data-selof="' + key + '"></span></legend><div class="cr-tiles cr-tiles-' + key + '">' +
          vals.map((v) => '<label class="cr-tile"><input type="radio" name="cr-' + key + '" data-set="' + key + '" data-v="' + esc(v) + '"><span class="face">' + tick +
            (thumb === 'port' ? '<canvas width="' + RB.portraits.S + '" height="' + RB.portraits.S + '" data-th="' + key + ':' + esc(v) + '"></canvas>' : '<canvas width="' + FIG_W + '" height="' + FIG_H + '" data-th="' + key + ':' + esc(v) + '"></canvas>') +
            '<span class="nm">' + label(NAME[key](v)) + '</span></span></label>').join('') + '</div></fieldset>';
      }
      function entryGroup(key, attr, legend, list, iconOf, sr) {
        return '<fieldset class="field cr-group" data-group="' + key + '"><legend' + (sr ? ' class="sr"' : '') + '>' + esc(legend) + '</legend><div class="cr-entries">' +
          list.map((b) => '<label class="cr-entry"><input type="radio" name="cr-' + key + '" ' + attr + '="' + key + '" data-v="' + b.id + '"><span class="face">' +
            '<span class="t">' + esc(b.en) + (b.jp ? ' <span class="jp">' + RB.ui.jhtml(b.jp) + '</span>' : '') + '</span>' +
            '<span class="d">' + esc(b.d) + '</span>' + (iconOf ? '<span class="ic">' + I(iconOf(b.id)) + '</span>' : '') + '</span></label>').join('') +
          '</div></fieldset>';
      }
      function head(id) {
        const S = STEPS[id];
        return '<h3 class="cr-h" id="cr-h" tabindex="-1">' + esc(S.en) + '</h3><p class="cr-lede">' + esc(S.lede) + '</p>';
      }
      // a page's heading in the book's display type, with its drawn mark (the Settings book's icons)
      const oi = (k) => (RB.ui.settings.optIcon ? RB.ui.settings.optIcon(k) : '');
      const major = (id, ic, t, focus) => '<h3 class="cr-major' + (focus ? ' cr-h' : '') + '"' + (id ? ' id="' + id + '"' : '') + (focus ? ' tabindex="-1"' : '') + '><span class="cr-hic" aria-hidden="true">' + ic + '</span><span>' + esc(t) + '</span></h3>';
      const sect = (key, ic, t, inner) => '<section class="cr-sect" data-sect="' + key + '"><h4 class="cr-sh"><span class="cr-shic" aria-hidden="true">' + oi(ic) + '</span>' + esc(t) + '</h4>' + inner + '</section>';
      const C = (k, legend, hint, x) => RB.ui.settings.choice(k, 'data-k', legend || LEARN_LOOK[k][0], LEARN_LOOK[k][1], hint === undefined ? LEARN_LOOK[k][2] : hint, x);
      const PAGES = {
        identity(d) {
          return head('identity') +
            '<div class="field cr-text"><label class="lab" for="nm">Name</label>' +
            '<input id="nm" type="text" maxlength="16" autocomplete="off" autocapitalize="words" spellcheck="false" enterkeyhint="next" required aria-describedby="nm-hint nm-err" placeholder="Your name" value="' + esc(d.p.name) + '">' +
            '<div class="hint" id="nm-hint">Used in English lines. Up to 16 characters.</div>' +
            '<div class="cr-err" id="nm-err" role="alert" hidden>' + I('warn') + '<span>Please enter a name (you can change your mind later only by starting over).</span></div></div>' +
            '<div class="field cr-text"><label class="lab" for="nj">Name in Japanese text</label>' +
            '<input id="nj" type="text" lang="ja" maxlength="12" autocomplete="off" spellcheck="false" enterkeyhint="done" aria-describedby="nj-hint" placeholder="e.g. アキ" value="' + esc(d.p.nameJp) + '">' +
            '<div class="hint" id="nj-hint">Kana, used in Japanese lines. It follows your name until you change it.</div>' +
            '<button type="button" class="pbtn quiet cr-suggest" data-a="suggest" hidden></button></div>' +
            chips('pron', 'data-set', 'Pronouns', PRON.map(([v, l]) => [v, esc(l)])) +
            '<div class="cr-custom" hidden><p class="hint">Your own pronouns, as they appear in English lines.</p><div class="cr-cps">' +
            [['they', 'Subject', 'they'], ['them', 'Object', 'them'], ['their', 'Possessive', 'their']].map(([k, l, ph]) =>
              '<div class="cr-cp"><label class="lab" for="cp-' + k + '">' + l + '</label><input id="cp-' + k + '" type="text" data-cp="' + k + '" maxlength="10" autocomplete="off" spellcheck="false" enterkeyhint="next" placeholder="' + ph + '" value="' + esc(d.p.custom[k]) + '"></div>').join('') +
            '</div><label class="cr-check"><input type="checkbox" data-cp="plural"' + (d.p.custom.plural ? ' checked' : '') + '><span class="face">Uses “are” (as in “they are”)</span></label></div>';
        },
        appearance() {
          return head('appearance') +
            swatchGroup('skin', 'Skin tone', RB.sprites.SKIN, 'skin') +
            tileGroup('hair', 'Hairstyle', RB.sprites.HAIRSTYLES, 'port') +
            swatchGroup('hairColor', 'Hair colour', RB.sprites.HAIR, 'hair') +
            swatchGroup('outfit', 'Clothing colour', RB.sprites.CLOTH, 'cloth') +
            tileGroup('shape', 'Clothing cut', SHAPES.map((s) => s[0]), 'fig') +
            '<fieldset class="field cr-group" data-group="acc"><legend>Accessories <span class="cr-selected" data-account></span></legend>' +
            '<div class="hint" id="acc-hint">Up to two. Choosing a third takes off the one you chose first.</div>' +
            '<div class="cr-tiles cr-tiles-acc">' + RB.sprites.ACCESSORIES.map((a) =>
              '<label class="cr-tile cr-acc"><input type="checkbox" data-acc="' + esc(a) + '" aria-describedby="acc-hint"><span class="face"><span class="box" aria-hidden="true">' + I('done') + '</span>' +
              '<canvas width="' + RB.portraits.S + '" height="' + RB.portraits.S + '" data-th="acc:' + esc(a) + '"></canvas><span class="nm">' + label(NAME.acc(a)) + '</span></span></label>').join('') +
            '</div><p class="cr-accnote" aria-live="polite"></p></fieldset>';
        },
        background() {
          return head('background') + entryGroup('bg', 'data-set', 'Background', BACKGROUNDS, (id) => BG_ICON[id] || 'pouch', true);
        },
        // the Learning spread (CW-1 §3.3-3.4): your Japanese on the left; how the journey plays on the right, every
        // decision in view, and only the reading preferences folded (the fold Robin liked, 2026-10-18)
        learnL() {
          return '<div class="sx-scope cr-learn">' + major('cr-h', oi('lvF'), 'Your Japanese', true) +
            '<p class="cr-lede">Choose the starting point that fits you. It never locks you out of the story.</p>' +
            RB.ui.settings.choice('profile', 'data-k', 'Your Japanese so far', PROFILES.map((p0) => [p0.id, p0.en, { i: 'lv' + p0.id, d: p0.d }]), null, { srLegend: true }) +
            '<button type="button" class="sx-slipbtn" data-a="place"><span class="sx-slipic">' + I('next') + '</span><span class="sx-slipt"><b>Not sure? Try a short placement</b>' +
            '<span>A few questions to suggest a level. Nothing is graded or saved.</span></span></button>' +
            C('kana') + '</div>';
        },
        learnR(d) {
          const word = d.prefs ? d.prefs.lightbulb !== false : st.lightbulb !== false;
          return '<div class="sx-scope cr-learn"><h3 class="cr-kicker" id="cr-h2">Your journey</h3>' +
            sect('input', 'hand', 'Answering', C('input', null, undefined, { srLegend: true })) +
            sect('assist', 'assist', 'Learning mistakes', RB.ui.settings.choice('assist', 'data-k', 'Learning mistakes', [['assist', 'Assisted', { i: 'assist', d: 'Learning mistakes cost nothing. Try again, with help if you like; the creature’s moves still matter.' }], ['normal', 'Standard', { i: 'capped', d: 'A wrong answer costs a little resolve, never much.' }]], null, { srLegend: true })) +
            sect('difficulty', 'f2', 'Tactical challenge', C('difficulty', 'Tactical challenge', 'How many creatures come, and how hard they press. Separate from your Japanese level.', { srLegend: true })) +
            '<details class="cr-more cr-readfold" data-sect="reading"><summary><span class="cr-more-ic">' + I('down') + '</span>' +
              '<span class="cr-more-tx"><span class="cr-more-t">Reading preferences</span><span class="cr-more-sum"></span></span>' +
              '<span class="cr-more-act" aria-hidden="true"><span class="cr-more-show">Show</span><span class="cr-more-hide">Hide</span></span></summary>' +
              '<div class="cr-more-body">' + C('lead') + C('secondary') + C('uiLang') + '</div></details>' +
            '<p class="note-slip cr-readnote">Readings over kanji are always shown. Word help adds a word’s reading and meaning. ' +
              (word ? 'Word help is on.' : 'Turn on Word help (H or the lightbulb).') + '</p></div>';
        },
        // the Summary (CW-1 §3.6-3.7): your traveller on the left, how the journey will play on the right, each with Edit
        sumL() {
          return '<div class="cr-sumhead">' + major('cr-h', I('companion'), 'Your traveller', true) + '</div>';
        },
        sumR(d) {
          const e = effective(d), L = e.learn, pr = d.prefs || st;
          const row = (key, t, v, edit, lbl) => '<div class="cr-row" data-row="' + key + '"><dt>' + esc(t) + '</dt><dd>' + v + '</dd>' +
            '<dd class="cr-ed"><button type="button" class="pbtn quiet cr-edit" ' + edit + ' aria-label="' + esc(lbl || 'Edit ' + t.toLowerCase()) + '">' + I('cr-edit') + '<span>Edit</span></button></dd></div>';
          const pf = PROFILES.find((x) => x.id === L.profile) || PROFILES[0];
          const kana = L.profile === 'F' ? ' · ' + ({ none: 'kana from the start', hira: 'you know hiragana', both: 'you know both kana' }[L.kana] || '') : '';
          const pick = (k) => { const x = LEARN_LOOK[k][1].find((c) => c[0] === L[k]); return x ? x[1] : L[k]; };
          const reading = readSum(L);
          const notes = toNote(L, pr);
          return '<div class="sx-scope cr-sumr">' + major('cr-h2', I('journey'), 'How your journey will play') +
            '<dl class="cr-rows">' +
            row('profile', 'Japanese', esc(pf.en + kana), 'data-edit="learning" data-group="profile"', 'Edit your Japanese') +
            row('input', 'Answering', esc(pick('input')), 'data-edit="learning" data-group="input"', 'Edit answering') +
            row('assist', 'Learning mistakes', L.assist === 'assist' ? 'Assisted: no learning-error battle cost' : 'Standard: a small, capped cost', 'data-edit="learning" data-group="assist"') +
            row('difficulty', 'Tactical challenge', esc(pick('difficulty')), 'data-edit="learning" data-group="difficulty"') +
            row('reading', 'Reading', esc(reading), 'data-edit="learning" data-group="reading"', 'Edit reading preferences') +
            '<div class="cr-row cr-row-sound" data-row="sound"><dt>Sound and voices</dt><dd>' + soundText(pr).map(esc).join('<br>') + '</dd><dd class="cr-ed"><button type="button" class="pbtn quiet cr-edit" data-a="sound">' + I('sound') + '<span>Sound and voices</span></button></dd></div>' +
            '</dl>' +
            '<p class="note-slip cr-reassure">' + esc(reassure(L)) + '</p>' +
            (notes.length ? '<div class="cr-tonote" role="note"><b>Selected settings to note</b><span>' + esc(notes.join('; ')) + '.</span></div>' : '') +
            '<button type="button" class="sx-slipbtn cr-moreset" data-a="more"><span class="sx-slipic">' + I('next') + '</span><span class="sx-slipt"><b>More journey settings</b>' +
            '<span>Guidance, word help, text speed, Suzu’s speech, stories, battles, display and keys. They apply when you begin.</span></span></button></div>';
        },
      };
      // what this journey will be, from the draft d (pure; Begin uses the same): the trimmed name, the Japanese name
      // (or, left empty, its suggestion, as it always was), the pronouns (custom ones completed), the learning choices
      function effective(d) {
        const q = d.p;
        const nameJp = (q.nameJp.trim() ? q.nameJp : romajiToKata(q.name) || q.name).trim();
        const c = q.custom;
        const they = (c.they || '').trim() || 'they', them = (c.them || '').trim() || 'them', their = (c.their || '').trim() || 'their';
        const custom = { they, them, their, theirs: their + 's', self: them + 'self', plural: !!c.plural };
        return {
          player: { name: q.name.trim(), nameJp, pron: q.pron === 'custom' ? custom : q.pron, bg: q.bg, look: RB.util.deepClone(q.look) },
          learn: Object.assign({}, d.o),
        };
      }
      function pronOf(pron) {
        if (typeof pron === 'string') return (PRON.find((x) => x[0] === pron) || PRON[0])[1];
        return pron.they + '/' + pron.them + (pron.plural ? ' (uses “are”)' : '');
      }
      // one line beside the pictures: the clothes and what is worn with them (the pictures show the rest)
      function lookText(look) {
        const acc = look.acc.map((a) => NAME.acc(a).toLowerCase());
        return NAME.shape(look.shape) + ' in ' + NAME.outfit(look.outfit).toLowerCase() + (acc.length ? ', with ' + acc.join(' and ') : '');
      }
      // the sound as chosen, and what this copy can play (a choice is never changed for want of it)
      function soundText(pr) {
        const v = pr.voice || {};
        const mode = ['prepared', 'device', 'none'].indexOf(v.mode) >= 0 ? v.mode : 'prepared';
        const lvl = Math.round(((pr.vol && pr.vol.master != null) ? pr.vol.master : 1) * 100);
        const vb = RB.voicebank;
        const can = !!(vb && vb.configured && vb.configured() && vb.active && vb.active());
        const out = [pr.muted ? 'Muted' : 'Sound on, overall ' + lvl + '%'];
        if (mode === 'prepared') {
          out.push('Recorded voices' + (can ? '' : ' (none in this copy; your device’s voice instead)'));
          out.push(v.player === 'A' || v.player === 'B' ? 'Your lines: Voice ' + v.player + ', ' + (v.pitch === 'low' ? 'lower' : 'higher') : 'Your lines: silent');
        } else out.push(mode === 'device' ? 'Your device’s voice' : 'No voice');
        return out;
      }
      function reassure(L) {
        const first = L.profile === 'F' ? (L.kana === 'none' ? 'New characters come with a model and help.' : 'Kana you know is not taught again, and every character can still be looked up.')
          : 'Challenges are set for ' + ((PROFILES.find((x) => x.id === L.profile) || PROFILES[0]).en) + '; the level can be changed at any time in Settings.';
        return first + ' ' + (L.assist === 'assist' ? 'Learning mistakes have no battle cost.' : 'A learning mistake costs a little resolve, never much.');
      }
      // choices worth seeing once more before setting out: not errors, perhaps exactly what was meant
      function toNote(L, pr) {
        const n = [];
        if (L.lead === 'ja') n.push('dialogue leads in Japanese');
        if (L.secondary !== 'always') n.push(L.secondary === 'tap' ? 'the other language shows when you tap a line' : 'the other language is hidden');
        if (L.uiLang === 'ja') n.push('menus are in Japanese');
        if (pr.questGuide === 'off') n.push('quest markers and hints are off');
        if (pr.muted) n.push('all sound is muted');
        return n;
      }
      function readSum(L) {
        const pick = (k) => { const x = LEARN_LOOK[k][1].find((c) => c[0] === L[k]); return x ? x[1] : L[k]; };
        return pick('lead') + ' first · the other ' + pick('secondary').toLowerCase() + ' · ' + pick('uiLang') + ' menus';
      }
      // the two pages of a step, as markup: [left, right], each marked with its side and its step
      function spread(id, d) {
        const m = (h, side) => h.replace(/^<(\w+) class="/, '<$1 class="cr-' + side + ' cr-s-' + id + ' ');
        if (id === 'learning') return [m('<section class="leaf cr-page cr-lp" aria-labelledby="cr-h">' + PAGES.learnL(d) + '</section>', 'l'), m('<section class="leaf cr-page cr-rp" aria-labelledby="cr-h2">' + PAGES.learnR(d) + '</section>', 'r')];
        if (id === 'summary') return [sheetHtml('cr-sumsheet cr-s-summary').replace('<div class="cr-kick" aria-hidden="true">Your traveller</div>', PAGES.sumL(d)), m('<section class="leaf cr-page cr-rp cr-sumpage" aria-labelledby="cr-h2">' + PAGES.sumR(d) + '</section>', 'r')];
        return [sheetHtml('cr-s-' + id), m('<section class="leaf cr-page cr-rp" aria-labelledby="cr-h">' + PAGES[id](d) + '</section>', 'r')];
      }

      // -- draft → page (for the live pages and for printed copies alike) -------------------------------------------
      function pronText(d) { return pronOf(effective(d).player.pron); }
      function drawFig(root, d) {
        const fc = root.querySelector('.cr-fig canvas');
        if (!fc) return;
        const c = fc.getContext('2d');
        c.clearRect(0, 0, fc.width, fc.height);
        fig(c, d.p.look, d.dir, V.blink && d.dir !== 'up' && root === body ? 3 : 0);
        root.querySelector('.cr-fig').setAttribute('data-dir', d.dir);
      }
      function paint(root, d) {
        const pc = root.querySelector('.cr-port canvas');
        if (pc) { const c = pc.getContext('2d'); c.clearRect(0, 0, pc.width, pc.height); c.drawImage(cut(d.p.look, 'smile'), 0, 0); }
        drawFig(root, d);
        root.querySelectorAll('canvas[data-th]').forEach((cv) => {
          const [k, v] = cv.getAttribute('data-th').split(':');
          const c = cv.getContext('2d');
          c.clearRect(0, 0, cv.width, cv.height);
          if (k === 'hair') c.drawImage(cut(Object.assign({}, d.p.look, { hair: v, acc: [] }), 'neutral'), 0, 0);
          else if (k === 'acc') c.drawImage(cut(Object.assign({}, d.p.look, { acc: [v] }), 'neutral'), 0, 0);
          else if (k === 'shape') fig(c, Object.assign({}, d.p.look, { shape: v, acc: [] }), 'down', 0);
        });
      }
      function fill(root, d) {
        const q = d.p;
        root.querySelectorAll('input[type=radio][data-set]').forEach((inp) => {
          const k = inp.getAttribute('data-set');
          const cur = k === 'pron' ? q.pron : k === 'bg' ? q.bg : q.look[k];
          inp.checked = String(cur) === inp.getAttribute('data-v');
        });
        root.querySelectorAll('input[type=radio][data-k]').forEach((inp) => { inp.checked = String(d.o[inp.getAttribute('data-k')]) === inp.getAttribute('data-v'); });
        root.querySelectorAll('input[data-acc]').forEach((inp) => { inp.checked = q.look.acc.includes(inp.getAttribute('data-acc')); });
        const cu = root.querySelector('.cr-custom');
        if (cu) cu.hidden = q.pron !== 'custom';
        const kg = root.querySelector('[data-group=kana]');
        if (kg) kg.hidden = d.o.profile !== 'F';
        const ms = root.querySelector('.cr-more-sum');
        if (ms) ms.textContent = readSum(d.o);
        root.querySelectorAll('[data-selof]').forEach((el) => { const k = el.getAttribute('data-selof'); el.textContent = '· Selected: ' + NAME[k](q.look[k]); });
        const ac = root.querySelector('[data-account]');
        if (ac) ac.textContent = '· ' + q.look.acc.length + ' of ' + MAX_ACC + ' chosen';
        const an = root.querySelector('.cr-accnote');
        if (an) an.textContent = d.accNote || '';
        const b = root.querySelector('.cr-suggest');
        if (b) {
          const sug = romajiToKata(q.name);
          const show = d.jpEdited && sug && sug !== q.nameJp;
          b.hidden = !show;
          if (show) b.innerHTML = 'Use the suggestion: <span lang="ja">' + esc(sug) + '</span>';
        }
        // the traveller's sheet: the names (on the Summary, as Begin will use them), the background, the record
        const sh = root.querySelector('.cr-sheet');
        if (sh) {
          const sum = sh.classList.contains('cr-sumsheet');
          const e = effective(d);
          const nm = sum ? e.player.name : q.name.trim(), nj = sum ? e.player.nameJp : q.nameJp.trim();
          const bg = BACKGROUNDS.find((x) => x.id === q.bg) || BACKGROUNDS[0];
          sh.querySelector('.cr-nm').innerHTML = nm ? '<span class="en-n">' + esc(nm) + '</span>' + (nj ? ' <span class="jp-n" lang="ja">' + esc(nj) + '</span>' : '') : '<span class="cr-empty">No name yet</span>';
          sh.querySelector('.cr-sub').textContent = bg.en;
          let rows;
          if (sum) {
            const g = (key, t, v, lbl) => '<div class="cr-sg" data-sg="' + key + '"><dt>' + esc(t) + '</dt><dd>' + v + '</dd><dd class="cr-ed"><button type="button" class="pbtn quiet cr-edit" data-edit="' + key + '" aria-label="' + esc(lbl) + '">' + I('cr-edit') + '<span>Edit</span></button></dd></div>';
            rows = g('identity', 'Identity', esc(pronText(d)), 'Edit identity') +
              g('appearance', 'Appearance', esc(lookText(q.look)), 'Edit appearance') +
              g('background', 'Background', '<b>' + esc(bg.en) + '</b> <span class="cr-bgd">' + esc(bg.d) + '</span>', 'Edit background');
          } else {
            const r = [['Name', nm ? esc(nm) : '<span class="cr-empty">—</span>'], ['In Japanese', nj ? '<span lang="ja">' + esc(nj) + '</span>' : '<span class="cr-empty">—</span>'], ['Pronouns', esc(pronText(d))]];
            if (has('background') || has('identity')) r.push(['Background', esc(bg.en)]);
            rows = r.map(([k, v]) => '<div><dt>' + k + '</dt><dd>' + v + '</dd></div>').join('');
          }
          sh.querySelector('.cr-reg').innerHTML = rows;
          if (sum) sh.querySelector('.cr-note').textContent = 'Check your traveller before setting out. Learning and presentation settings can still be changed during play.';
        }
      }
      // the live spread follows the draft
      function sync() { fill(body, D()); }
      function routeHtml() {
        if (steps.length < 2) return '';
        return '<nav class="cr-route" aria-label="Steps"><ol>' + steps.map((id, i) => {
          const cls = i === V.i ? 'cur' : i <= V.max ? 'done' : 'todo';
          const lbl = STEPS[id].short || STEPS[id].en;
          return '<li class="' + cls + '"><button type="button" data-step="' + i + '"' + (i > V.max ? ' disabled' : '') + (i === V.i ? ' aria-current="step"' : '') + '>' +
            '<span class="dot" aria-hidden="true">' + (cls === 'done' ? I('done') : String(i + 1)) + '</span><span class="lbl">' + esc(lbl) +
            (cls === 'done' ? '<span class="sr"> (visited)</span>' : '') + '</span></button></li>';
        }).join('') + '</ol><p class="cr-route-cur" aria-hidden="true"><span class="n">Step ' + (V.i + 1) + ' of ' + steps.length + ' · </span>' + esc(STEPS[steps[V.i]].en) + '</p></nav>';
      }

      // -- the live spread ---------------------------------------------------------------------------------------------
      const leaves = () => Array.from(body.querySelectorAll(':scope > .cr-l, :scope > .cr-r'));
      // what a step looked like when it was left: its pages' scroll, and its fold
      function remember() {
        const id = steps[V.i];
        const [l, r] = leaves();
        if (!l) return;
        const f = body.querySelector('details.cr-readfold');
        V.per[id] = { l: l.scrollTop, r: r ? r.scrollTop : 0, fold: f ? f.open : (V.per[id] && V.per[id].fold) || false };
      }
      // mount step V.i from the draft: the pages, their values and drawings, the route, the title, the footer
      function mount(focus) {
        const id = steps[V.i];
        const S = STEPS[id];
        fr.setTitle(esc(S.title), steps.length > 1 ? 'Step ' + (V.i + 1) + ' of ' + steps.length : '');
        fr.tabslot.innerHTML = routeHtml();
        fr.el.setAttribute('data-step', id);
        const [l, r] = spread(id, D());
        body.className = 'cr-body cr-on-' + id;
        body.innerHTML = l + r + corners();
        // Japanese words inside choice labels are read through the label; keep Tab on the controls
        body.querySelectorAll('label .jt').forEach((j) => { j.tabIndex = -1; });
        const per = V.per[id] || {};
        const f = body.querySelector('details.cr-readfold');
        if (f) f.open = !!per.fold;
        sync();
        paint(body, D());
        const [L, R] = leaves();
        if (L) L.scrollTop = per.l || 0;
        if (R) R.scrollTop = per.r || 0;
        blinking(!!body.querySelector('.cr-fig'));
        foot();
        if (typeof focus === 'function') focus();
        else if (focus === 'keep' && document.activeElement && fr.foot.contains(document.activeElement) && document.activeElement.offsetParent && !document.activeElement.hidden && !document.activeElement.classList.contains('gone')) { /* focus stays on the foot */ }
        else if (focus) { const h = body.querySelector('#cr-h'); h && h.focus({ preventScroll: true }); }
        if (steps.length > 1) say('Step ' + (V.i + 1) + ' of ' + steps.length + ': ' + S.en);
      }
      // the folded corners at the foot of the pages (a pointer's second way to turn; the buttons stay the way): the left
      // page's back a step, the right page's on (or back to the Summary during an edit); none to Begin
      function corners() {
        const nm = (k) => STEPS[steps[k]].short || STEPS[steps[k]].en;
        const prv = V.i > 0 ? 'Back: ' + nm(V.i - 1) : null;
        const nxt = V.i < steps.length - 1 ? (V.edit ? 'Return to summary' : 'Next: ' + nm(V.i + 1)) : null;
        const c = (side, a, t) => '<button type="button" class="cr-corner ' + side + '" data-a="' + a + '" tabindex="-1" aria-hidden="true" title="' + esc(t) + '"></button>';
        return (prv ? c('l', 'cback', prv) : '') + (nxt ? c('r', 'cnext', nxt) : '');
      }
      function foot() {
        const last = V.i === steps.length - 1;
        const ret = !!V.edit && !last;
        const back = fr.foot.querySelector('.cr-back'), nx = fr.foot.querySelector('.cr-next'), go = fr.foot.querySelector('.cr-go'), rt = fr.foot.querySelector('.cr-ret');
        // (a focused button that is about to be hidden hands focus to the one that replaces it)
        const had = document.activeElement;
        back.classList.toggle('gone', V.i === 0);
        back.setAttribute('aria-hidden', V.i === 0 ? 'true' : 'false');
        back.tabIndex = V.i === 0 ? -1 : 0;
        nx.hidden = last || ret;
        rt.hidden = !ret;
        go.hidden = !last;
        if (!last) nx.querySelector('.to').textContent = ': ' + (STEPS[steps[V.i + 1]].short || STEPS[steps[V.i + 1]].en);
        if (had && (had === nx || had === rt || had === go) && had.hidden) { const now = fr.foot.querySelector('.cr-primary:not([hidden])'); now && now.focus({ preventScroll: true }); }
      }
      function nameOk() {
        if (!has('identity') || p.name.trim()) return true;
        return false;
      }
      // the name is needed: show the real error on the Identity page and put focus in the field
      function nameError() {
        const er = sel('#nm-err'), nm = sel('#nm');
        if (er) { er.hidden = true; void er.offsetWidth; er.hidden = false; }
        if (nm) { nm.setAttribute('aria-invalid', 'true'); nm.focus(); }
      }

      // -- moving between steps: one guarded move at a time ------------------------------------------------------------
      // One destination is accepted and the draft is frozen for its printed pages; anything pressed while it turns is
      // ignored (Escape skips to it). The destination alone is mounted, once; nothing on a page passed on the way runs.
      const reduce = () => !!(RB.game.reducedMotion && RB.game.reducedMotion()) || document.body.classList.contains('book-flat') ||
        (typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches);
      const wideNow = () => typeof matchMedia !== 'undefined' && matchMedia('(min-width: 760px) and (min-height: 540px)').matches;
      const canTurn = () => !!RB.ui.leafTurn && !reduce() && wideNow() && typeof Element !== 'undefined' && !!Element.prototype.animate && !!body.children.length;
      // a printed page of step i, side 'l' or 'r': the live page as it stands for the step being left, else printed
      // from the draft frozen for this move, at the scroll it was left at
      function printed(frozen, from) {
        const live = leaves();
        const made = {};
        return (i, side) => {
          if (i === from) return RB.ui.leafTurn.print(live[side === 'l' ? 0 : 1], live[side === 'l' ? 0 : 1].scrollTop);
          if (!made[i]) {
            const id = steps[i];
            const t = document.createElement('div');
            t.className = 'cr-body cr-on-' + id;
            t.innerHTML = spread(id, frozen).join('');
            const f = t.querySelector('details.cr-readfold');
            if (f) f.open = !!(V.per[id] && V.per[id].fold);
            fill(t, frozen);
            paint(t, frozen);
            made[i] = t;
          }
          const el = made[i].children[side === 'l' ? 0 : 1];
          const per = V.per[steps[i]] || {};
          return RB.ui.leafTurn.print(el, side === 'l' ? per.l || 0 : per.r || 0);
        };
      }
      async function navigate(i, how, after) {
        if (V.closed || V.done || V.nav !== 'idle' || V.editor) return false;
        if (i < 0 || i >= steps.length || i === V.i) return false;
        const from = V.i;
        if (i > from && i > steps.indexOf('identity') && !nameOk()) {
          // (forward past Identity needs the name: show its error there)
          if (from !== steps.indexOf('identity')) return navigate(steps.indexOf('identity'), how, nameError);
          nameError();
          return false;
        }
        const token = ++V.token;
        V.nav = 'preparing';
        remember();
        const frozen = { p: RB.util.deepClone(p), o: Object.assign({}, o), prefs, accNote: '', jpEdited: V.jpEdited, dir: V.dir };
        const n = Math.abs(i - from);
        if (RB.audio) RB.audio.sfx('page'); // one page sound for the whole move, however many leaves
        let outcome = 'direct';
        // focus waits on the book while it turns (never on a printed page)
        if (document.activeElement && body.contains(document.activeElement)) { fr.box.tabIndex = -1; fr.box.focus({ preventScroll: true }); }
        try {
          if (canTurn()) {
            V.nav = 'turning';
            fr.el.classList.add('cr-turning');
            const busy = fr.foot.querySelector('.cr-busy');
            if (n > 1) busy.textContent = (i < from ? 'Turning back ' : 'Turning ') + n + ' pages…';
            body.classList.add('cr-under');
            V.turn = RB.ui.leafTurn.run({ stage, from, to: i, page: printed(frozen, from), live: () => !V.closed && token === V.token, reduce });
            outcome = await V.turn.done;
          }
        } catch (e) { outcome = 'failed'; }
        finally {
          V.turn = null;
          if (RB.ui.leafTurn) RB.ui.leafTurn.clear(stage);
          fr.el.classList.remove('cr-turning');
          body.classList.remove('cr-under');
          fr.foot.querySelector('.cr-busy').textContent = '';
          fr.box.removeAttribute('tabindex');
          V.nav = 'idle';
          if (!V.closed && token === V.token) {
            V.i = i;
            V.max = Math.max(V.max, i);
            V.accNote = '';
            if (steps[i] === 'summary') V.edit = null;
            mount(after || (how === 'foot' ? 'keep' : true));
          }
        }
        V.lastTurn = { from, to: i, outcome };
        return true;
      }
      function finish() {
        if (V.done || V.closed || V.nav !== 'idle' || V.editor) return;
        if (!nameOk()) { navigate(steps.indexOf('identity'), 'key', nameError); return; }
        V.done = true; // once: a second press, a held key or a late click finds it done
        const e = effective(D());
        p.nameJp = e.player.nameJp;
        close();
        resolve(full ? { player: e.player, learn: e.learn, prefs, changed, owned } : { player: e.player, learn: e.learn });
      }
      function close() {
        V.closed = true;
        if (V.turn) V.turn.skip();
        clearInterval(blinkT);
        if (RB.ui.leafTurn) RB.ui.leafTurn.clear(stage);
        if (vv) { vv.removeEventListener('resize', fit); vv.removeEventListener('scroll', fit); }
        window.removeEventListener('resize', fit);
        if (active === dispose) active = null;
        RB.ui.popLayer(layer);
      }
      // a teardown without Begin (a host leaving the screen; the tests): what the editor previewed on the live settings
      // goes back to what it was, nothing is saved, and the setup resolves null
      function dispose() {
        if (V.closed) return;
        if (full && RB.ui.settings.restorePreview) RB.ui.settings.restorePreview(owned);
        if (RB.ui.settings.isOpen && RB.ui.settings.isOpen() && RB.ui.settings.drafting && RB.ui.settings.drafting()) RB.ui.settings.close();
        close();
        resolve(null);
      }
      active = dispose;

      // -- changes ---------------------------------------------------------------------------------------------------
      function setLook(k, v) {
        if (k === 'pron') p.pron = v;
        else if (k === 'bg') p.bg = v;
        else if (k === 'hair' || k === 'shape') p.look[k] = v;
        else p.look[k] = +v;
        sync();
        if (k !== 'pron' && k !== 'bg') paint(body, D());
      }
      // (a direct choice of level keeps its established effects: past Foundations the kana are known; Advanced reads
      // Japanese first, the English on a tap. The placement's suggestion is applied as it always was, below.)
      function setLearn(k, v) {
        o[k] = v;
        if (k === 'profile' && o.profile !== 'F') o.kana = 'both';
        if (k === 'profile' && o.profile === 'A') { o.lead = 'ja'; o.secondary = 'tap'; }
        sync();
      }
      function toggleAcc(a, on) {
        const acc = p.look.acc;
        const i = acc.indexOf(a);
        if (!on) { if (i >= 0) acc.splice(i, 1); V.accNote = NAME.acc(a) + ' taken off. ' + acc.length + ' of ' + MAX_ACC + ' chosen.'; }
        else {
          if (i < 0) acc.push(a);
          if (acc.length > MAX_ACC) { const gone = acc.shift(); V.accNote = NAME.acc(a) + ' added; ' + NAME.acc(gone) + ' taken off to keep to two.'; }
          else V.accNote = NAME.acc(a) + ' added. ' + acc.length + ' of ' + MAX_ACC + ' chosen.';
        }
        sync();
        paint(body, D());
      }
      // the Summary's editor shares the learning step's reading choices and level; the rest are the draft's own
      const SHARED = ['lead', 'secondary', 'uiLang', 'input'];
      function toPrefs() {
        if (!prefs) return;
        SHARED.forEach((k) => { prefs[k] = o[k]; });
        if (!changed.has('spacing')) prefs.spacing = o.profile === 'F' || o.profile === 'E';
      }
      async function editor(tab, btn) {
        if (!full || V.editor || V.nav !== 'idle' || V.closed || V.done) return;
        V.editor = true;
        toPrefs();
        const key = btn && btn.getAttribute('data-a');
        try {
          await RB.ui.settings.editDraft({
            preferences: prefs, learning: o, owned, initialTab: tab, name: effective(D()).player.name,
            onChange: (path) => { changed.add(path); if (SHARED.indexOf(path) >= 0) o[path] = prefs[path]; },
            setLearn: (k, v) => { setLearn(k, v); toPrefs(); },
          });
        } finally { V.editor = false; }
        if (V.closed) return;
        // the Summary again, from the edited draft, and focus back on what opened the editor
        remember();
        mount(() => { const b = key && sel('[data-a="' + key + '"]'); if (b) b.focus({ preventScroll: true }); });
      }
      // Summary › Edit: back through the pages to the group, the group shown and focused; the primary button then
      // returns to the Summary
      function edit(step, group) {
        const i = steps.indexOf(step);
        if (i < 0) return;
        V.edit = { step, group };
        if (group === 'reading') V.per.learning = Object.assign({}, V.per.learning || {}, { fold: true });
        navigate(i, 'edit', () => {
          const g = group === 'reading' ? sel('details.cr-readfold') : group ? sel('[data-group="' + group + '"]') : null;
          if (g) {
            g.scrollIntoView({ block: 'start' });
            const t = group === 'reading' ? g.querySelector('summary') : g.querySelector('input:checked') || g.querySelector('input');
            if (t) t.focus({ preventScroll: true });
          } else if (step === 'identity') { const nm = sel('#nm'); nm && nm.focus({ preventScroll: true }); }
          else { const h = sel('#cr-h'); h && h.focus({ preventScroll: true }); }
        });
      }
      function backToSummary() {
        const e = V.edit;
        navigate(steps.indexOf('summary'), 'return', () => {
          const b = e && (e.group ? sel('[data-row="' + e.group + '"] .cr-edit') : sel('[data-sg="' + e.step + '"] .cr-edit'));
          if (b) { b.scrollIntoView({ block: 'nearest' }); b.focus({ preventScroll: true }); }
          else { const h = sel('#cr-h'); h && h.focus({ preventScroll: true }); }
        });
      }

      body.addEventListener('input', (e) => {
        const t = e.target;
        if (t.id === 'nm') {
          p.name = t.value.slice(0, 16);
          if (!V.jpEdited) { p.nameJp = romajiToKata(p.name); const nj = sel('#nj'); if (nj) nj.value = p.nameJp; }
          if (p.name.trim()) { const er = sel('#nm-err'); if (er) er.hidden = true; t.removeAttribute('aria-invalid'); }
        } else if (t.id === 'nj') { V.jpEdited = true; p.nameJp = t.value.slice(0, 12); }
        else if (t.type === 'text' && t.hasAttribute('data-cp')) p.custom[t.getAttribute('data-cp')] = t.value.trim().slice(0, 10);
        else return;
        sync();
      });
      body.addEventListener('change', (e) => {
        const t = e.target;
        if (t.type === 'radio' && t.hasAttribute('data-set')) setLook(t.getAttribute('data-set'), t.getAttribute('data-v'));
        else if (t.type === 'radio' && t.hasAttribute('data-k')) setLearn(t.getAttribute('data-k'), t.getAttribute('data-v'));
        else if (t.hasAttribute('data-acc')) toggleAcc(t.getAttribute('data-acc'), t.checked);
        else if (t.type === 'checkbox' && t.getAttribute('data-cp') === 'plural') { p.custom.plural = t.checked; sync(); }
        else return;
        RB.audio && RB.audio.sfx('cursor');
      });
      // the reading fold remembers itself (it is shown again open after an edit, or a page turn)
      body.addEventListener('toggle', (e) => { if (e.target.matches && e.target.matches('details.cr-readfold')) remember(); }, true);
      body.addEventListener('keydown', (e) => {
        // Enter in a text field moves on to the next field, never through the whole flow (and never while composing)
        if (e.key !== 'Enter' || e.isComposing || e.keyCode === 229 || e.target.type !== 'text') return;
        e.preventDefault();
        const fields = Array.from(body.querySelectorAll('input[type=text]')).filter((x) => x.offsetParent !== null);
        const i = fields.indexOf(e.target);
        if (i >= 0 && i < fields.length - 1) fields[i + 1].focus();
        else { e.target.blur(); const nx = fr.foot.querySelector('.cr-primary:not([hidden])'); nx && nx.focus(); }
      });
      body.addEventListener('click', async (e) => {
        const b = e.target.closest('button[data-a],button[data-edit]');
        if (!b || V.nav !== 'idle') return;
        if (b.hasAttribute('data-edit')) { RB.audio && RB.audio.sfx('cursor'); edit(b.getAttribute('data-edit'), b.getAttribute('data-group')); return; }
        const a = b.getAttribute('data-a');
        const DIRS = ['down', 'left', 'up', 'right'];
        if (a === 'suggest') {
          V.jpEdited = false;
          p.nameJp = romajiToKata(p.name);
          const nj = sel('#nj'); if (nj) { nj.value = p.nameJp; nj.focus(); }
          sync();
        } else if (a === 'place') {
          RB.audio && RB.audio.sfx('cursor');
          const lp = body.firstElementChild, top = lp ? lp.scrollTop : 0;
          const r = await placement();
          if (V.closed) return;
          if (r) { o.profile = r.profile; if (r.kana) o.kana = r.kana; }
          sync();
          if (lp && lp.isConnected) lp.scrollTop = top;
          const pb = sel('[data-a=place]'); pb && pb.focus({ preventScroll: true });
          if (r) say('Japanese level set to ' + (PROFILES.find((x) => x.id === o.profile) || PROFILES[0]).en + '.');
        } else if (a === 'turnl' || a === 'turnr') {
          V.dir = DIRS[(DIRS.indexOf(V.dir) + (a === 'turnl' ? 1 : 3)) % 4];
          drawFig(body, D());
          RB.audio && RB.audio.sfx('cursor');
        } else if (a === 'expand') {
          const sheet = b.closest('.cr-sheet');
          const on = !sheet.classList.contains('expanded');
          sheet.classList.toggle('expanded', on);
          b.setAttribute('aria-expanded', on ? 'true' : 'false');
          b.innerHTML = I(on ? 'cr-collapse' : 'cr-expand') + '<span class="tx">' + (on ? 'Close view' : 'Inspect') + '</span>';
          RB.audio && RB.audio.sfx('page');
        } else if (a === 'cback' || a === 'cnext') {
          if (e.detail > 1) return;
          if (a === 'cback') navigate(V.i - 1, 'corner');
          else if (V.edit) backToSummary();
          else navigate(V.i + 1, 'corner');
        } else if (a === 'sound') editor('audio', b);
        else if (a === 'more') editor('reading', b);
      });
      fr.foot.addEventListener('click', (e) => {
        const b = e.target.closest('button[data-a]');
        if (!b || b.classList.contains('gone') || b.hidden) return;
        // a double click on Next must not also press the button that replaces it
        if (e.detail > 1) return;
        const a = b.getAttribute('data-a');
        if (a === 'back') navigate(V.i - 1, 'foot');
        else if (a === 'next') navigate(V.i + 1, 'foot');
        else if (a === 'return') backToSummary();
        else if (a === 'go') { RB.audio && RB.audio.sfx('cursor'); finish(); }
      });
      // a held Enter or Space repeats: it never presses a step's button again (one press, one move)
      fr.el.addEventListener('keydown', (e) => {
        if (e.repeat && (e.key === 'Enter' || e.key === ' ') && e.target && e.target.closest && e.target.closest('button')) { e.preventDefault(); e.stopPropagation(); }
      }, true);
      fr.tabslot.addEventListener('click', (e) => {
        const b = e.target.closest('button[data-step]');
        if (!b || b.disabled) return;
        navigate(+b.getAttribute('data-step'), 'route');
      });
      // Escape: during a turn, straight to where it is going; otherwise back one step, as before (never out of the
      // first step, never Begin)
      layer.onCancel = () => {
        if (V.turn) { V.turn.skip(); return; }
        if (V.nav === 'idle' && V.i > 0) navigate(V.i - 1, 'key');
      };
      layer.onAction = (a, e) => (a === 'menu' ? tabKey(fr.el, e) : false);

      // -- software keyboard -----------------------------------------------------------------
      // While a text field is focused and the visual viewport is much shorter than
      // the layout viewport (a software keyboard, not pinch zoom), the folio is
      // fitted to the visible area so the field and Next stay in view.
      const vv = window.visualViewport;
      let fitQ = 0;
      function fit() {
        if (fitQ) return;
        fitQ = requestAnimationFrame(() => {
          fitQ = 0;
          if (V.closed) return;
          const a = document.activeElement;
          const typing = !!(a && fr.el.contains(a) && a.tagName === 'INPUT' && a.type === 'text');
          const full0 = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
          const zoomed = vv ? vv.scale > 1.05 : false;
          const h = vv ? vv.height : full0;
          const kb = typing && !zoomed && (full0 - h > 90);
          fr.scrim.classList.toggle('cr-kb', kb);
          if (kb) { fr.scrim.style.top = Math.round(vv.offsetTop) + 'px'; fr.scrim.style.height = Math.round(h) + 'px'; fr.scrim.style.bottom = 'auto'; }
          else { fr.scrim.style.top = ''; fr.scrim.style.height = ''; fr.scrim.style.bottom = ''; }
          const pg = typing && a.closest('.leaf, .cr-sheet');
          if (pg) {
            const pr = pg.getBoundingClientRect(), r = a.getBoundingClientRect();
            const er = a.id === 'nm' ? sel('#nm-err:not([hidden])') : null;
            const bottom = er ? Math.max(r.bottom, er.getBoundingClientRect().bottom) : r.bottom;
            if (bottom > pr.bottom - 8) pg.scrollTop += bottom - pr.bottom + 8;
            else if (r.top < pr.top + 8) pg.scrollTop -= pr.top + 8 - r.top;
          }
        });
      }
      if (vv) { vv.addEventListener('resize', fit); vv.addEventListener('scroll', fit); }
      window.addEventListener('resize', fit);
      fr.el.addEventListener('focusin', fit);
      fr.el.addEventListener('focusout', () => setTimeout(fit, 0));

      // a blink now and then, while the traveller is on the page; never with reduced motion
      let blinkT = 0;
      function blinking(on) {
        if (!on) { clearInterval(blinkT); blinkT = 0; return; }
        if (blinkT) return;
        blinkT = setInterval(() => {
          if (V.closed || V.nav !== 'idle' || RB.game.reducedMotion() || document.hidden || !sel('.cr-fig')) return;
          V.blink = true; drawFig(body, D());
          setTimeout(() => { V.blink = false; if (!V.closed && sel('.cr-fig')) drawFig(body, D()); }, 150);
        }, 3600);
      }

      mount(false);
      RB.ui.pushLayer(layer);
      const fine = typeof matchMedia !== 'undefined' && matchMedia('(pointer: fine)').matches;
      setTimeout(() => {
        const nm = sel('#nm');
        if (nm && fine) nm.focus({ preventScroll: true });
        else { const h = sel('#cr-h'); h && h.focus({ preventScroll: true }); }
      }, 0);
    });
  }
  // the open setup's teardown, for a host leaving the screen (and the tests): nothing is saved
  function dispose() { if (active) active(); }

  // Kept for callers of the former two-panel flow: no Summary, no fifth step.
  function creation() { return wizard(['identity', 'appearance', 'background']).then((r) => r && r.player); }
  function setup() { return wizard(['learning']).then((r) => r && r.learn); }

  // Optional placement: nothing is asked before an "I don't know yet" option is
  // available; it stops as soon as two items are unknown.
  const PLACE = [
    { lv: 'hira', q: 'Which reading is correct for this word?', jp: 'さかな', opts: ['sakana', 'sakama', 'kisana'], a: 0 },
    { lv: 'hira', q: 'Which reading is correct?', jp: 'きって', opts: ['kitte', 'kite', 'kitsute'], a: 0 },
    { lv: 'kata', q: 'Which reading is correct?', jp: 'ランプ', opts: ['ranpu', 'sanpu', 'ranbu'], a: 0 },
    { lv: 'E', q: 'What does this mean?', jp: '{雨|あめ} が {降|ふ}って います 。', opts: ['It is raining.', 'The rain stopped.', 'It will rain tomorrow.'], a: 0 },
    { lv: 'E', q: 'Choose the particle: パン ＿ {食|た}べます。', jp: 'パン ＿ {食|た}べます 。', opts: ['を', 'が', 'へ'], a: 0 },
    { lv: 'I', q: 'Why is the speaker staying home?', jp: '{雪|ゆき} が {降|ふ}った ので 、 {今日|きょう} は {家|いえ} に います 。', opts: ['Because it snowed.', 'Because they are tired.', 'Because the road is closed for a festival.'], a: 0 },
    { lv: 'I', q: 'What will the speaker do?', jp: '{手紙|てがみ} が {届|とど}いたら 、 すぐ {返事|へんじ} を {書|か}きます 。', opts: ['Reply once the letter arrives.', 'Write a letter before it arrives.', 'Wait a week before replying.'], a: 0 },
    { lv: 'A', q: 'What is the speaker implying?', jp: '{行|い}けない こと も ない けど …… 。', opts: ['They could go, but are reluctant.', 'They definitely cannot go.', 'They are eager to go.'], a: 0 },
    { lv: 'A', q: 'Which best paraphrases the sentence?', jp: '{約束|やくそく} した {以上|いじょう} 、 {守|まも}らざる を {得|え}ない 。', opts: ['Having promised, I have no choice but to keep it.', 'I promised, but I may not keep it.', 'I will promise once I can keep it.'], a: 0 },
  ];
  function placement() {
    return new Promise((resolve) => {
      let i = 0, unknown = 0, done = false, result = null;
      const right = { hira: 0, kata: 0, E: 0, I: 0, A: 0 };
      const order = PLACE.map((q) => { const idx = RB.util.rng(RB.util.hashStr(q.jp)).shuffle([0, 1, 2]); return Object.assign({}, q, { order: idx }); });
      const fr = RB.ui.folio.frame({ cls: 'folio-place', onClose: () => stop(), closeLabel: 'Stop', closeIcon: 'close' });
      fr.box.innerHTML = '<section class="leaf cr-place" aria-labelledby="pl-h"></section>';
      const leaf = fr.box.querySelector('.leaf');
      const layer = { el: fr.scrim, name: 'placement', noAutofocus: true };
      const close = (r) => { if (done) return; done = true; RB.ui.popLayer(layer); resolve(r); };
      layer.onCancel = () => close(null);
      layer.onAction = (a, e) => (a === 'menu' ? tabKey(fr.el, e) : false);
      function stop() { if (result) close(null); else showResult(); }
      function suggest() {
        let profile = 'F', kana = 'none';
        if (right.hira >= 2) kana = 'hira';
        if (right.hira >= 2 && right.kata >= 1) kana = 'both';
        if (kana === 'both' && right.E >= 2) profile = 'E';
        if (profile === 'E' && right.I >= 2) profile = 'I';
        if (profile === 'I' && right.A >= 2) profile = 'A';
        return { profile, kana };
      }
      function showResult() {
        result = suggest();
        const pf = PROFILES.find((x) => x.id === result.profile);
        const extra = result.profile === 'F' ? (result.kana === 'none' ? ' (kana from the start)' : result.kana === 'hira' ? ' (skip hiragana lessons)' : ' (skip kana lessons)') : '';
        fr.setTitle('Placement', 'Finished');
        leaf.innerHTML = '<h3 id="pl-h" tabindex="-1">Suggested level</h3>' +
          '<p class="pl-result"><b>' + esc(pf.en) + '</b>' + esc(extra) + '</p><p>' + esc(pf.d) + '</p>' +
          '<p class="muted">You can still pick any level yourself.</p>' +
          '<div class="row-acts"><button type="button" class="pbtn primary" data-a="use">Use this</button><button type="button" class="pbtn" data-a="keep">Keep my choice</button></div>';
        leaf.scrollTop = 0;
        leaf.querySelector('#pl-h').focus({ preventScroll: true });
      }
      function render() {
        if (i >= order.length || unknown >= 2) { showResult(); return; }
        const q = order[i];
        fr.setTitle('Placement ' + (i + 1) + ' / ' + order.length, 'Optional');
        leaf.innerHTML = '<h3 id="pl-h" class="pl-q" tabindex="-1">' + esc(q.q) + '</h3><div class="pl-jp">' + RB.ui.jhtml(q.jp) + '</div>' +
          '<div class="pl-opts" role="group" aria-labelledby="pl-h">' + q.order.map((oi) => '<button type="button" class="pbtn pl-opt" data-o="' + oi + '">' + (/[ぁ-んァ-ン]/.test(q.opts[oi]) ? RB.ui.jhtml(q.opts[oi]) : esc(q.opts[oi])) + '</button>').join('') + '</div>' +
          '<div class="row-acts"><button type="button" class="pbtn quiet" data-a="idk">I don\'t know this yet</button></div>' +
          '<p class="muted small">Nothing here is graded or saved. Two "don\'t know" answers end the placement.</p>';
        leaf.scrollTop = 0;
        leaf.querySelector('#pl-h').focus({ preventScroll: true });
      }
      leaf.onclick = (e) => {
        const b = e.target.closest('[data-o],[data-a]');
        if (!b) return;
        RB.audio && RB.audio.sfx('cursor');
        const a = b.getAttribute('data-a');
        if (a === 'use') { close(result); return; }
        if (a === 'keep') { close(null); return; }
        const q = order[i];
        if (a === 'idk') unknown++;
        else if (+b.getAttribute('data-o') === q.a) right[q.lv]++;
        else unknown += 0.5;
        i++;
        render();
      };
      render();
      RB.ui.pushLayer(layer);
    });
  }

  // New Game+: offer to carry learning into a fresh timeline. What carries is defined once, in RB.ngplus.carry
  // (src/engine/05b_foundations.js; expansion K9, Robin's C-54 and C-66): the learning record, records, illustrations
  // seen, pastime records, noted words, kept sentences and the traveller as they are. Never: story, companion,
  // quests, items and keepsakes, lore, the pet, position.
  const NGP_TEXT = 'You have a finished campaign. New Game+ starts the story over in this slot with a new companion choice. It carries your learning record and stars, your stamps and seals, the illustrations you have seen, your pastime records, the words you noted, the sentences you kept, and your traveller as they are. Story choices, the companion, quests, items and keepsakes are not carried, and the finished campaign stays untouched.';
  function chooseCarry(done) {
    return new Promise((resolve) => {
      const fr = RB.ui.folio.frame({ cls: 'folio-ngplus' });
      fr.el.setAttribute('role', 'alertdialog');
      fr.el.setAttribute('aria-describedby', 'ng-d');
      fr.setTitle('A new journey', 'Choose how to begin');
      fr.box.innerHTML = '<section class="leaf cr-ngplus"><p id="ng-d">' + esc(NGP_TEXT) + '</p><ul class="ng-list">' +
        '<li><button type="button" class="ng-opt" data-r="0"><span class="mk">' + I('journey') + '</span><span class="t">Start fresh</span>' +
        '<span class="d">A new traveller, from the prologue.</span></button></li>' +
        done.map((x, k) => {
          const m = x.meta || {};
          const label = 'New Game+ from slot ' + x.slot + ' (' + m.name + (m.comp ? ' & ' + m.comp : '') + ')';
          return '<li><button type="button" class="ng-opt" data-r="' + (k + 1) + '"><span class="mk">' + I('lantern') + '</span><span class="t">' + esc(label) + '</span>' +
            '<span class="d">' + (m.chapter ? 'Chapter ' + esc(m.chapter) + ' · ' : '') + esc(m.place || '') + ' · after the story · played ' + esc(RB.util.fmtTime(m.playtime || 0)) + '</span></button></li>';
        }).join('') + '</ul></section>';
      const layer = { el: fr.scrim, name: 'ngplus' };
      layer.onCancel = () => {}; // a choice is needed; Escape must not pick one
      layer.onAction = (a, e) => (a === 'menu' ? tabKey(fr.el, e) : false);
      fr.box.addEventListener('click', (e) => {
        const b = e.target.closest('[data-r]');
        if (!b) return;
        RB.audio && RB.audio.sfx('cursor');
        RB.ui.popLayer(layer);
        resolve(+b.getAttribute('data-r'));
      });
      RB.ui.pushLayer(layer);
    });
  }
  async function offerCarryover() {
    const list = await RB.save.list();
    const done = list.filter((x) => !x.empty && !x.corrupt && x.meta && x.meta.post);
    if (!done.length) return null;
    const r = await chooseCarry(done);
    if (r <= 0) return null;
    const src = done[r - 1];
    const rec = await RB.save.read(src.slot, src.manual ? 'manual' : 'auto');
    return rec.state;
  }
  function carry(from) {
    const s = RB.ngplus.carry(from);
    s.journal = [{ jp: 'もう {一度|いちど} 、 {灯|ひ} の {道|みち} を {歩|ある}く 。', en: 'Walking the lantern road once more (New Game+).', t: Date.now() }];
    return s;
  }

  async function begin(slot) {
    RB.game.setBase('create');
    const from = await offerCarryover();
    if (from) {
      // the ending journey's companion says goodbye (C-66; twelve-chapter journeys, F-21, and since C-84 a journey from
      // the six-chapter edition too, with the solo farewell if no companion was chosen)
      if (RB.ui.ngplus && RB.recordsUI && (RB.recordsUI.inCampaign(from) || (RB.edition && RB.edition.isOld(from)))) await RB.ui.ngplus.farewell(from);
      const s = carry(from);
      // look the settings over before setting out (ST-1b)
      if (RB.ui.settings && RB.ui.settings.review) await RB.ui.settings.review(s);
      RB.render.setOverride(null);
      await RB.game.startNewCampaign(slot, s);
      return;
    }
    await prologue();
    RB.render.setOverride(RB.ui.title.drawBackdrop);
    RB.audio && RB.audio.playSong('title');
    // CW-1: five steps, the last of them the Summary ("Before you set out"); its Begin is the one final action, so no
    // second review follows on this path (New Game+ keeps its own, above)
    const r = await wizard(['identity', 'appearance', 'background', 'learning', 'summary']);
    if (!r) { RB.render.setOverride(null); if (RB.game.toTitle) await RB.game.toTitle(); return; }
    const { player, learn: o } = r;
    const st = RB.game.settings;
    // the preferences the Summary's editor changed, through their own keys (the rest of the browser's settings stay as
    // they are), then the learning step's reading and answering choices
    if (RB.ui.settings.applyDraft) RB.ui.settings.applyDraft(r.prefs, r.changed);
    st.lead = o.lead; st.secondary = o.secondary; st.uiLang = o.uiLang; st.input = o.input;
    st.spacing = r.changed.has('spacing') ? !!r.prefs.spacing : o.profile === 'F' || o.profile === 'E';
    await RB.game.saveSettings();
    if (r.changed.has('suzuSpeech')) RB.bus.emit('dialect:changed', { suzuSpeech: st.suzuSpeech });
    const s = RB.state.newCampaign({ player, profile: o.profile, assist: o.assist, difficulty: o.difficulty, edition: RB.edition.forNew() });
    s.learn.kanaKnown = o.kana; // 'none' | 'hira' | 'both'
    if (o.kana === 'hira') s.learn.kanaGroup = 'hira_done';
    if (o.kana === 'both') s.learn.kanaGroup = 'all_done';
    s.journal = [{ jp: '{名前|なまえ} が {消|き}えている 。 {橋|はし} は {向|む}こう{岸|ぎし} に {届|とど}かない 。', en: 'Names are fading from things. Hana at the Reedwake teahouse poured tea for someone she cannot remember; a lantern lost its name; a bridge no longer reaches the far bank.', t: Date.now() }];
    RB.render.setOverride(null);
    await RB.game.startNewCampaign(slot, s);
  }

  return { begin, prologue, creation, setup, placement, romajiToKata, PROFILES, BACKGROUNDS, carry, wizard, dispose };
})();
