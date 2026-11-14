// Batch 3 Row 1 (Cloud CC-589; Local CL-822; Agnes 6874584737): each version of three Hall readings has its own English,
// in its own order and saying what its own Japanese says. Wing 3's chores note keeps its relations (before, after,
// until, while, as soon as) and is never put in the solved order; Wing 7's letter names the keepsake at F and E, says
// "the one written first" at I and "the former" at A; Wing 8's evidence board keeps what was seen, reported, inferred,
// expected or certain, with a source only where the Japanese names one. Only the English changes. In the loaded game:
//  1. each scene played on the real scene runner (dialogue stubbed, lines collected) in every state that picks a
//     version: both patterns, F/E/I/A, without and with Grow. Exactly one note (Wing 3), one letter (Wing 7) and four
//     board lines (Wing 8) are shown; the version is the one the level picks (Grow shows the next level's); its English
//     is the agreed text; the Japanese shown in every state is as before (a fingerprint of the parent's);
//  2. alongside (not instead of the runs): every quoted line's own condition tested in each of those states, so each
//     state shows exactly one version per reading (the 96 state-lines Local enumerated in CL-822);
//  3. nothing else changes: every scene line in the game, these 28 English strings set aside, as before (Japanese,
//     English, conditions and order); the 28 lines' voice keys as before (the key comes from the Japanese);
//  4. the language ledger: the 28 entries' English now the lines' own, their Japanese, status and note as before; every
//     other entry as before;
//  no scene ended on an error from the runner.
// The fingerprints were taken on 73cd133's exported tree with this file's own code.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state, H = RB.hall;
  const flat = (x) => JSON.stringify(x);
  const fp = (x) => crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex').slice(0, 16);
  const keyOf = (scene, jp) => scene + '#' + crypto.createHash('sha256').update(String(jp)).digest('hex').slice(0, 10);
  const lhash = (s) => { let h = 2166136261 >>> 0; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h.toString(36); };
  const errors = [];
  const cerr = console.error;
  console.error = (...a) => { if (a[0] === 'scene error') errors.push(a[1] + ': ' + String((a[2] && a[2].message) || a[2])); else cerr(...a); };

  // ---- a minimal stage (as the wings' own tests) ----------------------------------------------------------------------
  let lines = [];
  RB.ui.dialogue.say = async (l) => { lines.push({ who: l.who, jp: l.jp || '', en: l.en || '' }); };
  RB.ui.dialogue.choose = async () => 0;
  RB.ui.dialogue.hide = () => {};
  RB.ui.toast = async () => {};
  RB.ui.notice = () => {};
  RB.ui.shake = () => {};
  RB.ui.fade = async () => {};
  for (const k of ['ensureSpeaker', 'dismissExtras', 'refreshActors']) RB.world[k] = () => {};
  RB.world.whenArrived = async () => {};
  RB.world.emote = () => {};
  RB.game.afterScene = () => {};
  RB.world.W = RB.world.W || {};
  RB.save.autosave = async () => {};
  const fresh = (prof, w, pat, route) => {
    const s = S.newCampaign({ edition: 2 });
    s.id = 'hall-variant-english'; s.map = 'hall.foyer'; s.comp = 'mio';
    s.player.name = 'Haru'; s.player.nameJp = 'ハル';
    s.learn.profile = prof;
    Object.assign(s.flags, { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_done: true, cr_done: true, yn_done: true, ch6_done: true, postgame: true, hall_ledger: true });
    s.vars = {};
    RB.game.G.s = s;
    RB.world.W.map = { id: s.map };
    H.wrec(s, w).pat = pat;
    H.setChoice(s, w, { route });
    return s;
  };

  const SCENE = { w3: 'hall.w3.t2_note', w7: 'hall.w7.t6', w8: 'hall.w8.t8_board' };
  const WHO8 = ['tosuke', 'gonroku', 'saki', 'hisa'];
  const quoted = (c) => c.op === 'say' && c.who === 'narr' && /^「/.test(c.jp || '');
  const isRow = (id, c) => Object.values(SCENE).includes(id) && quoted(c);
  const NEXT = { F: 'E', E: 'I', I: 'A', A: 'A' };
  const shown = (prof, route) => (route === 'grow' ? NEXT[prof] : prof);
  const v8 = (tier) => ({ F: 0, E: 1, I: 2, A: 2 })[tier];

  // 1. each scene on the real runner, in every state
  const seen = [], shownEn = [], bad = [];
  let runs = 0;
  for (const w of ['w3', 'w7', 'w8']) for (const pat of [0, 1]) for (const prof of ['F', 'E', 'I', 'A']) for (const route of ['consolidate', 'grow']) {
    const s = fresh(prof, w, pat, route);
    if (w === 'w7') s.flags.xp_hall_w7_f1_asked = true; // the letter as read once it has been asked about (its :told branch)
    lines = [];
    await RB.script.run(SCENE[w]);
    runs++;
    const q = lines.filter((l) => l.who === 'narr' && /^「/.test(l.jp));
    const tier = shown(prof, route);
    const want = w === 'w8' ? WHO8.map((x) => AGREED.w8[x][v8(tier)]) : [AGREED[w][pat][tier]];
    const got = q.map((l) => l.en);
    seen.push([w, pat, prof, route, q.map((l) => l.jp)]);
    shownEn.push([w, pat, prof, route, got]);
    if (flat(got) !== flat(want.map((x) => '"' + x + '"'))) bad.push({ w, pat, prof, route, got });
  }
  t.ok(runs === 48 && seen.every((x) => x[4].length === (x[0] === 'w8' ? 4 : 1)),
    '1 each scene on the real runner in every state (2 patterns x 4 levels x 2 routes x 3 scenes): one note, one letter, four board lines each time ' + flat({ runs, counts: seen.map((x) => x[4].length).join('') }));
  t.ok(!bad.length, '1 the English shown is the agreed text of the version the level picks (Grow shows the next level\'s) in all 48 runs ' + flat(bad.slice(0, 3)));
  t.ok(fp(seen) === STATE_JP_FP, '1 the Japanese shown in every state as before ' + flat({ fp: fp(seen) }));
  const w7 = shownEn.filter((x) => x[0] === 'w7').map(([, pat, prof, route, got]) => ({ tier: shown(prof, route), keep: pat ? 'flute' : 'comb', en: got[0] }));
  t.ok(w7.length === 16 && w7.every((x) => (x.tier === 'A' ? /the former offered/.test(x.en) : x.tier === 'I' ? /the one written first offered/.test(x.en) : new RegExp('I\'d like the ' + x.keep + ' (set before|offered at)').test(x.en))),
    '1 the letter as shown: the keepsake named at F and E, the one written first at I, the former at A, in both patterns ' + flat(w7.slice(0, 2)));

  // 2. alongside: each quoted line's own condition, in each state
  const counts = [];
  for (const w of ['w3', 'w7', 'w8']) for (const pat of [0, 1]) for (const prof of ['F', 'E', 'I', 'A']) for (const route of ['consolidate', 'grow']) {
    const s = fresh(prof, w, pat, route);
    const on = C.scenes[SCENE[w]].cmds.filter((c) => quoted(c) && S.test(s, c.if || ''));
    counts.push(on.length);
  }
  const stateLines = counts.reduce((a, b) => a + b, 0);
  t.ok(stateLines === 96 && counts.every((n, i) => n === (i >= 32 ? 4 : 1)), '2 every quoted line\'s condition in each state: exactly one version per reading, 96 state-lines in all ' + flat({ stateLines }));

  // 3. nothing else changes
  const all = Object.keys(C.scenes).sort().map((id) => [id, C.scenes[id].cmds.map((c) => (isRow(id, c) ? Object.assign({}, c, { en: null }) : c))]);
  t.ok(fp(all) === SCENES_FP, '3 every scene line in the game, these 28 English strings set aside, as before ' + flat({ fp: fp(all), scenes: all.length }));
  const row = Object.values(SCENE).flatMap((id) => C.scenes[id].cmds.filter(quoted).map((c) => [id, c]));
  t.ok(row.length === 28 && fp(row.map(([id, c]) => keyOf(id, c.jp)).sort()) === KEYS_FP, '3 the 28 lines\' voice keys as before ' + flat({ n: row.length, fp: fp(row.map(([id, c]) => keyOf(id, c.jp)).sort()) }));

  // 4. the language ledger
  const led = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'docs/review/language/hall.json'), 'utf8'));
  const keys = row.map(([id, c]) => 'scene:' + id + '#' + lhash(c.jp));
  t.ok(row.every(([, c], i) => led[keys[i]] && led[keys[i]].jp === c.jp && led[keys[i]].en === c.en),
    '4 the 28 ledger entries: the lines\' own Japanese and English ' + flat(keys.filter((k, i) => !(led[k] && led[k].en === row[i][1].en)).slice(0, 3)));
  t.ok(fp(keys.map((k) => [k, led[k].jp, led[k].status, led[k].ref])) === LEDGER_ROW_FP && keys.every((k) => led[k].status === 'self-reviewed'),
    '4 their Japanese, status and note as before ' + flat({ fp: fp(keys.map((k) => [k, led[k].jp, led[k].status, led[k].ref])) }));
  const others = Object.keys(led).filter((k) => !keys.includes(k)).sort().map((k) => [k, led[k]]);
  t.ok(fp(others) === LEDGER_OTHERS_FP, '4 every other ledger entry as before ' + flat({ n: others.length, fp: fp(others) }));

  t.ok(errors.length === 0, 'no scene ended on an error from the runner ' + flat(errors.slice(0, 3)));
  console.error = cerr;
};

