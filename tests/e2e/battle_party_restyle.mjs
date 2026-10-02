// The party's battle-art restyle (the owner's second playtest round): evidence, against the BUILT index.html
// and, for "before", the base build of a given revision (git show <rev>:index.html; default 6855ba1).
// - frame sheets: every item before / after at 1× and 3× (the proof items — the player as the owner plays
//   her and Mio's support gesture — then each companion's poses, gestures, reactions and technique, every
//   hairstyle, cut, palette, skin, hair colour, creation accessory and keepsake);
// - the ready idle's cadence: drawn frame changes a second over a loop, before and after;
// - in-battle captures (the Mill's Flour Moth, the player in the owner's look, Mio; a DIAGNOSTIC PLACEMENT in a
//   synthetic campaign) at 1920×1080, 1280×800 and 390×844 (three creatures and a pet), before and after;
// - one real-time Normal recording (Playwright's recorder): the ready idle, the player's Unravel, Mio's warm
//   draught (a LABELLED DIAGNOSTIC FIXTURE: Mio with every support action unlocked in a Chapter 1 room).
// The owner's art reference is NOT embedded in any committed sheet (it may not enter the repository).
// Captures go to tests/e2e/out/battle_party_restyle/; with --docs the WebP/WebM evidence is copied to
// docs/screenshots/battle/party_restyle/.
// Usage: node tests/e2e/battle_party_restyle.mjs [sheets|cadence|battle|clip] [--docs] [--base <rev>]
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { serve, launch, page, root, companionTurn } from './lib.mjs';

