// Content validator. Usage: node tools/validate.mjs [--strict] [--unknown] [--filter prefix] [--stats]
// Exits non-zero on errors. Warnings are listed but don't fail (unless --strict).
import { load } from '../tests/lib/load.mjs';

const args = process.argv.slice(2);
const strict = args.includes('--strict');
const showUnknown = args.includes('--unknown');
const fi = args.indexOf('--filter');
const filter = fi >= 0 ? args[fi + 1] : null;

globalThis.__RB_TEST__ = true;
const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
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
// backdrops painted as interiors / as open country (RB.combat uses the same lists), and whether a
// map reads as indoors (RB.render.enclosed: an interior region, def.indoor, or
// a border that is mostly wall)
const INDOOR_BG = new Set(['mill', 'archive', 'kiln', 'observatory', 'belltower']);
const OUTDOOR_BG = new Set(['reedwake', 'saltglass', 'cinder', 'snowbell', 'lanternfall']); // 'still' and 'atlas' are open, dreamlike places
function indoorMap(m, def) {
  if (m.region === 'interior' || def.indoor) return true;
  let wall = 0, n = 0;
  const at = (x, y) => { n++; if (m.tiles[y * m.w + x].id === 'wall') wall++; };
  for (let x = 0; x < m.w; x++) { at(x, 0); at(x, m.h - 1); }
  for (let y = 1; y < m.h - 1; y++) { at(0, y); at(m.w - 1, y); }
  return wall / n >= 0.5;
}
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
    // a dead lantern the player can interact with must either light (a lit
    // lantern on the same tile under the opposite condition) or be declared
    // as staying dark — a scene that says it glows must show it glowing
    if (p.p === 'deadlantern' && p.scene && !(p.o && p.o.staysDark)) {
      const twin = (def.props || []).some((q) => q !== p && q.x === p.x && q.y === p.y && /lantern|lamp/.test(q.p) && q.p !== 'deadlantern' && q.if && p.if && (q.if === '!' + p.if || p.if === '!' + q.if));
      if (!twin) E('map ' + id + ': dead lantern at ' + p.x + ',' + p.y + ' (' + p.scene + ') has no lit twin — add one, or mark it o: { staysDark: true }');
    }
    if (p.text) jcheck(p.text.jp, 'map ' + id + ' prop text');
  }
  for (const s of def.structs || []) if (s.x + s.w > m.w || s.y + s.h > m.h) E('map ' + id + ': structure out of bounds at ' + s.x + ',' + s.y);
  // going in through a door puts you on the building's entry mat; coming out
  // puts you on the tile in front of the door
  for (const s of def.structs || []) {
    if (s.door == null || !s.to || !C.maps[s.to]) continue;
    const inner = C.maps[s.to], mat = (inner.props || []).find((q) => q.p === 'exitmat');
    if (mat && s.spawn && (s.spawn[0] !== mat.x || s.spawn[1] !== mat.y)) E('map ' + id + ': door into ' + s.to + ' spawns at ' + s.spawn + ' but its entry mat is at ' + mat.x + ',' + mat.y);
    const fx = s.x + s.door, fy = s.y + s.h;
    for (const e of inner.exits || []) if (e.to === id && e.tx != null && (Math.abs(e.tx - fx) + Math.abs(e.ty - fy) > 0)) E('map ' + s.to + ': exit to ' + id + ' lands at ' + e.tx + ',' + e.ty + ', not in front of its door (' + fx + ',' + fy + ')');
  }
  for (const t of def.triggers || []) ref(t.scene, 'map ' + id + ' trigger');
  for (const ev of def.onEnter || []) ref(ev.scene, 'map ' + id + ' onEnter');
  for (const h of def.hold || []) ref(h.scene, 'map ' + id + ' hold');
  for (const f of def.foes || []) { if (!C.enemies[f.enemy]) E('map ' + id + ': foe uses unknown enemy ' + f.enemy); if (!walk(f.x, f.y)) E('map ' + id + ': foe ' + f.id + ' on blocked tile'); if (f.scene) ref(f.scene, 'map ' + id + ' foe'); }
  // an encounter's backdrop and lines follow its place: a creature placed
  // indoors when it usually lives outdoors (or the reverse) carries its own
  // backdrop and its own intro/settle lines for that place
  for (const f of def.foes || []) {
    const en = C.enemies[f.enemy];
    if (!en) continue;
    const here = indoorMap(m, def) ? 'indoor' : 'outdoor', bg = f.bg || en.bg || en.region;
    // lines: enemy.setting names the place its own intro/settle describe (none: any place)
    if (en.setting && en.setting !== here && !(f.intro && f.settle)) E('map ' + id + ': foe ' + f.id + ' (' + f.enemy + ') is ' + here + 's but its lines describe an ' + en.setting + ' place — give the placement its own intro and settle');
    // backdrop: an interior backdrop out of doors, or open country indoors, needs the placement's own bg
    if ((here === 'outdoor' && INDOOR_BG.has(bg)) || (here === 'indoor' && OUTDOOR_BG.has(bg))) E('map ' + id + ': foe ' + f.id + ' (' + f.enemy + ') would fight in front of the ' + bg + ' backdrop, which is not ' + (here === 'indoor' ? 'an interior' : 'out of doors') + ' — give the placement a bg that fits');
    if (f.intro) tiered(f.intro, 'map ' + id + ' foe ' + f.id + ' intro', jen);
    if (f.settle) tiered(f.settle, 'map ' + id + ' foe ' + f.id + ' settle', jen);
    // a group (more creatures on Standard / Demanding): known creatures, at most
    // one more on Standard and two on Demanding, never a guardian, and each one's
    // own settle line (shown when it settles mid-encounter) must fit this place
    if (f.group) {
      const g = f.group;
      for (const k of Object.keys(g)) if (k !== 'normal' && k !== 'hard') E('map ' + id + ': foe ' + f.id + ' group has an unknown setting ' + k + ' (normal | hard)');
      if ((g.normal || []).length > 1) E('map ' + id + ': foe ' + f.id + ' group brings more than one more creature on Standard');
      if ((g.hard || []).length > 2) E('map ' + id + ': foe ' + f.id + ' group brings more than two more creatures on Demanding');
      for (const gid of [...(g.normal || []), ...(g.hard || [])]) {
        const ge = C.enemies[gid];
        if (!ge) { E('map ' + id + ': foe ' + f.id + ' group uses unknown enemy ' + gid); continue; }
        if (ge.boss) E('map ' + id + ': foe ' + f.id + ' group brings a guardian (' + gid + ')');
        if (ge.setting && ge.setting !== here) E('map ' + id + ': foe ' + f.id + ' group member ' + gid + ' has lines for an ' + ge.setting + ' place, but this is ' + here + 's');
      }
    }
  }
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
    // interactable props: some tile next to their footprint must be reachable
    for (const pr of def.props || []) {
      if (!pr.scene && !pr.text) continue;
      const pd = RB.props.P[pr.p] || {};
      const pw = pr.w || pd.w || 1, ph = pr.h || pd.h || 1;
      let ok = false;
      for (let yy = pr.y; yy < pr.y + ph && !ok; yy++) for (let xx = pr.x; xx < pr.x + pw && !ok; xx++) {
        ok = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => seen.has((xx + dx) + ',' + (yy + dy)));
      }
      if (!ok) Wn('map ' + id + ': prop ' + pr.p + ' at ' + pr.x + ',' + pr.y + ' (' + (pr.scene || 'text') + ') may be unreachable from the default spawn');
    }
  }
}