// the agreed English (CC-589's table; Local CL-822; Agnes 6874584737), without the line's quotation marks
const AGREED = {
  w3: {
    0: {
      F: 'First draw water; then light the stone lantern; then carry the firewood; last, wake the priest.',
      E: 'Before waking the priest, carry the firewood. After drawing water, light the stone lantern. After lighting the stone lantern, carry the firewood.',
      I: 'Waking the priest comes after the firewood has all been carried. The stone lantern is not lit until the water has been drawn. The firewood is carried while the lantern is still bright.',
      A: 'As soon as the water is drawn, the stone lantern is to be lit. The firewood is carried by the lantern\'s light. Waking the priest comes once everything is in order.',
    },
    1: {
      F: 'First light the stone lantern; then draw water; then wake the priest; last, carry the firewood.',
      E: 'Carrying the firewood comes last. After lighting the stone lantern, draw water. After drawing water, wake the priest.',
      I: 'Carrying the firewood comes once everything else is done. The water is drawn after the stone lantern is lit. The priest is woken the moment the water has all been drawn.',
      A: 'As soon as the stone lantern is lit, the water is to be drawn. The priest is woken as soon as the water is ready. The firewood can wait until the priest is up.',
    },
  },
  w7: {
    0: {
      F: 'A comb and a flute are put away in the storehouse. I\'d like the comb set before the family altar.',
      E: 'A comb and a flute are put away in the storehouse. I\'d like the comb offered at the family altar.',
      I: 'A comb and a flute are put away in the storehouse. I\'d like the one written first offered at the family altar.',
      A: 'The comb and the flute are laid away in the storehouse. I\'d like the former offered at the family altar.',
    },
    1: {
      F: 'A flute and a comb are put away in the storehouse. I\'d like the flute set before the family altar.',
      E: 'A flute and a comb are put away in the storehouse. I\'d like the flute offered at the family altar.',
      I: 'A flute and a comb are put away in the storehouse. I\'d like the one written first offered at the family altar.',
      A: 'The flute and the comb are laid away in the storehouse. I\'d like the former offered at the family altar.',
    },
  },
  w8: {
    tosuke: ['Tōsuke was wearing straw boots: Saki saw him.', 'Tōsuke was wearing straw boots. Saki is said to have seen him.', 'This morning, Saki is reported to have seen Tōsuke wearing straw boots.'],
    gonroku: ['Gonroku seems to be wearing geta. There was a sound in the corridor.', 'Gonroku seems to be wearing geta. There was a clip-clop in the corridor.', 'Geta went clip-clop in the corridor, so it seems Gonroku is in geta.'],
    saki: ['Saki cleared the snow in zōri.', 'Saki is said to have cleared the snow in zōri.', 'According to the landlady, Saki cleared the snow still in zōri.'],
    hisa: ['A child\'s straw sandals should be small.', 'A child\'s straw sandals should be small.', 'Hisa is still a child, so the straw-sandal prints must be small.'],
  },
};
const STATE_JP_FP = '0dc747c37adecee0', SCENES_FP = '0cb0194b0636eee0', KEYS_FP = '18d9ee20c3b758b4', LEDGER_ROW_FP = 'baf8ca434a0f7679', LEDGER_OTHERS_FP = '9853b694d39846d5';