const args = process.argv.slice(2);
const only = args.find((a) => !a.startsWith('--') && args[args.indexOf(a) - 1] !== '--base');
const toDocs = args.includes('--docs');
const baseRev = args.includes('--base') ? args[args.indexOf('--base') + 1] : '6855ba1';
const outDir = path.join(root, 'tests', 'e2e', 'out', 'battle_party_restyle');
const docsDir = path.join(root, 'docs', 'screenshots', 'battle', 'party_restyle');
fs.mkdirSync(outDir, { recursive: true });
if (toDocs) fs.mkdirSync(docsDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'base_index.html'), execFileSync('git', ['show', baseRev + ':index.html'], { cwd: root, maxBuffer: 64 << 20 }));
const { srv, url } = await serve();
const BASE = url + 'tests/e2e/out/battle_party_restyle/base_index.html';
const b = await launch();
let pass = 0, fail = 0;
const report = {};
async function test(name, fn) {
  if (only && !name.startsWith(only)) return;
  try { await fn(); pass++; console.log('PASS ' + name); } catch (e) { fail++; console.log('FAIL ' + name + ': ' + String(e && e.stack || e).slice(0, 1400)); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };
const wait = (p, ms) => p.waitForTimeout(ms);
function save(name, dataUrl, ext) {
  const f = path.join(outDir, name + '.' + ext);
  fs.writeFileSync(f, Buffer.from(dataUrl.split(',')[1], 'base64'));
  if (toDocs) fs.copyFileSync(f, path.join(docsDir, name + '.' + ext));
  return f;
}

// ---- the looks ------------------------------------------------------------------------------------------------
const ROBIN = { skin: 1, hair: 'ponytail', hairColor: 3, outfit: 2, shape: 'coat', acc: ['flower'] };
const HAIRS = ['short', 'bob', 'long', 'ponytail', 'bun', 'curly', 'spiky', 'braid', 'shaved', 'twintails', 'wavy', 'wrap', 'bald'];
const CUTS = ['tunic', 'robe', 'coat', 'apron', 'dress'];
const REACT = [['hit', '', 0.16, 'hit'], ['hit', 'soft', 0.16, 'soft hit'], ['brace', '', 0.22, 'brace'], ['guard', 'wary', 0.5, 'wary'], ['guard', '', 0.5, 'guard'], ['soothed', '', 0.5, 'soothed'], ['afflict', 'hush', 0.5, 'hush'], ['afflict', 'gust', 0.5, 'gust'], ['afflict', 'chill', 0.5, 'chill'], ['afflict', 'slip', 0.5, 'slip'], ['down', '', 1, 'down'], ['cheer', '', 1, 'cheer']];

// frames of one item in one build: [{ url, label }] (a frame list, or one frame per look)
async function framesOf(build, item) {
  const { p, ctx } = await page(b, build === 'base' ? BASE : url);
  const r = await p.evaluate((it) => {
    const C = RB.content.chars, B = RB.battlers;
    const lookOf = (x) => (typeof x === 'string' ? C[x].look : x);
    const one = (look, pose, g, k, t, who, id) => {
      const cv0 = B.preview(look, pose, g || null, k || 0, { who, id, t: t || 0 });
      const cv = document.createElement('canvas'); cv.width = cv0.width; cv.height = cv0.height; cv.getContext('2d').drawImage(cv0, 0, 0);
      return cv.toDataURL('image/png');
    };
    // a time inside the idle's first pulse dip (the new build), or the stance (the base build has none)
    const dipT = (id) => { for (let t = 0; t < 9000; t += 5) if (RB.battlerMoves.idleKey(id, 'ready', t, false).endsWith('.4')) return t; return 0; };
    if (it.looks) return it.looks.map((lk) => ({ url: one(lk.look, lk.pose || 'ready', lk.g, lk.k, 0, 'pc', 'pc'), label: lk.label }));
    const look = lookOf(it.look);
    return it.frames.map(([pose, g, k, label]) => ({ url: one(look, pose, g, k, pose === 'ready' && label === 'pulse dip' ? dipT(it.id) : 0, it.who, it.id), label }));
  }, item);
  await ctx.close();
  return r;
}
// a sheet: blocks of up to `per` frames; each block: before 1×, after 1×, before 3×, after 3×
async function sheet(name, title, before, after, per) {
  per = per || 9;
  const pg = await b.newPage();
  const out = await pg.evaluate(async ({ title, before, after, per }) => {
    const load = (u) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = u; });
    const B = await Promise.all(before.map((f) => load(f.url))), A = await Promise.all(after.map((f) => load(f.url)));
    const fw = A[0].width, fh = A[0].height, gap = 6, lab = 15, left = 74, head = 26;
    const n = after.length, blocks = Math.ceil(n / per);
    const W = left + per * (fw * 3 + gap) + gap, blockH = 2 * (fh + lab) + 2 * (fh * 3 + lab) + gap * 5;
    const cv = document.createElement('canvas'); cv.width = W; cv.height = head + blocks * blockH;
    const x = cv.getContext('2d'); x.imageSmoothingEnabled = false;
    x.fillStyle = '#4a3e36'; x.fillRect(0, 0, W, cv.height);
    x.fillStyle = '#f2e8d2'; x.font = '600 14px system-ui, sans-serif'; x.fillText(title, 8, 18);
    x.font = '11px system-ui, sans-serif';
    for (let bi = 0; bi < blocks; bi++) {
      let y = head + bi * blockH;
      const idx = []; for (let i = bi * per; i < Math.min(n, bi * per + per); i++) idx.push(i);
      for (const [imgs, frames, sc, tag] of [[B, before, 1, 'before 1×'], [A, after, 1, 'after 1×'], [B, before, 3, 'before 3×'], [A, after, 3, 'after 3×']]) {
        x.fillStyle = '#d8c8a8'; x.fillText(tag, 6, y + 12 + (sc === 3 ? 20 : 0));
        idx.forEach((i, k) => {
          const ox = left + k * (sc === 1 ? fw * 3 + gap : fw * 3 + gap);
          if (imgs[i]) x.drawImage(imgs[i], 0, 0, fw, fh, ox, y + lab, fw * sc, fh * sc);
          if (sc === 1 && tag.startsWith('after')) { x.fillStyle = '#f2e8d2'; x.fillText(frames[i].label, ox, y + lab + fh + 12); }
        });
        y += (sc === 1 ? fh + lab : fh * 3 + lab) + gap + (sc === 1 && tag.startsWith('after') ? 4 : 0);
      }
    }
    return cv.toDataURL('image/webp', 0.92);
  }, { title, before, after, per });
  await pg.close();
  return save(name, out, 'webp');
}
async function item(name, title, it, per) {
  const before = await framesOf('base', it), after = await framesOf('new', it);
  assert(before.length === after.length && after.length > 0, name + ': frame counts');
  const f = await sheet(name, title, before, after, per);
  report.sheets = report.sheets || [];
  report.sheets.push({ name, frames: after.length });
  return f;
}

