// Content validator. Usage: node tools/validate.mjs [--strict] [--unknown] [--filter prefix]
// Exits non-zero on errors. Warnings are listed but don't fail (unless --strict).
import { load } from '../tests/lib/load.mjs';

const args = process.argv.slice(2);
const strict = args.includes('--strict');
const showUnknown = args.includes('--unknown');
const fi = args.indexOf('--filter');
const filter = fi >= 0 ? args[fi + 1] : null;

globalThis.__RB_TEST__ = true;
const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
const C = RB.content;
const errors = [], warns = [];
const E = (m) => errors.push(m), Wn = (m) => warns.push(m);
const unknownTok = new Map();

for (const e of C.scriptErrors || []) E('script: ' + e);

// ---- Japanese text checks -----------------------------------------------------------
function jcheck(line, where) {
  if (line == null || line === '') return;
  if (typeof line !== 'string') { E(where + ': Japanese text is not a string'); return; }
  const probs = RB.jp.validate(line);
  for (const p of probs) E(where + ': ' + (p.msg || p.message || JSON.stringify(p)) + ' in “' + line.slice(0, 50) + '”');
  let toks;
  try { toks = RB.jp.parse(line); } catch (err) { E(where + ': parse failed ' + err.message); return; }
  for (const t of toks) {
    if (t.punct || t.ph) continue;
    if (!/[぀-ヿ一-鿿]/.test(t.surface)) continue;
    let info;
    try { info = RB.jp.lookup(t); } catch (err) { info = { unknown: true }; }
    if (info.unknown) {
      const k = t.surface + (t.reading && t.reading !== t.surface ? '【' + t.reading + '】' : '');
      if (!unknownTok.has(k)) unknownTok.set(k, where);
    }
  }
}
function tiered(o, where, fn) {
  if (!o) return;
  if (o.jp != null || o.en != null) { fn(o, where); return; }
  for (const k of ['F', 'E', 'I', 'A']) if (o[k]) fn(o[k], where + '[' + k + ']');
}
function jen(o, where) {
  if (!o) return;
  jcheck(o.jp, where);
}

