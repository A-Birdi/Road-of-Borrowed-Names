/* Cosmetic pets, part 1: the four animals, their names and looks, and the
 * campaign records (the Living Company addendum, §3; docs/ADDENDUM_CONTRACTS.md).
 *
 * A pet is presentation only. Nothing here (or anywhere in the pet system)
 * changes a battle, an answer, a puzzle, a reward, a quest or the party: the
 * animal is never in the party array, in `equip`, or in a flag. Its record
 * lives in the campaign under `company`:
 *   s.company.pets[species] = { name, reading, look, met: { t, map }, nameAtMeet }
 *   s.company.pet           = the selected species, or null (no pet is a complete state)
 *
 *   RB.pets.species(id) -> { id, name, reading, label: { en, jp }, about }    (null if unknown)
 *   RB.pets.ORDER, looks(id), record(s, id), met(s), active(s), visible(s, 'world'|'battle')
 *   RB.pets.meet(s, id, where)        acquisition (once per campaign: RB.state.once 'pet:met:<id>')
 *   RB.pets.select(s, id | null)      selection (a separate event from acquisition)
 *   RB.pets.rename(s, id, name, reading) -> { ok, error }, resetName(s, id), setLook(s, id, look)
 *   RB.pets.cleanName(text) -> { ok, value, error, count }   (the naming rules, §3.2)
 *   RB.pets.portrait(canvas, id, look, o)   the species' portrait in a look
 *   RB.pets.addVignette(id, def), vignetteAction(id, family)   (see src/content/pets/)
 *   RB.pets.hide(why) / show(why)     a scene-level, cosmetic hide (restored after the scene)
 * Conditions: `pet` (a pet is selected), `pet=cat`, `pet.cat` (the cat has been met). */
var RB = (globalThis.RB = globalThis.RB || {});