await test('sheets: the proof items and every other item, before / after at 1× and 3×', async () => {
  // proof 1: the player as the owner plays her (ready, a pulse dip, calm, Unravel's thread, a hit, the cheer)
  await item('proof_robin', 'Proof 1 — the player in the owner\'s look (auburn ponytail, green coat, a pink flower): ready, the pulse, calm, Unravel\'s thread (anticipation → lift → draw → recovery), a hit, the cheer', {
    look: ROBIN, id: 'pc', who: 'pc', frames: [['ready', '', 0, 'ready'], ['ready', '', 0, 'pulse dip'], ['calm', '', 0, 'calm'], ['anticipate', 'thread', 1, 'thread: anticipate'], ['act', 'thread', 0.25, 'thread: lift'], ['act', 'thread', 0.6, 'thread: draw'], ['act', 'thread', 1, 'thread: drawn'], ['recover', 'thread', 0.5, 'thread: recover'], ['hit', '', 0.16, 'hit'], ['hit', '', 0.45, 'hit: catch'], ['cheer', '', 0.5, 'cheer'], ['cheer', '', 1, 'cheer: settle']],
  }, 6);
  // proof 2: Mio's support gesture
  await item('proof_mio', 'Proof 2 — Mio: ready, calm, her warm draught (the vial from her hip: anticipate → uncork → pour → recover), her other supports at release', {
    look: 'mio', id: 'mio', who: 'comp', frames: [['ready', '', 0, 'ready'], ['ready', '', 0, 'pulse dip'], ['calm', '', 0, 'calm'], ['anticipate', 'pour', 1, 'pour: anticipate'], ['act', 'pour', 0.3, 'pour: uncork'], ['act', 'pour', 0.65, 'pour: tip'], ['act', 'pour', 1, 'pour'], ['recover', 'pour', 0.5, 'pour: recover'], ['act', 'dab', 0.6, 'dab'], ['act', 'waft', 0.6, 'waft'], ['act', 'salts', 0.6, 'salts'], ['act', 'tonic', 0.6, 'tonic'], ['act', 'help', 0.6, 'help (revive)']],
  }, 7);
  // the player: every own gesture at its release, and every reaction
  const MV = { pc: ['thread', 'direct', 'trace', 'crystal', 'book', 'lens', 'ward', 'restore', 'flow', 'sweep', 'plant', 'open', 'raise', 'ring', 'call'], nao: ['point', 'spot', 'call', 'reach', 'lunge', 'shoulder', 'help'], mio: ['pour', 'dab', 'waft', 'salts', 'tonic', 'help'], ren: ['ward', 'shade', 'flare', 'vigil', 'lanterns', 'front', 'help'], suzu: ['flourish', 'heckle', 'beckon', 'clap', 'feint', 'grand', 'help'] };
  await item('pc_gestures', 'The player (the owner\'s look): every own gesture, anticipation and release', { look: ROBIN, id: 'pc', who: 'pc', frames: MV.pc.flatMap((g) => [['anticipate', g, 1, g + ' ·'], ['act', g, 0.6, g]]) }, 10);
  await item('pc_reactions', 'The player: reactions (hit, softened hit, brace, wary, guard, soothed, the four conditions, down, cheer) and recover:rise', { look: ROBIN, id: 'pc', who: 'pc', frames: REACT.map(([p, g, k, l]) => [p, g, k, l]).concat([['recover', 'rise', 0.4, 'rise']]) }, 7);
  for (const id of ['mio', 'nao', 'ren', 'suzu']) {
    const T = { nao: 'point', mio: 'pour', ren: 'ward', suzu: 'flourish' }[id];
    await item(id + '_all', id[0].toUpperCase() + id.slice(1) + ': stance, calm, every own gesture (anticipation and release), the technique, every reaction', {
      look: id, id, who: 'comp', frames: [['ready', '', 0, 'ready'], ['ready', '', 0, 'pulse dip'], ['calm', '', 0, 'calm']].concat(MV[id].flatMap((g) => [['anticipate', g, 1, g + ' ·'], ['act', g, 0.6, g]])).concat([['act', T, 1, 'technique']]).concat(REACT),
    }, 10);
  }
  // every look option on the player (no option falls back to an old rendering)
  const L = (o, label) => ({ look: Object.assign({ skin: 2, hair: 'short', hairColor: 1, outfit: 0, shape: 'tunic', acc: [] }, o), label });
  await item('looks_hair', 'Every hairstyle (and bald), each in its own colour', { looks: HAIRS.map((h, i) => L({ hair: h, hairColor: i % 10, skin: i % 7, outfit: (i * 3) % 8, shape: CUTS[i % 5] }, h)) }, 7);
  await item('looks_cut_palette', 'Every clothing cut on one palette, then every clothing palette', { looks: CUTS.map((c) => L({ shape: c, outfit: 2 }, c)).concat([0, 1, 2, 3, 4, 5, 6, 7].map((o) => L({ outfit: o, shape: CUTS[o % 5], hair: HAIRS[o] }, 'palette ' + o))) }, 7);
  await item('looks_skin_haircolour', 'Every skin tone, then every hair colour', { looks: [0, 1, 2, 3, 4, 5, 6].map((k) => L({ skin: k, hair: 'bob', hairColor: 1 }, 'skin ' + k)).concat([0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((h) => L({ hairColor: h, hair: 'long', skin: 2 }, 'hair colour ' + h))) }, 9);
  const KEEP = [['rw_ribbon', 'ribbon', { ribbonCol: '#b98088' }], ['rw_catbell', 'bell', {}], ['sg_glass_earrings', 'earrings', { earCol: '#8fc6d8' }], ['co_straw_hat', 'hat', { hatCol: '#d6b25e' }], ['co_leaf_pin', 'leaf', { leafCol: '#c8452a' }], ['co_glass_beads', 'earrings', { earCol: '#e0781e' }], ['sb_scarf', 'scarf', { scarfCol: '#b8433a', scarfStripe: '#e9c648' }], ['lf_ferry_cap', 'cap', { capCol: '#2c4468' }], ['lq_tenugui', 'scarf', { scarfCol: '#9a5a32' }], ['atlas_cos_sash', 'atlas_sash', {}], ['atlas_cos_pin', 'atlas_pin', {}], ['atlas_cos_lamplet', 'atlas_lamplet', {}], ['atlas_cos_quill', 'atlas_quill', {}], ['atlas_cos_flower', 'flower', { flowerCol: '#9fb6ea' }], ['atlas_cos_cape', 'cape', { capeCol: '#51666e' }]];
  await item('looks_accessories', 'Every creation accessory (scarf, satchel, glasses, headband, flower, hat, earrings, cape), then every keepsake as worn', {
    looks: ['scarf', 'satchel', 'glasses', 'headband', 'flower', 'hat', 'earrings', 'cape'].map((a, i) => L({ acc: [a], hair: HAIRS[i], hairColor: (i * 3) % 10, outfit: i, shape: CUTS[i % 5] }, a))
      .concat(KEEP.map(([id, a, wear], i) => L(Object.assign({ acc: [a], hair: HAIRS[(i + 3) % 12], hairColor: (i * 7) % 10, outfit: (i + 2) % 8, shape: CUTS[i % 5] }, wear), id))),
  }, 8);
  console.log('   sheets: ' + report.sheets.map((s) => s.name + ' (' + s.frames + ')').join(', '));
});

await test('cadence: the ready idle\'s drawn frame changes a second, before and after (presentation clock, one loop)', async () => {
  const out = {};
  for (const build of ['base', 'new']) {
    const { p, ctx } = await page(b, build === 'base' ? BASE : url);
    out[build] = await p.evaluate((ROBIN) => {
      const C = RB.content.chars, res = {};
      for (const [id, look, who] of [['pc', ROBIN, 'pc'], ['nao', C.nao.look, 'comp'], ['mio', C.mio.look, 'comp'], ['ren', C.ren.look, 'comp'], ['suzu', C.suzu.look, 'comp']]) {
        const L = RB.battlerMoves._.loopOf(id, 'ready');
        let prevKey = null, prev = null, changes = 0, still = 0, longest = 0;
        const sig = new Map();
        for (let t = 0; t < L; t += 4) {
          const k = RB.battlerMoves.idleKey(id, 'ready', t, false);
          if (k === prevKey) { still += 4; continue; }
          prevKey = k;
          let s = sig.get(k);
          if (s == null) { const m = RB.battlers._.measure(look, { pose: 'ready', who, id, t }); let h = 0; for (let i = 0; i < m.data.length; i++) h = (h * 31 + m.data[i]) | 0; s = h; sig.set(k, s); }
          if (prev != null && s !== prev) { changes++; longest = Math.max(longest, still); still = 0; } else still += 4;
          prev = s;
        }
        res[id] = { loopMs: L, changesPerSec: +(changes / (L / 1000)).toFixed(2), longestStillMs: Math.max(longest, still), frames: new Set(sig.values()).size };
      }
      return res;
    }, ROBIN);
    await ctx.close();
  }
  report.cadence = out;
  for (const id in out.new) assert(out.new[id].changesPerSec >= 6 && out.new[id].changesPerSec <= 12, id + ': ' + JSON.stringify(out.new[id]));
  console.log('   ' + JSON.stringify(out));
});

// ---- in battle --------------------------------------------------------------------------------------------------
async function battleShot(build, vp, o) {
  const { p, ctx, errors } = await page(b, build === 'base' ? BASE : url, { viewport: vp });
  await p.evaluate((o) => {
    const s = RB.game.debugStart('rw.mill1', 7, 9, { comp: o.comp, flags: { rw_gears: true } });
    s.player.look = o.look; s.player.name = 'Robin';
    s.learn.kanaKnown = 'both';
    if (o.pet) { RB.pets.meet(s, o.pet); RB.pets.select(s, o.pet); }
    s.tips = { harmony: 1, harmonyFull: 1, cturn: 1, group: 1 };
    for (const k of ['strike', 'sweep', 'shroud', 'rest', 'heat', 'charge', 'lie', 'mirror', 'plea']) s.tips['intent:' + k] = 1;
    RB.game.settings.input = 'choice'; RB.game.applySettings();
    const place = RB.content.maps['rw.mill1'].foes.find((f) => f.id === 'm1a');
    RB.game.startBattle(place.enemy, { place, where: { map: 'rw.mill1', x: place.x, y: place.y }, foeKey: 'restyle', group: o.foes > 1 ? Array(o.foes - 1).fill(place.enemy) : undefined });
  }, Object.assign({ look: ROBIN }, o));
  for (let i = 0; i < 400; i++) {
    const s = await p.evaluate(() => ({ dlg: RB.ui.dialogue.isOpen(), cards: !!document.querySelector('.rcard[data-i]') && !RB.battleSeq.busy() }));
    if (s.cards) break;
    if (s.dlg) await p.evaluate(() => RB.ui.dialogue.advance(true));
    await wait(p, 40);
  }
  await p.mouse.move(1, 1);
  await wait(p, 600);
  const png = await p.screenshot();
  const lay = await p.evaluate(() => { const L = RB.battleStage.lay(), k = RB.battleStage.cssPerArt(); const F = L.F, A = L.AN; const box = (q) => q && { x: (q.x - A.x * L.ps) * k, y: (q.y - A.y * L.ps) * k, w: F.w * L.ps * k, h: F.h * L.ps * k }; return { pc: box(L.pc), comp: box(L.comp), cssPerArt: k }; });
  await ctx.close();
  assert(!errors.length, errors.join('; '));
  return { png, lay };
}
await test('battle: the party in the Mill at 1920×1080, 1280×800 and 390×844 (three creatures and a cat) — before and after', async () => {
  const pg = await b.newPage();
  for (const [w, h, o, name] of [[1920, 1080, { comp: 'mio', foes: 1 }, 'battle_1920x1080'], [1280, 800, { comp: 'mio', foes: 1 }, 'battle_1280x800'], [390, 844, { comp: 'mio', foes: 3, pet: 'cat' }, 'battle_390x844_three_cat']]) {
    const A = await battleShot('new', { width: w, height: h }, o), B0 = await battleShot('base', { width: w, height: h }, o);
    // the whole view (after), and the party region before | after at 2× the screen (a close look)
    const out = await pg.evaluate(async ({ a, bb, lay }) => {
      const load = (u) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = u; });
      const ia = await load('data:image/png;base64,' + a), ib = await load('data:image/png;base64,' + bb);
      const full = document.createElement('canvas'); full.width = ia.width; full.height = ia.height; full.getContext('2d').drawImage(ia, 0, 0);
      const x0 = Math.max(0, Math.floor(Math.min(lay.comp.x, lay.pc.x) - 12)), y0 = Math.max(0, Math.floor(Math.min(lay.comp.y, lay.pc.y) - 8));
      const x1 = Math.min(ia.width, Math.ceil(Math.max(lay.comp.x + lay.comp.w, lay.pc.x + lay.pc.w) + 12)), y1 = Math.min(ia.height, Math.ceil(Math.max(lay.comp.y + lay.comp.h, lay.pc.y + lay.pc.h) + 8));
      const cw = x1 - x0, chh = y1 - y0, z = Math.max(1, Math.min(4, Math.floor(900 / cw)));
      const cmp = document.createElement('canvas'); cmp.width = cw * z * 2 + 18; cmp.height = chh * z + 30;
      const g = cmp.getContext('2d'); g.imageSmoothingEnabled = false; g.fillStyle = '#2a2420'; g.fillRect(0, 0, cmp.width, cmp.height);
      g.drawImage(ib, x0, y0, cw, chh, 6, 24, cw * z, chh * z); g.drawImage(ia, x0, y0, cw, chh, cw * z + 12, 24, cw * z, chh * z);
      g.fillStyle = '#f2e8d2'; g.font = '600 13px system-ui, sans-serif'; g.fillText('before', 8, 16); g.fillText('after', cw * z + 14, 16);
      return { full: full.toDataURL('image/webp', 0.9), cmp: cmp.toDataURL('image/webp', 0.92) };
    }, { a: A.png.toString('base64'), bb: B0.png.toString('base64'), lay: A.lay });
    save(name, out.full, 'webp');
    save(name + '_party_before_after', out.cmp, 'webp');
  }
  await pg.close();
});