// ---- scenes ----------------------------------------------------------------------------
const sceneRefs = new Map(); // id -> where
const ref = (id, where) => { if (id && !sceneRefs.has(id)) sceneRefs.set(id, where); };
const speakers = new Set(['narr', 'pc', 'comp', 'npc']);
const OPS = new Set(['say', 'set', 'unset', 'var', 'give', 'take', 'word', 'technique', 'note', 'quest', 'if', 'goto', 'choice', 'call', 'end', 'challenge', 'activity', 'battle', 'lesson', 'teach', 'warp', 'music', 'sfx', 'emote', 'move', 'face', 'faceplayer', 'wait', 'fade', 'shake', 'autosave', 'checkpoint', 'chapter', 'card', 'journal', 'toast', 'travel', 'refresh', 'recruit', 'depart', 'heal', 'inn', 'shop', 'menu', 'postgame', 'credits', 'speakerless', 'hook']);
for (const id in C.scenes) {
  if (filter && !id.startsWith(filter)) continue;
  const sc = C.scenes[id];
  const where = (c) => `${sc.file || '?'}:${c.line} [${id}]`;
  for (const c of sc.cmds) {
    if (!OPS.has(c.op)) E(where(c) + ' unknown command !' + c.op);
    const a = c.args || [];
    if (c.op === 'say') {
      if (!speakers.has(c.who) && !C.chars[c.who]) E(where(c) + ' unknown speaker ' + c.who);
      if (!c.jp && c.who !== 'narr') Wn(where(c) + ' line without Japanese');
      if (!c.en) E(where(c) + ' line without English');
      jcheck(c.jp, where(c));
    }
    if (c.op === 'choice') for (const o of c.opts) { jcheck(o.jp, where(c)); if (!o.en) E(where(c) + ' choice without English'); }
    if (c.op === 'card' || c.op === 'journal' || c.op === 'toast') jcheck(c.jp, where(c));
    if (c.op === 'call') ref(a[0], where(c));
    if (c.op === 'give' || c.op === 'take') { if (!C.items[a[0]]) E(where(c) + ' unknown item ' + a[0]); }
    if (c.op === 'word') for (const w of a) if (!C.words[w]) E(where(c) + ' unknown word ' + w);
    if (c.op === 'note') for (const n of a) if (!C.notes[n]) E(where(c) + ' unknown note ' + n);
    if (c.op === 'quest') { if (!C.quests[a[0]]) E(where(c) + ' unknown quest ' + a[0]); else if (a[1] && a[1] !== 'done' && a[1] !== 'start' && !(C.quests[a[0]].stages || [])[+a[1]]) E(where(c) + ' quest ' + a[0] + ' has no stage ' + a[1]); }
    if (c.op === 'challenge' && !C.challenges[a[0]]) E(where(c) + ' unknown challenge ' + a[0]);
    if (c.op === 'activity' && !C.activities[a[0]]) E(where(c) + ' unknown activity ' + a[0]);
    if (c.op === 'battle' && !C.enemies[a[0]]) E(where(c) + ' unknown enemy ' + a[0]);
    if (c.op === 'teach' && RB.grammar && !(RB.grammar.get ? RB.grammar.get(a[0]) : null)) E(where(c) + ' unknown grammar point ' + a[0]);
    if (c.op === 'warp') { const m = C.maps[a[0]]; if (!m) E(where(c) + ' unknown map ' + a[0]); }
    if (c.op === 'music' && a[0] !== '-' && RB.audio && RB.audio.songList && !RB.audio.songList().some((s) => s.id === a[0])) Wn(where(c) + ' unknown song ' + a[0]);
    if (c.op === 'recruit' && !['nao', 'mio', 'ren', 'suzu', 'none'].includes(a[0])) E(where(c) + ' bad recruit id');
    if (c.op === 'hook' && !(RB.hooks && RB.hooks[a[0]])) E(where(c) + ' unknown hook ' + a[0]);
  }
}

