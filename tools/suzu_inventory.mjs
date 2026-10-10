// Inventory of every line Suzu speaks (docs/dialect/suzu_kansai.md), for the content validator
// (tools/validate.mjs) and the unit test tests/unit/dialect_kansai.test.mjs.
//
//   suzuInventory(RB) -> { lines, labels, byKey, scan }
//     lines  [{ key, jp, en, src, sys, where, template? }]  one per place a line is authored
//     labels [{ jp, en, where, why }]                       Suzu-related Japanese that is not speech
//     byKey  Map(normalised standard Japanese -> [line, ...])
//     scan   source-scan leftovers: Suzu-attributed Japanese literals in src/ found by neither
//            the extractors nor the label list (must be empty)
//
// What counts as Suzu's speech (sys):
//   scene      a scene line `suzu:`; or a `comp:` line that Suzu can speak — found by a flow
//              analysis of each scene (line conditions, `!if comp=… -> label`, choices, `!call`)
//              starting from what is known about how the scene is entered (map entries with
//              their conditions, banter, invitations, topics, rituals, reflections)
//   company    bios (her first words), memory replies and callbacks, What We Keep frames, thoughts
//              (incl. decisions and wordplay thoughts), "Talk about this place", words on meeting an
//              animal, reactions (puzzles, cases)
//   wordplay   shiritori table lines
//   fishing    A Quiet Cast remarks and her memory reply
//   pets       a meeting's recorded reply
//   pages      The Pages We Keep: recollections (one is a template), the pinned programme's words
//   atlas      the Unwritten Atlas companion lines (RB.atlas.compLines)
// A template line (a %T or a function's title argument) is listed with %T in place of the
// title; the dialect table carries the same placeholder.
import fs from 'node:fs';
import path from 'node:path';

const COMPS = ['nao', 'mio', 'ren', 'suzu', 'none'];
const ALL = () => new Set(COMPS);
export const norm = (jp) => String(jp == null ? '' : jp).replace(/\s+/g, ' ').trim();

// ---- conditions: which companions can a condition hold for? -----------------------------------------------
// { set, pure }: set = identities for which it can be true; pure = it constrains nothing else
// (so its negation is exactly the complement). comp / party / prov all name the speaker of `comp:`.
export function idSet(cond) {
  if (cond == null || String(cond).trim() === '') return { set: ALL(), pure: false };
  const out = new Set();
  let pure = true;
  for (const alt of String(cond).split('|')) {
    let s = ALL();
    for (let t of alt.split('&')) {
      t = t.trim();
      if (!t) continue;
      const m = /^(!?)(comp|party|prov)(?:(!=|==|=)([a-z_]+))?$/.exec(t);
      if (!m) { pure = false; continue; }
      const neg = m[1] === '!';
      let allowed;
      if (!m[3]) allowed = neg ? new Set(['none']) : new Set(COMPS.filter((c) => c !== 'none'));
      else {
        const eq = (m[3] !== '!=') !== neg;
        allowed = eq ? new Set([m[4]]) : new Set(COMPS.filter((c) => c !== m[4]));
      }
      s = new Set([...s].filter((x) => allowed.has(x)));
    }
    s.forEach((x) => out.add(x));
  }
  return { set: out, pure };
}
const inter = (a, b) => new Set([...a].filter((x) => b.has(x)));
const minus = (a, b) => new Set([...a].filter((x) => !b.has(x)));
const union = (a, b) => { const o = new Set(a); b.forEach((x) => o.add(x)); return o; };
const same = (a, b) => a.size === b.size && [...a].every((x) => b.has(x));