RB.pets = (function () {
  'use strict';
  const ORDER = ['cat', 'dog', 'bird', 'tanuki'];
  // Default names are proper names (not vocabulary): Koma, Mugi, Sora, Ponta.
  const SPECIES = {
    cat: {
      name: 'Koma', reading: 'コマ', label: { en: 'Cat', jp: '{猫|ねこ}' },
      about: { en: 'Keeps to dry corners and warm stones. Watches everything with half-closed eyes and pretends not to.' },
    },
    dog: {
      name: 'Mugi', reading: 'ムギ', label: { en: 'Dog', jp: '{犬|いぬ}' },
      about: { en: 'Used to travellers and glad of them. Walks at your pace, sits when you stop, and checks that everyone is still here.' },
    },
    bird: {
      name: 'Sora', reading: 'ソラ', label: { en: 'Small bird', jp: '{小鳥|ことり}' },
      about: { en: 'A small brown-and-cream road bird. Hops rather than walks, and never strays far from a good perch.' },
    },
    tanuki: {
      name: 'Ponta', reading: 'ポンタ', label: { en: 'Tanuki', jp: 'たぬき' },
      about: { en: 'Round, earnest and curious. Copies whatever the people around it are doing, a moment too late.' },
    },
  };
  function species(id) {
    const d = SPECIES[id];
    return d ? { id, name: d.name, reading: d.reading, label: d.label, about: d.about } : null;
  }
  function looks(id) {
    const A = RB.petArt;
    if (!A || !A.LOOK_ORDER[id]) return [];
    return A.LOOK_ORDER[id].map((k) => ({ id: k, en: A.LOOKS[id][k].en }));
  }
  const company = (s) => {
    if (!s.company) s.company = RB.state.newCampaign().company;
    if (!s.company.pets || typeof s.company.pets !== 'object') s.company.pets = {};
    return s.company;
  };
  function record(s, id) { const c = s && s.company; return c && c.pets && c.pets[id] && SPECIES[id] ? c.pets[id] : null; }
  // the species met in this campaign (known ones, in roster order; an unknown id is kept in the save but not listed)
  function met(s) { return ORDER.filter((id) => record(s, id)); }
  // the selected pet, if it is one we know and it has been met; otherwise none (an unknown id stays stored)
  function active(s) {
    const id = s && s.company && s.company.pet;
    return id && record(s, id) ? id : null;
  }
  // a look the art knows (an unknown one falls back to the species' first look for drawing only)
  function lookOf(s, id) {
    const r = record(s, id);
    const ls = RB.petArt ? RB.petArt.LOOK_ORDER[id] || [] : [];
    return r && ls.indexOf(r.look) >= 0 ? r.look : ls[0] || null;
  }
  // cosmetic, scene-level hide (authored scenes that cannot stage an animal): never saved
  const hidden = new Set();
  function hide(why) { hidden.add(why || 'scene'); }
  function show(why) { if (why) hidden.delete(why); else hidden.clear(); }
  function sceneHidden() { return hidden.size > 0; }
  function visible(s, scope) {
    const id = active(s);
    if (!id) return false;
    const st = RB.game && RB.game.settings;
    if (st && scope === 'world' && st.petWorld === false) return false;
    if (st && scope === 'battle' && st.petBattle === false) return false;
    if (scope === 'world' && sceneHidden()) return false;
    return true;
  }

  // ---- names: player-authored plain text (§3.2) -----------------------------------------------------------
  const MAX = 24;
  // grapheme clusters (what a reader counts as characters), with a code-point fallback
  let seg = null;
  try { seg = typeof Intl !== 'undefined' && Intl.Segmenter ? new Intl.Segmenter(undefined, { granularity: 'grapheme' }) : null; } catch (e) { seg = null; }
  function graphemes(t) {
    if (seg) { let n = 0; for (const _ of seg.segment(t)) n++; return n; } // eslint-disable-line no-unused-vars
    // fallback: code points, not counting combining marks and variation selectors on their own
    return Array.from(t).filter((ch) => !/[̀-ͯ᪰-᫿⃐-⃿︀-️゙゚]/.test(ch)).length;
  }
  // Trim, collapse line breaks and runs of spaces, drop control and direction-override characters,
  // keep every other character as written (Japanese included); empty or over-long is refused.
  function cleanName(text, opts) {
    opts = opts || {};
    let t = String(text == null ? '' : text);
    try { t = t.normalize('NFC'); } catch (e) { /* keep as is */ }
    t = t.replace(/\r\n|[\r\n\u2028\u2029\u0085\t\v\f]/g, ' ');
    t = t.replace(/[\u0000-\u001f\u007f-\u009f\u200b\u200e\u200f\u202a-\u202e\u2066-\u2069\ufeff]/g, '');
    t = t.replace(/[ \u00a0\u3000]+/g, (m) => (m.indexOf('\u3000') >= 0 ? '\u3000' : ' ')).trim();
    t = t.replace(/^\u3000+|\u3000+$/g, '');
    const count = graphemes(t);
    if (!t) return { ok: !!opts.optional, value: '', count: 0, error: opts.optional ? null : 'A name needs at least one letter or character.' };
    if (count > MAX) return { ok: false, value: t, count, error: 'That is ' + count + ' characters; a name can have up to ' + MAX + '.' };
    return { ok: true, value: t, count, error: null };
  }

  // ---- records ---------------------------------------------------------------------------------------------
  // Acquisition (a deterministic, optional vignette ends in it). At most once per campaign; the first
  // time returns true and emits pet:met. Selection is separate (select below).
  function meet(s, id, where) {
    if (!SPECIES[id]) return false;
    const c = company(s);
    if (c.pets[id]) return false;
    if (!RB.state.once(s, 'pet:met:' + id)) return false;
    const d = SPECIES[id];
    const first = RB.petArt && RB.petArt.LOOK_ORDER[id] ? RB.petArt.LOOK_ORDER[id][0] : null;
    c.pets[id] = { name: d.name, reading: d.reading, look: (where && where.look) || first, met: { t: Date.now(), map: (where && where.map) || s.map || null }, nameAtMeet: d.name };
    RB.bus.emit('pet:met', { species: id });
    return true;
  }
  function select(s, id) {
    const c = company(s);
    if (id && !record(s, id)) return false;
    const was = c.pet;
    c.pet = id || null;
    if (was !== c.pet) RB.bus.emit('pet:select', { species: c.pet, was: was || null });
    return true;
  }
  function rename(s, id, name, reading) {
    const r = record(s, id);
    if (!r) return { ok: false, error: 'unknown pet' };
    const n = cleanName(name);
    if (!n.ok) return n;
    const rd = cleanName(reading, { optional: true });
    if (!rd.ok) return { ok: false, error: 'Reading: ' + rd.error, value: rd.value };
    r.name = n.value;
    r.reading = rd.value;
    RB.bus.emit('pet:change', { species: id, what: 'name' });
    return { ok: true, value: n.value };
  }
  function resetName(s, id) {
    const r = record(s, id);
    if (!r) return false;
    r.name = SPECIES[id].name; r.reading = SPECIES[id].reading;
    RB.bus.emit('pet:change', { species: id, what: 'name' });
    return true;
  }
  // the name at the moment the animal joined (kept for the meeting memory; set once while naming it then)
  function nameAtMeet(s, id, name) { const r = record(s, id); if (r) r.nameAtMeet = name; }
  function setLook(s, id, look) {
    const r = record(s, id);
    if (!r || !RB.petArt || RB.petArt.LOOK_ORDER[id].indexOf(look) < 0) return false;
    r.look = look;
    RB.bus.emit('pet:change', { species: id, what: 'look' });
    return true;
  }
  function nameOf(s, id) { const r = record(s, id); return r ? r.name : SPECIES[id] ? SPECIES[id].name : ''; }

  // ---- portrait: a front three-quarter bust on a paper disc, for Company, previews and memories -----------
  // o: { size (css px drawn; default the canvas size), bg: true, pose }
  function portrait(canvas, id, look, o) {
    o = o || {};
    if (!canvas || !RB.petArt || !SPECIES[id]) return false;
    const A = RB.petArt;
    const art = Math.max(24, Math.min(64, o.art || 40));
    const f = A.frame(id, look || A.LOOK_ORDER[id][0], { kind: 'portrait', size: art }, o.pose || { sit: 1, hp: -6 });
    const c = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    c.imageSmoothingEnabled = false;
    c.clearRect(0, 0, W, H);
    const k = Math.max(1, Math.floor(Math.min(W, H) / art));
    const x = Math.round((W - art * k) / 2), y = Math.round((H - art * k) / 2);
    if (o.bg !== false) {
      // paper disc with an inked rim (the portraits' paper)
      const r = Math.min(W, H) / 2 - 1;
      c.fillStyle = '#efe4c8'; c.beginPath(); c.arc(W / 2, H / 2, r, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#e2d4b0'; c.beginPath(); c.arc(W / 2, H / 2 + r * 0.5, r * 0.62, Math.PI, 0); c.fill();
      c.strokeStyle = '#6e5a48'; c.lineWidth = Math.max(1, k); c.beginPath(); c.arc(W / 2, H / 2, r - k / 2, 0, Math.PI * 2); c.stroke();
    }
    c.drawImage(f.cv, x, y, art * k, art * k);
    return true;
  }

  // the whole animal sitting, front three-quarter, fitted to a small canvas (cards and look swatches)
  function thumb(canvas, id, look, pose) {
    if (!canvas || !RB.petArt || !SPECIES[id]) return false;
    const f = RB.petArt.frame(id, look || RB.petArt.LOOK_ORDER[id][0], { kind: 'preview' }, pose || { sit: id === 'bird' ? 0 : 1 });
    const c = canvas.getContext('2d');
    c.imageSmoothingEnabled = false;
    c.clearRect(0, 0, canvas.width, canvas.height);
    const k = Math.max(1, Math.floor(Math.min(canvas.width / f.w, canvas.height / f.h)));
    c.drawImage(f.cv, Math.round((canvas.width - f.w * k) / 2), Math.round((canvas.height - f.h * k) / 2), f.w * k, f.h * k);
    return true;
  }

  // ---- acquisition vignettes (content: src/content/pets/) ------------------------------------------------------
  // def: { species, families: [family ids accepted as a gentle field action], apply(s, family) -> bool }
  const VIGNETTES = {};
  function addVignette(id, def) { VIGNETTES[id] = def; }
  // The field-weaving route: a known, gentle response family moves the vignette's own state machine on
  // exactly as the ordinary interaction would. Returns true when it did; false when this family does not
  // fit the situation (nothing changes: an ineffective action is never a language mistake).
  function vignetteAction(id, family) {
    const v = VIGNETTES[id], s = RB.game && RB.game.s;
    if (!v || !s || (v.families || []).indexOf(family) < 0) return false;
    return !!v.apply(s, family);
  }

  // ---- affection (the species' rest/affection vocabulary, §4.2): a pose through k 0..1, and the key
  // moment held with reduced motion. Used by the Company page's Pat preview and by greetings in the world.
  const sm = (k) => (k <= 0 ? 0 : k >= 1 ? 1 : k * k * (3 - 2 * k));
  const bell = (k, a, b) => sm((k - a) / 0.15) * (1 - sm((k - b) / 0.15));
  const AFFECTION = {
    // leans into an offered hand, eyes closed
    cat: { key: { sit: 1, hr: 16, hy: 12, blink: 1, earF: -0.3, tUp: 20 }, pose: (k) => ({ sit: 1, hr: 16 * bell(k, 0.2, 0.8), hy: 12 * bell(k, 0.2, 0.8), blink: k > 0.3 && k < 0.8 ? 1 : 0, earF: -0.3 * bell(k, 0.2, 0.8), tUp: 20 * bell(k, 0.1, 0.9) }) },
    // sits beside you, a brief tail wag
    dog: { key: { sit: 1, wag: 0.7, earF: -0.4, hp: -10 }, pose: (k) => ({ sit: 1, wag: Math.sin(k * Math.PI * 9) * 0.8 * bell(k, 0.15, 0.85), earF: -0.4 * bell(k, 0.1, 0.9), hp: -10 * bell(k, 0.1, 0.9) }) },
    // a small hop closer, then a contented preen
    bird: { key: { fluff: 0.6, blink: 1, preen: 0.4 }, pose: (k) => ({ fluff: 0.6 * bell(k, 0.35, 0.9), blink: k > 0.45 && k < 0.7 ? 1 : 0, preen: 0.5 * bell(k, 0.55, 0.85), hr: 16 * bell(k, 0.15, 0.4) }) },
    // folds its paws and accepts a gentle pat (squinting)
    tanuki: { key: { sit: 1, paws: 1, blink: 1, earF: -0.4, crouch: 0.2 }, pose: (k) => ({ sit: 1, paws: sm(k / 0.3), blink: k > 0.3 && k < 0.85 ? 1 : 0, earF: -0.4 * bell(k, 0.25, 0.85), crouch: 0.2 * bell(k, 0.3, 0.8) }) },
  };

  // How it was met (the vignette's own words; src/content/pets/).
  function howMet(sp) {
    for (const id in VIGNETTES) if (VIGNETTES[id].species === sp && VIGNETTES[id].met) return VIGNETTES[id].met;
    return null;
  }
  // An occasional soft sound, never needed (Settings › Audio › Quiet pet sounds). The effects exist in the
  // game's synth; with the setting off, or no audio, nothing plays.
  const SOUND = { cat: 'pet_cat', dog: 'pet_dog', bird: 'pet_bird', tanuki: 'pet_tanuki' };
  // The four quiet sounds, synthesized like every other effect in the game (no files): a soft trill (cat), a
  // low "boof" (dog), two small chirps (bird), a snuffle (tanuki). Registered with the effects when first needed.
  function defineSounds() {
    const _ = RB.audio && RB.audio._, X = _ && _.sfxDefs, N = _ && _.node;
    if (!X || !N || X.pet_cat) return !!(X && X.pet_cat);
    const tone = (g, out, t, o) => {
      const c = g.ctx, s = N.osc(c, o.type || 'sine', o.f, t), f = N.bq(c, 'lowpass', o.lp || 3000, 0.7), a = N.amp(c, 0);
      if (o.f2) s.frequency.exponentialRampToValueAtTime(o.f2, t + (o.a || 0.01) + (o.hold || 0) + o.r);
      a.gain.setValueAtTime(0, t); a.gain.linearRampToValueAtTime(o.v, t + (o.a || 0.01));
      if (o.hold) a.gain.setValueAtTime(o.v, t + (o.a || 0.01) + o.hold);
      a.gain.setTargetAtTime(0, t + (o.a || 0.01) + (o.hold || 0), o.r / 3);
      s.connect(f); f.connect(a); a.connect(out);
      N.run(c, [s], [s, f, a], t, t + (o.a || 0.01) + (o.hold || 0) + o.r * 2.5);
    };
    const hiss = (g, out, t, o) => {
      const c = g.ctx, n = N.noise(g), f = N.bq(c, 'bandpass', o.f, o.q || 1.5), a = N.amp(c, 0);
      a.gain.setValueAtTime(0, t); a.gain.linearRampToValueAtTime(o.v, t + (o.a || 0.01)); a.gain.setTargetAtTime(0, t + (o.a || 0.01), o.r / 3);
      n.connect(f); f.connect(a); a.connect(out);
      N.run(c, [n], [n, f, a], t, t + (o.a || 0.01) + o.r * 2.5);
    };
    X.pet_cat = { len: 0.5, rv: 0.08, gap: 0.6, fn: (g, o, t, p) => { for (let i = 0; i < 3; i++) tone(g, o, t + i * 0.045, { type: 'triangle', f: (470 + i * 40) * p, f2: (560 + i * 50) * p, a: 0.012, r: 0.05, v: 0.11, lp: 1800 }); tone(g, o, t + 0.14, { type: 'triangle', f: 600 * p, f2: 690 * p, a: 0.02, hold: 0.04, r: 0.1, v: 0.12, lp: 1900 }); } };
    X.pet_dog = { len: 0.4, rv: 0.05, gap: 0.6, fn: (g, o, t, p) => { tone(g, o, t, { f: 190 * p, f2: 135 * p, a: 0.008, hold: 0.03, r: 0.09, v: 0.2, lp: 900 }); hiss(g, o, t, { f: 700 * p, q: 0.9, a: 0.006, r: 0.08, v: 0.06 }); } };
    X.pet_bird = { len: 0.35, rv: 0.1, gap: 0.5, fn: (g, o, t, p) => { tone(g, o, t, { f: 3300 * p, f2: 4300 * p, a: 0.004, r: 0.03, v: 0.07, lp: 6000 }); tone(g, o, t + 0.09, { f: 3600 * p, f2: 4600 * p, a: 0.004, r: 0.035, v: 0.07, lp: 6000 }); } };
    X.pet_tanuki = { len: 0.4, rv: 0.04, gap: 0.6, fn: (g, o, t, p) => { hiss(g, o, t, { f: 1500 * p, q: 2.5, a: 0.008, r: 0.05, v: 0.26 }); hiss(g, o, t + 0.1, { f: 1700 * p, q: 2.5, a: 0.008, r: 0.05, v: 0.23 }); hiss(g, o, t + 0.19, { f: 1400 * p, q: 2.5, a: 0.008, r: 0.06, v: 0.2 }); } };
    return true;
  }
  // an occasional quiet sound (never needed: what it does is also seen); off with "Quiet pet sounds"
  function sound(sp, kind) {
    const st = RB.game && RB.game.settings;
    if (!st || st.petSounds === false || !RB.audio || !RB.audio.sfx || !SOUND[sp]) return false;
    if (!defineSounds()) return false;
    return RB.audio.sfx(SOUND[sp], { vol: kind === 'pat' ? 0.55 : 0.4 });
  }

  // ---- greeting together (§4.5, §19.2): a companion × species moment at a safe rest ---------------------
  // true, or why not now (kept available, explained, never lost). No reward, ever.
  // o.rest: asked from a rest point's menu (already inside the rest moment, which is itself a scene)
  function canGreet(s, o) {
    o = o || {};
    const sp = active(s);
    if (!s || !s.comp) return 'Only once someone travels with you.';
    if (!sp) return 'Choose an animal to travel with first.';
    const G = RB.game;
    if (!o.rest && RB.script && RB.script.isRunning && RB.script.isRunning()) return 'Not in the middle of a scene — try again at a quiet moment.';
    const m = G && G.mode && G.mode();
    if (!o.rest && m && m !== 'world' && m !== 'menu') return 'Not now — try again at a quiet moment.';
    const W = RB.world && RB.world.W;
    if (!W || !W.map || !W.comp) return 'Not here — try again where you can both stop for a moment.';
    if (RB.discovery && RB.discovery.busy && RB.discovery.busy()) return 'Not while you are working something out — afterwards.';
    if (!visible(s, 'world')) return 'Your pet is hidden in exploration (Settings › Display).';
    if (!RB.content.scenes['pets.greet.' + s.comp + '.' + sp]) return 'Not now.';
    return true;
  }
  function greet(s, o) {
    o = o || {};
    if (canGreet(s, o) !== true) return Promise.resolve(false);
    const id = 'pets.greet.' + s.comp + '.' + active(s);
    RB.bus && RB.bus.emit('pet:greet', { species: active(s), comp: s.comp, from: o.rest ? 'rest' : 'company' });
    if (o.rest) return RB.script.run(id).then(() => true);
    return new Promise((res) => setTimeout(() => { RB.script.run(id).then(() => res(true)); }, 60));
  }
  // A choice for a rest point's menu (RB.company.addRestOption): "Greet <name> together", only when it can
  // be played there. Nothing is gained; it is a moment, not a reward.
  function restOption(s) {
    if (canGreet(s, { rest: true }) !== true) return null;
    // no player-authored text in the label (the choice list renders markup): the kind of animal only
    const L = SPECIES[active(s)].label;
    return {
      id: 'pet-greet',
      label: { en: 'Greet the ' + L.en.toLowerCase() + ' together', jp: '{一緒|いっしょ} に ' + L.jp + ' に あいさつ する' },
      run: () => greet(s, { rest: true }),
    };
  }

  try { defineSounds(); } catch (e) { /* no audio here (tests): defined when first needed */ }

  // ---- conditions: pet (any selected), pet=cat (selected), pet.cat (met) --------------------------------
  if (RB.state && RB.state.addTerm) {
    RB.state.addTerm('pet', (s, rest, op, val, num, cmp) => {
      if (rest) return !!record(s, rest);
      if (!op) return !!active(s);
      return cmp(active(s) || 'none', op, val);
    });
  }

  return {
    ORDER, SPECIES, MAX, species, looks, record, met, active, visible, lookOf, meet, select, rename, resetName, nameAtMeet, setLook, nameOf,
    cleanName, graphemes, portrait, thumb, addVignette, vignetteAction, vignettes: VIGNETTES, hide, show, sceneHidden,
    AFFECTION, howMet, sound, defineSounds, canGreet, greet, restOption,
  };
})();