// ---- quests, items, notes, places -----------------------------------------------------------
for (const id in C.quests) { const q = C.quests[id]; jen(q.title, 'quest ' + id); (q.stages || []).forEach((s, i) => { jen(s, 'quest ' + id + ' stage ' + i); if (!s.en) E('quest ' + id + ' stage ' + i + ' missing English'); }); if (!q.stages || !q.stages.length) E('quest ' + id + ' has no stages'); }
// quest guidance (src/engine/56_questguide.js): a stage's authored `hint` is
// bilingual, and its `at` names real places ({map, npc} | {map, prop, x, y} | {map, x, y} | {map}, a list, or 'open')
for (const id in C.quests) (C.quests[id].stages || []).forEach((s, i) => {
  const w = 'quest ' + id + ' stage ' + i;
  if (s.hint) { jen(s.hint, w + ' hint'); if (!s.hint.en || !s.hint.jp) E(w + ' hint needs jp and en'); }
  if (s.at == null || s.at === 'open') return;
  for (const a of [].concat(s.at)) {
    const m = a && C.maps[a.map];
    if (!m) { E(w + ' at: unknown map ' + (a && a.map)); continue; }
    if (a.npc && !(m.npcs || []).some((n) => n.id === a.npc)) E(w + ' at: no npc ' + a.npc + ' on ' + a.map);
    if (a.prop && !(m.props || []).some((p) => p.x === a.x && p.y === a.y)) E(w + ' at: no prop at ' + a.x + ',' + a.y + ' on ' + a.map);
  }
});
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