// ---- maps --------------------------------------------------------------------------------
const compiled = {};
for (const id in C.maps) {
  if (filter && !id.startsWith(filter.split('.')[0])) continue;
  let m;
  try { m = RB.maps.compile(id); compiled[id] = m; } catch (err) { E('map ' + id + ': ' + err.message); continue; }
  const def = m.def;
  const rows = def.terrain;
  const w0 = rows[0].length;
  if (rows.some((r) => r.length !== w0)) E('map ' + id + ': terrain rows have different widths');
  if (def.name) jcheck(def.name.jp, 'map ' + id + ' name');
  const walk = (x, y) => x >= 0 && y >= 0 && x < m.w && y < m.h && !m.block[y * m.w + x];
  const sp = (def.spawn && def.spawn.default) || null;
  if (!sp) E('map ' + id + ': no default spawn');
  else if (!walk(sp[0], sp[1])) E('map ' + id + ': default spawn ' + sp + ' is not walkable');
  for (const e of m.exits) {
    const T = C.maps[e.to];
    if (!T) { E('map ' + id + ': exit to unknown map ' + e.to); continue; }
    if (e.tx == null || e.ty == null) {
      const spn = e.sp || 'default';
      const tsp = T.spawn && T.spawn[spn];
      if (!tsp) { E('map ' + id + ': exit to ' + e.to + ' uses spawn "' + spn + '" which that map does not define'); continue; }
      e.tx = tsp[0]; e.ty = tsp[1];
    }
    let tm; try { tm = RB.maps.compile(e.to); } catch (err) { continue; }
    if (e.tx < 0 || e.ty < 0 || e.tx >= tm.w || e.ty >= tm.h || tm.block[e.ty * tm.w + e.tx]) E('map ' + id + ': exit to ' + e.to + ' lands on blocked/out-of-bounds tile ' + e.tx + ',' + e.ty);
    else if (RB.maps.exitAt(tm, e.tx, e.ty)) E('map ' + id + ': exit to ' + e.to + ' lands ON an exit tile ' + e.tx + ',' + e.ty + ' (would bounce)');
    if (e.locked) ref(e.locked, 'map ' + id + ' exit lock');
  }
  for (const n of def.npcs || []) {
    if (!walk(n.x, n.y) && !(n.block === false)) E('map ' + id + ': NPC ' + n.id + ' stands on a blocked tile ' + n.x + ',' + n.y);
    if (!C.chars[n.char || n.id] && !n.look) Wn('map ' + id + ': NPC ' + n.id + ' has no character definition or look');
    if (typeof n.talk === 'string') ref(n.talk, 'map ' + id + ' npc ' + n.id);
    else for (const t of n.talk || []) ref(t.scene, 'map ' + id + ' npc ' + n.id);
  }
  for (const p of def.props || []) {
    if (!RB.props.P[p.p]) E('map ' + id + ': unknown prop ' + p.p);
    if (p.scene) ref(p.scene, 'map ' + id + ' prop ' + p.p);
    if (p.text) jcheck(p.text.jp, 'map ' + id + ' prop text');
  }
  for (const s of def.structs || []) if (s.x + s.w > m.w || s.y + s.h > m.h) E('map ' + id + ': structure out of bounds at ' + s.x + ',' + s.y);
  for (const t of def.triggers || []) ref(t.scene, 'map ' + id + ' trigger');
  for (const ev of def.onEnter || []) ref(ev.scene, 'map ' + id + ' onEnter');
  for (const f of def.foes || []) { if (!C.enemies[f.enemy]) E('map ' + id + ': foe uses unknown enemy ' + f.enemy); if (!walk(f.x, f.y)) E('map ' + id + ': foe ' + f.id + ' on blocked tile'); if (f.scene) ref(f.scene, 'map ' + id + ' foe'); }
  // reachability of exits from spawn (ignores NPCs; conditional props treated as absent)
  if (sp && walk(sp[0], sp[1])) {
    const seen = new Set([sp[0] + ',' + sp[1]]);
    const q = [[sp[0], sp[1]]];
    while (q.length) {
      const [x, y] = q.shift();
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy, k = nx + ',' + ny;
        if (seen.has(k) || !walk(nx, ny)) continue;
        seen.add(k); q.push([nx, ny]);
      }
    }
    for (const e of m.exits) {
      let ok = false;
      for (let yy = e.y; yy < e.y + e.h; yy++) for (let xx = e.x; xx < e.x + e.w; xx++) if (seen.has(xx + ',' + yy)) ok = true;
      if (!ok) Wn('map ' + id + ': exit to ' + e.to + ' at ' + e.x + ',' + e.y + ' is not reachable from the default spawn');
    }
    for (const n of def.npcs || []) {
      if (!n.talk) continue;
      const adj = [[1, 0], [-1, 0], [0, 1], [0, -1], [2, 0], [-2, 0], [0, 2], [0, -2]].some(([dx, dy]) => seen.has((n.x + dx) + ',' + (n.y + dy)));
      if (!adj) Wn('map ' + id + ': NPC ' + n.id + ' may be unreachable');
    }
  }
}

// ---- quests, items, notes, places -----------------------------------------------------------
for (const id in C.quests) { const q = C.quests[id]; jen(q.title, 'quest ' + id); (q.stages || []).forEach((s, i) => { jen(s, 'quest ' + id + ' stage ' + i); if (!s.en) E('quest ' + id + ' stage ' + i + ' missing English'); }); if (!q.stages || !q.stages.length) E('quest ' + id + ' has no stages'); }
for (const id in C.items) { const it = C.items[id]; jen(it.name, 'item ' + id); if (!it.name || !it.name.en) E('item ' + id + ' missing name'); }
for (const id in C.notes) { const n = C.notes[id]; jen(n.title, 'note ' + id); jcheck(n.jp, 'note ' + id); }
for (const id in C.places) { const p = C.places[id]; jen(p.name, 'place ' + id); const m = compiled[p.map]; if (!C.maps[p.map]) E('place ' + id + ': unknown map ' + p.map); else if (m && m.block[p.y * m.w + p.x]) E('place ' + id + ': arrival tile blocked'); }
for (const id in C.words) { jcheck(C.words[id].jp, 'word ' + id); jcheck(C.words[id].jpK, 'word ' + id); }
for (const b of C.banter || []) { ref(b.scene, 'banter ' + b.comp); if (!['nao', 'mio', 'ren', 'suzu'].includes(b.comp)) E('banter with bad comp ' + b.comp); }
for (const id in C.chars) jcheck(C.chars[id].name && C.chars[id].name.jp, 'char ' + id);

