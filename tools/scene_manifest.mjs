// Scene-coverage manifest (the owner's addendum of 2026-10-03, Harmony Cut-Ins, Expressive
// Characters, and Illustrated Storytelling, §16). Generated from the current source, not a
// hand-picked list: every `@scene` the game registers (RB.content.scenes), plus the dialogue
// that plays outside a scene file (object inspections, battle lines, companion reactions, the
// oral histories, field-puzzle results, generated Atlas lines) and the prologue sequence.
//
// For each entry: id, real source file:line, chapter and area, storyline, speakers and
// participants (including `comp:` lines and `?(comp=x)` / `?(party=x)` variants), branch points
// (`!if`, `!choice`, `?(…)`) and their labels, prerequisites (map talk lists, props, triggers,
// onEnter, foes, holds, banter, other content tables that name the scene, engine code that runs
// it, and `!call` callers), line count, objects referenced (items handed over or taken, notes,
// interludes, the props that start it), music cues, and a DRAFT classification:
//   Performed overworld · Illustrated sequence · Quiet by design · Interface/system text
// with a one-line reason. Classifications are heuristic unless the entry is in CURATED below
// (decided by reading the scene; see docs/expressive/SHOTS.md and CONTRACT.md); the output marks
// which. A later worker replaces a heuristic draft by adding a CURATED entry with its reason.
//
// Usage: node tools/scene_manifest.mjs [--check]
//   writes docs/expressive/scenes.json and docs/expressive/SCENES.md
//   --check: build in memory and report counts only (writes nothing)
// The unit test tests/unit/scene_manifest.test.mjs fails when a scene exists that the committed
// scenes.json does not list (run this tool after adding scenes), or an entry is unclassified.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { load, root } from '../tests/lib/load.mjs';
import { CURATED_CH12, CURATED_INLINE_CH12 } from './scene_curated_ch12.mjs';
import { CURATED_CH34, CURATED_INLINE_CH34 } from './scene_curated_ch34.mjs';

export const CLASSES = ['Performed overworld', 'Illustrated sequence', 'Quiet by design', 'Interface/system text'];
export const LOAD = ['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'];
export const OUT_JSON = 'docs/expressive/scenes.json';
export const OUT_MD = 'docs/expressive/SCENES.md';
const COMPS = ['nao', 'mio', 'ren', 'suzu'];
// each chapter's main-road quests (content.quests titles: Labels After the Storm, The Mill That Calls Back,
// Two Names, Labels That Disagree, The Orchard That Never Burned, The Light Above Snowbell, The Bell Under
// the Water, The Still Archive)
const MAIN_QUESTS = ['rw_labels', 'rw_mill', 'rw_depart', 'sg_main', 'co_main', 'sb_lamp', 'lf_main', 'sa_main'];