// ---- how each scene can be entered -------------------------------------------------------------------------
function entrySets(RB) {
  const C = RB.content, CC = C.company || {};
  const E = new Map();
  const add = (id, set) => { if (!id) return; E.set(id, E.has(id) ? union(E.get(id), set) : set); };
  const only = (c) => new Set([c]);
  const cs = (cond) => idSet(cond).set;
  for (const id in C.maps) {
    const m = C.maps[id];
    for (const n of m.npcs || []) {
      const base = cs(n.if);
      if (typeof n.talk === 'string') add(n.talk, base);
      else for (const t of n.talk || []) add(t.scene, inter(base, cs(t.if)));
    }
    for (const p of m.props || []) if (p.scene) add(p.scene, cs(p.if));
    for (const t of m.triggers || []) add(t.scene, cs(t.if));
    for (const ev of m.onEnter || []) add(ev.scene, cs(ev.if));
    for (const h of m.hold || []) add(h.scene, cs(h.if));
    for (const f of m.foes || []) if (f.scene) add(f.scene, cs(f.if));
    for (const e of m.exits || []) if (e.locked) add(e.locked, cs(e.if));
  }
  for (const b of C.banter || []) add(b.scene, inter(only(b.comp), cs(b.if)));
  const perComp = (o, c) => (typeof o === 'string' ? add(o, c ? only(c) : ALL()) : o && Object.keys(o).forEach((k) => add(o[k], k === '*' ? ALL() : only(k))));
  for (const inv of CC.invites || []) { perComp(inv.scene, inv.comp); perComp(inv.after, inv.comp); }
  for (const t of CC.topics || []) add(t.scene, only(t.comp));
  for (const c in CC.rituals || {}) add(CC.rituals[c].scene, only(c));
  if (RB.company && RB.company.REFLECT) for (const r of RB.company.REFLECT) for (const c of COMPS) add(r.scene(c), only(c));
  const W = C.wordplay;
  if (W && W.reflections) for (const c in W.reflections) add(W.reflections[c], only(c));
  return E;
}

// ---- the flow analysis -------------------------------------------------------------------------------------------
function sceneLines(RB) {
  const C = RB.content;
  const entry = entrySets(RB);
  const callIn = new Map(); // scene -> set from its callers
  const ids = Object.keys(C.scenes);
  // scenes nobody enters through known data: anyone (a hook, the folio, code) — except a scene whose id
  // names another companion's own story (e.g. sb.quiet_ren, lf.nao_umi_first), entered by code for them
  const tok = (id) => (/(?:^|[._])(nao|mio|ren|suzu)(?=$|[._\d])/.exec(id) || [])[1] || null;
  const start = (id) => {
    let s = entry.has(id) ? entry.get(id) : null;
    if (callIn.has(id)) s = s ? union(s, callIn.get(id)) : callIn.get(id);
    if (s) return s;
    const t = tok(id);
    return t && t !== 'suzu' ? new Set([t]) : ALL();
  };
  const result = new Map(); // `${id}#${i}` -> set
  for (let round = 0; round < 12; round++) {
    let changed = false;
    for (const id of ids) {
      const sc = C.scenes[id];
      const n = sc.cmds.length;
      const inn = new Array(n + 1).fill(null);
      const put = (i, set) => { if (i == null || i > n || !set.size) return; inn[i] = inn[i] ? union(inn[i], set) : set; };
      const lbl = (l) => (l === 'end' ? n : sc.labels[l]);
      put(0, start(id));
      // labels can be jumped to from later commands: iterate the scene to its own fixed point
      for (let pass = 0; pass < 8; pass++) {
        const before = inn.map((x) => (x ? [...x].sort().join() : ''));
        for (let i = 0; i < n; i++) {
          const cur = inn[i];
          if (!cur) continue;
          const c = sc.cmds[i];
          const eff = c.if ? inter(cur, idSet(c.if).set) : cur;
          const skip = c.if ? cur : new Set();
          switch (c.op) {
            case 'say': {
              const k = id + '#' + i;
              const prev = result.get(k);
              if (!prev || !same(prev, union(prev, eff))) { result.set(k, prev ? union(prev, eff) : eff); changed = true; }
              put(i + 1, cur);
              break;
            }
            case 'if': {
              const a = c.args.indexOf('->');
              const cond = c.args.slice(0, a).join(' ');
              const { set, pure } = idSet(cond);
              put(lbl(c.args[a + 1]), inter(eff, set));
              put(i + 1, pure && !c.if ? minus(cur, inter(eff, set)) : cur);
              break;
            }
            case 'goto': put(lbl(c.args[0]), eff); put(i + 1, skip); break;
            case 'end': put(i + 1, skip); break;
            case 'choice': {
              let next = skip;
              for (const o of c.opts) {
                const os = inter(eff, idSet(o.if).set);
                if (o.to) put(lbl(o.to), os); else next = union(next, os);
              }
              put(i + 1, next);
              break;
            }
            case 'call': {
              const t = c.args[0];
              if (C.scenes[t]) {
                const prev = callIn.get(t);
                const nw = prev ? union(prev, eff) : eff;
                if (!prev || !same(prev, nw)) { callIn.set(t, nw); changed = true; }
              }
              put(i + 1, cur);
              break;
            }
            default: put(i + 1, cur);
          }
        }
        const after = inn.map((x) => (x ? [...x].sort().join() : ''));
        if (after.every((x, j) => x === before[j])) break;
      }
    }
    if (!changed) break;
  }
  const out = [];
  for (const id of ids) {
    const sc = C.scenes[id];
    sc.cmds.forEach((c, i) => {
      if (c.op !== 'say' || !c.jp) return;
      const set = result.get(id + '#' + i);
      const who = c.who;
      if (who === 'suzu' || (who === 'comp' && set && set.has('suzu'))) {
        out.push({ jp: c.jp, en: c.en, sys: 'scene', src: 'src/content/' + (sc.file || '?') + '.js', where: (sc.file || '?') + ':' + c.line + ' [' + id + ']', who, generic: who === 'comp' && set.size > 1 });
      }
    });
  }
  return out;
}