// ---- addendum registries: text kept outside scenes (keepsakes, cases and clues, puzzle
// definitions, companion reactions and conversations, pets' meetings, the Pages We Keep, Known
// Details). Every
// `jp` string (and a clue's language word `w`) is checked like a scene line.
let regTexts = 0;
{
  const seen = new Set();
  const walk = (o, where) => {
    if (!o || typeof o !== 'object' || seen.has(o)) return;
    seen.add(o);
    for (const k of Object.keys(o)) {
      const v = o[k];
      if ((k === 'jp' || k === 'w') && typeof v === 'string') { regTexts++; jcheck(v, where); }
      else if (v && typeof v === 'object') walk(v, where + '.' + k);
    }
  };
  const FW = RB.fieldweave, P = RB.pets, PG = RB.pages;
  const roots = {
    keepsakes: C.keepsakes, cases: C.cases, clues: C.clues, caseReactions: C.caseReactions,
    reactions: RB.company && RB.company.reactions, bondStages: RB.company && RB.company.STAGES,
    puzzles: FW && FW.list().map((id) => FW.get(id)),
    pets: P && { species: P.SPECIES, vignettes: P.vignettes, meeting: P.meeting },
    pages: PG && { COMPS: PG.COMPS, PQ: PG.PQ, PROJECT: PG.PROJECT, REPLY: PG.REPLY, RET: PG.RET, MEMO_TITLE: PG.MEMO_TITLE, TOPICS: PG.TOPICS, MEM: PG.MEM, SHOW: PG.SHOW },
    known: RB.known && { TYPES: RB.known.TYPES, STATE_WORD: RB.known.STATE_WORD },
    company: C.company,
    wordplay: { content: C.wordplay, BAND: RB.wordplay && RB.wordplay.BAND, LEVEL: RB.wordplay && RB.wordplay.LEVEL }, // companion shiritori (docs/practice/wordplay.md)
  };
  for (const k in roots) walk(roots[k], k);
}

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
  activities: Object.keys(C.activities).length, registryTexts: regTexts, lexicon: RB.lex.all().length, unknownTokens: unknownTok.size,
};
console.log('content:', JSON.stringify(counts));
if (args.includes('--stats')) {
  // per-prefix breakdown (scene/map/enemy/challenge ids are '<prefix>.<name>'; quests carry `chapter`)
  const by = {};
  const row = (k) => (by[k] = by[k] || { maps: 0, scenes: 0, lines: 0, words: 0, main: 0, side: 0, enemies: 0, bosses: 0, challenges: 0 });
  const pre = (id) => String(id).split(/[._]/)[0];
  for (const id in C.maps) row(pre(id)).maps++;
  for (const id in C.scenes) {
    const r = row(pre(id)); r.scenes++;
    for (const c of C.scenes[id].cmds) if (c.op === 'say') { r.lines++; r.words += String(c.en || '').split(/\s+/).filter(Boolean).length; }
  }
  for (const id in C.enemies) { const r = row(pre(id)); r.enemies++; if (C.enemies[id].boss) r.bosses++; }
  for (const id in C.challenges) row(pre(id)).challenges++;
  for (const id in C.quests) row(pre(id))[C.quests[id].main ? 'main' : 'side']++;
  console.log('\nper prefix (lines = spoken/narrated dialogue lines; words = English gloss words):');
  for (const k of Object.keys(by).sort()) console.log('  ' + k.padEnd(8) + JSON.stringify(by[k]));
}
if (showUnknown && unknownTok.size) {
  const rows = [...unknownTok].filter(([k, w]) => !filter || w.indexOf(filter) >= 0);
  console.log('\nTokens without a dictionary entry' + (filter ? ' (in ' + filter + ' content)' : '') + ': ' + rows.length + ' — add them to your lexicon file:');
  for (const [k, w] of rows) console.log('  ' + k + '   ← ' + w);
}
if (warns.length) { console.log('\n' + warns.length + ' warning(s):'); warns.slice(0, 200).forEach((w) => console.log('  W ' + w)); }
if (errors.length) { console.log('\n' + errors.length + ' error(s):'); errors.slice(0, 300).forEach((e) => console.log('  E ' + e)); }
else console.log('\nno errors');
process.exit(errors.length || (strict && warns.length) ? 1 : 0);