// ---- the recording ----------------------------------------------------------------------------------------------
await test('clip: a real-time Normal recording — the ready idle, the player\'s Unravel, Mio\'s warm draught (DIAGNOSTIC FIXTURE: every support action unlocked)', async () => {
  const dir = path.join(outDir, 'raw-video');
  fs.mkdirSync(dir, { recursive: true });
  const c2 = await b.newContext({ viewport: { width: 1280, height: 720 }, recordVideo: { dir, size: { width: 1280, height: 720 } } });
  const p = await c2.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(e.message));
  await p.goto(url);
  await p.waitForFunction(() => window.__RB_READY__ === true);
  await p.evaluate((look) => {
    const run = RB.challenge.runStep;
    RB.challenge.runStep = (step, o) => { window.__step = step; return run(step, o); };
    const flags = { ch2_done: true, lq_ally1: true, lq_ally2: true, rw_mill_open: true };
    const s = RB.game.debugStart('rw.millroad', 10, 22, { comp: 'mio', flags });
    for (const q of ['lf_nao', 'lf_mio', 'ren_ushio', 'co_suzu']) s.quests[q] = { stage: 9, done: true };
    s.player.look = look; s.player.name = 'Robin';
    s.learn.kanaKnown = 'both'; s.learn.profile = 'E';
    s.words = ['mamoru', 'iyasu', 'hikari', 'mizu'];
    s.tips = Object.assign({ harmony: 1, harmonyFull: 1, cturn: 1 }, ...['strike', 'sweep', 'rest', 'heat', 'shroud', 'charge', 'gust', 'mend', 'lie', 'plea', 'flood', 'chill', 'silence', 'mirror'].map((k) => ({ ['intent:' + k]: 1 })), ...s.words.map((w) => ({ ['word:' + w]: 1 })), ...Object.values(RB.content.companionActions).flat().map((a) => ({ ['cact:' + a.id]: 1 })));
    RB.game.settings.input = 'choice'; RB.game.settings.textSpeed = 'normal'; RB.game.applySettings();
    window.__result = null;
    const place = RB.content.maps['rw.millroad'].foes.find((f) => f.enemy === 'rw.dustmoth');
    RB.game.startBattle('rw.dustmoth', place ? { place, where: { map: 'rw.millroad', x: place.x, y: place.y } } : {}).then((r) => { window.__result = r || 'done'; });
  }, ROBIN);
  for (let i = 0; i < 400; i++) {
    const st = await p.evaluate(() => ({ dlg: RB.ui.dialogue.isOpen(), cards: !!document.querySelector('.rcard[data-i]') && !document.querySelector('.chal') && !RB.battleSeq.busy() }));
    if (st.cards) break;
    if (st.dlg) await p.evaluate(() => RB.ui.dialogue.advance(true));
    await wait(p, 50);
  }
  await p.mouse.move(2, 2);
  await wait(p, 2600); // the ready idle, at its own cadence
  const card = await p.evaluate(() => { const c = [...document.querySelectorAll('.rcard')].find((x) => !x.disabled && /unravel/i.test(x.textContent)); if (!c) return null; c.scrollIntoView({ block: 'nearest' }); const r = c.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  assert(card, 'the Unravel card');
  await p.mouse.click(card.x, card.y);
  await p.waitForSelector('.chal .mc .btn, .chal [data-a=reveal]');
  if (await p.$('.chal .mc .btn')) {
    const r = await p.evaluate(() => {
      const st = window.__step, bs = [...document.querySelectorAll('.chal .mc .btn')];
      const txt = (h) => { const d = document.createElement('div'); d.innerHTML = h; return d.textContent.replace(/\s+/g, ' ').trim(); };
      const html = (o) => o.text != null ? RB.ui.jhtml(o.text) : (o.jp ? RB.ui.jhtml(o.jp) : '') + (o.en ? '<span class="enline">' + RB.util.esc(o.en) + '</span>' : '');
      const right = RB.challenge.choicesFor(st).filter((o) => o.ok).map((o) => txt(html(o)));
      const q = bs.find((x) => right.includes(x.textContent.replace(/\s+/g, ' ').trim())).getBoundingClientRect();
      return { x: q.left + q.width / 2, y: q.top + q.height / 2 };
    });
    await p.mouse.click(r.x, r.y);
  } else await p.click('.chal [data-a=reveal]');
  await p.waitForSelector('.fbwrap .fb-go');
  await p.mouse.move(2, 2);
  await p.click('.fbwrap .fb-go');
  const act = await companionTurn(p, { match: 'Warm draught' });
  for (let i = 0; i < 600; i++) {
    const s = await p.evaluate(() => ({ busy: RB.battleSeq.busy(), cards: !!document.querySelector('.rcard[data-i]') && !document.querySelector('.chal'), mode: RB.game.mode(), res: window.__result }));
    if (!s.busy && (s.cards || s.mode !== 'combat' || s.res)) break;
    await wait(p, 40);
  }
  await wait(p, 1500);
  const tr = await p.evaluate(() => RB.combat.debug().trace);
  const video = p.video();
  await c2.close();
  const dst = path.join(outDir, 'unravel_and_draught_normal.webm');
  fs.copyFileSync(await video.path(), dst);
  if (toDocs) fs.copyFileSync(dst, path.join(docsDir, 'unravel_and_draught_normal.webm'));
  const P = tr.filter((r) => r.kind === 'player').slice(-1)[0], C = tr.filter((r) => r.kind === 'companion').slice(-1)[0];
  report.clip = { bytes: fs.statSync(dst).size, companion: act, playerMs: P && P.dur, companionMs: C && C.dur };
  assert(P && C && C.meta && C.meta.act === 'mio_draught', 'the response and Mio\'s draught both played ' + JSON.stringify(report.clip));
  assert(!errors.length, errors.join('; '));
  console.log('   ' + JSON.stringify(report.clip));
});

fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 1));
console.log(`\n${pass} passed, ${fail} failed`);
await b.close();
srv.close();
process.exit(fail ? 1 : 0);