// ---- registries ----------------------------------------------------------------------------------------------------
const TITLE = { jp: '%T', en: '%T' };
function registryLines(RB) {
  const C = RB.content, CC = C.company || {};
  const out = [];
  const push = (sys, where, o, extra) => {
    if (!o) return;
    if (Array.isArray(o)) { o.forEach((x, i) => push(sys, where + '[' + i + ']', x, extra)); return; }
    if (typeof o.jp !== 'string' || !o.jp) return;
    out.push(Object.assign({ jp: o.jp, en: o.en || '', sys, where }, extra || {}));
  };
  // company
  if (CC.bios && CC.bios.suzu) push('company', 'company.bios.suzu.first', CC.bios.suzu.first);
  for (const k in CC.mem || {}) {
    const m = CC.mem[k];
    if (m.reply && m.reply.suzu) push('company', 'company.mem.' + k + '.reply', m.reply.suzu);
    if (m.keep && m.keep.suzu) push('company', 'company.mem.' + k + '.keep', m.keep.suzu);
  }
  if (CC.keep) {
    if (CC.keep.frame && CC.keep.frame.suzu) push('company', 'company.keep.frame (What We Keep: %T is the moment\'s title)', CC.keep.frame.suzu, { template: true });
    if (CC.keep.none && CC.keep.none.suzu) push('company', 'company.keep.none', CC.keep.none.suzu);
  }
  (CC.thoughts || []).forEach((t, i) => { if (t.comp === 'suzu') push('company', 'company.thoughts[' + i + '] (' + t.kind + (t.on ? ' ' + t.on : '') + ')', t.text); });
  (CC.places || []).forEach((p, i) => { if (p.comp === 'suzu') push('company', 'company.places[' + i + '] (' + [].concat(p.where).join(',') + ')', p.lines); });
  if (CC.pets && CC.pets.suzu) for (const sp in CC.pets.suzu) push('company', 'company.pets.suzu.' + sp, CC.pets.suzu[sp]);
  for (const r of (RB.company && RB.company.reactions) || []) {
    if (r.comp !== 'suzu') continue;
    const sys = String(r.event).startsWith('case:') ? 'cases' : 'discovery';
    push(sys, 'reaction ' + r.id, r.lines);
    if (r.thought) push(sys, 'reaction ' + r.id + ' (thought)', r.thought);
  }
  // wordplay
  for (const l of (C.wordplay && C.wordplay.lines) || []) if (l.comp === 'suzu') push('wordplay', 'wordplay ' + l.id, l);
  // fishing
  const F = RB.fishing && RB.fishing.content ? RB.fishing.content() : null;
  if (F && F.remarks) {
    const R = F.remarks.suzu || {};
    for (const k in R) push('fishing', 'fishing.remarks.suzu.' + k, R[k]);
    const M = F.remarks.__memories || {};
    for (const k in M) if (M[k].reply && M[k].reply.suzu) push('fishing', 'fishing.memories.' + k + '.reply', M[k].reply.suzu);
  }
  // pets
  const PM = (RB.pets && RB.pets.meeting) || {};
  for (const sp in PM) if (PM[sp].reply && PM[sp].reply.suzu) push('pets', 'pets.meeting.' + sp + '.reply', PM[sp].reply.suzu);
  // The Pages We Keep
  const PG = RB.pages || {};
  if (PG.RECALL && PG.RECALL.suzu) {
    const R = PG.RECALL.suzu;
    for (const k in R) {
      if (typeof R[k] === 'function') push('pages', 'pages.RECALL.suzu.' + k + ' (template: the memory\'s title)', R[k](TITLE), { template: true });
      else push('pages', 'pages.RECALL.suzu.' + k, R[k]);
    }
  }
  if (PG.SHOW && PG.SHOW.suzu && PG.SHOW.suzu.say) push('pages', 'pages.SHOW.suzu.say', PG.SHOW.suzu.say);
  // the Unwritten Atlas
  const AL = RB.atlas && RB.atlas.compLines;
  if (AL) {
    for (const k in AL) {
      const t = AL[k];
      if (t.suzu) push('atlas', 'atlas.' + k + '.suzu', t.suzu);
      else for (const j in t) if (t[j] && t[j].suzu) push('atlas', 'atlas.' + k + '.' + j + '.suzu', t[j].suzu);
    }
  }
  // New Game+'s farewell (src/content/records/10_ngplus.js)
  if (C.ngFarewell && C.ngFarewell.suzu) push('ngplus', 'ngplus.farewell.suzu', C.ngFarewell.suzu);
  return out;
}