// ---- decided by reading the scene (not heuristic) ------------------------------------------------
// [class, reason, evidence?]. 'Illustrated sequence' entries are the §17.2 selections (SHOTS.md); the
// prologue and the tide wait are the existing pictures.
const P = CLASSES[0], IL = CLASSES[1], Q = CLASSES[2], SYS = CLASSES[3];
export const CURATED = {
  // §17.2 chapter selections (SHOTS.md): one illustrated section each, the rest staged in the world
  'rw.bridge_scene': [IL, 'Ch1 selection (SHOTS.md): the bridge reaches the far bank and Kōji crosses with his own cup; Hana\'s apology; the prologue\'s teahouse and bridge answered. Tsuru\'s lines return to the world.'],
  'sg.omi_wataru': [IL, 'Ch2 selection and §14 showcase (SHOTS.md, CONTRACT.md): both confession routes staged in the office (done: Wataru leads on his own route, you open on the party\'s, he steps up into his admission; Omi\'s working hand stops, she listens, separates the two faults, acknowledges only on his route, goes back to her desk; the notice passes hand to hand; each companion\'s own reaction); the pivotal exchange between the beats omi.pivot.begin/end is left for the illustrated close-up (not yet drawn); Wataru leaves in the world.', 'tests/e2e/staging_wataru.mjs (8 route × companion runs, staged = unstaged state); docs/screenshots/actors/wataru_*.png'],
  'co.assembly': [IL, 'Ch3 selection (SHOTS.md): the assembly at dusk, three choice branches, Tokiwa adds the line to the chronicle and the village remembers; the square and the brush cannot be read from the tile view.'],
  'sb.lamp_name': [IL, 'Ch4 selection (SHOTS.md): the shade\'s name "Akari" holds, the flame turns from blue to orange, Hoshino\'s question (three branches), the lamp lit and its light poured toward Lanternfall.'],
  'sb.lamp_reply': [IL, 'Ch4 sequence, last shot (SHOTS.md): Hoshino seals the reply with the address left blank; returns to the world for sb.eve_start.'],
  'lf.bell_touch': [IL, 'Ch5 selection (SHOTS.md): the drowned bell is rung, the sound climbs the pipes and the voices turn back toward the town; "It rang. At last." — nobody on the water.'],
  'sa.toya_read': [IL, 'Ch6 selection (SHOTS.md): the folio handed to Kasane, the key slip and council notice laid out, Tōya\'s four words read in context; Tōya\'s bell rung once only when it is carried.'],
  // the existing pictures and the audited personal-quest inserts (SHOTS.md "Questlines, endings and Pages")
  'sg.tide_wait': [IL, 'Existing interlude picture (src/ui/42b_interlude_tide.js, three tide stages in one framing); keeps its place and gains the shared sequence controls. Not counted as Chapter 2\'s sequence (SHOTS.md Ch2 evaluation).'],
  'co.suzu_truth': [IL, 'Personal quest co_suzu (both versions end here): the glassblower\'s bench, the faded ribbon, the globe marked トモエ and the account-book line that stays — object detail the tile view cannot show (SHOTS.md audit).'],
  'sa.shelf_ren': [IL, 'Personal quest ren_ushio: when Ren opens the folio, Ushio\'s face surfaces on the paper and the voice fades but the face does not; only on the open branch (SHOTS.md audit).'],
  // performed overworld, decided by reading
  'sg.wataru_confront': [P, 'Wataru\'s admission after the lie challenge and the choice of who speaks to Omi (sets sg_wataru_self); staged in the warehouse; leads into sg.omi_wataru.'],
  'sb.eve_start': [P, 'Return to the world after the Ch4 sequence: Snowbell gathers in the square and looks up at the lamp; listeners turn upward, Yae counts, Sōsuke shows the envelopes.'],
  'lf.nao_deliver': [P, 'Personal quest lf_nao: Nao asks Umi rather than deciding for her; the envelope held out, the seal broken, the one-line reply written and the old label peeled off into the satchel (a document insert is optional; SHOTS.md audit).'],
  'lf.mio_refuse': [P, 'Ch5 performed interaction (staged): Mio steps up to the counter herself, your hand on her back, her refusal with a flat hand and a shake of the head, Tadashi\'s stamp raised and stopped, then she turns to you, hands shaking; both branches (before and after the bell).', 'tests/e2e/staging_chapters.mjs; docs/screenshots/actors/ch5_lf.mio_refuse_*.png'],
  'rw.hana_first': [P, 'Ch1 performed interaction (staged): Hana stops at the two cups on the table and you turn with her; a thought, a guarded hand, a glance aside, the way to the bridge pointed, the cup held out.', 'tests/e2e/staging_chapters.mjs; docs/screenshots/actors/ch1_rw.hana_first_*.png'],
  'co.suzu_night': [P, 'Ch3 performed interaction (staged; the faded passage of SHOTS.md §7b): the fade covers only the time changing; Suzu is found sitting on the edge of the inn\'s raised floor at night and tells it from there, her account book in her hands; she stands when she decides to help.', 'tests/e2e/staging_chapters.mjs; docs/screenshots/actors/ch3_co.suzu_night_*.png'],
  'sb.yae': [P, 'Ch4 performed interaction (staged): Yae\'s welcome, her worry, counting the lost years on her fingers and losing count, the way north pointed out; the companion\'s aside with their own gesture.', 'tests/e2e/staging_chapters.mjs; docs/screenshots/actors/ch4_sb.yae_*.png'],
  'sa.isamu_return': [P, 'Ch6 performed interaction (staged): the folio handed over at the fire (the !take stays where it is), held, opened; the laugh that comes back; the companion\'s own small response (Mio holds out a cloth).', 'tests/e2e/staging_chapters.mjs; docs/screenshots/actors/ch6_sa.isamu_return_*.png'],
  'co.hiro_first': [P, 'The world review WR-03 (staged): Hiro keeps the blowpipe turning through his first lines (he cannot let go) and holds the gather still to cool when he says he will listen; the companion answers in kind.', 'tests/e2e/actor_workplaces.mjs; docs/screenshots/actors/workplace_glass*.png'],
  'sa.end_comp': [P, 'The companion\'s ending at the bridge (four branches by comp): Nao\'s label with only your name, Mio\'s empty bottle with your name on it, Ren polishing two lamps, Suzu tying her faded ribbon round your wrist (no item is given: the handovers are staging only).'],
};
// the Chapter 1 and 2 staging pass's decisions (tools/scene_curated_ch12.mjs; its own file to keep the passes apart)
Object.assign(CURATED, CURATED_CH12);
// the Chapter 3 and 4 staging pass's decisions (tools/scene_curated_ch34.mjs, the same way)
Object.assign(CURATED, CURATED_CH34);
// decided entries outside the scene files (the inline dialogue listed below: oral histories, inspections …), same shape
export const CURATED_INLINE = Object.assign({}, CURATED_INLINE_CH12, CURATED_INLINE_CH34);
// Dynamic scene ids (built in code); used to explain an entry point the static scan cannot see.
const DYNAMIC = [
  [/^road\.(nao|mio|ren|suzu)\./, 'src/content/pages/40_topics.js and 10_pages.js (road.<comp>.<slot> topics and road.<comp>.quiet<n>, ids built at runtime: The Pages We Keep road talk)'],
  [/^fish\.station\./, 'src/content/fishing/50_scenes.js (one generated scene per fishing site, run by the fishing station)'],
  [/^pets\./, 'src/engine/37_pets_1data.js (pet vignettes and greetings, run by RB.pets by id)'],
  [/^(at|atlas)\./, 'src/atlas/50_run.js (Atlas expedition scenes, run by id from the expedition runner)'],
  [/^pages\./, 'src/content/pages/10_pages.js (The Pages We Keep topics and events, run by id)'],
  [/^wp\./, 'src/content/wordplay/90_hooks.js (shiritori reflections, run by id)'],
  [/^cs\./, 'src/engine/59_cases.js (deduction cases, run by id)'],
  [/^fw\.|^mr\./, 'src/ui/57_weave.js / src/content/discovery (field puzzles, run by id)'],
];
// What a hook speaks (so a scene with no lines of its own is not mistaken for a menu).
const SPEAKING_HOOKS = {
  co_place: 'company.places (a companion\'s remark about this place)', co_thought: 'company.thoughts (a companion\'s thought)', co_topic: 'company.topics',
  co_rest: 'rest options', co_keep_recall: 'kept moments (company.keep)', co_remember: 'kept moments', pages_topic: 'The Pages We Keep topics', pages_recall: 'The Pages We Keep',
  case_react: 'case reactions (RB.content.caseReactions)', case_ack: 'case acknowledgements', fw_look: 'field-puzzle object descriptions', fw_hint: 'field-puzzle hints',
  atlas_name: 'Atlas lines', atlas_relic: 'Atlas lines', atlas_camp: 'Atlas camp lines', atlas_climax: 'Atlas climax lines', atlas_enter: 'Atlas room lines',
};
const CHAPTER_OF_MAP = { rw: 1, sg: 2, co: 3, sb: 4, lf: 5, sa: 6, lq: 1 };
const PLACE = { 1: 'Reedwake', 2: 'Saltglass', 3: 'Cinder Orchard', 4: 'Snowbell', 5: 'Lanternfall', 6: 'The Still Archive' };
const AREA_OF_DIR = {
  ch1: 'Ch1 Reedwake', ch2: 'Ch2 Saltglass', ch3: 'Ch3 Cinder Orchard', ch4: 'Ch4 Snowbell', ch5: 'Ch5 Lanternfall', ch6: 'Ch6 The Still Archive',
  lq: 'Long questlines', company: 'Company', pages: 'The Pages We Keep and endings', discovery: 'Field Inkweaving and the Mill Road', cases: 'Deduction cases',
  pets: 'Pets', fishing: 'Fishing', practice_a: 'Roadside practice', practice_b: 'Roadside practice', wordplay: 'Shiritori (wordplay)', dialect: 'Suzu\'s speech (setting)',
  atlas: 'The Unwritten Atlas', 'zz_atlas_decor': 'The Unwritten Atlas', 'zz_cases': 'Deduction cases', 'zz_ren_quest': 'Ren\'s personal quest',
};
const EMO = new Set(['sad', 'surprise', 'angry', 'worry', 'shy', 'laugh', 'tired', 'closed']);
const MENU_OPS = new Set(['shop', 'inn', 'menu', 'activity', 'lesson', 'teach', 'challenge']);

