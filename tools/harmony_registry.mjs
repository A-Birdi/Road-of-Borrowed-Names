// Exports the registry the painted Harmony busts are checked against (docs/harmony/contract/CONTRACT.md):
// everything the game knows about appearance, read from the BUILT index.html in a browser (like
// tests/e2e/harmony_asset_refs.mjs), plus the contract (src/ui/88_harmony_contract.js), the asset keys
// it implies and the delivery batches. Writes docs/harmony/contract/registry.json with sorted keys (deterministic for a given build).
//   node tools/build.mjs && node tools/harmony_registry.mjs [--out path]
// Anything that cannot be read from the game is written as { unresolved: true, reason } — never guessed.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { serve, launch, page, root } from '../tests/e2e/lib.mjs';

const args = process.argv.slice(2);
const outAt = args.indexOf('--out');
const OUT = outAt >= 0 ? path.resolve(args[outAt + 1]) : path.join(root, 'docs/harmony/contract/registry.json');

// ---- source identity (node side) ----------------------------------------------------------------------
const git = (...a) => { try { return execFileSync('git', a, { cwd: root, encoding: 'utf8' }).trim(); } catch (e) { return null; } };
const indexHtml = fs.readFileSync(path.join(root, 'index.html'));
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
// the creation screen's cuts and accessory limit live in a closure (src/ui/40_create.js): read from the source
const createSrc = fs.readFileSync(path.join(root, 'src/ui/40_create.js'), 'utf8');
const cutsM = /const SHAPES = (\[\[.*?\]\]);/.exec(createSrc), maxM = /const MAX_ACC = (\d+);/.exec(createSrc);
const creationCuts = cutsM ? JSON.parse(cutsM[1].replace(/'/g, '"')).map((p) => ({ id: p[0], label: p[1] })) : { unresolved: true, reason: 'SHAPES not found in src/ui/40_create.js' };
const maxAcc = maxM ? +maxM[1] : { unresolved: true, reason: 'MAX_ACC not found in src/ui/40_create.js' };

const { srv, url } = await serve();
const browser = await launch();
const { p, errors } = await page(browser, url, { viewport: { width: 1280, height: 800 } });

const reg = await p.evaluate(({ creationCuts, maxAcc }) => {
  const SP = RB.sprites, HK = RB.harmonyKit, HC = RB.harmonyContract, HA = RB.harmonyArt, EQ = RB.equip, items = RB.content.items;
  const U = (reason) => ({ unresolved: true, reason });
  const cuts = Array.isArray(creationCuts) ? creationCuts.map((c) => c.id) : [];
  const shapes = cuts.concat(RB.harmonyArtFixtures.SHAPES.filter((s) => cuts.indexOf(s) < 0));

  // ---- how the code busts draw each accessory: the layers it changes and the side, from a pixel diff ----
  // (the code busts face screen right, so screen left is the character's right; contract v2's player faces
  // screen left, so there the character's left is screen right, the near side)
  const base = { skin: 2, hair: 'short', hairColor: 2, outfit: 0, shape: 'tunic', acc: [] };
  const stackOf = (look) => HK.drawBust('pc', look, 'rally', 'hold', 'standard', { keepLayers: true });
  const plain = stackOf(base);
  function drawnHow(look) {
    const b = stackOf(look);
    const layers = {}, hx = b.head.x;
    for (const [name, L] of b.stack.layers) {
      const P0 = plain.stack.layers.get(name);
      let add = 0, removed = 0, left = 0, right = 0;
      for (let i = 0; i < L.px.length; i++) {
        const a = L.px[i], o = P0 ? P0.px[i] : 0;
        if (a === o) continue;
        if (a >>> 24) { add++; if (i % L.w < hx) left++; else right++; } else removed++;
      }
      if (add || removed) layers[name] = { added: add, removed, screenLeft: left, screenRight: right };
    }
    let L = 0, R = 0;
    for (const k in layers) if (layers[k].added) { L += layers[k].screenLeft; R += layers[k].screenRight; }
    const charSide = !L && !R ? null : L > 3 * R ? 'right' : R > 3 * L ? 'left' : 'both';
    return { layers, codeView: { screenLeft: L, screenRight: R }, characterSide: charSide, v2PlayerScreenSide: charSide === 'left' ? 'right (near)' : charSide === 'right' ? 'left (far)' : charSide };
  }
  function accEntry(a, look) {
    const d = HC.ACC[a];
    const ns = HC.NOT_SHOWN[a] || (HK.ACC_NOT_SHOWN && HK.ACC_NOT_SHOWN[a]);
    const how = drawnHow(look);
    const drawnByCode = Object.keys(how.layers).some((k) => how.layers[k].added);
    const e = { codeBust: Object.assign({ drawn: drawnByCode }, how) };
    if (d) {
      const fl = HC.accFiles(look).files.filter((f) => f.acc === a);
      Object.assign(e, { visibleInBust: true, files: fl.map((f) => ({ file: f.file, slot: f.slot })), hairMounted: !!d.hair, hidesHairAboveBand: !!d.hides, channel: d.channel ? Object.assign({ material: 'accessory' }, d.channel) : null });
    } else e.visibleInBust = false;
    e.reason = d ? null : ns || 'not listed in the contract';
    return e;
  }

  // ---- keepsakes and statistical items ------------------------------------------------------------------
  const keepsakes = {}, statistical = {};
  for (const id of Object.keys(items).sort()) {
    const it = items[id];
    if (!it || !it.slot) continue;
    if (it.slot === 'cosmetic') {
      const look = EQ.lookWith(base, id);
      const e = { id, name: it.name && it.name.en, slot: it.slot, acc: it.acc || null, wear: it.wear || null };
      Object.assign(e, it.acc ? accEntry(it.acc, look) : { visibleInBust: false, reason: 'no acc: nothing drawn' });
      // same-place replacement (a cap replaces a hat, …): what of the base look it would take off
      e.replaces = (EQ.SAME_PLACE[it.acc] || [it.acc]).slice();
      keepsakes[id] = e;
    } else if (it.slot === 'charm' || it.slot === 'tool') {
      statistical[id] = { id, name: it.name && it.name.en, slot: it.slot, acc: it.acc || null, effect: it.effect ? Object.keys(it.effect).sort() : [], drawn: false, reason: 'the ' + it.slot + ' slot is not part of the worn look: RB.equip.look applies only the cosmetic slot' + (it.acc ? ' (its acc is ignored)' : '') };
    }
  }
  const creationAcc = {};
  for (const a of SP.ACCESSORIES) creationAcc[a] = Object.assign({ id: a }, accEntry(a, Object.assign({}, base, { acc: [a] })));

  // ---- palettes and material channels ---------------------------------------------------------------------
  const palettes = {
    skin: SP.SKIN.map((p, i) => ({ id: i, light: p[0], shadow: p[1] })),
    hair: SP.HAIR.map((p, i) => ({ id: i, name: SP.HAIR_NAMES[i], dark: p[0], mid: p[1], light: p[2] })),
    cloth: SP.CLOTH.map((p, i) => ({ id: i, main: p[0], shade: p[1], trim: p[2] })),
  };
  const channels = {
    skin: { lookFields: ['skin'], resolve: 'RB.sprites.colorsOf(look).skin (an index into SKIN, or an explicit [light, shadow] pair)', ramp: 'RB.harmonyKit.skinMat(pair) — 6 tones', pick: HC.PICK.skin },
    hair: { lookFields: ['hairColor'], resolve: 'colorsOf(look).hair (an index into HAIR, or an explicit [dark, mid, light])', ramp: 'RB.harmonyKit.hairMat(hair) — 6 tones round the mid colour', pick: HC.PICK.n6 },
    clothMain: { lookFields: ['outfit', 'cloth'], resolve: 'colorsOf(look).cloth[0] (look.cloth, else CLOTH[outfit])', ramp: 'RB.harmonyKit.clothMat(cloth[0]) — 6 tones', pick: HC.PICK.n6 },
    clothTrim: { lookFields: ['outfit', 'cloth', 'wrapCol (pc_hair_wrap_* only)'], resolve: 'colorsOf(look).cloth[2]; the wrap hairstyle uses look.wrapCol || cloth[2]', ramp: 'clothMat(cloth[2], { step: 0.09 }); the wrap: clothMat(wrapCol || cloth[2])', pick: HC.PICK.n6 },
    accessory: { lookFields: Object.keys(HC.ACC).filter((a) => HC.ACC[a].channel).map((a) => HC.ACC[a].channel.field + ' (' + a + ')'), resolve: 'per accessory file: look[field], else the default (cloth.2 = the cloth trim; metal = the gold metal ramp)', ramp: 'RB.harmonyKit.M(name, colour, opts) with the opts below (as 88_harmony_acc.js draws it)', pick: 'n6 for 6-tone opts, n5 for 5-tone', perAccessory: Object.fromEntries(Object.keys(HC.ACC).map((a) => [a, HC.ACC[a].channel])) },
    keyFamilies: { note: 'contract v3: each recolourable material is painted in its key family — the five anchor shades of KEY_RAMPS (contract.keyRamps) with any number of values between and a little beyond them; the game maps each painted value onto the ramp above (key shade s at the tone pick[s]) and keeps its hue and chroma deviation', anchors: HC.KEY_RAMPS, thresholds: HC.IMPORT, recolour: HC.RECOLOUR },
    fixed: { note: 'never recoloured: eye whites, irises, outlines (#140c18 family), glasses, highlights, metal, leather, glass, and every companion pixel' },
    playerIris: { value: '#7a4630', note: 'the code busts give every player this iris (RB.harmonyKit.faceColours default); it is not a look field' },
  };

  // ---- companions ----------------------------------------------------------------------------------------------
  const companions = {};
  for (const id of HA.COMPANIONS) {
    const ch = RB.content.chars[id];
    const T = RB.combat && RB.combat.TECHS ? RB.combat.TECHS[id] : null;
    companions[id] = { id, name: ch.name.en, role: ch.role && ch.role.en, look: ch.look, portrait: ch.portrait, codePose: HA.POSE_OF[id], technique: T ? { id, name: T.name, knots: T.knots } : U('RB.combat.TECHS not found'), recolour: false };
  }

  // ---- the contract and its asset keys ----------------------------------------------------------------------------
  const visibleAcc = Object.keys(HC.ACC).filter((a) => SP.ACCESSORIES.indexOf(a) >= 0 || Object.values(keepsakes).some((k) => k.acc === a && k.visibleInBust));
  const keys = HC.assetKeys({ companions: HA.COMPANIONS, hairstyles: SP.HAIRSTYLES, shapes, accessories: visibleAcc });
  return {
    contractVersion: HC.VERSION,
    artVersion: HA.ART_VERSION,
    resolver: {
      look: 'RB.equip.look(s) = RB.equip.lookWith(s.player.look, s.equip.cosmetic)',
      lookWith: 'copies the base look, drops the accessories in the same place (SAME_PLACE[it.acc] or [it.acc]), appends it.acc last, then Object.assign(out, it.wear)',
      samePlace: EQ.SAME_PLACE, source: { look: EQ.look.toString(), lookWith: EQ.lookWith.toString() }, module: 'src/engine/07_equip.js',
    },
    hairstyles: { ids: SP.HAIRSTYLES.slice(), aliases: {}, fallback: { value: 'short', note: 'an unknown style draws as short (src/engine/32h_spritehair.js, src/ui/88_harmony_hair.js hairPart)' }, wrap: 'a cloth head wrap in the clothTrim channel (look.wrapCol || cloth[2])', frontOnly: HC.FRONT_ONLY },
    garmentShapes: { creationCuts, battleOnly: ['dress'], companionOnly: { high: 'Ren\'s high collar (portrait.collar), drawn over their coat: their frames are painted, not a kit option' }, all: shapes, sleeveOf: HC.SLEEVE_OF },
    creationAccessories: { ids: SP.ACCESSORIES.slice(), maxChosen: maxAcc, entries: creationAcc },
    keepsakes,
    statisticalItems: statistical,
    palettes,
    materialChannels: channels,
    companions,
    contract: HC.describe(),
    assetKeys: keys,
    // contract v3: the delivery batches (every file is an asset key, effects aside) and the approval states
    batches: Object.fromEntries(Object.entries(HC.BATCHES).map(([id, b]) => [id, Object.assign({}, b, { notAssetKeys: b.required.concat(b.optional).filter((n) => keys.required.indexOf(n) < 0 && keys.optional.indexOf(n) < 0) })])),
    approval: { states: HC.APPROVAL, labels: HC.APPROVAL_LABEL, codeBusts: 'provisional', synthetic: 'synthetic', where: 'manifest companions.<id>.approval and pc.approval, from the batch import.json; RB.harmonyArt.stats().approval; the ?dev=harmony viewer' },
    unresolved: {
      hairAttachOffsets: U('per-hairstyle offsets for hair-mounted accessories depend on the painted hair volumes: set at import (manifest pc.attach)'),
      hatBandLine: U('the y of the hat and cap band depends on the painted hats: set at import (manifest pc.hatBand)'),
      pairOffsets: U('per-companion pair offsets default to 0 and are set after the art is seen (manifest companions.<id>.offset)'),
    },
  };
}, { creationCuts, maxAcc });

const out = {
  source: {
    generator: 'tools/harmony_registry.mjs',
    git: { commit: git('rev-parse', 'HEAD'), branch: git('rev-parse', '--abbrev-ref', 'HEAD'), dirty: !!git('status', '--porcelain', '--', 'src', 'tools/build.mjs') },
    indexHtml: { sha256: sha(indexHtml), bytes: indexHtml.length },
    contractModule: 'src/ui/88_harmony_contract.js', renderer: ['src/ui/88_harmony_art.js', 'src/ui/88_harmony_raster.js', 'src/ui/88_harmony_cast.js', 'src/ui/88_harmony_acc.js'],
    note: 'git.commit is HEAD when exported; the export is committed with or after it. indexHtml is the build it was read from.',
  },
  ...reg,
};
// deterministic: sorted object keys at every level (arrays keep their order)
const sortKeys = (v) => (Array.isArray(v) ? v.map(sortKeys) : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, sortKeys(v[k])])) : v);
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(sortKeys(out), null, 1) + '\n');
const nk = Object.keys(reg.keepsakes).length, ns = Object.keys(reg.statisticalItems).length;
console.log('wrote', path.relative(root, OUT), '—', nk, 'keepsakes,', ns, 'statistical items,', reg.assetKeys.required.length, 'required +', reg.assetKeys.optional.length, 'optional asset keys');
if (errors.length) { console.log('page errors:\n' + errors.join('\n')); process.exitCode = 1; }
await browser.close(); srv.close();