// ---- Suzu-related Japanese that is not her speech (kept standard on purpose) ---------------------------------
function labelLines(RB) {
  const C = RB.content;
  const out = [];
  const L = (o, where, why) => { if (o && typeof o.jp === 'string' && o.jp) out.push({ jp: o.jp, en: o.en || '', where, why }); };
  const ch = C.chars && C.chars.suzu;
  if (ch) { L(ch.name, 'chars.suzu.name', 'her name'); L(ch.role, 'chars.suzu.role', 'a label (her role)'); }
  for (const a of (C.companionActions && C.companionActions.suzu) || []) L(a.name, 'companionActions.' + a.id, 'a battle menu label');
  const CC = C.company || {};
  for (const k in CC.mem || {}) { const m = CC.mem[k]; if (m.texts && m.texts.suzu) L(m.texts.suzu, 'company.mem.' + k + '.texts.suzu', 'narration (the memory\'s text)'); }
  if (CC.rituals && CC.rituals.suzu) L(CC.rituals.suzu.title, 'company.rituals.suzu.title', 'a rest-menu label');
  for (const t of CC.topics || []) if (t.comp === 'suzu') L(t.title, 'company.topics ' + t.id, 'a topic title (label)');
  const PG = RB.pages || {};
  const P = PG.PROJECT && PG.PROJECT.suzu;
  if (P) {
    L(P.title, 'pages.PROJECT.suzu.title', 'the programme\'s title (written text)');
    L(P.place, 'pages.PROJECT.suzu.place', 'a place label');
    for (const k in P.themes || {}) L(P.themes[k], 'pages.PROJECT.suzu.themes.' + k, 'a reply option (label)');
    for (const k in P.aspects || {}) L(P.aspects[k], 'pages.PROJECT.suzu.aspects.' + k, 'a reply option (label)');
    for (const k in P.captions || {}) P.captions[k].forEach((x, i) => L(x, 'pages.PROJECT.suzu.captions.' + k + '[' + i + ']', 'a caption written on the programme'));
  }
  if (PG.MEMO_TITLE && PG.MEMO_TITLE.ending) L(PG.MEMO_TITLE.ending.suzu, 'pages.MEMO_TITLE.ending.suzu', 'a memory title');
  if (PG.REPLY && PG.REPLY.suzu) PG.REPLY.suzu.forEach((r) => { L(r, 'pages.REPLY.suzu.' + r.id, 'the player\'s reply'); L(r.resp, 'pages.REPLY.suzu.' + r.id + '.resp', 'narration'); });
  if (PG.SHOW && PG.SHOW.suzu) { for (const k of ['narr', 'inside']) if (typeof PG.SHOW.suzu[k] === 'function') L(PG.SHOW.suzu[k](TITLE), 'pages.SHOW.suzu.' + k, 'narration'); }
  const ks = C.keepsakes && C.keepsakes.pages_suzu;
  if (ks) L(ks.name, 'keepsakes.pages_suzu.name', 'a keepsake name');
  const relic = C.atlas && C.atlas.relics && C.atlas.relics.mask_suzu;
  if (relic) L(relic.name, 'atlas.relics.mask_suzu.name', 'an item name');
  const w = C.words && C.words.suzu;
  if (w) { L(w, 'words.suzu', 'the inscription word 鈴 (bell), not Suzu'); if (w.jpK) L({ jp: w.jpK }, 'words.suzu.jpK', 'the inscription word 鈴 (bell), not Suzu'); if (w.lex) L({ jp: w.lex }, 'words.suzu.lex', 'the inscription word 鈴 (bell), not Suzu'); }
  if (RB.pets && RB.pets.meeting) for (const sp in RB.pets.meeting) { /* titles and texts: narration */ }
  // the encounter platform (src/engine/97_encounter.js): Suzu's options in an encounter are menu labels
  for (const id in C.encounters || {}) {
    const d = C.encounters[id];
    for (const a of ((d.companion || {}).suzu || []).concat(((d.social && d.social.companion) || {}).suzu || [])) L(a.name, 'encounters.' + id + '.' + a.id, 'an encounter menu label');
  }
  return out;
}

