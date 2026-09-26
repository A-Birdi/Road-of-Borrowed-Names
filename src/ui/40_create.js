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
  const SHOTS = [
    { d: 7500, jp: '{灯|ひ} の {道|みち} は 、 {通|とお}った {場所|ばしょ} の {名前|なまえ} を {覚|おぼ}えている 。', en: 'The lantern roads remember the name of every place they pass through.', draw: 'road' },
    { d: 7000, jp: '{夜明|よあ}け 、 {茶屋|ちゃや} の ハナ は お{茶|ちゃ} を ふたつ いれた 。', en: 'At dawn, Hana at the teahouse poured two cups of tea.', draw: 'tea' },
    { d: 7500, jp: 'でも 、 ふたつ{目|め} が {誰|だれ} の ため なのか 、 {思|おも}い{出|だ}せなかった 。', en: 'But she could not remember who the second cup was for.', draw: 'cup' },
    { d: 8000, jp: '{川|かわ}べり の {灯|あか}り から 、 {名前|なまえ} が ひと{文字|もじ} ずつ {消|き}えていった 。', en: 'On the riverbank, the name on a lantern faded, one letter at a time.', draw: 'lantern' },
    { d: 8000, jp: '{朝|あさ} に なって も {橋|はし} は あった 。 ただ 、 {向|む}こう{岸|ぎし} に は もう {届|とど}かない 。', en: 'By morning the bridge was still there. It just no longer reached the other bank.', draw: 'bridge' },
    { d: 8000, jp: 'そして 、 {古|ふる}い {文字|もじ} を {読|よ}める {旅人|たびびと} が ひとり 、 {葦|あし}ノ{瀬|せ} へ {歩|ある}いていた 。', en: 'And a traveller who could still read the old letters was walking toward Reedwake.', draw: 'walker' },
  ];
  function drawShot(kind, c, w, h, t, k) {
    const R = (x, y, ww, hh, col) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), ww, hh); };
    const reduced = RB.game.reducedMotion();
    c.fillStyle = '#0b0d18'; c.fillRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2;
    if (kind === 'road' || kind === 'walker') {
      RB.ui.title.drawBackdrop(c, w, h, t);
      if (kind === 'walker') {
        const look = { skin: 3, hair: 'short', hairColor: 1, outfit: 5, acc: ['scarf'], scarfCol: '#6a6a7a' };
        const f = reduced ? 0 : Math.floor(t / 180) % 3;
        const img = RB.sprites.get(look, 'up', f === 2 ? 2 : f);
        const y = h * 0.95 - k * h * 0.2;
        c.drawImage(img, Math.round(cx - 8), Math.round(y - 24));
        const gl = c.createRadialGradient(cx + 6, y - 10, 0, cx + 6, y - 10, 18);
        gl.addColorStop(0, 'rgba(255,210,120,0.5)'); gl.addColorStop(1, 'rgba(255,210,120,0)');
        c.fillStyle = gl; c.fillRect(cx - 14, y - 30, 40, 40);
      }
    } else if (kind === 'tea' || kind === 'cup') {
      const g = c.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#3a2c2a'); g.addColorStop(1, '#1a1414');
      c.fillStyle = g; c.fillRect(0, 0, w, h);
      // window with dawn
      R(cx - 60, cy - 60, 50, 40, '#e8b08a'); R(cx - 36, cy - 60, 2, 40, '#3a2c2a'); R(cx - 60, cy - 41, 50, 2, '#3a2c2a');
      // table
      R(cx - 90, cy + 10, 180, 10, '#6e4428'); R(cx - 90, cy + 10, 180, 2, '#a06c42');
      const cups = kind === 'tea' ? [cx - 30, cx + 20] : [cx + 20];
      if (kind === 'cup') { R(cx - 30, cy - 2, 14, 12, '#e8e4d8'); R(cx - 28, cy, 10, 2, '#7a9a5a'); }
      cups.forEach((x, i) => {
        R(x, cy - 2, 14, 12, '#e8e4d8'); R(x + 2, cy, 10, 2, '#7a9a5a');
        if (!reduced) for (let s = 0; s < 3; s++) {
          const ph = ((t / 1200) + s / 3 + i * 0.2) % 1;
          c.fillStyle = `rgba(240,240,240,${0.35 * (1 - ph)})`;
          c.fillRect(x + 5 + Math.sin(ph * 6 + s) * 3, cy - 6 - ph * 22, 2, 3);
        }
      });
      if (kind === 'cup') {
        // the second cup, highlighted, with a question
        const a = 0.4 + Math.sin(t / 500) * 0.2;
        c.strokeStyle = `rgba(231,196,110,${a})`; c.lineWidth = 1;
        c.strokeRect(cx + 16.5, cy - 6.5, 22, 20);
      }
    } else if (kind === 'lantern') {
      RB.ui.title.drawBackdrop(c, w, h, t);
      c.fillStyle = 'rgba(8,10,20,0.6)'; c.fillRect(0, 0, w, h);
      R(cx - 1, cy - 10, 3, 70, '#2a2430');
      R(cx - 16, cy - 44, 32, 40, '#f4ead0');
      const gl = c.createRadialGradient(cx, cy - 24, 0, cx, cy - 24, 50);
      gl.addColorStop(0, 'rgba(255,210,120,0.45)'); gl.addColorStop(1, 'rgba(255,210,120,0)');
      c.fillStyle = gl; c.fillRect(cx - 50, cy - 74, 100, 100);
      // a name in brush strokes vanishing stroke by stroke (abstract marks, not real letters)
      const marks = [[-8, -38, 12, 2], [-3, -36, 2, 12], [-8, -30, 10, 2], [-7, -24, 2, 10], [2, -26, 6, 2], [4, -22, 2, 10], [-9, -14, 16, 2]];
      const shown = Math.max(0, marks.length - Math.floor(k * (marks.length + 1)));
      marks.slice(0, shown).forEach((m) => R(cx + m[0], cy + m[1], m[2], m[3], '#2a2024'));
    } else if (kind === 'bridge') {
      const g = c.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#9ab8d0'); g.addColorStop(1, '#e0ecf0');
      c.fillStyle = g; c.fillRect(0, 0, w, h);
      R(0, cy + 10, w, h, '#4f93b3');
      for (let i = 0; i < 30; i++) R((i * 37 + t / 40) % w, cy + 16 + (i * 13) % (h / 2), 6, 1, '#6fb0c8');
      R(0, cy - 4, w * 0.25, 20, '#5f9a4a'); R(w * 0.75, cy - 4, w * 0.25, 20, '#5f9a4a');
      // bridge that stops short
      R(w * 0.22, cy, w * 0.38, 6, '#a06c42');
      for (let x = w * 0.22; x < w * 0.6; x += 10) R(x, cy + 6, 2, 12, '#6e4428');
      c.fillStyle = 'rgba(255,255,255,0.5)';
      for (let i = 0; i < 6; i++) R(w * 0.6 + i * 4, cy + (i % 2) * 2, 2, 2, `rgba(160,108,66,${0.8 - i * 0.14})`);
    }
  }

  // Captions are a paper slip over the scene; Next and Skip stay in one place.
  function prologue() {
    return new Promise((resolve) => {
      let i = 0, t0 = performance.now(), done = false;
      RB.audio && RB.audio.playSong('prologue');
      const cap = RB.ui.el('div', 'cr-prologue');
      cap.setAttribute('role', 'dialog');
      cap.setAttribute('aria-label', 'Prologue');
      cap.innerHTML = '<div class="slip"><div class="pg" aria-hidden="true"></div><div class="txt" aria-live="polite"></div></div>' +
        '<div class="acts"><button class="cbtn" data-a="skip">Skip prologue</button>' +
        '<button class="cbtn cr-primary autofocus" data-a="next"><span>Next</span>' + I('next') + '</button></div>';
      const layer = { el: cap, name: 'prologue' };
      const finish = () => {
        if (done) return;
        done = true;
        RB.render.setOverride(null);
        RB.ui.popLayer(layer);
        resolve();
      };
      function caption() {
        const s = SHOTS[i];
        cap.querySelector('.txt').innerHTML = RB.ui.jhtml(s.jp) + '<div class="en">' + esc(s.en) + '</div>';
        cap.querySelector('.pg').innerHTML = SHOTS.map((x, j) => '<i class="' + (j === i ? 'on' : j < i ? 'past' : '') + '"></i>').join('');
      }
      cap.onclick = (e) => {
        const b = e.target.closest('[data-a]');
        if (!b) return;
        if (b.getAttribute('data-a') === 'skip') finish();
        else next();
      };
      layer.onAction = (a, e) => {
        if (a === 'cancel') { finish(); return true; }
        if (a === 'ok') { next(); return true; }
        if (a === 'menu') return tabKey(cap, e);
        return false;
      };
      function next() {
        i++;
        t0 = performance.now();
        if (i >= SHOTS.length) finish(); else caption();
      }
      RB.render.setOverride((c, w, h, t) => {
        if (done) return;
        const s = SHOTS[i];
        const k = Math.min(1, (performance.now() - t0) / s.d);
        drawShot(s.draw, c, w, h, t, k);
        const fadeK = Math.min(k * 8, (1 - k) * 8, 1);
        c.fillStyle = `rgba(0,0,0,${1 - Math.max(0, fadeK)})`;
        c.fillRect(0, 0, w, h);
        if (k >= 1) next();
      });
      caption();
      RB.ui.pushLayer(layer);
    });
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
    learning: { en: 'Learning setup', short: 'Learning', title: 'How would you like to learn?', lede: 'All of this can be changed later in Settings without losing story progress. Language level and combat difficulty are separate.' },
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
  let mountRef = null;
  const cutCache = new Map();
  function mount() {
    if (mountRef) return mountRef;
    const cv = document.createElement('canvas');
    cv.width = cv.height = 48;
    const c = cv.getContext('2d');
    const g = c.createLinearGradient(0, 0, 0, 48);
    g.addColorStop(0, '#2e3a34');
    g.addColorStop(1, '#0e1018');
    c.fillStyle = g;
    c.fillRect(0, 0, 48, 48);
    mountRef = c.getImageData(0, 0, 48, 48).data;
    return mountRef;
  }
  function cut(look, expr) {
    const key = JSON.stringify(look) + '|' + expr;
    let cv = cutCache.get(key);
    if (cv) return cv;
    cv = document.createElement('canvas');
    cv.width = cv.height = 48;
    RB.portraits.drawPlayer(cv, look, expr);
    try {
      const c = cv.getContext('2d');
      const img = c.getImageData(0, 0, 48, 48), d = img.data, m = mount();
      for (let i = 0; i < d.length; i += 4) {
        if (Math.abs(d[i] - m[i]) <= 2 && Math.abs(d[i + 1] - m[i + 1]) <= 2 && Math.abs(d[i + 2] - m[i + 2]) <= 2) d[i + 3] = 0;
      }
      c.putImageData(img, 0, 0);
    } catch (e) { /* keep the mounted portrait */ }
    cutCache.set(key, cv);
    if (cutCache.size > 240) cutCache.delete(cutCache.keys().next().value);
    return cv;
  }

  // ---- the stepped registration --------------------------------------------------------------
  // steps: any of ['identity','appearance','background','learning'] in order.
  // Resolves { player, learn }.
  function wizard(steps) {
    return new Promise((resolve) => {
      const st = RB.game.settings || {};
      const p = {
        name: '', nameJp: '', pron: 'they', bg: 'courier', custom: { they: 'they', them: 'them', their: 'their', theirs: 'theirs', self: 'themself', plural: true },
        look: { skin: 2, hair: 'short', hairColor: 1, outfit: 0, shape: 'tunic', acc: ['scarf'] },
      };
      const o = { profile: 'F', kana: 'none', assist: 'normal', difficulty: 'normal', lead: st.lead || 'en', secondary: st.secondary || 'always', uiLang: st.uiLang || 'en', input: st.input || 'hand' };
      const V = { i: 0, max: 0, jpEdited: false, dir: 'down', blink: false, closed: false, accNote: '' };
      const has = (id) => steps.indexOf(id) >= 0;
      const sheetOn = has('identity') || has('appearance') || has('background');

      const fr = RB.ui.folio.frame({ cls: 'folio-create' + (sheetOn ? '' : ' no-sheet') + (steps.length < 2 ? ' one-step' : '') });
      fr.scrim.classList.add('cr-scrim');
      const layer = { el: fr.scrim, name: 'create', noAutofocus: true };
      fr.box.innerHTML = '<div class="cr-body">' + (sheetOn ? sheetHtml() : '') +
        '<section class="leaf cr-page" aria-labelledby="cr-h"></section></div>';
      fr.foot.innerHTML = '<button type="button" class="cbtn cr-back" data-a="back">' + I('back') + '<span>Back</span></button>' +
        '<span class="spacer"></span><span class="sr cr-live" aria-live="polite"></span>' +
        '<button type="button" class="cbtn cr-primary cr-next" data-a="next"><span>Next<span class="to"></span></span>' + I('next') + '</button>' +
        '<button type="button" class="cbtn cr-primary cr-go" data-a="go" hidden><span>' + (has('learning') ? 'Begin<span class="to"> the journey</span>' : 'Continue') + '</span>' + I('next') + '</button>';
      const page = fr.box.querySelector('.cr-page');
      const sheet = fr.box.querySelector('.cr-sheet');
      const live = fr.foot.querySelector('.cr-live');
      const say = (t) => { live.textContent = ''; setTimeout(() => { live.textContent = t; }, 30); };

      // -- builders ------------------------------------------------------------------------
      function sheetHtml() {
        return '<aside class="cr-sheet" aria-label="Your traveller"><div class="cr-kick" aria-hidden="true">Your traveller</div>' +
          '<div class="cr-figs" aria-hidden="true"><div class="cr-port"><canvas width="48" height="48"></canvas></div>' +
          '<div class="cr-fig" data-dir="down"><canvas width="16" height="24"></canvas></div></div>' +
          '<div class="cr-sum"><div class="cr-nm"></div><div class="cr-sub"></div></div>' +
          '<div class="cr-turn" role="group" aria-label="Turn the figure"><button type="button" class="pbtn" data-a="turnl" aria-label="Turn left">' + I('cr-turnl') + '</button>' +
          '<button type="button" class="pbtn" data-a="turnr" aria-label="Turn right">' + I('cr-turnr') + '</button></div>' +
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
            '<span class="face"><span class="chip" style="' + chipStyle(style, c) + '">' + tick + '</span><span class="nm">' + esc(NAME[key](i)) + '</span></span></label>').join('') +
          '</div></fieldset>';
      }
      function chipStyle(style, c) {
        const a = Array.isArray(c) ? c : [c, c, c];
        return '--c0:' + a[0] + ';--c1:' + (a[1] || a[0]) + ';--c2:' + (a[2] || a[1] || a[0]);
      }
      function tileGroup(key, legend, vals, thumb) {
        return '<fieldset class="field cr-group" data-group="' + key + '"><legend>' + esc(legend) + ' <span class="cr-selected" data-selof="' + key + '"></span></legend><div class="cr-tiles cr-tiles-' + key + '">' +
          vals.map((v) => '<label class="cr-tile"><input type="radio" name="cr-' + key + '" data-set="' + key + '" data-v="' + esc(v) + '"><span class="face">' + tick +
            (thumb === 'port' ? '<canvas width="48" height="48" data-th="' + key + ':' + esc(v) + '"></canvas>' : '<canvas width="16" height="24" data-th="' + key + ':' + esc(v) + '"></canvas>') +
            '<span class="nm">' + esc(NAME[key](v)) + '</span></span></label>').join('') + '</div></fieldset>';
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
      const PAGES = {
        identity() {
          return head('identity') +
            '<div class="field cr-text"><label class="lab" for="nm">Name</label>' +
            '<input id="nm" type="text" maxlength="16" autocomplete="off" autocapitalize="words" spellcheck="false" enterkeyhint="next" required aria-describedby="nm-hint nm-err" placeholder="Your name" value="' + esc(p.name) + '">' +
            '<div class="hint" id="nm-hint">Used in English lines. Up to 16 characters.</div>' +
            '<div class="cr-err" id="nm-err" role="alert" hidden>' + I('warn') + '<span>Please enter a name (you can change your mind later only by starting over).</span></div></div>' +
            '<div class="field cr-text"><label class="lab" for="nj">Name in Japanese text</label>' +
            '<input id="nj" type="text" lang="ja" maxlength="12" autocomplete="off" spellcheck="false" enterkeyhint="done" aria-describedby="nj-hint" placeholder="e.g. アキ" value="' + esc(p.nameJp) + '">' +
            '<div class="hint" id="nj-hint">Kana, used in Japanese lines. It follows your name until you change it.</div>' +
            '<button type="button" class="pbtn quiet cr-suggest" data-a="suggest" hidden></button></div>' +
            chips('pron', 'data-set', 'Pronouns', PRON.map(([v, l]) => [v, esc(l)])) +
            '<div class="cr-custom" hidden><p class="hint">Your own pronouns, as they appear in English lines.</p><div class="cr-cps">' +
            [['they', 'Subject', 'they'], ['them', 'Object', 'them'], ['their', 'Possessive', 'their']].map(([k, l, ph]) =>
              '<div class="cr-cp"><label class="lab" for="cp-' + k + '">' + l + '</label><input id="cp-' + k + '" type="text" data-cp="' + k + '" maxlength="10" autocomplete="off" spellcheck="false" enterkeyhint="next" placeholder="' + ph + '" value="' + esc(p.custom[k]) + '"></div>').join('') +
            '</div><label class="cr-check"><input type="checkbox" data-cp="plural"' + (p.custom.plural ? ' checked' : '') + '><span class="face">Uses “are” (as in “they are”)</span></label></div>';
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
              '<canvas width="48" height="48" data-th="acc:' + esc(a) + '"></canvas><span class="nm">' + esc(NAME.acc(a)) + '</span></span></label>').join('') +
            '</div><p class="cr-accnote" aria-live="polite"></p></fieldset>';
        },
        background() {
          return head('background') + entryGroup('bg', 'data-set', 'Background', BACKGROUNDS, (id) => BG_ICON[id] || 'pouch', true);
        },
        learning() {
          const L = (k) => chips(k, 'data-k', LEARN[k][0], LEARN[k][1].map(([v, l]) => [v, l == null ? RB.ui.jhtml('{日本語|にほんご}') + ' (with furigana)' : esc(l)]));
          return head('learning') +
            '<h4 class="cr-kicker">Japanese level</h4>' +
            entryGroup('profile', 'data-k', 'Japanese level', PROFILES, null, true) +
            '<div class="row-acts"><button type="button" class="pbtn" data-a="place">Not sure? Try a short, optional placement' + I('next') + '</button></div>' +
            L('kana') +
            '<h4 class="cr-kicker">Challenge</h4>' + L('assist') + L('difficulty') +
            '<h4 class="cr-kicker">Answering and reading</h4>' + L('input') + L('lead') + L('secondary') + L('uiLang') +
            '<p class="note-slip">Furigana is always shown over kanji. Turn on the lightbulb (H or the bulb button) to hover or tap any Japanese for its reading and meaning.</p>';
        },
      };

      // -- state → view --------------------------------------------------------------------
      function pronText() {
        if (p.pron !== 'custom') return (PRON.find((x) => x[0] === p.pron) || PRON[0])[1];
        return (p.custom.they || 'they') + '/' + (p.custom.them || 'them');
      }
      function drawFig() {
        if (!sheet) return;
        const fc = sheet.querySelector('.cr-fig canvas');
        const c = fc.getContext('2d');
        c.clearRect(0, 0, 16, 24);
        c.drawImage(RB.sprites.get(p.look, V.dir, V.blink && V.dir !== 'up' ? 3 : 0), 0, 0);
        sheet.querySelector('.cr-fig').setAttribute('data-dir', V.dir);
      }
      function drawMain() {
        if (!sheet) return;
        const c = sheet.querySelector('.cr-port canvas').getContext('2d');
        c.clearRect(0, 0, 48, 48);
        c.drawImage(cut(p.look, 'smile'), 0, 0);
        drawFig();
      }
      function drawThumbs() {
        page.querySelectorAll('canvas[data-th]').forEach((cv) => {
          const [k, v] = cv.getAttribute('data-th').split(':');
          const c = cv.getContext('2d');
          c.clearRect(0, 0, cv.width, cv.height);
          if (k === 'hair') c.drawImage(cut(Object.assign({}, p.look, { hair: v, acc: [] }), 'neutral'), 0, 0);
          else if (k === 'acc') c.drawImage(cut(Object.assign({}, p.look, { acc: [v] }), 'neutral'), 0, 0);
          else if (k === 'shape') c.drawImage(RB.sprites.get(Object.assign({}, p.look, { shape: v, acc: [] }), 'down', 0), 0, 0);
        });
      }
      function updateSheet() {
        if (!sheet) return;
        const nm = p.name.trim(), nj = p.nameJp.trim();
        const bg = BACKGROUNDS.find((b) => b.id === p.bg) || BACKGROUNDS[0];
        const pf = PROFILES.find((x) => x.id === o.profile) || PROFILES[0];
        sheet.querySelector('.cr-nm').innerHTML = nm ? '<span class="en-n">' + esc(nm) + '</span>' + (nj ? ' <span class="jp-n" lang="ja">' + esc(nj) + '</span>' : '') : '<span class="cr-empty">No name yet</span>';
        sheet.querySelector('.cr-sub').textContent = bg.en + (steps[V.i] === 'learning' ? ' · ' + pf.en : '');
        const rows = [['Name', nm ? esc(nm) : '<span class="cr-empty">—</span>'], ['In Japanese', nj ? '<span lang="ja">' + esc(nj) + '</span>' : '<span class="cr-empty">—</span>'], ['Pronouns', esc(pronText())]];
        if (has('background') || has('identity')) rows.push(['Background', esc(bg.en)]);
        if (has('learning')) rows.push(['Japanese level', esc(pf.en)]);
        sheet.querySelector('.cr-reg').innerHTML = rows.map(([k, v]) => '<div><dt>' + k + '</dt><dd>' + v + '</dd></div>').join('');
      }
      function updateSelected() {
        page.querySelectorAll('[data-selof]').forEach((el) => {
          const k = el.getAttribute('data-selof');
          el.textContent = '· Selected: ' + NAME[k](p.look[k]);
        });
        const ac = page.querySelector('[data-account]');
        if (ac) ac.textContent = '· ' + p.look.acc.length + ' of ' + MAX_ACC + ' chosen';
        const an = page.querySelector('.cr-accnote');
        if (an) an.textContent = V.accNote;
      }
      function updateSuggest() {
        const b = page.querySelector('.cr-suggest');
        if (!b) return;
        const sug = romajiToKata(p.name);
        const show = V.jpEdited && sug && sug !== p.nameJp;
        b.hidden = !show;
        if (show) b.innerHTML = 'Use the suggestion: <span lang="ja">' + esc(sug) + '</span>';
      }
      function sync() {
        page.querySelectorAll('input[type=radio][data-set]').forEach((inp) => {
          const k = inp.getAttribute('data-set');
          const cur = k === 'pron' ? p.pron : k === 'bg' ? p.bg : p.look[k];
          inp.checked = String(cur) === inp.getAttribute('data-v');
        });
        page.querySelectorAll('input[type=radio][data-k]').forEach((inp) => { inp.checked = String(o[inp.getAttribute('data-k')]) === inp.getAttribute('data-v'); });
        page.querySelectorAll('input[data-acc]').forEach((inp) => { inp.checked = p.look.acc.includes(inp.getAttribute('data-acc')); });
        const cu = page.querySelector('.cr-custom');
        if (cu) cu.hidden = p.pron !== 'custom';
        const kg = page.querySelector('[data-group=kana]');
        if (kg) kg.hidden = o.profile !== 'F';
        updateSelected();
        updateSuggest();
      }
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

      // -- steps ---------------------------------------------------------------------------
      function renderStep(focus) {
        const id = steps[V.i];
        const S = STEPS[id];
        fr.setTitle(esc(S.title), steps.length > 1 ? 'Step ' + (V.i + 1) + ' of ' + steps.length : '');
        fr.tabslot.innerHTML = routeHtml();
        fr.el.setAttribute('data-step', id);
        page.innerHTML = PAGES[id]();
        // Japanese words inside choice labels are read through the label; keep Tab on the controls
        page.querySelectorAll('label .jt').forEach((j) => { j.tabIndex = -1; });
        page.scrollTop = 0;
        sync();
        drawThumbs();
        updateSheet();
        const last = V.i === steps.length - 1;
        const back = fr.foot.querySelector('.cr-back'), nx = fr.foot.querySelector('.cr-next'), go = fr.foot.querySelector('.cr-go');
        back.classList.toggle('gone', V.i === 0);
        back.setAttribute('aria-hidden', V.i === 0 ? 'true' : 'false');
        back.tabIndex = V.i === 0 ? -1 : 0;
        nx.hidden = last;
        go.hidden = !last;
        if (!last) nx.querySelector('.to').textContent = ': ' + (STEPS[steps[V.i + 1]].short || STEPS[steps[V.i + 1]].en);
        if (focus === 'keep' && document.activeElement && fr.foot.contains(document.activeElement) && document.activeElement.offsetParent && !document.activeElement.classList.contains('gone')) { /* focus stays on Back/Next */ }
        else if (focus) { const h = page.querySelector('#cr-h'); h && h.focus({ preventScroll: true }); }
        if (steps.length > 1) say('Step ' + (V.i + 1) + ' of ' + steps.length + ': ' + S.en);
      }
      function nameOk() {
        if (!has('identity') || p.name.trim()) return true;
        const at = steps.indexOf('identity');
        if (V.i !== at) { V.i = at; renderStep(false); }
        const er = page.querySelector('#nm-err'), nm = page.querySelector('#nm');
        if (er) { er.hidden = true; void er.offsetWidth; er.hidden = false; }
        if (nm) { nm.setAttribute('aria-invalid', 'true'); nm.focus(); }
        return false;
      }
      function go(i, how) {
        if (i < 0 || i >= steps.length || i === V.i) return;
        if (i > V.i && i > steps.indexOf('identity') && !nameOk()) return;
        V.i = i;
        V.max = Math.max(V.max, i);
        V.accNote = '';
        renderStep(how === 'foot' ? 'keep' : true);
      }
      function finish() {
        if (!nameOk()) return;
        if (!p.nameJp.trim()) p.nameJp = romajiToKata(p.name) || p.name;
        const c = p.custom;
        const they = (c.they || '').trim() || 'they', them = (c.them || '').trim() || 'them', their = (c.their || '').trim() || 'their';
        const custom = { they, them, their, theirs: their + 's', self: them + 'self', plural: !!c.plural };
        const player = { name: p.name.trim(), nameJp: p.nameJp.trim(), pron: p.pron === 'custom' ? custom : p.pron, bg: p.bg, look: p.look };
        close();
        resolve({ player, learn: Object.assign({}, o) });
      }
      function close() {
        V.closed = true;
        clearInterval(blinkT);
        if (vv) { vv.removeEventListener('resize', fit); vv.removeEventListener('scroll', fit); }
        window.removeEventListener('resize', fit);
        RB.ui.popLayer(layer);
      }

      // -- changes -------------------------------------------------------------------------
      function setLook(k, v) {
        if (k === 'pron') p.pron = v;
        else if (k === 'bg') p.bg = v;
        else if (k === 'hair' || k === 'shape') p.look[k] = v;
        else p.look[k] = +v;
        sync();
        if (k !== 'pron' && k !== 'bg') { drawMain(); drawThumbs(); }
        updateSheet();
      }
      function setLearn(k, v) {
        o[k] = v;
        if (k === 'profile' && o.profile !== 'F') o.kana = 'both';
        if (k === 'profile' && o.profile === 'A') { o.lead = 'ja'; o.secondary = 'tap'; }
        sync();
        updateSheet();
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
        drawMain();
        drawThumbs();
      }

      page.addEventListener('input', (e) => {
        const t = e.target;
        if (t.id === 'nm') {
          p.name = t.value.slice(0, 16);
          if (!V.jpEdited) { p.nameJp = romajiToKata(p.name); const nj = page.querySelector('#nj'); if (nj) nj.value = p.nameJp; }
          if (p.name.trim()) { const er = page.querySelector('#nm-err'); if (er) er.hidden = true; t.removeAttribute('aria-invalid'); }
        } else if (t.id === 'nj') { V.jpEdited = true; p.nameJp = t.value.slice(0, 12); }
        else if (t.type === 'text' && t.hasAttribute('data-cp')) p.custom[t.getAttribute('data-cp')] = t.value.trim().slice(0, 10);
        else return;
        updateSuggest();
        updateSheet();
      });
      page.addEventListener('change', (e) => {
        const t = e.target;
        if (t.type === 'radio' && t.hasAttribute('data-set')) setLook(t.getAttribute('data-set'), t.getAttribute('data-v'));
        else if (t.type === 'radio' && t.hasAttribute('data-k')) setLearn(t.getAttribute('data-k'), t.getAttribute('data-v'));
        else if (t.hasAttribute('data-acc')) toggleAcc(t.getAttribute('data-acc'), t.checked);
        else if (t.type === 'checkbox' && t.getAttribute('data-cp') === 'plural') p.custom.plural = t.checked;
        else return;
        RB.audio && RB.audio.sfx('cursor');
      });
      page.addEventListener('keydown', (e) => {
        // Enter in a text field moves on to the next field, never through the whole flow
        if (e.key !== 'Enter' || e.isComposing || e.keyCode === 229 || e.target.type !== 'text') return;
        e.preventDefault();
        const fields = Array.from(page.querySelectorAll('input[type=text]')).filter((x) => x.offsetParent !== null);
        const i = fields.indexOf(e.target);
        if (i >= 0 && i < fields.length - 1) fields[i + 1].focus();
        else { e.target.blur(); const nx = fr.foot.querySelector('.cr-primary:not([hidden])'); nx && nx.focus(); }
      });
      page.addEventListener('click', async (e) => {
        const b = e.target.closest('button[data-a]');
        if (!b) return;
        const a = b.getAttribute('data-a');
        if (a === 'suggest') {
          V.jpEdited = false;
          p.nameJp = romajiToKata(p.name);
          const nj = page.querySelector('#nj'); if (nj) { nj.value = p.nameJp; nj.focus(); }
          updateSuggest(); updateSheet();
        } else if (a === 'place') {
          RB.audio && RB.audio.sfx('cursor');
          const r = await placement();
          if (V.closed) return;
          if (r) { o.profile = r.profile; if (r.kana) o.kana = r.kana; }
          sync(); updateSheet();
          const pb = page.querySelector('[data-a=place]'); pb && pb.focus({ preventScroll: true });
          if (r) say('Japanese level set to ' + (PROFILES.find((x) => x.id === o.profile) || PROFILES[0]).en + '.');
        }
      });
      if (sheet) sheet.addEventListener('click', (e) => {
        const b = e.target.closest('button[data-a]');
        if (!b) return;
        const a = b.getAttribute('data-a');
        const DIRS = ['down', 'left', 'up', 'right'];
        if (a === 'turnl' || a === 'turnr') {
          V.dir = DIRS[(DIRS.indexOf(V.dir) + (a === 'turnl' ? 1 : 3)) % 4];
          drawFig();
          RB.audio && RB.audio.sfx('cursor');
        } else if (a === 'expand') {
          const on = !sheet.classList.contains('expanded');
          sheet.classList.toggle('expanded', on);
          b.setAttribute('aria-expanded', on ? 'true' : 'false');
          b.innerHTML = I(on ? 'cr-collapse' : 'cr-expand') + '<span class="tx">' + (on ? 'Close view' : 'Inspect') + '</span>';
          RB.audio && RB.audio.sfx('page');
        }
      });
      fr.foot.addEventListener('click', (e) => {
        const b = e.target.closest('button[data-a]');
        if (!b || b.classList.contains('gone')) return;
        // a double click on Next must not also press the button that replaces it
        if (e.detail > 1) return;
        const a = b.getAttribute('data-a');
        RB.audio && RB.audio.sfx('cursor');
        if (a === 'back') go(V.i - 1, 'foot');
        else if (a === 'next') go(V.i + 1, 'foot');
        else if (a === 'go') finish();
      });
      fr.tabslot.addEventListener('click', (e) => {
        const b = e.target.closest('button[data-step]');
        if (!b || b.disabled) return;
        RB.audio && RB.audio.sfx('page');
        go(+b.getAttribute('data-step'), 'route');
      });
      layer.onCancel = () => { if (V.i > 0) go(V.i - 1, 'key'); };
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
          const full = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
          const zoomed = vv ? vv.scale > 1.05 : false;
          const h = vv ? vv.height : full;
          const kb = typing && !zoomed && (full - h > 90);
          fr.scrim.classList.toggle('cr-kb', kb);
          fr.scrim.classList.toggle('cr-typing', typing && !zoomed && (kb || h < 480));
          if (kb) { fr.scrim.style.top = Math.round(vv.offsetTop) + 'px'; fr.scrim.style.height = Math.round(h) + 'px'; fr.scrim.style.bottom = 'auto'; }
          else { fr.scrim.style.top = ''; fr.scrim.style.height = ''; fr.scrim.style.bottom = ''; }
          if (typing) {
            const pr = page.getBoundingClientRect(), r = a.getBoundingClientRect();
            const er = a.id === 'nm' ? page.querySelector('#nm-err:not([hidden])') : null;
            const bottom = er ? Math.max(r.bottom, er.getBoundingClientRect().bottom) : r.bottom;
            if (bottom > pr.bottom - 8) page.scrollTop += bottom - pr.bottom + 8;
            else if (r.top < pr.top + 8) page.scrollTop -= pr.top + 8 - r.top;
          }
        });
      }
      if (vv) { vv.addEventListener('resize', fit); vv.addEventListener('scroll', fit); }
      window.addEventListener('resize', fit);
      fr.el.addEventListener('focusin', fit);
      fr.el.addEventListener('focusout', () => setTimeout(fit, 0));

      // a blink now and then; never with reduced motion
      const blinkT = setInterval(() => {
        if (V.closed || !sheet || RB.game.reducedMotion() || document.hidden) return;
        V.blink = true; drawFig();
        setTimeout(() => { V.blink = false; if (!V.closed) drawFig(); }, 150);
      }, 3600);

      renderStep(false);
      drawMain();
      updateSheet();
      RB.ui.pushLayer(layer);
      const fine = typeof matchMedia !== 'undefined' && matchMedia('(pointer: fine)').matches;
      setTimeout(() => {
        const nm = page.querySelector('#nm');
        if (nm && fine) nm.focus({ preventScroll: true });
        else { const h = page.querySelector('#cr-h'); h && h.focus({ preventScroll: true }); }
      }, 0);
    });
  }

  // Kept for callers of the former two-panel flow.
  function creation() { return wizard(['identity', 'appearance', 'background']).then((r) => r.player); }
  function setup() { return wizard(['learning']).then((r) => r.learn); }

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

  // New Game+: offer to carry learning into a fresh timeline. Carried: mastery
  // records, taught kana, notebook, cosmetic items, player identity. Never
  // carried: story flags, quests, companion, other items, position.
  const NGP_TEXT = 'You have a finished campaign. New Game+ starts the story over in this slot with a new companion choice, carrying over only your learning progress, notebook, keepsakes (cosmetics) and appearance. Story choices, companion, quests and other items are not carried, and the finished campaign stays untouched.';
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
    const s = RB.state.newCampaign({ player: RB.util.deepClone(from.player), profile: from.learn.profile, assist: from.learn.assist, difficulty: from.learn.difficulty });
    s.learn = RB.util.deepClone(from.learn);
    s.notebook = RB.util.deepClone(from.notebook || []);
    for (const id in from.inv) { const it = RB.content.items[id]; if (it && it.slot === 'cosmetic') s.inv[id] = 1; }
    if (from.equip && from.equip.cosmetic) s.equip.cosmetic = from.equip.cosmetic;
    s.atlas.cosmetics = RB.util.deepClone((from.atlas && from.atlas.cosmetics) || []);
    s.ngplus = (from.ngplus || 0) + 1;
    s.journal = [{ jp: 'もう {一度|いちど} 、 {灯|ひ} の {道|みち} を {歩|ある}く 。', en: 'Walking the lantern road once more (New Game+).', t: Date.now() }];
    return s;
  }

  async function begin(slot) {
    RB.game.setBase('create');
    const from = await offerCarryover();
    if (from) {
      const s = carry(from);
      RB.render.setOverride(null);
      await RB.game.startNewCampaign(slot, s);
      return;
    }
    await prologue();
    RB.render.setOverride(RB.ui.title.drawBackdrop);
    RB.audio && RB.audio.playSong('title');
    const { player, learn: o } = await wizard(['identity', 'appearance', 'background', 'learning']);
    const st = RB.game.settings;
    st.lead = o.lead; st.secondary = o.secondary; st.uiLang = o.uiLang; st.input = o.input;
    st.spacing = o.profile === 'F' || o.profile === 'E';
    await RB.game.saveSettings();
    const s = RB.state.newCampaign({ player, profile: o.profile, assist: o.assist, difficulty: o.difficulty });
    s.learn.kanaKnown = o.kana; // 'none' | 'hira' | 'both'
    if (o.kana === 'hira') s.learn.kanaGroup = 'hira_done';
    if (o.kana === 'both') s.learn.kanaGroup = 'all_done';
    s.journal = [{ jp: '{名前|なまえ} が {消|き}えている 。 {橋|はし} は {向|む}こう{岸|ぎし} に {届|とど}かない 。', en: 'Names are fading from things. Hana at the Reedwake teahouse poured tea for someone she cannot remember; a lantern lost its name; a bridge no longer reaches the far bank.', t: Date.now() }];
    RB.render.setOverride(null);
    await RB.game.startNewCampaign(slot, s);
  }

  return { begin, prologue, creation, setup, placement, romajiToKata, PROFILES, BACKGROUNDS, carry, wizard };
})();
