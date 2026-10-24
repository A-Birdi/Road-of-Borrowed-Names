// The language review ledger (docs/future/plan/02_FOUNDATIONS.md S5; Robin's C-26: no native reviewer is available).
// Every Japanese line in the expansion's new content (the id prefixes in src/content/00_expansion.js) is listed in
// docs/review/language/<prefix>.json under a stable key (where it lives + a hash of its text), with its review status.
// The only status the lead can give is "self-reviewed", with what it was checked against; nothing here ever claims a
// native review. Usage:
//   node tools/review_ledger.mjs            report lines without an entry (exit 1 if any)
//   node tools/review_ledger.mjs --add "<ref>"  add entries for new lines as self-reviewed against <ref> (run only after
//                                           actually reviewing them); stale entries (text changed or gone) are dropped
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { load, root } from '../tests/lib/load.mjs';

export function lines(RB) {
  const C = RB.content, pre = Object.assign({}, C.chapterOfPrefix || {});
  for (const x of C.reviewPrefixes || []) pre[x] = pre[x] || 'review';
  const prefixOf = (id) => String(id).split(/[._]/)[0];
  // the Living World (C-87): its own notes and keepsakes (`lw_…`), and below, what it adds to the six-chapter regions
  pre.lw = pre.lw || 'review';
  const out = [];
  const hash = (s) => { let h = 2166136261 >>> 0; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h.toString(36); };
  const add = (id, where, jp, en) => { if (!jp || !pre[prefixOf(id)]) return; out.push({ prefix: prefixOf(id), key: where + '#' + hash(jp), jp, en: en || '' }); };
  const sceneLines = (id, as) => { for (const c of C.scenes[id].cmds) {
    if (c.op === 'say' || c.op === 'card' || c.op === 'journal' || c.op === 'toast') add(as, 'scene:' + id, c.jp, c.en);
    if (c.simple) add(as, 'scene:' + id + ':simpler', c.simple.jp, c.simple.en);
    if (c.op === 'choice') for (const o of c.opts) add(as, 'scene:' + id + ':choice', o.jp, o.en);
  } };
  for (const id in C.scenes) sceneLines(id, id);
  // every Japanese string under a content object: {jp} texts, and the strings of parts, tiles, answers and pieces
  const JA = /[\u3040-\u30ff\u4e00-\u9fff]/;
  const walk = (id, where, o, seen) => {
    if (!o || typeof o !== 'object' || seen.has(o)) return; seen.add(o);
    if (Array.isArray(o)) { for (const x of o) { if (typeof x === 'string' && JA.test(x)) add(id, where, x.replace(/^\?/, ''), ''); else if (x && typeof x === 'object') walk(id, where, x, seen); } return; }
    if (typeof o.jp === 'string') add(id, where, o.jp, typeof o.en === 'string' ? o.en : '');
    for (const k of Object.keys(o)) {
      const v = o[k];
      if (typeof v === 'string' && k !== 'jp' && JA.test(v) && /^(answer|text|jpK)$/.test(k)) add(id, where, v, '');
      else if (v && typeof v === 'object') walk(id, where, v, seen);
    }
  };
  for (const kind of ['challenges', 'notes', 'quests', 'maps', 'enemies', 'items']) for (const id in C[kind] || {}) walk(id, kind + ':' + id, C[kind][id], new Set());
  for (const d of C.drills || []) walk(d.id, 'drill:' + d.id, d, new Set());
  // the expansion's systems with their own tables (P05, P06): the exploration actions, stamps, New Game+'s farewell
  if (RB.verbs) for (const v of RB.verbs.list()) walk(v.id, 'verb:' + v.id, v, new Set());
  for (const id in C.stamps || {}) walk('rb.' + id, 'stamp:' + id, C.stamps[id], new Set());
  for (const id in C.stampStands || {}) walk('rb.' + id, 'stand:' + id, C.stampStands[id], new Set());
  if (C.ngFarewell) walk('ngp.farewell', 'ngplus:farewell', C.ngFarewell, new Set());
  // the press (P09): its blocks (and how they come apart when set by hand) and its readers' reactions
  if (C.press) walk('mp.press', 'press', C.press, new Set());
  // the pastimes (P06): each game's page, its lessons and puzzles, and the names its board shows
  if (RB.pastimes) for (const d of RB.pastimes.all()) walk('pt.' + d.id, 'pastime:' + d.id + ':page', d, new Set());
  if (C.shogi) walk('pt.shogi', 'pastime:shogi', C.shogi, new Set());
  if (C.karuta) walk('pt.karuta', 'pastime:karuta', C.karuta, new Set());
  if (C.festival) walk('pt.festival', 'pastime:festival', C.festival, new Set());
  if (RB.festival) for (const g of RB.festival.list()) walk('pt.festival', 'pastime:festival:' + g.id, g, new Set());
  if (RB.hanafuda) walk('pt.hanafuda', 'pastime:hanafuda:cards', { deck: RB.hanafuda.DECK, months: RB.hanafuda.MONTHS, kinds: RB.hanafuda.KINDS, yaku: RB.hanafuda.YAKU }, new Set());
  // A Quiet Cast's coast (P15g): the twelve-chapter edition's stations, fish and situations (the first nine and their
  // eighteen situations came with the Practice addendum, which keeps its own review notes: docs/practice/fishing.md)
  if (RB.fishing) {
    const coast = (d) => d && d.edition === 2;
    for (const id of RB.fishing.SITE_ORDER) if (coast(RB.fishing.SITES[id])) walk('coast.' + id, 'fishing:site:' + id, RB.fishing.SITES[id], new Set());
    for (const id of RB.fishing.FISH_ORDER) if (coast(RB.fishing.FISH[id])) walk('coast.' + id, 'fishing:fish:' + id, RB.fishing.FISH[id], new Set());
    for (const id in RB.fishing.SITU) if (coast(RB.fishing.SITES[RB.fishing.SITU[id].site])) walk('coast.' + id, 'fishing:situation:' + id, RB.fishing.SITU[id], new Set());
  }
  if (RB.shogi) walk('pt.shogi', 'pastime:shogi:board', { names: RB.shogi.NAMES, promoted: RB.shogi.PROMOTED, variants: RB.shogi.VARIANTS, handicaps: RB.shogi.HANDICAPS }, new Set());
  // the expeditions (P07): each definition (its card), its floors' maps, and its encounters
  if (RB.expedition) for (const d of RB.expedition.list()) {
    walk('xp.' + d.id, 'expedition:' + d.id, d, new Set());
    for (const m of d.maps) if (C.maps[m]) walk('xp.' + d.id, 'map:' + m, C.maps[m], new Set());
  }
  // every encounter of the expansion's chapters and expeditions (add() keeps only the review prefixes)
  for (const id in C.encounters || {}) walk(id, 'encounter:' + id, C.encounters[id], new Set());
  // creatures the expansion adds to the six-chapter regions (P10's twelve-chapter Cinder Orchard and Snowbell)
  for (const id in C.reviewEnemies || {}) if (C.enemies[id]) walk(C.reviewEnemies[id] + '.' + id, 'enemies:' + id, C.enemies[id], new Set());
  // weighing tellings (P10): the sources, what they claim, and the readings to choose from
  for (const id in C.tellings || {}) walk(id, 'tellings:' + id, C.tellings[id], new Set());
  // shell messages (P11): the lines in the conches and the people who said them
  for (const id in C.shells || {}) walk(id, 'shells:' + id, C.shells[id], new Set());
  // the companions' memories and bond lines added by the expansion's chapters (P09's fireworks, P10's Ridge Light)
  const MEM_PREFIX = { fireworks: 'mp' };
  if (C.company && C.company.mem) for (const k in C.company.mem) { const id = MEM_PREFIX[k] ? MEM_PREFIX[k] + '.' + k : k; walk(id, 'memory:' + k, C.company.mem[k], new Set()); }
  // the Atlas's commissions (P07): the board's scenes, the landmark lines, the areas, errands and lengths
  if (RB.atlasCommissions) {
    const K = RB.atlasCommissions;
    walk('xp.atlas', 'atlas:commissions', { landmarks: K.LANDMARKS, areas: K.AREAS, themed: K.THEMED, lengths: K.LENGTHS }, new Set());
    for (const id of ['atlas.board', 'atlas.board.go', 'atlas.board.later']) if (C.scenes[id]) for (const c of C.scenes[id].cmds) if (c.op === 'say') add('xp.atlas', 'scene:' + id, c.jp, c.en);
  }
  // the Living World in the six-chapter regions (`rw.lw_…`, `sg.lw_…`: their prefixes are not the expansion's), what
  // people say when asked after someone or when they won't say, the sealed things' hints, and the towns' change beats
  const LW = /(^|[._])lw_/, lwOnly = (id) => LW.test(id) && !pre[prefixOf(id)];
  for (const id in C.scenes) if (lwOnly(id)) sceneLines(id, 'lw.' + id);
  for (const kind of ['challenges', 'notes', 'items']) for (const id in C[kind] || {}) if (lwOnly(id)) walk('lw.' + id, kind + ':' + id, C[kind][id], new Set());
  for (const p in C.relations || {}) walk('lw.rel', 'relations:' + p, C.relations[p], new Set());
  for (const id in C.sealed || {}) walk('lw.seal', 'sealed:' + id, C.sealed[id], new Set());
  for (const id in C.towns || {}) walk('lw.town', 'town:' + id, { beats: C.towns[id].beats }, new Set());
  return out;
}
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const L = lines(RB);
  const dir = path.join(root, 'docs', 'review', 'language');
  const ai = process.argv.indexOf('--add'), ref = ai >= 0 ? process.argv[ai + 1] : null;
  const by = {};
  for (const l of L) (by[l.prefix] = by[l.prefix] || []).push(l);
  let missing = 0;
  for (const p of Object.keys(by)) {
    const f = path.join(dir, p + '.json');
    const led = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : {};
    const keys = new Set(by[p].map((l) => l.key));
    const next = {};
    for (const l of by[p]) {
      if (led[l.key]) next[l.key] = led[l.key];
      else if (ref) next[l.key] = { status: 'self-reviewed', ref, jp: l.jp, en: l.en };
      else { missing++; console.log('no entry: ' + l.key + '  ' + l.jp.slice(0, 50)); }
    }
    const dropped = Object.keys(led).filter((k) => !keys.has(k)).length;
    if (ref) { fs.writeFileSync(f, JSON.stringify(next, null, 1) + '\n'); console.log(p + ': ' + Object.keys(next).length + ' entries (' + dropped + ' stale dropped)'); }
  }
  console.log(L.length + ' new-content lines; ' + (ref ? 'ledger updated' : missing + ' without an entry'));
  process.exit(!ref && missing ? 1 : 0);
}