// ---- the source scan (the safety net) ---------------------------------------------------------------------------
// Every single-quoted Japanese literal in src/**/*.js that sits in a Suzu context — on a line naming
// 'suzu' / suzu: as an argument or key, or inside a call or object opened on such a line — must be
// found by the extractors above or listed as a label. Scene text (template literals) is covered by
// the flow analysis instead. New tables of her words therefore fail the unit test until they are
// added to the inventory (and given Kansai versions).
const JP_RE = /[぀-ヿ一-鿿]/;
// a companion named as an object key (suzu:) or as a quoted argument ('suzu')
const MARK_RE = /(?:^|[^\w.$])(nao|mio|ren|suzu)\s*:(?!:)|['"](nao|mio|ren|suzu)['"]|\.(nao|mio|ren|suzu)\s*=(?!=)/g;
function lastMark(text) {
  let m, last = null;
  MARK_RE.lastIndex = 0;
  while ((m = MARK_RE.exec(text))) last = { comp: m[1] || m[2] || m[3], at: m.index + m[0].length };
  return last;
}
export function scanSource(root, known) {
  const files = [];
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
    const p = path.join(d, e.name);
    if (e.isDirectory()) { if (!/[/\\]dialect$/.test(p)) walk(p); } else if (e.name.endsWith('.js') && !/dialect/.test(e.name)) files.push(p);
  });
  walk(path.join(root, 'src'));
  const joined = '\n' + [...known].join('\n') + '\n';
  const left = [];
  for (const f of files) {
    const src = fs.readFileSync(f, 'utf8');
    // a light tokenizer: strings, template literals (skipped: scenes), comments, brackets
    let i = 0, line = 1, depth = 0, lineStart = 0, lastOpenCol = -1;
    const stack = []; // { depth, comp } — a bracket opened right after a companion's key or argument
    const n = src.length;
    while (i < n) {
      const ch = src[i];
      if (ch === '\n') { line++; i++; lineStart = i; lastOpenCol = -1; continue; }
      if (ch === '/' && src[i + 1] === '/') { while (i < n && src[i] !== '\n') i++; continue; }
      if (ch === '/' && src[i + 1] === '*') { i += 2; while (i < n && !(src[i] === '*' && src[i + 1] === '/')) { if (src[i] === '\n') { line++; lineStart = i + 1; } i++; } i += 2; continue; }
      if (ch === '`') { i++; while (i < n && src[i] !== '`') { if (src[i] === '\\') i++; else if (src[i] === '\n') { line++; lineStart = i + 1; } i++; } i++; continue; }
      if (ch === '\'' || ch === '"') {
        const q = ch; let j = i + 1, s = '';
        while (j < n && src[j] !== q && src[j] !== '\n') { if (src[j] === '\\') { s += src[j + 1]; j += 2; } else s += src[j++]; }
        if (/^(nao|mio|ren|suzu)$/.test(s) && /[(,]\s*$/.test(src.slice(lineStart, i))) {
          // a companion given as an argument: the rest of this call is theirs (P('suzu', …, T(…)))
          if (stack.length && stack[stack.length - 1].depth === depth) stack[stack.length - 1].comp = s;
          else stack.push({ depth, comp: s });
        } else if (JP_RE.test(s) && !/[A-Za-z]{3,}/.test(s)) {
          const before = src.slice(lineStart, i);
          const mk = lastMark(before);
          const comp = mk && mk.at > lastOpenCol ? mk.comp : stack.length ? stack[stack.length - 1].comp : null;
          if (comp === 'suzu') {
            const k = norm(s);
            const prev = src.slice(lineStart, i).trimEnd().slice(-1), next = src.slice(j + 1).trimStart()[0];
            const fragment = prev === '+' || next === '+';
            const ok = known.has(k) || (fragment && k && joined.indexOf(k) >= 0);
            if (!ok) left.push({ file: path.relative(root, f), line, jp: s });
          }
        }
        i = j + 1; continue;
      }
      if (ch === '(' || ch === '{' || ch === '[') {
        depth++;
        const before = src.slice(lineStart, i);
        const mk = lastMark(before);
        // the bracket belongs to the nearest companion named before it on this line (and after the
        // previous bracket opened on the line), e.g. `suzu: {`, `suzu: T(`, `P('suzu', …, T(`
        if (mk && mk.at > lastOpenCol) stack.push({ depth, comp: mk.comp });
        lastOpenCol = i - lineStart;
        i++; continue;
      }
      if (ch === ')' || ch === '}' || ch === ']') {
        while (stack.length && stack[stack.length - 1].depth >= depth) stack.pop();
        depth--; i++; continue;
      }
      i++;
    }
  }
  return left;
}