// ---- steps (challenges, drills, enemies, activities) ----------------------------------------------
function checkStep(s, where) {
  if (!s || typeof s !== 'object') { E(where + ': step missing'); return; }
  if (s.ctx) jcheck(s.ctx.jp, where + ' ctx');
  if (s.prompt) jcheck(s.prompt.jp, where + ' prompt');
  if (s.explain) jcheck(s.explain.jp, where + ' explain');
  if (s.kind === 'write') {
    if (!s.answer) E(where + ': write step without answer');
    const acc = (s.accept || [s.answer]).map((a) => RB.jp.plain(a));
    if (s.answer && acc.indexOf(RB.jp.plain(s.answer)) < 0) E(where + ': answer not in accept list');
    if (s.template) { jcheck(s.template.before, where + ' before'); jcheck(s.template.after, where + ' after'); }
    if (s.choices) { const ch = s.choices.map((x) => RB.jp.plain(x)); if (!ch.some((c) => acc.indexOf(c) >= 0)) E(where + ': choices do not include an accepted answer'); }
    if (!['kana', 'reading', 'exact', 'meaning'].includes(s.mode || 'kana')) E(where + ': bad mode ' + s.mode);
  } else if (s.kind === 'choose') {
    if (!s.options || !s.options.some((o) => o.ok)) E(where + ': choose step has no correct option');
    for (const o of s.options || []) jcheck(o.jp, where + ' option');
  } else if (s.kind === 'order') {
    if (!s.tiles || !s.answer) E(where + ': order step needs tiles and answer');
    else if ([...s.tiles].sort().join('|') !== [...s.answer].sort().join('|')) E(where + ': order tiles and answer differ');
    for (const t of s.tiles || []) jcheck(t, where + ' tile');
  } else E(where + ': unknown step kind ' + s.kind);
}
for (const id in C.challenges) {
  const ch = C.challenges[id];
  jen(ch.title, 'challenge ' + id);
  if (ch.tiers) { for (const k in ch.tiers) { if (!['F', 'E', 'I', 'A'].includes(k)) E('challenge ' + id + ': bad tier ' + k); ch.tiers[k].forEach((s, i) => checkStep(s, 'challenge ' + id + '[' + k + '][' + i + ']')); } for (const k of ['F', 'E', 'I', 'A']) if (!ch.tiers[k]) Wn('challenge ' + id + ': no ' + k + ' tier (falls back)'); }
  else (ch.steps || []).forEach((s, i) => checkStep(s, 'challenge ' + id + '[' + i + ']'));
}
(C.drills || []).forEach((d, i) => { checkStep(d, 'drill ' + (d.id || i)); if (!d.lv) E('drill ' + (d.id || i) + ' missing lv'); });
for (const id in C.enemies) {
  const en = C.enemies[id];
  jen(en.name, 'enemy ' + id);
  tiered(en.intro, 'enemy ' + id + ' intro', jen);
  tiered(en.settle, 'enemy ' + id + ' settle', jen);
  const keys = new Set((en.pattern || []).concat(...(en.phases || []).map((p) => p.pattern)));
  for (const k of keys) {
    const kind = k.split(':')[0];
    if (!RB.combatLogic.INTENTS[kind]) E('enemy ' + id + ': unknown intent ' + k);
    const it = (en.intents || {})[k] || {};
    if (kind === 'plea' && !it.answer) E('enemy ' + id + ': plea intent ' + k + ' needs an answer step');
    if ((kind === 'lie' || kind === 'mirror') && !it.truth) E('enemy ' + id + ': ' + kind + ' intent ' + k + ' needs a truth step');
    if (it.answer) tiered(it.answer, 'enemy ' + id + ' ' + k + ' answer', checkStep);
    if (it.truth) tiered(it.truth, 'enemy ' + id + ' ' + k + ' truth', checkStep);
    if (it.text) tiered(it.text, 'enemy ' + id + ' ' + k + ' text', jen);
    if ((kind === 'mirror' || kind === 'lie' || kind === 'plea') && !it.text) E('enemy ' + id + ': ' + k + ' needs authored text');
  }
  for (const ph of en.phases || []) tiered(ph.line, 'enemy ' + id + ' phase', jen);
}
for (const id in C.activities) {
  const a = C.activities[id];
  jen(a.title, 'activity ' + id);
  if (a.type === 'orders') for (const c of a.customers) { tiered(c.line, 'activity ' + id, jen); for (const k in c.want) if (!a.menu.find((m) => m.id === k)) E('activity ' + id + ': wants unknown menu item ' + k); }
  if (a.type === 'letters') for (const l of a.letters) { tiered(l.text, 'activity ' + id, jen); if (!a.recipients.find((r) => r.id === l.to)) E('activity ' + id + ': letter to unknown recipient ' + l.to); }
  if (a.type === 'signpost') for (const arm of a.arms) { tiered(arm.clue, 'activity ' + id, jen); if (!a.places.find((p) => p.id === arm.to)) E('activity ' + id + ': arm to unknown place'); }
  if (a.type === 'history') { for (const f of a.fragments) tiered(f, 'activity ' + id, jen); if (a.question) tiered(a.question, 'activity ' + id + ' question', checkStep); if (a.note && !C.notes[a.note]) E('activity ' + id + ': unknown note ' + a.note); }
}
// intent texts
for (const k in C.intentText) for (const lv in C.intentText[k]) for (const t of C.intentText[k][lv]) jcheck(t.jp, 'intentText ' + k + ' ' + lv);