// ---- helpers ---------------------------------------------------------------------------------------------
function walkFiles(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const fp = path.join(dir, e.name);
    if (e.isDirectory()) walkFiles(fp, out); else if (e.name.endsWith('.js')) out.push(fp);
  }
  return out;
}
const rel = (fp) => path.relative(root, fp).split(path.sep).join('/');
const plainEn = (s) => String(s || '').replace(/\s+/g, ' ').trim();
function compsIn(cond) {
  const out = new Set();
  if (!cond) return out;
  for (const m of String(cond).matchAll(/\b(?:comp|party|prov)=(nao|mio|ren|suzu)\b/g)) out.add(m[1]);
  return out;
}

// Where each scene really is: the `@scene <id>` line in the source (template literals included).
function locate(ids) {
  const where = {}, templ = [];
  for (const fp of walkFiles(path.join(root, 'src'))) {
    const L = fs.readFileSync(fp, 'utf8').split('\n');
    L.forEach((l, i) => {
      const m = l.match(/@scene\s+([^\s`'"]+)/);
      if (!m) return;
      if (m[1].includes('${')) templ.push({ prefix: m[1].slice(0, m[1].indexOf('${')), at: rel(fp) + ':' + (i + 1) });
      else if (!where[m[1]]) where[m[1]] = rel(fp) + ':' + (i + 1);
    });
  }
  for (const id of ids) if (!where[id]) { const t = templ.find((x) => id.startsWith(x.prefix)); if (t) where[id] = t.at + ' (generated)'; }
  return where;
}
// Engine/UI code that names a scene id as a string literal (outside the content tables).
function codeRefs(idSet) {
  const out = {};
  for (const dir of ['engine', 'ui', 'atlas', 'core']) {
    const d = path.join(root, 'src', dir);
    if (!fs.existsSync(d)) continue;
    for (const fp of walkFiles(d)) {
      fs.readFileSync(fp, 'utf8').split('\n').forEach((l, i) => {
        for (const m of l.matchAll(/['"]([a-z][\w.]*\.[\w.]+)['"]/g)) if (idSet.has(m[1])) (out[m[1]] = out[m[1]] || []).push(rel(fp) + ':' + (i + 1));
      });
    }
  }
  return out;
}
// Content tables (other than maps, banter and the scenes themselves) that name a scene.
function contentRefs(C, idSet) {
  const out = {};
  const skip = new Set(['scenes', 'sceneSrc', 'maps', 'banter', 'chars', 'words', 'drills', 'challenges']);
  const seen = new Set();
  const walk = (v, p, parent) => {
    if (v == null) return;
    if (typeof v === 'string') {
      if (idSet.has(v)) (out[v] = out[v] || []).push({ ref: p, if: parent && (parent.if || parent.when || parent.unlock) ? String(parent.if || parent.when || parent.unlock) : null });
      return;
    }
    if (typeof v !== 'object' || seen.has(v)) return;
    seen.add(v);
    if (Array.isArray(v)) { v.forEach((x, i) => walk(x, p + '[' + i + ']', v)); return; }
    for (const k of Object.keys(v)) { if (typeof v[k] === 'function') continue; walk(v[k], p + '.' + k, v); }
  };
  for (const k of Object.keys(C)) if (!skip.has(k)) walk(C[k], 'content.' + k, null);
  return out;
}
// World entry points: who/what starts each scene, and under which condition.
function worldEntries(C) {
  const out = {};
  const add = (id, e) => { if (id) (out[id] = out[id] || []).push(e); };
  for (const map in C.maps) {
    const d = C.maps[map];
    for (const n of d.npcs || []) {
      if (!n.talk) continue;
      const opts = typeof n.talk === 'string' ? [{ scene: n.talk }] : n.talk.filter((o) => o && o.scene);
      for (const o of opts) add(o.scene, { kind: 'npc', map, who: n.char || n.id, at: [n.x, n.y], if: [n.if, o.if].filter(Boolean).join(' & ') || null });
    }
    for (const p of d.props || []) if (p.scene) add(p.scene, { kind: 'prop', map, prop: p.p, at: [p.x, p.y], if: p.if || null });
    for (const t of d.triggers || []) add(t.scene, { kind: 'trigger', map, at: [t.x, t.y], if: t.if || null });
    for (const ev of d.onEnter || []) add(ev.scene, { kind: 'enter', map, if: ev.if || null, once: ev.once !== false });
    for (const f of d.foes || []) if (f.scene) add(f.scene, { kind: 'foe', map, who: f.enemy || f.id, if: f.if || null });
    for (const h of d.hold || []) add(h.scene, { kind: 'hold', map, if: h.if || null });
    for (const ex of d.exits || []) if (typeof ex.locked === 'string') add(ex.locked, { kind: 'locked-exit', map, to: ex.to, if: ex.unlock ? '!' + ex.unlock : null });
    for (const st of d.structs || []) if (typeof st.locked === 'string') add(st.locked, { kind: 'locked-door', map, at: [st.x, st.y], if: st.unlock ? '!' + st.unlock : null });
  }
  for (const b of Array.isArray(C.banter) ? C.banter : []) add(b.scene, { kind: 'banter', comp: b.comp, map: b.map, if: b.if || null });
  return out;
}

// ---- one scene ----------------------------------------------------------------------------------------------
function sceneFacts(C, sc) {
  const says = sc.cmds.filter((c) => c.op === 'say');
  const speakers = {}, conds = {}, comps = new Set(), exprs = {}, ops = {};
  let narr = 0, pc = 0, compLines = 0;
  for (const c of sc.cmds) {
    ops[c.op] = (ops[c.op] || 0) + 1;
    if (c.if) { conds[c.if] = (conds[c.if] || 0) + 1; compsIn(c.if).forEach((x) => comps.add(x)); }
    if (c.op === 'choice') for (const o of c.opts) if (o.if) { conds[o.if] = (conds[o.if] || 0) + 1; compsIn(o.if).forEach((x) => comps.add(x)); }
  }
  for (const c of says) {
    if (c.who === 'narr') narr++;
    else if (c.who === 'pc') pc++;
    if (c.who === 'comp') compLines++;
    speakers[c.who] = (speakers[c.who] || 0) + 1;
    if (c.expr) exprs[c.expr] = (exprs[c.expr] || 0) + 1;
  }
  const actors = new Set();
  for (const c of sc.cmds) {
    if (['move', 'face', 'faceplayer', 'emote', 'gesture', 'look', 'pose', 'walkto', 'prop'].includes(c.op) && c.args && c.args[0]) actors.add(c.args[0]);
  }
  const branches = {
    labels: Object.keys(sc.labels),
    ifs: sc.cmds.filter((c) => c.op === 'if').map((c) => { const a = c.args; const k = a.indexOf('->'); return { line: c.line, cond: a.slice(0, k).join(' '), to: a[k + 1] }; }),
    choices: sc.cmds.filter((c) => c.op === 'choice').map((c) => ({ line: c.line, opts: c.opts.map((o) => ({ en: plainEn(o.en).slice(0, 70), to: o.to || null, if: o.if || null })) })),
    conds: Object.keys(conds),
  };
  const items = sc.cmds.filter((c) => c.op === 'give' || c.op === 'take').map((c) => c.op + ':' + c.args[0] + (C.items[c.args[0]] ? ' (' + C.items[c.args[0]].name.en + ')' : ''));
  const notes = sc.cmds.filter((c) => c.op === 'note').flatMap((c) => c.args);
  const interludes = sc.cmds.filter((c) => c.op === 'interlude' && c.args[0] !== '-').map((c) => c.args.join(' '));
  const quests = [...new Set(sc.cmds.filter((c) => c.op === 'quest').map((c) => c.args[0] + ' ' + (c.args[1] || 'start') + (c.if ? ' [' + c.if + ']' : '')))];
  // the quests it moves on whatever the branch (a `?(…) !quest` aside is weaker evidence of what the scene is about)
  const questsSure = [...new Set(sc.cmds.filter((c) => c.op === 'quest' && !c.if).map((c) => c.args[0]))];
  const music = sc.cmds.filter((c) => c.op === 'music').map((c) => c.args[0]);
  const hooks = [...new Set(sc.cmds.filter((c) => c.op === 'hook').map((c) => c.args[0]))];
  const calls = [...new Set(sc.cmds.filter((c) => c.op === 'call').map((c) => c.args[0]))];
  const warps = [...new Set(sc.cmds.filter((c) => c.op === 'warp').map((c) => c.args[0]))];
  let dark = false, fadeOut = 0;
  for (const c of sc.cmds) { if (c.op === 'fade') { if (c.args[0] === 'out') { dark = true; fadeOut++; } } }
  return { says, speakers, comps, exprs, ops, narr, pc, compLines, actors, branches, items, notes, interludes, quests, questsSure, music, hooks, calls, warps, dark, fadeOut };
}

// The draft classification (heuristic) and its one-line reason.
function classify(id, f, ctx) {
  const n = f.says.length;
  const people = Object.keys(f.speakers).filter((w) => w !== 'narr' && w !== 'pc');
  const emo = Object.keys(f.exprs).filter((e) => EMO.has(e));
  const choice = (f.ops.choice || 0) > 0;
  const handover = f.items.length > 0;
  const story = !!(f.ops.recruit || f.ops.depart || f.ops.chapter || f.ops.credits || f.ops.postgame);
  const menuy = Object.keys(f.ops).some((o) => MENU_OPS.has(o));
  const speakingHook = f.hooks.find((h) => SPEAKING_HOOKS[h]);
  if (n === 0) {
    if (speakingHook) return [Q, 'no lines of its own: a short line from ' + SPEAKING_HOOKS[speakingHook] + ' (hook ' + speakingHook + ')'];
    return [SYS, 'no spoken lines: routing, state or a hook/menu (' + Object.keys(f.ops).join(', ') + ')'];
  }
  if (f.narr === n && n <= 2 && menuy && !choice && !f.calls.length) return [SYS, 'narration framing ' + Object.keys(f.ops).filter((o) => MENU_OPS.has(o)).join('/') + ' (' + n + ' line' + (n > 1 ? 's' : '') + ')'];
  if (f.ops.speakerless && n <= 8 && !choice) return [Q, 'voices heard but not seen (!speakerless), ' + n + ' lines: the listeners\' stillness carries it'];
  if (f.narr === n && !choice && !handover) return [Q, (f.calls.length ? 'a frame around ' + f.calls.length + ' called scene' + (f.calls.length > 1 ? 's' : '') + '; its own ' : '') + 'narration only (' + n + ' line' + (n > 1 ? 's' : '') + '): stillness and the place carry it'];
  if (f.narr === n && n <= 2 && choice && !handover && !story) return [SYS, 'a narrated prompt with a choice (' + n + ' line' + (n > 1 ? 's' : '') + '): starting or leaving an activity or place'];
  if (ctx.banter && n <= 4 && !choice) return [Q, 'travel banter, ' + n + ' lines: attentive posture and facing only'];
  if (n <= 2 && !choice && !handover && !story && people.length <= 1) return [Q, 'short (' + n + ' line' + (n > 1 ? 's' : '') + ')' + (emo.length ? ', expression ' + emo.join('/') + ' carried by the portrait' : '') + ': a greeting or repeat remark'];
  if (!people.length && !f.pc && handover && n <= 2 && !choice) return [P, 'an object found or handed over (' + f.items.join(', ') + '): one shared pick-up/receive cue for the player'];
  if (people.length <= 1 && n <= 4 && !choice && !handover && !story && emo.length === 0) return [Q, 'one speaker, ' + n + ' lines, no turn in feeling: a remark'];
  const why = [n + ' lines', (people.length + (f.pc ? 1 : 0)) + ' speaker' + (people.length + (f.pc ? 1 : 0) === 1 ? '' : 's')];
  if (emo.length) why.push('expressions ' + emo.join('/'));
  if (choice) why.push((f.ops.choice) + ' choice' + (f.ops.choice > 1 ? 's' : ''));
  if (handover) why.push('object handled (' + f.items.length + ')');
  if (story) why.push('recruit/depart/chapter');
  if (f.dark) why.push('part in the dark');
  if (f.ops.speakerless) why.push('voices off-screen (!speakerless): the visible party reacts');
  return [P, why.join(', ')];
}

// ---- build --------------------------------------------------------------------------------------------------
export function buildManifest(RB) {
  const C = RB.content;
  const ids = Object.keys(C.scenes).sort();
  const idSet = new Set(ids);
  const where = locate(ids);
  const world = worldEntries(C);
  const cref = contentRefs(C, idSet);
  const code = codeRefs(idSet);
  const banterSet = new Set((Array.isArray(C.banter) ? C.banter : []).map((b) => b.scene));
  const PQ = (RB.company && RB.company.PQ) || { suzu: 'co_suzu', nao: 'lf_nao', mio: 'lf_mio', ren: 'ren_ushio' };
  const pqOf = Object.fromEntries(Object.entries(PQ).map(([c, q]) => [q, c]));
  const facts = {}, calledBy = {};
  for (const id of ids) {
    facts[id] = sceneFacts(C, C.scenes[id]);
    for (const c of facts[id].calls) (calledBy[c] = calledBy[c] || []).push(id);
  }
  // storyline: what the scene (or the scenes that call it) moves on
  const storyOwn = (id) => {
    const f = facts[id];
    const qs = f.questsSure.length ? f.questsSure : f.quests.map((q) => q.split(' ')[0]);
    const pq = qs.find((q) => pqOf[q]);
    if (pq) return 'personal:' + pqOf[pq];
    const lq = qs.find((q) => q.startsWith('lq_'));
    if (lq) return 'longquest:' + lq;
    if (f.ops.recruit || f.ops.depart || f.ops.chapter || f.ops.credits || f.ops.postgame || qs.some((q) => MAIN_QUESTS.includes(q))) return 'main';
    if (qs.length) return 'side:' + qs[0];
    return null;
  };
  // else what its entry conditions wait on (a talk option gated on `quest.sg_main=4` is on the main road)
  const storyByEntry = (id) => {
    const cs = (world[id] || []).map((e) => e.if || '').join(' ');
    const qs = [...cs.matchAll(/quest\.([a-z_0-9]+)/g)].map((m) => m[1]);
    const pq = qs.find((q) => pqOf[q]);
    if (pq) return 'personal:' + pqOf[pq];
    const lq = qs.find((q) => q.startsWith('lq_'));
    if (lq) return 'longquest:' + lq;
    if (qs.some((q) => MAIN_QUESTS.includes(q))) return 'main';
    return null;
  };
  const storyMemo = {};
  const storyOf = (id, depth = 0) => {
    if (storyMemo[id] !== undefined) return storyMemo[id];
    let s = storyOwn(id) || storyByEntry(id);
    if (!s && depth < 6) for (const c of calledBy[id] || []) { s = storyOf(c, depth + 1); if (s) break; }
    storyMemo[id] = s || null;
    return storyMemo[id];
  };
  const entries = [];
  for (const id of ids) {
    const sc = C.scenes[id], f = facts[id];
    const src = where[id] || (sc.file + ':' + sc.line + ' (template label)');
    const file = src.split(':')[0];
    const dir = file.startsWith('src/content/') ? file.split('/')[2].replace(/\.js$/, '') : file.startsWith('src/atlas/') ? 'atlas' : 'other';
    const w = world[id] || [];
    const maps = [...new Set(w.map((e) => e.map).filter(Boolean).concat(f.warps))];
    let chapter = /^ch(\d)$/.test(dir) ? +dir.slice(2) : null;
    if (chapter == null) {
      const cs = [...new Set(maps.map((m) => CHAPTER_OF_MAP[String(m).split('.')[0]]).filter(Boolean))].sort();
      if (cs.length) chapter = cs[0];
    }
    if (chapter == null) for (const c of calledBy[id] || []) { const cd = entries.find((e) => e.id === c); if (cd && cd.chapter) { chapter = cd.chapter; break; } }
    let storyline = storyOf(id);
    if (!storyline) {
      if (banterSet.has(id)) storyline = 'banter';
      else if (dir === 'company') storyline = 'company';
      else if (dir === 'pages') storyline = file.includes('20_ending') ? 'ending' : 'pages';
      else if (file.includes('ch6/53_scenes_ending')) storyline = 'ending';
      else if (['pets', 'fishing', 'practice_a', 'practice_b', 'wordplay', 'discovery', 'cases', 'zz_cases', 'atlas', 'zz_atlas_decor', 'dialect'].includes(dir)) storyline = dir.replace(/^zz_/, '').replace(/_[ab]$/, '').replace(/^atlas_decor$/, 'atlas');
      else storyline = 'ambient';
    }
    if (file.includes('ch6/53_scenes_ending') || file.includes('pages/20_ending')) storyline = storyline.startsWith('personal') ? storyline : 'ending';
    const refs = (cref[id] || []).map((r) => r.ref + (r.if ? ' [' + r.if + ']' : ''));
    const dyn = DYNAMIC.find(([re]) => re.test(id));
    const prereq = {
      world: w.map((e) => Object.assign({}, e)),
      callers: calledBy[id] || [],
      content: refs,
      code: code[id] || [],
      dynamic: !w.length && !(calledBy[id] || []).length && !refs.length && !(code[id] || []).length && dyn ? dyn[1] : null,
    };
    if (!w.length && !prereq.callers.length && !refs.length && !prereq.code.length && !prereq.dynamic) prereq.unresolved = 'no static entry point found (run by an id built at runtime?)';
    const participants = new Set(Object.keys(f.speakers).filter((x) => x !== 'narr'));
    f.actors.forEach((a) => participants.add(a));
    for (const e of w) if (e.kind === 'npc' && e.who) participants.add(e.who);
    if (participants.has('comp') || f.comps.size) f.comps.forEach((c) => participants.add('comp=' + c));
    const props = [...new Set(w.filter((e) => e.kind === 'prop').map((e) => e.prop))];
    const ctx = { banter: banterSet.has(id) };
    const cur = CURATED[id];
    const [cls, reason] = cur || classify(id, f, ctx);
    entries.push({
      id, kind: 'scene', src, area: AREA_OF_DIR[dir] || dir, chapter, storyline,
      lines: f.says.length, speakers: f.speakers, participants: [...participants].sort(), comps: [...f.comps].sort(), compLines: f.compLines,
      exprs: f.exprs, branches: f.branches, calls: f.calls, prereq, maps,
      objects: { items: f.items, notes: f.notes, interludes: f.interludes, props },
      quests: f.quests, music: f.music, hooks: f.hooks, staging: { move: f.ops.move || 0, face: (f.ops.face || 0) + (f.ops.faceplayer || 0), emote: f.ops.emote || 0, fadeOut: f.fadeOut, interlude: f.ops.interlude || 0, shake: f.ops.shake || 0,
        // scene direction (src/engine/52_staging.js): the authored cues
        gesture: f.ops.gesture || 0, look: f.ops.look || 0, pose: f.ops.pose || 0, walkto: f.ops.walkto || 0, prop: f.ops.prop || 0, beat: f.ops.beat || 0, ambience: f.ops.ambience || 0 },
      class: cls, reason, heuristic: !cur, evidence: cur && cur[2] ? cur[2] : null,
    });
  }
  // ---- dialogue outside scene files ----------------------------------------------------------------------
  const inline = [];
  const I = (o) => inline.push(Object.assign({ kind: 'inline', heuristic: true, chapter: null, storyline: 'ambient', lines: 0, speakers: {}, participants: [], comps: [], branches: { labels: [], ifs: [], choices: [], conds: [] }, prereq: { world: [], callers: [], content: [], code: [] }, maps: [], objects: { items: [], notes: [], interludes: [], props: [] }, quests: [], music: [], hooks: [], staging: { move: 0, face: 0, emote: 0, fadeOut: 0, interlude: 0, shake: 0 } }, o,
    // (an entry outside the scene files decided by reading, too)
    CURATED_INLINE[o.id] ? { class: CURATED_INLINE[o.id][0], reason: CURATED_INLINE[o.id][1], heuristic: false, evidence: CURATED_INLINE[o.id][2] || null } : {}));
  // the prologue (src/ui/40_create.js SHOTS)
  I({ id: 'seq.prologue', kind: 'sequence', src: 'src/ui/40_create.js:44', area: 'Prologue', chapter: 0, storyline: 'main', lines: 6, speakers: { narr: 6 },
    prereq: { world: [], callers: [], content: [], code: ['src/ui/40_create.js:53 prologue() (New Game, before creation)'] }, class: IL,
    reason: 'existing six-shot prologue (RB.prologueArt); its manual-advance rework is §17.5 (SHOTS.md "Prologue")', heuristic: false });
  // object inspections with a text and no scene (50_world.js interact → runInline)
  for (const map in C.maps) for (const p of C.maps[map].props || []) if (!p.scene && p.text) {
    const ch = CHAPTER_OF_MAP[map.split('.')[0]] || null;
    I({ id: 'inline.prop.' + map + '@' + p.x + ',' + p.y, src: 'map ' + map + ' prop ' + p.p + ' (src/engine/50_world.js interact)', area: ch ? AREA_OF_DIR['ch' + ch] : 'Long questlines', chapter: ch, lines: 1, speakers: { [p.who || 'narr']: 1 },
      prereq: { world: [{ kind: 'prop', map, prop: p.p, at: [p.x, p.y], if: p.if || null }], callers: [], content: [], code: [] }, maps: [map], objects: { items: [], notes: [], interludes: [], props: [p.p] },
      class: Q, reason: 'one narrated line about an object: the player faces it; no gesture needed' });
  }
  I({ id: 'inline.door.shut', src: 'src/engine/50_world.js:704 SHUT (a building you cannot enter)', area: 'Everywhere', lines: 1, speakers: { narr: 1 }, class: SYS, reason: 'a fixed notice that a door is shut' });
  // battle lines (80_combat.js say: intro, settle, phase changes)
  for (const eid of Object.keys(C.enemies).sort()) {
    const e = C.enemies[eid];
    const n = (e.intro ? 1 : 0) + (e.settle ? 1 : 0) + (e.phases || []).filter((p) => p.line).length;
    if (!n) continue;
    const ch = CHAPTER_OF_MAP[eid.split('.')[0]] || null;
    const who = {}; for (const k of ['introWho', 'settleWho']) if (e[k]) who[e[k]] = (who[e[k]] || 0) + 1;
    if (!Object.keys(who).length) who.narr = n;
    I({ id: 'inline.battle.' + eid, src: 'content.enemies.' + eid + ' (spoken by src/ui/80_combat.js say)', area: ch ? AREA_OF_DIR['ch' + ch] : 'The Unwritten Atlas', chapter: ch, storyline: e.boss ? 'main' : 'battle', lines: n, speakers: who,
      class: Q, reason: 'battle opening/settle/phase lines over the battle stage, whose own idle and settle animation carries them (battle presentation, not the overworld)' });
  }
  // companion reactions to field puzzles and cases (RB.company.say → runInline when no scene runs)
  const evs = {};
  for (const r of (RB.company && RB.company.reactions) || []) (evs[r.event] = evs[r.event] || []).push(r);
  for (const ev of Object.keys(evs).sort()) {
    const rs = evs[ev];
    I({ id: 'inline.reaction.' + ev, src: (ev.startsWith('case:') ? 'src/content/cases' : 'src/content/discovery/50_reactions.js') + ' (RB.company.addReactions; spoken by src/engine/58_companion.js say)', area: ev.startsWith('case:') ? 'Deduction cases' : 'Field Inkweaving and the Mill Road',
      storyline: 'company', lines: rs.reduce((m, r) => m + (r.lines || []).length, 0), speakers: { comp: rs.length }, comps: [...new Set(rs.map((r) => r.comp))].sort(), compLines: rs.length,
      branches: { labels: [], ifs: [], choices: [], conds: [...new Set(rs.map((r) => r.facts ? 'facts.' + Object.entries(r.facts).map(([k, v]) => k + '=' + v).join('&') : null).filter(Boolean))] },
      class: P, reason: 'the companion reacts to a resolution they witnessed (§15 last paragraph): one small acknowledging gesture per route variant (' + rs.length + ' variants)' });
  }
  // oral histories (75_activities.js history: the teller speaks each fragment)
  for (const aid of Object.keys(C.activities || {}).sort()) {
    const a = C.activities[aid];
    if (!a || !a.teller || !a.fragments) continue;
    const ch = CHAPTER_OF_MAP[aid.split('.')[0]] || null;
    I({ id: 'inline.history.' + aid, src: 'content.activities.' + aid + ' (src/ui/75_activities.js history)', area: ch ? AREA_OF_DIR['ch' + ch] : 'Activities', chapter: ch, storyline: 'activity', lines: a.fragments.length, speakers: { [a.teller]: a.fragments.length }, participants: [a.teller],
      class: P, reason: 'an elder tells a story in fragments before the ordering task: speaker gestures (counting, pointing back in time) per fragment, listener attention' });
  }
  // field-puzzle results (57_weave.js: r.say, narration after a weave)
  const fw = RB.fieldweave && RB.fieldweave.list ? RB.fieldweave.list() : [];
  for (const def of fw) {
    const id = def && (def.id || def.pz);
    if (!id) continue;
    I({ id: 'inline.fieldweave.' + id, src: 'src/content/discovery/10_puzzles.js (puzzle ' + id + '; narrated by src/ui/57_weave.js)', area: 'Field Inkweaving and the Mill Road', storyline: 'discovery', lines: (def.hints || []).length, speakers: { narr: 1 },
      class: Q, reason: 'puzzle look/hint/result narration; the field action (57_weave.js hand overlay, knee dip, effects) already performs the act' });
  }
  I({ id: 'inline.atlas.rooms', src: 'src/atlas/50_run.js say (generated room, relic and camp lines)', area: 'The Unwritten Atlas', storyline: 'atlas', speakers: { narr: 1, comp: 1 },
    class: Q, reason: '§17.2: no cinematic for routine Atlas rooms; facing and attentive posture only' });
  const all = entries.concat(inline);
  return { entries: all, counts: summarise(all) };
}

export function summarise(all) {
  const by = (key) => { const o = {}; for (const e of all) { const k = key(e); o[k] = o[k] || Object.fromEntries(CLASSES.map((c) => [c, 0])); o[k][e.class] = (o[k][e.class] || 0) + 1; } return o; };
  return {
    total: all.length, scenes: all.filter((e) => e.kind === 'scene').length, inline: all.filter((e) => e.kind !== 'scene').length,
    heuristic: all.filter((e) => e.heuristic).length, curated: all.filter((e) => !e.heuristic).length,
    byClass: Object.fromEntries(CLASSES.map((c) => [c, all.filter((e) => e.class === c).length])),
    byChapter: by((e) => (e.chapter == null ? '—' : e.chapter === 0 ? 'Prologue' : 'Ch' + e.chapter)),
    byArea: by((e) => e.area),
    byStoryline: by((e) => String(e.storyline || 'ambient').split(':')[0] + (String(e.storyline).startsWith('personal:') || String(e.storyline).startsWith('longquest:') ? ':' + e.storyline.split(':')[1] : '')),
  };
}

// ---- output --------------------------------------------------------------------------------------------------
const esc = (s) => String(s == null ? '' : s).replace(/\|/g, '\\|').replace(/\n/g, ' ');
function table(obj, label) {
  const rows = Object.keys(obj).sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
  let h = '| ' + label + ' | ' + CLASSES.join(' | ') + ' | Total |\n|---|' + CLASSES.map(() => '---:').join('|') + '|---:|\n';
  const tot = Object.fromEntries(CLASSES.map((c) => [c, 0]));
  for (const r of rows) { const o = obj[r]; let t = 0; h += '| ' + esc(r) + ' | ' + CLASSES.map((c) => { t += o[c] || 0; tot[c] += o[c] || 0; return o[c] || 0; }).join(' | ') + ' | ' + t + ' |\n'; }
  h += '| **All** | ' + CLASSES.map((c) => '**' + tot[c] + '**').join(' | ') + ' | **' + Object.values(tot).reduce((a, b) => a + b, 0) + '** |\n';
  return h;
}
const SHORT = { [P]: 'Performed', [IL]: 'Illustrated', [Q]: 'Quiet', [SYS]: 'System' };
function entryLine(e) {
  const sp = Object.entries(e.speakers || {}).sort((a, b) => b[1] - a[1]).map(([w, n]) => w + (n > 1 ? '×' + n : '')).join(' ');
  const br = [];
  if (e.branches.ifs.length) br.push(e.branches.ifs.length + ' if');
  if (e.branches.choices.length) br.push(e.branches.choices.length + ' choice');
  const cv = e.branches.conds.length; if (cv) br.push(cv + ' cond');
  if (e.comps && e.comps.length) br.push('comp:' + e.comps.join('/'));
  const pr = e.prereq || {};
  const ent = [];
  for (const w of (pr.world || []).slice(0, 2)) ent.push(w.kind + ' ' + (w.map || '') + (w.who ? ' ' + w.who : w.prop ? ' ' + w.prop : w.comp ? ' ' + w.comp : '') + (w.if ? ' [' + w.if + ']' : ''));
  if ((pr.world || []).length > 2) ent.push('+' + (pr.world.length - 2) + ' more');
  if ((pr.callers || []).length) ent.push('call← ' + pr.callers.slice(0, 2).join(', ') + (pr.callers.length > 2 ? ' +' + (pr.callers.length - 2) : ''));
  if ((pr.content || []).length) ent.push(pr.content[0].replace(/^content\./, '') + (pr.content.length > 1 ? ' +' + (pr.content.length - 1) : ''));
  if ((pr.code || []).length) ent.push('code ' + pr.code[0]);
  if (pr.dynamic) ent.push('dynamic');
  if (pr.unresolved) ent.push('**unresolved**');
  const obj = [].concat(e.objects.items || [], (e.objects.interludes || []).map((x) => 'interlude ' + x), (e.objects.props || []).map((x) => 'prop ' + x)).slice(0, 3).join('; ');
  return '| `' + esc(e.id) + '` | ' + esc(e.src) + ' | ' + esc(e.storyline) + ' | ' + e.lines + ' | ' + esc(sp) + ' | ' + esc(br.join(', ')) + ' | ' + esc(ent.join('; ')) + ' | ' + esc(obj) + ' | ' + SHORT[e.class] + (e.heuristic ? ' (H)' : ' (C)') + ' | ' + esc(e.reason) + ' |';
}
export function renderMd(M) {
  const c = M.counts;
  let md = '# Scene-coverage manifest (draft)\n\n';
  md += 'Generated by `node tools/scene_manifest.mjs` from the current source (do not edit by hand; the machine-readable copy is `scenes.json`). ' +
    'It answers §16 of the owner\'s addendum of 2026-10-03 (Harmony Cut-Ins, Expressive Characters, and Illustrated Storytelling): every scene the game registers plus the dialogue that plays outside scene files, each with a **draft** classification.\n\n';
  md += '**Heuristic vs decided.** `(H)` marks a classification made by the rules in `tools/scene_manifest.mjs` `classify()` from line counts, speakers, expressions, branches and handovers — a draft for Phase D to review, not a verdict. `(C)` marks an entry decided by reading the scene (`CURATED` in the tool; reasons in SHOTS.md and CONTRACT.md). ' +
    c.heuristic + ' of ' + c.total + ' entries are heuristic; ' + c.curated + ' are decided.\n\n';
  md += 'Classes (§16): **Performed overworld** — staged movement, gestures, object interaction or listener reactions to be authored; **Illustrated sequence** — manually advanced shots (SHOTS.md); **Quiet by design** — stillness is right, facing and attention reviewed, reason recorded; **Interface/system text** — non-diegetic, not counted as a story scene.\n\n';
  md += 'Columns: id · real source file:line · storyline (main, side:<quest>, personal:<companion>, longquest:<quest>, company, banter, ending, pages, …; from the quests a scene moves on, else its callers, else its file) · lines (`say` lines over all branches) · speakers (`comp` = the travelling companion; `?(comp=x)` variants under branches) · branches (`!if`, `!choice`, distinct `?(…)` conditions, companions with their own lines) · entry points (map talk/prop/trigger/enter/foe/hold, banter, `!call` callers, content tables, engine code, dynamic) · objects (items given/taken, interludes, the props that start it) · class · reason.\n\n';
  md += '## Counts\n\n' + c.total + ' entries: ' + c.scenes + ' `@scene` scenes (every id in `RB.content.scenes`) and ' + c.inline + ' other dialogue sources (the prologue, object inspections, battle lines, companion reactions, oral histories, field-puzzle narration, Atlas lines).\n\n';
  md += '### By chapter\n\n' + table(c.byChapter, 'Chapter') + '\n“—” is material not tied to one chapter (Company, Pages, pets, activities, the Atlas …).\n\n';
  md += '### By storyline\n\n' + table(c.byStoryline, 'Storyline') + '\n';
  md += '### By area (source folder)\n\n' + table(c.byArea, 'Area') + '\n';
  const areas = [...new Set(M.entries.map((e) => e.area))].sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
  md += '## Entries by area\n\n';
  for (const a of areas) {
    const es = M.entries.filter((e) => e.area === a).sort((x, y) => (x.src || '').localeCompare(y.src || '', 'en', { numeric: true }));
    md += '### ' + a + ' (' + es.length + ')\n\n| id | source | storyline | lines | speakers | branches | entry points | objects | class | reason |\n|---|---|---|---:|---|---|---|---|---|---|\n';
    md += es.map(entryLine).join('\n') + '\n\n';
  }
  return md;
}
// The JSON keeps one entry per line and leaves out what is empty (an absent list is an empty one).
const worldStr = (w) => w.kind + ' ' + (w.map || '') + (w.who ? ' ' + w.who : w.prop ? ' ' + w.prop : w.comp ? ' ' + w.comp : '') + (w.at ? '@' + w.at.join(',') : '') + (w.to ? ' →' + w.to : '') + (w.if ? ' [' + w.if + ']' : '');
function compact(e) {
  const out = {};
  for (const [k, v] of Object.entries(e)) {
    if (v == null || v === '' || (Array.isArray(v) && !v.length)) continue;
    if (k === 'prereq') {
      const p = {};
      if (v.world && v.world.length) p.world = v.world.map(worldStr);
      for (const kk of ['callers', 'content', 'code']) if (v[kk] && v[kk].length) p[kk] = v[kk];
      if (v.dynamic) p.dynamic = DYNAMIC.findIndex((d) => d[1] === v.dynamic);
      if (v.unresolved) p.unresolved = v.unresolved;
      if (Object.keys(p).length) out.prereq = p;
      continue;
    }
    if (k === 'branches') {
      const b = {};
      if (v.labels.length) b.labels = v.labels;
      if (v.ifs.length) b.ifs = v.ifs.map((x) => x.line + ': ' + x.cond + ' -> ' + x.to);
      if (v.choices.length) b.choices = v.choices.map((c) => c.line + ': ' + c.opts.map((o) => (o.if ? '[' + o.if + '] ' : '') + o.en.slice(0, 40) + ' -> ' + (o.to || '·')).join(' | '));
      if (v.conds.length) b.conds = v.conds;
      if (Object.keys(b).length) out.branches = b;
      continue;
    }
    if (k === 'objects' || k === 'staging' || k === 'exprs' || k === 'speakers') {
      const o = {};
      for (const [kk, vv] of Object.entries(v)) if (vv && (!Array.isArray(vv) || vv.length)) o[kk] = vv;
      if (Object.keys(o).length) out[k] = o;
      continue;
    }
    out[k] = v;
  }
  return out;
}
export function renderJson(M) {
  const head = { generator: 'tools/scene_manifest.mjs', classes: CLASSES, dynamic: DYNAMIC.map((d) => d[0].source + ' — ' + d[1]), counts: M.counts,
    note: 'prereq.dynamic is an index into meta.dynamic; an absent list or field is empty; heuristic=false marks a classification decided by reading (CURATED in the tool)' };
  return '{\n"meta": ' + JSON.stringify(head) + ',\n"entries": [\n' + M.entries.map((e) => JSON.stringify(compact(e))).join(',\n') + '\n]\n}\n';
}

export function loadRB() {
  globalThis.__RB_TEST__ = true;
  return load(LOAD, { __RB_TEST__: true });
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMain) {
  const RB = loadRB();
  const M = buildManifest(RB);
  const c = M.counts;
  console.log('entries', c.total, '(scenes', c.scenes + ', other', c.inline + '); heuristic', c.heuristic, 'decided', c.curated);
  console.log('by class', JSON.stringify(c.byClass));
  const unres = M.entries.filter((e) => e.prereq && e.prereq.unresolved).map((e) => e.id);
  if (unres.length) console.log('no static entry point:', unres.length, unres.join(' '));
  if (!process.argv.includes('--check')) {
    fs.mkdirSync(path.join(root, 'docs/expressive'), { recursive: true });
    fs.writeFileSync(path.join(root, OUT_JSON), renderJson(M));
    fs.writeFileSync(path.join(root, OUT_MD), renderMd(M));
    console.log('wrote', OUT_JSON, 'and', OUT_MD);
  }
  void fileURLToPath;
}
