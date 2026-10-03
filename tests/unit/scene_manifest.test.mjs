// Scene-coverage manifest (the owner's addendum of 2026-10-03, Harmony Cut-Ins, Expressive
// Characters, and Illustrated Storytelling, §16; tools/scene_manifest.mjs → docs/expressive/scenes.json):
// - every scene the game registers (RB.content.scenes) is listed in the committed scenes.json, so a
//   new scene cannot be forgotten (fix: run `node tools/scene_manifest.mjs` and review its draft class);
// - no listed scene is stale (each 'scene' entry still exists);
// - every entry has exactly one of the four §16 classes and a reason; none is unclassified;
// - the tool's decided (CURATED) entries name scenes that exist;
// - a fresh build of the manifest (in memory) classifies every scene and finds each one's source line.
import fs from 'node:fs';
import path from 'node:path';
import { load, root } from '../lib/load.mjs';
import { buildManifest, CLASSES, CURATED, CURATED_INLINE, LOAD, OUT_JSON } from '../../tools/scene_manifest.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(LOAD, { __RB_TEST__: true });
  const ids = Object.keys(RB.content.scenes);
  t.ok(ids.length > 1000, 'the game registers its scenes (' + ids.length + ')');

  // ---- the committed manifest -----------------------------------------------------------------
  const file = path.join(root, OUT_JSON);
  t.ok(fs.existsSync(file), OUT_JSON + ' exists');
  if (!fs.existsSync(file)) return;
  let J = null;
  try { J = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { t.ok(false, OUT_JSON + ' parses: ' + e.message); return; }
  const entries = J.entries || [];
  const listed = new Set(entries.filter((e) => e.kind === 'scene').map((e) => e.id));
  const missing = ids.filter((id) => !listed.has(id));
  t.eq(missing, [], 'every registered scene is in the manifest (run node tools/scene_manifest.mjs)');
  const stale = [...listed].filter((id) => !RB.content.scenes[id]);
  t.eq(stale, [], 'no manifest entry names a scene that no longer exists');
  const dup = entries.map((e) => e.id).filter((id, i, a) => a.indexOf(id) !== i);
  t.eq(dup, [], 'each entry id appears once');
  const badClass = entries.filter((e) => CLASSES.indexOf(e.class) < 0).map((e) => e.id);
  t.eq(badClass, [], 'every entry has one of the four classes');
  const noReason = entries.filter((e) => !e.reason || !String(e.reason).trim()).map((e) => e.id);
  t.eq(noReason, [], 'every entry records a reason');
  const noSrc = entries.filter((e) => !e.src).map((e) => e.id);
  t.eq(noSrc, [], 'every entry names its source');
  t.ok(entries.some((e) => e.class === CLASSES[1]), 'the manifest records illustrated sequences');

  // ---- the decided entries and a fresh build ---------------------------------------------------
  const unknownCurated = Object.keys(CURATED).filter((id) => !RB.content.scenes[id]);
  t.eq(unknownCurated, [], 'every decided (CURATED) entry names an existing scene');
  for (const [id, v] of Object.entries(CURATED)) t.ok(CLASSES.indexOf(v[0]) >= 0 && v[1], 'CURATED ' + id + ' has a class and a reason');
  const M = buildManifest(RB);
  const fresh = M.entries.filter((e) => e.kind === 'scene');
  t.eq(fresh.length, ids.length, 'a fresh build lists every scene once');
  t.eq(fresh.filter((e) => CLASSES.indexOf(e.class) < 0).map((e) => e.id), [], 'a fresh build classifies every scene');
  t.eq(fresh.filter((e) => !/^src\/.+:\d+/.test(e.src)).map((e) => e.id), [], 'a fresh build finds each scene\'s source file and line');
  for (const [id, v] of Object.entries(CURATED)) {
    const e = fresh.find((x) => x.id === id);
    t.ok(e && e.class === v[0] && e.heuristic === false, 'decided entry ' + id + ' keeps its class in a fresh build');
  }
  // decided entries outside the scene files (inline dialogue)
  for (const [id, v] of Object.entries(CURATED_INLINE)) {
    const e = M.entries.find((x) => x.id === id);
    t.ok(e && e.kind !== 'scene' && CLASSES.indexOf(v[0]) >= 0 && v[1] && e.class === v[0] && e.heuristic === false, 'decided inline entry ' + id + ' exists and keeps its class in a fresh build');
  }
  const prologue = M.entries.find((e) => e.id === 'seq.prologue');
  t.ok(prologue && prologue.class === CLASSES[1], 'the prologue is listed as an illustrated sequence');
};