// dangling scene refs
for (const [id, where] of sceneRefs) if (!C.scenes[id]) E(where + ': missing scene ' + id);
// lexicon
for (const c of RB.lex.conflicts()) Wn('lexicon conflict: ' + JSON.stringify(c).slice(0, 160));
for (const p of RB.lex.problems()) E('lexicon problem: ' + JSON.stringify(p).slice(0, 160));

// ---- report --------------------------------------------------------------------------------------
const counts = {
  scenes: Object.keys(C.scenes).length, lines: Object.values(C.scenes).reduce((n, s) => n + s.cmds.filter((c) => c.op === 'say').length, 0),
  maps: Object.keys(C.maps).length, quests: Object.keys(C.quests).length, side: Object.values(C.quests).filter((q) => !q.main).length,
  enemies: Object.keys(C.enemies).length, challenges: Object.keys(C.challenges).length, drills: (C.drills || []).length,
  activities: Object.keys(C.activities).length, lexicon: RB.lex.all().length, unknownTokens: unknownTok.size,
};
console.log('content:', JSON.stringify(counts));
if (showUnknown && unknownTok.size) {
  const rows = [...unknownTok].filter(([k, w]) => !filter || w.indexOf(filter) >= 0);
  console.log('\nTokens without a dictionary entry' + (filter ? ' (in ' + filter + ' content)' : '') + ': ' + rows.length + ' — add them to your lexicon file:');
  for (const [k, w] of rows) console.log('  ' + k + '   ← ' + w);
}
if (warns.length) { console.log('\n' + warns.length + ' warning(s):'); warns.slice(0, 200).forEach((w) => console.log('  W ' + w)); }
if (errors.length) { console.log('\n' + errors.length + ' error(s):'); errors.slice(0, 300).forEach((e) => console.log('  E ' + e)); }
else console.log('\nno errors');
process.exit(errors.length || (strict && warns.length) ? 1 : 0);
