/* New game flow: prologue cutscene (skippable), character creation,
 * learning setup and optional placement. Skipping the prologue reaches the
 * same starting state; its content is recorded in the journal. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.ui.create = (function () {
  'use strict';
  const esc = RB.util.esc;

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

  function prologue() {
    return new Promise((resolve) => {
      let i = 0, t0 = performance.now(), done = false;
      RB.audio && RB.audio.playSong('prologue');
      const cap = RB.ui.el('div', 'card');
      cap.style.background = 'transparent';
      cap.style.justifyContent = 'flex-end';
      cap.style.paddingBottom = '9vh';
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
        cap.innerHTML = '<div style="background:rgba(8,9,16,0.7);padding:0.6em 1.2em;border-radius:10px;max-width:min(900px,94vw)">' +
          RB.ui.jhtml(s.jp) + '<div class="en">' + esc(s.en) + '</div></div>' +
          '<div class="row" style="margin-top:0.8em"><button class="btn small" data-a="next">Next ▶</button><button class="btn small" data-a="skip">Skip prologue ⏭</button></div>';
      }
      cap.onclick = (e) => {
        const b = e.target.closest('[data-a]');
        if (!b) return;
        if (b.getAttribute('data-a') === 'skip') finish();
        else next();
      };
      layer.onAction = (a) => { if (a === 'cancel') { finish(); return true; } if (a === 'ok') { next(); return true; } return false; };
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

  // ---- character creation -----------------------------------------------------------
  const BACKGROUNDS = [
    { id: 'courier', en: "Courier's apprentice", jp: '{配達|はいたつ}{見習|みなら}い', d: 'You know roads, weather and how to read an address written in a hurry.' },
    { id: 'craft', en: 'Village craftsperson', jp: '{村|むら} の {職人|しょくにん}', d: 'You fix things. People bring you broken boots and bad hinges and stay to talk.' },
    { id: 'student', en: 'Wandering student', jp: '{旅|たび} の {学生|がくせい}', d: 'You collect old words and older arguments, and you are rarely short of questions.' },
  ];
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

  function creation(slot) {
    return new Promise((resolve) => {
      const p = {
        name: '', nameJp: '', pron: 'they', bg: 'courier', custom: { they: 'they', them: 'them', their: 'their', theirs: 'theirs', self: 'themself', plural: true },
        look: { skin: 2, hair: 'short', hairColor: 1, outfit: 0, shape: 'tunic', acc: ['scarf'] },
      };
      let jpEdited = false;
      const scrim = RB.ui.el('div', 'scrim');
      const panel = RB.ui.el('div', 'panel');
      scrim.appendChild(panel);
      const layer = { el: scrim, name: 'create' };
      layer.onCancel = () => {};
      let anim = null;
      function swatches(list, cur, key) {
        return '<div class="swatches">' + list.map((c, i) => '<button class="swatch' + (i === cur ? ' sel' : '') + '" style="background:' + (Array.isArray(c) ? c[0] : c) + '" data-set="' + key + '" data-v="' + i + '" aria-label="' + key + ' ' + (i + 1) + '"></button>').join('') + '</div>';
      }
      function seg(list, cur, key, labels) {
        return '<div class="seg">' + list.map((v, i) => '<button class="btn small' + (v === cur ? ' sel on' : '') + '" data-set="' + key + '" data-v="' + v + '">' + esc(labels ? labels[i] : v) + '</button>').join('') + '</div>';
      }
      function render() {
        const L = p.look;
        panel.innerHTML = '<header><h2>Who is walking the road?</h2></header><div class="body"><div class="create">' +
          '<div class="preview"><canvas width="16" height="24" class="pv"></canvas><canvas width="48" height="48" class="pp" style="width:96px;height:96px;image-rendering:pixelated;border-radius:8px"></canvas><div class="small dim">Appearance never affects difficulty or ability.</div></div>' +
          '<div>' +
          '<div class="set-row"><label for="nm">Name</label><input id="nm" type="text" maxlength="16" value="' + esc(p.name) + '" placeholder="Your name" autocomplete="off"></div>' +
          '<div class="set-row"><label for="nj">Name in Japanese text<br><span class="small dim">kana, used in Japanese lines</span></label><input id="nj" type="text" lang="ja" maxlength="12" value="' + esc(p.nameJp) + '" placeholder="e.g. アキ"></div>' +
          '<div class="set-row"><span>Pronouns</span>' + seg(['they', 'she', 'he', 'custom'], typeof p.pron === 'string' ? p.pron : 'custom', 'pron', ['they/them', 'she/her', 'he/him', 'custom…']) + '</div>' +
          (p.pron === 'custom' || typeof p.pron === 'object' ? '<div class="set-row"><span>Custom</span><div class="row"><input type="text" data-cp="they" size="5" value="' + esc(p.custom.they) + '"><input type="text" data-cp="them" size="5" value="' + esc(p.custom.them) + '"><input type="text" data-cp="their" size="5" value="' + esc(p.custom.their) + '"><label class="small"><input type="checkbox" data-cp="plural"' + (p.custom.plural ? ' checked' : '') + '> uses "are"</label></div></div>' : '') +
          '<div class="set-row"><span>Skin tone</span>' + swatches(RB.sprites.SKIN, L.skin, 'skin') + '</div>' +
          '<div class="set-row"><span>Hairstyle</span>' + seg(RB.sprites.HAIRSTYLES, L.hair, 'hair') + '</div>' +
          '<div class="set-row"><span>Hair colour</span>' + swatches(RB.sprites.HAIR, L.hairColor, 'hairColor') + '</div>' +
          '<div class="set-row"><span>Clothing</span>' + swatches(RB.sprites.CLOTH, L.outfit, 'outfit') + seg(['tunic', 'robe', 'coat', 'apron'], L.shape, 'shape') + '</div>' +
          '<div class="set-row"><span>Accessories<br><span class="small dim">up to two</span></span><div class="seg">' + RB.sprites.ACCESSORIES.map((a) => '<button class="btn small' + (L.acc.includes(a) ? ' on' : '') + '" data-acc="' + a + '">' + a + '</button>').join('') + '</div></div>' +
          '<h3>Background</h3><div class="list">' + BACKGROUNDS.map((b) => '<button class="btn item' + (p.bg === b.id ? ' on' : '') + '" data-set="bg" data-v="' + b.id + '" style="text-align:left"><span class="t">' + esc(b.en) + '</span> ' + RB.ui.jhtml(b.jp) + '<div class="small dim">' + esc(b.d) + '</div></button>').join('') + '</div>' +
          '<p class="small dim">Backgrounds change a few conversations and your starting keepsake. They never lock you out of anything.</p>' +
          '</div></div></div><div class="foot"><button class="btn primary" data-a="next">Next: learning setup ▶</button></div>';
        const nm = panel.querySelector('#nm'), nj = panel.querySelector('#nj');
        nm.oninput = () => { p.name = nm.value.slice(0, 16); if (!jpEdited) { p.nameJp = romajiToKata(p.name); nj.value = p.nameJp; } };
        nj.oninput = () => { jpEdited = true; p.nameJp = nj.value.slice(0, 12); };
        panel.querySelectorAll('[data-cp]').forEach((inp) => {
          inp.oninput = inp.onchange = () => {
            const k = inp.getAttribute('data-cp');
            if (k === 'plural') p.custom.plural = inp.checked;
            else { p.custom[k] = inp.value.trim().slice(0, 10) || p.custom[k]; if (k === 'their') p.custom.theirs = p.custom.their + 's'; if (k === 'them') p.custom.self = p.custom.them + 'self'; }
          };
        });
        drawPreview();
      }
      function drawPreview() {
        const pv = panel.querySelector('.pv'), pp = panel.querySelector('.pp');
        if (!pv) return;
        RB.portraits.drawPlayer(pp, p.look, 'smile');
      }
      let frameT = 0;
      function animate(t) {
        const pv = panel.querySelector('.pv');
        if (pv) {
          const c = pv.getContext('2d');
          const dirs = ['down', 'right', 'up', 'left'];
          const d = dirs[Math.floor(t / 1600) % 4];
          const f = RB.game.reducedMotion() ? 0 : [0, 1, 0, 2][Math.floor(t / 200) % 4];
          c.clearRect(0, 0, 16, 24);
          c.drawImage(RB.sprites.get(p.look, d, f), 0, 0);
        }
        frameT = t;
        anim = requestAnimationFrame(animate);
      }
      panel.onclick = (e) => {
        const b = e.target.closest('[data-set],[data-acc],[data-a]');
        if (!b) return;
        RB.audio && RB.audio.sfx('cursor');
        if (b.hasAttribute('data-acc')) {
          const a = b.getAttribute('data-acc');
          const acc = p.look.acc;
          const i = acc.indexOf(a);
          if (i >= 0) acc.splice(i, 1); else { acc.push(a); if (acc.length > 2) acc.shift(); }
          render();
          return;
        }
        if (b.getAttribute('data-a') === 'next') {
          if (!p.name.trim()) { RB.ui.notice('Please enter a name (you can change your mind later only by starting over).', 'warn'); panel.querySelector('#nm').focus(); return; }
          if (!p.nameJp.trim()) p.nameJp = romajiToKata(p.name) || p.name;
          cancelAnimationFrame(anim);
          RB.ui.popLayer(layer);
          const out = { name: p.name.trim(), nameJp: p.nameJp.trim(), pron: p.pron === 'custom' ? p.custom : p.pron, bg: p.bg, look: p.look };
          resolve(out);
          return;
        }
        const k = b.getAttribute('data-set'), v = b.getAttribute('data-v');
        if (k === 'pron') p.pron = v;
        else if (k === 'bg') p.bg = v;
        else if (k === 'hair' || k === 'shape') p.look[k] = v;
        else p.look[k] = +v;
        const focusKey = k + '|' + v;
        render();
        const again = panel.querySelector('[data-set="' + k + '"][data-v="' + v + '"]');
        if (again) again.focus();
        void focusKey;
      };
      render();
      RB.ui.pushLayer(layer);
      anim = requestAnimationFrame(animate);
      void slot; void frameT;
    });
  }

  // ---- learning setup ------------------------------------------------------------------
  const PROFILES = [
    { id: 'F', en: 'Foundations', d: 'Start from the kana. Every character is taught with examples before you are asked for it. You can finish the whole story from here.' },
    { id: 'E', en: 'Elementary', d: 'You read kana. Everyday words, particles, polite and plain forms, simple sentences.' },
    { id: 'I', en: 'Intermediate', d: 'Connected sentences: cause, time, conditions, reading in context.' },
    { id: 'A', en: 'Advanced', d: 'Nuance, register, implication and paraphrase in longer passages (curated material approaching N2/N1-style reading — not a complete course).' },
  ];
  function setup() {
    return new Promise((resolve) => {
      const st = RB.game.settings;
      const o = { profile: 'F', kana: 'none', assist: 'normal', difficulty: 'normal', lead: st.lead, secondary: st.secondary, uiLang: st.uiLang, input: st.input };
      const scrim = RB.ui.el('div', 'scrim');
      const panel = RB.ui.el('div', 'panel');
      scrim.appendChild(panel);
      const layer = { el: scrim, name: 'setup' };
      function seg(key, opts) {
        return '<div class="seg">' + opts.map(([v, l]) => '<button class="btn small' + (o[key] === v ? ' on' : '') + '" data-k="' + key + '" data-v="' + v + '">' + esc(l) + '</button>').join('') + '</div>';
      }
      function render() {
        panel.innerHTML = '<header><h2>How would you like to learn?</h2></header><div class="body">' +
          '<p class="dim small">All of this can be changed later in Settings without losing story progress. Language level and combat difficulty are separate.</p>' +
          '<h3>Japanese level</h3><div class="list">' + PROFILES.map((pf) => '<button class="btn item' + (o.profile === pf.id ? ' on' : '') + '" data-k="profile" data-v="' + pf.id + '" style="text-align:left"><span class="t">' + esc(pf.en) + '</span><div class="small dim">' + esc(pf.d) + '</div></button>').join('') + '</div>' +
          '<div class="row" style="margin-top:0.5em"><button class="btn small" data-a="place">Not sure? Try a short, optional placement ▶</button></div>' +
          (o.profile === 'F' ? '<div class="set-row"><span>Kana so far</span>' + seg('kana', [['none', 'Teach me from the start'], ['hira', 'I know hiragana'], ['both', 'I know hiragana and katakana']]) + '</div>' : '') +
          '<div class="set-row"><span>Mistakes in battle</span>' + seg('assist', [['assist', 'Assisted: no cost for mistakes'], ['normal', 'Standard: small, capped cost']]) + '</div>' +
          '<div class="set-row"><span>Tactical challenge</span>' + seg('difficulty', [['relaxed', 'Relaxed'], ['normal', 'Standard'], ['hard', 'Demanding']]) + '</div>' +
          '<div class="set-row"><span>Answer with</span>' + seg('input', [['hand', 'Handwriting'], ['choice', 'Choices'], ['ime', 'Keyboard / IME']]) + '</div>' +
          '<div class="set-row"><span>Dialogue</span>' + seg('lead', [['en', 'English-led (Japanese beneath)'], ['ja', 'Japanese-led (English beneath)']]) + '</div>' +
          '<div class="set-row"><span>Second language line</span>' + seg('secondary', [['always', 'Always shown'], ['tap', 'Tap to show'], ['off', 'Hidden']]) + '</div>' +
          '<div class="set-row"><span>Menus</span>' + seg('uiLang', [['en', 'English'], ['ja', '日本語 (with furigana)']]) + '</div>' +
          '<p class="small dim">Furigana is always shown over kanji. Turn on the lightbulb (H or the bulb button) to hover or tap any Japanese for its reading and meaning.</p>' +
          '</div><div class="foot"><button class="btn primary" data-a="go">Begin the journey ▶</button></div>';
      }
      panel.onclick = async (e) => {
        const b = e.target.closest('[data-k],[data-a]');
        if (!b) return;
        RB.audio && RB.audio.sfx('cursor');
        if (b.getAttribute('data-a') === 'place') {
          const r = await placement();
          if (r) { o.profile = r.profile; if (r.kana) o.kana = r.kana; }
          render();
          return;
        }
        if (b.getAttribute('data-a') === 'go') { RB.ui.popLayer(layer); resolve(o); return; }
        o[b.getAttribute('data-k')] = b.getAttribute('data-v');
        if (b.getAttribute('data-k') === 'profile' && o.profile !== 'F') o.kana = 'both';
        if (b.getAttribute('data-k') === 'profile' && o.profile === 'A') { o.lead = 'ja'; o.secondary = 'tap'; }
        render();
      };
      render();
      RB.ui.pushLayer(layer);
    });
  }

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
      let i = 0, unknown = 0, right = { hira: 0, kata: 0, E: 0, I: 0, A: 0 };
      const scrim = RB.ui.el('div', 'scrim');
      const panel = RB.ui.el('div', 'panel');
      panel.style.width = 'min(640px, calc(100vw - 16px))';
      scrim.appendChild(panel);
      const layer = { el: scrim, name: 'placement' };
      const order = PLACE.map((q) => { const idx = RB.util.rng(RB.util.hashStr(q.jp)).shuffle([0, 1, 2]); return Object.assign({}, q, { order: idx }); });
      const finish = () => {
        RB.ui.popLayer(layer);
        let profile = 'F', kana = 'none';
        if (right.hira >= 2) kana = 'hira';
        if (right.hira >= 2 && right.kata >= 1) kana = 'both';
        if (kana === 'both' && right.E >= 2) profile = 'E';
        if (profile === 'E' && right.I >= 2) profile = 'I';
        if (profile === 'I' && right.A >= 2) profile = 'A';
        const pf = PROFILES.find((x) => x.id === profile);
        RB.ui.confirm('Suggested level: ' + pf.en + (profile === 'F' ? (kana === 'none' ? ' (kana from the start)' : kana === 'hira' ? ' (skip hiragana lessons)' : ' (skip kana lessons)') : '') + '. You can still pick any level yourself.', ['Use this', 'Keep my choice']).then((r) => resolve(r === 0 ? { profile, kana } : null));
      };
      layer.onCancel = () => { RB.ui.popLayer(layer); resolve(null); };
      function render() {
        if (i >= order.length || unknown >= 2) { finish(); return; }
        const q = order[i];
        panel.innerHTML = '<header><h2>Placement ' + (i + 1) + ' / ' + order.length + '</h2><button class="btn small" data-a="stop">Stop</button></header><div class="body"><p>' + esc(q.q) + '</p><div style="font-size:1.5em">' + RB.ui.jhtml(q.jp) + '</div>' +
          '<div class="mc" style="margin-top:0.6em">' + q.order.map((oi) => '<button class="btn" data-o="' + oi + '">' + (/[ぁ-んァ-ン]/.test(q.opts[oi]) ? RB.ui.jhtml(q.opts[oi]) : esc(q.opts[oi])) + '</button>').join('') + '</div>' +
          '<div class="row" style="margin-top:0.8em"><button class="btn" data-a="idk">I don\'t know this yet</button></div>' +
          '<p class="small dim">Nothing here is graded or saved. Two "don\'t know" answers end the placement.</p></div>';
      }
      panel.onclick = (e) => {
        const b = e.target.closest('[data-o],[data-a]');
        if (!b) return;
        if (b.getAttribute('data-a') === 'stop') { finish(); return; }
        const q = order[i];
        if (b.getAttribute('data-a') === 'idk') unknown++;
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
  async function offerCarryover() {
    const list = await RB.save.list();
    const done = list.filter((x) => !x.empty && !x.corrupt && x.meta && x.meta.post);
    if (!done.length) return null;
    const btns = ['Start fresh'].concat(done.map((x) => 'New Game+ from slot ' + x.slot + ' (' + x.meta.name + (x.meta.comp ? ' & ' + x.meta.comp : '') + ')'));
    const r = await RB.ui.confirm('You have a finished campaign. New Game+ starts the story over in this slot with a new companion choice, carrying over only your learning progress, notebook, keepsakes (cosmetics) and appearance. Story choices, companion, quests and other items are not carried, and the finished campaign stays untouched.', btns);
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
    const player = await creation(slot);
    const o = await setup();
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

  return { begin, prologue, creation, setup, placement, romajiToKata, PROFILES, BACKGROUNDS, carry };
})();