export function suzuInventory(RB, opts) {
  opts = opts || {};
  const lines = sceneLines(RB).concat(registryLines(RB));
  for (const l of lines) l.key = norm(l.jp);
  const labels = labelLines(RB);
  const byKey = new Map();
  for (const l of lines) { if (!byKey.has(l.key)) byKey.set(l.key, []); byKey.get(l.key).push(l); }
  let scan = [];
  if (opts.root) {
    const known = new Set(lines.map((l) => l.key).concat(labels.map((l) => norm(l.jp))));
    scan = scanSource(opts.root, known);
  }
  return { lines, labels, byKey, scan };
}

// ---- the checks (tools/validate.mjs and tests/unit/dialect_kansai.test.mjs) -----------------------------------
// errors: a Suzu line without a Kansai version (or an explicit "same"), a Kansai line with a kanji
// lacking furigana, a token no lexicon (Kansai or standard) explains, placeholders that differ, a
// table syntax problem, a Kansai lexicon entry with a problem. warnings: table entries no longer
// matching any standard line (stale). review: Kansai-only tokens explained by the standard lexicon
// (worth a look: a Kansai word should be found in the Kansai lexicon).
export function checkDialect(RB, inv) {
  const errors = [], warnings = [], review = new Map();
  const D = RB.dialect;
  if (!D) return { errors: ['RB.dialect missing'], warnings, review, stats: {} };
  for (const e of D.errors()) errors.push('dialect table: ' + e);
  for (const p of D.lexProblems()) errors.push('Kansai lexicon: ' + p.w + ': ' + p.problems.join(', '));
  const tab = D.table('kansai');
  let same = 0, kansai = 0;
  for (const [key, arr] of inv.byKey) {
    const e = tab.get(key);
    if (!e) { errors.push('dialect: no Kansai version for Suzu\'s line at ' + arr[0].where + ': “' + key.slice(0, 60) + '”'); continue; }
    if (e.same) same++; else kansai++;
  }
  const PH = /\$[A-Za-z]+|%T/g;
  const phs = (t) => (String(t || '').match(PH) || []).sort().join(',');
  for (const [key, e] of tab) {
    if (!inv.byKey.has(key)) warnings.push('dialect: ' + e.where + ': no Suzu line says this any more (stale entry): “' + key.slice(0, 50) + '”');
    if (e.same) continue;
    const where = e.where;
    if (phs(e.jp) !== phs(e.std)) errors.push('dialect: ' + where + ': placeholders differ between the standard and the Kansai Japanese');
    if (e.stdEn != null && phs(e.en) !== phs(e.stdEn)) errors.push('dialect: ' + where + ': placeholders differ between the standard and the Kansai English');
    if (!e.en) errors.push('dialect: ' + where + ': no English');
    if (e.sameJp) continue;
    for (const p of RB.jp.validate(e.jp)) errors.push('dialect: ' + where + ': ' + (p.msg || p.message || JSON.stringify(p)) + ' in “' + e.jp.slice(0, 50) + '”');
    let toks;
    try { toks = RB.jp.parse(e.jp); } catch (err) { errors.push('dialect: ' + where + ': parse failed ' + err.message); continue; }
    let stdToks = [];
    try { stdToks = RB.jp.parse(e.std).map((t) => t.surface); } catch (err) { /* reported elsewhere */ }
    toks.forEach((t, i) => {
      if (t.punct || t.ph || !JP_RE.test(t.surface)) return;
      let info = D.lookupIn(toks, i);
      const viaKansai = !!info;
      if (!info) { try { info = RB.jp.lookup(t); } catch (err) { info = { unknown: true }; } }
      if (!info || info.unknown) errors.push('dialect: ' + where + ': no lexicon entry explains “' + t.surface + '” in “' + e.jp.slice(0, 40) + '”');
      else if (!viaKansai && stdToks.indexOf(t.surface) < 0 && !review.has(t.surface)) review.set(t.surface, { where, as: info.entry ? info.entry.w + ' — ' + info.entry.m : '(parts)' });
    });
  }
  return { errors, warnings, review, stats: { lines: inv.lines.length, unique: inv.byKey.size, kansai, same, table: tab.size, lexicon: D.lexAll().length } };
}
